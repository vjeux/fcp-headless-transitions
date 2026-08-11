// HgcMaskCompReplace.ts — raw transcription of Ozone `HgcMaskCompReplace`.
//
// An `Hgc*` render-graph node that lives in OZONE, not Helium — worth stating up front, because
// every other landed `Hgc*` port in this tree is a Helium class and the prefix invites the wrong
// assumption. Its symbols are Ozone's (`raw-port/army/inventory/Ozone.syms.txt`), and it carries a
// nested `HgcMaskCompReplace::State` with its own operator new/delete @0x688bd0 / @0x6b8a30.
// ONE symbol is transcribed in this file — `GetOutput(HGRenderer*)`.
//
// Provenance (Ozone framework, x86_64 slice of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone):
//
//   @0x6b8d90  HgcMaskCompReplace::GetOutput(HGRenderer*)
//                __ZN18HgcMaskCompReplace9GetOutputEP10HGRenderer
//
// Disassembly (regenerate with
//   `bash raw-port/tools/disasm.sh --sym __ZN18HgcMaskCompReplace9GetOutputEP10HGRenderer Ozone`):
//   raw-port/re/disasm/__ZN18HgcMaskCompReplace9GetOutputEP10HGRenderer.s (9 lines)
//
// Every OTHER member of the class is a SEPARATE ledger unit and is deliberately NOT ported here;
// each gets ADDED to this file when its own unit is claimed (one class = one file; G6 add-only).
// Their addresses, from the inventory:
//   GetProgram @0x6b60a0, InitProgramDescriptor @0x6b60f0, shaderDescription @0x6b62d0,
//   BindTexture @0x6b6300, Bind @0x6b6390, RenderTile_AVX @0x6b6400, RenderTile @0x6b77f0,
//   GetDOD @0x6b88a0, GetROI @0x6b8900, C2 @0x6b8960, C1 @0x6b8a60, D2 @0x6b8a80, D1 @0x6b8ad0,
//   D0 @0x6b8af0, SetParameter @0x6b8b20, GetParameter @0x6b8cc0, and the nested State's
//   operator new @0x688bd0, State::State @0x6b8a10 and operator delete @0x6b8a30.
//
// LAYOUT: none is observable from this body. It stores its two arguments into its OWN stack frame
// and reads one of them straight back; no field of `this` and no field of the renderer is touched.
//
// CALLEES: none. No call, no branch, no extern, no indirect or virtual dispatch
// (`depgraph.py deps` lists nothing for this symbol).

/**
 * `HGRenderer` — the render-graph driver passed to `GetOutput`.
 *
 * An empty structural handle: the pointer is spilled to the stack and never read back. Same
 * module-local declaration, for the same reason, as the landed `HgcYUV420BiPlanar_luma_pack4`.
 *
 * @Ozone 0x6b8d90
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HGRenderer {}

/**
 * `HgcMaskCompReplace` — Ozone's mask-composite "replace" render node.
 *
 * No instance state is modelled: the one transcribed method touches `this` only as an opaque
 * pointer (see the file header).
 *
 * @Ozone 0x6b8d90
 */
export class HgcMaskCompReplace {
  /**
   * `HgcMaskCompReplace::GetOutput(HGRenderer*)` — @Ozone 0x6b8d90
   *   `__ZN18HgcMaskCompReplace9GetOutputEP10HGRenderer`
   *
   * FULL transcription — every instruction, in order:
   *
   *   0x6b8d90  pushq %rbp                  ; frame setup (no TS counterpart)
   *   0x6b8d91  movq  %rsp,%rbp             ; frame setup (no TS counterpart)
   *   0x6b8d94  movq  %rdi,-0x8(%rbp)       ; spill `this` into this function's OWN frame
   *   0x6b8d98  movq  %rsi,-0x10(%rbp)      ; spill the renderer argument, likewise
   *   0x6b8d9c  movq  -0x8(%rbp),%rax       ; reload the spilled `this` as the return value
   *   0x6b8da0  popq  %rbp                  ; frame teardown (no TS counterpart)
   *   0x6b8da1  retq
   *   0x6b8da2  nopw  %cs:(%rax,%rax)       ; alignment padding, not executed
   *
   * The node returns ITSELF as its output node — the leaf IS the graph output.
   *
   * THE TWO STORES ARE NOT STATE. Both write to `-0x8(%rbp)` and `-0x10(%rbp)`, i.e. into this
   * call's own stack frame below %rbp, which is dead the moment `retq` executes. They are the
   * unoptimised (-O0) argument-spill prologue clang emits when it has not been told to keep
   * arguments in registers; the reload at 0x6b8d9c is the same value that arrived in %rdi. So the
   * observable behaviour is exactly `return this`, and the port must NOT model a field write for
   * them: no offset of `this` is touched anywhere in the body.
   *
   * That is also the only interesting difference from the landed identity-`GetOutput` siblings,
   * which were compiled optimised and are three instructions —
   * `HgcYUV420BiPlanar_luma_pack4::GetOutput` @Helium 0x2fdd20 and
   * `HgcGradientRadialPerspective::GetOutput` @Helium 0x310940 both just `movq %rdi,%rax`. Same
   * semantics, different codegen; cited as corroboration, each its own ledger unit.
   *
   * ORACLE (executed against live FCP, not read). The symbol is exported (`T`), so it was dlsym'd
   * from Ozone in a Rosetta x86_64 process — `arch -x86_64 /usr/bin/python3` — after preloading
   * Ozone's `@rpath` chain depth-first (44 images, 0 failures). Called with four distinct `this`
   * pointers and a non-null renderer, plus once with a NULL renderer: live Ozone returned the
   * `this` pointer unchanged in all five, which is exactly what this port returns.
   *
   * @param _renderer the `HGRenderer*` in %rsi — spilled and never read.
   * @returns `this` — the identity output-node self-reference.
   */
  GetOutput(_renderer: HGRenderer | null): HgcMaskCompReplace {
    // @0x6b8d94/@0x6b8d98 — the two spills write only this frame's scratch, never the object.
    // @0x6b8d9c — movq -0x8(%rbp),%rax : reload the spilled `this` and return it.
    return this;
  }
}
