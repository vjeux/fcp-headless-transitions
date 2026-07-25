import os, sys, ctypes
REPO="/Users/vjeux/random/final-cut-pro-transitions"
sys.path.insert(0,os.path.join(REPO,"tools")); sys.path.insert(0,REPO)
import ozengine
import fct.config as C
ozengine.init_engine()
doc0=ozengine.load_doc(REPO+"/fct/minimized/Objects__Squares/case.motr")
ozengine.render_frame(doc0,C.IMG_A,C.IMG_B,0.5*2.333,"/tmp/as.png")
hook=ctypes.CDLL(REPO+"/fct/instrument/applyseq.dylib"); hook.setup_applyseq.restype=ctypes.c_int
print("setup", hook.setup_applyseq(), flush=True)
doc=ozengine.load_doc(REPO+"/fct/minimized/Objects__Squares/case.motr")
ozengine.render_frame(doc,C.IMG_A,C.IMG_B,0.25*2.333,"/tmp/as.png")
print("done",flush=True)
open("/tmp/as_done.txt","w").write("done")
