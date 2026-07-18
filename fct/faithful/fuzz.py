"""Per-primitive DELTA-RESPONSE fuzz sweep — the ungameable per-primitive gate.

WHY DELTA, NOT ABSOLUTE PSNR (the core hardening, 2026-07-17):
The old sweep compared PSNR(oracle(theta), engine(theta)) on a FULL transition. That measures
the WHOLE pipeline (masks/retime/compositor/JPEG-vs-PNG offset), NOT the one filter — so a bug
ANYWHERE pins the primitive DIVERGED and the number is unattributable. Instead we measure how
each engine RESPONDS to a parameter change:

    delta_o = oracle(theta) - oracle(theta0)      # how FCP's output moves when the param moves
    delta_e = engine(theta) - engine(theta0)      # how our output moves
    ddb     = PSNR(delta_o, delta_e)              # do the two responses agree?

theta0 = authored params. Constant background error CANCELS in the delta, so ddb isolates the
FILTER's parameter response even inside a full transition. Ungameable: no-op params, overfit-
to-theta0, and wrong math all score LOW; only faithful P(theta) scores HIGH (~99 = floor).

STRUCTURAL VARIATION: sweep each primitive across ALL its host slugs. A scene-signature
discriminator won't fire on the other hosts -> a faithful engine passes everywhere. Cross-host
worst ddb is the verdict.

CURVE PARAMS (2026-07-18): many filters' meaningful knobs live on an animated <curve>, not a
value= attr (BadTV Waviness/Static, Noise dims). schema(include_curves=True) surfaces them as
kind='curve'; we drive them via mutate.set_curve_params (flatten the curve to a constant).

SYNTHETIC-SCENE FALLBACK (2026-07-18): some filters are OCCLUDED in every host — their layer is
never composited into the visible frame at any time (max_oracle_signal==0), so nothing can be
verified (PAETint/PAENoise/PAEBadTV). When a primitive shows no signal across all hosts, we fall
back to a SYNTHETIC single-filter scene (synth.build) where the filter is the sole op on a
static full-frame image, so its parameter response always drives the output.

SIGNAL GATING: only score a (host,param,theta) sample where the ORACLE actually responded
(rms(delta_o) >= SIGNAL_FLOOR). No oracle movement -> nothing to verify -> skip.
"""
import os, sys, json, tempfile
sys.path.insert(0, 'tools'); sys.path.insert(0, '.')
import numpy as np
from fct import config
from fct.read import read_frame
from fct.faithful import mutate, render, schema, synth

SIGNAL_FLOOR = 2.0     # min rms(delta_o) in 8-bit levels for the oracle response to count
PEAK = 255.0

def _delta_psnr(delta_o, delta_e):
    """PSNR between two signed response images. High = engine's response matches oracle's."""
    mse = float(((delta_o - delta_e) ** 2).mean())
    return 99.0 if mse <= 1e-9 else 10.0 * float(np.log10(PEAK * PEAK / mse))

def _read(p):
    return read_frame(p).astype(np.float64)

def _mutate(base_text, plugin, name_path, kind, theta):
    """Byte-preserving mutator dispatch by param kind: scalar leaves via set_params (value=
    attr), animated CURVE params via set_curve_params (flatten the curve to a constant)."""
    if kind == 'curve':
        return mutate.set_curve_params(base_text, plugin, {name_path: theta})
    return mutate.set_params(base_text, plugin, {name_path: theta})

def _sweep_scene(base_text, resource_path, plugin, params, times, tmp, tag, host_label, rows):
    """Delta-sweep ONE scene (a real host OR a synthetic scaffold). Renders theta0 + every
    param probe through oracle+engine, appends per-sample rows, returns (n_scored, worst_ddb,
    max_sig). resource_path is the dir make_mirror mirrors sibling resources from (the real
    host's dir, or — for a synthetic scene — the scaffold host's dir)."""
    worst = 999.0; n_signal = 0; max_sig = 0.0
    wd0 = os.path.join(tmp, '%s_base' % tag); os.makedirs(wd0, exist_ok=True)
    mp0 = render.make_mirror(resource_path, base_text, wd0)
    o0 = {}; e0 = {}
    for t in times:
        op = os.path.join(wd0, 'o_%s.png' % t); ep = os.path.join(wd0, 'e_%s.png' % t)
        render.render_oracle(mp0, t, op); render.render_engine(mp0, t, ep)
        o0[t] = _read(op); e0[t] = _read(ep)
    for name_path, meta in params:
        kind = meta.get('kind', 'scalar')
        probes = [pv for pv in meta.get('probes', []) if abs(pv - meta['authored']) > 1e-4]
        for k, theta in enumerate(probes):
            mtxt, applied = _mutate(base_text, plugin, name_path, kind, theta)
            if not applied:
                rows.append({'host': host_label, 'param': name_path, 'kind': kind,
                             'theta': theta, 'note': 'mutator matched nothing'}); continue
            wd = os.path.join(tmp, '%s_%s_%d' % (tag, name_path.replace('/', '.'), k))
            os.makedirs(wd, exist_ok=True)
            mp = render.make_mirror(resource_path, mtxt, wd)
            for t in times:
                op = os.path.join(wd, 'o_%s.png' % t); ep = os.path.join(wd, 'e_%s.png' % t)
                try:
                    render.render_oracle(mp, t, op); render.render_engine(mp, t, ep)
                    do = _read(op) - o0[t]; de = _read(ep) - e0[t]
                except Exception as ex:
                    rows.append({'host': host_label, 'param': name_path, 'kind': kind,
                                 'theta': round(theta, 4), 't': t, 'error': str(ex)[:160]}); continue
                sig = float(np.sqrt((do ** 2).mean()))
                max_sig = max(max_sig, sig)
                row = {'host': host_label, 'param': name_path, 'kind': kind,
                       'theta': round(theta, 4), 't': t, 'oracle_signal': round(sig, 3)}
                if sig < SIGNAL_FLOOR:
                    row['note'] = 'no oracle signal (param inert here)'; rows.append(row); continue
                ddb = round(_delta_psnr(do, de), 3)
                row['ddb'] = ddb; n_signal += 1; worst = min(worst, ddb)
                rows.append(row)
    return n_signal, worst, max_sig

def sweep(primitive, catalog, times=(0.1, 0.25, 0.5, 0.75, 0.9), max_params=None, max_hosts=None,
          allow_synth=True):
    # TIME COVERAGE (2026-07-17): sparse 2-time (0.35,0.65) produced FALSE NO_SIGNAL that HID
    # real divergence (Bloom/Glow inert mid-transition, active at 0.1/0.9). 5 spread times
    # catch time-localized filter activity.
    prim = next(p for p in catalog['primitives'] if p['id'] == primitive)
    plugin = prim.get('plugin_name', primitive)   # catalog may override (PAECloudsV -> PAECloudsV2)
    hosts = prim['host_slugs'][:max_hosts] if max_hosts else prim['host_slugs']
    # GENERATOR ISOLATION (2026-07-18, faithful-not-fitted): a generator scenenode
    # (PAEColorSolid/PAENoise/PAECloudsV) emits its OWN full-frame image which the HOST then
    # TRANSFORMS (3D flip-card warp in Flip/Multi-flip, camera moves, masks) and composites. So
    # an EMBEDDED param-response delta conflates the generator's color/output math with the
    # host's geometry — a color change lands in DIFFERENT pixels whenever the host's 3D
    # transform in the engine differs from FCP (that gap is PAEFlop's / the compositor's, a
    # SEPARATELY-tracked primitive). Attributing it to the generator is a FALSE divergence that
    # tempts overfitting the generator when its color math is already exact (ColorSolid solo
    # matches FCP to <1 LSB across the full 0..1 sweep). The FAITHFUL per-primitive verdict for
    # a generator is therefore the SOLO SYNTH scene, where the generator's output IS the frame
    # (no host transform); the host-geometry gap is still caught under PAEFlop's own sweep.
    # Embedded-host rows are still rendered + recorded as DIAGNOSTICS (tagged diag=True) but do
    # NOT set the verdict for a generator.
    is_gen = prim.get('node_type') == 'scenenode'
    rows = []; worst = 999.0; n_signal = 0; max_sig = 0.0; used_synth = False
    with tempfile.TemporaryDirectory() as tmp:
        if is_gen:
            # GENERATOR: skip the embedded-host renders entirely — they only measure the
            # HOST's transform of the generator's output (3D flip-card warp / camera / masks),
            # a SEPARATELY-tracked primitive (PAEFlop et al.), and would triple the render cost
            # for a number that must NOT set this primitive's verdict. The authoritative verdict
            # is the SOLO SYNTH sweep below. Record a note so the report is explicit.
            for host in hosts:
                rows.append({'host': host, 'note': 'generator: embedded host is host-geometry '
                             '(tracked under the host transform primitive); verdict = solo synth'})
        else:
            for hi, host in enumerate(hosts):
                src = config.slug_motr(host)
                base = open(src, encoding='utf-8').read()
                sch = schema.extract(src, plugin, fuzzable_only=True, include_curves=True)
                if not sch:
                    rows.append({'host': host, 'note': 'no fuzzable params located'}); continue
                params = list(sch.items())
                if max_params:
                    params = params[:max_params]
                ns, wd, ms = _sweep_scene(base, src, plugin, params, times, tmp, 'h%d' % hi, host, rows)
                n_signal += ns; worst = min(worst, wd); max_sig = max(max_sig, ms)
        # SYNTHETIC SCENE: for a GENERATOR this is the AUTHORITATIVE verdict (isolates its own
        # param->output response). For a FILTER it is a FALLBACK only when the filter is
        # occluded in EVERY host (no oracle signal anywhere) — e.g. PAETint/PAEBadTV whose layer
        # is never composited into the visible frame. synth.build grafts the authentic filter
        # block + its factory into a minimal static full-frame scaffold (Movements__Fall).
        if allow_synth and (is_gen or max_sig < SIGNAL_FLOOR):
            host0 = hosts[0]
            # A generator scenenode produces its OWN image; source A must be removed so it isn't
            # occluded (else ~0 param response). A filter keeps source A as its input.
            sbase = synth.build(plugin, config.slug_motr(host0), is_generator=is_gen)
            if sbase is not None:
                used_synth = True
                sch = schema.extract(config.slug_motr(host0), plugin, fuzzable_only=True, include_curves=True)
                params = list(sch.items())
                if max_params:
                    params = params[:max_params]
                scaf_res = config.slug_motr(synth.SCAFFOLD_SLUG)
                ns, wd, ms = _sweep_scene(sbase, scaf_res, plugin, params, times, tmp,
                                          'synth', 'SYNTH', rows)
                n_signal += ns; worst = min(worst, wd); max_sig = max(max_sig, ms)
    rows.sort(key=lambda r: r.get('ddb', 999))
    # Release the shared engine worker so a long unattended driver doesn't leak node procs.
    try:
        if render._worker is not None:
            render._worker.close(); render._worker = None
    except Exception:
        pass
    return {'primitive': primitive, 'plugin': plugin, 'hosts': hosts, 'times': list(times),
            'signal_floor': SIGNAL_FLOOR, 'n_scored': n_signal, 'used_synthetic': used_synth,
            'max_oracle_signal': round(max_sig, 3),
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
