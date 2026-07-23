#!/usr/bin/env python3
"""fct/subswarm/builders.py — synthetic-scene builders for the subsystem swarm.

Extends tools/re/probe_scene.py's injector set with the primitives the top-3 subsystems
need, and adds a CAMERA-BEARING variant of the skeleton so 3D-fold / perspective nodes can
be tested against headless FCP WITHOUT hitting the documented camera-less false-fail
(camera-less: headless applies a default perspective the GUI does not; with a real Camera
node both agree — see probe_scene.py header + Reflection.motr:179 Camera factoryID=12).

Every builder returns a path to a temp .motr. The caller renders it through BOTH ozengine
(headless FCP) and engine/test/_scene_render.ts (TS), and PSNR-compares — exactly the
`fct caps` mechanism, one node at a time, no 65-slug suite.
"""
import os, re, sys, tempfile, math

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if REPO not in sys.path:
    sys.path.insert(0, REPO)
# reuse probe_scene's proven skeleton + Transform/opacity injectors.
# probe_scene.py has a MODULE-LEVEL re-exec guard: on import it will os.execv the whole
# process back into itself-as-__main__ (hijacking us) unless _PROBE_SCENE_REEXEC is set OR
# it is already running under the venv python with DYLD. The runner has already re-exec'd
# us under venv+DYLD, but venv is a symlink so `sys.executable != _VENV_PY` can still be
# true — set the guard explicitly so `import probe_scene` is a clean library import.
os.environ.setdefault("_PROBE_SCENE_REEXEC", "1")
sys.path.insert(0, os.path.join(REPO, "tools", "re"))
import probe_scene as PS

SKELETON = PS.SKELETON

# ---------------------------------------------------------------------------------
# Camera injection — put a real perspective Camera (factoryID=12) into the skeleton so
# GUI and headless FCP agree on the 3D projection (the perspective subsystem's oracle).
# ---------------------------------------------------------------------------------
def _camera_node(aov=45.0, node_id=1999999001):
    return (
        f'\t<scenenode name="Camera" id="{node_id}" factoryID="12" version="5">\n'
        f'\t\t<aspectRatio>1</aspectRatio>\n'
        f'\t\t<flags>0</flags>\n'
        f'\t\t<timing in="0 1 1 0" out="212212 120000 1 0" offset="0 1 1 0"/>\n'
        f'\t\t<foldFlags>0</foldFlags>\n'
        f'\t\t<baseFlags>16</baseFlags>\n'
        f'\t\t<parameter name="Properties" id="1" flags="8589938704"/>\n'
        f'\t\t<parameter name="Object" id="2" flags="8589938704">\n'
        f'\t\t\t<parameter name="Angle Of View" id="201" flags="8589934608" default="45" value="{aov}"/>\n'
        f'\t\t</parameter>\n'
        f'\t</scenenode>\n'
    )

def _insert_camera(src, aov=45.0):
    """Insert a Camera scenenode as the first <scenenode>/<layer> child of the top <scene>.
    A camera at the scene root makes FCP project perspectively (finite AOV) in BOTH the GUI
    and headless engines, so a 3D transform (Y-rotation fold, Z-push) can be unit-tested."""
    m = re.search(r'<scene\b[^>]*>\n', src)
    if not m:
        raise RuntimeError("no <scene> open tag in skeleton")
    return src[:m.end()] + _camera_node(aov) + src[m.end():]


def build_transform(inject, camera=False, aov=45.0):
    """Transform node on Transition A (position/rotation/scale/anchor, incl. 3D rot X/Y).
    camera=True inserts a perspective Camera so 3D folds match FCP GUI+headless."""
    src = PS._strip_scene_filter(open(SKELETON, encoding="utf-8").read())
    if camera:
        src = _insert_camera(src, aov)
    src = PS._inject_into_transition_a_properties(src, PS._transform_xml(inject))
    fd, path = tempfile.mkstemp(suffix=".motr", prefix="subsw_xform_")
    os.close(fd); open(path, "w", encoding="utf-8").write(src)
    return path


def build_opacity(value):
    """Reuse probe_scene's opacity injector (static Opacity id=202 on Transition A)."""
    return PS.build_scene({"kind": "opacity", "value": value})


# Dispatch: a pack entry's inject.kind -> builder. New kinds add here.
def build(inject):
    kind = inject.get("kind", "transform")
    if kind == "transform":
        return build_transform(inject, camera=bool(inject.get("camera")),
                                aov=float(inject.get("aov", 45.0)))
    if kind == "opacity":
        return build_opacity(inject["value"])
    raise RuntimeError(f"subswarm builder: unknown inject kind {kind!r}")
