#!/usr/bin/env python3
"""tools/re/filter_probe.py — Phase-2 filter verification harness.

Renders a SINGLE FCP filter through the REAL headless FCP engine on a controlled
input image, so we can compare the TS engine's filter output to FCP's actual output
across the FULL parameter space (not just values the 65 built-in transitions use).

We take a clean real transition skeleton (Blurs/Directional: a Group layer holding
Transition A + Transition B drop zones with ONE scene-level <filter>), rewrite the
<filter> to the target plugin UUID + static params, and render at t=0 where
Transition A fully covers the frame -> headless output == filter(imageA).

Because the headless IS FCP's real engine, headless-vs-TS on the SAME synthetic
.motr is a legitimate Phase-2 fidelity check (NOT the banned render-vs-render
TS-scoring shortcut, which is about scoring TS TRANSITIONS vs GUI GT).

USAGE
  filter_probe.py --uuid <UUID> --name <PAEName> [--param "PName:id=value" ...] \
      [--time 0.0] [--out /tmp/probe_headless.png]
"""
import os, sys, argparse, tempfile, re

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SKELETON = ("/Applications/Final Cut Pro.app/Contents/PlugIns/MediaProviders/"
            "MotionEffect.fxp/Contents/Resources/PETemplates.localized/"
            "Transitions.localized/Blurs.localized/Directional.localized/Directional.motr")


def build_filter_xml(uuid, name, params):
    lines = [f'\t\t<filter name="{name}" id="988471399" factoryID="7" '
             f'pluginUUID="{uuid}" pluginVersion="1" pluginName="{name}" pluginDynamicParams="0">',
             '\t\t\t<timing in="0 7680000 1 0" out="123063808 7680000 1 0" offset="0 7680000 1 0"/>',
             '\t\t\t<baseFlags>8589934672</baseFlags>']
    for pname, pid, pval in params:
        lines.append(f'\t\t\t<parameter name="{pname}" id="{pid}" flags="8606711824" '
                     f'default="0" value="{pval}"/>')
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
    ap.add_argument("--param", action="append", default=[])
    ap.add_argument("--time", type=float, default=0.0)
    ap.add_argument("--out", default="/tmp/probe_headless.png")
    a = ap.parse_args()
    params = []
    for p in a.param:
        nameid, val = p.split("=")
        pname, pid = nameid.rsplit(":", 1)
        params.append((pname, pid, val))
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
