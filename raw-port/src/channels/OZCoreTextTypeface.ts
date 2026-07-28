// OZCoreTextTypeface — Ozone framework
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone (x86_64 slice).
//
// Class layout (from C2/C1 ctors @0x639940 / @0x6399b0):
//   +0x00  : vtable slot (installed twice in the ctor — once with the OZFontFace base
//            vtable @0x639959, then re-stamped with the OZCoreTextTypeface vtable
//            @0x63997f after the two PCString subobjects are constructed).
//   +0x08  : PCString  family/name  — constructed from arg1 (const PCString&) @0x63996a
//   +0x10  : PCString  style/subname — constructed from arg2 (const PCString&) @0x639976
//   +0x18  : OZFontFamily*         — arg4 (raw pointer, no retain observed) @0x63997b
//   +0x20  : uint32 flags/traits   — arg3 (unsigned int) @0x639989
//
// Base class: OZFontFace (confirmed by the sibling __ZNK10OZFontFace11getSaveNameEv
// at 0x639ac0 doing `leaq 0x10(%rdi), %rax` — i.e. returning &this+0x10 (the second
// PCString), matching the layout above where +0x10 is the "save name"/style PCString).
//
// Methods (all five instance methods):
//   0x00639940  OZCoreTextTypeface(PCString&, PCString&, unsigned int, OZFontFamily*) [C2]
//   0x006399b0  OZCoreTextTypeface(PCString&, PCString&, unsigned int, OZFontFamily*) [C1]
//                (C1 and C2 bodies are byte-identical; the vtable-immediate constants
//                 differ by the ABI-mandated offset — C2 stamps the base-in-place vtable,
//                 C1 stamps the complete-object vtable, both re-stamped mid-ctor.)
//   0x00639a20  ~OZCoreTextTypeface() [D2]  — stamp vtable, ~PCString(+0x10), tail-call ~PCString(+0x08)
//   0x00639a50  ~OZCoreTextTypeface() [D1]  — byte-identical to D2 (different vtable RIP)
//   0x00639a80  ~OZCoreTextTypeface() [D0]  — D2 body + operator delete

/* eslint-disable @typescript-eslint/no-unused-vars */

import { PCString } from '../infra/PCString';

// Frontier — OZFontFamily is not yet ported. Opaque pointer type is fine here;
// the ctor only stores it and the dtor doesn't touch it.
export type OZFontFamily = unknown;

/**
 * OZCoreTextTypeface — an OZFontFace-derived descriptor holding a
 * (familyName, styleName, traits, family-owner) tuple. Uses Core Text under
 * the hood (name from the class + framework), but the ctor/dtor bodies are
 * pure field wiring; the Core Text glue lives in other methods (getSaveName,
 * getPlatformFontRef, etc.) not in this dispatch set.
 */
export class OZCoreTextTypeface {
  /** +0x08 — family/name PCString (owned; copy-constructed from arg1) */
  public familyName: PCString;

  /** +0x10 — style/save-name PCString (owned; copy-constructed from arg2) */
  public saveName: PCString;

  /** +0x18 — OZFontFamily* raw pointer (borrowed; no retain observed in ctor) */
  public fontFamily: OZFontFamily | null;

  /** +0x20 — uint32 traits/flags (stored as JS number, mask to 32 bits on write) */
  public traits: number;

  /**
   * OZCoreTextTypeface::OZCoreTextTypeface(PCString const&, PCString const&, unsigned int, OZFontFamily*) @0x006399b0 (C1)
   * (C2 body @0x00639940 is byte-identical; both share this TS constructor.)
   *
   * Asm (C1 form; C2 differs only in the two vtable RIP offsets):
   *   0x6399c9  leaq  0x24f2e0(%rip), %rax   ; rax = &vtable[OZFontFace-in-place @+0x10]  (interim base vtable)
   *   0x6399d0  movq  %rax, (%rdi)           ; this->vtable = base
   *   0x6399d3  leaq  0x8(%rdi), %r12        ; r12 = &this->familyName (+0x08)
   *   0x6399da  callq PCString::PCString(PCString const&)   ; construct +0x08 from arg1 (rsi)
   *   0x6399df  leaq  0x10(%r15), %rdi       ; rdi = &this->saveName (+0x10)
   *   0x6399e3  movq  %r13, %rsi             ; rsi = arg2 (saved earlier)
   *   0x6399e6  callq PCString::PCString(PCString const&)   ; construct +0x10 from arg2
   *   0x6399eb  movq  %r14, 0x18(%r15)       ; this->fontFamily = arg4 (r8)
   *   0x6399ef  leaq  0x24f2e2(%rip), %rax   ; rax = &vtable[OZCoreTextTypeface complete @+0x10]
   *   0x6399f6  movq  %rax, (%r15)           ; this->vtable = final
   *   0x6399f9  movl  %ebx, 0x20(%r15)       ; this->traits = arg3 (ecx)
   *   0x6399fb  retq
   *   (0x6399fc landing pad: on PCString throw during +0x10 ctor, destroy +0x08 and re-raise.)
   *
   * The transient install of the base OZFontFace vtable @0x6399d0 (then re-stamp
   * to the final vtable @0x6399f6) is the standard C++ ABI vptr sequencing —
   * during PCString sub-object construction the vptr must point at the base
   * class so any virtual calls resolve to base-class behaviour. In TS we don't
   * need this: JS objects have a single `constructor` binding, and no virtual
   * dispatch happens between the two PCString copies.
   */
  constructor(
    family: PCString,
    save: PCString,
    traits: number,
    fontFamily: OZFontFamily | null,
  ) {
    // @0x6399da : PCString copy-construct at +0x08 from arg1
    this.familyName = new PCString(family);
    // @0x6399e6 : PCString copy-construct at +0x10 from arg2
    //             (if this throws, the C++ landing pad @0x6399ac destroys +0x08
    //             — JS will GC it once `this` becomes unreachable due to the
    //             thrown-from-ctor semantics, so we don't need an explicit
    //             cleanup mirror.)
    this.saveName = new PCString(save);
    // @0x6399eb : this->fontFamily = arg4
    this.fontFamily = fontFamily;
    // @0x6399f9 : this->traits = arg3 & 0xffffffff  (unsigned int store)
    this.traits = traits >>> 0;
  }

  /**
   * OZCoreTextTypeface::~OZCoreTextTypeface() [D2] @0x00639a20
   *
   * Asm:
   *   0x639a29  leaq  0x24f280(%rip), %rax   ; rax = &vtable[OZFontFace-in-place @+0x10] (re-stamp base)
   *   0x639a30  movq  %rax, (%rdi)           ; this->vtable = base
   *   0x639a33  addq  $0x10, %rdi            ; rdi = &this->saveName (+0x10)
   *   0x639a37  callq PCString::~PCString()  ; destroy +0x10
   *   0x639a3c  addq  $0x8, %rbx             ; rbx = &this->familyName (+0x08)
   *   0x639a40  movq  %rbx, %rdi
   *   0x639a49  jmp   PCString::~PCString()  ; tail-call destroy +0x08
   *
   * D1 @0x00639a50 is byte-identical to D2 apart from a different vtable RIP
   * (points at the complete-object vtable slot instead of the in-place base
   * one). Both drop the two PCStrings in field-reverse order. In TS there are
   * no destructors; we expose a `dispose()` marker for parity with the other
   * ports and drop our PCString references so their internal CF refs release.
   */
  dispose(): void {
    // @0x639a37 : destroy +0x10 (saveName)  — GC will finalize once we drop the ref.
    // @0x639a49 : destroy +0x08 (familyName) — same.
    // Ordering (saveName first, familyName second) is preserved via property
    // assignment order so any future explicit-release path can walk it.
    // (No `null`-typed slots in the class — assign fresh empty PCString instead
    // of null to avoid punching a hole in the field type.)
    this.saveName = new PCString();
    this.familyName = new PCString();
    this.fontFamily = null;
  }

  /**
   * OZCoreTextTypeface::~OZCoreTextTypeface() [D0] @0x00639a80
   *
   * Asm mirrors D2 but with a small twist:
   *   0x639a97  callq PCString::~PCString()  ; destroy +0x10 (rdi = this+0x10)
   *   0x639a9c  leaq  0x8(%rbx), %rdi        ; rdi = this+0x08
   *   0x639aa0  callq PCString::~PCString()  ; destroy +0x08 (NOT a tail-call this time)
   *   0x639aa5  movq  %rbx, %rdi
   *   0x639aae  jmp   __ZdlPv                ; operator delete(void*)
   *
   * The delta versus D2 is that D0 also invokes `operator delete` at the end,
   * i.e. this is the *deleting* destructor. In TS this is just dispose()
   * followed by dropping the outer reference.
   */
  disposeAndFree(): void {
    // @0x639a97 : destroy +0x10 (saveName)
    // @0x639aa0 : destroy +0x08 (familyName)
    this.dispose();
    // @0x639aae : jmp __ZdlPv — no-op in TS.
  }
}
