// HGTexturePaddingPolicy.ts — raw transcription of Helium `HGTexturePaddingPolicy`.
//
// Provenance (Helium framework, x86_64 slice):
//   ctor  HGTexturePaddingPolicy::HGTexturePaddingPolicy()  @0x43e20  (C2 == C1, no C1 emitted)
//   D2    HGTexturePaddingPolicy::~HGTexturePaddingPolicy() @0x43e40  (base object dtor)
//   D1    HGTexturePaddingPolicy::~HGTexturePaddingPolicy() @0x3c1690 (`ud2` trap — unreachable)
//   D0    HGTexturePaddingPolicy::~HGTexturePaddingPolicy() @0x3c16a0 (`ud2` trap — unreachable)
//
// Class layout (from ctor + vtable dump via resolve.py Helium vtable HGTexturePaddingPolicy):
//   vtable-for HGTexturePaddingPolicy @0xa07488
//   installed-ptr (stored into `(this)` by ctor)  @0xa07498  (== vtable + 0x10)
//   slot *0x08 -> HGTexturePaddingPolicy::~HGTexturePaddingPolicy() @0x3c16a0
//   base class: HGObject (only field: the vptr at offset 0). No additional data members
//   are written by the ctor beyond the vptr store, so this class is a pure policy object
//   (behavior lives entirely in virtual overrides — none of which appear beyond D0 here).
//
// The ctor body @0x43e20 is verbatim:
//   pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
//   movq %rdi, %rbx                          # save `this`
//   callq __ZN8HGObjectC2Ev                  # HGObject::HGObject(this)  @callee cited
//   leaq 0x9c3663(%rip), %rax                # rax = &vtable+0x10 = 0xa07498 (installed-ptr)
//   movq %rax, (%rbx)                        # this->vptr = 0xa07498
//   addq $0x8, %rsp / popq %rbx / popq %rbp / retq
//
// The D2 body @0x43e40 is verbatim:
//   pushq %rbp / movq %rsp,%rbp / popq %rbp
//   jmp __ZN8HGObjectD2Ev                    # tail-call HGObject::~HGObject()
//
// D1 @0x3c1690 and D0 @0x3c16a0 both consist of `pushq %rbp; movq %rsp,%rbp; ud2` — a
// deliberate compiler-emitted trap indicating these variants are never called at runtime
// (likely dead-stripped-but-referenced by RTTI / typeinfo). Any port-side invocation of
// them is a bug and MUST throw. HGObject itself is an undecoded frontier @Helium 0x710c2
// (see render/HGObject_stub.ts) so we route ctor/D2 through those throwing stubs; that is
// the correct signal — the base class is not yet available in the port.
//
// Callee/const/vtable citations (all via raw-port/army/tools/resolve.py Helium):
//   sym  0x43e29 -> HGObject::HGObject() (+0x9 into HGTexturePaddingPolicy::C2)
//   sym  0x43e2e -> RIP-relative load of the installed-ptr constant @0xa07498
//   sym  0x43e45 -> tail-jmp to HGObject::~HGObject()
//   vtable HGTexturePaddingPolicy -> single entry *0x08 = D0 @0x3c16a0

import { HGObject_ctor, HGObject_dtor } from "./HGObject_stub";

/** Installed vtable pointer for HGTexturePaddingPolicy (Helium @0xa07498). */
export const HG_TEXTURE_PADDING_POLICY_VPTR = 0xa07498;

/**
 * HGTexturePaddingPolicy — policy base class, HGObject-derived.
 *
 * From Helium the class has no data members of its own beyond the vptr. All
 * differentiating behavior would live in virtual method overrides on subclasses;
 * within HGTexturePaddingPolicy itself the vtable exposes only the destructor,
 * so this base implementation is intentionally featureless.
 */
export class HGTexturePaddingPolicy {
  /** Virtual-table pointer store — set by the ctor per @0x43e35. */
  vptr: number = 0;

  /**
   * ctor — Helium @0x43e20 (HGTexturePaddingPolicy::HGTexturePaddingPolicy).
   *
   * Mirrors asm exactly:
   *   1. HGObject::HGObject(this)   @callq 0x43e29
   *   2. this->vptr = 0xa07498      @0x43e35 (leaq+movq)
   */
  constructor() {
    HGObject_ctor(this);                        // @0x43e29 callq HGObject::HGObject
    this.vptr = HG_TEXTURE_PADDING_POLICY_VPTR; // @0x43e35 movq %rax, (%rbx)
  }

  /**
   * D2 — Helium @0x43e40 (HGTexturePaddingPolicy::~HGTexturePaddingPolicy, base object dtor).
   *
   * Tail-calls HGObject::~HGObject(this) @0x43e45 (jmp __ZN8HGObjectD2Ev). Nothing else.
   * HGObject is an undecoded frontier @Helium 0x711cc, so the call surface routes through the throwing stub.
   */
  destroy(): void {
    HGObject_dtor(this); // @0x43e45 jmp HGObject::~HGObject()
  }
}

/**
 * D1 — Helium @0x3c1690.
 *
 * Body is `pushq %rbp; movq %rsp,%rbp; ud2` — a compiler-emitted trap. Never reached at
 * runtime; any invocation is a bug. Keeping this here so the ABI edge is explicit and
 * cited rather than silently absent.
 */
export function HGTexturePaddingPolicy_D1(_self: HGTexturePaddingPolicy): never {
  throw new Error(
    "HGTexturePaddingPolicy::~HGTexturePaddingPolicy [D1] is a `ud2` trap @Helium 0x3c1690 (unreachable)"
  );
}

/**
 * D0 — Helium @0x3c16a0.
 *
 * Slot *0x08 of the vtable @0xa07488. Body is `pushq %rbp; movq %rsp,%rbp; ud2` — trap.
 * Same story as D1: any call is a bug.
 */
export function HGTexturePaddingPolicy_D0(_self: HGTexturePaddingPolicy): never {
  throw new Error(
    "HGTexturePaddingPolicy::~HGTexturePaddingPolicy [D0, vtable *0x08] is a `ud2` trap @Helium 0x3c16a0 (unreachable)"
  );
}
