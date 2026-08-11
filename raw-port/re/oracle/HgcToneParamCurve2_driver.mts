// HgcToneParamCurve2::RenderTile_AVX @Helium 0x3764d0 — TS side of the live
// differential. Imports a REAL port module (the shipped one, or the pre-fix
// mutant the harness writes) and renders the SAME tile the Python side just
// rendered through the live AVX kernel.
//
//   node --experimental-strip-types HgcToneParamCurve2_driver.mts <modulePath>
//   stdin : {"poolBits":[u32...],"srcBits":[u32...],"width","height",
//            "srcStride","outStride"}
//   stdout: {"dstBits":[u32...]}
//
// Floats cross this boundary as raw u32 BIT PATTERNS, never as JSON numbers:
// JSON has no NaN and no signed zero, and a tone curve produces both (OPS_LOG).
// A DataView rebuilds them exactly on this side.
import { register } from "node:module";
import { pathToFileURL } from "node:url";

// The port imports "./HGTile.js" because tsconfig is NodeNext; nothing is
// compiled, so node needs the hook that maps such a specifier to the .ts beside
// it. It must be registered BEFORE the dynamic import (a static import would be
// resolved first).
register("./ts_js_hooks.mjs", import.meta.url);

const modulePath = process.argv[2]!;

const chunks: Buffer[] = [];
for await (const c of process.stdin) chunks.push(c as Buffer);
const req = JSON.parse(Buffer.concat(chunks).toString());

const mod: any = await import(pathToFileURL(modulePath).href);
const tileMod: any = await import(
  pathToFileURL(new URL("../../src/render/HGTile.ts", import.meta.url).pathname).href
);

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

const node = new mod.HgcToneParamCurve2();
node.pool = f32FromBits(req.poolBits);

const tile = new tileMod.HGTile();
tile.left = 0;
tile.top = 0;
tile.right = req.width;
tile.bottom = req.height;
tile.outSlot = new Float32Array(req.outStride * req.height * 4);
tile.outStride = req.outStride;
tile.texPlanes[0] = { pixels: f32FromBits(req.srcBits), stride: req.srcStride };

const rc = node.RenderTile_AVX(tile);
process.stdout.write(JSON.stringify({ rc, dstBits: bitsOf(tile.outSlot) }));
