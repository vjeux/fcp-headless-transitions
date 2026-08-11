// HgcYUV420BiPlanar_luma.ts — raw transcription of Helium `HgcYUV420BiPlanar_luma`.
//
// The luma stage of the YUV 4:2:0 BI-planar (Y plane + interleaved CbCr plane) conversion path —
// the un-packed sibling of the landed `HgcYUV420BiPlanar_luma_pack4` and `..._luma_pack2`.
// ONE symbol is transcribed in this file — `GetROI(HGRenderer*, int, HGRect)`.
//
// Provenance (Helium framework, x86_64 slice of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium):
//
//   @0x2fbc20  HgcYUV420BiPlanar_luma::GetROI(HGRenderer*, int, HGRect)
//                __ZN22HgcYUV420BiPlanar_luma6GetROIEP10HGRendereri6HGRect
//
// Disassembly (regenerate with
//   `bash raw-port/tools/disasm.sh --sym __ZN22HgcYUV420BiPlanar_luma6GetROIEP10HGRendereri6HGRect Helium`):
//   raw-port/re/disasm/Helium.__ZN22HgcYUV420BiPlanar_luma6GetROIEP10HGRendereri6HGRect.s (13 lines)
//
// Every OTHER member of the class is a SEPARATE ledger unit and is deliberately NOT ported here;
// each gets ADDED to this file when its own unit is claimed (one class = one file; G6 add-only).
// Their addresses, from the symbol inventory (`raw-port/army/inventory/Helium.syms.txt`; all `t`):
//   GetProgram @0x2fb520, InitProgramDescriptor @0x2fb550, shaderDescription @0x2fb770,
//   BindTexture @0x2fb7c0, Bind @0x2fb830, RenderTile_AVX @0x2fb850, RenderTile @0x2fba60,
//   GetDOD @0x2fbc00, C2 @0x2fbc40, C1 @0x2fbcd0, D2 @0x2fbd60, D1 @0x2fbdb0, D0 @0x2fbe00,
//   SetParameter @0x2fbe50, GetParameter @0x2fbe60, GetOutput @0x2fbe70.
//   (GetDOD @0x2fbc00 sits immediately before this function and is its own unit — do not assume
//   its body from this one.)
//
// LAYOUT: none is observable from this body. `this` (%rdi) is never dereferenced and the renderer
// (%rsi) is never read; the only memory read is the cross-framework `_HGRectNull` global. The class's
// real field layout must come from the ctor/RenderTile units when those are claimed.
//
// CALLEES: none. The one external reference is the DATA import `_HGRectNull` — not a call — which is
// already modelled on main as `HGRectNull` in raw-port/src/render/HGRect.ts (16 zero bytes read from
// the binary at Helium 0x3d2284). No in-scope call, no extern call, no indirect or virtual dispatch
// (`depgraph.py deps` lists nothing for this symbol).

import { HGRect, HGRectNull } from "./HGRect.js";

/**
 * `HGRenderer` — the render-graph driver passed to `GetROI`.
 *
 * Declared as an empty structural handle because this body never touches it: the pointer arrives in
 * %rsi and is never read. Same module-local declaration, for the same reason, as the landed
 * `HgcYUV420BiPlanar_luma_pack4`.
 *
 * @Helium 0x2fbc20
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HGRenderer {}

/**
 * `HgcYUV420BiPlanar_luma` — the luma node of the YUV 4:2:0 bi-planar path.
 *
 * No instance state is modelled: the one transcribed method touches `this` only as an opaque
 * pointer (see the file header).
 *
 * @Helium 0x2fbc20
 */
export class HgcYUV420BiPlanar_luma {
  /**
   * `HgcYUV420BiPlanar_luma::GetROI(HGRenderer*, int inputIdx, HGRect r)` — @Helium 0x2fbc20
   *   `__ZN22HgcYUV420BiPlanar_luma6GetROIEP10HGRendereri6HGRect`
   *
   * FULL transcription — every instruction, in order. Under the SysV ABI the 16-byte HGRect is
   * passed in the INTEGER pair %rcx:%r8 and returned in %rax:%rdx (x|y<<32 in the low word,
   * right|bottom<<32 in the high word — the packing documented in HGRect.ts):
   *
   *   0x2fbc20  movq  %rcx,%rax             ; rax = r.lo  (the pass-through answer, set up first)
   *   0x2fbc23  testl %edx,%edx             ; inputIdx == 0 ?
   *   0x2fbc25  je    0x2fbc3a              ;   yes -> straight to the epilogue: return r unchanged
   *   0x2fbc27  pushq %rbp ; movq %rsp,%rbp
   *   0x2fbc2b  leaq  _HGRectNull(%rip),%rcx
   *   0x2fbc32  movq  (%rcx),%rax           ; rax = HGRectNull.lo   (overwrites the pass-through)
   *   0x2fbc35  movq  0x8(%rcx),%r8         ; r8  = HGRectNull.hi
   *   0x2fbc39  popq  %rbp
   *   0x2fbc3a  movq  %r8,%rdx              ; rdx = hi word — SHARED by both paths
   *   0x2fbc3d  retq
   *   0x2fbc3e  nop                         ; alignment padding, not executed
   *
   * So: `inputIdx == 0` -> return the caller's rect unchanged; anything else -> `HGRectNull`.
   *
   * DECODE NOTES.
   *   * The two paths MERGE at 0x2fbc3a: the low word is already in %rax on both (either the
   *     caller's %rcx or HGRectNull's first 8 bytes) and the high word is moved out of %r8, which
   *     the null path has just reloaded. Reading 0x2fbc20's `movq %rcx,%rax` as unconditional and
   *     the null path as an overwrite is what makes the merge point correct.
   *   * `testl %edx,%edx ; je` tests the 32-bit input index for ZERO — it is an equality test, not
   *     a signed comparison, so a NEGATIVE index takes the HGRectNull path just like a positive one.
   *   * The frame is only set up on the HGRectNull path (`pushq %rbp` at 0x2fbc27 is AFTER the
   *     branch); the zero path is frameless. No observable difference in TS.
   *   * `_HGRectNull` is a DATA import, not an indirect call: `leaq` takes its address and the two
   *     `movq`s read its 16 bytes. It is already modelled on main as `HGRectNull` (all-zero) in
   *     raw-port/src/render/HGRect.ts, so this port imports it rather than restating the bytes.
   *   * Precedent for the identical shape: the landed `HgcBT2100_HLG_OETF::GetDOD` @Helium 0x3b0e90
   *     / `::GetROI` @0x3b0eb0 (cited as corroboration; each is its own ledger unit).
   *
   * ORACLE (executed against live FCP, not read). The symbol is `t` (local) so it is not
   * dlsym-able; it was called BY ADDRESS in a Rosetta x86_64 process — `arch -x86_64
   * /usr/bin/python3` — at `_dyld_get_image_vmaddr_slide(Helium) + 0x2fbc20`, with the vmaddr from
   * `nm -n -arch x86_64` (never a bare `nm`, which reports the arm64 slice even under Rosetta),
   * declaring the HGRect argument and return as a 4 x int32 ctypes struct so the ABI pairing is the
   * real one. Across inputIdx in {0, 1, 2, -1, INT_MIN, INT_MAX} crossed with several rects
   * (including negative and INT_MIN/INT_MAX corners), live FCP returned the input rect for
   * inputIdx == 0 and {0,0,0,0} for every other index — exactly this port's answers.
   *
   * @param _renderer the `HGRenderer*` in %rsi — unread by this body.
   * @param inputIdx  the input index in %edx.
   * @param r         the caller's rect in %rcx:%r8.
   * @returns `r` when `inputIdx === 0`, else `HGRectNull`.
   */
  GetROI(_renderer: HGRenderer | null, inputIdx: number, r: HGRect): HGRect {
    // @0x2fbc23/0x2fbc25 — testl %edx,%edx ; je: zero index takes the pass-through path
    // (%rax already holds r.lo from 0x2fbc20, %r8 still holds r.hi).
    // @0x2fbc2b..0x2fbc35 — otherwise both words are reloaded from _HGRectNull.
    return inputIdx === 0 ? r : HGRectNull;
  }
}
