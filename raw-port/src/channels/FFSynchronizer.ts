// FFSynchronizer — Flexo RAII helper that borrows-back an FFSynchronizable's
// pthread_cond_t + owning-thread accounting for a bounded wait, then restores
// the owner state.  Two Flexo methods are transcribed here (the ledger's
// assignment):
//   0x0000000000012bf0  FFSynchronizer::WaitFor(unsigned int ms)
//   0x0000000000012cd0  FFSynchronizer::~FFSynchronizer()  (D1)
//
// Source disassembly:
//   raw-port/re/disasm/Flexo.FFSynchronizer.WaitFor.s          (@0x12bf0)
//   raw-port/re/disasm/Flexo.FFSynchronizer.~FFSynchronizer.s  (@0x12cd0)
// Framework: Final Cut Pro / Flexo.framework.
//
// ── STRUCT LAYOUT (recovered from the two bodies) ──────────────────────────
// FFSynchronizer:
//   +0x00  FFSynchronizable* sync         // Read `movq (%rdi), %rbx` @0x12c00
//                                          // (WaitFor) and `movq (%rdi), %rdi`
//                                          // @0x12cda (dtor).  The referent's
//                                          // internals are pinned below.
//   +0x08  uint8_t           released      // dtor tests `cmpb $0x0, 0x8(%rdi)`
//                                          // @0x12cd4 — if this is *0*, the
//                                          // dtor calls Unlock; otherwise
//                                          // (non-zero = "we already gave the
//                                          //  lock back") it skips.  The name
//                                          // is our best fit; the ctor (not
//                                          // transcribed here) is where the
//                                          // meaning is definitively pinned.
//
// sizeof(FFSynchronizer) >= 0x9 bytes.  Nothing else is read/written in the
// two decoded methods, so the tail is opaque to this port.
//
// FFSynchronizable (only fields WaitFor reads/writes):
//   +0x40  pthread_cond_t   cond          // Address computed by
//                                          //   `leaq 0x40(%rbx), %rdi` @0x12c75
//                                          //   before pthread_cond_timedwait.
//   +0x70  pthread_t        owner          // Zeroed at @0x12c16
//                                          //   (`movq $0x0, 0x70(%rbx)`) and
//                                          //   restored at @0x12c91 to the
//                                          //   result of `pthread_self()`.
//   +0x78  uint32_t         depth          // Read at @0x12c07 into %r15d
//                                          //   (saved), zeroed at @0x12c0f
//                                          //   (`movl $0x0, 0x78(%rbx)`), and
//                                          //   restored at @0x12c88 (`movl
//                                          //   %r15d, 0x78(%rbx)`).
//
// ── RUNTIME STUBS ─────────────────────────────────────────────────────────
// The two bodies reach four external symbols:
//   `_gettimeofday`           @Flexo stub 0x14977be — call @0x12c24.
//   `_pthread_cond_timedwait` @Flexo stub 0x1497a88 — call @0x12c80.
//   `_pthread_self`           @Flexo stub 0x1497b12 — call @0x12c8c.
//   `FFSynchronizable::Unlock` (mangled `__ZN16FFSynchronizable6UnlockEv`)
//                                                    — call @0x12cdd (dtor).
// The exception unwind path @0x12cae additionally reaches
//   `FFSynchronizable::WaitHelper::~WaitHelper`
//     (mangled `__ZN16FFSynchronizable10WaitHelperD1Ev`) — call @0x12cb5.
//   `__Unwind_Resume`        @Flexo stub 0x1495d30 — call @0x12cbd.
// Each is exposed as a throw-stub honouring raw-port/army/PORTING_SPEC.md
// rule 3 (loud gap > silent guess) with the @0xADDR cited.

/**
 * Opaque handle for the referent of `FFSynchronizer.sync` (+0x00). We DO
 * decode three of its offsets in this port (see STRUCT LAYOUT above), so it
 * has three named accessors below — but the object itself is defined
 * elsewhere in Flexo and is not fully transcribed here.
 */
export type FFSynchronizable = { readonly __ffSynchronizable: unique symbol };

/**
 * `struct timespec` — the two-word rendezvous target that
 * `pthread_cond_timedwait` reads.  We keep it as a plain interface with
 * bigint fields because the native slots are 64-bit words: `tv_sec` at
 * `-0x28(%rbp)` and `tv_nsec` at `-0x20(%rbp)`.
 */
export interface FFTimespec {
  /** seconds since epoch (native `time_t` = 64-bit signed on macOS x86_64). */
  tv_sec: bigint;
  /** nanoseconds within the second (0..999_999_999). */
  tv_nsec: bigint;
}

/**
 * `struct timeval` — the shape `gettimeofday(&tv, NULL)` fills at
 * `-0x38(%rbp)` (tv_sec) and `-0x30(%rbp)` (tv_usec).
 */
export interface FFTimeval {
  tv_sec: bigint;
  tv_usec: number; // uint32 in practice; the imull @0x12c48 treats it as int32.
}

// ── Frontier stubs ────────────────────────────────────────────────────────

/**
 * `_gettimeofday(&tv, NULL)` — stub @Flexo 0x14977be, invoked @0x12c24.
 * Fills `tv` with the current wall-clock time.  Not yet transcribed.
 */
function gettimeofday(tv: FFTimeval, _tzNull: null): number {
  void tv;
  throw new Error(
    "FFSynchronizer::WaitFor: _gettimeofday @Flexo 0x12c24 (stub 0x14977be) " +
      "not yet transcribed"
  );
}

/**
 * `_pthread_cond_timedwait(cond, mutex, abstime)` — stub @Flexo 0x1497a88,
 * invoked @0x12c80.  Returns 0 on signal, non-zero (`ETIMEDOUT`) on timeout.
 * Not yet transcribed.  Callee sees `%rdi = &sync->cond` (i.e. sync+0x40),
 * `%rsi = sync` (used as the mutex — FFSynchronizable IS the mutex here,
 * i.e. the class embeds a pthread_mutex_t at +0x00 of ITSELF from
 * pthread_cond_timedwait's POV; the exact offset is not decoded in this
 * function but the compiler passes `sync` as the mutex pointer without any
 * addend @0x12c7d), `%rdx = &deadline`.
 */
function pthread_cond_timedwait(
  _sync: FFSynchronizable,
  _abstime: FFTimespec,
): number {
  throw new Error(
    "FFSynchronizer::WaitFor: _pthread_cond_timedwait @Flexo 0x12c80 " +
      "(stub 0x1497a88) not yet transcribed"
  );
}

/**
 * `_pthread_self()` — stub @Flexo 0x1497b12, invoked @0x12c8c.  Returns the
 * current thread's `pthread_t`, which is a 64-bit pointer on macOS.  Not yet
 * transcribed.
 */
function pthread_self(): bigint {
  throw new Error(
    "FFSynchronizer::WaitFor: _pthread_self @Flexo 0x12c8c (stub 0x1497b12) " +
      "not yet transcribed"
  );
}

/**
 * `FFSynchronizable::Unlock()` (`__ZN16FFSynchronizable6UnlockEv`) —
 * invoked @0x12cdd from the dtor.  Not yet transcribed; a separate class'
 * raw-port unit.
 */
function FFSynchronizable_Unlock(_sync: FFSynchronizable): void {
  throw new Error(
    "FFSynchronizer::~FFSynchronizer: FFSynchronizable::Unlock @Flexo 0x12cdd " +
      "(mangled __ZN16FFSynchronizable6UnlockEv) not yet transcribed"
  );
}

// FFSynchronizable field accessors (only what WaitFor reads/writes) —
// modelled as external hooks because the containing class is a separate
// port unit.  Each cites the @0xADDR that pinned its offset.

/** Read `sync->depth` (+0x78, uint32). @0x12c07 `movl 0x78(%rbx), %r15d`. */
function ffs_get_depth(_sync: FFSynchronizable): number {
  throw new Error(
    "FFSynchronizer::WaitFor: read FFSynchronizable+0x78 (depth) @0x12c07 " +
      "not yet transcribed (referent-owned field)"
  );
}

/** Write `sync->depth` (+0x78, uint32).  @0x12c0f (=0) and @0x12c88 (=saved). */
function ffs_set_depth(_sync: FFSynchronizable, _v: number): void {
  throw new Error(
    "FFSynchronizer::WaitFor: write FFSynchronizable+0x78 (depth) @0x12c0f/@0x12c88 " +
      "not yet transcribed (referent-owned field)"
  );
}

/** Write `sync->owner` (+0x70, pthread_t/uint64).  @0x12c16 (=0) and @0x12c91. */
function ffs_set_owner(_sync: FFSynchronizable, _v: bigint): void {
  throw new Error(
    "FFSynchronizer::WaitFor: write FFSynchronizable+0x70 (owner) @0x12c16/@0x12c91 " +
      "not yet transcribed (referent-owned field)"
  );
}

// ── Class ─────────────────────────────────────────────────────────────────

/**
 * Faithful transcription of Flexo's `FFSynchronizer`.  Only two methods are
 * in scope here (`WaitFor` and `~FFSynchronizer`).  The ctor and any helpers
 * live in their own raw-port units.
 */
export class FFSynchronizer {
  /** +0x00 — the FFSynchronizable this synchronizer is bound to. */
  public sync: FFSynchronizable;

  /** +0x08 — dtor-skip flag; see STRUCT LAYOUT. */
  public released: boolean;

  constructor(sync: FFSynchronizable) {
    // The ctor isn't the assigned unit for this file.  We model just enough
    // to keep the class instantiable for tests of WaitFor + destroy — the
    // released flag defaults to false so the dtor's `Unlock` branch runs,
    // which matches how a freshly-constructed FFSynchronizer would behave.
    this.sync = sync;
    this.released = false;
  }

  /**
   * `bool FFSynchronizer::WaitFor(unsigned int ms)` @Flexo 0x12bf0.
   *
   * Returns `false` if `pthread_cond_timedwait` returned 0 (i.e. the wait
   * was satisfied by a signal), `true` otherwise (timeout/error).  The
   * conversion is `setne %al` @0x12c98 on the pthread return code.
   *
   * The body performs:
   *   1. Save `sync->depth` and clear it + `sync->owner` (temporarily
   *      abandoning the recursive-lock accounting so another thread can
   *      enter Signal() before we cond_timedwait).
   *   2. gettimeofday(&tv, NULL) and add `ms` milliseconds to it to build
   *      the timespec `deadline` for cond_timedwait.  The `ms / 1000` step
   *      uses the classic magic-number reciprocal (0x10624dd3, shift 38)
   *      that clang emits for `unsigned / 1000`.
   *   3. pthread_cond_timedwait(&sync->cond, sync, &deadline).
   *   4. Restore `sync->depth` and set `sync->owner = pthread_self()`.
   *   5. Return `pthread_return != 0`.
   *
   * The exception-unwind landing pad @0x12cae calls
   * `FFSynchronizable::WaitHelper::~WaitHelper` on a stack-owned helper
   * (`-0x48(%rbp)`).  That helper is `%rbx` itself as spilled at @0x12c03,
   * i.e. `sync` viewed as a WaitHelper base.  This port has no C++ dtor
   * hook; JS exceptions propagate naturally.
   */
  WaitFor(ms: number): boolean {
    // Widen `ms` explicitly per the asm signature.  The %esi ABI slot is
    // 32-bit unsigned; force it here to guard against callers passing a
    // signed number.
    const msU: number = ms >>> 0;

    // @0x12c00 — %rbx = this->sync.  Kept in %rbx (callee-saved) throughout
    // the body; also spilled to -0x48(%rbp) for the landing pad's cleanup.
    const sync: FFSynchronizable = this.sync;

    // @0x12c07 — %r15d = sync->depth (saved for restore at @0x12c88).
    const savedDepth: number = ffs_get_depth(sync) >>> 0;

    // @0x12c0f — sync->depth = 0.
    ffs_set_depth(sync, 0);
    // @0x12c16 — sync->owner = 0.
    ffs_set_owner(sync, 0n);

    // @0x12c1e-@0x12c24 — gettimeofday(-0x38(%rbp), NULL).
    const tv: FFTimeval = { tv_sec: 0n, tv_usec: 0 };
    gettimeofday(tv, null);

    // @0x12c29-@0x12c33 — %rax = (uint32_t)msU * 0x10624dd3; %rax >>= 0x26.
    // This is clang's magic-number division-by-1000: for any u32 x, the
    // top 32 bits of (x * 0x10624dd3) then a right shift by 6 give x/1000.
    // The disasm's form uses a 64-bit imul + shr by 38 (=32+6), which is
    // the same identity.
    const secondsOfMs: number = Math.floor(msU / 1000);

    // @0x12c37 — %ecx = %eax * -1000 (i.e. -secondsOfMs*1000).
    // @0x12c3d — %rax = %rax + tv.tv_sec.  This is `deadline.tv_sec`.
    // @0x12c41 — -0x28(%rbp) = %rax.
    let deadlineSec: bigint = BigInt(secondsOfMs) + tv.tv_sec;
    const negThousandTimesSeconds: number = (secondsOfMs * -1000) | 0;

    // @0x12c45 — %ecx += msU → gives msU - 1000*secondsOfMs = msU%1000.
    // @0x12c48 — %edx = tv.tv_usec * 1000  (μs → ns).
    // @0x12c4f — %ecx = %ecx * 1_000_000  (ms → ns for the remainder).
    // @0x12c55 — %ecx += %edx.  So %ecx now = (msU%1000)*1e6 + tv.tv_usec*1e3.
    // @0x12c57 — -0x20(%rbp) = %rcx.  This is `deadline.tv_nsec`.
    // Model with number math: (msU%1000) <= 999 so (msU%1000)*1e6 <= 999e6,
    // and tv_usec*1000 <= 999_999_000, sum <= ~2e9, safely inside JS ints.
    const msRemMs: number = ((negThousandTimesSeconds + msU) | 0) >>> 0;
    const nsecMsPart: number = Math.imul(msRemMs, 1_000_000);
    const nsecUsPart: number = Math.imul(tv.tv_usec, 1_000);
    let deadlineNsec: number = (nsecMsPart + nsecUsPart) | 0;

    // @0x12c5b — cmpl $0x3b9aca01, %ecx; jb 0x12c75.  0x3b9aca01 = 1_000_000_001.
    // `jb` = branch if unsigned-below, so the fall-through here is "not below",
    // i.e. nsec >= 1e9 + 1  ==  nsec > 1e9.  Since nsec is at most ~2e9 that
    // can only cross once.  The compiler is normalising nsec > 1e9 (NOT >=)
    // because 0x3b9aca00 = 1e9 exactly and `jb` on 0x3b9aca01 keeps 1e9 itself.
    if ((deadlineNsec >>> 0) >= 0x3b9aca01) {
      // @0x12c63 — sec++.  @0x12c66 — store.  @0x12c6a — %rax = %rcx - 1e9.
      // @0x12c71 — store nsec.
      deadlineSec = deadlineSec + 1n;
      deadlineNsec = (deadlineNsec - 0x3b9aca00) | 0;
    }

    const deadline: FFTimespec = {
      tv_sec: deadlineSec,
      tv_nsec: BigInt(deadlineNsec >>> 0),
    };

    // @0x12c75-@0x12c80 — pthread_cond_timedwait(&sync->cond, sync, &deadline).
    // The first arg `%rdi = leaq 0x40(%rbx)` — we fold both offsets into the
    // stub since it takes the sync pointer and the deadline as documented.
    const rc: number = pthread_cond_timedwait(sync, deadline) | 0;

    // @0x12c85 — %r14d = rc  (saved into %r14 for the return conversion).
    // @0x12c88 — sync->depth = savedDepth.
    ffs_set_depth(sync, savedDepth);
    // @0x12c8c-@0x12c91 — sync->owner = pthread_self().
    const self: bigint = pthread_self();
    ffs_set_owner(sync, self);

    // @0x12c95-@0x12c98 — return (rc != 0).
    return rc !== 0;
  }

  /**
   * `FFSynchronizer::~FFSynchronizer()` @Flexo 0x12cd0 (D1).
   *
   * Body:
   *   0x12cd4  cmpb $0x0, 0x8(%rdi)              // if released == 0 …
   *   0x12cd8  jne  0x12ce2
   *   0x12cda  movq (%rdi), %rdi                 // … arg = this->sync
   *   0x12cdd  callq FFSynchronizable::Unlock    // sync->Unlock()
   *   0x12ce2  ret
   *
   * D1 has no D2 sibling in the dump (only `__ZN14FFSynchronizerD1Ev` was
   * emitted).  The landing pad @0x12ce4 hits `___clang_call_terminate`,
   * i.e. the dtor is noexcept.
   */
  destroy(): void {
    // @0x12cd4-@0x12cd8 — skip Unlock if `released` is truthy.
    if (this.released) {
      return;
    }
    // @0x12cda-@0x12cdd — sync->Unlock().
    FFSynchronizable_Unlock(this.sync);
  }
}
