// OZSceneCamera — Ozone per-scene camera object. Methods ported here so far:
// the C1 ctor @Ozone 0x4455b0, getNodeID() @0x444390 and setTime(CMTime)
// @0x4455f0 (raw-port/re/disasm/__ZN13OZSceneCamera7setTimeE6CMTime.s); other
// methods (D1/D0, virtuals, etc.) are separate ledger entries and will be added
// to this file when their own units are claimed.
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
import type { CMTime } from "../infra/CMTime.js";

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
   * +0x18..+0x2f — an embedded 24-byte `CMTime`, written whole by
   * `setTime(CMTime)` @Ozone 0x4455f0:
   *
   *   +0x18  int64  value      \ the 16 bytes copied by the
   *   +0x20  int32  timescale  / `movaps 0x10(%rbp),%xmm0` @0x4455fc ->
   *   +0x24  uint32 flags      \ `movups %xmm0, 0x18(%rdi)` @0x445600 pair
   *   +0x28  int64  epoch      -- the third eightbyte, moved separately by
   *                               `movq 0x20(%rbp),%rax` @0x4455f4 ->
   *                               `movq %rax, 0x28(%rdi)` @0x4455f8
   *
   * That 16 + 8 split is exactly CMTime's SysV MEMORY-class layout (a 24-byte
   * struct: value/timescale/flags/epoch), which is what identifies the field
   * as a CMTime rather than three unrelated slots. The C1 ctor @0x4455b0 does
   * NOT initialise it (it writes +0x00/+0x08/+0x10/+0x14/+0x30/+0x38 only), so
   * a freshly constructed camera holds whatever the allocation left here; the
   * port starts it at CMTime zero-bits — value 0, timescale 0, flags 0,
   * epoch 0 — i.e. an INVALID CMTime (kCMTimeFlags_Valid clear), which is the
   * honest model of "never set" and is distinct from `kCMTimeZero`
   * (timescale 1, Valid).
   */
  timeAt18: CMTime = { value: 0n, timescale: 0, flags: 0, epoch: 0n };

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

  /**
   * `OZSceneCamera::setNodeID(uint32_t)` — @Ozone 0x445a90
   *   __ZN13OZSceneCamera9setNodeIDEj
   *
   * Faithful line-for-line transcription (7-instruction body, no calls):
   *
   *   0x445a90  pushq %rbp                    ; prologue
   *   0x445a91  movq  %rsp, %rbp
   *   0x445a94  movl  %esi, 0x10(%rdi)        ; this->(field@+0x10) = arg (u32)
   *   0x445a97  popq  %rbp                    ; epilogue
   *   0x445a98  retq
   *   0x445a99  nopl  (%rax)                  ; alignment
   *
   * The write is a 32-bit `movl` to offset 0x10 — the SAME field the C1
   * ctor at @0x4455d5 initialises from its second arg (documented above
   * as `+0x10 index`). "NodeID" is the setter's public name; internally
   * the field is the 32-bit camera index. Pure struct assignment; no
   * externs, no callees.
   */
  setNodeID(id: number): void {
    // @0x445a94  movl %esi,0x10(%rdi)  — u32 truncation matches `movl`.
    this.index = id >>> 0;
  }

  /**
   * `OZSceneCamera::getNodeID() const` — @Ozone 0x444390
   *   __ZNK13OZSceneCamera9getNodeIDEv
   *
   * Faithful line-for-line transcription (7-instruction body, no calls):
   *
   *   0x444390  pushq %rbp                    ; prologue
   *   0x444391  movq  %rsp, %rbp
   *   0x444394  movl  0x10(%rdi), %eax        ; eax = this->(field@+0x10)
   *   0x444397  popq  %rbp                    ; epilogue
   *   0x444398  retq                           ; return eax (u32)
   *   0x444399  nopl  (%rax)                  ; alignment
   *
   * Pure 32-bit read of the SAME field written by `setNodeID` at +0x10 and
   * initialised by the C1 ctor from `arg2` @0x4455d5. `movl` yields a 32-bit
   * value zero-extended into %rax for the return — we `>>> 0` the result to
   * match the u32 truncation the machine performs.
   *
   * The `K` (const) in the mangled `__ZNK...` confirms this is a const
   * accessor: no writes, no state change, no externs, no callees.
   */
  getNodeID(): number {
    // @0x444394  movl 0x10(%rdi), %eax  — u32 zero-extended into return reg.
    return this.index >>> 0;
  }

  /**
   * `OZSceneCamera::setTime(CMTime)` — @Ozone 0x4455f0
   * (__ZN13OZSceneCamera7setTimeE6CMTime).
   *
   * Full transcription — every instruction, in order
   * (raw-port/re/disasm/__ZN13OZSceneCamera7setTimeE6CMTime.s):
   *
   *   0x4455f0  pushq  %rbp                   ; frame setup (no TS counterpart)
   *   0x4455f1  movq   %rsp, %rbp             ; frame setup (no TS counterpart)
   *   0x4455f4  movq   0x20(%rbp), %rax       ; rax = arg.epoch   (3rd eightbyte)
   *   0x4455f8  movq   %rax, 0x28(%rdi)       ; this->time.epoch = arg.epoch
   *   0x4455fc  movaps 0x10(%rbp), %xmm0      ; xmm0 = arg.value|timescale|flags
   *   0x445600  movups %xmm0, 0x18(%rdi)      ; this->time.{value,timescale,flags} = ...
   *   0x445604  popq   %rbp                   ; frame teardown (no TS counterpart)
   *   0x445605  retq                          ; void return
   *   0x445606  nopw   %cs:(%rax,%rax)        ; alignment padding, not executed
   *
   * The `CMTime` argument is 24 bytes, so SysV classifies it MEMORY and passes
   * it ON THE STACK, not in registers: `0x10(%rbp)` is the first eightbyte of
   * the argument (the frame stores `%rbp` at 0x00 and the return address at
   * 0x08), and `0x20(%rbp)` is its third. That is why the copy is split into a
   * 16-byte SSE move plus one 8-byte GPR move — a single memcpy of the whole
   * struct, not three field-by-field assignments with semantics of their own.
   *
   * Note the machine copies the trailing epoch FIRST (@0x4455f4/@0x4455f8) and
   * the leading 16 bytes second (@0x4455fc/@0x445600); the order is
   * unobservable here (disjoint destination slots, no aliasing possible with a
   * by-value stack argument) but is transcribed in that order anyway.
   *
   * The load is `movaps` — the ALIGNED form — which tells us the caller's
   * 24-byte argument slot is 16-byte aligned, and the store is `movups`
   * because `this+0x18` need not be. No conversion, no validation of the
   * flags, no timescale normalisation: a verbatim struct copy.
   *
   * ZERO in-scope callees, ZERO externs, no indirect/virtual dispatch.
   *
   * @param time the by-value `CMTime` argument (stack slots `0x10(%rbp)` and
   *             `0x20(%rbp)`).
   */
  setTime(time: CMTime): void {
    // @0x4455f4/@0x4455f8 — movq 0x20(%rbp),%rax ; movq %rax,0x28(%rdi)
    this.timeAt18.epoch = time.epoch;
    // @0x4455fc/@0x445600 — movaps 0x10(%rbp),%xmm0 ; movups %xmm0,0x18(%rdi)
    //   one 16-byte move of value (+0x18) plus timescale (+0x20) and
    //   flags (+0x24).
    this.timeAt18.value = time.value;
    this.timeAt18.timescale = time.timescale | 0;
    this.timeAt18.flags = time.flags >>> 0;
  }
}
