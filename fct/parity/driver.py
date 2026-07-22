"""
fct.parity.driver — compaction-proof resumable driver for the SUBSYSTEM PARITY program.

Function-LEVEL equivalence between our TypeScript port and Apple's real FCP functions.
Unlike fct/faithful/ (whole-primitive frame PSNR), this calls ONE exported C++ symbol out
of FCP's frameworks (fct/parity/oracle.py) and the corresponding TS port
(fct/parity/bridge.py), feeds both identical input vectors (fct/parity/cases.py), and
records the max abs/rel error across the whole input domain.

ALL state lives on disk (registry.json + state.json). NO agent memory required — a fresh
post-compaction agent runs `status` to see exactly what's VERIFIED / DIVERGED / next.

Commands:
  python3 -m fct.parity.driver status          # per-function verdict table + next
  python3 -m fct.parity.driver step            # sweep the next non-VERIFIED function
  python3 -m fct.parity.driver sweep <ID>       # force-sweep one function (re-verify a fix)
  python3 -m fct.parity.driver sweep --all      # sweep every function
  python3 -m fct.parity.driver reset [<ID>]     # mark UNTESTED (all if no id)

NO DYLD / engine boot needed: the pure-math frameworks (ProCore/ProChannel/Helium/Lithium)
dlopen cleanly on their own (proven 2026-07-22). So this driver runs under plain python3 —
no venv re-exec, no GL context, no ~1.3s Ozone cold-boot.
"""
import json
import math
import os
import pathlib
import sys
import time

REPO = pathlib.Path(__file__).resolve().parents[2]
PARITY = REPO / "fct" / "parity"
REGISTRY = PARITY / "registry.json"
STATE = PARITY / "state.json"
REPORTS = PARITY / "reports"

sys.path.insert(0, str(REPO))
from fct.parity import oracle, cases as cases_mod
from fct.parity.bridge import TSWorker


def _registry():
    return json.load(open(REGISTRY))


def _state():
    if STATE.exists():
        return json.load(open(STATE))
    return {"functions": {}, "history": [], "started": time.strftime("%Y-%m-%dT%H:%M:%SZ")}


def _save(st):
    st["updated"] = time.strftime("%Y-%m-%dT%H:%M:%SZ")
    json.dump(st, open(STATE, "w"), indent=2)


def _stt(st, fid):
    return st["functions"].get(fid, {}).get("status", "UNTESTED")


def _err(a, b):
    """(abs_err, rel_err) between two scalars; rel is |a-b|/max(|a|,|b|,eps)."""
    ae = abs(a - b)
    denom = max(abs(a), abs(b), 1e-12)
    return ae, ae / denom


def sweep_one(entry, worker, tol_abs, tol_rel):
    """Sweep one function across all its cases. Returns a report dict."""
    fid = entry["id"]
    # 1) confirm the symbol exists (NO_SYMBOL is a distinct, honest status)
    try:
        oracle.resolve(entry["framework"], entry["symbol"])
    except oracle.OracleError as e:
        return {"id": fid, "status": "NO_SYMBOL", "error": str(e), "n_cases": 0}

    case_list = cases_mod.generate(entry["cases"])
    compare = entry["compare_outputs"]
    worst = {"abs": 0.0, "rel": 0.0, "case": None, "output": None,
             "oracle": None, "engine": None}
    n = 0
    failures = []
    for args in case_list:
        try:
            o_out = oracle.call(entry, args)
            e_out = worker.eval(fid, args)
        except Exception as ex:
            failures.append({"case": args, "error": str(ex)})
            continue
        for name in compare:
            ov = o_out[name]
            ev = e_out[name]
            if isinstance(ov, list):
                # elementwise (array output)
                for i, (a, b) in enumerate(zip(ov, ev)):
                    ae, re_ = _err(a, b)
                    n += 1
                    if ae > worst["abs"]:
                        worst.update(abs=ae, rel=re_, case=args, output="%s[%d]" % (name, i),
                                     oracle=a, engine=b)
            else:
                ae, re_ = _err(ov, ev)
                n += 1
                if ae > worst["abs"]:
                    worst.update(abs=ae, rel=re_, case=args, output=name, oracle=ov, engine=ev)
    passed = (worst["abs"] <= tol_abs) or (worst["rel"] <= tol_rel)
    status = "VERIFIED" if (passed and not failures) else ("ERROR" if failures and n == 0 else "DIVERGED")
    if passed and failures:
        status = "DIVERGED"  # errors count as divergence
    return {
        "id": fid,
        "status": status,
        "n_cases": n,
        "max_abs_err": worst["abs"],
        "max_rel_err": worst["rel"],
        "worst": {k: worst[k] for k in ("case", "output", "oracle", "engine")},
        "n_failures": len(failures),
        "failures": failures[:5],
        "tol_abs": tol_abs,
        "tol_rel": tol_rel,
        "swept": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
    }


def _record(st, report):
    fid = report["id"]
    st["functions"][fid] = {k: v for k, v in report.items() if k != "failures"}
    REPORTS.mkdir(exist_ok=True)
    json.dump(report, open(REPORTS / (fid + ".json"), "w"), indent=2)
    st.setdefault("history", []).append(
        {"id": fid, "status": report["status"], "max_abs_err": report.get("max_abs_err"),
         "at": time.strftime("%Y-%m-%dT%H:%M:%SZ")})
    _save(st)


def status():
    reg = _registry(); st = _state(); fns = reg["functions"]
    def cnt(s): return len([f for f in fns if _stt(st, f["id"]) == s])
    print("PARITY — %d functions | VERIFIED %d  DIVERGED %d  NO_SYMBOL %d  UNTESTED %d "
          "| tol_abs=%.0e tol_rel=%.0e"
          % (len(fns), cnt("VERIFIED"), cnt("DIVERGED"), cnt("NO_SYMBOL"),
             len([f for f in fns if _stt(st, f["id"]) in ("UNTESTED",)]),
             reg["tol_abs"], reg["tol_rel"]))
    print("  %-24s %-10s %-9s %-12s %s" % ("ID", "SUBSYS", "STATUS", "max_abs_err", "n"))
    for f in fns:
        s = st["functions"].get(f["id"], {})
        mae = s.get("max_abs_err")
        mae_s = ("%.2e" % mae) if isinstance(mae, (int, float)) else "-"
        print("  %-24s %-10s %-9s %-12s %s"
              % (f["id"], f.get("subsystem", "?"), _stt(st, f["id"]), mae_s, s.get("n_cases", "-")))
    nxt = next((f["id"] for f in fns if _stt(st, f["id"]) != "VERIFIED"), None)
    print("  next:", nxt or "(all VERIFIED)")
    return nxt


def sweep(ids):
    reg = _registry(); st = _state()
    by_id = {f["id"]: f for f in reg["functions"]}
    worker = TSWorker()
    try:
        # TRUST GATE: a broken harness must never drive a verdict (mirrors faithful/).
        from fct.parity import selftest
        ok, results = selftest.run(worker)
        if not ok:
            print("  HARNESS_BROKEN — refusing to record verdicts:")
            for name, passed, detail in results:
                if not passed:
                    print("    FAIL %s: %s" % (name, detail))
            return
        for fid in ids:
            entry = by_id.get(fid)
            if entry is None:
                print("  ?? unknown function id:", fid); continue
            print("  sweeping %s (%s cases)..." % (fid, entry["cases"]), flush=True)
            report = sweep_one(entry, worker, reg["tol_abs"], reg["tol_rel"])
            _record(st, report)
            w = report.get("worst") or {}
            print("    -> %-9s max_abs_err=%.3e max_rel_err=%.3e n=%d%s"
                  % (report["status"], report.get("max_abs_err", -1),
                     report.get("max_rel_err", -1), report.get("n_cases", 0),
                     ("  worst@%s: oracle=%s engine=%s case=%s"
                      % (w.get("output"), w.get("oracle"), w.get("engine"), w.get("case")))
                     if report["status"] == "DIVERGED" else ""))
    finally:
        worker.close()


def step():
    reg = _registry(); st = _state()
    nxt = next((f["id"] for f in reg["functions"] if _stt(st, f["id"]) != "VERIFIED"), None)
    if nxt is None:
        print("  all functions VERIFIED — nothing to do"); return
    sweep([nxt])


def reset(ids):
    st = _state()
    if not ids:
        st["functions"] = {}
    else:
        for fid in ids:
            st["functions"].pop(fid, None)
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
            sweep([f["id"] for f in _registry()["functions"]])
        else:
            sweep(args[1:])
    elif cmd == "reset":
        reset(args[1:])
    else:
        print("unknown command:", cmd); sys.exit(2)


if __name__ == "__main__":
    main()
