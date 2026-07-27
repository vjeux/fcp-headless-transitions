// PCTimecode.ts — ProCore's PCTimecode: HH:MM:SS:FF timecode <-> integer frame-index math,
// with SMPTE drop-frame support. Transcribed from FCP's ProCore binary at addresses
// 0x1f4a8..0x1f7fd. See raw-port/re/disasm/ProCore.PCTimecode.{getTimecode,getDroppedFrames,
// getTimeIndex,getSeparators}.s for the ground-truth assembly.
//
// Every function below cites its @0xADDR; every numeric constant cites the address it was read
// from (RIP literal pool at ProCore 0x1120..0x113X for the format strings and separator set,
// static separators pointer at 0x1492f0 -> cstring 0x13193b ":;.,-/"). External libc callees
// (_strdup/_strsep/_atoi/_free) are called via their JS equivalents.
//
// ── PCTimecodeMode struct layout (recovered from the field reads in these four functions)
// The offsets and their roles were reverse-engineered from the exact int accesses in
// getTimecode (0x1f4c6..0x1f507) and getDroppedFrames (0x1f5c8..0x1f5ea) and getTimeIndex
// (0x1f6d2..0x1f78b):
//
//   +0x08 fps                : int32  // integer nominal frames per second, e.g. 24, 25, 30, 60, 120.
//                                     // Format switch at fps>=100 picks %03d for the FF field.
//   +0x0c framesToDrop       : int32  // drop-frame frames dropped per shortCycle (2 for NTSC 30/1.001,
//                                     // 4 for 60/1.001). 0 = non-drop-frame mode.
//   +0x10 secondsPerCycle    : int32  // period (in whole seconds) at which the drop happens
//                                     // (60 for NTSC — every minute).
//   +0x14 secondsPerBigCycle : int32  // period at which the drop is *skipped* (600 for NTSC —
//                                     // every 10th minute has no drop). secondsPerBigCycle /
//                                     // secondsPerCycle = "shortCyclesPerBigCycle" (10 for NTSC).
//
// Concrete NTSC 29.97 mode: {fps=30, framesToDrop=2, secondsPerCycle=60, secondsPerBigCycle=600}.
// Non-drop 30fps mode:        {fps=30, framesToDrop=0, secondsPerCycle=*, secondsPerBigCycle=*}.
export interface PCTimecodeMode {
  fps: number;                // +0x08 int32
  framesToDrop: number;       // +0x0c int32  (0 = non-drop-frame)
  secondsPerCycle: number;    // +0x10 int32
  secondsPerBigCycle: number; // +0x14 int32
}

// ── Separator set used by getTimeIndex / getSeparators.
// The 6-char cstring ":;.,-/" lives at ProCore address 0x13193b (see `resolve.py ProCore const
// 0x13193b` -> those bytes). It is referenced twice: (1) as the strsep(3) delimiter set in
// getTimeIndex at RIP literal 0x1122d7 and 0x1122b7, and (2) as the target of the static pointer
// at 0x1492f0 that getSeparators returns.
// @const ProCore 0x13193b  cstring ":;.,-/"
const kPCTimecodeSeparators = ":;.,-/";

// ── PCTimecode::getTimecode(int const& frame, PCTimecodeMode const& mode, PCString& out)
// @0x1f4a8 ProCore   __ZN10PCTimecode11getTimecodeERKiRK14PCTimecodeModeR8PCString
// Formats a signed integer frame count as an SMPTE timecode string HH:MM:SS[:;]FF, applying
// drop-frame renumbering when mode.framesToDrop != 0. Separator between SS and FF is ';' for
// drop-frame, ':' for non-drop-frame. When mode.fps >= 100 the frame field is 3-digit (%03d)
// instead of 2-digit (%02d). Returns the string via the PCString& out parameter (in this port
// we just return a string).
//
// Format strings (RIP literal pool):
//   @const ProCore 0x11290e ("%s%02d%c%02d%c%02d%c%03d")  — chosen when fps >= 100 (0x1f590)
//   @const ProCore 0x112922 ("%s%02d%c%02d%c%02d%c%02d")  — chosen when fps  < 100 (0x1f597)
// External callee (varargs formatter):
//   @0x??? ProCore  PCString::sprintf(char const*, ...)  __ZN8PCString7sprintfEPKcz
// PC-side we implement the format ourselves; the exact call is documented in the doc-comment
// but reproducing sprintf's formatter is a decoded transcription of the format string above.
export function PCTimecode_getTimecode(
  frame: number,
  mode: PCTimecodeMode,
): string {
  // -0xa(%rbp) starts as '\0'; set to '-' if the input is negative, then |frame| is used.
  //   @0x1f4b1  movl (%rdi), %r10d
  //   @0x1f4b4  movw $0x0, -0xa(%rbp)
  //   @0x1f4ba  testl %r10d, %r10d; jns 0x1f4c6   (skip if non-negative)
  //   @0x1f4bf  movb $0x2d, -0xa(%rbp)             ('-' = 0x2d)
  //   @0x1f4c3  negl %r10d
  let r10 = frame | 0;
  let signStr = "";
  if (r10 < 0) {
    signStr = "-";
    r10 = (-r10) | 0;
  }

  //   @0x1f4c6  movl 0x8(%rsi), %edi    ; fps
  //   @0x1f4c9  movl 0xc(%rsi), %r9d    ; framesToDrop
  const fps = mode.fps | 0;
  const drop = mode.framesToDrop | 0;

  //   @0x1f4cd  testl %r9d, %r9d; je 0x1f515   (skip drop-frame renumbering if drop==0)
  let sepFF: number;  // separator char between SS and FF: ';' (drop) or ':' (non-drop)
  if (drop !== 0) {
    //   @0x1f4d2  movl 0x10(%rsi), %r11d          ; secondsPerCycle
    //   @0x1f4d6  movl 0x14(%rsi), %eax           ; secondsPerBigCycle
    //   @0x1f4d9  cltd; idivl %r11d               ; A = secondsPerBigCycle / secondsPerCycle
    //   @0x1f4dd  movl %eax, %ecx                 ; ecx = A
    const secPerCycle = mode.secondsPerCycle | 0;
    const secPerBig = mode.secondsPerBigCycle | 0;
    const A = (secPerBig / secPerCycle) | 0;  // signed 32-bit truncating divide
    let ecx = A | 0;

    //   @0x1f4df  imull %edi, %r11d               ; r11d = fps * secondsPerCycle
    //   @0x1f4e3  subl %r9d, %r11d                ; B = fps*secondsPerCycle - drop  (=frames per short cycle in drop-mode)
    const B = Math.imul(fps, secPerCycle) - drop | 0;

    //   @0x1f4e6  movl %r11d, %esi
    //   @0x1f4e9  imull %eax, %esi                ; esi = B * A
    //   @0x1f4ec  addl %r9d, %esi                 ; C = B*A + drop  (=frames per big cycle in drop-mode)
    const C = Math.imul(B, A) + drop | 0;

    //   @0x1f4ef  movl %r10d, %eax; cltd; idivl %esi
    //   @0x1f4f5  movl %eax, %esi                 ; esi = bigCycles  = r10 / C
    //   @0x1f4f7  movl %edx, %eax                 ; eax = r10 % C  (remainder within big cycle)
    const bigCycles = ((r10 / C) | 0);
    let rem = (r10 - Math.imul(bigCycles, C)) | 0;

    //   @0x1f4f9  subl %r9d, %eax                 ; eax = rem - drop
    //   @0x1f4fc  cltd; idivl %r11d               ; eax = (rem-drop)/B, edx = (rem-drop)%B
    //   @0x1f4f5  (esi from above still holds bigCycles)
    const smallCycles = (((rem - drop) | 0) / B) | 0;

    //   @0x1f500  decl %ecx                       ; ecx = A - 1
    //   @0x1f502  imull %esi, %ecx                ; ecx = (A-1) * bigCycles
    //   @0x1f505  addl %eax, %ecx                 ; ecx += smallCycles
    //   @0x1f507  imull %r9d, %ecx                ; ecx *= drop  (total dropped frames to inject)
    //   @0x1f50b  addl %ecx, %r10d                ; r10 += dropped-frame injection
    ecx = (A - 1) | 0;
    ecx = Math.imul(ecx, bigCycles) | 0;
    ecx = (ecx + smallCycles) | 0;
    ecx = Math.imul(ecx, drop) | 0;
    r10 = (r10 + ecx) | 0;

    //   @0x1f50e  movl $0x3b, %ebx                (';' = 0x3b — drop-frame separator)
    //   @0x1f513  jmp 0x1f51a
    sepFF = 0x3b;
  } else {
    //   @0x1f515  movl $0x3a, %ebx                (':' = 0x3a — non-drop separator)
    sepFF = 0x3a;
  }

  //   @0x1f51a  testl %edi, %edi; je 0x1f585     (if fps==0, HH=MM=SS=FF=0)
  let HH = 0, MM = 0, SS = 0, FF = 0;
  if (fps !== 0) {
    //   @0x1f51e  movl %r10d, %eax; cltd; idivl %edi
    //   @0x1f524  movslq %eax, %rcx               ; rcx = totalSeconds
    //                                             ; edx = frames-in-current-second  (kept in edx)
    const totalSeconds = ((r10 / fps) | 0);
    const framesRemainderAfterSec = (r10 - Math.imul(totalSeconds, fps)) | 0;

    //   @0x1f527..0x1f53c  hours = totalSeconds / 3600  (compiler magic:
    //     imulq $-0x6e5d4c3b (=0x91A2B3C5 unsigned), shrq $0x20, addl, shrl $0x1f, sarl $0xb, addl).
    //   This is the standard signed-divide-by-3600 pattern; result is HH.
    const hours = (totalSeconds / 3600) | 0;

    //   @0x1f53e  movl %edi, %eax; imull %ecx, %eax     ; eax = fps * hours
    //   @0x1f543  imull $0xfffff1f0, %eax, %esi         ; esi = -3600 * (fps*hours) = -(fps*3600*hours)
    //   @0x1f549  addl %r10d, %esi                       ; esi = r10 - fps*3600*hours  (frames in current hour)
    let esi = (r10 - Math.imul(Math.imul(fps, hours), 3600)) | 0;

    //   @0x1f54c  movl %esi, %eax; cltd; idivl %edi
    //   @0x1f551  movslq %eax, %r9                       ; r9 = secondsInHour
    const secondsInHour = ((esi / fps) | 0);

    //   @0x1f554..0x1f56c  minutes = secondsInHour / 60  (compiler magic for signed /60:
    //     imulq $-0x77777777 (=0x88888889 unsigned), shrq $0x20, addl, shrl $0x1f, sarl $0x5, addl).
    const minutes = (secondsInHour / 60) | 0;

    //   @0x1f56f  movl %edi, %eax; imull %r9d, %eax     ; eax = fps * minutes
    //   @0x1f575  imull $-0x3c, %eax, %eax               ; eax = -60 * fps * minutes
    //   @0x1f578  addl %esi, %eax                        ; eax = esi + (-60*fps*minutes) = frames-in-current-minute
    //   @0x1f57a  cltd; idivl %edi                       ; eax = secondsInMinute, edx = framesInSecond
    //   @0x1f57d  movl %eax, %r11d                       ; SS
    //   @0x1f580  movl %edx, %r10d                       ; FF
    const framesInMinute = (esi - Math.imul(Math.imul(60, fps), minutes)) | 0;
    const secondsInMinute = ((framesInMinute / fps) | 0);
    const framesInSecond = (framesInMinute - Math.imul(secondsInMinute, fps)) | 0;

    HH = hours | 0;
    MM = minutes | 0;
    SS = secondsInMinute | 0;
    FF = framesInSecond | 0;

    // (The `framesRemainderAfterSec` computed above is edx from f4f3-style calc; the disasm keeps
    // it live through the branch but only re-derives FF via the second idivl at f57b. We reproduce
    // that second derivation as the canonical value; the first is not used in the final output.)
    void framesRemainderAfterSec;
  } else {
    //   @0x1f585  xorl %r11d, %r11d; xorl %ecx, %ecx; xorl %r9d, %r9d
    HH = 0; MM = 0; SS = 0; FF = 0;
  }

  //   @0x1f58d  cmpl $0x64, %edi                     ; fps >= 100?
  //   @0x1f590  leaq  0x112372(%rip), %rax           ; "%s%02d%c%02d%c%02d%c%03d"  (3-digit FF)
  //   @0x1f597  leaq  0x112384(%rip), %rsi           ; "%s%02d%c%02d%c%02d%c%02d"  (2-digit FF)
  //   @0x1f59e  cmovgeq %rax, %rsi                   ; use %03d format iff fps >= 100
  //   @0x1f5a2..0x1f5b6  set up PCString::sprintf(out, fmt, signStr, HH, ':', MM, ':', SS, sepFF, FF)
  //     with the trailing 4 stack args (':', SS, sepFF, FF) pushed as ':', SS, sepFF, FF.
  //   @0x1f5b8  callq __ZN8PCString7sprintfEPKcz     ; PCString::sprintf(char const*, ...)
  const ffField = (fps >= 100)
    ? String(FF).padStart(3, "0")
    : String(FF).padStart(2, "0");
  const hh2 = String(HH).padStart(2, "0");
  const mm2 = String(MM).padStart(2, "0");
  const ss2 = String(SS).padStart(2, "0");
  return `${signStr}${hh2}:${mm2}:${ss2}${String.fromCharCode(sepFF)}${ffField}`;
}

// ── PCTimecode::getDroppedFrames(int const& frame, PCTimecodeMode const& mode)
// @0x1f5c4 ProCore   __ZN10PCTimecode16getDroppedFramesERKiRK14PCTimecodeMode
// Returns the number of drop-frame frames that have been "dropped" up to (and including through)
// the raw frame index `frame` under the given mode. This is the drop-injection quantity the outer
// loop of getTimecode adds to `frame` — pulled out as a public accessor. Callers use it to answer
// "how many timecode frames were skipped by SMPTE drop-frame renumbering by this point?".
//
// The math mirrors the drop-frame section of getTimecode exactly (0x1f4d2..0x1f50b) but returns
// just the drop count (without adding it back to the frame) and multiplies by drop at the end.
export function PCTimecode_getDroppedFrames(
  frame: number,
  mode: PCTimecodeMode,
): number {
  //   @0x1f5c8  movl 0xc(%rsi), %r8d                ; r8d = drop = mode.framesToDrop
  //   @0x1f5cc  movl 0x10(%rsi), %r9d               ; r9d = secondsPerCycle (temp — reused as B below)
  //   @0x1f5d0  movl 0x14(%rsi), %eax
  //   @0x1f5d3  cltd; idivl %r9d                    ; eax = A = secondsPerBigCycle / secondsPerCycle
  //   @0x1f5d7  movl %eax, %ecx                     ; ecx = A
  const drop = mode.framesToDrop | 0;
  let r9 = mode.secondsPerCycle | 0;
  const A = ((mode.secondsPerBigCycle | 0) / r9) | 0;
  let ecx = A | 0;

  //   @0x1f5d9  imull 0x8(%rsi), %r9d               ; r9d = fps * secondsPerCycle
  //   @0x1f5de  subl %r8d, %r9d                     ; r9d = B = fps*secondsPerCycle - drop
  r9 = (Math.imul(mode.fps | 0, r9) - drop) | 0;
  const B = r9 | 0;

  //   @0x1f5e1  movl %r9d, %esi
  //   @0x1f5e4  imull %eax, %esi                    ; esi = B * A
  //   @0x1f5e7  addl %r8d, %esi                     ; esi = C = B*A + drop  (frames per big cycle in drop-mode)
  const C = (Math.imul(B, A) + drop) | 0;

  //   @0x1f5ea  movl (%rdi), %eax                   ; eax = frame
  //   @0x1f5ec  cltd; idivl %esi                    ; eax = bigCycles = frame / C, edx = frame % C
  //   @0x1f5ef  movl %eax, %esi                     ; esi = bigCycles
  //   @0x1f5f1  movl %edx, %eax                     ; eax = frame % C
  const frameI = frame | 0;
  const bigCycles = ((frameI / C) | 0);
  const rem = (frameI - Math.imul(bigCycles, C)) | 0;

  //   @0x1f5f3  subl %r8d, %eax                     ; eax = rem - drop
  //   @0x1f5f6  cltd; idivl %r9d                    ; eax = (rem-drop)/B  (smallCycles)
  const smallCycles = (((rem - drop) | 0) / B) | 0;

  //   @0x1f5fa  decl %ecx                           ; ecx = A - 1
  //   @0x1f5fc  imull %esi, %ecx                    ; ecx = (A-1) * bigCycles
  //   @0x1f5ff  addl %ecx, %eax                     ; eax += ecx
  //   @0x1f601  imull %r8d, %eax                    ; eax *= drop
  ecx = (A - 1) | 0;
  ecx = Math.imul(ecx, bigCycles) | 0;
  let eax = (smallCycles + ecx) | 0;
  eax = Math.imul(eax, drop) | 0;

  //   @0x1f605  popq %rbp; retq
  return eax | 0;
}

// ── PCTimecode::getTimeIndex(PCString const& s, PCTimecodeMode const& mode)
// @0x1f608 ProCore   __ZN10PCTimecode12getTimeIndexERK8PCStringRK14PCTimecodeMode
// Parses a timecode string into a signed integer frame count. Accepts:
//   - "HH:MM:SS:FF"-style with 2..4 fields separated by any of  :;.,-/  (see kPCTimecodeSeparators).
//   - a compact all-digits form (single token, no separator) — interpreted as concatenated
//     2-digit fields FF/SS/MM/HH read from the right (least-significant end).
//   - a leading '-' sign, which negates the final result.
// When mode.framesToDrop != 0, drop-frame corrections are applied to the aggregate frame count
// (subtracting `drop * (minutes - bigCycles)` where minutes = (r8-1)/(fps*secondsPerCycle) and
// bigCycles = (r8-1)/(fps*secondsPerBigCycle) — see 0x1f77b..0x1f7af).
//
// External libc callees:
//   @0xdeb64 __stub _strdup                   (POSIX)   — duplicate cstring
//   @0xdeb88 __stub _strsep                   (POSIX)   — split at any char in delimiter set
//   @0xde792 __stub _atoi                     (POSIX)   — parse decimal integer
//   @0xde89a __stub _free                     (POSIX)   — free() the strdup / createCStr buffers
//   @0x???   PCString::createCStr() const     __ZNK8PCString10createCStrEv  (returns C-string for
//                                             the PCString — modelled here by taking the input
//                                             directly as a JS string).
export function PCTimecode_getTimeIndex(
  s: string,
  mode: PCTimecodeMode,
): number {
  //   @0x1f62a  callq __ZNK8PCString10createCStrEv     ; r12 = s.createCStr()
  //   @0x1f632  testq %rax, %rax; je 0x1f6c0            ; if createCStr returned null, return 0
  // In the port, an empty JS string is the equivalent of a "null cstring": createCStr on an
  // empty PCString returns nullptr in the runtime. We match that behavior.
  if (s.length === 0) return 0;

  //   @0x1f63b  movb (%r12), %r13b                     ; r13b = first char
  //   @0x1f63f  xorl %eax, %eax
  //   @0x1f641  cmpb $0x2d, %r13b; sete %al            ; al = (first_char == '-') ? 1 : 0
  //   @0x1f648  movq %r12, %rdi; addq %rax, %rdi       ; rdi = cstr + (isNeg ? 1 : 0)   — skip the '-'
  //   @0x1f64e  callq _strdup                          ; r15 = strdup(cstr + skip)
  const firstChar = s.charCodeAt(0);
  const wasNeg = (firstChar === 0x2d);  // '-'
  const body = wasNeg ? s.substring(1) : s;

  //   @0x1f656..0x1f68b  loop: parse up to 4 tokens via strsep(&p, ":;.,-/"), atoi each.
  //   Stack layout uses -0x40(%rbp) as an int32[4] "tokens" and -0x50(%rbp) as an int32[4]
  //   "factors" (populated below). r14 = index (0..3), rbx = count (r14+1).
  //   Loop guard: `cmpq $3, %r14; jb 0x1f688` — increments only while r14 < 3 (so max 4 tokens).
  //   If strsep returns null on the first call (no delimiter and no content), r14=0 and rbx=0 —
  //   handled below (compact-numeric branch requires ebx==1).
  //
  // strsep splits at the FIRST separator in the delimiter set; consecutive calls advance through
  // the whole string. We emulate by walking splits ourselves.
  const tokens: number[] = [];
  let cur = body;
  let count = 0;
  // First call to strsep on the (already strdup'd) full string: returns the head of the string
  // even if no delimiter is found (in which case *p becomes null and next call returns null).
  //   @0x1f664/0x1f69f  callq _strsep
  //   @0x1f669  testq %rax, %rax; je 0x1f6c8            ; on first null, tokens=0
  const isSepChar = (ch: number): boolean => {
    // kPCTimecodeSeparators = ":;.,-/"  =  0x3a 0x3b 0x2e 0x2c 0x2d 0x2f
    return ch === 0x3a || ch === 0x3b || ch === 0x2e || ch === 0x2c || ch === 0x2d || ch === 0x2f;
  };
  // Emulate the strsep loop. strsep returns the initial token (up to the first delimiter or the
  // whole string); subsequent calls advance past the delimiter each time.
  let p: string | null = body;
  // First strsep — if body is empty _strdup gave "" and strsep returns "" not null; but the disasm
  // testq at 0x1f66c is on the returned pointer, not on strlen. _strdup("") returns non-null;
  // strsep on it returns "" first, then null. Match: r14 stays 0 across the "" token; rbx = 0
  // stays 0. Actually strsep DOES return the "" pointer first, so tokens=1 with atoi("")=0.
  // The r14=0, rbx=0 branch is only entered when strsep returns null on FIRST call, which does
  // not happen for _strdup("") (that returns a valid empty cstring; strsep returns "" then null).
  // For an unallocated string (createCStr returned null) we already short-circuited above.
  while (p !== null) {
    // Find next separator in `p`.
    let i = 0;
    while (i < p.length && !isSepChar(p.charCodeAt(i))) i++;
    const tok = p.substring(0, i);
    //   @0x1f68b  callq _atoi                           ; eax = atoi(token)
    //   @0x1f694  movl %eax, -0x40(%rbp,%r14,4)         ; tokens[r14] = eax
    const n = parseIntC(tok);
    tokens.push(n);
    count = count + 1;
    // Advance past the separator (strsep replaces the sep with '\0' and returns the tail):
    if (i >= p.length) {
      p = null;
    } else {
      p = p.substring(i + 1);
    }
    //   @0x1f6a9  cmpq $3, %r14; movq %rbx, %r14; jb 0x1f688
    // The disasm INCREMENTS r14 only while r14 < 3 pre-check; so it processes at most 4 tokens.
    if (count >= 4) break;
    // The disasm also breaks out of the loop as soon as strsep returns null (via test at 0x1f6a7).
  }
  // Match the disasm's `movq %rbx, %r14` post-loop: `count` (ebx) is now the tokens processed.

  //   @0x1f6d2  movl 0x8(%r14), %edi                   ; edi = mode.fps
  //   @0x1f6d6  movl $0x1, -0x50(%rbp)                 ; factor[0] = 1
  //   @0x1f6dd  movl %edi, -0x4c(%rbp)                 ; factor[1] = fps
  //   @0x1f6e0  imull $0x3c, %edi, %eax
  //   @0x1f6e3  movl %eax, -0x48(%rbp)                 ; factor[2] = 60*fps
  //   @0x1f6e6  imull $0xe10, %edi, %eax               ; 0xe10 = 3600
  //   @0x1f6ec  movl %eax, -0x44(%rbp)                 ; factor[3] = 3600*fps
  const fps = mode.fps | 0;
  const factor = [
    1 | 0,                        // factor[0] = 1                              @0x1f6d6
    fps | 0,                      // factor[1] = fps                            @0x1f6dd
    Math.imul(60, fps) | 0,       // factor[2] = 60 * fps                       @0x1f6e0
    Math.imul(3600, fps) | 0,     // factor[3] = 3600 * fps                     @0x1f6e6
  ];

  //   @0x1f6ef  cmpl $0x2, %ebx; jb 0x1f712            ; if count < 2, take compact-numeric branch
  let r8 = 0;  // accumulator (see disasm reg naming)
  if (count >= 2) {
    //   @0x1f6f4  movl %ebx, %eax
    //   @0x1f6f6  xorl %r8d, %r8d
    //   @0x1f6f9  leaq -0x50(%rbp), %rcx                  ; rcx = &factor[0]
    //   LOOP:
    //     @0x1f6fd  movl (%rcx), %edx                     ; edx = *rcx (factor[i])
    //     @0x1f6ff  imull -0x44(%rbp,%rax,4), %edx        ; edx *= tokens[count - (count-rax) ??]
    //     @0x1f704  addl %edx, %r8d
    //     @0x1f707  addq $0x4, %rcx
    //     @0x1f70b  decq %rax
    //     @0x1f70e  jne 0x1f6fd
    //
    // Effect: sums factor[i] * tokens[count-1 - i] for i = 0..count-1. That is,
    // r8 = tokens[count-1] + tokens[count-2]*fps + tokens[count-3]*60*fps + tokens[count-4]*3600*fps.
    // With count fields, the LAST token is FF-units, previous is SS, then MM, then HH.
    for (let i = 0; i < count; i++) {
      r8 = (r8 + Math.imul(factor[i] | 0, tokens[count - 1 - i] | 0)) | 0;
    }
  } else {
    //   @0x1f712  cmpl $0x1, %ebx; sete %cl              ; cl = (count == 1)
    //   @0x1f718  movl -0x40(%rbp), %eax                 ; eax = tokens[0]
    //   @0x1f71b  testl %eax, %eax; setne %dl            ; dl = (tokens[0] != 0)
    //   @0x1f720  andb %cl, %dl
    //   @0x1f722  xorl %r8d, %r8d
    //   @0x1f725  cmpb $0x1, %dl; jne 0x1f772           ; skip unless count==1 AND tokens[0]!=0
    if (count === 1 && (tokens[0] | 0) !== 0) {
      //   @0x1f72a  xorl %ecx, %ecx                       ; rcx = 0 (factor index)
      //   @0x1f72c  xorl %r8d, %r8d                       ; accumulator = 0
      //   LOOP2 (@0x1f72f..0x1f770):
      //     @0x1f72f  movl %r8d, %edx                     ; edx = prev accumulator
      //     @0x1f732  movslq %eax, %rsi                   ; rsi = current value (initially tokens[0])
      //     @0x1f735..0x1f747  eax = rsi / 100  (compiler-generated signed div by 100 using
      //                       imulq $0x51eb851f, shrq $0x3f, sarq $0x25, addl)
      //     @0x1f74a  imull $0x64, %eax, %r9d              ; r9d = quotient * 100
      //     @0x1f74e  movl %esi, %r8d
      //     @0x1f751  subl %r9d, %r8d                      ; r8d = rsi - quotient*100 = rsi % 100
      //     @0x1f754  imull -0x50(%rbp,%rcx,4), %r8d       ; r8d *= factor[rcx]
      //     @0x1f75a  addl %edx, %r8d                       ; r8d += prev accumulator
      //     @0x1f75d  addl $-0x64, %esi                     ; esi -= 100
      //     @0x1f760  cmpl $0xffffff38, %esi                ; compare -200 signed = 0xffffff38 unsigned
      //     @0x1f766  ja 0x1f772                            ; UNSIGNED above => exit
      //     @0x1f768  cmpq $0x3, %rcx
      //     @0x1f76c  leaq 0x1(%rcx), %rcx                  ; rcx++
      //     @0x1f770  jb 0x1f72f                            ; while rcx < 3
      //
      // Effect: reads compact numeric like "1020304" as pairs of 2-digit fields from LSB:
      //   iter 0: value=1020304, digit=04, factor[0]=1                  → contributes 4
      //   iter 1: value=10203  , digit=03, factor[1]=fps                → contributes 3*fps
      //   iter 2: value=102    , digit=02, factor[2]=60*fps             → contributes 2*60fps
      //   iter 3: value=1      , digit=01, factor[3]=3600*fps           → contributes 1*3600fps
      // The exit check uses the CURRENT value (pre-divide): (value - 100) unsigned-above -200
      // means value is <= 100 (unsigned wraparound); at that point one more iteration runs then
      // exits. rcx counter caps at 3 so we do at most 4 iterations.
      let value = tokens[0] | 0;
      let rcx = 0;
      // NOTE: The signed-divide-by-100 in the asm treats negative numbers via magic multiplication
      // that produces JS trunc-toward-zero results (Math.trunc(x/100) is the equivalent).
      for (;;) {
        const prevAcc = r8 | 0;
        const rsi = value | 0;
        const quotient = (rsi / 100) | 0;  // signed truncating divide
        const digit = (rsi - Math.imul(quotient, 100)) | 0;  // rsi % 100
        r8 = (Math.imul(digit, factor[rcx] | 0) + prevAcc) | 0;
        // exit check on rsi (the pre-divide value) - 100 compared unsigned to 0xffffff38
        const esiAfter = (rsi - 100) | 0;
        // Convert to unsigned 32-bit for the "ja" (unsigned above) test.
        const esiU = esiAfter >>> 0;
        const thresholdU = 0xffffff38 >>> 0;
        if (esiU > thresholdU) break;   // ja: unsigned above → exit loop
        // then: cmp rcx, 3; rcx++; if rcx < 3: continue
        if (rcx >= 3) break;
        rcx = (rcx + 1) | 0;
        value = quotient | 0;
      }
    }
  }

  //   @0x1f772  movl 0xc(%r14), %r9d                    ; r9d = drop = mode.framesToDrop
  //   @0x1f776  testl %r9d, %r9d; je 0x1f7b2            ; skip drop-frame correction if 0
  const drop = mode.framesToDrop | 0;
  if (drop !== 0) {
    //   @0x1f77b  movl 0x10(%r14), %esi                  ; esi = secondsPerCycle
    //   @0x1f77f  movl 0x14(%r14), %eax                  ; eax = secondsPerBigCycle
    //   @0x1f783  cltd; idivl %esi                        ; eax = A = secondsPerBigCycle / secondsPerCycle
    //   @0x1f786  movl %eax, %ecx                         ; ecx = A
    const secPerCycle = mode.secondsPerCycle | 0;
    const A = ((mode.secondsPerBigCycle | 0) / secPerCycle) | 0;
    let ecx = A | 0;

    //   @0x1f788  imull %esi, %edi                        ; edi = fps * secondsPerCycle
    //   @0x1f78b  imull %edi, %ecx                        ; ecx = A * (fps*secondsPerCycle) = fps*secondsPerBigCycle (nominal frames per big cycle)
    let edi = Math.imul(fps, secPerCycle) | 0;
    ecx = Math.imul(A, edi) | 0;

    //   @0x1f78e  cmpl $0x2, %r8d
    //   @0x1f792  movl $0x1, %esi
    //   @0x1f797  cmovgel %r8d, %esi                      ; esi = (r8 >= 2) ? r8 : 1
    //   @0x1f79b  decl %esi                                ; esi -= 1  (i.e. max(r8-1, 0))
    let esi = ((r8 | 0) >= 2) ? (r8 | 0) : 1;
    esi = (esi - 1) | 0;

    //   @0x1f79d  movl %esi, %eax; cltd; idivl %edi
    //   @0x1f7a2  movl %eax, %edi                         ; edi = esi / (fps*secondsPerCycle)  — totalMinutes  (or "short cycles")
    const minutesLikeCount = ((esi / edi) | 0);
    edi = minutesLikeCount | 0;

    //   @0x1f7a4  movl %esi, %eax; cltd; idivl %ecx
    //   @0x1f7a9  subl %edi, %eax                         ; eax = esi/(fps*secondsPerBigCycle) - totalMinutes  = bigCycles - minutesLikeCount
    const bigCyclesLikeCount = ((esi / ecx) | 0);
    let eax = (bigCyclesLikeCount - edi) | 0;

    //   @0x1f7ab  imull %r9d, %eax                        ; eax *= drop  (net "dropped frames to subtract" — signed; will be negative)
    //   @0x1f7af  addl %eax, %r8d                         ; r8 += eax
    eax = Math.imul(eax, drop) | 0;
    r8 = (r8 + eax) | 0;
  }

  //   @0x1f7b2  movl %r8d, %r14d
  //   @0x1f7b5  negl %r14d
  //   @0x1f7b8  cmpb $0x2d, %r13b                         ; was the first char '-' ?
  //   @0x1f7bc  cmovnel %r8d, %r14d                       ; NON-equal → not negative → use r8 (non-negated)
  const result = wasNeg ? ((-r8) | 0) : (r8 | 0);

  //   @0x1f7c0  callq _free                              ; free the strsep buffer (r15 was strdup)
  //   @0x1f7c8..0x1f7e9  stack-guard check, epilogue.
  return result | 0;
}

// ── PCTimecode::getSeparators()
// @0x1f7f0 ProCore   __ZN10PCTimecode13getSeparatorsEv
// Returns the address of the file-scope static separators storage — a `const char*` variable at
// ProCore 0x1492f0 (symbol __ZZN10PCTimecode13getSeparatorsEvE10separators) that is initialized
// to point at the 6-char cstring ":;.,-/" at ProCore 0x13193b. The function body is a single
// `leaq &separators, %rax; retq`. In the port we return the pointed-to string value directly
// since callers only ever want the character set.
//   @const ProCore 0x1492f0  static pointer -> cstring at 0x13193b
//   @const ProCore 0x13193b  cstring ":;.,-/"
export function PCTimecode_getSeparators(): string {
  //   @0x1f7f4  leaq __ZZN10PCTimecode13getSeparatorsEvE10separators(%rip), %rax
  //   @0x1f7fb  popq %rbp; retq
  return kPCTimecodeSeparators;
}

// ── local libc helpers ───────────────────────────────────────────────────────
// _atoi(3) — POSIX. Parses leading integer from a cstring; returns 0 if no digits parseable.
// Behavior modelled: skip leading whitespace, optional +/- sign, parse decimal digits, stop at
// first non-digit. Overflow is undefined in atoi; we truncate via `|0`.
// @extern-stub __stub _atoi @0xde792 ProCore
function parseIntC(s: string): number {
  let i = 0;
  const n = s.length;
  // atoi skips isspace(3) chars
  while (i < n) {
    const c = s.charCodeAt(i);
    if (c === 0x20 || c === 0x09 || c === 0x0a || c === 0x0b || c === 0x0c || c === 0x0d) i++;
    else break;
  }
  let sign = 1;
  if (i < n) {
    const c = s.charCodeAt(i);
    if (c === 0x2b) i++;                      // '+'
    else if (c === 0x2d) { sign = -1; i++; }  // '-'
  }
  let acc = 0;
  while (i < n) {
    const c = s.charCodeAt(i);
    if (c < 0x30 || c > 0x39) break;
    acc = (Math.imul(acc, 10) + (c - 0x30)) | 0;
    i++;
  }
  return (sign * acc) | 0;
}
