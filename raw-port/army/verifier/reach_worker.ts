// reach_worker.ts — INCOMPLETENESS-REACHABILITY fuzzer for Tier-3 (non-callable) ports.
//
// The executable differential oracle (diff_oracle.py) proves a CALLABLE symbol's port is
// bit-exact vs live FCP. But many functions (vtable dispatchers, ObjC boundaries) can't be
// called in isolation. For those, the un-gameable question is: **does the port actually
// implement its behavior, or does it defer to throw-stubs?**
//
// This worker imports the ported module and calls the export across a FUZZ GRID of its
// declared parameters. If ANY reachable input causes an INCOMPLETENESS throw
// (/not yet transcribed|pending|unimpl|TODO|stub/i), the port has an unimplemented path
// that the real function does NOT have -> it is a SKELETON, not a real port.
//
// Why un-gameable: to pass, no reachable input may hit an incompleteness throw. A worker
// cannot hide the throw behind an unreachable branch when the branch predicate is one of
// the function's own parameters (the fuzzer sets it). Swallowing the throw (try/catch{}) is
// banned by provenance_gate P5 and caught by the reviewer. Renaming the throw to hide the
// keyword = claiming a real trap not in the disasm = a different, reviewer-catchable lie.
//
// Protocol (single request): stdin {"modulePath","exportName","params":[{type},...]}
//   stdout: {"ok":true,"calls":N,"incompleteHits":M,"samples":[...],"otherThrows":K}
//
// verdict is decided by the Python caller: incompleteHits>0 => INCOMPLETE (reject).

import readline from 'node:readline';

const INCOMPLETE = /not yet transcribed|pending transcription|unimplemented|\bunimpl\b|\bTODO\b|not transcribed|stub not|frontier callee/i;

function grid(type: string): any[] {
  const t = (type || '').toLowerCase();
  if (t === 'boolean') return [true, false];
  if (t === 'number') return [0, 1, -1, 0.5, 2, -2, 100, -100, 1e-9];
  if (t.includes('number[]') || t.includes('float64array') || t.includes('array<number>'))
    return [[0,0,0,0], [1,1,1,1], [0,0.33,0.66,1], [-5,3,-2,7], []];
  if (t === 'string') return ['', 'x', 'FFActiveToolFolder'];
  // unknown / object / CMTime / class refs / anything else: try several object shapes + null
  return [null, undefined, {}, {value:0, timescale:600, flags:1, epoch:0},
          {value:600, timescale:600, flags:1, epoch:0}, 0, [] as any[]];
}

function cartesian(arrs: any[][], cap: number): any[][] {
  let out: any[][] = [[]];
  for (const a of arrs) {
    const next: any[][] = [];
    for (const combo of out) for (const v of a) {
      next.push([...combo, v]);
      if (next.length >= cap) break;
    }
    out = next;
    if (out.length >= cap) { out = out.slice(0, cap); }
  }
  return out;
}

const rl = readline.createInterface({ input: process.stdin });
process.stdout.write('READY\n');
rl.on('line', async (line: string) => {
  const s = line.trim();
  if (s === '') return;
  if (s === 'QUIT') process.exit(0);
  try {
    const req = JSON.parse(s);
    const mod = await import('file://' + req.modulePath);
    const fn = mod[req.exportName];
    if (typeof fn !== 'function') {
      process.stdout.write(JSON.stringify({ ok: false, error: 'not a function: ' + req.exportName }) + '\n');
      return;
    }
    const params: { type: string }[] = req.params || [];
    const grids = params.map(p => grid(p.type));
    const combos = cartesian(grids, req.cap || 512);
    let calls = 0, incompleteHits = 0, otherThrows = 0;
    const samples: string[] = [];
    for (const combo of combos) {
      calls++;
      try {
        fn(...combo);
      } catch (e: any) {
        const msg = String((e && e.message) || e);
        if (INCOMPLETE.test(msg)) {
          incompleteHits++;
          if (samples.length < 5) samples.push(msg.slice(0, 160));
        } else {
          otherThrows++;
        }
      }
    }
    process.stdout.write(JSON.stringify({ ok: true, calls, incompleteHits, otherThrows, samples }) + '\n');
  } catch (e: any) {
    process.stdout.write(JSON.stringify({ ok: false, error: String((e && e.message) || e) }) + '\n');
  }
});
