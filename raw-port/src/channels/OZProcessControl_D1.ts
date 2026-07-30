// OZProcessControl_D1.ts — port of the D1 base destructor of OZProcessControl.
//
// Faithful transcription from Ozone symbol
//   __ZN16OZProcessControlD1Ev   (OZProcessControl::~OZProcessControl())
//   @Ozone 0x1b09e0
// (see raw-port/re/disasm/__ZN16OZProcessControlD1Ev.s)
//
// FULL DISASSEMBLY (13 lines, 12 body instructions):
//
//   0x1b09e0  pushq %rbp
//   0x1b09e1  movq  %rsp, %rbp
//   0x1b09e4  leaq  0x690b15(%rip), %rax        ; rax = &OZProcessControl_vtable+0x10 @0x841500
//   0x1b09eb  movq  %rax, (%rdi)                ; this->__vptr = &vtable+0x10
//                                               ;   (standard C++ vptr-during-dtor idiom:
//                                               ;    RTTI/virtual-dispatch identity in ~T is T)
//   0x1b09ee  movq  0x18(%rdi), %rdi            ; rdi = this->child_at0x18 (the owned member)
//   0x1b09f2  testq %rdi, %rdi                  ; if (child == null)
//   0x1b09f5  je    0x1b09fe                    ;   goto epilogue (return)
//   0x1b09f7  movq  (%rdi), %rax                ; rax = child->__vptr
//   0x1b09fa  popq  %rbp
//   0x1b09fb  jmpq  *0x8(%rax)                  ; tail-call child->__vptr[+0x8]
//                                               ;   = child's D0 deleting-destructor (vslot +0x08).
//                                               ;   This is a VIRTUAL-DISPATCH indirect call —
//                                               ;   the depgraph flags it as `indirect:0` because
//                                               ;   `child` is an opaque runtime-owned OZChannel*
//                                               ;   whose concrete subtype is not pinnable at
//                                               ;   the vtable-analysis layer.
//   0x1b09fe  popq  %rbp                        ; null-child fast-path epilogue
//   0x1b09ff  retq
//
// SEMANTICS: standard Itanium C++ ABI D1 (base-object destructor) for
// OZProcessControl. It (1) rewrites the this-vptr to OZProcessControl's own
// vtable so any virtual call fired mid-destruction resolves to the base-most
// impl, then (2) virtually destroys the owned child at +0x18 via its D0
// deleting-destructor (vtable slot +0x8) — which in the C++ ABI is exactly
// what `delete this->m_child;` compiles to when m_child is a base pointer.
// Empty null-check fast-path skips the virtual-delete when child is null.
//
// NOTE ON D1 vs D2 vs D0 (Itanium C++ ABI):
//   D2 (base object dtor)      — destroys this + non-virtual bases only.
//   D1 (complete object dtor)  — same as D2 for a class with no virtual bases.
//   D0 (deleting dtor)         — runs D1 then calls `operator delete(this)`.
// OZProcessControl has NO virtual bases, so its D1 body is BYTE-IDENTICAL to
// its D2 body @Ozone 0x1b09c0 (leaq 0x690b35 -> 0x841500, one slot different
// only because the vtable slot's own address moves 0x20 higher for D2's
// leaq site). Both encode the same three steps: vptr fix-up, child virtual
// dtor, return. D0 wraps this and additionally frees the object.
//
// RUNTIME LAYOUT (recovered from this + peer symbols):
//   +0x00  __vptr           — written here (@0x1b09eb) to &vtable+0x10 = 0x841500.
//   +0x18  child_at0x18     — polymorphic owned pointer; virtually deleted here.
//   (other slots — abort/progress/renderer — are touched by peer symbols
//   OZProcessControl::abort/setProgressHandler/setHeliumRenderer, all in the
//   ledger as `todo`. This dtor never reads them, so we don't decode them.)
//
// FRONTIER CALLEES (all cited by @addr):
//   @0x1b09eb  vtable pointer const  = OZProcessControl_vtable_pointer_slot @Ozone 0x841500
//                                     (the primary-vtable slot pointing at the D1/D0 dtor pair;
//                                     leaq rip-relative delivers the address of the vslot base,
//                                     which is the value the vptr always holds — vtable + 0x10
//                                     past the RTTI+offset header).
//   @0x1b09fb  jmpq *0x8(%rax)       = child->__vptr[+0x08]  (virtual D0 on the owned child).
//                                     TRULY INDIRECT — the concrete subtype of `child` is
//                                     runtime-selected. Modelled as a boundary-throw stub
//                                     (`virtualDeleteChild_stub`) that fails loudly, per
//                                     Rule 3 (throw on undecoded, never approximate). This is
//                                     the same pattern OZProcessControlWrapper D0/D1/D2 use for
//                                     their own indirect frontier callees.

// ── Model of the runtime layout that D1 actually reads ──────────────────────────────────────

/**
 * The polymorphic child owned by OZProcessControl at +0x18. D1 only reads
 * `child->__vptr[+0x08]` (the D0 deleting-destructor slot) via a virtual
 * dispatch. Modelled as an opaque handle: peers that walk `child` will pin
 * its concrete type; here we just need something typed to keep the store
 * honest.
 */
export interface OZProcessControlChildRef {
  readonly __ozProcessControlChildRefBrand: unique symbol;
}

/**
 * Only the two fields THIS dtor touches, per byte offset. Additional slots
 * used by peer symbols (abort/setProgressHandler/setHeliumRenderer) are
 * left for those unit-owners to add.
 */
export interface OZProcessControlRuntime {
  /**
   * +0x00 __vptr — rewritten by D1 (@0x1b09eb) to `&OZProcessControl_vtable+0x10`
   *                = @Ozone 0x841500 (the standard "point vptr at own type
   *                during destruction" C++ ABI idiom).
   */
  __vptr_at_0x00: string;
  /**
   * +0x18 owned polymorphic child — virtually deleted by D1
   *   (@0x1b09fb `jmpq *0x8(%rax)` = call child->__vptr[+0x8] = child's D0).
   *   Nullable — @0x1b09f2..0x1b09f5 skips the dispatch when null.
   */
  child_at_0x18: OZProcessControlChildRef | null;
}

/**
 * @Ozone 0x1b09fb  `jmpq *0x8(%rax)` — virtual dispatch to `child->__vptr[+0x08]`,
 * the D0 (deleting) destructor of whatever concrete subtype `child` is.
 * TRULY INDIRECT: `child` is a polymorphic base pointer whose subtype is not
 * pinnable at this layer, so the target isn't resolvable to a single symbol.
 * Modelled as a throwing stub per Rule 3 — same pattern the already-ported
 * OZProcessControlWrapper D0/D1/D2 use for their indirect frontier calls.
 * A future unit that pins `child`'s concrete type will replace this call site
 * with a direct import of that D0.
 */
function virtualDeleteChild_stub(_child: OZProcessControlChildRef): void {
  throw new Error(
    "OZProcessControl::~OZProcessControl(): virtual child->__vptr[+0x8] (D0) @Ozone 0x1b09fb " +
      "not yet transcribed (polymorphic-child virtual delete; runtime subtype not pinned yet).",
  );
}

/**
 * OZProcessControl::~OZProcessControl() [D1 base-complete dtor]
 *   @Ozone 0x1b09e0  (`__ZN16OZProcessControlD1Ev`)
 *
 * Rewrites the this-vptr to OZProcessControl's own vtable, then virtually
 * destroys the polymorphic child at +0x18 via its D0 deleting-destructor
 * (vslot +0x08). Null-safe on the child. Byte-identical to D2 @0x1b09c0
 * except for the leaq immediate (both resolve to the same vtable slot).
 *
 * ZERO in-scope callees; ONE indirect virtual-delete extern (modelled as a
 * boundary throw-stub cited @0x1b09fb).
 */
export function OZProcessControl_D1(self: OZProcessControlRuntime): void {
  // @0x1b09e0..0x1b09e1  prologue (pushq rbp; movq rsp,rbp) — no observable effect.

  // @0x1b09e4  leaq 0x690b15(%rip), %rax    ; rax = &vtable+0x10 (RIP-relative from 0x1b09eb)
  //                                              = 0x1b09eb + 0x690b15 = @Ozone 0x841500.
  // @0x1b09eb  movq %rax, (%rdi)             ; this->__vptr = &vtable+0x10.
  //
  // The identity of the vptr string is arbitrary provided a matching symbol
  // is used consistently across ctor/dtor. OZProcessControlWrapper already
  // uses the "__ZTV...+0x10" convention (see peer file); we mirror it.
  self.__vptr_at_0x00 = "__ZTV16OZProcessControl+0x10";

  // @0x1b09ee  movq 0x18(%rdi), %rdi         ; rdi = this->child_at_0x18.
  const child = self.child_at_0x18;

  // @0x1b09f2  testq %rdi, %rdi
  // @0x1b09f5  je    0x1b09fe                ; if null -> straight to epilogue.
  if (child === null) {
    // @0x1b09fe..0x1b09ff  popq rbp; retq
    return;
  }

  // @0x1b09f7  movq (%rdi), %rax             ; rax = child->__vptr  (loads vptr for slot read below).
  // @0x1b09fa..0x1b09fb  popq rbp; jmpq *0x8(%rax)  ; tail-jmp child's D0 (vslot +0x08).
  //   Virtual dispatch — indirect, boundary-stubbed here.
  virtualDeleteChild_stub(child);
}
