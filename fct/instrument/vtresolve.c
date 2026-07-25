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
static void L(const char*f,...){ if(!g)g=fopen("/tmp/vtresolve_trace.txt","a"); va_list a; va_start(a,f); vfprintf(g,f,a); va_end(a); fflush(g);}
// hook getValues(this x0,...). Read vtable ptr [x0], then [vtable+0x128] = the fn. Resolve with dladdr.
typedef void (*fn_t)(void*, void*, double, void*);
static fn_t o_fn=NULL; static int done=0;
static void h_fn(void* self, void* cm, double d0, void* vals){
    if(!done){
        done=1;
        void** vtable=*(void***)self;
        void* fn=vtable[0x128/8];
        Dl_info info;
        if(dladdr(fn,&info)) L("vtable@0x128 -> %p sym=%s base=%p\n", fn, info.dli_sname?info.dli_sname:"?", info.dli_fbase);
        else L("vtable@0x128 -> %p (dladdr failed)\n", fn);
        // also dump a few nearby vtable slots
        for(int i=0x118/8;i<=0x140/8;i++){ Dl_info in2; void* f2=vtable[i]; if(dladdr(f2,&in2)) L("  vt[%#x] = %s\n", i*8, in2.dli_sname?in2.dli_sname:"?"); }
    }
    o_fn(self,cm,d0,vals);
}
static int patch(void*d,const void*s,size_t n){mach_port_t t=mach_task_self();uintptr_t p=(uintptr_t)d&~0x3FFFULL;size_t sp=((((uintptr_t)d+n)-p)+0x3FFF)&~0x3FFFULL;
 if(mach_vm_protect(t,p,sp,0,VM_PROT_READ|VM_PROT_WRITE|VM_PROT_COPY)!=KERN_SUCCESS)return -1;memcpy(d,s,n);mach_vm_protect(t,p,sp,0,VM_PROT_READ|VM_PROT_EXECUTE);sys_icache_invalidate(d,n);return 0;}
static void* mktr(uint32_t*t){void*m=mmap(0,4096,PROT_READ|PROT_WRITE|PROT_EXEC,MAP_ANON|MAP_PRIVATE|MAP_JIT,-1,0);if(m==MAP_FAILED)m=mmap(0,4096,PROT_READ|PROT_WRITE|PROT_EXEC,MAP_ANON|MAP_PRIVATE,-1,0);if(m==MAP_FAILED)return 0;
 pthread_jit_write_protect_np(0);uint32_t*p=m;for(int i=0;i<4;i++)p[i]=t[i];p[4]=0x58000051;p[5]=0xD61F0220;*(uint64_t*)&p[6]=(uint64_t)(t+4);sys_icache_invalidate(m,4096);pthread_jit_write_protect_np(1);return m;}
int setup_vtresolve(void){
    void* ad=dlsym((void*)-2,"_ZN18PSSequenceBehavior9getValuesERK6CMTimedR17PSSequencedValues");
    if(!ad){L("NOSYM\n");return -2;}
    void* tr=mktr((uint32_t*)ad); if(!tr)return -1; o_fn=(fn_t)tr;
    uint32_t pt[4]; pt[0]=0x58000051; pt[1]=0xD61F0220; *(uint64_t*)&pt[2]=(uint64_t)h_fn;
    int rc=patch(ad,pt,16); L("setup rc=%d\n",rc); return rc;
}
