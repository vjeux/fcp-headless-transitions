// doToneMap_OSFA(float vector[3]) — @ProCore 0x3ba5.
//
// One of the ProCore internal "shaper" curves used by the OSFA tone-mapping
// method (an anonymous-namespace class `OSFA` in ProCore's Ozone-color path).
// This is a free C++ function in ProCore's __TEXT,__text, called as a tail
// call from PCColorUtil::applyToneMap_OSFA @0x4661.
//
// Transcribed one-for-one from the x86_64 disassembly at
// raw-port/re/disasm/ProCore.__Z14doToneMap_OSFADv3_f.s (47 lines) plus
// its cold-init helper `.cold.1` at 0xdd22f which populates the two
// static-local `float4` values consumed here.
//
// STATIC INITIALIZATION (@ProCore 0xdd22f — `__Z14doToneMap_OSFADv3_f.cold.1`)
// ---------------------------------------------------------------------------
// The prologue at 0x3bad tests the Itanium C++ ABI guard byte
// `__ZGVZN12_GLOBAL__N_14OSFA10getToneMapEvE6result` and, if clear, tail-
// calls into `.cold.1` which:
//   1. `__cxa_guard_acquire(&guard)`                (@0xdd23a)
//   2. If acquired (eax != 0):
//        - `result[0..3]  = 0xe1f30`  (@0xdd243 -> stored @0x15b0e0)
//        - `result2[0..3] = 0xe1f40`  (@0xdd251 -> stored @0x15b0f0, the
//          second float4 lane of the same 32-byte static record).
//        - `__cxa_guard_release(&guard)`             (@0xdd267 tail jmp)
// After init the hot path re-enters at 0x3bbb via `jmp 0x3bbb` @0x3c6e.
// Both callees are Itanium C++ ABI externs (__cxa_guard_acquire /
// __cxa_guard_release) — libc++abi symbols out of the port scope. We
// model the guard in TS via a plain module-scope lazy initializer.
//
// The two static-local constants (recovered via
//   raw-port/army/tools/resolve.py ProCore ripconst 0xdd243 0x4ce6 7
//   raw-port/army/tools/resolve.py ProCore ripconst 0xdd251 0x4ce8 7
// ) are:
//   OSFA::getToneMap()::result       @0x15b0e0 =
//     (0.17561966180801392, 0.17561966180801392, 0.17561966180801392, 0)
//       — the "M" multiplier applied after the first pow().
//   OSFA::getToneMap()::result[1]    @0x15b0f0 =
//     (0.699999988079071, 0.699999988079071, 0.699999988079071, 0)
//       — the "N" exponent for the first pow() (float32 rep of 0.7 =
//         0x3f333333).
//
// RIP-RELATIVE FLOAT CONSTANTS (in ProCore __TEXT,__const)
// ---------------------------------------------------------------------------
//   @0xe1bb0  = (0x7fffffff, 0x7fffffff, 0x7fffffff, 0x7fffffff)
//               — per-lane abs mask (clear the sign bit). Read at 0x3bc9
//                 (`andps 0xddfe0(%rip), %xmm0`) and at 0x3c15/0x3c1c.
//   @0xe1bd0  = (+1.0, +1.0, +1.0, +0.0)  (0x3f800000 x3, 0 x1).
//               Read at 0x3bf6 and 0x3c45.
//   @0xe1be0  = (-1.0, -1.0, -1.0,  0.0)  (0xbf800000 x3, 0 x1).
//               Read as the `blendvps` source at 0x3c01 and 0x3c4c.
//   @0xe1d90  = (0.511247456073761, 0.511247456073761, 0.511247456073761, 0)
//               (0x3f02e11d x3, 0 x1) — the second pow() exponent.
//
// SEMANTICS — RE-DERIVED FROM THE ASSEMBLY
// ---------------------------------------------------------------------------
// Let v = xmm0 on entry (SysV ABI float vector[3]). Rewriting the asm:
//
//   xmm2 <- 0                          ; 0x3bbb  xorps %xmm2,%xmm2
//   signMask <- (v < 0) per lane       ; 0x3bbe/0x3bc1 cmpltps
//                                      ;   (AT&T `cmpltps %xmm2,%xmm1`
//                                      ;    computes xmm1 < xmm2 = v < 0)
//                                      ;   => per-lane all-1s or all-0s.
//   [rbp-0x10] <- signMask             ; 0x3bc5 save
//   absV <- |v| (bitwise)              ; 0x3bc9 andps abs-mask
//   M    <- OSFA::getToneMap::result   ; 0x3bd0 load (M,M,M,0)
//   [rbp-0x20] <- M                    ; 0x3bd7 save
//   absV.w <- 0                        ; 0x3bdb blendps $0x8 (zero lane w)
//   N    <- result[1]                  ; 0x3be1 load (0.7,0.7,0.7,0)
//   N.w  <- 0                          ; 0x3be8 blendps $0x8
//   xmm0 <- __simd_pow_f4(absV, N)     ; 0x3bee call — xmm0 = |v|^0.7
//   xmm1 <- xmm0                       ; 0x3bf3
//   xmm2 <- (+1,+1,+1,0)               ; 0x3bf6 load
//   xmm0 <- signMask                   ; 0x3bfd reload (blendvps selector)
//   xmm2 <- signMask.msb? -1 : +1      ; 0x3c01 blendvps ->  sign(v)
//                                      ;   (v<0 => mask=all-1s => msb=1
//                                      ;    => pick -1; v>=0 => keep +1.)
//   xmm1 <- |v|^0.7 * M                ; 0x3c0a mulps
//   xmm2 <- sign(v) * M * |v|^0.7      ; 0x3c0e mulps
//   [rbp-0x10] <- xmm2                 ; 0x3c11 stash step1
//
//                                      ; ---- SECOND POW PHASE ----
//   xmm0 <- |step1|                    ; 0x3c15/0x3c1c andps
//   xmm1 <- 0                          ; 0x3c1f
//   xmm0.w <- 0                        ; 0x3c22 blendps
//   xmm1 <- (E,E,E,0), E=0.5112474561  ; 0x3c28
//   xmm0 <- __simd_pow_f4(|step1|, E)  ; 0x3c2f call
//   xmm1 <- xmm0                       ; 0x3c34
//   xmm0 <- 0                          ; 0x3c37
//   xmm2 <- step1                      ; 0x3c3a reload
//   xmm2 <- (step1 < 0)                ; 0x3c3e cmpltps -> signMask_step1
//   xmm0 <- signMask_step1             ; 0x3c42
//   xmm2 <- (+1,+1,+1,0)               ; 0x3c45
//   xmm2 <- signMask_step1.msb? -1 : +1; 0x3c4c blendvps -> sign(step1)
//   xmm2 <- sign(step1) * |step1|^E    ; 0x3c55 mulps
//   return xmm2                        ; 0x3c58/0x3c60 retq
//
// The algorithm is therefore two nested "signed power" operations:
//     step1  = sign(v) * (0.17561966 * |v|^0.7)
//     result = sign(step1) * |step1|^0.5112474561
// where sign(x) is defined here as +1 when x >= 0 and -1 when x < 0 (the
// `cmpltps` uses strict less-than; `blendvps` picks -1 when the mask MSB
// is 1). Because 0.17561966 > 0 and |v|^0.7 >= 0, sign(step1) == sign(v),
// but the function COMPUTES the sign twice — we transcribe both.
//
// This function is called by PCColorUtil::applyToneMap_OSFA @0x4661 and
// is part of the "OSFA" tone-map family. See also doToneMap_OS @0x383e
// and doInverseToneMap_OSFA @0x3c73 for sibling shapers.
//
// EXTERN CALLED — out of scope, modelled as boundary imports:
//   * __simd_pow_f4  (Accelerate.framework / libsystem_m: per-lane
//     powf on a float32x4).  Modeled below as per-lane
//     `Math.fround(Math.pow(...))` to match the ss/ps single-precision
//     numeric width the machine uses. Same policy as PCColorUtil.ts.

// ── Static-local `getToneMap()::result` (populated by .cold.1 @0xdd22f) ─
// A single 32-byte record laid out contiguously at BSS 0x15b0e0. The two
// halves are the M-multiplier and the N-exponent respectively. The value
// bytes are read directly out of ProCore __TEXT,__const:
//    @0xe1f30 -> (0.17561966180801392, 0.17561966180801392, 0.17561966180801392, 0)
//    @0xe1f40 -> (0.699999988079071,   0.699999988079071,   0.699999988079071,   0)
const OSFA_getToneMap_result_M: readonly [number, number, number, number] = [
  Math.fround(0.17561966180801392), // @ProCore 0xe1f30
  Math.fround(0.17561966180801392),
  Math.fround(0.17561966180801392),
  0,
];
const OSFA_getToneMap_result_N: readonly [number, number, number, number] = [
  Math.fround(0.699999988079071), // @ProCore 0xe1f40 (float32 rep of 0.7)
  Math.fround(0.699999988079071),
  Math.fround(0.699999988079071),
  0,
];
// @ProCore 0xe1d90 — the second pow() exponent (float32 0x3f02e11d).
const OSFA_secondExponent: readonly [number, number, number, number] = [
  Math.fround(0.511247456073761),
  Math.fround(0.511247456073761),
  Math.fround(0.511247456073761),
  0,
];

/** `__simd_pow_f4` — Accelerate.framework symbol stub @ProCore 0xde768.
 *  Per-lane single-precision power. Modeled as per-lane
 *  `Math.fround(Math.pow(Math.fround(base), Math.fround(exp)))` so the
 *  result matches the width of a hardware `powf`. This is a boundary
 *  stub — the real symbol is out-of-scope for the port. */
function simd_pow_f4(
  base: readonly [number, number, number, number],
  exp: readonly [number, number, number, number],
): [number, number, number, number] {
  return [
    Math.fround(Math.pow(Math.fround(base[0]), Math.fround(exp[0]))),
    Math.fround(Math.pow(Math.fround(base[1]), Math.fround(exp[1]))),
    Math.fround(Math.pow(Math.fround(base[2]), Math.fround(exp[2]))),
    Math.fround(Math.pow(Math.fround(base[3]), Math.fround(exp[3]))),
  ];
}

/** `blendvps %xmm0, src, dst` — per-lane pick from (dst, src) using
 *  the MSB of the corresponding lane in the implicit `%xmm0` mask
 *  register. If the mask lane's high bit is 1, take `src`; if 0, keep
 *  `dst`. Faithful re-encoding of the x86 semantics used at 0x3c01 and
 *  0x3c4c. */
function blendvps(
  mask: readonly [number, number, number, number],
  src: readonly [number, number, number, number],
  dst: readonly [number, number, number, number],
): [number, number, number, number] {
  const buf = new ArrayBuffer(4);
  const fv = new Float32Array(buf);
  const uv = new Uint32Array(buf);
  const pick = (i: 0 | 1 | 2 | 3): number => {
    fv[0] = Math.fround(mask[i]);
    const msb = (uv[0] >>> 31) & 1;
    return msb ? src[i] : dst[i];
  };
  return [pick(0), pick(1), pick(2), pick(3)];
}

/** `cmpltps` (AT&T `cmpltps %src, %dst`) — per-lane strict less-than
 *  compare `dst < src` in single precision; result per lane is all-1s
 *  (0xffffffff) if true or all-0s if false. In both uses here the
 *  second AT&T operand is the value being tested and the first is
 *  zero, so the returned mask lane is all-1s iff a[i] < 0. Only the
 *  MSB is consumed by the following `blendvps`, so we return -1 (whose
 *  float32 MSB is 1) or 0. */
function cmpltps_signMask(
  a: readonly [number, number, number, number],
): [number, number, number, number] {
  return [
    a[0] < 0 ? -1 : 0,
    a[1] < 0 ? -1 : 0,
    a[2] < 0 ? -1 : 0,
    a[3] < 0 ? -1 : 0,
  ];
}

/** `andps` with the abs-mask (0x7fffffff x4) — bitwise clear the sign
 *  bit per lane, i.e. absolute value in float32 precision. */
function absLanes(
  v: readonly [number, number, number, number],
): [number, number, number, number] {
  return [
    Math.fround(Math.abs(v[0])),
    Math.fround(Math.abs(v[1])),
    Math.fround(Math.abs(v[2])),
    Math.fround(Math.abs(v[3])),
  ];
}

/**
 * `doToneMap_OSFA(float vector[3])` — @ProCore 0x3ba5.
 *
 * Two-stage "signed power" tone-map shaper used by the OSFA color-utility
 * path. Stage 1 applies `sign(v) * M * |v|^N` with M=0.17561966 and
 * N=0.7. Stage 2 applies `sign(step1) * |step1|^E` with E=0.5112474561.
 * See the module doc block for the full decoded semantics.
 *
 * The physical calling convention is `xmm0` in / `xmm0` out with the
 * fourth lane treated as padding for the `float vector[3]` type. We
 * expose lane 3 as a full parameter so the transcription of the
 * `blendps $0x8` masks and the `__simd_pow_f4` calls remains bit-for-
 * bit faithful; callers that observe only lanes 0..2 (the C++ type)
 * can ignore lane 3 of the result.
 */
export function doToneMap_OSFA(
  vec: readonly [number, number, number, number],
): [number, number, number, number] {
  // 0x3bbb  xorps  %xmm2,%xmm2         ; xmm2 = 0
  const zero: readonly [number, number, number, number] = [0, 0, 0, 0];
  // 0x3bbe  movaps %xmm0,%xmm1         ; xmm1 = v
  // 0x3bc1  cmpltps %xmm2,%xmm1        ; xmm1 = (v < 0) per lane as -1/0
  const signMask_v = cmpltps_signMask(vec);
  // 0x3bc5  movaps %xmm1,-0x10(%rbp)   ; save signMask
  // 0x3bc9  andps  0xddfe0(%rip),%xmm0 ; xmm0 = |v|  (abs-mask @0xe1bb0)
  let xmm0: [number, number, number, number] = absLanes(vec);
  // 0x3bd0  movaps ...E6result(%rip),%xmm1 ; xmm1 = M vec (0.17561966,...,0)
  // 0x3bd7  movaps %xmm1,-0x20(%rbp)   ; save M
  const M: readonly [number, number, number, number] = OSFA_getToneMap_result_M;
  // 0x3bdb  blendps $0x8,%xmm2,%xmm0   ; xmm0[3] <- 0
  xmm0 = [xmm0[0], xmm0[1], xmm0[2], zero[3]];
  // 0x3be1  movaps 0x157508(%rip),%xmm1 ; xmm1 = N vec (0.7,0.7,0.7,0)
  // 0x3be8  blendps $0x8,%xmm2,%xmm1   ; xmm1[3] <- 0
  const N_padded: readonly [number, number, number, number] = [
    OSFA_getToneMap_result_N[0],
    OSFA_getToneMap_result_N[1],
    OSFA_getToneMap_result_N[2],
    zero[3],
  ];
  // 0x3bee  callq __simd_pow_f4        ; xmm0 = pow(|v|, N)
  const pow1 = simd_pow_f4(xmm0, N_padded);
  // 0x3bf3  movaps %xmm0,%xmm1         ; xmm1 = |v|^N
  let xmm1: [number, number, number, number] = [pow1[0], pow1[1], pow1[2], pow1[3]];
  // 0x3bf6  movaps 0xddfd3(%rip),%xmm2 ; xmm2 = (+1,+1,+1,0)  @0xe1bd0
  let xmm2: [number, number, number, number] = [
    Math.fround(1),
    Math.fround(1),
    Math.fround(1),
    Math.fround(0),
  ];
  // 0x3bfd  movaps -0x10(%rbp),%xmm0   ; xmm0 = signMask (blendvps selector)
  xmm0 = [signMask_v[0], signMask_v[1], signMask_v[2], signMask_v[3]];
  // 0x3c01  blendvps %xmm0,0xddfd6(%rip),%xmm2 ; xmm2 = signMask.msb ? -1 : +1
  const negOneVec: readonly [number, number, number, number] = [
    Math.fround(-1),
    Math.fround(-1),
    Math.fround(-1),
    Math.fround(0),
  ]; // @0xe1be0
  xmm2 = blendvps(xmm0, negOneVec, xmm2);
  // 0x3c0a  mulps -0x20(%rbp),%xmm1    ; xmm1 = M * |v|^N
  xmm1 = [
    Math.fround(xmm1[0] * M[0]),
    Math.fround(xmm1[1] * M[1]),
    Math.fround(xmm1[2] * M[2]),
    Math.fround(xmm1[3] * M[3]),
  ];
  // 0x3c0e  mulps %xmm1,%xmm2          ; xmm2 = sign(v) * M * |v|^N
  xmm2 = [
    Math.fround(xmm2[0] * xmm1[0]),
    Math.fround(xmm2[1] * xmm1[1]),
    Math.fround(xmm2[2] * xmm1[2]),
    Math.fround(xmm2[3] * xmm1[3]),
  ];
  // 0x3c11  movaps %xmm2,-0x10(%rbp)   ; stash step1
  const step1: [number, number, number, number] = [xmm2[0], xmm2[1], xmm2[2], xmm2[3]];

  // ---- SECOND POW PHASE ----
  // 0x3c15  movaps 0xddf94(%rip),%xmm0 ; xmm0 = abs-mask @0xe1bb0
  // 0x3c1c  andps  %xmm2,%xmm0         ; xmm0 = |step1|
  xmm0 = absLanes(step1);
  // 0x3c1f  xorps  %xmm1,%xmm1         ; xmm1 = 0
  xmm1 = [0, 0, 0, 0];
  // 0x3c22  blendps $0x8,%xmm1,%xmm0   ; xmm0[3] = 0
  xmm0 = [xmm0[0], xmm0[1], xmm0[2], 0];
  // 0x3c28  movaps 0xde161(%rip),%xmm1 ; xmm1 = E vec @0xe1d90
  const E_padded: readonly [number, number, number, number] = [
    OSFA_secondExponent[0],
    OSFA_secondExponent[1],
    OSFA_secondExponent[2],
    OSFA_secondExponent[3],
  ];
  // 0x3c2f  callq __simd_pow_f4        ; xmm0 = pow(|step1|, E)
  const pow2 = simd_pow_f4(xmm0, E_padded);
  // 0x3c34  movaps %xmm0,%xmm1         ; xmm1 = |step1|^E
  xmm1 = [pow2[0], pow2[1], pow2[2], pow2[3]];
  // 0x3c37  xorps  %xmm0,%xmm0         ; xmm0 = 0
  // 0x3c3a  movaps -0x10(%rbp),%xmm2   ; xmm2 = step1 (reload)
  // 0x3c3e  cmpltps %xmm0,%xmm2        ; xmm2 = (step1 < 0) per lane
  xmm2 = cmpltps_signMask(step1);
  // 0x3c42  movaps %xmm2,%xmm0         ; xmm0 = signMask_step1 (selector)
  xmm0 = [xmm2[0], xmm2[1], xmm2[2], xmm2[3]];
  // 0x3c45  movaps 0xddf84(%rip),%xmm2 ; xmm2 = (+1,+1,+1,0) @0xe1bd0
  xmm2 = [Math.fround(1), Math.fround(1), Math.fround(1), Math.fround(0)];
  // 0x3c4c  blendvps %xmm0,0xddf8b(%rip),%xmm2 ; xmm2 = signMask.msb ? -1 : +1
  xmm2 = blendvps(xmm0, negOneVec, xmm2);
  // 0x3c55  mulps %xmm1,%xmm2          ; xmm2 = sign(step1) * |step1|^E
  xmm2 = [
    Math.fround(xmm2[0] * xmm1[0]),
    Math.fround(xmm2[1] * xmm1[1]),
    Math.fround(xmm2[2] * xmm1[2]),
    Math.fround(xmm2[3] * xmm1[3]),
  ];
  // 0x3c58  movaps %xmm2,%xmm0
  // 0x3c5b  addq $0x20,%rsp / popq %rbp / retq
  return xmm2;
}
