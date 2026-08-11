// OZChanObjectRefWithPicker_setAllowsCyclicDependencies_driver.mts — the TypeScript side of the
// differential for `OZChanObjectRefWithPicker::setAllowsCyclicDependencies(bool)` @Ozone 0x3cc6b0.
//
// It imports the REAL ported class; no restatement of the port lives here or in the Python oracle.
// The oracle diffs the whole live arena after each call, so the comparable observation is
// "which byte changed, and to what" — this driver reports the same shape from the TypeScript.
//
// Protocol: JSON request on stdin, JSON reply on stdout.
//   in : {"cases":[{"value":true|false}, …]}
//   out: {"port":[Observation, …], "mutants":{"<name>":[Observation, …], …}}
// An Observation is {"changed": ["+0x9b:1", …]} — the sorted list of modelled byte slots the call
// wrote, with the value written. An empty list means the call wrote nothing.
//
// Run by raw-port/re/oracle/OZChanObjectRefWithPicker_setAllowsCyclicDependencies_oracle.py via
// raw-port/node_modules/.bin/tsx.
import { OZChanObjectRefWithPicker } from "../../src/ozone/OZChanObjectRefWithPicker.ts";

interface Case { value: boolean }
interface Observation { changed: string[] }

const req = JSON.parse(await new Promise<string>((resolve, reject) => {
  let buf = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (d) => (buf += d));
  process.stdin.on("end", () => resolve(buf));
  process.stdin.on("error", reject);
})) as { cases: Case[] };

// ---- the port itself --------------------------------------------------
// The class models exactly one byte slot, so the observation is that slot before/after.
const POISON = 0xcd; // the same byte the oracle fills the live arena with, so that WRITING ZERO
                     // is distinguishable from writing nothing at all.

const port: Observation[] = req.cases.map((c) => {
  const o = new OZChanObjectRefWithPicker();
  o.allowsCyclicDependencies_at_0x9b = POISON;
  const before = o.allowsCyclicDependencies_at_0x9b;
  o.setAllowsCyclicDependencies(c.value);
  const after = o.allowsCyclicDependencies_at_0x9b;
  return { changed: after === before ? [] : ["+0x9b:" + after] };
});

// ---- negative controls ------------------------------------------------
// Each writes into a shadow byte map so that a wrong OFFSET is observable in the same vocabulary
// the live arena diff speaks; the arena's pre-state is 0 at every modelled slot, as the live
// arena's +0x9a/+0x9b/+0x9c are set to 0 before each call.
type Mutant = (b: Record<string, number>, value: boolean) => void;
const mutants: Record<string, Mutant> = {
  // movb %sil, 0x9a(%rdi) — one byte low.
  writes_0x9a: (b, v) => { b["+0x9a"] = v ? 1 : 0; },
  // movb %sil, 0x9c(%rdi) — one byte high.
  writes_0x9c: (b, v) => { b["+0x9c"] = v ? 1 : 0; },
  // the flag inverted (a `xorb $1, %sil` the machine does not have).
  inverted: (b, v) => { b["+0x9b"] = v ? 0 : 1; },
  // "only ever set it" — the branch a defensive port might invent.
  only_sets: (b, v) => { if (v) b["+0x9b"] = 1; },
  // movw instead of movb — a two-byte store.
  writes_two_bytes: (b, v) => { b["+0x9b"] = v ? 1 : 0; b["+0x9c"] = 0; },
};

const out: Record<string, Observation[]> = {};
for (const [name, f] of Object.entries(mutants)) {
  out[name] = req.cases.map((c) => {
    const b: Record<string, number> = { "+0x9a": POISON, "+0x9b": POISON, "+0x9c": POISON };
    const before = { ...b };
    f(b, c.value);
    const changed = Object.keys(b).filter((k) => b[k] !== before[k]).sort()
      .map((k) => k + ":" + b[k]);
    return { changed };
  });
}

process.stdout.write(JSON.stringify({ port, mutants: out }));
