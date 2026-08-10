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
//   * __ZN14OZRenderParams33setWantsHLGToPQPostProcessingStepEb
//       — OZRenderParams::setWantsHLGToPQPostProcessingStep(bool) @Ozone 0x271470
//         (raw-port/re/disasm/
//           __ZN14OZRenderParams33setWantsHLGToPQPostProcessingStepEb.s — 7 lines)
//   * __ZN14OZRenderParams25setReducedResolutionMediaEb
//       — OZRenderParams::setReducedResolutionMedia(bool) @Ozone 0x271970
//         (raw-port/re/disasm/
//           __ZN14OZRenderParams25setReducedResolutionMediaEb.s — 7 lines)
//   * __ZN14OZRenderParams38setDo3DIntersectionAntialiasingDynamicEb
//       — OZRenderParams::setDo3DIntersectionAntialiasingDynamic(bool) @Ozone 0x271930
//         (raw-port/re/disasm/
//           __ZN14OZRenderParams38setDo3DIntersectionAntialiasingDynamicEb.s — 10 lines)
//   * __ZNK14OZRenderParams20getDestinationDeviceEv
//       — OZRenderParams::getDestinationDevice() const @Ozone 0x2719d0
//         (raw-port/re/disasm/
//           __ZNK14OZRenderParams20getDestinationDeviceEv.s — 7 lines)
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
 * The by-value struct `OZRenderParams::getRenderBounds()` returns — a rect of
 * two `PCVector2<double>`: an `origin` (x,y) stored at the sret's +0x00 and a
 * `size` (width,height) stored at +0x10 (matching the two `movups`/`movupd`
 * stores in the disasm). Not an FCP-named class, but the exact 32-byte struct
 * layout the ABI returns; modelled as a plain shape so callers read the same
 * two vectors the machine writes.
 */
export interface OZRenderBounds {
  /** sret +0x00 — origin corner (x,y). */
  origin: PCVector2Double;
  /** sret +0x10 — size (width,height). */
  size: PCVector2Double;
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
   * @Ozone offset +0x30c — a one-byte flag written by
   * `setWantsHLGToPQPostProcessingStep(bool)` @0x271474 via
   * `movb %sil, 0x30c(%rdi)`. The 1-byte store confirms the field is a
   * C++ `bool` (1 byte in the Itanium/AAPCS ABIs used by clang on
   * macOS). Preserved as `number` (0..255) so the exact bit-width the
   * machine writes is legible. The reader for this flag lives elsewhere
   * in Ozone (an HLG→PQ post-processing gate in the render graph); the
   * setter's disasm alone tells us its role, so the field name mirrors
   * it directly.
   */
  wantsHLGToPQPostProcessingStepAt30c: number = 0;

  /**
   * @Ozone offset +0x1e6 — a one-byte flag written by
   * `setReducedResolutionMedia(bool)` @0x271974 via
   * `movb %sil, 0x1e6(%rdi)`. The 1-byte store confirms the field is a
   * C++ `bool` (1 byte in the Itanium/AAPCS ABIs used by clang on
   * macOS). Preserved as `number` (0..255) so the exact bit-width the
   * machine writes is legible. The reader for this flag lives elsewhere
   * in Ozone (a "media at reduced resolution" gate in the render graph);
   * the setter's disasm alone tells us its role, so the field name
   * mirrors it directly.
   */
  reducedResolutionMediaAt1e6: number = 0;

  /**
   * @Ozone offset +0x144 — a 4-byte integer written by
   * `setWidth(long)` @0x2707a4 via `movl %esi, 0x144(%rdi)`. The
   * `movl` (32-bit store) with `%esi` as the source proves the ABI
   * argument (a C++ `long`, which is 8 bytes on x86_64 macOS) is
   * TRUNCATED to its low 32 bits before being written. The class slot
   * is therefore a 4-byte integer (uint32/int32) — the setter narrows.
   * Modelled as `number` here (JS Number covers int32 exactly).
   */
  widthAt144: number = 0;

  /**
   * @Ozone offset +0x148 — a 4-byte integer written by
   * `setHeight(long)` @0x2707c4 via `movl %esi, 0x148(%rdi)`. Same
   * codegen shape as `setWidth` (32-bit truncating store of the `long`
   * argument), directly adjacent in the struct. Modelled as `number`.
   */
  heightAt148: number = 0;

  /**
   * @Ozone offset +0x248 — the explicit render-bounds ORIGIN, a
   * `PCVector2<double>` (x at +0x248, y at +0x250) read as a packed 128-bit
   * pair by `getRenderBounds() const` @0x270ab5 (`movups 0x248(%rsi),%xmm0`).
   * Together with the size at +0x258 this forms the caller-set render
   * rectangle; when the size at +0x258 is <= 0 the getter ignores these and
   * synthesises bounds from widthAt144/heightAt148 instead. Modelled as a
   * PCVector2Double (the same 16-byte shape the disasm loads).
   */
  renderBoundsOriginAt248: PCVector2Double = { x: 0, y: 0 };

  /**
   * @Ozone offset +0x258 — the explicit render-bounds SIZE, a
   * `PCVector2<double>` (width at +0x258, height at +0x260) read as a packed
   * 128-bit pair by `getRenderBounds() const` @0x270abc
   * (`movups 0x258(%rsi),%xmm1`). Its x/width lane at +0x258 is ALSO the gate
   * the getter tests (`ucomisd 0x258(%rsi),%xmm0` with xmm0=0): width <= 0
   * means "no explicit bounds set" and the getter falls back to the
   * width/height ints. Modelled as a PCVector2Double (x=width, y=height).
   */
  renderBoundsSizeAt258: PCVector2Double = { x: 0, y: 0 };

  /**
   * @Ozone offset +0x120 — an EMBEDDED "destination device" sub-object (not a
   * pointer field: the getter returns its ADDRESS via `leaq 0x120(%rdi),%rax`,
   * so the device data lives inline at this+0x120). Read by
   * `getDestinationDevice() const` @0x2719d4. The device sub-object's own
   * layout is not decoded in this unit (no method here reads through the
   * returned pointer), so it is modeled as an OPAQUE object slot — future
   * ports of methods that touch its fields will refine the type. Modeled as a
   * stable object identity so `getDestinationDevice()` can hand back a
   * reference to the SAME embedded object, mirroring `leaq &this[+0x120]`
   * (a pointer to the inline field, NOT a fresh copy).
   */
  destinationDeviceAt120: object = {}; // @Ozone OZRenderParams@+0x120 (embedded device sub-object)

  /**
   * @Ozone offset +0x1d8 — a 4-byte integer written by
   * `setTextRenderQuality(OZTextQuality)` @0x2717b4 via
   * `movl %esi, 0x1d8(%rdi)`. The `movl` (32-bit store) with `%esi` as
   * the source means the incoming enum (`OZTextQuality`, sizeof 4 in
   * this ABI as evidenced by the `movl` width) is copied verbatim.
   * This is the "static" text-render-quality slot; the sibling
   * `setTextRenderQualityDynamic` @0x2717e0 writes only to +0x1dc.
   * `setTextRenderQuality` writes BOTH slots in one shot — @0x2717b4
   * stamps +0x1d8, then @0x2717ba stamps +0x1dc — so a static update
   * always refreshes the dynamic slot too (belt-and-suspenders parity
   * with the resolution pair at +0x1b0/+0x1c0).
   */
  textRenderQualityAt1d8: number = 0;

  /**
   * @Ozone offset +0x1dc — a 4-byte integer written by BOTH
   * `setTextRenderQuality(OZTextQuality)` @0x2717ba
   * (`movl %esi, 0x1dc(%rdi)`) AND
   * `setTextRenderQualityDynamic(OZTextQuality)` @0x2717e4
   * (`movl %esi, 0x1dc(%rdi)`). This is the "dynamic" slot, kept in
   * lockstep with +0x1d8 whenever the static setter runs. Sizeof 4
   * (from the `movl`). Note: the sibling `setTextRenderQualityDynamic`
   * lives in a separate not-yet-merged port branch; the field is
   * declared here where its FIRST writer (`setTextRenderQuality`)
   * lands. Additive-only: if the sibling branch later lands, its
   * port will refer to this same slot.
   */
  textRenderQualityDynamicAt1dc: number = 0;

  /**
   * @Ozone offset +0x1e5 — a one-byte flag written by
   * `setDo3DIntersectionAntialiasingDynamic(bool)` @0x271934 via
   * `movb %sil, 0x1e5(%rdi)`. The single-byte width (`movb`) confirms
   * this is a C++ `bool` / uint8 field.
   *
   * The setter also zeroes the two paired PCVector2 slots at +0x188
   * and +0x198 whenever this flag is written — the SAME two slots
   * that `setResolution` zeroes. That pairing tells us the flag
   * gates a resolution-dependent cache: flipping "do 3D-intersection
   * antialiasing dynamically" invalidates the cached derived
   * resolution slots so downstream consumers must recompute.
   *
   * Preserved as `number` (0..255) here so the exact bit-width the
   * machine writes is legible; the setter accepts a `bool`.
   */
  do3DIntersectionAntialiasingDynamicAt1e5: number = 0;

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
   * @Ozone offset +0x1d0 — the "render quality" u32 slot, written
   * @0x271774 by `setRenderQuality(OZQuality)` via `movl %esi, 0x1d0(%rdi)`.
   * The argument is an `OZQuality` enum (SysV: 32-bit int in `%esi`); the
   * setter stamps THE SAME value into both this slot and +0x1d4 (see
   * `renderQualityDynamicAt1d4`) — a fan-out into two cached copies. We
   * model it as `number` and keep the offset in the field name because
   * the getter that reads +0x1d0 hasn't been ported yet, so we don't
   * invent a name for the "static vs dynamic quality" split beyond what
   * the two field addresses tell us.
   */
  renderQualityAt1d0: number = 0;

  /**
   * @Ozone offset +0x1e3 — a one-byte flag written by
   * `setDoShapeAntialiasingDynamic(bool)` @0x2718c4 via
   * `movb %sil, 0x1e3(%rdi)`. The single-byte width (`movb`) confirms the
   * field is a C++ `bool` (1 byte in the Itanium/AAPCS ABIs used by clang
   * on macOS). Preserved as `number` (0..255) so the exact bit-width the
   * machine writes is legible.
   *
   * Semantically this is a "dynamic override for do-shape-antialiasing"
   * boolean. Note the ADJACENT byte at +0x1e2 is read by the getter
   * `getDoShapeAntialiasing()` @0x2718eb via `movzbl 0x1e2(%rdi,%rax)`
   * where `%rax` is a 0/1 index loaded from +0x1a8 (the mode-byte). So
   * the getter picks between +0x1e2 (static) and +0x1e3 (dynamic) using
   * the same "dynamic mode?" latch that `setResolutionDynamic` uses.
   * We don't decode the +0x1e2 static slot here (its setter isn't in this
   * unit); we only add the dynamic slot the ported setter writes.
   */
  doShapeAntialiasingDynamicAt1e3: number = 0;

  /**
   * @Ozone offset +0x1e0 — a one-byte flag written by
   * `setDoHighQualityResampling(bool)` @0x271824 via
   * `movb %sil, 0x1e0(%rdi)`. The single-byte width (`movb`) confirms the
   * field is a C++ `bool` (1 byte in the Itanium/AAPCS ABIs used by clang
   * on macOS). Preserved as `number` (0..255) so the exact bit-width the
   * machine writes is legible.
   *
   * This is the "static" high-quality-resampling flag. `setDoHighQualityResampling`
   * writes BOTH this slot AND the adjacent +0x1e1 slot with the SAME bool
   * (a static write that also refreshes the dynamic slot — the same
   * belt-and-suspenders idiom the class uses for the resolution pair at
   * +0x1b0/+0x1c0 and the text-quality pair at +0x1d8/+0x1dc). The
   * reader/getter that picks between the two lives elsewhere in Ozone
   * (a "high quality resampling?" gate in the render graph); the setter's
   * disasm alone tells us its role, so the field name mirrors it directly.
   */
  doHighQualityResamplingAt1e0: number = 0;

  /**
   * @Ozone offset +0x1e1 — a one-byte flag written by
   * `setDoHighQualityResampling(bool)` @0x27182b via
   * `movb %sil, 0x1e1(%rdi)`, directly adjacent to the +0x1e0 static slot
   * and receiving the SAME bool argument. This is the "dynamic" high-
   * quality-resampling slot, kept in lockstep with +0x1e0 whenever the
   * static setter runs. The single-byte width (`movb`) confirms it is a
   * C++ `bool` (1 byte). Preserved as `number` (0..255). A separate,
   * not-yet-ported `setDoHighQualityResamplingDynamic(bool)` would touch
   * only this slot; the field is declared here where its FIRST writer
   * (`setDoHighQualityResampling`) lands. Additive-only.
   */
  doHighQualityResamplingDynamicAt1e1: number = 0;

  /**
   * @Ozone offset +0x1d4 — the "dynamic render quality" u32 slot, written
   * @0x27177a by `setRenderQuality(OZQuality)` via `movl %esi, 0x1d4(%rdi)`.
   * `setRenderQuality` blasts the incoming enum into both this and
   * `renderQualityAt1d0` in one go — the fact that the writer sets both
   * suggests +0x1d0 holds the static (author-set) quality and +0x1d4
   * holds the currently-applied ("dynamic") quality, and that
   * `setRenderQuality` resets the dynamic back to the static. The
   * separate not-yet-ported `setRenderQualityDynamic(OZQuality)` would
   * touch only this slot.
   */
  renderQualityDynamicAt1d4: number = 0;

  /**
   * @Ozone offset +0x1e4 — a one-byte "do 3D-intersection antialiasing" flag
   * written by `setDo3DIntersectionAntialiasing(bool)` @0x271904 as
   * `movb %sil,0x1e4(%rdi)` (the incoming bool argument's low byte).
   * Modelled as `number` (0..255) because the setter uses a byte-level
   * `movb`; a JS boolean would drop the exact bit pattern any wider reader
   * would see through a `char` alias.
   */
  do3DIntersectionAntialiasingAt1e4: number = 0;

  /**
   * @Ozone offset +0x1e5 — a SECOND one-byte flag written to the SAME
   * value as `+0x1e4` by `setDo3DIntersectionAntialiasing(bool)`
   * @0x27190b (`movb %sil,0x1e5(%rdi)`). The compiler emitted two
   * separate byte stores rather than a single 16-bit store, so the two
   * slots are semantically distinct fields the class keeps in lock-step
   * through this particular setter. A future writer decoded from other
   * disasm may set them independently; until then both are surfaced by
   * offset. Modelled as `number` (0..255) for the same reason as +0x1e4.
   */
  do3DIntersectionAntialiasingMirrorAt1e5: number = 0;

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
   * `OZRenderParams::setWantsHLGToPQPostProcessingStep(bool)`
   *   — @Ozone 0x271470
   *   — __ZN14OZRenderParams33setWantsHLGToPQPostProcessingStepEb
   *
   * Faithful line-for-line transcription of the 7-line disassembly:
   *   0x271470  pushq  %rbp                        ; frame prologue
   *   0x271471  movq   %rsp, %rbp
   *   0x271474  movb   %sil, 0x30c(%rdi)            ; this->+0x30c = arg (bool, 1 byte)
   *   0x27147b  popq   %rbp                        ; frame epilogue
   *   0x27147c  retq
   *
   * Single-instruction body: store the incoming C++ `bool` argument
   * (SysV/AAPCS puts scalar arg2 in `%rsi`, and `bool` occupies the
   * low byte `%sil`) into the class slot at +0x30c. Boolean semantics
   * on x86_64 are zero-extended in the caller, so the observable state
   * of the byte is 0 or 1.
   *
   * The flag toggles the HLG→PQ post-processing step in the render
   * graph (the getter/reader lives elsewhere and isn't ported here).
   * Zero in-scope callees, zero externs, no indirect calls — pure
   * field write.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZN14OZRenderParams33setWantsHLGToPQPostProcessingStepEb.s (7 lines)
   */
  setWantsHLGToPQPostProcessingStep(wants: boolean): void {
    // @0x271474  movb %sil,0x30c(%rdi)
    //   C++ `bool` → 1 byte: true == 0x01, false == 0x00.
    this.wantsHLGToPQPostProcessingStepAt30c = wants ? 1 : 0;
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
   *   0x27197d  nopl   (%rax)                      ; alignment padding (not executed)
   *
   * Single-instruction body: store the incoming C++ `bool` argument
   * (SysV/AAPCS puts scalar arg2 in `%rsi`, and `bool` occupies the
   * low byte `%sil`) into the class slot at +0x1e6. Boolean semantics
   * on x86_64 are zero-extended in the caller, so the observable state
   * of the byte is 0 or 1.
   *
   * The flag toggles the "media at reduced resolution" mode of the
   * render graph (a hint used by downstream nodes to skip full-res
   * media decodes). Sibling of the two other 1-byte bool setters on
   * this class (setIsPlaying @0x271180, setWantsHLGToPQPostProcessingStep
   * @0x271470) — same codegen shape, different byte offset.
   *
   * Zero in-scope callees, zero externs, no indirect calls — pure
   * field write.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZN14OZRenderParams25setReducedResolutionMediaEb.s (7 lines)
   */
  setReducedResolutionMedia(reduced: boolean): void {
    // @0x271974  movb %sil,0x1e6(%rdi)
    //   C++ `bool` → 1 byte: true == 0x01, false == 0x00.
    this.reducedResolutionMediaAt1e6 = reduced ? 1 : 0;
  }

  /**
   * `OZRenderParams::setWidth(long)`
   *   — @Ozone 0x2707a0
   *   — __ZN14OZRenderParams8setWidthEl
   *
   * Faithful line-for-line transcription of the 10-line disassembly:
   *   0x2707a0  pushq  %rbp                        ; frame prologue
   *   0x2707a1  movq   %rsp, %rbp
   *   0x2707a4  movl   %esi, 0x144(%rdi)            ; this->+0x144 = (int32) arg
   *   0x2707aa  xorps  %xmm0, %xmm0                 ; xmm0 = 0 (16 zero bytes)
   *   0x2707ad  movups %xmm0, 0x188(%rdi)           ; this->+0x188 = (0, 0)
   *   0x2707b4  movups %xmm0, 0x198(%rdi)           ; this->+0x198 = (0, 0)
   *   0x2707bb  popq   %rbp                        ; frame epilogue
   *   0x2707bc  retq
   *   0x2707bd  nopl   (%rax)                       ; alignment padding
   *
   * SysV/AAPCS puts scalar arg2 in `%rsi`; the argument type is C++
   * `long` (8 bytes on x86_64 macOS), so the full argument occupies
   * `%rsi`. The write is `movl %esi, ...` — a 32-bit store — so the
   * upper 32 bits of the argument are DROPPED before the store. The
   * class slot at +0x144 is therefore a 4-byte int (int32/uint32);
   * a caller passing a value > 2^31-1 will see it truncated. We
   * model that faithfully with a bitwise `| 0` on the JS side, which
   * matches the machine's low-32-bit truncation for values inside
   * the JS safe-integer range (JS Number covers int32 exactly).
   *
   * The two `movups %xmm0, ...` writes zero the paired resolution
   * offset slots at +0x188 and +0x198 — the SAME two slots that
   * `setResolution` and `setResolutionDynamic` (when flagByte==1) zero
   * on every resolution update. Interpretation: `setWidth` is treated
   * as a resolution mutation and invalidates the offset/origin cache
   * that trails the "primary" resolution write. Note this setter does
   * NOT touch the three resolution cache slots (+0x18, +0x1b0, +0x1c0)
   * — only the two zero-cache slots. The width component alone is not
   * enough to rebuild those.
   *
   * Zero in-scope callees, zero externs, no indirect calls — pure
   * field writes.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZN14OZRenderParams8setWidthEl.s (10 lines)
   */
  setWidth(width: number): void {
    // @0x2707a4  movl %esi,0x144(%rdi)
    //   `movl` truncates the C++ `long` arg to its low 32 bits before
    //   storing. `| 0` forces JS Number to int32 to mirror that.
    this.widthAt144 = width | 0;

    // @0x2707aa  xorps  %xmm0,%xmm0        ; xmm0 = 0
    // @0x2707ad  movups %xmm0,0x188(%rdi)  ; this->+0x188 = (0, 0)
    this.zeroedAt188 = { x: 0, y: 0 };

    // @0x2707b4  movups %xmm0,0x198(%rdi)  ; this->+0x198 = (0, 0)
    this.zeroedAt198 = { x: 0, y: 0 };

    // @0x2707bb-0x2707bc — epilogue + retq.
  }

  /**
   * `OZRenderParams::setHeight(long)`
   *   — @Ozone 0x2707c0
   *   — __ZN14OZRenderParams9setHeightEl
   *
   * Faithful line-for-line transcription of the 10-line disassembly:
   *   0x2707c0  pushq  %rbp                        ; frame prologue
   *   0x2707c1  movq   %rsp, %rbp
   *   0x2707c4  movl   %esi, 0x148(%rdi)            ; this->+0x148 = (int32) arg
   *   0x2707ca  xorps  %xmm0, %xmm0                 ; xmm0 = 0
   *   0x2707cd  movups %xmm0, 0x188(%rdi)           ; this->+0x188 = (0, 0)
   *   0x2707d4  movups %xmm0, 0x198(%rdi)           ; this->+0x198 = (0, 0)
   *   0x2707db  popq   %rbp                        ; frame epilogue
   *   0x2707dc  retq
   *   0x2707dd  nopl   (%rax)                       ; alignment padding
   *
   * Identical codegen shape to `setWidth` @0x2707a0, only the target
   * offset differs (+0x148 instead of +0x144). The class slots +0x144
   * (width) and +0x148 (height) are directly adjacent, which strongly
   * suggests they are the pair (int32 width, int32 height) that
   * defines a raw pixel resolution — kept in lockstep with the double-
   * precision resolution vectors at +0x18/+0x1b0/+0x1c0 that
   * `setResolution` writes. The `movl` (32-bit store) proves the slot
   * is a 4-byte int; the `long` argument is truncated to low 32 bits.
   *
   * The two `movups` writes zero the same offset-cache pair at
   * +0x188/+0x198, matching the resolution-mutation invalidation
   * pattern used by `setWidth`, `setResolution`, and
   * `setResolutionDynamic` (when flagByte==1).
   *
   * Zero in-scope callees, zero externs, no indirect calls — pure
   * field writes.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZN14OZRenderParams9setHeightEl.s (10 lines)
   */
  setHeight(height: number): void {
    // @0x2707c4  movl %esi,0x148(%rdi)
    //   `movl` truncates the C++ `long` arg to its low 32 bits before
    //   storing. `| 0` forces JS Number to int32 to mirror that.
    this.heightAt148 = height | 0;

    // @0x2707ca  xorps  %xmm0,%xmm0        ; xmm0 = 0
    // @0x2707cd  movups %xmm0,0x188(%rdi)  ; this->+0x188 = (0, 0)
    this.zeroedAt188 = { x: 0, y: 0 };

    // @0x2707d4  movups %xmm0,0x198(%rdi)  ; this->+0x198 = (0, 0)
    this.zeroedAt198 = { x: 0, y: 0 };

    // @0x2707db-0x2707dc — epilogue + retq.
  }

  /**
   * `OZRenderParams::setTextRenderQuality(OZTextQuality)`
   *   — @Ozone 0x2717b0
   *   — __ZN14OZRenderParams20setTextRenderQualityE13OZTextQuality
   *
   * Faithful line-for-line transcription of the 11-line disassembly:
   *   0x2717b0  pushq  %rbp                        ; frame prologue
   *   0x2717b1  movq   %rsp, %rbp
   *   0x2717b4  movl   %esi, 0x1d8(%rdi)            ; this->+0x1d8 = (int32) arg
   *   0x2717ba  movl   %esi, 0x1dc(%rdi)            ; this->+0x1dc = (int32) arg
   *   0x2717c0  xorps  %xmm0, %xmm0                 ; xmm0 = 0
   *   0x2717c3  movups %xmm0, 0x188(%rdi)           ; this->+0x188 = (0, 0)
   *   0x2717ca  movups %xmm0, 0x198(%rdi)           ; this->+0x198 = (0, 0)
   *   0x2717d1  popq   %rbp                        ; frame epilogue
   *   0x2717d2  retq
   *   0x2717d3  nopw   %cs:(%rax,%rax)               ; alignment padding
   *
   * Writes the incoming `OZTextQuality` enum (4 bytes, per the `movl`
   * store width) into BOTH the static slot at +0x1d8 AND the dynamic
   * slot at +0x1dc — the sibling `setTextRenderQualityDynamic` writes
   * only +0x1dc, so the "static" setter is a superset that always
   * refreshes the dynamic slot too (keeping the two in lockstep, the
   * same belt-and-suspenders pattern used for the resolution pair at
   * +0x1b0/+0x1c0). SysV/AAPCS puts scalar arg2 in `%rsi`; the enum
   * fits in the low 32 bits (`%esi`), which is what the `movl` stores.
   *
   * Then the same +0x188/+0x198 offset-cache invalidation pair is
   * zeroed — every "resolution-family" mutation on this class does
   * this (setResolution, setResolutionDynamic-when-mode==1, setWidth,
   * setHeight, and now setTextRenderQuality). That's consistent with
   * +0x188/+0x198 being derived cache values that any change to the
   * output-space parameters (resolution OR text quality, which may
   * affect subpixel sampling) must invalidate.
   *
   * Zero in-scope callees, zero externs, no indirect calls — pure
   * field writes.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZN14OZRenderParams20setTextRenderQualityE13OZTextQuality.s
   *   (11 lines)
   */
  setTextRenderQuality(quality: number): void {
    // @0x2717b4  movl %esi,0x1d8(%rdi)
    //   `movl` = 32-bit store; enum truncated/copied verbatim to +0x1d8.
    this.textRenderQualityAt1d8 = quality | 0;

    // @0x2717ba  movl %esi,0x1dc(%rdi)
    //   SAME source (%esi), different destination — the dynamic slot
    //   is refreshed with the same value as the static slot.
    this.textRenderQualityDynamicAt1dc = quality | 0;

    // @0x2717c0  xorps  %xmm0,%xmm0        ; xmm0 = 0
    // @0x2717c3  movups %xmm0,0x188(%rdi)  ; this->+0x188 = (0, 0)
    this.zeroedAt188 = { x: 0, y: 0 };

    // @0x2717ca  movups %xmm0,0x198(%rdi)  ; this->+0x198 = (0, 0)
    this.zeroedAt198 = { x: 0, y: 0 };

    // @0x2717d1-0x2717d2 — epilogue + retq.
  }

  /**
   * `OZRenderParams::setRenderQuality(OZQuality)`
   *   — @Ozone 0x271770
   *   — __ZN14OZRenderParams16setRenderQualityE9OZQuality
   *
   * Faithful line-for-line transcription of the 11-line disassembly:
   *   0x271770  pushq  %rbp                        ; frame prologue
   *   0x271771  movq   %rsp, %rbp
   *   0x271774  movl   %esi, 0x1d0(%rdi)            ; this->+0x1d0 = arg (OZQuality, u32)
   *   0x27177a  movl   %esi, 0x1d4(%rdi)            ; this->+0x1d4 = arg (OZQuality, u32)
   *   0x271780  xorps  %xmm0, %xmm0                 ; xmm0 = 0 (16 zero bytes)
   *   0x271783  movups %xmm0, 0x188(%rdi)           ; this->+0x188 = (0, 0)
   *   0x27178a  movups %xmm0, 0x198(%rdi)           ; this->+0x198 = (0, 0)
   *   0x271791  popq   %rbp                        ; frame epilogue
   *   0x271792  retq
   *
   * SEMANTICS:
   *   OZQuality is a C++ enum passed as a 32-bit int in `%esi` (SysV
   *   arg2). setRenderQuality writes the SAME value into two adjacent
   *   u32 slots — +0x1d0 (renderQualityAt1d0, the "static" quality) and
   *   +0x1d4 (renderQualityDynamicAt1d4, the "dynamic" quality). This
   *   is the same fan-out pattern setResolution uses (three copies of
   *   the vec) — a plausible reading is "setting the quality also
   *   resets the dynamic override to match", but we do not invent
   *   semantics beyond the stores the machine performs.
   *
   *   The trailing `movups xmm0=0` to +0x188 and +0x198 zeroes the
   *   SAME two 16-byte "cached derived" slots that setResolution
   *   zeroes (see `zeroedAt188` / `zeroedAt198` above). Since those
   *   slots hold PCVector2<double>-shaped caches derived from
   *   resolution (and, we now learn, invalidated on quality change),
   *   any resolution-derived cache must be recomputed after a quality
   *   change. We mirror the disasm's write order exactly (+0x188 then
   *   +0x198), which is the SAME order as setResolution.
   *
   * DEPENDENCIES: zero in-scope, zero externs, no indirect calls —
   * pure field writes.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZN14OZRenderParams16setRenderQualityE9OZQuality.s
   *   (11 lines total)
   */
  setRenderQuality(quality: number): void {
    // @0x271774  movl %esi,0x1d0(%rdi)
    //   Store the OZQuality enum (u32) into the "static quality" slot.
    //   `| 0` preserves the 32-bit integer semantics the machine uses.
    this.renderQualityAt1d0 = quality | 0;

    // @0x27177a  movl %esi,0x1d4(%rdi)
    //   Store the SAME enum into the adjacent "dynamic quality" slot.
    this.renderQualityDynamicAt1d4 = quality | 0;

    // @0x271780  xorps %xmm0,%xmm0            ; xmm0 = (0.0, 0.0) as 16 bytes
    // @0x271783  movups %xmm0,0x188(%rdi)     ; this->+0x188 = (0, 0)
    // @0x27178a  movups %xmm0,0x198(%rdi)     ; this->+0x198 = (0, 0)
    //
    // Invalidate the two PCVector2<double>-shaped caches that hold
    // resolution-derived values (their meaning is decoded in the
    // `zeroedAt188` / `zeroedAt198` doc-comments above).
    this.zeroedAt188 = { x: 0, y: 0 };
    this.zeroedAt198 = { x: 0, y: 0 };
  }

  /**
   * `OZRenderParams::setDoShapeAntialiasingDynamic(bool)`
   *   — @Ozone 0x2718c0
   *   — __ZN14OZRenderParams29setDoShapeAntialiasingDynamicEb
   *
   * Faithful line-for-line transcription of the 8-line disassembly:
   *   0x2718c0  pushq  %rbp                        ; frame prologue
   *   0x2718c1  movq   %rsp, %rbp
   *   0x2718c4  movb   %sil, 0x1e3(%rdi)           ; this->+0x1e3 = arg (bool, 1 byte)
   *   0x2718cb  xorps  %xmm0, %xmm0                ; xmm0 = 0 (16 zero bytes)
   *   0x2718ce  movups %xmm0, 0x188(%rdi)          ; this->+0x188 = (0, 0)
   *   0x2718d5  movups %xmm0, 0x198(%rdi)          ; this->+0x198 = (0, 0)
   *   0x2718dc  popq   %rbp                        ; frame epilogue
   *   0x2718dd  retq
   *
   * SEMANTICS:
   *   Writes the "dynamic override" byte for do-shape-antialiasing at
   *   +0x1e3, then invalidates the same two paired PCVector2<double>
   *   cache slots (+0x188, +0x198) that both `setResolution` and
   *   `setResolutionDynamic (mode==1 branch)` and `setRenderQuality`
   *   also zero. The zeroing is the SAME "cache invalidation" idiom
   *   used across the class — any parameter change that could affect
   *   resolution-derived caches wipes those two slots so the next
   *   reader recomputes them from scratch.
   *
   *   The two 128-bit stores at +0x188 and +0x198 share the SAME zeroed
   *   xmm0 register (compiler folded the `xorps` once and reused it).
   *   The disasm writes +0x188 BEFORE +0x198 — same order as this port.
   *
   * DEPENDENCIES: zero in-scope, zero externs. Pure field writes.
   *
   * Source disassembly:
   *   /tmp/Ozone_tV.txt lines 642760-642768 (8 lines).
   */
  setDoShapeAntialiasingDynamic(doAA: boolean): void {
    // @0x2718c4  movb %sil,0x1e3(%rdi)
    //   C++ `bool` → 1 byte: true == 0x01, false == 0x00.
    this.doShapeAntialiasingDynamicAt1e3 = doAA ? 1 : 0;

    // @0x2718cb  xorps %xmm0,%xmm0            ; xmm0 = 0 (16 zero bytes)
    // @0x2718ce  movups %xmm0,0x188(%rdi)      ; this[+0x188] = (0, 0)
    // @0x2718d5  movups %xmm0,0x198(%rdi)      ; this[+0x198] = (0, 0)
    //
    // Invalidate the two PCVector2<double>-shaped caches. Disasm writes
    // +0x188 before +0x198; preserved here.
    this.zeroedAt188 = { x: 0, y: 0 };
    this.zeroedAt198 = { x: 0, y: 0 };
  }

  /**
   * `OZRenderParams::setDoHighQualityResampling(bool)`
   *   — @Ozone 0x271820
   *   — __ZN14OZRenderParams26setDoHighQualityResamplingEb
   *
   * Faithful line-for-line transcription of the 11-line disassembly:
   *   0x271820  pushq  %rbp                        ; frame prologue
   *   0x271821  movq   %rsp, %rbp
   *   0x271824  movb   %sil, 0x1e0(%rdi)            ; this->+0x1e0 = arg (bool, 1 byte)
   *   0x27182b  movb   %sil, 0x1e1(%rdi)            ; this->+0x1e1 = arg (bool, 1 byte)
   *   0x271832  xorps  %xmm0, %xmm0                 ; xmm0 = 0 (16 zero bytes)
   *   0x271835  movups %xmm0, 0x188(%rdi)           ; this->+0x188 = (0, 0)
   *   0x27183c  movups %xmm0, 0x198(%rdi)           ; this->+0x198 = (0, 0)
   *   0x271843  popq   %rbp                        ; frame epilogue
   *   0x271844  retq
   *   0x271845  nopw   %cs:(%rax,%rax)              ; alignment padding (not executed)
   *
   * SysV/AAPCS puts scalar arg2 in `%rsi`; a C++ `bool` occupies the low
   * byte `%sil`. The setter writes that SAME byte into TWO adjacent slots
   * (+0x1e0 and +0x1e1) — the static/dynamic pair for the high-quality-
   * resampling flag — then zeroes the +0x188/+0x198 offset-cache pair.
   *
   * The double write mirrors the class's other "static setter refreshes
   * the dynamic slot too" cases (setTextRenderQuality writes +0x1d8 AND
   * +0x1dc; setRenderQuality writes +0x1d0 AND +0x1d4). Here both flag
   * bytes get the same 0/1.
   *
   * The two 128-bit `movups %xmm0, ...` stores zero the SAME +0x188/+0x198
   * offset-cache pair that every "resolution-family" mutation on this
   * class invalidates (setResolution, setResolutionDynamic when mode==1,
   * setWidth, setHeight, setTextRenderQuality, setRenderQuality,
   * setDoShapeAntialiasingDynamic). Both stores share the one `xorps`-
   * folded zero register; disasm writes +0x188 BEFORE +0x198 — preserved.
   *
   * DEPENDENCIES: zero in-scope, zero externs, no indirect calls — pure
   * field writes.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZN14OZRenderParams26setDoHighQualityResamplingEb.s
   *   (11 lines)
   */
  setDoHighQualityResampling(doHQ: boolean): void {
    // @0x271824  movb %sil,0x1e0(%rdi)
    //   C++ `bool` → 1 byte: true == 0x01, false == 0x00.
    this.doHighQualityResamplingAt1e0 = doHQ ? 1 : 0;

    // @0x27182b  movb %sil,0x1e1(%rdi)
    //   SAME source byte (%sil), adjacent destination — the dynamic slot
    //   is refreshed with the same value as the static slot.
    this.doHighQualityResamplingDynamicAt1e1 = doHQ ? 1 : 0;

    // @0x271832  xorps  %xmm0,%xmm0            ; xmm0 = 0 (16 zero bytes)
    // @0x271835  movups %xmm0,0x188(%rdi)      ; this[+0x188] = (0, 0)
    // @0x27183c  movups %xmm0,0x198(%rdi)      ; this[+0x198] = (0, 0)
    //
    // Invalidate the two PCVector2<double>-shaped caches. Disasm writes
    // +0x188 before +0x198; preserved here.
    this.zeroedAt188 = { x: 0, y: 0 };
    this.zeroedAt198 = { x: 0, y: 0 };

    // @0x271843-0x271844 — epilogue + retq.
  }

  /**
   * `OZRenderParams::setDo3DIntersectionAntialiasingDynamic(bool)`
   *   — @Ozone 0x271930
   *   — __ZN14OZRenderParams38setDo3DIntersectionAntialiasingDynamicEb
   *
   * Faithful line-for-line transcription of the 10-line disassembly:
   *   0x271930  pushq  %rbp                     ; frame prologue
   *   0x271931  movq   %rsp, %rbp
   *   0x271934  movb   %sil, 0x1e5(%rdi)         ; this->+0x1e5 = arg (bool, 1 byte)
   *   0x27193b  xorps  %xmm0, %xmm0              ; xmm0 = 0 (16 zero bytes)
   *   0x27193e  movups %xmm0, 0x188(%rdi)        ; this[+0x188] = (0, 0)
   *   0x271945  movups %xmm0, 0x198(%rdi)        ; this[+0x198] = (0, 0)
   *   0x27194c  popq   %rbp                     ; frame epilogue
   *   0x27194d  retq
   *   0x27194e  nop
   *
   * SEMANTICS:
   *   Two-part update:
   *     1. Writes the incoming C++ `bool` argument (SysV/AAPCS puts scalar
   *        arg2 in `%rsi`; `bool` occupies the low byte `%sil`) into the
   *        class slot at +0x1e5.
   *     2. Zeroes BOTH paired PCVector2<double> slots at +0x188 and +0x198
   *        (32 bytes total, via two `movups` from a common xored xmm0).
   *
   *   The +0x188 / +0x198 pair is the SAME pair that `setResolution` and
   *   `setResolutionDynamic` (when mode==1) zero. So flipping the
   *   "do 3D-intersection antialiasing dynamically" flag invalidates the
   *   downstream derived-resolution cache — the class will re-derive
   *   those slots the next time a resolution setter runs. This is a
   *   cache-invalidation pattern: setting the flag forces recomputation
   *   of whatever depends on it.
   *
   * DEPENDENCIES: zero in-scope, zero externs. Pure field writes.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZN14OZRenderParams38setDo3DIntersectionAntialiasingDynamicEb.s (10 lines)
   */
  setDo3DIntersectionAntialiasingDynamic(doDynamic: boolean): void {
    // @0x271934  movb %sil,0x1e5(%rdi)
    //   C++ `bool` → 1 byte: true == 0x01, false == 0x00.
    this.do3DIntersectionAntialiasingDynamicAt1e5 = doDynamic ? 1 : 0;

    // @0x27193b  xorps %xmm0,%xmm0             ; xmm0 = 0
    // @0x27193e  movups %xmm0,0x188(%rdi)      ; this[+0x188] = (0, 0)
    // @0x271945  movups %xmm0,0x198(%rdi)      ; this[+0x198] = (0, 0)
    //
    // Note on write order: the disasm writes +0x188 BEFORE +0x198,
    // which is the REVERSE of setResolution's write order but matches
    // setResolutionDynamic's order. Same zero value going to both, so
    // the observable state is identical either way; we mirror the
    // disasm order here.
    this.zeroedAt188 = { x: 0, y: 0 };
    this.zeroedAt198 = { x: 0, y: 0 };
  }

  /**
   * `OZRenderParams::setDo3DIntersectionAntialiasing(bool)`
   *   — @Ozone 0x271900
   *   — __ZN14OZRenderParams31setDo3DIntersectionAntialiasingEb
   *
   * Faithful line-for-line transcription of the 10-line disassembly at
   * raw-port/re/disasm/__ZN14OZRenderParams31setDo3DIntersectionAntialiasingEb.s:
   *
   *   0x271900  pushq  %rbp
   *   0x271901  movq   %rsp, %rbp
   *   0x271904  movb   %sil, 0x1e4(%rdi)          ; this->+0x1e4 = arg
   *   0x27190b  movb   %sil, 0x1e5(%rdi)          ; this->+0x1e5 = arg
   *   0x271912  xorps  %xmm0, %xmm0               ; xmm0 = 0 (16 bytes)
   *   0x271915  movups %xmm0, 0x188(%rdi)         ; this->+0x188 = (0, 0)
   *   0x27191c  movups %xmm0, 0x198(%rdi)         ; this->+0x198 = (0, 0)
   *   0x271923  popq   %rbp
   *   0x271924  retq
   *
   * Same shape as `setDoHighQualityResampling` @0x271820 — the class
   * caches BOTH boolean policy flags in mirrored byte pairs and both
   * setters invalidate the SAME derived-caching slots at +0x188 / +0x198
   * on write. Whatever those two 16-byte slots hold (some cached
   * resolution/subregion pair likely) it is a function of at least
   *   { resolution, HQR-flag, 3D-AA-flag }
   * so each policy change resets them.
   *
   * ABI: SysV x86_64. The `bool` arg is in `%sil` (low byte of `%rsi`).
   * We mask to the low 8 bits so the modelled write matches the machine's
   * `movb` truncation for any input width.
   *
   * Zero in-scope callees, no imports needed.
   */
  setDo3DIntersectionAntialiasing(doAntialiasing: boolean | number): void {
    // Faithful `movb %sil` model: capture only the low 8 bits of the
    // argument. C++ bool is stored as byte 0/1; a rogue caller passing
    // any wider int gets truncated by the machine's `movb`.
    const sil =
      typeof doAntialiasing === "boolean"
        ? (doAntialiasing ? 1 : 0)
        : (doAntialiasing & 0xff);

    // @0x271904  movb %sil, 0x1e4(%rdi)
    this.do3DIntersectionAntialiasingAt1e4 = sil;
    // @0x27190b  movb %sil, 0x1e5(%rdi)
    this.do3DIntersectionAntialiasingMirrorAt1e5 = sil;

    // @0x271912  xorps %xmm0, %xmm0            ; xmm0 = 0
    // @0x271915  movups %xmm0, 0x188(%rdi)     ; this->+0x188 = (0, 0)
    // Order matches setDoHighQualityResampling (which shares this
    // invalidation pair): +0x188 BEFORE +0x198.
    this.zeroedAt188 = { x: 0, y: 0 };
    // @0x27191c  movups %xmm0, 0x198(%rdi)     ; this->+0x198 = (0, 0)
    this.zeroedAt198 = { x: 0, y: 0 };

    // @0x271923-0x271924 — epilogue + retq.
  }

  /**
   * `OZRenderParams::getDestinationDevice() const`
   *   — @Ozone 0x2719d0
   *   — __ZNK14OZRenderParams20getDestinationDeviceEv
   *
   * Faithful line-for-line transcription of the 7-line disassembly:
   *   0x2719d0  pushq  %rbp                        ; frame prologue
   *   0x2719d1  movq   %rsp, %rbp
   *   0x2719d4  leaq   0x120(%rdi), %rax            ; rax = &this[+0x120] (address of the
   *                                                ;   embedded destination-device sub-object)
   *   0x2719db  popq   %rbp                        ; frame epilogue
   *   0x2719dc  retq                              ; return rax
   *   0x2719dd  nopl   (%rax)                       ; alignment padding (not executed)
   *
   * SEMANTICS:
   *   Returns a POINTER to the destination-device sub-object embedded inline
   *   at this+0x120. The `leaq` (load-effective-address, NOT a load) proves
   *   the device is stored inline in OZRenderParams — the method hands back
   *   its address, not a dereferenced value and not a heap pointer read from
   *   the field. Callers get a mutable reference into `this`.
   *
   *   In TS this is modeled by returning the SAME `destinationDeviceAt120`
   *   object identity (a reference to the embedded field), which reproduces
   *   the `&this[+0x120]` semantics — mutations through the returned reference
   *   are visible on `this`, exactly as a pointer into the object would be.
   *   No copy is made (a `leaq` copies no data).
   *
   * Zero in-scope callees, zero externs, no indirect calls — pure address-of
   * a field.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZNK14OZRenderParams20getDestinationDeviceEv.s (7 lines)
   */
  getDestinationDevice(this: OZRenderParams): object {
    // @0x2719d4  leaq 0x120(%rdi),%rax ; @0x2719dc retq
    //   Return the ADDRESS of the embedded device sub-object — i.e. a
    //   reference to this.destinationDeviceAt120 (no dereference, no copy).
    return this.destinationDeviceAt120;
  }

  /**
   * `OZRenderParams::getRenderBounds() const` @Ozone 0x270aa0
   * (__ZNK14OZRenderParams15getRenderBoundsEv).
   *
   * Returns the render rectangle as a by-value struct: an origin
   * `(x, y)` at ret+0x00 and a size `(width, height)` at ret+0x10 (32-byte
   * sret; the C++ ABI passes the return slot in %rdi and `this` in %rsi).
   *
   * If an EXPLICIT render bounds has been set (its width lane at this+0x258
   * is > 0), the getter copies the stored origin (+0x248) and size (+0x258)
   * verbatim. Otherwise (width <= 0, i.e. "unset") it synthesises bounds at
   * origin (0,0) with size taken from the integer width/height fields
   * (+0x144 / +0x148), converting the two uint32s to doubles via the classic
   * 2^52-bias trick (`pmovzxdq` zero-extend, `por` the bias, `subpd` it back).
   *
   * Faithful transcription of the 23-line disasm:
   *   0x270aa4  movq %rdi,%rax                 ; rax = &ret (sret)
   *   0x270aa7  xorpd %xmm0,%xmm0              ; xmm0 = 0.0
   *   0x270aab  ucomisd 0x258(%rsi),%xmm0      ; sub: 0.0 - this[0x258] (width)
   *   0x270ab3  jae 0x270acc                    ; CF=0 => 0.0 >= width => width<=0 => FALLBACK
   *   -- explicit-bounds branch (width > 0): --
   *   0x270ab5  movups 0x248(%rsi),%xmm0       ; xmm0 = origin (x,y)
   *   0x270abc  movups 0x258(%rsi),%xmm1       ; xmm1 = size (w,h)
   *   0x270ac3  movups %xmm1,0x10(%rax)        ; ret.size = size
   *   0x270ac7  movups %xmm0,(%rax)            ; ret.origin = origin
   *   0x270aca  retq
   *   -- fallback branch (width <= 0) @0x270acc: --
   *   0x270acc  xorpd %xmm0,%xmm0             ; xmm0 = 0
   *   0x270ad0  movupd %xmm0,(%rax)           ; ret.origin = (0,0)
   *   0x270ad4  pmovzxdq 0x144(%rsi),%xmm0    ; xmm0 = zext(uint32 w@0x144, uint32 h@0x148)
   *   0x270add  movdqa 0x7076e0(%rip),%xmm1   ; xmm1 = {2^52, 2^52} (0x4330000000000000 x2)
   *   0x270ae5  por %xmm1,%xmm0              ; OR the 2^52 bias into each lane
   *   0x270ae9  subpd %xmm1,%xmm0           ; subtract 2^52 -> exact uint32 as double
   *   0x270aed  movupd %xmm0,0x10(%rax)     ; ret.size = ((double)w,(double)h)
   *   0x270af2  retq
   *
   * The 2^52 constant at 0x7076e0 was read from Ozone's __TEXT,__const:
   *   00 00 00 00 00 00 30 43  (x2) = double 0x4330000000000000 = 4503599627370496.0.
   *
   * Zero in-scope callees, zero externs, no indirect calls — pure field
   * copy / integer-to-double conversion.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZNK14OZRenderParams15getRenderBoundsEv.s (23 lines)
   */
  getRenderBounds(this: OZRenderParams): OZRenderBounds {
    // @0x270aa7 xorpd %xmm0,%xmm0 ; @0x270aab ucomisd 0x258(%rsi),%xmm0
    //   compares 0.0 - this.renderBoundsSize.x (the width lane).
    // @0x270ab3 jae 0x270acc : CF=0 => 0.0 >= width => width <= 0 => FALLBACK.
    //   NOT taken (width > 0) => copy the explicit stored bounds.
    if (this.renderBoundsSizeAt258.x > 0) {
      // explicit-bounds branch @0x270ab5:
      // @0x270ab5 movups 0x248 -> origin ; @0x270abc movups 0x258 -> size
      // @0x270ac3 store size@ret+0x10 ; @0x270ac7 store origin@ret+0x00
      return {
        origin: {
          x: this.renderBoundsOriginAt248.x,
          y: this.renderBoundsOriginAt248.y,
        },
        size: {
          x: this.renderBoundsSizeAt258.x,
          y: this.renderBoundsSizeAt258.y,
        },
      };
    }

    // fallback branch @0x270acc (width <= 0): origin = (0,0), size from int w/h.
    // @0x270ad4 pmovzxdq 0x144(%rsi) : zero-extend uint32 width(+0x144),
    //   height(+0x148) to two 64-bit lanes; @0x270add/@0x270ae5/@0x270ae9
    //   OR the 2^52 bias then subtract it -> the exact unsigned values as
    //   doubles. widthAt144/heightAt148 are the same int32 slots (unsigned
    //   reinterpretation via >>> 0 to match the zero-extending pmovzxdq).
    const w = this.widthAt144 >>> 0;
    const h = this.heightAt148 >>> 0;
    return {
      // @0x270ad0 movupd %xmm0(=0),(%rax) : ret.origin = (0,0).
      origin: { x: 0, y: 0 },
      // @0x270aed movupd %xmm0,0x10(%rax) : ret.size = ((double)w,(double)h).
      size: { x: w, y: h },
    };
  }

  /**
   * OZRenderParams::getRenderQuality() const  @Ozone 0x270780
   *   __ZNK14OZRenderParams16getRenderQualityEv
   *
   *   0x270780  pushq  %rbp
   *   0x270781  movq   %rsp, %rbp
   *   0x270784  movzbl 0x1a8(%rdi), %eax                 ; eax = (u8) this->+0x1a8 (mode-byte index)
   *   0x27078b  movl   0x1d0(%rdi,%rax,4), %eax          ; eax = (u32) this->[0x1d0 + idx*4]
   *   0x270792  popq   %rbp
   *   0x270793  retq
   *   0x270794  nopw   %cs:(%rax,%rax)                    ; padding
   *
   * SEMANTICS: the render-quality slots at +0x1d0 form a small u32 array
   * indexed by the one-byte mode discriminator at +0x1a8 (the same latch
   * `setResolutionDynamic` gates on @0x27173e and that `getDoShapeAntialiasing`
   * @0x2718eb indexes with — a 0/1 "static vs dynamic" selector). idx*4:
   *   idx 0 -> +0x1d0  (renderQualityAt1d0, the static/author quality)
   *   idx 1 -> +0x1d4  (renderQualityDynamicAt1d4, the applied/dynamic quality)
   * `setRenderQuality(OZQuality)` @0x271774 writes BOTH slots, confirming
   * the pair. The result is zero-extended from a 32-bit load (u32).
   *
   * ZERO in-scope callees, ZERO externs. Pure indexed field read.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZNK14OZRenderParams16getRenderQualityEv.s (8 lines)
   */
  getRenderQuality(this: OZRenderParams): number {
    // @0x270784  movzbl 0x1a8(%rdi),%eax
    //   Zero-extended byte load of the mode-byte -> array index.
    const idx = this.flagByteAt1a8 & 0xff;
    // @0x27078b  movl 0x1d0(%rdi,%rax,4),%eax
    //   Indexed u32 load from the quality array based at +0x1d0. The two
    //   modelled slots are +0x1d0 (idx 0) and +0x1d4 (idx 1); reproduce
    //   the machine's `base + idx*4` selection over them.
    const quality = idx === 0 ? this.renderQualityAt1d0 : this.renderQualityDynamicAt1d4;
    // Result is a zero-extended 32-bit value (movzbl index; movl u32 result).
    return quality >>> 0;
  }
}
