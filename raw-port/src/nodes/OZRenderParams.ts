// OZRenderParams — the "render params" bag Ozone threads through every renderer
// callback (buildRenderGraph, getBounds, hash*, makeRender, ...). It's the
// large heap-allocated object referenced by many OZ*Render* methods (see
// raw-port/src/nodes/OZRenderNode.ts, OZImageNode.ts) and is currently modelled
// as `unknown` at those callsites — this file adds the FIRST decoded field
// layout for OZRenderParams: the resolution + resolution-related slots that
// `setResolution(PCVector2<double>&)` writes.
//
// Framework: Ozone
// Binary:   /Applications/Final Cut Pro.app/Contents/Frameworks/
//           Ozone.framework/Versions/A/Ozone (x86_64 slice; unadjusted VAs).
// Disasm:   raw-port/re/disasm/__ZN14OZRenderParams13setResolutionERK9PCVector2IdE.s
//
// -----------------------------------------------------------------------------
// FIELD LAYOUT (fields discovered from setResolution's writes; other slots
// are as-yet-undecoded and left OPAQUE — we don't invent unread fields)
// -----------------------------------------------------------------------------
//   +0x018  PCVector2<double>  resolutionAt18   ; @0x27170b write (16 bytes)
//   +0x188  PCVector2<double>  zeroedAt188      ; @0x271719 write (16 bytes zero)
//   +0x198  PCVector2<double>  zeroedAt198      ; @0x271712 write (16 bytes zero)
//   +0x1b0  PCVector2<double>  resolutionAt1b0  ; @0x2716f7 write (16 bytes)
//   +0x1c0  PCVector2<double>  resolutionAt1c0  ; @0x271701 write (16 bytes)
//
// The three "resolutionAt*" slots all receive the SAME PCVector2 in setResolution
// — a fan-out into three cached copies (likely the master resolution + two
// derived-basis slots that other methods read; we don't yet know their exact
// role, so we DON'T fabricate names — the addresses ARE the names).
//
// The two "zeroedAt*" slots receive a 16-byte zero — they hold something
// (probably a PCVector2 offset/origin/subregion pair) whose value is reset
// whenever a fresh resolution is set. We model them as PCVector2<double> too
// because the store width (movups xmm0, 16 bytes) is identical.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN14OZRenderParams13setResolutionERK9PCVector2IdE
//       — OZRenderParams::setResolution(PCVector2<double> const&) @Ozone 0x2716f0
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/
//              __ZN14OZRenderParams13setResolutionERK9PCVector2IdE.s)
// -----------------------------------------------------------------------------
//   __ZN14OZRenderParams13setResolutionERK9PCVector2IdE:
//     0x2716f0  pushq  %rbp                        ; frame prologue
//     0x2716f1  movq   %rsp, %rbp
//     0x2716f4  movups (%rsi), %xmm0               ; xmm0 = *vec (16 bytes;
//                                                   ; two f64s: x @+0, y @+8)
//     0x2716f7  movups %xmm0, 0x1b0(%rdi)          ; this[+0x1b0] = *vec
//     0x2716fe  movups (%rsi), %xmm0               ; xmm0 = *vec (reload;
//                                                   ; the compiler didn't
//                                                   ; hoist the load — the
//                                                   ; three writes each
//                                                   ; re-read *vec)
//     0x271701  movups %xmm0, 0x1c0(%rdi)          ; this[+0x1c0] = *vec
//     0x271708  movups (%rsi), %xmm0               ; xmm0 = *vec (reload)
//     0x27170b  movups %xmm0, 0x18(%rdi)           ; this[+0x018] = *vec
//     0x27170f  xorps  %xmm0, %xmm0                ; xmm0 = 0
//     0x271712  movups %xmm0, 0x198(%rdi)          ; this[+0x198] = 0,0
//     0x271719  movups %xmm0, 0x188(%rdi)          ; this[+0x188] = 0,0
//     0x271720  popq   %rbp                        ; frame epilogue
//     0x271721  retq

/**
 * `PCVector2<double>` — two `double` fields (x, y), packed 16 bytes, no
 * padding (a `movups`-friendly 128-bit blob). Modelled as two `number`
 * fields (JS doubles are IEEE-754 f64, identical to `double`). This is
 * the type of `setResolution`'s stack argument (rsi = pointer to a 16-
 * byte struct).
 */
export interface PCVector2Double {
  x: number;
  y: number;
}

/**
 * `OZRenderParams` — the render-params bag. Only the fields touched by
 * `setResolution` are decoded at this layer; the rest of the object is
 * OPAQUE (undecoded) and is intentionally NOT modelled here — future
 * ports of other OZRenderParams methods will add fields as their
 * addresses are read.
 *
 * All decoded slots hold a `PCVector2<double>` (16 bytes at their
 * offset). We reproduce that shape faithfully — no invented names.
 */
export class OZRenderParams {
  /** @Ozone offset +0x018 — written by setResolution @0x27170b. */
  resolutionAt18: PCVector2Double = { x: 0, y: 0 };

  /** @Ozone offset +0x188 — zeroed by setResolution @0x271719. */
  zeroedAt188: PCVector2Double = { x: 0, y: 0 };

  /** @Ozone offset +0x198 — zeroed by setResolution @0x271712. */
  zeroedAt198: PCVector2Double = { x: 0, y: 0 };

  /** @Ozone offset +0x1b0 — written by setResolution @0x2716f7. */
  resolutionAt1b0: PCVector2Double = { x: 0, y: 0 };

  /** @Ozone offset +0x1c0 — written by setResolution @0x271701. */
  resolutionAt1c0: PCVector2Double = { x: 0, y: 0 };

  /**
   * `OZRenderParams::setResolution(PCVector2<double> const&)`
   *   — @Ozone 0x2716f0
   *   — __ZN14OZRenderParams13setResolutionERK9PCVector2IdE
   *
   * Faithful line-for-line transcription of the disassembly quoted in
   * the file header. Copies the input PCVector2<double> into three
   * cache slots (+0x18, +0x1b0, +0x1c0) and zeroes two paired slots
   * (+0x188, +0x198). All five moves are 128-bit (`movups`), so we
   * copy BOTH the x and y fields as a unit.
   *
   * The disassembly re-reads `*vec` before each of the three copies
   * (@0x2716f4, @0x2716fe, @0x271708). The compiler did not hoist the
   * load; a faithful port preserves the same three reads. In JS this
   * has no observable effect (no reader can mutate the input between
   * the sub-statements of setResolution), but the source order is
   * preserved because Rule 1 says transcribe, don't reimplement.
   *
   * Field-by-field observations:
   *   - resolutionAt18 receives the LATEST setResolution value.
   *   - resolutionAt1b0 receives it too (16 bytes at +0x1b0).
   *   - resolutionAt1c0 receives it too (16 bytes at +0x1c0).
   *   - zeroedAt188 and zeroedAt198 are RESET TO (0, 0) — whatever
   *     they held before (an offset? an origin? a sub-region?) is
   *     wiped when the resolution changes.
   */
  setResolution(vec: PCVector2Double): void {
    // @0x2716f4-0x2716f7 — this[+0x1b0] = *vec
    this.resolutionAt1b0 = { x: vec.x, y: vec.y };
    // @0x2716fe-0x271701 — this[+0x1c0] = *vec  (compiler re-read *vec)
    this.resolutionAt1c0 = { x: vec.x, y: vec.y };
    // @0x271708-0x27170b — this[+0x018] = *vec  (compiler re-read *vec)
    this.resolutionAt18 = { x: vec.x, y: vec.y };
    // @0x27170f-0x271712 — this[+0x198] = (0, 0)
    this.zeroedAt198 = { x: 0, y: 0 };
    // @0x27170f-0x271719 — this[+0x188] = (0, 0)  (reuses the zeroed xmm0)
    this.zeroedAt188 = { x: 0, y: 0 };
  }
}
