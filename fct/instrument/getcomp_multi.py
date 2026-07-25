import os, sys, ctypes
REPO="/Users/vjeux/random/final-cut-pro-transitions"
sys.path.insert(0,os.path.join(REPO,"tools")); sys.path.insert(0,REPO)
import ozengine, fct.config as C
ozengine.init_engine()
FW="/Applications/Final Cut Pro.app/Contents/Frameworks"
ctypes.CDLL(FW+"/Ozone.framework/Versions/A/PlugIns/Particles.ozp/Contents/MacOS/Particles", mode=ctypes.RTLD_GLOBAL)
hook=ctypes.CDLL(REPO+"/fct/instrument/getcomp.dylib"); hook.setup_getcomp.restype=ctypes.c_int
print("setup", hook.setup_getcomp(), flush=True)
doc=ozengine.load_doc(REPO+"/fct/minimized/Objects__Squares/case.motr")
# render at several times; the trace file will have all getInfluence calls; we tag by writing a marker.
import ctypes as ct
for frac in [0.10,0.20,0.30,0.40,0.50,0.60,0.70,0.80]:
    # write a marker into the trace by opening/appending
    open("/tmp/getcomp_trace.txt","a").write(f"=== FRAME frac={frac} ===\n")
    ozengine.render_frame(doc,C.IMG_A,C.IMG_B,frac*2.333,f"/tmp/gcm_{int(frac*100)}.png")
print("done",flush=True); open("/tmp/gcm_done.txt","w").write("done")
