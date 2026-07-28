// @class FFAudioPlaybackMediator_iOS (Flexo)
//
// Thin platform-specific subclass of FFAudioPlaybackMediator. The two entry
// points touched by this porting unit are both trivial "vtable-installer" /
// "base-forwarder" shims:
//
//   @0xe696e0  FFAudioPlaybackMediator_iOS::FFAudioPlaybackMediator_iOS(bool)
//              (a.k.a. C1/complete-object constructor — the C2/base-object
//               ctor is not emitted; C1 is used at every call site)
//
//   @0xe69700  FFAudioPlaybackMediator_iOS::~FFAudioPlaybackMediator_iOS()  [D1]
//   @0xe69710  FFAudioPlaybackMediator_iOS::~FFAudioPlaybackMediator_iOS()  [D0 — deleting]
//
// EXACT DISASM SEMANTICS:
//
//   __ZN27FFAudioPlaybackMediator_iOSC1Eb  @ 0xe696e0:
//     rdi = this, sil = bool arg
//     callq __ZN23FFAudioPlaybackMediatorC2Eb  (base ctor — NOT ported yet)
//     leaq  vtable_for_iOS+0x10(%rip), %rax   ; vtable address: 0x1918320
//     movq  %rax, (%rdi)                      ; install vptr
//     ret
//   → net effect: chain to base ctor, then overwrite the vtable slot with the
//     iOS subclass vtable (whose data section starts at 0x1918320; ABI
//     convention stores base_addr + 0x10 in the vptr, skipping the RTTI slot
//     and offset-to-top slot).
//
//   __ZN27FFAudioPlaybackMediator_iOSD1Ev  @ 0xe69700:
//     pushq %rbp; movq %rsp,%rbp; popq %rbp
//     jmp   __ZN23FFAudioPlaybackMediatorD2Ev   ; tail-call base dtor
//   → subclass has no owned resources; entire teardown lives in the base.
//
//   __ZN27FFAudioPlaybackMediator_iOSD0Ev  @ 0xe69710:  (deleting dtor)
//     callq __ZN23FFAudioPlaybackMediatorD2Ev   ; run base dtor
//     jmp   __ZdlPv                              ; operator delete(this)
//   → the standard C++ deleting-dtor pattern; only ever called through
//     vtable slot [1] on a heap-allocated instance.
//
// FRONTIER CALLEES (not ported yet — throwing stubs cite them):
//   • FFAudioPlaybackMediator::FFAudioPlaybackMediator(bool)  @stub
//   • FFAudioPlaybackMediator::~FFAudioPlaybackMediator()     @stub
//   • operator delete(void*)                                  (__ZdlPv)
//
// The subclass adds no data members (the ctor writes only the vptr; the dtor
// does no work of its own). Sizeof(FFAudioPlaybackMediator_iOS) ==
// sizeof(FFAudioPlaybackMediator).

import { FFAudioPlaybackMediator_iOS_VTABLE_ADDR } from "./FFAudioPlaybackMediator_iOS.vtable";

/**
 * Frontier: base class not yet ported. Any real integration must supply an
 * implementation via a subclass or dependency-injection; calling into this
 * stub throws with the exact citation the porting spec requires.
 */
export class FFAudioPlaybackMediator {
  /** @0x??????  FFAudioPlaybackMediator::FFAudioPlaybackMediator(bool)
   *  Not yet ported — un-decoded base class. */
  constructor(_isSomething: boolean) {
    throw new Error(
      "FFAudioPlaybackMediator::FFAudioPlaybackMediator(bool) — base class not ported " +
        "(callee __ZN23FFAudioPlaybackMediatorC2Eb, called from " +
        "FFAudioPlaybackMediator_iOS::ctor @0xe696e9)"
    );
  }

  /** @0x??????  FFAudioPlaybackMediator::~FFAudioPlaybackMediator()
   *  Not yet ported. */
  destroy(): void {
    throw new Error(
      "FFAudioPlaybackMediator::~FFAudioPlaybackMediator() — base class not ported " +
        "(callee __ZN23FFAudioPlaybackMediatorD2Ev, tail-called from " +
        "FFAudioPlaybackMediator_iOS::~ctor @0xe69705)"
    );
  }
}

/**
 * FFAudioPlaybackMediator_iOS — iOS-flavored audio-playback mediator.
 *
 * Adds nothing over the base beyond the vtable pointer. All methods here
 * mirror the three symbols at 0xe696e0 / 0xe69700 / 0xe69710 verbatim.
 */
export class FFAudioPlaybackMediator_iOS extends FFAudioPlaybackMediator {
  /** iOS-subclass vtable base address (recovered from `leaq 0xaaec3b(%rip)` at
   *  0xe696ee: 0xe696f5 + 0xaaec3b = 0x1918330; the ABI stores base+0x10 in
   *  vptr so the vtable object itself starts at 0x1918320). */
  readonly __vptr: number = FFAudioPlaybackMediator_iOS_VTABLE_ADDR + 0x10;

  /**
   * @0xe696e0  FFAudioPlaybackMediator_iOS::FFAudioPlaybackMediator_iOS(bool)
   *
   * Asm:
   *   callq FFAudioPlaybackMediator::FFAudioPlaybackMediator(bool)  ; @0xe696e9
   *   store subclass vptr into *this                                 ; @0xe696ee..0xe696f5
   */
  constructor(flag: boolean) {
    super(flag); // @0xe696e9 → callee __ZN23FFAudioPlaybackMediatorC2Eb (throwing stub)
    // @0xe696ee/f5: vptr install — modelled via the readonly __vptr field.
  }

  /**
   * @0xe69700  FFAudioPlaybackMediator_iOS::~FFAudioPlaybackMediator_iOS()  (D1)
   *
   * Asm is a bare stack-frame + `jmp __ZN23FFAudioPlaybackMediatorD2Ev` — a
   * pure tail-call to the base dtor. No subclass-owned resources to free.
   */
  destroy(): void {
    super.destroy(); // @0xe69705 → callee __ZN23FFAudioPlaybackMediatorD2Ev (throwing stub)
  }

  /**
   * @0xe69710  FFAudioPlaybackMediator_iOS::~FFAudioPlaybackMediator_iOS()  (D0 — deleting dtor)
   *
   * Asm:
   *   callq __ZN23FFAudioPlaybackMediatorD2Ev   ; @0xe69719 — run base dtor
   *   jmp   __ZdlPv                              ; @0xe69727 — operator delete
   *
   * In JS there is no manual `operator delete`; the GC reclaims the object.
   * We faithfully invoke the base-dtor path and let JS's runtime handle
   * the storage.
   */
  destroyAndDelete(): void {
    super.destroy(); // @0xe69719 → callee __ZN23FFAudioPlaybackMediatorD2Ev (throwing stub)
    // @0xe69727 — `jmp __ZdlPv` — no JS analogue (GC-managed).
  }
}
