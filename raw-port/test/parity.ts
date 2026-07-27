// parity.ts — compare raw-port's parsed node tree vs the engine parser, per transition.
// Common ground: the layer-tree ID + NAME hierarchy (the structural skeleton both agree on).
// Reports, per .motr: engine layer-node count vs raw-port count, and the set-diff of node IDs.
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { parseScene } from "../src/parseScene.js";
import { OZGroup } from "../src/nodes/OZGroup.js";
import { OZSceneNode } from "../src/nodes/OZSceneNode.js";
// engine parser
import { parseMotr } from "../../engine/src/parser/index.js";
import type { Layer } from "../../engine/src/types.js";

const ROOT = "/Applications/Final Cut Pro.app/Contents/PlugIns/MediaProviders/MotionEffect.fxp/Contents/Resources/PETemplates.localized/Transitions.localized";
function findMotr(dir: string, out: string[]): void {
  for (const e of readdirSync(dir)) { const p = join(dir, e); if (statSync(p).isDirectory()) findMotr(p, out); else if (e.endsWith(".motr")) out.push(p); }
}
function rawIds(n: OZSceneNode, s: Set<number>): void { s.add(n.id); for (const c of n.childNodes) rawIds(c, s); }
function engIds(l: Layer, s: Set<number>): void { s.add(l.id); for (const c of l.children) engIds(c, s); }

const files: string[] = []; findMotr(ROOT, files);
let matchN = 0; const rows: string[] = [];
for (const f of files) {
  const name = f.split("/").slice(-1)[0].replace(".motr", "");
  let engS = new Set<number>(), rawS = new Set<number>();
  try { const eng = parseMotr(readFileSync(f, "utf8")); for (const l of eng.layers) engIds(l, engS); } catch (e) { rows.push(`${name}: ENGINE-THROW ${(e as Error).message}`); continue; }
  try { const raw = parseScene(readFileSync(f, "utf8")); for (const l of raw.layers) rawIds(l, rawS); } catch (e) { rows.push(`${name}: RAW-THROW ${(e as Error).message}`); continue; }
  const onlyEng = [...engS].filter(x => !rawS.has(x));
  const onlyRaw = [...rawS].filter(x => !engS.has(x));
  if (onlyEng.length === 0 && onlyRaw.length === 0) matchN++;
  else rows.push(`${name}: eng=${engS.size} raw=${rawS.size} onlyEng=${onlyEng.length} onlyRaw=${onlyRaw.length}`);
}
console.log(`node-ID-set parity: ${matchN}/${files.length} exact match`);
for (const r of rows.slice(0, 30)) console.log("  ", r);
