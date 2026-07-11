#!/usr/bin/env python3
"""tools/re/filter_probe.py — Phase-2 filter verification harness.

Renders a SINGLE FCP filter through the REAL headless FCP engine on a controlled
input image, so we can compare the TS engine's filter output to FCP's actual output
across the FULL parameter space (not just values the 65 built-in transitions use).

We take a clean real transition skeleton (Blurs/Directional: a Group layer holding
Transition A + Transition B drop zones with ONE scene-level <filter>), rewrite the
<filter> to the target plugin UUID + static params, and render at t=0 where
Transition A fully covers the frame -> headless output == filter(imageA).

⚠️ Keep the injected <filter> at factoryID="7" (the skeleton's scene-filter slot).
The pluginUUID selects the actual filter; a mismatched factoryID makes the host
IGNORE the filter (observed: factoryID="21" -> filter never applied). Verified with
PAEBrightness (out=in*amount) and TintFx (hard-light tint) both applying under f7.

Because the headless IS FCP's real engine, headless-vs-TS on the SAME synthetic
.motr is a legitimate Phase-2 fidelity check (NOT the banned render-vs-render
TS-transition scoring, which is about scoring TS TRANSITIONS vs GUI GT).

USAGE
  # flat params:
  filter_probe.py --uuid <UUID> --name <PAEName> --param "PName:id=value" ... [--out p.png]
  # nested param (e.g. a Color group with RGB children):
  filter_probe.py --uuid <UUID> --name <PAEName> \
      --group "Color:1=Red:1:1.0,Green:2:0.0,Blue:3:0.0" --param "Intensity:2=1.0"
"""
import os, sys, argparse, tempfile, re, json

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SKELETON = ("/Applications/Final Cut Pro.app/Contents/PlugIns/MediaProviders/"
            "MotionEffect.fxp/Contents/Resources/PETemplates.localized/"
            "Transitions.localized/Blurs.localized/Directional.localized/Directional.motr")


def _param_elem(p, indent):
    """Recursively render a param (with optional nested children) as .motr XML."""
    name, pid = p["name"], p["id"]
    if "children" in p:
        lines = [f'{indent}<parameter name="{name}" id="{pid}" flags="8589938704">']
        for c in p["children"]:
            lines.append(_param_elem(c, indent + "\t"))
        lines.append(f'{indent}</parameter>')
        return "\n".join(lines)
    return (f'{indent}<parameter name="{name}" id="{pid}" flags="8606711824" '
            f'default="0" value="{p["value"]}"/>')


def build_filter_xml(uuid, name, params):
    lines = [f'\t\t<filter name="{name}" id="988471399" factoryID="7" '
             f'pluginUUID="{uuid}" pluginVersion="1" pluginName="{name}" pluginDynamicParams="0">',
             '\t\t\t<timing in="0 7680000 1 0" out="123063808 7680000 1 0" offset="0 7680000 1 0"/>',
             '\t\t\t<baseFlags>8589934672</baseFlags>']
    for p in params:
        lines.append(_param_elem(p, "\t\t\t"))
    lines.append('\t\t</filter>')
    return "\n".join(lines)


def make_probe_motr(uuid, name, params):
    src = open(SKELETON, encoding="utf-8").read()
    new_filter = build_filter_xml(uuid, name, params)
    out = re.sub(r'\t\t<filter name="Directional Blur".*?</filter>', new_filter, src,
                 flags=re.DOTALL)
    fd, path = tempfile.mkstemp(suffix=".motr", prefix="fprobe_")
    os.close(fd)
    open(path, "w", encoding="utf-8").write(out)
    return path


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--uuid", required=True)
    ap.add_argument("--name", required=True)
    ap.add_argument("--spec", help="JSON params list (preferred; supports arbitrary nesting)")
    ap.add_argument("--param", action="append", default=[], help='flat "PName:id=value"')
    ap.add_argument("--group", action="append", default=[],
                    help='one-level "GName:gid=Child:cid:val,..."')
    ap.add_argument("--time", type=float, default=0.0)
    ap.add_argument("--out", default="/tmp/probe_headless.png")
    a = ap.parse_args()
    if a.spec:
        params = json.loads(a.spec)
    else:
        params = []
        for g in a.group:
            head, children = g.split("=")
            gname, gid = head.rsplit(":", 1)
            kids = []
            for ch in children.split(","):
                cn, cid, cv = ch.split(":")
                kids.append({"name": cn, "id": cid, "value": cv})
            params.append({"name": gname, "id": gid, "children": kids})
        for p in a.param:
            nameid, val = p.split("=")
            pname, pid = nameid.rsplit(":", 1)
            params.append({"name": pname, "id": pid, "value": val})
    motr = make_probe_motr(a.uuid, a.name, params)
    print("probe motr:", motr)
    sys.path.insert(0, os.path.join(REPO, "tools"))
    import ozengine
    from fct.config import IMG_A, IMG_B
    doc = ozengine.load_doc(motr)
    rc = ozengine.render_frame(doc, IMG_A, IMG_B, a.time, a.out)
    print("render rc:", rc, "->", a.out)


if __name__ == "__main__":
    main()
