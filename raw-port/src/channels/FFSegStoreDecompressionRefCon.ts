// FFSegStoreDecompressionRefCon — transcribed from Flexo.framework x86_64 slice.
//
// Refcon (reference-context) object attached to a
// VTDecompressionSession-style pipeline: the CoreVideo decompressor invokes
// `decompressionOutputCallback` on it whenever a decoded __CVBuffer is ready,
// while consumer threads call `waitForDecodeComplete` to block until the
// callback deposits a frame (or a timeout elapses).
//
// Inheritance: extends FFSynchronizable  (ctor calls its C1 @0x126ec81 and
//              dtor tail-calls its D1 @0x126ece5). FFSynchronizable itself
//              wraps a pthread_mutex + pthread_cond via the FFSynchronizer
//              nested helper (see WaitFor call @0x126f098).
//
// Object layout (from ctor stores + callback writes):
//   this[0x00 .. 0x8F] : FFSynchronizable base (owns the mutex+cond)
//   this[0x90]         : bool  decodeDone        (set at ctor +0x86, checked in waitForDecodeComplete)
//   this[0x94]         : int32 lastStatus        (kOSStatus from the VT callback)
//   this[0x98]         : __CVBuffer* lastBuffer  (retained; CVBufferRetain @stub 0x1495346)
//   this[0xA0]         : long token              (ctor arg1 stored at @0x126eca2 — the "long" the C1 takes)
//
// External symbols cited below:
//   _FFGetHostTimeSeconds                      (extern void → double)   @call @0x126f017/0x126f060/0x126f0ee
//   __ZN14FFSynchronizer7WaitForEj             FFSynchronizer::WaitFor(unsigned) @0x126f098/0x126f0dc
//   __ZN16FFSynchronizable4LockEv/6UnlockEv    FFSynchronizable Lock/Unlock @0x126ecac/0x126ecb4/0x126ed1e/0x126f02c
//   __ZN16FFSynchronizableC1EPFvbPKvES1_       FFSynchronizable ctor @0x126ec81
//   __ZN16FFSynchronizableD1Ev                 FFSynchronizable dtor @0x126ece5
//   _CVBufferRetain                            CVBufferRetain @stub 0x1495346
//   _pthread_cond_wait                         pthread_cond_wait @stub 0x1497a94
//   _pthread_self                              pthread_self @stub 0x1497b12
//   _OBJC_CLASS_$_NSString                     ObjC NSString class ref (used for logging paths)
//
// Timing constants at RIP-relative loads inside waitForDecodeComplete
// (@0x126f06a, 0x126f080, 0x126f088, 0x126f0c4, 0x126f0cc, 0x126f0f8, 0x126f124) —
// values live in the __literal8 pool at ~+0x2fdb00 relative to the callsites
// and encode a timeout-in-seconds + ms-conversion scaling. Their exact decoding
// requires per-address resolve.py runs against RIP+8+disp; not carried here
// because the routine is unportable regardless (no cond var in JS).
//
// NOTE: this is a threading / CoreVideo / ObjC-logging refcon. Nothing in TS
// can simulate pthread_cond_wait or a real CVBuffer, so every method throws
// citing its decoded @0xADDR. The one thing we CAN represent is the storage
// layout, which the class exposes as public fields for a future port that
// stubs FFSynchronizable.

export class FFSegStoreDecompressionRefCon {
  /** FFSynchronizable base placeholder — real subclass carries the mutex/cond. */
  base: unknown = null;

  /** @0x126ec86 : bool at +0x90, initial false */
  decodeDone = false;
  /** @0x126ec8d : int32 at +0x94, initial 0 (VT status code, e.g. kVTVideoDecoderReferenceMissingErr) */
  lastStatus = 0;
  /** @0x126ec97 : ptr at +0x98, initial null (retained CVBuffer holding the latest decoded frame) */
  lastBuffer: unknown = null;
  /** @0x126eca2 : long at +0xA0, stored from ctor arg1 (opaque owner token) */
  ownerToken = 0n;

  /**
   * FFSegStoreDecompressionRefCon(long) @0x126ec70 (C1 body — C2 @0x126ec00
   * is a `jmp` thunk to this identical body per otool -tV).
   *
   *   @0x126ec81  base::FFSynchronizable(nullptr, nullptr)   ← both hooks nil
   *   @0x126ec86  this->decodeDone  = false
   *   @0x126ec8d  this->lastStatus  = 0
   *   @0x126ec97  this->lastBuffer  = nullptr
   *   @0x126eca2  this->ownerToken  = arg1 (rsi)
   *   @0x126ecac  base::Lock()
   *   @0x126ecb4  base::Unlock()   ← touch pair to publish stores under the mutex
   *   epilogue @0x126ecbe : __clang_call_terminate on exception (via C++ EH tables)
   *
   * Depends on FFSynchronizable (mutex primitive not ported yet). The
   * Lock()/Unlock() bracket is a memory-barrier / "publish under the mutex"
   * pattern — semantically a no-op in single-threaded JS but the port must
   * still route through the base when FFSynchronizable lands.
   */
  constructor(token: bigint | number) {
    this.ownerToken = typeof token === "bigint" ? token : BigInt(token);
    // Requires FFSynchronizable base class port (Lock/Unlock, mutex); see @0x126ec70.
    throw new Error("FFSegStoreDecompressionRefCon constructor unresolved @0x126ec70");
  }

  /**
   * ~FFSegStoreDecompressionRefCon() @0x126ece0 — 6-line body, tail-jumps to
   *   __ZN16FFSynchronizableD1Ev  (FFSynchronizable::~FFSynchronizable)
   * i.e. this class adds no per-instance cleanup beyond the base. Any leaked
   * CVBufferRelease of `lastBuffer` must be happening elsewhere (likely inside
   * decompressionOutputCallback prior to a subsequent Retain — see @0x126ed23
   * where a bare store overwrites without a prior release, so the pipeline
   * must be releasing the previous frame at a higher layer).
   */
  destroy(): void {
    // Base dtor only; see @0x126ece0.
    throw new Error("FFSegStoreDecompressionRefCon destructor unresolved @0x126ece0");
  }

  /**
   * decompressionOutputCallback(void* refcon, void* sourceFrameRefcon,
   *   int32 osStatus, uint32 infoFlags, __CVBuffer* imageBuffer,
   *   CMTime pts, CMTime duration)                             @0x126ecf0
   *
   * VTDecompressionOutputCallback signature. Body summary (187-line decode
   * available at raw-port/re/disasm/…decompressionOutputCallback.s):
   *
   *   @0x126ed01  if (!refcon) return             (early null-guard)
   *   @0x126ed1e  refcon->base::Lock()
   *   @0x126ed23  refcon[0x98] = imageBuffer     (store, no prior release)
   *   @0x126ed2a  refcon[0x94] = osStatus
   *   @0x126ed31  if (imageBuffer) CVBufferRetain(imageBuffer)
   *   @0x126ed3e  if (osStatus != 0):
   *     @0x126ed4b  push autorelease pool
   *     @0x126ed5c  eax = osStatus & 0x1D
   *                if (eax == 1) → format an NSString via objc_msgSend
   *                                (uses _OBJC_CLASS_$_NSString and a CFString
   *                                literal @0x126ed84 / @0x126ee67) — this is
   *                                the diagnostic-logging branch when a
   *                                kVTVideoDecoderReferenceMissingErr-family
   *                                status is reported.
   *                else → alternate log format @0x126edd5
   *     … NSLog-style dispatch continues to @0x126efb3
   *   @0x126efb3  refcon->decodeDone = true    (byte store at +0x90)
   *               refcon->base::Signal() (via FFSynchronizer inside)
   *   @0x126efcb  base::Unlock() + return
   *
   * ObjC + CoreVideo + logging combine to make a faithful bit-exact port
   * unreachable in this pass; the decoded flow above suffices for a future
   * pass once FFSynchronizable + CVBuffer + NSString logging shims exist.
   */
  static decompressionOutputCallback(
    _refcon: unknown,
    _sourceFrameRefcon: unknown,
    _osStatus: number,
    _infoFlags: number,
    _imageBuffer: unknown,
    _pts: unknown,
    _duration: unknown,
  ): void {
    // Requires CVBufferRetain/ObjC NSString/FFSynchronizable; see @0x126ecf0.
    throw new Error("FFSegStoreDecompressionRefCon.decompressionOutputCallback unresolved @0x126ecf0");
  }

  /**
   * waitForDecodeComplete(bool timeoutEnabled) @0x126f000
   *
   * 129-line body — polls `this->decodeDone` (byte at +0x90) while calling
   * FFSynchronizer::WaitFor(unsigned ms) in a loop. Two loop shapes:
   *
   *   timeoutEnabled == true branch (@0x126f04b jne fallthrough):
   *     - startTime = FFGetHostTimeSeconds()                    @0x126f017
   *     - loop:
   *         now = FFGetHostTimeSeconds()                        @0x126f060
   *         elapsed = now − startTime
   *         if (kMaxWaitSeconds <= elapsed) → give-up branch @0x126f1a4
   *         remainingMs = (kMaxWaitSeconds − elapsed) * kMsPerSecond + kAdjustment
   *                                                             @0x126f07c..0x126f088
   *         FFSynchronizer::WaitFor(remainingMs)                @0x126f098
   *         if (decodeDone) break
   *
   *   timeoutEnabled == false branch (@0x126f0ab):
   *     - two-tier wait: first a fast-poll retry with the same math using a
   *       different constant pool address, then falls to a pthread_cond_wait
   *       spin (@0x126f15e) if the FFSynchronizer's short-wait exceeded a
   *       threshold and this->decodeDone is still false.
   *     - Between polls @0x126f10c it appends a "decoder stall" log line to
   *       an NSString buffer at this->ownerToken via `-appendData:` @0x126f131,
   *       gated by an "already-warned" flag in r13.
   *
   * Return value: byte in r15b — 1 if decodeDone was observed, 0 on timeout.
   *
   * The unsigned-int ms values passed into FFSynchronizer::WaitFor come from
   * three RIP-relative doubles in the literal pool (~+0x2fdb00 area); their
   * exact decimal decoding is deferred until FFSynchronizer is ported.
   */
  waitForDecodeComplete(_timeoutEnabled: boolean): boolean {
    // Requires FFSynchronizer::WaitFor + FFGetHostTimeSeconds + pthread_cond_wait; see @0x126f000.
    throw new Error("FFSegStoreDecompressionRefCon.waitForDecodeComplete unresolved @0x126f000");
  }
}
