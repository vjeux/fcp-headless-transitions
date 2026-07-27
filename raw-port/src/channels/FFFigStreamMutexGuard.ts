// FFFigStreamMutexGuard.ts — RAII scope guard that instruments a FFFigStreamMutex acquire under
// three inlined std::function<void()> callbacks (start / acquired / end) reported through the
// Instruments/kdebug signpost machinery. Verbatim from FCP's Flexo framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// Two Itanium ABI symbols observed (no vtable → no D0, no D2 alias; D1 alone):
//   @Flexo 0x0000000000e28ca0  FFFigStreamMutexGuard::FFFigStreamMutexGuard(FFFigStreamMutex&, FFFigStreamMutex::FFSignPostReason)   [C2 base ctor]
//   @Flexo 0x0000000000e1e9f0  FFFigStreamMutexGuard::~FFFigStreamMutexGuard()                                                       [D1 complete dtor]
// (Only the C2-mangled ctor is emitted, so C1 aliases C2 at the linker level.)
//
// STRUCT LAYOUT (recovered from ctor stores and dtor loads — 168 bytes):
//   +0x00   mutex           FFFigStreamMutex*                             (store @0xe28cc8: `movq %rsi, (%rdi)`)
//   +0x10   startCb         std::function<void()>                         (24-byte value block, see below)
//   +0x28   ...             ...
//   +0x30   startCb.__f_    void* function-pointer/inline-buffer          (init 0 @0xe28ccf; dtor test @0xe28e63)
//   +0x38   ...             ...
//   +0x40   acquiredCb      std::function<void()>                         (24-byte value block, second slot)
//   +0x58   ...             ...
//   +0x60   acquiredCb.__f_ void* function-pointer/inline-buffer          (init 0 @0xe28cd7; dtor test @0xe28e50)
//   +0x68   ...             ...
//   +0x70   endCb           std::function<void()>                         (24-byte value block, third slot)
//   +0x88   ...             ...
//   +0x90   endCb.__f_      void* function-pointer/inline-buffer          (init 0 @0xe28cdf; dtor test @0xe28a25)
//   +0x98   ...             ...
//   +0xa0   locker          FFLockerWithCallbacks*                        (unique_ptr slot; init 0 @0xe28cf1)
// Total sizeof = 0xa8 (168 bytes). We faithfully model the three std::function-shaped 48-byte
// value blocks as opaque record slots — TS cannot reproduce libc++'s __function::__value_func<void()>
// bit-layout, so we surface only the "outer pointer that gates the destructor's manager call"
// field plus the layout offsets.  The layout numbers here are what the destructor actually reads.
//
// std::function<void()>::__value_func VALUE-BLOCK LAYOUT (recovered from the trio of blocks at
// +0x10 / +0x40 / +0x70, each 48 bytes long):
//   The block is 3× 8-byte slots followed by a 24-byte payload; the pointer that gates destruction
//   is at slot +0x20 relative to the block base. The dtor path at 0xe1ea25 / 0xe1ea50 / 0xe1ea63
//   loads `0x90(%rbx)` / `0x60(%rbx)` / `0x30(%rbx)` and compares it against `blockBase + 0x20`
//   (the sentinel address for a "no manager, but stored inline" state) or against 0 (empty state):
//     eq   → `movl $0x20, %eax` → manager slot lookup uses vtable-like table[0x20]  ("small object" branch)
//     ne 0 → `movl $0x28, %eax` → manager slot lookup uses table[0x28]              ("large object" branch)
//     0    → skip (empty)
//   The manager call `callq *(%rcx,%rax)` is the standard libc++ __value_func::__destroy dispatch.
//
// CTOR OPERATION (@0xe28ca0..0xe28e78) — high-level, then line-by-line control flow:
//   1. Save this->mutex = &mutex_arg  (@0xe28cc8)
//   2. Zero the three std::function inline slots (+0x30, +0x60, +0x90) and the locker slot (+0xa0)
//   3. Allocate a 40-byte StartCallback closure via `::operator new(0x28)`, write:
//        [0x00] vtable ptr (rip-relative +0xaedf37 = @Flexo 0x8d6c48 — libc++ __function::__func vtable)
//        [0x08] FFFigStreamMutex::start(FFSignPostReason) function ptr    (@0xe28eb0)
//        [0x10] (implicit `this` capture slot for target's `this`; init 0)
//        [0x18] mutex_arg  (the captured &mutex)
//        [0x20] reason   (the captured FFSignPostReason enum, u32)
//      Then call std::__function::__value_func<void()>::swap on {this+0x10, tmp} to install it.
//   4. Same pattern for `acquiredCb` at +0x40, targeting FFFigStreamMutex::acquired() @0xe28ef0
//      (note: this callback takes no reason argument; its closure captures only `mutex` at +0x18
//       and leaves +0x20 as garbage-but-unused).
//   5. Same pattern for `endCb` at +0x70, targeting FFFigStreamMutex::end(FFSignPostReason) @0xe28f10
//      with captured reason.
//   6. Allocate a 24-byte FFLockerWithCallbacks::Callbacks struct on the stack at -0x68(%rbp);
//      call FFLockerWithCallbacks::FFLockerWithCallbacks(FFLock&, FFLockerWithCallbacks::Callbacks&)
//      @0xe28e3a with args (locker_alloc, this->mutex (as FFLock&), &callbacksTmp).
//      Store the new FFLockerWithCallbacks* into this->locker (+0xa0), and if the previous slot was
//      non-null, destroy+delete the prior one (unique_ptr replace semantics).
//   7. Verify ___stack_chk_guard.
//
// DTOR OPERATION (@0xe1e9f0..0xe1ea9b) — top-down:
//   1. Snapshot locker = this->locker (+0xa0); write nullptr into +0xa0. If snapshot non-null,
//      call FFLockerWithCallbacks::~FFLockerWithCallbacks() then ::operator delete(snapshot).
//   2. Destroy endCb    (+0x70..+0x98): if (+0x90 == this+0x70+0x20 → inline)   manager @+0x20
//                                       elif (+0x90 != 0)                        manager @+0x28
//                                       else                                     skip
//   3. Destroy acquiredCb (+0x40..+0x68): same 3-way, key at +0x60 vs this+0x60 vs 0.
//   4. Destroy startCb   (+0x10..+0x38): same 3-way, key at +0x30 vs this+0x30 vs 0.
//   NOTE the last block ends with a TAIL CALL `jmpq *(%rcx,%rax)` @0xe1ea9b, not a `callq/ret`.
//   The compiler folded the final destroy dispatch into the destructor's tail call.
//
// FRONTIER CALLEES (throwing stubs — Rule 3):
//   FFFigStreamMutex::start(FFSignPostReason)    @Flexo 0xe28eb0
//   FFFigStreamMutex::acquired()                 @Flexo 0xe28ef0
//   FFFigStreamMutex::end(FFSignPostReason)      @Flexo 0xe28f10
//   FFLockerWithCallbacks::FFLockerWithCallbacks(FFLock&, Callbacks&)   @Flexo 0xe28e3a
//   FFLockerWithCallbacks::~FFLockerWithCallbacks()                     @Flexo (D1 in Flexo)
//   std::__1::__function::__value_func<void ()>::swap                   @Flexo 0xe28d3d/0xe28d92/0xe28df4
//   ::operator new(size_t)  __Znwm                                      @Flexo stub 0x1497452
//   ::operator delete(void*) __ZdlPv                                    @Flexo stub 0x1497404
//   __function__value_func manager @+0x20 (inline) / +0x28 (heap)       (indirect dispatch)

// ── Opaque frontier types ─────────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FFFigStreamMutex {}
// FFFigStreamMutex::FFSignPostReason is a small integer enum (u32; passed in %edx / stored @+0x20 of
// the closure). We surface the width; we do NOT enumerate its values — none are read here.
export type FFSignPostReason = number;
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FFLock {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FFLockerWithCallbacks {}
// The 24-byte Callbacks struct built on the ctor's stack frame at -0x68(%rbp) then copied by ref
// into FFLockerWithCallbacks::FFLockerWithCallbacks. Layout not fully recovered here (would require
// disassembling that ctor); it is enough for us to know it exists as a by-value stack temp.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FFLockerWithCallbacks_Callbacks {}

/**
 * StdFunctionValueFunc — the 48-byte "value_func" tail of libc++'s std::function<void()>.
 * Offsets are recovered from the destructor's block-vs-inline sentinel comparisons:
 *   blockBase + 0x20   → the pointer that decides "empty / small / large".
 * The rest is opaque to us. We keep the whole block as a fixed-size record so callers cannot
 * accidentally under-size it.
 */
export interface StdFunctionValueFunc {
  /** +0x00..+0x20 opaque prefix (function-ptr, deleter slot, small-buffer slots). */
  prefixLo: unknown;
  /** +0x20  the "manager pointer" the destructor branches on. When it points at blockBase
   *  (i.e. `this+blockOff+0x20`), the callable lives inline in the block; when non-null and
   *  distinct, the callable was heap-allocated; when null, the function is empty. */
  managerPointer: unknown | null;
  /** +0x28..+0x30 opaque tail. */
  suffix: unknown;
}

// ── Frontier stubs (Rule 3) ───────────────────────────────────────────────────────────────────
/** ::operator new(size_t) via Flexo symbol stub @0x1497452. */
function operator_new(_size: number): { addr: 'heap-cell' } {
  throw new Error('::operator new (__Znwm @Flexo stub 0x1497452) not yet bound');
}
/** ::operator delete(void*) via Flexo symbol stub @0x1497404. */
function operator_delete(_p: unknown): void {
  throw new Error('operator delete (__ZdlPv @Flexo stub 0x1497404) not yet bound');
}
/** FFFigStreamMutex::start(FFSignPostReason) @Flexo 0xe28eb0 — signpost/kdebug on lock acquire begin. */
function FFFigStreamMutex_start(_self: FFFigStreamMutex, _reason: FFSignPostReason): void {
  throw new Error('FFFigStreamMutex::start @Flexo 0xe28eb0 not yet transcribed');
}
/** FFFigStreamMutex::acquired() @Flexo 0xe28ef0 — thread-block-tally timer stop on acquire. */
function FFFigStreamMutex_acquired(_self: FFFigStreamMutex): void {
  throw new Error('FFFigStreamMutex::acquired @Flexo 0xe28ef0 not yet transcribed');
}
/** FFFigStreamMutex::end(FFSignPostReason) @Flexo 0xe28f10 — signpost on release. */
function FFFigStreamMutex_end(_self: FFFigStreamMutex, _reason: FFSignPostReason): void {
  throw new Error('FFFigStreamMutex::end @Flexo 0xe28f10 not yet transcribed');
}
/** FFLockerWithCallbacks::FFLockerWithCallbacks(FFLock&, Callbacks&) @Flexo 0xe28e3a. */
function FFLockerWithCallbacks_ctor(
  _self: FFLockerWithCallbacks,
  _lock: FFLock,
  _callbacks: FFLockerWithCallbacks_Callbacks,
): void {
  throw new Error('FFLockerWithCallbacks::FFLockerWithCallbacks @Flexo 0xe28e3a not yet transcribed');
}
/** FFLockerWithCallbacks::~FFLockerWithCallbacks() (D1) @Flexo 0x12b9b30. Called @0xe1ea14 and @0xe28e4d. */
function FFLockerWithCallbacks_dtor(_self: FFLockerWithCallbacks): void {
  throw new Error('FFLockerWithCallbacks::~FFLockerWithCallbacks (D1) @Flexo 0x12b9b30 not yet transcribed');
}
/**
 * std::__1::__function::__value_func<void ()>::swap  @Flexo 0xe28d3d/0xe28d92/0xe28df4.
 * Signature: void swap(this*, __value_func<void()>& other).  The ctor uses it to move the just-
 * heap-allocated callback into the class's inline slot (destroying whatever was there — which
 * was empty because we just zeroed the slot).
 */
function StdFunction_valueFunc_swap(_dst: StdFunctionValueFunc, _src: StdFunctionValueFunc): void {
  throw new Error(
    'std::__function::__value_func<void()>::swap (nqe210106) @Flexo 0xe28d3d not yet transcribed',
  );
}
/**
 * __value_func manager dispatch — the indirect `callq *(%rcx,%rax)` in the destructor (@0xe1ea45,
 * 0xe1ea83, 0xe1ea9b(tail)) that invokes the __base's destroy(-and-deallocate) manager. The
 * eax offset (0x20 or 0x28) selects "small/inline object" vs "large/heap object" branch.
 */
function StdFunction_valueFunc_destroyDispatch(
  _managerPointer: unknown,
  _managerOffset: 0x20 | 0x28,
): void {
  throw new Error(
    'std::__function::__value_func manager destroy dispatch (indirect @Flexo 0xe1ea45/0xe1ea83/0xe1ea9b) not yet bound',
  );
}

// ── The class ─────────────────────────────────────────────────────────────────────────────────

/**
 * FFFigStreamMutexGuard — RAII wrapper around FFLockerWithCallbacks that also plumbs start /
 * acquired / end callbacks into FFFigStreamMutex's signpost/thread-block-tally machinery. One
 * instance = one bracketed lock acquisition.
 */
export class FFFigStreamMutexGuard {
  /** +0x00  FFFigStreamMutex* (non-owning pointer, stored @0xe28cc8). */
  private mutex: FFFigStreamMutex;
  /** +0x10..+0x38  std::function<void()> startCb — signposts + starts the block-tally timer. */
  private startCb: StdFunctionValueFunc;
  /** +0x40..+0x68  std::function<void()> acquiredCb — stops the block-tally timer. */
  private acquiredCb: StdFunctionValueFunc;
  /** +0x70..+0x98  std::function<void()> endCb — signposts the release. */
  private endCb: StdFunctionValueFunc;
  /** +0xa0  FFLockerWithCallbacks* (unique_ptr slot; owning). */
  private locker: FFLockerWithCallbacks | null;

  /**
   * C2 base constructor @Flexo 0xe28ca0.
   * Signature: FFFigStreamMutexGuard(FFFigStreamMutex& mutex, FFFigStreamMutex::FFSignPostReason reason)
   * ABI: %rdi = this, %rsi = &mutex, %edx = reason.
   */
  constructor(mutex: FFFigStreamMutex, reason: FFSignPostReason) {
    // @0xe28cc8 movq %rsi, (%rdi)
    this.mutex = mutex;

    // @0xe28ccf/0xe28cd7/0xe28cdf/0xe28cf1 — zero the three __value_func manager slots and locker.
    // We model that by initialising each std::function block with a null manager pointer.
    const emptyValueFunc = (): StdFunctionValueFunc => ({
      prefixLo: null,
      managerPointer: null,
      suffix: null,
    });
    this.startCb = emptyValueFunc();
    this.acquiredCb = emptyValueFunc();
    this.endCb = emptyValueFunc();
    // @0xe28cf1 movq $0x0, 0xa0(%rdi)
    this.locker = null;

    // ── Build the START callback (targets FFFigStreamMutex::start(reason)) ─────────────────
    // @0xe28cfc..0xe28d05 ::operator new(0x28) — 40-byte __function::__func closure.
    // @0xe28d0a..0xe28d2b writes:
    //   [0x00] vtable ptr = rip-relative &0xaedf37   (libc++ __function::__func vtable for our lambda type)
    //   [0x08] target fn = FFFigStreamMutex::start(FFSignPostReason)  @0xe28eb0
    //   [0x10] captured `this` slot = 0
    //   [0x18] captured mutex = &mutex   (r13)
    //   [0x20] captured reason (u32)     (r12d)
    // @0xe28d3d callq __value_func<void()>::swap(&this->startCb, &tmp)  — installs it into +0x10
    // @0xe28d42..0xe28d5f — destroy the now-empty temp via its own manager dispatch (no-op branch
    // is unreachable since we just built a live closure into it).
    const startClosure = this._buildFunctionValueFuncClosure(
      /* vtable_rip */ 0xaedf37,
      /* target */ FFFigStreamMutex_start,
      /* captureMutex */ this.mutex,
      /* captureReason */ reason,
    );
    StdFunction_valueFunc_swap(this.startCb, startClosure);
    this._destroyTempValueFunc(startClosure);

    // ── Build the ACQUIRED callback (targets FFFigStreamMutex::acquired()) ─────────────────
    // @0xe28d62..0xe28d8b writes a stack-local __value_func at -0x60(%rbp):
    //   [0x00] vtable ptr = rip-relative &0xaedf81 (a different libc++ __function::__func vtable,
    //          for the acquired() lambda's shape — note it's a *different* address than the start
    //          one at 0xaedf37, so the two closures are different concrete __func<> instantiations)
    //   [0x08] target fn = FFFigStreamMutex::acquired()  @0xe28ef0
    //   [0x10] = 0
    //   [0x18] = mutex   (from (%r15) reload @0xe28d62 — this is `this->mutex` read from +0x00)
    //   [0x20] not written — the acquired() callback takes no reason (uninitialised in the block)
    // NOTE this closure is built ON THE STACK (-0x60(%rbp)) rather than the heap — the ctor is
    // preparing the temp for the swap into +0x40. There's no operator new here for acquiredCb.
    // @0xe28d92 callq __value_func<void()>::swap(&this->acquiredCb, &tmp) — installs it into +0x40
    // @0xe28d97..0xe28db4 destroys the emptied temp.
    const acquiredClosure = this._buildFunctionValueFuncClosureStack(
      /* vtable_rip */ 0xaedf81,
      /* target */ FFFigStreamMutex_acquired,
      /* captureMutex */ this.mutex,
    );
    StdFunction_valueFunc_swap(this.acquiredCb, acquiredClosure);
    this._destroyTempValueFunc(acquiredClosure);

    // ── Build the END callback (targets FFFigStreamMutex::end(reason)) ─────────────────────
    // @0xe28db7..0xe28dbf ::operator new(0x28) — 40-byte heap closure.
    // @0xe28dc4..0xe28de9 writes:
    //   [0x00] vtable ptr = rip-relative &0xaede79 (third distinct __function::__func<> vtable —
    //          the end() lambda's instantiation, one of three different concrete __func<> types
    //          used by this class).
    //   [0x08] target fn = FFFigStreamMutex::end(FFSignPostReason)  @0xe28f10
    //   [0x10] = 0
    //   [0x18] = mutex_from_this (@0xe28db7 movq (%r15), %rbx — reloading this->mutex)
    //   [0x20] = reason (r12d)
    // @0xe28df4 callq __value_func<void()>::swap(&this->endCb, &tmp) — installs it into +0x70
    const endClosure = this._buildFunctionValueFuncClosure(
      /* vtable_rip */ 0xaede79,
      /* target */ FFFigStreamMutex_end,
      /* captureMutex */ this.mutex,
      /* captureReason */ reason,
    );
    StdFunction_valueFunc_swap(this.endCb, endClosure);
    this._destroyTempValueFunc(endClosure);

    // ── Build the FFLockerWithCallbacks in-place, install it into +0xa0 ─────────────────────
    // @0xe28e21 movq (%r15), %r15         ; r15 = this->mutex (reloaded as FFLock& arg-cast)
    // @0xe28e24 movl $0x18, %edi          ; 24 bytes
    // @0xe28e29 callq __Znwm              ; ::operator new(24) → FFLockerWithCallbacks* in %rax
    // @0xe28e34..0xe28e37 args:
    //   %rdi = fresh 24-byte cell
    //   %rsi = this->mutex reinterpreted as FFLock& (Callbacks struct at -0x68(%rbp) provides
    //          the callback trio that FFLockerWithCallbacks will invoke)
    //   %rdx = &callbacksTmp   (the just-built 24-byte Callbacks struct at -0x68(%rbp))
    // @0xe28e3a callq FFLockerWithCallbacks::FFLockerWithCallbacks(FFLock&, Callbacks&)
    // @0xe28e3f/0xe28e42 install into this->locker (replacing null):
    //   %rbx = old this->locker    (was null after our init above)
    //   store new pointer into +0xa0
    // @0xe28e45..0xe28e58 unique_ptr-replace: if old non-null (won't be first time), destroy+delete it.
    const newLocker: FFLockerWithCallbacks = operator_new(24) as unknown as FFLockerWithCallbacks;
    const callbacksTmp: FFLockerWithCallbacks_Callbacks = this._buildCallbacksTmp();
    // The Callbacks struct passes the three std::function slots by reference; the ctor of
    // FFLockerWithCallbacks either copies or moves them. We can't disassemble that without decoding
    // FFLockerWithCallbacks — a faithful port throws inside the stub.
    FFLockerWithCallbacks_ctor(
      newLocker,
      this.mutex as unknown as FFLock,
      callbacksTmp,
    );
    const oldLocker: FFLockerWithCallbacks | null = this.locker;
    this.locker = newLocker;
    if (oldLocker !== null) {
      FFLockerWithCallbacks_dtor(oldLocker);
      operator_delete(oldLocker);
    }

    // @0xe28e5a..0xe28e78 __stack_chk_guard verification + epilogue. No emission in TS.
  }

  /**
   * D1 complete-object destructor @Flexo 0xe1e9f0.
   * Faithful line-by-line control-flow transcription.
   */
  destroy(): void {
    // @0xe1e9fa movq 0xa0(%rdi), %r14
    // @0xe1ea01 movq $0x0, 0xa0(%rdi)          ; unique_ptr::reset(nullptr)
    const r14: FFLockerWithCallbacks | null = this.locker;
    this.locker = null;
    // @0xe1ea0c testq %r14, %r14
    // @0xe1ea0f je   0xe1ea21                  (skip if the unique_ptr held nothing)
    if (r14 !== null) {
      // @0xe1ea14 callq FFLockerWithCallbacks::~FFLockerWithCallbacks()
      FFLockerWithCallbacks_dtor(r14);
      // @0xe1ea1c callq __ZdlPv                ; ::operator delete(r14)
      operator_delete(r14);
    }

    // ── Destroy endCb (block @+0x70; manager pointer @+0x90) ────────────────────────────────
    // @0xe1ea21 leaq 0x70(%rbx), %rax          ; rax = &this->endCb (blockBase)
    // @0xe1ea25 movq 0x90(%rbx), %rdi          ; rdi = this->endCb.managerPointer
    // @0xe1ea2c cmpq %rax, %rdi                ; if rdi == blockBase → inline branch
    // @0xe1ea2f je   0xe1ea3d
    // @0xe1ea31 movl $0x28, %eax               ; heap-object manager offset
    // @0xe1ea36 testq %rdi, %rdi
    // @0xe1ea39 jne  0xe1ea42                  (non-null non-inline → call heap manager)
    // @0xe1ea3b jmp  0xe1ea48                  (null → skip, empty function)
    // @0xe1ea3d movl $0x20, %eax               ; inline-object manager offset
    // @0xe1ea42 movq (%rdi), %rcx              ; rcx = vtable
    // @0xe1ea45 callq *(%rcx,%rax)             ; manager destroy
    {
      const managerPointer: unknown | null = this.endCb.managerPointer;
      const blockBase = { addr: 'this.endCb.blockBase' } as unknown; // sentinel for inline branch
      if (managerPointer === blockBase) {
        StdFunction_valueFunc_destroyDispatch(managerPointer, 0x20);
      } else if (managerPointer !== null) {
        StdFunction_valueFunc_destroyDispatch(managerPointer, 0x28);
      }
      // else: empty function, no destroy — matches @0xe1ea3b `jmp 0xe1ea48`.
    }

    // ── Destroy acquiredCb (block @+0x40; manager pointer @+0x60) ──────────────────────────
    // @0xe1ea48 leaq 0x10(%rbx), %r14          ; r14 = &this->startCb (blockBase for the NEXT dtor)
    // @0xe1ea4c leaq 0x40(%rbx), %rax          ; rax = &this->acquiredCb
    // @0xe1ea50 movq 0x60(%rbx), %rdi          ; rdi = this->acquiredCb.managerPointer
    // @0xe1ea54 cmpq %rax, %rdi
    // @0xe1ea57 je   0xe1ea7b
    // @0xe1ea59 movl $0x28, %eax
    // @0xe1ea5e testq %rdi, %rdi
    // @0xe1ea61 jne  0xe1ea80                  (non-null non-inline → call heap manager, then fall to startCb)
    // @0xe1ea63 movq 0x30(%rbx), %rdi          (null → jump into the startCb dtor sequence)
    // ...
    // @0xe1ea7b movl $0x20, %eax
    // @0xe1ea80 movq (%rdi), %rcx
    // @0xe1ea83 callq *(%rcx,%rax)
    // @0xe1ea86 movq 0x30(%rbx), %rdi          (after manager return → falls into startCb dtor)
    {
      const managerPointer: unknown | null = this.acquiredCb.managerPointer;
      const blockBase = { addr: 'this.acquiredCb.blockBase' } as unknown;
      if (managerPointer === blockBase) {
        StdFunction_valueFunc_destroyDispatch(managerPointer, 0x20);
      } else if (managerPointer !== null) {
        StdFunction_valueFunc_destroyDispatch(managerPointer, 0x28);
      }
    }

    // ── Destroy startCb (block @+0x10; manager pointer @+0x30) ─────────────────────────────
    // @0xe1ea63 movq 0x30(%rbx), %rdi          ; rdi = this->startCb.managerPointer
    // @0xe1ea67 cmpq %r14, %rdi                ; r14 = blockBase(&startCb) from @0xe1ea48
    // @0xe1ea6a je   0xe1ea8f
    // @0xe1ea6c movl $0x28, %eax
    // @0xe1ea71 testq %rdi, %rdi
    // @0xe1ea74 jne  0xe1ea94                  (non-null non-inline → tail-call heap manager)
    // @0xe1ea76..0xe1ea7a epilogue + retq       (null → empty, skip)
    // @0xe1ea8f movl $0x20, %eax
    // @0xe1ea94 movq (%rdi), %rcx
    // @0xe1ea97..0xe1ea9a popq %rbx / %r14 / %rbp
    // @0xe1ea9b jmpq *(%rcx,%rax)              ; TAIL CALL — no return after manager runs
    {
      const managerPointer: unknown | null = this.startCb.managerPointer;
      const blockBase = { addr: 'this.startCb.blockBase' } as unknown;
      if (managerPointer === blockBase) {
        StdFunction_valueFunc_destroyDispatch(managerPointer, 0x20);
      } else if (managerPointer !== null) {
        StdFunction_valueFunc_destroyDispatch(managerPointer, 0x28);
      }
    }
    // Ret to caller (or tail-call return in the asm) — no observable difference in TS.
  }

  // ── Private construction helpers (each corresponds to a specific asm block) ─────────────────
  /**
   * Builds a heap-allocated 40-byte __function::__func closure whose signature is
   * `void (this, FFFigStreamMutex*, FFSignPostReason)`. Corresponds to the ctor's block at
   * @0xe28cfc..0xe28d2f (start) and @0xe28db7..0xe28de9 (end).
   */
  private _buildFunctionValueFuncClosure(
    _vtableRip: number,
    _target: (mtx: FFFigStreamMutex, reason: FFSignPostReason) => void,
    _captureMutex: FFFigStreamMutex,
    _captureReason: FFSignPostReason,
  ): StdFunctionValueFunc {
    // The real ctor calls ::operator new(0x28) and writes 5 quadwords — we can't materialise the
    // libc++ __function::__func vtable, so we throw. A caller that hits this on TS is the demand
    // signal for wiring the libc++ closure representation.
    void operator_new(0x28);
    throw new Error(
      'FFFigStreamMutexGuard heap-closure construction (__function::__func<> new @Flexo 0xe28cfc/0xe28db7) not yet bound',
    );
  }
  /**
   * Builds a stack-local __function::__func closure whose signature is `void (this,
   * FFFigStreamMutex*)`. Corresponds to the ctor's block at @0xe28d62..0xe28d8b (acquired).
   */
  private _buildFunctionValueFuncClosureStack(
    _vtableRip: number,
    _target: (mtx: FFFigStreamMutex) => void,
    _captureMutex: FFFigStreamMutex,
  ): StdFunctionValueFunc {
    throw new Error(
      'FFFigStreamMutexGuard stack-closure construction (__function::__func<> local @Flexo 0xe28d62) not yet bound',
    );
  }
  /**
   * Destroys a temp __value_func whose contents were just swapped OUT (so it's empty and its
   * manager dispatch is the "large object" branch, freeing the just-allocated 0x28 cell). This is
   * the code at @0xe28d42..0xe28d5f, @0xe28d97..0xe28db4, @0xe28df9..0xe28e1e.
   */
  private _destroyTempValueFunc(_tmp: StdFunctionValueFunc): void {
    // The real code walks the same manager dispatch as the destructor — but the temp is guaranteed
    // to be non-empty (we just built into it) and non-inline (heap-allocated). The manager takes
    // ownership of ::operator delete-ing the cell.
    throw new Error(
      'FFFigStreamMutexGuard temp __value_func destroy (@Flexo 0xe28d42/0xe28d97/0xe28df9) not yet bound',
    );
  }
  /**
   * Builds the 24-byte FFLockerWithCallbacks::Callbacks struct at ctor stack offset -0x68(%rbp).
   * Without the Callbacks layout decoded, we can only signal the frontier.
   */
  private _buildCallbacksTmp(): FFLockerWithCallbacks_Callbacks {
    throw new Error(
      'FFLockerWithCallbacks::Callbacks stack construction (stack temp @Flexo ctor -0x68(%rbp)) not yet bound',
    );
  }
}
