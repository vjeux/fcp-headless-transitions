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
static void L(const char*f,...){ if(!g)g=fopen("/tmp/capshuf_trace.txt","a"); va_list a; va_start(a,f); vfprintf(g,f,a); va_end(a); fflush(g);}
typedef unsigned int (*so_t)(void*, unsigned int, unsigned int, unsigned int);
static so_t o_so=NULL; static long cnt=0;
static unsigned int h_so(void* self, unsigned int index, unsigned int N, unsigned int seed){
    // Force cache-miss so the FY recomputes AND so we observe every (index,N,seed) call:
    // clear cached count at emitter+0x380 so the compare fails -> rebuild. (self points to emitter base region;
    // the cache fields are at self + 0x8000 + 0x380 per the disasm add x26,x0,#0x8,lsl#12 then [x26,#0x380]).
    unsigned int r=o_so(self,index,N,seed);
    if(cnt<400) L("SO index=%u N=%u seed=%u -> rank=%u\n", index, N, seed, r);
    cnt++;
    return r;
}
static int patch(void*d,const void*s,size_t n){mach_port_t t=mach_task_self();uintptr_t p=(uintptr_t)d&~0x3FFFULL;size_t sp=((((uintptr_t)d+n)-p)+0x3FFF)&~0x3FFFULL;
 if(mach_vm_protect(t,p,sp,0,VM_PROT_READ|VM_PROT_WRITE|VM_PROT_COPY)!=KERN_SUCCESS)return -1;memcpy(d,s,n);mach_vm_protect(t,p,sp,0,VM_PROT_READ|VM_PROT_EXECUTE);sys_icache_invalidate(d,n);return 0;}
static void* mktr(uint32_t*t){void*m=mmap(0,4096,PROT_READ|PROT_WRITE|PROT_EXEC,MAP_ANON|MAP_PRIVATE|MAP_JIT,-1,0);if(m==MAP_FAILED)m=mmap(0,4096,PROT_READ|PROT_WRITE|PROT_EXEC,MAP_ANON|MAP_PRIVATE,-1,0);if(m==MAP_FAILED)return 0;
 pthread_jit_write_protect_np(0);uint32_t*p=m;for(int i=0;i<4;i++)p[i]=t[i];p[4]=0x58000051;p[5]=0xD61F0220;*(uint64_t*)&p[6]=(uint64_t)(t+4);sys_icache_invalidate(m,4096);pthread_jit_write_protect_np(1);return m;}
int setup_capshuf(void){
    void* ad=dlsym((void*)-2,"_ZN9PSEmitter12shuffleOrderEjjj");
    if(!ad){L("NOSYM\n");return -2;}
    void* tr=mktr((uint32_t*)ad); if(!tr)return -1; o_so=(so_t)tr;
    uint32_t pt[4]; pt[0]=0x58000051; pt[1]=0xD61F0220; *(uint64_t*)&pt[2]=(uint64_t)h_so;
    int rc=patch(ad,pt,16); L("setup_capshuf rc=%d\n",rc); return rc;
}
