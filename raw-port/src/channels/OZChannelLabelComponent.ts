// OZChannelLabelComponent — Flexo class whose two visible destructor symbols
// are BOTH the two-instruction `ud2` trap.  Both symbols appear at
// consecutive 16-byte-aligned addresses and share the exact same body:
//
//   __ZN23OZChannelLabelComponentD1Ev  @0x1491b60  (complete-object dtor)
//   __ZN23OZChannelLabelComponentD0Ev  @0x1491b70  (deleting dtor)
//
// Source disassembly:
//   raw-port/re/disasm/Flexo.OZChannelLabelComponent.dtor_D1.s              (@0x1491b60)
//   raw-port/re/disasm/Flexo.OZChannelLabelComponent.~OZChannelLabelComponent.s (D0 @0x1491b70)
// Framework: Final Cut Pro / Flexo.framework.
//
// Body of each dtor (byte-for-byte identical besides address):
//
//   pushq  %rbp
//   movq   %rsp, %rbp
//   ud2                                   // <-- undefined-instruction TRAP
//   nopw   %cs:(%rax,%rax)                // padding to the next 16-byte boundary
//
// `ud2` is the x86-64 "undefined instruction" mnemonic and clang emits it for
// bodies the frontend has statically proven unreachable — most commonly a
// pure-virtual base's `~T()` (the abstract-base gate that must never be
// invoked because a concrete subclass overrides the vtable slot) or an
// `= delete`d dtor forced to have a symbol so the vtable slot can be written.
// The 4-byte `nopw %cs:(%rax,%rax)` after each `ud2` is compiler-emitted
// padding, not executable logic — the CPU never reaches it.
//
// There is NO field access, NO call, NO conditional in either symbol — the
// only observable field of the class in these two bodies is the vtable
// pointer at `+0x00`, and neither body reads it.  The class layout is not
// pinned by this port; a future ctor/subclass port will pin it.
//
// ── PORT ─────────────────────────────────────────────────────────────────
// The faithful mirror in TypeScript is a class whose ONLY two operations are
// throwing calls that reproduce the trap semantic.  Any code path that would
// dispatch through the C++ dtor slot on this abstract base is meant to be
// unreachable; hitting it in the port must be equally loud.

/**
 * `OZChannelLabelComponent` — abstract-base marker.  The Flexo binary emits
 * both dtor symbols solely to satisfy the C++ Itanium ABI vtable layout;
 * neither body is meant to run.  Concrete subclasses install their own
 * `~T()` slots and override the ones here.
 *
 * Layout is undecoded: neither dtor reads any field, so the only pinned fact
 * about this class is that its vtable slot for the complete-object dtor
 * (@Flexo 0x1491b60) and its deleting-dtor slot (@Flexo 0x1491b70) both point
 * at `ud2` traps.  A future ctor port will pin the field layout.
 */
export class OZChannelLabelComponent {
  /**
   * `OZChannelLabelComponent::~OZChannelLabelComponent()` (complete-object,
   * D1 in the Itanium C++ ABI) @Flexo 0x1491b60.
   *
   * Body:
   *   0x1491b60  pushq %rbp
   *   0x1491b61  movq  %rsp, %rbp
   *   0x1491b64  ud2                            // trap — never returns
   *   0x1491b66  nopw  %cs:(%rax,%rax)          // 16-byte alignment padding
   *
   * `ud2` unconditionally raises #UD (Invalid Opcode) — control never reaches
   * the padding or any later instruction.  The faithful mirror is a throw.
   */
  destroy(): void {
    throw new Error(
      "OZChannelLabelComponent::~OZChannelLabelComponent() (D1) @Flexo 0x1491b60 " +
        "is a `ud2` trap — the abstract-base dtor slot must never execute; a " +
        "concrete subclass overrides this vtable entry."
    );
  }

  /**
   * `OZChannelLabelComponent::~OZChannelLabelComponent()` (deleting-dtor,
   * D0 in the Itanium C++ ABI) @Flexo 0x1491b70.
   *
   * Body is byte-for-byte identical to D1 above (`pushq %rbp; movq %rsp,%rbp;
   * ud2; nopw %cs:(%rax,%rax)`), just at the next 16-byte-aligned address.
   * The D0 slot is the one the vtable dispatches through when the object is
   * being `delete`-freed (so it must both destruct and free); making it a
   * `ud2` prevents any callers from reaching it on this abstract base.
   */
  destroyAndDelete(): void {
    throw new Error(
      "OZChannelLabelComponent::~OZChannelLabelComponent() (D0/deleting) @Flexo 0x1491b70 " +
        "is a `ud2` trap — the abstract-base deleting-dtor slot must never execute; a " +
        "concrete subclass overrides this vtable entry."
    );
  }
}
