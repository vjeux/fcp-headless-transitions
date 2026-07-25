import os, sys, ctypes
REPO="/Users/vjeux/random/final-cut-pro-transitions"
sys.path.insert(0,os.path.join(REPO,"tools")); sys.path.insert(0,REPO)
import ozengine, fct.config as C
ozengine.init_engine()
FW="/Applications/Final Cut Pro.app/Contents/Frameworks"
ctypes.CDLL(FW+"/Ozone.framework/Versions/A/PlugIns/Particles.ozp/Contents/MacOS/Particles", mode=ctypes.RTLD_GLOBAL)
hook=ctypes.CDLL(REPO+"/fct/instrument/gvof.dylib"); hook.setup_gvof.restype=ctypes.c_int
hook.gvof_frame.argtypes=[ctypes.c_int]
print("setup", hook.setup_gvof(), flush=True)
doc=ozengine.load_doc(REPO+"/fct/minimized/Objects__Squares/case.motr")
for i,frac in enumerate([0.1,0.3,0.5,0.7]):
    hook.gvof_frame(int(frac*100))
    ozengine.render_frame(doc,C.IMG_A,C.IMG_B,frac*2.333,f"/tmp/gvof_{i}.png")
print("done",flush=True); open("/tmp/gvof_done.txt","w").write("done")
