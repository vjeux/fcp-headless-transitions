// PCShared_base.ts — ProCore "shared_ptr control block base" that PCSharedCount
// and PC_Sp_counted_base_impl both derive from. Faithful transcription of the
// three exported entry points in ProCore.framework:
//
//   @0x0000000000022798  PCShared_base::dispose()                [__ZN13PCShared_base7disposeEv]
//   @0x00000000000227aa  PCShared_base::~PCShared_base()  D1     [__ZN13PCShared_baseD1Ev]
//   @0x00000000000227c2  PCShared_base::~PCShared_base()  D0     [__ZN13PCShared_baseD0Ev]
//
// Related symbols (frontier / not ported here) that also live in ProCore:
//   __ZN13PCSharedCountC2EP13PCShared_base           PCSharedCount::PCSharedCount(PCShared_base*)
//   __ZN23PC_Sp_counted_base_implC2EP13PCShared_base PC_Sp_counted_base_impl::PC_Sp_counted_base_impl(PCShared_base*)
// — both take a `PCShared_base*` as an argument, which confirms PCShared_base is
// the abstract root of ProCore's shared-pointer control-block hierarchy.
//
// VTABLE (via `resolve.py ProCore vtable PCShared_base` —
//   __ZTV13PCShared_base @0x1494a0; installed ptr = 0x1494b0):
//   *0x00 -> 0x000227aa  PCShared_base::~PCShared_base()  D1
//   *0x08 -> 0x000227c2  PCShared_base::~PCShared_base()  D0
//   *0x10 -> 0x00022798  PCShared_base::dispose()
//   *0x18 -> 0x0         (nul slot — end of PCShared_base's own vtable body)
//   *0x20..              typeinfo for PCByteWriteScope + PCByteWriteStream vslots
//                        (subsequent bytes belong to the NEXT class's vtable in
//                        the RVA-adjacent __DATA_CONST slice; NOT part of PCShared_base).
//
// So PCShared_base has EXACTLY 3 virtual slots: {~D1, ~D0, dispose}.
//
// STRUCT LAYOUT (recovered from the three method bodies):
//
//     +0x00  vtable pointer                                 D1 @0x000227ae..@0x000227b5 (`leaq 0x126cfb(%rip), %rax ; movq %rax, (%rdi)`)
//                                                            D0 @0x000227cb..@0x000227d2 (`leaq 0x126cde(%rip), %rax ; movq %rax, (%rdi)`)
//                                                            Both leaq targets resolve to the installed
//                                                            vtable pointer 0x1494b0 (== __ZTV13PCShared_base + 0x10).
//                                                            The dtor rewrites the vptr to *this class*'s
//                                                            vtable — standard Itanium ABI ensuring virtual
//                                                            calls from the dtor body dispatch to PCShared_base's
//                                                            own slots even after subclass dtors already ran.
//     +0x08  PCWeakCount base subobject                      D1 @0x000227b8 (`addq $0x8, %rdi`) + tail-jmp to
//                                                            __ZN11PCWeakCountD2Ev @0x000227bd.
//                                                            D0 @0x000227d5 (`addq $0x8, %rdi`) + call to same.
//                                                            PCWeakCount lives at +0x08; PCShared_base
//                                                            derives from it (or contains it as a subobject).
//
// sizeof(PCShared_base) is NOT fully determined by these three methods alone
// (there is no ctor decoded here and no fields beyond the vptr and the
// PCWeakCount subobject are touched). It is >= 0x8 + sizeof(PCWeakCount).
//
// METHOD BODIES (byte-for-byte):
//
// dispose() — @0x00022798 (3 slots, one virtual dispatch):
//   @0x0002279c  testq %rdi, %rdi
//   @0x0002279f  je    0x227a8                                 ; if (this == nullptr) return
//   @0x000227a1  movq  (%rdi), %rax                            ; %rax = this->vptr
//   @0x000227a4  popq  %rbp
//   @0x000227a5  jmpq  *0x8(%rax)                              ; tail-call vtable[+0x8] = D0
//   @0x000227a8  popq  %rbp
//   @0x000227a9  retq
//
// The virtual dispatch through slot +0x8 is the D0 (deleting) dtor — for
// PCShared_base itself that's the method just below at @0x000227c2, but for
// subclasses (PCSharedCount, PC_Sp_counted_base_impl) it dispatches to their
// own D0 override. This is the classic C++ "virtual delete via base pointer"
// pattern implemented as an EXTRA method (rather than the caller doing
// `delete p;`) — the caller invokes `p->dispose()` and the object polymorphically
// deletes itself. The null-guard @0x2279c handles the "already null" case
// safely (a common pattern for release-once idioms).
//
// ~PCShared_base() D1 — @0x000227aa:
//   @0x000227ae..@0x000227b5  install this-class vptr at +0x00 (Itanium ABI).
//   @0x000227b8  addq  $0x8, %rdi                              ; %rdi = &this->PCWeakCount_base (+0x8)
//   @0x000227bd  jmp   __ZN11PCWeakCountD2Ev                   ; tail-call PCWeakCount::~PCWeakCount() D2
//
// ~PCShared_base() D0 — @0x000227c2:
//   @0x000227cb..@0x000227d2  install this-class vptr at +0x00 (Itanium ABI, same target as D1).
//   @0x000227d5  addq  $0x8, %rdi                              ; %rdi = &this->PCWeakCount_base (+0x8)
//   @0x000227d9  callq __ZN11PCWeakCountD2Ev                   ; PCWeakCount::~PCWeakCount() D2
//   @0x000227de  movq  %rbx, %rdi                              ; %rdi = this (restored)
//   @0x000227e7  jmp   __ZdlPv                                 ; tail-jmp operator delete(this)
//
// UNDECODED CALLEES (throwing stubs per PORTING_SPEC.md Rule 3):
//   - PCWeakCount::~PCWeakCount() D2         @ProCore __ZN11PCWeakCountD2Ev
//                                                     (call sites: D1 tail-jmp @0x000227bd,
//                                                                  D0 call     @0x000227d9)
//     PCWeakCount is a frontier ProCore class (weak-refcount base subobject at +0x08).
//     Not yet ported.
//   - operator delete(void*) __ZdlPv         @ProCore stub 0xde6c0 (call site @0x000227e7)
//     Not modeled in TS (GC'd); the raising stub keeps the call site cited.
//
// FRONTIER (subclasses whose ctors we can already see reference PCShared_base):
//   - PCSharedCount            (__ZN13PCSharedCountC2EP13PCShared_base)
//   - PC_Sp_counted_base_impl  (__ZN23PC_Sp_counted_base_implC2EP13PCShared_base)
// These will be handled by their own port tasks.

// ─────────────────────────────────────────────────────────────────────────────
// Frontier stubs (Rule 3 — cite every undecoded callee)
// ─────────────────────────────────────────────────────────────────────────────

/** Opaque holder for the PCWeakCount base subobject at PCShared_base +0x08.
 *  Not yet ported. Modeled as an unnamed handle to preserve struct identity. */
export type PCWeakCountBase = { readonly __pcWeakCountBaseTag: "PCWeakCount" };

/** PCWeakCount::~PCWeakCount() D2 — @ProCore U-import __ZN11PCWeakCountD2Ev
 *  (call sites: PCShared_base::~D1 tail-jmp @0x000227bd; PCShared_base::~D0 call @0x000227d9).
 *  Not yet transcribed. */
function PCWeakCount_dtor(_baseSubobj: PCWeakCountBase): void {
  throw new Error(
    "PCWeakCount::~PCWeakCount() D2 @ProCore U-import __ZN11PCWeakCountD2Ev (call sites: PCShared_base D1 tail-jmp @0x000227bd, D0 @0x000227d9) not yet transcribed",
  );
}

/** operator delete(void*) — @ProCore stub 0xde6c0 (__ZdlPv). Tail-jumped from
 *  PCShared_base::~D0 @0x000227e7. Not modeled in TS (JS is GC'd). */
function operator_delete(_p: PCShared_base): void {
  throw new Error(
    "operator delete (__ZdlPv) @ProCore stub 0xde6c0 (call site PCShared_base::~D0 @0x000227e7) not modeled in TS (GC'd)",
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PCShared_base — abstract base of ProCore's shared-pointer control blocks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * PCShared_base — polymorphic base with EXACTLY three virtual slots:
 *   *0x00  ~D1
 *   *0x08  ~D0
 *   *0x10  dispose()
 *
 * Contains a PCWeakCount base subobject at +0x08. Subclasses (PCSharedCount,
 * PC_Sp_counted_base_impl) override the three virtual slots and are constructed
 * with a `PCShared_base*` argument (per the exported ctor signatures at
 * __ZN13PCSharedCountC2EP13PCShared_base and __ZN23PC_Sp_counted_base_implC2EP13PCShared_base).
 *
 * Because subclasses override these virtual slots, in TS we expose the three
 * methods as `overridable` (protected on the class, but callable via
 * `disposeVirtual()` / `dtorD1Virtual()` / `dtorD0Virtual()` which subclasses
 * shadow). PCShared_base's own bodies below are the DEFAULT implementations
 * that the base-class vtable installs — exactly what the asm at
 * @0x00022798..@0x000227e7 emits.
 */
export class PCShared_base {
  /** (+0x08) PCWeakCount base subobject. Constructed by whoever creates a
   *  PCShared_base (no ctor at these addresses, so we accept the subobject
   *  as a construction parameter — matching the "PCSharedCount ctor takes a
   *  PCShared_base*" pattern where subclasses receive the base and forward it). */
  readonly _pcWeakCountBase: PCWeakCountBase;

  constructor(pcWeakCountBase: PCWeakCountBase) {
    // No PCShared_base::PCShared_base() symbol is exported in ProCore — the
    // three dtor/dispose bodies decoded here are the only observable surface.
    // We therefore accept the pre-constructed base as a parameter (mirroring
    // the pattern used by all the raw-port classes with undecoded ctors).
    this._pcWeakCountBase = pcWeakCountBase;
  }

  /**
   * PCShared_base::dispose() — @0x00022798  [__ZN13PCShared_base7disposeEv]
   *
   * Mirrors the asm byte-for-byte:
   *   @0x0002279c  testq %rdi, %rdi                    ; if (this == nullptr)
   *   @0x0002279f  je    0x227a8                        ;   goto empty-return
   *   @0x000227a1  movq  (%rdi), %rax                   ; %rax = this->vptr
   *   @0x000227a5  jmpq  *0x8(%rax)                     ; tail-call vtable[+0x8] (D0)
   *   @0x000227a8..@0x000227a9  popq %rbp / retq        ; empty return
   *
   * Semantics: "polymorphic delete" — the caller says `p->dispose()` and the
   * object destroys itself through the D0 slot in its own vtable. TS models
   * this by dispatching to the class's `__dtor_D0()` method; subclasses that
   * override `__dtor_D0` will get their override called, matching the virtual
   * dispatch through vslot +0x8.
   *
   * The `null` case is handled in a JS-friendly way at the call site — this
   * method is exposed as a static `dispose(instance)` helper so a null
   * argument behaves like the `testq %rdi,%rdi ; je` early-out at @0x0002279c.
   */
  static dispose(instance: PCShared_base | null): void {
    // @0x0002279c..@0x0002279f — null guard.
    if (instance === null) {
      // @0x000227a8..@0x000227a9 — empty return.
      return;
    }
    // @0x000227a5 — virtual dispatch through slot +0x8 (D0 / deleting dtor).
    // In TS the "virtual" dispatch is the plain method call: JS method
    // resolution picks the subclass override if any.
    instance.__dtor_D0();
  }

  /**
   * PCShared_base::~PCShared_base() D1 — @0x000227aa  [__ZN13PCShared_baseD1Ev]
   *
   * Mirrors the asm:
   *   @0x000227ae..@0x000227b5  install this-class vptr at +0x00 (installed ptr
   *                             = __ZTV13PCShared_base + 0x10 = 0x1494b0).
   *                             No TS analogue — TS has no vptr.
   *   @0x000227b8  addq $0x8, %rdi                     ; %rdi = &PCWeakCount_base (+0x8)
   *   @0x000227bd  jmp  __ZN11PCWeakCountD2Ev          ; tail-call PCWeakCount::~D2
   *
   * TS: raise on the PCWeakCount stub per Rule 3 (call site cited).
   */
  __dtor_D1(): void {
    // @0x000227ae..@0x000227b5 — vptr reinstall. No TS analogue.
    // @0x000227b8..@0x000227bd — tail-jmp PCWeakCount::~D2 on `this+0x8`.
    PCWeakCount_dtor(this._pcWeakCountBase);
  }

  /**
   * PCShared_base::~PCShared_base() D0 — @0x000227c2  [__ZN13PCShared_baseD0Ev]
   *
   * Mirrors the asm:
   *   @0x000227cb..@0x000227d2  install this-class vptr at +0x00 (same installed
   *                             ptr as D1 — 0x1494b0). No TS analogue.
   *   @0x000227d5  addq $0x8, %rdi                     ; %rdi = &PCWeakCount_base (+0x8)
   *   @0x000227d9  callq __ZN11PCWeakCountD2Ev         ; PCWeakCount::~D2 on `this+0x8`
   *   @0x000227de  movq  %rbx, %rdi                    ; %rdi = this (restored)
   *   @0x000227e7  jmp   __ZdlPv                       ; tail-jmp operator delete(this)
   *
   * Same PCWeakCount teardown as D1, then tail-jmp to `operator delete`.
   * The operator_delete stub raises per Rule 3 (TS is GC'd).
   */
  __dtor_D0(): void {
    // @0x000227cb..@0x000227d2 — vptr reinstall. No TS analogue.
    // @0x000227d9 — PCWeakCount::~D2 on `this+0x8`.
    PCWeakCount_dtor(this._pcWeakCountBase);
    // @0x000227e7 — tail-jmp to operator delete(this). Not modeled in TS;
    // the raising stub keeps the call site cited.
    operator_delete(this);
  }
}
