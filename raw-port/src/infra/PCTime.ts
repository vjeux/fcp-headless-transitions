// PCTime.ts — ProCore's PCTime: a wall-clock timeval-shaped struct (sec:int64 + usec:int32)
// used for "is this deadline past/future" comparisons and arithmetic in absolute microseconds.
// Transcribed from FCP's ProCore binary at 0x154e2..0x156d3. See raw-port/re/disasm/
// ProCore.PCTime.{PCTime,isPast,isFuture,add,print}.s for the ground-truth assembly.
//
// Every function below cites its @0xADDR; every numeric constant cites the address it was read
// from. External libc callees (_gettimeofday, _PCPrintIndent) are stubbed as throwing calls
// citing the callq site — hosts wire them in when they need them.
//
// ── PCTime struct layout (recovered from the ctors + isPast at 0x1555a..0x15597) ──────
// The two-field layout is what the copy-ctor at 0x1551c does verbatim (movq (%rsi),%rax; movl
// 0x8(%rsi),%eax) and matches the sentinel-initialized default ctor at 0x154e2 (movq $0x7fffffff,
// (%rdi); movl $0x7fffffff, 0x8(%rdi)):
//   +0x00 sec  : int64   // seconds since UNIX epoch (matches timeval::tv_sec on 64-bit macOS)
//   +0x08 usec : int32   // microseconds within the second (matches timeval::tv_usec; int on macOS)
//
// The default-constructed sentinel is (sec=0x7fffffff, usec=0x7fffffff) — the isPast/isFuture
// callers reuse the SAME sentinel to seed the timeval before gettimeofday overwrites it, so it
// is baked into the class contract (this class treats 0x7fffffff/0x7fffffff as "unset/far-future").
export interface PCTimeStruct {
  sec: bigint;    // +0x00 int64 (bigint — POSIX time_t is 64-bit on macOS and can exceed 2^53)
  usec: number;   // +0x08 int32
}

// The sentinel value seeded by the default ctor and reused as the timeval on the stack in
// isPast/isFuture (movq $0x7fffffff,(%r14); movl $0x7fffffff,0x8(%r14) at 0x1556c/0x15573).
// @const ProCore 0x154e6 (default-ctor immediate) and ProCore 0x1556c (isPast stack seed).
export const kPCTimeUnset: PCTimeStruct = { sec: 0x7fffffffn, usec: 0x7fffffff };

// ── constants read from ProCore's RIP-relative literal pools (add(float) at 0x155fa) ─────
// movss 0xcc9f6(%rip), %xmm1  at 0x15602  →  RIP=0x1560a + 0xcc9f6 = 0xe2000 : f32 = 1e-5
// The bit pattern 0x3727c5ac at ProCore 0xe2000 is the single-precision literal 9.999999747e-6,
// i.e. the closest f32 to 1e-5 — used as a small ε added to the seconds arg before truncating so
// that a value like 3.0000000f (already an integer float) rounds *up* to 3 instead of possibly
// truncating to 2 due to a prior fmul/fadd having produced 2.99999997f.
// @const ProCore 0xe2000  (f32 bit-pattern 0x3727c5ac → 1e-5f)
const F32_EPS_1E5 = 1e-5;
// mulss 0x10df30(%rip), %xmm0 at 0x15618  →  RIP=0x15620 + 0x10df30 = 0x123550 : f32 = 1e6
// Bit-pattern 0x49742400 at ProCore 0x123550 is the single-precision literal 1000000.0f, used to
// convert the fractional-second part to whole microseconds before the second cvttss2si.
// @const ProCore 0x123550 (f32 bit-pattern 0x49742400 → 1.0e6f)
const F32_USEC_PER_SEC = 1000000;
// USEC_PER_SEC as an integer (0xF4240) is baked as an imm32 in add(int,int) at 0x1566b, 0x15679,
// 0x15687, 0x156b3, 0x156c2 — same 1e6 constant, but *int* (not float), so it's tracked separately.
// @const ProCore 0x1566b  (imm32 $0xF4240 → 1_000_000)
const USEC_PER_SEC = 1000000;
// -USEC_PER_SEC = -1_000_000 as imm32 in add(int,int) at 0x15642, 0x1564a, 0x156c6.
// @const ProCore 0x15642  (imm32 $0xFFF0BDC0 → -1_000_000)
const NEG_USEC_PER_SEC = -1000000;
// -999_999 as imm32 in add(int,int) at 0x1563c (the cmpl edx, 0xFFF0BDC1).
// @const ProCore 0x1563c  (imm32 $0xFFF0BDC1 → -999_999)
const NEG_USEC_MAX = -999999;
// 1_999_999 as imm32 in add(int,int) at 0x15693 (subl esi, 0x1E847F) — used for the "already
// >= 2_000_000" fast-path in the forward-normalize branch.
// @const ProCore 0x15693  (imm32 $0x1E847F → 1_999_999)
const USEC_2X_MINUS_1 = 1999999;
// 999_999 as imm32 in add(int,int) at 0x1569c (addl esi, 0xF423F).
// @const ProCore 0x1569c  (imm32 $0xF423F → 999_999)
const USEC_MAX = 999999;
// 0x431BDE83 with a shrq $50 = fixed-point reciprocal of 1_000_000. floor(2^50 / 1_000_000) =
// 0x431BDE82 with a +1 rounding tweak → 0x431BDE83. Used to do `x / 1_000_000` via the identity
// `(x * 0x431BDE83) >> 50 = x div 1_000_000` for x in the range this code exercises. This is the
// classic magic-reciprocal division: compilers emit it in place of `idiv` for constant divisors.
// @const ProCore 0x1565d  (imm32 $0x431BDE83 → floor(2^50 / 1_000_000) with round-up)
const RECIP_1E6_2P50 = 0x431BDE83n;  // used with bigint shrq >> 50n to divide by 1_000_000

// ── libc callees (called by isPast/isFuture and print — stubbed, cite the callq site) ────
// _gettimeofday callq @ ProCore 0x15580 (isPast) and @ 0x155d0 (isFuture). We can't invoke it
// bit-exactly from a JS host at will, so runtime callers inject the "now" via `nowUnixTv`.
function gettimeofday_stub(): PCTimeStruct {
  // gettimeofday callq @ ProCore 0x15580 / 0x155d0 not yet transcribed
  throw new Error("PCTime._gettimeofday @ProCore 0x15580 must be provided by host (inject nowUnixTv)");
}
// _PCPrintIndent tail-jmp @ ProCore 0x156ec — the printer expects an indent+format+varargs. Not
// yet transcribed as a whole (PCPrintIndent lives in ProCore separately); print() below assembles
// the exact argument shape the ProCore code passes and defers execution to a host hook.
function pcPrintIndent_stub(_indent: number, _fmt: string, _sec: bigint, _usec: number): void {
  // _PCPrintIndent tail-jmp @ ProCore 0x156ec not yet transcribed
  throw new Error("PCTime.print — PCPrintIndent @ProCore 0x156ec not yet transcribed");
}

// ═══════════════════════════════════════════════════════════════════════════════
// PCTime — CONSTRUCTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * PCTime::PCTime() default ctor.
 * @0xADDR ProCore 0x154e2 (C2) / 0x154f6 (C1) — both identical: seeds {sec,usec} to sentinel
 *   0x7fffffff/0x7fffffff (the "unset/far-future" marker also reused as the isPast stack seed).
 */
export function makePCTime(): PCTimeStruct {
  // movq $0x7fffffff, (%rdi)   @0x154e6
  // movl $0x7fffffff, 0x8(%rdi) @0x154ed
  return { sec: 0x7fffffffn, usec: 0x7fffffff };
}

/**
 * PCTime::PCTime(int sec, int usec) — value ctor.
 * @0xADDR ProCore 0x1552e (C2) / 0x1553e (C1) — identical:
 *   movslq %esi, %rax ; movq %rax, (%rdi)   ; movl %edx, 0x8(%rdi)
 * The first arg is sign-extended int32 → int64 (movslq) for the sec field; usec stays as int32.
 */
export function makePCTimeFromParts(sec: number, usec: number): PCTimeStruct {
  // movslq %esi, %rax → sign-extend the int32 arg to int64.
  return { sec: BigInt(sec | 0), usec: usec | 0 };
}

/**
 * PCTime::PCTime(PCTime const&) — copy ctor.
 * @0xADDR ProCore 0x1550a (C2) / 0x1551c (C1) — identical:
 *   movq (%rsi), %rax ; movq %rax, (%rdi) ; movl 0x8(%rsi), %eax ; movl %eax, 0x8(%rdi)
 */
export function copyPCTime(src: PCTimeStruct): PCTimeStruct {
  return { sec: src.sec, usec: src.usec };
}

/**
 * PCTime::~PCTime() — no-op destructor.
 * @0xADDR ProCore 0x1554e (D2) / 0x15554 (D1) — both are just the standard frame prologue/epilogue.
 * Kept as a documented no-op so the class surface matches the C++ ABI (nothing to release).
 */
export function destroyPCTime(_t: PCTimeStruct): void {
  // pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq @0x1554e / @0x15554
}

// ═══════════════════════════════════════════════════════════════════════════════
// PCTime — QUERIES (isPast / isFuture)
// ═══════════════════════════════════════════════════════════════════════════════

// The isPast/isFuture pair share the same body except for the compare direction. Both:
//   1. seed a local timeval with the class sentinel (0x7fffffff, 0x7fffffff),
//   2. call gettimeofday(&tv, NULL) to overwrite it,
//   3. compare (this->sec, this->usec) vs (tv.tv_sec, tv.tv_usec) lexicographically.
// The seeding-before-gettimeofday step is preserved for faithfulness — if the host's
// gettimeofday were to fail (POSIX allows a nonzero return), the sentinel would remain, and
// (this->sec == 0x7fffffff && this->usec <= 0x7fffffff) is always TRUE, so isPast on an unset
// PCTime after a failed gettimeofday returns true. (Matches the disassembly's control flow.)

/**
 * PCTime::isPast() — returns true iff (this->sec, this->usec) <= now.
 * @0xADDR ProCore 0x1555a
 *
 * Control flow (from 0x1555a..0x155a9):
 *   tv = {0x7fffffff, 0x7fffffff}          ; @0x1556c/0x15573
 *   _gettimeofday(&tv, NULL)               ; @0x15580 (callq)
 *   %rcx = this->sec ; %rdx = tv.tv_sec    ; @0x15585/0x15588
 *   %al  = 1                               ; @0x1558b (default true)
 *   cmpq %rdx, %rcx                        ; this->sec vs tv.tv_sec
 *   jl  0x155a1  ; if this->sec  < tv.tv_sec  → return al=1 (past)
 *   jne 0x1559f  ; if this->sec  > tv.tv_sec  → return al=0 (future)
 *   ; equal → compare usec: setle for isPast (this->usec <= tv.tv_usec)
 *   cmpl -0x18(%rbp), 0x8(%rbx) ; setle %al
 */
export function pcTime_isPast(t: PCTimeStruct, nowUnixTv?: PCTimeStruct): boolean {
  // 1) seed with sentinel (movq $0x7fffffff,(%r14); movl $0x7fffffff,0x8(%r14) @0x1556c/0x15573)
  let tv: PCTimeStruct = { sec: 0x7fffffffn, usec: 0x7fffffff };
  // 2) _gettimeofday(&tv, NULL) @0x15580 — inject via host if provided, else fall through
  //    to the stub which mirrors "gettimeofday not decoded here".
  tv = nowUnixTv ?? gettimeofday_stub();
  // 3) al = 1 (default TRUE), then compare sec then usec.  @0x1558b: movb $0x1, %al
  //    cmpq %rdx,%rcx / jl 0x155a1 / jne 0x1559f  → three-way branch on the seconds.
  if (t.sec < tv.sec) return true;                             // jl 0x155a1 → al=1 (past)
  if (t.sec !== tv.sec) return false;                          // jne 0x1559f → al=0 (future)
  // equal seconds: setle (this->usec <= tv.tv_usec) → past.  @0x1559a
  return (t.usec | 0) <= (tv.usec | 0);
}

/**
 * PCTime::isFuture() — returns true iff (this->sec, this->usec) > now.
 * @0xADDR ProCore 0x155aa
 *
 * Body is byte-for-byte the same as isPast except the operands to cmpq/cmpl are swapped and the
 * final setcc is `setl` (strict less-than):
 *   %rcx = tv.tv_sec ; %rdx = this->sec  ; @0x155d5/0x155d8   (SWAPPED vs isPast)
 *   cmpq %rdx, %rcx ; jl 0x155f1 (return al=1)  → tv.tv_sec < this->sec → future
 *                    jne 0x155ef (return al=0) → tv.tv_sec > this->sec → past
 *   equal → cmpl 0x8(%rbx), -0x18(%rbp) ; setl %al  → tv.usec < this->usec.
 */
export function pcTime_isFuture(t: PCTimeStruct, nowUnixTv?: PCTimeStruct): boolean {
  let tv: PCTimeStruct = { sec: 0x7fffffffn, usec: 0x7fffffff };
  tv = nowUnixTv ?? gettimeofday_stub();
  if (tv.sec < t.sec) return true;                             // jl 0x155f1
  if (tv.sec !== t.sec) return false;                          // jne 0x155ef
  return (tv.usec | 0) < (t.usec | 0);                         // setl @0x155ea
}

// ═══════════════════════════════════════════════════════════════════════════════
// PCTime — ARITHMETIC (add)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * PCTime::add(float seconds) — tail-calls add(int sec, int usec).
 * @0xADDR ProCore 0x155fa
 *
 * Decomposes a f32 seconds arg into (whole_sec, whole_usec) with a tiny +1e-5f ε on the
 * truncation used for the fractional split, then tail-jumps to add(int,int):
 *   cvttss2si %xmm0, %esi                     @0x155fe  sec_i = (int)truncf(secArg)
 *   movss 0xcc9f6(%rip), %xmm1                @0x15602  xmm1 = 1e-5f  (@const ProCore 0xe2000)
 *   addss %xmm0, %xmm1                        @0x1560a  xmm1 = secArg + 1e-5f
 *   roundss $0x9, %xmm1, %xmm1                @0x1560e  xmm1 = truncf(secArg + 1e-5f)
 *                                                       (0x9 = round toward zero, no exception)
 *   subss %xmm1, %xmm0                        @0x15614  xmm0 = secArg - trunc(secArg+1e-5f)
 *   mulss 0x10df30(%rip), %xmm0               @0x15618  xmm0 *= 1e6f  (@const ProCore 0x123550)
 *   cvttss2si %xmm0, %edx                     @0x15620  usec_i = (int)truncf(fractional*1e6f)
 *   jmp __ZN6PCTime3addEii                    @0x15625  tail-call add(int,int)
 *
 * Single-precision throughout: every op is single (movss/addss/subss/mulss/roundss/cvttss2si),
 * so we wrap the arithmetic in Math.fround to match the machine's f32 rounding at each step.
 */
export function pcTime_addFloat(t: PCTimeStruct, secArg: number): void {
  // cvttss2si %xmm0, %esi — the seconds arg is *first* truncated to int as-is (not via xmm1).
  //   Note: cvttss2si on out-of-range gives INT_MIN (0x80000000) — that mirrors JS's `x|0` for
  //   values already in [INT_MIN, INT_MAX], but JS `|0` differs on out-of-range. Keep the wrap.
  const s = Math.fround(secArg);
  const sec_i = f32_cvttss2si(s);                              // @0x155fe
  // xmm1 = s + 1e-5f (single-precision add); then trunc → single-precision "toward zero" round.
  const shifted = Math.fround(Math.fround(s + Math.fround(F32_EPS_1E5)));   // @0x1560a
  const trunc_shift = Math.fround(Math.trunc(shifted));        // @0x1560e (roundss $0x9)
  // xmm0 -= xmm1  ; xmm0 *= 1e6f
  const frac  = Math.fround(s - trunc_shift);                  // @0x15614
  const usec_f = Math.fround(frac * Math.fround(F32_USEC_PER_SEC)); // @0x15618
  const usec_i = f32_cvttss2si(usec_f);                        // @0x15620
  // jmp add(int,int)                                          @0x15625
  pcTime_addParts(t, sec_i, usec_i);
}

// cvttss2si: convert-with-truncation float32 → int32. On out-of-range or NaN, the CPU returns
// 0x80000000 (INT_MIN). We model that explicitly — a JS `| 0` differs on NaN/Infinity.
// @0xADDR ProCore 0x155fe / 0x15620 (both cvttss2si sites in add(float))
function f32_cvttss2si(x: number): number {
  if (!Number.isFinite(x)) return -0x80000000;                 // NaN/±Inf → 0x80000000 sentinel
  const t = Math.trunc(x);
  if (t < -0x80000000 || t > 0x7fffffff) return -0x80000000;   // out-of-range → 0x80000000
  return t | 0;
}

/**
 * PCTime::add(int sec, int usec) — the primary integer-timeval addition, with normalization
 * of usec to [0, 1_000_000) via magic-reciprocal division by 1_000_000.
 * @0xADDR ProCore 0x1562a
 *
 * The disassembly at 0x1562a..0x156d3 does:
 *   1. this->sec  += sign-extend(sec_arg)         @0x1562e..0x15634
 *   2. edx = this->usec + usec_arg                @0x15637
 *   3. IF edx >= 0  (jns 0x15684)  → skip block A, go to block B (forward-normalize if edx>=1e6)
 *      ELSE                        → block A (backward-normalize when edx is negative)
 *
 * BOTH normalization blocks use the identity (x * 0x431BDE83) >> 50 == x / 1_000_000  (for the
 * ranges of x this code produces). The floor(2^50 / 1e6) = 0x431BDE83 (with round-up), from the
 * imull/shrq pair at 0x1565d/0x15664 and 0x156a2/0x156a9.
 */
export function pcTime_addParts(t: PCTimeStruct, secArg: number, usecArg: number): void {
  // 1) sec += sign-extend(secArg)                              @0x1562e/0x15631/0x15634
  //    movslq %esi, %rax ; addq (%rdi), %rax ; movq %rax, (%rdi)
  let rax: bigint = t.sec + BigInt(secArg | 0);
  t.sec = rax;                                                 // @0x15634
  // 2) edx = this->usec + usecArg                              @0x15637
  //    addl 0x8(%rdi), %edx  — 32-bit signed add.
  let edx: number = ((t.usec | 0) + (usecArg | 0)) | 0;
  // 3) jns 0x15684 — if edx >= 0 (sign flag clear), skip the negative-normalize block.       @0x1563a
  if (edx < 0) {
    // ── BLOCK A : negative-normalize ────────────────────────────────────────
    // cmpl edx, 0xFFF0BDC1 ; movl ecx, 0xFFF0BDC0 ; cmovae ecx, edx           @0x1563c..0x15647
    //   For edx < 0 (this branch), unsigned(edx) is in [0x80000000, 0xFFFFFFFF]. The cmovae
    //   fires when unsigned(edx) >= 0xFFF0BDC1 (== signed(edx) >= -999999). Otherwise ecx =
    //   -1_000_000. So: ecx = (edx >= -999999) ? edx : -1_000_000.
    let ecx: number = (edx >= NEG_USEC_MAX) ? edx : NEG_USEC_PER_SEC;
    // movl esi, 0xFFF0BDC0 ; xorl r8d,r8d ; cmpl edx,esi ; setb r8b            @0x1564a..0x15654
    //   r8 = (unsigned(edx) < 0xFFF0BDC0) ? 1 : 0.  For edx<0, that's (edx < -1_000_000).
    const r8: number = (edx < NEG_USEC_PER_SEC) ? 1 : 0;
    // subl ecx, edx ; subl ecx, r8d                                            @0x15658/0x1565a
    ecx = ((ecx - edx) | 0);
    ecx = ((ecx - r8) | 0);
    // imulq rcx, rcx, 0x431BDE83 ; shrq rcx, 0x32                              @0x1565d/0x15664
    //   subl above zero-extended rcx into the upper 32 bits, so this is an unsigned 32×32→64
    //   multiply of ecx by 0x431BDE83, followed by an unsigned >>50. That equals ecx/1_000_000.
    let rcx: bigint = (BigInt(ecx >>> 0) * RECIP_1E6_2P50) >> 50n;
    // addl ecx, r8d                                                            @0x15668
    //   ecx (low 32 bits of rcx) += r8, still fits in 32 bits.
    const ecx_low: number = ((Number(rcx & 0xFFFFFFFFn) | 0) + r8) | 0;
    // imull esi, ecx, 0xF4240                                                  @0x1566b
    const esi_val: number = Math.imul(ecx_low, USEC_PER_SEC) | 0;
    // notl ecx ; movslq rcx, ecx                                               @0x15671/0x15673
    //   ecx = ~ecx  (bitwise NOT), then sign-extend the resulting 32-bit into 64-bit.
    const not_ecx_32: number = (~ecx_low) | 0;
    const not_ecx_64: bigint = BigInt(not_ecx_32);              // movslq — sign-extends int32
    // addq rax, rcx                                                            @0x15676
    rax = t.sec + not_ecx_64;
    // addl edx, 0xF4240 ; addl edx, esi                                        @0x15679/0x1567f
    edx = (((edx + USEC_PER_SEC) | 0) + esi_val) | 0;
    // movq rax,(rdi) ; movl edx,0x8(rdi)                                       @0x15681/0x15684
    t.sec = rax;
    t.usec = edx;
  } else {
    // jns fell through — no negative-normalize; store the additions we already did.
    // (The disassembly at 0x15684 unconditionally writes edx to 0x8(%rdi) here.)
    t.usec = edx;                                                //           @0x15684
  }
  // cmpl edx, 0xF4240 ; jl retq                                                @0x15687/0x1568d
  if (edx < USEC_PER_SEC) {
    // (%rdi already up to date — early-exit path.)
    return;
  }
  // ── BLOCK B : forward-normalize (edx >= 1_000_000) ─────────────────────────
  // xorl ecx,ecx ; movl esi, edx ; subl esi, 0x1E847F ; cmovbl esi, ecx        @0x1568f..0x15699
  //   esi = edx - 1_999_999 ; if that underflowed (edx < 1_999_999) then esi = 0.
  //   In unsigned terms: cmovb fires when the subtraction produced a borrow, iff edx < 1_999_999.
  let esi_b: number = (edx - USEC_2X_MINUS_1) | 0;
  if (edx < USEC_2X_MINUS_1) esi_b = 0;
  // addl esi, 0xF423F                                                          @0x1569c
  esi_b = (esi_b + USEC_MAX) | 0;
  // imulq rcx, rsi, 0x431BDE83 ; shrq rcx, 0x32                                @0x156a2/0x156a9
  //   rcx = (unsigned esi_b) * 0x431BDE83 >> 50   ==   esi_b / 1_000_000
  let rcx_b: bigint = (BigInt(esi_b >>> 0) * RECIP_1E6_2P50) >> 50n;
  const rcx_b_low_i32: number = Number(rcx_b & 0xFFFFFFFFn) | 0;
  // addq rax, rcx ; incq rax                                                   @0x156ad/0x156b0
  //   sec += rcx + 1.  (rcx_b is small and non-negative here; zero-extend into bigint is fine.)
  rax = t.sec + rcx_b + 1n;
  // imull ecx, ecx, 0xF4240                                                    @0x156b3
  const ecx_times_1e6: number = Math.imul(rcx_b_low_i32, USEC_PER_SEC) | 0;
  // movl r8d, esi ; subl r8d, ecx ; subl r8d, esi                              @0x156b9..0x156bf
  //   r8 = esi_b - ecx*1e6 - esi_b == -ecx*1e6  (i.e. -1e6 * carrySeconds).
  let r8_b: number = (esi_b - ecx_times_1e6) | 0;
  r8_b = (r8_b - esi_b) | 0;
  // leal ecx, [rdx + r8]                                                       @0x156c2
  //   ecx = edx + r8_b   (32-bit add).
  const ecx_new: number = (edx + r8_b) | 0;
  // addl ecx, 0xFFF0BDC0                                                       @0x156c6
  //   ecx += -1_000_000. Combined with the "+edx" above and r8=-carry*1e6, this is
  //   `newUsec = edx - carry*1e6 - 1e6`.
  const ecx_final: number = (ecx_new + NEG_USEC_PER_SEC) | 0;
  // movq rax,(rdi) ; movl ecx,0x8(rdi)                                         @0x156cc/0x156cf
  t.sec = rax;
  t.usec = ecx_final;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PCTime — PRINT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * PCTime::print(unsigned int indent) — tail-jumps to _PCPrintIndent with format "%ld sec %ld usec".
 * @0xADDR ProCore 0x156d4
 *
 * From 0x156d4..0x156ec:
 *   movl %esi, %eax           @0x156d8   ; eax = indent
 *   movq (%rdi), %rdx         @0x156da   ; rdx = this->sec  (int64)
 *   movl 0x8(%rdi), %ecx      @0x156dd   ; ecx = this->usec (int32)
 *   leaq 0x11bf28(%rip), %rsi @0x156e0   ; rsi = &"%ld sec %ld usec"  (@const ProCore 0x131610)
 *   movl %eax, %edi           @0x156e7   ; edi = indent
 *   xorl %eax, %eax           @0x156e9   ; al  = 0 (no vector args, per SysV varargs ABI)
 *   jmp _PCPrintIndent        @0x156ec   ; tail-call
 *
 * The format string comes from ProCore's literal pool at 0x156e0 + 0x11bf28 = 0x131608 (accounting
 * for the leaq's 7-byte encoding: RIP after = 0x156e7 → 0x156e7 + 0x11bf28 = 0x13160F which lands
 * inside the C-string block — otool's comment resolves it to "%ld sec %ld usec"). We keep the
 * exact printf format so a host-side PCPrintIndent implementation renders identically.
 */
export function pcTime_print(t: PCTimeStruct, indent: number): void {
  // The %ld format matches C's `long` (64-bit on macOS) for BOTH fields, but the actual field
  // pushed for usec (ecx = movl 0x8(%rdi)) is only 32 bits wide. On x86_64 varargs, an int32
  // gets pushed into a full 64-bit slot with zero/sign extension per its declared width — the
  // format says %ld so PCPrintIndent will fetch 8 bytes for it. We forward both as-is.
  pcPrintIndent_stub(indent | 0, "%ld sec %ld usec", t.sec, t.usec | 0);
}
