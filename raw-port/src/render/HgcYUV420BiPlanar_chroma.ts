// HgcYUV420BiPlanar_chroma.ts — raw transcription of Helium `HgcYUV420BiPlanar_chroma`.
//
// The chroma stage of the YUV 4:2:0 BI-planar (Y plane + interleaved CbCr plane) conversion path —
// the sibling of the landed `HgcYUV420BiPlanar_luma`, `..._luma_pack2` and `..._luma_pack4`.
// ONE symbol is transcribed in this file: `SetParameter(int, float, float, float, float)`.
//
// Provenance (Helium framework, x86_64 slice of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium):
//
//   @0x2ff680  HgcYUV420BiPlanar_chroma::SetParameter(int, float, float, float, float)
//                __ZN24HgcYUV420BiPlanar_chroma12SetParameterEiffff        (nm class `t`, local)
//
// Disassembly (regenerate with
//   `bash raw-port/tools/disasm.sh --sym __ZN24HgcYUV420BiPlanar_chroma12SetParameterEiffff Helium`):
//   raw-port/re/disasm/Helium.__ZN24HgcYUV420BiPlanar_chroma12SetParameterEiffff.s (5 instructions)
//
// Every OTHER member of the class is a SEPARATE ledger unit and is deliberately NOT ported here;
// each gets ADDED to this file when its own unit is claimed (one class = one file; G6 add-only).
// Their addresses, from the symbol inventory (`raw-port/army/inventory/Helium.syms.txt`, all `t`):
//   GetProgram @0x2fea60, BindTexture @0x2fee10, Bind @0x2feec0, RenderTile_AVX @0x2feee0,
//   RenderTile @0x2ff170, GetDOD @0x2ff390, GetROI @0x2ff3f0, C2 @0x2ff450, C1 @0x2ff4f0,
//   D2 @0x2ff590, D1 @0x2ff5e0, D0 @0x2ff630, GetParameter @0x2ff690, GetOutput @0x2ff6a0.
//   Two of those were read (not ported) while grounding this unit, because they bound this
//   function's body and gave the oracle its controls: GetParameter @0x2ff690 is the byte-identical
//   twin stub, and GetOutput @0x2ff6a0 is `movq %rdi,%rax ; retq` — it returns `this`.
//
// LAYOUT: none is observable from this body, and that is a positive finding rather than a gap —
// `this` (%rdi) is never dereferenced, no float argument is read, nothing is stored. The class's
// real field layout must come from the ctor / RenderTile units when those are claimed, exactly as
// the landed luma sibling records for itself.
//
// CALLEES: none — no in-scope call, no extern, no indirect and no virtual dispatch
// (`depgraph.py deps __ZN24HgcYUV420BiPlanar_chroma12SetParameterEiffff` lists nothing).

/**
 * `HgcYUV420BiPlanar_chroma::SetParameter(int, float, float, float, float)` — @Helium 0x2ff680
 *   `__ZN24HgcYUV420BiPlanar_chroma12SetParameterEiffff`
 *
 * FULL transcription. The body is five instructions and the whole of it is "reject every
 * parameter":
 *
 *   0x2ff680  55              pushq %rbp                  ; prologue (no TS counterpart)
 *   0x2ff681  48 89 e5        movq  %rsp, %rbp            ; prologue (no TS counterpart)
 *   0x2ff684  b8 ff ff ff ff  movl  $0xffffffff, %eax     ; the whole answer: int32 -1
 *   0x2ff689  5d              popq  %rbp                  ; epilogue
 *   0x2ff68a  c3              retq
 *   0x2ff68b  0f 1f 44 00 00  nopl  (%rax,%rax)           ; inter-function padding, not this body
 *
 * WHAT IS NOT THERE IS THE CONTENT. No `%rdi` dereference, so the receiver is untouched and a NULL
 * `this` is harmless (measured — see the oracle); no `%xmm` register is read, so all four floats
 * are ignored; no `%esi` test, so the parameter KEY is ignored too; no store anywhere, so no state
 * changes. This is the derived class declining to own any parameter — the same "unsupported
 * parameter" stub the landed `hgColorGamma_SetParameter` @Helium 0xfb2f0 transcribes from the
 * identical three-instruction shape, and the byte-identical twin of this class's own
 * `GetParameter` @0x2ff690 and of the luma sibling's `SetParameter` @0x2fbe50. A caller that wants
 * to know whether a key was accepted gets -1 for every key.
 *
 * `movl $0xffffffff, %eax` IS -1, NOT 4294967295. The C++ return type of this virtual is `int`
 * (the family's overrides return 1 / 0 / -1 — see `HGComicQuantize::SetParameter` @0x7450, which
 * answers `movl $0x1,%eax` when it stores, `xorl %eax,%eax` when the value was unchanged, and this
 * same `$0xffffffff` for a key it does not own), so the 32 bits in `%eax` are read signed. The
 * measured live call returns -1, and the mutant that ports the constant as the unsigned 4294967295
 * is killed on every case.
 *
 * ORACLE — EXECUTED against live FCP, not read:
 * `raw-port/re/oracle/HgcYUV420BiPlanar_chroma_SetParameter_oracle.py`, with THIS FILE run by
 * `raw-port/re/oracle/HgcYUV420BiPlanar_chroma_SetParameter_driver.mts` under
 * `node --experimental-strip-types` — the module is a leaf, so the driver imports the real port
 * with no hook and nothing stubbed. The symbol is LOCAL (`t`), which `dlsym` cannot reach, so it is
 * called by address at `_dyld_get_image_vmaddr_slide(Helium) + 0x2ff680` under `arch -x86_64`,
 * with the bytes at that address checked against the transcription above BEFORE the first call —
 * the cheapest guard against the wrong-slice trap, which otherwise fails silently toward VERIFIED.
 *
 * A CONSTANT FUNCTION NEEDS ITS INSTRUMENT PROVED, because a harness that never reads `%eax` agrees
 * with any constant port. Two controls do that, both through the same call path (see the oracle for
 * the numbers):
 *   - the SIBLING OVERRIDE `HGComicQuantize::SetParameter` @Helium 0x7450, called through the
 *     IDENTICAL `CFUNCTYPE` with the IDENTICAL argument tuples: it answers 1, 0 and -1 depending on
 *     key and value, so the instrument demonstrably distinguishes three different returns from this
 *     signature — and its -1 for an unknown key shows that this port's -1 is a real answer rather
 *     than an artifact of the harness;
 *   - the same-class sibling `GetOutput` @0x2ff6a0 (`movq %rdi,%rax`), which returns a value the
 *     harness itself chooses (the receiver address), so a stale-register or fixed-value reading of
 *     the return path cannot survive.
 *
 * MEASURED (2026-08-11): 30 of 30 argument tuples — keys -1/0/1/2/7/INT32_MAX crossed with float
 * tuples covering +0.0, -0.0, +/-1.0, NaN, +/-Inf, a denormal and 1e38 — returned exactly -1 from
 * live Helium and from the TypeScript, with 0 of 30 modifying any byte of the 0xCD-poisoned
 * receiver; a NULL receiver also returned -1 without faulting, which is the positive form of "the
 * body never touches `this`". Mutants (real copies of this file, one token changed): M0 unmutated
 * 0 killed, M1 `return 0` 30/30, M2 `return 0xffffffff` (the unsigned misreading) 30/30, M3 an
 * answer that depends on the key 25/30 — the five survivors being exactly the key-0 cases it
 * happens to agree on, which is what a partially-wrong port looks like and is why that count is
 * not 30.
 *
 * ONE THING THE HARNESS GOT WRONG FIRST, recorded because it is the failure this whole family of
 * controls exists to catch: the driver originally returned the port's value through `| 0`, an
 * int32 coercion — the operation under test. `0xffffffff | 0` is `-1`, so M2, the mutant for
 * exactly the signed/unsigned misreading, scored **0 kills of 24** and the run still printed a
 * healthy-looking table. Removing the coercion took it to 30/30. An instrument that normalises its
 * subject's output with the operation being measured measures nothing there.
 *
 * @Helium 0x2ff680
 */
export function HgcYUV420BiPlanar_chroma_SetParameter(
  _self: unknown,
  _key: number,
  _f0: number,
  _f1: number,
  _f2: number,
  _f3: number,
): number {
  // @0x2ff684  movl $0xffffffff, %eax — read as the int32 it is declared to be: -1, for every key
  //   and every value. Nothing is read from the receiver and nothing is stored.
  return -1;
}
