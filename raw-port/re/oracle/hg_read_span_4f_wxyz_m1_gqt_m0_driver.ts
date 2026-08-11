// TS side of the differential oracle for hg_read_span_4f_wxyz_m1_gqt_m0
// @Helium 0x83fa0. Not part of the port (tsconfig only includes src/**).
// Driven by raw-port/re/oracle/hg_read_span_4f_wxyz_m1_gqt_m0_oracle.py, which
// feeds the identical spans to the live Helium kernel and to this port.
//
// It imports and runs the SHIPPED module — a restatement of the port here would
// measure this file instead of the thing under review (OPS_LOG: two of four
// oracles compared live FCP against a model and could not see the defect at any
// corpus size). The mutation controls the driver script applies are applied to a
// COPY of the shipped module in /tmp, for the same reason.
//
// Everything crosses the wire as RAW BIT PATTERNS (u32 arrays), never as JSON
// floats: JSON.parse rejects Python's bare NaN/Infinity, and bit patterns make
// the comparison exact for signed zero and NaN payloads too (OPS_LOG).
//
// MODULE_UNDER_TEST is rewritten by the mutation harness; by default it is the
// shipped path.
import {
  hg_read_span_4f_wxyz_m1_gqt_m0,
  type hgColorGammaTransformData,
} from "../../src/render/hg_read_span_4f_wxyz_m1_gqt_m0.js";

interface WireCase {
  /** the source samples, 4 float32 per pixel in WXYZ order, as u32 bit patterns. */
  srcBits: number[];
  count: number;
  /** matrix rows +0x00/+0x10/+0x20 and the bias +0x100, 4 u32 bit patterns each. */
  row0Bits: number[];
  row1Bits: number[];
  row2Bits: number[];
  biasBits: number[];
}

function f4(bitsArr: number[]): Float32Array {
  const buf = new ArrayBuffer(16);
  new Uint32Array(buf).set(bitsArr);
  return new Float32Array(buf);
}

const chunks: Buffer[] = [];
process.stdin.on("data", (c: Buffer) => chunks.push(c));
process.stdin.on("end", () => {
  const cases = JSON.parse(Buffer.concat(chunks).toString("utf8")) as WireCase[];
  const out = cases.map((c) => {
    const srcBuf = new ArrayBuffer(c.srcBits.length * 4);
    new Uint32Array(srcBuf).set(c.srcBits);
    const src = new Float32Array(srcBuf);

    const data: hgColorGammaTransformData = {
      row0_at_0x00: f4(c.row0Bits),
      row1_at_0x10: f4(c.row1Bits),
      row2_at_0x20: f4(c.row2Bits),
      bias_at_0x100: f4(c.biasBits),
    };

    const dst = new Float32Array(Math.max(c.count, 0) * 4 + 8);
    // Poison, so an unwritten lane is visible — the SAME bit pattern the Python
    // side writes into the native destination (a quiet NaN with the payload
    // 0xc0dead). JS's own NaN canonicalises to 0x7fc00000, so filling with NaN
    // here would make every untouched trailing lane "diverge" for a reason that
    // has nothing to do with the port. With the patterns equal, the two spare
    // pixels past the span are a real check that the kernel wrote no further.
    new Uint32Array(dst.buffer).fill(0x7fc0dead);
    hg_read_span_4f_wxyz_m1_gqt_m0(dst, c.count, src, data, 0);
    return Array.from(new Uint32Array(dst.buffer, dst.byteOffset, dst.length));
  });
  process.stdout.write(JSON.stringify(out) + "\n");
});
