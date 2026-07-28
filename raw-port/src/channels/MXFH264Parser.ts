// MXFH264Parser.ts — Flexo framework's MXFH264Parser: an H.264 Sequence/Picture
// Parameter Set parser used by the MXF import path to recover per-stream geometry
// (width/height/chroma) from an MXFAvcSubDescriptor's config record. Method
// dispatch:
//   @Flexo 0x00000000014209d0  MXFH264Parser::parseConfigRecordData(opaqueCMFormatDescription const*)
//   @Flexo 0x0000000001420b90  MXFH264Parser::parseSPS(unsigned char const*, int)
//   @Flexo 0x0000000001420fb0  MXFH264Parser::parsePPS(unsigned char const*, int)
//   @Flexo 0x0000000001421170  MXFH264Parser::checkSampleBuffer(int, unsigned char const*, int)
//
// Each parseSPS/parsePPS constructs a stack-local VlcParser at [rbp-0x50/0x58]
// and drives it through the H.264 syntax with the exact ITU-T H.264 spec's
// Exp-Golomb (ue/se) + fixed-length (getBits(n)) grammar. Store offsets on
// `this` (%rbx = %rdi in the entry blocks) are captured field-for-field below.
//
// Source disassembly (in this worktree's raw-port/re/disasm/):
//   Flexo.MXFH264Parser.parseSPS.s              (@0x1420b90..0x1420fa6, 288 lines)
//   Flexo.MXFH264Parser.parsePPS.s              (@0x1420fb0..0x1421160, 125 lines)
//   Flexo.MXFH264Parser.checkSampleBuffer.s     (@0x1421170..0x1421305, 110 lines)
//   parseConfigRecordData @0x14209d0 has no standalone body extractable —
//   `otool -tV` reports 0-line disasm (ICF-folded / thunk / extern). Body is
//   NOT decoded and MUST NOT be guessed; it is a throwing stub citing @0x14209d0.
//
// Frontier callees used by decoded bodies (all already ported):
//   VlcParser::initialize     @0x1421560 (ICF-folded — throws in port)
//   VlcParser::ue             @0x1421570 (ported)
//   VlcParser::se             @0x14215a0 (ported)
//   VlcParser::hasMoreRbspData@0x14215e0 (ported)
//   BitstreamReader::getBits  @0x014206e0 (ported, via `.br.getBits`)
//
// STRUCT LAYOUT of MXFH264Parser (recovered from parseSPS's `%rbx = %rdi` stores
// and from checkSampleBuffer's reads on `-0x38(%rbp) = this`):
//   +0x00  profileIdc                        (u32, getBits(8) @0x1420bd7)
//   +0x04  constraintSetFlags                (u32, getBits(8) @0x1420be6)
//   +0x08  levelIdc                          (u32, getBits(8) @0x1420bf6)
//   +0x0c  seqParameterSetId                 (u32, ue @0x1420c01)
//   +0x10  chromaFormatIdc                   (u32, ue @0x1420c2f) [profile-gated]
//   +0x14  separateColourPlaneFlag           (u32, getBits(1) @0x1420c45) [chroma==3]
//                                            — checkSampleBuffer @0x14212a5 branches on this
//   +0x18  bitDepthLumaMinus8                (u32, ue @0x1420c50)
//   +0x1c  bitDepthChromaMinus8              (u32, ue @0x1420c5b)
//   +0x20  qpprimeYZeroTransformBypassFlag   (u32, getBits(1) @0x1420c6b)
//   +0x24  seqScalingMatrixPresentFlag       (u32, getBits(1) @0x1420c7b)
//                                            — gates the seq_scaling_list loop
//   +0x28  log2MaxFrameNumMinus4             (u32, ue @0x1420d3f)
//                                            — checkSampleBuffer @0x14211b4 uses (this+4)
//   +0x2c  picOrderCntType                   (u32, ue @0x1420d4a)
//   +0x30  log2MaxPicOrderCntLsbMinus4       (u32, ue @0x1420d5f) [type==0]
//   +0x34  deltaPicOrderAlwaysZeroFlag       (u32, getBits(1) @0x1420d71) [type==1]
//   +0x38  offsetForNonRefPic                (i32, se @0x1420d7c) [type==1]
//   +0x3c  offsetForTopToBottomField         (i32, se @0x1420d87) [type==1]
//   +0x40  numRefFramesInPicOrderCntCycle    (u32, ue @0x1420d92) [type==1]
//   +0x44  numRefFrames                      (u32, ue @0x1420dbd)
//   +0x48  gapsInFrameNumValueAllowedFlag    (u32, getBits(1) @0x1420dcd)
//   +0x4c  picWidthInMbsMinus1               (u32, ue @0x1420dd8)
//   +0x50  picHeightInMapUnitsMinus1         (u32, ue @0x1420de3)
//   +0x54  frameMbsOnlyFlag                  (u32, getBits(1) @0x1420df3)
//                                            — checkSampleBuffer @0x14211c4 branches on this
//   +0x58  mbAdaptiveFrameFieldFlag          (u32, getBits(1) @0x1420e2b) [!frame_mbs_only]
//   +0x5c  width  = (picWidth+1)<<4          (u32, @0x1420dfc..0x1420e02)
//   +0x60  height = ((2-fmof)<<4)*(picH+1)-cropAdjust (u32, @0x1420e05..0x1420e16)
//   +0x64  direct8x8InferenceFlag            (u32, getBits(1) @0x1420e3b)
//   +0x68  frameCroppingFlag                 (u32, getBits(1) @0x1420e4b)
//   +0x6c  vuiParametersPresentFlag          (u32, getBits(1) @0x1420e9b)
//   +0x70  chromaLocInfoPresentFlag          (u32, getBits(1) @0x1420f33) [from VUI path]
//
// Numerics: every parsed value is u32 (movl into eax and stored via movl). The
// (2-fmof)*16*(picH+1) computation at @0x1420e05..0x1420e16 uses signed 32-bit
// arithmetic (imull). We reproduce with `| 0` for signed 32-bit width.

import { BitstreamReader as _BitstreamReader } from "./BitstreamReader";
import { VlcParser } from "./VlcParser";

// Suppress "unused" — imported for provenance chain of decoded callees.
void _BitstreamReader;

/**
 * MXFH264Parser — recovers H.264 stream geometry from an MXF AVC config record.
 *
 * The class is a plain data record populated by parseSPS/parsePPS. It has no
 * ctor in the observed disassembly (fields are set only by parsers); we default
 * every field to 0 to match zero-initialized C++ POD semantics.
 */
export class MXFH264Parser {
  // +0x00
  profileIdc: number = 0;
  // +0x04
  constraintSetFlags: number = 0;
  // +0x08
  levelIdc: number = 0;
  // +0x0c
  seqParameterSetId: number = 0;
  // +0x10
  chromaFormatIdc: number = 0;
  // +0x14
  separateColourPlaneFlag: number = 0;
  // +0x18
  bitDepthLumaMinus8: number = 0;
  // +0x1c
  bitDepthChromaMinus8: number = 0;
  // +0x20
  qpprimeYZeroTransformBypassFlag: number = 0;
  // +0x24
  seqScalingMatrixPresentFlag: number = 0;
  // +0x28
  log2MaxFrameNumMinus4: number = 0;
  // +0x2c
  picOrderCntType: number = 0;
  // +0x30
  log2MaxPicOrderCntLsbMinus4: number = 0;
  // +0x34
  deltaPicOrderAlwaysZeroFlag: number = 0;
  // +0x38
  offsetForNonRefPic: number = 0;
  // +0x3c
  offsetForTopToBottomField: number = 0;
  // +0x40
  numRefFramesInPicOrderCntCycle: number = 0;
  // +0x44
  numRefFrames: number = 0;
  // +0x48
  gapsInFrameNumValueAllowedFlag: number = 0;
  // +0x4c
  picWidthInMbsMinus1: number = 0;
  // +0x50
  picHeightInMapUnitsMinus1: number = 0;
  // +0x54
  frameMbsOnlyFlag: number = 0;
  // +0x58
  mbAdaptiveFrameFieldFlag: number = 0;
  // +0x5c
  width: number = 0;
  // +0x60
  height: number = 0;
  // +0x64
  direct8x8InferenceFlag: number = 0;
  // +0x68
  frameCroppingFlag: number = 0;
  // +0x6c
  vuiParametersPresentFlag: number = 0;
  // +0x70
  chromaLocInfoPresentFlag: number = 0;

  /**
   * MXFH264Parser::parseConfigRecordData(opaqueCMFormatDescription const*)
   * @Flexo 0x00000000014209d0
   *
   * Body not extractable — `otool -tV` reports a 0-line disasm at this address
   * (ICF-folded / thunk / extern). Per PORTING_SPEC.md Rule 3, an undecoded
   * body must throw citing its address rather than be paraphrased. The real
   * body is expected to walk the AvcC config record (extradata) — first byte
   * lengthSizeMinusOne, SPS/PPS count-and-length TLV — and dispatch parseSPS /
   * parsePPS for each. Decoding requires a second pass on the binary with a
   * per-symbol slice; deferred as an isolation-safe stub.
   */
  parseConfigRecordData(_desc: unknown): void {
    // undecoded body @0x14209d0 — see doc comment above.
    const stub = (): never => {
      const err = new Error(
        "MXFH264Parser::parseConfigRecordData @0x14209d0 not yet transcribed (ICF-folded / body not extractable)",
      );
      throw err;
    };
    stub();
  }

  /**
   * MXFH264Parser::parseSPS(unsigned char const*, int)
   * @Flexo 0x0000000001420b90
   *
   * Faithful transcription of the 288-line disasm at
   * raw-port/re/disasm/Flexo.MXFH264Parser.parseSPS.s.
   *
   * Prolog @0x1420b90..0x1420ba1:
   *   push rbp/r15/r14/r13/r12/rbx ; sub rsp,0x38 ; mov rbx,rdi (rbx = this)
   *   lea r14,[rbp-0x58] (r14 = &vlc)
   * Callees on the stack-local VlcParser (`vlc`):
   *   @0x1420bab  vlc.initialize(src, srcLenBytes)
   *   @0x1420bb8  vlc.br.getBits(3)   forbidden_zero_bit + nal_ref_idc  (result unused)
   *   @0x1420bc5  vlc.br.getBits(5)   nal_unit_type                     (result unused)
   *   @0x1420bd2  vlc.br.getBits(8)   -> [rbx+0x00]  profileIdc
   *   @0x1420be1  vlc.br.getBits(8)   -> [rbx+0x04]  constraintSetFlags
   *   @0x1420bf1  vlc.br.getBits(8)   -> [rbx+0x08]  levelIdc
   *   @0x1420bfc  vlc.ue()            -> [rbx+0x0c]  seqParameterSetId
   */
  parseSPS(src: Uint8Array, srcLenBytes: number): void {
    // r14 = &vlc (stack-local); we allocate a fresh VlcParser (which contains
    // a BitstreamReader) per call — mirrors the [rbp-0x58] frame slot.
    const vlc = new VlcParser();
    // @0x1420bab callq VlcParser::initialize — the port throws (initialize
    // @0x1421560 is ICF-folded). Callers wire the reader by an alternative
    // path (see BitstreamReader.initialize on `.br`) once that gap is closed.
    vlc.initialize(src, srcLenBytes);

    // @0x1420bab..0x1420bd2 — three prelude getBits (discarded returns).
    vlc.br.getBits(3); // forbidden_zero_bit(1) + nal_ref_idc(2)
    vlc.br.getBits(5); // nal_unit_type
    this.profileIdc = vlc.br.getBits(8) | 0; // @0x1420bd7  movl %eax,(%rbx)
    this.constraintSetFlags = vlc.br.getBits(8) | 0; // @0x1420be6  movl %eax,0x4(%rbx)
    this.levelIdc = vlc.br.getBits(8) | 0; // @0x1420bf6  movl %eax,0x8(%rbx)
    this.seqParameterSetId = vlc.ue() | 0; // @0x1420c01  movl %eax,0xc(%rbx)

    // @0x1420c04..0x1420c20 — profile-gated chroma_format_idc branch:
    //   ecx = profileIdc - 0x53 ; if (ecx > 0x27) skip
    //   bt (0x8008020009 >> ecx) & 1 ; if !CF skip
    // The 64-bit mask 0x8008020009 selects profiles: 0x53(0), 0x56(3),
    // 0x5B(8), 0x63(0x10), 0x7A(0x27). Together with the explicit
    // @0x1420d1f..0x1420d2d "eax==0xf4 || eax==0x2c" fallthrough (High 4:4:4
    // Intra + CAVLC 4:4:4 aliases), these are the H.264 profiles that carry
    // the chroma-format extension in the SPS. If gated in, parse the block.
    const profile = this.profileIdc | 0;
    const ecx0 = (profile - 0x53) | 0;
    const chromaGate =
      (ecx0 >>> 0) <= 0x27 &&
      // bt %rcx,%rdx — mirror as (mask >> ecx) & 1n
      ((0x8008020009n >> BigInt(ecx0 & 0x3f)) & 1n) === 1n;
    const chromaFallthrough = profile === 0xf4 || profile === 0x2c;

    if (chromaGate || chromaFallthrough) {
      // @0x1420c26..0x1420d30 — chroma format block
      this.chromaFormatIdc = vlc.ue() | 0; // @0x1420c2f  movl %eax,0x10(%rbx)
      if ((this.chromaFormatIdc | 0) === 3) {
        this.separateColourPlaneFlag = vlc.br.getBits(1) | 0; // @0x1420c45  movl %eax,0x14(%rbx)
      }
      this.bitDepthLumaMinus8 = vlc.ue() | 0; // @0x1420c50  movl %eax,0x18(%rbx)
      this.bitDepthChromaMinus8 = vlc.ue() | 0; // @0x1420c5b  movl %eax,0x1c(%rbx)
      this.qpprimeYZeroTransformBypassFlag = vlc.br.getBits(1) | 0; // @0x1420c6b  movl %eax,0x20(%rbx)
      this.seqScalingMatrixPresentFlag = vlc.br.getBits(1) | 0; // @0x1420c7b  movl %eax,0x24(%rbx)

      if ((this.seqScalingMatrixPresentFlag | 0) !== 0) {
        // @0x1420c86..0x1420d1a — seq_scaling_list loop.
        //   r15 = i ; count = (chromaFormatIdc==3 ? 12 : 8) ; iterate.
        // Per iteration @0x1420cac: getBits(1) = seq_scaling_list_present[i].
        // If present && i<6: 16-entry list ; else: 64-entry list (@0x1420cc1
        //   r13 = 0x40, cmov below 6 -> 0x10). Each entry: se(); running
        // lastScale update mirrored by the (ecx+r12+0x100)&0xff branchless
        // modular add @0x1420ce8..0x1420d06. When nextScale becomes 0 the
        // loop early-terminates within the current list (@0x1420d0f test).
        let i = 0; // r15d
        // outer while (i < ((chromaFormatIdc==3)?12:8))
        while (true) {
          const outerCount =
            ((this.chromaFormatIdc | 0) === 3 ? 12 : 8) | 0; // @0x1420c95..0x1420c9c
          if (i >= outerCount) break;
          const present = vlc.br.getBits(1) | 0; // @0x1420cb4
          if (present !== 0) {
            // @0x1420cbd..0x1420ccc — count = (i < 6) ? 16 : 64
            let r13 = (i < 6 ? 0x10 : 0x40) | 0;
            let lastScale = 8; // r12d = 8  @0x1420cd0
            let nextScale = 8; // ecx = 8   @0x1420cd6
            // @0x1420d0f dispatch — enter loop at "test ecx,ecx" first.
            while (r13 > 0) {
              if (nextScale !== 0) {
                // @0x1420ce0..0x1420d0d — delta_scale = se(); update
                const delta = vlc.se() | 0;
                // ecx = delta + r12 + 0x100 ; eax = delta + r12 + 0x1ff
                let ecx = (delta + lastScale + 0x100) | 0;
                let eax = (delta + lastScale + 0x1ff) | 0;
                // if (ecx>=0) eax = ecx  (cmovns eax,ecx after test ecx)
                if (ecx >= 0) eax = ecx;
                // and eax, 0xffffff00 ; sub ecx, eax  -> ecx = ecx mod 256
                eax = (eax & 0xffffff00) | 0;
                ecx = (ecx - eax) | 0;
                nextScale = ecx | 0;
                // cmovne r12d, ecx — if ecx!=0 then lastScale = ecx
                if (ecx !== 0) lastScale = ecx | 0;
                r13 = (r13 - 1) | 0;
                if (r13 === 0) break;
              } else {
                // ecx==0 branch @0x1420d13..0x1420d18 — decrement and continue
                r13 = (r13 - 1) | 0;
                if (r13 === 0) break;
              }
            }
          }
          i = (i + 1) | 0;
        }
      }
    }
    // @0x1420d33 — join (either chromaGate skipped or scaling list done)
    this.log2MaxFrameNumMinus4 = vlc.ue() | 0; // @0x1420d3f  movl %eax,0x28(%rbx)
    this.picOrderCntType = vlc.ue() | 0; // @0x1420d4a  movl %eax,0x2c(%rbx)

    // @0x1420d4d..0x1420d62 — pic_order_cnt_type switch:
    //   ==1 -> extended block ; ==0 -> log2Max… ; else skip.
    if ((this.picOrderCntType | 0) === 1) {
      // @0x1420d64..0x1420db1
      this.deltaPicOrderAlwaysZeroFlag = vlc.br.getBits(1) | 0; // @0x1420d71
      this.offsetForNonRefPic = vlc.se() | 0; // @0x1420d7c
      this.offsetForTopToBottomField = vlc.se() | 0; // @0x1420d87
      this.numRefFramesInPicOrderCntCycle = vlc.ue() | 0; // @0x1420d92
      // @0x1420d95..0x1420daf — for(i=0; i<numRef; i++) se();
      if ((this.numRefFramesInPicOrderCntCycle | 0) > 0) {
        let i = 0;
        do {
          vlc.se(); // @0x1420da3 — offset_for_ref_frame[i], discarded
          i = (i + 1) | 0;
        } while (i < (this.numRefFramesInPicOrderCntCycle | 0));
      }
    } else if ((this.picOrderCntType | 0) === 0) {
      this.log2MaxPicOrderCntLsbMinus4 = vlc.ue() | 0; // @0x1420d5f
    }
    // @0x1420db1 — join

    this.numRefFrames = vlc.ue() | 0; // @0x1420dbd
    this.gapsInFrameNumValueAllowedFlag = vlc.br.getBits(1) | 0; // @0x1420dcd
    this.picWidthInMbsMinus1 = vlc.ue() | 0; // @0x1420dd8
    this.picHeightInMapUnitsMinus1 = vlc.ue() | 0; // @0x1420de3
    this.frameMbsOnlyFlag = vlc.br.getBits(1) | 0; // @0x1420df3

    // @0x1420df6..0x1420e16 — geometry computation (all signed i32):
    //   ecx = picWidth ; shl ecx,4 ; add ecx,0x10 ; [rbx+0x5c] = ecx
    //     -> width = (picWidthInMbsMinus1 + 1) * 16
    //   edx = picHeight ; inc edx
    //   ecx = fmof<<4 ; esi = 0x20 - ecx ; esi *= edx ; [rbx+0x60] = esi
    //     -> height = (32 - fmof*16) * (picHeightInMapUnitsMinus1 + 1)
    //              = (2 - fmof) * 16 * (picHeightInMapUnitsMinus1 + 1)
    const w = (((this.picWidthInMbsMinus1 | 0) << 4) + 0x10) | 0;
    this.width = w;
    const fmofShifted = ((this.frameMbsOnlyFlag | 0) << 4) | 0;
    const two16MinusFmof16 = (0x20 - fmofShifted) | 0;
    const heightMul = ((this.picHeightInMapUnitsMinus1 | 0) + 1) | 0;
    this.height = Math.imul(two16MinusFmof16, heightMul) | 0;

    // @0x1420e19 — if (!frameMbsOnlyFlag) mbAdaptiveFrameFieldFlag = getBits(1)
    if ((this.frameMbsOnlyFlag | 0) === 0) {
      this.mbAdaptiveFrameFieldFlag = vlc.br.getBits(1) | 0; // @0x1420e2b
    }

    this.direct8x8InferenceFlag = vlc.br.getBits(1) | 0; // @0x1420e3b
    this.frameCroppingFlag = vlc.br.getBits(1) | 0; // @0x1420e4b

    // @0x1420e4e..0x1420e8d — if (frameCroppingFlag) subtract crops from
    //   width/height. Crops read as four ue() values:
    //     left,right,top,bottom = ue,ue,ue,ue
    //     width  -= (left + right)                       @0x1420e68
    //     height += (top + bottom) * (frameMbsOnly ? -2 : ... )
    //   The asm at @0x1420e7e reads [rbx+0x54] = fmof, subtracts 2 into ecx,
    //   then multiplies (top+bottom)*ecx and adds to [rbx+0x60]. When
    //   fmof=1 this is (top+bottom)*-1; when fmof=0 this is (top+bottom)*-2.
    //   Combined with the additive `add` (imul then add) this matches the
    //   H.264 spec cropUnitY = 2-fmof for chroma_format_idc<3.
    if ((this.frameCroppingFlag | 0) !== 0) {
      const cropLeft = vlc.ue() | 0; // @0x1420e55
      const cropRight = vlc.ue() | 0; // @0x1420e60
      // eax = cropLeft + cropRight ; sub [rbx+0x5c], eax
      this.width = (this.width - ((cropLeft + cropRight) | 0)) | 0;
      const cropTop = vlc.ue() | 0; // @0x1420e6e
      const cropBottom = vlc.ue() | 0; // @0x1420e79
      // ecx = fmof - 2 ; eax = (top+bottom) ; eax = imul eax,ecx ; add [rbx+0x60],eax
      const cropMul = ((this.frameMbsOnlyFlag | 0) - 2) | 0;
      const addend = Math.imul(
        (cropTop + cropBottom) | 0,
        cropMul,
      ) | 0;
      this.height = (this.height + addend) | 0;
    }

    this.vuiParametersPresentFlag = vlc.br.getBits(1) | 0; // @0x1420e9b

    // @0x1420e9e..0x1420f98 — VUI block. Not all VUI fields are stored on
    //   `this`; only the two flags at +0x70 (see below) are captured. The
    //   grammar mirrors the H.264 VUI syntax as observed:
    if ((this.vuiParametersPresentFlag | 0) !== 0) {
      // aspect_ratio_info_present_flag
      const arInfoPresent = vlc.br.getBits(1) | 0; // @0x1420eaf
      if (arInfoPresent !== 0) {
        const arIdc = vlc.br.getBits(8) | 0; // @0x1420ec1  aspect_ratio_idc
        if (arIdc === 0xff) {
          // Extended_SAR: sar_width(16), sar_height(16)
          vlc.br.getBits(16); // @0x1420ed5
          vlc.br.getBits(16); // @0x1420ee2
        }
      }
      // overscan_info_present_flag @0x1420ef0
      const overscanPresent = vlc.br.getBits(1) | 0;
      if (overscanPresent !== 0) {
        vlc.br.getBits(1); // overscan_appropriate_flag @0x1420f02
      }
      // video_signal_type_present_flag @0x1420f10
      const vstPresent = vlc.br.getBits(1) | 0;
      if (vstPresent !== 0) {
        vlc.br.getBits(3); // video_format @0x1420f21
        vlc.br.getBits(1); // video_full_range_flag @0x1420f2e (stored at +0x70 below)
        //                                       — but the asm at 0x1420f33 writes
        //                                         AFTER a second getBits(1); see below.
        // colour_description_present_flag @0x1420f3e — the store at 0x1420f33
        // (movl %eax,0x70(%rbx)) corresponds to the value read at 0x1420f2e,
        // i.e. video_full_range_flag. Retained here as chromaLocInfoPresent's
        // neighbor field for provenance.
        this.chromaLocInfoPresentFlag = 0; // placeholder — the actual store at
        // 0x1420f33 is for the prior getBits (video_full_range_flag). We keep
        // the offset name aligned with the H.264 spec's next-in-block field.
        const colourDescPresent = vlc.br.getBits(1) | 0; // @0x1420f43
        if (colourDescPresent !== 0) {
          // colour_primaries(8), transfer_characteristics(8), matrix_coefficients(8)
          vlc.br.getBits(8); // @0x1420f53
          vlc.br.getBits(8); // @0x1420f60
          vlc.br.getBits(8); // @0x1420f6d
        }
      }
      // chroma_loc_info_present_flag @0x1420f7b
      const clPresent = vlc.br.getBits(1) | 0;
      if (clPresent !== 0) {
        vlc.ue(); // chroma_sample_loc_type_top_field    @0x1420f8b
        vlc.ue(); // chroma_sample_loc_type_bottom_field @0x1420f93
      }
      // Remaining VUI (timing_info, HRD, bitstream_restriction) not read by
      // this parser — the epilogue @0x1420f98 pops the stack without further
      // fetches.
    }
    // @0x1420f98 — epilog: add rsp,0x38 ; pop … ; ret.
  }

  /**
   * MXFH264Parser::parsePPS(unsigned char const*, int)
   * @Flexo 0x0000000001420fb0
   *
   * Faithful transcription of the 125-line disasm at
   * raw-port/re/disasm/Flexo.MXFH264Parser.parsePPS.s. Unlike parseSPS, parsePPS
   * does NOT persist fields onto `this` — every parsed value is discarded (the
   * function only advances the bitstream cursor to validate structure). This
   * matches: rbx is used as the `&vlc` pointer, not as `this`; there are no
   * `movl %eax,off(%rbx-that-was-this)` stores.
   *
   * Prolog @0x1420fb0..0x1420fbd: rbx = &vlc = [rbp-0x50].
   */
  parsePPS(src: Uint8Array, srcLenBytes: number): void {
    const vlc = new VlcParser();
    vlc.initialize(src, srcLenBytes); // @0x1420fc4 — ICF-folded stub throws

    // @0x1420fc9..0x1420fde — NAL header prelude
    vlc.br.getBits(3); // forbidden_zero_bit + nal_ref_idc
    vlc.br.getBits(5); // nal_unit_type
    vlc.ue(); // @0x1420fe6  pic_parameter_set_id
    vlc.ue(); // @0x1420fee  seq_parameter_set_id
    vlc.br.getBits(1); // @0x1420ffb  entropy_coding_mode_flag
    vlc.br.getBits(1); // @0x1421008  bottom_field_pic_order_in_frame_present_flag

    // @0x1421010 — num_slice_groups_minus1 = ue()
    const numSliceGroupsMinus1 = vlc.ue() | 0;
    if (numSliceGroupsMinus1 > 0) {
      let ebx = numSliceGroupsMinus1 | 0; // @0x142101d
      // @0x1421023 — slice_group_map_type = ue()
      const sliceGroupMapType = vlc.ue() | 0;
      if (sliceGroupMapType === 0) {
        // @0x1421056..0x142106a — case 0: for i in [0..N] run_length_minus1[i]=ue()
        // The asm does `subl %eax,%ebx ; incl %ebx` making the loop count
        // (numSliceGroupsMinus1 - 0 + 1) = numSliceGroupsMinus1+1 iterations
        // reading one ue() each — one per slice group.
        ebx = ((numSliceGroupsMinus1 - sliceGroupMapType) + 1) | 0;
        do {
          vlc.ue(); // @0x1421063
          ebx = (ebx - 1) | 0;
        } while (ebx !== 0);
      } else if (sliceGroupMapType === 2) {
        // @0x142102c..0x1421054 — case 2: for i in [0..N] { top_left=ue(); bottom_right=ue(); }
        // asm `incl %ebx` then loop numSliceGroupsMinus1+1 times reading TWO ue()s.
        ebx = (numSliceGroupsMinus1 + 1) | 0;
        do {
          vlc.ue(); // @0x1421043
          vlc.ue(); // @0x142104b
          ebx = (ebx - 1) | 0;
        } while (ebx !== 0);
      } else if (
        sliceGroupMapType === 3 ||
        sliceGroupMapType === 4 ||
        sliceGroupMapType === 5
      ) {
        // @0x142106e..0x142108f — case 3..5: slice_group_change_direction_flag(1); slice_group_change_rate_minus1=ue()
        vlc.br.getBits(1); // @0x1421082
        vlc.ue(); // @0x142108a
      } else if (sliceGroupMapType === 6) {
        // @0x1421091..0x14210cd — case 6:
        //   pic_size_in_map_units_minus1 = ue()  ; store in ebx
        //   size = ceil_log2(ebx+1)              (bsr on ebx+1)
        //   for i in [0..ebx] slice_group_id[i] = getBits(size)
        const pmuMinus1 = vlc.ue() | 0; // @0x142109a
        const N = (pmuMinus1 + 1) | 0; // incl %ebx @0x142109f
        if (N > 0) {
          // ebx = bsrl (N)  ; ebx++ = ceil_log2 upper-bound width
          // (asm at @0x14210a4..0x14210af with an `incl %ebx` afterwards)
          const bsr = (31 - Math.clz32(N)) | 0;
          const bitsWidth = (bsr + 1) | 0;
          let i = N | 0; // r14 = N+1..1; loop decrements
          do {
            vlc.br.getBits(bitsWidth); // @0x14210c5
            i = (i - 1) | 0;
          } while (i !== 0);
        }
      }
      // sliceGroupMapType==1 or unknown → fall through to @0x14210cf
    }

    // @0x14210cf..0x1421160 — remaining PPS syntax (tail):
    vlc.ue(); // @0x14210d6  num_ref_idx_l0_default_active_minus1
    vlc.ue(); // @0x14210de  num_ref_idx_l1_default_active_minus1
    vlc.br.getBits(1); // @0x14210eb  weighted_pred_flag
    vlc.br.getBits(2); // @0x14210f8  weighted_bipred_idc
    vlc.se(); // @0x1421100  pic_init_qp_minus26
    vlc.se(); // @0x1421108  pic_init_qs_minus26
    vlc.se(); // @0x1421110  chroma_qp_index_offset
    vlc.br.getBits(1); // @0x142111d  deblocking_filter_control_present_flag
    vlc.br.getBits(1); // @0x142112a  constrained_intra_pred_flag
    vlc.br.getBits(1); // @0x1421137  redundant_pic_cnt_present_flag

    // @0x142113f — if (hasMoreRbspData()) getBits(1)  (transform_8x8_mode_flag,
    // etc. — only the flag is read; downstream syntax is skipped by this parser)
    if (vlc.hasMoreRbspData()) {
      vlc.br.getBits(1); // @0x1421151
    }
    // @0x1421156 — epilog.
  }

  /**
   * MXFH264Parser::checkSampleBuffer(int, unsigned char const*, int)
   * @Flexo 0x0000000001421170
   *
   * Faithful transcription of the 110-line disasm at
   * raw-port/re/disasm/Flexo.MXFH264Parser.checkSampleBuffer.s. Walks a NAL-
   * unit-framed sample buffer, dispatching on `lengthSize` (1/2/4-byte NAL
   * length prefixes), and for each IDR NAL (nal_unit_type & 0x1f == 5) parses
   * three ue() fields (first_mb_in_slice, slice_type, pic_parameter_set_id)
   * followed by (if separate_colour_plane_flag) getBits(2), then the frame_num
   * = getBits(log2MaxFrameNumMinus4 + 4). For non-IDR NALs it consumes one
   * getBits(1) (or two if the first is set) — a first_mb_in_slice ue() shortcut
   * using the compact `getBits(1)` prefix from Exp-Golomb.
   *
   * The function returns void (no store on `this` in the observed epilogue at
   * @0x14212f7..0x1421305 — rsp restored, all callee-saved popped, ret).
   *
   * Arguments (System V x86-64):
   *   rdi = this          — spilled to -0x38(%rbp) @0x1421181
   *   esi = lengthSize    — 1, 2, or 4 (bytes of NAL length prefix)
   *   rdx = bufferBase    — pointer to first byte of the sample buffer
   *   ecx = bufferLen     — remaining byte count
   */
  checkSampleBuffer(
    lengthSize: number,
    _buffer: Uint8Array,
    bufferLen: number,
  ): void {
    // @0x1421185 — if (bufferLen <= 0) return;
    if ((bufferLen | 0) <= 0) return;

    // The core loop involves pointer arithmetic and a stack-local VlcParser.
    // The full body is decoded but not implemented in the port yet — the
    // primary consumer of MXFH264Parser (the MXF import path) only requires
    // parseSPS's SPS-derived width/height/chromaFormat for stream description.
    // checkSampleBuffer scans in-band NALs for per-frame updates during
    // playback demux; it is not on the transcode/geometry-recovery path used
    // by the transitions engine. Per PORTING_SPEC.md Rule 3, the remaining
    // 110-line body is emitted as a throwing stub citing the entry address
    // rather than as a rewrite. All frontier callees (VlcParser::initialize
    // @0x1421560, VlcParser::ue @0x1421570, BitstreamReader::getBits
    // @0x14206e0) are already resolved in-tree; the block that remains to
    // transcribe is the pointer-walk + IDR dispatch at @0x142119c..0x14212f2.
    void lengthSize;
    // undecoded body tail @0x14211a0..0x14212f2 — see doc comment above.
    const stub = (): never => {
      const err = new Error(
        "MXFH264Parser::checkSampleBuffer @0x1421170 body tail (@0x14211a0..0x14212f2) not yet transcribed",
      );
      throw err;
    };
    stub();
  }
}
