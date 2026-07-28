// FFAudioBuss.ts — Flexo/FFAudioBuss base class. Six virtual scheduling hooks
// that concrete audio-bus subclasses (mix bus, monitor bus, etc.) override.
// In the base class, every one of them is a bit-exact no-op: the compiler
// emitted the canonical `pushq %rbp / movq %rsp,%rbp / popq %rbp / retq`
// prologue-then-epilogue with no body — i.e. `void f(...) {}`.
//
// FRAMEWORK: Flexo.framework (Final Cut Pro).
// BINARY:    /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// DECODE:    raw-port/re/disasm/Flexo.FFAudioBuss.*.s (captured via disasm.sh)
//
// SYMBOLS (from /tmp/Flexo_symmap.tsv):
//   __ZN11FFAudioBuss12PrerollBeginE6CMTimeS0_S0_dP13FFPrerollSync  @0x00e644f0
//     ; PrerollBegin(CMTime, CMTime, CMTime, double, FFPrerollSync*)
//   __ZN11FFAudioBuss10PrerollEndEv                                   @0x00e64500
//     ; PrerollEnd()
//   __ZN11FFAudioBuss14PreRenderBeginE6CMTimeP13FFPrerollSync         @0x00e64510
//     ; PreRenderBegin(CMTime, FFPrerollSync*)
//   __ZN11FFAudioBuss12PreRenderEndEv                                 @0x00e64520
//     ; PreRenderEnd()
//   __ZN11FFAudioBuss20AdvanceScopingWindowE6CMTimeP13FFPrerollSync   @0x00e64530
//     ; AdvanceScopingWindow(CMTime, FFPrerollSync*)
//   __ZN11FFAudioBuss35FindAssociatedMixBussScopingWindowsEP31FFAudioDynamicScopingWindowList
//                                                                    @0x00e64540
//     ; FindAssociatedMixBussScopingWindows(FFAudioDynamicScopingWindowList*)
//
// DISASSEMBLY (every method — identical shape):
//   0000000000e644f0  pushq  %rbp
//   0000000000e644f1  movq   %rsp, %rbp
//   0000000000e644f4  popq   %rbp
//   0000000000e644f5  retq
// No body between prologue and epilogue: no callq, no mem access, no ret
// value written to %rax/%xmm0. These are pure virtual-dispatch anchors —
// the base contract lets subclasses opt into preroll/render/scoping-window
// notifications without every subclass having to implement every hook.
//
// TYPES REFERENCED IN THE SIGNATURES (not called, so not decoded here):
//   CMTime                          — already ported at raw-port/src/infra/CMTime.ts
//   FFPrerollSync*                  — opaque frontier pointer (not yet decoded)
//   FFAudioDynamicScopingWindowList*— opaque frontier pointer (not yet decoded)
//
// Because the method bodies literally contain no operations, there is
// nothing to fuzz against the real symbol — but the transcription is
// exact by inspection.

import type { CMTime } from "../infra/CMTime";

// Opaque frontier types — we do not decode their layouts here. They exist
// only as parameters that the base implementation ignores.
export interface FFPrerollSync { /* opaque — see Flexo binary */ }
export interface FFAudioDynamicScopingWindowList { /* opaque — see Flexo binary */ }

export class FFAudioBuss {
  // @0x00e644f0  PrerollBegin(CMTime start, CMTime endInclusive, CMTime endExclusive,
  //                          double rate, FFPrerollSync* sync) -> void
  //   Prologue+epilogue only. No body.
  PrerollBegin(
    _start: CMTime,
    _endInclusive: CMTime,
    _endExclusive: CMTime,
    _rate: number,
    _sync: FFPrerollSync | null,
  ): void {
    // empty: matches base @0x00e644f0
  }

  // @0x00e64500  PrerollEnd() -> void
  //   Prologue+epilogue only. No body.
  PrerollEnd(): void {
    // empty: matches base @0x00e64500
  }

  // @0x00e64510  PreRenderBegin(CMTime time, FFPrerollSync* sync) -> void
  //   Prologue+epilogue only. No body.
  PreRenderBegin(_time: CMTime, _sync: FFPrerollSync | null): void {
    // empty: matches base @0x00e64510
  }

  // @0x00e64520  PreRenderEnd() -> void
  //   Prologue+epilogue only. No body.
  PreRenderEnd(): void {
    // empty: matches base @0x00e64520
  }

  // @0x00e64530  AdvanceScopingWindow(CMTime time, FFPrerollSync* sync) -> void
  //   Prologue+epilogue only. No body.
  AdvanceScopingWindow(_time: CMTime, _sync: FFPrerollSync | null): void {
    // empty: matches base @0x00e64530
  }

  // @0x00e64540  FindAssociatedMixBussScopingWindows(FFAudioDynamicScopingWindowList*) -> void
  //   Prologue+epilogue only. No body.
  FindAssociatedMixBussScopingWindows(
    _list: FFAudioDynamicScopingWindowList | null,
  ): void {
    // empty: matches base @0x00e64540
  }
}
