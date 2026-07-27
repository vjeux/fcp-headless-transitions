// smoke.ts — load a real .motr and dump the element tree's scope/type assignment for spot-checking.
import { readFileSync } from "fs";
import { readMotrToElementTree } from "../src/infra/readScene.js";
import { PCStreamElement } from "../src/infra/PCStreamElement.js";

const path = process.argv[2];
const xml = readFileSync(path, "utf8");
const root = readMotrToElementTree(xml);

let n = 0;
function count(e: PCStreamElement): void { n++; for (const c of e.children) count(c); }
count(root);
console.log(`root <${root.tagName}> scope=${root.scope} type=${root.type}  total elements=${n}`);

// show the first few scenenodes + their resolved id/factoryID/name attributes
let shown = 0;
function show(e: PCStreamElement, depth: number): void {
  if (["scenenode", "group", "layer", "footage", "clip", "sceneSettings"].includes(e.tagName) && shown < 12) {
    const id = e.getAttributeAsUInt32(0x6f);
    const fid = e.getAttributeAsUInt32(0x71);
    const nm = e.getAttributeAsString(0x6e);
    console.log(`${"  ".repeat(depth)}<${e.tagName}> scope=${e.scope} type=${e.type} id=${id} factoryID=${fid} name=${JSON.stringify(nm)}`);
    shown++;
  }
  for (const c of e.children) show(c, depth + 1);
}
show(root, 0);
