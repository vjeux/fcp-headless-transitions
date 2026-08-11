// Gettype1_half_satTile_AVX.ts — raw transcription of the Helium file-local
// (internal-linkage, `__ZL…`) tile kernel
// `Gettype1_half_satTile_AVX(HGTile*, HGToneCurve::State*, HGNode*)`.
//
// One of `HGToneCurve`'s CPU fallback kernels: the AVX "type 1, half
// saturation" tone-curve tile pass. For every pixel of the tile it
// un-premultiplies by alpha, clamps, raises the result to a power via a
// log2/exp2 polynomial pair, applies a gain, substitutes a pass-through value
// below a threshold, clamps to 1 and re-premultiplies — all in float32.
//
// ONE symbol is transcribed in this file. The class it serves,
// `HGToneCurve`, is a SEPARATE landed file (raw-port/src/render/HGToneCurve.ts)
// and is not touched here; the sibling `Get…Tile_AVX` kernels are their own
// ledger units and are NOT ported here.
//
// Provenance (Helium framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// Symbol ported in this file:
//   @0x275cf0  Gettype1_half_satTile_AVX(HGTile*, HGToneCurve::State*, HGNode*)
//                __ZL25Gettype1_half_satTile_AVXP6HGTilePN11HGToneCurve5StateEP6HGNode
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym __ZL25Gettype1_half_satTile_AVXP6HGTilePN11HGToneCurve5StateEP6HGNode Helium`):
//   raw-port/re/disasm/Helium.__ZL25Gettype1_half_satTile_AVXP6HGTilePN11HGToneCurve5StateEP6HGNode.s
//   (193 lines)
//
// ---------------------------------------------------------------------------
// HGTile FIELDS READ (all in the prologue @0x275cf0..0x275d1c)
// ---------------------------------------------------------------------------
//   +0x00 i32 x0          `subl (%rdi),%ecx`        @0x275d06
//   +0x04 i32 y0          `subl 0x4(%rdi),%eax`     @0x275cf3
//   +0x08 i32 x1          `movl 0x8(%rdi),%ecx`     @0x275d03
//   +0x0c i32 y1          `movl 0xc(%rdi),%eax`     @0x275cf0
//   +0x10 f32* dst        `movq 0x10(%rdi),%r8`     @0x275d0c
//   +0x18 i32 dstStride   `movslq 0x18(%rdi),%rdx`  @0x275d08, then `shlq $0x4`
//                         @0x275d18 — a stride in 16-BYTE PIXELS, scaled to bytes
//   +0x50 f32* src        `movq 0x50(%rdi),%r9`     @0x275d10
//   +0x58 i32 srcStride   `movslq 0x58(%rdi),%rdi`  @0x275d14, `shlq $0x4` @0x275d1c
// The third parameter (`HGNode*`, %rdx) is NEVER read: %rdx is overwritten by
// the dst-stride load at @0x275d08 before any use.
//
// ---------------------------------------------------------------------------
// LOOP STRUCTURE
// ---------------------------------------------------------------------------
//   rows   = y1 - y0   (@0x275cf0..0x275cf6; `jle` -> return immediately)
//   cols   = x1 - x0   (@0x275d03..0x275d06)
//   for each row (counter %r10d, advance @0x275d30: src += srcStride,
//                 dst += dstStride, `cmpl %eax,%r10d ; je` @0x275d39):
//     * WIDE PATH @0x275d60 — 8 floats (TWO pixels) per iteration, entered only
//       when `cols >= 2` (`cmpl $0x2,%ecx ; jl` @0x275d48). The loop counter
//       trick @0x275f0e..0x275f20 keeps `%r11d` at MINUS the pixels done and
//       continues while at least two pixels remain; `negl %r11d` @0x275f26 turns
//       it back into a positive count.
//     * TAIL PATH @0x275f39 — the same expression on FOUR floats (ONE pixel),
//       run only when `%r11d < cols` (@0x275f29), i.e. for the odd last pixel.
//   The two paths compute the IDENTICAL per-pixel expression; the wide one is
//   simply that expression applied to the two 128-bit halves of a ymm register
//   (every cross-lane operation it uses — `vshufps` 0xff/0x00, `vblendps` 0x88,
//   and the `vextractf128`/`vinsertf128` pairs around `vpsrld`/`vpslld` — is
//   per-128-bit-half, i.e. per pixel). That is why the transcription below
//   factors the expression into ONE function and calls it from both loops, with
//   the tail path's own addresses cited alongside the wide path's.
//
// ---------------------------------------------------------------------------
// HGToneCurve::State SLOTS READ (byte offsets from %rsi)
// ---------------------------------------------------------------------------
// The State block is the over-aligned 0x1d47-byte allocation the landed
// `HGToneCurve` port documents at HGToneCurve+0x1b0 and deliberately leaves
// opaque ("a full State-layout decode is deferred"). This kernel pins the
// slots it reads. The SCALARS are written by `HGToneCurve::SetShaderParams`
// @0x248840 (a separate, unported ledger unit, so no numeric value is claimed
// for them here). The VECTOR slots are NOT: SetShaderParams loads the State
// pointer from `this+0x1b0` and writes only +0x04..+0x20, while every 0x20-byte
// vector slot below is written by `HGToneCurve::State::State()` @0x249860 from
// Helium rodata. Two of them are decoded in place below, because a reviewer
// asked whether the +0x1e0 mask hides the reciprocal deviation; the rest are
// still left unclaimed:
//   scalars, read with `vbroadcastss` (one f32 splat to all lanes):
//     +0x004  @0x275db0 / @0x275f8a   added to the clamped colour before log2
//     +0x000  @0x275e5a / @0x276023   multiplies the log2 result (the exponent)
//     +0x00c  @0x275ecc / @0x27607b   multiplies the exp2 result (the gain)
//     +0x024  @0x275ed2 / @0x276085   subtracted from the clamped colour for
//                                     the pass-through compare
//   256-bit (wide path) / 128-bit (tail path) vector slots:
//     +0x080  @0x275d88   clamp LOW bound, `vorps` merge value, compare rhs
//     +0x0a0  @0x275d90   clamp HIGH bound, mantissa `vorps` value, poly `+`
//     +0x1e0  @0x275d80   mask ANDed into the reciprocal. DECODED (it was left
//                         open at first review): written by
//                         HGToneCurve::State::State() @0x249860 from rodata
//                         0x88c7f0 = ffffffff ffffffff ffffffff 00000000, i.e.
//                         a LANE mask keeping R,G,B and zeroing alpha — NOT a
//                         mantissa mask. See sse_rcpps below.
//     +0x200  @0x275d6c   floor applied to alpha before the reciprocal
//     +0x220  @0x275d78   multiplies the reciprocal. DECODED: State ctor
//                         @0x2499a6 from rodata 0x85fed0 = 0x3f800801 =
//                         1 + 2^-12 + 2^-23, the scale of VRCPPS's own error
//                         bound.
//     +0x240  @0x275dba   mantissa mask
//     +0x260  @0x275dc2   denormal compare threshold
//     +0x280  @0x275dcf   denormal exponent correction
//     +0x2a0  @0x275df5   exponent bias
//     +0x2c0  @0x275dfd   mantissa-range compare value
//     +0x2e0  @0x275e0e   mantissa-range correction multiplier
//     +0x300  @0x275e26   log2 polynomial coefficient A
//     +0x320  @0x275e2e   log2 polynomial coefficient B
//     +0x340  @0x275e3e   log2 polynomial coefficient C
//     +0x360  @0x275e46   log2 polynomial coefficient D
//     +0x380  @0x275e63   floor applied to the exponent product
//     +0x3a0  @0x275e75   exp2 polynomial coefficient A
//     +0x3c0  @0x275e7d   exp2 polynomial coefficient B
//     +0x3e0  @0x275e89   exp2 polynomial coefficient C
//     +0x400  @0x275ea1   INTEGER slot (`vmovdqa`, 128-bit): the exponent bias
//                         added before the `<< 23` scale rebuild. NOTE it is
//                         read as an xmm and applied to BOTH halves of the ymm
//                         (@0x275ea9 low, @0x275eb3 high), so lanes 0..3 of this
//                         slot serve all eight float lanes.
//     +0x920  @0x275da0   mask ANDed with the SOURCE pixel to build the
//                         pass-through value
//
// CALLEES: none. The whole body is AVX arithmetic — no `callq`, no `jmpq *`,
// no in-scope call and no extern (`depgraph.py deps` lists nothing).

/** f32 rounding after every float op (PORTING_SPEC Rule 4). */
const f32 = Math.fround;

/** Scratch for the float32 <-> int32 bit reinterpretations the body performs
 *  with `vandps` / `vorps` / `vpsrld` / `vpslld` / `vcvttps2dq`. */
const BITS = new DataView(new ArrayBuffer(4));

/** Raw bits of an f32 (as a SIGNED int32, matching x86 integer lanes). */
function bitsOfF32(x: number): number {
  BITS.setFloat32(0, f32(x), true);
  return BITS.getInt32(0, true);
}

/** The f32 with these raw bits. */
function f32OfBits(b: number): number {
  BITS.setInt32(0, b | 0, true);
  return BITS.getFloat32(0, true);
}

/**
 * A bounds-checked f32 load, used for every table read in this file.
 *
 * The machine's loads are raw pointer arithmetic: an out-of-range index is a
 * wild read, never a defined value. TypeScript would instead hand back
 * `undefined`, which turns the surrounding arithmetic into NaN and then into a
 * plausible-looking 0 — the exact silent-wrong-answer class G7 exists to stop
 * (#255). So every read goes through here and an out-of-range index RAISES
 * instead of quietly poisoning the pixel. Every call site below is proven
 * in-range by the loop bounds, so this never fires for a well-formed tile.
 */
function ldF32(a: Float32Array, i: number): number {
  const v = a[i];
  if (v === undefined) {
    throw new RangeError(
      `Gettype1_half_satTile_AVX @Helium 0x275cf0: f32 index ${i} out of range (len ${a.length})`,
    );
  }
  return f32(v);
}

/** The i32 counterpart of {@link ldF32} — used only for the +0x400 slot. */
function ldI32(a: Int32Array, i: number): number {
  const v = a[i];
  if (v === undefined) {
    throw new RangeError(
      `Gettype1_half_satTile_AVX @Helium 0x275cf0: i32 index ${i} out of range (len ${a.length})`,
    );
  }
  return v | 0;
}

/**
 * `vmaxps` lane semantics: `MAXPS(src1, src2) = (src1 < src2) ? src2 : src1`.
 * The second operand wins on NaN and on equal-magnitude zeros — the reason
 * this is not written as `Math.max`. Cited @0x275d6c, @0x275da8, @0x275e63.
 */
function maxps(src1: number, src2: number): number {
  return f32(src1) < f32(src2) ? f32(src2) : f32(src1);
}

/**
 * `vminps` lane semantics: `MINPS(src1, src2) = (src2 < src1) ? src2 : src1`.
 * Cited @0x275dac, @0x275ef0.
 */
function minps(src1: number, src2: number): number {
  return f32(src2) < f32(src1) ? f32(src2) : f32(src1);
}

/**
 * `vrcpps` — the hardware reciprocal ESTIMATE (12-bit mantissa, LUT-based),
 * cited @0x275d74 (wide path) and @0x275f4e (tail path; both call sites share
 * this one helper).
 *
 * WHAT THIS FUNCTION IS NOT. It is not the instruction. `VRCPPS` returns an
 * estimate whose only architectural guarantee is |relative error| <= 1.5*2^-12;
 * the exact bit pattern is implementation-defined and is not part of the public
 * ISA spec, so it cannot be reproduced portably. This computes IEEE `1/x` in
 * f32 instead. THERE IS NO NEWTON STEP AT THIS SITE to hide behind: the next
 * instruction @0x275d78 is `vmulps 0x220(%rsi)`, a constant multiply, and
 * @0x275d80 is a mask — neither refines the estimate.
 *
 * WHY THE EXACT RECIPROCAL IS STILL THE RIGHT MODEL, rather than one CPU's
 * error curve. The non-AVX sibling `__ZL17Gettype1_halfTile` @0x264d50 uses
 * bare `rcpps` too (@0x264df6, @0x264fc3, no refinement), but Apple's ARM64
 * build of the SAME source computes that reciprocal as `frecpe.4s` followed by
 * `frecps.4s` (@0x21f0b4/@0x21f0c8) — a Newton step, i.e. 23-bit accurate. So
 * Apple ships two builds whose reciprocals differ from each other by more than
 * either differs from `1/x`. The source expression is a plain reciprocal and
 * the estimate is a per-ISA codegen choice.
 *
 * THE SIZE OF THE DEVIATION, MEASURED rather than asserted
 * (raw-port/re/oracle/Gettype1_half_satTile_AVX_oracle.py, which calls this
 * kernel live — AVX does execute under Rosetta 2 on the build box): over 108
 * lanes of a bit-pattern corpus, 87 are bit-exact against the live kernel and
 * 21 differ, worst case 1337 ULP and 1.09e-04 relative — inside `VRCPPS`'s
 * 1.5*2^-12 = 3.66e-04 bound, and every differing lane is downstream of this
 * call. Alpha lanes and pass-through pixels are unaffected.
 *
 * THE +0x1e0 MASK DOES NOT HIDE IT — this was an open question at review time
 * and it is now closed. `vandps 0x1e0(%rsi)` @0x275d80 masks the scaled
 * reciprocal immediately after this call, and if that mask cleared low mantissa
 * bits the deviation would be invisible. It does not. The slot is not written
 * by `HGToneCurve::SetShaderParams` @0x248840 (that writes only the small
 * scalar slots, +0x04..+0x20, through the State pointer at `this+0x1b0`); it is
 * written by `HGToneCurve::State::State()` @0x249860 —
 *
 *     0x249975  movaps 0x642e74(%rip), %xmm0    ; 0x24997c + 0x642e74 = 0x88c7f0
 *     0x249983  movaps %xmm0, 0x1e0(%rdi)
 *
 * — and the 16 bytes at 0x88c7f0 are `ffffffff ffffffff ffffffff 00000000`,
 * a LANE mask that keeps R, G, B and zeroes alpha. Every mantissa bit of the
 * reciprocal survives into the colour multiply @0x275d9c. Confirmed twice: by
 * decoding the ctor, and by reading +0x1e0 out of a live State built by that
 * ctor.
 *
 * ONE MORE THING WORTH KNOWING, since it is the strongest argument that the
 * machine's value and `1/x` are genuinely different quantities: the constant at
 * +0x220 that scales the estimate @0x275d78 is **0x3f800801 = 1 + 2^-12 +
 * 2^-23** (State ctor @0x2499a6, rodata 0x85fed0). That is the magnitude of
 * `VRCPPS`'s own error bound — the binary is compensating for the estimate, not
 * merely tolerating it. The port applies the same constant to an exact
 * reciprocal, which is the documented consequence of the modelling choice
 * above.
 */
function sse_rcpps(x: number): number {
  // @0x275d74 / @0x275f4e  vrcpps
  return f32(1.0 / f32(x));
}

/**
 * `vroundps $0x9` — round toward -inf (imm8 bit0..1 = 01 "round down",
 * bit3 = 1 "suppress precision exception"). Cited @0x275e6b / @0x276034.
 */
function roundDownPs(x: number): number {
  return f32(Math.floor(f32(x)));
}

/**
 * `vcvttps2dq` — truncating float -> int32 conversion. Cited @0x275e9d /
 * @0x276062. Out-of-range inputs produce the x86 "integer indefinite"
 * 0x80000000, which `| 0` on a truncated JS number does not reproduce, so the
 * out-of-range case is written out explicitly.
 */
function cvttps2dq(x: number): number {
  const t = Math.trunc(f32(x));
  if (!Number.isFinite(t) || t < -2147483648 || t > 2147483647) {
    return -2147483648; // x86 integer indefinite
  }
  return t | 0;
}

/**
 * The `HGToneCurve::State` block as this kernel addresses it: one raw byte
 * block, read at fixed offsets both as f32 lanes and as i32 lanes (the +0x400
 * slot is an integer one). Both views must alias the SAME buffer, exactly as
 * the single `%rsi` base pointer does in the machine code.
 *
 * @Helium 0x275cf0
 */
export interface HGToneCurveStateBlock {
  /** f32 view of the State block (index = byteOffset / 4). */
  readonly f32: Float32Array;
  /** i32 view of the SAME bytes (index = byteOffset / 4). */
  readonly i32: Int32Array;
}

/**
 * The `HGTile` fields this kernel reads. Named after the offsets listed in the
 * file header; nothing else about HGTile is modelled here.
 *
 * @Helium 0x275cf0
 */
export interface Gettype1HalfSatTile {
  /** +0x00 — x0. */ readonly x0: number;
  /** +0x04 — y0. */ readonly y0: number;
  /** +0x08 — x1. */ readonly x1: number;
  /** +0x0c — y1. */ readonly y1: number;
  /** +0x10 — destination pixels, f32 RGBA (4 floats per pixel). */
  readonly dst: Float32Array;
  /** float index of the tile's first destination pixel inside {@link dst}. */
  readonly dstBase: number;
  /** +0x18 — destination row stride, in 16-byte PIXELS. */
  readonly dstRowStridePixels: number;
  /** +0x50 — source pixels, f32 RGBA. */
  readonly src: Float32Array;
  /** float index of the tile's first source pixel inside {@link src}. */
  readonly srcBase: number;
  /** +0x58 — source row stride, in 16-byte PIXELS. */
  readonly srcRowStridePixels: number;
}

/**
 * `HGNode` — the third parameter. Declared only so the ported signature keeps
 * the ABI's three arguments; the body never reads it (see the file header).
 *
 * @Helium 0x275cf0
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HGNode {}

/**
 * The per-pixel expression both machine paths compute, transcribed once.
 *
 * `lane` is the pixel's 0-based lane inside the 128-bit half being processed
 * (0..3 = R,G,B,A), and `half` is 0 for the low half / the tail path and 4 for
 * the high half of the wide path — the offset that selects which lanes of the
 * 256-bit State constants apply. The `+0x400` integer slot is deliberately
 * indexed WITHOUT `half`, because the machine reads it as an xmm and adds the
 * same four lanes to both halves (@0x275ea9 / @0x275eb3).
 *
 * Instruction order is the wide path's; the tail path's corresponding address
 * is given after a slash where the two differ.
 */
function tonecurveType1HalfSatPixel(
  st: HGToneCurveStateBlock,
  half: number,
  px: readonly [number, number, number, number],
): [number, number, number, number] {
  const F = st.f32;
  const I = st.i32;
  /** f32 State lane for a byte offset, in the half being processed. */
  const c = (byteOff: number, lane: number): number =>
    ldF32(F, (byteOff >> 2) + half + lane);
  /** the broadcast (`vbroadcastss`) scalars — one lane, splat to all. */
  const bc = (byteOff: number): number => ldF32(F, byteOff >> 2);

  const out: [number, number, number, number] = [0, 0, 0, 0];

  // @0x275d67 / (tail @0x275f39 loads it directly with `vbroadcastss 0xc(...)`)
  //   vshufps $0xff — the pixel's ALPHA broadcast over all four lanes.
  const alpha = f32(px[3]);

  /**
   * The un-premultiply factor for one lane — the chain
   * @0x275d6c..0x275d98 (tail @0x275f40..0x275f72). Its float input is the
   * same broadcast alpha in every lane; only the State constants are read per
   * lane, which is why it is a function of the lane rather than a table.
   */
  const reciprocalForLane = (lane: number): number => {
    // @0x275d6c / @0x275f40  vmaxps 0x200(%rsi) — floor the alpha.
    let r = maxps(alpha, c(0x200, lane));
    // @0x275d74 / @0x275f4e  vrcpps — the 12-bit estimate. Both paths share
    // this helper; see its doc comment for what the port emits instead, the
    // measured size of the difference, and why the +0x1e0 mask below does not
    // absorb it.
    r = sse_rcpps(r);
    // @0x275d78 / @0x275f52  vmulps 0x220(%rsi)
    r = f32(r * c(0x220, lane));
    // @0x275d80 / @0x275f5a  vandps 0x1e0(%rsi) — bitwise, not arithmetic.
    let rb = bitsOfF32(r) & bitsOfF32(c(0x1e0, lane));
    // @0x275d98 / @0x275f72  vorps with the +0x80 slot.
    rb |= bitsOfF32(c(0x80, lane));
    return f32OfBits(rb);
  };

  // Lane 3's factor is needed twice more below (the re-premultiply and the
  // alpha passthrough), so it is named once here.
  const recipAlphaLane = reciprocalForLane(3);
  // @0x275d9c / @0x275f76  vmulps — the un-premultiplied ALPHA (lane 3 of
  // `source * reciprocal`, the value %ymm0 still holds at @0x275ef4).
  const unpremultipliedAlpha = f32(f32(px[3]) * recipAlphaLane);

  for (let lane = 0; lane < 4; lane++) {
    const one = c(0xa0, lane); // the +0xa0 slot: clamp high / mantissa or / poly +
    const lo = c(0x80, lane); // the +0x80 slot: clamp low / compare rhs

    // @0x275d9c / @0x275f76  vmulps — un-premultiply: colour * reciprocal.
    const u = f32(f32(px[lane]) * reciprocalForLane(lane));

    // @0x275da0 / @0x275f7a  vandps 0x920(%rsi) with the SOURCE pixel, then
    // @0x275e91 / @0x27604e  vorps with +0x80. Only lane 0 of the result is
    // used (@0x275ee0 / @0x27608f broadcast it), so it is computed from lane 0.
    const passThroughBits =
      (bitsOfF32(px[0]) & bitsOfF32(c(0x920, 0))) | bitsOfF32(c(0x80, 0));
    const passThrough = f32OfBits(passThroughBits);

    // @0x275da8 / @0x275f82  vmaxps +0x80 ; @0x275dac / @0x275f86  vminps +0xa0
    const clamped = minps(maxps(u, lo), one);

    // @0x275db0/@0x275db6 (tail @0x275f8a/@0x275f90)  vbroadcastss 0x4 ; vaddps
    const x = f32(clamped + bc(0x04));

    // ---- log2(x) ----------------------------------------------------------
    // @0x275dba / @0x275f94  vandps 0x240 — mantissa bits.
    let mBits = bitsOfF32(x) & bitsOfF32(c(0x240, lane));
    // @0x275dcb / @0x275fa5  vorps +0xa0 — glue the 1.0 exponent on.
    mBits |= bitsOfF32(one);
    const m = f32OfBits(mBits);

    // @0x275dc2 / @0x275f9c  vcmpltps 0x260 ; @0x275dcf / @0x275fa9 vandps 0x280
    const denormFix = f32(x) < c(0x260, lane) ? c(0x280, lane) : 0;

    // @0x275dd7..0x275ded (tail @0x275fb1/@0x275fb6)
    //   vpsrld $0x17 (LOGICAL shift, per 128-bit half) ; vcvtdq2ps
    let e = f32((bitsOfF32(x) >>> 23) | 0);
    // @0x275df1 / @0x275fba  vsubps — the denormal correction.
    e = f32(e - denormFix);
    // @0x275df5 / @0x275fbe  vsubps 0x2a0 — the exponent bias.
    e = f32(e - c(0x2a0, lane));

    // @0x275dfd..0x275e0a (tail @0x275fc6..0x275fd3)
    //   vcmpltps: is the +0x2c0 value BELOW the mantissa? then take +0xa0.
    const g = c(0x2c0, lane) < m ? one : 0;
    // @0x275e16 / @0x275fd7  vaddps — fold that into the exponent.
    e = f32(e + g);
    // @0x275e0e/@0x275e1a (tail @0x275fdb/@0x275fe3)  vmulps 0x2e0 ; vmulps m
    const corr = f32(f32(g * c(0x2e0, lane)) * m);
    // @0x275e1e / @0x275fe7  vsubps +0xa0 ; @0x275e22 / @0x275feb  vsubps corr
    const fr = f32(f32(m - one) - corr);

    // @0x275e26..0x275e52 (tail @0x275fef..0x27601b) — the 4-coefficient
    //   polynomial: (fr*A + B)*fr² + (fr*C + D), then * fr.
    const ab = f32(f32(fr * c(0x300, lane)) + c(0x320, lane));
    const sq = f32(fr * fr);
    const cd = f32(f32(fr * c(0x340, lane)) + c(0x360, lane));
    const poly = f32(f32(sq * ab) + cd);
    // @0x275e56 / @0x27601f  vaddps — log2 result.
    const log2x = f32(e + f32(poly * fr));

    // ---- exp2(k0 * log2x) -------------------------------------------------
    // @0x275e5a/@0x275e5f (tail @0x276023/@0x276028)  vbroadcastss 0x0 ; vmulps
    let y = f32(bc(0x00) * log2x);
    // @0x275e63 / @0x27602c  vmaxps 0x380
    y = maxps(y, c(0x380, lane));
    // @0x275e6b / @0x276034  vroundps $0x9 — floor.
    const fl = roundDownPs(y);
    // @0x275e71 / @0x27603a  vsubps
    const frac = f32(y - fl);
    // @0x275e75..0x275e95 (tail @0x27603e..0x27605e) — 3-coefficient polynomial.
    let q = f32(f32(frac * c(0x3a0, lane)) + c(0x3c0, lane));
    q = f32(f32(frac * q) + c(0x3e0, lane));
    q = f32(frac * q);
    // @0x275e99 / @0x27606e  vaddps +0xa0
    q = f32(q + one);
    // @0x275e9d..0x275ec2 (tail @0x276062..0x276072)
    //   vcvttps2dq ; vpaddd +0x400 ; vpslld $0x17 — rebuild 2^floor(y).
    const scale = f32OfBits(
      ((cvttps2dq(fl) + ldI32(I, (0x400 >> 2) + lane)) | 0) << 23,
    );
    // @0x275ec8 / @0x276077  vmulps
    let v = f32(q * scale);
    // @0x275ecc/@0x275ed8 (tail @0x27607b/@0x276081)  vbroadcastss 0xc ; vmulps
    v = f32(bc(0x0c) * v);

    // ---- pass-through select, clamp, re-premultiply -----------------------
    // @0x275ed2/@0x275edc (tail @0x276085/@0x27608b) vbroadcastss 0x24 ; vsubps
    const t = f32(clamped - bc(0x24));
    // @0x275ee5/@0x275eea (tail @0x276094/@0x276099)  vcmpltps +0x80 ; vblendvps
    //   — below the threshold the broadcast pass-through value wins.
    let res = f32(t) < lo ? passThrough : v;
    // @0x275ef0 / @0x27609f  vminps +0xa0
    res = minps(res, one);
    // @0x275ef4/@0x275ef9 (tail @0x2760a3/@0x2760a8)  vshufps $0xff ; vmulps
    //   — re-premultiply by LANE 3 OF THE UN-PREMULTIPLIED VECTOR (%ymm0 still
    //   holds `source * reciprocal` from @0x275d9c / @0x275f76), i.e. by
    //   `alpha * reciprocal`, not by the reciprocal alone and not by the raw
    //   source alpha.
    res = f32(res * unpremultipliedAlpha);

    out[lane] = res;
  }

  // @0x275efd / @0x2760ac  vblendps $0x88 / $0x8 — lane 3 (alpha) is taken from
  // the UN-PREMULTIPLIED vector (source colour * reciprocal), bypassing the
  // whole tone curve.
  out[3] = unpremultipliedAlpha;

  return out;
}

/**
 * `Gettype1_half_satTile_AVX(HGTile*, HGToneCurve::State*, HGNode*)`
 *   — @Helium 0x275cf0
 *   — __ZL25Gettype1_half_satTile_AVXP6HGTilePN11HGToneCurve5StateEP6HGNode
 *
 * Prologue / loop skeleton, transcribed instruction by instruction:
 *
 *   0x275cf0  movl  0xc(%rdi),%eax        ; eax = tile.y1
 *   0x275cf3  subl  0x4(%rdi),%eax        ; eax = y1 - y0 = rows
 *   0x275cf6  jle   0x2760c1              ; rows <= 0 -> return (no frame set up)
 *   0x275cfc  pushq %rbp … pushq %rbx     ; frame (no TS counterpart)
 *   0x275d03  movl  0x8(%rdi),%ecx        ; ecx = tile.x1
 *   0x275d06  subl  (%rdi),%ecx           ; ecx = x1 - x0 = cols
 *   0x275d08  movslq 0x18(%rdi),%rdx      ; dst row stride (pixels, sign-extended)
 *   0x275d0c  movq  0x10(%rdi),%r8        ; dst pointer
 *   0x275d10  movq  0x50(%rdi),%r9        ; src pointer
 *   0x275d14  movslq 0x58(%rdi),%rdi      ; src row stride (pixels)
 *   0x275d18  shlq  $0x4,%rdx             ; -> bytes (16 bytes per pixel)
 *   0x275d1c  shlq  $0x4,%rdi             ; -> bytes
 *   0x275d20  xorl  %r10d,%r10d           ; row = 0
 *   0x275d23  jmp   0x275d42              ; enter the row body
 *   -- row advance --
 *   0x275d30  addq  %rdi,%r9              ; src += srcStride
 *   0x275d33  addq  %rdx,%r8              ; dst += dstStride
 *   0x275d36  incl  %r10d                 ; ++row
 *   0x275d39  cmpl  %eax,%r10d ; je       ; row == rows -> done
 *   -- row body --
 *   0x275d42  movl  $0x0,%r11d            ; pixels done = 0
 *   0x275d48  cmpl  $0x2,%ecx ; jl        ; cols < 2 -> straight to the tail
 *   0x275d51  movl  $0x10,%ebx            ; byte cursor (pre-biased by +0x10;
 *                                         ;   every access is `-0x10(reg,%rbx)`)
 *   0x275d56  xorl  %r11d,%r11d
 *   … wide body @0x275d60 (see tonecurveType1HalfSatPixel) …
 *   0x275f0a  addq  $0x20,%rbx            ; advance 32 bytes = 2 pixels
 *   0x275f0e  movl  %r11d,%r14d
 *   0x275f11  addl  $-0x2,%r11d           ; r11 = -(pixels done)
 *   0x275f15  addl  %ecx,%r14d
 *   0x275f18  addl  $-0x2,%r14d           ; r14 = pixels remaining after this pair
 *   0x275f1c  cmpl  $0x1,%r14d ; jg       ; keep going while >= 2 remain
 *   0x275f26  negl  %r11d                 ; r11 = pixels done (positive)
 *   0x275f29  cmpl  %ecx,%r11d ; jge      ; nothing left -> next row
 *   0x275f32  movl  %r11d,%r11d ; shlq $0x4 ; byte offset of the last pixel
 *   … tail body @0x275f39 …
 *   0x2760b2  vmovaps %xmm0,(%r8,%r11)    ; store the single pixel
 *   0x2760b8  jmp   0x275d30              ; next row
 *   0x2760bd  popq … ; 0x2760c1 vzeroupper ; 0x2760c4 retq
 *
 * Decode notes:
 *   * the early `jle` @0x275cf6 returns BEFORE the prologue — an empty tile
 *     costs nothing, and `vzeroupper` @0x2760c1 is shared by both exits.
 *   * both strides are `movslq` (SIGN-extended) then `shlq $0x4`: they are
 *     signed pixel counts, and a NEGATIVE stride (bottom-up image) is legal.
 *     The port keeps them signed and multiplies by 4 floats per pixel.
 *   * the wide loop's cursor `%rbx` starts at 0x10 and every access is
 *     `-0x10(%r9,%rbx)`, i.e. the first pair sits at offset 0. The port indexes
 *     pixels directly instead of carrying the +0x10 bias, which addresses the
 *     same bytes.
 *   * the columns loop never reads or writes outside `[0, cols)`: the wide path
 *     stops with at most one pixel left and the tail path handles exactly that
 *     one (`cmpl %ecx,%r11d ; jge` @0x275f29).
 *   * ZERO callees (`depgraph.py deps` lists nothing).
 *
 * @param tile  the HGTile in %rdi.
 * @param st    the HGToneCurve::State constant block in %rsi.
 * @param _node the HGNode in %rdx — never read (see the file header).
 */
export function Gettype1_half_satTile_AVX(
  tile: Gettype1HalfSatTile,
  st: HGToneCurveStateBlock,
  _node: HGNode | null,
): void {
  // @0x275cf0..0x275cf6  movl 0xc(%rdi),%eax ; subl 0x4(%rdi),%eax ; jle
  const rows = (tile.y1 - tile.y0) | 0;
  if (rows <= 0) {
    return;
  }

  // @0x275d03..0x275d06  movl 0x8(%rdi),%ecx ; subl (%rdi),%ecx
  const cols = (tile.x1 - tile.x0) | 0;

  // @0x275d08..0x275d1c  the two strides, sign-extended and scaled to bytes.
  // Here: scaled to FLOATS (4 per pixel) because the buffers are Float32Array.
  const dstRowStride = (tile.dstRowStridePixels | 0) * 4;
  const srcRowStride = (tile.srcRowStridePixels | 0) * 4;

  // @0x275d0c / @0x275d10  the two base pointers, advanced per row @0x275d30.
  let dstRow = tile.dstBase | 0;
  let srcRow = tile.srcBase | 0;

  // @0x275d20  xorl %r10d,%r10d — the row counter.
  for (let row = 0; row < rows; row++) {
    // @0x275d42  movl $0x0,%r11d
    let done = 0;

    // @0x275d48  cmpl $0x2,%ecx ; jl 0x275f29 — the wide path needs two pixels.
    if (cols >= 2) {
      // -- WIDE PATH @0x275d60: two pixels (8 floats) per iteration --
      while (cols - done >= 2) {
        for (let p = 0; p < 2; p++) {
          const s = srcRow + (done + p) * 4;
          const d = dstRow + (done + p) * 4;
          // @0x275d60  vmovups -0x10(%r9,%rbx),%ymm3 — 8 floats = both pixels.
          const px: [number, number, number, number] = [
            ldF32(tile.src, s + 0),
            ldF32(tile.src, s + 1),
            ldF32(tile.src, s + 2),
            ldF32(tile.src, s + 3),
          ];
          // p === 0 is the low 128-bit half (State lanes 0..3), p === 1 the
          // high half (State lanes 4..7).
          const r = tonecurveType1HalfSatPixel(st, p * 4, px);
          // @0x275f03  vmovups %ymm0,-0x10(%r8,%rbx)
          tile.dst[d + 0] = r[0];
          tile.dst[d + 1] = r[1];
          tile.dst[d + 2] = r[2];
          tile.dst[d + 3] = r[3];
        }
        // @0x275f0a..0x275f20  advance by two pixels and re-test.
        done += 2;
      }
    }

    // @0x275f29  cmpl %ecx,%r11d ; jge 0x275d30 — the odd last pixel, if any.
    if (done < cols) {
      const s = srcRow + done * 4;
      const d = dstRow + done * 4;
      // @0x275f48  vmovaps (%r9,%r11),%xmm3 — the single source pixel.
      const px: [number, number, number, number] = [
        ldF32(tile.src, s + 0),
        ldF32(tile.src, s + 1),
        ldF32(tile.src, s + 2),
        ldF32(tile.src, s + 3),
      ];
      // The tail path uses the xmm (LOW) halves of every State constant.
      const r = tonecurveType1HalfSatPixel(st, 0, px);
      // @0x2760b2  vmovaps %xmm0,(%r8,%r11)
      tile.dst[d + 0] = r[0];
      tile.dst[d + 1] = r[1];
      tile.dst[d + 2] = r[2];
      tile.dst[d + 3] = r[3];
    }

    // @0x275d30..0x275d39  src += srcStride ; dst += dstStride ; ++row.
    srcRow += srcRowStride;
    dstRow += dstRowStride;
  }
  // @0x2760c1  vzeroupper ; @0x2760c4  retq
}
