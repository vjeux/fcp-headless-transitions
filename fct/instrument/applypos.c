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
static void L(const char*f,...){ if(!g)g=fopen("/tmp/applypos_trace.txt","a"); va_list a; va_start(a,f); vfprintf(g,f,a); va_end(a); fflush(g);}
// applyAllSequenceBehaviors(this x0, CMTime& x1, PSParticle* x2, PSSequencedValues& x3)
typedef void (*fn_t)(void*, void*, void*, void*);
static fn_t o_fn=NULL; static long cnt=0;
static void h_fn(void* self, void* cm, void* particle, void* vals){
    if(cnt<300 && particle){
        char* p=(char*)particle;
        double b0=*(double*)(p+0xb0);
        // dump candidate position fields as doubles
        double f8=*(double*)(p+0x8), f10=*(double*)(p+0x10);
        double f20=*(double*)(p+0x20), f28=*(double*)(p+0x28);
        double f38=*(double*)(p+0x38), f40=*(double*)(p+0x40);
        double f50=*(double*)(p+0x50), f58=*(double*)(p+0x58);
        unsigned int e0=*(unsigned int*)(p+0xe0);
        L("#%ld b0=%.1f e0=%u f8=%.1f f10=%.1f f20=%.1f f28=%.1f f38=%.1f f40=%.1f f50=%.1f f58=%.1f\n",
          cnt, b0, e0, f8,f10,f20,f28,f38,f40,f50,f58);
    }
    cnt++;
    o_fn(self,cm,particle,vals);
}
static int patch(void*d,const void*s,size_t n){mach_port_t t=mach_task_self();uintptr_t p=(uintptr_t)d&~0x3FFFULL;size_t sp=((((uintptr_t)d+n)-p)+0x3FFF)&~0x3FFFULL;
 if(mach_vm_protect(t,p,sp,0,VM_PROT_READ|VM_PROT_WRITE|VM_PROT_COPY)!=KERN_SUCCESS)return -1;memcpy(d,s,n);mach_vm_protect(t,p,sp,0,VM_PROT_READ|VM_PROT_EXECUTE);sys_icache_invalidate(d,n);return 0;}
static void* mktr(uint32_t*t){void*m=mmap(0,4096,PROT_READ|PROT_WRITE|PROT_EXEC,MAP_ANON|MAP_PRIVATE|MAP_JIT,-1,0);if(m==MAP_FAILED)m=mmap(0,4096,PROT_READ|PROT_WRITE|PROT_EXEC,MAP_ANON|MAP_PRIVATE,-1,0);if(m==MAP_FAILED)return 0;
 pthread_jit_write_protect_np(0);uint32_t*p=m;for(int i=0;i<4;i++)p[i]=t[i];p[4]=0x58000051;p[5]=0xD61F0220;*(uint64_t*)&p[6]=(uint64_t)(t+4);sys_icache_invalidate(m,4096);pthread_jit_write_protect_np(1);return m;}
int setup_applypos(void){
    void* ad=dlsym((void*)-2,"_ZN14PSParticleType25applyAllSequenceBehaviorsERK6CMTimePK10PSParticleR17PSSequencedValues");
    if(!ad){L("NOSYM\n");return -2;}
    void* tr=mktr((uint32_t*)ad); if(!tr)return -1; o_fn=(fn_t)tr;
    uint32_t pt[4]; pt[0]=0x58000051; pt[1]=0xD61F0220; *(uint64_t*)&pt[2]=(uint64_t)h_fn;
    int rc=patch(ad,pt,16); L("setup rc=%d\n",rc); return rc;
}
