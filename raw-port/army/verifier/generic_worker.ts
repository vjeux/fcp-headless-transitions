// generic_worker.ts — a UNIVERSAL TS-port evaluator for the differential oracle.
//
// Unlike engine/test/_parity_worker.ts (a hand-maintained table of 6 wrappers), this worker
// takes { modulePath, exportName, args } and dynamically imports the ACTUAL ported function,
// calls it with the marshalled args, and returns its numeric output. This is what lets the
// executable oracle scale from 4 hand-coded nodes to thousands of ported symbols with ZERO
// per-symbol hand-coupling — the worker never re-implements anything; it calls the real port.
//
// Protocol (line JSON):
//   stdin:  {"modulePath":"<abs .js path>","exportName":"Foo","args":[...],"argKinds":[...]}\n
//   stdout: "READY\n" once; then {"ok":true,"ret":<number|number[]>,"outArgs":{...}}\n
//           or {"ok":false,"error":"<msg>"}\n per request.
//
// argKinds parallels args: "in"=scalar passed by value; "in_array"=number[] passed by ref
// (TS ports take arrays directly); "out_array"=an allocated number[] the port writes into
// (we pass a fresh array of the given length and read it back under outArgs[name]).
//
// The un-gameable property: a throw-shell port throws here -> {ok:false} -> the oracle records
// a HARD FAILURE (not a pass). A wrong port returns a wrong number -> the oracle DIVERGES.
// Only a port whose output equals the REAL FCP symbol's output on every fuzzed input passes.

import readline from 'node:readline';
import { pathToFileURL } from 'node:url';
import { isAbsolute, resolve } from 'node:path';

const cache = new Map<string, any>();

async function loadModule(p: string): Promise<any> {
  if (cache.has(p)) return cache.get(p);
  // pathToFileURL, not string concat: `'file://' + p` on a RELATIVE path yields file://raw-port/...
  // where "raw-port" parses as a URL HOST, which node rejects on macOS with
  //   File URL host must be "localhost" or empty on darwin
  // The driver then reports HARNESS_BROKEN. Same root cause as the relative-path bug in pr_gate
  // (#234) — this is the other half of it, and it is why G4 stayed dark even once the worker spawned.
  const url = pathToFileURL(isAbsolute(p) ? p : resolve(process.cwd(), p)).href;
  const m = await import(url);
  cache.set(p, m);
  return m;
}

const rl = readline.createInterface({ input: process.stdin });
process.stdout.write('READY\n');

rl.on('line', async (line: string) => {
  const s = line.trim();
  if (s === '') return;
  if (s === 'QUIT') { process.exit(0); }
  try {
    const req = JSON.parse(s);
    const mod = await loadModule(req.modulePath);
    const fn = mod[req.exportName];
    if (typeof fn !== 'function') {
      process.stdout.write(JSON.stringify({ ok: false, error: 'export not a function: ' + req.exportName }) + '\n');
      return;
    }
    const argKinds: string[] = req.argKinds || req.args.map(() => 'in');
    const callArgs: any[] = [];
    const outRefs: { idx: number; name: string }[] = [];
    for (let i = 0; i < req.args.length; i++) {
      const kind = argKinds[i];
      const a = req.args[i];
      if (kind === 'out_array') {
        const len = typeof a === 'number' ? a : (Array.isArray(a) ? a.length : 0);
        const arr = new Array(len).fill(0);
        callArgs.push(arr);
        outRefs.push({ idx: i, name: 'arg' + i });
      } else {
        callArgs.push(a);
      }
    }
    const ret = fn(...callArgs);
    const outArgs: Record<string, any> = {};
    for (const r of outRefs) outArgs[r.name] = callArgs[r.idx];
    process.stdout.write(JSON.stringify({ ok: true, ret, outArgs }) + '\n');
  } catch (e: any) {
    process.stdout.write(JSON.stringify({ ok: false, error: String((e && e.message) || e) }) + '\n');
  }
});
