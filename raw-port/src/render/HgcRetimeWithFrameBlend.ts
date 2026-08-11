// HgcRetimeWithFrameBlend.ts — raw transcription of the Helium class
// `HgcRetimeWithFrameBlend` (the GLSL/Metal frame-blend retime kernel).
//
// ONE symbol is transcribed in this file — `GetParameter(int, float*)`. Every other member of the
// class is a SEPARATE ledger unit and is NOT ported here; each gets ADDED to this file when its
// own unit is claimed (one class = one file; G6 add-only). The siblings, for orientation only
// (`grep 23HgcRetimeWithFrameBlend raw-port/army/inventory/Helium.syms.txt`):
//   0x335940  GetProgram(HGRenderer*)                 0x335970  InitProgramDescriptor(...) const
//   0x335c10  shaderDescription() const               0x335c60  BindTexture(HGHandler*, int)
//   0x335d10  Bind(HGHandler*)                        0x335d50  RenderTile_AVX(HGTile*)
//   0x336020  RenderTile(HGTile*)                     0x336220  GetDOD(HGRenderer*, int, HGRect)
//   0x336240  GetROI(HGRenderer*, int, HGRect)        0x336260  C2      0x3362e0  C1
//   0x336360  D2   0x3363b0  D1   0x336400  D0        0x336450  SetParameter(int, f, f, f, f)
//   0x3364d0  GetParameter(int, float*)   <-- ported here
//   0x336510  GetOutput(HGRenderer*)
//
// Provenance (Helium framework, x86_64 slice of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium):
//
//   @0x3364d0  HgcRetimeWithFrameBlend::GetParameter(int, float*)
//                __ZN23HgcRetimeWithFrameBlend12GetParameterEiPf
//
// Disassembly (regenerate with
//   `bash raw-port/tools/disasm.sh --sym __ZN23HgcRetimeWithFrameBlend12GetParameterEiPf Helium`):
//   raw-port/re/disasm/Helium.__ZN23HgcRetimeWithFrameBlend12GetParameterEiPf.s
//
// NAMING: the class is `Hgc…` (lowercase g, c), which is a DIFFERENT class from the landed
// `HGRetimeWithFrameBlend.ts` in this same directory — `Hgc*` kernels are the shader-side
// implementation and `HG*` the node wrapper, and both exist here. The two names also differ by
// more than case, so the APFS case-insensitivity hazard in AGENT_ENTRY §5 does not apply:
// `git ls-tree origin/main | grep -i retimewithframeblend` finds only `HGRetimeWithFrameBlend.ts`.
//
// CALLEES: none — no call, no jmp, no extern, no indirect or virtual dispatch
// (`depgraph.py deps` lists nothing for this symbol).
//
// LAYOUT recovered from THIS function only (nothing else is claimed about the object):
//   this+0x198   pointer to the kernel's uniform block (`movq 0x198(%rdi), %rax` @0x3364de)
//   +0x20 .. +0x2c of that block   four consecutive float32s — the parameter this getter returns

/**
 * The uniform block behind `this+0x198`, as a flat float32 view of the pointed-to memory.
 *
 * The function reads bytes +0x20, +0x24, +0x28 and +0x2c of it, i.e. float32 indices 8, 9, 10 and
 * 11. Nothing else about the block is observable from this symbol, so nothing else is modelled —
 * the view is deliberately just the memory, not an invented struct with named fields it does not
 * prove exist.
 */
export type HgcRetimeWithFrameBlendUniforms = Float32Array;

/**
 * `HgcRetimeWithFrameBlend` — Helium's frame-blend retime kernel.
 *
 * Only the one field this unit's disassembly proves is modelled. Every other offset of the object
 * belongs to whichever unit first decodes it.
 */
export class HgcRetimeWithFrameBlend {
  /**
   * (this+0x198) — the pointer loaded by `movq 0x198(%rdi), %rax` @0x3364de. Modelled as the
   * float32 view of the block it points at, so the byte offsets below map to element indices.
   */
  uniformsAt0x198: HgcRetimeWithFrameBlendUniforms | null = null;

  /**
   * `HgcRetimeWithFrameBlend::GetParameter(int index, float* out)` — @Helium 0x3364d0
   * (`__ZN23HgcRetimeWithFrameBlend12GetParameterEiPf`).
   *
   * FULL transcription — every instruction, in order:
   *
   *   0x3364d0  movl  $0xffffffff, %eax     ; the return value is PRE-SET to -1, before any test
   *   0x3364d5  testl %esi, %esi            ; flags from index & index
   *   0x3364d7  je    0x3364da              ; index == 0 -> the copy path below
   *   0x3364d9  retq                        ; index != 0 -> return -1, with NO frame set up and
   *                                         ;   NOTHING written through `out`
   *   0x3364da  pushq %rbp                  ; frame setup (no TS counterpart)
   *   0x3364db  movq  %rsp, %rbp
   *   0x3364de  movq  0x198(%rdi), %rax     ; the uniform block
   *   0x3364e5  movss 0x20(%rax), %xmm0     ; out[0] = block[+0x20]
   *   0x3364ea  movss %xmm0, (%rdx)
   *   0x3364ee  movss 0x24(%rax), %xmm0     ; out[1] = block[+0x24]
   *   0x3364f3  movss %xmm0, 0x4(%rdx)
   *   0x3364f8  movss 0x28(%rax), %xmm0     ; out[2] = block[+0x28]
   *   0x3364fd  movss %xmm0, 0x8(%rdx)
   *   0x336502  movss 0x2c(%rax), %xmm0     ; out[3] = block[+0x2c]
   *   0x336507  movss %xmm0, 0xc(%rdx)
   *   0x33650c  xorl  %eax, %eax            ; return 0
   *   0x33650e  popq  %rbp
   *   0x33650f  retq
   *
   * THE TEST IS `testl`, NOT A COMPARISON AGAINST A KEY TABLE. Any non-zero index — negative,
   * INT_MIN, INT_MAX — takes the early `retq`; only index 0 is served. So this kernel owns exactly
   * one parameter, and -1 is its "not my key" answer (the same convention the SetParameter family
   * in Helium uses: OPS_LOG records `HGComicQuantize::SetParameter` answering 1 / 0 / -1).
   *
   * `movl $0xffffffff,%eax` before the test is a real ordering fact, not a compiler artifact worth
   * skipping: the -1 is already in place on the early-return path, and the success path OVERWRITES
   * it with `xorl %eax,%eax` at the very end. The transcription keeps that shape.
   *
   * THE COPY IS FOUR SEPARATE 32-BIT MOVES, not a 16-byte vector move: four `movss` loads and four
   * `movss` stores. That matters for a faithful port because a `movaps` would require 16-byte
   * alignment and would copy the four lanes as one value; these do not, and each lane is copied
   * bit-for-bit, so a NaN payload or a signalling NaN in the block arrives in `out` unchanged.
   *
   * ORACLE — VERIFIED against the live binary; see
   * `raw-port/re/oracle/HgcRetimeWithFrameBlend_GetParameter_oracle.py` +
   * `_driver.mts`, which run THIS file (no module is stubbed — it imports nothing) under
   * `node --experimental-strip-types` and compare with the function called at
   * `_dyld_get_image_vmaddr_slide(Helium) + 0x3364d0` under `arch -x86_64`. Both halves of the
   * answer are compared: the returned int AND the four output floats as raw bit patterns.
   *
   * RESULT: 120 cases, 0 divergent — 83 index-0 and 37 non-zero (including INT_MIN, INT_MAX and
   * negatives), with NaN payloads, ±Inf, -0.0 and denormals placed in each of the four lanes in
   * turn. Every refusal returned -1 with the output buffer bit-identical to the poison it went in
   * with, and the 0xCD-poisoned 0x200-byte `this` was byte-identical after all 120 calls, so
   * "reads only the pointer at +0x198, writes nothing to the receiver" is measured rather than
   * read. Five one-token mutants of THIS file are all killed — the index test inverted (120), the
   * refusal returning 0 (37), the source offset slipped one float (83), the fourth lane not
   * copied (83), the success path returning -1 (83) — while an unmutated copy (M0) kills 0.
   *
   * @param index the `int` in %esi.
   * @param out   the `float*` in %rdx — four floats are written on the index-0 path, none on any
   *              other path.
   * @returns 0 when the parameter was written, -1 otherwise (the `int` in %eax).
   */
  GetParameter(index: number, out: Float32Array): number {
    // @0x3364d0  movl $0xffffffff, %eax — the answer is -1 unless the copy path runs.
    // @0x3364d5..0x3364d9  testl %esi,%esi ; je ; retq
    if (index !== 0) {
      return -1;
    }
    // @0x3364de  movq 0x198(%rdi), %rax
    const block = this.uniformsAt0x198!;
    // @0x3364e5..0x336507 — four independent movss load/store pairs, +0x20/+0x24/+0x28/+0x2c of
    // the block into out[0..3]. Byte offset 0x20 is float32 index 8.
    out[0] = block[8]!;
    out[1] = block[9]!;
    out[2] = block[10]!;
    out[3] = block[11]!;
    // @0x33650c  xorl %eax, %eax ; @0x33650e popq %rbp ; @0x33650f retq
    return 0;
  }
}
