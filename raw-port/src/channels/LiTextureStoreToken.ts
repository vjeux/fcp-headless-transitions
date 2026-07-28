// LiTextureStoreToken — Ozone.framework thin handle that owns a single
// `std::shared_ptr<T>` (T is not observable from the dtor alone). The class
// exports ONLY its D1 destructor to the linker; every other operation on
// LiTextureStoreToken is defined inline in headers (empty(), etc.) — as
// evidenced by `__ZNK19LiTextureStoreToken5emptyEv` appearing as a U
// (undefined-external) reference from other Ozone TUs but never as a defined
// symbol here. This class is passed by-const-ref throughout Ozone to
// `OZLayeredMaterial::addToken`, `LiMaterial::setTexture`, and
// `OZMaterialCompoundLayer::setUpSampler / setUpTexture`.
//
// FAITHFUL PORT — do NOT approximate. Every method cites @0xADDR (Ozone).
//
// Framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Symbols in Ozone's T-table for this class (from `nm | c++filt`):
//   __ZN19LiTextureStoreTokenD1Ev   LiTextureStoreToken::~LiTextureStoreToken()   @0x2cae0
//     (lowercase 't' — internal linkage after ICF collapse. The body at
//      0x2cae0 is shared by any other libc++ `shared_ptr<T>::~shared_ptr()`
//      that resolves to the same 63-byte epilogue-shape; the identity of
//      LiTextureStoreToken lives in its layout and call-sites, not in a
//      unique dtor body.)
//
// Undefined externals that hint at the shape but aren't defined here:
//   __ZNK19LiTextureStoreToken5emptyEv                     empty() const — header-inline
//   __ZN10LiMaterial10setTextureERKN8ProShade7SamplerERK19LiTextureStoreTokenbRK14PCMatrix44TmplIdE
//                                                          consumer: LiMaterial::setTexture
//   __ZN17OZLayeredMaterial8addTokenERK9PCHash128RK19LiTextureStoreToken
//                                                          consumer: OZLayeredMaterial::addToken
//   __ZN19OZMaterialLayerBase8addTokenERK9PCHash128RK19LiTextureStoreToken
//                                                          consumer: OZMaterialLayerBase::addToken
//
// ── STRUCT LAYOUT (recovered from the destructor body @0x2cae0) ──────────────
//   LiTextureStoreToken {                                   (a std::shared_ptr<T>)
//     +0x00  __ptr_  : T*                     (raw stored pointer; NOT touched
//                                              by the dtor — the deleter chain
//                                              in `__on_zero_shared` frees it.)
//     +0x08  __cntrl_: __shared_weak_count*   (nullable — empty shared_ptr.
//                                              The dtor's ONLY reads happen at
//                                              this offset.)
//   }
//   sizeof(LiTextureStoreToken) = 0x10 = 16 bytes (the libc++ shared_ptr size).
//   No other field is touched by the dtor, so the class has no additional
//   fields the ABI cares about.
//
// The dtor body is the libc++ `std::shared_ptr<T>::~shared_ptr()` folded via
// ICF onto every shared_ptr<T> across Ozone that has the same epilogue shape.
// It exercises exactly one control-block operation: atomically decrement
// `shared_owners_` at cb+0x8; on hitting zero (old value == 0 after pre-dec of
// -1), call vtable slot +0x10 (`__on_zero_shared`) then tail-jmp to
// `__shared_weak_count::__release_weak()`. This mirrors PGHGImageRef's dtor
// at Ozone 0x50c320 (already ported at raw-port/src/channels/PGHGImageRef.ts)
// with two simplifications: LiTextureStoreToken has (1) NO vptr rebind (this
// class has no vtable — it's a pure value class), and (2) NO HGObject base
// subobject (no tail-jmp to HGObject::~HGObject).
//
// ── DECODE reference ─────────────────────────────────────────────────────────
//   Ozone.LiTextureStoreToken.~LiTextureStoreToken.s     @0x2cae0 (26 lines)

// ─── Frontier callees (undecoded — throw per PORTING_SPEC Rule 3) ────────────

/**
 * libc++ __shared_weak_count::__release_weak() — atomically decrement the
 * weak-count of the control block and, on hitting zero, free the control
 * block itself via `__on_zero_shared_weak()`.
 *
 * Call site:
 *   @Ozone 0x2cb1a — `jmp 0x6dfbbe ## symbol stub for:
 *                     __ZNSt3__119__shared_weak_count14__release_weakEv`
 *
 * Imported from libc++.dylib — not decoded in this port. Modeled as a
 * throwing stub that cites its addr, so `frontier.py` can see the gap.
 */
function __shared_weak_count__release_weak(_cb: SharedWeakCount): void {
  throw new Error(
    "__shared_weak_count::__release_weak() not yet transcribed — " +
      "@Ozone 0x2cb1a (tail-jmp) — libc++.dylib import stub 0x6dfbbe",
  );
}

/**
 * Control-block vtable slot +0x10 = `__on_zero_shared()`. Invoked exactly
 * when the strong count hits zero. Its concrete implementation is on the
 * specific `__shared_ptr_pointer<T, Deleter, Allocator>` subclass of
 * `__shared_weak_count` that was constructed alongside the shared_ptr —
 * so the concrete callee depends on WHICH shared_ptr instance we're
 * destroying.
 *
 * Call site:
 *   @Ozone 0x2cb08 — `movq (%rbx), %rax`   (%rax = cb->vptr)
 *   @Ozone 0x2cb0e — `callq *0x10(%rax)`   (vtable +0x10 = __on_zero_shared)
 *
 * Since LiTextureStoreToken's T is not known at this layer (the dtor is
 * ICF-collapsed and shared across many shared_ptr<T>s), this callee has no
 * unique target. Modeled as a throwing stub keyed on the call-site addr.
 */
function shared_weak_count__on_zero_shared(_cb: SharedWeakCount): void {
  throw new Error(
    "__shared_weak_count::__on_zero_shared() (vtable slot +0x10) not yet transcribed — " +
      "@Ozone 0x2cb0e — resolves per-shared_ptr<T> to __shared_ptr_pointer<T,D,A>::__on_zero_shared",
  );
}

// ─── Opaque support types ────────────────────────────────────────────────────

/**
 * Opaque libc++ `std::__1::__shared_weak_count` subclass — the control block
 * of the shared_ptr held at LiTextureStoreToken+0x08. Only the fields the
 * dtor touches are surfaced (vptr for the +0x10 indirect call, plus the
 * `shared_owners_` field at +0x8 that the xaddq updates).
 *
 * Note: in libc++, `shared_owners_` stores (strong count - 1). The xaddq at
 * @0x2caf7 pre-decrements it by 1 and returns the OLD value. When the OLD
 * value is 0 it means the last strong owner is going away (post-dec = -1,
 * i.e. no strong owners left), which is why the je-on-zero fires the
 * on_zero_shared sink.
 */
export interface SharedWeakCount {
  /** +0x00 — vptr into the concrete `__shared_ptr_pointer<T,D,A>` vtable. */
  vptr: unknown;
  /** +0x08 — libc++ `shared_owners_`, i.e. (strong count - 1). Atomic. */
  shared_owners_: bigint;
}

// ─── The class ───────────────────────────────────────────────────────────────

/**
 * LiTextureStoreToken — see file header for provenance.
 *
 * Only the fields the destructor reads are modelled; +0x00 (`__ptr_`) is
 * present for layout correctness but NEVER read by the dtor — its lifetime
 * is entirely owned by cb's on_zero_shared deleter.
 */
export class LiTextureStoreToken {
  /**
   * @Ozone +0x00 — the raw stored pointer of the embedded shared_ptr<T>.
   * NOT touched by the dtor. Typed as `unknown` because the templated T is
   * not observable from an ICF-collapsed dtor body.
   */
  __ptr_: unknown = null;

  /**
   * @Ozone +0x08 — the strong-shared control block. `null` models an empty
   * shared_ptr (the `testq %rbx,%rbx ; je 0x2cb01` guard at @0x2caea).
   */
  __cntrl_: SharedWeakCount | null = null;

  /**
   * LiTextureStoreToken::~LiTextureStoreToken()  @Ozone 0x2cae0.
   *
   * Line-for-line (26 lines of decoded body):
   *   0x2cae0 pushq %rbp
   *   0x2cae1 movq  %rsp, %rbp
   *   0x2cae4 pushq %rbx
   *   0x2cae5 pushq %rax                       ; stack alignment + scratch slot
   *   0x2cae6 movq  0x8(%rdi), %rbx            ; %rbx = this->__cntrl_
   *   0x2caea testq %rbx, %rbx
   *   0x2caed je    0x2cb01                    ; if cb == null: skip → epilogue
   *   0x2caef movq  $-0x1, %rax
   *   0x2caf6 lock
   *   0x2caf7 xaddq %rax, 0x8(%rbx)            ; atomic { old = cb->shared_owners_;
   *                                            ;          cb->shared_owners_ = old - 1;
   *                                            ;          rax = old; }
   *   0x2cafc testq %rax, %rax
   *   0x2caff je    0x2cb08                    ; if old == 0 → last strong owner
   *   ── skinny path: cb was null OR strong count still positive ──────────
   *   0x2cb01 addq  $0x8, %rsp
   *   0x2cb05 popq  %rbx
   *   0x2cb06 popq  %rbp
   *   0x2cb07 retq
   *   ── heavy path: strong count hit zero, sink the object then weak-release ─
   *   0x2cb08 movq  (%rbx), %rax               ; %rax = cb->vptr
   *   0x2cb0b movq  %rbx, %rdi                 ; %rdi = cb (arg1 for callq)
   *   0x2cb0e callq *0x10(%rax)                ; vtable[+0x10] = __on_zero_shared()
   *   0x2cb11 movq  %rbx, %rdi                 ; %rdi = cb (arg1 for tail-jmp)
   *   0x2cb14 addq  $0x8, %rsp
   *   0x2cb18 popq  %rbx
   *   0x2cb19 popq  %rbp
   *   0x2cb1a jmp   0x6dfbbe                   ; tail-jmp __shared_weak_count::__release_weak()
   *
   * Semantics equivalence (libc++ shared_ptr::~shared_ptr):
   *
   *   if (cb) {
   *     if (--cb->shared_owners_ == -1) {     // fetch_sub(1) returned 0 → was last strong owner
   *       cb->__on_zero_shared();             // vtable slot +0x10: invoke deleter on __ptr_
   *       cb->__release_weak();               // decrement weak count; if zero, free cb
   *     }
   *   }
   *
   * The two frontier callees (`__on_zero_shared` at slot +0x10 and libc++
   * `__release_weak`) are modeled as throwing stubs above; a runtime
   * invocation of them fails loudly per PORTING_SPEC Rule 3.
   *
   * NOTE ON ATOMICS: JavaScript's SharedArrayBuffer + Atomics.sub give a
   * bit-exact analogue of `lock xaddq`. We do NOT use them here because the
   * TS port models the class as a plain object; concurrent use across
   * workers would require a different in-memory representation entirely.
   * The `--x` below is the single-threaded equivalent that matches the
   * observable behaviour of the shipped x64 code on a single thread.
   */
  destroy(): void {
    // @0x2cae6..0x2caed — read cb; if null, tail-return.
    const cb = this.__cntrl_;
    if (cb === null) {
      // @0x2cb01..0x2cb07 — skinny epilogue.
      return;
    }
    // @0x2caef..0x2cafc — atomic pre-decrement of shared_owners_.
    //   old = cb.shared_owners_; cb.shared_owners_ = old - 1n; ...
    const old = cb.shared_owners_;
    cb.shared_owners_ = old - 1n;
    // @0x2cafc..0x2caff — branch on old == 0 (i.e. was last strong owner).
    if (old !== 0n) {
      // @0x2cb01..0x2cb07 — skinny epilogue (strong count still positive
      // after the pre-decrement).
      return;
    }
    // @0x2cb08..0x2cb0e — heavy path: strong count hit zero.
    //   vptr = cb.vptr (read but not needed in TS — we dispatch by method).
    // @0x2cb0e — callq *0x10(%rax) = __on_zero_shared(cb).
    shared_weak_count__on_zero_shared(cb);
    // @0x2cb1a — tail-jmp __shared_weak_count::__release_weak(cb).
    __shared_weak_count__release_weak(cb);
  }
}
