// HGAVASpatialAverageAdaptive_LowerField.ts — Helium "Adaptive Video
// Analysis: Spatial Average (Adaptive, Lower Field)" node. Part of the
// deinterlacing pipeline; the "LowerField" variant works on the bottom-field
// scanlines of an interlaced frame, using a spatial average kernel that
// depends on which input is being queried:
//
//   - input 0 (the primary image plane)  needs a 4-wide × 2-tall neighbour
//     halo above (grow left 4, up 2, right 4, down 1)
//   - input 1 (an auxiliary "motion mask" or "prev-field" plane, judging by
//     the AVA-family sibling nodes) uses a slightly different halo (grow
//     left 5, up 2, right 4, down 0 — the extra left pixel and the missing
//     bottom pixel are consistent with reading the OTHER field of the
//     interlaced source)
//   - any other input: HGRectNull (no ROI dependency)
//
// GetDOD is simpler: for inputs 0 and 1 the DOD is the passed-in rect (this
// filter doesn't grow its output beyond what the caller wants); for input 2
// or higher (aux planes not consumed here) return HGRectNull.
//
// The subclass carries at least one owned std::string-like buffer at
// this+0x190/+0x198 that D0 releases before chaining to HGNode::~HGNode().
//
// Transcribed from FCP Helium framework at:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// Disassembly saved at:
//   raw-port/re/disasm/Helium.HGAVASpatialAverageAdaptive_LowerField.GetDOD.s (13 lines)
//   raw-port/re/disasm/Helium.HGAVASpatialAverageAdaptive_LowerField.GetROI.s (37 lines)
//   raw-port/re/disasm/Helium.HGAVASpatialAverageAdaptive_LowerField.~HGAVASpatialAverageAdaptive_LowerField.s (D0 body, 20 lines)
//
// Four exported symbols:
//   @Helium 0x221ee0  ~D1 (complete-object; 5-byte thin trampoline per the
//                          Helium subclass pattern — jmp base D2)
//   @Helium 0x221f30  ~D0 (deleting)
//   @Helium 0x221f80  GetDOD
//   @Helium 0x221fa0  GetROI
//
// ─── GetROI @Helium 0x221fa0 ───────────────────────────────────────────────────
//   __ZN38HGAVASpatialAverageAdaptive_LowerField6GetROIEP10HGRendereri6HGRect:
//     0x221fa0  frame setup (pushq r14, rbx)
//     0x221fa7  movq  %r8, %rbx           ; save roi.high
//     0x221faa  movq  %rcx, %r14          ; save roi.low
//     0x221fad  testl %edx, %edx          ; inputIdx == 0?
//     0x221faf  je    0x221fc9            ; -> input-0 path
//     0x221fb1  cmpl  $0x1, %edx          ; inputIdx == 1?
//     0x221fb4  jne   0x221ff7            ; -> HGRectNull path
//     ; input-1 grow rect: (-5, -2, 4, 0)
//     0x221fb6  movl  $0xfffffffb, %edi   ; arg1 = -5
//     0x221fbb  movl  $0xfffffffe, %esi   ; arg2 = -2
//     0x221fc0  movl  $0x4,        %edx   ; arg3 =  4
//     0x221fc5  xorl  %ecx, %ecx           ; arg4 =  0
//     0x221fc7  jmp   0x221fdd
//     ; input-0 grow rect: (-4, -2, 4, 1)
//     0x221fc9  movl  $0xfffffffc, %edi   ; arg1 = -4
//     0x221fce  movl  $0xfffffffe, %esi   ; arg2 = -2
//     0x221fd3  movl  $0x4,        %edx   ; arg3 =  4
//     0x221fd8  movl  $0x1,        %ecx   ; arg4 =  1
//     0x221fdd  callq _HGRectMake4i        ; build grow-rect
//     0x221fe2  movq  %rdx, %rcx           ; grow.high
//     0x221fe5  movq  %r14, %rdi           ; roi.low
//     0x221fe8  movq  %rbx, %rsi           ; roi.high
//     0x221feb  movq  %rax, %rdx           ; grow.low
//     0x221ff2  jmp   _HGRectGrow          ; TAIL CALL
//     ; HGRectNull path
//     0x221ff7  leaq  _HGRectNull(%rip), %rcx
//     0x221ffe  movq  (%rcx), %rax
//     0x222001  movq  0x8(%rcx), %rdx
//     0x222009  retq
//
// ─── GetDOD @Helium 0x221f80 ───────────────────────────────────────────────────
//   __ZN38HGAVASpatialAverageAdaptive_LowerField6GetDODEP10HGRendereri6HGRect:
//     0x221f80  movq  %rcx, %rax           ; %rax = r.low
//     0x221f83  cmpl  $0x2, %edx           ; inputIdx < 2?
//     0x221f86  jb    0x221f9b             ; -> identity
//     0x221f88  frame setup, load HGRectNull
//     0x221f8c  leaq  _HGRectNull(%rip), %rcx
//     0x221f93  movq  (%rcx), %rax
//     0x221f96  movq  0x8(%rcx), %r8
//     0x221f9a  popq  %rbp
//     0x221f9b  movq  %r8, %rdx            ; %rdx = r.high (or HGRectNull's high)
//     0x221f9e  retq
//
// Semantics: for `inputIdx == 0 || inputIdx == 1` return `r` unchanged;
// otherwise HGRectNull. The `jb` (unsigned below) makes the branch treat the
// input index as unsigned, which matters if a caller ever passes a signed -1
// (it would fold to a huge unsigned and go through the HGRectNull path).
//
// ─── D0 @Helium 0x221f30 ─────────────────────────────────────────────────────
//   __ZN38HGAVASpatialAverageAdaptive_LowerFieldD0Ev:
//     0x221f30  frame setup
//     0x221f36  movq  %rdi, %rbx                 ; save `this`
//     0x221f39  leaq  0x80f028(%rip), %rax       ; load class vtable pointer
//     0x221f40  movq  %rax, (%rdi)               ; restore vtable
//     0x221f43  movq  0x198(%rdi), %rax          ; load this+0x198 (owned buffer end/cap)
//     0x221f4a  testq %rax, %rax                 ; null?
//     0x221f4d  je    0x221f5d
//     0x221f4f  movq  -0x8(%rax), %rdi           ; load this+0x190 (buffer base pointer)
//     0x221f53  testq %rdi, %rdi                 ; null?
//     0x221f56  je    0x221f5d
//     0x221f58  callq __ZdlPv                     ; operator delete(buf)
//     0x221f5d  movq  %rbx, %rdi
//     0x221f60  callq __ZN6HGNodeD2Ev              ; base D2
//     0x221f68  frame teardown
//     0x221f6e  jmp   __ZN8HGObjectdlEPv          ; HGObject::operator delete(this)
//
// The `movq -0x8(%rax), %rdi ; testq ; callq __ZdlPv` sequence at 0x221f4f is
// classic libc++ `basic_string` inline-storage tear-down: `this+0x198` holds
// the "capacity" (end-of-storage) pointer and `-0x8` before it holds the
// "begin-of-storage" pointer. When both are non-null the string is on the
// heap and gets freed. Preserved as a paired-field release below.
//
// Struct layout proved by these loads:
//   this+0x000 : vtable (Itanium ABI)
//   this+0x190 : owned char* (buffer base) — read at -0x8(%rax) after 0x221f43
//   this+0x198 : owned char* (buffer end/capacity)
//   … other fields exist on the HGNode base subobject (not touched here)
//
// FRONTIER CALLEES (undecoded — throwing stubs cite them):
//   __ZdlPv                       operator delete(void*)  (stub @ 0x3c4fa0)
//   __ZN6HGNodeD2Ev               HGNode::~HGNode()       @Helium 0x221f60
//   __ZN8HGObjectdlEPv            HGObject::operator delete(void*) @Helium 0x221f6e

import {
  HGRect,
  HGRectGrow,
  HGRectMake4i,
  HGRectNull as HGRectNullConst,
} from "./HGRect.js";
export { HGRect };

/**
 * Opaque handle for Helium's `HGRenderer*` render-graph context.
 */
export type HGRendererPtr = { readonly __brand: "HGRenderer" };

/**
 * Frontier: `HGNode::~HGNode()` — the base subobject destructor. Called
 * from D0 @Helium 0x221f60.
 */
function HGNode_D2(_self: HGAVASpatialAverageAdaptive_LowerField): void {
  // @Helium 0x221f60 callq __ZN6HGNodeD2Ev
  throw new Error(
    "HGNode::~HGNode() not yet transcribed " +
      "(frontier callee @Helium 0x221f60 in HGAVASpatialAverageAdaptive_LowerField::~D0)",
  );
}

/**
 * Owned inline libc++ std::string layout at this+0x190/+0x198. Modelled as a
 * small holder so the D0 tear-down chain still has something to release.
 */
export interface OwnedStringBuffer {
  /** this+0x190 : begin-of-storage pointer (may be null when in SBO/empty). */
  begin: object | null;
  /** this+0x198 : end-of-storage (capacity) pointer (null iff begin null). */
  endOfStorage: object | null;
}

/**
 * `HGAVASpatialAverageAdaptive_LowerField` — Helium deinterlacing node.
 *
 * @Helium symbols owned by this class:
 *   GetROI  @0x221fa0
 *   GetDOD  @0x221f80
 *   ~D1      @0x221ee0
 *   ~D0      @0x221f30
 */
export class HGAVASpatialAverageAdaptive_LowerField {
  /** this+0x190/+0x198 — owned std::string-like buffer released in D0. */
  ownedBuffer: OwnedStringBuffer = { begin: null, endOfStorage: null };

  /**
   * GetROI(HGRenderer* renderer, int inputIdx, HGRect roi)
   * @Helium 0x221fa0.
   *
   * Grows the passed-in ROI by an input-index-dependent halo:
   *   inputIdx == 0  → grow (-4, -2, 4, 1)   (four left, two up, four right, one down)
   *   inputIdx == 1  → grow (-5, -2, 4, 0)   (asymmetric: extra-left, missing-bottom)
   *   otherwise      → HGRectNull            (no ROI dependency)
   */
  GetROI(_renderer: HGRendererPtr, inputIdx: number, roi: HGRect): HGRect {
    // @Helium 0x221fad: `testl %edx, %edx ; je 0x221fc9`
    if ((inputIdx | 0) === 0) {
      // @Helium 0x221fc9..0x221fd8: HGRectMake4i(-4, -2, 4, 1)
      const grow = HGRectMake4i(-4, -2, 4, 1);
      // @Helium 0x221ff2: jmp _HGRectGrow — TAIL CALL
      return HGRectGrow(roi, grow);
    }
    // @Helium 0x221fb1..0x221fb4: `cmpl $0x1, %edx ; jne 0x221ff7`
    if ((inputIdx | 0) === 1) {
      // @Helium 0x221fb6..0x221fc5: HGRectMake4i(-5, -2, 4, 0)
      const grow = HGRectMake4i(-5, -2, 4, 0);
      // @Helium 0x221ff2: jmp _HGRectGrow — TAIL CALL
      return HGRectGrow(roi, grow);
    }
    // @Helium 0x221ff7..0x222009: return HGRectNull
    return HGRectNullConst;
  }

  /**
   * GetDOD(HGRenderer* renderer, int inputIdx, HGRect r)
   * @Helium 0x221f80.
   *
   * For `inputIdx < 2` (i.e. 0 or 1) return `r` unchanged; otherwise
   * HGRectNull. The disasm uses `cmpl $0x2, %edx ; jb` — an UNSIGNED
   * comparison, so a negative `inputIdx` would fold to a huge unsigned and
   * fall into the HGRectNull branch. We mirror that with `>>> 0`.
   */
  GetDOD(_renderer: HGRendererPtr, inputIdx: number, r: HGRect): HGRect {
    // @Helium 0x221f83..0x221f86: `cmpl $0x2, %edx ; jb 0x221f9b` (unsigned)
    if ((inputIdx >>> 0) < 2) {
      // @Helium fall-through @0x221f9b: return r
      return r;
    }
    // @Helium 0x221f8c..0x221f9a: return HGRectNull
    return HGRectNullConst;
  }

  /**
   * ~HGAVASpatialAverageAdaptive_LowerField() (D1 — complete-object)
   * @Helium 0x221ee0. By the Helium subclass pattern (see HGLensGDC_BL,
   * HGCSolidColor, HDemosaic_1, HDemosaic_2 — all previously ported), D1 is
   * a 5-byte thin trampoline that tail-calls the base subobject destructor.
   *
   * In this case the "base" is HGNode + the string tear-down at +0x190/+0x198.
   * The disasm at 0x221ee0 is not captured separately (the extraction picked
   * up D0 at 0x221f30), but the pattern is universal in this codebase.
   */
  destroy(): void {
    // @Helium 0x221ee0 → the tail-called chain replicates D0's tear-down
    // (release ownedBuffer, then HGNode::D2). See destroyAndFree for details.
    this.releaseOwnedBuffer();
    HGNode_D2(this);
  }

  /**
   * ~HGAVASpatialAverageAdaptive_LowerField() (D0 — deleting)
   * @Helium 0x221f30.
   *
   * Sequence:
   *   0x221f39  restore class vtable
   *   0x221f43  release owned buffer at this+0x190/+0x198 via __ZdlPv
   *   0x221f60  base HGNode::~HGNode()
   *   0x221f6e  HGObject::operator delete(this)
   */
  destroyAndFree(): void {
    // @Helium 0x221f39..0x221f40: restore vtable — no-op in TS
    // @Helium 0x221f43..0x221f58: release owned string buffer
    this.releaseOwnedBuffer();
    // @Helium 0x221f60: HGNode::~HGNode()
    HGNode_D2(this);
    // @Helium 0x221f6e: jmp HGObject::operator delete(this) — TS GC subsumes.
  }

  /**
   * The paired-field release at @Helium 0x221f43..0x221f58:
   *   movq 0x198(%rdi), %rax    ; end-of-storage
   *   testq %rax, %rax          ; null?
   *   movq -0x8(%rax), %rdi     ; begin-of-storage (this+0x190)
   *   testq %rdi, %rdi          ; null?
   *   callq __ZdlPv             ; operator delete(begin)
   */
  private releaseOwnedBuffer(): void {
    // @Helium 0x221f43: load this+0x198
    const eos = this.ownedBuffer.endOfStorage;
    // @Helium 0x221f4a: null? -> skip release
    if (eos === null) return;
    // @Helium 0x221f4f: load this+0x190 (implicit -0x8 offset from eos into
    // the paired-slot struct — we represent that logically via the interface).
    const begin = this.ownedBuffer.begin;
    // @Helium 0x221f53: null? -> skip release
    if (begin === null) return;
    // @Helium 0x221f58 callq __ZdlPv — TS GC subsumes, but we clear the
    // fields so subsequent D0 calls (double-destroy) don't re-enter.
    this.ownedBuffer = { begin: null, endOfStorage: null };
  }
}

