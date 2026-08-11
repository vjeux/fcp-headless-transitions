// HGEquirectReorient.ts — raw transcription of Helium `HGEquirectReorient`.
//
// The 360°/equirectangular reorientation node's PUBLIC setter face: a family of tiny methods that
// either poke one byte of the node or forward to the shader-uniform buffer through the HGNode
// vtable. ONE symbol is transcribed in this file: `SetWrapTexture(bool)`.
//
// NOT to be confused with the landed `HEquirectReorientImpl` (`raw-port/src/render/
// HEquirectReorientImpl.ts`), which is a DIFFERENT C++ class — a subclass of `HgcEquirectReorient`
// carrying three overrides and no fields of its own. Checked before filing this file:
// `git ls-tree origin/main -r --name-only | grep -i equirect` lists only that one, so this is a new
// class, not a second copy of an existing one.
//
// Provenance (Helium framework, x86_64 slice of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium):
//
//   @0x4820  HGEquirectReorient::SetWrapTexture(bool)
//              __ZN18HGEquirectReorient14SetWrapTextureEb                  (nm class `T`)
//
// Disassembly (regenerate with
//   `bash raw-port/tools/disasm.sh --sym __ZN18HGEquirectReorient14SetWrapTextureEb Helium`):
//   raw-port/re/disasm/Helium.__ZN18HGEquirectReorient14SetWrapTextureEb.s (5 instructions)
//
// Every OTHER member of the class is a SEPARATE ledger unit and is deliberately NOT ported here;
// each gets ADDED to this file when its own unit is claimed (one class = one file; G6 add-only).
// From the symbol inventory (`raw-port/army/inventory/Helium.syms.txt`, all `T`):
//   C2 @0x3f20, C1 @0x3fc0, D2 @0x4060, D1 @0x40c0, D0 @0x4120, GetOutput @0x4180,
//   GetDOD @0x46a0, GetROI @0x46c0, SetTexW @0x46e0, SetTexH @0x4700, SetCol0 @0x4730,
//   SetCol1 @0x4750, SetCol2 @0x4770, SetInputPTX @0x4790, SetInputPTY @0x47c0,
//   SetInverseOutputPTX @0x47e0, SetInverseOutputPTY @0x4800.
//
// LAYOUT, as far as THIS body and the one sibling read while grounding it can prove:
//   +0x1a1  u8   wrapTexture   — written by this method, and by nothing else in this file yet.
//   +0x198  ptr  (NOT MODELLED HERE) — `SetTexW` @0x46e0 loads `0x198(%rdi)` and then dispatches
//                through ITS vtable (`movq (%rdi),%rax ; movq 0x60(%rax),%rax ; jmpq *%rax`), i.e.
//                the node holds a pointer to an HGNode-shaped uniform sink at +0x198. Recorded as
//                an observation with its address so the next unit does not re-derive it; it is not
//                a field of the interface below, because this unit neither reads nor writes it.
//
// CALLEES: none — no in-scope call, no extern, no indirect and no virtual dispatch
// (`depgraph.py deps __ZN18HGEquirectReorient14SetWrapTextureEb` lists nothing). That is the whole
// difference between this setter and its `SetTexW` neighbour, which is nothing BUT a dispatch.

/**
 * The part of an `HGEquirectReorient` instance this file can ground. Deliberately minimal: one
 * field, at the one offset the transcribed body touches. Widened by each future unit of the class.
 */
export interface HGEquirectReorientState {
  /** +0x1a1, u8 — the wrap-texture flag written by `SetWrapTexture`. */
  wrapTexture: number;
}

/**
 * `HGEquirectReorient::SetWrapTexture(bool)` — @Helium 0x4820
 *   `__ZN18HGEquirectReorient14SetWrapTextureEb`
 *
 * FULL transcription. Five instructions, one of which is the method:
 *
 *   0x4820  55                    pushq %rbp                ; prologue (no TS counterpart)
 *   0x4821  48 89 e5              movq  %rsp, %rbp          ; prologue (no TS counterpart)
 *   0x4824  40 88 b7 a1 01 00 00  movb  %sil, 0x1a1(%rdi)   ; this->wrapTexture (+0x1a1) = arg
 *   0x482b  5d                    popq  %rbp                ; epilogue
 *   0x482c  c3                    retq                      ; void
 *
 * Nothing is read — not the old value, not any other field — nothing else is written, and there is
 * no return value. A one-byte store is the entire method, with no dirty flag and no notification;
 * contrast `hgColorGamma_SetFallbackMode` @Helium 0xfb300, which calls `HGNode::ClearBits` and sets
 * a dirty byte before its own store, and this class's `SetTexW` @0x46e0, which does not store at
 * all but tail-jumps through the uniform sink's vtable. This one really is just the byte.
 *
 * THE ARGUMENT IS STORED AS THE RAW LOW BYTE OF `%sil`, and the port writes `1` or `0`. Those agree
 * for every ABI-legal call: the parameter is declared `bool`, so a conforming caller passes 0 or 1.
 * The distinction is observable only by calling the symbol with a non-canonical byte, which is
 * outside the C++ contract — measured anyway, and reported as such by the oracle: passing 0x02
 * leaves 0x02 in the byte, so the machine does no normalisation of its own. Modelling the field as
 * a number holding 1/0 follows the landed precedent for exactly this shape
 * (`hgColorGamma_SetFallbackMode`, `self.fallbackMode = mode ? 1 : 0`) and keeps one convention for
 * bool-typed fields across the port.
 *
 * ORACLE — EXECUTED against live FCP, not read:
 * `raw-port/re/oracle/HGEquirectReorient_SetWrapTexture_oracle.py`, with THIS FILE run by
 * `raw-port/re/oracle/HGEquirectReorient_SetWrapTexture_driver.mts` under
 * `node --experimental-strip-types` — this module imports nothing, so the driver loads the file as
 * committed, with no resolve hook and nothing stubbed. The symbol is exported, so `dlsym` reaches
 * it; the address is cross-checked against `slide + 0x4820` from the x86_64 inventory and the 13
 * bytes there against the transcription above, under `arch -x86_64`.
 *
 * MEASURED (2026-08-11): for both ABI-legal arguments the live store and the TypeScript field agree
 * (false -> 0, true -> 1); across all calls EXACTLY ONE byte of a 0x200-byte 0xCD-poisoned receiver
 * changed, and it was +0x1a1 — which is the evidence that "nothing else is written" is a property
 * of the machine and not just of the reading. Out of contract, 0x02 and 0xFF are stored verbatim.
 * Mutants (real copies of this file, one token changed): M0 unmutated 0 killed, M1 inverted
 * polarity 2/2, M2 constant 1 1/2, M3 constant 0 1/2 — the constants can only be caught by the one
 * case they get wrong, which is why both of them are here rather than either alone.
 *
 * @Helium 0x4820
 */
export function HGEquirectReorient_SetWrapTexture(
  self: HGEquirectReorientState,
  wrap: boolean,
): void {
  // @0x4824  movb %sil, 0x1a1(%rdi) — the one and only effect of this method.
  self.wrapTexture = wrap ? 1 : 0;
}
