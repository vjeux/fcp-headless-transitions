// OZMaterialGenericSubstanceIF — FCP Ozone framework "generic substance"
// material interface (mixin base).
//
// Transcribed from the x86_64 disassembly of Ozone in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone.
//
// Symbols ported (nm -arch x86_64 | c++filt):
//   @0x08ec90  OZMaterialGenericSubstanceIF::selection()
//   @0x08ecb0  OZMaterialGenericSubstanceIF::getColor(CMTime const&, PCColor*)
//   @0x08ed40  OZMaterialGenericSubstanceIF::getSequenceColorChannelIF()
//   @0x08ed50  OZMaterialGenericSubstanceIF::getSequenceOpacityChannelIF()
//   @0x4c1aa0  OZMaterialGenericSubstanceIF::flatSelection()          (ICF-identical to selection)
//   @0x4c1ac0  OZMaterialGenericSubstanceIF::flatColor(CMTime const&, PCColor*)   (ICF-identical to getColor)
//
// PROVENANCE / DECODE:
//   raw-port/re/disasm/OZMaterialGenericSubstanceIF.selection.s                @0x08ec90
//   raw-port/re/disasm/OZMaterialGenericSubstanceIF.getColor.s                 @0x08ecb0
//   raw-port/re/disasm/OZMaterialGenericSubstanceIF.getSequenceColorChannelIF.s  @0x08ed40
//   raw-port/re/disasm/OZMaterialGenericSubstanceIF.getSequenceOpacityChannelIF.s @0x08ed50
//   raw-port/re/disasm/OZMaterialGenericSubstanceIF.flatSelection.s            @0x4c1aa0
//   raw-port/re/disasm/OZMaterialGenericSubstanceIF.flatColor.s                @0x4c1ac0
//
// EXTERNAL SYMBOLS REFERENCED (unported — throwing/opaque stubs cite address):
//   _kCMTimeZero                                — Apple public symbol, imported.
//   __ZNK9OZChannel13getValueAsIntERK6CMTimed
//                    OZChannel::getValueAsInt(CMTime const&, double) const
//                    — @tail-jmp Ozone 0x8eca8 (selection) and 0x4c1ab8 (flatSelection).
//   vtable slot +0x20 on `this`   — returns a "delegate" object.
//                                     @getColor 0x8ecc0 / @flatColor 0x4c1ad0.
//   vtable slot +0x328 on that delegate's vtable — the actual color computation.
//                                     @getColor 0x8ecc6 / @flatColor 0x4c1ad6.
//   vtable slot +0x48 on `this`   — returns the "selection" OZChannel*.
//                                     @selection 0x8ec97 / @flatSelection 0x4c1aa7.
//
// -----------------------------------------------------------------------------
// CLASS SHAPE
// -----------------------------------------------------------------------------
// OZMaterialGenericSubstanceIF is a pure-interface / mixin class (no vtable of
// its own is emitted — `python3 raw-port/army/tools/vtable.py Ozone
// OZMaterialGenericSubstanceIF` reports "no 'vtable for OZMaterialGenericSubstanceIF'
// in Ozone").  All six methods reach through the concrete-subclass's vtable at
// `this[+0x00]`.  The offsets we observe on the *concrete* instance's vtable
// are:
//   +0x20   — return-a-delegate (used by getColor / flatColor).
//             The delegate is another polymorphic object; its own vtable[+0x328]
//             is the actual color function.
//   +0x48   — return-a-channel-ptr (used by selection / flatSelection).
//
// The two `flat*` methods are byte-for-byte identical bodies to their
// non-flat siblings (linker-folded @0x4c1aa0 == @0x8ec90 body up to relocations).
// This port models them as separate class methods that both call the same
// helper, matching the observable behavior; when TypeScript inlines them both
// callees will dispatch through the same vtable slots.
//
// -----------------------------------------------------------------------------
// PER-METHOD DECODE
// -----------------------------------------------------------------------------
//
// selection() / flatSelection()  @0x8ec90 / @0x4c1aa0
//   __ZN28OZMaterialGenericSubstanceIF9selectionEv:
//     pushq %rbp; movq %rsp,%rbp
//     movq   (%rdi),%rax                    ; rax = this->vtable
//     callq  *0x48(%rax)                    ; rax = this->vtable[0x48](this)
//                                            ; observed return: OZChannel*
//     movq   _kCMTimeZero(%rip),%rsi        ; rsi = &kCMTimeZero
//     xorps  %xmm0,%xmm0                    ; xmm0 = 0.0
//     movq   %rax,%rdi                      ; rdi = OZChannel* (returned above)
//     popq   %rbp
//     jmp    OZChannel::getValueAsInt(CMTime const&, double) const   ; tail-call
//
//   → In TS: return channel.getValueAsInt(kCMTimeZero, 0.0)
//
// getColor(CMTime const& t, PCColor* out) / flatColor(...)
//                                                          @0x8ecb0 / @0x4c1ac0
//   pushq %rbp; movq %rsp,%rbp; pushq %r14; pushq %rbx
//   movq  %rdx,%rbx                         ; rbx = out
//   movq  %rsi,%r14                         ; r14 = &t
//   movq  (%rdi),%rax                       ; rax = this->vtable
//   callq *0x20(%rax)                       ; rax = this->vtable[0x20](this)  (delegate)
//   movq  (%rax),%rcx                       ; rcx = delegate->vtable
//   movq  0x328(%rcx),%rcx                  ; rcx = delegate->vtable[0x328]
//   xorps %xmm0,%xmm0                       ; xmm0 = 0.0
//   movq  %rax,%rdi                         ; rdi = delegate
//   movq  %r14,%rsi                         ; rsi = &t
//   movq  %rbx,%rdx                         ; rdx = out
//   popq  %rbx; popq %r14; popq %rbp
//   jmpq  *%rcx                             ; tail-call vtable[0x328]
//
//   → In TS: delegate.vtableColorSlot0x328(t, out, 0.0)
//
// getSequenceColorChannelIF() / getSequenceOpacityChannelIF()
//                                                          @0x8ed40 / @0x8ed50
//   Both bodies:
//     pushq %rbp; movq %rsp,%rbp; xorl %eax,%eax; popq %rbp; retq
//   → Return `null` (nullptr).  These are default-nil hooks on the interface;
//     concrete subclasses override.

import type { CMTime } from "../infra/CMTime.js";
import { kCMTimeZero } from "../infra/CMTime.js";

// -----------------------------------------------------------------------------
// Frontier types (opaque here)
// -----------------------------------------------------------------------------

/**
 * OZChannel — Ozone parameter-channel base.  This port uses only the
 * `getValueAsInt` method, which is called via a tail-jmp @0x8eca8 / @0x4c1ab8.
 *
 * @throws Not-yet-ported — full OZChannel port is a separate line item.
 * The specific method invoked is `OZChannel::getValueAsInt(CMTime const&, double) const`
 * (mangled __ZNK9OZChannel13getValueAsIntERK6CMTimed).
 */
export interface OZChannel {
  getValueAsInt(t: CMTime, mult: number): number;
}

/**
 * PCColor — Apple/Ozone RGBA color output-buffer.  Opaque here.
 * Written into by the delegate's vtable[0x328] call in getColor/flatColor
 * (rdx = %rbx = `out`).
 */
export type PCColor = unknown;

/**
 * The `delegate` object returned by `this->vtable[0x20]` on the concrete
 * OZMaterialGenericSubstanceIF-derived material.  Its own vtable[0x328]
 * is the actual color-provider function (a subclass hook we do not model here).
 *
 * Signature witnessed at getColor @0x8ecdd `jmpq *%rcx`:
 *   fn(delegate, CMTime const&, PCColor*, double xmm0=0.0)
 */
export interface OZMaterialColorDelegate {
  /**
   * Vtable slot at delegate->vtable + 0x328 — called from getColor/flatColor.
   *
   * @throws Not-yet-ported.  See Ozone @0x8ecc6 (getColor) and 0x4c1ad6 (flatColor).
   */
  colorAtVtableSlot0x328(t: CMTime, out: PCColor, extra: number): void;
}

/**
 * Concrete subclass hooks — the primary indirection.  Every method on
 * OZMaterialGenericSubstanceIF reaches through `this->vtable[SLOT]` on the
 * concrete material.  Since this port has no visibility into the concrete
 * subclass, these hooks are exposed as members on the IF and callers install
 * them.
 */
export interface OZMaterialGenericSubstanceIFHooks {
  /** vtable slot +0x20 on the concrete subclass.  Returns the color delegate.
   *  @provenance Ozone @0x8ecc0 / @0x4c1ad0 `callq *0x20(%rax)`. */
  vtableSlot_0x20_getColorDelegate(): OZMaterialColorDelegate;
  /** vtable slot +0x48 on the concrete subclass.  Returns the selection channel.
   *  @provenance Ozone @0x8ec97 / @0x4c1aa7 `callq *0x48(%rax)`. */
  vtableSlot_0x48_getSelectionChannel(): OZChannel;
}

// -----------------------------------------------------------------------------
// The port
// -----------------------------------------------------------------------------

/**
 * OZMaterialGenericSubstanceIF — pure interface / mixin.  Has no vtable of
 * its own (see PROVENANCE header).  Six methods, all thin wrappers.
 *
 * @provenance Ozone @0x8ec90..0x8ed58 and @0x4c1aa0..0x4c1aef.
 */
export class OZMaterialGenericSubstanceIF {
  /**
   * The concrete-subclass hooks.  Callers instantiating an
   * OZMaterialGenericSubstanceIF must supply these; without them the class
   * cannot dispatch, matching the C++ reality that this IF is meaningless
   * without a concrete subclass installing its vtable.
   */
  readonly hooks: OZMaterialGenericSubstanceIFHooks;

  constructor(hooks: OZMaterialGenericSubstanceIFHooks) {
    this.hooks = hooks;
  }

  /**
   * selection() — @Ozone 0x8ec90.
   *
   *   channel = this->vtable[0x48](this)                @0x8ec97
   *   return channel->getValueAsInt(kCMTimeZero, 0.0)   @0x8eca8 (tail-jmp)
   */
  selection(): number {
    const channel = this.hooks.vtableSlot_0x48_getSelectionChannel(); // @0x8ec97
    return channel.getValueAsInt(kCMTimeZero, 0.0);                    // @0x8eca8
  }

  /**
   * flatSelection() — @Ozone 0x4c1aa0.  ICF-identical body to selection() —
   * same asm, same effective behavior on any concrete subclass whose vtable
   * slots at +0x48 are the same.  Ported as a distinct method to preserve the
   * public interface surface; the underlying dispatch is identical.
   */
  flatSelection(): number {
    const channel = this.hooks.vtableSlot_0x48_getSelectionChannel(); // @0x4c1aa7
    return channel.getValueAsInt(kCMTimeZero, 0.0);                    // @0x4c1ab8
  }

  /**
   * getColor(t, out) — @Ozone 0x8ecb0.
   *
   *   delegate = this->vtable[0x20](this)               @0x8ecc0
   *   fn = delegate->vtable[0x328]                       @0x8ecc6
   *   fn(delegate, &t, out, 0.0 xmm0)                @0x8ecdd (tail-jmp)
   *
   * The 4th argument (xmm0=0.0) is a `double` passed via xorps clearing.
   */
  getColor(t: CMTime, out: PCColor): void {
    const delegate = this.hooks.vtableSlot_0x20_getColorDelegate(); // @0x8ecc0
    delegate.colorAtVtableSlot0x328(t, out, 0.0);                    // @0x8ecdd
  }

  /**
   * flatColor(t, out) — @Ozone 0x4c1ac0.  ICF-identical body to getColor() —
   * same delegate lookup, same vtable[0x328] tail call.
   */
  flatColor(t: CMTime, out: PCColor): void {
    const delegate = this.hooks.vtableSlot_0x20_getColorDelegate(); // @0x4c1ad0
    delegate.colorAtVtableSlot0x328(t, out, 0.0);                    // @0x4c1aed
  }

  /**
   * getSequenceColorChannelIF() — @Ozone 0x8ed40.
   *
   *   xorl %eax,%eax; retq   →   returns null.
   *
   * Default-nil hook.  Concrete subclasses override to return a real
   * OZChannelIF; the base returns nullptr.
   */
  getSequenceColorChannelIF(): null {
    return null; // @0x8ed44 `xorl %eax,%eax`
  }

  /**
   * getSequenceOpacityChannelIF() — @Ozone 0x8ed50.
   *
   *   xorl %eax,%eax; retq   →   returns null.
   *
   * Default-nil hook. Concrete subclasses override to return a real
   * OZChannelIF; the base returns nullptr.
   */
  getSequenceOpacityChannelIF(): null {
    return null; // @0x8ed54 `xorl %eax,%eax`
  }
}
