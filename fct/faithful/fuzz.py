"""Per-primitive fuzz sweep: oracle vs TS engine across RANDOM parameter samples.

Uses the byte-preserving mutator (mutate.py) + mirror-dir render (render.py, required
because .motr references sibling resources by relative path). The harness self-test
(selftest.py) MUST pass before any sweep verdict is trusted.

worst_db across all (sample × time) = the primitive's fidelity floor. A scene-signature
discriminator in the TS engine cannot survive this: random parameter values the 65 fixed
transitions never exercise will diverge if the engine fit the fixed scenes instead of
implementing the real filter math.
"""
import os, sys, json, random, tempfile
sys.path.insert(0, 'tools'); sys.path.insert(0, '.')
from fct import config, compare
from fct.faithful import mutate, render, schema

def sweep(primitive, catalog, samples=None, times=(0.1, 0.5, 0.9), seed=0):
    prim = next(p for p in catalog['primitives'] if p['id'] == primitive)
    samples = samples or catalog.get('sweep_samples', 24)
    host = prim['host_slugs'][0]
    src = config.slug_motr(host)
    base = open(src, encoding='utf-8').read()
    # derive REAL param ranges from the .motr (not guessed); fall back to catalog params
    sch = schema.extract(src, primitive)
    ranges = {k: v['range'] for k, v in sch.items()} or prim.get('params', {})
    rng = random.Random(seed)
    results = []; worst = 999.0
    with tempfile.TemporaryDirectory() as tmp:
        # baseline oracle+engine on the UNMUTATED host (authored params) for context
        o_auth = os.path.join(tmp, 'o_auth.png'); e_auth = os.path.join(tmp, 'e_auth.png')
        render.render_oracle(src, 0.5, o_auth); render.render_engine(src, 0.5, e_auth)
        authored_db = compare.compare(o_auth, e_auth)['psnr']
        for s in range(samples):
            mtxt, sp = mutate.mutate_text(base, primitive, ranges, rng)
            if mtxt is None:
                return {'primitive': primitive, 'error': 'filter not found in host %s' % host}
            wd = os.path.join(tmp, 'w%d' % s)
            mp = render.make_mirror(src, mtxt, wd)
            for t in times:
                op = os.path.join(wd, 'o.png'); ep = os.path.join(wd, 'e.png')
                try:
                    render.render_oracle(mp, t, op); render.render_engine(mp, t, ep)
                    db = compare.compare(op, ep)['psnr']
                except Exception as e:
                    results.append({'s': s, 't': t, 'params': sp, 'error': str(e)[:160]}); worst = -1; continue
                results.append({'s': s, 't': t, 'params': sp, 'db': db}); worst = min(worst, db)
    return {'primitive': primitive, 'host': host, 'authored_db': authored_db, 'ranges': ranges,
            'samples': samples, 'times': list(times), 'worst_db': round(worst, 3),
            'results': sorted(results, key=lambda r: r.get('db', 999))}

if __name__ == '__main__':
    cat = json.load(open('fct/faithful/catalog.json'))
    rep = sweep(sys.argv[1], cat, samples=int(os.environ.get('FUZZ_SAMPLES', '4')), times=(0.5,))
    print(json.dumps({k: v for k, v in rep.items() if k != 'results'}, indent=2))
    for r in rep.get('results', [])[:5]: print(' ', r)
