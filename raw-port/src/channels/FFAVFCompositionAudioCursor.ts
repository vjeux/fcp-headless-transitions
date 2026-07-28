// FFAVFCompositionAudioCursor.ts — FCP Flexo framework class.
// Transcribed from the x86_64 disassembly of Flexo in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
// Versions/A/Flexo (see raw-port/re/disasm/Flexo.FFAVFCompositionAudioCursor.*.s
// and /tmp/Flexo_tV.txt @0xdf2150..0xdf245c).
//
// Symbols (nm | c++filt):
//   0xdf2150 t FFAVFCompositionAudioCursor::FFAVFCompositionAudioCursor(
//              FFAVFCompositionMediaReader*, AVSampleCursor*, AVSampleBufferGenerator*,
//              CMTimeMapping, int)  (C2)
//   0xdf21d0 t FFAVFCompositionAudioCursor::FFAVFCompositionAudioCursor(...)   (C1)
//              — byte-identical body to C2; differs only in the vtable slot
//                installed at +0x00 (leaq 0xb231f7(%rip),%rax @0xdf21e2 vs
//                leaq 0xb23277(%rip),%rax @0xdf2162).
//   0xdf2250 t FFAVFCompositionAudioCursor::~FFAVFCompositionAudioCursor()   (D2 base)
//   0xdf2290 t FFAVFCompositionAudioCursor::~FFAVFCompositionAudioCursor()   (D1 complete)
//   0xdf22d0 t FFAVFCompositionAudioCursor::~FFAVFCompositionAudioCursor()   (D0 deleting)
//   0xdf2310 t FFAVFCompositionAudioCursor::createSampleBufferForReadRequest(
//              int, FFMediaReaderRequestMode, CMTime, FFPrerollBatch*) const
//   0xdf2390 t FFAVFCompositionAudioCursor::presentationTimeStamp() const
//
// PROVENANCE / DECODE:
//   raw-port/re/disasm/Flexo.FFAVFCompositionAudioCursor.presentationTimeStamp.s
//   raw-port/re/disasm/Flexo.FFAVFCompositionAudioCursor.createSampleBufferForReadRequest.s
//   /tmp/Flexo_tV.txt inspected linearly at file lines 3483630..3483770 (x86_64 slice).
//   Referenced externs (each cited by @0xADDR at each callq/leaq below):
//     __ZN16FFAVFAudioCursorC2EP16FFAVFMediaReaderP14AVSampleCursor
//         FFAVFAudioCursor::FFAVFAudioCursor(FFAVFMediaReader*, AVSampleCursor*)   — base ctor
//         (@0xdf215d, @0xdf21dd)
//     __ZN16FFAVFAudioCursorD2Ev
//         FFAVFAudioCursor::~FFAVFAudioCursor()   — base dtor
//         (@0xdf2276 tail-jmp, @0xdf22b6 tail-jmp, @0xdf22f0 callq, @0xdf21b7/@0xdf2237 in unwind)
//     _objc_retain
//         GOT @0xafb59b (C2) / @0xafb51b (C1) — retains the AVSampleBufferGenerator arg,
//         result stored at this+0x18.
//     _objc_release
//         GOT @0xafb49b (D2) / @0xafb45b (D1) / @0xafb41b (D0) — releases this+0x18
//         before delegating to base ~FFAVFAudioCursor().
//     _kCMTimeInvalid                                                    (@0xdf23a1 literal pool)
//         CoreMedia public constant; used to initialize the CMTime return slot on entry.
//         Value: {value=0, timescale=0, flags=0, epoch=0} per CMTime.h. Copied in as
//         xmm0 (bytes 0..15 = value+timescale+flags) then qword at +0x10 (epoch).
//     __objc_selrefs @0x1BF35D0 -> "presentationTimeStamp"                (@0xdf23ca sel-load)
//     __objc_selrefs @0x1BF35E4 -> "decodeTimeStamp"                      (@0xdf23e5 sel-load)
//         (selref VAs decoded via `movq disp(%rip),%rdx` where disp+next-ip = selref VA;
//          selref -> __objc_methname string via dyld_info -fixups rebase target.)
//     _objc_msgSend_stret                                                 (stub @0x1497986)
//         Structure-return objc_msgSend variant: writes CMTime into &out-buffer at rdi.
//     _CMTimeAdd                                                          (stub @0x14950fa)
//         CoreMedia: writes CMTimeAdd(a,b) into *rdi (already ported in ../infra/CMTime.ts).
//     __ZdlPv                                                             (stub @0x1497404)
//         operator delete(void*) — invoked from D0 after base D2. No-op in TS (GC).
//     __Unwind_Resume                                                     (stub @0x1495d30)
//         C++ exception unwind hook — the ctor's landing pad releases the
//         base and re-raises. Not directly modeled in TS.
//   vtable install (C1): leaq 0xb231f7(%rip),%rax @0xdf21e2 -> vtable+0x10.
//     resolved VA = 0xdf21e2 + 7 (instr len) + 0xb231f7 = 0x19153e0 (=vtable_C1_base+0x10).
//     C1 vtable base = 0x19153d0.
//   vtable install (C2): leaq 0xb23277(%rip),%rax @0xdf2162 -> vtable+0x10.
//     resolved VA = 0xdf2162 + 7 + 0xb23277 = 0x1915460 (=vtable_C2_base+0x10).
//     C2 vtable base = 0x1915450.
//   D2 vtable reinstall: leaq 0xb23180(%rip),%rax @0xdf2259 -> 0x19153e0 (matches C1 base+0x10).
//   D1 vtable reinstall: leaq 0xb23140(%rip),%rax @0xdf2299 -> 0x19153e0 (same).
//   D0 vtable reinstall: leaq 0xb23100(%rip),%rax @0xdf22d9 -> 0x19153e0 (same).
//
// ── STRUCT LAYOUT (extends FFAVFAudioCursor base — same +0x00,+0x08,+0x10) ──
//   +0x00 vptr           : vtable ptr (installed by C1/C2/D*).
//   +0x08 mediaReader    : FFAVFMediaReader* (base field) — established by
//                          FFAVFAudioCursor::FFAVFAudioCursor(FFAVFMediaReader*,
//                          AVSampleCursor*); the upcast from FFAVFCompositionMediaReader*
//                          is valid because the derived reader IS-A FFAVFMediaReader.
//   +0x10 sampleCursor   : AVSampleCursor* (base field) — retained by base ctor.
//   +0x18 bufferGenerator: AVSampleBufferGenerator* — retained here (objc_retain @0xdf216f
//                          in C2, @0xdf21ef in C1). Released in every dtor (see D2/D1/D0).
//   +0x20 mapping        : CMTimeMapping (96 bytes = 2 × CMTimeRange = 4 × CMTime).
//                          Copied from the by-value struct arg on the stack starting at
//                          [rbp+0x10]. Copy sequence (@0xdf217d..0xdf21a8, @0xdf21fd..0xdf2228):
//                             +0x20..+0x2F  = mapping[0x00..0x0F]     ; source.start hi
//                             +0x30..+0x3F  = mapping[0x10..0x1F]     ; source.start lo/dur hi
//                             +0x40..+0x4F  = mapping[0x20..0x2F]     ; source.duration lo
//                             +0x50..+0x5F  = mapping[0x30..0x3F]     ; target.start (first half)
//                             +0x60..+0x6F  = mapping[0x40..0x4F]     ; target.start.epoch/dur hi
//                             +0x70..+0x7F  = mapping[0x50..0x5F]     ; target.duration
//                          i.e. the 96-byte mapping starts at +0x20.
//                          Interpreted in CoreMedia terms:
//                             +0x20 source: CMTimeRange (48 bytes)
//                               +0x20 source.start:    CMTime
//                               +0x38 source.duration: CMTime
//                             +0x50 target: CMTimeRange (48 bytes)
//                               +0x50 target.start:    CMTime  (+0x50 value, +0x58 ts+flags,
//                                                              +0x60 epoch)
//                               +0x68 target.duration: CMTime
//   The `int mode` (last param) is passed in %r8 but has no store in the C1/C2 body —
//   dropped, exactly as the sibling FFAVFQTAudioCursor drops its `int` arg. See
//   file-level note on FFAVFQTAudioCursor.ts for the standing convention.
//
// SIBLING TEMPLATE: FFAVFQTAudioCursor (already ported at
// raw-port/src/channels/FFAVFQTAudioCursor.ts) — same shape (extends FFAVFAudioCursor,
// no state of its own beyond a distinct vtable), but this class adds one retained
// ObjC arg (buffer generator) and a 96-byte inline CMTimeMapping.

import { CMTimeAdd, type CMTime } from "../infra/CMTime";
import type {
  FFAVFMediaReader,
  AVSampleCursor,
  FFPrerollBatch,
  FFMediaReaderRequestMode,
} from "./FFAVFQTAudioCursor";

// ── kCMTimeInvalid ────────────────────────────────────────────────────────
// CoreMedia public constant (CM_EXPORT const CMTime kCMTimeInvalid) — used
// by presentationTimeStamp() @0xdf23a1 to initialize the return slot.
// From CMTime.h: `kCMTimeInvalid` is {value=0, timescale=0, flags=0, epoch=0}
// (flags=0 means the CMTime is NOT Valid). The x86_64 asm loads the literal
// pool GOT entry `_kCMTimeInvalid` and copies xmm0 (first 16 bytes) plus qword
// at +0x10 (epoch). We mirror that byte-for-byte here.
// @const CoreMedia CMTime.h (Flexo __got @0x18E7... rebase target).
const kCMTimeInvalid: CMTime = {
  value: 0n,
  timescale: 0,
  flags: 0,
  epoch: 0n,
};

/**
 * Opaque handle for AVFoundation's AVSampleBufferGenerator — external ObjC class.
 * Retained by this cursor's ctor (objc_retain @0xdf21ef in C1) and released by
 * every dtor. Not part of this port; modeled as an opaque handle.
 * @class AVFoundation AVSampleBufferGenerator (external ObjC class)
 */
export interface AVSampleBufferGenerator {
  readonly __opaque_AVSampleBufferGenerator: never;
}

/**
 * Opaque handle for a Flexo FFAVFCompositionMediaReader — not yet transcribed.
 * FFAVFCompositionMediaReader inherits from FFAVFMediaReader; the upcast used
 * by the base ctor at @0xdf215d/@0xdf21dd is valid because the derived reader
 * IS-A FFAVFMediaReader. Exposes a `createSampleBufferForReadRequest` variant
 * with a distinct signature (AVSampleCursor*, AVSampleBufferGenerator*, bool,
 * int, CMTime, CMTimeMapping) invoked via a normal C++ call — NOT an objc msg.
 * @class Flexo FFAVFCompositionMediaReader (not yet transcribed)
 */
export interface FFAVFCompositionMediaReader extends FFAVFMediaReader {
  readonly __opaque_FFAVFCompositionMediaReader: never;
  /**
   * Not yet transcribed. @extern Flexo FFAVFCompositionMediaReader::createSampleBufferForReadRequest
   *   (mangled __ZNK27FFAVFCompositionMediaReader32createSampleBufferForReadRequest\
   *              EP14AVSampleCursorP23AVSampleBufferGeneratorbi6CMTime13CMTimeMapping)
   *   — direct call target @0xdf2376.
   */
  createSampleBufferForReadRequest(
    cursor: AVSampleCursor | null,
    generator: AVSampleBufferGenerator | null,
    flag: boolean,
    arg: number,
    time: CMTime,
    mapping: CMTimeMapping,
  ): unknown;
}

/**
 * CoreMedia CMTimeRange — start + duration (48 bytes = 2 × 24-byte CMTime).
 * Struct-of-values, mirrors CMTime.h.
 * @struct CoreMedia CMTimeRange
 */
export interface CMTimeRange {
  start: CMTime;
  duration: CMTime;
}

/**
 * CoreMedia CMTimeMapping — source + target CMTimeRange (96 bytes).
 * The FCP asm treats this as a flat 96-byte inline blob copied by 16-byte SIMD
 * moves; we model it as the nested struct-of-structs per CMTime.h so that the
 * `target.start` access below (used at @0xdf23b6 `cmpq $0x0, 0x50(%rsi)`) is
 * legible. The layout is compatible: `source.start` starts at offset 0,
 * `source.duration` at +0x18, `target.start` at +0x30, `target.duration` at +0x48.
 * @struct CoreMedia CMTimeMapping
 */
export interface CMTimeMapping {
  source: CMTimeRange;
  target: CMTimeRange;
}

/**
 * FFAVFCompositionAudioCursor — an audio cursor for an AVComposition-backed
 * media reader. Extends FFAVFAudioCursor with:
 *   • a retained AVSampleBufferGenerator (+0x18),
 *   • an inline CMTimeMapping (+0x20..+0x7F) that maps the underlying track
 *     time-space to the composition's time-space.
 * Its presentationTimeStamp() consults the target range of the mapping and
 * offsets the AVSampleCursor's own PTS by target.start.
 *
 * @class Flexo FFAVFCompositionAudioCursor
 * @provenance Flexo @0xdf2150 (C2), @0xdf21d0 (C1), @0xdf2250 (D2),
 *             @0xdf2290 (D1), @0xdf22d0 (D0),
 *             @0xdf2310 (createSampleBufferForReadRequest),
 *             @0xdf2390 (presentationTimeStamp).
 *             vtables @0x19153d0 (C1/D*), @0x1915450 (C2).
 */
export class FFAVFCompositionAudioCursor {
  /** +0x08 (inherited from FFAVFAudioCursor) — media reader (composition variant). */
  mediaReader: FFAVFCompositionMediaReader | null = null;
  /** +0x10 (inherited from FFAVFAudioCursor) — retained sample cursor. */
  sampleCursor: AVSampleCursor | null = null;
  /** +0x18 — retained AVSampleBufferGenerator (objc_retain @0xdf21ef). */
  bufferGenerator: AVSampleBufferGenerator | null = null;
  /** +0x20..+0x7F — inline CMTimeMapping (source+target CMTimeRange). */
  mapping: CMTimeMapping = {
    source:   { start: { value: 0n, timescale: 0, flags: 0, epoch: 0n },
                duration: { value: 0n, timescale: 0, flags: 0, epoch: 0n } },
    target:   { start: { value: 0n, timescale: 0, flags: 0, epoch: 0n },
                duration: { value: 0n, timescale: 0, flags: 0, epoch: 0n } },
  };

  /**
   * FFAVFCompositionAudioCursor::FFAVFCompositionAudioCursor(reader, cursor,
   *   generator, mapping, mode)  — C1/C2 ctor (byte-identical bodies).
   *
   * Flexo @0xdf2150..0xdf21b0 (C2)  and  @0xdf21d0..0xdf2230 (C1).
   *
   *     pushq  %rbp
   *     movq   %rsp, %rbp
   *     pushq  %r14
   *     pushq  %rbx
   *     movq   %rcx, %r14                        ; r14 = generator (arg 4, rcx)
   *     movq   %rdi, %rbx                        ; rbx = this
   *     callq  __ZN16FFAVFAudioCursorC2EP16FFAVFMediaReaderP14AVSampleCursor
   *                                              ; base(reader, cursor):
   *                                              ; this+0x08 = reader, this+0x10 = cursor
   *     leaq   0xb23xxx(%rip), %rax              ; C1: vtable_C1+0x10  (=0x19153e0)
   *                                              ; C2: vtable_C2+0x10  (=0x1915460)
   *     movq   %rax, (%rbx)                      ; install vptr at this+0x00
   *     movq   %r14, %rdi
   *     callq  *_objc_retain@GOTPCREL(%rip)      ; retained = objc_retain(generator)
   *     leaq   0x10(%rbp), %rcx                  ; rcx = &mapping (caller's stack arg)
   *     movq   %rax, 0x18(%rbx)                  ; this+0x18 = retained
   *     movups (%rcx), %xmm0                     ; copy mapping bytes 0x00..0x0F
   *     movups 0x10(%rcx), %xmm1                 ; copy bytes 0x10..0x1F
   *     movups 0x20(%rcx), %xmm2                 ; copy bytes 0x20..0x2F
   *     movups 0x30(%rcx), %xmm3                 ; copy bytes 0x30..0x3F
   *     movups %xmm0, 0x20(%rbx)                 ; -> this+0x20..0x2F
   *     movups %xmm1, 0x30(%rbx)                 ; -> this+0x30..0x3F
   *     movups %xmm2, 0x40(%rbx)                 ; -> this+0x40..0x4F
   *     movups %xmm3, 0x50(%rbx)                 ; -> this+0x50..0x5F
   *     movups 0x40(%rcx), %xmm0                 ; bytes 0x40..0x4F
   *     movups %xmm0, 0x60(%rbx)                 ; -> this+0x60..0x6F
   *     movups 0x50(%rcx), %xmm0                 ; bytes 0x50..0x5F
   *     movups %xmm0, 0x70(%rbx)                 ; -> this+0x70..0x7F
   *     popq   %rbx ; popq %r14 ; popq %rbp ; retq
   *
   *  Landing pad (@0xdf2231..0xdf2241 in C1, mirror in C2):
   *     movq   %rax, %r14                        ; save exception ptr
   *     movq   %rbx, %rdi
   *     callq  __ZN16FFAVFAudioCursorD2Ev        ; run base D2 to clean up base fields
   *     movq   %r14, %rdi
   *     callq  __Unwind_Resume                   ; re-raise
   *
   * We collapse C1 and C2 into a single TS constructor — the only asm-level
   * difference is the vtable slot installed at +0x00, which has no observable
   * JS effect (dispatch happens through the JS class identity).
   *
   * The `_mode` (int, arg5) is not stored — dropped exactly as the sibling
   * FFAVFQTAudioCursor drops its `int` arg. See file-level note there.
   */
  constructor(
    reader: FFAVFCompositionMediaReader | null,
    cursor: AVSampleCursor | null,
    generator: AVSampleBufferGenerator | null,
    mapping: CMTimeMapping,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- dropped by ctor body @0xdf2150 (see file note)
    _mode: number,
  ) {
    // Base ctor stores reader -> +0x08 and cursor -> +0x10 (retain semantics
    // owned by FFAVFAudioCursor; not yet transcribed). Called from @0xdf21dd.
    this.mediaReader = reader;
    this.sampleCursor = cursor;

    // objc_retain @0xdf21ef  -> this+0x18 = retained generator
    // Modeled as a plain reference in TS — objc lifetime is out of scope here.
    this.bufferGenerator = generator;

    // 6 × 16-byte SIMD copies @0xdf21fd..0xdf222b copy the 96-byte CMTimeMapping
    // in from the caller's stack slot into this+0x20..this+0x7F. In TS we take
    // the struct by reference; we deep-copy to preserve by-value semantics
    // (the asm materially copies bytes, so a caller mutation to `mapping` after
    //  the ctor must not affect us).
    this.mapping = {
      source: {
        start:    { ...mapping.source.start },
        duration: { ...mapping.source.duration },
      },
      target: {
        start:    { ...mapping.target.start },
        duration: { ...mapping.target.duration },
      },
    };
  }

  /**
   * FFAVFCompositionAudioCursor::~FFAVFCompositionAudioCursor()  — D2/D1 base+complete.
   *
   * Flexo @0xdf2250..0xdf227b (D2), @0xdf2290..0xdf22bb (D1).
   *
   *     pushq  %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax
   *     movq   %rdi, %rbx                        ; save this
   *     leaq   0xb23180(%rip), %rax              ; rax = vtable_C1+0x10 (0x19153e0)
   *     movq   %rax, (%rdi)                      ; reinstall vptr (Itanium C++ ABI:
   *                                              ; each dtor reinstalls this-subclass's
   *                                              ; vptr before delegating to base D2)
   *     movq   0x18(%rdi), %rdi                  ; rdi = this.bufferGenerator (+0x18)
   *     callq  *_objc_release@GOTPCREL(%rip)     ; objc_release(generator)
   *     movq   %rbx, %rdi
   *     addq   $0x8, %rsp
   *     popq   %rbx ; popq %rbp
   *     jmp    __ZN16FFAVFAudioCursorD2Ev        ; tail-jmp to base D2 (which
   *                                              ; releases +0x10 sampleCursor
   *                                              ; and any base retains)
   *
   *   Landing pad: `movq %rax,%rdi; callq ___clang_call_terminate` — if the
   *   release itself throws, terminate (never happens for objc_release under
   *   normal circumstances).
   *
   *   D1 body is byte-identical to D2 aside from the vtable-reinstall
   *   displacement (@0xdf2299 uses 0xb23140 -> same target 0x19153e0). We fold
   *   both into destroy().
   */
  destroy(): void {
    // objc_release(this.bufferGenerator) — clears +0x18.
    this.bufferGenerator = null;
    // Base ~FFAVFAudioCursor() releases sampleCursor and mediaReader retains.
    // Not yet transcribed @__ZN16FFAVFAudioCursorD2Ev (tail-jmp @0xdf2276 / @0xdf22b6).
    this.mediaReader = null;
    this.sampleCursor = null;
  }

  /**
   * FFAVFCompositionAudioCursor::~FFAVFCompositionAudioCursor()  — D0 deleting.
   *
   * Flexo @0xdf22d0..0xdf22fb.
   *
   *     pushq  %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax
   *     movq   %rdi, %rbx
   *     leaq   0xb23100(%rip), %rax              ; -> 0x19153e0 (C1 vtable+0x10)
   *     movq   %rax, (%rdi)                      ; reinstall vptr
   *     movq   0x18(%rdi), %rdi
   *     callq  *_objc_release@GOTPCREL(%rip)     ; objc_release(generator)
   *     movq   %rbx, %rdi
   *     callq  __ZN16FFAVFAudioCursorD2Ev        ; run base D2 in place (NOT tail-jmp)
   *     movq   %rbx, %rdi
   *     addq   $0x8, %rsp ; popq %rbx ; popq %rbp
   *     jmp    0x1497404                         ; symbol stub for __ZdlPv
   *                                              ; => operator delete(this)
   */
  destroyAndFree(): void {
    // Same observable state-clearing as destroy(); operator delete is a no-op in TS (GC).
    this.destroy();
  }

  /**
   * FFAVFCompositionAudioCursor::createSampleBufferForReadRequest(arg,
   *   mode, time, prerollBatch) const
   *
   * Flexo @0xdf2310..0xdf2383.
   *
   *     pushq  %rbp
   *     movq   %rsp, %rbp
   *     subq   $0x80, %rsp
   *     movl   %esi, %r8d                        ; caller arg1 (int)  -> r8d (arg 5)
   *     movq   0x8(%rdi),  %rax                  ; rax = this.mediaReader     (+0x08)
   *     movq   0x10(%rdi), %rsi                  ; rsi = this.sampleCursor    (+0x10) (arg 2)
   *     movq   0x18(%rdi), %rdx                  ; rdx = this.bufferGenerator (+0x18) (arg 3)
   *     movups 0x70(%rdi), %xmm0                 ; copy mapping[+0x50..+0x5F] -> stack[+0x68]
   *     movups %xmm0, 0x68(%rsp)                 ; (target.duration lo)
   *     movups 0x60(%rdi), %xmm0                 ; -> stack[+0x58]
   *     movups %xmm0, 0x58(%rsp)                 ; (target.start.epoch/dur hi)
   *     movups 0x20(%rdi), %xmm0                 ; source range fields:
   *     movups 0x30(%rdi), %xmm1
   *     movups 0x40(%rdi), %xmm2
   *     movups 0x50(%rdi), %xmm3
   *     movups %xmm3, 0x48(%rsp)                 ; -> stack[+0x48]  (target.start hi)
   *     movups %xmm2, 0x38(%rsp)                 ; -> stack[+0x38]  (source.dur lo)
   *     movups %xmm1, 0x28(%rsp)                 ; -> stack[+0x28]  (source.dur hi/dur lo)
   *     movups %xmm0, 0x18(%rsp)                 ; -> stack[+0x18]  (source.start)
   *     movq   0x20(%rbp), %rcx                  ; caller's CMTime.epoch (stack)   -> stack[+0x10]
   *     movq   %rcx, 0x10(%rsp)
   *     movaps 0x10(%rbp), %xmm0                 ; caller's CMTime {value,ts,flags}
   *     movups %xmm0, (%rsp)                     ; -> stack[+0x00]
   *     movq   %rax, %rdi                        ; rdi = mediaReader (target `this`)
   *     xorl   %ecx, %ecx                        ; rcx = 0 (bool = false, arg 4)
   *     callq  __ZNK27FFAVFCompositionMediaReader32createSampleBufferForReadRequest...
   *                                              ; not tail-jmp — has a stack frame
   *     addq   $0x80, %rsp ; popq %rbp ; retq
   *
   * Reshuffles registers/stack to invoke the concrete-reader variant:
   *   mediaReader->createSampleBufferForReadRequest(
   *       this.sampleCursor,                 // AVSampleCursor*
   *       this.bufferGenerator,              // AVSampleBufferGenerator*
   *       false,                             // bool
   *       arg,                               // int
   *       time,                              // CMTime (24 bytes, on stack in ABI)
   *       this.mapping)                      // CMTimeMapping (96 bytes, on stack)
   *
   * NOTE the argument-ORDER shuffle vs the QT sibling: this variant places
   * the AVSampleBufferGenerator as arg-3 (before the bool), whereas the QT
   * sibling has just `(cursor, bool, ...)`. That reflects the composition
   * reader's distinct signature (extra generator param).
   *
   * The by-value CMTimeMapping is packed onto the stack in ~little-endian
   * byte order relative to caller-facing struct offsets. In TS we hand the
   * struct through by reference — CMTimeMapping is treated as immutable at
   * this callsite (the callee is expected to read it).
   */
  createSampleBufferForReadRequest(
    arg: number,
    mode: FFMediaReaderRequestMode,
    time: CMTime,
    prerollBatch: FFPrerollBatch | null,
  ): unknown {
    if (this.mediaReader === null) {
      throw new Error(
        "FFAVFCompositionAudioCursor.createSampleBufferForReadRequest @0xdf2310: this.mediaReader (+0x08) is null — undefined behaviour in the original (would call through a NULL C++ `this` at @0xdf2376)."
      );
    }
    // `mode` is the FFMediaReaderRequestMode parameter — the asm accepts it
    // in %edx (arg 3 of the C-ABI call) but the callee's own signature has
    // `mode` slotted before the `CMTime time`. The composition reader's
    // ported entrypoint is not yet transcribed; we forward `mode` positionally.
    void mode;
    // `prerollBatch` is the trailing FFPrerollBatch* — passed on the caller's
    // stack (arg 4 at [rbp+0x28] in this ABI variant). Not directly touched
    // by this method's body; the callee reads it. Forwarded unchanged.
    void prerollBatch;

    return this.mediaReader.createSampleBufferForReadRequest(
      this.sampleCursor,      // +0x10
      this.bufferGenerator,   // +0x18
      false,                  // xorl %ecx,%ecx @0xdf2374
      arg,                    // esi -> r8d
      time,                   // by-value CMTime, stack-packed
      this.mapping,           // by-value CMTimeMapping, stack-packed
    );
  }

  /**
   * FFAVFCompositionAudioCursor::presentationTimeStamp() const
   *
   * Flexo @0xdf2390..0xdf245c.
   *
   *   Prologue:
   *     pushq  %rbp ; movq %rsp,%rbp ; pushq %r14 ; pushq %rbx ; subq $0x50,%rsp
   *     movq   %rsi, %r14                        ; r14 = this
   *     movq   %rdi, %rbx                        ; rbx = &out (CMTime return slot)
   *     movq   _kCMTimeInvalid@GOTPCREL(%rip), %rax
   *     movq   0x10(%rax), %rcx ; movq %rcx, 0x10(%rdi)   ; out.epoch    = 0
   *     movups (%rax), %xmm0    ; movups %xmm0, (%rdi)    ; out.value/ts/flags = 0/0/0
   *                                                       ; -> out = kCMTimeInvalid
   *     cmpq   $0x0, 0x50(%rsi)                  ; test this.mapping.target.start.value == 0 ?
   *     je     0xdf23dc                          ; if zero: go to decodeTimeStamp branch
   *
   *   Branch A — target.start.value != 0 (@0xdf23bd..0xdf23da):
   *     movq   0x10(%r14), %rsi                  ; rsi = this.sampleCursor (+0x10)
   *     addq   $0x50, %r14                       ; r14 = &this.mapping.target.start
   *     testq  %rsi, %rsi                        ; sampleCursor == null?
   *     je     0xdf23f7                          ; if null: skip msgSend, zero the CMTime buf
   *     movq   _selref_presentationTimeStamp(%rip), %rdx   ; selref @0x1BF35D0 -> "presentationTimeStamp"
   *     leaq   -0x30(%rbp), %rdi                 ; rdi = &tmp CMTime (stret out)
   *     callq  _objc_msgSend_stret               ; tmp = [sampleCursor presentationTimeStamp];
   *     jmp    0xdf2406                          ; fall through to CMTimeAdd
   *
   *   Branch B — target.start.value == 0 (@0xdf23dc..0xdf23f5):
   *     movq   0x10(%r14), %rsi                  ; rsi = this.sampleCursor
   *                                              ; (r14 still = this here — no addq yet)
   *     testq  %rsi, %rsi
   *     je     0xdf2433                          ; if null: skip msgSend, write out=0 & return
   *     movq   _selref_decodeTimeStamp(%rip), %rdx  ; selref @0x1BF35E4 -> "decodeTimeStamp"
   *     leaq   -0x30(%rbp), %rdi
   *     callq  _objc_msgSend_stret               ; tmp = [sampleCursor decodeTimeStamp];
   *     jmp    0xdf2442                          ; go write out = tmp (no add)
   *
   *   Null-cursor path (Branch A + null cursor) — @0xdf23f7:
   *     xorps  %xmm0,%xmm0 ; movaps %xmm0,-0x30(%rbp) ; movq $0,-0x20(%rbp)
   *                                              ; tmp = kCMTimeInvalid (all zeros)
   *     ; fall through to 0xdf2406
   *
   *   Common tail — CMTimeAdd(tmp, this.mapping.target.start) into *rbx (@0xdf2406..0xdf2431):
   *     movq   0x10(%r14),%rax ; movq %rax, 0x28(%rsp)      ; b.epoch = target.start.epoch
   *     movups (%r14), %xmm0 ; movups %xmm0, 0x18(%rsp)     ; b.value/ts/flags = target.start
   *     movq   -0x20(%rbp),%rax ; movq %rax, 0x10(%rsp)     ; a.epoch = tmp.epoch
   *     movaps -0x30(%rbp),%xmm0 ; movups %xmm0, (%rsp)     ; a.value/ts/flags = tmp
   *     movq   %rbx,%rdi ; callq _CMTimeAdd                 ; *rbx = CMTimeAdd(a=tmp, b=target.start)
   *     jmp    0xdf2451                                     ; -> epilogue
   *
   *   Null-cursor path (Branch B + null cursor) — @0xdf2433..0xdf244f:
   *     xorps  %xmm0,%xmm0 ; movaps %xmm0,-0x30(%rbp) ; movq $0,-0x20(%rbp)
   *                                              ; tmp = kCMTimeInvalid
   *     movq   -0x20(%rbp),%rax ; movq %rax, 0x10(%rbx)     ; out.epoch = 0
   *     movaps -0x30(%rbp),%xmm0 ; movups %xmm0, (%rbx)     ; out.value/ts/flags = 0
   *                                              ; => *rbx = kCMTimeInvalid, no add
   *
   *   Branch-B success path — @0xdf2442..0xdf244f:
   *     movq   -0x20(%rbp),%rax ; movq %rax, 0x10(%rbx)     ; out.epoch = tmp.epoch
   *     movaps -0x30(%rbp),%xmm0 ; movups %xmm0, (%rbx)     ; out.value/ts/flags = tmp
   *                                              ; => *rbx = sampleCursor.decodeTimeStamp
   *                                              ;    (no CMTimeAdd — target.start is 0)
   *
   *   Epilogue:
   *     movq   %rbx, %rax ; addq $0x50,%rsp ; popq %rbx ; popq %r14 ; popq %rbp ; retq
   *
   * Distilled semantics:
   *   const target = this.mapping.target.start;
   *   if (target.value != 0) {
   *     const pts = this.sampleCursor
   *       ? [sampleCursor presentationTimeStamp]     // objc_msgSend_stret
   *       : kCMTimeInvalid;                          // {0,0,0,0}
   *     return CMTimeAdd(pts, target);
   *   } else {
   *     if (!this.sampleCursor) return kCMTimeInvalid;
   *     return [sampleCursor decodeTimeStamp];       // no add
   *   }
   *
   * The `objc_msgSend_stret` call to AVSampleCursor -presentationTimeStamp /
   * -decodeTimeStamp is unported ObjC — modeled as an interface method on
   * AVSampleCursor. We surface it via a THROWing frontier stub so callers
   * that exercise this path get a clean provenance error until the AVFoundation
   * shim is added.
   */
  presentationTimeStamp(): CMTime {
    // @0xdf23a1..0xdf23b5: initialize `out` = kCMTimeInvalid.
    // (Not directly observable in TS — we assign the final value; the
    //  intermediate init exists only because the asm writes-through *rbx.)

    const target = this.mapping.target.start;

    // @0xdf23b6 cmpq $0x0, 0x50(%rsi)
    // NOTE: the asm compares only the 8-byte `.value` word of target.start,
    // not the full CMTime. A non-Valid CMTime with value=0 still takes the
    // ==0 branch; a Valid CMTime with value!=0 takes the !=0 branch. We
    // mirror that literal-word check faithfully (bigint comparison).
    if (target.value !== 0n) {
      // Branch A @0xdf23bd — use `presentationTimeStamp` selector.
      let pts: CMTime;
      if (this.sampleCursor === null) {
        // @0xdf23f7: tmp = kCMTimeInvalid (all zeros).
        pts = { ...kCMTimeInvalid };
      } else {
        // @0xdf23ca..0xdf23da: tmp = [sampleCursor presentationTimeStamp];
        pts = objcMsgSend_presentationTimeStamp(this.sampleCursor);
      }
      // @0xdf2406..0xdf242c: CMTimeAdd(tmp, target.start).
      return CMTimeAdd(pts, target);
    } else {
      // Branch B @0xdf23dc — use `decodeTimeStamp` selector.
      if (this.sampleCursor === null) {
        // @0xdf2433..0xdf244f: *out = kCMTimeInvalid, no add.
        return { ...kCMTimeInvalid };
      }
      // @0xdf23e5..0xdf23f5: tmp = [sampleCursor decodeTimeStamp];
      // @0xdf2442..0xdf244f: *out = tmp, no add.
      return objcMsgSend_decodeTimeStamp(this.sampleCursor);
    }
  }
}

/**
 * Frontier stub — objc_msgSend to AVSampleCursor -presentationTimeStamp.
 * Called from Flexo @0xdf23d5 via `_objc_msgSend_stret` with selector
 * `__objc_selrefs @0x1BF35D0 -> "presentationTimeStamp"`.
 * Returns AVSampleCursor's own PTS in the containing track's time-space.
 * Not part of this port; the AVFoundation shim must inject the real handler.
 * @frontier AVFoundation AVSampleCursor -presentationTimeStamp
 */
function objcMsgSend_presentationTimeStamp(_cursor: AVSampleCursor): CMTime {
  // raise: unported ObjC frontier at Flexo @0xdf23d5 (selref @0x1BF35D0 "presentationTimeStamp").
  throw new Error(
    "FFAVFCompositionAudioCursor.presentationTimeStamp @0xdf23d5: " +
    "objc_msgSend_stret to AVSampleCursor -presentationTimeStamp is unported. " +
    "Selref @0x1BF35D0 (Flexo x86_64 __objc_selrefs) — see AVFoundation shim TODO."
  );
}

/**
 * Frontier stub — objc_msgSend to AVSampleCursor -decodeTimeStamp.
 * Called from Flexo @0xdf23f0 via `_objc_msgSend_stret` with selector
 * `__objc_selrefs @0x1BF35E4 -> "decodeTimeStamp"`.
 * Returns AVSampleCursor's DTS in the containing track's time-space.
 * Not part of this port; the AVFoundation shim must inject the real handler.
 * @frontier AVFoundation AVSampleCursor -decodeTimeStamp
 */
function objcMsgSend_decodeTimeStamp(_cursor: AVSampleCursor): CMTime {
  // raise: unported ObjC frontier at Flexo @0xdf23f0 (selref @0x1BF35E4 "decodeTimeStamp").
  throw new Error(
    "FFAVFCompositionAudioCursor.presentationTimeStamp @0xdf23f0: " +
    "objc_msgSend_stret to AVSampleCursor -decodeTimeStamp is unported. " +
    "Selref @0x1BF35E4 (Flexo x86_64 __objc_selrefs) — see AVFoundation shim TODO."
  );
}
