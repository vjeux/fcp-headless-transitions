// OZPolygonAA.ts — Ozone's OZPolygonAA singleton. Transcribed from the disassembly at
// /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone.
// See raw-port/re/disasm/OZPolygonAA.*.s and grep 'OZPolygonAA' /tmp/Ozone_symmap.tsv.
//
// ROLE. Precomputed 2D anti-aliasing edge weight table used by Ozone's polygon rasterizer.
// A global 64x64 grid of u8 weights derived from a normalized 1-D gaussian, tensor-producted
// across two axes and gamma-shaped. The singleton exposes generateEdgeAAData(dst) to fill the
// caller's std::vector<u8> (or raw u8*) with N*N bytes.
//
// STRUCT LAYOUT (24 bytes, recovered from ctor 0x15b280).
//   +0x00  vtbl : *const void            // PCSingleton vtable pointer (leaq __ZTV11OZPolygonAA+0x10 @0x15b290-0x15b29b)
//   +0x08  size : uint64                 // N — samples per axis (movq $0x40, 0x8(%rbx) @0x15b29e ⇒ N=64)
//   +0x10  xmax : double                 // gauss window half-range   (movaps 0x709560(%rip)... @0x15b2a6 ⇒ 2.0)
//   +0x18  gamma: double                 // pow exponent for gauss_j  (second lane of movups     ⇒ 1.0)
//
// PCSINGLETON BASE. OZPolygonAA extends PCSingleton with tag=0 (xorl %esi,%esi @0x15b289 -> C2 base
// @Ozone 0x15b28b callq PCSingleton::PCSingleton(unsigned int) [stub for __ZN11PCSingletonC2Ej]).
// We import the real PCSingleton (raw-port/src/infra/PCSingleton.ts).
import { PCSingleton } from "../infra/PCSingleton.js";

// ── RIP-relative doubles used by generateEdgeAAData (all resolved via
//     `python3 raw-port/army/tools/resolve.py Ozone const 0x<addr>`; each entry cites the load's
//     RIP-relative target address). ────────────────────────────────────────────────────────────
/** 2.0 @Ozone 0x706ee8 — |x| >= window-half-range ⇒ gaussian is 0 (windowing). */
const GAUSS_WINDOW: number = 2.0;
/** 0x7FFFFFFFFFFFFFFF @Ozone 0x706e10 — bitmask that clears the sign bit of a double (fabs). */
// Applied via `andpd 0x706e10(%rip), %xmm0` @0x15b441 & @0x15b4f7 — since we've just squared,
// the value is already >=0, but the asm still masks (preserves NaN sign propagation). We honor
// that by using Math.abs, which is bit-equivalent for finite non-NaN doubles.
/** -1.5 @Ozone 0x706eb8 — coefficient of x^2 inside exp: exp(-1.5 * x^2). */
const GAUSS_ARG_COEFF: number = -1.5;
/** -e^-6 ≈ -0.0024787521766663585  @Ozone 0x709570 — additive normalization offset. */
const GAUSS_NORM_ADD: number = -0.0024787521766663585;
/** 1 - e^-6 ≈  0.9975212478233336   @Ozone 0x709578 — divisor for [0,1]-normalized gaussian. */
const GAUSS_NORM_DIV: number = 0.9975212478233336;
/** 1.0 @Ozone 0x7053e0 — numerator for  1/gamma  in pow-shaping. */
const ONE: number = 1.0;
/** 255.0 @Ozone 0x709580 — scales the [0,1] product to u8 range. */
const U8_SCALE: number = 255.0;
/** 0.5 @Ozone 0x706ea8 — rounding bias (result = trunc(x + 0.5 + 1e-7)). */
const ROUND_BIAS: number = 0.5;
/** 1e-7 @Ozone 0x706ed0 — anti-tie epsilon added before trunc. */
const ROUND_EPS: number = 1e-7;

/**
 * Normalized 1-D gaussian used by both axes of generateEdgeAAData.
 * Not a separate FCP symbol — inlined at @0x15b41d..@0x15b466 and @0x15b4d3..@0x15b528 in
 * OZPolygonAA::generateEdgeAAData. Extracted here for clarity; both call sites transcribe
 * to identical arithmetic. Returns 0 if |x| >= GAUSS_WINDOW (windowed).
 *
 *   xmm0 = exp(-1.5 * x^2)                     ; @0x15b451 / @0x15b50b callq _exp
 *   xmm0 = (xmm0 + (-e^-6)) / (1 - e^-6)       ; @0x15b456..@0x15b464 / @0x15b510..@0x15b51e
 */
function gaussNormalized(x: number): number {
  // ucomisd %xmm0, 2.0; jae skip  (@0x15b433 or @0x15b4e9)
  // NB: the compare uses the raw x (not |x|) — but any negative x hits the else branch
  // and is squared to a positive value, so the window is effectively |x| < 2 in this callsite
  // (all callers pass x = i*dx with i >= 0, so x >= 0 always at these two sites).
  if (x >= GAUSS_WINDOW) return 0.0;
  const x2 = x * x;                              // mulsd %xmm0, %xmm0
  const ax2 = Math.abs(x2);                      // andpd 0x706e10 mask (fabs)
  const arg = GAUSS_ARG_COEFF * ax2;             // mulsd -1.5
  const e = Math.exp(arg);                       // callq _exp @0x15b451
  return (e + GAUSS_NORM_ADD) / GAUSS_NORM_DIV;  // addsd; divsd @0x15b456..@0x15b464
}

/**
 * OZPolygonAA — polygon anti-aliasing table singleton.
 *
 * `getInstance()` is the double-checked-once-lock pattern (compare-and-branch on
 * OZPolygonAA::getInstance()::once at @Ozone 0x15b1f0; slow-path @0x15b202 calls the
 * .cold.1 initializer which constructs the object and stores it into OZPolygonAA::_instance).
 * We model this as a lazily-constructed module-level singleton — the JS runtime already
 * provides safe once-init semantics for module-scope evaluation, and no observable state
 * depends on the exact FCP timing of the `once` flag.
 *
 *   @0x15b1f0  cmpq $-1, once(%rip)
 *   @0x15b1f8  jne  0x15b202       ; slow-path init
 *   @0x15b1fa  movq _instance(%rip), %rax; retq
 */
export class OZPolygonAA extends PCSingleton {
  /** +0x08 — grid dimension N (both axes). Set to 0x40 = 64 in the ctor @0x15b29e. */
  public readonly size: number;
  /** +0x10 — gaussian window half-range. Set to 2.0 (RIP-const @Ozone 0x709560) @0x15b2a6. */
  public readonly xmax: number;
  /** +0x18 — pow exponent gamma. Set to 1.0 (RIP-const @Ozone 0x709568, second lane of the
   *   movaps at @0x15b2a6) @0x15b2ad. */
  public readonly gamma: number;

  /**
   * OZPolygonAA::OZPolygonAA()  @Ozone 0x15b280 (C1; C2 @0x15b2b8 aliases C1).
   *
   * Disasm (raw-port/re/disasm/OZPolygonAA.OZPolygonAA.s):
   *   0x15b289  xorl  %esi, %esi                        ; tag = 0 arg to PCSingleton::C2
   *   0x15b28b  callq __ZN11PCSingletonC2Ej             ; PCSingleton::PCSingleton(unsigned int)
   *   0x15b290  leaq  __ZTV11OZPolygonAA(%rip), %rax    ; vtable
   *   0x15b297  addq  $0x10, %rax                       ; skip RTTI slots
   *   0x15b29b  movq  %rax, (%rbx)                      ; overwrite base vtbl at this+0x00
   *   0x15b29e  movq  $0x40, 0x8(%rbx)                  ; size = 64
   *   0x15b2a6  movaps 0x5ae2b3(%rip), %xmm0            ; load {2.0, 1.0} at @Ozone 0x709560
   *   0x15b2ad  movups %xmm0, 0x10(%rbx)                ; xmax=2.0 @+0x10, gamma=1.0 @+0x18
   */
  public constructor() {
    super(0);                                      // xorl %esi,%esi -> PCSingleton::C2(0)
    this.size = 64;                                // movq $0x40, 0x8(%rbx) @0x15b29e
    this.xmax = 2.0;                               // first double of the movaps @0x15b2a6
    this.gamma = 1.0;                              // second double of the movaps @0x15b2a6
  }

  /**
   * OZPolygonAA::generateEdgeAAData(unsigned char* dst) const  @Ozone 0x15b300.
   * (The `std::vector<u8>*` overload @Ozone (same address family) resizes the vector to N*N
   * via `new + memcpy + bzero + delete[]` @0x15b338..@0x15b3c8 and then falls through into
   * the same fill code path — we model that as the caller passing an already-sized buffer
   * of at least N*N bytes here.)
   *
   * Layout of the produced N×N table (row-major, stride N):
   *   For row-index counter i_cnt from 0 to N-1 (inner variable r14 goes N-1,...,0):
   *     let i' = N-1 - i_cnt;    dx = xmax / (N-1);   xi = i' * dx
   *     let gi = gaussNormalized(xi)                                    [0 if xi >= 2]
   *     For col-index counter j_cnt from 0 to N-1 (inner variable r12-2 goes N-1,...,0):
   *       let j' = N-1 - j_cnt;    xj = j' * dx
   *       let gj = gaussNormalized(xj)                                  [0 if xj >= 2]
   *       if gj <= 0: out = trunc(0    + ROUND_BIAS + ROUND_EPS)         ; falls through pow-skip
   *       else       : out = trunc(pow(gj, 1/gamma) * gi * 255 + BIAS + EPS)
   *       dst[i_cnt * N + j_cnt] = (u8)out
   *
   * Disasm walk of the two loops:
   *   @0x15b3ec  decq %r14                                    ; r14 = N-1
   *   @0x15b3ef  cvtsi2sd %r14, %xmm0                          ; (double)(N-1)
   *   @0x15b3f4  movsd 0x10(%rbx), %xmm1                       ; xmax
   *   @0x15b3f9  divsd %xmm0, %xmm1                            ; dx = xmax/(N-1)
   *   @0x15b402  movq  (%r15), %r15                            ; r15 = data ptr
   *   @0x15b41d  (outer .L1): xmm0 = i * dx; gi = gaussNorm(xmm0)
   *   @0x15b46b  r12 = this->size (=N); if r12<=0 fall to next-outer
   *   @0x15b474  r12++    ; loop counter, ends when r12 <= 1
   *   @0x15b4d3  (inner .L2): xmm1 = (r12-2)*dx; gj = gaussNorm(xmm1)
   *   @0x15b480  (pow path): xmm1 = 1.0 / this->gamma; xmm0 = pow(gj, 1/gamma)
   *   @0x15b492..@0x15b4b3: xmm1 = xmm0 * gi * 255 + 0.5 + 1e-7; trunc(xmm1) -> u8
   *   @0x15b4c0  movb %al, (%r15); incq %r15
   *   @0x15b4c6  decq %r12; cmpq $1, %r12; jbe next-outer
   *
   * We faithfully mirror the branch structure: the negative-gj early-out at @0x15b528 stores
   * a u8 of trunc(0 + 0.5 + 1e-7) = 0.
   */
  public generateEdgeAAData(dst: Uint8Array): number {
    const N = Number(this.size); // this->size @+0x08 (movq 0x8(%rbx),%r14 @0x15b3df)
    // testq %r14,%r14; jle 0x15b537   — if N <= 0 return N as int32.
    if (N <= 0) return N | 0; // movl %r14d, %eax; retq @0x15b537
    const Nm1 = N - 1;                                       // decq %r14 @0x15b3ec
    const dx = this.xmax / Nm1;                              // divsd @0x15b3f9

    let ptr = 0;                                             // r15 = data (base) @0x15b402
    // Outer loop: r14 counts down from N-1 to 0 inclusive.
    for (let iCntr = 0; iCntr < N; iCntr++) {
      // asm holds i' = r14 (goes N-1, N-2, ..., 0); iCntr = (N-1 - r14).
      const iPrime = Nm1 - iCntr;
      const xi = iPrime * dx;                                // mulsd -0x30(%rbp) @0x15b425
      // Store 0 first (matches `xorpd %xmm1,%xmm1; movsd %xmm1,-0x38(%rbp)` @0x15b42a-@0x15b42e),
      // then overwrite iff inside window.
      let gi = 0.0;
      if (xi < GAUSS_WINDOW) {                               // ucomisd 2.0; jae skip @0x15b433
        const x2 = xi * xi;                                  // mulsd %xmm0,%xmm0 @0x15b43d
        const ax2 = Math.abs(x2);                            // andpd fabs-mask @0x15b441
        const arg = GAUSS_ARG_COEFF * ax2;                   // mulsd -1.5     @0x15b449
        const e = Math.exp(arg);                             // callq _exp    @0x15b451
        gi = (e + GAUSS_NORM_ADD) / GAUSS_NORM_DIV;          // addsd; divsd  @0x15b456..0x15b464
      }
      // -0x38(%rbp) = gi (stored @0x15b466: movsd %xmm0,-0x38(%rbp) — via prior xmm1 alias).
      // Note: asm stores xmm1 as gi, but the flow re-loads it into xmm1 inside the pow path
      // (mulsd -0x38(%rbp),%xmm1 @0x15b496). We just keep gi in a local.

      // Inner-loop entry check: reload N (asm does `movq 0x8(%rbx),%r12` @0x15b46b), test <= 0
      // (redundant here since N > 0 to enter outer), then `incq %r12` — r12 iterates from N+1
      // down to 2 (exit on r12 <= 1). Equivalent to N inner iterations.
      for (let jCntr = 0; jCntr < N; jCntr++) {
        // r12 = N+1 - jCntr; inside body: rax = r12 - 2 = N - 1 - jCntr = j'.
        const jPrime = Nm1 - jCntr;
        const xj = jPrime * dx;                              // mulsd -0x30,%xmm1 @0x15b4e0

        // Compute gj, mirroring the branch order at @0x15b4e9..
        let gj: number;
        let takePowPath: boolean;
        if (xj >= GAUSS_WINDOW) {                            // ucomisd 2.0; jae 0x15b480 (pow path)
          gj = 0.0;                                          // xmm0 was zeroed @0x15b4e5
          takePowPath = true;
        } else {
          const xj2 = xj * xj;                               // mulsd %xmm1,%xmm1 @0x15b4f3
          const axj2 = Math.abs(xj2);                        // andpd fabs      @0x15b4f7
          const argj = GAUSS_ARG_COEFF * axj2;               // mulsd -1.5     @0x15b4ff
          const ej = Math.exp(argj);                         // callq _exp    @0x15b50b
          gj = (ej + GAUSS_NORM_ADD) / GAUSS_NORM_DIV;       // addsd; divsd  @0x15b510..0x15b51e
          // @0x15b520..0x15b528: xorpd xmm1,xmm1; ucomisd xmm0,xmm1; jbe 0x15b480 (pow) else 0x15b496
          //   i.e. if (0 <= gj) take pow path, else jump into the mul chain WITHOUT re-doing pow
          //   (this is the negative-gj fast path where xmm0 already holds gj).
          takePowPath = 0.0 <= gj;
        }

        // pow shaping — @0x15b480:
        //   xmm1 = 1.0 / this->gamma       (movsd 0x7053e0(%rip),xmm1; divsd 0x18(%rbx),xmm1)
        //   xmm0 = pow(gj, 1/gamma)        (callq _pow  @0x15b48d)
        // then FALL THROUGH into @0x15b492: xmm1 = xmm0
        //   xmm1 = xmm1 * gi              (mulsd -0x38(%rbp),%xmm1  @0x15b496)
        //   xmm1 = xmm1 * 255             (mulsd 0x709580(%rip),%xmm1 @0x15b49b)
        //   xmm1 = xmm1 + 0.5             (addsd 0x706ea8(%rip),%xmm1 @0x15b4a3)
        //   xmm1 = xmm1 + 1e-7            (addsd 0x706ed0(%rip),%xmm1 @0x15b4ab)
        //   xmm0 = roundsd $9,xmm1        (trunc)                    @0x15b4b6
        //   eax  = cvttsd2si xmm0                                    @0x15b4bc
        //   *r15++ = (u8)eax                                         @0x15b4c0
        //
        // The negative-gj fallback path enters at @0x15b496 with xmm0 = gj (negative). This
        // multiplies gj (negative) * gi * 255 + 0.5 + 1e-7 and truncates — a real, if unusual,
        // arithmetic that we must preserve. It should not happen for our N/xmax defaults since
        // gaussNormalized on x<2 always yields >= -e^-6/(1-e^-6) ≈ -0.00249, so trunc rounds to 0.
        let base: number;
        if (takePowPath) {
          const invGamma = ONE / this.gamma;                 // movsd 0x7053e0; divsd 0x18(%rbx) @0x15b480-@0x15b488
          base = Math.pow(gj, invGamma);                     // callq _pow @0x15b48d
        } else {
          base = gj;                                         // reuse xmm0 == gj (negative) @0x15b496 entry
        }
        let acc = base * gi;                                 // mulsd -0x38(%rbp) @0x15b496
        acc = acc * U8_SCALE;                                // mulsd 255.0     @0x15b49b
        acc = acc + ROUND_BIAS;                              // addsd 0.5       @0x15b4a3
        acc = acc + ROUND_EPS;                               // addsd 1e-7      @0x15b4ab
        // roundsd $9 == round toward zero + suppress-inexact (== trunc for finite doubles).
        const truncated = Math.trunc(acc);                   // roundsd $9,xmm1,xmm0 + cvttsd2si @0x15b4b6-@0x15b4bc
        dst[ptr++] = truncated & 0xff;                       // movb %al,(%r15); incq %r15 @0x15b4c0-@0x15b4c3
      }
    }
    // @0x15b537: movl %r14d,%eax; retq — returns the loop-final r14 value which by
    // ANY exit path equals `this->size` (asm reloads it at @0x15b533).
    return N | 0;
  }
}

// ── Singleton accessor ────────────────────────────────────────────────────────
// Faithful model of OZPolygonAA::getInstance()  @Ozone 0x15b1f0. The C++ uses a
// pthread_once-style guard var (OZPolygonAA::getInstance()::once) at RIP-const; JS module scope
// gives us equivalent once semantics.
let _instance: OZPolygonAA | null = null;
export function getInstance(): OZPolygonAA {
  if (_instance === null) _instance = new OZPolygonAA();     // slow path @0x15b202 -> .cold.1
  return _instance;                                          // movq _instance(%rip),%rax; retq
}
