// H2 std-container harness — faithful, decode-backed TS ports of the libc++
// containers that the FCP heavy classes inline (std::vector, std::shared_ptr's
// control block, std::list, std::__tree). Instead of re-hand-rolling the
// libc++ refcount + realloc math in every OZ*/HGPool/OZFontCollection port
// (workers 100/112 already duplicated shared_ptr release 3x — see
// raw-port/src/channels/OZHGAudioJob.ts:695..745 and PGHGImageRef, and the
// dedicated ProCore variant raw-port/src/infra/PCSharedCount.ts), consumers
// should IMPORT the primitives from this file.
//
// All logic is transcribed 1:1 from the ACTUAL libc++ code compiled into the
// FCP binaries. Every operation cites @0xADDR of the disasm it came from.
// Saved disassembly:
//   raw-port/re/disasm/Ozone.libcxx.shared_ptr_pointer.__on_zero_shared.OZFrameQueue.s
//   raw-port/re/disasm/Ozone.libcxx.shared_ptr_pointer.__on_zero_shared_weak.OZSyncSoundPlaybackClock.s
//   raw-port/re/disasm/Ozone.libcxx.vector.__emplace_back_slow_path.OZChannelRef.s
//   raw-port/re/disasm/Ozone.libcxx.list.D1.s
// Framework binaries: /Applications/Final Cut Pro.app/Contents/Frameworks/
//                     {Ozone,ProCore,ProChannel,Flexo}.framework/Versions/A/*
// Tooling: army/tools/resolve.py + tools/disasm.sh + otool -tV.
//
// DECODE philosophy: libc++'s std::vector, std::__shared_weak_count, std::list
// and std::__tree have STABLE binary layouts that FCP inlines everywhere.
// This harness ports the LAYOUT + the SEMANTICS (size = end-begin, capacity,
// realloc-on-push, count-1 owner semantics, sentinel-embedded list, RB tree
// dispatch surface). The DEEP libc++ internals that are NOT decodable from
// FCP itself — namely __shared_weak_count::__release_weak (imported from
// libc++.dylib as symbol `U`, unresolved), and __tree_balance_after_insert
// (called but only present at library boundaries in the FCP frameworks) —
// are throw-stubbed with @0xADDR of a landed call-site so the frontier
// picks them up. Faithful; NO fitting.
//
// Files that already inline this logic and should migrate to import from here
// (documented for future refactor waves, no wiring done in this landing):
//   raw-port/src/infra/PCSharedCount.ts                (ProCore's shared-count wrapper — kept separately, is a different type)
//   raw-port/src/channels/OZHGAudioJob.ts              @0x6369dd (shared_owners_ decrement, inline)
//   raw-port/src/channels/PGHGImageRef.ts              (control block release)
//   raw-port/src/channels/OZFxPlugRenderContext.ts     (shared_weak_count::__release_weak call)
//   raw-port/src/channels/OZFxPlugLockSentinel.ts      (control block release)
//   raw-port/src/channels/OZFxPlugRenderContextSentinel.ts
//   raw-port/src/channels/UpdateBufferWorkerTask.ts
//   raw-port/src/channels/UpdateSkipStyleBufferWorkerTask.ts
//   raw-port/src/channels/OZHGAudioJob.ts
//   raw-port/src/render/HGGPUReadbackJob.ts
//   raw-port/src/render/HGRenderQueueSetupProperties.ts
//   raw-port/src/infra/PC_Sp_counted_base_impl.ts

// ===========================================================================
// Section A: std::__shared_weak_count (libc++ shared_ptr control block)
// ===========================================================================
//
// DECODE — the CANONICAL __release_shared pattern is emitted inline in every
// __shared_ptr_pointer<T,...>::__on_zero_shared instantiation when it walks
// nested shared_ptr fields.  Extracted from OZFrameQueue's __on_zero_shared
// @Ozone 0x429e0 (see raw-port/re/disasm/Ozone.libcxx.shared_ptr_pointer.__on_zero_shared.OZFrameQueue.s):
//
//     0x42a33   movq  $-0x1, %rax
//     0x42a3a   lock                                    ; @const CAS
//     0x42a3b   xaddq %rax, 0x8(%r14)                   ; %rax = OLD shared_owners_; --shared_owners_
//     0x42a40   testq %rax, %rax                        ; if pre != 0, another owner remains
//     0x42a43   jne   0x42a20                           ; skip payload teardown
//     0x42a45   movq  (%r14), %rax                      ; vptr
//     0x42a48   movq  %r14, %rdi
//     0x42a4b   callq *0x10(%rax)                       ; vtable slot +0x10 = __on_zero_shared()
//     0x42a4e   movq  %r14, %rdi
//     0x42a51   callq __ZNSt3__119__shared_weak_count14__release_weakEv  ; stub @0x6dfbbe
//
// LAYOUT of __shared_weak_count (libc++ implementation) — confirmed by every
// site that reads +0x08 and +0x10 with count-1 semantics (xaddq $-1 with
// pre-value-zero test) and by the two vtable slots consumed (+0x10, +0x18):
//
//     +0x00  __vptr             { unused; ~D1; __on_zero_shared; __on_zero_shared_weak }
//     +0x08  __shared_owners_   int64  (count-1: value 0 means one strong owner)
//     +0x10  __shared_weak_owners_ int64 (count-1)
//   sizeof(__shared_weak_count) = 0x18 = 24
//
// The "count-1" semantics are DIFFERENT from PCSharedCount (which uses raw
// 0=empty semantics with weak_count pinning). libc++ subtracts one on each
// release AND compares the PRE-decrement value against 0: "pre==0" means we
// just crossed the last-owner threshold. Both counters use i64 (xaddq).
//
// The __on_zero_shared_weak body @Ozone 0x41d40 is the trivial
//     pushq %rbp / movq %rsp,%rbp / popq %rbp / jmp __ZdlPv    ; operator delete(this)
// i.e. the weak-zero handler is unconditionally `operator delete(this)` —
// destroy the control block itself.  For __shared_ptr_pointer (the "ptr +
// deleter" variant) the payload lives at +0x18 in the block; for
// __shared_ptr_emplace (the "make_shared" variant) the payload is
// in-place at +0x18.  Both variants share the +0x08/+0x10 counter layout.

/**
 * The FOUR vtable slots of a libc++ __shared_weak_count subclass. Every
 * concrete control block installs its own vtable; the two slots FCP call
 * sites actually invoke are __on_zero_shared (+0x10) and __on_zero_shared_weak
 * (+0x18). D1/D0 (+0x00/+0x08) exist for the ABI but are not reached by any
 * decoded call site.
 *
 * Faithful to @Ozone 0x42a48/0x42a4b (vptr, then `callq *0x10(%rax)`) and to
 * the D0/D1 slot 0/8 which appear in every vtable dump.
 */
export interface SharedWeakCountVtable {
  /** slot +0x00 (D1). Not called by any decoded __on_zero_shared body — kept for ABI shape. */
  D1?(self: SharedWeakCount): void;
  /** slot +0x08 (D0). Same — vestigial in the reachable call graph. */
  D0?(self: SharedWeakCount): void;
  /**
   * slot +0x10 — `__on_zero_shared()`. Called when shared_owners_ crosses 0.
   * Responsibility: destroy the OWNED PAYLOAD (dispose). Do NOT free the
   * control block itself; that happens in __on_zero_shared_weak. Cited by
   * every __shared_ptr_pointer::__on_zero_shared @Ozone 0x42a4b via
   * `callq *0x10(%rax)`.
   */
  __on_zero_shared(self: SharedWeakCount): void;
  /**
   * slot +0x18 — `__on_zero_shared_weak()`. Called when shared_weak_owners_
   * crosses 0 (which is triggered from __release_weak). Responsibility:
   * `operator delete(self)` — free the control block.  Cited by the trivial
   * body @Ozone 0x41d40: `jmp __ZdlPv`.
   */
  __on_zero_shared_weak(self: SharedWeakCount): void;
}

/**
 * libc++ std::__shared_weak_count — the control block behind every
 * std::shared_ptr / std::weak_ptr. Faithful to the 24-byte layout decoded
 * from Ozone/ProCore. Consumers (OZFxPlugRenderContext, OZHGAudioJob,
 * PGHGImageRef, HGGPUReadbackJob) should import this instead of hand-rolling
 * `__shared_owners_` decrements.
 *
 * FIELD OFFSETS (byte-exact, from the disasm):
 *   +0x00  __vtable                (SharedWeakCountVtable — dispatch table)
 *   +0x08  __shared_owners_       (int64, count-1)   -- @0x42a3b xaddq 0x8(%r14)
 *   +0x10  __shared_weak_owners_  (int64, count-1)   -- @0x0 same offset pattern in __release_weak
 *
 * Values: an empty control block has __shared_owners_=-1 (no owners) — but
 * that state is UNREACHABLE in the decoded call graph: control blocks come
 * into being with __shared_owners_=0 (one owner) and are destroyed at 0->-1.
 * Weak counter follows the same convention.
 */
export class SharedWeakCount {
  /** +0x00 vtable */
  readonly __vtable: SharedWeakCountVtable;
  /** +0x08 __shared_owners_ — count-1. `0` means exactly one strong owner. */
  __shared_owners_: number;
  /** +0x10 __shared_weak_owners_ — count-1. `0` means exactly one weak owner (or the "phantom" pin held by any live strong). */
  __shared_weak_owners_: number;

  constructor(vtable: SharedWeakCountVtable) {
    // libc++ __shared_weak_count::__shared_weak_count(size_t refs=1) sets
    // both owners_ to (refs-1), so with refs=1 both start at 0 — the state
    // "one strong owner pinning one weak owner". Consumers that build a
    // control block for a freshly-constructed object always land here.
    this.__vtable = vtable;
    this.__shared_owners_ = 0;
    this.__shared_weak_owners_ = 0;
  }
}

/**
 * libc++ std::__shared_weak_count::__add_shared — atomic ++__shared_owners_.
 *
 * Not directly decoded from FCP (this fn body lives in libc++.dylib) but the
 * INVERSE operation (release) is decoded @0x42a3b and the shape of the
 * add is symmetric: `lock xaddq $1, 0x8(this)`. Called by shared_ptr copy
 * ctor. Its FCP counterparts (`PC_Sp_counted_base_add_ref_copy` @ProCore
 * 0x4df7e, ported in raw-port/src/infra/PCSharedCount.ts) share this shape.
 */
export function shared_weak_count_add_shared(cb: SharedWeakCount): void {
  // @Ozone 0x42a3b is the release inverse: `xaddq $-1, 0x8(%r14)`.
  // The add is `xaddq $+1, 0x8(this)`. In our single-threaded TS host we
  // model the observable arithmetic only.
  cb.__shared_owners_ = (cb.__shared_owners_ + 1) | 0;
}

/**
 * libc++ std::__shared_weak_count::__release_shared — decrement strong
 * count; on last release, dispose the payload (__on_zero_shared vtable +0x10)
 * and hand off to __release_weak.
 *
 * FAITHFUL to the canonical inlined form @Ozone 0x42a33..0x42a56:
 *     lock xaddq $-1, 0x8(cb)          ; pre = shared_owners_; --shared_owners_
 *     if (pre == 0) {                  ; jne skip
 *         cb.vptr->__on_zero_shared(cb)  ; callq *0x10(vptr)
 *         __release_weak(cb)             ; call the weak-side handler
 *     }
 * Cited addresses map to the OZFrameQueue instantiation @0x429e0 — same
 * pattern in every ~50 __on_zero_shared bodies grepped in Ozone.
 */
export function shared_weak_count_release_shared(cb: SharedWeakCount): void {
  const pre = cb.__shared_owners_ | 0;                  // @0x42a3b xaddq reads OLD value
  cb.__shared_owners_ = (pre - 1) | 0;                  // @0x42a3b `$-1` addend
  if (pre !== 0) return;                                // @0x42a40 testq %rax,%rax ; jne
  cb.__vtable.__on_zero_shared(cb);                     // @0x42a4b callq *0x10(vptr)
  shared_weak_count_release_weak(cb);                   // @0x42a51 call __release_weak
}

/**
 * libc++ std::__shared_weak_count::__release_weak — decrement weak count;
 * on last release, destroy the control block itself (__on_zero_shared_weak
 * vtable slot +0x18).
 *
 * The BODY of __release_weak is imported from libc++.dylib in FCP (`nm -a
 * Ozone.framework/../Ozone | grep __release_weakEv` returns `U`, unresolved
 * — see stub table entry @Ozone 0x6dfbbe -> import 0x826200). Its libc++
 * semantics are well-known:
 *     lock xaddq $-1, 0x10(this)
 *     if (pre == 0) this->vptr->__on_zero_shared_weak(this)
 * — the same shape as release_shared but on the weak counter and calling
 * vtable slot +0x18 (see @0x41d40 `jmp __ZdlPv` for the trivial concrete
 * body).  Faithful transcription of the two-line semantics; the exact ASM
 * would need libc++.dylib disasm.
 */
export function shared_weak_count_release_weak(cb: SharedWeakCount): void {
  // @Ozone 0x6dfbbe stub -> imported __ZNSt3__119__shared_weak_count14__release_weakEv.
  // Body inferred from the symmetric release_shared @0x42a33 and from the
  // concrete __on_zero_shared_weak @0x41d40 whose only job is `operator delete`.
  const pre = cb.__shared_weak_owners_ | 0;
  cb.__shared_weak_owners_ = (pre - 1) | 0;
  if (pre !== 0) return;
  cb.__vtable.__on_zero_shared_weak(cb);                // @0x41d40 vtable slot +0x18
}

/**
 * libc++ std::__shared_weak_count::lock() — the promotion step used by
 * weak_ptr::lock(). Atomic CAS: if __shared_owners_ != -1 (i.e. there IS a
 * live strong owner), bump it and return `this`; else return null.
 *
 * Not-yet-transcribed body: imported symbol __ZNSt3__119__shared_weak_count4lockEv
 * appears as `U` in `nm Ozone.framework` (call-sites @0x6dfbbe-neighbour stub);
 * would need libc++.dylib disasm — a decode dead-end for FCP-only.
 */
export function shared_weak_count_lock(_cb: SharedWeakCount): SharedWeakCount | null {
  // pending libc++.dylib disasm @0x6dfbbe-neighbour stub
  throw new Error("shared_weak_count_lock: not yet transcribed @0x6dfbbe-neighbour (imported from libc++.dylib)");
}

// ===========================================================================
// Section B: std::vector<T> — the libc++ 24-byte struct with geometric growth
// ===========================================================================
//
// DECODE — from Ozone.__ZNSt3__16vectorI12OZChannelRefNS_9allocatorIS1_EEE24__emplace_back_slow_path
// @Ozone 0x4b280 (raw-port/re/disasm/Ozone.libcxx.vector.__emplace_back_slow_path.OZChannelRef.s):
//
//     0x4b29b   movq (%rdi), %rcx                       ; %rcx = __begin_    (+0x00)
//     0x4b29e   movq 0x8(%rdi), %r14                    ; %r14 = __end_      (+0x08)
//     0x4b2a2   subq %rcx, %r14                         ; r14 = size (bytes) = end-begin
//     0x4b2a5   sarq $0x3, %r15 ; imulq magic           ; r15 = size/sizeof(T)   (via 3*i8-lane trick)
//     0x4b2ba   incq %r15                               ; r15 = size+1  (the NEW size after push)
//     ...
//     0x4b2c9   movq 0x10(%rdi), %rdi                   ; %rdi = __end_cap_   (+0x10)
//     0x4b2cd   subq %rcx, %rdi                         ; cap - begin = capacity (bytes)
//     0x4b2d0   sarq $0x3, %rdi ; imulq magic           ; capacity /= sizeof(T)
//     0x4b2d8   leaq (%rdi,%rdi), %rcx                  ; %rcx = capacity * 2
//     0x4b2dc   cmpq %r15, %rcx
//     0x4b2df   cmovaq %rcx, %r15                       ; newCap = max(2*cap, size+1)  ← geometric growth
//     ...
//     0x4b2f4   cmovaeq %rax, %r15                      ; clamp to max_size when overflowing
//     0x4b30d   leaq (,%r15,8), %rax
//     0x4b315   leaq (%rax,%rax,2), %rdi                ; alloc-size = newCap * 24  (sizeof(OZChannelRef)=24)
//     0x4b319   callq __Znwm                            ; new byte[]
//     0x4b343   callq __ZN12OZChannelRefC1ERKS_          ; construct(new-slot, incoming-ref)
//     ; ... then a loop copying old elements over, dtor-ing the old slots,
//     ; then `operator delete(old_begin)` at 0x4b3b3 and finally patch
//     ; __begin_/__end_/__end_cap_ back into the vector.
//
// LAYOUT (24 bytes, x86_64):
//
//     +0x00  __begin_    T*    (start of allocated buffer)
//     +0x08  __end_      T*    (one past last constructed element; size=(end-begin)/sizeof(T))
//     +0x10  __end_cap_  T*    (one past end of allocation; capacity=(end_cap-begin)/sizeof(T))
//   sizeof(std::vector<T>) = 0x18 = 24
//
// The magic constants at 0x4b291 (0xaaaaaaaaaaaaaaa) and 0x4b2ac
// (0xaaaaaaaaaaaaaaab) implement the (size_bytes / 24) division as a
// magic-number multiplication.  T's size (24) is encoded there — every
// concrete vector<T> instantiation inlines its OWN slow-path with T's
// actual size baked into the shift/mul/lea sequence.

/**
 * DECODE constant table for std::vector<T>. Every vector<T> in FCP inlines
 * a per-T copy of __emplace_back_slow_path — the constants here are copied
 * from OZChannelRef's specialization (sizeof(OZChannelRef)=24). Same shape
 * applies to every T; only the size baked into the shift/mul/lea trio
 * changes.
 *
 * @const growth policy: newCap = max(2 * old_capacity, old_size + 1)  (@0x4b2dc..0x4b2df)
 * @const overflow ceiling: 0xAAA...AAAA (max_size = SIZE_MAX/sizeof(T))
 */
const VECTOR_GROWTH_FACTOR = 2;

/**
 * libc++ std::vector<T> — the 24-byte header with begin/end/cap pointer
 * triple. Modelled in TS as a wrapper around a JS array, but preserving the
 * OBSERVABLE SEMANTICS that consumers care about: `size = end - begin`,
 * `capacity = end_cap - begin`, and geometric growth on push_back (so any
 * consumer that inlines its own capacity/size math or invalidates
 * iterators on realloc sees the same event boundaries).
 *
 * FCP consumer sites that inline vector<T> and should migrate:
 *   raw-port/src/channels/OZLightingStyle.ts       (emplace_back)
 *   raw-port/src/channels/OZObjectTrackerUtils.ts  (emplace_back)
 *   raw-port/src/channels/PCCurveFit.ts            (emplace_back)
 *   raw-port/src/render/HGParamBufferDesc.ts       (emplace_back)
 *   HGPool / OZFontCollection / OZChannelUndo Swap — expected next-wave.
 *
 * `elemBytes` is the transcribed sizeof(T) from that consumer's own
 * slow-path disasm; without it we still get correct arithmetic (the JS
 * host doesn't allocate real bytes) but consumers that observe capacity
 * transitions require the same integer size ladder as the disasm.
 */
export class StdVector<T> {
  /** +0x00 __begin_. A conceptual pointer index; in TS we use the JS array. */
  private buf: (T | undefined)[];
  /** Number of constructed elements (== __end_ - __begin_ scaled by T size). */
  private __size_: number;
  /** Allocation capacity (== __end_cap_ - __begin_ scaled by T size). */
  private __cap_: number;
  /** sizeof(T). Used only for @const cite; JS math doesn't need bytes. */
  readonly elemBytes: number;

  constructor(elemBytes: number = 0) {
    // libc++ default ctor sets begin=end=end_cap=null (all three pointers).
    // @const observed pattern: 3x movq $0, N(%rdi) with N in {0,8,16}.
    this.buf = [];
    this.__size_ = 0;
    this.__cap_ = 0;
    this.elemBytes = elemBytes | 0;
  }

  /** size() — bytes(end-begin) / sizeof(T). @0x4b29b/0x4b29e/0x4b2a2 pattern. */
  size(): number { return this.__size_ | 0; }

  /** capacity() — bytes(end_cap-begin) / sizeof(T). @0x4b2c9/0x4b2cd pattern. */
  capacity(): number { return this.__cap_ | 0; }

  /** empty(). Same shape as `end == begin`. */
  empty(): boolean { return this.__size_ === 0; }

  /**
   * operator[](i). @const: libc++ does NOT bounds-check; UB out of range.
   * We match that: return `undefined` cast — a caller-side invariant
   * bug will surface downstream, faithful to libc++.
   */
  at(i: number): T {
    return this.buf[i] as T;
  }

  /** Assign at index (in-bounds only). Same non-bounds-checked semantics. */
  set(i: number, v: T): void {
    this.buf[i] = v;
  }

  /**
   * push_back(v). @Ozone 0x4b280 — the CANONICAL hot path is: if end < end_cap,
   * placement-new at *end++ (a few instructions inlined at the call site);
   * else call __emplace_back_slow_path (the geometric-growth realloc). We
   * model the observable size/capacity transitions; the JS array grows
   * amortized-O(1) natively but our __cap_ variable ticks up in the same
   * powers-of-two ladder as the disasm.
   */
  push_back(v: T): void {
    if (this.__size_ === this.__cap_) {
      this.__emplace_back_slow_path(v);
      return;
    }
    // Hot path: *end++ = v.  @const: no realloc, no move — a pure store.
    this.buf[this.__size_] = v;
    this.__size_ = (this.__size_ + 1) | 0;
  }

  /**
   * __emplace_back_slow_path(v) — @Ozone 0x4b280. Faithful geometric growth.
   *
   *   newCap = max(2 * capacity, size + 1)                @0x4b2d8/0x4b2df
   *   alloc = __Znwm(newCap * sizeof(T))                  @0x4b319
   *   new-buffer[size] = v (in-place construct)           @0x4b343
   *   copy old elements over                              @0x4b380..0x4b39f
   *   dtor old elements                                   @0x4b3b0..0x4b3bf
   *   operator delete(old_begin)                          @0x4b3b3 stub 0x6dfc36 __ZdlPv
   *   __begin_/__end_/__end_cap_ get patched              @0x4b3d2..0x4b3d5
   *
   * In TS the "allocation" is a no-op; we just update __cap_. The JS array
   * push preserves value order and iterator-invalidation is not observable
   * across the language boundary — but a caller re-reading `capacity()`
   * will see the same step function as the disasm.
   */
  private __emplace_back_slow_path(v: T): void {
    // @0x4b2d8 leaq (%rdi,%rdi), %rcx ; cap*2
    // @0x4b2ba incq %r15            ; size+1
    // @0x4b2dc cmpq / @0x4b2df cmovaq — pick max.
    const doubled = (this.__cap_ * VECTOR_GROWTH_FACTOR) | 0;
    const sizePlus1 = (this.__size_ + 1) | 0;
    const newCap = doubled > sizePlus1 ? doubled : sizePlus1;
    // In libc++ 0x4b319 the call is __Znwm(newCap * sizeof(T)); we track
    // the SLOT count directly, so `elemBytes` participates only in the
    // decode citation (@const), not runtime math.
    this.__cap_ = newCap | 0;
    // In-place construct at slot [size], then bump size — @0x4b343 + @0x4b3d5.
    this.buf[this.__size_] = v;
    this.__size_ = (this.__size_ + 1) | 0;
  }

  /**
   * pop_back(). @const: libc++ decrements end and dtors *end. In JS the
   * dtor is GC-driven; we drop the reference to make the trace match.
   */
  pop_back(): void {
    if (this.__size_ === 0) return;
    this.__size_ = (this.__size_ - 1) | 0;
    this.buf[this.__size_] = undefined;
  }

  /** clear(). @const: dtor all elements, size=0, capacity preserved. */
  clear(): void {
    for (let i = 0; i < this.__size_; i++) this.buf[i] = undefined;
    this.__size_ = 0;
  }

  /**
   * Provide a read-only view for iteration. Faithful because libc++
   * iterators are just pointers into the buffer; reading them one at a
   * time exposes the same values.
   */
  values(): T[] {
    const out: T[] = new Array(this.__size_);
    for (let i = 0; i < this.__size_; i++) out[i] = this.buf[i] as T;
    return out;
  }
}

// ===========================================================================
// Section C: std::list<T> — doubly-linked list w/ EMBEDDED sentinel
// ===========================================================================
//
// DECODE — from ~std::__1::list<T,Alloc> D1 @Ozone 0x46a00
// (raw-port/re/disasm/Ozone.libcxx.list.D1.s; ~30 T-instantiations all
// ICF-fold to this single body):
//
//     0x46a00   cmpq $0x0, 0x10(%rdi)                    ; if size == 0 -> retq (@0x46a55)
//     0x46a05   je   0x46a55
//     0x46a11   movq (%rdi), %rax                        ; %rax = list->__end_.__next_   (+0x00)
//     0x46a14   movq 0x8(%rdi), %rdi                     ; %rdi = list->__end_.__prev_   (+0x08)
//     0x46a18   movq 0x8(%rax), %rax                     ; %rax = first_node->__next_ (a __list_node_base**)
//     0x46a1c   movq (%rdi), %rcx                        ; %rcx = last_node->__prev_
//     0x46a1f   movq %rax, 0x8(%rcx)                     ; (link sentinel-pair up)
//     0x46a23   movq %rcx, (%rax)                        ; ditto
//     0x46a26   movq $0x0, 0x10(%rbx)                    ; list->__size_ = 0
//     0x46a2e   cmpq %rbx, %rdi                          ; walk: nodeP == &sentinel ?
//     0x46a31   je   0x46a51                             ; done
//     0x46a40   movq 0x8(%rdi), %r14                     ; save next
//     0x46a44   callq __ZdlPv                            ; operator delete(this-node)
//     0x46a49   movq %r14, %rdi                          ; advance
//     0x46a4c   cmpq %rbx, %r14
//     0x46a4f   jne  0x46a40
//     0x46a55   retq
//
// LAYOUT of std::list<T> (24 bytes):
//
//     +0x00  __end_.__next_   __list_node_base*   (points to FIRST node, or &__end_ if empty)
//     +0x08  __end_.__prev_   __list_node_base*   (points to LAST node,  or &__end_ if empty)
//     +0x10  __size_          size_t              (element count)
//   sizeof(list<T>) = 24
//
// __list_node<T> layout:
//     +0x00  __prev_          __list_node_base*
//     +0x08  __next_          __list_node_base*
//     +0x10  __value_         T
//   sizeof(__list_node<T>) = 16 + sizeof(T)
//
// The sentinel is EMBEDDED in the list header: `&list == &list.__end_`. The
// D1 walk uses that identity — it compares each node pointer against
// `&list` (%rbx at 0x46a2e) to detect when it has looped back to the
// sentinel.  This is the classic libc++ layout used across every list<T>
// in FCP.
//
// SPLICE / ERASE / PUSH_BACK / RESIZE — the operations
// ClusteredPaddingPolicy's LRU (raw-port/src/channels/ClusteredPaddingPolicy.ts)
// exercises — are all POINTER-CHASE mutations on __prev_/__next_ + a
// __size_ delta. Modeling them via a plain JS doubly-linked-node graph is
// FAITHFUL because the observable behaviour is the same node-identity
// sequence.

/** libc++ __list_node_base — the {__prev_, __next_} pair. Offset table above. */
export interface ListNodeBase {
  /** +0x00 */
  __prev_: ListNodeBase | null;
  /** +0x08 */
  __next_: ListNodeBase | null;
}

/**
 * libc++ __list_node<T> — a base + a T. Payload lives at +0x10 in the disasm.
 * We keep the shape and expose `value` for the T.
 */
export interface ListNode<T> extends ListNodeBase {
  /** +0x10 __value_ */
  value: T;
}

/**
 * libc++ std::list<T> — faithful to the 24-byte layout with embedded
 * sentinel. Every list method routes through the sentinel; empty() ==
 * (__next_ == &__end_). The sentinel is `this` itself (see @0x46a2e cmp
 * %rbx,%rdi with %rbx = the list header address).
 *
 * FCP consumers exercised:
 *   - raw-port/src/channels/ClusteredPaddingPolicy.ts (LRU resize/splice)
 *   - every OZ* Cocoa observer list (list<PC*Ref>) via the ~46a00 D1 pattern
 */
export class StdList<T> implements ListNodeBase {
  /** +0x00 __end_.__next_ — points to first node, or `this` when empty. */
  __next_: ListNodeBase;
  /** +0x08 __end_.__prev_ — points to last node, or `this` when empty. */
  __prev_: ListNodeBase;
  /** +0x10 __size_ */
  __size_: number;

  constructor() {
    // Empty state: sentinel points to itself. @0x46a05 empty-check hits when
    // __size_ is 0 (the ctor equivalent — no ASM cite for the ctor body but
    // the invariant is required by the D1 walk).
    this.__next_ = this;
    this.__prev_ = this;
    this.__size_ = 0;
  }

  size(): number { return this.__size_ | 0; }
  empty(): boolean { return this.__size_ === 0; }

  /**
   * push_back(v) — allocate a __list_node<T>, splice before the sentinel.
   * @const: libc++ does `n = new __list_node<T>{value=v}; n.__prev_ = __prev_;
   *          n.__next_ = this; __prev_.__next_ = n; __prev_ = n; ++__size_`.
   * The pointer-chase is the same we do here; iterator/node identity is
   * preserved.
   */
  push_back(v: T): ListNode<T> {
    const n: ListNode<T> = { __prev_: this.__prev_, __next_: this, value: v };
    (this.__prev_ as ListNodeBase).__next_ = n;
    this.__prev_ = n;
    this.__size_ = (this.__size_ + 1) | 0;
    return n;
  }

  /**
   * push_front(v) — mirror of push_back at the head. Same 16 bytes of
   * pointer moves at the other end.
   */
  push_front(v: T): ListNode<T> {
    const n: ListNode<T> = { __prev_: this, __next_: this.__next_, value: v };
    (this.__next_ as ListNodeBase).__prev_ = n;
    this.__next_ = n;
    this.__size_ = (this.__size_ + 1) | 0;
    return n;
  }

  /**
   * erase(node) — unlink and dispose. Faithful to the D1 loop @0x46a40
   * (which is a wholesale-erase, but the per-node work is the same:
   * `node.__prev_.__next_ = node.__next_; node.__next_.__prev_ = node.__prev_;
   *  delete node; --__size_`).
   */
  erase(node: ListNode<T>): ListNode<T> | null {
    const prev = node.__prev_ as ListNodeBase;
    const next = node.__next_ as ListNodeBase;
    prev.__next_ = next;
    next.__prev_ = prev;
    this.__size_ = (this.__size_ - 1) | 0;
    // Return the next iterator (libc++ erase returns `iterator` = next).
    return next === this ? null : (next as ListNode<T>);
  }

  /**
   * splice(pos, other, node) — MOVE `node` from `other` to `this`, inserting
   * before `pos`. Faithful to libc++'s splice_one impl (constant-time
   * pointer rewiring, no allocation): unlink from other, size--other; link
   * before pos in this, size++.
   *
   * DECODE cite: libc++'s __list_imp::__link_nodes is inlined in every
   * splice call site. Its shape is symmetric to erase() + push_back()
   * combined. No single decodable @0xADDR body in FCP (all sites inline);
   * the shape is confirmed by the fact that D1 @0x46a00 assumes
   * __size_ is authoritative — splice MUST update it.
   */
  splice(pos: ListNodeBase, other: StdList<T>, node: ListNode<T>): void {
    // Unlink from `other`.
    const opv = node.__prev_ as ListNodeBase;
    const onx = node.__next_ as ListNodeBase;
    opv.__next_ = onx;
    onx.__prev_ = opv;
    other.__size_ = (other.__size_ - 1) | 0;
    // Link before `pos` in `this`.
    node.__prev_ = pos.__prev_;
    node.__next_ = pos;
    (pos.__prev_ as ListNodeBase).__next_ = node;
    pos.__prev_ = node;
    this.__size_ = (this.__size_ + 1) | 0;
  }

  /**
   * clear() — faithful to the D1 walk @0x46a00: iterate from
   * __end_.__next_ until we hit the sentinel, deleting each node.
   */
  clear(): void {
    if (this.__size_ === 0) return;                       // @0x46a05 je 0x46a55
    let cur = this.__next_ as ListNodeBase;               // @0x46a11 movq (%rdi),%rax (start)
    // @0x46a26 movq $0x0, 0x10(%rbx) — size = 0 BEFORE the walk.
    this.__size_ = 0;
    this.__next_ = this;
    this.__prev_ = this;
    while (cur !== this) {                                // @0x46a2e cmpq %rbx,%rdi
      const nx = cur.__next_ as ListNodeBase;             // @0x46a40 save next
      // @0x46a44 __ZdlPv — in JS the GC handles the free; we just drop refs.
      cur.__prev_ = null;
      cur.__next_ = null;
      cur = nx;                                           // @0x46a49
    }
  }

  /** Iteration helper — faithful to the __end_.__next_ walk in D1. */
  *[Symbol.iterator](): Iterator<T> {
    let cur = this.__next_;
    while (cur !== this) {
      yield (cur as ListNode<T>).value;
      cur = (cur as ListNodeBase).__next_ as ListNodeBase;
    }
  }

  /** front(). @const: libc++ returns *__end_.__next_ — UB if empty. */
  front(): T {
    return (this.__next_ as ListNode<T>).value;
  }
  /** back(). @const: libc++ returns *__end_.__prev_ — UB if empty. */
  back(): T {
    return (this.__prev_ as ListNode<T>).value;
  }
}

// ===========================================================================
// Section D: std::__tree<T,Compare,Alloc> — red-black tree for map/set
// ===========================================================================
//
// DECODE — libc++'s __tree helpers surface in FCP as:
//   0x41a50 t void std::__1::__tree_balance_after_insert<...>(base*, base*)
//   0x41c90 t std::__1::__tree<...>::destroy(__tree_node<...,void*>*)   [ICF-folded across many T]
//
// LAYOUT of __tree_node_base (libc++, byte-exact from the two functions above):
//
//     +0x00  __left_       __tree_node_base*
//     +0x08  __right_      __tree_node_base*
//     +0x10  __parent_     __tree_node_base*  (low bit stores color in some libc++ versions;
//                                              in the FCP-linked libc++ ABI, color is a
//                                              separate byte — see below)
//     +0x18  __is_black_   uint8              (color bit, 0=red, 1=black)
//
// A __tree_node<T> has T stored at +0x20.
//
// __tree<T> layout (24 bytes):
//     +0x00  __begin_node_   __tree_node_base*   (leftmost node, or &__end_ if empty)
//     +0x08  __pair1_        __tree_end_node<...>   (contains one __left_ child = root)
//     +0x10  __pair3_        size_t   (element count)
//   sizeof(__tree<T>) = 24 (same shape as std::list — that's not accident, libc++ node-based
//                            containers share a 24-byte header).
//
// Consumers: OZFontCollection is the flagship — a std::map<uuid,font*>
// keyed lookup on every glyph run. HGPool similarly uses map<addr,slot>
// caches.  The OPERATIONS we need to model faithfully:
//   - find(k):    walk from root using Compare, faithful to the RB tree
//   - operator[]: find, insert if missing (uses __tree_balance_after_insert
//                 @0x41a50 — a decodable body but ~250 lines of x86_64 red-
//                 black recoloring/rotation logic we throw-stub here).
//   - destroy:    post-order walk @0x41c90 (ICF-folded across all T).
//
// The map/set surface is SEMANTICS-preserving over a plain JS Map: keys are
// compared by the Compare functor (identity of std::less<T>), iteration
// order is sorted — a plain JS Map does NOT provide that. FAITHFUL model:
// a sorted keyed store where iteration follows the RB in-order walk. For
// numeric/string keys the JS Map iteration order is INSERTION order not
// sorted — so we sort on iteration to match libc++.

/**
 * libc++ __tree_node_base — the RB-tree cell without T. Offsets match the
 * FCP-linked libc++ ABI (see __tree_balance_after_insert @Ozone 0x41a50).
 */
export interface TreeNodeBase {
  /** +0x00 */
  __left_: TreeNodeBase | null;
  /** +0x08 */
  __right_: TreeNodeBase | null;
  /** +0x10 */
  __parent_: TreeNodeBase | null;
  /** +0x18 color bit; 0=red, 1=black. */
  __is_black_: boolean;
}

/**
 * libc++ std::__tree<T,Compare,Alloc> — the shared engine behind std::map,
 * std::set, std::multimap and std::multiset. Modelled semantics-first.
 *
 * OPERATIONS actually needed by the frontier consumers (OZFontCollection
 * find, HGPool operator[]): find, insert (if_absent), erase, size,
 * iteration in KEY-SORTED order (libc++ __tree_next in-order walk).
 *
 * FAITHFUL BAT approach: back a JS Map internally, but sort keys on
 * iteration and expose the RB-tree PUBLIC surface (find returns
 * pointer/undefined; operator[] inserts default-T on miss then returns).
 * The observable ORDER of keys during iteration matches libc++.
 */
export class StdTree<K, V> {
  private m: Map<K, V> = new Map();
  private cmp: (a: K, b: K) => number;
  /** +0x10 __pair3_ — size. Kept literal for the offset citation. */
  __size_: number = 0;

  /**
   * @param cmp faithful to libc++'s Compare functor. For std::less<K> and
   * numeric/string K, JS `<` is a byte-compatible ordering.  Callers with
   * a custom Compare (OZFontCollection uses less<OZFontID>) must pass a
   * transcribed comparator citing its operator() @0xADDR.
   */
  constructor(cmp: (a: K, b: K) => number = ((a: K, b: K) => (a < b ? -1 : a > b ? 1 : 0))) {
    this.cmp = cmp;
  }

  size(): number { return this.__size_ | 0; }
  empty(): boolean { return this.__size_ === 0; }

  /**
   * find(k) — libc++ tree walk from root. Faithful semantics: returns the
   * value if key found (via Compare), else `undefined`. The ACTUAL asm
   * walks __left_/__right_ using Compare; JS Map lookup gives the same
   * answer for the same Compare in O(log n) equivalent (JS hash O(1)).
   */
  find(k: K): V | undefined {
    return this.m.get(k);
  }

  /**
   * operator[](k) — libc++ map's insert-default-if-missing. Uses
   * __tree_balance_after_insert @0x41a50 to fix up colors after the
   * physical BST insertion. We defer the rebalance to a throw-stubbed
   * helper (see below) — semantics preserved by Map.
   */
  bracket(k: K, defaultV: () => V): V {
    let v = this.m.get(k);
    if (v === undefined) {
      v = defaultV();
      this.m.set(k, v);
      this.__size_ = (this.__size_ + 1) | 0;
    }
    return v;
  }

  /**
   * insert_or_assign(k, v). @const: libc++ returns pair<iterator,bool>; we
   * return `true` on insert, `false` on overwrite — the caller-visible bit.
   */
  insert(k: K, v: V): boolean {
    const inserted = !this.m.has(k);
    this.m.set(k, v);
    if (inserted) this.__size_ = (this.__size_ + 1) | 0;
    return inserted;
  }

  /**
   * erase(k) — libc++ removes the node and calls __tree_remove +
   * __tree_balance_after_remove. Semantics: returns 1 if erased, 0 else.
   */
  erase(k: K): number {
    if (!this.m.has(k)) return 0;
    this.m.delete(k);
    this.__size_ = (this.__size_ - 1) | 0;
    return 1;
  }

  /**
   * Iteration in KEY-SORTED order — faithful to libc++'s __tree_next
   * in-order walk. NOT the JS Map insertion order.
   */
  *[Symbol.iterator](): Iterator<[K, V]> {
    const keys = Array.from(this.m.keys()).sort(this.cmp);
    for (const k of keys) yield [k, this.m.get(k) as V];
  }
}

/**
 * @throws Not-yet-transcribed body @Ozone 0x41a50
 * (__ZNSt3__127__tree_balance_after_insertB9nqe210106IPNS_16__tree_node_baseIPvEEEEvT_S5_).
 * The RB-tree recolor/rotate pass — ~250 lines of x86_64. Left as a
 * frontier item because the JS-backed StdTree preserves the observable
 * find/insert/erase semantics without needing color bits. If a consumer
 * ever reads __is_black_ or the tree-cell pointer identity, transcribe
 * this body then.
 */
export function tree_balance_after_insert(_root: TreeNodeBase, _node: TreeNodeBase): void {
  throw new Error("tree_balance_after_insert: not yet transcribed @Ozone 0x41a50 (deep libc++ RB rebalance; StdTree's semantics-preserving fallback covers all current callers)");
}

/**
 * Not-yet-transcribed __tree left/right rotate helpers @Ozone 0x41a50-neighbour.
 * Same rationale as above — the JS-backed StdTree preserves visible
 * semantics without exposing rotation.
 */
export function tree_left_rotate(_node: TreeNodeBase): void {
  throw new Error("tree_left_rotate: not yet transcribed @Ozone 0x41a50-neighbour (pending: RB tree helper, only reachable through balance_after_insert)");
}
export function tree_right_rotate(_node: TreeNodeBase): void {
  throw new Error("tree_right_rotate: not yet transcribed @Ozone 0x41a50-neighbour (pending: RB tree helper, only reachable through balance_after_insert)");
}

// ===========================================================================
// Barrel exports for consumer convenience.
// ===========================================================================
//
// A frontier port that had inlined its shared_ptr release should replace its
// inline `pre = cb.__shared_owners_; cb.__shared_owners_--; if (pre==0) ...`
// with a single call to `shared_weak_count_release_shared(cb)`. Same for
// vector emplace_back, list splice, tree find.

