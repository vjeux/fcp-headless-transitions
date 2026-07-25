import os, sys, ctypes
REPO="/Users/vjeux/random/final-cut-pro-transitions"
sys.path.insert(0,os.path.join(REPO,"tools")); sys.path.insert(0,REPO)
import ozengine
import fct.config as C
ozengine.init_engine()
doc=ozengine.load_doc(REPO+"/fct/minimized/Objects__Squares/case.motr")
ozengine.render_frame(doc,C.IMG_A,C.IMG_B,0.5*2.333,"/tmp/cs.png")  # load Particles + build cache
libc=ctypes.CDLL(None); libc.dlsym.restype=ctypes.c_void_p; libc.dlsym.argtypes=[ctypes.c_void_p,ctypes.c_char_p]
addr=libc.dlsym(ctypes.c_void_p(-2), b"_ZN9PSEmitter12shuffleOrderEjjj")
print("shuffleOrder addr", hex(addr), flush=True)
# But shuffleOrder is a METHOD needing a valid 'this' (PSEmitter*). We don't have one.
# The cache is in the emitter object. We can't call it standalone safely.
# INSTEAD: reproduce the byte-exact algorithm in python (from disasm) for N=28 seed=987639852:
M48=(1<<48)-1
def shuforder_array(N,seed):
    arr=list(range(N)); st=((seed<<16)|0x330E)&M48
    for i in range(1,N):
        st=(st*0x5DEECE66D+0xB)&M48; j=(st>>17)%(i+1); arr[i],arr[j]=arr[j],arr[i]
    # reshuffle-if-identity guard (seed+1,+2,...) — check
    s=seed
    while all(arr[i]==i for i in range(N)):
        s+=1; arr=list(range(N)); st=((s<<16)|0x330E)&M48
        for i in range(1,N):
            st=(st*0x5DEECE66D+0xB)&M48; j=(st>>17)%(i+1); arr[i],arr[j]=arr[j],arr[i]
    return arr
arr=shuforder_array(28,987639852)
print("shuffleOrder(N=28,seed=987639852) arr =", arr, flush=True)
print("arr[i] for i=0..27:", flush=True)
for i in range(28): print(f"  shuffleOrder({i}) = {arr[i]}", flush=True)
open("/tmp/cs_done.txt","w").write("done")
