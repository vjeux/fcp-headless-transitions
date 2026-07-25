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
static void L(const char*f,...){ if(!g)g=fopen("/tmp/bothsq_trace.txt","a"); va_list a; va_start(a,f); vfprintf(g,f,a); va_end(a); fflush(g);}
typedef unsigned int (*shuf_t)(void*, unsigned int, unsigned int, unsigned int);
typedef void (*gofr_t)(void*, double, double, unsigned int, unsigned int, void*, double*, double*);
static shuf_t o_shuf=NULL; static gofr_t o_gofr=NULL;
static long cs=0, cg=0;
static unsigned int h_shuf(void* s, unsigned int idx, unsigned int count, unsigned int seed){
    unsigned int r=o_shuf(s,idx,count,seed);
    if(cs<80) L("SHUF idx=%u count=%u seed=%u -> %u\n",idx,count,seed,r);
    cs++; return r;
}
static void h_gofr(void* s, double x, double y, unsigned int w2, unsigned int w3, void* cm, double* out, double* o2){
    o_gofr(s,x,y,w2,w3,cm,out,o2);
    if(cg<80) L("GOFR x=%.4f y=%.4f w2=%u w3=%u -> %.5f\n",x,y,w2,w3,out?*out:-9);
    cg++;
}
static int patch(void*d,const void*s,size_t n){mach_port_t t=mach_task_self();uintptr_t p=(uintptr_t)d&~0x3FFFULL;size_t sp=((((uintptr_t)d+n)-p)+0x3FFF)&~0x3FFFULL;
 if(mach_vm_protect(t,p,sp,0,VM_PROT_READ|VM_PROT_WRITE|VM_PROT_COPY)!=KERN_SUCCESS)return -1;memcpy(d,s,n);mach_vm_protect(t,p,sp,0,VM_PROT_READ|VM_PROT_EXECUTE);sys_icache_invalidate(d,n);return 0;}
static void* mktr(uint32_t*t){void*m=mmap(0,4096,PROT_READ|PROT_WRITE|PROT_EXEC,MAP_ANON|MAP_PRIVATE|MAP_JIT,-1,0);if(m==MAP_FAILED)m=mmap(0,4096,PROT_READ|PROT_WRITE|PROT_EXEC,MAP_ANON|MAP_PRIVATE,-1,0);if(m==MAP_FAILED)return 0;
 pthread_jit_write_protect_np(0);uint32_t*p=m;for(int i=0;i<4;i++)p[i]=t[i];p[4]=0x58000051;p[5]=0xD61F0220;*(uint64_t*)&p[6]=(uint64_t)(t+4);sys_icache_invalidate(m,4096);pthread_jit_write_protect_np(1);return m;}
static int hook(const char* sym, void* handler, void** orig){
    void* ad=dlsym((void*)-2,sym); if(!ad){L("NOSYM %s\n",sym);return -2;}
    void* tr=mktr((uint32_t*)ad); if(!tr)return -1; *orig=tr;
    uint32_t pt[4]; pt[0]=0x58000051; pt[1]=0xD61F0220; *(uint64_t*)&pt[2]=(uint64_t)handler;
    return patch(ad,pt,16);
}
int setup_bothsq(void){
    int a=hook("_ZN9PSEmitter12shuffleOrderEjjj",(void*)h_shuf,(void**)&o_shuf);
    int b=hook("_ZN9PSEmitter18genOrderFilledRectEddjjRK6CMTimePdS3_",(void*)h_gofr,(void**)&o_gofr);
    L("setup shuf=%d gofr=%d\n",a,b); return a|b;
}
