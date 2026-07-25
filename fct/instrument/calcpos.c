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
static void L(const char*f,...){ if(!g)g=fopen("/tmp/calcpos_trace.txt","a"); va_list a; va_start(a,f); vfprintf(g,f,a); va_end(a); fflush(g);}
typedef void (*fn_t)(void*, void*, unsigned int);
static fn_t o_fn=NULL; static long cnt=0;
static void h_fn(void* self, void* arr, unsigned int count){
    o_fn(self,arr,count);
    if(cnt==0){
        char** pp=(char**)arr; char* begin=pp[0]; char* end=pp[1];
        long n=(end-begin)/0xf8;
        L("n=%ld\n", n);
        for(long i=0;i<n && i<130;i++){
            char* e=begin + i*0xf8;
            char* obj=*(char**)(e+0xe8);
            if(!obj) continue;
            double of=*(double*)(obj+0xa8);
            double idx=*(double*)(obj+0xb0);
            // dump candidate position offsets (PSParticle ctor stored q at +0x8,+0x20,+0x38,+0x50)
            double p8=*(double*)(obj+0x8), p10=*(double*)(obj+0x10);
            double p20=*(double*)(obj+0x20), p28=*(double*)(obj+0x28);
            double p38=*(double*)(obj+0x38), p40=*(double*)(obj+0x40);
            unsigned int id=*(unsigned int*)(obj+0xe0);
            L("#%ld id=%u of=%.5f idx=%.1f p8=%.1f p10=%.1f p20=%.1f p28=%.1f p38=%.1f p40=%.1f\n",
              i, id, of, idx, p8,p10,p20,p28,p38,p40);
        }
    }
    cnt++;
}
static int patch(void*d,const void*s,size_t n){mach_port_t t=mach_task_self();uintptr_t p=(uintptr_t)d&~0x3FFFULL;size_t sp=((((uintptr_t)d+n)-p)+0x3FFF)&~0x3FFFULL;
 if(mach_vm_protect(t,p,sp,0,VM_PROT_READ|VM_PROT_WRITE|VM_PROT_COPY)!=KERN_SUCCESS)return -1;memcpy(d,s,n);mach_vm_protect(t,p,sp,0,VM_PROT_READ|VM_PROT_EXECUTE);sys_icache_invalidate(d,n);return 0;}
static void* mktr(uint32_t*t){void*m=mmap(0,4096,PROT_READ|PROT_WRITE|PROT_EXEC,MAP_ANON|MAP_PRIVATE|MAP_JIT,-1,0);if(m==MAP_FAILED)m=mmap(0,4096,PROT_READ|PROT_WRITE|PROT_EXEC,MAP_ANON|MAP_PRIVATE,-1,0);if(m==MAP_FAILED)return 0;
 pthread_jit_write_protect_np(0);uint32_t*p=m;for(int i=0;i<4;i++)p[i]=t[i];p[4]=0x58000051;p[5]=0xD61F0220;*(uint64_t*)&p[6]=(uint64_t)(t+4);sys_icache_invalidate(m,4096);pthread_jit_write_protect_np(1);return m;}
int setup_calcpos(void){
    void* ad=dlsym((void*)-2,"_ZN9PSEmitter31calcOrderIndexFromOrderFractionER15OZSimStateArrayj");
    if(!ad){L("NOSYM\n");return -2;}
    void* tr=mktr((uint32_t*)ad); if(!tr)return -1; o_fn=(fn_t)tr;
    uint32_t pt[4]; pt[0]=0x58000051; pt[1]=0xD61F0220; *(uint64_t*)&pt[2]=(uint64_t)h_fn;
    int rc=patch(ad,pt,16); L("setup rc=%d\n",rc); return rc;
}
