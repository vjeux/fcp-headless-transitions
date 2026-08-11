// HgcYUV420BiPlanar_luma_pack4.ts — raw transcription of Helium
// `HgcYUV420BiPlanar_luma_pack4`.
//
// One of Helium's lower-case `Hgc*` render-graph node classes: the luma
// "pack 4" stage of the YUV 4:2:0 bi-planar (Y plane + interleaved CbCr plane)
// conversion path. ONE symbol is transcribed in this file — `GetOutput`.
// Every other member of the class is a SEPARATE ledger unit and is NOT ported
// here; do not add them without their own disassembly and address citations:
//   GetProgram(HGRenderer*), InitProgramDescriptor(HGProgramDescriptor*) const,
//   shaderDescription() const, BindTexture(HGHandler*, int), Bind(HGHandler*),
//   RenderTile_AVX(HGTile*), RenderTile(HGTile*),
//   GetDOD(HGRenderer*, int, HGRect), GetROI(HGRenderer*, int, HGRect),
//   the C2/C1 ctors, the D2/D1/D0 dtors,
//   SetParameter(int, float, float, float, float), GetParameter(int, float*).
//
// Provenance (Helium framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// Symbol ported in this file:
//   @0x2fdd20  HgcYUV420BiPlanar_luma_pack4::GetOutput(HGRenderer*)
//                __ZN28HgcYUV420BiPlanar_luma_pack49GetOutputEP10HGRenderer
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym __ZN28HgcYUV420BiPlanar_luma_pack49GetOutputEP10HGRenderer Helium`):
//   raw-port/re/disasm/Helium.__ZN28HgcYUV420BiPlanar_luma_pack49GetOutputEP10HGRenderer.s (7 lines)
//
// ---------------------------------------------------------------------------
// LAYOUT
// ---------------------------------------------------------------------------
// NONE is observable from this body. The function reads no field of `this` and
// no field of the renderer: it moves `%rdi` (the `this` pointer) into the
// return register and returns. So this file models NO instance state — adding
// speculative fields would be inventing a layout the instruction stream does
// not show. The class's real field layout must come from the ctor/RenderTile
// units when those are ported.
//
// CALLEES: none. No in-scope call, no extern, no allocation, no indirect and no
// virtual dispatch (`depgraph.py deps` lists nothing for this symbol).
//
// This is the same identity-`GetOutput` shape the landed sibling ports already
// document — `HgcBT2100_HLG_OETF::GetOutput(HGRenderer*)` @Helium 0x3b12e0 and
// `HGCColorGamma_2vuy_yxzx_expand::GetOutput(HGRenderer*)` @Helium 0xfce90 are
// byte-for-byte the same three-instruction body (cited as corroboration; each
// is its own ledger unit).

/**
 * `HGRenderer` — the render-graph driver passed to `GetOutput`.
 *
 * Declared as an empty structural handle because this body never touches it:
 * the pointer arrives in `%rsi` and is never read, written or forwarded. The
 * same module-local declaration is what the landed `HGCColorGamma_*` /
 * `HgcCropShaderBlend` render ports use for the same reason.
 *
 * @Helium 0x2fdd20
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HGRenderer {}

/**
 * `HgcYUV420BiPlanar_luma_pack4` — the luma pack-4 node of the YUV 4:2:0
 * bi-planar path.
 *
 * No instance state is modelled: the one transcribed method touches `this`
 * only as an opaque pointer (see the file header).
 *
 * @Helium 0x2fdd20
 */
export class HgcYUV420BiPlanar_luma_pack4 {
  /**
   * `HgcYUV420BiPlanar_luma_pack4::GetOutput(HGRenderer*)` — @Helium 0x2fdd20
   *   __ZN28HgcYUV420BiPlanar_luma_pack49GetOutputEP10HGRenderer
   *
   * Full transcription — every instruction, in order:
   *
   *   0x2fdd20  pushq %rbp                  ; frame setup (no TS counterpart)
   *   0x2fdd21  movq  %rsp,%rbp             ; frame setup (no TS counterpart)
   *   0x2fdd24  movq  %rdi,%rax             ; return value = %rdi = `this`
   *   0x2fdd27  popq  %rbp                  ; frame teardown (no TS counterpart)
   *   0x2fdd28  retq
   *   0x2fdd29  nopl  (%rax)                ; alignment padding, not executed
   *
   * Decode notes:
   *   * `movq %rdi,%rax` is the WHOLE function: `%rdi` is the implicit `this`
   *     of a non-static member function, and `%rax` is the return register, so
   *     the node returns ITSELF as its output node.
   *   * the `HGRenderer*` argument lives in `%rsi` and is never read — the
   *     result does not depend on it. The parameter is kept (with a leading
   *     underscore) because it is part of the ABI signature this unit ports.
   *   * no field of `this` is dereferenced: there is no `(%rdi)` memory operand
   *     anywhere in the body, which is why this file models no layout.
   *   * ZERO callees: no in-scope call, no extern, no indirect or virtual
   *     dispatch (`depgraph.py deps` lists nothing).
   *
   * @param _renderer the `HGRenderer*` in %rsi — unread by this body.
   * @returns `this` — the identity output-node self-reference downstream nodes
   *          chain through when walking the render graph.
   */
  GetOutput(_renderer: HGRenderer | null): HgcYUV420BiPlanar_luma_pack4 {
    // @0x2fdd24  movq %rdi,%rax — return the `this` pointer unchanged.
    return this;
  }
}
