#!/usr/bin/env python3
"""
Render EVERY built-in Final Cut Pro transition through the headless engine.

Runs each transition in an ISOLATED subprocess so a crash in one template (e.g.
the VR/360 ones) doesn't abort the whole batch.

Usage:
    python3 run_all.py IMG_A IMG_B OUT_DIR [--frames N]

    (single-transition worker, used internally:)
    python3 run_all.py --worker MOTR_PATH IMG_A IMG_B OUT_DIR FRAMES
"""
import ctypes, os, sys, argparse, subprocess, glob

FCP = "/Applications/Final Cut Pro.app/Contents/Frameworks"
HERE = os.path.dirname(os.path.abspath(__file__))
TRANSITIONS_DIR = ("/Applications/Final Cut Pro.app/Contents/PlugIns/MediaProviders/"
                   "MotionEffect.fxp/Contents/Resources/PETemplates.localized/Transitions.localized")
DOC_TYPE = "com.apple.motion.transition"
SCENE_DURATION = 2.002
TIMESCALE = 24000


def discover():
    out = []
    for p in sorted(glob.glob(TRANSITIONS_DIR + "/**/*.motr", recursive=True)):
        rel = p[len(TRANSITIONS_DIR) + 1:]
        parts = [seg.replace(".localized", "") for seg in rel.split("/")]
        name = parts[-1].replace(".motr", "")
        category = parts[0] if len(parts) > 1 else "?"
        out.append((category, name, p))
    return out


def slugify(cat, name):
    return f"{cat}__{name}".replace(" ", "_").replace("/", "-").replace(":", "-").replace("&", "and")


def worker(motr, img_a, img_b, out_dir, frames):
    """Render one transition. Runs in its own process; may crash — that's fine."""
    os.makedirs(out_dir, exist_ok=True)
    oz = ctypes.CDLL(FCP + "/Ozone.framework/Versions/A/Ozone")
    progl = ctypes.CDLL(FCP + "/ProGL.framework/Versions/A/ProGL")
    cgl = ctypes.CDLL("/System/Library/Frameworks/OpenGL.framework/OpenGL")
    import objc, AppKit
    from Foundation import NSURL
    AppKit.NSApplication.sharedApplication().setActivationPolicy_(1)
    oz["_Z34OZSharedApplicationForAllUnitTestsv"].restype = ctypes.c_void_p
    oz["_Z34OZSharedApplicationForAllUnitTestsv"]()
    progl["PGLMasterCGLContext"].restype = ctypes.c_void_p
    cgl.CGLSetCurrentContext.argtypes = [ctypes.c_void_p]
    cgl.CGLSetCurrentContext(progl["PGLMasterCGLContext"]())

    libobjc = ctypes.CDLL("/usr/lib/libobjc.dylib")
    libobjc.sel_registerName.restype = ctypes.c_void_p
    libobjc.sel_registerName.argtypes = [ctypes.c_char_p]
    ms = libobjc.objc_msgSend
    ms.restype = ctypes.c_void_p
    ms.argtypes = [ctypes.c_void_p, ctypes.c_void_p]

    shim = ctypes.CDLL(os.path.join(HERE, "oz_render.dylib"))
    shim.oz_render_frame.restype = ctypes.c_int
    shim.oz_render_frame.argtypes = [ctypes.c_void_p, ctypes.c_uint, ctypes.c_uint,
                                     ctypes.c_char_p, ctypes.c_char_p,
                                     ctypes.c_double, ctypes.c_int, ctypes.c_char_p]
    OZDoc = objc.lookUpClass("OZObjCDocument")
    doc = OZDoc.alloc().init()
    loaded, _ = doc.readFromURL_ofType_error_(NSURL.fileURLWithPath_(motr), DOC_TYPE, None)
    if not loaded:
        os._exit(3)
    cpp_doc = ms(ctypes.c_void_p(objc.pyobjc_id(doc)), libobjc.sel_registerName(b"getDocument"))
    a, b = img_a.encode(), img_b.encode()
    n = int(frames)
    for f in range(n):
        # Half-open equal slices, matching tools/render_gt.py:sample_time():
        # frame f sits at timeline progress f/n, so t = (f/n)*SCENE_DURATION. The
        # old closed f/(n-1) convention stretched the last frame onto the wrap
        # point and lagged the back half — see render_gt.sample_time's docstring.
        tsec = (f / n) * SCENE_DURATION if n > 1 else 0.0
        out = os.path.join(out_dir, f"frame_{f:04d}.png").encode()
        shim.oz_render_frame(ctypes.c_void_p(cpp_doc), 0, 0, a, b, tsec, TIMESCALE, out)
    os._exit(0)


def supervise(img_a, img_b, out_dir, frames, fps, make_mp4):
    os.makedirs(out_dir, exist_ok=True)
    transitions = discover()
    print(f"found {len(transitions)} transitions", flush=True)
    a = os.path.abspath(img_a); b = os.path.abspath(img_b)
    env = dict(os.environ, DYLD_FRAMEWORK_PATH=FCP)
    ok, fail = [], []
    for i, (cat, name, motr) in enumerate(transitions):
        slug = slugify(cat, name)
        tdir = os.path.join(out_dir, slug)
        r = subprocess.run([sys.executable, __file__, "--worker", motr, a, b, tdir, str(frames)],
                           env=env, capture_output=True, text=True)
        nframes = len(glob.glob(os.path.join(tdir, "*.png")))
        status = "OK" if (r.returncode == 0 and nframes == frames) else f"PARTIAL/CRASH(rc={r.returncode},frames={nframes})"
        if status == "OK":
            ok.append(slug)
            if make_mp4 and nframes:
                subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(fps),
                                "-i", os.path.join(tdir, "frame_%04d.png"),
                                "-c:v", "libx264", "-crf", "14", "-pix_fmt", "yuv420p",
                                "-vf", "pad=ceil(iw/2)*2:ceil(ih/2)*2",
                                os.path.join(out_dir, slug + ".mp4")], check=False)
        else:
            fail.append((slug, status))
        print(f"[{i+1}/{len(transitions)}] {status:24s} {cat}/{name}", flush=True)
    print(f"\n=== done: {len(ok)} ok, {len(fail)} failed ===", flush=True)
    for s, st in fail:
        print("  ", st, s, flush=True)


def main():
    if len(sys.argv) >= 2 and sys.argv[1] == "--worker":
        _, _, motr, img_a, img_b, out_dir, frames = sys.argv
        worker(motr, img_a, img_b, out_dir, frames)
        return
    ap = argparse.ArgumentParser()
    ap.add_argument("img_a"); ap.add_argument("img_b"); ap.add_argument("out_dir")
    ap.add_argument("--frames", type=int, default=24)
    ap.add_argument("--fps", type=int, default=24)
    ap.add_argument("--no-mp4", action="store_true")
    args = ap.parse_args()
    supervise(args.img_a, args.img_b, args.out_dir, args.frames, args.fps, not args.no_mp4)


if __name__ == "__main__":
    main()
