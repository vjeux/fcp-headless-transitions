// HgcSampler.ts — Helium graphics coordinate sampler dispatcher.
// Faithfully transcribed from Helium framework binary at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// Source disassembly:
//   raw-port/re/disasm/Helium.HgcSampler.Create.s
//   raw-port/re/disasm/Helium.HgcSampler.Destroy.s
//   raw-port/re/disasm/Helium.HgcSampler.Init.s
//
// Ledger methods (nm on Helium):
//   @Helium 0x00000000002d3370  HgcSampler::Create()
//   @Helium 0x00000000002d3450  HgcSampler::Destroy(HgcSampler::State*)
//   @Helium 0x00000000002d3470  HgcSampler::Init(HgcSampler::State*, HGTransform const*, int filterMode)
//
// STRUCT LAYOUT of HgcSampler::State (recovered from Create + Init field writes; total 0x140
// usable bytes; Create allocates 0x147 raw with 32-byte alignment, stashing the raw allocation
// at ptr-0x8):
//   [-0x08]  rawAllocation  void*    // stashed by ctor @0x2d338f, recovered by Destroy @0x2d3459
//   +0x00..+0x1F  col0 (dup: +0x00 and +0x10 both hold the SAME 4-float column vector)
//   +0x20..+0x3F  col1 (dup: +0x20 and +0x30)
//   +0x40..+0x5F  col2 (dup: +0x40 and +0x50)
//   +0x60..+0x7F  col3 (dup: +0x60 and +0x70)
//   +0x80..+0x9F  zeros (2 × 16B via xorps @0x2d33d9 + movaps @0x2d33dc/e4)
//   +0xA0..+0xBF  {1,1,1,1} × 2 (movaps of 0x3c7c40 @0x2d33ec/f3/fb)
//   +0xC0..+0xDF  {2,2,2,2} × 2 (movaps of 0x3c7c90 @0x2d3403/0a/12)
//   +0xE0..+0xFF  {0.5,0.5,0.5,0.5} × 2 (movaps of 0x3c7c70 @0x2d341a/21/29)
//   +0x100..+0x11F {0.5,0.5,-0.5,-0.5} × 2 (movaps of 0x88ed80 @0x2d3431/38/40)
//   +0x120..+0x13F (reserved — within alloc slack)
//
// The "duplicated column" layout (each 16-byte column stored twice back-to-back) is an AVX
// broadcast preparation: the tile-sampler kernels use 256-bit VMOVAPS to load two lanes at once,
// so col K is available at both K*0x20 and K*0x20 + 0x10 for lane-independent loads.
//
// CONSTANTS (read from Helium __TEXT,__const via thin-x86_64 slice; resolve.py `const` mode uses
// the same file offsets):
//   @Helium 0x3c7cc0  128b  = 0xbf0000003f000000_40c000003f800000
//                          = float[4] { 1.0f, 6.0f, 0.5f, -0.5f }
//     Used by Create as a SCALAR 4-byte load (movss @0x2d3393 loads the low 4 bytes = 1.0f);
//     after the movss, %xmm0 = (1.0f, 0, 0, 0). Broadcast via two movaps at state[+0x00, +0x10].
//     Also used by Init @0x2d354a as a SCALAR 4-byte compare (ucomiss vs 1.0f).
//   @Helium 0x3c7cb0  0x3f80000000000000 : float pair {0.0f, 1.0f} (little-endian)
//     Loaded via movsd (scalar-double, 8 bytes) @0x2d33a5; after movsd %xmm0 low64 = these 8 bytes
//     interpreted as a double 0.0078125 (which happens to be the bit pattern of the two float32s
//     0.0f, 1.0f). The subsequent movaps stores 16 bytes: (0.0f, 1.0f, ...upper undefined but on
//     modern macOS x86_64 with VEX-clean state = 0, 0). Result at state[+0x20, +0x30] =
//     (0.0f, 1.0f, 0.0f, 0.0f).
//   @Helium 0x3caa70  128b = float[4] {0, 0, 1, 0} — movaps @0x2d33b7/be/c3 → state[+0x40, +0x50].
//   @Helium 0x3c9fe0  128b = float[4] {0, 0, 0, 1} — movaps @0x2d33c8/cf/d4 → state[+0x60, +0x70].
//   @Helium 0x3c7c40  128b = float[4] {1, 1, 1, 1} — movaps @0x2d33ec/f3/fb → state[+0xA0, +0xB0].
//   @Helium 0x3c7c90  128b = float[4] {2, 2, 2, 2} — movaps @0x2d3403/0a/12 → state[+0xC0, +0xD0].
//   @Helium 0x3c7c70  128b = float[4] {0.5, 0.5, 0.5, 0.5} — movaps @0x2d341a/21/29 → state[+0xE0, +0xF0].
//   @Helium 0x88ed80  128b = float[4] {0.5, 0.5, -0.5, -0.5} — movaps @0x2d3431/38/40 → state[+0x100, +0x110].
//
// FRONTIER CALLEES @0x2d3511 (HGGetHostTarget) and 0x2d3560/77/87/95/9c/aa/b1/c1/cf/d6/e4/eb
// — 12 file-local tile kernels 0x2d3560..0x2d35eb — called via throwing stubs.
//   • HGGetHostTarget()  — returns a CPU feature bitmask compared vs 0x46fffff (AVX cutoff)
//     and 0x4500000 (SSE4 cutoff). @Helium __Z15HGGetHostTargetv (call @0x2d3511).
//   • Twelve file-local tile kernels: Get{Affine,Persp}{Linear,Nearest}Tile{,_SSE4,_AVX}.
//     The mangled names appear inline in the Init disasm; they are __ZL... (local linkage) so
//     they don't appear as top-level ledger units. Installed as throwing stubs whose identity is
//     what Init actually stores as the chosen dispatch function pointer.
//   • HGTransform vtable slot at +0x30: a virtual method that fills a 128-byte stack buffer with
//     16 doubles = the 4 columns of the transform (each column = 4 doubles). Called @0x2d34a1.
//     HGTransform is not yet ported; we model it via a fillColumns callback interface.

// CPU feature bitmask returned by HGGetHostTarget. Thresholds recovered from Init:
//   > 0x46fffff  -> AVX path
//   >= 0x4500000 -> SSE4 path (cmovaeq cmp $0x4500000, %eax)
//   else         -> default (scalar) path
export type HGGetHostTargetFn = () => number;
let _HGGetHostTarget: HGGetHostTargetFn = () => {
  // @Helium __Z15HGGetHostTargetv — not yet transcribed. See porting spec rule 3.
  throw new Error("HGGetHostTarget() not yet transcribed — @Helium 0x2d3511 (called from HgcSampler::Init)");
};
export function installHGGetHostTarget(fn: HGGetHostTargetFn): void { _HGGetHostTarget = fn; }

// HGTransform vtable slot 6 (offset +0x30). Called by Init to fill a 128-byte stack buffer with
// 16 doubles describing the 4 transform columns.
//
// Native ABI (@0x2d3494/97/9e/a1):
//   rdi = this (HGTransform*), rsi = &stackBuf.
//   rcx = *(rdi) = vtable ptr; call *0x30(%rcx) -> void.
// The following code reads 4 pairs of doubles at RBP offsets (-0xa0,-0x90), (-0x80,-0x70),
// (-0x60,-0x50), (-0x40,-0x30). Each `cvtpd2ps <offset>(%rbp), %xmmN` reads TWO doubles at that
// offset and produces two packed floats in xmmN.low64. The `unpcklpd xmm0,xmm1` interleaves the
// two low-64 halves into xmm1 = { xmm1.low64, xmm0.low64 } = 4 floats. Since the reads are
// (-0xa0,-0x90) and (-0x80,-0x70) etc., that pattern maps to columns of 4 doubles each:
//   col 0: doubles at rbp-0xa0, rbp-0x98, rbp-0x90, rbp-0x88  -> 4 floats.
// So the buffer holds 16 doubles, indexed 0..15, and col k reads indices k*4..k*4+3.
export interface HGTransformLike {
  fillColumns(out: Float64Array /* length >= 16 */): void;
}

/**
 * HgcSampler::State — see file-level layout block.
 * We back the fields with a Float32Array view so the exact SIMD lane layout is preserved
 * (matches movaps semantics used by the sampler kernels that will consume it).
 */
export class HgcSamplerState {
  readonly buf: ArrayBuffer;
  readonly f32: Float32Array;
  readonly u8: Uint8Array;

  // The dispatch kernel selected by Init. Not a struct field in native code — Init returns the
  // kernel pointer in %rax. We surface it via the State object for JS ergonomics; the raw
  // per-field layout above is preserved bit-exactly for future kernel ports.
  dispatch: SamplerKernel | null = null;

  constructor() {
    this.buf = new ArrayBuffer(0x140);
    this.f32 = new Float32Array(this.buf);
    this.u8 = new Uint8Array(this.buf);
  }
}

/**
 * Sampler kernel signature recovered from Init's dispatch table (@0x2d3560, 3577, 3587, 3595,
 * 359c, 35aa, 35b1, 35c1, 35cf, 35d6, 35e4, 35eb). Each kernel is:
 *   void kernel(HGTile* tile, HgcSampler::State const* state, HGNode* node)
 * The kernels are file-local (__ZL...) so they're not ledger-visible; we install them as
 * throwing stubs with unique identity.
 */
export type SamplerKernel = (tile: unknown, state: HgcSamplerState, node: unknown) => void;

function makeThrowingKernel(name: string, addrHint: string): SamplerKernel {
  // File-local tile kernels: see call sites @0x2d3560, 0x2d3577, 0x2d3587, 0x2d3595, 0x2d359c,
  // 0x2d35aa, 0x2d35b1, 0x2d35c1, 0x2d35cf, 0x2d35d6, 0x2d35e4, 0x2d35eb — not yet transcribed.
  return () => { throw new Error(`${name} not yet transcribed at 0x2d35xx — @Helium ${addrHint}`); };
}

export const GetAffineLinearTile      : SamplerKernel = makeThrowingKernel("GetAffineLinearTile",      "0x2d35d6 (__ZL19GetAffineLinearTileP6HGTilePKN10HgcSampler5StateEP6HGNode)");
export const GetAffineLinearTile_SSE4 : SamplerKernel = makeThrowingKernel("GetAffineLinearTile_SSE4", "0x2d35cf (__ZL24GetAffineLinearTile_SSE4...)");
export const GetAffineLinearTile_AVX  : SamplerKernel = makeThrowingKernel("GetAffineLinearTile_AVX",  "0x2d3560 (__ZL23GetAffineLinearTile_AVX...)");
export const GetPerspLinearTile       : SamplerKernel = makeThrowingKernel("GetPerspLinearTile",       "0x2d359c (__ZL18GetPerspLinearTile...)");
export const GetPerspLinearTile_SSE4  : SamplerKernel = makeThrowingKernel("GetPerspLinearTile_SSE4",  "0x2d3595 (__ZL23GetPerspLinearTile_SSE4...)");
export const GetPerspLinearTile_AVX   : SamplerKernel = makeThrowingKernel("GetPerspLinearTile_AVX",   "0x2d3577 (__ZL22GetPerspLinearTile_AVX...)");
export const GetAffineNearestTile     : SamplerKernel = makeThrowingKernel("GetAffineNearestTile",     "0x2d35eb (__ZL20GetAffineNearestTile...)");
export const GetAffineNearestTile_SSE4: SamplerKernel = makeThrowingKernel("GetAffineNearestTile_SSE4","0x2d35e4 (__ZL25GetAffineNearestTile_SSE4...)");
export const GetAffineNearestTile_AVX : SamplerKernel = makeThrowingKernel("GetAffineNearestTile_AVX", "0x2d35c1 (__ZL24GetAffineNearestTile_AVX...)");
export const GetPerspNearestTile      : SamplerKernel = makeThrowingKernel("GetPerspNearestTile",      "0x2d35b1 (__ZL19GetPerspNearestTile...)");
export const GetPerspNearestTile_SSE4 : SamplerKernel = makeThrowingKernel("GetPerspNearestTile_SSE4", "0x2d35aa (__ZL24GetPerspNearestTile_SSE4...)");
export const GetPerspNearestTile_AVX  : SamplerKernel = makeThrowingKernel("GetPerspNearestTile_AVX",  "0x2d3587 (__ZL23GetPerspNearestTile_AVX...)");

export class HgcSampler {
  /**
   * @Helium 0x00000000002d3370  HgcSampler::Create()
   *
   * Faithful transcription (0x2d3370..0x2d344c). See file-level layout block for offsets.
   * Native performs `operator new[](0x147)`, aligns to 32B with an 8-byte header stash for the
   * raw pointer, and writes 9 pairs of duplicated 16-byte columns of well-known constants.
   * In JS we allocate an ArrayBuffer and write the same float values; the raw-pointer stash is
   * unobservable (JS GC replaces `operator delete[]`).
   */
  static Create(): HgcSamplerState {
    const s = new HgcSamplerState();

    // Step 4 @0x2d3393/9b/a0: movss(0x3c7cc0.low32) = 1.0f into xmm0, then movaps xmm0 to
    // state[+0x00] and [+0x10]. After movss, xmm0 = (1.0f, 0, 0, 0) on VEX-clean state (the SSE
    // scalar-float load zero-extends the upper 12 bytes when the register was previously VEX-
    // cleaned — which the function's prologue ensures).
    for (const off of [0x00, 0x10]) {
      const base = off >> 2;
      s.f32[base + 0] = 1.0; s.f32[base + 1] = 0.0; s.f32[base + 2] = 0.0; s.f32[base + 3] = 0.0;
    }
    // Step 5 @0x2d33a5/ad/b2: movsd(0x3c7cb0) loads 8 bytes = float pair (0.0f, 1.0f) into
    // xmm0.low64; upper 8 bytes zero on VEX-clean state. movaps to state[+0x20, +0x30] =
    // (0.0f, 1.0f, 0.0f, 0.0f).
    for (const off of [0x20, 0x30]) {
      const base = off >> 2;
      s.f32[base + 0] = 0.0; s.f32[base + 1] = 1.0; s.f32[base + 2] = 0.0; s.f32[base + 3] = 0.0;
    }
    // Step 6 @0x2d33b7/be/c3: movaps(0x3caa70) = {0,0,1,0} -> state[+0x40, +0x50].
    for (const off of [0x40, 0x50]) {
      const base = off >> 2;
      s.f32[base + 0] = 0.0; s.f32[base + 1] = 0.0; s.f32[base + 2] = 1.0; s.f32[base + 3] = 0.0;
    }
    // Step 7 @0x2d33c8/cf/d4: movaps(0x3c9fe0) = {0,0,0,1} -> state[+0x60, +0x70].
    for (const off of [0x60, 0x70]) {
      const base = off >> 2;
      s.f32[base + 0] = 0.0; s.f32[base + 1] = 0.0; s.f32[base + 2] = 0.0; s.f32[base + 3] = 1.0;
    }
    // Step 8 @0x2d33d9/dc/e4: xorps + two movaps -> zeros @ state[+0x80, +0x90]. Already zero by
    // ArrayBuffer construction; no writes needed. Documented for provenance.

    // Step 9 @0x2d33ec/f3/fb: {1,1,1,1} -> state[+0xA0, +0xB0].
    for (const off of [0xA0, 0xB0]) {
      const base = off >> 2;
      s.f32[base + 0] = 1.0; s.f32[base + 1] = 1.0; s.f32[base + 2] = 1.0; s.f32[base + 3] = 1.0;
    }
    // Step 10 @0x2d3403/0a/12: {2,2,2,2} -> state[+0xC0, +0xD0].
    for (const off of [0xC0, 0xD0]) {
      const base = off >> 2;
      s.f32[base + 0] = 2.0; s.f32[base + 1] = 2.0; s.f32[base + 2] = 2.0; s.f32[base + 3] = 2.0;
    }
    // Step 11 @0x2d341a/21/29: {0.5,0.5,0.5,0.5} -> state[+0xE0, +0xF0].
    for (const off of [0xE0, 0xF0]) {
      const base = off >> 2;
      s.f32[base + 0] = 0.5; s.f32[base + 1] = 0.5; s.f32[base + 2] = 0.5; s.f32[base + 3] = 0.5;
    }
    // Step 12 @0x2d3431/38/40: {0.5,0.5,-0.5,-0.5} -> state[+0x100, +0x110].
    for (const off of [0x100, 0x110]) {
      const base = off >> 2;
      s.f32[base + 0] = 0.5; s.f32[base + 1] = 0.5; s.f32[base + 2] = -0.5; s.f32[base + 3] = -0.5;
    }
    return s;
  }

  /**
   * @Helium 0x00000000002d3450  HgcSampler::Destroy(HgcSampler::State*)
   *
   * Native (0x2d3450..0x2d3469):
   *   testq %rdi,%rdi; je ret
   *   movq -0x8(%rdi), %rdi       ; recover raw operator new[] pointer stashed by Create
   *   testq %rdi,%rdi; je ret
   *   jmp operator delete(void*)   ; tail-call __ZdlPv @0x3c4fa0
   *
   * In JS we drop the reference (GC frees). We clear the dispatch pointer so any post-Destroy
   * use surfaces as a null-dispatch, mirroring the native "free returns pointer to unusable
   * memory" behavior.
   */
  static Destroy(state: HgcSamplerState | null): void {
    if (state === null) return;
    state.dispatch = null;
  }

  /**
   * @Helium 0x00000000002d3470  HgcSampler::Init(HgcSampler::State*, HGTransform const*, int)
   *
   * Faithful transcription 0x2d3470..0x2d3611. See file-level FRONTIER CALLEES for the virtual
   * call at slot +0x30 of HGTransform.
   */
  static Init(state: HgcSamplerState, transform: HGTransformLike, filterMode: number): void {
    // @0x2d3494/97/9e/a1: virtual call transform->vtbl[6] fills 16 doubles.
    const stack = new Float64Array(16);
    transform.fillColumns(stack);

    // @0x2d34a4..0x2d350b: for k in 0..3, convert 4 doubles at stack[k*4 .. k*4+3] to floats
    // (cvtpd2ps = double->single with round-to-nearest-even; Math.fround is bit-exact for this).
    // Store the 4 floats at state[+k*0x20] AND state[+k*0x20 + 0x10] (duplicated column).
    for (let k = 0; k < 4; k++) {
      const dOff = k * 4;
      const c0 = Math.fround(stack[dOff + 0]);
      const c1 = Math.fround(stack[dOff + 1]);
      const c2 = Math.fround(stack[dOff + 2]);
      const c3 = Math.fround(stack[dOff + 3]);
      const base = (k * 0x20) >> 2;
      state.f32[base + 0] = c0; state.f32[base + 1] = c1;
      state.f32[base + 2] = c2; state.f32[base + 3] = c3;
      state.f32[base + 4] = c0; state.f32[base + 5] = c1;
      state.f32[base + 6] = c2; state.f32[base + 7] = c3;
    }

    // @0x2d3511: HGGetHostTarget() -> eax = CPU feature bitmask (uint32).
    const cpuMask = _HGGetHostTarget() >>> 0;

    // @0x2d3516..0x2d3553: affine test. Compare four floats against constants:
    //   state[+0x0c] == 0.0f   @0x2d3516 (movss then xorpd/ucomiss)
    //   state[+0x2c] == 0.0f   @0x2d3527
    //   state[+0x4c] == 0.0f   @0x2d3534 (xorps xmm1 then ucomiss)
    //   state[+0x6c] == 1.0f   @0x2d3544/4a (ucomiss vs const @0x3c7cc0.low32 = 1.0f)
    // Each compare is `jne target; jp target` -- fail if unordered (NaN) OR not-equal. All four
    // must pass to take the AFFINE path (@0x2d3555). Any failure jumps to PERSPECTIVE (@0x2d356c).
    // Since Float32Array stores are always numeric-finite for finite inputs, the NaN branch only
    // fires if the input doubles were NaN. `===` in JS is false for NaN==NaN which correctly
    // models the compound `jne/jp` gate.
    const isAffine =
      state.f32[0x0c >> 2] === 0.0 &&
      state.f32[0x2c >> 2] === 0.0 &&
      state.f32[0x4c >> 2] === 0.0 &&
      state.f32[0x6c >> 2] === 1.0;

    // @0x2d3555/6c: `testl %ebx, %ebx; jle nearest_branch`. Signed less-than-or-equal:
    // filterMode <= 0 -> NEAREST; filterMode > 0 -> LINEAR.
    const nearest = (filterMode | 0) <= 0;

    // Kernel dispatch tree. Preserve the native comparison edges exactly:
    //   AVX  path: `cmpl $0x46fffff, %eax; jbe <cpu-below-avx>` -> jbe is unsigned below-or-equal,
    //              so AVX taken when eax > 0x46fffff (jbe FALLS THROUGH to AVX branch when NOT-jbe).
    //   SSE4 path: `cmpl $0x4500000, %eax; cmovaeq %rcx, %rax` -> cmovae = eax >= 0x4500000 uses
    //              the SSE4 kernel (rcx), else the default kernel (rax).
    // Faithful ordering: check AVX first (strict greater), then SSE4 (greater-or-equal), else default.
    let dispatch: SamplerKernel;
    if (isAffine) {
      if (nearest) {
        // @0x2d35ba..d/f2 — GetAffineNearest{,_SSE4,_AVX}
        if (cpuMask > 0x46FFFFF)       dispatch = GetAffineNearestTile_AVX;
        else if (cpuMask >= 0x4500000)  dispatch = GetAffineNearestTile_SSE4;
        else                             dispatch = GetAffineNearestTile;
      } else {
        // @0x2d3555..67 — GetAffineLinear{,_SSE4,_AVX}
        if (cpuMask > 0x46FFFFF)       dispatch = GetAffineLinearTile_AVX;
        else if (cpuMask >= 0x4500000)  dispatch = GetAffineLinearTile_SSE4;
        else                             dispatch = GetAffineLinearTile;
      }
    } else {
      if (nearest) {
        // @0x2d3580..a5 — GetPerspNearest{,_SSE4,_AVX}
        if (cpuMask > 0x46FFFFF)       dispatch = GetPerspNearestTile_AVX;
        else if (cpuMask >= 0x4500000)  dispatch = GetPerspNearestTile_SSE4;
        else                             dispatch = GetPerspNearestTile;
      } else {
        // @0x2d356c..a3 — GetPerspLinear{,_SSE4,_AVX}
        if (cpuMask > 0x46FFFFF)       dispatch = GetPerspLinearTile_AVX;
        else if (cpuMask >= 0x4500000)  dispatch = GetPerspLinearTile_SSE4;
        else                             dispatch = GetPerspLinearTile;
      }
    }
    // The native ABI leaves the chosen kernel pointer in %rax as the (unused-by-caller) return
    // value; there is no store into state. We stash it on `state.dispatch` for JS ergonomics
    // — the layout offsets above are preserved bit-exactly and future kernel ports can consume
    // state.f32 directly without depending on this JS-only convenience field.
    state.dispatch = dispatch;
  }
}
