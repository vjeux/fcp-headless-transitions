// raw-port: LiImageProjection — Ozone framework (channels layer)
//
// LiImageProjection is a subclass of LiImageSource with a PCSharedCount
// sub-object (PCShared_base) at offset +0x18 and an owned
// PC_Sp_counted_base control block pointer at +0x30.
//
// Only two entry points are published at these addresses, both dtors:
//   0x004b3a70  LiImageProjection::~LiImageProjection()   (D1, base)
//   0x004b3ae0  LiImageProjection::~LiImageProjection()   (D0, deleting)
//
// Object layout inferred from the dtors + VTT usage:
//   +0x00 vptr           — primary vtable (asm writes vtable_for_LiImageProjection + N here)
//   +0x08 ..             — LiImageSource base data (opaque; drained by LiImageSource::~D2)
//   +0x18 PCSharedCount  — sub-object destroyed via PCSharedCount::~D1() @0x6ddaee
//   +0x28 PCShared_base vptr slot
//                        — asm rewrites this to vtable_for_PCShared_base + 0x10
//   +0x30 PC_Sp_counted_base*
//                        — control block; released via weak_release() @0x6de4fc
//                          when non-null.
//
// External frontier (all cited in the asm — undecoded here, throwing stubs):
//   0x6ddaee  __ZN13PCSharedCountD1Ev
//   0x6dd842  __ZN13LiImageSourceD2Ev
//   0x6de4fc  __ZN18PC_Sp_counted_base12weak_releaseEv
//   0x6dfc36  __ZdlPv                     (operator delete)
//   ___clang_call_terminate               (EH landing pad)
//
// Constants (RIP-relative leas):
//   D1 @0x4b3a79  lea 0x3bbd10(%rip)      — primary vtable slot (vtable_for_LiImageProjection + N)
//   D1 @0x4b3a83  lea 0x3bbdee(%rip)      — PCShared_base sub-object vtable slot
//                                           (structurally equivalent to +0x10 of vtable_for_PCShared_base;
//                                            the explicit reload from __ZTV13PCShared_base+0x10 at
//                                            @0x4b3aaa/0x4b3ab5 confirms this is the correct target
//                                            of the +0x28 write.)
//   D1 @0x4b3a97  mov 0x371f1a(%rip), %rsi  — __ZTT17LiImageProjection (VTT), then +=0x10
//                                             passed as this layout descriptor to LiImageSource::~D2().
//   D0 differs from D1 ONLY by a tail-jmp to __ZdlPv at @0x4b3b40.

/**
 * Opaque handle to the PC_Sp_counted_base control block owned at +0x30.
 * We do not model its interior — the only observed op is weak_release().
 */
export type PCSpCountedBase = { readonly __brand: "PC_Sp_counted_base" };

/** Signature of PC_Sp_counted_base::weak_release() @ Ozone stub 0x6de4fc. */
export type PCSpWeakReleaseFn = (ref: PCSpCountedBase) => void;

/**
 * Opaque handle to the PCSharedCount sub-object at +0x18. Its dtor is
 * an undecoded frontier — we accept an injected destroyer function so
 * the surface stays honest.
 */
export type PCSharedCountHandle = { readonly __brand: "PCSharedCount" };

/** Signature of PCSharedCount::~PCSharedCount() @ Ozone stub 0x6ddaee. */
export type PCSharedCountDtorFn = (obj: PCSharedCountHandle) => void;

/**
 * Opaque handle to the LiImageSource base sub-object. Its destructor
 * (LiImageSource::~LiImageSource() D2, @Ozone stub 0x6dd842) receives
 * both this (=%rbx, the derived object) AND a %rsi = VTT+0x10 pointer.
 * Undecoded frontier — we accept an injected destroyer.
 */
export type LiImageSourceBase = { readonly __brand: "LiImageSource" };

/**
 * Signature of LiImageSource::~LiImageSource() D2 @0x6dd842.
 * The %rsi argument is the VTT-derived sub-object type info the base
 * dtor consumes; we surface it explicitly rather than fabricate it.
 */
export type LiImageSourceD2Fn = (
  self: LiImageSourceBase,
  vttPlus10: unknown,
) => void;

/**
 * LiImageProjection — a shared/refcounted image-source subclass.
 *
 * The class is only observable via its two destructors; there is no
 * observable ctor at these addresses, so we accept the sub-objects and
 * their destroyers at construction time (dependency injection, matching
 * the pattern used by PCShared.ts).
 */
export class LiImageProjection {
  /**
   * Field +0x18: the PCSharedCount sub-object (opaque here).
   *   D1 @0x4b3a8e  addq $0x18, %rdi ; call PCSharedCount::~D1()
   */
  protected _sharedCount: PCSharedCountHandle | null = null;

  /** Injected PCSharedCount::~D1() @0x6ddaee. */
  protected _sharedCountDtor: PCSharedCountDtorFn | null = null;

  /**
   * The LiImageSource base sub-object (opaque here). The whole derived
   * object address (%rbx) is passed to LiImageSource::~D2 — the classic
   * non-virtual base-subobject dtor call convention. We keep the handle
   * separate for injection clarity.
   *   D1 @0x4b3aa2  movq %rbx, %rdi ; call LiImageSource::~D2()
   */
  protected _base: LiImageSourceBase | null = null;

  /** Injected LiImageSource::~D2() @0x6dd842. */
  protected _baseDtor: LiImageSourceD2Fn | null = null;

  /**
   * The VTT+0x10 pointer passed as %rsi to LiImageSource::~D2.
   * Provenance: D1 @0x4b3a97..0x4b3a9e — mov __ZTT17LiImageProjection, %rsi; add $0x10, %rsi.
   * Opaque here (undecoded read-only VTT metadata).
   */
  protected _vttPlus10: unknown = null;

  /**
   * Field +0x30: pointer to a PC_Sp_counted_base, or null.
   *   D1 @0x4b3ab9  movq 0x30(%rbx), %rdi
   */
  protected _refControl: PCSpCountedBase | null = null;

  /** Injected PC_Sp_counted_base::weak_release() @0x6de4fc. */
  protected _weakRelease: PCSpWeakReleaseFn | null = null;

  constructor(
    init: {
      sharedCount?: PCSharedCountHandle | null;
      sharedCountDtor?: PCSharedCountDtorFn | null;
      base?: LiImageSourceBase | null;
      baseDtor?: LiImageSourceD2Fn | null;
      vttPlus10?: unknown;
      refControl?: PCSpCountedBase | null;
      weakRelease?: PCSpWeakReleaseFn | null;
    } = {},
  ) {
    this._sharedCount = init.sharedCount ?? null;
    this._sharedCountDtor = init.sharedCountDtor ?? null;
    this._base = init.base ?? null;
    this._baseDtor = init.baseDtor ?? null;
    this._vttPlus10 = init.vttPlus10 ?? null;
    this._refControl = init.refControl ?? null;
    this._weakRelease = init.weakRelease ?? null;
  }

  /**
   * LiImageProjection::~LiImageProjection()  @0x004b3a70  (D1, base non-deleting)
   *
   * Faithful asm mirror:
   *   @0x4b3a70  push %rbp; mov %rsp,%rbp; push %rbx; push %rax
   *   @0x4b3a76  mov  %rdi, %rbx                               ; %rbx = this
   *   @0x4b3a79  lea  0x3bbd10(%rip), %rax                     ; vtable_for_LiImageProjection + N
   *   @0x4b3a80  mov  %rax, (%rdi)                             ; this->vptr[+0x00] = <primary vtable slot>
   *   @0x4b3a83  lea  0x3bbdee(%rip), %rax                     ; PCShared_base sub-object vtable slot
   *   @0x4b3a8a  mov  %rax, 0x28(%rdi)                         ; this[+0x28] = <sub-object vptr>
   *   @0x4b3a8e  add  $0x18, %rdi                              ; %rdi = &this->_sharedCount
   *   @0x4b3a92  call PCSharedCount::~PCSharedCount()          ; stub 0x6ddaee
   *   @0x4b3a97  mov  __ZTT17LiImageProjection(%rip), %rsi     ; VTT
   *   @0x4b3a9e  add  $0x10, %rsi                              ; %rsi = VTT + 0x10
   *   @0x4b3aa2  mov  %rbx, %rdi                               ; %rdi = this
   *   @0x4b3aa5  call LiImageSource::~LiImageSource() (D2)     ; stub 0x6dd842
   *   @0x4b3aaa  lea  __ZTV13PCShared_base(%rip), %rax
   *   @0x4b3ab1  add  $0x10, %rax                              ; %rax = &vtable_for_PCShared_base + 0x10
   *   @0x4b3ab5  mov  %rax, 0x28(%rbx)                         ; rewrite this[+0x28] vptr (PCShared_base sub-object)
   *   @0x4b3ab9  mov  0x30(%rbx), %rdi                         ; %rdi = this->_refControl
   *   @0x4b3abd  test %rdi, %rdi                               ; if (null) skip
   *   @0x4b3ac0  je   0x4b3ac7
   *   @0x4b3ac2  call PC_Sp_counted_base::weak_release()       ; stub 0x6de4fc
   *   @0x4b3ac7  pop %rax; pop %rbx; pop %rbp; ret
   *
   * EH landing pad @0x4b3ace..0x4b3ad1: mov %rax,%rdi ; call ___clang_call_terminate.
   * We cannot faithfully mirror std::terminate from JS; any injected dtor
   * that throws will simply propagate.
   *
   * Two vptr writes (@0x4b3a80 and @0x4b3a8a) transition the object into
   * its base-most vtable set mid-destruction — a standard C++ ABI pattern
   * so any virtual call reached from a member dtor dispatches to the
   * correct level. JS has no cross-TU virtual dispatch we emulate, so
   * these writes are provenance-cited but have no observable JS effect.
   * Same for the final PCShared_base vptr write @0x4b3ab5.
   */
  dispose(): void {
    // @0x4b3a79..0x4b3a8a — vptr rewrites (base-most transition); no JS effect.

    // @0x4b3a8e..0x4b3a92 — PCSharedCount sub-object destruction.
    if (this._sharedCount !== null) {
      if (this._sharedCountDtor === null) {
        throw new Error(
          "LiImageProjection.dispose: no PCSharedCount::~D1 backend injected — undecoded frontier @0x4b3a92 (symbol stub _ZN13PCSharedCountD1Ev @0x6ddaee)",
        );
      }
      this._sharedCountDtor(this._sharedCount);
    }

    // @0x4b3a97..0x4b3aa5 — LiImageSource base destruction with VTT+0x10.
    if (this._base !== null) {
      if (this._baseDtor === null) {
        throw new Error(
          "LiImageProjection.dispose: no LiImageSource::~D2 backend injected — undecoded frontier @0x4b3aa5 (symbol stub _ZN13LiImageSourceD2Ev @0x6dd842)",
        );
      }
      this._baseDtor(this._base, this._vttPlus10);
    }

    // @0x4b3aaa..0x4b3ab5 — PCShared_base sub-object vptr rewrite; no JS effect.

    // @0x4b3ab9..0x4b3ac2 — null-checked weak_release on control block.
    const ref = this._refControl;
    if (ref === null || ref === undefined) {
      return;
    }
    if (this._weakRelease === null) {
      throw new Error(
        "LiImageProjection.dispose: no PC_Sp_counted_base::weak_release backend injected — undecoded frontier @0x4b3ac2 (symbol stub _ZN18PC_Sp_counted_base12weak_releaseEv @0x6de4fc)",
      );
    }
    this._weakRelease(ref);
    // No writeback to _refControl — mirrors asm exactly.
  }

  /**
   * LiImageProjection::~LiImageProjection()  @0x004b3ae0  (D0, deleting)
   *
   * Faithful asm mirror (diff from D1: uses different vtable RIP offsets
   * @0x4b3ae9/@0x4b3af3 — 0x3bbca0 and 0x3bbd7e vs D1's 0x3bbd10/0x3bbdee
   * — because the RIP anchors differ, but the destinations are the SAME
   * two vtable slots [primary vtable and sub-object vtable], since the
   * final PCShared_base vptr rewrite @0x4b3b25 uses the same explicit
   * __ZTV13PCShared_base + 0x10 lea as D1 @0x4b3ab5):
   *
   *   @0x4b3ae0..0x4b3b32 — SAME logic as D1 above (vptr rewrites,
   *                         PCSharedCount::~D1 @0x4b3b02,
   *                         LiImageSource::~D2 with VTT+0x10 @0x4b3b15,
   *                         PCShared_base vptr rewrite @0x4b3b25,
   *                         null-checked weak_release @0x4b3b32).
   *   @0x4b3b37  mov  %rbx, %rdi                        ; %rdi = this
   *   @0x4b3b3a  add  $0x8, %rsp ; pop %rbx ; pop %rbp
   *   @0x4b3b40  jmp  __ZdlPv                           ; tail-call operator delete @0x6dfc36
   *
   * EH landing pad @0x4b3b45..0x4b3b48 identical to D1.
   *
   * JS GC handles the storage; we clear our references so the wrapper is
   * collectible after operator-delete would have run.
   */
  destroyAndDelete(): void {
    // Same body as D1 (same sequence of external calls at same relative offsets).
    if (this._sharedCount !== null) {
      if (this._sharedCountDtor === null) {
        throw new Error(
          "LiImageProjection.destroyAndDelete: no PCSharedCount::~D1 backend injected — undecoded frontier @0x4b3b02 (symbol stub _ZN13PCSharedCountD1Ev @0x6ddaee)",
        );
      }
      this._sharedCountDtor(this._sharedCount);
    }

    if (this._base !== null) {
      if (this._baseDtor === null) {
        throw new Error(
          "LiImageProjection.destroyAndDelete: no LiImageSource::~D2 backend injected — undecoded frontier @0x4b3b15 (symbol stub _ZN13LiImageSourceD2Ev @0x6dd842)",
        );
      }
      this._baseDtor(this._base, this._vttPlus10);
    }

    const ref = this._refControl;
    if (ref !== null && ref !== undefined) {
      if (this._weakRelease === null) {
        throw new Error(
          "LiImageProjection.destroyAndDelete: no PC_Sp_counted_base::weak_release backend injected — undecoded frontier @0x4b3b32 (symbol stub _ZN18PC_Sp_counted_base12weak_releaseEv @0x6de4fc)",
        );
      }
      this._weakRelease(ref);
    }

    // @0x4b3b40 — tail jmp to operator delete. No JS equivalent; drop refs.
    this._sharedCount = null;
    this._sharedCountDtor = null;
    this._base = null;
    this._baseDtor = null;
    this._vttPlus10 = null;
    this._refControl = null;
    this._weakRelease = null;
  }
}
