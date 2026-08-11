// HgcYUV444BiPlanar_444To444_Type2.ts — raw transcription of Helium
// `HgcYUV444BiPlanar_444To444_Type2`.
//
// One of Helium's `Hgc*` render-graph node classes: the "Type 2" variant of the YUV 4:4:4
// BI-planar (one luma plane + one interleaved chroma plane) 444-to-444 conversion path. It is the
// two-input sibling of the landed `HgcYUV444TriPlanar_444To444_Type2` (three planes, three inputs).
// ONE symbol is transcribed in this file — `GetROI(HGRenderer*, int, HGRect)`.
//
// Provenance (Helium framework, x86_64 slice of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium):
//
//   @0x3395c0  HgcYUV444BiPlanar_444To444_Type2::GetROI(HGRenderer*, int, HGRect)
//                __ZN32HgcYUV444BiPlanar_444To444_Type26GetROIEP10HGRendereri6HGRect
//
// Disassembly (regenerate with
//   `bash raw-port/tools/disasm.sh --sym __ZN32HgcYUV444BiPlanar_444To444_Type26GetROIEP10HGRendereri6HGRect Helium`):
//   raw-port/re/disasm/Helium.__ZN32HgcYUV444BiPlanar_444To444_Type26GetROIEP10HGRendereri6HGRect.s
//   (13 lines: the label plus twelve instruction lines)
//
// Every OTHER member of the class is a SEPARATE ledger unit and is deliberately NOT ported here;
// each gets ADDED to this file when its own unit is claimed (one class = one file; G6 add-only).
// Their addresses, from the symbol inventory (`raw-port/army/inventory/Helium.syms.txt`; all `t`):
//   GetProgram @0x338be0, InitProgramDescriptor @0x338c10, shaderDescription @0x338eb0,
//   BindTexture @0x338f10, Bind @0x338fc0, RenderTile_AVX @0x338fe0, RenderTile @0x339240,
//   GetDOD @0x3395a0, C2 @0x3395e0, C1 @0x339670, D2 @0x339700, D1 @0x339750, D0 @0x3397a0,
//   SetParameter @0x3397f0, GetParameter @0x339800, GetOutput @0x339810.
//
// GetDOD @0x3395a0 deserves a note because it is 32 bytes away and its body is IDENTICAL
// instruction for instruction (only the `leaq` displacement differs, 0x98cd1 vs 0x98cb1, and both
// resolve to the SAME `_HGRectNull` @0x3d2284). It is its own ledger unit; porting it here would be
// claiming a unit this worker was not handed, so it is left alone.
//
// LAYOUT: none is observable from this body. `this` arrives in %rdi and is NEVER READ — the
// function's only inputs are the int in %edx and the by-value HGRect in %rcx:%r8. The class's real
// field layout must come from the ctor/RenderTile units when those are claimed; asserting anything
// here would be inventing what the instruction stream does not show.
//
// CALLEES: none. No call, no jump to another function, no indirect and no virtual dispatch
// (`depgraph.py deps` lists nothing for this symbol). The single memory reference is a read of the
// `_HGRectNull` DATA symbol @0x3d2284, which is already modelled by the landed
// `raw-port/src/render/HGRect.ts` and is imported from there rather than re-declared.

import { HGRect, HGRectNull } from "./HGRect.js";

/**
 * `HgcYUV444BiPlanar_444To444_Type2::GetROI(HGRenderer*, int inputIdx, HGRect r)`
 *   — @Helium 0x3395c0
 *   — `__ZN32HgcYUV444BiPlanar_444To444_Type26GetROIEP10HGRendereri6HGRect`
 *
 * Region-of-interest query: for each of the node's inputs, what part of that input does it need in
 * order to produce the requested output rect? This node reads its inputs 1:1, so it asks for
 * exactly the rect it was given — for the inputs it HAS. A bi-planar node has two (luma, chroma),
 * and the guard below is what says "two".
 *
 * FULL transcription — every instruction, in order. The by-value `HGRect` argument occupies two
 * SysV INTEGER eightbytes, so it arrives in %rcx (= {x, y}) and %r8 (= {right, bottom}), and the
 * 16-byte return goes back in %rax:%rdx. `this` (%rdi) and `HGRenderer*` (%rsi) are never touched:
 *
 *   0x3395c0  48 89 c8              movq  %rcx, %rax        ; rax = r.lo — the pass-through value,
 *                                                           ;   staged BEFORE the test
 *   0x3395c3  83 fa 02              cmpl  $0x2, %edx        ; flags on inputIdx - 2 (AT&T dst-src)
 *   0x3395c6  72 13                 jb    0x3395db          ; UNSIGNED below: inputIdx <u 2
 *                                                           ;   -> skip the HGRectNull load
 *   0x3395c8  55                    pushq %rbp              ; frame setup (no TS counterpart)
 *   0x3395c9  48 89 e5              movq  %rsp, %rbp        ; frame setup (no TS counterpart)
 *   0x3395cc  48 8d 0d b1 8c 09 00  leaq  0x98cb1(%rip), %rcx ; 0x3395d3 + 0x98cb1 = 0x3d2284
 *                                                           ;   = _HGRectNull (the 16 zero bytes)
 *   0x3395d3  48 8b 01              movq  (%rcx), %rax      ; rax = HGRectNull.lo
 *   0x3395d6  4c 8b 41 08           movq  0x8(%rcx), %r8    ; r8  = HGRectNull.hi
 *   0x3395da  5d                    popq  %rbp              ; epilogue (no TS counterpart)
 *   0x3395db  4c 89 c2              movq  %r8, %rdx         ; SHARED tail: rdx = the hi eightbyte
 *   0x3395de  c3                    retq                    ; returns {rax, rdx}
 *
 * THE COMPARISON IS UNSIGNED, and that is the whole semantic content of the function. `jb` is the
 * CF condition, so the taken branch is `(unsigned)inputIdx < 2`, NOT `inputIdx < 2` on a signed
 * int. The two models disagree on every negative index: -1 is `0xffffffff` unsigned, which is
 * ABOVE 2, so the binary returns HGRectNull where a signed model would return the caller's rect.
 * The port therefore coerces with `>>> 0` rather than comparing the signed value. (Measured both
 * ways against the live binary — see below.)
 *
 * Note the ORDER: `movq %rcx, %rax` @0x3395c0 runs before the compare, so the pass-through is the
 * default and the HGRectNull load overwrites it. Both paths then converge on the same
 * `movq %r8, %rdx` @0x3395db — which is why the null path bothers to load %r8 at all.
 *
 * The `_HGRectNull` read at @0x3d2284 is the same data symbol the landed `HGRect.ts` documents
 * (its header records `_HGRectNull @0x3d2284`, 16 zero bytes), recovered here independently from
 * this function's own RIP displacement. `HGRectNull` is imported from that file rather than
 * re-declared, per one-class-one-file.
 *
 * MEASURED AGAINST THE LIVE BINARY
 * (raw-port/re/oracle/HgcYUV444BiPlanar_444To444_Type2_GetROI_probe.py, run under
 * `arch -x86_64 /usr/bin/python3` so the call lands on the same x86_64 slice this was transcribed
 * from). The symbol is LOCAL (`t`), so it is called BY ADDRESS at `slide + 0x3395c0` after the
 * probe asserts the 31 mapped opcode bytes are the ones above — **15/15 PASS** at Helium slide
 * 0x10d57a000:
 *   - inputIdx 0 and 1 return the caller's rect, bit for bit, for three different rects
 *   - inputIdx 2, 3, 0x7fffffff, 0x80000000 and 0xffffffff (-1) return {0,0,0,0} = HGRectNull
 *   - CONTROL, and the reason this port says `>>> 0`: at inputIdx = -1 a SIGNED `< 2` model
 *     predicts the pass-through rect and the binary returns HGRectNull, so the two models are
 *     distinguishable and the measurement picks the unsigned one. At inputIdx = 2 a `<= 2` model
 *     is likewise refuted.
 *   - `this` = NULL and `HGRenderer*` = NULL throughout: the function never dereferences either,
 *     which is the evidence for the "no state is observable" claim above
 *   - the model scoring is printed, not just asserted: over the seven indices tried, the unsigned
 *     model has 0 mismatches and the signed model has 2 (at 0x80000000 and 0xffffffff, where the
 *     binary returns HGRectNull and the signed model predicts pass-through). A control that killed
 *     0 would have meant the two models are indistinguishable on this trace; it kills 2
 *   - `_HGRectNull` @0x3d2284, the address this function's own `leaq` displacement resolves to,
 *     reads as 16 zero bytes in the live image — the landed HGRect.ts records the same
 *
 * @param _renderer the `HGRenderer*` in %rsi — never read by this body.
 * @param inputIdx  the input index in %edx, compared UNSIGNED against 2.
 * @param r         the by-value `HGRect` in %rcx:%r8.
 */
export function HgcYUV444BiPlanar_444To444_Type2_GetROI(
  _renderer: unknown,
  inputIdx: number,
  r: HGRect,
): HGRect {
  // @0x3395c0  movq %rcx,%rax — the pass-through is staged first, so it is the default.
  // @0x3395c3-0x3395c6  cmpl $0x2,%edx ; jb — UNSIGNED below (CF), hence `>>> 0`.
  // @0x3395cc-0x3395da  the not-taken path loads _HGRectNull @0x3d2284 over it.
  return (inputIdx >>> 0) < 2 ? r : HGRectNull;
  // @0x3395db-0x3395de  movq %r8,%rdx ; retq — the shared tail both paths reach.
}
