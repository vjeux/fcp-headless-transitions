import os, sys, ctypes
REPO="/Users/vjeux/random/final-cut-pro-transitions"
sys.path.insert(0,os.path.join(REPO,"tools")); sys.path.insert(0,REPO)
import ozengine
import fct.config as C
ozengine.init_engine()
# render once so engine loads Particles.ozp (do NOT dlopen ourselves)
doc0=ozengine.load_doc(REPO+"/fct/minimized/Objects__Squares/case.motr")
ozengine.render_frame(doc0,C.IMG_A,C.IMG_B,0.5*2.333,"/tmp/ps.png")
# hook (resolves symbol internally via dlsym in the C lib -> same image the engine uses)
hook=ctypes.CDLL(REPO+"/fct/instrument/hookshuf.dylib"); hook.setup_shuf_self.restype=ctypes.c_int
print("hook rc", hook.setup_shuf_self(), flush=True)
# fresh doc -> new emitter -> shuffle cache empty -> shuffleOrder recomputed
doc=ozengine.load_doc(REPO+"/fct/minimized/Objects__Squares/case.motr")
for t in [0.1,0.3,0.5,0.7,0.9]:
    ozengine.render_frame(doc,C.IMG_A,C.IMG_B,t,"/tmp/ps.png")
print("renders done",flush=True)
open("/tmp/ps_done.txt","w").write("done")
