// TS side of the differential oracle for HgcScaleBiasCrop::RenderTile_AVX @Helium 0x2daab0.
// Not part of the port (tsconfig only includes src/**). Driven by
// raw-port/re/oracle/HgcScaleBiasCrop_RenderTile_AVX_oracle.py, which feeds the identical tile
// rect, source plane, strides and parameter block to the live kernel and to this port.
//
// Floats cross as raw 32-bit hex bit patterns (JSON.parse rejects bare NaN/Infinity), so the
// comparison on the Python side is bit-exact — signed zero and NaN payloads included.
import {
  HgcScaleBiasCrop_RenderTile_AVX,
  type HgcScaleBiasCropState,
} from "../../src/render/HgcScaleBiasCrop.js";
import { HGTile } from "../../src/render/HGTile.js";

interface WireCase {
  w: number;
  h: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  srcStride: number;
  dstStride: number;
  npix_src: number;
  npix_dst: number;
  src: string[];
  params: string[];
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
    const src = new Float32Array(c.npix_src * 4);
    for (let i = 0; i < c.src.length; i += 1) src[i] = f32(c.src[i]!);

    const dst = new Float32Array(c.npix_dst * 4);
    dst.fill(-777.0); // the same "untouched" sentinel the native side poisons with

    const params = new Float32Array(c.params.length);
    for (let i = 0; i < c.params.length; i += 1) params[i] = f32(c.params[i]!);

    const tile = new HGTile();
    tile.left = c.x0;
    tile.top = c.y0;
    tile.right = c.x1;
    tile.bottom = c.y1;
    tile.outSlot = dst;
    tile.outStride = c.dstStride;
    tile.texPlanes[0] = { pixels: src, stride: c.srcStride };

    const self: HgcScaleBiasCropState = { _hgNode: null, params };
    const rc = HgcScaleBiasCrop_RenderTile_AVX(self, tile);
    if (rc !== 0) throw new Error(`return value is not 0: ${rc}`);

    return Array.from(dst, hex32);
  });
  process.stdout.write(JSON.stringify(out));
});
