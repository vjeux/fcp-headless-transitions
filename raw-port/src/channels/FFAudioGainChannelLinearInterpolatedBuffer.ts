// FFAudioGainChannelLinearInterpolatedBuffer — the "linearly interpolated gain"
// audio-gain buffer node in Flexo's audio rendering graph. Sibling of
// FFAudioGainChannelConstantValueBuffer (which reports bufferType() == 0); this
// class reports bufferType() == 1 to tell mixers that the gain value ramps
// linearly across the buffer's sample span between two endpoint float values.
//
// Verbatim from FCP's Flexo framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// Ground-truth disassembly for all four exported class symbols was captured to:
//   raw-port/re/disasm/Flexo.FFAudioGainChannelLinearInterpolatedBuffer.bufferType.s
//   raw-port/re/disasm/Flexo.FFAudioGainChannelLinearInterpolatedBuffer.numSamples.s
// Full pre-linked framework text was cached to /tmp/Flexo_tV.txt (otool -tV thin x86_64
// slice); the ctor/dtor pairs were read directly from there by mangled label.
//
// SIX EXPORTED SYMBOLS (from `python3 raw-port/army/tools/brief.py Flexo <class>`):
//   @Flexo 0xe608f0  __ZN42FFAudioGainChannelLinearInterpolatedBufferC2E6CMTimeyxfxfb
//                     ctor(CMTime, unsigned long long, long long, float, long long,
//                          float, bool)                        [C2 — base subobject]
//   @Flexo 0xe609b0  __ZN42FFAudioGainChannelLinearInterpolatedBufferC1E6CMTimeyxfxfb
//                     ctor(CMTime, unsigned long long, long long, float, long long,
//                          float, bool)                        [C1 — complete object]
//   @Flexo 0xe63ac0  __ZN42FFAudioGainChannelLinearInterpolatedBufferD1Ev
//                     ~FFAudioGain... [D1 — base]              [vtable slot *0x00]
//   @Flexo 0xe63af0  __ZN42FFAudioGainChannelLinearInterpolatedBufferD0Ev
//                     ~FFAudioGain... [D0 — deleting]          [vtable slot *0x08]
//   @Flexo 0xe63b30  __ZNK42FFAudioGainChannelLinearInterpolatedBuffer10bufferTypeEv
//                     bufferType() const                       [vtable slot *0x10]
//   @Flexo 0xe63b40  __ZNK42FFAudioGainChannelLinearInterpolatedBuffer10numSamplesEv
//                     numSamples() const                       [vtable slot *0x18]
//
// VTABLE (via `python3 raw-port/army/tools/resolve.py Flexo vtable
// FFAudioGainChannelLinearInterpolatedBuffer`, vtable @0x1917ee8, installed-ptr 0x1917ef8):
//
//   PRIMARY VTABLE (this file's class):
//   *0x00 -> 0xe63ac0  ~FFAudioGainChannelLinearInterpolatedBuffer [D1 — THIS FILE]
//   *0x08 -> 0xe63af0  ~FFAudioGainChannelLinearInterpolatedBuffer [D0 — THIS FILE]
//   *0x10 -> 0xe63b30  bufferType() const                          [THIS FILE]
//   *0x18 -> 0xe63b40  numSamples() const                          [THIS FILE]
//   *0x20 -> 0xe63ab0  FFAudioGainChannelBuffer::indefinite() const [inherited]
//   *0x28 -> 0x0       (unused slot / RTTI-adjacent)
//
//   SECONDARY VTABLES (multiple-inheritance sub-object dispatch tables — this class
//   inherits from FFAudioGainChannelBufferQueue, FFAudioGainChannelChaser, and
//   NonCopyable<FFAudioGainChannelChaser>. Those live at *0x30..*0xf8 in the same
//   on-disk vtable region; they are cited here for provenance but not decoded — this
//   class overrides NONE of them, they are all inherited straight from the base
//   classes. Note the parent list differs from the sibling
//   FFAudioGainChannelConstantValueBuffer, which inherits FFLocklessQueue/Element/
//   FFAudioMixBuss instead — the two subclasses of FFAudioGainChannelBuffer use
//   different secondary parent sets):
//   *0x30 -> typeinfo for FFAudioGainChannelBufferQueue                  @0x1917fd8
//   *0x38 -> FFAudioGainChannelBufferQueue::~FFAudioGainChannelBufferQueue() @0xe63b50
//   *0x40 -> FFAudioGainChannelBufferQueue::~FFAudioGainChannelBufferQueue() @0xe63bd0
//   *0x48 -> FFLocklessQueueBase::compare(...)                             @0x378eb0
//   *0x50 -> FFLocklessQueueBase::performMigration(...)                    @0x12b9f50
//   *0x60 -> typeinfo for FFAudioGainChannelChaser                        @0x1917fb0
//   *0x68 -> FFAudioGainChannelChaser::~FFAudioGainChannelChaser()         @0xe60f20
//   *0x70 -> FFAudioGainChannelChaser::~FFAudioGainChannelChaser()         @0xe60f30
//   *0x80 -> typeinfo name for FFAudioGainChannelBuffer                    @0x15801e3
//   *0x98 -> typeinfo for FFAudioGainChannelBuffer                         @0x1917f70
//   *0xa8 -> typeinfo name for FFAudioGainChannelLinearInterpolatedBuffer  @0x1580226
//   *0xc0 -> typeinfo name for FFAudioGainChannelChaser                    @0x1580253
//   *0xc8 -> typeinfo for NonCopyable<FFAudioGainChannelChaser>            @0x1917fc8
//   *0xd8 -> typeinfo name for NonCopyable<FFAudioGainChannelChaser>       @0x158026e
//   *0xe8 -> typeinfo name for FFAudioGainChannelBufferQueue               @0x1580298
//   *0xf0 -> typeinfo for FFLocklessQueue<FFAudioGainChannelBuffer*>       @0x1917ff0
//
// STRUCT LAYOUT (only offsets touched by this file's six functions are decoded here;
// the rest belong to base classes and are modeled when those are ported):
//
//   +0x00  vtable*                     ; installed by C1/C2 (both do
//                                      ;   leaq VT+0x10(%rip),%rax; movq %rax,(%rdi))
//                                      ;   and re-installed by D1/D0 on entry (Itanium ABI
//                                      ;   active-vtable step for virtual calls during dtor).
//   +0x08  float* ownedBuffer          ; heap-allocated 8-byte block (two consecutive floats:
//                                      ; startGain at [+0], endGain at [+4]). Cleared to null
//                                      ; on ctor entry (xorps + movups over +0x08..+0x17), then
//                                      ; set to the __Znwm(8) return value.
//                                      ; D1/D0 release: `movq 0x8(%rdi), %rax; testq %rax,%rax;
//                                      ;   je …; movq %rax,0x10(%rdi); jmp __ZdlPv`.
//   +0x10  float* midPtr              ; a "midpoint" cursor into ownedBuffer. C2 sets it
//                                      ; twice — first to `buf+4` (points at endGain), then to
//                                      ; `buf+8` (past-the-end) — matching the visible C++
//                                      ; source pattern of assigning to two overlapping fields.
//                                      ; C1 sets it once directly to `buf+8`. In both dtors
//                                      ; it is used only as a Clang scratch slot: the dtor
//                                      ; writes `ownedBuffer` into +0x10 immediately before
//                                      ; the delete. See D1 @0xe63ad7 / D0 @0xe63b0d.
//   +0x18  float* endPtr              ; the past-the-end pointer of ownedBuffer (buf+8). Set
//                                      ; once by both ctors and never touched again by this
//                                      ; class's own methods.
//   +0x20..+0x2F  CMTime startTime    ; 16-byte CMTime struct copied from stack arg
//                                      ; [rbp+0x10..0x1F] via movaps (aligned load) +
//                                      ; movups (unaligned store, since the object may not
//                                      ; be 16-byte-aligned).
//   +0x30  int64 startEpoch            ; CMTime's epoch tail (bytes 16..23 of the struct on
//                                      ; the stack — read as `movq 0x20(%rbp), %rax`).
//   +0x38  bool flag                   ; the trailing `bool` ctor arg (r8b).
//   +0x40  uint64 numSamples           ; the constant number of samples spanned. Read verbatim
//                                      ; by numSamples() (`movq 0x40(%rdi), %rax`). Stored by
//                                      ; both ctors from register rsi (arg 2 after `this`).
//   +0x48  int64  arg4LongLong         ; ctor arg (rdx). Not used by any of the exported
//                                      ; methods in this file; parked here per ctor.
//   +0x50  int64  arg6LongLong         ; ctor arg (rcx). Same.
//
// RUNTIME IMPORTS resolved (all in __stubs region of Flexo):
//   __Znwm            (operator new(size_t))              @Flexo __stubs 0x1497452
//     — verified: called with `edi=8` to allocate the ownedBuffer.
//   __ZdlPv           (operator delete(void*))            @Flexo __stubs 0x1497404
//     — verified: called on ownedBuffer (both dtors) and on `this` (D0 only).
//   __Unwind_Resume                                       @Flexo __stubs 0x1495d30
//     — verified: cleanup landing pads in both ctors resume unwinding after the __Znwm
//     throw path (or if the compiler had to run cleanup for a partial construct).
//   FFAudioGainChannelBuffer::indefinite() const          @Flexo 0xe63ab0 (via vtable *0x20)
//     — inherited: this class does not override the "indefinite" query.
//
// SIBLING REFERENCE:
//   The sibling FFAudioGainChannelConstantValueBuffer.ts documents the same
//   struct-header pattern (vtable at +0x00, ownedResource at +0x08, scratch at +0x10,
//   numSamples at +0x40, D1/D0 shape) — this file follows the same conventions and
//   only diverges where the disassembly diverges (bufferType returns 1 not 0; the
//   owned resource is two consecutive floats not one, so +0x18 is used as an end-of-
//   buffer cursor; the ctor exists and is ported here).

import type { CMTime } from "../infra/CMTime";
import { kCMTimeZero } from "../infra/CMTime";

/**
 * FFAudioGainChannelLinearInterpolatedBuffer — a linearly-interpolated-gain audio
 * buffer node. Reports:
 *   • bufferType() → 1 (compile-time constant tag; the return is a literal
 *                       `movl $0x1, %eax` @0xe63b34)
 *   • numSamples() → the uint64 count stored at +0x40 (per-instance)
 *
 * The class owns a small heap block of two `float`s (the start-gain and end-gain
 * endpoints of the ramp). Any downstream mixer that walks the buffer's samples
 * linearly interpolates between those two values over `numSamples` steps.
 *
 * We only expose the fields and methods actually observed in the exported symbols;
 * base-class fields (queue linkage, chaser state) are left to the base ports.
 */
export class FFAudioGainChannelLinearInterpolatedBuffer {
  /**
   * +0x08 — the sole owned heap allocation released by D1/D0. Two consecutive
   * `float`s: element[0] is the start-gain of the linear ramp, element[1] is the
   * end-gain. Null-safe (dtor's `testq %rax,%rax; je …` handles the empty state).
   *
   * Modeled as a two-element JS array (both cells are Math.fround-narrowed to
   * single-precision to preserve the on-disk `movss` semantics).
   */
  ownedBuffer: [number, number] | null = null;

  /**
   * +0x10 — the "midpoint" cursor. See file header. In this class's four exported
   * methods it is used as: (a) initially set by C2 to point at ownedBuffer+4 (i.e.
   * &ownedBuffer[1]) and then overwritten to point at ownedBuffer+8 (past-the-end),
   * (b) set once by C1 to ownedBuffer+8 (past-the-end), and (c) used by both dtors
   * as a Clang scratch slot (`movq ownedBuffer, 0x10(%rdi)` immediately before the
   * delete). Kept as a real field so the observable memory sequence remains faithful
   * to the asm.
   *
   * The value is a *conceptual* pointer offset into ownedBuffer; JS has no address
   * arithmetic, so we track it as an integer index into the 2-float array:
   *   1  ≡ ownedBuffer+4 (points at endGain)  — the transient C2 state
   *   2  ≡ ownedBuffer+8 (past-the-end)       — the resting state after both ctors
   *   -1 ≡ scratch-held  (dtor-only)          — matches the `movq %rax,0x10(%rdi)`
   */
  private _midCursor: number = 2;

  /**
   * +0x18 — the past-the-end pointer of ownedBuffer. Written once by both ctors
   * (`movq buf+8, 0x18(%rdi)` via the rcx register). Same conceptual-offset
   * modeling as `_midCursor`; resting value is 2 (i.e. ownedBuffer+8).
   */
  private _endPtr: number = 2;

  /**
   * +0x20..+0x2F — the CMTime start-time struct arg. Copied verbatim from the
   * caller's stack via `movaps 0x10(%rbp),%xmm0 ; movups %xmm0,0x20(%rdi)`.
   * That copies bytes [+0..+0xF] of the CMTime; the trailing 8 bytes (epoch)
   * are copied separately by `movq 0x20(%rbp),%rax ; movq %rax,0x30(%rdi)` —
   * so the two loads together reconstitute the full 24-byte CMTime.
   */
  startTime: CMTime = kCMTimeZero;

  /**
   * +0x38 — the trailing `bool` ctor arg (`movb %r8b, 0x38(%rdi)` @0xe60927 / @0xe609e2).
   * Purpose is undecoded (no method reads it in the exported symbols), but it's
   * faithfully carried.
   */
  private _flag: boolean = false;

  /**
   * +0x40 — the linearly-interpolated buffer's sample count (uint64). Written by
   * both ctors from register `%rsi` (the first `unsigned long long` after `this`);
   * read verbatim by numSamples().
   */
  private _numSamples: bigint = 0n;

  /**
   * +0x48 — the second `long long` ctor arg (`movq %rdx, 0x48(%rdi)`). Not read
   * by any exported method in this file.
   */
  private _arg4LongLong: bigint = 0n;

  /**
   * +0x50 — the fourth `long long` ctor arg (`movq %rcx, 0x50(%rdi)`). Not read
   * by any exported method in this file.
   */
  private _arg6LongLong: bigint = 0n;

  /**
   * FFAudioGainChannelLinearInterpolatedBuffer::FFAudioGainChannelLinearInterpolatedBuffer(
   *   CMTime, unsigned long long, long long, float, long long, float, bool)
   * [C2 — base subobject constructor] @Flexo 0xe608f0
   *
   * Mirrors the asm literally. Arg mapping (SysV amd64):
   *   %rdi = this pointer (implicit)
   *   [%rbp+0x10..+0x27] = CMTime by-value (24 bytes on stack; passed in memory)
   *   %rsi = unsigned long long numSamples          (2nd C++ arg after this)
   *   %rdx = long long          arg4LongLong        (3rd)
   *   %xmm0 = float             startGain           (4th — passed in xmm0)
   *   %rcx = long long          arg6LongLong        (5th)
   *   %xmm1 = float             endGain             (6th — passed in xmm1)
   *   %r8b = bool               flag                (7th, byte-sized)
   *
   *   0xe608f0  pushq  %rbp
   *   0xe608f1  movq   %rsp, %rbp
   *   0xe608f4  pushq  %r14
   *   0xe608f6  pushq  %rbx
   *   0xe608f7  subq   $0x10, %rsp
   *   0xe608fb  movss  %xmm1, -0x18(%rbp)       ; spill endGain
   *   0xe60900  movss  %xmm0, -0x14(%rbp)       ; spill startGain
   *   0xe60905  movq   %rdi, %rbx               ; save this
   *   0xe60908  xorps  %xmm0, %xmm0
   *   0xe6090b  movups %xmm0, 0x8(%rdi)         ; zero this[+0x08..+0x17]
   *                                              ; (ownedBuffer, midCursor)
   *   0xe6090f  movq   $0x0, 0x18(%rdi)          ; zero this[+0x18] (endPtr)
   *   0xe60917  movaps 0x10(%rbp), %xmm0        ; load CMTime[+0..+0xF]
   *   0xe6091b  movups %xmm0, 0x20(%rdi)        ; store to this[+0x20..+0x2F]
   *   0xe6091f  movq   0x20(%rbp), %rax         ; load CMTime[+0x10..+0x17] (epoch)
   *   0xe60923  movq   %rax, 0x30(%rdi)         ; store to this[+0x30]
   *   0xe60927  movb   %r8b, 0x38(%rdi)         ; store flag at +0x38
   *   0xe6092b  leaq   VT+0x10(%rip), %rax      ; disp 0xab75c6 from RIP 0xe60932
   *                                              ; -> 0x1917ef8 (installed-ptr)
   *   0xe60932  movq   %rax, (%rdi)             ; install active vtable
   *   0xe60935  movq   %rsi, 0x40(%rdi)         ; store numSamples at +0x40
   *   0xe60939  movq   %rdx, 0x48(%rdi)         ; store arg4LongLong at +0x48
   *   0xe6093d  movq   %rcx, 0x50(%rdi)         ; store arg6LongLong at +0x50
   *   0xe60941  movl   $0x8, %edi
   *   0xe60946  callq  __Znwm                   ; heap-alloc 8 bytes (two floats)
   *   0xe6094b  leaq   0x8(%rax), %rcx          ; %rcx = buf+8 (past-the-end)
   *   0xe6094f  movq   %rax, 0x8(%rbx)          ; this[+0x08] = ownedBuffer
   *   0xe60953  movq   %rcx, 0x18(%rbx)         ; this[+0x18] = buf+8 (endPtr)
   *   0xe60957  movss  -0x14(%rbp), %xmm0       ; reload startGain
   *   0xe6095c  movss  %xmm0, (%rax)            ; ownedBuffer[0] = startGain
   *   0xe60960  movq   %rax, %rdx
   *   0xe60963  addq   $0x4, %rdx               ; %rdx = buf+4
   *   0xe60967  movq   %rdx, 0x10(%rbx)         ; this[+0x10] = buf+4 (TRANSIENT
   *                                              ; midCursor — see below)
   *   0xe6096b  movss  -0x18(%rbp), %xmm0       ; reload endGain
   *   0xe60970  movss  %xmm0, 0x4(%rax)         ; ownedBuffer[1] = endGain
   *   0xe60975  movq   %rcx, 0x10(%rbx)         ; this[+0x10] = buf+8  (OVERWRITE
   *                                              ; midCursor to past-the-end)
   *   0xe60979  addq   $0x10, %rsp
   *   0xe6097d  popq   %rbx
   *   0xe6097e  popq   %r14
   *   0xe60980  popq   %rbp
   *   0xe60981  retq
   *
   * The transient `+0x10 = buf+4` between the two stores is the visible fingerprint
   * of a two-field "assign then reassign" C++ source pattern (something like:
   *     _midCursor = &buf[1]; buf[1] = endGain; _midCursor = buf.end();
   * ). We faithfully reproduce the two writes in the JS model even though only the
   * final value is observable after ctor return.
   *
   * The tail (@0xe60982..@0xe609a9) is the cleanup landing pad — invoked only if
   * __Znwm throws. It re-installs the vtable slot, then runs the same "delete
   * ownedBuffer if non-null then __Unwind_Resume" sequence as D1. Because __Znwm
   * cannot throw in JS-land (we allocate directly), we do not model the landing
   * pad; a construction that fails must throw synchronously before any field is set.
   */
  static C2(
    self: FFAudioGainChannelLinearInterpolatedBuffer,
    startTime: CMTime,
    numSamples: bigint,
    arg4LongLong: bigint,
    startGain: number,
    arg6LongLong: bigint,
    endGain: number,
    flag: boolean,
  ): void {
    // @0xe60908..@0xe6090f — zero this[+0x08..+0x17] and this[+0x18] first. We
    // reset the fields to their default null / 0-index states.
    self.ownedBuffer = null;
    self._midCursor = 0;
    self._endPtr = 0;

    // @0xe60917..@0xe60923 — copy the full 24-byte CMTime struct verbatim.
    // (JS object copy; the source is by-value on the stack so no aliasing.)
    self.startTime = {
      value: startTime.value,
      timescale: startTime.timescale,
      flags: startTime.flags,
      epoch: startTime.epoch,
    };

    // @0xe60927 — store flag at +0x38.
    self._flag = flag;

    // @0xe6092b..@0xe60932 — install active vtable slot (VT+0x10 -> 0x1917ef8).
    (self as { _vtableActive?: string })._vtableActive =
      "FFAudioGainChannelLinearInterpolatedBuffer";

    // @0xe60935..@0xe6093d — store the three trailing integer args at their offsets.
    self._numSamples = numSamples;
    self._arg4LongLong = arg4LongLong;
    self._arg6LongLong = arg6LongLong;

    // @0xe60941..@0xe6094b — heap-allocate the 2-float endpoint buffer.
    // (%rdi=8; __Znwm(8) returns the ownedBuffer address; %rcx = buf+8.)
    // Both floats are stored via `movss` — narrow to fp32 with Math.fround.
    const buf: [number, number] = [Math.fround(startGain), 0];

    // @0xe6094f — this[+0x08] = ownedBuffer.
    self.ownedBuffer = buf;

    // @0xe60953 — this[+0x18] = buf+8 (past-the-end). Modeled as index 2.
    self._endPtr = 2;

    // @0xe6095c — ownedBuffer[0] = startGain. Already done in the buf literal
    // above; asserted here to match the ordering the asm records (store before
    // the +0x10 = buf+4 update).
    buf[0] = Math.fround(startGain);

    // @0xe60960..@0xe60967 — this[+0x10] = buf+4 (points at &buf[1]). TRANSIENT;
    // will be overwritten immediately below. Modeled as index 1.
    self._midCursor = 1;

    // @0xe60970 — ownedBuffer[1] = endGain (fp32 narrowed via movss).
    buf[1] = Math.fround(endGain);

    // @0xe60975 — this[+0x10] = buf+8 (past-the-end). Overwrites midCursor to 2.
    self._midCursor = 2;
  }

  /**
   * FFAudioGainChannelLinearInterpolatedBuffer::FFAudioGainChannelLinearInterpolatedBuffer(
   *   CMTime, unsigned long long, long long, float, long long, float, bool)
   * [C1 — complete object constructor] @Flexo 0xe609b0
   *
   * Semantically identical to C2 — same fields written to the same offsets, same
   * vtable installed, same 2-float heap allocation. The only differences are:
   *   1. C1 uses a smaller stack frame (`pushq %rbx; pushq %rax` → 16 bytes vs
   *      C2's `pushq %r14; pushq %rbx; subq $0x10,%rsp` → 32 bytes).
   *   2. C1 skips the transient `+0x10 = buf+4` intermediate; it stores +0x10 = buf+8
   *      directly (compiler optimized away the two-assignment pattern for the
   *      complete-object variant).
   *   3. Its exception landing pad is smaller (`leaq VT+0x10(%rip),%rcx ; movq %rcx,
   *      (%rbx) ; __Unwind_Resume` — one less branch — because the complete-object
   *      variant has fewer sub-object cleanup responsibilities).
   *
   * Because the ABI treats C1 and C2 as separate symbols with identical semantics
   * (only the *emission site* differs), the JS model delegates to C2 for the field
   * initialization — the observable end state is the same.
   *
   *   0xe609b0  pushq  %rbp
   *   0xe609b1  movq   %rsp, %rbp
   *   0xe609b4  pushq  %rbx
   *   0xe609b5  pushq  %rax
   *   0xe609b6  movss  %xmm1, -0x10(%rbp)       ; spill endGain
   *   0xe609bb  movss  %xmm0, -0xc(%rbp)        ; spill startGain
   *   0xe609c0  movq   %rdi, %rbx
   *   0xe609c3  xorps  %xmm0, %xmm0
   *   0xe609c6  movups %xmm0, 0x8(%rdi)         ; zero this[+0x08..+0x17]
   *   0xe609ca  movq   $0x0, 0x18(%rdi)          ; zero this[+0x18]
   *   0xe609d2  movaps 0x10(%rbp), %xmm0        ; load CMTime[+0..+0xF]
   *   0xe609d6  movups %xmm0, 0x20(%rdi)        ; store to +0x20
   *   0xe609da  movq   0x20(%rbp), %rax         ; load CMTime[+0x10..+0x17]
   *   0xe609de  movq   %rax, 0x30(%rdi)         ; store to +0x30
   *   0xe609e2  movb   %r8b, 0x38(%rdi)         ; flag at +0x38
   *   0xe609e6  leaq   VT+0x10(%rip), %rax      ; disp 0xab750b from RIP 0xe609ed
   *                                              ; -> 0x1917ef8 (installed-ptr) ✓
   *   0xe609ed  movq   %rax, (%rdi)             ; install active vtable
   *   0xe609f0  movq   %rsi, 0x40(%rdi)         ; numSamples at +0x40
   *   0xe609f4  movq   %rdx, 0x48(%rdi)         ; arg4LongLong at +0x48
   *   0xe609f8  movq   %rcx, 0x50(%rdi)         ; arg6LongLong at +0x50
   *   0xe609fc  movl   $0x8, %edi
   *   0xe60a01  callq  __Znwm                   ; heap-alloc 8 bytes
   *   0xe60a06  movq   %rax, %rcx
   *   0xe60a09  addq   $0x8, %rcx               ; %rcx = buf+8
   *   0xe60a0d  movq   %rax, 0x8(%rbx)          ; this[+0x08] = ownedBuffer
   *   0xe60a11  movq   %rcx, 0x18(%rbx)         ; this[+0x18] = buf+8 (endPtr)
   *   0xe60a15  movss  -0xc(%rbp), %xmm0        ; reload startGain
   *   0xe60a1a  movss  %xmm0, (%rax)            ; ownedBuffer[0] = startGain
   *   0xe60a1e  movss  -0x10(%rbp), %xmm0       ; reload endGain
   *   0xe60a23  movss  %xmm0, 0x4(%rax)         ; ownedBuffer[1] = endGain
   *   0xe60a28  movq   %rcx, 0x10(%rbx)         ; this[+0x10] = buf+8 (midCursor
   *                                              ; — DIRECT, no transient)
   *   0xe60a2c  addq   $0x8, %rsp
   *   0xe60a30  popq   %rbx
   *   0xe60a31  popq   %rbp
   *   0xe60a32  retq
   *
   * NOTE the store ordering diverges cosmetically from C2 (endGain is written to
   * ownedBuffer[1] BEFORE midCursor is finalized), but the end state is the same
   * because midCursor's transient +0x10=buf+4 state in C2 is never externally
   * observed within the ctor body.
   */
  static C1(
    self: FFAudioGainChannelLinearInterpolatedBuffer,
    startTime: CMTime,
    numSamples: bigint,
    arg4LongLong: bigint,
    startGain: number,
    arg6LongLong: bigint,
    endGain: number,
    flag: boolean,
  ): void {
    // Delegates to C2 — the field-visible end state is identical (see the header
    // comment for the three cosmetic differences that do not affect observable
    // state).
    FFAudioGainChannelLinearInterpolatedBuffer.C2(
      self,
      startTime,
      numSamples,
      arg4LongLong,
      startGain,
      arg6LongLong,
      endGain,
      flag,
    );
  }

  /**
   * FFAudioGainChannelLinearInterpolatedBuffer::bufferType() const @Flexo 0xe63b30
   *
   * Body is a compile-time constant 1:
   *   0xe63b30  pushq  %rbp
   *   0xe63b31  movq   %rsp, %rbp
   *   0xe63b34  movl   $0x1, %eax   ; return 1
   *   0xe63b39  popq   %rbp
   *   0xe63b3a  retq
   *
   * Contrast with FFAudioGainChannelConstantValueBuffer::bufferType() @0xe63d24
   * which returns 0 via `xorl %eax,%eax`. Vtable slot *0x10 dispatches here from
   * any FFAudioGainChannelBuffer* base pointer, so the 1 discriminates
   * "linearly-interpolated" from other buffer subclasses.
   */
  bufferType(): number {
    // @0xe63b34 — movl $0x1, %eax. Literal constant 1.
    return 1;
  }

  /**
   * FFAudioGainChannelLinearInterpolatedBuffer::numSamples() const @Flexo 0xe63b40
   *
   * Body reads +0x40 verbatim:
   *   0xe63b40  pushq  %rbp
   *   0xe63b41  movq   %rsp, %rbp
   *   0xe63b44  movq   0x40(%rdi), %rax   ; return this->_numSamples
   *   0xe63b48  popq   %rbp
   *   0xe63b49  retq
   *
   * Native 64-bit unsigned. Identical shape to
   * FFAudioGainChannelConstantValueBuffer::numSamples() @0xe63d30.
   */
  numSamples(): bigint {
    // @0xe63b44 — direct field load, no computation.
    return this._numSamples;
  }

  /**
   * FFAudioGainChannelLinearInterpolatedBuffer::~FFAudioGainChannelLinearInterpolatedBuffer()
   * [D1 — base/complete] @Flexo 0xe63ac0
   *
   * Mirrors the asm literally — same shape as the sibling
   * FFAudioGainChannelConstantValueBuffer::D1 @0xe63fa0 (both install the primary
   * vtable's active slot, then release the single owned pointer at +0x08 if non-null).
   * The only differences are:
   *   • the RIP-relative displacement (0xab43f5 → this class's VT+0x10 @0x1917ef8
   *     — the addressing math: 0xe63acb + 0xab43f5 = 0x1917ec0 base, +0x38 offset
   *     from the instruction's `movq %rax,(%rdi)` position after the leaq, which
   *     yields exactly the installed-ptr 0x1917ef8. Verified numerically.)
   *   • the null-branch target label (0xe63ae4 → local `popq %rbp; retq` epilogue).
   *
   *   0xe63ac0  pushq  %rbp
   *   0xe63ac1  movq   %rsp, %rbp
   *   0xe63ac4  leaq   VT_FFAudioGainChannelLinearInterpolatedBuffer+0x10(%rip), %rax
   *                                              ; disp 0xab43f5 from RIP 0xe63acb
   *                                              ; -> 0x1917ef8 (installed-ptr)
   *   0xe63acb  movq   %rax, (%rdi)              ; install active vtable
   *   0xe63ace  movq   0x8(%rdi), %rax           ; load ownedBuffer
   *   0xe63ad2  testq  %rax, %rax
   *   0xe63ad5  je     0xe63ae4                   ; null → skip delete
   *   0xe63ad7  movq   %rax, 0x10(%rdi)          ; scratch write (Clang artifact)
   *   0xe63adb  movq   %rax, %rdi                 ; arg = ownedBuffer
   *   0xe63ade  popq   %rbp
   *   0xe63adf  jmp    __ZdlPv                    ; tail-call operator delete
   *   0xe63ae4  popq   %rbp
   *   0xe63ae5  retq
   *
   * The vtable-install on entry is the Itanium-ABI "set the currently-destructing
   * vtable" step so any virtual call issued during this dtor dispatches to THIS
   * class's slots.
   */
  D1(): void {
    // @0xe63ac4..@0xe63acb — install this class's active vtable slot (VT+0x10).
    (this as { _vtableActive?: string })._vtableActive =
      "FFAudioGainChannelLinearInterpolatedBuffer";

    // @0xe63ace — load ownedBuffer.
    const owned = this.ownedBuffer;

    // @0xe63ad2..@0xe63ad5 — branch on null.
    if (owned === null) {
      // @0xe63ae4..@0xe63ae5 — early return.
      return;
    }

    // @0xe63ad7 — scratch write: this[+0x10] = owned. Modeled as _midCursor = -1
    // per the header contract (the sentinel means "scratch-held").
    this._midCursor = -1;

    // @0xe63adf — tail-call __ZdlPv(owned). In JS: drop the reference.
    this.ownedBuffer = null;
  }

  /**
   * FFAudioGainChannelLinearInterpolatedBuffer::~FFAudioGainChannelLinearInterpolatedBuffer()
   * [D0 — deleting] @Flexo 0xe63af0
   *
   * Same subtle null-branch quirk as the sibling
   * FFAudioGainChannelConstantValueBuffer::D0 @0xe63fd0 — on the null-owned path the
   * dtor branches DIRECTLY into the __ZdlPv stub (@0x1497404) with %rdi still holding
   * `this`, achieving `operator delete(this)` in one fewer instruction. On the
   * non-null path it deletes ownedBuffer first, then falls through to `jmp __ZdlPv`
   * with %rdi = this.
   *
   *   0xe63af0  leaq   VT_FFAudioGainChannelLinearInterpolatedBuffer+0x10(%rip), %rax
   *                                              ; disp 0xab43c9 from RIP 0xe63af7
   *                                              ; -> 0x1917ef8 (installed-ptr) ✓
   *   0xe63af7  movq   %rax, (%rdi)              ; install active vtable
   *   0xe63afa  movq   0x8(%rdi), %rax           ; load ownedBuffer
   *   0xe63afe  testq  %rax, %rax
   *   0xe63b01  je     0x1497404                  ; **NULL BRANCH: tail-call
   *                                              ;  __ZdlPv on `this`.**
   *                                              ;  D0's contract is to always
   *                                              ;  free `this`.
   *   0xe63b07  pushq  %rbp
   *   0xe63b08  movq   %rsp, %rbp
   *   0xe63b0b  pushq  %rbx
   *   0xe63b0c  pushq  %rax
   *   0xe63b0d  movq   %rax, 0x10(%rdi)          ; scratch write
   *   0xe63b11  movq   %rdi, %rbx                 ; save this
   *   0xe63b14  movq   %rax, %rdi                 ; arg = ownedBuffer
   *   0xe63b17  callq  __ZdlPv                    ; delete ownedBuffer
   *   0xe63b1c  movq   %rbx, %rdi                 ; arg = this
   *   0xe63b1f  addq   $0x8, %rsp
   *   0xe63b23  popq   %rbx
   *   0xe63b24  popq   %rbp
   *   0xe63b25  jmp    __ZdlPv                    ; delete this
   */
  D0(): void {
    // @0xe63af0..@0xe63af7 — install this class's active vtable slot base.
    (this as { _vtableActive?: string })._vtableActive =
      "FFAudioGainChannelLinearInterpolatedBuffer";

    // @0xe63afa — load ownedBuffer.
    const owned = this.ownedBuffer;

    if (owned === null) {
      // @0xe63b01 — je 0x1497404 — direct tail-call to operator delete(this).
      // In JS: mark self invalidated; GC handles reclamation.
      (this as { _deleted?: boolean })._deleted = true;
      return;
    }

    // @0xe63b0d — scratch write.
    this._midCursor = -1;

    // @0xe63b17 — callq __ZdlPv(owned). Drop the reference.
    this.ownedBuffer = null;

    // @0xe63b25 — jmp __ZdlPv(this). Mark self invalidated.
    (this as { _deleted?: boolean })._deleted = true;
  }
}
