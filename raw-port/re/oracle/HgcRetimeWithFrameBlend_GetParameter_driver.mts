// HgcRetimeWithFrameBlend_GetParameter_driver.mts — the TypeScript side of the differential.
//
//     node --experimental-strip-types HgcRetimeWithFrameBlend_GetParameter_driver.mts
//
// Runs the REAL `raw-port/src/render/HgcRetimeWithFrameBlend.ts`, so the comparison the oracle
// prints is the committed TypeScript against the live Helium binary rather than a restatement of
// it. NOTHING IS STUBBED: that module imports nothing, so `--experimental-strip-types` loads it
// straight from the repo path the oracle passes in. The driver echoes `fn.toString()` back so a
// reviewer can see that the method measured is the one in the file.
//
// FLOATS CROSS THE WIRE AS RAW 32-BIT PATTERNS (8-char hex), never as JSON numbers: the corpus
// carries NaN, ±Inf, ±0 and denormals on purpose — `JSON.stringify` cannot even transport the
// first two, and a decimal round-trip erases the last two. The comparison on the other side is on
// these strings, so it is bit-exact including a NaN's payload.
//
// `out` IS PRE-FILLED WITH A POISON PATTERN before every call and reported back in full, because
// half of what this function promises is what it does NOT write: on any non-zero index it returns
// -1 without touching the buffer. A driver that only reported the return value could not see the
// difference between "wrote nothing" and "wrote something wrong".
const chunks: Buffer[] = [];
for await (const c of process.stdin) chunks.push(c as Buffer);
const req = JSON.parse(Buffer.concat(chunks).toString("utf8")) as {
  module: string;
  cases: { index: number; block: string[]; poison: string[] }[];
};

const mod = (await import(req.module)) as {
  HgcRetimeWithFrameBlend: new () => {
    uniformsAt0x198: Float32Array | null;
    GetParameter(index: number, out: Float32Array): number;
  };
};

const f32 = new Float32Array(1);
const u32 = new Uint32Array(f32.buffer);
const toF32 = (hex: string): number => {
  u32[0] = Number("0x" + hex);
  return f32[0]!;
};
const fromF32 = (v: number): string => {
  f32[0] = v;
  return u32[0]!.toString(16).padStart(8, "0");
};

const results: { rc: number; out: string[] }[] = [];
for (const c of req.cases) {
  const self = new mod.HgcRetimeWithFrameBlend();
  const block = new Float32Array(c.block.length);
  for (let i = 0; i < c.block.length; i++) block[i] = toF32(c.block[i]!);
  self.uniformsAt0x198 = block;

  const out = new Float32Array(4);
  for (let i = 0; i < 4; i++) out[i] = toF32(c.poison[i]!);

  const rc = self.GetParameter(c.index, out);
  results.push({ rc, out: Array.from(out, fromF32) });
}

process.stdout.write(JSON.stringify({
  results,
  source: mod.HgcRetimeWithFrameBlend.prototype.GetParameter.toString(),
}));
