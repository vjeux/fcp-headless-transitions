// FFPlayerProhibitAllPrivatePlayerLocksThisThreadRAII — Flexo RAII pair used by
// the player subsystem to "prohibit" (assert-count) both the private-player
// lock AND the player-thread-state lock on the current thread, in a single
// scope. The class is a plain aggregate of two `FFThreadLocalCounterSupport`
// members: one covers "PlayerPrivateLockProhibit", the other covers
// "PlayerThreadStateLockProhibit". Constructing it bumps both counters (with
// delta = +1); destructing it — via the imported FFThreadLocalCounterSupport
// destructors — is expected to unwind them symmetrically.
//
// Source disassembly (dumped via raw-port/tools/disasm.sh):
//   Flexo.framework  arch x86_64
//   C1 (complete-object ctor)  @0xd9c540 — __ZN51FFPlayer...RAIIC1Ev
//   C2 (base-object     ctor)  @0xd9c4f0 — __ZN51FFPlayer...RAIIC2Ev
// Both bodies are byte-identical (the Itanium ABI collapses C1 and C2 into a
// single implementation when there are no virtual bases and no
// virtual-inheritance vtable to install — which is exactly this class:
// no vtable slot is written at +0x00, and the two calls are non-virtual
// direct calls to `FFThreadLocalCounterSupport::FFThreadLocalCounterSupport`).
// No destructor is exported for this class — the Itanium ABI lets an aggregate
// with two trivially-composable member dtors inline the sub-object dtor pair;
// FCP does exactly that and never emits an out-of-line
// ~FFPlayerProhibitAllPrivatePlayerLocksThisThreadRAII.
//
// DECODE — struct layout (recovered from the two ctor bodies; only fields at
// offsets 0x00 and 0x10 are written, and each is written by a call to the
// SAME member ctor `FFThreadLocalCounterSupport::FFThreadLocalCounterSupport
// (__CFString const*, long long)` — so the class is exactly two consecutive
// FFThreadLocalCounterSupport members):
//
//   +0x00  FFThreadLocalCounterSupport  private_lock_prohibit
//          — ctor called @0xd9c556 (C1) / @0xd9c506 (C2). CFString arg
//            @Flexo 0x19ae808 -> C-string @Flexo 0x165e237 len=25 =
//              "PlayerPrivateLockProhibit". Delta arg = 1 (`movl $0x1, %edx`
//            @0xd9c551 / @0xd9c501).
//   +0x10  FFThreadLocalCounterSupport  thread_state_lock_prohibit
//          — ctor called @0xd9c56b (C1) / @0xd9c51b (C2). CFString arg
//            @Flexo 0x19ae828 -> C-string @Flexo 0x165e251 len=29 =
//              "PlayerThreadStateLockProhibit". Delta arg = 1.
//
// sizeof(FFPlayerProhibitAllPrivatePlayerLocksThisThreadRAII) = 0x20 bytes
// (two 16-byte FFThreadLocalCounterSupport sub-objects; no padding, no
// trailing fields — the ctor writes nothing past +0x10 + sizeof(sub) and no
// vtable ptr goes at +0x00).
//
// Runtime imports / cross-class calls (all direct, non-virtual):
//   __ZN27FFThreadLocalCounterSupportC2EPK10__CFStringx
//     — FFThreadLocalCounterSupport::FFThreadLocalCounterSupport(
//         __CFString const*, long long)
//       (C2 base-object ctor; called twice per body).
//   __ZN27FFThreadLocalCounterSupportD1Ev
//     — FFThreadLocalCounterSupport::~FFThreadLocalCounterSupport()
//       (invoked from the C++-EH landing pad @0xd9c57b (C1) / @0xd9c52b (C2)
//        to roll back the first sub-object if the second sub-object's ctor
//        throws; followed by `__Unwind_Resume` @Flexo 0x1495d30). We port
//        the happy path only — the JS host has no unwind machinery here.
//   __Unwind_Resume  @Flexo 0x1495d30 (__stubs entry, called from EH pad).

/**
 * FFThreadLocalCounterSupport — cross-class. The two-arg ctor
 * `(CFString const* name, long long delta)` and the destructor
 * `~FFThreadLocalCounterSupport()` are demanded by this class but have not
 * yet been transcribed to TS (this class is a leaf-consumer, not the owner).
 * We model it as an opaque handle. A subsequent army worker porting
 * FFThreadLocalCounterSupport will replace this stub with a real class.
 */
export type FFThreadLocalCounterSupport = { __opaque: true };

/**
 * FCP CFStringRef — treated opaquely here. The two CFStrings this class
 * constructs are literal constants embedded in Flexo's __cfstring section
 * (`kCFAllocatorNull` isa 0x7c8080200000154f), so from JS we model each as
 * a `{name: string}` handle that the FFThreadLocalCounterSupport port will
 * eventually key on.
 */
export type CFStringRef = { name: string };

/**
 * CFString @Flexo 0x19ae808 → cstr @Flexo 0x165e237 len=25 =
 *   "PlayerPrivateLockProhibit"
 * (Verified by reading the __cfstring struct's cstr pointer + length via
 * `otool -X -s __TEXT __cstring Flexo` and slicing at 0x165e237 for 25 bytes.)
 */
const CFSTR_PlayerPrivateLockProhibit: CFStringRef = {
  name: "PlayerPrivateLockProhibit",
};

/**
 * CFString @Flexo 0x19ae828 → cstr @Flexo 0x165e251 len=29 =
 *   "PlayerThreadStateLockProhibit"
 */
const CFSTR_PlayerThreadStateLockProhibit: CFStringRef = {
  name: "PlayerThreadStateLockProhibit",
};

/**
 * `FFThreadLocalCounterSupport::FFThreadLocalCounterSupport(
 *      __CFString const* name, long long delta)` @Flexo 0xd9c556 / 0xd9c506
 * (called twice per RAII ctor). Frontier callee — throwing stub as
 * required by the porting spec (an "unknown callee" is a loud gap, not a
 * silent no-op). The RAII ctor below therefore surfaces the gap the first
 * time it's constructed at runtime.
 */
function FFThreadLocalCounterSupport_ctor(
  _self: FFThreadLocalCounterSupport,
  _name: CFStringRef,
  _delta: bigint,
): void {
  throw new Error(
    "FFPlayerProhibitAllPrivatePlayerLocksThisThreadRAII: " +
      "FFThreadLocalCounterSupport::FFThreadLocalCounterSupport" +
      "(__CFString const*, long long) not yet transcribed " +
      "@Flexo 0xd9c556 (C1) / 0xd9c506 (C2)"
  );
}

/**
 * FFPlayerProhibitAllPrivatePlayerLocksThisThreadRAII — see file header for
 * the full struct layout, disassembly citations, and CFString provenance.
 * The class is used as a stack-scoped RAII to guarantee that any code
 * running while this object is alive is "prohibited" from taking either
 * the private-player lock or the player-thread-state lock on the current
 * thread; violations are detected downstream by
 * FFThreadLocalCounterSupport asserting the corresponding counter is 0.
 */
export class FFPlayerProhibitAllPrivatePlayerLocksThisThreadRAII {
  /**
   * +0x00 — the "PlayerPrivateLockProhibit" counter handle. Constructed
   * @Flexo 0xd9c556 (C1) / 0xd9c506 (C2) with delta=1.
   */
  private privateLockProhibit: FFThreadLocalCounterSupport;

  /**
   * +0x10 — the "PlayerThreadStateLockProhibit" counter handle. Constructed
   * @Flexo 0xd9c56b (C1) / 0xd9c51b (C2) with delta=1.
   */
  private threadStateLockProhibit: FFThreadLocalCounterSupport;

  /**
   * FFPlayerProhibitAllPrivatePlayerLocksThisThreadRAII::
   *   FFPlayerProhibitAllPrivatePlayerLocksThisThreadRAII()
   * @Flexo 0xd9c4f0 (C2) / 0xd9c540 (C1) — byte-identical bodies.
   *
   *   @0xd9c4f0..@0xd9c4f7   prologue; rbx = this
   *   @0xd9c4fa   rsi = &CFString @0x19ae808 ("PlayerPrivateLockProhibit")
   *   @0xd9c501   edx = 1  (delta = +1)
   *   @0xd9c506   FFThreadLocalCounterSupport::C2(this+0x00, cfstr, 1)
   *   @0xd9c50b   rdi = this + 0x10
   *   @0xd9c50f   rsi = &CFString @0x19ae828 ("PlayerThreadStateLockProhibit")
   *   @0xd9c516   edx = 1
   *   @0xd9c51b   FFThreadLocalCounterSupport::C2(this+0x10, cfstr, 1)
   *   @0xd9c524   ret
   *
   * The landing pad @0xd9c525..@0xd9c538 (C2) / @0xd9c575..@0xd9c588 (C1)
   * covers only the SECOND sub-ctor call; if it throws, the machine calls
   * ~FFThreadLocalCounterSupport on this+0x00 (rolling back the first
   * sub-object) and then __Unwind_Resume's. The JS port surfaces exceptions
   * from the first sub-ctor call directly (the second sub-ctor is not
   * reached in that case, so there's nothing to roll back).
   */
  constructor() {
    // The C++ ctor performs no zero-init before calling the sub-ctors —
    // FFThreadLocalCounterSupport::C2 is responsible for fully initialising
    // its own 16 bytes. We mirror that by handing each sub-ctor an
    // uninitialised opaque handle and letting it fill in.
    this.privateLockProhibit = { __opaque: true } as FFThreadLocalCounterSupport;
    this.threadStateLockProhibit = { __opaque: true } as FFThreadLocalCounterSupport;

    // @0xd9c506 / @0xd9c556 — first sub-object ctor.
    FFThreadLocalCounterSupport_ctor(
      this.privateLockProhibit,
      CFSTR_PlayerPrivateLockProhibit,
      1n,
    );
    // @0xd9c51b / @0xd9c56b — second sub-object ctor.
    FFThreadLocalCounterSupport_ctor(
      this.threadStateLockProhibit,
      CFSTR_PlayerThreadStateLockProhibit,
      1n,
    );
  }
}
