// HGYUVPlanarTo444.ts — Helium HGYUVPlanarTo444: a node subclass that
// converts 4:2:0 / 4:2:2 / 4:4:4 planar-YUV inputs (bi-planar or tri-
// planar) into a 4:4:4 pixel-format output, wired into an HGRenderer
// graph via HgcYUV* converter subclasses + a final HgcScaleBiasCrop.
//
// FAITHFUL transcription of the x86_64 disassembly of
// /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium.
//
// Source disassembly:
//   raw-port/re/disasm/Helium.HGYUVPlanarTo444.HGYUVPlanarTo444.s   (ctor  @0xe53a0, C1==C2)
//   raw-port/re/disasm/Helium.HGYUVPlanarTo444.SetParameter.s      (      @0xe5990)
//   raw-port/re/disasm/Helium.HGYUVPlanarTo444.GetOutput.s         (      @0xe54d0)
//   raw-port/re/disasm/Helium.HGYUVPlanarTo444.~HGYUVPlanarTo444.s (D0    @0xe5480; D1 @0xe5440; D2 @0xe5400)
//
// Helium symbols transcribed:
//   @0xe53a0  HGYUVPlanarTo444::HGYUVPlanarTo444(HGYUVPlanar::SubSampling, bool)   [C1 == C2]
//   @0xe5400  HGYUVPlanarTo444::~HGYUVPlanarTo444()                                [D2 base]
//   @0xe5440  HGYUVPlanarTo444::~HGYUVPlanarTo444()                                [D1 in-place]
//   @0xe5480  HGYUVPlanarTo444::~HGYUVPlanarTo444()                                [D0 deleting]
//   @0xe5990  HGYUVPlanarTo444::SetParameter(int, float, float, float, float)
//   @0xe54d0  HGYUVPlanarTo444::GetOutput(HGRenderer*)
//
// vtable is at __ZTV16HGYUVPlanarTo444 (data pointer installed-into-object @Helium 0xa0e418).
// Only overrides from HGNode observed via raw-port/army/tools/vtable.py:
//   *0x00 -> 0xe5440  HGYUVPlanarTo444::~HGYUVPlanarTo444()  [D1 in-place]
//   *0x08 -> 0xe5480  HGYUVPlanarTo444::~HGYUVPlanarTo444()  [D0 deleting]
//   *0x60 -> 0xe5990  HGYUVPlanarTo444::SetParameter
// All other vtable slots are inherited from HGNode (parseElement/setValue/etc.).
//
// FRONTIER CALLEES (all cited by @0xADDR — deliberately not decoded here;
// invoking them from the ported HGYUVPlanarTo444 flows throws with the
// original address so `frontier.py` sees the gap):
//   __ZN6HGNodeC2Ev                               HGNode::HGNode()                       @Helium 0xe53b2 (imported base — real HGNode used)
//   __ZN6HGNodeD2Ev                               HGNode::~HGNode()                      @Helium 0xe5431/e5471 (imported base)
//   __ZN10HGRenderer8GetInputEP6HGNodei           HGRenderer::GetInput(HGNode*, int)     @Helium 0xe54f2/e5505/e5522
//   __ZN8HGObjectnwEm                             HGObject::operator new(unsigned long)  @Helium 0xe554c/e557b/e5597/e5754/e588d
//   __ZN8HGObjectdlEPv                            HGObject::operator delete(void*)       @Helium 0xe54b6 (D0)
//   __ZN33HgcYUV420TriPlanar_420To444_Type2C1Ev   HgcYUV420TriPlanar_420To444_Type2 ctor @Helium 0xe5568
//   __ZN33HgcYUV444TriPlanar_444To444_Type2C1Ev   HgcYUV444TriPlanar_444To444_Type2 ctor @Helium 0xe558b
//   __ZN33HgcYUV422TriPlanar_422To444_Type2C1Ev   HgcYUV422TriPlanar_422To444_Type2 ctor @Helium 0xe55a7
//   __ZN33HgcYUV420TriPlanar_420To444_Type0C2Ev   HgcYUV420TriPlanar_420To444_Type0 ctor @Helium 0xe55ca
//   __ZN32HgcYUV444BiPlanar_444To444_Type2C1Ev    HgcYUV444BiPlanar_444To444_Type2  ctor @Helium 0xe55e2
//   __ZN32HgcYUV422BiPlanar_422To444_Type2C1Ev    HgcYUV422BiPlanar_422To444_Type2  ctor @Helium 0xe55ec
//   __ZN32HgcYUV420BiPlanar_420To444_Type2C1Ev    HgcYUV420BiPlanar_420To444_Type2  ctor @Helium 0xe55f6
//   __ZN32HgcYUV420BiPlanar_420To444_Type0C2Ev    HgcYUV420BiPlanar_420To444_Type0  ctor @Helium 0xe5861
//   ___bzero                                       bzero (libc)                          @Helium 0xe55b6
//   ___dynamic_cast                                dynamic_cast (libc++abi)              @Helium 0xe565e
//   __ZTI6HGNode / __ZTI14HGBitmapLoader           typeinfo (rtti)                        @Helium 0xe564b/e5652
//   __ZNK14HGBitmapLoader15GetBitmapFormatEv       HGBitmapLoader::GetBitmapFormat() const@Helium 0xe566b
//   __ZN13HGFormatUtils9precisionE8HGFormat        HGFormatUtils::precision(HGFormat)     @Helium 0xe5675
//   __ZN13HGFormatUtils13bytesPerPixelE8HGFormat   HGFormatUtils::bytesPerPixel(HGFormat) @Helium 0xe5687
//   __ZN6HGNode28SetSupportedFormatPrecisionsEj    HGNode::SetSupportedFormatPrecisions   @Helium 0xe567f/e5843
//   __ZN10HGRenderer6GetDODEP6HGNode               HGRenderer::GetDOD(HGNode*)            @Helium 0xe563b/e587b
//   __ZN16HgcScaleBiasCropC1Ev                     HgcScaleBiasCrop::HgcScaleBiasCrop()   @Helium 0xe575f
//   __ZN13HGTextureWrapC1Ev                        HGTextureWrap::HGTextureWrap()         @Helium 0xe5899
//   __ZN13HGTextureWrap18SetTextureWrapModeENS_8WrapModeE HGTextureWrap::SetTextureWrapMode @Helium 0xe58a7
//   __ZN13HGTextureWrap11SetCropRectERK6HGRect     HGTextureWrap::SetCropRect             @Helium 0xe58e8
//   _HGRectMake4i                                  HGRectMake4i (extern C)                @Helium 0xe58c0
//   _HGRectGrow                                    HGRectGrow   (extern C)                @Helium 0xe58d3
//   *0x18 (vt slot)                                HGObject::Release() / equivalent       @Helium 0xe54a2/e57f8/e5813/e5924
//   *0x60 (vt slot on HgcScaleBiasCrop/HgcYUV*)    node "SetScaleBias" / equiv            @Helium 0xe578d/e57ab/e57e1
//   *0x78 (vt slot on HgcScaleBiasCrop/HgcYUV*)    node "SetInput" / equiv                @Helium 0xe560a/e561c/e5632/e576f/e58fa/e5908/e591a
//
// FLOAT CONSTANTS (all from __TEXT,__const at the cited vaddrs; values dumped
// via `otool -arch x86_64 -X -s __TEXT __const`):
//   @0x3cf1cc  0x00000000        = 0.0f
//   @0x3cf1d0  0xbf124925        = -0.5714285969734192f    (chroma bias term)
//   @0x3cf1d4  0xbd95a025        = -0.07305935770273209f   (luma bias term)
//   @0x3cf1d8  0x3f800000        = 1.0f                    (full-range scale)
//   @0x3cf1dc  0x3f801f88        = 1.000962257385254f      (219/223? tiny stretch for legal->full)
//   @0x3cf1e0  0x477fc000        = 65472.0f                (high 8-bit legal white)
//   @0x3cf1e4  0x477fff00        = 65535.0f                (all-ones u16)
//   @0x3cf1c0  0x475b0000  0x47600000  0  0
//              = { 56064.0f, 57344.0f, 0, 0 }              (divisor pair for packed divps)
//   @0x3cf1b0  0x3f950a85  0x3f91b6db  0  0
//              = { 1.1643835306167603f, 1.1383928060531616f, 0, 0 }  (SD/HD-legal luma scale)
//   @0x3ca0b0  { 1.0f, 1.0f, 0, 0 }
//   @0x3c7cc0  { 1.0f, 6.0f, 0.5f, -0.5f }                 (packed misc)
//   @0x3c7ccc  { -0.5f, 1.5f, -1.5f, 0.0f }                (packed misc)
//
// The full arithmetic meaning of these constants is Y'CbCr legal-range vs full-
// range scale/bias math for 8-bit and 10-bit inputs — same family as
// HGYUVPlanar::GetScaleBiasForRange (already landed in HGYUVPlanar.ts). The
// GetOutput dispatch here just picks WHICH constants to feed HgcScaleBiasCrop
// based on paramWord3 (0x1a4) and paramWord4 (0x1b0) plus the input bitmap's
// bytes-per-pixel. Every field access + selector branch is mirrored below.

import { HGNode } from "./HGNode";
import { HGObject } from "./HGObject";

/**
 * `HGYUVPlanar::SubSampling` — undecoded Helium enum. Passed as the first
 * ctor arg (esi) and stored at +0x1a0. GetOutput @Helium 0xe552a-e5537
 * dispatches on the value: 0 -> 4:2:0, 2 -> 4:2:2, else -> 4:4:4.
 *
 * We keep it as a plain integer alias (mirrors HGYUVPlanar.ts, whose
 * YCbCrRange is likewise number). The enum ordering is INFERRED from the
 * dispatch, not invented:
 *    0 -> k420   (bi/tri-planar 4:2:0)
 *    2 -> k422   (bi/tri-planar 4:2:2)
 *   else -> k444 (bi/tri-planar 4:4:4)
 */
export type HGYUVPlanar_SubSampling = number;

/**
 * FRONTIER opaque handles — every symbol NOT yet transcribed is imported
 * through a throwing stub that carries the source @0xADDR. `frontier.py`
 * scans these strings to know what remains.
 */
function HGRenderer_GetInput_stub(_renderer: unknown, _node: unknown, _slot: number): unknown {
  throw new Error("HGRenderer::GetInput(HGNode*, int) @Helium 0xe54f2 not yet transcribed");
}
function HGRenderer_GetDOD_stub(_renderer: unknown, _node: unknown): [unknown, unknown] {
  throw new Error("HGRenderer::GetDOD(HGNode*) @Helium 0xe563b not yet transcribed");
}
function HGObject_new_stub(_size: number): unknown {
  throw new Error("HGObject::operator new(unsigned long) @Helium 0xe554c not yet transcribed");
}
function HGObject_delete_stub(_p: unknown): void {
  throw new Error("HGObject::operator delete(void*) @Helium 0xe54b6 not yet transcribed");
}
function HgcYUV420TriPlanar_420To444_Type2_ctor_stub(_p: unknown): void {
  throw new Error("HgcYUV420TriPlanar_420To444_Type2::HgcYUV420TriPlanar_420To444_Type2() @Helium 0xe5568 not yet transcribed");
}
function HgcYUV444TriPlanar_444To444_Type2_ctor_stub(_p: unknown): void {
  throw new Error("HgcYUV444TriPlanar_444To444_Type2::HgcYUV444TriPlanar_444To444_Type2() @Helium 0xe558b not yet transcribed");
}
function HgcYUV422TriPlanar_422To444_Type2_ctor_stub(_p: unknown): void {
  throw new Error("HgcYUV422TriPlanar_422To444_Type2::HgcYUV422TriPlanar_422To444_Type2() @Helium 0xe55a7 not yet transcribed");
}
function HgcYUV420TriPlanar_420To444_Type0_ctor_stub(_p: unknown): void {
  throw new Error("HgcYUV420TriPlanar_420To444_Type0::HgcYUV420TriPlanar_420To444_Type0() @Helium 0xe55ca not yet transcribed");
}
function HgcYUV444BiPlanar_444To444_Type2_ctor_stub(_p: unknown): void {
  throw new Error("HgcYUV444BiPlanar_444To444_Type2::HgcYUV444BiPlanar_444To444_Type2() @Helium 0xe55e2 not yet transcribed");
}
function HgcYUV422BiPlanar_422To444_Type2_ctor_stub(_p: unknown): void {
  throw new Error("HgcYUV422BiPlanar_422To444_Type2::HgcYUV422BiPlanar_422To444_Type2() @Helium 0xe55ec not yet transcribed");
}
function HgcYUV420BiPlanar_420To444_Type2_ctor_stub(_p: unknown): void {
  throw new Error("HgcYUV420BiPlanar_420To444_Type2::HgcYUV420BiPlanar_420To444_Type2() @Helium 0xe55f6 not yet transcribed");
}
function HgcYUV420BiPlanar_420To444_Type0_ctor_stub(_p: unknown): void {
  throw new Error("HgcYUV420BiPlanar_420To444_Type0::HgcYUV420BiPlanar_420To444_Type0() @Helium 0xe5861 not yet transcribed");
}
function HgcScaleBiasCrop_ctor_stub(_p: unknown): void {
  throw new Error("HgcScaleBiasCrop::HgcScaleBiasCrop() @Helium 0xe575f not yet transcribed");
}
function HGTextureWrap_ctor_stub(_p: unknown): void {
  throw new Error("HGTextureWrap::HGTextureWrap() @Helium 0xe5899 not yet transcribed");
}
function HGTextureWrap_SetTextureWrapMode_stub(_p: unknown, _mode: number): void {
  throw new Error("HGTextureWrap::SetTextureWrapMode(HGTextureWrap::WrapMode) @Helium 0xe58a7 not yet transcribed");
}
function HGTextureWrap_SetCropRect_stub(_p: unknown, _rect: unknown): void {
  throw new Error("HGTextureWrap::SetCropRect(HGRect const&) @Helium 0xe58e8 not yet transcribed");
}
function HGRectMake4i_stub(_x: number, _y: number, _w: number, _h: number): [number, number] {
  throw new Error("HGRectMake4i @Helium 0xe58c0 not yet transcribed");
}
function HGRectGrow_stub(_r: [number, number], _by: [number, number]): [number, number] {
  throw new Error("HGRectGrow @Helium 0xe58d3 not yet transcribed");
}
function bzero_stub(_p: unknown, _n: number): void {
  throw new Error("___bzero @Helium 0xe55b6 not yet transcribed");
}
function dynamic_cast_HGNode_to_HGBitmapLoader_stub(_p: unknown): unknown {
  throw new Error("___dynamic_cast(HGNode -> HGBitmapLoader) @Helium 0xe565e not yet transcribed");
}
function HGBitmapLoader_GetBitmapFormat_stub(_p: unknown): number {
  throw new Error("HGBitmapLoader::GetBitmapFormat() const @Helium 0xe566b not yet transcribed");
}
function HGFormatUtils_precision_stub(_fmt: number): number {
  throw new Error("HGFormatUtils::precision(HGFormat) @Helium 0xe5675 not yet transcribed");
}
function HGFormatUtils_bytesPerPixel_stub(_fmt: number): number {
  throw new Error("HGFormatUtils::bytesPerPixel(HGFormat) @Helium 0xe5687 not yet transcribed");
}
function HGNode_SetSupportedFormatPrecisions_stub(_node: unknown, _prec: number): void {
  throw new Error("HGNode::SetSupportedFormatPrecisions(unsigned int) @Helium 0xe567f not yet transcribed");
}
function vtSlot18_release_stub(_p: unknown): void {
  throw new Error("(*(vtable)[0x18])(this) — polymorphic Release/dtor slot @Helium 0xe54a2/e57f8/e5813/e5924 not yet transcribed");
}
function vtSlot60_setBiasScale_stub(_p: unknown, _idx: number, _scale: [number, number, number, number], _bias: [number, number, number, number]): void {
  throw new Error("(*(vtable)[0x60])(this, idx, scale, bias) — HgcScaleBiasCrop::SetScaleBiasForChannel(?) @Helium 0xe578d/e57ab/e57e1 not yet transcribed");
}
function vtSlot78_setInput_stub(_p: unknown, _slot: number, _input: unknown): void {
  throw new Error("(*(vtable)[0x78])(this, slot, input) — HGNode::SetInput(?)-family @Helium 0xe560a/e561c/e5632/e576f/e58fa/e5908/e591a not yet transcribed");
}


/**
 * `HGYUVPlanarTo444` — subclass of HGNode.
 *
 * Layout beyond HGNode's 0x198-byte base, exactly as the ctor writes it
 * (see @Helium 0xe53c1-0xe53e5):
 *
 *   +0x198 : owned "converter" node (HgcYUV*BiPlanar_*_To444_* or
 *            HgcYUV*TriPlanar_*_To444_*, or an HgcScaleBiasCrop chained
 *            after it) — released via vt[0x18]. Init: null. Written in
 *            GetOutput @0xe57fb.
 *   +0x1a0 : uint32_t subSampling  (init from ctor esi at @0xe53cc)
 *   +0x1a4 : uint32_t paramWord3   (init $0x3 at @0xe53d3 — destination format
 *                                    hint used by GetOutput; SetParameter idx=0
 *                                    writes cvttss2si(f) here)
 *   +0x1a8 : uint32_t paramWord4   (init 0 by the same 8-byte movq at
 *                                    0xe53d3; SetParameter idx=1 writes here)
 *   +0x1ac : bool     triPlanar    (init from ctor dl at @0xe53de)
 *   +0x1b0 : uint32_t paramWord5   (init 0 at @0xe53e5)
 */
export class HGYUVPlanarTo444 extends HGNode {
  // 0x198
  ownedConverter: unknown | null = null;
  // 0x1a0
  subSampling: HGYUVPlanar_SubSampling = 0;
  // 0x1a4  — the ctor sets it to 3 (see 0xe53d3: `movq $0x3, 0x1a4(%r15)`,
  // an 8-byte store that also zeros 0x1a8).
  paramWord3: number = 3;
  // 0x1a8
  paramWord4: number = 0;
  // 0x1ac
  triPlanar: boolean = false;
  // 0x1b0
  paramWord5: number = 0;

  /**
   * `HGYUVPlanarTo444::HGYUVPlanarTo444(HGYUVPlanar::SubSampling, bool)` — Helium @0xe53a0.
   *
   * Faithful transcription of the ctor body:
   *   0xe53b2: callq __ZN6HGNodeC2Ev                     ; HGNode::HGNode(this)
   *   0xe53b7: leaq  0x92905a(%rip), %rax                ; = 0xa0e418 (HGYUVPlanarTo444 installed-vt-ptr)
   *   0xe53be: movq  %rax, (%r15)                        ; this->vtable = HGYUVPlanarTo444
   *   0xe53c1: movq  $0x0, 0x198(%r15)                   ; owned = null
   *   0xe53cc: movl  %r14d, 0x1a0(%r15)                  ; subSampling = arg0
   *   0xe53d3: movq  $0x3, 0x1a4(%r15)                   ; paramWord3=3, paramWord4=0 (8-byte imm)
   *   0xe53de: movb  %bl,  0x1ac(%r15)                   ; triPlanar = arg1 (dl low byte)
   *   0xe53e5: movl  $0x0, 0x1b0(%r15)                   ; paramWord5 = 0
   */
  constructor(sub: HGYUVPlanar_SubSampling, tri: boolean) {
    super();
    // HGNode base ctor invoked implicitly via `super()` — the imported
    // HGNode class installs the HGNode vtable + zeroes the base fields.
    // Real Helium then overwrites (this)[0] with HGYUVPlanarTo444's vtable
    // (@0xa0e418). We don't model the raw vtable pointer here; JS dispatch
    // via classes preserves method identity, which is what the port needs.
    this.ownedConverter = null;
    this.subSampling = sub;
    this.paramWord3 = 3;
    this.paramWord4 = 0;
    this.triPlanar = tri;
    this.paramWord5 = 0;
  }

  /**
   * `HGYUVPlanarTo444::~HGYUVPlanarTo444()` — Helium @0xe5400 (D2, base subobject dtor).
   *
   *   0xe5406: leaq 0x92900b(%rip), %rax          ; = 0xa0e418 (vtable ptr)
   *   0xe540d: movq %rax, (%rdi)                  ; reset vtable
   *   0xe5410: movq 0x198(%rdi), %rax             ; owned = this->ownedConverter
   *   0xe541a: testq %rax, %rax / je 0xe542b      ; if owned != null:
   *   0xe541c: movq (%rax), %rcx                  ;   vt = owned->vtable
   *   0xe5425: callq *0x18(%rcx)                  ;   vt[0x18](owned)  ; Release()
   *   0xe5431: jmp __ZN6HGNodeD2Ev                ; tail: HGNode::~HGNode(this)
   *
   * D1 (@0xe5440) is byte-for-byte identical body; D0 (@0xe5480) additionally
   * tail-calls HGObject::operator delete(this) after HGNode::~HGNode.
   */
  destroy(): void {
    if (this.ownedConverter != null) {
      vtSlot18_release_stub(this.ownedConverter);
      this.ownedConverter = null;
    }
    // HGNode::~HGNode(this) — the real base dtor releases HGNode-owned refs.
    // Our imported HGNode base has no explicit destructor method to call;
    // JS GC covers the raw memory. Frontier work if HGNode dtor semantics
    // ever need to run explicitly.
  }

  /**
   * `HGYUVPlanarTo444::SetParameter(int idx, float v0, float v1, float v2, float v3)` — Helium @0xe5990.
   *
   * Faithful transcription:
   *   0xe5994: cmpl $0x1, %esi / je 0xe59b3    ; if idx == 1:
   *      0xe59b3: cvttss2si %xmm0, %rax        ;   i = (int)v0
   *      0xe59b8: cmpl %eax, 0x1a8(%rdi)       ;   if paramWord4 == i:
   *      0xe59be: jne 0xe59cc                  ;
   *      0xe59c0: xorl %eax, %eax / ret        ;     return 0 (unchanged)
   *      0xe59cc: movl %eax, 0x1a8(%rdi)       ;   paramWord4 = i
   *      0xe59d2: movl $0x1, %eax / ret        ;   return 1 (changed)
   *   0xe5999: movl $-1, %eax                  ; else default = -1
   *   0xe599e: testl %esi, %esi / jne 0xe59d7  ; if idx != 0: return -1
   *      0xe59a2: cvttss2si %xmm0, %rax        ;   i = (int)v0
   *      0xe59a7: cmpl %eax, 0x1a4(%rdi)       ;   if paramWord3 == i:
   *      0xe59ad: jne 0xe59c4                  ;
   *      0xe59af: xorl %eax, %eax / ret        ;     return 0
   *      0xe59c4: movl %eax, 0x1a4(%rdi)       ;   paramWord3 = i
   *      0xe59ca: jmp  0xe59d2                 ;   return 1
   *
   * Return code convention: 0 = no change, 1 = changed, -1 = out-of-range idx.
   * Only the first float is used; v1..v3 are ignored (matches asm — they're
   * passed but never referenced).
   */
  SetParameter(idx: number, v0: number, _v1: number, _v2: number, _v3: number): number {
    if (idx === 1) {
      // cvttss2si is a single-precision-float -> int32 truncation. Mirror by
      // going through Math.fround (v0 is already a JS number, but the
      // machine sees a 32-bit float in xmm0) and truncating toward zero.
      const i = Math.trunc(Math.fround(v0)) | 0;
      if ((this.paramWord4 | 0) === i) return 0;
      this.paramWord4 = i;
      return 1;
    }
    if (idx === 0) {
      const i = Math.trunc(Math.fround(v0)) | 0;
      if ((this.paramWord3 | 0) === i) return 0;
      this.paramWord3 = i;
      return 1;
    }
    return -1;
  }

  /**
   * `HGYUVPlanarTo444::GetOutput(HGRenderer*)` — Helium @0xe54d0.
   *
   * This is the meat of the class: build a small render sub-graph that
   * un-subsamples chroma (converting 4:2:0 or 4:2:2 planar Y'CbCr to 4:4:4)
   * and applies a per-format scale/bias so the pipeline downstream sees a
   * linear-space Y'CbCr 4:4:4 buffer. Faithful branch-for-branch port.
   *
   * The asm's control flow (labels reproduced verbatim from the .s file):
   *   1. Fetch inputs from the renderer:
   *      @0xe54f2  a = HGRenderer::GetInput(renderer, this, 0)   ; Y plane
   *      @0xe5505  b = HGRenderer::GetInput(renderer, this, 1)   ; Cb (or CbCr for bi-planar)
   *      @0xe550a  if this->triPlanar (0x1ac == 1):
   *      @0xe5522    c = HGRenderer::GetInput(renderer, this, 2) ; Cr (tri-planar only)
   *                 else c = null.
   *   2. Dispatch on subSampling (0x1a0):
   *      @0xe552a  if ss == 2:  goto 4:2:2 branch
   *                if ss == 0:  goto 4:2:0 branch
   *                else       :  goto 4:4:4 branch
   *   3. Each branch: HGObject::operator new(0x1a0) -> HgcYUV*Planar_*To444_Type2 ctor,
   *      unless (paramWord4 == 0 AND we're on 4:2:0) — then a special
   *      Type0 variant is used and the 4:2:0 tri-planar path pre-bzero's the object.
   *      The exact table (recovered from the asm):
   *        ss=0 (4:2:0), triPlanar,  paramWord4==0 -> HgcYUV420TriPlanar_420To444_Type0  @0xe55ca
   *        ss=0 (4:2:0), triPlanar,  paramWord4!=0 -> HgcYUV420TriPlanar_420To444_Type2  @0xe5568
   *        ss=0 (4:2:0), biPlanar,   paramWord4==0 -> HgcYUV420BiPlanar_420To444_Type0   @0xe5861
   *        ss=0 (4:2:0), biPlanar,   paramWord4!=0 -> HgcYUV420BiPlanar_420To444_Type2   @0xe55f6
   *        ss=2 (4:2:2), triPlanar                 -> HgcYUV422TriPlanar_422To444_Type2  @0xe55a7
   *        ss=2 (4:2:2), biPlanar                  -> HgcYUV422BiPlanar_422To444_Type2   @0xe55ec
   *        ss=* (4:4:4), triPlanar                 -> HgcYUV444TriPlanar_444To444_Type2  @0xe558b
   *        ss=* (4:4:4), biPlanar                  -> HgcYUV444BiPlanar_444To444_Type2   @0xe55e2
   *   4. Wire inputs to the converter node (vt[0x78] = SetInput-family):
   *      @0xe560a  converter->[0x78](0, a)
   *      @0xe561c  converter->[0x78](1, b)
   *      @0xe5632  if c != null: converter->[0x78](2, c)
   *   5. Compute chroma-scale/bias for the eventual HgcScaleBiasCrop wrap:
   *      @0xe563b  {dodPtr, dodSize} = HGRenderer::GetDOD(renderer, a)
   *      @0xe5646  if a != null:
   *      @0xe565e    loader = ___dynamic_cast(a, &typeinfo(HGNode), &typeinfo(HGBitmapLoader), 0)
   *      @0xe5666    if loader != null:
   *      @0xe566b      fmt  = HGBitmapLoader::GetBitmapFormat(loader)
   *      @0xe5675      prec = HGFormatUtils::precision(fmt)
   *      @0xe567f      HGNode::SetSupportedFormatPrecisions(converter, prec)
   *      @0xe5687      is16bppPerPixel = (HGFormatUtils::bytesPerPixel(fmt) == 2)
   *                  else is16bppPerPixel = false
   *                else is16bppPerPixel = false
   *   6. Compute scale/bias vectors from paramWord3 (0x1a4) and paramWord5 (0x1b0):
   *      @0xe5697  ecx = paramWord3
   *      @0xe569d  eax = paramWord5
   *      @0xe56a3  edx = paramWord3 - 3
   *      @0xe56a6  if ((unsigned)edx <= 3):       ; paramWord3 in {3,4,5,6}
   *      @0xe56af    dl  = (paramWord3 == 6)
   *      @0xe56b5    ecx &= 6
   *      @0xe56b8    cl  = (ecx == 4)
   *      @0xe56c1    dl |= (cl | is16bppPerPixel)  ; dl == 1 -> "8-bit reduced range" family
   *      @0xe56c3    xmm1 = 1.0f  (from @0x3cf1d4)                ; default scale.y = 1.0
   *      @0xe56cb    xmm0 = -0.07305935770273209f (@0x3cf1d0)     ; default bias.y  = ~-0.073
   *      @0xe56d3    if dl == 1:                                  ; 8-bit legal-range family
   *      @0xe56e2      cl = (paramWord5 == 0) ? 1 : 0
   *      @0xe56e9      table = &(@0x3cf1e0)
   *      @0xe56f0      xmm0 = table[cl*4] (movsldup fills {v,v,v,v}) ; v = 65472.0f (cl=0) or 65535.0f (cl=1)
   *      @0xe56f9      xmm0 = xmm0 / (@0x3cf1c0 = {56064,57344,0,0}) ; packed 4-float divide
   *                    -> scale.x = 65472/56064 (or 65535/56064), etc.
   *                    goto STORE
   *      @0xe5702    else:  ; paramWord3 out of {3..6} AND not 16bpp
   *      @0xe5702      xmm0 = 1.1643835306167603f (@0x3cf1b0)     ; SD/HD-legal luma scale
   *      @0xe570a      if paramWord3 != 1:
   *      @0xe5744        xmm0 = @0x3ca0b0 = {1.0, 1.0, 0, 0}       ; identity scale packed
   *      @0xe5735        xmm0 (top) = @0x3cf1e4                    ; +bias fixup for 10-bit
   *                     ...
   *   7. Allocate + init HgcScaleBiasCrop:
   *      @0xe574f  crop = HGObject::operator new(0x1a0)
   *      @0xe575f  HgcScaleBiasCrop::HgcScaleBiasCrop(crop)
   *      @0xe576f  crop->[0x78](0, converter)                     ; input <- converter
   *      @0xe578d  crop->[0x60](0, {luma_scale}, {luma_bias})      ; scale/bias ch 0
   *      @0xe57ab  crop->[0x60](1, {chroma_scale}, {chroma_bias})  ; scale/bias ch 1
   *      @0xe57e1  crop->[0x60](2, {size.x, size.y}, {0,0})        ; scale/bias ch 2 (using DOD size)
   *   8. Swap ownership at this->ownedConverter (+0x198):
   *      @0xe57e4  old = this->ownedConverter
   *      @0xe57eb  if old == crop: crop->[0x18](crop)              ; (defensive self-release)
   *                else if old != null: old->[0x18](old)           ; release old
   *      @0xe57fb  this->ownedConverter = crop
   *      @0xe580d  converter->[0x18](converter)                    ; release the temp converter
   *   9. Optionally wrap in an HGTextureWrap (adds 1px border crop) — only if
   *      NOT is16bppPerPixel AND (odd bits of paramWord3-1 in $0x3B masked pattern):
   *      @0xe581b  esi = 8  (default supported-precision mask)
   *      @0xe5821  eax = HGNode::renderPageStrategy (this->0x24)
   *      @0xe5824  ecx = paramWord3 - 1
   *      @0xe582c  dl  = ($0x3B >> ecx) & 1                        ; bitmask lookup 0b00111011
   *      @0xe5833  if !(dl&1): esi = eax
   *      @0xe5836  if ecx >= 6: esi = eax
   *      @0xe5843  HGNode::SetSupportedFormatPrecisions(this->ownedConverter, esi)
   *      @0xe5848  return this->ownedConverter
   *
   *      The 0x3B mask (00111011 in bits 0..7) means paramWord3-1 in {0,1,3,4,5}
   *      opts into the 8-bit precision mask; {2,6,7,...} fall through to
   *      HGNode::renderPageStrategy (a persisted default).
   *
   *  10. Alternate path @0xe585e (4:2:0 biPlanar with paramWord4==0): after
   *      building the converter, an HGTextureWrap is constructed BETWEEN
   *      converter and its input `a` — HGRectMake4i(-1,-1,1,1) -> HGRectGrow(DOD,+1)
   *      gives a 1-pixel-expanded crop rect; SetTextureWrapMode(1); SetCropRect.
   *      Then jumps back to step 4 at 0xe5624 to continue wiring.
   *
   * Because every callee, every RIP-const, and every vtable slot on the
   * right-hand side is a FRONTIER — HGRenderer, HgcYUV*, HgcScaleBiasCrop,
   * HGTextureWrap, HGRectMake4i, HGRectGrow, HGFormatUtils, HGBitmapLoader,
   * dynamic_cast, HGObject::new/delete are all un-decoded — the ported
   * function immediately throws with the entry addr. `frontier.py` will list
   * every one of the stubs above as blocking work.
   *
   * When the frontier classes land, this method's body is expanded by
   * REPLACING the throw with the numbered steps above, ONE step per commit,
   * each citing its @0xADDR from this comment. The comment IS the port; the
   * code below just enforces the "no shortcuts" invariant.
   */
  GetOutput(_renderer: unknown): unknown {
    // Sanity accesses so tsc sees the imported HGRenderer stubs are wired
    // in the frontier surface (and so a static "used but unused" analysis
    // doesn't strip them). These call throw-stubs; execution never proceeds.
    if ((false as boolean)) {
      // dead branch: gives tsc a use of every frontier symbol so imports
      // don't dangle when their bodies land in later commits.
      HGRenderer_GetInput_stub(_renderer, this, 0);
      HGRenderer_GetDOD_stub(_renderer, this);
      HGObject_new_stub(0x1a0);
      HGObject_delete_stub(this);
      HgcYUV420TriPlanar_420To444_Type2_ctor_stub(this);
      HgcYUV444TriPlanar_444To444_Type2_ctor_stub(this);
      HgcYUV422TriPlanar_422To444_Type2_ctor_stub(this);
      HgcYUV420TriPlanar_420To444_Type0_ctor_stub(this);
      HgcYUV444BiPlanar_444To444_Type2_ctor_stub(this);
      HgcYUV422BiPlanar_422To444_Type2_ctor_stub(this);
      HgcYUV420BiPlanar_420To444_Type2_ctor_stub(this);
      HgcYUV420BiPlanar_420To444_Type0_ctor_stub(this);
      HgcScaleBiasCrop_ctor_stub(this);
      HGTextureWrap_ctor_stub(this);
      HGTextureWrap_SetTextureWrapMode_stub(this, 1);
      HGTextureWrap_SetCropRect_stub(this, null);
      HGRectMake4i_stub(-1, -1, 1, 1);
      HGRectGrow_stub([0, 0], [1, 1]);
      bzero_stub(this, 0x1a0);
      dynamic_cast_HGNode_to_HGBitmapLoader_stub(this);
      HGBitmapLoader_GetBitmapFormat_stub(this);
      HGFormatUtils_precision_stub(0);
      HGFormatUtils_bytesPerPixel_stub(0);
      HGNode_SetSupportedFormatPrecisions_stub(this, 0);
      vtSlot18_release_stub(this);
      vtSlot60_setBiasScale_stub(this, 0, [1, 1, 1, 1], [0, 0, 0, 0]);
      vtSlot78_setInput_stub(this, 0, this);
    }
    // Reference HGObject to prevent "unused import" — the vtable slot
    // *0x18 in the asm is HGObject::Release()-family.
    void HGObject;

    throw new Error(
      "HGYUVPlanarTo444::GetOutput(HGRenderer*) @Helium 0xe54d0 not yet transcribed: " +
      "165-line factory dispatch that constructs one of 8 HgcYUV*Planar_*_To444_Type* " +
      "converters (@0xe5568/e558b/e55a7/e55ca/e55e2/e55ec/e55f6/e5861), wires inputs via " +
      "vt[0x78] (@0xe560a/e561c/e5632), computes chroma scale/bias from paramWord3+paramWord5+bpp " +
      "using constants at @0x3cf1b0/3cf1c0/3cf1d0/3cf1d4/3cf1d8/3cf1e0/3ca0b0/3c7cc0/3c7ccc, " +
      "allocates HgcScaleBiasCrop @0xe575f, sets its three per-channel scale/bias via vt[0x60] " +
      "@0xe578d/e57ab/e57e1, optionally builds an HGTextureWrap for 4:2:0-biPlanar-type0 " +
      "@0xe585e with HGRectMake4i/HGRectGrow @0xe58c0/e58d3, and finally SetSupportedFormatPrecisions " +
      "@0xe5843 using bitmask $0x3B for paramWord3-1. All frontier callees are throw-stubbed above."
    );
  }
}
