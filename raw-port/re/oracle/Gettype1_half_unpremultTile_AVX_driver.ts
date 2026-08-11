// TS side of the differential oracle for Gettype1_half_unpremultTile_AVX @Helium 0x2945e0.
//
// Not part of the port (tsconfig only includes src/**). Driven by
// raw-port/re/oracle/Gettype1_half_unpremultTile_AVX_oracle.py, which builds the IDENTICAL tile
// and HGToneCurve::State in real process memory, calls the live Helium kernel on it, and compares
// the output plane texel by texel.
//
// Everything crosses the wire as raw bit patterns (8 hex chars per f32, or one long hex string
// for the whole State block), never as JSON numbers: Python's json.dump emits bare NaN/Infinity
// which JSON.parse rejects, and bit patterns keep -0.0, NaN payloads and denormals exact — which
// is the whole point, since this kernel is claimed BIT-EXACT (OPS_LOG).
import {
  Gettype1_half_unpremultTile_AVX,
  type HGTile,
} from "../../src/render/Gettype1_half_unpremultTile_AVX.js";

interface WireCase {
  w: number;
  h: number;
  inStride: number;
  outStride: number;
  /** the whole source plane, 8 hex chars per f32, row-major */
  inPlane: string[];
  /** the destination plane's pre-fill (poison), same length */
  outPlane: string[];
  /** the whole HGToneCurve::State block as hex bytes */
  state: string;
  /** harness-liveness mutant: shift every State read by this many BYTES (0 = faithful) */
  stateShift?: number;
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
    const stateBytes = Buffer.from(c.state, "hex");
    const shift = c.stateShift ?? 0;
    // The backing is padded by `shift` so the shifted (deliberately wrong) view still spans the
    // whole block — a RangeError would be a crash, not the divergence the control is measuring.
    const backing = new ArrayBuffer(stateBytes.length + shift);
    new Uint8Array(backing).set(stateBytes);
    const state = new DataView(backing, shift, stateBytes.length);

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
    Gettype1_half_unpremultTile_AVX(tile, state);
    return planeToHex(tile.outPtr);
  });
  process.stdout.write(JSON.stringify(out) + "\n");
});
