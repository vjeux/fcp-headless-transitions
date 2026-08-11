// SurroundPanner_AngleBisectionRatio_driver.mts — the TS side of the
// bit-exact differential for `SurroundPanner::AngleBisectionRatio`
// @Flexo 0x12513a0.
//
// Run by SurroundPanner_AngleBisectionRatio_oracle.py as:
//     node --experimental-strip-types <this file>
// with a JSON request on stdin and a JSON reply on stdout.
//
// It imports the REAL ported file, so what gets compared against the live
// Flexo function is the shipped TypeScript, not a re-statement of it.
//
// WIRE FORMAT: every double crosses as a 16-hex-digit RAW BIT PATTERN, never
// as a JSON number. Python's json.dump writes bare NaN/Infinity, which
// JSON.parse rejects outright, and bit patterns also make the comparison exact
// for signed zero and for NaN payloads instead of merely value-equal
// (OPS_LOG). Rebuild with a DataView; never with parseFloat.
import { SurroundPanner } from "../../src/channels/SurroundPanner.ts";

const buf = new ArrayBuffer(8);
const view = new DataView(buf);

function fromBits(hex: string): number {
  view.setBigUint64(0, BigInt("0x" + hex));
  return view.getFloat64(0);
}

function toBits(x: number): string {
  view.setFloat64(0, x);
  return view.getBigUint64(0).toString(16).padStart(16, "0");
}

// SSE semantics, as the port defines them (duplicated here ONLY to build the
// mutants — the `port` entry below calls the real thing).
const maxsd = (d: number, s: number) => (d > s ? d : s);
const minsd = (d: number, s: number) => (d < s ? d : s);
const TWO_PI = 6.283185307179586;

type Impl = (a: number, b: number, c: number) => number;

const IMPLS: Record<string, Impl> = {
  // the actual port under test
  port: (a, b, c) => SurroundPanner.AngleBisectionRatio(a, b, c),

  // --- negative controls: plausible ways to get this wrong -----------------
  "Math.max/Math.min instead of MAXSD/MINSD": (angle, b, c) => {
    const a = angle < 0 ? angle + TWO_PI : angle;
    const hi = Math.max(b, c);
    if (a > hi) return 1.0;
    const lo = Math.min(c, b);
    if (lo > a) return 0.0;
    return (a - lo) / (hi - lo);
  },
  "swapped MAXSD/MINSD operand order": (angle, b, c) => {
    const a = angle < 0 ? angle + TWO_PI : angle;
    const hi = maxsd(c, b);
    if (a > hi) return 1.0;
    const lo = minsd(b, c);
    if (lo > a) return 0.0;
    return (a - lo) / (hi - lo);
  },
  "the `ja` path returns 1.0 (misreading the shared epilogue)": (angle, b, c) => {
    const a = angle < 0 ? angle + TWO_PI : angle;
    const hi = maxsd(b, c);
    if (a > hi) return 1.0;
    const lo = minsd(c, b);
    if (lo > a) return 1.0;
    return (a - lo) / (hi - lo);
  },
  "low clamp written as !(a >= lo) (inverts the NaN behavior)": (angle, b, c) => {
    const a = angle < 0 ? angle + TWO_PI : angle;
    const hi = maxsd(b, c);
    if (a > hi) return 1.0;
    const lo = minsd(c, b);
    if (!(a >= lo)) return 0.0;
    return (a - lo) / (hi - lo);
  },
  "no 2pi wrap for negative angles": (angle, b, c) => {
    const a = angle;
    const hi = maxsd(b, c);
    if (a > hi) return 1.0;
    const lo = minsd(c, b);
    if (lo > a) return 0.0;
    return (a - lo) / (hi - lo);
  },
  "wrap when angle <= 0 instead of < 0 (the -0.0 case)": (angle, b, c) => {
    const a = angle <= 0 ? angle + TWO_PI : angle;
    const hi = maxsd(b, c);
    if (a > hi) return 1.0;
    const lo = minsd(c, b);
    if (lo > a) return 0.0;
    return (a - lo) / (hi - lo);
  },
};

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (raw += chunk));
process.stdin.on("end", () => {
  const req = JSON.parse(raw) as { cases: [string, string, string][] };
  const out: Record<string, string[]> = {};
  for (const [name, impl] of Object.entries(IMPLS)) {
    out[name] = req.cases.map(([a, b, c]) =>
      toBits(impl(fromBits(a), fromBits(b), fromBits(c))),
    );
  }
  process.stdout.write(JSON.stringify({ results: out }));
});
