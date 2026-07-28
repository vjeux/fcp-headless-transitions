// DisablePrioritizedWritesRAII.ts — Flexo framework class.
// Transcribed from the x86_64 disassembly of Flexo in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// (see raw-port/re/disasm/Flexo.DisablePrioritizedWritesRAII.*.s + llvm-objdump).
//
// Symbols (nm -arch x86_64 | c++filt):
//   0x00478080 T __ZN28DisablePrioritizedWritesRAIIC2EP12FFSharedLock  (C2 base ctor)
//   0x004780b0 T __ZN28DisablePrioritizedWritesRAIIC1EP12FFSharedLock  (C1 complete ctor)
//   0x004780e0 T __ZN28DisablePrioritizedWritesRAIID2Ev                (D2 base dtor)
//   0x00478120 T __ZN28DisablePrioritizedWritesRAIID1Ev                (D1 complete dtor)
//
// PROVENANCE / DECODE:
//   raw-port/re/disasm/Flexo.DisablePrioritizedWritesRAII.DisablePrioritizedWritesRAII.s (C1 @0x4780b0)
//   raw-port/re/disasm/Flexo.DisablePrioritizedWritesRAII.~DisablePrioritizedWritesRAII.s (D1 @0x478120)
//   C2 @0x478080 / D2 @0x4780e0 read via `xcrun llvm-objdump --arch=x86_64 --macho -d`.
//   Referenced externs:
//     _objc_retain                                           libobjc.A.dylib
//     _objc_release                                          libobjc.A.dylib
//     objc_msgSend via `-[FFSharedLock privateBeginDisableWritePrioritization]`
//     objc_msgSend via `-[FFSharedLock privateEndDisableWritePrioritization]`
//     ___clang_call_terminate                                libc++abi   (called if _msgSend throws inside D1)
//
// ── ROLE ─────────────────────────────────────────────────────────────────
// A scope-guard (RAII) that momentarily disables Flexo's "prioritized-writes"
// mode on an FFSharedLock.  On construction it ARC-retains the lock and sends
// `-[FFSharedLock privateBeginDisableWritePrioritization]`; on destruction it
// sends the paired `-[FFSharedLock privateEndDisableWritePrioritization]` and
// ARC-releases the lock.
//
// C1 == C2 (identical body); D1 == D2 (identical body).  Both ctor aliases
// deliberately implement the SAME code — the compiler emitted two separate
// entry points rather than aliasing because ObjC ARC's ARC-retain call sites
// carry per-callsite metadata (the `objc_retain` stub load and the tail-
// call site).  We port them as a single JS class whose lifecycle mirrors
// the ObjC ARC semantics.
//
// ── STRUCT LAYOUT (recovered from C2 @0x478080 and D2 @0x4780e0) ─────────
//   +0x00  lock : FFSharedLock*    (strong ref; retained on ctor, released on dtor)
//                                  Set at ctor 0x478092 (`movq %rax, (%rbx)` after
//                                  the objc_retain), read at dtor 0x4780e9
//                                  (`movq (%rdi), %rdi`) and 0x4780f9
//                                  (`movq (%rbx), %rdi`).
//   sizeof: 0x08  (the only field observed).  Stack slot allocated by any
//                 caller aligned to 16 bytes (compiler adds padding).
//
// ── D1 UNWIND TAIL ───────────────────────────────────────────────────────
// The trailing 3 lines of D1 @0x478149..0x47814c are an Itanium unwind
// personality tail that forwards to `___clang_call_terminate` — reached if
// the objc_msgSend at 0x478133 raises.  In native ARC that would call
// std::terminate; in TS an exception simply propagates out of destroy()
// (there is no such thing as a destructor-during-unwind here).  We DO NOT
// need to model that tail: it corresponds to a "throw during dtor" behaviour
// that is C++-specific and has no analog in JS's exception model.

import type { FFSharedLock } from "./ProhibitFFSharedLockRAII.js";

/**
 * A JS-side handle to the ARC retain-count of an FFSharedLock.
 *
 * ObjC ARC (`_objc_retain` / `_objc_release`) has no analog in the pure-JS
 * runtime — the JS object graph gives us reference identity but no
 * observable retain count.  We keep a nominal pair of methods here so that
 * ANY future FFSharedLock port with a decoded retain/release path can wire
 * them in without changing this file's shape.  Until then, retain/release
 * are identity operations (they return the same pointer they were given).
 *
 * Cited @Flexo 0x4780bc (retain), 0x47813c (release).
 */
interface ObjcARC {
  /** _objc_retain — @Flexo 0x4780bc (via literal pool). */
  retain(obj: FFSharedLock): FFSharedLock;
  /** _objc_release — @Flexo 0x47813c (via literal pool). */
  release(obj: FFSharedLock): void;
}

/**
 * Default identity ARC implementation.  Ports of FFSharedLock that add
 * observable retain-count semantics can substitute their own via
 * {@link DisablePrioritizedWritesRAII.setARC}.
 */
const identityARC: ObjcARC = {
  retain(obj) { return obj; },
  release(_obj) { /* no-op — JS GC owns lifetime */ },
};

/**
 * Selector ports for the two ObjC methods invoked by ctor/dtor.  These are
 * the WHOLE observable behaviour of this class outside of retain/release.
 * We model them as an interface the FFSharedLock frontier stub can fulfil.
 *
 * Cited selectors (from `xcrun llvm-objdump --arch=x86_64 --macho -d`):
 *   0x4780c5  selector ref: `privateBeginDisableWritePrioritization`
 *   0x47812c  selector ref: `privateEndDisableWritePrioritization`
 */
export interface FFSharedLockPrioritizationBridge {
  /** `-[FFSharedLock privateBeginDisableWritePrioritization]` @Flexo 0x4780d5 (tail-called from C1). */
  privateBeginDisableWritePrioritization(lock: FFSharedLock): void;
  /** `-[FFSharedLock privateEndDisableWritePrioritization]` @Flexo 0x478133 (called from D1). */
  privateEndDisableWritePrioritization(lock: FFSharedLock): void;
}

/**
 * DisablePrioritizedWritesRAII — momentarily disables prioritized-writes
 * mode on an FFSharedLock for the duration of a scope.
 *
 * The C++ layout is a single 8-byte pointer field (the retained
 * FFSharedLock); the ObjC-runtime side effects are the whole point.
 *
 * Usage in the decoded call graph (see FFSharedLock ports):
 *   `{ auto raii = DisablePrioritizedWritesRAII(lock); ...work... }`
 *   In JS: `const raii = new DisablePrioritizedWritesRAII(lock); try { ...work... } finally { raii.destroy(); }`
 */
export class DisablePrioritizedWritesRAII {
  /**
   * +0x00 : FFSharedLock*   (strong reference — retained on ctor, released on dtor).
   *
   * The C1 body stores this at `(this)` via `movq %rax, (%rbx)` @0x4780c2
   * (after `objc_retain` returns the retained pointer in %rax).
   */
  private lock: FFSharedLock;

  /** Static ObjC bridge — set by whoever owns the FFSharedLock decode. */
  private static bridge: FFSharedLockPrioritizationBridge | null = null;

  /** Static ARC hooks — default is identity (JS GC-owned). */
  private static arc: ObjcARC = identityARC;

  /**
   * Install the FFSharedLock ObjC bridge.  Called once at bootstrap by
   * whoever ports FFSharedLock's `privateBeginDisableWritePrioritization` /
   * `privateEndDisableWritePrioritization` methods.  Until this is set,
   * both ctor and dtor throw with a cited @0xADDR.
   */
  public static setBridge(bridge: FFSharedLockPrioritizationBridge): void {
    DisablePrioritizedWritesRAII.bridge = bridge;
  }

  /**
   * Install a non-identity ARC implementation.  Optional — the default is
   * a no-op that returns the object as-is.
   */
  public static setARC(arc: ObjcARC): void {
    DisablePrioritizedWritesRAII.arc = arc;
  }

  /**
   * DisablePrioritizedWritesRAII::DisablePrioritizedWritesRAII(FFSharedLock*)
   *   —  Flexo @0x4780b0 (C1 complete ctor).  C2 @0x478080 has an IDENTICAL body.
   *
   * Faithful mirror of raw-port/re/disasm/
   * Flexo.DisablePrioritizedWritesRAII.DisablePrioritizedWritesRAII.s:
   *
   *   0x4780b0  pushq %rbp
   *   0x4780b1  movq  %rsp, %rbp
   *   0x4780b4  pushq %rbx
   *   0x4780b5  pushq %rax                       ; 16-byte stack align
   *   0x4780b6  movq  %rdi, %rbx                 ; %rbx = this
   *   0x4780b9  movq  %rsi, %rdi                 ; %rdi = arg lock
   *   0x4780bc  callq *_objc_retain(%rip)        ; %rax = objc_retain(lock)
   *   0x4780c2  movq  %rax, (%rbx)               ; this->lock = retained
   *   0x4780c5  movq  privateBegin...Sel(%rip), %rsi  ; %rsi = sel for privateBegin...
   *   0x4780cc  movq  %rax, %rdi                 ; %rdi = retained lock
   *   0x4780cf  addq  $0x8, %rsp
   *   0x4780d3  popq  %rbx
   *   0x4780d4  popq  %rbp
   *   0x4780d5  jmpq  *_objc_msgSend(%rip)       ; tail-call [lock privateBeginDisableWritePrioritization]
   *
   * The tail-call means the retained-lock's begin-message is the LAST
   * observable action of the ctor; any exception raised by it propagates
   * naturally.  We mirror that by calling begin() after storing the field.
   */
  public constructor(lock: FFSharedLock) {
    // 0x4780bc — objc_retain(lock); store the returned strong ref.
    //   Per objc_retain contract, the return value is the same pointer
    //   (or nil if input was nil); we honour that via identityARC.
    this.lock = DisablePrioritizedWritesRAII.arc.retain(lock);

    // 0x4780c2 — this->lock = retained pointer (implicit above).

    // 0x4780c5..0x4780d5 — tail-call [self.lock privateBeginDisableWritePrioritization].
    const bridge = DisablePrioritizedWritesRAII.bridge;
    if (bridge === null) {
      // FFSharedLock is not yet transcribed; the message send is a
      // frontier call.  Cited @Flexo 0x4780d5 (the tail-call site).
      throw new Error(
        "DisablePrioritizedWritesRAII: FFSharedLock ObjC bridge not " +
        "installed (call setBridge) — needed for " +
        "-[FFSharedLock privateBeginDisableWritePrioritization] @Flexo 0x4780d5"
      );
    }
    bridge.privateBeginDisableWritePrioritization(this.lock);
  }

  /**
   * DisablePrioritizedWritesRAII::~DisablePrioritizedWritesRAII()
   *   —  Flexo @0x478120 (D1 complete dtor).  D2 @0x4780e0 has an IDENTICAL body.
   *
   * Faithful mirror of raw-port/re/disasm/
   * Flexo.DisablePrioritizedWritesRAII.~DisablePrioritizedWritesRAII.s:
   *
   *   0x478120  pushq %rbp
   *   0x478121  movq  %rsp, %rbp
   *   0x478124  pushq %rbx
   *   0x478125  pushq %rax
   *   0x478126  movq  %rdi, %rbx                 ; %rbx = this
   *   0x478129  movq  (%rdi), %rdi               ; %rdi = this->lock
   *   0x47812c  movq  privateEnd...Sel(%rip), %rsi
   *   0x478133  callq *_objc_msgSend(%rip)       ; [lock privateEndDisableWritePrioritization]
   *   0x478139  movq  (%rbx), %rdi               ; reload this->lock
   *   0x47813c  callq *_objc_release(%rip)       ; objc_release(lock)
   *   0x478142  addq  $0x8, %rsp
   *   0x478146  popq  %rbx
   *   0x478147  popq  %rbp
   *   0x478148  retq
   *
   * The tail @0x478149..0x47814c (unreachable in the normal path) is the
   * Itanium unwind personality's terminate handler for a throw from the
   * msgSend at 0x478133 — see the module doc comment above.
   */
  public destroy(): void {
    // 0x478129/0x47812c/0x478133 — [self.lock privateEndDisableWritePrioritization].
    const bridge = DisablePrioritizedWritesRAII.bridge;
    if (bridge === null) {
      // Frontier: bridge not installed.  Cited @Flexo 0x478133.
      throw new Error(
        "DisablePrioritizedWritesRAII: FFSharedLock ObjC bridge not " +
        "installed (call setBridge) — needed for " +
        "-[FFSharedLock privateEndDisableWritePrioritization] @Flexo 0x478133"
      );
    }
    bridge.privateEndDisableWritePrioritization(this.lock);

    // 0x478139/0x47813c — objc_release(self.lock).
    DisablePrioritizedWritesRAII.arc.release(this.lock);
  }
}
