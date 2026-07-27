import { readFileSync } from "fs";
import { parseScene } from "../src/parseScene.js";
import { OZGroup } from "../src/nodes/OZGroup.js";
import { OZSceneNode } from "../src/nodes/OZSceneNode.js";

const scene = parseScene(readFileSync(process.argv[2], "utf8"));
console.log("factories:", scene.factories.size, " settings:", JSON.stringify(scene.settings), " top-level layers:", scene.layers.length);
let total = 0;
function walk(n: OZSceneNode, d: number): void {
  total++;
  const kids = n instanceof OZGroup ? n.childNodes : [];
  if (d < 3) console.log(`${"  ".repeat(d)}#${n.id} "${n.name}" ${n.constructor.name} filters=${n.filters.length} behaviors=${n.behaviors.length} children=${kids.length}`);
  for (const c of kids) walk(c, d + 1);
}
for (const l of scene.layers) walk(l, 0);
console.log("total nodes:", total);
