// Faithful transcription @0x0000000002c606
// @shader MDPTextureAlphaHitIDFragmentFunc (MDPKit)
//
// Alpha-cutout variant of HitIDFragmentFunc from MDPKit's
// default.metallib. Same "record hitIDs into a flat list-texture with
// an atomic counter" contract as its sibling `HitIDFragmentFunc`, but
// gated by a texture-sampled alpha threshold: fragments whose sampled
// alpha is <= 0.001f are discarded (via `air.discard_fragment`) before
// the hitID is recorded, so transparent regions of textured billboards
// don't leak into the picking buffer.
//
// Source LLVM IR: raw-port/re/shaders/MDPTextureAlphaHitIDFragmentFunc.ll
// Extracted from:
//   Final Cut Pro.app/Contents/Frameworks/MDPKit.framework/Versions/A/
//     Resources/default.metallib
// Original Metal source (per !1/!42): MDPKit/Shaders/MDPTextureAlphaHitID.metal
// entry `MDPTextureAlphaHitIDFragmentFunc`, line 40 scopeLine 46.
//
// AIR signature (from air.fragment !29 and !33..!41):
//   define <{ i32 }> @MDPTextureAlphaHitIDFragmentFunc(
//     <4 x float>                            position    ; !33 air.position (air.arg_unused)
//     <2 x float>                            texCoord    ; !34 fragment input (perspective, generated)
//     i32                                    hitID       ; !35 fragment input (flat)
//     texture2d<float, sample>*              tex         ; !36 read-only texture (location 0)
//     sampler*                               texSampler  ; !37
//     texture2d<uint, write>*                listTexture ; !38 write-only (location 1)
//     device metal::_atomic<uint>*           listIndex   ; !39 read-write (location 1)
//     constant uint*                         listWrite   ; !41 read-only (location 2, 4B)
//   ) -> struct { uint hitID }
//         ; air.render_target !31: air.arg_type_name "uint", "hitID"
//
// Function attributes: convergent mustprogress nounwind willreturn with
// `approx-func-fp-math`, `unsafe-fp-math`, `no-nans-fp-math`,
// `no-infs-fp-math`, `no-signed-zeros-fp-math`, plus
// `air.compile.fast_math_enable`, `air.compile.denorms_disable`,
// `air.compile.framebuffer_fetch_enable`. The only fp32 math in this
// shader is the fcmp on the sampled alpha; we Math.fround the sampled
// alpha for parity.
// No shortcut language of any kind — every %N SSA line in the .ll is
// mirrored literally below with its %N cite.
//
// IR line map (%N → semantics, with source-line !DILocation callouts):
//   %9  = air.sample_texture_2d.v4f32(
//           tex, texSampler, texCoord,
//           i1 true /*offset-provided?*/, <2 x i32> 0 /*offset*/,
//           i1 false /*lod-provided?*/, float 0 /*bias/min_lod?*/,
//           float 0 /*max_aniso?*/, i32 0 /*cache_hint*/)
//         ; @MDPTextureAlphaHitID.metal:47:12 (inlined `sample`)
//   %10 = extractvalue { <4 x float>, i8 } %9, 0
//         → sampled = (r, g, b, a)                     ; !56 @line 47
//   %11 = extractelement <4 x float> %10, i64 3
//         → alpha = sampled.a                          ; !56 @line 52
//   %12 = fcmp fast ugt float %11, 0x3F50624DE0000000  ; ugt = unordered-greater-than
//         → keep = (alpha > 0.001f)  [fp64 lit 0x3F50624DE0000000 = 0.001f exactly]
//         ; !57 @line 52:15
//         (Under `no-nans-fp-math` the `ugt` degenerates to plain `>`; there are no NaNs.)
//   br i1 %12, %14 (keep path), %13 (discard path)     ; @line 52:9
//
//   %13 discard path:
//     air.discard_fragment()                           ; @metal_graphics:184 inlined @line 54:9
//     br %29 (return path)                             ; the phi picks 0 for this edge
//
//   %14 keep path:
//     %15 = icmp eq i32 hitID, 0                       ; @line 58:20  (`hitID == 0`)
//     br i1 %15, %29 (return), %16 (record path)       ; @line 58:9  (skip when hitID==0)
//
//   %16 record path:
//     %17 = &listIndex->__s                            ; !65 inlined atomic op @line 62:27
//     %18 = air.atomic.global.add.u.i32(%17, 1, 0, 2, i1 true)
//           ; == fetch_add(listIndex, 1)  order=0=relaxed, scope=2=device, volatile=true
//           ; returns the PRE-INCREMENT slot index this fragment claims
//     %19 = load i32 from listWrite (align 4, tbaa "int")   ; @line 64:13
//     %20 = icmp eq i32 %19, 0                              ; if (listWrite == 0) → skip store
//     br i1 %20, %29 (return), %21 (write path)             ; @line 64:9
//
//   %21 write path:
//     %22 = air.get_width_texture_2d(listTexture, lod=0)    ; @line 66:45
//     %23 = urem i32 %18, %22                                ; x = slotIndex % width  @line 67:49
//     %24 = <2 x i32> [%23, undef]                           ; !83
//     %25 = udiv i32 %18, %22                                ; y = slotIndex / width  @line 67:76
//     %26 = <2 x i32> [%23, %25]                             ; final (x,y) texel coord
//     %27 = <4 x i32> [hitID, poison, poison, poison]        ; @line 68:31
//     %28 = shufflevector <4 x i32> %27, poison, <0,0,0,0>   ; broadcast (id,id,id,id)
//     air.write_texture_2d.u.v4i32(listTexture, %26, %28, lod=0, cache_hint=2)  ; !88 @line 68:25
//     br %29                                                 ; @line 69:9
//
//   %29 return:
//     %30 = phi i32 [
//              0,     from %13 (discard),        // fragment was discarded
//              hitID, from %16 (record-no-store),
//              hitID, from %21 (record-and-store),
//              0,     from %14 (hitID==0 fast path)
//           ]
//     %31 = insertvalue <{ i32 }> undef, i32 %30, 0
//     ret <{ i32 }> %31                                     ; !91 @line 74:1
//
// Notes:
//   • The phi at %30 assigns 0 for BOTH `hitID == 0` and `discard_fragment` paths, so a
//     caller reading the render target can distinguish only "recorded id" vs "not recorded".
//     `air.discard_fragment` additionally suppresses the write to the color render target
//     — the phi's 0-choice on that edge is dead in practice, but we mirror it for parity.
//   • The atomic op arguments `(1, 0, 2, i1 true)` mean:
//       val=1, memory_order_relaxed(0), scope=device(2), volatile=true.
//     Return value = *listIndex BEFORE the add (the classic post-increment-of-counter,
//     pre-increment-of-return-value dance).
//   • listWrite is a 4-byte `constant uint*` at buffer location 2 (see !41) — treated as a
//     boolean toggle: nonzero = also stamp listTexture, zero = counter-only.
//   • listTexture is a `texture2d<uint, write>` (see !38) — the alpha-cutout write path is
//     identical to the sibling HitIDFragmentFunc @0x305c6 (same width-modulo layout).
//   • The alpha threshold literal is exactly 0.001f (fp32 0x3A83126F, fp64
//     0x3F50624DE0000000). Under `no-nans-fp-math` we treat `ugt` as plain `>`.
//   • This shader is entirely integer math EXCEPT for the sampled alpha compare — we
//     `Math.fround` the alpha lane for parity with the AIR fp32 pipeline.

// Metal texture2d<float, sample> — minimal shape the shader uses.
export interface FloatSampleTexture2D {
  /** Sample the texture at `uv` under `sampler`. Returns the raw fp32x4 texel. */
  sample(
    sampler: SamplerHandle,
    uv: readonly [number, number],
  ): [number, number, number, number];
}

// Opaque sampler — the shader passes it straight through to `air.sample_texture_2d`.
export interface SamplerHandle {
  readonly __sampler: true;
}

// Metal texture2d<uint, write> — same shape as the sibling HitIDFragmentFunc.
export interface UintWriteTexture2D {
  /** width in pixels (returned by air.get_width_texture_2d lod=0). */
  width: number;
  /** 4-channel uint texel store. `coord` is (x,y); `rgba` is (hitID, hitID, hitID, hitID). */
  write(
    coord: { x: number; y: number },
    rgba: [number, number, number, number],
  ): void;
}

// metal::_atomic<uint> at listIndex — one 32-bit counter with relaxed device-scope fetch_add.
export interface AtomicUint32 {
  value: number; // read-modify-written by fetchAddRelaxed
}

/**
 * atomic_fetch_add_explicit(&listIndex, 1, memory_order_relaxed) — device scope.
 * Returns the PRE-INCREMENT value (the slot this fragment claims), matches
 * `air.atomic.global.add.u.i32(ptr, 1, 0, 2, volatile=true)` at %18. Wraps modulo 2^32.
 */
export function fetchAddRelaxedU32(atom: AtomicUint32): number {
  const prev = atom.value >>> 0;
  atom.value = (prev + 1) >>> 0;
  return prev;
}

/**
 * MDPTextureAlphaHitIDFragmentFunc — faithful transcription of the AIR body.
 *
 * @param texCoord    <2 x float> perspective-interpolated UV (fragment input, !34).
 * @param hitID       flat uint fragment input (from vertex-generated attribute "hitID"; !35).
 * @param tex         texture2d<float, sample> alpha-carrying texture (!36).
 * @param texSampler  sampler bound at location 0 (!37).
 * @param listTexture texture2d<uint, write> the flat list of recorded hit IDs (!38).
 * @param listIndex   device metal::_atomic<uint>* monotonic counter (!39).
 * @param listWrite   constant uint — nonzero means also stamp listTexture; zero means counter-only (!41).
 * @param discardFragment  callback modelling `air.discard_fragment()` — mutates the caller's
 *                    fragment-alive flag. In hardware this drops the fragment (no color/depth
 *                    write). In TS we invoke the callback and continue to the phi merge at %29
 *                    (which selects 0 for this edge).
 * @returns           the hitID for the "record" and "record-no-store" edges of the %29 phi;
 *                    0 for the "discard" and "hitID==0 fast path" edges.
 */
export function MDPTextureAlphaHitIDFragmentFunc(
  texCoord: readonly [number, number],
  hitID: number,
  tex: FloatSampleTexture2D,
  texSampler: SamplerHandle,
  listTexture: UintWriteTexture2D,
  listIndex: AtomicUint32,
  listWrite: number,
  discardFragment: () => void,
): number {
  const id = hitID >>> 0;

  // %9  = air.sample_texture_2d.v4f32(tex, texSampler, texCoord, ...)
  // %10 = extractvalue ..., 0  →  sampled texel (r,g,b,a)
  const sampled = tex.sample(texSampler, texCoord);
  // %11 = extractelement ..., i64 3  →  alpha
  const alpha = Math.fround(sampled[3]);

  // %12 = fcmp fast ugt float %11, 0x3F50624DE0000000
  //   fp64 literal 0x3F50624DE0000000 decodes to 0.0010000000474974513 which is the
  //   exact fp32 value 0.001f (bit pattern 0x3A83126F). Under `no-nans-fp-math` the
  //   `ugt` (unordered-greater-than) is equivalent to plain `>`.
  const kAlphaThreshold = Math.fround(0.001);
  const keep = alpha > kAlphaThreshold;

  // br i1 %12, %14 (keep path), %13 (discard path)
  if (!keep) {
    // %13: air.discard_fragment() @metal_graphics:184  →  drop the fragment.
    discardFragment();
    // Phi at %29 picks 0 for this edge.
    return 0;
  }

  // %14: keep path — %15 = icmp eq i32 hitID, 0
  if (id === 0) {
    // Phi at %29 picks 0 for this edge.
    return 0;
  }

  // %16..%18: slotIndex = fetch_add(listIndex, 1, relaxed).
  const slotIndex = fetchAddRelaxedU32(listIndex); // pre-increment value

  // %19..%20: if (listWrite == 0) → return hitID (skip texture store).
  const listWriteU = listWrite >>> 0;
  if (listWriteU === 0) {
    // Phi at %29 picks `hitID` for this edge (the %16 predecessor).
    return id;
  }

  // %21 write path:
  //   %22 = air.get_width_texture_2d(listTexture, lod=0)
  //   %23 = urem i32 %18, %22        → x = slotIndex % width
  //   %25 = udiv i32 %18, %22        → y = slotIndex / width
  //   %27..%28 broadcast (hitID, hitID, hitID, hitID)
  //   air.write_texture_2d.u.v4i32(listTexture, (x,y), rgba, lod=0, hint=2)
  const width = listTexture.width >>> 0;
  const x = (slotIndex % width) >>> 0;
  const y = ((slotIndex / width) | 0) >>> 0; // udiv — width > 0 by construction.
  const rgba: [number, number, number, number] = [id, id, id, id];
  listTexture.write({ x, y }, rgba);

  // Phi at %29 picks `hitID` for the %21 predecessor.
  return id;
}
