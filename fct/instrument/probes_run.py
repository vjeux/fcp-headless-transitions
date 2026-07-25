import os, sys, ctypes
REPO="/Users/vjeux/random/final-cut-pro-transitions"
sys.path.insert(0,os.path.join(REPO,"tools")); sys.path.insert(0,REPO)
import ozengine
import fct.config as C
ozengine.init_engine()
doc0=ozengine.load_doc(REPO+"/fct/minimized/Objects__Squares/case.motr")
ozengine.render_frame(doc0,C.IMG_A,C.IMG_B,0.5*2.333,"/tmp/pr.png")
hook=ctypes.CDLL(REPO+"/fct/instrument/probes.dylib")
hook.setup_probes.restype=ctypes.c_int; hook.report_probes.restype=None
print("setup rc", hook.setup_probes(), flush=True)
doc=ozengine.load_doc(REPO+"/fct/minimized/Objects__Squares/case.motr")
for t in [0.1,0.3,0.5,0.7,0.9]:
    ozengine.render_frame(doc,C.IMG_A,C.IMG_B,t,"/tmp/pr.png")
hook.report_probes()
print("done",flush=True)
open("/tmp/pr_done.txt","w").write("done")
