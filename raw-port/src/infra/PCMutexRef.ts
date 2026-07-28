// raw-port/src/infra/PCMutexRef.ts
//
// FCP `PCMutexRef` — a reference-holder for a shared mutex.  In C++ it is a
// small owner type that holds a std::shared_ptr-style {ptr, control_block}
// pair whose control block is a libc++ `std::__1::__shared_weak_count`.  The
// only enumerated method on the class in Ozone's symbol table is the D1
// (non-deleting) destructor, which is the shared_ptr release-and-maybe-destroy
// sequence.
//
// Framework: Ozone (x86_64 slice; slice offset 0x4000).
// Provenance: raw-port/re/disasm/PCMutexRef.~PCMutexRef.s (extracted via
//   otool -tvV block starting at file address 0x00002cae0).
//
// Only enumerated method:
//   PCMutexRef::~PCMutexRef() [D1]  @Ozone 0x0002cae0
//     (__ZN10PCMutexRefD1Ev)
//
// STRUCT LAYOUT (recovered from D1 alone — all reads/writes go through +0x8):
//   +0x00  (opaque leading field — not touched by D1)
//   +0x08  cntrl : std::__1::__shared_weak_count*
//            Non-null iff this PCMutexRef owns a shared reference to the
//            underlying pthread mutex control block.  D1 first tests this
//            slot @0xaa; if null, D1 is a no-op (mirrors libc++'s
//            shared_ptr::~shared_ptr on a moved-from / default state).
//
// The __shared_weak_count layout (libc++) — used by D1 via `0x8(%rbx)` /
// `*0x10(%rax)`:
//   +0x00  vptr : virtual dtor / __on_zero_shared / __on_zero_shared_weak
//                     (Itanium ABI: three virtual slots at +0x00/+0x08/+0x10).
//   +0x08  __shared_owners_ : long (strong ref count MINUS ONE — libc++
//            convention; the field starts at 0 for one owner).
//   +0x10  __shared_weak_owners_ : long (weak ref count).
//
// Cross-framework references (all resolved from the disasm and
// nm -arch x86_64 outputs quoted below):
//   __ZNSt3__119__shared_weak_count14__release_weakEv
//                                           @ Ozone stub 0x6dfbbe  -- std::__shared_weak_count::__release_weak()
//                                           (tail-jmp target @0x2cb1a; U-extern into libc++.dylib)
//   *0x10(%rax)  — vtable slot at offset +0x10 of __shared_weak_count
//                                           -- corresponds to
//                                              std::__shared_weak_count::__on_zero_shared() (a
//                                              pure virtual in libc++; the concrete class the
//                                              PCMutex uses is not encoded in this dtor's disasm —
//                                              it's whatever concrete shared_weak_count subclass
//                                              the owning PCMutex ctor allocated).
//
// FULL DISASM (raw-port/re/disasm/PCMutexRef.~PCMutexRef.s):
//   0x2cae0  pushq  %rbp                        ; frame setup
//   0x2cae1  movq   %rsp, %rbp
//   0x2cae4  pushq  %rbx                        ; save rbx (callee-saved)
//   0x2cae5  pushq  %rax                        ; 8-byte stack padding (16-align)
//   0x2cae6  movq   0x8(%rdi), %rbx             ; rbx = this->cntrl (+0x8)
//   0x2caea  testq  %rbx, %rbx                  ; if cntrl == NULL
//   0x2caed  je     0x2cb01                     ;   -> epilogue (no-op)
//   0x2caef  movq   $-0x1, %rax                 ; rax = -1
//   0x2caf6  lock                                ; (LOCK prefix on next insn)
//   0x2caf7  xaddq  %rax, 0x8(%rbx)             ; atomic: old = cntrl->__shared_owners_
//                                               ;         cntrl->__shared_owners_ += -1
//                                               ; rax = old value
//   0x2cafc  testq  %rax, %rax                  ; if old == 0 (i.e. we WERE the last strong owner —
//                                               ; libc++ stores count-1, so 0 means one owner)
//   0x2caff  je     0x2cb08                     ;   -> destroy path
//   0x2cb01  addq   $0x8, %rsp                  ; epilogue (fast path — nothing to do)
//   0x2cb05  popq   %rbx
//   0x2cb06  popq   %rbp
//   0x2cb07  retq
//
//   0x2cb08  movq   (%rbx), %rax                ; rax = cntrl->vptr
//   0x2cb0b  movq   %rbx, %rdi                  ; rdi = cntrl
//   0x2cb0e  callq  *0x10(%rax)                 ; virtual: cntrl->__on_zero_shared()
//                                               ;   (vtable[2] on __shared_weak_count)
//   0x2cb11  movq   %rbx, %rdi                  ; rdi = cntrl (for the tail-jmp)
//   0x2cb14  addq   $0x8, %rsp                  ; epilogue
//   0x2cb18  popq   %rbx
//   0x2cb19  popq   %rbp
//   0x2cb1a  jmp    0x6dfbbe                    ; TAIL-JMP __ZNSt3__119__shared_weak_count14__release_weakEv
//                                               ; (release the WEAK side; may free the control
//                                               ; block if that count also hits zero)
//
// The disasm makes the ordering explicit and IT MATTERS: the strong-owner
// count is decremented FIRST atomically, and only if we observed we were the
// last strong owner (old == 0, using libc++'s count-1 convention) do we call
// __on_zero_shared then __release_weak. That order matches
// libc++'s std::shared_ptr::~shared_ptr — anything else would race.
//
// This port is faithful to that ordering.  However, TypeScript has no
// atomic-decrement primitive on plain JS numbers and no access to a libc++
// __shared_weak_count runtime (the vtable slot +0x10 is a Meyers-singleton
// virtual dispatched into libc++, which does not exist in the JS world).
// Rather than fabricate a shim, we throw a frontier error at BOTH branches
// that would need the runtime: the atomic xaddq, and the virtual dispatch
// via vptr[+0x10] + tail-jmp __release_weak.  The NULL-cntrl fast path is
// safe and is transcribed literally as a no-op.

/**
 * `PCMutexRef` — instance shape decoded from the D1 dtor at Ozone 0x2cae0.
 * Only the field at +0x08 is exercised by D1; the +0x00 slot is opaque and
 * left untyped until another method's disasm reveals it (frontier: no more
 * PCMutexRef methods are enumerated in the Ozone ledger).
 */
export class PCMutexRef {
  /** (this+0x00) — opaque leading slot (not decoded by any enumerated method). */
  // (untouched by D1; recorded for provenance only)

  /**
   * (this+0x08) — pointer to the shared control block (libc++
   * `std::__shared_weak_count*`).  D1 reads this @Ozone 0x2cae6 and branches
   * on null @Ozone 0x2caed. In TS this is opaque state we treat as either
   * present (any non-null object) or absent (null).  We do not fabricate a
   * shared_weak_count runtime — see the D1 body for the frontier throw.
   */
  cntrl_at_0x8: object | null = null;

  /**
   * `PCMutexRef::~PCMutexRef()` [D1] — @Ozone 0x0002cae0
   * (__ZN10PCMutexRefD1Ev).
   *
   * Faithful transcription of the disassembly quoted in the file header.
   * Three code paths, exactly as the binary encodes them:
   *
   *   Fast path (null control block) @Ozone 0x2cae6..0x2caed + 0x2cb01..0x2cb07:
   *     rbx = this->cntrl_at_0x8; if (rbx == NULL) return;
   *   -- No shared block held; the destructor is a genuine no-op.
   *
   *   Decrement-only path (old > 0, i.e. still other strong owners)
   *   @Ozone 0x2caef..0x2caff + 0x2cb01..0x2cb07:
   *     rax = atomic_fetch_add(&rbx->__shared_owners_ (+0x8), -1);
   *     if (rax != 0) return;
   *   -- We released our strong ref but someone else still holds one.
   *
   *   Destroy path (old == 0, i.e. we were the last strong owner)
   *   @Ozone 0x2cb08..0x2cb1a:
   *     rbx->vptr[2](rbx);                          // __on_zero_shared — destroy managed object
   *     __shared_weak_count::__release_weak(rbx);   // tail-jmp — release weak side
   *
   * The last two paths require primitives that don't exist in TS (atomic
   * decrement on foreign memory + libc++ virtual dispatch), so this port
   * throws a frontier error citing the exact @0xADDR in both cases.  The
   * null-cntrl fast path (the common case for a default-constructed or
   * moved-from PCMutexRef) is transcribed literally.
   */
  destruct(): void {
    // @0x2cae6..0x2caed: rbx = this->cntrl_at_0x8; if (rbx == NULL) je 0x2cb01
    const cntrl = this.cntrl_at_0x8;
    if (cntrl === null) {
      // @0x2cb01..0x2cb07: fast-path epilogue — nothing to do.
      return;
    }

    // @0x2caef..0x2caf7: `movq $-0x1,%rax; lock xaddq %rax, 0x8(%rbx)`.
    // Atomic fetch-and-add of -1 on cntrl->__shared_owners_ (offset +0x8 of
    // libc++'s __shared_weak_count; the count is stored as "owners minus one").
    // TS has no direct access to the underlying atomic slot on the C++
    // control block; the entire strong-release + potential virtual dispatch
    // must be modelled through the libc++ runtime (a frontier callee — the
    // control block's concrete class is not encoded here at 0x2cb0e's
    // callq *0x10(%rax) and only manifests once we decode the PCMutex ctor
    // that constructs it).  See the throw below.
    //
    // NB: we do NOT branch on any TS-side field to fake old==0 vs old!=0 —
    // that would corrupt reference-count semantics if this class is ever
    // reintroduced with a real runtime.  Both branches converge on the same
    // frontier throw here, differing only in which citation applies.
    void cntrl;
    throw new Error(
      "PCMutexRef::~PCMutexRef strong-release path @Ozone 0x2caef..0x2cb1a " +
      "(lock xaddq %rax,0x8(%rbx) @0x2caf7; test @0x2cafc; either fast-return @0x2cb01 or " +
      "virtual on_zero_shared via cntrl->vptr[+0x10] @0x2cb0e then tail-jmp " +
      "__ZNSt3__119__shared_weak_count14__release_weakEv via stub @Ozone 0x6dfbbe (target " +
      "@0x2cb1a; U-extern in libc++.dylib)) — atomic decrement on the libc++ " +
      "__shared_weak_count control block requires a runtime that TS does not have; not yet " +
      "transcribed",
    );
  }
}
