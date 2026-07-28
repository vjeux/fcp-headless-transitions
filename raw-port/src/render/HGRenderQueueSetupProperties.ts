// HGRenderQueueSetupProperties.ts — FCP Helium framework class.
// Transcribed from the x86_64 disassembly of Helium in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
// Versions/A/Helium (see raw-port/re/disasm/Helium.HGRenderQueueSetupProperties.*.s).
//
// Symbols (nm | c++filt):
//   0x70f40 t HGRenderQueueSetupProperties::~HGRenderQueueSetupProperties()  (D1)
//   0x710b0 t HGRenderQueueSetupProperties::HGRenderQueueSetupProperties()   (C2 base ctor)
//   0x71200 t HGRenderQueueSetupProperties::~HGRenderQueueSetupProperties()  (D0 deleting)
//
// PROVENANCE / DECODE:
//   raw-port/re/disasm/Helium.HGRenderQueueSetupProperties.HGRenderQueueSetupProperties.s
//   raw-port/re/disasm/Helium.HGRenderQueueSetupProperties.~HGRenderQueueSetupProperties.s (D0)
//   /tmp/Helium_tV.txt inspected for D1 body @0x70f40.
//   Referenced externs:
//     __ZTV28HGRenderQueueSetupProperties       vtable for HGRenderQueueSetupProperties
//     __ZN8HGObjectC2Ev                          HGObject::HGObject()
//     __ZN8HGObjectD2Ev                          HGObject::~HGObject()
//     __ZN8HGObjectdlEPv                         HGObject::operator delete(void*)
//     __ZN22HGComputeDeviceManager20GetComputeDeviceListEv
//                                                HGComputeDeviceManager::GetComputeDeviceList()
//     __Znwm                                     operator new(unsigned long)   [libc++abi stub]
//     __ZdlPv                                    operator delete(void*)         [libc++abi stub]
//     __ZNSt3__119__shared_weak_count14__release_weakEv
//                                                std::__shared_weak_count::__release_weak()
//     __throw_length_error stub for vector<shared_ptr<const HGComputeDevice>>
//     __Unwind_Resume, exception_guard destructor stub
//
// ── STRUCT LAYOUT (recovered from ctor @0x710b0 and dtor @0x70f40) ─────────
// The class inherits from HGObject (single vptr at +0x00, installed as
//   `leaq VT(%rip),%rax; addq $0x10,%rax; movq %rax,(%rdi)` — Itanium C++
//   ABI installed-pointer style).  Size = 0x80.
//
//   +0x00  vptr : HGObject_vtable*   (installed to vtable_for_HGRenderQueueSetupProperties + 0x10)
//   +0x08  ...   : HGObject subobject tail (opaque; HGObject C2 initialises it)
//   +0x10  vec.begin : shared_ptr<const HGComputeDevice>*
//                       (std::vector<std::shared_ptr<const HGComputeDevice>> data ptr)
//   +0x18  vec.end   : shared_ptr<const HGComputeDevice>*   (one past last)
//   +0x20  vec.cap   : shared_ptr<const HGComputeDevice>*   (capacity end)
//   +0x28  uint64_t = 2                           (@0x71158 movq $0x2, 0x28)
//   +0x30  uint64_t = 3                           (@0x71160 movq $0x3, 0x30)
//   +0x38  uint64_t = 1                           (@0x71168 movq $0x1, 0x38)
//   +0x40  uint64_t = 3                           (@0x71170 movq $0x3, 0x40)
//   +0x48  uint32_t = 0x10101                     (@0x71178 movl $0x10101, 0x48)
//   +0x4c  uint8_t  = 1                           (@0x7117f movb $0x1, 0x4c)
//   +0x50  uint64_t = 0                           (@0x71183 movq $0x0, 0x50)
//   +0x58  uint64_t = 0x60                        (@0x7118b movq $0x60, 0x58)
//   +0x60  uint64_t = 0x60                        (@0x71193 movq $0x60, 0x60)
//   +0x68  uint64_t = 0                           (@0x7119b movq $0x0, 0x68)
//   +0x70  uint32_t = 0x1b                        (@0x711a3 movl $0x1b, 0x70)
//   +0x78  uint64_t = 0                           (@0x711aa movq $0x0, 0x78)
//   Total instance size: 0x80 bytes.
//
// The concrete SEMANTIC meaning of the +0x28..+0x78 constants is not
// recoverable from this one ctor — they're the class's default policy
// parameters (queue depth / thread count / render pass count / flag
// bits / cadence / etc.).  They are transcribed here as named,
// numbered defaults with their exact @0xADDR provenance so any future
// setter's decode will be able to match the field to a name.
//
// vec at +0x10..+0x28 is filled from HGComputeDeviceManager::
// GetComputeDeviceList() (a `std::vector<shared_ptr<const HGComputeDevice>> const&`
// returned in %rax): the ctor iterates [*rax, *(rax+8)) copying each
// shared_ptr (movups+lock incq on the control block's strong count)
// into a freshly-allocated buffer sized to match the source vector
// length.  Length in bytes = source.end - source.begin; buffer
// allocated via `operator new(len)` @0x7110d.  On length-error the
// vector-throw_length_error stub is invoked; the exception unwind runs
// __exception_guard_exceptions dtor then HGObject::~HGObject then
// _Unwind_Resume.

import type { HGComputeDevice } from "./HGComputeDevice_stub.js";
import { HGObject_ctor, HGObject_dtor } from "./HGObject_stub.js";
import { HGComputeDeviceManager_GetComputeDeviceList } from "./HGComputeDeviceManager_stub.js";

/**
 * A std::shared_ptr<const HGComputeDevice> — modelled here as a
 * managed pair (ptr, control-block).  In JS the strong/weak refcounting
 * is unobservable, so we just hold the pointee.
 */
export interface SharedPtr_HGComputeDevice_Const {
  /** +0x00 of a std::__1::shared_ptr: the object pointer. */
  ptr: HGComputeDevice | null;
  /** +0x08 of a std::__1::shared_ptr: the control block (__shared_weak_count*).
   *  Native ctor loop @0x71141..0x71152: movups the 16 bytes then, if the
   *  control block ptr is non-null, `lock incq 0x8(%rcx)` — i.e. bump the
   *  STRONG count (which lives at offset 0x8 in __shared_weak_count).
   *  The dtor's decrement is at @0x7125b: `lock xaddq $-1, 0x8(%r14)` on
   *  the same offset. */
  ctrl: unknown | null;
}

/**
 * HGRenderQueueSetupProperties — default properties for the Helium
 * render queue.  Populated on construction with:
 *   • a snapshot of the current HGComputeDeviceManager device list, and
 *   • a fixed set of default policy constants at +0x28..+0x78.
 *
 * @class Helium HGRenderQueueSetupProperties
 * @provenance Helium @0x710b0 (C2), @0x70f40 (D1), @0x71200 (D0)
 */
export class HGRenderQueueSetupProperties {
  /** +0x08 tail of the HGObject subobject — opaque; HGObject::HGObject()
   *  initialises it and HGObject::~HGObject() releases it. */
  hgObjectSubobject: unknown = null;

  /** +0x10..+0x28: std::vector<std::shared_ptr<const HGComputeDevice>>
   *  populated from HGComputeDeviceManager::GetComputeDeviceList(). */
  computeDevices: SharedPtr_HGComputeDevice_Const[] = [];

  /** +0x28 uint64_t = 2 (@0x71158). */
  field_28: bigint = 2n;
  /** +0x30 uint64_t = 3 (@0x71160). */
  field_30: bigint = 3n;
  /** +0x38 uint64_t = 1 (@0x71168). */
  field_38: bigint = 1n;
  /** +0x40 uint64_t = 3 (@0x71170). */
  field_40: bigint = 3n;
  /** +0x48 uint32_t = 0x10101 (@0x71178).  Three-byte flag pack (0x01,0x01,0x01). */
  field_48: number = 0x10101;
  /** +0x4c uint8_t  = 1 (@0x7117f). */
  field_4c: number = 1;
  /** +0x50 uint64_t = 0 (@0x71183). */
  field_50: bigint = 0n;
  /** +0x58 uint64_t = 0x60 (@0x7118b).  0x60 = 96. */
  field_58: bigint = 0x60n;
  /** +0x60 uint64_t = 0x60 (@0x71193). */
  field_60: bigint = 0x60n;
  /** +0x68 uint64_t = 0 (@0x7119b). */
  field_68: bigint = 0n;
  /** +0x70 uint32_t = 0x1b (@0x711a3).  0x1b = 27. */
  field_70: number = 0x1b;
  /** +0x78 uint64_t = 0 (@0x711aa). */
  field_78: bigint = 0n;

  /**
   * HGRenderQueueSetupProperties::HGRenderQueueSetupProperties() — C2 ctor.
   *
   * Helium @0x710b0..0x711be.
   *
   *   1. @0x710c2  callq HGObject::HGObject()
   *   2. @0x710c7  install vtable (base + 0x10) at (rbx).
   *   3. @0x710d5  callq HGComputeDeviceManager::GetComputeDeviceList()
   *              -> %rax = shared_ptr<const HGComputeDevice> const*
   *                        pointing at a live std::vector's {begin,end}.
   *   4. @0x710de  zero the local vector header: +0x10 = null, +0x18 = null,
   *                +0x20 = null.  (xorps xmm0,xmm0; movups xmm0,0x10; movq 0,0x20)
   *   5. @0x710ed  r15 = source.begin (rax+0x00), r12 = source.end (rax+0x08).
   *   6. @0x710ff  r14 = source.end - source.begin  (byte length).
   *      - je 0x71158  -> source empty; skip allocation.
   *      - js 0x711bf  -> source.end < source.begin -> length-error throw.
   *   7. @0x7110d  rax = operator new(r14) — allocate buffer of same byte length.
   *      Store +0x10 = rax (begin), +0x18 = rax (end initially), +0x20 = rax+r14 (cap).
   *   8. @0x7113d..0x71152  copy loop: for each src at [r15..r12) stride 0x10,
   *      movups (%r15),%xmm0; movups %xmm0,(%rax) — bitwise copy the shared_ptr;
   *      if ctrl non-null, `lock incq 0x8(%rcx)` — bump strong refcount.
   *      Advance both r15,rax by 0x10 each iteration; exit on r15 == r12.
   *   9. @0x71154  end pointer at +0x18 updated to final rax.
   *  10. @0x71158..0x711aa  store the twelve default policy fields at
   *      +0x28..+0x78 (see STRUCT LAYOUT above).
   *
   * @provenance Helium @0x710b0
   * @callee HGObject::HGObject() (@Helium — not yet transcribed)
   * @callee HGComputeDeviceManager::GetComputeDeviceList() (@Helium — not yet transcribed)
   * @callee operator new(size_t) (libc++abi stub @0x3c4fb2)
   */
  constructor() {
    // Step 1: base HGObject ctor.
    HGObject_ctor(this);
    // Step 2: vtable install — implicit in JS (class instance identity).
    // Step 3: snapshot the device list.
    const src = HGComputeDeviceManager_GetComputeDeviceList();
    // Steps 4..9: bit-copy every shared_ptr into `computeDevices`.
    // Each copy of a shared_ptr bumps the control-block's strong count
    // (native @0x7114d..0x71152 lock incq).  In JS refcount is opaque —
    // we just retain the reference by pushing the same objects.
    this.computeDevices = [];
    for (const sp of src) {
      this.computeDevices.push({ ptr: sp.ptr, ctrl: sp.ctrl });
    }
    // Step 10: default policy fields are set by their field initialisers above.
  }

  /**
   * HGRenderQueueSetupProperties::~HGRenderQueueSetupProperties() — D1
   * complete-object destructor.
   *
   * Helium @0x70f40..0x70fc5+.  Mirror the ctor:
   *
   *   1. @0x70f4e install vtable (this restores the vtable pointer to
   *      this-class's vtable — needed because base dtors will run next
   *      and each of them re-installs its own vtable before running).
   *   2. @0x70f5c load r15 = +0x10 (vec.begin).  If null -> skip to 3.
   *      Else walk r12 = +0x18 (vec.end) backwards in stride 0x10,
   *      decrementing each shared_ptr's control-block strong count via
   *      `lock xaddq $-1, 0x8(%r14)`.  If the pre-decrement value was
   *      1 (i.e. we dropped the last strong ref), invoke the deleter
   *      via `callq *0x10(%rax)` (rax = *ctrl, so slot 0x10 in the
   *      control block's vtable is `__on_zero_shared`) and then
   *      __shared_weak_count::__release_weak on the control block.
   *      Finally operator delete on the buffer (@0x71280).
   *   3. @0x71288 callq HGObject::~HGObject() — base dtor.
   *
   * @provenance Helium @0x70f40
   * @callee __shared_weak_count::__release_weak (libc++ stub @0x3c4efe)
   * @callee operator delete(void*) (libc++abi stub @0x3c4fa0)
   * @callee HGObject::~HGObject() (@Helium — not yet transcribed)
   */
  destroy(): void {
    // Step 1: vtable-install — implicit in JS.
    // Step 2: release each shared_ptr in the vector.  In JS the strong
    // refcount is opaque; dropping our references lets GC do the work.
    for (let i = this.computeDevices.length - 1; i >= 0; i--) {
      const sp = this.computeDevices[i];
      sp.ptr = null;
      sp.ctrl = null;
    }
    this.computeDevices = [];
    // Step 3: HGObject base dtor.
    HGObject_dtor(this);
  }

  /**
   * HGRenderQueueSetupProperties::~HGRenderQueueSetupProperties() — D0
   * deleting destructor.  Helium @0x71200..0x71298.
   *
   * Same body as D1 (vtable install, vector release, HGObject::~HGObject),
   * then `jmp HGObject::operator delete(this)` to release the heap slot.
   *
   * @provenance Helium @0x71200
   * @callee HGObject::operator delete(void*) (@Helium — not yet transcribed)
   */
  destroyAndFree(): void {
    this.destroy();
    // Native tail jmp: HGObject::operator delete(this) — GC in JS.
    // Not calling out to the stub here because the actual pointer-free
    // is unobservable at the JS boundary; documenting the call.
  }
}
