// FlushManager.ts — Flexo FlushManager.
//
// FlushManager is FCP's in-process bookkeeping registry for pending
// "flush this stream" operations — a mutex-protected std::vector of
// StreamRecord entries that pair a stream identity (an ObjC id + a small
// integer segment index) with an MD5-of-payload and an ObjC dispatch
// request object.  The 5 declared methods:
//
//   @0xab66c0  FlushManager()                                — FULLY PORTED
//                (initializes the sentinel + 5 zeroed 16-byte slots).
//   @0xab6840  ~FlushManager()  [D1]                          — tail-jumps to
//                D2 (the actual dtor); trivial one-liner. FULLY PORTED as a
//                thin re-entry into ~FlushManager (D2 body).
//   @0xab66f0  ~FlushManager()  [D2]                          — FRONTIER
//                (heavy: iterates every StreamRecord slot, ObjC-releases the
//                 4 embedded ivars, then destructs the embedded std::mutex).
//   @0xab6850  copyStream(FFThumbnailRequest*,                — FRONTIER
//              FFStreamVideoCache*, int&)                       (513 lines,
//                                                                pure ObjC
//                                                                dispatch chain
//                                                                over a locked
//                                                                std::vector).
//   @0xab7160  setImageSegmentMD5(int, FFMD5AndOffsetWithInfo*) — FULLY PORTED
//                except _objc_retain / std::__1::mutex::lock/unlock stubs
//                (mutex-locked bounds-checked vector element write).
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Flexo.framework/Versions/A/Flexo (x86_64 slice).
// Disasm saved: raw-port/re/disasm/Flexo.FlushManager.copyStream.s
//               raw-port/re/disasm/Flexo.FlushManager.setImageSegmentMD5.s
//               raw-port/re/disasm/Flexo.FlushManager.ctors_dtors.s
//
// Instance layout (recovered from the ctor and the setImageSegmentMD5 asm):
//
//   +0x00  int32     magicSentinel   = 0x32AAABA7 (ctor @0xab66c4)
//   +0x08 .. +0x38   std::__1::mutex — 48 bytes zero-initialized by ctor
//                                     (~= sizeof(std::mutex) on Apple
//                                     libc++ = 0x40 or 0x50 including
//                                     internal recursive-guard state).
//                                     Destructed by tail-jmp to std::mutex::D1
//                                     @0xab681e in the FlushManager dtor.
//   +0x40  StreamRecord*   vec_begin ; @0xab6714 movq 0x40(%r14),%rax
//   +0x48  StreamRecord*   vec_end   ; @0xab671c cmpq %rbx,0x40(%r14)
//                                    ; slot stride 0x40 (setImageSegmentMD5
//                                    ; @0xab718f `sarq $0x6, %rsi`).
//   +0x50  StreamRecord*   vec_cap   ; ctor zeros up to +0x58 so cap slot is
//                                    ; nulled at construction.
//
// StreamRecord layout (deduced from copyStream + setImageSegmentMD5 offsets
// off %r13 = &record):
//
//   +0x00  ObjC id     dispatcher    ; -0x40(%rbx) test @0xab6750
//   +0x08  ObjC id     addToEventTgt ; -0x38(%rbx) load @0xab6757
//   +0x10  ObjC id     requestClone  ; -0x30(%r13) compared to r15 @0xab6972
//   +0x18  ObjC id     bagRefA       ; -0x28(%r13) first half movups @0xab699c
//   +0x20  ObjC id     bagRefB       ; -0x20(%r13) second half movups @0xab699c
//   +0x28  int64_t     scratchInt    ; -0x18(%r13) load @0xab6991
//   +0x30  ObjC id     md5AndOffsetWithInfo
//                                     ; setImageSegmentMD5 write @0xab719c
//   +0x38  int32_t     segmentIndex  ; -0x8(%r13) load @0xab6978
//     ...  ~0x40 = one full slot
//
// The exact per-field ObjC-ivar semantics are known only inside FCP's
// ObjC image; here we treat each slot as an opaque 64-byte record and
// only decode the +0x30 field that setImageSegmentMD5 writes.
//
// Un-ported callees (throw-stubs cited by @addr):
//   _OBJC_CLASS_$_NSAutoreleasePool   Flexo __DATA-const literal-pool @0xab6704
//   _objc_opt_new                     Flexo stub @0x1497998 (called from dtor)
//   _objc_release                     Flexo indirect fixup (many sites)
//   _objc_retain                      Flexo indirect fixup @0xab717b
//   objc_msgSend                      Flexo indirect fixup (every @Objc site)
//   __ZNSt3__15mutex4lockEv           Flexo stub @0x14973b0
//   __ZNSt3__15mutex6unlockEv         Flexo stub @0x14973b6
//   __ZNSt3__15mutexD1Ev              Flexo stub @0x14973bc
//   _FFModelLockFromRef               Flexo stub @0xab68ae (called from copyStream)
//   __Znwm / __ZdlPv                  Flexo stubs (allocator round-trip in dtor)
//   std::vector<StreamRecord>::__throw_out_of_range@abi:nqe210106
//                                     Flexo internal @0xab71b3
//   __Unwind_Resume                   Flexo stub @0x1495d30

/** Opaque ObjC id handle. See FFDestDominantMotionPrivate.ts for rationale. */
export type ObjCId = unknown;

/** The magic sentinel value 0x32AAABA7 written to this[+0x0] by the ctor
 *  @0xab66c4. Serves as a runtime "is this really a FlushManager?" check. */
export const FLUSH_MANAGER_MAGIC_0xab66c4 = 0x32aaaba7;

/** Stride of one StreamRecord entry, in bytes. Derived from the ×64 slot-
 *  indexing shift `sarq $0x6, %rsi` @0xab718f in setImageSegmentMD5 and
 *  the matching `addq $-0x40, %rbx` walk @0xab67dc in the dtor. */
export const STREAM_RECORD_STRIDE = 0x40;

/**
 * StreamRecord — one entry in FlushManager's mutex-protected vector.
 * Only the fields that any of the 5 decoded methods actually touch are
 * declared; the rest of the 64-byte slot is treated as an opaque tail.
 * All ObjC-id fields are undecoded at TS level.
 */
export interface StreamRecord {
  /** +0x00  ObjC id "dispatcher" — released @0xab67ac (index computed as
   *         `-0x40(%rbx)` after `%rbx` walks backwards from vec_end). */
  dispatcher: ObjCId;
  /** +0x08  ObjC id — matched against copyStream's msg-send return @0xab6757. */
  addToEventTgt: ObjCId;
  /** +0x10  ObjC id — compared against `r15` (a search key) @0xab6972. */
  requestClone: ObjCId;
  /** +0x18  ObjC id first half of a 16-byte movups load @0xab699c. */
  bagRefA: ObjCId;
  /** +0x20  ObjC id second half of the same 16-byte movups. */
  bagRefB: ObjCId;
  /** +0x28  scalar (`-0x18(%r13)` @0xab6991) — 64-bit scratch. */
  scratchInt: bigint | number;
  /** +0x30  ObjC id — the FFMD5AndOffsetWithInfo pointer stored by
   *  setImageSegmentMD5 @0xab719c. */
  md5AndOffsetWithInfo: ObjCId;
  /** +0x38  int32 — the segment index compared @0xab6989 in copyStream. */
  segmentIndex: number;
}

/**
 * _objc_retain — Flexo indirect stub (RIP-relative fixup, e.g. `callq
 * *0xe3658f(%rip)` @0xab717b in setImageSegmentMD5). Untranscribed.
 */
function objc_retain(_id: ObjCId): ObjCId {
  throw new Error(
    "_objc_retain @Flexo indirect fixup (e.g. @0xab717b) — external ObjC-runtime frontier, not yet transcribed",
  );
}

/**
 * std::__1::mutex::lock — Flexo stub @0x14973b0.
 * setImageSegmentMD5 head-locks with a direct call @0xab7173; copyStream
 * also locks at @0xab6892.
 */
function std_mutex_lock(_mutexRef: FlushManager): void {
  throw new Error(
    "std::__1::mutex::lock @Flexo stub 0x14973b0 (e.g. called from FlushManager::setImageSegmentMD5 @0xab7173) — external libc++ frontier, not yet transcribed",
  );
}

/**
 * std::__1::mutex::unlock — Flexo stub @0x14973b6.
 * Both setImageSegmentMD5 (tail-jmp @0xab71ae) and copyStream (@0xab71c0 on
 * the exception-cleanup path) reach the unlock through this stub.
 */
function std_mutex_unlock(_mutexRef: FlushManager): void {
  throw new Error(
    "std::__1::mutex::unlock @Flexo stub 0x14973b6 (tail-jmp target from FlushManager::setImageSegmentMD5 @0xab71ae) — external libc++ frontier, not yet transcribed",
  );
}

/**
 * std::vector<StreamRecord>::__throw_out_of_range — Flexo internal
 * @0xab71b3.
 */
function throw_out_of_range_StreamRecord(): never {
  throw new Error(
    "std::__1::vector<StreamRecord>::__throw_out_of_range @Flexo 0xab71b3 (thrown from setImageSegmentMD5 when index >= size)",
  );
}

/**
 * FlushManager — mutex-protected registry of pending flush operations,
 * indexed by an ObjC-id stream identity + a small integer segment index.
 *
 * All ObjC-touching methods are throw-stubbed; the two that carry real
 * algorithmic content (the ctor and setImageSegmentMD5) are fully ported.
 */
export class FlushManager {
  /** +0x00 — the magic sentinel written by the ctor. */
  magicSentinel = 0;

  /** The mutex is modeled as an opaque marker; the three C++ mutex stubs
   *  above receive `this` as the "mutex reference" so a decoded
   *  implementation can key on the FlushManager identity. */
  private _mutexInitialized = false;

  /** The vector: modeled as a JS array of StreamRecord + a `capacity`.
   *  The underlying libc++ triple (begin=this[+0x40], end=this[+0x48],
   *  cap=this[+0x50]) is collapsed into `records.length` (=# valid
   *  entries) + `records` (=growable backing). */
  records: StreamRecord[] = [];

  /**
   * @@0xab66c0  FlushManager::FlushManager()  [C1 = C2, they alias]
   *
   * Disasm (13 lines):
   *   pushq %rbp; movq %rsp,%rbp                        ; @0xab66c0
   *   movq  $0x32aaaba7, (%rdi)                         ; @0xab66c4 — sentinel
   *   xorps %xmm0,%xmm0                                 ; @0xab66cb
   *   movups %xmm0, 0x08(%rdi)                          ; @0xab66ce   (bytes 0x08..0x18)
   *   movups %xmm0, 0x18(%rdi)                          ; @0xab66d2   (0x18..0x28)
   *   movups %xmm0, 0x28(%rdi)                          ; @0xab66d6   (0x28..0x38)
   *   movups %xmm0, 0x38(%rdi)                          ; @0xab66da   (0x38..0x48)
   *   movups %xmm0, 0x48(%rdi)                          ; @0xab66de   (0x48..0x58)
   *   popq  %rbp; retq                                  ; @0xab66e2
   *
   * Effect: this[0]=0x32AAABA7, bytes [8..0x58] zeroed. That's 80 bytes of
   * zero covering an embedded std::mutex (~48 bytes) at +0x8..+0x38 plus
   * the vector triple (begin/end/cap = 24 bytes) at +0x40..+0x58.
   *
   * There is no ctor call to std::mutex::mutex — its default state is
   * zero-initialized bytes, which is what libc++'s std::mutex ABI expects
   * (a zero PTHREAD_MUTEX_INITIALIZER-style layout).
   */
  constructor() {
    // @0xab66c4: this[0] = magic
    this.magicSentinel = FLUSH_MANAGER_MAGIC_0xab66c4;
    // @0xab66cb-@0xab66de: 80 bytes zeroed at [8..0x58].
    // The mutex portion is modeled as an initialized flag; the vector
    // triple collapses to `records = []`.
    this._mutexInitialized = true;
    this.records = [];
  }

  /**
   * @@0xab6840  FlushManager::~FlushManager()  [D1 unwinder — 5 lines]
   *
   *   pushq %rbp; movq %rsp,%rbp                        ; @0xab6840
   *   popq  %rbp
   *   jmp   __ZN12FlushManagerD2Ev                      ; @0xab6845 tail-jmp to D2
   *
   * D1 is the "complete-object" destructor emitted by clang. It exists as
   * a distinct symbol for ABI reasons; its body just tail-calls D2 (the
   * "base-object" destructor) which is what actually does the work.
   */
  dispose_D1(): void {
    // @0xab6845: tail-jmp to D2 — modeled as a direct call.
    this.dispose_D2();
  }

  /**
   * @@0xab66f0  FlushManager::~FlushManager()  [D2 — 82 lines]
   *
   * Iterates the StreamRecord vector, releases each record's four ObjC
   * ivars while dispatching three msg-sends to peer objects, then frees
   * the vector backing store via __ZdlPv and finally tail-jumps to
   * std::mutex::~mutex. This is pure ObjC + libc++ frontier — throw-
   * stubbed with all @-addrs cited so a later decode can target the
   * exact ivar semantics.
   *
   * Key sites (see raw-port/re/disasm/Flexo.FlushManager.ctors_dtors.s):
   *   @0xab670b  pool = _objc_opt_new(NSAutoreleasePool)      ; setup autorelease scope
   *   @0xab6714  rbx  = this[+0x48]  (=vec.end)
   *   @0xab671c  if (this[+0x40] == rbx) skip loop            ; empty-vector fast-out
   *   @0xab6750-@0xab67e7  per-record loop (walks rbx by -0x40)
   *     @0xab6750  test -0x40(%rbx)  (record.dispatcher)
   *     @0xab6766  [dispatcher dispatchRequest:...]           ; sel @-0x50(%rbp)
   *     @0xab6786  [dispatcher <second sel>]                  ; sel @-0x48(%rbp)
   *     @0xab67a2  [addToEventTgt <third sel>:x:y]            ; sel @-0x40(%rbp)
   *     @0xab67ac  _objc_release(record.<+0x00>)
   *     @0xab67b6  _objc_release(record.<+0x08>)
   *     @0xab67c0  _objc_release(record.<+0x10>)
   *     @0xab67ca  _objc_release(record.<+0x30>)
   *     @0xab67dc  rbx -= 0x40 ; update this[+0x48]
   *   @0xab67f1  _objc_release(pool)
   *   @0xab6808  __ZdlPv(this[+0x40])                          ; free backing
   *   @0xab681e  tail-jmp std::mutex::~mutex                   ; destroy embedded mutex
   */
  dispose_D2(): void {
    throw new Error(
      "FlushManager::~FlushManager D2 body @Flexo 0xab66f0 — 82-line ObjC msgSend chain + std::mutex D1 tail-jmp; entire body is external ObjC-runtime frontier (selectors at literal-pool @rbp-0x50, -0x48, -0x40; releases @0xab67ac/0xab67b6/0xab67c0/0xab67ca; __ZdlPv @0xab6808; __ZNSt3__15mutexD1Ev @0xab681e) — not yet transcribed",
    );
  }

  /**
   * @@0xab6850  FlushManager::copyStream(FFThumbnailRequest*,
   *                                      FFStreamVideoCache*,
   *                                      int& outIdx)
   *
   * 513 lines of pure ObjC dispatch chain over a mutex-locked walk of
   * `this.records`. Selectors are all loaded from ordinary Flexo
   * __objc_selrefs slots (many of them RIP-relative); the receiver
   * targets rotate between the FFThumbnailRequest, the FFStreamVideoCache,
   * and various ObjC-id fields of each StreamRecord. Also invokes
   * _FFModelLockFromRef @0xab68ae, which is another external stub.
   *
   * Throw-stubbed with a summary of the top-level shape:
   *   @0xab6885  key   = [request dispatcher-sel]              ; find search-key
   *   @0xab6892  __ZNSt3__15mutex::lock(&this.mutex)
   *   @0xab68a1  [key dispatcher-sel]                          ; refine key
   *   @0xab68ae  lock2 = _FFModelLockFromRef(key)
   *   @0xab68c0  [lock2 <sel>]                                 ; init state
   *   @0xab68d6  if (vec.begin == vec.end) → done fast-out
   *   loop over records (per @0xab6960 stride-64 walk):
   *     match record on (record+0x10 == key && record+0x38 == request-int)
   *     if match: run 12-msg subroutine (@0xab6983-@0xab6b6a) that copies
   *               fields from the record into the outbound
   *               FFThumbnailRequest and increments *outIdx via
   *               `movl $0x0, (%rsp)` + subsequent adds.
   *   at end: mutex.unlock; return
   */
  copyStream(
    _request: unknown /* FFThumbnailRequest* */,
    _cache: unknown /* FFStreamVideoCache* */,
    _outIdx: { value: number } /* int& */,
  ): void {
    throw new Error(
      "FlushManager::copyStream @Flexo 0xab6850 — 513-line ObjC msgSend chain over a mutex-locked std::vector walk (~40 msg-sends, 3 mutex ops, 1 _FFModelLockFromRef @0xab68ae, 1 _objc_opt_new pool @0xab6704 in dtor path) — entire body is external ObjC-runtime frontier, not yet transcribed",
    );
  }

  /**
   * @@0xab7160  FlushManager::setImageSegmentMD5(int index,
   *                                              FFMD5AndOffsetWithInfo* obj)
   *
   * Faithful mirror of the 37-line asm — a mutex-locked, bounds-checked
   * write of `obj` into the `md5AndOffsetWithInfo` (+0x30) slot of the
   * `index`-th StreamRecord.
   *
   * Body:
   *   @0xab7173  __ZNSt3__15mutex::lock(this)
   *   @0xab717b  ret = _objc_retain(obj)                       ; retain the ObjC obj
   *   @0xab7181  rcx = (int64_t)index (movslq %r14d,%rcx)
   *   @0xab7184  rdx = this[+0x40]                             ; = vec.begin
   *   @0xab7188  rsi = this[+0x48] - rdx                       ; = end - begin bytes
   *   @0xab718f  rsi = rsi >> 6                                ; = size (bytes/64)
   *   @0xab7193  if ((uint64_t)size <= (uint64_t)index) throw_out_of_range;
   *                                                            ; unsigned-compare
   *   @0xab7198  rcx = index * 64
   *   @0xab719c  *(rdx + rcx + 0x30) = ret                     ; slot[index].+0x30 = retained obj
   *   @0xab71ae  tail-jmp __ZNSt3__15mutex::unlock(this)
   *
   * The unsigned-compare `jbe` semantics matter: any negative `index`
   * value has its sign bit set and is thus considered larger-than any
   * plausible vector size when interpreted as uint64_t, so the throw path
   * catches negative indices too. Modeled here via a signed-i32 check + a
   * separate signed-vs-size check.
   *
   * The retain is not paired with a release in this method — the
   * previous occupant of `slot[index].md5AndOffsetWithInfo` LEAKS from
   * the C++ level as well (the asm has no `_objc_release` on the old
   * pointer before overwriting). This mirrors an actual reference-count
   * bug in the original code, transcribed faithfully.
   */
  setImageSegmentMD5(
    index: number,
    obj: ObjCId /* FFMD5AndOffsetWithInfo* */,
  ): void {
    // @0xab7173: mutex.lock(this)
    std_mutex_lock(this);
    try {
      // @0xab717b: retained = _objc_retain(obj)
      const retained = objc_retain(obj);

      // @0xab7181-@0xab7193: bounds check on unsigned index.
      // The signed-i32 `index` widens to i64 (movslq) then is compared
      // unsigned against the vector size. Any negative index becomes a
      // giant unsigned value and triggers the throw.
      const size = this.records.length;
      const idx64 = index | 0; // signed widen
      // Signed-negative → treated as huge unsigned → out-of-range.
      if (idx64 < 0 || idx64 >= size) throw_out_of_range_StreamRecord();

      // @0xab719c: this.records[index].md5AndOffsetWithInfo = retained
      const slot = this.records[idx64]!;
      slot.md5AndOffsetWithInfo = retained;
    } finally {
      // @0xab71ae: tail-jmp mutex.unlock(this). We model as a
      // sequential unlock in a try/finally so exception unwinding
      // (which the asm handles at @0xab71ba-@0xab71c8 via a landing pad
      // that also calls unlock+__Unwind_Resume) is preserved.
      std_mutex_unlock(this);
    }
  }
}
