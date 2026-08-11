// rho_driver.mts — the TypeScript side of the `rho` differential.
//
//     node --experimental-strip-types rho_driver.mts      # JSON in on stdin, JSON out on stdout
//
// It imports and runs the REAL `raw-port/src/channels/rho.ts` — not a Python or TS restatement of
// it — so what the oracle prints is the committed TypeScript measured against the live Helium
// binary. OPS_LOG's standing complaint about this project's oracles is that most compare the
// binary against a paraphrase that shares any misreading with the port; this does not.
//
// NOTHING IS STUBBED HERE, and that is worth stating because the house recipe usually needs a
// resolve hook: `rho.ts` is a LEAF — it imports nothing at all — so `--experimental-strip-types`
// loads it directly from the repo path the oracle passes in. The driver echoes back
// `fn.toString()` so a reviewer can see on one screen that the function measured is the one in the
// file.
//
// EVERY DOUBLE CROSSES THE WIRE AS A RAW BIT PATTERN (a 16-char hex string), never as a JSON
// number. Two reasons, both load-bearing for this unit: `JSON.stringify` emits bare `NaN` and
// `Infinity`, which `JSON.parse` rejects — and this function's whole NaN-blend structure means the
// corpus deliberately produces both — and a bit pattern makes the comparison exact for signed zero
// and for the payload of a NaN, neither of which a decimal round-trip preserves. The floats in `p`
// travel the same way, as 8-char hex patterns.
const chunks: Buffer[] = [];
for await (const c of process.stdin) chunks.push(c as Buffer);
const req = JSON.parse(Buffer.concat(chunks).toString("utf8")) as {
  module: string;
  cases: { p: string[]; m: string[]; s: string }[];
};

const mod = (await import(req.module)) as {
  rho: (p: Float32Array, m: Float64Array, s: number) => number;
};

const f64 = new Float64Array(1);
const f32 = new Float32Array(1);
const u32 = new Uint32Array(f32.buffer);
const bu = new BigUint64Array(f64.buffer);

const toF64 = (hex: string): number => {
  bu[0] = BigInt("0x" + hex);
  return f64[0]!;
};
const toF32 = (hex: string): number => {
  u32[0] = Number("0x" + hex);
  return f32[0]!;
};
const fromF64 = (v: number): string => {
  f64[0] = v;
  return bu[0]!.toString(16).padStart(16, "0");
};

const out: string[] = [];
for (const c of req.cases) {
  const p = new Float32Array(4);
  for (let i = 0; i < 4; i++) p[i] = toF32(c.p[i]!);
  const m = new Float64Array(8);
  for (let i = 0; i < 8; i++) m[i] = toF64(c.m[i]!);
  out.push(fromF64(mod.rho(p, m, toF64(c.s))));
}

process.stdout.write(JSON.stringify({ results: out, source: mod.rho.toString() }));
