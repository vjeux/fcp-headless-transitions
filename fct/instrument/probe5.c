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
static void L(const char*f,...){ if(!g)g=fopen("/tmp/probe5_trace.txt","a"); va_list a; va_start(a,f); vfprintf(g,f,a); va_end(a); fflush(g);}
static int patch(void*d,const void*s,size_t n){mach_port_t t=mach_task_self();uintptr_t p=(uintptr_t)d&~0x3FFFULL;size_t sp=((((uintptr_t)d+n)-p)+0x3FFF)&~0x3FFFULL;
 if(mach_vm_protect(t,p,sp,0,VM_PROT_READ|VM_PROT_WRITE|VM_PROT_COPY)!=KERN_SUCCESS)return -1;memcpy(d,s,n);mach_vm_protect(t,p,sp,0,VM_PROT_READ|VM_PROT_EXECUTE);sys_icache_invalidate(d,n);return 0;}
static void* mktr(uint32_t*t){void*m=mmap(0,4096,PROT_READ|PROT_WRITE|PROT_EXEC,MAP_ANON|MAP_PRIVATE|MAP_JIT,-1,0);if(m==MAP_FAILED)m=mmap(0,4096,PROT_READ|PROT_WRITE|PROT_EXEC,MAP_ANON|MAP_PRIVATE,-1,0);if(m==MAP_FAILED)return 0;
 pthread_jit_write_protect_np(0);uint32_t*p=m;for(int i=0;i<4;i++)p[i]=t[i];p[4]=0x58000051;p[5]=0xD61F0220;*(uint64_t*)&p[6]=(uint64_t)(t+4);sys_icache_invalidate(m,4096);pthread_jit_write_protect_np(1);return m;}
#define MK(NAME,SYM) static void* o_##NAME=0; static long c_##NAME=0; \
 static uint64_t h_##NAME(void*a,void*b,void*c,void*d2,void*e){ c_##NAME++; if(c_##NAME<=2)L(#NAME " fired a=%p b=%p\n",a,b); uint64_t(*f)(void*,void*,void*,void*,void*)=(void*)o_##NAME; return f(a,b,c,d2,e);} \
 static void in_##NAME(void){ void*ad=dlsym((void*)-2,SYM); if(!ad){L("nosym " #NAME "\n");return;} void*tr=mktr((uint32_t*)ad); if(!tr)return; o_##NAME=tr; uint32_t pt[4];pt[0]=0x58000051;pt[1]=0xD61F0220;*(uint64_t*)&pt[2]=(uint64_t)h_##NAME; L("inst " #NAME " rc=%d\n",patch(ad,pt,16)); }
MK(applySeq,"_ZN12PSPaintPType23applyAllSequenceBehaviorsERK6CMTimePK10PSParticleR17PSSequencedValues")
MK(getNumEmit,"_ZN12PSPaintPType30getNumEmissionPointsAndOrdersERK6CMTimePNSt3__16vectorIdNS2_9allocatorIdEEEE")
MK(fillSeed,"_ZN12PSReplicator11getFillSeedEP14PSParticleType")
MK(normIdx,"_ZN18PSSequenceBehavior13normalizeIndexEdRK6CMTime")
MK(valRemap,"_ZN18PSSequenceBehavior16getValuesRemapTimeERK6CMTimedR17PSSequencedValues")
void report5(void){ L("REPORT applySeq=%ld getNumEmit=%ld fillSeed=%ld normIdx=%ld valRemap=%ld\n",c_applySeq,c_getNumEmit,c_fillSeed,c_normIdx,c_valRemap);}
int go5(void){ in_applySeq(); in_getNumEmit(); in_fillSeed(); in_normIdx(); in_valRemap(); L("GO5 done\n"); return 0;}
