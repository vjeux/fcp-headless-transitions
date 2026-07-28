// DisablePrioritizedWritesRAII.ts — Flexo's tiny RAII scope guard around
// `[FFSharedLock privateBeginDisableWritePrioritization]` /
// `[FFSharedLock privateEndDisableWritePrioritization]`.
//
// The C++ class is a two-field-less-than-a-shared_ptr wrapper: it retains
// an `FFSharedLock*` in its single ivar at offset +0x00 and, in its
// destructor, sends the paired "end" selector and releases the retain.
// Between construct and destroy, "prioritized writes" on the shared lock
// are disabled — this is the plain-C++ counterpart of the ObjC
// `FFDisableWritePrioritizationObject` (which is the ObjC-object flavour
// of the same primitive, driven by the same selector pair on FFSharedLock:
// see @Flexo 0x477300 -[FFSharedLock privateBeginDisableWritePrioritization]
// and @Flexo 0x4773a0 -[FFSharedLock privateEndDisableWritePrioritization]).
//
// Transcribed from FCP Flexo framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// Disassembly saved at:
//   raw-port/re/disasm/Flexo.DisablePrioritizedWritesRAII.DisablePrioritizedWritesRAII.s  (C1 body @0x4780b0)
//   raw-port/re/disasm/Flexo.DisablePrioritizedWritesRAII.~DisablePrioritizedWritesRAII.s (D1 body @0x478120)
//   C2 @0x478080 and D2 @0x4780e0 were read from the linear `otool -tV`
//   dump and confirmed to be structurally identical to C1 and D1 (same
//   instruction sequence, only the RIP-relative offsets to the objc_*
//   __got imports and the two selrefs differ — every one of those offsets
//   still resolves to the SAME target import / selref).
//
// ─── C1 @Flexo 0x4780b0  (structurally == C2 @0x478080) ─────────────────────
//   Signature: DisablePrioritizedWritesRAII(FFSharedLock* lock)
//   Arguments (System V AMD64):
//     %rdi = this  (DisablePrioritizedWritesRAII*)
//     %rsi = lock  (FFSharedLock*)
//
//   __ZN28DisablePrioritizedWritesRAIIC1EP12FFSharedLock:
//     0x4780b0  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
//     0x4780b6  movq  %rdi, %rbx                              ; save this
//     0x4780b9  movq  %rsi, %rdi                              ; arg for objc_retain
//     0x4780bc  callq *0x147564e(%rip)                        ; = objc_retain
//                                                              ; target import __got slot @0x18eeb10
//                                                              ; (name resolved via `dyld_info -exports`
//                                                              ;  earlier ports use this same slot as
//                                                              ;  objc_retain: e.g. HGCFStringInto8859 etc)
//     0x4780c2  movq  %rax, (%rbx)                            ; this->lock = objc_retain(lock)
//     0x4780c5  movq  0x1753b4c(%rip), %rsi                   ; %rsi = selref @0x1bd3c18
//                                                              ; = @selector(privateBeginDisableWritePrioritization)
//                                                              ; (paired with D1's selref @0x1bd3c20;
//                                                              ;  semantic match to FFSharedLock's
//                                                              ;  privateBeginDisableWritePrioritization
//                                                              ;  method @Flexo 0x477300 and the class
//                                                              ;  name "DisablePrioritizedWritesRAII")
//     0x4780cc  movq  %rax, %rdi                              ; %rdi = this->lock (arg self)
//     0x4780d5  jmpq  *0x14755e5(%rip)                        ; TAIL objc_msgSend
//                                                              ; = [this->lock privateBeginDisableWritePrioritization]
//
// Semantics: retain the FFSharedLock pointer into +0x00 and immediately
// tell it to begin disabling write prioritization. The retain balances
// with the release in D1, and the "begin/end" bracket balances with the
// selector D1 sends.
//
// ─── D1 @Flexo 0x478120  (structurally == D2 @0x4780e0) ─────────────────────
//   __ZN28DisablePrioritizedWritesRAIID1Ev:
//     0x478120  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
//     0x478126  movq  %rdi, %rbx                              ; save this
//     0x478129  movq  (%rdi), %rdi                            ; %rdi = this->lock
//     0x47812c  movq  0x1753aed(%rip), %rsi                   ; %rsi = selref @0x1bd3c20
//                                                              ; = @selector(privateEndDisableWritePrioritization)
//     0x478133  callq *0x1475587(%rip)                        ; objc_msgSend
//                                                              ; = [this->lock privateEndDisableWritePrioritization]
//     0x478139  movq  (%rbx), %rdi                            ; %rdi = this->lock
//     0x47813c  callq *0x14755c6(%rip)                        ; = objc_release
//     0x478142  addq  $0x8, %rsp / popq %rbx / popq %rbp / retq
//     0x478149  movq  %rax, %rdi
//     0x47814c  callq ___clang_call_terminate                 ; landing pad if
//                                                              ;   objc_msgSend threw
//
// Semantics: send the "end" selector to the retained FFSharedLock, then
// release the retain. The tail unwind fragment at 0x478149 is the Itanium
// personality routine's landing pad — if the ObjC message throws, we go to
// `__clang_call_terminate`, which the C++ ABI reserves for
// `std::terminate`. Emitted for a dtor that can throw; matches the
// standard C++ rule "destructors that can throw must terminate".
//
// STRUCT LAYOUT (recovered from C1/D1):
//   DisablePrioritizedWritesRAII {
//     +0x00  lock : FFSharedLock*   (retained by ctor, released by dtor)
//   }
//
// FRONTIER CALLEES (undecoded — throwing / opaque stubs cite them):
//   _objc_retain                     C1 @0x4780bc  callq *[__got + 0x147564e]
//   _objc_release                    D1 @0x47813c  callq *[__got + 0x14755c6]
//   _objc_msgSend                    C1 @0x4780d5  jmpq  *[__got + 0x14755e5]
//                                    D1 @0x478133  callq *[__got + 0x1475587]
//   -[FFSharedLock privateBeginDisableWritePrioritization]  selref @0x1bd3c18 (impl @Flexo 0x477300)
//   -[FFSharedLock privateEndDisableWritePrioritization]    selref @0x1bd3c20 (impl @Flexo 0x4773a0)
//   ___clang_call_terminate          D1 @0x47814c  callq ___clang_call_terminate  (rethrow landing)
//
// The class is fully surface-decoded: two ObjC-boundary calls in each of
// ctor/dtor plus the reference-count management. The FFSharedLock ObjC
// class itself and its two `private*DisableWritePrioritization` selectors
// are frontier ObjC — kept as opaque brand + a required interface here.

/**
 * Opaque brand for the Objective-C class `FFSharedLock`. Only the two
 * selectors below are exercised by this RAII wrapper; a real port would
 * back this with the FCP Flexo `FFSharedLock` implementation (whose write-
 * prioritization primitive is defined at @Flexo 0x477300 / 0x4773a0).
 */
export interface FFSharedLock {
  /** ObjC selector: `-privateBeginDisableWritePrioritization`.
   *  Called from DisablePrioritizedWritesRAII's ctor tail
   *  @Flexo 0x4780d5 (via selref @0x1bd3c18 + objc_msgSend). */
  privateBeginDisableWritePrioritization(): void;

  /** ObjC selector: `-privateEndDisableWritePrioritization`.
   *  Called from DisablePrioritizedWritesRAII's dtor
   *  @Flexo 0x478133 (via selref @0x1bd3c20 + objc_msgSend). */
  privateEndDisableWritePrioritization(): void;
}

/**
 * Frontier: `_objc_retain` — invoked at @Flexo 0x4780bc as
 * `callq *[__got + 0x147564e]`. In TS the caller simply holds a reference
 * to the FFSharedLock; no refcount is tracked here. Documented so the
 * address chain stays traceable if the Flexo ObjC runtime port ever
 * materialises.
 */
function objc_retain(lock: FFSharedLock | null): FFSharedLock | null {
  // @Flexo 0x4780bc callq *[__got + 0x147564e] — TS-side identity.
  return lock;
}

/**
 * Frontier: `_objc_release` — invoked at @Flexo 0x47813c as
 * `callq *[__got + 0x14755c6]`. In TS the GC subsumes it.
 */
function objc_release(_lock: FFSharedLock | null): void {
  // @Flexo 0x47813c callq *[__got + 0x14755c6] — GC subsumes objc_release.
}

/**
 * Frontier: `___clang_call_terminate` — reached at @Flexo 0x47814c on the
 * dtor's exception landing pad. Emitted by the compiler because the
 * `-privateEndDisableWritePrioritization` message can throw and the ABI
 * requires a throwing dtor path to terminate. Documented for provenance.
 */
function __clang_call_terminate(_exc: unknown): never {
  // @Flexo 0x47814c callq ___clang_call_terminate — matches C++ ABI.
  throw new Error(
    "DisablePrioritizedWritesRAII::~D1 landing pad hit " +
      "(@Flexo 0x47814c): -privateEndDisableWritePrioritization threw and " +
      "the Itanium ABI would std::terminate here.",
  );
}

/**
 * `DisablePrioritizedWritesRAII` — Flexo write-prioritization scope guard.
 *
 * @Flexo symbols owned by this class:
 *   C2 @0x478080   ctor (retain + begin), body-identical to C1
 *   C1 @0x4780b0   ctor (retain + begin)
 *   D2 @0x4780e0   dtor (end + release), body-identical to D1
 *   D1 @0x478120   dtor (end + release)
 *
 * Observable field (recovered from C1/D1):
 *   lock — a retained `FFSharedLock*` at struct offset +0x00. The ctor
 *   retains its argument into this slot and immediately sends
 *   `-privateBeginDisableWritePrioritization`. The dtor sends the paired
 *   `-privateEndDisableWritePrioritization` and then releases the retain.
 */
export class DisablePrioritizedWritesRAII {
  /**
   * @Flexo struct offset +0x00 — the retained FFSharedLock*. Non-null after
   * a successful construction; set to null again by `destroy()` after the
   * end/release pair. TS uses GC in place of the retain/release cadence,
   * but the ObjC-side selector pair is still invoked for its side effects
   * (the FFSharedLock's internal state machine cares).
   */
  lock: FFSharedLock | null = null;

  /**
   * DisablePrioritizedWritesRAII(FFSharedLock* lock)
   * C1 @Flexo 0x4780b0 (== C2 @0x478080).
   *
   * Body (bit-exact):
   *   0x4780bc  callq *[__got + 0x147564e]   ; %rax = objc_retain(lock)
   *   0x4780c2  movq  %rax, (%rbx)           ; this->lock = %rax
   *   0x4780c5  movq  [rip + 0x1753b4c], %rsi ; = selref @0x1bd3c18 (begin)
   *   0x4780cc  movq  %rax, %rdi             ; self = this->lock
   *   0x4780d5  jmpq  *[__got + 0x14755e5]   ; TAIL objc_msgSend
   */
  constructor(lock: FFSharedLock | null) {
    // @Flexo 0x4780bc..0x4780c2 — retain into ivar.
    this.lock = objc_retain(lock);
    // @Flexo 0x4780c5..0x4780d5 — send the "begin" selector to it.
    // The tail-jump is a plain call in TS; the ObjC message is a virtual
    // method call resolved by JS method dispatch on the FFSharedLock.
    if (this.lock !== null) {
      this.lock.privateBeginDisableWritePrioritization();
    } else {
      // The shipped asm doesn't null-guard: `movq %rax, %rdi ; jmpq *[msgSend]`
      // — objc_msgSend on a nil self is a no-op per ObjC runtime rules, so
      // the effect on a null argument is "no-op end-to-end". Mirror that
      // exactly: skip the message send when the lock is null.
    }
  }

  /**
   * ~DisablePrioritizedWritesRAII()
   * D1 @Flexo 0x478120 (== D2 @0x4780e0).
   *
   * Body (bit-exact):
   *   0x478129  movq  (%rdi), %rdi             ; %rdi = this->lock
   *   0x47812c  movq  [rip + 0x1753aed], %rsi  ; = selref @0x1bd3c20 (end)
   *   0x478133  callq *[__got + 0x1475587]    ; objc_msgSend (end)
   *   0x478139  movq  (%rbx), %rdi             ; %rdi = this->lock
   *   0x47813c  callq *[__got + 0x14755c6]    ; objc_release
   *   0x478149-0x47814c  (unwind edge to __clang_call_terminate)
   */
  destroy(): void {
    const lock = this.lock;
    // @Flexo 0x478129..0x478133 — [this->lock privateEndDisableWritePrioritization]
    if (lock !== null) {
      try {
        lock.privateEndDisableWritePrioritization();
      } catch (exc) {
        // @Flexo 0x47814c — Itanium personality routine terminates on
        // throwing dtor. Mirror the semantics: any thrown value here is
        // fatal in the shipped binary.
        __clang_call_terminate(exc);
      }
    }
    // @Flexo 0x47813c — objc_release (subsumed by TS GC).
    objc_release(lock);
    this.lock = null;
  }
}
