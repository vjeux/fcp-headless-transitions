// MXF__MXFAVCPictureDataDecoder.ts — raw transcription of Flexo
// `MXF::MXFAVCPictureDataDecoder`.
//
// Flexo's MXF (SMPTE 377M) AVC picture-essence decoder. NESTED IN A NAMESPACE,
// so the file name joins with the DOUBLE underscore per PORTING_SPEC.md
// (`MXF::MXFAVCPictureDataDecoder` -> `MXF__MXFAVCPictureDataDecoder.ts`;
// precedent on main: MXF__MXFPartitionData.ts).
//
// Provenance (Flexo framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// Symbol ported in this file — ONE method:
//   @0x1434bc0  MXF::MXFAVCPictureDataDecoder::avcCodec(MXF::MXPictureDescriptor const*,
//                 unsigned char, unsigned char, unsigned int,
//                 unsigned char, unsigned char, unsigned char)
//               __ZN3MXF24MXFAVCPictureDataDecoder8avcCodecEPKNS_19MXPictureDescriptorEhhjhhh
//
// Source disassembly (re-derived from the binary in this worktree with
// `raw-port/tools/disasm.sh --sym __ZN3MXF24MXFAVCPictureDataDecoder8avcCodecEPKNS_19MXPictureDescriptorEhhjhhh Flexo`):
//   raw-port/re/disasm/Flexo.__ZN3MXF24MXFAVCPictureDataDecoder8avcCodecEPKNS_19MXPictureDescriptorEhhjhhh.s
//   (104 lines)
//
// Every other member of the class is a SEPARATE ledger unit and is NOT ported
// here; this file is ADD-ONLY for them.
//
// ---------------------------------------------------------------------------
// WHAT IT DOES
// ---------------------------------------------------------------------------
// Given a picture descriptor plus six AVC coding parameters, it linearly scans a
// 453-entry decision table and returns the FIRST matching codec id, or 0x294
// (660) when nothing matches. The six parameters are, from their table columns:
// profile_idc (100 High / 122 High 4:2:2 / 44 CAVLC 4:4:4), level_idc (32..61,
// i.e. level x10), the bit rate, a 1-or-2 kind selector, and two further
// discriminators that the table may wildcard with 0.
//
// ---------------------------------------------------------------------------
// FRONTIER CALLEES — all three live in MXFExportSDK.framework, which is OUTSIDE
// the five in-scope frameworks (Ozone/Flexo/Helium/ProCore/ProChannel), i.e.
// TRUE out-of-scope externs. Each is `U` (undefined) in Flexo and reached
// through a symbol stub; each is modelled below as a boundary stub that throws
// citing the Flexo call-site @0xADDR, per PORTING_SPEC.md Rule 3.
//   * MXF::MXKLV::getItemSimpleType(unsigned long long const*)
//       call @0x1434c16 via stub 0x149714c   (defined @MXFExportSDK 0x4ccb0)
//   * MXF::MXPictureDescriptor::getDisplayFrameHeight()
//       call @0x1434c70 via stub 0x1497116   (defined @MXFExportSDK 0x53850)
//   * CTMRatioIdentical(CTMRatio, CTMRatio)
//       call @0x1434c86 via stub 0x14952f2   (defined @MXFExportSDK 0x2511c)
// Their decoded behaviour is DOCUMENTED at each stub (it is what the oracle
// below drives live) but deliberately NOT implemented here: transcribing
// another framework's functions into this class file would breach both the
// scope boundary and PORTING_SPEC Rule 6.
//
// ---------------------------------------------------------------------------
// THE TABLE — `MXFAVCTable` @Flexo 0x1c921c0
// ---------------------------------------------------------------------------
// `nm` reports `__ZL11MXFAVCTable` as class `b`: it lives in __BSS, so it is ALL
// ZEROES in the file image and is filled by Flexo's static initialisers at load
// time. The values below were therefore read out of a LOADED Flexo image rather
// than the file, by `raw-port/re/oracle/MXF__MXFAVCPictureDataDecoder_MXFAVCTable_dump.py`
// (dlopen of Flexo outside the app bundle via the depth-first @rpath preload
// documented in OPS_LOG 2026-08-10, under `arch -x86_64 /usr/bin/python3`).
// Reproducibility, which is what makes this grounded rather than invented:
//   * 453 entries = exactly the loop bound the code itself uses
//     (index register runs 0x1c -> 0x38bc step 0x20 @0x1434c3b/0x1434c50/0x1434c54).
//   * the 14,496 dumped bytes hash to
//     sha256 7ce034fd9aa9de8309aefd280acc52dc74821932c76269c288a267f3e2c6ef61,
//     identical across two independent processes (different ASLR slides).
//   * the decoded columns are self-corroborating: widths {1280,1920,2048,3840,
//     4096}, H.264 profile_idc {44,100,122} and level_idc {32,40,41,42,50,51,52,61},
//     frame rates as exact CTMRatio pairs (25/1, 24000/1001, 30000/1001, ...).
// Re-run that script to re-derive every literal below.
//
// ENTRY LAYOUT (0x20 bytes; offsets are those the loop actually reads — the
// scan keeps its cursor 0x1c bytes past the entry base, hence the negative
// displacements in the disassembly):
//   +0x00 u32  storedWidth      cmpl  0x74(%r12)                        @0x1434c66
//   +0x04 u32  displayHeight    cmpl  vs getDisplayFrameHeight()        @0x1434c75
//   +0x08 u64  frameRate        CTMRatio BY VALUE -> CTMRatioIdentical  @0x1434c86
//   +0x10 u32  bitRate          cmpl  vs the u32 argument               @0x1434ca0
//   +0x14 u8   profileIdc       cmpb  vs arg1                           @0x1434c8f
//   +0x15 u8   levelIdc         cmpb  vs arg2                           @0x1434c96
//   +0x16 u8   componentDepth   0 = wildcard                            @0x1434cb2
//   +0x17 u8   isKind1          cmpb  vs (arg4 == 1)                    @0x1434cab
//   +0x18 u8   arg5             0 = wildcard                            @0x1434cb8
//   +0x19 u8   arg6             0 = wildcard                            @0x1434cc9
//   +0x1a..+0x1b                 padding — no instruction reads them
//   +0x1c u32  codec            the value returned on a match           @0x1434d0d
//
// ---------------------------------------------------------------------------
// FULL DISASM — avcCodec @0x1434bc0 (104 lines; prologue/epilogue elided)
// ---------------------------------------------------------------------------
//   0x1434bd1  movl %r9d, %r13d            ; r13 = arg4
//   0x1434bd4  movl %ecx, %r14d            ; r14 = arg2
//   0x1434bd7  testl %edx, %edx ; sete %al ; al = (arg1 == 0)
//   0x1434bdc  testl %ecx, %ecx ; sete %cl ; cl = (arg2 == 0)
//   0x1434be1  orb  %al, %cl
//   0x1434be3  testl %r8d, %r8d ; sete %al ; al = (arg3 == 0)
//   0x1434be9  orb  %cl, %al
//   0x1434beb  leal -0x3(%r13), %ecx       ; ecx = arg4 - 3
//   0x1434bef  cmpb $-0x2, %cl ; setb %cl  ; cl = (u8)(arg4-3) < 0xfe  [UNSIGNED]
//   0x1434bf5  orb  %al, %cl
//   0x1434bf7  movl $0x294, %eax           ; the not-found answer, preloaded
//   0x1434bfc  jne  0x1434d19              ; any of the four -> return 0x294
//   0x1434c0b  movq 0x20(%rsi), %rdi       ; rdi = desc->klv
//   0x1434c0f  movq kmiComponentDepth(%rip), %rsi ; rsi = &kmiComponentDepth (key)
//   0x1434c16  callq stub 0x149714c        ; rax = klv->getItemSimpleType(&key)
//   0x1434c1b  testq %rax, %rax ; je 0x1434c2c
//   0x1434c23  movzbl 0x10(%rax), %eax     ; componentDepth = item->+0x10 (u8)
//   0x1434c2c  movl $0x0, -0x30(%rbp)      ;   ... or 0 when the item is absent
//   0x1434c33  cmpb $0x1, %r13b ; sete -0x29(%rbp) ; isKind1 = (arg4 == 1)
//   0x1434c3b  movl $0x1c, %r13d           ; cursor = table + 0x1c
//   0x1434c41  leaq MXFAVCTable(%rip), %rbx
//   0x1434c50  addq $0x20, %r13            ; ++entry
//   0x1434c54  cmpq $0x38bc, %r13 ; je 0x1434d14   ; ran off the end -> 0x294
//   0x1434c61  movl -0x1c(%r13,%rbx), %eax ; entry.storedWidth
//   0x1434c66  cmpl 0x74(%r12), %eax ; jne -> next
//   0x1434c70  callq stub 0x1497116        ; eax = desc->getDisplayFrameHeight()
//   0x1434c75  cmpl -0x18(%r13,%rbx), %eax ; vs entry.displayHeight ; jne -> next
//   0x1434c7c  movq 0x18(%r12), %rdi       ; desc->frameRate (CTMRatio by value)
//   0x1434c81  movq -0x14(%r13,%rbx), %rsi ; entry.frameRate
//   0x1434c86  callq stub 0x14952f2        ; CTMRatioIdentical(a, b)
//   0x1434c8b  testb %al, %al ; je -> next
//   0x1434c8f  cmpb -0x8(%r13,%rbx), %r15b ; entry.profileIdc vs arg1 ; jne -> next
//   0x1434c96  cmpb -0x7(%r13,%rbx), %r14b ; entry.levelIdc  vs arg2 ; jne -> next
//   0x1434ca0  cmpl -0xc(%r13,%rbx), %eax  ; entry.bitRate   vs arg3 ; jne -> next
//   0x1434cab  cmpb %al, -0x5(%r13,%rbx)   ; entry.isKind1   vs (arg4==1) ; jne -> next
//   0x1434cb2  movzbl -0x6(%r13,%rbx), %edi ; entry.componentDepth
//   0x1434cb8  movzbl -0x4(%r13,%rbx), %ecx ; entry.arg5
//   0x1434cbe  testb %cl, %cl ; sete %al    ; al  = (entry.arg5 == 0)
//   0x1434cc3  cmpb %cl, 0x10(%rbp) ; sete %cl ; cl = (arg5 == entry.arg5)
//   0x1434cc9  movzbl -0x3(%r13,%rbx), %esi ; entry.arg6
//   0x1434ccf  testb %sil, %sil ; sete %dl  ; dl  = (entry.arg6 == 0)
//   0x1434cd5  cmpb %sil, 0x18(%rbp) ; sete %sil ; sil = (arg6 == entry.arg6)
//   0x1434cdd  testb %dil, %dil ; sete %r8b ; r8b = (entry.componentDepth == 0)
//   0x1434ce8  cmpl %edi, -0x30(%rbp) ; sete %dil ; dil = (componentDepth == entry's)
//   0x1434cef  orb  %r8b, %dil
//   0x1434cf2  cmpb $0x1, %dil ; jne -> next   ; depth: wildcard OR equal
//   0x1434cfc  orb  %sil, %dl  ; je  -> next   ; arg6 : wildcard OR equal
//   0x1434d05  orb  %cl, %al   ; je  -> next   ; arg5 : wildcard OR equal
//   0x1434d0d  movl (%r13,%rbx), %eax         ; = entry.codec
//   0x1434d14  movl $0x294, %eax              ; table exhausted
//
// NOTE on the guard at @0x1434bef: `cmpb $-0x2, %cl ; setb` is an UNSIGNED
// compare of the BYTE (arg4 - 3) against 0xfe, so it is TRUE for arg4-3 in
// 0..0xfd — i.e. for every arg4 EXCEPT 1 and 2 (arg4=0 wraps to 0xfd and is
// rejected too). Reading it as a signed or 32-bit compare inverts the accepted
// set; the oracle below walks all 256 values of arg4 to pin it.
//
// ---------------------------------------------------------------------------
// ORACLE — differential against the live Flexo binary: 2,742 cases (971 of them
// real table hits), 0 divergences.
//   raw-port/re/oracle/MXF__MXFAVCPictureDataDecoder_avcCodec_oracle.py
// The symbol is LOCAL (`t`), so the harness calls it BY ADDRESS at
// slide+0x1434bc0 under `arch -x86_64 /usr/bin/python3` after preloading
// Flexo's @rpath chain, and refuses to run unless the process is x86_64 and the
// bytes at the target match the transcribed prologue (OPS_LOG: an address call
// against the arm64 slice would silently land in unrelated code). The three
// MXFExportSDK callees run for real, driven from a synthetic descriptor.
// Coverage: (A) all 453 table rows, progressive and interlaced; (B) 600
// near-misses that perturb exactly one column of a real row; (C) the guard,
// exhaustively over all 256 values of arg4 plus each zeroed argument; (D) 800
// random-noise calls.
// NEGATIVE CONTROLS (300 cases): inverting the arg4 guard -> 297 wrong;
// comparing the frame rate as 32-bit -> 297 wrong; ignoring the isKind1 column
// -> 297 wrong; dropping the 0-wildcard on arg5/arg6 -> 148 wrong.
// The componentDepth column is 0 (wildcard) in 451 of the 453 rows; the two
// rows that carry 8 and 10 need a populated MXKLV map, which a synthetic
// descriptor cannot supply, so those two rows are exercised by the model only.

/**
 * `MXF::MXPictureDescriptor` — only the fields THIS body reads are modelled;
 * PORTING_SPEC Rule 5 forbids naming bytes no decoded instruction touches.
 */
export interface MXPictureDescriptor {
  /** +0x18 — the picture's frame rate as a CTMRatio passed BY VALUE (the whole
   *  8 bytes go into %rdi @0x1434c7c). Held as a bigint: it is a 64-bit value
   *  compared for bit equality, and PORTING_SPEC Rule 4 puts int64 in bigint. */
  frameRate: bigint; // @Flexo MXPictureDescriptor@0x18
  /** +0x20 — the descriptor's `MXF::MXKLV*` metadata set, loaded @0x1434c0b and
   *  passed as `this` to getItemSimpleType. Null models a descriptor with no
   *  KLV; the extern is what would dereference it. */
  klv: MXKLV | null; // @Flexo MXPictureDescriptor@0x20
  /** +0x74 — the stored (coded) picture width, compared against every entry's
   *  storedWidth @0x1434c66. */
  storedWidth: number; // @Flexo MXPictureDescriptor@0x74
}

/**
 * `MXF::MXKLV` — opaque here. This body never touches its fields; it only hands
 * the pointer to the out-of-scope `getItemSimpleType` extern @0x1434c16.
 */
export interface MXKLV {
  readonly __brand: "MXF::MXKLV";
}

/**
 * `MXF::MXSimpleType` — the object `getItemSimpleType` returns. The ONLY byte
 * this body reads from it is the u8 at +0x10 (`movzbl 0x10(%rax), %eax`
 * @0x1434c23), which supplies the component depth.
 */
export interface MXSimpleType {
  /** +0x10 (u8) — read @0x1434c23 as the component depth. */
  value_0x10: number;
}

/** One row of `MXFAVCTable` @Flexo 0x1c921c0 — see the ENTRY LAYOUT block in
 *  the file header for the byte offset behind each field. */
export interface MXFAVCTableEntry {
  /** +0x00 u32 */ storedWidth: number;
  /** +0x04 u32 */ displayHeight: number;
  /** +0x08 u64, a CTMRatio compared by bit equality */ frameRate: bigint;
  /** +0x10 u32 */ bitRate: number;
  /** +0x14 u8 — H.264 profile_idc */ profileIdc: number;
  /** +0x15 u8 — H.264 level_idc (level x10) */ levelIdc: number;
  /** +0x16 u8 — 0 means "matches any depth" */ componentDepth: number;
  /** +0x17 u8 — compared against (arg4 == 1) */ isKind1: number;
  /** +0x18 u8 — 0 means "matches any arg5" */ arg5: number;
  /** +0x19 u8 — 0 means "matches any arg6" */ arg6: number;
  /** +0x1c u32 — the codec id returned on a match */ codec: number;
}

/**
 * The not-found answer, materialised twice in the body: @0x1434bf7 (preloaded
 * before the argument guard) and @0x1434d14 (after the scan runs off the end).
 */
const MXF_AVC_CODEC_NOT_FOUND = 0x294; // @Flexo 0x1434bf7 / 0x1434d14

/**
 * `MXF::MXKLV::getItemSimpleType(unsigned long long const*)` — MXFExportSDK
 * extern, called from avcCodec @Flexo 0x1434c16 via stub 0x149714c with the
 * address of the global `kmiComponentDepth` key loaded @0x1434c0f.
 *
 * TRUE OUT-OF-SCOPE extern: it is `U` in Flexo and defined at @MXFExportSDK
 * 0x4ccb0, i.e. outside the five in-scope frameworks. Documented behaviour (for
 * whoever brings MXFExportSDK into scope; NOT implemented here per
 * PORTING_SPEC Rule 3): it builds an MXKey of type 0x14 from the key bytes and
 * looks it up in the std::map rooted at `klv+0x18`, returning null when the map
 * is empty or the key is absent.
 *
 * @param _klv the descriptor's MXKLV (%rdi @0x1434c0b).
 * @param _key &kmiComponentDepth (%rsi @0x1434c0f).
 */
function MXKLV_getItemSimpleType(
  _klv: MXKLV | null,
  _key: string,
): MXSimpleType | null {
  throw new Error(
    "MXFAVCPictureDataDecoder::avcCodec: MXF::MXKLV::getItemSimpleType not " +
      "yet transcribed — called @Flexo 0x1434c16 via stub 0x149714c. TRUE " +
      "out-of-scope extern (MXFExportSDK.framework @0x4ccb0).",
  );
}

/**
 * `MXF::MXPictureDescriptor::getDisplayFrameHeight()` — MXFExportSDK extern,
 * called from avcCodec @Flexo 0x1434c70 via stub 0x1497116.
 *
 * TRUE OUT-OF-SCOPE extern (`U` in Flexo; defined @MXFExportSDK 0x53850).
 * Documented behaviour, NOT implemented here: `eax = desc->0x78`, then
 * `eax <<= (desc->0x60 == 1)` — the stored height, doubled when that byte
 * selects the two-field layout.
 *
 * @param _desc the descriptor (%rdi @0x1434c6d).
 */
function MXPictureDescriptor_getDisplayFrameHeight(
  _desc: MXPictureDescriptor,
): number {
  throw new Error(
    "MXFAVCPictureDataDecoder::avcCodec: MXF::MXPictureDescriptor::" +
      "getDisplayFrameHeight not yet transcribed — called @Flexo 0x1434c70 " +
      "via stub 0x1497116. TRUE out-of-scope extern (MXFExportSDK.framework " +
      "@0x53850).",
  );
}

/**
 * `CTMRatioIdentical(CTMRatio, CTMRatio)` — MXFExportSDK extern, called from
 * avcCodec @Flexo 0x1434c86 via stub 0x14952f2 with the descriptor's rate in
 * %rdi @0x1434c7c and the table entry's rate in %rsi @0x1434c81 (both CTMRatio
 * values passed BY VALUE in one register each).
 *
 * TRUE OUT-OF-SCOPE extern (`U` in Flexo; defined @MXFExportSDK 0x2511c).
 * Documented behaviour, NOT implemented here: `cmpq %rsi, %rdi ; sete %al` —
 * a straight 64-bit bit-equality of the two packed rationals, with no
 * normalisation.
 *
 * @param _a the descriptor's frame rate (%rdi).
 * @param _b the table entry's frame rate (%rsi).
 */
function CTMRatioIdentical(_a: bigint, _b: bigint): boolean {
  throw new Error(
    "MXFAVCPictureDataDecoder::avcCodec: CTMRatioIdentical not yet " +
      "transcribed — called @Flexo 0x1434c86 via stub 0x14952f2. TRUE " +
      "out-of-scope extern (MXFExportSDK.framework @0x2511c).",
  );
}

/**
 * `MXFAVCTable` @Flexo 0x1c921c0 — the 453-entry decision table the scan walks
 * (cursor 0x1c -> 0x38bc step 0x20 @0x1434c3b/@0x1434c50/@0x1434c54, i.e.
 * (0x38bc - 0x1c) / 0x20 = 453 entries of 0x20 bytes).
 *
 * The symbol is `__ZL11MXFAVCTable`, nm class `b` — __BSS, so the FILE image
 * holds only zeroes and these values are the ones Flexo's static initialisers
 * write at load time. They were read out of a loaded Flexo image by
 * raw-port/re/oracle/MXF__MXFAVCPictureDataDecoder_MXFAVCTable_dump.py and are
 * reproducible: the 14,496 bytes hash to sha256 7ce034fd9aa9de8309aefd280acc52dc
 * 74821932c76269c288a267f3e2c6ef61 identically across independent processes
 * (different ASLR slides). Each row's trailing comment gives its index, its
 * byte offset from the table base, and its frame rate as value/timescale.
 */
export const MXFAVCTable: ReadonlyArray<MXFAVCTableEntry> = [
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 13153320, profileIdc: 100, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 206 }, // [0] @0x1c921c0+0x0 — 25/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 88866816, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 82 }, // [1] @0x1c921c0+0x20 — 24000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000018n, bitRate: 88866816, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 83 }, // [2] @0x1c921c0+0x40 — 24/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 92569600, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 84 }, // [3] @0x1c921c0+0x60 — 25/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 111083520, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 85 }, // [4] @0x1c921c0+0x80 — 30000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000032n, bitRate: 185139200, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 86 }, // [5] @0x1c921c0+0xa0 — 50/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e90000ea60n, bitRate: 222167040, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 87 }, // [6] @0x1c921c0+0xc0 — 60000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e90000ea60n, bitRate: 222167040, profileIdc: 122, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 87 }, // [7] @0x1c921c0+0xe0 — 60000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 240058368, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 88 }, // [8] @0x1c921c0+0x100 — 24000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 250060800, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 89 }, // [9] @0x1c921c0+0x120 — 25/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900007530n, bitRate: 300072960, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 90 }, // [10] @0x1c921c0+0x140 — 30000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000032n, bitRate: 500121600, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 91 }, // [11] @0x1c921c0+0x160 — 50/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e90000ea60n, bitRate: 600145920, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 92 }, // [12] @0x1c921c0+0x180 — 60000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 240058368, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 93 }, // [13] @0x1c921c0+0x1a0 — 24000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000018n, bitRate: 240058368, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 94 }, // [14] @0x1c921c0+0x1c0 — 24/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 250060800, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 95 }, // [15] @0x1c921c0+0x1e0 — 25/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e900007530n, bitRate: 300072960, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 96 }, // [16] @0x1c921c0+0x200 — 30000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000032n, bitRate: 500121600, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 97 }, // [17] @0x1c921c0+0x220 — 50/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e90000ea60n, bitRate: 600145920, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 98 }, // [18] @0x1c921c0+0x240 — 60000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 383975424, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 99 }, // [19] @0x1c921c0+0x260 — 24000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 399974400, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 100 }, // [20] @0x1c921c0+0x280 — 25/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900007530n, bitRate: 479969280, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 101 }, // [21] @0x1c921c0+0x2a0 — 30000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000032n, bitRate: 799948800, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 102 }, // [22] @0x1c921c0+0x2c0 — 50/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e90000ea60n, bitRate: 959938560, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 103 }, // [23] @0x1c921c0+0x2e0 — 60000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 383975424, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 104 }, // [24] @0x1c921c0+0x300 — 24000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000018n, bitRate: 383975424, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 105 }, // [25] @0x1c921c0+0x320 — 24/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 399974400, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 106 }, // [26] @0x1c921c0+0x340 — 25/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e900007530n, bitRate: 479969280, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 107 }, // [27] @0x1c921c0+0x360 — 30000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000032n, bitRate: 799948800, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 108 }, // [28] @0x1c921c0+0x380 — 50/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e90000ea60n, bitRate: 959938560, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 109 }, // [29] @0x1c921c0+0x3a0 — 60000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 59998208, profileIdc: 100, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 207 }, // [30] @0x1c921c0+0x3c0 — 24000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 59998208, profileIdc: 100, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 208 }, // [31] @0x1c921c0+0x3e0 — 25/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900007530n, bitRate: 59998208, profileIdc: 100, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 209 }, // [32] @0x1c921c0+0x400 — 30000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 99999744, profileIdc: 100, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 210 }, // [33] @0x1c921c0+0x420 — 24000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 99999744, profileIdc: 100, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 211 }, // [34] @0x1c921c0+0x440 — 25/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900007530n, bitRate: 99999744, profileIdc: 100, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 212 }, // [35] @0x1c921c0+0x460 — 30000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000032n, bitRate: 155992064, profileIdc: 100, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 213 }, // [36] @0x1c921c0+0x480 — 50/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e90000ea60n, bitRate: 155992064, profileIdc: 100, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 214 }, // [37] @0x1c921c0+0x4a0 — 60000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 24999936, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 215 }, // [38] @0x1c921c0+0x4c0 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 24999936, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 216 }, // [39] @0x1c921c0+0x4e0 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 24999936, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 217 }, // [40] @0x1c921c0+0x500 — 24000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 24999936, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 218 }, // [41] @0x1c921c0+0x520 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 34996224, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 219 }, // [42] @0x1c921c0+0x540 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 34996224, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 220 }, // [43] @0x1c921c0+0x560 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 34996224, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 221 }, // [44] @0x1c921c0+0x580 — 24000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 34996224, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 222 }, // [45] @0x1c921c0+0x5a0 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 34996224, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 223 }, // [46] @0x1c921c0+0x5c0 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000032n, bitRate: 34996224, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 224 }, // [47] @0x1c921c0+0x5e0 — 50/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e90000ea60n, bitRate: 34996224, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 225 }, // [48] @0x1c921c0+0x600 — 60000/1001
  { storedWidth: 1280, displayHeight: 720, frameRate: 0x0000000100000032n, bitRate: 49999872, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 226 }, // [49] @0x1c921c0+0x620 — 50/1
  { storedWidth: 1280, displayHeight: 720, frameRate: 0x000003e90000ea60n, bitRate: 49999872, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 227 }, // [50] @0x1c921c0+0x640 — 60000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 49999872, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 228 }, // [51] @0x1c921c0+0x660 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 49999872, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 229 }, // [52] @0x1c921c0+0x680 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 49999872, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 230 }, // [53] @0x1c921c0+0x6a0 — 24000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 49999872, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 231 }, // [54] @0x1c921c0+0x6c0 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 49999872, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 232 }, // [55] @0x1c921c0+0x6e0 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000032n, bitRate: 49999872, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 233 }, // [56] @0x1c921c0+0x700 — 50/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e90000ea60n, bitRate: 49999872, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 234 }, // [57] @0x1c921c0+0x720 — 60000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 99999744, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 235 }, // [58] @0x1c921c0+0x740 — 24000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 99999744, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 236 }, // [59] @0x1c921c0+0x760 — 25/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900007530n, bitRate: 99999744, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 237 }, // [60] @0x1c921c0+0x780 — 30000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000032n, bitRate: 99999744, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 238 }, // [61] @0x1c921c0+0x7a0 — 50/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e90000ea60n, bitRate: 99999744, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 239 }, // [62] @0x1c921c0+0x7c0 — 60000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 139984896, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 240 }, // [63] @0x1c921c0+0x7e0 — 24000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 139984896, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 241 }, // [64] @0x1c921c0+0x800 — 25/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900007530n, bitRate: 139984896, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 242 }, // [65] @0x1c921c0+0x820 — 30000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000032n, bitRate: 139984896, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 243 }, // [66] @0x1c921c0+0x840 — 50/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e90000ea60n, bitRate: 139984896, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 244 }, // [67] @0x1c921c0+0x860 — 60000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 199999488, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 245 }, // [68] @0x1c921c0+0x880 — 24000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 199999488, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 246 }, // [69] @0x1c921c0+0x8a0 — 25/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900007530n, bitRate: 199999488, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 247 }, // [70] @0x1c921c0+0x8c0 — 30000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000032n, bitRate: 199999488, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 248 }, // [71] @0x1c921c0+0x8e0 — 50/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e90000ea60n, bitRate: 199999488, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 249 }, // [72] @0x1c921c0+0x900 — 60000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 200000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 250 }, // [73] @0x1c921c0+0x920 — 24000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000018n, bitRate: 200000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 251 }, // [74] @0x1c921c0+0x940 — 24/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 200000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 252 }, // [75] @0x1c921c0+0x960 — 25/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900007530n, bitRate: 200000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 253 }, // [76] @0x1c921c0+0x980 — 30000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 300000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 254 }, // [77] @0x1c921c0+0x9a0 — 24000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000018n, bitRate: 300000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 255 }, // [78] @0x1c921c0+0x9c0 — 24/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 300000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 256 }, // [79] @0x1c921c0+0x9e0 — 25/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900007530n, bitRate: 300000000, profileIdc: 122, levelIdc: 51, componentDepth: 8, isKind1: 1, arg5: 0, arg6: 0, codec: 257 }, // [80] @0x1c921c0+0xa00 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 100000000, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 258 }, // [81] @0x1c921c0+0xa20 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 100000000, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 259 }, // [82] @0x1c921c0+0xa40 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 150000000, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 260 }, // [83] @0x1c921c0+0xa60 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 150000000, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 261 }, // [84] @0x1c921c0+0xa80 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 100000000, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 262 }, // [85] @0x1c921c0+0xaa0 — 24000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000018n, bitRate: 100000000, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 263 }, // [86] @0x1c921c0+0xac0 — 24/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 100000000, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 264 }, // [87] @0x1c921c0+0xae0 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 100000000, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 265 }, // [88] @0x1c921c0+0xb00 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000032n, bitRate: 200000000, profileIdc: 122, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 266 }, // [89] @0x1c921c0+0xb20 — 50/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e90000ea60n, bitRate: 200000000, profileIdc: 122, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 267 }, // [90] @0x1c921c0+0xb40 — 60000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 80000000, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 268 }, // [91] @0x1c921c0+0xb60 — 24000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000018n, bitRate: 80000000, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 269 }, // [92] @0x1c921c0+0xb80 — 24/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 80000000, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 270 }, // [93] @0x1c921c0+0xba0 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 80000000, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 271 }, // [94] @0x1c921c0+0xbc0 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000032n, bitRate: 160000000, profileIdc: 122, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 272 }, // [95] @0x1c921c0+0xbe0 — 50/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e90000ea60n, bitRate: 160000000, profileIdc: 122, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 273 }, // [96] @0x1c921c0+0xc00 — 60000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000032n, bitRate: 250000000, profileIdc: 122, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 274 }, // [97] @0x1c921c0+0xc20 — 50/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 150000000, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 275 }, // [98] @0x1c921c0+0xc40 — 24000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000018n, bitRate: 150000000, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 276 }, // [99] @0x1c921c0+0xc60 — 24/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 150000000, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 277 }, // [100] @0x1c921c0+0xc80 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 150000000, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 278 }, // [101] @0x1c921c0+0xca0 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000032n, bitRate: 300000000, profileIdc: 122, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 279 }, // [102] @0x1c921c0+0xcc0 — 50/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e90000ea60n, bitRate: 300000000, profileIdc: 122, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 280 }, // [103] @0x1c921c0+0xce0 — 60000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 100000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 281 }, // [104] @0x1c921c0+0xd00 — 24000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000018n, bitRate: 100000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 282 }, // [105] @0x1c921c0+0xd20 — 24/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 100000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 283 }, // [106] @0x1c921c0+0xd40 — 25/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 100000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 284 }, // [107] @0x1c921c0+0xd60 — 30000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000032n, bitRate: 200000000, profileIdc: 122, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 285 }, // [108] @0x1c921c0+0xd80 — 50/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e90000ea60n, bitRate: 200000000, profileIdc: 122, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 286 }, // [109] @0x1c921c0+0xda0 — 60000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 80000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 287 }, // [110] @0x1c921c0+0xdc0 — 24000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000018n, bitRate: 80000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 288 }, // [111] @0x1c921c0+0xde0 — 24/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 80000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 289 }, // [112] @0x1c921c0+0xe00 — 25/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 80000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 290 }, // [113] @0x1c921c0+0xe20 — 30000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000032n, bitRate: 160000000, profileIdc: 122, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 291 }, // [114] @0x1c921c0+0xe40 — 50/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e90000ea60n, bitRate: 160000000, profileIdc: 122, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 292 }, // [115] @0x1c921c0+0xe60 — 60000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 150000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 293 }, // [116] @0x1c921c0+0xe80 — 24000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000018n, bitRate: 150000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 294 }, // [117] @0x1c921c0+0xea0 — 24/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 150000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 295 }, // [118] @0x1c921c0+0xec0 — 25/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 150000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 296 }, // [119] @0x1c921c0+0xee0 — 30000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000032n, bitRate: 300000000, profileIdc: 122, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 297 }, // [120] @0x1c921c0+0xf00 — 50/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e90000ea60n, bitRate: 300000000, profileIdc: 122, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 298 }, // [121] @0x1c921c0+0xf20 — 60000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 350000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 299 }, // [122] @0x1c921c0+0xf40 — 24000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000018n, bitRate: 350000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 300 }, // [123] @0x1c921c0+0xf60 — 24/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 400000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 301 }, // [124] @0x1c921c0+0xf80 — 24000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000018n, bitRate: 400000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 302 }, // [125] @0x1c921c0+0xfa0 — 24/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 400000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 303 }, // [126] @0x1c921c0+0xfc0 — 25/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900007530n, bitRate: 400000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 304 }, // [127] @0x1c921c0+0xfe0 — 30000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000032n, bitRate: 800000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 305 }, // [128] @0x1c921c0+0x1000 — 50/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e90000ea60n, bitRate: 800000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 306 }, // [129] @0x1c921c0+0x1020 — 60000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 230000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 307 }, // [130] @0x1c921c0+0x1040 — 24000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000018n, bitRate: 230000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 308 }, // [131] @0x1c921c0+0x1060 — 24/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 240000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 309 }, // [132] @0x1c921c0+0x1080 — 25/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900007530n, bitRate: 287000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 310 }, // [133] @0x1c921c0+0x10a0 — 30000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000032n, bitRate: 479000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 311 }, // [134] @0x1c921c0+0x10c0 — 50/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e90000ea60n, bitRate: 575000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 312 }, // [135] @0x1c921c0+0x10e0 — 60000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 230000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 313 }, // [136] @0x1c921c0+0x1100 — 24000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000018n, bitRate: 230000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 314 }, // [137] @0x1c921c0+0x1120 — 24/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 240000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 80, arg6: 16, codec: 315 }, // [138] @0x1c921c0+0x1140 — 25/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e900007530n, bitRate: 287000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 316 }, // [139] @0x1c921c0+0x1160 — 30000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000032n, bitRate: 479000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 317 }, // [140] @0x1c921c0+0x1180 — 50/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000032n, bitRate: 500000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 317 }, // [141] @0x1c921c0+0x11a0 — 50/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e90000ea60n, bitRate: 575000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 318 }, // [142] @0x1c921c0+0x11c0 — 60000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e90000ea60n, bitRate: 600000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 318 }, // [143] @0x1c921c0+0x11e0 — 60000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 350000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 319 }, // [144] @0x1c921c0+0x1200 — 24000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000018n, bitRate: 350000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 320 }, // [145] @0x1c921c0+0x1220 — 24/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 400000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 321 }, // [146] @0x1c921c0+0x1240 — 24000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000018n, bitRate: 400000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 322 }, // [147] @0x1c921c0+0x1260 — 24/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 400000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 323 }, // [148] @0x1c921c0+0x1280 — 25/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e900007530n, bitRate: 400000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 324 }, // [149] @0x1c921c0+0x12a0 — 30000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000032n, bitRate: 800000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 325 }, // [150] @0x1c921c0+0x12c0 — 50/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e90000ea60n, bitRate: 800000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 326 }, // [151] @0x1c921c0+0x12e0 — 60000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 125000000, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 327 }, // [152] @0x1c921c0+0x1300 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 120000000, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 328 }, // [153] @0x1c921c0+0x1320 — 24000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000018n, bitRate: 120000000, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 329 }, // [154] @0x1c921c0+0x1340 — 24/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 125000000, profileIdc: 122, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 330 }, // [155] @0x1c921c0+0x1360 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 150000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 331 }, // [156] @0x1c921c0+0x1380 — 30000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 120000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 332 }, // [157] @0x1c921c0+0x13a0 — 24000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000018n, bitRate: 120000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 333 }, // [158] @0x1c921c0+0x13c0 — 24/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 125000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 334 }, // [159] @0x1c921c0+0x13e0 — 25/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000032n, bitRate: 250000000, profileIdc: 122, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 335 }, // [160] @0x1c921c0+0x1400 — 50/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 240000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 336 }, // [161] @0x1c921c0+0x1420 — 24000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000018n, bitRate: 240000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 337 }, // [162] @0x1c921c0+0x1440 — 24/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 250000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 338 }, // [163] @0x1c921c0+0x1460 — 25/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900007530n, bitRate: 300000000, profileIdc: 122, levelIdc: 51, componentDepth: 10, isKind1: 1, arg5: 0, arg6: 0, codec: 339 }, // [164] @0x1c921c0+0x1480 — 30000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000032n, bitRate: 500000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 340 }, // [165] @0x1c921c0+0x14a0 — 50/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e90000ea60n, bitRate: 600000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 341 }, // [166] @0x1c921c0+0x14c0 — 60000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 360000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 342 }, // [167] @0x1c921c0+0x14e0 — 24000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000018n, bitRate: 360000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 343 }, // [168] @0x1c921c0+0x1500 — 24/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 375000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 344 }, // [169] @0x1c921c0+0x1520 — 25/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900007530n, bitRate: 450000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 345 }, // [170] @0x1c921c0+0x1540 — 30000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000032n, bitRate: 750000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 346 }, // [171] @0x1c921c0+0x1560 — 50/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e90000ea60n, bitRate: 900000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 80, arg6: 16, codec: 347 }, // [172] @0x1c921c0+0x1580 — 60000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 480000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 348 }, // [173] @0x1c921c0+0x15a0 — 24000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000018n, bitRate: 480000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 349 }, // [174] @0x1c921c0+0x15c0 — 24/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 500000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 350 }, // [175] @0x1c921c0+0x15e0 — 25/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900007530n, bitRate: 600000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 351 }, // [176] @0x1c921c0+0x1600 — 30000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000032n, bitRate: 1000000000, profileIdc: 122, levelIdc: 61, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 352 }, // [177] @0x1c921c0+0x1620 — 50/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e90000ea60n, bitRate: 1200000000, profileIdc: 122, levelIdc: 61, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 353 }, // [178] @0x1c921c0+0x1640 — 60000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 240000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 354 }, // [179] @0x1c921c0+0x1660 — 24000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000018n, bitRate: 240000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 355 }, // [180] @0x1c921c0+0x1680 — 24/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 250000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 356 }, // [181] @0x1c921c0+0x16a0 — 25/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e900007530n, bitRate: 300000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 357 }, // [182] @0x1c921c0+0x16c0 — 30000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 360000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 80, arg6: 16, codec: 358 }, // [183] @0x1c921c0+0x16e0 — 24000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000018n, bitRate: 360000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 80, arg6: 16, codec: 359 }, // [184] @0x1c921c0+0x1700 — 24/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 375000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 360 }, // [185] @0x1c921c0+0x1720 — 25/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e900007530n, bitRate: 450000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 80, arg6: 16, codec: 361 }, // [186] @0x1c921c0+0x1740 — 30000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000032n, bitRate: 750000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 362 }, // [187] @0x1c921c0+0x1760 — 50/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e90000ea60n, bitRate: 900000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 80, arg6: 16, codec: 363 }, // [188] @0x1c921c0+0x1780 — 60000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 480000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 364 }, // [189] @0x1c921c0+0x17a0 — 24000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000018n, bitRate: 480000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 365 }, // [190] @0x1c921c0+0x17c0 — 24/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 500000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 366 }, // [191] @0x1c921c0+0x17e0 — 25/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e900007530n, bitRate: 600000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 367 }, // [192] @0x1c921c0+0x1800 — 30000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000032n, bitRate: 1000000000, profileIdc: 122, levelIdc: 61, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 368 }, // [193] @0x1c921c0+0x1820 — 50/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e90000ea60n, bitRate: 1200000000, profileIdc: 122, levelIdc: 61, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 369 }, // [194] @0x1c921c0+0x1840 — 60000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 200000000, profileIdc: 44, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 370 }, // [195] @0x1c921c0+0x1860 — 24000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000018n, bitRate: 200000000, profileIdc: 44, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 371 }, // [196] @0x1c921c0+0x1880 — 24/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 200000000, profileIdc: 44, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 372 }, // [197] @0x1c921c0+0x18a0 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 200000000, profileIdc: 44, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 373 }, // [198] @0x1c921c0+0x18c0 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000032n, bitRate: 400000000, profileIdc: 44, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 374 }, // [199] @0x1c921c0+0x18e0 — 50/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e90000ea60n, bitRate: 400000000, profileIdc: 44, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 375 }, // [200] @0x1c921c0+0x1900 — 60000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 200000000, profileIdc: 44, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 376 }, // [201] @0x1c921c0+0x1920 — 24000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000018n, bitRate: 200000000, profileIdc: 44, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 377 }, // [202] @0x1c921c0+0x1940 — 24/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 200000000, profileIdc: 44, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 378 }, // [203] @0x1c921c0+0x1960 — 25/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 200000000, profileIdc: 44, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 379 }, // [204] @0x1c921c0+0x1980 — 30000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000032n, bitRate: 400000000, profileIdc: 44, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 380 }, // [205] @0x1c921c0+0x19a0 — 50/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e90000ea60n, bitRate: 400000000, profileIdc: 44, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 381 }, // [206] @0x1c921c0+0x19c0 — 60000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 216000000, profileIdc: 44, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 382 }, // [207] @0x1c921c0+0x19e0 — 24000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000018n, bitRate: 216000000, profileIdc: 44, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 383 }, // [208] @0x1c921c0+0x1a00 — 24/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 216000000, profileIdc: 44, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 384 }, // [209] @0x1c921c0+0x1a20 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 216000000, profileIdc: 44, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 385 }, // [210] @0x1c921c0+0x1a40 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000032n, bitRate: 432000000, profileIdc: 44, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 386 }, // [211] @0x1c921c0+0x1a60 — 50/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e90000ea60n, bitRate: 432000000, profileIdc: 44, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 387 }, // [212] @0x1c921c0+0x1a80 — 60000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 216000000, profileIdc: 44, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 388 }, // [213] @0x1c921c0+0x1aa0 — 24000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000018n, bitRate: 216000000, profileIdc: 44, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 389 }, // [214] @0x1c921c0+0x1ac0 — 24/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 216000000, profileIdc: 44, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 390 }, // [215] @0x1c921c0+0x1ae0 — 25/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 216000000, profileIdc: 44, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 391 }, // [216] @0x1c921c0+0x1b00 — 30000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000032n, bitRate: 432000000, profileIdc: 44, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 392 }, // [217] @0x1c921c0+0x1b20 — 50/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e90000ea60n, bitRate: 432000000, profileIdc: 44, levelIdc: 50, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 393 }, // [218] @0x1c921c0+0x1b40 — 60000/1001
  { storedWidth: 1280, displayHeight: 720, frameRate: 0x0000000100000032n, bitRate: 8000000, profileIdc: 100, levelIdc: 32, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 394 }, // [219] @0x1c921c0+0x1b60 — 50/1
  { storedWidth: 1280, displayHeight: 720, frameRate: 0x000003e90000ea60n, bitRate: 8000000, profileIdc: 100, levelIdc: 32, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 395 }, // [220] @0x1c921c0+0x1b80 — 60000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 24000000, profileIdc: 100, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 410 }, // [221] @0x1c921c0+0x1ba0 — 24000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000018n, bitRate: 24000000, profileIdc: 100, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 411 }, // [222] @0x1c921c0+0x1bc0 — 24/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 35000000, profileIdc: 100, levelIdc: 41, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 412 }, // [223] @0x1c921c0+0x1be0 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 35000000, profileIdc: 100, levelIdc: 41, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 413 }, // [224] @0x1c921c0+0x1c00 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 35000000, profileIdc: 100, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 414 }, // [225] @0x1c921c0+0x1c20 — 24000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000018n, bitRate: 35000000, profileIdc: 100, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 415 }, // [226] @0x1c921c0+0x1c40 — 24/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 35000000, profileIdc: 100, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 416 }, // [227] @0x1c921c0+0x1c60 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 35000000, profileIdc: 100, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 417 }, // [228] @0x1c921c0+0x1c80 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000032n, bitRate: 35000000, profileIdc: 100, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 418 }, // [229] @0x1c921c0+0x1ca0 — 50/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e90000ea60n, bitRate: 35000000, profileIdc: 100, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 419 }, // [230] @0x1c921c0+0x1cc0 — 60000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 35000000, profileIdc: 100, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 420 }, // [231] @0x1c921c0+0x1ce0 — 24000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000018n, bitRate: 35000000, profileIdc: 100, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 421 }, // [232] @0x1c921c0+0x1d00 — 24/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 35000000, profileIdc: 100, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 422 }, // [233] @0x1c921c0+0x1d20 — 25/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 35000000, profileIdc: 100, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 423 }, // [234] @0x1c921c0+0x1d40 — 30000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000032n, bitRate: 35000000, profileIdc: 100, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 424 }, // [235] @0x1c921c0+0x1d60 — 50/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e90000ea60n, bitRate: 35000000, profileIdc: 100, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 425 }, // [236] @0x1c921c0+0x1d80 — 60000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 35000000, profileIdc: 100, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 420 }, // [237] @0x1c921c0+0x1da0 — 24000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000018n, bitRate: 35000000, profileIdc: 100, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 421 }, // [238] @0x1c921c0+0x1dc0 — 24/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 35000000, profileIdc: 100, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 422 }, // [239] @0x1c921c0+0x1de0 — 25/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 35000000, profileIdc: 100, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 423 }, // [240] @0x1c921c0+0x1e00 — 30000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 80000000, profileIdc: 100, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 426 }, // [241] @0x1c921c0+0x1e20 — 25/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900007530n, bitRate: 80000000, profileIdc: 100, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 427 }, // [242] @0x1c921c0+0x1e40 — 30000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 140000000, profileIdc: 100, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 428 }, // [243] @0x1c921c0+0x1e60 — 24000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 150000000, profileIdc: 100, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 429 }, // [244] @0x1c921c0+0x1e80 — 24000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000018n, bitRate: 150000000, profileIdc: 100, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 430 }, // [245] @0x1c921c0+0x1ea0 — 24/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 150000000, profileIdc: 100, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 431 }, // [246] @0x1c921c0+0x1ec0 — 25/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900007530n, bitRate: 150000000, profileIdc: 100, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 432 }, // [247] @0x1c921c0+0x1ee0 — 30000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000032n, bitRate: 150000000, profileIdc: 100, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 433 }, // [248] @0x1c921c0+0x1f00 — 50/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e90000ea60n, bitRate: 150000000, profileIdc: 100, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 434 }, // [249] @0x1c921c0+0x1f20 — 60000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 16000000, profileIdc: 100, levelIdc: 40, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 396 }, // [250] @0x1c921c0+0x1f40 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 16000000, profileIdc: 100, levelIdc: 40, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 397 }, // [251] @0x1c921c0+0x1f60 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 16000000, profileIdc: 100, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 398 }, // [252] @0x1c921c0+0x1f80 — 24000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000018n, bitRate: 16000000, profileIdc: 100, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 399 }, // [253] @0x1c921c0+0x1fa0 — 24/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 16000000, profileIdc: 100, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 400 }, // [254] @0x1c921c0+0x1fc0 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 16000000, profileIdc: 100, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 401 }, // [255] @0x1c921c0+0x1fe0 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000032n, bitRate: 24000000, profileIdc: 100, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 402 }, // [256] @0x1c921c0+0x2000 — 50/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e90000ea60n, bitRate: 24000000, profileIdc: 100, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 403 }, // [257] @0x1c921c0+0x2020 — 60000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 16000000, profileIdc: 100, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 404 }, // [258] @0x1c921c0+0x2040 — 24000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000018n, bitRate: 16000000, profileIdc: 100, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 405 }, // [259] @0x1c921c0+0x2060 — 24/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 16000000, profileIdc: 100, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 406 }, // [260] @0x1c921c0+0x2080 — 25/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 16000000, profileIdc: 100, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 407 }, // [261] @0x1c921c0+0x20a0 — 30000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000032n, bitRate: 24000000, profileIdc: 100, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 408 }, // [262] @0x1c921c0+0x20c0 — 50/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e90000ea60n, bitRate: 24000000, profileIdc: 100, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 409 }, // [263] @0x1c921c0+0x20e0 — 60000/1001
  { storedWidth: 1280, displayHeight: 720, frameRate: 0x0000000100000019n, bitRate: 14000000, profileIdc: 122, levelIdc: 31, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 435 }, // [264] @0x1c921c0+0x2100 — 25/1
  { storedWidth: 1280, displayHeight: 720, frameRate: 0x000003e900007530n, bitRate: 14000000, profileIdc: 122, levelIdc: 31, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 436 }, // [265] @0x1c921c0+0x2120 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 31000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 437 }, // [266] @0x1c921c0+0x2140 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 31000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 438 }, // [267] @0x1c921c0+0x2160 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 31000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 439 }, // [268] @0x1c921c0+0x2180 — 24000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000018n, bitRate: 31000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 440 }, // [269] @0x1c921c0+0x21a0 — 24/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 31000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 441 }, // [270] @0x1c921c0+0x21c0 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 31000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 442 }, // [271] @0x1c921c0+0x21e0 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000032n, bitRate: 43000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 443 }, // [272] @0x1c921c0+0x2200 — 50/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e90000ea60n, bitRate: 43000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 444 }, // [273] @0x1c921c0+0x2220 — 60000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 42000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 445 }, // [274] @0x1c921c0+0x2240 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 42000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 446 }, // [275] @0x1c921c0+0x2260 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 42000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 447 }, // [276] @0x1c921c0+0x2280 — 24000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000018n, bitRate: 42000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 448 }, // [277] @0x1c921c0+0x22a0 — 24/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 42000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 449 }, // [278] @0x1c921c0+0x22c0 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 42000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 450 }, // [279] @0x1c921c0+0x22e0 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000032n, bitRate: 40000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 451 }, // [280] @0x1c921c0+0x2300 — 50/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e90000ea60n, bitRate: 40000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 452 }, // [281] @0x1c921c0+0x2320 — 60000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 42000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 453 }, // [282] @0x1c921c0+0x2340 — 24000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000018n, bitRate: 42000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 454 }, // [283] @0x1c921c0+0x2360 — 24/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 42000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 455 }, // [284] @0x1c921c0+0x2380 — 25/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 42000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 456 }, // [285] @0x1c921c0+0x23a0 — 30000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000032n, bitRate: 40000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 457 }, // [286] @0x1c921c0+0x23c0 — 50/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e90000ea60n, bitRate: 40000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 458 }, // [287] @0x1c921c0+0x23e0 — 60000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 15000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 459 }, // [288] @0x1c921c0+0x2400 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 15000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 460 }, // [289] @0x1c921c0+0x2420 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000032n, bitRate: 50000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 461 }, // [290] @0x1c921c0+0x2440 — 50/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e90000ea60n, bitRate: 50000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 462 }, // [291] @0x1c921c0+0x2460 — 60000/1001
  { storedWidth: 1280, displayHeight: 720, frameRate: 0x0000000100000019n, bitRate: 40000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 463 }, // [292] @0x1c921c0+0x2480 — 25/1
  { storedWidth: 1280, displayHeight: 720, frameRate: 0x0000000100000032n, bitRate: 15000000, profileIdc: 122, levelIdc: 32, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 464 }, // [293] @0x1c921c0+0x24a0 — 50/1
  { storedWidth: 1280, displayHeight: 720, frameRate: 0x000003e90000ea60n, bitRate: 15000000, profileIdc: 122, levelIdc: 32, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 465 }, // [294] @0x1c921c0+0x24c0 — 60000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 40000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 466 }, // [295] @0x1c921c0+0x24e0 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 40000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 467 }, // [296] @0x1c921c0+0x2500 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 40000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 468 }, // [297] @0x1c921c0+0x2520 — 24000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000018n, bitRate: 40000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 469 }, // [298] @0x1c921c0+0x2540 — 24/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 40000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 470 }, // [299] @0x1c921c0+0x2560 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 40000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 471 }, // [300] @0x1c921c0+0x2580 — 30000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 40000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 472 }, // [301] @0x1c921c0+0x25a0 — 24000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000018n, bitRate: 40000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 473 }, // [302] @0x1c921c0+0x25c0 — 24/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 40000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 474 }, // [303] @0x1c921c0+0x25e0 — 25/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 40000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 475 }, // [304] @0x1c921c0+0x2600 — 30000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 150000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 476 }, // [305] @0x1c921c0+0x2620 — 24000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000018n, bitRate: 150000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 477 }, // [306] @0x1c921c0+0x2640 — 24/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 150000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 478 }, // [307] @0x1c921c0+0x2660 — 25/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900007530n, bitRate: 150000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 479 }, // [308] @0x1c921c0+0x2680 — 30000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000032n, bitRate: 250000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 480 }, // [309] @0x1c921c0+0x26a0 — 50/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e90000ea60n, bitRate: 250000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 481 }, // [310] @0x1c921c0+0x26c0 — 60000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 150000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 482 }, // [311] @0x1c921c0+0x26e0 — 24000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000018n, bitRate: 150000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 483 }, // [312] @0x1c921c0+0x2700 — 24/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 150000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 484 }, // [313] @0x1c921c0+0x2720 — 25/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e900007530n, bitRate: 150000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 485 }, // [314] @0x1c921c0+0x2740 — 30000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000032n, bitRate: 250000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 486 }, // [315] @0x1c921c0+0x2760 — 50/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e90000ea60n, bitRate: 250000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 487 }, // [316] @0x1c921c0+0x2780 — 60000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 98000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 488 }, // [317] @0x1c921c0+0x27a0 — 24000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 120000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 489 }, // [318] @0x1c921c0+0x27c0 — 24000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000018n, bitRate: 98000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 490 }, // [319] @0x1c921c0+0x27e0 — 24/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000018n, bitRate: 120000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 491 }, // [320] @0x1c921c0+0x2800 — 24/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 103000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 492 }, // [321] @0x1c921c0+0x2820 — 25/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 125000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 493 }, // [322] @0x1c921c0+0x2840 — 25/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900007530n, bitRate: 125000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 494 }, // [323] @0x1c921c0+0x2860 — 30000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000032n, bitRate: 215000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 495 }, // [324] @0x1c921c0+0x2880 — 50/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 98000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 496 }, // [325] @0x1c921c0+0x28a0 — 24000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 120000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 497 }, // [326] @0x1c921c0+0x28c0 — 24000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000018n, bitRate: 98000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 498 }, // [327] @0x1c921c0+0x28e0 — 24/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000018n, bitRate: 120000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 499 }, // [328] @0x1c921c0+0x2900 — 24/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 103000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 500 }, // [329] @0x1c921c0+0x2920 — 25/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 125000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 501 }, // [330] @0x1c921c0+0x2940 — 25/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e900007530n, bitRate: 125000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 502 }, // [331] @0x1c921c0+0x2960 — 30000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000032n, bitRate: 215000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 503 }, // [332] @0x1c921c0+0x2980 — 50/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 25000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 504 }, // [333] @0x1c921c0+0x29a0 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 25000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 505 }, // [334] @0x1c921c0+0x29c0 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 50000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 506 }, // [335] @0x1c921c0+0x29e0 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 50000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 507 }, // [336] @0x1c921c0+0x2a00 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 50000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 508 }, // [337] @0x1c921c0+0x2a20 — 24000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000018n, bitRate: 50000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 509 }, // [338] @0x1c921c0+0x2a40 — 24/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 50000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 510 }, // [339] @0x1c921c0+0x2a60 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 50000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 511 }, // [340] @0x1c921c0+0x2a80 — 30000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 50000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 512 }, // [341] @0x1c921c0+0x2aa0 — 24000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000018n, bitRate: 50000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 513 }, // [342] @0x1c921c0+0x2ac0 — 24/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 50000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 514 }, // [343] @0x1c921c0+0x2ae0 — 25/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 50000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 515 }, // [344] @0x1c921c0+0x2b00 — 30000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000032n, bitRate: 50000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 516 }, // [345] @0x1c921c0+0x2b20 — 50/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e90000ea60n, bitRate: 50000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 517 }, // [346] @0x1c921c0+0x2b40 — 60000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 130000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 518 }, // [347] @0x1c921c0+0x2b60 — 24000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000018n, bitRate: 130000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 519 }, // [348] @0x1c921c0+0x2b80 — 24/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 135000000, profileIdc: 122, levelIdc: 51, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 520 }, // [349] @0x1c921c0+0x2ba0 — 25/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 130000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 521 }, // [350] @0x1c921c0+0x2bc0 — 24000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000018n, bitRate: 130000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 522 }, // [351] @0x1c921c0+0x2be0 — 24/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 135000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 523 }, // [352] @0x1c921c0+0x2c00 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 90000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 524 }, // [353] @0x1c921c0+0x2c20 — 24000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 110000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 525 }, // [354] @0x1c921c0+0x2c40 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 110000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 526 }, // [355] @0x1c921c0+0x2c60 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000032n, bitRate: 220000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 527 }, // [356] @0x1c921c0+0x2c80 — 50/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e90000ea60n, bitRate: 220000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 528 }, // [357] @0x1c921c0+0x2ca0 — 60000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 98000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 529 }, // [358] @0x1c921c0+0x2cc0 — 24000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000018n, bitRate: 98000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 530 }, // [359] @0x1c921c0+0x2ce0 — 24/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 120000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 531 }, // [360] @0x1c921c0+0x2d00 — 25/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 120000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 532 }, // [361] @0x1c921c0+0x2d20 — 30000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000032n, bitRate: 240000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 533 }, // [362] @0x1c921c0+0x2d40 — 50/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e90000ea60n, bitRate: 240000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 534 }, // [363] @0x1c921c0+0x2d60 — 60000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 360000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 535 }, // [364] @0x1c921c0+0x2d80 — 24000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 450000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 536 }, // [365] @0x1c921c0+0x2da0 — 25/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900007530n, bitRate: 450000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 537 }, // [366] @0x1c921c0+0x2dc0 — 30000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000032n, bitRate: 900000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 538 }, // [367] @0x1c921c0+0x2de0 — 50/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e90000ea60n, bitRate: 900000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 160, arg6: 160, codec: 539 }, // [368] @0x1c921c0+0x2e00 — 60000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 360000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 160, arg6: 160, codec: 540 }, // [369] @0x1c921c0+0x2e20 — 24000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000018n, bitRate: 360000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 160, arg6: 160, codec: 541 }, // [370] @0x1c921c0+0x2e40 — 24/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 450000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 542 }, // [371] @0x1c921c0+0x2e60 — 25/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e900007530n, bitRate: 450000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 160, arg6: 160, codec: 543 }, // [372] @0x1c921c0+0x2e80 — 30000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000032n, bitRate: 900000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 544 }, // [373] @0x1c921c0+0x2ea0 — 50/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e90000ea60n, bitRate: 900000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 160, arg6: 160, codec: 545 }, // [374] @0x1c921c0+0x2ec0 — 60000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 196000000, profileIdc: 44, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 546 }, // [375] @0x1c921c0+0x2ee0 — 24000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 240000000, profileIdc: 44, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 547 }, // [376] @0x1c921c0+0x2f00 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 240000000, profileIdc: 44, levelIdc: 41, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 548 }, // [377] @0x1c921c0+0x2f20 — 30000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 196000000, profileIdc: 44, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 549 }, // [378] @0x1c921c0+0x2f40 — 24000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000018n, bitRate: 196000000, profileIdc: 44, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 550 }, // [379] @0x1c921c0+0x2f60 — 24/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 240000000, profileIdc: 44, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 550 }, // [380] @0x1c921c0+0x2f80 — 25/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 240000000, profileIdc: 44, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 552 }, // [381] @0x1c921c0+0x2fa0 — 30000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 720000000, profileIdc: 44, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 553 }, // [382] @0x1c921c0+0x2fc0 — 24000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 900000000, profileIdc: 44, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 554 }, // [383] @0x1c921c0+0x2fe0 — 25/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900007530n, bitRate: 900000000, profileIdc: 44, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 555 }, // [384] @0x1c921c0+0x3000 — 30000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 720000000, profileIdc: 44, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 556 }, // [385] @0x1c921c0+0x3020 — 24000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000018n, bitRate: 720000000, profileIdc: 44, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 557 }, // [386] @0x1c921c0+0x3040 — 24/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 900000000, profileIdc: 44, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 558 }, // [387] @0x1c921c0+0x3060 — 25/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e900007530n, bitRate: 900000000, profileIdc: 44, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 559 }, // [388] @0x1c921c0+0x3080 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 49000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 560 }, // [389] @0x1c921c0+0x30a0 — 24000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000018n, bitRate: 49000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 561 }, // [390] @0x1c921c0+0x30c0 — 24/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 60000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 562 }, // [391] @0x1c921c0+0x30e0 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 60000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 563 }, // [392] @0x1c921c0+0x3100 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000032n, bitRate: 120000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 564 }, // [393] @0x1c921c0+0x3120 — 50/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e90000ea60n, bitRate: 120000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 565 }, // [394] @0x1c921c0+0x3140 — 60000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 49000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 566 }, // [395] @0x1c921c0+0x3160 — 24000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000018n, bitRate: 49000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 567 }, // [396] @0x1c921c0+0x3180 — 24/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 60000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 568 }, // [397] @0x1c921c0+0x31a0 — 25/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 60000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 569 }, // [398] @0x1c921c0+0x31c0 — 30000/1001
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x0000000100000032n, bitRate: 120000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 570 }, // [399] @0x1c921c0+0x31e0 — 50/1
  { storedWidth: 2048, displayHeight: 1080, frameRate: 0x000003e90000ea60n, bitRate: 120000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 571 }, // [400] @0x1c921c0+0x3200 — 60000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 192000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 572 }, // [401] @0x1c921c0+0x3220 — 24000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 240000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 573 }, // [402] @0x1c921c0+0x3240 — 25/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e900007530n, bitRate: 240000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 574 }, // [403] @0x1c921c0+0x3260 — 30000/1001
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x0000000100000032n, bitRate: 480000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 575 }, // [404] @0x1c921c0+0x3280 — 50/1
  { storedWidth: 3840, displayHeight: 2160, frameRate: 0x000003e90000ea60n, bitRate: 480000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 576 }, // [405] @0x1c921c0+0x32a0 — 60000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e900005dc0n, bitRate: 192000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 577 }, // [406] @0x1c921c0+0x32c0 — 24000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000018n, bitRate: 192000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 578 }, // [407] @0x1c921c0+0x32e0 — 24/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000019n, bitRate: 240000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 160, arg6: 160, codec: 579 }, // [408] @0x1c921c0+0x3300 — 25/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e900007530n, bitRate: 240000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 580 }, // [409] @0x1c921c0+0x3320 — 30000/1001
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x0000000100000032n, bitRate: 480000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 581 }, // [410] @0x1c921c0+0x3340 — 50/1
  { storedWidth: 4096, displayHeight: 2160, frameRate: 0x000003e90000ea60n, bitRate: 480000000, profileIdc: 122, levelIdc: 52, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 582 }, // [411] @0x1c921c0+0x3360 — 60000/1001
  { storedWidth: 1280, displayHeight: 720, frameRate: 0x0000000100000032n, bitRate: 9000000, profileIdc: 100, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 583 }, // [412] @0x1c921c0+0x3380 — 50/1
  { storedWidth: 1280, displayHeight: 720, frameRate: 0x000003e90000ea60n, bitRate: 9000000, profileIdc: 100, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 584 }, // [413] @0x1c921c0+0x33a0 — 60000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 9000000, profileIdc: 100, levelIdc: 40, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 585 }, // [414] @0x1c921c0+0x33c0 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 9000000, profileIdc: 100, levelIdc: 40, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 586 }, // [415] @0x1c921c0+0x33e0 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 9000000, profileIdc: 100, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 587 }, // [416] @0x1c921c0+0x3400 — 24000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 9000000, profileIdc: 100, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 588 }, // [417] @0x1c921c0+0x3420 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 9000000, profileIdc: 100, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 589 }, // [418] @0x1c921c0+0x3440 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000032n, bitRate: 18000000, profileIdc: 100, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 590 }, // [419] @0x1c921c0+0x3460 — 50/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e90000ea60n, bitRate: 18000000, profileIdc: 100, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 591 }, // [420] @0x1c921c0+0x3480 — 60000/1001
  { storedWidth: 1280, displayHeight: 720, frameRate: 0x0000000100000032n, bitRate: 18000000, profileIdc: 100, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 592 }, // [421] @0x1c921c0+0x34a0 — 50/1
  { storedWidth: 1280, displayHeight: 720, frameRate: 0x000003e90000ea60n, bitRate: 18000000, profileIdc: 100, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 593 }, // [422] @0x1c921c0+0x34c0 — 60000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 18000000, profileIdc: 100, levelIdc: 40, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 594 }, // [423] @0x1c921c0+0x34e0 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 18000000, profileIdc: 100, levelIdc: 40, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 595 }, // [424] @0x1c921c0+0x3500 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 18000000, profileIdc: 100, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 596 }, // [425] @0x1c921c0+0x3520 — 24000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 18000000, profileIdc: 100, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 597 }, // [426] @0x1c921c0+0x3540 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 18000000, profileIdc: 100, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 598 }, // [427] @0x1c921c0+0x3560 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000032n, bitRate: 36000000, profileIdc: 100, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 599 }, // [428] @0x1c921c0+0x3580 — 50/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e90000ea60n, bitRate: 36000000, profileIdc: 100, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 600 }, // [429] @0x1c921c0+0x35a0 — 60000/1001
  { storedWidth: 1280, displayHeight: 720, frameRate: 0x0000000100000032n, bitRate: 37500000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 601 }, // [430] @0x1c921c0+0x35c0 — 50/1
  { storedWidth: 1280, displayHeight: 720, frameRate: 0x000003e90000ea60n, bitRate: 37500000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 602 }, // [431] @0x1c921c0+0x35e0 — 60000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 37500000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 603 }, // [432] @0x1c921c0+0x3600 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 37500000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 604 }, // [433] @0x1c921c0+0x3620 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 37500000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 605 }, // [434] @0x1c921c0+0x3640 — 24000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 37500000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 606 }, // [435] @0x1c921c0+0x3660 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 37500000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 607 }, // [436] @0x1c921c0+0x3680 — 30000/1001
  { storedWidth: 1280, displayHeight: 720, frameRate: 0x0000000100000032n, bitRate: 38000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 601 }, // [437] @0x1c921c0+0x36a0 — 50/1
  { storedWidth: 1280, displayHeight: 720, frameRate: 0x000003e90000ea60n, bitRate: 38000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 602 }, // [438] @0x1c921c0+0x36c0 — 60000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 38000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 603 }, // [439] @0x1c921c0+0x36e0 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 38000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 604 }, // [440] @0x1c921c0+0x3700 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 38000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 605 }, // [441] @0x1c921c0+0x3720 — 24000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 38000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 606 }, // [442] @0x1c921c0+0x3740 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 38000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 607 }, // [443] @0x1c921c0+0x3760 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000032n, bitRate: 75000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 608 }, // [444] @0x1c921c0+0x3780 — 50/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e90000ea60n, bitRate: 75000000, profileIdc: 122, levelIdc: 42, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 609 }, // [445] @0x1c921c0+0x37a0 — 60000/1001
  { storedWidth: 1280, displayHeight: 720, frameRate: 0x0000000100000032n, bitRate: 75000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 610 }, // [446] @0x1c921c0+0x37c0 — 50/1
  { storedWidth: 1280, displayHeight: 720, frameRate: 0x000003e90000ea60n, bitRate: 75000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 611 }, // [447] @0x1c921c0+0x37e0 — 60000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 75000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 612 }, // [448] @0x1c921c0+0x3800 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 75000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 0, arg5: 0, arg6: 0, codec: 613 }, // [449] @0x1c921c0+0x3820 — 30000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900005dc0n, bitRate: 75000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 614 }, // [450] @0x1c921c0+0x3840 — 24000/1001
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x0000000100000019n, bitRate: 75000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 615 }, // [451] @0x1c921c0+0x3860 — 25/1
  { storedWidth: 1920, displayHeight: 1080, frameRate: 0x000003e900007530n, bitRate: 75000000, profileIdc: 122, levelIdc: 40, componentDepth: 0, isKind1: 1, arg5: 0, arg6: 0, codec: 616 }, // [452] @0x1c921c0+0x3880 — 30000/1001
];

/**
 * `MXF::MXFAVCPictureDataDecoder` — Flexo's MXF AVC picture-essence decoder.
 * This file ports `avcCodec` only (see the file header); every other member is
 * a separate ledger entry and will be ADDED to this same file when claimed.
 */
export class MXF__MXFAVCPictureDataDecoder {
  /**
   * `MXF::MXFAVCPictureDataDecoder::avcCodec(MXF::MXPictureDescriptor const*,
   *   unsigned char, unsigned char, unsigned int, unsigned char,
   *   unsigned char, unsigned char)` @Flexo 0x1434bc0
   *
   * Line-for-line transcription of the 104-line body reproduced in the file
   * header. `this` (%rdi) is never read by the body — the method is effectively
   * static — so nothing on the instance is touched.
   *
   * @param desc the picture descriptor (%rsi).
   * @param arg1 profile_idc (%edx, u8) — 0 is rejected @0x1434bd7.
   * @param arg2 level_idc (%ecx, u8) — 0 is rejected @0x1434bdc.
   * @param arg3 bit rate (%r8d, u32) — 0 is rejected @0x1434be3.
   * @param arg4 kind selector (%r9d, u8) — only 1 and 2 survive @0x1434bef.
   * @param arg5 discriminator (stack, 0x10(%rbp), u8) — wildcarded by a 0 column.
   * @param arg6 discriminator (stack, 0x18(%rbp), u8) — wildcarded by a 0 column.
   * @returns the matching codec id, else 0x294.
   */
  avcCodec(
    desc: MXPictureDescriptor,
    arg1: number,
    arg2: number,
    arg3: number,
    arg4: number,
    arg5: number,
    arg6: number,
  ): number {
    // ------------------------------------------------------------------
    // @0x1434bd7..0x1434bfc — the argument guard. Four conditions are ORed
    // together and a non-zero OR returns the preloaded 0x294 @0x1434bf7.
    // The fourth is `(u8)(arg4 - 3) < 0xfe`, UNSIGNED (setb) — true for every
    // arg4 except 1 and 2.
    // ------------------------------------------------------------------
    const arg1u = arg1 & 0xff;
    const arg2u = arg2 & 0xff;
    const arg3u = arg3 >>> 0;
    const arg4u = arg4 & 0xff;
    const arg5u = arg5 & 0xff;
    const arg6u = arg6 & 0xff;
    if (
      arg1u === 0 || // @0x1434bd7 testl %edx,%edx ; sete
      arg2u === 0 || // @0x1434bdc testl %ecx,%ecx ; sete
      arg3u === 0 || // @0x1434be3 testl %r8d,%r8d ; sete
      ((arg4u - 3) & 0xff) < 0xfe // @0x1434beb/@0x1434bef leal -3 ; cmpb $-2 ; setb
    ) {
      return MXF_AVC_CODEC_NOT_FOUND; // @0x1434bfc jne -> @0x1434d19 with eax = 0x294
    }

    // ------------------------------------------------------------------
    // @0x1434c0b..0x1434c33 — read the component depth out of the descriptor's
    // KLV metadata: getItemSimpleType(&kmiComponentDepth), then the u8 at +0x10
    // of the returned item, or 0 when the item is absent.
    // ------------------------------------------------------------------
    const item = MXKLV_getItemSimpleType(
      desc.klv, // @0x1434c0b movq 0x20(%rsi), %rdi
      "kmiComponentDepth", // @0x1434c0f — the key global's ADDRESS is the arg
    );
    // @0x1434c1b testq %rax,%rax ; je @0x1434c2c
    const componentDepth =
      item !== null
        ? item.value_0x10 & 0xff // @0x1434c23 movzbl 0x10(%rax), %eax
        : 0; // @0x1434c2c movl $0x0, -0x30(%rbp)

    // @0x1434c33 cmpb $0x1, %r13b ; sete -0x29(%rbp)
    const isKind1 = arg4u === 1 ? 1 : 0;

    // ------------------------------------------------------------------
    // @0x1434c3b..0x1434d12 — linear scan of the 453-entry table. The machine
    // walks a cursor from table+0x1c to table+0x38bc in 0x20 steps; the array
    // walk below is the same traversal.
    // ------------------------------------------------------------------
    for (const e of MXFAVCTable) {
      // A sequential walk with no index arithmetic — the machine's cursor is a
      // pointer bumped by 0x20 @0x1434c50 and compared against the end
      // @0x1434c54, so there is no computed index that could run out of range.
      // @0x1434c61/@0x1434c66 — entry.storedWidth vs desc->0x74
      if (e.storedWidth !== (desc.storedWidth >>> 0)) continue; // @0x1434c6b jne
      // @0x1434c70/@0x1434c75 — entry.displayHeight vs the descriptor getter.
      // The call is INSIDE the loop in the binary too (it is re-issued on every
      // candidate whose width matched), so the port keeps it here.
      if (
        e.displayHeight !== MXPictureDescriptor_getDisplayFrameHeight(desc)
      ) {
        continue; // @0x1434c7a jne
      }
      // @0x1434c7c..0x1434c8d — CTMRatioIdentical(desc->0x18, entry.frameRate)
      if (!CTMRatioIdentical(desc.frameRate, e.frameRate)) continue; // @0x1434c8d je
      // @0x1434c8f — entry.profileIdc vs arg1
      if (e.profileIdc !== arg1u) continue; // @0x1434c94 jne
      // @0x1434c96 — entry.levelIdc vs arg2
      if (e.levelIdc !== arg2u) continue; // @0x1434c9b jne
      // @0x1434c9d/@0x1434ca0 — entry.bitRate vs arg3
      if (e.bitRate !== arg3u) continue; // @0x1434ca5 jne
      // @0x1434ca7/@0x1434cab — entry.isKind1 vs (arg4 == 1)
      if (e.isKind1 !== isKind1) continue; // @0x1434cb0 jne
      // @0x1434cb2..0x1434cf6 — depth: wildcard OR equal (the machine ORs the
      // two flags and requires the result to be exactly 1).
      if (!(e.componentDepth === 0 || componentDepth === e.componentDepth)) {
        continue; // @0x1434cf6 jne
      }
      // @0x1434ccf..0x1434cff — arg6: wildcard OR equal
      if (!(e.arg6 === 0 || arg6u === e.arg6)) continue; // @0x1434cff je
      // @0x1434cbe..0x1434d07 — arg5: wildcard OR equal
      if (!(e.arg5 === 0 || arg5u === e.arg5)) continue; // @0x1434d07 je
      // @0x1434d0d movl (%r13,%rbx), %eax — the entry's codec id
      return e.codec;
    }

    // @0x1434c5b je @0x1434d14 — the scan ran off the end.
    return MXF_AVC_CODEC_NOT_FOUND; // @0x1434d14 movl $0x294, %eax
  }
}
