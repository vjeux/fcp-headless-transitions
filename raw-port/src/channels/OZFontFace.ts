// OZFontFace.ts — FCP Ozone.framework OZFontFace.
//
// FRAMEWORK: Ozone.framework (Final Cut Pro).
// DECODE: raw-port/re/disasm/OZFontFace.*.s
//         (mangled symbols __ZN10OZFontFace* / __ZNK10OZFontFace* starting at
//          file offset 0x4000+0x6397e0 in the x86_64 slice).
//
// STRUCT LAYOUT (recovered from the C1 ctor @0x639840 and D0 @0x639900):
//   sizeof = 0x20 (32 bytes) minimum — the D0 tail-jmp __ZdlPv shows the object was
//   heap-allocated and released as a single 32-byte block covering the four fields below.
//     +0x00  vtable  (installed by ctor @0x639854-0x63985b:
//                     `leaq 0x24f455(%rip),%rax ; movq %rax,(%rdi)`. D0 rewrites the same
//                     vtable at @0x639909-0x639910 via a smaller RIP delta, referring to
//                     the same vtable-object base (Ozone __DATA_CONST).)
//     +0x08  PCString `name`      (member-copy constructed from ctor arg2 @0x639865)
//     +0x10  PCString `saveName`  (member-copy constructed from ctor arg3 @0x639871)
//     +0x18  OZFontFamily*        (raw non-owning pointer stored from ctor arg4 @0x639876)
//
// EXPORTED SYMBOLS:
//   @Ozone 0x00000000006397e0  ctor C2  (PCString const&, PCString const&, OZFontFamily*)
//   @Ozone 0x0000000000639840  ctor C1  (identical body; see disasm — both routes hit
//                                        the same 0x24f455-relative vtable and the same
//                                        two PCString copy-ctors.)
//   @Ozone 0x00000000006398a0  D2  (in-place dtor)
//   @Ozone 0x00000000006398d0  D1  (in-place dtor — identical body to D2)
//   @Ozone 0x0000000000639900  D0  (deleting dtor — D2 body + tail-jmp __ZdlPv)
//   @Ozone 0x0000000000639ac0  getSaveName() const  — returns &this->saveName (i.e. &+0x10)
//
// FRONTIER (deferred — cited as throwing/opaque where they land):
//   • OZFontFamily — undecoded frontier class. Only stored as an opaque raw pointer.
//   • __ZdlPv (operator delete) — libc frontier called via tail-jmp from D0 @0x63992e.
//   • __Unwind_Resume — libunwind frontier hit only on the ctor's exception path
//     @0x639891 (invoked when the second PCString copy-ctor throws, after PCString D1 is
//     called on the already-constructed `name` field @0x639889 to unwind partial state).

import { PCString } from "../infra/PCString";

/**
 * OZFontFamily — undecoded frontier. OZFontFace stores it as a non-owning raw pointer at
 * +0x18 with no virtual dispatch and no retain/release; the field is set once by the ctor
 * @0x639876 and read/written nowhere else in the OZFontFace body.
 */
export interface OZFontFamily {
  readonly __brand_OZFontFamily: unique symbol;
}

/**
 * OZFontFace — a single font-face entry in an OZFontFamily. Two PCStrings (a display `name`
 * and a persistent `saveName`) plus a back-pointer to the owning family.
 */
export class OZFontFace {
  /** +0x00 — vtable pointer @Ozone `0x24f455(%rip)` from @0x639854 — modelled as a class tag. */
  readonly __vtable = "OZFontFace::vtable @Ozone 0x24f455(rip from 0x639854)";

  /** +0x08 — PCString `name` (constructed from ctor arg2 via PCString copy-ctor @0x639865). */
  readonly name: PCString;

  /** +0x10 — PCString `saveName` (constructed from ctor arg3 via PCString copy-ctor @0x639871). */
  readonly saveName: PCString;

  /**
   * +0x18 — non-owning back-pointer to the OZFontFamily that owns this face.
   * Stored as-is @0x639876 from ctor arg4 (rcx → rbx → this[+0x18]). May be null in the C++
   * ABI (nothing dereferences it in OZFontFace's own methods).
   */
  readonly family: OZFontFamily | null;

  /**
   * ctor(PCString const& name, PCString const& saveName, OZFontFamily* family)
   * @Ozone 0x0000000000639840  (C1;  __ZN10OZFontFaceC1ERK8PCStringS2_P12OZFontFamily)
   * @Ozone 0x00000000006397e0  (C2;  __ZN10OZFontFaceC2ERK8PCStringS2_P12OZFontFamily — identical
   *                             body; brief.py reports the same address twice because the C2
   *                             base ctor here has the same shape as C1 — no virtual-base fixup.)
   *
   * DECODE (raw-port/re/disasm/OZFontFace.OZFontFace.s @0x639840-0x639882):
   *   0x63984b-0x639851  rbx=family (rcx), r12=&saveName (rdx), r15=this (rdi)
   *   0x639854  leaq 0x24f455(%rip), %rax
   *   0x63985b  movq %rax, (%rdi)                 ; this->vtable = OZFontFace::vtable
   *   0x63985e-0x639865  r14 = this+0x8 ; PCString::PCString(r14, &arg2/name)
   *   0x63986a-0x639871  rdi = this+0x10 ; PCString::PCString(this+0x10, &arg3/saveName)
   *   0x639876  movq %rbx, 0x18(%r15)             ; this->family = family
   *   0x639882  retq
   *
   * Exception unwind @0x639883-0x639891: if the second PCString copy-ctor throws, the
   * personality routine lands here; rax holds the exception object, rbx saves it, then
   * PCString::~PCString is called on `this+0x8` (name) to undo the first copy and
   * __Unwind_Resume rethrows. TS/JS doesn't need this path — a thrown PCString ctor
   * simply propagates.
   */
  constructor(name: PCString, saveName: PCString, family: OZFontFamily | null) {
    // @0x63985e-0x639865 — PCString::PCString(this->name, name) [copy-ctor]
    this.name = new PCString(name);
    // @0x63986a-0x639871 — PCString::PCString(this->saveName, saveName) [copy-ctor]
    this.saveName = new PCString(saveName);
    // @0x639876 — this->family = family
    this.family = family;
  }

  /**
   * getSaveName() const  →  PCString const*
   * @Ozone 0x0000000000639ac0  (__ZNK10OZFontFace11getSaveNameEv)
   *
   * DECODE (raw-port/re/disasm/OZFontFace.getSaveName.s @0x639ac0-0x639ac9):
   *   0x639ac4  leaq 0x10(%rdi), %rax   ; rax = &this[+0x10] = &this->saveName
   *   0x639ac9  retq
   *
   * Returns a pointer to the in-place saveName sub-object. The TS port returns the
   * PCString reference directly (JS objects are always by-reference).
   */
  getSaveName(): PCString { // @Ozone 0x639ac0
    return this.saveName;   // @Ozone 0x639ac4
  }

  /**
   * ~OZFontFace()  — the D2 (in-place) destructor.
   * @Ozone 0x00000000006398a0  (__ZN10OZFontFaceD2Ev)
   * @Ozone 0x00000000006398d0  (__ZN10OZFontFaceD1Ev — identical body)
   *
   * DECODE (@0x6398a0-0x6398c9):
   *   0x6398a9  leaq 0x24f400(%rip), %rax
   *   0x6398b0  movq %rax, (%rdi)                 ; re-install base vtable (partial-destruct
   *                                                 barrier for virtual-dispatch during dtor)
   *   0x6398b3  addq $0x10, %rdi
   *   0x6398b7  callq __ZN8PCStringD1Ev            ; ~PCString on this->saveName
   *   0x6398bc  addq $0x8, %rbx                   ; rbx = this+0x8 (now pointer to `name`)
   *   0x6398c0-0x6398c9  tail-jmp __ZN8PCStringD1Ev ; ~PCString on this->name
   *
   * The FCP body deliberately destroys saveName BEFORE name (reverse of construction order).
   * In JS with GC this is a no-op; we keep the method for signature parity.
   */
  destruct_D2(): void {
    // no-op @0x6398a0 — GC releases both PCStrings and the family back-pointer.
  }

  /**
   * ~OZFontFace()  — the D0 (deleting) destructor.
   * @Ozone 0x0000000000639900  (__ZN10OZFontFaceD0Ev)
   *
   * DECODE (raw-port/re/disasm/OZFontFace.~OZFontFace.s @0x639900-0x63992e):
   *   0x639909-0x639910   re-install base vtable  (same @0x24f3a0 as D1/D2, plus offset delta)
   *   0x639917            call __ZN8PCStringD1Ev  ; ~PCString(this->saveName)   [this+0x10]
   *   0x63991c-0x639920   call __ZN8PCStringD1Ev  ; ~PCString(this->name)       [this+0x08]
   *   0x63992e            jmp  __ZdlPv            ; tail-call operator delete(this)
   *
   * In TS with GC this is a no-op.
   */
  destruct_D0(): void {
    // Tail-call operator delete @0x63992e  → no-op in JS under GC.
  }
}

/**
 * Vtable-slot layout (recovered from ctor's `leaq 0x24f455(%rip)` @0x639854 pointing at
 * the class's vtable in Ozone __DATA_CONST). The D2/D1 dtors re-install a slightly earlier
 * offset (`0x24f400(%rip)` from @0x6398a9 → same vtable object with a small delta —
 * consistent with the Itanium ABI's "vtable+0x10" convention where the +0x10 offset points
 * past the type-info slot to the first virtual-function slot).
 *
 * The class overrides at least: ~D0/~D1 (and the compiler-synthesised D2). No other
 * virtual functions appear in the extracted method set — getSaveName is not virtual.
 */
export const OZFontFace_vtable_addr = "@Ozone 0x24f455(rip from 0x639854)" as const;
