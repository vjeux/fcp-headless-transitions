#!/usr/bin/env python3
"""
Patch the Color Solid's base Y (and optionally X) position curve in a Push .motr,
so you can render controlled keyframes through the real engine and observe exactly
how it interpolates. This is how we proved Motion IGNORES stored tangent handles
and recomputes Catmull-Rom tangents (see docs/DEBUGGING.md).

Two modes:
  keyframes  — supply N (time_120k, value) pairs; flattens X so only Y moves.
  amplitude  — quick 2-keyframe 0 -> AMP curve (sanity check the engine reads edits).

Usage:
  ./venv/bin/python tools/edit_curve.py <src.motr> <out.motr> keyframes \
       0:0 36036:-108.93 96096:-565.78 200200:-1080
  ./venv/bin/python tools/edit_curve.py <src.motr> <out.motr> amplitude -540

Notes:
  - time is in the 120000 timescale (200200 = 1.6683s = Push animation end).
  - Motion recomputes tangents from the (time,value) points; the inputTangent/
    outputTangent fields written here are placeholders and have NO effect on output
    (verified). Only the keyframe VALUES/TIMES matter.
"""
import sys

def kf(t, v, flag=0, interp=6):
    return (f'\t\t\t\t\t\t\t\t<keypoint interpolation="{interp}" flags="{flag}">\n'
            f'\t\t\t\t\t\t\t\t\t<time>{t} 120000 1 0</time><value>{v}</value>\n'
            f'\t\t\t\t\t\t\t\t\t<inputTangentTime>-0.1</inputTangentTime><inputTangentValue>0</inputTangentValue>\n'
            f'\t\t\t\t\t\t\t\t\t<outputTangentTime>0.1</outputTangentTime><outputTangentValue>0</outputTangentValue>\n'
            f'\t\t\t\t\t\t\t\t</keypoint>\n')

def build_curve(pairs, interp=6):
    n = len(pairs)
    kps = ""
    for i, (t, v) in enumerate(pairs):
        flag = 128 if (i == 0 or i == n - 1) else 0
        kps += kf(t, v, flag, interp)
    return (f'<curve type="1" default="0" value="0">\n'
            f'\t\t\t\t\t\t\t\t<numberOfKeypoints>{n}</numberOfKeypoints>\n{kps}'
            f'\t\t\t\t\t\t\t</curve>')

def replace_curve(src, param_marker, new_curve):
    idx = src.index(param_marker)
    cs = src.index('<curve', idx)
    ce = src.index('</curve>', cs) + len('</curve>')
    return src[:cs] + new_curve + src[ce:]

def main():
    src_path, out_path, mode = sys.argv[1], sys.argv[2], sys.argv[3]
    src = open(src_path).read()
    # optional "interp=N" arg (anywhere after mode) sets the keyframe interpolation type
    interp = 6
    interp_args = [a for a in sys.argv[4:] if a.startswith("interp=")]
    if interp_args:
        interp = int(interp_args[0].split("=")[1])
    data_args = [a for a in sys.argv[4:] if not a.startswith("interp=")]
    if mode == "amplitude":
        amp = data_args[0]
        pairs = [(0, 0), (200200, amp)]
    elif mode == "keyframes":
        pairs = [(int(a.split(":")[0]), float(a.split(":")[1])) for a in data_args]
    else:
        sys.exit("mode must be 'keyframes' or 'amplitude'")
    yc = build_curve(pairs, interp)
    out = replace_curve(src, '<parameter name="Y" id="2" flags="8606711824">', yc)
    # flatten X so only Y drives the motion
    flat = '<curve type="1" default="0" value="0"><numberOfKeypoints>0</numberOfKeypoints></curve>'
    out = replace_curve(out, '<parameter name="X" id="1" flags="8606711824">', flat)
    open(out_path, "w").write(out)
    print(f"wrote {out_path} with {len(pairs)} Y keyframes (interp={interp})")

if __name__ == "__main__":
    main()
