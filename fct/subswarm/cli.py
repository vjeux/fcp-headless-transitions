#!/usr/bin/env python3
"""fct/subswarm/cli.py — the `fct subswarm ...` command surface.

Per-subsystem FCP-oracle testing for the parallel improvement swarm. An agent runs ONLY its
subsystem's tests — a caps pack (synthetic single-node scenes vs headless FCP) + its
minimized real-slug repros (fct min-score) — NEVER the 65-slug GUI-GT suite (slow + race-prone).

  fct subswarm list                       list the subsystems + owned files + tests
  fct subswarm list <subsystem>           list one subsystem's caps pack + minimized cases
  fct subswarm test <subsystem> [cap...]  run the subsystem's caps pack (+ min-score) vs FCP
  fct subswarm caps <subsystem> [cap...]  run ONLY the caps pack (fast, synthetic nodes)
  fct subswarm status                     scoreboard across subsystems (reads results/ on disk)
  fct subswarm brief <subsystem>          print the navi sub-agent brief for this subsystem
"""
import os, sys, json, subprocess

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
HERE = os.path.dirname(os.path.abspath(__file__))
SUBS = json.load(open(os.path.join(HERE, "subsystems.json")))
RESULTS = os.path.join(HERE, "results")

def _sub(name):
    if name not in SUBS:
        raise SystemExit(f"unknown subsystem {name!r}; known: {', '.join(SUBS)}")
    return SUBS[name]

def cmd_list(argv):
    if argv and argv[0] in SUBS:
        s = SUBS[argv[0]]
        print(f"# {argv[0]} — {s['title']}  (deficit {s['deficit']} dB)")
        print("owns files:");  [print("   ", f) for f in s["owns_files"]]
        pack = json.load(open(os.path.join(HERE, "packs", s["caps_pack"] + ".json")))
        print(f"caps pack ({len(pack)} nodes):"); [print(f"    {c['cap']:32s} min_psnr={c.get('min_psnr',34)}") for c in pack]
        print("minimized cases (node-level FCP repros):"); [print("   ", m) for m in s["minimized_cases"]]
        return 0
    print("subsystems (by dB deficit):")
    for k, s in sorted(SUBS.items(), key=lambda kv: -kv[1]["deficit"]):
        print(f"  {k:12s} deficit={s['deficit']:5.1f}  {s['title']}")
        print(f"               owns: {', '.join(os.path.basename(f) for f in s['owns_files'])}")
    return 0

def cmd_caps(argv):
    if not argv: raise SystemExit("usage: fct subswarm caps <subsystem> [cap ...]")
    name = argv[0]; s = _sub(name)
    from fct.subswarm import runner
    return runner.run(s["caps_pack"], only=argv[1:] or None)

def cmd_test(argv):
    """Run caps pack + min-score for one subsystem. This is what an agent runs to check
    its work — fast, isolated, FCP-truth, NO 65-slug suite."""
    if not argv: raise SystemExit("usage: fct subswarm test <subsystem> [cap ...]")
    name = argv[0]; s = _sub(name)
    from fct.subswarm import runner
    print(f"=== {name}: caps pack (synthetic nodes vs headless FCP) ===")
    caps_rc = runner.run(s["caps_pack"], only=argv[1:] or None)
    print(f"\n=== {name}: minimized real-slug repros (fct min-score, engine-vs-FCP) ===")
    # min-score reads frames off disk; run via the fct CLI so DYLD/venv handling matches.
    cases = s["minimized_cases"]
    rc2 = subprocess.call([os.path.join(REPO, "fct.sh"), "min-score"] + cases)
    return caps_rc or rc2

def cmd_status(argv):
    print("subsystem            caps         minimized")
    for k, s in sorted(SUBS.items(), key=lambda kv: -kv[1]["deficit"]):
        rp = os.path.join(RESULTS, s["caps_pack"] + ".json")
        caps = "—"
        if os.path.exists(rp):
            r = json.load(open(rp)); caps = f"{r['pass']}P/{r['fail']}F"
        mins = ", ".join(s["minimized_cases"])
        print(f"  {k:12s}       {caps:10s}   {mins}")
    print("\n(caps scoreboard reads fct/subswarm/results/<pack>.json; run "
          "`fct subswarm test <s>` to refresh. minimized dB via `fct min-score <case>`.)")
    return 0

def cmd_brief(argv):
    if not argv: raise SystemExit("usage: fct subswarm brief <subsystem>")
    from fct.subswarm import brief
    print(brief.render(argv[0]))
    return 0

def run(argv):
    if not argv or argv[0] in ("-h", "--help", "help"):
        print(__doc__); return 0
    sub = argv[0]; rest = argv[1:]
    return {"list": cmd_list, "caps": cmd_caps, "test": cmd_test,
            "status": cmd_status, "brief": cmd_brief}.get(sub, lambda a: (print(__doc__), 1)[1])(rest)
