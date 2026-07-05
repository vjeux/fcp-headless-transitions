if (typeof globalThis.ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData { data; width; height;
    constructor(data, width, height){this.data=data;this.width=width;this.height=height??(data.length/4/width);} };
}
import { parseMotr } from '../src/parser/index.js';
import { evaluate } from '../src/evaluator/index.js';
import { composite } from '../src/compositor/index.js';
import { zoomBlur } from '../src/compositor/filters/directional-blur.js';
import { PNG } from 'pngjs'; import fs from 'node:fs'; import path from 'node:path';
const MOTR='/Users/vjeux/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/Blurs.localized/Zoom.localized/Zoom.motr';
function loadPNG(fp){const png=PNG.sync.read(fs.readFileSync(fp));return new ImageData(new Uint8ClampedArray(png.data),png.width,png.height);}
function psnr(a,b){let n=Math.min(a.data.length,b.data.length),mse=0;for(let i=0;i<n;i+=4)for(let c=0;c<3;c++){const dd=a.data[i+c]-b.data[i+c];mse+=dd*dd;}mse/=(n*3/4);return mse===0?Infinity:10*Math.log10(255*255/mse);}
const imgA=loadPNG(path.resolve(import.meta.dirname,'start.png'));
const imgB=loadPNG(path.resolve(import.meta.dirname,'end.png'));
const scene=parseMotr(fs.readFileSync(MOTR,'utf-8'));
const osc=scene.sceneBehaviors.find(b=>b.type==='oscillate'); if(osc) osc.params['Amplitude']=0; // disable built-in
const endSec=scene.settings.animationEndSec;
// hump over [win0,win1], peak magnitude Amt applied as zoomBlur to composite
const win0=0.167, win1=0.601;
for (const peakAmt of [0,0.5,1,1.5,2,3]) {
  let sum=0,cnt=0;const per=[];
  for(let i=0;i<12;i++){
    const p=i/11; const t=p*endSec;
    const ev=evaluate(scene,t);
    let r=composite(ev,imgA,imgB,scene.settings.width,scene.settings.height);
    if(t>win0 && t<win1 && peakAmt>0){ const w=Math.sin(Math.PI*(t-win0)/(win1-win0)); const amt=peakAmt*w; if(amt>0.01) r=zoomBlur(r,amt,0.5,0.5); }
    const gt=loadPNG(path.resolve(import.meta.dirname,`ground-truth/Blurs__Zoom/frame_${String(i).padStart(4,'0')}.png`));
    const v=psnr(r,gt); per.push(v.toFixed(1)); if(isFinite(v)){sum+=v;cnt++;}
  }
  console.log(`peakAmt=${peakAmt}: avg=${(sum/cnt).toFixed(2)} [${per.join(',')}]`);
}
