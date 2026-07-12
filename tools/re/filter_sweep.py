#!/usr/bin/env python3
"""tools/re/filter_sweep.py — Phase-2 full-parameter-space verification suite.

Runs a committed matrix of parameter sweeps (tools/re/filter_sweeps.json) for EACH
registered filter through the REAL headless FCP engine AND the TS engine
(tools/re/filter_verify.py under the hood), and reports PSNR / mean|err| per case.
This is the "verify behavior is identical across ALL inputs, including values the 65
built-in transitions don't exercise" requirement, as a repeatable artifact instead of
ad-hoc /tmp probes.

  filter_sweep.py                 # run all filters
  filter_sweep.py <name> [name..] # run named filters (keys in filter_sweeps.json)
  filter_sweep.py --list          # list available sweep keys

A case is PASS if psnr >= its 'min_psnr' (default 32) AND headless_vs_input_mad >= 1.5
(the filter genuinely applied — not an identity/ignored probe). Filters known to hit a
structural ceiling (Underwater noise field, etc.) declare "ceiling": true and are
reported but not counted as failures.

Run with the FCP frameworks on the path (filter_verify handles its own subprocess env):
  DYLD_FRAMEWORK_PATH="/Applications/Final Cut Pro.app/Contents/Frameworks" \
    PYTHONPATH="$PWD" venv/bin/python3 tools/re/filter_sweep.py [name...]
"""
import os, sys, json, subprocess

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FW = "/Applications/Final Cut Pro.app/Contents/Frameworks"
SWEEPS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "filter_sweeps.json")


def run_case(spec, time=0.0):
    env = dict(os.environ, PYTHONPATH=REPO, DYLD_FRAMEWORK_PATH=FW)
    r = subprocess.run([sys.executable, os.path.join(REPO, "tools/re/filter_verify.py"),
                        "--spec", json.dumps(spec), "--time", str(time)],
                       env=env, cwd=REPO, capture_output=True, text=True)
    try:
        return json.loads(r.stdout)
    except json.JSONDecodeError:
        return {"error": (r.stderr or r.stdout)[-200:]}


def main(argv):
    sweeps = json.load(open(SWEEPS))
    if argv and argv[0] == "--list":
        for k, v in sweeps.items():
            print(f"{k:14s} {v['uuid']}  ({len(v['cases'])} cases){'  [CEILING]' if v.get('ceiling') else ''}")
        return
    keys = [a for a in argv if not a.startswith("--")] or list(sweeps.keys())
    total_pass = total_fail = 0
    for key in keys:
        f = sweeps[key]
        ceiling = f.get("ceiling", False)
        min_psnr = f.get("min_psnr", 32)
        print(f"\n=== {key} ({f['uuid']}){'  [CEILING — not counted]' if ceiling else ''} ===")
        for case in f["cases"]:
            spec = {"uuid": f["uuid"], "pluginName": f["pluginName"], "params": case["params"]}
            res = run_case(spec, case.get("time", 0.0))
            if "error" in res:
                print(f"  {case['label']:28s} ERROR {res['error']}"); 
                if not ceiling: total_fail += 1
                continue
            psnr = res.get("psnr", 0); mae = res.get("mean_abs_err", 99)
            hvi = res.get("headless_vs_input_mad", 0)
            # Alpha-keying filters (Luma Keyer) carry their whole effect in the MATTE, so
            # gate them on alpha_psnr (RGB is an un-premultiplied passthrough there). All
            # other filters gate on the RGB psnr. `alpha: true` in the sweep entry selects.
            is_alpha = f.get("alpha", False)
            score = res.get("alpha_psnr", 0) if is_alpha else psnr
            applied = hvi >= 1.5
            # A case flagged "identity": true is EXPECTED to be a no-op (the params are
            # the filter's neutral point); a near-identity headless output there is a
            # PASS (the TS engine also being near-identity is correct), not a "not
            # applied" failure.
            is_identity = case.get("identity", False)
            is_gap = case.get("gap", False)  # documented unexercised-input divergence
            if is_identity:
                ok = score >= min_psnr  # both near-identity -> high psnr -> pass
            else:
                ok = score >= min_psnr and applied
            if is_gap:
                tag = "GAP" if not ok else "PASS"
            else:
                tag = "PASS" if ok else ("ceiling" if ceiling else "FAIL")
            if not ceiling and not is_gap:
                total_pass += ok; total_fail += (not ok)
            warn = "" if (applied or is_identity) else " (IDENTITY — not applied)"
            ascore = f" a_psnr={res.get('alpha_psnr', 0):5.2f}" if is_alpha else ""
            print(f"  {case['label']:28s} psnr={psnr:5.2f}{ascore} mae={mae:5.2f} hvi={hvi:5.1f} [{tag}]{warn}")
    print(f"\n{'='*50}\nTOTAL: {total_pass} pass, {total_fail} fail (ceilings excluded)")
    return 1 if total_fail else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
