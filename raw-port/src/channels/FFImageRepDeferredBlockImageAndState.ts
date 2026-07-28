// FFImageRepDeferredBlockImageAndState — Flexo's "block work is happening
// on another thread; wait for it, then hand back the resulting FFImage"
// primitive.  Backs the deferred-image machinery for FFImageRep.
//
// Framework: Final Cut Pro / Flexo.framework.
// Source disassembly (all 5 methods) saved under raw-port/re/disasm/:
//   Flexo.FFImageRepDeferredBlockImageAndState.getImageIfComplete.s
//   Flexo.FFImageRepDeferredBlockImageAndState.setState.s
//   Flexo.FFImageRepDeferredBlockImageAndState.performWorkIfNeeded.s
//   Flexo.FFImageRepDeferredBlockImageAndState.waitForStateWithTimeout.s
//   Flexo.FFImageRepDeferredBlockImageAndState.validNextState.s
//
// Entry points transcribed here (per `raw-port/army/tools/brief.py Flexo
// FFImageRepDeferredBlockImageAndState`):
//   0x00000000007490e0  getImageIfComplete()
//   0x0000000000749190  setState(DeferredBlockImageState)
//   0x0000000000749200  performWorkIfNeeded(FxDeviceSet const*, PCNSRef<FFImage*> (^)())
//   0x0000000000749460  waitForStateWithTimeout(DeferredBlockImageState, NSDate*)
//   0x0000000000749560  validNextState(DeferredBlockImageState, DeferredBlockImageState)
//
// STRUCT LAYOUT (recovered from the five bodies): the class inherits from
// FFSynchronizable; the low bytes 0x00..0x8f are the base, with cond at
// +0x40, owner at +0x70, depth at +0x78 (pinned in FFSynchronizer.ts).
//   +0x90  uint32_t                 state          (DeferredBlockImageState)
//                                                    Read @0x749112,
//                                                    @0x7491ae, @0x749235,
//                                                    @0x7494b0, @0x749514.
//                                                    Written @0x7491b7 (setState),
//                                                    @0x7492bd (perform 0→1),
//                                                    @0x74938a (perform 1→2).
//   +0x98  PCNSRef<FFImage*>        image          (16 bytes on x86_64).
//                                                    LEA @0x749127 for
//                                                    getImageIfComplete's
//                                                    copy-assign source; LEA
//                                                    @0x74928a for the wait
//                                                    branch's read; LEA
//                                                    @0x74933b for the write
//                                                    of the block's result.
//   +0xa0  double                   lastWorkMs     Written @0x74935c
//                                                    (`movsd %xmm0,
//                                                    0xa0(%r14)`).
//   +0xa8  FxDeviceSet const*       lastDeviceSet  Written @0x749369
//                                                    (`movq %rax, 0xa8(%r14)`).
//   +0xb0  void*                    workerThread   Cached during the
//                                                    InProgress window;
//                                                    written @0x7492de (from
//                                                    FFThreadCurrent),
//                                                    cleared @0x7493a6.
//
// sizeof(FFImageRepDeferredBlockImageAndState) >= 0xb8 bytes.
//
// ENUM: DeferredBlockImageState (recovered from the disasm literals + the
// initializer_list @0x7496f0-@0x7497ba):
//   0 = Empty        first-state branch @0x74923c
//   1 = InProgress   wait-for-others gate @0x749241; transition-in @0x7492bd
//   2 = Complete     return-image gate @0x749121; transition-in @0x74938a
//
// The state transitions authorised by `sValidStateTransitions` (built in
// validNextState @0x7496f0-@0x7497f4 as a three-entry map<S,set<S>>) are:
//   0 → {1}  from `movl $0x0, -0xac; movl $0x1, -0xa8` + set-init @0x749719
//   1 → {2}  from `movl $0x1, -0xa4; movl $0x2, -0xa0` + set-init @0x74976d
//   2 → {2}  from `movl $0x2, -0x9c; movl $0x2, -0x98` + set-init @0x7497ba
//
// UNRESOLVED CALLEES (throw-stubs below, each citing its @0xADDR):
//   FFSynchronizable::Lock             @Flexo callsite 0x749105
//   FFSynchronizable::Unlock           @Flexo callsite 0x74911c
//   PCNSRefImpl::operator=(const&)     @Flexo stub 0x1496120 (call @0x749131)
//   PCNSRefImpl::operator=(&&)         @Flexo stub 0x149611a (call @0x749313)
//   PCNSRefImpl::release               @Flexo stub 0x1496f96 (call @0x749170)
//   FFCreateThreadPriorityOverride     @Flexo call @0x74925e (extern C)
//   FFReleaseThreadPriorityOverrideGroup @Flexo call @0x74929c (extern C)
//   FFGetHostTimeSeconds               @Flexo call @0x7492f6 & @0x749321
//   FFThreadCurrent                    @Flexo call @0x7492d9
//   +[NSDate distantFuture]            @Flexo Obj-C msgSend @0x749274
//                                        selref VA 0x1BBC1F8 → "distantFuture"
//   -[NSDate timeIntervalSinceNow]     @Flexo Obj-C msgSend @0x749490 & @0x7494ff
//                                        selref VA 0x1BB91B8 → "timeIntervalSinceNow"
//   pthread_cond_broadcast             @Flexo stub 0x1497a70
//
// CONST TABLE (grounded by resolve.py + hand-decoded RIP-relative disps):
//   VA 0x156CAC0 : double 1000.0 (u64 0x408f400000000000) — seconds→ms scale.
//                  Loaded @0x74935c (`mulsd 0xe23764(%rip), %xmm0`),
//                  @0x749496 (`mulsd 0xe23622(%rip), %xmm0`),
//                  @0x7494c7 (`minsd 0xe235f1(%rip), %xmm0`) — cap the wait
//                  timeout at 1000 ms per iteration.
//                  @0x749502 (`mulsd 0xe235b6(%rip), %xmm0`).
//   VA 0x156CAC8 : double 2^63 (u64 0x43e0000000000000) — the clang
//                  `double→uint32` idiom sentinel (INT64_MIN when the source
//                  exceeds INT64_MAX).  Loaded @0x7494db (`subsd
//                  0xe235e5(%rip), %xmm0`).
//
// PORTING NOTES:
// * Every method runs inside an FFSynchronizer-scoped critical section
//   (lock on entry, unlock on exit).  We mirror the RAII with
//   `try { Lock(); … } finally { Unlock(); }`.
// * waitForStateWithTimeout's inner loop caps each iteration's timeout at
//   1000 ms (@0x7494c7) so a stalled worker still wakes up to re-check.
// * performWorkIfNeeded's three state paths correspond exactly to the asm
//   branches on the entry-time state snapshot.
// * `movq $0x0, (%rdi)` at the top of getImageIfComplete (@0x7490f3) and
//   performWorkIfNeeded (@0x74921e) zeroes the RVO out-slot's PCNSRef
//   payload before Lock().  We model that by initializing `out` up front.
// * validNextState uses a function-local static `map<S,set<S>>` behind a
//   `__cxa_guard_acquire`.  We build the same table at module load — the
//   red-black-tree scaffolding is a compilation artifact, not part of the
//   observable contract.

import { FFSynchronizer, type FFSynchronizable } from "./FFSynchronizer";

// ─────────────────────────────────────────────────────────────────────────
// Opaque handle types (fully decoded elsewhere or not yet in the ledger).
// ─────────────────────────────────────────────────────────────────────────

/** FFSynchronizable — Flexo's cond+mutex+depth base class.  Re-exported from FFSynchronizer.ts.  See @0x749105. */
export type { FFSynchronizable };

/** FxDeviceSet — opaque device set pointer cached at +0xa8 (@0x749369). */
export type FxDeviceSet = { readonly __fxDeviceSet: unique symbol };

/** FFImage — held via PCNSRef at +0x98 (@0x749127, @0x74928a, @0x74933b). */
export type FFImage = { readonly __ffImage: unique symbol };

/**
 * PCNSRef<FFImage*> — ProCore's reference-counted smart pointer, 16 bytes
 * on x86_64 (matches the 0x98→0xa8 gap in the struct).  The concrete
 * assign/release ops are throw-stubs (@0x1496120, @0x149611a, @0x1496f96).
 */
export interface PCNSRefFFImage {
  ptr: FFImage | null;
  __pcnsref: true;
}

/** NSDate — opaque.  Used @0x749274 (distantFuture) & @0x749490 (timeIntSince). */
export type NSDate = { readonly __nsDate: unique symbol };

/**
 * `PCNSRef<FFImage*> (^)()` — the block closure.  Invoked at @0x749307
 * (`callq *0x10(%r12)` — block invoke slot).  Modelled as a JS function.
 */
export type DeferredImageBlock = () => PCNSRefFFImage;

// ─────────────────────────────────────────────────────────────────────────
// State enum.
// ─────────────────────────────────────────────────────────────────────────

/** DeferredBlockImageState — decoded from the initializer_list @0x7496fa-@0x7497ba. */
export enum DeferredBlockImageState {
  Empty = 0,       // @0x74923c initial-state branch (`testl %r15d, %r15d; je …`)
  InProgress = 1,  // @0x749241 wait gate; @0x7492bd 0→1 transition write
  Complete = 2,    // @0x749121 return gate; @0x74938a 1→2 transition write
}

// ─────────────────────────────────────────────────────────────────────────
// External throw-stubs (all unresolved callees cited by @0xADDR).
// ─────────────────────────────────────────────────────────────────────────

/** FFSynchronizable::Lock — mangled __ZN16FFSynchronizable4LockEv.  Not yet transcribed. Callsite @0x749105. */
function FFSynchronizable_Lock(_sync: FFSynchronizable): void {
  throw new Error("FFImageRepDeferredBlockImageAndState: FFSynchronizable::Lock @Flexo callsite 0x749105 not yet transcribed");
}

/** FFSynchronizable::Unlock — mangled __ZN16FFSynchronizable6UnlockEv.  Not yet transcribed. Callsite @0x74911c. */
function FFSynchronizable_Unlock(_sync: FFSynchronizable): void {
  throw new Error("FFImageRepDeferredBlockImageAndState: FFSynchronizable::Unlock @Flexo callsite 0x74911c not yet transcribed");
}

/** PCNSRefImpl::operator=(PCNSRefImpl const&) @Flexo stub 0x1496120 (@0x749131 in getImage). Not yet transcribed. */
function PCNSRefImpl_assign_copy(_dst: PCNSRefFFImage, _src: PCNSRefFFImage): void {
  throw new Error("FFImageRepDeferredBlockImageAndState: PCNSRefImpl::operator=(const&) @Flexo stub 0x1496120 not yet transcribed");
}

/** PCNSRefImpl::operator=(PCNSRefImpl&&) @Flexo stub 0x149611a (@0x749313 in perform). Not yet transcribed. */
function PCNSRefImpl_assign_move(_dst: PCNSRefFFImage, _src: PCNSRefFFImage): void {
  throw new Error("FFImageRepDeferredBlockImageAndState: PCNSRefImpl::operator=(&&) @Flexo stub 0x149611a not yet transcribed");
}

/** PCNSRefImpl::release() const @Flexo stub 0x1496f96 (@0x749170 unwind). Not yet transcribed. */
function PCNSRefImpl_release(_r: PCNSRefFFImage): void {
  throw new Error("FFImageRepDeferredBlockImageAndState: PCNSRefImpl::release @Flexo stub 0x1496f96 not yet transcribed");
}

/** FFCreateThreadPriorityOverride @Flexo call @0x74925e (extern C).  Not yet transcribed. */
function FFCreateThreadPriorityOverride(_handleSlot: object, _elevate: number, _label: string): unknown {
  throw new Error("FFImageRepDeferredBlockImageAndState: FFCreateThreadPriorityOverride @Flexo callsite 0x74925e not yet transcribed");
}

/** FFReleaseThreadPriorityOverrideGroup @Flexo call @0x74929c (extern C).  Not yet transcribed. */
function FFReleaseThreadPriorityOverrideGroup(_token: unknown): void {
  throw new Error("FFImageRepDeferredBlockImageAndState: FFReleaseThreadPriorityOverrideGroup @Flexo callsite 0x74929c not yet transcribed");
}

/** FFGetHostTimeSeconds @Flexo call @0x7492f6 and @0x749321.  Not yet transcribed. */
function FFGetHostTimeSeconds(): number {
  throw new Error("FFImageRepDeferredBlockImageAndState: FFGetHostTimeSeconds @Flexo callsite 0x7492f6 not yet transcribed");
}

/** FFThreadCurrent @Flexo call @0x7492d9.  Not yet transcribed. */
function FFThreadCurrent(): unknown {
  throw new Error("FFImageRepDeferredBlockImageAndState: FFThreadCurrent @Flexo callsite 0x7492d9 not yet transcribed");
}

/** +[NSDate distantFuture] @Flexo Obj-C msgSend @0x749274 (selref VA 0x1BBC1F8).  Not yet transcribed. */
function NSDate_distantFuture(): NSDate {
  throw new Error("FFImageRepDeferredBlockImageAndState: +[NSDate distantFuture] @Flexo msgSend 0x749274 not yet transcribed");
}

/** -[NSDate timeIntervalSinceNow] @Flexo msgSend @0x749490 & @0x7494ff (selref VA 0x1BB91B8).  Not yet transcribed. */
function NSDate_timeIntervalSinceNow(_self: NSDate): number {
  throw new Error("FFImageRepDeferredBlockImageAndState: -[NSDate timeIntervalSinceNow] @Flexo msgSend 0x749490 not yet transcribed");
}

/** pthread_cond_broadcast @Flexo stub 0x1497a70 (@0x7491c2, @0x7492cc, @0x749399).  Not yet transcribed. */
function pthread_cond_broadcast(_cond: object): void {
  throw new Error("FFImageRepDeferredBlockImageAndState: pthread_cond_broadcast @Flexo stub 0x1497a70 not yet transcribed");
}

// ─────────────────────────────────────────────────────────────────────────
// Static state-transition table (see validNextState below).
// ─────────────────────────────────────────────────────────────────────────

/**
 * `sValidStateTransitions` — the function-local static `map<S,set<S>>`
 * built at @0x7496f0-@0x7497f4.  Each set contains exactly one element
 * in the observed binary; see the block comment for the pair decode.
 * We eagerly initialise at module load; the C++ side pays a `__cxa_guard`
 * on first call.  Address citations preserved in the block comment above.
 */
const sValidStateTransitions: Map<number, Set<number>> = new Map<number, Set<number>>([
  [DeferredBlockImageState.Empty, new Set<number>([DeferredBlockImageState.InProgress])],
  [DeferredBlockImageState.InProgress, new Set<number>([DeferredBlockImageState.Complete])],
  [DeferredBlockImageState.Complete, new Set<number>([DeferredBlockImageState.Complete])],
]);

// ─────────────────────────────────────────────────────────────────────────
// Class.
// ─────────────────────────────────────────────────────────────────────────

/**
 * Faithful transcription of Flexo's FFImageRepDeferredBlockImageAndState.
 * Every method mirrors the asm structure cited above.  Struct offsets in
 * the block comment are enforced by the field names.
 */
export class FFImageRepDeferredBlockImageAndState {
  // +0x00..+0x8f — inherited FFSynchronizable base; modelled as a
  // self-reference so Lock/Unlock throw-stubs receive the same identity.
  private readonly baseSync: FFSynchronizable;

  /** +0x90 — DeferredBlockImageState.  Written in setState @0x7491b7, in perform @0x7492bd and @0x74938a. */
  public state: DeferredBlockImageState;

  /** +0x98 — the produced FFImage, held by PCNSRef. */
  public image: PCNSRefFFImage;

  /** +0xa0 — lastWorkMs, `movsd %xmm0, 0xa0(%r14)` @0x74935c. */
  public lastWorkMs: number;

  /** +0xa8 — lastDeviceSet, `movq %rax, 0xa8(%r14)` @0x749369. */
  public lastDeviceSet: FxDeviceSet | null;

  /** +0xb0 — workerThread token; set @0x7492de, cleared @0x7493a6. */
  public workerThread: unknown;

  constructor() {
    this.baseSync = this as unknown as FFSynchronizable;
    this.state = DeferredBlockImageState.Empty;
    this.image = { ptr: null, __pcnsref: true };
    this.lastWorkMs = 0;
    this.lastDeviceSet = null;
    this.workerThread = 0;
  }

  /**
   * `getImageIfComplete()` @Flexo 0x00000000007490e0.
   *
   * Mirrors the disasm:
   *   @0x7490f3  zero the RVO PCNSRef slot.
   *   @0x749105  Lock() — inline FFSynchronizer(this) ctor.
   *   @0x74910d  Lock() — second inline FFSynchronizer over the same this
   *              (nested RAII scope in the source; recursive lock).
   *   @0x749112  snapshot state into %r15d.
   *   @0x74911c  Unlock() — inner FFSynchronizer dtor.
   *   @0x749121  compare snapshot == 2 (Complete); jne to the outer Unlock.
   *   @0x749127-@0x749131  PCNSRefImpl::operator=(const&) copies +0x98 (this->image)
   *              into the RVO slot.
   *   @0x749139  Unlock() — outer.
   *   @0x74913e  return the RVO slot pointer (%rax = %rbx).
   */
  getImageIfComplete(): PCNSRefFFImage {
    // @0x7490f3 — zero the RVO PCNSRef payload.
    const out: PCNSRefFFImage = { ptr: null, __pcnsref: true };
    // @0x749105 + @0x74910d — two nested Lock() acquires (recursive).
    FFSynchronizable_Lock(this.baseSync);
    FFSynchronizable_Lock(this.baseSync);
    try {
      // @0x749112 — snapshot state under the inner lock.
      const r15d: number = this.state;
      // @0x74911c — inner Unlock() (FFSynchronizer dtor for the inner frame).
      FFSynchronizable_Unlock(this.baseSync);
      // @0x749121 — `cmpl $0x2, %r15d; jne 0x749136`.
      if (r15d === DeferredBlockImageState.Complete) {
        // @0x749127-@0x749131 — copy-assign this->image into out.
        PCNSRefImpl_assign_copy(out, this.image);
      }
    } finally {
      // @0x749139 — outer Unlock() (also on the exception unwind path @0x749168).
      FFSynchronizable_Unlock(this.baseSync);
    }
    // @0x74913e — return the RVO slot.
    return out;
  }

  /**
   * `setState(DeferredBlockImageState)` @Flexo 0x0000000000749190.
   *
   *   @0x7491a9  Lock().
   *   @0x7491ae  cmp newState vs current; je skip both write+broadcast.
   *   @0x7491b7  write new state.
   *   @0x7491c2  pthread_cond_broadcast(&this->cond); cond lives at +0x40
   *              (LEA 0x40(%rbx) @0x7491be).
   *   @0x7491ca  Unlock() via FFSynchronizer dtor.
   * Exception unwind @0x7491d8-@0x7491e7 → the finally-Unlock.
   */
  setState(newState: DeferredBlockImageState): void {
    FFSynchronizable_Lock(this.baseSync);
    try {
      if (this.state !== newState) {
        // @0x7491b7 — `movl %r14d, 0x90(%rbx)`.
        this.state = newState;
        // @0x7491be-@0x7491c2 — pthread_cond_broadcast(&this->cond).
        pthread_cond_broadcast(this.baseSync);
      }
    } finally {
      FFSynchronizable_Unlock(this.baseSync);
    }
  }

  /**
   * `performWorkIfNeeded(FxDeviceSet const*, PCNSRef<FFImage*> (^)())`
   *   @Flexo 0x0000000000749200.
   *
   * Three state-based branches on the entry-time snapshot (%r15d),
   * decoded from @0x749235-@0x7492ed:
   *   state == 0 (Empty)      →  transition 0→1 under an inner lock,
   *                              cache workerThread = FFThreadCurrent(),
   *                              Unlock, run the block, cache result +
   *                              elapsed ms + deviceSet, transition 1→2,
   *                              clear workerThread.
   *   state == 1 (InProgress) →  another thread is running the block:
   *                              raise priority via
   *                              FFCreateThreadPriorityOverride, wait for
   *                              Complete forever
   *                              (waitForStateWithTimeout(2, [NSDate
   *                              distantFuture])), then copy this->image
   *                              into out; release the priority group.
   *   state >= 2 (Complete)   →  fall through to Unlock and return the
   *                              empty out slot (callers use
   *                              getImageIfComplete() to retrieve it).
   *
   * `jg 0x7492e5` @0x749245 folds the state>=2 case into the epilogue.
   */
  performWorkIfNeeded(
    deviceSet: FxDeviceSet | null,
    block: DeferredImageBlock,
  ): PCNSRefFFImage {
    // @0x74921e — zero the RVO PCNSRef payload.
    const out: PCNSRefFFImage = { ptr: null, __pcnsref: true };

    // We need to carry the entry-time state snapshot (%r15d) across the
    // outer Unlock — the asm keeps it in a callee-saved register.  We
    // stash it here.
    let stateAtEntry: number = DeferredBlockImageState.Empty;

    // @0x749230 — outer Lock().
    FFSynchronizable_Lock(this.baseSync);
    try {
      // @0x749235 — `movl 0x90(%r14), %r15d`.
      stateAtEntry = this.state;

      // @0x74923c — `testl %r15d, %r15d ; je 0x7492a3` (Empty path).
      if (stateAtEntry === DeferredBlockImageState.Empty) {
        // @0x7492a3-@0x7492ae — inner FFSynchronizer(this); Lock().
        FFSynchronizable_Lock(this.baseSync);
        try {
          // @0x7492b3-@0x7492bb — double-checked-locking re-read.
          if (this.state !== DeferredBlockImageState.InProgress) {
            // @0x7492bd — `movl $0x1, 0x90(%r14)`.
            this.state = DeferredBlockImageState.InProgress;
            // @0x7492c8-@0x7492cc — pthread_cond_broadcast(&cond).
            pthread_cond_broadcast(this.baseSync);
          }
        } finally {
          // @0x7492d4 — inner Unlock().
          FFSynchronizable_Unlock(this.baseSync);
        }
        // @0x7492d9-@0x7492de — workerThread = FFThreadCurrent().
        this.workerThread = FFThreadCurrent();
      } else if (stateAtEntry <= DeferredBlockImageState.InProgress) {
        // @0x749241 — `cmpl $0x1, %r15d ; jg 0x7492e5`; combined with the
        // je above, this arm is state == 1 (InProgress).
        // @0x74924b-@0x74925e — priority boost.
        const token: unknown = FFCreateThreadPriorityOverride(
          this,
          1,
          "boost thread doing FFImageRepDeferredBlock execution",
        );
        // @0x749266-@0x749274 — deadline = +[NSDate distantFuture].
        const deadline: NSDate = NSDate_distantFuture();
        // @0x74927a-@0x749285 — waitForStateWithTimeout(2, deadline).
        // Discarded return per the asm — the state re-check is authoritative.
        this.waitForStateWithTimeout(DeferredBlockImageState.Complete, deadline);
        // @0x74928a-@0x749294 — out = this->image (const& assign).
        PCNSRefImpl_assign_copy(out, this.image);
        // @0x749299-@0x74929c — release priority.
        FFReleaseThreadPriorityOverrideGroup(token);
      }
      // else stateAtEntry >= 2 (Complete): fall through to the epilogue.

      // @0x7492e5-@0x7492e8 — outer Unlock() BEFORE running the block.
    } finally {
      FFSynchronizable_Unlock(this.baseSync);
    }

    // @0x7492ed-@0x7492f0 — `testl %r15d, %r15d ; jne 0x7493b9`.
    // Only the Empty branch continues; the others jump to the return.
    if (stateAtEntry === DeferredBlockImageState.Empty) {
      // @0x7492f6-@0x7492fb — t0 = FFGetHostTimeSeconds().
      const t0: number = FFGetHostTimeSeconds();

      // @0x749300-@0x749307 — call the block: `callq *0x10(%r12)` (block
      // ABI invoke slot).  The output goes into the -0x38(%rbp) RVO temp.
      const blockOut: PCNSRefFFImage = block();

      // @0x74930c-@0x749313 — move-assign the block's output into out.
      PCNSRefImpl_assign_move(out, blockOut);
      // @0x749318-@0x74931c — release the block's temporary.
      PCNSRefImpl_release(blockOut);

      // @0x749321-@0x749326 — t1 = FFGetHostTimeSeconds().
      const t1: number = FFGetHostTimeSeconds();

      // @0x749333 — inner Lock() (new FFSynchronizer scope).
      FFSynchronizable_Lock(this.baseSync);
      try {
        // @0x74933b-@0x749345 — this->image = out (const& assign).
        PCNSRefImpl_assign_copy(this.image, out);
        // @0x74934a-@0x74935c — this->lastWorkMs = (t1 - t0) * 1000.0.
        // `mulsd 0xe23764(%rip)` loads the double @VA 0x156CAC0 = 1000.0
        // (u64 0x408f400000000000), documented in the CONST TABLE.
        this.lastWorkMs = (t1 - t0) * 1000.0;
        // @0x749365-@0x749369 — this->lastDeviceSet = caller's deviceSet.
        this.lastDeviceSet = deviceSet;
        // @0x74937b — inner Lock() again for the 1→2 transition.
        FFSynchronizable_Lock(this.baseSync);
        try {
          // @0x749380-@0x749388 — DCL re-read.
          if (this.state !== DeferredBlockImageState.Complete) {
            // @0x74938a — `movl $0x2, 0x90(%r14)`.
            this.state = DeferredBlockImageState.Complete;
            // @0x749395-@0x749399 — pthread_cond_broadcast(&cond).
            pthread_cond_broadcast(this.baseSync);
          }
        } finally {
          // @0x7493a1 — inner Unlock().
          FFSynchronizable_Unlock(this.baseSync);
        }
        // @0x7493a6 — clear workerThread.
        this.workerThread = 0;
      } finally {
        // @0x7493b4 — outer Unlock() (the second inline FFSynchronizer scope).
        FFSynchronizable_Unlock(this.baseSync);
      }
    }
    // @0x7493b9 — return the RVO slot (%rax = %rbx).
    return out;
  }

  /**
   * `waitForStateWithTimeout(DeferredBlockImageState, NSDate*)`
   *   @Flexo 0x0000000000749460.
   *
   * Loops on the FFSynchronizer holding `this` — waking every ≤1000 ms
   * to re-check state and re-poll `[timeout timeIntervalSinceNow]`.
   * Returns `true` iff we exit with `this->state >= targetState`.
   *
   *   @0x749481           Lock() via FFSynchronizer ctor.
   *   @0x749486-@0x749490 remainingSec = [timeout timeIntervalSinceNow].
   *   @0x749496           remainingMs = remainingSec * 1000.0
   *                       (const @VA 0x156CAC0 = 1000.0).
   *   @0x7494b0           `cmpl %ebx, 0x90(%r15)` → setge r12b.
   *   @0x7494bb           `jge 0x74951f` — state has reached target.
   *   @0x7494bd-@0x7494c5 if remainingMs <= 0.0, exit loop.
   *   @0x7494c7-@0x7494ea clamp remainingMs to 1000, cast to uint32 via
   *                       the standard clang double→uint32 idiom via
   *                       int64 (`cvttsd2si` then subtract 2^63 sentinel).
   *                       Constants @VA 0x156CAC0 = 1000.0, @VA 0x156CAC8 = 2^63.
   *   @0x7494f0           FFSynchronizer::WaitFor((uint32_t)ms).
   *   @0x7494f5-@0x7494ff remainingSec = [timeout timeIntervalSinceNow].
   *   @0x749502           remainingMs = remainingSec * 1000.0.
   *   @0x74950e-@0x749512 if remainingMs > 0, loop back.
   *   @0x749514-@0x74951b final `setge r12b` on state vs target.
   *   @0x74951f-@0x749529 FFSynchronizer dtor → Unlock().
   *   @0x74952e           return r12b (unsigned char → bool).
   */
  waitForStateWithTimeout(targetState: DeferredBlockImageState, timeout: NSDate): boolean {
    // @0x749481 — Lock() via FFSynchronizer ctor.  Also create the
    // FFSynchronizer instance so we can invoke WaitFor.
    const sync: FFSynchronizer = new FFSynchronizer(this.baseSync);
    FFSynchronizable_Lock(this.baseSync);
    try {
      // @0x749486-@0x749496 — remainingMs = timeIntervalSinceNow(timeout) * 1000.0.
      let remainingMs: number = NSDate_timeIntervalSinceNow(timeout) * 1000.0;

      // r12b — the "reached target" flag we return.
      let reached: boolean = this.state >= targetState;

      // @0x7494b0-@0x749512 — the loop.
      while (!reached && remainingMs > 0.0) {
        // @0x7494c7-@0x7494ea — clamp to 1000 ms, cast to uint32.
        // The clang double→uint32 idiom via int64:
        //   rsi = (int64) min(remainingMs, 1000)
        //   rax = rsi >> 63                        (sign-extend)
        //   rcx = (int64) (min(remainingMs, 1000) - 2^63)
        //   esi = esi ∨ (ecx ∧ (int32) rax)
        // Since min(remainingMs, 1000.0) is in [0, 1000], the trick reduces
        // to `Math.floor(capMs) >>> 0`.  The `subsd 0x156CAC8` (2^63) path is
        // dead in this domain but reproduced here for faithfulness.
        const capMs: number = Math.min(remainingMs, 1000.0);
        const waitMs: number = capMs < 0 ? 0 : Math.floor(capMs) >>> 0;

        // @0x7494f0 — FFSynchronizer::WaitFor((uint32_t)ms).  Return value
        // is discarded — the loop's state re-check is authoritative.
        sync.WaitFor(waitMs);

        // @0x7494f5-@0x749502 — refresh remainingMs.
        remainingMs = NSDate_timeIntervalSinceNow(timeout) * 1000.0;

        // @0x749514-@0x74951b — refresh reached.
        reached = this.state >= targetState;
      }

      // @0x74951f — fall-through.  When we exit via `remainingMs <= 0`
      // the asm at @0x749514 re-does the state check; we mirror that.
      reached = this.state >= targetState;

      // @0x74952e — return r12b.
      return reached;
    } finally {
      // @0x749525-@0x749529 — Unlock() via FFSynchronizer dtor.
      FFSynchronizable_Unlock(this.baseSync);
      void sync; // Suppress unused-variable — names the RAII scope.
    }
  }

  /**
   * `static validNextState(DeferredBlockImageState from,
   *                        DeferredBlockImageState to)` @Flexo 0x0000000000749560.
   *
   * The disasm builds a function-local static `map<S, set<S>>` guarded
   * by `__cxa_guard_acquire` (@0x7496e3), then does a red-black-tree
   * find on `from`, then another RB-tree find inside the returned set
   * for `to`, and returns "was `to` present?" as unsigned char.
   *
   * The map is initialised from a three-element initializer_list literally
   * in this function's body (@0x7496f0-@0x7497f4):
   *   {Empty → {InProgress}}, {InProgress → {Complete}}, {Complete → {Complete}}
   *
   * We express the same table + the same lookup semantics in JS.  The
   * C++ tree-node construction (std::__1::__tree_balance_after_insert,
   * __tree, __value_type, ...) is compilation scaffolding — not part of
   * the observable contract — so we do not attempt to replicate the
   * node layout.
   */
  static validNextState(from: DeferredBlockImageState, to: DeferredBlockImageState): boolean {
    // @0x7495a2-@0x7495d3 — RB-tree find on `from`.
    const validSet: Set<number> | undefined = sValidStateTransitions.get(from);
    if (validSet === undefined) {
      // The insert-fresh-empty-set branch @0x7495d8 is unreachable for the
      // observable input domain: the initializer_list @0x7496fa-@0x7497ba
      // pre-seeds all three states 0/1/2 before the first `find`.
      // The asm's fresh-node initialiser would trivially return false
      // on the subsequent set-find; we do the same.
      return false;
    }
    // @0x74964e-@0x749698 — RB-tree find on `to` inside the set.
    return validSet.has(to);
  }
}
