import os, sys, ctypes
REPO="/Users/vjeux/random/final-cut-pro-transitions"
sys.path.insert(0,os.path.join(REPO,"tools")); sys.path.insert(0,REPO)
import ozengine, fct.config as C
ozengine.init_engine()
FW="/Applications/Final Cut Pro.app/Contents/Frameworks"
ctypes.CDLL(FW+"/Ozone.framework/Versions/A/PlugIns/Particles.ozp/Contents/MacOS/Particles", mode=ctypes.RTLD_GLOBAL)
hook=ctypes.CDLL(REPO+"/fct/instrument/ginf2.dylib"); hook.setup_ginf2.restype=ctypes.c_int
hook.ginf2_frame.argtypes=[ctypes.c_int]
print("setup", hook.setup_ginf2(), flush=True)
doc=ozengine.load_doc(REPO+"/fct/minimized/Objects__Squares/case.motr")
for i in range(24):
    frac=i/23.0
    hook.ginf2_frame(i)
    ozengine.render_frame(doc,C.IMG_A,C.IMG_B,frac*2.333,f"/tmp/gi2_{i}.png")
print("done",flush=True); open("/tmp/gi2_done.txt","w").write("done")
