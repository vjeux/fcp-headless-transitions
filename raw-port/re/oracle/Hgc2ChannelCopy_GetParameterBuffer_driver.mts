// Hgc2ChannelCopy_GetParameterBuffer_driver.mts — the TypeScript side of the differential.
//
//     node --experimental-strip-types Hgc2ChannelCopy_GetParameterBuffer_driver.mts   # JSON in/out
//
// Runs the REAL `raw-port/src/shaders/Hgc2ChannelCopy.ts`, and the mutants as real modules (the
// Python side writes each as a copy of that file with ONE token changed). That module imports
// nothing, so no resolve hook and nothing stubbed: what runs is the file as committed.
//
// The live function returns a POINTER INTO the receiver, so the property under test is not a value
// but an IDENTITY: for index 0 the caller must get the node's own buffer, such that writing through
// it lands in the node. `identity` below is that check — a port returning a copy has identical
// contents and is wrong in the way the machine cannot be.
type Req = { modules: Record<string, string>; cases: { index: number }[] };

const chunks: Buffer[] = [];
for await (const c of process.stdin) chunks.push(c as Buffer);
const req = JSON.parse(Buffer.concat(chunks).toString("utf8")) as Req;

type Vec4 = [number, number, number, number];

const answer: Record<string, unknown> = {};
for (const [name, path] of Object.entries(req.modules)) {
  const mod = await import(path);
  const fn = mod.Hgc2ChannelCopy_GetParameterBuffer as
    (self: { paramBufferAt1a0: Vec4 }, index: number) => Vec4 | null;
  const results: ({ null: true } | { null: false; identity: boolean; wrote: boolean } | string)[] = [];
  for (const c of req.cases) {
    const self = { paramBufferAt1a0: [1, 2, 3, 4] as Vec4 };
    try {
      const got = fn(self, c.index);
      if (got === null || got === undefined) {
        results.push({ null: true });
      } else {
        const identity = got === self.paramBufferAt1a0;
        // ...and the consequence of identity, measured rather than asserted: a write through the
        // returned handle must be visible in the node, exactly as it is through the interior
        // pointer the machine returns.
        got[2] = 99;
        results.push({ null: false, identity, wrote: self.paramBufferAt1a0[2] === 99 });
      }
    } catch (e) {
      results.push("threw: " + (e as Error).message);
    }
  }
  answer[name] = { results, source: fn.toString() };
}
process.stdout.write(JSON.stringify(answer));
