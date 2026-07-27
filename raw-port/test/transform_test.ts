// Read the Transform channel (Properties=1 > Transform=100) for a node, faithfully.
import { readFileSync } from "fs";
import { parseScene } from "../src/parseScene.js";
import { OZSceneNode } from "../src/nodes/OZSceneNode.js";
import { OZChannelFolder } from "../src/channels/OZChannelFolder.js";
import { OZChannel } from "../src/channels/OZChannel.js";
import { OZChannelBase } from "../src/channels/OZChannelBase.js";
const sc = parseScene(readFileSync(process.argv[2], "utf8"));
function find(nodes: OZSceneNode[], name: string): OZSceneNode | undefined {
  for (const n of nodes) { if (n.name === name) return n; const r = find(n.childNodes, name); if (r) return r; }
  return undefined;
}
function get(c: OZChannelBase | undefined, id: number): OZChannelBase | undefined {
  return c instanceof OZChannelFolder ? c.children.find(x => x.id === id) : undefined;
}
const n = find(sc.layers, process.argv[3] ?? "Color Solid");
console.log("node:", n?.name, "channels:", n?.channels.length);
const props = n?.channels.find(c => c.id === 1); // Properties
const xf = get(props, 100); // Transform
console.log("Transform folder:", xf?.name);
for (const grp of (xf as OZChannelFolder)?.children ?? []) {
  const vals = (grp as OZChannelFolder).children?.map(a => {
    const v = (a as OZChannel).value; const d = (a as OZChannel).defaultValue;
    return `${a.name}=${v ?? d ?? "?"}`;
  }).join(" ");
  console.log(`  ${grp.name}(${grp.id}): ${vals ?? ""}`);
}
