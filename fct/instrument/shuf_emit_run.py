import os, sys, ctypes
REPO="/Users/vjeux/random/final-cut-pro-transitions"
sys.path.insert(0,os.path.join(REPO,"tools")); sys.path.insert(0,REPO)
import ozengine, fct.config as C
ozengine.init_engine()
FW="/Applications/Final Cut Pro.app/Contents/Frameworks"
ctypes.CDLL(FW+"/Ozone.framework/Versions/A/PlugIns/Particles.ozp/Contents/MacOS/Particles", mode=ctypes.RTLD_GLOBAL)
hook=ctypes.CDLL(REPO+"/fct/instrument/shuf.dylib"); hook.setup_shuf.restype=ctypes.c_int
print("setup", hook.setup_shuf(), flush=True)
doc=ozengine.load_doc(REPO+"/fct/minimized/Objects__Squares/case.motr")
ozengine.render_frame(doc,C.IMG_A,C.IMG_B,0.3*2.333,"/tmp/se.png")
print("done",flush=True); open("/tmp/se_done.txt","w").write("done")
