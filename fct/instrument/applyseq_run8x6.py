import os, sys, ctypes
REPO="/Users/vjeux/random/final-cut-pro-transitions"
sys.path.insert(0,os.path.join(REPO,"tools")); sys.path.insert(0,REPO)
import ozengine, fct.config as C
ozengine.init_engine()
FW="/Applications/Final Cut Pro.app/Contents/Frameworks"
ctypes.CDLL(FW+"/Ozone.framework/Versions/A/PlugIns/Particles.ozp/Contents/MacOS/Particles", mode=ctypes.RTLD_GLOBAL)
hook=ctypes.CDLL(REPO+"/fct/instrument/applyseq8.dylib"); hook.setup_applyseq.restype=ctypes.c_int
print("setup", hook.setup_applyseq(), flush=True)
doc=ozengine.load_doc("/tmp/sq_shuf_8x6.motr")
ozengine.render_frame(doc,C.IMG_A,C.IMG_B,0.25*2.333,"/tmp/as8.png")
print("done",flush=True); open("/tmp/as8_done.txt","w").write("done")
