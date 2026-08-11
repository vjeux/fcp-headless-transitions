// HgcGradientLinearPerspective.ts — raw transcription of Helium `HgcGradientLinearPerspective`.
//
// Helium compositor leaf that renders a LINEAR gradient sampled through a full 3x3 PERSPECTIVE
// transform — the linear-gradient counterpart of the landed `HgcGradientRadialPerspective`
// (see HgcGradientRadialPerspective.ts) and a sibling of `HGGradientLinear`'s other leaves.
// ONE symbol is transcribed in this file — `GetOutput(HGRenderer*)`.
//
// Provenance (Helium framework, x86_64 slice of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium):
//
//   @0x30bcf0  HgcGradientLinearPerspective::GetOutput(HGRenderer*)
//                __ZN28HgcGradientLinearPerspective9GetOutputEP10HGRenderer
//
// Disassembly (regenerate with
//   `bash raw-port/tools/disasm.sh --sym __ZN28HgcGradientLinearPerspective9GetOutputEP10HGRenderer Helium`):
//   raw-port/re/disasm/Helium.__ZN28HgcGradientLinearPerspective9GetOutputEP10HGRenderer.s (7 lines)
//
// Every OTHER member of the class is a SEPARATE ledger unit and is deliberately NOT ported here;
// each gets ADDED to this file when its own unit is claimed (one class = one file; G6 add-only).
// Their addresses, from `nm -n -arch x86_64` (all `t`, local):
//   GetProgram @0x30aa10, InitProgramDescriptor @0x30aa40, shaderDescription @0x30ad70,
//   BindTexture @0x30adc0, Bind @0x30ae50, RenderTile_AVX @0x30af70, RenderTile @0x30b3f0,
//   GetDOD @0x30b900, GetROI @0x30b930, C2 @0x30b970, C1 @0x30bb20, D2 @0x30bb30, D1 @0x30bb80,
//   D0 @0x30bbd0, SetParameter @0x30bc20, GetParameter @0x30bca0.
//   (vtable __ZTV28HgcGradientLinearPerspective @0xa40428, typeinfo @0xa40668.)
//
// LAYOUT: none is observable from this body. It reads no field of `this` and no field of the
// renderer — there is no `(%rdi)` or `(%rsi)` memory operand anywhere in the seven lines. The real
// field layout (the aligned scratch parameter block the radial siblings document at +0x198) must
// come from the ctor/RenderTile/SetParameter units when those are claimed; asserting it here would
// be inventing a layout this instruction stream does not show.
//
// CALLEES: none. No in-scope call, no extern, no allocation, no indirect and no virtual dispatch
// (`depgraph.py deps` lists nothing for this symbol).

/**
 * `HGRenderer` — the render-graph driver passed to `GetOutput`.
 *
 * Declared as an empty structural handle because this body never touches it: the pointer arrives
 * in %rsi and is never read, written or forwarded. Same module-local declaration, for the same
 * reason, as the landed `HgcYUV420BiPlanar_luma_pack4`.
 *
 * @Helium 0x30bcf0
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HGRenderer {}

/**
 * `HgcGradientLinearPerspective` — the perspective-transformed linear-gradient leaf.
 *
 * No instance state is modelled: the one transcribed method touches `this` only as an opaque
 * pointer (see the file header).
 *
 * @Helium 0x30bcf0
 */
export class HgcGradientLinearPerspective {
  /**
   * `HgcGradientLinearPerspective::GetOutput(HGRenderer*)` — @Helium 0x30bcf0
   *   `__ZN28HgcGradientLinearPerspective9GetOutputEP10HGRenderer`
   *
   * FULL transcription — every instruction, in order:
   *
   *   0x30bcf0  pushq %rbp                  ; frame setup (no TS counterpart)
   *   0x30bcf1  movq  %rsp,%rbp             ; frame setup (no TS counterpart)
   *   0x30bcf4  movq  %rdi,%rax             ; return value = %rdi = `this`
   *   0x30bcf7  popq  %rbp                  ; frame teardown (no TS counterpart)
   *   0x30bcf8  retq
   *   0x30bcf9  nopl  (%rax)                ; alignment padding, not executed
   *
   * Decode notes:
   *   * `movq %rdi,%rax` is the WHOLE function: %rdi is the implicit `this` of a non-static member
   *     function and %rax is the return register, so the node returns ITSELF as its output node —
   *     the leaf IS the graph output.
   *   * the `HGRenderer*` argument lives in %rsi and is never read; the result does not depend on
   *     it. The parameter is kept (underscore-prefixed) because it is part of the ABI signature
   *     this unit ports.
   *   * no field of `this` is dereferenced, which is why this file models no layout.
   *   * ZERO callees, no branch, no indirect or virtual dispatch.
   *   * byte-for-byte the same body as the landed siblings
   *     `HgcGradientRadialPerspective::GetOutput` @Helium 0x310940 and
   *     `HgcYUV420BiPlanar_luma_pack4::GetOutput` @Helium 0x2fdd20 (cited as corroboration; each is
   *     its own ledger unit).
   *
   * ORACLE (executed against live FCP, not read). The symbol is `t` (local) and therefore not
   * dlsym-able, so it was called BY ADDRESS in a Rosetta x86_64 process — `arch -x86_64
   * /usr/bin/python3` — at `_dyld_get_image_vmaddr_slide(Helium) + 0x30bcf0`, with the vmaddr taken
   * from `nm -n -arch x86_64` (never a bare `nm`, which reports the arm64 slice even under Rosetta:
   * OPS_LOG, worker 1, 2026-08-10). Called with four distinct `this` pointers and a non-null
   * renderer: live FCP returned the `this` pointer unchanged every time, and returned it unchanged
   * with a null renderer too — the identity this port implements.
   *
   * @param _renderer the `HGRenderer*` in %rsi — unread by this body.
   * @returns `this` — the identity output-node self-reference downstream nodes chain through.
   */
  GetOutput(_renderer: HGRenderer | null): HgcGradientLinearPerspective {
    // @0x30bcf4  movq %rdi,%rax — return the `this` pointer unchanged.
    return this;
  }
}
