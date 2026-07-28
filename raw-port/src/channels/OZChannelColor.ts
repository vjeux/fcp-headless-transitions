// OZChannelColor — Ozone framework. A compound color channel (RGBA-shape,
// derived from OZCompoundChannel via OZChannelColorNoAlpha). It groups
// FOUR sub-channels (R, G, B, A) plus an enum sub-channel used for the
// color-model / interpolation-mode selector.
//
// FRAMEWORK: Ozone.framework
//   (/Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework
//    /Versions/A/Ozone). The x86_64 slice is a fat sub-arch; all VAs
//    below are unadjusted VM addresses from `otool -tV` (i.e. within
//    the slice, not fat file offsets).
//
// LEDGER SCOPE: this class exposes ONE public method in the Ozone
// image (the D1 destructor at 0x000ca7b0). The C1/C2 constructors, D0
// deleting destructor, and every polymorphic method are all imported
// via __stubs from ProChannel, so they don't appear in Ozone's own
// ledger. Faithful transcription here therefore covers only the D1
// dtor body; the frontier callees are surfaced as throwing stubs.
//
// STRUCT LAYOUT — recovered from D1 disassembly
// (raw-port/re/disasm/OZChannelColor.~OZChannelColor.s, 34 lines):
//
//   +0x000  vtable[0]  primary vptr    (installed at D1 entry: address
//                                       of `__ZTV14OZChannelColor + 0x10`,
//                                       loaded via `movq 0x7580f0(%rip),%rax`
//                                       @0x000ca7b9, then written to
//                                       *(rdi+0x00) @0x000ca7c4).
//   +0x010  vtable[1]  secondary vptr  (installed = &__ZTV14OZChannelColor + 0x370,
//                                       loaded via `addq $0x370,%rax`
//                                       @0x000ca7c7, then written to
//                                       *(rdi+0x10) @0x000ca7cd).
//   +0x088  OZChannel   R sub-channel  (dtor'd @0x000ca825-0x000ca82c
//                                       via `leaq 0x88(%rbx),%rdi;
//                                       callq OZChannel::D2`).
//   +0x120  OZChannel   G sub-channel  (dtor'd @0x000ca819-0x000ca820
//                                       via `leaq 0x120(%rbx),%rdi;
//                                       callq OZChannel::D2`).
//   +0x1b8  OZChannel   B sub-channel  (dtor'd @0x000ca80d-0x000ca814
//                                       via `leaq 0x1b8(%rbx),%rdi;
//                                       callq OZChannel::D2`).
//   +0x250  OZChannel   A sub-channel  (dtor'd @0x000ca801-0x000ca808
//                                       via `leaq 0x250(%rbx),%rdi;
//                                       callq OZChannel::D2`).
//   +0x2e8  OZChannelEnum
//                       color-model    (dtor'd @0x000ca7f5-0x000ca7fc via
//                                       `leaq 0x2e8(%rbx),%rdi;
//                                       callq OZChannelEnum::D1`).
//   +0x3f0  OZChannel   base subobject
//                       (from
//                        OZChannelColorNoAlpha)
//                                      (dtor'd @0x000ca7d1-0x000ca7d8
//                                       via `addq $0x3f0,%rdi;
//                                       callq OZChannel::D2` — this is
//                                       the OZChannelColorNoAlpha base's
//                                       own OZChannel-subobject, torn
//                                       down BEFORE the OZChannelColor
//                                       R/G/B/A/enum members).
//
// The OZCompoundChannel base subobject starts at offset 0 (proven by
// the tail-jmp to OZCompoundChannel::~OZCompoundChannel with %rdi
// unchanged @0x000ca83a). Its size is exactly 0x88 bytes, because that
// is where the first named member (R sub-channel) begins.
//
// VTABLES — two class-vtable pointers are re-installed twice inside
// D1: once at entry (OZChannelColor's own vtable) and once mid-body
// (OZChannelColorNoAlpha's vtable) as we peel back to the base's
// virtual-destruction phase. Both installs use the same +0x10 primary
// / +0x370 secondary offsets — this is a classical Itanium C++ ABI
// vtable-thunk-table pair pattern. See the comments on each `movq`
// below.
//
// DESTRUCTION ORDER (proven by the asm's callq sequence):
//   1. Install &__ZTV14OZChannelColor vtable pointers.
//   2. Tear down base OZChannel subobject inherited via
//      OZChannelColorNoAlpha (at this+0x3f0) — external OZChannel::D2.
//   3. Re-install vtable pointers to &__ZTV21OZChannelColorNoAlpha
//      (peel one layer up in the vtable chain).
//   4. Tear down the enum sub-channel @+0x2e8 (OZChannelEnum::D1).
//   5. Tear down the A sub-channel @+0x250 (OZChannel::D2).
//   6. Tear down the B sub-channel @+0x1b8 (OZChannel::D2).
//   7. Tear down the G sub-channel @+0x120 (OZChannel::D2).
//   8. Tear down the R sub-channel @+0x088 (OZChannel::D2).
//   9. Tail-jmp OZCompoundChannel::~OZCompoundChannel(this) — the
//      base compound-channel dtor takes over.
//
// The OZChannelColorNoAlpha vtable re-install BEFORE tearing down the
// enum/A/B/G/R members is C++'s standard "virtual-dispatch during a
// dtor sees your base's vtable, not your derived's" rule: while we're
// inside OZChannelColorNoAlpha's phase, any virtual call must resolve
// to OZChannelColorNoAlpha's vtable (which sits between OZChannelColor
// and OZCompoundChannel in the inheritance chain).
//
// FRONTIER CALLEES — each throwing stub cites the exact call site
// address and mangled symbol. Every callee is `U` (undefined-import)
// in Ozone; the real body lives in ProChannel.framework.

import type { OZChannel } from "./OZChannel";
import type { OZCompoundChannel } from "./OZCompoundChannel";

// ─────────────────────────────────────────────────────────────────────────
// Frontier callees. Each throws with its call site cited by @0xADDR.
// ─────────────────────────────────────────────────────────────────────────

/**
 * `OZChannel::~OZChannel()` [D2]  @Ozone U-extern
 * `__ZN9OZChannelD2Ev` — the base OZChannel destructor. Called FIVE
 * times inside OZChannelColor::~OZChannelColor():
 *
 *   • @Ozone 0x000ca7d8 — tearing down the OZChannelColorNoAlpha
 *     base's own OZChannel sub-subobject at this+0x3f0.
 *   • @Ozone 0x000ca808 — tearing down the A sub-channel @+0x250.
 *   • @Ozone 0x000ca814 — tearing down the B sub-channel @+0x1b8.
 *   • @Ozone 0x000ca820 — tearing down the G sub-channel @+0x120.
 *   • @Ozone 0x000ca82c — tearing down the R sub-channel @+0x088.
 *
 * The stub in Ozone at 0x6df480 is `__stubs` -> ProChannel
 * `__ZN9OZChannelD2Ev`, which is not yet transcribed on this side
 * (OZChannel.ts covers ctors + copy-ctor only).
 */
function OZChannel__D2(_self: OZChannel): void {
  throw new Error(
    "OZChannel::~OZChannel() [D2] @Ozone U-extern __ZN9OZChannelD2Ev " +
      "(stub @0x6df480, not yet transcribed) — invoked by " +
      "OZChannelColor::~OZChannelColor() D1 @0x000ca7d8 (base+0x3f0), " +
      "@0x000ca808 (A+0x250), @0x000ca814 (B+0x1b8), " +
      "@0x000ca820 (G+0x120), @0x000ca82c (R+0x088)",
  );
}

/**
 * `OZChannelEnum::~OZChannelEnum()` [D1]  @Ozone U-extern
 * `__ZN13OZChannelEnumD1Ev` — the enum-channel destructor. Called
 * ONCE inside OZChannelColor::~OZChannelColor() @Ozone 0x000ca7fc,
 * tearing down the color-model enum sub-channel at this+0x2e8.
 *
 * The stub in Ozone at 0x6dd9d4 is `__stubs` -> ProChannel
 * `__ZN13OZChannelEnumD1Ev`, not yet transcribed.
 */
function OZChannelEnum__D1(_self: OZChannel): void {
  throw new Error(
    "OZChannelEnum::~OZChannelEnum() [D1] @Ozone U-extern " +
      "__ZN13OZChannelEnumD1Ev (stub @0x6dd9d4, not yet transcribed) " +
      "— invoked by OZChannelColor::~OZChannelColor() D1 @0x000ca7fc " +
      "(color-model enum @+0x2e8)",
  );
}

/**
 * `OZCompoundChannel::~OZCompoundChannel()` [D2]  @Ozone U-extern
 * `__ZN17OZCompoundChannelD2Ev` — the OZCompoundChannel base
 * destructor. Called via TAIL-JMP (not callq) inside
 * OZChannelColor::~OZChannelColor() @Ozone 0x000ca83a, after the
 * frame teardown (@0x000ca834-0x000ca839) with %rdi unchanged
 * (= this) — the classic "base dtor takes over" pattern.
 *
 * The stub in Ozone at 0x6de2b6 is `__stubs` -> ProChannel
 * `__ZN17OZCompoundChannelD2Ev`, not yet transcribed. The
 * OZCompoundChannel Ozone override file (raw-port/src/channels/
 * OZCompoundChannel.ts) transcribes ONLY the three isCompoundChannel
 * / setKeypointInterpolation / setCurveInterpolation Ozone overrides
 * — the D2 body itself lives in ProChannel.
 */
function OZCompoundChannel__D2(_self: OZCompoundChannel): void {
  throw new Error(
    "OZCompoundChannel::~OZCompoundChannel() [D2] @Ozone U-extern " +
      "__ZN17OZCompoundChannelD2Ev (stub @0x6de2b6, not yet transcribed) " +
      "— invoked by OZChannelColor::~OZChannelColor() D1 tail-jmp @0x000ca83a",
  );
}

// ─────────────────────────────────────────────────────────────────────────
// The class itself.
// ─────────────────────────────────────────────────────────────────────────

/**
 * `OZChannelColor` — a compound RGBA color channel, extends
 * OZChannelColorNoAlpha (which extends OZCompoundChannel).
 *
 * Layout — verified from the D1 dtor:
 *   +0x000   primary vptr (implicit in JS prototype chain)
 *   +0x010   secondary vptr (implicit)
 *   +0x088   OZChannel R sub-channel
 *   +0x120   OZChannel G sub-channel
 *   +0x1b8   OZChannel B sub-channel
 *   +0x250   OZChannel A sub-channel
 *   +0x2e8   OZChannelEnum color-model / interp-mode sub-channel
 *   +0x3f0   OZChannel base subobject from OZChannelColorNoAlpha
 *   +0x000..+0x087   OZCompoundChannel base subobject
 *   (sizeof cannot be recovered from the D1 body alone — the last
 *    accessed offset is +0x3f0, so sizeof(OZChannelColor) >= 0x3f0 +
 *    sizeof(OZChannel). The exact total is DEFERRED to ctor decode.)
 *
 * NB: We do NOT `extends OZChannelColorNoAlpha` here — that class is
 * frontier (not yet ported; its own dtor lives in ProChannel). We
 * mirror the OZChannelScale pattern (see OZChannelScale.ts) and let
 * the destructor invoke the frontier stubs explicitly. When
 * OZChannelColorNoAlpha lands, this class can flip to
 * `extends OZChannelColorNoAlpha` in a one-line diff.
 */
export class OZChannelColor {
  // Primary and secondary vptrs are implicit in the JS prototype
  // chain. Their asm-level install sites are described in the class
  // header comment and echoed inside destruct_D1 below.

  // ─────────────────────────────────────────────────────────────────
  // Sub-channel accessors — placeholder shape. The actual OZChannel /
  // OZChannelEnum objects live inline inside the OZChannelColor
  // memory (not as pointers). Their construction lives in the
  // ProChannel C1/C2 ctors (frontier). Once the ctors land, these
  // accessors can be replaced with real inline sub-object fields.
  // ─────────────────────────────────────────────────────────────────

  /** R sub-channel @+0x088 — see class-header struct layout. */
  rSubChannel(): OZChannel {
    throw new Error(
      "OZChannelColor.rSubChannel() @+0x088 — OZChannel R sub-channel " +
        "accessor (not yet transcribed; construction lives in ProChannel " +
        "OZChannelColor C1/C2 ctors). Referenced by " +
        "OZChannelColor::~OZChannelColor() D1 @Ozone 0x000ca825.",
    );
  }

  /** G sub-channel @+0x120 — see class-header struct layout. */
  gSubChannel(): OZChannel {
    throw new Error(
      "OZChannelColor.gSubChannel() @+0x120 — OZChannel G sub-channel " +
        "accessor (not yet transcribed). Referenced by " +
        "OZChannelColor::~OZChannelColor() D1 @Ozone 0x000ca819.",
    );
  }

  /** B sub-channel @+0x1b8 — see class-header struct layout. */
  bSubChannel(): OZChannel {
    throw new Error(
      "OZChannelColor.bSubChannel() @+0x1b8 — OZChannel B sub-channel " +
        "accessor (not yet transcribed). Referenced by " +
        "OZChannelColor::~OZChannelColor() D1 @Ozone 0x000ca80d.",
    );
  }

  /** A sub-channel @+0x250 — see class-header struct layout. */
  aSubChannel(): OZChannel {
    throw new Error(
      "OZChannelColor.aSubChannel() @+0x250 — OZChannel A sub-channel " +
        "accessor (not yet transcribed). Referenced by " +
        "OZChannelColor::~OZChannelColor() D1 @Ozone 0x000ca801.",
    );
  }

  /** color-model enum sub-channel @+0x2e8 — see class-header struct layout. */
  colorModelSubChannel(): OZChannel {
    throw new Error(
      "OZChannelColor.colorModelSubChannel() @+0x2e8 — OZChannelEnum " +
        "color-model sub-channel accessor (not yet transcribed). " +
        "Referenced by OZChannelColor::~OZChannelColor() D1 @Ozone 0x000ca7f5.",
    );
  }

  /**
   * OZChannelColorNoAlpha base's OZChannel sub-subobject @+0x3f0 —
   * the R-only OZChannel that OZChannelColorNoAlpha owns before
   * OZChannelColor adds the G/B/A/enum quartet. Torn down FIRST in
   * D1 (@Ozone 0x000ca7d1-0x000ca7d8) because C++ destruction unwinds
   * derived members first, then base subobjects.
   */
  baseOZChannel(): OZChannel {
    throw new Error(
      "OZChannelColor.baseOZChannel() @+0x3f0 — OZChannel base " +
        "subobject inherited via OZChannelColorNoAlpha (not yet " +
        "transcribed). Referenced by OZChannelColor::~OZChannelColor() " +
        "D1 @Ozone 0x000ca7d1.",
    );
  }

  /**
   * `OZChannelColor::~OZChannelColor()` [D1]  @Ozone 0x000ca7b0 —
   * the D1 (complete-object non-deleting) destructor.
   *
   * Faithful transcription of the 34-line disasm:
   *
   *   1. Frame prologue @0x000ca7b0-0x000ca7b5:
   *        pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax
   *        (rax push is 16-byte stack alignment; rbx will hold `this`)
   *   2. Spill this @0x000ca7b6:
   *        movq %rdi, %rbx        ; rbx = this
   *   3. FIRST vtable install (OZChannelColor own) @0x000ca7b9-0x000ca7cd:
   *        movq 0x7580f0(%rip), %rax    ; rax = &__ZTV14OZChannelColor
   *                                      ;      (literal pool entry)
   *        leaq 0x10(%rax), %rcx        ; rcx = vtable + 0x10 (primary
   *                                      ;      slot)
   *        movq %rcx, (%rdi)            ; *(this + 0x00) = primary vptr
   *        addq $0x370, %rax            ; rax = vtable + 0x370 (secondary)
   *        movq %rax, 0x10(%rdi)        ; *(this + 0x10) = secondary vptr
   *      Rationale: the C++ ABI requires that inside a dtor, virtual
   *      calls see THIS class's vtable (not the caller's), so we
   *      re-install our own vtable at entry.
   *   4. Tear down base OZChannel sub-subobject inherited via
   *      OZChannelColorNoAlpha @0x000ca7d1-0x000ca7d8:
   *        addq $0x3f0, %rdi            ; rdi = this + 0x3f0
   *        callq __ZN9OZChannelD2Ev     ; OZChannel::~OZChannel()
   *      (This is the OZChannel that OZChannelColorNoAlpha carries as
   *       its own inline sub-object BEFORE OZChannelColor adds the
   *       four R/G/B/A slots. It gets destroyed first among the
   *       OZChannelColorNoAlpha-phase teardown.)
   *   5. SECOND vtable install (OZChannelColorNoAlpha own)
   *      @0x000ca7dd-0x000ca7f1:
   *        movq 0x75810c(%rip), %rax    ; rax = &__ZTV21OZChannelColorNoAlpha
   *        leaq 0x10(%rax), %rcx        ; rcx = vtable + 0x10
   *        movq %rcx, (%rbx)            ; *(this + 0x00) = primary vptr
   *                                      ;                  (NoAlpha)
   *        addq $0x370, %rax            ; rax = vtable + 0x370
   *        movq %rax, 0x10(%rbx)        ; *(this + 0x10) = secondary
   *                                      ;                  (NoAlpha)
   *      Rationale: we've finished OZChannelColor's phase and are
   *      about to run OZChannelColorNoAlpha's phase. Any virtual call
   *      inside the members-still-to-destroy must resolve on
   *      OZChannelColorNoAlpha's vtable.
   *   6. Tear down color-model enum @0x000ca7f5-0x000ca7fc:
   *        leaq 0x2e8(%rbx), %rdi       ; rdi = this + 0x2e8
   *        callq __ZN13OZChannelEnumD1Ev; OZChannelEnum::~OZChannelEnum()
   *   7. Tear down A sub-channel @0x000ca801-0x000ca808:
   *        leaq 0x250(%rbx), %rdi       ; rdi = this + 0x250
   *        callq __ZN9OZChannelD2Ev
   *   8. Tear down B sub-channel @0x000ca80d-0x000ca814:
   *        leaq 0x1b8(%rbx), %rdi       ; rdi = this + 0x1b8
   *        callq __ZN9OZChannelD2Ev
   *   9. Tear down G sub-channel @0x000ca819-0x000ca820:
   *        leaq 0x120(%rbx), %rdi       ; rdi = this + 0x120
   *        callq __ZN9OZChannelD2Ev
   *  10. Tear down R sub-channel @0x000ca825-0x000ca82c:
   *        leaq 0x88(%rbx), %rdi        ; rdi = this + 0x088
   *        callq __ZN9OZChannelD2Ev
   *  11. Restore this into %rdi + frame epilogue @0x000ca831-0x000ca839:
   *        movq %rbx, %rdi              ; rdi = this
   *        addq $0x8, %rsp; popq %rbx; popq %rbp
   *  12. Tail-jmp OZCompoundChannel::~OZCompoundChannel @0x000ca83a:
   *        jmp __ZN17OZCompoundChannelD2Ev
   *      The base compound dtor takes over — it will re-install its
   *      own vtable, tear down any OZCompoundChannel members, and
   *      then chain up to OZChannelBase.
   *
   * NOTES ON THE JS-SIDE PORT:
   *   • Vtable installs (steps 3 and 5) are IMPLICIT in the JS
   *     prototype chain — TypeScript does not model raw vptrs. We
   *     preserve the exact call-order of member destructors so any
   *     future sub-object dtors that DO have side-effects run in the
   *     correct order.
   *   • Every OZChannel::D2 / OZChannelEnum::D1 / OZCompoundChannel::D2
   *     is a frontier stub that throws citing its @0xADDR. That means
   *     calling this D1 today throws on the FIRST sub-object dtor
   *     (the base OZChannel at +0x3f0). This is intentional — the
   *     gate wants loud gaps, not silent success on partial data.
   */
  destruct_D1(): void {
    // Step 3: primary/secondary vptrs — implicit in JS prototype.
    // Step 4: tear down OZChannelColorNoAlpha's own OZChannel sub-subobject at +0x3f0.
    OZChannel__D2(this.baseOZChannel());
    // Step 5: re-install OZChannelColorNoAlpha vtable — implicit in JS prototype.
    // Step 6: tear down color-model enum sub-channel at +0x2e8.
    OZChannelEnum__D1(this.colorModelSubChannel());
    // Step 7: tear down A sub-channel at +0x250.
    OZChannel__D2(this.aSubChannel());
    // Step 8: tear down B sub-channel at +0x1b8.
    OZChannel__D2(this.bSubChannel());
    // Step 9: tear down G sub-channel at +0x120.
    OZChannel__D2(this.gSubChannel());
    // Step 10: tear down R sub-channel at +0x088.
    OZChannel__D2(this.rSubChannel());
    // Step 12: tail-jmp OZCompoundChannel::~OZCompoundChannel with this
    // unchanged. In TS that's a plain call on `this` (cast through the
    // OZCompoundChannel-shaped view — the base subobject sits at
    // offset 0 of OZChannelColor).
    OZCompoundChannel__D2(this as unknown as OZCompoundChannel);
  }
}
