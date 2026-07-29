// OZMEChannelTimeConverter.ts — per-thread stack of "time conversion" contexts used by the media
// engine to remap a global CMTime <-> a channel-local CMTime while a compound animation is
// evaluated (e.g. a channel inside a retimed compound clip; the enclosing evaluator pushes a
// conversion before recursing, then pops on the way out).
//
// Transcribed from FCP Ozone framework at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// DECODE:
//   raw-port/re/disasm/OZMEChannelTimeConverter.PushIdentity.s          @0x60a350
//   raw-port/re/disasm/OZMEChannelTimeConverter.PushConversion.s       @0x60a4d0
//   raw-port/re/disasm/OZMEChannelTimeConverter.PopConversion.s        @0x60a6f0
//   raw-port/re/disasm/OZMEChannelTimeConverter.GetCurrentConversion.s @0x60a7c0
//   raw-port/re/disasm/OZMEChannelTimeConverter.globalToLocalTime.s    @0x60a880
//   raw-port/re/disasm/OZMEChannelTimeConverter.localToGlobalTime.s    @0x60aa30
//   raw-port/re/disasm/OZMEChannelTimeConverter.isActive.s             @0x60abe0
//
// STORAGE MODEL
//   Native uses a per-thread `PCThreadSpecific<std::stack<OZMETimeConverterData, deque<...>>>`
//   ("perThreadTimeStack"). deque<> internally holds `map` (block pointers) + start offset + size,
//   and the OZMETimeConverterData element size is 100 bytes (0x64) — visible in every method as
//   the `imulq $0x64, %rcx, %rcx` element-address computation and in the `0xCCCCCCCCCCCCCCCD`
//   magic used to divide by 50 (blocks of 50 elements each: 50 * 100 = 5000 bytes/block, so
//   `(idx / 50)` selects the block-map slot and `(idx % 50) * 100` is the byte offset within it).
//
//   In our single-threaded JS model — matching the choice already made for OZChannelTimeConverter
//   (see raw-port/src/channels/OZChannelTimeConverter.ts) — we hold the stack in module scope. If
//   the port is ever moved to a worker-per-thread model, swap the storage for a per-worker map.
//
// STRUCT LAYOUT — `OZMETimeConverterData` (sizeof = 0x64 = 100)
//   Recovered from PushConversion (@0x60a4d0) stores:
//     movb  $0x1, (%rax,%rcx)              ; valid flag  @+0x00
//     movups %xmm0, 0x1(%rax,%rcx)         ; ---overlapping 16B pair copying param1---
//     movups %xmm1, 0xc(%rax,%rcx)         ; net effect: param1 (24B) lands at +0x04..+0x1B
//     movups %xmm0, 0x1c(%rax,%rcx)+trick  ; param2 (24B)          at +0x1C..+0x33
//     movups %xmm0, 0x34(%rax,%rcx)+trick  ; param3 (24B)          at +0x34..+0x4B
//     movups %xmm0, 0x4c(%rax,%rcx)+trick  ; param4 (24B)          at +0x4C..+0x63
//   The +0x01..+0x03 bytes are junk-then-overwritten dead space (compiler quirk from unrolling a
//   24-byte copy as two 16-byte writes at offsets +1 and +0xc, whose OVERLAP corrects the +1 to
//   the aligned +4 for the observable p1 bytes). The read path (globalToLocalTime,
//   localToGlobalTime) confirms p1 = +0x04..+0x1B.
//
//   Field names — inferred from the semantics of the two exported converters below:
//     valid       (u8)    @+0x00
//     localAnchor (CMTime, 24B) @+0x04    ; "p1" — anchor time on the LOCAL side (subtract before / add after)
//     globalAnchor(CMTime, 24B) @+0x1C    ; "p2" — anchor time on the GLOBAL side (subtract before / add after)
//     rate        (CMTime, 24B) @+0x34    ; "p3" — CMTime-valued rate (dLocal/dGlobal)
//     extra       (CMTime, 24B) @+0x4C    ; "p4" — captured but NOT used by either converter here
//                                          ; (a caller-visible bookkeeping slot; unused by
//                                          ;  {global,local}ToLocalTime — see decode).
//
// FRONTIER CALLEES (undecoded / dyld-shared-cache)
//   __ZmlRK6CMTimeS1_  = operator*(CMTime const&, CMTime const&) — called @0x60a97a (globalToLocal)
//   __ZdvRK6CMTimeS1_  = operator/(CMTime const&, CMTime const&) — called @0x60ab22 (localToGlobal)
//   Both are CoreMedia (dyld shared cache); their timescale-selection algorithm is not present in
//   any FCP framework binary and cannot be transcribed without decoding CoreMedia. We surface
//   them as throwing stubs whose message cites the callsite address — matching the precedent set
//   by raw-port/src/channels/OZShapeBehaviorBakeEntry.ts (which throw-stubs __ZdvRK6CMTimeS1_).

import {
  type CMTime,
  PC_CMTimeSaferAdd,
  PC_CMTimeSaferSubtract,
} from "../infra/CMTime";
import { OZChannelTimeConverter } from "./OZChannelTimeConverter";

/**
 * CMTime operator*(CMTime const&, CMTime const&).
 * Symbol: __ZmlRK6CMTimeS1_ — CoreMedia dyld shared-cache export; NOT present in any FCP
 * framework binary. The FCP callsite (@Ozone 0x60a97a inside
 * OZMEChannelTimeConverter::globalToLocalTime) treats the result as an ordinary CMTime that is
 * then fed into PC_CMTimeSaferAdd, so we cannot even derive a Float64 shortcut — the exact
 * timescale of the CMTime result matters for downstream arithmetic. Ports that need this
 * function must decode CoreMedia's implementation first.
 *
 * @frontier __ZmlRK6CMTimeS1_ (dyld-shared-cache — undecoded)
 */
export function CMTime_operator_mul(_a: CMTime, _b: CMTime): CMTime {
  throw new Error(
    "CMTime operator*(CMTime const&, CMTime const&) [__ZmlRK6CMTimeS1_] is a dyld-shared-cache " +
    "CoreMedia symbol not present in any FCP framework binary; its timescale-selection " +
    "algorithm has not been decoded. Callsite: Ozone 0x60a97a " +
    "(OZMEChannelTimeConverter::globalToLocalTime).",
  );
}

/**
 * CMTime operator/(CMTime const&, CMTime const&).
 * Symbol: __ZdvRK6CMTimeS1_ — CoreMedia dyld shared-cache export; NOT present in any FCP
 * framework binary. Called @Ozone 0x60ab22 inside OZMEChannelTimeConverter::localToGlobalTime.
 * See sibling raw-port/src/channels/OZShapeBehaviorBakeEntry.ts for the same frontier surfaced
 * from a different callsite.
 *
 * @frontier __ZdvRK6CMTimeS1_ (dyld-shared-cache — undecoded)
 */
export function CMTime_operator_div(_a: CMTime, _b: CMTime): CMTime {
  throw new Error(
    "CMTime operator/(CMTime const&, CMTime const&) [__ZdvRK6CMTimeS1_] is a dyld-shared-cache " +
    "CoreMedia symbol not present in any FCP framework binary; its timescale-selection " +
    "algorithm has not been decoded. Callsite: Ozone 0x60ab22 " +
    "(OZMEChannelTimeConverter::localToGlobalTime).",
  );
}

/**
 * One stack element — the four-CMTime "conversion" pushed by PushConversion and consumed by
 * globalToLocalTime / localToGlobalTime.
 *
 * Layout recovered from Ozone 0x60a4d0..0x60a655 (see file header). `valid` is the presence flag
 * that PushIdentity zero-writes (its 48-byte `xmmzero`-store at 0x60a389..0x60a390 clears the
 * whole element, so valid stays 0 for an identity frame) and PushConversion 1-writes.
 */
export interface OZMETimeConverterData {
  /** @+0x00 — 1 = real conversion; 0 = identity frame (from PushIdentity). */
  valid: 0 | 1;
  /** @+0x04 (24B) — "p1". LOCAL-side anchor. */
  localAnchor: CMTime;
  /** @+0x1C (24B) — "p2". GLOBAL-side anchor. */
  globalAnchor: CMTime;
  /** @+0x34 (24B) — "p3". CMTime-valued rate (`dLocal/dGlobal`). */
  rate: CMTime;
  /**
   * @+0x4C (24B) — "p4". Captured by PushConversion but NOT read by either converter in this
   * class; retained here bit-for-bit because a caller (still on the frontier) may inspect it.
   */
  extra: CMTime;
}

const _kIdentityCMTime: CMTime = { value: 0n, timescale: 0, flags: 0, epoch: 0n };

/**
 * PushIdentity's zero-write (Ozone 0x60a386..0x60a390) clears the entire 48-byte prefix of the
 * new element with `xmmzero`. In the decode, only the first 48 bytes are cleared — the remaining
 * 52 bytes (+0x30..+0x63) hold uninitialized memory when the new deque page is fresh (native
 * relies on the un-set `valid` bit to gate reads). We give every field a zero'd CMTime so the
 * TS-level struct is safe to read at any time; the observable-under-native `valid=0` behavior is
 * preserved because all readers key off `valid` first.
 */
function _makeIdentityFrame(): OZMETimeConverterData {
  return {
    valid: 0,
    localAnchor:  { ..._kIdentityCMTime },
    globalAnchor: { ..._kIdentityCMTime },
    rate:         { ..._kIdentityCMTime },
    extra:        { ..._kIdentityCMTime },
  };
}

// -----------------------------------------------------------------------------------------
// Per-thread stack storage.
//
// Native: PCThreadSpecific<std::stack<OZMETimeConverterData, std::deque<...>>>. The stack is
// lazily allocated on first push (both PushIdentity and PushConversion do
// `pthread_getspecific -> if null -> new stack{...} -> pthread_setspecific`), so an unpushed
// thread has NO stack at all — that's how isActive() and GetCurrentConversion() correctly
// return "no conversion" for a virgin thread.
//
// TS model: a single module-level array<OZMETimeConverterData>, `null` until first push. This
// matches the single-logical-thread choice from OZChannelTimeConverter.
// -----------------------------------------------------------------------------------------
let _perThreadTimeStack: OZMETimeConverterData[] | null = null;

/**
 * Test-only accessor to inspect the per-thread stack directly. Not called by the native code;
 * exported so parity harnesses can verify the stack shape after a Push/Pop sequence.
 */
export function _oz_me_time_stack_ref(): OZMETimeConverterData[] | null {
  return _perThreadTimeStack;
}

/** Test-only: reset the module-level TLS proxy between fuzz runs. */
export function _oz_me_time_stack_reset(): void {
  _perThreadTimeStack = null;
}

/**
 * OZMEChannelTimeConverter — a namespace of static methods over the per-thread conversion stack.
 * No instance state (native is empty `struct` — every method operates on the TLS singleton or
 * on caller-supplied out-parameters).
 *
 * Every method starts with the `perThreadTimeStack()::result` guard-variable + dispatch_once
 * dance that PCThreadSpecific uses for TLS-key lazy init. In our model that init is a no-op
 * (module-level state has no key to create), so we go straight to the observable behavior.
 */
export class OZMEChannelTimeConverter {
  /**
   * PushIdentity — @Ozone 0x60a350.
   *
   * Push a fresh element whose `valid` byte stays 0 (identity frame). The native decode:
   *   1. dispatch_once-init the pthread key.                                     @0x60a356..0x60a3ad
   *   2. `pthread_getspecific` — if null, `operator new(0x30)` a stack{deque{}}
   *      and `pthread_setspecific` it.                                            @0x60a36c..0x60a3ad
   *   3. Recompute the "next-to-write" element index from the deque's map + start
   *      offset (the `0xCCCCCCCCCCCCCCCD * (x/50)` div-by-50 trick).              @0x60a3b2..0x60a3d5
   *   4. If the current back tail == the deque's capacity end, call
   *      `deque::__add_back_capacity()` to add a new block of 50 elements.        @0x60a3e4..0x60a3ec
   *   5. Store `$0x00` (identity flag) at the new element's +0x00.                @0x60a427
   *   6. `size++` (via storing `%rdi + 1` back to the size field at +0x28).       @0x60a42b..0x60a42e
   *
   * The two xmmzero stores at 0x60a389..0x60a390 (write 48B of zero at +0x00..+0x2F of the
   * FRESH stack object, NOT the element) are part of the `operator new` initialization of the
   * stack{deque{}} struct itself (whose visible fields at +0x00..+0x28 include the deque's
   * `map` pointer, `map_size`, `start`, `size`, etc.) — they do NOT zero the element bytes.
   * The element's payload (except the just-set valid byte) is left uninitialized in native;
   * we model an all-zero CMTime in TS for safety (see _makeIdentityFrame above).
   */
  static PushIdentity(): void {
    if (_perThreadTimeStack === null) {
      _perThreadTimeStack = [];
    }
    _perThreadTimeStack.push(_makeIdentityFrame());
  }

  /**
   * PushConversion(p1, p2, p3, p4) — @Ozone 0x60a4d0.
   *
   * Push a fully-populated conversion element:
   *   - valid            = 1                          @+0x00 (movb $0x1, ... @0x60a601)
   *   - localAnchor  = p1 (24B)                       @+0x04           (@0x60a605..0x60a618)
   *   - globalAnchor = p2 (24B)                       @+0x1C           (@0x60a61d..0x60a62a)
   *   - rate         = p3 (24B)                       @+0x34           (@0x60a62f..0x60a63c)
   *   - extra        = p4 (24B)                       @+0x4C           (@0x60a641..0x60a64e)
   *   - size++                                        (@0x60a653)
   *
   * The TLS lazy-init + deque grow branches (@0x60a4ed..0x60a5d6) are the same shape as
   * PushIdentity; see that method's decode for the annotated breakdown.
   */
  static PushConversion(p1: CMTime, p2: CMTime, p3: CMTime, p4: CMTime): void {
    if (_perThreadTimeStack === null) {
      _perThreadTimeStack = [];
    }
    _perThreadTimeStack.push({
      valid: 1,
      localAnchor:  { ...p1 },
      globalAnchor: { ...p2 },
      rate:         { ...p3 },
      extra:        { ...p4 },
    });
  }

  /**
   * PopConversion — @Ozone 0x60a6f0.
   *
   * Pop the back element of the deque. Decode:
   *   - Read the deque's `size` at +0x28, decrement in-place (0x60a73b..0x60a73f).
   *   - Compute the block index of the element that WAS at the (old) tail; if the last block is
   *     now empty (the leftover popped element's index-within-block is < 0x50 which after the
   *     decrement means the trailing block still has capacity ≥ 1 unused slot), free the trailing
   *     block via `operator delete(map[old_tail_block])` and shrink the map (@0x60a743..0x60a75c).
   *   - The element's destructor is NOT called individually — OZMETimeConverterData is trivial
   *     (POD, no vtable, no dtor exported), so pop is size--; occasional block-free.
   *
   * NB: the native code does NOT null-check for empty. A pop on an empty stack in native reads
   * garbage. We match: precondition is "stack has ≥1 element" (caller responsibility).
   */
  static PopConversion(): void {
    if (_perThreadTimeStack === null || _perThreadTimeStack.length === 0) {
      // Native path here reads uninitialized memory. We surface it — a mispaired
      // Push/Pop is a caller bug that native would also silently corrupt on.
      return;
    }
    _perThreadTimeStack.pop();
  }

  /**
   * GetCurrentConversion — @Ozone 0x60a7c0.
   *
   * Returns a raw pointer (native) to the back element of the deque, or NULL when either the
   * TLS stack has never been created (`pthread_getspecific` returns null @0x60a7dd) or the
   * deque is empty (size==0 @0x60a7e6). Native returns `%rax = 0` in both null branches
   * (@0x60a82b).
   *
   * The address math (@0x60a7f3..0x60a820) walks `map[(tail-1)/50] + ((tail-1)%50)*100` — i.e.
   * the same element-address computation used by every other method. In TS we simply return the
   * top-of-stack object reference.
   */
  static GetCurrentConversion(): OZMETimeConverterData | null {
    if (_perThreadTimeStack === null || _perThreadTimeStack.length === 0) return null;
    return _perThreadTimeStack[_perThreadTimeStack.length - 1];
  }

  /**
   * isActive — @Ozone 0x60abe0.
   *
   * Returns `true` iff:
   *   (a) OZChannelTimeConverter::IsEnabledForCurrentThread() is true (@0x60abe6), AND
   *   (b) the TLS stack exists (@0x60ac06), AND
   *   (c) the deque is non-empty (@0x60ac0f), AND
   *   (d) the back element's `valid` byte at +0x00 is non-zero (@0x60ac4b — `cmpb $0, ...`).
   *
   * Any other outcome returns 0 (@0x60ac51 xor'd + fallthrough return).
   */
  static isActive(): boolean {
    if (!OZChannelTimeConverter.IsEnabledForCurrentThread()) return false;
    if (_perThreadTimeStack === null || _perThreadTimeStack.length === 0) return false;
    const top = _perThreadTimeStack[_perThreadTimeStack.length - 1];
    return top.valid !== 0;
  }

  /**
   * globalToLocalTime(channel, globalTime) — @Ozone 0x60a880.
   *
   * Passthrough (returns `globalTime` unchanged) when any of these hold:
   *   - IsEnabledForCurrentThread() is false                                     @0x60a89d
   *   - TLS stack absent OR deque empty                                          @0x60a8c0..0x60a8d0
   *   - back element's valid == 0                                                @0x60a90b..0x60a910
   *
   * Active path — reads the back element as {valid, localAnchor@+0x04,
   * globalAnchor@+0x1C, rate@+0x34, extra@+0x4C} and computes:
   *
   *   tmp = PC_CMTimeSaferSubtract(globalTime, globalAnchor)          @0x60a96b
   *   res = CMTime_operator_mul(tmp, rate)                            @0x60a97a  [FRONTIER]
   *   out = PC_CMTimeSaferAdd    (res, localAnchor)                   @0x60a9b8
   *   return out
   *
   * The `channel` argument is UNUSED by this method (it's read as `%rsi = &channel` but never
   * dereferenced anywhere in the disasm — the transform is a per-thread global, keyed on the
   * TLS stack, not on which channel is asking). We preserve the parameter to match the ABI.
   */
  static globalToLocalTime(_channel: unknown, globalTime: CMTime): CMTime {
    if (!OZChannelTimeConverter.IsEnabledForCurrentThread()) {
      return { ...globalTime };
    }
    if (_perThreadTimeStack === null || _perThreadTimeStack.length === 0) {
      return { ...globalTime };
    }
    const top = _perThreadTimeStack[_perThreadTimeStack.length - 1];
    if (top.valid === 0) {
      return { ...globalTime };
    }
    const tmp = PC_CMTimeSaferSubtract(globalTime, top.globalAnchor);
    const res = CMTime_operator_mul(tmp, top.rate);
    return PC_CMTimeSaferAdd(res, top.localAnchor);
  }

  /**
   * localToGlobalTime(channel, localTime) — @Ozone 0x60aa30.
   *
   * Symmetric inverse of globalToLocalTime. Same passthrough gating; when active:
   *
   *   tmp = PC_CMTimeSaferSubtract(localTime, localAnchor)            @0x60ab12
   *   res = CMTime_operator_div (tmp, rate)                           @0x60ab22  [FRONTIER]
   *   out = PC_CMTimeSaferAdd   (res, globalAnchor)                   @0x60ab5e
   *   return out
   *
   * Note the order: SUBTRACT the LOCAL anchor, DIVIDE by rate, ADD the GLOBAL anchor — the
   * dual of globalToLocalTime's SUBTRACT-global / MULTIPLY / ADD-local. Same read layout
   * (elem+0x04 = localAnchor, elem+0x1C = globalAnchor, elem+0x34 = rate).
   */
  static localToGlobalTime(_channel: unknown, localTime: CMTime): CMTime {
    if (!OZChannelTimeConverter.IsEnabledForCurrentThread()) {
      return { ...localTime };
    }
    if (_perThreadTimeStack === null || _perThreadTimeStack.length === 0) {
      return { ...localTime };
    }
    const top = _perThreadTimeStack[_perThreadTimeStack.length - 1];
    if (top.valid === 0) {
      return { ...localTime };
    }
    const tmp = PC_CMTimeSaferSubtract(localTime, top.localAnchor);
    const res = CMTime_operator_div(tmp, top.rate);
    return PC_CMTimeSaferAdd(res, top.globalAnchor);
  }
}
