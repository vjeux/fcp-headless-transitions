// FFDestAnalyzerSynchronizer.ts — FCP Flexo framework class.
// Transcribed from the x86_64 disassembly of Flexo in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
// Versions/A/Flexo.
//
// FFDestAnalyzerSynchronizer coordinates access to a "destination analyzer"
// Objective-C object via two independent recursive-mutex ledgers (one for
// the "stream" side, one for the "tracker" side).  Each ledger is an
// embedded FFSynchronizable object plus a co-located uint32 "direct lock
// depth" counter that this class bumps under the FFSynchronizable's
// pthread-mutex protection.  The class also owns a retained Obj-C pointer
// to the underlying analyzer.
//
// STRUCT LAYOUT
// Recovered purely from the seven decoded methods:
//   +0x000  vtable                       // Written at @0x131ff79 (dtor D0):
//                                        //   `leaq 0x606f80(%rip), %rax; movq %rax, (%rdi)`
//   +0x010  FFSynchronizable  trackerSync
//                                        // `leaq 0x10(%rbx), %rdi` @0x13218c9
//                                        //   (lockTracker_direct) and same at
//                                        //   dtor @0x131ff9c — the destructor
//                                        //   calls FFSynchronizable::~FFSynchronizable
//                                        //   on this slot.
//   +0x0a0  FFSynchronizable  streamSync
//                                        // `addq $0xa0, %rdi` @0x1320359
//                                        //   (lockStream_direct) and same at
//                                        //   dtor @0x131ff90 — the destructor
//                                        //   calls FFSynchronizable::~FFSynchronizable
//                                        //   on this slot.
//   +0x130  uint32_t          streamDepth_direct
//                                        // `lock incl 0x130(%rbx)` @0x1320366
//                                        //   (lockStream_direct) and
//                                        //   `lock decl 0x130(%rdi)` @0x1320385
//                                        //   (unlockStream_direct).
//   +0x134  uint32_t          trackerDepth_direct
//                                        // `lock incl 0x134(%rbx)` @0x13218d3
//                                        //   (lockTracker_direct) and
//                                        //   `lock decl 0x134(%rdi)` @0x13218e5
//                                        //   (unlockTracker_direct).
//   +0x140  id                analyzer   // `movq 0x140(%rbx), %rdi` @0x1320aa5
//                                        //   inside RunProcess_ — the Obj-C
//                                        //   receiver of the `arranged`
//                                        //   selector.  This slot is NOT
//                                        //   released in the D0 destructor.
//   +0x148  id                analyzerRetained
//                                        // `movq 0x148(%rdi), %rdi` @0x131ff83
//                                        //   (dtor) followed by an
//                                        //   `objc_release` on that pointer.
//
// Total sizeof(FFDestAnalyzerSynchronizer) >= 0x150.  Fields between +0x08
// and +0x10, and any tail beyond +0x150, are not read/written by the
// decoded methods and remain opaque to this port.
//
// The size of an embedded FFSynchronizable is 0x90 (144) bytes — see the
// header of FFSynchronizable.ts.  The layout above is exactly consistent
// with that: trackerSync spans +0x10..+0x9F (0x90 bytes), and streamSync
// spans +0xA0..+0x12F (0x90 bytes).
//
// DECODED METHODS
//   0x0000000001320350 t FFDestAnalyzerSynchronizer::lockStream_direct() const
//   0x0000000001320380 t FFDestAnalyzerSynchronizer::unlockStream_direct() const
//   0x00000000013218c0 t FFDestAnalyzerSynchronizer::lockTracker_direct() const
//   0x00000000013218e0 t FFDestAnalyzerSynchronizer::unlockTracker_direct() const
//   0x0000000001320a80 t FFDestAnalyzerSynchronizer::RunProcess_(void*)
//   0x000000000131ff70 t FFDestAnalyzerSynchronizer::~FFDestAnalyzerSynchronizer() (D0)
//   0x000000000131ff20 t FFDestAnalyzerSynchronizer::~FFDestAnalyzerSynchronizer() (D2 alias)
//
// Source disassembly files:
//   raw-port/re/disasm/Flexo.FFDestAnalyzerSynchronizer.lockStream_direct.s
//   raw-port/re/disasm/Flexo.FFDestAnalyzerSynchronizer.unlockStream_direct.s
//   raw-port/re/disasm/Flexo.FFDestAnalyzerSynchronizer.lockTracker_direct.s
//   raw-port/re/disasm/Flexo.FFDestAnalyzerSynchronizer.unlockTracker_direct.s
//   raw-port/re/disasm/Flexo.FFDestAnalyzerSynchronizer.RunProcess_.s
//   raw-port/re/disasm/Flexo.FFDestAnalyzerSynchronizer.~FFDestAnalyzerSynchronizer.s
//
// RUNTIME STUBS / UNPORTED CALLEES
// The bodies reach these external symbols:
//   `_pthread_setname_np`             @Flexo stub 0x1497b1e — call @0x1320a94.
//   `_pthread_set_qos_class_self_np`  @Flexo stub 0x1497b18 — call @0x1320aa0.
//   `objc_msgSend`     (RIP-relative) — call @0x1320ab3, selector `arranged`.
//   `_objc_release`   (literal-pool)  — call @0x131ff8a.
//   `__ZdlPv` (operator delete)       @Flexo stub 0x1497404 — tail-call @0x131ffae.
//   `FFSynchronizable::Lock`          @0x12f8ec0 — via FFSynchronizable class.
//   `FFSynchronizable::Unlock`        @0x12f8f20 — via FFSynchronizable class.
//   `FFSynchronizable::~FFSynchronizable` (D1)  — via FFSynchronizable class.
//   `FFDestAnalyzerSynchronizer::lockStream<lambda>` @0x1320ac0
//                                     — a templated helper the RunProcess_
//                                       body calls with an on-stack lambda.
//                                       The instantiation itself is not
//                                       decoded; only its call-site is here.
//   `___clang_call_terminate`          — reached on the dtor unwind path
//                                       @0x131ffb6 (unwind, not part of the
//                                       normal control flow).
// Every unported callee is exposed as a throwing stub honouring
// raw-port/army/PORTING_SPEC.md rule 3 (loud gap over silent guess) with
// the @0xADDR cited on the same line.

import { FFSynchronizable } from "./FFSynchronizable";

/**
 * Opaque Obj-C `id` handle.  The two Obj-C slots at +0x140 and +0x148
 * are treated as opaque pointers because the wider Obj-C runtime is not
 * ported here.
 */
export type ObjcId = { readonly __objcId: unique symbol };

/**
 * Sets a name on the current pthread.  Native `_pthread_setname_np` stub
 * at Flexo `__stubs` 0x1497b1e (call-site @0x1320a94).  This is a
 * side-effect the host process must install; the port stubs it out so
 * that RunProcess_ can run on hosts without a native pthreads binding.
 */
export type PthreadSetNameFn = (name: string) => void;

/**
 * Sets the QOS class of the current pthread.  Native
 * `_pthread_set_qos_class_self_np` stub at Flexo `__stubs` 0x1497b18
 * (call-site @0x1320aa0).  Called by RunProcess_ with
 *   qos_class = 0x11  (QOS_CLASS_UTILITY)
 *   relative_priority = 0
 * the two literal immediates loaded into `%edi`/`%esi` at
 * @0x1320a99 / @0x1320a9e right before the call.
 */
export type PthreadSetQosClassSelfFn = (qosClass: number, relPriority: number) => void;

/**
 * Sends the Obj-C `arranged` selector to a `FFDestAnalyzer` receiver.
 * The call-site is @0x1320ab3 (`callq *0x5ccc07(%rip)` — the classic
 * objc_msgSend RIP dispatch).  The selref is loaded @0x1320aac
 * (`movq 0x8e0915(%rip), %rsi`) and points into `__objc_selrefs` for the
 * selector name `arranged`.
 * The return value is discarded at the call-site (never re-read).
 */
export type ObjcMsgSendArrangedFn = (receiver: ObjcId) => void;

/**
 * Releases an Obj-C object (`_objc_release`).  Literal-pool call
 * @0x131ff8a inside the D0 destructor.
 */
export type ObjcReleaseFn = (obj: ObjcId) => void;

/**
 * Host-installable bindings.  A JS host that intends to run
 * FFDestAnalyzerSynchronizer's side-effecting code (RunProcess_ and D0)
 * must call setPthreadSetName / setPthreadSetQosClassSelf /
 * setObjcMsgSendArranged / setObjcRelease at least once before the
 * relevant method is invoked; otherwise those methods throw.
 */
let hostPthreadSetName: PthreadSetNameFn | null = null;
let hostPthreadSetQosClassSelf: PthreadSetQosClassSelfFn | null = null;
let hostObjcMsgSendArranged: ObjcMsgSendArrangedFn | null = null;
let hostObjcRelease: ObjcReleaseFn | null = null;

export function setPthreadSetName(fn: PthreadSetNameFn): void {
  hostPthreadSetName = fn;
}
export function setPthreadSetQosClassSelf(fn: PthreadSetQosClassSelfFn): void {
  hostPthreadSetQosClassSelf = fn;
}
export function setObjcMsgSendArranged(fn: ObjcMsgSendArrangedFn): void {
  hostObjcMsgSendArranged = fn;
}
export function setObjcRelease(fn: ObjcReleaseFn): void {
  hostObjcRelease = fn;
}

/**
 * The literal-pool string reached at @0x1320a8d
 * (`leaq 0x36db80(%rip), %rdi` — reproduced verbatim; the bytes were
 * confirmed against Flexo's `__cstring` segment).
 */
export const DEST_ANALYZER_THREAD_NAME = "com.apple.flexo.ffdest.tracking";

/**
 * The QOS class literal loaded at @0x1320a99 (`movl $0x11, %edi`).
 * 0x11 (decimal 17) is `QOS_CLASS_UTILITY` on macOS
 * (from `<sys/qos.h>`); the value is verbatim.
 */
export const DEST_ANALYZER_QOS_CLASS = 0x11;

/**
 * The relative-priority literal loaded at @0x1320a9e (`xorl %esi, %esi`
 * so zero).
 */
export const DEST_ANALYZER_QOS_REL_PRIORITY = 0;

/**
 * FFDestAnalyzerSynchronizer.
 *
 * Faithful transcription of the seven decoded methods.
 */
export class FFDestAnalyzerSynchronizer {
  /**
   * +0x010 — trackerSync.  Owned recursive-mutex ledger for the
   * "tracker" side.  Constructed elsewhere (the constructor of
   * FFDestAnalyzerSynchronizer is not part of this port's method list);
   * the D0 destructor calls `FFSynchronizable::~FFSynchronizable` on it
   * at @0x131ffa0.
   */
  readonly trackerSync: FFSynchronizable;

  /**
   * +0x0A0 — streamSync.  Owned recursive-mutex ledger for the
   * "stream" side.  D0 destructs it @0x131ff97.
   */
  readonly streamSync: FFSynchronizable;

  /**
   * +0x130 — streamDepth_direct.  Atomic uint32 (LOCK prefix in the asm)
   * bumped by lockStream_direct @0x1320366 and decremented by
   * unlockStream_direct @0x1320385.
   */
  streamDepth_direct: number;

  /**
   * +0x134 — trackerDepth_direct.  Same as streamDepth_direct but for
   * the tracker side (lockTracker_direct @0x13218d3 / unlockTracker_direct
   * @0x13218e5).
   */
  trackerDepth_direct: number;

  /**
   * +0x140 — analyzer.  The Obj-C FFDestAnalyzer receiver.  Read by
   * RunProcess_ @0x1320aa5.  This slot is NOT released by the D0
   * destructor (that slot is +0x148 instead).
   */
  analyzer: ObjcId | null;

  /**
   * +0x148 — analyzerRetained.  The Obj-C reference that D0 releases
   * via `_objc_release` @0x131ff8a.  Kept as a distinct slot because the
   * asm reads it from a distinct offset.
   */
  analyzerRetained: ObjcId | null;

  /**
   * Ctor is not part of this port's assigned method list.  The
   * constructor here mirrors the layout only; a full constructor decode
   * belongs to a follow-up unit.
   *
   * @param trackerSync   embedded FFSynchronizable at +0x010
   * @param streamSync    embedded FFSynchronizable at +0x0A0
   * @param analyzer      Obj-C id at +0x140
   * @param analyzerRetained Obj-C id at +0x148
   */
  constructor(
    trackerSync: FFSynchronizable,
    streamSync: FFSynchronizable,
    analyzer: ObjcId | null,
    analyzerRetained: ObjcId | null,
  ) {
    this.trackerSync = trackerSync;
    this.streamSync = streamSync;
    this.streamDepth_direct = 0;
    this.trackerDepth_direct = 0;
    this.analyzer = analyzer;
    this.analyzerRetained = analyzerRetained;
  }

  /**
   * FFDestAnalyzerSynchronizer::lockStream_direct() const
   * @0x1320350
   *
   *   pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax
   *   movq  %rdi,%rbx                     ;; save this
   *   addq  $0xa0,%rdi                    ;; &this->streamSync
   *   callq __ZN16FFSynchronizable4LockEv ;; FFSynchronizable::Lock()
   *   lock incl 0x130(%rbx)               ;; ++streamDepth_direct (atomic)
   *   addq  $0x8,%rsp; popq %rbx; popq %rbp; retq
   *
   * Semantics: take the streamSync's recursive mutex, then atomically
   * increment the "direct" depth counter under that mutex.  The LOCK
   * prefix is preserved by the JS port even though single-threaded JS
   * does not observe it — a native re-implementation must honour it.
   */
  lockStream_direct(): void {
    // @0x1320360 — FFSynchronizable::Lock on the streamSync (+0xa0).
    this.streamSync.Lock();
    // @0x1320366 — `lock incl 0x130(%rbx)`.
    this.streamDepth_direct = (this.streamDepth_direct + 1) | 0;
  }

  /**
   * FFDestAnalyzerSynchronizer::unlockStream_direct() const
   * @0x1320380
   *
   *   pushq %rbp; movq %rsp,%rbp
   *   lock decl 0x130(%rdi)                       ;; --streamDepth_direct
   *   addq  $0xa0,%rdi                            ;; &this->streamSync
   *   popq  %rbp
   *   jmp   __ZN16FFSynchronizable6UnlockEv       ;; tail-call Unlock()
   *
   * Semantics: atomically decrement the "direct" depth counter, then
   * release the streamSync's recursive mutex.  The `jmp` is a tail-call
   * so from the caller's point of view there is no observable difference
   * to `callq`+`ret`, so we transcribe it as a straight call.
   */
  unlockStream_direct(): void {
    // @0x1320385 — `lock decl 0x130(%rdi)`.
    this.streamDepth_direct = (this.streamDepth_direct - 1) | 0;
    // @0x1320392 — tail `jmp` into FFSynchronizable::Unlock on streamSync (+0xa0).
    this.streamSync.Unlock();
  }

  /**
   * FFDestAnalyzerSynchronizer::lockTracker_direct() const
   * @0x13218c0
   *
   *   pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax
   *   movq  %rdi,%rbx
   *   addq  $0x10,%rdi                    ;; &this->trackerSync
   *   callq __ZN16FFSynchronizable4LockEv
   *   lock incl 0x134(%rbx)               ;; ++trackerDepth_direct
   *   addq  $0x8,%rsp; popq %rbx; popq %rbp; retq
   *
   * Byte-for-byte the same shape as lockStream_direct, with the two
   * offsets swapped (+0x10 instead of +0xa0, +0x134 instead of +0x130).
   */
  lockTracker_direct(): void {
    // @0x13218cd — FFSynchronizable::Lock on the trackerSync (+0x10).
    this.trackerSync.Lock();
    // @0x13218d3 — `lock incl 0x134(%rbx)`.
    this.trackerDepth_direct = (this.trackerDepth_direct + 1) | 0;
  }

  /**
   * FFDestAnalyzerSynchronizer::unlockTracker_direct() const
   * @0x13218e0
   *
   *   pushq %rbp; movq %rsp,%rbp
   *   lock decl 0x134(%rdi)                       ;; --trackerDepth_direct
   *   addq  $0x10,%rdi                            ;; &this->trackerSync
   *   popq  %rbp
   *   jmp   __ZN16FFSynchronizable6UnlockEv
   *
   * Same shape as unlockStream_direct with the two offsets swapped.
   */
  unlockTracker_direct(): void {
    // @0x13218e5 — `lock decl 0x134(%rdi)`.
    this.trackerDepth_direct = (this.trackerDepth_direct - 1) | 0;
    // @0x13218ef — tail-call FFSynchronizable::Unlock on trackerSync (+0x10).
    this.trackerSync.Unlock();
  }

  /**
   * FFDestAnalyzerSynchronizer::RunProcess_(void*)
   * @0x1320a80
   *
   *   pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax
   *   movq  %rdi,%rbx
   *   movq  %rdi,-0x10(%rbp)                       ;; on-stack copy of `this`
   *                                                ;;   later reached by ref as
   *                                                ;;   the lambda's captured
   *                                                ;;   pointer (see below).
   *   leaq  0x36db80(%rip),%rdi   ;; "com.apple.flexo.ffdest.tracking"
   *   callq _pthread_setname_np                    ;; @stub 0x1497b1e
   *
   *   movl  $0x11,%edi            ;; QOS_CLASS_UTILITY
   *   xorl  %esi,%esi             ;; relative_priority = 0
   *   callq _pthread_set_qos_class_self_np         ;; @stub 0x1497b18
   *
   *   movq  0x140(%rbx),%rdi                       ;; this->analyzer
   *   movq  0x8e0915(%rip),%rsi                    ;; selref @__objc_selrefs
   *                                                ;;   -> selector "arranged"
   *   callq *0x5ccc07(%rip)                        ;; objc_msgSend
   *
   *   leaq  -0x10(%rbp),%rsi                       ;; &this (on-stack)
   *   movq  %rbx,%rdi                              ;; this
   *   callq __ZNK26FFDestAnalyzerSynchronizer10lockStreamI...
   *         ;; FFDestAnalyzerSynchronizer::lockStream<lambda-in-RunProcess_>
   *
   *   xorl  %eax,%eax                              ;; return null (void*)
   *   addq  $0x8,%rsp; popq %rbx; popq %rbp; retq
   *
   * Semantics: this is the entry point of a pthread that owns a
   * FFDestAnalyzerSynchronizer.  It (1) names the thread and pins its
   * QOS to UTILITY, (2) sends `arranged` to the analyzer (side-effect
   * on the Obj-C object; return value ignored), and (3) invokes the
   * templated `lockStream<Lambda>` helper.  The lambda's body is not
   * inlined into RunProcess_ — the templated instantiation lives at a
   * separate address that this port does not decode, so we surface it
   * as a throwing stub honouring PORTING_SPEC.md rule 3.
   *
   * The final `xorl %eax,%eax` + `retq` returns `nullptr` (void*), which
   * is the standard `pthread_start_routine`-style return value.
   *
   * @param _arg  the raw `void*` argument (native call-site @pthread_create).
   *              The port ignores it because the ASM ignores it too — the
   *              argument register `%rsi` at entry is never read.
   */
  RunProcess_(_arg: unknown): null {
    // @0x1320a94 — _pthread_setname_np(DEST_ANALYZER_THREAD_NAME).
    if (hostPthreadSetName === null) {
      throw new Error("FFDestAnalyzerSynchronizer.RunProcess_ @0x1320a94: host has not installed a _pthread_setname_np binding — install one via setPthreadSetName(fn) before running (stub @Flexo __stubs 0x1497b1e). Throwing stub per PORTING_SPEC.md rule 3 — not yet ported.");
    }
    hostPthreadSetName(DEST_ANALYZER_THREAD_NAME);

    // @0x1320aa0 — _pthread_set_qos_class_self_np(0x11, 0).
    if (hostPthreadSetQosClassSelf === null) {
      throw new Error("FFDestAnalyzerSynchronizer.RunProcess_ @0x1320aa0: host has not installed a _pthread_set_qos_class_self_np binding — install one via setPthreadSetQosClassSelf(fn) before running (stub @Flexo __stubs 0x1497b18). Throwing stub per PORTING_SPEC.md rule 3 — not yet ported.");
    }
    hostPthreadSetQosClassSelf(DEST_ANALYZER_QOS_CLASS, DEST_ANALYZER_QOS_REL_PRIORITY);

    // @0x1320ab3 — objc_msgSend(this->analyzer, sel_arranged).
    if (this.analyzer !== null) {
      if (hostObjcMsgSendArranged === null) {
        throw new Error("FFDestAnalyzerSynchronizer.RunProcess_ @0x1320ab3: host has not installed an objc_msgSend `arranged` binding — install one via setObjcMsgSendArranged(fn) before running (selref @__objc_selrefs from @0x1320aac). Throwing stub per PORTING_SPEC.md rule 3 — not yet ported.");
      }
      hostObjcMsgSendArranged(this.analyzer);
    }

    // @0x1320ac0 — FFDestAnalyzerSynchronizer::lockStream<lambda-in-RunProcess_>(&this).
    // The templated instantiation is not decoded in this unit; throwing stub
    // honouring PORTING_SPEC.md rule 3.
    throw new Error("FFDestAnalyzerSynchronizer.RunProcess_ @0x1320ac0: FFDestAnalyzerSynchronizer::lockStream<lambda-in-RunProcess_> is not yet ported — the templated instantiation lives at a separate address in Flexo that this unit does not decode. Throwing stub per PORTING_SPEC.md rule 3.");
  }

  /**
   * FFDestAnalyzerSynchronizer::~FFDestAnalyzerSynchronizer() (D0)
   * @0x131ff70
   *
   *   pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax
   *   movq  %rdi,%rbx
   *   leaq  0x606f80(%rip),%rax                    ;; vtable pointer
   *   movq  %rax,(%rdi)                            ;; this->vtable = &vtable_FFDestAnalyzerSynchronizer
   *
   *   movq  0x148(%rdi),%rdi                       ;; this->analyzerRetained
   *   callq *0x5cd778(%rip)                        ;; _objc_release
   *
   *   leaq  0xa0(%rbx),%rdi                        ;; &this->streamSync
   *   callq __ZN16FFSynchronizableD1Ev              ;; ~FFSynchronizable (D1)
   *   leaq  0x10(%rbx),%rdi                        ;; &this->trackerSync
   *   callq __ZN16FFSynchronizableD1Ev              ;; ~FFSynchronizable (D1)
   *
   *   movq  %rbx,%rdi
   *   addq  $0x8,%rsp; popq %rbx; popq %rbp
   *   jmp   __ZdlPv                                ;; operator delete(this) — tail
   *
   *   [exception unwind: `movq %rax,%rdi; callq ___clang_call_terminate`]
   *
   * Semantics: the D0 destructor (a.k.a. deleting destructor):
   *   (1) rebinds the vtable to `FFDestAnalyzerSynchronizer`'s own so
   *       any virtual dispatch during member-dtor calls resolves to
   *       *this* class's implementations (standard Itanium-ABI behaviour);
   *   (2) releases the retained Obj-C analyzer @+0x148;
   *   (3) destructs the two embedded FFSynchronizables in reverse
   *       declaration order (streamSync first, then trackerSync — which
   *       is the Itanium-ABI convention: destructors run in reverse
   *       ctor-init order);
   *   (4) tail-calls `operator delete` to free the storage.
   *
   * In the JS port there is no `operator delete` to reach — GC handles
   * freeing.  We still model the two FFSynchronizable::destroy() calls
   * and the objc_release, all in the same order as the ASM.
   */
  destroy(): void {
    // @0x131ff79-131ff80 — vtable rebind is a no-op in the JS port
    // (there is no member-dtor virtual dispatch to shadow here).

    // @0x131ff8a — _objc_release(this->analyzerRetained).
    if (this.analyzerRetained !== null) {
      if (hostObjcRelease === null) {
        throw new Error("FFDestAnalyzerSynchronizer.~FFDestAnalyzerSynchronizer @0x131ff8a: host has not installed an _objc_release binding — install one via setObjcRelease(fn) before destroy() (literal-pool call in D0). Throwing stub per PORTING_SPEC.md rule 3 — not yet ported.");
      }
      hostObjcRelease(this.analyzerRetained);
      this.analyzerRetained = null;
    }

    // @0x131ff97 — FFSynchronizable::~FFSynchronizable on streamSync.
    this.streamSync.destroy();
    // @0x131ffa0 — FFSynchronizable::~FFSynchronizable on trackerSync.
    this.trackerSync.destroy();

    // @0x131ffae — `jmp __ZdlPv` (operator delete): no-op in JS (GC).
  }
}

// ORACLE NOTE
// This class has NO pure-math scalar fn to fuzz against a dlsym'd oracle:
// every method is (a) side-effect on an embedded mutex + counter, (b) a
// destructor, or (c) a pthread-bootstrap routine.  It is registered in the
// gate as a structural-only port; the gate still enforces provenance,
// tsc-clean, and PORTING_SPEC.md compliance.
