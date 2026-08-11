// TS side of the differential oracle for Gettype3_nice_satTile_AVX @Helium 0x279470.
// Not part of the port (tsconfig only includes src/**). Driven by
// raw-port/re/oracle/Gettype3_nice_satTile_AVX_oracle.py, which feeds the identical tile, source
// plane and HGToneCurve::State bytes to the live kernel and to this port.
//
// Floats cross as raw 32-bit hex bit patterns (JSON.parse rejects bare NaN/Infinity), so the
// comparison on the Python side is bit-exact.
import {
  Gettype3_nice_satTile_AVX,
  type HGTile,
} from "../../src/render/Gettype3_nice_satTile_AVX.js";

interface WireCase {
  w: number;
  h: number;
  stride: number;
  n_tex: number;
  src: string[];
  state: string;
}

const scratch = new DataView(new ArrayBuffer(4));

function f32(hex: string): number {
  scratch.setUint32(0, Number.parseInt(hex, 16) >>> 0, true);
  return scratch.getFloat32(0, true);
}

function hex32(v: number): string {
  scratch.setFloat32(0, v, true);
  return scratch.getUint32(0, true).toString(16).padStart(8, "0");
}

const chunks: Buffer[] = [];
process.stdin.on("data", (c: Buffer) => chunks.push(c));
process.stdin.on("end", () => {
  const cases = JSON.parse(Buffer.concat(chunks).toString("utf8")) as WireCase[];
  const out = cases.map((c) => {
    const inPtr = new Float32Array(c.n_tex * 4);
    for (let i = 0; i < c.src.length; i++) inPtr[i] = f32(c.src[i]!);
    const outPtr = new Float32Array(c.n_tex * 4);
    outPtr.fill(-777.0); // same "untouched" sentinel the native side writes

    const stateBytes = new Uint8Array(c.state.length / 2);
    for (let i = 0; i < stateBytes.length; i++) {
      stateBytes[i] = Number.parseInt(c.state.substr(i * 2, 2), 16);
    }
    const state = new DataView(stateBytes.buffer);

    const tile: HGTile = {
      x0: 0,
      y0: 0,
      x1: c.w,
      y1: c.h,
      outPtr,
      outRowStride: c.stride,
      inPtr,
      inRowStride: c.stride,
    };
    Gettype3_nice_satTile_AVX(tile, state, null);
    return Array.from(outPtr, hex32);
  });
  process.stdout.write(JSON.stringify(out) + "\n");
});
