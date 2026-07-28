// LiRenderParameters.ts — Lithium's LiRenderParameters. A concrete class that
// bundles the "how do we render this scene" configuration (color space,
// filter chain, and a heavy set of shared-count/weak-count control blocks).
//
// The ledger currently exposes ONE symbol from LiRenderParameters:
//
//   0x000000000023ad70  LiRenderParameters::~LiRenderParameters()   [D2, base-object dtor]
//                       __ZN18LiRenderParametersD2Ev
//
// So this file only ports the D2 destructor. All non-destructor members
// (ctors, accessors) are not yet in the disassembly extract for Ozone.
//
// FRAMEWORK: Ozone.framework (Final Cut Pro).
// BINARY:    /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
// DECODE:    otool -tV extract from /tmp/Ozone_tV.txt at label __ZN18LiRenderParametersD2Ev.
//
// STRUCT LAYOUT recovered from the D2 body (only the offsets it touches are
// enumerated — everything else remains opaque):
//
//   +0x20..+0x30  PCArray<PCPtr<LiImageFilter>> subobject (24 bytes minimum):
//                    +0x20 vtable pointer for PCArray<PCPtr<LiImageFilter>>
//                          (installed ptr = vtable+0x10; the D2 re-stamps this
//                           pointer @0x0023adb8 before calling resize(0,1))
//                    +0x28 int32 count field (read into %eax @0x0023adbc)
//                    +0x30 heap-allocated backing storage (uint8_t[] or
//                          PCPtr<LiImageFilter>[]) — `delete[]` via stub
//                          @0x0006dfc30 (__ZdaPv) @0x0023add9
//   +0xa0         CGColorSpace* (raw CFRef) — released via PCCFRefTraits
//                 @ProCore stub 0x6dda9a @0x0023ada4.
//   +0xd0         std::shared_ptr control block pointer (PC_Sp_counted_base*
//                 style); the D2 performs the LOCK XADD strong-decrement,
//                 checks for zero, and if zero calls the vtable dispose slot
//                 *0x10 followed by __shared_weak_count::__release_weak
//                 (stub @0x0006dfbbe). See @0x0023ad86-0x0023ae0e.
//
// EMBEDDED SUBOBJECT AT +0x18:
//   After running its own body, the D2 tail-jumps into PCSharedCount::~D1
//   at (this+0x18) via stub @0x0006ddaee @0x0023adf8. That means
//   LiRenderParameters embeds a `PCSharedCount` sub-object at +0x18 — likely
//   the "am-I-still-live" self-reference used by any downstream code that
//   held a weak_ptr to this parameters object. PCSharedCount is already
//   landed at raw-port/src/infra/PCSharedCount.ts and its D1 body is a
//   verified 1:1 port of the ProCore original.
//
// UNWIND / EXCEPTION LANDING PADS (@0x0023ae1c and @0x0023ae24) both
// tail-call `___clang_call_terminate` — we do not model the C++ exception
// ABI in TypeScript, so these paths are unreachable in the port.
//
// FRONTIER CALLEES (all cited with @0xADDR at their call sites — throwing
// stubs where the callee body is not yet on-disk):
//
//   __ZN13PCCFRefTraitsIP12CGColorSpaceE7releaseES1_
//     (stub @0x0006dda9a, called @0x0023ada4)
//     PCCFRefTraits<CGColorSpace*>::release — a trivial tail-jmp to
//     _CGColorSpaceRelease. See raw-port/src/infra/PCColorSpaceHandle.ts
//     for the sibling case where this exact release is already ported and
//     the JS side no-ops it (no CoreFoundation lifecycle in JS).
//
//   __ZN7PCArrayI5PCPtrI13LiImageFilterE14PCArray_TraitsIS2_EE6resizeEii
//     (direct callq @0x0023adcb)
//     PCArray<PCPtr<LiImageFilter>>::resize(int, int) — this is the C++
//     template body for shrinking to zero-plus-hint capacity. It is not
//     yet on the port ledger for this exact template instantiation; the
//     base gnomesortImpl / badIndex is landed at PCArray_base.ts but the
//     concrete resize<>(...) instantiation is a separate compile unit.
//     THROW-STUB used below.
//
//   __ZdaPv  operator delete[](void*)
//     (stub @0x0006dfc30, called @0x0023add9 to free this->_arrayBackingAtPlus0x30)
//
//   __ZN13PCSharedCountD1Ev  PCSharedCount::~PCSharedCount [D1]
//     (stub @0x0006ddaee, TAIL-CALLED via jmp @0x0023adf8, this=(this+0x18))
//     Already ported (see raw-port/src/infra/PCSharedCount.ts).
//
//   *0x10(controlBlock->vtable)   PC_Sp_counted_base::dispose (virtual)
//     (indirect callq via `callq *0x10(%rax)` @0x0023ae03)
//     This is the polymorphic "delete the owned resource" hook. The exact
//     implementation depends on what payload was captured by the shared_ptr
//     at construction time. THROW-STUB used below.
//
//   __ZNSt3__119__shared_weak_count14__release_weakEv
//     (stub @0x0006dfbbe, called @0x0023ae09)
//     libc++ shared_ptr weak-count release. THROW-STUB used below.

import { PCSharedCount } from "../infra/PCSharedCount.js";

/**
 * Opaque raw storage of a LiRenderParameters instance. Only fields the D2
 * destructor actually reads/writes are enumerated; everything else is a
 * black box until further symbols (ctors, accessors) are added to the
 * ledger. The fields at exact offsets 0x18 / 0x20-0x30 / 0xa0 / 0xd0 are
 * the ONLY ones cited in the D2 body.
 *
 * We keep raw-address-shaped names so the mirror to the asm is literal.
 */
export interface LiRenderParametersRawStorage {
  /**
   * @0x18 — embedded PCSharedCount sub-object. D2 tail-jumps
   * into PCSharedCount::~D1 with `this + 0x18` @0x0023adf8. See
   * raw-port/src/infra/PCSharedCount.ts (its `dispose()` method is the
   * verified 1:1 port of the ProCore D1/D2 body @0x4e0fa/0x4e136).
   */
  _sharedCountAtPlus0x18: PCSharedCount;

  /**
   * @0x20 — vtable pointer of the embedded PCArray<PCPtr<LiImageFilter>>
   * subobject. The D2 re-stamps it @0x0023adb8 to the base vtable
   * (Itanium ABI vtable-in-dtor pattern) before running the array's
   * own resize.
   */
  _pcarrayVtableAtPlus0x20: unknown | null;

  /**
   * @0x28 — int32 count field of the PCArray subobject. Loaded @0x0023adbc
   * as `movl 0x28(%rbx),%eax`; used to compute the resize hint
   * (cmovnsl %eax,%edx starting from 1: keeps sign-positive or default 1).
   */
  _pcarrayCountAtPlus0x28: number;

  /**
   * @0x30 — the raw backing storage pointer for the PCArray. Freed with
   * `delete[]` @0x0023add9 after resize(0,1) then set to null @0x0023adde
   * and the count zeroed @0x0023ade6.
   */
  _pcarrayBackingAtPlus0x30: ArrayBuffer | null;

  /**
   * @0xa0 — CGColorSpace* raw handle. Released via
   * PCCFRefTraits<CGColorSpace*>::release @0x0023ada4 (which tail-jmps to
   * _CGColorSpaceRelease). In the JS port CoreFoundation lifecycle is
   * out-of-scope; we drop the reference and let GC handle the JS side.
   */
  _cgColorSpaceAtPlus0xa0: unknown | null;

  /**
   * @0xd0 — pointer to a PC_Sp_counted_base-style control block for a
   * DIFFERENT (owned-payload) shared_ptr. The D2 performs a manual
   * strong-count decrement here (lock xaddq at 0x8(%r14) @0x0023ad8e)
   * followed on-zero by dispose + weak-release. This is distinct from
   * the PCSharedCount at +0x18 — this one owns the "captured payload"
   * shared_ptr; that one is the "self-refcount for weak observers".
   */
  _weakControlBlockAtPlus0xd0: LiRenderParametersControlBlock | null;
}

/**
 * Opaque control-block interface for the shared_ptr at LiRenderParameters
 * offset +0xd0. Its vtable slot +0x10 is called polymorphically at
 * @0x0023ae03 (this is PC_Sp_counted_base::dispose in the FCP ABI); its
 * count is at +0x08 (LOCK XADD @0x0023ad8e).
 */
export interface LiRenderParametersControlBlock {
  /**
   * @0x08 (of the control block) — strong reference count (int64 per the
   * `xaddq` width). Decrement is LOCK XADDQ (%rax=-1) so it is atomic
   * across threads.
   */
  strongCountAtPlus0x08: bigint;

  /**
   * @0x00 (of the control block) — vtable pointer. Only slot +0x10
   * (dispose) is invoked here @0x0023ae03. In the raw asm this is
   * `callq *0x10(%rax)` after `movq (%r14), %rax`.
   */
  vtableAtPlus0x00: LiRenderParametersControlBlockVTable;
}

export interface LiRenderParametersControlBlockVTable {
  /**
   * *0x10 — the polymorphic dispose() hook. Called when strong count
   * reaches zero (@0x0023adfd we compare xadd's returned value with 0 and
   * jump to the dispose+release path).
   *
   * The specific dispose body depends on what the shared_ptr was
   * constructed with; we can't decode it without knowing the ctor site,
   * which is not on the ledger yet.
   */
  dispose(controlBlock: LiRenderParametersControlBlock): void;
}

// ── frontier callees (per PORTING_SPEC Rule 3 — throw citing the addr) ──

/**
 * PCCFRefTraits<CGColorSpace*>::release  @ProCore stub 0x0006dda9a
 * required-by LiRenderParameters::~D2 @0x0023ada4.
 *
 * The sibling instantiation of this trait for the same CGColorSpace
 * pointer type is already documented in raw-port/src/infra/PCColorSpaceHandle.ts
 * — its body is a bare tail-jmp to _CGColorSpaceRelease. In our JS port
 * there is no CoreFoundation to release, so we drop the reference by
 * accepting the handle and returning; the field is nulled by the caller.
 *
 * We MUST NOT throw here (this is a decoded, verified-inert-in-JS path),
 * but we cite the address on every call site.
 */
function PCCFRefTraits_CGColorSpace_release(_cs: unknown): void {
  // @0x0023ada4 — see PCColorSpaceHandle.ts. No JS work required.
}

/**
 * PCArray<PCPtr<LiImageFilter>>::resize(int, int)  @Ozone via
 * __ZN7PCArrayI5PCPtrI13LiImageFilterE14PCArray_TraitsIS2_EE6resizeEii
 * required-by LiRenderParameters::~D2 @0x0023adcb.
 *
 * NOT YET TRANSCRIBED — this concrete template instantiation is a
 * separate compilation unit; only PCArray_base helpers are on the ledger.
 * A faithful port needs the resize body which handles destructor loops
 * on the PCPtr<LiImageFilter> elements + capacity shrink logic.
 */
function PCArray_PCPtr_LiImageFilter_resize(
  _self: LiRenderParametersRawStorage,
  _hint: number,
  _newCount: number,
): void {
  throw new Error(
    "PCArray<PCPtr<LiImageFilter>>::resize(int,int) not yet transcribed — " +
      "required by LiRenderParameters::~D2 @0x0023adcb (Ozone)",
  );
}

/**
 * operator delete[](void*)  @ProCore stub 0x0006dfc30 (__ZdaPv)
 * required-by LiRenderParameters::~D2 @0x0023add9.
 *
 * In JS there is no manual delete[]; we accept the buffer and let GC
 * reclaim it. No throw — the address is cited on every call.
 */
function cxx_operator_delete_array(_buffer: ArrayBuffer | null): void {
  // @0x0023add9 — GC handles reclaim in JS; keep the address on record.
}

/**
 * PC_Sp_counted_base::dispose (virtual slot *0x10 of the control block
 * at +0xd0) — called @0x0023ae03 via `callq *0x10(%rax)` after decrementing
 * the strong count to zero.
 *
 * The specific dispose body is captured at shared_ptr construction time,
 * which is NOT on the LiRenderParameters ledger yet. Throw with citation.
 */
function controlBlock_dispose_slot0x10(
  cb: LiRenderParametersControlBlock,
): void {
  // Prefer calling the vtable slot if the caller wired a real dispose;
  // otherwise a raw stub throws citing the addr.
  if (
    cb.vtableAtPlus0x00 !== null &&
    typeof cb.vtableAtPlus0x00.dispose === "function"
  ) {
    cb.vtableAtPlus0x00.dispose(cb);
    return;
  }
  throw new Error(
    "PC_Sp_counted_base::dispose (vtable slot *0x10) not yet transcribed " +
      "for this shared_ptr instantiation — required by " +
      "LiRenderParameters::~D2 @0x0023ae03 (Ozone)",
  );
}

/**
 * std::__1::__shared_weak_count::__release_weak
 *   stub @0x0006dfbbe, called @0x0023ae09
 *
 * libc++ shared_ptr weak-count release. NOT YET TRANSCRIBED — the libc++
 * shared_ptr control-block family lives in the C++ runtime, not in the
 * FCP frameworks.
 */
function shared_weak_count_release_weak(
  _cb: LiRenderParametersControlBlock,
): void {
  throw new Error(
    "std::__1::__shared_weak_count::__release_weak (stub @0x0006dfbbe) " +
      "not yet transcribed — required by LiRenderParameters::~D2 @0x0023ae09 (Ozone)",
  );
}

// ── the port ────────────────────────────────────────────────────────────

export const LiRenderParameters = {
  /**
   * LiRenderParameters::~LiRenderParameters [D2, base-object dtor]
   * @Ozone 0x0023ad70  (__ZN18LiRenderParametersD2Ev)
   *
   * FULL disasm (from /tmp/Ozone_tV.txt, label
   * __ZN18LiRenderParametersD2Ev, starting line 590675):
   *
   *   @0x0023ad70  pushq  %rbp
   *   @0x0023ad71  movq   %rsp, %rbp
   *   @0x0023ad74  pushq  %r14
   *   @0x0023ad76  pushq  %rbx
   *   @0x0023ad77  movq   %rdi, %rbx                    ; rbx = this
   *   @0x0023ad7a  movq   0xd0(%rdi), %r14              ; r14 = this->_weakControlBlockAtPlus0xd0
   *   @0x0023ad81  testq  %r14, %r14
   *   @0x0023ad84  je     0x23ad98                      ; if null, skip whole block
   *   @0x0023ad86  movq   $-0x1, %rax
   *   @0x0023ad8d  lock
   *   @0x0023ad8e  xaddq  %rax, 0x8(%r14)               ; atomically decrement strongCount
   *   @0x0023ad93  testq  %rax, %rax                    ; rax = OLD count
   *   @0x0023ad96  je     0x23adfd                      ; if old==0 => WAS 1 pre-decrement => dispose
   *
   *   ; fall-through: didn't drop to zero -> just release CGColorSpace + PCArray + tail-D1
   *   @0x0023ad98  movq   0xa0(%rbx), %rdi              ; rdi = this->_cgColorSpaceAtPlus0xa0
   *   @0x0023ad9f  testq  %rdi, %rdi
   *   @0x0023ada2  je     0x23ada9
   *   @0x0023ada4  callq  0x6dda9a                      ; PCCFRefTraits<CGColorSpace*>::release
   *   @0x0023ada9  leaq   0x20(%rbx), %rdi              ; rdi = &this->_pcarrayVtableAtPlus0x20
   *   @0x0023adad  leaq   PCArrayVTable(%rip), %rax     ; vtable for PCArray<PCPtr<LiImageFilter>>
   *   @0x0023adb4  addq   $0x10, %rax                   ; installed ptr = vtable + 0x10
   *   @0x0023adb8  movq   %rax, 0x20(%rbx)              ; re-stamp array subobject's vptr
   *   @0x0023adbc  movl   0x28(%rbx), %eax              ; eax = current count
   *   @0x0023adbf  testl  %eax, %eax
   *   @0x0023adc1  movl   $0x1, %edx                    ; edx = 1 (the hint default)
   *   @0x0023adc6  cmovnsl %eax, %edx                   ; if count >= 0 use it, else keep 1
   *   @0x0023adc9  xorl   %esi, %esi                    ; esi = 0 (the newCount)
   *   @0x0023adcb  callq  PCArray_resize                ; resize(0, hint)
   *   @0x0023add0  movq   0x30(%rbx), %rdi              ; rdi = this->_pcarrayBackingAtPlus0x30
   *   @0x0023add4  testq  %rdi, %rdi
   *   @0x0023add7  je     0x23adde
   *   @0x0023add9  callq  0x6dfc30                      ; operator delete[](backing)
   *   @0x0023adde  movq   $0x0, 0x30(%rbx)              ; backing = null
   *   @0x0023ade6  movl   $0x0, 0x28(%rbx)              ; count   = 0
   *   @0x0023aded  addq   $0x18, %rbx                   ; rbx += 0x18  (=> &this->_sharedCountAtPlus0x18)
   *   @0x0023adf1  movq   %rbx, %rdi
   *   @0x0023adf4  popq   %rbx
   *   @0x0023adf5  popq   %r14
   *   @0x0023adf7  popq   %rbp
   *   @0x0023adf8  jmp    0x6ddaee                      ; TAIL-CALL PCSharedCount::~D1(this+0x18)
   *
   *   ; the "strong count hit zero" path (fell here from @0x23ad96):
   *   @0x0023adfd  movq   (%r14), %rax                  ; rax = controlBlock->vtable
   *   @0x0023ae00  movq   %r14, %rdi
   *   @0x0023ae03  callq  *0x10(%rax)                   ; PC_Sp_counted_base::dispose(controlBlock)
   *   @0x0023ae06  movq   %r14, %rdi
   *   @0x0023ae09  callq  0x6dfbbe                      ; __shared_weak_count::__release_weak
   *   @0x0023ae0e  movq   0xa0(%rbx), %rdi
   *   @0x0023ae15  testq  %rdi, %rdi
   *   @0x0023ae18  jne    0x23ada4                      ; re-enter fall-through at CG-release
   *   @0x0023ae1a  jmp    0x23ada9                      ; ...or skip straight to PCArray dtor
   *
   *   ; unwind landing pads @0x0023ae1c/0x0023ae24 both jmp ___clang_call_terminate — unreachable
   *   ; in JS port because we don't model the C++ exception ABI.
   *
   * Faithful port below preserves the branch order exactly.
   */
  D2(self: LiRenderParametersRawStorage): void {
    // @0x0023ad7a-@0x0023ad84  test _weakControlBlockAtPlus0xd0
    const cb = self._weakControlBlockAtPlus0xd0;
    if (cb !== null) {
      // @0x0023ad86-@0x0023ad8e  lock xaddq $-1, 0x8(%r14)  — atomic strong-count decrement.
      // JS is single-threaded so a plain read-decrement-write is bit-equivalent.
      const oldStrong = cb.strongCountAtPlus0x08;
      cb.strongCountAtPlus0x08 = oldStrong - 1n;
      // @0x0023ad93-@0x0023ad96  testq %rax,%rax ; je 0x23adfd  (i.e. if OLD count was zero,
      // then this decrement brought it to -1 — the "we were the last holder" branch).
      // NOTE: the "old count == 0" condition here mirrors the boost/libc++ idiom where
      // a pre-decrement of 1 leaves rax=0; the test is `testq %rax,%rax`. The disasm
      // uses `je` after that test — so we take the dispose path when oldStrong == 0.
      if (oldStrong === 0n) {
        // @0x0023adfd-@0x0023ae03  callq *0x10(controlBlock->vtable) — dispose
        controlBlock_dispose_slot0x10(cb);
        // @0x0023ae06-@0x0023ae09  callq __shared_weak_count::__release_weak(controlBlock)
        shared_weak_count_release_weak(cb);
        // @0x0023ae0e-@0x0023ae1a  re-enter the fall-through path at the CG-release step,
        // OR skip straight to the PCArray dtor if the CG pointer is null.
        if (self._cgColorSpaceAtPlus0xa0 !== null) {
          // @0x0023ae18 jne 0x23ada4  (loop back and take the CG release call)
          PCCFRefTraits_CGColorSpace_release(self._cgColorSpaceAtPlus0xa0);
        }
        // fall through into PCArray dtor + PCSharedCount tail
      } else {
        // @0x0023ad98-@0x0023ada4  release CG color space (if non-null)
        if (self._cgColorSpaceAtPlus0xa0 !== null) {
          PCCFRefTraits_CGColorSpace_release(self._cgColorSpaceAtPlus0xa0);
        }
        // fall through into PCArray dtor + PCSharedCount tail
      }
    } else {
      // @0x0023ad84 je 0x23ad98  — control block was null, skip its release entirely
      // @0x0023ad98-@0x0023ada4  release CG color space (if non-null)
      if (self._cgColorSpaceAtPlus0xa0 !== null) {
        PCCFRefTraits_CGColorSpace_release(self._cgColorSpaceAtPlus0xa0);
      }
    }

    // @0x0023adad-@0x0023adb8  re-stamp PCArray subobject vtable pointer.
    // We DO NOT model the C++ vtable in JS (dispatch is handled by our own
    // TS-level "operator" object). Preserve the field write as a null-out
    // so any accidental reuse fails loudly rather than silently invoking
    // methods on a half-torn-down subobject.
    self._pcarrayVtableAtPlus0x20 = null;

    // @0x0023adbc-@0x0023adcb  resize(0, hint) — hint = max(1, this->_pcarrayCountAtPlus0x28).
    // The `cmovnsl` picks the arg if it's sign-positive, keeping the default $1 otherwise.
    const currentCount = self._pcarrayCountAtPlus0x28 | 0; // read as signed int32
    // NOTE: the `movl $0x1, %edx ; cmovnsl %eax, %edx` idiom means:
    //   edx = (eax >= 0) ? eax : 1
    // (SF is 0 for non-negative, and cmovns loads on "not sign", i.e. SF==0).
    const hint = currentCount >= 0 ? currentCount : 1;
    PCArray_PCPtr_LiImageFilter_resize(self, 0, hint);

    // @0x0023add0-@0x0023add9  delete[] this->_pcarrayBackingAtPlus0x30 if non-null
    if (self._pcarrayBackingAtPlus0x30 !== null) {
      cxx_operator_delete_array(self._pcarrayBackingAtPlus0x30);
    }
    // @0x0023adde  movq $0x0, 0x30(%rbx)
    self._pcarrayBackingAtPlus0x30 = null;
    // @0x0023ade6  movl $0x0, 0x28(%rbx)
    self._pcarrayCountAtPlus0x28 = 0;

    // @0x0023aded-@0x0023adf8  tail-call PCSharedCount::~D1 on (this + 0x18).
    // Already ported at raw-port/src/infra/PCSharedCount.ts — the D1/D2
    // bodies are exposed as PCSharedCount.dispose().
    self._sharedCountAtPlus0x18.dispose();
  },
};
