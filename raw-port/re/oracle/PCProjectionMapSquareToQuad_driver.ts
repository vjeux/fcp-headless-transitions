// TS side of the differential oracle for PCProjectionMapSquareToQuad @ProCore 0x678d6.
// Not part of the port (tsconfig only includes src/**). Driven by
// raw-port/re/oracle/PCProjectionMapSquareToQuad_oracle.py.
//
// Doubles cross the wire as RAW u64 BIT PATTERNS (hex strings), never as JSON
// numbers: Python's json emits bare NaN/Infinity which JSON.parse rejects, and bit
// patterns keep signed zero and NaN payloads exact (OPS_LOG).
import {
  PCProjectionMapSquareToQuad,
  type PCVector2Double,
} from "../../src/infra/PCProjectionMapSquareToQuad.js";

const buf = new ArrayBuffer(8);
const f64 = new Float64Array(buf);
const u64 = new BigUint64Array(buf);

function toNum(hex: string): number {
  u64[0] = BigInt("0x" + hex);
  return f64[0];
}
function toBits(x: number): string {
  f64[0] = x;
  return u64[0].toString(16).padStart(16, "0");
}
function vec(pair: string[]): PCVector2Double {
  return { x: toNum(pair[0]!), y: toNum(pair[1]!) };
}

const chunks: Buffer[] = [];
process.stdin.on("data", (c: Buffer) => chunks.push(c));
process.stdin.on("end", () => {
  const cases = JSON.parse(Buffer.concat(chunks).toString("utf8")) as string[][][];
  const out = cases.map((c) => {
    const res: PCVector2Double = { x: NaN, y: NaN };
    PCProjectionMapSquareToQuad(vec(c[0]!), vec(c[1]!), vec(c[2]!), vec(c[3]!), vec(c[4]!), res);
    return [toBits(res.x), toBits(res.y)];
  });
  process.stdout.write(JSON.stringify(out) + "\n");
});
