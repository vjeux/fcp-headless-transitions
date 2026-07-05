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

def boot(motr_path):
    """Boot the engine and load a .motr document. Returns the C++ OZScene doc ptr."""
    global _shim, _ms, _sel
    os.environ.setdefault("DYLD_FRAMEWORK_PATH", FW)
    oz = ctypes.CDLL(FW + "/Ozone.framework/Versions/A/Ozone")
    progl = ctypes.CDLL(FW + "/ProGL.framework/Versions/A/ProGL")
    cgl = ctypes.CDLL("/System/Library/Frameworks/OpenGL.framework/OpenGL")
    import objc, AppKit
    from Foundation import NSURL
    AppKit.NSApplication.sharedApplication().setActivationPolicy_(1)
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
    OZDoc = objc.lookUpClass("OZObjCDocument")
    doc = OZDoc.alloc().init()
    ok, _ = doc.readFromURL_ofType_error_(NSURL.fileURLWithPath_(motr_path), DOC_TYPE, None)
    if not ok:
        raise RuntimeError("failed to load .motr: " + motr_path)
    return _ms(ctypes.c_void_p(objc.pyobjc_id(doc)), _sel(b"getDocument"))

def render_frame(doc, img_a, img_b, tsec, out, a_id=DROPZONE_A, b_id=DROPZONE_B):
    """Render one frame at scene time `tsec` (seconds) to PNG `out`."""
    return _shim.oz_render_frame(ctypes.c_void_p(doc), a_id, b_id,
                                 os.path.abspath(img_a).encode(),
                                 os.path.abspath(img_b).encode(),
                                 float(tsec), TIMESCALE, os.path.abspath(out).encode())
