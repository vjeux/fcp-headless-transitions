#!/usr/bin/env python3
"""introspect.py — periodic DEEP-INTROSPECTION brain for the raw-port swarm.

Purpose (per vjeux 2026-08-09): the swarm has plenty of TACTICAL loops (workers port,
reviewers merge) but NOTHING that stands back and asks "is this actually working,
and should we change the approach?" Every strategic re-evaluation so far happened only because a
human asked. This closes that gap: an evidence-first monitor that watches the burn-down and
SELF-ADJUSTS its own cadence — runs often when things are changing/wrong, backs off when steady.

DESIGN PRINCIPLES (from the literature check, LITERATURE.md):
  - Numbers first, prose second. Health comes from NON-GAMEABLE git-derived metrics
    (progress_tracker.py, itself git-sourced), never vibes.
  - It REPORTS; it does not autonomously rewrite the queue/gates. It flags for a human/agent.
  - Self-clocking: it proposes its OWN next interval based on what it sees.

  introspect.py analyze         # compute health signals + recommended cadence; print JSON + human
  introspect.py cadence         # print ONLY the recommended next-interval minutes (for the scheduler)

STATE: reads raw-port/army/progress_log.csv (the time series). Appends an analysis row to
       raw-port/army/introspect_log.csv so cadence decisions are themselves auditable over time.
"""
import csv, os, sys, json, subprocess, datetime, statistics

ROOT = subprocess.run(["git","rev-parse","--show-toplevel"],capture_output=True,text=True).stdout.strip() or "."
PLOG = os.path.join(ROOT,"raw-port/army/progress_log.csv")
ILOG = os.path.join(ROOT,"raw-port/army/introspect_log.csv")

# --- cadence bounds (minutes). vjeux: "start hourly, then slow down / speed up on its own findings"
MIN_INTERVAL = 60          # never faster than hourly (avoid thrash; strategic review isn't tactical)
MAX_INTERVAL = 1440        # never slower than daily (always at least a daily heartbeat)
START_INTERVAL = 60

def _rows():
    if not os.path.exists(PLOG): return []
    with open(PLOG) as f:
        return list(csv.DictReader(f))

def _dt(s):
    try: return datetime.datetime.fromisoformat(s)
    except Exception: return None

def _num(r,k):
    try: return float(r.get(k,0) or 0)
    except Exception: return 0.0

def analyze():
    allrows=_rows()
    now=datetime.datetime.now(datetime.timezone.utc)
    # Prefer the GROUND-TRUTH series: rows that carry ported_real. Fall back to the full series
    # (fn_cited proxy) only if fewer than 2 ground-truth rows exist yet, and flag it loudly.
    real_rows=[r for r in allrows if (r.get("ported_real") not in (None,""))]
    if len(real_rows)>=2:
        rows=real_rows; basis="ported_real"
    else:
        rows=allrows; basis="fn_cited(PROXY,~6x high)"
    out={"ts":now.isoformat(),"n_points":len(rows),"n_ground_truth":len(real_rows),"basis":basis}
    if len(rows)<2:
        # Not enough history to judge a trend. Stay hourly, gather data.
        out.update({"verdict":"BOOTSTRAP","reason":"fewer than 2 datapoints — need history to assess trend",
                    "recommend_interval_min":START_INTERVAL,"signals":{}})
        return out

    last, prev = rows[-1], rows[-2]
    t_last, t_prev = _dt(last["utc_time"]), _dt(prev["utc_time"])
    dt_h = max((t_last-t_prev).total_seconds()/3600.0, 1e-6) if (t_last and t_prev) else 1.0

    # PRIMARY progress signal = ledger status=ported (GROUND TRUTH — a genuine ported body).
    # NOT fn_cited (@0xADDR token count), which over-counts ~6x: one function cites ~35 addresses
    # (its entry + every constant/field-offset/instruction site). Old log rows may lack ported_real;
    # fall back to fn_cited ONLY then, and flag it, so a mixed series doesn't silently mislead.
    def prog(r):
        if basis=="ported_real": return _num(r,"ported_real"), True
        return _num(r,"fn_cited"), False
    pL, real_last = prog(last)
    pP, _         = prog(prev)
    metric = basis
    d_fn   = pL - pP
    d_merge= _num(last,"merges")   - _num(prev,"merges")
    d_ts   = _num(last,"ported_ts")- _num(prev,"ported_ts")
    fn_per_h    = d_fn/dt_h
    merge_per_h = d_merge/dt_h

    # longer-baseline rate (first->last) to detect a plateau vs a blip
    f0 = prog(rows[0])[0]; fL = pL
    t0 = _dt(rows[0]["utc_time"])
    span_h = max((t_last-t0).total_seconds()/3600.0,1e-6) if (t0 and t_last) else 1.0
    fn_per_h_life = (fL-f0)/span_h

    # recent window (last up-to-6 points) slope, to see accel/decel
    recent = rows[-6:]
    slopes=[]
    for a,b in zip(recent,recent[1:]):
        ta,tb=_dt(a["utc_time"]),_dt(b["utc_time"])
        if ta and tb:
            h=max((tb-ta).total_seconds()/3600.0,1e-6)
            slopes.append((prog(b)[0]-prog(a)[0])/h)
    recent_rate = statistics.mean(slopes) if slopes else fn_per_h

    total = 126668
    # Coverage %/ETA/remaining are ONLY meaningful on the ground-truth (ported_real) basis. On the
    # fn_cited proxy basis these are ~6x wrong, so we DO NOT report them — the proxy is used only for
    # a rough RATE trend to drive cadence, never as a coverage figure.
    if basis=="ported_real":
        remaining = total - fL
        eta_days = (remaining/ (recent_rate*24)) if recent_rate>0 else None
        pct = round(100.0*fL/total,2)
    else:
        remaining = None; eta_days = None; pct = None

    # ---- verdict + cadence logic -------------------------------------------------------
    # thresholds are deliberately simple + explainable.
    verdict="STEADY"; reason=[]; interval=None
    if d_fn < 0 or d_merge < 0:
        verdict="REGRESSION"; reason.append("coverage or merges DECREASED since last check (main went backwards?)")
        interval=MIN_INTERVAL           # something's wrong -> look often
    elif recent_rate <= 0.5 and fn_per_h_life > 2:
        verdict="PLATEAU"; reason.append(f"recent coverage rate {recent_rate:.1f}/h collapsed vs lifetime {fn_per_h_life:.1f}/h")
        interval=MIN_INTERVAL           # stalled after being productive -> investigate fast
    elif recent_rate <= 0.5:
        verdict="IDLE"; reason.append(f"near-zero progress ({recent_rate:.1f} fn/h) — swarm likely not running")
        interval=180                    # nothing happening -> don't burn cycles, check every 3h
    elif recent_rate >= max(2*fn_per_h_life, 5):
        verdict="ACCELERATING"; reason.append(f"recent {recent_rate:.1f}/h >> lifetime {fn_per_h_life:.1f}/h — healthy, watch less often")
        interval=240                    # going great -> back off to every 4h
    else:
        verdict="STEADY"; reason.append(f"progress nominal ({recent_rate:.1f} fn/h)")
        interval=120                    # normal -> every 2h

    interval=max(MIN_INTERVAL,min(MAX_INTERVAL,interval))
    out.update({
        "verdict":verdict,
        "reason":"; ".join(reason),
        "recommend_interval_min":interval,
        "signals":{
            "metric":metric,
            "dt_hours":round(dt_h,2),
            "ported_now":int(fL),
            "fn_delta":int(d_fn),"fn_per_hour":round(fn_per_h,2),
            "fn_per_hour_lifetime":round(fn_per_h_life,2),
            "recent_rate_per_hour":round(recent_rate,2),
            "merges_now":int(_num(last,'merges')),"merge_delta":int(d_merge),"merge_per_hour":round(merge_per_h,2),
            "ported_ts_delta":int(d_ts),
            "remaining_functions": (int(remaining) if remaining is not None else None),
            "eta_days_at_recent_rate": round(eta_days,1) if eta_days else None,
            "pct_complete": pct,
        },
    })
    return out

def _append_ilog(a):
    new=not os.path.exists(ILOG)
    with open(ILOG,"a") as f:
        if new: f.write("utc_time,verdict,recommend_interval_min,basis,ported,fn_per_hour,recent_rate,merges,remaining,eta_days\n")
        s=a.get("signals",{})
        f.write(f"{a['ts']},{a['verdict']},{a['recommend_interval_min']},{a.get('basis','')},{(s.get('ported_now','') if a.get('basis')=='ported_real' else '')},"
                f"{s.get('fn_per_hour','')},{s.get('recent_rate_per_hour','')},{s.get('merges_now','')},"
                f"{s.get('remaining_functions','')},{s.get('eta_days_at_recent_rate','')}\n")

if __name__=="__main__":
    cmd=sys.argv[1] if len(sys.argv)>1 else "analyze"
    a=analyze()
    if cmd=="cadence":
        print(a["recommend_interval_min"]); sys.exit(0)
    _append_ilog(a)
    print(json.dumps(a,indent=2))
    s=a.get("signals",{})
    print("\n=== INTROSPECTION ===")
    print(f"  verdict         : {a['verdict']}  ({a['reason']})")
    print(f"  next interval   : {a['recommend_interval_min']} min")
    if s:
        if s.get('pct_complete') is not None:
            print(f"  coverage        : {s['ported_now']:,} ported = {s['pct_complete']}% of 126,668  ({s['remaining_functions']:,} remaining)  [ground truth]")
        else:
            print(f"  coverage        : (not reported — only {a.get('n_ground_truth',0)} ground-truth datapoint(s); need >=2. rate trend uses {s['metric']})")
        print(f"  recent rate     : {s['recent_rate_per_hour']} fn/h  (lifetime {s['fn_per_hour_lifetime']} fn/h)")
        print(f"  merges          : {s['merges_now']:,} (+{s['merge_delta']} since last, {s['merge_per_hour']}/h)")
        print(f"  ETA (naive)     : {s['eta_days_at_recent_rate']} days at recent rate")
