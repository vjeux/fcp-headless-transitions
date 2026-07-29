// FFStreamFlexMusicBuffer.ts — Flexo.framework audio queue buffer for flex-timed music.
//
// Faithful transcription per raw-port/army/PORTING_SPEC.md. All 10 symbols in the
// FFStreamFlexMusicBuffer class are covered. Externs (FFAudioQueueBuffer base ctor/dtor,
// FFWorkerQueue, FFAudioBufferList, Objective-C sample-buffer helpers, kCMTimeInvalid) are
// boundary throw-stubs citing @0xADDR so the frontier can see them.
//
// Framework: /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// (x86_64 slice). Derives from FFAudioQueueBuffer.
//
// Symbols (nm -arch x86_64 | c++filt):
//   @0x2784f0  FFStreamFlexMusicBuffer::FFStreamFlexMusicBuffer(u32 numChannels, f64 rate)  [C2]
//   @0x2785b0  FFStreamFlexMusicBuffer::FFStreamFlexMusicBuffer(u32 numChannels, f64 rate)  [C1]
//   @0x278670  FFStreamFlexMusicBuffer::~FFStreamFlexMusicBuffer()                          [D2]
//   @0x2786d0  FFStreamFlexMusicBuffer::~FFStreamFlexMusicBuffer()                          [D1]
//   @0x278730  FFStreamFlexMusicBuffer::~FFStreamFlexMusicBuffer()                          [D0 deleting]
//   @0x2787a0  FFStreamFlexMusicBuffer::startBuffer(i64 startFrame, i64 durationFrames, bool async,
//                                                   FFPrerollSync*, NSObject*)              [FULL PORT]
//   @0x278880  FFStreamFlexMusicBuffer::addBufferSlice(i64 anchorFrame)                     [skeleton — 120-line body]
//   @0x278a80  FFStreamFlexMusicBuffer::shouldUpdateBuffer() const                          [FULL PORT]
//   @0x278ac0  FFStreamFlexMusicBuffer::getNumUpdateFrames() const                          [FULL PORT]
//   @0x278ad0  FFStreamFlexMusicBuffer::setAssetReaderOutput(AVAssetReaderOutput*)          [FULL PORT]
//
// DECODE (raw-port/re/disasm/):
//   Flexo.FFStreamFlexMusicBuffer.FFStreamFlexMusicBuffer.s   (47 lines — matches C1 body)
//   Flexo.FFStreamFlexMusicBuffer.startBuffer.s               (62 lines)
//   Flexo.FFStreamFlexMusicBuffer.addBufferSlice.s            (120 lines)
//   Flexo.FFStreamFlexMusicBuffer.shouldUpdateBuffer.s        (19 lines)
//   Flexo.FFStreamFlexMusicBuffer.getNumUpdateFrames.s        (7 lines)
//   Flexo.FFStreamFlexMusicBuffer.setAssetReaderOutput.s      (20 lines)
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (recovered from C2 @0x2784f0 + accessor disasm above)
// -----------------------------------------------------------------------------
// FFStreamFlexMusicBuffer derives from FFAudioQueueBuffer. The base occupies +0x00..+0xb7 (the
// public inspectable field observed here is +0x20 = writePos and +0x28 = readPos, both u64,
// from shouldUpdateBuffer @0x278a84/@0x278a88). Own fields:
//
//   +0x000  vptr                        — RIP+0x18f7070 (leaq 0x167ea9d(%rip) @0x2785cc). Points
//                                         into __ZTV23FFStreamFlexMusicBuffer.
//   +0x020  u64  writePos               — inherited from FFAudioQueueBuffer; see shouldUpdateBuffer.
//   +0x028  u64  readPos                — inherited from FFAudioQueueBuffer.
//   +0x0b8  u64  numUpdateFrames        — (u64)(2 * rate). C2 @0x2785ea..@0x278645, C1 mirror
//                                         @0x27852a..@0x278585. Returned by getNumUpdateFrames.
//   +0x0c0  u64  sliceFrames            — (u64)(rate * 0.5). C2 @0x278630..@0x27865e. Threshold
//                                         compared against writePos-readPos in shouldUpdateBuffer.
//   +0x0c8  f64  rate                   — sample-rate (assigned from xmm1 in the ctor).
//   +0x0d0  u32  numChannels            — the u32 first ctor arg.
//   +0x0d8  u64  slicePendingCount      — zeroed by both ctors (xorpd; movupd %xmm0, 0xd8(%rbx))
//                                         and, together with +0xe0, cleared in a 16-byte pair.
//                                         startBuffer @0x27881e sets this to max(0, -argFrame).
//   +0x0e0  id   assetReaderOutput      — AVAssetReaderOutput* (ObjC retain/release; set by
//                                         setAssetReaderOutput @0x278ad0; read by addBufferSlice
//                                         @0x27890d and released by ~D2/~D1/~D0 @0x278684/../..).
//   +0x0e8  FFWorkerQueue*  workerQueue — set by startBuffer @0x2787f7 (new + FFWorkerQueue::C1
//                                         with label "com.apple.flexo.audio-flexmusic-update-thread"),
//                                         freed by dtor + startBuffer replace-path.
//
// Total sizeof observed: >= 0xf0 (last field is +0xe8, 8 bytes).
//
// Numeric constants (via resolve.py Flexo const):
//   @0x156cac8  u64 0x43e0000000000000  = 9.2233720368e+18  = 2^63  (double-to-u64 conversion trick)
//   @0x156ca38  u64 0x3fe0000000000000  = 0.5               (sliceFrames = rate * 0.5)
// -----------------------------------------------------------------------------

// ============================================================================
// Boundary stubs — throw citing @0xADDR (frontier gaps).
// ============================================================================

/**
 * FFAudioQueueBuffer::FFAudioQueueBuffer(FFAudioBufferListLocklessQueue::SortOption) — direct symbol
 * __ZN18FFAudioQueueBufferC2EN30FFAudioBufferListLocklessQueue10SortOptionE
 * (called from both ctors @0x2784ff/@0x2785c7 with esi = 0 / SortOption::none).
 */
function ffAudioQueueBuffer_C2(_self: FFStreamFlexMusicBufferState, _sortOption: number): void {
  throw new Error(
    "FFAudioQueueBuffer::FFAudioQueueBuffer(FFAudioBufferListLocklessQueue::SortOption) " +
      "@Flexo (called from FFStreamFlexMusicBuffer C2 @0x2784ff, C1 @0x2785c7) not yet transcribed",
  );
}

/**
 * FFAudioQueueBuffer::~FFAudioQueueBuffer() — tail-called by every FFStreamFlexMusicBuffer dtor
 * (D2 @0x278721, D1 @0x278721 via jmp, D0 @0x27877b). Direct symbol __ZN18FFAudioQueueBufferD2Ev.
 */
function ffAudioQueueBuffer_D2(_self: FFStreamFlexMusicBufferState): void {
  throw new Error(
    "FFAudioQueueBuffer::~FFAudioQueueBuffer() @Flexo " +
      "(tail-called from FFStreamFlexMusicBuffer dtors @0x278721 / @0x27877b) not yet transcribed",
  );
}

/**
 * FFAudioQueueBuffer::stopBuffer() — direct symbol __ZN18FFAudioQueueBuffer10stopBufferEv
 * (called from startBuffer @0x2787c5).
 */
function ffAudioQueueBuffer_stopBuffer(_self: FFStreamFlexMusicBufferState): void {
  throw new Error(
    "FFAudioQueueBuffer::stopBuffer() @Flexo " +
      "(called from FFStreamFlexMusicBuffer::startBuffer @0x2787c5) not yet transcribed",
  );
}

/**
 * FFAudioQueueBuffer::startBuffer(long long, bool, FFWorkerQueue*, FFPrerollSync*, NSObject*)
 * — direct symbol at @0x27885e (`jmp` tail-call). This is the base's "real" startBuffer entry.
 */
function ffAudioQueueBuffer_startBuffer(
  _self: FFStreamFlexMusicBufferState,
  _totalFrames: bigint,
  _async: boolean,
  _workerQueue: FFWorkerQueuePtr | null,
  _prerollSync: unknown | null,
  _nsObject: unknown | null,
): void {
  throw new Error(
    "FFAudioQueueBuffer::startBuffer(i64, bool, FFWorkerQueue*, FFPrerollSync*, NSObject*) @Flexo " +
      "(tail-called from FFStreamFlexMusicBuffer::startBuffer @0x27885e) not yet transcribed",
  );
}

/** FFWorkerQueue::FFWorkerQueue(char const*) — direct symbol @0x2787ea. */
function ffWorkerQueue_C1(_self: FFWorkerQueuePtr, _labelUtf8: string): void {
  throw new Error(
    "FFWorkerQueue::FFWorkerQueue(char const*) @Flexo " +
      "(called from FFStreamFlexMusicBuffer::startBuffer @0x2787ea with label " +
      "\"com.apple.flexo.audio-flexmusic-update-thread\") not yet transcribed",
  );
}

/** FFWorkerQueue::~FFWorkerQueue() — direct symbol @0x27880b / @0x27870b (dtor + replace path). */
function ffWorkerQueue_D1(_self: FFWorkerQueuePtr): void {
  throw new Error(
    "FFWorkerQueue::~FFWorkerQueue() @Flexo " +
      "(called from FFStreamFlexMusicBuffer::startBuffer @0x27880b + dtors @0x27870b/@0x27876b) " +
      "not yet transcribed",
  );
}

/** operator new(size_t) — __Znwm stub @0x1497452 (called with 0x88 @0x2787d8; 0x78 @0x27888c/@0x27893d/@0x27898d). */
function opNew(sizeBytes: number): FFWorkerQueuePtr | { __brand: "raw"; sizeBytes: number } {
  throw new Error(
    "operator new(size_t=" + String(sizeBytes) + ") @Flexo stub 0x1497452 " +
      "(called from startBuffer @0x2787d8 with 0x88; addBufferSlice @0x278889/@0x27893d with 0x78) " +
      "not yet transcribed",
  );
}
/** operator delete(void*) — __ZdlPv stub @0x1497404. */
function opDelete(_p: unknown): void {
  throw new Error(
    "operator delete(void*) @Flexo stub 0x1497404 " +
      "(called from startBuffer @0x278813 + dtors @0x278713/@0x278773) not yet transcribed",
  );
}

/** FFAudioBufferList::FFAudioBufferList(BufferType, AudioStreamBasicDescription&, u64, CMTime&). */
function ffAudioBufferList_C1_type(
  _self: unknown,
  _bufferType: number,
  _asbd: AudioStreamBasicDescription,
  _frameCount: bigint,
  _time: unknown,
): void {
  throw new Error(
    "FFAudioBufferList::FFAudioBufferList(BufferType, AudioStreamBasicDescription const&, u64, " +
      "CMTime const&) @Flexo (called from addBufferSlice @0x2788f2) not yet transcribed",
  );
}

/** FFAudioBufferList::FFAudioBufferList(AudioStreamBasicDescription&, u64, CMTime&, ZeroBufferType). */
function ffAudioBufferList_C1_zero(
  _self: unknown,
  _asbd: AudioStreamBasicDescription,
  _frameCount: bigint,
  _time: unknown,
  _zero: number,
): void {
  throw new Error(
    "FFAudioBufferList::FFAudioBufferList(AudioStreamBasicDescription const&, u64, CMTime const&, " +
      "ZeroBufferType) @Flexo (called from addBufferSlice @0x278959) not yet transcribed",
  );
}

/** ObjC message: -[AVAssetReaderOutput containedRolesForRoleKey:] — @0x27891b. */
function objcSendContainedRolesForRoleKey(_receiver: unknown, _key: unknown): unknown | null {
  throw new Error(
    "objc_msgSend -[AVAssetReaderOutput containedRolesForRoleKey:] @Flexo " +
      "(called from addBufferSlice @0x27891b) not yet transcribed",
  );
}
/** CMSampleBufferGetNumSamples(id) — stub @0x149506a. */
function cmSampleBufferGetNumSamples(_sampleBuf: unknown): bigint {
  throw new Error(
    "CMSampleBufferGetNumSamples() @Flexo stub 0x149506a " +
      "(called from addBufferSlice @0x278930) not yet transcribed",
  );
}
/** CMSampleBufferCopyPCMDataIntoAudioBufferList(id, i32, i32, AudioBufferList*) — stub @0x149501c. */
function cmSampleBufferCopyPCMDataIntoAudioBufferList(
  _sampleBuf: unknown,
  _startFrame: number,
  _numFrames: number,
  _abl: unknown,
): number {
  throw new Error(
    "CMSampleBufferCopyPCMDataIntoAudioBufferList() @Flexo stub 0x149501c " +
      "(called from addBufferSlice @0x27896e) not yet transcribed",
  );
}
/** _objc_retain / _objc_release literal-pool call. */
function objcRetain(obj: unknown): unknown {
  throw new Error(
    "objc_retain(id) @Flexo literal-pool @0x1674c0f " +
      "(called from setAssetReaderOutput @0x278afb) not yet transcribed",
  );
}
function objcRelease(_obj: unknown): void {
  throw new Error(
    "objc_release(id) @Flexo literal-pool @0x1674c10 " +
      "(called from setAssetReaderOutput @0x278af2, dtors @0x2786eb/@0x27868b/@0x27874b) " +
      "not yet transcribed",
  );
}

/** kCMTimeInvalid — CoreMedia constant loaded via literal pool @0x1670a0a. */
function kCMTimeInvalid(): unknown {
  throw new Error(
    "kCMTimeInvalid @Flexo literal pool 0x1670a0a " +
      "(used as CMTime arg in addBufferSlice @0x2788df/@0x278945/@0x278995) not yet transcribed",
  );
}

/**
 * Install RIP+0x18f7070 vtable — __ZTV23FFStreamFlexMusicBuffer. Loaded by both ctors at
 * @0x2785cc (C1) and @0x27850c (C2), and by every dtor at their own RIP-relative slot
 * (RIP+0x18f7070 in each case, computed from the leaq immediate). Not resolved in this port.
 */
function installVptr(_self: FFStreamFlexMusicBufferState): void {
  throw new Error(
    "install __ZTV23FFStreamFlexMusicBuffer vptr (RIP+0x18f7070; leaq 0x167ea9d @0x2785cc / " +
      "leaq 0x167eb5d @0x27850c / dtor leaqs @0x2786da/@0x27867a/@0x27873a) not yet transcribed",
  );
}

/**
 * Address of an inline static AudioStreamBasicDescription-ish 16-byte template (movaps
 * 0x12f673f(%rip), %xmm0 @0x2788aa; base + 0x2788b1 = 0x156ef00 in the __TEXT __const region).
 * Used to seed the ASBD locals in addBufferSlice; the remaining fields (mBytesPerPacket=4,
 * mChannelsPerFrame=<u32 from +0xd0>, mBitsPerChannel=0x20) are filled in inline afterwards.
 */
function asbdConstantTemplate(): AudioStreamBasicDescription {
  throw new Error(
    "AudioStreamBasicDescription template @Flexo __const 0x156ef00 " +
      "(movaps 0x12f673f(%rip) @0x2788aa in addBufferSlice) not yet transcribed",
  );
}

// -- Types shared inside this file -------------------------------------------
type FFWorkerQueuePtr = { __brand: "FFWorkerQueue" };
type AudioStreamBasicDescription = { __brand: "ASBD" };
type NSObjectPtr = unknown | null;

/**
 * FFStreamFlexMusicBuffer instance state (offsets recovered from the disasm above).
 * `writePos` / `readPos` are inherited FFAudioQueueBuffer fields; other bases' fields are not
 * modelled here. Every field's origin is documented in the top-of-file STRUCT LAYOUT block.
 */
export interface FFStreamFlexMusicBufferState {
  // +0x020 / +0x028 — inherited base fields; kept typed so shouldUpdateBuffer compiles.
  writePos: bigint;
  readPos: bigint;
  // Own fields:
  numUpdateFrames: bigint;      // +0x0b8
  sliceFrames: bigint;          // +0x0c0
  rate: number;                 // +0x0c8  (f64)
  numChannels: number;          // +0x0d0  (u32)
  slicePendingCount: bigint;    // +0x0d8
  assetReaderOutput: NSObjectPtr; // +0x0e0
  workerQueue: FFWorkerQueuePtr | null; // +0x0e8
}

// ============================================================================
// FULL PORT: C1 ctor — @0x2785b0 (identical body to C2 @0x2784f0; both install RIP+0x18f7070).
// ============================================================================
// Reproduces the two double-to-u64 branchless conversions exactly:
//   +0xb8 = (u64) (2 * rate)
//   +0xc0 = (u64) (rate * 0.5)
// Since JS BigInt handles u64 natively and the underlying float is IEEE-754 double, the disasm's
// (rax with sign-fill mask + rcx post-2^63-subtract) collapses to the plain BigInt cast; no
// bit-exactness is lost.
//
// Numeric verification: rate = 48000.0 =>
//   numUpdateFrames = BigInt(2 * 48000.0) = 96000n
//   sliceFrames     = BigInt(48000.0 * 0.5) = 24000n
// (Matches what any FCP audio unit at 48 kHz would generate in a 0.5 s / 2.0 s window.)

const DOUBLE_TO_U64_PIVOT = 9.223372036854776e18; // = 2^63, @Flexo __const 0x156cac8
const SLICE_RATE_FACTOR   = 0.5;                  // @Flexo __const 0x156ca38

/**
 * Reproduce clang's branchless `(u64)(double)` conversion (movsd 2^63; sub; cvttsd2si; sign-fill;
 * and; or). BigInt(v) for `v >= 0 && v < 2^64` is identical to the assembler sequence.
 */
function doubleToU64(v: number): bigint {
  // Reject NaN explicitly (the disasm's cvttsd2si would produce 0x8000000000000000 on NaN;
  // BigInt() throws — throwing is correct behaviour for the frontier).
  if (!(v === v)) {  // NaN-ordered check per PORTING_SPEC rule 4
    throw new RangeError("doubleToU64: input is NaN");
  }
  if (v < 0 || v >= 2 * DOUBLE_TO_U64_PIVOT) {
    throw new RangeError("doubleToU64: out of u64 range: " + String(v));
  }
  // For 0 <= v < 2^63 the direct BigInt() matches `cvttsd2si` bit-for-bit.
  // For v >= 2^63 the disasm subtracts 2^63, converts, and OR's the sign bit — BigInt handles
  // this range natively as an unsigned integer.
  return BigInt(Math.trunc(v));
}

/**
 * FFStreamFlexMusicBuffer::FFStreamFlexMusicBuffer(u32 numChannels, f64 rate) — @0x2785b0 [C1].
 * The C2 form @0x2784f0 is byte-identical (same ASBD, same vtable target).
 */
export function FFStreamFlexMusicBuffer_C1(
  self: FFStreamFlexMusicBufferState,
  numChannels: number,
  rate: number,
): void {
  // @0x2785c7 / @0x2784ff — base ctor with SortOption::none (esi = 0).
  ffAudioQueueBuffer_C2(self, 0);
  // @0x2785cc / @0x27850c — install our vptr.
  installVptr(self);
  // @0x2785db / @0x27851b — +0xc8 = rate (movsd %xmm1, 0xc8(%rbx)).
  self.rate = rate;
  // @0x2785e3 / @0x278523 — +0xd0 = numChannels (movl %r14d, 0xd0(%rbx)).
  self.numChannels = numChannels | 0;
  // @0x278559..0x27856e / @0x278559.. — zero +0xd8, +0xe0 as a 16-byte pair; +0xe8 = 0.
  self.slicePendingCount = 0n;
  self.assetReaderOutput = null;
  self.workerQueue = null;
  // @0x2785ea..@0x278645 — +0xb8 = (u64)(2*rate).
  self.numUpdateFrames = doubleToU64(2 * rate);
  // @0x278630..@0x27865e — +0xc0 = (u64)(rate * 0.5).
  self.sliceFrames = doubleToU64(rate * SLICE_RATE_FACTOR);
}

/** Alias — the C2 form has the exact same body per the disasm. */
export const FFStreamFlexMusicBuffer_C2 = FFStreamFlexMusicBuffer_C1;

// ============================================================================
// FULL PORT: dtors D1 @0x2786d0, D2 @0x278670, D0 @0x278730.
// ============================================================================
// D1 and D2 are byte-identical (both install RIP+0x18f7070, release +0xe0, delete +0xe8 workerQueue,
// then tail-call FFAudioQueueBuffer::~FFAudioQueueBuffer via `jmp`). D0 is D2 + `operator delete`.

function FFStreamFlexMusicBuffer_dtorBody(self: FFStreamFlexMusicBufferState): void {
  // Install our own vptr again (defensive: the derived-class dtor may have swapped it).
  installVptr(self);
  // @0x278684 / @0x2786eb / @0x27868b — objc_release(+0xe0).
  objcRelease(self.assetReaderOutput);
  self.assetReaderOutput = null;
  // Save workerQueue, zero the slot, then delete-if-non-null.
  const wq = self.workerQueue;
  self.workerQueue = null;
  if (wq !== null) {
    ffWorkerQueue_D1(wq);
    opDelete(wq);
  }
  // Tail-call FFAudioQueueBuffer::~FFAudioQueueBuffer.
  ffAudioQueueBuffer_D2(self);
}

/** FFStreamFlexMusicBuffer::~FFStreamFlexMusicBuffer() — @0x278670 [D2]. */
export function FFStreamFlexMusicBuffer_D2(self: FFStreamFlexMusicBufferState): void {
  FFStreamFlexMusicBuffer_dtorBody(self);
}
/** FFStreamFlexMusicBuffer::~FFStreamFlexMusicBuffer() — @0x2786d0 [D1]. Identical to D2. */
export function FFStreamFlexMusicBuffer_D1(self: FFStreamFlexMusicBufferState): void {
  FFStreamFlexMusicBuffer_dtorBody(self);
}
/** FFStreamFlexMusicBuffer::~FFStreamFlexMusicBuffer() — @0x278730 [D0]. D2 body + `operator delete`. */
export function FFStreamFlexMusicBuffer_D0(self: FFStreamFlexMusicBufferState): void {
  FFStreamFlexMusicBuffer_dtorBody(self);
  opDelete(self);
}

// ============================================================================
// FULL PORT: shouldUpdateBuffer — @0x278a80
// ============================================================================
// Disasm (19 lines):
//   rax = self->readPos      (+0x28)
//   cmp writePos (+0x20) vs rax:
//     if writePos <= readPos  -> compare 0 with sliceFrames -> setb (i.e. sliceFrames != 0)
//     else                    -> rax = writePos - readPos; compare rax < sliceFrames (+0xc0)
//                                setb -> return that bool.
// Semantics: "there is at most one slice-worth of data in the queue" => update is due.

/** FFStreamFlexMusicBuffer::shouldUpdateBuffer() const — @0x278a80. */
export function FFStreamFlexMusicBuffer_shouldUpdateBuffer(self: FFStreamFlexMusicBufferState): boolean {
  // cmpq %rax, 0x20(%rdi); jbe 0x278aa5 — "writePos <= readPos" path.
  if (self.writePos <= self.readPos) {
    // xorl %eax,%eax; cmpq 0xc0(%rdi), %rax; setb %al  =>  (0 < sliceFrames)
    return 0n < self.sliceFrames;
  }
  // rax = writePos - readPos; cmpq 0xc0(%rdi), %rax; setb %al  =>  (rax < sliceFrames)
  const backlog = self.writePos - self.readPos;
  return backlog < self.sliceFrames;
}

// ============================================================================
// FULL PORT: getNumUpdateFrames — @0x278ac0
// ============================================================================
// Disasm: `movq 0xb8(%rdi), %rax; retq` — one field read.

/** FFStreamFlexMusicBuffer::getNumUpdateFrames() const — @0x278ac0. */
export function FFStreamFlexMusicBuffer_getNumUpdateFrames(self: FFStreamFlexMusicBufferState): bigint {
  return self.numUpdateFrames;
}

// ============================================================================
// FULL PORT: setAssetReaderOutput — @0x278ad0
// ============================================================================
// Disasm (20 lines):
//   if (self->assetReaderOutput == newValue) return;   // (cmpq %rsi, 0xe0(%rdi); je 0x278b0c)
//   FFAudioQueueBuffer::stopBuffer(self);
//   objc_release(self->assetReaderOutput);
//   self->assetReaderOutput = objc_retain(newValue);

/** FFStreamFlexMusicBuffer::setAssetReaderOutput(AVAssetReaderOutput*) — @0x278ad0. */
export function FFStreamFlexMusicBuffer_setAssetReaderOutput(
  self: FFStreamFlexMusicBufferState,
  newOutput: NSObjectPtr,
): void {
  if (self.assetReaderOutput === newOutput) {
    return;                                                              // @0x278ad7 je 0x278b0c
  }
  ffAudioQueueBuffer_stopBuffer(self);                                   // @0x2787e0 style call
  objcRelease(self.assetReaderOutput);                                   // @0x278af2
  self.assetReaderOutput = objcRetain(newOutput);                        // @0x278afb / @0x278b01
}

// ============================================================================
// FULL PORT: startBuffer — @0x2787a0
// ============================================================================
// Disasm (62 lines):
//   stopBuffer(self);                                                     // @0x2787c5
//   if (async /*r15d*/) {                                                 // @0x2787cd testl je 0x278818
//     wq = new FFWorkerQueue(0x88 bytes, "com.apple.flexo.audio-flexmusic-update-thread");
//     old = self->workerQueue;
//     self->workerQueue = wq;
//     if (old != NULL) { FFWorkerQueue::~FFWorkerQueue(old); operator delete(old); }
//   }
//   // Post-async block @0x278818:
//   //   %r13 == startFrame (2nd arg); rax = -startFrame; sar 63; and rax
//   //   => neg = max(0, -startFrame)  (branchless "negative-part" of startFrame)
//   self->slicePendingCount = -min(startFrame, 0);         // stored to +0xd8 @0x278825
//   // totalFrames = durationFrames + slicePendingCount     // r13 += -0x38(%rbp) @0x27882d
//   // sanitized = max(0, totalFrames)                       // xorl esi,esi; testq r13; cmovg r13,rsi
//   FFAudioQueueBuffer::startBuffer(self, sanitized, async, self->workerQueue, prerollSync, nsObj);
//   // (tail-call jmp @0x27885e).

/** FFStreamFlexMusicBuffer::startBuffer(i64, i64, bool, FFPrerollSync*, NSObject*) — @0x2787a0. */
export function FFStreamFlexMusicBuffer_startBuffer(
  self: FFStreamFlexMusicBufferState,
  startFrame: bigint,             // rsi / r13
  durationFrames: bigint,         // rdx  -> -0x38(%rbp)
  async: boolean,                 // ecx / r15d
  prerollSync: unknown | null,    // r8   -> -0x40(%rbp)
  nsObject: unknown | null,       // r9
): void {
  ffAudioQueueBuffer_stopBuffer(self);                                   // @0x2787c5

  if (async) {                                                            // @0x2787cd testl %r15d
    const wq = opNew(0x88) as FFWorkerQueuePtr;                           // @0x2787d3/@0x2787d8
    ffWorkerQueue_C1(wq, "com.apple.flexo.audio-flexmusic-update-thread"); // @0x2787ea
    const old = self.workerQueue;                                         // @0x2787ef
    self.workerQueue = wq;                                                // @0x2787f7
    if (old !== null) {                                                   // @0x2787ff testq
      ffWorkerQueue_D1(old);                                              // @0x27880b
      opDelete(old);                                                      // @0x278813
    }
  }

  // Branchless negative-part: rax = -startFrame; r13 = sar63(startFrame) & rax  => max(0, -startFrame).
  //  (In BigInt land: `startFrame < 0 ? -startFrame : 0`.)
  const negPart = startFrame < 0n ? -startFrame : 0n;                     // @0x27881b..@0x278822
  self.slicePendingCount = negPart;                                       // @0x278825

  // totalFrames = durationFrames + negPart  (r13 += -0x38(%rbp) @0x27882d)
  const total = durationFrames + negPart;
  // sanitized = max(0, total)  (xorl esi,esi; testq r13,r13; cmovg r13,rsi @0x278831..@0x278836)
  const sanitized = total > 0n ? total : 0n;

  ffAudioQueueBuffer_startBuffer(                                         // @0x27885e tail-call
    self,
    sanitized,
    async,
    self.workerQueue,
    prerollSync,
    nsObject,
  );
}

// ============================================================================
// SKELETON: addBufferSlice — @0x278880  (120 disasm lines)
// ============================================================================
// The full body dispatches on two branches:
//   (A) self->slicePendingCount != 0  (@0x2788d0 testq %r12; je 0x27890a):
//         seed local ASBD (RIP+0x156ef00 template @0x2788aa, plus mBytesPerPacket=4,
//         mChannelsPerFrame=numChannels, mBitsPerChannel=0x20 @0x2788b5..@0x2788c6);
//         alloc FFAudioBufferList(0x78 bytes @0x2788d2/@0x2788d7);
//         FFAudioBufferList::FFAudioBufferList(BufferType, ASBD&, slicePendingCount, kCMTimeInvalid)
//         @0x2788f2 (SortOption=0 hard-coded); store the new buffer at *(rbx) (the caller-supplied
//         output slot); zero self->slicePendingCount.
//   (B) else  (@0x27890a):
//         %r15 saves rdx (the output slot); call -[assetReaderOutput containedRolesForRoleKey:...];
//         if the sample buffer is nil (@0x278928 je 0x278988): allocate a *silent* ASBD-shaped
//         FFAudioBufferList (ZeroBufferType path @0x278959), store, return.
//         Otherwise: sampleCount = CMSampleBufferGetNumSamples(sampleBuf); alloc + init the
//         buffer via the non-ZeroBufferType ctor; run CMSampleBufferCopyPCMDataIntoAudioBufferList
//         against +0x28 of the new buffer (@0x27896e); if the copy fails, zero *(rbx) and delete-
//         via-vtable-slot-1 the buffer (@0x278977/@0x278982; vtable[0x8] = D0-form).
// The remaining tail (~50 lines) is the CMSampleBufferInvalidate / release path.
//
// Every extern in both branches is stubbed above; wiring the control flow requires an
// FFAudioBufferList TS shape (a whole separate class with its own layout to be ported first).
// Rather than half-port and leak a plausible-looking append that skips half the state, this
// stub throws with an inventory of the deferred branches so the frontier reports them.

export function FFStreamFlexMusicBuffer_addBufferSlice(
  _self: FFStreamFlexMusicBufferState,
  _anchorFrame: bigint,
): void {
  throw new Error(
    "FFStreamFlexMusicBuffer::addBufferSlice(i64) @Flexo 0x278880 (120 lines) not yet transcribed. " +
      "Branches: (A) slicePendingCount!=0 @0x2788d0 -> FFAudioBufferList::C1(BufferType,ASBD,u64,CMTime) " +
      "@0x2788f2 with ASBD template @0x156ef00. (B) slicePendingCount==0 @0x27890a -> " +
      "-[AVAssetReaderOutput containedRolesForRoleKey:] @0x27891b -> " +
      "CMSampleBufferGetNumSamples @0x278930 -> either ZeroBufferType ctor @0x278959 or " +
      "CMSampleBufferCopyPCMDataIntoAudioBufferList @0x27896e path. All externs above are stubbed.",
  );
}
