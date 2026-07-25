import os, sys, ctypes
REPO="/Users/vjeux/random/final-cut-pro-transitions"
sys.path.insert(0,os.path.join(REPO,"tools")); sys.path.insert(0,REPO)
import ozengine, fct.config as C
ozengine.init_engine()
FW="/Applications/Final Cut Pro.app/Contents/Frameworks"
ctypes.CDLL(FW+"/Ozone.framework/Versions/A/PlugIns/Particles.ozp/Contents/MacOS/Particles", mode=ctypes.RTLD_GLOBAL)
h1=ctypes.CDLL(REPO+"/fct/instrument/shuforder.dylib"); h1.setup_shuforder.restype=ctypes.c_int
h2=ctypes.CDLL(REPO+"/fct/instrument/gofr.dylib"); h2.setup_gofr.restype=ctypes.c_int
print("shuf setup", h1.setup_shuforder(), "gofr setup", h2.setup_gofr(), flush=True)
doc=ozengine.load_doc(REPO+"/fct/minimized/Objects__Squares/case.motr")
for i,frac in enumerate([0.0,0.1,0.3,0.5]):
    ozengine.render_frame(doc,C.IMG_A,C.IMG_B,frac*2.333,f"/tmp/both_{i}.png")
print("done",flush=True); open("/tmp/both_done.txt","w").write("done")
