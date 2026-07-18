"""Compaction-proof resumable driver for the faithful-reimplementation program.

ALL state lives on disk (catalog.json + state.json). NO agent memory required.
A scheduled clock ('faithful-tick') calls `step` every interval; a fresh post-compaction
agent runs `status` to know exactly where things stand and resume.

Commands:
  python3 -m fct.faithful.driver status        # done / diverged / next (human summary)
  python3 -m fct.faithful.driver step          # advance ONE primitive (sweep + record + todo)
  python3 -m fct.faithful.driver sweep <PRIM>  # force-sweep one primitive (re-verify a fix)
  python3 -m fct.faithful.driver reset <PRIM>  # mark UNTESTED again

Each `step`: (1) loads catalog+state from disk (source of truth, NOT memory); (2) picks the
highest-priority primitive with status != VERIFIED; (3) fuzz-sweeps it (oracle vs engine);
(4) worst_db>=pass_db -> VERIFIED, else DIVERGED + files a swarm todo with evidence;
(5) persists state.json + reports/<prim>.json. Idempotent + resumable across compaction.
"""
import os, sys, json, time, pathlib
REPO = pathlib.Path(__file__).resolve().parents[2]

# Headless FCP needs DYLD_FRAMEWORK_PATH honored by dyld AND the venv python
# (numpy/PIL/objc). SUBTLE dyld trap (root-caused 2026-07-17): when bash launches the
# adhoc-signed Homebrew python directly, dyld STRIPS DYLD_* from the loader BEFORE python
# starts — even though `os.environ["DYLD_FRAMEWORK_PATH"]` still SHOWS the value (bash
# passed it in the env array; dyld just ignored it for THIS process's library search).
# The value is only honored on a launch that comes from an `os.execv` of ANOTHER running
# python. So we MUST re-exec exactly once, from python, with DYLD set — and we must NOT
# gate that on realpath(sys.executable) (venv python and base Homebrew python share the
# SAME realpath, so that guard never fires) nor on DYLD already being in environ (it's in
# environ but NOT honored). The ONLY correct gate is a private sentinel: bootstrap once,
# unconditionally, into the venv python with DYLD set. This makes the driver work from any
# launcher (bash, base python, venv python, a scheduled clock) with no wrapper.
_FW = "/Applications/Final Cut Pro.app/Contents/Frameworks"
_VENV_PY = str(REPO / "venv" / "bin" / "python3")
if not os.environ.get("_FCT_FAITHFUL_REEXEC"):
    if not os.path.exists(_VENV_PY):
        sys.stderr.write("FATAL: venv python missing at %s — cannot boot FCP headless engine\n" % _VENV_PY)
        sys.exit(3)
    os.environ["DYLD_FRAMEWORK_PATH"] = _FW
    os.environ["FXPLUG_USE_PLUGINKIT"] = "1"
    os.environ["_FCT_FAITHFUL_REEXEC"] = "1"
    os.environ["PYTHONPATH"] = str(REPO) + os.pathsep + os.environ.get("PYTHONPATH", "")
    os.chdir(str(REPO))
    os.execv(_VENV_PY, [_VENV_PY, "-u", "-m", "fct.faithful.driver"] + sys.argv[1:])

FA = REPO / 'fct' / 'faithful'
CATALOG = FA / 'catalog.json'; STATE = FA / 'state.json'; REPORTS = FA / 'reports'
TODO = REPO / 'fct' / 'swarm' / 'todo'

def _catalog(): return json.load(open(CATALOG))
def _state():
    if STATE.exists(): return json.load(open(STATE))
    return {'primitives': {}, 'history': [], 'started': time.strftime('%Y-%m-%dT%H:%M:%SZ')}
def _save(st):
    st['updated'] = time.strftime('%Y-%m-%dT%H:%M:%SZ'); json.dump(st, open(STATE, 'w'), indent=2)

def _stt(st, pid): return st['primitives'].get(pid, {}).get('status', 'UNTESTED')

def status():
    cat = _catalog(); st = _state(); prims = cat['primitives']
    def cnt(s): return len([p for p in prims if _stt(st, p['id']) == s])
    u = [p['id'] for p in prims if _stt(st, p['id']) not in ('VERIFIED', 'DIVERGED', 'ERROR')]
    print("FAITHFUL — %d primitives | VERIFIED %d  DIVERGED %d  ERROR %d  UNTESTED %d | pass_db=%.0f"
          % (len(prims), cnt('VERIFIED'), cnt('DIVERGED'), cnt('ERROR'), len(u), cat['pass_db']))
    for p in prims:
        s = st['primitives'].get(p['id'], {})
        print("  #%2d %-20s %-9s hosts=%d worst_ddb=%s n=%s" % (
            p['priority'], p['id'], _stt(st, p['id']), p['host_count'],
            s.get('worst_ddb', '-'), s.get('n_scored', '-')))
    nxt = next((p['id'] for p in prims if _stt(st, p['id']) != 'VERIFIED'), None)
    print("NEXT:", nxt or "ALL VERIFIED")
    return nxt

def _selftest_ok():
    """Run the harness self-test (T1..T5). MANDATORY gate: a broken harness must NEVER
    record a primitive verdict or file a todo. Returns True only if HARNESS TRUSTWORTHY."""
    from fct.faithful import selftest
    try:
        return selftest.main(pass_db=_catalog()['pass_db']) == 0
    except Exception as ex:
        print("SELFTEST CRASHED:", str(ex)[:300]); return False

def _file_todo(prim, rep, cat):
    TODO.mkdir(parents=True, exist_ok=True)
    worst = [r for r in rep.get('results', []) if 'ddb' in r][:6]
    tid = 'T-faithful-%s' % prim.lower()
    body = {'id': tid,
      'title': 'Faithful: %s param-response diverges from headless FCP (worst ddb %.1f dB)' % (prim, rep['worst_ddb']),
      'project': 'fct',
      'goal': ('FAITHFUL-REIMPL (ROADMAP Rule 13): the TS engine impl of %s must match REAL headless FCP '
               'across its ENTIRE parameter space, not just values the 65 fixed transitions use. The DELTA '
               'oracle (fct/faithful) set each continuous param of %s to range extremes across hosts %s and '
               'compared how the oracle vs the engine RESPOND: ddb=PSNR(oracle(theta)-oracle(theta0), '
               'engine(theta)-engine(theta0)). worst ddb=%.2f < pass %.0f means the engine responds WRONGLY '
               'to a real parameter change (a faithful engine scores ~99 dB; the identity/noise floor is 99). '
               'Fix the %s implementation so its parameter response matches FCP. NO scene-signature dispatch, '
               'NO env flags (Rule 12/13): behavior = f(filter params) only. Re-verify: '
               '`python3 -m fct.faithful.driver sweep %s` must reach >= pass_db worst-ddb across all hosts. '
               'Worst diverging (host/param/theta -> ddb): %s'
               % (prim, prim, rep['hosts'], rep['worst_ddb'], cat['pass_db'], prim, prim, json.dumps(worst))),
      'slugs': [], 'after': None, 'status': 'open', 'created_by': 'faithful-driver',
      'created_at': time.strftime('%Y-%m-%dT%H:%M:%SZ'),
      'notes': 'Auto-filed by fct/faithful/driver.py. Evidence: fct/faithful/reports/%s.json' % prim}
    json.dump(body, open(TODO / (tid + '.json'), 'w'), indent=2)
    return tid

def sweep_one(prim_id, skip_selftest=False):
    cat = _catalog()
    # MANDATORY selftest gate (R1). Never record a verdict from a broken harness.
    if not skip_selftest and not _selftest_ok():
        print("%s -> ABORT: harness self-test FAILED (no verdict recorded)" % prim_id)
        st = _state()
        st['primitives'][prim_id] = {'status': 'HARNESS_BROKEN',
                                     'swept': time.strftime('%Y-%m-%dT%H:%M:%SZ')}
        _save(st); return {'status': 'HARNESS_BROKEN'}
    from fct.faithful import fuzz
    rep = fuzz.sweep(prim_id, cat)
    REPORTS.mkdir(exist_ok=True)
    json.dump(rep, open(REPORTS / ('%s.json' % prim_id), 'w'), indent=2)
    st = _state()
    e = {'worst_ddb': rep.get('worst_ddb'), 'n_scored': rep.get('n_scored'),
         'max_oracle_signal': rep.get('max_oracle_signal'),
         'hosts': rep.get('hosts'), 'swept': time.strftime('%Y-%m-%dT%H:%M:%SZ')}
    wd = rep.get('worst_ddb')
    prim = next((p for p in cat['primitives'] if p['id'] == prim_id), {})
    is_filter = prim.get('node_type') == 'filter'
    if rep.get('n_scored', 0) == 0 or wd is None:
        # No host produced a scorable oracle signal for any continuous param — cannot verify.
        # max_oracle_signal disambiguates the fix: >floor somewhere means "widen the time set";
        # ~0 everywhere means the filter is occluded in every host and needs a SYNTHETIC scene.
        e['status'] = 'NO_SIGNAL'
    elif wd >= cat['pass_db']:
        # A FILTER verified purely from the SYNTHETIC scene is NOT trustworthy: the filter synth
        # (static full-frame source A) triggers different behavior than the real animated/stacked
        # transition (PAELevels two-stage synth artifact, 2026-07-18 — see synth.py). Require a
        # full-transition headless cross-check before trusting it. GENERATORS are exempt (their
        # synth IS faithful — they produce their own image, e.g. ColorSolid VERIFIED).
        if is_filter and rep.get('used_synthetic'):
            e['status'] = 'NEEDS_FULLXCHECK'
            e['note'] = ('filter verified via synth only — filter-synth is unfaithful; '
                         'cross-validate vs full-transition headless before trusting')
        else:
            e['status'] = 'VERIFIED'
    else:
        e['status'] = 'DIVERGED'; e['todo'] = _file_todo(prim_id, rep, cat)
    st['primitives'][prim_id] = e
    st['history'].append({'prim': prim_id, 't': e['swept'], 'status': e['status'], 'worst_ddb': wd})
    _save(st)
    print("%s -> %s (worst_ddb=%s, n_scored=%s)" % (prim_id, e['status'], wd, rep.get('n_scored')))
    return e

def step():
    cat = _catalog(); st = _state()
    nxt = next((p['id'] for p in cat['primitives'] if _stt(st, p['id']) not in ('VERIFIED',)), None)
    if nxt is None: print("ALL VERIFIED — nothing to do"); return None
    print("stepping:", nxt); return sweep_one(nxt)

def sweepall(force=False, resume=False):
    """Sweep EVERY primitive in one run (the full ranked-divergence worklist). Runs the
    harness selftest ONCE up front (not per primitive) for speed, then sweeps each with
    skip_selftest=True.

    - default: skip already-VERIFIED (re-measures DIVERGED/NO_SIGNAL/UNTESTED — right after
      an engine fix).
    - resume=True: skip ANY primitive already measured this campaign (VERIFIED/DIVERGED/
      NO_SIGNAL/ERROR); only run UNTESTED. This makes a run RESUMABLE after a mid-sweep node
      disconnect — re-invoking with resume continues from where it stopped instead of
      restarting from primitive #0 (a real cost on the 7-host Colorize). state.json is the
      resume ledger (persisted after every primitive), so resume survives compaction/death.
    - force=True: re-sweep everything (ignore all prior status)."""
    cat = _catalog()
    if not _selftest_ok():
        print("ABORT: harness self-test FAILED — no sweep run"); return
    measured = ('VERIFIED', 'DIVERGED', 'NO_SIGNAL', 'ERROR')
    for p in cat['primitives']:
        st = _state(); cur = _stt(st, p['id'])
        if force:
            pass
        elif resume and cur in measured:
            print("skip (resume, already %s):" % cur, p['id']); continue
        elif cur == 'VERIFIED':
            print("skip (VERIFIED):", p['id']); continue
        try:
            sweep_one(p['id'], skip_selftest=True)
        except Exception as ex:
            print("%s -> EXC %s" % (p['id'], str(ex)[:200]))
    status()

def reset(pid):
    st = _state(); st['primitives'].pop(pid, None); _save(st); print("reset", pid)

def selftest_cmd():
    ok = _selftest_ok()
    print("HARNESS TRUSTWORTHY" if ok else "HARNESS INVALID")
    sys.exit(0 if ok else 1)

if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'status'
    {'status': lambda: status(), 'step': lambda: step(), 'selftest': lambda: selftest_cmd(),
     'sweepall': lambda: sweepall('--force' in sys.argv, '--resume' in sys.argv),
     'sweep': lambda: sweep_one(sys.argv[2]), 'reset': lambda: reset(sys.argv[2])}.get(
        cmd, lambda: print("usage: driver.py [status|step|sweep <PRIM>|sweepall [--force|--resume]|reset <PRIM>|selftest]"))()
