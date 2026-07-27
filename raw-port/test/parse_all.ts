// parse_all.ts — parse every shipped .motr with raw-port; report success/element/node/channel counts.
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { parseScene } from "../src/parseScene.js";
import { OZGroup } from "../src/nodes/OZGroup.js";
import { OZSceneNode } from "../src/nodes/OZSceneNode.js";
const ROOT = "/Applications/Final Cut Pro.app/Contents/PlugIns/MediaProviders/MotionEffect.fxp/Contents/Resources/PETemplates.localized/Transitions.localized";
function findMotr(dir: string, out: string[]): void {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) findMotr(p, out);
    else if (e.endsWith(".motr")) out.push(p);
  }
}
const files: string[] = []; findMotr(ROOT, files);
let ok = 0, fail = 0; const errs: string[] = [];
function countNodes(n: OZSceneNode): number { let t = 1; if (n instanceof OZGroup) for (const c of n.childNodes) t += countNodes(c); return t; }
for (const f of files) {
  try {
    const sc = parseScene(readFileSync(f, "utf8"));
    const nodes = sc.layers.reduce((a, l) => a + countNodes(l), 0);
    if (sc.layers.length === 0) { fail++; errs.push(`${f.split("/").pop()}: 0 layers`); }
    else ok++;
  } catch (err) { fail++; errs.push(`${f.split("/").pop()}: ${(err as Error).message}`); }
}
console.log(`parsed ${files.length} .motr:  OK=${ok}  FAIL=${fail}`);
for (const e of errs.slice(0, 20)) console.log("  FAIL", e);
