// MXF__MXFColorSpace.ts — raw transcription of Flexo `MXF::MXFColorSpace`.
//
// ONE symbol is transcribed in this file: `decodeMatrix()`. Every other member of the class (the
// ctors/dtors, `decodeTransferFunction`, `decodeColorPrimries`, `resetColorSpace`,
// `setToDCPColorSpace`, `isBT709`, `isBT2020`, `copyCustomColorSpace`, `copyColorGammaSxS`,
// `setWithPanasonicXMLData` — the inventory lists 14 for this class) is a SEPARATE ledger unit and
// is deliberately absent: per the one-class-one-file rule each gets ADDED to THIS file when its own
// unit is claimed (G6 add-only). File name follows the landed nested/namespaced precedent in this
// directory — `MXF__FileReader.ts`, `MXF__MXFPartitionEntry.ts`, `MXF__MXFAVCPictureDataDecoder.ts`
// — i.e. `MXF__<Class>` for `MXF::<Class>`.
//
// Provenance (Flexo framework, x86_64 slice of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo):
//
//   @0x1445ec0  MXF::MXFColorSpace::decodeMatrix()
//                 __ZN3MXF13MXFColorSpace12decodeMatrixEv        (inventory: `t`, local)
//
// Disassembly (regenerate with
//   `bash raw-port/tools/disasm.sh --sym __ZN3MXF13MXFColorSpace12decodeMatrixEv Flexo`):
//   raw-port/re/disasm/Flexo.__ZN3MXF13MXFColorSpace12decodeMatrixEv.s
//
// ---------------------------------------------------------------------------
// WHAT IT DOES
// ---------------------------------------------------------------------------
// The object holds an MXF *coding equations* Universal Label at +0x10 — the SMPTE key an MXF file
// carries to say which luma/chroma matrix its Y'CbCr samples were encoded with. This method matches
// that key against FOUR known coding-equation labels IN ORDER and, on the first hit, writes the
// matching matrix code to +0x20 and its display name to +0x40, returning true. No hit writes
// nothing at all and returns false.
//
//   order tested      key global                        code -> +0x20   name -> +0x40
//   1. @0x1445ecd     _kmlBT601CodingEquations                      2    "BT.601"
//   2. @0x1445eef     _kmlBT709CodingEquations                      1    "BT.709"
//   3. @0x1445f11     _kml240MCodingEquations                       3    "ST240"
//   4. @0x1445f33     _kmlITU2020_NCLCodingEquations                6    "BT.2020"
//
// Two further coding-equation labels sit in the SAME array in Flexo's __DATA and are NOT tested
// here — `_kmlYCgCoCodingEquations` @0x1c78210 and `_kmlGBRCodingEquations` @0x1c78220. Their codes
// (4 and 5) are implied by the gap in the sequence, but nothing in this body reads them, so nothing
// about them is modelled: a YCgCo or GBR file falls out of this method as `false`.
//
// The four comparisons are a straight chain: each `je` @0x1445edb / @0x1445efd / @0x1445f1f /
// @0x1445f41 skips to the NEXT comparison, and each hit does `movl $<code>,%eax ; leaq <cfstring>`
// and jumps to the single shared store @0x1445f4f. The `movb $0x1,%al` @0x1445f56 is the `true`;
// the fall-through @0x1445f5f is `xorl %eax,%eax`, i.e. `false` with NO store performed.
//
// CORROBORATION — the same body appears TWICE in Flexo. `MXF::MXFColorSpace::resetColorSpace`
// @0x1446050 inlines this exact decision (@0x14460df-@0x144616b): same four keys, same order, same
// codes 2/1/3/6, same stores to +0x40 then +0x20, discarding the boolean. Two independent copies of
// the same instruction sequence is why the code/name table below is transcription rather than
// reading.
//
// ---------------------------------------------------------------------------
// STRUCT LAYOUT (PORTING_SPEC Rule 5) — only what THIS body touches is modelled
// ---------------------------------------------------------------------------
//   +0x10  MXF::MXKey16*  the coding-equations label. Loaded fresh before EVERY comparison
//                         (@0x1445ec9, @0x1445eeb, @0x1445f0d, @0x1445f2f) and passed as the
//                         `MXKey16 const&` argument.
//   +0x20  int32          the matrix code (`movl %eax,0x20(%rbx)` @0x1445f53).
//   +0x40  CFStringRef    the matrix display name (`movq %rcx,0x40(%rbx)` @0x1445f4f).
//
// Recovered from siblings but NOT modelled here, because no instruction in this body touches them
// (naming bytes a decoded body never reads is what Rule 5 forbids): +0x00 is the colour-primaries
// label and +0x38 its name (`decodeColorPrimries` @0x1445c50 reads +0x00 and stores to +0x38), and
// +0x08 is the transfer-function label (`resetColorSpace` @0x144606c). All three label fields are
// refcounted objects — `resetColorSpace` releases the old one through vtable slot +0x8 and clones
// the new one through slot +0x20 before storing it.
//
// ---------------------------------------------------------------------------
// FRONTIER CALLEE — one, and it is OUT OF SCOPE
// ---------------------------------------------------------------------------
//   * MXF::operator==(MXF::MXKey16 const&, unsigned long long const*)
//       __ZN3MXFeqERKNS_7MXKey16EPKy — `U` (undefined) in Flexo, reached through the symbol stub
//       @0x1496a50 from @0x1445ed4, @0x1445ef6, @0x1445f18 and @0x1445f3a. It is DEFINED in
//       MXFExportSDK.framework @0x63070 (`otool -L` on Flexo lists
//       `@rpath/MXFExportSDK.framework/Versions/A/MXFExportSDK`), which is OUTSIDE the five in-scope
//       frameworks (Ozone/Flexo/Helium/ProCore/ProChannel) — a TRUE out-of-scope extern, and the
//       landed `MXF__MXFAVCPictureDataDecoder.ts` models this same framework's callees the same way.
//       It is VALUE-PRODUCING and its result selects the branch, so it throws (PORTING_SPEC Rule 3
//       and the RESOLVED extern-boundary ruling); transcribing another framework's function into
//       this class file would breach the scope boundary and Rule 6.
//
//       Its ten instructions are documented at the stub below — decoded, like the AVC decoder's
//       externs, so the oracle can be read, NOT so that anyone implements it here.
//
// ---------------------------------------------------------------------------
// ORACLE — the live Flexo binary, called BY ADDRESS
//   raw-port/re/oracle/MXF__MXFColorSpace_decodeMatrix_oracle.py
// ---------------------------------------------------------------------------
// Every path of this body enters the out-of-scope extern before it computes anything, so there is
// no TS-side value to put next to a binary-side value: a TS↔binary differential is not available
// here, and saying otherwise would be the "an oracle that never runs the port" shape. What CAN be
// measured, and is, is the transcription's CONTENT — the four (key, code, name) triples, the two
// store offsets, the order, and both return values — by running the real function on a synthetic
// object and reading back what it wrote:
//
//   * the symbol is LOCAL (`t`), so the harness calls it at slide+0x1445ec0 under
//     `arch -x86_64 /usr/bin/python3` after the depth-first @rpath preload, and refuses to run
//     unless the process is x86_64 AND the bytes at the target match the transcribed prologue
//     (OPS_LOG: an address call against the arm64 slice lands in unrelated code).
//   * `this` is a poisoned 0x48-byte arena (0xCD) whose +0x10 points at a synthetic MXKey16 whose
//     two payload words are copied from one of the six live key globals; the arena is byte-diffed
//     afterwards, so a store this file does not model would be caught.
//   * 6 known coding-equation keys + 8 near-miss keys (one payload word of a real key flipped)
//     + 2 degenerate keys (all-zero, all-ones) = 16 cases.
//     MEASURED (live, Flexo slide 0x1255a6000): BT.601 -> (true, 2, "BT.601"),
//     BT.709 -> (true, 1, "BT.709"), 240M -> (true, 3, "ST240"),
//     ITU2020_NCL -> (true, 6, "BT.2020"); YCgCo, GBR, all 8 near misses and both degenerate keys
//     -> (false, arena untouched). On the four hits the ONLY bytes that changed in the poisoned
//     arena were +0x20 and +0x40.
//   * NEGATIVE CONTROLS, scored against those same live answers: swapping the BT.601/BT.709 codes
//     (2<->1) disagrees on 2 of 16; claiming this body also matches YCgCo/GBR disagrees on 2;
//     dropping the "a miss stores nothing" rule disagrees on all 12 misses. The ORDER of the chain
//     is NOT observable — the four labels are pairwise distinct, so no input can match two — and
//     the harness says so rather than reporting order as verified.
//
// ---------------------------------------------------------------------------
// THE KEY CONSTANTS — read out of Flexo's __DATA, not transliterated from a spec
// ---------------------------------------------------------------------------
// Each label is 16 bytes at the address below, and the extern reads it as TWO little-endian
// `unsigned long long`s (its parameter type is `unsigned long long const*`), so that is how they
// are held here. The SMPTE UL byte string is the big-endian rendering of `lo` then `hi` — e.g.
// BT.601 = 06 0e 2b 34 04 01 01 01 04 01 01 01 02 01 00 00 — which is what makes these six
// self-corroborating: they differ only in the byte the standard varies (0x01..0x06).

/**
 * `MXF::MXKey16` — a 16-byte SMPTE Universal Label, out of port scope (MXFExportSDK). This body
 * never reads its bytes; it only passes the pointer at +0x10 to the extern. The payload words are
 * named because the extern's decoded body reads them at +0x10/+0x18 of the object (see the stub),
 * which is what the oracle's synthetic key has to reproduce.
 */
export interface MXKey16 {
  /** +0x10 — the first eight label bytes, as one little-endian u64. */
  readonly word0: bigint;
  /** +0x18 — the last eight label bytes, as one little-endian u64. */
  readonly word1: bigint;
}

/** `CFStringRef` — CoreFoundation opaque handle. Out of port scope; the body only moves the
 *  pointer into +0x40, it never inspects the string. */
export interface CFStringRef {
  readonly __cfStringRef: unique symbol;
}

/** A coding-equations label constant in Flexo's `__DATA`, as the two `unsigned long long`s the
 *  extern compares. */
export interface CodingEquationsLabel {
  /** Flexo virtual address of the 16-byte constant. */
  readonly addr: number;
  readonly word0: bigint;
  readonly word1: bigint;
}

/** `_kmlBT601CodingEquations` @Flexo 0x1c781e0 — UL 06.0e.2b.34.04.01.01.01.04.01.01.01.02.01.00.00 */
const kmlBT601CodingEquations: CodingEquationsLabel = {
  addr: 0x1c781e0, // @Flexo 0x1c781e0 (leaq @0x1445ecd)
  word0: 0x060e2b3404010101n, // @Flexo 0x1c781e0
  word1: 0x0401010102010000n, // @Flexo 0x1c781e8
};

/** `_kmlBT709CodingEquations` @Flexo 0x1c781f0 — UL 06.0e.2b.34.04.01.01.01.04.01.01.01.02.02.00.00 */
const kmlBT709CodingEquations: CodingEquationsLabel = {
  addr: 0x1c781f0, // @Flexo 0x1c781f0 (leaq @0x1445eef)
  word0: 0x060e2b3404010101n, // @Flexo 0x1c781f0
  word1: 0x0401010102020000n, // @Flexo 0x1c781f8
};

/** `_kml240MCodingEquations` @Flexo 0x1c78200 — UL 06.0e.2b.34.04.01.01.06.04.01.01.01.02.03.00.00 */
const kml240MCodingEquations: CodingEquationsLabel = {
  addr: 0x1c78200, // @Flexo 0x1c78200 (leaq @0x1445f11)
  word0: 0x060e2b3404010106n, // @Flexo 0x1c78200
  word1: 0x0401010102030000n, // @Flexo 0x1c78208
};

/** `_kmlITU2020_NCLCodingEquations` @Flexo 0x1c78230 — UL 06.0e.2b.34.04.01.01.0d.04.01.01.01.02.06.00.00 */
const kmlITU2020_NCLCodingEquations: CodingEquationsLabel = {
  addr: 0x1c78230, // @Flexo 0x1c78230 (leaq @0x1445f33)
  word0: 0x060e2b340401010dn, // @Flexo 0x1c78230
  word1: 0x0401010102060000n, // @Flexo 0x1c78238
};

// The matrix codes. Each is the `movl $<imm>,%eax` immediately before the shared store, so each
// cites the instruction it was read from rather than a colour-science table.
/** `movl $0x2,%eax` @Flexo 0x1445edd — the BT.601 matrix code. */
const kMatrixCodeBT601 = 2; // @Flexo 0x1445edd
/** `movl $0x1,%eax` @Flexo 0x1445eff — the BT.709 matrix code. */
const kMatrixCodeBT709 = 1; // @Flexo 0x1445eff
/** `movl $0x3,%eax` @Flexo 0x1445f21 — the SMPTE 240M matrix code. */
const kMatrixCode240M = 3; // @Flexo 0x1445f21
/** `movl $0x6,%eax` @Flexo 0x1445f43 — the ITU-R BT.2020 non-constant-luminance matrix code. */
const kMatrixCodeITU2020NCL = 6; // @Flexo 0x1445f43

// The display names. `otool` renders each operand as @"bad cfstring ref" — it does not follow the
// chained pointer inside a `__DATA_CONST,__cfstring` record — so each was decoded from the slice:
// the record's data pointer (chained-fixup encoded, low 36 bits) plus its length field.
/** `__DATA_CONST,__cfstring` @Flexo 0x19e7708 -> `__TEXT,__cstring` @0x16a153a, 6 bytes
 *  (`leaq` @0x1445ee2). */
const kNameBT601 = "BT.601" as unknown as CFStringRef; // @Flexo 0x19e7708
/** `__DATA_CONST,__cfstring` @Flexo 0x19e66a8 -> `__TEXT,__cstring` @0x169fec3, 6 bytes
 *  (`leaq` @0x1445f04). */
const kNameBT709 = "BT.709" as unknown as CFStringRef; // @Flexo 0x19e66a8
/** `__DATA_CONST,__cfstring` @Flexo 0x19e7428 -> `__TEXT,__cstring` @0x16a1409, 5 bytes
 *  (`leaq` @0x1445f26). */
const kName240M = "ST240" as unknown as CFStringRef; // @Flexo 0x19e7428
/** `__DATA_CONST,__cfstring` @Flexo 0x19e6688 -> `__TEXT,__cstring` @0x169febb, 7 bytes
 *  (`leaq` @0x1445f48). */
const kNameITU2020NCL = "BT.2020" as unknown as CFStringRef; // @Flexo 0x19e6688

/**
 * `bool MXF::operator==(MXF::MXKey16 const&, unsigned long long const*)` — MXFExportSDK extern,
 * out of scope. Entered through the Flexo symbol stub @0x1496a50, called @Flexo 0x1445ed4,
 * 0x1445ef6, 0x1445f18 and 0x1445f3a. VALUE-PRODUCING: `testb %al,%al` on its result selects every
 * branch in this method, so it throws rather than answering.
 *
 * Decoded (MXFExportSDK @0x63070, ten instructions) purely to document the boundary and to let the
 * oracle build a synthetic key:
 *
 *     0x63074  movq 0x8(%rsi), %rax     ; rhs[1]
 *     0x63078  cmpq 0x18(%rdi), %rax    ; against lhs+0x18
 *     0x6307c  jne  0x6308a             ; -> xorl %eax,%eax (false)
 *     0x6307e  movq (%rsi), %rax        ; rhs[0]
 *     0x63081  cmpq 0x10(%rdi), %rax    ; against lhs+0x10
 *     0x63085  sete %al                 ; true iff both words are equal
 *
 * i.e. the label's 16 payload bytes live at +0x10/+0x18 of the MXKey16 object, and the comparison
 * is exact equality of the two words. Documented, NOT implemented: it belongs to MXFExportSDK.
 */
function MXF_operator_eq(_lhs: MXKey16, _rhs: CodingEquationsLabel): boolean {
  throw new Error(
    "MXF::operator==(MXKey16 const&, unsigned long long const*) — MXFExportSDK extern " +
      "(defined @MXFExportSDK 0x63070), out-of-scope; entered via Flexo symbol stub 0x1496a50 " +
      "(called @Flexo 0x1445ed4, 0x1445ef6, 0x1445f18, 0x1445f3a). Its result selects every branch " +
      "in decodeMatrix and cannot be fabricated.",
  );
}

/**
 * `MXF::MXFColorSpace` — Flexo. Only the three fields `decodeMatrix` touches are modelled; see the
 * STRUCT LAYOUT note above for the ones its siblings use.
 */
export class MXFColorSpace {
  /** +0x10 — the coding-equations Universal Label (`movq 0x10(%rdi),%rdi` @0x1445ec9). */
  codingEquations: MXKey16 | null = null;

  /** +0x20 — the decoded matrix code (`movl %eax,0x20(%rbx)` @0x1445f53). */
  matrixCode = 0;

  /** +0x40 — the decoded matrix display name (`movq %rcx,0x40(%rbx)` @0x1445f4f). */
  matrixName: CFStringRef | null = null;

  /**
   * `MXF::MXFColorSpace::decodeMatrix()` @Flexo 0x1445ec0
   * (`__ZN3MXF13MXFColorSpace12decodeMatrixEv`).
   *
   * Returns true when the object's coding-equations label matched one of the four known labels —
   * in which case, and ONLY in which case, +0x20 and +0x40 have been written.
   */
  decodeMatrix(): boolean {
    let code: number;
    let name: CFStringRef;

    // @0x1445ec9  movq 0x10(%rdi),%rdi ; @0x1445ecd leaq _kmlBT601CodingEquations(%rip),%rsi ;
    // @0x1445ed4  callq stub 0x1496a50 ; @0x1445eda testb %al,%al ; @0x1445edb je 0x1445eeb
    if (MXF_operator_eq(this.codingEquations!, kmlBT601CodingEquations)) {
      code = kMatrixCodeBT601; // @0x1445edd  movl $0x2,%eax
      name = kNameBT601; // @0x1445ee2  leaq (the "BT.601" cfstring),%rcx
      // @0x1445ee9  jmp 0x1445f4f — the shared store below.
    } else if (
      // @0x1445eeb  movq 0x10(%rbx),%rdi — the field is RE-LOADED for every comparison.
      // @0x1445eef  leaq _kmlBT709CodingEquations(%rip),%rsi ; @0x1445ef6 callq stub 0x1496a50
      // @0x1445efd  je 0x1445f0d
      MXF_operator_eq(this.codingEquations!, kmlBT709CodingEquations)
    ) {
      code = kMatrixCodeBT709; // @0x1445eff  movl $0x1,%eax
      name = kNameBT709; // @0x1445f04  leaq (the "BT.709" cfstring),%rcx
    } else if (
      // @0x1445f0d  movq 0x10(%rbx),%rdi ; @0x1445f11 leaq _kml240MCodingEquations(%rip),%rsi
      // @0x1445f18  callq stub 0x1496a50 ; @0x1445f1f je 0x1445f2f
      MXF_operator_eq(this.codingEquations!, kml240MCodingEquations)
    ) {
      code = kMatrixCode240M; // @0x1445f21  movl $0x3,%eax
      name = kName240M; // @0x1445f26  leaq (the "ST240" cfstring),%rcx
    } else if (
      // @0x1445f2f  movq 0x10(%rbx),%rdi ; @0x1445f33 leaq _kmlITU2020_NCLCodingEquations(%rip),%rsi
      // @0x1445f3a  callq stub 0x1496a50 ; @0x1445f41 je 0x1445f5f — the ONLY exit that skips the
      //             store entirely.
      MXF_operator_eq(this.codingEquations!, kmlITU2020_NCLCodingEquations)
    ) {
      code = kMatrixCodeITU2020NCL; // @0x1445f43  movl $0x6,%eax
      name = kNameITU2020NCL; // @0x1445f48  leaq (the "BT.2020" cfstring),%rcx
    } else {
      // @0x1445f5f  xorl %eax,%eax ; retq — nothing is stored on this path.
      return false;
    }

    // @0x1445f4f  movq %rcx,0x40(%rbx) — the name is stored FIRST.
    this.matrixName = name;
    // @0x1445f53  movl %eax,0x20(%rbx) — then the 32-bit code.
    this.matrixCode = code;
    // @0x1445f56  movb $0x1,%al
    return true;
  }
}
