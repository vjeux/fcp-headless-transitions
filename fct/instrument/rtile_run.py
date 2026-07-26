import os, sys, ctypes
REPO="/Users/vjeux/random/final-cut-pro-transitions"
sys.path.insert(0,os.path.join(REPO,"tools")); sys.path.insert(0,REPO)
import ozengine, fct.config as C
ozengine.init_engine()
FW="/Applications/Final Cut Pro.app/Contents/Frameworks"
ctypes.CDLL(FW+"/Ozone.framework/Versions/A/PlugIns/Particles.ozp/Contents/MacOS/Particles", mode=ctypes.RTLD_GLOBAL)
hook=ctypes.CDLL(REPO+"/fct/instrument/rtile.dylib"); hook.setup_rtile.restype=ctypes.c_int
hook.rtile_frame.argtypes=[ctypes.c_int]
print("setup", hook.setup_rtile(), flush=True)
doc=ozengine.load_doc(REPO+"/fct/minimized/Objects__Squares/case.motr")
for i,frac in enumerate([0.1,0.2,0.3,0.4,0.5]):
    hook.rtile_frame(int(frac*100))
    ozengine.render_frame(doc,C.IMG_A,C.IMG_B,frac*2.333,f"/tmp/rt_{i}.png")
print("done",flush=True); open("/tmp/rtile_done.txt","w").write("done")
