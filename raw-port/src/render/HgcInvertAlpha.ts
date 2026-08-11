// HgcInvertAlpha.ts — raw transcription of Helium `HgcInvertAlpha`.
//
// One of Helium's `Hgc*` render-graph node classes: the alpha-inversion node. ONE symbol is
// transcribed in this file — `GetROI(HGRenderer*, int, HGRect)`.
//
// Provenance (Helium framework, x86_64 slice of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium):
//
//   @0x3312b0  HgcInvertAlpha::GetROI(HGRenderer*, int, HGRect)
//                __ZN14HgcInvertAlpha6GetROIEP10HGRendereri6HGRect
//
// Disassembly (regenerate with
//   `bash raw-port/tools/disasm.sh --sym __ZN14HgcInvertAlpha6GetROIEP10HGRendereri6HGRect Helium`):
//   raw-port/re/disasm/Helium.__ZN14HgcInvertAlpha6GetROIEP10HGRendereri6HGRect.s (13 lines)
//
// Every OTHER member of the class is a SEPARATE ledger unit and is deliberately NOT ported here;
// each gets ADDED to this file when its own unit is claimed (one class = one file; G6 add-only).
// Their addresses, from the symbol inventory (`raw-port/army/inventory/Helium.syms.txt`; all `t`):
//   GetProgram @0x330bd0, InitProgramDescriptor @0x330c00, shaderDescription @0x330e20,
//   BindTexture @0x330e50, Bind @0x330ec0, RenderTile_AVX @0x330ee0, RenderTile @0x3310f0,
//   GetDOD @0x331290, C2 @0x3312d0, C1 @0x331360, D2 @0x3313f0, D1 @0x331440, D0 @0x331490,
//   SetParameter @0x3314e0, GetParameter @0x3314f0, GetOutput @0x331500.
//   GetDOD @0x331290 sits immediately before this function and is its own unit — its body is NOT
//   assumed from this one.
//
// LAYOUT: none is observable from this body. `this` (%rdi) is never dereferenced and the renderer
// (%rsi) is never read; the only memory read is the cross-framework `_HGRectNull` global.
//
// CALLEES: none. The one external reference is the DATA import `_HGRectNull` — not a call — already
// modelled on main as `HGRectNull` in raw-port/src/render/HGRect.ts (16 zero bytes read from the
// binary at Helium 0x3d2284). No in-scope call, no extern call, no indirect or virtual dispatch
// (`depgraph.py deps` lists nothing for this symbol).

import { HGRect, HGRectNull } from "./HGRect.js";

/**
 * `HGRenderer` — the render-graph driver passed to `GetROI`.
 *
 * An empty structural handle: the pointer arrives in %rsi and is never read. Same module-local
 * declaration, for the same reason, as the landed `HgcYUV420BiPlanar_luma_pack4`.
 *
 * @Helium 0x3312b0
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface HGRenderer {}

/**
 * `HgcInvertAlpha` — Helium's alpha-inversion render node.
 *
 * No instance state is modelled: the one transcribed method touches `this` only as an opaque
 * pointer (see the file header).
 *
 * @Helium 0x3312b0
 */
export class HgcInvertAlpha {
  /**
   * `HgcInvertAlpha::GetROI(HGRenderer*, int inputIdx, HGRect r)` — @Helium 0x3312b0
   *   `__ZN14HgcInvertAlpha6GetROIEP10HGRendereri6HGRect`
   *
   * FULL transcription — every instruction, in order. Under the SysV ABI the 16-byte HGRect is
   * passed in the INTEGER pair %rcx:%r8 and returned in %rax:%rdx (x|y<<32 low, right|bottom<<32
   * high — the packing documented in HGRect.ts):
   *
   *   0x3312b0  movq  %rcx,%rax             ; rax = r.lo  (the pass-through answer, set up first)
   *   0x3312b3  testl %edx,%edx             ; inputIdx == 0 ?
   *   0x3312b5  je    0x3312ca              ;   yes -> straight to the epilogue: return r unchanged
   *   0x3312b7  pushq %rbp ; movq %rsp,%rbp
   *   0x3312bb  leaq  _HGRectNull(%rip),%rcx
   *   0x3312c2  movq  (%rcx),%rax           ; rax = HGRectNull.lo   (overwrites the pass-through)
   *   0x3312c5  movq  0x8(%rcx),%r8         ; r8  = HGRectNull.hi
   *   0x3312c9  popq  %rbp
   *   0x3312ca  movq  %r8,%rdx              ; rdx = hi word — SHARED by both paths
   *   0x3312cd  retq
   *   0x3312ce  nop                         ; alignment padding, not executed
   *
   * So: `inputIdx == 0` -> return the caller's rect unchanged; anything else -> `HGRectNull`.
   *
   * DECODE NOTES.
   *   * The two paths MERGE at 0x3312ca: the low word is already in %rax on both (either the
   *     caller's %rcx or HGRectNull's first 8 bytes) and the high word is moved out of %r8, which
   *     the null path has just reloaded. Reading 0x3312b0's `movq %rcx,%rax` as unconditional and
   *     the null path as an overwrite is what makes that merge point correct.
   *   * `testl %edx,%edx ; je` tests the 32-bit index for ZERO — an equality test, not a signed
   *     comparison — so a NEGATIVE index takes the HGRectNull path just like a positive one.
   *   * The frame is set up only on the HGRectNull path (`pushq %rbp` at 0x3312b7 is AFTER the
   *     branch); the zero path is frameless. No observable difference in TS.
   *   * `_HGRectNull` is a DATA import, not an indirect call: `leaq` takes its address and the two
   *     `movq`s read its 16 bytes.
   *   * Byte-for-byte the same body as the landed `HgcYUV420BiPlanar_luma::GetROI` @Helium
   *     0x2fbc20 and the same shape as `HgcBT2100_HLG_OETF::GetDOD` @0x3b0e90 (corroboration only;
   *     each is its own ledger unit).
   *
   * ORACLE (executed against live FCP, not read). The symbol is `t` (local) so it is not
   * dlsym-able; it was called BY ADDRESS in a Rosetta x86_64 process — `arch -x86_64
   * /usr/bin/python3` — at `_dyld_get_image_vmaddr_slide(Helium) + 0x3312b0`, with the vmaddr from
   * `nm -n -arch x86_64` (never a bare `nm`, which reports the arm64 slice even under Rosetta),
   * declaring the HGRect argument and return as a 4 x int32 ctypes struct so the by-value ABI
   * pairing is the real one. 30 cases — inputIdx in {0, 1, 2, -1, INT_MIN, INT_MAX} crossed with
   * five rects including negative and INT_MIN/INT_MAX corners — all matched this port exactly: the
   * input rect at index 0, {0,0,0,0} everywhere else.
   *
   * @param _renderer the `HGRenderer*` in %rsi — unread by this body.
   * @param inputIdx  the input index in %edx.
   * @param r         the caller's rect in %rcx:%r8.
   * @returns `r` when `inputIdx === 0`, else `HGRectNull`.
   */
  GetROI(_renderer: HGRenderer | null, inputIdx: number, r: HGRect): HGRect {
    // @0x3312b3/@0x3312b5 — testl %edx,%edx ; je: a zero index takes the pass-through path
    // (%rax already holds r.lo from 0x3312b0, %r8 still holds r.hi).
    // @0x3312bb..@0x3312c5 — otherwise both words are reloaded from _HGRectNull.
    return inputIdx === 0 ? r : HGRectNull;
  }
}
