// OZOnScreenControlComponent — abstract base class for FCP "on-screen control" UI components
// (visible manipulators overlaid on the viewer: drop-shadow, distort, motion-path, etc.).
// FAITHFUL PORT from Ozone.framework. Every method cites @0xADDR.
//
// This is a NO-OP DEFAULT BASE — its non-dtor methods all return trivial values or do nothing.
// Concrete subclasses (see vtable @0x871478 slot table below) override the vtable entries.
//
// vtable @0x871478 (installed-ptr @0x871488, from vtable.py Ozone OZOnScreenControlComponent):
//    *0x00 -> ~OZOnScreenControlComponent()  @0x6dbe60  (D1 — non-deleting, UD2)
//    *0x08 -> ~OZOnScreenControlComponent()  @0x6dbe70  (D0 — deleting, UD2)
//    *0x10 -> validate(OZChannelBase*)       @0x4cd030  (returns true)
//    *0x18 -> pure-virtual create(...)       (no default entry in the base — subclasses install)
//    *0x20 -> registerOSC(void*)             @0x4cd040  (no-op)
//    *0x28 -> deregisterOSC(void*)           @0x4cd050  (no-op)
//    *0x30 -> getActiveControllers(...)      @0x4cd060  (no-op)
//
// Subclasses observed in the same __ZTV chain: OZDropShadowOSC_UIComponent (base+0x48),
// OZDistortOSC_UIComponent (base+0x90), OZMotionPathOSC_UIComponent, OZReshapeOSC_UIComponent,
// OZTrimOSC_UIComponent, etc. Each installs its own create()/register/deregister/getActive.
//
// D1/D0 both emit `ud2` @0x6dbe60/0x6dbe70 — a compile-time abort trap. Modern libc++ codegen
// uses UD2 when a class's virtual dtor is invoked on a base pointer that MUST have been
// downcast to a concrete subclass first, but reached the base slot due to a pure-virtual
// linkage. In practice: the base class is INSTANTIABLE (no pure-virtuals) yet its dtor is
// implemented as an abort — meaning FCP treats "destroying an OZOnScreenControlComponent as
// itself" as programmer error. We model this by making destroy()/deleteThis() throw.

// Forward-decls for shape. None of these types are dereferenced by our four ported methods
// (all four are no-ops), so we don't need OZChannelBase / OZViewer / OZFactory ports; we
// simply model them as opaque handles.
export interface OZChannelBaseHandle {
  readonly __ozChannelBase: true;
}
export interface OZViewerHandle {
  readonly __ozViewer: true;
}

export class OZOnScreenControlComponent {
  // No data members are ever read/written in any of the 6 methods — the vtable pointer at
  // +0x00 is the only observable field. Layout size therefore >= 0x08 but no additional
  // slots are established by this class (subclasses may extend).

  // OZOnScreenControlComponent::validate(OZChannelBase*) @0x4cd030
  //   pushq %rbp ; movq %rsp,%rbp ; movb $0x1,%al ; popq %rbp ; retq
  // → returns true unconditionally. This is the base's "accept anything" default; subclasses
  // (e.g. OZDropShadowOSC_UIComponent::validate @0x4cd380) do real type-checking.
  validate(_channel: OZChannelBaseHandle | null): boolean {
    // 0x4cd034: movb $0x1,%al — return true.
    return true;
  }

  // OZOnScreenControlComponent::registerOSC(void*) @0x4cd040
  //   pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq
  // → no-op. Subclasses register drag handles / controllers with the viewer.
  registerOSC(_controller: unknown): void {
    // 0x4cd041..0x4cd045: pure prologue/epilogue — no body.
  }

  // OZOnScreenControlComponent::deregisterOSC(void*) @0x4cd050
  //   pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq
  // → no-op.
  deregisterOSC(_controller: unknown): void {
    // 0x4cd051..0x4cd055: pure prologue/epilogue — no body.
  }

  // OZOnScreenControlComponent::getActiveControllers(OZViewer*, std::list<void*>*) @0x4cd060
  //   pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq
  // → no-op. The base does not populate the output list; subclasses append their live
  // controller pointers into `out`.
  getActiveControllers(_viewer: OZViewerHandle | null, _out: unknown[]): void {
    // 0x4cd061..0x4cd065: pure prologue/epilogue — the output list is left untouched.
  }

  // OZOnScreenControlComponent::~OZOnScreenControlComponent() @0x6dbe60 (D1) and @0x6dbe70 (D0).
  //   pushq %rbp ; movq %rsp,%rbp ; ud2
  // Both destructors emit `ud2` (undefined-instruction / abort trap). This means FCP
  // considers destroying an object OF THIS EXACT STATIC TYPE (rather than through a
  // concrete subclass override) to be a fatal programmer error. We faithfully preserve that
  // observable by throwing when destroy()/deleteThis() is called on a base instance.
  destroy(): never {
    // 0x6dbe64: ud2 — trap.
    throw new Error(
      "OZOnScreenControlComponent::~OZOnScreenControlComponent (D1) is `ud2` @0x6dbe64 — " +
        "the FCP class must be destroyed via a concrete subclass override, not through the " +
        "base slot.",
    );
  }

  deleteThis(): never {
    // 0x6dbe74: ud2 — trap.
    throw new Error(
      "OZOnScreenControlComponent::~OZOnScreenControlComponent (D0) is `ud2` @0x6dbe74 — " +
        "the FCP class must be destroyed via a concrete subclass deleting-dtor, not the " +
        "base slot.",
    );
  }
}
