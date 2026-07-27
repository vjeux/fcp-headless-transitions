import { readFileSync } from "fs";
import { parseScene } from "../src/parseScene.js";
import { OZGroup } from "../src/nodes/OZGroup.js";
import { OZSceneNode } from "../src/nodes/OZSceneNode.js";
import { OZChannelFolder } from "../src/channels/OZChannelFolder.js";
import { OZChannelBase } from "../src/channels/OZChannelBase.js";
const scene = parseScene(readFileSync(process.argv[2], "utf8"));
function find(n: OZSceneNode, name: string): OZSceneNode | undefined {
  if (n.name === name) return n;
  if (n instanceof OZGroup) for (const c of n.childNodes) { const r = find(c, name); if (r) return r; }
  return undefined;
}
function dump(c: OZChannelBase, d: number): void {
  const val = (c as any).value, def = (c as any).defaultValue;
  console.log(`${"  ".repeat(d)}param#${c.id} "${c.name}" fid=${c.factoryID}${val!==undefined?` value=${val}`:""}${def!==undefined?` default=${def}`:""}`);
  if (c instanceof OZChannelFolder && d < 4) for (const ch of c.children) dump(ch, d + 1);
}
for (const nm of ["Transition A", "Color Solid"]) {
  const n = scene.layers.map(l => find(l, nm)).find(Boolean);
  console.log(`\n=== ${nm}: ${n?.channels.length ?? 0} channel roots ===`);
  if (n) for (const ch of n.channels) dump(ch, 0);
}
