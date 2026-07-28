// FFPlayerLockDeferredWork.ts — Flexo framework class, faithful transcription
// of all five exported symbols:
//
//   @0x0000000000da7e70  __ZN24FFPlayerLockDeferredWorkC1EPU35objcproto24FFPlayerLockInteractions8NSObject
//                        FFPlayerLockDeferredWork::FFPlayerLockDeferredWork(NSObject<FFPlayerLockInteractions>*)
//   @0x0000000000da7e90  __ZN24FFPlayerLockDeferredWorkD2Ev
//                        FFPlayerLockDeferredWork::~FFPlayerLockDeferredWork()  (D2 — base-object dtor)
//   @0x0000000000da7f10  __ZN24FFPlayerLockDeferredWorkD1Ev
//                        FFPlayerLockDeferredWork::~FFPlayerLockDeferredWork()  (D1 — complete-object dtor)
//   @0x0000000000da7f90  __ZN24FFPlayerLockDeferredWork15addDeferredWorkEU13block_pointerFvvE
//                        FFPlayerLockDeferredWork::addDeferredWork(void(^)(void))
//   @0x0000000000da7fd0  __ZN24FFPlayerLockDeferredWork19processDeferredWorkEv
//                        FFPlayerLockDeferredWork::processDeferredWork()
//
// Source: /Library/Caches/com.apple.xbs/Sources/Flexo/Flexo-45000.0.121/framework/
//         playback/FFPlayerLockingUtilities.mm (path recovered from the string
//         literal at Flexo @0xda7f49 used in the destructor assertion).
//
// Disassembly files:
//   raw-port/re/disasm/Flexo.FFPlayerLockDeferredWork.FFPlayerLockDeferredWork.s   (ctor,   8 lines)
//   raw-port/re/disasm/Flexo.FFPlayerLockDeferredWork.~FFPlayerLockDeferredWork.s (dtor,  32 lines)
//   raw-port/re/disasm/Flexo.FFPlayerLockDeferredWork.addDeferredWork.s           (       21 lines)
//   raw-port/re/disasm/Flexo.FFPlayerLockDeferredWork.processDeferredWork.s       (       75 lines)
//
// ── STRUCT LAYOUT (recovered from ctor @0xda7e70) ────────────────────────────
//   +0x00  id<FFPlayerLockInteractions> _delegate   (raw ptr, __unsafe_unretained
//          shape — no retain in the ctor at 0xda7e74).
//   +0x08  NSMutableArray*              _workToDo   (init nil at 0xda7e77; lazily
//          allocated in addDeferredWork at 0xda7fa4..0xda7fb5; released with
//          _objc_release in dtor at 0xda7f75).
// sizeof = 0x10.
//
// ── OBJC SELECTOR REFS (resolved via dyld_info -fixups on __objc_selrefs) ─────
//   selref @0x1bb8550 -> "count"                                    (dtor)
//   selref @0x1bb84e8 -> "addObject:"                              (addDeferredWork)
//   selref @0x1bb84f0 -> "countByEnumeratingWithState:objects:count:" (processDeferredWork,
//                                                                    the NSFastEnumeration
//                                                                    16-slot loop)
//   selref @0x1bb85e8 -> "removeAllObjects"                        (processDeferredWork tail)
// Every "callq *0xNNN(%rip)" that otool labels "Objc message: -[%rdi
// _waitForThreadToFinish]" is actually a dispatch through the same
// `_objc_msgSend` GOT slot @0x18ed6c0 (bind libobjc/_objc_msgSend); the
// label is otool picking the wrong nearby-symbol. The actual selector is
// whichever selref was loaded into %rsi immediately before. Ditto the
// "Objc message: -[%rdi ...]" at 0xda7f27 in the dtor, which dispatches
// [_workToDo count]; the release at 0xda7f75 goes through the
// _objc_release GOT slot @0x18ed708 (bind libobjc/_objc_release), NOT a
// selector-based release.
//
// ── FRONTIER (unresolved imports) ─────────────────────────────────────────────
//   _objc_msgSend                bind libobjc/_objc_msgSend        (@0x18ed6c0)
//   _objc_release                bind libobjc/_objc_release        (@0x18ed708)
//   _objc_opt_new                stub @0x1497998
//   _objc_enumerationMutation    stub @0x149793e
//   __PCHandleLogAssertion       stub @0x1495d0c
//   ___stack_chk_fail            stub @0x14974f4
//   ___clang_call_terminate      direct call from dtor @0xda7f85 (exception
//                                landing pad for the _waitForBGTaskToFinish
//                                path — actually the `[_workToDo count]`
//                                selector may throw ObjC exception; unlikely,
//                                but the frontend still emitted the guard.)
//   OBJC_CLASS_$_NSMutableArray  GOT symbol, used at 0xda7fa6
//
// ── PORT ─────────────────────────────────────────────────────────────────────
// The class is a small utility for deferring lock-related callbacks: a
// delegate holds the "please stop when the arm settles" contract, and a
// nil-initialized NSMutableArray lazily grows with blocks. On processDeferredWork
// the deferred blocks are invoked via their `invoke` slot (`callq *0x10(%rdi)` —
// the standard Blocks-ABI layout: [isa, flags, reserved, invoke_fn, descriptor,
// captures...] with invoke at +0x10 on 64-bit). Any assertion violation about
// non-empty _workToDo at destruction is logged, not thrown, per _PCHandleLogAssertion.
//
// Because Node.js has no Objective-C runtime, `NSMutableArray*`, blocks, and
// `_objc_msgSend` cannot be reproduced with fidelity. The port pins the
// class shape and control flow, but every method throws with an @0xADDR
// citation pointing to the exact instruction range that would need an
// Obj-C runtime shim to execute.

/**
 * Opaque marker type for an Objective-C `NSObject<FFPlayerLockInteractions>*`.
 * The C++ ctor at Flexo @0xda7e74 stores it raw (unretained) into `_delegate`.
 */
export type FFPlayerLockInteractions = { readonly __obj: "FFPlayerLockInteractions" };

/**
 * Opaque marker for an Objective-C block of shape `void(^)(void)`. The
 * Blocks ABI layout as invoked by processDeferredWork @0xda809b is
 * (`callq *0x10(%rdi)`): [+0x00 isa, +0x08 flags/reserved, +0x10 invoke_fn,
 * +0x18 descriptor, +0x20.. captures].
 */
export type ObjcVoidBlock = { readonly __block: "void()" };

/**
 * `FFPlayerLockDeferredWork` — a tiny lock-window deferral queue. Instances
 * hold a `_delegate` (weak/unsafe-unretained) and a lazily allocated
 * `NSMutableArray` of zero-arg blocks. Callers push blocks via
 * `addDeferredWork` and drain them (invoke + empty the array) via
 * `processDeferredWork`. sizeof = 0x10 (see file header for the two
 * pinned fields).
 */
export class FFPlayerLockDeferredWork {
  /**
   * `_delegate` @+0x00. Set once in the ctor at Flexo @0xda7e74
   * (`movq %rsi, (%rdi)`) and never mutated. Read in every method that
   * calls back via `objc_msgSend`.
   */
  private _delegate: FFPlayerLockInteractions | null = null;

  /**
   * `_workToDo` @+0x08. Nil-initialized in the ctor at Flexo @0xda7e77
   * (`movq $0x0, 0x8(%rdi)`), lazily allocated in addDeferredWork at
   * @0xda7fa6..@0xda7fb5 via `_objc_opt_new` on `NSMutableArray`
   * (`_OBJC_CLASS_$_NSMutableArray` @0xda7fa6), released in the dtor at
   * @0xda7f75 via `_objc_release`.
   */
  private _workToDo: ObjcVoidBlock[] | null = null;

  /**
   * `FFPlayerLockDeferredWork::FFPlayerLockDeferredWork(NSObject<FFPlayerLockInteractions>*)`
   * @Flexo 0xda7e70.
   *
   * Body (verbatim):
   *   0xda7e70  pushq %rbp
   *   0xda7e71  movq  %rsp, %rbp
   *   0xda7e74  movq  %rsi, (%rdi)             ; _delegate = arg
   *   0xda7e77  movq  $0x0, 0x8(%rdi)          ; _workToDo = nil
   *   0xda7e7f  popq  %rbp
   *   0xda7e80  retq
   *
   * The delegate is NOT retained (no `_objc_retain` call) — the class
   * assumes the delegate outlives it, which is the standard weak-back-pointer
   * pattern for lock-utility helpers.
   */
  constructor(delegate: FFPlayerLockInteractions) {
    /* @0xda7e70 */
    this._delegate = delegate;
    this._workToDo = null;
  }

  /**
   * `FFPlayerLockDeferredWork::~FFPlayerLockDeferredWork()` (D1 — complete-object
   * dtor) @Flexo 0xda7f10. The D2 (base-object) dtor @Flexo 0xda7e90 is a
   * separately emitted symbol; on Flexo's inheritance the two share the
   * same body per Itanium ABI.
   *
   * Body:
   *   0xda7f1c  movq  0x8(%rdi), %rdi             ; rdi = _workToDo
   *   0xda7f20  movq  0xe10629(%rip), %rsi        ; rsi = selref@0x1bb8550 = "count"
   *   0xda7f27  callq *0xb45793(%rip)             ; objc_msgSend GOT @0x18ed6c0
   *                                              ; -> NSUInteger n = [_workToDo count]
   *   0xda7f2d  testq %rax, %rax
   *   0xda7f30  je    0xda7f71                    ; if n==0 skip assertion
   *   0xda7f32.. leaq literal-pool strings for the assertion:
   *     "FFPlayerLockDeferredWork::~FFPlayerLockDeferredWork()"     (function name)
   *     "[_workToDo count] == 0"                                    (predicate)
   *     "/Library/Caches/com.apple.xbs/Sources/Flexo/Flexo-45000.0.121/framework/playback/FFPlayerLockingUtilities.mm"  (file)
   *     "assertion failed: %s (%s) :: %s"                           (format)
   *     "FFPlayerLockDeferredWork::~FFPlayerLockDeferredWork - Didn't
   *      process workToDoUponLocking. Please call processDeferredWork
   *      before the destructor runs!"                               (message)
   *   0xda7f5e  movl  $1, %edi
   *   0xda7f63  xorl  %esi, %esi
   *   0xda7f65  movl  $0x7d, %ecx                 ; line 125 (0x7d)
   *   0xda7f6a  xorl  %eax, %eax                  ; variadic arg count = 0
   *   0xda7f6c  callq __PCHandleLogAssertion      ; @stub 0x1495d0c
   *   0xda7f71  movq  0x8(%rbx), %rdi             ; rdi = _workToDo
   *   0xda7f75  callq *0xb4578d(%rip)             ; _objc_release GOT @0x18ed708
   *                                              ; -> objc_release(_workToDo)  (safe on nil)
   *   0xda7f7b..0xda7f81  epilogue
   *   Exception-cleanup landing pad @0xda7f82: forward to
   *   `___clang_call_terminate` (via std::terminate) if [_workToDo count]
   *   threw an Objective-C exception. Reached from GCC_except_table unwind.
   *
   * Note: `_objc_release` at Flexo @0x18ed708 is the libobjc GOT-bound
   * runtime function, not a message-send. It handles nil safely, so no
   * explicit nil-check is required around the release path (the C++
   * frontend elided one for that reason).
   */
  destroy(): void {
    /* @0xda7f10 — Obj-C runtime not available in this port. */
    throw new Error("FFPlayerLockDeferredWork::~FFPlayerLockDeferredWork() @Flexo 0xda7f10 requires Obj-C runtime (_objc_msgSend @0x18ed6c0, _objc_release @0x18ed708, __PCHandleLogAssertion @stub 0x1495d0c) — not yet ported"); // @0xda7f10
  }

  /**
   * `FFPlayerLockDeferredWork::addDeferredWork(void(^)(void))` @Flexo 0xda7f90.
   *
   * Body:
   *   0xda7f97  movq  %rsi, %rbx                  ; rbx = block
   *   0xda7f9a  movq  %rdi, %r14                  ; r14 = this
   *   0xda7f9d  movq  0x8(%rdi), %rdi             ; rdi = _workToDo
   *   0xda7fa1  testq %rdi, %rdi
   *   0xda7fa4  jne   0xda7fb9                    ; already allocated -> skip
   *   0xda7fa6  movq  _OBJC_CLASS_$_NSMutableArray(%rip), %rdi  ; @0xda7fa6
   *   0xda7fad  callq _objc_opt_new               ; @stub 0x1497998
   *                                              ; -> _workToDo = [NSMutableArray new]
   *                                              ; (retained +1 owner ref, per objc_opt_new)
   *   0xda7fb2  movq  %rax, %rdi
   *   0xda7fb5  movq  %rax, 0x8(%r14)             ; this->_workToDo = <new>
   *   0xda7fb9  movq  0xe10528(%rip), %rsi        ; rsi = selref@0x1bb84e8 = "addObject:"
   *   0xda7fc0  movq  %rbx, %rdx                  ; rdx = block
   *   0xda7fc3..0xda7fc7  epilogue (pop rbx, r14, rbp)
   *   0xda7fc7  jmpq  *0xb456f3(%rip)             ; tail-call _objc_msgSend @0x18ed6c0
   *                                              ; -> [_workToDo addObject: block]
   *
   * NSMutableArray retains its addObject: argument, so callers do not
   * need to retain the block first. The tail-call at 0xda7fc7 preserves the
   * return value of addObject: (which is void); no post-processing follows.
   */
  addDeferredWork(_block: ObjcVoidBlock): void {
    /* @0xda7f90 — Obj-C runtime not available in this port. */
    throw new Error("FFPlayerLockDeferredWork::addDeferredWork @Flexo 0xda7f90 requires Obj-C runtime (_objc_opt_new @stub 0x1497998, _objc_msgSend @0x18ed6c0 with selref \"addObject:\" @0x1bb84e8) — not yet ported"); // @0xda7f90
  }

  /**
   * `FFPlayerLockDeferredWork::processDeferredWork()` @Flexo 0xda7fd0.
   *
   * Body summary: standard `for (id block in _workToDo) block();` loop
   * followed by `[_workToDo removeAllObjects]`. The compiler expanded the
   * @for(...) syntax to a direct call of the NSFastEnumeration protocol
   * method `countByEnumeratingWithState:objects:count:`, with a 16-slot
   * stack buffer at -0xb0(%rbp).
   *
   * Detailed trace:
   *   0xda7fe4..0xda7fee  stack-guard canary save (___stack_chk_guard)
   *   0xda7ff2..0xda800a  four 16-byte xmm0 zeroes: initialize the
   *                        NSFastEnumerationState struct at -0x100(%rbp)..
   *                        -0xd0(%rbp) (64 bytes = 4 slots as per the
   *                        NSFastEnumeration ABI: state, itemsPtr,
   *                        mutationsPtr, extra[5]).
   *   0xda8011  movq  %rdi, -0xb8(%rbp)           ; save this
   *   0xda8018  movq  0x8(%rdi), %r14             ; r14 = _workToDo
   *   0xda801c  movq  0xe104cd(%rip), %rsi        ; rsi = selref@0x1bb84f0 =
   *                                                "countByEnumeratingWithState:objects:count:"
   *   0xda8023  leaq  -0x100(%rbp), %rdx          ; rdx = &state
   *   0xda802a  leaq  -0xb0(%rbp), %rcx           ; rcx = &stackbuf[0]  (16-slot)
   *   0xda8031  movl  $0x10, %r8d                 ; r8d = 16 (buffer size)
   *   0xda8037  movq  %r14, %rdi
   *   0xda803a  callq *0xb45680(%rip)             ; _objc_msgSend @0x18ed6c0
   *                                              ; -> NSUInteger n = [_workToDo
   *                                              ;    countByEnumeratingWithState:&state
   *                                              ;    objects:stackbuf count:16]
   *   0xda8040  testq %rax, %rax
   *   0xda8043  je    0xda80bc                    ; n==0 -> exit loop, go to cleanup
   *   0xda8045  movq  %rax, %rbx                  ; rbx = n (outer count)
   *   0xda8048  movq  -0xf0(%rbp), %rax           ; rax = state.mutationsPtr
   *   0xda804f  movq  (%rax), %r15                ; r15 = *state.mutationsPtr
   *                                              ;      (snapshot mutation-guard value)
   *   0xda8052  movq  0xb45667(%rip), %r12        ; cache _objc_msgSend addr in r12
   *   0xda8059  jmp   0xda8089                    ; enter inner iter
   *   ; ---- outer loop refill ----
   *   0xda8060  movl  $0x10, %r8d
   *   0xda8066  movq  %r14, %rdi
   *   0xda8069  movq  0xe10480(%rip), %rsi        ; rsi = selref@0x1bb84f0
   *                                              ;       "countByEnumerating..."
   *   0xda8070  leaq  -0x100(%rbp), %rdx
   *   0xda8077  leaq  -0xb0(%rbp), %rcx
   *   0xda807e  callq *%r12                       ; _objc_msgSend, refill batch
   *   0xda8081  movq  %rax, %rbx
   *   0xda8084  testq %rax, %rax
   *   0xda8087  je    0xda80bc                    ; drained
   *   0xda8089  xorl  %r13d, %r13d                ; r13 = inner idx = 0
   *   0xda808c  jmp   0xda80a6
   *   ; ---- inner loop body ----
   *   0xda8090  movq  -0xf8(%rbp), %rax           ; rax = state.itemsPtr
   *   0xda8097  movq  (%rax,%r13,8), %rdi         ; rdi = block = itemsPtr[i]
   *   0xda809b  callq *0x10(%rdi)                 ; invoke block via Blocks-ABI
   *                                              ; invoke slot @+0x10 — the
   *                                              ; deferred zero-arg body runs here
   *   0xda809e  incq  %r13
   *   0xda80a1  cmpq  %r13, %rbx
   *   0xda80a4  je    0xda8060                    ; batch done -> refill
   *   ; ---- mutation check ----
   *   0xda80a6  movq  -0xf0(%rbp), %rax
   *   0xda80ad  cmpq  %r15, (%rax)                ; still matches snapshot?
   *   0xda80b0  je    0xda8090                    ; yes -> next iter
   *   0xda80b2  movq  %r14, %rdi
   *   0xda80b5  callq _objc_enumerationMutation   ; @stub 0x149793e — throws
   *   0xda80ba  jmp   0xda8090                    ; (unreachable — mutation traps)
   *   ; ---- cleanup ----
   *   0xda80bc  movq  -0xb8(%rbp), %rax           ; rax = this
   *   0xda80c3  movq  0x8(%rax), %rdi             ; rdi = _workToDo
   *   0xda80c7  movq  0xe1051a(%rip), %rsi        ; rsi = selref@0x1bb85e8 =
   *                                                "removeAllObjects"
   *   0xda80ce  callq *0xb455ec(%rip)             ; _objc_msgSend @0x18ed6c0
   *                                              ; -> [_workToDo removeAllObjects]
   *   0xda80d4..0xda80e2  stack-guard canary check
   *   0xda80e4..0xda80f5  epilogue + retq
   *   0xda80f6  callq ___stack_chk_fail           ; @stub 0x14974f4 (canary mismatch)
   *
   * Note the compiler emits the standard @-for-in template exactly (this is
   * an -O0/-O1 shape with the outer/inner-refill split; -O2 usually
   * flattens it). Each block invocation is a direct call to
   * `block->invoke(block)` per the Blocks ABI — no argument-marshalling
   * beyond passing the block itself as `self`. Once the enumeration
   * completes, all queued blocks are dropped en bloc via `removeAllObjects`,
   * releasing each block's refcount by exactly 1.
   */
  processDeferredWork(): void {
    /* @0xda7fd0 — Obj-C runtime + Blocks ABI not available in this port. */
    throw new Error("FFPlayerLockDeferredWork::processDeferredWork @Flexo 0xda7fd0 requires Obj-C runtime + Blocks-ABI invoke slot (_objc_msgSend @0x18ed6c0 with selrefs \"countByEnumeratingWithState:objects:count:\" @0x1bb84f0 and \"removeAllObjects\" @0x1bb85e8, _objc_enumerationMutation @stub 0x149793e) — not yet ported"); // @0xda7fd0
  }
}
