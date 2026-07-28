// FFVideoPropsGroup.ts — Flexo framework class.
// Transcribed from the x86_64 disassembly of Flexo in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// (see raw-port/re/disasm/Flexo.FFVideoPropsGroup.*.s + llvm-objdump).
//
// Symbols (nm -arch x86_64 | c++filt):
//   0x00fd59b0 T __ZN17FFVideoPropsGroupC1Ev                       FFVideoPropsGroup::FFVideoPropsGroup() (C1)
//   0x00fd59e0 T __ZN17FFVideoPropsGroupD2Ev                       FFVideoPropsGroup::~FFVideoPropsGroup() (D2 base)
//   0x00fd5b40 T __ZN17FFVideoPropsGroupD1Ev                       FFVideoPropsGroup::~FFVideoPropsGroup() (D1 complete → jmp D2)
//   0x00fd5b50 T __ZN17FFVideoPropsGroup12findOrInsertEP12FFVideoProps  FFVideoPropsGroup::findOrInsert(FFVideoProps*)
//
// PROVENANCE / DECODE:
//   raw-port/re/disasm/Flexo.FFVideoPropsGroup.FFVideoPropsGroup.s   (C1)
//   raw-port/re/disasm/Flexo.FFVideoPropsGroup.~FFVideoPropsGroup.s  (D1 shim → D2)
//   raw-port/re/disasm/Flexo.FFVideoPropsGroup.findOrInsert.s        (findOrInsert)
//   D2 @0xfd59e0 read via `xcrun llvm-objdump --arch=x86_64 --macho -d` (annotates
//     selectors: countByEnumeratingWithState:objects:count:, _adjustInternalMinRefCount:).
//   Referenced externs (all libobjc/libSystem stubs):
//     _pthread_mutex_init                                    @Flexo 0xfd59bb
//     _pthread_mutex_lock                                    @Flexo 0xfd5b7c
//     _pthread_mutex_unlock                                  @Flexo 0xfd5cf1
//     _pthread_mutex_destroy                                 @Flexo 0xfd5a05
//     _objc_opt_new                                          @Flexo 0xfd59c7
//     _objc_enumerationMutation                              @Flexo 0xfd5c86, 0xfd5aa3
//     _objc_release                                          @Flexo 0xfd5ce8, 0xfd5afc
//     _OBJC_CLASS_$_NSMutableArray                           @Flexo 0xfd59c0 (literal pool)
//     ___stack_chk_guard / ___stack_chk_fail                 stack canary boilerplate
//   ObjC selectors (from llvm-objdump annotations):
//     countByEnumeratingWithState:objects:count:             ; NSFastEnumeration
//     isEqualToVideoProps:                                    ; -[FFVideoProps isEqualToVideoProps:]
//     _copyImmutableVersion                                   ; -[FFVideoProps _copyImmutableVersion]
//     addObject:                                              ; -[NSMutableArray addObject:]
//     setInVidPropsCache:                                     ; -[FFVideoProps setInVidPropsCache:]
//     _adjustInternalMinRefCount:                             ; -[FFVideoProps _adjustInternalMinRefCount:]
//
// ── ROLE ─────────────────────────────────────────────────────────────────
// A thread-safe cache of unique FFVideoProps instances.  Callers pass an
// FFVideoProps candidate to `findOrInsert`; the group looks for an
// existing entry with `isEqualToVideoProps:` under a pthread mutex.  If
// found, the existing entry is returned; if not, an immutable copy of
// the candidate (`_copyImmutableVersion`) is added to the internal
// NSMutableArray, tagged with `setInVidPropsCache:` and given a bumped
// min-refcount via `_adjustInternalMinRefCount:1`, then returned.
//
// The destructor drains the array: it enumerates each entry once and
// calls `_adjustInternalMinRefCount:-1` on it, then releases the array
// itself.
//
// ── STRUCT LAYOUT (recovered from C1 @0xfd59b0 and D2 @0xfd59e0) ─────────
//   +0x00  pthread_mutex_t   64 bytes  (Darwin's PTHREAD_MUTEX_SIZE__ is 56 + 8-byte sig,
//                                       covering +0x00..+0x40; initialised at C1 @0xfd59bb
//                                       and torn down at D2 @0xfd5a05.  We treat the whole
//                                       0x00..0x40 range as opaque mutex bytes.)
//   +0x40  cache : NSMutableArray*     (created via `objc_opt_new` on NSMutableArray at
//                                       C1 @0xfd59c7, stored at 0xfd59cc.  Read at
//                                       findOrInsert 0xfd5ba0/0xfd5cb3 and D2 0xfd5a29/0xfd5af8.)
//   sizeof: 0x48 (aligned to 0x50 by the alloc pool most likely; not observable here).
//
// ── FRONTIER ─────────────────────────────────────────────────────────────
// FFVideoProps (the element type) and NSMutableArray/pthread_mutex are
// undecoded here.  We wire the ObjC methods through a small bridge
// interface so the caller that ports FFVideoProps (and provides an
// NSMutableArray-like collection) can install their real implementations.
// Until installed, calling `findOrInsert` (or `destroy` on a populated
// group) throws with the cited @0xADDR.

/**
 * Opaque handle to an FFVideoProps ObjC object.  Real ports live in a
 * separate file; here we treat it as a nominal, JS-side object identity.
 * Cited references: findOrInsert argument, `-[FFVideoProps isEqualToVideoProps:]`
 * @Flexo 0xfd5c58, `-[FFVideoProps _copyImmutableVersion]` @0xfd5cae,
 * `-[FFVideoProps setInVidPropsCache:]` @0xfd5cd2,
 * `-[FFVideoProps _adjustInternalMinRefCount:]` @0xfd5ce3 & @0xfd5abb.
 */
export interface FFVideoProps {
  readonly __brand_FFVideoProps: unique symbol;
}

/**
 * The ObjC bridge that lets this pure-JS port drive real FFVideoProps /
 * NSMutableArray semantics when a caller wires them in.
 *
 * Each method corresponds to exactly one `callq *msgSend(%rip)` site
 * in the disassembly and is documented with its @0xADDR.
 */
export interface FFVideoPropsGroupBridge {
  /** `-[NSMutableArray addObject:]` @Flexo 0xfd5cc1 (adds `x` to `array`). */
  addObject(array: object, x: FFVideoProps): void;
  /**
   * NSFastEnumeration walk over `array`.  The disassembly uses
   * `countByEnumeratingWithState:objects:count:` (@Flexo 0xfd5bc6, 0xfd5c22,
   * 0xfd5a4f, 0xfd5ae7) but for a pure-JS port we collapse the ObjC
   * fast-enumeration protocol to "give me a snapshot of the array's
   * current members in insertion order".  Detecting concurrent
   * mutation (`_objc_enumerationMutation` @0xfd5c86/0xfd5aa3) is
   * a UB safety check; we don't model it.
   */
  enumerate(array: object): readonly FFVideoProps[];
  /** `-[FFVideoProps isEqualToVideoProps:]` @Flexo 0xfd5c58. */
  isEqualToVideoProps(lhs: FFVideoProps, rhs: FFVideoProps): boolean;
  /** `-[FFVideoProps _copyImmutableVersion]` @Flexo 0xfd5cae. */
  copyImmutableVersion(x: FFVideoProps): FFVideoProps;
  /** `-[FFVideoProps setInVidPropsCache:]` @Flexo 0xfd5cd2 (BOOL arg). */
  setInVidPropsCache(x: FFVideoProps, value: boolean): void;
  /** `-[FFVideoProps _adjustInternalMinRefCount:]` @Flexo 0xfd5ce3 & 0xfd5abb (i32 arg). */
  adjustInternalMinRefCount(x: FFVideoProps, delta: number): void;
  /** `_objc_release` @Flexo 0xfd5ce8 (called after the immutable copy is added). */
  release(x: FFVideoProps): void;
  /** `-[NSMutableArray release]` equivalent @Flexo 0xfd5afc (destroys the cache). */
  releaseArray(array: object): void;
  /**
   * `objc_opt_new` of NSMutableArray @Flexo 0xfd59c7.  Returns an
   * empty mutable collection suitable for `addObject:` / `enumerate`.
   */
  newMutableArray(): object;
}

/**
 * FFVideoPropsGroup — thread-safe cache of unique FFVideoProps.
 *
 * Public API is `findOrInsert(candidate) -> canonical`.  Callers must
 * install a bridge via `setBridge(...)` before calling.
 */
export class FFVideoPropsGroup {
  /**
   * +0x00..+0x40  pthread_mutex_t opaque bytes.  We don't model per-thread
   * blocking (JS is single-threaded); the mutex init/destroy calls are
   * kept as bridge no-ops for provenance so future SharedArrayBuffer /
   * worker ports have a hook point.
   */
  private mutex: { locked: boolean };

  /** +0x40  cache : NSMutableArray*   (created by C1 @0xfd59c7). */
  private cache: object;

  /** ObjC bridge — installed once by the caller that ports FFVideoProps. */
  private static bridge: FFVideoPropsGroupBridge | null = null;

  /** Install the FFVideoProps/NSMutableArray bridge.  See ctor+methods for use sites. */
  public static setBridge(bridge: FFVideoPropsGroupBridge): void {
    FFVideoPropsGroup.bridge = bridge;
  }

  private static requireBridge(callsite: string): FFVideoPropsGroupBridge {
    const b = FFVideoPropsGroup.bridge;
    if (b === null) {
      throw new Error(
        "FFVideoPropsGroup: bridge not installed (call setBridge) — " +
        "needed for " + callsite
      );
    }
    return b;
  }

  /**
   * FFVideoPropsGroup::FFVideoPropsGroup()  —  Flexo @0xfd59b0 (C1).
   *
   * Faithful mirror of raw-port/re/disasm/
   * Flexo.FFVideoPropsGroup.FFVideoPropsGroup.s:
   *
   *   0xfd59b0  pushq %rbp
   *   0xfd59b1  movq  %rsp, %rbp
   *   0xfd59b4  pushq %rbx
   *   0xfd59b5  pushq %rax
   *   0xfd59b6  movq  %rdi, %rbx                 ; %rbx = this
   *   0xfd59b9  xorl  %esi, %esi                 ; attr = nullptr
   *   0xfd59bb  callq _pthread_mutex_init(this + 0, nullptr)   ; init mutex @+0x00
   *   0xfd59c0  movq  _OBJC_CLASS_$_NSMutableArray(%rip), %rdi
   *   0xfd59c7  callq _objc_opt_new              ; [NSMutableArray new]
   *   0xfd59cc  movq  %rax, 0x40(%rbx)           ; this->cache = new array
   *   0xfd59d0  addq  $0x8, %rsp
   *   0xfd59d4  popq  %rbx ; popq %rbp ; retq
   */
  public constructor() {
    // 0xfd59bb — pthread_mutex_init(this+0, nullptr).  We model the
    //   mutex as an opaque object with a boolean flag purely so the
    //   lock/unlock calls in findOrInsert have a target; JS's
    //   single-threaded execution guarantees mutual exclusion at the
    //   function-call granularity that this cache requires.
    this.mutex = { locked: false };

    // 0xfd59c0/0xfd59c7 — [NSMutableArray new].  Deferred to the bridge
    //   so callers using a real Cocoa collection get real semantics; a
    //   pure-JS caller may install a bridge whose `newMutableArray()`
    //   returns `[]`.  If no bridge is installed yet, we create a
    //   plain array to keep the ctor total (destroy() will still fail
    //   without the bridge when the array is non-empty).
    const bridge = FFVideoPropsGroup.bridge;
    this.cache = bridge !== null ? bridge.newMutableArray() : [];

    // 0xfd59cc — stored at +0x40 (implicit here).
  }

  /**
   * FFVideoPropsGroup::findOrInsert(FFVideoProps*)  —  Flexo @0xfd5b50.
   *
   * Faithful mirror of raw-port/re/disasm/
   * Flexo.FFVideoPropsGroup.findOrInsert.s.
   *
   * Prologue (0xfd5b50..0xfd5b7c): save regs, allocate 0xe8 bytes of stack,
   * install stack canary at -0x30(%rbp), pthread_mutex_lock(this+0).
   *
   * Zero the NSFastEnumeration state struct (4x16-byte `movaps` @0xfd5b81..0xfd5b99).
   *
   * Outer loop:
   *   %r14 = this->cache        (loaded at 0xfd5ba0)  — the NSMutableArray*.
   *   %r15 = 0                  (candidate result — first match; kept in cmovne)
   *   Kick off enumeration @0xfd5bc6 via
   *   `-[cache countByEnumeratingWithState:objects:count: state,objs,16]`.
   *   If %rax == 0 → no items, skip to insert (branch to 0xfd5c99).
   *   Save mutationState (%rax = state.mutationsPtr; deref → -0xd0(%rbp)).
   *
   * Inner loop over the returned batch (of length %rbx = enumeration return):
   *   %r13 = selector `isEqualToVideoProps:` (loaded at 0xfd5c30).
   *   For i in 0..%rbx-1:
   *     Read state.itemsPtr[i] into %r12  (at 0xfd5c47).
   *     If *state.mutationsPtr != saved mutationState → objc_enumerationMutation(cache).
   *     Call `-[%r12 isEqualToVideoProps: candidate]`  @0xfd5c58.
   *     If truthy → %r15 = %r12  (record first match; loop continues,
   *                                but any subsequent match is IGNORED
   *                                because cmovne is only taken on true
   *                                and %r15 is already set).  In practice
   *                                the outer loop still runs to the end
   *                                of the batch — the ObjC fast-enum
   *                                protocol requires draining even after
   *                                a hit.  So findOrInsert always
   *                                returns the LAST match in enum order
   *                                (or equivalently: any match; the cache
   *                                is uniqued by construction, so at most
   *                                one match exists).
   *   When batch exhausted, request the next batch (0xfd5c00..0xfd5c22).
   *   Zero next-batch return → break to 0xfd5c8d.
   *
   * At the exit test @0xfd5c8d..0xfd5c97:
   *   If %r15 != 0 → have a match; jump to unlock/return @0xfd5cee.
   *   Else fall through to the INSERT path @0xfd5c99.
   *
   * Insert path (0xfd5c99..0xfd5ce8):
   *   0xfd5c99  sel = `_copyImmutableVersion`
   *   0xfd5ca0  msgSend = _objc_msgSend (stashed in %rbx for repeated use)
   *   0xfd5ca7  arg = candidate
   *   0xfd5cae  callq *%rbx        → %r15 = immutableCopy
   *   0xfd5cb3  arg0 = this->cache
   *   0xfd5cb7  sel = `addObject:`
   *   0xfd5cbe  arg1 = immutableCopy
   *   0xfd5cc1  callq *%rbx        → -[cache addObject: immutableCopy]
   *   0xfd5cc3  sel = `setInVidPropsCache:`
   *   0xfd5cca  arg0 = immutableCopy
   *   0xfd5ccd  arg1 = 1 (BOOL YES)
   *   0xfd5cd2  callq *%rbx        → -[immutableCopy setInVidPropsCache: YES]
   *   0xfd5cd4  sel = `_adjustInternalMinRefCount:`
   *   0xfd5cdb  arg0 = immutableCopy
   *   0xfd5cde  arg1 = 1
   *   0xfd5ce3  callq *%rbx        → -[immutableCopy _adjustInternalMinRefCount: 1]
   *   0xfd5ce8  objc_release(immutableCopy)
   *
   * Unlock/return (0xfd5cee..0xfd5d1a):
   *   pthread_mutex_unlock(this+0).
   *   stack-canary check.  Return %r15.
   */
  public findOrInsert(candidate: FFVideoProps): FFVideoProps {
    const bridge = FFVideoPropsGroup.requireBridge(
      "findOrInsert @Flexo 0xfd5b50 (needs isEqualToVideoProps:/_copyImmutableVersion/addObject:/setInVidPropsCache:/_adjustInternalMinRefCount:)"
    );

    // 0xfd5b7c — pthread_mutex_lock(this+0).
    this.mutex.locked = true;

    try {
      // 0xfd5b81..0xfd5b99 — zero the fast-enum state struct.  Not
      //   observable in JS; encoded as the initial "no items snapshotted"
      //   state below.

      // 0xfd5bc6 / 0xfd5c22 — countByEnumeratingWithState:objects:count: 16
      //   returns batches of pointers.  We collapse both the first and
      //   the loop-continuation calls into a single enumerate() request:
      //   the bridge returns the array's current membership in insertion
      //   order.  This preserves the outcome (find first match, or all-
      //   items examined) but not the batching granularity — which is an
      //   internal detail of NSMutableArray.
      const items = bridge.enumerate(this.cache);

      // 0xfd5bf0 — %r15 = 0 (result register).
      //   0xfd5c30 — sel isEqualToVideoProps: cached in %r13.
      //   0xfd5c40..0xfd5c67 — the inner "for i in batch" loop.
      let match: FFVideoProps | null = null;
      for (let i = 0; i < items.length; i++) {
        // 0xfd5c47..0xfd5c58 — [items[i] isEqualToVideoProps: candidate]
        if (bridge.isEqualToVideoProps(items[i], candidate)) {
          // 0xfd5c5e/0xfd5c60 — cmovneq %r12, %r15 — record match; keep looping.
          match = items[i];
          // Note: asm continues walking the whole batch (and next batches).
          // In pure JS this only matters if the bridge's enumerate() side
          // effects on mutation; we mirror by continuing the loop.
        }
      }
      // The 0xfd5c86 objc_enumerationMutation branch is only reachable
      // when the mutation counter changes underneath the enumerator —
      // that would be a caller-programming error.  Not modelled.

      // 0xfd5c8d/0xfd5c97 — if match found, skip insert.
      if (match !== null) {
        return match;
      }

      // Insert path @0xfd5c99..0xfd5ce8.

      // 0xfd5cae — immutableCopy = -[candidate _copyImmutableVersion].
      const immutable = bridge.copyImmutableVersion(candidate);

      // 0xfd5cc1 — -[this.cache addObject: immutableCopy].
      bridge.addObject(this.cache, immutable);

      // 0xfd5cd2 — -[immutableCopy setInVidPropsCache: YES].
      bridge.setInVidPropsCache(immutable, true);

      // 0xfd5ce3 — -[immutableCopy _adjustInternalMinRefCount: 1].
      bridge.adjustInternalMinRefCount(immutable, 1);

      // 0xfd5ce8 — objc_release(immutableCopy).
      //   Note: addObject: retains, and _copyImmutableVersion returned a
      //   +1 ref, so this release balances the +1 from the copy.
      bridge.release(immutable);

      return immutable;
    } finally {
      // 0xfd5cf1 — pthread_mutex_unlock(this+0).
      this.mutex.locked = false;
    }
  }

  /**
   * FFVideoPropsGroup::~FFVideoPropsGroup()  —  Flexo @0xfd59e0 (D2 base dtor)
   * and Flexo @0xfd5b40 (D1 complete dtor — a shim that jmps to D2).
   *
   * D1 body (raw-port/re/disasm/Flexo.FFVideoPropsGroup.~FFVideoPropsGroup.s):
   *   0xfd5b40  pushq %rbp ; movq %rsp,%rbp ; popq %rbp
   *   0xfd5b45  jmp   __ZN17FFVideoPropsGroupD2Ev
   *
   * D2 body (read via llvm-objdump):
   *   0xfd5a05  pthread_mutex_destroy(this + 0)
   *   0xfd5a0a..0xfd5a22  zero the fast-enum state
   *   Outer enumerate loop over this->cache (this+0x40) via
   *   `countByEnumeratingWithState:objects:count:` (@0xfd5a4f then 0xfd5ae7).
   *   For each item in each batch:
   *     0xfd5abb  callq *%rbx (msgSend) sel=`_adjustInternalMinRefCount:` (%r15),
   *                arg = 0xffffffff (i.e. delta = -1 as int32).
   *   0xfd5afc  objc_release(this->cache).
   *   Stack-canary check, return.
   */
  public destroy(): void {
    const bridge = FFVideoPropsGroup.bridge;

    // 0xfd5a05 — pthread_mutex_destroy.  No JS analog; mark as gone.
    this.mutex.locked = false;

    // 0xfd5a4f..0xfd5ae7 — enumerate cache and adjust min-refcount by -1.
    //   If bridge is absent AND the cache is empty (typical after a ctor
    //   with no findOrInsert calls), we can safely skip.  A non-empty
    //   cache without a bridge is a caller programming error → throw.
    let items: readonly FFVideoProps[] | null = null;
    if (bridge !== null) {
      items = bridge.enumerate(this.cache);
    } else {
      // Treat a fallback JS array as its own snapshot.
      const asArr = this.cache as unknown as FFVideoProps[];
      items = Array.isArray(asArr) ? asArr : null;
    }

    if (items !== null && items.length !== 0) {
      if (bridge === null) {
        // Cited @Flexo 0xfd5abb — cannot adjust min-refcount without the bridge.
        throw new Error(
          "FFVideoPropsGroup.destroy: bridge not installed and cache " +
          "is non-empty — needed for -[FFVideoProps _adjustInternalMinRefCount: -1] " +
          "@Flexo 0xfd5abb"
        );
      }
      for (let i = 0; i < items.length; i++) {
        // 0xfd5abb — msgSend selector _adjustInternalMinRefCount: with arg -1 (0xffffffff).
        //   In the ABI this is a signed 32-bit int passed in %edx; -1 as u32 = 0xffffffff.
        bridge.adjustInternalMinRefCount(items[i], -1);
      }
    }

    // 0xfd5afc — objc_release(this->cache).
    if (bridge !== null) {
      bridge.releaseArray(this.cache);
    }
    // Drop our reference so the JS GC (or a future WeakRef) can reclaim it.
    this.cache = null as unknown as object;
  }
}
