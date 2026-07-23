"""fct.parity.export_golden — freeze REAL headless-FCP oracle samples from the transfer
reports into a committed golden JSON the fast TS node-tests consume (no FCP needed).

Each transfer report row is {param, input(rgb), oracle(rgb from REAL headless FCP), engine}.
We keep {uuid, pluginName, node_id, cases:[{params, input, oracle}]} per colour node so a
TS test can run the engine's isolated filter on `input` with `params` and assert it matches
`oracle` (headless FCP) within tolerance. This makes single-node validation fast + FCP-free
while staying anchored to REAL FCP output (the oracle values are captured, not synthesized).
"""
import json, pathlib
REPO = pathlib.Path(__file__).resolve().parents[2]
REPORTS = REPO / "fct/parity/reports"
REG = json.load(open(REPO / "fct/parity/registry.json"))
by_id = {n["id"]: n for n in REG["nodes"]}

# All colour transfer nodes with captured headless-FCP oracle rows. Nodes known to still
# DIVERGE (a decoded-but-unshipped mechanism, e.g. the HGColorMatrix over-1.0 clamp or the
# HSV hue rotation) are still frozen for COVERAGE — the test records each node's current
# per-node parity vs REAL headless FCP and flags expected-divergent ones instead of failing
# the run. Autodiscovered from the reports dir so new sweeps get coverage automatically.
import glob
NODES = sorted(
    pathlib.Path(p).stem
    for p in glob.glob(str(REPORTS / "transfer.*.json"))
)

# Nodes whose decode is VERIFIED and SHOULD match headless within tol (a regression here is
# a real break). Everything else is coverage-only (expected to diverge until decoded/shipped).
VERIFIED = {
    "transfer.PAEColorize", "transfer.PAETint", "transfer.PAEHSVAdjust_valsat",
    "transfer.PAELevels", "transfer.PAELevels_remap", "transfer.PAELevels_outremap", "transfer.PAELevels_combined", "transfer.PAEChannelMixer", "transfer.PAEChannelMixer_offset",
    "transfer.PAEBrightness_darken",
    "transfer.PAEBrightness_brighten",
    "transfer.PAEThreshold", "transfer.PAEFill",
    "transfer.PAEContrast_gray",
    "transfer.PAEContrast_ingamut",
    "transfer.PAEHSVAdjust_combined_ingamut",
}

out = {}
for nid in NODES:
    rep_path = REPORTS / f"{nid}.json"
    if not rep_path.exists():
        continue
    rep = json.load(open(rep_path))
    node = by_id.get(nid, {})
    oracle_spec = node.get("oracle", {})
    cases = []
    for row in rep.get("rows", []):
        if "oracle" not in row or "input" not in row:
            continue
        cases.append({
            "params": row["param"].get("params") or [row["param"]],
            "input": row["input"],
            "oracle": row["oracle"],
        })
    out[nid] = {
        "uuid": oracle_spec.get("uuid"),
        "pluginName": oracle_spec.get("pluginName"),
        "engine_env": node.get("engine_env", {}),
        "tol_levels": rep.get("tol_levels", 2.0),
        "verified": nid in VERIFIED,
        "n": len(cases),
        "cases": cases,
    }

dest = REPO / "engine/test/fixtures/headless_colour_golden.json"
dest.parent.mkdir(parents=True, exist_ok=True)
json.dump(out, open(dest, "w"), indent=1)
total = sum(v["n"] for v in out.values())
print(f"wrote {dest} — {len(out)} nodes, {total} REAL-headless-FCP golden cases")
for nid, v in out.items():
    print(f"  {nid}: {v['n']} cases, tol {v['tol_levels']}")
