// LiErrorCompileFailedMaterial.ts — Ozone's LiErrorCompileFailedMaterial.
//
// Faithful transcription from the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone.
// See raw-port/re/disasm/LiErrorCompileFailedMaterial.LiErrorCompileFailedMaterial.s .
//
// ROLE. Concrete "compile-failed" placeholder material used by Ozone's
// Li* 3D-engine plumbing when the real material's shader fails to
// compile. Only ONE exported symbol is present in this class's ledger
// entry (per raw-port/army/ledger/Ozone.ledger.json):
//   @0x5ae3f0  __ZN28LiErrorCompileFailedMaterialC1Ev
//              LiErrorCompileFailedMaterial::LiErrorCompileFailedMaterial()  [C1]
// The C2 (base) ctor variant is NOT emitted separately in this slice —
// this class is only ever instantiated as a complete object.
//
// FRAMEWORK: Ozone.framework (Final Cut Pro).
//
// EXTERNAL DEPENDENCIES (all with `U` linkage — resolved at load time
// against LiMaterial's real definition, which lives outside Ozone —
// most likely inside a Metal-hosted Li* plugin bundle):
//   __ZN10LiMaterialC2Ev                       LiMaterial::LiMaterial()  (C2 base ctor)
//                                              — call site @0x5ae429; passes
//                                              this in %rdi and the VTT+8 in
//                                              %rsi.
//   __ZTT28LiErrorCompileFailedMaterial        vtable-table (VTT) for
//                                              LiErrorCompileFailedMaterial
//                                              — read at @0x5ae41e via
//                                              `movq 0x27759b(%rip),%rsi`;
//                                              rsi then += 0x8 before being
//                                              forwarded to the base ctor
//                                              (VTT[1] is the base's
//                                              construction-vtable pointer,
//                                              per Itanium ABI §5.2.4).
//   __ZTV28LiErrorCompileFailedMaterial        vtable for
//                                              LiErrorCompileFailedMaterial
//                                              — read at @0x5ae42e via
//                                              `movq 0x2775eb(%rip),%rax`;
//                                              the PRIMARY vtable pointer is
//                                              at VT+0x18; the secondary
//                                              vtable pointer (for the
//                                              PCShared_base subobject at
//                                              this+0x2b8) is at VT+0xf0.
//
// LOCAL DEPENDENCIES (weakly linked in Ozone's slice — real):
//   __ZTV13PCShared_base  @0x8323b0 (Ozone-local)   — PCShared_base's vtable;
//                                                     the ctor installs
//                                                     VT+0x10 into this+0x2b8
//                                                     BEFORE calling
//                                                     LiMaterial::LiMaterial.
//   __ZN13PCShared_baseD2Ev                          PCShared_base::~PCShared_base D2
//                                                     — called from the unwind
//                                                     path (@0x5ae476) on the
//                                                     PCShared_base subobject.
//
// STRUCT LAYOUT (partial — recovered from the ctor's field writes):
//   +0x000  vtable*                       primary vtable pointer
//                                          (installed to VT+0x18 by the ctor
//                                           after LiMaterial::LiMaterial returns)
//   +0x008..+0x297  <LiMaterial base subobject; layout unknown from this decode>
//   +0x298  double 1.0                    (`movabsq $0x3ff0000000000000, %rax ;
//                                            movq %rax, 0x298(%rbx)` @0x5ae453)
//   +0x2a0  16 bytes zero                 (`xorps %xmm0,%xmm0 ; movups %xmm0,
//                                            0x2a0(%rbx)` @0x5ae45d)
//   +0x2b0  double 1.0                    (`movq %rax, 0x2b0(%rbx)` @0x5ae464
//                                            — %rax still holds the 1.0 bits
//                                            loaded @0x5ae449)
//   +0x2b8  vtable* (PCShared_base subobj) initially PCShared_base VT+0x10
//                                            (@0x5ae40c), then overwritten by
//                                            VT+0xf0 (the LiErrorCompileFailedMaterial
//                                            secondary vtable slot) @0x5ae442
//   +0x2c0  u64 zero                       PCWeakCount subobject's first qword
//                                            (see PCShared_base's layout —
//                                            PCWeakCount lives at
//                                            PCShared_base+0x08)
//                                            (`movq $0x0, 0x2c0(%rdi)` @0x5ae413)
// sizeof(LiErrorCompileFailedMaterial) is AT LEAST 0x2c8 bytes based on the
// fields the ctor touches. The remaining bytes belong to the LiMaterial
// base subobject in the [0x8, 0x298) range — LiMaterial's layout is
// external and not yet transcribed.
//
// The +0x298/+0x2b0 double 1.0 pair sandwiching an xmm0-zeroed 16-byte
// gap at +0x2a0..+0x2b0 is characteristic of a 4x1 float32-quad or
// 2x1 float64-pair "default color" field — likely the material's
// error-marker colour (opaque magenta / opaque something), initialized
// to (1.0, 0, 0, 0, 0, 1.0) as two f64s bracketing a zero block.
// Without a getter/setter symbol we don't need to name it more
// specifically; the ctor's literal writes are what we transcribe.
//
// VTABLE INSTALL SEQUENCE (Itanium C++ ABI §5.2.4):
// The two-phase install is the standard "virtual-base vtable during
// derived ctor" idiom:
//   1. Set up the virtual base's vtable first
//      (PCShared_base VT+0x10 at this+0x2b8), so that any virtual
//      calls the LiMaterial base ctor makes onto the virtual base
//      dispatch to PCShared_base's PROPER slots.
//   2. Call LiMaterial::LiMaterial with VTT+8 as the "construction
//      vtable table" argument — that's how the base ctor knows which
//      per-derived vtable to install for its own subobjects.
//   3. On return, overwrite both vptr slots (primary at +0x0 and
//      secondary at +0x2b8) with the DERIVED class's vtable pointers
//      (VT+0x18 and VT+0xf0 respectively). These are the "in-charge"
//      vtable pointers for LiErrorCompileFailedMaterial's own dispatch.
//
// FULL DISASSEMBLY:
//   @0x5ae3f0  pushq %rbp; movq %rsp,%rbp
//   @0x5ae3f4  pushq %r14
//   @0x5ae3f6  pushq %rbx
//   @0x5ae3f7  movq  %rdi, %rbx                          ; %rbx = this  (surviving)
//   @0x5ae3fa  leaq  0x2b8(%rdi), %r14                   ; %r14 = &this->PCShared_base subobject
//                                                          (needed by the unwind path
//                                                          @0x5ae470..@0x5ae478 to run the
//                                                          PCShared_base D2 dtor on the
//                                                          partially-constructed subobject).
//   @0x5ae401  leaq  __ZTV13PCShared_base(%rip), %rax    ; %rax = &PCShared_base vtable
//                                                          (Ozone-local weak alias, resolves
//                                                          to ProCore's PCShared_base VT).
//   @0x5ae408  addq  $0x10, %rax                         ; %rax = VT + 0x10
//                                                          (the installed vptr — skips the
//                                                          16-byte typeinfo/offset-to-top
//                                                          header per Itanium ABI).
//   @0x5ae40c  movq  %rax, 0x2b8(%rdi)                   ; this->PCShared_base.vptr = VT+0x10
//   @0x5ae413  movq  $0x0, 0x2c0(%rdi)                   ; this->PCShared_base.PCWeakCount.field_00 = 0
//   @0x5ae41e  movq  __ZTT28LiErrorCompileFailedMaterial(%rip), %rsi
//                                                        ; %rsi = &VTT (Vtable-Table)
//   @0x5ae425  addq  $0x8, %rsi                          ; %rsi = VTT + 8   (base ctor's
//                                                          construction-vtable table)
//   @0x5ae429  callq __ZN10LiMaterialC2Ev                ; LiMaterial::LiMaterial(this, VTT+8)
//                                                          — base ctor. May throw.
//   @0x5ae42e  movq  __ZTV28LiErrorCompileFailedMaterial(%rip), %rax
//                                                        ; %rax = &VT (derived-class vtable)
//   @0x5ae435  leaq  0x18(%rax), %rcx                    ; %rcx = VT + 0x18 (primary in-charge vptr)
//   @0x5ae439  movq  %rcx, (%rbx)                        ; this->vptr = VT+0x18
//   @0x5ae43c  addq  $0xf0, %rax                         ; %rax = VT + 0xf0 (secondary in-charge vptr
//                                                          for the PCShared_base subobject)
//   @0x5ae442  movq  %rax, 0x2b8(%rbx)                   ; this->PCShared_base.vptr = VT+0xf0
//                                                          (overwrites the earlier PCShared_base
//                                                          VT+0x10 install at 0x5ae40c).
//   @0x5ae449  movabsq $0x3ff0000000000000, %rax         ; %rax = 1.0 (double)
//   @0x5ae453  movq  %rax, 0x298(%rbx)                   ; this[+0x298] = 1.0
//   @0x5ae45a  xorps %xmm0, %xmm0                        ; %xmm0 = 0
//   @0x5ae45d  movups %xmm0, 0x2a0(%rbx)                 ; this[+0x2a0..+0x2af] = 16 zero bytes
//   @0x5ae464  movq  %rax, 0x2b0(%rbx)                   ; this[+0x2b0] = 1.0 (same bit pattern
//                                                          as 0x298 — the 1.0 in %rax survives)
//   @0x5ae46b..@0x5ae46f  popq %rbx; popq %r14; popq %rbp; retq
//
//   UNWIND @0x5ae470..@0x5ae47e:
//   @0x5ae470  movq  %rax, %rbx                          ; %rbx = exception object
//   @0x5ae473  movq  %r14, %rdi                          ; %rdi = &this->PCShared_base subobject
//   @0x5ae476  callq __ZN13PCShared_baseD2Ev             ; ~PCShared_base D2 on the subobject
//                                                          (constructed by the leaq/movq @0x5ae40c-13
//                                                          but not yet upgraded to VT+0xf0).
//   @0x5ae47b  movq  %rbx, %rdi                          ; %rdi = exception object
//   @0x5ae47e  callq __Unwind_Resume  (stub @0x6dd07a)   ; re-raise.
//
// PORT: LiMaterial is external / not-yet-transcribed. The C2 ctor call
// therefore becomes a THROWing stub per PORTING_SPEC Rule 3. Every
// vtable payload address IS resolved (VT+0x18 primary, VT+0xf0
// secondary) but the vtable bodies themselves live in an external
// binary — we model the installs as *opaque handle writes* whose
// values are annotated with the exact offsets from the derived
// vtable's base pointer. This preserves the address citations at
// commit time so `frontier.py` sees the gap.

import { PCShared_base, type PCWeakCountBase } from "../infra/PCShared_base.js";

// ─────────────────────────────────────────────────────────────────────────────
// Frontier stubs (Rule 3 — cite every undecoded callee)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * `LiMaterial::LiMaterial()` — Ozone's abstract material base ctor (C2 base
 * ctor variant, symbol `__ZN10LiMaterialC2Ev`). External / not yet
 * transcribed — the LiMaterial class body lives outside the Ozone slice
 * (`U` linkage in `nm -arch x86_64 Ozone`).
 *
 * Called at @Ozone 0x5ae429 from LiErrorCompileFailedMaterial::C1 with
 *   %rdi = this,
 *   %rsi = &__ZTT28LiErrorCompileFailedMaterial + 8    (VTT[1] pointer
 *                                                        — the construction
 *                                                        vtable table for the
 *                                                        derived-class's
 *                                                        base subobject, per
 *                                                        Itanium ABI §5.2.4).
 */
function LiMaterial_C2(_self: object, _vttPlus8: unknown): void {
  throw new Error(
    "LiErrorCompileFailedMaterial: LiMaterial::LiMaterial() (C2 base ctor) not yet transcribed @Ozone __ZN10LiMaterialC2Ev (call site 0x5ae429)",
  );
}

/**
 * Handle for the LiErrorCompileFailedMaterial vtable payload
 * (`__ZTV28LiErrorCompileFailedMaterial`). External / not yet
 * transcribed — the vtable itself is emitted in the framework that
 * defines LiMaterial, not in Ozone (`U` linkage).
 *
 * The Itanium C++ ABI emits the vtable as a contiguous blob whose two
 * "installed pointer" slots for a class with a single virtual base
 * (PCShared_base at this+0x2b8) live at:
 *   VT + 0x18   primary in-charge vptr  (installed at this+0x000 @0x5ae439)
 *   VT + 0xf0   secondary in-charge vptr for the PCShared_base subobject
 *               (installed at this+0x2b8 @0x5ae442, overwriting the
 *                bootstrap PCShared_base VT+0x10 install @0x5ae40c-13)
 * We surface these as opaque symbolic values here so the port compiles
 * without fabricating the vtable body.
 */
export type LiErrorCompileFailedMaterialVTable = {
  readonly __liErrorCompileFailedMaterialVTable:
    | "__ZTV28LiErrorCompileFailedMaterial+0x18"
    | "__ZTV28LiErrorCompileFailedMaterial+0xf0";
};

const VTABLE_PRIMARY_PTR: LiErrorCompileFailedMaterialVTable = {
  __liErrorCompileFailedMaterialVTable:
    "__ZTV28LiErrorCompileFailedMaterial+0x18",
};

const VTABLE_SECONDARY_PTR: LiErrorCompileFailedMaterialVTable = {
  __liErrorCompileFailedMaterialVTable:
    "__ZTV28LiErrorCompileFailedMaterial+0xf0",
};

/**
 * `LiErrorCompileFailedMaterial` — Ozone's "compile-failed" placeholder
 * material. Faithful transcription of the sole exported ctor
 * `__ZN28LiErrorCompileFailedMaterialC1Ev` @Ozone 0x5ae3f0.
 *
 * The class DERIVES from LiMaterial (which itself, by construction
 * evidence at @0x5ae40c-13 and @0x5ae442, has a virtual-base subobject
 * of type PCShared_base at fixed derived-class offset +0x2b8, whose
 * PCWeakCount pcw sub-subobject starts at +0x2c0).
 *
 * The only observable initialisation surface exposed to the port is
 *   * the LiMaterial C2 call (throw-stubbed here),
 *   * the PCShared_base subobject bootstrap install + PCWeakCount
 *     zero-init,
 *   * the two vptr overwrites at +0x0 and +0x2b8, and
 *   * three constant scalar writes at +0x298 / +0x2a0..+0x2af / +0x2b0.
 */
export class LiErrorCompileFailedMaterial {
  /**
   * this[+0x000] — primary in-charge vptr. Installed to
   * `__ZTV28LiErrorCompileFailedMaterial + 0x18` @0x5ae439.
   */
  public vptr: LiErrorCompileFailedMaterialVTable;

  /**
   * this[+0x298] — a double stored as 1.0 by the ctor
   * (@0x5ae449 movabsq $0x3ff0000000000000; @0x5ae453 movq into +0x298).
   */
  public field_298: number;

  /**
   * this[+0x2a0..+0x2af] — a 16-byte quadword-aligned zero block written
   * by `xorps %xmm0,%xmm0 ; movups %xmm0, 0x2a0(%rbx)` @0x5ae45a-0x5ae45d.
   * Modelled as two f64 zero slots, matching the two-double bracket
   * (+0x298=1.0, +0x2a0..+0x2af=0, +0x2b0=1.0) the ctor lays down.
   */
  public field_2a0: number;
  public field_2a8: number;

  /**
   * this[+0x2b0] — a double stored as 1.0 by the ctor
   * (`movq %rax, 0x2b0(%rbx)` @0x5ae464; %rax still holds
   *  0x3ff0000000000000).
   */
  public field_2b0: number;

  /**
   * this[+0x2b8] — secondary in-charge vptr for the PCShared_base
   * subobject. Installed in two steps by the ctor:
   *   1. Bootstrap to `__ZTV13PCShared_base + 0x10` @0x5ae40c so any
   *      virtual dispatch the LiMaterial base ctor makes into the
   *      PCShared_base subobject resolves to the PCShared_base's own
   *      slots.
   *   2. Overwrite to `__ZTV28LiErrorCompileFailedMaterial + 0xf0`
   *      @0x5ae442 after LiMaterial's ctor returns, so subsequent
   *      dispatch resolves into the derived class's overrides.
   *
   * We surface the PCShared_base subobject as a full landed
   * PCShared_base instance here (matching Rule 6's one-class-per-file
   * discipline — we don't re-stub the base), and mark its "final"
   * vtable install via the opaque `LiErrorCompileFailedMaterialVTable`
   * type so the port compiles.
   */
  public pcSharedBaseSubobject: PCShared_base;
  public pcSharedBaseSubobjectVptr: LiErrorCompileFailedMaterialVTable;

  /**
   * LiErrorCompileFailedMaterial::LiErrorCompileFailedMaterial()
   * @Ozone 0x5ae3f0  (C1, complete-object ctor; C2 base ctor is not
   * separately emitted for this class).
   *
   * Faithful transcription of the ctor body. See the file-level comment
   * above for the line-by-line disassembly annotation; the TS below
   * mirrors that annotation's branch/write order.
   *
   * The `pcWeakCountBase` parameter models the +0x2c0 PCWeakCount
   * subobject construction — the ctor zero-initialises its first qword
   * via `movq $0x0, 0x2c0(%rdi)` but the rest of the PCWeakCount
   * subobject's layout is inherited from ProCore's PCShared_base
   * subobject (see raw-port/src/infra/PCShared_base.ts). Callers must
   * supply a pre-constructed PCWeakCountBase handle, matching the
   * pattern PCShared_base already uses in the ported code (its own
   * ctor takes the PCWeakCountBase because the C++ ctor is not
   * emitted in ProCore either).
   */
  public constructor(pcWeakCountBase: PCWeakCountBase) {
    // -----------------------------------------------------------------
    // @0x5ae3fa  leaq 0x2b8(%rdi), %r14 — used only by the unwind path
    //           below (nothing to model in TS since we don't manually
    //           unwind).
    // @0x5ae401..@0x5ae413 — bootstrap-install the PCShared_base vtable
    //           and zero the PCWeakCount subobject's first qword. TS
    //           models this via constructing the PCShared_base
    //           subobject with its own ctor, which sets up the same
    //           state semantically. The exact address of the vptr
    //           install (VT+0x10) is documented in the file-level
    //           comment; the PCShared_base class installs that same
    //           value from its own dtor path (see PCShared_base.ts).
    // -----------------------------------------------------------------
    this.pcSharedBaseSubobject = new PCShared_base(pcWeakCountBase);

    // -----------------------------------------------------------------
    // @0x5ae41e  movq __ZTT28LiErrorCompileFailedMaterial(%rip), %rsi
    // @0x5ae425  addq $0x8, %rsi
    // @0x5ae429  callq __ZN10LiMaterialC2Ev
    //   LiMaterial::LiMaterial(this, VTT+8) — throw-stubbed since
    //   LiMaterial is external / not yet transcribed.
    // -----------------------------------------------------------------
    const vtt_plus_8 = {
      __opaque: "__ZTT28LiErrorCompileFailedMaterial+0x8",
    } as const;
    LiMaterial_C2(this, vtt_plus_8);

    // -----------------------------------------------------------------
    // @0x5ae42e..@0x5ae442 — install the DERIVED-class vtables at
    // +0x0 (primary, VT+0x18) and +0x2b8 (secondary, VT+0xf0). The
    // secondary install OVERWRITES the bootstrap PCShared_base VT+0x10
    // install from @0x5ae40c.
    // -----------------------------------------------------------------
    // @0x5ae439: movq %rcx, (%rbx)    ; this->vptr = VT+0x18
    this.vptr = VTABLE_PRIMARY_PTR;
    // @0x5ae442: movq %rax, 0x2b8(%rbx) ; this+0x2b8 = VT+0xf0
    this.pcSharedBaseSubobjectVptr = VTABLE_SECONDARY_PTR;

    // -----------------------------------------------------------------
    // @0x5ae449..@0x5ae464 — scalar field init.
    //   %rax = 1.0 (double, 0x3FF0000000000000).
    //   this[+0x298] = 1.0
    //   this[+0x2a0..+0x2af] = 0    (16-byte movups from zeroed xmm0)
    //   this[+0x2b0] = 1.0    (same %rax value survives across the xorps)
    // -----------------------------------------------------------------
    // @0x5ae453: movq %rax, 0x298(%rbx)
    this.field_298 = 1.0;
    // @0x5ae45a..@0x5ae45d: xorps %xmm0,%xmm0 ; movups %xmm0, 0x2a0(%rbx)
    this.field_2a0 = 0.0;
    this.field_2a8 = 0.0;
    // @0x5ae464: movq %rax, 0x2b0(%rbx)
    this.field_2b0 = 1.0;

    // @0x5ae46b..@0x5ae46f — epilogue (register restore + retq).
    //
    // UNWIND @0x5ae470..@0x5ae47e (if LiMaterial_C2 above throws):
    //   the compiler calls PCShared_base::~PCShared_base(D2) on the
    //   partially-constructed subobject at this+0x2b8, then re-raises
    //   via __Unwind_Resume. In TS we rely on the exception propagating
    //   naturally — the JS engine handles stack unwinding. The
    //   PCShared_base subobject we allocated above will be GC'd once
    //   this `this` object becomes unreachable, so no explicit
    //   destructor call is needed. The address annotation in the
    //   file-level comment above records this exact provenance
    //   (@0x5ae476 -> __ZN13PCShared_baseD2Ev).
  }
}
