// coremedia_worker.ts — evaluate the ported CoreMedia CMTime functions for the differential oracle.
//
// The generic worker marshals scalars and number[]; the CMTime family takes and returns a STRUCT
// by value, so it needs its own tiny worker. This one imports the REAL ported module and calls the
// REAL exported function — it never re-implements anything, so a wrong port produces a wrong
// struct and the oracle diverges, and a throw-shell produces {ok:false} which the oracle counts as
// a hard failure.
//
// Protocol (line JSON):
//   stdin:  {"modulePath":"<abs .ts>","fn":"CMTimeMultiplyByFloat64","t":{...},"arg":2.0}
//   stdout: "READY" once, then {"ok":true,"r":{value,timescale,flags,epoch}}
//           | {"ok":true,"n":<num|null>,"nbits":"<16 hex, little-endian IEEE754>"}
//           | {"ok":false,"error":"..."}
//
// `value` and `epoch` cross the wire as STRINGS because they are int64: JSON numbers are doubles
// and would silently lose the high bits of exactly the overflow cases this oracle exists to check.
//
// A Float64 RETURN has the mirror-image problem, and it cost a full unit before it was found:
// `JSON.stringify(NaN)` is `null`, as is +/-Infinity. CMTimeGetSeconds returns NaN for an invalid
// or indefinite time and +/-Infinity for an infinite one — i.e. for 3 of the 11 times in the
// oracle's own grid the CORRECT answer is the one value the transport cannot express, the oracle
// read `null`, and it scored the case as a divergence NO port could clear. Worse than a stuck
// case: a port that wrongly returned a finite number for an invalid time scored BETTER than a
// correct one, so the harness actively rewarded the wrong model. Scalars therefore also cross as
// `nbits`, the raw IEEE754 pattern in hex, which is exact for every double including the
// non-finite ones. `n` is still sent for any older reader, and is still `null` for those cases.

import readline from 'node:readline';

const bitsOf = (x: number): string => {
  const b = new DataView(new ArrayBuffer(8));
  b.setFloat64(0, x, true);
  return [...new Uint8Array(b.buffer)].map((v) => v.toString(16).padStart(2, '0')).join('');
};

const cache = new Map<string, any>();
async function load(p: string): Promise<any> {
  if (!cache.has(p)) cache.set(p, await import('file://' + p));
  return cache.get(p);
}

const toTS = (o: any) => ({
  value: BigInt(o.value), timescale: Number(o.timescale),
  flags: Number(o.flags), epoch: BigInt(o.epoch ?? 0),
});
const fromTS = (r: any) => ({
  value: String(r.value), timescale: Number(r.timescale),
  flags: Number(r.flags), epoch: String(r.epoch ?? 0),
});

process.stdout.write('READY\n');
const rl = readline.createInterface({ input: process.stdin });
for await (const line of rl) {
  if (!line.trim()) continue;
  let out: any;
  try {
    const req = JSON.parse(line);
    const mod = await load(req.modulePath);
    const fn = mod[req.fn];
    if (typeof fn !== 'function') throw new Error(`export ${req.fn} not found`);
    const a = toTS(req.t);
    const r = req.b !== undefined ? fn(a, toTS(req.b))
            : req.arg !== undefined ? fn(a, req.arg)
            : fn(a);
    out = (r && typeof r === 'object' && 'timescale' in r)
        ? { ok: true, r: fromTS(r) }
        : typeof r === 'bigint' ? { ok: true, n: String(r) }
        : { ok: true, n: r, nbits: bitsOf(r as number) };
  } catch (e: any) {
    out = { ok: false, error: String(e?.message ?? e) };
  }
  process.stdout.write(JSON.stringify(out) + '\n');
}
