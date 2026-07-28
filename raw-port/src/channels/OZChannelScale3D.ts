// OZChannelScale3D — Ozone framework. A 3D scale channel (X/Y/Z scale
// factors as three animatable OZChannels), derived from OZChannel2D
// (which owns the X and Y sub-channels) and extended with a third
// (Z) sub-channel unique to the 3D form.
//
// FRAMEWORK: Ozone.framework
//   (/Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework
//    /Versions/A/Ozone). The x86_64 slice is a fat sub-arch; all VAs
//    below are unadjusted VM addresses from `otool -tV` (i.e. within
//    the slice, not fat file offsets).
//
// LEDGER SCOPE: this class exposes ONE public method in the Ozone
// image (the D1 destructor at 0x001cdc30). The C1/C2 constructors, D0
// deleting destructor, and every polymorphic method are all imported
// via __stubs from ProChannel, so they don't appear in Ozone's own
// ledger. Faithful transcription here therefore covers only the D1
// dtor body; the frontier callees are surfaced as throwing stubs.
//
// STRUCT LAYOUT — recovered from D1 disassembly
// (raw-port/re/disasm/OZChannelScale3D.~OZChannelScale3D.s, 28 lines):
//
//   +0x000  vtable[0]  primary vptr    (installed at D1 entry: address
//                                       of `__ZTV16OZChannelScale3D + 0x10`,
//                                       loaded via `movq 0x654ca0(%rip),%rax`
//                                       @0x001cdc39, then written to
//                                       *(rdi+0x00) @0x001cdc44).
//   +0x010  vtable[1]  secondary vptr  (installed = &__ZTV16OZChannelScale3D
//                                       + 0x358, loaded via
//                                       `addq $0x358,%rax` @0x001cdc47,
//                                       then written to *(rdi+0x10)
//                                       @0x001cdc4d).
//   +0x088  OZChannel   X sub-channel  (inherited from OZChannel2D;
//                                       dtor'd @0x001cdc81-0x001cdc88 via
//                                       `leaq 0x88(%rbx),%rdi;
//                                       callq OZChannel::D2`).
//   +0x120  OZChannel   Y sub-channel  (inherited from OZChannel2D;
//                                       dtor'd @0x001cdc75-0x001cdc7c via
//                                       `leaq 0x120(%rbx),%rdi;
//                                       callq OZChannel::D2`).
//   +0x1b8  OZChannel   Z sub-channel  (OZChannelScale3D's own third
//                                       axis; dtor'd @0x001cdc51-0x001cdc58
//                                       via `addq $0x1b8,%rdi;
//                                       callq OZChannel::D2` — this is
//                                       the OZChannelScale3D-specific
//                                       Z sub-channel, torn down BEFORE
//                                       the base OZChannel2D members).
//
// The OZCompoundChannel base subobject starts at offset 0 (proven by
// the tail-jmp to OZCompoundChannel::~OZCompoundChannel with %rdi
// unchanged @0x001cdc96). Its size is exactly 0x88 bytes, because that
// is where the first named member (X sub-channel) begins — matching
// the OZChannelScale (2D) layout precisely.
//
// VTABLES — two class-vtable pointers are re-installed twice inside
// D1: once at entry (OZChannelScale3D's own vtable, secondary at +0x358)
// and once mid-body (OZChannel2D's vtable, secondary ALSO at +0x358,
// same offset). This is a classical Itanium C++ ABI vtable-thunk-table
// pair pattern; the +0x358 offset repeats because both classes have the
// same secondary-vtable layout size (compare OZChannelColor's +0x370:
// different class -> different secondary offset).
//
// DESTRUCTION ORDER (proven by the asm's callq sequence):
//   1. Install &__ZTV16OZChannelScale3D vtable pointers.
//   2. Tear down Z sub-channel @+0x1b8 (OZChannelScale3D's own,
//      OZChannel::D2).
//   3. Re-install vtable pointers to &__ZTV11OZChannel2D (peel one
//      layer up in the vtable chain).
//   4. Tear down Y sub-channel @+0x120 (inherited from OZChannel2D,
//      OZChannel::D2).
//   5. Tear down X sub-channel @+0x088 (inherited from OZChannel2D,
//      OZChannel::D2).
//   6. Tail-jmp OZCompoundChannel::~OZCompoundChannel(this) — the
//      base compound-channel dtor takes over.
//
// The OZChannel2D vtable re-install BEFORE tearing down the Y/X
// members is C++'s standard "virtual-dispatch during a dtor sees your
// base's vtable, not your derived's" rule: while we're inside
// OZChannel2D's phase, any virtual call must resolve to OZChannel2D's
// vtable (which sits between OZChannelScale3D and OZCompoundChannel
// in the inheritance chain).
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
 * `__ZN9OZChannelD2Ev` — the base OZChannel destructor. Called THREE
 * times inside OZChannelScale3D::~OZChannelScale3D():
 *
 *   • @Ozone 0x001cdc58 — tearing down the Z sub-channel at this+0x1b8
 *     (OZChannelScale3D's own third axis).
 *   • @Ozone 0x001cdc7c — tearing down the Y sub-channel at this+0x120
 *     (inherited from OZChannel2D).
 *   • @Ozone 0x001cdc88 — tearing down the X sub-channel at this+0x088
 *     (inherited from OZChannel2D).
 *
 * The stub in Ozone at 0x6df480 is `__stubs` -> ProChannel
 * `__ZN9OZChannelD2Ev`, which is not yet transcribed on this side
 * (OZChannel.ts covers ctors + copy-ctor only).
 */
function OZChannel__D2(_self: OZChannel): void {
  throw new Error(
    "OZChannel::~OZChannel() [D2] @Ozone U-extern __ZN9OZChannelD2Ev " +
      "(stub @0x6df480, not yet transcribed) — invoked by " +
      "OZChannelScale3D::~OZChannelScale3D() D1 @0x001cdc58 (Z+0x1b8), " +
      "@0x001cdc7c (Y+0x120), @0x001cdc88 (X+0x088)",
  );
}

/**
 * `OZCompoundChannel::~OZCompoundChannel()` [D2]  @Ozone U-extern
 * `__ZN17OZCompoundChannelD2Ev` — the OZCompoundChannel base
 * destructor. Called via TAIL-JMP (not callq) inside
 * OZChannelScale3D::~OZChannelScale3D() @Ozone 0x001cdc96, after the
 * frame teardown (@0x001cdc90-0x001cdc95) with %rdi unchanged
 * (= this) — the classic "base dtor takes over" pattern.
 *
 * The stub in Ozone at 0x6de2b6 is `__stubs` -> ProChannel
 * `__ZN17OZCompoundChannelD2Ev`, not yet transcribed. The
 * OZCompoundChannel Ozone override file (raw-port/src/channels/
 * OZCompoundChannel.ts) transcribes ONLY the three Ozone overrides
 * — the D2 body itself lives in ProChannel.
 */
function OZCompoundChannel__D2(_self: OZCompoundChannel): void {
  throw new Error(
    "OZCompoundChannel::~OZCompoundChannel() [D2] @Ozone U-extern " +
      "__ZN17OZCompoundChannelD2Ev (stub @0x6de2b6, not yet transcribed) " +
      "— invoked by OZChannelScale3D::~OZChannelScale3D() D1 tail-jmp @0x001cdc96",
  );
}

// ─────────────────────────────────────────────────────────────────────────
// The class itself.
// ─────────────────────────────────────────────────────────────────────────

/**
 * `OZChannelScale3D` — a 3D scale channel (X/Y/Z), extends OZChannel2D
 * by adding a third (Z) sub-channel at +0x1b8.
 *
 * Layout — verified from the D1 dtor:
 *   +0x000   primary vptr (implicit in JS prototype chain)
 *   +0x010   secondary vptr (implicit)
 *   +0x088   OZChannel X sub-channel (from OZChannel2D)
 *   +0x120   OZChannel Y sub-channel (from OZChannel2D)
 *   +0x1b8   OZChannel Z sub-channel (OZChannelScale3D's own)
 *   +0x000..+0x087   OZCompoundChannel base subobject
 *   (sizeof cannot be recovered from the D1 body alone — the last
 *    accessed offset is +0x1b8, so sizeof(OZChannelScale3D) >= 0x1b8 +
 *    sizeof(OZChannel). The exact total is DEFERRED to ctor decode.
 *    OZChannelScale (2D sibling) has sizeof = 0x1b8, so OZChannelScale3D
 *    is at least 0x1b8 + 0x88 = 0x240 assuming an OZChannel is 0x88
 *    bytes as inferred from the X/Y/Z stride here.)
 *
 * NB: We do NOT `extends OZChannel2D` here — OZChannel2D's ctors are
 * frontier stubs (see raw-port/src/channels/OZChannel2D.ts), so
 * `extends`-inheritance would propagate un-populatable fields. We
 * mirror the OZChannelScale pattern (see OZChannelScale.ts) and let
 * the destructor invoke the frontier stubs explicitly. When
 * OZChannel2D lands its real body, this class can flip to
 * `extends OZChannel2D` in a one-line diff.
 */
export class OZChannelScale3D {
  // Primary and secondary vptrs are implicit in the JS prototype
  // chain. Their asm-level install sites are described in the class
  // header comment and echoed inside destruct_D1 below.

  // ─────────────────────────────────────────────────────────────────
  // Sub-channel accessors — placeholder shape. The actual OZChannel
  // objects live inline inside the OZChannelScale3D memory (not as
  // pointers). Their construction lives in the ProChannel C1/C2
  // ctors (frontier). Once the ctors land, these accessors can be
  // replaced with real inline sub-object fields.
  // ─────────────────────────────────────────────────────────────────

  /** X sub-channel @+0x088 (from OZChannel2D) — see class-header struct layout. */
  xSubChannel(): OZChannel {
    throw new Error(
      "OZChannelScale3D.xSubChannel() @+0x088 — OZChannel X sub-channel " +
        "accessor (not yet transcribed; construction lives in ProChannel " +
        "OZChannelScale3D C1/C2 ctors). Referenced by " +
        "OZChannelScale3D::~OZChannelScale3D() D1 @Ozone 0x001cdc81.",
    );
  }

  /** Y sub-channel @+0x120 (from OZChannel2D) — see class-header struct layout. */
  ySubChannel(): OZChannel {
    throw new Error(
      "OZChannelScale3D.ySubChannel() @+0x120 — OZChannel Y sub-channel " +
        "accessor (not yet transcribed). Referenced by " +
        "OZChannelScale3D::~OZChannelScale3D() D1 @Ozone 0x001cdc75.",
    );
  }

  /**
   * Z sub-channel @+0x1b8 — OZChannelScale3D's own third-axis
   * sub-channel. Torn down FIRST in D1 (@Ozone 0x001cdc51-0x001cdc58)
   * because C++ destruction unwinds derived members first, then base
   * subobjects.
   */
  zSubChannel(): OZChannel {
    throw new Error(
      "OZChannelScale3D.zSubChannel() @+0x1b8 — OZChannel Z sub-channel " +
        "accessor (not yet transcribed). Referenced by " +
        "OZChannelScale3D::~OZChannelScale3D() D1 @Ozone 0x001cdc51.",
    );
  }

  /**
   * `OZChannelScale3D::~OZChannelScale3D()` [D1]  @Ozone 0x001cdc30 —
   * the D1 (complete-object non-deleting) destructor.
   *
   * Faithful transcription of the 28-line disasm:
   *
   *   1. Frame prologue @0x001cdc30-0x001cdc35:
   *        pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax
   *        (rax push is 16-byte stack alignment; rbx will hold `this`)
   *   2. Spill this @0x001cdc36:
   *        movq %rdi, %rbx        ; rbx = this
   *   3. FIRST vtable install (OZChannelScale3D own) @0x001cdc39-0x001cdc4d:
   *        movq 0x654ca0(%rip), %rax    ; rax = &__ZTV16OZChannelScale3D
   *                                      ;      (literal pool entry)
   *        leaq 0x10(%rax), %rcx        ; rcx = vtable + 0x10 (primary
   *                                      ;      slot)
   *        movq %rcx, (%rdi)            ; *(this + 0x00) = primary vptr
   *        addq $0x358, %rax            ; rax = vtable + 0x358 (secondary)
   *        movq %rax, 0x10(%rdi)        ; *(this + 0x10) = secondary vptr
   *      Rationale: the C++ ABI requires that inside a dtor, virtual
   *      calls see THIS class's vtable (not the caller's), so we
   *      re-install our own vtable at entry.
   *   4. Tear down Z sub-channel @0x001cdc51-0x001cdc58:
   *        addq $0x1b8, %rdi            ; rdi = this + 0x1b8
   *        callq __ZN9OZChannelD2Ev     ; OZChannel::~OZChannel()
   *      (This is the OZChannelScale3D-specific Z axis, the only
   *       sub-channel unique to this class beyond OZChannel2D's X/Y.
   *       It gets destroyed FIRST among the members-teardown phase.)
   *   5. SECOND vtable install (OZChannel2D own) @0x001cdc5d-0x001cdc71:
   *        movq 0x654c1c(%rip), %rax    ; rax = &__ZTV11OZChannel2D
   *        leaq 0x10(%rax), %rcx        ; rcx = vtable + 0x10
   *        movq %rcx, (%rbx)            ; *(this + 0x00) = primary vptr
   *                                      ;                  (OZChannel2D)
   *        addq $0x358, %rax            ; rax = vtable + 0x358
   *        movq %rax, 0x10(%rbx)        ; *(this + 0x10) = secondary
   *                                      ;                  (OZChannel2D)
   *      Rationale: we've finished OZChannelScale3D's phase and are
   *      about to run OZChannel2D's phase. Any virtual call inside
   *      the members-still-to-destroy must resolve on OZChannel2D's
   *      vtable.
   *   6. Tear down Y sub-channel @0x001cdc75-0x001cdc7c:
   *        leaq 0x120(%rbx), %rdi       ; rdi = this + 0x120
   *        callq __ZN9OZChannelD2Ev
   *   7. Tear down X sub-channel @0x001cdc81-0x001cdc88:
   *        leaq 0x88(%rbx), %rdi        ; rdi = this + 0x088
   *        callq __ZN9OZChannelD2Ev
   *   8. Restore this into %rdi + frame epilogue @0x001cdc8d-0x001cdc95:
   *        movq %rbx, %rdi              ; rdi = this
   *        addq $0x8, %rsp; popq %rbx; popq %rbp
   *   9. Tail-jmp OZCompoundChannel::~OZCompoundChannel @0x001cdc96:
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
   *   • Every OZChannel::D2 / OZCompoundChannel::D2 is a frontier
   *     stub that throws citing its @0xADDR. That means calling this
   *     D1 today throws on the FIRST sub-object dtor (the Z channel
   *     at +0x1b8). This is intentional — the gate wants loud gaps,
   *     not silent success on partial data.
   */
  destruct_D1(): void {
    // Step 3: primary/secondary vptrs — implicit in JS prototype.
    // Step 4: tear down Z sub-channel at +0x1b8 (OZChannelScale3D's own axis).
    OZChannel__D2(this.zSubChannel());
    // Step 5: re-install OZChannel2D vtable — implicit in JS prototype.
    // Step 6: tear down Y sub-channel at +0x120 (from OZChannel2D).
    OZChannel__D2(this.ySubChannel());
    // Step 7: tear down X sub-channel at +0x088 (from OZChannel2D).
    OZChannel__D2(this.xSubChannel());
    // Step 9: tail-jmp OZCompoundChannel::~OZCompoundChannel with this
    // unchanged. In TS that's a plain call on `this` (cast through the
    // OZCompoundChannel-shaped view — the base subobject sits at
    // offset 0 of OZChannelScale3D).
    OZCompoundChannel__D2(this as unknown as OZCompoundChannel);
  }
}
