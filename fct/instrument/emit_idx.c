#include <stdio.h>
#include <stdint.h>
#include <string.h>
#include <stdarg.h>
#include <dlfcn.h>
#include <sys/mman.h>
#include <pthread.h>
#include <libkern/OSCacheControl.h>
#include <mach/mach.h>
#include <mach/mach_vm.h>
static FILE* g=NULL;
static void L(const char*f,...){ if(!g)g=fopen("/tmp/emit_idx_trace.txt","a"); va_list a; va_start(a,f); vfprintf(g,f,a); va_end(a); fflush(g);}
// initPropertiesFromShape(this x0, uint w1, CMTime x2, PType x3, PSParticle* x4, ...)
typedef void (*fn_t)(void*,unsigned int,void*,void*,void*,void*,void*,void*);
typedef unsigned int (*idxfn_t)(void*);  // particle.vtable[0x20]() -> index
static fn_t o_fn=NULL; static long cnt=0;
static void h_fn(void* x0,unsigned int w1,void* x2,void* x3,void* particle,void* x5,void* vec3,void* x7){
    o_fn(x0,w1,x2,x3,particle,x5,vec3,x7);
    if(cnt<130 && particle){
        // read vtable, call slot at +0x20 (4th method)
        void** vt=*(void***)particle;
        idxfn_t m=(idxfn_t)vt[4];  // 0x20/8 = 4
        unsigned int idx=0;
        // guard: only call if pointer looks sane
        if(((uintptr_t)m)>0x1000){ idx=m(particle); }
        double ph=*(double*)((char*)particle+0xa8);
        double rk=*(double*)((char*)particle+0xb0);
        L("#%ld emitIdx=%u vtidx=%u phase=%.5f rank=%.1f\n", cnt, w1, idx, ph, rk);
    }
    cnt++;
}
static int patch(void*d,const void*s,size_t n){mach_port_t t=mach_task_self();uintptr_t p=(uintptr_t)d&~0x3FFFULL;size_t sp=((((uintptr_t)d+n)-p)+0x3FFF)&~0x3FFFULL;
 if(mach_vm_protect(t,p,sp,0,VM_PROT_READ|VM_PROT_WRITE|VM_PROT_COPY)!=KERN_SUCCESS)return -1;memcpy(d,s,n);mach_vm_protect(t,p,sp,0,VM_PROT_READ|VM_PROT_EXECUTE);sys_icache_invalidate(d,n);return 0;}
static void* mktr(uint32_t*t){void*m=mmap(0,4096,PROT_READ|PROT_WRITE|PROT_EXEC,MAP_ANON|MAP_PRIVATE|MAP_JIT,-1,0);if(m==MAP_FAILED)m=mmap(0,4096,PROT_READ|PROT_WRITE|PROT_EXEC,MAP_ANON|MAP_PRIVATE,-1,0);if(m==MAP_FAILED)return 0;
 pthread_jit_write_protect_np(0);uint32_t*p=m;for(int i=0;i<4;i++)p[i]=t[i];p[4]=0x58000051;p[5]=0xD61F0220;*(uint64_t*)&p[6]=(uint64_t)(t+4);sys_icache_invalidate(m,4096);pthread_jit_write_protect_np(1);return m;}
int setup_emit_idx(void){
    void* ad=dlsym((void*)-2,"_ZN9PSEmitter23initPropertiesFromShapeEjRK6CMTimeP14PSParticleTypeP10PSParticleR17OZSimStateElementR9PCVector3IdERb");
    if(!ad){L("NOSYM\n");return -2;}
    void* tr=mktr((uint32_t*)ad); if(!tr)return -1; o_fn=(fn_t)tr;
    uint32_t pt[4]; pt[0]=0x58000051; pt[1]=0xD61F0220; *(uint64_t*)&pt[2]=(uint64_t)h_fn;
    int rc=patch(ad,pt,16); L("setup rc=%d\n",rc); return rc;
}
