// OZFxPlugRenderContextSentinel.ts — Ozone RAII sentinel that pushes
// FxPlug render contexts onto the two per-device render-context managers
// hanging off an OZFxPlugSharedBase, then pops them on destruction.
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/
//         Ozone.framework/Versions/A/Ozone (macOS FCP, x86_64 slice —
//         file offset 0x4000 for the x86_64 slice of the FAT binary).
//
// Symbols ported (all six methods brief.py listed):
//   * OZFxPlugRenderContextSentinel::OZFxPlugRenderContextSentinel(
//         OZFxPlugSharedBase*, RenderContextDevice)              [C2] @0x618cb0
//   * OZFxPlugRenderContextSentinel::OZFxPlugRenderContextSentinel(
//         OZFxPlugSharedBase*, RenderContextDevice)              [C1] @0x618f00
//                                                                    (thunk → C2)
//   * OZFxPlugRenderContextSentinel::OZFxPlugRenderContextSentinel(
//         OZFxPlugSharedBase*, OZRenderParams const&,
//         RenderContextDevice)                                   [C2] @0x618f10
//   * OZFxPlugRenderContextSentinel::OZFxPlugRenderContextSentinel(
//         OZFxPlugSharedBase*, OZRenderParams const&,
//         RenderContextDevice)                                   [C1] @0x619160
//                                                                    (thunk → C2)
//   * OZFxPlugRenderContextSentinel::~OZFxPlugRenderContextSentinel() [D2] @0x619170
//   * OZFxPlugRenderContextSentinel::~OZFxPlugRenderContextSentinel() [D1] @0x6191e0
//                                                                    (thunk → D2)
//
// -----------------------------------------------------------------------------
// OBJECT LAYOUT (decoded from the ctor bodies + D2)
// -----------------------------------------------------------------------------
//   +0x00  OZFxPlugSharedBase*  base
//          — the ctors write %rsi (the base arg) to `*(this)` @0x618cc4
//            (no-params ctor) and @0x618f37 (params ctor). D2 reads it back
//            with `movq (%rdi), %rax; movq 0x20(%rax), %rdi` @0x61917e-
//            0x619181.  That is the ONLY field. `sizeof(sentinel) = 0x08`.
//
// -----------------------------------------------------------------------------
// OZFxPlugSharedBase — fields touched by this class (decoded from operand
// offsets, not by porting OZFxPlugSharedBase itself)
// -----------------------------------------------------------------------------
//   +0x00  vtable ptr  — the no-params ctor does `movq (%rsi), %rax;
//                        callq *0x18(%rax)` @0x618cc7-0x618ccd. Slot +0x18
//                        of the OZFxPlugSharedBase vtable. Returns a
//                        `FxColorDescription`-provider pointer (see below);
//                        used to source getWorkingColorDescription /
//                        getBlendingGamma for the no-RenderParams overload.
//                        (The RenderParams overload also calls the same
//                        slot @0x618f40, but ignores the color/gamma path
//                        and instead pulls them from `OZRenderParams`.)
//   +0x20  ObjC id  ptr — "manager-of-first-device". The ctors and D2 all
//                         do `movq 0x20(%rax), %rdi; %rsi=@selector(
//                         contextManager); callq _objc_msgSend` — the msg
//                         returns an `OZFxPlugRenderContextManager*` for
//                         that device (or nil).
//   +0x28  ObjC id  ptr — "manager-of-second-device", handled identically.
//                         Both branches share the same object-management
//                         code path (spin-lock protected color-description
//                         update + pushContext).
//
// SELECTOR RECOVERY (otool mislabels; recovered by hand)
//   otool prints `## Objc message: -[%rdi updateMasterTracksArray]` for
//   every callq through `0x20d341(%rip)` / `0x20d260(%rip)` / `0x20d0ce(%rip)`
//   / `0x20d05e(%rip)` / `0x20ce93(%rip)` / `0x20ce71(%rip)`. That label is
//   stock otool noise — every `_objc_msgSend` stub target in Ozone gets the
//   same phantom selector name.  The real selector is loaded via the
//   register set-up two instructions earlier (`movq 0x2f2df2(%rip), %r15` @
//   0x618cd7 in the no-params ctor; equivalent RIP-relative loads in the
//   other two functions).  All three instructions RIP-address to the same
//   `__objc_selrefs` slot at Ozone VA 0x90bad0. Reading the pointer at
//   x86_64-slice file offset 0x4000+0x90bad0 gives 0x1000000072cd7e; the
//   cstring at that VA is `"contextManager"` (verified with a Python
//   `f.seek(0x4000+va); f.read(...)` on the raw slice).  So the real
//   selector is `-[OZFxPlugSharedBase … contextManager]` — the two ObjC
//   fields (+0x20, +0x28) each expose a nullary `contextManager` getter
//   that returns an `OZFxPlugRenderContextManager*` (or nil).
//
// -----------------------------------------------------------------------------
// OZFxPlugRenderContextManager — fields touched by this class
// -----------------------------------------------------------------------------
//   +0x08  CGColorSpaceRef currentColorSpace
//          — compared against the incoming FxColorDescription.colorSpace
//            (see PCCFRefTraits<CGColorSpace*>::retain/release call
//            pattern @0x618d1f-0x618d48).
//   +0x10  u64 second-qword of FxColorDescription (copied @0x618d55-0x618d59;
//          matches FxColorDescription.ts's `+0x08 qword` field).
//   +0x18  u32 dword-of-FxColorDescription (copied @0x618d4d-0x618d50;
//          matches FxColorDescription.ts's `+0x10 dword` field).
//   +0x20  u8 byte-of-FxColorDescription  (copied @0x618d5e-0x618d62;
//          matches FxColorDescription.ts's `+0x18 byte`).
//   +0x28  float blendingGamma
//          — receives the value returned by the color-desc-provider's
//            `getBlendingGamma()` (no-params path @0x618d83-0x618d9b) or
//            OZRenderParams::getBlendingGamma() (params path
//            @0x618f7d-0x618f9b).
//   +0x48  PCSpinLock  colorDescLock
//          — computed as `manager + 0x48` and passed to PCSpinLock::lock /
//            ::unlock around the color-desc + gamma updates (@0x618d0f,
//            @0x618d1a, @0x618d6a, @0x618d8e, @0x618d91, @0x618da5).
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES — cited by symbol + address, all THROW when hit
// -----------------------------------------------------------------------------
//   * OZFxPlugSharedBase vtable slot +0x18 — @0x618ccd  (returns an
//         object that publishes getWorkingColorDescription / getBlendingGamma;
//         nominally an `OZFxPlugRenderContext` per naming, but the vtable
//         call target for slot +0x18 is not yet ported).
//   * OZFxPlugSharedBase vtable slot +0x120 — @0x618d06 / @0x618dde
//         (writes an out-`FxColorDescription` into the caller-provided
//         stack slot at -0x50(%rbp)).
//   * OZFxPlugSharedBase vtable slot +0x128 — @0x618d83 / @0x618e56
//         (returns a `float` in %xmm0 — the blending gamma).
//   * PCSpinLock::lock()     — Ozone symbol stub 0x6dd446
//   * PCSpinLock::unlock()   — Ozone symbol stub 0x6dd44c
//   * PCCFRefTraits<CGColorSpace*>::retain(cs)  — Ozone symbol stub 0x6dda94
//   * PCCFRefTraits<CGColorSpace*>::release(cs) — Ozone symbol stub 0x6dda9a
//   * OZFxPlugRenderContextManager::pushContext(RenderContextDevice)
//                                                 — @0x618dad / @0x618e7f
//                                                   / @0x619025 / @0x618fb3
//   * OZFxPlugRenderContextManager::popContext()
//                                                 — @0x61919d / @0x6191ba
//   * OZRenderParams::getRenderDevice() const     — @0x618f2a
//   * OZRenderParams::getWorkingColorDescription() const
//                                                 — @0x618f6a / @0x618fd5
//   * OZRenderParams::getBlendingGamma() const    — @0x618f7d / @0x618fe8
//   * setThreadLocalDevice(std::__1::shared_ptr<HGComputeDevice const> const&)
//                                                 — file-local free fn @0x619050
//                                                   (called @0x618f32 and
//                                                   @0x6191ca from D2). Sets a
//                                                   pthread-key TLS slot to
//                                                   the params' render device
//                                                   in the ctor; resets it to
//                                                   an empty shared_ptr in
//                                                   D2.
//   * _objc_msgSend (nullary `contextManager` selector)
//                                                 — dispatched through the
//                                                   Ozone __auth_stubs slots
//                                                   at RIP+0x20d341 (etc.).
//
// This class holds no arithmetic — it is a pure lifetime sentinel driving
// external state (per-manager color-desc/gamma updates + push/pop) — so
// raw-port/army/gate/oracle_map.json is NOT extended here.
//
// @class OZFxPlugRenderContextSentinel (Ozone)

import { FxColorDescription, type CGColorSpaceRef } from "./FxColorDescription";

/**
 * `RenderContextDevice` — the Ozone enum (mangled `19RenderContextDevice`)
 * that both ctors receive as their last arg and that
 * `OZFxPlugRenderContextManager::pushContext` consumes.  Its concrete enum
 * values are not touched by this class (the sentinel only forwards the
 * caller's value into pushContext), so we model it as an opaque tagged
 * number here rather than inventing enumerators.
 *
 * @source Ozone (enum `RenderContextDevice`)
 */
export type RenderContextDevice = number & { readonly __brand: "RenderContextDevice" };

/**
 * `HGComputeDevice const`-shared-ptr — the object whose shared_ptr is
 * pushed into a pthread-key TLS slot by `setThreadLocalDevice`. Ozone
 * threads it through as `std::__1::shared_ptr<HGComputeDevice const>`.
 * Modeled as an opaque brand — no field of it is touched by
 * OZFxPlugRenderContextSentinel.
 *
 * @source Ozone (`15HGComputeDevice`)
 */
export type HGComputeDeviceRef = { readonly __brand: "HGComputeDevice const*" };

/**
 * `OZFxPlugRenderContextManager` — the ObjC managers hanging off the two
 * fields (+0x20, +0x28) of OZFxPlugSharedBase. Not yet ported. The
 * sentinel touches exactly this interface: a spin-lockable
 * color-description slot (matched field-for-field against
 * FxColorDescription), a `blendingGamma` float, and the push/pop
 * lifecycle functions.
 *
 * @source Ozone (`28OZFxPlugRenderContextManager`) — not yet ported.
 */
export interface OZFxPlugRenderContextManager {
  /** +0x08 — current color-space handle (retain/release pair @0x6dda94 /
   *  @0x6dda9a); may be null. */
  currentColorSpace: CGColorSpaceRef | null;
  /** +0x10 — mirror of FxColorDescription.field_0x08. */
  currentColorQword08: number;
  /** +0x18 — mirror of FxColorDescription.field_0x10. */
  currentColorDword10: number;
  /** +0x20 — mirror of FxColorDescription.field_0x18 (0 or 1). */
  currentColorByte18: number;
  /** +0x28 — most recently written blending gamma (single-precision). */
  blendingGamma: number;
  /**
   * +0x48 — spin-lock guarding all of the above. Modeled here as an
   * opaque brand — the class only calls lock() / unlock().
   */
  colorDescLock: {
    /** PCSpinLock::lock @Ozone stub 0x6dd446. */
    lock(): void;
    /** PCSpinLock::unlock @Ozone stub 0x6dd44c. */
    unlock(): void;
  };
  /**
   * OZFxPlugRenderContextManager::pushContext(RenderContextDevice)
   * — @0x618dad / @0x618e7f / @0x619025 / @0x618fb3.
   */
  pushContext(device: RenderContextDevice): void;
  /**
   * OZFxPlugRenderContextManager::popContext()
   * — @0x61919d / @0x6191ba.
   */
  popContext(): void;
}

/**
 * `OZRenderParams const&` — the second overload's params-by-reference arg.
 * The sentinel calls exactly three getters on it:
 *   * `getRenderDevice()` @0x618f2a — returns the HGComputeDevice-const
 *     shared_ptr that gets pushed into TLS.
 *   * `getWorkingColorDescription()` @0x618f6a / @0x618fd5 — returns an
 *     `FxColorDescription const&`.
 *   * `getBlendingGamma()` @0x618f7d / @0x618fe8 — returns a `float`.
 * Not yet ported.
 *
 * @source Ozone (`14OZRenderParams`)
 */
export interface OZRenderParams {
  /** @addr 0x618f2a — returns the shared_ptr slot to push into TLS. */
  getRenderDevice(): HGComputeDeviceRef;
  /** @addr 0x618f6a / 0x618fd5 — returns a color description by const-ref. */
  getWorkingColorDescription(): FxColorDescription;
  /** @addr 0x618f7d / 0x618fe8 — single-precision blending gamma. */
  getBlendingGamma(): number;
}

/**
 * `OZFxPlugSharedBase` — the ObjC-ish base object the sentinel latches
 * onto. The sentinel only reads three of its members (see layout comment
 * above) plus one vtable slot; nothing else about its ABI is required
 * here.  Not yet ported.
 *
 * @source Ozone (`18OZFxPlugSharedBase`)
 */
export interface OZFxPlugSharedBase {
  /**
   * vtable slot +0x18 — @0x618ccd. Returns the object that publishes
   * `getWorkingColorDescription()` (via slot +0x120) and
   * `getBlendingGamma()` (via slot +0x128). Used only by the no-params
   * ctor; may be null (`testq %rbx, %rbx; je 0x618daa` @0x618cf3-0x618cf6).
   */
  vtable_slot_18_workingColorDescProvider(): WorkingColorDescProvider | null;
  /**
   * ObjC accessor `-[<+0x20 field> contextManager]` — the first-device
   * manager, or null.  Called @0x618ce1 / @0x618f54 / @0x61918f.
   * Modeled here as a plain method on the shared-base (a JS host can
   * front the ObjC dispatch with a direct function).
   */
  contextManagerForFirstDevice(): OZFxPlugRenderContextManager | null;
  /**
   * ObjC accessor `-[<+0x28 field> contextManager]` — the second-device
   * manager, or null.  Called @0x618dc2 / @0x618fc4 / @0x6191b1.
   */
  contextManagerForSecondDevice(): OZFxPlugRenderContextManager | null;
}

/**
 * The object returned by `OZFxPlugSharedBase` vtable slot +0x18. Only two
 * slots of ITS vtable are touched by this class:
 *   * +0x120 @0x618d06 / @0x618dde — writes an out-`FxColorDescription`
 *     into a caller-supplied stack slot.
 *   * +0x128 @0x618d83 / @0x618e56 — returns a `float` blending gamma.
 *
 * @source Ozone — inferred from the two vtable-indirect calls after the
 *   slot-+0x18 receiver load.
 */
export interface WorkingColorDescProvider {
  /**
   * vtable slot +0x120 — populate an out-FxColorDescription in-place. In
   * C++ the ABI writes to a stack slot; the JS port fills the supplied
   * mutable target and returns it for chaining.
   *
   * @addr 0x618d06 / 0x618dde
   */
  fillWorkingColorDescription(out: FxColorDescription): FxColorDescription;
  /**
   * vtable slot +0x128 — return the current blending gamma (single
   * precision).
   *
   * @addr 0x618d83 / 0x618e56
   */
  getBlendingGamma(): number;
}

/**
 * `setThreadLocalDevice(std::__1::shared_ptr<HGComputeDevice const> const&)`
 * — file-local free function at Ozone @0x619050. Lazily materializes a
 * pthread-key-backed TLS slot (`getThreadLocalDeviceInstance()::instance`),
 * then stores the caller-supplied shared_ptr into it (with the standard
 * libc++ shared_ptr copy-assign refcount dance @0x6190b4-0x6190f8).
 *
 * The sentinel calls this exactly twice:
 *   * @0x618f32 — with `params.getRenderDevice()` (the ctor path).
 *   * @0x6191ca — with an empty `shared_ptr` built from two zero SSE
 *     writes on the stack (the dtor's tail reset).
 *
 * The body itself is not ported — TLS/pthread wiring is host-supplied.
 *
 * @addr 0x619050 (Ozone)
 */
function setThreadLocalDevice(_device: HGComputeDeviceRef | null): never {
  throw new Error(
    "setThreadLocalDevice(shared_ptr<HGComputeDevice const>) not yet " +
      "ported — file-local free fn @0x619050 (Ozone symbol " +
      "__ZL20setThreadLocalDeviceRKNSt3__110shared_ptrIK15HGComputeDeviceEE). " +
      "Called from OZFxPlugRenderContextSentinel::OZFxPlugRenderContextSentinel(...) " +
      "@0x618f32 and ::~OZFxPlugRenderContextSentinel @0x6191ca — port the " +
      "pthread-key TLS wiring and wire it in.",
  );
}

/**
 * PCCFRefTraits<CGColorSpace*>::retain — Ozone symbol stub 0x6dda94.
 * Called @0x618d48 / @0x618e1e when the manager's currentColorSpace slot
 * gains a non-null pointer.
 */
function PCCFRefTraits_CGColorSpace_retain(_cs: CGColorSpaceRef): never {
  throw new Error(
    "PCCFRefTraits<CGColorSpace*>::retain not yet ported — Ozone stub " +
      "0x6dda94, called from OZFxPlugRenderContextSentinel ctor " +
      "@0x618d48 / @0x618e1e.",
  );
}

/**
 * PCCFRefTraits<CGColorSpace*>::release — Ozone symbol stub 0x6dda9a.
 * Called @0x618d35 / @0x618d78 / @0x618e0c / @0x618e4b when the manager's
 * currentColorSpace slot is being overwritten (or the local temporary
 * from `fillWorkingColorDescription` is being dropped).
 */
function PCCFRefTraits_CGColorSpace_release(_cs: CGColorSpaceRef): never {
  throw new Error(
    "PCCFRefTraits<CGColorSpace*>::release not yet ported — Ozone stub " +
      "0x6dda9a, called from OZFxPlugRenderContextSentinel ctor " +
      "@0x618d35 / @0x618d78 / @0x618e0c / @0x618e4b.",
  );
}

/**
 * Shared body of the "update this manager from an out-`FxColorDescription`
 * and this gamma, then pushContext" step. Mirrors the exact sequence
 * @0x618cfc-0x618daa (first-device branch of the no-params ctor); the
 * second-device branch @0x618dd4-0x618e7f is bytewise identical modulo
 * register renaming, and the params-ctor branches @0x618f67-0x618fb3 and
 * @0x618fd2-0x619025 differ only in where `blendingGamma` comes from
 * (which the caller supplies here).
 *
 * @addr 0x618cfc / 0x618dd4 / 0x618f67 / 0x618fd2 (Ozone)
 */
function pushManagerContext(
  manager: OZFxPlugRenderContextManager,
  filledColorDesc: FxColorDescription,
  blendingGamma: number,
  device: RenderContextDevice,
): void {
  // @0x618d0f-0x618d1a — `leaq 0x48(%r12), %r13; call PCSpinLock::lock`.
  // The color-desc slot is guarded by the manager's PCSpinLock at +0x48.
  manager.colorDescLock.lock();

  // @0x618d1f-0x618d4a — compare-and-swap the CGColorSpace field:
  //   old = manager.currentColorSpace  (movq 0x8(%r12), %rax)
  //   new = filledColorDesc.colorSpace (movq -0x50(%rbp), %rdi)
  //   if (old != new) {
  //       if (old != null) release(old);              @0x618d30-0x618d38
  //       manager.currentColorSpace = new;            @0x618d3e
  //       if (new != null) retain(new);               @0x618d43-0x618d48
  //   }
  const oldCS: CGColorSpaceRef | null = manager.currentColorSpace;
  const newCS: CGColorSpaceRef | null = filledColorDesc.colorSpace;
  if (oldCS !== newCS) {
    if (oldCS !== null) PCCFRefTraits_CGColorSpace_release(oldCS);
    manager.currentColorSpace = newCS;
    if (newCS !== null) PCCFRefTraits_CGColorSpace_retain(newCS);
  }

  // @0x618d4d-0x618d62 — copy the trailing scalars over.
  //   manager.dword18 = filledColorDesc.dword10   (movl -0x40(%rbp), 0x18(%r12))
  //   manager.qword10 = filledColorDesc.qword08   (movq -0x48(%rbp), 0x10(%r12))
  //   manager.byte20  = filledColorDesc.byte18    (movb -0x38(%rbp), 0x20(%r12))
  manager.currentColorDword10 = filledColorDesc.field_0x10;
  manager.currentColorQword08 = filledColorDesc.field_0x08;
  manager.currentColorByte18 = filledColorDesc.field_0x18;

  // @0x618d67-0x618d6a — PCSpinLock::unlock(%r13).
  manager.colorDescLock.unlock();

  // @0x618d6f-0x618d78 — drop the local FxColorDescription temporary's
  // colorSpace (its dtor releases it). The port's out-fill helper is
  // free to skip this by not creating a fresh sticker for the caller;
  // however we mirror the drop faithfully — releasing exactly if the
  // filled slot is non-null.
  if (filledColorDesc.colorSpace !== null) {
    PCCFRefTraits_CGColorSpace_release(filledColorDesc.colorSpace);
    // Mirror the C++ null-out that happens implicitly when the local
    // FxColorDescription temporary goes out of scope.
    filledColorDesc.colorSpace = null;
  }

  // @0x618d7d-0x618da5 — write blendingGamma under the spinlock:
  //   1) compute gamma via vtable slot +0x128 OR params.getBlendingGamma()
  //      (the caller has already done this and passes the float in `blendingGamma`).
  //   2) lock; manager.blendingGamma = gamma; unlock.
  //   The precise instruction sequence is:
  //     movss -0x2c(%rbp), %xmm0  ; movss %xmm0, 0x28(%r12)
  //   i.e. a single-precision store — hence Math.fround here.
  manager.colorDescLock.lock();
  manager.blendingGamma = Math.fround(blendingGamma);
  manager.colorDescLock.unlock();

  // @0x618daa-0x618dad (and mirrors) — tail-call to pushContext.
  manager.pushContext(device);
}

/**
 * OZFxPlugRenderContextSentinel — pushes a per-device render context on
 * each of the two managers hanging off an OZFxPlugSharedBase (writing a
 * fresh color description + blending gamma into each one), then pops
 * them on destruction. Optionally sets/resets a pthread-key TLS slot
 * holding a shared_ptr<HGComputeDevice const> (the "current render
 * device") when the OZRenderParams-taking overload is used.
 *
 * Layout: `sizeof = 0x08`; the single field is the raw
 * `OZFxPlugSharedBase*` at +0x00 (stored @0x618cc4 / @0x618f37).
 *
 * @source Ozone
 * @classAddr 0x618cb0 (no-params C2) / 0x618f10 (params C2)
 */
export class OZFxPlugRenderContextSentinel {
  /** +0x00 — the shared base the sentinel was latched onto. */
  base: OZFxPlugSharedBase;

  /**
   * The stashed RenderContextDevice arg — passed through to both
   * `pushContext` calls and (for the RenderParams overload) implicitly
   * captured by TLS.  In C++ the arg is passed to the ctor by value and
   * lives only as long as the ctor's register/spill footprint; the JS
   * port stores it on the sentinel so `destroy()` (D2) has no need to
   * receive it as a separate arg.
   */
  device: RenderContextDevice;

  private constructor(base: OZFxPlugSharedBase, device: RenderContextDevice) {
    this.base = base;
    this.device = device;
  }

  /**
   * `OZFxPlugRenderContextSentinel(OZFxPlugSharedBase*, RenderContextDevice)`
   * C2 body @0x618cb0 (C1 @0x618f00 is a thunk `pushq %rbp; movq %rsp, %rbp;
   * popq %rbp; jmp C2` @0x618f05).
   *
   * Mirrored control flow:
   *   %rdi = this ; %rsi = base ; %rdx = device
   *   movq %rsi, %r14
   *   movq %rsi, (%rdi)                                             @0x618cc4
   *   movq (%rsi), %rax
   *   movq %rsi, %rdi
   *   callq *0x18(%rax)                                             @0x618ccd
   *     — %rbx = base's slot-+0x18 provider (may be null).
   *   movq 0x20(%r14), %rdi
   *   movq @selector(contextManager)-selref, %r15 ; movq %r15, %rsi
   *   callq _objc_msgSend                                           @0x618ce1
   *     — %rax = manager1 (or nil).
   *   testq %rax, %rax ; je .Lsecond                                @0x618ce7-0x618cea
   *   .Lfirst_have_mgr:
   *     movq %rax, %r12 ; testq %rbx, %rbx ; je .Lfirst_push_only   @0x618cf0-0x618cf6
   *     .Lfirst_have_provider:
   *       movq (%rbx), %rax ; leaq -0x50(%rbp), %rdi ; movq %rbx, %rsi ;
   *         callq *0x120(%rax)                                       @0x618d06
   *         — fills stack `FxColorDescription` from provider.
   *       [pushManagerContext(manager1, filled, gamma-via-provider-*128, device)]
   *                                                                  @0x618d0f-0x618d67
   *     .Lfirst_push_only:                                            @0x618daa
   *       callq OZFxPlugRenderContextManager::pushContext(device)     @0x618dad
   *   .Lsecond:                                                       @0x618db2
   *     movq 0x28(%r14), %rdi ; testq ; je .Lret                      @0x618db2-0x618db9
   *     movq %r15, %rsi ; callq _objc_msgSend                         @0x618dc2
   *     testq %rax, %rax ; je .Lret                                   (…)
   *     [same body as first branch, reg-renamed]                      @0x618dcb-0x618e7f
   *   .Lret: epilogue.
   *
   * Two subtleties worth calling out:
   *   * The ObjC msg-send result being nil short-circuits the WHOLE
   *     branch: `je 0x618db2` @0x618cea skips both the provider work AND
   *     the pushContext call. This is a nil-manager guard — the sentinel
   *     only pushes if the manager pointer is non-null.
   *   * The provider being null (slot-+0x18 returning null) still leads
   *     to the pushContext call — the .Lfirst_push_only fall-through at
   *     0x618daa reaches pushContext with `%rdi = manager1` unchanged.
   *     This is a "push even without color-description update" path.
   *
   * @addr 0x618cb0 (Ozone, C2)
   */
  static create(base: OZFxPlugSharedBase, device: RenderContextDevice): OZFxPlugRenderContextSentinel {
    const self = new OZFxPlugRenderContextSentinel(base, device);

    // @0x618ccd — %rbx = base->vtable_slot_18(). Loaded once, reused for
    // both device branches (the C++ code re-uses it via %rbx spill).
    const provider = base.vtable_slot_18_workingColorDescProvider();

    // --- FIRST-DEVICE BRANCH (@0x618ce1..@0x618daf) ------------------
    // @0x618ce1 — manager1 = -[base contextManager] on the +0x20 slot.
    const mgr1 = base.contextManagerForFirstDevice();
    // @0x618ce7-0x618cea — testq %rax; je .Lsecond. Nil-manager gate.
    if (mgr1 !== null) {
      // @0x618cf3-0x618cf6 — testq %rbx, %rbx; je .Lfirst_push_only.
      // If provider is null, skip straight to pushContext (no color-desc
      // update).
      if (provider !== null) {
        // @0x618cff-0x618d06 — fill an out-FxColorDescription in a stack
        // slot from the provider (vtable +0x120).
        // (In the JS port we allocate the "stack slot" as a mutable
        //  FxColorDescription temp; the helper below drops it on exit
        //  exactly like the C++ dtor for a stack local would.)
        const filled = FxColorDescription_stackTemp();
        provider.fillWorkingColorDescription(filled);
        // @0x618d7d-0x618d83 — gamma via provider vtable slot +0x128.
        // The instruction stream reads the vtable slot after unlocking
        // (i.e. gamma is fetched OUTSIDE the color-desc critical section)
        // and then re-acquires the spinlock only for the single-float
        // store. pushManagerContext() mirrors that exact ordering.
        const gamma = Math.fround(provider.getBlendingGamma());
        pushManagerContext(mgr1, filled, gamma, device);
      } else {
        // @0x618daa-0x618dad — no provider, just push.
        mgr1.pushContext(device);
      }
    }

    // --- SECOND-DEVICE BRANCH (@0x618db2..@0x618e83) -----------------
    // @0x618db2-0x618db9 — testq %rdi ; je .Lret. The +0x28 slot itself
    // being null short-circuits the whole branch (skipping even the
    // ObjC dispatch).
    // @0x618dc2 — manager2 = -[base contextManager] on the +0x28 slot.
    const mgr2 = base.contextManagerForSecondDevice();
    if (mgr2 !== null) {
      if (provider !== null) {
        const filled2 = FxColorDescription_stackTemp();
        provider.fillWorkingColorDescription(filled2);
        const gamma2 = Math.fround(provider.getBlendingGamma());
        pushManagerContext(mgr2, filled2, gamma2, device);
      } else {
        // @0x618e7c-0x618e7f — no provider, just push.
        mgr2.pushContext(device);
      }
    }

    // @0x618e84-0x618e92 — epilogue.
    return self;
  }

  /**
   * `OZFxPlugRenderContextSentinel(OZFxPlugSharedBase*, OZRenderParams const&,
   * RenderContextDevice)` C2 body @0x618f10 (C1 @0x619160 is the standard
   * `push;mov;pop;jmp` thunk to C2 @0x619165).
   *
   * Mirrored control flow:
   *   %rdi = this ; %rsi = base ; %rdx = params ; %rcx = device
   *   movq %rdx, %rbx ; movq %rsi, %r14 ; movq %rdi, %r15
   *   movq %rdx, %rdi ; callq OZRenderParams::getRenderDevice()      @0x618f2a
   *     — %rax = shared_ptr<HGComputeDevice const> temp.
   *   movq %rax, %rdi ; callq setThreadLocalDevice(...)              @0x618f32
   *     — stash the render device into the pthread-key TLS.
   *   movq %r14, (%r15)                                              @0x618f37
   *   movq (%r14), %rax ; movq %r14, %rdi ; callq *0x18(%rax)        @0x618f40
   *     — %r15 = provider (or nil).
   *   movq 0x20(%r14), %rdi ; movq selref, %r12 ; movq %r12, %rsi ;
   *     callq _objc_msgSend                                          @0x618f54
   *     — %rax = manager1.
   *   testq %rax, %rax ; je .Lsecond
   *   .Lfirst_have_mgr:
   *     movq %rax, %r13 ; testq %r15, %r15 ; je .Lfirst_push_only
   *     .Lfirst_have_provider:
   *       movq %rbx, %rdi ; callq OZRenderParams::getWorkingColorDescription()
   *                                                                  @0x618f6a
   *       movq %r13, %rdi ; movq %rax, %rsi ;
   *         callq OZFxPlugRenderContextManager::setWorkingColorDescription(...)
   *                                                                  @0x618f75
   *       movq %rbx, %rdi ; callq OZRenderParams::getBlendingGamma() @0x618f7d
   *       movss %xmm0, -0x2c(%rbp)
   *       [lock manager+0x48; write blendingGamma; unlock]           @0x618f87-0x618fab
   *     .Lfirst_push_only:                                            @0x618fb0
   *       callq OZFxPlugRenderContextManager::pushContext(device)     @0x618fb3
   *   .Lsecond:                                                       @0x618fb8
   *     [ mirror of first branch on the +0x28 field ]                 @0x618fb8-0x619025
   *
   * The `setWorkingColorDescription(FxColorDescription const&)` call
   * @0x618f75 replaces the manual retain/release/copy dance the no-params
   * ctor does inline. Both ctors converge on the same end state though —
   * the second-half `pushContext` is tail-jumped @0x619025 (same as the
   * unified return pattern the no-params ctor spells out with a plain
   * ret at @0x618e92).
   *
   * @addr 0x618f10 (Ozone, C2)
   */
  static createWithRenderParams(
    base: OZFxPlugSharedBase,
    params: OZRenderParams,
    device: RenderContextDevice,
  ): OZFxPlugRenderContextSentinel {
    // @0x618f2a-0x618f32 — TLS stash of the render device. This is a
    // FIRE-BEFORE-STORE step (the shared-base ptr isn't written to
    // `this` until @0x618f37); the JS port matches that ordering.
    setThreadLocalDevice(params.getRenderDevice());

    const self = new OZFxPlugRenderContextSentinel(base, device);

    // @0x618f40 — %r15 = base->vtable_slot_18().
    const provider = base.vtable_slot_18_workingColorDescProvider();

    // --- FIRST-DEVICE BRANCH (@0x618f54..@0x618fb3) ------------------
    const mgr1 = base.contextManagerForFirstDevice();
    if (mgr1 !== null) {
      // Bind non-null narrowing to a local so it survives the
      // `never`-returning setter call below (tsc drops narrowing across
      // a call to a `never` return type).
      const m1: OZFxPlugRenderContextManager = mgr1!;
      if (provider !== null) {
        // @0x618f6a-0x618f75 — pull working-color-desc from params and
        // hand it to the manager's setter (a virtual/non-virtual is
        // undecoded here; it's a direct call to
        // OZFxPlugRenderContextManager::setWorkingColorDescription).
        const workingDesc = params.getWorkingColorDescription();
        OZFxPlugRenderContextManager_setWorkingColorDescription(m1, workingDesc);
        // @0x618f7d-0x618fab — gamma from params, then locked single-
        // precision store into manager+0x28. (No re-lock for the desc
        // update — that was done by setWorkingColorDescription itself
        // in the params path.)
        const gamma = Math.fround(params.getBlendingGamma());
        m1.colorDescLock.lock();
        m1.blendingGamma = Math.fround(gamma);
        m1.colorDescLock.unlock();
      }
      // @0x618fb0-0x618fb3 — pushContext(device).
      m1.pushContext(device);
    }

    // --- SECOND-DEVICE BRANCH (@0x618fb8..@0x619025) -----------------
    // @0x618fb8-0x618fbf — testq %rdi on the +0x28 slot BEFORE the
    // msgSend. If null, short-circuit to the epilogue (@0x61902a).
    const mgr2 = base.contextManagerForSecondDevice();
    if (mgr2 !== null) {
      const m2: OZFxPlugRenderContextManager = mgr2!;
      if (provider !== null) {
        const workingDesc2 = params.getWorkingColorDescription();
        OZFxPlugRenderContextManager_setWorkingColorDescription(m2, workingDesc2);
        const gamma2 = Math.fround(params.getBlendingGamma());
        m2.colorDescLock.lock();
        m2.blendingGamma = Math.fround(gamma2);
        m2.colorDescLock.unlock();
      }
      // @0x619025 — tail-jmp to pushContext (in C++ this leaves the
      // return address of the sentinel's caller on the stack directly;
      // the JS port collapses that into an ordinary call+return).
      m2.pushContext(device);
    }

    return self;
  }

  /**
   * ~OZFxPlugRenderContextSentinel() — D2 @0x619170 (D1 @0x6191e0 is the
   * standard thunk).
   *
   * Mirrored control flow:
   *   %rdi = this
   *   movq %rdi, %r14
   *   movq (%rdi), %rax                                              @0x61917e
   *     — %rax = base = *(this+0x00).
   *   movq 0x20(%rax), %rdi                                          @0x619181
   *     — %rdi = the +0x20 ObjC field of base (may be nil).
   *   movq @selector(contextManager)-selref, %rbx ; movq %rbx, %rsi
   *   callq _objc_msgSend                                            @0x61918f
   *     — %rax = manager1 (or nil).
   *   testq %rax, %rax ; je .Lsecond                                 @0x619195-0x619198
   *   movq %rax, %rdi ; callq OZFxPlugRenderContextManager::popContext()
   *                                                                  @0x61919d
   *   .Lsecond:
   *     movq (%r14), %rax ; movq 0x28(%rax), %rdi ;
   *       testq %rdi ; je .Lreset_tls                                @0x6191a2-0x6191ac
   *     movq %rbx, %rsi ; callq _objc_msgSend                        @0x6191b1
   *     movq %rax, %rdi ; callq OZFxPlugRenderContextManager::popContext()
   *                                                                  @0x6191ba
   *   .Lreset_tls:
   *     xorps %xmm0, %xmm0 ; movaps %xmm0, -0x20(%rbp) ;
   *       leaq -0x20(%rbp), %rdi ; callq setThreadLocalDevice(&empty) @0x6191ca
   *     — reset the pthread-key TLS slot to an empty shared_ptr.
   *
   * Notes:
   *   * The dtor unconditionally resets the TLS slot to empty, EVEN
   *     when the sentinel was constructed via the no-RenderParams ctor
   *     (which never set it in the first place).  This is a "one dtor
   *     serves both ctors" pattern; the TLS reset is a no-op if the
   *     slot was already empty (`setThreadLocalDevice` copy-assigns an
   *     empty shared_ptr — the pre-existing owner, if any, is dropped
   *     via the shared_weak_count decrement path @0x6190d1-0x6190f8).
   *   * The popContext calls are unconditional-on-manager-being-non-null
   *     but do NOT depend on whether pushContext actually ran (i.e. if
   *     the ctor ran with `provider==null`, push was still called and
   *     pop is still called — the push/pop count balances).
   *
   * @addr 0x619170 (Ozone, D2)
   */
  destroy(): void {
    // @0x61917e-0x619198 — first-device pop.
    const mgr1 = this.base.contextManagerForFirstDevice();
    if (mgr1 !== null) {
      mgr1.popContext();
    }
    // @0x6191a2-0x6191bf — second-device pop.
    const mgr2 = this.base.contextManagerForSecondDevice();
    if (mgr2 !== null) {
      mgr2.popContext();
    }
    // @0x6191bf-0x6191ca — reset TLS device slot with an empty
    // shared_ptr (modeled here as `null`). The 128-bit zero write
    // `xorps %xmm0, %xmm0; movaps %xmm0, -0x20(%rbp)` mirrors the
    // libc++ `shared_ptr` layout: {control-block ptr, raw ptr} both
    // zeroed — i.e. the empty shared_ptr.
    setThreadLocalDevice(null);
  }
}

/**
 * OZFxPlugRenderContextManager::setWorkingColorDescription(FxColorDescription const&)
 * — Ozone symbol
 * `_ZN28OZFxPlugRenderContextManager26setWorkingColorDescriptionERK18FxColorDescription`;
 * called from the RenderParams-ctor branches @0x618f75 / @0x618fe0. Not
 * yet ported.  This is the params-path equivalent of the manual
 * retain/release/copy sequence @0x618d1f-0x618d6a used by the no-params
 * ctor.
 */
function OZFxPlugRenderContextManager_setWorkingColorDescription(
  _mgr: OZFxPlugRenderContextManager,
  _desc: FxColorDescription,
): never {
  throw new Error(
    "OZFxPlugRenderContextManager::setWorkingColorDescription not yet " +
      "ported — Ozone symbol " +
      "_ZN28OZFxPlugRenderContextManager26setWorkingColorDescriptionERK18FxColorDescription. " +
      "Called from OZFxPlugRenderContextSentinel::createWithRenderParams " +
      "@0x618f75 / @0x618fe0.",
  );
}

/**
 * Allocate a fresh stack-temp `FxColorDescription` (the caller of
 * `fillWorkingColorDescription` is expected to hand a mutable slot to
 * the provider).  We surface a helper here rather than teaching every
 * caller how to zero-init one.
 *
 * The bytes correspond to `-0x50(%rbp)..-0x38(%rbp)` in the disassembly
 * (0x18-byte on-stack storage — see FxColorDescription.ts layout comment).
 */
function FxColorDescription_stackTemp(): FxColorDescription {
  // The C++ stack local is a raw 0x18-byte buffer left uninitialized
  // until the provider's slot-+0x120 fills it. In the JS port we use the
  // default-constructed instance (matching FxColorDescription's default
  // constructor state: null colorSpace, zeroed scalars, no retain/release
  // callbacks wired) — which corresponds to what the C++ dtor would see
  // if the fill never happened (the null-guarded release path is a no-op).
  return new FxColorDescription();
}
