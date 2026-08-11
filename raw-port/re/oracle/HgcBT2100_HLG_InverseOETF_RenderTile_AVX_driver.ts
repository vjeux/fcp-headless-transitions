// TS side of the differential oracle for HgcBT2100_HLG_InverseOETF::RenderTile_AVX @Helium 0x3b1660.
//
// Not part of the port (tsconfig only includes src/**). Driven by
// raw-port/re/oracle/HgcBT2100_HLG_InverseOETF_RenderTile_AVX_oracle.py, which builds the IDENTICAL
// tile and param buffer in real process memory, calls the live Helium kernel on it, and compares
// the destination plane texel by texel.
//
// THIS DRIVER IMPORTS THE SHIPPED FILE. It does not restate the port in the harness — per OPS_LOG,
// 66 of 117 oracle harnesses on main compared FCP against a re-implementation of the port and
// therefore could not detect a defect in the file being shipped at any corpus size.
//
// Everything crosses the wire as raw bit patterns, never as JSON numbers: Python's json.dump emits
// bare NaN/Infinity which JSON.parse rejects, and bit patterns keep -0.0, NaN payloads and
// denormals exact.
import {
  RenderTile_AVX,
  type HGTile,
  type HgcBT2100_HLG_InverseOETFInstance,
} from "../../src/render/HgcBT2100_HLG_InverseOETF.js";

interface WireCase {
  w: number;
  h: number;
  inStride: number;
  outStride: number;
  inPlane: string[];
  outPlane: string[];
  /** the whole param buffer as hex bytes */
  bank: string;
  /** harness-liveness mutant: shift every buffer read by this many BYTES (0 = faithful) */
  bankShift?: number;
}

function planeFromHex(hex: string[]): Float32Array {
  const out = new Float32Array(hex.length);
  const dv = new DataView(out.buffer);
  for (let i = 0; i < hex.length; i++) dv.setUint32(4 * i, parseInt(hex[i] as string, 16), true);
  return out;
}

function planeToHex(a: Float32Array): string[] {
  const dv = new DataView(a.buffer);
  const out: string[] = [];
  for (let i = 0; i < a.length; i++) {
    out.push(dv.getUint32(4 * i, true).toString(16).padStart(8, "0"));
  }
  return out;
}

const chunks: Buffer[] = [];
process.stdin.on("data", (c: Buffer) => chunks.push(c));
process.stdin.on("end", () => {
  const cases = JSON.parse(Buffer.concat(chunks).toString("utf8")) as WireCase[];
  const out = cases.map((c) => {
    const bankBytes = Buffer.from(c.bank, "hex");
    const shift = c.bankShift ?? 0;
    // Padded by `shift` so the shifted (deliberately wrong) view still spans the whole block — an
    // out-of-range read would be a crash, not the divergence the control is measuring.
    const backing = new ArrayBuffer(bankBytes.length + shift + 4);
    new Uint8Array(backing).set(bankBytes);
    // The port indexes paramBuf/paramBufI32 in ELEMENTS, so the mutant shift has to be a whole
    // number of elements to be expressible as a view; 4 bytes is one f32, which is exactly the
    // off-by-one-slot-lane error a wrong offset table would produce.
    const self: HgcBT2100_HLG_InverseOETFInstance = {
      _base: null,
      flags: 0,
      paramBuf: new Float32Array(backing, shift, bankBytes.length / 4),
      paramBufI32: new Int32Array(backing, shift, bankBytes.length / 4),
      paramBufRawBase: null,
    };
    const tile: HGTile = {
      x0: 0,
      y0: 0,
      x1: c.w,
      y1: c.h,
      src: planeFromHex(c.inPlane),
      srcStride16: c.inStride,
      dst: planeFromHex(c.outPlane),
      dstStride16: c.outStride,
    };
    const rc = RenderTile_AVX(self, tile);
    return { out: planeToHex(tile.dst), rc };
  });
  process.stdout.write(JSON.stringify(out) + "\n");
});
