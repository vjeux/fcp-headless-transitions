// PGHGImageRef — Ozone.framework value holder that owns a std::shared_ptr<PCBitmap>.
//
// This class is a channel-value ref: it wraps a strong reference to a PCBitmap
// (Meta's software-side image buffer used by Helium's HG* image pipeline). Its
// only observable dtor behaviour is releasing the embedded shared_ptr control
// block and chaining into the HGObject base subobject.
//
// Faithful transcription of the two destructor slots the Itanium ABI emits.
// Source disassembly:
//   raw-port/re/disasm/PGHGImageRef.~PGHGImageRef_D1.s   (D1 base dtor     @0x50c320)
//   raw-port/re/disasm/PGHGImageRef.~PGHGImageRef.s      (D0 deleting dtor @0x50c380)
//
// Ozone symbols referenced (all resolved via nm+c++filt of Ozone,
// vtable slots from `python3 raw-port/army/tools/resolve.py Ozone vtable PGHGImageRef`):
//
//   __ZTV12PGHGImageRef                — the class vtable that gets written back into
//                                         *this at the start of each dtor. Rebind target
//                                         is `vtable + 0x10` (skipping offset-to-top +
//                                         typeinfo slots), computed by the leaq at
//                                         @0x50c327 (D1) / @0x50c387 (D0).
//
//   this->cb->vtable[0x10]             — indirect virtual call
//                                         @0x50c362 (D1): call *0x10(%rax)
//                                         @0x50c3b9 (D0): call *0x10(%rax)
//                                         %rax is *cb (the control-block vptr). Slot 0x10
//                                         of a libc++ __shared_weak_count subclass vtable
//                                         is `__on_zero_shared()` — invoked exactly when the
//                                         strong-count drop reaches 0. For PGHGImageRef the
//                                         control block is
//                                           std::__1::__shared_ptr_pointer<
//                                             PCBitmap*,
//                                             std::__1::shared_ptr<PCBitmap>::__shared_ptr_default_delete<
//                                               PCBitmap, PCBitmap>,
//                                             std::__1::allocator<PCBitmap>>
//                                         and slot 0x10 there = __on_zero_shared @0x2fbf10
//                                         (per resolve.py Ozone vtable dump of PGHGImageRef).
//
//   __ZNSt3__119__shared_weak_count14__release_weakEv
//                                       — libc++ helper that atomically decrements the
//                                         weak-count and, on hitting zero, calls
//                                         `__on_zero_shared_weak()` (which frees the control
//                                         block itself). Stub tail-called at
//                                         @0x50c368 (D1) / @0x50c3bf (D0).
//
//   __ZN8HGObjectD2Ev                   — HGObject::~HGObject (base subobject dtor).
//                                         Stub tail-jmp @0x50c354 & @0x50c374 (D1),
//                                         call @0x50c3ca (D0).
//
//   __ZN8HGObjectdlEPv                  — HGObject::operator delete(void*). Stub tail-jmp
//                                         @0x50c3d6 (D0 only).
//
// Struct layout (recovered from the dtors — this is the ONLY field they touch
// beyond the HGObject base subobject):
//   +0x000  vptr                          → rebind target PGHGImageRef vtable + 0x10
//   +0x008  HGObject subobject tail       (opaque here; owned by HGObject::~HGObject)
//   +0x018  __shared_weak_count* cb       control block; nullable (empty shared_ptr).
//                                         layout inside cb:
//                                           +0x00 vptr
//                                           +0x08 shared_owners_ (strong count minus 1)
//                                         xaddq $-1, 0x8(cb) is exactly the strong-count
//                                         atomic decrement libc++ inlines for
//                                         shared_ptr::~shared_ptr.
//   The rest of the object (the PCBitmap* stored at +0x10) is not touched by
//   the dtor — it is owned by cb->__on_zero_shared() via the deleter.

// ─── Frontier callees (undecoded — throw per PORTING_SPEC Rule 3) ─────────────────────

/**
 * libc++ __shared_weak_count::__release_weak() — decrement weak count atomically
 * and, on zero, call this->__on_zero_shared_weak() to free the control block.
 *   D1: callq __ZNSt3__119__shared_weak_count14__release_weakEv @0x50c368
 *   D0: callq __ZNSt3__119__shared_weak_count14__release_weakEv @0x50c3bf
 * Import from libc++.dylib — not decoded here.
 */
function __shared_weak_count__release_weak(_cb: SharedWeakCount): void {
  throw new Error(
    "__shared_weak_count::__release_weak() not yet transcribed — " +
      "@Ozone 0x50c368 (D1) / @Ozone 0x50c3bf (D0) — libc++.dylib import",
  );
}

/**
 * The strong-count sink invoked when shared_owners_ reaches zero.
 * Vtable slot 0x10 of the control block: for PGHGImageRef this is
 *   std::__1::__shared_ptr_pointer<PCBitmap*, __shared_ptr_default_delete<PCBitmap,PCBitmap>,
 *                                   allocator<PCBitmap>>::__on_zero_shared @Ozone 0x2fbf10
 * i.e. it calls the deleter, which invokes `delete (PCBitmap*)cb->ptr`.
 *   D1: call *0x10(%rax)  @0x50c362
 *   D0: call *0x10(%rax)  @0x50c3b9
 * Not decoded in this port — depends on PCBitmap dtor + deleter, which are separate slugs.
 */
function shared_weak_count__on_zero_shared(_cb: SharedWeakCount): void {
  throw new Error(
    "__shared_weak_count::__on_zero_shared() (vtable slot +0x10) not yet transcribed — " +
      "@Ozone 0x50c362 (D1) / @Ozone 0x50c3b9 (D0) — resolves to " +
      "std::__1::__shared_ptr_pointer<PCBitmap*, ...>::__on_zero_shared @Ozone 0x2fbf10",
  );
}

/**
 * HGObject::~HGObject (base subobject destructor).
 *   D1 tail-jmp @0x50c354 (skinny path: cb == null OR strong-count decrement was non-zero)
 *   D1 tail-jmp @0x50c374 (long path: after the on_zero_shared + release_weak sequence)
 *   D0 call    @0x50c3ca
 * All target the same stub — the Ozone import trampoline for __ZN8HGObjectD2Ev.
 */
function HGObject_D2(_self: PGHGImageRef): void {
  throw new Error(
    "HGObject::~HGObject not yet transcribed — @Ozone stub for __ZN8HGObjectD2Ev " +
      "(called @0x50c354 / @0x50c374 / @0x50c3ca)",
  );
}

/**
 * HGObject::operator delete(void*) — HGObject-provided global-delete replacement.
 *   D0: jmp __ZN8HGObjectdlEPv @0x50c3d6 (via import stub)
 * No-op in a GC runtime, but recorded here so future oracle work sees the site.
 */
function HGObject_operator_delete(_p: unknown): void {
  throw new Error(
    "HGObject::operator delete(void*) not yet transcribed — @Ozone stub for __ZN8HGObjectdlEPv (called @0x50c3d6)",
  );
}

// ─── Opaque support types ────────────────────────────────────────────────────────────

/**
 * Opaque libc++ std::__1::__shared_weak_count subclass — the control block
 * of the shared_ptr held at PGHGImageRef+0x18. Only the fields the dtor
 * touches are surfaced (vptr for the +0x10 indirect call, plus the
 * shared_owners_ field at +0x8 that the xaddq updates).
 */
export interface SharedWeakCount {
  /** +0x00 — vptr into the __shared_ptr_pointer<PCBitmap*, ...> vtable. */
  vptr: unknown;
  /** +0x08 — libc++ `shared_owners_`, i.e. (strong count - 1). Atomic in real memory. */
  shared_owners_: bigint;
}

/** Sentinel for `*this = &vtable_PGHGImageRef + 0x10`. */
const PGHGImageRef_vtable_plus_0x10 = Symbol("PGHGImageRef::vtable+0x10");

// ─── The class ────────────────────────────────────────────────────────────────────────

/**
 * PGHGImageRef — see file header for provenance.
 *
 * Only the fields the destructors read are modelled; the HGObject subobject
 * remains opaque (see raw-port/src/render for other HGObject-derived
 * transcriptions).
 */
export class PGHGImageRef {
  /** @0x000 — instance vtable pointer. Rebound to vtable+0x10 at dtor entry. */
  vptr: symbol = PGHGImageRef_vtable_plus_0x10;

  /**
   * @0x018 — the strong-shared control block of the embedded
   * `std::shared_ptr<PCBitmap>`. `null` models an empty shared_ptr.
   */
  cb: SharedWeakCount | null = null;

  /**
   * PGHGImageRef::~PGHGImageRef() — D1 base destructor.
   * @Ozone 0x50c320 (raw-port/re/disasm/PGHGImageRef.~PGHGImageRef_D1.s)
   *
   * Line-for-line:
   *   0x50c320  push rbp; mov rbp, rsp; push r14; push rbx                 prologue
   *   0x50c327  lea  rax, [rip+__ZTV12PGHGImageRef]  ## &vtable
   *   0x50c32e  add  rax, 0x10                        ## vtable + 0x10
   *   0x50c332  mov  [rdi], rax                       ## *this = vtable+0x10
   *   0x50c335  mov  rbx, [rdi+0x18]                  ## rbx = this->cb
   *   0x50c339  test rbx, rbx
   *   0x50c33c  je   0x50c350                         ## if cb == null → tail HGObject::~HGObject
   *   0x50c33e  mov  rax, -1
   *   0x50c345  lock xadd  [rbx+0x8], rax             ## atomic pre-decrement of shared_owners_
   *   0x50c34b  test rax, rax                         ## rax = old shared_owners_
   *   0x50c34e  je   0x50c359                         ## if old == 0 → strong count hit zero, sink it
   *   0x50c350  pop rbx; pop r14; pop rbp
   *   0x50c354  jmp  __ZN8HGObjectD2Ev                ## tail HGObject::~HGObject
   *   0x50c359  mov  rax, [rbx]                       ## rax = cb->vptr
   *   0x50c35c  mov  r14, rdi                          save self
   *   0x50c35f  mov  rdi, rbx
   *   0x50c362  call *0x10(rax)                       ## cb->__on_zero_shared()
   *   0x50c365  mov  rdi, rbx
   *   0x50c368  call __ZNSt3__119__shared_weak_count14__release_weakEv
   *   0x50c36d  mov  rdi, r14                          restore self
   *   0x50c370  pop rbx; pop r14; pop rbp
   *   0x50c374  jmp  __ZN8HGObjectD2Ev                ## tail HGObject::~HGObject
   *
   * Note: `lock xadd rax, [cb+8]` with rax=-1 is libc++'s inlined
   * `shared_ptr::~shared_ptr` — the value in rax AFTER the xadd is the OLD
   * shared_owners_ (which equals strong_count - 1). So `old == 0` means the
   * strong count was 1 before the drop → we now own the last reference and
   * must call __on_zero_shared() then __release_weak().
   */
  dtor_D1_at_0x50c320(): void {
    // @0x50c332 — rebind vtable pointer.
    this.vptr = PGHGImageRef_vtable_plus_0x10;
    // @0x50c335..0x50c33c — load this->cb; if null, skip straight to HGObject::~HGObject.
    const cb = this.cb;
    if (cb !== null) {
      // @0x50c33e..0x50c34b — atomic pre-decrement of shared_owners_ (the value we
      // observe AFTER the xadd is the OLD value; libc++ stores strong_count - 1).
      const oldOwners = cb.shared_owners_;
      cb.shared_owners_ = oldOwners - 1n;
      // @0x50c34e — jne 0x50c350: if oldOwners != 0 we're not the last strong ref;
      //                          fall through into the tail HGObject::~HGObject.
      if (oldOwners === 0n) {
        // @0x50c359..0x50c368 — last strong ref: run __on_zero_shared (vptr+0x10) then __release_weak.
        shared_weak_count__on_zero_shared(cb);
        __shared_weak_count__release_weak(cb);
      }
    }
    // @0x50c354 / @0x50c374 — both epilogue paths tail-jmp HGObject::~HGObject.
    HGObject_D2(this);
  }

  /**
   * PGHGImageRef::~PGHGImageRef() — D0 deleting destructor.
   * @Ozone 0x50c380 (raw-port/re/disasm/PGHGImageRef.~PGHGImageRef.s)
   *
   * Byte-identical prologue and body to D1 up through the HGObject::~HGObject
   * call, then a tail-jmp into HGObject::operator delete(this):
   *   0x50c380  push rbp; mov rbp, rsp; push r14; push rbx                 prologue
   *   0x50c387  lea  rax, [rip+__ZTV12PGHGImageRef]  ## &vtable
   *   0x50c38e  add  rax, 0x10                        ## vtable + 0x10
   *   0x50c392  mov  [rdi], rax
   *   0x50c395  mov  rbx, [rdi+0x18]                  ## rbx = this->cb
   *   0x50c399  test rbx, rbx
   *   0x50c39c  je   0x50c3c7                         ## if cb == null → HGObject::~HGObject, then delete
   *   0x50c39e  mov  rax, -1
   *   0x50c3a5  lock xadd  [rbx+0x8], rax
   *   0x50c3ab  test rax, rax
   *   0x50c3ae  jne  0x50c3c7                         ## if old != 0 → skip to HGObject::~HGObject + delete
   *   0x50c3b0  mov  rax, [rbx]
   *   0x50c3b3  mov  r14, rdi
   *   0x50c3b6  mov  rdi, rbx
   *   0x50c3b9  call *0x10(rax)                       ## cb->__on_zero_shared()
   *   0x50c3bc  mov  rdi, rbx
   *   0x50c3bf  call __ZNSt3__119__shared_weak_count14__release_weakEv
   *   0x50c3c4  mov  rdi, r14
   *   0x50c3c7  mov  rbx, rdi                         save self in rbx
   *   0x50c3ca  call __ZN8HGObjectD2Ev                ## HGObject::~HGObject(this)
   *   0x50c3cf  mov  rdi, rbx
   *   0x50c3d2  pop rbx; pop r14; pop rbp
   *   0x50c3d6  jmp  __ZN8HGObjectdlEPv               ## tail HGObject::operator delete(this)
   *
   * i.e. D0 = D1's body + HGObject::operator delete(this).
   *
   * (Note: at 0x50c3ca the ABI uses `callq` rather than the `jmp` D1 uses,
   *  because D0 still has more work to do — the operator delete tail-jmp at
   *  0x50c3d6. The observable effect on the port is identical: dispatch order
   *  D1-body → HGObject::~HGObject → HGObject::operator delete(this).)
   */
  dtor_D0_at_0x50c380(): void {
    // @0x50c387..0x50c3ca — identical body to D1 (rebind vptr, atomic decrement,
    //                       last-ref sink, then HGObject::~HGObject via call).
    this.dtor_D1_at_0x50c320();
    // @0x50c3d6 — tail-jmp HGObject::operator delete(this).
    HGObject_operator_delete(this);
  }
}
