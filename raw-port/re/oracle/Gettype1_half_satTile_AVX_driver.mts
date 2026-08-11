// Gettype1_half_satTile_AVX @Helium 0x275cf0 — TS side of the live differential.
// Imports the REAL port and renders the same tile the Python side just rendered
// through the live AVX kernel.
//
//   node --experimental-strip-types Gettype1_half_satTile_AVX_driver.mts
//   stdin : {"stateBits":[u32...],"srcBits":[u32...],"width","height"}
//   stdout: {"dstBits":[u32...]}
//
// Floats cross as raw u32 BIT PATTERNS, never as JSON numbers — JSON has no NaN
// and no signed zero, and this kernel produces both (OPS_LOG).
import { pathToFileURL } from "node:url";

const modulePath = new URL("../../src/render/Gettype1_half_satTile_AVX.ts", import.meta.url).pathname;

const chunks: Buffer[] = [];
for await (const c of process.stdin) chunks.push(c as Buffer);
const req = JSON.parse(Buffer.concat(chunks).toString());

const mod: any = await import(pathToFileURL(modulePath).href);

function f32FromBits(bits: number[]): Float32Array {
  const out = new Float32Array(bits.length);
  const view = new DataView(out.buffer);
  for (let i = 0; i < bits.length; i++) view.setUint32(i * 4, bits[i]! >>> 0, true);
  return out;
}
function bitsOf(a: Float32Array): number[] {
  const view = new DataView(a.buffer, a.byteOffset, a.byteLength);
  const out: number[] = [];
  for (let i = 0; i < a.length; i++) out.push(view.getUint32(i * 4, true) >>> 0);
  return out;
}

// One buffer, two views — exactly as the single %rsi base pointer is read both
// as f32 lanes and (at +0x400) as i32 lanes.
const stateBuf = new ArrayBuffer(req.stateBits.length * 4);
{
  const v = new DataView(stateBuf);
  for (let i = 0; i < req.stateBits.length; i++) v.setUint32(i * 4, req.stateBits[i]! >>> 0, true);
}
const st = { f32: new Float32Array(stateBuf), i32: new Int32Array(stateBuf) };

const dst = new Float32Array(req.width * req.height * 4);
const tile = {
  x0: 0, y0: 0, x1: req.width, y1: req.height,
  dst, dstBase: 0, dstRowStridePixels: req.width,
  src: f32FromBits(req.srcBits), srcBase: 0, srcRowStridePixels: req.width,
};

mod.Gettype1_half_satTile_AVX(tile, st, null);
process.stdout.write(JSON.stringify({ dstBits: bitsOf(dst) }));
