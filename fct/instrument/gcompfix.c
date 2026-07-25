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
static void L(const char*f,...){ if(!g)g=fopen("/tmp/gcompfix_trace.txt","a"); va_list a; va_start(a,f); vfprintf(g,f,a); va_end(a); fflush(g);}
typedef double (*fn_t)(void*, void*, double);
static fn_t o_fn=NULL; static long cnt=0; static int active=0;
static double h_fn(void* self, void* cm, double index){
    double r=o_fn(self,cm,index);
    if(active && cnt<400){ L("getComp idx=%.3f -> %.5f\n", index, r); cnt++; }
    return r;
}
void gcompfix_mark(){ active=1; }
static int patch(void*d,const void*s,size_t n){mach_port_t t=mach_task_self();uintptr_t p=(uintptr_t)d&~0x3FFFULL;size_t sp=((((uintptr_t)d+n)-p)+0x3FFF)&~0x3FFFULL;
 if(mach_vm_protect(t,p,sp,0,VM_PROT_READ|VM_PROT_WRITE|VM_PROT_COPY)!=KERN_SUCCESS)return -1;memcpy(d,s,n);mach_vm_protect(t,p,sp,0,VM_PROT_READ|VM_PROT_EXECUTE);sys_icache_invalidate(d,n);return 0;}
static void* mktr_reloc(uint32_t*src, uintptr_t orig, int ncopy){
    void*m=mmap(0,4096,PROT_READ|PROT_WRITE|PROT_EXEC,MAP_ANON|MAP_PRIVATE|MAP_JIT,-1,0);
    if(m==MAP_FAILED)m=mmap(0,4096,PROT_READ|PROT_WRITE|PROT_EXEC,MAP_ANON|MAP_PRIVATE,-1,0);
    if(m==MAP_FAILED)return 0;
    pthread_jit_write_protect_np(0);
    uint32_t*p=(uint32_t*)m;
    for(int i=0;i<ncopy;i++){
        uint32_t insn=src[i];
        if((insn & 0x9F000000)==0x90000000){ // adrp
            uint32_t immlo=(insn>>29)&0x3; uint32_t immhi=(insn>>5)&0x7FFFF;
            int64_t imm=((int64_t)((immhi<<2)|immlo))<<12;
            if(imm & (1LL<<32)) imm |= ~((1LL<<33)-1);
            uintptr_t origpc=(orig+i*4)&~0xFFFULL; uintptr_t target=origpc+imm;
            uintptr_t newpc=((uintptr_t)m+i*4)&~0xFFFULL; int64_t ni=(int64_t)(target-newpc); int64_t pg=ni>>12;
            uint32_t nlo=pg&0x3; uint32_t nhi=(pg>>2)&0x7FFFF; uint32_t rd=insn&0x1F;
            p[i]=0x90000000|(nlo<<29)|(nhi<<5)|rd;
        } else p[i]=insn;
    }
    p[ncopy]=0x58000051; p[ncopy+1]=0xD61F0220; *(uint64_t*)&p[ncopy+2]=(uint64_t)(orig+ncopy*4);
    sys_icache_invalidate(m,4096); pthread_jit_write_protect_np(1); return m;
}
int setup_gcompfix(void){
    void* ad=dlsym((void*)-2,"_ZN18PSSequenceBehavior13getCompletionERK6CMTimed");
    if(!ad){L("NOSYM\n");return -2;}
    o_fn=(fn_t)mktr_reloc((uint32_t*)ad,(uintptr_t)ad,6);
    if(!o_fn)return -1;
    uint32_t pt[4]; pt[0]=0x58000051; pt[1]=0xD61F0220; *(uint64_t*)&pt[2]=(uint64_t)h_fn;
    int rc=patch(ad,pt,16); L("setup rc=%d\n",rc); return rc;
}
