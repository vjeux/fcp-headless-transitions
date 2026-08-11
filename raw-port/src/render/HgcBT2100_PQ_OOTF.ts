// raw-port/src/render/HgcBT2100_PQ_OOTF.ts
//
// FCP `HgcBT2100_PQ_OOTF` — the Helium render-graph node that applies the ITU-R
// BT.2100 Perceptual Quantizer **OOTF** (opto-optical transfer function) to an
// RGBA-float32 texture tile. This file ports ONE method of that class, the
// AVX pixel kernel:
//
//   HgcBT2100_PQ_OOTF::RenderTile_AVX(HGTile*)   @Helium 0x00000000003a59d0
//   `__ZN17HgcBT2100_PQ_OOTF14RenderTile_AVXEP6HGTile`
//
// FRAMEWORK: Helium.framework (x86_64 slice; nm class `t`, i.e. file-local).
//
// Regenerate the decode this port was transcribed from with:
//   bash raw-port/tools/disasm.sh --sym \
//     __ZN17HgcBT2100_PQ_OOTF14RenderTile_AVXEP6HGTile Helium
// 385 instructions, 0x3a59d0..0x3a61b3. `grep -c callq` = 0 — a LEAF: no call of
// any kind, no vtable slot, no RIP-relative constant. Every number it uses is
// read out of the node's parameter bank through `this+0x198`, so this port takes
// that bank as a byte view and reads the same offsets rather than inventing
// values. (Cross-checked against the non-symbolising `otool -arch x86_64 -tv`:
// the two dumps are identical here, so this body is free of the `-V`
// displacement-poisoning artifact recorded in OPS_LOG.)
//
// AT&T operand order (PORTING_SPEC's cheat-sheet): `vop src2, src1, dst` is Intel
// `vop dst, src1, src2`. So `vmaxps %ymm4,%ymm14,%ymm12` is ymm12 = MAXPS(src1=ymm14,
// src2=ymm4), and MAXPS returns src2 on equal AND on unordered. `vcmpltps %ymm2,%ymm4,%ymm2`
// is CMPLT(src1=ymm4, src2=ymm2), i.e. the mask "ymm4 < ymm2".
// `vblendvps mask, src2, src1, dst` sets dst = mask ? src2 : src1.
//
// ── WHAT IT COMPUTES ─────────────────────────────────────────────────────────
// Per RGBA texel, with `p` = the parameter bank (see PARAMETER BANK below):
//
//   c   = max(texel, P2)                       // P2 is a whole float4, normally (0,0,0,0)
//   t   = (P1.x == P2) ? 1 : c                 // per-lane; the "exponent is P2" special case
//   pw  = exp2( P1.x * log2(t) )               // == t ** P1.x
//   out = (P0.w < c) ? (pw*P0.x + P0.y)        // the "above breakpoint" branch
//                    : (c * P0.z)              // the linear-segment branch
//   out.a = texel.a                            // alpha passes through untouched
//   out = (P1.y == P2) ? 1 : out
//   out = exp2( P1.y * log2(out) )             // == out ** P1.y, the second pow
//   out.a = texel.a
//
// i.e. an OOTF of the shape `(a·Y^g + b)^gamma` with a linear segment below a
// breakpoint, evaluated twice through the same vectorised `powf` primitive.
// The two pow evaluations are transcribed SEPARATELY below, instruction by
// instruction, because they are separately register-allocated in the machine
// code and any future divergence between them must stay visible.
//
// `log2` is the classic exponent + polynomial(mantissa) decomposition and `exp2`
// is 2^floor · polynomial(frac); the coefficients are Apple's shared SIMD
// power-function table, identical to the one the landed sibling
// raw-port/src/render/HgcBT2100_PQ_InverseOETF.ts documents (there at slots
// 11..17 / 19..23; here the same values sit one slot lower, at 10..16 / 18..22).
//
// EXACTNESS: the only operations in this kernel are load/store, max, add/sub/mul,
// and/or, the integer exponent shuffles (`vpsrld`/`vpaddd`/`vpslld`), `vroundps`,
// `vcvtdq2ps` and `vcvttps2dq`. There is no `vrcpps`, no `vdivps` and no
// `vsqrtps` — every operation is exactly specified by IEEE-754 or by integer
// semantics, so this port is bit-exact and its oracle demands 0 divergences
// rather than an ulp budget.
//
// ── PARAMETER BANK (`this+0x198`) ────────────────────────────────────────────
// Allocated and filled by the ctor `HgcBT2100_PQ_OOTF::HgcBT2100_PQ_OOTF()`
// @Helium 0x3a6a50 (C2) / 0x3a6cf0 (C1) — a SEPARATE, not-yet-claimed port unit,
// so it is not transcribed here; this file only documents the layout it produces
// because this kernel reads it. `__Znam(0x367)` @0x3a6a69, aligned up to 32 with
// the raw pointer stashed at base-8 (@0x3a6a73..0x3a6a84), stored to `this+0x198`
// @0x3a6cb4. The bank is 26 slots of 32 bytes; each slot holds ONE float4 stored
// TWICE (the ctor's paired `movaps %xmm0, 0x…` writes), so a 32-byte `ymm` load
// of a slot yields (x,y,z,w,x,y,z,w) — one broadcast-ready constant per texel of
// the 2-texel body.
//
//   slot 0 (+0x000)  zeroed by the ctor @0x3a6a8b; the settable float4 P0 —
//                    read here as four `vbroadcastss` scalars +0x00/+0x04/+0x08/+0x0c
//   slot 1 (+0x020)  zeroed @0x3a6a95; the settable float4 P1 — read as the two
//                    scalars +0x20 and +0x24
//   slot 2 (+0x040)  zeroed @0x3a6a9f; the settable float4 P2, read as a VECTOR
//   slot 3 (+0x060)  (1, 1, 1, 0)                  literal @Helium 0x3ca9c0
//   slot 4 (+0x080)  (-FLT_MIN ×3, 0) = 0x807fffff literal @Helium 0x892090  (mantissa|sign mask)
//   slot 5 (+0x0a0)  (+FLT_MIN ×3, 0) = 0x00800000 literal @Helium 0x858f70  (denormal cutoff)
//   slot 6 (+0x0c0)  (+Inf ×3, 0)                  literal @Helium 0x88f440
//   slot 7 (+0x0e0)  (127 ×3, 0)                   literal @Helium 0x88ded0
//   slot 8 (+0x100)  (sqrt(2) ×3, 0)               literal @Helium 0x88dee0
//   slot 9 (+0x120)  (0.5 ×3, 0)                   literal @Helium 0x85da90
//   slot10 (+0x140)  ( 0.29608911 ×3, 0)           literal @Helium 0x88dfa0  ┐
//   slot11 (+0x160)  (-0.35917339 ×3, 0)           literal @Helium 0x88dfb0  │
//   slot12 (+0x180)  ( 0.17290929 ×3, 0)           literal @Helium 0x88dfc0  │ log2
//   slot13 (+0x1a0)  (-0.27149275 ×3, 0)           literal @Helium 0x88dfd0  │ poly
//   slot14 (+0x1c0)  ( 0.48059392 ×3, 0)           literal @Helium 0x88dfe0  │
//   slot15 (+0x1e0)  (-0.72136724 ×3, 0)           literal @Helium 0x88dff0  │
//   slot16 (+0x200)  ( 1.44269669 ×3, 0) = 1/ln2   literal @Helium 0x88e000  ┘
//   slot17 (+0x220)  (-127 ×3, 0)                  literal @Helium 0x88df30  (exp2 input clamp)
//   slot18 (+0x240)  ( 0.00179523 ×3, 0)           literal @Helium 0x88e010  ┐
//   slot19 (+0x260)  ( 0.00918918 ×3, 0)           literal @Helium 0x88e020  │ exp2
//   slot20 (+0x280)  ( 0.05566124 ×3, 0)           literal @Helium 0x88e030  │ poly
//   slot21 (+0x2a0)  ( 0.24020679 ×3, 0)           literal @Helium 0x88e040  │
//   slot22 (+0x2c0)  ( 0.69314754 ×3, 0) = ln2     literal @Helium 0x88e050  ┘
//   slot23 (+0x2e0)  (127 ×3, 0) as INT32 0x7f     literal @Helium 0x88df70  (exp2 bias, `vmovdqa`)
//   slot24 (+0x300)  (NaN ×3, 0)                   literal @Helium 0x88c7f0  — not read by this kernel
//   slot25 (+0x320)  (0, 0, 0, NaN)                literal @Helium 0x85fc40  — not read by this kernel
//
// Every slot value above was read out of `/tmp/Helium.x86_64` at the literal
// address obtained from the ctor's `movaps disp32(%rip)` (next_ip + disp32); the
// kernel itself contains no literals at all.
//
// ── THE TWO PATHS ────────────────────────────────────────────────────────────
// Per row: an 8-wide (`ymm`, 2 texels/iteration) body @0x3a5a40..0x3a5e24, taken
// only when the tile is at least 2 texels wide, followed by a 4-wide (`xmm`,
// 1 texel) tail @0x3a5e3d..0x3a61a1 for the possible odd texel. They compute the
// same thing but are NOT the same code, and are transcribed separately:
//   * the 8-wide path uses `vcmpltps` at the three "is the select mask set"
//     sites (@0x3a5a9a, @0x3a5cab, @0x3a5cc6) while the 4-wide path uses
//     `vcmpnleps` (@0x3a5e68, @0x3a6062, @0x3a607d). LT and NLE differ on NaN
//     (LT is false, NLE is true); the operand under test is always a freshly
//     masked 0-or-P3 value, so they agree unless the bank's slot 3 is itself NaN.
//   * the 8-wide path loads bank slots with `vmovups`, the 4-wide with `vmovaps`,
//     and the two paths assign DIFFERENT stack spill slots to the same constants.
//   * `vcmpeqps` takes its operands in the opposite order in the two paths
//     (@0x3a5a91 vs @0x3a5e5f) — equality is symmetric, so this is cosmetic.
// The tail also runs at most ONCE per row: it ends in `jmp 0x3a5a10`
// (@0x3a61a1), the row advance, not a loop back into itself.
//
// DEGENERATE TILES (paths a fuzz corpus over "normal" tiles never enters, so
// they are transcribed from the branch structure and asserted by the oracle):
//   * rows <= 0 (`jle 0x3a61ae` @0x3a59d6) returns 0 BEFORE building a frame —
//     nothing is written, not even a partial row.
//   * cols <= 0 falls through `cmpl $0x2 / jl` @0x3a5a28 into the tail's guard
//     `cmpl %ecx,%r11d / jge 0x3a5a10` @0x3a5e2d, with r11d = 0, so 0 >= cols is
//     taken and the row advances without a single store. The rows still iterate.
//   * the function always returns 0 (`xorl %eax,%eax` @0x3a61b1) on every path.

/** Scratch used only to reinterpret one f32 as its bit pattern and back — the machine's
 *  `vandps`/`vorps`/`vpslld`/`vpsrld` operate on the bits of the same register file, and JS has
 *  no other way to express that. Not an FCP function; pure plumbing. Mirrors the helper in the
 *  landed sibling raw-port/src/render/Gettype1_half_unpremultTile_AVX.ts. */
const bitScratch = new DataView(new ArrayBuffer(4));

function bitsOf(x: number): number {
  bitScratch.setFloat32(0, x, true);
  return bitScratch.getUint32(0, true);
}

function floatOf(bits: number): number {
  bitScratch.setUint32(0, bits >>> 0, true);
  return bitScratch.getFloat32(0, true);
}

/** MAXPS lane rule: `(src1 > src2) ? src1 : src2` — so src2 wins on equal AND on unordered. */
function maxps(src1: number, src2: number): number {
  return src1 > src2 ? src1 : src2;
}

/** CMPPS(EQ) lane result: all-ones when `a == b` ORDERED, all-zero otherwise (NaN gives false). */
function cmpeqps(a: number, b: number): number {
  return a === b ? 0xffffffff : 0x00000000;
}

/** CMPPS(LT) lane result: all-ones when `a < b` ORDERED, all-zero otherwise (NaN gives false). */
function cmpltps(a: number, b: number): number {
  return a < b ? 0xffffffff : 0x00000000;
}

/** CMPPS(NLE) lane result: all-ones when NOT(a <= b) — which INCLUDES the unordered case, so a
 *  NaN operand yields all-ones. This is the 4-wide tail's predicate where the 8-wide body uses
 *  CMPLT with the operands the other way round. */
function cmpnleps(a: number, b: number): number {
  return !(a <= b) ? 0xffffffff : 0x00000000;
}

/** `vroundps $0x9` — round toward -inf (mode 1) with the precision exception suppressed (bit 3).
 *  On a f32 lane that is exactly `floor`, and floor of a finite f32 is always representable. */
function roundps_floor(x: number): number {
  return Math.fround(Math.floor(x));
}

/**
 * `vcvttps2dq` — convert f32 to i32 with TRUNCATION toward zero. Out-of-range values and NaN
 * produce the "integer indefinite" value 0x80000000 (Intel SDM), which the exponent arithmetic
 * downstream then shifts like any other bit pattern; the `vmaxps` against slot 17 (-127) bounds
 * the input from below but NOT from above, so the overflow path is reachable and is modelled.
 */
function cvttps2dq(x: number): number {
  if (!(x > -2147483649 && x < 2147483648)) return -2147483648 | 0;
  return Math.trunc(x) | 0;
}

/**
 * HGTile — the tile descriptor Helium hands every `…Tile_AVX` kernel. Only the fields this kernel
 * touches are modelled; each cites the byte offset it is read from in THIS function. Pointers are
 * Float32Array views over the plane; the row strides stay in TEXELS (the machine sign-extends the
 * int32 with `movslq` and then `shlq $0x4`, i.e. 16 bytes = 4 float32 = one RGBA texel per unit).
 * Layout matches the landed sibling Gettype1_half_unpremultTile_AVX.ts.
 */
export interface HGTile {
  /** +0x00 — x0 (int32). Read @0x3a59f1 as the subtrahend of the width. */
  x0: number;
  /** +0x04 — y0 (int32). Read @0x3a59d3 as the subtrahend of the height. */
  y0: number;
  /** +0x08 — x1 (int32). Read @0x3a59ee. */
  x1: number;
  /** +0x0c — y1 (int32). Read @0x3a59d0. */
  y1: number;
  /** +0x10 — destination plane (RGBA f32, row-major). Read @0x3a59f7. */
  outPtr: Float32Array;
  /** +0x18 — destination row stride in TEXELS (int32, sign-extended @0x3a59f3, <<4 @0x3a5a03). */
  outRowStride: number;
  /** +0x50 — source plane (RGBA f32, row-major). Read @0x3a59fb. */
  inPtr: Float32Array;
  /** +0x58 — source row stride in TEXELS (int32, sign-extended @0x3a59ff, <<4 @0x3a5a07). */
  inRowStride: number;
}

// ── Parameter-bank offsets this kernel reads (all relative to `this+0x198`) ──────────────────
// Scalars are `vbroadcastss` (one f32 splatted to every lane); vectors are 32-byte (`ymm`) or
// 16-byte (`xmm`) loads whose lanes are read individually — so this port indexes each lane rather
// than assuming a slot is lane-uniform (the ctor's own table has a differing `w` lane in every
// constant slot, and lane 3 is exactly the alpha lane).
/** +0x00 (scalar, slot 0 .x) — multiplies the first pow result @0x3a5c7d / @0x3a6035. */
const S_POW_SCALE = 0x00;
/** +0x04 (scalar, slot 0 .y) — added after that multiply @0x3a5c9d / @0x3a603e. */
const S_POW_OFFSET = 0x04;
/** +0x08 (scalar, slot 0 .z) — the linear-segment slope @0x3a5c82 / @0x3a6048. */
const S_LINEAR_SLOPE = 0x08;
/** +0x0c (scalar, slot 0 .w) — the breakpoint the clamped texel is tested against @0x3a5c91. */
const S_BREAKPOINT = 0x0c;
/** +0x20 (scalar, slot 1 .x) — the FIRST pow exponent @0x3a5a6c / @0x3a5e59. */
const S_EXP1 = 0x20;
/** +0x24 (scalar, slot 1 .y) — the SECOND pow exponent @0x3a5cb7 / @0x3a606e. */
const S_EXP2 = 0x24;
/** +0x40 (vector, slot 2) — the low clamp, and the value both exponents are equality-tested
 *  against; the ctor zeroes it @0x3a6a9f, so it is (0,0,0,0) unless SetParameter writes it. */
const V_FLOOR = 0x40;
/** +0x60 (vector, slot 3) — the "one": OR'd into the mantissa, subtracted from it, the exp2
 *  constant term, and the value substituted when an exponent equals V_FLOOR. */
const V_ONE = 0x60;
/** +0x80 (vector, slot 4) — mantissa (+sign) mask, 0x807fffff. */
const V_MANTISSA_MASK = 0x80;
/** +0xa0 (vector, slot 5) — the denormal cutoff, +FLT_MIN. */
const V_LOG_CUTOFF = 0xa0;
/** +0xc0 (vector, slot 6) — +Inf, subtracted from the exponent below the cutoff (log2(0)=-Inf). */
const V_LOG_CUTOFF_ADJ = 0xc0;
/** +0xe0 (vector, slot 7) — the 127 exponent bias, subtracted. */
const V_EXP_BIAS = 0xe0;
/** +0x100 (vector, slot 8) — the mantissa split point, sqrt(2). */
const V_MANTISSA_SPLIT = 0x100;
/** +0x120 (vector, slot 9) — 0.5, the factor applied to the split correction. */
const V_SPLIT_SCALE = 0x120;
/** +0x140..+0x200 (vectors, slots 10..16) — log2 mantissa polynomial coefficients. */
const V_LOG_C0 = 0x140;
const V_LOG_C1 = 0x160;
const V_LOG_C2 = 0x180;
const V_LOG_C3 = 0x1a0;
const V_LOG_C4 = 0x1c0;
const V_LOG_C5 = 0x1e0;
const V_LOG_C6 = 0x200;
/** +0x220 (vector, slot 17) — -127, the lower clamp on the exp2 input. */
const V_EXP_FLOOR = 0x220;
/** +0x240..+0x2c0 (vectors, slots 18..22) — exp2 fractional polynomial coefficients. */
const V_EXP_C0 = 0x240;
const V_EXP_C1 = 0x260;
const V_EXP_C2 = 0x280;
const V_EXP_C3 = 0x2a0;
const V_EXP_C4 = 0x2c0;
/** +0x2e0 (xmm, slot 23, INTEGER) — the 127 bias added to the exp2 integer part before <<23. */
const V_EXP2_BIAS_I = 0x2e0;

/**
 * `HgcBT2100_PQ_OOTF` — BT.2100 PQ OOTF render node (Helium, vtable @0x3a6a5f).
 *
 * Only `RenderTile_AVX` @0x3a59d0 is ported in this file; the class's other 17 symbols
 * (ctor @0x3a6a50, dtors @0x3a6d00/0x3a6d50/0x3a6da0, GetProgram @0x3a5660,
 * InitProgramDescriptor @0x3a5690, shaderDescription @0x3a58b0, BindTexture @0x3a5900,
 * Bind @0x3a5970, RenderTile @0x3a61c0, GetDOD @0x3a6a10, GetROI @0x3a6a30,
 * SetParameter @0x3a6df0, GetParameter @0x3a6e70, GetOutput @0x3a6ec0) are separate port
 * units and are deliberately absent rather than stubbed — this kernel is a leaf and calls
 * none of them.
 */
export class HgcBT2100_PQ_OOTF {
  /**
   * +0x198 — a byte view of the 32-byte-aligned parameter bank (see PARAMETER BANK in the
   * file header). Populated by the ctor @0x3a6a50, which is not ported yet; the field is
   * declared here because `RenderTile_AVX` reloads it @0x3a5a47 / @0x3a5e43 on every
   * iteration and reads every constant out of it.
   */
  public params!: DataView;

  /**
   * HgcBT2100_PQ_OOTF::RenderTile_AVX(HGTile*) — Helium @0x00000000003a59d0.
   *
   * @param tile the tile descriptor (%rsi; `this` is %rdi)
   * @returns 0 — `xorl %eax,%eax` @0x3a61b1 on every path
   */
  public RenderTile_AVX(tile: HGTile): number {
    const params = this.params;
    /** Read lane `l` of the bank vector at `off` (little-endian f32). */
    const kv = (off: number, l: number): number => params.getFloat32(off + 4 * l, true);
    /** Read the bank scalar at `off` — the `vbroadcastss` source. */
    const ks = (off: number): number => params.getFloat32(off, true);
    /** Read lane `l` of the bank vector at `off` as raw i32 (the `vpaddd` operand). */
    const ki = (off: number, l: number): number => params.getInt32(off + 4 * l, true);

    // @0x3a59d0/@0x3a59d3: eax = tile[+0x0c] - tile[+0x04]
    const rows = (tile.y1 - tile.y0) | 0;
    // @0x3a59d6: jle 0x3a61ae — returns 0 before the frame is even built.
    if (rows <= 0) return 0;

    // @0x3a59ee/@0x3a59f1: ecx = tile[+0x08] - tile[+0x00]
    const cols = (tile.x1 - tile.x0) | 0;
    // @0x3a59f3/@0x3a5a03: rdx = (int32)tile[+0x18] << 4 (bytes) == 4 float32 == 1 texel per unit
    const outRowStride = (tile.outRowStride | 0) * 4;
    // @0x3a59ff/@0x3a5a07: rsi = (int32)tile[+0x58] << 4
    const inRowStride = (tile.inRowStride | 0) * 4;
    // @0x3a59f7: r8 = tile[+0x10];  @0x3a59fb: r9 = tile[+0x50]
    const outArr = tile.outPtr;
    const inArr = tile.inPtr;
    let outBase = 0; // r8, advanced by rdx per row @0x3a5a13
    let inBase = 0; // r9, advanced by rsi per row @0x3a5a10

    // The 0x180-byte aligned stack frame (`andq $-0x20,%rsp ; subq $0x180,%rsp`
    // @0x3a59e3/@0x3a59e7), in float32 units. Both paths spill bank constants into it and
    // read them back; the 8-wide body also parks the untouched source texels at 0x160(%rsp)
    // for the final alpha blend, which is load-bearing because %ymm14 is clobbered @0x3a5d4c.
    // NOTE the two paths assign DIFFERENT constants to the same slots — that is why this is
    // modelled as memory rather than folded back into the constant reads.
    const stack = new Float32Array(0x180 / 4);

    // Register file. The 4-wide tail uses lanes 0..3 of the same arrays, exactly as an xmm
    // register is the low half of its ymm.
    const ymm0 = new Float32Array(8);
    const ymm1 = new Float32Array(8);
    const ymm2 = new Float32Array(8);
    const ymm3 = new Float32Array(8);
    const ymm4 = new Float32Array(8);
    const ymm5 = new Float32Array(8);
    const ymm6 = new Float32Array(8);
    const ymm7 = new Float32Array(8);
    const ymm8 = new Float32Array(8);
    const ymm9 = new Float32Array(8);
    const ymm10 = new Float32Array(8);
    const ymm11 = new Float32Array(8);
    const ymm12 = new Float32Array(8);
    const ymm13 = new Float32Array(8);
    const ymm14 = new Float32Array(8);
    const ymm15 = new Float32Array(8);
    // A comparison writes all-ones / all-zero into the SAME register file; these hold that
    // bit mask for the (few) instructions where the register is read as a mask.
    const mk2 = new Uint32Array(8);
    const mk4 = new Uint32Array(8);
    const mk5 = new Uint32Array(8);
    const mk8 = new Uint32Array(8);
    const mk9 = new Uint32Array(8);
    const mk11 = new Uint32Array(8);
    // Integer lanes for the exponent shuffling (vpsrld/vpaddd/vpslld are i32 lane ops).
    const iA = new Int32Array(8);
    const iB = new Int32Array(8);

    // @0x3a5a0b: r10d = 0. @0x3a5a16..@0x3a5a1c: `incl %r10d ; cmpl %eax,%r10d ; je 0x3a61a6`.
    for (let row = 0; row < rows; row++) {
      // @0x3a5a22: movl $0x0, %r11d — the count of texels the 8-wide body consumed.
      let r11 = 0;

      // @0x3a5a28/@0x3a5a2b: `cmpl $0x2,%ecx ; jl 0x3a5e2d` — narrower than 2 texels: tail only.
      if (cols >= 2) {
        // @0x3a5a31: ebx = 0x10; every load is at -0x10(reg,%rbx), i.e. byte offset 32*k.
        let k = 0;
        for (;;) {
          const p = inBase + 8 * k; // -0x10(%r9,%rbx) in float32 units
          const q = outBase + 8 * k; // -0x10(%r8,%rbx)

          // @0x3a5a40: vmovups -0x10(%r9,%rbx),%ymm14 — two RGBA texels
          for (let l = 0; l < 8; l++) ymm14[l] = inArr[p + l] as number;
          // @0x3a5a47: movq 0x198(%rdi),%r14 — the parameter bank (reloaded every iteration)
          // @0x3a5a4e: vmovups 0x40(%r14),%ymm4
          for (let l = 0; l < 8; l++) ymm4[l] = kv(V_FLOOR, l);
          // @0x3a5a54: vmovups 0x60(%r14),%ymm1
          for (let l = 0; l < 8; l++) ymm1[l] = kv(V_ONE, l);
          // @0x3a5a5a: vmovups 0x80(%r14),%ymm3
          for (let l = 0; l < 8; l++) ymm3[l] = kv(V_MANTISSA_MASK, l);
          // @0x3a5a63: vmovaps %ymm3,0x100(%rsp)
          for (let l = 0; l < 8; l++) stack[0x100 / 4 + l] = ymm3[l] as number;
          // @0x3a5a6c: vbroadcastss 0x20(%r14),%ymm0 — the first pow exponent
          for (let l = 0; l < 8; l++) ymm0[l] = ks(S_EXP1);
          // @0x3a5a72: vmovups 0xa0(%r14),%ymm5 ; @0x3a5a7b: vmovaps %ymm5,0xe0(%rsp)
          for (let l = 0; l < 8; l++) ymm5[l] = kv(V_LOG_CUTOFF, l);
          for (let l = 0; l < 8; l++) stack[0xe0 / 4 + l] = ymm5[l] as number;
          // @0x3a5a84: vmaxps %ymm4,%ymm14,%ymm12 — c = max(texel, P2)
          for (let l = 0; l < 8; l++) ymm12[l] = maxps(ymm14[l] as number, ymm4[l] as number);
          // @0x3a5a88: vmovaps %ymm14,0x160(%rsp) — park the untouched source for the alpha blend
          for (let l = 0; l < 8; l++) stack[0x160 / 4 + l] = ymm14[l] as number;
          // @0x3a5a91: vcmpeqps %ymm4,%ymm0,%ymm2 — (exponent == P2)
          for (let l = 0; l < 8; l++) mk2[l] = cmpeqps(ymm0[l] as number, ymm4[l] as number);
          // @0x3a5a96: vandps %ymm1,%ymm2,%ymm2 — mask & one
          for (let l = 0; l < 8; l++) {
            ymm2[l] = floatOf((mk2[l] as number) & bitsOf(ymm1[l] as number));
          }
          // @0x3a5a9a: vcmpltps %ymm2,%ymm4,%ymm2 — (P2 < that), i.e. "the mask is set"
          for (let l = 0; l < 8; l++) mk2[l] = cmpltps(ymm4[l] as number, ymm2[l] as number);
          // @0x3a5a9f: vblendvps %ymm2,%ymm1,%ymm12,%ymm2 — t = mask ? one : c
          for (let l = 0; l < 8; l++) {
            ymm2[l] = ((mk2[l] as number) & 0x80000000) !== 0 ? (ymm1[l] as number) : (ymm12[l] as number);
          }

          // ── log2(t) ─────────────────────────────────────────────────────────────────────
          // @0x3a5aa5: vandps %ymm2,%ymm3,%ymm3 — mantissa bits
          for (let l = 0; l < 8; l++) {
            ymm3[l] = floatOf(bitsOf(ymm3[l] as number) & bitsOf(ymm2[l] as number));
          }
          // @0x3a5aa9: vorps %ymm1,%ymm3,%ymm3 — mantissa | one => m in [1,2)
          for (let l = 0; l < 8; l++) {
            ymm3[l] = floatOf(bitsOf(ymm3[l] as number) | bitsOf(ymm1[l] as number));
          }
          // @0x3a5aad: vcmpltps %ymm5,%ymm2,%ymm5 — t < FLT_MIN ?
          for (let l = 0; l < 8; l++) mk5[l] = cmpltps(ymm2[l] as number, ymm5[l] as number);
          // @0x3a5ab2: vmovups 0xc0(%r14),%ymm7 ; @0x3a5abb: vmovaps %ymm7,0x120(%rsp)
          for (let l = 0; l < 8; l++) ymm7[l] = kv(V_LOG_CUTOFF_ADJ, l);
          for (let l = 0; l < 8; l++) stack[0x120 / 4 + l] = ymm7[l] as number;
          // @0x3a5ac4..@0x3a5ad8: vpsrld $0x17 on each 128-bit half of %ymm2, recombined
          for (let l = 0; l < 8; l++) iA[l] = bitsOf(ymm2[l] as number) >>> 23;
          // @0x3a5ac9: vandps %ymm7,%ymm5,%ymm5 — the below-cutoff exponent correction (+Inf)
          for (let l = 0; l < 8; l++) {
            ymm5[l] = floatOf((mk5[l] as number) & bitsOf(ymm7[l] as number));
          }
          // @0x3a5ade: vcvtdq2ps %ymm2,%ymm2
          for (let l = 0; l < 8; l++) ymm2[l] = Math.fround(iA[l] as number);
          // @0x3a5ae2: vsubps %ymm5,%ymm2,%ymm2
          for (let l = 0; l < 8; l++) ymm2[l] = Math.fround((ymm2[l] as number) - (ymm5[l] as number));
          // @0x3a5ae6: vmovups 0xe0(%r14),%ymm5 ; @0x3a5aef: vmovaps %ymm5,0x140(%rsp)
          for (let l = 0; l < 8; l++) ymm5[l] = kv(V_EXP_BIAS, l);
          for (let l = 0; l < 8; l++) stack[0x140 / 4 + l] = ymm5[l] as number;
          // @0x3a5af8: vmovups 0x100(%r14),%ymm6 ; @0x3a5b01: vmovaps %ymm6,0xc0(%rsp)
          for (let l = 0; l < 8; l++) ymm6[l] = kv(V_MANTISSA_SPLIT, l);
          for (let l = 0; l < 8; l++) stack[0xc0 / 4 + l] = ymm6[l] as number;
          // @0x3a5b0a: vsubps %ymm5,%ymm2,%ymm2 — remove the 127 exponent bias
          for (let l = 0; l < 8; l++) ymm2[l] = Math.fround((ymm2[l] as number) - (ymm5[l] as number));
          // @0x3a5b0e: vcmpltps %ymm3,%ymm6,%ymm5 — (sqrt2 < m)
          for (let l = 0; l < 8; l++) mk5[l] = cmpltps(ymm6[l] as number, ymm3[l] as number);
          // @0x3a5b13: vandps %ymm1,%ymm5,%ymm5 — correction = one where the mask is set
          for (let l = 0; l < 8; l++) {
            ymm5[l] = floatOf((mk5[l] as number) & bitsOf(ymm1[l] as number));
          }
          // @0x3a5b17: vmovups 0x120(%r14),%ymm6 ; @0x3a5b20: vmovaps %ymm6,0xa0(%rsp)
          for (let l = 0; l < 8; l++) ymm6[l] = kv(V_SPLIT_SCALE, l);
          for (let l = 0; l < 8; l++) stack[0xa0 / 4 + l] = ymm6[l] as number;
          // @0x3a5b29: vaddps %ymm2,%ymm5,%ymm2 — exponent += correction
          for (let l = 0; l < 8; l++) ymm2[l] = Math.fround((ymm5[l] as number) + (ymm2[l] as number));
          // @0x3a5b2d: vmulps %ymm5,%ymm6,%ymm5 — 0.5 * correction
          for (let l = 0; l < 8; l++) ymm5[l] = Math.fround((ymm6[l] as number) * (ymm5[l] as number));
          // @0x3a5b31: vmulps %ymm3,%ymm5,%ymm5
          for (let l = 0; l < 8; l++) ymm5[l] = Math.fround((ymm5[l] as number) * (ymm3[l] as number));
          // @0x3a5b35: vsubps %ymm1,%ymm3,%ymm3 — m - 1
          for (let l = 0; l < 8; l++) ymm3[l] = Math.fround((ymm3[l] as number) - (ymm1[l] as number));
          // @0x3a5b39: vsubps %ymm5,%ymm3,%ymm3 — x, the polynomial argument
          for (let l = 0; l < 8; l++) ymm3[l] = Math.fround((ymm3[l] as number) - (ymm5[l] as number));
          // @0x3a5b3d: vmovups 0x140(%r14),%ymm5 ; @0x3a5b46: vmovaps %ymm5,0x80(%rsp)
          for (let l = 0; l < 8; l++) ymm5[l] = kv(V_LOG_C0, l);
          for (let l = 0; l < 8; l++) stack[0x80 / 4 + l] = ymm5[l] as number;
          // @0x3a5b4f: vmulps %ymm3,%ymm5,%ymm5
          for (let l = 0; l < 8; l++) ymm5[l] = Math.fround((ymm5[l] as number) * (ymm3[l] as number));
          // @0x3a5b53: vmovups 0x160(%r14),%ymm6 ; @0x3a5b5c: vmovaps %ymm6,0x60(%rsp)
          for (let l = 0; l < 8; l++) ymm6[l] = kv(V_LOG_C1, l);
          for (let l = 0; l < 8; l++) stack[0x60 / 4 + l] = ymm6[l] as number;
          // @0x3a5b62: vaddps %ymm5,%ymm6,%ymm5
          for (let l = 0; l < 8; l++) ymm5[l] = Math.fround((ymm6[l] as number) + (ymm5[l] as number));
          // @0x3a5b66: vmovups 0x180(%r14),%ymm6 ; @0x3a5b6f: vmovaps %ymm6,0x40(%rsp)
          for (let l = 0; l < 8; l++) ymm6[l] = kv(V_LOG_C2, l);
          for (let l = 0; l < 8; l++) stack[0x40 / 4 + l] = ymm6[l] as number;
          // @0x3a5b75: vmulps %ymm3,%ymm6,%ymm6
          for (let l = 0; l < 8; l++) ymm6[l] = Math.fround((ymm6[l] as number) * (ymm3[l] as number));
          // @0x3a5b79: vmovups 0x1a0(%r14),%ymm7 ; @0x3a5b82: vmovaps %ymm7,0x20(%rsp)
          for (let l = 0; l < 8; l++) ymm7[l] = kv(V_LOG_C3, l);
          for (let l = 0; l < 8; l++) stack[0x20 / 4 + l] = ymm7[l] as number;
          // @0x3a5b88: vaddps %ymm6,%ymm7,%ymm6
          for (let l = 0; l < 8; l++) ymm6[l] = Math.fround((ymm7[l] as number) + (ymm6[l] as number));
          // @0x3a5b8c: vmulps %ymm3,%ymm3,%ymm7 — x²
          for (let l = 0; l < 8; l++) ymm7[l] = Math.fround((ymm3[l] as number) * (ymm3[l] as number));
          // @0x3a5b90: vmulps %ymm6,%ymm7,%ymm6
          for (let l = 0; l < 8; l++) ymm6[l] = Math.fround((ymm7[l] as number) * (ymm6[l] as number));
          // @0x3a5b94: vaddps %ymm6,%ymm5,%ymm5
          for (let l = 0; l < 8; l++) ymm5[l] = Math.fround((ymm5[l] as number) + (ymm6[l] as number));
          // @0x3a5b98: vmulps %ymm5,%ymm7,%ymm7
          for (let l = 0; l < 8; l++) ymm7[l] = Math.fround((ymm7[l] as number) * (ymm5[l] as number));
          // @0x3a5b9c: vmovups 0x1c0(%r14),%ymm10
          for (let l = 0; l < 8; l++) ymm10[l] = kv(V_LOG_C4, l);
          // @0x3a5ba5: vmulps %ymm3,%ymm10,%ymm8
          for (let l = 0; l < 8; l++) ymm8[l] = Math.fround((ymm10[l] as number) * (ymm3[l] as number));
          // @0x3a5ba9: vmovups 0x1e0(%r14),%ymm9
          for (let l = 0; l < 8; l++) ymm9[l] = kv(V_LOG_C5, l);
          // @0x3a5bb2: vaddps %ymm8,%ymm9,%ymm8
          for (let l = 0; l < 8; l++) ymm8[l] = Math.fround((ymm9[l] as number) + (ymm8[l] as number));
          // @0x3a5bb7: vaddps %ymm7,%ymm8,%ymm7
          for (let l = 0; l < 8; l++) ymm7[l] = Math.fround((ymm8[l] as number) + (ymm7[l] as number));
          // @0x3a5bbb: vmulps %ymm7,%ymm3,%ymm7
          for (let l = 0; l < 8; l++) ymm7[l] = Math.fround((ymm3[l] as number) * (ymm7[l] as number));
          // @0x3a5bbf: vmovups 0x200(%r14),%ymm5 ; @0x3a5bc8: vmovaps %ymm5,(%rsp)
          for (let l = 0; l < 8; l++) ymm5[l] = kv(V_LOG_C6, l);
          for (let l = 0; l < 8; l++) stack[l] = ymm5[l] as number;
          // @0x3a5bcd: vaddps %ymm7,%ymm5,%ymm7
          for (let l = 0; l < 8; l++) ymm7[l] = Math.fround((ymm5[l] as number) + (ymm7[l] as number));
          // @0x3a5bd1: vmulps %ymm7,%ymm3,%ymm3
          for (let l = 0; l < 8; l++) ymm3[l] = Math.fround((ymm3[l] as number) * (ymm7[l] as number));
          // @0x3a5bd5: vaddps %ymm3,%ymm2,%ymm2 — log2(t) = exponent + poly(x)
          for (let l = 0; l < 8; l++) ymm2[l] = Math.fround((ymm2[l] as number) + (ymm3[l] as number));

          // ── exp2(exponent · log2(t)) ────────────────────────────────────────────────────
          // @0x3a5bd9: vmulps %ymm2,%ymm0,%ymm0
          for (let l = 0; l < 8; l++) ymm0[l] = Math.fround((ymm0[l] as number) * (ymm2[l] as number));
          // @0x3a5bdd: vmovups 0x220(%r14),%ymm15
          for (let l = 0; l < 8; l++) ymm15[l] = kv(V_EXP_FLOOR, l);
          // @0x3a5be6: vmaxps %ymm15,%ymm0,%ymm0 — clamp the exp2 input from below at -127
          for (let l = 0; l < 8; l++) ymm0[l] = maxps(ymm0[l] as number, ymm15[l] as number);
          // @0x3a5beb: vroundps $0x9,%ymm0,%ymm2 — floor
          for (let l = 0; l < 8; l++) ymm2[l] = roundps_floor(ymm0[l] as number);
          // @0x3a5bf1: vsubps %ymm2,%ymm0,%ymm0 — the fractional part
          for (let l = 0; l < 8; l++) ymm0[l] = Math.fround((ymm0[l] as number) - (ymm2[l] as number));
          // @0x3a5bf5: vmovups 0x240(%r14),%ymm13
          for (let l = 0; l < 8; l++) ymm13[l] = kv(V_EXP_C0, l);
          // @0x3a5bfe: vmulps %ymm0,%ymm13,%ymm3
          for (let l = 0; l < 8; l++) ymm3[l] = Math.fround((ymm13[l] as number) * (ymm0[l] as number));
          // @0x3a5c02: vmovups 0x260(%r14),%ymm8
          for (let l = 0; l < 8; l++) ymm8[l] = kv(V_EXP_C1, l);
          // @0x3a5c0b: vaddps %ymm3,%ymm8,%ymm3
          for (let l = 0; l < 8; l++) ymm3[l] = Math.fround((ymm8[l] as number) + (ymm3[l] as number));
          // @0x3a5c0f: vmulps %ymm0,%ymm0,%ymm6 — f²
          for (let l = 0; l < 8; l++) ymm6[l] = Math.fround((ymm0[l] as number) * (ymm0[l] as number));
          // @0x3a5c13: vmulps %ymm3,%ymm6,%ymm3
          for (let l = 0; l < 8; l++) ymm3[l] = Math.fround((ymm6[l] as number) * (ymm3[l] as number));
          // @0x3a5c17: vmovups 0x280(%r14),%ymm7 ; @0x3a5c20: vmovups 0x2a0(%r14),%ymm6
          for (let l = 0; l < 8; l++) ymm7[l] = kv(V_EXP_C2, l);
          for (let l = 0; l < 8; l++) ymm6[l] = kv(V_EXP_C3, l);
          // @0x3a5c29: vmulps %ymm7,%ymm0,%ymm11
          for (let l = 0; l < 8; l++) ymm11[l] = Math.fround((ymm0[l] as number) * (ymm7[l] as number));
          // @0x3a5c2d: vaddps %ymm6,%ymm11,%ymm11
          for (let l = 0; l < 8; l++) ymm11[l] = Math.fround((ymm11[l] as number) + (ymm6[l] as number));
          // @0x3a5c31: vaddps %ymm3,%ymm11,%ymm3
          for (let l = 0; l < 8; l++) ymm3[l] = Math.fround((ymm11[l] as number) + (ymm3[l] as number));
          // @0x3a5c35: vmulps %ymm3,%ymm0,%ymm11
          for (let l = 0; l < 8; l++) ymm11[l] = Math.fround((ymm0[l] as number) * (ymm3[l] as number));
          // @0x3a5c39: vmovups 0x2c0(%r14),%ymm5
          for (let l = 0; l < 8; l++) ymm5[l] = kv(V_EXP_C4, l);
          // @0x3a5c42: vaddps %ymm5,%ymm11,%ymm11
          for (let l = 0; l < 8; l++) ymm11[l] = Math.fround((ymm11[l] as number) + (ymm5[l] as number));
          // @0x3a5c46: vmulps %ymm0,%ymm11,%ymm11
          for (let l = 0; l < 8; l++) ymm11[l] = Math.fround((ymm11[l] as number) * (ymm0[l] as number));
          // @0x3a5c4a: vcvttps2dq %ymm2,%ymm2 — the integer part
          for (let l = 0; l < 8; l++) iA[l] = cvttps2dq(ymm2[l] as number);
          // @0x3a5c4e: vmovdqa 0x2e0(%r14),%xmm3 — the i32 bias, ONE 16-byte lane group
          for (let l = 0; l < 4; l++) iB[l] = ki(V_EXP2_BIAS_I, l);
          // @0x3a5c57/@0x3a5c5b/@0x3a5c61: vpaddd on each half with the SAME xmm3 bias
          for (let l = 0; l < 8; l++) iA[l] = ((iB[l & 3] as number) + (iA[l] as number)) | 0;
          // @0x3a5c65/@0x3a5c6a/@0x3a5c6f: vpslld $0x17 on each half, recombined
          for (let l = 0; l < 8; l++) ymm0[l] = floatOf(((iA[l] as number) << 23) >>> 0);
          // @0x3a5c75: vaddps %ymm1,%ymm11,%ymm2 — poly + one
          for (let l = 0; l < 8; l++) ymm2[l] = Math.fround((ymm11[l] as number) + (ymm1[l] as number));
          // @0x3a5c79: vmulps %ymm0,%ymm2,%ymm0 — · 2^int
          for (let l = 0; l < 8; l++) ymm0[l] = Math.fround((ymm2[l] as number) * (ymm0[l] as number));

          // ── the affine / linear select ──────────────────────────────────────────────────
          // @0x3a5c7d: vbroadcastss (%r14),%ymm2 ; @0x3a5c82: vbroadcastss 0x8(%r14),%ymm11
          for (let l = 0; l < 8; l++) ymm2[l] = ks(S_POW_SCALE);
          for (let l = 0; l < 8; l++) ymm11[l] = ks(S_LINEAR_SLOPE);
          // @0x3a5c88: vmulps %ymm0,%ymm2,%ymm0
          for (let l = 0; l < 8; l++) ymm0[l] = Math.fround((ymm2[l] as number) * (ymm0[l] as number));
          // @0x3a5c8c: vmulps %ymm11,%ymm12,%ymm2 — the linear segment, c · P0.z
          for (let l = 0; l < 8; l++) ymm2[l] = Math.fround((ymm12[l] as number) * (ymm11[l] as number));
          // @0x3a5c91: vbroadcastss 0xc(%r14),%ymm11 — the breakpoint
          for (let l = 0; l < 8; l++) ymm11[l] = ks(S_BREAKPOINT);
          // @0x3a5c97: vcmpltps %ymm12,%ymm11,%ymm11 — (breakpoint < c)
          for (let l = 0; l < 8; l++) mk11[l] = cmpltps(ymm11[l] as number, ymm12[l] as number);
          // @0x3a5c9d: vbroadcastss 0x4(%r14),%ymm12 — CLOBBERS c; it is not read again
          for (let l = 0; l < 8; l++) ymm12[l] = ks(S_POW_OFFSET);
          // @0x3a5ca3: vaddps %ymm0,%ymm12,%ymm0
          for (let l = 0; l < 8; l++) ymm0[l] = Math.fround((ymm12[l] as number) + (ymm0[l] as number));
          // @0x3a5ca7: vandps %ymm1,%ymm11,%ymm11
          for (let l = 0; l < 8; l++) {
            ymm11[l] = floatOf((mk11[l] as number) & bitsOf(ymm1[l] as number));
          }
          // @0x3a5cab: vcmpltps %ymm11,%ymm4,%ymm11 — (P2 < that)
          for (let l = 0; l < 8; l++) mk11[l] = cmpltps(ymm4[l] as number, ymm11[l] as number);
          // @0x3a5cb1: vblendvps %ymm11,%ymm0,%ymm2,%ymm0 — above the breakpoint: the affine pow
          for (let l = 0; l < 8; l++) {
            ymm0[l] = ((mk11[l] as number) & 0x80000000) !== 0 ? (ymm0[l] as number) : (ymm2[l] as number);
          }
          // @0x3a5cb7: vbroadcastss 0x24(%r14),%ymm12 — the SECOND pow exponent
          for (let l = 0; l < 8; l++) ymm12[l] = ks(S_EXP2);
          // @0x3a5cbd: vcmpeqps %ymm4,%ymm12,%ymm2
          for (let l = 0; l < 8; l++) mk2[l] = cmpeqps(ymm12[l] as number, ymm4[l] as number);
          // @0x3a5cc2: vandps %ymm1,%ymm2,%ymm2
          for (let l = 0; l < 8; l++) {
            ymm2[l] = floatOf((mk2[l] as number) & bitsOf(ymm1[l] as number));
          }
          // @0x3a5cc6: vcmpltps %ymm2,%ymm4,%ymm2
          for (let l = 0; l < 8; l++) mk2[l] = cmpltps(ymm4[l] as number, ymm2[l] as number);
          // @0x3a5ccb: vblendps $0x88,%ymm14,%ymm0,%ymm0 — lanes 3 and 7 (alpha) from the source
          ymm0[3] = ymm14[3] as number;
          ymm0[7] = ymm14[7] as number;
          // @0x3a5cd1: vblendvps %ymm2,%ymm1,%ymm0,%ymm0
          for (let l = 0; l < 8; l++) {
            ymm0[l] = ((mk2[l] as number) & 0x80000000) !== 0 ? (ymm1[l] as number) : (ymm0[l] as number);
          }

          // ── the SECOND log2, on the OOTF result ────────────────────────────────────────
          // @0x3a5cd7: vandps 0x100(%rsp),%ymm0,%ymm2 — mantissa bits (spill = mantissa mask)
          for (let l = 0; l < 8; l++) {
            ymm2[l] = floatOf(bitsOf(ymm0[l] as number) & bitsOf(stack[0x100 / 4 + l] as number));
          }
          // @0x3a5ce0: vcmpltps 0xe0(%rsp),%ymm0,%ymm4 — v < FLT_MIN ?
          for (let l = 0; l < 8; l++) mk4[l] = cmpltps(ymm0[l] as number, stack[0xe0 / 4 + l] as number);
          // @0x3a5cea..@0x3a5cfa: vpsrld $0x17 on each half of %ymm0, recombined
          for (let l = 0; l < 8; l++) iA[l] = bitsOf(ymm0[l] as number) >>> 23;
          // @0x3a5d00: vandps 0x120(%rsp),%ymm4,%ymm4 — the +Inf correction
          for (let l = 0; l < 8; l++) {
            ymm4[l] = floatOf((mk4[l] as number) & bitsOf(stack[0x120 / 4 + l] as number));
          }
          // @0x3a5d09: vcvtdq2ps %ymm0,%ymm0
          for (let l = 0; l < 8; l++) ymm0[l] = Math.fround(iA[l] as number);
          // @0x3a5d0d: vsubps %ymm4,%ymm0,%ymm0
          for (let l = 0; l < 8; l++) ymm0[l] = Math.fround((ymm0[l] as number) - (ymm4[l] as number));
          // @0x3a5d11: vorps %ymm1,%ymm2,%ymm2 — m in [1,2)
          for (let l = 0; l < 8; l++) {
            ymm2[l] = floatOf(bitsOf(ymm2[l] as number) | bitsOf(ymm1[l] as number));
          }
          // @0x3a5d15: vmovaps 0xc0(%rsp),%ymm4 — sqrt(2)
          for (let l = 0; l < 8; l++) ymm4[l] = stack[0xc0 / 4 + l] as number;
          // @0x3a5d1e: vcmpltps %ymm2,%ymm4,%ymm4 — (sqrt2 < m)
          for (let l = 0; l < 8; l++) mk4[l] = cmpltps(ymm4[l] as number, ymm2[l] as number);
          // @0x3a5d23: vandps %ymm1,%ymm4,%ymm4
          for (let l = 0; l < 8; l++) {
            ymm4[l] = floatOf((mk4[l] as number) & bitsOf(ymm1[l] as number));
          }
          // @0x3a5d27: vmulps 0xa0(%rsp),%ymm4,%ymm11 — 0.5 · correction
          for (let l = 0; l < 8; l++) {
            ymm11[l] = Math.fround((ymm4[l] as number) * (stack[0xa0 / 4 + l] as number));
          }
          // @0x3a5d30: vmulps %ymm2,%ymm11,%ymm11
          for (let l = 0; l < 8; l++) ymm11[l] = Math.fround((ymm11[l] as number) * (ymm2[l] as number));
          // @0x3a5d34: vsubps %ymm1,%ymm2,%ymm2 — m - 1
          for (let l = 0; l < 8; l++) ymm2[l] = Math.fround((ymm2[l] as number) - (ymm1[l] as number));
          // @0x3a5d38: vsubps %ymm11,%ymm2,%ymm2 — x
          for (let l = 0; l < 8; l++) ymm2[l] = Math.fround((ymm2[l] as number) - (ymm11[l] as number));
          // @0x3a5d3d: vmulps 0x80(%rsp),%ymm2,%ymm11
          for (let l = 0; l < 8; l++) {
            ymm11[l] = Math.fround((ymm2[l] as number) * (stack[0x80 / 4 + l] as number));
          }
          // @0x3a5d46: vaddps 0x60(%rsp),%ymm11,%ymm11
          for (let l = 0; l < 8; l++) {
            ymm11[l] = Math.fround((ymm11[l] as number) + (stack[0x60 / 4 + l] as number));
          }
          // @0x3a5d4c: vmulps 0x40(%rsp),%ymm2,%ymm14 — CLOBBERS the source texels in %ymm14;
          //   they survive only in the 0x160(%rsp) spill, which the final blend reads.
          for (let l = 0; l < 8; l++) {
            ymm14[l] = Math.fround((ymm2[l] as number) * (stack[0x40 / 4 + l] as number));
          }
          // @0x3a5d52: vaddps 0x20(%rsp),%ymm14,%ymm14
          for (let l = 0; l < 8; l++) {
            ymm14[l] = Math.fround((ymm14[l] as number) + (stack[0x20 / 4 + l] as number));
          }
          // @0x3a5d58: vmulps %ymm2,%ymm10,%ymm10
          for (let l = 0; l < 8; l++) ymm10[l] = Math.fround((ymm10[l] as number) * (ymm2[l] as number));
          // @0x3a5d5c: vaddps %ymm10,%ymm9,%ymm9
          for (let l = 0; l < 8; l++) ymm9[l] = Math.fround((ymm9[l] as number) + (ymm10[l] as number));
          // @0x3a5d61: vmulps %ymm2,%ymm2,%ymm10 — x²
          for (let l = 0; l < 8; l++) ymm10[l] = Math.fround((ymm2[l] as number) * (ymm2[l] as number));
          // @0x3a5d65: vmulps %ymm14,%ymm10,%ymm14
          for (let l = 0; l < 8; l++) ymm14[l] = Math.fround((ymm10[l] as number) * (ymm14[l] as number));
          // @0x3a5d6a: vaddps %ymm14,%ymm11,%ymm11
          for (let l = 0; l < 8; l++) ymm11[l] = Math.fround((ymm11[l] as number) + (ymm14[l] as number));
          // @0x3a5d6f: vmulps %ymm11,%ymm10,%ymm10
          for (let l = 0; l < 8; l++) ymm10[l] = Math.fround((ymm10[l] as number) * (ymm11[l] as number));
          // @0x3a5d74: vsubps 0x140(%rsp),%ymm0,%ymm0 — remove the 127 exponent bias
          for (let l = 0; l < 8; l++) {
            ymm0[l] = Math.fround((ymm0[l] as number) - (stack[0x140 / 4 + l] as number));
          }
          // @0x3a5d7d: vaddps %ymm10,%ymm9,%ymm9
          for (let l = 0; l < 8; l++) ymm9[l] = Math.fround((ymm9[l] as number) + (ymm10[l] as number));
          // @0x3a5d82: vmulps %ymm2,%ymm9,%ymm9
          for (let l = 0; l < 8; l++) ymm9[l] = Math.fround((ymm9[l] as number) * (ymm2[l] as number));
          // @0x3a5d86: vaddps (%rsp),%ymm9,%ymm9
          for (let l = 0; l < 8; l++) ymm9[l] = Math.fround((ymm9[l] as number) + (stack[l] as number));
          // @0x3a5d8b: vaddps %ymm0,%ymm4,%ymm0 — exponent += correction
          for (let l = 0; l < 8; l++) ymm0[l] = Math.fround((ymm4[l] as number) + (ymm0[l] as number));
          // @0x3a5d8f: vmulps %ymm2,%ymm9,%ymm2
          for (let l = 0; l < 8; l++) ymm2[l] = Math.fround((ymm9[l] as number) * (ymm2[l] as number));
          // @0x3a5d93: vaddps %ymm2,%ymm0,%ymm0 — log2(v)
          for (let l = 0; l < 8; l++) ymm0[l] = Math.fround((ymm0[l] as number) + (ymm2[l] as number));
          // @0x3a5d97: vmulps %ymm0,%ymm12,%ymm0 — · the second exponent
          for (let l = 0; l < 8; l++) ymm0[l] = Math.fround((ymm12[l] as number) * (ymm0[l] as number));

          // ── the SECOND exp2 ────────────────────────────────────────────────────────────
          // @0x3a5d9b: vmaxps %ymm15,%ymm0,%ymm0
          for (let l = 0; l < 8; l++) ymm0[l] = maxps(ymm0[l] as number, ymm15[l] as number);
          // @0x3a5da0: vroundps $0x9,%ymm0,%ymm2
          for (let l = 0; l < 8; l++) ymm2[l] = roundps_floor(ymm0[l] as number);
          // @0x3a5da6: vsubps %ymm2,%ymm0,%ymm0
          for (let l = 0; l < 8; l++) ymm0[l] = Math.fround((ymm0[l] as number) - (ymm2[l] as number));
          // @0x3a5daa: vmulps %ymm0,%ymm13,%ymm4
          for (let l = 0; l < 8; l++) ymm4[l] = Math.fround((ymm13[l] as number) * (ymm0[l] as number));
          // @0x3a5dae: vaddps %ymm4,%ymm8,%ymm4
          for (let l = 0; l < 8; l++) ymm4[l] = Math.fround((ymm8[l] as number) + (ymm4[l] as number));
          // @0x3a5db2: vmulps %ymm0,%ymm0,%ymm8 — f² (CLOBBERS the C1 coefficient)
          for (let l = 0; l < 8; l++) ymm8[l] = Math.fround((ymm0[l] as number) * (ymm0[l] as number));
          // @0x3a5db6: vmulps %ymm4,%ymm8,%ymm4
          for (let l = 0; l < 8; l++) ymm4[l] = Math.fround((ymm8[l] as number) * (ymm4[l] as number));
          // @0x3a5dba: vmulps %ymm0,%ymm7,%ymm7
          for (let l = 0; l < 8; l++) ymm7[l] = Math.fround((ymm7[l] as number) * (ymm0[l] as number));
          // @0x3a5dbe: vaddps %ymm7,%ymm6,%ymm6
          for (let l = 0; l < 8; l++) ymm6[l] = Math.fround((ymm6[l] as number) + (ymm7[l] as number));
          // @0x3a5dc2: vaddps %ymm4,%ymm6,%ymm4
          for (let l = 0; l < 8; l++) ymm4[l] = Math.fround((ymm6[l] as number) + (ymm4[l] as number));
          // @0x3a5dc6: vmulps %ymm4,%ymm0,%ymm4
          for (let l = 0; l < 8; l++) ymm4[l] = Math.fround((ymm0[l] as number) * (ymm4[l] as number));
          // @0x3a5dca: vaddps %ymm4,%ymm5,%ymm4
          for (let l = 0; l < 8; l++) ymm4[l] = Math.fround((ymm5[l] as number) + (ymm4[l] as number));
          // @0x3a5dce: vmulps %ymm4,%ymm0,%ymm0
          for (let l = 0; l < 8; l++) ymm0[l] = Math.fround((ymm0[l] as number) * (ymm4[l] as number));
          // @0x3a5dd2: vaddps %ymm0,%ymm1,%ymm0 — poly + one
          for (let l = 0; l < 8; l++) ymm0[l] = Math.fround((ymm1[l] as number) + (ymm0[l] as number));
          // @0x3a5dd6: vcvttps2dq %ymm2,%ymm1 — CLOBBERS the "one" in %ymm1 (reloaded next iter)
          for (let l = 0; l < 8; l++) iA[l] = cvttps2dq(ymm2[l] as number);
          // @0x3a5dda/@0x3a5de0/@0x3a5de4: vpaddd both halves with the same %xmm3 bias
          for (let l = 0; l < 8; l++) iA[l] = ((iB[l & 3] as number) + (iA[l] as number)) | 0;
          // @0x3a5de8/@0x3a5ded/@0x3a5df2: vpslld $0x17, recombined
          for (let l = 0; l < 8; l++) ymm1[l] = floatOf(((iA[l] as number) << 23) >>> 0);
          // @0x3a5df8: vmulps %ymm1,%ymm0,%ymm0
          for (let l = 0; l < 8; l++) ymm0[l] = Math.fround((ymm0[l] as number) * (ymm1[l] as number));
          // @0x3a5dfc: vblendps $0x88,0x160(%rsp),%ymm0,%ymm0 — the parked source alpha
          ymm0[3] = stack[0x160 / 4 + 3] as number;
          ymm0[7] = stack[0x160 / 4 + 7] as number;
          // @0x3a5e07: vmovups %ymm0,-0x10(%r8,%rbx)
          for (let l = 0; l < 8; l++) outArr[q + l] = ymm0[l] as number;

          // @0x3a5e0e: addq $0x20,%rbx
          k++;
          // @0x3a5e12/@0x3a5e19/@0x3a5e1c: r14d = r11d + ecx - 2 (r11d BEFORE the decrement)
          const r14 = (((r11 + cols) | 0) - 2) | 0;
          // @0x3a5e15: addl $-0x2,%r11d
          r11 = (r11 - 2) | 0;
          // @0x3a5e20/@0x3a5e24: cmpl $0x1,%r14d ; jg 0x3a5a40
          if (!(r14 > 1)) break;
        }
        // @0x3a5e2a: negl %r11d — r11d is now the count of texels the body consumed
        r11 = -r11 | 0;
      }

      // @0x3a5e2d/@0x3a5e30: cmpl %ecx,%r11d ; jge 0x3a5a10 — no odd texel; next row.
      // This is also the `cols <= 0` exit: r11d is 0 there and 0 >= cols, so the row writes
      // nothing at all.
      if (r11 < cols) {
        // @0x3a5e36/@0x3a5e39: movl %r11d,%r11d ; shlq $0x4,%r11 — byte offset of the texel
        const p = inBase + 4 * r11;
        const q = outBase + 4 * r11;

        // ── 4-wide tail: exactly ONE texel, then `jmp 0x3a5a10` (the row advance) ─────────
        // Same computation as the 8-wide body, separately register-allocated, and using
        // `vcmpnleps` where the body uses `vcmpltps` (they differ on NaN — see the header).
        // @0x3a5e3d: vmovaps (%r9,%r11),%xmm12
        for (let l = 0; l < 4; l++) ymm12[l] = inArr[p + l] as number;
        // @0x3a5e43: movq 0x198(%rdi),%rbx — the parameter bank again
        // @0x3a5e4a: vmovaps 0x40(%rbx),%xmm8 ; @0x3a5e4f: vmovaps 0x60(%rbx),%xmm1
        for (let l = 0; l < 4; l++) ymm8[l] = kv(V_FLOOR, l);
        for (let l = 0; l < 4; l++) ymm1[l] = kv(V_ONE, l);
        // @0x3a5e54: vmaxps %xmm8,%xmm12,%xmm9 — c = max(texel, P2)
        for (let l = 0; l < 4; l++) ymm9[l] = maxps(ymm12[l] as number, ymm8[l] as number);
        // @0x3a5e59: vbroadcastss 0x20(%rbx),%xmm0
        for (let l = 0; l < 4; l++) ymm0[l] = ks(S_EXP1);
        // @0x3a5e5f: vcmpeqps %xmm0,%xmm8,%xmm3 — (P2 == exponent); operands are the other way
        //   round from @0x3a5a91, which is immaterial because equality is symmetric.
        for (let l = 0; l < 4; l++) mk2[l] = cmpeqps(ymm8[l] as number, ymm0[l] as number);
        // @0x3a5e64: vandps %xmm1,%xmm3,%xmm3
        for (let l = 0; l < 4; l++) {
          ymm3[l] = floatOf((mk2[l] as number) & bitsOf(ymm1[l] as number));
        }
        // @0x3a5e68: vcmpnleps %xmm8,%xmm3,%xmm3 — NOT(that <= P2)
        for (let l = 0; l < 4; l++) mk2[l] = cmpnleps(ymm3[l] as number, ymm8[l] as number);
        // @0x3a5e6e: vblendvps %xmm3,%xmm1,%xmm9,%xmm3 — t = mask ? one : c
        for (let l = 0; l < 4; l++) {
          ymm3[l] = ((mk2[l] as number) & 0x80000000) !== 0 ? (ymm1[l] as number) : (ymm9[l] as number);
        }
        // @0x3a5e74: vmovaps 0x80(%rbx),%xmm2 ; @0x3a5e7c: vmovaps %xmm2,0x140(%rsp)
        for (let l = 0; l < 4; l++) ymm2[l] = kv(V_MANTISSA_MASK, l);
        for (let l = 0; l < 4; l++) stack[0x140 / 4 + l] = ymm2[l] as number;
        // @0x3a5e85: vandps %xmm3,%xmm2,%xmm4 ; @0x3a5e89: vorps %xmm1,%xmm4,%xmm4
        for (let l = 0; l < 4; l++) {
          ymm4[l] = floatOf(bitsOf(ymm2[l] as number) & bitsOf(ymm3[l] as number));
        }
        for (let l = 0; l < 4; l++) {
          ymm4[l] = floatOf(bitsOf(ymm4[l] as number) | bitsOf(ymm1[l] as number));
        }
        // @0x3a5e8d: vmovaps 0xa0(%rbx),%xmm2 ; @0x3a5e95: vmovaps %xmm2,0x120(%rsp)
        for (let l = 0; l < 4; l++) ymm2[l] = kv(V_LOG_CUTOFF, l);
        for (let l = 0; l < 4; l++) stack[0x120 / 4 + l] = ymm2[l] as number;
        // @0x3a5e9e: vcmpltps %xmm2,%xmm3,%xmm5 — t < FLT_MIN ?
        for (let l = 0; l < 4; l++) mk5[l] = cmpltps(ymm3[l] as number, ymm2[l] as number);
        // @0x3a5ea3: vmovaps 0xc0(%rbx),%xmm2 ; @0x3a5eab: vmovaps %xmm2,0x100(%rsp)
        for (let l = 0; l < 4; l++) ymm2[l] = kv(V_LOG_CUTOFF_ADJ, l);
        for (let l = 0; l < 4; l++) stack[0x100 / 4 + l] = ymm2[l] as number;
        // @0x3a5eb4: vandps %xmm2,%xmm5,%xmm5
        for (let l = 0; l < 4; l++) {
          ymm5[l] = floatOf((mk5[l] as number) & bitsOf(ymm2[l] as number));
        }
        // @0x3a5eb8: vpsrld $0x17,%xmm3,%xmm3 ; @0x3a5ebd: vcvtdq2ps %xmm3,%xmm3
        for (let l = 0; l < 4; l++) iA[l] = bitsOf(ymm3[l] as number) >>> 23;
        for (let l = 0; l < 4; l++) ymm3[l] = Math.fround(iA[l] as number);
        // @0x3a5ec1: vsubps %xmm5,%xmm3,%xmm3
        for (let l = 0; l < 4; l++) ymm3[l] = Math.fround((ymm3[l] as number) - (ymm5[l] as number));
        // @0x3a5ec5: vmovaps 0xe0(%rbx),%xmm2 ; @0x3a5ecd: vmovaps %xmm2,0xe0(%rsp)
        for (let l = 0; l < 4; l++) ymm2[l] = kv(V_EXP_BIAS, l);
        for (let l = 0; l < 4; l++) stack[0xe0 / 4 + l] = ymm2[l] as number;
        // @0x3a5ed6: vsubps %xmm2,%xmm3,%xmm3
        for (let l = 0; l < 4; l++) ymm3[l] = Math.fround((ymm3[l] as number) - (ymm2[l] as number));
        // @0x3a5eda: vmovaps 0x100(%rbx),%xmm2 ; @0x3a5ee2: vmovaps %xmm2,0xc0(%rsp)
        for (let l = 0; l < 4; l++) ymm2[l] = kv(V_MANTISSA_SPLIT, l);
        for (let l = 0; l < 4; l++) stack[0xc0 / 4 + l] = ymm2[l] as number;
        // @0x3a5eeb: vcmpltps %xmm4,%xmm2,%xmm5 — (sqrt2 < m)
        for (let l = 0; l < 4; l++) mk5[l] = cmpltps(ymm2[l] as number, ymm4[l] as number);
        // @0x3a5ef0: vandps %xmm1,%xmm5,%xmm5
        for (let l = 0; l < 4; l++) {
          ymm5[l] = floatOf((mk5[l] as number) & bitsOf(ymm1[l] as number));
        }
        // @0x3a5ef4: vaddps %xmm5,%xmm3,%xmm3 — exponent += correction
        for (let l = 0; l < 4; l++) ymm3[l] = Math.fround((ymm5[l] as number) + (ymm3[l] as number));
        // @0x3a5ef8: vmovaps 0x120(%rbx),%xmm2 ; @0x3a5f00: vmovaps %xmm2,0xa0(%rsp)
        for (let l = 0; l < 4; l++) ymm2[l] = kv(V_SPLIT_SCALE, l);
        for (let l = 0; l < 4; l++) stack[0xa0 / 4 + l] = ymm2[l] as number;
        // @0x3a5f09: vmulps %xmm5,%xmm2,%xmm5 ; @0x3a5f0d: vmulps %xmm4,%xmm5,%xmm5
        for (let l = 0; l < 4; l++) ymm5[l] = Math.fround((ymm2[l] as number) * (ymm5[l] as number));
        for (let l = 0; l < 4; l++) ymm5[l] = Math.fround((ymm5[l] as number) * (ymm4[l] as number));
        // @0x3a5f11: vsubps %xmm1,%xmm4,%xmm4 ; @0x3a5f15: vsubps %xmm5,%xmm4,%xmm4 — x
        for (let l = 0; l < 4; l++) ymm4[l] = Math.fround((ymm4[l] as number) - (ymm1[l] as number));
        for (let l = 0; l < 4; l++) ymm4[l] = Math.fround((ymm4[l] as number) - (ymm5[l] as number));
        // @0x3a5f19: vmovaps 0x140(%rbx),%xmm2 ; @0x3a5f21: vmovaps %xmm2,0x80(%rsp)
        for (let l = 0; l < 4; l++) ymm2[l] = kv(V_LOG_C0, l);
        for (let l = 0; l < 4; l++) stack[0x80 / 4 + l] = ymm2[l] as number;
        // @0x3a5f2a: vmulps %xmm4,%xmm2,%xmm5
        for (let l = 0; l < 4; l++) ymm5[l] = Math.fround((ymm2[l] as number) * (ymm4[l] as number));
        // @0x3a5f2e: vmovaps 0x160(%rbx),%xmm2 ; @0x3a5f36: vmovaps %xmm2,0x60(%rsp)
        for (let l = 0; l < 4; l++) ymm2[l] = kv(V_LOG_C1, l);
        for (let l = 0; l < 4; l++) stack[0x60 / 4 + l] = ymm2[l] as number;
        // @0x3a5f3c: vaddps %xmm5,%xmm2,%xmm5
        for (let l = 0; l < 4; l++) ymm5[l] = Math.fround((ymm2[l] as number) + (ymm5[l] as number));
        // @0x3a5f40: vmovaps 0x180(%rbx),%xmm2 ; @0x3a5f48: vmovaps %xmm2,0x40(%rsp)
        for (let l = 0; l < 4; l++) ymm2[l] = kv(V_LOG_C2, l);
        for (let l = 0; l < 4; l++) stack[0x40 / 4 + l] = ymm2[l] as number;
        // @0x3a5f4e: vmulps %xmm4,%xmm2,%xmm6
        for (let l = 0; l < 4; l++) ymm6[l] = Math.fround((ymm2[l] as number) * (ymm4[l] as number));
        // @0x3a5f52: vmovaps 0x1a0(%rbx),%xmm2 ; @0x3a5f5a: vmovaps %xmm2,0x20(%rsp)
        for (let l = 0; l < 4; l++) ymm2[l] = kv(V_LOG_C3, l);
        for (let l = 0; l < 4; l++) stack[0x20 / 4 + l] = ymm2[l] as number;
        // @0x3a5f60: vaddps %xmm6,%xmm2,%xmm6
        for (let l = 0; l < 4; l++) ymm6[l] = Math.fround((ymm2[l] as number) + (ymm6[l] as number));
        // @0x3a5f64: vmulps %xmm4,%xmm4,%xmm7 — x²
        for (let l = 0; l < 4; l++) ymm7[l] = Math.fround((ymm4[l] as number) * (ymm4[l] as number));
        // @0x3a5f68: vmulps %xmm6,%xmm7,%xmm6 ; @0x3a5f6c: vaddps %xmm6,%xmm5,%xmm5
        for (let l = 0; l < 4; l++) ymm6[l] = Math.fround((ymm7[l] as number) * (ymm6[l] as number));
        for (let l = 0; l < 4; l++) ymm5[l] = Math.fround((ymm5[l] as number) + (ymm6[l] as number));
        // @0x3a5f70: vmulps %xmm5,%xmm7,%xmm5
        for (let l = 0; l < 4; l++) ymm5[l] = Math.fround((ymm7[l] as number) * (ymm5[l] as number));
        // @0x3a5f74: vmovaps 0x1c0(%rbx),%xmm11 ; @0x3a5f7c: vmulps %xmm4,%xmm11,%xmm7
        for (let l = 0; l < 4; l++) ymm11[l] = kv(V_LOG_C4, l);
        for (let l = 0; l < 4; l++) ymm7[l] = Math.fround((ymm11[l] as number) * (ymm4[l] as number));
        // @0x3a5f80: vmovaps 0x1e0(%rbx),%xmm10 ; @0x3a5f88: vaddps %xmm7,%xmm10,%xmm7
        for (let l = 0; l < 4; l++) ymm10[l] = kv(V_LOG_C5, l);
        for (let l = 0; l < 4; l++) ymm7[l] = Math.fround((ymm10[l] as number) + (ymm7[l] as number));
        // @0x3a5f8c: vaddps %xmm5,%xmm7,%xmm5 ; @0x3a5f90: vmulps %xmm5,%xmm4,%xmm5
        for (let l = 0; l < 4; l++) ymm5[l] = Math.fround((ymm7[l] as number) + (ymm5[l] as number));
        for (let l = 0; l < 4; l++) ymm5[l] = Math.fround((ymm4[l] as number) * (ymm5[l] as number));
        // @0x3a5f94: vmovaps 0x200(%rbx),%xmm2 ; @0x3a5f9c: vmovaps %xmm2,(%rsp)
        for (let l = 0; l < 4; l++) ymm2[l] = kv(V_LOG_C6, l);
        for (let l = 0; l < 4; l++) stack[l] = ymm2[l] as number;
        // @0x3a5fa1: vaddps %xmm5,%xmm2,%xmm5 ; @0x3a5fa5: vmulps %xmm5,%xmm4,%xmm4
        for (let l = 0; l < 4; l++) ymm5[l] = Math.fround((ymm2[l] as number) + (ymm5[l] as number));
        for (let l = 0; l < 4; l++) ymm4[l] = Math.fround((ymm4[l] as number) * (ymm5[l] as number));
        // @0x3a5fa9: vaddps %xmm4,%xmm3,%xmm3 — log2(t)
        for (let l = 0; l < 4; l++) ymm3[l] = Math.fround((ymm3[l] as number) + (ymm4[l] as number));
        // @0x3a5fad: vmulps %xmm3,%xmm0,%xmm0 — · the first exponent
        for (let l = 0; l < 4; l++) ymm0[l] = Math.fround((ymm0[l] as number) * (ymm3[l] as number));
        // @0x3a5fb1: vmovaps 0x220(%rbx),%xmm15 ; @0x3a5fb9: vmaxps %xmm15,%xmm0,%xmm0
        for (let l = 0; l < 4; l++) ymm15[l] = kv(V_EXP_FLOOR, l);
        for (let l = 0; l < 4; l++) ymm0[l] = maxps(ymm0[l] as number, ymm15[l] as number);
        // @0x3a5fbe: vroundps $0x9,%xmm0,%xmm5 ; @0x3a5fc4: vsubps %xmm5,%xmm0,%xmm0
        for (let l = 0; l < 4; l++) ymm5[l] = roundps_floor(ymm0[l] as number);
        for (let l = 0; l < 4; l++) ymm0[l] = Math.fround((ymm0[l] as number) - (ymm5[l] as number));
        // @0x3a5fc8: vmovaps 0x240(%rbx),%xmm14 ; @0x3a5fd0: vmulps %xmm0,%xmm14,%xmm3
        for (let l = 0; l < 4; l++) ymm14[l] = kv(V_EXP_C0, l);
        for (let l = 0; l < 4; l++) ymm3[l] = Math.fround((ymm14[l] as number) * (ymm0[l] as number));
        // @0x3a5fd4: vmovaps 0x260(%rbx),%xmm7 ; @0x3a5fdc: vaddps %xmm7,%xmm3,%xmm3
        for (let l = 0; l < 4; l++) ymm7[l] = kv(V_EXP_C1, l);
        for (let l = 0; l < 4; l++) ymm3[l] = Math.fround((ymm3[l] as number) + (ymm7[l] as number));
        // @0x3a5fe0: vmulps %xmm0,%xmm0,%xmm4 ; @0x3a5fe4: vmulps %xmm3,%xmm4,%xmm3
        for (let l = 0; l < 4; l++) ymm4[l] = Math.fround((ymm0[l] as number) * (ymm0[l] as number));
        for (let l = 0; l < 4; l++) ymm3[l] = Math.fround((ymm4[l] as number) * (ymm3[l] as number));
        // @0x3a5fe8: vmovaps 0x280(%rbx),%xmm6 ; @0x3a5ff0: vmulps %xmm6,%xmm0,%xmm2
        for (let l = 0; l < 4; l++) ymm6[l] = kv(V_EXP_C2, l);
        for (let l = 0; l < 4; l++) ymm2[l] = Math.fround((ymm0[l] as number) * (ymm6[l] as number));
        // @0x3a5ff4: vmovaps 0x2a0(%rbx),%xmm4 ; @0x3a5ffc: vaddps %xmm4,%xmm2,%xmm2
        for (let l = 0; l < 4; l++) ymm4[l] = kv(V_EXP_C3, l);
        for (let l = 0; l < 4; l++) ymm2[l] = Math.fround((ymm2[l] as number) + (ymm4[l] as number));
        // @0x3a6000: vaddps %xmm2,%xmm3,%xmm2 ; @0x3a6004: vmulps %xmm2,%xmm0,%xmm2
        for (let l = 0; l < 4; l++) ymm2[l] = Math.fround((ymm3[l] as number) + (ymm2[l] as number));
        for (let l = 0; l < 4; l++) ymm2[l] = Math.fround((ymm0[l] as number) * (ymm2[l] as number));
        // @0x3a6008: vmovaps 0x2c0(%rbx),%xmm3 ; @0x3a6010: vaddps %xmm2,%xmm3,%xmm2
        for (let l = 0; l < 4; l++) ymm3[l] = kv(V_EXP_C4, l);
        for (let l = 0; l < 4; l++) ymm2[l] = Math.fround((ymm3[l] as number) + (ymm2[l] as number));
        // @0x3a6014: vmulps %xmm2,%xmm0,%xmm0 ; @0x3a6018: vaddps %xmm0,%xmm1,%xmm2
        for (let l = 0; l < 4; l++) ymm0[l] = Math.fround((ymm0[l] as number) * (ymm2[l] as number));
        for (let l = 0; l < 4; l++) ymm2[l] = Math.fround((ymm1[l] as number) + (ymm0[l] as number));
        // @0x3a601c: vcvttps2dq %xmm5,%xmm5
        for (let l = 0; l < 4; l++) iA[l] = cvttps2dq(ymm5[l] as number);
        // @0x3a6020: vmovdqa 0x2e0(%rbx),%xmm0 — the i32 bias (CLOBBERS %xmm0)
        for (let l = 0; l < 4; l++) iB[l] = ki(V_EXP2_BIAS_I, l);
        // @0x3a6028: vpaddd %xmm5,%xmm0,%xmm5 ; @0x3a602c: vpslld $0x17,%xmm5,%xmm5
        for (let l = 0; l < 4; l++) iA[l] = ((iB[l] as number) + (iA[l] as number)) | 0;
        for (let l = 0; l < 4; l++) ymm5[l] = floatOf(((iA[l] as number) << 23) >>> 0);
        // @0x3a6031: vmulps %xmm5,%xmm2,%xmm2 — the first pow result
        for (let l = 0; l < 4; l++) ymm2[l] = Math.fround((ymm2[l] as number) * (ymm5[l] as number));
        // @0x3a6035: vbroadcastss (%rbx),%xmm5 ; @0x3a603a: vmulps %xmm2,%xmm5,%xmm2
        for (let l = 0; l < 4; l++) ymm5[l] = ks(S_POW_SCALE);
        for (let l = 0; l < 4; l++) ymm2[l] = Math.fround((ymm5[l] as number) * (ymm2[l] as number));
        // @0x3a603e: vbroadcastss 0x4(%rbx),%xmm5 ; @0x3a6044: vaddps %xmm2,%xmm5,%xmm2
        for (let l = 0; l < 4; l++) ymm5[l] = ks(S_POW_OFFSET);
        for (let l = 0; l < 4; l++) ymm2[l] = Math.fround((ymm5[l] as number) + (ymm2[l] as number));
        // @0x3a6048: vbroadcastss 0x8(%rbx),%xmm5 ; @0x3a604e: vmulps %xmm5,%xmm9,%xmm5
        for (let l = 0; l < 4; l++) ymm5[l] = ks(S_LINEAR_SLOPE);
        for (let l = 0; l < 4; l++) ymm5[l] = Math.fround((ymm9[l] as number) * (ymm5[l] as number));
        // @0x3a6052: vbroadcastss 0xc(%rbx),%xmm13 ; @0x3a6058: vcmpltps %xmm9,%xmm13,%xmm9
        for (let l = 0; l < 4; l++) ymm13[l] = ks(S_BREAKPOINT);
        for (let l = 0; l < 4; l++) mk9[l] = cmpltps(ymm13[l] as number, ymm9[l] as number);
        // @0x3a605e: vandps %xmm1,%xmm9,%xmm9
        for (let l = 0; l < 4; l++) {
          ymm9[l] = floatOf((mk9[l] as number) & bitsOf(ymm1[l] as number));
        }
        // @0x3a6062: vcmpnleps %xmm8,%xmm9,%xmm9
        for (let l = 0; l < 4; l++) mk9[l] = cmpnleps(ymm9[l] as number, ymm8[l] as number);
        // @0x3a6068: vblendvps %xmm9,%xmm2,%xmm5,%xmm5
        for (let l = 0; l < 4; l++) {
          ymm5[l] = ((mk9[l] as number) & 0x80000000) !== 0 ? (ymm2[l] as number) : (ymm5[l] as number);
        }
        // @0x3a606e: vbroadcastss 0x24(%rbx),%xmm2 — the SECOND pow exponent
        for (let l = 0; l < 4; l++) ymm2[l] = ks(S_EXP2);
        // @0x3a6074: vcmpeqps %xmm2,%xmm8,%xmm9 ; @0x3a6079: vandps %xmm1,%xmm9,%xmm9
        for (let l = 0; l < 4; l++) mk9[l] = cmpeqps(ymm8[l] as number, ymm2[l] as number);
        for (let l = 0; l < 4; l++) {
          ymm9[l] = floatOf((mk9[l] as number) & bitsOf(ymm1[l] as number));
        }
        // @0x3a607d: vcmpnleps %xmm8,%xmm9,%xmm8 — CLOBBERS P2 in %xmm8; not read again
        for (let l = 0; l < 4; l++) mk8[l] = cmpnleps(ymm9[l] as number, ymm8[l] as number);
        // @0x3a6083: vblendps $0x8,%xmm12,%xmm5,%xmm5 — lane 3 (alpha) from the source
        ymm5[3] = ymm12[3] as number;
        // @0x3a6089: vblendvps %xmm8,%xmm1,%xmm5,%xmm5
        for (let l = 0; l < 4; l++) {
          ymm5[l] = ((mk8[l] as number) & 0x80000000) !== 0 ? (ymm1[l] as number) : (ymm5[l] as number);
        }

        // ── the tail's SECOND log2 ───────────────────────────────────────────────────────
        // @0x3a608f: vcmpltps 0x120(%rsp),%xmm5,%xmm8 — v < FLT_MIN ? (spill written @0x3a5e95)
        for (let l = 0; l < 4; l++) mk8[l] = cmpltps(ymm5[l] as number, stack[0x120 / 4 + l] as number);
        // @0x3a6099: vandps 0x100(%rsp),%xmm8,%xmm8 — the +Inf correction
        for (let l = 0; l < 4; l++) {
          ymm8[l] = floatOf((mk8[l] as number) & bitsOf(stack[0x100 / 4 + l] as number));
        }
        // @0x3a60a2: vandps 0x140(%rsp),%xmm5,%xmm9 — mantissa bits
        for (let l = 0; l < 4; l++) {
          ymm9[l] = floatOf(bitsOf(ymm5[l] as number) & bitsOf(stack[0x140 / 4 + l] as number));
        }
        // @0x3a60ab: vpsrld $0x17,%xmm5,%xmm5 ; @0x3a60b0: vcvtdq2ps %xmm5,%xmm5
        for (let l = 0; l < 4; l++) iA[l] = bitsOf(ymm5[l] as number) >>> 23;
        for (let l = 0; l < 4; l++) ymm5[l] = Math.fround(iA[l] as number);
        // @0x3a60b4: vsubps %xmm8,%xmm5,%xmm5
        for (let l = 0; l < 4; l++) ymm5[l] = Math.fround((ymm5[l] as number) - (ymm8[l] as number));
        // @0x3a60b9: vsubps 0xe0(%rsp),%xmm5,%xmm5 — remove the 127 bias
        for (let l = 0; l < 4; l++) {
          ymm5[l] = Math.fround((ymm5[l] as number) - (stack[0xe0 / 4 + l] as number));
        }
        // @0x3a60c2: vorps %xmm1,%xmm9,%xmm8 — m in [1,2)
        for (let l = 0; l < 4; l++) {
          ymm8[l] = floatOf(bitsOf(ymm9[l] as number) | bitsOf(ymm1[l] as number));
        }
        // @0x3a60c6: vmovaps 0xc0(%rsp),%xmm9 ; @0x3a60cf: vcmpltps %xmm8,%xmm9,%xmm9
        for (let l = 0; l < 4; l++) ymm9[l] = stack[0xc0 / 4 + l] as number;
        for (let l = 0; l < 4; l++) mk9[l] = cmpltps(ymm9[l] as number, ymm8[l] as number);
        // @0x3a60d5: vandps %xmm1,%xmm9,%xmm9
        for (let l = 0; l < 4; l++) {
          ymm9[l] = floatOf((mk9[l] as number) & bitsOf(ymm1[l] as number));
        }
        // @0x3a60d9: vaddps %xmm5,%xmm9,%xmm5 — exponent += correction
        for (let l = 0; l < 4; l++) ymm5[l] = Math.fround((ymm9[l] as number) + (ymm5[l] as number));
        // @0x3a60dd: vmulps 0xa0(%rsp),%xmm9,%xmm9 ; @0x3a60e6: vmulps %xmm8,%xmm9,%xmm9
        for (let l = 0; l < 4; l++) {
          ymm9[l] = Math.fround((ymm9[l] as number) * (stack[0xa0 / 4 + l] as number));
        }
        for (let l = 0; l < 4; l++) ymm9[l] = Math.fround((ymm9[l] as number) * (ymm8[l] as number));
        // @0x3a60eb: vsubps %xmm1,%xmm8,%xmm8 ; @0x3a60ef: vsubps %xmm9,%xmm8,%xmm8 — x
        for (let l = 0; l < 4; l++) ymm8[l] = Math.fround((ymm8[l] as number) - (ymm1[l] as number));
        for (let l = 0; l < 4; l++) ymm8[l] = Math.fround((ymm8[l] as number) - (ymm9[l] as number));
        // @0x3a60f4: vmulps 0x80(%rsp),%xmm8,%xmm9 ; @0x3a60fd: vaddps 0x60(%rsp),%xmm9,%xmm9
        for (let l = 0; l < 4; l++) {
          ymm9[l] = Math.fround((ymm8[l] as number) * (stack[0x80 / 4 + l] as number));
        }
        for (let l = 0; l < 4; l++) {
          ymm9[l] = Math.fround((ymm9[l] as number) + (stack[0x60 / 4 + l] as number));
        }
        // @0x3a6103: vmulps 0x40(%rsp),%xmm8,%xmm13 ; @0x3a6109: vaddps 0x20(%rsp),%xmm13,%xmm13
        for (let l = 0; l < 4; l++) {
          ymm13[l] = Math.fround((ymm8[l] as number) * (stack[0x40 / 4 + l] as number));
        }
        for (let l = 0; l < 4; l++) {
          ymm13[l] = Math.fround((ymm13[l] as number) + (stack[0x20 / 4 + l] as number));
        }
        // @0x3a610f: vmulps %xmm8,%xmm11,%xmm11 ; @0x3a6114: vaddps %xmm11,%xmm10,%xmm10
        for (let l = 0; l < 4; l++) ymm11[l] = Math.fround((ymm11[l] as number) * (ymm8[l] as number));
        for (let l = 0; l < 4; l++) ymm10[l] = Math.fround((ymm10[l] as number) + (ymm11[l] as number));
        // @0x3a6119: vmulps %xmm8,%xmm8,%xmm11 — x²
        for (let l = 0; l < 4; l++) ymm11[l] = Math.fround((ymm8[l] as number) * (ymm8[l] as number));
        // @0x3a611e: vmulps %xmm13,%xmm11,%xmm13 ; @0x3a6123: vaddps %xmm13,%xmm9,%xmm9
        for (let l = 0; l < 4; l++) ymm13[l] = Math.fround((ymm11[l] as number) * (ymm13[l] as number));
        for (let l = 0; l < 4; l++) ymm9[l] = Math.fround((ymm9[l] as number) + (ymm13[l] as number));
        // @0x3a6128: vmulps %xmm9,%xmm11,%xmm9 ; @0x3a612d: vaddps %xmm9,%xmm10,%xmm9
        for (let l = 0; l < 4; l++) ymm9[l] = Math.fround((ymm11[l] as number) * (ymm9[l] as number));
        for (let l = 0; l < 4; l++) ymm9[l] = Math.fround((ymm10[l] as number) + (ymm9[l] as number));
        // @0x3a6132: vmulps %xmm9,%xmm8,%xmm9 ; @0x3a6137: vaddps (%rsp),%xmm9,%xmm9
        for (let l = 0; l < 4; l++) ymm9[l] = Math.fround((ymm8[l] as number) * (ymm9[l] as number));
        for (let l = 0; l < 4; l++) ymm9[l] = Math.fround((ymm9[l] as number) + (stack[l] as number));
        // @0x3a613c: vmulps %xmm9,%xmm8,%xmm8 ; @0x3a6141: vaddps %xmm5,%xmm8,%xmm5 — log2(v)
        for (let l = 0; l < 4; l++) ymm8[l] = Math.fround((ymm8[l] as number) * (ymm9[l] as number));
        for (let l = 0; l < 4; l++) ymm5[l] = Math.fround((ymm8[l] as number) + (ymm5[l] as number));
        // @0x3a6145: vmulps %xmm5,%xmm2,%xmm2 — · the second exponent
        for (let l = 0; l < 4; l++) ymm2[l] = Math.fround((ymm2[l] as number) * (ymm5[l] as number));

        // ── the tail's SECOND exp2 ───────────────────────────────────────────────────────
        // @0x3a6149: vmaxps %xmm15,%xmm2,%xmm2 ; @0x3a614e: vroundps $0x9,%xmm2,%xmm5
        for (let l = 0; l < 4; l++) ymm2[l] = maxps(ymm2[l] as number, ymm15[l] as number);
        for (let l = 0; l < 4; l++) ymm5[l] = roundps_floor(ymm2[l] as number);
        // @0x3a6154: vsubps %xmm5,%xmm2,%xmm2
        for (let l = 0; l < 4; l++) ymm2[l] = Math.fround((ymm2[l] as number) - (ymm5[l] as number));
        // @0x3a6158: vmulps %xmm2,%xmm14,%xmm8 ; @0x3a615c: vaddps %xmm7,%xmm8,%xmm7
        for (let l = 0; l < 4; l++) ymm8[l] = Math.fround((ymm14[l] as number) * (ymm2[l] as number));
        for (let l = 0; l < 4; l++) ymm7[l] = Math.fround((ymm8[l] as number) + (ymm7[l] as number));
        // @0x3a6160: vmulps %xmm2,%xmm2,%xmm8 ; @0x3a6164: vmulps %xmm7,%xmm8,%xmm7
        for (let l = 0; l < 4; l++) ymm8[l] = Math.fround((ymm2[l] as number) * (ymm2[l] as number));
        for (let l = 0; l < 4; l++) ymm7[l] = Math.fround((ymm8[l] as number) * (ymm7[l] as number));
        // @0x3a6168: vmulps %xmm2,%xmm6,%xmm6 ; @0x3a616c: vaddps %xmm6,%xmm4,%xmm4
        for (let l = 0; l < 4; l++) ymm6[l] = Math.fround((ymm6[l] as number) * (ymm2[l] as number));
        for (let l = 0; l < 4; l++) ymm4[l] = Math.fround((ymm4[l] as number) + (ymm6[l] as number));
        // @0x3a6170: vaddps %xmm7,%xmm4,%xmm4 ; @0x3a6174: vmulps %xmm4,%xmm2,%xmm4
        for (let l = 0; l < 4; l++) ymm4[l] = Math.fround((ymm4[l] as number) + (ymm7[l] as number));
        for (let l = 0; l < 4; l++) ymm4[l] = Math.fround((ymm2[l] as number) * (ymm4[l] as number));
        // @0x3a6178: vaddps %xmm4,%xmm3,%xmm3 ; @0x3a617c: vmulps %xmm3,%xmm2,%xmm2
        for (let l = 0; l < 4; l++) ymm3[l] = Math.fround((ymm3[l] as number) + (ymm4[l] as number));
        for (let l = 0; l < 4; l++) ymm2[l] = Math.fround((ymm2[l] as number) * (ymm3[l] as number));
        // @0x3a6180: vaddps %xmm2,%xmm1,%xmm1 — poly + one
        for (let l = 0; l < 4; l++) ymm1[l] = Math.fround((ymm1[l] as number) + (ymm2[l] as number));
        // @0x3a6184: vcvttps2dq %xmm5,%xmm2
        for (let l = 0; l < 4; l++) iA[l] = cvttps2dq(ymm5[l] as number);
        // @0x3a6188: vpaddd %xmm0,%xmm2,%xmm0 ; @0x3a618c: vpslld $0x17,%xmm0,%xmm0
        for (let l = 0; l < 4; l++) iA[l] = ((iA[l] as number) + (iB[l] as number)) | 0;
        for (let l = 0; l < 4; l++) ymm0[l] = floatOf(((iA[l] as number) << 23) >>> 0);
        // @0x3a6191: vmulps %xmm0,%xmm1,%xmm0
        for (let l = 0; l < 4; l++) ymm0[l] = Math.fround((ymm1[l] as number) * (ymm0[l] as number));
        // @0x3a6195: vblendps $0x8,%xmm12,%xmm0,%xmm0 — lane 3 (alpha) from the source
        ymm0[3] = ymm12[3] as number;
        // @0x3a619b: vmovaps %xmm0,(%r8,%r11)
        for (let l = 0; l < 4; l++) outArr[q + l] = ymm0[l] as number;
        // @0x3a61a1: jmp 0x3a5a10 — the row advance; the tail never iterates.
      }

      // @0x3a5a10/@0x3a5a13: addq %rsi,%r9 ; addq %rdx,%r8
      inBase += inRowStride;
      outBase += outRowStride;
    }

    // @0x3a61a6..@0x3a61b3: leaq -0x10(%rbp),%rsp ; popq %rbx ; popq %r14 ; popq %rbp ;
    //                       vzeroupper ; xorl %eax,%eax ; retq
    return 0;
  }
}
