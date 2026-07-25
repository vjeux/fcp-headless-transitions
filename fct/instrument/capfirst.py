import os, sys, ctypes
REPO="/Users/vjeux/random/final-cut-pro-transitions"
sys.path.insert(0,os.path.join(REPO,"tools")); sys.path.insert(0,REPO)
import ozengine
import fct.config as C
ozengine.init_engine()
# Force-load Particles.ozp BEFORE any doc render so we can hook shuffleOrder first.
FW="/Applications/Final Cut Pro.app/Contents/Frameworks"
ctypes.CDLL(FW+"/Ozone.framework/Versions/A/PlugIns/Particles.ozp/Contents/MacOS/Particles", mode=ctypes.RTLD_GLOBAL)
hook=ctypes.CDLL(REPO+"/fct/instrument/capshuf.dylib"); hook.setup_capshuf.restype=ctypes.c_int
print("hook rc", hook.setup_capshuf(), flush=True)
# FIRST-EVER doc load + render (shuffle computed here, hook is live)
doc=ozengine.load_doc(REPO+"/fct/minimized/Objects__Squares/case.motr")
ozengine.render_frame(doc,C.IMG_A,C.IMG_B,0.25*2.333,"/tmp/cf.png")
print("done",flush=True)
open("/tmp/cf_done.txt","w").write("done")
