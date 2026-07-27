import { readFileSync } from "fs";
import { parseScene } from "../src/parseScene.js";
import { OZSceneNode } from "../src/nodes/OZSceneNode.js";
import { OZChannelFolder } from "../src/channels/OZChannelFolder.js";
import { OZChannel } from "../src/channels/OZChannel.js";
const sc = parseScene(readFileSync(process.argv[2], "utf8"));
function find(ns: OZSceneNode[], nm: string): OZSceneNode | undefined { for (const n of ns) { if (n.name === nm) return n; const r = find(n.childNodes, nm); if (r) return r; } }
const n = find(sc.layers, "Color Solid")!;
// dig Properties(1)>Transform(100)>Position(101)>Z(3)
function f(c: any, id: number): any { return c instanceof OZChannelFolder ? c.children.find((x: any) => x.id === id) : undefined; }
const props = n.channels.find(c => c.id === 1);
const z = f(f(f(props, 100), 101), 3) as OZChannel;
console.log("Position.Z channel: value=", (z as any)?.value, "scope of curve? curve=", JSON.stringify((z as any)?.curve));
