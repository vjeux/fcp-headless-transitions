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
static void L(const char*f,...){ if(!g)g=fopen("/tmp/paps_trace.txt","a"); va_list a; va_start(a,f); vfprintf(g,f,a); va_end(a); fflush(g);}
typedef void (*fn_t)(void*, void*, char*, void*);
static fn_t o_fn=NULL; static long cnt=0;
static void h_fn(void* self, void* cm, char* p, void* vals){
    if(cnt<130 && p){
        double a8=*(double*)(p+0xa8), b0=*(double*)(p+0xb0);
        double o8=*(double*)(p+0x8), o10=*(double*)(p+0x10), o18=*(double*)(p+0x18), o20=*(double*)(p+0x20), o28=*(double*)(p+0x28), o30=*(double*)(p+0x30);
        L("#%ld a8=%.4f b0=%.1f | 8=%.1f 10=%.1f 18=%.1f 20=%.1f 28=%.1f 30=%.1f\n", cnt, a8,b0, o8,o10,o18,o20,o28,o30);
    }
    cnt++;
    o_fn(self,cm,p,vals);
}
static int patch(void*d,const void*s,size_t n){mach_port_t t=mach_task_self();uintptr_t p=(uintptr_t)d&~0x3FFFULL;size_t sp=((((uintptr_t)d+n)-p)+0x3FFF)&~0x3FFFULL;
 if(mach_vm_protect(t,p,sp,0,VM_PROT_READ|VM_PROT_WRITE|VM_PROT_COPY)!=KERN_SUCCESS)return -1;memcpy(d,s,n);mach_vm_protect(t,p,sp,0,VM_PROT_READ|VM_PROT_EXECUTE);sys_icache_invalidate(d,n);return 0;}
static void* mktr(uint32_t*t){void*m=mmap(0,4096,PROT_READ|PROT_WRITE|PROT_EXEC,MAP_ANON|MAP_PRIVATE|MAP_JIT,-1,0);if(m==MAP_FAILED)m=mmap(0,4096,PROT_READ|PROT_WRITE|PROT_EXEC,MAP_ANON|MAP_PRIVATE,-1,0);if(m==MAP_FAILED)return 0;
 pthread_jit_write_protect_np(0);uint32_t*p=m;for(int i=0;i<4;i++)p[i]=t[i];p[4]=0x58000051;p[5]=0xD61F0220;*(uint64_t*)&p[6]=(uint64_t)(t+4);sys_icache_invalidate(m,4096);pthread_jit_write_protect_np(1);return m;}
int setup_paps(void){
    void* known=dlsym((void*)-2,"_ZN9PSEmitter18genOrderFilledRectEddjjRK6CMTimePdS3_");
    if(!known){L("NOKNOWN\n");return -2;}
    void* ad=(void*)((char*)known - 0x1a330 + 0x7a720);  // base + 0x7a720
    void* tr=mktr((uint32_t*)ad); if(!tr)return -1; o_fn=(fn_t)tr;
    uint32_t pt[4]; pt[0]=0x58000051; pt[1]=0xD61F0220; *(uint64_t*)&pt[2]=(uint64_t)h_fn;
    int rc=patch(ad,pt,16); L("setup rc=%d ad=%p\n",rc,ad); return rc;
}
