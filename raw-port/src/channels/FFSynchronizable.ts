// FFSynchronizable.ts — FCP Flexo framework class.
// Transcribed from the x86_64 disassembly of Flexo in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
// Versions/A/Flexo (see /tmp/Flexo_tV.txt @0x12f8dc0..0x12f8f6a for the
// full ground-truth bytes reproduced verbatim in the doc-comments below).
//
// FFSynchronizable is a recursive-mutex primitive with an optional
// "lock-check" callback. It wraps a pthread_mutex_t (@+0x00) and a
// pthread_cond_t (@+0x40), plus three fields:
//   +0x70  pthread_t owner       — the pthread that currently holds the lock,
//                                  or 0 when unlocked.
//   +0x78  uint32_t  recursion   — a recursion counter; incremented on
//                                  re-entrant Lock() calls by the same
//                                  pthread, decremented on Unlock(). When
//                                  it reaches 0 the mutex is actually
//                                  released.
//   +0x80  void (*cb)(bool, void const*)
//                                — optional callback invoked on the
//                                  outermost Lock (bool=true) and outermost
//                                  Unlock (bool=false).
//   +0x88  void const* ctx       — opaque context pointer passed to cb.
//
// The total object size is 0x90 (144) bytes — proven by the C-ABI
// FFSynchronizableCreate factory @0x12f8f70 which requests `__Znwm(0x90,
// nothrow_t)` before initializing the same slots this class's C1/C2 do.
//
// Symbols (from `python3 raw-port/army/tools/brief.py Flexo FFSynchronizable`):
//   0x12f8dc0 t FFSynchronizable::FFSynchronizable(void (*)(bool, void const*),
//                                                  void const*)   (C2 — base)
//   0x12f8e10 t FFSynchronizable::FFSynchronizable(void (*)(bool, void const*),
//                                                  void const*)   (C1 — complete)
//   0x12f8e60 t FFSynchronizable::~FFSynchronizable()              (D2 — base)
//   0x12f8e90 t FFSynchronizable::~FFSynchronizable()              (D1 — complete)
//   0x12f8ec0 t FFSynchronizable::Lock()
//   0x12f8f20 t FFSynchronizable::Unlock()
//
// PROVENANCE / DECODE:
//   /tmp/Flexo_tV.txt inspected linearly at file lines 4712889..4713003
//   (x86_64 slice). All disp math for the __stub calls resolves to
//   pthread_* symbols per the inline `## symbol stub for:` annotations
//   otool emits at those RIP-relative call sites; the stubs are:
//     _pthread_mutex_init   @Flexo __stubs 0x1497ae8
//     _pthread_mutex_lock   @Flexo __stubs 0x1497aee
//     _pthread_mutex_unlock @Flexo __stubs 0x1497afa  (tail-jmp target from Unlock)
//     _pthread_mutex_destroy@Flexo __stubs 0x1497ae2
//     _pthread_cond_init    @Flexo __stubs 0x1497a7c  (tail-jmp target from C2/C1)
//     _pthread_cond_destroy @Flexo __stubs 0x1497a76
//     _pthread_self         @Flexo __stubs 0x1497b12
//
// STRUCT LAYOUT (from the ctors' stores):
//   +0x00..+0x3F  pthread_mutex_t   — inited to non-recursive default
//                                   (`pthread_mutex_init(this, NULL)`;
//                                   %rsi = 0 attr @0xdc6/0xe36).
//                                   Recursion is emulated by the +0x78
//                                   counter; the underlying pthread mutex
//                                   is a plain non-recursive one.
//   +0x40..+0x6F  pthread_cond_t    — inited to default
//                                   (`pthread_cond_init(this+0x40, NULL)`).
//                                   The cond var is used by the sibling
//                                   FFSynchronizable::WaitHelper class (a
//                                   separate port); no method in this file
//                                   signals or waits on it.
//   +0x70         pthread_t owner   — set to 0 by C2/C1 (`movq $0x0,
//                                   0x70(%rdi)` @0xdc9/@0xe19); written
//                                   to pthread_self() on outermost Lock,
//                                   read on entry to Lock and Unlock.
//   +0x78         uint32_t recursion— set to 0 by C2/C1 (`movl $0x0,
//                                   0x78(%rdi)` @0xdd1/@0xe21); incremented
//                                   by Lock (re-entrant path) via `incl
//                                   0x78(%rbx)` @0xf0e, decremented by
//                                   Unlock via `decl %eax` @0xf27 (with
//                                   the result stored back).
//   +0x80         void (*cb)(bool, void const*)
//                                   — set to the first ctor arg via
//                                   `movq %rsi, 0x80(%rdi)` @0xdd8/@0xe28;
//                                   read by Lock and Unlock to decide
//                                   whether to invoke the callback.
//   +0x88         void const* ctx   — set to the second ctor arg via
//                                   `movq %rdx, 0x88(%rdi)` @0xdf/@0xe2f;
//                                   passed as the 2nd arg (rsi) to cb.
//
// SEMANTICS OF Lock/Unlock:
//   Lock():
//     if (this.owner == pthread_self()) {
//         ++this.recursion;      // re-entrant path — do NOT re-lock the mutex
//         return;                // (the same thread already holds it).
//     }
//     pthread_mutex_lock(this);  // block until we hold the mutex.
//     this.recursion = 0;        // fresh outer critical section — start count.
//     this.owner = pthread_self();
//     if (this.cb) {
//         return this.cb(true, this.ctx); // TAIL-CALL — "lock acquired" notification.
//     }
//   Unlock():
//     if (this.recursion != 0) {
//         --this.recursion;      // decrement recursion — do NOT release mutex.
//         return;                // (we're still inside a nested Lock).
//     }
//     if (this.cb) {
//         this.cb(false, this.ctx); // "lock about to be released" notification.
//     }
//     this.recursion = 0;        // (already 0 on this branch — redundant, but
//                                //   the asm writes it anyway @0xf56.)
//     this.owner = 0;            // clear owner before dropping the mutex.
//     pthread_mutex_unlock(this); // TAIL-JMP — release for real.
//
// The `owner == pthread_self()` fast-path lets a thread that already
// holds the lock re-enter without a system call. The recursion counter
// tracks how many nested Lock/Unlock pairs are outstanding above the
// outermost pair; when it reaches 0 the outermost Unlock does the real
// work.
//
// NOTE ON pthread_t IN THIS TS PORT: pthread_t is an opaque handle
// (`typedef struct _opaque_pthread_t *pthread_t` on Darwin). The asm
// treats it as a pointer-width value that can be compared with `cmpq`
// and stored/loaded with `movq`. We model it as a nullable opaque
// object and require the caller to provide a `pthreadSelf()` binding
// that returns a stable per-thread identity. Comparing two pthread_t
// values for equality is done by object identity (===) in the JS model,
// matching the pointer-equality semantics the asm uses (`cmpq %rax,%r14`
// @0xed3). Zero is modeled as `null`.

/**
 * Opaque handle for a POSIX pthread_t. On Darwin this is a pointer to
 * an opaque struct; here it is any distinct object whose identity is
 * stable across queries within a single thread. Null represents the
 * zero/unset owner state (matches `movq $0x0, 0x70(%rdi)` @0xdc9).
 */
export interface PthreadT { readonly __opaque_pthread_t: never }

/**
 * The lock-callback signature. Matches the C++ signature
 * `void (*)(bool, void const*)` — first arg is `true` on the outermost
 * Lock() acquisition and `false` on the outermost Unlock() release.
 * The second arg is the opaque context passed into the ctor.
 */
export type FFSynchronizableCallback = (acquired: boolean, ctx: object | null) => void;

/**
 * Host-provided pthread_self() binding. Called by Lock @0x12f8ece and
 * @0x12f8ee7 (the second one after acquiring the mutex, so the value
 * cached at +0x70 is the thread that just took the lock — a nuance the
 * asm captures exactly).
 *
 * A default implementation is supplied that raises a decoded frontier
 * error; a caller port (e.g. the Flexo audio scheduler) must install a
 * real pthread_self equivalent (e.g. Node's worker_thread ID, a WebWorker
 * `self` identity, or a synchronous single-thread stand-in).
 */
export let pthreadSelf: () => PthreadT | null = () => {
  throw new Error(
    "FFSynchronizable.pthreadSelf @0x12f8ece / @0x12f8ee7: host has not installed a pthread_self binding — install one via `setPthreadSelf(fn)` before using FFSynchronizable::Lock()/Unlock() (stub @Flexo __stubs 0x1497b12).",
  );
};

/**
 * Install the host's pthread_self equivalent. See the `pthreadSelf`
 * variable above.
 */
export function setPthreadSelf(fn: () => PthreadT | null): void {
  pthreadSelf = fn;
}

/**
 * FFSynchronizable — recursive-mutex primitive with an optional
 * lock/unlock callback. See file header for the full semantics.
 *
 * @class Flexo FFSynchronizable
 * @provenance Flexo @0x12f8dc0 (C2), @0x12f8e10 (C1), @0x12f8e60 (D2),
 *             @0x12f8e90 (D1), @0x12f8ec0 (Lock), @0x12f8f20 (Unlock).
 */
export class FFSynchronizable {
  /**
   * +0x00..+0x3F — the underlying pthread_mutex_t. In the JS model we
   * do not have a real POSIX mutex; we track its "held" state so
   * pthread_mutex_lock/unlock semantics remain visible to any downstream
   * component that reflects on FFSynchronizable state. Ported host is
   * expected to be single-threaded (JS main), so the mutex is a
   * conceptual placeholder; but the state IS observable via `_mutexHeld`.
   */
  private _mutexHeld: boolean = false;

  /**
   * +0x40..+0x6F — the underlying pthread_cond_t. Not touched by any
   * method in this file (see WaitHelper's D1 dtor @0x14ff0 for the
   * one code path that reads it — through a separate wrapper class).
   */
  private _condInited: boolean = false;

  /** +0x70 — pthread_t owner (null == unowned). */
  private _owner: PthreadT | null = null;

  /** +0x78 — recursion counter (uint32). */
  private _recursion: number = 0;

  /** +0x80 — lock/unlock callback (null == disabled). */
  private _cb: FFSynchronizableCallback | null = null;

  /** +0x88 — opaque context pointer passed to _cb. */
  private _ctx: object | null = null;

  /**
   * FFSynchronizable::FFSynchronizable(cb, ctx) — C2 base ctor.
   *
   * Flexo @0x12f8dc0..0x12f8dfc.
   *
   *     pushq  %rbp
   *     movq   %rsp, %rbp
   *     pushq  %rbx
   *     pushq  %rax
   *     movq   %rdi, %rbx                        ; save this
   *     movq   $0x0, 0x70(%rdi)                  ; +0x70 owner   = 0
   *     movl   $0x0, 0x78(%rdi)                  ; +0x78 recursion = 0
   *     movq   %rsi, 0x80(%rdi)                  ; +0x80 cb      = arg1
   *     movq   %rdx, 0x88(%rdi)                  ; +0x88 ctx     = arg2
   *     xorl   %esi, %esi                        ; %rsi = NULL (attr)
   *     callq  __stub _pthread_mutex_init        ; @Flexo __stubs 0x1497ae8
   *                                              ; init this[+0x00..+0x3F]
   *     addq   $0x40, %rbx                       ; %rbx = this + 0x40
   *     movq   %rbx, %rdi
   *     xorl   %esi, %esi                        ; %rsi = NULL (attr)
   *     addq   $0x8, %rsp
   *     popq   %rbx
   *     popq   %rbp
   *     jmp    __stub _pthread_cond_init         ; TAIL-JMP
   *                                              ; @Flexo __stubs 0x1497a7c
   *                                              ; init this[+0x40..+0x6F]
   *
   * The C1 variant @0x12f8e10..0x12f8e51 is a byte-identical body (same
   * five stores, same two calls, same tail-jmp target); folded into this
   * constructor for the JS port.
   */
  constructor(cb: FFSynchronizableCallback | null, ctx: object | null) {
    // @0x12f8dc9..@0x12f8ddf — store the four scalar fields.
    this._owner = null;      // +0x70 = 0
    this._recursion = 0;     // +0x78 = 0
    this._cb = cb;           // +0x80 = arg1
    this._ctx = ctx;         // +0x88 = arg2

    // @0x12f8de8 — pthread_mutex_init(this, NULL). Non-recursive default
    // attributes (recursion is emulated by _recursion above).
    this._mutexHeld = false;

    // @0x12f8dfc — pthread_cond_init(this+0x40, NULL). Not used by any
    // method in this file — mirrored for observable-state fidelity.
    this._condInited = true;
  }

  /**
   * FFSynchronizable::~FFSynchronizable() — D2 base dtor.
   *
   * Flexo @0x12f8e60..0x12f8e89.
   *
   *     pushq  %rbp
   *     movq   %rsp, %rbp
   *     pushq  %rbx
   *     pushq  %rax
   *     movq   %rdi, %rbx                        ; save this
   *     addq   $0x40, %rdi                       ; %rdi = this + 0x40
   *     callq  __stub _pthread_cond_destroy      ; @Flexo __stubs 0x1497a76
   *     movq   %rbx, %rdi                        ; %rdi = this
   *     callq  __stub _pthread_mutex_destroy     ; @Flexo __stubs 0x1497ae2
   *     addq   $0x8, %rsp
   *     popq   %rbx
   *     popq   %rbp
   *     retq
   *   Cleanup landing pad (if _pthread_cond_destroy throws — impossible
   *   in POSIX but the compiler emits the pad regardless):
   *     movq   %rax, %rdi ; callq ___clang_call_terminate  @0xe81..0xe88
   *
   * D1 @0x12f8e90..0x12f8eb9 is a byte-identical body — same two
   * destroy calls in the same order.
   */
  destroy(): void {
    // @0x12f8e6d — pthread_cond_destroy(this+0x40).
    this._condInited = false;
    // @0x12f8e75 — pthread_mutex_destroy(this).
    // Note: at destroy time the mutex must be UNLOCKED (POSIX undefined
    // behaviour otherwise — the caller is expected to have run Unlock()
    // to zero). We assert that observable state.
    this._mutexHeld = false;
    this._owner = null;
    this._recursion = 0;
    this._cb = null;
    this._ctx = null;
  }

  /**
   * FFSynchronizable::Lock()
   *
   * Flexo @0x12f8ec0..0x12f8f16.
   *
   *     pushq  %rbp
   *     movq   %rsp, %rbp
   *     pushq  %r14
   *     pushq  %rbx
   *     movq   %rdi, %rbx                        ; save this
   *     movq   0x70(%rdi), %r14                  ; %r14 = this.owner (cached)
   *     callq  __stub _pthread_self              ; @Flexo __stubs 0x1497b12
   *                                              ; %rax = pthread_self()
   *     cmpq   %rax, %r14                        ; owner == self ?
   *     je     0x12f8f0e                          ; yes -> re-entrant path
   *     movq   %rbx, %rdi
   *     callq  __stub _pthread_mutex_lock        ; @Flexo __stubs 0x1497aee
   *                                              ; block until we own the mutex
   *     movl   $0x0, 0x78(%rbx)                  ; this.recursion = 0
   *     callq  __stub _pthread_self              ; re-query self (POSIX doesn't
   *                                              ;  guarantee %rax is preserved
   *                                              ;  across mutex_lock — the
   *                                              ;  compiler re-fetches it)
   *     movq   %rax, 0x70(%rbx)                  ; this.owner = pthread_self()
   *     movq   0x80(%rbx), %rax                  ; %rax = this.cb
   *     testq  %rax, %rax                        ; cb == null ?
   *     je     0x12f8f11                          ; yes -> return
   *     movq   0x88(%rbx), %rsi                  ; %rsi = this.ctx (arg 2)
   *     movl   $0x1, %edi                        ; %edi = 1  (bool true; arg 1)
   *     popq   %rbx
   *     popq   %r14
   *     popq   %rbp
   *     jmpq   *%rax                              ; TAIL-CALL cb(true, ctx)
   *   0x12f8f0e:
   *     incl   0x78(%rbx)                         ; this.recursion += 1
   *   0x12f8f11:
   *     popq   %rbx
   *     popq   %r14
   *     popq   %rbp
   *     retq
   */
  Lock(): void {
    // @0x12f8eca — cache this.owner in a local (the asm keeps it in %r14).
    const cachedOwner = this._owner;

    // @0x12f8ece — call pthread_self().
    const self = pthreadSelf();

    // @0x12f8ed3..@0x12f8ed6 — if owner == self, take the re-entrant path.
    if (cachedOwner !== null && cachedOwner === self) {
      // @0x12f8f0e — incl 0x78(%rbx). Recursion counter is a uint32; the
      // asm never checks for overflow (`incl` wraps modulo 2^32). We
      // clamp to the same width.
      this._recursion = (this._recursion + 1) >>> 0;
      // @0x12f8f11..@0x12f8f15 — return.
      return;
    }

    // @0x12f8edb — pthread_mutex_lock(this). In JS single-threaded land
    // this is a no-op re-entry guard: if _mutexHeld is already true we
    // would deadlock — the same UB POSIX describes for a non-recursive
    // mutex. We mirror the observable state.
    if (this._mutexHeld) {
      throw new Error(
        "FFSynchronizable.Lock @0x12f8edb: pthread_mutex_lock on an already-held non-recursive mutex — deadlock (POSIX undefined behaviour). The caller re-entered from a different logical thread without setting owner==self.",
      );
    }
    this._mutexHeld = true;

    // @0x12f8ee0 — this.recursion = 0. Fresh outer critical section.
    this._recursion = 0;

    // @0x12f8ee7..@0x12f8eec — re-query pthread_self() and store into
    // this.owner. The re-query is faithful to the asm: after
    // pthread_mutex_lock (which may have run kernel code that clobbers
    // caller-save registers) the compiler cannot assume the value it
    // computed before the mutex-lock call is still in %rax.
    this._owner = pthreadSelf();

    // @0x12f8ef0..@0x12f8efa — load cb; if null, return.
    const cb = this._cb;
    if (cb === null) {
      // @0x12f8f11..@0x12f8f15 — return.
      return;
    }

    // @0x12f8efc..@0x12f8f0c — tail-call cb(true, ctx).
    cb(true, this._ctx);
  }

  /**
   * FFSynchronizable::Unlock()
   *
   * Flexo @0x12f8f20..0x12f8f6a.
   *
   *     movl   0x78(%rdi), %eax                  ; %eax = this.recursion
   *     testl  %eax, %eax
   *     je     0x12f8f2d                          ; recursion == 0 -> outer path
   *     decl   %eax
   *     movl   %eax, 0x78(%rdi)                  ; this.recursion -= 1
   *     retq                                      ; RETURN — do not release
   *   0x12f8f2d:                                  ; outer-unlock path
   *     movq   0x80(%rdi), %rax                  ; %rax = this.cb
   *     testq  %rax, %rax
   *     je     0x12f8f56                          ; cb == null -> skip callback
   *     pushq  %rbp
   *     movq   %rsp, %rbp
   *     pushq  %rbx
   *     pushq  %rax
   *     movq   0x88(%rdi), %rsi                  ; %rsi = this.ctx  (arg 2)
   *     movq   %rdi, %rbx                        ; save this
   *     xorl   %edi, %edi                        ; %edi = 0 (bool false; arg 1)
   *     callq  *%rax                              ; cb(false, ctx)  (NOT tail-call;
   *                                              ;  the epilogue below still runs)
   *     movq   %rbx, %rdi                        ; %rdi = this
   *     addq   $0x8, %rsp
   *     popq   %rbx
   *     popq   %rbp
   *   0x12f8f56:
   *     movl   $0x0, 0x78(%rdi)                  ; this.recursion = 0
   *                                              ;  (redundant on the cb==null path
   *                                              ;   since we only get here from
   *                                              ;   the outer branch where it was
   *                                              ;   already 0 — the asm writes
   *                                              ;   it anyway; we mirror.)
   *     movq   $0x0, 0x70(%rdi)                  ; this.owner = 0
   *     jmp    __stub _pthread_mutex_unlock      ; TAIL-JMP
   *                                              ; @Flexo __stubs 0x1497afa
   */
  Unlock(): void {
    // @0x12f8f20..@0x12f8f2c — recursion != 0 fast path.
    if (this._recursion !== 0) {
      // @0x12f8f27..@0x12f8f29 — decl and store.
      this._recursion = (this._recursion - 1) >>> 0;
      return;
    }

    // @0x12f8f2d — outer-unlock path.

    // @0x12f8f2d..@0x12f8f37 — cb non-null ? call it.
    const cb = this._cb;
    if (cb !== null) {
      // @0x12f8f4b — cb(false, ctx). Not a tail-call — the epilogue
      // below still runs afterward.
      cb(false, this._ctx);
    }

    // @0x12f8f56 — this.recursion = 0 (redundant but faithful).
    this._recursion = 0;

    // @0x12f8f5d — this.owner = 0. Clear ownership BEFORE releasing the
    // mutex — otherwise a racing pthread waking up from
    // pthread_mutex_lock would see a stale owner. The asm's ordering is
    // observable across threads via the pthread_mutex_unlock barrier.
    this._owner = null;

    // @0x12f8f65 — pthread_mutex_unlock(this) via tail-jmp.
    if (!this._mutexHeld) {
      throw new Error(
        "FFSynchronizable.Unlock @0x12f8f65: pthread_mutex_unlock on an unlocked mutex — POSIX undefined behaviour. The caller ran Unlock() more times than Lock().",
      );
    }
    this._mutexHeld = false;
  }
}
