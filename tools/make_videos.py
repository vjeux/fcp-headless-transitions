#!/usr/bin/env python3
"""
Build all comparison artifacts from two frame directories (ground truth + engine):
  - <out>/push_comparison.mp4    side-by-side (FCP left, engine right), labeled
  - <out>/push_fcp_groundtruth.mp4 / push_engine.mp4   each alone
  - <out>/push_diff.mp4          |GT-engine| amplified 4x, per-frame PSNR
  - <out>/push_contact_sheet.png FCP-over-engine grid at key frames
  - <out>/push_diff_sheet.png    FCP/engine/diff 3-row grid at key frames

Usage:
  ./venv/bin/python tools/make_videos.py <gt_dir> <engine_dir> <out_dir> [name]

Requires ffmpeg + PIL/numpy (in the repo venv).
"""
import os, sys, subprocess, tempfile
from PIL import Image, ImageDraw, ImageFont
import numpy as np

def font(sz):
    try: return ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", sz)
    except Exception: return ImageFont.load_default()

def nframes(d):
    return len([f for f in os.listdir(d) if f.startswith("frame_") and f.endswith(".png")])

def encode(frames_dir, out_mp4, scale=None, pad=False, fps=12):
    vf = []
    if scale: vf.append(f"scale={scale}")
    if pad: vf.append("pad=ceil(iw/2)*2:ceil(ih/2)*2")
    cmd = ["ffmpeg","-y","-loglevel","error","-framerate",str(fps),
           "-i", os.path.join(frames_dir,"frame_%04d.png"),
           "-c:v","libx264","-crf","16","-pix_fmt","yuv420p"]
    if vf: cmd += ["-vf", ",".join(vf)]
    cmd.append(out_mp4)
    subprocess.run(cmd, check=True)

def main():
    gt_dir, eng_dir, out_dir = sys.argv[1], sys.argv[2], sys.argv[3]
    name = sys.argv[4] if len(sys.argv) > 4 else "push"
    os.makedirs(out_dir, exist_ok=True)
    N = min(nframes(gt_dir), nframes(eng_dir))
    tmp = tempfile.mkdtemp()
    sbs_dir = os.path.join(tmp, "sbs"); os.makedirs(sbs_dir)
    diff_dir = os.path.join(tmp, "diff"); os.makedirs(diff_dir)
    f26 = font(26); f22 = font(22)
    W, H, PAD = 720, 405, 40
    for i in range(N):
        gt = Image.open(f"{gt_dir}/frame_{i:04d}.png").convert("RGB")
        en = Image.open(f"{eng_dir}/frame_{i:04d}.png").convert("RGB")
        # side by side
        c = Image.new("RGB", (W*2+6, H+PAD), (15,15,15))
        c.paste(gt.resize((W,H)), (0,PAD)); c.paste(en.resize((W,H)), (W+6,PAD))
        d = ImageDraw.Draw(c)
        d.text((W//2-160,8), "Final Cut Pro (ground truth)", fill=(255,255,255), font=f26)
        d.text((W+6+W//2-140,8), "motr-engine (browser)", fill=(120,220,255), font=f26)
        c.save(f"{sbs_dir}/frame_{i:04d}.png")
        # diff
        ga = np.asarray(gt).astype(float); ea = np.asarray(en).astype(float)
        dd = np.abs(ga-ea).mean(axis=2)
        dv = np.clip(dd*4,0,255).astype(np.uint8)
        heat = np.zeros((*dv.shape,3), dtype=np.uint8)
        heat[:,:,0] = dv; heat[:,:,1] = (dv*0.35).astype(np.uint8)
        im = Image.fromarray(heat).resize((960,540))
        dr = ImageDraw.Draw(im)
        mse = (dd*dd).mean(); psnr = 99 if mse==0 else 10*np.log10(255*255/mse)
        dr.text((10,8), f"frame {i}  |diff|x4  PSNR {psnr:.1f}dB", fill=(255,255,255), font=f22)
        im.save(f"{diff_dir}/frame_{i:04d}.png")

    encode(sbs_dir, f"{out_dir}/{name}_comparison.mp4", pad=True)
    encode(gt_dir, f"{out_dir}/{name}_fcp_groundtruth.mp4", scale="960:540")
    encode(eng_dir, f"{out_dir}/{name}_engine.mp4", scale="960:540")
    encode(diff_dir, f"{out_dir}/{name}_diff.mp4")

    # contact sheets
    frames = [k for k in [0, N//5, 2*N//5, 3*N//5, 4*N//5, N-1] if k < N]
    def sheet(rows, path, labels, srcs):
        tw, th = 240, 135; lw = 90
        img = Image.new("RGB", (lw+(tw+6)*len(frames), (th+4)*rows+30), (15,15,15))
        d = ImageDraw.Draw(img)
        d.text((6,8), "frames: "+" ".join(map(str,frames)), fill=(180,180,180), font=font(18))
        for r,(lab,src) in enumerate(zip(labels,srcs)):
            y = 30+r*(th+4)
            d.text((4,y+th//2-8), lab, fill=(120,220,255) if lab=="engine" else (255,255,255), font=font(18))
            x = lw
            for f in frames:
                img.paste(src(f).resize((tw,th)), (x,y)); x += tw+6
        img.save(path)
    def gtf(i): return Image.open(f"{gt_dir}/frame_{i:04d}.png").convert("RGB")
    def enf(i): return Image.open(f"{eng_dir}/frame_{i:04d}.png").convert("RGB")
    def dif(i):
        ga=np.asarray(gtf(i)).astype(float); ea=np.asarray(enf(i)).astype(float)
        dd=np.clip(np.abs(ga-ea).mean(axis=2)*4,0,255).astype(np.uint8)
        h=np.zeros((*dd.shape,3),dtype=np.uint8); h[:,:,0]=dd; h[:,:,1]=(dd*0.35).astype(np.uint8)
        return Image.fromarray(h)
    sheet(2, f"{out_dir}/{name}_contact_sheet.png", ["FCP","engine"], [gtf,enf])
    sheet(3, f"{out_dir}/{name}_diff_sheet.png", ["FCP","engine","diff x4"], [gtf,enf,dif])
    print(f"wrote videos + sheets to {out_dir} ({N} frames)")

if __name__ == "__main__":
    main()
