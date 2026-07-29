// raw-port/src/render/HGGradient.ts
//
// FCP `HGGradient` — Helium render-graph node whose job is to hold a
// user-facing "gradient mode" (Radial / Linear / None) and a small
// 6-stop x 4-float (RGBA) color-stop palette. At render time it forwards
// its palette + its single input into a resolved child gradient node
// stored at this+0x198 (an HGGradientRadial, HGGradientLinear, or a bare
// HGNode fallback). Extends HGNode.
//
// Symbols decoded here (Helium, x86_64 slice; VAs are the unadjusted VM
// addresses reported by otool -tV / `nm -n`; for the x86_64 thin slice
// the VA equals the file offset — no 0x4000 header adjustment):
//   0x179390  HGGradient::HGGradient()                                 [C2 base ctor]
//   0x1794b0  HGGradient::HGGradient()                                 [C1 complete ctor — tail-jmp to C2]
//   0x1794c0  HGGradient::~HGGradient()                                [D2 base dtor]
//   0x179500  HGGradient::~HGGradient()                                [D1 complete dtor — same body as D2]
//   0x179540  HGGradient::~HGGradient()                                [D0 deleting dtor: D2; then HGObject::operator delete]
//   0x179590  HGGradient::SetGradientMode(HGGradient::GradientMode)
//   0x179610  HGGradient::_createGradientNode(HGGradient::GradientMode)
//   0x179690  HGGradient::GetOutput(HGRenderer*)
//   0x179800  HGGradient::SetParameter(int, float, float, float, float)
//
// Vtable @Helium 0xa21ee0 (installed-ptr 0xa21ef0 = vtable + 0x10, past
// the {offset-to-top, RTTI-ptr} header, at the first virtual-fn slot):
//    *0x00 = 0x179500  HGGradient::~HGGradient()      [D1 complete dtor]
//    *0x08 = 0x179540  HGGradient::~HGGradient()      [D0 deleting dtor]
//    *0x60 = 0x179800  HGGradient::SetParameter(...)  [override of HGNode's slot]
//   (all other slots inherited unchanged from HGNode's vtable @0xa1d7c8;
//    resolved via `python3 raw-port/army/tools/vtable.py Helium HGGradient`.)
//   Both C2 @0x1793a9 (leaq 0x8a8b47(%rip)) and D0 @0x179550 (leaq 0x8a89a0(%rip))
//   compute installed-ptr = 0x1793a9+0x8a8b47 = 0x179550+0x8a89a0 = 0xa21ef0.
//
// STRUCT LAYOUT (recovered from HGGradient::HGGradient() @0x179390 field-by-field):
//   ---- inherited from HGObject (size 0x10) ----
//     0x00 : void*   vtable                (overwritten to 0xa21ef0 in ctor)
//     0x08 : u32     refCount              (set to 1 by HGObject::HGObject())
//     0x0c : u32     flags/state field
//   ---- inherited from HGNode (fields 0x10..0x197 come from HGNode::HGNode() @0x11baf0) ----
//   ---- HGGradient-specific fields (start at 0x198) ----
//     0x198 : HGNode*  childGradientNode   (ctor stores newly-allocated HGNode/HGGradientLinear/HGGradientRadial)
//     0x1a0 : u32      gradientMode        (SetGradientMode writes esi here; enum GradientMode)
//     0x1a4 : float[4] stop[0].rgba        (defaulted by ctor to {0,0,0,1})
//     0x1b4 : float[4] stop[1].rgba
//     0x1c4 : float[4] stop[2].rgba
//     0x1d4 : float[4] stop[3].rgba        (ctor writes 1.0f (0x3f800000) to +0x1d4 = stop[3].r)
//     0x1e4 : float[4] stop[4].rgba
//     0x1e8 : ...                          (ctor writes 1.0f to +0x1e8 = stop[4].g)
//     0x1f4 : float[4] stop[5].rgba
//     0x200 : ...                          (ctor writes 1.0f to +0x200 = stop[5].b)
//   The 6 stops span [0x1a4 .. 0x203] (stop_i base = 0x1a4 + i*0x10, four consecutive floats).
//   NOTE: HGGradient's ctor writes THREE 1.0f markers (stop[3].r, stop[4].g, stop[5].b) after
//         xorps-zeroing the whole 6x4-float palette in six 16-byte movaps stores. These are the
//         only nonzero literals baked into the ctor and are transcribed verbatim below.
//
// The ctor allocates an HGNode child at this+0x198, wires its refcount and vtable via
// HGNode::HGNode(), and then handles a "swap the pre-existing child pointer" branch which is
// dead in the C2 ctor path (this+0x198 was just NULL-initialized at +0x1793ac) but IS the very
// same swap-and-release pattern used by SetGradientMode later — so the ctor emits it as a
// re-usable inline sequence. We transcribe both the initial store and the release-old-child
// branch faithfully.
//
// Every method here is 1:1 with a real Helium symbol; each header comment cites the exact
// @0xADDR that the body ports. All base-class forwards (HGNode::HGNode / ~HGNode / ClearBits),
// the HGObject allocator/free (operator new/delete), the sibling gradient-node ctors
// (HGGradientLinear::HGGradientLinear / HGGradientRadial::HGGradientRadial), and the runtime
// input-fetching HGRenderer::GetInput are surfaced as throwing boundary stubs — this file is a
// faithful in-image transcription of what HGGradient does; it does NOT invent semantics for the
// callees it dispatches into.
// -----------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Boundary stubs — every extern / cross-class callee this file dispatches
// into. Each throws with its exact @0xADDR so a runtime hit is loud, and
// tools/frontier.py can enumerate the remaining ports from these strings.
// ---------------------------------------------------------------------------

/** HGObject::operator new(unsigned long) @0x1a1170 in Helium (extern to this file). */
function HGObject_operator_new(_size: number): unknown {
  throw new Error("HGObject::operator new @0x1a1170 not yet transcribed");
}

/** HGObject::operator delete(void*) @0x1a11d0 in Helium (extern to this file). */
function HGObject_operator_delete(_p: unknown): void {
  throw new Error("HGObject::operator delete @0x1a11d0 not yet transcribed");
}

/** HGNode::HGNode() [C1] @0x11bcc0 in Helium (base-ctor forwarder — extern to this file). */
function HGNode_ctor_C1(_self: HGNode): void {
  throw new Error("HGNode::HGNode() [C1] @0x11bcc0 not yet transcribed");
}

/** HGNode::HGNode() [C2] @0x11baf0 in Helium (base subobject ctor — called by HGGradient C2). */
function HGNode_ctor_C2(_self: HGGradient): void {
  throw new Error("HGNode::HGNode() [C2] @0x11baf0 not yet transcribed");
}

/** HGNode::~HGNode() [D2] @0x11bf20 in Helium (base subobject dtor — called by HGGradient D0/D2). */
function HGNode_dtor_D2(_self: HGGradient): void {
  throw new Error("HGNode::~HGNode() [D2] @0x11bf20 not yet transcribed");
}

/** HGNode::ClearBits() @0x11c890 (no-arg thunk to ClearBits(0xffff)) — called by SetParameter. */
function HGNode_ClearBits(_self: HGGradient): void {
  throw new Error("HGNode::ClearBits() @0x11c890 not yet transcribed");
}

/** HGGradientLinear::HGGradientLinear() [C1] @0x48e0 in Helium (sibling ctor). */
function HGGradientLinear_ctor_C1(_self: HGNode): void {
  throw new Error("HGGradientLinear::HGGradientLinear() [C1] @0x48e0 not yet transcribed");
}

/** HGGradientRadial::HGGradientRadial() [C1] @0x8bdb0 in Helium (sibling ctor). */
function HGGradientRadial_ctor_C1(_self: HGNode): void {
  throw new Error("HGGradientRadial::HGGradientRadial() [C1] @0x8bdb0 not yet transcribed");
}

/** HGRenderer::GetInput(HGNode*, int) @extern — resolved at 0x1796a2 callq site. */
function HGRenderer_GetInput(_renderer: HGRenderer, _self: HGGradient, _idx: number): HGNode {
  throw new Error("HGRenderer::GetInput @<call from HGGradient::GetOutput+0x12 = 0x1796a2> not yet transcribed");
}

/** __Unwind_Resume — libunwind stub called in ctor/dtor cleanup landing pads. */
function Unwind_Resume(): never {
  throw new Error("__Unwind_Resume @0x3c4e02 (stub) not yet transcribed");
}

// ---------------------------------------------------------------------------
// Boundary types — HGNode / HGObject / HGRenderer are ported in their own
// files; here we only need typed references (the "vtable slot at *0x18 =
// HGObject::Release" is invoked through the child-node vtable pointer).
// ---------------------------------------------------------------------------

/** Minimal HGNode vtable shape used from this file (child-node dispatch). */
export interface HGNodeVTable {
  /** *0x18 : HGObject::Release() @0x1a0f30 — decref child; free if zero. */
  release(self: HGNode): void;
  /** *0x60 : HGNode::SetParameter(int,float,float,float,float) @0x11cab0 — child-node dispatch. */
  setParameter(self: HGNode, idx: number, a: number, b: number, c: number, d: number): number;
  /** *0x78 : HGNode::SetInput(int, HGNode*) @0x11c5f0 — install input into child. */
  setInput(self: HGNode, idx: number, src: HGNode): void;
}

export interface HGNode {
  vtable: HGNodeVTable;
  // ... other HGNode fields ported in HGNode.ts
}

/** HGRenderer forward-declaration (this file only needs it as an opaque handle). */
export interface HGRenderer { readonly __brand: "HGRenderer" }

// ---------------------------------------------------------------------------
// HGGradient — the class.
// ---------------------------------------------------------------------------

/**
 * HGGradient::GradientMode — the classifier stored at this+0x1a0 and consumed
 * by _createGradientNode(). Discovered from the switch in _createGradientNode
 * @0x179610 (compares esi to 0/1 and defaults to a base HGNode otherwise).
 */
export const enum GradientMode {
  /** esi == 0 - allocate HGGradientLinear (0x1b0 bytes). */
  Linear = 0,
  /** esi == 1 - allocate HGGradientRadial (0x1b0 bytes). */
  Radial = 1,
  /** all other values - allocate bare HGNode (0x1a0 bytes). */
  None = 2,
}

/**
 * HGGradient — one-per-instance object. Field layout matches the FCP binary
 * exactly (offsets recovered from the ctor / accessors — see file header).
 */
export class HGGradient {
  /** vtable slot (offset 0x00). Ctor overwrites HGNode's vtable pointer with 0xa21ef0. */
  public vtable: unknown = null;
  /** HGObject base fields (offsets 0x08, 0x0c). Populated by HGObject::HGObject inside HGNode::HGNode. */
  public refCount = 0;
  public objectFlags = 0;
  /** HGNode base fields (offsets 0x10..0x197). Populated by HGNode::HGNode() @0x11baf0. */
  public hgnodeFields: unknown = null;

  /** offset 0x198 — resolved child gradient node (HGGradientLinear / Radial / HGNode). */
  public childGradientNode: HGNode | null = null;
  /** offset 0x1a0 — the GradientMode value written by SetGradientMode. */
  public gradientMode: GradientMode = 0 as GradientMode;
  /** offset 0x1a4..0x203 — six (rgba) color stops. Layout: stop_i = base 0x1a4 + i*0x10. */
  public stops: Float32Array = new Float32Array(6 * 4);

  /**
   * HGGradient::HGGradient() @0x179390  [C2 base ctor]
   *   1) callq HGNode::HGNode()                                @0x11baf0
   *   2) install vtable pointer 0xa21ef0 at this+0x00           (leaq 0x8a8b47(%rip))
   *   3) zero this+0x198 (childGradientNode)                    (movq $0, 0x198)
   *   4) allocate a bare HGNode (0x1a0 bytes) via HGObject::operator new @0x1a1170
   *   5) HGNode::HGNode() [C1] on the new child                 @0x11bcc0
   *   6) swap-old-child sequence at this+0x198:
   *        if (old != new) - if (old) old-\>vtable-\>release(old); this+0x198 = new;
   *        else            - if (new) new-\>vtable-\>release(new);
   *      (In the C2 path old == NULL — first branch of `cmpq %r14, %rdi` at 0x1793d3.)
   *   7) six xorps-zero-then-movaps stores clear stops[0..5] (offsets 0x1a0..0x1f0
   *      in 16-byte chunks; note: this includes and overwrites the field at 0x1a0
   *      which SetGradientMode later re-fills with the mode).
   *   8) write three baked constants: stops[3].r=1.0 @0x1d4, stops[4].g=1.0 @0x1e8,
   *      stops[5].b=1.0 @0x200 (all $0x3f800000 = Math.fround(1.0)).
   *   Cleanup EH landing pads @0x1793ce / 0x179450 / 0x179458 / 0x179466 invoke
   *   HGObject::operator delete / clang_call_terminate / Unwind_Resume; those are
   *   already stubbed above.
   */
  constructor() {
    // (1) inherited base subobject
    HGNode_ctor_C2(this);
    // (2) install HGGradient vtable
    this.vtable = 0xa21ef0;
    // (3) NULL-init the child slot before the swap
    this.childGradientNode = null;
    // (4) allocate the child HGNode
    const child = HGObject_operator_new(0x1a0) as HGNode;
    // (5) run its ctor
    HGNode_ctor_C1(child);
    // (6) swap-old-child sequence (movq 0x198(%rbx),%rdi; cmpq %r14,%rdi ...):
    //   In C2 path 'old' (this.childGradientNode) is NULL because of (3), so the
    //   `if (old != new)` branch is taken, no release is called, and this+0x198 = new.
    const oldChild = this.childGradientNode as HGNode | null;
    if (oldChild !== child) {
      if (oldChild !== null) {
        (oldChild.vtable as HGNodeVTable).release(oldChild);
      }
      this.childGradientNode = child;
    } else {
      // Symmetric branch preserved verbatim from the ctor's `je 0x1793ec` path.
      if (child !== null) {
        (child.vtable as HGNodeVTable).release(child);
      }
    }
    // (7) xorps %xmm0,%xmm0 ; six movaps zeroing 0x1a0..0x1f0 (six 16-byte stores).
    //     stops palette is 6 * 4 f32 starting at 0x1a4; the ctor's zero-range at
    //     0x1a0..0x1af overlaps the gradientMode field at 0x1a0 — this is
    //     transcribed as clearing stops + resetting gradientMode to 0 in one pass.
    this.gradientMode = 0 as GradientMode;
    for (let i = 0; i < this.stops.length; i++) this.stops[i] = 0;
    // (8) three baked 1.0f constants — Math.fround for the 32-bit store width.
    //     stops[3].r @ +0x1d4 = 0x1a4 + 3*0x10 + 0.
    this.stops[3 * 4 + 0] = Math.fround(1);
    //     stops[4].g @ +0x1e8 = 0x1a4 + 4*0x10 + 4  (+0x4 into stop 4).
    this.stops[4 * 4 + 1] = Math.fround(1);
    //     stops[5].b @ +0x200 = 0x1a4 + 5*0x10 + 8  (+0x8 into stop 5).
    this.stops[5 * 4 + 2] = Math.fround(1);
  }

  /**
   * HGGradient::~HGGradient() @0x179540  [D0 deleting dtor]
   *   1) install vtable pointer 0xa21ef0 (defensive — insn @0x179549 leaq 0x8a89a0(%rip))
   *   2) release child at this+0x198 through its vtable *0x18 (HGObject::Release)
   *   3) HGNode::~HGNode() [D2] on the base subobject
   *   4) HGObject::operator delete(this)
   * Cleanup EH landing pad @0x17957b tail-calls clang_call_terminate — stubbed above.
   * D2 @0x1794c0 and D1 @0x179500 share the (1)+(2)+(3) body but skip (4).
   */
  public destroy(): void {
    this.vtable = 0xa21ef0;
    const child = this.childGradientNode;
    if (child !== null) {
      (child.vtable as HGNodeVTable).release(child);
    }
    HGNode_dtor_D2(this);
    HGObject_operator_delete(this);
  }

  /**
   * HGGradient::SetGradientMode(HGGradient::GradientMode) @0x179590
   *   1) this+0x1a0 = esi                                                   (movl %esi,0x1a0(%rdi))
   *   2) newChild = _createGradientNode(mode)                               (callq @0x1795a0)
   *   3) same swap-old-child sequence used by the ctor:
   *        if (old != newChild) - if (old) old-\>release(old); this+0x198 = newChild;
   *        else                 - if (newChild) newChild-\>release(newChild);
   *   No return value.
   */
  public SetGradientMode(mode: GradientMode): void {
    // (1) store the mode BEFORE creating the child — matches the asm ordering exactly
    //     (movl %esi,0x1a0(%rdi) at 0x17959a happens before the callq at 0x1795a0),
    //     which matters because _createGradientNode does NOT read this+0x1a0.
    this.gradientMode = mode;
    // (2) allocate the concrete child gradient node
    const newChild = this._createGradientNode(mode);
    // (3) install-or-release swap
    const oldChild = this.childGradientNode;
    if (oldChild !== newChild) {
      if (oldChild !== null) {
        (oldChild.vtable as HGNodeVTable).release(oldChild);
      }
      this.childGradientNode = newChild;
    } else {
      if (newChild !== null) {
        (newChild.vtable as HGNodeVTable).release(newChild);
      }
    }
  }

  /**
   * HGGradient::_createGradientNode(HGGradient::GradientMode) @0x179610
   *
   *   switch (esi) {                                    (cmpl $1 ; testl %esi,%esi)
   *     case 1:  // Radial
   *       p = HGObject::operator new(0x1b0);
   *       HGGradientRadial::HGGradientRadial()(p);      // @0x8bdb0
   *       return p;
   *     case 0:  // Linear
   *       p = HGObject::operator new(0x1b0);
   *       HGGradientLinear::HGGradientLinear()(p);      // @0x48e0
   *       return p;
   *     default: // any other value — fallback to bare HGNode
   *       p = HGObject::operator new(0x1a0);
   *       HGNode::HGNode() [C1](p);                     // @0x11bcc0
   *       return p;
   *   }
   *
   *   The three sibling ctors + operator new are boundary-stubbed; if an EH is
   *   thrown by a child ctor the caller falls through to the landing pad @0x17966f
   *   that calls HGObject::operator delete(p) then __Unwind_Resume.
   */
  public _createGradientNode(mode: GradientMode): HGNode {
    if (mode === (1 as GradientMode)) {
      // Radial branch — 0x1b0 bytes.
      const p = HGObject_operator_new(0x1b0) as HGNode;
      try {
        HGGradientRadial_ctor_C1(p);
      } catch (e) {
        HGObject_operator_delete(p);
        Unwind_Resume();
      }
      return p;
    } else if (mode === (0 as GradientMode)) {
      // Linear branch — 0x1b0 bytes.
      const p = HGObject_operator_new(0x1b0) as HGNode;
      try {
        HGGradientLinear_ctor_C1(p);
      } catch (e) {
        HGObject_operator_delete(p);
        Unwind_Resume();
      }
      return p;
    } else {
      // Fallback — bare HGNode, 0x1a0 bytes.
      const p = HGObject_operator_new(0x1a0) as HGNode;
      try {
        HGNode_ctor_C1(p);
      } catch (e) {
        HGObject_operator_delete(p);
        Unwind_Resume();
      }
      return p;
    }
  }

  /**
   * HGGradient::GetOutput(HGRenderer*) @0x179690
   *
   *   HGNode* input = renderer-\>GetInput(this, 0);                (callq @0x1796a2)
   *   HGNode* child = this-\>childGradientNode;                    (movq 0x198(%rbx),%rdi)
   *   for (i = 0..5) {
   *       // 4 SS loads of the 4 rgba floats of stop_i, then:
   *       child-\>vtable-\>setParameter(child, i, r, g, b, a);      (movq (%rdi),%rax ; callq *0x60(%rax))
   *   }
   *   child-\>vtable-\>setInput(child, 0, input);                   (movq (%rdi),%rax ; callq *0x78(%rax))
   *   return this-\>childGradientNode;                              (movq 0x198(%rbx),%rax ; retq)
   *
   *   The six setParameter calls unroll six literal esi values 0..5 in the asm
   *   (no loop) — we transcribe as a fixed for-loop bounded by the constant 6,
   *   which the compiler chose to unroll. The reads happen from single-precision
   *   fields via `movss` so each rgba component is wrapped in Math.fround at the
   *   TS boundary to preserve f32 rounding into the child.
   */
  public GetOutput(renderer: HGRenderer): HGNode | null {
    const input = HGRenderer_GetInput(renderer, this, 0);
    const child = this.childGradientNode;
    if (child === null) {
      // The asm dereferences this+0x198 unconditionally after GetInput. If the
      // child pointer is genuinely NULL the binary would segfault; we surface
      // that as a loud throw rather than silently returning something.
      throw new Error("HGGradient::GetOutput @0x179690 - childGradientNode is null (would segfault in native)");
    }
    const vt = child.vtable as HGNodeVTable;
    for (let i = 0; i < 6; i++) {
      const r = Math.fround(this.stops[i * 4 + 0]);
      const g = Math.fround(this.stops[i * 4 + 1]);
      const b = Math.fround(this.stops[i * 4 + 2]);
      const a = Math.fround(this.stops[i * 4 + 3]);
      vt.setParameter(child, i, r, g, b, a);
    }
    vt.setInput(child, 0, input);
    // The asm re-reads this+0x198 for the return value (movq 0x198(%rbx),%rax)
    // rather than returning the cached `child` local — preserved for parity.
    return this.childGradientNode;
  }

  /**
   * HGGradient::SetParameter(int, float, float, float, float) @0x179800
   *
   *   The asm implements a "if idx >= 6 return -1; else if all 4 components
   *   already match, return 0; else store and call HGNode::ClearBits, return 1"
   *   protocol. The comparisons use ucomiss which is unordered (NaN branches
   *   both jne and jp to the mismatch path) — so any NaN input forces a store.
   *
   *   eax = 0xffffffff (return default: idx out of range)
   *   if ((unsigned)idx \> 5) return -1;                              (cmpl $5,%esi ; ja)
   *   base = this + 0x1a4 + idx*0x10;                                (shlq $4,%rcx ; leaq)
   *   if (base[0] == a && base[1] == b && base[2] == c && base[3] == d)
   *      return 0;                                                    (jnp 0x179871 ; xor eax,eax)
   *   base[0..3] = a, b, c, d;
   *   HGNode::ClearBits();                                            (callq @0x179865)
   *   return 1;
   *
   *   The ucomiss NaN-ordering: use !== (JS !== is NaN-unordered — NaN !== NaN
   *   is true — matching ucomiss+jne+jp taking the mismatch path on any NaN
   *   input in either operand). All comparisons are f32; wrap the incoming
   *   floats + the stored floats in Math.fround so the ==/!== is a true
   *   f32-vs-f32 test (matches the movss/ucomiss encoding).
   */
  public SetParameter(idx: number, a: number, b: number, c: number, d: number): number {
    // (1) unsigned idx bounds check (cmpl $5,%esi ; ja 0x179870).
    if ((idx >>> 0) > 5) return -1 | 0;
    // (2) fetch the 4 floats currently stored at stops[idx].
    const off = idx * 4;
    const s0 = Math.fround(this.stops[off + 0]);
    const s1 = Math.fround(this.stops[off + 1]);
    const s2 = Math.fround(this.stops[off + 2]);
    const s3 = Math.fround(this.stops[off + 3]);
    const fa = Math.fround(a);
    const fb = Math.fround(b);
    const fc = Math.fround(c);
    const fd = Math.fround(d);
    // (3) NaN-ordered inequality — matches ucomiss+jne+jp mismatch semantics.
    //     If ALL FOUR are equal (and none is NaN) we short-circuit with return 0.
    if (s0 === fa && s1 === fb && s2 === fc && s3 === fd) {
      return 0;
    }
    // (4) store the four fresh floats + ClearBits() + return 1.
    this.stops[off + 0] = fa;
    this.stops[off + 1] = fb;
    this.stops[off + 2] = fc;
    this.stops[off + 3] = fd;
    HGNode_ClearBits(this);
    return 1;
  }
}
