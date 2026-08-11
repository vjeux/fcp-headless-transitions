// HGEquirectReorient_SetWrapTexture_driver.mts — the TypeScript side of the differential.
//
//     node --experimental-strip-types HGEquirectReorient_SetWrapTexture_driver.mts   # JSON in/out
//
// Runs the REAL `raw-port/src/render/HGEquirectReorient.ts`, and the mutants as real modules (the
// Python side writes each as a copy of that file with ONE token changed). The module imports
// nothing, so nothing here is stubbed and no resolve hook is needed: what runs is the file as
// committed.
//
// The observable is a FIELD, not a return value — this method returns void — so each case reports
// the receiver object after the call, and the Python side compares it against the byte the live
// binary wrote into the poisoned arena.
type Req = { modules: Record<string, string>; cases: { wrap: boolean }[] };

const chunks: Buffer[] = [];
for await (const c of process.stdin) chunks.push(c as Buffer);
const req = JSON.parse(Buffer.concat(chunks).toString("utf8")) as Req;

const answer: Record<string, unknown> = {};
for (const [name, path] of Object.entries(req.modules)) {
  const mod = await import(path);
  const fn = mod.HGEquirectReorient_SetWrapTexture as
    (self: { wrapTexture: number }, wrap: boolean) => void;
  const results: (number | string)[] = [];
  for (const c of req.cases) {
    // The receiver starts at a value the port must OVERWRITE, not leave alone: 0xCD, the same
    // poison the ctypes arena carries, so "the port never stored anything" is a visible answer
    // rather than an accidental match with 0.
    const self = { wrapTexture: 0xcd };
    try {
      fn(self, c.wrap);
      results.push(self.wrapTexture);
    } catch (e) {
      results.push("threw: " + (e as Error).message);
    }
  }
  answer[name] = { results, source: fn.toString() };
}
process.stdout.write(JSON.stringify(answer));
