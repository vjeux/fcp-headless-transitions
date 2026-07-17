"""Harness self-test — PROVES the oracle + mutator + DELTA metric are trustworthy before
ANY primitive verdict is trusted. driver.sweep_one runs this FIRST and refuses to record a
verdict (or file a todo) if it fails — a broken harness must never drive the work.

  T1 ROUND-TRIP IDENTITY : zero-change mutate via mirror-dir renders byte-identical to the
                           original (>=60 dB). Proves the byte-preserving mutator + mirror
                           render don't themselves perturb the scene.
  T2 MUTATION IS REAL    : setting a param to an extreme changes the oracle output (<40 dB
                           vs original). Proves the FCP filter actually receives our mutation.
  T3 DETERMINISM         : oracle(theta0) rendered twice is identical (>=90 dB), so every
                           delta is real signal, not render noise (the delta metric's premise).
  T4 DELTA-SELF SANITY   : a real param's oracle response has signal (rms>=floor) AND the
                           delta metric of the ORACLE vs ITSELF is ~99 dB. Proves _delta_psnr
                           + signal gating work (a faithful engine would score ~99).
  T5 NEGATIVE CONTROL    : inject a deliberate error into the engine response (bias it) and
                           confirm ddb DROPS BELOW pass_db. Proves the gate can actually
                           CATCH a divergence — that it isn't just passing everything.
"""
import sys, os, tempfile, json
sys.path.insert(0, 'tools'); sys.path.insert(0, '.')
import numpy as np
import ozengine
from fct import config
from fct.read import read_frame
from fct.faithful import mutate, render, schema, fuzz

def _rd(p): return read_frame(p).astype(np.float64)
def _psnr(a, b):
    mse = ((a - b) ** 2).mean()
    return 99.0 if mse <= 1e-9 else 10.0 * float(np.log10(255 * 255 / mse))

def main(slug='Objects__Curtains', plugin='PAEColorize', pass_db=40.0):
    ozengine.init_engine()
    src = config.slug_motr(slug); txt = open(src, encoding='utf-8').read()
    tmp = tempfile.mkdtemp(); T = 0.5
    sch = schema.extract(src, plugin, continuous_only=True)
    assert sch, 'no continuous params for %s in %s' % (plugin, slug)
    pname, pmeta = next(iter(sch.items()))
    lo, hi = pmeta['range']; extreme = hi if abs(hi - pmeta['authored']) > 1e-3 else lo

    # theta0 renders (twice for determinism)
    mp0 = render.make_mirror(src, txt, os.path.join(tmp, 'w0'))
    render.render_oracle(mp0, T, tmp + '/o0.png'); render.render_oracle(mp0, T, tmp + '/o0b.png')
    render.render_engine(mp0, T, tmp + '/e0.png')
    o0, o0b, e0 = _rd(tmp + '/o0.png'), _rd(tmp + '/o0b.png'), _rd(tmp + '/e0.png')

    # T1 identity
    id_txt, _ = mutate.set_params(txt, plugin, {})
    assert id_txt == txt, 'zero-change mutate not byte-identical'
    mp1 = render.make_mirror(src, id_txt, os.path.join(tmp, 'w1'))
    render.render_oracle(mp1, T, tmp + '/ident.png')
    t1 = _psnr(o0, _rd(tmp + '/ident.png'))

    # T2 mutation is real + T4/T5 use the same extreme render
    ext_txt, applied = mutate.set_params(txt, plugin, {pname: extreme})
    assert applied, 'set_params matched nothing for %s' % pname
    mpx = render.make_mirror(src, ext_txt, os.path.join(tmp, 'wx'))
    render.render_oracle(mpx, T, tmp + '/ox.png'); render.render_engine(mpx, T, tmp + '/ex.png')
    ox, ex = _rd(tmp + '/ox.png'), _rd(tmp + '/ex.png')
    t2 = _psnr(o0, ox)

    # T3 determinism
    t3 = _psnr(o0, o0b)

    # T4 delta-self: oracle response signal + oracle-vs-oracle delta ddb (~99)
    do = ox - o0; de_eng = ex - e0
    signal = float(np.sqrt((do ** 2).mean()))
    t4_self = fuzz._delta_psnr(do, do)          # oracle response vs itself -> must be 99
    ddb_engine = fuzz._delta_psnr(do, de_eng)   # real engine ddb (context)

    # T5 negative control: bias the engine response by +25 levels -> ddb must fall below pass
    de_broken = de_eng + 25.0
    ddb_broken = fuzz._delta_psnr(do, de_broken)

    ok = (t1 >= 60) and (t2 < 40) and (t3 >= 90) and (signal >= fuzz.SIGNAL_FLOOR) \
        and (t4_self >= 95) and (ddb_broken < pass_db)
    print(json.dumps({
        'slug': slug, 'plugin': plugin, 'param': pname, 'extreme': extreme,
        'T1_roundtrip_identity_db': round(t1, 2), 'T1_pass': t1 >= 60,
        'T2_mutation_changes_output_db': round(t2, 2), 'T2_pass': t2 < 40,
        'T3_determinism_db': round(t3, 2), 'T3_pass': t3 >= 90,
        'T4_oracle_signal_rms': round(signal, 3), 'T4_delta_self_db': round(t4_self, 2),
        'T4_pass': (signal >= fuzz.SIGNAL_FLOOR and t4_self >= 95),
        'T5_neg_control_broken_ddb': round(ddb_broken, 2), 'T5_pass': ddb_broken < pass_db,
        'context_engine_ddb': round(ddb_engine, 2),
    }, indent=2))
    print('HARNESS TRUSTWORTHY' if ok else 'HARNESS INVALID — do not trust divergence numbers')
    return 0 if ok else 1

if __name__ == '__main__':
    sys.exit(main(*(sys.argv[1:3] if len(sys.argv) > 2 else [])))
