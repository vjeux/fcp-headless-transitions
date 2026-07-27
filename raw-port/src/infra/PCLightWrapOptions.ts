// PCLightWrapOptions.ts — Ozone's PCLightWrapOptions, a PCShared_base-
// derived options record whose only decoded methods are its destructor
// pair. Only two fields are visible from those two dtors: the +0x20
// installed PCShared_base vtable pointer and a +0x28 pointer to a
// PC_Sp_counted_base which is released via weak_release on destruction.
//
// Transcribed from the disassembly of /Applications/Final Cut Pro.app/
// Contents/Frameworks/Ozone.framework/Versions/A/Ozone.
//
// DECODE. Both methods below are transcribed one-for-one from the ASM.
// Every method cites its @0xADDR in Ozone; every callee is resolved by
// symbol name; every byte offset is read directly from the assembly.
//
// STRUCT LAYOUT (recovered from the two dtors):
//   +0x00..+0x1f  ... base sub-objects / other fields    // NOT touched by
//                                                        //   these two dtors,
//                                                        //   so they are
//                                                        //   FRONTIER here.
//   +0x20  vptr : *const void (PCShared_base installed)  // written on entry
//                                                        //   to both dtors as
//                                                        //     `leaq __ZTV13PCShared_base(%rip), %rax
//                                                        //      addq $0x10, %rax
//                                                        //      movq %rax, 0x20(%rdi)`
//                                                        //   i.e. the standard
//                                                        //   "installed vptr"
//                                                        //   = vtable-symbol + 0x10
//                                                        //   (skip RTTI/offset-to-top).
//                                                        //   The stored value
//                                                        //   is __ZTV13PCShared_base+0x10,
//                                                        //   which reinstalls the
//                                                        //   PCShared_base vtable
//                                                        //   at THIS class's sub-object
//                                                        //   before running the
//                                                        //   base sub-object teardown.
//   +0x28  spCountedBasePtr : PC_Sp_counted_base*        // loaded via
//                                                        //   `movq 0x28(%rdi), %rdi`
//                                                        //   and, if non-NULL,
//                                                        //   fed to
//                                                        //   PC_Sp_counted_base::weak_release()
//                                                        //   (@Ozone stub 0x6de4fc).
//
// The dtors do NOT invoke a base-class destructor callee — the only
// teardown they perform is (a) reinstalling PCShared_base's vptr at
// +0x20 and (b) issuing a weak_release on the +0x28 counted-base ptr
// (guarded by a NULL check). D0 additionally tail-jmps to
// `operator delete(this)` (@Ozone stub 0x6dfc36).

// ── Frontier: undecoded companion types & runtime hooks ─────────────────
// PCShared_base — the base class whose vtable is installed at +0x20.
// Its vtable symbol is __ZTV13PCShared_base @Ozone; the installed ptr
// (vtable + 0x10) is what these dtors write. Neither the class nor its
// vtable slots are transcribed in THIS file — see the PCShared_base
// port for provenance.

/** PC_Sp_counted_base::weak_release() @Ozone stub 0x6de4fc
 *  (`_ZN18PC_Sp_counted_base12weak_releaseEv`) — the weak-reference
 *  release entry point for the intrusive shared-ptr counted-base type
 *  used across Ozone. Called by D1 @0xacb2c and D0 @0xacb61, in each
 *  case only when the +0x28 pointer is non-NULL. Undecoded here. */
function PC_Sp_counted_base_weak_release_stub(_p: unknown): void {
  throw new Error(
    "PC_Sp_counted_base::weak_release() @Ozone 0x6de4fc (stub) not yet transcribed",
  );
}

/** C++ `operator delete(void*)` @Ozone stub 0x6dfc36 (`_ZdlPv`). Called
 *  as the tail-jmp of the deleting dtor D0 @0xacb6f. Undecoded here. */
function operator_delete_stub(_self: PCLightWrapOptions): void {
  throw new Error(
    "operator delete(void*) @Ozone 0x6dfc36 (stub) not yet transcribed",
  );
}

/**
 * `PCLightWrapOptions` — Ozone options record. Only its destructor pair
 * is recovered from the framework's symbol table.
 */
export class PCLightWrapOptions {
  /** `vptr` @+0x20 — installed PCShared_base vtable pointer. Both dtors
   *  write `__ZTV13PCShared_base + 0x10` into this slot on entry, i.e.
   *  the installed form of PCShared_base's vtable. Modelled here as the
   *  tagged numeric offset so the reinstall side-effect is observable
   *  from TS. The actual runtime value is a framework-relative address
   *  resolved at load time; we only track "the dtor wrote it". */
  vptr_at_0x20: string = "";

  /** `spCountedBasePtr` @+0x28 — pointer to the PC_Sp_counted_base
   *  weak-reference control block for whatever intrusive shared_ptr
   *  this options record holds. Modelled as `unknown` so downstream
   *  code sees an opaque handle. NULL means "no held reference". */
  spCountedBasePtr: unknown = null;

  /**
   * `PCLightWrapOptions::~PCLightWrapOptions()` @Ozone 0xacb10 (D1,
   * non-deleting / base-object dtor).
   *
   * Disasm (all @Ozone):
   *   0xacb10  push rbp / mov rbp, rsp
   *   0xacb14  lea  rax, [rip+__ZTV13PCShared_base]      ; rax = &vtable-for-PCShared_base
   *   0xacb1b  add  rax, 0x10                            ; rax = installed vptr
   *   0xacb1f  mov  [rdi+0x20], rax                      ; this->vptr@+0x20 = installed
   *                                                      ;   (reinstall PCShared_base
   *                                                      ;    vtable before teardown)
   *   0xacb23  mov  rdi, [rdi+0x28]                      ; rdi = this->spCountedBasePtr
   *   0xacb27  test rdi, rdi
   *   0xacb2a  je   0xacb31                              ; if (rdi == NULL) skip
   *   0xacb2c  callq 0x6de4fc                            ; PC_Sp_counted_base::weak_release(rdi)
   *   0xacb31  pop  rbp
   *   0xacb32  ret
   *
   * Cleanup landing pad @0xacb33..@0xacb36 calls `__clang_call_terminate`
   * on unwind — consistent with weak_release possibly throwing during a
   * destructor, which is fatal.
   */
  dispose(): void {
    // @0xacb14..@0xacb1f: reinstall PCShared_base's installed vptr at
    // +0x20. The stored value is `__ZTV13PCShared_base + 0x10`, which
    // is the vtable-symbol + 0x10 (skip RTTI/offset-to-top).
    this.vptr_at_0x20 = "__ZTV13PCShared_base+0x10";

    // @0xacb23..@0xacb2c: load spCountedBasePtr and, if non-NULL,
    // issue weak_release. The load happens BEFORE the NULL check.
    const p = this.spCountedBasePtr;
    if (p !== null) {
      PC_Sp_counted_base_weak_release_stub(p);
    }
  }

  /**
   * `PCLightWrapOptions::~PCLightWrapOptions()` @Ozone 0xacb40 (D0,
   * deleting dtor). Identical body to D1 above, plus a tail-jmp to
   * `operator delete(this)`.
   *
   * Disasm (all @Ozone):
   *   0xacb40  push rbp / mov rbp, rsp / push rbx / push rax
   *   0xacb46  mov  rbx, rdi                              ; rbx = this
   *   0xacb49  lea  rax, [rip+__ZTV13PCShared_base]       ; rax = &vtable-for-PCShared_base
   *   0xacb50  add  rax, 0x10                             ; rax = installed vptr
   *   0xacb54  mov  [rdi+0x20], rax                       ; this->vptr@+0x20 = installed
   *   0xacb58  mov  rdi, [rdi+0x28]                       ; rdi = this->spCountedBasePtr
   *   0xacb5c  test rdi, rdi
   *   0xacb5f  je   0xacb66
   *   0xacb61  callq 0x6de4fc                             ; PC_Sp_counted_base::weak_release(rdi)
   *   0xacb66  mov  rdi, rbx
   *   0xacb69  add  rsp, 0x8 / pop rbx / pop rbp
   *   0xacb6f  jmp  0x6dfc36                              ; tail-jmp operator delete(this)
   *
   * Cleanup landing pad @0xacb74..@0xacb77 calls `__clang_call_terminate`
   * on unwind.
   */
  dispose_and_delete(): void {
    // Same body as D1:
    this.vptr_at_0x20 = "__ZTV13PCShared_base+0x10";
    const p = this.spCountedBasePtr;
    if (p !== null) {
      PC_Sp_counted_base_weak_release_stub(p);
    }
    // @0xacb6f: tail-jmp to operator delete(this).
    operator_delete_stub(this);
  }
}
