import os, sys, ctypes
REPO="/Users/vjeux/random/final-cut-pro-transitions"
sys.path.insert(0,os.path.join(REPO,"tools")); sys.path.insert(0,REPO)
import ozengine
import fct.config as C
ozengine.init_engine()
doc0=ozengine.load_doc(REPO+"/fct/minimized/Objects__Squares/case.motr")
ozengine.render_frame(doc0,C.IMG_A,C.IMG_B,0.5*2.333,"/tmp/ip.png")  # load Particles
hook=ctypes.CDLL(REPO+"/fct/instrument/argdump.dylib"); hook.setup_argdump.restype=ctypes.c_int
print("setup", hook.setup_argdump(), flush=True)
# fresh doc -> emitter re-inits particles -> initPropertiesFromShape called per cell
doc=ozengine.load_doc(REPO+"/fct/minimized/Objects__Squares/case.motr")
ozengine.render_frame(doc,C.IMG_A,C.IMG_B,0.25*2.333,"/tmp/ip.png")
print("done",flush=True)
open("/tmp/ip_done.txt","w").write("done")
