// raw-port: PCShared — Flexo framework (infra layer)
//
// PCShared is a shared_ptr-style handle: it owns a reference to a
// PC_Sp_counted_base control block at offset +0x10 and is destroyed by
// dropping that reference via weak_release().
//
// Only two entry points are published at these addresses (both dtors):
//   0x012abdb0  PCShared::~PCShared()   (D1, base)
//   0x012abde0  PCShared::~PCShared()   (D0, deleting)
//
// Object layout inferred from the dtors:
//   +0x00 ..           (unknown — may be a base subobject's data)
//   +0x08 vptr         — vtable pointer (asm writes vtable_for_PCShared+0x18 here)
//   +0x10 refControl   — pointer to PC_Sp_counted_base, or null
//
// The +0x8 vptr placement is unusual and implies PCShared derives from
// another polymorphic base (whose own vptr sits at +0x0) — but the
// specifics are not visible from the two dtors, so we do not model it
// beyond what the asm proves.

/**
 * Opaque handle to a PC_Sp_counted_base control block. The only operation
 * PCShared::~PCShared performs on it is `weak_release()`, whose
 * implementation is external (Flexo symbol
 * `_ZN18PC_Sp_counted_base12weak_releaseEv`). We inject the release
 * function so the surface stays honest — un-injected callers hit a
 * throwing stub citing the frontier symbol.
 */
export type PCSpCountedBase = { readonly __brand: "PC_Sp_counted_base" };

/**
 * Signature of `PC_Sp_counted_base::weak_release()`  — decrement the weak
 * refcount, deleting the control block when it hits zero. Undecoded here:
 * see stub @0x14966ae in Flexo.
 */
export type PCSpWeakReleaseFn = (ref: PCSpCountedBase) => void;

/**
 * PCShared — a shared_ptr-style handle. The class is only visible via its
 * two dtors; there is no observable ctor at this address, so we accept
 * the control block (optional) at construction time.
 */
export class PCShared {
  /**
   * Field +0x10: pointer to the PC_Sp_counted_base control block, or null.
   *   D1 @0x12abdbf  movq 0x10(%rdi), %rdi
   *   D0 @0x12abdf4  movq 0x10(%rdi), %rdi
   */
  protected _refControl: PCSpCountedBase | null = null;

  /** Injected weak_release implementation (see PCSpWeakReleaseFn). */
  protected _weakRelease: PCSpWeakReleaseFn | null = null;

  constructor(
    refControl: PCSpCountedBase | null = null,
    weakRelease: PCSpWeakReleaseFn | null = null,
  ) {
    this._refControl = refControl;
    this._weakRelease = weakRelease;
  }

  /**
   * PCShared::~PCShared()  @0x012abdb0  (D1, base non-deleting)
   *
   * Faithful asm mirror:
   *   @0x12abdb0  push %rbp; mov %rsp,%rbp
   *   @0x12abdb4  lea  0x677e95(%rip), %rax    ; vtable_for_PCShared+0x18
   *                                            ; (= 0x1923c50 per typical layout;
   *                                            ; resolve.py Flexo sym confirms
   *                                            ; the base is `vtable for PCShared`)
   *   @0x12abdbb  mov  %rax, 0x8(%rdi)         ; this->vptr = &vtable_for_PCShared+3
   *   @0x12abdbf  mov  0x10(%rdi), %rdi        ; rdi = this->_refControl
   *   @0x12abdc3  test %rdi, %rdi              ; if (null) skip
   *   @0x12abdc6  je   0x12abdcd
   *   @0x12abdc8  call PC_Sp_counted_base::weak_release()   ; stub 0x14966ae
   *   @0x12abdcd  pop %rbp; ret
   *
   * Note: does NOT null out this->_refControl. Ownership is dropped by
   * decrementing the control block's weak count only.
   */
  dispose(): void {
    // @0x12abdb4..0x12abdbb — vtable-pointer write. No observable effect in
    // JS (vtables live only for cross-TU virtual dispatch that we do not
    // emulate here); provenance-cited for completeness.
    // @0x12abdbf..0x12abdc6 — null check on _refControl.
    const ref = this._refControl;
    if (ref === null || ref === undefined) {
      return;
    }
    // @0x12abdc8 — PC_Sp_counted_base::weak_release(ref). No injected impl
    // means the ownership backend is not yet decoded; surface the frontier.
    if (this._weakRelease === null) {
      throw new Error(
        "PCShared.dispose: no PC_Sp_counted_base::weak_release backend injected — undecoded frontier @0x12abdc8 (symbol stub _ZN18PC_Sp_counted_base12weak_releaseEv)",
      );
    }
    this._weakRelease(ref);
    // No store back to _refControl — mirrors asm exactly.
  }

  /**
   * PCShared::~PCShared()  @0x012abde0  (D0, deleting)
   *
   * Faithful asm mirror:
   *   @0x12abde0  push %rbp; mov %rsp,%rbp; push %rbx; push %rax
   *   @0x12abde6  mov  %rdi, %rbx
   *   @0x12abde9  lea  0x677e60(%rip), %rax    ; vtable_for_PCShared+0x18 (same slot as D1)
   *   @0x12abdf0  mov  %rax, 0x8(%rdi)
   *   @0x12abdf4  mov  0x10(%rdi), %rdi
   *   @0x12abdf8  test %rdi, %rdi
   *   @0x12abdfb  je   0x12abe02
   *   @0x12abdfd  call PC_Sp_counted_base::weak_release()   ; stub 0x14966ae
   *   @0x12abe02  mov  %rbx, %rdi ; epilogue ; jmp __ZdlPv    ; @0x12abe0b
   *
   * Diff from D1: after the release path, tail-jmp to operator delete(this).
   * JS GC handles the storage; we clear our references so the wrapper is
   * collectible.
   */
  destroyAndDelete(): void {
    // Same body as D1 (same release call at @0x12abdfd).
    const ref = this._refControl;
    if (ref !== null && ref !== undefined) {
      if (this._weakRelease === null) {
        throw new Error(
          "PCShared.destroyAndDelete: no PC_Sp_counted_base::weak_release backend injected — undecoded frontier @0x12abdfd (symbol stub _ZN18PC_Sp_counted_base12weak_releaseEv)",
        );
      }
      this._weakRelease(ref);
    }
    // @0x12abe0b — tail jmp to operator delete. No JS equivalent; drop refs.
    this._refControl = null;
    this._weakRelease = null;
  }
}
