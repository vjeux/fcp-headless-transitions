// Getinv_quicktime_half_unpremultTile_AVX_driver.mts — the TS half of the differential for
// @Helium 0x29f830. Run by Getinv_quicktime_half_unpremultTile_AVX_oracle.py as
//   node --experimental-strip-types Getinv_quicktime_half_unpremultTile_AVX_driver.mts
// reading the case list as JSON on stdin and writing JSON on stdout.
//
// It imports the REAL port and calls it, rather than restating it — a restatement shares any
// misreading of the disassembly with the port itself and then agrees enthusiastically. Every float
// crosses the wire as a hex bit pattern in both directions, so signed zero and NaN payloads survive
// and the comparison is bit-exact.
//
// The four mutants run in THIS process on THE SAME cases, so their kill counts are apples-to-apples
// with the port's divergence count. Each is a specific, plausible misreading of the body, not
// noise: two of them are the exact traps the AT&T operand order and the sign-bit test set.
const portHref =
  process.env.GETINV_TS !== undefined
    ? new URL(`file://${process.env.GETINV_TS}`).href
    : new URL("../../src/render/Getinv_quicktime_half_unpremultTile_AVX.ts", import.meta.url).href;
const { Getinv_quicktime_half_unpremultTile_AVX } = (await import(portHref)) as {
  Getinv_quicktime_half_unpremultTile_AVX: (
    tile: unknown,
    state: DataView,
    node?: unknown,
  ) => void;
};

interface WireCase {
  w: number;
  h: number;
  srcStride: number;
  dstStride: number;
  state: string;   // hex, 8 chars per f32, little-endian words in order
  px: string[];    // hex bit patterns, source plane
  poison: string;  // hex bit pattern the destination is filled with first
}

const scratch = new DataView(new ArrayBuffer(4));
function fromBits(hex: string): number {
  scratch.setUint32(0, parseInt(hex, 16) >>> 0, true);
  return scratch.getFloat32(0, true);
}
function toBits(v: number): string {
  scratch.setFloat32(0, v, true);
  return scratch.getUint32(0, true).toString(16).padStart(8, "0");
}

function makeState(hex: string): DataView {
  const n = hex.length / 8;
  const dv = new DataView(new ArrayBuffer(n * 4));
  for (let i = 0; i < n; i++) dv.setUint32(i * 4, parseInt(hex.slice(i * 8, i * 8 + 8), 16) >>> 0, true);
  return dv;
}

function planes(c: WireCase, run: (tile: Record<string, unknown>, st: DataView) => void): string[] {
  const srcN = Math.max(c.srcStride, 1) * Math.max(c.h, 1) * 4;
  const dstN = Math.max(c.dstStride, 1) * Math.max(c.h, 1) * 4;
  const inPtr = new Float32Array(srcN);
  for (let i = 0; i < srcN && i < c.px.length; i++) inPtr[i] = fromBits(c.px[i]);
  const outPtr = new Float32Array(dstN);
  for (let i = 0; i < dstN; i++) outPtr[i] = fromBits(c.poison);
  run(
    {
      x0: 0, y0: 0, x1: c.w, y1: c.h,
      inPtr, outPtr, inRowStride: c.srcStride, outRowStride: c.dstStride,
    },
    makeState(c.state),
  );
  const out: string[] = [];
  for (let i = 0; i < dstN; i++) out.push(toBits(outPtr[i]));
  return out;
}

// ── the port ────────────────────────────────────────────────────────────────────────────────────
const port = (c: WireCase) =>
  planes(c, (tile, st) =>
    Getinv_quicktime_half_unpremultTile_AVX(tile as never, st, null));

// ── mutants ─────────────────────────────────────────────────────────────────────────────────────
// Re-implementations of the 8-wide/4-wide bodies with ONE deliberate defect each. They are written
// out rather than derived from the port so that a mutant cannot accidentally inherit a fix.
const sb = new DataView(new ArrayBuffer(4));
const bitsOf = (x: number) => { sb.setFloat32(0, x, true); return sb.getUint32(0, true); };
const floatOf = (b: number) => { sb.setUint32(0, b >>> 0, true); return sb.getFloat32(0, true); };
const F = Math.fround;

type Defect = {
  maxSwapped?: boolean;    // MAXPS operand order reversed (differs on equal and on NaN)
  minSwapped?: boolean;    // MINPS operand order reversed
  signAsCompare?: boolean; // sign test written as `v < 0` instead of the SIGN BIT (differs on -0)
  noAlpha?: boolean;       // the vblendps alpha passthrough dropped
};

function model(c: WireCase, d: Defect): string[] {
  return planes(c, (tile, st) => {
    const t = tile as {
      x0: number; y0: number; x1: number; y1: number;
      inPtr: Float32Array; outPtr: Float32Array; inRowStride: number; outRowStride: number;
    };
    const rows = (t.y1 - t.y0) | 0;
    if (rows <= 0) return;
    const width = (t.x1 - t.x0) | 0;
    const sv = (off: number, lane: number) => st.getFloat32(off + 4 * lane, true);
    const mx = (a: number, b: number) => (d.maxSwapped ? (b > a ? b : a) : (a > b ? a : b));
    const mn = (a: number, b: number) => (d.minSwapped ? (b < a ? b : a) : (a < b ? a : b));
    const neg = (v: number) => (d.signAsCompare ? v < 0 : (bitsOf(v) & 0x80000000) !== 0);
    const sStep = (t.inRowStride | 0) * 4;
    const dStep = (t.outRowStride | 0) * 4;

    // ONE VECTOR of n lanes, at source/destination float index sBase/dBase. The LANE INDEX is the
    // State lane, which is why this is not a per-texel loop: in the 8-wide body the SECOND texel of
    // a pair reads State lanes 4..7. Getting that wrong is itself a defect worth catching, so the
    // base model (M0) gets it right and the four mutants differ from it by exactly one thing.
    const vec = (sBase: number, dBase: number, n: number) => {
      const v: number[] = [];
      for (let i = 0; i < n; i++) v.push(F(mx(t.inPtr[sBase + i], sv(0xb00, i))));
      for (let i = 0; i < n; i++) {
        const sgn = neg(v[i]) ? sv(0x15a0, i) : sv(0xa0, i);
        const tt = F(mn(floatOf((bitsOf(v[i]) & bitsOf(sv(0x15c0, i))) >>> 0), sv(0xde0, i)));
        const s = F(tt * tt);
        let A = F(F(tt * sv(0x1be0, i)) + sv(0x1c00, i));
        const B = F(F(tt * sv(0x1c20, i)) + sv(0x1c40, i));
        A = F(A + F(s * sv(0x1c60, i)));
        const o = F(sgn * F(s * F(B + F(s * A))));
        const alpha = (i & 3) === 3 && !d.noAlpha;
        t.outPtr[dBase + i] = alpha ? v[i] : o;
      }
    };

    let sRow = 0, dRow = 0;
    for (let r = 0; r < rows; r++) {
      if (width >= 2) {
        let x = 0;
        for (; x + 2 <= width - (width % 2 === 1 ? 1 : 0); x += 2) vec(sRow + x * 4, dRow + x * 4, 8);
        if (x < width) vec(sRow + x * 4, dRow + x * 4, 4);
      } else if (width === 1) {
        vec(sRow, dRow, 4);
      }
      sRow += sStep;
      dRow += dStep;
    }
  });
}

const chunks: Buffer[] = [];
process.stdin.on("data", (d: Buffer) => chunks.push(d));
process.stdin.on("end", () => {
  const cases: WireCase[] = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  process.stdout.write(
    JSON.stringify({
      port: cases.map(port),
      mutants: [
        // M0 is the mutants' own base model with NO defect. It is reported so the four kill
        // counts below can be read honestly: this re-implementation is a per-texel restatement,
        // not the port, so whatever IT differs from the live kernel by is present in all four
        // numbers and must be subtracted before calling them the defect's cost.
        { name: "M0 the mutants' base model, NO defect (control)", planes: cases.map((c) => model(c, {})) },
        { name: "M1 MAXPS operands swapped (@0x29f8a6)", planes: cases.map((c) => model(c, { maxSwapped: true })) },
        { name: "M2 MINPS operands swapped (@0x29f8c8)", planes: cases.map((c) => model(c, { minSwapped: true })) },
        { name: "M3 sign test as `v < 0`, not the sign BIT", planes: cases.map((c) => model(c, { signAsCompare: true })) },
        { name: "M4 alpha passthrough dropped (@0x29f910)", planes: cases.map((c) => model(c, { noAlpha: true })) },
      ],
    }),
  );
});
