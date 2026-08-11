// TS side of the differential oracle for PCSolveQuadratic @ProCore 0xc0582.
// Not part of the port (tsconfig only includes src/**). Driven by
// raw-port/re/oracle/PCSolveQuadratic_oracle_ts.py, which feeds the identical
// coefficients to the live ProCore symbol and to this port.
//
// Doubles cross the boundary as 16-digit HEX BIT PATTERNS, never as JSON
// numbers: Python's json.dump emits bare NaN/Infinity, which JSON.parse
// rejects (OPS_LOG), and hex also makes the comparison bit-exact — which is
// the whole point for signed zero and the last ulp.
import { PCSolveQuadratic } from "../../src/infra/PCSolveQuadratic.js";

const view = new DataView(new ArrayBuffer(8));

function fromHex(h: string): number {
  view.setBigUint64(0, BigInt("0x" + h));
  return view.getFloat64(0);
}

function toHex(x: number): string {
  view.setFloat64(0, x);
  return view.getBigUint64(0).toString(16).padStart(16, "0");
}

let input = "";
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  const cases: Array<[string, string, string]> = JSON.parse(input);
  const out = cases.map(([a, b, c]) => {
    const r = PCSolveQuadratic(fromHex(a), fromHex(b), fromHex(c));
    return { count: r.count, roots: r.roots.map(toHex) };
  });
  process.stdout.write(JSON.stringify(out));
});
