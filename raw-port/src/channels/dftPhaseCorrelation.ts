// Faithful port of FCP Flexo framework class `dftPhaseCorrelation` (derives from Correlation).
// Framework: Flexo (x86_64). Symbols enumerated from Ozone/Flexo binary at
// /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo.
//
// Class layout (recovered from ctor + Correlation::Correlation @0x12218a0):
//   +0x00  vtable ptr (dftPhaseCorrelation VT at 0x191d720; installed at ctor +0x22398a9..b2)
//   +0x08  float* xr        // real part of x DFT
//   +0x10  float* xi        // imag part of x DFT
//   +0x18  float* yr        // real part of y DFT
//   +0x20  float* yi        // imag part of y DFT
//   +0x28  float* cross     // cross-correlation output (magnitude / phase)
//   +0x30  uint32 peakIndex // Correlation::peakIndex — set by _vDSP_maxvi
//   +0x38  float  peakValue // Correlation::peakValue
//   +0x40  void*  statistics = 0 (unused here)
//   +0x48  int32  size      // = 2*N - 1  where N is the ctor arg (the padded frame size)
// Each of the 5 float arrays holds (2N-1) floats — allocated as `new float[2N-1]` at
// @0x12239d9..0x1223a05.
//
// One class per file. Method addresses cited @-inline.

// ─── The base class `Correlation` is not yet ported. We model the base fields inline
// (offsets above); a full Correlation.ts port is a frontier item — its ctor and dtor
// bodies are trivial, but its methods getStatistics/getCrossCorrFunction/
// getCrossCorrelationPeakIndex/getCrossCorrelationPeakValue @0x1221900.. and
// calculate{Correlation,PhaseCorrelation}Coefficient @0x1221950.. are separate.

/**
 * dftPhaseCorrelation
 *   Real-input DFT / phase-correlation helper. Owns 5 float[2N-1] work buffers.
 *   Ported line-for-line from Flexo @0x1223980 (ctor), @0x1223af0 (rdft),
 *   @0x1223c00 (dft), @0x1223df0 (idft), @0x1223f00 (calculatePhaseCorrelation),
 *   @0x1224380 (computeConfidence).
 */
export class dftPhaseCorrelation {
  // Fields (base first, then derived; layout matches the C++ struct exactly).
  xr: Float32Array;
  xi: Float32Array;
  yr: Float32Array;
  yi: Float32Array;
  cross: Float32Array;
  peakIndex: number = 0;   // +0x30
  peakValue: number = 0;   // +0x38 (single-precision)
  size: number;            // +0x48  = 2N - 1

  /**
   * dftPhaseCorrelation::dftPhaseCorrelation(int N)  @0x1223980 (C2Ei)
   * (C1Ei @0x1223a30 is a thunk to C2Ei.)
   *   this->size = 2*N - 1
   *   allocate xr,xi,yr,yi,cross as new float[2N-1] (only when N > 0; else nullptr).
   *   Note the "size in bytes" computed by the ctor is `((2N-2)*4)*4 = -0x4 + 2N*4`
   *   which for N>0 equals 4*(2N-1). See @0x12239bc..0x12239cb.
   */
  constructor(N: number) {
    // @0x12239bc:  0x48(this) = 2N - 1   (leal -0x1(,%rsi,2))
    this.size = 2 * N - 1;
    const n = this.size;
    // @0x12239c1..0x1223a11: five `new float[n]` allocations (n>0), else null-ish.
    // We can't model raw `nullptr` in JS; zero-length TypedArray is the faithful stand-in.
    const alloc = () => new Float32Array(n > 0 ? n : 0);
    this.xr = alloc();
    this.xi = alloc();
    this.yr = alloc();
    this.yi = alloc();
    this.cross = alloc();
  }

  // ── vDSP shims: transcribe Apple Accelerate calls used at fixed callsites. ──
  // These are NOT invented helpers — each maps 1:1 to a `_vDSP_*` symbol stub in
  // the disassembly and is named to make provenance obvious.

  /** _vDSP_vclr @0x1497e06 — zero a strided float vector (stride=1 in every callsite). */
  private static vDSP_vclr(dst: Float32Array, len: number): void {
    // faithful: memset dst[0..len-1] = 0.0f. Stride param (esi=1) is fixed everywhere here.
    for (let i = 0; i < len; i++) dst[i] = 0;
  }

  /** _vDSP_zvcmul @0x1497e54 — complex vector multiply (stride=1). c = a * conj?/  a*b.
   * Apple: vDSP_zvcmul(A, iA, B, iB, C, iC, N) — C = A * conjugate(B) element-wise.
   * Called at @0x1224141 with A = &xr/xi (aReal=xr,aImag=xi), B = &yr/yi, C = &yr/yi,
   * i.e. (yr,yi) = (xr,xi) * conjugate(yr,yi). See callsite for exact arg map. */
  private static vDSP_zvcmul(
    aRe: Float32Array, aIm: Float32Array,
    bRe: Float32Array, bIm: Float32Array,
    cRe: Float32Array, cIm: Float32Array,
    n: number,
  ): void {
    // Apple docs: C = A * conjugate(B). (Re(A)+iIm(A)) * (Re(B)-iIm(B))
    // = (Re(A)Re(B)+Im(A)Im(B)) + i(Im(A)Re(B) - Re(A)Im(B))
    for (let i = 0; i < n; i++) {
      const ar = Math.fround(aRe[i]);
      const ai = Math.fround(aIm[i]);
      const br = Math.fround(bRe[i]);
      const bi = Math.fround(bIm[i]);
      const re = Math.fround(Math.fround(ar * br) + Math.fround(ai * bi));
      const im = Math.fround(Math.fround(ai * br) - Math.fround(ar * bi));
      cRe[i] = re;
      cIm[i] = im;
    }
  }

  /** _vDSP_vdist @0x1497e0c — hypot on two strided vectors: c = sqrt(a*a + b*b). */
  private static vDSP_vdist(
    a: Float32Array, b: Float32Array, c: Float32Array, n: number,
  ): void {
    for (let i = 0; i < n; i++) {
      const ai = Math.fround(a[i]);
      const bi = Math.fround(b[i]);
      c[i] = Math.fround(Math.hypot(ai, bi));
    }
  }

  /** _vDSP_vdiv @0x1497e12 — element-wise divide: c = b / a  (Apple's arg order). */
  private static vDSP_vdiv(
    a: Float32Array, b: Float32Array, c: Float32Array, n: number,
  ): void {
    for (let i = 0; i < n; i++) {
      c[i] = Math.fround(Math.fround(b[i]) / Math.fround(a[i]));
    }
  }

  /** _vDSP_vsmul @0x1497e30 — scalar multiply: c = a * scalar. */
  private static vDSP_vsmul(
    a: Float32Array, scalar: number, c: Float32Array, n: number,
  ): void {
    const s = Math.fround(scalar);
    for (let i = 0; i < n; i++) c[i] = Math.fround(Math.fround(a[i]) * s);
  }

  /** _vDSP_maxvi @0x1497ddc — max value + index (stride=1). */
  private static vDSP_maxvi(
    a: Float32Array, n: number,
  ): { max: number; index: number } {
    if (n <= 0) return { max: 0, index: 0 };
    let m = Math.fround(a[0]);
    let idx = 0;
    for (let i = 1; i < n; i++) {
      const v = Math.fround(a[i]);
      if (v > m) { m = v; idx = i; }
    }
    return { max: m, index: idx };
  }

  /**
   * dftPhaseCorrelation::dft(int N, float* inRe, float* inIm, float* outRe, float* outIm, int outSize)
   *   @0x1223c00
   *
   * Body decoded literally:
   *   angle_step (base) = -2π * outSize / N        // @0x1223c1f..c33 (-2π = const @0x157d560)
   *   if (outSize == 1):
   *       kLimit = trunc((this->size + 1) * 0.5) = N   // @0x1223c48..c61 (1.0@0x156ca00, 0.5@0x156ca38)
   *       for k in [0,N):
   *          outRe[k] = outIm[k] = 0
   *          for j in [0,N):
   *              if (j < kLimit) {
   *                  (s,c) = sincos(j * k * angle_step)
   *                  outRe[k] += inRe[j] * c              // "single-input" branch: no imag part read
   *                  outIm[k] += inRe[j] * s
   *              }
   *   else:
   *       for k in [0,N):
   *          outRe[k] = outIm[k] = 0
   *          for j in [0,N):
   *              (s,c) = sincos(j * k * angle_step)
   *              outRe[k] += inRe[j]*c - inIm[j]*s
   *              outIm[k] += inRe[j]*s + inIm[j]*c
   *
   *   ___sincos_stret @0x14974e8: returns (sin in xmm0, cos in xmm1). We use Math.sin/cos.
   *   All arithmetic on outRe/outIm is 32-bit float (cvtsd2ss on the sin/cos, then movss).
   */
  dft(
    N: number,
    inRe: Float32Array,
    inIm: Float32Array,
    outRe: Float32Array,
    outIm: Float32Array,
    outSize: number,
  ): void {
    // @0x1223c00: testl %esi,%esi; jle → early-out when N<=0.
    if (N <= 0) return;
    // @0x1223c1f..c33 : angle_step = -2π * outSize / N
    const angleStep = (-2.0 * Math.PI * outSize) / N;
    if (outSize === 1) {
      // @0x1223c48..c61 : kLimit = trunc((this->size + 1) * 0.5)  = N for size=2N-1.
      const kLimit = Math.trunc((this.size + 1.0) * 0.5);
      // @0x1223c6d..d0b : k-loop  (r14 = N, r12 = k)
      for (let k = 0; k < N; k++) {
        outRe[k] = 0;
        outIm[k] = 0;
        const kAngle = k * angleStep;    // @0x1223c8f..c99: kAngle in double
        for (let j = 0; j < N; j++) {
          if (j < kLimit) {              // @0x1223cb8: cmpq rax,r15 / jge skip
            const theta = j * kAngle;    // @0x1223cbd..cc5
            const s = Math.sin(theta);   // ___sincos_stret → xmm0=sin, xmm1=cos
            const c = Math.cos(theta);
            // @0x1223cd9..cee : outRe[k] += inRe[j] * cos(θ) — float32
            const cf = Math.fround(c);
            const sf = Math.fround(s);
            outRe[k] = Math.fround(outRe[k] + Math.fround(inRe[j] * cf));
            outIm[k] = Math.fround(outIm[k] + Math.fround(inRe[j] * sf));
          }
        }
      }
    } else {
      // @0x1223d0d..dcc : full complex-input branch (r12=inIm alias, rbx=outIm).
      for (let k = 0; k < N; k++) {
        outRe[k] = 0;
        outIm[k] = 0;
        const kAngle = k * angleStep;
        for (let j = 0; j < N; j++) {
          const theta = j * kAngle;
          const s = Math.sin(theta);
          const c = Math.cos(theta);
          const cf = Math.fround(c);
          const sf = Math.fround(s);
          // @0x1223d74..d96: outRe[k] += inRe[j]*cos - inIm[j]*sin
          const reIn = Math.fround(inRe[j]);
          const imIn = Math.fround(inIm[j]);
          const dRe = Math.fround(Math.fround(reIn * cf) - Math.fround(imIn * sf));
          outRe[k] = Math.fround(outRe[k] + dRe);
          // @0x1223d9c..db8: outIm[k] += inRe[j]*sin + inIm[j]*cos
          const dIm = Math.fround(Math.fround(imIn * cf) + Math.fround(reIn * sf));
          outIm[k] = Math.fround(outIm[k] + dIm);
        }
      }
    }
  }

  /**
   * dftPhaseCorrelation::idft(int N, float* inRe, float* inIm, float* outRe, float* outIm) @0x1223df0
   *
   * Forward-going angle: angle_step = +2π / N       (const @0x1572558 = +2π, @0x1223e19..e21)
   * Then the naive O(N²) inverse (no 1/N normalization here — that appears elsewhere):
   *     for k in [0,N):
   *        outRe[k] = outIm[k] = 0
   *        for j in [0,N):
   *           (s,c) = sincos(j * k * angle_step)
   *           outRe[k] += inRe[j]*c - inIm[j]*s
   *           outIm[k] += inRe[j]*s + inIm[j]*c
   */
  idft(
    N: number,
    inRe: Float32Array,
    inIm: Float32Array,
    outRe: Float32Array,
    outIm: Float32Array,
  ): void {
    // @0x1223df0: testl %esi,%esi; jle → early-out when N<=0.
    if (N <= 0) return;
    const angleStep = (2.0 * Math.PI) / N;
    for (let k = 0; k < N; k++) {
      outRe[k] = 0;
      outIm[k] = 0;
      const kAngle = k * angleStep;
      for (let j = 0; j < N; j++) {
        const theta = j * kAngle;
        const s = Math.sin(theta);
        const c = Math.cos(theta);
        const cf = Math.fround(c);
        const sf = Math.fround(s);
        const reIn = Math.fround(inRe[j]);
        const imIn = Math.fround(inIm[j]);
        const dRe = Math.fround(Math.fround(reIn * cf) - Math.fround(imIn * sf));
        outRe[k] = Math.fround(outRe[k] + dRe);
        const dIm = Math.fround(Math.fround(imIn * cf) + Math.fround(reIn * sf));
        outIm[k] = Math.fround(outIm[k] + dIm);
      }
    }
  }

  /**
   * dftPhaseCorrelation::rdft(int N, float* in, float* outRe, float* outIm) @0x1223af0
   *
   * Real-input DFT: takes float* in (single array) and produces (outRe, outIm) for N bins.
   * @0x1223b14..b3d :
   *    kLimit = trunc((this->size + 1) * 0.5) = N   (constants @0x156ca00=1.0, @0x156ca38=0.5)
   *    angle_step = -2π / N                          (const @0x157d560=-2π)
   * @0x1223b48..b90 : k-loop over N, j-loop over N with cutoff at kLimit.
   *    outRe[k] += in[j] * cos(j*k*angle_step)
   *    outIm[k] += in[j] * sin(j*k*angle_step)
   */
  rdft(
    N: number,
    inArr: Float32Array,
    outRe: Float32Array,
    outIm: Float32Array,
  ): void {
    // @0x1223b09: testl %esi,%esi ; jle → skip body entirely (no early-return above the epi).
    if (N <= 0) return;
    const kLimit = Math.trunc((this.size + 1.0) * 0.5);
    const angleStep = (-2.0 * Math.PI) / N;
    for (let k = 0; k < N; k++) {
      outRe[k] = 0;
      outIm[k] = 0;
      const kAngle = k * angleStep;
      for (let j = 0; j < N; j++) {
        if (j < kLimit) {
          const theta = j * kAngle;
          const s = Math.sin(theta);
          const c = Math.cos(theta);
          const cf = Math.fround(c);
          const sf = Math.fround(s);
          outRe[k] = Math.fround(outRe[k] + Math.fround(inArr[j] * cf));
          outIm[k] = Math.fround(outIm[k] + Math.fround(inArr[j] * sf));
        }
      }
    }
  }

  /**
   * dftPhaseCorrelation::calculatePhaseCorrelation(float* x, float* y) @0x1223f00
   *
   * @0x1223f24..f81  : vDSP_vclr each of xr,xi,yr,yi,cross for `size` floats.
   * @0x1223f8e..1224072: forward rdft(size, x, xr, xi) inlined (naive O(size²)).
   *                     kLimit = trunc((size+1)/2), angle_step = -2π/size.
   * @0x1224072..122411f: forward rdft(size, y, yr, yi) inlined (same shape).
   * @0x1224122..1224141: vDSP_zvcmul(xr,xi, yr,yi, yr,yi, size)
   *                     → (yr,yi) = (xr,xi) * conjugate(yr,yi)
   * @0x1224146..122416e: vDSP_vclr(xr, size); vDSP_vclr(xi, size)
   * @0x1224172..1224192: vDSP_vdist(yr, yi, xr, size)  → xr = |yr + i*yi|
   * @0x1224197..12241ba: vDSP_vdiv (xr, yr, yr, size)  → yr = yr / xr    (normalize real)
   * @0x12241bf..12241e2: vDSP_vdiv (xr, yi, yi, size)  → yi = yi / xr    (normalize imag)
   * @0x12241e7..1224206: vDSP_vclr(xr, size); vDSP_vclr(xi, size)
   * @0x122420b..12242f6: idft(size, yr, yi, xr, xi) — naive O(size²), angle_step = +2π/size
   *                     writes cross-correlation into (xr, xi). Reads yr as inRe, yi as inIm.
   *                     Note: uses this->xi as the imag out (last arg of the inner loop).
   * @0x12242fc..122430c: xr *= 1.0f / size    (vDSP_vsmul with scalar @0x156ccd0 = 1.0f)
   * @0x1224332..1224358: if (xr != null) vDSP_maxvi(xr, size, &peakIndex, &peakValue)
   *                     else puts("Error: need to make sure you have a good cross-corr…");
   */
  calculatePhaseCorrelation(x: Float32Array, y: Float32Array): void {
    const size = this.size;
    // @0x1223f24..0x1223f81: five vDSP_vclr calls, size floats each.
    dftPhaseCorrelation.vDSP_vclr(this.xr, size);
    dftPhaseCorrelation.vDSP_vclr(this.xi, size);
    dftPhaseCorrelation.vDSP_vclr(this.yr, size);
    dftPhaseCorrelation.vDSP_vclr(this.yi, size);
    dftPhaseCorrelation.vDSP_vclr(this.cross, size);

    // @0x1223f8e..0x1224072: inlined rdft(size, x, xr, xi).
    if (size > 0) {
      const N = size;
      const kLimit = Math.trunc((size + 1.0) * 0.5);
      const angleStep = (-2.0 * Math.PI) / N;
      for (let k = 0; k < N; k++) {
        this.xr[k] = 0;
        this.xi[k] = 0;
        const kAngle = k * angleStep;
        for (let j = 0; j < N; j++) {
          if (j < kLimit) {
            const theta = j * kAngle;
            const cf = Math.fround(Math.cos(theta));
            const sf = Math.fround(Math.sin(theta));
            this.xr[k] = Math.fround(this.xr[k] + Math.fround(x[j] * cf));
            this.xi[k] = Math.fround(this.xi[k] + Math.fround(x[j] * sf));
          }
        }
      }
      // @0x1224072..0x122411f: same for y → (yr, yi).
      for (let k = 0; k < N; k++) {
        this.yr[k] = 0;
        this.yi[k] = 0;
        const kAngle = k * angleStep;
        for (let j = 0; j < N; j++) {
          if (j < kLimit) {
            const theta = j * kAngle;
            const cf = Math.fround(Math.cos(theta));
            const sf = Math.fround(Math.sin(theta));
            this.yr[k] = Math.fround(this.yr[k] + Math.fround(y[j] * cf));
            this.yi[k] = Math.fround(this.yi[k] + Math.fround(y[j] * sf));
          }
        }
      }
    }

    // @0x1224122..0x1224141: (yr,yi) = (xr,xi) * conj(yr,yi).
    dftPhaseCorrelation.vDSP_zvcmul(
      this.xr, this.xi,
      this.yr, this.yi,
      this.yr, this.yi,
      size,
    );

    // @0x1224146..0x122416e: reset xr,xi.
    dftPhaseCorrelation.vDSP_vclr(this.xr, size);
    dftPhaseCorrelation.vDSP_vclr(this.xi, size);

    // @0x1224172..0x1224192: xr = |yr + i*yi|  (magnitude).
    dftPhaseCorrelation.vDSP_vdist(this.yr, this.yi, this.xr, size);

    // @0x1224197..0x12241ba: yr = yr / xr  (element-wise; Apple arg order is (denom, numer, out)).
    dftPhaseCorrelation.vDSP_vdiv(this.xr, this.yr, this.yr, size);
    // @0x12241bf..0x12241e2: yi = yi / xr.
    dftPhaseCorrelation.vDSP_vdiv(this.xr, this.yi, this.yi, size);

    // @0x12241e7..0x1224206: reset xr, xi again.
    dftPhaseCorrelation.vDSP_vclr(this.xr, size);
    dftPhaseCorrelation.vDSP_vclr(this.xi, size);

    // @0x122420b..0x12242f6: inlined idft(size, yr, yi, xr, xi).
    if (size > 0) {
      const N = size;
      const angleStep = (2.0 * Math.PI) / N;
      for (let k = 0; k < N; k++) {
        this.xr[k] = 0;
        this.xi[k] = 0;
        const kAngle = k * angleStep;
        for (let j = 0; j < N; j++) {
          const theta = j * kAngle;
          const cf = Math.fround(Math.cos(theta));
          const sf = Math.fround(Math.sin(theta));
          const yrj = Math.fround(this.yr[j]);
          const yij = Math.fround(this.yi[j]);
          const dRe = Math.fround(Math.fround(yrj * cf) - Math.fround(yij * sf));
          this.xr[k] = Math.fround(this.xr[k] + dRe);
          const dIm = Math.fround(Math.fround(yij * cf) + Math.fround(yrj * sf));
          this.xi[k] = Math.fround(this.xi[k] + dIm);
        }
      }
    }

    // @0x12242fc..0x122430c: scalar = 1.0f / size ; xr *= scalar. (const @0x156ccd0 = 1.0f)
    // Note: even though scalar is 1.0/size, the disasm literally loads 1.0f and divides by size
    // as an ss operation, so we preserve that single-precision reciprocal.
    const scalar = Math.fround(Math.fround(1.0) / Math.fround(size));
    dftPhaseCorrelation.vDSP_vsmul(this.xr, scalar, this.xr, size);

    // @0x1224332..0x1224358: if (this->xr != null) vDSP_maxvi(this->xr, size, &peakIdx, &peakVal)
    //                       else puts("Error: need to make sure you have a good cross-corr…").
    if (this.xr.length > 0) {
      const { max, index } = dftPhaseCorrelation.vDSP_maxvi(this.xr, size);
      this.peakIndex = index;
      this.peakValue = Math.fround(max);
    } else {
      // @0x122435a..0x1224361: puts("Error: need to make sure you have a good cross-corr function before attempting to retrieve is peak")
      // In the port we surface the same diagnostic; no side effect on state.
       
      console.log("Error: need to make sure you have a good cross-corr function before attempting to retrieve is peak");
    }
  }

  /**
   * dftPhaseCorrelation::computeConfidence(EFFCorrelationDataType) @0x1224380
   *
   * The enum argument is unused inside the function body (rsi never read after entry).
   * Body:
   *   @0x1224391..0x12243e8:
   *      N = this->size (0x48)
   *      if (N > 0):
   *          bufA = new float[N]; memcpy(bufA, this->xr (+0x8), 4N)      // clone cross-corr
   *          bufB = new float[N]; memcpy(bufB, this->xr,          4N)
   *      else:
   *          bufA = bufB = null
   *          puts(" **** Error:  invalid vector length - median statistics") — see note below
   *
   *      NB: the "invalid vector length" puts is emitted from the N<=0 arm at @0x12243dc..e3,
   *      AND unconditionally at @0x1224542..0x1224549 after the second sort (that latter puts is a
   *      "printf('log')"-style trace that fires every call — a debug leftover in Apple's build).
   *
   *   @0x12243ef..0x12243fa: std::__sort(bufB, bufB + N)
   *   @0x12243ff..0x122440b: m1 = ((N - 1) + sign(N-1))/2 - 1 ; wait:
   *        leal -0x1(%r14),%eax    ; eax = N-1
   *        shrl $0x1f,%eax         ; eax = (uint32(N-1) >> 31) i.e. 1 if N==0 else 0 for N>=1
   *        addl %r14d,%eax         ; eax = N + sign_fix
   *        decl %eax               ; eax = N + sign_fix - 1
   *        sarl %eax               ; eax = (N + sign_fix - 1) >> 1  (arithmetic)
   *      For N>=1, sign_fix = 0 so eax = (N-1) >> 1 = floor((N-1)/2). Call this m1.
   *   @0x1224417..0x122441a: r13 = N >> 1 (unsigned shr on N). Call this m2.
   *   @0x1224411..0x122441d: median1 = bufB[m1] + bufB[m2]  (kept in xmm0 stored to -0x50).
   *   @0x1224427..0x122442a: delete[] bufB (first sorted copy freed).
   *
   *   @0x122442f..0x12244d5:
   *      allocate bufC = new float[N]
   *      bufC[i] = bufA[i] - median1 * 0.5f     // @0x122444b mulss 0.5f (@0x156ccd8)
   *                                             // Note: median1 = bufB[m1]+bufB[m2], so
   *                                             // median1 * 0.5 = (bufB[m1]+bufB[m2]) / 2
   *                                             // → the true median of the sorted copy.
   *      (SSE vectorized 8-wide + scalar tail — behaviourally simple loop.)
   *
   *   @0x12244d7..0x1224540:
   *      allocate bufD = new float[N]
   *      bufD[i] = |bufC[i]|                    // @0x12244f6 andps abs-mask (@0x156cdb0=0x7fffffff×4)
   *                                             // (i.e. abs of the mean-deviated array)
   *
   *   @0x1224542..0x1224549: puts(" **** Error:  invalid vector length - median statistics")
   *                          (unconditional debug log — Apple ships it).
   *
   *   @0x122454e..0x1224559: std::__sort(bufD, bufD + N)
   *   @0x122455e..0x1224573: madSum = bufD[m1] + bufD[m2]   (median of the abs-deviations *2)
   *
   *   @0x1224578..0x122458d: delete[] bufC
   *   @0x122458d..0x12245ad: peakValue (this->0x38 = Correlation::peakValue) reloaded into xmm1,
   *                          delete[] bufD, delete[] bufA on the way.
   *
   *   @0x12245ad..0x12245cf:
   *      threshold = ((bufD[m1] + bufD[m2]) * 0.5f)                    // median-abs-dev
   *                  → to double
   *                  * 1.4826                                          // MAD → σ scaling const @0x1581920
   *      threshold += threshold                                        // ×2 (addsd xmm0,xmm0)
   *      threshold /= 0.04                                             // (@0x157bb48 = 0.04)
   *
   *   @0x12245db..0x12245ef: if ((double)peakValue > threshold) return 1.0f; else return 0.0f.
   *      (movss @0x156ccd0 = 1.0f loaded on the true branch; xorpd on the false.)
   *
   * @param _dataType — the EFFCorrelationDataType arg (ignored by the FCP body).
   * @returns confidence — 1.0f iff the correlation peak stands ≥ 2·1.4826·MAD/0.04 above the median.
   */
  computeConfidence(_dataType: number): number {
    const N = this.size;

    // @0x1224391..0x12243e8: allocate and memcpy two working buffers of the cross-corr result.
    // The cross-corr array is at 0x8(this) = this.xr (post-calculatePhaseCorrelation).
    let bufA: Float32Array;
    let bufB: Float32Array;
    if (N > 0) {
      bufA = new Float32Array(N);
      bufA.set(this.xr.subarray(0, N));
      bufB = new Float32Array(N);
      bufB.set(this.xr.subarray(0, N));
    } else {
      // @0x12243dc..0x12243e3 : puts(" **** Error:  invalid vector length - median statistics")
       
      console.log(" **** Error:  invalid vector length - median statistics");
      bufA = new Float32Array(0);
      bufB = new Float32Array(0);
    }

    // @0x12243ef..0x12243fa: std::sort(bufB..bufB+N) ascending.
    // std::__sort with __less<float,float> is a strict-weak-order sort using operator<.
    // JS sort with (a,b)=>a-b is IEEE-consistent for finite floats used here.
    // NB: NaN would be UB in C++ std::sort; the FCP data path never produces NaN here
    // (rdft/idft of finite input → finite output, and the /|xr| step is guarded by the
    // vector's own magnitude being ≥ 0).
    const bufBArr = Array.from(bufB);
    bufBArr.sort((a, b) => a - b);
    for (let i = 0; i < N; i++) bufB[i] = bufBArr[i];

    // @0x12243ff..0x122441a: m1, m2 indices as decoded above.
    const m1 = (N - 1) >> 1;             // arithmetic shift for N>=1: floor((N-1)/2)
    const m2 = N >>> 1;                  // logical shift for N>=1: floor(N/2)
    // @0x1224411..0x122441d : median1Sum = bufB[m1] + bufB[m2] (both single-precision)
    const median1Sum = N > 0
      ? Math.fround(Math.fround(bufB[m1]) + Math.fround(bufB[m2]))
      : 0;

    // @0x1224427..0x122442a: delete[] bufB — JS handles GC.

    // @0x122442f..0x12244d5: bufC[i] = bufA[i] - 0.5f * median1Sum (i.e., mean of two middles).
    // Note the disasm multiplies median1Sum by 0.5f FIRST (splat), then subtracts from each.
    let bufC: Float32Array;
    if (N > 0) {
      bufC = new Float32Array(N);
      const half = Math.fround(Math.fround(0.5) * median1Sum); // @0x122444b mulss 0.5f
      for (let i = 0; i < N; i++) {
        bufC[i] = Math.fround(Math.fround(bufA[i]) - half);
      }
    } else {
      bufC = new Float32Array(0);
    }

    // @0x12244d7..0x1224540: bufD[i] = |bufC[i]| (SSE andps with 0x7fffffff mask).
    let bufD: Float32Array;
    if (N > 0) {
      bufD = new Float32Array(N);
      for (let i = 0; i < N; i++) {
        // faithful "clear sign bit" — Math.abs is bit-identical to andps on non-NaN.
        bufD[i] = Math.fround(Math.abs(bufC[i]));
      }
    } else {
      bufD = new Float32Array(0);
    }

    // @0x1224542..0x1224549: unconditional puts (Apple's debug leftover, kept faithful).
     
    console.log(" **** Error:  invalid vector length - median statistics");

    // @0x122454e..0x1224559: sort bufD ascending.
    const bufDArr = Array.from(bufD);
    bufDArr.sort((a, b) => a - b);
    for (let i = 0; i < N; i++) bufD[i] = bufDArr[i];

    // @0x122455e..0x1224573: mad2 = bufD[m1] + bufD[m2]   (= 2·median of abs-dev)
    const mad2 = N > 0
      ? Math.fround(Math.fround(bufD[m1]) + Math.fround(bufD[m2]))
      : 0;

    // @0x122458d..0x12245ad: reload peakValue (this->0x38) into xmm1 (single-precision).
    const peakVal = Math.fround(this.peakValue);

    // @0x12245ad..0x12245cf: threshold construction.
    //   xmm0 = mad2 * 0.5f            (single-prec, @0x12245b7 mulss 0.5f @0x156ccd8)
    //   xmm0 = (double) xmm0
    //   xmm0 *= 1.4826               (@0x12245c3 mulsd @0x1581920)
    //   xmm0 += xmm0                 (@0x12245cb addsd — doubles it → 2× MAD·1.4826)
    //   xmm0 /= 0.04                 (@0x12245cf divsd @0x157bb48)
    const madMedian = Math.fround(Math.fround(mad2) * Math.fround(0.5));
    let threshold = madMedian;          // still single-prec before promotion
    // faithfully promote to double for the subsequent double-precision arithmetic:
    threshold = threshold * 1.4826;     // double math
    threshold = threshold + threshold;  // ×2
    threshold = threshold / 0.04;

    // @0x12245db..0x12245ef: return (peakVal > threshold) ? 1.0f : 0.0f.
    // ucomisd + ja  → this is an ORDERED greater-than that FALLs THROUGH to 0.0 on
    // unordered (NaN) or not-greater. movss @0x156ccd0 = 1.0f on true.
    return (peakVal > threshold) ? Math.fround(1.0) : Math.fround(0.0);
  }
}

