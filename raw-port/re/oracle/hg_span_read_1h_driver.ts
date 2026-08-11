// TS side of the differential oracle for hg_span_read_1h @Helium 0x1e6d00.
// Not part of the port (tsconfig only includes src/**). Driven by
// raw-port/re/oracle/hg_span_read_1h_oracle.py, which feeds the identical half samples and count
// to the live function and to this port.
//
// Floats cross as raw 32-bit hex bit patterns (JSON.parse rejects bare NaN/Infinity), so the
// comparison on the Python side is bit-exact — signed zero included.
import { hg_span_read_1h } from "../../src/render/hg_span_read_1h.js";

interface WireCase {
  count: number;
  halves: number[]; // uint16 sample values
  lanes: number; // total float32 lanes in the destination (span + sentinel padding)
}

const scratch = new DataView(new ArrayBuffer(4));

function hex32(v: number): string {
  scratch.setFloat32(0, v, true);
  return scratch.getUint32(0, true).toString(16).padStart(8, "0");
}

const chunks: Buffer[] = [];
process.stdin.on("data", (c: Buffer) => chunks.push(c));
process.stdin.on("end", () => {
  const cases = JSON.parse(Buffer.concat(chunks).toString("utf8")) as WireCase[];
  const out = cases.map((c) => {
    const src = new DataView(new ArrayBuffer(Math.max(c.halves.length, 1) * 2));
    for (let i = 0; i < c.halves.length; i += 1) src.setUint16(i * 2, c.halves[i]!, true);

    const dst = new Float32Array(c.lanes);
    dst.fill(-777.0); // the same "untouched" sentinel the native side poisons with

    hg_span_read_1h(dst, c.count, src);
    return Array.from(dst, hex32);
  });
  process.stdout.write(JSON.stringify(out));
});
