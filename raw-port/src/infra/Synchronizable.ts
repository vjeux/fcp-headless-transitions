// Synchronizable.ts — Flexo's Synchronizable recursive-lock primitive
// (raw x86_64 port).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
//         Versions/A/Flexo (macOS FCP, x86_64 slice; unadjusted VAs).
//
// This unit ports ONLY the C1 (complete-object) constructor
//   __ZN14SynchronizableC1Ev
//     — Synchronizable::Synchronizable()   @Flexo 0x1303250
//
// Synchronizable is a polymorphic condition-lock primitive: it embeds a POSIX
// pthread_mutex_t (+0x8) and pthread_cond_t (+0x58), plus an owner-id / depth
// pair at +0x48/+0x50 (the classic recursive-lock bookkeeping seen in the peer
// HGSynchronizable — raw-port/src/render/HGSynchronizable.ts — whose Lock()
// reads ownerTid @+0x48 and recurseCount @+0x50). The ctor zeroes that pair,
// installs the vtable, and initialises the two embedded pthread primitives.
//
// Same pthread modelling policy used across every pthread wrapper in this port
// (raw-port/src/infra/FFLock.ts C1, HGSynchronizable): pthread_mutex_init /
// pthread_cond_init are TRUE OUT-OF-SCOPE externs (libSystem.B.dylib). Because
// they carry no observable state under a single-threaded JS realm, they are
// modelled as injectable no-op defaults (matching FFLock's C1 ctor), not
// throws — the ctor itself does real work (field zeroing + vtable install +
// arg storage), so its body is transcribed in full.
//
// This is a FRESH class (not previously on origin/main). Future Synchronizable
// methods are separate ledger entries and must be ADDED to this file
// (additive extension only), never rewritten.
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/Flexo.__ZN14SynchronizableC1Ev.s — 20 lines)
// -----------------------------------------------------------------------------
//   __ZN14SynchronizableC1Ev:
//     0x1303250  pushq   %rbp
//     0x1303251  movq    %rsp, %rbp
//     0x1303254  pushq   %rbx
//     0x1303255  pushq   %rax
//     0x1303256  movq    %rdi, %rbx               ; rbx = this
//     0x1303259  leaq    0x623628(%rip), %rax     ; rax = &vtable for Synchronizable
//                                                 ;   (file addr 0x1926888 =
//                                                 ;    next-insn 0x1303260 + 0x623628)
//     0x1303260  movq    %rax, (%rdi)             ; this->vptr = &vtable   (+0x00)
//     0x1303263  addq    $0x8, %rdi               ; rdi = &this->mutex     (+0x08)
//     0x1303267  xorps   %xmm0, %xmm0             ; xmm0 = 0 (128-bit)
//     0x130326a  movups  %xmm0, 0x48(%rbx)        ; this->ownerTid = 0 (+0x48),
//                                                 ; this->recurseCount = 0 (+0x50)
//                                                 ;   (single 16-byte store)
//     0x130326e  xorl    %esi, %esi               ; attr = NULL
//     0x1303270  callq   _pthread_mutex_init      ; pthread_mutex_init(&this->mutex, NULL)
//                                                 ;   (symbol stub @0x1497ae8)
//     0x1303275  addq    $0x58, %rbx              ; rbx = &this->cond      (+0x58)
//     0x1303279  movq    %rbx, %rdi
//     0x130327c  xorl    %esi, %esi               ; attr = NULL
//     0x130327e  addq    $0x8, %rsp
//     0x1303282  popq    %rbx
//     0x1303283  popq    %rbp
//     0x1303284  jmp     _pthread_cond_init       ; tail-call pthread_cond_init(&this->cond, NULL)
//                                                 ;   (symbol stub @0x1497a7c)
//     0x1303289  nopl    (%rax)                   ; alignment pad
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (both TRUE OUT-OF-SCOPE externs — libSystem / pthread)
// -----------------------------------------------------------------------------
//   * _pthread_mutex_init   @Flexo stub 0x1497ae8 — called @0x1303270 with
//                           &this->mutex (this+0x8), attr=NULL. POSIX pthread.
//   * _pthread_cond_init    @Flexo stub 0x1497a7c — tail-called @0x1303284 with
//                           &this->cond (this+0x58), attr=NULL. POSIX pthread.
//     Both libSystem.B.dylib. Modelled as injectable no-op defaults (single-
//     thread JS has no real mutex/cond state to initialise), matching FFLock.C1.
//
// STRUCT LAYOUT (recovered from the ctor above)
//   struct Synchronizable {
//     +0x00  void**           vptr;         // vtable ptr, pinned to &vtable @0x1926888
//     +0x08  pthread_mutex_t  mutex;        // embedded POSIX mutex (pthread_mutex_init)
//     +0x48  uint64           ownerTid;     // zeroed by ctor (16-byte xmm store)
//     +0x50  uint64           recurseCount; // zeroed by ctor (16-byte xmm store)
//     +0x58  pthread_cond_t   cond;         // embedded POSIX condvar (pthread_cond_init)
//   };

/**
 * `_pthread_mutex_init` — POSIX mutex initialiser. Called from the ctor
 * @Flexo 0x1303270 with `&this->mutex` (= this+0x8) and `attr = NULL`
 * (`xorl %esi,%esi` @0x130326e), via the Flexo symbol stub @0x1497ae8.
 * TRUE out-of-scope extern (libSystem). Modelled as an injectable no-op
 * default (single-thread JS — no real mutex state), matching FFLock's C1.
 */
function pthread_mutex_init_default(_mutexPtr: Synchronizable, _attr: number): void {
  // No-op faithful to single-thread semantics; see file header notes.
}

/**
 * `_pthread_cond_init` — POSIX condition-variable initialiser. Tail-called
 * from the ctor @Flexo 0x1303284 with `&this->cond` (= this+0x58) and
 * `attr = NULL` (`xorl %esi,%esi` @0x130327c), via the Flexo symbol stub
 * @0x1497a7c. TRUE out-of-scope extern (libSystem). Modelled as an injectable
 * no-op default (single-thread JS — no real cond state), matching FFLock's C1.
 */
function pthread_cond_init_default(_condPtr: Synchronizable, _attr: number): void {
  // No-op faithful to single-thread semantics; see file header notes.
}

let _pthread_mutex_init_impl: (m: Synchronizable, attr: number) => void =
  pthread_mutex_init_default;
let _pthread_cond_init_impl: (c: Synchronizable, attr: number) => void =
  pthread_cond_init_default;

/** Inject real pthread_mutex_init / pthread_cond_init boundaries (for a
 *  threaded backend). */
export function __setSynchronizablePthreadInit(
  mutexInit: (m: Synchronizable, attr: number) => void,
  condInit: (c: Synchronizable, attr: number) => void,
): void {
  _pthread_mutex_init_impl = mutexInit;
  _pthread_cond_init_impl = condInit;
}

/**
 * `vtable for Synchronizable` @Flexo 0x1926888.
 *
 * Derived from the ctor body @0x1303259/0x1303260:
 *   leaq 0x623628(%rip), %rax     ; RIP = next-instr 0x1303260 + 0x623628 = 0x1926888
 *   movq %rax, (%rdi)             ; this->vptr = &vtable
 * (Itanium ABI: this is the installed vtable pointer — first virtual-function
 * slot, past the RTTI/offset-to-top preamble.) Stored on every constructed
 * instance so virtual-dispatch callers can resolve concrete slots when those
 * slots are pinned by later units.
 */
export const SYNCHRONIZABLE_VTABLE_ADDR = 0x1926888;

/**
 * `Synchronizable` — Flexo's concrete pthread-mutex+cond recursive lock.
 *
 * Only the C1 constructor is ported by this unit; Lock/Unlock/wait/signal and
 * the dtor (which drive the +0x48 ownerTid / +0x50 recurseCount against the
 * +0x8 mutex and +0x58 cond) are separate ledger entries.
 */
export class Synchronizable {
  /** @+0x00 vptr — pinned to &vtable-for-Synchronizable @0x1926888 by the ctor
   *  (`leaq 0x623628(%rip),%rax; movq %rax,(%rdi)` @0x1303259/0x1303260). */
  vptr = 0;

  /** @+0x08 mutex — embedded POSIX pthread_mutex_t. Modelled as an opaque
   *  handle (this instance) passed to the pthread_mutex_init boundary; JS has
   *  no pointer arithmetic so the compile-time +0x8 offset collapses to
   *  passing `this`. */
  // (No standalone TS field — the boundary receives `this` as the handle.)

  /** @+0x48 ownerTid — pthread_self() token of the owning thread; 0 == unowned.
   *  Zeroed by the ctor's 16-byte `movups %xmm0, 0x48(%rbx)` @0x130326a. */
  ownerTid = 0n;

  /** @+0x50 recurseCount — recursion depth; 0 while unowned. Zeroed by the same
   *  16-byte `movups %xmm0, 0x48(%rbx)` store @0x130326a (the store covers
   *  +0x48..+0x57, i.e. both this qword and ownerTid). */
  recurseCount = 0n;

  /** @+0x58 cond — embedded POSIX pthread_cond_t. Modelled as an opaque handle
   *  (this instance) passed to the pthread_cond_init boundary. */
  // (No standalone TS field — the boundary receives `this` as the handle.)

  /**
   * `Synchronizable::Synchronizable()` — the C1 (complete-object) constructor.
   * @Flexo 0x1303250 (__ZN14SynchronizableC1Ev).
   *
   * Faithful transcription of the 20-line disassembly quoted in the file
   * header.
   */
  constructor() {
    // @0x1303259/0x1303260: leaq &vtable(%rip); movq %rax,(%rdi) — install vptr.
    this.vptr = SYNCHRONIZABLE_VTABLE_ADDR;
    // @0x1303267/0x130326a: xorps %xmm0,%xmm0; movups %xmm0,0x48(%rbx) —
    //   single 16-byte store zeroing ownerTid (+0x48) and recurseCount (+0x50).
    this.ownerTid = 0n;
    this.recurseCount = 0n;
    // @0x1303263/0x130326e/0x1303270: rdi = &mutex(+0x8); esi = NULL;
    //   pthread_mutex_init(&this->mutex, NULL).
    _pthread_mutex_init_impl(this, 0);
    // @0x1303275..0x1303284: rbx = &cond(+0x58); rdi = rbx; esi = NULL;
    //   tail-jmp pthread_cond_init(&this->cond, NULL).
    _pthread_cond_init_impl(this, 0);
  }
}
