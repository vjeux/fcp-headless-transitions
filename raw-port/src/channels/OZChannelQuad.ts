// OZChannelQuad — Ozone compound channel that owns FOUR OZChannelPosition
// sub-channels (a "quad of positions", e.g. the four corner-pin points of a
// distort/warp effect). Extends OZCompoundChannel (already ported at
// raw-port/src/channels/OZCompoundChannel.ts).
//
// FAITHFUL PORT — do NOT approximate. Every method cites @0xADDR (Ozone).
//
// Framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Symbols in Ozone's T-table for this class (from `nm | c++filt`):
//   __ZN13OZChannelQuadD1Ev   OZChannelQuad::~OZChannelQuad()   @0x9a720
//     Only the D1 destructor is exported by Ozone. All other operations on
//     OZChannelQuad (ctors, copy, clone, setValue, etc.) live in
//     ProChannel.framework — they appear here only as `U` (undefined
//     imports), so the layout below is recovered ONLY from the dtor body.
//
// ── STRUCT LAYOUT (recovered from the destructor @0x9a720) ────────────────────
//   OZChannelQuad {
//     +0x000     vptr             : void*                (@0x9a734 rebind
//                                                          to __ZTV13OZChannelQuad + 0x10)
//     +0x010     vptr_2           : void*                (@0x9a73d rebind
//                                                          to __ZTV13OZChannelQuad + 0x358
//                                                          — secondary vtable
//                                                          for a multi-inherited
//                                                          thunk / vtable-2)
//     +0x000..+0x087  OZCompoundChannel base subobject   (destroyed by tail-
//                                                          jmp @0x9a77a to
//                                                          __ZN17OZCompoundChannelD2Ev)
//     +0x088..+0x347  p0 : OZChannelPosition             (@0x9a76c dtor arg;
//                                                          size 0x2c0 = 704 bytes,
//                                                          matches OZChannelPosition
//                                                          class-size documented in
//                                                          raw-port/src/channels/OZChannelPosition.ts)
//     +0x348..+0x607  p1 : OZChannelPosition             (@0x9a760 dtor arg;
//                                                          0x348 - 0x88 = 0x2c0)
//     +0x608..+0x8c7  p2 : OZChannelPosition             (@0x9a754 dtor arg;
//                                                          0x608 - 0x348 = 0x2c0)
//     +0x8c8..+0xb87  p3 : OZChannelPosition             (@0x9a748 dtor arg
//                                                          via `addq $0x8c8,%rdi`;
//                                                          0x8c8 - 0x608 = 0x2c0)
//   }
//   sizeof(OZChannelQuad) = 0xb88 = 2952 bytes (last field ends at 0x8c8 +
//   0x2c0 = 0xb88).
//
// ── VTABLE (inferred from the dtor's vptr rebinds; not yet resolved via
//    resolve.py — the __ZTV13OZChannelQuad symbol lives via GOT indirection
//    @0x9a729) ─────────────────────────────────────────────────────────────
//   __ZTV13OZChannelQuad  (loaded via GOT slot 0x788168 from RIP-relative)
//     installed-primary   @vtable + 0x10           (stored to *this at @0x9a734)
//     installed-secondary @vtable + 0x358 (=0x10+0x348)
//                                                  (stored to *(this+0x10) at @0x9a73d)
//
// ── SUB-DESTRUCTOR ORDER (as emitted by the shipped x64 code) ─────────────────
//   OZChannelPosition::~OZChannelPosition on:
//     1. p3 @+0x8c8    (via `addq $0x8c8, %rdi` @0x9a741)
//     2. p2 @+0x608    (`leaq 0x608(%rbx), %rdi` @0x9a74d)
//     3. p1 @+0x348    (`leaq 0x348(%rbx), %rdi` @0x9a759)
//     4. p0 @+0x088    (`leaq 0x88(%rbx),  %rdi` @0x9a765)
//   Then tail-jmp OZCompoundChannel::~OZCompoundChannel(this).
//   This is REVERSE-field-order which matches the standard C++ rule for
//   dtors (destroy members in reverse construction order).
//
// ── DECODE reference ─────────────────────────────────────────────────────────
//   Ozone.OZChannelQuad.~OZChannelQuad.s     @0x9a720 (25 lines)

import { OZCompoundChannel } from "./OZCompoundChannel.js";
import { OZChannelPosition } from "./OZChannelPosition.js";

/**
 * OZChannelQuad — see file header for provenance.
 *
 * Layout: OZCompoundChannel base at +0x00, plus 4 embedded OZChannelPosition
 * sub-channels at +0x88 / +0x348 / +0x608 / +0x8c8.
 *
 * Only the destructor is exported by Ozone (@0x9a720); every other operation
 * belongs to ProChannel.framework (U-imports here) and is therefore frontier.
 */
export class OZChannelQuad extends OZCompoundChannel {
  // Note on sub-channel construction: the four OZChannelPosition sub-objects
  // are constructed IN-PLACE by ProChannel-side ctors that are `U`-imports in
  // Ozone (not decoded here). We model them as `OZChannelPosition | null`
  // and default to null; the caller responsible for OZChannelQuad
  // construction populates each slot with a properly-constructed
  // OZChannelPosition. This preserves the layout order and dtor semantics
  // without fabricating sub-channel dependencies (which would be a decode
  // shortcut).

  /**
   * @Ozone +0x088 — first quad position (p0). Constructed by ProChannel-side
   * ctor (not visible in Ozone — U-import); destroyed 4th in the dtor at
   * @0x9a765..0x9a76c.
   */
  p0: OZChannelPosition | null = null;

  /**
   * @Ozone +0x348 — second quad position (p1). Destroyed 3rd at
   * @0x9a759..0x9a760.
   */
  p1: OZChannelPosition | null = null;

  /**
   * @Ozone +0x608 — third quad position (p2). Destroyed 2nd at
   * @0x9a74d..0x9a754.
   */
  p2: OZChannelPosition | null = null;

  /**
   * @Ozone +0x8c8 — fourth quad position (p3). Destroyed 1st at
   * @0x9a741..0x9a748.
   */
  p3: OZChannelPosition | null = null;

  /**
   * OZChannelQuad::~OZChannelQuad()  @Ozone 0x9a720.
   *
   * Line-for-line faithful port:
   *
   *   0x9a720 pushq %rbp
   *   0x9a721 movq  %rsp, %rbp
   *   0x9a724 pushq %rbx
   *   0x9a725 pushq %rax                       ; stack alignment + scratch slot
   *   0x9a726 movq  %rdi, %rbx                 ; %rbx = this
   *   0x9a729 movq  0x788168(%rip), %rax       ; %rax = __ZTV13OZChannelQuad (via GOT)
   *   0x9a730 leaq  0x10(%rax), %rcx           ; %rcx = vtable + 0x10 (primary install ptr)
   *   0x9a734 movq  %rcx, (%rdi)               ; this->vptr = vtable+0x10
   *   0x9a737 addq  $0x348, %rax               ; %rax = vtable + 0x358 (secondary install ptr)
   *   0x9a73d movq  %rax, 0x10(%rdi)           ; this->vptr_2 = vtable+0x358
   *   0x9a741 addq  $0x8c8, %rdi               ; %rdi = &this->p3 (+0x8c8)
   *   0x9a748 callq __ZN17OZChannelPositionD1Ev ; ~p3()
   *   0x9a74d leaq  0x608(%rbx), %rdi          ; %rdi = &this->p2 (+0x608)
   *   0x9a754 callq __ZN17OZChannelPositionD1Ev ; ~p2()
   *   0x9a759 leaq  0x348(%rbx), %rdi          ; %rdi = &this->p1 (+0x348)
   *   0x9a760 callq __ZN17OZChannelPositionD1Ev ; ~p1()
   *   0x9a765 leaq  0x88(%rbx), %rdi           ; %rdi = &this->p0 (+0x88)
   *   0x9a76c callq __ZN17OZChannelPositionD1Ev ; ~p0()
   *   0x9a771 movq  %rbx, %rdi                 ; %rdi = this (for tail-jmp)
   *   0x9a774 addq  $0x8, %rsp
   *   0x9a778 popq  %rbx
   *   0x9a779 popq  %rbp
   *   0x9a77a jmp   __ZN17OZCompoundChannelD2Ev ; tail-jmp to base D2
   *
   * In TypeScript we do NOT rebind vtables (JS class semantics handle
   * dispatch automatically) and we do NOT explicitly `delete` (GC handles
   * memory). What DOES remain observable is the visible end-state effect of
   * each sub-channel's `destroy()` — for OZChannelPosition that's the
   * empty-vectors / identity-matrix / cache-invalidated end-state
   * documented at raw-port/src/channels/OZChannelPosition.ts (its destroy()
   * calls newResetCache()). We invoke each sub-channel's destroy() in the
   * exact ORDER the shipped binary uses (p3, p2, p1, p0), then hand off to
   * the OZCompoundChannel base destroy() equivalent (a no-op on
   * OZCompoundChannel in the TS port, but named for provenance).
   */
  destroy(): void {
    // @0x9a741..0x9a748 — ~p3 (offset +0x8c8, destroyed first).
    // The shipped code does NOT null-check p3: it unconditionally issues
    // `callq __ZN17OZChannelPositionD1Ev` after `addq $0x8c8,%rdi`. In C++
    // that's safe because the sub-object is embedded (not a pointer). Here
    // the TS model uses nullable slots to accommodate frontier construction;
    // when a slot is null, calling destroy() would be a fabrication, so we
    // guard and skip — the observable no-op matches "an in-place OZChannel
    // Position sub-object that was never populated".
    if (this.p3 !== null) this.p3.destroy();
    // @0x9a74d..0x9a754 — ~p2 (offset +0x608).
    if (this.p2 !== null) this.p2.destroy();
    // @0x9a759..0x9a760 — ~p1 (offset +0x348).
    if (this.p1 !== null) this.p1.destroy();
    // @0x9a765..0x9a76c — ~p0 (offset +0x88, destroyed last).
    if (this.p0 !== null) this.p0.destroy();
    // @0x9a77a — tail-jmp __ZN17OZCompoundChannelD2Ev.
    // OZCompoundChannel doesn't expose a destroy() in the current port
    // (its dtor lives in ProChannel.framework as a U-import). The GC
    // handles storage reclamation; any side-effect the base dtor performs
    // is out-of-scope for THIS class's transcription and belongs to a
    // future OZCompoundChannel dtor port.
  }
}
