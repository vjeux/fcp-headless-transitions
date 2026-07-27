import { readFileSync } from "fs";
import { parseScene } from "../src/parseScene.js";
import { OZSceneNode } from "../src/nodes/OZSceneNode.js";
const f="/Applications/Final Cut Pro.app/Contents/PlugIns/MediaProviders/MotionEffect.fxp/Contents/Resources/PETemplates.localized/Transitions.localized/Lights.localized/Flash.localized/Flash.motr";
const sc=parseScene(readFileSync(f,"utf8"));
function walk(n:OZSceneNode,d:number){console.log("  ".repeat(d)+`#${n.id} ${n.name} [${n.constructor.name}] children=${n.childNodes.length}`); for(const c of n.childNodes) walk(c,d+1);}
for(const l of sc.layers) walk(l,0);
