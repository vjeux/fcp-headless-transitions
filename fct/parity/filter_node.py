"""fct.parity.filter_node — the FILTER/GENERATOR node kind, done FAITHFULLY.

CRITICAL LESSON (documented in fct/faithful/synth.py, learned 2026-07-18 on PAELevels):
isolating a filter on a STATIC full-frame source (the naive "inject filter, render
filter(imageA)" approach) is UNFAITHFUL — a filter's response depends on its REAL input
pipeline (animated source, upstream filters, working color space), which a static source
does not reproduce. So a per-case ABSOLUTE PSNR against a static-source injection is the
wrong metric for a filter node.

The FAITHFUL node-boundary test for a filter is the DELTA-RESPONSE sweep already built in
fct/faithful/: in the node's REAL host, measure how the output MOVES when the node's param
moves — delta_o = oracle(theta) - oracle(theta0), delta_e = engine(theta) - engine(theta0),
ddb = PSNR(delta_o, delta_e). Any constant pipeline error cancels in the delta, so ddb
isolates THIS node's parameter response even inside the full transition. That IS the
node-boundary computation-parity metric for image nodes.

Therefore the parity driver does NOT re-implement a (flawed) static filter oracle. For a
filter/generator node it DELEGATES to the faithful sweep and surfaces its verdict under the
node registry — so `fct parity` is the single NODE view across all kinds, each using the
correct oracle: curve/value nodes -> exact dlsym parity (parity's own contribution);
filter/generator nodes -> the faithful delta-response (the proven in-host isolation).
"""
import json
import sys
import pathlib

REPO = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO))


def sweep_filter_node(node, pass_db, max_params=None, max_hosts=None,
                      times=(0.1, 0.25, 0.5, 0.75, 0.9)):
    """Run the FAITHFUL delta-response sweep for this filter/generator node and return a
    parity report dict. `node['faithful_id']` names the primitive in fct/faithful/catalog.json.
    """
    from fct.faithful import fuzz
    catalog = json.load(open(REPO / "fct" / "faithful" / "catalog.json"))
    fid = node.get("faithful_id", node["id"].split(".", 1)[-1])
    prim = next((p for p in catalog["primitives"] if p["id"] == fid), None)
    if prim is None:
        return {"id": node["id"], "kind": node["kind"], "status": "NO_ORACLE",
                "error": "no faithful catalog primitive %r" % fid}
    rep = fuzz.sweep(fid, catalog, times=times, max_params=max_params, max_hosts=max_hosts)
    worst = rep.get("worst_ddb")
    n = rep.get("n_scored", 0)
    max_sig = rep.get("max_oracle_signal", 0.0)
    if n == 0 or worst is None:
        status = "NO_SIGNAL"
    else:
        status = "VERIFIED" if worst >= pass_db else "DIVERGED"
    # keep only summary rows (divergent + a few) so the report stays small
    rows = rep.get("results", [])
    div = [r for r in rows if isinstance(r.get("ddb"), (int, float)) and r["ddb"] < pass_db]
    return {"id": node["id"], "kind": node["kind"], "status": status,
            "metric": "delta_ddb", "worst_ddb": worst, "n_scored": n,
            "max_oracle_signal": max_sig, "pass_db": pass_db,
            "oracle_truth": node.get("oracle_truth", "headless"),
            "faithful_id": fid, "used_synthetic": rep.get("used_synthetic", False),
            "worst_rows": sorted(div, key=lambda r: r.get("ddb", 999))[:8]}


if __name__ == "__main__":
    reg = json.load(open(REPO / "fct" / "parity" / "registry.json"))
    node = [n for n in reg["nodes"] if n["kind"] == "filter"][0]
    r = sweep_filter_node(node, 40.0, max_params=1, max_hosts=1, times=(0.5,))
    print(json.dumps({k: v for k, v in r.items() if k != "worst_rows"}, indent=2))
