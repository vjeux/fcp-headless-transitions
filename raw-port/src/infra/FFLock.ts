// FFLock.ts — the FCP Flexo framework's concrete pthread_mutex-backed lock.
// Faithfully transcribed from the FCP Flexo binary at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
//     Versions/A/Flexo
//
// This unit ports ONLY the C1 (complete-object) constructor
//   FFLock::FFLock()   __ZN6FFLockC1Ev   @Flexo 0x12b9230
//
// Source disassembly (12 lines):
//   raw-port/re/disasm/Flexo.__ZN6FFLockC1Ev.s
//
//   0x12b9230  pushq   %rbp
//   0x12b9231  movq    %rsp, %rbp
//   0x12b9234  movq    $0x0, 0x8(%rdi)          ; this->owner  = 0        (+0x08 qword)
//   0x12b923c  movl    $0x0, 0x10(%rdi)         ; this->depth  = 0        (+0x10 u32)
//   0x12b9243  leaq    0x66c4d6(%rip), %rax     ; rax = &vtable for FFLock @0x1925720
//   0x12b924a  movq    %rax, (%rdi)             ; this->__vfptr = &vtable (+0x00)
//   0x12b924d  addq    $0x18, %rdi              ; rdi = &this->mutex      (+0x18)
//   0x12b9251  xorl    %esi, %esi               ; attr = NULL
//   0x12b9253  popq    %rbp
//   0x12b9254  jmp     _pthread_mutex_init      ; tail-call pthread_mutex_init(&mutex, NULL)
//                                               ;   (symbol stub @0x1497ae8)
//
// STRUCT LAYOUT (recovered from the ctor above):
//   struct FFLock {
//     +0x00  void** __vfptr;        // vtable ptr, pinned to &vtable-for-FFLock @0x1925720
//     +0x08  pthread_t owner;       // 0 == no owner (zeroed by ctor)
//     +0x10  uint32_t depth;        // recursion count (zeroed by ctor)
//     +0x18  pthread_mutex_t mutex; // embedded POSIX mutex, initialised via pthread_mutex_init
//   };
//
// FFLock is distinct from FFLockBase (infra/FFLockBase.ts): FFLockBase is an
// ABSTRACT recursive lock whose acquire/release primitives dispatch through
// its vtable; FFLock is a CONCRETE class that embeds a real pthread_mutex_t at
// +0x18 and initialises it directly in its ctor. Both keep an owner word at
// +0x08 and a recursion/depth word at +0x10, but their layouts and vtables
// differ (FFLock's vtable is @0x1925720, FFLockBase's is @Flexo 0x?..595).
//
// pthread_mutex_init is a TRUE out-of-scope extern (libSystem.B.dylib POSIX);
// per project policy (and matching the peer HGSynchronizable ctor port), it is
// modelled as an injectable no-op default — single-threaded JS has no real
// mutex state to initialise, and the init call is the entire interaction.

/**
 * `_pthread_mutex_init` — POSIX mutex initialiser. Tail-called from the
 * FFLock ctor @Flexo 0x12b9254 with `&this->mutex` (= `this + 0x18`) in %rdi
 * and `attr = NULL` (%esi := 0 via `xorl %esi,%esi` @0x12b9251). Reached via
 * the Flexo symbol stub @0x1497ae8. TRUE out-of-scope extern (libSystem).
 * Modelled as an injectable no-op default (single-thread JS semantics — no
 * real mutex state to initialise), matching the HGSynchronizable ctor port.
 */
function pthread_mutex_init_default(_mutexPtr: FFLock, _attr: number): void {
  // No-op faithful to single-thread semantics; see file header notes.
}

let _pthread_mutex_init_impl: (m: FFLock, attr: number) => void =
  pthread_mutex_init_default;

/** Inject a real pthread_mutex_init boundary (for a threaded backend). */
export function __setFFLockPthreadMutexInit(
  fn: (m: FFLock, attr: number) => void,
): void {
  _pthread_mutex_init_impl = fn;
}

/**
 * `vtable for FFLock` @Flexo 0x1925720.
 *
 * Derived from the ctor body @0x12b9243:
 *   leaq 0x66c4d6(%rip), %rax     ; RIP = next-instr 0x12b924a + 0x66c4d6 = 0x1925720
 *   movq %rax, (%rdi)             ; this->__vfptr = &vtable
 * (Itanium ABI: this address is the installed vtable pointer, i.e. it points
 * at the first virtual function slot, 0x10 past the RTTI/offset-to-top
 * preamble.) Stored on every constructed instance so virtual-dispatch callers
 * can resolve concrete slots when those slots are pinned by later units.
 */
export const FFLOCK_VTABLE_ADDR = 0x1925720;

/**
 * `FFLock` — Flexo's concrete pthread_mutex-backed lock.
 *
 * Only the C1 constructor is ported by this unit; lock()/tryLock()/unlock()
 * (which drive the +0x08 owner / +0x10 depth words against the +0x18 mutex)
 * are separate ledger entries claimed when their call sites demand them.
 */
export class FFLock {
  /** @+0x00 __vfptr — pinned to &vtable-for-FFLock @0x1925720 by the ctor. */
  __vfptr: number = 0;

  /** @+0x08 owner — pthread_t of the owning thread; 0 == unowned. Zeroed by
   *  the ctor (`movq $0x0, 0x8(%rdi)` @0x12b9234). */
  owner = 0;

  /** @+0x10 depth — recursion count; 0 while unowned. Zeroed by the ctor
   *  (`movl $0x0, 0x10(%rdi)` @0x12b923c). */
  depth = 0;

  /** @+0x18 mutex — embedded POSIX pthread_mutex_t. Modelled as an opaque
   *  handle (this instance) passed to the pthread_mutex_init boundary; JS has
   *  no pointer arithmetic so the compile-time +0x18 offset collapses to
   *  passing `this`. */
  // (No TS field needed — the stub receives `this` as the mutex handle.)

  /**
   * `FFLock::FFLock()` — the C1 (complete-object) constructor.
   * @Flexo 0x12b9230
   */
  constructor() {
    // @Flexo 0x12b9234: movq $0x0, 0x8(%rdi)   — owner = 0
    this.owner = 0;
    // @Flexo 0x12b923c: movl $0x0, 0x10(%rdi)  — depth = 0
    this.depth = 0;
    // @Flexo 0x12b9243-0x12b924a: leaq &vtable(%rip) ; movq %rax,(%rdi)
    this.__vfptr = FFLOCK_VTABLE_ADDR;
    // @Flexo 0x12b924d-0x12b9254: rdi = &mutex(+0x18); esi = NULL;
    //   tail-jmp _pthread_mutex_init(&this->mutex, NULL)
    _pthread_mutex_init_impl(this, 0);
  }

  /**
   * `FFLock::timedWait(long long)` — @Flexo 0x12b9370
   * (`__ZN6FFLock9timedWaitEx`).
   *
   * The body ignores both `this` and the signed 64-bit timeout argument:
   *   @0x12b9374  xorl %eax, %eax  — return false
   * No lock state is read or changed.
   */
  timedWait(_timeout: bigint): boolean {
    return false;
  }
}
