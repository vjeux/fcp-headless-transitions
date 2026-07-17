"""Harness self-test — PROVES oracle+mutator trustworthy before ANY verdict is trusted.
T1 ROUND-TRIP IDENTITY: zero-change mutate rendered via mirror-dir == original (>=60 dB).
T2 MUTATION IS REAL: extreme param mutate changes oracle output (<40 dB vs original).
T3 ENGINE-VS-ORACLE (context): TS engine vs oracle on the unmutated original host scene.
If T1 or T2 fail, the harness is INVALID and no divergence number may be trusted."""
import sys, os, tempfile, json, random
sys.path.insert(0, 'tools'); sys.path.insert(0, '.')
import ozengine
from fct import compare, config
from fct.faithful import mutate, render

def main(slug='Objects__Curtains', plugin='PAEColorize'):
    ozengine.init_engine()
    src = config.slug_motr(slug); txt = open(src, encoding='utf-8').read()
    tmp = tempfile.mkdtemp(); rng = random.Random(0); T = 0.5
    o0 = os.path.join(tmp, 'orig.png'); render.render_oracle(src, T, o0)

    # T1 identity via mirror dir
    id_txt, _ = mutate.mutate_text(txt, plugin, {}, rng)
    assert id_txt == txt, "zero-change mutate not byte-identical"
    mp1 = render.make_mirror(src, id_txt, os.path.join(tmp, 'w1'))
    o1 = os.path.join(tmp, 'ident.png'); render.render_oracle(mp1, T, o1)
    t1 = compare.compare(o0, o1)['psnr']

    # T2 extreme mutation via mirror dir
    ext, sp = mutate.mutate_text(txt, plugin, {'intensity': [0.0, 0.0], 'mix': [1.0, 1.0]}, rng)
    mp2 = render.make_mirror(src, ext, os.path.join(tmp, 'w2'))
    o2 = os.path.join(tmp, 'ext.png'); render.render_oracle(mp2, T, o2)
    t2 = compare.compare(o0, o2)['psnr']

    # T3 engine vs oracle on unmutated original
    e0 = os.path.join(tmp, 'eng.png'); render.render_engine(src, T, e0)
    t3 = compare.compare(o0, e0)['psnr']

    ok = (t1 >= 60) and (t2 < 40)
    print(json.dumps({'slug': slug, 'plugin': plugin, 'sampled_extreme': sp,
        'T1_roundtrip_identity_db': t1, 'T1_pass': t1 >= 60,
        'T2_mutation_changes_output_db': t2, 'T2_pass': t2 < 40,
        'T3_engine_vs_oracle_db': t3}, indent=2))
    print("HARNESS TRUSTWORTHY" if ok else "HARNESS INVALID — do not trust divergence numbers")
    return 0 if ok else 1

if __name__ == '__main__':
    sys.exit(main(*(sys.argv[1:3] if len(sys.argv) > 2 else [])))
