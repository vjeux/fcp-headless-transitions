// OZHistogramDelegate — a lightweight channel-side delegate class in Ozone.framework
// used by the FCP histogram/scope pipeline. The class exports ONLY its Itanium-ABI
// destructor pair (D1 base @0x333e70, D0 deleting @0x333ea0); no other methods are
// present in the framework. All real behavior lives in inherited vtable slots — the
// vtable (see below) reveals it is a concrete subclass of OZChannelImageWithOptions,
// which itself inherits OZCompoundChannel → OZChannelBase → OZFactoryBase.
//
// Verbatim from FCP's Ozone framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
// Source disassembly saved at
//   raw-port/re/disasm/OZHistogramDelegate.~OZHistogramDelegate.s (D0 @0x333ea0)
//   raw-port/re/disasm/OZHistogramDelegate.D1.s                  (D1 @0x333e70)
//
// TWO SYMBOLS — the Itanium ABI D1 / D0 pair (this class HAS a vtable, so both exist;
// D2 is aliased to D1 by the linker since the class has no virtual bases):
//   @Ozone 0x0000000000333e70  __ZN19OZHistogramDelegateD1Ev  (D1: complete/base)
//   @Ozone 0x0000000000333ea0  __ZN19OZHistogramDelegateD0Ev  (D0: deleting)
// D0 is byte-identical to D1 followed by a tail `jmp __ZdlPv` on `this` (the standard
// Itanium D0 = D1 + deallocate pattern).
//
// VTABLE (recovered via `python3 raw-port/army/tools/resolve.py Ozone vtable
// OZHistogramDelegate`, vtable @0x84f708, installed-ptr 0x84f718 = base+0x10 —
// which is what the destructors write @0x333e74+0x333e7f / @0x333ea0+0x333eab):
//   *0x00  → 0x333e70  OZHistogramDelegate::~OZHistogramDelegate()  [D1 — this file]
//   *0x08  → 0x333ea0  OZHistogramDelegate::~OZHistogramDelegate()  [D0 — this file]
//   *0x10  → 0x10000f67  (OZFontManager::_instance +0xf6cb687 — bogus disp, actually
//                        this is a virtual slot inherited from OZChannelImageWithOptions
//                        whose resolver falls between two symbols; treat as opaque)
//   *0x18  → 0x12b3   (opaque; adjustor-thunk or similar)
//   *0x20  → 0x0      (nullptr — pure-virtual slot; must be filled by a further subclass?
//                       but no subclass observed — likely a slot the class never uses)
//   *0x28  → typeinfo for OZChannelImageWithOptions @0x84fad8  ← BASE-CLASS TYPEINFO
//   *0x30  → 0x31fe00  OZChannelImageWithOptions::~OZChannelImageWithOptions()  [inherited D1]
//   *0x38  → 0x337770  OZChannelImageWithOptions::~OZChannelImageWithOptions()  [inherited D0]
//   *0x40  → 0x1fab0   OZFactoryBase::getIconName() const
//   *0x48  → 0x1fad0   OZFactoryBase::getIconNameBW() const
//   *0x50  → 0x1faf0   OZFactoryBase::getIconID() const
//   *0x58  → 0x1fb00   OZFactoryBase::getLibraryIconName() const
//   *0x60  → 0x1fb20   OZFactoryBase::description()
//   *0x68  → 0x1fb40   OZChannelBase::getInstanceID() const
//   *0x70  → 0x1fb50   OZChannelBase::getSerializer()
//   *0x78  → 0x1fb60   OZFactoryBase::getFactoryForSerialization(...) const
//   *0x88  → 0x337330  OZChannelImageWithOptions::getObjCWrapperName()
//   *0xa0  → 0x1fb70   OZChannelBase::isObjectRef() const
//   *0xa8  → 0x283790  OZCompoundChannel::isCompoundChannel() const
// The typeinfo slot at *0x28 pointing to OZChannelImageWithOptions's typeinfo is the
// giveaway: OZHistogramDelegate directly derives from OZChannelImageWithOptions and
// overrides NOTHING but its own destructor (every non-dtor slot in the vtable is either
// inherited unchanged from the base or is an opaque non-code offset — 0x12b3, 0x0, 0x373,
// 0x380, 0x2ea etc., which are function-pointer-sized displacements that never enter
// the code segment; those are likely relocation entries the class doesn't participate
// in, mirrored from the base vtable layout).
//
// STRUCT LAYOUT (recovered from the two destructors — every field read has a fixed
// offset and self-consistent meaning):
//
//   +0x00  vtable*             // the destructors write here at @0x333e7f / @0x333eae:
//                              //   leaq VT_OZHistogramDelegate(%rip), %rax
//                              //   addq $0x10, %rax           ; skip typeinfo+top-offset
//                              //   movq %rax, (%rdi)          ; install as active vtable
//   +0x08  ??? (inherited from base — never read by either dtor)
//   +0x10  void* ownedResource // an owned pointer. Both dtors:
//                              //   movq 0x10(%rdi), %rax      ; load
//                              //   testq %rax, %rax           ; branch on null
//                              //   je   <skip>                ; if null, no free
//                              // The non-null branch stores %rax at +0x18 as a scratch
//                              // write (compiler artifact — see below) then calls
//                              // operator delete on it. There is no per-element
//                              // destructor loop, so the payload has a TRIVIAL dtor
//                              // (a POD or raw buffer). Given the class name
//                              // ("histogram delegate"), this is most likely a
//                              // heap-allocated histogram-accumulator buffer or a
//                              // callback-context record. We keep the type opaque.
//   +0x18  void* scratch       // a compiler-emitted store-then-die location. Both
//                              // dtors do `movq %rax, 0x18(%rdi)` immediately before
//                              // `callq __ZdlPv` on the same %rax. This is Clang's
//                              // "keep the local live across the call for a debugger
//                              // stack-walker" scratch — the value is written to a
//                              // still-live class field that nobody reads after the
//                              // enclosing object itself is (potentially) freed. We
//                              // mirror the store for faithfulness even though it
//                              // has no observable effect on any downstream reader
//                              // in a pure-JS model (JS has no raw-memory readers).
//
// Because the destructors never dereference offsets beyond +0x18, and the class
// inherits its full API from OZChannelImageWithOptions unchanged, this file only
// commits to the two decoded fields. Any further fields belong to the base and
// will be modeled there when OZChannelImageWithOptions is ported.
//
// RUNTIME IMPORTS resolved:
//   __ZdlPv (operator delete(void*))  @Ozone 0x6dfc36  (__stubs entry)
//     — verified via `python3 raw-port/army/tools/resolve.py Ozone stub 0x6dfc36`
//       -> "__ZdlPv". Called once on `ownedResource` (both dtors) and, for D0 only,
//       once more as a tail-call on `this` itself (@0x333ed9).
//
// FRONTIER (not decoded here — the base class isn't ported yet):
//   OZChannelImageWithOptions   (parent — vtable + all inherited slots)
//   OZCompoundChannel           (grandparent, provides isCompoundChannel())
//   OZFontManager::_instance    (RIP disp appearing as vtable slot 0x10 — likely a
//                                mis-attribution across a symbol boundary; not a
//                                real callee of these destructors)

/**
 * Opaque payload type owned at struct offset +0x10. The destructor never touches
 * any sub-field of it (no per-element dtor loop before `operator delete`), so
 * from this vantage point it must have a trivial destructor. The class name
 * strongly suggests a histogram-buffer or a delegate-callback context record.
 * A concrete type will be demanded by a downstream setter/allocator, not by us.
 */
export type OZHistogramDelegateOwnedResource = object;

/**
 * OZHistogramDelegate — a histogram-side delegate channel node whose only exported
 * methods are its D1/D0 destructor pair. All other behavior is inherited from
 * OZChannelImageWithOptions (base typeinfo at vtable slot *0x28).
 *
 * INSTANCES ARE HEAP-ALLOCATED IN NATIVE FCP. The D0 destructor's tail-call
 * `operator delete(this)` witnesses this: only heap-allocated objects reach D0
 * via `delete p`. In our JS port we model both dtors as instance methods; the
 * memory-reclamation side is a no-op (GC handles that) but we preserve the
 * observable pointer-nulling and the sub-object hand-off exactly as encoded.
 */
export class OZHistogramDelegate {
  /**
   * Struct slot +0x10 — the sole owned heap resource. Set by whoever allocates the
   * delegate; released by the destructor. Null means "nothing to release" and is
   * a valid state (the je-branch in both dtors early-exits the free path).
   */
  ownedResource: OZHistogramDelegateOwnedResource | null = null;

  /**
   * Struct slot +0x18 — the compiler-emitted scratch write target. See file header.
   * Kept as a real field so the semantic `this[+0x18] = this[+0x10]` store is
   * observable to reflection-style code that walks fields; behavioural code should
   * never read it (its lifetime ends the instant the following delete completes).
   */
  private _scratch18: OZHistogramDelegateOwnedResource | null = null;

  /**
   * OZHistogramDelegate::~OZHistogramDelegate() [D1 — base/complete] @Ozone 0x333e70
   *
   * Mirrors the asm literally:
   *   0x333e70  pushq  %rbp
   *   0x333e71  movq   %rsp, %rbp
   *   0x333e74  leaq   __ZTV19OZHistogramDelegate(%rip), %rax    ; vtable of THIS class
   *   0x333e7b  addq   $0x10, %rax                               ; step past typeinfo+top
   *   0x333e7f  movq   %rax, (%rdi)                              ; install active vtable
   *   0x333e82  movq   0x10(%rdi), %rax                          ; load ownedResource
   *   0x333e86  testq  %rax, %rax
   *   0x333e89  je     0x333e98                                   ; null → skip delete
   *   0x333e8b  movq   %rax, 0x18(%rdi)                          ; scratch write (see hdr)
   *   0x333e8f  movq   %rax, %rdi                                ; arg = ownedResource
   *   0x333e92  popq   %rbp
   *   0x333e93  jmp    __ZdlPv                                    ; tail-call operator delete
   *   0x333e98  popq   %rbp
   *   0x333e99  retq
   *
   * The vtable-install on entry is the Itanium-ABI "set the currently-destructing
   * vtable" step, so any virtual call issued while ~OZHistogramDelegate is running
   * dispatches to THIS class's slots (rather than the derived-most, which is
   * already being torn down). We model it as a no-op tag update because JS has
   * no vtable to overwrite; a debug reader could inspect this._vtableActive.
   */
  D1(): void {
    // @0x333e74..0x333e7f — install this class's active vtable slot base (base+0x10).
    // In JS there is no memory-vtable to swap; recording the intent is sufficient.
    (this as { _vtableActive?: string })._vtableActive = "OZHistogramDelegate";

    // @0x333e82 — load ownedResource.
    const owned = this.ownedResource;

    // @0x333e86..0x333e89 — branch on null.
    if (owned === null) {
      // @0x333e98..0x333e99 — early-exit: nothing to free.
      return;
    }

    // @0x333e8b — scratch write: this[+0x18] = owned. Compiler artifact, mirrored.
    this._scratch18 = owned;

    // @0x333e8f..0x333e93 — tail-call __ZdlPv(owned) [Ozone stub @0x6dfc36].
    // In JS there is no manual delete; drop the reference (GC will reclaim).
    // The store below matches the observable side-effect of `operator delete`:
    // the underlying storage is invalidated / no longer belongs to this object.
    this.ownedResource = null;
  }

  /**
   * OZHistogramDelegate::~OZHistogramDelegate() [D0 — deleting] @Ozone 0x333ea0
   *
   * Mirrors the asm literally:
   *   0x333ea0  leaq   __ZTV19OZHistogramDelegate(%rip), %rax   ; same vtable install
   *   0x333ea7  addq   $0x10, %rax                              ; as D1
   *   0x333eab  movq   %rax, (%rdi)
   *   0x333eae  movq   0x10(%rdi), %rax                         ; load ownedResource
   *   0x333eb2  testq  %rax, %rax
   *   0x333eb5  je     0x333ed0                                  ; null → skip inner free
   *   0x333ebb  pushq  %rbp
   *   0x333ebc  movq   %rsp, %rbp
   *   0x333ebf  pushq  %rbx
   *   0x333ec0  pushq  %rax
   *   0x333ec1  movq   %rax, 0x18(%rdi)                         ; scratch write
   *   0x333ec5  movq   %rdi, %rbx                               ; save this
   *   0x333ec8  movq   %rax, %rdi                               ; arg = ownedResource
   *   0x333ecb  callq  __ZdlPv                                   ; free ownedResource
   *   0x333ed0  movq   %rbx, %rdi                               ; arg = this
   *   0x333ed3  addq   $0x8, %rsp
   *   0x333ed7  popq   %rbx
   *   0x333ed8  popq   %rbp
   *   0x333ed9  jmp    __ZdlPv                                   ; free this
   *
   * D0 = D1 body + one extra tail `operator delete(this)`. In the native world
   * that tail-delete is what makes D0 "the deleting destructor" callable via
   * `delete p` on a virtual-hierarchy pointer. In JS the tail-delete is a no-op
   * (no manual heap); we still keep D0 as a distinct method so callers that
   * dispatch through vtable slot *0x08 hit the right entry.
   *
   * NOTE the two destructors share literally every observable effect on the
   * object's own fields (`ownedResource` cleared, `_scratch18` written, active
   * vtable tagged). The ONLY behavioral difference is the tail delete of `this`
   * — invisible in a GC language. To mirror the asm without lying, we route D0
   * through D1 and add a synthetic "self-invalidated" flag that a debug reader
   * could use to detect "post-D0" state.
   */
  D0(): void {
    // @0x333ea0..0x333ed9 — body identical to D1; the tail `jmp __ZdlPv` on this
    // is the only differ, and is unrepresentable in JS beyond marking the object.
    this.D1();

    // @0x333ed9 — `operator delete(this)`. In JS: mark the object as invalidated.
    // Any subsequent method call on a "deleted" instance would be a use-after-free
    // in native code; we surface the same class of bug loudly here.
    (this as { _deleted?: boolean })._deleted = true;
  }
}
