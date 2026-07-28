// FFAudioPlaybackUnit.ts — Flexo framework class.
// Transcribed from the x86_64 disassembly of Flexo in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// (see raw-port/re/disasm/Flexo.FFAudioPlaybackUnit.*.s).
//
// Symbols (nm -arch x86_64 | c++filt):
//   0x00d06fa0 T __ZN19FFAudioPlaybackUnit15setPlaybackTimeE6CMTimeN15FFAudioPlayback17PlaybackDirectionE
//                                    FFAudioPlaybackUnit::setPlaybackTime(CMTime, FFAudioPlayback::PlaybackDirection)
//   0x00d06fc0 T __ZN19FFAudioPlaybackUnit19disablePlaybackUnitEv
//                                    FFAudioPlaybackUnit::disablePlaybackUnit()
//   0x00d06fd0 T __ZN19FFAudioPlaybackUnit7setRateEf
//                                    FFAudioPlaybackUnit::setRate(float)
//   0x00d06fe0 T __ZN19FFAudioPlaybackUnit14prerollUnitEndEv
//                                    FFAudioPlaybackUnit::prerollUnitEnd()
//   0x00d11870 T __ZN19FFAudioPlaybackUnit16prerollUnitBeginER6CMTimeS1_S1_dP20FFStreamAudioOptionsRP13FFPrerollSync
//                                    FFAudioPlaybackUnit::prerollUnitBegin(CMTime&, CMTime&, CMTime&, double,
//                                                                         FFStreamAudioOptions*, FFPrerollSync*&)
//
// PROVENANCE / DECODE:
//   raw-port/re/disasm/Flexo.FFAudioPlaybackUnit.setPlaybackTime.s
//   raw-port/re/disasm/Flexo.FFAudioPlaybackUnit.disablePlaybackUnit.s
//   raw-port/re/disasm/Flexo.FFAudioPlaybackUnit.setRate.s
//   raw-port/re/disasm/Flexo.FFAudioPlaybackUnit.prerollUnitEnd.s
//   raw-port/re/disasm/Flexo.FFAudioPlaybackUnit.prerollUnitBegin.s
//
// ── EVERY EXPORTED BODY IS A RELEASE-BUILD NO-OP ─────────────────────────
// All five exported functions have the identical 5-byte body:
//   pushq %rbp
//   movq  %rsp, %rbp
//   popq  %rbp
//   retq
//   nopw  %cs:(%rax,%rax)   ; padding
//
// No field is read, no field is written, no callee is invoked.  None of
// these five methods touches (this) beyond receiving it in %rdi and
// immediately discarding.  They accept `CMTime` values (16-byte structs
// passed in-register per SysV ABI), `float`, `double`, and pointer
// arguments — all of which are dropped on entry.
//
// This is the classic pattern of a class whose observable side-effects
// are DEBUG-ONLY or DEFAULT-INTERFACE-ONLY — the release build ships
// the vtable slot symbols so callers link, but the actual work is
// performed by an override in a concrete subclass (or was macro'd out
// via `#if NDEBUG`).  The virtual dispatch happens in whichever
// FFAudioPlaybackUnit subclass FCP instantiates at runtime; the
// symbols exported here are the base class's default/no-op fallbacks.
//
// We do not INVENT a debug body: the five bodies as observed are
// correct — they do exactly nothing, and any faithful TypeScript port
// must match that.  Callers who need the real semantics will get them
// in the (out-of-scope, not-yet-transcribed) concrete subclass
// implementations.
//
// ── STRUCT LAYOUT ────────────────────────────────────────────────────────
// Because none of the five bodies READS OR WRITES any (this) offset,
// sizeof and layout are not recoverable from this class in isolation.
// We model instances as an empty nominal type to keep the API surface
// stable.

import type { CMTime } from "../infra/CMTime.js";

/**
 * FFAudioPlayback::PlaybackDirection — a scoped enum passed by value
 * (int-width) to `setPlaybackTime`.  The enum's constants are not
 * observable from this class's asm, so we keep it as a nominal opaque
 * numeric type; concrete callers can define constants elsewhere.
 */
export type FFAudioPlaybackPlaybackDirection = number & { readonly __brand_FFAudioPlaybackDir: unique symbol };

/**
 * Opaque handle to a Flexo FFStreamAudioOptions — not decoded here.
 * Only passed by pointer to `prerollUnitBegin`; the pointee is not
 * touched by the no-op body.
 */
export interface FFStreamAudioOptions {
  readonly __brand_FFStreamAudioOptions: unique symbol;
}

/**
 * Opaque handle to a Flexo FFPrerollSync — not decoded here.  Passed
 * by reference-to-pointer (`FFPrerollSync*&`) to `prerollUnitBegin`;
 * the pointee is not touched by the no-op body.
 */
export interface FFPrerollSync {
  readonly __brand_FFPrerollSync: unique symbol;
}

/**
 * FFAudioPlaybackUnit — the base-class default implementation of a
 * per-unit audio playback interface.  All five exported methods are
 * release-build no-ops.  Instances of this class hold no observable
 * state (its layout cannot be inferred from these five symbols alone).
 */
export class FFAudioPlaybackUnit {
  /**
   * FFAudioPlaybackUnit::setPlaybackTime(CMTime, FFAudioPlayback::PlaybackDirection)
   *   —  Flexo @0xd06fa0.
   *
   * Body (raw-port/re/disasm/Flexo.FFAudioPlaybackUnit.setPlaybackTime.s):
   *   0xd06fa0  pushq %rbp
   *   0xd06fa1  movq  %rsp, %rbp
   *   0xd06fa4  popq  %rbp
   *   0xd06fa5  retq
   *
   * Every argument is discarded.  The `CMTime` (16-byte struct) is
   * passed in {%rdi, %rsi} per SysV ABI's small-struct rules, and the
   * enum arg in %edx — none are read.  We accept them for API-shape
   * fidelity but do not act on them.
   */
  public setPlaybackTime(
    _time: CMTime,
    _direction: FFAudioPlaybackPlaybackDirection
  ): void {
    // 0xd06fa0..0xd06fa5 — deliberate no-op (release-build default).
  }

  /**
   * FFAudioPlaybackUnit::disablePlaybackUnit()  —  Flexo @0xd06fc0.
   *
   * Body (raw-port/re/disasm/Flexo.FFAudioPlaybackUnit.disablePlaybackUnit.s):
   *   0xd06fc0  pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq
   *
   * Deliberate no-op.
   */
  public disablePlaybackUnit(): void {
    // 0xd06fc0..0xd06fc5 — deliberate no-op (release-build default).
  }

  /**
   * FFAudioPlaybackUnit::setRate(float)  —  Flexo @0xd06fd0.
   *
   * Body (raw-port/re/disasm/Flexo.FFAudioPlaybackUnit.setRate.s):
   *   0xd06fd0  pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq
   *
   * `rate` arrives in %xmm0 and is discarded.  Deliberate no-op.
   */
  public setRate(_rate: number): void {
    // 0xd06fd0..0xd06fd5 — deliberate no-op (release-build default).
  }

  /**
   * FFAudioPlaybackUnit::prerollUnitEnd()  —  Flexo @0xd06fe0.
   *
   * Body (raw-port/re/disasm/Flexo.FFAudioPlaybackUnit.prerollUnitEnd.s):
   *   0xd06fe0  pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq
   *
   * Deliberate no-op.
   */
  public prerollUnitEnd(): void {
    // 0xd06fe0..0xd06fe5 — deliberate no-op (release-build default).
  }

  /**
   * FFAudioPlaybackUnit::prerollUnitBegin(CMTime&, CMTime&, CMTime&, double,
   *                                       FFStreamAudioOptions*, FFPrerollSync*&)
   *   —  Flexo @0xd11870.
   *
   * Body (raw-port/re/disasm/Flexo.FFAudioPlaybackUnit.prerollUnitBegin.s):
   *   0xd11870  pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq
   *
   * All six by-reference / by-value arguments are discarded — no
   * pointee is read, no field is stored, the return-by-reference
   * `FFPrerollSync*&` output slot is NOT written.  A caller relying on
   * that output slot receiving a value will read whatever was already
   * there (undefined for a fresh stack slot).  Deliberate no-op.
   */
  public prerollUnitBegin(
    _timeA: CMTime,
    _timeB: CMTime,
    _timeC: CMTime,
    _rate: number,
    _options: FFStreamAudioOptions | null,
    _prerollSyncOut: { value: FFPrerollSync | null }
  ): void {
    // 0xd11870..0xd11875 — deliberate no-op (release-build default).
  }
}
