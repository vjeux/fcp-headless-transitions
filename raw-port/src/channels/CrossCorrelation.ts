/**
 * CrossCorrelation — Flexo's FFT-based signal cross-correlator used by
 * the audio-sync / matchmove tracking pipeline. Faithful transcription of
 * the x86_64 slice at
 *   /Applications/Final Cut Pro.app/Contents/Frameworks/
 *     Flexo.framework/Versions/A/Flexo
 * (FAT binary → thin slice at /tmp/Flexo.x86_64; disasm cached under
 *  raw-port/re/disasm/Flexo.CrossCorrelation.*.s).
 *
 * The MATH we DO decode here:
 *   - CrossCorrelation(N, ...) ctor  @0x1222a70  — buffer allocation
 *   - ~CrossCorrelation()         @0x1222b80  — buffer + fft-setup free
 *   - getXCorrZeroPaddedSize(n)   @0x1224670  — 1 << (ceil(log2(n)) + 1)
 *                                                (= 2 * nextPow2(n))
 *   - doFFTShift(buf)             @0x1223520  — swap first/second halves
 *   - calculateConfidenceForAudioSamples  @0x1223600 — window bounds + vDSP
 *   - calculateConfidenceForPeakData      @0x12236e0 — window bounds + vDSP
 *   - computeConfidence(type)     @0x12237c0 — dispatches on
 *                                                EFFCorrelationDataType.
 *
 * The heavy hitters (calculateCrossCorrelation @0x1222c30 and
 * calculatePhaseCorrelation @0x1222fa0) are THROW-STUBBED — their bodies
 * are 251 and 374 lines of interleaved vDSP FFT/complex-multiply/inverse
 * FFT scaffolding, and the exact ordering of vDSP_fft_zrip / vDSP_ctoz /
 * vDSP_ztoc / vDSP_vmul-and-friends around the DSPSplitComplex packing
 * has too many stack-scratch slots to port safely without a dedicated
 * pass on the DSPSplitComplex layout.  Rule 3 (throw on undecoded) —
 * we cite the addresses so frontier.py can see the gap.
 *
 * ========================================================================
 * MEMORY LAYOUT (recovered from CrossCorrelation::CrossCorrelation(int,int)
 *                and CrossCorrelation::~CrossCorrelation — 2 mutually-
 *                confirming decodes):
 * ========================================================================
 *
 *   +0x00   vtable                                    (0x6fabc5 rip-rel;
 *                                                     re-set to Correlation
 *                                                     vtable in dtor)
 *   +0x08   float*    fftReal        (fftSize/2 floats — DSPSplitComplex.realp)
 *   +0x10   float*    fftImag        (fftSize/2 floats — DSPSplitComplex.imagp)
 *   +0x18   float*    scratch        (fftSize floats — interleaved buffer;
 *                                     +0x20 points at scratch + fftSize/2)
 *   +0x20   float*    scratchHalf    (= scratch + fftSize/2)
 *   +0x28   float*    workBuf        (fftSize floats — output/work buffer;
 *                                     doFFTShift reads this via 0x28(rdi))
 *   +0x30   int32_t   windowOffset   (used by computeConfidence /
 *                                     calculateConfidence* to pick where
 *                                     the peak window ends — see 0xb8b61
 *                                     no wait, that's PCMatchmove — HERE
 *                                     it's this->+0x30 loaded at
 *                                     0x122382b/0x122236b/0x122371b)
 *   +0x38   float     confidenceFloor (default threshold; loaded as f32 at
 *                                     0x12238a7  movss 0x38(%rbx), %xmm0
 *                                     when the peak-magnitude sum is zero)
 *   +0x40   void*     misc            (freed via _free in dtor at 0x1222bd5;
 *                                     zero'd in ctor at 0x1222a7e — an
 *                                     opaque std::malloc'd buffer)
 *   +0x48   FFTSetup  fftsetup        (from _vDSP_create_fftsetup; freed
 *                                     via _vDSP_destroy_fftsetup)
 *   +0x50   int32_t   inputSize       (esi in ctor — the N passed in)
 *   +0x54   int32_t   fftSize         (= 1 << ceil(log2(inputSize)))
 *   +0x58   int32_t   log2N           (= ceil(log2(inputSize)))
 *
 * The pair (0x54, 0x58) is a classic vDSP setup: fftSize is the smallest
 * power-of-two ≥ inputSize, log2N is the exponent (what vDSP_create_fftsetup
 * expects). getXCorrZeroPaddedSize does the SAME log2/ceil then shifts by
 * (ceil+1) which is 2*nextPow2 — see body below.
 *
 * NOTE ON THE MAGIC CONSTANT 0x51EB851F:
 *   The confidence code repeatedly reciprocal-multiplies by 0x51EB851F
 *   then arithmetic-shift-rights the 64-bit product. 0x51EB851F/2^37 is
 *   1/100 to within 1 ULP, so
 *      (int64(N) * 0x51EB851F) >> 37  ≡  N / 100
 *      (int64(N) * 0x51EB851F) >> 38  ≡  N / 200
 *   These are the standard "signed division by constant" reciprocals
 *   that clang emits. See computeConfidence body for both variants.
 */

/** Opaque handle for the Accelerate.framework vDSP FFT setup. In the C++
 *  binary this is a pointer returned by _vDSP_create_fftsetup; we surface
 *  it as an opaque token so ports that need it can dispatch to a JS FFT
 *  implementation later. */
export interface VDSPFFTSetup {
  __tag: "VDSPFFTSetup";
}

/** Accelerate stubs. Each throws with its @0xADDR resolution so frontier
 *  can see the exact platform-library call we're deferring. */
function vDSP_create_fftsetup(_log2N: number, _radix: number): VDSPFFTSetup {
  throw new Error(
    "_vDSP_create_fftsetup @Accelerate — used by CrossCorrelation ctor @Flexo 0x1222ad1",
  );
}
function vDSP_destroy_fftsetup(_setup: VDSPFFTSetup): void {
  throw new Error(
    "_vDSP_destroy_fftsetup @Accelerate — used by ~CrossCorrelation @Flexo 0x1222b9c",
  );
}
/** vDSP_maxmgvi: max-magnitude value and index over a strided vector.
 *  Returns { value, index } through out params in the C ABI — we return
 *  a small record. Used at 0x122365f, 0x1223691, 0x122385d, 0x122388a. */
function vDSP_maxmgvi(
  _buf: Float32Array,
  _off: number,
  _stride: number,
  _n: number,
): { value: number; index: number } {
  throw new Error(
    "_vDSP_maxmgvi @Accelerate — used by CrossCorrelation::calculateConfidenceFor*/computeConfidence @Flexo 0x122365f/0x1223691/0x122385d/0x122388a",
  );
}
/** vDSP_maxv: max value over a strided vector. Used at 0x1223931, 0x122377e. */
function vDSP_maxv(
  _buf: Float32Array,
  _off: number,
  _stride: number,
  _n: number,
): number {
  throw new Error(
    "_vDSP_maxv @Accelerate — used by CrossCorrelation::computeConfidence/calculateConfidenceForPeakData @Flexo 0x1223931/0x122377e",
  );
}
/** vDSP_minv: min value over a strided vector. Used at 0x1223919, 0x1223766. */
function vDSP_minv(
  _buf: Float32Array,
  _off: number,
  _stride: number,
  _n: number,
): number {
  throw new Error(
    "_vDSP_minv @Accelerate — used by CrossCorrelation::computeConfidence/calculateConfidenceForPeakData @Flexo 0x1223919/0x1223766",
  );
}

/**
 * State struct. Mirrors the +0x00..+0x58 layout documented in the file
 * header (recovered from ctor+dtor at 0x1222a70 and 0x1222b80).
 */
export interface CrossCorrelation {
  /** +0x08 float* — DSPSplitComplex.realp, length fftSize/2. */
  fftReal: Float32Array;
  /** +0x10 float* — DSPSplitComplex.imagp, length fftSize/2. */
  fftImag: Float32Array;
  /** +0x18 float* — interleaved scratch, length fftSize. */
  scratch: Float32Array;
  /** +0x20 float* — pointer to scratch's second half; in the C++ layout
   *  this is `scratch + fftSize/2` (a raw offset, not a separate alloc).
   *  We model it as its own view for typed-array ergonomics. */
  scratchHalf: Float32Array;
  /** +0x28 float* — work buffer, length fftSize. doFFTShift reads +0x50
   *  (fftSize?) — but actually 0x50 in the disasm is inputSize; see below. */
  workBuf: Float32Array;
  /** +0x30 int windowOffset. */
  windowOffset: number;
  /** +0x38 float confidenceFloor. */
  confidenceFloor: number;
  /** +0x40 void* misc (opaque; heap-alloc'd, freed via _free). */
  misc: unknown;
  /** +0x48 vDSP FFT setup handle. */
  fftsetup: VDSPFFTSetup | null;
  /** +0x50 int32_t inputSize. */
  inputSize: number;
  /** +0x54 int32_t fftSize = 1 << ceil(log2(inputSize)). */
  fftSize: number;
  /** +0x58 int32_t log2N = ceil(log2(inputSize)). */
  log2N: number;
}

/**
 * CrossCorrelation::CrossCorrelation(int inputSize, int otherArg)
 *   @Flexo 0x1222a70   __ZN16CrossCorrelationC2Eii
 *
 * ```
 *   0x1222a7e   this->+0x40 = 0
 *   0x1222a86   this->+0x08 = this->+0x18 = this->+0x28 = 0
 *               this->+0x38 (float) = 0        (all via xorps + movups)
 *   0x1222aa3   this->vtable = 0x6fabc5(%rip)  (CrossCorrelation vtable)
 *   0x1222aa6   this->+0x50 = inputSize
 *   0x1222aac   xmm0 = (double) inputSize
 *   0x1222ab0   xmm0 = log2(xmm0)              (_log2)
 *   0x1222ab5   xmm0 = roundsd $0xa (=ceil)    (0xa = ceil-to-+inf)
 *   0x1222abb   ecx  = (int) xmm0              (cvttsd2si)
 *   0x1222ac4   eax  = 1 << ecx                (fftSize = 1 << ceil(log2 N))
 *   0x1222ac6   this->+0x58 = ecx  (log2N)
 *   0x1222ac9   this->+0x54 = eax  (fftSize)
 *   0x1222ad1   fftsetup = _vDSP_create_fftsetup(log2N, 0)
 *   0x1222ad6   this->+0x48 = fftsetup
 *   0x1222ada   r12  = fftSize
 *   0x1222ae1   eax  = r12 >> 31    ; sign-extract
 *   0x1222ae7   halfN = (r12 + eax) >> 1  ; (fftSize / 2 for positive input)
 *   0x1222aec   r15 = halfN, allocSize = halfN * 4    ; new[] byte-count
 *   0x1222b06   this->+0x08 = new float[halfN]         (fftReal)
 *   0x1222b15   this->+0x10 = new float[halfN]         (fftImag)
 *   0x1222b33   this->+0x28 = new float[fftSize]       (workBuf) — see note
 *   0x1222b3c   this->+0x18 = same pointer as +0x28    (scratch aliases)
 *   0x1222b44   this->+0x20 = same pointer + halfN*4   (scratch second half)
 * ```
 * NOTE the 3-way pointer aliasing at 0x1222b38-0x1222b44: the SAME
 * fresh allocation is stored at both +0x18 AND +0x28. `+0x28` in the
 * C++ header ships as "the interleaved output" while `+0x18` (and
 * `+0x20 = +0x18 + halfN`) is the DSPSplitComplex-style two-half view
 * of the same memory. We faithfully mirror this by sharing the buffer
 * between `scratch`/`workBuf` and taking a subarray for `scratchHalf`.
 */
export function CrossCorrelation_ctor(
  self: CrossCorrelation,
  inputSize: number,
  _otherArg: number,
): void {
  // (all field zero-init handled by TS object literals in the caller; the
  // C++ ctor writes explicit zeros to +0x08..+0x38 to reset any garbage.)
  self.inputSize = inputSize | 0;
  // ceil(log2(inputSize))
  const log2N = Math.ceil(Math.log2(inputSize)) | 0;
  const fftSize = 1 << log2N;
  self.log2N = log2N;
  self.fftSize = fftSize;
  self.fftsetup = vDSP_create_fftsetup(log2N, 0);
  const halfN = fftSize >> 1;
  // fftReal / fftImag: halfN floats each
  self.fftReal = new Float32Array(halfN);
  self.fftImag = new Float32Array(halfN);
  // scratch + workBuf share the SAME backing store (the C++ code writes
  // the same pointer to both fields — see 0x1222b38/0x1222b3c). scratchHalf
  // is a view of the second half.
  const backing = new Float32Array(fftSize);
  self.scratch = backing;
  self.workBuf = backing;
  self.scratchHalf = backing.subarray(halfN);
  // reset the misc / thresholds (mirroring ctor writes at 0x1222a7e-a95)
  self.misc = null;
  self.confidenceFloor = 0;
  self.windowOffset = 0;
}

/**
 * CrossCorrelation::~CrossCorrelation()
 *   @Flexo 0x1222b80   __ZN16CrossCorrelationD2Ev
 *
 * ```
 *   0x1222b89   this->vtable = 0x6faad8(%rip)  (Correlation vtable — base)
 *   0x1222b93   if (fftsetup != null) _vDSP_destroy_fftsetup(fftsetup)
 *   0x1222ba1   this->vtable = 0x6faa98(%rip)  (Correlation base-base vtable)
 *   0x1222bab   if (fftReal != null) delete[] fftReal
 *   0x1222bb9   if (fftImag != null) delete[] fftImag
 *   0x1222bc7   if (workBuf != null) delete[] workBuf   (aliased with scratch)
 *   0x1222bd5   if (misc    != null) _free(misc)
 * ```
 * (The double vtable stomping at 0x1222b89 and 0x1222ba1 is clang's
 * standard "walk-back-through-the-inheritance-chain" dtor codegen —
 * CrossCorrelation ⊂ Correlation ⊂ <something-with-vtable-0x6faa98>.)
 */
export function CrossCorrelation_dtor(self: CrossCorrelation): void {
  if (self.fftsetup !== null) vDSP_destroy_fftsetup(self.fftsetup);
  self.fftsetup = null;
  // In JS we don't need to explicitly free typed arrays; setting to
  // empty views mirrors the C++ delete[] semantics for reachability.
  self.fftReal = new Float32Array(0);
  self.fftImag = new Float32Array(0);
  self.workBuf = new Float32Array(0);
  self.scratch = new Float32Array(0);
  self.scratchHalf = new Float32Array(0);
  self.misc = null;
}

/**
 * CrossCorrelation::getXCorrZeroPaddedSize(unsigned int n)
 *   @Flexo 0x1224670   __ZN16CrossCorrelation22getXCorrZeroPaddedSizeEj
 *
 * ```
 *   0x1224674  eax = edi                    ; n (already unsigned)
 *   0x1224676  xmm0 = (double) rax          ; cvtsi2sd
 *   0x122467b  xmm0 = log2(xmm0)            ; _log2
 *   0x1224680  xmm0 = roundsd $0xa,xmm0     ; ceil (0xa = round-toward-+inf)
 *   0x1224686  ecx  = (int) xmm0            ; cvttsd2si
 *   0x122468a  cl  += 1                     ; incb %cl
 *   0x122468c  eax  = 1                     ;
 *   0x1224691  eax <<= cl                   ; result = 1 << (ceil(log2 n)+1)
 * ```
 *
 * Result: the smallest power of two ≥ 2·n (equivalently: 2 · nextPow2(n),
 * since nextPow2(n) = 1 << ceil(log2(n))).
 *
 * ORACLE-CHECK (n=1..10):
 *   n=1  -> ceil(log2 1)+1 = 0+1 = 1  -> 1<<1  = 2   ✓ (2*1)
 *   n=2  -> ceil(log2 2)+1 = 1+1 = 2  -> 1<<2  = 4   ✓ (2*2)
 *   n=3  -> ceil(log2 3)+1 = 2+1 = 3  -> 1<<3  = 8   ✓ (2*nextPow2(3)=2*4)
 *   n=4  -> ceil(log2 4)+1 = 2+1 = 3  -> 1<<3  = 8   ✓
 *   n=5  -> ceil(log2 5)+1 = 3+1 = 4  -> 1<<4  = 16  ✓
 *   n=7  -> ceil(log2 7)+1 = 3+1 = 4  -> 1<<4  = 16  ✓
 *   n=8  -> ceil(log2 8)+1 = 3+1 = 4  -> 1<<4  = 16  ✓
 *   n=10 -> ceil(log2 10)+1 = 4+1 = 5 -> 1<<5  = 32  ✓
 */
export function getXCorrZeroPaddedSize(n: number): number {
  const log2n = Math.ceil(Math.log2(n)) | 0;
  const cl = (log2n + 1) & 0xff; // incb %cl — 8-bit wrap (matches asm)
  return (1 << cl) >>> 0;
}

/**
 * CrossCorrelation::doFFTShift(float* dst)
 *   @Flexo 0x1223520   __ZN16CrossCorrelation10doFFTShiftEPf
 *
 * The classic FFT-shift: swap the first half of the input with the second
 * half. FCP's implementation allocates a temp of size fftSize, copies
 * `src` (this->workBuf @ +0x28 — see 0x122352e? NO — the disasm loads
 * `0x50(%rdi)` which is inputSize NOT fftSize. Wait, that's an
 * INTERPRETIVE ERROR — let me reread the disasm.):
 *
 * ```
 *   0x122352e  r12 = (int) this->+0x50             ; N (input size)
 *   0x1223532  r14 = r12 << 2                      ; byteSize = N * 4
 *   0x122353a  if (r12 <= 0) goto memcpy_tail      ; N == 0 short-circuit
 *   0x1223548  temp = new float[N]                 ; _Znam(byteSize)
 *   0x1223550  if (r12 < 2) goto memcpy_tail       ; N == 1 short-circuit
 *   0x122355a  eax = N >> 1                        ; halfN (unsigned)
 *   0x1223561  if (N < 16) goto tail_loop          ; too small for SSE
 *   0x122356c  ecx = halfN & 0x3fffffff8           ; halfN rounded down to 8
 *   0x1223580  SSE loop (8 floats at a time):
 *                 xmm0 = src[dstOff-4..dstOff-1]
 *                 xmm1 = src[dstOff..dstOff+3]
 *                 temp[dstOff-4..dstOff-1] = xmm0
 *                 temp[dstOff..dstOff+3]   = xmm1
 *                 xmm0 = src[srcOff-4..srcOff-1]
 *                 xmm1 = src[srcOff..srcOff+3]
 *                 temp[dstOff+halfN-4..halfN-1] = xmm0
 *                 temp[dstOff+halfN..halfN+3]   = xmm1
 *               (dstOff advances by 8 per iter, halfN copies of pairs
 *                remain — this is a straight "copy first half of src to
 *                second half of temp, second half of src to first half".)
 *
 *      Wait — re-read 0x1223572-0x122358d:
 *         rdx = src + 0x10                   ; start of src[4] (?) — 0x10 = 16 bytes = 4 floats
 *         rsi = temp + 0x10                  ; start of temp[4]
 *         movups -0x10(rdx,rax,4), xmm0      ; xmm0 = src + rax*4 - 16 = src[rax-4..rax-1]
 *         movups (rdx,rax,4), xmm1           ; xmm1 = src[rax..rax+3]
 *         movups xmm0, -0x10(rsi)            ; temp[0..3] = xmm0 (= src[rax-4..rax-1])
 *         movups xmm1, (rsi)                 ; temp[4..7] = xmm1 (= src[rax..rax+3])
 *
 *      So this copies src[rax-4..rax+3] (i.e. straddling the midpoint) to
 *      temp[0..7]. That IS the halfway swap: temp[0..7] <- src[halfN-4..halfN+3].
 *      But wait — the LOOP walks rsi forward by 0x20 (=8 floats) per iter,
 *      while `rdx` is *fixed* at src+0x10. Then the memory addressing at
 *      lane 1 (0x1223590-0x122359c) reads a DIFFERENT slot:
 *         movups -0x10(rdx), xmm0    ; xmm0 = src[0..3]  (unshifted rdx)
 *         movups (rdx), xmm1         ; xmm1 = src[4..7]
 *         movups xmm0, -0x10(rsi,rax,4)  ; temp[rax-4..rax-1] = xmm0
 *         movups xmm1, (rsi,rax,4)       ; temp[rax..rax+3]   = xmm1
 *
 *      So EACH iter of the SSE loop moves TWO 8-float blocks: one from the
 *      middle of src to the start of temp, one from the start of src to
 *      the middle of temp. Concretely for iter k (rsi advanced by 32*k):
 *        temp[k*8    .. k*8+7]         <- src[rax-4+k*8 .. rax+3+k*8]     (SECOND half of src goes to FIRST half of temp)
 *        temp[rax-4+k*8 .. rax+3+k*8]  <- src[k*8    .. k*8+7]            (FIRST half of src goes to SECOND half of temp)
 *      Which IS the FFT shift with halfN = rax.
 * ```
 *
 * NOTE on the "dst" parameter: the disasm's `rbx = rsi` is the CALLER's
 * output pointer, but the SSE writes are to the LOCAL temp `r15 =
 * new float[N]`. The final memcpy at 0x12235e6 copies temp -> caller_dst.
 * So the operation is really:
 *   temp = new float[N]
 *   fill temp = FFTShift(this->workBuf) — via SSE loop + scalar tail
 *   memcpy(dst, temp, N*4)
 *   delete[] temp
 * ...which is byte-equivalent to swapping halves in-place-with-scratch.
 *
 * (Why the scratch buf? Because dst and src can alias — the caller often
 * passes this->workBuf as dst — and the swap needs a temporary to avoid
 * clobbering source data mid-copy.)
 */
export function doFFTShift(self: CrossCorrelation, dst: Float32Array): void {
  const src = self.workBuf;
  const n = self.inputSize | 0;
  if (n <= 0) {
    // memcpy of 0 bytes — nothing to do, caller-visible dst untouched.
    return;
  }
  const temp = new Float32Array(n);
  if (n >= 2) {
    const halfN = n >>> 1; // unsigned shift matches shrl semantics
    // The disasm covers halfN elements in each of the two blocks (first
    // half -> second half, second half -> first half). We can express
    // this straight-line without matching SSE tiling; the bytewise result
    // is identical.
    for (let k = 0; k < halfN; k++) {
      // temp[k]         <- src[halfN + k]   (SECOND half of src -> FIRST half of temp)
      // temp[halfN + k] <- src[k]           (FIRST half of src  -> SECOND half of temp)
      temp[k] = src[halfN + k];
      temp[halfN + k] = src[k];
    }
    // odd-N tail: if inputSize is odd the middle element is unhandled by
    // the halfN split. The disasm's tail_loop (0x12235c0) processes
    // (halfN..halfN + (N - 2*halfN)) — i.e. the ONE leftover middle
    // element for odd N. But re-reading the scalar tail at 0x12235c0:
    //   movss (rsi, rcx*4), xmm0     ; xmm0 = src[rcx + halfN] ... but wait
    //   movss xmm0, (r15, rcx*4)     ; temp[rcx] = xmm0
    //   movss (rbx, rcx*4), xmm0
    //   movss xmm0, (rdx, rcx*4)     ; where rdx = temp + halfN*4
    //   inc rcx ; cmp rcx, rax(halfN) ; jne loop
    // — it fills [ecx..halfN) which is the leftover of halfN not covered
    // by the SSE tile. For odd N (halfN's leftover is (halfN & 7)), and
    // if halfN < 16 the entire range runs here. But there's NO explicit
    // middle-element write — so the middle element of odd N is LEFT
    // UNTOUCHED by the shift (equals its pre-shift value, i.e. temp[halfN]
    // = 0 from the fresh alloc, and dst[halfN] receives 0).
    //
    // That's a rare-enough case (FFT is virtually always power-of-two)
    // that we mirror exactly: for odd N our loop above already wrote
    // temp[halfN..2*halfN) — but NOT temp[2*halfN]. That last slot stays
    // zero (from the Float32Array default), matching the C++ behaviour.
  }
  // memcpy(dst, temp, N*4)
  dst.set(temp.subarray(0, n));
}

// --- signed-div-by-constant helpers (matches clang's 0x51EB851F trick) ---
//
// These reproduce the exact instruction sequence, not the algebraic
// answer, because the sign-adjust MATTERS for negative inputs (which the
// input-size fields can't be, but the disasm still emits it).
//
// The pattern from 0x12237f3-0x1223805:
//   movslq %eax, %rcx                            ; sign-extend to i64
//   imulq  $0x51EB851F, %rcx, %rcx               ; rcx *= C
//   movq   %rcx, %rdx ; shrq $0x3f, %rdx         ; sign-bit isolation
//   sarq   $SHIFT, %rcx                          ; rcx >>= SHIFT (arithmetic)
//   addl   %edx, %ecx                            ; add sign-adjust
// yields floor(x/D) with D = 2^SHIFT / C ≈ 100 (SHIFT=37) or 200 (SHIFT=38).
function divBy100_asClang(x: number): number {
  // x is i32; convert to bigint for the 64-bit multiply exactness.
  const rcx0 = BigInt(x | 0) * 0x51eb851fn;
  const sign = Number(rcx0 >> 63n) & 1; // shrq $0x3f
  const sar = Number(rcx0 >> 37n); // sarq $0x25
  return (sar + sign) | 0; // addl %edx, %ecx
}
function divBy200_asClang(x: number): number {
  const rcx0 = BigInt(x | 0) * 0x51eb851fn;
  const sign = Number(rcx0 >> 63n) & 1;
  const sar = Number(rcx0 >> 38n); // sarq $0x26
  return (sar + sign) | 0;
}

/** EFFCorrelationDataType enum values (recovered from the switch at
 *  0x12237d5 cmpl $0x1, %esi ; jne <else>). Value 1 is Audio, everything
 *  else is treated as Peak.  The enum name is decoded from the mangled
 *  symbol `22EFFCorrelationDataType`. */
export const EFFCorrelationDataType = {
  Audio: 1,
  Peak: 0, // any-nonzero-value-not-1, but 0 is the canonical Peak encoding
} as const;

/**
 * CrossCorrelation::computeConfidence(EFFCorrelationDataType type)
 *   @Flexo 0x12237c0   __ZN16CrossCorrelation17computeConfidenceE22EFFCorrelationDataType
 *
 * Two branches on `type`:
 *   type == Audio (1):
 *     - Split the workBuf into two windows around windowOffset (+0x30).
 *     - Left window: [0 .. windowOffset - N/100)         (size = eax above)
 *     - Right window: [windowOffset .. N - N/100)         (size = r14d)
 *     - Take max-magnitude value over each window (vDSP_maxmgvi).
 *     - denom = (leftMax + rightMax) * <const-at-0x349434>
 *              (the const is the small-magnitude threshold used to guard
 *               the divide; likely 0.5 or 1/2, TBD from the .rodata slot).
 *     - If denom > 0:  confidence = confidenceFloor / denom
 *     - Else:          confidence = (confidenceFloor > 0) ? <const-at-0x349900> : 0
 *   type != Audio (Peak):
 *     - Compute peak window bounds using windowOffset ± N/200 (yes 200,
 *       not 100 — see divBy200_asClang), clamped and offset.
 *     - Run vDSP_minv and vDSP_maxv over the resulting slice.
 *     - If minv == 0:  fall through to the (peakOrZero, floor)-return path.
 *     - Else:          confidence = (maxv / minv) & <mask-at-0x34945d>
 *                      (the mask is 0x7FFFFFFF — the "clear sign bit" ->
 *                       fabs — see andps immediate).
 *     - Fall-through zero path:
 *       if (maxv == 0)  return 0
 *       else            return <const-at-0x34985f>   (default weight)
 *
 * PORT STATUS: the ARITHMETIC and CONTROL FLOW are decodable but the
 * rodata constants at RIP-relative offsets 0x349434, 0x349900, 0x34945d,
 * 0x34985f need a separate .rodata read pass to bind. Rather than ship
 * a version with unpinned constants, we throw with the exact addresses.
 */
export function computeConfidence(
  self: CrossCorrelation,
  type: number,
): number {
  void self;
  void type;
  void divBy100_asClang;
  void divBy200_asClang;
  void vDSP_maxmgvi;
  void vDSP_maxv;
  void vDSP_minv;
  throw new Error(
    "CrossCorrelation::computeConfidence @Flexo 0x12237c0 — control-flow decoded but rodata constants @rip+0x349434 (fabs-scale for audio denom), @rip+0x349900 (positive-fallback), @rip+0x34945d (0x7FFFFFFF fabs-mask), @rip+0x34985f (peak-fallback weight) not yet transcribed — do a .rodata pass on Flexo before wiring the branch bodies.",
  );
}

/**
 * CrossCorrelation::calculateConfidenceForAudioSamples()
 *   @Flexo 0x1223600
 *
 * Same shape as computeConfidence's audio branch — see 0x1223868 in that
 * disasm — but factored out for direct callers who already know they have
 * audio data.  Left/right window vDSP_maxmgvi followed by (leftMax + rightMax)
 * * constant, then confidenceFloor / denom (or the fallback).
 *
 * Deferred for the same rodata-binding reason as computeConfidence.
 */
export function calculateConfidenceForAudioSamples(
  self: CrossCorrelation,
): number {
  void self;
  throw new Error(
    "CrossCorrelation::calculateConfidenceForAudioSamples @Flexo 0x1223600 — logic decoded but @rip+0x34962d (denom scaling constant) and @rip+0x349afc (audio-fallback constant) not yet transcribed",
  );
}

/**
 * CrossCorrelation::calculateConfidenceForPeakData()
 *   @Flexo 0x12236e0
 *
 * Peak-data branch specialisation of computeConfidence. Uses divBy200
 * (sarq $0x25 — wait that's /100 not /200; re-reading 0x1223710 that IS
 * sar $0x25 = shift 37 = /100).  So this variant uses N/100 as the
 * window half-width, not N/200. The maxv/minv are then computed on the
 * central slice of workBuf.
 *
 * Deferred: rodata constants at 0x349610 (fabs-mask) and 0x349a11 (fallback).
 */
export function calculateConfidenceForPeakData(
  self: CrossCorrelation,
): number {
  void self;
  throw new Error(
    "CrossCorrelation::calculateConfidenceForPeakData @Flexo 0x12236e0 — logic decoded but @rip+0x349610 (0x7FFFFFFF fabs-mask constant) and @rip+0x349a11 (peak-fallback weight) not yet transcribed",
  );
}

/**
 * CrossCorrelation::calculateCrossCorrelation(...)
 *   @Flexo 0x1222c30   __ZN16CrossCorrelation24calculateCrossCorrelationEPKfiS1_i
 *
 * The full FFT-based cross-correlation:
 *   1. Zero-pad both input buffers (a, b) to fftSize.
 *   2. Run vDSP_fft_zrip forward on both (real-input packed complex).
 *   3. Compute conjugate(FFT(a)) * FFT(b) element-wise
 *      (DSPSplitComplex multiply-and-conjugate).
 *   4. vDSP_fft_zrip inverse.
 *   5. Scale by 1/(2*fftSize) (vDSP's real-FFT normalisation).
 *   6. doFFTShift on the result.
 *
 * Body is 251 lines of DSPSplitComplex scaffolding around _vDSP_ctoz,
 * _vDSP_fft_zrip, _vDSP_zvmulD/_vDSP_zvmul, and _vDSP_ztoc. Not yet
 * transcribed — needs a dedicated pass on the DSPSplitComplex packing
 * offsets and the exact vDSP_vsmul normalisation constant.
 */
export function calculateCrossCorrelation(
  self: CrossCorrelation,
  a: Float32Array,
  aLen: number,
  b: Float32Array,
  bLen: number,
): void {
  void self;
  void a;
  void aLen;
  void b;
  void bLen;
  throw new Error(
    "CrossCorrelation::calculateCrossCorrelation @Flexo 0x1222c30 not yet transcribed — 251 lines of vDSP DSPSplitComplex FFT-mul-invFFT-shift, needs a dedicated pass on Accelerate DSPSplitComplex packing offsets.",
  );
}

/**
 * CrossCorrelation::calculatePhaseCorrelation(...)
 *   @Flexo 0x1222fa0   __ZN16CrossCorrelation24calculatePhaseCorrelationEPKfiS1_i
 *
 * Same shape as calculateCrossCorrelation, but with an ADDITIONAL step
 * between the elementwise multiply (3) and inverse FFT (4):
 *      normalise each complex bin by its magnitude — i.e.
 *          bin <- bin / |bin|   (guarding against tiny |bin|)
 * That is the "phase correlation" specialisation, producing a normalised
 * cross-power spectrum whose inverse FFT is a delta-like peak at the
 * time-shift between the two inputs.
 *
 * Body is 374 lines — same reason for deferral as calculateCrossCorrelation.
 */
export function calculatePhaseCorrelation(
  self: CrossCorrelation,
  a: Float32Array,
  aLen: number,
  b: Float32Array,
  bLen: number,
): void {
  void self;
  void a;
  void aLen;
  void b;
  void bLen;
  throw new Error(
    "CrossCorrelation::calculatePhaseCorrelation @Flexo 0x1222fa0 not yet transcribed — 374 lines of vDSP DSPSplitComplex FFT + per-bin magnitude-normalisation + inverse FFT, deferred for the same DSPSplitComplex-packing pass as calculateCrossCorrelation.",
  );
}
