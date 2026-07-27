import { readFileSync } from "fs";
import { parseScene } from "../src/parseScene.js";
import { OZSceneNode } from "../src/nodes/OZSceneNode.js";
import { readTransform } from "../src/channels/readTransform.js";
const sc = parseScene(readFileSync(process.argv[2], "utf8"));
function find(ns: OZSceneNode[], nm: string): OZSceneNode | undefined { for (const n of ns) { if (n.name === nm) return n; const r = find(n.childNodes, nm); if (r) return r; } }
const n = find(sc.layers, "Color Solid")!;
const props = n.channels.find(c => c.id === 1);
for (const t of [0, 0.367, 0.734, 1.251, 1.768]) {
  const xf = readTransform(props, t);
  console.log(`t=${t}: Position.Z=${xf.position.z.toFixed(2)}`);
}
// expected: t=0 -> 960; t=0.734 -> -449.43; t=1.768 -> 960; t=0.367 -> ~255 (mid of 960..-449); t=1.251 -> ~255
