// HgcBilateralFilterInterpSC_InterpolatorLastZ_RenderTile_AVX_driver.mts
// TS side of the live differential for RenderTile_AVX @Helium 0x312fb0.
// Renders the same tile the Python side just rendered through the live kernel.
//
//   node --experimental-strip-types <this file>
//   stdin : {"modulePath"?, "paramsBits":[u32...], "t0Bits":[...], "t1Bits":[...],
//            "t2Bits":[...], "t3Bits":[...], "dstBits":[...],
//            "left","top","right","bottom","stride"}
//   stdout: {"dstBits":[u32...]}
//
// Floats cross as raw u32 BIT PATTERNS, never as JSON numbers — JSON has no NaN
// and no signed zero, and this kernel produces both (OPS_LOG). `modulePath` lets
// the Python side point the same driver at a MUTATED copy of the port, so a
// negative control cannot drift from the code under test.
import { pathToFileURL } from "node:url";

const chunks: Buffer[] = [];
for await (const c of process.stdin) chunks.push(c as Buffer);
const req = JSON.parse(Buffer.concat(chunks).toString());

const modulePath: string =
  req.modulePath ??
  new URL("../../src/render/HgcBilateralFilterInterpSC_InterpolatorLastZ.ts", import.meta.url).pathname;
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

const node = new mod.HgcBilateralFilterInterpSC_InterpolatorLastZ();
node.params = f32FromBits(req.paramsBits);

const dst = f32FromBits(req.dstBits); // pre-poisoned, exactly as the C side's buffer
const tile = {
  left: req.left, top: req.top, right: req.right, bottom: req.bottom,
  destBase: dst, destStride: req.stride,
  tex0Base: f32FromBits(req.t0Bits), tex0Stride: req.stride,
  tex1Base: f32FromBits(req.t1Bits), tex1Stride: req.stride,
  tex2Base: f32FromBits(req.t2Bits), tex2Stride: req.stride,
  tex3Base: f32FromBits(req.t3Bits), tex3Stride: req.stride,
};

const rc = node.RenderTile_AVX(tile);
process.stdout.write(JSON.stringify({ dstBits: bitsOf(dst), rc }));
