// Thread.ts — Flexo's `Thread` object (a Runnable-carrying worker-thread
// handle).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
//         Versions/A/Flexo (macOS FCP, x86_64 slice; unadjusted VAs from
//         `otool -tV`).
//
// This file ports ONLY the constructor
//   Thread::Thread(Runnable*)  @Flexo 0x1303560
// Other members of Thread (start/join/the run trampoline, dtor) are separate
// ledger entries and will be added to this same file when their own units are
// claimed.
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (recovered from the ctor)
// -----------------------------------------------------------------------------
// Thread {
//   +0x00  __vptr   : Thread vtable pointer   (installed @0x130356b to the
//                                              vtable at Flexo VA 0x19268b8;
//                                              see VTABLE PROVENANCE below)
//   +0x08  runnable : Runnable*               (arg 1, stored @0x130356e)
//   +0x10  <ptr>    : void* = null            (zeroed @0x1303572 — an OS
//                                              thread handle / pthread_t slot
//                                              not yet assigned at construction)
//   +0x18  <bool>   : bool  = false           (a 1-byte flag zeroed @0x130357a
//                                              — a not-yet-started/joined flag)
// }
//
// VTABLE PROVENANCE
//   `leaq 0x62334d(%rip), %rax` at 0x1303564 has its RIP base at the NEXT
//   instruction (0x130356b), so it resolves to
//       0x130356b + 0x62334d = 0x19268b8
//   the `Thread` vtable (the __ZTV6Thread slot the compiler loads to install
//   as the object's vptr). No virtual method is CALLED in the ctor — the vptr
//   is only stored — so there is no dispatch target to resolve, just the
//   vtable ADDRESS, which is cited here per PORTING_SPEC Rule 2.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled -> address)
// -----------------------------------------------------------------------------
//   * __ZN6ThreadC1EP8Runnable
//       — Thread::Thread(Runnable*)  @Flexo 0x1303560
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/Flexo.__ZN6ThreadC1EP8Runnable.s)
// -----------------------------------------------------------------------------
//   0x1303560  pushq  %rbp
//   0x1303561  movq   %rsp, %rbp
//   0x1303564  leaq   0x62334d(%rip), %rax   ; rax = &Thread_vtable (0x19268b8)
//   0x130356b  movq   %rax, (%rdi)           ; this->__vptr = &Thread_vtable
//   0x130356e  movq   %rsi, 0x8(%rdi)        ; this->runnable = arg1 (Runnable*)
//   0x1303572  movq   $0x0, 0x10(%rdi)       ; this->[+0x10] = nullptr
//   0x130357a  movb   $0x0, 0x18(%rdi)       ; this->[+0x18] = 0 (false)
//   0x130357e  popq   %rbp
//   0x130357f  retq
//
// Dependencies: 0 in-scope callees, 0 indirect calls, 0 externs. Pure member
// initialisation + vptr install.
// -----------------------------------------------------------------------------

/**
 * Opaque `Runnable*` — the work object a Thread runs. The ctor only stores the
 * pointer (no dereference), so it is modelled as an opaque token here; the
 * full Runnable interface is a separate ledger entry.
 */
export type Runnable = object;

/**
 * The `Thread` vtable address (Flexo VA 0x19268b8), resolved from the ctor's
 * `leaq 0x62334d(%rip)` (RIP base 0x130356b + 0x62334d). Modelled as a branded
 * constant so the vptr install is explicit and the address is cited in one
 * place. No virtual dispatch occurs in the ctor.
 */
export const THREAD_VTABLE_ADDR = 0x19268b8 as const;

/**
 * `Thread` — Flexo Runnable-carrying worker-thread handle. Only the
 * `Runnable*` constructor is ported so far; the rest of the behaviour lands
 * with its own units.
 */
export class Thread {
  /**
   * this+0x00 — the C++ vtable pointer. The ctor installs the Thread vtable
   * at Flexo 0x19268b8 (@0x130356b). Modelled as the resolved address; TS has
   * no real vtable, so this records which vtable the object was given.
   */
  __vptr: number = THREAD_VTABLE_ADDR;

  /**
   * this+0x08 — the target work object (`Runnable*`), stored from ctor arg 1
   * (@0x130356e). `null` until the ctor runs.
   */
  runnable: Runnable | null = null;

  /**
   * this+0x10 — a pointer slot the ctor zeroes (@0x1303572); most likely the
   * OS thread handle (pthread_t) assigned by a later `start()`. `null` at
   * construction.
   */
  private _handle: unknown = null;

  /**
   * this+0x18 — a 1-byte flag the ctor zeroes (@0x130357a); most likely a
   * started/joined flag set by later members. `false` at construction.
   */
  private _flag: boolean = false;

  /**
   * `Thread::Thread(Runnable*)` — @Flexo 0x1303560
   *   (__ZN6ThreadC1EP8Runnable — the C1 unified constructor).
   *
   * Faithful transcription of the 10-instruction body. `%rdi` is the implicit
   * `this`; `%rsi` is arg 1 (the `Runnable*`):
   *
   *   0x1303564/0x130356b  this->__vptr    = &Thread_vtable (0x19268b8)
   *   0x130356e            this->runnable  = arg1 (Runnable*)
   *   0x1303572            this->[+0x10]   = nullptr
   *   0x130357a            this->[+0x18]   = 0 (false)
   *
   * Pure member initialisation + vptr install — no branches, no callees, no
   * externs.
   */
  constructor(runnable: Runnable | null) {
    // @0x130356b movq %rax,(%rdi) : install the Thread vtable pointer.
    this.__vptr = THREAD_VTABLE_ADDR;
    // @0x130356e movq %rsi,0x8(%rdi) : store the Runnable* argument.
    this.runnable = runnable;
    // @0x1303572 movq $0x0,0x10(%rdi) : zero the handle slot.
    this._handle = null;
    // @0x130357a movb $0x0,0x18(%rdi) : zero the flag byte.
    this._flag = false;
  }
}
