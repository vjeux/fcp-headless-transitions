// HgcScaleBiasCrop.ts — Helium framework (render layer).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//         Versions/A/Helium  (macOS FCP, x86_64 slice).
//
// -----------------------------------------------------------------------------
// SYMBOLS PORTED
// -----------------------------------------------------------------------------
//   * HgcScaleBiasCrop::RenderTile_AVX(HGTile*)   @Helium 0x2daab0
//     __ZN16HgcScaleBiasCrop14RenderTile_AVXEP6HGTile
//
// re/disasm:
//   raw-port/re/disasm/Helium.__ZN16HgcScaleBiasCrop14RenderTile_AVXEP6HGTile.s (122 instrs)
//
// The other HgcScaleBiasCrop methods (RenderTile @0x2dacd0, GetProgram @0x2da680,
// Bind @0x2daa10, BindTexture @0x2da9a0, GetDOD @0x2daee0, GetROI @0x2daf00,
// SetParameter @0x2db170, GetParameter @0x2db1f0, GetOutput @0x2db240, the
// ctors/dtors) are SEPARATE ledger entries and are NOT ported here. Two of them
// are quoted below as LAYOUT EVIDENCE only — quoting a neighbour's instructions
// to prove a field's offset is not porting it.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
// ZERO. The body contains no `callq` at all — not one in-scope call, not one
// extern stub, no indirect/virtual dispatch. It is a self-contained AVX pixel
// kernel over the tile's source plane, the tile's output plane and the 0xA0-byte
// parameter block at `this+0x198`. `depgraph.py deps
// __ZN16HgcScaleBiasCrop14RenderTile_AVXEP6HGTile` reports nothing.
//
// -----------------------------------------------------------------------------
// WHAT IT COMPUTES
// -----------------------------------------------------------------------------
// For every pixel of the tile:  out = (src * scale + bias) * cropMask(x, y)
// where the mask is 1.0 inside an axis-aligned rectangle and 0.0 outside it —
// hence the class name Scale/Bias/Crop. The mask is computed WITHOUT a branch,
// as an arithmetic count of failed edge tests (see CROP TEST below).
//
// -----------------------------------------------------------------------------
// HGTile FIELDS READ (the shared contract in HGTile.ts)
// -----------------------------------------------------------------------------
//   +0x00..0x0f  int32 {left, top, right, bottom}  vbroadcastf128 (%rsi),%ymm0  @0x2daab0
//   +0x10        outSlot   : rgba*                 movq   0x10(%rsi),%rcx       @0x2daaec
//   +0x18        outStride : int32 (PIXELS/row)    movslq 0x18(%rsi),%r8        @0x2daafc
//                                                  then `shlq $0x4` (×16 bytes) @0x2dab12
//   +0x50        texPlanes[0].pixels : rgba*       movq   0x50(%rsi),%rdx       @0x2daaf8
//   +0x58        texPlanes[0].stride : int32       movslq 0x58(%rsi),%rsi       @0x2dab00
//                                                  then `shlq $0x4`             @0x2dab0e
// Nothing else in HGTile is touched. WIDTH and HEIGHT are not read from any
// field — they are computed from the corner rect by the SIMD prologue below.
//
// -----------------------------------------------------------------------------
// THE PARAMETER BLOCK AT this+0x198 (0xA0 bytes, 32-byte aligned)
// -----------------------------------------------------------------------------
// Loaded by `movq 0x198(%rdi),%r14` @0x2dab56 — RE-LOADED on every single inner
// iteration (also @0x2dabdb, @0x2dac54), never cached in a register across the
// loop, exactly as HgcAVATemporalAverage re-loads its coefBuf.
//
// Its shape is pinned by two sibling methods (LAYOUT EVIDENCE, not ported here):
//
//   HgcScaleBiasCrop::HgcScaleBiasCrop() @0x2daf20 allocates and aligns it:
//     0x2daf39  movl  $0xc7,%edi ; callq __Znam       ; new char[199]
//     0x2daf43  leaq  0x8(%rax),%rcx
//     0x2daf47  negl  %ecx
//     0x2daf49  andl  $0x1f,%ecx                      ; pad to a 32-byte boundary
//     0x2daf4c  leaq  (%rcx,%rax),%rdx
//     0x2daf50  addq  $0x8,%rdx                       ; rdx = the aligned block
//     0x2daf54  movq  %rax,(%rcx,%rax)                ; stash the raw ptr for delete[]
//     0x2daf58  xorps %xmm0,%xmm0
//     0x2daf5b..0x2daf7e  movaps %xmm0, 0x8/0x18/…/0x78(%rcx,%rax)
//                                                     ; block[0x00..0x7f] = 0.0f
//     0x2daf83  movaps 0xeccb6(%rip),%xmm0            ; = @Helium 0x3c7c40 {1,1,1,1}
//     0x2daf8a  movaps %xmm0,0x98(%rcx,%rax)          ; block[+0x90] = 1.0f x4
//     0x2daf92  movaps %xmm0,0x88(%rcx,%rax)          ; block[+0x80] = 1.0f x4
//     0x2daf9a  movq  %rdx,0x198(%rbx)                ; this->params = block
//   So the 32-byte alignment is real (the kernel's `vmovaps` loads require it), the
//   block is 0xA0 bytes, and its DEFAULTS are: everything 0.0f except +0x80..+0x9f
//   = 1.0f. The 0x3c7c40 constant was read straight out of the slice:
//   { 0x3f800000, 0x3f800000, 0x3f800000, 0x3f800000 } = { 1.0f, 1.0f, 1.0f, 1.0f }.
//
//   HgcScaleBiasCrop::SetParameter(int i, float, float, float, float) @0x2db170
//   pins the SLOT SIZE and the duplication:
//     0x2db175  cmpl $0x2,%esi ; ja -> return -1        ; only i = 0, 1, 2 exist
//     0x2db17a  movq 0x198(%rdi),%rcx
//     0x2db183  shlq $0x5,%rdx                          ; slot i is at +0x20*i
//     0x2db1bf..0x2db1cb  insertps                      ; pack the 4 floats
//     0x2db1d1  movups %xmm0,0x10(%rax)                 ; write BOTH 128-bit halves
//     0x2db1d5  movups %xmm0,(%rax)                     ;   of the 32-byte slot
//   i.e. each settable slot is 32 bytes holding the SAME 4 floats twice — which is
//   why the kernel can use one 256-bit load for two pixels.
//
//   offset  lanes                what                       set by
//   ------  -------------------  -------------------------  ---------------------------
//   +0x00   8 x f32 (4 dup'd)    scale (per RGBA channel)   SetParameter(0, …)
//   +0x20   8 x f32 (4 dup'd)    bias  (per RGBA channel)   SetParameter(1, …)
//   +0x40   8 x f32 (4 dup'd)    crop rect {l, t, r, b}     SetParameter(2, …)
//   +0x60   8 x f32              edge/count threshold       ctor only -> 0.0f
//   +0x80   8 x f32              mask "true" value          ctor only -> 1.0f
//
// This port does NOT hard-code the ctor defaults: +0x60 and +0x80 are read as
// runtime lanes exactly as the machine reads them. The defaults are recorded only
// to explain WHY the arithmetic below is a crop.
//
// -----------------------------------------------------------------------------
// THE RIP-RELATIVE CONSTANT POOL (each verified by direct byte read of the slice)
// -----------------------------------------------------------------------------
// A rip-relative target is (address of the NEXT instruction) + displacement:
//   @0x2daad7 vmulps 0x5b4421(%rip) -> 0x2daadf + 0x5b4421 = @Helium 0x88ef00
//        = { 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0 }
//   @0x2daadf vaddps 0x5b4439(%rip) -> 0x2daae7 + 0x5b4439 = @Helium 0x88ef20
//        = { 0.5, 0.5, 0.0, 1.0, 0.5, 0.5, 0.0, 1.0 }
//   @0x2daaf0 vaddps 0x5b4448(%rip) -> 0x2daaf8 + 0x5b4448 = @Helium 0x88ef40
//        = { 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0 }
//   @0x2dab19 vmovaps 0x5b445f(%rip) -> 0x2dab21 + 0x5b445f = @Helium 0x88ef80
//        = { 2.0, 0.0, 0.0, 0.0, 2.0, 0.0, 0.0, 0.0 }        (x step, per PAIR)
//   @0x2dab21 vmovaps 0x5b4437(%rip) -> 0x2dab29 + 0x5b4437 = @Helium 0x88ef60
//   @0x2dac46 vmovaps 0x5b4312(%rip) -> 0x2dac4e + 0x5b4312 = @Helium 0x88ef60
//        = { 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0 }        (y step, per ROW)
//
// The first two are the SAME pair HGTile::Position() @Ozone 0x690cc0 uses (see
// HGTile.ts): mask off the right/bottom corners with {1,1,0,0} and add
// {0.5,0.5,0,1} to land on the TOP-LEFT PIXEL CENTRE as a homogeneous (x,y,0,1).
// The third adds 1.0 to lane 4 only, so the upper 128-bit lane holds the NEXT
// pixel's centre — the two lanes are pixel (x+0.5, y+0.5) and (x+1.5, y+0.5),
// which is what lets the kernel step two pixels at a time.
//
// -----------------------------------------------------------------------------
// THE CROP TEST — branch-free, per 128-bit lane (coord = (px, py, 0.0, 1.0))
// -----------------------------------------------------------------------------
//   lo   = (rect.l, rect.t, px, py)      vmovlhps @0x2dabf0 / vunpcklpd @0x2dab7d
//   hi   = (px, py, rect.r, rect.b)      vblendps $0x3 @0x2dabf4 / $0xcc @0x2dab77
//   d    = hi - lo                       vsubps   @0x2dabfa
//        = (px - l, py - t, r - px, b - py)   — one signed distance per edge
//   m    = (d < thr) ? maskval : +0.0    vcmpltps @0x2dac03 + vandps @0x2dac10
//   s    = (m0 + m1) + (m2 + m3)         vhaddps  @0x2dac14 then @0x2dac18
//   mask = (s <= thr) ? maskval : +0.0   vcmpleps @0x2dac1c + vandps @0x2dac21
//
// With the ctor defaults (thr = 0, maskval = 1) `m` counts the edges the pixel is
// OUTSIDE of and `mask` is 1.0 iff that count is zero — i.e. 1.0 strictly inside
// (and on the l/t edges, since the test is `< 0`, not `<= 0`), 0.0 outside.
//
// Two AT&T details that decide the whole thing, per PORTING_SPEC's cheat-sheet:
//   * `vcmpltps %ymm6,%ymm5,%ymm5` is Intel `vcmpltps ymm5, ymm5, ymm6`, i.e.
//     ymm5 < ymm6 — the operands are REVERSED from the printed order.
//   * `vandps` against a compare result is a bitwise select: all-ones -> the
//     maskval lane verbatim, all-zero -> +0.0. Modelling it as a ternary is
//     bit-exact (it copies the operand's bits, it does not compute with them).
//   * The two `vhaddps` fix the SUMMATION ORDER as (m0+m1) + (m2+m3). A different
//     association can move the last ulp, so the port reproduces this order.
//   * Both compares are ORDERED (`lt`/`le`), so a NaN operand yields false, which
//     the `<` / `<=` in TS match exactly.
//
// -----------------------------------------------------------------------------
// LOOP STRUCTURE
// -----------------------------------------------------------------------------
//   height = bottom - top   (vpextrd $1 of the corner subtract) — `jle` @0x2daac6
//                           returns 0 BEFORE the frame is even pushed.
//   width  = right - left   (vmovd of the same subtract)
//   width >= 2  -> per row: a do/while over PIXEL PAIRS (256-bit), then ONE
//                  128-bit tail pixel when the width is odd.
//   width == 1  -> a separate 128-bit-only row loop @0x2dac50.
//   width <= 0  -> `cmpl $0x1,%r9d ; jne` @0x2dac38 falls straight to the exit.
// The pair loop's trip count is carried in %ebx as a NEGATIVE pixel count
// (@0x2dabb7..0x2dabc8) and then negated @0x2dabca to decide whether an odd tail
// pixel remains — transcribed literally below rather than replaced by
// `floor(width / 2)`, so the counter arithmetic stays reviewable against the asm.
//
// The function always returns 0 (`xorl %eax,%eax` @0x2dacc0), on every path.
//
// -----------------------------------------------------------------------------
// ORACLE — differential against the live kernel, 600 cases, 0 divergences
// -----------------------------------------------------------------------------
// raw-port/re/oracle/HgcScaleBiasCrop_RenderTile_AVX_oracle.py +
// ..._driver.ts. The symbol is a LOCAL (`nm -arch x86_64` type `t`), so it is not
// dlsym-able; the harness calls it at `x86_64 vmaddr + the loaded image's slide`,
// under `arch -x86_64 /usr/bin/python3` so dyld maps the x86_64 slice these
// addresses come from (calling the arm64 image would compare against code this
// port did not transcribe, and that failure mode is SILENT toward VERIFIED —
// OPS_LOG "wrong architecture"). AVX executes fine under Rosetta.
//
// Each case builds a real HGTile and a real 32-byte-aligned parameter block in
// process memory, poisons the object with 0xAA and the output plane with a
// -777.0 sentinel, and compares every output float BIT-EXACTLY (hex bit patterns,
// so signed zero and NaN payloads count). Widths 0,1,2,…,9,16,17 and heights 0..5
// cover the empty tile, the width==1 loop, the even/odd pair-loop tails and
// multi-row striding; strides are deliberately larger than the width so a wrong
// stride shows up as untouched sentinel. Result: 600/600 bit-identical, and the
// object is never written through (`this` is 0xAA everywhere except the +0x198
// pointer on every case).
//
// NEGATIVE CONTROLS (measured on the same corpus — each is a plausible wrong port
// and the number is how many of the 600 cases would have caught it):
//   second compare `cmple` -> `cmplt`                       — 163 of 600
//   x advances 1.0 per pixel-pair instead of 2.0            —  94 of 600
//   pixel centre offset 0.0 instead of 0.5                  — 135 of 600
//   bias added before the scale multiply                    — 487 of 600
//   crop difference (px - left) computed as (left - px)     — 163 of 600
// (Worth recording: an earlier revision of the harness padded the parameter block
// so the mask at +0x80 read as 0.0. Every output pixel was then multiplied by
// zero, the model "matched" the binary on all 150 cases, and EVERY negative
// control scored 0 — a false VERIFIED. Dead negative controls are the tell.)

import type { HGTile } from "./HGTile.js";

// Single-precision helper: every AVX lane op here is a binary32 operation with
// round-to-nearest-even, and Math.fround applies exactly that rounding.
const f32 = Math.fround;

/**
 * The rip-relative constant at @Helium 0x88ef00, loaded by `vmulps 0x5b4421(%rip)`
 * @0x2daad7. Masks the tile's right/bottom corner lanes to zero so only the
 * top-left corner survives into the coordinate vector.
 */
const CORNER_MASK: readonly number[] = [
  f32(1.0), f32(1.0), f32(0.0), f32(0.0), f32(1.0), f32(1.0), f32(0.0), f32(0.0),
];

/**
 * @Helium 0x88ef20, loaded by `vaddps 0x5b4439(%rip)` @0x2daadf. The half-pixel
 * centre offset plus the homogeneous w = 1. Same constant HGTile::Position()
 * @Ozone 0x690cc0 adds (see HGTile.ts).
 */
const PIXEL_CENTRE: readonly number[] = [
  f32(0.5), f32(0.5), f32(0.0), f32(1.0), f32(0.5), f32(0.5), f32(0.0), f32(1.0),
];

/**
 * @Helium 0x88ef40, loaded by `vaddps 0x5b4448(%rip)` @0x2daaf0. Adds 1.0 to
 * lane 4 only, so the upper 128-bit lane addresses the NEXT pixel to the right.
 */
const SECOND_LANE_X: readonly number[] = [
  f32(0.0), f32(0.0), f32(0.0), f32(0.0), f32(1.0), f32(0.0), f32(0.0), f32(0.0),
];

/**
 * @Helium 0x88ef80, loaded by `vmovaps 0x5b445f(%rip)` @0x2dab19. One inner
 * iteration consumes two pixels, so x advances by 2.0.
 */
const X_STEP_PER_PAIR: readonly number[] = [
  f32(2.0), f32(0.0), f32(0.0), f32(0.0), f32(2.0), f32(0.0), f32(0.0), f32(0.0),
];

/**
 * @Helium 0x88ef60, loaded by `vmovaps 0x5b4437(%rip)` @0x2dab21 (width >= 2 path)
 * and `vmovaps 0x5b4312(%rip)` @0x2dac46 (width == 1 path) — the SAME address from
 * two different sites. One row advances y by 1.0.
 */
const Y_STEP_PER_ROW: readonly number[] = [
  f32(0.0), f32(1.0), f32(0.0), f32(0.0), f32(0.0), f32(1.0), f32(0.0), f32(0.0),
];

/** Element index of a parameter-block byte offset (4 bytes per f32 lane). */
const P_SCALE = 0x00 >> 2;
const P_BIAS = 0x20 >> 2;
const P_RECT = 0x40 >> 2;
const P_THRESHOLD = 0x60 >> 2;
const P_MASKVAL = 0x80 >> 2;

/**
 * `HgcScaleBiasCrop` instance state — ONLY the one field this unit reads.
 *
 * Everything below +0x198 is the opaque HGNode base as far as RenderTile_AVX is
 * concerned: the body never touches `this` except for the single
 * `movq 0x198(%rdi),…` load, which the oracle confirms (the object is still
 * 0xAA-poisoned everywhere else after every call).
 */
export interface HgcScaleBiasCropState {
  /** HGNode base subobject placeholder (+0x000..+0x197) — untouched by this unit. */
  _hgNode: unknown;

  /**
   * +0x198 — `float* params`, the 32-byte-aligned 0xA0-byte block the ctor
   * allocates @0x2daf39..0x2daf9a. Loaded by `movq 0x198(%rdi),%r14` @0x2dab56
   * (again @0x2dabdb and @0x2dac54). Lane layout: +0x00 scale, +0x20 bias,
   * +0x40 crop rect, +0x60 threshold, +0x80 mask value — see the file header.
   *
   * Modelled as a Float32Array of at least 40 elements (0xA0 bytes), the same
   * treatment as HgcAVATemporalAverage's `coefBuf`.
   */
  params: Float32Array | null;
}

/**
 * `HgcScaleBiasCrop::RenderTile_AVX(HGTile* tile)` — @Helium 0x2daab0
 *   __ZN16HgcScaleBiasCrop14RenderTile_AVXEP6HGTile
 *
 * Writes `(src * scale + bias) * cropMask(x, y)` into the tile's output plane.
 * Full line-by-line decode, the constant pool, the parameter-block layout and the
 * oracle evidence are in the file header above.
 *
 * @param self  %rdi — the HgcScaleBiasCrop instance.
 * @param tile  %rsi — the HGTile being rendered.
 * @returns the int in %eax, always 0 (@0x2dacc0).
 */
export function HgcScaleBiasCrop_RenderTile_AVX(
  self: HgcScaleBiasCropState,
  tile: HGTile,
): number {
  // ── @0x2daab0..0x2daac6 — the SIMD prologue, before any frame is pushed ──
  // vbroadcastf128 (%rsi),%ymm0 : ymm0 = {l, t, r, b} twice, as int32 lanes.
  // vshufps $0xee -> xmm1 = {r, b, r, b} ; vpsubd %xmm0,%xmm1 -> {r-l, b-t, 0, 0}
  // vpextrd $0x1 -> %eax = lane 1 = height.
  const height = (tile.bottom - tile.top) | 0;
  // @0x2daac6 jle 0x2dacbd — an empty tile returns 0 without touching anything.
  if (height <= 0) {
    return 0; // @0x2dacc0 xorl %eax,%eax
  }
  // @0x2daae7 vmovd %xmm1,%r9d — lane 0 of the same subtract = width.
  const width = (tile.right - tile.left) | 0;

  // ── @0x2daad3..0x2daaf0 — the coordinate vector ──
  // vcvtdq2ps converts all EIGHT int32 corner lanes to f32; the multiply then
  // zeroes the r/b lanes, so only {l, t} survive into each 128-bit half.
  const corners: readonly number[] = [
    tile.left, tile.top, tile.right, tile.bottom,
    tile.left, tile.top, tile.right, tile.bottom,
  ];
  // ymm0 — two homogeneous pixel centres: lane A = (l+0.5, t+0.5, 0, 1),
  //        lane B = (l+1.5, t+0.5, 0, 1).
  const ymm0: number[] = new Array<number>(8);
  for (let i = 0; i < 8; i += 1) {
    // @0x2daad3 vcvtdq2ps ; @0x2daad7 vmulps ; @0x2daadf vaddps ; @0x2daaf0 vaddps
    ymm0[i] = f32(f32(f32(f32(corners[i]) * CORNER_MASK[i]) + PIXEL_CENTRE[i])
      + SECOND_LANE_X[i]);
  }

  // ── @0x2daaec..0x2dab00 — the tile's planes and strides ──
  const dstPlane = tile.outSlot; // rcx — tile[+0x10]
  const srcPlane = tile.texPlanes[0].pixels; // rdx — tile[+0x50]
  // `shlq $0x4` @0x2dab0e/@0x2dab12 (and @0x2dac3e/@0x2dac42) turns the PIXEL
  // stride into a BYTE stride; this port indexes Float32Array in f32 ELEMENTS and
  // one 16-byte RGBA pixel is 4 of them, so the same conversion is `* 4`. The
  // `movslq` sign-extension is preserved by `| 0`: a negative (bottom-up) stride
  // walks backwards exactly as the machine's `addq` does.
  const dstRowElems = ((tile.outStride | 0) * 4) | 0; // r8
  const srcRowElems = ((tile.texPlanes[0].stride | 0) * 4) | 0; // rsi

  if (srcPlane === null || dstPlane === null || self.params === null) {
    // The disassembly does NOT null-check any of the three pointers — it
    // dereferences them the moment height > 0 (@0x2dab50 / @0x2dab5d / @0x2daba9),
    // so a null plane faults inside this function. That is a fault, not a decoded
    // code path, and no pixel value is defined for it, so the port refuses loudly
    // rather than inventing one. A zero-height tile has already returned 0 above,
    // exactly as @0x2daac6 does before any pointer is loaded.
    throw new Error(
      "HgcScaleBiasCrop::RenderTile_AVX @Helium 0x2daab0: null source plane, "
        + "output plane or parameter block — the binary would fault here",
    );
  }
  const params = self.params;

  /**
   * One 128-bit lane of the branch-free crop test — @0x2dab77..0x2daba1 (upper and
   * lower halves of the 256-bit form) and @0x2dabf0..0x2dac21 / @0x2dac6c..0x2dac9f
   * (the two 128-bit forms). `lane` is 0 for the low half, 4 for the high half; the
   * parameter block holds the same four floats in both halves, so the machine reads
   * lane+i and this port does the same rather than folding to the low half.
   */
  const cropMask = (coord: readonly number[], base: number, lane: number): number[] => {
    // vmovlhps/vunpcklpd -> (rect.l, rect.t, px, py)
    const lo: number[] = [
      params[P_RECT + lane + 0], params[P_RECT + lane + 1], coord[base + 0], coord[base + 1],
    ];
    // vblendps -> (px, py, rect.r, rect.b)
    const hi: number[] = [
      coord[base + 0], coord[base + 1], params[P_RECT + lane + 2], params[P_RECT + lane + 3],
    ];
    const m: number[] = new Array<number>(4);
    for (let i = 0; i < 4; i += 1) {
      // vsubps : the signed distance to each of the four edges.
      const d = f32(hi[i] - lo[i]);
      // vcmpltps + vandps : an ORDERED `<` (false on NaN), then a bitwise AND that
      // copies either the mask lane's bits or +0.0 — a bit-exact ternary.
      m[i] = d < params[P_THRESHOLD + lane + i] ? params[P_MASKVAL + lane + i] : f32(0.0);
    }
    // vhaddps twice — the association is fixed by the two instructions.
    const s = f32(f32(m[0] + m[1]) + f32(m[2] + m[3]));
    const out: number[] = new Array<number>(4);
    for (let i = 0; i < 4; i += 1) {
      // vcmpleps + vandps
      out[i] = s <= params[P_THRESHOLD + lane + i] ? params[P_MASKVAL + lane + i] : f32(0.0);
    }
    return out;
  };

  let srcRow = 0; // rdx
  let dstRow = 0; // rcx

  // @0x2dab04 cmpl $0x2,%r9d ; @0x2dab08 jl 0x2dac34
  if (width >= 2) {
    // @0x2dab16 xorl %r10d,%r10d — the row counter; the row body is entered by the
    // `jmp 0x2dab46` @0x2dab29 and re-entered from @0x2dab30..@0x2dab40.
    for (let row = 0; row < height; row += 1) {
      // @0x2dab46 xorl %ebx,%ebx ; xorl %r11d,%r11d ; @0x2dab4b vmovaps %ymm0,%ymm3
      const ymm3: number[] = ymm0.slice();
      let elem = 0; // %r11, kept in f32 elements rather than bytes
      let ebx = 0; // the NEGATED count of pixels already written on this row

      // ── 256-bit body @0x2dab50..0x2dabc8 — TWO pixels per iteration ──
      // A do/while: width >= 2 guarantees the first pass.
      for (;;) {
        const v: number[] = new Array<number>(8);
        for (let i = 0; i < 8; i += 1) {
          // @0x2dab50 vmovups (%rdx,%r11),%ymm4 — 8 source lanes (unaligned).
          // @0x2dab56 movq 0x198(%rdi),%r14     — the params block, re-loaded here.
          // @0x2dab5d vmulps (%r14),%ymm4,%ymm4 — scale.
          v[i] = f32(f32(srcPlane[srcRow + elem + i]) * params[P_SCALE + i]);
        }
        // @0x2dab77..0x2daba1 — the crop mask for both pixels of the pair.
        const maskLo = cropMask(ymm3, 0, 0);
        const maskHi = cropMask(ymm3, 4, 4);
        for (let i = 0; i < 8; i += 1) {
          // @0x2dab96 vaddps 0x20(%r14),%ymm4,%ymm4 — bias (issued between the two
          // compares in the machine's schedule; it feeds only the final multiply).
          const biased = f32(v[i] + params[P_BIAS + i]);
          // @0x2daba5 vmulps %ymm5,%ymm4,%ymm4 ; @0x2daba9 vmovups %ymm4,(%rcx,%r11)
          dstPlane[dstRow + elem + i] = f32(biased * (i < 4 ? maskLo[i] : maskHi[i - 4]));
        }
        // @0x2dabaf vaddps %ymm1,%ymm3,%ymm3 — advance both lanes by two pixels.
        for (let i = 0; i < 8; i += 1) {
          ymm3[i] = f32(ymm3[i] + X_STEP_PER_PAIR[i]);
        }
        elem += 8; // @0x2dabb3 addq $0x20,%r11 (32 bytes = 8 f32 lanes)
        // @0x2dabb7..0x2dabc8 — movl %ebx,%r14d ; addl $-2,%ebx ; addl %r9d,%r14d ;
        //                       addl $-2,%r14d ; cmpl $0x1,%r14d ; jg 0x2dab50
        const r14 = (ebx + width - 2) | 0;
        ebx = (ebx - 2) | 0;
        if (!(r14 > 1)) {
          break;
        }
      }

      // @0x2dabca negl %ebx ; @0x2dabcc cmpl %ebx,%r9d ; @0x2dabcf jle 0x2dab30
      const pixelsDone = -ebx | 0;
      if (width > pixelsDone) {
        // ── 128-bit odd-pixel tail @0x2dabd5..0x2dac2f — ONE pixel ──
        const v: number[] = new Array<number>(4);
        for (let i = 0; i < 4; i += 1) {
          // @0x2dabd5 vmovaps (%rdx,%r11),%xmm4 (an ALIGNED load here, unlike the
          // 256-bit body's vmovups — no observable difference to the value port).
          // @0x2dabe2 vmulps (%rbx),%xmm4,%xmm4 ; @0x2dabe6 vaddps 0x20(%rbx),%xmm4
          v[i] = f32(f32(f32(srcPlane[srcRow + elem + i]) * params[P_SCALE + i])
            + params[P_BIAS + i]);
        }
        const mask = cropMask(ymm3, 0, 0);
        for (let i = 0; i < 4; i += 1) {
          // @0x2dac25 vmulps %xmm3,%xmm4,%xmm3 ; @0x2dac29 vmovaps %xmm3,(%rcx,%r11)
          dstPlane[dstRow + elem + i] = f32(v[i] * mask[i]);
        }
      }

      // @0x2dab30 vaddps %ymm2,%ymm0,%ymm0 — next row's y.
      for (let i = 0; i < 8; i += 1) {
        ymm0[i] = f32(ymm0[i] + Y_STEP_PER_ROW[i]);
      }
      // @0x2dab37 addq %rsi,%rdx ; @0x2dab3a addq %r8,%rcx
      srcRow += srcRowElems;
      dstRow += dstRowElems;
      // @0x2dab3d cmpl %eax,%r10d ; @0x2dab40 je 0x2dacb9 — the loop bound.
      void row;
    }
  } else if (width === 1) {
    // ── @0x2dac34 cmpl $0x1,%r9d ; jne 0x2dacb9 — width <= 0 exits here. ──
    // The 128-bit-only row loop @0x2dac50..0x2dacb7. Note it advances ymm0 itself
    // (there is no per-row ymm3 copy) and re-loads the params block every row.
    for (let row = 0; row < height; row += 1) {
      const v: number[] = new Array<number>(4);
      for (let i = 0; i < 4; i += 1) {
        // @0x2dac50 vmovaps (%rdx),%xmm2 ; @0x2dac54 movq 0x198(%rdi),%r9
        // @0x2dac5b vmulps (%r9),%xmm2,%xmm2 ; @0x2dac60 vaddps 0x20(%r9),%xmm2,%xmm2
        v[i] = f32(f32(f32(srcPlane[srcRow + i]) * params[P_SCALE + i])
          + params[P_BIAS + i]);
      }
      // @0x2dac66..0x2dac9f — the same crop test, on ymm0's low lane.
      const mask = cropMask(ymm0, 0, 0);
      for (let i = 0; i < 4; i += 1) {
        // @0x2daca3 vmulps %xmm3,%xmm2,%xmm2 ; @0x2daca7 vmovaps %xmm2,(%rcx)
        dstPlane[dstRow + i] = f32(v[i] * mask[i]);
      }
      // @0x2dacab vaddps %ymm1,%ymm0,%ymm0 — y += 1 (the SAME 0x88ef60 constant).
      for (let i = 0; i < 8; i += 1) {
        ymm0[i] = f32(ymm0[i] + Y_STEP_PER_ROW[i]);
      }
      // @0x2dacaf addq %rsi,%rdx ; @0x2dacb2 addq %r8,%rcx ; @0x2dacb5 decl %eax
      srcRow += srcRowElems;
      dstRow += dstRowElems;
      void row;
    }
  }

  // @0x2dacb9..0x2dacc2 — popq/vzeroupper/xorl %eax,%eax/retq.
  return 0;
}
