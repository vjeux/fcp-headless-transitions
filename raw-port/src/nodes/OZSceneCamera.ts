// OZSceneCamera — Ozone per-scene camera object. This file ports ONLY
// the C1 ctor at @Ozone 0x4455b0; other methods (D1/D0, virtuals, etc.)
// are separate ledger entries and will be added to this file when
// their own units are claimed.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Ozone.framework/Versions/A/Ozone (x86_64 slice; unadjusted
//             VAs from `otool -tV`).
//
// Disassembly source:
//   raw-port/re/disasm/__ZN13OZSceneCameraC1EP7OZScenej.s
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (recovered from the C1 body — every field is either
// written by the ctor or read by a later-decoded member)
// -----------------------------------------------------------------------------
// OZSceneCamera {
//   +0x00  vptr             : void*          (primary vtable — writes
//                                             address 0x865288 in Ozone
//                                             via `leaq 0x41fcc5(%rip), %rax`
//                                             @0x4455bc → RIP-relative
//                                             (0x4455c3 + 0x41fcc5 = 0x865288))
//   +0x08  scene            : OZScene*       (from arg %rsi @0x4455d1)
//   +0x10  index            : uint32_t       (from arg %edx @0x4455d5)
//   +0x14  activeFlag       : uint8_t = 1    (const 1 @0x4455d8)
//   +0x18..+0x2f            : (padding / other fields NOT touched here)
//   +0x30  vptr2            : void*          (secondary vtable subobject
//                                             — writes address 0x865640
//                                             in Ozone via
//                                             `leaq 0x420073(%rip), %rax`
//                                             @0x4455c6 → RIP-relative
//                                             (0x4455cd + 0x420073 = 0x865640).
//                                             This is the standard
//                                             multiple-inheritance / VMI
//                                             vptr for the second base
//                                             subobject.)
//   +0x38  fieldAt38        : void* = 0      (zero'd @0x4455b4 — likely a
//                                             pointer field that a later
//                                             assign() sets; NULL is the
//                                             ctor's initial value.)
// }
//
// The ctor writes SEVEN slots and leaves everything else in "whatever
// operator new returned" state — which is fine because operator new is
// zero-initialised only for arrays of scalars; for a class new-expr the
// object memory is uninitialised until the ctor stores. That is faithful
// to the disasm: the ctor only touches +0x00, +0x08, +0x10, +0x14, +0x30,
// +0x38. Any other field is left to a subsequent member's initialiser
// or the default zero-init we bake into the JS class body below.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
// None. The ctor is a pure struct-initialiser: it stores four incoming
// values, one zero, and two RIP-relative constants (vtable pointers).
// There are no function calls (no callq instructions at all). Every dep
// resolves to a data constant, not a callee.
//
// The two vtable addresses (0x865288 and 0x865640) are DATA references,
// not code references, and are outside the scope of this ledger unit —
// they'll be modelled when the vtable-slot resolver (tools/vtable.py)
// binds the virtual methods of OZSceneCamera to concrete symbols. Here
// we record the addresses as documented constants; nothing indirects
// through them in the ctor body.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN13OZSceneCameraC1EP7OZScenej
//       — OZSceneCamera::OZSceneCamera(OZScene*, uint32_t) @Ozone 0x4455b0
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/__ZN13OZSceneCameraC1EP7OZScenej.s)
// -----------------------------------------------------------------------------
//   0x4455b0  pushq  %rbp
//   0x4455b1  movq   %rsp, %rbp
//   0x4455b4  movq   $0x0, 0x38(%rdi)             ; this->fieldAt38 = NULL
//   0x4455bc  leaq   0x41fcc5(%rip), %rax         ; rax = &vtable_OZSceneCamera
//                                                 ;       (0x4455c3+0x41fcc5=0x865288)
//   0x4455c3  movq   %rax, (%rdi)                 ; this->vptr = &vtable
//   0x4455c6  leaq   0x420073(%rip), %rax         ; rax = &vtable_subobject_at_0x30
//                                                 ;       (0x4455cd+0x420073=0x865640)
//   0x4455cd  movq   %rax, 0x30(%rdi)             ; this->vptr2 = &vtable_subobject
//   0x4455d1  movq   %rsi, 0x8(%rdi)              ; this->scene = scene
//   0x4455d5  movl   %edx, 0x10(%rdi)             ; this->index = index
//   0x4455d8  movb   $0x1, 0x14(%rdi)             ; this->activeFlag = 1
//   0x4455dc  popq   %rbp
//   0x4455dd  retq

import type { OZScene } from "./OZScene.js";

// ═════════════════════════════════════════════════════════════════════════
// vtable address constants (DATA references — resolved at load by the
// dynamic linker; nothing in the ctor body dispatches through them, so
// they are documented here only for provenance).
// ═════════════════════════════════════════════════════════════════════════

/** RIP-relative address of the primary OZSceneCamera vtable, computed
 *  from the `leaq 0x41fcc5(%rip),%rax` at Ozone 0x4455bc:
 *  next-insn-rip (0x4455c3) + 0x41fcc5 = 0x865288. Written into
 *  `this->vptr` @0x4455c3. */
const OZ_VTABLE_OZSceneCamera_addr = 0x865288; // @Ozone data 0x865288

/** RIP-relative address of the secondary vtable (multiple-inheritance
 *  base subobject at +0x30), computed from the `leaq 0x420073(%rip),%rax`
 *  at Ozone 0x4455c6: next-insn-rip (0x4455cd) + 0x420073 = 0x865640.
 *  Written into `this->vptr2` @0x4455cd. */
const OZ_VTABLE_OZSceneCamera_sub30_addr = 0x865640; // @Ozone data 0x865640

// ═════════════════════════════════════════════════════════════════════════
// The class
// ═════════════════════════════════════════════════════════════════════════

/**
 * `OZSceneCamera` — Ozone scene-camera object owned by an OZScene. The
 * ctor imprints two vtable pointers, records a pointer to the owning
 * scene, an integer index, and an active-flag, and zeroes one slot. The
 * class has 0x40+ bytes of storage (the ctor writes as far as +0x38);
 * additional fields will surface when other methods are ported.
 */
export class OZSceneCamera {
  /** +0x00 — primary vtable pointer. In this JS port we don't dispatch
   *  through it (JS has no vtable model); the value it would hold is
   *  documented as `OZ_VTABLE_OZSceneCamera_addr`. Kept as an opaque
   *  marker so future vtable-driven code can recognise a
   *  correctly-constructed camera. */
  vptr: number = OZ_VTABLE_OZSceneCamera_addr; // @Ozone C1 stores @0x4455c3

  /** +0x08 — pointer to the owning OZScene (ctor arg 1). */
  scene: OZScene | null = null; // @Ozone C1 stores @0x4455d1

  /** +0x10 — 32-bit camera index within the scene (ctor arg 2). */
  index: number = 0; // @Ozone C1 stores @0x4455d5

  /** +0x14 — 8-bit active flag. Ctor forces to 1; likely toggled to 0
   *  by a subsequent deactivate/disable member. */
  activeFlag: number = 1; // @Ozone C1 stores @0x4455d8

  /** +0x30 — secondary vtable pointer (multiple-inheritance base
   *  subobject at +0x30). Value: OZ_VTABLE_OZSceneCamera_sub30_addr. */
  vptr2: number = OZ_VTABLE_OZSceneCamera_sub30_addr; // @Ozone C1 stores @0x4455cd

  /** +0x38 — pointer-sized field explicitly zero'd by the ctor. Likely
   *  a lazily-populated pointer (owned buffer / child object) that a
   *  later setter assigns. NULL is the ctor's initial value. */
  fieldAt38: unknown = null; // @Ozone C1 stores $0 @0x4455b4

  /**
   * `OZSceneCamera::OZSceneCamera(OZScene*, uint32_t)` — @Ozone 0x4455b0
   * (__ZN13OZSceneCameraC1EP7OZScenej).
   *
   * Faithful line-for-line transcription of the disassembly above. Pure
   * struct-initialiser — no calls out, only stores.
   */
  constructor(scene: OZScene, index: number) {
    // @0x4455b0..0x4455b1 — prologue (no TS-visible effect).
    // @0x4455b4 — this->fieldAt38 = 0
    this.fieldAt38 = null;
    // @0x4455bc..0x4455c3 — this->vptr = &vtable_OZSceneCamera (0x865288)
    this.vptr = OZ_VTABLE_OZSceneCamera_addr;
    // @0x4455c6..0x4455cd — this->vptr2 = &vtable_subobject_at_0x30 (0x865640)
    this.vptr2 = OZ_VTABLE_OZSceneCamera_sub30_addr;
    // @0x4455d1 — this->scene = scene (arg %rsi)
    this.scene = scene;
    // @0x4455d5 — this->index = index (arg %edx; movl → 32-bit only,
    //             so we truncate to uint32 to match the machine).
    this.index = index >>> 0;
    // @0x4455d8 — this->activeFlag = 1
    this.activeFlag = 1;
    // @0x4455dc..0x4455dd — epilogue + retq.
  }
}
