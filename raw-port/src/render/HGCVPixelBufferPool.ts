// raw-port/src/render/HGCVPixelBufferPool.ts
//
// FCP `HGCVPixelBufferPool` — Helium's CoreVideo pixel-buffer pool facade.
// The class is a thin `HGObject` subclass that owns a heap-allocated
// `HGCVPixelBufferPoolImpl` (a `HGPool::BasePool` subclass) and forwards
// pool operations to it. `getPoolHandle()` is the raw accessor for that
// owned impl pointer.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Helium.framework/Versions/A/Helium (x86_64 slice; VAs below
//             are unadjusted VM addresses, as printed by otool -tV).
// Disassembly saved at:
//   raw-port/re/disasm/Helium.__ZNK19HGCVPixelBufferPool13getPoolHandleEv.s  @0x1dec50
// Layout evidence (read, not ported here):
//   raw-port/re/disasm/Helium.__ZN19HGCVPixelBufferPoolC2Ev.s                @0x1dea20
//   raw-port/re/disasm/Helium.__ZN19HGCVPixelBufferPoolD2Ev.s                @0x1deb60
//
// STRUCT LAYOUT (recovered from the C2 ctor @0x1dea20 and the D2 dtor
// @0x1deb60 — the only two functions that touch fields of this class):
//   HGCVPixelBufferPool : public HGObject {
//     +0x000  void*              vtable    // installed by C2 @0x1dea3e
//                                          // (`leaq 0x84c10a(%rip),%rax ;
//                                          //   movq %rax,(%rbx)`), reinstalled
//                                          //   by D2 @0x1deb70
//     +0x008  u32                refCount  // inherited from HGObject
//                                          // (HGObject::HGObject called at
//                                          //  @0x1dea32; sizeof(HGObject)=0x10)
//     +0x010  HGPool::BasePool*  impl      // the owned HGCVPixelBufferPoolImpl
//   }
//
// Evidence that +0x10 is the impl pointer:
//   * C2 @0x1dea6f  `movl $0x178,%edi ; callq __Znwm`   — allocates a
//                    0x178-byte HGCVPixelBufferPoolImpl into %r12,
//     @0x1dea8f  `callq __ZN23HGCVPixelBufferPoolImplC2ERKNSt3__110shared_ptrIN6HGPool9AllocatorIP10__CVBufferN19HGCVPixelBufferPool10DescriptorEEEEE`
//                    — constructs it,
//     @0x1dea9b  `movq %r12, 0x10(%rbx)`                — stores it at +0x10,
//     @0x1deac1  `movq 0x10(%rbx),%rdi ;`
//     @0x1deac5  `callq __ZN6HGPool12registerPoolEPNS_8BasePoolE`
//                    — passes *(this+0x10) as a `HGPool::BasePool*`, which
//                      pins the static type of the slot.
//   * D2 @0x1deb73  `movq 0x10(%rdi),%rdi ;`
//     @0x1deb77  `callq __ZN6HGPool14unregisterPoolEPNS_8BasePoolE`
//                    — same slot, same `HGPool::BasePool*` parameter type,
//     @0x1deb7c..@0x1deb88 null-checks *(this+0x10) then virtual-calls
//                    `*0x8(vtbl)` on it (the D0 deleting dtor slot).
//
// ─── getPoolHandle @Helium 0x1dec50 (const) ─────────────────────────────────
//   __ZNK19HGCVPixelBufferPool13getPoolHandleEv:
//     0x1dec50 pushq %rbp
//     0x1dec51 movq  %rsp, %rbp
//     0x1dec54 movq  0x10(%rdi), %rax        ; %rax = this->impl
//     0x1dec58 popq  %rbp
//     0x1dec59 retq                          ; return this->impl
//     0x1dec5a nopw  (%rax,%rax)             ; alignment padding, not code
//
//   The entire body is one load. There is no null check, no refcount
//   traffic, and no virtual dispatch: the caller receives the raw owned
//   `HGPool::BasePool*` at +0x10 verbatim (ownership stays with the pool).
//
// Numerics: none — the function moves a single 64-bit pointer. Math.fround
// is not applicable.

import { HGObject } from "./HGObject.js";

/**
 * Opaque handle for the pool implementation stored at
 * `HGCVPixelBufferPool+0x10`.
 *
 * The binary pins its static type to `HGPool::BasePool*`: the ctor passes
 * the slot to `HGPool::registerPool(HGPool::BasePool*)` @0x1deac5 and the
 * dtor passes it to `HGPool::unregisterPool(HGPool::BasePool*)` @0x1deb77.
 * The dynamic type is `HGCVPixelBufferPoolImpl` (0x178 bytes, allocated at
 * @0x1dea6f and constructed at @0x1dea8f). Neither `HGPool::BasePool` nor
 * `HGCVPixelBufferPoolImpl` is transcribed yet, and `getPoolHandle` never
 * dereferences the pointer — it only copies the 64-bit slot — so the handle
 * is branded here rather than given structure.
 */
export type HGPoolBasePoolPtr = {
  readonly __brand: "HGPool::BasePool*";
};

/**
 * `HGCVPixelBufferPool` — Helium's CoreVideo pixel-buffer pool.
 *
 * Only `getPoolHandle()` is transcribed in this file so far; the remaining
 * members of the class (C1/C2 @0x1dea20/@0x1deb50, D0/D1/D2
 * @0x1dec00/@0x1debb0/@0x1deb60, setLabel @0x1dec60, setAllocationPolicy
 * @0x1dec80, setServicingPolicy @0x1dece0, setRecyclingPolicy @0x1ded60,
 * clean @0x1deee0 / @0x1df170, clear @0x1df070, log @0x1df190,
 * trace @0x1df1a0, validateBuffer @0x1df1b0, …) land in later units and
 * must be ADDED to this class body without disturbing what is here.
 */
export class HGCVPixelBufferPool extends HGObject {
  /**
   * The owned pool implementation pointer at struct offset +0x10.
   *
   * Written once by the ctor @0x1dea9b (`movq %r12, 0x10(%rbx)`), read by
   * the ctor @0x1deac1, by the dtor @0x1deb73/@0x1deb7c, and by
   * `getPoolHandle` @0x1dec54. Typed `HGPool::BasePool*` by the
   * register/unregister call signatures.
   */
  impl: HGPoolBasePoolPtr | null = null;

  /**
   * `HGCVPixelBufferPool::getPoolHandle() const` — @Helium 0x1dec50.
   *
   * Single-instruction body: load the 64-bit slot at `this+0x10` into %rax
   * and return it.
   *
   *   @0x1dec54 movq 0x10(%rdi), %rax   // %rax = this->impl
   *   @0x1dec59 retq                    // return %rax
   */
  getPoolHandle(): HGPoolBasePoolPtr | null {
    // @0x1dec54
    return this.impl;
  }
}
