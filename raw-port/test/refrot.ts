import { readFileSync } from "fs";
import { parseScene } from "../src/parseScene.js";
import { OZSceneNode } from "../src/nodes/OZSceneNode.js";
import { resolveChannelRef, OZChannelFolder } from "../src/channels/OZChannelFolder.js";
const sc = parseScene(readFileSync(process.argv[2], "utf8"));
function walk(ns: OZSceneNode[]) {
  for (const n of ns) {
    const props = n.channels.find((c:any)=>c.id===1);
    if (props instanceof OZChannelFolder) {
      const r102 = resolveChannelRef("./100/102", props, props);
      const r109 = resolveChannelRef("./100/109", props, props);
      if (r102 || r109) console.log(`${n.name}: ./100/102 -> ${r102?('id='+r102.id+' name='+r102.name):'MISS'} | ./100/109 -> ${r109?('id='+r109.id):'MISS'}`);
    }
    walk(n.childNodes);
  }
}
walk(sc.layers);
