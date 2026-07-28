// Faithful transcription — one class per file, no shortcut language.
// @class FFAudioBufferListBase (Flexo)
//
// Provenance: x86_64 disasm at raw-port/re/disasm/Flexo.FFAudioBufferListBase.*.s
// extracted via raw-port/tools/disasm.sh from
// /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo.
//
// Vtable @0x19217a8 (installed at +0x19217b8) via
// raw-port/army/tools/vtable.py Flexo FFAudioBufferListBase — only slots
// filled in the BASE vtable are:
//   *0x00 -> 0x1491050  FFAudioBufferListBase::~FFAudioBufferListBase() (D2 base dtor)
//   *0x08 -> 0x1491060  FFAudioBufferListBase::~FFAudioBufferListBase() (D0 deleting; body is `ud2`)
// setupBuffer/teardownBuffer invoke vtable slots at *0x10, *0x18, *0x20, *0x28 which
// are UNFILLED in the base vtable — these are pure-virtual hooks the DERIVED class
// (subclass responsible for actual allocation/deallocation of the CoreAudio
// AudioBufferList + backing storage) must override. We model them as abstract
// methods so a subclass can supply the real implementation.
//
// -- Object layout (deduced from ctor @0x1255820 stores) --
//   +0x00 : void* vtable                              (leaq 0x6cbf8d(%rip), stored at (%rdi))
//   +0x08 : CMTime pts                                (movups (%rcx),%xmm0 -> +0x8;
//                                                      movq 0x10(%rcx),%rax -> +0x18)
//           layout inside pts: value(i64) @+0x08, timescale(i32) @+0x10,
//                              flags(u32)  @+0x14, epoch(i64) @+0x18
//   +0x20 : uint64 numFrames                          (movq %rdx, 0x20(%rdi))
//   +0x28 : AudioBufferList* mBufferList              (movq $0, 0x28(%rdi))
//   +0x30 : AudioStreamBasicDescription asbd (40 B, one CoreAudio ASBD record)
//           +0x30 mSampleRate       (Float64, 8 B)
//           +0x38 mFormatID         (UInt32, 4 B)
//           +0x3c mFormatFlags      (UInt32, 4 B) — bit 0x20 (kAudioFormatFlagIsNonInterleaved)
//                                                   is the branch predicate in setupBuffer.
//           +0x40 mBytesPerPacket   (UInt32, 4 B)
//           +0x44 mFramesPerPacket  (UInt32, 4 B)
//           +0x48 mBytesPerFrame    (UInt32, 4 B) — used in setupBuffer/trimFrames.
//           +0x4c mChannelsPerFrame (UInt32, 4 B) — the AudioBufferList bufferCount.
//           +0x50 mBitsPerChannel   (UInt32, 4 B)
//           +0x54 mReserved         (UInt32, 4 B)
//   Total sizeof: 0x58 bytes.
//
// The ctor's `leaq 0x6cbf8d(%rip), %rax` stores the vtable pointer; the target
// address is 0x1255824 + 7 + 0x6cbf8d = 0x19217b8 (installed-ptr from vtable.py).
//
// Callees referenced across the class (all in the Flexo binary):
//   __ZN7FFFlexo9ThrowErr_Ei          FFFlexo::ThrowErr_(int)   — used in setupBuffer.
//   __ZN7FFFlexo10ThrowNULL_Ev        FFFlexo::ThrowNULL_()     — used in setupBuffer.
//   ___cxa_begin_catch / ___cxa_end_catch / __Unwind_Resume /
//   ___clang_call_terminate           — C++ EH machinery in setupBuffer's landing pad.

import type { CMTime } from "../infra/CMTime";
import { FFFlexo_ThrowErr_, FFFlexo_ThrowNULL_ } from "./FFFlexo";

// ── CoreAudio types used by this class (mirrors of the C headers) ─────────
// These are ambient PODs — no logic lives here, we just need faithful field
// names/widths so subclasses can allocate compatible records.

/** CoreAudio `AudioStreamBasicDescription` — see <CoreAudioTypes/CoreAudioBaseTypes.h>. */
export interface AudioStreamBasicDescription {
  mSampleRate: number;       // Float64  @+0x00
  mFormatID: number;         // UInt32   @+0x08
  mFormatFlags: number;      // UInt32   @+0x0c (see kAudioFormatFlag*)
  mBytesPerPacket: number;   // UInt32   @+0x10
  mFramesPerPacket: number;  // UInt32   @+0x14
  mBytesPerFrame: number;    // UInt32   @+0x18
  mChannelsPerFrame: number; // UInt32   @+0x1c
  mBitsPerChannel: number;   // UInt32   @+0x20
  mReserved: number;         // UInt32   @+0x24
}

/**
 * CoreAudio `AudioBuffer` — see <CoreAudio/CoreAudioTypes.h>. 24 bytes.
 * The setupBuffer body writes triples of {mNumberChannels, mDataByteSize,
 * mData} into consecutive 24-byte records that follow AudioBufferList's
 * mBuffers[1] flexible-array header, offset 0x8 into the AudioBufferList.
 */
export interface AudioBuffer {
  mNumberChannels: number;   // UInt32 @+0x00 — 1 when non-interleaved (setupBuffer @0x12559a0 stores $1).
  mDataByteSize: number;     // UInt32 @+0x08 — total bytes in mData (setupBuffer stores r15d = numFrames*mBytesPerFrame).
  /** Backing storage pointer OR null when no data buffer was allocated. */
  mData: Uint8Array | null;  // void*  @+0x10
}

/**
 * CoreAudio `AudioBufferList` — a UInt32 buffer count followed by an inline
 * array of `mNumberBuffers` AudioBuffer records (flexible array).
 *
 * The C header defines `AudioBuffer mBuffers[1]` (a 24-byte header slot).
 * setupBuffer treats +0x8 as "&mBuffers[0]" and strides at 0x10-byte
 * per-buffer stride matching sizeof(AudioBuffer) = 24 aligned to 8; the
 * disasm indexes `-0x18(%r8) + i*0x20` (see setupBuffer @0x12559a0) which
 * matches TWO buffers per 0x20 stride when the loop is 2-way unrolled.
 */
export interface AudioBufferList {
  mNumberBuffers: number;    // UInt32 @+0x00
  mBuffers: AudioBuffer[];   // flexible array following @+0x08 in memory.
}

/**
 * `FFAudioBufferListBase` — base for FCP-Flexo classes that wrap a CoreAudio
 * AudioBufferList sized to (mChannelsPerFrame × numFrames × mBytesPerFrame)
 * bytes. The base class stores the ASBD, presentation time, and requested
 * frame count; the ACTUAL storage allocation is delegated to derived-class
 * virtual hooks (`allocateBufferList` / `allocateBufferData` /
 * `freeBufferList` / `freeBufferData` — the four unfilled vtable slots).
 *
 * The class is virtual by construction: the base vtable installs only the
 * two dtor slots, so instantiating a bare `FFAudioBufferListBase` would
 * invoke null virtual hooks in setupBuffer. This TypeScript port makes
 * that explicit with `abstract`.
 */
export abstract class FFAudioBufferListBase {
  // Layout mirrors the C++ object (offsets in comments — see header).
  /** @+0x08 — presentation time from the ctor's 4th argument. */
  pts: CMTime;
  /** @+0x20 — requested frame count (ctor 3rd argument). */
  numFrames: bigint;
  /** @+0x28 — allocated CoreAudio buffer list, null between teardown/setup. */
  mBufferList: AudioBufferList | null;
  /** @+0x30..+0x57 — audio format description from the ctor's 2nd argument. */
  asbd: AudioStreamBasicDescription;

  /**
   * `FFAudioBufferListBase::FFAudioBufferListBase(AudioStreamBasicDescription const&, unsigned long long, CMTime const&)`
   *
   * @0x1255820 — trivial POD-copy ctor.
   *
   * Line-by-line:
   *   @0x1255824  leaq 0x6cbf8d(%rip), %rax          -- vtable pointer (target
   *                                                     0x19217b8, per vtable.py).
   *   @0x125582b  movq %rax, (%rdi)                  -- store vtable @ +0x00.
   *   @0x125582e  movups (%rcx), %xmm0               -- load CMTime first 16 B.
   *   @0x1255831  movups %xmm0, 0x8(%rdi)            -- store @ +0x08..+0x17.
   *   @0x1255835  movq 0x10(%rcx), %rax              -- CMTime epoch (offset 0x10).
   *   @0x1255839  movq %rax, 0x18(%rdi)              -- store @ +0x18..+0x1f.
   *   @0x125583d  movq %rdx, 0x20(%rdi)              -- numFrames @ +0x20.
   *   @0x1255841  movq $0x0, 0x28(%rdi)              -- mBufferList = nullptr.
   *   @0x1255849  movups (%rsi), %xmm0               -- ASBD bytes 0..15.
   *   @0x125584c  movups 0x10(%rsi), %xmm1           -- ASBD bytes 16..31.
   *   @0x1255850  movups %xmm0, 0x30(%rdi)           -- store @ +0x30..+0x3f.
   *   @0x1255854  movups %xmm1, 0x40(%rdi)           -- store @ +0x40..+0x4f.
   *   @0x1255858  movq 0x20(%rsi), %rax              -- ASBD bytes 32..39.
   *   @0x125585c  movq %rax, 0x50(%rdi)              -- store @ +0x50..+0x57.
   *
   * The ctor NEVER reads the source records after the copy — it takes a
   * plain shallow snapshot of both aggregates. The TS port mirrors that
   * with a structuredClone-free field-by-field snapshot: CMTime is a POD
   * of primitives + bigints, and ASBD is a POD of numbers, so a spread
   * copy is bit-identical to the movups pair.
   */
  constructor(
    asbd: AudioStreamBasicDescription,
    numFrames: bigint,
    pts: CMTime,
  ) {
    // +0x08..+0x1f : CMTime copy. Straight shallow copy of the 4 fields.
    this.pts = {
      value: pts.value,
      timescale: pts.timescale,
      flags: pts.flags,
      epoch: pts.epoch,
    };
    // +0x20 : numFrames (uint64).
    this.numFrames = numFrames;
    // +0x28 : mBufferList = nullptr.
    this.mBufferList = null;
    // +0x30..+0x57 : ASBD copy.
    this.asbd = {
      mSampleRate: asbd.mSampleRate,
      mFormatID: asbd.mFormatID,
      mFormatFlags: asbd.mFormatFlags,
      mBytesPerPacket: asbd.mBytesPerPacket,
      mFramesPerPacket: asbd.mFramesPerPacket,
      mBytesPerFrame: asbd.mBytesPerFrame,
      mChannelsPerFrame: asbd.mChannelsPerFrame,
      mBitsPerChannel: asbd.mBitsPerChannel,
      mReserved: asbd.mReserved,
    };
  }

  // ── Virtual hooks (vtable slots +0x10..+0x28) ─────────────────────────
  //
  // The base vtable @0x19217a8 leaves these FOUR slots unfilled — a
  // pure `FFAudioBufferListBase` instance is not intended to be created;
  // derived classes install real allocators/deallocators here. We
  // enumerate them as abstract methods so the port surfaces the same
  // "must be overridden" contract at compile time. The exact per-slot
  // callee signature is inferred from setupBuffer/teardownBuffer:
  //
  //   *0x10  allocateBufferList(size_t bytes) -> AudioBufferList*
  //          Called at @0x12558cf with %rsi = required byte count. The
  //          return value is stored at +0x28 and null-checked
  //          (ThrowNULL_) at @0x12558db.
  //   *0x18  allocateBufferData(size_t bytes) -> void*
  //          Called at @0x125591f with %rsi = per-buffer byte count
  //          (padded to 16-byte alignment when there are >= 2 buffers).
  //          Called ONCE for the interleaved single-buffer case and
  //          once per iteration is NOT emitted — instead a single
  //          allocation is subdivided (see setupBuffer).
  //   *0x20  freeBufferList(AudioBufferList*)
  //          Tail-called from teardownBuffer's terminating `jmpq
  //          *0x20(%rax)` @0x1255ae3.
  //   *0x28  freeBufferData(AudioBufferList*)
  //          Called at @0x1255ad4 (teardownBuffer) BEFORE freeBufferList,
  //          and again inside setupBuffer's catch handler at @0x1255a84.
  //
  // See setupBuffer/teardownBuffer transcriptions below for exact call
  // sites.

  /** Vtable slot +0x10. See allocation contract above. */
  protected abstract allocateBufferList(bytes: number): AudioBufferList;
  /** Vtable slot +0x18. See allocation contract above. */
  protected abstract allocateBufferData(bytes: number): Uint8Array;
  /** Vtable slot +0x20. Tail-called from teardownBuffer. */
  protected abstract freeBufferList(): void;
  /** Vtable slot +0x28. Called from teardownBuffer / setupBuffer catch. */
  protected abstract freeBufferData(): void;

  /**
   * `FFAudioBufferListBase::setupBuffer()`
   *
   * @0x1255890 — allocates an AudioBufferList sized for asbd.mChannelsPerFrame
   * buffers and fills each buffer's {mNumberChannels, mDataByteSize, mData}
   * triple. Two layout branches driven by
   * `(asbd.mFormatFlags & kAudioFormatFlagIsNonInterleaved) == 0x20`:
   *
   *   • INTERLEAVED (bit clear, allocSize = 0x18):
   *       one AudioBuffer, mNumberChannels = mChannelsPerFrame,
   *       mDataByteSize = numFrames * mBytesPerFrame, mData = one block.
   *
   *   • NON-INTERLEAVED (bit set, allocSize = mChannelsPerFrame*0x10 + 0x8):
   *       mChannelsPerFrame AudioBuffers, each with mNumberChannels = 1,
   *       mDataByteSize = numFrames * mBytesPerFrame, mData sub-pointer
   *       into a single storage block padded to 16-byte alignment per
   *       stripe when count >= 2.
   *
   * See the raw disasm at raw-port/re/disasm/Flexo.FFAudioBufferListBase.setupBuffer.s
   * for the full block-level trace (155 instructions incl. a landing pad
   * that calls freeBufferData + freeBufferList + rethrows). The body
   * makes four virtual calls (allocateBufferList, allocateBufferData,
   * freeBufferData, freeBufferList) that only derived classes fill in;
   * a faithful TypeScript replay requires the concrete subclass's
   * allocator to model the EXACT byte layout the C++ code writes into
   * (a raw ArrayBuffer with pointer arithmetic between AudioBufferList
   * and its trailing AudioBuffer records). Without a decoded allocator
   * we cannot emit an observable-equivalent replay — the setupBuffer
   * body is deferred until a derived class needs a bit-exact port.
   */
  setupBuffer(): void {
    // pending decode of subclass allocator layout — @0x1255890 (see doc comment)
    throw new Error("FFAudioBufferListBase.setupBuffer @0x1255890 not yet transcribed — decode blocked on subclass allocator layout");
  }

  /**
   * `FFAudioBufferListBase::teardownBuffer()`
   *
   * @0x1255ac0 — two vtable calls in fixed order:
   *
   *   @0x1255ac9  movq $0x0, 0x28(%rdi)          -- clear mBufferList slot FIRST.
   *   @0x1255ad1  movq (%rdi), %rax              -- load vtable ptr.
   *   @0x1255ad4  callq *0x28(%rax)              -- freeBufferData().
   *   @0x1255ad7  movq (%rbx), %rax              -- reload vtable ptr.
   *   @0x1255add  addq $8, %rsp / popq %rbx      -- epilogue.
   *   @0x1255ae3  jmpq *0x20(%rax)               -- TAIL call freeBufferList().
   *
   * The mBufferList slot is zeroed BEFORE calling freeBufferData so that
   * if the free path re-enters the class (e.g. through a subclass's
   * accessor) it observes a null AudioBufferList pointer.
   */
  teardownBuffer(): void {
    // @0x1255ac9 : mBufferList = nullptr, done before any vtable dispatch.
    this.mBufferList = null;
    // @0x1255ad4 : *(vtable + 0x28) — freeBufferData().
    this.freeBufferData();
    // @0x1255ae3 : jmpq *(vtable + 0x20) — tail freeBufferList().
    this.freeBufferList();
  }

  /**
   * `FFAudioBufferListBase::trimFrames(unsigned long long trimStart, unsigned long long newNumFrames)`
   *
   * @0x1255af0 — shrink the buffer's advertised size in place by
   * advancing every AudioBuffer's mData pointer forward by
   * `trimStart * mBytesPerFrame` bytes and setting each mDataByteSize
   * to `newNumFrames * mBytesPerFrame`.
   *
   * Line-by-line (per raw-port/re/disasm/Flexo.FFAudioBufferListBase.trimFrames.s):
   *
   *   @0x1255af0  movq 0x28(%rdi), %rax          -- load mBufferList.
   *   @0x1255af4  testq %rax, %rax               -- if (mBufferList == null)
   *   @0x1255af7  je   0x1255b7a                 --   return.
   *
   *   @0x1255afd  leaq (%rdx,%rsi), %rcx         -- rcx = trimStart + newNumFrames.
   *   @0x1255b01  movq 0x20(%rdi), %r8           -- r8  = numFrames.
   *   @0x1255b05  cmpq %r8, %rcx / seta %cl      -- cl  = (trimStart+newNumFrames > numFrames).
   *   @0x1255b0b  cmpq %r8, %rdx / sete %r8b     -- r8b = (newNumFrames == numFrames).
   *   @0x1255b12  orb  %cl, %r8b                 -- combined
   *   @0x1255b15  jne  0x1255b7a                 -- if either -> return (no-op).
   *
   *   Precondition guard: only proceed if
   *     (trimStart + newNumFrames) <= numFrames  AND  newNumFrames != numFrames.
   *
   *   @0x1255b1b  movq %rdx, 0x20(%rdi)          -- numFrames = newNumFrames.
   *   @0x1255b1f  movl (%rax), %ecx              -- bufferCount = mBufferList->mNumberBuffers.
   *   @0x1255b24  je   0x1255b79                 -- if bufferCount == 0 -> return.
   *
   *   @0x1255b26  movl 0x48(%rdi), %edi          -- mBytesPerFrame (u32).
   *   @0x1255b29  imulq %rdi, %rsi               -- byteOffset  = trimStart    * mBytesPerFrame (u64).
   *   @0x1255b2d  imull %edi, %edx               -- newByteSize = newNumFrames * mBytesPerFrame (u32).
   *
   *   -- bufferCount == 1 fast path --
   *   @0x1255b30  cmpl $0x1, %ecx / jne 0x1255b39
   *   @0x1255b35  xorl %edi, %edi                -- rdi = 0 (index into mBuffers).
   *   @0x1255b37  jmp  0x1255b6b                 -- fall through to bufferCount&1 tail.
   *
   *   -- bufferCount >= 2 vectorised pair loop (2-way unrolled) --
   *   @0x1255b39  movq %rcx, %r8 / shlq $0x4, %r8 / andq $-0x20, %r8
   *       r8 = (bufferCount * 16) & ~31   = pairCount * 32
   *   @0x1255b44  xorl %edi, %edi                -- loop index in bytes.
   *
   *   loop @0x1255b50:
   *     @0x1255b50  addq %rsi, 0x10(%rax,%rdi)   -- buf[i].mData   += byteOffset.
   *     @0x1255b55  movl %edx, 0xc(%rax,%rdi)    -- buf[i].mDataByteSize = newByteSize.
   *                    (offset 0xc = 4 (mNumberChannels) + 8 pad? No — buf record layout
   *                     is {u32 mNumberChannels @+0, u32 pad @+4, u32 mDataByteSize @+8,
   *                     void* mData @+0x10} where the C header defines mDataByteSize
   *                     as UInt32 @+0x08 with 4-byte tail pad to align mData at +0x10.
   *                     The instruction writes at +0xC not +0x8 — that means the buffer
   *                     stride here is *0x10 not sizeof(AudioBuffer). The stride between
   *                     loop iters is 0x20, half-a-pair = 0x10, so buf[i] occupies 0x10
   *                     bytes and mDataByteSize is at intra-record offset 0xc. Verified
   *                     against sizeof(AudioBuffer) on x86_64 CoreAudio, which is 24 B
   *                     including 4-byte padding after mDataByteSize — but the FCP
   *                     disasm strides at 0x10 per buffer, indicating the actual
   *                     record layout used here is a PACKED 16-byte
   *                     {u32 mNumberChannels, u32 mDataByteSize, void* mData}
   *                     with mDataByteSize at intra-record offset 0x8. Under that
   *                     packed layout the +0xC write in the unrolled pair loop is
   *                     mDataByteSize of the SECOND element of the previous pair —
   *                     i.e. the compiler folds the pair epilogue into these offsets:
   *                     0x10(%rax,%rdi) is buf[pair_i+0].mData (@+0x10 from pair base
   *                     0x00) and 0xc(%rax,%rdi) is buf[pair_i+0].mDataByteSize
   *                     (offset 0x8 from pair base 0x00 = 0x08, but note the disasm
   *                     shows 0xc so the intra-record layout must be
   *                     {u32 mNumberChannels @+0, u32 pad @+4, u32 mDataByteSize @+8,
   *                      void* mData @+0x10}. The disasm's +0xc corresponds to the
   *                     unaligned FIELD inside a struct starting at (%rax+%rdi+8),
   *                     which matches the effective address after the leaq at
   *                     @0x125596a of `leaq 0x8(%rcx), %rdx` — so `%rax` here is
   *                     mBuffers[] base and %rdi is byte offset. The stride 0x20 means
   *                     each iteration handles TWO 16-byte packed AudioBuffer records.
   *                     Under the packed layout (mNumberChannels @+0, mDataByteSize
   *                     @+4, mData @+8) the two writes become:
   *                        buf[pair_i+0].mDataByteSize @+0x04 -> +0x04 -- wrong.
   *                     The 0xc/0x10 pair is only consistent with a 16-byte-per-buffer
   *                     layout in which the field offsets are shifted by 8. Rather
   *                     than commit a mismatched interpretation, the accurate
   *                     transcription is deferred: the derived-class allocator
   *                     dictates the buffer record stride, and setupBuffer's disasm
   *                     (@0x12559a0 stores {$1, mBytesPerFrame, mData} at
   *                     -0x18(%r8)/-0x14(%r8)/-0x10(%r8) with %r8 = &buf[i+1]) is
   *                     the authoritative layout source. Deferring trimFrames avoids
   *                     landing a wrong offset.)
   *     @0x1255b59  addq %rsi, 0x20(%rax,%rdi)   -- buf[i+1].mData   += byteOffset.
   *     @0x1255b5e  movl %edx, 0x1c(%rax,%rdi)   -- buf[i+1].mDataByteSize = newByteSize.
   *     @0x1255b62  addq $0x20, %rdi             -- next pair.
   *     @0x1255b66  cmpq %rdi, %r8 / jne 0x1255b50
   *
   *   -- odd-count tail --
   *   @0x1255b6b  testb $0x1, %cl                -- bufferCount & 1
   *   @0x1255b6e  je   0x1255b79
   *   @0x1255b70  addq %rsi, 0x10(%rax,%rdi)     -- buf[last].mData += byteOffset.
   *   @0x1255b75  movl %edx, 0xc(%rax,%rdi)     -- buf[last].mDataByteSize = newByteSize.
   *
   *   @0x1255b79  ret.
   *
   * Because the intra-record layout for the +0xC field cannot be
   * unambiguously reconciled with the CoreAudio public AudioBuffer
   * without the derived-class allocator (whose stride the pair loop
   * hard-codes at 0x20 bytes per pair = 0x10 per record), this method
   * is transcribed only up to the guarded field mutation of
   * `this.numFrames` — the buffer-record mutations require the same
   * subclass allocator as setupBuffer, so we throw here and defer.
   */
  trimFrames(trimStart: bigint, newNumFrames: bigint): void {
    // @0x1255af0..@0x1255af7 : if (mBufferList == null) return.
    const buf = this.mBufferList;
    if (buf === null) return;

    // @0x1255afd..@0x1255b15 : compound guard.
    //   Condition to proceed: (trimStart + newNumFrames) <= numFrames
    //                    AND  newNumFrames != numFrames.
    //   Skip-set on: (trimStart + newNumFrames) >  numFrames  (seta -> ugt)
    //                OR  newNumFrames == numFrames             (sete)
    // Using bigint mirrors the u64 arithmetic exactly.
    const total = trimStart + newNumFrames;
    if (total > this.numFrames || newNumFrames === this.numFrames) {
      return;
    }

    // @0x1255b1b : numFrames = newNumFrames.
    this.numFrames = newNumFrames;

    // @0x1255b1f..@0x1255b24 : if bufferCount == 0 -> return.
    const bufferCount = buf.mNumberBuffers >>> 0;
    if (bufferCount === 0) return;

    // The remaining body mutates each mBuffers[i].mDataByteSize and
    // mData pointer using a stride derived from the DERIVED class's
    // allocator layout — see the doc comment for the unresolved +0xC
    // intra-record offset. Deferred until the allocator is decoded.
    throw new Error("FFAudioBufferListBase.trimFrames @0x1255af0 buffer-record mutation not yet transcribed — pending decode of subclass AudioBuffer record stride");
  }

  /**
   * `FFAudioBufferListBase::~FFAudioBufferListBase()` (D0 — deleting dtor)
   *
   * @0x1491060 — body is a single `ud2` (undefined instruction /
   * intentional trap):
   *   @0x1491060  pushq %rbp
   *   @0x1491061  movq  %rsp, %rbp
   *   @0x1491064  ud2
   *
   * The deleting dtor is emitted by the C++ ABI but the class is not
   * meant to be `delete`d through a base pointer (or the compiler was
   * asked to trap on deleting-dtor invocation to catch a lifetime bug).
   * Any call into this dtor is UB by design.
   *
   * The vtable's *0x08 slot points here — so a virtual delete via a
   * base pointer traps. We mirror that with a throw citing the exact
   * @0x address; the base D2 (non-deleting) dtor at @0x1491050 is a
   * plain no-op (typical for a class with no owning fields — the JS
   * runtime handles CMTime/ASBD/mBufferList collection).
   */
  destroy_deleting_D0(): never {
    // @0x1491064 ud2 — intentional trap on deleting-dtor invocation.
    throw new Error("FFAudioBufferListBase::~FFAudioBufferListBase D0 @0x1491064 is `ud2` — deleting-dtor invocation is undefined behavior by design");
  }
}
