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
static void L(const char*f,...){ if(!g)g=fopen("/tmp/initshape_trace.txt","a"); va_list a; va_start(a,f); vfprintf(g,f,a); va_end(a); fflush(g);}
// PSEmitter::initPropertiesFromShape(this x0, uint index w1, CMTime& x2, PSParticleType* x3, PSParticle* x4, ...)
typedef void (*fn_t)(void*, unsigned int, void*, void*, void*, void*, void*, void*);
static fn_t o_fn=NULL; static long cnt=0;
static void h_fn(void* self, unsigned int index, void* cm, void* ptype, void* particle, void* a5, void* a6, void* a7){
    o_fn(self,index,cm,ptype,particle,a5,a6,a7);
    // after: emitter+0xa8 = phase (d), +0xb0 = rank (d). But those are on 'self'+0x8000 region? The store was [x28+0xa8]
    // x28 in the fn was a local (particle-ish). Read from particle+0xa8/0xb0 (the PSParticle we filled).
    if(cnt<130 && particle){
        double phase=*(double*)((char*)particle+0xa8);
        double rank=*(double*)((char*)particle+0xb0);
        L("emitIndex=%u -> phase=%.5f rank=%.1f\n", index, phase, rank);
    }
    cnt++;
}
static int patch(void*d,const void*s,size_t n){mach_port_t t=mach_task_self();uintptr_t p=(uintptr_t)d&~0x3FFFULL;size_t sp=((((uintptr_t)d+n)-p)+0x3FFF)&~0x3FFFULL;
 if(mach_vm_protect(t,p,sp,0,VM_PROT_READ|VM_PROT_WRITE|VM_PROT_COPY)!=KERN_SUCCESS)return -1;memcpy(d,s,n);mach_vm_protect(t,p,sp,0,VM_PROT_READ|VM_PROT_EXECUTE);sys_icache_invalidate(d,n);return 0;}
static void* mktr(uint32_t*t){void*m=mmap(0,4096,PROT_READ|PROT_WRITE|PROT_EXEC,MAP_ANON|MAP_PRIVATE|MAP_JIT,-1,0);if(m==MAP_FAILED)m=mmap(0,4096,PROT_READ|PROT_WRITE|PROT_EXEC,MAP_ANON|MAP_PRIVATE,-1,0);if(m==MAP_FAILED)return 0;
 pthread_jit_write_protect_np(0);uint32_t*p=m;for(int i=0;i<4;i++)p[i]=t[i];p[4]=0x58000051;p[5]=0xD61F0220;*(uint64_t*)&p[6]=(uint64_t)(t+4);sys_icache_invalidate(m,4096);pthread_jit_write_protect_np(1);return m;}
int setup_initshape(void){
    void* ad=dlsym((void*)-2,"_ZN9PSEmitter23initPropertiesFromShapeEjRK6CMTimeP14PSParticleTypeP10PSParticleR17OZSimStateElementR9PCVector3IdERb");
    if(!ad){L("NOSYM\n");return -2;}
    void* tr=mktr((uint32_t*)ad); if(!tr)return -1; o_fn=(fn_t)tr;
    uint32_t pt[4]; pt[0]=0x58000051; pt[1]=0xD61F0220; *(uint64_t*)&pt[2]=(uint64_t)h_fn;
    int rc=patch(ad,pt,16); L("setup rc=%d\n",rc); return rc;
}
