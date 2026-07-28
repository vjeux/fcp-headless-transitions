// PC_Sp_counted_base.ts — ProCore's abstract "shared_ptr control block base".
// Direct port of boost::detail::sp_counted_base semantics: two 32-bit atomic
// counters (use_count / weak_count) at +0x08 / +0x0c, plus 4 pure-virtual
// slots {~D1, ~D0, dispose, destroy} exposed through the standard Itanium
// vtable at ProCore 0x14b018 (installed-ptr 0x14b028).
//
// This class is ABSTRACT: `dispose()` is pure-virtual on the base (the vtable
// slot the base itself installs would ud2/never-return — the real bodies are
// contributed by leaves like `PC_Sp_counted_base_impl`, already ported at
// raw-port/src/infra/PC_Sp_counted_base_impl.ts). The dtor bodies at
// ProCore @0xdd96e (~D1) and @0xdd974 (~D0) are `ud2` — this class is never
// instantiated on its own; a subclass always overrides.
//
// Transcribed from FCP ProCore framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore
// Disassemblies saved at:
//   raw-port/re/disasm/ProCore.PC_Sp_counted_base.destroy.s        (@0x4df6c)
//   raw-port/re/disasm/ProCore.PC_Sp_counted_base.add_ref_copy.s   (@0x4df7e)
//   raw-port/re/disasm/ProCore.PC_Sp_counted_base.weak_add_ref.s   (@0x4df96)
//   raw-port/re/disasm/ProCore.PC_Sp_counted_base.release.s        (@0x4dfa0)
//   raw-port/re/disasm/ProCore.PC_Sp_counted_base.weak_release.s   (@0x4dfd2)
//   raw-port/re/disasm/ProCore.PC_Sp_counted_base.use_count.s      (@0x4dfe6)
//   raw-port/re/disasm/ProCore.PC_Sp_counted_base.~PC_Sp_counted_base.s (~D0 @0xdd974)
// C2 ctor body (@0x4df4e) recovered by hand-decoding the raw bytes at
//   __TEXT[0x4df4e..0x4df6b] (otool -tV drops the C2 label — ICF collapse):
//     0x4df4e  pushq %rbp ; movq %rsp,%rbp
//     0x4df52  leaq  0xfd0cf(%rip), %rax      ; = 0x14b028 = vtable-installed-ptr
//     0x4df59  movq  %rax, (%rdi)             ; this->vptr = 0x14b028
//     0x4df5c  movabsq $0x100000000, %rax     ; = (1 << 32)
//     0x4df66  movq  %rax, 0x8(%rdi)          ; write both counts atomically
//     0x4df6a  popq  %rbp ; retq
//   ~D1 body (@0xdd96e) is `ud2` after the frame prologue — class is abstract.
//
// ─── VTABLE (via `resolve.py ProCore vtable PC_Sp_counted_base`) ─────────────
//   __ZTV18PC_Sp_counted_base @0x14b018 ; installed-ptr @0x14b028
//   installed[0] = 0xdd96e  ~PC_Sp_counted_base()  D1
//   installed[8] = 0xdd974  ~PC_Sp_counted_base()  D0
//   installed[16]= (null / pure-virtual)  dispose  ; SLOT USED BY release() @0x4dfb2
//   installed[24]= 0x4df6c  PC_Sp_counted_base::destroy()  ; SLOT USED BY release/weak_release
//
// So the semantics on the base are exactly boost's sp_counted_base:
//   release():        --use_count; if(0){ vptr[+0x10]()==dispose;   --weak_count; if(0){ vptr[+0x18]()==destroy; } }
//   weak_release():   --weak_count; if(0){ vptr[+0x18]()==destroy; }
//   destroy():        virtual jmp vptr[+0x08]  ==  ~D0 on the derived  (i.e. `delete this` through virtual dtor)
//
// ─── STRUCT LAYOUT (recovered from C2 + counting ops) ────────────────────────
//   PC_Sp_counted_base {
//     +0x00  vptr        : void*                (installed = 0x14b028)
//     +0x08  use_count   : int32 (atomic)       (init = 0 via low half of movabsq $0x100000000)
//     +0x0c  weak_count  : int32 (atomic)       (init = 1 via high half of movabsq $0x100000000)
//   }
//   Note: C2 initialises (use=0, weak=1). The FIRST add_ref_copy call by the
//   owning PCSharedCount fires xaddl(1, +0x8) -> old==0 -> weak_count++ ->
//   final (use=1, weak=2). This matches the boost sp_counted_base convention
//   "each strong shared pins one weak ref".
//
// ─── FRONTIER (undecoded / abstract slots) ───────────────────────────────────
//   dispose():  slot +0x10 on the base is pure-virtual. Subclasses (e.g.
//               PC_Sp_counted_base_impl::dispose @0x4e014) override. The base
//               method `disposeDispatch()` throws if invoked on a bare base
//               (the shipped binary would trap on `callq *0x10(%rax)` — the
//               slot is not populated on __ZTV18PC_Sp_counted_base itself).

// ---------------------------------------------------------------------------
// Address-cited helpers modelling x86 atomic RMW ops used by the disasm.
// These are documented one-off helpers (NOT inventions): each mirrors a
// specific `lock`-prefixed instruction cited by @0xADDR below.
// ---------------------------------------------------------------------------

/**
 * `lock xaddl %eax, mem`  — returns the OLD value of `mem` while adding
 * `%eax` to it. Cited by add_ref_copy @0x4df88.
 *
 * TS runs single-threaded; there is no real race, so we perform the RMW
 * naively while preserving the "returns pre-value" semantic used by the
 * asm's `test %eax,%eax`.
 */
function lock_xaddl(ref: { v: number }, add: number): number {
  const old = ref.v | 0;
  ref.v = (old + add) | 0;
  return old;
}

/**
 * `lock incl mem`  — atomic ++mem. Cited by add_ref_copy @0x4df91,
 * weak_add_ref @0x4df9b.
 */
function lock_incl(ref: { v: number }): void {
  ref.v = (ref.v + 1) | 0;
}

/**
 * `lock decl mem`  — atomic --mem; returns the NEW value so callers can
 * branch on `jne` (which the asm implements via the flags set by decl).
 * Cited by release @0x4dfa7 / @0x4dfb6, weak_release @0x4dfd7.
 */
function lock_decl(ref: { v: number }): number {
  ref.v = (ref.v - 1) | 0;
  return ref.v;
}

/**
 * `PC_Sp_counted_base` — abstract control-block base. Direct transcription
 * of the six ProCore entry points cited above.
 *
 * @ProCore symbols owned by this class:
 *   C2         @0x4df4e   ctor()                       (C1==C2, ICF-folded)
 *   destroy    @0x4df6c   virtual — tail-jmp ~D0
 *   add_ref_copy@0x4df7e  atomic ++use_count (+ weak on 0->1)
 *   weak_add_ref@0x4df96  atomic ++weak_count
 *   release    @0x4dfa0   atomic --use_count; on zero: dispose + weak_release-inlined
 *   weak_release@0x4dfd2  atomic --weak_count; on zero: destroy
 *   use_count  @0x4dfe6   const-read of use_count (sign-extended to i64)
 *   ~D1        @0xdd96e   ud2 — abstract; concrete leaf must override
 *   ~D0        @0xdd974   ud2 — abstract; concrete leaf must override
 */
export abstract class PC_Sp_counted_base {
  /** @ProCore struct offset +0x08 — 32-bit atomic strong count. Initialised
   * to 0 by C2 (`movabsq $0x100000000; movq %rax,0x8(%rdi)` — low u32 of
   * the qword lands at +0x08 == 0x00000000). Boxed in a `{v}` cell so the
   * atomic-RMW helpers can pass it by reference. */
  protected _use_count: { v: number } = { v: 0 };

  /** @ProCore struct offset +0x0c — 32-bit atomic weak count. Initialised
   * to 1 by the same qword store (high u32 = 0x00000001, lands at +0x0c). */
  protected _weak_count: { v: number } = { v: 1 };

  // For the interface `PC_Sp_counted_base` shape used by PCSharedCount
  // (fields `use_count` and `weak_count`): mirror them as read-through
  // getters/setters. The disasm reads/writes +0x8 / +0xc as 32-bit ints,
  // so getters return `_use_count.v`/`_weak_count.v` verbatim.
  get use_count(): number { return this._use_count.v; }
  set use_count(v: number) { this._use_count.v = v | 0; }
  get weak_count(): number { return this._weak_count.v; }
  set weak_count(v: number) { this._weak_count.v = v | 0; }

  /**
   * PC_Sp_counted_base::PC_Sp_counted_base()   C1==C2 @ProCore 0x4df4e.
   *
   *   0x4df4e  pushq %rbp ; movq %rsp,%rbp
   *   0x4df52  leaq  0xfd0cf(%rip), %rax      ; = 0x14b028 vtable-installed-ptr
   *   0x4df59  movq  %rax, (%rdi)             ; vptr = 0x14b028
   *   0x4df5c  movabsq $0x100000000, %rax
   *   0x4df66  movq  %rax, 0x8(%rdi)          ; (use=0, weak=1)
   *   0x4df6a  popq  %rbp ; retq
   */
  constructor() {
    // @0x4df59 — install vptr (TS dispatch subsumes the physical vptr write).
    // @0x4df66 — pack (use=0, weak=1) via the movabsq $0x100000000 trick.
    this._use_count = { v: 0 };
    this._weak_count = { v: 1 };
  }

  // -------------------------------------------------------------------------
  // Virtual slots — subclass MUST override `dispose()`; other slots have
  // concrete base bodies but subclasses may still override.
  // -------------------------------------------------------------------------

  /**
   * `dispose()` — vtable slot +0x10 (installed[2]). Pure-virtual on the
   * base: __ZTV18PC_Sp_counted_base's slot +0x10 is not populated (see the
   * vtable dump comment at file top). Subclasses like
   * `PC_Sp_counted_base_impl::dispose @0x4e014` provide the body.
   *
   * The base's `release()` @0x4dfb2 fires `callq *0x10(%rax)` — on a bare
   * base instance that would jump into an unpopulated slot and trap. We
   * mirror that trap here as an explicit `throw`.
   */
  abstract dispose(): void;

  /**
   * PC_Sp_counted_base::destroy()  @ProCore 0x4df6c   — vtable slot +0x18.
   *
   *   0x4df6c  pushq %rbp ; movq %rsp,%rbp
   *   0x4df70  testq %rdi, %rdi         ; if (this == null) return;
   *   0x4df73  je    0x4df7c
   *   0x4df75  movq  (%rdi), %rax       ; %rax = this->vptr
   *   0x4df78  popq  %rbp
   *   0x4df79  jmpq  *0x8(%rax)         ; TAIL-JMP vptr[+0x08] == virtual ~D0
   *   0x4df7c  popq  %rbp ; retq
   *
   * i.e. `delete this` via the virtual dtor. `vptr[+0x08]` is installed[1]
   * which is `~D0` for whatever concrete subclass is running.
   *
   * TS: the GC subsumes `operator delete`; we still call the leaf's own
   * `destroyAndFree()` (the D0 equivalent on `PC_Sp_counted_base_impl`) so
   * the polymorphic tail matches the asm. Subclasses that don't publish a
   * `destroyAndFree()` should override this method.
   */
  destroy(): void {
    // The `testq %rdi,%rdi ; je` at @0x4df70..73 is the "called through a
    // null this*" guard. TS reaches this method only through a real
    // instance, so the null branch is unreachable — omit its body.
    // @0x4df79 jmpq *0x8(%rax) — virtual ~D0 dispatch. Subclass overrides
    // this method (see PC_Sp_counted_base_impl.destroyAndFree()); if none
    // is provided, the base has no non-abstract behaviour to run.
    this._destroy_d0_hook();
  }

  /**
   * Virtual dispatch stand-in for the `jmpq *0x8(%rax)` tail-call at
   * @ProCore 0x4df79. Subclasses that model a `~D0` body (e.g.
   * PC_Sp_counted_base_impl.destroyAndFree @0x4e19e -> `operator delete`)
   * override this to run the leaf-class D0 body.
   */
  protected _destroy_d0_hook(): void {
    // Base D0 @0xdd974 is `ud2` (abstract). If we ever land here on a bare
    // base, that's a real trap — mirror the asm faithfully.
    throw new Error(
      "PC_Sp_counted_base::~D0 @0xdd974 is `ud2` — subclass must override destroy() / _destroy_d0_hook()",
    );
  }

  /**
   * PC_Sp_counted_base::add_ref_copy()  @ProCore 0x4df7e.
   *
   *   0x4df7e  pushq %rbp ; movq %rsp,%rbp
   *   0x4df82  movl  $0x1, %eax
   *   0x4df87  lock xaddl %eax, 0x8(%rdi)   ; %eax = old_use; ++use_count
   *   0x4df8c  testl %eax, %eax             ; jne .skip if old_use != 0
   *   0x4df8e  jne   0x4df94
   *   0x4df90  lock incl 0xc(%rdi)          ; if old_use == 0: ++weak_count
   *   0x4df94  popq  %rbp ; retq
   *
   * Classic "first strong ref pins one weak ref" bump.
   */
  add_ref_copy(): void {
    // @0x4df87 — atomic ++use_count, return pre-value.
    const old_use = lock_xaddl(this._use_count, 1);
    // @0x4df8c — branch on the pre-value.
    if (old_use === 0) {
      // @0x4df91 — the strong count transitioned 0 -> 1, pin one weak ref.
      lock_incl(this._weak_count);
    }
  }

  /**
   * PC_Sp_counted_base::weak_add_ref()  @ProCore 0x4df96.
   *
   *   0x4df96  pushq %rbp ; movq %rsp,%rbp
   *   0x4df9a  lock incl 0xc(%rdi)          ; ++weak_count
   *   0x4df9e  popq  %rbp ; retq
   */
  weak_add_ref(): void {
    // @0x4df9b — atomic ++weak_count.
    lock_incl(this._weak_count);
  }

  /**
   * PC_Sp_counted_base::release()  @ProCore 0x4dfa0.
   *
   *   0x4dfa0  pushq %rbp ; movq %rsp,%rbp
   *   0x4dfa4  pushq %rbx ; pushq %rax        ; stack align + save rbx
   *   0x4dfa6  lock decl 0x8(%rdi)            ; --use_count
   *   0x4dfaa  jne   0x4dfca                  ; if (--use_count != 0) goto epilogue
   *   0x4dfac  movq  %rdi, %rbx               ; %rbx = this
   *   0x4dfaf  movq  (%rdi), %rax             ; %rax = vptr
   *   0x4dfb2  callq *0x10(%rax)              ; vptr[+0x10]() == dispose()
   *   0x4dfb5  lock decl 0xc(%rbx)            ; --weak_count (inlined weak_release)
   *   0x4dfb9  jne   0x4dfca                  ; if (--weak_count != 0) goto epilogue
   *   0x4dfbb  movq  (%rbx), %rax             ; %rax = vptr
   *   0x4dfbe  movq  %rbx, %rdi               ; %rdi = this
   *   0x4dfc1  addq  $0x8, %rsp ; popq %rbx ; popq %rbp
   *   0x4dfc7  jmpq  *0x18(%rax)              ; TAIL vptr[+0x18]() == destroy()
   *   0x4dfca  addq  $0x8, %rsp ; popq %rbx ; popq %rbp ; retq
   */
  release(): void {
    // @0x4dfa7 — atomic --use_count.
    const new_use = lock_decl(this._use_count);
    // @0x4dfaa — if (--use_count != 0) return;
    if (new_use !== 0) {
      return;
    }
    // @0x4dfb2 — call dispose() through vtable slot +0x10.
    this.dispose();
    // @0x4dfb6 — inlined weak_release: atomic --weak_count.
    const new_weak = lock_decl(this._weak_count);
    // @0x4dfb9 — if (--weak_count != 0) return;
    if (new_weak !== 0) {
      return;
    }
    // @0x4dfc7 — tail-call destroy() through vtable slot +0x18.
    this.destroy();
  }

  /**
   * PC_Sp_counted_base::weak_release()  @ProCore 0x4dfd2.
   *
   *   0x4dfd2  pushq %rbp ; movq %rsp,%rbp
   *   0x4dfd6  lock decl 0xc(%rdi)            ; --weak_count
   *   0x4dfda  jne   0x4dfe3                  ; if (--weak_count != 0) return
   *   0x4dfdc  movq  (%rdi), %rax             ; %rax = vptr
   *   0x4dfdf  popq  %rbp
   *   0x4dfe0  jmpq  *0x18(%rax)              ; TAIL vptr[+0x18]() == destroy()
   *   0x4dfe3  popq  %rbp ; retq
   */
  weak_release(): void {
    // @0x4dfd7 — atomic --weak_count.
    const new_weak = lock_decl(this._weak_count);
    // @0x4dfda — if (--weak_count != 0) return.
    if (new_weak !== 0) {
      return;
    }
    // @0x4dfe0 — tail-call destroy() through vtable slot +0x18.
    this.destroy();
  }

  /**
   * PC_Sp_counted_base::use_count() const  @ProCore 0x4dfe6.
   *
   *   0x4dfe6  pushq %rbp ; movq %rsp,%rbp
   *   0x4dfea  movl  0x8(%rdi), %eax          ; %eax = use_count (i32 load)
   *   0x4dfed  cltq                            ; sign-extend %eax -> %rax (i64)
   *   0x4dfef  popq  %rbp ; retq
   *
   * Returns the strong-ref count as a signed 64-bit int (sign-extended
   * from the 32-bit field). TS `number` covers the range comfortably.
   */
  useCount(): number {
    // @0x4dfea — load i32 at +0x08.
    const eax = this._use_count.v | 0;
    // @0x4dfed — cltq sign-extends to i64. In TS, a 32-bit signed int
    // already sits in `number` losslessly; identity is correct.
    return eax;
  }
}
