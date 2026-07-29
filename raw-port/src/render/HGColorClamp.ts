// raw-port/src/render/HGColorClamp.ts
//
// FCP `HGColorClamp` — a Helium HGNode subclass whose sole job is to hold a
// per-channel `[min, max]` clamp range and forward it into a wrapped
// `HgcColorClamp` compositor node (the "hg" C-shader wrapper) as two
// per-channel float4 parameters.
//
// The class is a thin facade:
//   • It stores the RGBA max at offset 0x1a0 (4 × f32) and the RGBA min at
//     offset 0x1b0 (4 × f32) — mirroring how the actual Metal shader receives
//     `clampMax` (register #0) and `clampMin` (register #1).
//   • On `GetOutput`, it delegates rendering to the inner HgcColorClamp
//     subnode after wiring its SetInput(0) to `this`'s ingress and pushing
//     the (max, min) tuples through the subnode's SetParameter vtable slot.
//
// Symbols decoded here (Helium.framework, x86_64 slice):
//   0x151e70  HGColorClamp::HGColorClamp()             [C2, in-place default ctor]
//   0x151f00  HGColorClamp::HGColorClamp()             [C1, complete-object — same body]
//   0x151f90  HGColorClamp::HGColorClamp(float, float) [C2, in-place]
//   0x152030  HGColorClamp::HGColorClamp(float, float) [C1, complete-object — same body]
//   0x1520d0  HGColorClamp::~HGColorClamp()            [D2, in-place: reinstall vtable →
//                                                        subnode->vtable[0x18](subnode)
//                                                        (i.e. HgcColorClamp::~HgcColorClamp
//                                                        via HGNode D0/D1 slot) → tail-jmp
//                                                        HGNode::~HGNode() @0x11bf20]
//   0x152110  HGColorClamp::~HGColorClamp()            [D1, complete-object — same body as D2]
//   0x152150  HGColorClamp::~HGColorClamp()            [D0, deleting — D2 body then jmp
//                                                        HGObject::operator delete @0x1a0f10]
//   0x152190  HGColorClamp::SetParameter(int, float, float, float, float)
//   0x1521f0  HGColorClamp::SetClampMaxValues(float, float, float, float)
//   0x152220  HGColorClamp::SetClampMinValues(float, float, float, float)
//   0x152250  HGColorClamp::GetOutput(HGRenderer*)
//
// Called-into symbols:
//   HGNode::HGNode()                          @Helium 0x11baf0 (real, imported)
//   HGNode::~HGNode()                         @Helium 0x11bf20 (in unwind path)
//   HGNode::ClearBits()                       @Helium 0x11c890 (thunk → 0xFFFF)
//   HGObject::operator new(0x1a0)             @Helium (extern) — 0x1a0=size of HgcColorClamp
//   HGObject::operator delete(void*)          @Helium (unwind path)
//   HgcColorClamp::HgcColorClamp()            — not yet transcribed
//   virtual *0x60 SetParameter(int,f,f,f,f)   — HGNode vtable slot on subnode
//   virtual *0x78 SetInput(int, HGNode*)      — HGNode vtable slot on subnode
//   virtual *0x80 GetInput(int)               — HGNode vtable slot on this
//
// ── LAYOUT (recovered from ctors + setter offsets) ────────────────────────
// Extends HGNode (0x198 bytes; see HGNode.ts). Own fields:
//     0x198 : HgcColorClamp*  hgcSubnode    (ctor: `new HgcColorClamp`)
//     0x1a0 : f32[4]          clampMax      (ctor 2-arg: broadcast(upper);
//                                             ctor no-arg: {1,1,1,1} from
//                                             literal @0x3c7c40)
//     0x1b0 : f32[4]          clampMin      (ctor 2-arg: broadcast(lower);
//                                             ctor no-arg: {0,0,0,0} via xorps)
//
// ── DECODED CONSTANTS ─────────────────────────────────────────────────────
//   K_ONES_F4 = { 1.0f, 1.0f, 1.0f, 1.0f }   @Helium 0x3c7c40
//     Loaded by the default ctor @0x151f38 via `movaps 0x275d01(%rip),%xmm0`
//     then broadcast-written into 0x1a0. The zero for 0x1b0 comes from
//     `xorps %xmm0,%xmm0` @0x151f46 (no data-constant needed).
//
// ── SEMANTICS ─────────────────────────────────────────────────────────────
// HGColorClamp() (default):
//   1. Chain to `HGNode::HGNode()` @0x11baf0 (rdi=this).
//   2. Install this class's own vtable pointer (leaq 0x8cd79f(%rip); store
//      into (this)) — vtable address elided in TS.
//   3. Allocate 0x1a0 bytes via `HGObject::operator new(0x1a0)`, placement-
//      construct `HgcColorClamp::HgcColorClamp()` (@0x151f2c) into it, and
//      store the pointer at this+0x198.
//   4. clampMax  = { 1.0f, 1.0f, 1.0f, 1.0f }   (from @0x3c7c40)
//      clampMin  = { 0.0f, 0.0f, 0.0f, 0.0f }
//   Unwind path: on ctor throw, `operator delete(hgcSubnode)` +
//   `HGNode::~HGNode()` on this, then `_Unwind_Resume`. Not modeled in TS.
//
// HGColorClamp(float lo, float hi):
//   Same as default ctor for steps 1..3.
//   4. clampMin (0x1b0) = broadcast(lo)   — `shufps $0x0, xmm0, xmm0`
//      clampMax (0x1a0) = broadcast(hi)   — `shufps $0x0, xmm0, xmm0`
//     Verified: xmm0 = arg-1 (via -0x30 spill), xmm1 = arg-2 (via -0x40 spill),
//     and it is xmm0 that lands in 0x1b0 (min).
//
// SetClampMaxValues(a, b, c, d):
//   Direct writes: 0x1a0 = a, 0x1a4 = b, 0x1a8 = c, 0x1ac = d. No ClearBits().
//
// SetClampMinValues(a, b, c, d):
//   Direct writes: 0x1b0 = a, 0x1b4 = b, 0x1b8 = c, 0x1bc = d. No ClearBits().
//
// SetParameter(idx, a, b, c, d):
//   Two-branch dispatch: idx==0 writes {a,b,c,d} into clampMax (0x1a0..0x1ac);
//   idx==1 writes into clampMin (0x1b0..0x1bc); anything else returns
//   0xFFFFFFFF (-1) without writing anything (via the `movl $-1,%eax` +
//   `cmpl $0x1,%esi ; jne` short-circuit @0x152194..0x1521a3). On writes,
//   calls `HGNode::ClearBits()` after storing, then returns 1.
//
// GetOutput(HGRenderer*):
//   NOTE: unlike HGBilateralFilter, this method does NOT touch the passed-in
//   HGRenderer — the argument's slot in rsi is overwritten before use. The
//   input is fetched via `this->virtual GetInput(0)` (vtable slot *0x80),
//   which resolves at runtime to the HGNode::GetInput implementation.
//
//   1. saved = this->hgcSubnode                    (r14 = @0x198)
//   2. input = this->GetInput(0)                   via vtable *0x80(this)
//   3. saved->SetInput(0, input)                   via vtable *0x78(saved)
//   4. saved->SetParameter(0, clampMax[0..3])      via vtable *0x60(saved)
//   5. saved->SetParameter(1, clampMin[0..3])      via vtable *0x60(saved)
//   6. return this->hgcSubnode                     (rax = @0x198)

import { HGNode } from "./HGNode";

/**
 * `HgcColorClamp` — the compositor sibling class (the "hg-c" C-shader
 * wrapper for the ColorClamp Metal kernel). Ctor @Helium 0x152067/0x151f2c
 * (`__ZN13HgcColorClampC1Ev`) not yet transcribed.
 *
 * We interact with it only through its three HGNode-vtable slots and its
 * 0x1a0-byte size. Represented here as a class carrying explicit throw-stubs
 * for the three slot methods so gaps are visible.
 */
export class HgcColorClamp {
  /**
   * vtable slot *0x78 on HgcColorClamp — `SetInput(int, HGNode*)`.
   * Called from HGColorClamp::GetOutput @Helium 0x152277.
   * Not yet transcribed (vtable slot resolution) @Helium 0x152277 — throws.
   */
  public SetInput(_idx: number, _src: HGNode | null): void {
    throw new Error(
      "HgcColorClamp::SetInput (vtable *0x78) @Helium " +
        "(callsite HGColorClamp::GetOutput @0x152277) not yet transcribed",
    );
  }

  /**
   * vtable slot *0x60 on HgcColorClamp — `SetParameter(int,f,f,f,f)`.
   * Called from HGColorClamp::GetOutput @Helium 0x1522a6 (idx=0, clampMax)
   * and @0x1522d8 (idx=1, clampMin).
   * Not yet transcribed (vtable slot resolution) @Helium 0x1522a6 — throws.
   */
  public SetParameter(
    _idx: number,
    _a: number,
    _b: number,
    _c: number,
    _d: number,
  ): void {
    throw new Error(
      "HgcColorClamp::SetParameter (vtable *0x60) @Helium " +
        "(callsites HGColorClamp::GetOutput @0x1522a6, @0x1522d8) not yet transcribed",
    );
  }
}

/**
 * Placement-construct a fresh `HgcColorClamp` (0x1a0 bytes).
 *
 * Mirrors `HGObject::operator new(0x1a0)` @Helium 0x151f21 / 0x15205c
 * followed by the placement ctor call @0x151f2c / 0x152067 to
 * `__ZN13HgcColorClampC1Ev`. The 0x1a0 (416 bytes) is the encoded size class
 * of the HgcColorClamp allocation. Ctor not yet transcribed @Helium 0x152067
 * — throws.
 */
function newHgcColorClamp(): HgcColorClamp {
  throw new Error(
    "HgcColorClamp::HgcColorClamp() @Helium 0x152067 " +
      "(via HGObject::operator new(0x1a0) @0x15205c) not yet transcribed",
  );
}

/**
 * `HGNode::ClearBits()` — the void-arg thunk @Helium 0x11c890 that tail-jumps
 * `HGNode::ClearBits(int)` @0x11f6b0 with `esi = 0xFFFF`.
 *
 * Not exposed as a method on the ported HGNode class yet. Modeled here as a
 * throwing stub so mutation of a live filter graph loudly flags the gap.
 */
function HGNode_ClearBits(_self: HGNode): void {
  throw new Error(
    "HGNode::ClearBits() @Helium 0x11c890 (→ ClearBits(0xFFFF) @0x11f6b0) " +
      "not yet transcribed",
  );
}

/**
 * `HGColorClamp` — HGNode subclass carrying an owned `HgcColorClamp`
 * subnode plus two per-channel float4 clamp bounds.
 *
 * See file header for full symbol / layout / semantic provenance.
 */
export class HGColorClamp extends HGNode {
  /** 0x198 — owned HgcColorClamp subnode (allocated in ctor). */
  public hgcSubnode: HgcColorClamp;
  /** 0x1a0..0x1ac — clampMax[R,G,B,A] (float32). */
  public clampMax: [number, number, number, number];
  /** 0x1b0..0x1bc — clampMin[R,G,B,A] (float32). */
  public clampMin: [number, number, number, number];

  /**
   * Overloaded C++ constructor.
   *
   * - `new HGColorClamp()`             → default ctor @Helium 0x151f00.
   *     clampMax = {1,1,1,1} @0x3c7c40, clampMin = {0,0,0,0}.
   * - `new HGColorClamp(lo, hi)`       → 2-arg ctor  @Helium 0x152030.
   *     clampMin = broadcast(lo), clampMax = broadcast(hi).
   *
   * Both ctors:
   *   1. Chain HGNode::HGNode() @0x11baf0.
   *   2. Install own vtable (leaq @0x151f12 / @0x15204d).
   *   3. `operator new(0x1a0)` + `HgcColorClamp::HgcColorClamp()` @0x151f21+0x151f2c
   *      (respectively @0x15205c+0x152067). Store into this+0x198.
   *   4. Assign clampMax @0x1a0 and clampMin @0x1b0 (order as decoded).
   *   Unwind path (delete-then-~HGNode-then-Unwind_Resume) not modeled.
   */
  constructor(lo?: number, hi?: number) {
    super();
    // Steps 1-3: base ctor + own vtable + allocate+construct HgcColorClamp.
    this.hgcSubnode = newHgcColorClamp();
    // Step 4: initialize clampMax / clampMin.
    if (lo === undefined && hi === undefined) {
      // Default ctor path @0x151f00:
      //   movaps 0x275d01(%rip),%xmm0  →  { 1.0f, 1.0f, 1.0f, 1.0f } @0x3c7c40
      //   movaps %xmm0, 0x1a0(%rbx)    →  clampMax = xmm0
      //   xorps  %xmm0, %xmm0
      //   movaps %xmm0, 0x1b0(%rbx)    →  clampMin = { 0, 0, 0, 0 }
      const one = Math.fround(1.0);
      const zero = Math.fround(0.0);
      this.clampMax = [one, one, one, one];
      this.clampMin = [zero, zero, zero, zero];
    } else if (lo !== undefined && hi !== undefined) {
      // 2-arg ctor path @0x152030:
      //   movaps xmm0, -0x30(%rbp)  ; xmm0 = arg-1 (lo)
      //   movaps xmm1, -0x40(%rbp)  ; xmm1 = arg-2 (hi)
      //   ...
      //   movaps -0x30(%rbp), %xmm0 ; shufps $0x0, xmm0, xmm0 ; movaps xmm0, 0x1b0(%rbx)
      //   movaps -0x40(%rbp), %xmm0 ; shufps $0x0, xmm0, xmm0 ; movaps xmm0, 0x1a0(%rbx)
      // → clampMin = broadcast(lo), clampMax = broadcast(hi).
      const loF = Math.fround(lo);
      const hiF = Math.fround(hi);
      this.clampMin = [loF, loF, loF, loF];
      this.clampMax = [hiF, hiF, hiF, hiF];
    } else {
      // The two decoded C++ overloads are `()` and `(float, float)`.
      // A single-arg call has no decoded body here — refuse to guess.
      throw new Error(
        "HGColorClamp: only () and (float,float) ctors are decoded " +
          "(@Helium 0x151f00, 0x152030); other arities not transcribed",
      );
    }
  }

  /**
   * `HGColorClamp::SetClampMaxValues(float, float, float, float)`
   * @Helium 0x1521f0.
   *
   *   movss %xmm0, 0x1a0(%rdi)
   *   movss %xmm1, 0x1a4(%rdi)
   *   movss %xmm2, 0x1a8(%rdi)
   *   movss %xmm3, 0x1ac(%rdi)
   *   ret
   *
   * NB: unlike SetParameter, this fast path does NOT call `ClearBits()` —
   * the compiler kept it a leaf function on purpose (mirrored here).
   */
  public SetClampMaxValues(a: number, b: number, c: number, d: number): void {
    // @0x1521f4..0x15220c
    this.clampMax = [
      Math.fround(a),
      Math.fround(b),
      Math.fround(c),
      Math.fround(d),
    ];
  }

  /**
   * `HGColorClamp::SetClampMinValues(float, float, float, float)`
   * @Helium 0x152220.
   *
   *   movss %xmm0, 0x1b0(%rdi)
   *   movss %xmm1, 0x1b4(%rdi)
   *   movss %xmm2, 0x1b8(%rdi)
   *   movss %xmm3, 0x1bc(%rdi)
   *   ret
   *
   * As with SetClampMaxValues: no ClearBits() call — leaf function.
   */
  public SetClampMinValues(a: number, b: number, c: number, d: number): void {
    // @0x152224..0x15223c
    this.clampMin = [
      Math.fround(a),
      Math.fround(b),
      Math.fround(c),
      Math.fround(d),
    ];
  }

  /**
   * `HGColorClamp::SetParameter(int, float, float, float, float)`
   * @Helium 0x152190. Returns `1` on write, `0xFFFFFFFF` (-1) on unknown idx.
   *
   *   testl %esi, %esi        ; if (idx == 0) goto MAX
   *   je    0x1521b4
   *   movl  $-1, %eax
   *   cmpl  $1, %esi          ; if (idx != 1) return -1
   *   jne   0x1521eb
   *   [MIN:] target-offsets = {0x1b0, 0x1b4, 0x1b8, 0x1bc}
   *   jmp   store
   *   [MAX:] target-offsets = {0x1a0, 0x1a4, 0x1a8, 0x1ac}
   *   [store:] movss xmm0..xmm3 → (rdi + off_i)
   *            callq HGNode::ClearBits() @0x11c890
   *            movl  $1, %eax
   *            ret
   */
  public SetParameter(
    idx: number,
    a: number,
    b: number,
    c: number,
    d: number,
  ): number {
    // @0x152190: idx==0 → clampMax; idx==1 → clampMin; else return -1.
    if (idx === 0) {
      this.clampMax = [
        Math.fround(a),
        Math.fround(b),
        Math.fround(c),
        Math.fround(d),
      ];
    } else if (idx === 1) {
      this.clampMin = [
        Math.fround(a),
        Math.fround(b),
        Math.fround(c),
        Math.fround(d),
      ];
    } else {
      // movl $0xffffffff, %eax then bailout via the `jne 0x1521eb` short-
      // circuit. The C signature declares `int` — we return -1.
      return -1;
    }
    // @0x1521e0: callq HGNode::ClearBits()
    HGNode_ClearBits(this);
    // @0x1521e5: movl $0x1, %eax
    return 1;
  }

  /**
   * `HGColorClamp::GetOutput(HGRenderer*)` @Helium 0x152250.
   *
   * IMPORTANT: `renderer` (rsi at entry) is overwritten before use — the
   * ingress `input` is instead obtained by dispatching THIS object's own
   * vtable slot *0x80 (`GetInput(int)`) with idx=0. This is NOT the same
   * pattern as HGBilateralFilter::GetOutput; here the method never touches
   * the caller-supplied HGRenderer at all.
   *
   *   r14 = this->hgcSubnode                    (0x198)   @0x15225d
   *   rax = this->vtable[0x80]                            @0x15225a+@0x152266
   *   input = call vtable[0x80](this, 0)                  @0x152266 → HGNode
   *                                                                  ::GetInput(0)
   *   rcx = hgcSubnode->vtable[0x78]                      @0x15226c
   *   call vtable[0x78](hgcSubnode, 0, input)             @0x152277
   *
   *   Load clampMax[R,G,B,A]                              @0x152281..0x152299
   *   rax = hgcSubnode->vtable[0x60]
   *   call vtable[0x60](hgcSubnode, 0, R, G, B, A)        @0x1522a6
   *
   *   Load clampMin[R,G,B,A]                              @0x1522b0..0x1522c8
   *   rax = hgcSubnode->vtable[0x60]
   *   call vtable[0x60](hgcSubnode, 1, R, G, B, A)        @0x1522d8
   *
   *   return hgcSubnode                                   @0x1522db..
   */
  public GetOutput(_renderer: unknown): HgcColorClamp {
    // (rsi arg is overwritten immediately @0x152264 `xorl %esi, %esi`;
    // we deliberately drop the argument to make that faithful.)
    void _renderer;

    // Grab subnode pointer (r14 in the binary).
    const saved = this.hgcSubnode; // @0x15225d
    // Virtual GetInput(0) on THIS. In C++ the vtable dispatch goes through
    // this class's own vtable slot *0x80 = `HGNode::GetInput(int)` @0x11c8b0
    // (see HGNode.ts, no override here). Ported HGNode.GetInput returns
    // HGNode | null; we accept a null slot as valid ingress.
    const input = this.GetInput(0); // @0x152266

    // saved->SetInput(0, input) via vtable *0x78.
    saved.SetInput(0, input); // @0x152277

    // saved->SetParameter(0, clampMax[0..3]) via vtable *0x60.
    saved.SetParameter(
      0,
      this.clampMax[0],
      this.clampMax[1],
      this.clampMax[2],
      this.clampMax[3],
    ); // @0x1522a6

    // saved->SetParameter(1, clampMin[0..3]) via vtable *0x60.
    saved.SetParameter(
      1,
      this.clampMin[0],
      this.clampMin[1],
      this.clampMin[2],
      this.clampMin[3],
    ); // @0x1522d8

    // return this->hgcSubnode (@0x1522db reloads 0x198 into rax).
    return this.hgcSubnode;
  }

  /**
   * `HGColorClamp::~HGColorClamp()` — three symbols share this body:
   *   D2 (in-place base-subobject dtor)       @Helium 0x1520d0
   *   D1 (complete-object dtor, byte-identical to D2)  @Helium 0x152110
   *   D0 (deleting dtor: D2 then `operator delete`)    @Helium 0x152150
   *
   * The D2 body (from `xcrun llvm-objdump --disassemble-symbols`):
   *   pushq %rbp / movq %rsp,%rbp / pushq %rbx / subq $0x8,%rsp
   *   movq %rdi, %rbx
   *   leaq 0x8cd5d8(%rip), %rax  ## @0xa1f6b8 = &HGColorClamp::vtable[+0x10]
   *   movq %rax, (%rdi)          ; reinstall own vtable (defensive Itanium
   *                                ABI move so a virtual call during dtor
   *                                dispatches to THIS class's slot).
   *   movq 0x198(%rdi), %rdi     ; rdi = this->hgcSubnode  (the owned subnode)
   *   movq (%rdi), %rax          ; rax = hgcSubnode->vtable
   *   callq *0x18(%rax)          ; hgcSubnode->vtable[+0x18](subnode)
   *                              ;   HGNode vtable slot 0x18 is the deleting
   *                              ;   dtor D0 (see HGNode.ts vtable map);
   *                              ;   this deletes the owned HgcColorClamp.
   *   movq %rbx, %rdi
   *   ...
   *   jmp __ZN6HGNodeD2Ev        ; tail-call HGNode::~HGNode() @0x11bf20
   *                              ;   to destroy the base subobject.
   *
   * D0 (0x152150) differs only by adding `jmp __ZN8HGObjectdlEPv` (=
   * HGObject::operator delete @0x1a0f10) AFTER the HGNode::~HGNode call,
   * to free the storage for `this`. In JS/TS memory is GC'd, so both D2
   * and D0 map to the same body here — the delete step is a no-op.
   * D1 (0x152110) is byte-for-byte D2 in this binary (LLVM identical-code
   * folding candidate; not actually folded, but same source).
   *
   * The `.cold` unwind trampolines (@0x1520fe / @0x15213e / @0x152186)
   * that call `__clang_call_terminate` after `___cxa_throw` are omitted:
   * JS exceptions unwind natively, and no dtor here can throw.
   */
  public dispose(): void {
    // Reinstall the vtable pointer as a placeholder — the JS field model
    // has no vtable slot, but the operation is documented for parity.
    // (The C++ code does `movq &vtable, (%rdi)` at @0x1520d9.)

    // Invoke the owned subnode's deleting dtor (vtable slot +0x18).
    // In the TS port, HgcColorClamp doesn't expose a runtime vtable; call
    // its explicit dispose if present. Otherwise the subnode is dropped.
    const sub = this.hgcSubnode as unknown as { dispose?: () => void };
    if (typeof sub.dispose === "function") {
      sub.dispose(); // @0x1520ed — hgcSubnode->vtable[0x18](subnode)
    }
    // Tail-call HGNode::~HGNode() @0x11bf20 — the base subobject dtor.
    // super has no ported dispose today; the reference-release is implicit.
    // (D0 additionally calls HGObject::operator delete @0x1a0f10 — no-op in GC land.)
  }
}
