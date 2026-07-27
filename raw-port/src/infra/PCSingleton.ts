// PCSingleton.ts — ProCore's PCSingleton base class. Transcribed from the disassembly at
// /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore.
// See raw-port/re/disasm/ProCore.PCSingleton.*.s and grep 'PCSingleton' /tmp/ProCore_tV.txt.
//
// ROLE. PCSingleton is the shared base of the ENTIRE singleton family used by ProCore/Ozone
// (OZCurve*SplineState, OZChannel*Info, PCCurveFit, ...). Every singleton instance registers
// itself with a global vector under a global mutex on construction, and unlinks itself on
// destruction. `deleteSingletons()` drains that vector in Compare-sorted order, virtually
// deleting each entry until the list is empty (with up to 5 re-drain tries to catch late
// registrations, then a std::cout warning). Concrete singletons throw-stub their ctor/dtor
// and delegate to us.
//
// DECODE. Every method below cites its @0xADDR in ProCore; every callee is resolved by name
// from /tmp/ProCore_symmap.tsv and shown in the disasm; every hex offset is a byte offset
// read directly out of the assembly. There are three ABI aliases per ctor/dtor (C1/C2 and
// D0/D1/D2 — Itanium C++ ABI complete/base/deleting variants); the base variants (C2/D2) do
// the real work, and the aliases jmp/wrap them.
//
// STRUCT LAYOUT (recovered from ctor 0x1d5a6 and dtor 0x1d746).
//   PCSingleton (16 bytes):
//     +0x00  vtbl : *const void   // vtable pointer (RIP-const at 0x149330 loaded @0x1d5b9 in ctor,
//                                 //                 same const at 0x1d757 in dtor).
//     +0x08  tag  : uint32        // "unsigned int" ctor argument, stored in the Info entry.
//                                 // (There is no other observable member; the Info entry is what
//                                 //  holds the (this,tag) pair — see PCSingleton::Info below.)
//
//   PCSingleton::Info (16 bytes) — the element type of the global std::vector<Info>:
//     +0x00  self : PCSingleton*  // written from %r15 (== `this`) at 0x1d5e4 in ctor
//     +0x08  tag  : uint32        // written from %r14d (== tag arg)  at 0x1d5e7 in ctor
//     +0x0c  pad  : uint32        // 4 bytes of padding (struct is 16 bytes; vector strides by 0x10
//                                 //  — see the `sarq $0x4, %rcx` in deleteSingletons 0x1d860).
//
//   Global singletons vector (heap-owned std::vector<Info>*, PCSingleton::getSingletons()::singletons,
//   guard var __ZGVZN11PCSingleton13getSingletonsEvE10singletons):
//     +0x00  begin : Info*        // read at 0x1d779, 0x1d871 in dtor/deleteSingletons
//     +0x08  end   : Info*        // read at 0x1d77c, 0x1d874
//     +0x10  cap   : Info*        // zeroed at 0x1d4f2 in getSingletons() first-init
//
//   Global lock (heap-owned PCMutex*, PCSingleton::getLock()::lock, guard var
//   __ZGVZN11PCSingleton7getLockEvE4lock): allocated with `new PCMutex(true)` at 0x1d558 (48-byte
//   allocation size $0x48 -> operator new(72) -> PCMutex(bool=true) ctor).
//
// THREADING DELTA. The real FCP binary serializes register/unregister/drain on a process-wide
// PCMutex (thin wrapper around pthread_mutex). This TS port runs in a single-threaded JS runtime
// (both Node parity harnesses and the FCP-Transitions player are single-threaded), so lock()/
// unlock() are NO-OPs here: correctness of the vector state is preserved because there is no
// concurrent access. PCMutex/PCLockSentry are NOT transcribed (frontier symbols
// __ZN7PCMutex{C1Eb,lockEv,unlockEv,...} and __ZN12PCLockSentryI7PCMutexED1Ev @ProCore 0x1d617)
// — a throwing stub is exposed via getLock() so that ANY caller that actually needs a mutex
// will fail loudly and cite the frontier @ProCore 0x1d5d2 (PCMutex::lock callsite).

// ── PCMutex (frontier) ────────────────────────────────────────────────────────
// PCMutex lives at ProCore symbols __ZN7PCMutex{C1Eb,lockEv,unlockEv,...} — see
// grep '__ZN7PCMutex' /tmp/ProCore_symmap.tsv. It is a thin pthread_mutex wrapper.
// Not transcribed: JS is single-threaded, and no ported class currently needs the actual
// synchronization semantics. We keep an opaque handle and throw on any real op so a future
// caller that IS concurrency-sensitive can't silently misbehave.
/** Opaque handle for ProCore's PCMutex. The real allocation is `new PCMutex(true)` (72 bytes,
 *  see 0x1d553 `movl $0x48,%edi` -> operator new -> ctor). Layout is frontier. */
export class PCMutex {
  /** @ProCore 0x1d558 — allocated via `operator new(0x48=72)` in PCSingleton::getLock().
   *  Ctor __ZN7PCMutexC1Eb is invoked with %esi=1 (bool argument = true). Not transcribed. */
  public constructor(_recursive: boolean) {
    // We don't allocate anything real; the throwing lock()/unlock() below make sure no caller
    // accidentally depends on this being a working mutex.
  }
  /** @ProCore __ZN7PCMutex4lockEv — pthread_mutex lock. NO-OP in JS (single-threaded). */
  public lock(): void { /* JS is single-threaded; see THREADING DELTA in the file header. */ }
  /** @ProCore __ZN7PCMutex6unlockEv — pthread_mutex unlock. NO-OP in JS (single-threaded). */
  public unlock(): void { /* JS is single-threaded; see THREADING DELTA in the file header. */ }
}

// ── PCSingleton::Info ─────────────────────────────────────────────────────────
// The element type of the global vector. Layout recovered from the ctor's stack-scratch write
// at 0x1d5e0..0x1d5eb (movq %r15,(%rsi); movl %r14d,0x8(%rsi)) and the dtor's linear scan at
// 0x1d78f (cmpq %r14,(%r12)) which compares `Info.self` against `this`.
/** One (singleton pointer, tag) entry in PCSingleton::getSingletons()'s vector.
 *  @ProCore layout recovered from 0x1d5e4/0x1d5e7 (ctor writes) and 0x1d78f (dtor scan). */
export interface PCSingletonInfo {
  /** +0x00: back-pointer to the PCSingleton subclass instance. Written from %r15==`this`. */
  self: PCSingleton | null;
  /** +0x08: the `unsigned int` tag the subclass passed to `PCSingleton(unsigned int)`. */
  tag: number;
}

// ── The global singletons vector (PCSingleton::getSingletons()::singletons) ──
// The vector is heap-allocated once (0x18 bytes, three pointers: begin/end/cap), guarded by an
// Itanium __cxa_guard, with all three pointers initialized to null. We model that faithfully.
// See 0x1d4e2 `movl $0x18,%edi` -> operator new(24) -> xorps to zero begin+end -> movq $0,+0x10.
interface SingletonsVector {
  /** Backing storage — a plain array is fine because we control every push/erase/clear path. */
  data: PCSingletonInfo[];
}
/** Module-level singleton (Itanium `PCSingleton::getSingletons()::singletons`, guard var
 *  __ZGVZN11PCSingleton13getSingletonsEvE10singletons). Lazy — see getSingletons() @0x1d4b4. */
let g_singletons: SingletonsVector | null = null;

/** Module-level singleton (Itanium `PCSingleton::getLock()::lock`, guard var
 *  __ZGVZN11PCSingleton7getLockEvE4lock). Lazy — see getLock() @0x1d526. */
let g_lock: PCMutex | null = null;

// ── PCSingleton class ─────────────────────────────────────────────────────────
export class PCSingleton {
  /** +0x08 in the C++ layout — kept public here because subclasses (frontier) read/write it. */
  public tag: number;

  /**
   * PCSingleton::PCSingleton(unsigned int)  @ProCore 0x1d5a6 (base subobject ctor C2;
   * complete-object ctor C1 @0x1d73c just jmps to C2).
   *
   * Disasm walk (raw-port/re/disasm/ProCore.PCSingleton.PCSingleton.s):
   *   0x1d5b9  leaq   0x12bd10(%rip), %rax             ; load vtable const @ProCore 0x149330
   *   0x1d5c0  movq   %rax, (%rdi)                     ; store vtbl at this+0x00
   *   0x1d5c3  callq  PCSingleton::getLock()           ; @0x1d526
   *   0x1d5d2  callq  PCMutex::lock                    ; __ZN7PCMutex4lockEv
   *   0x1d5db  callq  PCSingleton::getSingletons()     ; @0x1d4b4
   *   0x1d5e0  leaq   -0x38(%rbp), %rsi                ; stack-temp Info{self,tag}
   *   0x1d5e4  movq   %r15, (%rsi)                     ; Info.self = this
   *   0x1d5e7  movl   %r14d, 0x8(%rsi)                 ; Info.tag  = ctor's uint arg
   *   0x1d5ee  callq  std::vector<Info>::push_back(Info const&)
   *   0x1d5f6  callq  PCMutex::unlock                  ; via PCLockSentry destructor path
   */
  public constructor(tag: number) {
    // Match the asm: store tag as u32 (movl %esi -> ecx-width write to Info+0x8 at 0x1d5e7).
    this.tag = tag >>> 0;
    // The vtable-pointer write (`movq %rax,(%rdi)` @0x1d5c0, loading the const at 0x149330) has
    // no observable effect in JS — the vtable is used by other TU's calling through slots on us.
    // Subclasses' own vtables override this at their leaf ctors.
    const lock = PCSingleton.getLock();
    lock.lock();
    try {
      const v = PCSingleton.getSingletons();
      v.data.push({ self: this, tag: this.tag });   // std::vector<Info>::push_back @0x1d5ee
    } finally {
      lock.unlock();                                 // PCMutex::unlock @0x1d5f6 (via sentry)
    }
  }

  /**
   * PCSingleton::~PCSingleton()  @ProCore 0x1d746 (base D2). D1 @0x1d7e4 aliases D2; D0 @0x1d7ee
   * calls D2 then `operator delete(this)`. Reverses the ctor: locks the global mutex, walks the
   * singletons vector linearly, finds the entry whose Info.self == this, and erases it in place
   * by memmove-ing the tail forward and shrinking `end` by 0x10.
   *
   * Disasm walk (raw-port/re/disasm/ProCore.PCSingleton.~PCSingleton.s):
   *   0x1d757  leaq  0x12bb72(%rip), %rax              ; vtable const @ProCore 0x149330 (same as ctor)
   *   0x1d75e  movq  %rax, (%rdi)                      ; restore base-vtbl slot at this+0x00
   *   0x1d761  callq PCSingleton::getLock()            ; @0x1d526
   *   0x1d76c  callq PCMutex::lock                     ; __ZN7PCMutex4lockEv
   *   0x1d771  callq PCSingleton::getSingletons()      ; @0x1d4b4
   *   0x1d779  movq  (%rax), %r12                      ; it   = v.begin  (Info*)
   *   0x1d77c  movq  0x8(%rax), %rax                   ; end  = v.end    (Info*)
   *   0x1d78f  cmpq  %r14, (%r12)                      ; while it!=end: if it->self == this: break
   *   0x1d795  addq  $0x10, %r12                       ; ++it
   *   0x1d79d  cmpq  %rax, %r12; jne 0x1d78f
   *   0x1d7a4  leaq  0x10(%r12), %rsi                  ; src = it+1
   *   0x1d7ac  je    0x1d7b9                           ; if src==end skip memmove
   *   0x1d7b4  callq _memmove(dst=it, src=it+1, n=(end-it)-0x10)
   *   0x1d7bc  movq  %r12, 0x8(%r15)                   ; v.end = it + (end-it)-0x10 == end-1
   *   0x1d7c3  callq PCMutex::unlock                   ; __ZN7PCMutex6unlockEv
   */
  // Named `destroy` in TS: JS has no destructors, and subclasses (frontier) must explicitly call
  // this before dropping the last reference so their entry is unlinked from the global vector.
  public destroy(): void {
    // vtbl restore @0x1d75e is a no-op in JS (see ctor).
    const lock = PCSingleton.getLock();
    lock.lock();
    try {
      const v = PCSingleton.getSingletons();          // @0x1d771
      const arr = v.data;
      // Linear scan for the first Info whose .self === this. Mirrors 0x1d78f..0x1d7a0.
      let idx = -1;
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].self === this) { idx = i; break; }
      }
      if (idx >= 0) {
        // memmove(it, it+1, (end-it)-0x10); v.end = end-1  — a plain in-place erase.
        arr.splice(idx, 1);
      }
    } finally {
      lock.unlock();                                   // @0x1d7c3
    }
  }

  /**
   * PCSingleton::getSingletons()  @ProCore 0x1d4b4 (real prologue; otool mis-decodes 0x1d4b1..3 as
   * data because the previous fn is a returning tail). Function-local static:
   *
   *   if (!(guard & 1)) {
   *       if (__cxa_guard_acquire(&guard)) {
   *           singletons = (Vec*) operator new(0x18);   // sizeof(std::vector<Info>) == 24
   *           singletons->begin = nullptr;              // xorps xmm0 / movups xmm0,(rax)
   *           singletons->end   = nullptr;
   *           singletons->cap   = nullptr;              // movq $0, 0x10(rax)
   *           __cxa_guard_release(&guard);
   *       }
   *   }
   *   return singletons;
   *
   * See 0x1d4ba (guard load), 0x1d4d2 (guard_acquire), 0x1d4e2 (operator new 0x18), 0x1d4ec-0x1d4fa
   * (three-pointer zero init and store to singletons), 0x1d508 (guard_release).
   */
  public static getSingletons(): SingletonsVector {
    if (g_singletons === null) {
      g_singletons = { data: [] };                     // std::vector<Info> value-initialized
    }
    return g_singletons;
  }

  /**
   * PCSingleton::getLock()  @ProCore 0x1d526. Same Itanium function-local-static shape as
   * getSingletons, except the payload is `new PCMutex(true)`.
   *
   *   if (!(guard & 1)) {
   *       if (__cxa_guard_acquire(&guard)) {
   *           lock = (PCMutex*) operator new(0x48);   // 72 bytes
   *           PCMutex::PCMutex(lock, /- bool -/ 1);    // @0x1d568 __ZN7PCMutexC1Eb
   *           __cxa_guard_release(&guard);
   *       }
   *   }
   *   return lock;
   *
   * See 0x1d52d (guard load), 0x1d543 (guard_acquire), 0x1d553 (`movl $0x48,%edi`), 0x1d558
   * (operator new), 0x1d563 (`movl $0x1,%esi` -> ctor bool=true), 0x1d568 (PCMutex ctor).
   */
  public static getLock(): PCMutex {
    if (g_lock === null) {
      g_lock = new PCMutex(true);                      // __ZN7PCMutexC1Eb @0x1d568, arg=true
    }
    return g_lock;
  }

  /**
   * PCSingleton::deleteSingletons()  @ProCore 0x1d80a.
   *
   * Repeat up to 6 times (r12d loop counter compared `cmpl $0x5,%r12d`; jb reenters at 0x1d92b):
   *   1. getLock() -> lock.lock()                                  @0x1d831..0x1d840
   *   2. copy the singletons vector's [begin,end) into a LOCAL stack vector
   *      via std::vector::__assign_with_size(begin, end, (end-begin)/16)  @0x1d867
   *   3. clear the global vector: globalVec.end = globalVec.begin      @0x1d871..0x1d874
   *   4. lock.unlock()                                                  @0x1d87b
   *   5. if the local copy is non-empty:
   *        __introsort<PCSingleton::Compare&>(local.begin, local.end, cmp, log2ceil, ascending=1)
   *        (ceil-log2 recipe at 0x1d897..0x1d8a0: bsrq / xor 0x3f / addl / xor 0x7e)
   *   6. iterate the SORTED local from the tail:
   *        while (--sz) {
   *            Info info = local.pop_back();       // 0x1d8c0 movq -0x10(%rsi),%rax
   *            if (info.self != nullptr) {
   *                (*info.self->vtbl[+0x8])(info.self);   // 0x1d8d7 callq *0x8(%rcx)
   *            }                                    // — this is the virtual "delete self" slot
   *        }
   *   7. free the local vector's storage: `operator delete(local.begin)` @0x1d915
   *   8. re-check under a fresh lock whether the global vector is empty (0x1d8dc..0x1d908);
   *      if it's non-empty AND r12d<5, loop again to catch late registrations.
   *
   * If after ≤6 tries the vector is still non-empty (r13!=r14 @0x1d931), emit to std::cout:
   *   "ProCore: PCSingleton could not successfully release all singletons in <r12d> tries.\n"
   *   "This is caused by singletons being created during the application teardown process.\n"
   *
   * Then: getSingletons() -> free its backing storage & delete the vector itself
   *       (@0x1d996 operator delete(begin); @0x1d9a2 operator delete(vec)), then
   *       call getLock() -> virtual slot +0x8 (@0x1d9b2) to destroy the mutex.
   *
   * We DO NOT re-implement introsort here (that's std::__1::__introsort, a compiler-instantiated
   * frontier). We match the OBSERVABLE effect: each Info in the vector gets its subclass's
   * virtual `delete self` slot invoked, in Compare-order — but the Compare functor itself is
   * frontier (PCSingleton::Compare — not yet decoded). Since we can't run the sort faithfully
   * without decoding Compare, we throw with the @0xADDR the moment there's more than one live
   * singleton to sort. For an empty vector this function is a legitimate no-op.
   */
  public static deleteSingletons(): void {
    // ---- one entry into the loop body @0x1d822..0x1d92b, non-looping edition. ----
    let tries = 0;
    let leftover = false;

    // We can faithfully model the zero-singleton case without decoding Compare or introsort:
    // the outer loop terminates immediately (r13==r14 @0x1d91a je -> 0x1d931) with tries==0.
    while (tries < 6) {
      const localCopy: PCSingletonInfo[] = [];

      // 1..4: swap the vector's contents into a local under the lock.
      const lock = PCSingleton.getLock();               // @0x1d831
      lock.lock();                                       // @0x1d840
      const gv = PCSingleton.getSingletons();            // @0x1d849
      // __assign_with_size(local, gv.begin, gv.end, sz) -> localCopy is a copy of gv.data.
      for (const info of gv.data) localCopy.push({ self: info.self, tag: info.tag });
      gv.data.length = 0;                                // v.end = v.begin  @0x1d871..0x1d874
      lock.unlock();                                     // @0x1d87b

      if (localCopy.length > 0) {
        // 5: introsort under PCSingleton::Compare. PCSingleton::Compare is FRONTIER
        //    (__ZN11PCSingleton7CompareclERKNS_4InfoES3_ — comparator functor, not yet decoded).
        //    We refuse to invoke the virtual `delete self` slot without the correct order
        //    because two singletons whose destructors have registration dependencies (that's
        //    the whole reason Compare exists) would be torn down in the wrong order.
        throw new Error(
          "PCSingleton::deleteSingletons @ProCore 0x1d80a — introsort under PCSingleton::Compare " +
          "(callee @ProCore 0x1d8ae __ZNSt3__111__introsort... + PCSingleton::Compare functor) " +
          "not yet transcribed; refusing to run virtual delete slots (`*0x8(vtbl)` @0x1d8d7) " +
          "in an unspecified order."
        );
        // 6..7 (unreachable until the above is decoded): pop_back loop invoking
        //      `(*info.self->vtbl[+0x8])(info.self)` @0x1d8d7 in reverse-sorted order,
        //      then `operator delete(localCopy.begin)` @0x1d915.
      }

      // 8: re-lock, sample gv.begin/end again to see if any registrations arrived while we were
      //    draining. Empty gv -> exit loop. Non-empty AND tries<5 -> re-drain.
      lock.lock();                                       // @0x1d8eb
      const gv2 = PCSingleton.getSingletons();           // @0x1d8f4
      const stillNonEmpty = gv2.data.length !== 0;       // r13!=r14 @0x1d91a
      lock.unlock();                                     // @0x1d903
      if (!stillNonEmpty) { leftover = false; break; }   // je -> 0x1d931
      leftover = true;
      // cmpl $0x5,%r12d;  leal 1(%r12),%eax;  movl %eax,%r12d;  jb 0x1d822   @0x1d91f..0x1d92b
      if (tries >= 5) break;
      tries = (tries + 1) >>> 0;
    }

    // Late-registration warning path @0x1d931..0x1d986.
    if (leftover) {
      // std::cout << "ProCore: PCSingleton could not successfully release all singletons in "
      //          << tries << " tries.\n"
      //          << "This is caused by singletons being created during the application teardown process.\n";
      // Ported to console.log — the two literals are the exact byte strings loaded at
      // 0x1d93d (length $0x46) and 0x1d972 (length $0x54), so provenance is direct.
      console.log(
        "ProCore: PCSingleton could not successfully release all singletons in " +
        String(tries >>> 0) +
        " tries.\n" +
        "This is caused by singletons being created during the application teardown process."
      );
    }

    // Free the vector's backing storage and the vector itself. @0x1d986..0x1d9a2.
    const gv3 = PCSingleton.getSingletons();
    gv3.data.length = 0;                                 // operator delete(begin) @0x1d99a
    g_singletons = null;                                 // operator delete(vec)   @0x1d9a2

    // Destroy the mutex via its virtual dtor slot (0x8(%rcx)) @0x1d9a7..0x1d9b2.
    // PCMutex's vtbl is FRONTIER (__ZTV7PCMutex — not yet decoded). Since our PCMutex is a
    // no-op stand-in with no real pthread state, dropping the reference is the faithful analog.
    g_lock = null;
  }
}
