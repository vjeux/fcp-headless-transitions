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
//   * __ZN14OZRenderParams16setBlendingGammaEf
//       — OZRenderParams::setBlendingGamma(float) @Ozone 0x271610
//   * __ZN14OZRenderParams20setResolutionDynamicERK9PCVector2IdE
//       — OZRenderParams::setResolutionDynamic(PCVector2<double> const&) @Ozone 0x271730
//         (raw-port/re/disasm/
//           __ZN14OZRenderParams20setResolutionDynamicERK9PCVector2IdE.s — 15 lines)
//   * __ZN14OZRenderParams25setReducedResolutionMediaEb
//       — OZRenderParams::setReducedResolutionMedia(bool) @Ozone 0x271970
//         (raw-port/re/disasm/
//           __ZN14OZRenderParams25setReducedResolutionMediaEb.s — 7 lines)
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

  /** @Ozone offset +0x2e0 — written by setBlendingGamma @0x271614 (float32 store). */
  blendingGamma: number = 0;

  /**
   * @Ozone offset +0x108 — a one-byte flag written by `setIsPlaying(bool)`
   * @0x271184 via `movb %sil,0x108(%rdi)`. The single-byte width (`movb`)
   * confirms the field is a `bool` / uint8 (C++ `bool` is one byte in the
   * Itanium/AAPCS ABIs used by clang on macOS). Preserved as `number`
   * (0..255) here so the exact bit-width the machine writes is legible.
   *
   * We don't invent a name for the state this byte controls beyond "is
   * playing" — the setter tells us its role, so the field name mirrors
   * it directly.
   */
  isPlayingAt108: number = 0;

  /**
   * @Ozone offset +0x1e6 — a one-byte flag written by
   * `setReducedResolutionMedia(bool)` @0x271974 via
   * `movb %sil,0x1e6(%rdi)`. The single-byte width (`movb`) confirms
   * the field is a `bool` / uint8 (C++ `bool` is one byte on x86_64
   * Itanium/AAPCS). The setter name tells us this byte holds the
   * "use reduced-resolution media" preference — when set, the render
   * pipeline draws from the proxy/reduced-res media path instead of
   * the full-res original. Preserved as `number` (0..255) so the
   * exact byte-width the machine writes stays legible; no downstream
   * reader has been decoded yet, so we don't add a boolean getter
   * that would fabricate a coercion the disasm doesn't perform.
   */
  reducedResolutionMediaAt1e6: number = 0;

  /**
   * @Ozone offset +0x1a8 — a one-byte flag/mode discriminator, read
   * @0x27173e by `setResolutionDynamic` via `cmpb $0x1, 0x1a8(%rdi)`.
   * When this byte holds the value `1`, `setResolutionDynamic` fans the
   * incoming resolution out to the same "downstream" cache slots that
   * `setResolution` writes (+0x18, +0x188, +0x198). When it holds any
   * other value, `setResolutionDynamic` only writes the `+0x1c0` slot
   * and leaves the downstream slots untouched.
   *
   * Semantically this is likely a "dynamic-resolution enabled?" or
   * "override-mode == follow-dynamic?" boolean, but the setter/writer
   * for this byte lives in a different (not-yet-ported) OZRenderParams
   * method, so we don't invent a name for the mode — the offset IS the
   * name until the setter's disasm reveals it. Modelled as `number`
   * (0..255) to preserve the single-byte width the `cmpb` operates on.
   */
  flagByteAt1a8: number = 0;

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

  /**
   * `OZRenderParams::setBlendingGamma(float)`
   *   — @Ozone 0x271610
   *   — __ZN14OZRenderParams16setBlendingGammaEf
   *
   * Faithful transcription of the 7-line disassembly:
   *   0x271610  pushq  %rbp
   *   0x271611  movq   %rsp, %rbp
   *   0x271614  movss  %xmm0, 0x2e0(%rdi)   ; this->+0x2e0 = arg (float32 store)
   *   0x27161c  popq   %rbp
   *   0x27161d  retq
   *
   * Single-instruction body: store the incoming float32 gamma into the
   * class slot at +0x2e0. Per Rule 4 (match the machine's numerics),
   * `movss` is a 32-bit float store — we clamp precision with Math.fround
   * so downstream reads see exactly the value the CPU would return from
   * `movss` (JS numbers are f64; the truncation is real on the machine).
   *
   * Zero in-scope callees, zero externs — pure field write.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZN14OZRenderParams16setBlendingGammaEf.s (7 lines)
   */
  setBlendingGamma(gamma: number): void {
    // @0x271614  movss %xmm0,0x2e0(%rdi)
    this.blendingGamma = Math.fround(gamma);
  }

  /**
   * `OZRenderParams::setResolutionDynamic(PCVector2<double> const&)`
   *   — @Ozone 0x271730
   *   — __ZN14OZRenderParams20setResolutionDynamicERK9PCVector2IdE
   *
   * Faithful line-for-line transcription of the 15-line disassembly:
   *
   *   0x271730  pushq  %rbp                        ; frame prologue
   *   0x271731  movq   %rsp, %rbp
   *   0x271734  movups (%rsi), %xmm0               ; xmm0 = *vec (16 bytes)
   *   0x271737  movups %xmm0, 0x1c0(%rdi)          ; this[+0x1c0] = *vec
   *
   *   0x27173e  cmpb   $0x1, 0x1a8(%rdi)           ; flag byte @+0x1a8 == 1 ?
   *   0x271745  jne    0x271763                    ;   ; if not, skip fan-out
   *
   *   0x271747  movups 0x1c0(%rdi), %xmm0          ; xmm0 = this[+0x1c0]
   *                                                ; (i.e. the value we JUST wrote — a
   *                                                ; register-reload rather than reading
   *                                                ; *vec again; compiler chose this over
   *                                                ; keeping xmm0 live, presumably to
   *                                                ; free the reg between blocks)
   *   0x27174e  movups %xmm0, 0x18(%rdi)           ; this[+0x018] = *vec
   *   0x271752  xorps  %xmm0, %xmm0                ; xmm0 = 0
   *   0x271755  movups %xmm0, 0x188(%rdi)          ; this[+0x188] = (0, 0)
   *   0x27175c  movups %xmm0, 0x198(%rdi)          ; this[+0x198] = (0, 0)
   *
   *   0x271763  popq   %rbp                        ; frame epilogue
   *   0x271764  retq
   *
   * SEMANTICS:
   *   Always writes the "dynamic resolution" cache slot at +0x1c0. Then:
   *     - If the mode-byte at +0x1a8 is 1, propagates that value through
   *       to the downstream cache slots (+0x18 gets the vec, +0x188 and
   *       +0x198 are zeroed) — i.e. exactly the SAME downstream writes
   *       that `setResolution(vec)` performs. So when mode==1, calling
   *       setResolutionDynamic ends up equivalent to setResolution
   *       PLUS the +0x1c0 cache stamp.
   *     - If the mode-byte is anything else, only +0x1c0 is touched;
   *       the downstream cache stays put.
   *
   *   The `+0x1a8 == 1` gate is the "dynamic mode overrides static
   *   resolution" latch — when the caller has told OZRenderParams "use
   *   dynamic resolution as the source of truth", any dynamic-resolution
   *   update also refreshes the downstream cache. Otherwise the static
   *   `setResolution(vec)` remains the sole writer of the downstream
   *   cache slots.
   *
   * DEPENDENCIES: zero in-scope, zero externs. Pure field writes.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZN14OZRenderParams20setResolutionDynamicERK9PCVector2IdE.s
   */
  setResolutionDynamic(vec: PCVector2Double): void {
    // @0x271734  movups (%rsi),%xmm0
    // @0x271737  movups %xmm0,0x1c0(%rdi)
    //   this[+0x1c0] = *vec  (16-byte copy)
    this.resolutionAt1c0 = { x: vec.x, y: vec.y };

    // @0x27173e  cmpb  $0x1,0x1a8(%rdi)
    // @0x271745  jne   0x271763
    //   Fall through to the fan-out only when the flag byte == 1.
    //   (`cmpb` computes `flag - 1`; `jne` = ZF==0 = flag != 1.)
    if (this.flagByteAt1a8 === 1) {
      // @0x271747  movups 0x1c0(%rdi),%xmm0
      //   xmm0 = this[+0x1c0] (the value we just wrote above; the
      //   disasm re-reads the destination rather than keeping the
      //   source in a register — faithful to the compiler's choice).
      // @0x27174e  movups %xmm0,0x18(%rdi)
      //   this[+0x018] = xmm0 = this[+0x1c0] = *vec
      this.resolutionAt18 = { x: this.resolutionAt1c0.x, y: this.resolutionAt1c0.y };

      // @0x271752  xorps %xmm0,%xmm0            ; xmm0 = 0 (16 zero bytes)
      // @0x271755  movups %xmm0,0x188(%rdi)      ; this[+0x188] = (0, 0)
      // @0x27175c  movups %xmm0,0x198(%rdi)      ; this[+0x198] = (0, 0)
      //
      // Note on write order: the disasm writes +0x188 BEFORE +0x198,
      // which is the REVERSE of setResolution's write order. It's the
      // SAME zero value going to both, so the observable state is the
      // same either way, but we mirror the disasm order here.
      this.zeroedAt188 = { x: 0, y: 0 };
      this.zeroedAt198 = { x: 0, y: 0 };
    }

    // @0x271763-0x271764 — epilogue + retq.
  }

  /**
   * `OZRenderParams::setIsPlaying(bool)`
   *   — @Ozone 0x271180
   *   — __ZN14OZRenderParams12setIsPlayingEb
   *
   * Faithful line-for-line transcription of the 7-line disassembly:
   *   0x271180  pushq  %rbp                        ; frame prologue
   *   0x271181  movq   %rsp, %rbp
   *   0x271184  movb   %sil, 0x108(%rdi)            ; this->+0x108 = arg (bool, 1 byte)
   *   0x27118b  popq   %rbp                        ; frame epilogue
   *   0x27118c  retq
   *
   * Single-instruction body: store the incoming C++ `bool` argument
   * (SysV/AAPCS puts scalar arg2 in `%rsi`, and `bool` occupies the
   * low byte `%sil`) into the class slot at +0x108. Boolean semantics
   * on x86_64 are zero-extended in the caller, so the observable state
   * of the byte is 0 or 1.
   *
   * Zero in-scope callees, zero externs, no indirect calls — pure
   * field write.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZN14OZRenderParams12setIsPlayingEb.s (7 lines)
   */
  setIsPlaying(isPlaying: boolean): void {
    // @0x271184  movb %sil,0x108(%rdi)
    //   C++ `bool` → 1 byte: true == 0x01, false == 0x00.
    this.isPlayingAt108 = isPlaying ? 1 : 0;
  }

  /**
   * `OZRenderParams::setReducedResolutionMedia(bool)`
   *   — @Ozone 0x271970
   *   — __ZN14OZRenderParams25setReducedResolutionMediaEb
   *
   * Faithful line-for-line transcription of the 7-line disassembly:
   *   0x271970  pushq  %rbp                        ; frame prologue
   *   0x271971  movq   %rsp, %rbp
   *   0x271974  movb   %sil, 0x1e6(%rdi)            ; this->+0x1e6 = arg (bool, 1 byte)
   *   0x27197b  popq   %rbp                        ; frame epilogue
   *   0x27197c  retq
   *   0x27197d  nopl   (%rax)                       ; padding to next 16-byte boundary
   *
   * Single-instruction body: store the incoming C++ `bool` argument
   * (SysV/AAPCS puts scalar arg2 in `%rsi`, and `bool` occupies the
   * low byte `%sil`) into the class slot at +0x1e6. Boolean semantics
   * on x86_64 are zero-extended in the caller, so the observable state
   * of the byte is 0 or 1.
   *
   * Zero in-scope callees, zero externs, no indirect calls — pure
   * field write. Structurally identical to `setIsPlaying(bool)` (also
   * a 7-line `movb %sil,off(%rdi)`), just a different destination
   * offset (+0x1e6 vs +0x108).
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZN14OZRenderParams25setReducedResolutionMediaEb.s (7 lines)
   */
  setReducedResolutionMedia(reducedResolutionMedia: boolean): void {
    // @0x271974  movb %sil,0x1e6(%rdi)
    //   C++ `bool` → 1 byte: true == 0x01, false == 0x00.
    this.reducedResolutionMediaAt1e6 = reducedResolutionMedia ? 1 : 0;
  }
}
