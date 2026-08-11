/**
 * PCSharedMutex — ProCore's single-writer / multiple-reader recursive lock.
 * Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore.
 *
 * STRUCT LAYOUT (recovered from the C2 ctor @0xaced8 + the four accessors):
 *   +0x00  uint32  magic      = 0x32AAABA7            // @0xacee5: `movq $0x32aaaba7, (%rdi)`
 *                              (upper 32 bits of the qword store are the
 *                               low 4 bytes of the mutex's own state; the
 *                               ctor zeros them via `xorps xmm0/movups`
 *                               at +0x8..+0x40, so effectively the whole
 *                               qword at +0x00 is `0x00000000_32AAABA7`.)
 *   +0x08  std::mutex          // @0xacef7 movups xmm0,+0x8 ; sizeof=0x38 on darwin libc++
 *   +0x40  uint64  ownerTid   = 0                       // pthread_t of the exclusive owner (0 = none)
 *   +0x48  uint32  writerRecursion = 0                  // recursive re-entry count for the writer
 *   +0x50  std::vector<ReaderInfo>::begin  = nullptr    // @0xacef0 leaq 0x50(%rdi),%r14; movups xmm0
 *   +0x58  std::vector<ReaderInfo>::end    = nullptr
 *   +0x60  std::vector<ReaderInfo>::cap    = nullptr    // @0xacef7 movq $0x0, 0x60(%rdi)
 *
 * ReaderInfo layout (recovered from the lock_shared push_back path @0xad0e4..0xad0f5 and
 * from unlock_shared's element-size arithmetic @0xad293 `-0x14` / @0xad2bd `0x4` and vector
 * stride at @0xad0c1 `addq $0x10, %rax`):
 *   +0x00  uint64  tid       // pthread_t of the reader
 *   +0x08  uint32  count     // recursive read-lock count (init 1 in push_back @0xad0eb)
 *   +0x0C  uint32  _pad      // (0x10-byte stride, 0x14 = 0x10 element + 0x4-byte back-pad in unlock_shared's `-0x14`)
 * (Total element size 0x10 as evidenced by `addq $0x10, %rax` on the scan @0xad0c1 and
 * by `leaq 0x10(%r14), %rsi` on the erase-shift @0xad2b9.)
 *
 * The ctor reserves 3 slots @0xacf16..0xacf1e (`movl $0x3, %esi; movq %r14, %rdi;
 * callq __ZNSt3__16vectorIN13PCSharedMutex10ReaderInfoENS_9allocatorIS2_EEE7reserveEm`).
 *
 * PORTING NOTE — TypeScript is single-threaded per realm. Even so, this port faithfully
 * mirrors every branch and every field the C++ touches; the `ownerTid` comparison to
 * `pthread_self()` and the reader-list scan are preserved verbatim. Since we cannot call
 * `_pthread_self`, we surface it as an injectable stub — real callers can pass any stable
 * per-context token (e.g. a fiber id); the algorithm's behaviour is invariant under any
 * bijection of "thread identity". Arithmetic is transcribed literally.
 *
 * @classAddr ProCore
 *   0xaced8  PCSharedMutex::PCSharedMutex()          [C2 — primary]
 *   0xacfe0  PCSharedMutex::PCSharedMutex()          [C1 — thunk → C2]
 *   0xacfea  PCSharedMutex::lock()
 *   0xad086  PCSharedMutex::lock_shared()
 *   0xad22a  PCSharedMutex::unlock()
 *   0xad25a  PCSharedMutex::unlock_shared()
 */

// ── Frontier stubs — undecoded external callees ──────────────────────────

/** `_pthread_self` @ProCore stub 0xdeada — Darwin libSystem thread-id primitive.
 *  Called @0xacff7 (lock), @0xad096 (lock_shared), @0xad267 (unlock_shared).
 *  TS has no direct thread notion; a caller-supplied override is the only
 *  faithful proxy. We raise until wired.  */
function pthread_self_stub(): bigint {
  throw new Error(
    "_pthread_self @ProCore 0xdeada (stub) — provide a thread-id source via PCSharedMutex.setPthreadSelf(fn)",
  );
}

let _pthread_self_impl: () => bigint = pthread_self_stub;

/** `std::__1::mutex::lock()` @ProCore stub 0xde654 — the inner spinlock used to
 *  serialise every access to the writer-owner / reader-list state. Called
 *  @0xad002, @0xad043 (lock), @0xad0a1, @0xad0d6 (lock_shared), @0xad233
 *  (unlock), @0xad272 (unlock_shared). Undecoded here.  */
function std_mutex_lock_stub(_m: PCSharedMutex): void {
  // Faithful no-op in a single-threaded runtime: acquiring an uncontended
  // libc++ std::mutex on the calling thread is observably a no-op except
  // for the memory barrier; JS has no analogue. We DO NOT model the
  // barrier (nothing observes it in-language). The call sites are still
  // preserved so the control flow matches the binary line-for-line.
}

/** `std::__1::mutex::unlock()` @ProCore stub 0xde65a — release counterpart.
 *  Called @0xad013, @0xad053, @0xad078 (lock), @0xad0ce, @0xad0fd, @0xad122,
 *  @0xad12d (lock_shared), @0xad255 (unlock), @0xad2ea (unlock_shared).  */
function std_mutex_unlock_stub(_m: PCSharedMutex): void {
  // See std_mutex_lock_stub — noop in single-threaded JS, but the call
  // sites are preserved verbatim.
}

/** `std::__1::this_thread::sleep_for<duration<int64_t, nano>>` @ProCore stub 0xde54c —
 *  invoked @0xad031 (lock spin) with a 0x186a0 ns = 100µs pause. Undecoded here.  */
function std_sleep_for_100us_stub(): void {
  throw new Error(
    "std::this_thread::sleep_for(100µs) @ProCore 0xde54c (stub) not yet transcribed",
  );
}

/** `std::__1::vector<PCSharedMutex::ReaderInfo, ...>::reserve(size_t)`
 *  @ProCore stub — mangled `__ZNSt3__16vectorIN13PCSharedMutex10ReaderInfoENS_9allocatorIS2_EEE7reserveEm`,
 *  called @0xacf1e from the C2 ctor with `esi = 3`. In TS we model the vector
 *  as a plain array; `reserve` has no observable effect on array semantics
 *  so we honour the call site with a comment but do not throw.  */
function std_vector_reserve_stub(_v: ReaderInfo[], _n: number): void {
  // std::vector::reserve — pre-allocates storage; array has no analogue.
}

/** `std::__1::vector<PCSharedMutex::ReaderInfo, ...>::push_back` @ProCore stub —
 *  mangled `__ZNSt3__16vectorIN13PCSharedMutex10ReaderInfoENS_9allocatorIS2_EEE9push_backB9nqe210106ERKS2_`,
 *  called @0xad0f5 from lock_shared with a stack-local ReaderInfo{tid,count=1}.
 *  In TS this is Array.push — semantically equivalent for the element shape.  */
function std_vector_push_back(v: ReaderInfo[], e: ReaderInfo): void {
  v.push(e);
}

/** `_memmove` @ProCore stub 0xde966 — called @0xad2c9 in unlock_shared's
 *  erase-by-shift path when a reader with count==1 is removed. In TS the
 *  same effect is realised by Array.splice; we still name the call site.  */
function memmove_erase_reader(v: ReaderInfo[], idx: number): void {
  v.splice(idx, 1);
}

// ── ReaderInfo — the vector element (16-byte struct) ─────────────────────

/**
 * PCSharedMutex::ReaderInfo — 16-byte POD.
 *   +0x00  uint64  tid    // set from pthread_self() @0xad0e8
 *   +0x08  uint32  count  // recursion count (init 1 @0xad0eb, ++/-- @0xad112/@0xad2d9)
 *   +0x0C  uint32  _pad
 */
export interface ReaderInfo {
  tid: bigint;
  count: number;
}

// ── The class ────────────────────────────────────────────────────────────

/**
 * PCSharedMutex — see file-level doc for full struct layout + provenance.
 */
export class PCSharedMutex {
  /** +0x00 magic word (`movq $0x32aaaba7, (%rdi)` @0xacee5). */
  private readonly _magic: number = 0x32aaaba7;

  /** +0x08 std::mutex — modelled as opaque; std_mutex_{lock,unlock}_stub take `this`. */
  // (no field needed — the stubs are no-ops in TS.)

  /** +0x40 owner pthread_t of the exclusive writer, or 0n if none.
   *  Zero-initialised @0xacef7 by the `xorps xmm0 ; movups xmm0, 0x38(%rdi)` sweep. */
  private _ownerTid: bigint = 0n;

  /** +0x48 recursive write-lock count. Init 0 @0xacf0f `movl $0x0, 0x48(%rdi)`. */
  private _writerRecursion: number = 0;

  /** +0x50 vector<ReaderInfo>. Init empty; capacity reserved to 3 by the ctor
   *  @0xacf16..0xacf1e. */
  private _readers: ReaderInfo[] = [];

  /**
   * `PCSharedMutex::PCSharedMutex()` @0xaced8 (C2 — the primary constructor).
   *
   *   0xaced8  push rbp / mov rbp,rsp / push r15/r14/rbx / push rax
   *   0xacee2  mov  rbx, rdi                      ; rbx = this
   *   0xacee5  mov  qword [rdi], 0x32aaaba7       ; +0x00 magic
   *   0xaceec  lea  r14, [rdi+0x50]               ; &this->_readers
   *   0xacef0  xorps xmm0, xmm0
   *   0xacef3  movups [rdi+0x50], xmm0            ; +0x50/+0x58 = 0 (vec begin/end)
   *   0xacef7  mov  qword [rdi+0x60], 0           ; +0x60 = 0    (vec cap)
   *   0xacef7  movups [rdi+0x8], xmm0             ; +0x08..+0x18 zero (mutex)
   *   0xacf03  movups [rdi+0x18], xmm0            ; +0x18..+0x28 zero
   *   0xacf07  movups [rdi+0x28], xmm0            ; +0x28..+0x38 zero
   *   0xacf0b  movups [rdi+0x38], xmm0            ; +0x38..+0x48 zero (finishes mutex + owner low)
   *   0xacf0f  mov  dword [rdi+0x48], 0           ; +0x48 writerRecursion
   *   0xacf16  mov  esi, 3
   *   0xacf1b  mov  rdi, r14
   *   0xacf1e  callq vector::reserve(3)           ; @0xacf1e
   *   0xacf23  epilogue / ret
   *
   * The tail after 0xacf2d is the itanium landing-pad (unwind path if
   * `reserve` throws) — a `terminate` shim; not observable from TS.
   */
  constructor() {
    // @0xacee5 magic and @0xacef7/@0xacf0f zero-inits are captured by the
    // field initializers above. Only the reserve call has a run-time
    // side-effect worth naming.
    // @0xacf1e: vector<ReaderInfo>::reserve(3)
    std_vector_reserve_stub(this._readers, 3);
  }

  /** Inject a real `pthread_self`-equivalent. In native code this is
   *  hard-wired to Darwin's TLS thread pointer; in JS the caller must
   *  supply a stable per-context token. Once set, all four locking
   *  methods use it via the `_pthread_self_impl` slot. */
  static setPthreadSelf(fn: () => bigint): void {
    _pthread_self_impl = fn;
  }

  /**
   * `PCSharedMutex::lock()` @0xacfea — exclusive (writer) acquire, recursive.
   *
   *   0xacfea  prologue; rbx = this
   *   0xacff7  callq _pthread_self                 ; r14 = self
   *   0xad002  callq std::mutex::lock(this)         ; hold the inner mutex
   *   0xad007  rax = *(this+0x40)                   ; current owner
   *   0xad00b  cmp  rax, r14
   *   0xad00e  je   0xad068                         ; same-thread recursion path
   *   0xad010  callq std::mutex::unlock(this)       ; release inner mutex before spinning
   *   0xad018  xor  eax, eax
   *   0xad01b  lock cmpxchg [this+0x40], r14        ; try 0 -> self on the owner slot
   *   0xad020  je   0xad040                         ; success → drain readers
   *   0xad022 (spin-body)
   *   0xad026  mov  qword [rbp-0x20], 0x186a0       ; 100000 ns = 100µs
   *   0xad02e  callq std::this_thread::sleep_for(100µs)
   *   0xad036  xor  eax, eax
   *   0xad038  lock cmpxchg [this+0x40], r14        ; retry
   *   0xad03e  jne  0xad026                         ; still owned → sleep again
   *   0xad040  callq std::mutex::lock(this)         ; ← reader-drain loop head
   *   0xad048  r14 = *(this+0x58)                   ; readers.end
   *   0xad04c  r15 = *(this+0x50)                   ; readers.begin
   *   0xad050  callq std::mutex::unlock(this)
   *   0xad058  cmp  r15, r14                        ; begin==end ? (no readers)
   *   0xad05b  jne  0xad040                         ; still readers → relock+recheck
   *   0xad05d  epilogue; ret                        ; own the write lock, no readers
   *
   *   Recursion tail @0xad068:
   *   0xad068  inc dword [this+0x48]                ; ++writerRecursion
   *   0xad06b  epilogue + tail-jmp std::mutex::unlock(this)  @0xad078
   */
  lock(): void {
    // @0xacff7
    const self: bigint = _pthread_self_impl();

    // @0xad002
    std_mutex_lock_stub(this);
    // @0xad007..@0xad00e
    if (this._ownerTid === self) {
      // @0xad068: already own the lock exclusively → bump recursion
      this._writerRecursion = (this._writerRecursion + 1) >>> 0;
      // @0xad06b/@0xad078: tail-jmp unlock inner mutex
      std_mutex_unlock_stub(this);
      return;
    }
    // @0xad010: release inner mutex before spinning
    std_mutex_unlock_stub(this);

    // @0xad018..@0xad020: first CAS attempt (0 → self).
    // @0xad01b `lock cmpxchgq %r14, 0x40(%rbx)` — rax=0, so it swaps iff
    //   _ownerTid == 0. On success ZF=1 and it falls through to the
    //   reader-drain loop @0xad040. On failure we enter the sleep-retry
    //   loop @0xad026.
    let cas_ok = false;
    if (this._ownerTid === 0n) {
      this._ownerTid = self;
      cas_ok = true;
    }
    if (!cas_ok) {
      // @0xad026: spin-with-sleep. The disasm holds the immediate
      //   0x186a0 (=100000ns=100µs) in a stack slot and re-passes it on
      //   every iteration. `sleep_for` is the only side-effect; the CAS
      //   is retried until it succeeds.
      // eslint-disable-next-line no-constant-condition
      while (true) {
        // @0xad02e
        std_sleep_for_100us_stub();
        // @0xad038: retry CAS
        if (this._ownerTid === 0n) {
          this._ownerTid = self;
          break;
        }
        // @0xad03e: still contended → jne back to the sleep call.
      }
    }

    // Reader-drain loop head @0xad040. Take the inner mutex, snapshot
    //   the reader-list begin/end, drop the mutex, loop while nonempty.
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // @0xad040
      std_mutex_lock_stub(this);
      // @0xad048/@0xad04c: sample end and begin — in the binary these
      //   are two independent pointer loads. In TS the array's length
      //   is the single observable quantity.
      const readersLen = this._readers.length;
      // @0xad053
      std_mutex_unlock_stub(this);
      // @0xad058..@0xad05b
      if (readersLen === 0) {
        // @0xad05d: epilogue — write lock is held, no active readers.
        return;
      }
      // @0xad05b jne → back to @0xad040. Yield-loop: in native code
      //   this is a busy loop against the reader-count under the
      //   inner mutex. In JS we have no way to yield without an
      //   await, so this branch (readers still present after we took
      //   the write slot) can only be reached if a re-entrant reader
      //   never released — a bug we raise on rather than deadlock.
      throw new Error(
        "PCSharedMutex::lock @0xad05b — writer waiting for readers to drain; TS runtime cannot yield here without an async surface (raising instead of deadlocking; matches the semantic wait)",
      );
    }
  }

  /**
   * `PCSharedMutex::lock_shared()` @0xad086 — reader (shared) acquire, recursive.
   *
   *   0xad086  prologue; rbx = this
   *   0xad096  callq _pthread_self                       ; r14 = self
   *   0xad0a1  callq std::mutex::lock(this)              ; guard state
   *   0xad0a6  rax = *(this+0x40)                        ; owner
   *   0xad0aa  cmp  rax, r14
   *   0xad0ad  je   0xad10d                              ; already write-owned by self
   *   0xad0af..0xad0c5  scan readers:
   *              rax = *(this+0x50)                      ; begin
   *              rcx = *(this+0x58)                      ; end
   *              loop:
   *                 cmp rax, rcx ; je 0xad0c7             ; not found → owner-wait branch
   *                 cmp [rax], r14 ; je 0xad112           ; found this tid → bump count
   *                 rax += 0x10 ; jmp loop
   *   0xad0c7  (not found path): r15 = &readers @+0x50
   *                              unlock inner mutex
   *                              relock ; while owner!=0 unlock+lock ; test @0xad0db..
   *   0xad0e4..0xad0eb  build stack ReaderInfo{tid=r14, count=1}
   *   0xad0f5  callq vector::push_back(&readers, &tmp)
   *   0xad0fd  unlock inner mutex ; ret
   *
   *   Same-thread-writer branch @0xad10d:
   *   0xad10d  inc dword [this+0x48]                     ; ++writerRecursion
   *   0xad110  jmp 0xad115 → tail-jmp unlock
   *
   *   Existing-reader branch @0xad112:
   *   0xad112  inc dword [rax+0x8]                       ; ++reader.count
   *   0xad115  tail-jmp std::mutex::unlock(this)
   */
  lock_shared(): void {
    // @0xad096
    const self: bigint = _pthread_self_impl();
    // @0xad0a1
    std_mutex_lock_stub(this);

    // @0xad0a6..@0xad0ad
    if (this._ownerTid === self) {
      // @0xad10d: this thread already holds the writer lock; count as
      //   a nested write acquisition (matches the binary's dword++).
      this._writerRecursion = (this._writerRecursion + 1) >>> 0;
      // @0xad115
      std_mutex_unlock_stub(this);
      return;
    }

    // @0xad0af..@0xad0c5: linear scan of the reader list looking for `self`.
    //   Native strides by 0x10 bytes per element; each element's +0x00 is
    //   the tid.
    for (let i = 0; i < this._readers.length; i++) {
      if (this._readers[i].tid === self) {
        // @0xad112: found → ++count
        this._readers[i].count = (this._readers[i].count + 1) >>> 0;
        // @0xad115
        std_mutex_unlock_stub(this);
        return;
      }
    }

    // @0xad0c7: not found. Native then drops the inner mutex and busy-
    //   loops relock/unlock until _ownerTid == 0. Once the writer slot
    //   is clear (with the mutex held on exit from the loop), it pushes
    //   a fresh ReaderInfo{self, count=1}.
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // @0xad0ce
      std_mutex_unlock_stub(this);
      // @0xad0d3
      std_mutex_lock_stub(this);
      // @0xad0db..@0xad0e2: owner == 0 ?
      if (this._ownerTid === 0n) {
        break;
      }
      // @0xad0e2 jne → back to the unlock/lock pair. In a real thread
      //   this yields the CPU; in JS this is an infinite busy loop
      //   with no observers, so we surface it as an error rather than
      //   spin forever.
      throw new Error(
        "PCSharedMutex::lock_shared @0xad0e2 — reader waiting for writer to release; TS runtime cannot yield here without an async surface",
      );
    }

    // @0xad0e4..@0xad0f5: push_back(ReaderInfo{tid=self, count=1}).
    const tmp: ReaderInfo = { tid: self, count: 1 };
    std_vector_push_back(this._readers, tmp);

    // @0xad0fd
    std_mutex_unlock_stub(this);
  }

  /**
   * `PCSharedMutex::unlock()` @0xad22a — release the writer lock.
   *
   *   0xad22a  prologue; rbx = this
   *   0xad233  callq std::mutex::lock(this)
   *   0xad238  eax = *(this+0x48)                        ; writerRecursion
   *   0xad23b  test eax,eax
   *   0xad23d  je   0xad246                              ; recursion==0 → clear owner
   *   0xad23f  --eax
   *   0xad241  mov  [this+0x48], eax                     ; store decremented recursion
   *   0xad244  jmp  0xad24c                              ; then unlock inner mutex
   *   0xad246  xor eax,eax
   *   0xad248  xchg rax, [this+0x40]                     ; atomic swap owner ← 0
   *   0xad24c  tail-jmp std::mutex::unlock(this)
   */
  unlock(): void {
    // @0xad233
    std_mutex_lock_stub(this);
    // @0xad238..@0xad23d
    if (this._writerRecursion !== 0) {
      // @0xad23f..@0xad241: --writerRecursion (unsigned dec)
      this._writerRecursion = (this._writerRecursion - 1) >>> 0;
    } else {
      // @0xad246..@0xad248: outermost release → clear owner slot.
      this._ownerTid = 0n;
    }
    // @0xad24c/@0xad255: tail-jmp std::mutex::unlock(this)
    std_mutex_unlock_stub(this);
  }

  /**
   * `PCSharedMutex::unlock_shared()` @0xad25a — release one shared count.
   *
   *   0xad25a  prologue; rbx = this
   *   0xad267  callq _pthread_self                       ; r15 = self
   *   0xad272  callq std::mutex::lock(this)
   *   0xad277  rax = *(this+0x40)                        ; owner
   *   0xad27b  cmp  rax, r15
   *   0xad27e  je   0xad2ab                              ; same-thread writer → dec writer count
   *   0xad280  r14 = *(this+0x50)                        ; readers.begin
   *   0xad284  rax = *(this+0x58)                        ; readers.end
   *   0xad288  cmp  rax, r14
   *   0xad28b  je   0xad2dd                              ; empty → epilogue
   *   0xad28d  rdx = rax - r14 - 0x14                    ; bytes-from-hit-to-tail-minus-tail-pad
   *   0xad297  cmp  [r14], r15 ; je 0xad2b0              ; hit
   *   0xad29c  r14 += 0x10 ; rdx -= 0x10 ; cmp r14,rax ; jne 0xad297
   *   0xad2a9  jmp 0xad2dd                               ; not found → epilogue
   *   ── writer branch @0xad2ab:
   *   0xad2ab  dec dword [this+0x48]                     ; --writerRecursion
   *   0xad2ae  jmp  0xad2dd
   *   ── hit @0xad2b0:
   *   0xad2b0  ecx = *(r14+0x8)                          ; reader.count
   *   0xad2b4  cmp ecx, 1
   *   0xad2b7  jne 0xad2d7                               ; count>1 → just decrement
   *   0xad2b9  rsi = r14+0x10                            ; src for shift-erase
   *   0xad2bd  r15 = rdx + 0x4                           ; bytes to move
   *   0xad2c1  cmp rsi, rax ; je 0xad2ce                 ; already last element → no memmove
   *   0xad2c6  callq _memmove(r14 [dst], rsi [src], r15 [n])
   *   0xad2ce  r14 += r15                                ; new end = old end - 0x10 (element size)
   *   0xad2d1  *(this+0x58) = r14                        ; store new end
   *   0xad2d5  jmp 0xad2dd
   *   ── count>1 tail @0xad2d7:
   *   0xad2d7  --ecx ; mov [r14+0x8], ecx
   *   ── epilogue @0xad2dd:
   *   0xad2dd  tail-jmp std::mutex::unlock(this)
   */
  unlock_shared(): void {
    // @0xad267
    const self: bigint = _pthread_self_impl();
    // @0xad272
    std_mutex_lock_stub(this);

    // @0xad277..@0xad27e
    if (this._ownerTid === self) {
      // @0xad2ab: same-thread writer path — this call is decrementing
      //   the nested-write count that lock_shared bumped when called
      //   while already writer-owned.
      this._writerRecursion = (this._writerRecursion - 1) >>> 0;
      // @0xad2dd
      std_mutex_unlock_stub(this);
      return;
    }

    // @0xad280..@0xad2a9: scan for the reader entry matching `self`.
    //   Native's `rdx` bookkeeping (`rax - r14 - 0x14`) is the byte-
    //   count-from-the-post-hit-slot to the tail, minus one element's
    //   worth of back-pad; it's later reused @0xad2bd as `rdx + 0x4`
    //   which resolves to `end - (hit+0x10)` bytes = the number of
    //   bytes to memmove down when we erase the hit. In TS terms we
    //   just track the index and hand off to splice.
    for (let i = 0; i < this._readers.length; i++) {
      if (this._readers[i].tid === self) {
        // @0xad2b0..@0xad2b7
        if (this._readers[i].count === 1) {
          // @0xad2b9..@0xad2d1: erase this element.
          //   Native memmove-shifts [hit+0x10 .. end) down by 0x10
          //   bytes and decrements the stored end-pointer. If the hit
          //   is already the last element (hit+0x10 == end) the
          //   memmove is skipped. In TS this is a single splice.
          memmove_erase_reader(this._readers, i);
        } else {
          // @0xad2d7..@0xad2d9
          this._readers[i].count = (this._readers[i].count - 1) >>> 0;
        }
        break;
      }
      // @0xad29c: fall through to next element.
    }
    // @0xad2dd: whether we found+updated, found+erased, or missed
    //   entirely, the tail is a single unlock of the inner mutex.
    std_mutex_unlock_stub(this);
  }

  /**
   * `PCSharedMutex::~PCSharedMutex()` @Ozone 0x4d690
   * (__ZN13PCSharedMutexD1Ev — Itanium ABI D1, complete-object dtor).
   *
   * NOTE ON THE FRAMEWORK: this class's other members are transcribed from
   * ProCore (see the file header). The destructor is NOT emitted in ProCore at
   * all — `nm ProCore | grep PCSharedMutex` lists the ctors and the four
   * lock/unlock methods but no D0/D1/D2. Ozone carries the only copy, as a
   * LOCAL (`nm` lowercase `t`) inline-emitted weak definition at 0x4d690, which
   * is the symbol transcribed here. Same class, same header, different
   * translation unit — exactly like the @Ozone in-place transform in
   * raw-port/src/infra/PCMatrix44Tmpl.ts.
   *
   * Full transcription of the 17-line disasm
   * (raw-port/re/disasm/__ZN13PCSharedMutexD1Ev.s) — every instruction, in
   * order:
   *
   *   0x4d690  movq  0x50(%rdi),%rax   ; rax = readers.__begin_
   *   0x4d694  testq %rax,%rax
   *   0x4d697  je    <stub std::mutex::~mutex>  ; NEVER allocated -> just the
   *                                             ;   base dtor (tail-jmp, no frame)
   *   0x4d69d  pushq %rbp                       ; frame set up only on the
   *   0x4d69e  movq  %rsp,%rbp                  ;   deallocating path
   *   0x4d6a1  pushq %rbx
   *   0x4d6a2  pushq %rax
   *   0x4d6a3  movq  %rax,0x58(%rdi)   ; readers.__end_ = readers.__begin_
   *   0x4d6a7  movq  %rdi,%rbx         ; rbx = this
   *   0x4d6aa  movq  %rax,%rdi
   *   0x4d6ad  callq <stub __ZdlPv>    ; operator delete(readers.__begin_)
   *   0x4d6b2  movq  %rbx,%rdi         ; rdi = this
   *   0x4d6b5  addq  $0x8,%rsp
   *   0x4d6b9  popq  %rbx
   *   0x4d6ba  popq  %rbp
   *   0x4d6bb  jmp   <stub std::mutex::~mutex>  ; tail-jmp, this + 0x00
   *
   * DECODE NOTES
   *   * This is `std::vector<ReaderInfo>::~vector()` INLINED (libc++'s
   *     `__vdeallocate`: set `__end_ = __begin_`, then `operator delete` the
   *     block — ReaderInfo is trivially destructible, so no element loop is
   *     emitted) followed by the base/member `std::mutex` destructor. Both
   *     exits go through that same mutex dtor; the only difference is whether
   *     the storage block existed.
   *   * The `movq %rax,0x58(%rdi)` @0x4d6a3 writes `__end_` (+0x58) with
   *     `__begin_` (+0x50) BEFORE freeing — the "container is now empty" step —
   *     and `__begin_`/`__cap_` are deliberately left stale, which is why the
   *     port empties the array in place rather than replacing it.
   *   * WHERE THE `std::mutex` LIVES. The tail-jmp passes `this + 0x00`, not
   *     `this + 0x08`. That pins the mutex subobject at offset +0x00 — and the
   *     ctor's `0x32aaaba7` store at +0x00 (@ProCore 0xacee5, quoted in this
   *     file's header) is precisely Darwin's `_PTHREAD_MUTEX_SIG_init`
   *     signature word, i.e. the FIRST field of the `pthread_mutex_t` inside
   *     `std::mutex` — not a PCSharedMutex "magic" of its own. So the mutex
   *     occupies +0x00..+0x3f (64-byte Darwin `pthread_mutex_t`) and the ctor's
   *     `movups` sweep over +0x08..+0x38 is zeroing that struct's opaque tail,
   *     leaving +0x40 ownerTid, +0x48 writerRecursion and +0x50/+0x58/+0x60 the
   *     reader vector — every other offset in this file's header is unchanged.
   *     (Refinement of one line of the header note, from evidence this dtor
   *     supplies; nothing above is removed or renumbered.)
   *   * BOTH callees are TRUE out-of-scope externs (libc++ runtime):
   *     `operator delete(void*)` (`__ZdlPv`, Ozone stub 0x6dfc36) and
   *     `std::__1::mutex::~mutex()` (Ozone stub 0x6dfbe2). Neither is stubbed
   *     with a throw here, because in this port both are observably no-ops: JS
   *     arrays own their storage and are reclaimed by GC (the same treatment
   *     the landed FFAudioDuckingMasterRangeData.ts gives its `__ZdlPv` unwind
   *     path), and the destructor of an unlocked mutex releases an OS primitive
   *     this port never creates — consistent with `std_mutex_lock_stub` /
   *     `std_mutex_unlock_stub` above, which are already modelled as no-ops.
   *   * No in-scope callee, no indirect or virtual dispatch (`depgraph.py deps`
   *     lists nothing).
   */
  destroy(): void {
    // @0x4d690-0x4d697  movq 0x50(%rdi),%rax ; testq %rax,%rax ; je <mutex dtor>
    //   — `__begin_ == nullptr` is true only for a vector that NEVER allocated.
    //   This class's ctor calls `reserve(3)` (@ProCore 0xacf1e), so every
    //   constructed instance owns a block; and in TS `this._readers` IS that
    //   block and can never be null. The early-out therefore isn't reachable
    //   from a constructed object, and the port takes the deallocating path —
    //   which is also the only path with observable state changes.
    //
    // @0x4d6a3  movq %rax,0x58(%rdi) — __end_ = __begin_: the container is now
    //   empty (__begin_ and __cap_ are deliberately left stale, which is why
    //   the array is emptied IN PLACE rather than replaced).
    this._readers.length = 0;

    // @0x4d6ad  callq __ZdlPv — free the block. The elements and the block are
    //   one object graph in TS, and the line above drops the last reference to
    //   them, so GC performs the deallocation.

    // @0x4d6bb  jmp <std::mutex::~mutex> with rdi = this — destroys the mutex
    //   subobject at +0x00. Modelled as the no-op it is in this port (see the
    //   lock/unlock stubs); reached identically from both paths.
  }
}
