// OZEffect_Base.ts — FCP Ozone framework class.
// Transcribed from the x86_64 disassembly of Ozone in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
// Versions/A/Ozone (see raw-port/re/disasm/OZEffect_Base.*.s).
//
// Symbols (nm | c++filt):
//   0xf8950  t OZEffect_Base::areEffectsAppliedInScreenSpace()
//   0x6db0e0 t OZEffect_Base::~OZEffect_Base()   (D1 — nm shows this addr but the tV
//                                                 dump has no D1 body; effectively an
//                                                 alias/thunk into D0 at 0x6db0f0)
//   0x6db0f0 t OZEffect_Base::~OZEffect_Base()   (D0 — pushq/movq/ud2 unreachable trap)
//
// PROVENANCE / DECODE:
//   raw-port/re/disasm/OZEffect_Base.areEffectsAppliedInScreenSpace.s
//   raw-port/re/disasm/OZEffect_Base.~OZEffect_Base.s
//   vtable dump via resolve.py Ozone vtable OZEffect_Base:
//     *0x00 dtor D1  -> 0x6db0e0
//     *0x08 dtor D0  -> 0x6db0f0
//     *0x10..0x88    OZRenderNode / OZImageNode base slots (delegated to bases)
//     *0x90          OZEffect_Base::areEffectsAppliedInScreenSpace @0xf8950  ← this one
//     *0x98..0xb8    OZImageNode makeRender / buildRenderGraph slots
//   So OZEffect_Base inherits (transitively) from OZImageNode <- OZRenderNode.
//   The only method OZEffect_Base overrides in this class body is the
//   screenSpace-effect query at vtable slot *0x90.
//
// ── FIELD LAYOUT ───────────────────────────────────────────────────────────
//   From areEffectsAppliedInScreenSpace @0xf8950..0xf896a:
//     +0x18   delegateOrChild : OZEffect_Base*   (may be null)
//             When non-null, the method tail-jumps to the delegate's own
//             *0x90 slot (same virtual method), which means +0x18 points
//             at a compatible object whose vtable slot 0x90 answers the
//             same question — a delegate/wrap pattern used to chain
//             screenSpace-effect queries through nested effect trees.
//   Nothing else is touched by the two decoded methods, so no further
//   struct fields can be recovered here.  The full class also contains
//   the OZImageNode base subobject at offset 0 (vptr + inherited data).

/**
 * OZEffect_Base — Ozone base class for image-node effects.
 *
 * Only two behaviours are decoded here:
 *   • `areEffectsAppliedInScreenSpace()` — delegate query to +0x18 (null-safe).
 *   • Both `~OZEffect_Base()` dtor entries — the D0 body is a `ud2`
 *     unreachable trap, and no D2 body exists in the binary.
 *
 * @class Ozone OZEffect_Base
 * @provenance Ozone @0xf8950 (areEffectsAppliedInScreenSpace),
 *             @0x6db0e0 (D1), @0x6db0f0 (D0)
 */
export class OZEffect_Base {
  /**
   * +0x18 delegateOrChild — pointer to a compatible object whose vtable
   * slot 0x90 is the screenSpace-effect predicate.  May be null.
   * @provenance Ozone @0xf8954 (loaded as `movq 0x18(%rdi), %rdi`)
   */
  delegateOrChild_18: OZEffect_Base | null = null;

  /**
   * OZEffect_Base::areEffectsAppliedInScreenSpace() — vtable slot *0x90.
   *
   * Ozone @0xf8950..0xf896a.
   *
   *     movq   0x18(%rdi), %rdi           ; rdi = this->+0x18
   *     testq  %rdi, %rdi                 ; null?
   *     je     0xf8967                    ;   yes -> return false
   *     movq   (%rdi), %rax               ; rax = vtable of +0x18
   *     popq   %rbp
   *     jmpq   *0x90(%rax)                ; tail-call delegate's *0x90
   *   0xf8967:
   *     xorl   %eax, %eax                 ; return 0 (false)
   *     popq   %rbp
   *     retq
   *
   * @provenance Ozone @0xf8950
   */
  areEffectsAppliedInScreenSpace(): boolean {
    const child = this.delegateOrChild_18;
    if (child === null) {
      // je 0xf8967 branch: `xorl %eax,%eax; retq` -> return false.
      return false;
    }
    // Non-null branch: virtual tail-jmp to child's vtable slot 0x90 —
    // in JS, dynamic dispatch is just the method call on the subclass.
    return child.areEffectsAppliedInScreenSpace();
  }

  /**
   * OZEffect_Base::~OZEffect_Base() — D1 complete-object destructor entry.
   *
   * Ozone @0x6db0e0 — nm names this address as a D1 entry but /tmp/Ozone_tV.txt
   * carries no distinct D1 body at that address; only the D0 at 0x6db0f0
   * has a body.  Compilers occasionally emit D1 as a zero-body pad
   * immediately before D0 (both entries share the same trap semantic).
   * Faithful transcription: same `ud2` throw as D0.
   *
   * @provenance Ozone @0x6db0e0
   */
  destroy(): void {
    throw new Error(
      "OZEffect_Base::~OZEffect_Base() D1 @Ozone 0x6db0e0 shares its body " +
      "with the D0 `ud2` unreachable trap — the class is never destroyed " +
      "through its complete-object destructor."
    );
  }

  /**
   * OZEffect_Base::~OZEffect_Base() — D0 deleting destructor.
   *
   * Ozone @0x6db0f0..0x6db0f6:
   *
   *     pushq %rbp; movq %rsp,%rbp
   *     ud2                             ; unreachable
   *
   * @provenance Ozone @0x6db0f0
   */
  destroyAndFree(): void {
    throw new Error(
      "OZEffect_Base::~OZEffect_Base() D0 @Ozone 0x6db0f0 is a `ud2` " +
      "unreachable trap — the class is never destroyed through its " +
      "deleting destructor."
    );
  }
}
