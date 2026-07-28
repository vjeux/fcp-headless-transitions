// PCHEVCParser.ts — HEVC (H.265) configuration-record parser used by ProCore to extract
// chroma_format_idc + bit_depth_{luma,chroma} (via the "minus8" recovery) from a
// CMFormatDescription's `hvcC` extension atom, and to scan the atom's per-array NALU list for
// a prefix-SEI NAL that carries an SEI message of payloadType 0xb0 (176). A byte-for-byte port
// of the single FCP method:
//
//   ProCore::PCHEVCParser::parseConfigRecordData(opaqueCMFormatDescription const*, bool*)
//   @0x0000000000001660  (Ozone.framework? NO — ProCore.framework/Versions/A/ProCore, thin x86_64)
//   Mangled: __ZN12PCHEVCParser21parseConfigRecordDataEPK25opaqueCMFormatDescriptionPb
//
// DECODE: raw-port/re/disasm/ProCore.PCHEVCParser.parseConfigRecordData.s
//
// The CoreMedia extraction path is a facade (CMFormatDescriptionGetExtension →
// CFDictionary/CFArray/CFData type-checks → CFDataGetBytePtr/Length), so those calls are
// modelled by an injectable `HEVCConfigDataSource` — the numeric core (byte-slicing of the
// `hvcC` payload, the NAL-array walk, and the SEI payloadType decode via PCVLCParser::u(8))
// is what's transcribed here line-for-line.
//
// Struct layout (recovered from stores at %r14+{0,4,8} in the disasm):
//   +0x00 chroma_format_idc      (uint32,   `data[0x10] & 0x3`,          store @0x176c)
//   +0x04 bit_depth_luma         (uint32,   `(data[0x11] & 0x7) | 0x8`,  store @0x177b)
//   +0x08 bit_depth_chroma       (uint32,   `(data[0x12] & 0x7) | 0x8`,  store @0x178b)
//
// The "|0x8" encodes the standard "minus8" recovery: byte[17]=bit_depth_luma_minus8 (3 bits)
// so full bit-depth = value+8. FCP stores "value|0x8" which is equivalent to "value+8" here
// because the field is masked to 3 bits — value∈[0,7], and (value|8)==(value+8) iff value<8,
// which is guaranteed by the `& 0x7` mask. We preserve the bitwise `|0x8` form so the
// arithmetic matches the machine bit-for-bit.
//
// hvcC atom byte offsets referenced (these are the raw offsets into the CFData that FCP reads;
// the extension is stored WITH the 8-byte `{u32 size; u32 'hvcC'}` atom header, hence offsets
// 0x10 = HEVCDecoderConfigurationRecord.byte[8] = chroma_format_idc, 0x11 = byte[9] =
// bit_depth_luma_minus8, 0x12 = byte[10] = bit_depth_chroma_minus8, 0x16 = byte[14] =
// numOfArrays, and the array table begins at 0x17):
//     0x10 chroma_format_idc      (2 bits: reserved(6)|chroma_format_idc(2))    @0x1763..0x176c
//     0x11 bit_depth_luma_minus8  (3 bits: reserved(5)|bit_depth_luma_m8(3))    @0x176f..0x177b
//     0x12 bit_depth_chroma_m8    (3 bits: reserved(5)|bit_depth_chroma_m8(3))  @0x177f..0x178b
//     0x16 numOfArrays            (u8)                                          @0x179e..0x17a4
//     0x17 arrays[]               (per-array: u8 nalType|flags; u16 numNalus;   @0x17c7..
//                                  numNalus × (u16 nalUnitLen; nalUnitLen bytes))
//
// Byte-order note: `hvcC` uses big-endian for multi-byte fields. The disasm uses two
// `rolw $0x8, %cx` instructions (@0x17dc for numNalus, @0x18c4 for nalUnitLength) which is a
// 16-bit byte-swap — i.e. read big-endian u16.
//
// SEI decode: for each NALU whose low-6-bit nal_unit_type (`data[nalu+2..nalu+2+len][0] & 0x3f`)
// equals 0x27 (39 = HEVC PREFIX_SEI_NUT), the atom-body-slice is handed to PCVLCParser
// (constructed with `bytes = naluStart+4, size = remaining-4`; the +4 skips the 2-byte
// nalUnitLength and the 2-byte HEVC NAL header). We then read SEI messages: sum of `u(8)`
// bytes until a non-0xff byte = payloadType; if payloadType == 0xb0 (176), set `bl := 1`
// (SUCCESS flag) and stop; otherwise read payloadSize the same way and consume payloadSize
// bytes, then check `hasMoreRBSPData()` and continue. The success flag is written to
// `*outFlag`.

import { PCVLCParser } from "./PCVLCParser";

// PCVLCParser is already ported (raw-port/src/infra/PCVLCParser.ts) — u(int), ue(), se(),
// hasMoreRBSPData(), and isByteAligned() are decoded from ProCore @0x9de96..@0x9df54. The C2
// constructor at @0x0000000000009dd0e remains its only undecoded member (its body was never
// extracted); the SEI-scan path below reaches that undecoded C2 via PCVLCParser.construct(...),
// which is the sanctioned throwing stub that cites its @addr — see PCVLCParser_C2_stub in
// raw-port/src/infra/PCVLCParser.ts. This file's SEI-scan will therefore throw loudly at the
// first prefix-SEI NALU rather than silently invent a parser register — exactly the
// "decode-before-implement / loud-gap" behavior the ANTI_SHORTCUT gate demands.

/** Layout of the fields the parser writes into `*this` (see @0x176c/@0x177b/@0x178b). */
export interface PCHEVCParserFields {
  chromaFormatIdc: number;   // +0x00
  bitDepthLuma:    number;   // +0x04
  bitDepthChroma:  number;   // +0x08
}

/**
 * Facade for the CoreMedia extension-atom lookup path
 * (`CMFormatDescriptionGetExtension` → `hvcC` CFData). A real port of the CoreMedia calls is
 * out of scope for a pure-math leaf; a caller supplies the resolved hvcC byte buffer, or
 * `null` if the extension is missing / not a valid CFData.
 *
 * FCP path (all facade, no numeric work):
 *   @0x167a  ext = CMFormatDescriptionGetExtension(fmt, kCMFormatDescriptionExtension_SampleDescriptionExtensionAtoms)
 *   @0x1698  CFDictionaryGetTypeID / CFGetTypeID(ext) — must equal CFDictionary type
 *   @0x16b1  val = CFDictionaryGetValue(ext, CFSTR("hvcC"))
 *            (cfstring @0x14cc98 → literal "hvcC", verified via __cfstring section decode)
 *   @0x16d7  if (CFGetTypeID(val) == CFArrayGetTypeID)
 *   @0x170f      val = CFArrayGetValueAtIndex(val, 0)
 *   @0x171c  require CFGetTypeID(val) == CFDataGetTypeID
 *   @0x1735  bytes = CFDataGetBytePtr(val)
 *   @0x1740  size  = CFDataGetLength(val)
 */
export interface HEVCConfigDataSource {
  /** Returns the raw `hvcC` atom bytes (including the 8-byte `{size,'hvcC'}` box header), or null. */
  hvcCAtomBytes(): Uint8Array | null;
}

/**
 * PCHEVCParser::parseConfigRecordData
 *   @0x0000000000001660  ProCore  __ZN12PCHEVCParser21parseConfigRecordDataEPK25opaqueCMFormatDescriptionPb
 *
 * Signature: (this: PCHEVCParser*, fmt: CMFormatDescriptionRef, outFlag: bool*) -> bool
 * Returns true iff the hvcC atom was located and had >= 0x17 bytes (i.e. numeric fields were
 * populated). `*outFlag` is written iff `outFlag != nullptr` AND the atom was parseable AND
 * numOfArrays > 0 AND size >= 0x22 (see @0x17ac `cmpl $0x22, %r15d`). The flag becomes 1
 * exactly when a prefix-SEI NALU contains an SEI message with payloadType == 0xb0.
 */
export function PCHEVCParser_parseConfigRecordData(
  self: PCHEVCParserFields,
  src: HEVCConfigDataSource,
  writeOutFlag: boolean,   // models `r13 != nullptr` (@0x1791 `testq %r13,%r13`)
): { ok: boolean; outFlag?: boolean } {
  // --- CoreMedia facade path (@0x167a..0x1748) --------------------------------------------
  const bytes = src.hvcCAtomBytes();
  if (bytes === null) return { ok: false };                            // @0x168f/16c3/16f4/172f jumps to 0x191f (return 0)

  const size0 = bytes.length;
  // @0x174b: require (bytes != NULL) && (size >= 0x17). We already have bytes; check size.
  if (size0 < 0x17) return { ok: false };                              // @0x1755 `cmpl $0x17, %r15d; setge`

  // --- Numeric field extraction (@0x1763..0x178b) -----------------------------------------
  self.chromaFormatIdc = bytes[0x10] & 0x3;                            // @0x1763..0x176c
  self.bitDepthLuma    = (bytes[0x11] & 0x7) | 0x8;                    // @0x176f..0x177b
  self.bitDepthChroma  = (bytes[0x12] & 0x7) | 0x8;                    // @0x177f..0x178b

  // If the caller didn't ask for the SEI-scan flag, we're done (@0x178f..0x1794).
  if (!writeOutFlag) return { ok: true };

  // --- SEI-scan gating (@0x179e..0x17c1) --------------------------------------------------
  const numArrays = bytes[0x16];                                       // @0x179e..0x17a4
  // @0x17ac: skip scan if numArrays == 0 OR size < 0x22. Result flag = false (bl=0).
  if (numArrays === 0 || size0 < 0x22) {
    return { ok: true, outFlag: false };                               // @0x1915 stores bl=0
  }

  // --- Array walk (@0x17c7..0x190f) -------------------------------------------------------
  let cursor  = 0x17;                                                  // @0x17cb: r12 += 0x17
  let remain  = size0 - 0x17;                                          // @0x17c7: r15 -= 0x17
  let successFlag = false;                                             // ebx (bl) in the disasm

  for (let arrIdx = 0; arrIdx < numArrays; arrIdx++) {                 // @0x18fa..0x1905 outer counter
    if (successFlag) break;                                            // @0x1907..0x1909
    if (remain <= 0xa) break;                                          // @0x190b..0x190f: `cmp $0xa,r15d; jg`

    // Read array-header: 1-byte nalType(with flags), 2-byte numNalus (big-endian).
    const nalTypeByte = bytes[cursor];                                 // @0x17f7: `movb (%r12), %dil`
    const nalType     = nalTypeByte & 0x3f;                            // @0x17fb: `andb $0x3f, %dil`
    const numNalus    = (bytes[cursor + 1] << 8) | bytes[cursor + 2];  // @0x17d6..0x17dc: big-endian u16
    cursor += 3; remain -= 3;                                          // @0x17e0/0x17e5

    if (numNalus === 0) {
      // @0x18f5: `xorl %ebx,%ebx; movq %rax,%r12` — reset per-array flag, keep cursor.
      // (Nothing to advance since we already ate the 3-byte header.)
      continue;
    }

    // Walk NALUs inside this array.
    for (let nIdx = 0; nIdx < numNalus; nIdx++) {                      // @0x18df..0x18e3
      if (successFlag) break;                                          // @0x18e5..0x18e7
      if (remain <= 7) break;                                          // @0x18e9..0x18ed: `cmp $0x7,r15d; jg`

      const nalLen = (bytes[cursor] << 8) | bytes[cursor + 1];         // @0x1809 + @0x18c4 big-endian u16
      // Advance past the 2-byte length prefix — the NALU body itself follows.
      const naluBodyStart = cursor + 2;                                // (@0x18c8 `rax = r12+2`)

      if (nalType === 0x27) {                                          // @0x1810..0x1814: prefix-SEI NAL
        // PCVLCParser sees the SEI RBSP starting AFTER the 2-byte HEVC NAL header:
        //   ptr  = naluBodyStart + 2
        //   size = nalLen        - 2
        // FCP's disasm computes `rsi = r12+4` (r12 was still at the length prefix) and
        // `edx = r15-4` (remaining budget minus 2 for length + 2 for NAL header). We only
        // need the NALU-sized slice, not the whole remaining buffer, but PCVLCParser is
        // stopped by hasMoreRBSPData()/u(8) — we transcribe FCP's argument exactly.
        //   @0x1821 leaq 0x4(%r12), %rsi
        //   @0x1826 leal -0x4(%r15), %edx
        // The PCVLCParser C2 constructor is not yet transcribed — its C2 body has not been
        // extracted (see raw-port/src/infra/PCVLCParser.ts frontier note). We therefore CANNOT
        // silently construct a parser here; doing so would produce a differently-initialized
        // register than the C++ side. Route through the sanctioned throwing stub so the frontier
        // is visible and this call site's @addr is preserved for a future worker.
        const parser = new PCVLCParser();
        PCVLCParser.construct(parser, bytes.subarray(cursor + 4), remain - 4); // throws until C2 is decoded

        // SEI-message loop (@0x1832..0x1894).
        let perNaluFlag = false;
        while (true) {
          // payloadType: sum of u(8) until non-0xff. (@0x1832..0x1846)
          let payloadType = 0;
          let b: number;
          do {
            b = parser.u(8) & 0xff;
            payloadType = (payloadType + b) | 0;
          } while (b === 0xff);

          if (payloadType === 0xb0) {                                  // @0x1848..0x184e
            perNaluFlag = true;                                        // @0x1898: `movb $0x1, %bl`
            break;
          }

          // payloadSize: same sum-of-u(8) form. (@0x1852..0x186e)
          let payloadSize = 0;
          do {
            b = parser.u(8) & 0xff;
            payloadSize = (payloadSize + b) | 0;
          } while (b === 0xff);

          // Consume payloadSize bytes via u(8) if positive. (@0x1870..0x1886)
          if (payloadSize > 0) {
            for (let i = 0; i < payloadSize; i++) parser.u(8);
          }

          // Continue only if more RBSP data remains. (@0x1888..0x1894)
          if (!parser.hasMoreRBSPData()) break;
        }

        successFlag = perNaluFlag;                                     // ebx = 0 or 1 falls through
      }

      // Advance past this NALU (whether SEI or not): +2 (length prefix) + nalLen (body).
      cursor  = naluBodyStart + nalLen;                                // @0x18c8..0x18d9
      remain -= 2 + nalLen;                                            // @0x18cf/0x18dc
    }
  }

  return { ok: true, outFlag: successFlag };                           // @0x1915..0x191b
}
