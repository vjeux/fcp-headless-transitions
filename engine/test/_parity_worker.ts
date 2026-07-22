// fct.parity TS worker — evaluate ONE ported TS function in isolation and return its
// exact numeric output, so it can be compared against the real FCP function (called via
// dlsym in fct/parity/oracle.py). This is the TypeScript half of the SUBSYSTEM PARITY
// oracle (see fct/parity/README.md).
//
// Protocol (line-oriented JSON, one request per line — same spirit as
// engine/test/_fct_render_motr_worker.ts, but for pure functions not renders):
//   stdin:  {"fn": "<registry id>", "args": {...}}\n
//   stdout: "READY\n" once; then {"ok": true, "outputs": {...}}\n
//           or {"ok": false, "error": "<msg>"}\n  per request.
//
// A `fn` here is a PORTED FUNCTION exposed via the FUNCTIONS table below. The table maps a
// registry id (matching fct/parity/registry.json) to a closure (args) => outputs. Keep
// each closure a THIN wrapper that calls the ACTUAL engine source (imported from
// ../src/...), never a re-implementation — the whole point is to test the real port.

import readline from 'node:readline';
import { easeInOut, cubicBezier, solveBezierParam } from '../src/evaluator/curves.js';
import { gaussianDecimation } from '../src/compositor/filters/gaussian-blur.js';

type Args = Record<string, number | number[]>;
type Outputs = Record<string, number>;
type Fn = (a: Args) => Outputs;

// ---------------------------------------------------------------------------------------
// FUNCTIONS: registry id -> thin wrapper around the real engine source.
// Each MUST return the same named outputs the oracle registry lists for that id.
// ---------------------------------------------------------------------------------------
const FUNCTIONS: Record<string, Fn> = {
  // PCMath::easeInOut(t, easeIn, easeOut, v0, v1) -> {outVal, outDeriv}
  // FCP CONTRACT (from ProCore disasm __ZN6PCMath9easeInOutEdddddPdS0_): `t` is a VALUE in
  // [v0,v1]; FCP normalizes frac=(t-v0)/(v1-v0), eases it, and remaps outVal=v0+(v1-v0)*eased.
  // The engine's easeInOut (curves.ts) is exactly the CORE eased-fraction function — it is
  // always called with a pre-normalized u (v0=0,v1=1) inside the curve evaluator. So the
  // faithful port of the FULL FCP function is: normalize -> engine.easeInOut -> remap. We
  // compose it here (using the REAL engine core) to test the whole contract across any (v0,v1).
  'PCMath_easeInOut': (a) => {
    const t = a.t as number, ei = a.easeIn as number, eo = a.easeOut as number;
    const v0 = a.v0 as number, v1 = a.v1 as number;
    const span = v1 - v0;
    const frac = span !== 0 ? (t - v0) / span : 0;
    const eased = easeInOut(frac, ei, eo);
    const outVal = v0 + span * eased;
    return { outVal };
  },

  // OZBezierEval(ctrl[4], u) -> value. TS analogue: cubicBezier(u, p0,p1,p2,p3).
  'OZBezierEval': (a) => {
    const c = a.ctrl as number[]; const u = a.u as number;
    return { ret: cubicBezier(u, c[0], c[1], c[2], c[3]) };
  },

  // OZBezierFindParameter(tctrl[4], t) -> u. TS analogue: solveBezierParam(t, t0..t3).
  'OZBezierFindParameter': (a) => {
    const c = a.tctrl as number[]; const t = a.t as number;
    return { ret: solveBezierParam(t, c[0], c[1], c[2], c[3]) };
  },

  // HGBlur::GetDecimation(radius) -> decimation level. TS: gaussianDecimation(radius).
  // The blur subsystem's decimation-level choice (a large blur is decimated 2^level,
  // blurred small, upsampled). Exact integer function; verified vs the real Helium symbol.
  'HGBlur_GetDecimation': (a) => {
    return { ret: gaussianDecimation(a.radius as number) };
  },
};

const rl = readline.createInterface({ input: process.stdin });
process.stdout.write('READY\n');
rl.on('line', (line: string) => {
  const s = line.trim();
  if (s === '' ) return;
  if (s === 'QUIT') { process.exit(0); }
  try {
    const req = JSON.parse(s);
    const fn = FUNCTIONS[req.fn];
    if (!fn) { process.stdout.write(JSON.stringify({ ok: false, error: 'unknown fn ' + req.fn }) + '\n'); return; }
    const outputs = fn(req.args || {});
    process.stdout.write(JSON.stringify({ ok: true, outputs }) + '\n');
  } catch (e: any) {
    process.stdout.write(JSON.stringify({ ok: false, error: String(e && e.message || e) }) + '\n');
  }
});
