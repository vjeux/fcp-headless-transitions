// Thread.ts — Flexo's `Thread` object (a Runnable-carrying worker-thread
// handle).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
//         Versions/A/Flexo (macOS FCP, x86_64 slice; unadjusted VAs from
//         `otool -tV`).
//
// This file ports the constructors
//   Thread::Thread(Runnable*)                             @Flexo 0x1303560  (C1)
//   Thread::Thread(Runnable*, int, Thread::eThreadPolicy) @Flexo 0x1303580  (C2, added later)
// Other members of Thread (Start @0x13035f0, RunHelper @0x13036d0, the D2/D1/D0 dtors
// @0x13035c0/@0x13035d0/@0x13035e0) are separate ledger entries and will be added to this same
// file when their own units are claimed.
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (recovered from the ctor)
// -----------------------------------------------------------------------------
// Thread {
//   +0x00  __vptr   : Thread vtable pointer   (installed @0x130356b to the
//                                              vtable at Flexo VA 0x19268b8;
//                                              see VTABLE PROVENANCE below)
//   +0x08  runnable : Runnable*               (arg 1, stored @0x130356e)
//   +0x10  policyData : int32 = 0             (see the LAYOUT CORRECTION below)
//   +0x14  policy     : int32 = 0             (see the LAYOUT CORRECTION below)
//   +0x18  hasPolicy  : bool  = false         (a 1-byte flag zeroed @0x130357a by
//                                              THIS ctor and set to 1 @0x1303598 by
//                                              the 3-argument ctor)
// }
//
// LAYOUT CORRECTION (2026-08-11, from the 3-argument ctor @0x1303580 + Thread::Start @0x13035f0).
// This file originally read the 1-arg ctor's `movq $0x0, 0x10(%rdi)` @0x1303572 as zeroing ONE
// 8-byte pointer slot — "an OS thread handle / pthread_t". The two functions decoded since prove
// that range is TWO int32 fields and never holds a pointer:
//   * the 3-argument ctor writes them separately and as 32-bit values —
//       `movl %edx, 0x10(%rdi)` @0x1303592   (its `int` argument)
//       `movl %ecx, 0x14(%rdi)` @0x1303595   (its `Thread::eThreadPolicy` argument)
//     so the 1-arg ctor's single 8-byte store is simply "both int32s = 0", the default when no
//     policy is supplied;
//   * `Thread::Start()` consumes them as exactly that — `cmpb $0x1, 0x18(%rbx)` @0x130363b gates
//     on the flag, `movl 0x14(%rbx), %eax ; cmpl $0x2, %eax` @0x1303641/@0x1303648 branches on the
//     policy enum, and `movl 0x10(%rbx), %eax` @0x130364d/@0x130366f feeds the value into the
//     `_pthread_mach_thread_np` + `_thread_policy` pair @0x130365e/@0x130367c/@0x1303697.
// The fields below are therefore modelled as two int32s. The observable initialisation of the
// 1-argument ctor is UNCHANGED (both zero); only the model of those 8 bytes is corrected, so one
// byte range keeps exactly one name — the drift OPS_LOG records for OZScene+0x1e5 is what happens
// when it does not. The correction is measured, not argued: see the ORACLE note on the new ctor.
//
// VTABLE PROVENANCE
//   `leaq 0x62334d(%rip), %rax` at 0x1303564 has its RIP base at the NEXT
//   instruction (0x130356b), so it resolves to
//       0x130356b + 0x62334d = 0x19268b8
//   the `Thread` vtable (the __ZTV6Thread slot the compiler loads to install
//   as the object's vptr). No virtual method is CALLED in the ctor — the vptr
//   is only stored — so there is no dispatch target to resolve, just the
//   vtable ADDRESS, which is cited here per PORTING_SPEC Rule 2.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled -> address)
// -----------------------------------------------------------------------------
//   * __ZN6ThreadC1EP8Runnable
//       — Thread::Thread(Runnable*)  @Flexo 0x1303560
//   * __ZN6ThreadC2EP8RunnableiNS_13eThreadPolicyE
//       — Thread::Thread(Runnable*, int, Thread::eThreadPolicy)  @Flexo 0x1303580 (C2, base-object)
//     The C1 twin @0x13035a0 is byte-for-byte the same body (only the vtable leaq displacement
//     differs — 0x62330d vs 0x62332d, because the two sites are 0x20 apart — and BOTH resolve to
//     the same vtable 0x19268b8). It is its own ledger unit and is NOT ported here.
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/Flexo.__ZN6ThreadC1EP8Runnable.s)
// -----------------------------------------------------------------------------
//   0x1303560  pushq  %rbp
//   0x1303561  movq   %rsp, %rbp
//   0x1303564  leaq   0x62334d(%rip), %rax   ; rax = &Thread_vtable (0x19268b8)
//   0x130356b  movq   %rax, (%rdi)           ; this->__vptr = &Thread_vtable
//   0x130356e  movq   %rsi, 0x8(%rdi)        ; this->runnable = arg1 (Runnable*)
//   0x1303572  movq   $0x0, 0x10(%rdi)       ; this->[+0x10] = nullptr
//   0x130357a  movb   $0x0, 0x18(%rdi)       ; this->[+0x18] = 0 (false)
//   0x130357e  popq   %rbp
//   0x130357f  retq
//
// Dependencies: 0 in-scope callees, 0 indirect calls, 0 externs. Pure member
// initialisation + vptr install.
// -----------------------------------------------------------------------------

/**
 * Opaque `Runnable*` — the work object a Thread runs. The ctor only stores the
 * pointer (no dereference), so it is modelled as an opaque token here; the
 * full Runnable interface is a separate ledger entry.
 */
export type Runnable = object;

/**
 * The `Thread` vtable address (Flexo VA 0x19268b8), resolved from the ctor's
 * `leaq 0x62334d(%rip)` (RIP base 0x130356b + 0x62334d). Modelled as a branded
 * constant so the vptr install is explicit and the address is cited in one
 * place. No virtual dispatch occurs in the ctor.
 */
export const THREAD_VTABLE_ADDR = 0x19268b8 as const;

/**
 * `Thread` — Flexo Runnable-carrying worker-thread handle. Only the
 * `Runnable*` constructor is ported so far; the rest of the behaviour lands
 * with its own units.
 */
export class Thread {
  /**
   * this+0x00 — the C++ vtable pointer. The ctor installs the Thread vtable
   * at Flexo 0x19268b8 (@0x130356b). Modelled as the resolved address; TS has
   * no real vtable, so this records which vtable the object was given.
   */
  __vptr: number = THREAD_VTABLE_ADDR;

  /**
   * this+0x08 — the target work object (`Runnable*`), stored from ctor arg 1
   * (@0x130356e). `null` until the ctor runs.
   */
  runnable: Runnable | null = null;

  /**
   * this+0x10 — int32. Written by the 3-argument ctor from its `int` argument
   * (`movl %edx, 0x10(%rdi)` @0x1303592) and zeroed by the 1-argument ctor as half of its 8-byte
   * store @0x1303572. `Thread::Start` loads it with `movl 0x10(%rbx), %eax` @0x130364d/@0x130366f
   * and feeds it to the `_pthread_mach_thread_np` + `_thread_policy` pair, i.e. it is the policy
   * DATA (an importance/precedence value), not a handle. See the LAYOUT CORRECTION in the header.
   */
  policyDataAt0x10: number = 0;

  /**
   * this+0x14 — int32, the `Thread::eThreadPolicy` enum. Written by the 3-argument ctor from its
   * third argument (`movl %ecx, 0x14(%rdi)` @0x1303595) and zeroed by the 1-argument ctor as the
   * other half of that 8-byte store. `Thread::Start` branches on it with
   * `movl 0x14(%rbx), %eax ; cmpl $0x2, %eax` @0x1303641/@0x1303648. The enumerator NAMES are not
   * decoded by any unit in this file, so the raw int32 is kept rather than inventing an enum.
   */
  policyAt0x14: number = 0;

  /**
   * this+0x18 — a 1-byte flag: FALSE from the 1-argument ctor (`movb $0x0` @0x130357a), TRUE from
   * the 3-argument one (`movb $0x1` @0x1303598). `Thread::Start` tests it with `cmpb $0x1`
   * @0x130363b before consulting the two fields above, so it reads as "an explicit policy was
   * supplied". Kept as a boolean because both writes are the literal 0 and 1.
   */
  _flag: boolean = false;

  /**
   * `Thread::Thread(Runnable*)` — @Flexo 0x1303560
   *   (__ZN6ThreadC1EP8Runnable — the C1 unified constructor).
   *
   * Faithful transcription of the 10-instruction body. `%rdi` is the implicit
   * `this`; `%rsi` is arg 1 (the `Runnable*`):
   *
   *   0x1303564/0x130356b  this->__vptr    = &Thread_vtable (0x19268b8)
   *   0x130356e            this->runnable  = arg1 (Runnable*)
   *   0x1303572            this->[+0x10]   = nullptr
   *   0x130357a            this->[+0x18]   = 0 (false)
   *
   * Pure member initialisation + vptr install — no branches, no callees, no
   * externs.
   */
  constructor(runnable: Runnable | null) {
    // @0x130356b movq %rax,(%rdi) : install the Thread vtable pointer.
    this.__vptr = THREAD_VTABLE_ADDR;
    // @0x130356e movq %rsi,0x8(%rdi) : store the Runnable* argument.
    this.runnable = runnable;
    // @0x1303572 movq $0x0,0x10(%rdi) : ONE 8-byte store covering BOTH int32s at +0x10 and +0x14
    //   (see the LAYOUT CORRECTION in the file header) — i.e. "no explicit policy".
    this.policyDataAt0x10 = 0;
    this.policyAt0x14 = 0;
    // @0x130357a movb $0x0,0x18(%rdi) : zero the flag byte — no explicit policy was supplied.
    this._flag = false;
  }
}

/**
 * `Thread::Thread(Runnable*, int, Thread::eThreadPolicy)` — @Flexo 0x1303580
 *   `__ZN6ThreadC2EP8RunnableiNS_13eThreadPolicyE`  (C2, the BASE-OBJECT constructor)
 *
 * FULL transcription — every instruction, in order. %rdi is the implicit `this`, %rsi the
 * `Runnable*`, %edx the `int`, %ecx the `Thread::eThreadPolicy`:
 *
 *   0x1303580  pushq %rbp                    ; frame setup (no TS counterpart)
 *   0x1303581  movq  %rsp,%rbp
 *   0x1303584  leaq  0x62332d(%rip),%rax     ; RIP base 0x130358b + 0x62332d = 0x19268b8
 *   0x130358b  movq  %rax,(%rdi)             ; this->__vptr = &Thread_vtable (0x19268b8)
 *   0x130358e  movq  %rsi,0x8(%rdi)          ; this->runnable = arg1
 *   0x1303592  movl  %edx,0x10(%rdi)         ; this->policyDataAt0x10 = arg2 (int32)
 *   0x1303595  movl  %ecx,0x14(%rdi)         ; this->policyAt0x14     = arg3 (int32)
 *   0x1303598  movb  $0x1,0x18(%rdi)         ; this->_flag = TRUE  <- differs from the 1-arg ctor
 *   0x130359c  popq  %rbp
 *   0x130359d  retq
 *   0x130359e  nop                           ; alignment padding, not executed
 *
 * Pure member initialisation plus the vptr install: no branch, no callee, no extern, no allocation
 * (`depgraph.py deps` lists nothing). It installs the SAME vtable as the 1-argument ctor — the leaq
 * displacement differs (0x62332d here vs 0x62334d there) only because the two instructions sit
 * 0x20 apart, and both resolve to 0x19268b8.
 *
 * THE THREE DIFFERENCES FROM THE 1-ARGUMENT CTOR, which are the whole point of the overload: the
 * two int32s at +0x10/+0x14 take the caller's values instead of zero, and the byte at +0x18 is set
 * to 1 instead of 0. `Thread::Start` @0x13035f0 reads exactly those three (`cmpb $0x1,0x18(%rbx)`
 * @0x130363b, then `movl 0x14(%rbx)` and `movl 0x10(%rbx)`) to decide whether to call
 * `_thread_policy` on the freshly created pthread — so this ctor means "start me with THIS policy"
 * and the 1-argument one means "default".
 *
 * WHY A FREE FUNCTION AND NOT A SECOND `constructor`. This is the C2 *base-object* constructor: in
 * C++ it does not allocate, it initialises storage that already exists. TS allows only one
 * `constructor` per class, and modelling this one by delegating to the 1-argument constructor would
 * transcribe stores the machine does not make here (that ctor zeroes +0x10/+0x14/+0x18 first).
 * Taking the object as `self` mirrors the ABI's %rdi exactly and matches the `<Class>_ctor(self, …)`
 * shape other landed ports use. The C1 complete-object twin @0x13035a0 has a byte-identical body
 * and is its own ledger unit.
 *
 * ORACLE (executed against live FCP, not read). The symbol is exported (`T`), so it was dlsym'd
 * from Flexo in a Rosetta x86_64 process — `arch -x86_64 /usr/bin/python3`, because every address
 * here is an x86_64 offset — after preloading Flexo's @rpath chain depth-first (37 images, 0
 * failures). Called on a 0xCD-poisoned 0x40-byte arena with six argument triples including 0, -1,
 * INT_MIN and INT_MAX in both int slots, live Flexo wrote: the vtable pointer at +0x00 equal to
 * `image slide + 0x19268b8` (which CONFIRMS the resolved vtable address rather than merely
 * computing it), the Runnable pointer at +0x08, both int32s verbatim at +0x10/+0x14, and the byte
 * 1 at +0x18 — leaving every other byte of the arena, +0x19 through +0x3f, still 0xCD in every
 * case. The 1-argument ctor @0x1303560 was then run against the same arena and wrote 0, 0 and 0
 * into those same three slots: that is the direct evidence for the LAYOUT CORRECTION in the file
 * header, since a pointer slot would not read back as two independently-written int32s.
 *
 * @param self       the object being constructed (%rdi).
 * @param runnable   the `Runnable*` (%rsi); stored, never dereferenced.
 * @param policyData the `int` (%edx) — stored as int32 into +0x10.
 * @param policy     the `Thread::eThreadPolicy` (%ecx) — stored as int32 into +0x14.
 */
export function Thread_ctor_RunnableIntPolicy(
  self: Thread,
  runnable: Runnable | null,
  policyData: number,
  policy: number,
): void {
  // @0x1303584/@0x130358b — leaq + movq: install the Thread vtable pointer (0x19268b8).
  self.__vptr = THREAD_VTABLE_ADDR;
  // @0x130358e movq %rsi,0x8(%rdi) — store the Runnable* argument.
  self.runnable = runnable;
  // @0x1303592 movl %edx,0x10(%rdi) — a 32-bit store, hence `| 0`.
  self.policyDataAt0x10 = policyData | 0;
  // @0x1303595 movl %ecx,0x14(%rdi) — a 32-bit store, hence `| 0`.
  self.policyAt0x14 = policy | 0;
  // @0x1303598 movb $0x1,0x18(%rdi) — the literal 1, not a normalisation of anything.
  self._flag = true;
  // @0x130359d retq — returns nothing; no other byte of the object is touched.
}
