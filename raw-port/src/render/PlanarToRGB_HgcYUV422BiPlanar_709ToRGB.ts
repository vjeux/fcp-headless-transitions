// PlanarToRGB_HgcYUV422BiPlanar_709ToRGB.ts — raw transcription of Helium
// `PlanarToRGB<HgcYUV422BiPlanar_709ToRGB>`.
//
// One instantiation of Helium's `PlanarToRGB<Converter>` node template — the
// Rec.709 YUV 4:2:2 bi-planar to RGB conversion node. The template parameter is
// a TYPE (`HgcYUV422BiPlanar_709ToRGB`), so each converter gets its own emitted
// class; this file is that one instantiation and, per the landed convention for
// template instantiations (`PCMatrix44Tmpl_double.ts`,
// `HGArray_float_vector4_HGFormat28.ts`), the argument is appended to the
// template name with a single underscore.
//
// Provenance (Helium framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// Symbol ported in this file — ONE method:
//   @0xe6cf0  PlanarToRGB<HgcYUV422BiPlanar_709ToRGB>::GetDOD(HGRenderer*, int, HGRect)
//               __ZN11PlanarToRGBI26HgcYUV422BiPlanar_709ToRGBE6GetDODEP10HGRendereri6HGRect
//
// Source disassembly (re-derived from the binary in this worktree with
// `raw-port/tools/disasm.sh --sym
//  __ZN11PlanarToRGBI26HgcYUV422BiPlanar_709ToRGBE6GetDODEP10HGRendereri6HGRect
//  Helium`):
//   raw-port/re/disasm/Helium.__ZN11PlanarToRGBI26HgcYUV422BiPlanar_709ToRGBE6GetDODEP10HGRendereri6HGRect.s
//   (13 lines)
//
// Every other member of this instantiation is a SEPARATE ledger unit and is NOT
// ported here.
//
// ---------------------------------------------------------------------------
// CALLING CONVENTION — why this body looks like register shuffling
// ---------------------------------------------------------------------------
// `HGRect` is a 16-byte POD of four int32 (see HGRect.ts, whose layout was
// recovered from the raw bytes of `_HGRectNull`/`_HGRectInfinite`), so SysV
// passes it in TWO integer registers and returns it in `rax:rdx`:
//
//   %rdi = this
//   %rsi = renderer          (HGRenderer*)
//   %edx = index             (int)
//   %rcx = rect.lo qword     = x     | (y      << 32)
//   %r8  = rect.hi qword     = right | (bottom << 32)
//   return %rax = lo qword, %rdx = hi qword
//
// That is the whole reason the body moves values between %rcx/%r8 and
// %rax/%rdx: it is returning one of two 16-byte structs by value.
//
// CALLEES: none — no call of any kind. The only external reference is the DATA
// symbol `_HGRectNull` (@Helium 0x3d2284, 16 zero bytes), which is already
// modelled as the exported `HGRectNull` in HGRect.ts.

import type { HGRect } from "./HGRect.js";
import { HGRectNull } from "./HGRect.js";

/**
 * `PlanarToRGB<HgcYUV422BiPlanar_709ToRGB>` — Helium's Rec.709 YUV 4:2:2
 * bi-planar to RGB node.
 *
 * No fields are declared: the one method ported here never reads `this`.
 *
 * @Helium 0xe6cf0
 */
export class PlanarToRGB_HgcYUV422BiPlanar_709ToRGB {
  /**
   * `PlanarToRGB<HgcYUV422BiPlanar_709ToRGB>::GetDOD(HGRenderer* renderer, int index, HGRect rect)`
   * @Helium 0xe6cf0.
   *
   * Faithful transcription of the 13-line body, quoted in full:
   *
   *   0xe6cf0  movq %rcx, %rax              ; rax = rect.lo  (the default
   *                                         ;   return value, set BEFORE the
   *                                         ;   test)
   *   0xe6cf3  testl %edx, %edx             ; index == 0?
   *   0xe6cf5  je   0xe6d0a                 ;   yes -> return the input rect
   *   0xe6cf7  pushq %rbp                   ; prologue DEFERRED past the test
   *   0xe6cf8  movq %rsp, %rbp              ;   (the index==0 path never
   *                                         ;    pushes a frame)
   *   0xe6cfb  leaq _HGRectNull(%rip), %rcx ; @Helium 0x3d2284
   *   0xe6d02  movq (%rcx), %rax            ; rax = HGRectNull.lo
   *   0xe6d05  movq 0x8(%rcx), %r8          ; r8  = HGRectNull.hi
   *   0xe6d09  popq %rbp
   *   0xe6d0a  movq %r8, %rdx               ; SHARED tail: rdx = hi qword
   *   0xe6d0d  retq
   *   0xe6d0e  nop                          ; padding — not executed
   *
   * SEMANTICS: the Domain Of Definition for INPUT 0 is the requested rect
   * unchanged; every other input index has an EMPTY domain (`HGRectNull`).
   * That is the natural shape for this node — the converter reads its colour
   * planes from input 0 and nothing else contributes pixels.
   *
   * THE TAIL IS SHARED, WHICH IS WHAT MAKES THE BODY SHORT: both paths exit
   * through @0xe6d0a, so the `movq %r8, %rdx` serves double duty — on the
   * index==0 path %r8 still holds the caller's `rect.hi`, and on the other path
   * it was just overwritten with `HGRectNull.hi`. Likewise `movq %rcx, %rax`
   * @0xe6cf0 pre-loads the input's lo qword before the branch, and the
   * HGRectNull path simply overwrites it.
   *
   * `this` (%rdi) is never read and `renderer` (%rsi) is never dereferenced.
   *
   * BY-VALUE RETURN: the machine returns a COPY in `rax:rdx`, so this port
   * returns a fresh object rather than the shared `HGRectNull` binding — a
   * caller that mutated the returned rect must not be able to corrupt the
   * global, which is exactly the difference between C++'s by-value return and
   * a JS reference.
   *
   * DEPENDENCIES: none in-scope; no extern; no call. `_HGRectNull` is a data
   * symbol, already modelled in HGRect.ts.
   */
  GetDOD(
    _renderer: unknown /* HGRenderer* — never dereferenced */,
    index: number,
    rect: HGRect,
  ): HGRect {
    // @0xe6cf0  movq %rcx, %rax — the input rect is the pre-loaded default.
    // @0xe6cf3..@0xe6cf5  testl %edx, %edx ; je 0xe6d0a
    if ((index | 0) === 0) {
      // @0xe6d0a..@0xe6d0d — shared tail with %rax/%r8 still holding the input.
      return { x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom };
    }

    // @0xe6cfb..@0xe6d05  leaq _HGRectNull(%rip) ; load both qwords.
    // @0xe6d0a..@0xe6d0d — shared tail returns them.
    return {
      x: HGRectNull.x,
      y: HGRectNull.y,
      right: HGRectNull.right,
      bottom: HGRectNull.bottom,
    };
  }
}
