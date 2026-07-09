"""Shared Ozone (FCP Motion engine) headless-boot boilerplate.

Every ground-truth / probe script needs the same ~15 lines to bring up the real
FCP render engine in-process. This module centralizes that so callers just do:

    from ozengine import init_engine, load_doc, render_frame
    init_engine()                     # one-time ~1.3s engine boot (idempotent)
    doc = load_doc("/path/to/Foo.motr")
    render_frame(doc, "imgA.png", "imgB.png", tsec=0.5, out="frame.png")

Render many transitions in ONE process by calling init_engine() once, then
load_doc() per transition -- this amortizes the boot instead of re-paying it.

IMPORTANT ENV: DYLD_FRAMEWORK_PATH must point at FCP's Frameworks dir so the
engine's sibling frameworks resolve at dlopen time. `timeout`, `nohup`, and
`sudo` STRIP DYLD_* (SIP), so run the python process directly in the background
(e.g. `... python tools/foo.py & `), never wrapped.

The two drop-zone element IDs (A/B) are Push's; render_frame passes them through
but the media-ref hook in oz_render.dylib IGNORES them (idA/idB are unused) and
binds sources by AUTHORED drop-zone IDENTITY instead: isTransitionSourceA()->
start.jpg, isTransitionSourceB()->end.jpg. That's robust to the compositor's
visitation order (some templates visit their B-role zone first, so a discovery/
call-order scheme would swap A/B), so the IDs work for every template. Pass 0,0.
"""
import ctypes
import os
import re
import tempfile
from typing import Optional

FW = "/Applications/Final Cut Pro.app/Contents/Frameworks"
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOC_TYPE = "com.apple.motion.transition"
TIMESCALE = 24000
# Push drop-zone image-element scene IDs (harmless defaults; hook ignores them
# and binds A/B by authored drop-zone identity — see module docstring).
DROPZONE_A = 1999869843
DROPZONE_B = 1999869841

_shim = None
_msg_send = None
_sel_register = None
_engine_ready = False
_OZDoc = None
_NSURL = None
_objc = None


# FCP's PAE* FxPlug filters (PAERadialBlur/PAEGaussianBlur/PAEBloom/PAEGlow/...
# -- 262 filters total) live in this legacy ProApps plugin bundle, embedded
# inside InternalFiltersXPC.pluginkit. It is a plain in-process ProApps bundle
# (ProPlugDynamicRegistration=false, static ProPlugPlugInList), NOT something
# that needs the XPC service running -- we dlopen + scan it directly.
_PAE_FILTERS_BUNDLE = ("/Applications/Final Cut Pro.app/Contents/PlugIns/"
                       "InternalFiltersXPC.pluginkit/Contents/PlugIns/Filters.bundle")


def _enable_embedded_plugins(Foundation) -> None:
    """Set PlugInKitHost.UsesEmbeddedCode so PlugInKit may load FCP's embedded
    FxPlug filter appex. Belt-and-suspenders opt-in (the exact key FCP.app sets);
    the actual PAE filter registration is done in-process by _load_pae_filters().
    """
    mb = Foundation.NSBundle.mainBundle()
    info = mb.infoDictionary()
    host = info.objectForKey_("PlugInKitHost")
    if host is None:
        host = Foundation.NSMutableDictionary.dictionary()
        info.setObject_forKey_(host, "PlugInKitHost")
    if not host.respondsToSelector_(b"setObject:forKey:"):
        host = Foundation.NSMutableDictionary.dictionaryWithDictionary_(host)
        info.setObject_forKey_(host, "PlugInKitHost")
    host.setObject_forKey_(True, "UsesEmbeddedCode")


def _load_pae_filters(objc) -> None:
    """Register FCP's PAE* FxPlug filters in-process so the Ozone render graph can
    instantiate the ProPlugin Filter nodes referenced by .motr templates.

    The headless boot (OZSharedApplicationForAllUnitTests) never scans/registers
    any FxPlug plugin, and ProAppsFxSupport's usePlugInKitInternally() returns
    FALSE under PCInfo_IsUnitTesting() (our headless engine boots as a "unit
    test"), so OZApplication::ScanPlugins() registers ZERO plugins. Without this,
    every `<filter pluginName="PAERadialBlur">` node has no backing filter and the
    graph passes the layer through UNFILTERED (a plain crossfade with the effect
    silently dropped).

    Fix: the 262 PAE filter classes live in a plain in-process ProApps bundle
    (Filters.bundle). We NSBundle.load() it and register it with
    PROPlugInManager.sharedPlugInManager via scanForPlugInsInBundle: -- exactly
    what a legacy ProApps host does. FXPLUG_USE_PLUGINKIT=1 keeps
    usePlugInKitInternally() honest as a secondary guard. Idempotent (an
    already-loaded bundle re-scans to a no-op).
    """
    os.environ.setdefault("FXPLUG_USE_PLUGINKIT", "1")
    if not os.path.isdir(_PAE_FILTERS_BUNDLE):
        # Different FCP layout / not installed -- leave filters unregistered rather
        # than crash; render_gt's validator will still flag a degenerate render.
        return
    NSBundle = objc.lookUpClass("NSBundle")
    bundle = NSBundle.bundleWithPath_(_PAE_FILTERS_BUNDLE)
    loaded = bundle.load()
    mgr = objc.lookUpClass("PROPlugInManager").sharedPlugInManager()
    mgr.scanForPlugInsInBundle_deferralNotification_(bundle, None)
    # Sanity check the marquee filter registered (UUID must match the .motr's).
    if mgr.plugInWithClassName_("PAERadialBlur") is None:
        import sys
        print("[ozengine] WARNING: PAE filter registration failed "
              f"(bundle.load={loaded}, plugins={len(mgr.plugIns())}) -- "
              "filtered transitions will render UNFILTERED.", file=sys.stderr, flush=True)


# ---- GLOBAL RENDER MUTEX (pool-wide) ----------------------------------------
# The headless Ozone boot creates a MASTER CGL/OpenGL context. macOS cannot
# sustain many concurrent headless GL master contexts: once several coexist the
# shared master-context group WEDGES system-wide (FFCreateSharedCGLContextObj
# failed / NSInternalInconsistencyException) and even solo renders then fail.
# With a multi-agent pool each spawning render processes this is fatal. So only
# ONE ozengine process may hold a live engine at a time: init_engine() takes a
# blocking, stale-reclaiming lock and holds it for the whole process lifetime.
_RENDER_LOCK_PATH = "/tmp/oz_render_global.lock"
_render_lock_fd: Optional[int] = None


def _acquire_global_render_lock(timeout_s: float = 3600, poll_s: float = 0.5) -> None:
    """Block until this process is the sole engine holder on the box. Reclaims a
    stale lock whose owner PID is dead. Idempotent within a process."""
    global _render_lock_fd
    if _render_lock_fd is not None:
        return
    import time
    import errno
    start = time.time()
    while True:
        try:
            fd = os.open(_RENDER_LOCK_PATH, os.O_CREAT | os.O_EXCL | os.O_RDWR, 0o644)
            os.write(fd, str(os.getpid()).encode())
            _render_lock_fd = fd
            import atexit
            atexit.register(_release_global_render_lock)
            return
        except FileExistsError:
            try:
                with open(_RENDER_LOCK_PATH) as f:
                    owner = int((f.read().strip() or "0"))
            except (ValueError, FileNotFoundError):
                owner = 0
            alive = False
            if owner > 0:
                try:
                    os.kill(owner, 0)
                    alive = True
                except OSError as e:
                    alive = (e.errno == errno.EPERM)
            if owner == 0 or not alive:
                try:
                    os.unlink(_RENDER_LOCK_PATH)
                except FileNotFoundError:
                    pass
                continue
            if time.time() - start > timeout_s:
                raise TimeoutError("render lock held by pid %d > %ds" % (owner, timeout_s))
            time.sleep(poll_s)


def _release_global_render_lock() -> None:
    global _render_lock_fd
    if _render_lock_fd is None:
        return
    try:
        with open(_RENDER_LOCK_PATH) as f:
            if (f.read().strip() or "0") == str(os.getpid()):
                os.unlink(_RENDER_LOCK_PATH)
    except (FileNotFoundError, ValueError):
        pass
    try:
        os.close(_render_lock_fd)
    except OSError:
        pass
    _render_lock_fd = None
# -----------------------------------------------------------------------------


def init_engine() -> None:
    """One-time engine init: dlopen Ozone/ProGL, CGL context, plugin opt-in, shim.

    This is the ~1.3s cold-boot cost. It is process-global and idempotent -- call
    it once, then load many .motr docs via load_doc() in the SAME process to
    amortize it across a batch of transitions (instead of re-paying it 65x)."""
    global _shim, _msg_send, _sel_register, _engine_ready, _OZDoc, _NSURL, _objc
    if _engine_ready:
        return
    _acquire_global_render_lock()
    os.environ.setdefault("DYLD_FRAMEWORK_PATH", FW)
    # Force ProAppsFxSupport's usePlugInKitInternally() gate ON before any FCP
    # framework loads (it reads this env at first use). Without it the "unit
    # testing" boot suppresses all FxPlug filter registration. See _load_pae_filters.
    os.environ.setdefault("FXPLUG_USE_PLUGINKIT", "1")
    oz = ctypes.CDLL(FW + "/Ozone.framework/Versions/A/Ozone")
    progl = ctypes.CDLL(FW + "/ProGL.framework/Versions/A/ProGL")
    cgl = ctypes.CDLL("/System/Library/Frameworks/OpenGL.framework/OpenGL")
    import objc
    import AppKit
    import Foundation
    from Foundation import NSURL
    AppKit.NSApplication.sharedApplication().setActivationPolicy_(1)
    _enable_embedded_plugins(Foundation)
    oz["_Z34OZSharedApplicationForAllUnitTestsv"].restype = ctypes.c_void_p
    oz["_Z34OZSharedApplicationForAllUnitTestsv"]()
    # Register the real PAE* FxPlug filters in-process so ProPlugin Filter nodes
    # (PAERadialBlur/PAEGaussianBlur/... in the .motr) actually apply. The headless
    # boot never scans plugins, so we must do it explicitly. Must run before the
    # first render graph build.
    _load_pae_filters(objc)
    progl["PGLMasterCGLContext"].restype = ctypes.c_void_p
    cgl.CGLSetCurrentContext.argtypes = [ctypes.c_void_p]
    cgl.CGLSetCurrentContext(progl["PGLMasterCGLContext"]())
    libobjc = ctypes.CDLL("/usr/lib/libobjc.dylib")
    libobjc.sel_registerName.restype = ctypes.c_void_p
    libobjc.sel_registerName.argtypes = [ctypes.c_char_p]
    _msg_send = libobjc.objc_msgSend
    _msg_send.restype = ctypes.c_void_p
    _msg_send.argtypes = [ctypes.c_void_p, ctypes.c_void_p]
    _sel_register = libobjc.sel_registerName
    _shim = ctypes.CDLL(os.path.join(HERE, "oz_render.dylib"))
    _shim.oz_render_frame.restype = ctypes.c_int
    _shim.oz_render_frame.argtypes = [ctypes.c_void_p, ctypes.c_uint, ctypes.c_uint,
                                      ctypes.c_char_p, ctypes.c_char_p,
                                      ctypes.c_double, ctypes.c_int, ctypes.c_char_p]
    _OZDoc = objc.lookUpClass("OZObjCDocument")
    _NSURL = NSURL
    _objc = objc
    _engine_ready = True


# ---- Rig-widget popup INDEX->TAG remap (generic directional-transition fix) ----
#
# A Motion rig widget (OZRigWidget) selects which snapshot to apply by exact-matching
# the widget's popup channel value against each snapshot's "Value" channel
# (getSnapshotIDsForValue, widgetType==2: |value - snapValue| < 1.27e-7). A rig popup
# carries a MENU whose <entry> elements each have an explicit TAG, and the popup channel
# stores the selected menu-list INDEX. When FCP applies a transition, a PUBLISHED rig
# popup (exposed to the FCP inspector via <publishSettings>) is fed the TAG of the menu
# entry at the stored index -- the editor's index->tag mapping -- whereas the raw stored
# index reaches the rig headless. For ASCENDING-tag menus (tags == sorted(tags)) index==tag,
# so this is invisible; the bug only surfaces for PERMUTED-tag menus.
#
# Movements/Push is the sole shipped offender: its published Direction popup has value="2",
# menu tags [LtR=0, RtL=3, TtB=1, BtT=2] (permuted) and snapshot Values [0,1,2,3]. Headless
# fed 2 -> snapshot Value==2 -> "dir2" (14.48 dB). FCP's GUI feeds tags[index=2]==1 ->
# snapshot Value==1 -> "dir1" (23.22 dB). The fix replays this index->tag lookup, gated on
# TWO conditions so it is a strict no-op for everything else:
#   (1) the popup is PUBLISHED (its object+channel appears in <publishSettings>) -- this
#       EXCLUDES internal rigs such as the Blurs Gaussian/Radial "Pop-up" rig, which share
#       Push's permuted-tag structure but are fed their raw value (remapping them regressed
#       Gaussian 26.40->22.86 and Radial 23.69->19.73), and
#   (2) the menu tags are PERMUTED (tags != sorted(tags)).
# Across all 65 shipped templates only Push's Direction popup satisfies both with a nonzero
# stored index; every other popup is left byte-for-byte untouched. Fully generic -- driven
# purely by each template's own <publishSettings> + <entry tag> tables, NO per-transition
# constants.
_RIG_POPUP_RE = re.compile(
    r'<parameter name="(?P<name>[^"]+)" id="100" flags="(?P<flags>[^"]*)" '
    r'default="(?P<default>[^"]*)" value="(?P<value>[^"]*)">'
    r'(?P<entries>\s*(?:<entry[^>]*/>\s*)+)</parameter>')
_ENTRY_RE = re.compile(r'<entry name="[^"]*" tag="(-?\d+)"/>')
_PUBLISH_RE = re.compile(r'<publishSettings>(.*?)</publishSettings>', re.S)
# published targets that point at a popup selection channel (".../100")
_PUBTARGET_RE = re.compile(r'<target object="\d+" channel="[^"]*100" name="(?P<name>[^"]+)"/>')

# One rig-widget scenenode (name, id, factoryID) + its full body -- used by the binary
# direction-toggle correction pass (needs the widget's Hidden + snapshot Value channels,
# which live in the node body, not in the id=100 popup header alone).
_RIG_BINARY_DIR_NODE_RE = re.compile(
    r'<scenenode name="(?P<wname>[^"]+)" id="(?P<wid>\d+)" factoryID="\d+"[^>]*>'
    r'(?P<body>.*?)</scenenode>', re.S)
_NODE_POPUP_RE = re.compile(
    r'<parameter name="[^"]+" id="100" flags="[^"]*" default="[^"]*" value="'
    r'(?P<value>[^"]*)">(?P<entries>\s*(?:<entry[^>]*/>\s*)+)</parameter>')
_NODE_HIDDEN_RE = re.compile(
    r'<parameter name="Hidden" id="102"[^>]*value="(?P<h>[^"]*)"')
# per-snapshot Value channel, in document (= snapshot-index) order
_NODE_SNAPVAL_RE = re.compile(
    r'<parameter name="Snapshots" id="\d+"[^>]*>\s*'
    r'<parameter name="Value" id="1"[^>]*value="(?P<v>[^"]*)"')
# publishSettings records the WIDGET object id; the popup channel lives on that widget.
_PUBOBJ_RE = re.compile(r'<target object="(\d+)" channel="[^"]*100"')

_remap_cache = {}


def _fix_binary_dir_node(m, published_obj_ids, changed):
    """If node `m` is a published, ascending-tag, exactly-two-entry direction TOGGLE whose
    editor-active snapshot (Hidden) selects a snapshot whose Value differs from the stored
    popup value, rewrite the popup value to that snapshot's Value. Strict no-op otherwise."""
    body = m.group('body')
    pop = _NODE_POPUP_RE.search(body)
    if not pop:
        return m.group(0)
    # (1) published widget only -- match by OBJECT ID (the widget scenenode id equals the
    # <publishSettings> target object; the target's display NAME, e.g. "Rotate", differs
    # from the scenenode NAME, e.g. "Pop-up", so id is the reliable key).
    if m.group('wid') not in published_obj_ids:
        return m.group(0)
    entries = [int(t) for t in _ENTRY_RE.findall(pop.group('entries'))]
    # (2) exactly two options (a binary direction toggle) with ASCENDING tags.
    if len(entries) != 2 or entries != sorted(entries):
        return m.group(0)
    hidm = _NODE_HIDDEN_RE.search(body)
    snapvals = _NODE_SNAPVAL_RE.findall(body)
    if not hidm or len(snapvals) != 2:
        return m.group(0)
    try:
        hidden = int(float(hidm.group('h')))
    except ValueError:
        return m.group(0)
    # (3) Hidden must be a valid 1-based snapshot index (0/unset => no active snapshot).
    if not (1 <= hidden <= 2):
        return m.group(0)
    target = snapvals[hidden - 1]
    cur = pop.group('value')
    try:
        if abs(float(cur) - float(target)) < 1e-9:
            return m.group(0)  # value already agrees with the editor-active snapshot.
    except ValueError:
        if cur == target:
            return m.group(0)
    changed[0] = True
    new_pop = pop.group(0).replace(f'value="{cur}">', f'value="{target}">', 1)
    return m.group(0).replace(pop.group(0), new_pop, 1)


def _rig_popup_index_to_tag(motr_path: str) -> str:
    """Return a path to a .motr whose PUBLISHED + PERMUTED-tag rig-popup channels store the
    menu TAG at the stored INDEX (FCP's editor semantics) instead of the raw index. All
    other popups (unpublished internal rigs, ascending-tag menus) are left unchanged, so
    for all but Push this returns the ORIGINAL path (strict no-op). Cached per source path."""
    try:
        st = os.stat(motr_path)
    except OSError:
        return motr_path
    key = (motr_path, st.st_mtime_ns)
    cached = _remap_cache.get(key)
    if cached is not None:
        return cached
    try:
        with open(motr_path, encoding='utf-8', errors='replace') as f:
            txt = f.read()
    except OSError:
        return motr_path

    pub = _PUBLISH_RE.search(txt)
    published_popups = set(_PUBTARGET_RE.findall(pub.group(1))) if pub else set()
    published_obj_ids = set(_PUBOBJ_RE.findall(pub.group(1))) if pub else set()
    changed = [False]

    def _sub(mo):
        # (1) only PUBLISHED popups get the editor's index->tag treatment.
        if mo.group('name') not in published_popups:
            return mo.group(0)
        entries = [int(t) for t in _ENTRY_RE.findall(mo.group('entries'))]
        if not entries:
            return mo.group(0)
        # (2) ascending tags => index order == tag order => raw value already correct.
        if entries == sorted(entries):
            return mo.group(0)
        try:
            idx = int(float(mo.group('value')))
        except ValueError:
            return mo.group(0)
        if not (0 <= idx < len(entries)):
            return mo.group(0)
        tag = entries[idx]
        if tag == idx:
            return mo.group(0)
        changed[0] = True
        # replace only the value="..." of THIS param header (first occurrence in match)
        return mo.group(0).replace(f'value="{mo.group("value")}">',
                                   f'value="{tag}">', 1)

    out = _RIG_POPUP_RE.sub(_sub, txt)

    # SECOND PASS -- PUBLISHED BINARY DIRECTION TOGGLE snapshot correction.
    #
    # A rig widget's popup channel (id=100) stores the PLAYBACK value that
    # getSnapshotIDsForValue exact-matches against each snapshot's Value channel;
    # separately, the widget records the editor's LAST-ACTIVE snapshot in its `Hidden`
    # (id=102) param. For most widgets these agree, or Hidden is stale editor state that
    # FCP ignores on apply -- so Hidden is NOT a trustworthy playback signal in general
    # (e.g. Blurs Gaussian / Stylized Shape/Color / Speed selectors leave a stale mid-menu
    # Hidden that must NOT override their value).
    #
    # There is exactly ONE structural case where Hidden IS the value FCP applies and the
    # stored value is wrong headless: a PUBLISHED, ASCENDING-tag, EXACTLY-TWO-ENTRY
    # direction TOGGLE (Clockwise/CounterClockwise, East/West). For these, FCP applies the
    # editor's active snapshot (Hidden); headless applies the raw stored value and renders
    # the MIRROR-image rotation/slide. This gate fires only for such binary toggles whose
    # Hidden-indexed snapshot Value differs from the stored value -- across all 65 shipped
    # templates that is Movements/Rotate + 360deg/Push + 360deg/Slide, and it is a strict
    # no-op for every multi-option selector (>2 entries), every unpublished internal rig,
    # and every binary toggle whose value already matches Hidden (e.g. Movements/Swing
    # Direction, whose author DID pick West=1 and whose Hidden agrees). Fully .motr-derived
    # (publishSettings + entry tags + per-snapshot Value + Hidden); no per-transition
    # constants.
    out2 = _RIG_BINARY_DIR_NODE_RE.sub(
        lambda m: _fix_binary_dir_node(m, published_obj_ids, changed), out)

    if not changed[0]:
        _remap_cache[key] = motr_path
        return motr_path
    tf = tempfile.NamedTemporaryFile(prefix='ozrig_', suffix='.motr', delete=False)
    tf.write(out2.encode('utf-8'))
    tf.close()
    _remap_cache[key] = tf.name
    return tf.name


def load_doc(motr_path: str):
    """Load one .motr document into the already-initialized engine. Returns the
    C++ OZScene doc ptr. Cheap relative to init_engine() -- safe to call per
    transition in a batch. Auto-inits the engine on first call."""
    if not _engine_ready:
        init_engine()
    motr_path = _rig_popup_index_to_tag(motr_path)
    doc = _OZDoc.alloc().init()
    ok, _ = doc.readFromURL_ofType_error_(_NSURL.fileURLWithPath_(motr_path), DOC_TYPE, None)
    if not ok:
        raise RuntimeError("failed to load .motr: " + motr_path)
    return _msg_send(ctypes.c_void_p(_objc.pyobjc_id(doc)), _sel_register(b"getDocument"))


def render_frame(doc, img_a: str, img_b: str, tsec: float, out: str,
                 a_id: int = DROPZONE_A, b_id: int = DROPZONE_B) -> int:
    """Render one frame at scene time `tsec` (seconds) to PNG `out`."""
    return _shim.oz_render_frame(ctypes.c_void_p(doc), a_id, b_id,
                                 os.path.abspath(img_a).encode(),
                                 os.path.abspath(img_b).encode(),
                                 float(tsec), TIMESCALE, os.path.abspath(out).encode())
