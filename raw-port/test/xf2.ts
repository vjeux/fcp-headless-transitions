import { readFileSync } from "fs";
import { parseScene } from "../src/parseScene.js";
import { OZSceneNode } from "../src/nodes/OZSceneNode.js";
import { readTransform } from "../src/channels/readTransform.js";
const sc = parseScene(readFileSync(process.argv[2], "utf8"));
function find(nodes: OZSceneNode[], name: string): OZSceneNode | undefined {
  for (const n of nodes) { if (n.name === name) return n; const r = find(n.childNodes, name); if (r) return r; } return undefined;
}
const n = find(sc.layers, process.argv[3]);
const props = n?.channels.find(c => c.id === 1);
console.log(process.argv[3], "transform @t=0.5:", JSON.stringify(readTransform(props, 0.5)));
