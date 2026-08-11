// HgcYUV444BiPlanar_chroma.ts — raw transcription of Helium
// `HgcYUV444BiPlanar_chroma`.
//
// The chroma stage of Helium's YUV 4:4:4 bi-planar (Y plane + interleaved CbCr
// plane) conversion path. ONE symbol is transcribed in this file —
// `SetParameter(int, float, float, float, float)`. Every other member of the
// class is a SEPARATE ledger unit and is NOT ported here; do not add them
// without their own disassembly and address citations: `Setup(void*)`,
// `GetProgram(HGRenderer*)`,
// `InitProgramDescriptor(HGProgramDescriptor*) const`,
// `shaderDescription() const`, `BindTexture(HGHandler*, int)`,
// `Bind(HGHandler*)`, `RenderTile_AVX(HGTile*)`, `RenderTile(HGTile*)`,
// `GetDOD(HGRenderer*, int, HGRect)`, `GetROI(HGRenderer*, int, HGRect)`,
// the C2/C1 ctors, the D2/D1/D0 dtors, `GetParameter(int, float*)` @0x2e0020
// and `GetOutput(HGRenderer*)`.
//
// Provenance (Helium framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// Symbol ported in this file:
//   @0x2e0010  HgcYUV444BiPlanar_chroma::SetParameter(int, float, float, float, float)
//                __ZN24HgcYUV444BiPlanar_chroma12SetParameterEiffff
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym __ZN24HgcYUV444BiPlanar_chroma12SetParameterEiffff Helium`):
//   raw-port/re/disasm/Helium.__ZN24HgcYUV444BiPlanar_chroma12SetParameterEiffff.s (7 lines)
//
// ---------------------------------------------------------------------------
// LAYOUT
// ---------------------------------------------------------------------------
// NONE is observable from this body: it reads and writes no field of `this`
// (there is no `(%rdi)` memory operand anywhere) and never touches its four
// float arguments in `%xmm0..%xmm3`. So this file models NO instance state —
// the class's real field layout must come from the ctor / RenderTile units when
// those are ported.
//
// ---------------------------------------------------------------------------
// THE -1 RETURN IS THE FUNCTION, NOT A GAP
// ---------------------------------------------------------------------------
// `movl $0xffffffff,%eax ; retq` is the WHOLE body: this node REFUSES every
// parameter write, for every id, unconditionally. That is the shipped
// behaviour, not an undecoded stub — this class exposes no programmable
// parameters, and its getter agrees: `GetParameter(int, float*)` @0x2e0020 is
// byte-for-byte the same five instructions (`pushq %rbp ; movq %rsp,%rbp ;
// movl $0xffffffff,%eax ; popq %rbp ; retq`), so nothing can be written and
// nothing can be read back. (Cited as corroboration; it is its own ledger unit.)
//
// Contrast the landed `HgcBT2100_HLG_OETF::SetParameter` @Helium 0x3b1210,
// which returns the same -1 only on the REJECT path (`cmpl $0x1,%esi ; ja`)
// and otherwise stores the four floats into its scratch block: -1 is this
// family's "unsupported parameter" status code, and here it is the only path.
//
// CALLEES: none. No in-scope call, no extern, no allocation, no indirect and no
// virtual dispatch (`depgraph.py deps` lists nothing for this symbol).

/**
 * `HgcYUV444BiPlanar_chroma` — the chroma node of the YUV 4:4:4 bi-planar path.
 *
 * No instance state is modelled: the one transcribed method touches neither
 * `this` nor its arguments (see the file header).
 *
 * @Helium 0x2e0010
 */
export class HgcYUV444BiPlanar_chroma {
  /**
   * `HgcYUV444BiPlanar_chroma::SetParameter(int, float, float, float, float)`
   *   — @Helium 0x2e0010
   *   — __ZN24HgcYUV444BiPlanar_chroma12SetParameterEiffff
   *
   * Full transcription — every instruction, in order:
   *
   *   0x2e0010  pushq %rbp                  ; frame setup (no TS counterpart)
   *   0x2e0011  movq  %rsp,%rbp             ; frame setup (no TS counterpart)
   *   0x2e0014  movl  $0xffffffff,%eax      ; return value = -1
   *   0x2e0019  popq  %rbp                  ; frame teardown (no TS counterpart)
   *   0x2e001a  retq
   *   0x2e001b  nopl  (%rax,%rax)           ; alignment padding, not executed
   *
   * Decode notes:
   *   * the return type is `int`, and `movl $0xffffffff,%eax` writes the 32-bit
   *     pattern 0xffffffff, which as a SIGNED int is -1. The port returns -1
   *     (the signed reading) because that is the declared C++ return type; the
   *     bit pattern is identical either way.
   *   * the argument registers are `%rdi` = `this` (implicit, member function),
   *     `%esi` = the parameter id, and `%xmm0..%xmm3` = the four floats. NONE of
   *     them is read: there is no compare, no branch and no store in the body,
   *     so the result cannot depend on any argument.
   *   * this is NOT a throw-stub standing in for undecoded work: the binary
   *     itself returns -1 here (see the file header's `GetParameter` evidence).
   *     Modelling it as a throw would be a WRONG port — callers are meant to
   *     receive the "unsupported parameter" status.
   *   * ZERO callees: no in-scope call, no extern, no indirect or virtual
   *     dispatch (`depgraph.py deps` lists nothing).
   *
   * @param _id the parameter id in %esi — unread by this body.
   * @param _a  the first float in %xmm0 — unread.
   * @param _b  the second float in %xmm1 — unread.
   * @param _c  the third float in %xmm2 — unread.
   * @param _d  the fourth float in %xmm3 — unread.
   * @returns -1, always: the parameter is not supported.
   */
  SetParameter(
    _id: number,
    _a: number,
    _b: number,
    _c: number,
    _d: number,
  ): number {
    // @0x2e0014  movl $0xffffffff,%eax — return -1 unconditionally.
    return -1;
  }
}
