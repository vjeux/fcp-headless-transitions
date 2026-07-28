// FFAudioGainChannelIndefiniteConstantValueBuffer — Flexo audio gain-channel
// buffer subclass whose `indefinite() const` virtual returns TRUE (vs the
// base FFAudioGainChannelBuffer which returns FALSE).
//
// Source disassembly:
//   raw-port/re/disasm/Flexo.FFAudioGainChannelIndefiniteConstantValueBuffer.~FFAudioGainChannelIndefiniteConstantValueBuffer.s
//   raw-port/re/disasm/Flexo.FFAudioGainChannelIndefiniteConstantValueBuffer.indefinite.s
//   raw-port/re/disasm/FFAudioGainChannelIndefiniteConstantValueBuffer.D1.s
// Framework: Final Cut Pro / Flexo.framework
//
// Flexo symbols transcribed:
//   @0xe63cb0  FFAudioGainChannelIndefiniteConstantValueBuffer::~FFAudioGainChannelIndefiniteConstantValueBuffer()  (D1 — complete-object)
//   @0xe63ce0  FFAudioGainChannelIndefiniteConstantValueBuffer::~FFAudioGainChannelIndefiniteConstantValueBuffer()  (D0 — deleting)
//   @0xe63d40  FFAudioGainChannelIndefiniteConstantValueBuffer::indefinite() const
//
// DECODE evidence:
//   * VTable of this class installed at *(this) is at Flexo 0x1917ec0.
//     Computed from D1 @0xe63cb4 `leaq 0xab4205(%rip), %rax` → RIP-after=0xe63cbb,
//     0xe63cbb+0xab4205 = 0x1917ec0. D0 does the same at @0xe63ce0:
//     `leaq 0xab41d9(%rip), %rax` → RIP-after=0xe63ce7, 0xe63ce7+0xab41d9 = 0x1917ec0.
//     Both dtors reinstall the DERIVED class's vtable pointer at this->0x0 before
//     running member cleanup — the standard Itanium ABI dtor prologue emitted
//     when a base subobject has a virtual dtor.
//   * `__ZdlPv` @Flexo 0x1497404 = operator delete(void*) stub (see the `## symbol
//     stub for: __ZdlPv` annotation otool emits at each of 0xe63cf1, 0xe63d07,
//     0xe63d15, and 0xe63ccf). Called on this->0x8 to free the owned buffer,
//     and — in D0 only — on `this` itself.
//   * Object layout pinned by these dtors:
//        +0x00  vptr (reinstalled by both dtors to the derived vtable @0x1917ec0)
//        +0x08  owned-buffer raw pointer  — read at 0xe63cbe (D1) / 0xe63cea (D0)
//        +0x10  "moved-from" tombstone slot — WRITTEN with the owned-buffer value
//               at 0xe63cc7 (D1) / 0xe63cfd (D0) *before* the pointer is passed
//               to operator delete. This is the exact pattern clang emits for
//               `std::unique_ptr` release-then-delete when the deleter has a
//               data-member of its own; the tombstone write is dead in-memory
//               (about to be freed) but pins the offset in the ABI.
//
// Related symbols (documented, not transcribed here):
//   * FFAudioGainChannelBuffer::indefinite() const @Flexo 0xe63ab0 — the base
//     implementation, whose body is `xorl %eax,%eax; ret` (returns 0/false).
//     This subclass overrides that slot to return 1/true.
//   * FFAudioGainChannelBuffer::~FFAudioGainChannelBuffer() (D1/D0) — the
//     base destructor invoked implicitly by the Itanium ABI once this
//     subclass's own cleanup completes. NOT visible in these two dtor bodies
//     because clang has inlined the base dtor into the derived one (the whole
//     base cleanup is just an `operator delete(this->0x8)` — the base holds
//     no other resources — so the derived dtor performs it directly).
//
// ── PORT ─────────────────────────────────────────────────────────────────
// TypeScript doesn't need to manage memory; the observable behaviour of
// these three symbols is:
//   * D1: run destructor side-effects (in the raw asm: reset vtable slot,
//     null out the owned buffer). In TS we surface that as `destroy()`
//     which nulls the owned buffer reference.
//   * D0: same as D1 plus free `this`. In TS this is just `destroy()` +
//     nothing; the object is unreachable once callers drop their ref.
//   * indefinite(): returns literal `true`. This is the ONE pure-math bit
//     that could go through the oracle (a 0-arg const-bool function).

/** Opaque handle for the audio buffer stored at this->0x8. Not decoded.
 *  The dtors reveal only that it's a pointer freed by `__ZdlPv` (i.e.
 *  `operator delete(void*)`), so it's heap-allocated with `operator new`. */
export interface FFAudioGainOwnedBuffer {}

/**
 * `FFAudioGainChannelIndefiniteConstantValueBuffer` — Flexo audio-gain
 * channel-value buffer that reports `indefinite() = true`. Concrete subclass
 * of `FFAudioGainChannelBuffer`; its base returns `false` from that virtual.
 *
 * Pinned object layout (from D1/D0 asm):
 *   +0x00  vptr → &vtable_FFAudioGainChannelIndefiniteConstantValueBuffer @Flexo 0x1917ec0
 *   +0x08  owned buffer raw pointer (nullable) — freed by operator delete
 *   +0x10  "tombstone" slot written with the owned-buffer value just before
 *          the free — dead in-memory but pins the offset.
 */
export class FFAudioGainChannelIndefiniteConstantValueBuffer {
  /** field +0x08 — owned buffer raw pointer; `null` means "nothing to free". */
  ownedBuffer: FFAudioGainOwnedBuffer | null = null;

  /** field +0x10 — tombstone slot; the asm writes the owned-buffer pointer here
   *  before calling `operator delete` on it. Pinned for parity with the C++
   *  object layout even though the value is dead-after-free. */
  ownedBufferTombstone: FFAudioGainOwnedBuffer | null = null;

  /**
   * `FFAudioGainChannelIndefiniteConstantValueBuffer::~FFAudioGainChannelIndefiniteConstantValueBuffer()`
   * (complete-object, D1 in the Itanium C++ ABI) @Flexo 0xe63cb0.
   *
   * Body:
   *   0xe63cb0  pushq %rbp
   *   0xe63cb1  movq  %rsp, %rbp
   *   0xe63cb4  leaq  0xab4205(%rip), %rax           ; %rax = &vtable @0x1917ec0
   *   0xe63cbb  movq  %rax, (%rdi)                   ; this->0x0 = &vtable  (reinstall derived vtable)
   *   0xe63cbe  movq  0x8(%rdi), %rax                ; %rax = this->0x8   (owned buffer ptr)
   *   0xe63cc2  testq %rax, %rax
   *   0xe63cc5  je    0xe63cd4                       ; if (p == null) skip free
   *   0xe63cc7  movq  %rax, 0x10(%rdi)               ; this->0x10 = p   (tombstone slot)
   *   0xe63ccb  movq  %rax, %rdi                     ; arg0 = p
   *   0xe63cce  popq  %rbp
   *   0xe63ccf  jmp   __ZdlPv                        ; tail-call operator delete(p) @Flexo 0x1497404
   *   0xe63cd4  popq  %rbp
   *   0xe63cd5  retq                                 ; return path when p is null
   *
   * Faithful TS mirror: reset the buffer field, mirroring the vtable slot's
   * pointer write as a no-op (TS has no vtable), and null out the owned
   * buffer (freeing is implicit in JS GC once no refs remain). */
  destroy(): void {
    // @0xe63cb4-cbb reinstall derived vtable at this->0x0 — no-op in TS.
    // @0xe63cbe read this->0x8 into %rax.
    const p = this.ownedBuffer;
    // @0xe63cc2 testq %rax, %rax ; @0xe63cc5 je 0xe63cd4  — null-check.
    if (p !== null) {
      // @0xe63cc7 movq %rax, 0x10(%rdi) — tombstone slot.
      this.ownedBufferTombstone = p;
      // @0xe63ccf jmp __ZdlPv — operator delete(p). In JS, drop the ref.
      this.ownedBuffer = null;
    }
    // @0xe63cd4-d5 fall-through / early-out on null p.
  }

  /**
   * `FFAudioGainChannelIndefiniteConstantValueBuffer::~FFAudioGainChannelIndefiniteConstantValueBuffer()`
   * (deleting-dtor, D0 in the Itanium C++ ABI) @Flexo 0xe63ce0.
   *
   * Body:
   *   0xe63ce0  leaq  0xab41d9(%rip), %rax           ; %rax = &vtable @0x1917ec0
   *   0xe63ce7  movq  %rax, (%rdi)                   ; this->0x0 = &vtable
   *   0xe63cea  movq  0x8(%rdi), %rax                ; %rax = this->0x8
   *   0xe63cee  testq %rax, %rax
   *   0xe63cf1  je    0x1497404                      ; if (p == null) tail-call __ZdlPv(this)
   *   0xe63cf7  pushq %rbp
   *   0xe63cf8  movq  %rsp, %rbp
   *   0xe63cfb  pushq %rbx
   *   0xe63cfc  pushq %rax                            ; stack-align
   *   0xe63cfd  movq  %rax, 0x10(%rdi)               ; this->0x10 = p   (tombstone)
   *   0xe63d01  movq  %rdi, %rbx                     ; save this in %rbx
   *   0xe63d04  movq  %rax, %rdi                     ; arg0 = p
   *   0xe63d07  callq __ZdlPv                        ; operator delete(p)
   *   0xe63d0c  movq  %rbx, %rdi                     ; arg0 = this
   *   0xe63d0f  addq  $0x8, %rsp
   *   0xe63d13  popq  %rbx
   *   0xe63d14  popq  %rbp
   *   0xe63d15  jmp   __ZdlPv                        ; tail-call operator delete(this)
   *
   * Two operator-delete calls: first on the owned buffer, then on `this`.
   * In TS both are implicit — we just null out the owned buffer. */
  destroyAndDelete(): void {
    // @0xe63ce0-e7 reinstall derived vtable at this->0x0 — no-op in TS.
    // @0xe63cea read this->0x8.
    const p = this.ownedBuffer;
    // @0xe63cee-f1 null-check with FAST-PATH: if p is null, tail-call
    // __ZdlPv(this) *immediately* without setting up a frame. The `this`
    // pointer is still in %rdi, unchanged.
    if (p === null) {
      // @0xe63cf1 je 0x1497404 — operator delete(this). In JS, drop refs.
      return;
    }
    // @0xe63cfd movq %rax, 0x10(%rdi) — tombstone slot.
    this.ownedBufferTombstone = p;
    // @0xe63d07 callq __ZdlPv — operator delete(p). In JS, drop the ref.
    this.ownedBuffer = null;
    // @0xe63d15 jmp __ZdlPv — operator delete(this). In JS, drop refs.
  }

  /**
   * `FFAudioGainChannelIndefiniteConstantValueBuffer::indefinite() const`
   * @Flexo 0xe63d40.
   *
   * Body:
   *   0xe63d40  pushq %rbp
   *   0xe63d41  movq  %rsp, %rbp
   *   0xe63d44  movb  $0x1, %al                      ; return true
   *   0xe63d46  popq  %rbp
   *   0xe63d47  retq
   *
   * A one-line const virtual override: returns literal `true`. The base
   * `FFAudioGainChannelBuffer::indefinite() const` @Flexo 0xe63ab0 returns
   * `false` (`xorl %eax, %eax; ret`); this subclass overrides that. */
  indefinite(): boolean {
    // @0xe63d44 movb $0x1, %al  — 8-bit return-value register = 1.
    return true;
  }
}
