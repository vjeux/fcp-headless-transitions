#!/usr/bin/env python3
"""tools/re/probe_scene.py — CAPABILITY probe harness (generalises filter_probe.py).

WHY THIS EXISTS (the local-optimum lesson, 2026-07-15): the 65 built-in transitions are
100+-node integration scenes. A low score can't be attributed to one cause, so fixing a
slug means getting many subsystems right at once — the trap the effort kept falling into.
`fct minimize` shrinks a FAILING slug REACTIVELY; this does the inverse, PROACTIVELY: it
builds a MINIMAL synthetic scene that isolates exactly ONE FCP capability (a transform, a
blend mode, a behavior, a time-remap, a filter …), renders it through BOTH the real headless
FCP engine AND the full TS pipeline (parse->evaluate->composite), and compares. Unit tests
for the engine, with headless FCP as the per-capability oracle. The catalog of all such
capabilities lives in tools/re/capabilities.json; `fct caps` runs them.

This is a legitimate Phase-2 fidelity check (headless IS FCP) — NOT the banned render-vs-
render scoring (which is about TS TRANSITIONS vs GUI GT). One truth for the 65 shipped slugs
is still the GUI GT; this is a DEV ORACLE to build features one-by-one against real FCP.

A capability spec (one entry in capabilities.json) is:
  { "cap": "transform.position.x",         # unique id
    "family": "transform",                  # grouping
    "inject": {"kind": "transform",          # how to build the synthetic scene (see INJECTORS)
               "position": {"x": 300}},
    "time": 0.0,                             # scene time (s) to sample (A fully covers frame)
    "min_psnr": 34,                          # PASS bar (headless vs TS)
    "note": "..." }

The scene is the clean Blurs/Directional skeleton with its scene <filter> REMOVED and the
ONE primitive injected on Transition A, rendered at `time` where A covers the frame so the
output == primitive(imageA).
"""
import os, sys, argparse, tempfile, re, json, subprocess

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# Make `import fct.*` work regardless of how we were launched. When invoked via
# `fct.sh caps`, fct/cli.py has ALREADY re-exec'd under the venv python with DYLD set,
# so the re-exec guard below is skipped and PYTHONPATH=REPO is never exported — leaving
# REPO off sys.path and `from fct.config import ...` failing. Insert it unconditionally.
if REPO not in sys.path:
    sys.path.insert(0, REPO)
FRAMEWORKS = "/Applications/Final Cut Pro.app/Contents/Frameworks"

# Headless FCP needs venv python + DYLD_FRAMEWORK_PATH set AT EXEC TIME (SIP strips DYLD
# from children of timeout/nohup/sudo, and CDLL resolves sibling framework rpaths at
# dlopen). Re-exec under the venv python with DYLD set once, exactly like fct/cli.py.
_VENV_PY = os.path.join(REPO, "venv", "bin", "python3")
if (os.environ.get("DYLD_FRAMEWORK_PATH") != FRAMEWORKS or sys.executable != _VENV_PY) \
        and not os.environ.get("_PROBE_SCENE_REEXEC") and os.path.exists(_VENV_PY):
    os.environ["DYLD_FRAMEWORK_PATH"] = FRAMEWORKS
    os.environ["PYTHONPATH"] = REPO + (":" + os.environ["PYTHONPATH"] if os.environ.get("PYTHONPATH") else "")
    os.environ["_PROBE_SCENE_REEXEC"] = "1"
    os.execv(_VENV_PY, [_VENV_PY, "-u", os.path.abspath(__file__)] + sys.argv[1:])
SKELETON = ("/Applications/Final Cut Pro.app/Contents/PlugIns/MediaProviders/"
            "MotionEffect.fxp/Contents/Resources/PETemplates.localized/"
            "Transitions.localized/Blurs.localized/Directional.localized/Directional.motr")
CAPS = os.path.join(REPO, "tools", "re", "capabilities.json")
IMG_A_PNG = os.path.join(REPO, "engine", "test", "start.png")


VENV_PY = os.path.join(REPO, "venv", "bin", "python3")

def _reexec_under_venv_if_needed():
    """Headless rendering needs venv python + DYLD_FRAMEWORK_PATH. SIP strips DYLD from
    spawned children, so we os.execv (replace the process image) once — same pattern as
    fct/cli.py. Never run this under timeout/nohup/sudo (they strip DYLD)."""
    need = (os.environ.get("DYLD_FRAMEWORK_PATH") != FRAMEWORKS
            or os.path.realpath(sys.executable) != os.path.realpath(VENV_PY))
    if need and os.path.exists(VENV_PY):
        os.environ["DYLD_FRAMEWORK_PATH"] = FRAMEWORKS
        os.environ["PYTHONPATH"] = REPO
        os.environ["_PROBE_REEXEC"] = "1"
        os.execv(VENV_PY, [VENV_PY, "-u", os.path.abspath(__file__)] + sys.argv[1:])


# ---- scene builders (INJECTORS) --------------------------------------------------
def _strip_scene_filter(src):
    """Remove the skeleton's scene-level <filter> so only the injected primitive acts."""
    return re.sub(r'\t\t<filter name="Directional Blur".*?</filter>\n', "", src, flags=re.DOTALL)


def _transform_xml(inject, indent="\t\t\t\t"):
    """Build a <parameter name="Transform" id="100"> group from an inject spec:
       {"position":{"x":..,"y":..,"z":..}, "scale":{"x":..,"y":..}, "rotation":..}
    Position X/Y/Z id 1/2/3 (px, Motion centre origin), Scale id=102 X/Y/Z id 1/2/3 (%),
    Rotation id=103 (deg). Matches parser/transform.ts + a real Movements/Push .motr."""
    lines = [f'{indent}<parameter name="Transform" id="100" flags="8589938704">']
    pos = inject.get("position")
    if pos:
        lines.append(f'{indent}\t<parameter name="Position" id="101" flags="8589938704">')
        for axis, aid in (("x", 1), ("y", 2), ("z", 3)):
            if axis in pos:
                lines.append(f'{indent}\t\t<parameter name="{axis.upper()}" id="{aid}" flags="8606711824" default="0" value="{pos[axis]}"/>')
        lines.append(f'{indent}\t</parameter>')
    rot = inject.get("rotation")
    if rot is not None:
        lines.append(f'{indent}\t<parameter name="Rotation" id="102" flags="8606711824" default="0" value="{rot}"/>')
    scale = inject.get("scale")
    if scale:
        lines.append(f'{indent}\t<parameter name="Scale" id="103" flags="8589938704">')
        for axis, aid in (("x", 1), ("y", 2), ("z", 3)):
            if axis in scale:
                lines.append(f'{indent}\t\t<parameter name="{axis.upper()}" id="{aid}" flags="8606711824" default="100" value="{scale[axis]}"/>')
        lines.append(f'{indent}\t</parameter>')
    anchor = inject.get("anchor")
    if anchor:
        lines.append(f'{indent}\t<parameter name="Anchor Point" id="106" flags="8589938704">')
        for axis, aid in (("x", 1), ("y", 2), ("z", 3)):
            if axis in anchor:
                lines.append(f'{indent}\t\t<parameter name="{axis.upper()}" id="{aid}" flags="8606711824" default="0" value="{anchor[axis]}"/>')
        lines.append(f'{indent}\t</parameter>')
    lines.append(f'{indent}</parameter>')
    return "\n".join(lines)


def _inject_into_transition_a_properties(src, param_xml):
    """Insert param_xml as the first child of Transition A's <parameter name="Properties"
    id="1"> group. In a real .motr the layer Transform (id=100) sits directly under
    Properties(id=1) — NOT under Object(id=2), which holds the drop-zone/media params.
    (Verified against Movements/Push: Properties(1) > Transform(100) > Position(101) > X/Y/Z.)"""
    i = src.find('name="Transition A"')
    j = src.find('name="Transition B"')
    blk = src[i:j]
    m = re.search(r'(<parameter name="Properties" id="1"[^>]*>)\n', blk)
    if not m:
        raise RuntimeError("Transition A Properties id=1 open tag not found")
    newblk = blk[:m.end()] + param_xml + "\n" + blk[m.end():]
    return src[:i] + newblk + src[j:]


def build_scene(inject):
    src = _strip_scene_filter(open(SKELETON, encoding="utf-8").read())
    kind = inject["kind"]
    if kind == "transform":
        src = _inject_into_transition_a_properties(src, _transform_xml(inject))
    elif kind == "opacity":
        # set Transition A Blending>Opacity (id=202) to a static value
        src = re.sub(r'(<parameter name="Opacity" id="202"[^>]*?)(/?>)',
                     lambda m: f'{m.group(1)} default="1" value="{inject["value"]}"/>' if m.group(2) == "/>"
                     else m.group(0), src, count=1)
    else:
        raise RuntimeError(f"unknown inject kind: {kind}")
    fd, path = tempfile.mkstemp(suffix=".motr", prefix="capscene_")
    os.close(fd)
    open(path, "w", encoding="utf-8").write(src)
    return path


# ---- run both engines + compare --------------------------------------------------
def run_case(spec, keep=False):
    tmp = tempfile.mkdtemp(prefix="cap_")
    head_png = os.path.join(tmp, "headless.png")
    ts_png = os.path.join(tmp, "ts.png")
    motr = build_scene(spec["inject"])
    tsec = float(spec.get("time", 0.0))

    # (a) headless FCP via ozengine
    sys.path.insert(0, os.path.join(REPO, "tools"))
    import ozengine
    from fct.config import IMG_A, IMG_B
    doc = ozengine.load_doc(motr)
    rc = ozengine.render_frame(doc, IMG_A, IMG_B, tsec, head_png)
    if rc != 0:
        return {"error": f"headless rc={rc}"}

    # (b) TS engine — full parse->evaluate->composite on the SAME synthetic .motr
    env = dict(os.environ, FCT_MOTR=motr, FCT_TIME=str(tsec), FCT_OUT=ts_png)
    r = subprocess.run(["node_modules/.bin/tsx", "test/_scene_render.ts"],
                       cwd=os.path.join(REPO, "engine"), env=env,
                       stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    if r.returncode != 0:
        return {"error": "ts render failed: " + r.stderr.decode()[-300:]}

    import numpy as np
    from PIL import Image
    h4 = np.asarray(Image.open(head_png).convert("RGBA")).astype(float)
    t4 = np.asarray(Image.open(ts_png).convert("RGBA")).astype(float)
    if h4.shape != t4.shape:
        t4 = np.asarray(Image.open(ts_png).convert("RGBA").resize(
            (h4.shape[1], h4.shape[0]), Image.LANCZOS)).astype(float)
    h, t = h4[:, :, :3], t4[:, :, :3]
    mse = float(((h - t) ** 2).mean())
    psnr = 99.0 if mse < 1e-9 else 10 * np.log10(255 * 255 / mse)
    a_in = np.asarray(Image.open(IMG_A_PNG).convert("RGBA").resize(
        (h4.shape[1], h4.shape[0]), Image.LANCZOS)).astype(float)
    head_vs_input = float(np.abs(h4 - a_in).mean())
    res = {"psnr": round(psnr, 2), "mean_abs_err": round(float(np.abs(h - t).mean()), 2),
           "headless_vs_input_mad": round(head_vs_input, 2),
           "headless_png": head_png, "ts_png": ts_png, "motr": motr}
    if not keep:
        try: os.remove(motr)
        except OSError: pass
    return res


def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument("caps", nargs="*", help="capability ids to run (default: all)")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--keep", action="store_true", help="keep intermediate PNGs + .motr")
    a = ap.parse_args(argv)
    _reexec_under_venv_if_needed()
    catalog = json.load(open(CAPS))
    if a.list:
        for c in catalog:
            print(f"  {c['cap']:28s} [{c['family']}] min_psnr={c.get('min_psnr',34)}")
        return 0
    run = [c for c in catalog if not a.caps or c["cap"] in a.caps]
    npass = nfail = 0
    for c in run:
        res = run_case(c, keep=a.keep)
        mp = c.get("min_psnr", 34)
        if "error" in res:
            print(f"  {c['cap']:28s} ERROR {res['error']}"); nfail += 1; continue
        # `applied` guards the SCHEMA: for an injection that is meant to CHANGE the
        # image, headless == input (hvi≈0) means FCP ignored the inject (a schema bug,
        # not an engine bug). But an IDENTITY capability (baseline.identity, a no-op
        # transform) is CORRECT when headless == input — the only signal is the
        # headless-vs-TS psnr. Entries mark this with "expect_identity": true so the
        # guard is skipped and the psnr bar alone decides PASS/FAIL.
        expect_identity = bool(c.get("expect_identity"))
        applied = expect_identity or res["headless_vs_input_mad"] >= 1.0
        ok = res["psnr"] >= mp and applied
        tag = "PASS" if ok else "FAIL"
        warn = "" if applied else " (headless==input: injection IGNORED — check schema)"
        print(f"  {c['cap']:28s} psnr={res['psnr']:5.2f} mae={res['mean_abs_err']:5.2f} "
              f"hvi={res['headless_vs_input_mad']:5.1f} [{tag}]{warn}")
        npass += ok; nfail += (not ok)
    print(f"\nTOTAL: {npass} pass, {nfail} fail")
    return 1 if nfail else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
