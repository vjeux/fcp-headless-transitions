// OZMaterialDiffuseLayer.ts — raw transcription of the Ozone class
// `OZMaterialDiffuseLayer`.
//
// ONE symbol is transcribed in this file — `environmentIntensityChannel()`.
// Every other member of the class is a SEPARATE ledger unit and is NOT ported
// here; do not add them without their own disassembly and address citations.
// The neighbours, for orientation only (addresses from the cached x86_64
// inventory `raw-port/army/inventory/Ozone.syms.txt`, each its own unit):
//   0x6199b0  OZMaterialDiffuseLayer(OZFactory*, PCString const&,
//             OZChannelFolder*, unsigned int, unsigned int)          [C2]
//   0x619e50  initDiffuse()
//   0x61a990  OZMaterialDiffuseLayer(OZMaterialDiffuseLayer const&,
//             OZChannelFolder*)                                      [copy C2]
//   0x61ad40  parseEnd(PCSerializerReadStream&)
//   0x61add0  clone() const
//   0x61ae30  makeMaterialLayerSequenceChannelFolder()
//   0x61ae80  appendLayersToLayeredMaterial(LayeredMaterialInfo&)
//   0x61aea0  anyGradientChannels()
//   0x61b060  checkDeprecatedChannels()
//   0x61b2e0  environmentIntensityChannel()      <-- ported here
//   0x61b2f0  alphaChannel()
//   0x61b300  colorChannel()
//   0x61b310  gradientChannel()
//   0x61b320  imageChannel()
//   0x61b350  brightnessChannel()
//   0x61b390  selectionChannel()
//
// Provenance (Ozone framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Symbol ported in this file:
//   @0x61b2e0  OZMaterialDiffuseLayer::environmentIntensityChannel()
//                __ZN22OZMaterialDiffuseLayer27environmentIntensityChannelEv
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym
//  __ZN22OZMaterialDiffuseLayer27environmentIntensityChannelEv Ozone`):
//   raw-port/re/disasm/__ZN22OZMaterialDiffuseLayer27environmentIntensityChannelEv.s
//   (7 lines) — BUT SEE THE DISASSEMBLER WARNING BELOW; that file's rendering
//   of the one load-bearing instruction is WRONG.
//
// ---------------------------------------------------------------------------
// FULL DISASM — the whole function, every instruction
// ---------------------------------------------------------------------------
//   0x61b2e0  pushq %rbp                ; frame setup (no TS counterpart)
//   0x61b2e1  movq  %rsp, %rbp          ; frame setup (no TS counterpart)
//   0x61b2e4  leaq  0x4290(%rdi), %rax  ; %rax = this + 0x4290 — the ADDRESS of
//                                       ; the embedded channel, not a load
//   0x61b2eb  popq  %rbp                ; frame teardown
//   0x61b2ec  retq                      ; returns %rax
//   0x61b2ed  nopl  (%rax)              ; alignment padding, not executed
//
// ---------------------------------------------------------------------------
// DISASSEMBLER WARNING — `otool -tV` MISRENDERS THE DISPLACEMENT HERE
// ---------------------------------------------------------------------------
// With symbolization on (`otool -arch x86_64 -tV`, which is what
// `raw-port/tools/disasm.sh` runs, so the cached .s file inherits it) the third
// instruction prints as
//
//   0x61b2e4  leaq "-[OZMagnifyTool setSpacebarMode:zoomOut:]"(%rdi), %rax
//
// That ObjC method has nothing to do with this class. otool -V resolved the
// *displacement* 0x4290 against the symbol table, and a local ObjC method
// symbol happens to live at VA 0x4290 (`0000000000004290 t -[OZMagnifyTool
// setSpacebarMode:zoomOut:]` in the inventory). The displacement is a STRUCT
// FIELD OFFSET, not an address, so symbolizing it is meaningless.
//
// The same instruction with symbolization OFF (`otool -arch x86_64 -tv`) is
// `leaq 0x4290(%rdi), %rax`, and the machine code settles it independently:
// the encoding at 0x61b2e4 is `48 8d 87 90 42 00 00`, whose disp32 field is
// `90 42 00 00` = little-endian 0x4290. This port transcribes the number.
//
// ---------------------------------------------------------------------------
// LAYOUT
// ---------------------------------------------------------------------------
// One field is observable from this body: an embedded channel subobject at
// **+0x4290**. Three independent facts agree that this is the LAST member of
// the object:
//   * `clone()` @0x61adda allocates `movl $0x4328, %edi` bytes, so
//     sizeof(OZMaterialDiffuseLayer) = 0x4328;
//   * the channel subobjects in this family are 0x98 bytes apart (the sibling
//     OZMaterialFresnelLayer's accessors step +0x8c0, +0x958, +0x9f0, +0xa88,
//     +0xb20 — a 0x98 stride);
//   * 0x4290 + 0x98 = 0x4328, exactly the allocation size.
// Nothing else about the layout is observable from THIS function, so nothing
// else is modelled here: the sibling accessors (+0x4d0 brightness, +0x720
// alpha, +0x7b8 selection, +0x8b8 color, +0xca8 gradient, +0x2958 image) are
// their own units and are listed above for orientation only.
//
// ---------------------------------------------------------------------------
// AN ADDRESS-OF IS THE ANSWER, NOT A GAP
// ---------------------------------------------------------------------------
// `leaq` COMPUTES an address; it does not dereference. The function therefore
// returns a pointer to the embedded subobject and reads no memory at all — it
// is a complete, fully decoded body, not an undecoded stub, and must not be
// modelled as a throw. Landed precedent of exactly this shape:
// `OZMaterialFresnelLayer::colorChannel()` @0x34c910 (`leaq 0x4d0(%rdi), %rax`)
// and its six siblings in that file.
//
// CALLEES: none. No in-scope call, no extern, no allocation, no indirect and no
// virtual dispatch —
// `depgraph.py deps __ZN22OZMaterialDiffuseLayer27environmentIntensityChannelEv`
// lists nothing.
//
// ---------------------------------------------------------------------------
// ORACLE — verified by CALLING the live function
// ---------------------------------------------------------------------------
// raw-port/re/oracle/OZMaterialDiffuseLayer_environmentIntensityChannel_oracle.py
// The symbol is LOCAL (`nm` type `t`), so dlsym cannot reach it; the harness
// goes through raw-port/re/oracle/ozone_loader.py (depth-first @rpath preload —
// Ozone does load outside the app bundle) and calls the function at
// `dyld slide + 0x61b2e0`, under `arch -x86_64 /usr/bin/python3` so the process
// runs the same x86_64 slice this file was transcribed from.
//
// Results (2026-08-11):
//   * byte self-check PASS — the 13 bytes at slide+0x61b2e0 are
//     `55 48 89 e5 48 8d 87 90 42 00 00 5d c3`, and the disp32 `90 42 00 00`
//     reads back as 0x4290. This is the check that refutes the otool -V
//     rendering from the machine code itself.
//   * 119 `this` values (NULL, poison, 0x4141414141414141, and every 0x98-byte
//     step through a real 0x4328-byte object): 119 agreements, 0 divergences —
//     the live function returns exactly `this + 0x4290` every time.
//   * 0 of 17,192 poison bytes modified — confirms live that the body reads and
//     writes no memory.
//   * negative controls, each of which MUST be caught: +0x720 (alpha) 119/119,
//     +0x8b8 (color) 119/119, +0x2958 (image) 119/119, +0x4288 (off by 8)
//     119/119, +0x0 (returns `this`) 119/119, dereference-instead-of-address
//     119/119. No dead control.

/**
 * The embedded channel subobject this accessor hands back a pointer to.
 *
 * Opaque on purpose: `environmentIntensityChannel()` only computes the ADDRESS
 * of this field (`leaq`), so its contents are not observable from the one body
 * transcribed in this file. The channel's own members belong to
 * `OZChannel`/`OZChannelBase` and to the ctor unit that initialises it.
 */
export interface OZChannelLike {
  readonly __OZChannel_opaque: unique symbol;
}

/**
 * `OZMaterialDiffuseLayer` — Ozone's diffuse material layer.
 *
 * Only the one field the transcribed accessor addresses is modelled; the object
 * is 0x4328 bytes (see the LAYOUT note in the file header) and the rest of it
 * belongs to the ctor / sibling-accessor units.
 *
 * @Ozone 0x61b2e0
 */
export class OZMaterialDiffuseLayer {
  /**
   * The embedded environment-intensity channel at **+0x4290** — the last member
   * of the object (0x4290 + 0x98 == sizeof 0x4328).
   *
   * @Ozone 0x61b2e4
   */
  environmentIntensityChannelAt0x4290!: OZChannelLike;

  /**
   * `OZMaterialDiffuseLayer::environmentIntensityChannel()` — @Ozone 0x61b2e0
   *   __ZN22OZMaterialDiffuseLayer27environmentIntensityChannelEv
   *
   * Returns the address of the channel embedded at `this + 0x4290`. Full
   * transcription — every instruction, in order:
   *
   *   0x61b2e0  pushq %rbp               ; frame setup (no TS counterpart)
   *   0x61b2e1  movq  %rsp, %rbp         ; frame setup (no TS counterpart)
   *   0x61b2e4  leaq  0x4290(%rdi), %rax ; %rax = this + 0x4290
   *   0x61b2eb  popq  %rbp               ; frame teardown
   *   0x61b2ec  retq                     ; returns %rax
   *
   * Decode notes:
   *   * `leaq` computes an address and does NOT dereference, so the returned
   *     value is a pointer TO the subobject — returning the subobject's
   *     contents (a load) would be a different function. Confirmed live: the
   *     0xCD-poisoned object is byte-identical after 119 calls.
   *   * the displacement really is 0x4290. `otool -tV` prints an unrelated ObjC
   *     selector name in that operand position because a local symbol sits at
   *     VA 0x4290; the disp32 bytes `90 42 00 00` and the live differential
   *     both say 0x4290 (see the DISASSEMBLER WARNING in the file header).
   *   * no field of `this` is read, so the result depends only on the pointer.
   *
   * @returns the address of the field at `this + 0x4290`.
   */
  environmentIntensityChannel(): OZChannelLike {
    // @0x61b2e4 — leaq 0x4290(%rdi), %rax : the address of the embedded channel.
    return this.environmentIntensityChannelAt0x4290;
  }
}
