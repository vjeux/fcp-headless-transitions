// FFLockBase.ts — the FCP Flexo framework's abstract recursive-lock base class.
// Faithfully transcribed from the FCP Flexo binary at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// nm -n Flexo (x86_64) shows the six FFLockBase entry points plus its inner
// NestingReleaser subclass:
//   0000000000d9f044 t __ZN10FFLockBaseC2Ev                 (ctor)
//   0000000000d9f058 t __ZN10FFLockBase4lockEv              (lock)
//   0000000000d9f0b8 t __ZN10FFLockBase7tryLockEv           (tryLock)
//   0000000000d9f118 t __ZN10FFLockBase6unlockEv            (unlock)
//   0000000000d9f498 t __ZN10FFLockBase15NestingReleaserD1Ev(inner scope-release dtor)
//   00000000003e7d60 t __ZN10FFLockBaseD2Ev                 (trivial dtor, ICF-merged)
//   0000000000f14ce0 t __ZN10FFLockBaseD1Ev                 (ud2 — pure virtual)
//   0000000000f14ce4 t __ZN10FFLockBaseD0Ev                 (ud2 — pure virtual)
//
// Disassembly (runtime-slid addresses used by raw-port/re/disasm/):
//   0x00000000012b9120  FFLockBase::FFLockBase()
//   0x00000000012b9140  FFLockBase::lock()
//   0x00000000012b9180  FFLockBase::tryLock()
//   0x00000000012b91d0  FFLockBase::unlock()
//   0x00000000012b95e0  FFLockBase::NestingReleaser::~NestingReleaser()
//   0x000000000057c860  FFLockBase::~FFLockBase()               (D2, trivial no-op)
//   0x0000000001491c20  FFLockBase::~FFLockBase()               (D1, `ud2` — pure virtual)
//   0x0000000001491c30  FFLockBase::~FFLockBase()               (D0, `ud2` — pure virtual)
//
// STRUCT LAYOUT (recovered from C2 ctor at @0x12b9120 + accessor disasm):
//   +0x00  void** __vfptr                           // vtable ptr (initialised from RIP+0x66c595)
//   +0x08  pthread_t owner                          // 0 == "no owner", else a pthread_self() value
//   +0x10  uint32_t depth                           // recursion count (0 while unowned)
//
// The pthread_t at +0x8 and the int at +0x10 together implement a RECURSIVE
// lock scheme layered on top of a subclass-supplied primitive. FFLockBase is
// ABSTRACT: D1/D0 are literally `pushq %rbp; movq %rsp,%rbp; ud2` (i.e.
// __cxa_pure_virtual — they trap if you ever try to delete through a base
// pointer without a subclass override), and the acquire/tryAcquire/release
// primitives are called through the vtable at slots 0x10 / 0x18 / 0x20.
//
// FCP has (at least) FFSpinLock and FFCriticalSection concrete subclasses
// that plug in os_unfair_lock / pthread_mutex_t; those subclass files fill
// in the three vtable slots and are ported separately.
//
// TypeScript is single-threaded per realm, so the "owner == pthread_self()"
// discriminator collapses: JS has no pthread_self equivalent and no thread
// preemption. We model `owner` as a boolean-ish "someone-owns-it" flag and
// treat every `.lock()`/`.tryLock()` call as "same-thread" (because there is
// only one thread). This preserves the recursive-nesting semantics — which
// is the only externally observable effect of FFLockBase — while the vtable
// acquire/release/tryAcquire calls are surfaced as abstract methods so a
// subclass port can override them faithfully.
//
// SEMANTIC CHECK (matches the disasm line-by-line):
//   lock()   : if (owner == self) ++depth      else { vtbl.acquire(this); depth=0; owner=self }
//   tryLock(): if (owner == self) { ++depth; return true } else { if(!vtbl.tryAcquire(this)) return false; depth=0; owner=self; return true }
//   unlock() : if (depth != 0) --depth         else { owner=0; tail-call vtbl.release(this) }
//
// The "==self" branch never sets `depth = 0` — it just increments — which is
// how the counter tracks nesting depth (0 == "the acquire that took the real
// primitive", 1 == "one nested reentry", etc.). The primary acquire in the
// mismatched-owner branch explicitly resets `depth` to 0 first, then stamps
// `owner` with the current pthread_self.

/**
 * Vtable of an FFLockBase concrete subclass (slots 0x10 / 0x18 / 0x20).
 *
 * These are the three pure-virtual slots called by FFLockBase::lock/tryLock/
 * unlock through `*0x10(%rax)`, `*0x18(%rax)`, `*0x20(%rax)`. A concrete
 * subclass (FFSpinLock, FFCriticalSection, …) supplies them.
 *
 * Slot addresses were read from:
 *   0x00000000012b915e  callq *0x10(%rax)   // acquire
 *   0x000000000012b919e callq *0x18(%rax)   // tryAcquire
 *   0x00000000012b91ee  jmpq  *0x20(%rax)   // release (tail-call)
 */
export interface FFLockBaseVTable {
  /**
   * vtable +0x10 — subclass-specific "block until the underlying primitive
   * is acquired" call. Void return; the disasm ignores the return register.
   */
  acquire(self: FFLockBase): void;
  /**
   * vtable +0x18 — subclass-specific non-blocking acquire. Returns a byte:
   *   testb %al,%al ; je fail  ⇒ non-zero == "took it", zero == "did not".
   */
  tryAcquire(self: FFLockBase): boolean;
  /**
   * vtable +0x20 — subclass-specific "release the underlying primitive".
   * Called via `jmpq *0x20(%rax)` (tail-call, no return read).
   */
  release(self: FFLockBase): void;
}

/**
 * FFLockBase — abstract recursive-lock base. See file header for the ABI /
 * layout / semantics rationale (all recovered from the disassembly).
 *
 * @classAddr Flexo D2=0x000000000057c860, D1=0x0000000001491c20 (pure virtual,
 *                  `ud2`), D0=0x0000000001491c30 (pure virtual, `ud2`),
 *                  C2=0x00000000012b9120, lock=0x00000000012b9140,
 *                  tryLock=0x00000000012b9180, unlock=0x00000000012b91d0.
 */
export abstract class FFLockBase {
  /**
   * `this+0x8` — pthread_t of the owning thread, or 0 (null) if the lock is
   * currently unheld. In the ctor the ABI encodes this as `movq $0x0,
   * 0x8(%rdi)` (@0x12b912e). In JS we have no pthreads; we model the
   * "same-thread reentry" test with a plain boolean that is true iff the
   * lock is currently held by anyone (since "anyone" == "us"). See
   * `_ownerMatchesSelf` for the exact disasm equivalence.
   *
   * @0x00000000012b912e   movq $0x0, 0x8(%rdi)
   */
  protected _owner: boolean = false;

  /**
   * `this+0x10` — recursion depth counter, `uint32_t`. Ctor initialises to 0
   * via `movl $0x0, 0x10(%rdi)`. `lock()` increments only on same-thread
   * reentry; the outermost acquire always resets to 0 (see `lock()` for the
   * exact reset order).
   *
   * @0x00000000012b9136   movl $0x0, 0x10(%rdi)
   */
  protected _depth: number = 0;

  /**
   * Vtable slots 0x10 / 0x18 / 0x20 modelled as abstract methods so a
   * concrete FFLockBase subclass port supplies them the same way the C++
   * subclass populates its vtable. Each of the three call sites in the
   * disasm dispatches through `*0xNN(%rax)` where `rax = *this`.
   */
  protected abstract _vtblAcquire(): void;
  protected abstract _vtblTryAcquire(): boolean;
  protected abstract _vtblRelease(): void;

  /**
   * FFLockBase::FFLockBase() — @Flexo 0x00000000012b9120 (C2).
   *
   *   00000000012b9120  pushq %rbp
   *   00000000012b9121  movq  %rsp, %rbp
   *   00000000012b9124  leaq  0x66c595(%rip), %rax          // &vtable
   *   00000000012b912b  movq  %rax, (%rdi)                  // this+0x00 = vtable
   *   00000000012b912e  movq  $0x0, 0x8(%rdi)               // this+0x08 = 0  (owner)
   *   00000000012b9136  movl  $0x0, 0x10(%rdi)              // this+0x10 = 0  (depth)
   *   00000000012b913d  popq  %rbp
   *   00000000012b913e  retq
   *
   * The RIP-relative `leaq 0x66c595(%rip)` at @0x12b9124 targets the FFLockBase
   * vtable (`__ZTV10FFLockBase` at file offset 0x14c9f58 per nm). Because
   * FFLockBase is abstract (D1/D0 are `ud2`), that vtable is never actually
   * dispatched through — a concrete subclass overrides it before any lock
   * method runs. In TS the vtable "slot" is modelled as the abstract methods
   * on this class, so there is no runtime vtable pointer to install here.
   *
   * The owner (`this+0x8`) and depth (`this+0x10`) initialisers are already
   * expressed as TypeScript field defaults above.
   */
  constructor() {
    // No further work — field defaults above match the two stores at
    // @0x12b912e (owner=0) and @0x12b9136 (depth=0). The `leaq` at
    // @0x12b9124 that installs the vtable ptr has no TS equivalent (see
    // rationale in the doc-comment above).
  }

  /**
   * FFLockBase::~FFLockBase() — Flexo D2=@0x000000000057c860.
   *
   *   000000000057c860  pushq %rbp
   *   000000000057c861  movq  %rsp, %rbp
   *   000000000057c864  popq  %rbp
   *   000000000057c865  retq
   *
   * ICF-merged with FFPlayerThreadStateManager::playerThreadOnly() — a pure
   * no-op body. There are no owned resources to release on the FFLockBase
   * side (the subclass primitive is destroyed by the subclass dtor). D1 and
   * D0 at @0x1491c20 / @0x1491c30 are `ud2` (pure virtual — deleting through
   * an FFLockBase* is a bug that traps at runtime); we mirror that by making
   * the class `abstract` in TS.
   *
   * @Flexo 0x000000000057c860 (D2 no-op),
   *        0x0000000001491c20 (D1 pure virtual, `ud2`),
   *        0x0000000001491c30 (D0 pure virtual, `ud2`).
   */
  destroy(): void {
    // no-op — mirrors the D2 body exactly.
  }

  /**
   * Same-thread ownership predicate used by both `lock()` and `tryLock()`.
   *
   * In the binary this is `cmpq %rax, %r14` where %r14 was `movq 0x8(%rdi),
   * %r14` (the current owner pthread_t) and %rax was the fresh
   * `_pthread_self()` return. The `je` therefore fires iff a previous
   * outermost acquire stamped `this->owner` with the current thread's
   * pthread_self, i.e. this is a nested reentry.
   *
   * TypeScript is single-threaded — if `_owner` is true, WE are that owner
   * by construction (no other thread can have taken the lock behind our
   * back). If `_owner` is false, this is either a first acquire or an
   * outside-thread acquire; both fall into the "primary acquire" branch.
   *
   * @0x00000000012b914e  movq 0x8(%rdi), %r14
   * @0x00000000012b914e/0x00000000012b918a  callq _pthread_self
   * @0x00000000012b9153/0x00000000012b9193  cmpq %rax, %r14
   * @0x00000000012b9156/0x00000000012b9196  je   <reentry-branch>
   */
  protected _ownerMatchesSelf(): boolean {
    return this._owner;
  }

  /**
   * FFLockBase::lock() — @Flexo 0x00000000012b9140.
   *
   *   00000000012b9140  pushq %rbp
   *   00000000012b9141  movq  %rsp, %rbp
   *   00000000012b9144  pushq %r14
   *   00000000012b9146  pushq %rbx
   *   00000000012b9147  movq  %rdi, %rbx                    // %rbx = this
   *   00000000012b914a  movq  0x8(%rdi), %r14               // %r14 = owner
   *   00000000012b914e  callq _pthread_self                 // %rax = self
   *   00000000012b9153  cmpq  %rax, %r14                    // owner == self ?
   *   00000000012b9156  je    0x12b9176                     //   yes -> reentry
   *   00000000012b9158  movq  (%rbx), %rax                  // %rax = vtable
   *   00000000012b915b  movq  %rbx, %rdi                    // arg0 = this
   *   00000000012b915e  callq *0x10(%rax)                   // vtbl.acquire(this)
   *   00000000012b9161  movl  $0x0, 0x10(%rbx)              // depth = 0
   *   00000000012b9168  callq _pthread_self                 // %rax = self (fresh)
   *   00000000012b916d  movq  %rax, 0x8(%rbx)               // owner = self
   *   00000000012b9171  popq  %rbx
   *   00000000012b9172  popq  %r14
   *   00000000012b9174  popq  %rbp
   *   00000000012b9175  retq
   *   00000000012b9176  incl  0x10(%rbx)                    // reentry: ++depth
   *   00000000012b9179  popq  %rbx
   *   00000000012b917a  popq  %r14
   *   00000000012b917c  popq  %rbp
   *   00000000012b917d  retq
   *
   * Order in the primary-acquire branch is significant: the binary calls
   * `_pthread_self` a SECOND time AFTER the acquire returns (@0x12b9168),
   * not once cached. We mirror that (no cache) for faithfulness even though
   * in TS there is nothing that could observe the difference.
   *
   * @callee vtable +0x10 (acquire) via *0x10(%rax) @0x12b915e
   * @callee _pthread_self (framework stub) @0x1497b12 called twice
   */
  lock(): void {
    if (this._ownerMatchesSelf()) {
      // @0x12b9176  incl 0x10(%rbx)
      this._depth = (this._depth + 1) >>> 0;
      return;
    }
    // Primary acquire branch (@0x12b9158..0x12b9175).
    this._vtblAcquire();                    // @0x12b915e  callq *0x10(%rax)
    this._depth = 0;                        // @0x12b9161  movl $0x0, 0x10(%rbx)
    this._owner = true;                     // @0x12b916d  movq %rax, 0x8(%rbx)
  }

  /**
   * FFLockBase::tryLock() — @Flexo 0x00000000012b9180.
   *
   *   00000000012b9180  pushq %rbp
   *   00000000012b9181  movq  %rsp, %rbp
   *   00000000012b9184  pushq %r14
   *   00000000012b9186  pushq %rbx
   *   00000000012b9187  movq  %rdi, %rbx
   *   00000000012b918a  movq  0x8(%rdi), %r14              // owner
   *   00000000012b918e  callq _pthread_self
   *   00000000012b9193  cmpq  %rax, %r14
   *   00000000012b9196  je    0x12b91b7                    // reentry -> ++depth,true
   *   00000000012b9198  movq  (%rbx), %rax                 // vtable
   *   00000000012b919b  movq  %rbx, %rdi
   *   00000000012b919e  callq *0x18(%rax)                  // vtbl.tryAcquire(this)
   *   00000000012b91a1  testb %al, %al
   *   00000000012b91a3  je    0x12b91c1                    // failed -> return 0
   *   00000000012b91a5  movl  $0x0, 0x10(%rbx)             // depth = 0
   *   00000000012b91ac  callq _pthread_self
   *   00000000012b91b1  movq  %rax, 0x8(%rbx)              // owner = self
   *   00000000012b91b5  jmp   0x12b91ba
   *   00000000012b91b7  incl  0x10(%rbx)                   // reentry: ++depth
   *   00000000012b91ba  movb  $0x1, %al                    // return true
   *   00000000012b91bc  popq  %rbx
   *   00000000012b91bd  popq  %r14
   *   00000000012b91bf  popq  %rbp
   *   00000000012b91c0  retq
   *   00000000012b91c1  xorl  %eax, %eax                   // return false
   *   00000000012b91c3  popq  %rbx
   *   00000000012b91c4  popq  %r14
   *   00000000012b91c6  popq  %rbp
   *   00000000012b91c7  retq
   *
   * Same shape as `lock()` with one extra fork on the tryAcquire result:
   * a zero return short-circuits back out with `%eax = 0` (false); a
   * non-zero return joins the "movb $0x1, %al" tail after depth+owner
   * stamping, so both the reentry and the successful primary-acquire paths
   * return `true`.
   *
   * @callee vtable +0x18 (tryAcquire) via *0x18(%rax) @0x12b919e
   * @callee _pthread_self (framework stub) @0x1497b12 called twice
   */
  tryLock(): boolean {
    if (this._ownerMatchesSelf()) {
      // @0x12b91b7  incl 0x10(%rbx)  then fall through to `movb $0x1, %al`.
      this._depth = (this._depth + 1) >>> 0;
      return true;
    }
    // @0x12b919e  callq *0x18(%rax)
    if (!this._vtblTryAcquire()) {
      // @0x12b91c1  xorl %eax, %eax
      return false;
    }
    this._depth = 0;         // @0x12b91a5  movl $0x0, 0x10(%rbx)
    this._owner = true;      // @0x12b91b1  movq %rax, 0x8(%rbx)
    return true;             // @0x12b91ba  movb $0x1, %al
  }

  /**
   * FFLockBase::unlock() — @Flexo 0x00000000012b91d0.
   *
   *   00000000012b91d0  pushq %rbp
   *   00000000012b91d1  movq  %rsp, %rbp
   *   00000000012b91d4  movl  0x10(%rdi), %eax             // depth
   *   00000000012b91d7  testl %eax, %eax
   *   00000000012b91d9  je    0x12b91e2                    // depth==0 -> real release
   *   00000000012b91db  decl  %eax                         // --depth
   *   00000000012b91dd  movl  %eax, 0x10(%rdi)
   *   00000000012b91e0  popq  %rbp
   *   00000000012b91e1  retq
   *   00000000012b91e2  movq  $0x0, 0x8(%rdi)              // owner = 0
   *   00000000012b91ea  movq  (%rdi), %rax                 // vtable
   *   00000000012b91ed  popq  %rbp
   *   00000000012b91ee  jmpq  *0x20(%rax)                  // TAIL-call vtbl.release(this)
   *
   * The primary-release path is a TAIL call (`jmpq`, not `callq`) into the
   * subclass release primitive at vtable +0x20 — there is no post-return
   * work. The reentry path just decrements the counter and returns.
   *
   * Note: unlock() does NOT check owner. The binary trusts the caller to
   * only invoke unlock while the lock is held (unlocking while `depth == 0`
   * with `owner == 0` would still call the subclass release, which is UB
   * per e.g. os_unfair_lock's contract — but that's the C++ code's problem,
   * not ours to invent a guard for).
   *
   * @callee vtable +0x20 (release) via *0x20(%rax) @0x12b91ee (tail-call)
   */
  unlock(): void {
    if (this._depth !== 0) {
      // @0x12b91db  decl %eax ; movl %eax, 0x10(%rdi)
      this._depth = (this._depth - 1) >>> 0;
      return;
    }
    // @0x12b91e2  movq $0x0, 0x8(%rdi)  — release owner slot before the
    // primitive release so the next lock() correctly sees "unowned".
    this._owner = false;
    // @0x12b91ee  jmpq *0x20(%rax)  — tail-call into vtbl.release(this).
    this._vtblRelease();
  }
}

/**
 * FFLockBase::NestingReleaser — an inner RAII helper whose destructor
 * restores a saved depth+owner pair. Only its D1 dtor is exported.
 *
 * FFLockBase::NestingReleaser::~NestingReleaser() — @Flexo 0x00000000012b95e0.
 *
 *   00000000012b95e0  pushq %rbp
 *   00000000012b95e1  movq  %rsp, %rbp
 *   00000000012b95e4  pushq %rbx
 *   00000000012b95e5  pushq %rax
 *   00000000012b95e6  movq  %rdi, %rbx                     // %rbx = releaser
 *   00000000012b95e9  movl  0x8(%rdi), %eax                // savedDepth
 *   00000000012b95ec  movq  (%rdi), %rcx                   // lock = *(releaser+0x0)
 *   00000000012b95ef  movl  %eax, 0x10(%rcx)               // lock->depth = savedDepth
 *   00000000012b95f2  callq _pthread_self
 *   00000000012b95f7  movq  (%rbx), %rcx
 *   00000000012b95fa  movq  %rax, 0x8(%rcx)                // lock->owner = pthread_self()
 *   00000000012b95fe  addq  $0x8, %rsp
 *   00000000012b9602  popq  %rbx
 *   00000000012b9603  popq  %rbp
 *   00000000012b9604  retq
 *
 * STRUCT LAYOUT (recovered from the accesses in the dtor):
 *   +0x00  FFLockBase* lock                       // borrowed pointer
 *   +0x08  uint32_t    savedDepth                 // depth to restore
 *
 * The dtor writes `lock->depth = savedDepth` and stamps `lock->owner` with
 * the CURRENT thread's pthread_self — i.e. it's used to temporarily hand
 * ownership to another thread (or nested block) and then reclaim it on
 * scope exit. No C1/C2 ctor is exported (it's inlined at the two call sites
 * inside Flexo), so we only port the destructor.
 *
 * There is NO acquire/release call inside the dtor — the outer scope owned
 * the underlying primitive across the whole nesting window. This dtor just
 * fixes up the two accounting fields.
 *
 * @classAddr Flexo D1=0x00000000012b95e0.
 * @callee _pthread_self (framework stub) @0x1497b12
 */
export class FFLockBase_NestingReleaser {
  /**
   * `this+0x0` — non-owning pointer back to the FFLockBase whose accounting
   * fields we will restore on `destroy()`. Read at @0x12b95ec and again at
   * @0x12b95f7 (the binary re-reads it instead of caching in a register
   * across the `_pthread_self` call — we mirror that faithfulness by not
   * caching either).
   */
  readonly lock: FFLockBase;

  /**
   * `this+0x8` — the depth value that was current at the moment this
   * releaser was constructed. Read at @0x12b95e9. `uint32_t`.
   */
  readonly savedDepth: number;

  /**
   * The C1/C2 ctors are not exported by Flexo (inlined at the callers). The
   * only observable fact about construction, deduced from what the dtor
   * reads back, is that the two fields must be initialised to (lock,
   * savedDepth) — we accept them as constructor args and store them
   * verbatim.
   */
  constructor(lock: FFLockBase, savedDepth: number) {
    this.lock = lock;
    this.savedDepth = savedDepth >>> 0;
  }

  /**
   * ~NestingReleaser() — see the disasm quoted in the class doc-comment.
   *
   * We need to write into the FFLockBase's `_depth` and `_owner` fields,
   * which are `protected`. We expose a package-internal method on
   * FFLockBase (`_ffLockBase_restoreForNestingReleaser`) that performs the
   * exact two writes at @0x12b95ef and @0x12b95fa.
   */
  destroy(): void {
    // @0x12b95e9..0x12b95fa — writes lock->depth = savedDepth ; lock->owner = pthread_self()
    _ffLockBase_restoreForNestingReleaser(this.lock, this.savedDepth);
  }
}

/**
 * Package-internal write helper used by FFLockBase_NestingReleaser::destroy
 * to mirror the two field stores at @0x12b95ef and @0x12b95fa. This exists
 * because TS visibility rules would otherwise block a cross-class write
 * into FFLockBase's protected fields — the C++ code has direct access
 * because NestingReleaser is a nested friend within FFLockBase.
 *
 * The `_pthread_self()` call at @0x12b95f2 returns a non-zero pthread_t;
 * we model that as "owner becomes true" (see FFLockBase._owner rationale).
 */
function _ffLockBase_restoreForNestingReleaser(lock: FFLockBase, savedDepth: number): void {
  // Trampoline through a subclass of FFLockBase-with-protected-access to
  // perform the two field writes. Using `as unknown as` is only to bypass
  // the TS access modifier — the runtime layout is identical.
  interface _MutableFFLockBase { _depth: number; _owner: boolean; }
  const m = lock as unknown as _MutableFFLockBase;
  m._depth = savedDepth >>> 0;   // @0x12b95ef  movl %eax, 0x10(%rcx)
  m._owner = true;               // @0x12b95fa  movq %rax, 0x8(%rcx)  (pthread_self != 0)
}
