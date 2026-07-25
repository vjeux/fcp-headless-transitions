import os, sys, ctypes
REPO="/Users/vjeux/random/final-cut-pro-transitions"
sys.path.insert(0,os.path.join(REPO,"tools")); sys.path.insert(0,REPO)
import ozengine
import fct.config as C
ozengine.init_engine()
FW="/Applications/Final Cut Pro.app/Contents/Frameworks"
try:
    ctypes.CDLL(FW+"/Ozone.framework/Versions/A/PlugIns/Particles.ozp/Contents/MacOS/Particles", mode=ctypes.RTLD_GLOBAL)
except OSError as e:
    print("Particles dlopen note:", e, flush=True)
libc=ctypes.CDLL(None); libc.dlsym.restype=ctypes.c_void_p; libc.dlsym.argtypes=[ctypes.c_void_p,ctypes.c_char_p]
addr=libc.dlsym(ctypes.c_void_p(-2), b"_ZN9PSEmitter12shuffleOrderEjjj")
print("shuffleOrder addr", hex(addr) if addr else "NOT FOUND", flush=True)
hook=ctypes.CDLL(REPO+"/fct/instrument/hookshuf.dylib"); hook.setup_shuf.restype=ctypes.c_int; hook.setup_shuf.argtypes=[ctypes.c_void_p]
rc=hook.setup_shuf(ctypes.c_void_p(addr)); print("hook rc",rc,flush=True)
doc=ozengine.load_doc(REPO+"/fct/minimized/Objects__Squares/case.motr")
for t in [0.05,0.2,0.4,0.6,0.8,0.95]:
    ozengine.render_frame(doc,C.IMG_A,C.IMG_B,t,"/tmp/he.png")
print("renders done",flush=True)
open("/tmp/he_done.txt","w").write("done")
