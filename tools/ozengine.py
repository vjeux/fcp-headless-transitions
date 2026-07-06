"""
Shared Ozone (FCP Motion engine) headless-boot boilerplate.

Every ground-truth / probe script needs the same ~15 lines to bring up the real
FCP render engine in-process. This module centralizes that so callers just do:

    from ozengine import init_engine, load_doc, render_frame
    init_engine()                     # one-time ~1.3s engine boot (idempotent)
    doc = load_doc("/path/to/Foo.motr")
    render_frame(doc, "imgA.png", "imgB.png", tsec=0.5, out="frame.png")

Render many transitions in ONE process by calling init_engine() once, then
load_doc() per transition — this amortizes the boot instead of re-paying it.

IMPORTANT ENV: DYLD_FRAMEWORK_PATH must point at FCP's Frameworks dir so the
engine's sibling frameworks resolve at dlopen time. `timeout`, `nohup`, and
`sudo` STRIP DYLD_* (SIP), so run the python process directly in the background
(e.g. `... python tools/foo.py & `), never wrapped.

The two drop-zone element IDs (A/B) are Push's; render_frame passes them through
but the media-ref hook in oz_render.dylib actually assigns sources by call order,
so they work for every template. Pass 0,0 to rely purely on call-order.
"""
import ctypes, os, re, tempfile

FW = "/Applications/Final Cut Pro.app/Contents/Frameworks"
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOC_TYPE = "com.apple.motion.transition"
TIMESCALE = 24000
# Push drop-zone image-element scene IDs (harmless defaults; hook uses call order).
DROPZONE_A = 1999869843
DROPZONE_B = 1999869841

_shim = None
_ms = None
_sel = None
_engine_ready = False
_OZDoc = None
_NSURL = None
_objc = None


# FCP's PAE* FxPlug filters (PAERadialBlur/PAEGaussianBlur/PAEDirectionalBlur/
# PAEZoomBlur/PAEBloom/PAEGlow/PAEBlackHole/PAETrails/PAEBadTV/PAEEarthquake/
# PAEUnderwater/... — 262 filters total) live in this legacy ProApps plugin
# bundle, embedded inside InternalFiltersXPC.pluginkit. It is a plain `BNDL`
# with ProPlugDynamicRegistration=false and a static ProPlugPlugInList — i.e. a
# normal in-process ProApps plugin bundle, NOT something that requires the XPC
# service to be running. We dlopen + scan it directly (see _load_pae_filters).
_PAE_FILTERS_BUNDLE = ("/Applications/Final Cut Pro.app/Contents/PlugIns/"
                       "InternalFiltersXPC.pluginkit/Contents/PlugIns/Filters.bundle")


def _enable_embedded_plugins(Foundation):
    """Let PlugInKit load FCP's embedded FxPlug filter appex (InternalFiltersXPC).

    Kept as a belt-and-suspenders opt-in (the exact key FCP.app itself sets); the
    actual PAE filter registration is done in-process by _load_pae_filters().
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


def _load_pae_filters(objc):
    """Register FCP's PAE* FxPlug filters in-process so the Ozone render graph
    can instantiate them (ProPlugin Filter nodes).

    ⚠️ ROOT CAUSE this fixes (2026-07-06): the headless boot
    (OZSharedApplicationForAllUnitTests) NEVER scans/registers any FxPlug plugin.
    Worse, ProAppsFxSupport's `usePlugInKitInternally()` returns FALSE whenever
    `PCInfo_IsUnitTesting()` is true (our headless engine boots as a "unit test"),
    so even OZApplication::ScanPlugins() registers ZERO plugins. Consequently
    every `<filter ... pluginName="PAERadialBlur">` node in a .motr had NO backing
    filter implementation and the Ozone graph passed the layer through UNFILTERED
    — a plain crossfade with the blur/effect silently dropped. This made the GT
    for ~26 transitions (all Blurs, Bloom, Black Hole, Static, Earthquake, ...)
    a filterless degenerate render.

    THE FIX: the 262 PAE filter classes live in a plain in-process ProApps plugin
    bundle (Filters.bundle, ProPlugDynamicRegistration=false). We dlopen it via
    NSBundle.load() and register it with PROPlugInManager.sharedPlugInManager via
    scanForPlugInsInBundle: — exactly what a legacy ProApps host does. After this,
    `mgr.plugInWithClassName_("PAERadialBlur")` resolves (UUID
    8F9F88CF-… matches the .motr), and the render graph applies the real filter.
    Setting FXPLUG_USE_PLUGINKIT=1 keeps usePlugInKitInternally() honest as a
    secondary guard. Idempotent (bundle already loaded -> scan is a no-op)."""
    os.environ.setdefault("FXPLUG_USE_PLUGINKIT", "1")
    if not os.path.isdir(_PAE_FILTERS_BUNDLE):
        # Different FCP layout / not installed — leave filters unregistered rather
        # than crash; render_gt's validator will still flag a degenerate render.
        return
    NSBundle = objc.lookUpClass("NSBundle")
    bundle = NSBundle.bundleWithPath_(_PAE_FILTERS_BUNDLE)
    loaded = bundle.load()
    mgr = objc.lookUpClass("PROPlugInManager").sharedPlugInManager()
    mgr.scanForPlugInsInBundle_deferralNotification_(bundle, None)
    # Sanity check the marquee filter registered (UUID must match the .motr's).
    ok = mgr.plugInWithClassName_("PAERadialBlur") is not None
    if not ok:
        import sys as _sys
        print("[ozengine] WARNING: PAE filter registration failed "
              f"(bundle.load={loaded}, plugins={len(mgr.plugIns())}) — "
              "filtered transitions will render UNFILTERED.", file=_sys.stderr, flush=True)

# ---- GLOBAL RENDER MUTEX (pool-wide) ----------------------------------------
# The headless Ozone boot creates a MASTER CGL/OpenGL context. macOS cannot sustain
# many concurrent headless GL master contexts: once several coexist the shared
# master-context group WEDGES system-wide (FFCreateSharedCGLContextObj failed /
# NSInternalInconsistencyException) and even solo renders then fail. With an 8-agent
# pool each spawning render processes this is fatal. FIX: only ONE ozengine process
# may hold a live engine at a time. We take a blocking, stale-reclaiming lock at
# init_engine() and hold it for the whole process lifetime.
_RENDER_LOCK_PATH = "/tmp/oz_render_global.lock"
_render_lock_fd = None

def _acquire_global_render_lock(timeout_s=3600, poll_s=0.5):
    """Block until this process is the sole engine holder on the box. Reclaims a
    stale lock whose owner PID is dead. Idempotent within a process."""
    global _render_lock_fd
    if _render_lock_fd is not None:
        return
    import time as _t, errno as _errno
    start = _t.time()
    while True:
        try:
            fd = os.open(_RENDER_LOCK_PATH, os.O_CREAT | os.O_EXCL | os.O_RDWR, 0o644)
            os.write(fd, str(os.getpid()).encode())
            _render_lock_fd = fd
            import atexit as _atexit
            _atexit.register(_release_global_render_lock)
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
                    os.kill(owner, 0); alive = True
                except OSError as e:
                    alive = (e.errno == _errno.EPERM)
            if owner == 0 or not alive:
                try: os.unlink(_RENDER_LOCK_PATH)
                except FileNotFoundError: pass
                continue
            if _t.time() - start > timeout_s:
                raise TimeoutError("render lock held by pid %d > %ds" % (owner, timeout_s))
            _t.sleep(poll_s)

def _release_global_render_lock():
    global _render_lock_fd
    if _render_lock_fd is None:
        return
    try:
        with open(_RENDER_LOCK_PATH) as f:
            if (f.read().strip() or "0") == str(os.getpid()):
                os.unlink(_RENDER_LOCK_PATH)
    except (FileNotFoundError, ValueError):
        pass
    try: os.close(_render_lock_fd)
    except OSError: pass
    _render_lock_fd = None
# -----------------------------------------------------------------------------


def init_engine():
    """One-time engine init: dlopen Ozone/ProGL, CGL context, plugin opt-in, shim.

    This is the ~1.3s cold-boot cost. It is process-global and idempotent — call
    it once, then load many .motr docs via load_doc() in the SAME process to
    amortize it across a batch of transitions (instead of re-paying it 65×)."""
    global _shim, _ms, _sel, _engine_ready, _OZDoc, _NSURL, _objc
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
    import objc, AppKit, Foundation
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
    _ms = libobjc.objc_msgSend
    _ms.restype = ctypes.c_void_p
    _ms.argtypes = [ctypes.c_void_p, ctypes.c_void_p]
    _sel = libobjc.sel_registerName
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
# ROOT CAUSE (2026-07-06, verified lldb + disasm + runtime trace + pixel): a Motion rig
# widget (OZRigWidget) selects which snapshot to apply by EXACT-matching the widget's
# popup channel value against each snapshot's "Value" channel
# (OZRigWidget::getSnapshotIDsForValue, widgetType==2: |value - snapValue| < 1.27e-7,
# reached via getCurrentSnapshotIDs -> OZChannel::getValueAsDouble on the popup channel at
# this+0x438). A runtime breakpoint on a headless Push render showed the Direction rig fed
# value 2.0 -> matched snapshot Value==2 -> "dir2" geometry (14.48 dB vs FCP's GUI).
#
# A rig popup carries a MENU whose <entry> elements each have an explicit TAG. The popup
# channel stores the selected menu-list INDEX. When FCP applies a transition, a PUBLISHED
# rig popup (exposed to the FCP inspector via <publishSettings>) is fed the TAG of the menu
# entry at the stored index — the editor's index->tag mapping — whereas the raw stored
# index reaches the rig headless. For ASCENDING-tag menus (tags == sorted(tags)) index==tag
# so this is invisible; the bug only surfaces for PERMUTED-tag menus.
#
# Movements/Push is the sole shipped offender: its PUBLISHED Direction popup has value="2",
# menu tags [LtR=0, RtL=3, TtB=1, BtT=2] (permuted) and snapshot Values [0,1,2,3]. Headless
# fed 2 -> snapshot Value==2 -> dir2 (14.48 dB). FCP's GUI feeds tags[index=2]==1 -> snapshot
# Value==1 -> dir1 (23.22 dB). The fix replays this index->tag lookup, gated on TWO conditions
# so it is a strict no-op for everything else:
#   (1) the popup is PUBLISHED (its object+channel appears in <publishSettings>) — this
#       EXCLUDES internal rigs such as the Blurs Gaussian/Radial "Pop-up" rig, which share
#       Push's exact permuted-tag structure but are fed their raw value (verified: remapping
#       them regressed Gaussian 26.40->22.86 and Radial 23.69->19.73), and
#   (2) the menu tags are PERMUTED (tags != sorted(tags)).
# Across all 65 shipped templates only Push's Direction popup satisfies both with a nonzero
# stored index; every other published/unpublished popup is left byte-for-byte untouched.
# Fully generic — driven purely by each template's OWN <publishSettings> + <entry tag> tables,
# NO per-transition constants.
_RIG_POPUP_RE = re.compile(
    r'<parameter name="(?P<name>[^"]+)" id="100" flags="(?P<flags>[^"]*)" '
    r'default="(?P<default>[^"]*)" value="(?P<value>[^"]*)">'
    r'(?P<entries>\s*(?:<entry[^>]*/>\s*)+)</parameter>')
_ENTRY_RE = re.compile(r'<entry name="[^"]*" tag="(-?\d+)"/>')
_PUBLISH_RE = re.compile(r'<publishSettings>(.*?)</publishSettings>', re.S)
# published targets that point at a popup selection channel (".../100")
_PUBTARGET_RE = re.compile(r'<target object="\d+" channel="[^"]*100" name="(?P<name>[^"]+)"/>')
_remap_cache = {}


def _rig_popup_index_to_tag(motr_path):
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
    if not changed[0]:
        _remap_cache[key] = motr_path
        return motr_path
    tf = tempfile.NamedTemporaryFile(prefix='ozrig_', suffix='.motr', delete=False)
    tf.write(out.encode('utf-8'))
    tf.close()
    _remap_cache[key] = tf.name
    return tf.name


def load_doc(motr_path):
    """Load one .motr document into the already-initialized engine. Returns the
    C++ OZScene doc ptr. Cheap relative to init_engine() — safe to call per
    transition in a batch. Auto-inits the engine on first call."""
    if not _engine_ready:
        init_engine()
    motr_path = _rig_popup_index_to_tag(motr_path)
    doc = _OZDoc.alloc().init()
    ok, _ = doc.readFromURL_ofType_error_(_NSURL.fileURLWithPath_(motr_path), DOC_TYPE, None)
    if not ok:
        raise RuntimeError("failed to load .motr: " + motr_path)
    return _ms(ctypes.c_void_p(_objc.pyobjc_id(doc)), _sel(b"getDocument"))


def render_frame(doc, img_a, img_b, tsec, out, a_id=DROPZONE_A, b_id=DROPZONE_B):
    """Render one frame at scene time `tsec` (seconds) to PNG `out`."""
    return _shim.oz_render_frame(ctypes.c_void_p(doc), a_id, b_id,
                                 os.path.abspath(img_a).encode(),
                                 os.path.abspath(img_b).encode(),
                                 float(tsec), TIMESCALE, os.path.abspath(out).encode())
