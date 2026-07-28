// OZCollisionBehavior.ts — FCP Ozone framework class.
//
// OZCollisionBehavior is a thin OZReflexiveBehavior subclass that models a "collision handler"
// in the Ozone motion-simulation graph. It installs 4 vtable pointers (main + 3 multiple-
// inheritance thunk tables) and overrides the "per-particle handleCollisions" virtual
// (`handleCollisions(OZTransformNode*, OZSimulationState*, OZSimulationState*, bool, bool*)`)
// to a base-case NO-OP that writes `*outHitFlag = false`. The public array-form
// `handleCollisions(OZTransformNode*, OZSimStateArray*, OZSimStateArray*, bool, bool*)` is a
// template-method iterator: it walks the two OZSimStateArrays in lockstep, unpacks each pair
// into stack-local OZSimulationState scratch objects, dispatches through the class's own
// vtable slot at +0x2e0 (the SCALAR handleCollisions — polymorphically overridden by concrete
// subclasses), then copies the mutated scratch state back into the src array.
//
// Transcribed from the x86_64 disassembly of Ozone in
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
// See raw-port/re/disasm/OZCollisionBehavior.*.s.
//
// SYMBOLS (nm | c++filt):
//   0x1db600  T OZCollisionBehavior::OZCollisionBehavior(OZFactory*, PCString const&, unsigned int)  (C2)
//   0x1db650  T OZCollisionBehavior::OZCollisionBehavior(OZFactory*, PCString const&, unsigned int)  (C1)
//   0x1db6a0  T OZCollisionBehavior::OZCollisionBehavior(OZCollisionBehavior&, unsigned int)          (C2 copy)
//   0x1db6f0  T OZCollisionBehavior::OZCollisionBehavior(OZCollisionBehavior&, unsigned int)          (C1 copy)
//   0x1db740  T OZCollisionBehavior::~OZCollisionBehavior()                                            (D2)
//   0x1db750  T OZCollisionBehavior::~OZCollisionBehavior()                                            (D1)
//   0x1db760  T non-virtual thunk to ~OZCollisionBehavior [-0x10]                                      (D1 thunk @+16)
//   0x1db770  T non-virtual thunk to ~OZCollisionBehavior [-0x28]                                      (D1 thunk @+40)
//   0x1db780  T non-virtual thunk to ~OZCollisionBehavior [-0x148]                                     (D1 thunk @+328)
//   0x1db7a0  T OZCollisionBehavior::~OZCollisionBehavior()                                            (D0 deleting)
//   0x1db7c0  T non-virtual thunk to ~OZCollisionBehavior [-0x10]                                      (D0 thunk @+16)
//   0x1db7f0  T non-virtual thunk to ~OZCollisionBehavior [-0x28]                                      (D0 thunk @+40)
//   0x1db820  T non-virtual thunk to ~OZCollisionBehavior [-0x148]                                     (D0 thunk @+328)
//   0x1db850  T OZCollisionBehavior::operator=(OZBehavior const&)
//   0x1db860  T OZCollisionBehavior::handleCollisions(OZTransformNode*, OZSimulationState*,
//               OZSimulationState*, bool, bool*)                                                       (SCALAR)
//   0x1db870  T OZCollisionBehavior::handleCollisions(OZTransformNode*, OZSimStateArray*,
//               OZSimStateArray*, bool, bool*)                                                         (ARRAY)
//   0x8426c8  s vtable for OZCollisionBehavior
//   0x842ca0  S typeinfo for OZCollisionBehavior
//
// INHERITANCE (recovered from ctor calls to base subobject ctors):
//   OZCollisionBehavior : public OZReflexiveBehavior   (single call to OZReflexiveBehavior::C2
//                                                        at ctor @0x1db659 / 0x1db6a9 / 0x1db6f9)
// The 4-way vtable install pattern (main @+0x00, MI-slice @+0x10, @+0x28, @+0x148) means
// OZReflexiveBehavior itself uses multiple inheritance — its subobjects live at those byte
// offsets — and OZCollisionBehavior faithfully reinstalls its overriding vtables at each MI
// slice. The thunk symbols (`__ZThn16_`, `__ZThn40_`, `__ZThn328_` on both D0 and D1) confirm
// the same 3 MI subobject offsets: +0x10, +0x28, +0x148 bytes into the object.
//
// VTABLE INSTALLED POINTERS (from ctor C1 @0x1db650 leaqs; RIP-after + disp):
//   Main vptr        @0x1db65e leaq 0x667073(%rip) -> 0x1db665 + 0x667073 = 0x8426d8
//                                                    (== vtable_sym 0x8426c8 + 0x10)
//   MI vptr at +0x10 @0x1db668 leaq 0x667369(%rip) -> 0x1db66f + 0x667369 = 0x8429d8
//   MI vptr at +0x28 @0x1db673 leaq 0x6675b6(%rip) -> 0x1db67a + 0x6675b6 = 0x842c30
//   MI vptr at +0x148@0x1db67e leaq 0x667603(%rip) -> 0x1db685 + 0x667603 = 0x842c88
// The copy-ctor C1 @0x1db6f0 installs the SAME four pointers via different rip-relative disps:
//   0x1db6fe -> 0x1db705 + 0x666fd3 = 0x8426d8   (main)
//   0x1db708 -> 0x1db70f + 0x6672c9 = 0x8429d8   (+0x10)
//   0x1db713 -> 0x1db71a + 0x667516 = 0x842c30   (+0x28)
//   0x1db71e -> 0x1db725 + 0x667563 = 0x842c88   (+0x148)
// C2 (the non-thunk ctor) matches C1 modulo RIP; see raw-port/re/disasm/OZCollisionBehavior.*.s.
//
// FIELD LAYOUT: OZCollisionBehavior introduces NO new instance fields — its size equals
// OZReflexiveBehavior's. Every ctor writes ONLY the 4 vptr slots; the object's data (particle
// state, behavior parameters, etc.) is entirely inherited from OZReflexiveBehavior /
// OZBehavior further up.
//
// PROGRAM SHAPE:
//   - `handleCollisions(scalar)` is a hard-coded base-case: writes `*outHitFlag = false` and
//     returns. Concrete subclasses override this scalar path (via the vtable @+0x2e0 in the
//     main vtable) to compute actual collision responses.
//   - `handleCollisions(array)` is a template-method: for each i in [0..src.size):
//         local OZSimulationState  srcOne = zero-init;
//         local OZSimulationState  dstOne = zero-init;
//         copy srcArr[i]  into srcOne  (field-by-field, see @0x1db9e7..0x1dbac7)
//         copy dstArr[i]  into dstOne  (field-by-field, see @0x1dbacf..0x1dbb96)
//         this->vtable[+0x2e0](this, transformNode, &srcOne, &dstOne, boolArg, outHitFlag);
//         copy srcOne back into srcArr[i]  (@0x1dbbba..0x1dbbfe)
//     The 0xf8-byte stride (@0x1db8ca movl $0x20; @0x1db959 addq $0xf8) is the size of each
//     OZSimulationState-entry in the OZSimStateArray. The 4th and 5th vtable-call arguments
//     (bool and bool*) pass through unchanged; the transform node passes through unchanged.
//
// FRONTIER CALLEES (throw-stubbed at first use):
//   OZReflexiveBehavior::OZReflexiveBehavior(OZFactory*,PCString const&,unsigned int) @Ozone
//     (call-site 0x1db659, 0x1db609 — inside C1/C2)
//   OZReflexiveBehavior::OZReflexiveBehavior(OZReflexiveBehavior&,unsigned int)      @Ozone
//     (call-site 0x1db6a9, 0x1db6f9 — inside copy C1/C2)
//   OZReflexiveBehavior::~OZReflexiveBehavior()                                       @Ozone
//     (call-site 0x1db745, 0x1db755, 0x1db769, 0x1db779, 0x1db78c, 0x1db7a9, 0x1db7d0,
//                0x1db800, 0x1db833)
//   OZReflexiveBehavior::operator=(OZBehavior const&)                                 @Ozone
//     (call-site 0x1db855)
//   operator delete(void*) via __ZdlPv symbol stub                                    @Ozone
//     (tail-call 0x1db7b7, 0x1db7de, 0x1db80e, 0x1db841 in D0 + D0 thunks)
//   this->vtable[+0x2e0] — the scalar handleCollisions polymorphic override; base case is
//     THIS class's SCALAR handleCollisions at 0x1db860 (returns *outHitFlag = false). Called
//     inside the array-loop at @0x1dbbb4.

// OZBehavior base type is not yet ported (frontier). We declare it locally as an opaque
// nominal type so we can preserve the operator=(OZBehavior const&) signature exactly.
// When raw-port/src/channels/OZBehavior.ts lands, this local declaration should be swapped
// for `import type { OZBehavior } from "./OZBehavior.js";`.
export type OZBehavior = { readonly __oz_behavior_brand: unique symbol };

/**
 * Vtable-installed pointers for OZCollisionBehavior. Recovered from ctor C1 @0x1db650
 * (leaq disps + RIP-after) and confirmed by the identical set installed by copy-ctor
 * C1 @0x1db6f0. See header for the arithmetic.
 */
export const OZCollisionBehavior_VTABLE_MAIN_INSTALLED_PTR = 0x8426d8 as const; // main vptr
export const OZCollisionBehavior_VTABLE_MI_INSTALLED_PTR_AT_0x10 = 0x8429d8 as const;
export const OZCollisionBehavior_VTABLE_MI_INSTALLED_PTR_AT_0x28 = 0x842c30 as const;
export const OZCollisionBehavior_VTABLE_MI_INSTALLED_PTR_AT_0x148 = 0x842c88 as const;

/** Vtable symbol base (before RTTI/offset-to-top). @Ozone 0x8426c8. */
export const OZCollisionBehavior_VTABLE_SYM = 0x8426c8 as const;
/** Typeinfo symbol. @Ozone 0x842ca0. */
export const OZCollisionBehavior_TYPEINFO_SYM = 0x842ca0 as const;

/**
 * Per-array element stride in the OZSimStateArray, from
 *   @0x1db8ca movl $0x20, %r12d      (initial r12 = 0x20, start-offset of first elem)
 *   @0x1db959 addq $0xf8, %r12       (per-iteration bump)
 * The first element's fields are read at r12-0x20 through r12+0xd8 (i.e. -0x20..+0xd8
 * inclusive of a 0xf8-byte cell). Each OZSimulationState element is therefore 0xf8 bytes
 * with the "next-element start" pointer at cell-relative offset -0x20.
 */
export const OZCollisionBehavior_ARRAY_ELEMENT_STRIDE_BYTES = 0xf8 as const;

/**
 * Scalar handleCollisions vtable slot offset. From @0x1dbbb4 `callq *0x2e0(%rax)`
 * inside the array-form handleCollisions, where rax = this's main vtable pointer.
 * In the OZCollisionBehavior main vtable, this slot points at THIS class's scalar
 * handleCollisions at 0x1db860 (the base-case no-op).
 */
export const OZCollisionBehavior_VTABLE_SCALAR_HANDLE_COLLISIONS_SLOT = 0x2e0 as const;

/**
 * The OZCollisionBehavior instance state.
 * The class introduces NO new fields; state is entirely inherited from OZReflexiveBehavior.
 * We model it as a nominally-typed opaque handle so downstream code can distinguish it from
 * other OZBehavior subclasses.
 */
export interface OZCollisionBehaviorState {
  /** Marker to prevent structural aliasing with other OZBehavior state types. */
  readonly __oz_collision_behavior_brand: unique symbol;
  /** OZReflexiveBehavior base — opaque here (see raw-port/src/.../OZReflexiveBehavior.ts
   *  when it lands). Contains all data members (OZBehavior + OZReflexive extensions). */
  _ozReflexiveBase: unknown;
}

// ---------------------------------------------------------------------------
// Ctors
// ---------------------------------------------------------------------------

/**
 * `OZCollisionBehavior::OZCollisionBehavior(OZFactory* f, PCString const& name, unsigned int flags)`
 * @Ozone 0x1db650 (C1) — identical to C2 @0x1db600 modulo RIP-relative disp.
 *
 * Verbatim disasm (C1):
 *   0x1db659  callq OZReflexiveBehavior::OZReflexiveBehavior(OZFactory*,PCString const&,uint)
 *   0x1db65e  leaq  0x667073(%rip),%rax   ## = 0x8426d8    (main vptr)
 *   0x1db665  movq  %rax,(%rbx)                              [install main vptr at this+0x00]
 *   0x1db668  leaq  0x667369(%rip),%rax   ## = 0x8429d8    (MI vptr for subobj @+0x10)
 *   0x1db66f  movq  %rax,0x10(%rbx)                          [install MI vptr at this+0x10]
 *   0x1db673  leaq  0x6675b6(%rip),%rax   ## = 0x842c30    (MI vptr for subobj @+0x28)
 *   0x1db67a  movq  %rax,0x28(%rbx)                          [install MI vptr at this+0x28]
 *   0x1db67e  leaq  0x667603(%rip),%rax   ## = 0x842c88    (MI vptr for subobj @+0x148)
 *   0x1db685  movq  %rax,0x148(%rbx)                         [install MI vptr at this+0x148]
 *   retq
 *
 * The base-ctor call ensures OZReflexiveBehavior initializes ALL data (including the
 * factory pointer, PCString name, and flags). This subclass only reinstalls the vtable
 * pointers — there are no new fields, no dynamic allocations, no exception paths.
 */
export function OZCollisionBehavior_ctor_C1(
  factory: unknown,
  name: unknown, // PCString const&
  flags: number,
): OZCollisionBehaviorState {
  // Base-subobject ctor — @0x1db659.
  const base = OZReflexiveBehavior_ctor_C2_factory__stub(factory, name, flags);
  // Vtable installs (@0x1db65e..0x1db685) — modeled implicitly by returning a
  // nominally-typed OZCollisionBehaviorState.
  return {
    __oz_collision_behavior_brand: undefined as unknown as OZCollisionBehaviorState["__oz_collision_behavior_brand"],
    _ozReflexiveBase: base,
  };
}

/**
 * `OZCollisionBehavior::OZCollisionBehavior(OZFactory*, PCString const&, unsigned int)`
 * @Ozone 0x1db600 (C2) — the "complete-object" variant. Body byte-identical to C1
 * modulo RIP-relative displacement (`leaq 0x6670c3` etc. at the corresponding offsets;
 * all four RIP-after + disp land on the same 0x8426d8 / 0x8429d8 / 0x842c30 / 0x842c88
 * targets).
 */
export function OZCollisionBehavior_ctor_C2(
  factory: unknown,
  name: unknown,
  flags: number,
): OZCollisionBehaviorState {
  return OZCollisionBehavior_ctor_C1(factory, name, flags);
}

/**
 * `OZCollisionBehavior::OZCollisionBehavior(OZCollisionBehavior& other, unsigned int flags)`
 * @Ozone 0x1db6f0 (C1 copy — identical body to C2 copy @0x1db6a0 modulo RIP-relative
 * displacements landing on the same four installed-ptr targets).
 *
 * Verbatim disasm (C1 copy):
 *   0x1db6f9  callq OZReflexiveBehavior::OZReflexiveBehavior(OZReflexiveBehavior&,unsigned int)
 *   0x1db6fe  leaq  0x666fd3(%rip),%rax   ## = 0x8426d8     (main vptr)
 *   0x1db705  movq  %rax,(%rbx)
 *   0x1db708  leaq  0x6672c9(%rip),%rax   ## = 0x8429d8     (MI vptr @+0x10)
 *   0x1db70f  movq  %rax,0x10(%rbx)
 *   0x1db713  leaq  0x667516(%rip),%rax   ## = 0x842c30     (MI vptr @+0x28)
 *   0x1db71a  movq  %rax,0x28(%rbx)
 *   0x1db71e  leaq  0x667563(%rip),%rax   ## = 0x842c88     (MI vptr @+0x148)
 *   0x1db725  movq  %rax,0x148(%rbx)
 *   retq
 */
export function OZCollisionBehavior_ctor_C1_copy(
  other: OZCollisionBehaviorState,
  flags: number,
): OZCollisionBehaviorState {
  // Base-subobject copy-ctor — @0x1db6f9.
  const base = OZReflexiveBehavior_ctor_C2_copy__stub(other._ozReflexiveBase, flags);
  return {
    __oz_collision_behavior_brand: undefined as unknown as OZCollisionBehaviorState["__oz_collision_behavior_brand"],
    _ozReflexiveBase: base,
  };
}

/**
 * `OZCollisionBehavior::OZCollisionBehavior(OZCollisionBehavior&, unsigned int)` @Ozone
 * 0x1db6a0 (C2 copy). Same body as C1 copy modulo RIP-relative disp.
 */
export function OZCollisionBehavior_ctor_C2_copy(
  other: OZCollisionBehaviorState,
  flags: number,
): OZCollisionBehaviorState {
  return OZCollisionBehavior_ctor_C1_copy(other, flags);
}

// ---------------------------------------------------------------------------
// Dtors
// ---------------------------------------------------------------------------

/**
 * `OZCollisionBehavior::~OZCollisionBehavior()` @Ozone 0x1db740 (D2 — base dtor).
 *
 * Verbatim disasm:
 *   0x1db740  pushq %rbp; movq %rsp,%rbp; popq %rbp
 *   0x1db745  jmp   OZReflexiveBehavior::~OZReflexiveBehavior()
 *
 * Bare tail-call to the base dtor — nothing else to do since OZCollisionBehavior has no
 * fields of its own.
 */
export function OZCollisionBehavior_dtor_D2(state: OZCollisionBehaviorState): void {
  // Tail-jmp OZReflexiveBehavior::~OZReflexiveBehavior() (@0x1db745).
  OZReflexiveBehavior_dtor_D2__stub(state._ozReflexiveBase);
}

/**
 * `OZCollisionBehavior::~OZCollisionBehavior()` @Ozone 0x1db750 (D1 — complete-object dtor).
 * Body byte-identical to D2:
 *   0x1db750  pushq %rbp; movq %rsp,%rbp; popq %rbp
 *   0x1db755  jmp   OZReflexiveBehavior::~OZReflexiveBehavior()
 */
export function OZCollisionBehavior_dtor_D1(state: OZCollisionBehaviorState): void {
  OZCollisionBehavior_dtor_D2(state);
}

/**
 * `OZCollisionBehavior::~OZCollisionBehavior()` @Ozone 0x1db7a0 (D0 — deleting dtor).
 *
 * Verbatim disasm:
 *   0x1db7a6  movq  %rdi,%rbx
 *   0x1db7a9  callq OZReflexiveBehavior::~OZReflexiveBehavior()
 *   0x1db7b1  addq  $0x8,%rsp; popq %rbx; popq %rbp
 *   0x1db7b7  jmp   __ZdlPv                        [operator delete(this)]
 *
 * Base dtor + `operator delete(this)`. Standard C++ deleting-dtor pattern.
 */
export function OZCollisionBehavior_dtor_D0(state: OZCollisionBehaviorState): void {
  OZReflexiveBehavior_dtor_D2__stub(state._ozReflexiveBase);
  // Tail-jmp __ZdlPv (@0x1db7b7) — operator delete(this).
  operator_delete__stub(state);
}

/**
 * Non-virtual thunks for D1 at MI subobject offsets +0x10 / +0x28 / +0x148:
 *   0x1db760  __ZThn16_...D1Ev  : addq $-0x10, %rdi ; jmp  ~OZReflexiveBehavior()
 *   0x1db770  __ZThn40_...D1Ev  : addq $-0x28, %rdi ; jmp  ~OZReflexiveBehavior()
 *   0x1db780  __ZThn328_...D1Ev : addq $-0x148,%rdi ; jmp  ~OZReflexiveBehavior()
 * Each thunk simply adjusts `this` back to the primary subobject and tail-calls D2.
 * In our TS model each MI thunk maps to the same D1 (state already refers to the
 * complete object).
 */
export function OZCollisionBehavior_dtor_D1_thunk_at_0x10(state: OZCollisionBehaviorState): void {
  // addq $-0x10, %rdi @0x1db764 → tail-jmp OZReflexiveBehavior::~OZReflexiveBehavior() @0x1db769.
  OZCollisionBehavior_dtor_D1(state);
}
export function OZCollisionBehavior_dtor_D1_thunk_at_0x28(state: OZCollisionBehaviorState): void {
  // addq $-0x28, %rdi @0x1db774 → tail-jmp @0x1db779.
  OZCollisionBehavior_dtor_D1(state);
}
export function OZCollisionBehavior_dtor_D1_thunk_at_0x148(state: OZCollisionBehaviorState): void {
  // addq $-0x148, %rdi @0x1db784 → tail-jmp @0x1db78c.
  OZCollisionBehavior_dtor_D1(state);
}

/**
 * Non-virtual thunks for D0 at MI subobject offsets +0x10 / +0x28 / +0x148:
 *   0x1db7c0  __ZThn16_...D0Ev  : addq $-0x10, %rbx ; call ~OZReflexiveBehavior(); jmp __ZdlPv
 *   0x1db7f0  __ZThn40_...D0Ev  : addq $-0x28, %rbx ; call ~OZReflexiveBehavior(); jmp __ZdlPv
 *   0x1db820  __ZThn328_...D0Ev : addq $-0x148,%rbx ; call ~OZReflexiveBehavior(); jmp __ZdlPv
 */
export function OZCollisionBehavior_dtor_D0_thunk_at_0x10(state: OZCollisionBehaviorState): void {
  // addq $-0x10, %rbx @0x1db7c9 → call D2 @0x1db7d0 → jmp __ZdlPv @0x1db7de.
  OZCollisionBehavior_dtor_D0(state);
}
export function OZCollisionBehavior_dtor_D0_thunk_at_0x28(state: OZCollisionBehaviorState): void {
  // addq $-0x28, %rbx @0x1db7f9 → call D2 @0x1db800 → jmp __ZdlPv @0x1db80e.
  OZCollisionBehavior_dtor_D0(state);
}
export function OZCollisionBehavior_dtor_D0_thunk_at_0x148(state: OZCollisionBehaviorState): void {
  // addq $-0x148, %rbx @0x1db829 → call D2 @0x1db833 → jmp __ZdlPv @0x1db841.
  OZCollisionBehavior_dtor_D0(state);
}

// ---------------------------------------------------------------------------
// operator=
// ---------------------------------------------------------------------------

/**
 * `OZCollisionBehavior::operator=(OZBehavior const& rhs)` @Ozone 0x1db850.
 *
 * Verbatim disasm:
 *   0x1db850  pushq %rbp; movq %rsp,%rbp; popq %rbp
 *   0x1db855  jmp   OZReflexiveBehavior::operator=(OZBehavior const&)
 *
 * Bare tail-call to the base's operator= — the subclass adds no state so there's nothing
 * to copy beyond what OZReflexiveBehavior handles.
 */
export function OZCollisionBehavior_operator_assign(
  state: OZCollisionBehaviorState,
  rhs: OZBehavior,
): OZCollisionBehaviorState {
  // Tail-jmp OZReflexiveBehavior::operator= @0x1db855.
  OZReflexiveBehavior_operator_assign__stub(state._ozReflexiveBase, rhs);
  return state;
}

// ---------------------------------------------------------------------------
// handleCollisions — SCALAR variant (base-case no-op)
// ---------------------------------------------------------------------------

/**
 * `OZCollisionBehavior::handleCollisions(OZTransformNode*, OZSimulationState*,
 *                                        OZSimulationState*, bool, bool*)` @Ozone 0x1db860.
 *
 * Verbatim disasm:
 *   0x1db860  pushq %rbp; movq %rsp,%rbp
 *   0x1db864  movb  $0x0, (%r9)                    [*outHitFlag = false]
 *   0x1db868  popq  %rbp; retq
 *
 * The base-case scalar handleCollisions is a no-op that simply signals "no collision".
 * Concrete subclasses of OZCollisionBehavior override this via the vtable slot at +0x2e0
 * (see the array-form handleCollisions below). The five-arg signature is:
 *   handleCollisions(this,
 *                    OZTransformNode*  transformNode,    // world transform for the sim
 *                    OZSimulationState* src,             // previous-frame particle state
 *                    OZSimulationState* dst,             // this-frame particle state
 *                    bool               someFlag,        // (opaque — likely "isFirstStep")
 *                    bool*              outHitFlag);     // output: did any collision occur?
 */
export function OZCollisionBehavior_handleCollisions_scalar(
  _state: OZCollisionBehaviorState,
  _transformNode: unknown,
  _src: unknown,
  _dst: unknown,
  _someFlag: boolean,
  outHitFlag: { value: boolean },
): void {
  // @0x1db864 movb $0x0, (%r9) — write false to *outHitFlag.
  outHitFlag.value = false;
}

// ---------------------------------------------------------------------------
// handleCollisions — ARRAY variant (per-element iterator template)
// ---------------------------------------------------------------------------

/**
 * `OZCollisionBehavior::handleCollisions(OZTransformNode*, OZSimStateArray*,
 *                                        OZSimStateArray*, bool, bool*)` @Ozone 0x1db870.
 *
 * Dispatcher (@0x1db870..0x1dbc14) — 192-line body:
 *   1. Read `srcArr->begin` (`(rdx)`), `dstArr->begin` (`(rcx)`), `dstArr->end` (`0x8(rcx)`).
 *      If begin == end → return immediately (@0x1db89f `je 0x1dbc03`).
 *   2. For each element pair at stride 0xf8 bytes (@0x1db8ca movl $0x20; @0x1db959 addq $0xf8):
 *        a. Zero-init a local OZSimulationState `srcOne` at rbp-0x130 (@0x1db999..0x1db9a0)
 *           — 3x xorps zero + qword-zero @+0x10 (i.e. p[0..0x18) zero-filled). Header
 *           qword @rbp-0x138 = 0x3FF0000000000000 (double 1.0) (@0x1db988..0x1db992).
 *        b. Zero-init a local OZSimulationState `dstOne` at rbp-0x210 (@0x1db9a8..0x1db9e4)
 *           — 11x xorps zero-fill of p[0..0xc0). Header qword @rbp-0x218 = 1.0.
 *        c. Copy fields from `srcArr[i]` into `srcOne` (@0x1db9e7..0x1dbac7):
 *             - `srcOne[+0x00..0x18)` = srcArr[i].fields[-0x20..-0x08) + [+0x10]
 *             - `srcOne[+0x18..0xb0)` = fields from r15 offsets 0x38..0xa8 (i.e. per-elem
 *               fields laid out at struct offsets 0x38..0xa8 in the array-cell)
 *             - `srcOne[+0x90..0xa8)` = fields from OZSimStateArray-level fields
 *               (rdi = -0x48(%rbp), the srcArr+0x18 base which holds an aux blob)
 *             - `srcOne[+0xa8..0xc0)` = per-elem fields at r15 offsets 0xb0..0xc0.
 *        d. Copy fields from `dstArr[i]` into `dstOne` (@0x1dbacf..0x1dbb96) — same shape
 *           as (c) but reading from `rax` (the dstArr-element pointer) instead of `r15`.
 *        e. Dispatch through the scalar handleCollisions vtable slot:
 *              this->main_vtable[+0x2e0](this, transformNode, srcOne, dstOne,
 *                                        savedBool, savedOutHitFlagPtr)
 *           (@0x1dbbb4 callq *0x2e0(%rax)). In the base class this lands on
 *           `handleCollisions_scalar` above (the no-op); concrete subclasses provide the
 *           physics.
 *        f. Copy `srcOne` back into `srcArr[i]` (@0x1dbbba..0x1dbbfe) — the mutation of
 *           the src particle state is the only thing the caller sees change (dst is used
 *           for read-only comparison; the flag output is aggregated in outHitFlag).
 *
 * FRONTIER — 192-line marshalling loop with three opaque struct layouts (OZSimStateArray,
 * OZSimulationState, and the auxiliary blob at srcArr+0x18). A faithful transcription
 * requires those three layouts to be recovered (from their own ctors/accessors) so each
 * field-copy can be named rather than expressed as raw byte offsets. Deferred as a
 * throw-stub citing the array dispatcher's @0xADDR.
 *
 * NOTE: This is NOT the "class math" — this is the outer marshalling loop. Any actual
 * collision math (in subclasses) lives in the scalar handleCollisions override, which
 * is polymorphically invoked via vtable slot +0x2e0 (documented above).
 */
export function OZCollisionBehavior_handleCollisions_array(
  _state: OZCollisionBehaviorState,
  _transformNode: unknown,
  _srcArr: unknown,
  _dstArr: unknown,
  _someFlag: boolean,
  _outHitFlag: { value: boolean },
): void {
  throw new Error(
    "OZCollisionBehavior::handleCollisions(array) @Ozone 0x1db870 not yet transcribed — " +
      "192-line marshalling loop over OZSimStateArray (opaque struct layouts for " +
      "OZSimStateArray/OZSimulationState/aux-blob@+0x18); dispatches through vtable " +
      "slot +0x2e0 per element; ports jointly with those three struct layouts.",
  );
}

// ---------------------------------------------------------------------------
// Frontier callee stubs — each throw cites its own @0xADDR on the same line.
// ---------------------------------------------------------------------------

/** OZReflexiveBehavior::OZReflexiveBehavior(OZFactory*, PCString const&, unsigned int).
 *  Called by C1 @0x1db659 and C2 @0x1db609. */
function OZReflexiveBehavior_ctor_C2_factory__stub(_f: unknown, _n: unknown, _flags: number): unknown {
  throw new Error(
    "OZReflexiveBehavior::OZReflexiveBehavior(OZFactory*,PCString,uint) @Ozone (call-site 0x1db659) not yet transcribed",
  );
}
/** OZReflexiveBehavior::OZReflexiveBehavior(OZReflexiveBehavior&, unsigned int).
 *  Called by copy-C1 @0x1db6f9 and copy-C2 @0x1db6a9. */
function OZReflexiveBehavior_ctor_C2_copy__stub(_other: unknown, _flags: number): unknown {
  throw new Error(
    "OZReflexiveBehavior::OZReflexiveBehavior(OZReflexiveBehavior&,uint) @Ozone (call-site 0x1db6f9) not yet transcribed",
  );
}
/** OZReflexiveBehavior::~OZReflexiveBehavior(). Called by every OZCollisionBehavior dtor
 *  (D2 @0x1db745, D1 @0x1db755, D0 @0x1db7a9, plus the 6 MI thunks). */
function OZReflexiveBehavior_dtor_D2__stub(_base: unknown): void {
  throw new Error("OZReflexiveBehavior::~OZReflexiveBehavior() @Ozone (call-site 0x1db7a9) not yet transcribed");
}
/** OZReflexiveBehavior::operator=(OZBehavior const&). Called by operator= @0x1db855. */
function OZReflexiveBehavior_operator_assign__stub(_base: unknown, _rhs: OZBehavior): void {
  throw new Error("OZReflexiveBehavior::operator=(OZBehavior const&) @Ozone (call-site 0x1db855) not yet transcribed");
}
/** ::operator delete(void*) via __ZdlPv symbol stub. Called by D0 tail-jmp @0x1db7b7 (and
 *  the three MI D0 thunks at 0x1db7de / 0x1db80e / 0x1db841). */
function operator_delete__stub(_p: unknown): void {
  throw new Error("::operator delete(void*) [__ZdlPv] @Ozone (call-site 0x1db7b7) not yet transcribed");
}
