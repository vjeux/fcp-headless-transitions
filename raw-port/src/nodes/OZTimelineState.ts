// OZTimelineState.ts — raw transcription of Ozone `OZTimelineState`.
//
// `OZTimelineState` is the per-document timeline view state Ozone serialises
// with the scene (display toggles, vertical zooms, and the visible time range).
// ONE method is transcribed in this file: `setDisplayRange`. Its siblings (the
// ctors, the five other setters, writeHeader/writeBody/parseBegin/parseEnd/
// parseElement, markFactoriesForSerialization, the dtors) are NOT ported here;
// do not add them without their own disassembly and address citations.
//
// Provenance (Ozone framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Symbol ported in this file:
//   @0x3704f0  OZTimelineState::setDisplayRange(PCTimeRange const&)
//                __ZN15OZTimelineState15setDisplayRangeERK11PCTimeRange
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym __ZN15OZTimelineState15setDisplayRangeERK11PCTimeRange Ozone`):
//   raw-port/re/disasm/__ZN15OZTimelineState15setDisplayRangeERK11PCTimeRange.s (15 lines)
//
// ---------------------------------------------------------------------------
// WHAT THE FUNCTION IS
// ---------------------------------------------------------------------------
// The compiler-generated `PCTimeRange::operator=` inlined into a setter: a
// self-assignment guard followed by a byte copy of the 48-byte PCTimeRange
// (two 24-byte CMTimes) into the instance's own range at +0x20. It calls
// nothing and returns nothing.
//
// ---------------------------------------------------------------------------
// LAYOUT — recovered from the DEFAULT CTOR [C2] @0x370130 (read as evidence,
// NOT transcribed — it is its own ledger unit and depends on the unported
// OZPreferenceManager):
//
//   struct OZTimelineState {
//     void*       vtable;              // +0x00  `movq %rax,(%rdi)` @0x370141
//     bool        displayVideo;        // +0x08  @0x370179 (getTimelineDisplayVideo)
//     bool        displayAudio;        // +0x09  @0x370184
//     bool        displayKeyframes;    // +0x0a  @0x37018f
//     bool        displayMasks;        // +0x0b  @0x37019a
//     bool        displayBehaviors;    // +0x0c  @0x3701a5
//     bool        displayEffects;      // +0x0d  @0x3701b0
//     double      videoVerticalZoom;   // +0x10  `movsd %xmm0,0x10(%rbx)` @0x3701bb
//     double      audioVerticalZoom;   // +0x18  `movsd %xmm0,0x18(%rbx)` @0x3701c8
//     PCTimeRange displayRange;        // +0x20 .. +0x4f  (48 bytes)
//   };
//
// The ctor initialises BOTH halves of displayRange from CoreMedia's
// `_kCMTimeZero` — `movups (%rax),%xmm0 ; movups %xmm0,0x20(%rdi)` +
// `movq 0x10(%rax),%rcx ; movq %rcx,0x30(%rdi)` @0x37014b..0x370156 for the
// START, and the identical pair into 0x38/0x48 @0x37015a..0x370165 for the
// DURATION. That is exactly the two-CMTime PCTimeRange the landed
// `raw-port/src/infra/PCTimeRange.ts` models (start +0x00..+0x17, duration
// +0x18..+0x2f), placed at instance offset +0x20 — which is what makes the
// four stores in the ported body below line up field-for-field.
//
// CMTime's own 24-byte layout (value i64 +0x00, timescale i32 +0x08, flags u32
// +0x0c, epoch i64 +0x10) is the one documented in raw-port/src/infra/CMTime.ts;
// it is why each CMTime here is copied as ONE 16-byte `movups` (value +
// timescale + flags) plus ONE 8-byte `movq` (epoch).
//
// ---------------------------------------------------------------------------
// CALLEES: none. No in-scope call, no extern, no allocation, no indirect or
// virtual dispatch (`depgraph.py deps` lists nothing).

import type { PCTimeRange } from "../infra/PCTimeRange.js";

/**
 * The fields of `OZTimelineState` that this method touches.
 *
 * Only `displayRange` (+0x20) is declared — the toggles and zooms documented in
 * the file header belong to the ctor/setter units and are deliberately NOT
 * modelled here.
 *
 * @Ozone 0x3704f0
 */
export interface OZTimelineStateState {
  /** +0x20 .. +0x4f — the visible time range (`leaq 0x20(%rdi),%rax` @0x3704f4). */
  displayRange: PCTimeRange;
}

/**
 * `OZTimelineState::setDisplayRange(PCTimeRange const& range)`
 *   — @Ozone 0x3704f0
 *   — __ZN15OZTimelineState15setDisplayRangeERK11PCTimeRange
 *
 * Copies `range` into `this->displayRange`, skipping the copy entirely when the
 * argument IS that member (the inlined copy-assignment's self-assignment
 * guard).
 *
 * Full transcription — every instruction, in order:
 *
 *   0x3704f0  pushq  %rbp                    ; frame setup (no TS counterpart)
 *   0x3704f1  movq   %rsp,%rbp               ; frame setup (no TS counterpart)
 *   0x3704f4  leaq   0x20(%rdi),%rax         ; rax = &this->displayRange
 *   0x3704f8  cmpq   %rsi,%rax               ; flags on (&member - &range)
 *   0x3704fb  je     0x37051b                ;   same object -> do nothing
 *   0x3704fd  movq   0x10(%rsi),%rcx         ; \ start.epoch  (src +0x10)
 *   0x370501  movq   %rcx,0x10(%rax)         ; /              (dst +0x30)
 *   0x370505  movups (%rsi),%xmm0            ; \ start.value + timescale + flags
 *   0x370508  movups %xmm0,(%rax)            ; /  (16 bytes, src +0x00 -> dst +0x20)
 *   0x37050b  movq   0x28(%rsi),%rax         ; \ duration.epoch (src +0x28)
 *   0x37050f  movq   %rax,0x48(%rdi)         ; /                (dst +0x48)
 *   0x370513  movups 0x18(%rsi),%xmm0        ; \ duration.value + timescale + flags
 *   0x370517  movups %xmm0,0x38(%rdi)        ; /  (16 bytes, src +0x18 -> dst +0x38)
 *   0x37051b  popq   %rbp                    ; frame teardown (shared exit)
 *   0x37051c  retq
 *
 * Decode notes:
 *   * `cmpq %rsi,%rax ; je` compares POINTERS — `&this->displayRange` against
 *     the argument's address — so the guard fires only for a literal
 *     self-assignment (`s.setDisplayRange(s.displayRange)`), not for an equal
 *     VALUE. The port therefore uses reference identity (`===`), never a
 *     field-by-field comparison.
 *   * each CMTime is copied as an 8-byte epoch store FOLLOWED by a 16-byte
 *     store of value/timescale/flags; the order is preserved below. The copy is
 *     BY VALUE into the instance's own storage, so the port assigns the four
 *     scalar fields rather than re-pointing at the caller's object — a
 *     reference assignment would alias storage the machine never aliases.
 *   * nothing else on the instance is touched, and there is no return value.
 *
 * @param self  — the `OZTimelineState` instance (`%rdi`).
 * @param range — the new range (`%rsi`, by const reference).
 */
export function OZTimelineState_setDisplayRange(
  self: OZTimelineStateState,
  range: PCTimeRange,
): void {
  // @0x3704f4  leaq 0x20(%rdi),%rax — the destination is the member itself.
  const dst = self.displayRange;

  // @0x3704f8-0x3704fb  cmpq %rsi,%rax ; je 0x37051b — self-assignment: no-op.
  if (dst === range) {
    return;
  }

  // @0x3704fd-0x370501  movq 0x10(%rsi),%rcx ; movq %rcx,0x10(%rax)
  dst.start.epoch = range.start.epoch; // +0x30 <- +0x10
  // @0x370505-0x370508  movups (%rsi),%xmm0 ; movups %xmm0,(%rax) — one
  // 16-byte store covering value (+0x00), timescale (+0x08) and flags (+0x0c).
  dst.start.value = range.start.value;
  dst.start.timescale = range.start.timescale;
  dst.start.flags = range.start.flags;

  // @0x37050b-0x37050f  movq 0x28(%rsi),%rax ; movq %rax,0x48(%rdi)
  dst.duration.epoch = range.duration.epoch; // +0x48 <- +0x28
  // @0x370513-0x370517  movups 0x18(%rsi),%xmm0 ; movups %xmm0,0x38(%rdi)
  dst.duration.value = range.duration.value;
  dst.duration.timescale = range.duration.timescale;
  dst.duration.flags = range.duration.flags;
}
