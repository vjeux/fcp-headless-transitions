// PCQuat_double_setRotation_driver.mts — the TypeScript side of the PCQuat<double>
// setRotation differential.
//
//     node --experimental-strip-types PCQuat_double_setRotation_driver.mts
//
// Two design points that matter for the verdict:
//
//   * DOUBLES CROSS THE WIRE AS RAW 64-BIT PATTERNS, never as JSON numbers. JSON cannot
//     carry NaN or Infinity at all (Python's json.dump emits bare `NaN`, which
//     JSON.parse rejects), and a decimal round-trip would also blur signed zero — both
//     of which this corpus deliberately contains. Bits in, bits out, rebuilt through a
//     DataView, which is also what makes the comparison bit-exact rather than
//     value-equal.
//
//   * THE MUTANTS ARE REAL MODULES, not restatements. The Python side writes each
//     control as a copy of the actual ported file with ONE token changed and passes its
//     path here; this driver imports them exactly as it imports the port. A control that
//     is a hand-written paraphrase can drift from the port and quietly stop testing it —
//     this one cannot.

const chunks: Buffer[] = [];
for await (const c of process.stdin) chunks.push(c as Buffer);
const req = JSON.parse(Buffer.concat(chunks).toString("utf8")) as {
  cases: { a: number[]; b: number[]; tol: number }[];
  port: string;
  mutants: Record<string, string>;
};

const scratch = new DataView(new ArrayBuffer(8));
/** Rebuild a double from the u64 bit pattern the Python side sent. */
function fromBits(u: number | string): number {
  scratch.setBigUint64(0, BigInt(u), true);
  return scratch.getFloat64(0, true);
}
/** The u64 bit pattern of a double, as a decimal string (JSON has no u64). */
function toBits(x: number): string {
  scratch.setFloat64(0, x, true);
  return scratch.getBigUint64(0, true).toString();
}

type SetRotation = (
  self: number[],
  a: number[],
  b: number[],
  tol: number,
) => unknown;

async function run(modulePath: string): Promise<string[][]> {
  const mod = await import(modulePath);
  const fn = mod.PCQuat_double_setRotation as SetRotation;
  const out: string[][] = [];
  for (const c of req.cases) {
    // The same poisoned receiver the Python side hands the binary, so "did it write all
    // four lanes" is the same question on both sides.
    const q = [-1.5e300, -1.5e300, -1.5e300, -1.5e300];
    fn(q, c.a.map(fromBits), c.b.map(fromBits), fromBits(c.tol));
    out.push(q.map(toBits));
  }
  return out;
}

const port = await run(req.port);
const mutants: Record<string, string[][]> = {};
for (const [name, path] of Object.entries(req.mutants)) mutants[name] = await run(path);

process.stdout.write(JSON.stringify({ port, mutants }));
