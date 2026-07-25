import os, sys, ctypes
REPO="/Users/vjeux/random/final-cut-pro-transitions"
sys.path.insert(0,os.path.join(REPO,"tools")); sys.path.insert(0,REPO)
import ozengine, fct.config as C
ozengine.init_engine()
FW="/Applications/Final Cut Pro.app/Contents/Frameworks"
ctypes.CDLL(FW+"/Ozone.framework/Versions/A/PlugIns/Particles.ozp/Contents/MacOS/Particles", mode=ctypes.RTLD_GLOBAL)
hook=ctypes.CDLL(REPO+"/fct/instrument/ginfenc.dylib"); hook.setup_ginfenc.restype=ctypes.c_int
print("setup", hook.setup_ginfenc(), flush=True)
doc=ozengine.load_doc(REPO+"/fct/minimized/Objects__Squares/case.motr")
# render at frac 0.5 (mid, all tiles active) — influence encodes calcIdx as brightness
ozengine.render_frame(doc,C.IMG_A,C.IMG_B,0.5*2.333,"/tmp/ginfenc.png")
print("done",flush=True); open("/tmp/ginfenc_done.txt","w").write("done")
