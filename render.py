#!/usr/bin/env python3
"""
Headless Final Cut Pro / Motion transition renderer.

Renders a Motion .motr transition between two images using FCP's real Motion
engine (Ozone.framework), fully headless. Outputs a sequence of PNG frames and
(optionally) an mp4.

Usage:
    python3 render.py IMG_A IMG_B OUT_DIR [--frames N] [--duration SECS] [--mp4 PATH]

Requires:
    - Final Cut Pro installed at /Applications/Final Cut Pro.app
    - oz_render.dylib built via ./build.sh (in this directory)
    - A Python with pyobjc (see requirements below). Run inside the bundled venv.

Notes:
    - The transition template is the built-in "Push" .motr. To use a different
      transition, change MOTR below (and, if its drop-zone element IDs differ,
      DROPZONE_A_ID / DROPZONE_B_ID — see README).
"""
import ctypes, os, sys, argparse, subprocess

FCP = "/Applications/Final Cut Pro.app/Contents/Frameworks"
HERE = os.path.dirname(os.path.abspath(__file__))

# Built-in Push transition template + its two drop-zone image-element scene IDs.
MOTR = ("/Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/"
        "Resources/Templates.localized/Transitions.localized/Movements.localized/"
        "Push.localized/Push.motr")
# Fallback: some installs ship templates under the app's PlugIns; the vendored copy also works.
MOTR_FALLBACK = os.path.expanduser(
    "~/random/motion-renderer/examples/PETemplates.localized/Transitions.localized/"
    "Movements.localized/Push.localized/Push.motr")
DOC_TYPE = "com.apple.motion.transition"
DROPZONE_A_ID = 1999869843   # OZImageElement "Transition A"
DROPZONE_B_ID = 1999869841   # OZImageElement "Transition B"
SCENE_DURATION = 2.002       # seconds (two 1.001s stills, 23.976fps)
TIMESCALE = 24000


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("img_a")
    ap.add_argument("img_b")
    ap.add_argument("out_dir")
    ap.add_argument("--frames", type=int, default=48)
    ap.add_argument("--duration", type=float, default=SCENE_DURATION)
    ap.add_argument("--motr", default=None, help="override transition .motr path")
    ap.add_argument("--mp4", default=None, help="also assemble frames into this mp4 (needs ffmpeg)")
    ap.add_argument("--fps", type=int, default=24)
    args = ap.parse_args()

    motr = args.motr or (MOTR if os.path.exists(MOTR) else MOTR_FALLBACK)
    if not os.path.exists(motr):
        sys.exit(f"transition template not found: {motr}")
    os.makedirs(args.out_dir, exist_ok=True)

    # --- Bring up the headless Motion engine ---
    oz = ctypes.CDLL(FCP + "/Ozone.framework/Versions/A/Ozone")
    progl = ctypes.CDLL(FCP + "/ProGL.framework/Versions/A/ProGL")
    cgl = ctypes.CDLL("/System/Library/Frameworks/OpenGL.framework/OpenGL")
    import objc, AppKit
    from Foundation import NSURL
    AppKit.NSApplication.sharedApplication().setActivationPolicy_(1)  # accessory (no dock icon)

    oz["_Z34OZSharedApplicationForAllUnitTestsv"].restype = ctypes.c_void_p
    oz["_Z34OZSharedApplicationForAllUnitTestsv"]()                    # bootstrap OZApplication singleton
    progl["PGLMasterCGLContext"].restype = ctypes.c_void_p
    cgl.CGLSetCurrentContext.argtypes = [ctypes.c_void_p]
    cgl.CGLSetCurrentContext(progl["PGLMasterCGLContext"]())           # make the master GL context current

    # --- Load the transition document ---
    OZDoc = objc.lookUpClass("OZObjCDocument")
    doc = OZDoc.alloc().init()
    ok, _ = doc.readFromURL_ofType_error_(NSURL.fileURLWithPath_(motr), DOC_TYPE, None)
    if not ok:
        sys.exit(f"failed to load transition: {motr}")

    libobjc = ctypes.CDLL("/usr/lib/libobjc.dylib")
    libobjc.sel_registerName.restype = ctypes.c_void_p
    libobjc.sel_registerName.argtypes = [ctypes.c_char_p]
    ms = libobjc.objc_msgSend
    ms.restype = ctypes.c_void_p
    ms.argtypes = [ctypes.c_void_p, ctypes.c_void_p]
    cpp_doc = ms(ctypes.c_void_p(objc.pyobjc_id(doc)), libobjc.sel_registerName(b"getDocument"))

    # --- Render frames ---
    shim = ctypes.CDLL(os.path.join(HERE, "oz_render.dylib"))
    shim.oz_render_frame.restype = ctypes.c_int
    shim.oz_render_frame.argtypes = [ctypes.c_void_p, ctypes.c_uint, ctypes.c_uint,
                                     ctypes.c_char_p, ctypes.c_char_p,
                                     ctypes.c_double, ctypes.c_int, ctypes.c_char_p]
    a = os.path.abspath(args.img_a).encode()
    b = os.path.abspath(args.img_b).encode()
    n = args.frames
    for i in range(n):
        # Half-open equal slices, matching tools/render_gt.py:sample_time():
        # frame i sits at timeline progress i/n, so t = (i/n)*duration. The old
        # closed i/(n-1) convention stretched the last frame onto the wrap point
        # and lagged the whole back half — see render_gt.sample_time's docstring.
        tsec = (i / n) * args.duration if n > 1 else 0.0
        out = os.path.join(args.out_dir, f"frame_{i:04d}.png").encode()
        rc = shim.oz_render_frame(ctypes.c_void_p(cpp_doc), DROPZONE_A_ID, DROPZONE_B_ID,
                                  a, b, tsec, TIMESCALE, out)
        if rc != 0:
            print(f"  frame {i}: rc={rc}", file=sys.stderr)
    print(f"rendered {n} frames to {args.out_dir}")

    if args.mp4:
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(args.fps),
                        "-i", os.path.join(args.out_dir, "frame_%04d.png"),
                        "-c:v", "libx264", "-crf", "12", "-pix_fmt", "yuv420p",
                        "-vf", "pad=ceil(iw/2)*2:ceil(ih/2)*2", args.mp4], check=True)
        print(f"wrote {args.mp4}")


if __name__ == "__main__":
    main()
