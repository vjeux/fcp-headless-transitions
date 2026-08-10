// OZFolderLightShadow.ts — Ozone's "Shadow" channel folder for a light.
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//         Versions/A/Ozone (macOS FCP, x86_64 slice; VA == offset in the slice)
//
// `OZFolderLightShadow` is an `OZChannelFolder` subclass (its own ctor calls
// `OZChannelFolder::setFoldFlag(unsigned int)` on `this` — @Ozone 0x4f1cc8 and
// @0x4f1cd5 in `initChannels()`) that groups a light's shadow parameters. Each
// parameter is an EMBEDDED channel sub-object constructed in place by the ctor
// @0x4f19c0, and each has a pair of accessors — a `const` one and a non-`const`
// one — that hand back the sub-object's ADDRESS.
//
// -----------------------------------------------------------------------------
// SYMBOL PORTED IN THIS FILE (one C++ method = one member citing its @0xADDR)
// -----------------------------------------------------------------------------
//   * OZFolderLightShadow::uniformSoftness() const   @Ozone 0x4f2810
//     __ZNK19OZFolderLightShadow15uniformSoftnessEv
//     DECODE: raw-port/re/disasm/__ZNK19OZFolderLightShadow15uniformSoftnessEv.s
//
// Everything else on the class is NOT ported here — this file is ADD-ONLY and
// each member lands as its own unit: the four ctors (@0x4f19c0, @0x4f1d20,
// @0x4f1fd0, @0x4f20f0 and their C1 aliases), the dtors (@0x4f23a0 / @0x4f2460
// / @0x4f25f0), initChannels @0x4f1c70, update @0x4f2790, the two hasShadows
// overloads @0x4f27a0 / @0x4f27b0, opacity @0x4f27d0 / @0x4f27e0, softness
// @0x4f27f0 / @0x4f2800, the NON-const uniformSoftness twin @0x4f2820, and
// color @0x4f2830 / @0x4f2840.
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT — the embedded channel sub-objects, each cited to the
// instruction that proves it
// -----------------------------------------------------------------------------
// The ctor `OZFolderLightShadow::OZFolderLightShadow(OZFactory*, PCString const&,
// OZChannelFolder*, unsigned int, unsigned int, bool)` @Ozone 0x4f19c0 builds
// each parameter IN PLACE (it takes the member's address with `leaq` and passes
// it as the sub-object ctor's `this`), and the four accessor pairs read those
// same offsets back:
//
//   +0x080  opacity channel     [ctor @0x4f1a16 `leaq 0x80(%rbx),%r14`;
//                                initChannels @0x4f1cac passes it to
//                                `OZChannel::setMax(double)` @0x4f1cbb;
//                                `opacity() const` @0x4f27d4 returns its address]
//   +0x118  softness channel    [ctor @0x4f1a6a `leaq 0x118(%rbx),%r15`;
//                                initChannels @0x4f1c7a passes it to
//                                `OZChannel::setMin` @0x4f1c87, `setMax`
//                                @0x4f1c97 and `setSliderMax` @0x4f1ca7;
//                                `softness() const` @0x4f27f4 returns its address]
//   +0x1b0  uniformSoftness     [ctor @0x4f1ab9 `leaq 0x1b0(%rbx),%r12` ->
//           (OZChannelBool)      @0x4f1adf `callq OZChannelBool::OZChannelBool(
//                                  int, PCString const&, OZChannelFolder*,
//                                  unsigned int, unsigned int, OZChannelImpl*,
//                                  OZChannelInfo*)` — which is what pins this
//                                sub-object's TYPE; the arguments are
//                                `1` (@0x4f1ace `movl $0x1,%esi`), the PCString
//                                built @0x4f1ab4, `this` as the parent folder
//                                (@0x4f1ad3 `movq %rbx,%rcx`), `3` (@0x4f1ad6
//                                `movl $0x3,%r8d`), 0, and a null impl/info pair
//                                (@0x4f1ac3 `movups %xmm0,(%rsp)` with
//                                xmm0 = 0). Returned by BOTH
//                                `uniformSoftness() const` @0x4f2814 and the
//                                non-const twin @0x4f2824.]
//   +0x248  color channel       [ctor @0x4f1b07 `leaq 0x248(%rbx),%r13`;
//                                `color() const` @0x4f2834 returns its address]
//
// FRONTIER CALLEES: none for this unit — `uniformSoftness() const` is a leaf
// (no calls, no externs, no indirect/virtual dispatch).
//
// Per PORTING_SPEC.md Rules 1, 2, 5, 6.

import { OZChannelBool } from "./OZChannelBool";

export class OZFolderLightShadow {
  /**
   * `+0x1b0  OZChannelBool uniformSoftness` — the "uniform softness" toggle of
   * the shadow folder, an EMBEDDED (by-value) channel sub-object.
   *
   * Constructed in place by the ctor: `leaq 0x1b0(%rbx), %r12` @Ozone 0x4f1ab9
   * hands the member's address to
   * `OZChannelBool::OZChannelBool(int, PCString const&, OZChannelFolder*,
   * unsigned int, unsigned int, OZChannelImpl*, OZChannelInfo*)` @0x4f1adf —
   * a sub-object ctor call, not a pointer store, which is what makes this an
   * inline member AND fixes its type as `OZChannelBool`.
   *
   * Modelled as a live `OZChannelBool` instance so that a JS reference to it IS
   * the `&(this+0x1b0)` address {@link OZFolderLightShadow.uniformSoftness}
   * returns. The channel's own construction arguments (index 1, the folder
   * `this`, flags 3/0, null impl+info) are the ctor's unit, not this one, so
   * nothing here pre-populates its state.
   */
  uniformSoftnessAt1b0: OZChannelBool = new OZChannelBool();

  /**
   * `OZFolderLightShadow::uniformSoftness() const` — Ozone @0x004f2810
   * (mangled `__ZNK19OZFolderLightShadow15uniformSoftnessEv`).
   *
   * Full transcription — every instruction of the function, in order
   * (raw-port/re/disasm/__ZNK19OZFolderLightShadow15uniformSoftnessEv.s):
   *
   *   0x4f2810  pushq %rbp                  ; frame setup (no TS counterpart)
   *   0x4f2811  movq  %rsp, %rbp            ; frame setup (no TS counterpart)
   *   0x4f2814  leaq  0x1b0(%rdi), %rax     ; return &this->uniformSoftness
   *   0x4f281b  popq  %rbp                  ; frame teardown (no TS counterpart)
   *   0x4f281c  retq                        ; return that address
   *   0x4f281d  nopl  (%rax)                ; alignment padding, not executed
   *
   * `leaq` computes an EFFECTIVE ADDRESS — nothing is loaded and nothing is
   * copied, so the C++ signature is `OZChannelBool const& uniformSoftness()
   * const`: the caller gets the embedded channel itself. (A pointer FIELD
   * would have compiled to `movq 0x1b0(%rdi), %rax` instead — compare
   * `OZSceneList::begin()` @0x81804, which does exactly that on its slot.)
   *
   * The three sibling accessors on this class have the identical one-`leaq`
   * body over their own offsets — `opacity() const` @0x4f27d4 (+0x80),
   * `softness() const` @0x4f27f4 (+0x118) and `color() const` @0x4f2834
   * (+0x248) — and the NON-const `uniformSoftness()` @0x4f2824 is a
   * byte-identical twin of this one on the same +0x1b0 slot (a separate
   * ledger entry; TypeScript has no const-overload, so porting it here would
   * be a duplicate rather than a second method).
   *
   * The faithful TS equivalent of returning `&member` is returning the member
   * object, because a JS object value is already a reference: mutations the
   * caller makes through the result are visible on `this`, exactly as in the
   * binary.
   *
   * Zero callees, zero externs, zero indirect calls, no null check.
   *
   * @returns the embedded uniform-softness channel at `this + 0x1b0`.
   */
  uniformSoftness(): OZChannelBool {
    // @Ozone 0x4f2814: leaq 0x1b0(%rdi), %rax
    return this.uniformSoftnessAt1b0;
  }
}
