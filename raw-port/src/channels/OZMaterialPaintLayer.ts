// OZMaterialPaintLayer.ts — raw transcription of the Ozone class
// `OZMaterialPaintLayer`.
//
// ONE symbol is transcribed in this file — `colorChannel()`. Every other member
// of the class is a SEPARATE ledger unit and is NOT ported here; do not add
// them without their own disassembly and address citations. The neighbours, for
// orientation only (addresses from the cached x86_64 inventory
// `raw-port/army/inventory/Ozone.syms.txt`, each its own unit):
//   0x621e40  getSequenceColorChannel()      [NOT a leaq accessor — it calls
//             OZMaterialLayerBase::getSequenceChannels() and adds 0x80]
//   0x621e50  getSequenceOpacityChannel()
//   0x621e70  colorChannel()                 <-- ported here
//   0x621e80  fresnelDiffuseIntensityChannel()
//   0x621e90  fresnelSpecularIntensityChannel()
//   0x621ea0  fresnelSpecularShininessChannel()
//   0x621eb0  fresnelFaceForegroundChannel()
//   0x621ec0  fresnelEdgeForegroundChannel()
//   0x621ed0  fresnelExponentChannel()
//   0x621ee0  sequenceChannels()
//   0x621ef0  objectManipulator()
//   0x621f00  getSequenceColorChannelIF()
//   0x621f10  getCarPaintType()
//   0x621f20  getAlpha()
//   0x621f30  getGlossiness()
//   0x621f40  getColorType()
//   0x621f50  getSurfaceType()
//   0x61edf0  clone() const   [the source of the object SIZE below]
//   0x621f60  __ZThn6680_N20OZMaterialPaintLayer12colorChannelEv — the
//             non-virtual thunk for THIS method on a secondary base (adjusts
//             `this` by -6680 = -0x1a18 and jumps here). Its own unit; a caller
//             reaching the class through that base enters at 0x621f60, not
//             0x621e70.
//
// Provenance (Ozone framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Symbol ported in this file:
//   @0x621e70  OZMaterialPaintLayer::colorChannel()
//                __ZN20OZMaterialPaintLayer12colorChannelEv   (LOCAL, `t`)
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym __ZN20OZMaterialPaintLayer12colorChannelEv Ozone`):
//   raw-port/re/disasm/__ZN20OZMaterialPaintLayer12colorChannelEv.s  (7 lines)
//
// ---------------------------------------------------------------------------
// FULL DISASM — the whole function, every instruction
// ---------------------------------------------------------------------------
//   0x621e70  pushq %rbp                ; frame setup (no TS counterpart)
//   0x621e71  movq  %rsp, %rbp          ; frame setup (no TS counterpart)
//   0x621e74  leaq  0x1c28(%rdi), %rax  ; %rax = this + 0x1c28 — the ADDRESS of
//                                       ; the embedded channel, not a load
//   0x621e7b  popq  %rbp                ; frame teardown
//   0x621e7c  retq                      ; returns %rax
//   0x621e7d  nopl  (%rax)              ; alignment padding, not executed
//
// ---------------------------------------------------------------------------
// LAYOUT
// ---------------------------------------------------------------------------
// One field is observable from this body: an embedded channel subobject at
// **+0x1c28**. The object is 0x3708 bytes — `clone()` @0x61edfa allocates
// `movl $0x3708, %edi` before calling the copy ctor — so this member sits well
// inside it and is NOT the last one. What IS the last one, and the reason to
// trust the 0x98 channel stride this family uses: the six fresnel accessors
// step +0x3378, +0x3410, +0x34a8, +0x3540, +0x35d8, +0x3670 — exactly 0x98
// apart — and 0x3670 + 0x98 = 0x3708, the allocation size. (Same stride the
// landed OZMaterialDiffuseLayer note records.)
//
// Nothing else about the layout is observable from THIS function, so nothing
// else is modelled here. The other leaq-accessor offsets, for orientation only:
// +0x1a28 getCarPaintType, +0x1b28 getColorType, +0x30b0 getGlossiness,
// +0x3148 getSurfaceType, +0x32e0 getAlpha, and the six fresnel channels above.
// Note +0x1b28 and +0x1a28 sit 0x100 and 0x200 BELOW this one, so an off-by-a-
// neighbour transcription would return a plausible pointer into the same
// object — which is why the oracle below drives those offsets as controls.
//
// ---------------------------------------------------------------------------
// AN ADDRESS-OF IS THE ANSWER, NOT A GAP
// ---------------------------------------------------------------------------
// `leaq` COMPUTES an address; it does not dereference. The function therefore
// returns a pointer to the embedded subobject and reads no memory at all — it
// is a complete, fully decoded body, not an undecoded stub, and must not be
// modelled as a throw. Landed precedent of exactly this shape:
// `OZMaterialDiffuseLayer::environmentIntensityChannel()` @0x61b2e0
// (`leaq 0x4290(%rdi), %rax`) and `OZMaterialFresnelLayer::colorChannel()`
// @0x34c910 (`leaq 0x4d0(%rdi), %rax`).
//
// CALLEES: none. No in-scope call, no extern, no allocation, no indirect and no
// virtual dispatch — `depgraph.py deps __ZN20OZMaterialPaintLayer12colorChannelEv`
// lists nothing. (Contrast the neighbour at 0x621e40, which DOES call
// `OZMaterialLayerBase::getSequenceChannels()`; it is a different unit.)
//
// ---------------------------------------------------------------------------
// ORACLE — verified by CALLING the live function
// ---------------------------------------------------------------------------
// raw-port/re/oracle/OZMaterialPaintLayer_colorChannel_oracle.py
// The symbol is LOCAL (`nm` type `t`), so dlsym cannot reach it; the harness
// goes through raw-port/re/oracle/ozone_loader.py (depth-first @rpath preload —
// Ozone does load outside the app bundle) and calls the function at
// `dyld slide + 0x621e70`, under `arch -x86_64 /usr/bin/python3` so the process
// runs the same x86_64 slice this file was transcribed from.
//
// Results (2026-08-11, Ozone slide 0x124e13000, call @0x125434e70):
//   * byte self-check PASS — the 13 bytes at slide+0x621e70 are
//     `55 48 89 e5 48 8d 87 28 1c 00 00 5d c3`, and the disp32 `28 1c 00 00`
//     reads back as 0x1c28, settling the displacement from the machine code
//     rather than from the disassembler's operand column.
//   * 98 `this` values (NULL, poison, 0x4141414141414141, 1, 0xdeadbeef, and
//     every 0x98-byte step through a real 0x3708-byte object): 98 agreements,
//     0 divergences — the live function returns exactly `this + 0x1c28` every
//     time.
//   * 0 of 14,088 poison bytes modified — confirms live that the body reads and
//     writes no memory.
//   * negative controls, each of which MUST be caught: +0x1b28 (getColorType,
//     the neighbour 0x100 below) 98/98, +0x1a28 (getCarPaintType) 98/98,
//     +0x3378 (fresnelDiffuseIntensity) 98/98, +0x1c20 (off by 8) 98/98, +0x0
//     (returns `this`) 98/98, dereference-instead-of-address 98/98. No dead
//     control.
//   * layout check printed by the same run: 0x1c28 + 0x98 = 0x1cc0, inside
//     sizeof 0x3708 (so this is NOT the last member), and the last fresnel
//     channel 0x3670 + 0x98 == 0x3708 == sizeof.

/**
 * The embedded channel subobject this accessor hands back a pointer to.
 *
 * Opaque on purpose: `colorChannel()` only computes the ADDRESS of this field
 * (`leaq`), so its contents are not observable from the one body transcribed in
 * this file. The channel's own members belong to `OZChannel`/`OZChannelBase`
 * and to the ctor unit that initialises it.
 */
export interface OZChannelLike {
  readonly __OZChannel_opaque: unique symbol;
}

/**
 * `OZMaterialPaintLayer` — Ozone's paint material layer.
 *
 * Only the one field the transcribed accessor addresses is modelled; the object
 * is 0x3708 bytes (see the LAYOUT note in the file header) and the rest of it
 * belongs to the ctor / sibling-accessor units.
 *
 * @Ozone 0x621e70
 */
export class OZMaterialPaintLayer {
  /**
   * The embedded colour channel at **+0x1c28**.
   *
   * @Ozone 0x621e74
   */
  colorChannelAt0x1c28!: OZChannelLike;

  /**
   * `OZMaterialPaintLayer::colorChannel()` — @Ozone 0x621e70
   *   __ZN20OZMaterialPaintLayer12colorChannelEv
   *
   * Returns the address of the channel embedded at `this + 0x1c28`. Full
   * transcription — every instruction, in order:
   *
   *   0x621e70  pushq %rbp               ; frame setup (no TS counterpart)
   *   0x621e71  movq  %rsp, %rbp         ; frame setup (no TS counterpart)
   *   0x621e74  leaq  0x1c28(%rdi), %rax ; %rax = this + 0x1c28
   *   0x621e7b  popq  %rbp               ; frame teardown
   *   0x621e7c  retq                     ; returns %rax
   *
   * Decode notes:
   *   * `leaq` computes an address and does NOT dereference, so the returned
   *     value is a pointer TO the subobject — returning the subobject's
   *     contents (a load) would be a different function. Confirmed live: the
   *     0xCD-poisoned object is byte-identical after 98 calls.
   *   * the displacement really is 0x1c28: the disp32 bytes at 0x621e77 are
   *     `28 1c 00 00`, checked in the oracle against the mapped image rather
   *     than taken from the disassembler's operand column (a landed sibling
   *     records `otool -tV` printing an unrelated ObjC selector in exactly this
   *     position when a local symbol happens to sit at the displacement's VA).
   *   * no field of `this` is read, so the result depends only on the pointer.
   *   * a caller arriving through the secondary base enters the thunk
   *     `__ZThn6680_...` @0x621f60, which subtracts 0x1a18 from `this` and
   *     jumps here; that adjustment is the thunk's, not this body's.
   *
   * @returns the address of the field at `this + 0x1c28`.
   */
  colorChannel(): OZChannelLike {
    // @0x621e74 — leaq 0x1c28(%rdi), %rax : the address of the embedded channel.
    return this.colorChannelAt0x1c28;
  }
}
