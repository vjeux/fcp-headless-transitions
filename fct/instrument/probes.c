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
static void L(const char*f,...){ if(!g)g=fopen("/tmp/probes_trace.txt","a"); va_list a; va_start(a,f); vfprintf(g,f,a); va_end(a); fflush(g);}
static int patch(void*d,const void*s,size_t n){mach_port_t t=mach_task_self();uintptr_t p=(uintptr_t)d&~0x3FFFULL;size_t sp=((((uintptr_t)d+n)-p)+0x3FFF)&~0x3FFFULL;
 if(mach_vm_protect(t,p,sp,0,VM_PROT_READ|VM_PROT_WRITE|VM_PROT_COPY)!=KERN_SUCCESS)return -1;memcpy(d,s,n);mach_vm_protect(t,p,sp,0,VM_PROT_READ|VM_PROT_EXECUTE);sys_icache_invalidate(d,n);return 0;}
static void* mktr(uint32_t*t){void*m=mmap(0,4096,PROT_READ|PROT_WRITE|PROT_EXEC,MAP_ANON|MAP_PRIVATE|MAP_JIT,-1,0);if(m==MAP_FAILED)m=mmap(0,4096,PROT_READ|PROT_WRITE|PROT_EXEC,MAP_ANON|MAP_PRIVATE,-1,0);if(m==MAP_FAILED)return 0;
 pthread_jit_write_protect_np(0);uint32_t*p=m;for(int i=0;i<4;i++)p[i]=t[i];p[4]=0x58000051;p[5]=0xD61F0220;*(uint64_t*)&p[6]=(uint64_t)(t+4);sys_icache_invalidate(m,4096);pthread_jit_write_protect_np(1);return m;}

#define MKHOOK(NAME, SYM) \
static void* o_##NAME=NULL; static long c_##NAME=0; \
static uint64_t h_##NAME(void*a,void*b,void*c,void*d,void*e){ c_##NAME++; if(c_##NAME<=3) L(#NAME " #%ld a=%p b=%p c=%p\n", c_##NAME,a,b,c); \
  uint64_t(*fn)(void*,void*,void*,void*,void*)=(void*)o_##NAME; return fn(a,b,c,d,e);} \
static void inst_##NAME(void){ void*ad=dlsym((void*)-2, SYM); if(!ad){L("NOSYM " #NAME "\n");return;} void*tr=mktr((uint32_t*)ad); if(!tr){L("TRAMPFAIL " #NAME "\n");return;} o_##NAME=tr; \
  uint32_t pt[4]; pt[0]=0x58000051; pt[1]=0xD61F0220; *(uint64_t*)&pt[2]=(uint64_t)h_##NAME; L("inst " #NAME " rc=%d\n",patch(ad,pt,16));}

MKHOOK(applySeq, "_ZN12PSPaintPType25applyAllSequenceBehaviorsERK6CMTimePK10PSParticleR17PSSequencedValues")
MKHOOK(getNumEmit, "_ZN12PSPaintPType29getNumEmissionPointsAndOrdersERK6CMTimePNSt3__16vectorIdNS3_9allocatorIdEEEE")
MKHOOK(getFillSeed, "_ZN12PSReplicator11getFillSeedEP14PSParticleType")
MKHOOK(normIdx, "_ZN18PSSequenceBehavior14normalizeIndexEdRK6CMTime")
MKHOOK(getValRemap, "_ZN18PSSequenceBehavior18getValuesRemapTimeERK6CMTimedR17PSSequencedValues")
MKHOOK(shuffleOrder, "_ZN9PSEmitter12shuffleOrderEjjj")

MKHOOK(getInfluence, "_ZN18PSSequenceBehavior12getInfluenceERK6CMTimed")
MKHOOK(getCompletion, "_ZN18PSSequenceBehavior13getCompletionERK6CMTimed")
MKHOOK(getNumObjects, "_ZN18PSSequenceBehavior13getNumObjectsERK6CMTime")
MKHOOK(applySeqBase, "_ZN14PSParticleType25applyAllSequenceBehaviorsERK6CMTimePK10PSParticleR17PSSequencedValues")
MKHOOK(paintNormIdx, "_ZN23PSPaintSequenceBehavior14normalizeIndexEdRK6CMTime")

void report_probes(void){ L("REPORT applySeq=%ld getNumEmit=%ld getFillSeed=%ld normIdx=%ld getValRemap=%ld shuffleOrder=%ld\n", c_applySeq,c_getNumEmit,c_getFillSeed,c_normIdx,c_getValRemap,c_shuffleOrder); L("REPORT2 getInfluence=%ld getCompletion=%ld getNumObjects=%ld applySeqBase=%ld paintNormIdx=%ld\n",c_getInfluence,c_getCompletion,c_getNumObjects,c_applySeqBase,c_paintNormIdx);}
int setup_probes(void){ inst_applySeq(); inst_getNumEmit(); inst_getFillSeed(); inst_normIdx(); inst_getValRemap(); inst_shuffleOrder(); inst_getInfluence(); inst_getCompletion(); inst_getNumObjects(); inst_applySeqBase(); inst_paintNormIdx(); L("SETUP done\n"); return 0;}
