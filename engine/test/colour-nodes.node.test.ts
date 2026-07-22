/**
 * FOCUSED PER-NODE colour validation — one FCP node at a time, FCP-free + fast.
 *
 * WHY: the 65-slug full-frame PSNR gate is GEOMETRY-DOMINATED and conflates independent
 * effects, so it misleads pointwise-colour decode work (a transfer-VERIFIED colour change
 * can move a geometry-heavy host the wrong way because the colour delta is dwarfed by and
 * entangled with sprite/composite error). This test validates each colour node in ISOLATION
 * against REAL HEADLESS FCP output: it feeds uniform-colour inputs through the engine's
 * registered filter and asserts the center pixel matches FCP's captured oracle value.
 *
 * The golden data (engine/test/fixtures/headless_colour_golden.json) is frozen from the
 * fct/parity transfer reports — every `oracle` value is a REAL headless-FCP render of that
 * (uniform input, params) combo. Regenerate with `python3 -m fct.parity.export_golden` after
 * a re-sweep. This test needs NO FCP and runs in milliseconds, so it's the fast inner loop
 * for node decode; `fct parity` remains the authoritative live-FCP re-verification.
 */
if (typeof globalThis.ImageData === 'undefined') {
  (globalThis as any).ImageData = class ImageData {
    data: any; width: number; height: number;
    constructor(d: any, w: number, h?: number) { this.data = d; this.width = w; this.height = h ?? (d.length / 4 / w); }
  };
}
import fs from 'node:fs';
import path from 'node:path';
import { lookupFilter, makeContext } from '../src/compositor/filters/registry.js';
import '../src/compositor/filters/index.js'; // register all filters
import type { Filter } from '../src/types.js';

const GOLDEN = path.resolve(import.meta.dirname, 'fixtures/headless_colour_golden.json');
const golden: Record<string, {
  uuid: string; pluginName: string; engine_env: Record<string, string>;
  tol_levels: number; verified: boolean; n: number;
  cases: { params: any[]; input: number[]; oracle: number[] }[];
}> = JSON.parse(fs.readFileSync(GOLDEN, 'utf-8'));

const PATCH = 8; // small uniform patch; center pixel is read back

function makeUniform(rgb: number[]): ImageData {
  const d = new Uint8ClampedArray(PATCH * PATCH * 4);
  for (let i = 0; i < d.length; i += 4) { d[i] = rgb[0]; d[i + 1] = rgb[1]; d[i + 2] = rgb[2]; d[i + 3] = 255; }
  return new (globalThis as any).ImageData(d, PATCH, PATCH);
}

function runFilter(uuid: string, pluginName: string, params: any[], input: number[]): number[] {
  const filter: Filter = { id: 1, name: pluginName, pluginName, pluginUUID: uuid, parameters: params };
  const mod = lookupFilter(filter);
  if (!mod) throw new Error(`no registered filter for uuid ${uuid} (${pluginName})`);
  const img = makeUniform(input);
  const ctx = makeContext(filter, 0, img.width, img.height);
  const out = mod.apply(img, ctx);
  const c = (PATCH / 2) * PATCH * 4 + (PATCH / 2) * 4; // center pixel offset
  return [out.data[c], out.data[c + 1], out.data[c + 2]];
}

let totalPass = 0, totalFail = 0, verifiedFail = 0;
const summary: string[] = [];

// Optional single-node filter: `tsx test/colour-nodes.node.test.ts <substr>` runs only
// nodes whose id contains <substr> (fast inner loop — don't run the whole suite each time).
const filterArg = process.argv[2];
const entries = Object.entries(golden).filter(([id]) => !filterArg || id.includes(filterArg));
if (filterArg && entries.length === 0) {
  console.error(`no golden node matches ${JSON.stringify(filterArg)}; have: ${Object.keys(golden).join(', ')}`);
  process.exit(2);
}

for (const [nodeId, node] of entries) {
  // Apply the node's decoded-path env flags for this node's cases.
  const savedEnv: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(node.engine_env || {})) { savedEnv[k] = process.env[k]; process.env[k] = v; }

  let pass = 0, fail = 0, worst = 0;
  let worstCase: any = null;
  for (const c of node.cases) {
    let got: number[];
    try {
      got = runFilter(node.uuid, node.pluginName, c.params, c.input);
    } catch (e: any) {
      fail++; if (fail <= 3) summary.push(`    ERROR ${nodeId} in=${JSON.stringify(c.input)}: ${e.message}`);
      continue;
    }
    let maxErr = 0;
    for (let k = 0; k < 3; k++) maxErr = Math.max(maxErr, Math.abs(got[k] - c.oracle[k]));
    if (maxErr <= node.tol_levels) pass++;
    else { fail++; if (maxErr > worst) { worst = maxErr; worstCase = { input: c.input, oracle: c.oracle, got }; } }
  }
  totalPass += pass; totalFail += fail;
  // VERIFIED nodes must match headless within tol (a fail is a real regression). Non-verified
  // nodes are COVERAGE-ONLY: they record the current per-node parity vs headless FCP (a known
  // divergence pending decode/ship) and never fail the run — the point is coverage, not a gate.
  const clean = fail === 0;
  const status = node.verified ? (clean ? 'PASS' : 'REGRESS') : (clean ? 'PASS' : 'DIVERGE');
  if (node.verified && !clean) verifiedFail += fail;
  summary.push(`  [${status}] ${nodeId}${node.verified ? '' : ' (coverage)'}: ${pass}/${node.n} within ${node.tol_levels} levels` +
    (fail ? ` — worst Δ${worst.toFixed(1)} @ in=${JSON.stringify(worstCase?.input)} oracle=${JSON.stringify(worstCase?.oracle)} got=${JSON.stringify(worstCase?.got)}` : ''));

  for (const [k, v] of Object.entries(savedEnv)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; }
}

console.log('COLOUR NODE PARITY vs REAL HEADLESS FCP (isolated, FCP-free golden):');
for (const line of summary) console.log(line);
console.log(`\n${totalPass} passed, ${totalFail} diverged (${entries.length} nodes; ${verifiedFail} VERIFIED-node regressions)`);
// Only fail the run on a VERIFIED-node regression; coverage-only divergences are expected.
if (verifiedFail > 0) process.exit(1);
