"""fct.parity.filter_node — isolate ONE filter NODE's computation (image->image) and
compare REAL FCP vs the TS port, across the node's param space.

The filter node is the cleanest XML-node boundary: a <filter pluginName=X> with params
triggers exactly `out = filter(in, params)`. We isolate it in REAL FCP by injecting it as
the scene <filter> on the Blurs/Directional skeleton at t=0 (Transition A fully covers the
frame, so headless output == filter(imageA)) — the existing tools/re/filter_probe.py — and
in the TS engine via engine/test/_filter_apply.ts (the registered filter's .apply). This
module just drives those two on the SAME (image, params) and returns the PSNR.

Reuses tools/re/filter_verify.run() so there is ONE isolation path (no duplicate skeleton /
injection logic).
"""
import os
import sys
import pathlib

REPO = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO))
sys.path.insert(0, str(REPO / "tools"))


def _build_spec(node, param_values):
    """node (registry entry) + {param_name: value} -> a filter_verify spec dict."""
    params = []
    for p in node.get("params", []):
        v = param_values.get(p["name"], None)
        if v is None:
            continue
        params.append({"name": p["name"], "id": p.get("id", 1), "value": v})
    return {"uuid": node["oracle"]["uuid"], "pluginName": node["oracle"]["pluginName"],
            "params": params}


def compare(node, param_values, time=0.0):
    """Return the filter_verify result dict (psnr, means, identity_warning...) for this
    node at these params. Raises on hard failure."""
    from tools.re import filter_verify
    spec = _build_spec(node, param_values)
    return filter_verify.run(spec, time=time, keep=False)


if __name__ == "__main__":
    import json
    reg = json.load(open(REPO / "fct" / "parity" / "registry.json"))
    node = [n for n in reg["nodes"] if n["id"] == "filter.PAEBrightness"][0]
    for v in (1.0, 2.0):
        r = compare(node, {"Brightness": v})
        print("Brightness=%.1f -> psnr=%.2f hvi=%.2f%s"
              % (v, r["psnr"], r.get("headless_vs_input_mad", -1),
                 " IDENTITY" if "identity_warning" in r else ""))
