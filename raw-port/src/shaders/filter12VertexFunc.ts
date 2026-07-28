// filter12VertexFunc.ts — 12-tap 1D-separable filter helper vertex shader.
// @shader filter12VertexFunc (Lithium)
// Source IR: raw-port/re/shaders/filter12VertexFunc.ll
// Compiled from: Lithium.framework/Versions/A/Resources/LiSolidShaders.metallib @0x00000000004c19
//
// LLVM IR signature (from the .ll):
//   define <{ <4 x float>, <2 x float> x 24 }> @filter12VertexFunc(
//       <2 x float> %0 = position     (air.vertex_input, loc 0, "position")   (!43)
//     , <2 x float> %1 = texCoord     (air.vertex_input, loc 1, "texCoord")   (!44)
//     , float4x4    %2 = mvp          (air.buffer,       loc 2, "mvp")        (!45)
//     , <2 x float> %3 = offset       (air.buffer,       loc 3, "offset")     (!46)
//   )
// Vertex outputs (!16):
//   slot 0     : air.position           float4 "position"
//   slots 1-12 : air.vertex_output      float2 "left00".."left11"    (texCoord - k*offset)
//   slots 13-24: air.vertex_output      float2 "right00".."right11"  (texCoord + k*offset)
//   for k in [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5].
//
// FAST-MATH: attribute #0 sets unsafe-fp-math + no-infs/no-nans/no-signed-zeros
// + approx-func-fp-math + fast_math_enable. All fp32 ops use plain JS float math via Math.fround.
//
// Algorithm (faithful trace of %5..%53, %54..%78 assemble the return struct):
//   Clip-space position: mvp*(position.x, position.y, 0, 1) — only cols 0, 1, and 3 are read,
//   so the shader hard-codes z=0 and w=1 by skipping col2 and adding col3 outright.
//     %6  = mvp.col0                   (col2 is NEVER loaded — z-contribution is zero.)
//     %8  = mvp.col0 * broadcast(x)
//     %10 = mvp.col1
//     %12 = mvp.col1 * broadcast(y)
//     %13 = %8 + %12
//     %15 = mvp.col3
//     %16 = %13 + %15               <- final clip-space position
//   Tap offsets (12 pairs of (left, right) for a symmetric 12-tap 1D convolution):
//     %17 = offset (float2 loaded once)
//     for each k in [0.5, 1.5, ..., 11.5]:
//         scaled  = offset * k
//         leftK   = texCoord - scaled
//         rightK  = scaled + texCoord     (== texCoord + scaled)
//   Return: {position, left00..left11, right00..right11}.

/**
 * Return type mirroring the AIR vertex_output struct (!16).
 *
 * The 24 tap outputs correspond to a symmetric 12-tap 1D filter kernel centered on the vertex's
 * texCoord: left00..left11 samples the negative direction, right00..right11 the positive one.
 * The kernel step is the caller-provided `offset` vector — typically (1/W, 0) for a horizontal
 * pass or (0, 1/H) for a vertical pass, but the shader itself is agnostic.
 */
export interface Filter12VertexFuncOutput {
  position: [number, number, number, number]; // slot 0     — air.position (clip-space, w=1)
  left00: [number, number];                    // slot 1
  left01: [number, number];                    // slot 2
  left02: [number, number];                    // slot 3
  left03: [number, number];                    // slot 4
  left04: [number, number];                    // slot 5
  left05: [number, number];                    // slot 6
  left06: [number, number];                    // slot 7
  left07: [number, number];                    // slot 8
  left08: [number, number];                    // slot 9
  left09: [number, number];                    // slot 10
  left10: [number, number];                    // slot 11
  left11: [number, number];                    // slot 12
  right00: [number, number];                   // slot 13
  right01: [number, number];                   // slot 14
  right02: [number, number];                   // slot 15
  right03: [number, number];                   // slot 16
  right04: [number, number];                   // slot 17
  right05: [number, number];                   // slot 18
  right06: [number, number];                   // slot 19
  right07: [number, number];                   // slot 20
  right08: [number, number];                   // slot 21
  right09: [number, number];                   // slot 22
  right10: [number, number];                   // slot 23
  right11: [number, number];                   // slot 24
}

/**
 * @shader filter12VertexFunc (Lithium) — faithful port of the AIR IR.
 *
 * @param position 2D per-vertex position (%0).
 * @param texCoord 2D per-vertex texture coordinate (%1).
 * @param mvp      Column-major 4x4 model-view-projection matrix (%2, "mvp"). Column K occupies
 *                 mvp[K*4 .. K*4+3]. Only cols 0, 1, and 3 are read — col2 is never loaded.
 * @param offset   float2 kernel step (%3). The k-th tap uses `offset * (k + 0.5)`.
 */
export function filter12VertexFunc(
  position: [number, number],
  texCoord: [number, number],
  mvp: Float32Array,
  offset: [number, number],
): Filter12VertexFuncOutput {
  // ---- Clip-space position: mvp * (x, y, 0, 1), computed as col0*x + col1*y + col3. ----
  // %5/%6:  col0 = mvp.columns[0]
  const c0x = mvp[0], c0y = mvp[1], c0z = mvp[2], c0w = mvp[3]; // %6
  // %7:     shufflevector <x,y>, undef, <0,0,0,0>  — broadcast x to all 4 lanes.
  // %8:     col0 * broadcast(x)
  const bx = position[0]; // broadcast(x)
  const s0x = Math.fround(c0x * bx);
  const s0y = Math.fround(c0y * bx);
  const s0z = Math.fround(c0z * bx);
  const s0w = Math.fround(c0w * bx);

  // %9/%10: col1 = mvp.columns[1]
  const c1x = mvp[4], c1y = mvp[5], c1z = mvp[6], c1w = mvp[7]; // %10
  // %11:    shufflevector <x,y>, undef, <1,1,1,1>  — broadcast y to all 4 lanes.
  // %12:    col1 * broadcast(y)
  const by = position[1]; // broadcast(y)
  const s1x = Math.fround(c1x * by);
  const s1y = Math.fround(c1y * by);
  const s1z = Math.fround(c1z * by);
  const s1w = Math.fround(c1w * by);

  // %13:    col0*x + col1*y
  const t13x = Math.fround(s1x + s0x);
  const t13y = Math.fround(s1y + s0y);
  const t13z = Math.fround(s1z + s0z);
  const t13w = Math.fround(s1w + s0w);

  // %14/%15: col3 = mvp.columns[3]  (col2 intentionally skipped — implicit z=0.)
  const c3x = mvp[12], c3y = mvp[13], c3z = mvp[14], c3w = mvp[15]; // %15
  // %16:    %13 + col3  — final clip-space position.
  const posX = Math.fround(t13x + c3x);
  const posY = Math.fround(t13y + c3y);
  const posZ = Math.fround(t13z + c3z);
  const posW = Math.fround(t13w + c3w);

  // ---- 12 filter taps: (texCoord - k*offset, texCoord + k*offset) for k in [0.5..11.5]. ----
  // %17: offset (float2) loaded once from the buffer.
  const ox = offset[0]; // %17.x
  const oy = offset[1]; // %17.y
  const tx = texCoord[0];
  const ty = texCoord[1];

  // Helper: build one tap pair. The IR uses `<k, k>` splat vectors for k = 0.5, 1.5, ..., 11.5.
  //   %(3k+18) = offset * <k, k>
  //   %(3k+19) = texCoord - (offset * k)   -> leftKK
  //   %(3k+20) = (offset * k) + texCoord   -> rightKK  (both operands flipped in IR;
  //                                                     order swap is a no-op for fadd).
  function tap(k: number): { left: [number, number]; right: [number, number] } {
    const sx = Math.fround(ox * k);
    const sy = Math.fround(oy * k);
    return {
      left:  [Math.fround(tx - sx), Math.fround(ty - sy)],
      right: [Math.fround(sx + tx), Math.fround(sy + ty)],
    };
  }

  const t0 = tap(0.5);   // %18/%19/%20
  const t1 = tap(1.5);   // %21/%22/%23
  const t2 = tap(2.5);   // %24/%25/%26
  const t3 = tap(3.5);   // %27/%28/%29
  const t4 = tap(4.5);   // %30/%31/%32
  const t5 = tap(5.5);   // %33/%34/%35
  const t6 = tap(6.5);   // %36/%37/%38
  const t7 = tap(7.5);   // %39/%40/%41
  const t8 = tap(8.5);   // %42/%43/%44
  const t9 = tap(9.5);   // %45/%46/%47
  const t10 = tap(10.5); // %48/%49/%50
  const t11 = tap(11.5); // %51/%52/%53

  // ---- Assemble the output struct: position, then left00..left11, then right00..right11. ----
  // %54..%78 are 25 chained insertvalues into the return struct; the final return is %78.
  return {
    position: [posX, posY, posZ, posW], // slot 0  (%54)

    left00: t0.left,   // slot 1  (%55, <2 x float> %19)
    left01: t1.left,   // slot 2  (%56, %22)
    left02: t2.left,   // slot 3  (%57, %25)
    left03: t3.left,   // slot 4  (%58, %28)
    left04: t4.left,   // slot 5  (%59, %31)
    left05: t5.left,   // slot 6  (%60, %34)
    left06: t6.left,   // slot 7  (%61, %37)
    left07: t7.left,   // slot 8  (%62, %40)
    left08: t8.left,   // slot 9  (%63, %43)
    left09: t9.left,   // slot 10 (%64, %46)
    left10: t10.left,  // slot 11 (%65, %49)
    left11: t11.left,  // slot 12 (%66, %52)

    right00: t0.right,  // slot 13 (%67, %20)
    right01: t1.right,  // slot 14 (%68, %23)
    right02: t2.right,  // slot 15 (%69, %26)
    right03: t3.right,  // slot 16 (%70, %29)
    right04: t4.right,  // slot 17 (%71, %32)
    right05: t5.right,  // slot 18 (%72, %35)
    right06: t6.right,  // slot 19 (%73, %38)
    right07: t7.right,  // slot 20 (%74, %41)
    right08: t8.right,  // slot 21 (%75, %44)
    right09: t9.right,  // slot 22 (%76, %47)
    right10: t10.right, // slot 23 (%77, %50)
    right11: t11.right, // slot 24 (%78, %53)
  };
}
