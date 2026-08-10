// HGGPUResources.ts — Helium's per-Metal-device GPU resource owner.
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// EXPORTED SYMBOL (this file):
//   @Helium 0x00000000001a7610
//     HGGPUResources::getCVTextureCacheRetainedRef()
//     mangled: __ZN14HGGPUResources28getCVTextureCacheRetainedRefEv
//
// SOURCE DISASSEMBLY:
//   raw-port/re/disasm/Helium.__ZN14HGGPUResources28getCVTextureCacheRetainedRefEv.s
//   (24 lines)
//
// Every other HGGPUResources method (getDeviceResources, the ctor/dtors,
// forceResetCVTextureCache, setCVTextureCacheMaximumTextureAge,
// flushFreeObjects, releaseFreeObjects, setup*Policies, ...) is its own
// ledger unit and is deliberately NOT written here.
//
// ═══════════════════════════════════════════════════════════════════════════
// STRUCT LAYOUT (only the offsets this method touches, plus the two the
// grounding methods below pin)
// ═══════════════════════════════════════════════════════════════════════════
//
//   +0x50  std::mutex   cacheMutex
//   +0x90  CVMetalTextureCacheRef  cvTextureCache
//   +0x98  float        cvTextureCacheMaximumTextureAge
//
// GROUNDING — `HGGPUResources::forceResetCVTextureCache()` @Helium 0x1a70a0
// writes the slot this method reads, under the SAME mutex, which is what
// identifies both offsets:
//   @0x1a7167  leaq 0x50(%rbx), %r14           ; the same +0x50 object
//   @0x1a716e  callq std::mutex::lock          ; ...taken as a mutex
//   @0x1a7173  movq 0x90(%rbx), %rdi           ; the OLD cache
//   @0x1a717d/@0x1a717f  je / callq _CFRelease ; released if non-null
//   @0x1a7184  movq %r15, 0x90(%rbx)           ; store the NEW cache, where
//                                              ;   %r15 came from the
//                                              ;   `_CVMetalTextureCacheCreate`
//                                              ;   out-param @0x1a7135
//   @0x1a718e  callq std::mutex::unlock
// So +0x90 holds a `CVMetalTextureCacheRef` (a CoreFoundation object — hence
// the CFRetain here and the CFRelease there) and +0x50 is the std::mutex that
// serialises access to it.
//
// +0x98 is pinned by `HGGPUResources::setCVTextureCacheMaximumTextureAge(float)`
// @Helium 0x1a7664 (`movss %xmm0, 0x98(%rdi)`), and read back by
// forceResetCVTextureCache @0x1a70c8 (`movss 0x98(%rdi), %xmm0`) to build the
// `kCVMetalTextureCacheMaximumTextureAgeKey` CFNumber @0x1a70e0. It is listed
// here only as layout context — this method does not touch it.
//
// ═══════════════════════════════════════════════════════════════════════════
// DECODE OF getCVTextureCacheRetainedRef @0x1a7610 (AT&T)
// ═══════════════════════════════════════════════════════════════════════════
//
//   0x1a7610  pushq %rbp
//   0x1a7611  movq  %rsp, %rbp
//   0x1a7614  pushq %r14
//   0x1a7616  pushq %rbx
//   0x1a7617  movq  %rdi, %r14              ; r14 = this
//   0x1a761a  leaq  0x50(%rdi), %rbx        ; rbx = &this->cacheMutex
//   0x1a761e  movq  %rbx, %rdi
//   0x1a7621  callq std::mutex::lock        ; @stub 0x3c4f16
//   0x1a7626  movq  0x90(%r14), %rdi        ; rdi = this->cvTextureCache
//   0x1a762d  callq _CFRetain               ; @stub 0x3c4b20  — +1 retain
//   0x1a7632  movq  0x90(%r14), %r14        ; RE-READ the field into r14
//   0x1a7639  movq  %rbx, %rdi
//   0x1a763c  callq std::mutex::unlock      ; @stub 0x3c4f1c
//   0x1a7641  movq  %r14, %rax              ; return the RE-READ pointer
//   0x1a7644  popq  %rbx
//   0x1a7645  popq  %r14
//   0x1a7647  popq  %rbp
//   0x1a7648  retq
//   ---- exception landing pad (std::lock_guard unwind cleanup) ----
//   0x1a7649  movq  %rax, %r14              ; save the exception object
//   0x1a764c  movq  %rbx, %rdi
//   0x1a764f  callq std::mutex::unlock      ; release the lock while unwinding
//   0x1a7654  movq  %r14, %rdi
//   0x1a7657  callq __Unwind_Resume         ; @stub 0x3c4e02
//   0x1a765c  nopl  (%rax)                  ; padding
//
// TWO DETAILS WORTH CALLING OUT:
//
//  1. The returned pointer is the RE-READ of `this->cvTextureCache` @0x1a7632,
//     NOT `CFRetain`'s return value in %rax. CFRetain returns its argument, so
//     the two agree; the reload exists because the compiler cannot prove the
//     call did not alias the field. Transcribed literally: retain, then read
//     the field again.
//
//  2. `CFRetain` is called UNCONDITIONALLY — there is no null check, unlike
//     `forceResetCVTextureCache` @0x1a717a, which explicitly tests the same
//     field before releasing it. So calling this before the cache has been
//     created is `CFRetain(NULL)`, i.e. C undefined behaviour; the port raises
//     rather than inventing a value (PORTING_SPEC Rule 3).
//
// The landing pad is dead in normal control flow (neither `std::mutex::lock`
// nor `CFRetain` throws here), and it performs no work the happy path does
// not already do, so it is documented rather than modelled — matching the way
// TextureDeleteQueueLock.ts treats its `___clang_call_terminate` pad.
//
// ── Callees ─────────────────────────────────────────────────────────────────
//   ZERO in-scope callees (`depgraph.py deps
//   __ZN14HGGPUResources28getCVTextureCacheRetainedRefEv` prints nothing).
//   All three calls are TRUE out-of-scope externs reached through stubs:
//     __ZNSt3__15mutex4lockEv    @stub 0x3c4f16  (libc++)
//     __ZNSt3__15mutex6unlockEv  @stub 0x3c4f1c  (libc++)
//     _CFRetain                  @stub 0x3c4b20  (CoreFoundation)
//   plus `__Unwind_Resume` @stub 0x3c4e02 on the dead landing pad.
//   No indirect or virtual calls in the body.
//
// ── END DECODE ──────────────────────────────────────────────────────────────

/**
 * Opaque `std::mutex` embedded at HGGPUResources +0x50. Modelled the same way
 * `TextureDeleteQueueLock.ts` models the queue's `pthread_mutex_t` at +0x80
 * (an opaque brand exposing exactly the operations the binary performs on it)
 * — the libc++ threading runtime itself is out of scope.
 *
 * @see Helium 0x3c4f16  __ZNSt3__15mutex4lockEv   (stub)
 * @see Helium 0x3c4f1c  __ZNSt3__15mutex6unlockEv (stub)
 */
export interface StdMutex {
  /** Native: `std::mutex::lock()`. @see Helium 0x3c4f16 (stub). */
  lock(): void;
  /** Native: `std::mutex::unlock()`. @see Helium 0x3c4f1c (stub). */
  unlock(): void;
}

/**
 * Opaque `CVMetalTextureCacheRef`. In the binary this is a CoreFoundation
 * object created by `_CVMetalTextureCacheCreate` @0x1a7135 inside
 * `forceResetCVTextureCache`; nothing here inspects it, so it stays a brand.
 *
 * @see Helium 0x1a7184  (`movq %r15, 0x90(%rbx)` — where it is installed)
 */
export interface CVMetalTextureCacheRef {
  readonly __brand: "CVMetalTextureCacheRef";
}

/**
 * `HGGPUResources` — the subset of the object this method reads.
 *
 * @Helium 0x00000000001a7610
 */
export interface HGGPUResources {
  /**
   * +0x50 — the `std::mutex` serialising access to {@link cvTextureCache}.
   * @Helium 0x1a761a (`leaq 0x50(%rdi), %rbx`), corroborated by the identical
   * `leaq 0x50(%rbx), %r14` @0x1a7167 in forceResetCVTextureCache.
   */
  readonly cacheMutex_at_0x50: StdMutex;
  /**
   * +0x90 — the `CVMetalTextureCacheRef`. Read here @0x1a7626/@0x1a7632;
   * written by forceResetCVTextureCache @0x1a7184.
   */
  cvTextureCache_at_0x90: CVMetalTextureCacheRef | null;
}

/**
 * `CFRetain(cf)` @Helium stub 0x3c4b20 — a TRUE out-of-scope CoreFoundation
 * extern. Increments the object's retain count and returns the SAME pointer.
 *
 * Modelled as an identity no-op, the policy this port already applies to
 * `CGColorSpaceRetain` in `createExtendedColorSpace.ts`: JS owns object
 * lifetime through GC, and CoreFoundation guarantees the returned pointer is
 * identity-equal to the argument, so callers that only observe pointer
 * identity see bit-faithful behaviour.
 *
 * `CFRetain(NULL)` is undefined behaviour in CoreFoundation, and the call
 * site @0x1a762d performs NO null check, so a null argument raises here
 * instead of silently succeeding.
 *
 * @Helium 0x00000000003c4b20
 */
function CFRetain(cf: CVMetalTextureCacheRef | null): CVMetalTextureCacheRef {
  if (cf === null) {
    throw new Error(
      "CFRetain(NULL) — HGGPUResources::getCVTextureCacheRetainedRef calls " +
        "_CFRetain @Helium stub 0x3c4b20 on this->cvTextureCache (+0x90) with " +
        "NO null check @0x1a7626/@0x1a762d, unlike forceResetCVTextureCache " +
        "@0x1a717a which does test the same field. A null cache here is " +
        "CoreFoundation undefined behaviour; the cache must be created by " +
        "forceResetCVTextureCache @Helium 0x1a70a0 first. @Helium 0x1a7610",
    );
  }
  // @0x3c4b20 — retain is a no-op under JS GC; identity is preserved.
  return cf;
}

/**
 * `HGGPUResources::getCVTextureCacheRetainedRef()` — @Helium 0x1a7610
 *   mangled: __ZN14HGGPUResources28getCVTextureCacheRetainedRefEv
 *
 * Takes the +0x50 `std::mutex`, `CFRetain`s the `CVMetalTextureCacheRef` at
 * +0x90, re-reads that field, drops the mutex, and returns the re-read
 * pointer — i.e. hands the caller a +1-retained reference to the device's
 * Metal texture cache.
 *
 * Faithful line-for-line transcription of the 24-line disassembly decoded
 * above. No in-scope callees; the only calls are the out-of-scope
 * `std::mutex::lock`/`unlock` and `CFRetain` externs.
 *
 * @param self `this` (%rdi).
 * @returns the retained cache reference (the value of %rax at @0x1a7641).
 */
export function HGGPUResources_getCVTextureCacheRetainedRef(
  self: HGGPUResources,
): CVMetalTextureCacheRef {
  // @0x1a761a-0x1a7621: leaq 0x50(%rdi), %rbx ; std::mutex::lock(&mutex)
  const mutex = self.cacheMutex_at_0x50;
  mutex.lock();
  try {
    // @0x1a7626-0x1a762d: CFRetain(this->cvTextureCache)  — no null check.
    CFRetain(self.cvTextureCache_at_0x90);
    // @0x1a7632: movq 0x90(%r14), %r14 — RE-READ the field; this, not
    //   CFRetain's %rax, is what gets returned.
    const reread = self.cvTextureCache_at_0x90;
    // @0x1a7641: movq %r14, %rax
    return reread as CVMetalTextureCacheRef;
  } finally {
    // @0x1a763c: std::mutex::unlock(&mutex) on the normal path, and the same
    //   unlock at @0x1a764f on the exception landing pad before
    //   __Unwind_Resume — `finally` expresses exactly that pair.
    mutex.unlock();
  }
}
