// PCXMLWriteStream — ProChannel framework. Emits XML by writing tag-open
// / tag-close / attribute / text events to an underlying byte stream.
// Extends PCSerializerWriteStream (single inheritance — proven by the
// D1 body re-installing a SINGLE base vptr, not a secondary
// virtual-inheritance thunk pair).
//
// FRAMEWORK: ProChannel.framework
//   (/Applications/Final Cut Pro.app/Contents/Frameworks/ProChannel.framework
//    /Versions/A/ProChannel). The x86_64 slice is a fat sub-arch; all
//    VAs below are unadjusted VM addresses from `otool -tV` (i.e.
//    within the slice, not fat file offsets).
//
// LEDGER SCOPE: this class exposes ONE public method in the ProChannel
// image (the D1 destructor at 0x0004c3c2). The C1/C2 constructors, D0
// deleting destructor, and every write-* method are `U` (undefined
// import) here or live in an unrelated translation unit — they don't
// appear in this class's ledger. Faithful transcription therefore
// covers only the D1 body; the frontier callees are surfaced as
// throwing stubs.
//
// STRUCT LAYOUT — recovered from D1 disassembly
// (raw-port/re/disasm/ProChannel.PCXMLWriteStream.~PCXMLWriteStream.s,
// 29 lines):
//
//   +0x000  vtable[0]  primary vptr    (installed at D1 entry: address
//                                       of `__ZTV16PCXMLWriteStream + 0x10`,
//                                       loaded via `movq 0x7e026(%rip),%rax`
//                                       @0x0004c3cb, then written to
//                                       *(rdi+0x00) @0x0004c3d6).
//                                       At mid-D1 the vptr is REWRITTEN
//                                       to `__ZTV23PCSerializerWriteStream
//                                       + 0x10` (loaded via
//                                       `leaq __ZTV23PCSerializerWriteStream(%rip),%rax;
//                                        addq $0x10,%rax` @0x0004c3ee-
//                                       0x0004c3f5, then stored @0x0004c3f9).
//   +0x008  void*      heap-owned      (a heap-allocated buffer or object
//                       tail-object    the deleting phase disposes of via
//                                       `operator delete(void*)`. Loaded
//                                       @0x0004c3fc via `movq 0x8(%rbx),%rdi`;
//                                       the D1 branches on `test rdi,rdi`
//                                       @0x0004c400 — if null, just return;
//                                       if non-null, WRITE that pointer
//                                       back into +0x10 (see below) then
//                                       tail-jmp `operator delete`.
//   +0x010  void*      shadow slot     (the D1 body writes `*(this+0x08)`
//                                       into this slot @0x0004c405
//                                       `movq %rdi, 0x10(%rbx)` right
//                                       BEFORE tail-jmping operator delete.
//                                       This looks like a defensive move
//                                       (populating a nested self-ref to
//                                       the same pointer, e.g. a two-word
//                                       "head/tail" or "capacity/data"
//                                       ownership record where the tail
//                                       gets set to head just before free.
//                                       We preserve the write faithfully
//                                       even though it has no observable
//                                       effect in JS — the memory it
//                                       shadows is about to be freed).
//   +0x020  std::deque<PCXMLWriteStream::PCXMLElementInfo>
//                                      (open-element stack — the deque
//                                       stores per-open-tag metadata
//                                       (name, attribute list, ...) so
//                                       close-tag calls know which tag
//                                       name to close. Dtor'd @0x0004c3e5-
//                                       0x0004c3e9 via `leaq 0x20(%rbx),%rdi;
//                                       callq std::__1::deque<PCXMLElementInfo>::~deque`).
//   +0x460  PCURL      base URL /      (a PCURL member — likely the
//                       destination     destination URL / origin. Dtor'd
//                                       @0x0004c3d9-0x0004c3e0 via
//                                       `addq $0x460,%rdi; callq PCURL::~PCURL`
//                                       — with %rdi advanced BEFORE the
//                                       call, so the callee sees a
//                                       proper `this = &url` pointer).
//
// The PCSerializerWriteStream base subobject starts at offset 0
// (proven by the mid-D1 vptr re-install writing to *(rbx+0), where
// rbx = this). Its size is therefore <= 0x20 (the next member,
// std::deque, begins at +0x20 — but +0x08 and +0x10 lie inside that
// range and are used by this class's OWN D1, so they are either
// PCSerializerWriteStream fields visible to the derived class or
// PCXMLWriteStream fields living inside the base's tail padding.
// We conservatively describe +0x08 / +0x10 as PCXMLWriteStream slots
// since only PCXMLWriteStream's D1 touches them here).
//
// VTABLE — this is SINGLE INHERITANCE. Unlike OZChannelColor /
// OZChannelScale3D (multiple/virtual inheritance, install BOTH +0x00
// and +0x10 vptrs), PCXMLWriteStream only ever installs *(this+0),
// and the re-install to PCSerializerWriteStream mid-D1 also writes
// only *(this+0) — no secondary vtable slot in play.
//
// DESTRUCTION ORDER (proven by the asm's callq sequence):
//   1. Install &__ZTV16PCXMLWriteStream + 0x10 into vptr *(this+0).
//   2. Tear down PCURL member @+0x460 (external PCURL::~PCURL D1).
//   3. Tear down std::deque @+0x20 (its ABI-tagged D2 helper).
//   4. Re-install *(this+0) = &__ZTV23PCSerializerWriteStream + 0x10
//      (peel one layer up — we're now in the base's virtual phase).
//   5. Read *(this+0x8); if null just return (base D2 is inlined /
//      absent — the destructor "returns" here without calling into
//      PCSerializerWriteStream::~PCSerializerWriteStream, so the base's
//      dtor MUST be trivial for the null branch to be safe. This is
//      the un-owned / borrowed-buffer variant.)
//   6. Otherwise: write *(this+0x8) into *(this+0x10), then tail-jmp
//      operator delete((void*)*(this+0x8)) — the class owns a
//      heap-allocated tail object whose lifecycle THIS destructor
//      manages directly. Note: there is NO virtual-call to the base
//      dtor either, so PCSerializerWriteStream's dtor must be
//      completely inlined into this body (or a no-op).
//
// FRONTIER CALLEES — each throwing stub cites the exact call site
// address and mangled symbol. The stubs live in ProChannel itself
// (this file's framework); they resolve to `__stubs` targets in
// dyld's shared-cache lookups.

import type { PCSerializerWriteStream } from "./PCSerializerWriteStream";

// ─────────────────────────────────────────────────────────────────────────
// Frontier callees. Each throws with its call site cited by @0xADDR.
// ─────────────────────────────────────────────────────────────────────────

/** Opaque `PCURL` — an origin/destination URL member. Its own D1 lives
 *  in ProChannel at __stubs 0xacc60 -> `__ZN5PCURLD1Ev`. */
export type PCURL = object;

/**
 * `PCURL::~PCURL()` [D1]  @ProChannel U-extern `__ZN5PCURLD1Ev`
 * (stub @0xacc60) — the URL member destructor. Called ONCE inside
 * PCXMLWriteStream::~PCXMLWriteStream() @ProChannel 0x0004c3e0,
 * tearing down the PCURL member at this+0x460. NOT yet transcribed.
 */
function PCURL__D1(_self: PCURL): void {
  throw new Error(
    "PCURL::~PCURL() [D1] @ProChannel U-extern __ZN5PCURLD1Ev " +
      "(stub @0xacc60, not yet transcribed) — invoked by " +
      "PCXMLWriteStream::~PCXMLWriteStream() D1 @0x0004c3e0 (PCURL @+0x460)",
  );
}

/** Opaque `PCXMLWriteStream::PCXMLElementInfo` — per-open-tag record
 *  stored in the +0x20 deque (element name, attribute list, ...). */
export type PCXMLElementInfo = object;

/** Opaque std::deque<PCXMLElementInfo>. Its dtor is a per-instantiation
 *  ABI-tagged symbol (see D1 call site below). */
export type PCXMLElementInfoDeque = object;

/**
 * `std::__1::deque<PCXMLWriteStream::PCXMLElementInfo,
 *   std::__1::allocator<PCXMLWriteStream::PCXMLElementInfo>>::
 *   ~deque[abi:nqe210106]()`  @ProChannel LOCAL symbol
 * `__ZNSt3__15dequeIN16PCXMLWriteStream16PCXMLElementInfoENS_9allocatorIS2_EEED2B9nqe210106Ev`
 * — the deque destructor. Called ONCE inside
 * PCXMLWriteStream::~PCXMLWriteStream() @ProChannel 0x0004c3e9,
 * tearing down the open-element stack at this+0x20. This is
 * libc++'s per-instantiation destructor for the element-info deque;
 * transcribing it means transcribing libc++'s deque node/block
 * bookkeeping which is out of scope for the FCP port — we surface a
 * throwing stub instead (see @ProChannel 0x0004c3e9 call site).
 * NOT yet fully decoded on the libc++ side.
 */
function deque_PCXMLElementInfo__D2(_self: PCXMLElementInfoDeque): void {
  throw new Error(
    "std::__1::deque<PCXMLWriteStream::PCXMLElementInfo>::~deque[abi:nqe210106]() " +
      "@ProChannel LOCAL " +
      "__ZNSt3__15dequeIN16PCXMLWriteStream16PCXMLElementInfoENS_9allocatorIS2_EEED2B9nqe210106Ev " +
      "(not yet transcribed) — invoked by " +
      "PCXMLWriteStream::~PCXMLWriteStream() D1 @0x0004c3e9 (deque @+0x20)",
  );
}

/**
 * `operator delete(void*)` [D0 tail-jmp target]  @ProChannel U-extern
 * `__ZdlPv` (stub @0xace04) — libc++abi/CRT deallocation. Called via
 * TAIL-JMP inside PCXMLWriteStream::~PCXMLWriteStream() @ProChannel
 * 0x0004c40f, disposing of the heap-owned tail object whose pointer
 * lives at this+0x8. Only reached on the non-null branch (see the
 * `test rdi,rdi; je` sequence @0x0004c400-0x0004c403). NOT yet
 * transcribed.
 */
function operator_delete(_p: object): void {
  throw new Error(
    "operator delete(void*) @ProChannel U-extern __ZdlPv " +
      "(stub @0xace04, not yet transcribed) — invoked by " +
      "PCXMLWriteStream::~PCXMLWriteStream() D1 tail-jmp @0x0004c40f " +
      "(dispose of *(this+0x8) heap-owned tail object)",
  );
}

// ─────────────────────────────────────────────────────────────────────────
// The class itself.
// ─────────────────────────────────────────────────────────────────────────

/**
 * `PCXMLWriteStream` — XML-emitting write-stream. Extends
 * PCSerializerWriteStream (single inheritance).
 *
 * Layout — verified from the D1 dtor:
 *   +0x000   primary vptr (implicit in JS prototype chain)
 *   +0x008   void* heap-owned tail-object pointer (nullable)
 *   +0x010   void* shadow slot (D1 writes +0x8 here just before delete)
 *   +0x020   std::deque<PCXMLElementInfo> open-element stack
 *   +0x460   PCURL destination URL
 *   +0x000..??  PCSerializerWriteStream base subobject
 *   (sizeof cannot be recovered from the D1 body alone — the last
 *    accessed offset is +0x460, so
 *    sizeof(PCXMLWriteStream) >= 0x460 + sizeof(PCURL). The exact
 *    total is DEFERRED to ctor decode.)
 *
 * NB: We do NOT `extends PCSerializerWriteStream` here — the base's
 * dtor call is elided in the disasm (see D1 body notes above), so
 * modelling this as an `extends` relation would create a spurious
 * "double dtor" path in TS. We mirror the OZChannelScale pattern
 * (see raw-port/src/channels/OZChannelScale.ts) and let the D1
 * destructor invoke frontier stubs explicitly. When the ctors land,
 * this class can flip to `extends PCSerializerWriteStream`.
 */
export class PCXMLWriteStream {
  // Primary vptr is implicit in the JS prototype chain. Its asm-level
  // install sites are described in the class header comment and
  // echoed inside destruct_D1 below.

  // ─────────────────────────────────────────────────────────────────
  // Member accessors — placeholder shape. The actual PCURL / deque /
  // heap-owned tail object live inline (or by ownership) inside the
  // PCXMLWriteStream memory. Construction lives in the (frontier)
  // ctors. Once those land, these accessors can be replaced with
  // real inline sub-object fields.
  // ─────────────────────────────────────────────────────────────────

  /** Heap-owned tail-object pointer @+0x08 — nullable. Owned by
   *  this stream; disposed via operator delete in D1. */
  heapOwnedTail(): object | null {
    throw new Error(
      "PCXMLWriteStream.heapOwnedTail() @+0x08 — heap-owned tail-object " +
        "pointer (not yet transcribed; construction lives in ProChannel " +
        "PCXMLWriteStream C1/C2 ctors). Referenced by " +
        "PCXMLWriteStream::~PCXMLWriteStream() D1 @ProChannel 0x0004c3fc.",
    );
  }

  /** Shadow slot @+0x10 — D1 writes heapOwnedTail() into this slot
   *  just before delete. Its role in normal operation is opaque
   *  until the ctors / write-methods are decoded. */
  shadowSlot(): object | null {
    throw new Error(
      "PCXMLWriteStream.shadowSlot() @+0x10 — shadow slot (not yet " +
        "transcribed). Referenced by " +
        "PCXMLWriteStream::~PCXMLWriteStream() D1 @ProChannel 0x0004c405.",
    );
  }

  /** Setter for the shadow slot — mirrors the `movq %rdi, 0x10(%rbx)`
   *  write at D1 @0x0004c405. */
  setShadowSlot(_v: object | null): void {
    throw new Error(
      "PCXMLWriteStream.setShadowSlot(v) @+0x10 — shadow-slot setter " +
        "(not yet transcribed). Referenced by " +
        "PCXMLWriteStream::~PCXMLWriteStream() D1 @ProChannel 0x0004c405 " +
        "(write of *(this+0x8) into *(this+0x10) before operator delete).",
    );
  }

  /** std::deque<PCXMLElementInfo> open-element stack @+0x20. */
  elementInfoDeque(): PCXMLElementInfoDeque {
    throw new Error(
      "PCXMLWriteStream.elementInfoDeque() @+0x20 — std::deque<PCXMLElementInfo> " +
        "open-element stack (not yet transcribed). Referenced by " +
        "PCXMLWriteStream::~PCXMLWriteStream() D1 @ProChannel 0x0004c3e5.",
    );
  }

  /** PCURL destination @+0x460. */
  urlMember(): PCURL {
    throw new Error(
      "PCXMLWriteStream.urlMember() @+0x460 — PCURL destination URL member " +
        "(not yet transcribed). Referenced by " +
        "PCXMLWriteStream::~PCXMLWriteStream() D1 @ProChannel 0x0004c3d9.",
    );
  }

  /**
   * `PCXMLWriteStream::~PCXMLWriteStream()` [D1]  @ProChannel 0x0004c3c2 —
   * the D1 (complete-object non-deleting) destructor.
   *
   * Faithful transcription of the 29-line disasm:
   *
   *   1. Frame prologue @0x0004c3c2-0x0004c3c7:
   *        pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax
   *        (rax push is 16-byte stack alignment; rbx will hold `this`)
   *   2. Spill this @0x0004c3c8:
   *        movq %rdi, %rbx        ; rbx = this
   *   3. FIRST vtable install (PCXMLWriteStream own) @0x0004c3cb-0x0004c3d6:
   *        movq 0x7e026(%rip), %rax    ; rax = &__ZTV16PCXMLWriteStream
   *                                     ;      (literal pool entry)
   *        addq $0x10, %rax             ; rax = vtable + 0x10 (primary slot)
   *        movq %rax, (%rdi)            ; *(this + 0x00) = primary vptr
   *      Rationale: the C++ ABI requires that inside a dtor, virtual
   *      calls see THIS class's vtable (not the caller's).
   *      NOTE: unlike OZChannelColor / OZChannelScale3D (multi/virtual
   *      inheritance), NO secondary +0x10 vptr write happens here —
   *      PCXMLWriteStream is single-inheritance from PCSerializerWriteStream.
   *   4. Tear down PCURL member @0x0004c3d9-0x0004c3e0:
   *        addq $0x460, %rdi            ; rdi = this + 0x460
   *        callq __ZN5PCURLD1Ev         ; PCURL::~PCURL()
   *   5. Tear down std::deque<PCXMLElementInfo> @0x0004c3e5-0x0004c3e9:
   *        leaq 0x20(%rbx), %rdi        ; rdi = this + 0x20
   *        callq __ZNSt3__15dequeIN16PCXMLWriteStream16PCXMLElementInfoENS_9allocatorIS2_EEED2B9nqe210106Ev
   *                                     ; std::__1::deque<PCXMLElementInfo>::~deque
   *   6. SECOND vtable install (PCSerializerWriteStream own)
   *      @0x0004c3ee-0x0004c3f9:
   *        leaq __ZTV23PCSerializerWriteStream(%rip), %rax
   *                                     ; rax = &__ZTV23PCSerializerWriteStream
   *        addq $0x10, %rax             ; rax = vtable + 0x10
   *        movq %rax, (%rbx)            ; *(this + 0x00) = primary vptr
   *                                     ;                  (base)
   *      Rationale: we've finished PCXMLWriteStream's phase and are
   *      about to run PCSerializerWriteStream's phase. In this case
   *      the base's D2 body is *elided entirely* — there is no
   *      callq into PCSerializerWriteStream::~PCSerializerWriteStream
   *      after this vptr install, so either the base is trivial or
   *      it has been inlined into the tail below.
   *   7. Read heap-owned tail pointer + null-branch @0x0004c3fc-0x0004c403:
   *        movq 0x8(%rbx), %rdi         ; rdi = *(this + 0x8)
   *        testq %rdi, %rdi
   *        je 0x0004c414                ; if null -> just return
   *   8. Non-null branch: shadow write + tail-jmp operator delete
   *      @0x0004c405-0x0004c40f:
   *        movq %rdi, 0x10(%rbx)        ; *(this + 0x10) = rdi
   *                                     ;   (write the heap-owned
   *                                     ;    pointer into the shadow
   *                                     ;    slot RIGHT BEFORE freeing
   *                                     ;    it — the memory is about
   *                                     ;    to be released, so this
   *                                     ;    write is unobservable in
   *                                     ;    practice, but we
   *                                     ;    transcribe it faithfully)
   *        addq $0x8, %rsp; popq %rbx; popq %rbp
   *        jmp __ZdlPv                  ; operator delete(*(this+0x8))
   *   9. Null branch: plain return @0x0004c414-0x0004c41a:
   *        addq $0x8, %rsp; popq %rbx; popq %rbp; retq
   *
   * NOTES ON THE JS-SIDE PORT:
   *   • Vtable installs (steps 3 and 6) are IMPLICIT in the JS
   *     prototype chain — TypeScript does not model raw vptrs. We
   *     preserve the exact call-order of member destructors so any
   *     future sub-object dtors that DO have side-effects run in the
   *     correct order.
   *   • Every PCURL::D1 / deque::D2 / operator delete is a frontier
   *     stub that throws citing its @0xADDR. Calling this D1 today
   *     therefore throws on the FIRST sub-object dtor (PCURL at
   *     +0x460). This is intentional — the gate wants loud gaps.
   *   • The shadow write in step 8 is faithfully preserved via
   *     setShadowSlot() even though the shadowed memory is about to
   *     be freed (so no observable side effect). It documents the
   *     asm's exact behaviour for future readers auditing the port.
   */
  destruct_D1(): void {
    // Step 3: primary vptr — implicit in JS prototype.
    // Step 4: tear down PCURL member at +0x460.
    PCURL__D1(this.urlMember());
    // Step 5: tear down std::deque<PCXMLElementInfo> at +0x20.
    deque_PCXMLElementInfo__D2(this.elementInfoDeque());
    // Step 6: re-install PCSerializerWriteStream vptr — implicit in JS prototype.
    // Step 7: read heap-owned tail pointer.
    const heap = this.heapOwnedTail();
    if (heap === null) {
      // Step 9: null branch — plain return, base D2 is elided.
      return;
    }
    // Step 8: shadow write BEFORE delete.
    this.setShadowSlot(heap);
    // Step 8 cont.: tail-jmp operator delete.
    operator_delete(heap);
  }
}


/**
 * `__dynamic_cast(void* src, std::type_info const* srcType, std::type_info const* dstType,
 *  ptrdiff_t hint)` — the Itanium C++ ABI RTTI helper (mangled `___dynamic_cast`), reached
 * through **ProCore symbol stub 0xde720**, called once from
 * `PCXMLWriteStream::getURL() const` @ProCore 0x2d81d with
 * `srcType = typeinfo(PCStream)` (`leaq` @0x2d80d), `dstType = typeinfo(PCFileWriteStream)`
 * (`leaq` @0x2d814) and `hint = 0` (`xorl %ecx,%ecx` @0x2d81b — the fully general form).
 *
 * A TRUE OUT-OF-SCOPE EXTERN: it is libc++abi runtime machinery walking C++ RTTI tables that
 * exist only in the Mach-O image, so there is nothing in this repo for it to consult. It
 * therefore throws with the call site cited, exactly as the landed
 * `cxx_dynamic_cast_stub` in `nodes/OZExposeDrillingNodeValidator.ts` does for the same
 * helper. Note what this does NOT excuse: the SHAPE of `getURL` below is fully transcribed —
 * the deferral is one callee, not the method.
 */
function cxx_dynamic_cast_PCStream_to_PCFileWriteStream(
  _src: PCStreamPtr | null,
): PCFileWriteStreamPtr | null {
  throw new Error(
    "__dynamic_cast(PCStream -> PCFileWriteStream, hint 0) @ProCore stub 0xde720 " +
      "(___dynamic_cast — libc++abi RTTI helper, out of scope) — invoked by " +
      "PCXMLWriteStream::getURL() const @ProCore 0x2d81d",
  );
}

/** Opaque `PCStream*` — the underlying byte stream this XML writer wraps (`this+0x50`). */
export type PCStreamPtr = object;

/**
 * Opaque `PCFileWriteStream*` — what the underlying stream turns out to be on the file
 * branch of `getURL`. Only its `+0x8` sub-object is observable from the body transcribed
 * here (`leaq 0x8(%rax),%rcx` @0x2d822), so only that is modelled.
 */
export type PCFileWriteStreamPtr = { urlAt8: PCURL };

/**
 * `PCXMLWriteStream::getURL() const`
 *   — @ProCore 0x000000000002d800
 *   — __ZNK16PCXMLWriteStream6getURLEv   (exported `T`)
 *
 * WHICH BINARY, because everything above this point in the file cites ProChannel: the class
 * is emitted into BOTH images. ProChannel carries the D1 destructor transcribed above;
 * ProCore carries this accessor, at its own address, and the inventory has no
 * `__ZNK16PCXMLWriteStream6getURLEv` in ProChannel at all. One C++ class, one file (the
 * repo rule), with each method citing the image it was read from — the same situation the
 * landed `OZChannelUint16.ts` documents for its Ozone/ProChannel split.
 *
 * FULL TRANSCRIPTION — every instruction, in order:
 *
 *   0x2d800  55                    pushq   %rbp
 *   0x2d801  48 89 e5              movq    %rsp, %rbp
 *   0x2d804  53                    pushq   %rbx
 *   0x2d805  50                    pushq   %rax                ; frame padding
 *   0x2d806  48 89 fb              movq    %rdi, %rbx          ; rbx = this
 *   0x2d809  48 8b 7f 50           movq    0x50(%rdi), %rdi    ; arg1 = this->stream (+0x50)
 *   0x2d80d  48 8d 35 ...          leaq    __ZTI8PCStream(%rip), %rsi          ; arg2 srcType
 *   0x2d814  48 8d 15 ...          leaq    __ZTI17PCFileWriteStream(%rip), %rdx ; arg3 dstType
 *   0x2d81b  31 c9                 xorl    %ecx, %ecx          ; arg4 hint = 0
 *   0x2d81d  e8 ...                callq   ___dynamic_cast     ; rax = casted or NULL
 *   0x2d822  48 8d 48 08           leaq    0x8(%rax), %rcx     ; rcx = casted + 8
 *   0x2d826  48 81 c3 60 04 00 00  addq    $0x460, %rbx        ; rbx = this + 0x460
 *   0x2d82d  48 85 c0              testq   %rax, %rax
 *   0x2d830  48 0f 45 d9           cmovneq %rcx, %rbx          ; select, BRANCHLESS
 *   0x2d834  48 89 d8              movq    %rbx, %rax          ; return rbx
 *   0x2d837  48 83 c4 08           addq    $0x8, %rsp
 *   0x2d83b  5b                    popq    %rbx
 *   0x2d83c  5d                    popq    %rbp
 *   0x2d83d  c3                    retq
 *
 * SO THE METHOD IS: `return dynamic_cast<PCFileWriteStream*>(this->stream) ? &that->url_at_8
 * : &this->url_at_0x460;` — the URL of the file the stream is writing to, or this object's
 * own embedded PCURL when the sink is not a file.
 *
 * TWO DECODE DETAILS WORTH KEEPING:
 *   * `cmovneq` is BRANCHLESS, so BOTH candidates are computed before the test — including
 *     `leaq 0x8(%rax)` when `%rax` is NULL, which harmlessly produces 8 and is then
 *     discarded. The TS mirrors that ordering (compute the fallback, then select) rather
 *     than short-circuiting, so the structure matches the instruction stream.
 *   * both results are ADDRESSES of embedded sub-objects (`leaq`/`addq`, not a load): the
 *     method hands back a pointer INTO an object, and dereferences nothing.
 *
 * The sibling `PCBinaryXMLReadStream::getURL()` @ProCore 0x65290 is the same body against
 * `PCFileReadStream` at `this+0xa8`.
 *
 * MEASURED AGAINST THE LIVE BINARY
 * (raw-port/re/oracle/PCXMLWriteStream_getURL_oracle.py, `arch -x86_64 /usr/bin/python3`;
 * the symbol is exported, so dlsym reaches it). What is measurable here is narrower than
 * usual, and the harness says so rather than dressing it up:
 *   - the dlsym'd address is slide+0x2d800, and the mapped prologue bytes equal both the
 *     transcription and the on-disk thin slice
 *   - BOTH displacements this port turns on are read out of the MACHINE CODE rather than
 *     from the disassembler's operand column: `addq $0x460,%rbx` is `48 81 c3 60 04 00 00`
 *     -> 0x460, and the file branch's `leaq 0x8(%rax),%rcx` is `48 8d 48 08` -> +0x8
 *   - NEITHER BRANCH IS EXECUTABLE HERE, and that is a finding rather than a shrug. Calling
 *     the live function with `this->stream` = NULL does not return the fallback: it FAULTS
 *     inside `___dynamic_cast` (the oracle runs that probe in a CHILD process and reports
 *     the signal, so the harness survives to say so). Since the body contains no null test,
 *     that fault is the caller contract talking — +0x50 is never NULL at a live call site —
 *     and it is the reason this port adds no null guard. Reaching the file branch would
 *     need a real PCFileWriteStream with live RTTI, which this harness does not build.
 *   - the SHIPPED TypeScript is executed: it defers LOUDLY through the RTTI stub, citing
 *     @0x2d81d, for both a null and a non-null stream, and never returns a URL it could not
 *     have computed. A port that quietly returned the fallback would be indistinguishable
 *     from this one on any test the fallback path can run, which is exactly the shape this
 *     repo calls a cheat.
 *
 * Source disassembly:
 *   raw-port/re/disasm/ProCore.__ZNK16PCXMLWriteStream6getURLEv.s  (20 lines)
 *
 * @ProCore 0x000000000002d800
 */
export function PCXMLWriteStream_getURL(
  self: { streamAt50: PCStreamPtr | null; urlAt460: PCURL },
): PCURL {
  // @0x2d809 — movq 0x50(%rdi),%rdi : the underlying stream.
  const stream = self.streamAt50;
  // @0x2d80d-0x2d81d — the RTTI call, made UNCONDITIONALLY, exactly as the machine does.
  //   There is no null test before the `callq` and none is added here: MEASURED, the live
  //   helper FAULTS on a NULL source (the oracle drives it in a child process and collects
  //   SIGSEGV), so a NULL +0x50 is outside this method's caller contract rather than a case
  //   it handles. Adding a guard would invent behaviour the binary does not have.
  const casted = cxx_dynamic_cast_PCStream_to_PCFileWriteStream(stream);
  // @0x2d826 — addq $0x460,%rbx : the fallback is computed UNCONDITIONALLY, before the
  //   select, because the machine's `cmovneq` is branchless.
  const fallback = self.urlAt460;
  // @0x2d822 + @0x2d82d-0x2d830 — leaq 0x8(%rax),%rcx ; testq %rax,%rax ; cmovneq %rcx,%rbx
  return casted !== null ? casted.urlAt8 : fallback;
}

// Force type-only import to remain live — PCSerializerWriteStream is
// the referenced base class in the class header comment and the
// vtable-re-install step at @0x0004c3ee, so a type import keeps that
// symbolic relationship explicit for reviewers.
export type { PCSerializerWriteStream };
