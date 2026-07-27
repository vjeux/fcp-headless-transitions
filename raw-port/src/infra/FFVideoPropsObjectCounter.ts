// FFVideoPropsObjectCounter — Flexo
//
// Source symbols (Flexo, dyld_shared_cache):
//   __ZN25FFVideoPropsObjectCounter17adjustObjectCountEi @0x0000000000fd4770
//   __ZN25FFVideoPropsObjectCounter6reportEv             @0x0000000000fd4790
//   __ZN25FFVideoPropsObjectCounterD1Ev                  @0x0000000000fd47a0
//
// Struct layout (recovered from method disasm):
//   +0x00  id                          objcOwner       // released with objc_release in ~dtor
//   +0x08  std::atomic<uint32_t>       count           // xaddl target in adjustObjectCount
//   +0x0c  std::atomic<uint32_t>       highWaterMark   // 2nd arg to FFTestAndAtomicUpdate...
// sizeof = 0x10 (one id + two 32-bit atomics).

/**
 * FFTestAndAtomicUpdateHighWaterMarkCPP — Flexo, undecoded.
 * Real symbol: __Z37FFTestAndAtomicUpdateHighWaterMarkCPPjPNSt3__16atomicIjEEPKc
 * Signature:   void(unsigned int newVal, std::atomic<unsigned int>* hwm, const char* label)
 * Tail-called from FFVideoPropsObjectCounter::adjustObjectCount @0xfd478b.
 */
function FFTestAndAtomicUpdateHighWaterMarkCPP(
  _newVal: number,
  _hwmHolder: FFVideoPropsObjectCounter,
  _label: string,
): void {
  throw new Error(
    "FFTestAndAtomicUpdateHighWaterMarkCPP @0xfd478b(Flexo tail-call target) not yet transcribed",
  );
}

/**
 * objc_release — dyld stub reached via `callq *0x918f5b(%rip)` @0xfd47a7 (Flexo).
 * Undecoded.
 */
function objc_release(_id: unknown): void {
  throw new Error(
    "objc_release @0xfd47a7(Flexo dyld stub) not yet transcribed",
  );
}

export class FFVideoPropsObjectCounter {
  /** +0x00 — id, ARC-owned Objective-C object; released in dtor. */
  objcOwner: unknown = null;
  /** +0x08 — std::atomic<uint32_t> current live object count. */
  count: number = 0;
  /** +0x0c — std::atomic<uint32_t> observed maximum count (high water mark). */
  highWaterMark: number = 0;

  /**
   * FFVideoPropsObjectCounter::adjustObjectCount(int delta) @0x0000000000fd4770 (Flexo).
   *
   * Disasm:
   *   fd4770  pushq  %rbp
   *   fd4771  movq   %rsp, %rbp
   *   fd4774  movl   %esi, %eax                  ; eax = delta
   *   fd4776  lock xaddl %eax, 0x8(%rdi)         ; atomic fetch_add on count; eax = old count
   *   fd477b  addl   %esi, %eax                  ; eax = old + delta = new count
   *   fd477d  leaq   0xc(%rdi), %rsi             ; rsi = &highWaterMark
   *   fd4781  leaq   0x69ab2d(%rip), %rdx        ; rdx = literal "FFVideoPropsObjectCounter::adjustObjectCount"
   *   fd4788  movl   %eax, %edi                  ; edi = newVal
   *   fd478a  popq   %rbp
   *   fd478b  jmp    FFTestAndAtomicUpdateHighWaterMarkCPP    ; tail call
   *
   * Semantics: atomically add int32 `delta` to `count` (mod 2^32), then invoke
   * the high-water-mark updater with the resulting new count and the address of
   * the highWaterMark atomic. `delta` is signed on the wire and mixes signed/
   * unsigned via 32-bit two's-complement wraparound (xaddl on uint32 atomic).
   */
  adjustObjectCount(delta: number): void {
    // movl %esi, %eax  ;  lock xaddl %eax, 0x8(%rdi)
    const oldCount = this.count >>> 0;
    // wrap in 32-bit two's-complement to match xaddl on atomic<uint32_t>
    const newCount = (oldCount + (delta | 0)) >>> 0;
    this.count = newCount;
    // addl %esi, %eax  ; eax = old + delta = newCount (already computed)
    // leaq 0x69ab2d(%rip), %rdx  ; literal pool string
    const kLabel = "FFVideoPropsObjectCounter::adjustObjectCount";
    // jmp __Z37FFTestAndAtomicUpdateHighWaterMarkCPPjPNSt3__16atomicIjEEPKc
    // pass `this` as the holder so the callee sees the same &highWaterMark that
    // `leaq 0xc(%rdi), %rsi` would compute in the binary.
    FFTestAndAtomicUpdateHighWaterMarkCPP(newCount, this, kLabel);
  }

  /**
   * FFVideoPropsObjectCounter::report() @0x0000000000fd4790 (Flexo).
   *
   * Disasm:
   *   fd4790  pushq  %rbp
   *   fd4791  movq   %rsp, %rbp
   *   fd4794  movl   0xc(%rdi), %eax              ; load highWaterMark
   *   fd4797  movl   0x8(%rdi), %eax              ; load count (overwrites eax)
   *   fd479a  popq   %rbp
   *   fd479b  retq
   *
   * Two loads are emitted; the second overwrites eax, so the returned value is
   * `count`. The first load is preserved as a side-effect-free read (mirrors
   * the exact emitted instruction sequence — likely an inlined-observation
   * artifact from the original C++).
   */
  report(): number {
    // movl 0xc(%rdi), %eax  — highWaterMark load, result discarded
    const _hwm = this.highWaterMark >>> 0;
    void _hwm;
    // movl 0x8(%rdi), %eax  — count load, this is the returned value
    return this.count >>> 0;
  }

  /**
   * FFVideoPropsObjectCounter::~FFVideoPropsObjectCounter() @0x0000000000fd47a0 (Flexo, D1).
   *
   * Disasm:
   *   fd47a0  pushq  %rbp
   *   fd47a1  movq   %rsp, %rbp
   *   fd47a4  movq   (%rdi), %rdi                 ; rdi = self->objcOwner (+0x00)
   *   fd47a7  callq  *0x918f5b(%rip)              ; _objc_release
   *   fd47ad  popq   %rbp
   *   fd47ae  retq
   *   fd47af  movq   %rax, %rdi
   *   fd47b2  callq  ___clang_call_terminate      ; exception landing pad
   *
   * Releases the ARC-owned id at +0x00. The two std::atomic<uint32_t> fields at
   * +0x08 / +0x0c are trivially destructible — no further teardown emitted.
   */
  destroy(): void {
    // movq (%rdi), %rdi  ; callq *_objc_release
    objc_release(this.objcOwner);
  }
}
