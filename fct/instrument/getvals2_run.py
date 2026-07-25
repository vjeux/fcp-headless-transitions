import os, sys, ctypes
REPO="/Users/vjeux/random/final-cut-pro-transitions"
sys.path.insert(0,os.path.join(REPO,"tools")); sys.path.insert(0,REPO)
import ozengine, fct.config as C
ozengine.init_engine()
FW="/Applications/Final Cut Pro.app/Contents/Frameworks"
ctypes.CDLL(FW+"/Ozone.framework/Versions/A/PlugIns/Particles.ozp/Contents/MacOS/Particles", mode=ctypes.RTLD_GLOBAL)
hook=ctypes.CDLL(REPO+"/fct/instrument/getvals2.dylib"); hook.setup_getvals2.restype=ctypes.c_int
hook.gv2_mark.argtypes=[ctypes.c_double]
print("setup", hook.setup_getvals2(), flush=True)
doc=ozengine.load_doc(REPO+"/fct/minimized/Objects__Squares/case.motr")
for frac in [0.05,0.1,0.15,0.2,0.25,0.3,0.35,0.4,0.45,0.5,0.6,0.7,0.8,0.9]:
    hook.gv2_mark(frac)
    ozengine.render_frame(doc,C.IMG_A,C.IMG_B,frac*2.333,f"/tmp/gv2_{int(frac*100)}.png")
print("done",flush=True); open("/tmp/gv2_done.txt","w").write("done")
