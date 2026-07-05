"""
Shared Ozone (FCP Motion engine) headless-boot boilerplate.

Every ground-truth / probe script needs the same ~15 lines to bring up the real
FCP render engine in-process. This module centralizes that so callers just do:

    from ozengine import boot, render_frame
    doc = boot("/path/to/Foo.motr")
    render_frame(doc, "imgA.png", "imgB.png", tsec=0.5, out="frame.png")

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


def _enable_embedded_plugins(Foundation):
    """Let PlugInKit load FCP's embedded FxPlug filter appex (InternalFiltersXPC).

    FCP's PAE* filters (PAENoise, PAECloudsV2, PAEBlackHole, 360° Reorient, ...)
    live in InternalFiltersXPC.pluginkit, whose Info.plist declares
    `PlugInKit.EmbeddedCode = Filters.bundle`. PlugInKit refuses to discover such
    embedded plug-ins unless the *host process's* main-bundle Info.plist opts in
    via `PlugInKitHost.UsesEmbeddedCode = true` (the exact key FCP.app itself
    sets). Headless we run as `python`, whose bundle lacks that key, so discovery
    aborts with:
        PlugInKit discovery failed - error #3, cannot request embedded plug-ins
        without using the "UsesEmbeddedCode" key
    and every filtered node renders black.

    The main bundle's infoDictionary is a *mutable* __NSDictionaryM, so we inject
    the opt-in in place before the engine boots. Must run before the first
    PlugInKit discovery (i.e. before the render graph is built).
    """
    mb = Foundation.NSBundle.mainBundle()
    info = mb.infoDictionary()
    host = info.objectForKey_("PlugInKitHost")
    if host is None:
        host = Foundation.NSMutableDictionary.dictionary()
        info.setObject_forKey_(host, "PlugInKitHost")
    # host may be an immutable NSDictionary if FCP ever ships one; make it mutable.
    if not host.respondsToSelector_(b"setObject:forKey:"):
        host = Foundation.NSMutableDictionary.dictionaryWithDictionary_(host)
        info.setObject_forKey_(host, "PlugInKitHost")
    host.setObject_forKey_(True, "UsesEmbeddedCode")

def init_engine():
    """One-time engine init: dlopen Ozone/ProGL, CGL context, plugin opt-in, shim.

    This is the ~1.3s cold-boot cost. It is process-global and idempotent — call
    it once, then load many .motr docs via load_doc() in the SAME process to
    amortize it across a batch of transitions (instead of re-paying it 65×)."""
    global _shim, _ms, _sel, _engine_ready, _OZDoc, _NSURL, _objc
    if _engine_ready:
        return
    os.environ.setdefault("DYLD_FRAMEWORK_PATH", FW)
    oz = ctypes.CDLL(FW + "/Ozone.framework/Versions/A/Ozone")
    progl = ctypes.CDLL(FW + "/ProGL.framework/Versions/A/ProGL")
    cgl = ctypes.CDLL("/System/Library/Frameworks/OpenGL.framework/OpenGL")
    import objc, AppKit, Foundation
    from Foundation import NSURL
    AppKit.NSApplication.sharedApplication().setActivationPolicy_(1)
    _enable_embedded_plugins(Foundation)
    oz["_Z34OZSharedApplicationForAllUnitTestsv"].restype = ctypes.c_void_p
    oz["_Z34OZSharedApplicationForAllUnitTestsv"]()
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


def boot(motr_path):
    """Boot the engine and load a .motr document. Returns the C++ OZScene doc ptr.

    Backward-compatible: equivalent to init_engine() + load_doc(motr_path). For
    rendering multiple transitions in one process, call init_engine() once then
    load_doc() per transition to avoid re-paying the ~1.3s engine init."""
    init_engine()
    return load_doc(motr_path)


def render_frame(doc, img_a, img_b, tsec, out, a_id=DROPZONE_A, b_id=DROPZONE_B):
    """Render one frame at scene time `tsec` (seconds) to PNG `out`."""
    return _shim.oz_render_frame(ctypes.c_void_p(doc), a_id, b_id,
                                 os.path.abspath(img_a).encode(),
                                 os.path.abspath(img_b).encode(),
                                 float(tsec), TIMESCALE, os.path.abspath(out).encode())
