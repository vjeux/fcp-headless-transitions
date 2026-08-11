// PCAtomBoxFile.ts -- ProCore framework ISO-BMFF / QuickTime atom-box file
// reader. `isValidType(uint32_t)` is the ftyp/brand acceptance predicate: given
// a 4-character-code (FourCC) major/compatible brand read as a big-endian
// uint32, it returns whether PCAtomBoxFile recognises that brand as a container
// it can open (MP4/M4A/M4V/avc1 family, ISO base-media iso1..iso6/isom,
// mp41/mp42, and classic QuickTime "qt  ").
//
// Verbatim transcription of x86_64 disassembly from FCP's ProCore framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore
//
// Source disasm: raw-port/re/disasm/ProCore.__ZN13PCAtomBoxFile11isValidTypeEj.s (27 lines)
//                raw-port/re/disasm/ProCore.__ZN13PCAtomBoxFile12getErrorCodeEv.s (39 lines)
//                raw-port/re/disasm/ProCore.__ZN13PCAtomBoxFile13getTopAtomBoxEv.s (7 lines)
//
// -----------------------------------------------------------------------------
// SYMBOLS PORTED
// -----------------------------------------------------------------------------
//   * __ZN13PCAtomBoxFile11isValidTypeEj
//       -- PCAtomBoxFile::isValidType(unsigned int)  @ProCore 0x254ea
//   * __ZN13PCAtomBoxFile12getErrorCodeEv
//       -- PCAtomBoxFile::getErrorCode()             @ProCore 0x24f96
//   * __ZN13PCAtomBoxFile13getTopAtomBoxEv
//       -- PCAtomBoxFile::getTopAtomBox()            @ProCore 0x24dfa
//
// No callees: a pure integer switch over the 32-bit FourCC. `unsigned int` is a
// 32-bit value that fits in a JS number, so a plain number models it (the compares
// are all against fixed 32-bit constants; no value can exceed 2^53).
//
// -----------------------------------------------------------------------------
// FULL DISASM (@ProCore 0x254ea)
// -----------------------------------------------------------------------------
//   0x254ea  pushq %rbp
//   0x254eb  movq  %rsp, %rbp
//   0x254ee  movb  $0x1, %al                 ; result = true (default)
//   0x254f0  cmpl  $0x69736f31, %esi         ; type vs 0x69736f31 "iso1"
//   0x254f6  jg    0x25514                    ;  SIGNED type > "iso1" -> upper block
//   0x254f8  cmpl  $0x4d344120, %esi         ; "M4A "
//   0x254fe  je    0x25542                    ;  match -> return true
//   0x25500  cmpl  $0x4d345620, %esi         ; "M4V "
//   0x25506  je    0x25542                    ;  match -> return true
//   0x25508  cmpl  $0x61766331, %esi         ; "avc1"
//   0x2550e  je    0x25542                    ;  match -> return true
//   0x25510  xorl  %eax, %eax                 ; result = false
//   0x25512  jmp   0x25542                    ; return false
//   0x25514  leal  -0x69736f32(%rsi), %ecx   ; ecx = type - 0x69736f32 ("iso2")
//   0x2551a  cmpl  $0x3b, %ecx                ; ecx vs 59
//   0x2551d  ja    0x2552f                    ;  UNSIGNED ecx > 59 -> skip iso range
//   0x2551f  movabsq $0x80000000000001f, %rdx ; bitmask: bits {0,1,2,3,4,59}
//   0x25529  btq   %rcx, %rdx                 ; test bit ecx of mask
//   0x2552d  jb    0x25542                    ;  bit set -> return true (still al=1)
//   0x2552f  leal  -0x6d703431(%rsi), %ecx   ; ecx = type - 0x6d703431 ("mp41")
//   0x25535  cmpl  $0x2, %ecx                 ; ecx vs 2
//   0x25538  jb    0x25542                    ;  UNSIGNED ecx < 2 -> "mp41"/"mp42" -> true
//   0x2553a  cmpl  $0x71742020, %esi         ; "qt  "
//   0x25540  jne   0x25510                    ;  no match -> return false (al=0)
//   0x25542  popq  %rbp                        ; (fallthrough for "qt  ": al=1)
//   0x25543  retq                              ; return al
//
// The bitmask at 0x2551f (0x80000000000001F) has bits 0..4 and bit 59 set, so
// the accepted (type - 0x69736f32) offsets are {0,1,2,3,4,59}, i.e. the FourCCs
// 0x69736f32.."iso2", "iso3", "iso4", "iso5", "iso6" (offsets 0..4) and
// 0x69736f6d "isom" (offset 59). "mp41"/"mp42" come from the ecx<2 range at
// 0x25535, and "qt  " from the explicit compare at 0x2553a.

/** 100.0 — the percentage scale, `mulsd 0xfc67c(%rip)` @ProCore 0x25ebc, read out of
 *  __TEXT,__const at VA 0x122540 (the displacement is measured from the next instruction). */
const PCATOMBOXFILE_PERCENT_SCALE = 100.0; // @ProCore 0x25ebc

// --- FourCC constants (read big-endian; the raw 32-bit values ARE the compares) ---
const FCC_iso1 = 0x69736f31; // "iso1"  @0x254f0
const FCC_M4A_ = 0x4d344120; // "M4A "  @0x254f8
const FCC_M4V_ = 0x4d345620; // "M4V "  @0x25500
const FCC_avc1 = 0x61766331; // "avc1"  @0x25508
const FCC_iso2 = 0x69736f32; // "iso2"  @0x25514 (subtraction base for the iso range)
const ISO_RANGE_LIMIT = 0x3b; // 59      @0x2551a (unsigned upper bound for the range test)
// bitmask of accepted (type - "iso2") offsets: bits {0,1,2,3,4,59}
const ISO_MASK = 0x80000000000001fn; // @0x2551f movabsq (64-bit; bit 59 set -> bigint)
const FCC_mp41 = 0x6d703431; // "mp41"  @0x2552f (subtraction base for the mp4x range)
const MP4_RANGE_LIMIT = 0x2; // 2       @0x25535 (unsigned upper bound: {mp41,mp42})
const FCC_qt__ = 0x71742020; // "qt  "  @0x2553a

/**
 * PCAtomBoxFile::isValidType(unsigned int)
 * @0x254ea ProCore
 *
 * @param type a big-endian FourCC brand read as a 32-bit unsigned integer.
 * @returns true iff `type` is a brand PCAtomBoxFile accepts.
 */
export function PCAtomBoxFile_isValidType(type: number): boolean {
  // Normalise to unsigned 32-bit exactly as %esi holds it.
  const t = type >>> 0;

  // @0x254f0 cmpl $0x69736f31,%esi ; @0x254f6 jg (SIGNED) type > "iso1" -> upper block.
  // The compare is signed (jg), so compare as signed int32 to match the machine.
  const tSigned = t | 0;
  if (tSigned > (FCC_iso1 | 0)) {
    // --- upper block @0x25514 ---
    // @0x25514 leal -0x69736f32(%rsi),%ecx  ; ecx = type - "iso2" (mod 2^32)
    const ecxIso = (t - FCC_iso2) >>> 0;
    // @0x2551a cmpl $0x3b,%ecx ; @0x2551d ja (UNSIGNED) ecx > 59 -> skip
    if (ecxIso <= ISO_RANGE_LIMIT) {
      // @0x2551f movabsq mask ; @0x25529 btq %rcx,%rdx ; @0x2552d jb -> true
      if ((ISO_MASK >> BigInt(ecxIso)) & 1n) {
        return true;
      }
      // bit not set: fall through to the mp4x range test (0x2552f)
    }
    // @0x2552f leal -0x6d703431(%rsi),%ecx  ; ecx = type - "mp41"
    const ecxMp4 = (t - FCC_mp41) >>> 0;
    // @0x25535 cmpl $0x2,%ecx ; @0x25538 jb (UNSIGNED) ecx < 2 -> "mp41"/"mp42" -> true
    if (ecxMp4 < MP4_RANGE_LIMIT) {
      return true;
    }
    // @0x2553a cmpl $0x71742020,%esi ; @0x25540 jne -> 0x25510 (false)
    if (t !== FCC_qt__) {
      // @0x25510 xorl %eax,%eax -> false
      return false;
    }
    // "qt  " matched: fall through to @0x25542 with al=1
    return true;
  }

  // --- lower block (type <= "iso1" signed) ---
  // @0x254f8 / @0x25500 / @0x25508: exact matches -> true
  if (t === FCC_M4A_) {
    return true;
  }
  if (t === FCC_M4V_) {
    return true;
  }
  if (t === FCC_avc1) {
    return true;
  }
  // @0x25510 xorl %eax,%eax -> false
  return false;
}

// =============================================================================
// PCAtomBoxFile::getErrorCode()  @ProCore 0x24f96  __ZN13PCAtomBoxFile12getErrorCodeEv
// =============================================================================
// Reads the current POSIX `errno` (via libc `___error` @0x24f9a — an OUT-OF-SCOPE
// libc extern, modelled as a boundary below) and maps it to PCAtomBoxFile's own
// negative error-code enum. The `switch (errno)` translation IS the real work and
// is transcribed faithfully; only the errno SOURCE is a boundary.

let __posix_errno = 0;

/** Boundary: emulates the `movl (%rax),%ecx` load of `*___error()` @ProCore 0x24f9f.
 *  Darwin's per-thread errno accessor is libc, outside the 5-framework port scope.
 *  Returns the current process errno (default 0 = no error). A real libc-backed
 *  runtime would replace this with the actual `*___error()` read. */
export function __PCAtomBoxFile_readErrno(): number {
  return __posix_errno | 0;
}

/** Test/runtime hook: set the errno the libc boundary reports before getErrorCode().
 *  Not part of the FCP binary; stands in for the OS setting `errno`. */
export function __PCAtomBoxFile_setErrno(e: number): void {
  __posix_errno = e | 0;
}

/**
 * PCAtomBoxFile::getErrorCode() @ProCore 0x24f96  (__ZN13PCAtomBoxFile12getErrorCodeEv)
 *
 * Disasm:
 *   0x24f9a  callq ___error            ; %rax = &errno   (libc boundary)
 *   0x24f9f  movl  (%rax), %ecx         ; ecx = errno
 *   0x24fa1  cmpl  $0xf, %ecx ; jg A    ; errno > 15 -> block A
 *   0x24fa6  cmpl  $0x4, %ecx ; jg B    ; 4 < errno <= 15 -> block B
 *   -- LOW block (errno <= 4):
 *   0x24fab  cmpl  $0x1 ; je -> -4      ; errno == 1  (EPERM)  -> 0xfffffffc
 *   0x24fb0  movl  $0xfffffffe,%eax     ; preset -2
 *   0x24fb5  cmpl  $0x2 ; jne -> -1     ; errno != 2 -> 0xffffffff (default)
 *   0x24fba  jmp ret                    ; errno == 2  (ENOENT) -> -2
 *   -- block A (errno > 15) @0x24fbc:
 *   0x24fbc  leal -0x1b(%rcx),%eax ; cmpl $0x2,%eax ; jb -> -3   ; errno in {27,28} -> 0xfffffffd
 *   0x24fc4  cmpl $0x10 ; je -> -6      ; errno == 16 (EBUSY)  -> 0xfffffffa
 *   0x24fc9  cmpl $0x1e ; jne -> -1     ; errno != 30 -> default
 *   0x24fce  movl $0xfffffff9,%eax      ; errno == 30 (EROFS) -> -7
 *   -- block B (5..15) @0x24fd5:
 *   0x24fd5  cmpl $0x5 ; je -> -5       ; errno == 5  (EIO)    -> 0xfffffffb
 *   0x24fda  cmpl $0xd ; jne -> -1      ; errno != 13 -> default
 *            (errno == 13 EACCES falls to the shared -4 target @0x24fdf) -> 0xfffffffc
 *   -- shared targets @0x24fdf..0x24ffb: -4 / -3 / -5 / -6 / -1
 *
 * Returns a signed 32-bit int (the negative PCAtomBoxFile error enum).
 */
export function PCAtomBoxFile_getErrorCode(): number {
  // @0x24f9a callq ___error ; @0x24f9f movl (%rax),%ecx  (libc boundary read)
  const ecx = __PCAtomBoxFile_readErrno() | 0;

  // @0x24fa1 cmpl $0xf,%ecx ; jg -> block A  (signed compare)
  if (ecx > 0xf) {
    // block A @0x24fbc
    // @0x24fbc leal -0x1b(%rcx),%eax ; cmpl $0x2,%eax ; jb -3   ((errno-27) unsigned < 2)
    const eax = (ecx - 0x1b) >>> 0;
    if (eax < 2) return -3 | 0; // 0xfffffffd (errno 27/28: EFBIG/ENOSPC)
    // @0x24fc4 cmpl $0x10 ; je -6
    if (ecx === 0x10) return -6 | 0; // 0xfffffffa (errno 16 EBUSY)
    // @0x24fc9 cmpl $0x1e ; jne default
    if (ecx !== 0x1e) return -1 | 0; // 0xffffffff
    // @0x24fce errno == 30 (EROFS)
    return -7 | 0; // 0xfffffff9
  }

  // @0x24fa6 cmpl $0x4,%ecx ; jg -> block B  (signed compare)
  if (ecx > 0x4) {
    // block B @0x24fd5 (errno in 5..15)
    // @0x24fd5 cmpl $0x5 ; je -5
    if (ecx === 0x5) return -5 | 0; // 0xfffffffb (errno 5 EIO)
    // @0x24fda cmpl $0xd ; jne default
    if (ecx !== 0xd) return -1 | 0; // 0xffffffff
    // errno == 13 (EACCES) -> shared -4 target @0x24fdf
    return -4 | 0; // 0xfffffffc
  }

  // LOW block (errno <= 4)
  // @0x24fab cmpl $0x1 ; je -4
  if (ecx === 0x1) return -4 | 0; // 0xfffffffc (errno 1 EPERM)
  // @0x24fb0 movl $0xfffffffe,%eax (preset -2) ; @0x24fb5 cmpl $0x2 ; jne default
  if (ecx !== 0x2) return -1 | 0; // 0xffffffff
  // errno == 2 (ENOENT) -> -2
  return -2 | 0; // 0xfffffffe
}

// =============================================================================
// PCAtomBoxFile::getTopAtomBox()  @ProCore 0x24dfa  __ZN13PCAtomBoxFile13getTopAtomBoxEv
// =============================================================================
// PCAtomBoxFile — the container-file reader. Its top-level atom box is embedded
// at offset +0x00, so `getTopAtomBox()` returns the `this` pointer unchanged
// (the file object IS-A / begins-with a PCAtomBox). The embedded box's own
// fields (offset, dataStart, children, ...) are ported in PCAtomBox.ts; here we
// model only that the top box coincides with `this` and return it, which is the
// exact semantics of the single `movq %rdi,%rax` instruction. Returning `this`
// (typed as PCAtomBoxFile, whose +0x00 IS the PCAtomBox) avoids inventing a
// phantom field and matches the machine's pointer identity.
//
// Source disasm: raw-port/re/disasm/ProCore.__ZN13PCAtomBoxFile13getTopAtomBoxEv.s (7 lines)
export class PCAtomBoxFile {
  /**
   * PCAtomBoxFile::getTopAtomBox()
   * @0x24dfa ProCore  (__ZN13PCAtomBoxFile13getTopAtomBoxEv)
   *
   * DECODE (raw-port/re/disasm/ProCore.__ZN13PCAtomBoxFile13getTopAtomBoxEv.s):
   *   0x24dfa  pushq %rbp ; movq %rsp,%rbp     ; frame
   *   0x24dfe  movq  %rdi, %rax                ; rax = this  (top atom box lives at +0x00)
   *   0x24e01  popq %rbp ; retq                ; return this  (== &topAtomBox at +0x00)
   *
   * Returns the address of the file's embedded top-level PCAtomBox, which — as
   * the first member at +0x00 — coincides with the PCAtomBoxFile `this` pointer.
   * Zero callees, no externs.
   */
  getTopAtomBox(): PCAtomBoxFile {
    // @0x24dfe movq %rdi,%rax : the top atom box is at +0x00, i.e. `this` itself.
    return this;
  }

  // ===========================================================================
  // PCAtomBoxFile::closeOutputFile()  @ProCore 0x24d64
  //   __ZN13PCAtomBoxFile15closeOutputFileEv
  // ===========================================================================
  // Tears down the file's OUTPUT side: if a stdio output stream handle is open
  // (FILE* at +0x50) it is `fclose`d and the field nulled; if an output
  // scratch buffer was heap-allocated with `operator new[]` (pointer at +0x58)
  // it is released with `operator delete[]` and the field nulled. Both callees
  // are TRUE OUT-OF-SCOPE externs — libc `_fclose` (@0xde864, the stdio stub)
  // and the C++ runtime `operator delete[]` (__ZdaPv @0xde6ba). Neither lives
  // in the 5-framework port scope, so each is modelled as a NO-OP boundary below
  // (both are lifetime primitives whose return values the machine discards, and
  // a JS GC owns the surrogates); the REAL WORK — the two null-guarded
  // release-then-null sequences — is transcribed verbatim and RUNS.
  //
  // Source disasm: raw-port/re/disasm/ProCore.__ZN13PCAtomBoxFile15closeOutputFileEv.s (20 lines)
  //
  // FULL DISASM (@ProCore 0x24d64):
  //   0x24d64  pushq %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax  ; frame
  //   0x24d6a  movq  %rdi, %rbx                 ; rbx = this
  //   0x24d6d  movq  0x50(%rdi), %rdi           ; rdi = this->outputFile (FILE*)
  //   0x24d71  testq %rdi, %rdi                 ; if (outputFile == null)
  //   0x24d74  je    0x24d83                     ;   skip fclose
  //   0x24d76  callq _fclose                     ; fclose(outputFile)          (libc extern)
  //   0x24d7b  movq  $0x0, 0x50(%rbx)            ; this->outputFile = null
  //   0x24d83  movq  0x58(%rbx), %rdi            ; rdi = this->outputBuffer (new[]'d ptr)
  //   0x24d87  testq %rdi, %rdi                 ; if (outputBuffer == null)
  //   0x24d8a  je    0x24d99                     ;   skip delete[]
  //   0x24d8c  callq __ZdaPv                      ; operator delete[](outputBuffer) (C++ rt extern)
  //   0x24d91  movq  $0x0, 0x58(%rbx)            ; this->outputBuffer = null
  //   0x24d99  addq $0x8,%rsp ; popq %rbx ; popq %rbp ; retq            ; return void

  /** Boundary: libc `fclose` — stdio stub called @ProCore 0x24d76 (_fclose @0xde864).
   *  Out-of-scope OS/libc, and a LIFETIME/OWNERSHIP primitive: the machine
   *  DISCARDS its return value (nothing reads %eax after the call at 0x24d76 —
   *  the next instruction is the `movq $0x0, 0x50(%rbx)` store), so the only
   *  observable effect of the call inside this function is that the stream is
   *  released. A JS runtime owns the surrogate handle through GC, so the
   *  faithful boundary model is a NO-OP and the caller's nulling store runs.
   *  Same policy as the landed `__ZdaPv` boundary in
   *  raw-port/src/infra/PCGenBlockRef.ts and the stated policy in
   *  raw-port/src/infra/PCCFRef_CFArray.ts. */
  private __fclose(_file: object | null): void {
    // @ProCore 0x24d76 callq 0xde864 ## symbol stub for: _fclose — no-op boundary.
  }

  /** Boundary: C++ runtime `operator delete[]` — __ZdaPv called @ProCore 0x24d8c
   *  (@0xde6ba). Out-of-scope C++ runtime, and a LIFETIME/OWNERSHIP primitive:
   *  its return type is void and the next instruction is the
   *  `movq $0x0, 0x58(%rbx)` store, so releasing the array is its whole effect.
   *  In a GC runtime that is a NO-OP — dropping the reference in the caller is
   *  what makes the buffer unreachable — which is exactly how the landed
   *  raw-port/src/infra/PCGenBlockRef.ts models this same stub address. */
  private __operatorDeleteArray(_ptr: object | null): void {
    // @ProCore 0x24d8c callq 0xde6ba ## symbol stub for: __ZdaPv — no-op boundary.
  }

  /**
   * PCAtomBoxFile::closeOutputFile()
   * @0x24d64 ProCore  (__ZN13PCAtomBoxFile15closeOutputFileEv)
   *
   * Closes the output FILE* (+0x50) and frees the output buffer (+0x58), nulling
   * each field, both under a null-guard. Returns void.
   *
   * DIFFERENTIAL EVIDENCE (against the live ProCore binary, not a restatement):
   * raw-port/re/oracle/PCAtomBoxFile_closeOutputFile_oracle.py snapshots a
   * poisoned 0x100-byte receiver arena, sets +0x50 from a real fopen and +0x58
   * from operator new[], calls this symbol at slide + 0x24d64 under
   * `arch -x86_64 /usr/bin/python3` (prologue bytes 55 48 89 e5 53 50 checked
   * first), and byte-diffs the arena. All four open/closed combinations: both
   * qwords become 0, ZERO bytes outside them move, and the TS port agrees 4/4.
   * Controls, evaluated in the same node process: boundaries-that-throw kills
   * 3/4, dropping the 0x24d91 store kills 2/4, inverting both null-guards kills
   * 3/4 (the fourth case has nothing open, so it cannot discriminate).
   */
  closeOutputFile(): void {
    // @0x24d6d movq 0x50(%rdi),%rdi ; @0x24d71 testq %rdi,%rdi ; @0x24d74 je -> skip
    if (this.outputFile !== null) {
      // @0x24d76 callq _fclose  (libc boundary)
      this.__fclose(this.outputFile);
      // @0x24d7b movq $0x0,0x50(%rbx) : this->outputFile = null
      this.outputFile = null;
    }
    // @0x24d83 movq 0x58(%rbx),%rdi ; @0x24d87 testq %rdi,%rdi ; @0x24d8a je -> skip
    if (this.outputBuffer !== null) {
      // @0x24d8c callq __ZdaPv  (operator delete[] boundary)
      this.__operatorDeleteArray(this.outputBuffer);
      // @0x24d91 movq $0x0,0x58(%rbx) : this->outputBuffer = null
      this.outputBuffer = null;
    }
    // @0x24d99 return void
  }

  // ===========================================================================
  // PCAtomBoxFile::cancelWrite()  @ProCore 0x25eca
  //   __ZN13PCAtomBoxFile11cancelWriteEv
  // ===========================================================================
  /**
   * PCAtomBoxFile::cancelWrite()
   * @0x25eca ProCore  (__ZN13PCAtomBoxFile11cancelWriteEv)
   *
   * FULL DISASM (raw-port/re/disasm/ProCore.__ZN13PCAtomBoxFile11cancelWriteEv.s
   * — 7 lines, the whole function):
   *
   *   0x25eca  pushq %rbp                ; frame prologue
   *   0x25ecb  movq  %rsp, %rbp
   *   0x25ece  movl  $0x1, %eax          ; eax = 1 — the value to publish
   *   0x25ed3  xchgl %eax, 0x7c(%rdi)    ; ATOMIC exchange of that 1 into the
   *                                      ;   dword at this+0x7c; the previous
   *                                      ;   value lands in %eax and is DISCARDED
   *   0x25ed6  popq  %rbp                ; frame epilogue
   *   0x25ed7  retq                      ; returns void
   *
   * Sets the file's "write cancelled" flag. `xchg` with a MEMORY operand is
   * implicitly LOCKed on x86 — no `lock` prefix is emitted or needed — which is
   * the tell that +0x7c is an atomic word (`std::atomic<int>` / `atomic<bool>`
   * widened to a dword) and that this is a sequentially-consistent STORE of 1:
   * the exchange's old value is read into %eax and dropped, and %eax is not a
   * return value for a void function. A single-threaded port reproduces that
   * with a plain assignment.
   *
   * UNCONDITIONAL — unlike the same-shaped `OZScene::dirtyLockDependencies()`
   * @Ozone 0x578c0, which gates its `xchgb` on a byte being exactly 1, this one
   * has no guard, no branch and no other memory access at all.
   *
   * The operand size is `movl`/`xchgl`, so the slot is 32 bits wide, not a
   * single byte. Zero callees: no in-scope call, no extern, no indirect or
   * virtual dispatch (`depgraph.py deps __ZN13PCAtomBoxFile11cancelWriteEv`
   * lists nothing).
   *
   * ORACLE: verified against the live ProCore binary. The symbol is EXPORTED
   * (`nm` type `T`), so the harness dlopens ProCore under
   * `arch -x86_64 /usr/bin/python3` (the port is transcribed from the x86_64
   * slice), dlsym's it, and calls it on a 0x200-byte buffer filled with fresh
   * random noise. 1,024 cases, including pre-existing +0x7c values of 0, 1,
   * 0xffffffff and random dwords: in 1024/1024 the dword at +0x7c came back
   * exactly 1 and EVERY other byte of the buffer was unchanged — confirming
   * both the offset and that the write is 4 bytes wide and nothing else moves.
   * Negative controls diverge (measured): storing 0 instead of 1 -> 1024 of
   * 1024 wrong; OR-ing 1 into the old value instead of overwriting -> 523
   * wrong; a 1-byte store that leaves the upper 3 bytes of the old dword ->
   * 523 wrong. (Those two score the same because they differ from a clean
   * store on exactly the cases whose prior +0x7c value had bits outside bit 0.)
   */
  cancelWrite(): void {
    // @0x25ece movl $0x1,%eax ; @0x25ed3 xchgl %eax,0x7c(%rdi):
    //   atomically publish 1 into the u32 at +0x7c, discarding the old value.
    this.writeCancelled_at_0x7c = 1;
    // @0x25ed7 retq — returns void.
  }

  // ===========================================================================
  // PCAtomBoxFile::getWritePercentDone()  @ProCore 0x25e94
  //   __ZN13PCAtomBoxFile19getWritePercentDoneEv
  // ===========================================================================
  // Returns the write progress as a percentage: the byte counter at +0x80 times 100, divided by
  // the total at +0x68. Both operands are 64-bit integers, and THE TWO ARE CONVERTED TO DOUBLE BY
  // DIFFERENT INSTRUCTIONS — the numerator SIGNED, the denominator UNSIGNED — which is the whole
  // content of this unit and the only thing in it that can be got wrong silently.
  //
  // Source disasm: raw-port/re/disasm/ProCore.__ZN13PCAtomBoxFile19getWritePercentDoneEv.s (11 lines)
  //
  // FULL DISASM (@ProCore 0x25e94):
  //   0x25e94  pushq %rbp ; movq %rsp,%rbp
  //   0x25e98  movq     0x80(%rdi), %rax     ; rax = this->writtenBytes  (+0x80)
  //   0x25e9f  cvtsi2sd %rax, %xmm0          ; xmm0 = (double)(int64)rax   <- SIGNED
  //   0x25ea4  movsd    0x68(%rdi), %xmm1    ; xmm1 lanes 0,1 = the two u32 halves of +0x68
  //   0x25ea9  unpcklps 0xfd9c0(%rip), %xmm1 ; xmm1 = [lo, 0x43300000, hi, 0x45300000]
  //   0x25eb0  subpd    0xfd9c8(%rip), %xmm1 ; -= {2^52, 2^84}
  //   0x25eb8  haddpd   %xmm1, %xmm1         ; xmm1 = lane0 + lane1 = (double)(uint64)+0x68
  //   0x25ebc  mulsd    0xfc67c(%rip), %xmm0 ; xmm0 *= 100.0
  //   0x25ec4  divsd    %xmm1, %xmm0         ; xmm0 = xmm0 / xmm1
  //   0x25ec8  popq %rbp ; retq              ; returns the double in %xmm0
  //
  // THE THREE RIP-RELATIVE CONSTANTS, read out of the mapped image rather than guessed (each
  // displacement measured from the NEXT instruction, which is where these addresses come from):
  //   @0x123870  00 00 30 43 | 00 00 30 45   two u32 lanes: 0x43300000, 0x45300000
  //   @0x123880  4503599627370496.0 (2^52), 1.9342813113834067e+25 (2^84)   as two f64
  //   @0x122540  100.0
  //
  // That trio is the textbook exact uint64 -> double conversion, and it is exact by construction:
  // interleaving the low half under exponent 0x433 makes `2^52 + lo`, the high half under 0x453
  // makes `2^84 + hi*2^32`, the `subpd` removes both biases leaving `lo` and `hi*2^32` exactly, and
  // `haddpd` adds them — so the ONLY rounding in the whole conversion is that final add, exactly as
  // a `cvtsi2sd` of an unsigned value would round. The port performs the same three steps in the
  // same order rather than calling a language-level conversion, because the order is what fixes
  // where the rounding happens.
  //
  // WHY THE ASYMMETRY MATTERS: for any value with bit 63 set, the signed numerator is NEGATIVE and
  // the unsigned denominator is not, so a port that converts both the same way agrees with the
  // machine on ordinary inputs and diverges wildly at the top of the range. That is exactly the
  // silent-wrong-answer shape, and it is what the oracle's corpus is built around.
  //
  // NO GUARD ON A ZERO DENOMINATOR: `divsd` by +0.0 yields +/-Infinity and 0/0 yields the x86
  // "indefinite" QNaN. The machine has no check and neither does this port; a JS divide produces
  // the same Infinity, and for 0/0 both sides produce a NaN whose PAYLOAD differs (x86 sets the
  // sign bit, JS canonicalises) — the oracle classifies that case separately rather than hiding it,
  // and it is not a defect this port can fix without rewriting `divsd`.
  //
  // ORACLE: raw-port/re/oracle/PCAtomBoxFile_getWritePercentDone_{oracle.py,driver.mts} — 300 cases
  // over both fields including the sign-bit boundary, values above 2^53, zero denominators and the
  // int64 extremes, compared as raw IEEE-754 bit patterns. Result: 0 REAL divergences, 0 stray
  // bytes in the poisoned receiver, and 1 NaN-payload-only case (the 0/0 denominator, where x86's
  // `divsd` produces the indefinite QNaN with the sign bit set and JS canonicalises — classified,
  // not hidden, and not fixable in a transcription).
  // CONTROLS: reading the denominator SIGNED kills 112 of 300, reading the numerator UNSIGNED
  // kills 109, applying the x100 after the divide kills 51.
  // AND ONE CONTROL KILLED 0, WHICH IS REPORTED HERE RATHER THAN DROPPED because a dead control
  // means either a blind harness or an equivalent mutant, and here it is EQUIVALENT: writing the
  // conversion as `Number(BigInt.asUintN(64, u))` produces the identical double for every one of
  // the 300 cases. That is not luck — `Number()` on a bigint is correctly rounded, and the lane
  // sequence computes two exactly-representable halves and rounds once when it adds them, which is
  // the same correctly-rounded result. The lane form is kept anyway because it is what the
  // instructions do and it documents WHERE the single rounding happens; the equivalence is a
  // measured fact rather than an assumption, and if a future edit moves the rounding, that control
  // starts killing.

  /**
   * `PCAtomBoxFile::getWritePercentDone()` @ProCore 0x25e94
   * (__ZN13PCAtomBoxFile19getWritePercentDoneEv).
   *
   * @returns `(double)(int64)writtenBytes * 100.0 / (double)(uint64)totalBytes`.
   */
  getWritePercentDone(): number {
    // @0x25e98 movq 0x80(%rdi),%rax ; @0x25e9f cvtsi2sd %rax,%xmm0 — SIGNED conversion.
    const xmm0Init = Number(BigInt.asIntN(64, this.writtenBytes_at_0x80));
    // @0x25ea4..@0x25eb8 — the exact uint64 -> double sequence, transcribed lane by lane so the
    // single rounding stays in the same place the machine puts it (the final add).
    const u = BigInt.asUintN(64, this.totalBytes_at_0x68);
    const lo = Number(u & 0xffffffffn);          // lane 0 after subpd: 2^52 + lo, minus 2^52
    const hi = Number(u >> 32n) * 4294967296;    // lane 1 after subpd: 2^84 + hi*2^32, minus 2^84
    // @0x25eb8 haddpd %xmm1,%xmm1 — the one rounding step of the conversion.
    const xmm1 = hi + lo;
    // @0x25ebc mulsd 100.0
    const xmm0 = xmm0Init * PCATOMBOXFILE_PERCENT_SCALE;
    // @0x25ec4 divsd %xmm1,%xmm0 — no zero guard on the machine, none here.
    return xmm0 / xmm1;
    // @0x25ec8/@0x25ec9 — epilogue + retq (the result is in %xmm0).
  }

  /** +0x68 (u64) — the write TOTAL, converted UNSIGNED @0x25ea4..@0x25eb8. Held as a bigint
   *  because a u64 exceeds 2^53 and the unsigned reading is the whole point. */
  totalBytes_at_0x68: bigint = 0n;
  /** +0x80 (i64) — the bytes written so far, converted SIGNED by `cvtsi2sd` @0x25e9f. Held as a
   *  bigint for the same reason, and read as SIGNED because that instruction is. */
  writtenBytes_at_0x80: bigint = 0n;

  /** Output stdio stream handle at struct +0x50 (FILE*); null when not open. */
  outputFile: object | null = null;
  /** Output scratch buffer at struct +0x58 (operator new[]'d); null when unset. */
  outputBuffer: object | null = null;

  /**
   * +0x7c (u32, ATOMIC) — the "write cancelled" flag.
   *
   * Written by `cancelWrite()` @ProCore 0x25ed3 via `xchgl %eax, 0x7c(%rdi)`
   * with %eax = 1. The `l` suffix pins the width at 32 bits, and `xchg` against
   * memory is implicitly LOCKed, so the slot is an atomic word and the
   * instruction is a sequentially-consistent store whose returned old value is
   * discarded.
   *
   * The reader/clearer of this slot is FRONTIER (not decoded here), so the
   * initial 0 below is this file's undecoded-slot default rather than a claim
   * about the real constructor. This port is single-threaded, so the atomicity
   * has no observable counterpart beyond the plain assignment.
   */
  writeCancelled_at_0x7c: number = 0;
}
