if (typeof globalThis.ImageData === "undefined") { (globalThis as any).ImageData = class ImageData { data:any;width:number;height:number;constructor(d:any,w:number,h?:number){this.data=d;this.width=w;this.height=h??(d.length/4/w);} }; }
import { parseMotr } from '../src/parser/index.js';
import { evaluate } from '../src/evaluator/index.js';
import fs from 'node:fs'; import path from 'node:path';
const map = JSON.parse(fs.readFileSync(path.resolve('../fct/slug_map.json'),'utf-8'));
const slug = process.env.FCT_SLUG || 'Wipes__Diagonal';
const scene:any = parseMotr(fs.readFileSync(map[slug],'utf-8'));
const endSec = scene.settings?.animationEndSec ?? (scene.settings?.duration ? scene.settings.duration.value/scene.settings.duration.timescale : 1);
let emId=-1; function find(l:any){ if(emId<0){ if(l.isParticleEmitter) emId=l.id; for(const c of (l.children||[])) find(c);} }
for(const l of (scene.layers||[])) find(l);
console.log(`emitter id=${emId} endSec=${endSec.toFixed(3)}`);
function ev(ls:readonly any[],id:number):any{for(const l of ls){if(l.layer.id===id)return l;const r=ev(l.children,id);if(r)return r;}return null;}
for(let i=0;i<12;i++){ const t=(i/24)*endSec; const e=evaluate(scene,t); const el=ev(e.layers,emId); console.log(`f${String(i).padStart(2,'0')} emitterVis=${el?el.visible:'?'} emitterOp=${el?el.opacity.toFixed(3):'?'}`); }
