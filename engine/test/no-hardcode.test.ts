/**
 * GENERIC ENGINE POLICY enforcement (see ~/fct-notes/GENERIC_ENGINE_POLICY.md).
 *
 * A scene-level detector that fires on exactly ONE of the 65 built-in transitions is
 * hardcoding a single transition, not building a generic primitive. This test parses
 * every built-in .motr, runs each registered detector, and FAILS if any detector
 * matches fewer than 2 transitions.
 *
 * When you add a new detect*() scene dispatcher in api.ts, register it here.
 */
import { parseMotr } from '../src/parser/index.js';
import { detect360Band } from '../src/compositor/transition360.js';
import {
  hasColorizeRemapRig,
  hasFilledShapeOverlay,
  hasStrokedMaskShape,
  hasReplicatorMaskReveal,
} from '../src/capabilities.js';
import { execSync } from 'node:child_process';
import fs from 'node:fs';

const TX = '/Applications/Final Cut Pro.app/Contents/PlugIns/MediaProviders/MotionEffect.fxp/Contents/Resources/PETemplates.localized/Transitions.localized';

// Every scene-level dispatch detector / capability probe used in api.ts + timemap.ts
// must be registered here. A probe firing on < MIN_FIRES transitions is a
// per-transition hardcode masquerading as a generic primitive.
const DETECTORS: Record<string, (scene: any) => unknown> = {
  detect360Band,
  hasColorizeRemapRig,
  hasFilledShapeOverlay,
  hasStrokedMaskShape,
  hasReplicatorMaskReveal,
};

const MIN_FIRES = 2; // a detector firing on <2 transitions is a per-transition hardcode

function main() {
  const motrs = execSync(`find "${TX}" -name '*.motr'`).toString().trim().split('\n').filter(Boolean);
  const counts: Record<string, string[]> = {};
  for (const name of Object.keys(DETECTORS)) counts[name] = [];
  for (const m of motrs) {
    let scene;
    try { scene = parseMotr(fs.readFileSync(m, 'utf-8')); } catch { continue; }
    for (const [name, fn] of Object.entries(DETECTORS)) {
      try { if (fn(scene)) counts[name].push(m.split('/').pop()!.replace('.motr', '')); } catch { /* ignore */ }
    }
  }
  let failed = false;
  for (const [name, hits] of Object.entries(counts)) {
    const ok = hits.length >= MIN_FIRES;
    console.error(`${ok ? 'OK  ' : 'FAIL'} ${name}: fires on ${hits.length} (${hits.join(', ')})`);
    if (!ok) failed = true;
  }
  if (failed) {
    console.error(`\nHARDCODE POLICY VIOLATION: a detector fires on < ${MIN_FIRES} transitions.`);
    console.error('Build generic primitives driven by .motr params instead of special-casing one transition.');
    process.exit(1);
  }
  console.error(`\nAll ${Object.keys(DETECTORS).length} scene detectors fire on >= ${MIN_FIRES} transitions. Policy OK.`);
}
main();
