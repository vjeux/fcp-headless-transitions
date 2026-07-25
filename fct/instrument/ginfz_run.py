import os, sys, ctypes
REPO="/Users/vjeux/random/final-cut-pro-transitions"
sys.path.insert(0,os.path.join(REPO,"tools")); sys.path.insert(0,REPO)
import ozengine, fct.config as C
ozengine.init_engine()
FW="/Applications/Final Cut Pro.app/Contents/Frameworks"
ctypes.CDLL(FW+"/Ozone.framework/Versions/A/PlugIns/Particles.ozp/Contents/MacOS/Particles", mode=ctypes.RTLD_GLOBAL)
hook=ctypes.CDLL(REPO+"/fct/instrument/ginfz.dylib"); hook.setup_ginfz.restype=ctypes.c_int
hook.ginfz_mode.argtypes=[ctypes.c_int]
print("setup", hook.setup_ginfz(), flush=True)
doc=ozengine.load_doc(REPO+"/fct/minimized/Objects__Squares/case.motr")
hook.ginfz_mode(0); ozengine.render_frame(doc,C.IMG_A,C.IMG_B,0.5*2.333,"/tmp/ginfz_content.png")  # influence=0 baseline
hook.ginfz_mode(1); ozengine.render_frame(doc,C.IMG_A,C.IMG_B,0.5*2.333,"/tmp/ginfz_enc.png")       # influence=idx/27
print("done",flush=True); open("/tmp/ginfz_done.txt","w").write("done")
