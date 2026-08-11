// PCPixel4_PixelInfoTemplate_ChannelOrder4_unpremultiply_driver.mts
// TS side of the live differential for unpremultiply() @ProCore 0x4806a.
//
//   node --experimental-strip-types <this file>
//   stdin : {"modulePath"?, "pixels":[b0,b1,b2,b3, b0,b1,b2,b3, ...]}
//   stdout: {"pixels":[...same shape, after the call...]}
//
// Bytes, not floats, so nothing crosses as a JSON float. `modulePath` lets the Python side
// point this driver at a MUTATED copy of the port, so a negative control cannot drift from
// the code under test.
import { pathToFileURL } from "node:url";

const chunks: Buffer[] = [];
for await (const c of process.stdin) chunks.push(c as Buffer);
const req = JSON.parse(Buffer.concat(chunks).toString());

const modulePath: string =
  req.modulePath ??
  new URL("../../src/infra/PCPixel4_PixelInfoTemplate_ChannelOrder4.ts", import.meta.url).pathname;
const mod: any = await import(pathToFileURL(modulePath).href);

const inBytes: number[] = req.pixels;
const out = new Array<number>(inBytes.length);
const px = new mod.PCPixel4_PixelInfoTemplate_ChannelOrder4();
for (let i = 0; i < inBytes.length; i += 4) {
  px.bytes = Uint8Array.from([inBytes[i]!, inBytes[i + 1]!, inBytes[i + 2]!, inBytes[i + 3]!]);
  px.unpremultiply();
  out[i] = px.bytes[0]!;
  out[i + 1] = px.bytes[1]!;
  out[i + 2] = px.bytes[2]!;
  out[i + 3] = px.bytes[3]!;
}
process.stdout.write(JSON.stringify({ pixels: out }));
