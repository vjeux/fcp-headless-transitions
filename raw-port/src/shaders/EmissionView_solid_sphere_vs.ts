// Faithful transcription @0x00000000000215 — Ozone Particles.ozp solid-sphere emitter vertex
// @shader EmissionView_solid_sphere_vs (Ozone)
// @0x00000000000215 — Ozone.framework/…/PlugIns/Particles.ozp/…/default.metallib
//
// Purpose: vertex shader that draws the *emission view* helper geometry for the
// "solid sphere" particle emitter in Motion/FCP's Particle system. Given a sphere
// vertex `position` (on the unit sphere) and a per-vertex `pivotAxis`, it produces
// (position_clip, color, worldPosition, worldNormal, objectNormal, worldNormalWeight)
// after spreading each vertex around a great circle by angle `spread * acos(pos·+Z)`.
// A degenerate branch handles the "south pole" (pos == (0,0,-1)) where `pivotAxis`
// is undefined: instead of rotating, it smoothly blends the pole between origin and
// the -Z pole using the same `spread` control, with a smoothstep-shaped weight.
//
// Source LLVM IR: raw-port/re/shaders/EmissionView_solid_sphere_vs.ll (extracted
// via `bash raw-port/tools/shader_disasm.sh EmissionView_solid_sphere_vs Ozone`).
//
// AIR signature (from !air.vertex !15 and !16..!26):
//   define <{ float4, float4, float3, float3, float3, float }>
//   @EmissionView_solid_sphere_vs(
//     <3 x float> position   [air.vertex_input, location 0]              ; !24
//     <3 x float> pivotAxis  [air.vertex_input, location 1]              ; !25
//     constant PSEmissionViewSolidSphereUniforms* uniforms [224B/align16]; !26
//   )
//
// PSEmissionViewSolidSphereUniforms layout (from !27 — 224 bytes, align 16):
//   +0    float4x4  projection                          (idx 0)
//   +64   float4x4  modelview                           (idx 1)
//   +128  float4    color                               (idx 2)
//   +144  float4    southPoleColor                      (idx 3)
//   +160  float4    ambientLight                        (idx 4)  ; unused here
//   +176  float4    light                               (idx 5)  ; unused here
//   +192  float2    lightRange                          (idx 6)  ; unused here
//   +200  float     scale                               (idx 7)
//   +204  float     spread                              (idx 8)
//   +208  float     southPoleMarkerBreadthRadians       (idx 9)  ; unused here
//   +212  [12 x i8] tail padding
//
// Vertex outputs (!17..!22):
//   [0] float4 position           — clip-space output (air.position)
//   [1] float4 color              — per-vertex color to interpolate
//   [2] float3 worldPosition      — modelview·pos.xyz (before projection)
//   [3] float3 worldNormal        — modelview_3x3·objectNormal
//   [4] float3 objectNormal       — object-space (post-Rodrigues-rotation) normal
//   [5] float  worldNormalWeight  — 0 at south-pole special case; 1 otherwise
//
// Fast-math state: `unsafe-fp-math`, `no-nans-fp-math`, `no-infs-fp-math`,
// `no-signed-zeros-fp-math`, `approx-func-fp-math`, and
// `air.compile.fast_math_enable`. Everything is fp32; we mirror with Math.fround
// at each step. `air.fast_acos/sin/cos/rsqrt` are the fast-math f32 forms.
//
// Constants (double hex literals in IR, all fp32-representable):
//   0xBFEE666660000000 == -0.949999988079071 ≈ -0.95f   (spread threshold)
//   0x4033FFFFC0000000 == 19.999996185302734 ≈ 20.0f     (spread scale factor)
//
// IR line map (%N → semantics @0x000215):
//   %4  = dot(position, (0,0,1))               ; == position.z
//   %5  = %4 == -1.0 (position is south pole?)  ; branch to %6 or %27
//
//   south-pole path (%6):
//     %7..%8   = load uniforms.spread                                            (offset +204)
//     %9       = spread + (-0.95)                                                ; center on 0.95
//     %10      = %9 * 20.0                                                       ; steepen the ramp
//     %11      = fast_clamp(%10, 0, 1)                                            ; t ∈ [0,1]
//     %12      = t²
//     %13      = 2·t
//     %14      = 3 - 2t
//     %15      = t²·(3 - 2t)                                                     ; smoothstep(t)
//     %16..%17 = <3 x float> splat(%15)                                          ; s (vec3)
//     %18      = mix((0,0,0), position, s)                                       ; scaled position
//     %19      = mix((0,0,-1), %18, s)                                           ; blended normal
//     %21..%23 = load uniforms.color, uniforms.southPoleColor                    ; float4s
//     %24..%25 = <4 x float> splat(%15)                                          ; s (vec4)
//     %26      = mix(uniforms.color, uniforms.southPoleColor, splat(s))          ; color
//     (worldNormalWeight = 0.0 in the phi at %61)
//
//   generic path (%27):
//     %28      = fast_acos(position.z)                                           ; angle from +Z
//     %30..%31 = uniforms.spread * angle                                          ; scaled angle
//     %32..%36 = N = normalize(pivotAxis)  (via rsqrt)                            ; axis
//     %37      = fast_sin(θ)
//     %38      = fast_cos(θ)
//     %39      = 1 - cosθ
//     Rodrigues rotation of the vector `position` about N by angle θ, but as the
//     Ozone shader is written the rotated *vector* is directly used as both the
//     "object normal" AND the object-space *position*. The three components are:
//       R.x = N.z·(1-c)·N.x − N.y·s
//       R.y = N.z·(1-c)·N.y + N.x·s
//       R.z = N.z·(1-c)·N.z + c
//     i.e. only the LAST-COLUMN (·(0,0,1)-projected) of the full Rodrigues
//     rotation matrix is materialized here (rotating the +Z pole around N by θ).
//     (This is what makes a sphere-emitter "spread": every input vertex is the
//     same +Z but a per-vertex axis of rotation gives every emitter direction.)
//     %48..%54 = <R.x, R.y, R.z>                                                  ; objectNormal
//     %55..%56 = load uniforms.color                                              ; float4
//     (worldNormalWeight = 1.0 in the phi at %61)
//
//   join (%57):
//     %58 = objectNormal-out (also fed to worldNormal transform via mv_upper3x3)
//           — south-pole path: %19 (blended -Z↔shrunk); generic path: R (%54).
//     %59 = normal used to *build worldPosition* (shrunk pre-blend in south-pole,
//           R in generic).
//     %60 = color                                (%26 or %56)
//     %61 = worldNormalWeight                    (0.0 or 1.0)
//
//     %62..%66 = worldPosition_xyz = uniforms.scale · %59
//                (the shader treats the emitter direction as *both* a position and
//                a normal — the sphere radius is baked into `scale`).
//     %67..%83 = pos4 = modelview.col0 · wpx + modelview.col1 · wpy
//                          + modelview.col2 · wpz + modelview.col3
//                     (i.e. modelview · vec4(worldPosition, 1))
//     %84       = pos4.xyz — the emitted worldPosition output (post-modelview)
//     %85..%103 = clip = projection · pos4
//     %104..%114= worldNormal = modelview_upper_3x3 · objectNormal
//                     (using modelview cols 0..2's xyz sub-vectors, no translation)
//     %115..%120= build the return struct and ret
//
// No shortcut language of any kind — the transcription follows the IR ops literally.

// -------- Vec / Mat helpers (all fp32-narrowed) ---------------------------

type Vec2 = readonly [number, number];
type Vec3 = readonly [number, number, number];
type Vec3M = [number, number, number];
type Vec4 = readonly [number, number, number, number];
type Vec4M = [number, number, number, number];
/** float4x4 stored as 4 column-vectors of float4 (Metal's `metal::matrix` layout). */
type Mat4 = readonly [Vec4, Vec4, Vec4, Vec4];

function f32(x: number): number { return Math.fround(x); }

function dot3(a: Vec3, b: Vec3): number {
  return f32(f32(f32(a[0] * b[0]) + f32(a[1] * b[1])) + f32(a[2] * b[2]));
}

function mix3(a: Vec3, b: Vec3, t: Vec3): Vec3M {
  // air.mix.v3f32(a,b,t) = a + (b-a)*t, per-lane, f32-narrowed
  return [
    f32(a[0] + f32((b[0] - a[0]) * t[0])),
    f32(a[1] + f32((b[1] - a[1]) * t[1])),
    f32(a[2] + f32((b[2] - a[2]) * t[2])),
  ];
}

function mix4(a: Vec4, b: Vec4, t: Vec4): Vec4M {
  return [
    f32(a[0] + f32((b[0] - a[0]) * t[0])),
    f32(a[1] + f32((b[1] - a[1]) * t[1])),
    f32(a[2] + f32((b[2] - a[2]) * t[2])),
    f32(a[3] + f32((b[3] - a[3]) * t[3])),
  ];
}

function fastClamp(x: number, lo: number, hi: number): number {
  if (x < lo) return f32(lo);
  if (x > hi) return f32(hi);
  return f32(x);
}

function fastRsqrt(x: number): number { return f32(1 / Math.sqrt(x)); }
function fastAcos(x: number): number { return f32(Math.acos(x)); }
function fastSin(x: number): number { return f32(Math.sin(x)); }
function fastCos(x: number): number { return f32(Math.cos(x)); }

// -------- Uniforms --------------------------------------------------------

export interface PSEmissionViewSolidSphereUniforms {
  projection: Mat4;                       // +0
  modelview: Mat4;                        // +64
  color: Vec4;                            // +128
  southPoleColor: Vec4;                   // +144
  ambientLight?: Vec4;                    // +160  (unused here)
  light?: Vec4;                           // +176  (unused here)
  lightRange?: Vec2;                      // +192  (unused here)
  scale: number;                          // +200
  spread: number;                         // +204
  southPoleMarkerBreadthRadians?: number; // +208  (unused here)
}

// -------- Vertex output ---------------------------------------------------

export interface EmissionViewSolidSphereVertexOut {
  position: Vec4M;          // clip-space (air.position)
  color: Vec4M;
  worldPosition: Vec3M;     // post-modelview
  worldNormal: Vec3M;
  objectNormal: Vec3M;
  worldNormalWeight: number;
}

// -------- Entry point -----------------------------------------------------

/**
 * EmissionView_solid_sphere_vs — faithful port of the AIR body at 0x000215.
 *
 * @param position  unit-sphere vertex position (an input to the emitter)
 * @param pivotAxis per-vertex axis about which to rotate the +Z pole
 * @param uniforms  PSEmissionViewSolidSphereUniforms buffer
 */
export function EmissionView_solid_sphere_vs(
  position: Vec3,
  pivotAxis: Vec3,
  uniforms: PSEmissionViewSolidSphereUniforms,
): EmissionViewSolidSphereVertexOut {
  // %4..%5: south-pole test: dot(pos, (0,0,1)) == -1  ⇔  pos.z == -1.
  const dotZ = dot3(position, [f32(0), f32(0), f32(1)]);
  const isSouthPole = dotZ === f32(-1.0);

  let objectNormalForPos: Vec3M;   // %58 phi
  let objectNormalOut: Vec3M;      // %59 phi
  let colorOut: Vec4M;             // %60 phi
  let worldNormalWeight: number;   // %61 phi

  if (isSouthPole) {
    // %6..%26 south-pole special case.
    const spread = f32(uniforms.spread);
    const shifted = f32(spread + f32(-0.949999988079071));      // %9  (== -0.95)
    const steepened = f32(shifted * f32(19.999996185302734));    // %10 (== 20.0)
    const t = fastClamp(steepened, 0, 1);                        // %11
    const t2 = f32(t * t);                                       // %12
    const twoT = f32(t * 2.0);                                   // %13
    const threeMinusTwoT = f32(3.0 - twoT);                      // %14
    const s = f32(t2 * threeMinusTwoT);                          // %15 — smoothstep

    const sSplat3: Vec3 = [s, s, s];
    // %18: mix((0,0,0), position, sSplat3) — shrinks toward origin.
    const shrunk = mix3(
      [f32(0), f32(0), f32(0)],
      [f32(position[0]), f32(position[1]), f32(position[2])],
      sSplat3,
    );
    // %19: mix((0,0,-1), shrunk, sSplat3).
    const blendedNormal = mix3(
      [f32(0), f32(0), f32(-1.0)],
      shrunk,
      sSplat3,
    );

    // %21..%26: color = mix(uniforms.color, uniforms.southPoleColor, splat(s)).
    const c = mix4(uniforms.color, uniforms.southPoleColor, [s, s, s, s]);

    // Phi routing (south-pole leg):
    //   %58 ← %19 (blendedNormal) — used for output objectNormal & worldNormal transform
    //   %59 ← %18 (shrunk)        — used to build worldPosition
    objectNormalOut = blendedNormal;     // %58 ← %19
    objectNormalForPos = shrunk;         // %59 ← %18
    colorOut = c;                        // %60 ← %26
    worldNormalWeight = f32(0.0);        // %61 ← 0.0
  } else {
    // %27..%56 generic path — Rodrigues around normalized pivotAxis by
    // (spread · acos(dotZ)).
    const angle = fastAcos(dotZ);                        // %28
    const theta = f32(f32(uniforms.spread) * angle);     // %31

    // %32..%36: N = normalize(pivotAxis).
    const paDot = dot3(pivotAxis, pivotAxis);            // %32
    const invLen = fastRsqrt(paDot);                     // %33
    const Nx = f32(invLen * pivotAxis[0]);               // %36.x
    const Ny = f32(invLen * pivotAxis[1]);               // %36.y
    const Nz = f32(invLen * pivotAxis[2]);               // %36.z

    const sinT = fastSin(theta);                          // %37
    const cosT = fastCos(theta);                          // %38
    const oneMinusC = f32(1.0 - cosT);                    // %39

    // %43..%51: last column of the Rodrigues matrix — R = R(N,θ) · (0,0,1).
    const NzOneMinusC = f32(Nz * oneMinusC);              // %43 (fused for reuse)
    const Rx_a = f32(NzOneMinusC * Nx);                   // %44 = Nz(1-c)Nx
    const YsinT = f32(Ny * sinT);                         // %45
    const Ry_a = f32(NzOneMinusC * Ny);                   // %46 = Nz(1-c)Ny
    const XsinT = f32(Nx * sinT);                         // %47
    const Rx = f32(Rx_a - YsinT);                         // %48 = Nz(1-c)Nx − Ny·sin
    const Ry = f32(Ry_a + XsinT);                         // %49 = Nz(1-c)Ny + Nx·sin
    const Rz_a = f32(NzOneMinusC * Nz);                   // %50 = Nz(1-c)Nz
    const Rz = f32(Rz_a + cosT);                          // %51 = Nz(1-c)Nz + cosθ

    const R: Vec3M = [Rx, Ry, Rz];                        // %52..%54

    objectNormalForPos = [R[0], R[1], R[2]];              // %58 ← %54
    objectNormalOut = [R[0], R[1], R[2]];                 // %59 ← %54
    // %55..%56: color = uniforms.color (unmodified).
    colorOut = [
      f32(uniforms.color[0]),
      f32(uniforms.color[1]),
      f32(uniforms.color[2]),
      f32(uniforms.color[3]),
    ];
    worldNormalWeight = f32(1.0);                         // %61 ← 1.0
  }

  // %62..%66: worldPosition_xyz = uniforms.scale * objectNormalForPos.
  const scale = f32(uniforms.scale);
  const wp: Vec3M = [
    f32(scale * objectNormalForPos[0]),
    f32(scale * objectNormalForPos[1]),
    f32(scale * objectNormalForPos[2]),
  ];

  // %67..%83: pos4 = modelview · vec4(worldPosition, 1).
  //   %70 = wp.x · mv.col0
  //   %74 = wp.y · mv.col1
  //   %78 = wp.z · mv.col2
  //   %81 = mv.col1·wp.y + mv.col3
  //   %82 = %81 + %70   (order matches the AIR IR literally)
  //   %83 = %82 + %78
  const mv = uniforms.modelview;
  const col0 = mv[0], col1 = mv[1], col2 = mv[2], col3 = mv[3];
  const c0scaled: Vec4M = [
    f32(col0[0] * wp[0]), f32(col0[1] * wp[0]), f32(col0[2] * wp[0]), f32(col0[3] * wp[0]),
  ];
  const c1scaled: Vec4M = [
    f32(col1[0] * wp[1]), f32(col1[1] * wp[1]), f32(col1[2] * wp[1]), f32(col1[3] * wp[1]),
  ];
  const c2scaled: Vec4M = [
    f32(col2[0] * wp[2]), f32(col2[1] * wp[2]), f32(col2[2] * wp[2]), f32(col2[3] * wp[2]),
  ];
  // %81: c1scaled + col3
  const s81: Vec4M = [
    f32(c1scaled[0] + col3[0]),
    f32(c1scaled[1] + col3[1]),
    f32(c1scaled[2] + col3[2]),
    f32(c1scaled[3] + col3[3]),
  ];
  // %82: %81 + c0scaled
  const s82: Vec4M = [
    f32(s81[0] + c0scaled[0]),
    f32(s81[1] + c0scaled[1]),
    f32(s81[2] + c0scaled[2]),
    f32(s81[3] + c0scaled[3]),
  ];
  // %83: %82 + c2scaled
  const pos4: Vec4M = [
    f32(s82[0] + c2scaled[0]),
    f32(s82[1] + c2scaled[1]),
    f32(s82[2] + c2scaled[2]),
    f32(s82[3] + c2scaled[3]),
  ];

  // %84: worldPosition output = pos4.xyz.
  const worldPosition: Vec3M = [pos4[0], pos4[1], pos4[2]];

  // %85..%103: clip = projection · pos4.
  const pj = uniforms.projection;
  const p0 = pj[0], p1 = pj[1], p2 = pj[2], p3 = pj[3];
  // %88 = pos4.x · p0
  const q0: Vec4M = [
    f32(p0[0] * pos4[0]), f32(p0[1] * pos4[0]), f32(p0[2] * pos4[0]), f32(p0[3] * pos4[0]),
  ];
  // %92 = pos4.y · p1
  const q1: Vec4M = [
    f32(p1[0] * pos4[1]), f32(p1[1] * pos4[1]), f32(p1[2] * pos4[1]), f32(p1[3] * pos4[1]),
  ];
  // %93 = q0 + q1
  const q01: Vec4M = [
    f32(q0[0] + q1[0]), f32(q0[1] + q1[1]), f32(q0[2] + q1[2]), f32(q0[3] + q1[3]),
  ];
  // %97 = pos4.z · p2
  const q2: Vec4M = [
    f32(p2[0] * pos4[2]), f32(p2[1] * pos4[2]), f32(p2[2] * pos4[2]), f32(p2[3] * pos4[2]),
  ];
  // %98 = q01 + q2
  const q012: Vec4M = [
    f32(q01[0] + q2[0]), f32(q01[1] + q2[1]), f32(q01[2] + q2[2]), f32(q01[3] + q2[3]),
  ];
  // %102 = pos4.w · p3
  const q3: Vec4M = [
    f32(p3[0] * pos4[3]), f32(p3[1] * pos4[3]), f32(p3[2] * pos4[3]), f32(p3[3] * pos4[3]),
  ];
  // %103 = q012 + q3
  const clipPos: Vec4M = [
    f32(q012[0] + q3[0]), f32(q012[1] + q3[1]), f32(q012[2] + q3[2]), f32(q012[3] + q3[3]),
  ];

  // %104..%114: worldNormal = modelview_upper_3x3 · objectNormalOut.
  //   %104 = col0.xyz; %105 = col1.xyz; %106 = col2.xyz
  //   %108 = col0.xyz · N.x
  //   %110 = col1.xyz · N.y
  //   %111 = %110 + %108
  //   %113 = col2.xyz · N.z
  //   %114 = %111 + %113
  const n = objectNormalOut;
  const t108: Vec3M = [f32(col0[0] * n[0]), f32(col0[1] * n[0]), f32(col0[2] * n[0])];
  const t110: Vec3M = [f32(col1[0] * n[1]), f32(col1[1] * n[1]), f32(col1[2] * n[1])];
  const t111: Vec3M = [
    f32(t110[0] + t108[0]),
    f32(t110[1] + t108[1]),
    f32(t110[2] + t108[2]),
  ];
  const t113: Vec3M = [f32(col2[0] * n[2]), f32(col2[1] * n[2]), f32(col2[2] * n[2])];
  const worldNormal: Vec3M = [
    f32(t111[0] + t113[0]),
    f32(t111[1] + t113[1]),
    f32(t111[2] + t113[2]),
  ];

  // %115..%120: build the return struct.
  return {
    position: clipPos,                                   // insertvalue 0 — %103
    color: colorOut,                                     // insertvalue 1 — %60
    worldPosition,                                       // insertvalue 2 — %84
    worldNormal,                                         // insertvalue 3 — %114
    objectNormal: [n[0], n[1], n[2]],                    // insertvalue 4 — %58
    worldNormalWeight,                                   // insertvalue 5 — %61
  };
}
