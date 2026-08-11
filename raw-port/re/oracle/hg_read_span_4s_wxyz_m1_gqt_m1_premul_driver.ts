// TS side of the differential oracle for hg_read_span_4s_wxyz_m1_gqt_m1_premul
// @Helium 0x18adf0. Not part of the port (tsconfig only includes src/**).
// Driven by raw-port/re/oracle/hg_read_span_4s_wxyz_m1_gqt_m1_premul_oracle.py,
// which feeds the identical spans to the live Helium kernel and to this port.
//
// It imports and runs the SHIPPED module — a restatement of the port here would
// measure this file instead of the thing under review (OPS_LOG). The mutation
// controls are applied to a COPY of the shipped module in /tmp, for the same
// reason, and this driver is copied alongside with only its import specifier
// rewritten.
//
// Everything crosses the wire as RAW BIT PATTERNS (u32 arrays), never as JSON
// floats: JSON.parse rejects Python's bare NaN/Infinity, and bit patterns make
// the comparison exact for signed zero and NaN payloads too (OPS_LOG).
import {
  hg_read_span_4s_wxyz_m1_gqt_m1_premul,
  type hgColorGammaTransformData,
} from "../../src/render/hg_read_span_4s_wxyz_m1_gqt_m1_premul.js";

interface WireCase {
  /** byte offset of the source view inside its buffer — mirrors the C pointer's
   *  misalignment, so the port takes the same head-loop path as the machine. */
  srcByteOffset: number;
  /** the u16 samples, 4 per pixel, WXYZ order. */
  samples: number[];
  count: number;
  /** the seven float4 fields of the transform, as u32 bit patterns. */
  a0Bits: number[];
  a1Bits: number[];
  a2Bits: number[];
  b0Bits: number[];
  b1Bits: number[];
  b2Bits: number[];
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
    // src view at the requested byte offset inside a fresh (16-byte aligned) buffer
    const srcBuf = new ArrayBuffer(c.srcByteOffset + c.samples.length * 2 + 32);
    const src = new Uint16Array(srcBuf, c.srcByteOffset, c.samples.length);
    src.set(c.samples);

    const data: hgColorGammaTransformData = {
      matrixA_row0_at_0x00: f4(c.a0Bits),
      matrixA_row1_at_0x10: f4(c.a1Bits),
      matrixA_row2_at_0x20: f4(c.a2Bits),
      matrixB_row0_at_0x40: f4(c.b0Bits),
      matrixB_row1_at_0x50: f4(c.b1Bits),
      matrixB_row2_at_0x60: f4(c.b2Bits),
      bias_at_0x100: f4(c.biasBits),
    };

    const dst = new Float32Array(Math.max(c.count, 0) * 4 + 8);
    // Poison, so an unwritten lane is visible — the SAME bit pattern the Python
    // side writes into the native destination. JS's own NaN canonicalises to
    // 0x7fc00000, so filling with NaN would make every untouched trailing lane
    // "diverge" for a reason that has nothing to do with the port; with the
    // patterns equal, the two spare pixels past the span are a real check that
    // the kernel wrote no further.
    new Uint32Array(dst.buffer).fill(0x7fc0dead);
    hg_read_span_4s_wxyz_m1_gqt_m1_premul(dst, c.count, src, data, 0);
    return Array.from(new Uint32Array(dst.buffer, dst.byteOffset, dst.length));
  });
  process.stdout.write(JSON.stringify(out) + "\n");
});
