import os, sys, ctypes
REPO="/Users/vjeux/random/final-cut-pro-transitions"
sys.path.insert(0,os.path.join(REPO,"tools")); sys.path.insert(0,REPO)
import ozengine, fct.config as C
ozengine.init_engine()
FW="/Applications/Final Cut Pro.app/Contents/Frameworks"
ctypes.CDLL(FW+"/Ozone.framework/Versions/A/PlugIns/Particles.ozp/Contents/MacOS/Particles", mode=ctypes.RTLD_GLOBAL)
hook=ctypes.CDLL(REPO+"/fct/instrument/getvals.dylib"); hook.setup_getvals.restype=ctypes.c_int
print("setup", hook.setup_getvals(), flush=True)
doc=ozengine.load_doc(REPO+"/fct/minimized/Objects__Squares/case.motr")
for frac in [0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9]:
    open("/tmp/getvals_trace.txt","a").write(f"=== FRAME {frac} ===\n")
    ozengine.render_frame(doc,C.IMG_A,C.IMG_B,frac*2.333,f"/tmp/gvm_{int(frac*100)}.png")
print("done",flush=True); open("/tmp/gvm_done.txt","w").write("done")
