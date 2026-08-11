// HgcYUV420BiPlanar_chroma_SetParameter_driver.mts — the TypeScript side of the differential.
//
//     node --experimental-strip-types HgcYUV420BiPlanar_chroma_SetParameter_driver.mts
//
// Runs the REAL `raw-port/src/render/HgcYUV420BiPlanar_chroma.ts`, and the mutants as real modules
// (the Python side writes each as a copy of that file with ONE token changed), so nothing here is a
// paraphrase that could drift from the port. That module imports nothing, so — unlike most ports in
// this tree — it needs no resolve hook and NOTHING is stubbed: what runs is the file as committed.
type Req = { modules: Record<string, string>; cases: { key: number; f: number[] }[] };

const chunks: Buffer[] = [];
for await (const c of process.stdin) chunks.push(c as Buffer);
const req = JSON.parse(Buffer.concat(chunks).toString("utf8")) as Req;

// Floats cross the wire as raw u32 BIT PATTERNS, never as JSON numbers: the corpus contains NaN and
// +/-Infinity, which JSON cannot carry, and -0.0, which it silently turns into 0.
const f32 = (bits: number): number => {
  const b = new DataView(new ArrayBuffer(4));
  b.setUint32(0, bits >>> 0);
  return b.getFloat32(0);
};

const answer: Record<string, unknown> = {};
for (const [name, path] of Object.entries(req.modules)) {
  const mod = await import(path);
  const fn = mod.HgcYUV420BiPlanar_chroma_SetParameter as
    (self: unknown, key: number, a: number, b: number, c: number, d: number) => number;
  const results: (number | string)[] = [];
  for (const c of req.cases) {
    try {
      // `self` is null on this side deliberately: the port must not touch it, and the live side
      // proves the same thing by passing a poisoned buffer and diffing it afterwards.
      // NO `| 0` HERE, and it is not a style point: an int32 coercion on this side would
      // normalise the port's answer with the very operation under test, so a port returning the
      // UNSIGNED 4294967295 for `movl $0xffffffff,%eax` would print as -1 and agree. Measured
      // exactly that way first: with `| 0` the M2 mutant scored 0 kills of 24, i.e. the control
      // that exists to catch the signed/unsigned misreading could not fire. The value is sent
      // verbatim and compared verbatim.
      results.push(fn(null, c.key, f32(c.f[0]), f32(c.f[1]), f32(c.f[2]), f32(c.f[3])));
    } catch (e) {
      results.push("threw: " + (e as Error).message);
    }
  }
  answer[name] = { results, source: fn.toString() };
}
process.stdout.write(JSON.stringify(answer));
