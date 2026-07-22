"""
fct.parity.driver — NODE-BOUNDARY parity driver (compaction-proof, resumable).

The unit of truth is ONE .motr XML node + its params -> ONE isolated computation, verified
faithful (TS port == REAL FCP) across the node's param space. See DESIGN.md. This dispatches
by node KIND:
  - curve      : value->value. The computation a <curve interp=N> segment triggers is an
                 exact FCP function (easeInOut / OZBezierEval / OZBezierFindParameter),
                 called via the dlsym oracle; compared bit-exact to the TS port.
  - filter     : image->image. Isolate the <filter> node in REAL FCP (filter_probe) and TS
                 (_filter_apply) on the SAME (image,params); compare PSNR over the param sweep.
  - generator  : params->image (future).
  - transform  : params->matrix (future).

ALL state on disk (registry.json + state.json). A fresh post-compaction agent runs `status`.

Commands:
  python3 -m fct.parity.driver status
  python3 -m fct.parity.driver step
  python3 -m fct.parity.driver sweep <NODE_ID> | sweep --all
  python3 -m fct.parity.driver reset [<NODE_ID>]

dyld/SIP: the FILTER kind needs REAL FCP headless (DYLD + venv). The driver re-execs once
into the venv python with DYLD set (gated by a sentinel) so it works from any launcher —
same pattern as fct/faithful/driver.py. The CURVE kind (pure-math dlsym) needs neither, but
re-execing is harmless and keeps one launch path.
"""
import os
import sys
import pathlib

REPO = pathlib.Path(__file__).resolve().parents[2]
_FW = "/Applications/Final Cut Pro.app/Contents/Frameworks"
_VENV_PY = str(REPO / "venv" / "bin" / "python3")
if not os.environ.get("_FCT_PARITY_REEXEC"):
    if os.path.exists(_VENV_PY):
        os.environ["DYLD_FRAMEWORK_PATH"] = _FW
        os.environ["FXPLUG_USE_PLUGINKIT"] = "1"
        os.environ["_FCT_PARITY_REEXEC"] = "1"
        os.environ["PYTHONPATH"] = str(REPO) + os.pathsep + os.environ.get("PYTHONPATH", "")
        os.chdir(str(REPO))
        os.execv(_VENV_PY, [_VENV_PY, "-u", "-m", "fct.parity.driver"] + sys.argv[1:])

import json
import time

sys.path.insert(0, str(REPO))
from fct.parity import oracle, cases as cases_mod

PARITY = REPO / "fct" / "parity"
REGISTRY = PARITY / "registry.json"
STATE = PARITY / "state.json"
REPORTS = PARITY / "reports"


def _registry():
    return json.load(open(REGISTRY))


def _state():
    if STATE.exists():
        return json.load(open(STATE))
    return {"nodes": {}, "history": [], "started": time.strftime("%Y-%m-%dT%H:%M:%SZ")}


def _save(st):
    st["updated"] = time.strftime("%Y-%m-%dT%H:%M:%SZ")
    json.dump(st, open(STATE, "w"), indent=2)


def _stt(st, nid):
    return st["nodes"].get(nid, {}).get("status", "UNTESTED")


def _err(a, b):
    ae = abs(a - b)
    denom = max(abs(a), abs(b), 1e-12)
    return ae, ae / denom


# ---------------------------------------------------------------------------------------
# CURVE kind: value->value, exact. dlsym oracle vs TS worker.
# ---------------------------------------------------------------------------------------
def _sweep_curve(node, worker, metrics):
    tol_abs = metrics["curve"]["tol_abs"]; tol_rel = metrics["curve"]["tol_rel"]
    oc = node["oracle"]
    # oracle entry shape reused by oracle.call
    oentry = {"id": node["id"], "framework": oc["framework"], "symbol": oc["symbol"],
              "signature": oc["signature"], "outputs": oc["outputs"]}
    try:
        oracle.resolve(oc["framework"], oc["symbol"])
    except oracle.OracleError as e:
        return {"id": node["id"], "kind": "curve", "status": "NO_ORACLE", "error": str(e)}
    case_list = cases_mod.generate(node["cases"])
    compare = node["compare_outputs"]
    worst = {"abs": 0.0, "rel": 0.0, "case": None, "output": None, "oracle": None, "engine": None}
    n = 0; failures = []
    for args in case_list:
        try:
            o_out = oracle.call(oentry, args)
            e_out = worker.eval(node["ts_fn"], args)
        except Exception as ex:
            failures.append({"case": args, "error": str(ex)}); continue
        for name in compare:
            ov = o_out[name]; ev = e_out[name]
            pairs = zip(ov, ev) if isinstance(ov, list) else [(ov, ev)]
            for i, (a, b) in enumerate(pairs):
                ae, re_ = _err(a, b); n += 1
                if ae > worst["abs"]:
                    worst.update(abs=ae, rel=re_, case=args, output=name, oracle=a, engine=b)
    passed = (worst["abs"] <= tol_abs) or (worst["rel"] <= tol_rel)
    status = "VERIFIED" if (passed and not failures) else "DIVERGED"
    return {"id": node["id"], "kind": "curve", "status": status, "n_cases": n,
            "max_abs_err": worst["abs"], "max_rel_err": worst["rel"],
            "worst": {k: worst[k] for k in ("case", "output", "oracle", "engine")},
            "n_failures": len(failures), "failures": failures[:5],
            "tol_abs": tol_abs, "tol_rel": tol_rel,
            "swept": time.strftime("%Y-%m-%dT%H:%M:%SZ")}


# ---------------------------------------------------------------------------------------
# FILTER/GENERATOR kind: image node. DELEGATE to the FAITHFUL delta-response sweep (the
# proven in-host isolation). A static-source injection would be UNFAITHFUL (synth.py lesson),
# so parity does not re-implement it — it surfaces the faithful verdict under the node view.
# ---------------------------------------------------------------------------------------
def _sweep_filter(node, metrics):
    from fct.parity import filter_node
    pass_db = metrics[node["kind"]]["pass_db"]
    return filter_node.sweep_filter_node(node, pass_db)


def _record(st, report):
    nid = report["id"]
    st["nodes"][nid] = {k: v for k, v in report.items() if k not in ("failures", "per_case", "worst_rows")}
    REPORTS.mkdir(exist_ok=True)
    json.dump(report, open(REPORTS / (nid + ".json"), "w"), indent=2)  # full report (incl worst_rows) on disk
    st.setdefault("history", []).append(
        {"id": nid, "status": report["status"], "at": time.strftime("%Y-%m-%dT%H:%M:%SZ")})
    _save(st)


def status():
    reg = _registry(); st = _state(); nodes = reg["nodes"]
    def cnt(s): return len([n for n in nodes if _stt(st, n["id"]) == s])
    print("PARITY (node-boundary) — %d nodes | VERIFIED %d  DIVERGED %d  NO_SIGNAL %d  "
          "NO_ORACLE %d  UNTESTED %d"
          % (len(nodes), cnt("VERIFIED"), cnt("DIVERGED"), cnt("NO_SIGNAL"),
             cnt("NO_ORACLE"), cnt("UNTESTED")))
    print("  %-32s %-9s %-7s %-10s %s" % ("NODE", "SUBSYS", "KIND", "STATUS", "metric"))
    for n in nodes:
        s = st["nodes"].get(n["id"], {})
        if n["kind"] == "curve":
            m = s.get("max_abs_err"); ms = ("abs=%.1e" % m) if isinstance(m, (int, float)) else "-"
        else:
            m = s.get("worst_ddb"); ms = ("ddb=%.1f" % m) if isinstance(m, (int, float)) else "-"
        print("  %-32s %-9s %-7s %-10s %s"
              % (n["id"], n.get("subsystem", "?"), n["kind"], _stt(st, n["id"]), ms))
    # group the status line by subsystem for the journey view
    from collections import defaultdict
    bysub = defaultdict(lambda: [0, 0])  # subsystem -> [verified, total]
    for n in nodes:
        bysub[n.get("subsystem", "?")][1] += 1
        if _stt(st, n["id"]) == "VERIFIED":
            bysub[n.get("subsystem", "?")][0] += 1
    print("  subsystems: " + "  ".join("%s %d/%d" % (k, v[0], v[1]) for k, v in sorted(bysub.items())))
    owned_next = next((n["id"] for n in nodes if n["kind"] == "curve" and _stt(st, n["id"]) != "VERIFIED"), None)
    div_img = [n["id"] for n in nodes if n["kind"] in ("filter", "generator") and _stt(st, n["id"]) == "DIVERGED"]
    print("  next parity-owned:", owned_next or "(all curve/value VERIFIED)")
    if div_img:
        print("  delegated (faithful) DIVERGED:", ", ".join(div_img[:6]) + (" ..." if len(div_img) > 6 else ""))
    return owned_next


def sweep(ids):
    reg = _registry(); st = _state(); metrics = reg["metrics"]
    by_id = {n["id"]: n for n in reg["nodes"]}
    # trust gate for the curve kind (dlsym+worker); filter kind self-guards via identity_warning
    from fct.parity.bridge import TSWorker
    worker = None
    try:
        for nid in ids:
            node = by_id.get(nid)
            if node is None:
                print("  ?? unknown node id:", nid); continue
            print("  sweeping %s (%s)..." % (nid, node["kind"]), flush=True)
            if node["kind"] == "curve":
                if worker is None:
                    worker = TSWorker()
                    from fct.parity import selftest
                    ok, results = selftest.run(worker)
                    if not ok:
                        print("  HARNESS_BROKEN — refusing to record:")
                        for name, passed, detail in results:
                            if not passed: print("    FAIL %s: %s" % (name, detail))
                        return
                report = _sweep_curve(node, worker, metrics)
                _record(st, report)
                print("    -> %-9s max_abs_err=%.3e n=%d"
                      % (report["status"], report.get("max_abs_err", -1), report.get("n_cases", 0)))
            elif node["kind"] in ("filter", "generator"):
                report = _sweep_filter(node, metrics)
                _record(st, report)
                print("    -> %-9s worst_ddb=%s n_scored=%s max_sig=%s%s"
                      % (report["status"], report.get("worst_ddb"),
                         report.get("n_scored", 0), report.get("max_oracle_signal"),
                         ("  [%s]" % report["error"]) if report.get("error") else ""))
            else:
                print("    -> kind %r not yet implemented" % node["kind"])
    finally:
        if worker is not None:
            worker.close()


def sync_from_faithful():
    """Image (filter/generator) nodes DELEGATE to fct/faithful, which already sweeps them.
    Import faithful's current verdicts into the parity node view WITHOUT re-running the
    (expensive) sweeps — parity and faithful share the exact same oracle for these nodes, so
    faithful/state.json IS the authoritative image-node verdict. Curve nodes are unaffected
    (parity owns those exactly). Idempotent; safe to run any time."""
    reg = _registry(); st = _state()
    fstate = json.load(open(REPO / "fct" / "faithful" / "state.json"))
    fp = fstate.get("primitives", {})
    n = 0
    for node in reg["nodes"]:
        if node["kind"] not in ("filter", "generator"):
            continue
        fid = node.get("faithful_id")
        fv = fp.get(fid)
        if not fv:
            continue
        report = {"id": node["id"], "kind": node["kind"], "status": fv.get("status", "UNTESTED"),
                  "metric": "delta_ddb", "worst_ddb": fv.get("worst_ddb"),
                  "n_scored": fv.get("n_scored"), "max_oracle_signal": fv.get("max_oracle_signal"),
                  "pass_db": reg["metrics"][node["kind"]]["pass_db"],
                  "oracle_truth": node.get("oracle_truth", "headless"),
                  "faithful_id": fid, "synced_from": "fct/faithful/state.json",
                  "faithful_note": fv.get("note"), "faithful_verified_via": fv.get("verified_via"),
                  "swept": fv.get("swept")}
        _record(st, report)
        n += 1
    print("  synced %d image nodes from fct/faithful/state.json" % n)


def step():
    """Advance ONE parity-OWNED node (curve/value kind). Image (filter/generator) nodes are
    driven by the faithful driver — parity mirrors them via `sync`, so step does NOT re-run
    their expensive sweeps. If all curve nodes are VERIFIED, remind the user to sync/step
    faithful for image work."""
    reg = _registry(); st = _state()
    owned = [n for n in reg["nodes"] if n["kind"] == "curve"]
    nxt = next((n["id"] for n in owned if _stt(st, n["id"]) != "VERIFIED"), None)
    if nxt is None:
        print("  all parity-owned (curve/value) nodes VERIFIED. Image nodes delegate to "
              "fct/faithful — run `fct parity sync` to refresh, or advance them via the "
              "faithful driver.")
        return
    sweep([nxt])


def reset(ids):
    st = _state()
    if not ids:
        st["nodes"] = {}
    else:
        for nid in ids:
            st["nodes"].pop(nid, None)
    _save(st)
    print("  reset", ids or "ALL")


def main():
    args = sys.argv[1:]
    if not args or args[0] == "status":
        status(); return
    cmd = args[0]
    if cmd == "step":
        step()
    elif cmd == "sweep":
        if len(args) > 1 and args[1] == "--all":
            sweep([n["id"] for n in _registry()["nodes"]])
        else:
            sweep(args[1:])
    elif cmd == "sync":
        sync_from_faithful()
    elif cmd == "reset":
        reset(args[1:])
    else:
        print("unknown command:", cmd); sys.exit(2)


if __name__ == "__main__":
    main()
