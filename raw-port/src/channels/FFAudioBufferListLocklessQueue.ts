// FFAudioBufferListLocklessQueue.ts — Flexo lockless queue of
// FFAudioBufferList* payloads with an optional presentation-time
// (CMTime) sort. Concrete instantiation of the generic
// FFLocklessQueue<FFAudioBufferList*> template sitting atop the
// type-erased FFLocklessQueueBase.
//
// Five FCP symbols correspond to this class:
//
//   FFAudioBufferListLocklessQueue::FFAudioBufferListLocklessQueue(SortOption) [C2]  @0x12566a0
//   FFAudioBufferListLocklessQueue::FFAudioBufferListLocklessQueue(SortOption) [C1]  @0x12567b0
//   FFAudioBufferListLocklessQueue::compare(ElementBase*, ElementBase*) const        @0x1256810
//   FFAudioBufferListLocklessQueue::~FFAudioBufferListLocklessQueue()          [D1]  @0x1257400
//   FFAudioBufferListLocklessQueue::~FFAudioBufferListLocklessQueue()          [D0]  @0x1257480
//
// Transcribed from FCP Flexo framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// See raw-port/re/disasm/Flexo.FFAudioBufferListLocklessQueue.*.s for the
// verbatim x86_64 disassembly.
//
// STRUCT LAYOUT (recovered from ctor + dtor + compare disasm):
//   +0x00  vtbl : pointer                // vtable pointer, set by the ctor.
//   +0x08  ... FFLocklessQueueBase fields (opaque — set up by
//         FFLocklessQueueBase's own ctor called from this ctor
//         @0x12566b6/@0x12567c6).
//   +0x20  atomic<ElementBase*> head-of-queue slot — the drain
//         target. Observed via `leaq 0x20(%rbx), %r14` in D1
//         @0x125741c and D0 @0x125749c, passed by reference to
//         FFLocklessQueueBase::popAtomic.
//   +0x38  uint32_t sortOption           // Written by the ctor
//         (`movl %r14d, 0x38(%rbx)` @0x12566c5 / @0x12567d5); read
//         by compare (`cmpl $0x1, 0x38(%rbx)` @0x1256848). Value 1
//         switches compare to "ascending" mode (return 1 iff a < b);
//         any other value uses "descending" mode (return 1 iff a > b).
//         The ctor also computes `sortOption != 0` as the argument
//         forwarded to FFLocklessQueueBase's base ctor via
//         `xorl %esi,%esi; testl %r14d,%r14d; setne %sil`
//         @0x12566ad/@0x12567bd. So the base container is told "sorted"
//         iff sortOption != 0, and the concrete class stores the full
//         sort-option enum value for compare() to switch on.
//
// The ElementBase payload layout used by compare — recovered from the
// two identical read blobs @0x1256838..@0x125688b and @0x1256899..@0x12568d6:
//
//   ElementBase +0x18 : FFAudioBufferList pointer     the payload pointer.
//
// The FFAudioBufferList structure (Flexo's own bufferlist wrapper) has
// its 24-byte CMTime timestamp starting at +0x8:
//
//   FFAudioBufferList +0x08 : CMTime.value      (int64)   // via movups(rcx) low-8
//   FFAudioBufferList +0x10 : CMTime.timescale  (int32)   //          high-4
//   FFAudioBufferList +0x14 : CMTime.flags      (uint32)  //          high-4
//   FFAudioBufferList +0x18 : CMTime.epoch      (int64)   // via movq 0x10(rcx)
//
// This is the standard 24-byte CoreMedia CMTime memory layout
// (raw-port/src/infra/CMTime.ts). compare() copies both CMTimes to
// the outgoing-arg region of its stack frame (16 bytes via SSE
// movups+movaps, 8 bytes via movq — total 24 bytes per CMTime, i.e.
// TWO CMTimes = 48 bytes at offsets [rsp+0..rsp+0x18] for a and
// [rsp+0x20..rsp+0x28+..] for b) and calls _CMTimeCompare(a, b).
//
// VTABLE POINTERS (constants recovered from the leaq RIP-relative loads):
//   C2 @0x12566bb install: 0x1921878  (= 0x12566c2 + 0x6cb1b6) — live
//                                    vtable for FFAudioBufferListLocklessQueue.
//   C1 @0x12567cb install: 0x1921878  (= 0x12567d2 + 0x6cb0a6) — same address.
//   D1 @0x125740d install: 0x1911b68  (= 0x1257414 + 0x6ba754) — sub-vtable
//                                    written during teardown per Itanium ABI.
//   D0 @0x125748d install: 0x1911b68  (= 0x1257494 + 0x6ba6d4) — same address.
//
// FRONTIER (undecoded — throwing stubs, cited): FFLocklessQueueBase (ctor
// with sort-option enum, setFreeElementProc, clear, popAtomic, freeElement,
// ~FFLocklessQueueBase D2). The private module-local "FreeElement"
// callback `FFAudioBufferListLocklessQueue_FreeElement` @0x1256700 is a
// tiny helper transcribed in-line here (identical shape to the analogous
// helper in FFAudioRecorderBufferWriteTaskQueue @0xd30d30).
//
// FFFlexo::ThrowNULL_() @Flexo is a Flexo utility that raises Flexo's
// null-pointer exception; called by compare on either null argument. Not
// yet transcribed (@0x12568ef / @0x12568fd) — surfaced as a throwing frontier stub.

import { CMTimeCompare, type CMTime } from "../infra/CMTime.js";

// ── Frontier types ───────────────────────────────────────────────────

/** Opaque handle for FFAudioBufferList — Flexo's audio-bufferlist
 *  wrapper. compare() reads its embedded CMTime at +0x8..+0x1f; nothing
 *  else about it is decoded here. */
export interface FFAudioBufferList {
  /** +0x08..+0x1f — 24-byte CMTime timestamp. */
  readonly timestamp: CMTime;
}

/** Opaque handle for FFLocklessQueueBase::ElementBase. Layout used here:
 *   +0x00 vtbl  (virtual dtor at slot +0x8, invoked by drain loop)
 *   +0x10 uint8 should_free  (drain loop only calls freeElement if this == 1)
 *   +0x18 FFAudioBufferList pointer payload */
export interface FFLocklessQueueElementBase {
  readonly vtbl: number;
  readonly should_free: number;                // uint8 @+0x10
  payload: FFAudioBufferList | null;           // @+0x18
}

/** std::atomic<ElementBase*> — passed by reference to popAtomic. */
export interface AtomicElementBaseRef {
  readonly __brand: "atomic<ElementBase*>";
}

// ── SortOption enum (partially decoded) ──────────────────────────────
//
// The ctor writes the raw uint32 arg to (this+0x38) verbatim (no
// masking), so the enum is a bare uint32. compare() only distinguishes
// value 1 from "anything else"; the ctor only distinguishes 0 from
// "anything else" for the base-ctor `bool sorted` arg. The zero case is
// almost certainly the "unsorted" / no-op default; value 1 is
// documented as ascending by compare (`shrl $0x1f` on the CMTimeCompare
// result — 1 iff a<b). Higher enum values fall to the descending path.
//
// We expose the two values compare/ctor actually distinguish; further
// enumerators are not decoded here.
export const FFAudioBufferListLocklessQueue_SortOption_Unsorted = 0;
export const FFAudioBufferListLocklessQueue_SortOption_Ascending = 1;

// ── Frontier callees ─────────────────────────────────────────────────

/** FFLocklessQueueBase::FFLocklessQueueBase(FFLocklessQueueSortOption)
 *  @Flexo (frontier) — not yet transcribed. Called from both ctors at
 *  @0x12566b6 (C2) and @0x12567c6 (C1) with sorted = (sortOption != 0). */
function FFLocklessQueueBase_ctor(
  _self: FFAudioBufferListLocklessQueue,
  _sortOption: number,
): void {
  throw new Error(
    "FFLocklessQueueBase::FFLocklessQueueBase(FFLocklessQueueSortOption) not yet transcribed — reached from FFAudioBufferListLocklessQueue ctor @0x12566b6 (C2)/@0x12567c6 (C1)",
  );
}

/** FFLocklessQueueBase::setFreeElementProc(void (*)(void*, ElementBase*), void*)
 *  @Flexo (frontier) — not yet transcribed. Called from both ctors after
 *  the vtable install: registers the class's `FreeElement` callback with
 *  userdata = nullptr (edx cleared to 0). */
function FFLocklessQueueBase_setFreeElementProc(
  _self: FFAudioBufferListLocklessQueue,
  _proc: (userdata: unknown, element: FFLocklessQueueElementBase) => void,
  _userdata: unknown,
): void {
  throw new Error(
    "FFLocklessQueueBase::setFreeElementProc not yet transcribed — reached from FFAudioBufferListLocklessQueue ctor @0x12566d5 (C2)/@0x12567e5 (C1)",
  );
}

/** FFLocklessQueueBase::clear() @Flexo (frontier) — not yet transcribed.
 *  Called from both dtors as the first step of teardown, before the
 *  popAtomic drain loop: D1 @0x1257417, D0 @0x1257497. */
function FFLocklessQueueBase_clear(
  _self: FFAudioBufferListLocklessQueue,
): void {
  throw new Error(
    "FFLocklessQueueBase::clear not yet transcribed — reached from FFAudioBufferListLocklessQueue dtor @0x1257417 (D1)/@0x1257497 (D0)",
  );
}

/** FFLocklessQueueBase::popAtomic(std::atomic<ElementBase*>&) @Flexo
 *  (frontier) — not yet transcribed. Returns the popped ElementBase* or
 *  null when drained. Called in the D1/D0 drain loops. */
function FFLocklessQueueBase_popAtomic(
  _self: FFAudioBufferListLocklessQueue,
  _head: AtomicElementBaseRef,
): FFLocklessQueueElementBase | null {
  throw new Error(
    "FFLocklessQueueBase::popAtomic not yet transcribed — reached from FFAudioBufferListLocklessQueue dtor loop @0x1257423/@0x125743c (D1) & @0x12574a3/@0x12574bc (D0)",
  );
}

/** FFLocklessQueueBase::freeElement(ElementBase*) @Flexo (frontier) —
 *  not yet transcribed. Called on popped elements whose should_free byte
 *  (elem+0x10) is 1. Sites: D1 @0x1257456, D0 @0x12574d6. */
function FFLocklessQueueBase_freeElement(
  _self: FFAudioBufferListLocklessQueue,
  _element: FFLocklessQueueElementBase,
): void {
  throw new Error(
    "FFLocklessQueueBase::freeElement not yet transcribed — reached from FFAudioBufferListLocklessQueue dtor @0x1257456 (D1)/@0x12574d6 (D0)",
  );
}

/** FFLocklessQueueBase::~FFLocklessQueueBase() [D2] @Flexo (frontier) —
 *  not yet transcribed. Called after the drain loop: D1 tail-jmps into
 *  it @0x125746a, D0 calls it @0x12574e0 before operator delete. */
function FFLocklessQueueBase_dtor(
  _self: FFAudioBufferListLocklessQueue,
): void {
  throw new Error(
    "FFLocklessQueueBase::~FFLocklessQueueBase [D2] not yet transcribed — reached from FFAudioBufferListLocklessQueue dtor @0x125746a (D1)/@0x12574e0 (D0)",
  );
}

/** ElementBase virtual destructor — vtable slot +0x8 of the popped
 *  element's vptr. Called by the drain loop via `movq (%r15),%rax ;
 *  callq *0x8(%rax)`. Implementations live on concrete task subclasses;
 *  opaque here. Sites: D1 @0x1257436, D0 @0x12574b6. */
function element_virtual_dtor(_elem: FFLocklessQueueElementBase): void {
  throw new Error(
    "ElementBase virtual destructor (vtbl slot +0x8) not yet transcribed — reached from FFAudioBufferListLocklessQueue dtor drain @0x1257436 (D1)/@0x12574b6 (D0)",
  );
}

/** FFAudioBufferList's virtual destructor — vtable slot +0x8, invoked by
 *  the module-local FreeElement helper below when its element carries a
 *  non-null payload. Opaque here (FFAudioBufferList has not been decoded).
 *  Site: FreeElement helper @0x1256715. */
function ffAudioBufferListVirtualDtor(_payload: FFAudioBufferList): void {
  throw new Error(
    "FFAudioBufferList virtual destructor (vtbl slot +0x8) not yet transcribed — reached from FFAudioBufferListLocklessQueue_FreeElement @0x1256715",
  );
}

/** FFFlexo::ThrowNULL_() @Flexo (frontier) — Flexo's null-argument
 *  exception raiser. compare() calls it on either null argument.
 *  Sites: @0x12568ef (a==null), @0x12568fd (b==null). */
function FFFlexo_ThrowNULL_(): never {
  throw new Error(
    "FFFlexo::ThrowNULL_ not yet transcribed — reached from FFAudioBufferListLocklessQueue::compare @0x12568ef / @0x12568fd",
  );
}

/** `operator delete(void*)` (libc++abi __ZdlPv symbol stub @0x1497404) —
 *  tail-called from D0 @0x12574f2. No-op in a GC'd runtime; preserved
 *  for control-flow fidelity. */
function operator_delete_stub(_this: FFAudioBufferListLocklessQueue): void {
  // GC'd runtime — no explicit free.
}

// ── Vtable pointer constants ─────────────────────────────────────────
//
// See top-of-file for the arithmetic. Kept as numeric constants that
// preserve provenance; never dereferenced in TS.
const _FFABLLQ_installed_vptr_live = 0x1921878; // @0x12566bb (C2) / @0x12567cb (C1)
const _FFABLLQ_installed_vptr_base = 0x1911b68; // @0x125740d (D1) / @0x125748d (D0)

// ── The private, module-local FreeElement callback ───────────────────
//
// @Flexo 0x1256700 (symbol
// `__ZL42FFAudioBufferListLocklessQueue_FreeElementPvPN19FFLocklessQueueBase11ElementBaseE`
// — the `ZL` marks it a private/static function). Full disasm:
//
//   0x1256700  pushq %rbp
//   0x1256701  movq  %rsp, %rbp
//   0x1256704  pushq %rbx
//   0x1256705  pushq %rax
//   0x1256706  movq  %rsi, %rbx                    ; rbx = elem
//   0x1256709  movq  0x18(%rsi), %rdi              ; rdi = elem->payload
//   0x125670d  testq %rdi, %rdi                    ; if payload != null:
//   0x1256710  je    0x1256718
//   0x1256712  movq  (%rdi), %rax                  ;   rax = payload->vtbl
//   0x1256715  callq *0x8(%rax)                    ;   payload->vtbl[+0x8](payload)
//   0x1256718  movq  $0x0, 0x18(%rbx)              ; elem->payload = null
//   0x1256720  addq  $0x8, %rsp
//   0x1256724  popq  %rbx
//   0x1256725  popq  %rbp
//   0x1256726  retq
//
// I.e. `if (elem->payload) call payload->virtual_dtor(payload);
//       elem->payload = null; return;`
// Note this differs slightly from the FFAudioRecorderBufferWriteTaskQueue
// analogue @0xd30d30: THIS version explicitly nulls out elem->payload
// after invoking the virtual dtor (the recorder version does not). The
// `void*` first-arg (rdi, the userdata `null` we registered) is ignored —
// the whole thing operates on the ElementBase* second-arg only.
function FFAudioBufferListLocklessQueue_FreeElement(
  _userdata: unknown,
  elem: FFLocklessQueueElementBase,
): void {
  // @0x1256709 — read payload = *(elem + 0x18).
  const payload = elem.payload;
  // @0x125670d..@0x1256710 — testq / je → null-guard around the vtable call.
  if (payload !== null && payload !== undefined) {
    // @0x1256712..@0x1256715 — vtable slot +0x8 = virtual destructor.
    ffAudioBufferListVirtualDtor(payload);
  }
  // @0x1256718 — elem->payload = null (unconditional, always executed
  //             regardless of whether payload was null).
  elem.payload = null;
  // @0x1256726 — retq.
}

// ── The class ─────────────────────────────────────────────────────────

/** FFAudioBufferListLocklessQueue — Flexo lockless queue holding
 *  FFAudioBufferList* payloads sorted by their embedded CMTime timestamp.
 *  Backed by FFLocklessQueueBase; the five emitted methods set up / tear
 *  down the base container, wire the payload-free callback, and provide
 *  the CMTime-based ordering predicate. */
export class FFAudioBufferListLocklessQueue {
  /** +0x00 vtbl. Set by the ctor to _FFABLLQ_installed_vptr_live and
   *  overwritten during teardown to _FFABLLQ_installed_vptr_base. */
  vtbl: number = 0;

  /** +0x20 atomic<ElementBase*> head-slot. Passed by reference to
   *  popAtomic in the drain loop. Opaque brand. */
  private readonly headSlot: AtomicElementBaseRef = {
    __brand: "atomic<ElementBase*>",
  };

  /** +0x38 sortOption enum value (uint32). Written verbatim by the ctor;
   *  read by compare(). */
  sortOption: number = 0;

  /**
   * @src Flexo 0x12566a0  FFAudioBufferListLocklessQueue::FFAudioBufferListLocklessQueue(SortOption) [C2]
   * @src Flexo 0x12567b0  FFAudioBufferListLocklessQueue::FFAudioBufferListLocklessQueue(SortOption) [C1]
   * @disasm raw-port/re/disasm/Flexo.FFAudioBufferListLocklessQueue.FFAudioBufferListLocklessQueue.s
   *
   * C2 and C1 are byte-for-byte identical (only the RIP-relative disp
   * of the vtbl leaq differs; the resolved target 0x1921878 is the
   * same). Both are full ctors emitted independently.
   *
   * Disasm (C1 @0x12567b0 shown — C2 @0x12566a0 is identical modulo
   * the RIP disp):
   *   0x12567b0  push %rbp
   *   0x12567b1  mov  %rsp, %rbp
   *   0x12567b4  push %r14
   *   0x12567b6  push %rbx
   *   0x12567b7  mov  %esi, %r14d                    ; r14d = sortOption
   *   0x12567ba  mov  %rdi, %rbx                     ; rbx = this
   *   0x12567bd  xor  %esi, %esi                     ; esi = 0
   *   0x12567bf  test %r14d, %r14d
   *   0x12567c2  setne %sil                          ; esi = (sortOption != 0)
   *   0x12567c6  callq FFLocklessQueueBase::FFLocklessQueueBase(sortOption != 0 ? 1 : 0)
   *   0x12567cb  leaq  0x6cb0a6(%rip), %rax          ; rax = 0x1921878 (vptr)
   *   0x12567d2  movq  %rax, (%rbx)                  ; (this)+0x00 = vptr
   *   0x12567d5  movl  %r14d, 0x38(%rbx)             ; (this)+0x38 = sortOption
   *   0x12567d9  leaq  <FreeElement>(%rip), %rsi     ; rsi = &FreeElement
   *   0x12567e0  movq  %rbx, %rdi                    ; rdi = this
   *   0x12567e3  xor   %edx, %edx                    ; userdata = 0
   *   0x12567e5  callq FFLocklessQueueBase::setFreeElementProc(FreeElement, null)
   *   0x12567ea  pop %rbx / pop %r14 / pop %rbp / retq
   *
   *   ; Landing pad @0x12567ef..@0x12567fd — Itanium unwind: if the
   *   ; base ctor threw, run FFLocklessQueue<FFAudioBufferList*>::~D2 on
   *   ; `this` and re-raise via __Unwind_Resume. TS exceptions
   *   ; propagate naturally, so this cleanup is implicit.
   */
  constructor(sortOption: number) {
    // @0x12567b7 — capture sortOption in r14d.
    // @0x12567bd/@0x12567bf/@0x12567c2 — base-ctor arg = (sortOption != 0) as uint8.
    const baseSorted = (sortOption !== 0) ? 1 : 0;
    // @0x12567c6 — base ctor.
    FFLocklessQueueBase_ctor(this, baseSorted);
    // @0x12567cb..@0x12567d2 — vptr install.
    this.vtbl = _FFABLLQ_installed_vptr_live;
    // @0x12567d5 — store the FULL sortOption enum value (not just bool).
    this.sortOption = sortOption >>> 0;
    // @0x12567d9..@0x12567e5 — register FreeElement callback with userdata=null.
    FFLocklessQueueBase_setFreeElementProc(
      this,
      FFAudioBufferListLocklessQueue_FreeElement,
      null,
    );
    // @0x12567ea..@0x12567ee — return.
  }

  /**
   * @src Flexo 0x1256810
   *      FFAudioBufferListLocklessQueue::compare(
   *        FFLocklessQueueBase::ElementBase*,
   *        FFLocklessQueueBase::ElementBase*
   *      ) const
   * @disasm raw-port/re/disasm/Flexo.FFAudioBufferListLocklessQueue.compare.s
   *
   * Ordering predicate over two queue elements. Returns a bool (in AL).
   *
   *   0x1256826  testq %rsi,%rsi
   *   0x1256829  je   0x12568ef                     ; if (a == null) ThrowNULL_
   *   0x125682f  testq %r14,%r14
   *   0x1256832  je   0x12568fd                     ; if (b == null) ThrowNULL_
   *   0x1256838  movq  0x18(%r15),%rcx              ; rcx = a->payload
   *   0x125683c  addq  $0x8,%rcx                    ; rcx = &a->payload->timestamp
   *   0x1256840  movq  0x18(%r14),%rax              ; rax = b->payload
   *   0x1256844  addq  $0x8,%rax                    ; rax = &b->payload->timestamp
   *   0x1256848  cmpl  $0x1,0x38(%rbx)              ; if (this->sortOption == 1)
   *   0x125684c  jne   0x1256899                    ;   goto descending
   *   ; ── ascending branch @0x125684e..@0x1256897 ──
   *   ; copy 24-byte a.timestamp then 24-byte b.timestamp into the
   *   ; outgoing-arg block on the stack via SSE movups/movaps + a
   *   ; scalar movq, faithfully mirroring the compiler's spill/reload
   *   ; but semantically equivalent to "pass a.timestamp and b.timestamp
   *   ; by value" to CMTimeCompare.
   *   0x125688f  callq _CMTimeCompare                ; eax = CMTimeCompare(a,b)
   *   0x1256894  shrl  $0x1f,%eax                   ; al = eax >> 31 (1 iff neg = a<b)
   *   0x1256897  jmp   0x12568e4                    ; return al
   *   ; ── descending branch @0x1256899..@0x12568e1 ──
   *   ;   ... identical CMTime copies ...
   *   0x12568da  callq _CMTimeCompare
   *   0x12568df  testl %eax,%eax
   *   0x12568e1  setg  %al                          ; al = (eax > 0) = (a > b)
   *   0x12568e4  addq  $0x68,%rsp / pop / retq
   */
  compare(
    a: FFLocklessQueueElementBase | null,
    b: FFLocklessQueueElementBase | null,
  ): boolean {
    // @0x1256826..@0x1256829 — testq %rsi,%rsi ; je ThrowNULL_.
    if (a === null || a === undefined) {
      FFFlexo_ThrowNULL_();
    }
    // @0x125682f..@0x1256832 — testq %r14,%r14 ; je ThrowNULL_.
    if (b === null || b === undefined) {
      FFFlexo_ThrowNULL_();
    }
    // @0x1256838..@0x1256844 — load payload pointers, offset to timestamp.
    // In the asm rcx/rax point to bytes; in TS we just fetch the CMTime.
    // a and b are non-null here (throw returned never above).
    const nonNullA = a as FFLocklessQueueElementBase;
    const nonNullB = b as FFLocklessQueueElementBase;
    const aPayload = nonNullA.payload;
    const bPayload = nonNullB.payload;
    if (aPayload === null || bPayload === null) {
      // Not exercised by the asm (a null payload would mean the ptr at
      // ElementBase+0x18 is null, and the asm unconditionally dereferences
      // that pointer via `addq $0x8,%rcx` + downstream loads — meaning FCP
      // would segfault on a null payload). Preserve that "always deref"
      // contract by throwing on the null-payload frontier.
      throw new Error(
        "FFAudioBufferListLocklessQueue::compare @0x1256838 — element payload is null; FCP would dereference and crash. Frontier: payload nullability is not modeled here.",
      );
    }
    const aTime = aPayload.timestamp;
    const bTime = bPayload.timestamp;
    // @0x1256848..@0x125684c — cmpl $0x1,(this+0x38) ; jne descending.
    if (this.sortOption === 1) {
      // @0x125684e..@0x125688f — ascending: CMTimeCompare(a,b).
      const cmp = CMTimeCompare(aTime, bTime) | 0;
      // @0x1256894 — al = (cmp as int32) >>> 31 = 1 iff cmp < 0 = a < b.
      return (cmp >>> 31) !== 0;
    } else {
      // @0x1256899..@0x12568da — descending: same call.
      const cmp = CMTimeCompare(aTime, bTime) | 0;
      // @0x12568df/@0x12568e1 — testl ; setg → 1 iff cmp > 0 = a > b.
      return cmp > 0;
    }
    // @0x12568e4..@0x12568ee — epilogue.
  }

  /**
   * @src Flexo 0x1257400  FFAudioBufferListLocklessQueue::~FFAudioBufferListLocklessQueue() [D1]
   * @src Flexo 0x1257480  FFAudioBufferListLocklessQueue::~FFAudioBufferListLocklessQueue() [D0]
   * @disasm raw-port/re/disasm/Flexo.FFAudioBufferListLocklessQueue.~FFAudioBufferListLocklessQueue.s
   *
   * D1 and D0 share the entire body verbatim; D0 additionally
   * operator-deletes `this` at the tail. Both:
   *
   *   1. Install the sub-vtable pointer at (this)+0x00
   *      (`leaq 0x6ba7?4(%rip), %rax ; movq %rax,(%rbx)`) — Itanium ABI
   *      sub-object teardown so virtual calls during dtor body see the
   *      base's vtable, not the (partially destroyed) derived's.
   *   2. FFLocklessQueueBase::clear().
   *   3. Drain the head-atomic via a loop:
   *        elem = popAtomic(&this->headSlot);
   *        while (elem != null) {
   *          if (elem->should_free == 1) freeElement(elem);
   *          else                        elem->vtbl[+0x8](elem);
   *          elem = popAtomic(&this->headSlot);
   *        }
   *      The two branches join at @0x1257444/@0x12574c4 (testq %r15,%r15;
   *      je exit; cmpb $0x1,0x10(%r15); jne virtual_dtor_branch;
   *      else freeElement_branch — both jump back to popAtomic).
   *   4. jmp/callq FFLocklessQueueBase::~FFLocklessQueueBase (D2).
   *   5. (D0 only) tail-jmp __ZdlPv (operator delete).
   *
   * The two "___clang_call_terminate" trampolines @0x125746f/72/77/7a
   * (D1) and @0x12574f7/fa/ff/02 (D0) are unwind terminate-handlers for
   * a throwing element vtable slot; TS exceptions propagate naturally.
   */
  destroy(deleteAfter: boolean = false): void {
    // @0x125740d/@0x125748d — sub-vtable install (Itanium ABI).
    this.vtbl = _FFABLLQ_installed_vptr_base;
    // @0x1257417/@0x1257497 — clear() the base container.
    FFLocklessQueueBase_clear(this);
    // @0x125741c/@0x125749c — headSlot = this + 0x20 (already tracked).
    // Drain loop @0x1257420..@0x125745b (D1) / @0x12574a0..@0x12574db (D0):
    let elem = FFLocklessQueueBase_popAtomic(this, this.headSlot);
    while (elem !== null) {
      // @0x1257449/@0x12574c9 — cmpb $0x1, elem+0x10.
      if (elem.should_free === 1) {
        // @0x1257450..@0x1257456 / @0x12574d0..@0x12574d6 — freeElement branch.
        FFLocklessQueueBase_freeElement(this, elem);
      } else {
        // @0x1257430..@0x1257436 / @0x12574b0..@0x12574b6 — vtable dtor branch.
        element_virtual_dtor(elem);
      }
      // Both branches loop back to popAtomic:
      // @0x1257439/@0x125743c and @0x12574b9/@0x12574bc.
      elem = FFLocklessQueueBase_popAtomic(this, this.headSlot);
    }
    // @0x125745d..@0x125746a (D1) / @0x12574dd..@0x12574e0 (D0) — base dtor.
    FFLocklessQueueBase_dtor(this);
    // @0x12574f2 (D0 only) — operator delete tail-jmp.
    if (deleteAfter) {
      operator_delete_stub(this);
    }
  }
}
