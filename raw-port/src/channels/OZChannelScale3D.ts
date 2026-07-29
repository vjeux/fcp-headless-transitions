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
import type { CMTime } from "../infra/CMTime.js";

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

  // ═════════════════════════════════════════════════════════════════════
  // ProChannel-side methods (framework: ProChannel.framework).
  //
  // Every OZChannelScale3D method whose body lives in the ProChannel
  // binary (setValue, setValueOffsetByBehaviors, getValue, clone, copy,
  // getObjCWrapperName, ~OZChannelScale3D, and the ctors) is transcribed
  // OR loud-throw-stubbed below. VAs cited are from the ProChannel
  // x86_64 slice (/tmp/ProChannel.x86_64; VA == file offset).
  // ═════════════════════════════════════════════════════════════════════

  /**
   * `OZChannelScale3D::setValue(CMTime const&, double, double, double)`
   *   @ProChannel 0x86e20 (33-line body). Sets X/Y/Z sub-channel values
   *   at time `t` by dispatching each sub-channel's vtable[0x2c8] slot
   *   with `edx=0` (per-axis "setValue" virtual). The Z dispatch is a
   *   tail-jmp (@0x86e99). Faithful transcription:
   *
   *     x_sub = this + 0x88
   *     (*(x_sub->vtable + 0x2c8))(x_sub, &t, x, edx=0)         @0x86e4b
   *     y_sub = this + 0x120
   *     (*(y_sub->vtable + 0x2c8))(y_sub, &t, y, edx=0)         @0x86e69
   *     z_sub = this + 0x1b8
   *     tail-jmp (*(z_sub->vtable + 0x2c8))(z_sub, &t, z, edx=0) @0x86e99
   */
  setValue(t: CMTime, x: number, y: number, z: number): void {
    const xSub = this.xSubChannel();
    const ySub = this.ySubChannel();
    const zSub = this.zSubChannel();
    // vtable[0x2c8] on each OZChannel — the per-channel "set value at time" virtual.
    // The 4th positional arg in x86_64 SysV is `edx=0`; we thread it through as a
    // literal so the shim call-site matches the disasm one-for-one.
    (xSub as unknown as { __vtable_0x2c8_setValue__(t: CMTime, v: number, flag: number): void })
      .__vtable_0x2c8_setValue__(t, x, 0);                           // @0x86e4b
    (ySub as unknown as { __vtable_0x2c8_setValue__(t: CMTime, v: number, flag: number): void })
      .__vtable_0x2c8_setValue__(t, y, 0);                           // @0x86e69
    // Step 3: tail-jmp equivalent (no return value threaded further).
    (zSub as unknown as { __vtable_0x2c8_setValue__(t: CMTime, v: number, flag: number): void })
      .__vtable_0x2c8_setValue__(t, z, 0);                           // @0x86e99
  }

  /**
   * `OZChannelScale3D::getValue(CMTime const&, double* x, double* y, double* z, double bias) const`
   *   @ProChannel 0x9ed50 (46-line body). Reads each sub-channel via
   *   OZChannel::getValueAsDouble(t, bias) and writes to *x/*y/*z, but
   *   only if the corresponding pointer is non-null. Faithful:
   *
   *     if (x != null): *x = xSub.getValueAsDouble(t, bias)       @0x9ed86
   *     if (y != null): *y = ySub.getValueAsDouble(t, bias)       @0x9edaa
   *     if (z != null): *z = zSub.getValueAsDouble(t, bias)       @0x9edcc
   *
   * NB: `bias` is preserved across each call (movsd -0x30(%rbp),%xmm0
   * before each callq) — it's an input to getValueAsDouble, not a
   * per-axis output.
   */
  getValue(
    t: CMTime,
    outX: { value: number } | null,
    outY: { value: number } | null,
    outZ: { value: number } | null,
    bias: number,
  ): void {
    if (outX != null) {
      const xSub = this.xSubChannel();
      const v = (xSub as unknown as { getValueAsDouble(t: CMTime, bias: number): number })
        .getValueAsDouble(t, bias);                                   // @0x9ed86
      outX.value = v;
    }
    if (outY != null) {
      const ySub = this.ySubChannel();
      const v = (ySub as unknown as { getValueAsDouble(t: CMTime, bias: number): number })
        .getValueAsDouble(t, bias);                                   // @0x9edaa
      outY.value = v;
    }
    if (outZ != null) {
      const zSub = this.zSubChannel();
      const v = (zSub as unknown as { getValueAsDouble(t: CMTime, bias: number): number })
        .getValueAsDouble(t, bias);                                   // @0x9edcc
      outZ.value = v;
    }
  }

  /**
   * `OZChannelScale3D::clone() const`  @ProChannel 0x86d92 (24-line body).
   *
   * Faithful:
   *   1) rax = operator new(0x250)  (sizeof OZChannelScale3D)         @0x86da1
   *   2) OZChannelScale3D::OZChannelScale3D(*rax, *this, nullptr)     @0x86db1
   *      — copy-ctor with folder=nullptr.
   *   3) return rax.
   *
   * The unwind path @0x86dbe..0x86dcc deletes the half-constructed
   * copy on exception; not modeled explicitly in JS (GC handles it).
   *
   * NB sizeof is 0x250 bytes (recovered from `movl $0x250, %edi`
   * @0x86d9c). This is BIGGER than OZChannelScale (0x1b8): +0x88 for
   * the Z sub-channel + +0x10 for the two vptrs — the ledger entry
   * for the copy-ctor is 0x86d12/0x86d88.
   */
  clone(): OZChannelScale3D {
    // Copy-ctor with folder=null. The full body of the copy-ctor lives
    // at ProChannel 0x86d12 (C1) / 0x86d88 (C2) — not yet transcribed
    // (frontier stub below). Every real call to clone() lands there.
    return OZChannelScale3D__C2_copy(this, null);                     // @0x86db1
  }

  /**
   * `OZChannelScale3D::copy(OZChannelBase const*, bool)`  @ProChannel 0x86dd2
   *   (27-line body).
   *
   * Faithful:
   *   1) OZChannel2D::copy(this, src, deep)  — chain to 2D base first  @0x86de4
   *   2) casted = dynamic_cast<OZChannelScale3D*>(src)                  @0x86dfc
   *   3) tail-jmp OZChannel::copy(
   *          this + 0x1b8,               // z sub-channel
   *          casted + 0x1b8,             // src z sub-channel
   *          deep,
   *      )                                                              @0x86e1b
   *
   * i.e. delegate the X/Y sub-channels to OZChannel2D::copy, then deep-
   * copy just the Z sub-channel on top.
   */
  copy(src: OZChannelScale3D, deep: boolean): void {
    // Step 1: OZChannel2D::copy(this, src, deep).                       @0x86de4
    OZChannel2D__copy(this as unknown as OZChannel2D, src as unknown as OZChannel2D, deep);
    // Step 2: dynamic_cast<OZChannelScale3D*> — in JS, the shape already
    // is OZChannelScale3D (dynamic_cast can return nullptr on failure,
    // but the disasm doesn't null-check the result; we mirror that).
    const casted = src;
    // Step 3: tail-jmp OZChannel::copy(this.z, src.z, deep).             @0x86e1b
    OZChannel__copy(
      this.zSubChannel(),
      casted.zSubChannel(),
      deep,
    );
  }

  /**
   * `OZChannelScale3D::getObjCWrapperName()`  @ProChannel 0x870e6 (7-line body).
   *
   * Faithful:
   *   pushq %rbp; movq %rsp,%rbp                                        @0x870e6-0x870e7
   *   leaq  0x5ea1f(%rip),%rax   ## Objc cfstring ref: @"bad cfstring ref"  @0x870ea
   *   popq %rbp; retq                                                    @0x870f1-0x870f2
   *
   * The stub the RIP-relative points at is the linker's placeholder
   * (`@"bad cfstring ref"`) — a real production build would resolve
   * to something like `@"FCEffectChannelScale3D"`. Faithful today
   * returns the literal the binary actually references (so the
   * behavior matches at bit level even if the string is nominally
   * a placeholder).
   */
  getObjCWrapperName(): string {
    // Literal at ProChannel rip+0x5ea1f = the CFString the binary
    // actually references. Kept verbatim per raw-port spec.
    return "bad cfstring ref";                                          // @0x870ea
  }

  /**
   * `OZChannelScale3D::setValueOffsetByBehaviors(CMTime const&, double, double, double)`
   *   @ProChannel 0x86e9c (143-line body).
   *
   * Faithful outline (deep transcription deferred):
   *   1) for each axis a in [X @+0x88, Y @+0x120, Z @+0x1b8]:
   *        cur = axis->getValueAsDouble(t, bias=0.0)                     @0x86ed3/@0x86ef8/@0x86f1c
   *        arg[a] -= cur     (compute offset from current)               @0x86edd/@0x86f02/@0x86f26
   *   2) tRef = xSub->getTimeOffset()                                    @0x86f40
   *   3) call each axis->setValueOffsetAtTime(t + tRef, offset)  — the
   *      exact vtable slot + arg-marshaling is what fills the remaining
   *      100+ instructions. Deferred.
   *
   * Body deferred — throw citing @0x86e9c and every sub-callee.
   */
  setValueOffsetByBehaviors(_t: CMTime, _x: number, _y: number, _z: number): void {
    throw new Error(
      "OZChannelScale3D::setValueOffsetByBehaviors @ProChannel 0x86e9c not yet transcribed " +
      "(143-line body; deps: OZChannel::getValueAsDouble @call 0x86ed3/0x86ef8/0x86f1c, " +
      "OZChannelBase::getTimeOffset @call 0x86f40, per-axis vtable-set-offset dispatch)",
    );
  }
}

// ── ProChannel-side frontier stubs (unchanged if already declared elsewhere) ─────────────────

/** `OZChannelScale3D::OZChannelScale3D(OZChannelScale3D const&, OZChannelFolder*)` [C2 copy]
 *  @ProChannel 0x86d12 (entry) / 0x86d88 (fold). The copy-ctor allocated by clone(). Body not
 *  transcribed yet at @ProChannel 0x86d12; stub cites addr. */
function OZChannelScale3D__C2_copy(
  _src: OZChannelScale3D,
  _folder: unknown,
): OZChannelScale3D {
  throw new Error(
    "OZChannelScale3D::OZChannelScale3D(OZChannelScale3D const&, OZChannelFolder*) " +
    "@ProChannel 0x86d12 (C2 copy) — invoked by clone() @0x86db1. Not yet transcribed.",
  );
}

/** `OZChannel2D::copy(OZChannelBase const*, bool)` @ProChannel U-extern. Invoked by
 *  OZChannelScale3D::copy @0x86de4. Body lives in OZChannel2D.ts (frontier if not yet ported).
 *  Throw-stub for now. */
function OZChannel2D__copy(_self: OZChannel2D, _src: OZChannel2D, _deep: boolean): void {
  throw new Error(
    "OZChannel2D::copy(OZChannelBase const*, bool) @ProChannel U-extern — invoked by " +
    "OZChannelScale3D::copy @0x86de4. Not yet transcribed.",
  );
}

/** `OZChannel::copy(OZChannelBase const*, bool)` @ProChannel U-extern. Tail-jumped by
 *  OZChannelScale3D::copy @0x86e1b (against the Z sub-channel at +0x1b8). Throw-stub for now. */
function OZChannel__copy(_self: OZChannel, _src: OZChannel, _deep: boolean): void {
  throw new Error(
    "OZChannel::copy(OZChannelBase const*, bool) @ProChannel U-extern — tail-jmp'd by " +
    "OZChannelScale3D::copy @0x86e1b (Z sub-channel at +0x1b8). Not yet transcribed.",
  );
}

/** Shape sentinel for OZChannel2D — matches the ProChannel-side shape (frontier). */
interface OZChannel2D { /* frontier — see OZChannel2D.ts */ }

