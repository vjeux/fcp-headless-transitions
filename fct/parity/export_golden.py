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

# ALPHA-channel transfer nodes (e.g. the luma keyer, whose entire signal is the keyed alpha,
# not RGB) are EXCLUDED from this RGB colour-nodes golden — the colour-nodes.node.test.ts
# reader compares 3-vector RGB oracles and cannot consume a scalar-alpha oracle. Those nodes
# are verified via their own live `fct parity` sweep (channel=="alpha" path) PLUS a dedicated
# node-boundary golden in their filter test (e.g. engine/test/luma-keyer.test.ts, 88 real
# headless-FCP alpha samples). Filtered by the registry's channel flag so it stays automatic.
_ALPHA_NODES = {n["id"] for n in REG["nodes"] if n.get("channel") == "alpha"}
NODES = [nid for nid in NODES if nid not in _ALPHA_NODES]

# Nodes whose decode is VERIFIED and SHOULD match headless within tol (a regression here is
# a real break). Everything else is coverage-only (expected to diverge until decoded/shipped).
VERIFIED = {
    "transfer.PAEColorize", "transfer.PAETint", "transfer.PAEHSVAdjust_valsat", "transfer.PAEHSVAdjust_value", "transfer.PAEHSVAdjust_saturation", "transfer.PAEHSVAdjust_hue_ingamut",
    "transfer.PAELevels", "transfer.PAELevels_remap", "transfer.PAELevels_outremap", "transfer.PAELevels_combined", "transfer.PAELevels_perchannel", "transfer.PAEChannelMixer", "transfer.PAEChannelMixer_offset",
    "transfer.PAEBrightness_darken",
    "transfer.PAEBrightness_brighten",
    "transfer.PAEThreshold", "transfer.PAEFill",
    "transfer.PAEContrast_gray",
    "transfer.PAEContrast_ingamut",
    "transfer.PAEHSVAdjust_combined_ingamut",
    # Promoted 2026-07-23 — the over-1.0 "clamp" divergence was PROVEN to be a CoreGraphics
    # ExtendedLinearSRGB->sRGB readback artifact in the shim (NOT FCP effect math). These nodes'
    # oracles are now captured with OZ_CLAMP_UNIT (per-channel [0,1] clamp before the CG write,
    # a strict no-op in-gamut), so the golden reflects the TRUE per-channel FCP effect that the
    # engine matches. See fct/parity/evidence/shared_clamp_overflow_analysis.txt (2026-07-23p).
    "transfer.PAEBrightness",
    "transfer.PAEContrast",
    "transfer.PAEChannelMixer_clip",
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
