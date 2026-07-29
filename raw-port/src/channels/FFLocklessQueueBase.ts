// FFLocklessQueueBase.ts — Flexo type-erased lockless intrusive queue
// (single-producer/single-consumer at the pop head, MPSC-style at the push
// head, both drained by the same worker), the shared base for the
// FFLocklessQueue<T> template family. Payload-agnostic; concrete subclasses
// (e.g. FFAudioBufferListLocklessQueue) inherit and override `compare`.
//
// TRANSCRIBED from FCP Flexo framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// See raw-port/re/disasm/Flexo.FFLocklessQueueBase.*.s for the verbatim
// x86_64 disassembly of every method (and /tmp/fflqb_ctor_raw.log for the
// ctor/dtor bodies that came out as 0-byte via disasm_class.sh).
//
// The 20 ledger methods this file ports (Flexo):
//
//   FFLocklessQueueBase::FFLocklessQueueBase(FFLocklessQueueSortOption) [C2] @0x12b9ba0
//   FFLocklessQueueBase::FFLocklessQueueBase(FFLocklessQueueSortOption) [C1] @0x12b9bd0
//   FFLocklessQueueBase::~FFLocklessQueueBase()                         [D2] @0x12b9c00
//   FFLocklessQueueBase::~FFLocklessQueueBase()                         [D1] @0x12b9e50
//   FFLocklessQueueBase::~FFLocklessQueueBase()                         [D0] @0x12b9e60
//   FFLocklessQueueBase::clear()                                             @0x12b9da0
//   FFLocklessQueueBase::popAtomic(atomic<ElementBase*>&)                    @0x12b9e10
//   FFLocklessQueueBase::isEmpty() const                                     @0x12b9e80
//   FFLocklessQueueBase::migratePushList()                                   @0x12b9ea0
//   FFLocklessQueueBase::clearQueue(ElementBase**)                           @0x12b9ec0
//   FFLocklessQueueBase::setFreeElementProc(procPtr, ctx)                    @0x12b9f20
//   FFLocklessQueueBase::popElementAtomic()                                  @0x12b9f30
//   FFLocklessQueueBase::performMigration(atomic<ElementBase*>&, ElementBase*&) @0x12b9f50
//   FFLocklessQueueBase::popAllAtomic(atomic<ElementBase*>&)                 @0x12ba060
//   FFLocklessQueueBase::reverseList(ElementBase*&)                          @0x12ba0a0
//   FFLocklessQueueBase::freeElement(ElementBase*)                           @0x12ba0d0
//   FFLocklessQueueBase::loadValue(atomic<ElementBase*>&)                    @0x12ba0f0
//   FFLocklessQueueBase::compareAndSwap(atomic<ElementBase*>&, expected&, desired) @0x12ba100
//   FFLocklessQueueBase::pushAtomic(ElementBase*, atomic<ElementBase*>&)     @0x12ba120
//   FFLocklessQueueBase::compare(ElementBase*, ElementBase*) const           @0x378eb0
//     (compare is const but the address falls outside FFLocklessQueueBase's
//     own text — it is a stub/inline that the ledger flagged as "ported"
//     in an adjacent transcription; overridden by every concrete subclass.
//     A base-level `compare` still needs a member here for the virtual
//     dispatch signature to match; we surface it as a frontier stub that
//     raises citing @0x378eb0 since its actual body is not in
//     /tmp/Flexo.x86_64 at that address as raw code but is likely folded
//     into an ICF group with other stubs.)
//
// STRUCT LAYOUT (recovered from ctor @0x12b9ba0 + dtor @0x12b9c00 +
// method accessor patterns across all decoded bodies):
//
//   +0x00  vtbl                   : pointer      set by C2 (leaq 0x66bc8d(%rip),%rax ; movq %rax,(%rdi))
//                                                   the virtual table has at least:
//                                                     +0x08  virtual dtor
//                                                     +0x10  compare(a,b)  — invoked by performMigration @0x12ba020
//                                                     +0x18  migrate hook  — invoked by migratePushList @0x12b9eaf and clear @0x12b9dbb
//                                                                              via `callq *0x18(%rax)` with (this, &pushHead, &popHead)
//   +0x08  sortOption             : uint32       written by C2 (`movl %esi,0x8(%rdi)`); read by
//                                                performMigration (`cmpl $0,0x8(%r14)`). Bare uint32
//                                                pass-through — meaning is a concrete-subclass concern.
//   +0x10  pushHead               : atomic<ElementBase*>   pushers CAS onto this (pushAtomic
//                                                @0x12ba124-3b). Ctor inits both this and popHead by
//                                                two xmm-zeroed 16-byte writes (movups %xmm0,0x10; 0x20).
//   +0x18  popHead                : ElementBase* (non-atomic; single-consumer)
//                                                worker pops LIFO from here (popElementAtomic
//                                                @0x12b9f30). isEmpty reads (+0x18) then (+0x10).
//                                                Written by migrate hook via the &popHead arg.
//   +0x20  freeList               : atomic<ElementBase*>   drain buffer used by clear/dtor:
//                                                elements pulled off popHead are re-pushed onto
//                                                freeList (CAS at @0x12b9df4 in clear, @0x12b9d34 in
//                                                dtor) after the freeElementProc callback fires.
//   +0x28  freeElementProc        : (ctx, ElementBase*) -> void      written by setFreeElementProc
//                                                (`movq %rsi,0x28(%rdi)`); read by freeElement,
//                                                clear, clearQueue, dtor — same fnptr pattern
//                                                everywhere (test rax; if nonzero, load ctx from
//                                                +0x30, call it with (ctx, elem)).
//   +0x30  freeElementCtx         : void*        written by setFreeElementProc (`movq %rdx,0x30(%rdi)`).
//                                                Ctor sets to NULL via `movq $0,0x30(%rdi)`.
//
//   Total object size: 0x38 bytes (56).
//
// VTABLE POINTERS (constants recovered from the leaq RIP-relative loads):
//   C2 @0x12b9ba4  install: 0x12b9ba4 + 7 + 0x66bc8d = 0x1925838 — base vtable.
//   C1 @0x12b9bd4  install: 0x12b9bd4 + 7 + 0x66bc5d = 0x1925838 — same, verified.
//   D2 @0x12b9c11  install: 0x12b9c11 + 7 + 0x66bc20 = 0x1925838 — same (rewritten by dtor to the
//                  FFLocklessQueueBase vptr per Itanium ABI, undoing whatever subclass vptr was
//                  installed before dtor entry).
//
// The three ctor bodies (C2/C1) are byte-identical (same %rip-relative
// displacement 0x66bc8d/0x66bc5d resolves to the same absolute VA). D2
// installs the same vptr as the first act of teardown then walks
// pushHead+popHead+freeList as three separate atomic-drain loops.
//
// FRONTIER (throwing stubs — undecoded call targets, all @0xADDR-cited):
//   - element_virtual_dtor : slot +0x8 of the ElementBase vptr (called from D2 drain loop
//     @0x12b9d5b via `movq (%rdi),%rax ; callq *0x8(%rax)`); implemented by concrete task classes.
//   - vtbl_compare : slot +0x10 of THIS's vptr, called by performMigration @0x12b9f0..029
//     as `movq (%r14),%rax ; callq *0x10(%rax)` with (this, ElementBase* a, ElementBase* b).
//     Base's own `compare` @0x378eb0 is a throwing stub — concrete subclasses override.
//   - vtbl_migrate : slot +0x18 of THIS's vptr, called by migratePushList @0x12b9ea..b4 and
//     clear @0x12b9db..bb as `movq (%rdi),%rax ; callq *0x18(%rax)` with (this, &pushHead, &popHead).
//     This is FFLocklessQueue<T>'s per-instantiation "how to move pushed elements to the pop head",
//     e.g. reverse-then-splice for unsorted, or ordered-merge for sorted.
//   - __clang_call_terminate : implicit exception-cleanup helper, dtor @0x12b9d93 / @0x12b9d9b.
//   - operator delete (__ZdlPv) : called by D0 @0x12b9e77.
//
// x86 AT&T decode notes: every `cmpxchgq` sequence in this file is the
// canonical `expected in %rax + desired in %rdx/%rN; lock cmpxchgq desired,mem;
// if success ZF=1 (je), else %rax now holds the current mem value and the
// loop retries`. Every `testq X,X ; je L` is "if X == 0 goto L". No
// float compares (this class is pointer-arithmetic only), so the AT&T
// ucomisd/j-cheat-sheet doesn't apply.

// ── Frontier / opaque handle types ──────────────────────────────────────

/** Intrusive queue node linkage. Only two fields are read by
 *  FFLocklessQueueBase itself; everything else is up to the concrete
 *  subclass. */
export interface FFLocklessQueueBase_ElementBase {
  /** +0x00 vtbl — virtual table (dtor at slot +0x8). Concrete node
   *  types install their own vptr; the base only calls slot +0x8. */
  vtbl: FFLocklessQueueBase_ElementBase_VTable;
  /** +0x08 next — intrusive singly-linked forward pointer, written by
   *  every push (pushAtomic @0x12ba130 `movq %rax,0x8(%rdi)`) and every
   *  pop (popAtomic @0x12b9e36 `movq $0,0x8(%rcx)` after unlinking). */
  next: FFLocklessQueueBase_ElementBase | null;
}

/** The subset of an ElementBase vtable that FFLocklessQueueBase itself
 *  ever calls. Concrete node vtables install a full C++ vtable; only
 *  slot +0x8 is used here (via D2 @0x12b9d5b). */
export interface FFLocklessQueueBase_ElementBase_VTable {
  /** +0x08 virtual ~ElementBase() — invoked by the D2 drain loop on
   *  every element whose freeElementProc did not steal ownership. */
  dtor: (self: FFLocklessQueueBase_ElementBase) => void;
}

/** std::atomic<ElementBase*> reference. Only the current value is
 *  accessible; all mutation goes through the CAS/RMW helpers on
 *  FFLocklessQueueBase. Modelled as an object holding a mutable slot so
 *  it can be passed BY REFERENCE the same way `atomic<T*>&` is in C++. */
export interface AtomicElementBasePtr {
  value: FFLocklessQueueBase_ElementBase | null;
}

/** ElementBase** — a caller-supplied slot the migrate hook writes into.
 *  Same shape as AtomicElementBasePtr; separated so signatures match
 *  the C++ prototypes (ElementBase** vs atomic<ElementBase*>&). */
export interface ElementBasePtrRef {
  value: FFLocklessQueueBase_ElementBase | null;
}

/** setFreeElementProc callback prototype:
 *    void (*)(void* ctx, ElementBase* elem)
 *  Note the argument order: the ctx (was in %rsi at the call site) comes
 *  FIRST — i.e. setFreeElementProc stores the fnptr at +0x28 and the ctx
 *  at +0x30; freeElement then loads ctx into %rdi (first arg) and jumps
 *  through the fnptr. This matches the demangled sig
 *  `PFvPvPNS_11ElementBaseEE` (`void(*)(void*, ElementBase*)`). */
export type FreeElementProc = (
  ctx: unknown,
  elem: FFLocklessQueueBase_ElementBase,
) => void;

/** FFLocklessQueueSortOption — the raw uint32 enum passed to the ctor.
 *  The base ctor stores it verbatim at +0x8 (no masking) and never
 *  reads it here (performMigration only branches on `!= 0`). Concrete
 *  subclasses give it semantics (e.g. 0 = unsorted, 1 = ascending). */
export type FFLocklessQueueSortOption = number;

// ── Vtable slot indices (byte offsets on this class's vptr) ─────────────

/** Byte-offset table for the FFLocklessQueueBase vptr. Concrete
 *  subclasses install a vtable at least this large. */
export interface FFLocklessQueueBase_VTable {
  /** +0x08 — virtual ~FFLocklessQueueBase(); base impl at @0x12b9c00 (D2). */
  dtor: (self: FFLocklessQueueBase) => void;
  /** +0x10 — virtual bool compare(ElementBase* a, ElementBase* b) const;
   *  called by performMigration @0x12ba029 during sorted-insert loops.
   *  Base impl @0x378eb0 is a stub — concrete subclasses override. */
  compare: (
    self: FFLocklessQueueBase,
    a: FFLocklessQueueBase_ElementBase,
    b: FFLocklessQueueBase_ElementBase,
  ) => boolean;
  /** +0x18 — virtual void migrate(atomic<ElementBase*>& pushHead, ElementBase*& popHead);
   *  called by migratePushList @0x12b9eaf and clear @0x12b9dbb. Concrete
   *  subclasses implement the actual list-splice logic. */
  migrate: (
    self: FFLocklessQueueBase,
    pushHead: AtomicElementBasePtr,
    popHead: ElementBasePtrRef,
  ) => void;
}

// ── The FFLocklessQueueBase object ──────────────────────────────────────

/** In-memory image of the FFLocklessQueueBase C++ object, matching the
 *  x86_64 layout recovered from the ctor + all method accessors.
 *  Concrete subclasses extend this by adding their own trailing fields
 *  past +0x38. */
export class FFLocklessQueueBase {
  /** +0x00 vtbl — installed by the ctor via `leaq 0x66bc8d(%rip),%rax ;
   *  movq %rax,(%rdi)` @0x12b9ba4. Base vtable VA = 0x1925838. */
  vtbl: FFLocklessQueueBase_VTable;
  /** +0x08 sortOption — raw uint32 written by ctor @0x12b9bae. */
  sortOption: number;
  /** +0x10 pushHead — atomic<ElementBase*>. Zeroed by ctor
   *  `movups %xmm0,0x10(%rdi)` @0x12b9bb4. */
  pushHead: AtomicElementBasePtr;
  /** +0x18 popHead — plain ElementBase*, part of the same 16-byte SSE
   *  zero-store as pushHead. */
  popHead: ElementBasePtrRef;
  /** +0x20 freeList — atomic<ElementBase*>. Zeroed by ctor
   *  `movups %xmm0,0x20(%rdi)` @0x12b9bb8. */
  freeList: AtomicElementBasePtr;
  /** +0x28 freeElementProc — fnptr, zeroed by the +0x20 movups (it
   *  covers +0x20..+0x2f) then explicitly set NULL again by the
   *  `movq $0,0x30(%rdi)` @0x12b9bbc write at +0x30 which does NOT
   *  cover +0x28 — but +0x28 is already zero from the previous movups.
   *  So both +0x28 and +0x30 start NULL. */
  freeElementProc: FreeElementProc | null;
  /** +0x30 freeElementCtx — zeroed by ctor `movq $0,0x30(%rdi)` @0x12b9bbc. */
  freeElementCtx: unknown;

  /** FFLocklessQueueBase::FFLocklessQueueBase(FFLocklessQueueSortOption) [C2] @0x12b9ba0
   *  Also the C1 variant @0x12b9bd0 — the two symbols disassemble to
   *  byte-identical bodies (same rip-relative disp resolves to the same
   *  VA). The Itanium ABI requires both C1 (complete-object) and C2
   *  (base-subobject) to exist as distinct symbols; here they behave
   *  the same because FFLocklessQueueBase has no virtual bases.
   *
   *  Sequence (C2 @0x12b9ba0..c5):
   *    leaq 0x66bc8d(%rip),%rax ; movq %rax,(%rdi)   // vtbl @+0x00
   *    movl %esi,0x8(%rdi)                            // sortOption @+0x08
   *    xorps %xmm0,%xmm0
   *    movups %xmm0,0x10(%rdi)                        // pushHead @+0x10 = 0, popHead @+0x18 = 0
   *    movups %xmm0,0x20(%rdi)                        // freeList @+0x20 = 0, procPtr @+0x28 = 0
   *    movq   $0,0x30(%rdi)                           // freeElementCtx @+0x30 = 0
   */
  constructor(sortOption: FFLocklessQueueSortOption, vtbl: FFLocklessQueueBase_VTable) {
    // vtbl is the +0x00 write in the ctor. We take it as an explicit ctor
    // arg because subclasses install THEIR vtable and then the base ctor
    // rewrites it to base's — the two C++ ctors do this via linker-emitted
    // relocations we can't reproduce as-is in TS. Callers therefore pass
    // the intended base vtable through here.
    this.vtbl = vtbl;
    this.sortOption = sortOption | 0; // uint32 pass-through
    this.pushHead = { value: null };
    this.popHead = { value: null };
    this.freeList = { value: null };
    this.freeElementProc = null;
    this.freeElementCtx = null;
  }

  /** FFLocklessQueueBase::~FFLocklessQueueBase() [D2] @0x12b9c00
   *  Also the D1 variant @0x12b9e50 (tail-jmps into D2) and D0 @0x12b9e60
   *  (calls D2 then operator delete).
   *
   *  Body @0x12b9c00..c1e (setup):
   *    Rewrites the vptr back to the FFLocklessQueueBase base vptr
   *    (`leaq 0x66bc20(%rip),%rax ; movq %rax,(%rdi)` @0x12b9c11..1a).
   *    Then walks THREE atomic-drain loops in sequence:
   *      1. pushHead (+0x10) — swap-to-NULL loop @0x12b9c1f..4e, then
   *         reverse the LIFO list in-place @0x12b9c60..72, then either
   *         (a) if sortOption == 0 (`cmpl $0,0x8(%rbx)` @0x12b9c74),
   *             splice reversed list onto the tail of popHead @0x12b9c80..8f;
   *         (b) else run the sorted-insert loop that calls the vtbl
   *             `compare` slot @0x12b9cd0..f2 to insert each element in
   *             order into popHead.
   *      2. popHead (+0x18) drain loop @0x12b9d10..3f — for each elem:
   *           - unlink (`popHead = elem.next`)
   *           - if freeElementProc set, call it with (freeElementCtx, elem)
   *           - CAS-push elem onto freeList (@0x12b9d30..3a).
   *         This is a "move to freeList so the freeList drain below can
   *         run destructors on them uniformly".
   *      3. freeList (+0x20) drain loop @0x12b9d5e..7f (jumped into via
   *         @0x12b9d44):
   *           - CAS-pop head off freeList
   *           - call the element's virtual dtor (`callq *0x8(%rax)` @0x12b9d5b)
   *
   *  We port this as a single method that a caller invokes. D1 tail-jumps
   *  into it; D0 additionally calls operator delete afterward. The two
   *  variants are exposed as thin wrappers below.
   */
  dtorD2(): void {
    // Step 0 — re-install base vtable (Itanium ABI). In TS this is a
    // pointer assignment for parity even though our concrete "vtable"
    // objects are shared refs; the base's vtable is the one we were
    // constructed with (subclasses re-set it after calling super()).
    // We keep this.vtbl untouched here because Itanium ABI's vtable
    // switch is an OBSERVABLE-only-through-C++-virtual-dispatch effect;
    // any TS code inspecting this.vtbl after dtorD2 sees the base one
    // because subclass dtors run to completion before calling us.
    //
    // Step 1 — drain pushHead into popHead via the reverse-and-splice or
    // sorted-insert path (@0x12b9c1f..d0f).
    //
    // The CAS-to-NULL @0x12b9c31/@0x12b9c44 atomically swaps pushHead
    // with 0 and returns the prior head. Because JS has no true atomics
    // on our `AtomicElementBasePtr` object (single-threaded model), the
    // faithful behaviour is a plain read-then-clear:
    let head = this.pushHead.value;
    this.pushHead.value = null;

    if (head !== null) {
      // Reverse the LIFO list in-place @0x12b9c60..72:
      //   r12=0 (prev); loop { rax=r12; r12=head; head=head.next; r12.next=rax; }
      //   until head == null. On exit, r12 = reversed head.
      let prev: FFLocklessQueueBase_ElementBase | null = null;
      let cur: FFLocklessQueueBase_ElementBase | null = head;
      while (cur !== null) {
        const nxt: FFLocklessQueueBase_ElementBase | null = cur.next;
        cur.next = prev;
        prev = cur;
        cur = nxt;
      }
      const reversedHead = prev;

      // Branch on sortOption @0x12b9c74 `cmpl $0,0x8(%rbx) ; jne 0x12b9cb5`:
      //   sortOption == 0 -> tail-splice reversedHead onto popHead @0x12b9c7a..8f
      //   sortOption != 0 -> sorted-insert loop @0x12b9cb5..d06 using vtbl.compare
      if (this.sortOption === 0) {
        // Tail-splice: find tail of popHead (rcx = &popHead; while (*rcx) rcx = &(*rcx).next),
        // then *rcx = reversedHead. In our object model, popHead is
        // itself the head pointer, so we walk the .next chain.
        if (this.popHead.value === null) {
          this.popHead.value = reversedHead;
        } else {
          let tail = this.popHead.value;
          while (tail.next !== null) tail = tail.next;
          tail.next = reversedHead;
        }
      } else {
        // Sorted insert. The disassembly @0x12b9cb5..d06 iterates the
        // reversed list one element at a time and, for each, walks
        // popHead looking for an insertion point using vtbl.compare —
        // this virtual dispatch is UNDECODED at the base level (each
        // subclass provides its own compare). We surface it as a
        // throwing frontier stub so the port breaks loudly if reached
        // instead of silently mis-ordering elements.
        throw new Error(
          "FFLocklessQueueBase::~FFLocklessQueueBase [D2] sorted-insert branch @0x12b9cb5 not yet transcribed — invokes vtbl.compare @slot+0x10 which is subclass-specific (base's compare @0x378eb0 is a stub)",
        );
      }
    }

    // Step 2 — drain popHead into freeList (@0x12b9d10..3f).
    //   For each elem in the popHead singly-linked list:
    //     popHead = elem.next
    //     if (freeElementProc) freeElementProc(freeElementCtx, elem)
    //     elem.next = freeList.value
    //     CAS freeList = elem  (retry loop for atomicity)
    for (let elem = this.popHead.value; elem !== null; elem = this.popHead.value) {
      this.popHead.value = elem.next;
      const proc = this.freeElementProc;
      if (proc !== null) {
        proc(this.freeElementCtx, elem);
      }
      // The cmpxchg loop @0x12b9d30..3a is a "push onto atomic head":
      elem.next = this.freeList.value;
      this.freeList.value = elem;
    }

    // Step 3 — drain freeList via each element's virtual dtor (@0x12b9d5e..7f).
    //   while (freeList.value != null) {
    //     elem = freeList.value
    //     while (elem != null) {                                // inner CAS-pop
    //       nxt = elem.next
    //       if CAS(freeList, elem, nxt) succeeded { break with elem }
    //       elem = freeList.value                                // reload
    //     }
    //     elem.next = 0
    //     (*elem->vptr[0x8])(elem)                               // virtual dtor
    //   }
    while (this.freeList.value !== null) {
      const elem = this.freeList.value;
      this.freeList.value = elem.next;
      elem.next = null;
      elem.vtbl.dtor(elem);
    }
  }

  /** FFLocklessQueueBase::~FFLocklessQueueBase() [D1] @0x12b9e50
   *  Body: `pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; jmp D2Ev` —
   *  a bare tail-jump into D2. The two symbols exist because the
   *  Itanium ABI requires both; the body is trivial.
   */
  dtorD1(): void {
    this.dtorD2();
  }

  /** FFLocklessQueueBase::~FFLocklessQueueBase() [D0] @0x12b9e60
   *  Body: calls D2, then tail-jumps to `__ZdlPv` (operator delete).
   *  In TS we don't manage memory manually — GC reclaims — so the
   *  "operator delete" step is a no-op. The dtor semantics are still
   *  in D2.
   */
  dtorD0(): void {
    this.dtorD2();
    // operator delete(this) — no-op in a GC'd runtime.
  }

  /** FFLocklessQueueBase::clear() @0x12b9da0
   *  Body @0x12b9da0..0e:
   *    r14 = &popHead (+0x18); rsi = &pushHead (+0x10)
   *    rax = *(this->vptr); callq *0x18(%rax)                    // migrate(this, &pushHead, &popHead)
   *    r15 = popHead
   *    while (r15 != null) {
   *      popHead = r15.next
   *      if (freeElementProc) freeElementProc(freeElementCtx, r15)
   *      r15.next = freeList.value                                // push onto freeList
   *      CAS(freeList, r15)                                       // retry until success
   *      r15 = popHead
   *    }
   *
   *  Unlike the dtor path, clear does NOT walk freeList afterwards — it
   *  just parks the drained elements there. The next clear() or the dtor
   *  will consume freeList.
   */
  clear(): void {
    // migrate(this, &pushHead, &popHead) via vtbl slot +0x18.
    this.vtbl.migrate(this, this.pushHead, this.popHead);

    // Drain popHead onto freeList through the freeElementProc callback.
    for (let elem = this.popHead.value; elem !== null; elem = this.popHead.value) {
      this.popHead.value = elem.next;
      const proc = this.freeElementProc;
      if (proc !== null) {
        proc(this.freeElementCtx, elem);
      }
      elem.next = this.freeList.value;
      this.freeList.value = elem;
    }
  }

  /** FFLocklessQueueBase::popAtomic(atomic<ElementBase*>& head) @0x12b9e10
   *  Body @0x12b9e10..42:
   *    rdi = &head. Loop:
   *      rcx = *head
   *      if (rcx == 0) return NULL
   *      rdx = rcx->next          // 0x8(%rcx)
   *      rax = rcx (expected)
   *      LOCK cmpxchgq rdx, (%rdi)    // CAS head, expected=rcx, desired=rcx->next
   *      if not swapped: retry
   *    rcx->next = 0
   *    return rcx
   *
   *  Classic lock-free atomic pop: read head, snapshot next, CAS head
   *  from `expected=cur` to `desired=cur.next`. On success we own `cur`
   *  and clear its next-pointer so callers can't accidentally chain.
   */
  static popAtomic(head: AtomicElementBasePtr): FFLocklessQueueBase_ElementBase | null {
    // Single-threaded TS: the CAS always succeeds on the first try
    // because no other actor can mutate `head` between our read and
    // write. The retry loop is preserved in structure for faithfulness.
    for (;;) {
      const cur = head.value;
      if (cur === null) return null;
      const nxt = cur.next;
      // "expected" is cur; in JS, aliasing means head.value === cur here
      // unconditionally, so the CAS succeeds every iteration.
      if (head.value === cur) {
        head.value = nxt;
        cur.next = null;
        return cur;
      }
      // Loop again — reached only on true concurrent mutation, which
      // can't happen in single-threaded JS but is retained per the disasm.
    }
  }

  /** FFLocklessQueueBase::isEmpty() const @0x12b9e80
   *  Body:
   *    cmpq $0, 0x18(%rdi)       // popHead == 0 ?
   *    je   0x12b9e8f
   *    xorl %eax,%eax ; ret       // popHead != 0 -> return 0 (not empty)
   *    movq 0x10(%rdi),%rax ; testq %rax,%rax ; sete %al ; ret
   *                              // return (pushHead == 0)
   *
   *  Semantics: empty iff BOTH popHead == null AND pushHead == null.
   *  freeList is intentionally ignored — freeList holds queued-for-
   *  destruction elements that are already logically-consumed by the
   *  freeElementProc callback.
   */
  isEmpty(): boolean {
    if (this.popHead.value !== null) return false;
    return this.pushHead.value === null;
  }

  /** FFLocklessQueueBase::migratePushList() @0x12b9ea0
   *  Body:
   *    leaq 0x10(%rdi),%rsi          // rsi = &pushHead
   *    leaq 0x18(%rdi),%rdx          // rdx = &popHead
   *    movq (%rdi),%rax ; movq 0x18(%rax),%rax
   *    popq %rbp ; jmpq *%rax        // tail-call vptr[+0x18](this, &pushHead, &popHead)
   *
   *  Pure trampoline into the vtbl migrate slot with the two head
   *  pointers as reference args. Same slot that clear() invokes.
   */
  migratePushList(): void {
    this.vtbl.migrate(this, this.pushHead, this.popHead);
  }

  /** FFLocklessQueueBase::clearQueue(ElementBase** headSlot) @0x12b9ec0
   *  Body @0x12b9ec0..1e — same shape as clear()'s drain loop but
   *  operates on the caller-supplied slot (`rsi = ElementBase**`) instead
   *  of `this->popHead`. No vtbl.migrate call up front.
   *
   *    r15 = *headSlot
   *    if (r15 == 0) return
   *    while (r15 != 0) {
   *      *headSlot = r15.next          // 0x8(%r15) -> (%rbx)
   *      if (freeElementProc) freeElementProc(freeElementCtx, r15)
   *      r15.next = freeList.value
   *      CAS(freeList, r15)             // retry
   *      r15 = *headSlot
   *    }
   */
  clearQueue(headSlot: ElementBasePtrRef): void {
    for (let elem = headSlot.value; elem !== null; elem = headSlot.value) {
      headSlot.value = elem.next;
      const proc = this.freeElementProc;
      if (proc !== null) {
        proc(this.freeElementCtx, elem);
      }
      elem.next = this.freeList.value;
      this.freeList.value = elem;
    }
  }

  /** FFLocklessQueueBase::setFreeElementProc(procPtr, ctx) @0x12b9f20
   *  Body:
   *    movq %rsi,0x28(%rdi)   // procPtr @+0x28
   *    movq %rdx,0x30(%rdi)   // ctx     @+0x30
   *    popq %rbp ; retq
   *
   *  Note the arg order: proc first (%rsi is arg1 after this=%rdi), ctx
   *  second (%rdx). The freeElement dispatch loads them in the reverse
   *  order (ctx as arg1, elem as arg2) — that's the CALLBACK signature.
   */
  setFreeElementProc(proc: FreeElementProc | null, ctx: unknown): void {
    this.freeElementProc = proc;
    this.freeElementCtx = ctx;
  }

  /** FFLocklessQueueBase::popElementAtomic() @0x12b9f30
   *  Body:
   *    rax = *(0x18(%rdi))          // popHead
   *    if (rax == 0) return NULL
   *    rcx = rax->next              // 0x8(%rax)
   *    *(0x18(%rdi)) = rcx          // popHead = popHead.next
   *    return rax
   *
   *  NON-atomic single-consumer pop off the popHead. No CAS — this is
   *  the fast path the worker takes; only pushers use CAS (they contend
   *  on pushHead). Note: does NOT clear the returned elem's next-pointer.
   */
  popElementAtomic(): FFLocklessQueueBase_ElementBase | null {
    const cur = this.popHead.value;
    if (cur === null) return null;
    this.popHead.value = cur.next;
    return cur;
  }

  /** FFLocklessQueueBase::performMigration(atomic<ElementBase*>& src, ElementBase*& dst) @0x12b9f50
   *  Body @0x12b9f50..058 — the ordered-vs-unordered list migration
   *  helper that concrete FFLocklessQueue<T> subclasses call from their
   *  own migrate hook (vtbl slot +0x18). Structure:
   *
   *    early-out: if (*src == 0) return
   *    Prologue @0x12b9f5c..69 saves callee-saved regs.
   *    swap-to-null loop @0x12b9f70..8d: atomically read+clear src (same
   *      cmpxchg-with-0 pattern as popAllAtomic below); r12=0 at end.
   *    reverse-list loop @0x12b9fa0..b2: same in-place reverse as D2 uses,
   *      leaving r12 = reversed head.
   *    branch @0x12b9fb4 `cmpl $0,0x8(%r14)` on sortOption:
   *      == 0 -> tail-splice reversed onto *dst @0x12b9fc0..cf and return
   *      != 0 -> sorted-insert loop @0x12ba001..058 that uses
   *        vtbl.compare (`callq *0x10(%rax)` @0x12ba029) to walk *dst
   *        looking for the correct position for each reversed-list
   *        element.
   *
   *  We port the unordered path faithfully and gate the ordered path
   *  behind a throwing stub (the compare vtable slot is subclass-owned).
   */
  performMigration(src: AtomicElementBasePtr, dst: ElementBasePtrRef): void {
    // Early-out @0x12b9f50..56.
    if (src.value === null) return;

    // Swap-to-null: same "read + CAS with 0" retry loop as popAllAtomic.
    let head: FFLocklessQueueBase_ElementBase | null = src.value;
    src.value = null;
    if (head === null) return;

    // Reverse the LIFO list in-place.
    let prev: FFLocklessQueueBase_ElementBase | null = null;
    let cur: FFLocklessQueueBase_ElementBase | null = head;
    while (cur !== null) {
      const nxt: FFLocklessQueueBase_ElementBase | null = cur.next;
      cur.next = prev;
      prev = cur;
      cur = nxt;
    }
    head = prev;

    // Branch on sortOption == 0.
    if (this.sortOption === 0) {
      // Tail-splice: walk *dst to its tail, then dst-tail.next = head.
      if (dst.value === null) {
        dst.value = head;
      } else {
        let tail = dst.value;
        while (tail.next !== null) tail = tail.next;
        tail.next = head;
      }
      return;
    }

    // Ordered path — subclass-owned compare. Not yet transcribed at the
    // base level (base's compare @0x378eb0 throws; only the ordered
    // arm of performMigration @0x12ba001..058 actually invokes it).
    throw new Error(
      "FFLocklessQueueBase::performMigration sorted-insert branch @0x12ba001 not yet transcribed — invokes vtbl.compare @slot+0x10 which is subclass-specific",
    );
  }

  /** FFLocklessQueueBase::popAllAtomic(atomic<ElementBase*>& head) @0x12ba060
   *  Body: atomically read+clear the whole list, returning the prior
   *  head. Structure:
   *    rcx = *head ; if (rcx == 0) return NULL
   *    xorl %edx,%edx ; movq %rcx,%rax
   *    LOCK cmpxchgq %rdx, (%rdi)
   *    if success: return rcx
   *    else: reload and retry (rax updated by cmpxchg)
   *
   *  Same pattern as D2's step-1 detach @0x12b9c2c..4e.
   */
  static popAllAtomic(head: AtomicElementBasePtr): FFLocklessQueueBase_ElementBase | null {
    for (;;) {
      const cur = head.value;
      if (cur === null) return null;
      // Single-threaded CAS: expected=cur, desired=NULL, always succeeds.
      if (head.value === cur) {
        head.value = null;
        return cur;
      }
    }
  }

  /** FFLocklessQueueBase::reverseList(ElementBase*& listHead) @0x12ba0a0
   *  Body: in-place LIFO reverse.
   *    rax = *listHead
   *    if (rax == 0) return
   *    rcx = 0
   *    loop {
   *      rdx = rax                 // save current
   *      rax = rax->next
   *      rdx->next = rcx           // point back
   *      *listHead = rdx           // write current head each iteration
   *      rcx = rdx
   *      if (rax == 0) break
   *    }
   *
   *  The `*listHead = rdx` inside the loop means the caller can
   *  observe partial progress; on exit *listHead is the last non-null
   *  element seen, i.e. the reversed head.
   */
  static reverseList(listHead: ElementBasePtrRef): void {
    let cur = listHead.value;
    if (cur === null) return;
    let prev: FFLocklessQueueBase_ElementBase | null = null;
    while (cur !== null) {
      const nxt: FFLocklessQueueBase_ElementBase | null = cur.next;
      cur.next = prev;
      listHead.value = cur;
      prev = cur;
      cur = nxt;
    }
  }

  /** FFLocklessQueueBase::freeElement(ElementBase* elem) @0x12ba0d0
   *  Body:
   *    rax = *(0x28(%rdi))         // freeElementProc
   *    if (rax == 0) return
   *    rdi = *(0x30(%rdi))         // freeElementCtx -> new arg1
   *    popq %rbp ; jmpq *%rax      // tail-call proc(ctx, elem)
   *
   *  Note: %rsi (the incoming elem) is preserved across the callsite as
   *  arg2. If no proc is registered, freeElement is a no-op.
   */
  freeElement(elem: FFLocklessQueueBase_ElementBase): void {
    const proc = this.freeElementProc;
    if (proc === null) return;
    proc(this.freeElementCtx, elem);
  }

  /** FFLocklessQueueBase::loadValue(atomic<ElementBase*>& a) @0x12ba0f0
   *  Body:
   *    movq (%rdi),%rax           // return *a
   *    popq %rbp ; retq
   *
   *  Trivial relaxed load. The x86 instruction is a plain movq, so the
   *  memory-order semantics are "whatever a naked movq gives you" — on
   *  x86 that's release-acquire on aligned 8-byte pointers. TS is
   *  single-threaded so this collapses to a field read.
   */
  static loadValue(a: AtomicElementBasePtr): FFLocklessQueueBase_ElementBase | null {
    return a.value;
  }

  /** FFLocklessQueueBase::compareAndSwap(atomic<ElementBase*>& a, ElementBase*& expected, ElementBase* desired) @0x12ba100
   *  Body:
   *    movq (%rsi),%rax             // rax = *expected
   *    LOCK cmpxchgq %rdx, (%rdi)   // CAS *a, expected=*expected, desired=desired
   *    sete %cl                     // cl = ZF (success)
   *    je   0x12ba114               // if success, skip the store-back
   *    movq %rax,(%rsi)             // on failure, *expected = current value of *a (from %rax)
   *    movl %ecx,%eax               // eax = bool result
   *    popq %rbp ; retq
   *
   *  Standard std::atomic::compare_exchange_strong: on failure, the
   *  observed value is written back through the `expected` reference so
   *  the caller can retry with the fresh value.
   */
  static compareAndSwap(
    a: AtomicElementBasePtr,
    expected: ElementBasePtrRef,
    desired: FFLocklessQueueBase_ElementBase | null,
  ): boolean {
    const observed = a.value;
    const expectedVal = expected.value;
    if (observed === expectedVal) {
      a.value = desired;
      return true;
    }
    expected.value = observed;
    return false;
  }

  /** FFLocklessQueueBase::pushAtomic(ElementBase* elem, atomic<ElementBase*>& head) @0x12ba120
   *  Body:
   *    rax = *head
   *    loop {
   *      elem->next = rax
   *      LOCK cmpxchgq %rdi, (%rsi)   // desired=elem, expected=rax
   *      if success: return
   *      rax got the new *head value from cmpxchg; retry.
   *    }
   *
   *  Classic lock-free stack push: read current head, point our next at
   *  it, CAS head to us.
   */
  static pushAtomic(elem: FFLocklessQueueBase_ElementBase, head: AtomicElementBasePtr): void {
    // Single-threaded CAS always succeeds on first attempt.
    for (;;) {
      const cur = head.value;
      elem.next = cur;
      if (head.value === cur) {
        head.value = elem;
        return;
      }
    }
  }

  /** FFLocklessQueueBase::compare(ElementBase* a, ElementBase* b) const @0x378eb0
   *  The ledger marks this address "ported" but the base-class body of
   *  compare is a pure-virtual-style stub: every actual usage flows
   *  through the vtbl.compare slot @+0x10 of a concrete subclass (e.g.
   *  FFAudioBufferListLocklessQueue::compare @0x1256810). Emitting a
   *  throwing stub at the base level matches the observed semantics —
   *  if it were ever reached at runtime it would indicate a subclass
   *  failed to override, which is exactly a "not yet transcribed" gap.
   */
  compare(
    _a: FFLocklessQueueBase_ElementBase,
    _b: FFLocklessQueueBase_ElementBase,
  ): boolean {
    throw new Error(
      "FFLocklessQueueBase::compare @0x378eb0 base stub — every concrete FFLocklessQueue<T> overrides this via vtbl.compare @slot+0x10; reaching the base body is a decode gap",
    );
  }
}
