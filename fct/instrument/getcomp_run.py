import os, sys, ctypes
REPO="/Users/vjeux/random/final-cut-pro-transitions"
sys.path.insert(0,os.path.join(REPO,"tools")); sys.path.insert(0,REPO)
import ozengine, fct.config as C
ozengine.init_engine()
FW="/Applications/Final Cut Pro.app/Contents/Frameworks"
ctypes.CDLL(FW+"/Ozone.framework/Versions/A/PlugIns/Particles.ozp/Contents/MacOS/Particles", mode=ctypes.RTLD_GLOBAL)
hook=ctypes.CDLL(REPO+"/fct/instrument/getcomp.dylib"); hook.setup_getcomp.restype=ctypes.c_int
hook.gc_frame.argtypes=[ctypes.c_int]
print("setup", hook.setup_getcomp(), flush=True)
doc=ozengine.load_doc(REPO+"/fct/minimized/Objects__Squares/case.motr")
for i,frac in enumerate([0.1,0.2,0.3,0.5,0.7]):
    hook.gc_frame(int(frac*100))
    ozengine.render_frame(doc,C.IMG_A,C.IMG_B,frac*2.333,f"/tmp/gc_{i}.png")
print("done",flush=True); open("/tmp/gc_done.txt","w").write("done")
