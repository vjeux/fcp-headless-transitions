// TS side of the differential oracle for hg_read_span_4s_m0_gqt_m0_premul
// @Helium 0x18d200. Not part of the port (tsconfig only includes src/**).
// Driven by raw-port/re/oracle/hg_read_span_4s_m0_gqt_m0_premul_oracle.py, which
// feeds the identical spans to the live Helium kernel and to this port.
//
// Everything crosses the wire as RAW BIT PATTERNS (u32 arrays), never as JSON
// floats: JSON.parse rejects Python's bare NaN/Infinity, and bit patterns make
// the comparison exact for signed zero and NaN payloads too (OPS_LOG).
import {
  hg_read_span_4s_m0_gqt_m0_premul,
  type hgColorGammaTransformData,
} from "../../src/render/hg_read_span_4s_m0_gqt_m0_premul.js";

interface WireCase {
  /** byte offset of the source view inside its buffer — mirrors the C pointer's
   *  misalignment, so the port takes the same head-loop path as the machine. */
  srcByteOffset: number;
  /** the u16 samples, 4 per pixel. */
  samples: number[];
  count: number;
  /** the four bias floats at data+0x100, as u32 bit patterns. */
  biasBits: number[];
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

    const biasBuf = new ArrayBuffer(16);
    new Uint32Array(biasBuf).set(c.biasBits);
    const data: hgColorGammaTransformData = {
      bias_at_0x100: new Float32Array(biasBuf),
    };

    const dst = new Float32Array(Math.max(c.count, 0) * 4 + 8);
    dst.fill(NaN); // poison, so an unwritten lane is visible
    hg_read_span_4s_m0_gqt_m0_premul(dst, c.count, src, data, 0);
    return Array.from(new Uint32Array(dst.buffer, dst.byteOffset, dst.length));
  });
  process.stdout.write(JSON.stringify(out) + "\n");
});
