// HGMemory.ts — Helium's HGMemory static facade. Transcribed from the disassembly
// at /Applications/Final Cut Pro.app/Contents/Frameworks/ProInclude.framework/
// Versions/A/Frameworks/Helium.framework/Versions/A/Helium (x86_64 slice, base
// file offset 0x4000). See raw-port/re/disasm/Helium.HGMemory.*.s.
//
// ROLE. HGMemory is a THIN STATIC FACADE around the HGMemoryManager process
// singleton. Every one of its four methods:
//   (a) forces the std::call_once init of HGMemoryManager::INSTANCE (guard flag
//       __ZZN15HGMemoryManager8INSTANCEEvE4flag, proxy
//       __ZNSt3__117__call_once_proxyB9nqe210106... via std::__1::__call_once),
//   (b) loads the singleton pointer from the static
//       __ZZN15HGMemoryManager8INSTANCEEvE2mm, and
//   (c) delegates to the corresponding HGMemoryManager method (allocate/
//       release/cleanup/clear). renderEnd() and clear() additionally lock a
//       pthread mutex embedded at INSTANCE + 0x40 and increment a counter at
//       INSTANCE + 0x38 before delegating (so cleanup/clear are the guarded
//       code paths; allocate/release are NOT locked at the HGMemory layer —
//       they lock inside HGMemoryManager itself).
//
// DECODE. Every method below cites its @0xADDR in Helium; every callee is
// resolved by mangled name from /tmp/Helium_symmap.tsv and appears verbatim in
// the disasm ("## HGMemoryManager::…"). Struct offsets +0x38 and +0x40 are
// read directly out of the assembly (see the `incq 0x38(%rbx)` and
// `leaq 0x40(%rbx), %r14` lines in renderEnd/clear).
//
// STRUCT LAYOUT (recovered from renderEnd 0x1b9552 and clear 0x1b9972 —
// only what HGMemory itself observes):
//   HGMemoryManager (partial, at INSTANCE pointer):
//     +0x38  callCounter : uint64   // `incq 0x38(%rbx)` before cleanup/clear
//     +0x40  lock        : pthread_mutex_t  (`leaq 0x40(%rbx), %r14`,
//                                            _pthread_mutex_lock/_unlock)
//   The rest of HGMemoryManager (deques of Block*, PageSizePolicy, Stats,
//   allocate/release/cleanup/clear internals — see /tmp/Helium_symmap.tsv:
//   __ZN15HGMemoryManager…) is the FRONTIER. It has NOT been transcribed;
//   HGMemory's four static methods therefore throw citing the frontier
//   HGMemoryManager call-site addresses so any caller fails loudly with a
//   real @0xADDR to grep for.
//
// FRONTIER CALLEES (mangled name -> @0xADDR in Helium, all uncited internally):
//   __ZN15HGMemoryManager8allocateEmPm  HGMemoryManager::allocate(u64,u64*)   @0x1b90a0
//   __ZN15HGMemoryManager7releaseEPv    HGMemoryManager::release(void*)       @0x1b9330
//   __ZN15HGMemoryManager7cleanupEv     HGMemoryManager::cleanup()            @0x1b9570
//   __ZN15HGMemoryManager5clearEv       HGMemoryManager::clear()              @0x1b9990
//   __ZNSt3__111__call_onceERVmPvPFvS2_E   std::__1::__call_once (libc++ stub)
//   _pthread_mutex_lock / _pthread_mutex_unlock                    (libSystem)
//   __ZZN15HGMemoryManager8INSTANCEEvE4flag   guard var for INSTANCE() call_once
//   __ZZN15HGMemoryManager8INSTANCEEvE2mm     the singleton pointer itself
//
// THREADING DELTA. JS is single-threaded; the pthread_mutex protecting
// cleanup/clear is a no-op here in principle. But since HGMemoryManager is
// entirely un-ported, there is no legitimate call site to reach — all four
// HGMemory entry points raise. If a future caller wires the manager, the
// raised errors are the correct demand signal for transcribing it.

// ── HGMemory (static facade) ─────────────────────────────────────────────────

/**
 * HGMemory::allocate(unsigned long size, unsigned long* outActualSize)
 *   — Helium @0x1b9040. Symbol: __ZN8HGMemory8allocateEmPm.
 *
 * Disasm (raw-port/re/disasm/Helium.HGMemory.allocate.s):
 *   0x1b9040  prologue; %rdi=size, %rsi=outActualSize (SysV: 1st, 2nd args)
 *   0x1b9051  load guard flag __ZZN15HGMemoryManager8INSTANCEEvE4flag
 *   0x1b9058  cmp $-1 ; je 0x1b9085         // already-init fast path
 *   0x1b906e  leaq guard flag ; leaq __call_once_proxy ; leaq lambda_pack
 *   0x1b9080  callq std::__1::__call_once   // one-time INSTANCE init
 *   0x1b9085  movq  __ZZ...INSTANCE...E2mm(%rip), %rdi   // singleton ptr
 *   0x1b908c  movq  %r14, %rsi              // size (saved from %rdi)
 *   0x1b908f  movq  %rbx, %rdx              // outActualSize (saved from %rsi)
 *   0x1b9092  callq HGMemoryManager::allocate(u64,u64*)  @Helium 0x1b90a0
 *   0x1b9097  epilogue; returns whatever manager returned (void* in %rax).
 *
 * Returns the allocated pointer (opaque void*) and writes the actual granted
 * byte count into *outActualSize (may be > requested `size`; see HGMemoryManager
 * page-size policy). Not transcribed — HGMemoryManager is frontier.
 */
export function HGMemory_allocate(size: bigint, outActualSize: { value: bigint }): unknown {
  void size; void outActualSize;
  throw new Error("HGMemory::allocate not yet transcribed — delegates to HGMemoryManager::allocate @Helium 0x1b90a0 (frontier); HGMemory::allocate @Helium 0x1b9040, callsite @0x1b9092"); // @0x1b9040
}

/**
 * HGMemory::release(void* ptr)  — Helium @0x1b92d0.
 * Symbol: __ZN8HGMemory7releaseEPv.
 *
 * Disasm (raw-port/re/disasm/Helium.HGMemory.release.s):
 *   0x1b92d0  prologue; %rdi=ptr saved into %rbx
 *   0x1b92dc  load INSTANCE guard flag; if $-1, skip __call_once (0x1b9310)
 *   0x1b92e9  leaq guard ; leaq __call_once_proxy ; callq std::__1::__call_once
 *   0x1b9310  movq  __ZZ...INSTANCE...E2mm(%rip), %rdi   // singleton ptr
 *   0x1b9317  movq  %rbx, %rsi                            // ptr
 *   0x1b931a  callq HGMemoryManager::release(void*)      @Helium 0x1b9330
 *   0x1b931f  epilogue.
 *
 * Not transcribed — HGMemoryManager is frontier.
 */
export function HGMemory_release(ptr: unknown): void {
  void ptr;
  throw new Error("HGMemory::release not yet transcribed — delegates to HGMemoryManager::release @Helium 0x1b9330 (frontier); HGMemory::release @Helium 0x1b92d0, callsite @0x1b931a"); // @0x1b92d0
}

/**
 * HGMemory::renderEnd()  — Helium @0x1b9500.
 * Symbol: __ZN8HGMemory9renderEndEv.
 *
 * Disasm (raw-port/re/disasm/Helium.HGMemory.renderEnd.s):
 *   0x1b9500  prologue.
 *   0x1b950b  load INSTANCE guard flag; if $-1, skip __call_once (0x1b953f)
 *   0x1b9518  leaq guard/proxy; callq std::__1::__call_once
 *   0x1b953f  movq  __ZZ...INSTANCE...E2mm(%rip), %rbx   // singleton -> %rbx
 *   0x1b9546  leaq  0x40(%rbx), %r14                     // &INSTANCE.lock
 *   0x1b954a  movq  %r14, %rdi ; callq _pthread_mutex_lock
 *   0x1b9552  incq  0x38(%rbx)                           // INSTANCE.callCounter++
 *   0x1b9556  movq  %rbx, %rdi
 *   0x1b9559  callq HGMemoryManager::cleanup()          @Helium 0x1b9570
 *   0x1b955e  movq  %r14, %rdi ; callq _pthread_mutex_unlock
 *   0x1b9566  epilogue.
 *
 * Semantics: end-of-render hook. Under the INSTANCE lock (+0x40), bumps
 * callCounter (+0x38) and runs cleanup() (deletes stale free blocks per
 * PageSizePolicy). Not transcribed — HGMemoryManager is frontier.
 */
export function HGMemory_renderEnd(): void {
  throw new Error("HGMemory::renderEnd not yet transcribed — locks INSTANCE+0x40, increments INSTANCE+0x38, delegates to HGMemoryManager::cleanup @Helium 0x1b9570 (frontier); HGMemory::renderEnd @Helium 0x1b9500, callsite @0x1b9559"); // @0x1b9500
}

/**
 * HGMemory::clear()  — Helium @0x1b9920.
 * Symbol: __ZN8HGMemory5clearEv.
 *
 * Disasm (raw-port/re/disasm/Helium.HGMemory.clear.s):
 *   0x1b9920  prologue.
 *   0x1b992b  load INSTANCE guard flag; if $-1, skip __call_once (0x1b995f)
 *   0x1b9938  leaq guard/proxy; callq std::__1::__call_once
 *   0x1b995f  movq  __ZZ...INSTANCE...E2mm(%rip), %rbx   // singleton -> %rbx
 *   0x1b9966  leaq  0x40(%rbx), %r14                     // &INSTANCE.lock
 *   0x1b996a  movq  %r14, %rdi ; callq _pthread_mutex_lock
 *   0x1b9972  incq  0x38(%rbx)                           // INSTANCE.callCounter++
 *   0x1b9976  movq  %rbx, %rdi
 *   0x1b9979  callq HGMemoryManager::clear()            @Helium 0x1b9990
 *   0x1b997e  movq  %r14, %rdi ; callq _pthread_mutex_unlock
 *   0x1b9986  epilogue.
 *
 * Semantics: hard-reset the memory manager (drop ALL blocks, not just aged
 * ones). Same locking pattern as renderEnd. Not transcribed — HGMemoryManager
 * is frontier.
 */
export function HGMemory_clear(): void {
  throw new Error("HGMemory::clear not yet transcribed — locks INSTANCE+0x40, increments INSTANCE+0x38, delegates to HGMemoryManager::clear @Helium 0x1b9990 (frontier); HGMemory::clear @Helium 0x1b9920, callsite @0x1b9979"); // @0x1b9920
}
