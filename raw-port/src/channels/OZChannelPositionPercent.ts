// OZChannelPositionPercent — 2D animated position-in-percent channel. Extends OZChannel2D
// (which itself extends OZCompoundChannel/OZChannelFolder). Faithful port from
// ProChannel.framework (x86_64 slice).
//
// This class is the "position expressed as [0,1]" sibling of OZChannelPosition. Unlike
// OZChannelPosition it holds NO arc-length cache, NO 4x4 matrix, and NO std::vectors — the
// per-instance ADDITIONS to OZChannel2D are ONLY:
//   - a single byte at C++ offset +0x1b8 (semantically "percent-clamp flag"; set to 1 by every
//     ctor and copied wholesale by the copy-ctor @ProChannel 0x7f644),
//   - the vtable overrides installed at +0x00 and +0x10.
// This is confirmed by clone() @ProChannel 0x7f6a8 which `operator new`s exactly 0x1c0 bytes and
// only touches +0x1b8 after the OZChannel2D copy-ctor (see re/disasm/ ProChannel.
// OZChannelPositionPercent.clone.s).
//
// Struct layout (recovered from ctor + clone + copy-ctor disasm):
//   +0x000..+0x087  OZChannel2D base subobject (vtable @+0, DR-vtable @+0x10)
//   +0x088..+0x11f  X sub-channel (OZChannel, 152 bytes) — read via
//                   OZChannel::getValueAsDouble in getPosition @0xa793a
//   +0x120..+0x1b7  Y sub-channel (OZChannel, 152 bytes) — same pattern @0xa7957
//   +0x1b8          uint8 "percent-clamp" flag — set to 1 by all four ctors (@0x7f0b2 /
//                   @0x7f2c8 / @0x7f4a5 / @0x7f667 / @0x7f6e1). Byte-write `movb $0x1, 0x1b8`.
//                   Meaning not exercised by any decoded method in this class.
//   +0x1b9..+0x1bf  7-byte tail padding (class size = 0x1c0, from clone's `movl $0x1c0, %edi`
//                   @0x7f6b2).
//
// vtables (from `python3 army/tools/resolve.py ProChannel sym`):
//   `vtable for OZChannelPositionPercent`+0x10 = 0xdd888 -- installed at (this+0) by every ctor
//                                                          (e.g. @0x7f2b3 leaq 0x5e5ce(%rip);
//                                                          @0x7f2ba movq %rax,(%rbx)).
//   `vtable for OZChannelPositionPercent`+0x358 = 0xddbd0 -- installed at (this+0x10) by every
//                                                            ctor (e.g. @0x7f2bd/@0x7f2c4).
// The +0x358 slot is the OZChannel2D "derived-return" secondary vtable (offset-to-derived
// thunk table). Slot layout not enumerated here — this port relies on TS dynamic dispatch
// for the same effect (see PORTING_SPEC.md Rule 6).
//
// String literals (all resolved from __cfstring @ ProChannel __DATA_CONST:__cfstring, following
// the RIP-relative leaq at the cited addr and reading the utf-8 cstring pointer:
//   @0xe4f70 -> "Channel X"               @0xbc760, len 9   -- setName on X sub-channel
//   @0xe4f90 -> "Channel Y"               @0xbc76a, len 9   -- setName on Y sub-channel
//   @0xe5950 -> "Channel Position Suffix" @0xbd016, len 23  -- setSuffix on both sub-channels
//                                                              (this is a localization key, not
//                                                              the rendered suffix)
//   @0xe5990 -> "CHChannelPositionPercent" @0xbd046, len 24 -- getObjCWrapperName return string
// The disassembly annotation `## Objc cfstring ref: @"bad cfstring ref"` at these leaq sites is
// otool's stock placeholder — the actual utf-8 bytes were recovered by reading the __cfstring
// entry (isa,flags,cstr_ptr,length) and stripping the low-32 fixup tag off cstr_ptr.
//
// Numeric constants (all read via raw-port/army/tools/resolve.py ProChannel const <VA>):
//   @0xaf520 = 0.01    (u64 0x3f847ae147ae147b) -- setCoarseDelta arg (both axes, all ctors)
//   @0xaf528 = 1.0     (u64 0x3ff0000000000000) -- setSliderMax   arg (both axes, all ctors)
//   @0xaf588 = 0.0001  (u64 0x3f1a36e2eb1c432d) -- setFineDelta   arg (both axes, all ctors)
//   setSliderMin arg   = 0.0 (inline `xorps %xmm0, %xmm0` @0x7f33f/@0x7f37a/@0x7f51c/@0x7f557 —
//                             no rodata slot; the register is zeroed in-line).
//
// Methods transcribed from re/disasm/ProChannel.OZChannelPositionPercent.*.s:
//   getPosition                     @0xa791e
//   getObjCWrapperName              @0x7f704
//   ~OZChannelPositionPercent (D0)  @0x7f71c
//   ~OZChannelPositionPercent (D1)  @0x7f712  (Itanium-ABI-aliased to D2, not present as separate label)
//   clone                           @0x7f6a8  (partial — allocates 0x1c0, delegates to
//                                              OZChannel2D copy-ctor; frontier stub)
//   OZChannelPositionPercent(OZChannelPositionPercent const&, OZChannelFolder*)  C2 @0x7f644
//   OZChannelPositionPercent(OZChannelPositionPercent const&, OZChannelFolder*)  C1 @0x7f676
//   OZChannelPositionPercent(PCString const&, OZChannelFolder*, uint, uint)      C2 @0x7f052
//   OZChannelPositionPercent(PCString const&, OZChannelFolder*, uint, uint)      C1 @0x7f24a  (jmp -> C2)
//   OZChannelPositionPercent(double, double, PCString const&, OZChannelFolder*, uint, uint)
//                                                                                 C2 @0x7f254
//   OZChannelPositionPercent(double, double, PCString const&, OZChannelFolder*, uint, uint)
//                                                                                 C1 @0x7f460  (jmp -> C2)
//   OZChannelPositionPercent(OZFactory*, PCString const&, uint)                   C2 @0x7f46a
//   OZChannelPositionPercent(OZFactory*, PCString const&, uint)                   C1 @0x7f63a  (jmp -> C2)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { CMTime } from "../infra/CMTime.js";

/** Interface of a scalar OZChannel — the two children (X @+0x88, Y @+0x120) of this position
 *  channel. Only the read path invoked by getPosition is needed here. Full class is
 *  transcribed elsewhere (see src/channels/OZChannel.ts).
 *
 *  Kept minimal on purpose: the setSliderMin/Max/CoarseDelta/FineDelta/setName/setSuffix
 *  writes performed by the ctors are configuration mutations on the sub-channels and are
 *  described via the {@link OZChannelPositionPercentInitOpts} callback rather than dispatched
 *  through this interface — the disasm invokes them directly on `&this[+0x88]` / `&this[+0x120]`
 *  (i.e. on the sub-channel storage inside OZChannel2D). */
export interface IOZScalarChannel {
  /** OZChannel::getValueAsDouble(CMTime const&, double fallback) const — used by getPosition
   *  @0x7f947 (X) / @0x7f967 (Y) with `xorps %xmm0, %xmm0` @0x7f941/@0x7f95e giving fallback=0.0.
   *  (Symbol: __ZNK9OZChannel16getValueAsDoubleERK6CMTimed.) */
  getValueAsDouble(t: CMTime, fallback: number): number;
}

/** Sub-channel configuration hook invoked by each ctor after the OZChannel2D base ctor
 *  has installed the child channels. Mirrors the six-writes-per-axis block at
 *  @0x7f33f..0x7f3b5 / @0x7f51c..0x7f592 / @0x7f129..0x7f19f (identical for all three "public"
 *  ctors — the copy-ctor @0x7f644 SKIPS this block, matching FCP's behavior of relying on the
 *  OZChannel2D copy-ctor to already carry these settings across).
 *
 *  Because sibling classes (OZChannelBase / OZChannel / OZFactory / OZChannelImpl /
 *  OZChannelInfo / PCString) are not yet ported end-to-end, the ctor takes a caller-provided
 *  adapter for the mutations. This keeps the port faithful (the sequence of mutation calls
 *  and their arguments come DIRECTLY from the disasm — not from a paraphrase) while deferring
 *  the sub-channel construction to the OZChannel2D port. */
export interface IOZChannelPositionPercentSubChannelHost {
  /** OZChannelBase::setName(PCString const&, bool) on X sub-channel (+0x88) with name key
   *  "Channel X" (cfstring @0xe4f70) and bool=0 (`xorl %edx,%edx`). @0x7f0e3 / @0x7f2f9 /
   *  @0x7f4d6. */
  setNameX(nameKey: string): void;
  /** OZChannelBase::setName on Y sub-channel (+0x120) with name key "Channel Y"
   *  (cfstring @0xe4f90) and bool=0. @0x7f11b / @0x7f331 / @0x7f50e. */
  setNameY(nameKey: string): void;
  /** OZChannel::setSliderMin/Max/CoarseDelta/FineDelta on X (+0x88) with the four constants:
   *  min=0.0 (inline xorps @0x7f129/@0x7f33f/@0x7f51c),
   *  max=1.0 (rodata @0xaf528 — @0x7f134/@0x7f34a/@0x7f527),
   *  coarseDelta=0.01 (rodata @0xaf520 — @0x7f144/@0x7f35a/@0x7f537),
   *  fineDelta=0.0001 (rodata @0xaf588 — @0x7f154/@0x7f36a/@0x7f547). */
  configureSlidersX(min: number, max: number, coarseDelta: number, fineDelta: number): void;
  /** Same on Y (+0x120): min=0.0/@0x7f164/@0x7f37a/@0x7f557, max=1.0/@0x7f16f/@0x7f385/@0x7f562,
   *  coarseDelta=0.01/@0x7f17f/@0x7f395/@0x7f572, fineDelta=0.0001/@0x7f18f/@0x7f3a5/@0x7f582. */
  configureSlidersY(min: number, max: number, coarseDelta: number, fineDelta: number): void;
  /** OZChannel::setSuffix on X and Y with the SAME PCString key "Channel Position Suffix"
   *  (cfstring @0xe5950). @0x7f1c0/@0x7f1ef (C2 PCString ctor), @0x7f3d6/@0x7f405 (C2 dd_
   *  ctor), @0x7f5b3/@0x7f5e2 (C2 factory ctor). Each ctor builds a fresh local PCString from
   *  the getProChannelBundle() and the CFString ref, calls setSuffix on each axis, then
   *  destructs the PCString — we model that as passing the key twice. */
  setSuffixBoth(suffixKey: string): void;
  /** OZChannelBase::resetFlag(0x10, false) on `this` (@0x7f207 / @0x7f41d / @0x7f5fa). The 0x10
   *  bit meaning is not yet decoded — see the OZChannelBase port. bool arg = 0 (`xorl %edx`). */
  resetFlag(bit: number, sticky: boolean): void;
}

/** OZChannelPositionPercent — see file header. */
export class OZChannelPositionPercent {
  /** X sub-channel — mapped to C++ offset +0x88. In C++ this is EMBEDDED inside the object
   *  (`leaq 0x88(%rbx), %r14`) as an inline OZChannel — not a pointer. The TS port models it
   *  as a reference because our OZChannel port is a class instance. */
  readonly x: IOZScalarChannel;
  /** Y sub-channel — mapped to C++ offset +0x120 (`leaq 0x120(%rbx), %r15`). */
  readonly y: IOZScalarChannel;
  /** Byte at C++ offset +0x1b8 — set to 1 by all four ctors (@0x7f0b2 / @0x7f2c8 / @0x7f4a5 /
   *  @0x7f667 / @0x7f6e1: `movb $0x1, 0x1b8(%rbx)`). Meaning not yet decoded; no method in
   *  this class reads it. Retained for layout fidelity. */
  readonly percentFlag1b8: number = 1;

  /**
   * Merged transcription of all five entry-point ctors. In the ASM they differ only by which
   * OZChannel2D base ctor they delegate to (and whether they pre-set default (x,y)); the
   * common tail body is IDENTICAL across the three "public" ctors and is described by the
   * {@link IOZChannelPositionPercentSubChannelHost} adapter. The private "copy-ctor" variant
   * (C2 @0x7f644 / C1 @0x7f676) SKIPS the tail (the OZChannel2D copy-ctor already carried the
   * per-axis config across) — modelled here by the `copyCtor: true` opts flag.
   *
   * Common tail (for the three non-copy ctors — @0x7f0b9..0x7f207 / @0x7f2cf..0x7f41d /
   * @0x7f4ac..0x7f5fa):
   *   1. getProChannelBundle() then PCString(CFString @0xe4f70 "Channel X", bundle, null)
   *      -> OZChannelBase::setName on X (+0x88) with bool=0 -> ~PCString.
   *   2. Same for Y (+0x120) with cfstring @0xe4f90 "Channel Y".
   *   3. Configure X sliders: min=0.0 (xorps), max=1.0 (@0xaf528), coarse=0.01 (@0xaf520),
   *      fine=0.0001 (@0xaf588).
   *   4. Configure Y sliders with the identical four numbers.
   *   5. PCString(CFString @0xe5950 "Channel Position Suffix", bundle, null) -> setSuffix on X
   *      (+0x88) -> ~PCString.
   *   6. Same PCString -> setSuffix on Y (+0x120) -> ~PCString.
   *   7. OZChannelBase::resetFlag(0x10, false) on `this`.
   *   8. Vptr writes at +0x00 -> 0xdd888 and +0x10 -> 0xddbd0 (`vtable for
   *      OZChannelPositionPercent`+0x10 and +0x358 respectively) — implicit in TS class dispatch.
   *
   * We accept only the caller-supplied dependencies (already-constructed sub-channels and the
   * sub-channel host adapter). Because sibling classes (OZChannel2D / OZFactory / OZChannelInfo
   * / PCString) are not yet ported, we do NOT synthesize them here — that would be a Rule 3
   * violation (guessing the base-ctor field layout). The caller is expected to have run the
   * OZChannel2D ctor already.
   */
  constructor(deps: {
    x: IOZScalarChannel;
    y: IOZScalarChannel;
    host: IOZChannelPositionPercentSubChannelHost;
    /** When true, mirror the copy-ctor variant @0x7f644/@0x7f676 which SKIPS the six-writes-
     *  per-axis tail body (the OZChannel2D copy-ctor already carried the config across). */
    copyCtor?: boolean;
  }) {
    this.x = deps.x;
    this.y = deps.y;
    // Step 8 (implicit in TS class dispatch): vptr writes at +0x00 -> vtable+0x10 (0xdd888)
    //                                       and +0x10 -> vtable+0x358 (0xddbd0).
    // Step (universal): the +0x1b8 byte is set to 1 by every ctor — @0x7f0b2 / @0x7f2c8 /
    //                   @0x7f4a5 / @0x7f667 / @0x7f6e1.
    // (this.percentFlag1b8 is already initialized to 1 above.)
    if (deps.copyCtor === true) {
      // C2/C1 copy-ctor @0x7f644/@0x7f676: after the OZChannel2D copy-ctor + vptr writes +
      // the +0x1b8 store, the ctor RETURNS immediately (see @0x7f66e-@0x7f674 / @0x7f6a0-
      // @0x7f6a6 — no setName/slider/suffix/resetFlag calls).
      return;
    }
    // Steps 1..7 — shared verbatim across all three non-copy ctors. Argument literals come
    // directly from the disasm; see file-header table for each RIP-relative source.
    deps.host.setNameX("Channel X");                                  // step 1
    deps.host.setNameY("Channel Y");                                  // step 2
    deps.host.configureSlidersX(0.0, 1.0, 0.01, 0.0001);              // step 3
    deps.host.configureSlidersY(0.0, 1.0, 0.01, 0.0001);              // step 4
    deps.host.setSuffixBoth("Channel Position Suffix");               // steps 5+6 (same key both axes)
    deps.host.resetFlag(0x10, false);                                 // step 7
  }

  /**
   * OZChannelPositionPercent::~OZChannelPositionPercent() @ProChannel 0x7f712 (D1Ev — Itanium-
   * ABI-aliased to D2Ev; no separate body in the disasm). D0Ev @ProChannel 0x7f71c calls
   * OZChannel2D::~OZChannel2D() @0x7f725 then jumps to `operator delete` @0x7f733. Faithful:
   *   1. Base dtor tail-call to OZChannel2D::~OZChannel2D() (@0x7f725).
   *   2. (D0 only) `operator delete(this)` (@0x7f733 `jmp __ZdlPv`).
   * In TypeScript this is a no-op — GC handles both steps. Provided as a named method so
   * the port stays 1:1 with the disasm.
   */
  destroy(): void {
    // OZChannel2D::~OZChannel2D() at @0x7f725 (or @0x7f723 in dtor path) — GC in TS.
    // operator delete @0x7f733 — GC in TS.
  }

  /**
   * OZChannelPositionPercent::getObjCWrapperName() @ProChannel 0x7f704. Faithful transcription:
   * loads the CFString ref at @0xe5990 ("CHChannelPositionPercent" via
   * cstr_ptr=0xbd046, len 24) via `leaq 0x66281(%rip), %rax` @0x7f708 and returns it.
   * The otool annotation `@"bad cfstring ref"` is otool's stock placeholder — the real
   * string was recovered by reading the __cfstring entry directly.
   */
  getObjCWrapperName(): string {
    // @0x7f708 leaq 0x66281(%rip), %rax => __cfstring @0xe5990 -> utf8 "CHChannelPositionPercent"
    return "CHChannelPositionPercent";
  }

  /**
   * OZChannelPositionPercent::getPosition(CMTime const&, double* outX, double* outY) const
   * @ProChannel 0xa791e. Faithful transcription:
   *   1. If outX (rdx) non-null (@0xa7932 `testq %rdx,%rdx; je 0xa7952`): store
   *      OZChannel::getValueAsDouble(X @+0x88, t, 0.0) at *outX (@0xa7947/@0xa794c). The
   *      fallback double comes from `xorps %xmm0,%xmm0` @0xa7941, i.e. 0.0.
   *   2. If outY (rcx, saved as rbx @0xa7929) non-null (@0xa7952 `testq %rbx,%rbx; je 0xa7970`):
   *      store OZChannel::getValueAsDouble(Y @+0x120, t, 0.0) at *outY (@0xa7967/@0xa796c).
   *      Fallback again 0.0 (`xorps %xmm0,%xmm0` @0xa795e).
   * (Note: unlike OZChannelPosition::getPosition @0x808b2 this variant has NO fallback double
   *  parameter — the caller cannot override the 0.0 fallback. The 3-arg signature matches the
   *  mangled name `getPosition(CMTime const&, double*, double*)`.)
   */
  getPosition(t: CMTime, wantX: boolean, wantY: boolean): { x?: number; y?: number } {
    const out: { x?: number; y?: number } = {};
    if (wantX) {
      out.x = this.x.getValueAsDouble(t, 0.0); // @0xa7947
    }
    if (wantY) {
      out.y = this.y.getValueAsDouble(t, 0.0); // @0xa7967
    }
    return out;
  }

  /**
   * OZChannelPositionPercent::clone() const @ProChannel 0x7f6a8. Faithful description of the
   * ASM body (@0x7f6a8..@0x7f6ef):
   *   1. `operator new(0x1c0)` (@0x7f6b2-@0x7f6b7) — heap-allocate 448 bytes. Total class size
   *      confirmed = 0x1c0.
   *   2. OZChannel2D::OZChannel2D(OZChannel2D const&, OZChannelFolder* nullptr) copy-ctor
   *      (@0x7f6c7; folder arg zeroed at @0x7f6c5).
   *   3. Write vptr at (this+0)  -> `vtable for OZChannelPositionPercent`+0x10  = 0xdd888
   *      (@0x7f6cc leaq 0x5e1b5(%rip); @0x7f6d3 movq %rax,(%rbx)).
   *   4. Write vptr at (this+0x10) -> `vtable for OZChannelPositionPercent`+0x358 = 0xddbd0
   *      (@0x7f6d6 leaq 0x5e4f3(%rip); @0x7f6dd movq %rax,0x10(%rbx)).
   *   5. Store 1 at (this+0x1b8) — the "percent-clamp" flag (@0x7f6e1 `movb $0x1, 0x1b8(%rbx)`).
   *   6. Return the new object in %rax (@0x7f6e8).
   *   7. Exception path @0x7f6f0..0x7f6fe: on OZChannel2D copy-ctor throw, `operator delete` the
   *      partially-constructed object and `__Unwind_Resume`.
   *
   * NOTE: OZChannel2D::OZChannel2D(OZChannel2D const&, OZChannelFolder*) copy-ctor
   * @ProChannel is NOT yet transcribed. Because clone's correctness depends ENTIRELY on that
   * copy-ctor faithfully cloning the base's fields (X/Y sub-channels, name/suffix/slider config,
   * flags, curve data), a JS "just copy the sub-channels" would be a Rule 3 violation. The
   * method therefore throws citing its @0xADDR and the address of the undecoded base callee.
   */
  clone(): OZChannelPositionPercent {
    throw new Error(
      "OZChannelPositionPercent::clone() @ProChannel 0x7f6a8 not yet transcribed " +
      "(delegates to OZChannel2D::OZChannel2D(OZChannel2D const&, OZChannelFolder*) copy-ctor " +
      "@ProChannel ~0x47856 which is not yet ported — allocation is 0x1c0 bytes via " +
      "`operator new` @0x7f6b7 (stub 0xace4c), vptrs go to 0xdd888/0xddbd0, and +0x1b8=1)"
    );
  }
}
