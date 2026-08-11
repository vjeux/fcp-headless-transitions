// TS side of the differential oracle for OZBSplineInterpolator::operator== @ProChannel 0x41bc0.
// Not part of the port (tsconfig only includes src/**); it is the harness that feeds the same fuzz
// corpus to the TS transcription that OZBSplineInterpolator_operatorEquals_oracle.py feeds to the
// live binary. Run it through that script, not directly.
//
// Doubles arrive as raw 64-bit hex bit patterns and are rebuilt with a DataView, so NaN payloads
// and signed zero survive the JSON round-trip exactly (JSON.parse rejects bare NaN/Infinity).
import {
  operatorEquals,
  type OZBSplineInterpolatorState,
} from "../../src/channels/OZBSplineInterpolator.js";

interface WireState {
  values: string[];
  weights: string[];
  knots: string[];
  basis: string[];
  count: number;
  order: number;
}

const scratch = new DataView(new ArrayBuffer(8));

function f64(hex: string): number {
  scratch.setBigUint64(0, BigInt("0x" + hex));
  return scratch.getFloat64(0);
}

function decode(w: WireState): OZBSplineInterpolatorState {
  return {
    values: w.values.map(f64),
    weights: w.weights.map(f64),
    knots: w.knots.map(f64),
    basis: w.basis.map(f64),
    count: w.count,
    order: w.order,
  };
}

const chunks: Buffer[] = [];
process.stdin.on("data", (c: Buffer) => chunks.push(c));
process.stdin.on("end", () => {
  const cases = JSON.parse(Buffer.concat(chunks).toString("utf8")) as [WireState, WireState][];
  const out = cases.map(([a, b]) => operatorEquals(decode(a), decode(b)));
  process.stdout.write(JSON.stringify(out) + "\n");
});
