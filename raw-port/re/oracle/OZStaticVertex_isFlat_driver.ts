// TS side of the differential oracle for OZStaticVertex::isFlat() @ProChannel 0x4012e.
// Not part of the port (tsconfig only includes src/**). Driven by
// raw-port/re/oracle/OZStaticVertex_isFlat_oracle.py, which feeds the identical synthetic
// vertices to the live binary and to this port.
//
// Values arrive as raw IEEE-754 bit patterns (16 hex chars) rather than JSON numbers: Python's
// json.dump emits bare NaN/Infinity, which JSON.parse rejects, and bit patterns keep -0.0 and
// NaN exact (OPS_LOG).
import { OZStaticVertex } from "../../src/channels/OZStaticVertex.js";

interface WireCase {
  in0: string;
  out0: string;
  in1: string;
  out1: string;
}

const view = new DataView(new ArrayBuffer(8));
function fromBits(hex: string): number {
  view.setBigUint64(0, BigInt("0x" + hex));
  return view.getFloat64(0);
}

const chunks: Buffer[] = [];
process.stdin.on("data", (c: Buffer) => chunks.push(c));
process.stdin.on("end", () => {
  const cases = JSON.parse(Buffer.concat(chunks).toString("utf8")) as WireCase[];
  const out = cases.map((c) => {
    const v = new OZStaticVertex();
    v.inputTangent0 = fromBits(c.in0);
    v.outputTangent0 = fromBits(c.out0);
    v.inputTangent1 = fromBits(c.in1);
    v.outputTangent1 = fromBits(c.out1);
    return v.isFlat();
  });
  process.stdout.write(JSON.stringify(out) + "\n");
});
