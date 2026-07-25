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
static void L(const char*f,...){ if(!g)g=fopen("/tmp/multi_trace.txt","a"); va_list a; va_start(a,f); vfprintf(g,f,a); va_end(a); fflush(g);}
typedef unsigned int (*so_t)(void*,unsigned int,unsigned int,unsigned int);
typedef unsigned int (*fs_t)(void*,void*);
static so_t g_so=NULL; static fs_t g_fs=NULL;
static unsigned int hk_so(void*s,unsigned int i,unsigned int N,unsigned int seed){unsigned int r=g_so(s,i,N,seed);L("SO idx=%u N=%u seed=%u -> %u\n",i,N,seed,r);return r;}
static unsigned int hk_fs(void*s,void*pt){unsigned int r=g_fs(s,pt);L("getFillSeed -> %u\n",r);return r;}
static int patch(void*d,const void*s,size_t n){mach_port_t t=mach_task_self();uintptr_t p=(uintptr_t)d&~0x3FFFULL;size_t sp=((((uintptr_t)d+n)-p)+0x3FFF)&~0x3FFFULL;
 if(mach_vm_protect(t,p,sp,0,VM_PROT_READ|VM_PROT_WRITE|VM_PROT_COPY)!=KERN_SUCCESS)return -1;memcpy(d,s,n);mach_vm_protect(t,p,sp,0,VM_PROT_READ|VM_PROT_EXECUTE);sys_icache_invalidate(d,n);return 0;}
static void* mktr(uint32_t*t){void*m=mmap(0,4096,PROT_READ|PROT_WRITE|PROT_EXEC,MAP_ANON|MAP_PRIVATE|MAP_JIT,-1,0);if(m==MAP_FAILED)m=mmap(0,4096,PROT_READ|PROT_WRITE|PROT_EXEC,MAP_ANON|MAP_PRIVATE,-1,0);if(m==MAP_FAILED)return 0;
 pthread_jit_write_protect_np(0);uint32_t*p=m;for(int i=0;i<4;i++)p[i]=t[i];p[4]=0x58000051;p[5]=0xD61F0220;*(uint64_t*)&p[6]=(uint64_t)(t+4);sys_icache_invalidate(m,4096);pthread_jit_write_protect_np(1);return m;}
static void* hook1(const char* sym, void* repl){
    void* addr=dlsym((void*)-2, sym); L("resolve %s = %p\n",sym,addr); if(!addr)return 0;
    void* tr=mktr((uint32_t*)addr); if(!tr)return 0;
    uint32_t pt[4]; pt[0]=0x58000051; pt[1]=0xD61F0220; *(uint64_t*)&pt[2]=(uint64_t)repl;
    int rc=patch(addr,pt,16); L("patch %s rc=%d\n",sym,rc); return rc?0:tr;
}
int setup_all(void){
    g_so=(so_t)hook1("_ZN9PSEmitter12shuffleOrderEjjj",(void*)hk_so);
    g_fs=(fs_t)hook1("_ZN12PSReplicator11getFillSeedEP14PSParticleType",(void*)hk_fs);
    L("setup_all done so=%p fs=%p\n",(void*)g_so,(void*)g_fs);
    return 0;
}
