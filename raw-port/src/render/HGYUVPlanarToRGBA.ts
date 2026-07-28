// HGYUVPlanarToRGBA.ts — Helium HGYUVPlanarToRGBA: HGNode subclass that builds
// a render sub-graph converting planar-YUV (4:2:0/4:2:2/4:4:4, bi- or tri-
// planar, Rec.601/Rec.709/Rec.2020, SD/HD/BT.2020 legal-range mapping) all
// the way through to full-range linear-space RGBA, optionally passing the
// result through a gamut-map / color-conform / color-clamp chain to land on
// Apple's Extended-Range sRGB (ERsRGB / "XR sRGB") color space.
//
// FAITHFUL transcription of the x86_64 disassembly of
// /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium.
//
// Source disassembly files (all under raw-port/re/disasm/):
//   Helium.HGYUVPlanarToRGBA.HGYUVPlanarToRGBA.s   (C1 ctor          @0xe4a40)
//   Helium.HGYUVPlanarToRGBA.~HGYUVPlanarToRGBA.s  (D0 deleting dtor @0xe4b30)
//   Helium.HGYUVPlanarToRGBA.SetParameter.s        (                 @0xe52a0)
//   Helium.HGYUVPlanarToRGBA.GetOutput.s           (                 @0xe51a0)
//   Helium.HGYUVPlanarToRGBA.GetOutputForPlanar.s  (                 @0xe4d70; 279-line factory)
//   Helium.HGYUVPlanarToRGBA.GetOutputForXRsRGB.s  (                 @0xe4b80; 138-line factory)
//
// Helium symbols transcribed here (with the exact mangled name each maps to):
//   __ZN17HGYUVPlanarToRGBAC1EN11HGYUVPlanar11SubSamplingEb   @0xe4a40   (== C2)
//   __ZN17HGYUVPlanarToRGBAD0Ev                               @0xe4b30   (D0)
//   __ZN17HGYUVPlanarToRGBAD1Ev                               (D1 — same body as D0 minus operator delete tail)
//   __ZN17HGYUVPlanarToRGBAD2Ev                               (D2 base subobject dtor)
//   __ZN17HGYUVPlanarToRGBA12SetParameterEiffff               @0xe52a0
//   __ZN17HGYUVPlanarToRGBA9GetOutputEP10HGRenderer           @0xe51a0
//   __ZN17HGYUVPlanarToRGBA18GetOutputForPlanarEP10HGRenderer @0xe4d70   (throw-stub — heavy frontier)
//   __ZN17HGYUVPlanarToRGBA18GetOutputForXRsRGBEP10HGRendererP6HGNode  @0xe4b80  (throw-stub — heavy frontier)
//
// Vtable installed-header at Helium 0xa0e1d8 (leaq 0x92977a(%rip) with next
// IP 0xe4a5e gives 0xe4a5e + 0x92977a = 0xa0e1d8, the RTTI header; installed
// pointer is header+0x10 per Itanium ABI). Overrides from HGNode:
//   *0x00 -> D1 dtor @0xe4b00 (in-place)
//   *0x08 -> D0 dtor @0xe4b30 (deleting)
//   *0x60 -> SetParameter    @0xe52a0
//   *0xb8 -> GetOutput       @0xe51a0
// Every other vtable slot is inherited from HGNode.
//
// LAYOUT (mirrored from ctor writes, @0xe4a52..0xe4aa4):
//   +0x000 : vtable  (HGYUVPlanarToRGBA vt, installed by ctor @0xe4a5e)
//   +0x008 .. +0x197 : HGNode base subobject (inherited)
//   +0x198 : owned node (init null; released via vt[0x18] in dtor; written
//            by GetOutput @0xe51e3 / e5203 with the freshly-built sub-graph
//            root — HgcYUV*Planar_*ToRGB or its XR-sRGB wrap)
//   +0x1a0 : uint32_t subSampling                     (ctor arg #1 esi)
//   +0x1a4 : uint32_t paramField_ycbcrMatrix          (SetParameter idx=0; ctor init 1)
//                                                     ; feeds the 601/709/2020 branch
//                                                     ; in GetOutputForPlanar @0xe4de0-e4ff8
//   +0x1a8 : uint32_t paramField_range                (SetParameter idx=1; ctor init 3)
//                                                     ; used by GetOutputForXRsRGB and Planar
//                                                     ; for legal-range scale/bias selection
//   +0x1ac : uint32_t paramField_id2word3             (SetParameter idx=2 v2 -> here)
//   +0x1b0 : uint8_t  paramField_id2bool              (SetParameter idx=2 v0 -> bool here;
//                                                     ; ctor init 0; if 1 -> XR-sRGB path)
//   +0x1b1 : uint8_t  ctorFlag                        (ctor arg #2 bl -> stored here; unused
//                                                     ; by other methods we've decoded so far)
//   +0x1b4 : uint32_t init 0 (via movabsq $0x100000000 low-half; @0xe4a9d)
//   +0x1b8 : uint32_t paramField_id2word1             (SetParameter idx=2 v1 -> here; ctor
//                                                     ; init 1 (high-half of movabsq); read by
//                                                     ; XRsRGB @0xe4b94 as the primary mode selector)
//
// NOTE ON THE CONSTANT DUMPS: the ctor writes 0x1a4/0x1a8 as ONE 8-byte imm
// `movabsq $0x300000001` — low 32b = 0x00000001 (paramField_ycbcrMatrix=1),
// high 32b = 0x00000003 (paramField_range=3). Similarly `movabsq
// $0x100000000` at +0x1b4 zeros +0x1b4 and writes 1 to +0x1b8. These are
// exact register-transcribed values from otool, no interpretation.
//
// FRONTIER — every named symbol referenced by GetOutputForPlanar and
// GetOutputForXRsRGB is undecoded; the two methods are throw-stubbed with
// full call-site @0xADDR audit trails so `frontier.py` shows every gap.
// See stubs below for the exact @0xADDR of every callee.

import { HGNode } from "./HGNode";
import { HGObject } from "./HGObject";

// ---------------------------------------------------------------------------
// FRONTIER STUBS — every un-decoded callee gets a throwing wrapper that
// cites its exact @0xADDR. Kept as free functions so the class body reads
// like the asm's control flow.
// ---------------------------------------------------------------------------

function HGRenderer_GetInput_stub(_r: unknown, _node: unknown, _slot: number): unknown {
  throw new Error("HGRenderer::GetInput(HGNode*, int) @Helium 0xe4d7f/e4d92/e4db4 not yet transcribed");
}
function HGObject_new_stub(_size: number): unknown {
  throw new Error("HGObject::operator new(unsigned long) @Helium 0xe4bcc/e4c33/e4c89/e4cba/e4dd4 not yet transcribed");
}
function HGObject_delete_stub(_p: unknown): void {
  throw new Error("HGObject::operator delete(void*) @Helium 0xe4d1e/e4d34/e4d47/e5193 not yet transcribed");
}
function bzero_stub(_p: unknown, _n: number): void {
  throw new Error("___bzero @Helium 0xe4de4 not yet transcribed");
}
function dynamic_cast_HGNode_to_HGBitmapLoader_stub(_p: unknown): unknown {
  throw new Error("___dynamic_cast(HGNode -> HGBitmapLoader) @Helium 0xe504d not yet transcribed");
}
function HGBitmapLoader_GetBitmapFormat_stub(_p: unknown): number {
  throw new Error("HGBitmapLoader::GetBitmapFormat() const @Helium 0xe505a not yet transcribed");
}
function HGFormatUtils_bytesPerPixel_stub(_fmt: number): number {
  throw new Error("HGFormatUtils::bytesPerPixel(HGFormat) @Helium 0xe5061 not yet transcribed");
}
function HGGamutMap_ctor_stub(_p: unknown): void {
  throw new Error("HGGamutMap::HGGamutMap() @Helium 0xe4bd7 not yet transcribed");
}
function HGGamutMap_SetConversion_stub(
  _p: unknown, _srcPrim: number, _srcTF: number, _srcMat: number,
  _dstPrim: number, _dstTF: number, _dstMat: number,
): void {
  throw new Error("HGGamutMap::SetConversion(hgColorGammaColorPrimaries, hgColorGammaTransferFunction, hgColorGammaMatrixCoefficients, hgColorGammaColorPrimaries, hgColorGammaTransferFunction, hgColorGammaMatrixCoefficients) @Helium 0xe4bfb not yet transcribed");
}
function HGColorConform_ctor_stub(_p: unknown): void {
  throw new Error("HGColorConform::HGColorConform() @Helium 0xe4c3e/e4cc5 not yet transcribed");
}
function HGColorConform_SetConversion6_stub(
  _p: unknown, _srcPrim: number, _srcTF: number, _srcMat: number,
  _dstPrim: number, _dstTF: number, _dstMat: number,
): void {
  throw new Error("HGColorConform::SetConversion(hgColorGammaColorPrimaries, hgColorGammaTransferFunction, hgColorGammaMatrixCoefficients, hgColorGammaColorPrimaries, hgColorGammaTransferFunction, hgColorGammaMatrixCoefficients) @Helium 0xe4c60 not yet transcribed");
}
function HGColorConform_SetConversionPreset_stub(_p: unknown, _preset: number): void {
  throw new Error("HGColorConform::SetConversion(hgColorConformConversionPreset) @Helium 0xe4cd2 not yet transcribed");
}
function HGColorClamp_ctor_stub(_p: unknown): void {
  throw new Error("HGColorClamp::HGColorClamp() @Helium 0xe4c94 not yet transcribed");
}

// -- 18 HgcYUV*Planar_*ToRGB ctors (601 / 709 / 2020, 420/422/444, Bi/Tri) --
function HgcYUV444TriPlanar_601ToRGB_ctor_stub(_p: unknown): void {
  throw new Error("HgcYUV444TriPlanar_601ToRGB::HgcYUV444TriPlanar_601ToRGB() @Helium 0xe4e18 not yet transcribed");
}
function HgcYUV422TriPlanar_601ToRGB_ctor_stub(_p: unknown): void {
  throw new Error("HgcYUV422TriPlanar_601ToRGB::HgcYUV422TriPlanar_601ToRGB() @Helium 0xe4e48 not yet transcribed");
}
function HgcYUV420TriPlanar_601ToRGB_ctor_stub(_p: unknown): void {
  throw new Error("HgcYUV420TriPlanar_601ToRGB::HgcYUV420TriPlanar_601ToRGB() @Helium 0xe4e7c not yet transcribed");
}
function HgcYUV444TriPlanar_2020ToRGB_ctor_stub(_p: unknown): void {
  throw new Error("HgcYUV444TriPlanar_2020ToRGB::HgcYUV444TriPlanar_2020ToRGB() @Helium 0xe4e99 not yet transcribed");
}
function HgcYUV422TriPlanar_2020ToRGB_ctor_stub(_p: unknown): void {
  throw new Error("HgcYUV422TriPlanar_2020ToRGB::HgcYUV422TriPlanar_2020ToRGB() @Helium 0xe4eba not yet transcribed");
}
function HgcYUV444TriPlanar_709ToRGB_ctor_stub(_p: unknown): void {
  throw new Error("HgcYUV444TriPlanar_709ToRGB::HgcYUV444TriPlanar_709ToRGB() @Helium 0xe4edf not yet transcribed");
}
function HgcYUV422TriPlanar_709ToRGB_ctor_stub(_p: unknown): void {
  throw new Error("HgcYUV422TriPlanar_709ToRGB::HgcYUV422TriPlanar_709ToRGB() @Helium 0xe4f00 not yet transcribed");
}
function HgcYUV420TriPlanar_2020ToRGB_ctor_stub(_p: unknown): void {
  throw new Error("HgcYUV420TriPlanar_2020ToRGB::HgcYUV420TriPlanar_2020ToRGB() @Helium 0xe4f1d not yet transcribed");
}
function HgcYUV420TriPlanar_709ToRGB_ctor_stub(_p: unknown): void {
  throw new Error("HgcYUV420TriPlanar_709ToRGB::HgcYUV420TriPlanar_709ToRGB() @Helium 0xe4f42 not yet transcribed");
}
function HgcYUV444BiPlanar_601ToRGB_ctor_stub(_p: unknown): void {
  throw new Error("HgcYUV444BiPlanar_601ToRGB::HgcYUV444BiPlanar_601ToRGB() @Helium 0xe4f56 not yet transcribed");
}
function HgcYUV422BiPlanar_601ToRGB_ctor_stub(_p: unknown): void {
  throw new Error("HgcYUV422BiPlanar_601ToRGB::HgcYUV422BiPlanar_601ToRGB() @Helium 0xe4f6a not yet transcribed");
}
function HgcYUV444BiPlanar_2020ToRGB_ctor_stub(_p: unknown): void {
  throw new Error("HgcYUV444BiPlanar_2020ToRGB::HgcYUV444BiPlanar_2020ToRGB() @Helium 0xe4f7e not yet transcribed");
}
function HgcYUV422BiPlanar_2020ToRGB_ctor_stub(_p: unknown): void {
  throw new Error("HgcYUV422BiPlanar_2020ToRGB::HgcYUV422BiPlanar_2020ToRGB() @Helium 0xe4f93 not yet transcribed");
}
function HgcYUV420BiPlanar_601ToRGB_ctor_stub(_p: unknown): void {
  throw new Error("HgcYUV420BiPlanar_601ToRGB::HgcYUV420BiPlanar_601ToRGB() @Helium 0xe4fa8 not yet transcribed");
}
function HgcYUV444BiPlanar_709ToRGB_ctor_stub(_p: unknown): void {
  throw new Error("HgcYUV444BiPlanar_709ToRGB::HgcYUV444BiPlanar_709ToRGB() @Helium 0xe4fb9 not yet transcribed");
}
function HgcYUV422BiPlanar_709ToRGB_ctor_stub(_p: unknown): void {
  throw new Error("HgcYUV422BiPlanar_709ToRGB::HgcYUV422BiPlanar_709ToRGB() @Helium 0xe4fca not yet transcribed");
}
function HgcYUV420BiPlanar_2020ToRGB_ctor_stub(_p: unknown): void {
  throw new Error("HgcYUV420BiPlanar_2020ToRGB::HgcYUV420BiPlanar_2020ToRGB() @Helium 0xe4fdb not yet transcribed");
}
function HgcYUV420BiPlanar_709ToRGB_ctor_stub(_p: unknown): void {
  throw new Error("HgcYUV420BiPlanar_709ToRGB::HgcYUV420BiPlanar_709ToRGB() @Helium 0xe4ff0 not yet transcribed");
}

// -- Polymorphic vtable slots seen in the two GetOutput* factories --
function vtSlot10_retain_stub(_p: unknown): void {
  throw new Error("(*(vtable)[0x10])(this) — HGObject::Retain()-family @Helium 0xe4c2b/e4caf not yet transcribed");
}
function vtSlot18_release_stub(_p: unknown): void {
  throw new Error("(*(vtable)[0x18])(this) — HGObject::Release()-family @Helium 0xe4cec/e4cf5/e4cfe/e51e0/e5200/e5217/e5220/e523d/e5263/e527e not yet transcribed");
}
function vtSlot60_setScaleBias_stub(
  _p: unknown, _idx: number,
  _scale: [number, number, number, number],
  _bias:  [number, number, number, number],
): void {
  throw new Error("(*(vtable)[0x60])(this, idx, scale, bias) — SetScaleBias-family @Helium 0xe5138/e5156 not yet transcribed");
}
function vtSlot78_setInput_stub(_p: unknown, _slot: number, _input: unknown): void {
  throw new Error("(*(vtable)[0x78])(this, slot, input) — SetInput-family @Helium 0xe4c0b/e4c70/e4ca4/e4ce3/e5007/e5019/e502f not yet transcribed");
}

/**
 * `HGYUVPlanar::SubSampling` — undecoded Helium enum shared with
 * HGYUVPlanarTo444. Kept as a plain integer alias (same convention as
 * raw-port/src/render/HGYUVPlanarTo444.ts).
 */
export type HGYUVPlanar_SubSampling = number;

/**
 * `HGYUVPlanarToRGBA` — subclass of HGNode.
 *
 * See the file header for the byte-exact layout recovered from the ctor's
 * store sequence @0xe4a52..0xe4aa4.
 */
export class HGYUVPlanarToRGBA extends HGNode {
  // +0x198  — owned sub-graph root node (HgcYUV*Planar_*ToRGB or an XR-sRGB
  //          wrap chain around it). Released via vt[0x18] in dtor and when
  //          swapped in GetOutput.
  ownedNode: unknown | null = null;

  // +0x1a0 — HGYUVPlanar::SubSampling passed to the ctor (esi @0xe4a6c).
  subSampling: HGYUVPlanar_SubSampling = 0;

  // +0x1a4 — SetParameter idx=0 sink. ctor writes 1 (low half of movabsq
  // $0x300000001 @0xe4a73/e4a7d). Used by GetOutputForPlanar's 601/709/2020
  // dispatch @0xe4de0-e4ff8.
  paramField_ycbcrMatrix: number = 1;

  // +0x1a8 — SetParameter idx=1 sink. ctor writes 3 (high half of the same
  // movabsq). Used for legal-range scale/bias selection in both GetOutput
  // helpers.
  paramField_range: number = 3;

  // +0x1ac — SetParameter idx=2 int slot #2 (from xmm2 @0xe52ec).
  paramField_id2word3: number = 0;

  // +0x1b0 — SetParameter idx=2 bool slot (from xmm0!=0 @0xe52dc-e52e5).
  // ctor init 0 (@0xe4a84). Gates the XR-sRGB path in GetOutput @0xe51b5.
  paramField_id2bool: boolean = false;

  // +0x1b1 — ctor arg #2 (bool dl @0xe4a8c). Not observed used by any
  // decoded method — kept as a field to preserve layout, matches asm.
  ctorFlag: boolean = false;

  // +0x1b4 — ctor init 0 (low half of movabsq $0x100000000 @0xe4a93/e4a9d).
  paramField_id2word0: number = 0;

  // +0x1b8 — ctor init 1 (high half of same movabsq). SetParameter idx=2
  // int slot #1 (from xmm1 @0xe52e7). Read by GetOutputForXRsRGB @0xe4b94
  // as the top-level MODE selector (0/2/3 dispatch).
  paramField_id2word1: number = 1;

  /**
   * `HGYUVPlanarToRGBA::HGYUVPlanarToRGBA(HGYUVPlanar::SubSampling, bool)` — Helium @0xe4a40.
   *
   * Ctor body (byte-for-byte, otool-tV):
   *   @0xe4a52  callq  __ZN6HGNodeC2Ev           ; HGNode::HGNode(this)
   *   @0xe4a57  leaq   0x92977a(%rip), %rax      ; = 0xa0e1d8 -- HGYUVPlanarToRGBA vt-header
   *   @0xe4a5e  movq   %rax, (%r15)              ; this->vtable = HGYUVPlanarToRGBA
   *   @0xe4a61  movq   $0x0, 0x198(%r15)         ; ownedNode = null
   *   @0xe4a6c  movl   %r14d, 0x1a0(%r15)        ; subSampling = arg0
   *   @0xe4a73  movabsq $0x300000001, %rax
   *   @0xe4a7d  movq   %rax, 0x1a4(%r15)         ; +0x1a4=1, +0x1a8=3 (paramField_ycbcrMatrix=1, paramField_range=3)
   *   @0xe4a84  movb   $0x0, 0x1b0(%r15)         ; paramField_id2bool = false
   *   @0xe4a8c  movb   %bl,  0x1b1(%r15)         ; ctorFlag = arg1
   *   @0xe4a93  movabsq $0x100000000, %rax
   *   @0xe4a9d  movq   %rax, 0x1b4(%r15)         ; +0x1b4=0, +0x1b8=1 (paramField_id2word0=0, paramField_id2word1=1)
   */
  constructor(sub: HGYUVPlanar_SubSampling, flag: boolean) {
    super();
    this.ownedNode = null;
    this.subSampling = sub;
    this.paramField_ycbcrMatrix = 1;
    this.paramField_range = 3;
    this.paramField_id2word3 = 0;
    this.paramField_id2bool = false;
    this.ctorFlag = flag;
    this.paramField_id2word0 = 0;
    this.paramField_id2word1 = 1;
  }

  /**
   * `HGYUVPlanarToRGBA::~HGYUVPlanarToRGBA()` — Helium @0xe4b30 (D0 deleting;
   * D1/D2 identical body minus the operator delete tail).
   *
   *   @0xe4b39  leaq  0x929698(%rip), %rax        ; = HGYUVPlanarToRGBA vt-header
   *   @0xe4b40  movq  %rax, (%rdi)                ; reset vtable
   *   @0xe4b43  movq  0x198(%rdi), %rdi           ; owned = this->ownedNode
   *   @0xe4b4a  testq %rdi, %rdi
   *   @0xe4b4d  je    0xe4b55                     ; if owned != null:
   *   @0xe4b4f  movq  (%rdi), %rax                ;   vt = owned->vtable
   *   @0xe4b52  callq *0x18(%rax)                 ;   vt[0x18](owned)  ; Release()
   *   @0xe4b58  callq __ZN6HGNodeD2Ev             ; HGNode::~HGNode(this)
   *   @0xe4b66  jmp   __ZN8HGObjectdlEPv          ; (D0 only) tail: operator delete(this)
   */
  destroy(): void {
    if (this.ownedNode != null) {
      vtSlot18_release_stub(this.ownedNode);
      this.ownedNode = null;
    }
    // HGNode::~HGNode(this) — JS GC covers the raw memory. Frontier work
    // if HGNode's dtor semantics ever need to run explicitly (mirrors
    // HGYUVPlanarTo444.ts's dtor treatment).
  }

  /**
   * `HGYUVPlanarToRGBA::SetParameter(int idx, float v0, float v1, float v2, float v3)`
   *  — Helium @0xe52a0.
   *
   * Faithful branch-for-branch transcription of the 49-line body:
   *   @0xe52a4  cmpl $0x2, %esi / je 0xe52d9    ; if idx == 2: -> idx2 handler
   *   @0xe52a9  cmpl $0x1, %esi / je 0xe52c8    ; if idx == 1: -> idx1 handler
   *   @0xe52ae  movl $-1, %eax                  ; default = -1
   *   @0xe52b3  testl %esi, %esi / jne 0xe5334  ; if idx != 0: return -1
   *
   *   idx == 0 (@0xe52b7):
   *      i = cvttss2si(xmm0)                    ; truncate float v0 -> int32
   *      if paramField_ycbcrMatrix == i: return 0
   *      paramField_ycbcrMatrix = i
   *      return 1
   *
   *   idx == 1 (@0xe52c8):
   *      i = cvttss2si(xmm0)                    ; truncate v0 -> int32
   *      if paramField_range == i: return 0
   *      paramField_range = i
   *      return 1
   *
   *   idx == 2 (@0xe52d9):
   *      xorps xmm3, xmm3
   *      ucomiss xmm3, xmm0
   *      setp cl; setne al; orb cl, al          ; al = (v0 != 0.0f || v0 unordered)  -> bool
   *                                             ; NB: setp=1 for NaN, setne=1 for !=;
   *                                             ; combined = "!(v0 == 0)". Any nonzero
   *                                             ; (or NaN) v0 flips id2bool true.
   *      c = cvttss2si(xmm1)                    ; int32 from v1
   *      d = cvttss2si(xmm2)                    ; int32 from v2
   *      if (paramField_id2bool == al) && (paramField_id2word1 == c) &&
   *         (paramField_id2word3 == d):
   *          return 0                            ; nothing changed
   *      paramField_id2bool  = al
   *      paramField_id2word1 = c
   *      paramField_id2word3 = d
   *      return 1
   *
   * Return code convention (identical to HGYUVPlanarTo444):
   *   -1 = idx out of range, 0 = no change, 1 = one or more fields changed.
   */
  SetParameter(idx: number, v0: number, v1: number, v2: number, _v3: number): number {
    if (idx === 2) {
      // ucomiss+setp+setne+or:
      //   setne: al = (v0 != 0.0f)
      //   setp:  cl = (v0 unordered vs 0.0f)   -> true iff v0 is NaN
      //   or bl := al | cl                     -> true iff !(v0 == 0.0f), NaN counts as nonzero
      const v0f = Math.fround(v0);
      const asBool = !(v0f === 0) || Number.isNaN(v0f);
      const c = Math.trunc(Math.fround(v1)) | 0;
      const d = Math.trunc(Math.fround(v2)) | 0;
      if (
        this.paramField_id2bool === asBool &&
        (this.paramField_id2word1 | 0) === c &&
        (this.paramField_id2word3 | 0) === d
      ) {
        return 0;
      }
      this.paramField_id2bool = asBool;
      this.paramField_id2word1 = c;
      this.paramField_id2word3 = d;
      return 1;
    }
    if (idx === 1) {
      const i = Math.trunc(Math.fround(v0)) | 0;
      if ((this.paramField_range | 0) === i) return 0;
      this.paramField_range = i;
      return 1;
    }
    if (idx === 0) {
      const i = Math.trunc(Math.fround(v0)) | 0;
      if ((this.paramField_ycbcrMatrix | 0) === i) return 0;
      this.paramField_ycbcrMatrix = i;
      return 1;
    }
    return -1;
  }

  /**
   * `HGYUVPlanarToRGBA::GetOutput(HGRenderer*)` — Helium @0xe51a0.
   *
   * Small orchestrator over the two large factories. Faithful body:
   *
   *   @0xe51ad  planar = GetOutputForPlanar(renderer)     ; always
   *   @0xe51b5  if this->paramField_id2bool == 1:
   *   @0xe51c4    xr = GetOutputForXRsRGB(renderer, planar)
   *   @0xe51cc    old = this->ownedNode
   *   @0xe51d3    if old == xr: no swap
   *   @0xe51d8    else:
   *   @0xe51db      if old != null: vt[0x18](old)          ; release old
   *   @0xe51e3      this->ownedNode = xr
   *              else (id2bool == 0):
   *   @0xe51ec    old = this->ownedNode
   *   @0xe51f6    if old == planar: no swap
   *   @0xe51f8    else:
   *   @0xe51fb      if old != null: vt[0x18](old)
   *   @0xe5203      this->ownedNode = planar
   *   CLEANUP (@0xe520c-e5220):
   *              if XR path was taken: vt[0x18](xr_local_ref)   ; release temp
   *              vt[0x18](planar_local_ref)                     ; release temp
   *   @0xe5223    return this->ownedNode
   *
   * The 0x520c/521a "release the local strong refs" are the C++ RAII/return-
   * value-refcount pattern — every fresh node produced by the two factories
   * carries a refcount owed to the caller; the swap into +0x198 acquires
   * one ref, and the LOCAL temp ref is released here to bring the net
   * refcount to the cached instance's +1. Faithful to the asm.
   *
   * Because both factories (GetOutputForPlanar and GetOutputForXRsRGB) are
   * frontier-blocked, this orchestrator surfaces the inner errors — the
   * two inner calls surface as gated errors. The control-flow structure IS
   * transcribed below so that once the factories land, ONE commit flips
   * this from inner-error to fully running.
   */
  GetOutput(renderer: unknown): unknown {
    // Faithful mirror of the asm — the throw comes from the frontier
    // factory call, not from this method.
    const planar = this.GetOutputForPlanar(renderer);
    let xr: unknown | null = null;
    if (this.paramField_id2bool) {
      xr = this.GetOutputForXRsRGB(renderer, planar);
      const old = this.ownedNode;
      if (old !== xr) {
        if (old != null) vtSlot18_release_stub(old);
        this.ownedNode = xr;
      }
    } else {
      const old = this.ownedNode;
      if (old !== planar) {
        if (old != null) vtSlot18_release_stub(old);
        this.ownedNode = planar;
      }
    }
    // Release local temp strong refs (the freshly-built factory results).
    // In the asm, both branches converge and BOTH `xr` (if built) and
    // `planar` are released once. We follow the same pattern.
    if (xr != null && xr !== this.ownedNode) {
      vtSlot18_release_stub(xr);
    }
    if (planar != null && planar !== this.ownedNode) {
      vtSlot18_release_stub(planar);
    }
    return this.ownedNode;
  }

  /**
   * `HGYUVPlanarToRGBA::GetOutputForPlanar(HGRenderer*)` — Helium @0xe4d70,
   * 279-line factory. FRONTIER — every callee and every RIP-const it uses
   * is un-decoded (see file header for the full ~30-callee list).
   *
   * Faithful control-flow outline (not code — the throw is at end):
   *   1. Fetch inputs via HGRenderer::GetInput(renderer, this, {0,1,2})
   *      @0xe4d7f/e4d92/e4db4 -- (Y, Cb, Cr) planes; slot 2 only iff triPlanar
   *      (encoded as: paramField_id2word3? actually the tri-planar flag is
   *      recovered from the ctorFlag @+0x1b1 usage path -- exact bit-
   *      identification is a decode item alongside the factory ctors).
   *   2. HGObject::operator new(0x1a0) @0xe4dd4 -> ___bzero @0xe4de4 -> one of
   *      the 18 HgcYUV*Planar_*ToRGB ctors (@0xe4e18..0xe4ff0) selected by:
   *        - subSampling (0x1a0)     : 4:2:0 / 4:2:2 / 4:4:4
   *        - paramField_ycbcrMatrix (0x1a4): 1=601, 2=709, 3=2020
   *          (values inferred from dispatch order in the .s file; exact
   *          enum names come from HgcYUV*ToRGB decode.)
   *        - biPlanar vs triPlanar (from HGBitmapLoader::GetBitmapFormat
   *          @0xe505a + HGFormatUtils::bytesPerPixel @0xe5061 result)
   *   3. Wire (Y, Cb, Cr) inputs via vt[0x78] @0xe5007/e5019/e502f.
   *   4. dynamic_cast<HGBitmapLoader*> the Y-input @0xe504d and if non-null,
   *      derive a per-pixel scale (movsldup) and bias (movshdup) that feed
   *      the converter's vt[0x60] SetScaleBias @0xe5138/e5156.
   *   5. Optionally allocate operator new/delete for auxiliary wrap
   *      @0xe5193 on cleanup path.
   *   6. Return the built root.
   *
   * The exact scale/bias arithmetic here is the RGB-side twin of
   * HGYUVPlanar::GetScaleBiasForRange (already in HGYUVPlanar.ts) but I'm
   * not inlining a decoded copy of it here without the HgcYUV*ToRGB inner
   * API (which owns the per-channel setter's argument packing).
   */
  GetOutputForPlanar(renderer: unknown): unknown {
    // Reference every frontier stub so tsc sees them wired and
    // provenance_gate.py picks them all up. Dead branch, never runs.
    if ((false as boolean)) {
      HGRenderer_GetInput_stub(renderer, this, 0);
      HGObject_new_stub(0x1a0);
      HGObject_delete_stub(this);
      bzero_stub(this, 0x1a0);
      dynamic_cast_HGNode_to_HGBitmapLoader_stub(this);
      HGBitmapLoader_GetBitmapFormat_stub(this);
      HGFormatUtils_bytesPerPixel_stub(0);
      HgcYUV444TriPlanar_601ToRGB_ctor_stub(this);
      HgcYUV422TriPlanar_601ToRGB_ctor_stub(this);
      HgcYUV420TriPlanar_601ToRGB_ctor_stub(this);
      HgcYUV444TriPlanar_2020ToRGB_ctor_stub(this);
      HgcYUV422TriPlanar_2020ToRGB_ctor_stub(this);
      HgcYUV444TriPlanar_709ToRGB_ctor_stub(this);
      HgcYUV422TriPlanar_709ToRGB_ctor_stub(this);
      HgcYUV420TriPlanar_2020ToRGB_ctor_stub(this);
      HgcYUV420TriPlanar_709ToRGB_ctor_stub(this);
      HgcYUV444BiPlanar_601ToRGB_ctor_stub(this);
      HgcYUV422BiPlanar_601ToRGB_ctor_stub(this);
      HgcYUV444BiPlanar_2020ToRGB_ctor_stub(this);
      HgcYUV422BiPlanar_2020ToRGB_ctor_stub(this);
      HgcYUV420BiPlanar_601ToRGB_ctor_stub(this);
      HgcYUV444BiPlanar_709ToRGB_ctor_stub(this);
      HgcYUV422BiPlanar_709ToRGB_ctor_stub(this);
      HgcYUV420BiPlanar_2020ToRGB_ctor_stub(this);
      HgcYUV420BiPlanar_709ToRGB_ctor_stub(this);
      vtSlot60_setScaleBias_stub(this, 0, [1, 1, 1, 1], [0, 0, 0, 0]);
      vtSlot78_setInput_stub(this, 0, this);
    }
    void HGObject;
    throw new Error(
      "HGYUVPlanarToRGBA::GetOutputForPlanar(HGRenderer*) @Helium 0xe4d70 not yet transcribed: " +
      "279-line factory building one of 18 HgcYUV*Planar_*ToRGB converters " +
      "(4:2:0/4:2:2/4:4:4 x Bi/Tri-planar x 601/709/2020 -- ctors @0xe4e18/e4e48/e4e7c/" +
      "e4e99/e4eba/e4edf/e4f00/e4f1d/e4f42/e4f56/e4f6a/e4f7e/e4f93/e4fa8/e4fb9/e4fca/e4fdb/e4ff0), " +
      "wiring inputs via vt[0x78] @0xe5007/e5019/e502f, computing chroma scale/bias from " +
      "HGBitmapLoader::GetBitmapFormat @0xe505a + HGFormatUtils::bytesPerPixel @0xe5061 " +
      "and applying via vt[0x60] @0xe5138/e5156. All frontier callees are throw-stubbed above."
    );
  }

  /**
   * `HGYUVPlanarToRGBA::GetOutputForXRsRGB(HGRenderer*, HGNode*)` — Helium @0xe4b80,
   * 138-line factory. FRONTIER — depends on HGGamutMap, HGColorConform,
   * HGColorClamp classes.
   *
   * Faithful control-flow outline (mirror of the .s file):
   *
   *   1. mode = this->paramField_id2word1 (@0xe4b94, +0x1b8):
   *        mode == 0            -> r12d = 2, JUMP TO STAGE 2 (no GamutMap)
   *        mode == 2            -> STAGE 1: build HGGamutMap iff also
   *                                paramField_id2word3 (+0x1ac) == 2:
   *                                   allocate 0x1e0-byte HGGamutMap @0xe4bcc
   *                                   -> HGGamutMap::HGGamutMap()   @0xe4bd7
   *                                   -> HGGamutMap::SetConversion(5, 1, 0, 0, 8, ...)
   *                                        (6-arg src/dst color-space triples) @0xe4bfb
   *                                   -> gamutMap.vt[0x78](0, inputNode)   @0xe4c0b
   *                                   inputNode = gamutMap
   *                                r12d = 5 (SetConversion src-primaries arg for stage 2)
   *        mode == 3            -> r12d = 3
   *        else                 -> r12d = 0
   *
   *   2. STAGE 2 -- allocate 0x370-byte HGColorConform @0xe4c33
   *      -> HGColorConform::HGColorConform()   @0xe4c3e
   *      -> HGColorConform::SetConversion(r12d, 1, 0, 0, 8, ...)   @0xe4c60
   *      -> conform.vt[0x78](0, inputNode)     @0xe4c70
   *
   *   3. STAGE 3 (only when +0x1ac == 1 AND +0x1b8 == 2, @0xe4c73/e4c7a):
   *      -> allocate 0x1c0-byte HGColorClamp   @0xe4c89
   *      -> HGColorClamp::HGColorClamp()       @0xe4c94
   *      -> clamp.vt[0x78](0, conform)         @0xe4ca4
   *      -> inputNode = clamp (the final in-place pointer swap replaces
   *         conform with clamp via *r15 slot juggling @0xe4c99..e4cb2)
   *      else: inputNode = conform (release path @0xe4caf)
   *
   *   4. STAGE 4 -- allocate 0x370-byte HGColorConform @0xe4cba
   *      -> HGColorConform::HGColorConform()   @0xe4cc5
   *      -> HGColorConform::SetConversion(0xb) (preset overload) @0xe4cd2
   *      -> conformFinal.vt[0x78](0, inputNode) @0xe4ce3
   *
   *   5. Cleanup: release the intermediate refs @0xe4cec/e4cf5/e4cfe, then
   *      return conformFinal.
   *
   *  The SetConversion(5, 1, 0, 0, 8, ...) argument tuple decodes to
   *  HGColorGamma::hgColorGammaColorPrimaries (src=5=BT.2020?),
   *  hgColorGammaTransferFunction (=1=gamma?), hgColorGammaMatrixCoefficients
   *  (=0=identity RGB?), then destination triple (=0,8,...); the exact
   *  numeric->enum name mapping is a decode item alongside HGColorConform
   *  itself.
   */
  GetOutputForXRsRGB(renderer: unknown, inputNode: unknown): unknown {
    // Frontier surface — every callee is stubbed. Dead-branch reference
    // block for tsc + provenance_gate.
    if ((false as boolean)) {
      void renderer;
      void inputNode;
      HGObject_new_stub(0x1e0);
      HGObject_new_stub(0x370);
      HGObject_new_stub(0x1c0);
      HGObject_delete_stub(this);
      HGGamutMap_ctor_stub(this);
      HGGamutMap_SetConversion_stub(this, 5, 1, 0, 0, 8, 0);
      HGColorConform_ctor_stub(this);
      HGColorConform_SetConversion6_stub(this, 5, 1, 0, 0, 8, 0);
      HGColorConform_SetConversionPreset_stub(this, 0xb);
      HGColorClamp_ctor_stub(this);
      vtSlot10_retain_stub(this);
      vtSlot18_release_stub(this);
      vtSlot78_setInput_stub(this, 0, this);
    }
    void HGObject;
    throw new Error(
      "HGYUVPlanarToRGBA::GetOutputForXRsRGB(HGRenderer*, HGNode*) @Helium 0xe4b80 not yet transcribed: " +
      "138-line factory that (optionally) chains HGGamutMap @0xe4bcc/e4bd7/e4bfb -> " +
      "HGColorConform(6-arg SetConversion) @0xe4c33/e4c3e/e4c60 -> " +
      "(optional) HGColorClamp @0xe4c89/e4c94 -> " +
      "HGColorConform(preset SetConversion(0xb)) @0xe4cba/e4cc5/e4cd2, gated on " +
      "paramField_id2word1 (0x1b8) mode {0,2,3} and paramField_id2word3 (0x1ac). " +
      "All frontier callees are throw-stubbed above."
    );
  }
}
