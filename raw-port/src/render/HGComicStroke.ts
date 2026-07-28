// HGComicStroke.ts — Helium's "comic stroke" per-pixel effect node.
// Faithful transcription from the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium
//
// Source disassembly (raw-port/re/disasm/Helium.HGComicStroke.*.s):
//   HGComicStroke::HGComicStroke()               @0x0000000000170430  (C1/C2)
//   HGComicStroke::~HGComicStroke()              @0x0000000000170470  (D1/D2)
//   HGComicStroke::~HGComicStroke()              @0x0000000000170490  (D0 — deleting dtor)
//   HGComicStroke::SetParameter(int,f,f,f,f)     @0x00000000001704b0
//   HGComicStroke::IntermediateFormat(HGFormat)  @0x000000000001ff30  (ICF-folded with
//                                                 HGComicStrokeAndBlend::IntermediateFormat;
//                                                 the ledger entry @0x170550 is inside
//                                                 SetParameter padding — the true body is the
//                                                 folded weak symbol at 0x1ff30, decoded from
//                                                 /tmp/Helium_tV.txt.)
//   HGComicStroke::GetDOD(HGRenderer*,int,HGRect)@0x0000000000170560
//   HGComicStroke::GetROI(HGRenderer*,int,HGRect)@0x0000000000170650
//   HGComicStroke::RenderTile(HGTile*)           @0x00000000001707d0
//   HGComicStroke::GetOutput(HGRenderer*)        @0x0000000000170f90
//   HGComicStroke::GetProgram(HGRenderer*)       @0x0000000000171050
//   HGComicStroke::BindTexture(HGHandler*,int)   @0x00000000001710b0
//   HGComicStroke::InitProgramDescriptor(...)    @0x0000000000171160  (empty — bare ret)
//
// DECODE evidence (RIP-relative constants — every @const cited by file offset):
//   __TEXT __const @Helium 0x3c9fe0  4×f32 {0.0f, 0.0f, 0.0f, 1.0f}
//                                    read verbatim from /tmp/Helium.x86_64 via the
//                                    otool section-map walk documented in the
//                                    session notes. Loaded by the ctor at 0x170448
//                                    (`movaps 0x259b91(%rip),%xmm0`; next PC 0x17044f
//                                    + 0x259b91 = 0x3c9fe0).
//   __TEXT __const @Helium 0x3c7cc0  f32 1.0f — used by GetOutput/BindTexture for
//                                    the "== 1.0" toggle canonicalisation.
//   __TEXT __const @Helium 0x3c7cc8  f32 0.5f — anti-aliasing bias passed as arg
//                                    to HGTransformUtils::GetDOD/GetROI.
//   __TEXT __const @Helium 0x3ca260  f64 1.0  — GetROI reciprocal numerator
//                                    and BindTexture vtable-slot arg.
//
// Class layout (recovered from ctor + SetParameter + GetDOD/GetROI/GetOutput):
//   +0x000  vtable                                 (leaq 0x8b0b9b(%rip) @0x17043e → 0xa20fe0)
//   +0x010  HGNode::renderPageStrategy   (existing HGNode field)
//                                                  ctor OR-in $0x620 @0x170456
//                                                  (base HGNode leaves it 0x200; this class
//                                                  raises to 0x820 = 0x200 | 0x620.)
//   +0x198  param 0 : sigma                        f32 (SetParameter case 0)
//   +0x19c  param 3 : alphaReplaceEnabled toggle   f32 (SetParameter case 3)
//   +0x1a0  param 1 : alphaPremultiplyOutput toggle f32 (SetParameter case 1)
//   +0x1a4  param 2 : downsample scale             f32 (SetParameter case 2)
//                                                  Ctor writes {0,0,0,1.0f} @+0x198.
//
// Undecoded frontier (each below is a THROWing stub citing its callee addr):
//   HGNode::~HGNode()               @Helium 0x11bd50 — base D2 (called from D1/D0)
//   HGNode::SetParameter(i,f,f,f,f) @Helium 0x11cab0 — called from GetOutput
//   HGObject::operator delete       @Helium — tail from D0
//   HGRect::IsInfinite() const      @Helium — tested by GetDOD
//   HGRect::Grow(HGRect)            @Helium — used by GetROI
//   HGTransform::HGTransform()      @Helium — GetDOD/GetROI stack local
//   HGTransform::Scale(d,d,d)       @Helium — GetDOD/GetROI
//   HGTransform::~HGTransform()     @Helium — GetDOD/GetROI local cleanup
//   HGTransformUtils::MinW()        @Helium — GetDOD/GetROI 4th arg
//   HGTransformUtils::GetDOD(...)   @Helium — tail from GetDOD
//   HGTransformUtils::GetROI(...)   @Helium — used by GetROI
//   HGTile::Renderer() const        @Helium — RenderTile
//   HGHandler::TexCoord(i,i,i,d*)   @Helium — BindTexture
//   HGRenderer::GetTarget(u32)      @Helium — GetProgram
//
// Numerics rules honoured:
//   * SetParameter uses `ucomiss` (single-precision compare) + `movss` (single
//     store) — every parameter slot is f32. We wrap arithmetic reads in
//     Math.fround where a subsequent cvtss2sd widens (GetROI:
//     cvtss2sd 0x1a4(%rbx),%xmm0 @0x170684 — the widen is faithful; the
//     reciprocal then uses f64 all the way to HGTransform::Scale).
//   * The ctor OR-in $0x620 into the u32 at +0x10 is `orl` — 32-bit unsigned.

import { HGNode } from "./HGNode";
import { HGRect, HGRectNull as HGRectNullConst } from "./HGRect";

// ---------- Opaque forward types (layouts decoded elsewhere / not needed here) ----------

/** HGRenderer — render-graph dependency/context handle. Layout decoded elsewhere. */
export interface HGRenderer {}
/** HGTile — a rasterization tile passed to per-pixel RenderTile. Decoded elsewhere. */
export interface HGTile {}
/** HGHandler — GPU parameter-binding helper (TexCoord etc.). Decoded elsewhere. */
export interface HGHandler {}
/** HGProgramDescriptor — GPU program descriptor. Decoded elsewhere. */
export interface HGProgramDescriptor {}
/** HGFormat — a pixel-format enum (returned as i32; 0x18 in the ICF-folded body @0x1ff34). */
export type HGFormat = number;

// ---------- @const constants (RIP-relative reads) ----------

/** __TEXT __const @Helium 0x3c9fe0 — 4×f32 {0.0f, 0.0f, 0.0f, 1.0f}. The ctor
 *  copies this 16-byte block to +0x198..+0x1a7 via `movaps` @0x170448. */
const CTOR_PARAM_DEFAULTS_198: readonly [number, number, number, number] =
  [0.0, 0.0, 0.0, 1.0];

/** __TEXT __const @Helium 0x3c7cc0 — the f32 literal 1.0f used by GetOutput/
 *  BindTexture for `alphaReplaceEnabled == 1.0` and `alphaPremultiplyOutput == 1.0`
 *  toggle detection (cmpeqss result is later ANDed into the arg to SetParameter). */
const F32_ONE_AT_3C7CC0 = Math.fround(1.0);

/** __TEXT __const @Helium 0x3ca260 — the f64 literal 1.0 used by GetROI as
 *  the numerator for `1.0 / param2` (movsd 0x259bd0(%rip),%xmm1 @0x170688). */
const F64_ONE_AT_3CA260 = 1.0;

// ---------- Throwing frontier stubs (undecoded callees) ----------

/** HGNode::~HGNode() — Helium base-class dtor @0x11bd50. Called from D1 (@0x170479)
 *  as a `callq`, then the D0 deleting dtor (@0x170499) also calls D2 before tail-
 *  jumping into HGObject::operator delete. Base body not yet transcribed. */
function stub_HGNode_D2_not_transcribed(): never {
  throw new Error("HGNode::~HGNode() @Helium 0x11bd50 not yet transcribed");
}

/** HGNode::SetParameter(int,float,float,float,float) — Helium base
 *  @0x11cab0. GetOutput (@0x170fac,@0x170fda,@0x171008) calls the BASE
 *  slot to record param 0/1/2 into HGNode's own param table before the
 *  vtable dispatch. Body not yet transcribed. */
function stub_HGNode_SetParameter_not_transcribed(): never {
  throw new Error(
    "HGNode::SetParameter(int,float,float,float,float) @Helium 0x11cab0 not yet transcribed",
  );
}

/** HGObject::operator delete(void*) — Helium symbol-stub tail-jmp target
 *  from D0 @0x1704a7. Not yet transcribed. */
function stub_HGObject_delete_not_transcribed(): never {
  throw new Error(
    "HGObject::operator delete(void*) @Helium (stub) not yet transcribed",
  );
}

/** HGRect::IsInfinite() const — Helium (callee at 0x170594). Not yet
 *  transcribed here (HGRect.ts covers other free functions; this member is a
 *  separate address in the ledger). */
function stub_HGRect_IsInfinite_not_transcribed(): never {
  throw new Error(
    "HGRect::IsInfinite() const @Helium (callee @0x170594) not yet transcribed",
  );
}

/** HGRect::Grow(HGRect) — Helium (callee at 0x17071a in GetROI). The free
 *  `_HGRectGrow` function IS ported in HGRect.ts; the MEMBER `HGRect::Grow`
 *  is a separate symbol whose body is not yet transcribed. */
function stub_HGRect_Grow_member_not_transcribed(): never {
  throw new Error(
    "HGRect::Grow(HGRect) @Helium (member, callee @0x17071a) not yet transcribed",
  );
}

/** HGTransform::HGTransform() — Helium (callee at 0x1705c2). Not yet transcribed. */
function stub_HGTransform_ctor_not_transcribed(): never {
  throw new Error(
    "HGTransform::HGTransform() @Helium (callee @0x1705c2) not yet transcribed",
  );
}

/** HGTransform::Scale(double,double,double) — Helium (callee at 0x1705da).
 *  Sets a uniform-scale on a stack-local HGTransform. Not yet transcribed. */
function stub_HGTransform_Scale_not_transcribed(): never {
  throw new Error(
    "HGTransform::Scale(double,double,double) @Helium (callee @0x1705da) not yet transcribed",
  );
}

/** HGTransform::~HGTransform() — Helium (callee at 0x170616). Not yet transcribed. */
function stub_HGTransform_dtor_not_transcribed(): never {
  throw new Error(
    "HGTransform::~HGTransform() @Helium (callee @0x170616) not yet transcribed",
  );
}

/** HGTransformUtils::MinW() — Helium (callee at 0x1705e7). Returns a float
 *  scalar used as the 4th arg of HGTransformUtils::GetDOD/GetROI. Not yet
 *  transcribed. */
function stub_HGTransformUtils_MinW_not_transcribed(): never {
  throw new Error(
    "HGTransformUtils::MinW() @Helium (callee @0x1705e7) not yet transcribed",
  );
}

/** HGTransformUtils::GetDOD(HGTransform const*,HGRect,float,float) — Helium
 *  (callee at 0x170604). Not yet transcribed. */
function stub_HGTransformUtils_GetDOD_not_transcribed(): never {
  throw new Error(
    "HGTransformUtils::GetDOD(HGTransform const*,HGRect,float,float) @Helium (callee @0x170604) not yet transcribed",
  );
}

/** HGTransformUtils::GetROI(HGTransform const*,HGRect,float,float) — Helium
 *  (callee at 0x1706dd). Not yet transcribed. */
function stub_HGTransformUtils_GetROI_not_transcribed(): never {
  throw new Error(
    "HGTransformUtils::GetROI(HGTransform const*,HGRect,float,float) @Helium (callee @0x1706dd) not yet transcribed",
  );
}

/** HGTile::Renderer() const — Helium (callee at 0x1707fa in RenderTile). */
function stub_HGTile_Renderer_not_transcribed(): never {
  throw new Error(
    "HGTile::Renderer() const @Helium (callee @0x1707fa) not yet transcribed",
  );
}

/** HGHandler::TexCoord(int,int,int,double const*) — Helium (called from
 *  BindTexture at 0x1710d2 and 0x1710fa). Not yet transcribed. */
function stub_HGHandler_TexCoord_not_transcribed(): never {
  throw new Error(
    "HGHandler::TexCoord(int,int,int,double const*) @Helium (callee @0x1710d2) not yet transcribed",
  );
}

/** HGRenderer::GetTarget(unsigned int) — Helium (called from GetProgram at
 *  0x171061). Not yet transcribed. */
function stub_HGRenderer_GetTarget_not_transcribed(): never {
  throw new Error(
    "HGRenderer::GetTarget(unsigned int) @Helium (callee @0x171061) not yet transcribed",
  );
}

// ---------- The class ----------

/**
 * `HGComicStroke` — Helium built-in comic-stroke filter node. Extends
 * `HGNode`. The GPU program (see `GetProgram`) implements an exponentially-
 * weighted gradient walk along the per-texel {y,z} normal direction and
 * smoothsteps the accumulated cross-section to produce a stylised "comic
 * outline".
 *
 * The class only adds four float parameters at fixed offsets +0x198..+0x1a7:
 *   sigma                     (param 0, +0x198)  — kernel radius
 *   alphaReplaceEnabled       (param 3, +0x19c)  — 0.0 / 1.0 toggle
 *   alphaPremultiplyOutput    (param 1, +0x1a0)  — 0.0 / 1.0 toggle
 *   downsample_scale          (param 2, +0x1a4)  — reciprocal used by DOD/ROI
 */
export class HGComicStroke extends HGNode {
  // param 0 (+0x198)  — SetParameter case 0
  sigma: number;
  // param 3 (+0x19c)  — SetParameter case 3
  alphaReplaceEnabled: number;
  // param 1 (+0x1a0)  — SetParameter case 1
  alphaPremultiplyOutput: number;
  // param 2 (+0x1a4)  — SetParameter case 2
  downsampleScale: number;

  /**
   * `HGComicStroke::HGComicStroke()` — @Helium 0x170430 (C1 body).
   *
   * Verbatim transcription of the asm:
   *   0x170439: callq __ZN6HGNodeC2Ev              ; HGNode::HGNode() (base ctor)
   *   0x17043e: leaq  0x8b0b9b(%rip), %rax         ; = 0xa20fe0 (HGComicStroke vtable)
   *   0x170445: movq  %rax, (%rbx)                 ; *this = HGComicStroke vtable
   *   0x170448: movaps 0x259b91(%rip), %xmm0       ; = __const @0x3c9fe0
   *                                                ; = {0.0f, 0.0f, 0.0f, 1.0f}
   *   0x17044f: movups %xmm0, 0x198(%rbx)          ; store 16 bytes at +0x198
   *   0x170456: orl   $0x620, 0x10(%rbx)           ; renderPageStrategy |= 0x620
   *   0x17045d: retq
   *
   * The vtable pointer install and the base-ctor call are inherent to
   * subclassing HGNode in the TS port; here we mirror the field writes.
   */
  constructor() {
    super(); // @0x170439: callq __ZN6HGNodeC2Ev
    // @0x17044f: movups __const@0x3c9fe0 -> +0x198..+0x1a7 (4×f32 {0,0,0,1.0})
    this.sigma = Math.fround(CTOR_PARAM_DEFAULTS_198[0]);                  // +0x198
    this.alphaReplaceEnabled = Math.fround(CTOR_PARAM_DEFAULTS_198[1]);    // +0x19c
    this.alphaPremultiplyOutput = Math.fround(CTOR_PARAM_DEFAULTS_198[2]); // +0x1a0
    this.downsampleScale = Math.fround(CTOR_PARAM_DEFAULTS_198[3]);        // +0x1a4
    // @0x170456: orl $0x620, 0x10(%rbx) — flag bits into HGNode's u32
    // renderPageStrategy field at +0x10. Base HGNode ctor installs 0x200;
    // this class raises it to 0x200 | 0x620 = 0x820.
    this.renderPageStrategy = (this.renderPageStrategy | 0x620) >>> 0;
  }

  /**
   * `HGComicStroke::SetParameter(int,float,float,float,float)` — @Helium 0x1704b0.
   *
   * Verbatim asm structure:
   *   0x1704b4: cmpl  $0x3, %esi                      ; if esi > 3 → return -1
   *   0x1704b7: ja    0x170537                        ; @0x170537: mov $-1, %eax; ret
   *   0x1704bb: leaq  0x7e(%rip), %rcx                ; jumptable base
   *   0x1704c2: movslq (%rcx,%rax,4), %rax
   *   0x1704c6: addq  %rcx, %rax
   *   0x1704c9: jmpq  *%rax
   * Jumptable dispatch (case index = %esi):
   *   case 0 → @0x1704cb: ucomiss 0x198(%rdi),%xmm0   ; test unordered/equal
   *            jne 0x1704d6                             ;   nan or !=
   *            jnp 0x170533                             ;   ordered & equal → xor eax; ret 0
   *            0x1704d6: movss %xmm0, 0x198(%rdi)     ; store new value
   *            0x1704de: mov $0x1, %eax; ret 1         ; "changed"
   *   case 1 → @0x1704e5: ucomiss 0x1a0(%rdi),%xmm0   ; same pattern, slot +0x1a0
   *            0x1704f0: movss %xmm0, 0x1a0(%rdi)
   *   case 2 → @0x1704ff: ucomiss 0x1a4(%rdi),%xmm0   ; slot +0x1a4
   *            0x17050a: movss %xmm0, 0x1a4(%rdi)
   *   case 3 → @0x170519: ucomiss 0x19c(%rdi),%xmm0   ; slot +0x19c
   *            0x170524: movss %xmm0, 0x19c(%rdi)
   *   default (case > 3): return -1 (@0x170537).
   *
   * Returns 1 if the parameter changed, 0 if identical (ordered-equal), or
   * -1 if the index is out of range. ONLY parameter `a` is used; b/c/d are
   * ignored (asm reads no other xmm register). Every store/compare is f32.
   */
  SetParameter(index: number, a: number, _b: number, _c: number, _d: number): number {
    // @0x1704b4: cmpl $0x3, %esi ; ja 0x170537 (>3 → -1). The compare is
    // unsigned (ja), so negative indices also go here.
    if ((index >>> 0) > 3) {
      return -1; // @0x170537: mov $0xffffffff, %eax; ret
    }
    const av = Math.fround(a);
    switch (index) {
      case 0: {
        // @0x1704cb..1704e4  slot +0x198
        const cur = Math.fround(this.sigma);
        // ucomiss + jne/jnp: unordered (NaN) OR not-equal → store; ordered-equal → no store.
        // Faithful semantics: `cur === av` fails for NaN (ordered check).
        if (cur === av) return 0; // @0x170533: xorl %eax,%eax; ret
        this.sigma = av; // @0x1704d6: movss
        return 1; // @0x1704de: mov $1
      }
      case 1: {
        // @0x1704e5..1704fe  slot +0x1a0
        const cur = Math.fround(this.alphaPremultiplyOutput);
        if (cur === av) return 0;
        this.alphaPremultiplyOutput = av;
        return 1;
      }
      case 2: {
        // @0x1704ff..170518  slot +0x1a4
        const cur = Math.fround(this.downsampleScale);
        if (cur === av) return 0;
        this.downsampleScale = av;
        return 1;
      }
      case 3: {
        // @0x170519..170532  slot +0x19c
        const cur = Math.fround(this.alphaReplaceEnabled);
        if (cur === av) return 0;
        this.alphaReplaceEnabled = av;
        return 1;
      }
      default:
        // Unreachable (guarded above), but faithful to the trailing @0x170537.
        return -1;
    }
  }

  /**
   * `HGComicStroke::IntermediateFormat(HGFormat) const` — @Helium 0x1ff30
   * (ICF-folded with HGComicStrokeAndBlend::IntermediateFormat; both weak
   * symbols share this body).
   *
   * Verbatim asm:
   *   0x1ff34: movl $0x18, %eax     ; return 0x18 (HGFormat enum value)
   *   0x1ff39: popq %rbp; retq
   *
   * The input HGFormat argument is not read (dead). The body returns the
   * fixed enum literal 0x18 regardless of the caller's format.
   */
  IntermediateFormat(_format: HGFormat): HGFormat {
    return 0x18; // @0x1ff34: movl $0x18, %eax
  }

  /**
   * `HGComicStroke::GetDOD(HGRenderer*, int, HGRect)` — @Helium 0x170560.
   *
   * Verbatim asm structure:
   *   0x170576: testl %edx, %edx                     ; if inputIndex != 0
   *   0x170578: je 0x17058d                          ;   → normal path
   *   0x17057a: leaq _HGRectNull(%rip), %rcx         ; else load _HGRectNull
   *   0x170581: movq (%rcx), %rax                    ;   {x,y} = 0
   *   0x170584: movq 0x8(%rcx), %rdx                 ;   {right,bottom} = 0
   *   0x170588: jmp 0x170621                         ;   return _HGRectNull
   *   0x17058d: (input==0 branch)
   *     leaq -0x20(%rbp), %rdi                       ; &incoming rect on stack
   *     callq HGRect::IsInfinite() const
   *     testb %al,%al
   *     jne 0x1705a7 → return incoming rect unchanged
   *     movss 0x1a4(%rbx), %xmm0                     ; scale = downsampleScale (f32)
   *     cvtss2sd %xmm0, %xmm0                        ; widen to f64
   *     movsd %xmm0, -0x28(%rbp)                     ; save
   *     leaq -0xb8(%rbp), %rbx                       ; &tx (stack HGTransform)
   *     movq %rbx, %rdi
   *     callq HGTransform::HGTransform()             ; tx = identity
   *     movsd @const 0x3ca260, %xmm2                 ; = 1.0 (f64)
   *     movsd -0x28(%rbp), %xmm0                     ; xmm0 = scale (f64)
   *     movaps %xmm0, %xmm1                          ; xmm1 = scale (f64)
   *     movq %rbx, %rdi
   *     callq HGTransform::Scale(d,d,d)              ; tx.Scale(scale, scale, 1.0)
   *     callq HGTransformUtils::MinW()               ; xmm0 = minW (f32)
   *     movaps %xmm0, %xmm1
   *     leaq -0xb8(%rbp), %rdi                       ; &tx
   *     movss @const 0x3c7cc8, %xmm0                 ; = 0.5f
   *     movq incoming.lo, %rsi
   *     movq incoming.hi, %rdx
   *     callq HGTransformUtils::GetDOD(&tx, incoming, 0.5f, minW)
   *     movq %rax, %rbx; movq %rdx, %r14
   *     callq HGTransform::~HGTransform()
   *     return {rbx, r14}
   */
  GetDOD(_renderer: HGRenderer, inputIndex: number, incoming: HGRect): HGRect {
    // @0x170576-8: testl/je — if inputIndex != 0 return _HGRectNull.
    // testl operates on the low 32 bits; use `| 0` to match int32 semantics.
    if ((inputIndex | 0) !== 0) {
      // @0x17057a: leaq _HGRectNull(%rip); return the null rect.
      return HGRectNullConst;
    }
    // @0x170590: passthrough if incoming rect is HGRect::IsInfinite().
    // The callee is a member function whose body is not transcribed yet;
    // we throw to expose the frontier gap rather than silently take one
    // branch or the other.
    void incoming;
    stub_HGRect_IsInfinite_not_transcribed();
    // The remainder of GetDOD is not reachable in TS until the
    // HGTransform/HGTransformUtils frontier lands; every callee below
    // is a throwing stub citing its @0xADDR.
    // Kept here for provenance of the widen + call sequence.
    // @0x1705af: scale = f32→f64 widen of downsampleScale (+0x1a4).
    const scaleF32 = Math.fround(this.downsampleScale);
    const scaleF64: number = scaleF32; // cvtss2sd (f32 → f64)
    void scaleF64;
    void F64_ONE_AT_3CA260;
    stub_HGTransform_ctor_not_transcribed();
  }

  /**
   * `HGComicStroke::GetROI(HGRenderer*, int, HGRect)` — @Helium 0x170650.
   *
   * Verbatim asm structure:
   *   0x170668: cmpl $0x1, %edx; je 0x170752      ; inputIndex == 1 → passthrough branch
   *   0x170671: testl %edx, %edx; jne 0x170781    ; inputIndex != 0 && != 1 → return _HGRectNull
   *   0x170679: (inputIndex==0 branch — the interesting one)
   *     movss 0x1a4(%rbx), %xmm0
   *     cvtss2sd %xmm0, %xmm0                     ; scale = downsampleScale (widened)
   *     movsd @const 0x3ca260, %xmm1              ; = 1.0 (f64)
   *     divsd %xmm0, %xmm1                        ; %xmm1 = 1.0 / scale
   *     movsd %xmm1, -0x38(%rbp)                  ; save reciprocal
   *     leaq -0xc8(%rbp), %r12
   *     callq HGTransform::HGTransform()          ; tx = identity
   *     movq %r12, %rdi
   *     movsd -0x38(%rbp), %xmm0                  ; xmm0 = 1/scale (f64)
   *     movaps %xmm0, %xmm1                       ; xmm1 = 1/scale (f64)
   *     movsd @const 0x3ca260, %xmm2              ; xmm2 = 1.0 (f64)
   *     callq HGTransform::Scale(1/scale,1/scale,1.0)
   *     callq HGTransformUtils::MinW()            ; xmm0 = minW (f32)
   *     movaps %xmm0, %xmm1
   *     leaq -0xc8(%rbp), %rdi                    ; &tx
   *     movss @const 0x3c7cc8, %xmm0              ; = 0.5f
   *     movq incoming.lo, %rsi
   *     movq incoming.hi, %rdx
   *     callq HGTransformUtils::GetROI(&tx, incoming, 0.5f, minW)
   *     movq %rax, -0x30(%rbp); movq %rdx, -0x28(%rbp)  ; roi = result
   *     movss 0x198(%rbx), %xmm0                  ; xmm0 = sigma (f32)
   *     addss %xmm0, %xmm0                        ; xmm0 = 2*sigma
   *     roundss $0xa, %xmm0, %xmm0                ; round toward +∞ (ceil): imm8 lower nibble
   *                                                 0xa = round-up (ceil).
   *     cvttss2si %xmm0, %eax                     ; grow = (int)ceil(2*sigma)
   *     movq %rax, %rdx; shlq $0x20, %rdx; orq %rax, %rdx    ; (grow, grow) packed in %rdx
   *     negl %eax                                 ; -grow
   *     movq %rax, %rsi; shlq $0x20, %rsi; orq %rax, %rsi    ; (-grow, -grow) packed in %rsi
   *     leaq -0x30(%rbp), %rdi                    ; &roi
   *     callq HGRect::Grow(HGRect)                ; roi.Grow({-grow,-grow,+grow,+grow})
   *     movl $0xffffffff, %edi; %esi              ; args {-1,-1,+1,+1}
   *     movl $0x1, %edx; %ecx
   *     callq _HGRectMake4i
   *     leaq -0x30(%rbp), %rdi
   *     movq %rax, %rsi
   *     callq HGRect::Grow(HGRect)                ; roi.Grow({-1,-1,+1,+1})
   *     leaq -0xc8(%rbp), %rdi
   *     callq HGTransform::~HGTransform()
   *     return roi
   *   0x170752: (inputIndex == 1 branch)
   *     movq incoming.lo, -0x30(%rbp); movq incoming.hi, -0x28(%rbp)
   *     Grow by {-1,-1,+1,+1}  (SAME _HGRectMake4i + HGRect::Grow calls)
   *     return roi
   *   0x170781: (inputIndex >= 2 branch)
   *     leaq _HGRectNull(%rip), %rax; movups (%rax), %xmm0; movaps ... -0x30(%rbp)
   *     return _HGRectNull
   *
   * NOTE the ceil(2*sigma) growth is applied only on the input==0 branch;
   * both input==0 and input==1 additionally grow by the unit square
   * {-1,-1,+1,+1}. inputIndex >= 2 short-circuits to _HGRectNull.
   */
  GetROI(_renderer: HGRenderer, inputIndex: number, incoming: HGRect): HGRect {
    const idx = inputIndex | 0;
    if (idx === 1) {
      // @0x170752 branch. Not reachable until _HGRectMake4i + HGRect::Grow
      // (member) are wired; both callees are stubbed. incoming and the
      // {-1,-1,+1,+1} unit square are the only inputs.
      void incoming;
      stub_HGRect_Grow_member_not_transcribed();
    }
    if (idx !== 0) {
      // @0x170781 branch — inputIndex >= 2 → _HGRectNull.
      return HGRectNullConst;
    }
    // inputIndex == 0 — full path. Every non-trivial callee is stubbed.
    const scaleF32 = Math.fround(this.downsampleScale);
    // @0x170688: cvtss2sd + divsd — reciprocal = 1.0 (f64) / scale (f64).
    const reciprocal = F64_ONE_AT_3CA260 / (scaleF32 as number); // divsd
    void reciprocal;
    // @0x1706ea: ceil(2 * sigma) computed as roundss imm=0xa then cvttss2si.
    // roundss with imm 0xa is round-toward-+∞ (ceil) in single precision;
    // cvttss2si truncates the (already-integral) f32 to i32.
    const sigmaF32 = Math.fround(this.sigma);
    const grow_i32 = Math.trunc(Math.ceil(Math.fround(sigmaF32 + sigmaF32))) | 0;
    void grow_i32;
    stub_HGTransform_ctor_not_transcribed();
  }

  /**
   * `HGComicStroke::RenderTile(HGTile*)` — @Helium 0x1707d0.
   *
   * This is the CPU-side per-tile rasterizer (460 lines of SSE/scalar).
   * It implements the same iterative kernel as the GPU shader in
   * `GetProgram` (see below) but on CPU-backed tile buffers: it starts
   * from a per-pixel (y,z) gradient normal, walks 2*sigma steps in both
   * directions accumulating exp(-i/(3*sigma^2)) weighted samples, then
   * smoothsteps `acc * 0.5 / norma` in [0, 0.8] and writes the final
   * greyscale RGBA (with optional alpha-replace / alpha-premultiply).
   *
   * The routine is NOT transcribed yet — every RIP-relative SSE constant,
   * every HGTile buffer-index calculation, every HGRenderer vfn call
   * (`callq *0x138(%rcx)` @0x170808 for input-slot fetch, etc.) still
   * needs to be resolved. Landing this properly requires:
   *   - HGTile layout (Renderer(), input-slot stride at +0x18/+0x50/+0x58)
   *   - the two 16-byte SSE min/max clamp vectors at @0x25735c/@0x257374
   *   - the exp() implementation the compiler inlined (or the libm callee)
   *
   * Until then this is a THROWing stub citing its @0xADDR so that
   * `frontier.py` sees the gap and no downstream caller silently gets a
   * black tile.
   */
  RenderTile(_tile: HGTile): number {
    // @0x1707fa: HGTile::Renderer() — first non-prologue callee. Cite it
    // via the stub so the frontier tracker records the gap.
    void _tile;
    stub_HGTile_Renderer_not_transcribed();
  }

  /**
   * `HGComicStroke::GetOutput(HGRenderer*)` — @Helium 0x170f90.
   *
   * Verbatim asm:
   *   0x170f99: movss  0x198(%rdi), %xmm0        ; a = sigma (f32)
   *   0x170fa1: xorps  %xmm1, %xmm1              ; b = 0
   *   0x170fa4: xorps  %xmm2, %xmm2              ; c = 0
   *   0x170fa7: xorps  %xmm3, %xmm3              ; d = 0
   *   0x170faa: xorl   %esi, %esi                ; index = 0
   *   0x170fac: callq  __ZN6HGNode12SetParameterEiffff   ; base::SetParameter(0, sigma, 0, 0, 0)
   *   0x170fb1: movss  @const 0x3c7cc0, %xmm1    ; xmm1 = 1.0f
   *   0x170fb9: movss  0x19c(%rbx), %xmm0        ; xmm0 = alphaReplaceEnabled
   *   0x170fc1: cmpeqss %xmm1, %xmm0             ; xmm0 = (alphaReplace == 1.0) ? 0xFFFFFFFF : 0
   *   0x170fc6: andps  %xmm1, %xmm0              ; xmm0 = (== 1.0) ? 1.0f : 0.0f
   *   0x170fc9: xorps  %xmm1, %xmm1              ; b = 0
   *   0x170fcc: xorps  %xmm2, %xmm2              ; c = 0
   *   0x170fcf: xorps  %xmm3, %xmm3              ; d = 0
   *   0x170fd2: movq   %rbx, %rdi
   *   0x170fd5: movl   $0x1, %esi                ; index = 1
   *   0x170fda: callq  __ZN6HGNode12SetParameterEiffff   ; base::SetParameter(1, alphaReplaceCanon, 0,0,0)
   *   0x170fdf: movss  0x1a0(%rbx), %xmm0        ; xmm0 = alphaPremultiplyOutput
   *   0x170fe7: movss  @const 0x3c7cc0, %xmm1    ; xmm1 = 1.0f
   *   0x170fef: cmpeqss %xmm1, %xmm0             ; equal-to-1.0 mask
   *   0x170ff4: andps  %xmm1, %xmm0              ; canonicalise to 0.0f / 1.0f
   *   ...xor xmm1/2/3, mov $0x2, %esi
   *   0x171008: callq  __ZN6HGNode12SetParameterEiffff   ; base::SetParameter(2, alphaPremultCanon, 0,0,0)
   *   0x17100d: movss  0x1a0(%rbx), %xmm0        ; reload alphaPremultiplyOutput
   *   0x171015: xorps  %xmm1, %xmm1
   *   0x171018: ucomiss %xmm1, %xmm0             ; test against 0.0
   *   0x17101b/1d: jne/jp 0x17103e               ; if != 0.0 (or NaN): skip; else fall through
   *   0x17101f: movq (%rbx), %rax
   *   0x171022: movq %rbx, %rdi
   *   0x171025: xorl %esi, %esi
   *   0x171027: callq *0x80(%rax)                ; vtable[0x80/8 = slot 16]  (some getter)
   *   0x17102d: movq (%rbx), %rcx
   *   0x171030: movq %rbx, %rdi
   *   0x171033: movl $0x1, %esi
   *   0x171038: movq %rax, %rdx
   *   0x17103b: callq *0x78(%rcx)                ; vtable[0x78/8 = slot 15]  (some setter with the getter's result)
   *   0x17103e: movq %rbx, %rax                  ; return this
   *   ...ret
   */
  GetOutput(_renderer: HGRenderer): HGComicStroke {
    // @0x170f99..170fac: base::SetParameter(0, sigma, 0, 0, 0).
    // The base slot is not yet transcribed — throw citing its @0xADDR.
    // Parameter values below preserved for provenance of the cmpeqss/andps
    // canonicalisation pattern.
    const sigmaF32 = Math.fround(this.sigma);
    void sigmaF32;
    // @0x170fc1..fc6: (alphaReplace == 1.0f) ? 1.0f : 0.0f. cmpeqss returns
    // an all-1s mask on ordered-equal, then `andps xmm1` gates the mask
    // through the literal 1.0f in xmm1.
    const alphaReplaceCanon =
      Math.fround(this.alphaReplaceEnabled) === F32_ONE_AT_3C7CC0
        ? F32_ONE_AT_3C7CC0
        : Math.fround(0.0);
    void alphaReplaceCanon;
    // @0x170fef..ff4: same pattern for alphaPremultiplyOutput.
    const alphaPremultCanon =
      Math.fround(this.alphaPremultiplyOutput) === F32_ONE_AT_3C7CC0
        ? F32_ONE_AT_3C7CC0
        : Math.fround(0.0);
    void alphaPremultCanon;
    stub_HGNode_SetParameter_not_transcribed();
  }

  /**
   * `HGComicStroke::GetProgram(HGRenderer*)` — @Helium 0x171050.
   *
   * The method inspects the current renderer's target class and returns
   * ONE of two null-terminated GPU program source strings from Helium's
   * __TEXT __cstring section.
   *
   * Verbatim asm:
   *   0x171056: movq %rsi, %rbx              ; %rbx = renderer
   *   0x171059: movq %rsi, %rdi
   *   0x17105c: movl $0x60000, %esi          ; unsigned int = 0x60000
   *   0x171061: callq HGRenderer::GetTarget(u32)
   *   0x171066: cmpl $0x60b0f, %eax          ; > 0x60b0f?
   *   0x17106b: jbe 0x17107b                 ; no → GL fallback branch
   *   0x17106d: leaq @cstring[Metal fragment source](%rip), %rax
   *   0x171074: ret
   *   0x17107b: movq (%rbx), %rax; movq %rbx, %rdi; movl $0x2e, %esi
   *   0x171086: callq *0x80(%rax)            ; vtable[0x80/8 = 16] with arg 0x2e
   *   0x17108c: movl %eax, %ecx
   *   0x17108e: xorl %eax, %eax               ; default null return
   *   0x171090: testl %ecx, %ecx
   *   0x171092: leaq @cstring[GLES fragment](%rip), %rcx
   *   0x171099: cmovneq %rcx, %rax           ; if the vtable call returned non-zero, return GLES
   *   0x1710a3: ret
   *
   * The two program source strings are captured verbatim in the shader
   * module (see raw-port/src/shaders/HGComicStroke.metal.ts /
   * HGComicStroke.gles.ts once landed). Currently this method throws to
   * mark the un-decoded HGRenderer::GetTarget frontier.
   */
  GetProgram(_renderer: HGRenderer): string | null {
    // @0x171061: HGRenderer::GetTarget(0x60000). Un-resolved.
    void _renderer;
    stub_HGRenderer_GetTarget_not_transcribed();
  }

  /**
   * `HGComicStroke::BindTexture(HGHandler*, int)` — @Helium 0x1710b0.
   *
   * Verbatim asm:
   *   0x1710bb: movl %edx, %r14d              ; save index (int)
   *   0x1710be: movq %rsi, %rbx               ; save handler
   *   0x1710c1: testl %edx, %edx              ; if index != 0
   *   0x1710c3: je 0x1710d9                   ;    → binding-0 branch
   *   0x1710c5: (index != 0 branch — bind sampler slot `index`)
   *     movq %rbx, %rdi; movl %r14d, %esi
   *     xor edx, ecx, r8d = 0
   *     callq HGHandler::TexCoord(int, int, int, double const*)
   *     ; TexCoord(index, 0, 0, nullptr) — sets bare texcoord slot
   *     jmp 0x17111c
   *   0x1710d9: (index == 0 branch — the parameterised path)
   *     movss @const 0x3c7cc0, %xmm0         ; xmm0 = 1.0f
   *     divss 0x1a4(%rdi), %xmm0             ; xmm0 = 1.0f / downsampleScale
   *     movss %xmm0, -0x14(%rbp)             ; save f32 reciprocal
   *     movq %rbx, %rdi
   *     xor esi, edx, ecx, r8d = 0
   *     callq HGHandler::TexCoord(int, int, int, double const*)
   *     ; TexCoord(0, 0, 0, nullptr) — the default binding
   *     movss -0x14(%rbp), %xmm0             ; xmm0 = 1/scale (f32)
   *     cvtss2sd %xmm0, %xmm0                ; widen to f64
   *     movq (%rbx), %rax                    ; %rax = HGHandler vtable
   *     movsd @const 0x3ca260, %xmm2         ; xmm2 = 1.0 (f64)
   *     movq %rbx, %rdi
   *     movaps %xmm0, %xmm1                  ; xmm1 = 1/scale (f64)
   *     callq *0x68(%rax)                    ; HGHandler vtable slot 0x68/8 = 13
   *     ; slot(1/scale as f64 in xmm0, 1/scale in xmm1, 1.0 in xmm2)
   *   0x17111c: (both branches converge)
   *     movq (%rbx), %rax; movq %rbx, %rdi; movl %r14d, %esi; xor edx
   *     callq *0x48(%rax)                    ; vtable slot 0x48/8 = 9
   *   0x17112a: movq (%rbx), %rax; movq %rbx, %rdi; xorl %esi, %esi
   *     callq *0x38(%rax)                    ; vtable slot 0x38/8 = 7
   *   0x171135: movq (%rbx), %rax; movq %rbx, %rdi; movl $0x1, %esi; movl $0x1, %edx
   *     callq *0x30(%rax)                    ; vtable slot 0x30/8 = 6, args (1, 1)
   *   0x171148: xorl %eax, %eax               ; return 0
   *
   * The HGHandler vtable slots {0x30, 0x38, 0x48, 0x68} are used unresolved;
   * they belong to HGHandler's own vtable which is not yet decoded here.
   */
  BindTexture(handler: HGHandler, index: number): number {
    // @0x1710bb..c3: signed int test.
    const idx = index | 0;
    if (idx !== 0) {
      // @0x1710c5..d7: TexCoord(index, 0, 0, nullptr) branch.
      void handler;
      stub_HGHandler_TexCoord_not_transcribed();
    }
    // @0x1710d9: index == 0 branch. Compute f32 reciprocal 1/downsampleScale.
    // @0x1710e1: divss 0x1a4(%rdi), %xmm0 with %xmm0 = 1.0f.
    // The recip is later widened cvtss2sd → f64 for the vtable-slot-0x68 call.
    const reciprocalF32 = Math.fround(
      F32_ONE_AT_3C7CC0 / Math.fround(this.downsampleScale),
    );
    void reciprocalF32;
    stub_HGHandler_TexCoord_not_transcribed();
    // rest of the body (four vtable calls on the HGHandler) is unreachable
    // until HGHandler's vtable is decoded — cite the addresses in comments.
  }

  /**
   * `HGComicStroke::InitProgramDescriptor(HGProgramDescriptor*) const` —
   * @Helium 0x171160.
   *
   * The entire body is a bare prologue/epilogue: push %rbp; mov %rsp,%rbp;
   * pop %rbp; ret. No arguments are read, no fields touched. This is a
   * deliberate no-op (the base HGNode's descriptor-init already suffices
   * for HGComicStroke).
   */
  InitProgramDescriptor(_desc: HGProgramDescriptor): void {
    // @0x171160..0x171165: no-op.
  }

  /**
   * `HGComicStroke::~HGComicStroke()` — @Helium 0x170470 (D1/D2 non-
   * deleting). Verbatim asm:
   *   0x170470-0x170480 body: identical prologue then `callq __ZN6HGNodeD2Ev`
   *   followed by return. Both D1 and D2 addresses land here (D0 at 0x170490
   *   is the deleting variant; it calls this then jumps to `operator delete`).
   *
   * We collapse this into a single JS finaliser that tail-calls the base
   * dtor stub. The base is un-transcribed.
   */
  destroy_D1(): void {
    // @0x170470-8: tail-call HGNode::~HGNode() (@0x11bd50).
    stub_HGNode_D2_not_transcribed();
  }

  /**
   * `HGComicStroke::~HGComicStroke()` — @Helium 0x170490 (D0 — deleting).
   * Verbatim asm:
   *   0x170499: callq HGNode::~HGNode()      ; base D2
   *   0x1704a1..7: tail-jump HGObject::operator delete(this)
   */
  destroy_D0(): void {
    stub_HGNode_D2_not_transcribed();
    // Unreachable: the stub above throws first. Kept for provenance of the
    // tail-jmp target @0x1704a7.
    stub_HGObject_delete_not_transcribed();
  }
}
