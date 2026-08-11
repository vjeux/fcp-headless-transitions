// OZMaterialSpecularLayer.ts — raw transcription of one symbol of the Ozone class
// `OZMaterialSpecularLayer`.
//
// ONE symbol is transcribed in this file: the NON-VIRTUAL THUNK
// `__ZThn1224_N23OZMaterialSpecularLayer39specularShininessImageDeprecatedChannelEv` @0x497dc0.
// Every other member of the class is a SEPARATE ledger unit and is NOT ported here — including the
// PRIMARY-vtable body of this same accessor at 0x497b50, which is its own unit and is deliberately
// left for whoever is handed it. Neighbours, for orientation only (addresses from the cached
// x86_64 inventory `raw-port/army/inventory/Ozone.syms.txt`, each its own unit):
//   0x497b50  OZMaterialSpecularLayer::specularShininessImageDeprecatedChannel()   [primary view]
//   0x497dc0  non-virtual thunk to the same                                        <-- ported here
//
// Provenance (Ozone framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Source disassembly (re-derived with `raw-port/tools/disasm.sh --sym
// __ZThn1224_N23OZMaterialSpecularLayer39specularShininessImageDeprecatedChannelEv Ozone`):
//   raw-port/re/disasm/__ZThn1224_N23OZMaterialSpecularLayer39specularShininessImageDeprecated
//   ChannelEv.s (7 lines)
//
// ---------------------------------------------------------------------------
// FULL DISASM — the whole function, every instruction
// ---------------------------------------------------------------------------
//   0x497dc0  55              pushq %rbp                ; frame setup (no TS counterpart)
//   0x497dc1  48 89 e5        movq  %rsp, %rbp          ; frame setup (no TS counterpart)
//   0x497dc4  48 8d 87 18 2f 00 00
//                             leaq  0x2f18(%rdi), %rax  ; %rax = this + 0x2f18 — the ADDRESS of the
//                                                       ; embedded channel, not a load
//   0x497dcb  5d              popq  %rbp                ; frame teardown (no TS counterpart)
//   0x497dcc  c3              retq                      ; returns %rax
//   0x497dcd  0f 1f 00        nopl  (%rax)              ; alignment padding, not executed
//
// The displacement is read off the MACHINE CODE, not off `otool -tV`'s operand rendering: the
// disp32 bytes are `18 2f 00 00` = 0x2f18, checked against both the mapped image and the on-disk
// thin slice by the oracle below. (A landed sibling — `OZMaterialDiffuseLayer.ts` @0x61b2e0 — records
// that `otool -tV` can print an unrelated ObjC selector in that operand position when a local symbol
// happens to sit at the displacement's value. It did not happen here, and it is not relied on.)
//
// ---------------------------------------------------------------------------
// WHAT A `Thn1224_` THUNK IS, AND WHY THIS BODY HAS NO `jmp`
// ---------------------------------------------------------------------------
// `__ZThn<N>_` is the entry point reached through a SECONDARY vtable of a multiply-inherited class:
// it receives a `this` pointing at the secondary base subobject, N bytes into the complete object,
// and must reach the same member the primary-view body reaches. The usual shape is
// `subq $N, %rdi ; jmp <primary body>`, but this accessor is a single `leaq`, so the compiler folded
// the adjustment into the displacement instead of emitting a call:
//
//   primary  @0x497b50   leaq 0x33e0(%rdi)      this_primary + 0x33e0
//   thunk    @0x497dc0   leaq 0x2f18(%rdi)      this_secondary + 0x2f18
//   0x33e0 - 0x2f18  =  0x4c8  =  1224  =  exactly the N in `__ZThn1224_`
//
// That arithmetic is independent confirmation that both bodies address ONE member and that the
// secondary base sits 1224 bytes into the object: the symbol name and the two displacements agree,
// and no third fact is needed. It is also why this unit calls nothing — there is no jmp, so this
// file has NO dependency on the primary body being ported, and porting it here would be a second
// unit's work done in the wrong place.
//
// CALLEES: none. No in-scope call, no extern, no allocation, no indirect and no virtual dispatch —
// `depgraph.py deps __ZThn1224_N23OZMaterialSpecularLayer39specularShininessImageDeprecatedChannelEv`
// lists nothing.
//
// ---------------------------------------------------------------------------
// ORACLE — verified by CALLING the live function (executed, not read)
// ---------------------------------------------------------------------------
// raw-port/re/oracle/OZMaterialSpecularLayer_thunk1224_oracle.py, run as
// `arch -x86_64 /usr/bin/python3 …` so the process maps the x86_64 slice this file was transcribed
// from (an address-based differential on the arm64 slice fails silently toward VERIFIED). The symbol
// is LOCAL (`nm` type `t`), so dlsym cannot reach it; the harness goes through
// `raw-port/re/oracle/ozone_loader.py` (depth-first @rpath preload) and calls
// `dyld slide + 0x497dc0` after checking the 13 opcode bytes there against the transcription above.
//
// Results (2026-08-11):
//   * byte self-check PASS — `55 48 89 e5 48 8d 87 18 2f 00 00 5d c3` at slide+0x497dc0, disp32
//     reading back as 0x2f18.
//   * 38 `this` values — NULL, 1, 8, 0x1000, 0x4141414141414141, 0x7fffffffffff0000, and every
//     0x200-byte step through a real 0x4000-byte allocation: 38 agreements with `this + 0x2f18`,
//     0 divergences.
//   * 0 of 16384 poison bytes modified — the body reads and writes no memory, confirmed live rather
//     than argued from the absence of a store.
//   * six negative controls, all killed 38/38, no dead control: the primary body's +0x33e0, the
//     adjustment applied the wrong way, off-by-8, off-by-one-byte, `this` itself, and the
//     displacement misread as decimal 2918.
//   * the SHIPPED file driven through `tsx` returns the +0x2f18 member; its three mutants
//     (+0x33e0, off-by-8, `this`) are all killed and the M0 control is not.

/**
 * The embedded channel subobject the accessor hands back a pointer to.
 *
 * Opaque on purpose: the transcribed body only computes the ADDRESS of this field (`leaq`), so its
 * contents are not observable from anything in this file. The channel's own members belong to
 * `OZChannel`/`OZChannelBase` and to the ctor unit that initialises it.
 */
export interface OZChannelLike {
  readonly __OZChannel_opaque: unique symbol;
}

/**
 * `OZMaterialSpecularLayer` as seen THROUGH ITS SECONDARY BASE — the view a `__ZThn1224_` entry
 * point receives, i.e. a pointer 1224 (0x4c8) bytes into the complete object.
 *
 * Only the one field the transcribed thunk addresses is modelled. Everything else in the object
 * belongs to the ctor and sibling-accessor units, and modelling it from here would be inventing
 * layout that no disassembly in this file grounds.
 */
export interface OZMaterialSpecularLayerSecondaryBase {
  /**
   * The embedded deprecated shininess-image channel, at **+0x2f18 from the secondary base** —
   * equivalently +0x33e0 from the complete object, which is the displacement the primary-view body
   * @0x497b50 uses.
   *
   * @Ozone 0x497dc4
   */
  specularShininessImageDeprecatedChannelAt0x2f18: OZChannelLike;
}

/**
 * `non-virtual thunk to OZMaterialSpecularLayer::specularShininessImageDeprecatedChannel()`
 *   — @Ozone 0x497dc0
 *   — `__ZThn1224_N23OZMaterialSpecularLayer39specularShininessImageDeprecatedChannelEv`
 *   — a LOCAL (`t`) symbol: `raw-port/army/inventory/Ozone.syms.txt:20238`
 *
 * Returns the address of the channel embedded at `this + 0x2f18`, where `this` is the SECONDARY
 * base pointer. Full transcription — every instruction, in order:
 *
 *   0x497dc0  pushq %rbp               ; frame setup (no TS counterpart)
 *   0x497dc1  movq  %rsp, %rbp         ; frame setup (no TS counterpart)
 *   0x497dc4  leaq  0x2f18(%rdi), %rax ; %rax = this + 0x2f18
 *   0x497dcb  popq  %rbp               ; frame teardown (no TS counterpart)
 *   0x497dcc  retq                     ; returns %rax
 *
 * Decode notes:
 *   * `leaq` computes an address and does NOT dereference, so the result is a pointer TO the
 *     subobject; returning its contents would be a different function. Confirmed live — a
 *     0xCD-poisoned object is byte-identical after 38 calls.
 *   * no field of `this` is read, so the answer depends only on the pointer. That is why the oracle
 *     can pass NULL and 0x4141414141414141 without the process minding.
 *   * the thunk does NOT jump to the primary body; the -1224 adjustment is folded into the
 *     displacement (0x33e0 - 0x2f18 = 0x4c8 = 1224), so this unit has no callee at all.
 *
 * NAMING, stated because it costs a reviewer a minute otherwise: the export carries the `_thunk1224`
 * suffix because the file will later hold the primary-view body of the SAME method name (@0x497b50,
 * a separate unit), and two exports cannot share one identifier. The cost is that G5 joins an export
 * to its disassembly by matching the text after the first underscore against the LAST Itanium
 * component, so this name cannot join and the export is FLAGGED for a reviewer rather than
 * classified. That is the correct outcome here — the alternative spelling would let a later,
 * genuinely different body land under a name that already resolved.
 *
 * @param secondaryBaseThis the secondary-base view of the object (1224 bytes into the complete one)
 * @returns the address of the field at `secondaryBaseThis + 0x2f18`
 */
export function OZMaterialSpecularLayer_specularShininessImageDeprecatedChannel_thunk1224(
  secondaryBaseThis: OZMaterialSpecularLayerSecondaryBase,
): OZChannelLike {
  // @0x497dc4 — leaq 0x2f18(%rdi), %rax : the address of the embedded channel.
  return secondaryBaseThis.specularShininessImageDeprecatedChannelAt0x2f18;
}
