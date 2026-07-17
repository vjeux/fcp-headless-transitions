"""Render a (possibly mutated) .motr through the oracle + TS engine — CORRECTLY.

KEY CONSTRAINT (discovered via self-test): a .motr references sibling resources by
RELATIVE url (Media/*.mov, Drop Zone *.tiff, small.png). Rendering a copy from an
arbitrary tmp dir breaks those refs and yields garbage (7.25 dB). FCP's bundle is
read-only, so we cannot write beside the original. Solution: a MIRROR DIR — symlink every
resource sibling of the original template dir into a writable dir, write the mutated
.motr there, and render from that path. Verified: byte-identical mirror copy -> 99.0 dB.
"""
import os, sys, shutil, tempfile, subprocess
sys.path.insert(0, 'tools')
import ozengine
IMG_A = 'images/start.jpg'; IMG_B = 'images/end.jpg'

def make_mirror(orig_motr_path, mutated_text, workdir):
    """Create a mirror dir beside a writable location: symlink all siblings of the
    original .motr's dir, write mutated_text as the .motr. Return the mirror .motr path."""
    sdir = os.path.dirname(orig_motr_path)
    base = os.path.basename(orig_motr_path)
    mirror = os.path.join(workdir, 'mirror')
    os.makedirs(mirror, exist_ok=True)
    for entry in os.listdir(sdir):
        d = os.path.join(mirror, entry)
        if os.path.lexists(d):
            continue
        if entry == base:
            continue
        try: os.symlink(os.path.join(sdir, entry), d)
        except OSError: pass
    mp = os.path.join(mirror, base)
    with open(mp, 'w', encoding='utf-8') as f:
        f.write(mutated_text)
    return mp

def render_oracle(motr_path, tsec, out):
    ozengine.render_frame(ozengine.load_doc(motr_path), IMG_A, IMG_B, tsec, out)

def render_engine(motr_path, tsec, out):
    env = dict(os.environ, FCT_RENDER_MOTR=os.path.abspath(motr_path),
               FCT_RENDER_T=str(tsec), FCT_RENDER_OUT=os.path.abspath(out))
    subprocess.run(['node_modules/.bin/tsx', 'test/_fct_render_motr.ts'], cwd='engine',
                   env=env, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
