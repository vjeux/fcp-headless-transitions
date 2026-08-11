// TS side of the differential oracle for HgcBT2100_PQ_OOTF::RenderTile_AVX @Helium 0x3a59d0.
//
// Not part of the port (tsconfig only includes src/**). Driven by
// raw-port/re/oracle/HgcBT2100_PQ_OOTF_RenderTile_AVX_oracle.py, which builds the IDENTICAL tile
// and parameter bank in real process memory, calls the live Helium kernel on it, and compares the
// destination plane texel by texel.
//
// THIS DRIVER IMPORTS THE SHIPPED FILE. It does not restate the port in the harness — per
// OPS_LOG, 66 of 117 oracle harnesses on main compared FCP against a re-implementation of the
// port and therefore could not detect a defect in the file being shipped at any corpus size.
//
// Everything crosses the wire as raw bit patterns (8 hex chars per f32, or one long hex string
// for the whole bank), never as JSON numbers: Python's json.dump emits bare NaN/Infinity which
// JSON.parse rejects, and bit patterns keep -0.0, NaN payloads and denormals exact — which is the
// whole point, since this kernel is claimed BIT-EXACT.
import {
  HgcBT2100_PQ_OOTF,
  type HGTile,
} from "../../src/render/HgcBT2100_PQ_OOTF.js";

interface WireCase {
  w: number;
  h: number;
  inStride: number;
  outStride: number;
  /** the whole source plane, 8 hex chars per f32, row-major */
  inPlane: string[];
  /** the destination plane's pre-fill (poison), same length */
  outPlane: string[];
  /** the whole parameter bank as hex bytes */
  bank: string;
  /** harness-liveness mutant: shift every bank read by this many BYTES (0 = faithful) */
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
    // The backing is padded by `shift` so the shifted (deliberately wrong) view still spans the
    // whole block — a RangeError would be a crash, not the divergence the control is measuring.
    const backing = new ArrayBuffer(bankBytes.length + shift);
    new Uint8Array(backing).set(bankBytes);
    // A non-zero shift is the harness-liveness mutant: it makes every bank read come from the
    // wrong offset, which MUST produce a divergence. It is not a model of anything in the binary.
    const node = new HgcBT2100_PQ_OOTF();
    node.params = new DataView(backing, shift, bankBytes.length);

    const tile: HGTile = {
      x0: 0,
      y0: 0,
      x1: c.w,
      y1: c.h,
      inPtr: planeFromHex(c.inPlane),
      inRowStride: c.inStride,
      outPtr: planeFromHex(c.outPlane),
      outRowStride: c.outStride,
    };
    const rc = node.RenderTile_AVX(tile);
    return { out: planeToHex(tile.outPtr), rc };
  });
  process.stdout.write(JSON.stringify(out) + "\n");
});
