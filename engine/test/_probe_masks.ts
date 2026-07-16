if (typeof (globalThis as any).ImageData === 'undefined') { (globalThis as any).ImageData = class ImageData { data: any; width: number; height: number; constructor(d: any, w: number, h?: number) { this.data = d; this.width = w; this.height = h ?? (d.length / 4 / w); } }; }
import fs from "fs";
import { DOMParser } from "@xmldom/xmldom";
import { parseShape } from "../src/parser/shapes.js";
const xml = fs.readFileSync("/tmp/slide_in.motr", "utf8");
const doc = new DOMParser().parseFromString(xml, "application/xml");
const factories = new Map<number, string>();
const fac = doc.getElementsByTagName("factory");
for (let i = 0; i < fac.length; i++) {
  const f: any = fac[i];
  const id = parseInt(f.getAttribute("factoryID") || "0", 10);
  const desc = f.getElementsByTagName("description")[0]?.textContent || "";
  factories.set(id, desc);
}
console.log("factory 13 =", JSON.stringify(factories.get(13)));
console.log("factory 22 =", JSON.stringify(factories.get(22)));
console.log("factory 24 =", JSON.stringify(factories.get(24)));
const nodes = doc.getElementsByTagName("scenenode");
for (let i = 0; i < nodes.length; i++) {
  const n: any = nodes[i];
  if (n.getAttribute("pluginName") === "Gradient" && n.getAttribute("pluginUUID")?.startsWith("40091D89")) {
    for (let j = 0; j < n.childNodes.length; j++) {
      const c: any = n.childNodes[j];
      if (c.nodeType !== 1 || c.tagName !== "mask") continue;
      const shape = parseShape(c, factories, new Set());
      const name = c.getAttribute("name");
      console.log("--- MASK", name, "id=" + c.getAttribute("id"));
      console.log("    shape:", shape ? { isMask: (shape as any).isMask, verts: (shape as any).verticesX?.length, isSolidPanel: (shape as any).isSolidPanel } : "null");
      const dChildren: string[] = [];
      for (let k = 0; k < c.childNodes.length; k++) { const cc: any = c.childNodes[k]; if (cc.nodeType === 1) dChildren.push(cc.tagName+":"+cc.getAttribute("name")); }
      console.log("    direct children:", dChildren.slice(0, 12).join(" | "));
      const enText = c.getElementsByTagName("enabled")[0]?.textContent;
      console.log("    enabled:", JSON.stringify(enText));
    }
    break;
  }
}
