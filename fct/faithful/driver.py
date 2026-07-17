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

# Headless FCP needs DYLD_FRAMEWORK_PATH set AT LAUNCH (SIP strips it from children,
# so we exec, never spawn) + the venv python (numpy/PIL/objc). Re-exec once, exactly
# like fct/cli.py. This makes the driver runnable standalone AND from a scheduled clock
# without a wrapper — critical for compaction-proof unattended operation.
_FW = "/Applications/Final Cut Pro.app/Contents/Frameworks"
_VENV_PY = str(REPO / "venv" / "bin" / "python3")
if (os.environ.get("DYLD_FRAMEWORK_PATH") != _FW or os.path.realpath(sys.executable) != os.path.realpath(_VENV_PY)) \
        and not os.environ.get("_FCT_FAITHFUL_REEXEC") and os.path.exists(_VENV_PY):
    os.environ["DYLD_FRAMEWORK_PATH"] = _FW
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
    v = [p['id'] for p in prims if _stt(st, p['id']) == 'VERIFIED']
    d = [p['id'] for p in prims if _stt(st, p['id']) == 'DIVERGED']
    u = [p['id'] for p in prims if _stt(st, p['id']) not in ('VERIFIED', 'DIVERGED')]
    print("FAITHFUL — %d primitives | VERIFIED %d  DIVERGED %d  UNTESTED %d | pass_db=%.0f samples=%d"
          % (len(prims), len(v), len(d), len(u), cat['pass_db'], cat['sweep_samples']))
    for p in prims:
        s = st['primitives'].get(p['id'], {})
        print("  #%2d %-20s %-9s hosts=%d worst_db=%s" % (p['priority'], p['id'], _stt(st, p['id']), p['host_count'], s.get('worst_db', '-')))
    nxt = next((p['id'] for p in prims if _stt(st, p['id']) != 'VERIFIED'), None)
    print("NEXT:", nxt or "ALL VERIFIED")
    return nxt

def _file_todo(prim, rep, cat):
    TODO.mkdir(parents=True, exist_ok=True)
    worst = [r for r in rep.get('results', []) if 'db' in r][:5]
    mod = next((p['engine_module'] for p in cat['primitives'] if p['id'] == prim), '?')
    tid = 'T-faithful-%s' % prim.lower()
    body = {'id': tid,
      'title': 'Faithful: %s diverges from headless FCP across fuzzed params (worst %.1f dB)' % (prim, rep['worst_db']),
      'project': 'fct',
      'goal': ('FAITHFUL-REIMPL (ROADMAP Rule 13): the TS engine impl of %s must match REAL headless FCP '
               'across its ENTIRE parameter space, not just values the 65 fixed transitions use. The fuzz '
               'oracle (fct/faithful) rendered random-param synthetic .motr (host %s) through headless FCP '
               'vs the TS engine; worst PSNR=%.2f dB < pass %.0f. Fix %s so the sweep passes. NO scene-signature '
               'dispatch, NO env flags (Rule 12/13): behavior = f(filter params) only. Re-verify: '
               '`python3 -m fct.faithful.driver sweep %s` must reach >= pass_db across all samples. '
               'Worst diverging samples (params->db): %s'
               % (prim, rep['host'], rep['worst_db'], cat['pass_db'], mod, prim, json.dumps(worst))),
      'slugs': [], 'after': None, 'status': 'open', 'created_by': 'faithful-driver',
      'created_at': time.strftime('%Y-%m-%dT%H:%M:%SZ'),
      'notes': 'Auto-filed by fct/faithful/driver.py. Evidence: fct/faithful/reports/%s.json' % prim}
    json.dump(body, open(TODO / (tid + '.json'), 'w'), indent=2)
    return tid

def sweep_one(prim_id):
    from fct.faithful import fuzz
    cat = _catalog(); rep = fuzz.sweep(prim_id, cat)
    REPORTS.mkdir(exist_ok=True)
    json.dump(rep, open(REPORTS / ('%s.json' % prim_id), 'w'), indent=2)
    st = _state()
    e = {'worst_db': rep.get('worst_db'), 'host': rep.get('host'), 'swept': time.strftime('%Y-%m-%dT%H:%M:%SZ'), 'error': rep.get('error')}
    if rep.get('error'): e['status'] = 'ERROR'
    elif rep['worst_db'] >= cat['pass_db']: e['status'] = 'VERIFIED'
    else: e['status'] = 'DIVERGED'; e['todo'] = _file_todo(prim_id, rep, cat)
    st['primitives'][prim_id] = e
    st['history'].append({'prim': prim_id, 't': e['swept'], 'status': e['status'], 'worst_db': e.get('worst_db')})
    _save(st)
    print("%s -> %s (worst_db=%s)" % (prim_id, e['status'], e.get('worst_db')))
    return e

def step():
    cat = _catalog(); st = _state()
    nxt = next((p['id'] for p in cat['primitives'] if _stt(st, p['id']) not in ('VERIFIED',)), None)
    if nxt is None: print("ALL VERIFIED — nothing to do"); return None
    print("stepping:", nxt); return sweep_one(nxt)

def reset(pid):
    st = _state(); st['primitives'].pop(pid, None); _save(st); print("reset", pid)

if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'status'
    {'status': lambda: status(), 'step': lambda: step(),
     'sweep': lambda: sweep_one(sys.argv[2]), 'reset': lambda: reset(sys.argv[2])}.get(
        cmd, lambda: print("usage: driver.py [status|step|sweep <PRIM>|reset <PRIM>]"))()
