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
//
// -----------------------------------------------------------------------------
// SYMBOL PORTED
// -----------------------------------------------------------------------------
//   * __ZN13PCAtomBoxFile11isValidTypeEj
//       -- PCAtomBoxFile::isValidType(unsigned int)  @ProCore 0x254ea
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
