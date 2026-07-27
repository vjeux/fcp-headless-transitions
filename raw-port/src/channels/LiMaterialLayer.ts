// LiMaterialLayer — Ozone class whose only two exported symbols
// (LiMaterialLayer::~LiMaterialLayer D1 and D0) are both the two-instruction
// `ud2` trap. In addition the Itanium ABI emits two virtual-thunk aliases
// (__ZTv0_n24_...) at the next 16-byte-aligned addresses; they are also
// `ud2` traps with the same body.
//
// Source disassembly:  raw-port/re/disasm/LiMaterialLayer.dtors.s
// Framework: Final Cut Pro / Ozone.framework
//
// Ozone symbols transcribed:
//   @0x6db4a0  LiMaterialLayer::~LiMaterialLayer()      (D1 — complete-object)
//   @0x6db4b0  LiMaterialLayer::~LiMaterialLayer()      (D0 — deleting)
//   @0x6db4c0  __ZTv0_n24_N15LiMaterialLayerD1Ev        (virtual thunk to D1)
//   @0x6db4d0  __ZTv0_n24_N15LiMaterialLayerD0Ev        (virtual thunk to D0)
//
// Body of each dtor (byte-for-byte identical besides address):
//
//   pushq  %rbp
//   movq   %rsp, %rbp
//   ud2                                   // <-- undefined-instruction TRAP
//   nopw   %cs:(%rax,%rax)                // 16-byte alignment padding
//
// `ud2` is the x86-64 "undefined instruction" mnemonic and clang emits it for
// bodies the frontend has statically proven unreachable — most commonly a
// pure-virtual base's `~T()` (the abstract-base gate that must never be
// invoked because a concrete subclass overrides the vtable slot) or an
// `= delete`d dtor forced to have a symbol so the vtable slot can be written.
// The 4-byte `nopw %cs:(%rax,%rax)` after each `ud2` is compiler-emitted
// padding, not executable logic — the CPU never reaches it.
//
// Ozone's symbol map corroborates this reading: LiMaterialLayer appears only
// in contexts that would be produced by an abstract material-layer base:
//   * `PCPtr<LiMaterialLayerOperator>` operator= specializations for concrete
//     subclasses BumpMaterialLayer, FlatMaterialLayer, SpecularMaterialLayer
//     (see /tmp/Ozone_symmap.tsv), i.e. the class is USED by name via
//     `LiMaterialLayerOperator` in the operator queue, but no concrete
//     LiMaterialLayer method beyond the two `ud2` dtors is emitted.
//   * `LiMaterialLayerUniform` — the uniform struct that concrete subclasses
//     (e.g. OZMaterialPaintLayer::setupTextureColorAdjustment) populate.
//     Its ctor/dtor/copy-assign are separately emitted (see D2Ev, C2Ev,
//     C2ERKS_, aSERKS_), all with real bodies — those are NOT this class.
//
// There is NO field access, NO call, NO conditional in either dtor body — the
// only observable field of the class in these two bodies is the vtable
// pointer at `+0x00`, and neither body reads it. The class layout is not
// pinned by this port; a future ctor/subclass port will pin it.
//
// ── PORT ─────────────────────────────────────────────────────────────────
// The faithful mirror in TypeScript is a class whose only two operations are
// throwing calls that reproduce the trap semantic. Any code path that would
// dispatch through the C++ dtor slot on this abstract base is meant to be
// unreachable; hitting it in the port must be equally loud.

/**
 * `LiMaterialLayer` — abstract-base marker for Ozone's material-layer
 * hierarchy (BumpMaterialLayer / FlatMaterialLayer / SpecularMaterialLayer
 * are concrete subclasses that install their own `~T()` slots and override
 * the ones here; see the `PCPtr<LiMaterialLayerOperator>` operator=
 * specializations in /tmp/Ozone_symmap.tsv).
 *
 * The Ozone binary emits both dtor symbols solely to satisfy the C++
 * Itanium ABI vtable layout; neither body is meant to run. Field layout is
 * undecoded: neither dtor reads any field, so the only pinned fact about
 * this class is that its complete-object dtor slot (@Ozone 0x6db4a0) and its
 * deleting-dtor slot (@Ozone 0x6db4b0) both point at `ud2` traps, and their
 * virtual-thunk aliases (@Ozone 0x6db4c0 and 0x6db4d0) do the same. A future
 * ctor/subclass port will pin the field layout.
 */
export class LiMaterialLayer {
  /**
   * `LiMaterialLayer::~LiMaterialLayer()` (complete-object, D1 in the
   * Itanium C++ ABI) @Ozone 0x6db4a0.
   *
   * Body:
   *   0x6db4a0  pushq %rbp
   *   0x6db4a1  movq  %rsp, %rbp
   *   0x6db4a4  ud2                            // trap — never returns
   *   0x6db4a6  nopw  %cs:(%rax,%rax)          // 16-byte alignment padding
   *
   * `ud2` unconditionally raises #UD (Invalid Opcode) — control never reaches
   * the padding or any later instruction. The faithful mirror is a throw.
   */
  destroy(): void {
    throw new Error(
      "LiMaterialLayer::~LiMaterialLayer() (D1) @Ozone 0x6db4a0 " +
        "is a `ud2` trap — the abstract-base dtor slot must never execute; a " +
        "concrete subclass overrides this vtable entry."
    );
  }

  /**
   * `LiMaterialLayer::~LiMaterialLayer()` (deleting-dtor, D0 in the
   * Itanium C++ ABI) @Ozone 0x6db4b0.
   *
   * Body is byte-for-byte identical to D1 above (`pushq %rbp; movq %rsp,%rbp;
   * ud2; nopw %cs:(%rax,%rax)`), just at the next 16-byte-aligned address.
   * The D0 slot is the one the vtable dispatches through when the object is
   * being `delete`-freed (so it must both destruct and free); making it a
   * `ud2` prevents any callers from reaching it on this abstract base.
   */
  destroyAndDelete(): void {
    throw new Error(
      "LiMaterialLayer::~LiMaterialLayer() (D0/deleting) @Ozone 0x6db4b0 " +
        "is a `ud2` trap — the abstract-base deleting-dtor slot must never execute; a " +
        "concrete subclass overrides this vtable entry."
    );
  }

  /**
   * `__ZTv0_n24_N15LiMaterialLayerD1Ev` (virtual thunk to D1) @Ozone 0x6db4c0.
   *
   * Itanium ABI virtual thunk: the compiler emits this when a secondary base
   * (offset 0 in this case per the `v0_` prefix, with vtable index -24 per
   * `n24_`) needs its `~T()` slot to adjust the `this` pointer before jumping
   * to the primary dtor. Here the thunk body is ALSO `ud2` (@0x6db4c0),
   * which means either (a) the ABI forced the symbol into existence to
   * satisfy the secondary-vtable slot even though the target D1 is itself
   * `ud2`, or (b) the frontend statically proved the thunk unreachable for
   * the same reason as D1. Either way the faithful mirror is a throw.
   */
  thunkDestroyD1(): void {
    throw new Error(
      "__ZTv0_n24_N15LiMaterialLayerD1Ev @Ozone 0x6db4c0 " +
        "is a `ud2` trap — this virtual thunk to LiMaterialLayer::~LiMaterialLayer() " +
        "(D1) must never execute; the abstract base's dtor is itself a `ud2`."
    );
  }

  /**
   * `__ZTv0_n24_N15LiMaterialLayerD0Ev` (virtual thunk to D0) @Ozone 0x6db4d0.
   *
   * Body byte-for-byte identical to the D1 thunk above, just at the next
   * 16-byte-aligned address. See the D1 thunk comment for the ABI rationale.
   */
  thunkDestroyD0(): void {
    throw new Error(
      "__ZTv0_n24_N15LiMaterialLayerD0Ev @Ozone 0x6db4d0 " +
        "is a `ud2` trap — this virtual thunk to LiMaterialLayer::~LiMaterialLayer() " +
        "(D0/deleting) must never execute; the abstract base's dtor is itself a `ud2`."
    );
  }
}
