// raw-port/src/render/HgcBT2100_PQ_OOTF_qtApprox.ts
//
// FCP `HgcBT2100_PQ_OOTF_qtApprox` — the `qtApprox` variant of the Helium BT.2100 PQ OOTF render
// node (the cheaper QuickTime transfer-function path; the suffix is FCP's own name for it).
// This file ports ONE method of that class, the AVX pixel kernel:
//
//   HgcBT2100_PQ_OOTF_qtApprox::RenderTile_AVX(HGTile*)   @Helium 0x00000000003a7220
//   `__ZN26HgcBT2100_PQ_OOTF_qtApprox14RenderTile_AVXEP6HGTile`
//
// FRAMEWORK: Helium.framework (x86_64 slice; nm class `t`, i.e. file-local).
//
// Regenerate the decode this port was transcribed from with:
//   bash raw-port/tools/disasm.sh --sym \
//     __ZN26HgcBT2100_PQ_OOTF_qtApprox14RenderTile_AVXEP6HGTile Helium
// 191 instructions, 0x3a7220..0x3a75f9. `grep -c callq` = 0 — a LEAF: no call of any kind, no
// vtable slot, no RIP-relative constant. Every number it uses is read out of the node's parameter
// bank through `this+0x198`, so this port takes that bank as a byte view and reads the same
// offsets rather than inventing values.
//
// AT&T operand order (PORTING_SPEC's cheat-sheet): `vop src2, src1, dst` is Intel
// `vop dst, src1, src2`. So `vmaxps %ymm3,%ymm0,%ymm0` is MAXPS(src1=ymm0, src2=ymm3), which
// returns src2 on equal AND on unordered; `vblendvps mask, src2, src1, dst` sets
// dst = mask ? src2 : src1.
//
// ── WHAT IT COMPUTES ─────────────────────────────────────────────────────────
// Per RGBA texel, with `p` = the parameter bank:
//
//   c   = max(texel, P1)                    // P1 = (0,0,0,-Inf): RGB clamped at 0, alpha not
//   v   = (c * P0.x) with the ALPHA lane put back from c
//   t   = (P0.y == P1) ? 1 : v              // per-lane; the "exponent is the floor" special case
//   out = P0.z * exp2( P0.y * log2(t) )     // == P0.z * t ** P0.y
//   out.a = c.a                             // alpha passes through the clamp, not the pow
//
// ONE pow, where the non-qtApprox sibling `HgcBT2100_PQ_OOTF` @0x3a59d0 (landed as
// raw-port/src/render/HgcBT2100_PQ_OOTF.ts) evaluates two and carries a linear segment below a
// breakpoint — that difference IS the "qtApprox". `log2` is the same exponent + polynomial
// decomposition and `exp2` the same 2^floor · polynomial(frac); the coefficients are Apple's
// shared SIMD power-function table, and in THIS class's bank they sit one slot LOWER than in the
// sibling's (its ctor zeroes three settable slots, this one zeroes a single slot 0).
//
// EXACTNESS: the only operations are load/store, max, add/sub/mul, and/or, the integer exponent
// shuffles (`vpsrld`/`vpaddd`/`vpslld`), `vroundps`, `vcvtdq2ps` and `vcvttps2dq`. No `vrcpps`,
// no `vdivps`, no `vsqrtps` — every operation is exactly specified by IEEE-754 or by integer
// semantics, so this port is bit-exact and its oracle demands 0 divergences, not an ulp budget.
//
// THE ALPHA LANE IS NOT SIMPLY COPIED. It goes through `vmaxps` against P1's lane 3 (-Inf) before
// being blended back in (@0x3a72af, then @0x3a72bd and again @0x3a743a). `max(a, -Inf)` is `a` for
// every value EXCEPT a NaN: MAXPS returns its SECOND operand when the comparison is unordered, so
// a NaN alpha comes out as -Inf. That is a real, reachable difference between "clamp the alpha"
// and "pass the alpha through", it is in the corpus, and the port reproduces it through the same
// MAXPS lane rule rather than by copying the input.
//
// ── PARAMETER BANK (`this+0x198`) ────────────────────────────────────────────
// Allocated and filled by `HgcBT2100_PQ_OOTF_qtApprox::HgcBT2100_PQ_OOTF_qtApprox()`
// @Helium 0x3a7a90 (C2) — a SEPARATE, not-yet-claimed port unit, so it is not transcribed here;
// this file only documents the layout it produces because this kernel reads it. `__Znam(0x347)`
// @0x3a7aa9, aligned up to 32 with the raw pointer stashed at base-8, stored to `this+0x198`.
// 25 slots of 32 bytes; each slot holds ONE float4 stored TWICE (the ctor's paired `movaps`
// writes), so a 32-byte `ymm` load of a slot yields (x,y,z,w,x,y,z,w).
//
//   slot 0 (+0x000)  ZEROED by the ctor @0x3a7acb/@0x3a7ad0 — the settable float4 P0, read here
//                    as three `vbroadcastss` scalars +0x00 / +0x04 / +0x08
//   slot 1 (+0x020)  (0, 0, 0, -Inf)               literal @Helium 0x892950   the clamp floor
//   slot 2 (+0x040)  (1, 1, 1, 0)                  literal @Helium 0x3ca9c0   the "one"
//   slot 3 (+0x060)  (-FLT_MIN ×3, 0) = 0x807fffff literal @Helium 0x892090   mantissa|sign mask
//   slot 4 (+0x080)  (+FLT_MIN ×3, 0) = 0x00800000 literal @Helium 0x858f70   denormal cutoff
//   slot 5 (+0x0a0)  (+Inf ×3, 0)                  literal @Helium 0x88f440
//   slot 6 (+0x0c0)  (127 ×3, 0)                   literal @Helium 0x88ded0
//   slot 7 (+0x0e0)  (sqrt(2) ×3, 0)               literal @Helium 0x88dee0
//   slot 8 (+0x100)  (0.5 ×3, 0)                   literal @Helium 0x85da90
//   slot 9 (+0x120)  ( 0.29608911 ×3, 0)           literal @Helium 0x88dfa0  ┐
//   slot10 (+0x140)  (-0.35917339 ×3, 0)           literal @Helium 0x88dfb0  │
//   slot11 (+0x160)  ( 0.17290929 ×3, 0)           literal @Helium 0x88dfc0  │ log2
//   slot12 (+0x180)  (-0.27149275 ×3, 0)           literal @Helium 0x88dfd0  │ poly
//   slot13 (+0x1a0)  ( 0.48059392 ×3, 0)           literal @Helium 0x88dfe0  │
//   slot14 (+0x1c0)  (-0.72136724 ×3, 0)           literal @Helium 0x88dff0  │
//   slot15 (+0x1e0)  ( 1.44269669 ×3, 0) = 1/ln2   literal @Helium 0x88e000  ┘
//   slot16 (+0x200)  (-127 ×3, 0)                  literal @Helium 0x88df30   exp2 input clamp
//   slot17 (+0x220)  ( 0.00179523 ×3, 0)           literal @Helium 0x88e010  ┐
//   slot18 (+0x240)  ( 0.00918918 ×3, 0)           literal @Helium 0x88e020  │ exp2
//   slot19 (+0x260)  ( 0.05566124 ×3, 0)           literal @Helium 0x88e030  │ poly
//   slot20 (+0x280)  ( 0.24020679 ×3, 0)           literal @Helium 0x88e040  │
//   slot21 (+0x2a0)  ( 0.69314754 ×3, 0) = ln2     literal @Helium 0x88e050  ┘
//   slot22 (+0x2c0)  (127 ×3, 0) as INT32 0x7f     literal @Helium 0x88df70   exp2 bias, `vmovdqa`
//   slot23 (+0x2e0)  (NaN ×3, 0)                   literal @Helium 0x88c7f0  — not read here
//   slot24 (+0x300)  (0, 0, 0, NaN)                literal @Helium 0x85fc40  — not read here
//
// Every slot value above was read out of `/tmp/Helium.x86_64` at the literal address obtained from
// the ctor's `movaps disp32(%rip)` (next_ip + disp32); the kernel itself contains no literals.
//
// ── THE TWO PATHS ────────────────────────────────────────────────────────────
// Per row: an 8-wide (`ymm`, 2 texels/iteration) body @0x3a7290..0x3a745d, entered only when the
// tile is at least 2 texels wide, then a 4-wide (`xmm`, 1 texel) tail @0x3a7476..0x3a75eb for the
// possible odd texel. Same computation, NOT the same code, transcribed separately:
//   * the "is the select mask set" test is `vcmpltps` @0x3a72cc in the 8-wide path and
//     `vcmpnleps` @0x3a74af in the 4-wide one. LT and NLE differ on NaN (LT false, NLE true).
//   * the 8-wide path loads bank slots with `vmovups`, the 4-wide with `vmovaps`.
//   * the exp2 polynomial's independent multiplies are issued in a different order
//     (@0x3a73bc..0x3a73e8 vs @0x3a7580..0x3a75a8), and the 4-wide path adds the exponent bias
//     straight from memory (`vpaddd 0x2c0(%rbx)` @0x3a75c4) where the 8-wide one loads it into
//     %xmm3 first and adds it to both halves.
// The tail runs at most ONCE per row: it ends in `jmp 0x3a7260` @0x3a75eb, the row advance.
//
// Unlike its sibling @0x3a59d0 this kernel needs NO stack spills: 0x180 bytes of frame are never
// used — there is no `subq` at all, only `pushq %rbp/%r14/%rbx` — because one pow's worth of
// constants fits in the register file.
//
// NaN PAYLOADS CANNOT REACH THE ARITHMETIC, AND THAT IS WHY THIS PORT CAN BE BIT-EXACT. JavaScript
// has exactly one NaN and storing it into a Float32Array canonicalises to 0x7fc00000, while the
// machine PROPAGATES an input NaN's payload through `vmulps`/`vaddps` — so a port like this one is
// only bit-exact if no input NaN payload survives to an output lane. Here none can: the FIRST
// thing every lane meets is `vmaxps` against the floor (@0x3a72af / @0x3a748d), and MAXPS returns
// its SECOND operand when the comparison is unordered, so a NaN texel becomes the floor value
// (0 on RGB, -Inf on alpha) before anything is computed with it. Any NaN downstream is therefore
// generated by an invalid operation, which yields the default QNaN 0x7fc00000 on both sides. This
// is asserted, not assumed: the oracle's corpus feeds 0xffffffff, 0x7f800001 and 0xffc0dead as
// input texels and the comparison stays bit-exact.
//
// DEGENERATE TILES (paths a fuzz corpus over "normal" tiles never enters, so they are transcribed
// from the branch structure and asserted by the oracle):
//   * rows <= 0 (`jle 0x3a75f4` @0x3a7226) returns 0 BEFORE building a frame — nothing is written.
//   * cols <= 0 falls through `cmpl $0x2 / jl` @0x3a7278 into the tail's guard
//     `cmpl %ecx,%r11d / jge 0x3a7260` @0x3a7466 with r11d = 0, so 0 >= cols is taken and the row
//     advances without a single store. The rows still iterate.
//   * the function always returns 0 (`xorl %eax,%eax` @0x3a75f7) on every path.

/** Scratch used only to reinterpret one f32 as its bit pattern and back — the machine's
 *  `vandps`/`vorps`/`vpslld`/`vpsrld` operate on the bits of the same register file, and JS has
 *  no other way to express that. Not an FCP function; pure plumbing. Mirrors the helper in the
 *  landed siblings raw-port/src/render/HgcBT2100_PQ_OOTF.ts and
 *  Gettype1_half_unpremultTile_AVX.ts. */
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
 * downstream then shifts like any other bit pattern; the `vmaxps` against slot 16 (-127) bounds
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
  /** +0x00 — x0 (int32). Read @0x3a7236 as the subtrahend of the width. */
  x0: number;
  /** +0x04 — y0 (int32). Read @0x3a7223 as the subtrahend of the height. */
  y0: number;
  /** +0x08 — x1 (int32). Read @0x3a7233. */
  x1: number;
  /** +0x0c — y1 (int32). Read @0x3a7220. */
  y1: number;
  /** +0x10 — destination plane (RGBA f32, row-major). Read @0x3a723c. */
  outPtr: Float32Array;
  /** +0x18 — destination row stride in TEXELS (int32, sign-extended @0x3a7238, <<4 @0x3a7248). */
  outRowStride: number;
  /** +0x50 — source plane (RGBA f32, row-major). Read @0x3a7240. */
  inPtr: Float32Array;
  /** +0x58 — source row stride in TEXELS (int32, sign-extended @0x3a7244, <<4 @0x3a724c). */
  inRowStride: number;
}

// ── Parameter-bank offsets this kernel reads (all relative to `this+0x198`) ──────────────────
// Scalars are `vbroadcastss` (one f32 splatted to every lane); vectors are 32-byte (`ymm`) or
// 16-byte (`xmm`) loads whose lanes are read individually — so this port indexes each lane rather
// than assuming a slot is lane-uniform, which here is load-bearing: slot 1's lane 3 is -Inf where
// its other three lanes are 0, and lane 3 is exactly the alpha lane.
/** +0x00 (scalar, slot 0 .x) — the pre-pow scale applied to the clamped texel @0x3a72aa. */
const S_PRE_SCALE = 0x00;
/** +0x04 (scalar, slot 0 .y) — the pow exponent @0x3a72b7 / @0x3a74a0. */
const S_EXPONENT = 0x04;
/** +0x08 (scalar, slot 0 .z) — the post-pow output scale @0x3a7430 / @0x3a75d5. */
const S_POST_SCALE = 0x08;
/** +0x20 (vector, slot 1) — the clamp floor (0,0,0,-Inf), and the value the exponent is
 *  equality-tested against @0x3a72c3. */
const V_FLOOR = 0x20;
/** +0x40 (vector, slot 2) — the "one": OR'd into the mantissa, subtracted from it, the exp2
 *  constant term, and the value substituted when the exponent equals the floor. */
const V_ONE = 0x40;
/** +0x60 (vector, slot 3) — mantissa (+sign) mask, 0x807fffff. */
const V_MANTISSA_MASK = 0x60;
/** +0x80 (vector, slot 4) — the denormal cutoff, +FLT_MIN. */
const V_LOG_CUTOFF = 0x80;
/** +0xa0 (vector, slot 5) — +Inf, subtracted from the exponent below the cutoff (log2(0)=-Inf). */
const V_LOG_CUTOFF_ADJ = 0xa0;
/** +0xc0 (vector, slot 6) — the 127 exponent bias, subtracted. */
const V_EXP_BIAS = 0xc0;
/** +0xe0 (vector, slot 7) — the mantissa split point, sqrt(2). */
const V_MANTISSA_SPLIT = 0xe0;
/** +0x100 (vector, slot 8) — 0.5, the factor applied to the split correction. */
const V_SPLIT_SCALE = 0x100;
/** +0x120..+0x1e0 (vectors, slots 9..15) — log2 mantissa polynomial coefficients. */
const V_LOG_C0 = 0x120;
const V_LOG_C1 = 0x140;
const V_LOG_C2 = 0x160;
const V_LOG_C3 = 0x180;
const V_LOG_C4 = 0x1a0;
const V_LOG_C5 = 0x1c0;
const V_LOG_C6 = 0x1e0;
/** +0x200 (vector, slot 16) — -127, the lower clamp on the exp2 input. */
const V_EXP_FLOOR = 0x200;
/** +0x220..+0x2a0 (vectors, slots 17..21) — exp2 fractional polynomial coefficients. */
const V_EXP_C0 = 0x220;
const V_EXP_C1 = 0x240;
const V_EXP_C2 = 0x260;
const V_EXP_C3 = 0x280;
const V_EXP_C4 = 0x2a0;
/** +0x2c0 (xmm, slot 22, INTEGER) — the 127 bias added to the exp2 integer part before <<23. */
const V_EXP2_BIAS_I = 0x2c0;

/**
 * `HgcBT2100_PQ_OOTF_qtApprox` — the `qtApprox` BT.2100 PQ OOTF render node (FCP's own name for
 * the cheaper QuickTime transfer-function path)
 * (Helium, vtable installed ptr @0x3a7aa6's rip target).
 *
 * Only `RenderTile_AVX` @0x3a7220 is ported in this file; the class's other symbols (ctor
 * @0x3a7a90, dtors @0x3a7d30/0x3a7d80, GetProgram @0x3a6ed0, InitProgramDescriptor @0x3a6f00,
 * shaderDescription @0x3a7120, BindTexture @0x3a7170, Bind @0x3a71e0, RenderTile @0x3a7600,
 * GetDOD @0x3a7a50, GetROI @0x3a7a70, …) are separate port units and are deliberately absent
 * rather than stubbed — this kernel is a leaf and calls none of them.
 */
export class HgcBT2100_PQ_OOTF_qtApprox {
  /**
   * +0x198 — a byte view of the 32-byte-aligned parameter bank (see PARAMETER BANK in the file
   * header). Populated by the ctor @0x3a7a90, which is not ported yet; the field is declared here
   * because `RenderTile_AVX` reloads it @0x3a7297 / @0x3a747c on every iteration and reads every
   * constant out of it.
   */
  public params!: DataView;

  /**
   * HgcBT2100_PQ_OOTF_qtApprox::RenderTile_AVX(HGTile*) — Helium @0x00000000003a7220.
   *
   * @param tile the tile descriptor (%rsi; `this` is %rdi)
   * @returns 0 — `xorl %eax,%eax` @0x3a75f7 on every path
   */
  public RenderTile_AVX(tile: HGTile): number {
    const params = this.params;
    /** Read lane `l` of the bank vector at `off` (little-endian f32). */
    const kv = (off: number, l: number): number => params.getFloat32(off + 4 * l, true);
    /** Read the bank scalar at `off` — the `vbroadcastss` source. */
    const ks = (off: number): number => params.getFloat32(off, true);
    /** Read lane `l` of the bank vector at `off` as raw i32 (the `vpaddd` operand). */
    const ki = (off: number, l: number): number => params.getInt32(off + 4 * l, true);

    // @0x3a7220/@0x3a7223: eax = tile[+0x0c] - tile[+0x04]
    const rows = (tile.y1 - tile.y0) | 0;
    // @0x3a7226: jle 0x3a75f4 — returns 0 before the frame is even built.
    if (rows <= 0) return 0;

    // @0x3a7233/@0x3a7236: ecx = tile[+0x08] - tile[+0x00]
    const cols = (tile.x1 - tile.x0) | 0;
    // @0x3a7238/@0x3a7248: rdx = (int32)tile[+0x18] << 4 (bytes) == 4 float32 == 1 texel per unit
    const outRowStride = (tile.outRowStride | 0) * 4;
    // @0x3a7244/@0x3a724c: rsi = (int32)tile[+0x58] << 4
    const inRowStride = (tile.inRowStride | 0) * 4;
    // @0x3a723c: r8 = tile[+0x10];  @0x3a7240: r9 = tile[+0x50]
    const outArr = tile.outPtr;
    const inArr = tile.inPtr;
    let outBase = 0; // r8, advanced by rdx per row @0x3a7263
    let inBase = 0; // r9, advanced by rsi per row @0x3a7260

    // Register file. The 4-wide tail uses lanes 0..3 of the same arrays, exactly as an xmm
    // register is the low half of its ymm. There is no stack frame to model: this kernel spills
    // nothing (no `subq %rsp` at all).
    const ymm0 = new Float32Array(8);
    const ymm1 = new Float32Array(8);
    const ymm2 = new Float32Array(8);
    const ymm3 = new Float32Array(8);
    const ymm4 = new Float32Array(8);
    const ymm5 = new Float32Array(8);
    const ymm6 = new Float32Array(8);
    const ymm7 = new Float32Array(8);
    const ymm8 = new Float32Array(8);
    // A comparison writes all-ones / all-zero into the SAME register file; these hold that bit
    // mask for the instructions where the register is read as a mask.
    const mk3 = new Uint32Array(8);
    const mk5 = new Uint32Array(8);
    const mk6 = new Uint32Array(8);
    // Integer lanes for the exponent shuffling (vpsrld/vpaddd/vpslld are i32 lane ops).
    const iA = new Int32Array(8);
    const iB = new Int32Array(8);

    // @0x3a7250: r10d = 0. @0x3a7266..@0x3a726c: `incl %r10d ; cmpl %eax,%r10d ; je 0x3a75f0`.
    for (let row = 0; row < rows; row++) {
      // @0x3a7272: movl $0x0, %r11d — the count of texels the 8-wide body consumed.
      let r11 = 0;

      // @0x3a7278/@0x3a727b: `cmpl $0x2,%ecx ; jl 0x3a7466` — narrower than 2 texels: tail only.
      if (cols >= 2) {
        // @0x3a7281: ebx = 0x10; every load is at -0x10(reg,%rbx), i.e. byte offset 32*k.
        let k = 0;
        for (;;) {
          const p = inBase + 8 * k; // -0x10(%r9,%rbx) in float32 units
          const q = outBase + 8 * k; // -0x10(%r8,%rbx)

          // @0x3a7290: vmovups -0x10(%r9,%rbx),%ymm0 — two RGBA texels
          for (let l = 0; l < 8; l++) ymm0[l] = inArr[p + l] as number;
          // @0x3a7297: movq 0x198(%rdi),%r14 — the parameter bank (reloaded every iteration)
          // @0x3a729e: vmovups 0x20(%r14),%ymm3 — the clamp floor
          for (let l = 0; l < 8; l++) ymm3[l] = kv(V_FLOOR, l);
          // @0x3a72a4: vmovups 0x40(%r14),%ymm1
          for (let l = 0; l < 8; l++) ymm1[l] = kv(V_ONE, l);
          // @0x3a72aa: vbroadcastss (%r14),%ymm2
          for (let l = 0; l < 8; l++) ymm2[l] = ks(S_PRE_SCALE);
          // @0x3a72af: vmaxps %ymm3,%ymm0,%ymm0 — c = max(texel, floor). CLOBBERS the source: from
          //   here on the "original" the alpha lane is restored from is the CLAMPED value, and on
          //   a NaN alpha MAXPS returns its second operand, i.e. -Inf.
          for (let l = 0; l < 8; l++) ymm0[l] = maxps(ymm0[l] as number, ymm3[l] as number);
          // @0x3a72b3: vmulps %ymm2,%ymm0,%ymm4
          for (let l = 0; l < 8; l++) ymm4[l] = Math.fround((ymm0[l] as number) * (ymm2[l] as number));
          // @0x3a72b7: vbroadcastss 0x4(%r14),%ymm2 — the exponent
          for (let l = 0; l < 8; l++) ymm2[l] = ks(S_EXPONENT);
          // @0x3a72bd: vblendps $0x88,%ymm0,%ymm4,%ymm4 — lanes 3 and 7 (alpha) from the clamp
          ymm4[3] = ymm0[3] as number;
          ymm4[7] = ymm0[7] as number;
          // @0x3a72c3: vcmpeqps %ymm3,%ymm2,%ymm5 — (exponent == floor)
          for (let l = 0; l < 8; l++) mk5[l] = cmpeqps(ymm2[l] as number, ymm3[l] as number);
          // @0x3a72c8: vandps %ymm1,%ymm5,%ymm5
          for (let l = 0; l < 8; l++) {
            ymm5[l] = floatOf((mk5[l] as number) & bitsOf(ymm1[l] as number));
          }
          // @0x3a72cc: vcmpltps %ymm5,%ymm3,%ymm3 — (floor < that); the floor is dead after this
          for (let l = 0; l < 8; l++) mk3[l] = cmpltps(ymm3[l] as number, ymm5[l] as number);
          // @0x3a72d1: vblendvps %ymm3,%ymm1,%ymm4,%ymm3 — t = mask ? one : the scaled texel
          for (let l = 0; l < 8; l++) {
            ymm3[l] = ((mk3[l] as number) & 0x80000000) !== 0 ? (ymm1[l] as number) : (ymm4[l] as number);
          }

          // ── log2(t) ─────────────────────────────────────────────────────────────────────
          // @0x3a72d7: vandps 0x60(%r14),%ymm3,%ymm4 — mantissa bits
          for (let l = 0; l < 8; l++) {
            ymm4[l] = floatOf(bitsOf(ymm3[l] as number) & bitsOf(kv(V_MANTISSA_MASK, l)));
          }
          // @0x3a72dd: vmovups 0xe0(%r14),%ymm5 — sqrt(2)
          for (let l = 0; l < 8; l++) ymm5[l] = kv(V_MANTISSA_SPLIT, l);
          // @0x3a72e6: vorps %ymm1,%ymm4,%ymm4 — m in [1,2)
          for (let l = 0; l < 8; l++) {
            ymm4[l] = floatOf(bitsOf(ymm4[l] as number) | bitsOf(ymm1[l] as number));
          }
          // @0x3a72ea: vcmpltps 0x80(%r14),%ymm3,%ymm6 — t < FLT_MIN ?
          for (let l = 0; l < 8; l++) mk6[l] = cmpltps(ymm3[l] as number, kv(V_LOG_CUTOFF, l));
          // @0x3a72f4: vandps 0xa0(%r14),%ymm6,%ymm6 — the +Inf correction
          for (let l = 0; l < 8; l++) {
            ymm6[l] = floatOf((mk6[l] as number) & bitsOf(kv(V_LOG_CUTOFF_ADJ, l)));
          }
          // @0x3a72fd..@0x3a730d: vpsrld $0x17 on each 128-bit half of %ymm3, recombined
          for (let l = 0; l < 8; l++) iA[l] = bitsOf(ymm3[l] as number) >>> 23;
          // @0x3a7313: vcvtdq2ps %ymm3,%ymm3
          for (let l = 0; l < 8; l++) ymm3[l] = Math.fround(iA[l] as number);
          // @0x3a7317: vsubps %ymm6,%ymm3,%ymm3
          for (let l = 0; l < 8; l++) ymm3[l] = Math.fround((ymm3[l] as number) - (ymm6[l] as number));
          // @0x3a731b: vsubps 0xc0(%r14),%ymm3,%ymm3 — remove the 127 exponent bias
          for (let l = 0; l < 8; l++) {
            ymm3[l] = Math.fround((ymm3[l] as number) - kv(V_EXP_BIAS, l));
          }
          // @0x3a7324: vcmpltps %ymm4,%ymm5,%ymm5 — (sqrt2 < m)
          for (let l = 0; l < 8; l++) mk5[l] = cmpltps(ymm5[l] as number, ymm4[l] as number);
          // @0x3a7329: vandps %ymm1,%ymm5,%ymm5 — the correction is `one` where the mask is set
          for (let l = 0; l < 8; l++) {
            ymm5[l] = floatOf((mk5[l] as number) & bitsOf(ymm1[l] as number));
          }
          // @0x3a732d: vaddps %ymm3,%ymm5,%ymm3 — exponent += correction
          for (let l = 0; l < 8; l++) ymm3[l] = Math.fround((ymm5[l] as number) + (ymm3[l] as number));
          // @0x3a7331: vmulps 0x100(%r14),%ymm5,%ymm5 — 0.5 · correction
          for (let l = 0; l < 8; l++) {
            ymm5[l] = Math.fround((ymm5[l] as number) * kv(V_SPLIT_SCALE, l));
          }
          // @0x3a733a: vmulps %ymm4,%ymm5,%ymm5
          for (let l = 0; l < 8; l++) ymm5[l] = Math.fround((ymm5[l] as number) * (ymm4[l] as number));
          // @0x3a733e: vsubps %ymm1,%ymm4,%ymm4 — m - 1
          for (let l = 0; l < 8; l++) ymm4[l] = Math.fround((ymm4[l] as number) - (ymm1[l] as number));
          // @0x3a7342: vsubps %ymm5,%ymm4,%ymm4 — x, the polynomial argument
          for (let l = 0; l < 8; l++) ymm4[l] = Math.fround((ymm4[l] as number) - (ymm5[l] as number));
          // @0x3a7346: vmulps 0x120(%r14),%ymm4,%ymm5
          for (let l = 0; l < 8; l++) ymm5[l] = Math.fround((ymm4[l] as number) * kv(V_LOG_C0, l));
          // @0x3a734f: vaddps 0x140(%r14),%ymm5,%ymm5
          for (let l = 0; l < 8; l++) ymm5[l] = Math.fround((ymm5[l] as number) + kv(V_LOG_C1, l));
          // @0x3a7358: vmulps 0x160(%r14),%ymm4,%ymm6
          for (let l = 0; l < 8; l++) ymm6[l] = Math.fround((ymm4[l] as number) * kv(V_LOG_C2, l));
          // @0x3a7361: vaddps 0x180(%r14),%ymm6,%ymm6
          for (let l = 0; l < 8; l++) ymm6[l] = Math.fround((ymm6[l] as number) + kv(V_LOG_C3, l));
          // @0x3a736a: vmulps 0x1a0(%r14),%ymm4,%ymm7
          for (let l = 0; l < 8; l++) ymm7[l] = Math.fround((ymm4[l] as number) * kv(V_LOG_C4, l));
          // @0x3a7373: vmulps %ymm4,%ymm4,%ymm8 — x²
          for (let l = 0; l < 8; l++) ymm8[l] = Math.fround((ymm4[l] as number) * (ymm4[l] as number));
          // @0x3a7377: vaddps 0x1c0(%r14),%ymm7,%ymm7
          for (let l = 0; l < 8; l++) ymm7[l] = Math.fround((ymm7[l] as number) + kv(V_LOG_C5, l));
          // @0x3a7380: vmulps %ymm6,%ymm8,%ymm6
          for (let l = 0; l < 8; l++) ymm6[l] = Math.fround((ymm8[l] as number) * (ymm6[l] as number));
          // @0x3a7384: vaddps %ymm6,%ymm5,%ymm5
          for (let l = 0; l < 8; l++) ymm5[l] = Math.fround((ymm5[l] as number) + (ymm6[l] as number));
          // @0x3a7388: vmulps %ymm5,%ymm8,%ymm5
          for (let l = 0; l < 8; l++) ymm5[l] = Math.fround((ymm8[l] as number) * (ymm5[l] as number));
          // @0x3a738c: vaddps %ymm5,%ymm7,%ymm5
          for (let l = 0; l < 8; l++) ymm5[l] = Math.fround((ymm7[l] as number) + (ymm5[l] as number));
          // @0x3a7390: vmulps %ymm5,%ymm4,%ymm5
          for (let l = 0; l < 8; l++) ymm5[l] = Math.fround((ymm4[l] as number) * (ymm5[l] as number));
          // @0x3a7394: vaddps 0x1e0(%r14),%ymm5,%ymm5
          for (let l = 0; l < 8; l++) ymm5[l] = Math.fround((ymm5[l] as number) + kv(V_LOG_C6, l));
          // @0x3a739d: vmulps %ymm5,%ymm4,%ymm4
          for (let l = 0; l < 8; l++) ymm4[l] = Math.fround((ymm4[l] as number) * (ymm5[l] as number));
          // @0x3a73a1: vaddps %ymm4,%ymm3,%ymm3 — log2(t) = exponent + poly(x)
          for (let l = 0; l < 8; l++) ymm3[l] = Math.fround((ymm3[l] as number) + (ymm4[l] as number));

          // ── exp2(exponent · log2(t)) ────────────────────────────────────────────────────
          // @0x3a73a5: vmulps %ymm3,%ymm2,%ymm2
          for (let l = 0; l < 8; l++) ymm2[l] = Math.fround((ymm2[l] as number) * (ymm3[l] as number));
          // @0x3a73a9: vmaxps 0x200(%r14),%ymm2,%ymm2 — clamp the exp2 input from below at -127
          for (let l = 0; l < 8; l++) ymm2[l] = maxps(ymm2[l] as number, kv(V_EXP_FLOOR, l));
          // @0x3a73b2: vroundps $0x9,%ymm2,%ymm3 — floor
          for (let l = 0; l < 8; l++) ymm3[l] = roundps_floor(ymm2[l] as number);
          // @0x3a73b8: vsubps %ymm3,%ymm2,%ymm2 — the fractional part
          for (let l = 0; l < 8; l++) ymm2[l] = Math.fround((ymm2[l] as number) - (ymm3[l] as number));
          // @0x3a73bc: vmulps %ymm2,%ymm2,%ymm4 — f²
          for (let l = 0; l < 8; l++) ymm4[l] = Math.fround((ymm2[l] as number) * (ymm2[l] as number));
          // @0x3a73c0: vmulps 0x220(%r14),%ymm2,%ymm5
          for (let l = 0; l < 8; l++) ymm5[l] = Math.fround((ymm2[l] as number) * kv(V_EXP_C0, l));
          // @0x3a73c9: vaddps 0x240(%r14),%ymm5,%ymm5
          for (let l = 0; l < 8; l++) ymm5[l] = Math.fround((ymm5[l] as number) + kv(V_EXP_C1, l));
          // @0x3a73d2: vmulps 0x260(%r14),%ymm2,%ymm6
          for (let l = 0; l < 8; l++) ymm6[l] = Math.fround((ymm2[l] as number) * kv(V_EXP_C2, l));
          // @0x3a73db: vmulps %ymm5,%ymm4,%ymm4
          for (let l = 0; l < 8; l++) ymm4[l] = Math.fround((ymm4[l] as number) * (ymm5[l] as number));
          // @0x3a73df: vaddps 0x280(%r14),%ymm6,%ymm5
          for (let l = 0; l < 8; l++) ymm5[l] = Math.fround((ymm6[l] as number) + kv(V_EXP_C3, l));
          // @0x3a73e8: vaddps %ymm5,%ymm4,%ymm4
          for (let l = 0; l < 8; l++) ymm4[l] = Math.fround((ymm4[l] as number) + (ymm5[l] as number));
          // @0x3a73ec: vmulps %ymm4,%ymm2,%ymm4
          for (let l = 0; l < 8; l++) ymm4[l] = Math.fround((ymm2[l] as number) * (ymm4[l] as number));
          // @0x3a73f0: vaddps 0x2a0(%r14),%ymm4,%ymm4
          for (let l = 0; l < 8; l++) ymm4[l] = Math.fround((ymm4[l] as number) + kv(V_EXP_C4, l));
          // @0x3a73f9: vmulps %ymm4,%ymm2,%ymm2
          for (let l = 0; l < 8; l++) ymm2[l] = Math.fround((ymm2[l] as number) * (ymm4[l] as number));
          // @0x3a73fd: vaddps %ymm2,%ymm1,%ymm1 — poly + one (the "one" is dead after this)
          for (let l = 0; l < 8; l++) ymm1[l] = Math.fround((ymm1[l] as number) + (ymm2[l] as number));
          // @0x3a7401: vcvttps2dq %ymm3,%ymm2 — the integer part
          for (let l = 0; l < 8; l++) iA[l] = cvttps2dq(ymm3[l] as number);
          // @0x3a7405: vmovdqa 0x2c0(%r14),%xmm3 — the i32 bias, ONE 16-byte lane group
          for (let l = 0; l < 4; l++) iB[l] = ki(V_EXP2_BIAS_I, l);
          // @0x3a740e/@0x3a7412/@0x3a7418: vpaddd on each half with the SAME xmm3 bias
          for (let l = 0; l < 8; l++) iA[l] = ((iB[l & 3] as number) + (iA[l] as number)) | 0;
          // @0x3a741c/@0x3a7421/@0x3a7426: vpslld $0x17 on each half, recombined
          for (let l = 0; l < 8; l++) ymm2[l] = floatOf(((iA[l] as number) << 23) >>> 0);
          // @0x3a742c: vmulps %ymm2,%ymm1,%ymm1 — · 2^int
          for (let l = 0; l < 8; l++) ymm1[l] = Math.fround((ymm1[l] as number) * (ymm2[l] as number));
          // @0x3a7430: vbroadcastss 0x8(%r14),%ymm2 — the output scale
          for (let l = 0; l < 8; l++) ymm2[l] = ks(S_POST_SCALE);
          // @0x3a7436: vmulps %ymm1,%ymm2,%ymm1
          for (let l = 0; l < 8; l++) ymm1[l] = Math.fround((ymm2[l] as number) * (ymm1[l] as number));
          // @0x3a743a: vblendps $0x88,%ymm0,%ymm1,%ymm0 — lanes 3 and 7 from the CLAMPED source
          for (let l = 0; l < 8; l++) {
            if (l !== 3 && l !== 7) ymm0[l] = ymm1[l] as number;
          }
          // @0x3a7440: vmovups %ymm0,-0x10(%r8,%rbx)
          for (let l = 0; l < 8; l++) outArr[q + l] = ymm0[l] as number;

          // @0x3a7447: addq $0x20,%rbx
          k++;
          // @0x3a744b/@0x3a7452/@0x3a7455: r14d = r11d + ecx - 2 (r11d BEFORE the decrement)
          const r14 = (((r11 + cols) | 0) - 2) | 0;
          // @0x3a744e: addl $-0x2,%r11d
          r11 = (r11 - 2) | 0;
          // @0x3a7459/@0x3a745d: cmpl $0x1,%r14d ; jg 0x3a7290
          if (!(r14 > 1)) break;
        }
        // @0x3a7463: negl %r11d — r11d is now the count of texels the body consumed
        r11 = -r11 | 0;
      }

      // @0x3a7466/@0x3a7469: cmpl %ecx,%r11d ; jge 0x3a7260 — no odd texel; next row.
      // This is also the `cols <= 0` exit: r11d is 0 there and 0 >= cols, so the row writes
      // nothing at all.
      if (r11 < cols) {
        // @0x3a746f/@0x3a7472: movl %r11d,%r11d ; shlq $0x4,%r11 — byte offset of the texel
        const p = inBase + 4 * r11;
        const q = outBase + 4 * r11;

        // ── 4-wide tail: exactly ONE texel, then `jmp 0x3a7260` (the row advance) ─────────
        // Same computation as the 8-wide body, separately register-allocated; `vcmpnleps` where
        // the body uses `vcmpltps` (they differ on NaN), `vmovaps` bank loads, x² hoisted earlier,
        // the exp2 multiplies issued in a different order, and the exponent bias added straight
        // from memory instead of through a register.
        // @0x3a7476: vmovaps (%r9,%r11),%xmm0
        for (let l = 0; l < 4; l++) ymm0[l] = inArr[p + l] as number;
        // @0x3a747c: movq 0x198(%rdi),%rbx — the parameter bank again
        // @0x3a7483: vmovaps 0x20(%rbx),%xmm3 ; @0x3a7488: vmovaps 0x40(%rbx),%xmm1
        for (let l = 0; l < 4; l++) ymm3[l] = kv(V_FLOOR, l);
        for (let l = 0; l < 4; l++) ymm1[l] = kv(V_ONE, l);
        // @0x3a748d: vmaxps %xmm3,%xmm0,%xmm0 — c = max(texel, floor)
        for (let l = 0; l < 4; l++) ymm0[l] = maxps(ymm0[l] as number, ymm3[l] as number);
        // @0x3a7491: vbroadcastss (%rbx),%xmm2 ; @0x3a7496: vmulps %xmm2,%xmm0,%xmm2
        for (let l = 0; l < 4; l++) ymm2[l] = ks(S_PRE_SCALE);
        for (let l = 0; l < 4; l++) ymm2[l] = Math.fround((ymm0[l] as number) * (ymm2[l] as number));
        // @0x3a749a: vblendps $0x8,%xmm0,%xmm2,%xmm4 — lane 3 (alpha) from the clamp
        for (let l = 0; l < 4; l++) ymm4[l] = ymm2[l] as number;
        ymm4[3] = ymm0[3] as number;
        // @0x3a74a0: vbroadcastss 0x4(%rbx),%xmm2 — the exponent
        for (let l = 0; l < 4; l++) ymm2[l] = ks(S_EXPONENT);
        // @0x3a74a6: vcmpeqps %xmm3,%xmm2,%xmm5 — (exponent == floor)
        for (let l = 0; l < 4; l++) mk5[l] = cmpeqps(ymm2[l] as number, ymm3[l] as number);
        // @0x3a74ab: vandps %xmm1,%xmm5,%xmm5
        for (let l = 0; l < 4; l++) {
          ymm5[l] = floatOf((mk5[l] as number) & bitsOf(ymm1[l] as number));
        }
        // @0x3a74af: vcmpnleps %xmm3,%xmm5,%xmm3 — NOT(that <= floor)
        for (let l = 0; l < 4; l++) mk3[l] = cmpnleps(ymm5[l] as number, ymm3[l] as number);
        // @0x3a74b4: vblendvps %xmm3,%xmm1,%xmm4,%xmm3 — t = mask ? one : the scaled texel
        for (let l = 0; l < 4; l++) {
          ymm3[l] = ((mk3[l] as number) & 0x80000000) !== 0 ? (ymm1[l] as number) : (ymm4[l] as number);
        }
        // @0x3a74ba: vandps 0x60(%rbx),%xmm3,%xmm4 ; @0x3a74bf: vmovaps 0xe0(%rbx),%xmm5
        for (let l = 0; l < 4; l++) {
          ymm4[l] = floatOf(bitsOf(ymm3[l] as number) & bitsOf(kv(V_MANTISSA_MASK, l)));
        }
        for (let l = 0; l < 4; l++) ymm5[l] = kv(V_MANTISSA_SPLIT, l);
        // @0x3a74c7: vorps %xmm1,%xmm4,%xmm4 — m in [1,2)
        for (let l = 0; l < 4; l++) {
          ymm4[l] = floatOf(bitsOf(ymm4[l] as number) | bitsOf(ymm1[l] as number));
        }
        // @0x3a74cb: vcmpltps 0x80(%rbx),%xmm3,%xmm6 ; @0x3a74d4: vandps 0xa0(%rbx),%xmm6,%xmm6
        for (let l = 0; l < 4; l++) mk6[l] = cmpltps(ymm3[l] as number, kv(V_LOG_CUTOFF, l));
        for (let l = 0; l < 4; l++) {
          ymm6[l] = floatOf((mk6[l] as number) & bitsOf(kv(V_LOG_CUTOFF_ADJ, l)));
        }
        // @0x3a74dc: vpsrld $0x17,%xmm3,%xmm3 ; @0x3a74e1: vcvtdq2ps %xmm3,%xmm3
        for (let l = 0; l < 4; l++) iA[l] = bitsOf(ymm3[l] as number) >>> 23;
        for (let l = 0; l < 4; l++) ymm3[l] = Math.fround(iA[l] as number);
        // @0x3a74e5: vsubps %xmm6,%xmm3,%xmm3 ; @0x3a74e9: vsubps 0xc0(%rbx),%xmm3,%xmm3
        for (let l = 0; l < 4; l++) ymm3[l] = Math.fround((ymm3[l] as number) - (ymm6[l] as number));
        for (let l = 0; l < 4; l++) ymm3[l] = Math.fround((ymm3[l] as number) - kv(V_EXP_BIAS, l));
        // @0x3a74f1: vcmpltps %xmm4,%xmm5,%xmm5 ; @0x3a74f6: vandps %xmm1,%xmm5,%xmm5
        for (let l = 0; l < 4; l++) mk5[l] = cmpltps(ymm5[l] as number, ymm4[l] as number);
        for (let l = 0; l < 4; l++) {
          ymm5[l] = floatOf((mk5[l] as number) & bitsOf(ymm1[l] as number));
        }
        // @0x3a74fa: vaddps %xmm5,%xmm3,%xmm3 — exponent += correction (operands the other way
        //   round from @0x3a732d; IEEE addition is commutative for these values)
        for (let l = 0; l < 4; l++) ymm3[l] = Math.fround((ymm3[l] as number) + (ymm5[l] as number));
        // @0x3a74fe: vmulps 0x100(%rbx),%xmm5,%xmm5 ; @0x3a7506: vmulps %xmm4,%xmm5,%xmm5
        for (let l = 0; l < 4; l++) ymm5[l] = Math.fround((ymm5[l] as number) * kv(V_SPLIT_SCALE, l));
        for (let l = 0; l < 4; l++) ymm5[l] = Math.fround((ymm5[l] as number) * (ymm4[l] as number));
        // @0x3a750a: vsubps %xmm1,%xmm4,%xmm4 ; @0x3a750e: vsubps %xmm5,%xmm4,%xmm4 — x
        for (let l = 0; l < 4; l++) ymm4[l] = Math.fround((ymm4[l] as number) - (ymm1[l] as number));
        for (let l = 0; l < 4; l++) ymm4[l] = Math.fround((ymm4[l] as number) - (ymm5[l] as number));
        // @0x3a7512: vmulps %xmm4,%xmm4,%xmm5 — x², hoisted ahead of the coefficients here
        for (let l = 0; l < 4; l++) ymm5[l] = Math.fround((ymm4[l] as number) * (ymm4[l] as number));
        // @0x3a7516: vmulps 0x120(%rbx),%xmm4,%xmm6 ; @0x3a751e: vaddps 0x140(%rbx),%xmm6,%xmm6
        for (let l = 0; l < 4; l++) ymm6[l] = Math.fround((ymm4[l] as number) * kv(V_LOG_C0, l));
        for (let l = 0; l < 4; l++) ymm6[l] = Math.fround((ymm6[l] as number) + kv(V_LOG_C1, l));
        // @0x3a7526: vmulps 0x160(%rbx),%xmm4,%xmm7 ; @0x3a752e: vaddps 0x180(%rbx),%xmm7,%xmm7
        for (let l = 0; l < 4; l++) ymm7[l] = Math.fround((ymm4[l] as number) * kv(V_LOG_C2, l));
        for (let l = 0; l < 4; l++) ymm7[l] = Math.fround((ymm7[l] as number) + kv(V_LOG_C3, l));
        // @0x3a7536: vmulps 0x1a0(%rbx),%xmm4,%xmm8 ; @0x3a753e: vaddps 0x1c0(%rbx),%xmm8,%xmm8
        for (let l = 0; l < 4; l++) ymm8[l] = Math.fround((ymm4[l] as number) * kv(V_LOG_C4, l));
        for (let l = 0; l < 4; l++) ymm8[l] = Math.fround((ymm8[l] as number) + kv(V_LOG_C5, l));
        // @0x3a7546: vmulps %xmm7,%xmm5,%xmm7 ; @0x3a754a: vaddps %xmm7,%xmm6,%xmm6
        for (let l = 0; l < 4; l++) ymm7[l] = Math.fround((ymm5[l] as number) * (ymm7[l] as number));
        for (let l = 0; l < 4; l++) ymm6[l] = Math.fround((ymm6[l] as number) + (ymm7[l] as number));
        // @0x3a754e: vmulps %xmm6,%xmm5,%xmm5 ; @0x3a7552: vaddps %xmm5,%xmm8,%xmm5
        for (let l = 0; l < 4; l++) ymm5[l] = Math.fround((ymm5[l] as number) * (ymm6[l] as number));
        for (let l = 0; l < 4; l++) ymm5[l] = Math.fround((ymm8[l] as number) + (ymm5[l] as number));
        // @0x3a7556: vmulps %xmm5,%xmm4,%xmm5 ; @0x3a755a: vaddps 0x1e0(%rbx),%xmm5,%xmm5
        for (let l = 0; l < 4; l++) ymm5[l] = Math.fround((ymm4[l] as number) * (ymm5[l] as number));
        for (let l = 0; l < 4; l++) ymm5[l] = Math.fround((ymm5[l] as number) + kv(V_LOG_C6, l));
        // @0x3a7562: vmulps %xmm5,%xmm4,%xmm4 ; @0x3a7566: vaddps %xmm4,%xmm3,%xmm3 — log2(t)
        for (let l = 0; l < 4; l++) ymm4[l] = Math.fround((ymm4[l] as number) * (ymm5[l] as number));
        for (let l = 0; l < 4; l++) ymm3[l] = Math.fround((ymm3[l] as number) + (ymm4[l] as number));
        // @0x3a756a: vmulps %xmm3,%xmm2,%xmm2 — · the exponent
        for (let l = 0; l < 4; l++) ymm2[l] = Math.fround((ymm2[l] as number) * (ymm3[l] as number));
        // @0x3a756e: vmaxps 0x200(%rbx),%xmm2,%xmm2
        for (let l = 0; l < 4; l++) ymm2[l] = maxps(ymm2[l] as number, kv(V_EXP_FLOOR, l));
        // @0x3a7576: vroundps $0x9,%xmm2,%xmm3 ; @0x3a757c: vsubps %xmm3,%xmm2,%xmm2
        for (let l = 0; l < 4; l++) ymm3[l] = roundps_floor(ymm2[l] as number);
        for (let l = 0; l < 4; l++) ymm2[l] = Math.fround((ymm2[l] as number) - (ymm3[l] as number));
        // @0x3a7580: vmulps 0x220(%rbx),%xmm2,%xmm4 ; @0x3a7588: vmulps %xmm2,%xmm2,%xmm5 — f²
        for (let l = 0; l < 4; l++) ymm4[l] = Math.fround((ymm2[l] as number) * kv(V_EXP_C0, l));
        for (let l = 0; l < 4; l++) ymm5[l] = Math.fround((ymm2[l] as number) * (ymm2[l] as number));
        // @0x3a758c: vaddps 0x240(%rbx),%xmm4,%xmm4 ; @0x3a7594: vmulps %xmm4,%xmm5,%xmm4
        for (let l = 0; l < 4; l++) ymm4[l] = Math.fround((ymm4[l] as number) + kv(V_EXP_C1, l));
        for (let l = 0; l < 4; l++) ymm4[l] = Math.fround((ymm5[l] as number) * (ymm4[l] as number));
        // @0x3a7598: vmulps 0x260(%rbx),%xmm2,%xmm5 ; @0x3a75a0: vaddps 0x280(%rbx),%xmm5,%xmm5
        for (let l = 0; l < 4; l++) ymm5[l] = Math.fround((ymm2[l] as number) * kv(V_EXP_C2, l));
        for (let l = 0; l < 4; l++) ymm5[l] = Math.fround((ymm5[l] as number) + kv(V_EXP_C3, l));
        // @0x3a75a8: vaddps %xmm5,%xmm4,%xmm4 ; @0x3a75ac: vmulps %xmm4,%xmm2,%xmm4
        for (let l = 0; l < 4; l++) ymm4[l] = Math.fround((ymm4[l] as number) + (ymm5[l] as number));
        for (let l = 0; l < 4; l++) ymm4[l] = Math.fround((ymm2[l] as number) * (ymm4[l] as number));
        // @0x3a75b0: vaddps 0x2a0(%rbx),%xmm4,%xmm4 ; @0x3a75b8: vmulps %xmm4,%xmm2,%xmm2
        for (let l = 0; l < 4; l++) ymm4[l] = Math.fround((ymm4[l] as number) + kv(V_EXP_C4, l));
        for (let l = 0; l < 4; l++) ymm2[l] = Math.fround((ymm2[l] as number) * (ymm4[l] as number));
        // @0x3a75bc: vaddps %xmm2,%xmm1,%xmm1 — poly + one
        for (let l = 0; l < 4; l++) ymm1[l] = Math.fround((ymm1[l] as number) + (ymm2[l] as number));
        // @0x3a75c0: vcvttps2dq %xmm3,%xmm2
        for (let l = 0; l < 4; l++) iA[l] = cvttps2dq(ymm3[l] as number);
        // @0x3a75c4: vpaddd 0x2c0(%rbx),%xmm2,%xmm2 — the bias straight out of the bank
        for (let l = 0; l < 4; l++) iA[l] = ((iA[l] as number) + ki(V_EXP2_BIAS_I, l)) | 0;
        // @0x3a75cc: vpslld $0x17,%xmm2,%xmm2
        for (let l = 0; l < 4; l++) ymm2[l] = floatOf(((iA[l] as number) << 23) >>> 0);
        // @0x3a75d1: vmulps %xmm2,%xmm1,%xmm1
        for (let l = 0; l < 4; l++) ymm1[l] = Math.fround((ymm1[l] as number) * (ymm2[l] as number));
        // @0x3a75d5: vbroadcastss 0x8(%rbx),%xmm2 ; @0x3a75db: vmulps %xmm1,%xmm2,%xmm1
        for (let l = 0; l < 4; l++) ymm2[l] = ks(S_POST_SCALE);
        for (let l = 0; l < 4; l++) ymm1[l] = Math.fround((ymm2[l] as number) * (ymm1[l] as number));
        // @0x3a75df: vblendps $0x8,%xmm0,%xmm1,%xmm0 — lane 3 from the CLAMPED source
        for (let l = 0; l < 3; l++) ymm0[l] = ymm1[l] as number;
        // @0x3a75e5: vmovaps %xmm0,(%r8,%r11)
        for (let l = 0; l < 4; l++) outArr[q + l] = ymm0[l] as number;
        // @0x3a75eb: jmp 0x3a7260 — the row advance; the tail never iterates.
      }

      // @0x3a7260/@0x3a7263: addq %rsi,%r9 ; addq %rdx,%r8
      inBase += inRowStride;
      outBase += outRowStride;
    }

    // @0x3a75f0..@0x3a75f9: popq %rbx ; popq %r14 ; popq %rbp ; vzeroupper ; xorl %eax,%eax ; retq
    return 0;
  }
}
