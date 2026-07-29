// raw-port/src/channels/_FFModelLocker.ts
//
// FCP `_FFModelLocker` — a RAII (constructor-locks / destructor-unlocks) lock
// guard used across Flexo's model-object layer. Wraps one or many `FFSharedLock`
// instances into a CFMutableSet, calls FFSharedRead/WriteLockMultiple on entry,
// and the matching FFSharedRead/WriteUnlockMultiple on exit. Two constructor
// overloads: (FFSharedLock*, action) and (id<NSFastEnumeration>, action) — the
// second walks the enumerable collection and adds every `FFSharedLock` element
// to the set (filtering non-FFSharedLock via -isKindOfClass:).
//
// Framework: Flexo
//
// Provenance — 11 exported methods (all in Flexo x86_64 slice):
//   _FFModelLocker(FFSharedLock*, FFModelLockAction)        [C1] @0x3fcf70  (thunk to C2)
//   _FFModelLocker(FFSharedLock*, FFModelLockAction)        [C2] @0x3fced0
//   _FFModelLocker(FFSharedLock*, FFModelLockAction) [cold.1]    @0x3fcf41 target
//   _FFModelLocker(id<NSFastEnumeration>, FFModelLockAction) [C1] @0x3fd130 (thunk to C2)
//   _FFModelLocker(id<NSFastEnumeration>, FFModelLockAction) [C2] @0x3fcf80
//   _FFModelLocker(id<NSFastEnumeration>, FFModelLockAction) [cold.1] @0x3fd120 target
//   performLock()                                                 @0x3fcf50
//   performUnlock()                                               @0x3fd190
//   ~_FFModelLocker()  [D0 — deleting dtor]                       @0x3fd200
//   ~_FFModelLocker()  [D1 — complete-object dtor]                @0x3fd1b0
//   ~_FFModelLocker()  [D2 — base-object dtor]                    @0x3fd140
//
// DECODE FILES (each mangled symbol sliced from otool -tV):
//   raw-port/re/disasm/Flexo._FFModelLocker.{performLock,performUnlock}.s
//   raw-port/re/disasm/Flexo._FFModelLocker._FFModelLocker.s   (C1 for the FFSharedLock* overload
//                                                               — the two-instruction ICF thunk)
//   raw-port/re/disasm/Flexo._FFModelLocker.~_FFModelLocker.s  (D0)
//
// Struct layout (recovered from C2 ctor + D0/D1/D2 dtors — all four writes at
// the SAME offsets confirm the shape):
//   +0x00  vptr        (ctor writes `leaq 0x14fe611(%rip), %rax ; movq %rax, (%rdi)` @0x3fcee0/e7,
//                       each dtor rewrites the vptr to its own vtable slot before running the
//                       body — the standard "reset vptr for correct virtual dispatch during
//                       destructor chain" C++ idiom.)
//   +0x08  set         CFMutableSetRef (or nil until initialized) — holds retained FFSharedLock*
//                       objects. Written by the ctor: `movq $0x0, 0x8(%rdi)` @0x3fceea, then
//                       overwritten with the newly-created CFSet: `movq %r15, 0x8(%rbx)` @0x3fcf13
//                       (single-lock ctor) / @0x3fd0e2 (NSFastEnumeration ctor).
//   +0x10  action      u32 (FFModelLockAction enum). Written `movl %edx, 0x10(%rdi)` @0x3fcef2 (or
//                       @0x3fcfbe in the enum ctor). All lock/unlock branches read this value and
//                       compare against 0x1 (WRITE) — anything else falls through to READ.
// Total sizeof = 0x18 (24 bytes; the class has a vtable so is 8-byte aligned throughout).
//
// EXTERNAL FUNCTIONS REFERENCED (each cited @0xADDR):
//   * _FFSharedWriteLockMultiple    @Flexo direct-call target (jumped-to @0x3fcf2a in C2)
//   * _FFSharedReadLockMultiple     @Flexo direct-call target (jumped-to @0x3fcf3c in C2)
//   * _FFSharedWriteUnlockMultiple  @Flexo direct-call target (@0x3fd1cd in D1, @0x3fd15d in D2)
//   * _FFSharedReadUnlockMultiple   @Flexo direct-call target (@0x3fd1d4 in D1, @0x3fd164 in D2)
//   * _CFSetCreateMutable           @Flexo __stubs 0x14948cc — creates the underlying NSSet-bridged
//                                    container with NULL callbacks (allocator=NULL, capacity=0,
//                                    callbacks=NULL — a bare pointer identity set).
//   * _CFSetAddValue                @Flexo __stubs 0x14948c6 — adds a lock into the set. Called
//                                    once in C2_sharedLock (@0x3fcf0e), and once per element in
//                                    C2_nsFastEnum (@0x3fd086).
//   * _objc_release                 @Flexo literal pool @rip+0x14f04d5/25/95 — releases the set
//                                    payload during destruction (Toll-Free-Bridged NSSet reference).
//   * _objc_enumerationMutation     @Flexo __stubs 0x149793e — mutation-checker for the fast-enum
//                                    protocol; called if the collection was mutated mid-iteration.
//   * _objc_opt_class               @Flexo __stubs 0x149798c — reads the FFSharedLock class ptr.
//   * _objc_opt_isKindOfClass       @Flexo __stubs 0x1497992 — filters non-FFSharedLock elements.
//   * `-[id<NSFastEnumeration> countByEnumeratingWithState:objects:count:]`  — Objective-C protocol
//                                    method, dispatched via `callq *0x14f06a5(%rip)` @0x3fd015 and
//                                    @0x3fd062. (otool prints this as "-[%rdi radAsset]" because
//                                    it printed the wrong SEL pool entry; the state/objects/count
//                                    slots match the well-known NSFastEnumeration signature: %rsi
//                                    = SEL, %rdx = &state, %rcx = &stackBuf, %r8 = 0x10 count.)
//   * `__ZN14_FFModelLockerC2E...cold.1` for both ctors  @Flexo 0x3fcf41 (call target) and 0x3fd120.
//     These `.cold.1` addresses are the compiler-outlined "argument null-check trap" tails: the
//     ctor falls into them when %rsi (the lock/enum arg) is NULL. They do not return — they
//     abort via `__cxa_call_unexpected`-family exit. We model them as throw-stubs below.
//   * `__ZdlPv` (operator delete)   @Flexo __stubs 0x1497404 — called by D0 (@0x3fd23c) after
//                                    destruction completes; frees the `this` allocation.
//   * `___clang_call_terminate`     @Flexo (personality landing pad in each dtor if the release
//                                    throws; standard cxx-abi terminator invoke).
//
// VTABLES INSTALLED (three distinct vtable slot addresses — one per D0/D1/D2 kind — all reachable
// from the same class via the __ZTV14_FFModelLocker table + non-virtual thunks):
//   C2  @0x3fcee0  installs [rip+0x14fe611] -> ~0x18fb4f8  (primary vtable start)
//   D0  @0x3fd209  installs [rip+0x14fe2e8] -> ~0x18fb4f8
//   D1  @0x3fd1b9  installs [rip+0x14fe338] -> ~0x18fb4f8
//   D2  @0x3fd149  installs [rip+0x14fe3a8] -> ~0x18fb4f8
// (Each dtor resets to the same primary vtable start, per the C++-ABI "reset vptr before entering
// destructor body so any virtual call inside dispatches to THIS class's slot, not the derived
// class's slot" rule. Here the class is `final` in practice — the three vptr resets differ only
// in RIP-relative displacement, not in resolved target.)

// -- Enums / opaque types ----------------------------------------------------

/**
 * FFModelLockAction — the Flexo enum passed as the second ctor arg. Only value
 * 1 (WRITE) is compared against explicitly in the disasm; any other value falls
 * through to the READ branch. The ctor stores the raw 32-bit value at +0x10.
 * @Flexo binary reads: `cmpl $0x1, 0x10(%rdi)` @0x3fcf17 / @0x3fd0e6 / @0x3fd1c3
 *        / @0x3fd153 / @0x3fd213 / @0x3fcf54 / @0x3fd194.
 */
export enum FFModelLockAction {
  Read = 0,
  Write = 1,
}

/**
 * Opaque `FFSharedLock*` (Objective-C class `FFSharedLock`). External to this
 * file; the constructors accept it as an unknown-typed handle. The real object
 * is retained-into a CFMutableSet by CFSetAddValue (which retains via the
 * default kCFTypeSetCallBacks — but the ctor passes NULL callbacks, meaning the
 * set holds a BARE pointer identity, no retain performed here).
 * @Flexo class ref __OBJC_CLASS_$_FFSharedLock (loaded @0x3fd0b6 for the -isKindOfClass check).
 */
export type FFSharedLock = { readonly __brand: "FFSharedLock" };

/**
 * CFMutableSetRef holding lock objects. In the binary this is a raw CoreFoundation
 * handle; on the TS side we model it as an array of retained-Objective-C refs so
 * the ctor/dtor loops can be transcribed faithfully. `_objc_release` in D0/D1/D2
 * is invoked on this handle — we route through the extern stub below.
 */
export interface CFMutableSetRef {
  values: FFSharedLock[];
}

// -- Boundary throw-stubs for the CoreFoundation / Objective-C runtime -------
//
// Each stub cites the exact call address in the Flexo binary so `frontier.py`
// can enumerate the un-transcribed edges. We do NOT approximate — the runtime
// coverage is bounded here.

/**
 * _CFSetCreateMutable — @Flexo __stubs 0x14948cc.
 * Ctor calls with (allocator=NULL, capacity=0, callbacks=NULL) — a raw-pointer
 * identity set. Boundary throw-stub.
 */
export function CFSetCreateMutable_stub(): CFMutableSetRef {
  throw new Error(
    "CFSetCreateMutable @Flexo __stubs 0x14948cc not yet transcribed (CF runtime extern)",
  );
}

/**
 * _CFSetAddValue — @Flexo __stubs 0x14948c6.
 * Called once per lock added to the set. Boundary throw-stub.
 */
export function CFSetAddValue_stub(_set: CFMutableSetRef, _value: FFSharedLock): void {
  throw new Error(
    "CFSetAddValue @Flexo __stubs 0x14948c6 not yet transcribed (CF runtime extern)",
  );
}

/**
 * _objc_release — @Flexo literal-pool ptr (`callq *0x14f04d5(%rip)` @0x3fd22d in D0,
 * `*0x14f0525(%rip)` @0x3fd1dd in D1, `*0x14f0595(%rip)` @0x3fd16d in D2 — each
 * resolves to the same runtime entry, called through per-dtor GOT slots).
 * Boundary throw-stub.
 */
export function objc_release_stub(_ref: CFMutableSetRef): void {
  throw new Error(
    "objc_release @Flexo *0x14f04d5/0525/0595(%rip) not yet transcribed (ObjC runtime extern)",
  );
}

/**
 * _FFSharedWriteLockMultiple / _FFSharedReadLockMultiple — @Flexo direct calls,
 * `jmp` targets from the ctors' tail (@0x3fcf2a and @0x3fcf3c respectively) and
 * from performLock (@0x3fcf5f, @0x3fcf65). External Flexo entry points not yet
 * ported here — the lock primitives are their own subsystem.
 */
export function FFSharedWriteLockMultiple_stub(_set: CFMutableSetRef): void {
  throw new Error(
    "FFSharedWriteLockMultiple @Flexo direct-call target from 0x3fcf2a not yet transcribed",
  );
}
export function FFSharedReadLockMultiple_stub(_set: CFMutableSetRef): void {
  throw new Error(
    "FFSharedReadLockMultiple @Flexo direct-call target from 0x3fcf3c not yet transcribed",
  );
}
export function FFSharedWriteUnlockMultiple_stub(_set: CFMutableSetRef): void {
  throw new Error(
    "FFSharedWriteUnlockMultiple @Flexo direct-call target from 0x3fd1cd not yet transcribed",
  );
}
export function FFSharedReadUnlockMultiple_stub(_set: CFMutableSetRef): void {
  throw new Error(
    "FFSharedReadUnlockMultiple @Flexo direct-call target from 0x3fd1d4 not yet transcribed",
  );
}

/**
 * Cold-tail for the (FFSharedLock*, action) ctor when %rsi is NULL — @Flexo
 * 0x3fcf41 (`__ZN14_FFModelLockerC2EP12FFSharedLock17FFModelLockAction.cold.1`).
 * The compiler outlined this null-check trap; it does not return.
 */
export function FFModelLocker_C2_sharedLock_cold1_stub(): never {
  throw new Error(
    "_FFModelLocker::_FFModelLocker(FFSharedLock*, FFModelLockAction).cold.1 " +
      "@Flexo 0x3fcf41 not yet transcribed (outlined null-check trap; noreturn)",
  );
}

/**
 * Cold-tail for the (id<NSFastEnumeration>, action) ctor when %rsi is NULL —
 * @Flexo 0x3fd120. Same shape as the single-lock cold path.
 */
export function FFModelLocker_C2_nsFastEnum_cold1_stub(): never {
  throw new Error(
    "_FFModelLocker::_FFModelLocker(id<NSFastEnumeration>, FFModelLockAction).cold.1 " +
      "@Flexo 0x3fd120 not yet transcribed (outlined null-check trap; noreturn)",
  );
}

/**
 * -[id<NSFastEnumeration> countByEnumeratingWithState:objects:count:] —
 * @Flexo Obj-C message dispatched via `callq *0x14f06a5(%rip)` @0x3fd015 (first
 * call, seed) and `*0x14f0658(%rip)` @0x3fd062 (loop refill). The C2_nsFastEnum
 * ctor uses this to iterate the enumerable collection with a 16-object stack
 * buffer. Boundary throw-stub — the full NSFastEnumeration protocol emulation
 * is out of scope here.
 */
export function nsFastEnum_countByEnumeratingWithState_stub(
  _enumerable: unknown,
): number {
  throw new Error(
    "-[NSFastEnumeration countByEnumeratingWithState:objects:count:] " +
      "@Flexo *0x14f06a5(%rip) 0x3fd015 not yet transcribed",
  );
}

// -- The class ---------------------------------------------------------------

/**
 * _FFModelLocker — RAII multi-lock guard. The class has a real vtable installed
 * at +0x00 (the D0/D1/D2 dtor triad + destructor thunks), so it participates in
 * virtual destruction, but the only exported virtual member is the destructor
 * itself. `performLock` and `performUnlock` are non-virtual.
 *
 * Constructor semantics (both overloads):
 *   1. Install vtable at +0x00.
 *   2. Set +0x08 (set) to NULL, +0x10 (action) to the incoming action.
 *   3. Trap to `.cold.1` and never return if the collection arg is NULL.
 *   4. Create a fresh CFMutableSet with NULL callbacks and NULL allocator.
 *   5. Fill the set (single-value or via NSFastEnumeration loop).
 *   6. Store the set at +0x08.
 *   7. Dispatch on +0x10 to FFSharedWriteLockMultiple or FFSharedReadLockMultiple.
 *
 * Destructor semantics (all three D0/D1/D2 kinds — identical body, differ only
 * in the vptr they install and whether they `operator delete` the object at the
 * end):
 *   1. Rewrite +0x00 to the local vtable slot (standard C++-ABI dtor prologue).
 *   2. Dispatch on +0x10 to FFSharedWriteUnlockMultiple or FFSharedReadUnlockMultiple.
 *   3. `_objc_release(this.set)` — drops the CF/NS reference.
 *   4. (D0 only) `operator delete(this)` — frees the object.
 */
export class _FFModelLocker {
  /** +0x00 vptr — installed by ctor and reset by every dtor. Not modeled as data. */

  /**
   * +0x08 — CFMutableSet holding the FFSharedLock instances currently locked
   * by this guard. `null` between the initial write (`movq $0x0, 0x8(%rdi)`
   * @0x3fcfaf) and the CFSetCreateMutable write (`movq %r15, 0x8(%rbx)`
   * @0x3fcf13 / @0x3fd0e2). Non-null after successful construction.
   */
  set: CFMutableSetRef | null = null;

  /**
   * +0x10 — the FFModelLockAction (u32, only value 1 branches to WRITE).
   * Written by the ctor at @0x3fcef2 / @0x3fcfbe.
   */
  action: FFModelLockAction = FFModelLockAction.Read;

  /**
   * _FFModelLocker(FFSharedLock*, FFModelLockAction)  [C2]
   * @Flexo 0x00000000003fced0  (__ZN14_FFModelLockerC2EP12FFSharedLock17FFModelLockAction)
   *
   * C1 (@0x3fcf70) is a 5-instruction thunk that tail-jumps to C2 — same body,
   * different C++-ABI subtype (complete-object vs base-object). We port ONE
   * ctor and the C1 wrapper below simply forwards.
   *
   * DECODE (43 lines, raw-port/re/disasm .. or `awk` slice — see the C2 dump
   * embedded in the module header above):
   *   0x3fcee0  install vptr at (%rdi)                            → this.__vptr = ...
   *   0x3fceea  movq  $0x0, 0x8(%rdi)                             → this.set = null
   *   0x3fcef2  movl  %edx, 0x10(%rdi)                            → this.action = action
   *   0x3fcef5  testq %rsi, %rsi ; je 0x3fcf41                    → if (sharedLock == null) goto cold
   *   0x3fcf00  callq _CFSetCreateMutable(NULL, 0, NULL)          → set = CFSetCreateMutable()
   *   0x3fcf0e  callq _CFSetAddValue(set, sharedLock)             → set.add(sharedLock)
   *   0x3fcf13  movq  %r15, 0x8(%rbx)                             → this.set = set
   *   0x3fcf17  cmpl  $0x1, 0x10(%rbx) ; jne 0x3fcf2f             → if (action == WRITE)...
   *   0x3fcf2a  jmp   _FFSharedWriteLockMultiple(set)             → WriteLockMultiple(set)
   *   0x3fcf3c  jmp   _FFSharedReadLockMultiple(set)              → else ReadLockMultiple(set)
   *   0x3fcf41  callq .cold.1  ; jmp 0x3fcefa (unreachable)       → null-arg trap; noreturn
   */
  ctor_sharedLock(sharedLock: FFSharedLock | null, action: FFModelLockAction): void {
    // Vptr install at +0x00 is implicit in the JS class.
    // @Flexo 0x3fceea: this.set = null.
    this.set = null;
    // @Flexo 0x3fcef2: this.action = action (raw u32; enum coerces).
    this.action = action;
    // @Flexo 0x3fcef5: if (sharedLock == null) trap.
    if (sharedLock === null) {
      FFModelLocker_C2_sharedLock_cold1_stub(); // noreturn
    }
    // @Flexo 0x3fcf00: allocate CF set with NULL callbacks/allocator/capacity=0.
    const set = CFSetCreateMutable_stub();
    // @Flexo 0x3fcf0e: add the one lock.
    CFSetAddValue_stub(set, sharedLock as FFSharedLock);
    // @Flexo 0x3fcf13: this.set = set.
    this.set = set;
    // @Flexo 0x3fcf17: dispatch to WRITE or READ lock.
    if (this.action === FFModelLockAction.Write) {
      // @Flexo 0x3fcf2a: tail-jmp _FFSharedWriteLockMultiple(set).
      FFSharedWriteLockMultiple_stub(set);
    } else {
      // @Flexo 0x3fcf3c: tail-jmp _FFSharedReadLockMultiple(set).
      FFSharedReadLockMultiple_stub(set);
    }
  }

  /**
   * _FFModelLocker(FFSharedLock*, FFModelLockAction)  [C1]
   * @Flexo 0x00000000003fcf70  (__ZN14_FFModelLockerC1EP12FFSharedLock17FFModelLockAction)
   *
   * 5-instruction pushq/movq/popq/jmp thunk. Forwards to the C2 body. Kept as
   * its own entry point to preserve the ABI-visible symbol mapping.
   *
   * DECODE:
   *   0x3fcf70  pushq %rbp ; movq %rsp, %rbp ; popq %rbp ; jmp _FFModelLockerC2E...
   */
  ctor_sharedLock_C1(sharedLock: FFSharedLock | null, action: FFModelLockAction): void {
    this.ctor_sharedLock(sharedLock, action);
  }

  /**
   * _FFModelLocker(id<NSFastEnumeration>, FFModelLockAction)  [C2]
   * @Flexo 0x00000000003fcf80  (__ZN14_FFModelLockerC2EPU28objcproto17NSFastEnumeration11objc_object17FFModelLockAction)
   *
   * Iterates the enumerable via NSFastEnumeration, filters to FFSharedLock
   * instances (`-isKindOfClass:` check), adds each to a fresh CFMutableSet,
   * then locks. Full 105-line dump embedded in the module header above.
   *
   * DECODE (control flow — the inner loop and Obj-C dispatch are boundary-stubbed):
   *   0x3fcfa5..0xfcfbe  install vptr, zero set, store action.
   *   0x3fcfc1  testq %rsi, %rsi ; je 0x3fd120  → if (enumerable == null) trap-cold.
   *   0x3fcfd0  callq _CFSetCreateMutable(NULL, 0, NULL)  → set = CFSetCreateMutable().
   *   0x3fcfd8..fcff0  xorps xmm0 + 4× movaps -0x100/-0xf0/-0xe0/-0xd0(%rbp)  → zero the
   *                    NSFastEnumerationState struct (64B) + 16-slot stack objects buffer
   *                    (16 × 8B = 128B; total scratch = 208B under the frame).
   *   0x3fd015  callq *SEL(countByEnumeratingWithState:objects:count:)  → seed the enumeration.
   *   0x3fd01b  testq %rax, %rax ; je 0x3fd0db  → if (count == 0) skip loop, go to lock.
   *   loop {
   *     - refill via same SEL when the inner index reaches count (@0x3fd062).
   *     - for each element at objects[i]:
   *         @0x3fd0b6  load _OBJC_CLASS_$_FFSharedLock
   *         @0x3fd0bd  callq _objc_opt_class(FFSharedLock)
   *         @0x3fd0cd  callq _objc_opt_isKindOfClass(element, FFSharedLock class)
   *         if (!isKind) element := NULL (kept in %r13, still added but as NULL).
   *         @0x3fd086  callq _CFSetAddValue(set, element)
   *   }
   *   0x3fd0db  movq %r15, 0x8(%rax)  → this.set = set.
   *   0x3fd0e6  cmpl $0x1, 0x10(%rax) ; branch  → dispatch to Write/ReadLockMultiple.
   */
  ctor_nsFastEnum(enumerable: unknown | null, action: FFModelLockAction): void {
    // @Flexo 0x3fcfaf: this.set = null.
    this.set = null;
    // @Flexo 0x3fcfbe: this.action = action.
    this.action = action;
    // @Flexo 0x3fcfc1: if (enumerable == null) trap.
    if (enumerable === null) {
      FFModelLocker_C2_nsFastEnum_cold1_stub(); // noreturn
    }
    // @Flexo 0x3fcfd0: create empty CF set.
    const set = CFSetCreateMutable_stub();
    // @Flexo 0x3fd015 / 0x3fd062 (NSFastEnumeration loop) + 0x3fd086 (_CFSetAddValue) —
    // filtering to FFSharedLock via isKindOfClass. The full inner loop is a boundary
    // throw-stub because it depends on the NSFastEnumeration protocol runtime which is
    // not yet transcribed on the TS side. See the DECODE block above for the exact call
    // sequence and offsets.
    nsFastEnum_countByEnumeratingWithState_stub(enumerable);
    // @Flexo 0x3fd0db: this.set = set.
    this.set = set;
    // @Flexo 0x3fd0e6: dispatch WRITE/READ.
    if (this.action === FFModelLockAction.Write) {
      // @Flexo 0x3fd0ef: FFSharedWriteLockMultiple(set).
      FFSharedWriteLockMultiple_stub(set);
    } else {
      // @Flexo 0x3fd0f9: FFSharedReadLockMultiple(set).
      FFSharedReadLockMultiple_stub(set);
    }
  }

  /**
   * _FFModelLocker(id<NSFastEnumeration>, FFModelLockAction)  [C1]
   * @Flexo 0x00000000003fd130  (thunk to C2 — 5-instruction jmp).
   */
  ctor_nsFastEnum_C1(enumerable: unknown | null, action: FFModelLockAction): void {
    this.ctor_nsFastEnum(enumerable, action);
  }

  /**
   * _FFModelLocker::performLock()
   * @Flexo 0x00000000003fcf50  (__ZN14_FFModelLocker11performLockEv)
   *
   * DECODE (11 lines, raw-port/re/disasm/Flexo._FFModelLocker.performLock.s):
   *   0x3fcf54  cmpl  $0x1, 0x10(%rdi)                → compare action against WRITE
   *   0x3fcf58  movq  0x8(%rdi), %rdi                 → set = this.set
   *   0x3fcf5c  jne   0x3fcf64                        → branch to READ if action != 1
   *   0x3fcf5f  jmp   _FFSharedWriteLockMultiple      → tail-call WRITE
   *   0x3fcf65  jmp   _FFSharedReadLockMultiple       → tail-call READ
   * NB: %rdi is REPLACED by this.set before the branch (movq @0x3fcf58 happens
   * BEFORE both branch tails), so both tails receive the set as their sole arg.
   */
  performLock(): void {
    // @Flexo 0x3fcf54..3fcf5c: read action, load set, dispatch.
    const set = this.set;
    if (set === null) {
      // The binary would deref null and crash here — model that as a throw so a
      // faithful TS caller sees the same "must construct first" precondition.
      throw new Error(
        "_FFModelLocker::performLock @Flexo 0x3fcf50 called with this.set == null " +
          "(binary would fault on movq 0x8(%rdi))",
      );
    }
    if (this.action === FFModelLockAction.Write) {
      FFSharedWriteLockMultiple_stub(set);
    } else {
      FFSharedReadLockMultiple_stub(set);
    }
  }

  /**
   * _FFModelLocker::performUnlock()
   * @Flexo 0x00000000003fd190  (__ZN14_FFModelLocker13performUnlockEv)
   *
   * DECODE (11 lines, raw-port/re/disasm/Flexo._FFModelLocker.performUnlock.s):
   *   0x3fd194  cmpl  $0x1, 0x10(%rdi)                → compare action against WRITE
   *   0x3fd198  movq  0x8(%rdi), %rdi                 → set = this.set
   *   0x3fd19c  jne   0x3fd1a4
   *   0x3fd19f  jmp   _FFSharedWriteUnlockMultiple
   *   0x3fd1a5  jmp   _FFSharedReadUnlockMultiple
   */
  performUnlock(): void {
    // @Flexo 0x3fd194..3fd19c: read action, load set, dispatch.
    const set = this.set;
    if (set === null) {
      throw new Error(
        "_FFModelLocker::performUnlock @Flexo 0x3fd190 called with this.set == null " +
          "(binary would fault on movq 0x8(%rdi))",
      );
    }
    if (this.action === FFModelLockAction.Write) {
      FFSharedWriteUnlockMultiple_stub(set);
    } else {
      FFSharedReadUnlockMultiple_stub(set);
    }
  }

  /**
   * _FFModelLocker::~_FFModelLocker()  [D1 — complete-object dtor]
   * @Flexo 0x00000000003fd1b0  (__ZN14_FFModelLockerD1Ev)
   *
   * DECODE (23 lines):
   *   0x3fd1b9  install D1 vptr at (%rdi)                       (leaq 0x14fe338(%rip))
   *   0x3fd1c3  cmpl  $0x1, 0x10(%rdi) ; movq 0x8(%rdi), %rdi
   *   0x3fd1cd  callq _FFSharedWriteUnlockMultiple(set)    (WRITE branch)
   *   0x3fd1d4  callq _FFSharedReadUnlockMultiple(set)     (READ branch)
   *   0x3fd1d9  callq *_objc_release(GOT) with set as arg
   *   0x3fd1e9  retq
   *
   * D2 (@0x3fd140) is byte-identical to D1 except the vptr slot address:
   *   leaq 0x14fe3a8(%rip), _objc_release *0x14f0595(%rip). Same body — the two
   *   entry points exist because the C++-ABI emits both complete-object (D1)
   *   and base-object (D2) destructors even when they're identical. We port the
   *   shared body once and expose both entry points.
   */
  destroy_D1(): void {
    // @Flexo 0x3fd1b9: reset vptr to D1's vtable slot (implicit in JS class model).
    // @Flexo 0x3fd1c3: dispatch WRITE/READ unlock on action.
    const set = this.set;
    if (set !== null) {
      if (this.action === FFModelLockAction.Write) {
        // @Flexo 0x3fd1cd: _FFSharedWriteUnlockMultiple(set).
        FFSharedWriteUnlockMultiple_stub(set);
      } else {
        // @Flexo 0x3fd1d4: _FFSharedReadUnlockMultiple(set).
        FFSharedReadUnlockMultiple_stub(set);
      }
      // @Flexo 0x3fd1dd: _objc_release(set) — drop the CF/NS reference.
      objc_release_stub(set);
    }
    this.set = null;
  }

  /**
   * _FFModelLocker::~_FFModelLocker()  [D2 — base-object dtor]
   * @Flexo 0x00000000003fd140  (__ZN14_FFModelLockerD2Ev)
   *
   * Byte-identical body to D1 except the vptr write @0x3fd149 uses
   * `leaq 0x14fe3a8(%rip)` (vs D1's 0x14fe338). Shares implementation with D1.
   */
  destroy_D2(): void {
    // Same body as D1 — the two entry points exist to match the C++-ABI's
    // separate complete-object and base-object destructor emission. Vptr slot
    // differs (0x14fe3a8 vs 0x14fe338) but resolves to the same class vtable.
    this.destroy_D1();
  }

  /**
   * _FFModelLocker::~_FFModelLocker()  [D0 — deleting dtor]
   * @Flexo 0x00000000003fd200  (__ZN14_FFModelLockerD0Ev)
   *
   * D0 is the C++-ABI "deleting destructor" that runs D1's body then
   * `operator delete(this)` on the object. In TS the class is heap-managed by
   * the JS GC, so the `__ZdlPv` tail-call is a no-op semantically — we still
   * model it as a boundary throw-stub so a caller wiring the real allocator
   * sees the missing edge.
   *
   * DECODE (24 lines):
   *   0x3fd209  install D0 vptr at (%rdi)               (leaq 0x14fe2e8(%rip))
   *   0x3fd213..3fd224  same unlock dispatch as D1/D2
   *   0x3fd22d  callq *_objc_release(GOT) on set
   *   0x3fd23c  jmp   __ZdlPv (operator delete)          — frees `this`
   */
  destroy_D0(): void {
    // Run the shared unlock+release body once.
    this.destroy_D1();
    // @Flexo 0x3fd23c: operator delete(this). GC-managed on the TS side —
    // model as a stub so the missing edge is visible to frontier.py.
    _FFModelLocker_operatorDelete_stub(this);
  }
}

/**
 * `operator delete(void*)` — @Flexo __stubs 0x1497404 (`__ZdlPv`), tail-jumped
 * from D0 at 0x3fd23c. Boundary throw-stub: TS objects are GC-managed, so this
 * is a no-op on the JS side; we route through a stub to keep the untranscribed
 * runtime edge explicit.
 */
export function _FFModelLocker_operatorDelete_stub(_this: _FFModelLocker): void {
  throw new Error(
    "operator delete @Flexo __stubs 0x1497404 tail-called from ~_FFModelLocker D0 @0x3fd23c " +
      "not yet transcribed (allocator extern)",
  );
}
