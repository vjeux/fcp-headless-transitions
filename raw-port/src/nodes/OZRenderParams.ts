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
   * @Ozone offset +0x1e0 — a one-byte "do high-quality resampling" flag
   * written by `setDoHighQualityResampling(bool)` @0x271824 as `movb %sil,0x1e0(%rdi)`
   * (the incoming bool argument's low byte). Modelled as `number` (0..255)
   * because the setter is a byte-level `movb`; JS booleans would lose the
   * exact bit pattern the machine passes to a caller that reads the raw
   * byte back (e.g. via a member load through a `char` pointer).
   */
  doHighQualityResamplingAt1e0: number = 0;

  /**
   * @Ozone offset +0x1e1 — a SECOND one-byte flag written to the SAME
   * value as `+0x1e0` by `setDoHighQualityResampling(bool)` @0x27182b
   * (`movb %sil,0x1e1(%rdi)`). The compiler emitted two separate byte
   * stores, not a single 16-bit store, so the two slots are semantically
   * distinct fields the class happens to keep in lock-step through this
   * setter. Some other (not-yet-ported) writer may set them independently;
   * until that writer is decoded we leave both slots exposed and named by
   * offset. Modelled as `number` (0..255) for the same reason as +0x1e0.
   */
  doHighQualityResamplingMirrorAt1e1: number = 0;

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
   * `OZRenderParams::setDoHighQualityResampling(bool)`
   *   — @Ozone 0x271820
   *   — __ZN14OZRenderParams26setDoHighQualityResamplingEb
   *
   * Faithful line-for-line transcription of the 10-line disassembly at
   * raw-port/re/disasm/__ZN14OZRenderParams26setDoHighQualityResamplingEb.s:
   *
   *   0x271820  pushq  %rbp
   *   0x271821  movq   %rsp, %rbp
   *   0x271824  movb   %sil, 0x1e0(%rdi)          ; this->+0x1e0 = arg
   *   0x27182b  movb   %sil, 0x1e1(%rdi)          ; this->+0x1e1 = arg
   *   0x271832  xorps  %xmm0, %xmm0               ; xmm0 = 0 (16 bytes)
   *   0x271835  movups %xmm0, 0x188(%rdi)         ; this->+0x188 = (0, 0)
   *   0x27183c  movups %xmm0, 0x198(%rdi)         ; this->+0x198 = (0, 0)
   *   0x271843  popq   %rbp
   *   0x271844  retq
   *
   * The setter has FOUR observable effects, in this order:
   *   1. Write the argument byte to the "primary" HQR flag at +0x1e0.
   *   2. Write the same argument byte to the "mirror" HQR flag at +0x1e1.
   *   3. Zero the 16-byte slot at +0x188 (zeroedAt188 in this file).
   *   4. Zero the 16-byte slot at +0x198 (zeroedAt198 in this file).
   *
   * The zeroing of +0x188 / +0x198 is the SAME state-reset side-effect
   * `setResolution` performs when a new resolution is installed — these
   * two slots hold some derived caching that must be invalidated when
   * the resampling policy changes (and, by symmetry, when the resolution
   * itself changes). We do not invent names for what those slots hold;
   * they retain the offset-named field they had before.
   *
   * ABI: SysV x86_64. `bool` args are passed in the low byte of the
   * next integer register — `%sil` is the low byte of `%rsi`, which is
   * the 2nd integer arg (1st is `this` in `%rdi`). The C++ boolean
   * true/false representation is 1/0; we mask the input to the low byte
   * with `& 0xff` so any wider caller (e.g. a bug that passes 0x100) is
   * modelled EXACTLY as the machine sees it — `movb` truncates to 8 bits.
   *
   * Zero in-scope callees; no imports needed.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZN14OZRenderParams26setDoHighQualityResamplingEb.s
   */
  setDoHighQualityResampling(doHighQualityResampling: boolean | number): void {
    // Faithful `movb %sil` model: capture only the low 8 bits of the
    // argument (a `bool` in C++ is stored as a single byte 0 or 1, but
    // a rogue caller could pass any int8; the machine truncates). If
    // the input is a JS boolean, convert to 0/1 as C++ does.
    const sil =
      typeof doHighQualityResampling === "boolean"
        ? (doHighQualityResampling ? 1 : 0)
        : (doHighQualityResampling & 0xff);

    // @0x271824  movb %sil, 0x1e0(%rdi)
    this.doHighQualityResamplingAt1e0 = sil;
    // @0x27182b  movb %sil, 0x1e1(%rdi)
    this.doHighQualityResamplingMirrorAt1e1 = sil;

    // @0x271832  xorps %xmm0, %xmm0            ; xmm0 = 0
    // @0x271835  movups %xmm0, 0x188(%rdi)     ; this->+0x188 = (0, 0)
    // Note: this WRITE ORDER (0x188 before 0x198) matches
    // setResolutionDynamic's order and REVERSES setResolution's order.
    // Since both are zero-writes the observable state is identical, but
    // we mirror the disasm's instruction sequence per Rule 1.
    this.zeroedAt188 = { x: 0, y: 0 };
    // @0x27183c  movups %xmm0, 0x198(%rdi)     ; this->+0x198 = (0, 0)
    this.zeroedAt198 = { x: 0, y: 0 };

    // @0x271843-0x271844 — epilogue + retq.
  }
}
