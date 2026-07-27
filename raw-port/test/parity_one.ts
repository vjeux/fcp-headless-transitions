import { readFileSync } from "fs";
import { parseScene } from "../src/parseScene.js";
import { OZGroup } from "../src/nodes/OZGroup.js";
import { OZSceneNode } from "../src/nodes/OZSceneNode.js";
import { parseMotr } from "../../engine/src/parser/index.js";
import type { Layer } from "../../engine/src/types.js";
const f = process.argv[2];
const eng = parseMotr(readFileSync(f, "utf8"));
const raw = parseScene(readFileSync(f, "utf8"));
const engM = new Map<number,string>(), rawM = new Map<number,string>();
function e(l: Layer){ engM.set(l.id, `${l.type}:${l.name}`); for(const c of l.children) e(c); }
function r(n: OZSceneNode){ rawM.set(n.id, `${n.constructor.name}:${n.name}`); if(n instanceof OZGroup) for(const c of n.childNodes) r(c); }
for(const l of eng.layers) e(l); for(const l of raw.layers) r(l);
console.log("ONLY IN ENGINE (raw-port missing):");
for(const [id,d] of engM) if(!rawM.has(id)) console.log("  ",id,d);
console.log("ONLY IN RAW (engine skips):");
for(const [id,d] of rawM) if(!engM.has(id)) console.log("  ",id,d);
