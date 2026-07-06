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
import ctypes, os

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


def load_doc(motr_path):
    """Load one .motr document into the already-initialized engine. Returns the
    C++ OZScene doc ptr. Cheap relative to init_engine() — safe to call per
    transition in a batch. Auto-inits the engine on first call."""
    if not _engine_ready:
        init_engine()
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
