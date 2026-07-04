if (typeof globalThis.ImageData === "undefined") { (globalThis as any).ImageData = class ImageData { data: Uint8ClampedArray; width: number; height: number; constructor(d: Uint8ClampedArray, w: number, h?: number){this.data=d;this.width=w;this.height=h??(d.length/4/w);} }; }
import { parseMotr } from '../src/parser/index.js';
import { evaluate } from '../src/evaluator/index.js';
import fs from 'node:fs';
const scene=parseMotr(fs.readFileSync('/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/Movements.localized/Fall.localized/Fall.motr','utf-8'));
function find(l:any[],n:string):any{for(const x of l){if(x.name===n)return x;if(x.children){const f=find(x.children,n);if(f)return f;}}return null;}
const ta=find(scene.layers,'Transition A');
console.log('Transition A transform keys:', Object.keys(ta.transform));
console.log('rotationX:', ta.transform.rotationX ? JSON.stringify(ta.transform.rotationX).slice(0,150) : 'NONE');
console.log('anchorY:', JSON.stringify(ta.transform.anchorY));
console.log('positionY:', JSON.stringify(ta.transform.positionY));
// Evaluate at p=0.43 and dump world transform
const dur=scene.settings.duration.value/scene.settings.duration.timescale;
const ev=evaluate(scene, 0.4286*dur);
function findEv(el:any,n:string):any{if(el.layer?.name===n)return el;for(const c of el.children||[]){const f=findEv(c,n);if(f)return f;}return null;}
let e:any=null; for(const l of ev.layers){const f=findEv(l,'Transition A'); if(f){e=f;break;}}
console.log('world transform at p=0.43:', Array.from(e.worldTransform as Float64Array).map((v:number)=>v.toFixed(2)).join(','));
