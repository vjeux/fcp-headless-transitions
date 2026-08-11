// OZEffect.ts — raw transcription of Ozone `OZEffect`.
//
// Ozone's effect object: the thing an OZSceneNode hangs filters/generators off.
// It is a large class (84 symbols in the x86_64 slice) that sits under
// OZChannelBase/OZObjectManipulator and supplies the DEFAULT implementation of
// the render-scheduling interface, which concrete effects override.
//
// NOTE ON THE NAME: this is the C++ class `OZEffect` (Itanium `8OZEffect`), a
// DIFFERENT class from `OZEffect_Base` (Itanium `13OZEffect_Base`), which is
// already ported in this layer as OZEffect_Base.ts. `OZEffect_Base` is that
// class's literal C++ name, not a nested `OZEffect::Base`, so the two files are
// correctly distinct and neither is the `Outer__Inner` nested-class form.
//
// Provenance (Ozone framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Symbol ported in this file — ONE method:
//   @0xfad70  OZEffect::prerollEnd(OZRenderParams const&, PMFrameRequest&)
//               __ZN8OZEffect10prerollEndERK14OZRenderParamsR14PMFrameRequest
//
// Source disassembly (re-derived from the binary in this worktree with
// `raw-port/tools/disasm.sh --sym
//  __ZN8OZEffect10prerollEndERK14OZRenderParamsR14PMFrameRequest Ozone`):
//   raw-port/re/disasm/__ZN8OZEffect10prerollEndERK14OZRenderParamsR14PMFrameRequest.s
//   (7 lines)
//
// Every other OZEffect member is a SEPARATE ledger unit and is NOT ported here.
// Later units extend THIS file, ADD-only.
//
// ---------------------------------------------------------------------------
// WHERE THIS METHOD SITS: the default token/preroll scheduling block
// ---------------------------------------------------------------------------
// `prerollEnd` is one entry in a contiguous run of 0x10-spaced default
// implementations covering the whole render-scheduling protocol:
//
//   0xfad10  openMedia()
//   0xfad20  remapTokens(OZRenderParams const&, vector<pair<CMTime, vector<CMTime>>>&, PMFrameRequest&)
//   0xfad30  scheduleTokens(...)
//   0xfad40  hintTokensWillImage(...)
//   0xfad50  getTokensImage(...)
//   0xfad60  prerollBegin(OZRenderParams const&, PMFrameRequest&, double, FFPrerollSync*)
//   0xfad70  prerollEnd(OZRenderParams const&, PMFrameRequest&)          <- ported here
//   0xfad80  setRate(OZRenderParams const&, PMFrameRequest&, double)
//   0xfad90  pruneTokensAtTime(CMTime const&, char const*)
//   0xfada0  pruneTokensExceptAtTime(CMTime const&, char const*)
//   0xfadb0  pruneAllTokens(char const*)
//
// Its two immediate neighbours were disassembled as corroboration (LAYOUT/shape
// evidence only — they are their own ledger units and are NOT ported here) and
// have byte-identical bodies:
//   prerollBegin @0xfad60: push rbp / mov rbp,rsp / xor eax,eax / pop rbp / ret
//   setRate      @0xfad80: push rbp / mov rbp,rsp / xor eax,eax / pop rbp / ret
// i.e. the base class accepts the whole preroll protocol and does nothing,
// letting concrete effects override only the hooks they need.
//
// CALLEES: none. No in-scope call, no extern, no virtual and no indirect
// dispatch (`depgraph.py deps` lists nothing for this symbol).

/**
 * `OZEffect` — Ozone's effect object.
 *
 * No fields are declared yet: the one method ported here never reads `this`
 * (see below). Units that port members which DO touch the object will add the
 * layout, ADD-only.
 *
 * @Ozone 0xfad70
 */
export class OZEffect {
  /**
   * `OZEffect::prerollEnd(OZRenderParams const&, PMFrameRequest&)`
   * @Ozone 0xfad70
   * (__ZN8OZEffect10prerollEndERK14OZRenderParamsR14PMFrameRequest).
   *
   * Faithful transcription of the 7-line body, quoted in full:
   *
   *   0xfad70  pushq %rbp             ; frame prologue
   *   0xfad71  movq  %rsp, %rbp
   *   0xfad74  xorl  %eax, %eax       ; return 0
   *   0xfad76  popq  %rbp             ; frame epilogue
   *   0xfad77  retq
   *   0xfad78  nopl  (%rax,%rax)      ; padding to the next 0x10 boundary —
   *                                   ;   not executed
   *
   * That is the ENTIRE function. Three facts it establishes, all of which the
   * port must preserve rather than smooth over:
   *
   *   1. `this` (%rdi) is never read — no field access, so the class needs no
   *      layout for this unit.
   *   2. `params` (%rsi, `OZRenderParams const&`) and `request` (%rdx,
   *      `PMFrameRequest&`) are never dereferenced. In particular the
   *      NON-const `PMFrameRequest&` is NOT written: there is no store
   *      anywhere in the body. A port that "ended the preroll" by touching
   *      the request would be adding work the machine does not do.
   *   3. The default answer is 0.
   *
   * The base class's default implementation of the preroll protocol is to
   * accept the call and do nothing; concrete effect subclasses override the
   * slot when they actually need to tear down preroll state.
   *
   * RETURN VALUE: `xorl %eax, %eax` zeroes the 32-bit return register. Itanium
   * mangling does not encode the return type, so the width is not recoverable
   * from the symbol; typed `number` and returning 0, matching how the landed
   * null-implementation ports in this layer (FFOZNullCurve.m1/m2/m4) type the
   * identical `xor eax,eax; ret` shape.
   *
   * DEPENDENCIES: none in-scope; no extern.
   */
  prerollEnd(_params: unknown /* OZRenderParams const& — not dereferenced */,
             _request: unknown /* PMFrameRequest& — not dereferenced, not written */): number {
    // @0xfad74  xorl %eax, %eax -> return 0.
    return 0;
  }
}
