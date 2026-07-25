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
static void L(const char*f,...){ if(!g)g=fopen("/tmp/calcidx2_trace.txt","a"); va_list a; va_start(a,f); vfprintf(g,f,a); va_end(a); fflush(g);}
// calcOrderIndexFromOrderFraction(this x0, OZSimStateArray& x1, uint w2)
typedef void (*fn_t)(void*, void*, unsigned int);
static fn_t o_fn=NULL; static long calls=0;
static void h_fn(void* self, void* arr, unsigned int w2){
    o_fn(self,arr,w2);
    if(calls==0){
        // arr: [0]=begin ptr, [1]=end ptr. elements stride 0xf8. obj at elem+0xe8.
        char** a=(char**)arr; char* begin=a[0]; char* end=a[1];
        long n=(end-begin)/0xf8;
        L("array n=%ld w2=%u\n", n, w2);
        for(long i=0;i<n && i<130;i++){
            char* elem=begin+i*0xf8;
            char* obj=*(char**)(elem+0xe8);
            if(!obj){ L("#%ld NULL obj\n",i); continue; }
            double of=*(double*)(obj+0xa8), ci=*(double*)(obj+0xb0);
            // scan for position (screen coords -960..960)
            char buf[300]; int bn=0;
            for(int off=0x0; off<=0xe0; off+=8){ double v=*(double*)(elem+off); if(v==v&&v>-1000&&v<1000&&(v>5||v<-5)) bn+=snprintf(buf+bn,sizeof(buf)-bn,"[%#x]=%.0f ",off,v); }
            L("#%ld of=%.4f calcIdx=%.0f pos: %s\n", i, of, ci, buf);
        }
    }
    calls++;
}
static int patch(void*d,const void*s,size_t n){mach_port_t t=mach_task_self();uintptr_t p=(uintptr_t)d&~0x3FFFULL;size_t sp=((((uintptr_t)d+n)-p)+0x3FFF)&~0x3FFFULL;
 if(mach_vm_protect(t,p,sp,0,VM_PROT_READ|VM_PROT_WRITE|VM_PROT_COPY)!=KERN_SUCCESS)return -1;memcpy(d,s,n);mach_vm_protect(t,p,sp,0,VM_PROT_READ|VM_PROT_EXECUTE);sys_icache_invalidate(d,n);return 0;}
static void* mktr(uint32_t*t){void*m=mmap(0,4096,PROT_READ|PROT_WRITE|PROT_EXEC,MAP_ANON|MAP_PRIVATE|MAP_JIT,-1,0);if(m==MAP_FAILED)m=mmap(0,4096,PROT_READ|PROT_WRITE|PROT_EXEC,MAP_ANON|MAP_PRIVATE,-1,0);if(m==MAP_FAILED)return 0;
 pthread_jit_write_protect_np(0);uint32_t*p=m;for(int i=0;i<4;i++)p[i]=t[i];p[4]=0x58000051;p[5]=0xD61F0220;*(uint64_t*)&p[6]=(uint64_t)(t+4);sys_icache_invalidate(m,4096);pthread_jit_write_protect_np(1);return m;}
int setup_calcidx2(void){
    void* ad=dlsym((void*)-2,"_ZN9PSEmitter31calcOrderIndexFromOrderFractionER15OZSimStateArrayj");
    if(!ad){L("NOSYM\n");return -2;}
    void* tr=mktr((uint32_t*)ad); if(!tr)return -1; o_fn=(fn_t)tr;
    uint32_t pt[4]; pt[0]=0x58000051; pt[1]=0xD61F0220; *(uint64_t*)&pt[2]=(uint64_t)h_fn;
    int rc=patch(ad,pt,16); L("setup rc=%d\n",rc); return rc;
}
