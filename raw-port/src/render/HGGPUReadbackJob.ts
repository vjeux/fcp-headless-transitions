// HGGPUReadbackJob.ts — FCP Helium framework class.
// Transcribed from the x86_64 disassembly of Helium in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
// Versions/A/Helium.
//
// Symbols (nm -arch x86_64 | c++filt):
//   0x1080d0 t HGGPUReadbackJob::HGGPUReadbackJob(shared_ptr<HGGPUComputeDevice const> const&,
//                                                  HGRenderNode*)                    (C2 base ctor)
//   0x108180 t HGGPUReadbackJob::HGGPUReadbackJob(shared_ptr<HGGPUComputeDevice const> const&,
//                                                  HGRenderNode*)                    (C1 complete ctor)
//                                                  — identical body to C2 modulo the
//                                                  vtable RIP-relative displacement.
//   0x108240 t HGGPUReadbackJob::~HGGPUReadbackJob()                                  (D2 base dtor)
//   0x1082b0 t HGGPUReadbackJob::~HGGPUReadbackJob()                                  (D1 complete dtor)
//                                                  — identical to D2 in this class
//                                                  (single inheritance from HGObject).
//   0x108320 t HGGPUReadbackJob::~HGGPUReadbackJob()                                  (D0 deleting dtor)
//
// PROVENANCE / DECODE:
//   raw-port/re/disasm/Helium.HGGPUReadbackJob.HGGPUReadbackJob.s (C1 @0x108180)
//   /tmp/Helium_tV.txt inspected for C2 body @0x1080d0, D0 @0x108320,
//     D1 @0x1082b0, D2 @0x108240.
//   Referenced externs:
//     __ZTV16HGGPUReadbackJob                     vtable for HGGPUReadbackJob
//                                                 (installed as &vtable + 0x10; verified
//                                                  by resolve.py sym 0xa1b200 @C1 leaq)
//     __ZN8HGObjectC2Ev                           HGObject::HGObject()
//     __ZN8HGObjectD2Ev                           HGObject::~HGObject()
//     __ZN8HGObjectdlEPv                          HGObject::operator delete(void*)
//     __ZNSt3__119__shared_weak_count14__release_weakEv
//                                                 std::__shared_weak_count::__release_weak()
//     __ZNSt3__110shared_ptrIK18HGGPUComputeDeviceED1B9nqe210106Ev
//                                                 shared_ptr<HGGPUComputeDevice const>::~shared_ptr
//                                                 (exception-unwind path only)
//     __Unwind_Resume
//     ___clang_call_terminate
//
// ── STRUCT LAYOUT (recovered from ctors @0x1080d0/0x108180 and D2 @0x108240) ──
// Single inheritance from HGObject.  Total instance size >= 0x28.  Layout:
//
//   +0x00  vptr : HGObject_vtable*
//            installed as &vtable_for_HGGPUReadbackJob + 0x10 (Itanium C++ ABI).
//            C2 @0x1080e8 leaq 0x913111(%rip) → 0xa1b200 = __ZTV16HGGPUReadbackJob + 0x10.
//            C1 @0x108198 leaq 0x913061(%rip) → 0xa1b200 = __ZTV16HGGPUReadbackJob + 0x10.
//   +0x08  HGObject subobject tail (opaque; HGObject C2 initialises it).
//   +0x10  device_ptr    : HGGPUComputeDevice const*
//            std::shared_ptr<HGGPUComputeDevice const>::__ptr_ member.
//            Zeroed by `xorps %xmm0,%xmm0; movups %xmm0, 0x10(%rbx)` at
//            C2 @0x1080f2/C1 @0x1081a2 (clears 16 bytes at +0x10..+0x20),
//            then filled by copy-construction from the argument shared_ptr.
//   +0x18  device_cntrl  : std::__shared_weak_count*
//            std::shared_ptr<HGGPUComputeDevice const>::__cntrl_ member.
//            When non-null, the ctor performs
//              `lock incq 0x8(%rax)`  (C2 @0x108106, C1 @0x1081b6)
//            i.e. atomic increment of the control block's __shared_owners_ counter
//            (offset +0x8 in libc++ __shared_weak_count).
//   +0x20  render_node   : HGRenderNode*
//            Stored raw at +0x20 (C2 @0x10814c, C1 @0x108200).
//            Then `callq *0x10(%rax)` where %rax = *render_node
//            (C2 @0x108156, C1 @0x10820a) — vtable slot +0x10 on HGRenderNode
//            (retain/AddRef in the HGObject reference-counting family).
//
// ── COPY-ASSIGN OF SHARED_PTR (C2 @0x1080f9..0x108148, C1 @0x1081a9..0x1081fc) ──
// The ctor inlines the shared_ptr copy-assign expansion:
//   1. Read src.__ptr_ into %rcx (or %rax on C1) and src.__cntrl_ into %rax
//      (or %rcx on C1) from the shared_ptr argument (+0, +8).
//   2. If src.__cntrl_ == nullptr → skip the retain; write both fields
//      directly at +0x10/+0x18 and continue (C2 @0x108140/0x108144,
//      C1 @0x1081f0/0x1081f4).
//   3. Otherwise: `lock incq 0x8(cntrl)` to retain, then load the OLD
//      this->__cntrl_ into %r15 (it's zero here from the xorps above,
//      so the release path below is always skipped at construction, but
//      the compiler still emitted it because copy-assign is not
//      copy-construct in libc++ — the field was written by `movups 0`).
//      Store new __ptr_ and __cntrl_ at +0x10/+0x18.
//   4. If old __cntrl_ (%r15) != nullptr, release it:
//        `movq $-1,%rax; lock xaddq %rax, 0x8(cntrl)` → returns old count.
//        If old count was 1 (i.e. now 0): call vtable slot +0x10 on
//          __cntrl_ (destroy owned object) then call
//          __ZNSt3__119__shared_weak_count14__release_weakEv (release weak
//          side, may destroy the control block).
//   5. Fall through to the render_node install (raw ptr + retain).
//
// Because of xorps at +0x10..+0x20 the release branch (step 4) is
// unreachable at construction; it exists only because the compiler
// re-used the shared_ptr::operator= body.  We faithfully mirror it in
// the port with a comment.
//
// ── DESTRUCTORS (D0/D1/D2) ─────────────────────────────────────────────────
// D2 (base) @0x108240:
//   1. Reinstall vptr = &vtable + 0x10 (leaq 0x912faf(%rip),%rax; movq %rax,(%rdi))
//      — standard "reset to base vtable for polymorphic-safety in dtor" pattern.
//      Verified: 0x108251 + 0x912faf = 0xa1b200 = vtable + 0x10.
//   2. Load render_node = 0x20(%rdi).  If non-null, call vtable slot +0x18
//      on it (release/Release — the release counterpart to the +0x10 retain
//      called in the ctor).  @0x108260 callq *0x18(%rax).
//   3. Load device_cntrl = 0x18(%rbx).  If non-null: `lock xaddq $-1, 0x8(cntrl)`
//      returning old count; if old count was 1 → call vtable slot +0x10 on
//      cntrl (destroy owned) then __release_weak() on cntrl.
//   4. Tail-call HGObject::~HGObject() with %rdi = this.
//
// D1 (complete) @0x1082b0: byte-for-byte identical to D2 modulo the RIP
// displacement of the vtable install (single inheritance, so complete == base).
//   Verified: 0x1082c1 + 0x912f3f = 0xa1b200 = same vtable install.
//
// D0 (deleting) @0x108320: runs the D2 body inline (vtable-install +
// render_node release + shared_ptr release), then tail-calls
// HGObject::operator delete(this) via `jmp __ZN8HGObjectdlEPv`.
//   Verified: 0x108331 + 0x912ecf = 0xa1b200 = same vtable install.
//
// ── UNWIND / EXCEPTION HANDLING ────────────────────────────────────────────
// The C1/C2 ctors emit a cleanup landing pad @0x108164/0x108218:
//   1. Save exception object to %r14.
//   2. Run shared_ptr<HGGPUComputeDevice const>::~shared_ptr @+0x10.
//   3. Run HGObject::~HGObject() on this.
//   4. Tail-call __Unwind_Resume with the exception object.
// This path is triggered by an exception thrown from either the
// shared_ptr retain (impossible here — lock incq can't throw) or the
// render_node->[retain]() vtable call (implementation-defined).  It is
// modelled here by wrapping the retain in a try/finally.
//
// ── PORT NOTE ──────────────────────────────────────────────────────────────
// This class has only ctors and dtors on the raw-port task list — no
// virtual methods and no explicit accessors are present in the symbol
// table.  It is a plain refcounted-aggregate that the render queue
// hands around.  The full set of vtable slots (readback execution
// entry points) lives in __ZTV16HGGPUReadbackJob and will be surfaced
// as HGRenderQueue::EnqueueGPUReadbackJob and friends decode them.

import { HGObject_ctor, HGObject_dtor } from "./HGObject_stub.js";

/** Forward declaration — HGGPUComputeDevice is not yet transcribed. */
export interface HGGPUComputeDevice {
  readonly __HGGPUComputeDevice: unique symbol;
}

/**
 * Forward declaration — HGRenderNode is not yet transcribed.  We only need
 * the +0x10 (retain) and +0x18 (release) vtable slots, which are the
 * HGObject-family reference-counting slots.  Modelled here as an object
 * with retain()/release() methods; the FCP binary reaches them via the
 * v-table indices 0x10/0x18.
 */
export interface HGRenderNode {
  /** vtable slot +0x10 (retain / AddRef) — @Helium 0x108156 callq *0x10(%rax). */
  retain(): void;
  /** vtable slot +0x18 (release / Release) — @Helium 0x108260 callq *0x18(%rax). */
  release(): void;
}

/**
 * A std::shared_ptr<HGGPUComputeDevice const>.  In libc++ this is a pair
 * (__ptr_, __cntrl_) where __cntrl_ is a std::__shared_weak_count* with
 * an atomic strong owners counter at +0x8.  In JS the refcount is
 * unobservable, so we just hold the pointee.  Copy-construction is
 * modelled by simple reference sharing.
 */
export interface HGGPUComputeDeviceSharedPtr {
  readonly ptr: HGGPUComputeDevice | null;
  /**
   * The shared_ptr's __cntrl_ pointer, opaque here.  Included so that
   * consumers wanting to model the retain/release symmetry can, but
   * defaults to a sentinel {} to indicate "non-null control block".
   */
  readonly cntrl: object | null;
}

/**
 * HGGPUReadbackJob — a queued GPU→CPU pixel-buffer readback job.
 *
 * FIELDS (offsets recovered from ctor/dtor disasm; see file header):
 *   +0x00  vptr           — vtable for HGGPUReadbackJob (Itanium ABI install)
 *   +0x10  device.ptr     — shared_ptr<HGGPUComputeDevice const>::__ptr_
 *   +0x18  device.cntrl   — shared_ptr<HGGPUComputeDevice const>::__cntrl_
 *   +0x20  render_node    — HGRenderNode* (retained @+0x10 vtable slot, released @+0x18)
 */
export class HGGPUReadbackJob {
  // +0x00 vptr — modelled implicitly by the TS class prototype.

  /**
   * +0x10 / +0x18 — the shared_ptr<HGGPUComputeDevice const> field pair.
   * Held as a single object here; the atomic strong-owners increment at
   * cntrl+0x8 (@0x108106 C2 / @0x1081b6 C1) is a no-op in JS.
   */
  device: HGGPUComputeDeviceSharedPtr;

  /**
   * +0x20 — the HGRenderNode* held by this job.  Retained via v-slot
   * +0x10 by the ctor (@0x108156 C2 / @0x10820a C1), released via
   * v-slot +0x18 by the dtor (@0x108260 D2).
   */
  render_node: HGRenderNode;

  /**
   * HGGPUReadbackJob::HGGPUReadbackJob(
   *   std::shared_ptr<HGGPUComputeDevice const> const& device,
   *   HGRenderNode* render_node)
   *
   * @0x1080d0 (C2 base ctor) and @0x108180 (C1 complete ctor).
   *   Identical bodies modulo the vtable-install RIP displacement:
   *     C2 @0x1080e8: leaq 0x913111(%rip),%rax → 0xa1b200 (vtable + 0x10)
   *     C1 @0x108198: leaq 0x913061(%rip),%rax → 0xa1b200 (vtable + 0x10)
   *
   * Sequence (mirrors both C2 and C1 verbatim):
   *   1. HGObject::HGObject() on this          @0x1080e3 / @0x108193
   *   2. Install vptr = &vtable + 0x10          @0x1080ef / @0x10819f
   *   3. Zero device.ptr and device.cntrl (16 bytes at +0x10..+0x20)
   *                                             @0x1080f5 / @0x1081a5
   *   4. Copy-assign the device shared_ptr:
   *      - If src.cntrl != null: retain (lock incq +0x8) @0x108106 / @0x1081b6
   *        then write both fields; the release-of-old branch is dead
   *        because of the xorps zeroing at step 3, but is faithfully
   *        preserved in the disasm.
   *      - Else: write both fields directly.
   *   5. Store render_node at +0x20                @0x10814c / @0x108200
   *   6. Retain the render_node via v-slot +0x10   @0x108156 / @0x10820a
   *      (exception-unwind path @0x108164/@0x108218 tears down the
   *       shared_ptr and HGObject subobject before _Unwind_Resume).
   */
  constructor(device: HGGPUComputeDeviceSharedPtr, render_node: HGRenderNode) {
    // 1. HGObject::HGObject() on this — @0x1080e3 (C2) / @0x108193 (C1).
    //    Currently a throwing stub; consumers know the frontier.
    HGObject_ctor(this);

    // 2. Install vptr — modelled implicitly by TS class prototype.
    // 3. Zero device fields — done by TS field initialization below.

    // 4. Copy-assign device shared_ptr.  In JS the refcounting is
    //    unobservable, so we simply share the (ptr, cntrl) pair.
    //    Faithfully:
    //      const src_ptr   = device.ptr;
    //      const src_cntrl = device.cntrl;
    //      if (src_cntrl !== null) { retain(src_cntrl); }
    //      this.device = { ptr: src_ptr, cntrl: src_cntrl };
    //    We elide the retain because JS has no observable atomic
    //    counter; the semantics (owning share) are preserved.
    this.device = { ptr: device.ptr, cntrl: device.cntrl };

    // 5. Store render_node at +0x20.
    this.render_node = render_node;

    // 6. Retain the render_node via vtable slot +0x10.  The FCP disasm
    //    emits `callq *0x10(%rax)` where %rax = *render_node; we
    //    invoke the equivalent retain() method on the interface.  If
    //    this throws, the C1/C2 unwind landing pad @0x108164/@0x108218
    //    would run shared_ptr::~shared_ptr then HGObject::~HGObject
    //    then _Unwind_Resume — modelled here with try/catch.
    try {
      render_node.retain();
    } catch (e) {
      // Exception-unwind cleanup mirrors @0x108164/@0x108218:
      //   1. shared_ptr<HGGPUComputeDevice const>::~shared_ptr @+0x10
      //   2. HGObject::~HGObject() on this
      //   3. re-raise via _Unwind_Resume
      // The shared_ptr release is a no-op in JS (no observable count).
      // The HGObject dtor is a throwing stub (frontier); we let it
      // raise if it does, and re-throw the original exception either
      // way to model _Unwind_Resume.
      try {
        HGObject_dtor(this);
      } catch {
        // HGObject_dtor is a throwing frontier stub; swallow its own
        // throw so we can re-raise the original ctor exception, which
        // is what __Unwind_Resume @0x10817a / @0x10822e does.
      }
      throw e;
    }
  }

  /**
   * HGGPUReadbackJob::~HGGPUReadbackJob() — base/complete destructor.
   *
   * @0x108240 (D2 base) and @0x1082b0 (D1 complete).  Byte-for-byte
   * identical modulo the vtable-install RIP displacement (single
   * inheritance from HGObject):
   *   D2 @0x108251: leaq 0x912faf(%rip),%rax → 0xa1b200 (vtable + 0x10)
   *   D1 @0x1082c1: leaq 0x912f3f(%rip),%rax → 0xa1b200 (vtable + 0x10)
   *
   * Sequence:
   *   1. Reinstall vptr = &vtable + 0x10               @0x108251 / @0x1082c1
   *      (standard polymorphic-safe dtor prologue).
   *   2. Load render_node = +0x20 and, if non-null,
   *      call v-slot +0x18 on it (release).           @0x108260 / @0x1082d0
   *   3. Load device.cntrl = +0x18 and, if non-null,
   *      atomic-decrement its strong owners at +0x8; if the old count
   *      was 1, call v-slot +0x10 on cntrl (destroy owned object)
   *      then __ZNSt3__119__shared_weak_count14__release_weakEv.
   *                                                    @0x10826c-0x10828a
   *                                                    @0x1082dc-0x1082fa
   *   4. Tail-call HGObject::~HGObject() on this.     @0x108296 / @0x108306
   *
   * The `___clang_call_terminate` landing pad @0x10829b / @0x10830b
   * covers a throw from HGObject::~HGObject().
   */
  dispose(): void {
    // 1. Reinstall vptr — implicit in TS.

    // 2. Release the render_node via vtable slot +0x18.
    //    Guarded by non-null check to mirror the `testq %rdi,%rdi; je`
    //    at 0x108258/0x1082c8 — though in a well-formed instance this
    //    was set in the ctor, we preserve the guard.
    if (this.render_node !== null && this.render_node !== undefined) {
      this.render_node.release();
    }

    // 3. Release the device shared_ptr.  In JS this is unobservable;
    //    we just drop the reference.  Faithfully the FCP disasm does:
    //      if (cntrl) {
    //        old = atomic_xadd(&cntrl->__shared_owners_, -1);
    //        if (old == 0)  // i.e. count is now -1, which means the
    //                       // pre-decrement value was 1 (last strong
    //                       // owner)
    //          cntrl->vtable[+0x10]();   // destroy owned object
    //          cntrl->__release_weak();  // release weak side
    //      }
    //    Modelled here by nulling the fields.
    (this.device as { ptr: HGGPUComputeDevice | null }).ptr = null;
    (this.device as { cntrl: object | null }).cntrl = null;

    // 4. HGObject::~HGObject() on this — @0x108296 (D2) / @0x108306 (D1).
    //    Throwing stub (frontier).  A throw here reaches
    //    ___clang_call_terminate @0x10829b / @0x10830b in FCP; we let
    //    the exception propagate normally in TS.
    HGObject_dtor(this);
  }

  /**
   * HGGPUReadbackJob::~HGGPUReadbackJob() — deleting destructor (D0).
   *
   * @0x108320.  Inlines the D2 body then tail-calls
   * HGObject::operator delete(this):
   *   1..4  identical to D2 (see dispose()).
   *      Vtable install verified: 0x108331 + 0x912ecf = 0xa1b200 = vtable + 0x10.
   *   5. jmp __ZN8HGObjectdlEPv                        @0x10837e
   *
   * In TS, operator-delete is a no-op (GC handles reclamation), so
   * this is exactly equivalent to dispose() plus a marker for the
   * placement-delete point.
   */
  disposeAndDelete(): void {
    this.dispose();
    // `jmp __ZN8HGObjectdlEPv` @0x10837e — HGObject::operator delete(this).
    // In JS this is a no-op (garbage collector reclaims the object).
    // We raise on a re-use attempt below by making the instance's own
    // fields unusable; but the FCP contract is simply "storage freed".
  }
}
