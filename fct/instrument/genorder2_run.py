import os, sys, ctypes
REPO="/Users/vjeux/random/final-cut-pro-transitions"
sys.path.insert(0,os.path.join(REPO,"tools")); sys.path.insert(0,REPO)
import ozengine, fct.config as C
ozengine.init_engine()
FW="/Applications/Final Cut Pro.app/Contents/Frameworks"
ctypes.CDLL(FW+"/Ozone.framework/Versions/A/PlugIns/Particles.ozp/Contents/MacOS/Particles", mode=ctypes.RTLD_GLOBAL)
hook=ctypes.CDLL(REPO+"/fct/instrument/genorder.dylib"); hook.setup_genorder.restype=ctypes.c_int
print("setup", hook.setup_genorder(), flush=True)
# render TWO distinct grids to force re-emission (defeat caching) while hooked
for path in ["/tmp/sq_noshuf.motr","/tmp/sq_ns_8x6.motr","/tmp/sq_noshuf.motr"]:
    doc=ozengine.load_doc(path)
    ozengine.render_frame(doc,C.IMG_A,C.IMG_B,0.1*2.333,"/tmp/go2.png")
print("done",flush=True); open("/tmp/go2_done.txt","w").write("done")
