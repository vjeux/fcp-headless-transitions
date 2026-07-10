"""fct.gen — the SINGLE way to generate frames to disk for any source.

    gen_headless(slug)   render via the FCP headless shim (tools/ozengine + oz_render.dylib)
    gen_engine(slug)     render via the TS engine (engine/, node tsx)
    (gui frames are produced by fct.slice_gui from the recorded GUI .mov — see fct/slice_gui.py)

All three write N_FRAMES (24) PNGs at the SAME half-open i/N progress, 1920x1080,
to the canonical dir for that source: frame_0000.png .. frame_0023.png.

Headless requires the FCP engine (DYLD + venv python on the Mac). Engine requires node.
These are the only two renderers fct drives; GUI GT is sliced from the recorded .mov.
"""
import os, sys, json, subprocess
from .config import (N_FRAMES, IMG_A, IMG_B, REPO, frames_dir, slug_motr)

# --- headless (FCP shim) ---
def gen_headless(slug: str, out_dir: str = None) -> str:
    """Render `slug` via the FCP headless engine to `out_dir` (default canonical).
    Must run under the venv python with DYLD_FRAMEWORK_PATH set (see fct/cli.py)."""
    out_dir = out_dir or frames_dir("headless", slug)
    os.makedirs(out_dir, exist_ok=True)
    sys.path.insert(0, os.path.join(REPO, "tools"))
    import ozengine
    from . import timing
    motr = slug_motr(slug)
    doc = ozengine.load_doc(motr)
    span = timing.scene_duration_seconds(motr) or 2.0
    for i in range(N_FRAMES):
        t = timing.sample_time(i, N_FRAMES, span)
        rc = ozengine.render_frame(doc, IMG_A, IMG_B, t,
                                   os.path.join(out_dir, f"frame_{i:04d}.png"))
        if rc != 0:
            print(f"  [headless] {slug} f{i}: rc={rc}", file=sys.stderr)
    return out_dir

# --- engine (TS) ---
def gen_engine(slug: str, out_dir: str = None) -> str:
    """Render `slug` via the TS engine (node tsx). Writes 24 frames at i/N.
    Runs engine/test/_fct_render.ts (generated on first use)."""
    out_dir = out_dir or frames_dir("engine", slug)
    os.makedirs(out_dir, exist_ok=True)
    _ensure_engine_render_script()
    env = dict(os.environ, FCT_SLUG=slug, FCT_OUT=out_dir, FCT_N=str(N_FRAMES))
    subprocess.run(
        ["node_modules/.bin/tsx", "test/_fct_render.ts"],
        cwd=os.path.join(REPO, "engine"), env=env, check=True)
    return out_dir

_ENGINE_SCRIPT = r'''
if (typeof globalThis.ImageData === "undefined") {(globalThis as any).ImageData = class ImageData { data:any;width:number;height:number;constructor(d:any,w:number,h?:number){this.data=d;this.width=w;this.height=h??(d.length/4/w);} };}
import { createBenchTransition } from './gt-cache.js';
import { PNG } from 'pngjs'; import fs from 'node:fs'; import path from 'node:path';
function loadPNG(p:string){const png=PNG.sync.read(fs.readFileSync(p));return new (globalThis as any).ImageData(new Uint8ClampedArray(png.data),png.width,png.height);}
function savePNG(img:any,p:string){const png=new PNG({width:img.width,height:img.height});png.data=Buffer.from(img.data.buffer,img.data.byteOffset,img.data.byteLength);fs.writeFileSync(p,PNG.sync.write(png));}
const map=JSON.parse(fs.readFileSync(process.env.FCT_SLUGMAP||'/tmp/slug_map.json','utf-8'));
const imgA=loadPNG(path.resolve('test/start.png')),imgB=loadPNG(path.resolve('test/end.png'));
const slug=process.env.FCT_SLUG!, outDir=process.env.FCT_OUT!, N=parseInt(process.env.FCT_N||'24');
const motr=map[slug]; if(!motr){console.error('no motr for '+slug);process.exit(1);}
fs.mkdirSync(outDir,{recursive:true});
const tr=createBenchTransition(motr,{outputWidth:1920,outputHeight:1080});
for(let i=0;i<N;i++){ const r=tr.render(imgA,imgB,i/N); savePNG(r,path.join(outDir,`frame_${String(i).padStart(4,'0')}.png`)); }
console.error('OK '+slug);
'''

def _ensure_engine_render_script():
    p = os.path.join(REPO, "engine", "test", "_fct_render.ts")
    if not os.path.exists(p) or open(p).read() != _ENGINE_SCRIPT:
        with open(p, "w") as f:
            f.write(_ENGINE_SCRIPT)
