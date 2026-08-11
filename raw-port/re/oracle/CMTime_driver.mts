// CMTime_driver.mts — the TypeScript side of the CMTimeMultiply differential.
//
//     node --experimental-strip-types CMTime_driver.mts     # JSON in, JSON out
//
// Imports the REAL ported module, and the MUTANTS as real modules too (the Python side
// writes each one as a copy of the actual file with a single token changed), so no
// control here is a paraphrase that could drift from the port.
//
// int64 fields cross the wire as decimal STRINGS, never JSON numbers: CMTime.value and
// .epoch are int64 and the interesting cases sit at INT64_MAX, which JSON.parse would
// silently round to 9223372036854775808.

const chunks: Buffer[] = [];
for await (const c of process.stdin) chunks.push(c as Buffer);
const req = JSON.parse(Buffer.concat(chunks).toString("utf8")) as {
  cases: {
    value: string; timescale: number; flags: number; epoch: string; multiplier: number;
  }[];
  port: string;
  mutants: Record<string, string>;
};

type CMTimeLike = { value: bigint; timescale: number; flags: number; epoch: bigint };
type Outcome =
  | { threw: true; message: string }
  | { threw: false; result: { value: string; timescale: number; flags: number; epoch: string } };

async function run(modulePath: string): Promise<Outcome[]> {
  const mod = await import(modulePath);
  const fn = mod.CMTimeMultiply as (t: CMTimeLike, m: number) => CMTimeLike;
  return req.cases.map((c) => {
    try {
      const r = fn(
        {
          value: BigInt(c.value),
          timescale: c.timescale,
          flags: c.flags,
          epoch: BigInt(c.epoch),
        },
        c.multiplier,
      );
      return {
        threw: false,
        result: {
          value: r.value.toString(),
          timescale: r.timescale,
          flags: r.flags,
          epoch: r.epoch.toString(),
        },
      };
    } catch (e) {
      return { threw: true, message: String((e as Error).message).slice(0, 120) };
    }
  });
}

const port = await run(req.port);
const mutants: Record<string, Outcome[]> = {};
for (const [name, path] of Object.entries(req.mutants)) mutants[name] = await run(path);

process.stdout.write(JSON.stringify({ port, mutants }));
