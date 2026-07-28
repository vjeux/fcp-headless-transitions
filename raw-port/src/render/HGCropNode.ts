// raw-port/src/render/HGCropNode.ts
//
// FCP `HGCropNode` — Helium render-graph node that clips an incoming
// image to a rectangular region. Subclass of HGNode. Ships its own
// vtable slot for SetParameter (rect setter), GetOutput (short-circuit
// pass-through when crop is full), GetDOD (intersect rect with input
// DOD), RenderPageMetal (pass-through when the child page already
// fills the crop rect), Bind/BindTexture (uploads the rect as tex-coord
// scale/offset to the fragment program), GetProgram (returns a small
// premultiplied-crop Metal shader when the target is 0x60b10), and
// SupportsInplaceHardwareBlending (const true).
//
// FRAMEWORK: Helium.framework  (Final Cut Pro).
// DECODE: raw-port/re/disasm/Helium.HGCropNode.*.s
//
// SYMBOLS (Helium x86_64 slice, VAs from nm/otool -tV):
//   @0x247620  HGCropNode::SupportsInplaceHardwareBlending(float)
//   @0x247630  HGCropNode::SetParameter(int, float, float, float, float)
//   @0x2476a0  HGCropNode::BindTexture(HGHandler*, int)
//   @0x247710  HGCropNode::Bind(HGHandler*)
//   @0x247790  HGCropNode::GetDOD(HGRenderer*, int, HGRect)
//   @0x2477f0  HGCropNode::GetOutput(HGRenderer*)
//   @0x247880  HGCropNode::RenderPageMetal(HGPage*)
//   @0x247960  HGCropNode::GetProgram(HGRenderer*)
//   @0x247c30  HGCropNode::~HGCropNode()   [D1 complete dtor]
//   @0x247c70  HGCropNode::~HGCropNode()   [D0 deleting dtor]
//   (no exported C1/C2 ctor symbol — HGCropNode is only ever constructed
//    inline; the D1 dtor's vtable-install literal @0x7eec61(%rip) resolves
//    to the vtable installed-ptr at 0xa36d48 verified by tools/vtable.py.)
//
// VTABLE @Helium 0xa36d38 (installed ptr 0xa36d48; verified by tools/vtable.py):
//   *0x00 -> 0x247c30  HGCropNode::~HGCropNode()   [D1]
//   *0x08 -> 0x247c70  HGCropNode::~HGCropNode()   [D0]
//   *0x60 -> 0x247630  HGCropNode::SetParameter
//   *0xb8 -> 0x247960  HGCropNode::GetProgram
//   *0xc8 -> 0x247710  HGCropNode::Bind
//   *0xd0 -> 0x2476a0  HGCropNode::BindTexture
//   *0xe8 -> 0x247620  HGCropNode::SupportsInplaceHardwareBlending
//   (all other slots inherit HGNode's).
//
// STRUCT LAYOUT (recovered field-by-field from D1/D0/SetParameter/Bind):
//   ---- inherited from HGNode (size 0x198) ----
//     0x000..0x197 : HGNode fields (see HGNode.ts).
//   ---- HGCropNode-specific fields ----
//     0x198 : void*   ownedHeapBuf     (D1 @0x247c3a reads it and if non-null
//                                        passes to `operator delete` (__ZdlPv)
//                                        BEFORE tail-jumping HGNode::~HGNode.
//                                        NOT an HGObject — it's freed via plain
//                                        operator delete, not Release(). No
//                                        other decoded method reads it, so its
//                                        semantic role remains a FRONTIER.)
//     0x1a0 : i32     rect.x           (SetParameter: HGRectMake4f result stored
//     0x1a4 : i32     rect.y            here as two 8-byte movq pairs. Bind
//     0x1a8 : i32     rect.right        reloads all four as int32 via
//     0x1ac : i32     rect.bottom       cvtsi2ssl 0x1a0..0x1ac.)
//   sizeof(HGCropNode) >= 0x1b0 bytes (the D1 dtor only touches up to 0x198;
//   the rect field is inclusive at 0x1a0..0x1af = HGRect layout, per HGRect.ts).
//
// GetProgram RESOURCE (embedded shader string @Helium 0x92993c, resolved
// as (0x247978 + 7 next-instr) + 0x6e1fbd RIP-displacement = 0x92993c; the
// exact bytes are the "//Metal1.0     \n//LEN=0000000355\nfragment ..."
// literal that follows a `leaq` in GetProgram's disasm). The shader
// samples texture0 at texCoord0, computes an on/off mask by checking
// texCoord1 against `hg_Params[0]` (four corners packed as (x0,y0,x1,y1)),
// multiplies the sample by the mask, then multiplies by `hg_Params[1]` (a
// premultiplied color). MD5 in the source: 71c0cb25:36879384:725a4797:f8967426.
//
// PROVENANCE: every method here cites its @0xADDR trail in its own
// docblock. Every RIP-relative constant is resolved via
// `raw-port/army/tools/resolve.py` and cited by address.

import { HGNode } from "./HGNode";
import {
  HGRect,
  HGRectNull,
  HGRectMake4f,
  HGRectIsEqual,
  HGRectIntersection,
} from "./HGRect";
import { HGHandler } from "./HGHandler";

/**
 * Opaque HGRenderer handle. HGCropNode calls three methods on it:
 * GetTarget(unsigned int), GetInput(HGNode*, int), and GetDOD(HGNode*).
 * Each is a member fn on the C++ class; we model them as vcall stubs
 * on this typed handle.
 */
export interface HGRendererApi {
  /**
   * `HGRenderer::GetTarget(unsigned int)` @Helium (call site
   * @0x24796c). Called by GetProgram with `esi=0x60000`. Returns the
   * current render-target id; GetProgram compares its result against
   * `0x60b10` to decide whether to hand out the crop shader.
   */
  GetTarget(kind: number): number;
  /**
   * `HGRenderer::GetInput(HGNode*, int)` @Helium (call sites @0x2477b8,
   * @0x247809). Returns the input HGNode connected at the given slot on
   * the passed parent node (idx == 0 in every observed call).
   */
  GetInput(node: HGNode, idx: number): HGNode | null;
  /**
   * `HGRenderer::GetDOD(HGNode*)` @Helium (call sites @0x2477c3,
   * @0x247817). Returns the DOD (domain-of-definition) HGRect of the
   * passed node in the renderer's coordinate system.
   */
  GetDOD(node: HGNode | null): HGRect;
}

/**
 * Opaque HGPage (page of rendered pixels). RenderPageMetal reads three
 * fields off it: @0x08 (a "next" or "child" chain pointer), @0x10..0x1c
 * (16 bytes of HGRect describing the page's rect), and @0xa8 (a
 * pointer to the child HGPage the crop can pass through to). We type
 * it as an opaque brand and use the FRONTIER helpers below to keep the
 * transcription honest — no field access outside them.
 */
export interface HGPage {
  readonly __brand_HGPage: unique symbol;
}

/**
 * `HGPagePullMetalTexturesGuard` (RAII @Helium). Constructed on the
 * stack in RenderPageMetal to pin the input textures for the duration
 * of the render, destroyed at scope exit. Modeled here as an opaque
 * object with a `dispose()` method; the actual ctor/dtor bodies are a
 * FRONTIER (see call trail below).
 */
export interface HGPagePullMetalTexturesGuard {
  dispose(): void;
}

/**
 * `HGCropNode` — Helium render-graph node cropping its input to a
 * rectangular sub-region. Subclass of HGNode.
 *
 * State:
 *   - inherited HGNode (0x000..0x197)
 *   - ownedHeapBuf (@0x198): FRONTIER — freed by D1 dtor via `operator
 *     delete`; never populated by any of the eight decoded methods.
 *   - rect (@0x1a0): HGRect crop rectangle in the source domain, set by
 *     SetParameter(0, x0,y0,x1,y1) via HGRectMake4f.
 */
export class HGCropNode extends HGNode {
  /**
   * @Helium 0x198 — heap-allocated buffer owned by this node. Freed
   * with `operator delete` by ~HGCropNode. FRONTIER: no decoded method
   * writes it; whatever populates it is not among the 8 decoded methods.
   */
  ownedHeapBuf: unknown | null;

  /**
   * @Helium 0x1a0 — crop rectangle. HGRect (int32 x, y, right, bottom).
   * Set by SetParameter via HGRectMake4f; read by Bind (int-to-float
   * conversion → passed to the fragment program) and by GetDOD /
   * GetOutput (intersected with the child's DOD).
   */
  rect: HGRect;

  /**
   * `HGCropNode::HGCropNode()` — no exported C1/C2 symbol. The ctor
   * body is inlined at construction sites; we know only that the
   * D1 dtor installs vtable @0xa36d48 (`leaq 0x7eec61(%rip),%rax` at
   * 0x247c30; verified by tools/vtable.py), that field 0x198 is
   * initially null (D1 branches on it being null with `je` → tail-jmp
   * base dtor without freeing), and that field 0x1a0 (the rect) is
   * default-initialised: SetParameter's first store into 0x1a0 goes
   * through HGRectMake4f and the class must not require any pre-stored
   * value there (Bind reads it as int32 and would render an empty crop
   * if left zero).
   *
   * We conservatively zero-init both new fields: matches the standard
   * FCP pattern of ctors zero-clearing sub-struct tails, and matches
   * every observable read path.
   */
  constructor() {
    super();
    // Overwrite HGNode's vtable @0x11bb02 with HGCropNode's own vtable
    // installed-ptr @Helium 0xa36d48 (verified by tools/vtable.py).
    this.vtable = 0xa36d48;
    // @0x198: ownedHeapBuf default-init null (see D1 dtor null-branch).
    this.ownedHeapBuf = null;
    // @0x1a0..0x1af: HGRect default-init to HGRectNull. HGRectNull is
    // {x:0,y:0,right:0,bottom:0} — matches a "no cropping observed yet"
    // state; SetParameter is the sole mutator.
    this.rect = { ...HGRectNull };
  }

  /**
   * `HGCropNode::~HGCropNode()` — Helium D1 @0x247c30 (D0 @0x247c70 is
   * "D1 body; ::operator delete this"; the two share the resource-free
   * path). Full D1 asm:
   *
   *   0x247c30: leaq 0x7eec61(%rip), %rax     ; = 0xa36d48 (own vtable installed ptr)
   *   0x247c37: movq %rax, (%rdi)             ; reinstall vtable
   *   0x247c3a: movq 0x198(%rdi), %rax        ; load ownedHeapBuf
   *   0x247c41: testq %rax, %rax
   *   0x247c44: je   __ZN6HGNodeD2Ev          ; if null -> tail-jmp base dtor
   *   0x247c56: callq __ZdlPv                 ; ::operator delete(ownedHeapBuf)
   *   0x247c64: jmp __ZN6HGNodeD2Ev           ; tail-jmp base dtor
   *
   * D0 @0x247c70 has the identical body then tail-jmps to
   * __ZN8HGObjectdlEPv (HGObject::operator delete) instead of returning.
   *
   * Because our TS model doesn't own C++ memory, we only model the
   * user-visible side-effect: null out the heap buffer slot. Base-dtor
   * chain would be invoked here in C++; TS relies on GC.
   */
  destruct(): void {
    // @0x247c37: reinstall vtable (transparent in TS; kept for provenance)
    this.vtable = 0xa36d48;
    // @0x247c3a..0x247c56: free ownedHeapBuf if non-null via `operator delete`.
    if (this.ownedHeapBuf !== null) {
      // C++: `::operator delete(buf)`. TS has no manual heap, so we drop
      // the reference — GC handles reclamation. Provenance is what matters.
      this.ownedHeapBuf = null;
    }
    // @0x247c64: tail-jmp HGNode::~HGNode() would run the base D2 body.
    // The base's destruct() is defined in HGNode.ts; TS GC handles the rest.
  }

  /**
   * `HGCropNode::SetParameter(int idx, float x0, float y0, float x1, float y1)`
   * — Helium @0x247630. Only accepts idx == 0 (single "rect" parameter);
   * every other index returns -1. Full asm:
   *
   *   0x247630: movl  $0xffffffff, %eax           ; ret = -1
   *   0x247635: testl %esi, %esi                   ; idx == 0 ?
   *   0x247637: je    0x24763a                     ; -> proceed
   *   0x247639: retq                               ; else return -1
   *
   *   0x247647: callq _HGRectMake4f                ; r14:r15 = HGRectMake4f(x0,y0,x1,y1)
   *   0x247652: movq  0x1a0(%rbx), %rdx            ; rdx = old rect lo
   *   0x247659: movq  0x1a8(%rbx), %rcx            ; rcx = old rect hi
   *   0x247660: movq  %rax, %rdi                   ; new rect lo
   *   0x247663: movq  %r15, %rsi                   ; new rect hi
   *   0x247666: callq _HGRectIsEqual               ; equal?
   *   0x24766d: xorl  %eax, %eax                   ; ret = 0
   *   0x24766f: testl %ecx, %ecx
   *   0x247671: jne   0x24768e                     ; equal -> return 0 (no change)
   *   0x247673: movq  %r14, 0x1a0(%rbx)            ; store new rect lo
   *   0x24767a: movq  %r15, 0x1a8(%rbx)            ; store new rect hi
   *   0x247681: callq __ZN6HGNode9ClearBitsEv      ; HGNode::ClearBits()
   *   0x247689: movl  $0x1, %eax                   ; ret = 1
   *   0x24768e: return
   *
   * Return codes (mirrors HGNode::SetParameter conventions):
   *   -1  invalid idx
   *    0  same value; no change
   *   +1  value updated; ClearBits invoked
   */
  SetParameter(idx: number, x0: number, y0: number, x1: number, y1: number): number {
    // @0x247630..0x247639: only idx==0 is valid.
    if ((idx | 0) !== 0) return -1 | 0;

    // @0x247647: normalise + integer-clamp via HGRectMake4f (returns HGRect).
    // Each argument is single-precision on entry (movss into xmm regs); we
    // keep them as JS numbers — HGRectMake4f is authored to be
    // single-precision-safe (see HGRect.ts constants @0x3d2270/0x3d2280).
    const newRect = HGRectMake4f(x0, y0, x1, y1);

    // @0x247666: old vs new equality check.
    if (HGRectIsEqual(this.rect, newRect)) {
      // @0x24766d..0x24768e: same value → return 0 (no change).
      return 0;
    }

    // @0x247673..0x24767a: store new rect.
    this.rect = newRect;

    // @0x247684: HGNode::ClearBits() invalidates cached state.
    // Per HGNode.ts this method is a FRONTIER at @Helium 0x11f6b0.
    // Rule 3: call through a throwing stub CITING the addr.
    HGNode_ClearBits(this);

    // @0x247689: ret = 1
    return 1;
  }

  /**
   * `HGCropNode::SupportsInplaceHardwareBlending(float)` — Helium
   * @0x247620. Constant `true`. Full asm:
   *   0x247620: pushq %rbp
   *   0x247621: movq  %rsp, %rbp
   *   0x247624: movb  $0x1, %al        ; return 1 (bool true)
   *   0x247626: popq  %rbp
   *   0x247627: retq
   */
  SupportsInplaceHardwareBlending(_arg: number): boolean {
    // @0x247624: return true unconditionally.
    return true;
  }

  /**
   * `HGCropNode::GetProgram(HGRenderer*)` — Helium @0x247960. Returns a
   * pointer to an embedded Metal fragment-shader source string IFF the
   * renderer's active target is 0x60b10, else null. Full asm:
   *
   *   0x247964: movq  %rsi, %rdi
   *   0x247967: movl  $0x60000, %esi
   *   0x24796c: callq HGRenderer::GetTarget(unsigned int)
   *   0x247971: xorl  %ecx, %ecx
   *   0x247973: cmpl  $0x60b10, %eax
   *   0x247978: leaq  0x6e1fbd(%rip), %rax     ; = shader string @Helium 0x92993c
   *   0x24797f: cmoveq %rax, %rcx              ; if eq -> rcx = shader ptr
   *   0x247983: movq  %rcx, %rax               ; ret
   *   0x247987: retq
   *
   * The literal-pool string is the exact 355-byte Metal shader with
   * MD5=71c0cb25:36879384:725a4797:f8967426, sampling texture0 through
   * a rect gate defined by hg_Params[0]=(x0,y0,x1,y1) and multiplying
   * by hg_Params[1] (premultiplied colour).
   */
  GetProgram(renderer: HGRendererApi): string | null {
    // @0x247967..0x24796c: kind = 0x60000
    const target = renderer.GetTarget(0x60000);
    // @0x247973..0x24797f: compare against 0x60b10 and cmove the shader ptr.
    if (target === 0x60b10) {
      return HGCROPNODE_METAL_FRAGMENT_SHADER;
    }
    return null;
  }

  /**
   * `HGCropNode::Bind(HGHandler*)` — Helium @0x247710. Uploads the
   * crop rect to the fragment program as float4 tex-coord data and
   * chains through the parent-node bind. Full asm:
   *
   *   0x247717: movq  %rsi, %rbx              ; handler
   *   0x24771a: movq  %rdi, %r14              ; this
   *   0x24771d..0x24772c: HGHandler::TexCoord(handler, 1, 0, 0, nullptr)
   *   0x247731: cvtsi2ssl 0x1a0(%r14), %xmm0  ; xmm0 = (float)rect.x
   *   0x24773a: cvtsi2ssl 0x1a4(%r14), %xmm1  ; xmm1 = (float)rect.y
   *   0x247743: cvtsi2ssl 0x1a8(%r14), %xmm2  ; xmm2 = (float)rect.right
   *   0x24774c: cvtsi2ssl 0x1ac(%r14), %xmm3  ; xmm3 = (float)rect.bottom
   *   0x247755: movq (%rbx), %rax             ; handler->vtbl
   *   0x24775b: xorl  %esi, %esi              ; arg1 = 0
   *   0x24775d: callq *0x88(%rax)             ; handler->vtbl[0x88](0, xmm0..xmm3)
   *   0x247763: movq (%r14), %rax             ; this->vtbl (HGCropNode vtable)
   *   0x247766: movq %r14, %rdi
   *   0x247769: callq *0x120(%rax)            ; vcall this->vtbl[0x120] — HGNode base slot
   *   0x24776f: movq (%rbx), %rax             ; handler->vtbl again
   *   0x247775: movl $0x1, %esi               ; arg1 = 1
   *   0x24777a..0x247780: movaps %xmm0, xmm1/xmm2/xmm3
   *                                            ; broadcast xmm0 = rect.x across all 4 lanes
   *   0x247783: callq *0x88(%rax)             ; handler->vtbl[0x88](1, x,x,x,x)
   *   0x247789: xorl %eax, %eax               ; ret 0
   *   0x24778b: return
   *
   * Note the second float4 upload takes xmm0 broadcast across all four
   * lanes — this reflects the shader's use of hg_Params[1] as a
   * scalar-broadcast premultiplier (see the shader source: it multiplies
   * a scalar-broadcast rgba). Only slot-0's four distinct lanes carry
   * the actual rect corners; slot-1 is a premultiply that happens to be
   * driven by rect.x in this specific hardware path.
   */
  Bind(handler: HGHandler): number {
    // @0x24771d..0x24772c: HGHandler::TexCoord(handler, 1, 0, 0, nullptr)
    HGHandler_TexCoord(handler, 1, 0, 0, null);

    // @0x247731..0x24774c: convert rect fields to fp32.
    const rx = Math.fround(this.rect.x | 0);
    const ry = Math.fround(this.rect.y | 0);
    const rr = Math.fround(this.rect.right | 0);
    const rb = Math.fround(this.rect.bottom | 0);

    // @0x247755..0x24775d: handler vtable[0x88] slot-0 upload = (rx,ry,rr,rb).
    HGHandler_vtbl_uploadFloat4(handler, 0, rx, ry, rr, rb);

    // @0x247763..0x247769: this vtable[0x120] — inherited HGNode slot.
    HGNode_vtbl_0x120(this);

    // @0x24776f..0x247783: handler vtable[0x88] slot-1 upload = (rx,rx,rx,rx)
    // (movaps xmm0 -> xmm1/xmm2/xmm3 broadcasts %xmm0 = rect.x across lanes).
    HGHandler_vtbl_uploadFloat4(handler, 1, rx, rx, rx, rx);

    // @0x247789: return 0
    return 0;
  }

  /**
   * `HGCropNode::BindTexture(HGHandler* h, int idx)` — Helium @0x2476a0.
   * When idx == 0, resets a handler+texture-slot combination through a
   * short vtable dance; otherwise returns -1. Full asm:
   *
   *   0x2476a7: movl $0xffffffff, %ebx        ; ret = -1
   *   0x2476ac: testl %edx, %edx              ; idx == 0 ?
   *   0x2476ae: jne  0x247705                 ; !=0 -> return -1
   *
   *   0x2476b0: movq %rsi, %r14               ; h
   *   0x2476b3: movq (%rsi), %rax             ; h->vtbl
   *   0x2476b6: xorl %ebx, %ebx               ; ret = 0
   *   0x2476b8..0x2476bf: h->vtbl[0x48](h, 0, 0)   ; reset slot 0
   *   0x2476c2..0x2476cc: h->vtbl[0x30](h, 0, 0)   ; reset related slot
   *   0x2476cf..0x2476db: HGHandler::TexCoord(h, 0, 0, 0, nullptr)
   *   0x2476e0..0x2476ef: h->m_field_90->vtbl[0x80](field_90, 0x2e)
   *   0x2476f5: testl %eax, %eax
   *   0x2476f7: jne  0x247705                  ; -> return 0 (skip vcall)
   *   0x2476f9..0x2476ff: h->vtbl[0xa8](h)     ; final action when feature 0x2e is absent
   *   0x247705: return ebx (-1 or 0)
   *
   * Return: -1 for idx!=0; 0 for idx==0.
   */
  BindTexture(handler: HGHandler, idx: number): number {
    // @0x2476ac..0x2476ae: gate on idx==0.
    if ((idx | 0) !== 0) return -1 | 0;

    // @0x2476b8..0x2476bf: handler vtable *0x48 (h, 0, 0)
    HGHandler_vtbl_0x48(handler, 0, 0);
    // @0x2476c2..0x2476cc: handler vtable *0x30 (h, 0, 0)
    HGHandler_vtbl_0x30(handler, 0, 0);
    // @0x2476cf..0x2476db: HGHandler::TexCoord(h, 0, 0, 0, nullptr)
    HGHandler_TexCoord(handler, 0, 0, 0, null);

    // @0x2476e0..0x2476ef: query handler->field_90 vtbl *0x80 (feature 0x2e).
    const featureOn = HGHandler_field90_vtbl_0x80(handler, 0x2e);

    // @0x2476f5..0x2476ff: if feature is OFF (== 0), invoke handler vtbl *0xa8.
    if (featureOn === 0) {
      HGHandler_vtbl_0xa8(handler);
    }

    // @0x247705: return 0 (path where idx was 0).
    return 0;
  }

  /**
   * `HGCropNode::GetDOD(HGRenderer* r, int slot, HGRect inputRect)` —
   * Helium @0x247790. If slot != 0, returns HGRectNull; else returns
   * intersect(inputRect0, this->rect). Full asm:
   *
   *   0x247790: testl %edx, %edx                ; slot != 0 ?
   *   0x247792: je   0x2477a3                   ; ==0 -> proceed
   *   0x247794: leaq _HGRectNull(%rip), %rcx
   *   0x24779b: movq  (%rcx), %rax              ; ret HGRectNull.lo
   *   0x24779e: movq  0x8(%rcx), %rdx           ; ret HGRectNull.hi
   *   0x2477a2: retq
   *   0x2477a3..0x2477b8: r14=r, rdi=r, rsi=this
   *   0x2477b8: callq HGRenderer::GetInput(this, 0)    ; get input node
   *   0x2477bd..0x2477c3: HGRenderer::GetDOD(inputNode) ; get its DOD
   *   0x2477c8: movq 0x1a0(%rbx), %r8           ; rect.lo
   *   0x2477cf: movq 0x1a8(%rbx), %rcx          ; rect.hi
   *   0x2477e3: jmp _HGRectIntersection         ; tail-call intersect
   *
   * Note: HGCropNode::GetDOD IGNORES the `inputRect` argument the caller
   * passed in and instead re-fetches the DOD by asking the renderer for
   * its input at slot 0 and DODing that. The `inputRect` param is passed
   * through the arg-registers but never read.
   */
  GetDOD(renderer: HGRendererApi, slot: number, _inputRect: HGRect): HGRect {
    // @0x247790..0x2477a2: slot!=0 -> return HGRectNull (copy).
    if ((slot | 0) !== 0) return { ...HGRectNull };

    // @0x2477b8: input node = renderer.GetInput(this, 0)
    const inputNode = renderer.GetInput(this, 0);
    // @0x2477c3: DOD of that input in the renderer's frame. Asm does NOT
    // null-check inputNode before passing it in — mirror that exactly.
    const inputDod = renderer.GetDOD(inputNode);

    // @0x2477e3: tail-jmp HGRectIntersection(inputDod, this.rect).
    return HGRectIntersection(inputDod, this.rect);
  }

  /**
   * `HGCropNode::GetOutput(HGRenderer* r)` — Helium @0x2477f0. If the
   * intersection of the input's DOD with this.rect exactly equals the
   * input's DOD (i.e. the crop is a no-op for this input), short-circuits
   * by tagging the child through vtable slot *0x88 and returns the child.
   * Otherwise returns `this`.
   *
   * Full asm:
   *   0x2477fb..0x247809: rbx=this; r15=renderer; input = r->GetInput(this, 0)
   *   0x24780e: r14 = input
   *   0x247817: dodOfInput = r->GetDOD(input)   ; -> (rax=lo, rdx=hi)
   *   0x24781c..0x247822: r15=lo, r12=hi
   *   0x247822..0x247829: rdx=rect.lo, rcx=rect.hi
   *   0x247836: intersect = HGRectIntersection(dodOfInput, rect)
   *   0x24783b..0x24783e: if input==null -> return this
   *   0x24784c: HGRectIsEqual(dodOfInput, intersect)
   *   0x247851..0x247853: if !equal -> return this
   *   0x247855..0x247865: input->vtbl[0x88](input, -1, 0x20)
   *   0x24786b: rbx = input                    ; return input instead of this
   *   0x24786e: return rbx
   */
  GetOutput(renderer: HGRendererApi): HGNode {
    // @0x247809: input = renderer.GetInput(this, 0)
    const input = renderer.GetInput(this, 0);
    // @0x247817: dodOfInput = renderer.GetDOD(input). C++ passes even null
    // through unchecked (like GetDOD does above); mirror exactly.
    const dodOfInput = renderer.GetDOD(input);
    // @0x247836: intersect(dodOfInput, this.rect)
    const intersect = HGRectIntersection(dodOfInput, this.rect);

    // @0x24783b..0x24783e: null-input guard AFTER the two vcalls (matches asm).
    if (input === null) return this;

    // @0x24784c..0x247853: only short-circuit when crop is a no-op.
    if (!HGRectIsEqual(dodOfInput, intersect)) return this;

    // @0x247855..0x247865: input->vtbl[0x88](input, 0xffffffff, 0x20).
    // Dispatch is on the SUBCLASS vtable of the input HGNode.
    HGNode_vtbl_0x88(input, 0xffffffff | 0, 0x20);

    // @0x24786b..0x24786e: return the input directly.
    return input;
  }

  /**
   * `HGCropNode::RenderPageMetal(HGPage* page)` — Helium @0x247880.
   * Short-circuits by returning the child HGPage at page+0xa8 when a
   * pile of conditions all hold; otherwise chains to
   * HGNode::RenderPageMetal(page). Full asm:
   *
   *   0x24788b..0x247892: save rbx=page, r14=this
   *   0x247895..0x24789f: this->vtbl[0xa8](this, 0x17, 0)  ; query
   *   0x2478a5: r15d = eax                     ; save query result
   *   0x2478a8..0x2478b2: HGPagePullMetalTexturesGuard g(this, page)  [stack RAII]
   *   0x2478b7: r_ptr = page+0xa8 (a child HGPage or null)
   *   0x2478be..0x2478c1: if child==null -> fallback path @0x247918
   *
   *   0x2478c3: r12 = this->renderPageStrategy (this+0x10, u32)
   *   0x2478c7..0x2478d7: HGRectIsEqual(child->rect (child+0x14..0x24),
   *                                     page->rect  (page +0x10..0x20))
   *   0x2478dc..0x2478de: if rects differ -> fallback
   *   0x2478e0..0x2478e7: if !(renderPageStrategy & 0x1000) -> skip child-bit0 test
   *   0x2478e9..0x2478f4: else if !(child->byte@0xc & 1)     -> fallback
   *   0x2478f6..0x2478fb: if page+0x8 != 0                   -> fallback
   *   0x2478fd..0x247900: if r15d != 0                       -> fallback
   *
   *   0x247902..0x24790c: child = page+0xa8; child->vtbl[0x10](child)
   *   0x24790f: page = child                   ; result = child page
   *   0x247916: jmp scope-exit
   *
   *   0x247918..0x247923: fallback: page = HGNode::RenderPageMetal(this, page)
   *
   *   0x247926..0x24792a: ~HGPagePullMetalTexturesGuard()
   *   0x24792f..0x24793e: return page
   *
   * Design: for a source page whose child fills the same rect, no
   * blend-blitter is required (page+0x8 == null indicates no queued
   * blitter, r15d==0 indicates the vtable query greenlit passthrough),
   * so we skip the render entirely by handing back the child page.
   * Otherwise fall through to the default (base) render.
   */
  RenderPageMetal(page: HGPage): HGPage {
    // @0x247895..0x24789f: this->vtbl[0xa8](this, 0x17, 0). Slot 0xa8 is
    // an inherited HGNode slot — FRONTIER (HGNode.ts vtable map does not
    // enumerate 0xa8 yet). Cite address; use a throw-stub name.
    const queryResult = HGNode_vtbl_0xa8_query(this, 0x17, 0);

    // @0x2478ac..0x2478b2: stack RAII guard.
    const guard = HGPagePullMetalTexturesGuard_ctor(this, page);
    try {
      // @0x2478b7..0x2478c1: child = page.field_a8 (may be null).
      const child = HGPage_getChildAt_0xa8(page);
      if (child === null) return HGNode_RenderPageMetal_base(this, page);

      // @0x2478c3: renderPageStrategy is HGNode field @0x10.
      const rps = this.renderPageStrategy | 0;

      // @0x2478c7..0x2478d7: rect-equality of child.rect vs page.rect.
      const childRect = HGPage_readRect_at_0x14(child);
      const pageRect = HGPage_readRect_at_0x10(page);
      if (!HGRectIsEqual(childRect, pageRect)) {
        return HGNode_RenderPageMetal_base(this, page);
      }

      // @0x2478e0..0x2478f4: gate on strategy bit 0x1000 + child.byte@0xc bit0.
      if ((rps & 0x1000) !== 0) {
        // must ALSO check the child's byte@0xc bit0.
        if (!HGPage_child_byte_c_bit0(child)) {
          return HGNode_RenderPageMetal_base(this, page);
        }
      }

      // @0x2478f6..0x2478fb: gate on page.field_8 == null.
      if (HGPage_field_8(page) !== null) {
        return HGNode_RenderPageMetal_base(this, page);
      }

      // @0x2478fd..0x247900: gate on queryResult == 0.
      if ((queryResult | 0) !== 0) {
        return HGNode_RenderPageMetal_base(this, page);
      }

      // @0x247902..0x24790f: retain child, return it.
      HGPage_child_incRef(child);
      return child;
    } finally {
      // @0x247926: ~HGPagePullMetalTexturesGuard()
      guard.dispose();
    }
  }
}

// ============================================================================
// FRONTIER stubs — every one cites the exact call-site @0xADDR it defers.
// These MUST throw on invocation. They are named after the resolved-callee
// signature or the vtable slot to make review trivial.
// ============================================================================

/**
 * `HGHandler::TexCoord(int, int, int, double const*)` — Ozone symbol
 * `__ZN9HGHandler8TexCoordEiiiPKd` (exported member fn). Called by
 * HGCropNode at:
 *   - Bind        @0x24772c   with (h, 1, 0, 0, null)
 *   - BindTexture @0x2476db   with (h, 0, 0, 0, null)
 * The fifth arg is `const double*` (pointer to double array, typed as
 * PKd in the mangling). FRONTIER — HGHandler.ts does not yet expose
 * this method; its body is undecoded.
 */
function HGHandler_TexCoord(
  _h: HGHandler,
  _a: number,
  _b: number,
  _c: number,
  _pd: Float64Array | null,
): void {
  throw new Error(
    "HGHandler::TexCoord(int, int, int, double const*) not yet transcribed " +
      "@Ozone (__ZN9HGHandler8TexCoordEiiiPKd). Call sites: " +
      "HGCropNode::Bind @0x24772c, HGCropNode::BindTexture @0x2476db.",
  );
}

/**
 * `HGNode::ClearBits()` — Helium @0x11f6b0. Not yet transcribed
 * (HGNode.ts references it as a frontier). SetParameter @0x247684
 * calls it after mutating the rect to invalidate cached graph state.
 */
function HGNode_ClearBits(_node: HGNode): void {
  throw new Error(
    "HGNode::ClearBits() not yet transcribed @Helium 0x11f6b0 " +
      "(call site: HGCropNode::SetParameter @0x247684; also referenced from " +
      "HGNode.ts SetInput frontier).",
  );
}

/**
 * `HGNode` vtable slot *0x120 — inherited slot invoked by Bind @0x247769.
 * Not yet decoded (HGNode.ts's vtable map stops around 0x80). Role
 * inferred from call context: after uploading rect corners to handler
 * slot 0, this vcall is presumed to bind the base node's own
 * parameters/textures to the handler (so the crop shader sees them).
 */
function HGNode_vtbl_0x120(_node: HGNode): void {
  throw new Error(
    "HGNode vtable slot *0x120 not yet transcribed @Helium " +
      "(call site: HGCropNode::Bind @0x247769). HGNode.ts's vtable map " +
      "does not enumerate this offset yet.",
  );
}

/**
 * `HGNode` vtable slot *0x88 — invoked by GetOutput @0x247865 on the
 * INPUT node with (this=input, -1, 0x20). The dispatch is on the
 * subclass vtable of whatever HGNode is at that slot, so the callee
 * depends on graph topology. HGNode.ts's vtable map does not currently
 * enumerate *0x88 (its map stops at *0x80 = GetInput).
 */
function HGNode_vtbl_0x88(_node: HGNode, _a: number, _b: number): void {
  throw new Error(
    "HGNode vtable slot *0x88 not yet transcribed @Helium " +
      "(call site: HGCropNode::GetOutput @0x247865, args (this=input, -1, 0x20)).",
  );
}

/**
 * `HGNode` vtable slot *0xa8 — invoked by RenderPageMetal @0x24789f on
 * `this` with args (0x17, 0). Returns a u32 that gates the passthrough
 * short-circuit. HGNode.ts's vtable map does not currently enumerate
 * this offset. Likely a "query capability by feature-id" hook.
 */
function HGNode_vtbl_0xa8_query(_node: HGNode, _feature: number, _flag: number): number {
  throw new Error(
    "HGNode vtable slot *0xa8 (query) not yet transcribed @Helium " +
      "(call site: HGCropNode::RenderPageMetal @0x24789f, args (0x17, 0)).",
  );
}

/**
 * `HGHandler` vtable slot *0x30 — invoked by BindTexture @0x2476cc
 * with args (h, 0, 0). HGHandler.ts's SetFilter uses this same slot
 * *0x30, so this may be the same "set filter" hook re-fired with
 * (0, 0) to reset filter state before rebinding.
 */
function HGHandler_vtbl_0x30(_h: HGHandler, _a: number, _b: number): void {
  throw new Error(
    "HGHandler vtable slot *0x30 not yet transcribed @Ozone " +
      "(call site: HGCropNode::BindTexture @0x2476cc, args (0, 0). " +
      "HGHandler.ts docs indicate this slot is the SetFilter hook.",
  );
}

/**
 * `HGHandler` vtable slot *0x48 — invoked by BindTexture @0x2476bf
 * with args (h, 0, 0). Role: reset a related handler binding slot.
 * FRONTIER — HGHandler.ts does not enumerate this vtable slot.
 */
function HGHandler_vtbl_0x48(_h: HGHandler, _a: number, _b: number): void {
  throw new Error(
    "HGHandler vtable slot *0x48 not yet transcribed @Ozone " +
      "(call site: HGCropNode::BindTexture @0x2476bf, args (0, 0)).",
  );
}

/**
 * `HGHandler` vtable slot *0x88 — invoked by Bind @0x24775d (slot=0) and
 * @0x247783 (slot=1) to upload a float4 tex-coord/param quad. Signature
 * inferred from asm: (int slot, f32 x, f32 y, f32 z, f32 w). FRONTIER.
 */
function HGHandler_vtbl_uploadFloat4(
  _h: HGHandler,
  _slot: number,
  _x: number,
  _y: number,
  _z: number,
  _w: number,
): void {
  throw new Error(
    "HGHandler vtable slot *0x88 (float4 upload) not yet transcribed @Ozone " +
      "(call sites: HGCropNode::Bind @0x24775d and @0x247783; " +
      "signature (int slot, f32, f32, f32, f32)).",
  );
}

/**
 * `HGHandler` vtable slot *0xa8 — invoked by BindTexture @0x2476ff
 * (final action when the field_90 feature-0x2e query returns 0).
 * FRONTIER — role/signature undecoded.
 */
function HGHandler_vtbl_0xa8(_h: HGHandler): void {
  throw new Error(
    "HGHandler vtable slot *0xa8 not yet transcribed @Ozone " +
      "(call site: HGCropNode::BindTexture @0x2476ff, invoked when " +
      "the handler.field_90 feature-0x2e query returns 0).",
  );
}

/**
 * `HGHandler.field_90` vtable slot *0x80 — invoked by BindTexture
 * @0x2476ef with (field_90, 0x2e). Returns u32; 0 means "feature 0x2e
 * is absent, take the trailing vtbl *0xa8 branch". FRONTIER — field_90's
 * class is not yet decoded.
 */
function HGHandler_field90_vtbl_0x80(_h: HGHandler, _featureId: number): number {
  throw new Error(
    "HGHandler.field_90 vtable slot *0x80 not yet transcribed @Ozone " +
      "(call site: HGCropNode::BindTexture @0x2476ef, args (0x2e)). " +
      "Owner class of field_90 is a FRONTIER.",
  );
}

/**
 * `HGPage` accessor: field @0x8 — a "queued blitter/next" pointer
 * inspected by RenderPageMetal @0x2478f6. Non-null → fallback branch.
 */
function HGPage_field_8(_page: HGPage): unknown | null {
  throw new Error(
    "HGPage field @0x8 accessor not yet transcribed @Helium " +
      "(call site: HGCropNode::RenderPageMetal @0x2478f6). Semantics: " +
      "'has queued blitter' / 'chained next page' — non-null forces fallback.",
  );
}

/**
 * `HGPage` accessor: field @0xa8 — child HGPage pointer. Read by
 * RenderPageMetal @0x2478b7.
 */
function HGPage_getChildAt_0xa8(_page: HGPage): HGPage | null {
  throw new Error(
    "HGPage field @0xa8 (child page) accessor not yet transcribed @Helium " +
      "(call site: HGCropNode::RenderPageMetal @0x2478b7).",
  );
}

/**
 * `HGPage` accessor: HGRect at @0x10..0x1f. Read by RenderPageMetal
 * @0x2478cf-0x2478d3 (rdx=page.hi, rcx=page.mid — two 8-byte movs).
 */
function HGPage_readRect_at_0x10(_page: HGPage): HGRect {
  throw new Error(
    "HGPage rect@0x10 accessor not yet transcribed @Helium " +
      "(call site: HGCropNode::RenderPageMetal @0x2478cf).",
  );
}

/**
 * `HGPage` accessor: HGRect at @0x14..0x23. Read by RenderPageMetal
 * @0x2478c7-0x2478cb from the child HGPage. Note the unusual +0x14
 * offset (unaligned relative to the +0x10 field on the parent HGPage) —
 * indicates a different class or nested sub-struct on the child.
 */
function HGPage_readRect_at_0x14(_page: HGPage): HGRect {
  throw new Error(
    "HGPage rect@0x14 accessor not yet transcribed @Helium " +
      "(call site: HGCropNode::RenderPageMetal @0x2478c7, on the child HGPage).",
  );
}

/**
 * Child HGPage byte @0xc bit 0 — tested by RenderPageMetal @0x2478f0
 * with `testb $0x1, 0xc(%rax)` (where %rax = page+0xa8).
 */
function HGPage_child_byte_c_bit0(_child: HGPage): boolean {
  throw new Error(
    "HGPage byte@0xc bit0 accessor not yet transcribed @Helium " +
      "(call site: HGCropNode::RenderPageMetal @0x2478f0).",
  );
}

/**
 * `HGPage` vtable slot *0x10 — invoked on the child at @0x24790c to
 * retain/mark the child before returning it up-stack.
 */
function HGPage_child_incRef(_child: HGPage): void {
  throw new Error(
    "HGPage vtable slot *0x10 not yet transcribed @Helium " +
      "(call site: HGCropNode::RenderPageMetal @0x24790c).",
  );
}

/**
 * `HGPagePullMetalTexturesGuard::HGPagePullMetalTexturesGuard(HGNode*, HGPage*)`
 * — Helium (mangled __ZN28HGPagePullMetalTexturesGuardC1EP6HGNodeP6HGPage).
 * FRONTIER — RAII ctor/dtor bodies not yet decoded.
 */
function HGPagePullMetalTexturesGuard_ctor(
  _node: HGNode,
  _page: HGPage,
): HGPagePullMetalTexturesGuard {
  throw new Error(
    "HGPagePullMetalTexturesGuard::HGPagePullMetalTexturesGuard(HGNode*, HGPage*) " +
      "not yet transcribed @Helium (call site RenderPageMetal @0x2478b2).",
  );
}

/**
 * `HGNode::RenderPageMetal(HGPage*)` — base-class impl at @Helium
 * (__ZN6HGNode15RenderPageMetalEP6HGPage). Not yet exposed on HGNode.ts.
 */
function HGNode_RenderPageMetal_base(_this: HGNode, _page: HGPage): HGPage {
  throw new Error(
    "HGNode::RenderPageMetal(HGPage*) base implementation not yet transcribed " +
      "@Helium (call site: HGCropNode::RenderPageMetal @0x24791e).",
  );
}

// ============================================================================
// Embedded shader source — verbatim string from GetProgram's literal pool
// @Helium 0x92993c (355 bytes; MD5=71c0cb25:36879384:725a4797:f8967426).
// This is the ONLY resource GetProgram hands out; storing it here as a
// TS constant keeps the port self-contained and lets a future Metal
// compiler shim consume it.
// ============================================================================
export const HGCROPNODE_METAL_FRAGMENT_SHADER: string =
  "//Metal1.0     \n//LEN=0000000355\nfragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n" +
  "    const constant float4* hg_Params [[ buffer(0) ]], \n" +
  "    texture2d< float > hg_Texture0 [[ texture(0) ]], \n" +
  "    sampler hg_Sampler0 [[ sampler(0) ]])\n{\n" +
  "    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);\n" +
  "    float4 r0, r1;\n" +
  "    FragmentOut output;\n\n" +
  "    r0 = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy);\n" +
  "    r1.xy = frag._texCoord1.xy - hg_Params[0].xy;\n" +
  "    r1.zw = hg_Params[0].zw - frag._texCoord1.xy;\n" +
  "    r1 = float4(r1 < c0.xxxx);\n" +
  "    r1 = float4(dot(r1, 1.00000f));\n" +
  "    r1 = float4(r1 <= c0.xxxx);\n" +
  "    r0 = r0*r1;\n" +
  "    output.color0 = r0*hg_Params[1];\n" +
  "    return output;\n}\n" +
  "//MD5=71c0cb25:36879384:725a4797:f8967426\n" +
  "//SIG=00000000:00000001:00000001:00000000:0001:0002:0002:0000:0000:0000:0006:0000:0002:01:0:1:0\n";

