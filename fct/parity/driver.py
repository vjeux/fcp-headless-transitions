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
# FILTER kind: image->image. filter_probe (REAL FCP) vs _filter_apply (TS), PSNR over sweep.
# ---------------------------------------------------------------------------------------
def _sweep_filter(node, metrics):
    from fct.parity import filter_node
    pass_db = metrics["filter"]["pass_db"]
    case_list = cases_mod.generate(node["cases"], node=node)
    worst = {"psnr": 1e9, "case": None, "hvi": None}
    scored = 0; skipped = 0; failures = []
    per_case = []
    for pv in case_list:
        try:
            r = filter_node.compare(node, pv)
        except Exception as ex:
            failures.append({"case": pv, "error": str(ex)[:200]}); continue
        # SIGNAL GATING: skip a param setting where the node was INERT (headless == input)
        # — nothing to verify there (identity_warning flags it).
        hvi = r.get("headless_vs_input_mad", 0.0)
        if "identity_warning" in r or hvi < 1.5:
            skipped += 1
            per_case.append({"case": pv, "psnr": r["psnr"], "hvi": hvi, "gated": True})
            continue
        scored += 1
        per_case.append({"case": pv, "psnr": r["psnr"], "hvi": hvi})
        if r["psnr"] < worst["psnr"]:
            worst.update(psnr=r["psnr"], case=pv, hvi=hvi)
    if scored == 0:
        status = "NO_SIGNAL"
    else:
        status = "VERIFIED" if worst["psnr"] >= pass_db else "DIVERGED"
    return {"id": node["id"], "kind": "filter", "status": status,
            "n_scored": scored, "n_gated": skipped,
            "worst_psnr": (None if scored == 0 else worst["psnr"]),
            "worst": {"case": worst["case"], "hvi": worst["hvi"]},
            "pass_db": pass_db, "oracle_truth": node.get("oracle_truth", "headless"),
            "n_failures": len(failures), "failures": failures[:5],
            "per_case": per_case,
            "swept": time.strftime("%Y-%m-%dT%H:%M:%SZ")}


def _record(st, report):
    nid = report["id"]
    st["nodes"][nid] = {k: v for k, v in report.items() if k not in ("failures", "per_case")}
    REPORTS.mkdir(exist_ok=True)
    json.dump(report, open(REPORTS / (nid + ".json"), "w"), indent=2)
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
            m = s.get("worst_psnr"); ms = ("psnr=%.1f" % m) if isinstance(m, (int, float)) else "-"
        print("  %-32s %-9s %-7s %-10s %s"
              % (n["id"], n.get("subsystem", "?"), n["kind"], _stt(st, n["id"]), ms))
    nxt = next((n["id"] for n in nodes if _stt(st, n["id"]) not in ("VERIFIED",)), None)
    print("  next:", nxt or "(all VERIFIED)")
    return nxt


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
            elif node["kind"] == "filter":
                report = _sweep_filter(node, metrics)
                _record(st, report)
                w = report.get("worst") or {}
                print("    -> %-9s worst_psnr=%s scored=%d gated=%d%s"
                      % (report["status"], report.get("worst_psnr"),
                         report.get("n_scored", 0), report.get("n_gated", 0),
                         ("  worst@%s" % (w.get("case"))) if report["status"] == "DIVERGED" else ""))
            else:
                print("    -> kind %r not yet implemented" % node["kind"])
    finally:
        if worker is not None:
            worker.close()


def step():
    reg = _registry(); st = _state()
    nxt = next((n["id"] for n in reg["nodes"] if _stt(st, n["id"]) not in ("VERIFIED",)), None)
    if nxt is None:
        print("  all nodes VERIFIED"); return
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
    elif cmd == "reset":
        reset(args[1:])
    else:
        print("unknown command:", cmd); sys.exit(2)


if __name__ == "__main__":
    main()
