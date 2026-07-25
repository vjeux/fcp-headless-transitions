import os, sys, ctypes
REPO="/Users/vjeux/random/final-cut-pro-transitions"
sys.path.insert(0,os.path.join(REPO,"tools")); sys.path.insert(0,REPO)
import ozengine
import fct.config as C
ozengine.init_engine()
doc0=ozengine.load_doc(REPO+"/fct/minimized/Objects__Squares/case.motr")
ozengine.render_frame(doc0,C.IMG_A,C.IMG_B,0.5*2.333,"/tmp/ni.png")
hook=ctypes.CDLL(REPO+"/fct/instrument/pcap.dylib"); hook.setup_pcap.restype=ctypes.c_int
print("setup_pcap", hook.setup_pcap(), flush=True)
doc=ozengine.load_doc(REPO+"/fct/minimized/Objects__Squares/case.motr")
# render ONE early frame to capture the index->normalized mapping for all instances
ozengine.render_frame(doc,C.IMG_A,C.IMG_B,0.15*2.333,"/tmp/ni.png")
print("done",flush=True)
open("/tmp/ni_done.txt","w").write("done")
