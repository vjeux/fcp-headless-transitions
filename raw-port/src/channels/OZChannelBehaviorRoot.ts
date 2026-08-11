// OZChannelBehaviorRoot.ts — raw transcription of Ozone `OZChannelBehaviorRoot`.
//
// `OZChannelBehaviorRoot` is the channel-tree node that owns a behavior: the
// root a behavior's parameter channels hang off. ONE method is transcribed in
// this file: `setBehavior`. Its siblings (the four ctor pairs, the dtors,
// operator=/operator==, reset, compare) are NOT ported here; do not add them
// without their own disassembly and address citations.
//
// Provenance (Ozone framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Symbol ported in this file:
//   @0x2137a0  OZChannelBehaviorRoot::setBehavior(OZBehavior*)
//                __ZN21OZChannelBehaviorRoot11setBehaviorEP10OZBehavior
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym __ZN21OZChannelBehaviorRoot11setBehaviorEP10OZBehavior Ozone`):
//   raw-port/re/disasm/__ZN21OZChannelBehaviorRoot11setBehaviorEP10OZBehavior.s (11 lines)
//
// ---------------------------------------------------------------------------
// WHAT THE FUNCTION IS
// ---------------------------------------------------------------------------
// A two-slot setter. It stores the incoming `OZBehavior*` verbatim at +0x100
// (this class's own field) AND stores a THIS-ADJUSTED copy of it — `behavior +
// 0x10`, null-preserving — into the inherited slot at +0xd0. That is the
// canonical compiled form of a C++ upcast to a base class whose subobject sits
// at byte +0x10 of the derived object: `leaq 0x10(%rsi),%rax` computes the base
// address, and `testq %rsi,%rsi ; cmoveq %rsi,%rax` reproduces the language
// rule that a null pointer stays null instead of becoming 0x10.
//
// ---------------------------------------------------------------------------
// LAYOUT + WHY +0x10 (read as evidence, NOT transcribed — each cited method is
// its own ledger unit):
//
//   struct OZChannelBehaviorRoot : OZChannelObjectRoot {
//     ...                                   // +0x000..+0x0cf inherited
//     <base-subobject ptr>  objectAt0xd0;    // +0xd0  written @0x2137b6
//     ...                                   // +0xd8..+0x0ff inherited
//     OZBehavior*           behavior;        // +0x100 written @0x2137a4
//   };
//
//   * The ctor `OZChannelBehaviorRoot(OZFactory*, PCString const&, unsigned)`
//     [C2] @0x2134d0 chains to `OZChannelObjectRoot::OZChannelObjectRoot`
//     @0x2134d9, installs a PRIMARY vtable at +0x00 (@0x2134e5) and a SECONDARY
//     vtable at +0x10 (@0x2134ef) — the multiple-inheritance signature — and
//     then zeroes exactly one field: `movq $0x0,0x100(%rbx)` @0x2134f3. So
//     +0x100 is this class's own behavior slot and its "empty" value is NULL.
//   * `OZChannelBehaviorRoot::reset(bool)` @0x213690 reads the behavior back
//     from the SAME +0x100 slot (@0x21369d and again @0x2136be), null-checks it
//     (`testq %rdi,%rdi ; je`), and dispatches two virtual calls through it
//     (`callq *0x1e0(%rax)` @0x2136ac, `jmpq *0x1d8(%rax)` @0x2136d1) — i.e.
//     +0x100 holds the OZBehavior's PRIMARY (vtable-at-+0x00) pointer, exactly
//     the value handed to this setter.
//   * The +0x10 delta the setter applies to the OTHER slot is the same +0x10 at
//     which the ctor installs the secondary vtable: the OZBehavior a behavior
//     root is given is itself a multiply-inheriting object, and +0xd0 wants the
//     base subobject that begins at its +0x10.
//
// ---------------------------------------------------------------------------
// CALLEES: none. No in-scope call, no extern, no allocation, no indirect or
// virtual dispatch (`depgraph.py deps` lists nothing).

/**
 * An `OZBehavior*` as this method sees it: an opaque identity. `OZBehavior` is
 * a separate ledger unit (only free-function fragments exist so far, in
 * raw-port/src/channels/OZBehavior.m1.ts), and this body never dereferences the
 * pointer — it only tests it against NULL and stores it — so modelling it as an
 * opaque reference is exactly what the machine does here.
 *
 * @Ozone 0x2137a0
 */
export type OZBehaviorRef = object;

/**
 * The fields of `OZChannelBehaviorRoot` that this method writes.
 *
 * @Ozone 0x2137a0
 */
export interface OZChannelBehaviorRootState {
  /**
   * +0x100 — the behavior pointer, stored verbatim
   * (`movq %rsi,0x100(%rdi)` @0x2137a4). NULL when unset (the ctor's
   * `movq $0x0,0x100(%rbx)` @0x2134f3).
   */
  behavior: OZBehaviorRef | null;

  /**
   * +0xd0 — the inherited slot that receives the THIS-ADJUSTED pointer
   * `behavior + 0x10` (`leaq 0x10(%rsi),%rax` @0x2137ab, stored @0x2137b6), or
   * NULL when `behavior` is NULL (`cmoveq` @0x2137b2).
   *
   * TypeScript has no interior pointers, so the port stores the SAME
   * `OZBehaviorRef` and records the adjustment here rather than materialising a
   * fake address: `behavior + 0x10` is a pure function of `behavior`, so the
   * two representations carry identical information (including null-ness and
   * pointer identity). A future unit that READS this slot must remember that
   * the machine's value points at the base subobject beginning at byte +0x10 of
   * the object — it is NOT the same pointer value as `behavior`, even though it
   * denotes the same object.
   */
  objectAt0xd0: OZBehaviorRef | null;
}

/**
 * `OZChannelBehaviorRoot::setBehavior(OZBehavior* behavior)`
 *   — @Ozone 0x2137a0
 *   — __ZN21OZChannelBehaviorRoot11setBehaviorEP10OZBehavior
 *
 * Stores `behavior` at +0x100 and its +0x10 base-subobject upcast at +0xd0.
 *
 * Full transcription — every instruction, in order:
 *
 *   0x2137a0  pushq  %rbp                 ; frame setup (no TS counterpart)
 *   0x2137a1  movq   %rsp,%rbp            ; frame setup (no TS counterpart)
 *   0x2137a4  movq   %rsi,0x100(%rdi)     ; this->behavior = behavior
 *   0x2137ab  leaq   0x10(%rsi),%rax      ; rax = behavior + 0x10  (unconditional)
 *   0x2137af  testq  %rsi,%rsi            ; flags on behavior
 *   0x2137b2  cmoveq %rsi,%rax            ; if (behavior == NULL) rax = NULL
 *   0x2137b6  movq   %rax,0xd0(%rdi)      ; this->objectAt0xd0 = rax
 *   0x2137bd  popq   %rbp                 ; frame teardown (no TS counterpart)
 *   0x2137be  retq
 *   0x2137bf  nop                         ; alignment padding, not executed
 *
 * Decode notes:
 *   * the `leaq` is computed BEFORE the test and unconditionally — `leaq` sets
 *     no flags and never faults, so the null case is handled purely by the
 *     `cmoveq` that overwrites it. The port's conditional expression is the
 *     same two-valued selection.
 *   * `testq %rsi,%rsi ; cmoveq` is the standard null-preserving upcast: a null
 *     `OZBehavior*` must stay null rather than become 0x10.
 *   * the +0x100 store happens FIRST and is unconditional; the order is
 *     preserved below. Nothing else on the instance is touched, and there is no
 *     return value.
 *   * no virtual dispatch, no call: the OZBehavior is never dereferenced here
 *     (its vtable IS read by the sibling `reset(bool)` @0x213690, a separate
 *     unit).
 *
 * @param self     — the `OZChannelBehaviorRoot` instance (`%rdi`).
 * @param behavior — the `OZBehavior*` (`%rsi`), possibly NULL.
 */
export function OZChannelBehaviorRoot_setBehavior(
  self: OZChannelBehaviorRootState,
  behavior: OZBehaviorRef | null,
): void {
  // @0x2137a4  movq %rsi,0x100(%rdi) — stored verbatim, unconditionally.
  self.behavior = behavior;

  // @0x2137ab-0x2137b2  leaq 0x10(%rsi),%rax ; testq %rsi,%rsi ; cmoveq %rsi,%rax
  //   — the +0x10 base-subobject upcast, null-preserving. See the field's
  //   docblock for why the adjustment is documented rather than materialised.
  // @0x2137b6  movq %rax,0xd0(%rdi)
  self.objectAt0xd0 = behavior === null ? null : behavior;
}
