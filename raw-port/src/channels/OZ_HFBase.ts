// OZ_HFBase.ts — faithful transcription of FCP's Ozone class
// OZ_HFBase, a small ref-counted base with a virtual-dispatch
// deleting-dtor.  The five exported methods (three dtor slots +
// AddRef/Release) form the entire ABI of the class as it appears in
// the binary — the ctor is inlined/emitted-into subclasses.
//
// Binary source (x86_64 slice of FAT Ozone framework):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//     Versions/A/Ozone
//
// Disassembly:
//   raw-port/re/disasm/OZ_HFBase.~OZ_HFBase.s   @0x5a8db0  (D0 — deleting)
//   raw-port/re/disasm/OZ_HFBase.AddRef.s       @0x5a8dc0
//   raw-port/re/disasm/OZ_HFBase.Release.s      @0x5a8de0
// (D1 @0x5a8da0 and D2 @0x5a8d90 recovered directly from the tV dump.)
//
// nm -arch x86_64 Ozone:
//   00000000005a8d90 T __ZN9OZ_HFBaseD2Ev
//   00000000005a8da0 T __ZN9OZ_HFBaseD1Ev
//   00000000005a8db0 T __ZN9OZ_HFBaseD0Ev
//   00000000005a8dc0 T __ZN9OZ_HFBase6AddRefEv
//   00000000005a8de0 T __ZN9OZ_HFBase7ReleaseEv
//
// STRUCT LAYOUT (recovered from AddRef/Release and D2/D1):
//   +0x00  void*   vptr             (D2 @0x5a8d94 / D1 @0x5a8da4 both
//                                    reinstall the parent-class vtable
//                                    pointer here; effective address
//                                    0x8806d8 in both cases)
//   +0x04  (4 bytes)                 (implicit gap so refcount is 8-aligned;
//                                    not touched by any of these five funcs)
//   +0x08  int32   refcount         (AddRef @0x5a8dca / Release @0x5a8dec:
//                                    `lock xadd` at 0x8(%rdi))
//   Only these three fields are ever referenced by the methods we ported —
//   subclasses layer their own state on top starting at +0x0c or later.
//
// The vtable pointer written by D2 and D1 is 0x8806d8 in both cases.
// That is unusual (D1 and D2 normally reinstall *different* vtables when
// virtual bases are present); here they are identical, which is the
// tell-tale for a class whose only base is a non-virtual, non-polymorphic
// piece (or where the parent's vtable has a single sub-object).  Cite the
// address as a fact and do not fabricate a name.
export const OZ_HFBase_PARENT_VTABLE_ADDR = 0x8806d8; // @Ozone D2 0x5a8d9b / D1 0x5a8dab

/**
 * The `operator delete(void*)` used by the D0 deleting-dtor.
 * @Ozone D0 tail-calls `__ZdlPv` via the __stubs section:
 *   `jmp 0x6dfc36 ## symbol stub for: __ZdlPv` @0x5a8db5.
 */
function operator_delete(_p: object): void {
  // Frontier: global `::operator delete(void*)` is not yet transcribed.
  throw new Error(
    "::operator delete(void*) not yet transcribed " +
    "(called from OZ_HFBase::~OZ_HFBase (D0) @Ozone 0x5a8db5, symbol __ZdlPv)"
  );
}

/**
 * OZ_HFBase — small ref-counted polymorphic base.
 *
 * The class exposes AddRef/Release (COM-style refcount) and three dtor
 * slots (D0/D1/D2). Release dispatches through the vtable slot at
 * offset +0x08 (i.e. the second entry, index 1) when the last reference
 * is dropped; by Itanium ABI convention vtable slot 1 is the deleting
 * dtor (D0). Any HF-derived subclass therefore self-destructs by
 * virtual dispatch through its own D0.
 *
 * @Ozone class OZ_HFBase (module `Ozone`).
 */
export class OZ_HFBase {
  /**
   * Vtable pointer at +0x00. D2/D1 both write 0x8806d8 here; we surface
   * that as the field default so downstream ports can cite the address.
   * (Subclass ctors will overwrite this with their own vtable prior to
   * this base's dtor running, which then downgrades it back.)
   * @Ozone D2 @0x5a8d94/0x5a8d9b, D1 @0x5a8da4/0x5a8dab.
   */
  vptr: number = OZ_HFBase_PARENT_VTABLE_ADDR;

  /**
   * Ref count at +0x08. Manipulated atomically by AddRef/Release via
   * `lock xadd`. Signed 32-bit — Release loads $0xffffffff (i.e. -1) as
   * the addend, so a wrap from 0 to 0xffffffff is treated as sign-
   * extended -1, matching a signed decrement.
   * @Ozone AddRef @0x5a8dca, Release @0x5a8dec.
   */
  refcount: number = 0;

  /**
   * OZ_HFBase::AddRef() — atomic increment, returns the NEW count.
   * @Ozone __ZN9OZ_HFBase6AddRefEv @0x5a8dc0..0x5a8dd1
   *
   *   pushq  %rbp / movq %rsp,%rbp             ; frame
   *   movl   $0x1, %eax
   *   lock xaddl %eax, 0x8(%rdi)                ; @0x5a8dc9: eax := *refcount ; *refcount += 1
   *   incl   %eax                               ; @0x5a8dce: eax += 1  -> NEW count
   *   popq %rbp / retq
   *
   * Return value is (old refcount + 1), matching a plain `++refcount`.
   */
  AddRef(): number {
    // lock xaddl @0x5a8dc9 — atomic read-modify-write. JS is single-
    // threaded so a non-atomic increment is bit-exact.
    const old = this.refcount | 0;
    this.refcount = (old + 1) | 0;
    // xadd returns the OLD value in %eax; the next `incl %eax` turns
    // that into (old + 1) — the NEW refcount.
    return (old + 1) | 0;
  }

  /**
   * OZ_HFBase::Release() — atomic decrement; if the result is 0 AND
   * `this != nullptr`, virtual-dispatch through vtable slot [1] (D0,
   * the deleting-dtor).  Returns the NEW refcount.
   *
   * @Ozone __ZN9OZ_HFBase7ReleaseEv @0x5a8de0..0x5a8e0d
   *
   *   pushq %rbp/ movq/ pushq %rbx/ pushq %rax  ; frame + save
   *   movl   $0xffffffff, %ebx                   ; ebx := -1
   *   lock xaddl %ebx, 0x8(%rdi)                  ; @0x5a8dec: ebx := *refcount ; *refcount += -1
   *   decl   %ebx                                 ; @0x5a8df0: ebx := (old-1)  -> NEW count
   *   setne  %al                                  ; al := (NEW != 0)
   *   testq  %rdi, %rdi
   *   sete   %cl                                  ; cl := (this == NULL)
   *   orb    %al, %cl                             ; (NEW!=0) || (this==NULL)
   *   jne    0x5a8e05                             ; if either, SKIP the delete-vcall
   *     movq   (%rdi), %rax                       ;   rax := vptr
   *     callq  *0x8(%rax)                         ;   call vtable[1] (D0 deleting)
   *   movl   %ebx, %eax                           ; return NEW count
   *   addq $8,%rsp/ popq %rbx/ popq %rbp/ retq
   *
   * Note: the `this == NULL` guard is a real code path in the binary —
   * FCP's Release() is safe to call on a null pointer and simply
   * returns -1 (because `*refcount` was not decremented but ebx got
   * decremented from -1 to -2… wait: ebx started at -1 (0xffffffff),
   * xadd on a nullptr never happens because xadd would fault; but the
   * asm loads ebx first and only conditionally reaches the vcall).
   * The static behavior is faithfully mirrored: when this === null we
   * skip the vcall but still return the (bogus) decremented ebx.  In
   * our TS mirror we cannot deference a real null, so we treat the
   * this-null branch as a raise (the asm would already have segfaulted
   * on the `xadd 0x8(%rdi)` before reaching the vcall guard).
   */
  Release(): number {
    // lock xaddl(-1) @0x5a8dec — atomic decrement.
    // %ebx starts at 0xffffffff (which is -1 as signed 32-bit).
    let ebx = -1 | 0;
    const old = this.refcount | 0;
    this.refcount = (old + ebx) | 0; // *refcount += -1
    ebx = old | 0;                    // xadd returns OLD in ebx
    // decl %ebx @0x5a8df0: NEW := old - 1
    ebx = (ebx - 1) | 0;

    // setne %al @0x5a8df2: al := (ebx != 0)
    const al = ebx !== 0 ? 1 : 0;
    // testq/sete %cl @0x5a8df5..0x5a8df8: cl := (this == NULL)
    //   In TS, `this` is never null (a null this-call would have
    //   segfaulted on the `lock xaddl 0x8(%rdi)` two insns earlier —
    //   the guard exists in the binary for a rare corner where an
    //   inlined manual vcall passes 0 explicitly). Keep the branch for
    //   fidelity but it is unreachable via a normal method call.
    const cl = 0;
    // orb al,cl -> jne : if (al || cl) skip the vcall
    if ((al | cl) !== 0) {
      // @0x5a8e05: fall through to return.
    } else {
      // @0x5a8dff/0x5a8e02: virtual-dispatch through vtable[slot 1]
      //   (the deleting dtor, i.e. D0 in Itanium's slot layout).
      // The exact D0 depends on the concrete subclass's vtable. For a
      // literal OZ_HFBase instance, vtable[1] would be D0 below.
      this._vtable_slot1_deleting_dtor();
    }
    // @0x5a8e05: movl %ebx,%eax  -> return NEW count.
    return ebx;
  }

  /**
   * Vtable slot [1] on OZ_HFBase == its own D0 (the deleting dtor).
   * A subclass's vtable overrides this slot. This helper mirrors that
   * dispatch and, for the concrete-base case, calls D0 directly.
   * @Ozone Release @0x5a8dff..0x5a8e02  callq *0x8(%rax).
   */
  protected _vtable_slot1_deleting_dtor(): void {
    // Frontier: an actual subclass would override vtable[1]. When the
    // instance really is a pure OZ_HFBase, slot[1] IS OZ_HFBase::D0.
    this.D0();
  }

  /**
   * OZ_HFBase::~OZ_HFBase() — D0, the deleting dtor.
   * @Ozone __ZN9OZ_HFBaseD0Ev @0x5a8db0..0x5a8db5
   *
   *   pushq %rbp / movq %rsp,%rbp / popq %rbp
   *   jmp    0x6dfc36                 ## __stubs::__ZdlPv (::operator delete)
   *
   * D0 does not first invoke D2 — that's unusual, but the compiler
   * elided it because the class has no non-trivial member cleanup
   * beyond the vtable slot; the delete is a plain tail-call to
   * `::operator delete(void*)`.
   */
  D0(): void {
    // tail-jmp @0x5a8db5 to __ZdlPv (::operator delete(void*)).
    operator_delete(this);
  }

  /**
   * OZ_HFBase::~OZ_HFBase() — D1, the complete-object dtor.
   * @Ozone __ZN9OZ_HFBaseD1Ev @0x5a8da0..0x5a8daf
   *
   *   pushq %rbp / movq %rsp,%rbp
   *   leaq   0x2d792d(%rip), %rax    ; @0x5a8da4: rax := &vtable_parent (0x8806d8)
   *   movq   %rax, (%rdi)            ; @0x5a8dab: *this = &vtable_parent
   *   popq %rbp / retq
   *
   * Semantically: downgrade the vtable to the parent's slot so that
   * any partial-destruction virtual dispatch resolves through the
   * base's ABI.  (Since we're the base and there's no distinct base
   * vtable, D1 and D2 are byte-identical.)
   */
  D1(): void {
    this.vptr = OZ_HFBase_PARENT_VTABLE_ADDR; // @0x5a8dab
  }

  /**
   * OZ_HFBase::~OZ_HFBase() — D2, the base-object dtor.
   * @Ozone __ZN9OZ_HFBaseD2Ev @0x5a8d90..0x5a8d9f
   *
   *   pushq %rbp / movq %rsp,%rbp
   *   leaq   0x2d793d(%rip), %rax    ; @0x5a8d94: rax := &vtable_parent (0x8806d8)
   *   movq   %rax, (%rdi)            ; @0x5a8d9b: *this = &vtable_parent
   *   popq %rbp / retq
   *
   * Byte-identical to D1; the compiler nonetheless emits both symbols
   * so subclasses that call `~OZ_HFBase()` as a member-dtor land on
   * the D2 slot (ABI-mandated).
   */
  D2(): void {
    this.vptr = OZ_HFBase_PARENT_VTABLE_ADDR; // @0x5a8d9b
  }
}
