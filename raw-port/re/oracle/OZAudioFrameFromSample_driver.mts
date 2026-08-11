// OZAudioFrameFromSample_driver.mts — the TypeScript side of the differential.
//
//     node --experimental-strip-types OZAudioFrameFromSample_driver.mts
//
// Doubles cross the wire as raw 64-bit patterns in decimal STRING form: the corpus
// contains infinities, NaN and negative zero, none of which survive a JSON number
// (Python emits bare `NaN`/`Infinity`, which JSON.parse rejects outright, and -0 would
// come back as 0). Both outputs go back the same way, which is also what makes the
// comparison exact about the signed zero this unit's whole rejection is about.
//
// The mutants are the REAL ported file with one token changed, written by the Python
// side and imported here as their own modules.

const chunks: Buffer[] = [];
for await (const c of process.stdin) chunks.push(c as Buffer);
const req = JSON.parse(Buffer.concat(chunks).toString("utf8")) as {
  cases: { sample: string; rate: string; fps: number; ntsc: boolean }[];
  port: string;
  mutants: Record<string, string>;
};

const scratch = new DataView(new ArrayBuffer(8));
function fromBits(u: string): number {
  scratch.setBigUint64(0, BigInt(u), true);
  return scratch.getFloat64(0, true);
}
function toBits(x: number): string {
  scratch.setFloat64(0, x, true);
  return scratch.getBigUint64(0, true).toString();
}

type Fn = (
  sample: number,
  sampleRate: number,
  fps: number,
  ntsc: boolean,
  outRemainder: { value: number } | null,
) => number;

async function run(modulePath: string) {
  const mod = await import(modulePath);
  const fn = mod.OZAudioFrameFromSample as Fn;
  return req.cases.map((c) => {
    // Poisoned exactly like the ctypes side, so "did it write" is the same question.
    const out = { value: -1.5e300 };
    const ret = fn(fromBits(c.sample), fromBits(c.rate), c.fps, c.ntsc, out);
    return { ret: toBits(ret), rem: toBits(out.value) };
  });
}

const port = await run(req.port);
const mutants: Record<string, { ret: string; rem: string }[]> = {};
for (const [name, path] of Object.entries(req.mutants)) mutants[name] = await run(path);

process.stdout.write(JSON.stringify({ port, mutants }));
