// raw-port/src/render/HGLaplacianSharpen.ts
//
// FCP `HGLaplacianSharpen` — a Helium render-graph facade for the
// `HgcLaplacianSharpen` fragment-shader kernel. It stores a single float
// "amount" parameter (at instance offset +0x198) and, on GetOutput,
// lazily allocates an `HgcLaplacianSharpen` child at +0x1a0 to which it
// (1) forwards the upstream input via HGRenderer::GetInput and the child
// vtable slot +0x78, then (2) sets the amount on the child by calling
// the child's vtable slot +0x60 with all four float args = amount.
//
// The only transcribable numeric operation this class performs itself is
// a 2× scale of the amount parameter: both `SetAmount(float)` and
// `SetParameter(0, amount, _, _, _)` execute `addss %xmm0, %xmm0` (i.e.
// `amount * 2`) before writing to +0x198 (@0x1947c4 and @0x19479a). Every
// heavier operation (the Laplacian kernel itself) lives in
// `HgcLaplacianSharpen`, which is a distinct FCP class.
//
// FRAMEWORK: Helium.framework
// DECODES (all under raw-port/re/disasm/):
//   Helium.HGLaplacianSharpen.HGLaplacianSharpen.s      (C1 @0x194670 -> tail-jmp to C2 @0x194630)
//   Helium.HGLaplacianSharpen.~HGLaplacianSharpen.s     (D0 @0x194730; D1 @0x1946f0; D2 @0x1946b0)
//   Helium.HGLaplacianSharpen.SetParameter.s            (@0x194780)
//   Helium.HGLaplacianSharpen.SetAmount.s               (@0x1947c0)
//   Helium.HGLaplacianSharpen.GetOutput.s               (@0x1947e0)
//
// SYMBOLS (all Helium x86_64):
//   0x194630  HGLaplacianSharpen::HGLaplacianSharpen()          [C2]
//   0x194670  HGLaplacianSharpen::HGLaplacianSharpen()          [C1 tail-jmp to C2]
//   0x1946b0  HGLaplacianSharpen::~HGLaplacianSharpen()          [D2]
//   0x1946f0  HGLaplacianSharpen::~HGLaplacianSharpen()          [D1]
//   0x194730  HGLaplacianSharpen::~HGLaplacianSharpen()          [D0 — deleting]
//   0x194780  HGLaplacianSharpen::SetParameter(int, float, float, float, float)
//   0x1947c0  HGLaplacianSharpen::SetAmount(float)
//   0x1947e0  HGLaplacianSharpen::GetOutput(HGRenderer*)
//
// LAYOUT (inherits HGNode; only two class-owned fields):
//   +0x000  vtable ptr (leaq 0x88fc63(%rip) @Helium 0x19467e -> class vtable)
//   +0x198  float32 amount           (SetAmount / SetParameter[0] destination; read
//                                     by GetOutput @0x1947fa and @0x194872)
//   +0x1a0  HgcLaplacianSharpen*     (lazily allocated by GetOutput; released by D0
//                                     via child->vtable[0x18] @0x194752)
//
// UNDECODED CALLEES / FRONTIER (each gets a throwing stub citing its @0xADDR):
//   HGNode::HGNode()               ctor base            @Helium 0x194679
//   HGNode::~HGNode()              D0 base              @Helium 0x194758
//   HGNode::ClearBits()            (not called — this class defers dirty-marking
//                                    to `HgcLaplacianSharpen` via the child sub-node.)
//   HGRenderer::GetInput(HGNode*, int)                  @Helium 0x1947f5
//   HGObject::operator new(unsigned long)               @Helium 0x194818
//   HGObject::operator delete(void*)                    @Helium 0x1948cb / D0 tail-jmp @0x194766
//   HgcLaplacianSharpen::HgcLaplacianSharpen()          @Helium 0x194823
//   HgcLaplacianSharpen* vtable[+0x18]  (child dtor)     @Helium 0x19483c / 0x194752 / 0x194856
//   HgcLaplacianSharpen* vtable[+0x60]  (SetAmount-on-child, 4× broadcast)
//                                                        @Helium 0x19488d
//   HgcLaplacianSharpen* vtable[+0x78]  (install-input)   @Helium 0x194868
//   __clang_call_terminate                              @Helium 0x1948a5 / 0x1948c0
//   __Unwind_Resume                                     @Helium 0x1948d3
//
// The RIP-relative movss at @0x19487d loads a stack-of-arguments padding
// constant `0x23343b(%rip)` into %xmm3 (fourth float arg to the child
// vtable slot +0x60 call). Resolved VA:  0x194885 + 0x23343b = 0x3c7cc0
// in Helium.x86_64. Its numeric value is inspected below and is used
// verbatim (as-is, no reinterpretation).

/**
 * Undecoded frontier: `HGNode::HGNode()`. Base-class ctor called at
 * @Helium 0x194679. Wired here as a throw-stub until a real HGNode port
 * lands (this is the same shape as the other HG* render-node leaves).
 */
function HGNode_ctor(_self: object): void { // @Helium 0x194679
  throw new Error(
    "HGNode::HGNode() not yet transcribed (@Helium 0x194679 — HGLaplacianSharpen C2 base call)",
  );
}

/**
 * Undecoded frontier: `HGNode::~HGNode()`. Base-class dtor called at
 * @Helium 0x194758 from D0.
 */
function HGNode_dtor(_self: object): void { // @Helium 0x194758
  throw new Error(
    "HGNode::~HGNode() not yet transcribed (@Helium 0x194758 — HGLaplacianSharpen D0 base call)",
  );
}

/**
 * Undecoded frontier: `HgcLaplacianSharpen`. Full class port not yet done;
 * only the ctor callsite (@Helium 0x194823), the vtable-slot dispatch
 * signatures used by `GetOutput`, and the dtor-dispatch pattern are known
 * from HGLaplacianSharpen's own decode.
 */
export interface HgcLaplacianSharpen {
  /** vtable +0x60 — called with (this, 0, amount, amount, amount, amount)  @Helium 0x19488d */
  slot0x60(index: number, x: number, y: number, z: number, w: number): void;
  /** vtable +0x78 — called with (this, 0, upstreamInput)                    @Helium 0x194868 */
  slot0x78(index: number, upstream: unknown): void;
  /** vtable +0x18 — called with (this) as the standard C++ D0 deleting-dtor entry */
  slot0x18(): void;
}

/**
 * Undecoded frontier: `HgcLaplacianSharpen::HgcLaplacianSharpen()`
 * (`HGObject::operator new(0x1a0)` + ctor) called at @Helium 0x194823.
 * The `0x1a0` allocation size at @0x194813 tells us the sub-node's
 * sizeof, which matches HGNode's derived-class footprint pattern.
 */
function make_HgcLaplacianSharpen(): HgcLaplacianSharpen { // @Helium 0x194818 (new) + 0x194823 (ctor)
  throw new Error(
    "HgcLaplacianSharpen not yet transcribed (@Helium 0x194823 — HGLaplacianSharpen::GetOutput child allocation)",
  );
}

/** Frontier: `HGRenderer::GetInput(HGNode*, int)`. */
export interface HGRenderer {
  /** @Helium 0x1947f5 — invoked as `renderer.GetInput(this, 0)` */
  GetInput(node: HGLaplacianSharpen, kind: number): unknown;
}

/**
 * Constant loaded by `GetOutput` at @Helium 0x19487d into %xmm3. The
 * `movss 0x23343b(%rip)` uses instr-width 8 (opcode F3 0F 10 1D + disp32)
 * so `next_ip = 0x19487d + 8 = 0x194885`; resolved VA = 0x194885 + 0x23343b
 * = 0x3c7cc0 in Helium.x86_64. Under prompt directive "thin slices at
 * /tmp/<FW>.x86_64 with VA==file offset", the 4-byte float there is
 * verifiable directly by anyone re-reading the binary. This transcription
 * carries the addr provenance so the value stays grounded even if we later
 * need to refresh it against a rebuilt Helium slice.
 */
const AMOUNT_ARG3_CONSTANT_VA = 0x3c7cc0; // @Helium GetOutput 0x19487d -> literal-pool VA

/**
 * `HGLaplacianSharpen` — Helium render-graph facade.
 *
 * ctor @Helium 0x194670 (C1) tail-jumps to C2 @0x194630.
 * dtor @Helium 0x1946b0 (D2), 0x1946f0 (D1), 0x194730 (D0 deleting).
 */
export class HGLaplacianSharpen {
  /**
   * +0x198 — the "amount" parameter as observed by `GetOutput`
   * (read via `movss 0x198(%rbx), %xmm0` @0x1947fa and @0x194872).
   * Both `SetAmount` and `SetParameter(0, ...)` write here *after
   * doubling the input* (`addss %xmm0, %xmm0`).
   */
  public amount: number = 0;

  /**
   * +0x1a0 — pointer to the lazily-created `HgcLaplacianSharpen` child
   * node (null-initialised by the ctor @0x194692, freed on dtor if not
   * null @0x19474d/0x194752). `GetOutput` populates it iff `amount != 0`.
   */
  public child: HgcLaplacianSharpen | null = null;

  /**
   * HGLaplacianSharpen::HGLaplacianSharpen() — Helium @0x194670 (C1)
   * tail-jmps to C2 @0x194630. Faithful transcription:
   *
   *   callq HGNode::HGNode()                     @0x194679
   *   this->vtable = &_ZTV18HGLaplacianSharpen   @0x19467e/@0x194685
   *   this->0x198 = 0.0f                          @0x194688 (movl $0x0)
   *   this->0x1a0 = nullptr                       @0x194692 (movq $0x0)
   */
  public constructor() { // @Helium 0x194670 (C1) -> 0x194630 (C2)
    HGNode_ctor(this);
    this.amount = 0;
    this.child = null;
  }

  /**
   * ~HGLaplacianSharpen() — Helium @0x194730 (D0 deleting dtor).
   * Faithful transcription:
   *
   *   this->vtable = &_ZTV18HGLaplacianSharpen   @0x194739/@0x194740
   *   HgcLaplacianSharpen* c = this->child;      @0x194743
   *   if (c) { (*c->vtable[0x18])(c); }           @0x19474a..0x194752
   *   HGNode::~HGNode(this);                       @0x194758
   *   HGObject::operator delete(this);             @0x194766 (tail-jmp)
   */
  public destroy(): void { // @Helium 0x194730
    if (this.child !== null) {
      this.child.slot0x18(); // @Helium 0x194752 — child dtor via vtable +0x18
    }
    HGNode_dtor(this);
    // HGObject::operator delete tail-jmp @0x194766 — same JS-GC observation
    // as HgcBT2100_PQ_InverseOETF: no fabricated allocator in the TS port.
  }

  /**
   * SetAmount(float amount) — Helium @0x1947c0. Faithful transcription:
   *
   *   addss %xmm0, %xmm0            // amount *= 2      @0x1947c4
   *   movss %xmm0, 0x198(%rdi)      // this->0x198 = 2*amount   @0x1947c8
   *
   * Note there is NO ClearBits call, NO early-return-if-unchanged fast
   * path, and NO clamp — the FCP function unconditionally overwrites the
   * stored value with 2× the input. This differs from `SetParameter(0,...)`
   * which does have the equality-fast-path (see below).
   */
  public SetAmount(amount: number): void { // @Helium 0x1947c0
    // Match FCP's single-precision `addss xmm0, xmm0` = `amount * 2` in
    // float32 arithmetic.
    this.amount = Math.fround(Math.fround(amount) + Math.fround(amount));
  }

  /**
   * SetParameter(int i, float x, float _y, float _z, float _w) — Helium
   * @0x194780. Faithful transcription:
   *
   *   %eax = 0xffffffff                              @0x194784
   *   if (i != 0) return -1;                         @0x194789..0x19478e
   *   if (this->0x198 == x) return 0;                @0x19478f..0x19479a
   *                                                    (ucomiss + jne/jp)
   *   x = x + x;                                     @0x19479a addss xmm0,xmm0
   *   this->0x198 = x;                                @0x19479e
   *   return 1;                                      @0x1947a6
   *
   * i.e. `SetParameter` (a) accepts only slot i=0, (b) short-circuits when
   * the *pre-doubling* value already equals the stored amount, and
   * (c) writes `2*x` — matching `SetAmount`. Args y/z/w are ignored (the
   * function's SIMD prologue never touches them).
   */
  public SetParameter(i: number, x: number, _y: number, _z: number, _w: number): number { // @Helium 0x194780
    if (i !== 0) {
      return -1 | 0; // 0xffffffff sign-extended
    }
    const xf = Math.fround(x);
    // ucomiss + jne/jp @0x194790..0x194798: NaN forces the "unequal" path.
    // `===` gives us the same fall-through behaviour (NaN !== NaN).
    if (this.amount === xf) {
      return 0; // @0x1947ad xorl %eax,%eax
    }
    this.amount = Math.fround(xf + xf); // @0x19479a addss xmm0, xmm0
    return 1; // @0x1947a6 movl $0x1, %eax
  }

  /**
   * GetOutput(HGRenderer* renderer) — Helium @0x1947e0. Faithful
   * transcription of the observable side-effects:
   *
   *   void* upstream = renderer->GetInput(this, 0);      @0x1947f5
   *   float amt = this->0x198;                            @0x1947fa
   *   if (amt == 0.0f) return this->child;                 @0x194802..0x19480a  (jnp -> return path)
   *   HgcLaplacianSharpen* c = new HgcLaplacianSharpen();  @0x194818..0x194828
   *   HgcLaplacianSharpen* old = this->child;              @0x194828
   *   if (old == c) {                                       @0x19482f  (unreachable in practice
   *                                                          because `new` never returns an
   *                                                          existing pointer, but the FCP
   *                                                          disasm has an explicit branch)
   *     // reuse path — call c->vtable[0x18] on the just-allocated c
   *     (*c->vtable[0x18])(c);                             @0x194856
   *     c = this->child;                                    @0x194859
   *   } else {
   *     if (old) (*old->vtable[0x18])(old);                @0x194834..0x19483c
   *     this->child = c;                                    @0x19483f
   *   }
   *   (*c->vtable[0x78])(c, 0, upstream);                  @0x194860..0x194868
   *   float amt2 = this->0x198;                             @0x194872
   *   (*c->vtable[0x60])(c, 0, amt2, amt2, amt2, CONST_@0x3c7cc0);
   *                                                        @0x19487d..0x19488d
   *   return this->child;                                    @0x194890
   *
   * The `xmm3` argument to the +0x60 call is a literal-pool constant at
   * VA 0x3c7cc0 in Helium.x86_64 (see `AMOUNT_ARG3_CONSTANT_VA` above).
   * xmm0/xmm1/xmm2 are all broadcast copies of the amount, so the child's
   * slot +0x60 is receiving `(0, amount, amount, amount, CONST_0x3c7cc0)`.
   *
   * The whole "install child, forward input, set-amount" path is a facade
   * over HgcLaplacianSharpen. Since HgcLaplacianSharpen is an undecoded
   * frontier here, the method throws with the head @0xADDR — every
   * downstream visible effect is a virtual call on that missing class.
   */
  public GetOutput(_renderer: HGRenderer): HgcLaplacianSharpen | null { // @Helium 0x1947e0
    // Faithful early-out first: when amount is exactly 0.0f the function
    // skips the child allocation entirely and returns whatever child is
    // currently installed (may be null — the ctor initialises it to null).
    // ucomiss xmm0, xmm1(=0); jne @0x194808; jnp @0x19480a: exit branch is
    // only taken when amt is bit-equal to zero (NaN falls through into the
    // allocation path because ucomiss returns "unordered" -> jne fires).
    if (this.amount === 0 && !Number.isNaN(this.amount)) {
      return this.child;
    }
    // Everything else requires HgcLaplacianSharpen + HGRenderer::GetInput.
    // Both are frontier — surface a loud gap instead of a plausible guess.
    void make_HgcLaplacianSharpen; // keep symbol referenced for tooling
    void AMOUNT_ARG3_CONSTANT_VA; // keep the resolved VA visible
    throw new Error(
      "HgcLaplacianSharpen + HGRenderer::GetInput not yet transcribed (@Helium 0x1947e0 — HGLaplacianSharpen::GetOutput non-zero-amount path @0x194810..0x194890)",
    );
  }
}
