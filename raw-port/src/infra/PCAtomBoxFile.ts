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
//
// -----------------------------------------------------------------------------
// SYMBOLS PORTED
// -----------------------------------------------------------------------------
//   * __ZN13PCAtomBoxFile11isValidTypeEj
//       -- PCAtomBoxFile::isValidType(unsigned int)  @ProCore 0x254ea
//   * __ZN13PCAtomBoxFile12getErrorCodeEv
//       -- PCAtomBoxFile::getErrorCode()             @ProCore 0x24f96
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
