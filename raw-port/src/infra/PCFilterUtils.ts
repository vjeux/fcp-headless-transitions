// PCFilterUtils.ts — ProCore filter-prefilter helpers (raw x86_64 port).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/
//         Versions/A/ProCore  (macOS FCP, x86_64 slice).
//
// PCFilterUtils is a NAMESPACE-LEVEL / all-static helper class — no instance
// state, five free functions inside a `PCFilterUtils::` namespace.
//
// Symbols ported:
//   * PCFilterUtils::genPrefilterFilter(float)                      @0x8c2c6
//   * PCFilterUtils::genPrefilterDOD(PCPtr<PCFilter>, PCRect<int> const&)
//                                                                    @0x8c2e6
//   * PCFilterUtils::prefilter_dsp(float, float const*, float**,
//         PCRect<int> const&, PCRect<int>*)                          @0x8c35e
//   * PCFilterUtils::prefilter_dsp(float const*, float**,
//         PCRect<int> const&, PCRect<int> const&, PCFilter*)         @0x8c416
//   * PCFilterUtils::prefilter(float, float const*, float**,
//         PCRect<int> const&, PCRect<int>*, PCRect<double> const&,
//         PCRect<double>*, int)                                       @0x8c7da
//
// Note: `genPrefilterFilter` is NOT emitted with an explicit label in the
// otool -tV dump — the linker absorbed its 32-byte body into the tail of the
// preceding function.  The body at address 0x8c2c6 is nevertheless present
// verbatim in the binary (see @0x8c2c6-0x8c2e5 in the tV dump immediately
// before `__ZN13PCFilterUtils15genPrefilterDODE...`).

/**
 * `PCFilter` — the ProCore reconstruction filter (Lanczos, cubic, box, ...).
 *   Not yet transcribed at this layer.  We surface it as an opaque handle.
 */
export type PCFilter = object;

/**
 * `PCPtr<PCFilter>` — a two-word (ptr + PCSharedCount) smart-pointer struct.
 * The first quadword is the raw `PCFilter*`; the second quadword is a
 * `PCSharedCount` control-block pointer.  `PCPtr::PCPtr()` isn't ported so
 * we model this nominally.
 */
export interface PCPtr<T> {
  readonly target: T | null;
  readonly sharedCount: unknown;
}

/**
 * `PCRect<int>` — 4 x int32 fields at bytes [0x0..0xf]:
 *   +0x0 x   +0x4 y   +0x8 width   +0xc height
 * (Deduced from field offsets used at @0x8c330 (movdqu (r14),xmm1 — full
 * 16 bytes) and the by-field accesses @0x8c43b/@0x8c44e/@0x8c459/@0x8c45d in
 * the prefilter_dsp bodies.)
 */
export interface PCRectInt {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * `PCRect<double>` — 4 x f64 fields.  Used by the `prefilter` overload.
 */
export interface PCRectDouble {
  x: number;
  y: number;
  width: number;
  height: number;
}

// -----------------------------------------------------------------------------
// UNPORTED FRONTIER CALLEES (throw-stubs at the boundary)
// -----------------------------------------------------------------------------

/** `PCFilter::makeLanczos(float radius, float b)`
 *  — ProCore symbol `__ZN8PCFilter11makeLanczosEff`, called @0x8c2d7 and
 *  @0x8c38a.  ABI: out-param via `rdi` (returns a `PCPtr<PCFilter>` into
 *  the caller's slot), then `radius=xmm0`, `b=xmm1`.  Not yet transcribed.
 */
function PCFilter_makeLanczos(_radius: number, _b: number): PCPtr<PCFilter> {
  // Called with `xmm0 = radius`, `xmm1 = b = 2.0f` in the FCP builds we've
  // inspected (see genPrefilterFilter@0x8c2cf constant load).  @0x8c2d7
  throw new Error(
    "PCFilter::makeLanczos: not ported — symbol " +
      "__ZN8PCFilter11makeLanczosEff. @0x8c2d7",
  );
}

/** `PCFilter::size() const`
 *  — ProCore symbol `__ZNK8PCFilter4sizeEv`, called @0x8c30e etc.  Returns
 *  a `u32` (in %eax) — the discrete kernel width of the filter.
 */
function PCFilter_size(_filter: PCFilter): number {
  // @0x8c30e — un-ported.
  throw new Error(
    "PCFilter::size() const: not ported — symbol " +
      "__ZNK8PCFilter4sizeEv. @0x8c30e",
  );
}

/** `throw_PCNullPointerException(bool)`
 *  — ProCore symbol `__Z28throw_PCNullPointerExceptionb`, called @0x8c306.
 *  Raises when a PCPtr's raw pointer is null.
 */
function throw_PCNullPointerException(_flag: boolean): never {
  // @0x8c306 — un-ported.
  throw new Error(
    "throw_PCNullPointerException(bool): not ported — symbol " +
      "__Z28throw_PCNullPointerExceptionb. @0x8c306",
  );
}

// -----------------------------------------------------------------------------
// PCFilterUtils (all-static)
// -----------------------------------------------------------------------------

export class PCFilterUtils {
  /**
   * `PCFilterUtils::genPrefilterFilter(float)` — @0x8c2c6.
   *
   * Full body (short — 32 bytes; no label because ICF-adjacency absorbed
   * the symbol into the preceding function's tail):
   *
   *   0x8c2c6  pushq %rbp
   *   0x8c2c7  movq  %rsp, %rbp
   *   0x8c2ca  pushq %rbx
   *   0x8c2cb  pushq %rax
   *   0x8c2cc  movq  %rdi, %rbx              ; %rdi = PCPtr<PCFilter>* sret
   *   0x8c2cf  movss 0x97409(%rip), %xmm1    ; xmm1 = *(f32*)@0x1236e0 = 2.0f
   *   0x8c2d7  callq __ZN8PCFilter11makeLanczosEff   ; makeLanczos(radius, 2.0f)
   *   0x8c2dc  movq  %rbx, %rax              ; return the sret slot
   *   0x8c2df  addq  $0x8, %rsp
   *   0x8c2e3  popq  %rbx
   *   0x8c2e4  popq  %rbp
   *   0x8c2e5  retq
   *
   * The RIP-relative load at 0x8c2cf resolves to file offset 0x4000+0x1236e0
   * in the x86_64 slice; the four bytes there are `00 00 00 40` — IEEE-754
   * single-precision `2.0f`.  Verified by hand read + Python struct.unpack.
   *
   * Semantics:  `genPrefilterFilter(radius) := PCFilter::makeLanczos(radius, 2.0f)`.
   *
   * PCFilter::makeLanczos itself is not yet transcribed, so we call our
   * frontier stub and forward the result.
   */
  static genPrefilterFilter(radius: number): PCPtr<PCFilter> {
    // @0x8c2cf: xmm1 = 2.0f  (const from @0x1236e0 in the x86_64 slice)
    // @0x8c2d7: callq PCFilter::makeLanczos(radius, 2.0f)
    return PCFilter_makeLanczos(Math.fround(radius), Math.fround(2.0));
  }

  /**
   * `PCFilterUtils::genPrefilterDOD(PCPtr<PCFilter> filter,
   *                                 PCRect<int> const& srcRect)`
   *   — @0x8c2e6.
   *
   * The DOD (Domain-Of-Definition) computation grows a source rect by the
   * filter's half-width in each direction.  Returns a `PCRect<int>` by
   * sret in %rdi.
   *
   *   @0x8c2e6-0x8c2ef prologue; r14=&srcRect (rdx), rbx=sret (rdi).
   *   @0x8c2f6 rdi = filter[0]  — the raw PCFilter* inside the PCPtr.
   *   @0x8c2f9 if (rdi == nullptr) throw_PCNullPointerException(true) @0x8c306.
   *   @0x8c30e callq PCFilter::size(rdi)  — u32 in eax.
   *   @0x8c313-0x8c31c:
   *       ecx  = size - 1
   *       ecx  = ecx >> 31       ; sign-extension: 1 if size was 0, else 0
   *       eax  = (size - 1) + ecx   ; adjusts negative to 0
   *       eax  = eax - 1            ; final `n`, i.e. the raw half-width
   *   In other words this computes `n = ((int)size - 2)` with a signed
   *   floor toward -1 that clamps 0→-1 to 0 (the compiler used
   *   `(s-1) + ((s-1)>>31)` = `s + sign(s-1) - 1` which for `s>=1` gives
   *   `s-1` and for `s==0` gives `-2` — read the constant zero-clamp
   *   verbatim below).
   *
   *   @0x8c31e-0x8c32a:
   *       xmm0[0] = eax                    ; xmm0.low = n
   *       eax    &= ~1                     ; eax = n & ~1  (round DOWN to even)
   *       xmm0    = psrad(xmm0, 1)         ; xmm0[0] = n >> 1 (arith shift)
   *       xmm0[1] = eax                    ; xmm0[1] = (n & ~1)
   *   So xmm0 lanes 0..3 are: [n>>1, n&~1, 0, 0]  (only 2 lanes used).
   *
   *   @0x8c330 xmm1 = *(__m128i*)&srcRect  ; load 16-byte PCRect<int> = (x,y,w,h)
   *   @0x8c335 xmm0 = pshufd(xmm0, 0x50)   ; xmm0 = [n>>1, n>>1, n&~1, n&~1]
   *
   *   Now xmm1 is (x,y,w,h) as 4 x int32.  xmm0 = (halfLo, halfLo, halfHi, halfHi).
   *
   *   @0x8c33a-0x8c342:
   *       xmm2 = xmm1 - xmm0              ; (x-halfLo, y-halfLo, w-halfHi, h-halfHi)
   *       xmm1 = xmm1 + xmm0              ; (x+halfLo, y+halfLo, w+halfHi, h+halfHi)
   *
   *   @0x8c346 xmm1 = pblendw(xmm1, xmm2, 0xf)
   *           blends low 8 bytes from xmm2, high 8 bytes from xmm1:
   *           xmm1 = (xmm2.x, xmm2.y, xmm1.w, xmm1.h)
   *                = (x - halfLo, y - halfLo, w + halfHi, h + halfHi)
   *
   *   @0x8c34c *(__m128i*)&sret = xmm1     ; store the grown rect.
   *
   * Semantically: given filter kernel width `s = PCFilter::size(filter)`, the
   * output rect has its (x,y) shifted LEFT by ⌊(s-2)/2⌋ and its (w,h) grown
   * by 2·⌈(s-2)/2⌉ (== the "even-rounded-up" full expansion).  For a
   * typical odd `s = 4` Lanczos-2 kernel this gives half=1: origin shifts
   * -1, size grows +2 in each dim.
   */
  static genPrefilterDOD(
    filter: PCPtr<PCFilter>,
    srcRect: PCRectInt,
  ): PCRectInt {
    // @0x8c2f6: load raw ptr, null-check
    if (filter.target === null) {
      // @0x8c306 — throw_PCNullPointerException(true)
      throw_PCNullPointerException(true);
    }
    // @0x8c30e: size = PCFilter::size(filter.target)  (u32)
    const size = PCFilter_size(filter.target) | 0;

    // @0x8c313-0x8c31c: compute `n = size - 2` with 0-clamp branch as
    //   n = (size - 1) + ((size - 1) >> 31) - 1
    // In JS `>>` is arith shift on 32-bit; mirror exactly.
    let n = (size - 1) | 0;
    n = (n + (n >> 31)) | 0;
    n = (n - 1) | 0;

    // @0x8c31e-0x8c32a: build the two half-widths.
    const halfLo = n >> 1; // psrad, arith shift
    const halfHi = n & ~1; // andl $-0x2

    // @0x8c335: xmm0 = (halfLo, halfLo, halfHi, halfHi) after pshufd 0x50.
    // @0x8c346 blend of (xmm1-xmm0) low, (xmm1+xmm0) high:
    return {
      x: (srcRect.x - halfLo) | 0,
      y: (srcRect.y - halfLo) | 0,
      width: (srcRect.width + halfHi) | 0,
      height: (srcRect.height + halfHi) | 0,
    };
  }

  /**
   * `PCFilterUtils::prefilter_dsp(float radius, float const* src,
   *      float** dst, PCRect<int> const& srcRect, PCRect<int>* outRect)`
   *   — @0x8c35e.
   *
   * This overload is a thin driver around the other overloads.  Full body
   * decoded in re/disasm/ProCore.PCFilterUtils.prefilter_dsp.s (216 lines):
   *
   *   @0x8c37f xmm1 = 2.0f (same RIP const @0x1236e0 as genPrefilterFilter).
   *   @0x8c38a callq PCFilter::makeLanczos(radius, 2.0f)  → tmpPCPtr @[-0x38].
   *   @0x8c391-0x8c3a1 build a second PCPtr<PCFilter> via
   *       PCSharedCount::PCSharedCount(PCSharedCount const&)  at [-0x40].
   *   @0x8c3b1 callq PCFilterUtils::genPrefilterDOD(&tmpDOD, tmpPCPtr, srcRect)
   *          — write the DOD rect into a 16-byte tmp @[-0x58].
   *   @0x8c3b6-0x8c3ba copy that DOD into *outRect via a movups pair.
   *   @0x8c3c1 PCSharedCount::~PCSharedCount(&tmpDupCount) — release the
   *          shared-count clone from @0x8c3a1.
   *   @0x8c3ca callq PCFilterUtils::prefilter_dsp(src, dst, srcRect,
   *                                                DOD, tmpPCFilter*)
   *   @0x8c3df PCSharedCount::~PCSharedCount(&tmpOriginalCount) — release
   *          the original ref returned by makeLanczos.
   *
   * All callees except `genPrefilterDOD` (ported above) require
   * PCSharedCount + PCFilter::makeLanczos + the other prefilter_dsp
   * overload — none ported.
   */
  static prefilter_dsp_A(
    _radius: number,
    _src: Float32Array | ReadonlyArray<number>,
    _dst: Float32Array[],
    _srcRect: PCRectInt,
    _outRect: PCRectInt,
  ): void {
    // Requires: PCFilter::makeLanczos + PCSharedCount copy/dtor +
    // PCFilterUtils::prefilter_dsp(const*, **, const&, const&, PCFilter*).
    // @0x8c35e
    throw new Error(
      "PCFilterUtils::prefilter_dsp(float, ...): requires PCFilter::" +
        "makeLanczos + PCSharedCount + the sibling prefilter_dsp " +
        "overload — none ported. @0x8c35e",
    );
  }

  /**
   * `PCFilterUtils::prefilter_dsp(float const* src, float** dst,
   *      PCRect<int> const& srcRect, PCRect<int> const& dstRect,
   *      PCFilter* filter)` — @0x8c416.
   *
   * The heavy 216-line separable DSP kernel — allocates a scratch f32 buffer
   * via `operator new[]` (__Znam @0x8c484), calls `PCFilter::size()` twice
   * (@0x8c445 / @0x8c490), then walks the horizontal + vertical convolution
   * passes with a variety of SIMD micro-optimizations (cmov, imul, cmovs).
   * We haven't decoded the inner loops here — this is a legitimate frontier
   * that needs its own unit of work.  We surface the entry with the citation.
   */
  static prefilter_dsp_B(
    _src: Float32Array | ReadonlyArray<number>,
    _dst: Float32Array[],
    _srcRect: PCRectInt,
    _dstRect: PCRectInt,
    _filter: PCFilter,
  ): void {
    // Requires: operator new[] + PCFilter::size + the full inner separable-
    // convolution SIMD kernels @0x8c416..0x8c7d9 — not decoded.
    // @0x8c416
    throw new Error(
      "PCFilterUtils::prefilter_dsp(float const*, ...): 216-line separable " +
        "convolution kernel not yet decoded — requires operator new[], " +
        "PCFilter::size, and the SIMD inner loops. @0x8c416",
    );
  }

  /**
   * `PCFilterUtils::prefilter(float radius, float const* src, float** dst,
   *      PCRect<int> const& srcRect, PCRect<int>* outRectI,
   *      PCRect<double> const& srcRectD, PCRect<double>* outRectD, int flag)`
   *   — @0x8c7da.
   *
   * The high-level entry point — 250 lines wrapping the DOD computation and
   * both integer & floating-point rect updates.  Body not yet decoded.
   */
  static prefilter(
    _radius: number,
    _src: Float32Array | ReadonlyArray<number>,
    _dst: Float32Array[],
    _srcRect: PCRectInt,
    _outRectI: PCRectInt,
    _srcRectD: PCRectDouble,
    _outRectD: PCRectDouble,
    _flag: number,
  ): void {
    // Requires: everything the two prefilter_dsp overloads need, plus
    // the PCRect<double>/PCRect<int> coordinate conversion @0x8c7da..0x8c8d?.
    // @0x8c7da
    throw new Error(
      "PCFilterUtils::prefilter: 250-line high-level entry not yet " +
        "decoded — requires both prefilter_dsp overloads and the " +
        "PCRect<double> conversion. @0x8c7da",
    );
  }
}
