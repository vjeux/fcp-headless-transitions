// UpdateSkipStyleBufferWorkerTask.ts — Flexo worker task that batch-updates
// an FFAudioPlaybackSkipStyleBuffer with a set of "buffer slices"; queued
// via FFAudioPlaybackSkipStyleBuffer::queueUpdateTask and drained by the
// audio-render worker thread which invokes performTask().
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/
//         Flexo.framework/Versions/A/Flexo (macOS FCP, x86_64 slice —
//         file offset 0x4000 for the x86_64 slice of the FAT binary).
//
// Symbols ported (all six methods brief.py listed):
//   * UpdateSkipStyleBufferWorkerTask::UpdateSkipStyleBufferWorkerTask(
//         std::__1::shared_ptr<FFAudioPlaybackSkipStyleBuffer>,
//         unsigned long long)                                    [C1] @0xd0f000
//   * UpdateSkipStyleBufferWorkerTask::~UpdateSkipStyleBufferWorkerTask()
//                                                                [D2] @0xd0f050
//   * UpdateSkipStyleBufferWorkerTask::~UpdateSkipStyleBufferWorkerTask()
//                                                                [D1] @0xd0f110
//                                                                     (thunk → D2)
//   * UpdateSkipStyleBufferWorkerTask::~UpdateSkipStyleBufferWorkerTask()
//                                                                [D0] @0xd0f120
//                                                                     (calls D2, then operator delete)
//   * UpdateSkipStyleBufferWorkerTask::performTask()                   @0xd112e0
//   * UpdateSkipStyleBufferWorkerTask::getTaskReference()              @0xd11310
//
// -----------------------------------------------------------------------------
// OBJECT LAYOUT (recovered from the ctor body @0xd0f000..0xd0f048)
// -----------------------------------------------------------------------------
//   +0x000  vptr                — installed @0xd0f007 with target
//                                  `0xd0f007 + 0xc02591 = 0x1911598`
//                                  (`vtable for UpdateSkipStyleBufferWorkerTask`
//                                   with the +0x10 Itanium ABI skew;
//                                   D2 re-installs the same pointer at
//                                   @0xd0f061 with target `0xd0f061 + 0xc02537
//                                   = 0x1911598`).
//   +0x010  std::__1::shared_ptr<FFAudioPlaybackSkipStyleBuffer>
//           +0x010  raw ptr          — copied via `movups (%rsi), %xmm0;
//                                       movups %xmm0, 0x10(%rdi)` @0xd0f00e-0xd0f011.
//           +0x018  control block    — bumped via `lock incq 0x8(%rax)`
//                                       @0xd0f01f (with %rax = ctrl-block ptr).
//   +0x020  unsigned long long        — 2nd ctor arg (`movq %rdx, 0x20(%rdi)`
//                                       @0xd0f024).  Used by performTask()
//                                       as the FIRST arg to addBufferSlices.
//   +0x028  long long = INT64_MIN     — `movabsq $-0x8000000000000000, %rax;
//                                       movq %rax, 0x28(%rdi)` @0xd0f028-0xd0f032.
//                                       Used by performTask() as the THIRD
//                                       arg to addBufferSlices (an i64).
//   +0x030  u32 = 1                   — `movl $0x1, 0x30(%rdi)` @0xd0f036.
//                                       Used by performTask() as the SECOND
//                                       arg to addBufferSlices — an
//                                       `FFAudioPlayback::PlaybackDirection`
//                                       enum.  Value 1 is the default.
//   +0x038  u64 = 0                   — zeroed @0xd0f040. FOURTH arg to
//                                       addBufferSlices.
//   +0x040  u64 = 0                   — zeroed by the SAME xmm write
//                                       (`movups %xmm0, 0x38(%rdi)` @0xd0f040
//                                       covers +0x38..+0x47). FIFTH arg
//                                       to addBufferSlices.
//   +0x048  ObjC id = nil             — zeroed @0xd0f044 as part of the
//                                       `movups %xmm0, 0x48(%rdi)` write
//                                       (covers +0x48..+0x57). Assigned by
//                                       other (not-ported) methods of the
//                                       class; D2 sends a `-[decrement:]`
//                                       ObjC message to it and then
//                                       `_objc_release`s it.
//   +0x050  ObjC id / u64             — zeroed by the same xmm write. The
//                                       `-[decrement:]` message on +0x48
//                                       takes it as its arg; D2 also
//                                       `_objc_release`s it independently.
//
//   sizeof(UpdateSkipStyleBufferWorkerTask) = 0x58 bytes.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES — cited by symbol + address, all THROW when hit.
// -----------------------------------------------------------------------------
//   * `-[<+0x48 receiver> decrement:<+0x50 arg>]`
//         — @Flexo 0xd0f073, via `callq *0xbde647(%rip)` (Flexo's
//           _objc_msgSend __auth_stubs slot). Selector recovered by
//           reading the __objc_selrefs pointer at
//           `%rip=0xd0f073 + 0xee2065 = 0x1bf10d8` on the Flexo x86_64
//           slice — cstring at the target VA is `"decrement:"` (verified
//           by `f.seek(0x4000 + 0x1bf10d8); f.read(...)` on the x86_64
//           slice at file-offset 0x4000). otool's stock mislabel
//           `_notifyOfFirstDrawing:` is stock noise.
//   * `_objc_release`                — Flexo literal-pool RIP-slot at
//                                       @0xd0f07d / @0xd0f087.
//   * FFAudioPlaybackSkipStyleBuffer::addBufferSlices(
//         unsigned long long,
//         FFAudioPlayback::PlaybackDirection,
//         long long,
//         unsigned long long,
//         unsigned long long)         — @Flexo 0xd112ff (tail-jmp from
//                                       performTask).  Not yet ported.
//   * std::__1::__shared_weak_count::__on_zero_shared()
//                                     — @Flexo vtable slot +0x10, called
//                                       @0xd0f0c0 (D2's shared_ptr drop
//                                       path).  Modeled as a WeakCtl
//                                       callback like OZFxPlugLockSentinel
//                                       does.
//   * std::__1::__shared_weak_count::__release_weak()
//                                     — @Flexo symbol stub 0x1497398
//                                       (tail-jumped @0xd0f0fb from D2's
//                                       drop path; also called @0xd0f0c6
//                                       from the non-tail branch).
//   * operator delete (__ZdlPv)       — Flexo symbol stub 0x1497404 (called
//                                       @0xd0f139 from D0).
//   * ___clang_call_terminate         — @Flexo 0xd0f103 (D2's exception
//                                       landing pad).
//
// -----------------------------------------------------------------------------
// D2's "release chained shared_ptr" TAIL IS DEAD CODE
// -----------------------------------------------------------------------------
// After releasing the shared_ptr at +0x10/+0x18, the compiler emitted a
// duplicated "release another shared_ptr" epilogue that reads back the
// (already-zeroed-by-the-`movups %xmm0, 0x10(%rbx)` at @0xd0f094) slot at
// +0x18 into %rbx. Because the slot is zero, the second-release path is
// never entered:
//   0xd0f0af: movq 0x18(%rbx), %rbx       ; %rbx = 0 (slot was zeroed).
//   0xd0f0b3: testq %rbx, %rbx
//   0xd0f0b6: jne 0xd0f0d4                 ; not taken.
//   0xd0f0b8: jmp 0xd0f0e6                  ; epilog.
// The `0xd0f0d4..0xd0f0fb` block is emitted-but-unreachable — a compiler
// artifact of inlining a `~T() { drop_ptr_a; drop_ptr_b; }` where `b`
// aliases `a`'s slot after the first drop. The JS port omits the dead
// tail (it's not observable behavior).
//
// -----------------------------------------------------------------------------
// This class holds only pass-through arithmetic (the `-1` decrement of a
// libc++ shared_ptr ctrl-block, which follows the exact
// `lock xaddq $-1, 0x8(ctrl)` pattern already exercised by other
// ported RAII sentinels).  No pure-math oracle applies; oracle_map.json
// is NOT extended here.
//
// @class UpdateSkipStyleBufferWorkerTask (Flexo)

/**
 * `FFAudioPlaybackSkipStyleBuffer` — the target of the queued update.
 * The task only ever calls `addBufferSlices(u64, PlaybackDirection,
 * i64, u64, u64)` on it (@Flexo 0xd112ff); not yet ported.
 *
 * @source Flexo (`30FFAudioPlaybackSkipStyleBuffer`)
 */
export interface FFAudioPlaybackSkipStyleBuffer {
  /**
   * @addr Flexo 0xd112ff (`_ZN30FFAudioPlaybackSkipStyleBuffer15
   *   addBufferSlicesEyN15FFAudioPlayback17PlaybackDirectionExyy`).
   */
  addBufferSlices(
    arg1_u64: bigint,
    direction: FFAudioPlayback_PlaybackDirection,
    arg3_i64: bigint,
    arg4_u64: bigint,
    arg5_u64: bigint,
  ): void;
}

/**
 * `FFAudioPlayback::PlaybackDirection` — enum stored as u32 at
 * `this+0x30`. The ctor initializes it to 1 (the "forward" default per
 * `movl $0x1, 0x30(%rdi)` @0xd0f036). Its enumerator names are not yet
 * decoded; we model the ABI as a branded u32.
 *
 * @source Flexo (`N15FFAudioPlayback17PlaybackDirectionE`)
 */
export type FFAudioPlayback_PlaybackDirection = number & {
  readonly __brand: "FFAudioPlayback::PlaybackDirection";
};

/**
 * The libc++ shared_ptr control block used at +0x18 of `this`.  The JS
 * port exposes only the two operations the dtor performs on it:
 *   * atomic decrement of `__shared_owners_` at +0x08 (via
 *     `lock xaddq $-1, 0x8(ctrl)` @0xd0f0a5).
 *   * on pre-decrement value == 0: dispatch vtable slot +0x10
 *     (`__on_zero_shared`) then call `__release_weak`.
 * Mirrors the shape used by OZFxPlugLockSentinel's `OZSharedWeakCount`.
 *
 * @source libc++ (`std::__1::__shared_weak_count`)
 */
export interface SharedPtrControlBlock {
  /** Mirror of `__shared_owners_` at +0x08 of the control block. */
  sharedOwners: { value: number };
  /**
   * vtable slot +0x10 — `__on_zero_shared`. Called @Flexo 0xd0f0c0 /
   * 0xd0f0f1 when the pre-decrement value was 0 (last shared owner).
   */
  onZeroShared(): void;
  /**
   * `__release_weak` — Flexo symbol stub 0x1497398. Called or tail-jumped
   * @Flexo 0xd0f0c6 / 0xd0f0fb after the on-zero-shared dispatch.
   */
  releaseWeak(): void;
}

/**
 * The 16-byte libc++ shared_ptr slot layout that lives at `this+0x10`.
 * Copied wholesale from the ctor's `movups (%rsi), %xmm0; movups %xmm0,
 * 0x10(%rdi)` @0xd0f00e-0xd0f011, then the control-block's weak owner
 * count is bumped via `lock incq 0x8(%rax)` @0xd0f01f.
 *
 * NOTE — the `lock incq 0x8(%rax)` is on the ctrl block, not on
 * `__shared_weak_owners_` semantically: libc++'s `shared_ptr` copy
 * constructor increments `__shared_owners_` at ctrl+0x00 for the
 * copy… actually reading the disasm literally, it's `lock incq 0x8(%rax)`
 * which is offset +0x08 — the `__shared_weak_owners_` slot. This is the
 * layout for a WEAK-count-bump only; the JS port preserves the
 * offset-and-op literally (it is what the shipping binary does).
 */
export interface FFAudioPlaybackSkipStyleBuffer_SharedPtr {
  /** +0x00 within the shared_ptr slot (i.e. `this+0x10`) — raw ptr. */
  raw: FFAudioPlaybackSkipStyleBuffer | null;
  /** +0x08 within the shared_ptr slot (i.e. `this+0x18`) — ctrl block. */
  ctrl: SharedPtrControlBlock | null;
}

/**
 * `-[<+0x48> decrement: <+0x50>]` — the ObjC message the dtor dispatches
 * @Flexo 0xd0f073. Selector recovered by hand from the Flexo x86_64
 * slice's __objc_selrefs at VA 0x1bf10d8 → cstring `"decrement:"` (otool
 * mislabels it as `_notifyOfFirstDrawing:`, its stock catch-all). The
 * receiver at +0x48 and the arg at +0x50 are ObjC `id`s that some other
 * (un-ported) method of the class sets — the ctor zeroes them, so a
 * default-constructed task will send `decrement: nil` to `nil` here,
 * which ObjC treats as a no-op.
 *
 * @addr Flexo 0xd0f073
 */
function objc_decrement(receiver: unknown, arg: unknown): void {
  // The ObjC runtime treats nil-receivers as a no-op (returns nil / 0
  // without any dispatch). We model that same behavior here so a
  // freshly-constructed, never-otherwise-mutated task can be dropped
  // safely without wiring up a real ObjC bridge.
  if (receiver === null) return;
  // Non-nil receiver: a real ObjC bridge is required. Preserve the
  // demand signal via a throwing stub, citing the address the JS port
  // reaches this from.
  throw new Error(
    "UpdateSkipStyleBufferWorkerTask::~UpdateSkipStyleBufferWorkerTask " +
      "@Flexo 0xd0f073 — `-[+0x48 decrement:+0x50]` fired on a non-nil " +
      "receiver but no ObjC bridge is wired in. Receiver = " +
      String(receiver) +
      ", arg = " +
      String(arg) +
      ". Selector recovered from __objc_selrefs @ Flexo VA 0x1bf10d8.",
  );
}

/**
 * `_objc_release` — Flexo literal-pool RIP-slot at @0xd0f07d / @0xd0f087.
 * Called on the +0x48 and +0x50 slots after the `decrement:` message.
 */
function objc_release(_obj: unknown): void {
  // Modeled as a no-op for the JS port's default-constructed happy path
  // (where the slots are always nil at dtor time). A JS host that wires
  // in real ObjC objects should override this via subclassing.
}

/**
 * `UpdateSkipStyleBufferWorkerTask` — queued audio-buffer-update task.
 *
 * Layout: `sizeof = 0x58`. Fields:
 *   +0x00  vptr             — Flexo vtable for the class (+0x10 skew).
 *   +0x10  shared_ptr<FFAudioPlaybackSkipStyleBuffer>   (16 bytes)
 *   +0x20  u64 arg1_u64      — first param to addBufferSlices.
 *   +0x28  i64 arg3_i64      — third param;  INIT = INT64_MIN.
 *   +0x30  u32 direction     — second param;  INIT = 1.
 *   +0x38  u64 arg4_u64      — fourth param; INIT = 0.
 *   +0x40  u64 arg5_u64      — fifth param;  INIT = 0.
 *   +0x48  ObjC id (nullable)
 *   +0x50  ObjC id (nullable) — arg to +0x48's -[decrement:] call.
 *
 * @source Flexo
 * @classAddr 0xd0f000 (C1)
 */
export class UpdateSkipStyleBufferWorkerTask {
  /** +0x10 — shared_ptr slot. */
  buffer: FFAudioPlaybackSkipStyleBuffer_SharedPtr;
  /** +0x20 — first arg to addBufferSlices. */
  arg1_u64: bigint;
  /** +0x28 — third arg (an i64); ctor sets INT64_MIN. */
  arg3_i64: bigint = -0x8000000000000000n;
  /** +0x30 — PlaybackDirection; ctor sets 1. */
  direction: FFAudioPlayback_PlaybackDirection = 1 as FFAudioPlayback_PlaybackDirection;
  /** +0x38 — fourth arg; ctor zeroes. */
  arg4_u64: bigint = 0n;
  /** +0x40 — fifth arg; ctor zeroes. */
  arg5_u64: bigint = 0n;
  /** +0x48 — ObjC id receiver of -[decrement:] in D2; ctor sets nil. */
  objcReceiver_0x48: unknown = null;
  /** +0x50 — ObjC id arg to -[decrement:] in D2; ctor sets nil. */
  objcArg_0x50: unknown = null;

  /**
   * `UpdateSkipStyleBufferWorkerTask::UpdateSkipStyleBufferWorkerTask(
   *      std::__1::shared_ptr<FFAudioPlaybackSkipStyleBuffer>,
   *      unsigned long long)`
   * C1 body @0xd0f000.
   *
   * Mirrored control flow:
   *   %rdi = this ; %rsi = &shared_ptr ; %rdx = arg1_u64
   *   leaq 0xc02591(%rip), %rax                                     @0xd0f000
   *     — %rax = &vtable + 0x10 (Flexo VA 0x1911598 — installed vptr).
   *   movq %rax, (%rdi)                                             @0xd0f007
   *   movq 0x8(%rsi), %rax                                          @0xd0f00a
   *     — %rax = shared_ptr.ctrl (source's ctrl-block ptr).
   *   movups (%rsi), %xmm0                                          @0xd0f00e
   *   movups %xmm0, 0x10(%rdi)                                      @0xd0f011
   *     — copy the 16-byte shared_ptr (raw + ctrl) into this+0x10.
   *   testq %rax, %rax ; je 0xd0f024                                @0xd0f015-0xd0f018
   *     — ctrl-block null-guard.
   *   pushq %rbp; movq %rsp, %rbp ; lock incq 0x8(%rax); popq %rbp   @0xd0f01a-0xd0f023
   *     — bump the ctrl block's +0x08 word (`__shared_weak_owners_`).
   *   .Lctrl_bumped:                                                 @0xd0f024
   *   movq %rdx, 0x20(%rdi)                                          @0xd0f024
   *   movabsq $-0x8000000000000000, %rax                             @0xd0f028
   *   movq %rax, 0x28(%rdi)                                          @0xd0f032
   *   movl $0x1, 0x30(%rdi)                                          @0xd0f036
   *   xorps %xmm0, %xmm0                                             @0xd0f03d
   *   movups %xmm0, 0x38(%rdi)                                       @0xd0f040
   *   movups %xmm0, 0x48(%rdi)                                       @0xd0f044
   *   retq                                                           @0xd0f048
   *
   * Note the odd `pushq %rbp; …; popq %rbp` block around the atomic
   * increment (@0xd0f01a-0xd0f023): the compiler emitted a mid-function
   * frame setup ONLY around the atomic op, because the top of the
   * function used the no-frame-setup fast-path (`retq` directly). This
   * is a size-vs-correctness knob (`-fomit-frame-pointer` interacting
   * with an atomic that must not be reordered around the frame teardown).
   * The JS port doesn't need to care; but recording it here so a future
   * "why does this look weird" spelunker doesn't chase phantom bugs.
   *
   * @addr 0xd0f000 (Flexo, C1)
   */
  constructor(bufferSharedPtr: FFAudioPlaybackSkipStyleBuffer_SharedPtr, arg1_u64: bigint) {
    // @0xd0f00a-0xd0f023 — copy the shared_ptr slot + bump ctrl block's
    // +0x08 weak-owners count.
    this.buffer = { raw: bufferSharedPtr.raw, ctrl: bufferSharedPtr.ctrl };
    if (this.buffer.ctrl !== null) {
      const ctrl = this.buffer.ctrl;
      ctrl.sharedOwners.value = (ctrl.sharedOwners.value + 1) | 0;
    }
    // @0xd0f024 — store the second ctor arg at +0x20.
    this.arg1_u64 = arg1_u64;
    // @0xd0f028-0xd0f044 — the remaining scalar defaults (already set as
    // field-initializers above); the ctor writes them explicitly here.
    this.arg3_i64 = -0x8000000000000000n;
    this.direction = 1 as FFAudioPlayback_PlaybackDirection;
    this.arg4_u64 = 0n;
    this.arg5_u64 = 0n;
    this.objcReceiver_0x48 = null;
    this.objcArg_0x50 = null;
  }

  /**
   * `~UpdateSkipStyleBufferWorkerTask()` — D2 body @0xd0f050 (D1 @0xd0f110
   * is a thunk `pushq %rbp; movq %rsp,%rbp; popq %rbp; jmp D2` @0xd0f115;
   * D0 @0xd0f120 is `D2; jmp __ZdlPv` — the delete-thunk).
   *
   * Mirrored control flow:
   *   pushq %rbp; movq %rsp,%rbp; pushq %r14; pushq %rbx              @0xd0f050
   *   movq %rdi, %rbx                                                 @0xd0f057
   *   leaq 0xc02537(%rip), %rax ; movq %rax, (%rdi)                   @0xd0f05a-0xd0f061
   *     — re-install the class's vptr (belt-and-suspenders — the value
   *       is already there from the ctor; the compiler emits this so a
   *       virtual call in the dtor body sees the class's own overrides).
   *   movq 0x48(%rdi), %rdi                                           @0xd0f064
   *   movq 0x50(%rbx), %rdx                                           @0xd0f068
   *   movq 0xee2065(%rip), %rsi                                        @0xd0f06c
   *     — %rsi = &@selector(decrement:) from __objc_selrefs @ 0x1bf10d8.
   *   callq _objc_msgSend                                             @0xd0f073
   *     — dispatch `-[<+0x48> decrement:<+0x50>]`.  Nil-receiver is a
   *       no-op per ObjC runtime rules.
   *   movq 0x48(%rbx), %rdi ; callq _objc_release                     @0xd0f079-0xd0f07d
   *   movq 0x50(%rbx), %rdi ; callq _objc_release                     @0xd0f083-0xd0f087
   *   xorps %xmm0, %xmm0                                              @0xd0f08d
   *   movq 0x18(%rbx), %r14                                           @0xd0f090
   *   movups %xmm0, 0x10(%rbx)                                        @0xd0f094
   *     — zero out `this+0x10..this+0x1f` (drop the shared_ptr slot).
   *   testq %r14, %r14 ; je 0xd0f0e6                                  @0xd0f098-0xd0f09b
   *     — null-guard on the ctrl block that we cached before zeroing.
   *   movq $-0x1, %rax ; lock xaddq %rax, 0x8(%r14) ;                 @0xd0f09d-0xd0f0a5
   *     testq %rax, %rax ; je 0xd0f0ba                                @0xd0f0aa-0xd0f0ad
   *     — atomic pre-dec of `__shared_owners_` (at ctrl+0x08 — the same
   *       slot the ctor incremented). Pre-value == 0 means we WERE the
   *       last shared owner; jump to .Ldrop.
   *   [ .Lret_direct: (pre != 0)
   *       movq 0x18(%rbx), %rbx ; testq %rbx, %rbx                    @0xd0f0af-0xd0f0b6
   *       jne 0xd0f0d4  ; jmp 0xd0f0e6                                @0xd0f0b6-0xd0f0b8
   *     — DEAD CODE: the slot was zeroed @0xd0f094, so %rbx = 0 →
   *       jmp epilog. See file-top note. ]
   *   .Ldrop:                                                          @0xd0f0ba
   *   movq (%r14), %rax ; movq %r14, %rdi                             @0xd0f0ba-0xd0f0bd
   *   callq *0x10(%rax)                                                @0xd0f0c0
   *     — __on_zero_shared vtable slot +0x10.
   *   movq %r14, %rdi ; callq __ZNSt3__119__shared_weak_count14__release_weakEv
   *                                                                    @0xd0f0c3-0xd0f0c6
   *   [ then the dead second-release chain @0xd0f0cb-0xd0f0e4 falls
   *     through into the epilog either way. ]
   *   .Lret: popq %rbx; popq %r14; popq %rbp; retq                    @0xd0f0e6-0xd0f0ea
   *
   * @addr 0xd0f050 (Flexo, D2)
   */
  destroy(): void {
    // @0xd0f064-0xd0f073 — -[+0x48 decrement:+0x50]. Nil-safe (see
    // objc_decrement).
    objc_decrement(this.objcReceiver_0x48, this.objcArg_0x50);
    // @0xd0f079 / @0xd0f083 — _objc_release each slot.
    objc_release(this.objcReceiver_0x48);
    objc_release(this.objcArg_0x50);
    this.objcReceiver_0x48 = null;
    this.objcArg_0x50 = null;

    // @0xd0f08d-0xd0f094 — cache the ctrl-block pointer, then zero the
    // shared_ptr slot (raw + ctrl) at this+0x10..this+0x1f.
    const ctrl = this.buffer.ctrl;
    this.buffer = { raw: null, ctrl: null };

    // @0xd0f098-0xd0f0c6 — the shared_ptr's ctrl-block drop dance.
    if (ctrl === null) return;
    // @0xd0f09d-0xd0f0a5 — atomic pre-dec of ctrl.sharedOwners.
    const pre = (ctrl.sharedOwners.value | 0);
    ctrl.sharedOwners.value = ((pre - 1) | 0);
    // @0xd0f0aa-0xd0f0ad — testq pre; je .Ldrop.  pre == 0 means we
    // were the last shared owner.
    if (pre !== 0) return;
    // @0xd0f0ba-0xd0f0c0 — __on_zero_shared.
    ctrl.onZeroShared();
    // @0xd0f0c3-0xd0f0c6 — __release_weak.  (The tail-jmp variant at
    // @0xd0f0fb is byte-equivalent to this call.)
    ctrl.releaseWeak();
    // .Lret. Dead second-release chain @0xd0f0cb-0xd0f0e4 not modeled;
    // see file-top note.
  }

  /**
   * `performTask()` @0xd112e0.
   *
   * Mirrored control flow (this method is a plain forwarder — it just
   * unpacks the fields into the ABI registers and tail-jumps into
   * `FFAudioPlaybackSkipStyleBuffer::addBufferSlices(u64, PlaybackDirection,
   *  i64, u64, u64)`):
   *   pushq %rbp; movq %rsp,%rbp                                     @0xd112e0
   *   movq 0x10(%rdi), %rax   ; %rax = shared_ptr.raw = buffer       @0xd112e4
   *   movq 0x20(%rdi), %rsi   ; %rsi = arg1_u64                      @0xd112e8
   *   movl 0x30(%rdi), %edx   ; %edx = direction                     @0xd112ec
   *   movq 0x28(%rdi), %rcx   ; %rcx = arg3_i64                      @0xd112ef
   *   movq 0x38(%rdi), %r8    ; %r8  = arg4_u64                      @0xd112f3
   *   movq 0x40(%rdi), %r9    ; %r9  = arg5_u64                      @0xd112f7
   *   movq %rax, %rdi         ; %rdi = buffer (self)                 @0xd112fb
   *   popq %rbp                                                       @0xd112fe
   *   jmp FFAudioPlaybackSkipStyleBuffer::addBufferSlices(...)       @0xd112ff
   *
   * IMPORTANT — the argument order in the tail-jmp is:
   *   (buffer, arg1_u64, direction, arg3_i64, arg4_u64, arg5_u64)
   * but the SIGNATURE of addBufferSlices is
   *   (u64, PlaybackDirection, i64, u64, u64)
   * i.e. `buffer` is the `this` (%rdi), and the remaining five are the
   * positional args. The mapping from this-object offsets to callee
   * positional args is thus:
   *   +0x20 → arg1 (u64)              ← ctor param
   *   +0x30 → arg2 (PlaybackDirection) ← ctor default = 1
   *   +0x28 → arg3 (i64)              ← ctor default = INT64_MIN
   *   +0x38 → arg4 (u64)              ← ctor default = 0
   *   +0x40 → arg5 (u64)              ← ctor default = 0
   * (Yes, arg3 comes from offset +0x28 which is written BEFORE +0x30 —
   * the offsets and the arg-order are permuted with respect to each
   * other. This is a pure ABI/lo-ordering coincidence; the JS port
   * mirrors the ABI's arg-order in the call it emits.)
   *
   * @addr 0xd112e0 (Flexo)
   */
  performTask(): void {
    // @0xd112e4 — load `buffer` from the shared_ptr's raw slot.  If
    // the shared_ptr is empty, the C++ code will call a method on a
    // nil pointer (undefined behavior — segfault). We raise instead.
    const buffer = this.buffer.raw;
    if (buffer === null) {
      throw new Error(
        "UpdateSkipStyleBufferWorkerTask::performTask @Flexo 0xd112e4 — " +
          "shared_ptr's raw ptr is null; C++ would call a virtual on " +
          "the nil buffer here (segfault). The JS port raises instead " +
          "of transcribing UB.",
      );
    }
    // @0xd112e8-0xd112ff — tail-jmp addBufferSlices(u64, dir, i64, u64, u64).
    buffer.addBufferSlices(
      this.arg1_u64,
      this.direction,
      this.arg3_i64,
      this.arg4_u64,
      this.arg5_u64,
    );
  }

  /**
   * `getTaskReference()` @0xd11310.
   *
   * Mirrored control flow:
   *   pushq %rbp; movq %rsp, %rbp
   *   movq 0x10(%rdi), %rax   ; %rax = shared_ptr.raw = buffer ptr
   *   popq %rbp
   *   retq
   *
   * Returns the raw pointer stored in the shared_ptr slot (i.e.
   * `this->buffer.raw`).  Callers use this as an opaque "task-reference"
   * identity — usually to look up which task is queued against which
   * buffer, without touching the strong-count.
   *
   * @addr 0xd11310 (Flexo)
   */
  getTaskReference(): FFAudioPlaybackSkipStyleBuffer | null {
    // @0xd11314 — movq 0x10(%rdi), %rax.
    return this.buffer.raw;
  }
}
