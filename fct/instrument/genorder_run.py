import os, sys, ctypes
REPO="/Users/vjeux/random/final-cut-pro-transitions"
sys.path.insert(0,os.path.join(REPO,"tools")); sys.path.insert(0,REPO)
import ozengine
import fct.config as C
ozengine.init_engine()
# Force-load Particles.ozp BEFORE any doc render so genOrderLinear resolves + can be hooked pre-emission.
FW="/Applications/Final Cut Pro.app/Contents/Frameworks"
ctypes.CDLL(FW+"/Ozone.framework/Versions/A/PlugIns/Particles.ozp/Contents/MacOS/Particles", mode=ctypes.RTLD_GLOBAL)
hook=ctypes.CDLL(REPO+"/fct/instrument/genorder.dylib"); hook.setup_genorder.restype=ctypes.c_int
print("setup", hook.setup_genorder(), flush=True)
# FIRST-ever doc load+render (emission happens here with hook live)
doc=ozengine.load_doc(REPO+"/fct/minimized/Objects__Squares/case.motr")
ozengine.render_frame(doc,C.IMG_A,C.IMG_B,0.25*2.333,"/tmp/go.png")
print("done",flush=True)
open("/tmp/go_done.txt","w").write("done")
