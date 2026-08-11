// HeapAllocator_anon.ts — raw transcription of Helium's internal-linkage
// `(anonymous namespace)::HeapAllocator`.
//
// ONE symbol is transcribed in this file — the D0 deleting destructor. Every
// other member is a SEPARATE ledger unit and is NOT ported here:
//   0x171da0  ~HeapAllocator() [D1 complete-object dtor]   (read below, not ported)
//   0x171dc0  allocate(HGMetalHeapPool::Descriptor const&)
//   0x171e60  release(id<MTLHeap>)
//
// Naming: the class lives in an ANONYMOUS namespace (mangled
// `__ZN12_GLOBAL__N_113HeapAllocatorD0Ev`), so its name is only unique within
// this translation unit — some other framework may well ship an unrelated
// `HeapAllocator`. The `_anon` suffix follows the landed precedent
// raw-port/src/infra/invert_anon.ts, which files
// `(anonymous namespace)::invert` the same way.
//
// Provenance (Helium framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// Symbol ported in this file:
//   @0x171db0  (anonymous namespace)::HeapAllocator::~HeapAllocator() [D0]
//                __ZN12_GLOBAL__N_113HeapAllocatorD0Ev
//
// Source disassembly (re-derived with
// `raw-port/tools/disasm.sh --sym __ZN12_GLOBAL__N_113HeapAllocatorD0Ev Helium`):
//   raw-port/re/disasm/__ZN12_GLOBAL__N_113HeapAllocatorD0Ev.s (6 lines)
//
// ---------------------------------------------------------------------------
// FULL DISASM — D0, the whole function
// ---------------------------------------------------------------------------
//   0x171db0  pushq %rbp                     ; frame setup (no TS counterpart)
//   0x171db1  movq  %rsp, %rbp
//   0x171db4  popq  %rbp                     ; frame torn down BEFORE the jmp —
//                                            ; the mark of a tail call
//   0x171db5  jmp   0x3c4fa0                 ## symbol stub for: __ZdlPv
//                                            ; = operator delete(void*), with
//                                            ; %rdi still holding `this`
//   0x171dba  nopw  (%rax,%rax)              ; alignment padding, not executed
//
// ---------------------------------------------------------------------------
// WHAT A D0 IS, AND WHY THIS ONE IS ONLY A FREE
// ---------------------------------------------------------------------------
// Per the Itanium C++ ABI a D0 ("deleting destructor") is defined as: run the
// D1 complete-object destructor, then `operator delete` the storage. Here the
// D1 half has been optimised away entirely — not omitted by the disassembler —
// because D1 @0x171da0 is EMPTY:
//
//   0x171da0  pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq
//
// i.e. the class has no members needing teardown and no virtual base. (D1 is
// read here only to justify its absence from D0, exactly as sibling getters are
// read to pin a field offset; it remains its own ledger unit.) So the entire
// observable effect of D0 is `operator delete(this)`.
//
// The `jmp` is a TAIL CALL, not a branch inside the function: %rbp is popped
// first, so `operator delete` returns straight to D0's caller and inherits its
// stack frame. `__ZdlPv`'s single argument is %rdi, which still holds the
// `this` that arrived — nothing in the body touches it.
//
// CALLEES: exactly one, `operator delete(void*)` @stub 0x3c4fa0. That is a
// libc++ runtime extern — OUT of the five in-scope frameworks — so per
// DEP_WORKER_BRIEF's "only legitimate throw" rule it is modelled as a boundary
// stub citing its address, NOT as an in-scope stub. There is no in-scope call,
// no indirect call and no virtual dispatch: `depgraph.py deps
// __ZN12_GLOBAL__N_113HeapAllocatorD0Ev` lists nothing.
//
// ---------------------------------------------------------------------------
// ORACLE
// ---------------------------------------------------------------------------
// Verified by CALLING the live code — raw-port/re/oracle/HeapAllocator_anon_D0_oracle.py.
// Both symbols are LOCAL (`nm` type `t`; internal linkage is what an anonymous
// namespace means), so dlsym cannot reach them; the harness calls them at
// `dyld slide + vmaddr` through raw-port/re/oracle/ozone_loader.py, with the
// address from `nm -n -arch x86_64` (a bare `nm` reports the ARM64 slice even
// under Rosetta and would call some other function) and a hard refusal to run
// outside an x86_64 process. Measured over 64 malloc'd, 0xA5-poisoned blocks:
//   * D1 modified ZERO bytes of the object in 64/64 trials — the measurement
//     behind "the D1 half is empty, so D0 is only a free";
//   * after D0, `malloc_size(p)` was 0 in 64/64 trials, while a live block that
//     was never passed to D0 reports a non-zero size — i.e. D0 really does
//     release the storage.
// (The harness also reports whether the next malloc reuses the address. That
// signal is RUN-DEPENDENT — 0, 12, 57 and 64 of 64 across four runs — so it is
// printed for information and deliberately kept out of the verdict; wiring it
// in would have failed a correct port on half the runs.)

/**
 * libc++ `void operator delete(void *ptr)` — reached through the mach-o symbol
 * stub at @Helium 0x3c4fa0; the call site is the tail `jmp` @0x171db5. This is a
 * C++ runtime extern, outside the five in-scope frameworks, so it is modelled as
 * a boundary stub that documents the ABI it satisfies rather than being
 * transcribed. JS objects are garbage-collected: the machine's guarantee is only
 * "the storage backing `ptr` is released and must not be dereferenced again",
 * and no TS caller can observe the difference through this class's interface.
 */
function _operator_delete(_ptr: HeapAllocator_anon): void {
  // @Helium 0x3c4fa0 (symbol stub for: __ZdlPv) — libc++ extern, no-op in JS.
  void _ptr;
}

/**
 * `(anonymous namespace)::HeapAllocator` — Helium's internal Metal-heap
 * allocator, held by a `std::shared_ptr` (its `__shared_ptr_emplace`
 * instantiation lives at @0x171d30..@0x171d90).
 *
 * NO instance state is modelled: the transcribed body reads no field of `this`
 * (there is no `(%rdi)` memory operand anywhere in D0, and D1 @0x171da0 is
 * empty, which is exactly what proves there is no member to tear down). The
 * real layout must come from the ctor / `allocate` units when those are ported —
 * inventing fields here would be the magic-offset guesswork PORTING_SPEC Rule 5
 * forbids.
 *
 * @Helium 0x171db0
 */
export class HeapAllocator_anon {
  /**
   * `(anonymous namespace)::HeapAllocator::~HeapAllocator()` [D0 deleting dtor]
   *   — @Helium 0x171db0 (__ZN12_GLOBAL__N_113HeapAllocatorD0Ev)
   *
   * Full transcription — every instruction, in order:
   *
   *   0x171db0  pushq %rbp        ; frame setup (no TS counterpart)
   *   0x171db1  movq  %rsp, %rbp
   *   0x171db4  popq  %rbp        ; frame torn down before the jump
   *   0x171db5  jmp   0x3c4fa0    ; TAIL CALL to operator delete(void*),
   *                               ; %rdi = this, unmodified since entry
   *
   * The D1 complete-object destructor @0x171da0 is empty
   * (`pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq`), so the ABI-mandated
   * "destroy, then deallocate" collapses to just the deallocation — see the file
   * header. Verified live: D1 leaves all 64 bytes of a poisoned object untouched,
   * and after D0 `malloc_size` of the block is 0.
   *
   * Nothing is read from `this`, nothing is written, and there is no return
   * value: a D0 returns void.
   */
  D0(): void {
    // @0x171db4/@0x171db5 — popq %rbp ; jmp __ZdlPv : tail-call
    //   operator delete(this). No member teardown precedes it (D1 @0x171da0 is
    //   empty), and the argument is the unmodified `this` from %rdi.
    _operator_delete(this);
  }
}
