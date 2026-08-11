// hg_span_write_4s_wxyz_driver.mts — replay the probe's cases through the REAL port.
//
// Run by raw-port/re/oracle/hg_span_write_4s_wxyz_probe.py as
//     node --experimental-strip-types <this file>
// with the case list on stdin as JSON and the resulting destination buffers on stdout as JSON.
//
// It imports raw-port/src/render/hg_span_write_4s_wxyz.ts DIRECTLY (node 24 strips types), so the
// thing compared against live Helium is the shipped TypeScript rather than a restatement of it.
// The port imports nothing, so no resolve hook is needed.
//
// EVERY FLOAT CROSSES AS A BIT PATTERN, in both directions: `JSON.stringify(NaN)` is `null` and so
// is `Infinity`, and this corpus is largely about what the machine does with NaN, negatives and
// exact rounding ties. A JSON number could not carry the question, let alone the answer.
import { hg_span_write_4s_wxyz } from "../../src/render/hg_span_write_4s_wxyz.ts";

interface Case {
  name: string;
  count: number;
  align: number; // the destination's byte offset, i.e. the low nibble the machine tests
  dstBytes: number; // total buffer size, poison included
  poison: number;
  src: string[]; // float32 bit patterns, hex, four per sample
}

const stdin = await new Promise<string>((resolve) => {
  let b = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (d) => (b += d));
  process.stdin.on("end", () => resolve(b));
});

const cases: Case[] = JSON.parse(stdin);

const out = cases.map((c) => {
  // Rebuild the source floats from their exact bit patterns.
  const src = new Float32Array(c.src.length);
  const srcU32 = new Uint32Array(src.buffer);
  for (let i = 0; i < c.src.length; i++) srcU32[i] = parseInt(c.src[i]!, 16) >>> 0;

  // The destination: one buffer, poisoned, with the view offset carrying the alignment the machine
  // reads out of the pointer. Comparing the WHOLE buffer (not just the written span) is what makes
  // an over-write visible — a return-value comparison never could.
  const buf = new ArrayBuffer(c.dstBytes);
  new Uint8Array(buf).fill(c.poison);
  const view = new DataView(buf, c.align);

  let error = "";
  try {
    hg_span_write_4s_wxyz(view, c.count, src, 0x7fffffff);
  } catch (e) {
    error = String(e);
  }
  return {
    name: c.name,
    dst: Buffer.from(buf).toString("hex"),
    error,
  };
});

process.stdout.write(JSON.stringify(out));
