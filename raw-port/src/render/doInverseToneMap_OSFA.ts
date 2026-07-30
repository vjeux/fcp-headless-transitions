// doInverseToneMap_OSFA(float vector[3]) — @ProCore 0x3c73.
//
// The mathematical inverse of `doToneMap_OSFA` @0x3ba5 in the OSFA
// tone-mapping family used by ProCore's Ozone-color path. It maps back
// from tone-mapped output y to the original scene-linear v so that
//     doInverseToneMap_OSFA(doToneMap_OSFA(v)) == v  (numerically).
//
// Transcribed one-for-one from the x86_64 disassembly at
// raw-port/re/disasm/ProCore.__Z21doInverseToneMap_OSFADv3_f.s (46 lines)
// plus its cold-init helper `.cold.1` at 0xdd26e which populates the
// static-local `getInverseToneMap()::result` record.
//
// STATIC INITIALIZATION (@ProCore 0xdd26e — `__Z21doInverseToneMap_OSFADv3_f.cold.1`)
// ---------------------------------------------------------------------------
// Same Itanium C++ ABI guard pattern as `doToneMap_OSFA`:
//   1. `__cxa_guard_acquire(&guard)`                (@0xdd279)
//   2. If acquired:
//        - `result[0..3]  = load @0xe1f50`  (@0xdd282 -> stored @0x15b0f0
//          via `movaps %xmm0, __ZZN..getInverseToneMap()::result(%rip)`)
//        - `result[1]     = load @0xe1f60`  (@0xdd290 -> stored @0x15b120
//          via `movaps %xmm0, 0x7de82(%rip)` = 0xdd297+0x7de82)
//        - `__cxa_guard_release(&guard)`             (@0xdd2a6 tail jmp)
// After init the hot path re-enters at 0x3cae via `jmp 0x3cae` @0x3d33.
// __cxa_guard_acquire/__cxa_guard_release are libc++abi externs outside
// the port scope; we model the guard as a plain module-scope lazy init
// (same policy as `doToneMap_OSFA.ts`).
//
// The two constants (recovered via
//   raw-port/army/tools/resolve.py ProCore ripconst 0xdd282 0x4cc7 7
//   raw-port/army/tools/resolve.py ProCore ripconst 0xdd290 0x4cc9 7
// ) are:
//   OSFA::getInverseToneMap()::result       @0x15b0f0
//     load from @0xe1f50 = (5.694123268127441, 5.694123268127441,
//                           5.694123268127441, 0)
//                          (0x40b63642 x3, 0 x1) — the "M'" multiplier
//                          applied AFTER the first pow(). Note:
//                          5.694123... = 1/0.17561966..., the reciprocal
//                          of the M multiplier used by `doToneMap_OSFA`.
//   OSFA::getInverseToneMap()::result[1]    @0x15b120
//     load from @0xe1f60 = (1.4285714626312256, 1.4285714626312256,
//                           1.4285714626312256, 0)
//                          (0x3fb6db6e x3, 0 x1) — the "N'" exponent for
//                          the second pow(). Note: 1.4285714... = 1/0.7,
//                          the reciprocal of the N exponent used by
//                          `doToneMap_OSFA`.
//
// RIP-RELATIVE FLOAT CONSTANTS (in ProCore __TEXT,__const)
// ---------------------------------------------------------------------------
//   @0xe1bb0  = (0x7fffffff, 0x7fffffff, 0x7fffffff, 0x7fffffff)
//               — per-lane abs mask (clear sign bit). Read at 0x3c7e
//                 (`movaps 0xddf2b(%rip), %xmm0`) and 0x3cd0.
//   @0xe1bd0  = (+1.0, +1.0, +1.0, +0.0)  (0x3f800000 x3, 0 x1).
//               Read at 0x3cb9 and 0x3d0a.
//   @0xe1be0  = (-1.0, -1.0, -1.0,  0.0)  (0xbf800000 x3, 0 x1).
//               Used as the `blendvps` memory source at 0x3cc0 and 0x3d11.
//   @0xe1d50  = (1.9559999704360962, 1.9559999704360962, 1.9559999704360962, 0)
//               (0x3ffa5e35 x3, 0 x1) — the FIRST pow() exponent. Note:
//               1.9559999... = 1/0.5112474561..., reciprocal of the E
//               exponent used by `doToneMap_OSFA` — this is why "invert
//               the outer stage first" reads as raising to that value.
//               Read at 0x3c95 (`movaps 0xde0b4(%rip), %xmm1`).
//
// SEMANTICS — RE-DERIVED FROM THE ASSEMBLY
// ---------------------------------------------------------------------------
// Let v = xmm0 on entry (SysV ABI float vector[3]). Rewriting the asm:
//
//   xmm1 <- v                          ; 0x3c7b movaps
//   xmm0 <- abs-mask @0xe1bb0          ; 0x3c7e movaps
//   [rbp-0x20] <- v                    ; 0x3c85 movaps
//   xmm0 <- |v|  (bitwise AND)         ; 0x3c89 andps %xmm1,%xmm0
//   xmm1 <- 0                          ; 0x3c8c xorps
//   xmm0.w <- 0                        ; 0x3c8f blendps $0x8
//   xmm1 <- (1.956,1.956,1.956,0)      ; 0x3c95 movaps  (First pow exponent)
//   xmm0 <- __simd_pow_f4(|v|, 1.956)  ; 0x3c9c call
//   xmm2 <- |v|^1.956                  ; 0x3ca1
//   guard = result::guard byte         ; 0x3ca4 movb
//   if !guard: goto .cold.1 stash+call ; 0x3cac je
//
//                                      ; ---- HOT PATH (guard set) ----
//   xmm4 <- 0                          ; 0x3cae xorps
//   xmm0 <- v (reload)                 ; 0x3cb1 movaps -0x20(%rbp)
//   xmm0 <- (v < 0) per lane           ; 0x3cb5 cmpltps %xmm4,%xmm0
//                                      ;   (AT&T dst-src => v<0)
//   xmm1 <- (+1,+1,+1,0)               ; 0x3cb9 load @0xe1bd0
//   xmm1 <- signMask.msb? -1 : +1      ; 0x3cc0 blendvps @0xe1be0 into xmm1
//   xmm2 <- sign(v) * |v|^1.956        ; 0x3cc9 mulps %xmm1,%xmm2
//   [rbp-0x10] <- xmm2                 ; 0x3ccc stash step1
//   xmm0 <- abs-mask                   ; 0x3cd0 movaps @0xe1bb0
//   xmm0 <- |step1|                    ; 0x3cd7 andps %xmm2,%xmm0
//   xmm0 <- |step1| * result[0]        ; 0x3cda mulps ...result(%rip),%xmm0
//                                      ;   (result[0] = (5.694,5.694,5.694,0))
//   xmm0.w <- 0                        ; 0x3ce1 blendps $0x8
//   xmm1 <- (1.4285714,...,0) result[1]; 0x3ce7 movaps 0x157432(%rip)
//                                      ;   (0x15b120 = result[1])
//   xmm1.w <- 0                        ; 0x3cee blendps $0x8
//   xmm0 <- __simd_pow_f4(             ; 0x3cf4 call
//              5.694*|step1|, 1.4285714)
//   xmm1 <- pow(5.694*|step1|, 1/N)    ; 0x3cf9
//   xmm0 <- 0                          ; 0x3cfc xorps
//   xmm2 <- step1 (reload)             ; 0x3cff movaps -0x10(%rbp)
//   xmm2 <- (step1 < 0) per lane       ; 0x3d03 cmpltps %xmm0,%xmm2
//   xmm0 <- signMask_step1 (selector)  ; 0x3d07 movaps %xmm2,%xmm0
//   xmm2 <- (+1,+1,+1,0)               ; 0x3d0a movaps @0xe1bd0
//   xmm2 <- signMask_step1.msb? -1:+1  ; 0x3d11 blendvps @0xe1be0 into xmm2
//   xmm2 <- sign(step1) * xmm1         ; 0x3d1a mulps
//   return xmm2                        ; 0x3d1d/0x3d25 retq
//
// The algorithm is the two-stage inverse of the composition applied by
// `doToneMap_OSFA`. Given the direct pipeline
//     step1_fwd = sign(v) * M * |v|^N          (M=0.17561966, N=0.7)
//     y         = sign(step1_fwd) * |step1_fwd|^E   (E=0.5112474561)
// the inverse computed here is
//     step1     = sign(y) * |y|^(1/E)          (1/E = 1.9559999...)
//     v         = sign(step1) * ( (1/M) * |step1| )^(1/N)
//                                              (1/M = 5.6941232..., 1/N = 1.4285714...)
// where sign(x) is defined here as +1 when x >= 0 and -1 when x < 0 (the
// `cmpltps` uses strict less-than; `blendvps` picks -1 when the mask MSB
// is 1). Since 1/M > 0 and |step1| >= 0, sign(v) == sign(step1) == sign(y);
// the function COMPUTES sign(step1) rather than reusing sign(y). We
// transcribe both.
//
// This function is called by PCColorUtil::applyInverseToneMap_OSFA @0x466b
// and is part of the "OSFA" tone-map family. See also doToneMap_OSFA @0x3ba5
// (its forward direction) and doInverseToneMap_OS @<sibling> if present.
//
// EXTERN CALLED — out of scope, modelled as boundary imports:
//   * __simd_pow_f4  (Accelerate.framework / libsystem_m: per-lane
//     powf on a float32x4).  Modeled below as per-lane
//     `Math.fround(Math.pow(...))` to match the ss/ps single-precision
//     numeric width the machine uses. Same policy as doToneMap_OSFA.ts /
//     PCColorUtil.ts.

// ── Static-local `getInverseToneMap()::result` (populated by .cold.1 @0xdd26e) ─
// The two 16-byte lanes are laid out as `result[0]` @0x15b0f0 and
// `result[1]` @0x15b120 (a small gap between them; the compiler stored
// the array with 16-byte alignment). Values read from ProCore
// __TEXT,__const:
//    @0xe1f50 -> (5.694123268127441, 5.694123268127441, 5.694123268127441, 0)
//    @0xe1f60 -> (1.4285714626312256, 1.4285714626312256, 1.4285714626312256, 0)
const OSFA_getInverseToneMap_result_MInv: readonly [number, number, number, number] = [
  Math.fround(5.694123268127441), // @ProCore 0xe1f50 (= 1/0.17561966...)
  Math.fround(5.694123268127441),
  Math.fround(5.694123268127441),
  0,
];
const OSFA_getInverseToneMap_result_NInv: readonly [number, number, number, number] = [
  Math.fround(1.4285714626312256), // @ProCore 0xe1f60 (= 1/0.7, float32 0x3fb6db6e)
  Math.fround(1.4285714626312256),
  Math.fround(1.4285714626312256),
  0,
];
// @ProCore 0xe1d50 — the FIRST pow() exponent (= 1/E ≈ 1.9559999...).
const OSFA_firstExponentInv: readonly [number, number, number, number] = [
  Math.fround(1.9559999704360962), // 0x3ffa5e35
  Math.fround(1.9559999704360962),
  Math.fround(1.9559999704360962),
  0,
];

/** `__simd_pow_f4` — Accelerate.framework symbol stub @ProCore 0xde768.
 *  Per-lane single-precision power. Modeled as per-lane
 *  `Math.fround(Math.pow(Math.fround(base), Math.fround(exp)))` so the
 *  result matches the width of a hardware `powf`. Same policy as
 *  doToneMap_OSFA.ts. */
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
 *  `dst`. Faithful re-encoding of the x86 semantics used at 0x3cc0 and
 *  0x3d11. */
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
 * `doInverseToneMap_OSFA(float vector[3])` — @ProCore 0x3c73.
 *
 * Two-stage inverse "signed power" shaper. Stage 1 raises |y|^(1/E)
 * with 1/E = 1.9559999...; stage 2 raises (1/M * |step1|)^(1/N) with
 * 1/M = 5.6941232... and 1/N = 1.4285714.... Both stages preserve the
 * sign of the input. See the module doc block for the full decoded
 * semantics and the relation to `doToneMap_OSFA`.
 *
 * The physical calling convention is `xmm0` in / `xmm0` out with the
 * fourth lane treated as padding for the `float vector[3]` type. We
 * expose lane 3 as a full parameter so the transcription of the
 * `blendps $0x8` masks and the `__simd_pow_f4` calls remains bit-for-
 * bit faithful; callers that observe only lanes 0..2 (the C++ type)
 * can ignore lane 3 of the result.
 */
export function doInverseToneMap_OSFA(
  vec: readonly [number, number, number, number],
): [number, number, number, number] {
  // 0x3c7b  movaps %xmm0,%xmm1         ; xmm1 = v (kept for the abs below)
  // 0x3c7e  movaps 0xddf2b(%rip),%xmm0 ; xmm0 = abs-mask (0x7fffffff x4)  @0xe1bb0
  // 0x3c85  movaps %xmm1,-0x20(%rbp)   ; stash v for later reload
  // 0x3c89  andps  %xmm1,%xmm0         ; xmm0 = |v|
  let xmm0: [number, number, number, number] = absLanes(vec);
  // 0x3c8c  xorps  %xmm1,%xmm1         ; xmm1 = 0
  const zero: readonly [number, number, number, number] = [0, 0, 0, 0];
  // 0x3c8f  blendps $0x8,%xmm1,%xmm0   ; xmm0[3] <- 0
  xmm0 = [xmm0[0], xmm0[1], xmm0[2], zero[3]];
  // 0x3c95  movaps 0xde0b4(%rip),%xmm1 ; xmm1 = (1.956,1.956,1.956,0)  @0xe1d50
  const firstExp: readonly [number, number, number, number] = OSFA_firstExponentInv;
  // 0x3c9c  callq __simd_pow_f4        ; xmm0 = pow(|v|, 1.956)
  const pow1 = simd_pow_f4(xmm0, firstExp);
  // 0x3ca1  movaps %xmm0,%xmm2         ; xmm2 = |v|^1.956
  let xmm2: [number, number, number, number] = [pow1[0], pow1[1], pow1[2], pow1[3]];
  // 0x3ca4  movb   guard(%rip),%al     ; static-guard byte
  // 0x3caa  testb  %al,%al
  // 0x3cac  je 0x3d26                  ; if !guard, stash xmm2 and call .cold.1,
  //                                    ; then re-enter at 0x3cae. The .cold.1
  //                                    ; helper populates OSFA::getInverseToneMap
  //                                    ; ::result[0..1] under __cxa_guard_acquire/
  //                                    ; __cxa_guard_release. In TS we model this
  //                                    ; as module-scope constants above (the
  //                                    ; guard is trivially "already initialized"
  //                                    ; because module init runs eagerly).
  //
  //                                    ; ---- HOT PATH (guard set) ----
  // 0x3cae  xorps  %xmm4,%xmm4         ; xmm4 = 0
  const xmm4: readonly [number, number, number, number] = [0, 0, 0, 0];
  // 0x3cb1  movaps -0x20(%rbp),%xmm0   ; xmm0 = v (reload original)
  // 0x3cb5  cmpltps %xmm4,%xmm0        ; xmm0 = (v < 0) per lane (AT&T:
  //                                    ;   `cmpltps %xmm4,%xmm0` computes
  //                                    ;   xmm0 < xmm4 = v < 0)
  const signMask_v = cmpltps_signMask(vec);
  // 0x3cb9  movaps 0xddf10(%rip),%xmm1 ; xmm1 = (+1,+1,+1,0)  @0xe1bd0
  let xmm1: [number, number, number, number] = [
    Math.fround(1),
    Math.fround(1),
    Math.fround(1),
    Math.fround(0),
  ];
  // 0x3cc0  blendvps %xmm0,0xddf17(%rip),%xmm1 ; xmm1 = signMask.msb? -1:+1
  //                                    ; source memory @0xe1be0 = (-1,-1,-1,0)
  const negOneVec: readonly [number, number, number, number] = [
    Math.fround(-1),
    Math.fround(-1),
    Math.fround(-1),
    Math.fround(0),
  ];
  xmm1 = blendvps(signMask_v, negOneVec, xmm1);
  // 0x3cc9  mulps  %xmm1,%xmm2         ; xmm2 = sign(v) * |v|^1.956
  xmm2 = [
    Math.fround(xmm2[0] * xmm1[0]),
    Math.fround(xmm2[1] * xmm1[1]),
    Math.fround(xmm2[2] * xmm1[2]),
    Math.fround(xmm2[3] * xmm1[3]),
  ];
  // 0x3ccc  movaps %xmm2,-0x10(%rbp)   ; stash step1
  const step1: [number, number, number, number] = [xmm2[0], xmm2[1], xmm2[2], xmm2[3]];

  // ---- SECOND POW PHASE ----
  // 0x3cd0  movaps 0xdded9(%rip),%xmm0 ; xmm0 = abs-mask @0xe1bb0
  // 0x3cd7  andps  %xmm2,%xmm0         ; xmm0 = |step1|
  xmm0 = absLanes(step1);
  // 0x3cda  mulps result(%rip),%xmm0   ; xmm0 = |step1| * (5.694,5.694,5.694,0)
  //                                    ; result[0] @0x15b0f0 loaded from @0xe1f50
  const MInv: readonly [number, number, number, number] = OSFA_getInverseToneMap_result_MInv;
  xmm0 = [
    Math.fround(xmm0[0] * MInv[0]),
    Math.fround(xmm0[1] * MInv[1]),
    Math.fround(xmm0[2] * MInv[2]),
    Math.fround(xmm0[3] * MInv[3]),
  ];
  // 0x3ce1  blendps $0x8,%xmm4,%xmm0   ; xmm0[3] <- 0
  xmm0 = [xmm0[0], xmm0[1], xmm0[2], xmm4[3]];
  // 0x3ce7  movaps 0x157432(%rip),%xmm1 ; xmm1 = result[1] = (1.4285714,...,0)
  //                                    ; @0x15b120 loaded from @0xe1f60
  const NInv: readonly [number, number, number, number] = OSFA_getInverseToneMap_result_NInv;
  // 0x3cee  blendps $0x8,%xmm4,%xmm1   ; xmm1[3] <- 0
  const NInv_padded: readonly [number, number, number, number] = [
    NInv[0],
    NInv[1],
    NInv[2],
    xmm4[3],
  ];
  // 0x3cf4  callq __simd_pow_f4        ; xmm0 = pow(5.694 * |step1|, 1.4285714)
  const pow2 = simd_pow_f4(xmm0, NInv_padded);
  // 0x3cf9  movaps %xmm0,%xmm1         ; xmm1 = (5.694*|step1|)^(1/N)
  xmm1 = [pow2[0], pow2[1], pow2[2], pow2[3]];
  // 0x3cfc  xorps  %xmm0,%xmm0         ; xmm0 = 0
  // 0x3cff  movaps -0x10(%rbp),%xmm2   ; xmm2 = step1 (reload)
  // 0x3d03  cmpltps %xmm0,%xmm2        ; xmm2 = (step1 < 0) per lane
  const signMask_step1 = cmpltps_signMask(step1);
  // 0x3d07  movaps %xmm2,%xmm0         ; xmm0 = signMask_step1 (blendvps selector)
  // 0x3d0a  movaps 0xddebf(%rip),%xmm2 ; xmm2 = (+1,+1,+1,0)  @0xe1bd0
  xmm2 = [Math.fround(1), Math.fround(1), Math.fround(1), Math.fround(0)];
  // 0x3d11  blendvps %xmm0,0xddec6(%rip),%xmm2 ; xmm2 = sign(step1)
  //                                    ; source memory @0xe1be0 = (-1,-1,-1,0)
  xmm2 = blendvps(signMask_step1, negOneVec, xmm2);
  // 0x3d1a  mulps  %xmm1,%xmm2         ; xmm2 = sign(step1) * pow(5.694*|step1|, 1/N)
  xmm2 = [
    Math.fround(xmm2[0] * xmm1[0]),
    Math.fround(xmm2[1] * xmm1[1]),
    Math.fround(xmm2[2] * xmm1[2]),
    Math.fround(xmm2[3] * xmm1[3]),
  ];
  // 0x3d1d  movaps %xmm2,%xmm0
  // 0x3d20  addq $0x20,%rsp / popq %rbp / retq
  return xmm2;
}
