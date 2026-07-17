"""Per-primitive DELTA-RESPONSE fuzz sweep — the ungameable per-primitive gate.

WHY DELTA, NOT ABSOLUTE PSNR (the core hardening, 2026-07-17):
The old sweep compared PSNR(oracle(theta), engine(theta)) on a FULL transition. That
measures the WHOLE pipeline (masks/retime/compositor/JPEG-vs-PNG source offset), NOT the
one filter — so a pre-existing bug ANYWHERE pins the primitive to DIVERGED forever and the
number is unattributable. Instead we measure how each engine RESPONDS to a parameter change:

    delta_o = oracle(theta) - oracle(theta0)      # how FCP's output moves when the param moves
    delta_e = engine(theta) - engine(theta0)      # how our output moves
    ddb     = PSNR(delta_o, delta_e)              # do the two responses agree?

theta0 = authored params. Any pipeline error that is CONSTANT across theta (background
render error, source offset) CANCELS in the delta, so ddb isolates the FILTER's parameter
response even when it lives inside a full transition. Properties (why it's ungameable):
  * engine ignores the param  -> delta_e~=0, delta_o large -> ddb LOW  -> FAIL (catches no-ops)
  * engine overfit to theta0   -> fuzz theta far away -> engine wrong -> ddb LOW -> FAIL
  * engine faithful to P(theta) -> delta_e ~= delta_o -> ddb HIGH -> PASS (regardless of const bg)

STRUCTURAL VARIATION (the second, orthogonal anti-overfitting lever):
We sweep each primitive across ALL its host slugs, not one. A scene-signature discriminator
keyed to slug X's structure won't fire on host Y, so a faithful engine passes on every host
while an overfit one diverges on the others. Cross-host worst ddb is the primitive verdict.

SIGNAL GATING: only score a (host,param,theta) sample where the ORACLE actually responded
(rms(delta_o) >= SIGNAL_FLOOR). If FCP's output doesn't move, the param is inert in that
host at that time and there's nothing to verify — skip it (don't reward or punish).
"""
import os, sys, json, tempfile
sys.path.insert(0, 'tools'); sys.path.insert(0, '.')
import numpy as np
from fct import config
from fct.read import read_frame
from fct.faithful import mutate, render, schema

SIGNAL_FLOOR = 2.0     # min rms(delta_o) in 8-bit levels for the oracle response to count
PEAK = 255.0

def _delta_psnr(delta_o, delta_e):
    """PSNR between two signed response images. High = engine's response matches oracle's."""
    mse = float(((delta_o - delta_e) ** 2).mean())
    return 99.0 if mse <= 1e-9 else 10.0 * float(np.log10(PEAK * PEAK / mse))

def _read(p):
    return read_frame(p).astype(np.float64)

def _sample_values(rng_lo, rng_hi, authored, n_extremes=2):
    """Values to probe: the range extremes (strongest signal, furthest from theta0) plus the
    midpoint. Skip any value ~= authored (delta would be ~0). Deterministic (no RNG) so a
    sweep is reproducible and a fix can be re-verified against the SAME probe values."""
    cands = [rng_lo, rng_hi, 0.5 * (rng_lo + rng_hi)]
    out = []
    for v in cands:
        if abs(v - authored) > 1e-4 and v not in out:
            out.append(v)
    return out[:max(1, n_extremes + 1)]

def sweep(primitive, catalog, times=(0.35, 0.65), max_params=None, max_hosts=None):
    prim = next(p for p in catalog['primitives'] if p['id'] == primitive)
    plugin = prim.get('plugin_name', primitive)   # catalog may override (PAECloudsV -> PAECloudsV2)
    hosts = prim['host_slugs'][:max_hosts] if max_hosts else prim['host_slugs']
    rows = []           # per (host,param,theta,t) delta measurement
    worst = 999.0
    n_signal = 0
    with tempfile.TemporaryDirectory() as tmp:
        for hi, host in enumerate(hosts):
            src = config.slug_motr(host)
            base = open(src, encoding='utf-8').read()
            sch = schema.extract(src, plugin, continuous_only=True)
            if not sch:
                rows.append({'host': host, 'note': 'no continuous params located'}); continue
            params = list(sch.items())
            if max_params:
                params = params[:max_params]
            # theta0 renders (authored) — one per time, oracle+engine
            wd0 = os.path.join(tmp, 'h%d_base' % hi); os.makedirs(wd0, exist_ok=True)
            mp0 = render.make_mirror(src, base, wd0)
            o0 = {}; e0 = {}
            for t in times:
                op = os.path.join(wd0, 'o_%s.png' % t); ep = os.path.join(wd0, 'e_%s.png' % t)
                render.render_oracle(mp0, t, op); render.render_engine(mp0, t, ep)
                o0[t] = _read(op); e0[t] = _read(ep)
            for name_path, meta in params:
                lo, hi_ = meta['range']
                for k, theta in enumerate(_sample_values(lo, hi_, meta['authored'])):
                    mtxt, applied = mutate.set_params(base, plugin, {name_path: theta})
                    if not applied:
                        rows.append({'host': host, 'param': name_path, 'theta': theta,
                                     'note': 'set_params matched nothing'}); continue
                    wd = os.path.join(tmp, 'h%d_%s_%d' % (hi, name_path.replace('/', '.'), k))
                    os.makedirs(wd, exist_ok=True)
                    mp = render.make_mirror(src, mtxt, wd)
                    for t in times:
                        op = os.path.join(wd, 'o_%s.png' % t); ep = os.path.join(wd, 'e_%s.png' % t)
                        try:
                            render.render_oracle(mp, t, op); render.render_engine(mp, t, ep)
                            do = _read(op) - o0[t]; de = _read(ep) - e0[t]
                        except Exception as ex:
                            rows.append({'host': host, 'param': name_path, 'theta': round(theta, 4),
                                         't': t, 'error': str(ex)[:160]}); continue
                        sig = float(np.sqrt((do ** 2).mean()))
                        row = {'host': host, 'param': name_path, 'theta': round(theta, 4), 't': t,
                               'oracle_signal': round(sig, 3)}
                        if sig < SIGNAL_FLOOR:
                            row['note'] = 'no oracle signal (param inert here)'; rows.append(row); continue
                        ddb = round(_delta_psnr(do, de), 3)
                        row['ddb'] = ddb; n_signal += 1; worst = min(worst, ddb)
                        rows.append(row)
    rows.sort(key=lambda r: r.get('ddb', 999))
    # Release the shared engine worker so a long unattended driver doesn't leak node procs
    # across many primitive sweeps.
    try:
        if render._worker is not None:
            render._worker.close(); render._worker = None
    except Exception:
        pass
    return {'primitive': primitive, 'plugin': plugin, 'hosts': hosts, 'times': list(times),
            'signal_floor': SIGNAL_FLOOR, 'n_scored': n_signal,
            'worst_ddb': None if worst == 999.0 else round(worst, 3),
            'results': rows}

if __name__ == '__main__':
    cat = json.load(open('fct/faithful/catalog.json'))
    prim = sys.argv[1] if len(sys.argv) > 1 else 'PAEColorize'
    rep = sweep(prim, cat, max_params=int(os.environ.get('MAXP', '3')),
                max_hosts=int(os.environ.get('MAXH', '2')), times=(0.5,))
    print(json.dumps({k: v for k, v in rep.items() if k != 'results'}, indent=2))
    for r in rep['results'][:12]:
        print('  ', r)
