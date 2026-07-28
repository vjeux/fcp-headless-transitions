// HGComicColorStroke.ts — FCP Helium framework class (comic-book color-stroke render node).
//
// Transcribed from the x86_64 disassembly of Helium in
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// See raw-port/re/disasm/Helium.HGComicColorStroke.*.s.
//
// SYMBOLS (nm | c++filt):
//   0x1bc0a0  T HGComicColorStroke::HGComicColorStroke()                             (C2)
//   0x1bc0d0  T HGComicColorStroke::HGComicColorStroke()                             (C1)
//   0x1bc100  T HGComicColorStroke::~HGComicColorStroke()                            (D2)
//   0x1bc110  T HGComicColorStroke::~HGComicColorStroke()                            (D1)
//   0x1bc120  T HGComicColorStroke::~HGComicColorStroke()                            (D0)
//   0x1bc140  T HGComicColorStroke::SetParameter(int, float, float, float, float)
//   0x1bc170  T HGComicColorStroke::GetDOD(HGRenderer*, int, HGRect)
//   0x1bc190  T HGComicColorStroke::GetROI(HGRenderer*, int, HGRect)
//   0x1bc300  T HGComicColorStroke::IntermediateFormat(HGFormat) const
//   0x1bc310  T HGComicColorStroke::RenderTile(HGTile*)
//   0x1bca80  T HGComicColorStroke::GetOutput(HGRenderer*)
//   0x1bca90  T HGComicColorStroke::GetProgram(HGRenderer*)
//   0x1bcaf0  T HGComicColorStroke::BindTexture(HGHandler*, int)
//   0x1bcb90  T HGComicColorStroke::InitProgramDescriptor(HGProgramDescriptor*) const
//   0xa27660  S vtable for HGComicColorStroke (installed-ptr @0xa27670)
//
// Vtable slots (via vtable.py Helium HGComicColorStroke):
//   *0x00  D1 -> 0x1bc110      (tail-jmp to HGNode::~HGNode() @HGNodeD2)
//   *0x08  D0 -> 0x1bc120      (deleting dtor: HGNode::~HGNode() + HGObject::operator delete)
//   *0x60  SetParameter(int,float,float,float,float) -> 0x1bc140
//   *0xb0  RenderTile(HGTile*) -> 0x1bc310
//   *0xb8  GetProgram(HGRenderer*) -> 0x1bca90
//   *0xd0  BindTexture(HGHandler*, int) -> 0x1bcaf0
//   All other slots inherited from HGNode / HGObject.
//
// FIELD LAYOUT (extends HGNode)
//   HGNode base occupies +0x00..+0x198 (see raw-port/src/render/HGNode.ts).
//   HGComicColorStroke adds one field:
//     +0x198  strokeWidth : float  @Helium 0x1bc0e8 (movl $0x3f800000, 0x198(rbx) = 1.0f)
//                                   also read via `movss 0x198(...)` by SetParameter @0x1bc14f,
//                                   GetROI @0x1bc204, BindTexture @0x1bcb34, RenderTile @0x1bc32a.
//                                   Written by SetParameter @0x1bc15a.
//   HGNode base +0x11 flags: `orb $0x6, 0x11(rbx)` @Helium 0x1bc0f2 — sets bits 1 and 2 of the
//   HGNode flags byte at +0x11 (meaning per HGNode: opaque flags — not decoded here).
//   Total class size (from operator new alignment in callers): HGNode base 0x198 + 0x8 = 0x1a0
//   (only one 4-byte field is used; the rest is padding to 8-byte alignment).
//
// PROGRAM SHAPE
//   HGComicColorStroke is a Helium render node that implements the comic-book color-stroke
//   look on GPU. GetProgram returns one of two GPU shader sources depending on the target:
//     - Metal fragment shader (target > 0x60b0f) — 936-byte source at RIP-rel 0x736fb7.
//     - GLSL fragment shader (target <= 0x60b0f AND vtable[0x80](0x2e) nonzero) — 1948-byte source at RIP-rel 0x7378c9.
//   Both implement identical math:
//     For each fragment, sample tex0 (image L) and tex1 (gradient direction, .yz channels).
//     Walk 7 steps in the gradient direction (and its opposite), accumulating
//     tex0 samples weighted by exp(-i/48). Divide by norma (accumulated weight);
//     multiply by 0.5f; clamp to [0,1]. That gives the comic-stroke color output.
//   The width of the walk is scaled by strokeWidth (+0x198) — see BindTexture and GetROI,
//   which push this scalar into the pipeline as (double)strokeWidth via cvtss2sd + call.
//   RenderTile is a SIMD software fallback that reproduces the same shader in x86_64 SSE
//   (bilinear texture fetches, gradient walk, coefficient accumulation, clamp).
//
// FRONTIER CALLEES (throwing stubs — anti-shortcut Rule 3):
//   HGNode::HGNode()                                           @Helium (external)
//   HGNode::~HGNode()                                          @Helium (external)
//   HGObject::operator delete(void*)                           @Helium (external)
//   HGRect::Grow(HGRect)                                       @Helium (external)
//   HGTransform::HGTransform()                                 @Helium (external)
//   HGTransform::Scale(double, double, double)                 @Helium (external)
//   HGTransform::~HGTransform()                                @Helium (external)
//   HGTransformUtils::MinW()                                   @Helium (external)
//   HGTransformUtils::GetROI(HGTransform*,HGRect,float,float)  @Helium (external)
//   HGTile::Renderer() const                                   @Helium (external)
//   HGRenderer::GetTarget(unsigned int)                        @Helium (external)
//   HGHandler::TexCoord(int,int,int,double const*)             @Helium (external)
//   Plus HGRenderer/HGHandler vtable slots used in RenderTile / GetProgram / BindTexture.

import type { HGRect } from "./HGRect.js";
import { HGRectNull } from "./HGRect.js";

/**
 * Vtable-installed pointer address for HGComicColorStroke.
 *
 * Read from `leaq 0x86b58b(%rip), %rax; movq %rax, (%rbx)` at
 * @Helium 0x1bc0de / 0x1bc0e5 (C1 ctor) and equivalently at 0x1bc0ae/0x1bc0b5 (C2 ctor):
 *   RIP-after = 0x1bc0e5;  target = 0x1bc0e5 + 0x86b58b = 0xa27670.
 * Both charge variants install the same vtable ptr (single vtable per class).
 */
export const HGComicColorStroke_VTABLE_INSTALLED_PTR = 0xa27670 as const;

/**
 * `HGComicColorStroke::IntermediateFormat(HGFormat) const` @Helium 0x1bc300.
 *
 * Disasm (verbatim, 5 real instructions):
 *   0x1bc300  pushq  %rbp
 *   0x1bc301  movq   %rsp, %rbp
 *   0x1bc304  movl   $0x18, %eax
 *   0x1bc309  popq   %rbp
 *   0x1bc30a  retq
 *
 * Ignores its `this` and its HGFormat argument; returns the literal enumerant 0x18 = 24.
 * This is a Helium image-format enumerant (see also HGComicLUT.ts:HGComicLUT_FORMAT_ENUM = 0x11
 * for the same enum family). We carry the raw literal without inventing a name.
 */
export const HGComicColorStroke_INTERMEDIATE_FORMAT_ENUM = 0x18 as const;

export function HGComicColorStroke_IntermediateFormat(_hgFormat: number): number {
  // @Helium 0x1bc304: movl $0x18, %eax
  return HGComicColorStroke_INTERMEDIATE_FORMAT_ENUM;
}

/**
 * The HGComicColorStroke instance state — only one own field on top of HGNode.
 *
 * We model the fields we actually read/write. The HGNode base is represented opaquely as
 * _hgNode since the layout of HGNode itself is not fully decoded here (see HGNode.ts).
 */
export interface HGComicColorStrokeState {
  /** HGNode base subobject placeholder (+0x00..+0x197). Not touched by any own method
   *  except through base-class calls (HGNode::HGNode / HGNode::~HGNode) and the flags-byte
   *  update at +0x11 documented in the ctor. */
  _hgNode: unknown;
  /** +0x198  float — comic-stroke width (default 1.0f from ctor @0x1bc0e8). */
  strokeWidth: number;
  /** +0x11 flags byte (in the HGNode base) — bits 1 and 2 are OR-set by the ctor @0x1bc0f2. */
  _nodeFlags11_orMask: number;
}

/**
 * `HGComicColorStroke::HGComicColorStroke()` @Helium 0x1bc0d0 (C1) / 0x1bc0a0 (C2).
 *
 * Both charge variants are byte-identical after ICF except for the RIP-relative vtable-address
 * displacement (which resolves to the same 0xa27670 target). Verbatim disasm (C1 form):
 *   0x1bc0d0  pushq  %rbp
 *   0x1bc0d1  movq   %rsp, %rbp
 *   0x1bc0d4  pushq  %rbx
 *   0x1bc0d5  pushq  %rax
 *   0x1bc0d6  movq   %rdi, %rbx
 *   0x1bc0d9  callq  __ZN6HGNodeC2Ev            ## HGNode::HGNode()
 *   0x1bc0de  leaq   0x86b58b(%rip), %rax       ## -> 0xa27670 (vtable installed-ptr)
 *   0x1bc0e5  movq   %rax, (%rbx)               ## *this = vtable ptr
 *   0x1bc0e8  movl   $0x3f800000, 0x198(%rbx)   ## this->+0x198 = 1.0f
 *   0x1bc0f2  orb    $0x6, 0x11(%rbx)           ## this->+0x11 |= 0x6
 *   0x1bc0f6..0x1bc0fc  epilogue+retq
 */
export function HGComicColorStroke_construct(self: HGComicColorStrokeState): void {
  // @Helium 0x1bc0d9: base HGNode ctor — undecoded here.
  HGNode_HGNode_stub();
  // @Helium 0x1bc0e5: install vtable pointer 0xa27670 into *this (represented via the state's
  // vtable constant above; we don't model raw memory).
  // @Helium 0x1bc0e8: this->strokeWidth = 1.0f  (0x3f800000 = IEEE-754 single-precision 1.0).
  self.strokeWidth = Math.fround(1.0);
  // @Helium 0x1bc0f2: this->+0x11 |= 0x6 — set flag bits in the HGNode base. Undecoded semantics.
  self._nodeFlags11_orMask = (self._nodeFlags11_orMask | 0x6) & 0xff;
}

/**
 * `HGComicColorStroke::~HGComicColorStroke()` @Helium 0x1bc100 (D2) / 0x1bc110 (D1).
 *
 * Verbatim disasm (D2 form, D1 is byte-identical after epilogue tail-jmp):
 *   0x1bc100  pushq  %rbp
 *   0x1bc101  movq   %rsp, %rbp
 *   0x1bc104  popq   %rbp
 *   0x1bc105  jmp    __ZN6HGNodeD2Ev            ## HGNode::~HGNode()
 * No own state to tear down — tail-jmps into the base dtor.
 */
export function HGComicColorStroke_destruct(_self: HGComicColorStrokeState): void {
  // @Helium 0x1bc105 (D2) / 0x1bc115 (D1): tail-jmp HGNode::~HGNode().
  HGNode_dtor_stub();
}

/**
 * `HGComicColorStroke::~HGComicColorStroke()` @Helium 0x1bc120 — the deleting dtor (D0).
 *
 * Verbatim disasm:
 *   0x1bc120  pushq  %rbp
 *   0x1bc121  movq   %rsp, %rbp
 *   0x1bc124  pushq  %rbx
 *   0x1bc125  pushq  %rax
 *   0x1bc126  movq   %rdi, %rbx
 *   0x1bc129  callq  __ZN6HGNodeD2Ev            ## HGNode::~HGNode()
 *   0x1bc12e  movq   %rbx, %rdi
 *   0x1bc131..0x1bc136  restore stack/regs
 *   0x1bc137  jmp    __ZN8HGObjectdlEPv         ## HGObject::operator delete(void*)
 */
export function HGComicColorStroke_deletingDtor(_self: HGComicColorStrokeState): void {
  // @Helium 0x1bc129: HGNode::~HGNode()
  HGNode_dtor_stub();
  // @Helium 0x1bc137: HGObject::operator delete(void*) — undecoded.
  HGObject_operator_delete_stub();
}

/**
 * `HGComicColorStroke::SetParameter(int paramID, float v, float, float, float)` @Helium 0x1bc140.
 *
 * Verbatim disasm:
 *   0x1bc140  pushq  %rbp
 *   0x1bc141  movq   %rsp, %rbp
 *   0x1bc144  movl   $0xffffffff, %eax                    ## eax = -1 (default return)
 *   0x1bc149  testl  %esi, %esi                           ## if (paramID != 0)
 *   0x1bc14b  je     0x1bc14f                             ##   fall through
 *   0x1bc14d  popq   %rbp; retq                           ## else return -1
 *   0x1bc14f  ucomiss 0x198(%rdi), %xmm0                  ## compare v vs this->strokeWidth
 *   0x1bc156  jne    0x1bc15a                             ## if not equal -> set
 *   0x1bc158  jnp    0x1bc169                             ## if equal AND ordered -> return 0
 *   0x1bc15a  movss  %xmm0, 0x198(%rdi)                   ## this->strokeWidth = v
 *   0x1bc162  movl   $0x1, %eax                           ## return 1
 *   0x1bc167  popq   %rbp; retq
 *   0x1bc169  xorl   %eax, %eax                           ## return 0
 *   0x1bc16b  popq   %rbp; retq
 *
 * Semantics:
 *   - paramID != 0 -> return -1 (unknown parameter).
 *   - paramID == 0 and (v is unordered w.r.t. strokeWidth (i.e. NaN) OR v != strokeWidth):
 *       strokeWidth = v; return 1 (changed).
 *   - paramID == 0 and v == strokeWidth (ordered equal): return 0 (unchanged).
 *
 * The 3 trailing float args are IGNORED (only %xmm0 = arg1 is read). This is a single-parameter
 * setter reusing the 4-float virtual-method signature shared by many HGNode subclasses.
 */
export function HGComicColorStroke_SetParameter(
  self: HGComicColorStrokeState,
  paramID: number,
  v: number,
  _v2: number,
  _v3: number,
  _v4: number,
): number {
  // @Helium 0x1bc149-0x1bc14e
  if ((paramID | 0) !== 0) return -1 | 0;
  const cur = Math.fround(self.strokeWidth);
  const nv = Math.fround(v);
  // ucomiss @0x1bc14f: sets PF=1 (unordered) if either operand is NaN; ZF=1 iff ordered-equal.
  // The asm dispatches: `jne no-eq -> set`; `jnp ordered-equal -> return 0`.
  const unordered = Number.isNaN(cur) || Number.isNaN(nv);
  const equal = !unordered && cur === nv;
  if (equal) {
    // @Helium 0x1bc169: xorl %eax, %eax
    return 0;
  }
  // @Helium 0x1bc15a: movss %xmm0, 0x198(%rdi); @0x1bc162: movl $1, %eax
  self.strokeWidth = nv;
  return 1;
}

/**
 * `HGComicColorStroke::GetDOD(HGRenderer*, int outputIdx, HGRect inputDOD)` @Helium 0x1bc170.
 *
 * Verbatim disasm:
 *   0x1bc170  movq   %rcx, %rax                           ## rax = inputDOD.lo (x,y)
 *   0x1bc173  testl  %edx, %edx                           ## if (outputIdx != 0)
 *   0x1bc175  je     0x1bc18a                             ##   goto pass-through
 *   0x1bc177..0x1bc182  pushq %rbp; movq %rsp,%rbp
 *                       leaq _HGRectNull(%rip), %rcx
 *                       movq (%rcx), %rax                 ## rax = HGRectNull.lo (0,0)
 *                       movq 0x8(%rcx), %r8               ## r8  = HGRectNull.hi (0,0)
 *   0x1bc189  popq   %rbp
 *   0x1bc18a  movq   %r8, %rdx                            ## rdx = high half
 *   0x1bc18d  retq
 *
 * Semantics:
 *   - outputIdx == 0: return the input DOD unchanged (identity DOD — the effect writes the same
 *     pixels it reads).
 *   - outputIdx != 0: return HGRectNull ({0,0,0,0}) — there is no secondary output.
 */
export function HGComicColorStroke_GetDOD(
  _renderer: unknown,
  outputIdx: number,
  inputDOD: HGRect,
): HGRect {
  // @Helium 0x1bc173
  if ((outputIdx | 0) !== 0) {
    // @Helium 0x1bc177..0x1bc189: return HGRectNull.
    return { x: HGRectNull.x, y: HGRectNull.y, right: HGRectNull.right, bottom: HGRectNull.bottom };
  }
  // @Helium 0x1bc170/0x1bc18a: return inputDOD (identity).
  return { x: inputDOD.x, y: inputDOD.y, right: inputDOD.right, bottom: inputDOD.bottom };
}

/**
 * `HGComicColorStroke::GetROI(HGRenderer*, int inputIdx, HGRect outputROI)` @Helium 0x1bc190.
 *
 * Verbatim disasm walk (82 lines, three arms controlled by `inputIdx` in `%edx`):
 *
 *   Entry:
 *   0x1bc1a0..0x1bc1a3  save r14 = renderer, rbx = outputROI (as pair).
 *   0x1bc1a6  cmpl   $0x1, %edx
 *   0x1bc1a9  je     0x1bc204                             ## if inputIdx == 1: gradient input
 *   0x1bc1ab  testl  %edx, %edx
 *   0x1bc1ad  jne    0x1bc2b6                             ## if inputIdx > 1: return HGRectNull
 *   -- inputIdx == 0 (base image input) --
 *   0x1bc1b3..0x1bc1bb  stash outputROI at -0x30(%rbp); rbx = &outputROI on stack
 *   0x1bc1bf  movabsq $-0x700000008, %rsi                 ## grow-lo = (-8,-8) packed
 *   0x1bc1c9  movabsq $0x800000008, %rdx                  ## grow-hi = (+8,+8) packed
 *   0x1bc1d6  callq  __ZN6HGRect4GrowES_                  ## HGRect::Grow — expand ROI by +/-8 px
 *   0x1bc1db..0x1bc1ea  HGRectMake4i(-1, -1, 1, 1)
 *   0x1bc1fa  callq  __ZN6HGRect4GrowES_                  ## grow again by the (-1,-1,1,1) rect
 *                                                          ## (a HGRect::Grow(HGRect) is a union
 *                                                          ## in-place — see HGRect.ts). The two
 *                                                          ## Grow calls together enlarge the ROI
 *                                                          ## by (max(8,1)=8) in every direction
 *                                                          ## AND take the union with (-1..1) to
 *                                                          ## guarantee a non-empty ROI even at
 *                                                          ## the origin.
 *   0x1bc1ff  jmp    0x1bc2c4                             ## return the mutated stack ROI
 *   -- inputIdx == 1 (gradient input) --
 *   0x1bc204  movss  0x198(%rdi), %xmm0                   ## xmm0 = this->strokeWidth
 *   0x1bc20c  cvtss2sd %xmm0, %xmm0                       ## promote to double
 *   0x1bc210  movsd  %xmm0, -0x38(%rbp)                   ## stash
 *   0x1bc21c  movq   %r15, %rdi                           ## r15 = &HGTransform on stack
 *   0x1bc21f  callq  __ZN11HGTransformC1Ev                ## new HGTransform (identity)
 *   0x1bc224  movsd  0x20e034(%rip), %xmm2                ## xmm2 = 1.0 (double @0x3ca260)
 *   0x1bc22f  movsd  -0x38(%rbp), %xmm0                   ## xmm0 = (double)strokeWidth
 *   0x1bc234  movaps %xmm0, %xmm1                         ## xmm1 = (double)strokeWidth
 *   0x1bc237  callq  __ZN11HGTransform5ScaleEddd          ## xform.Scale(sw, sw, 1.0)
 *   0x1bc23c  callq  __ZN16HGTransformUtils4MinWEv        ## returns MinW() -> xmm0 (double)
 *   0x1bc241  movaps %xmm0, %xmm1                         ## xmm1 = MinW()
 *   0x1bc24b  movss  0x20ba75(%rip), %xmm0                ## xmm0 = 0.5f (float @0x3c7cc8)
 *   0x1bc253  movq   %r14, %rsi                           ## rsi = outputROI
 *   0x1bc256  movq   %rbx, %rdx                           ## rdx = outputROI.hi
 *   0x1bc259  callq  __ZN16HGTransformUtils6GetROIEPK11HGTransform6HGRectff
 *                    ## HGTransformUtils::GetROI(&xform, outputROI, 0.5f, MinW())
 *   0x1bc25e..0x1bc266  stash returned HGRect on stack at -0x30
 *   0x1bc26a  movabsq $-0x700000008, %rsi                 ## grow by (-8,-8)
 *   0x1bc274  movabsq $0x800000008, %rdx                  ## grow by (+8,+8)
 *   0x1bc27e  callq  HGRect::Grow                         ## expand transformed ROI by +/-8 px
 *   0x1bc283..0x1bc297  HGRectMake4i(-1,-1,1,1); Grow      ## union with (-1..1)
 *   0x1bc2af  callq  HGTransform::~HGTransform            ## destroy xform
 *   0x1bc2b4  jmp    0x1bc2c4                             ## return
 *   -- inputIdx > 1 --
 *   0x1bc2b6..0x1bc2c0  load HGRectNull; store to stack; fall to return path
 *
 * Since HGTransform, HGTransformUtils::MinW, HGTransformUtils::GetROI, HGRect::Grow are ALL
 * undecoded, the input==1 path must throw. The input>1 path is decoded (returns HGRectNull).
 * The input==0 path also depends on HGRect::Grow, so it throws too.
 */
export function HGComicColorStroke_GetROI(
  self: HGComicColorStrokeState,
  _renderer: unknown,
  inputIdx: number,
  outputROI: HGRect,
): HGRect {
  // @Helium 0x1bc1a6-0x1bc1ad
  if ((inputIdx | 0) === 1) {
    // Input 1: gradient. Must scale outputROI by strokeWidth via HGTransform, then run
    // HGTransformUtils::GetROI with (0.5f, MinW()), then Grow +/-8 and union (-1,-1,1,1).
    // Undecoded callees — throw. See @0x1bc21f, @0x1bc23c, @0x1bc259, @0x1bc27e. @0x1bc190
    void self; // real function reads self.strokeWidth
    throw new Error(
      "HGComicColorStroke::GetROI(inputIdx=1) not yet transcribed @Helium 0x1bc204 — " +
        "depends on undecoded HGTransform::HGTransform() @Helium 0x1bc21f, " +
        "HGTransform::Scale(double,double,double) @Helium 0x1bc237, " +
        "HGTransformUtils::MinW() @Helium 0x1bc23c, " +
        "HGTransformUtils::GetROI(HGTransform*,HGRect,float,float) @Helium 0x1bc259, and " +
        "HGRect::Grow(HGRect) @Helium 0x1bc27e.",
    );
  }
  // @Helium 0x1bc1ab-0x1bc1ad
  if ((inputIdx | 0) !== 0) {
    // Any input index other than 0 or 1 -> HGRectNull.
    // @Helium 0x1bc2b6..0x1bc2c0
    return { x: HGRectNull.x, y: HGRectNull.y, right: HGRectNull.right, bottom: HGRectNull.bottom };
  }
  // Input 0: base image. Grow the outputROI by +/-8 px, then union with (-1,-1,1,1).
  // HGRect::Grow(HGRect) is not decoded — throw. See @0x1bc1d6 and @0x1bc1fa.
  void outputROI;
  throw new Error(
    "HGComicColorStroke::GetROI(inputIdx=0) not yet transcribed @Helium 0x1bc1b3 — depends " +
      "on undecoded HGRect::Grow(HGRect) @Helium 0x1bc1d6 and 0x1bc1fa (grow outputROI by " +
      "+/-8 px, then union with HGRectMake4i(-1,-1,1,1)).",
  );
}

/**
 * `HGComicColorStroke::GetOutput(HGRenderer*)` @Helium 0x1bca80.
 *
 * Verbatim disasm (5 real instructions):
 *   0x1bca80  pushq  %rbp
 *   0x1bca81  movq   %rsp, %rbp
 *   0x1bca84  movq   %rdi, %rax                            ## rax = this
 *   0x1bca87  popq   %rbp
 *   0x1bca88  retq
 *
 * Trivial: returns `this` cast to `HGNode*` (the class *is* its own output node — comic
 * stroke has no separate output chain like HGAntiAlias).
 */
export function HGComicColorStroke_GetOutput(self: HGComicColorStrokeState): HGComicColorStrokeState {
  // @Helium 0x1bca84: rax = rdi = this
  return self;
}

/**
 * `HGComicColorStroke::GetProgram(HGRenderer*)` @Helium 0x1bca90.
 *
 * Verbatim disasm:
 *   0x1bca90..0x1bca96  prologue; rbx = renderer
 *   0x1bca9c  movl   $0x60000, %esi
 *   0x1bcaa1  callq  __ZN10HGRenderer9GetTargetEj         ## eax = renderer->GetTarget(0x60000)
 *   0x1bcaa6  cmpl   $0x60b0f, %eax
 *   0x1bcaab  jbe    0x1bcabb                             ## if target <= 0x60b0f: fall through
 *   0x1bcaad  leaq   0x736fb7(%rip), %rax                 ## else: return Metal shader source
 *   0x1bcab4  epilogue; retq                              ## (pointer to 936-byte const string)
 *   0x1bcabb  movq   (%rbx), %rax                         ## rbx->vtable
 *   0x1bcac1  movl   $0x2e, %esi
 *   0x1bcac6  callq  *0x80(%rax)                          ## renderer->vtable[0x80] (0x2e)
 *   0x1bcacc  movl   %eax, %ecx
 *   0x1bcace  xorl   %eax, %eax                           ## default = NULL
 *   0x1bcad0  testl  %ecx, %ecx
 *   0x1bcad2  leaq   0x7378c9(%rip), %rcx                 ## rcx = GLSL shader source
 *   0x1bcad9  cmovneq %rcx, %rax                          ## if the vtable call returned non-zero:
 *   0x1bcadd  epilogue; retq                              ##   return the GLSL source; else NULL.
 *
 * Semantics: returns one of two shader source strings depending on the render target enum:
 *   - target  > 0x60b0f: Metal fragment shader (936 bytes) at RIP-rel offset 0x736fb7.
 *   - target <= 0x60b0f AND the vtable[0x80](0x2e) call returns non-zero: GLSL source
 *     (1948 bytes) at RIP-rel offset 0x7378c9.
 *   - Otherwise: NULL.
 */
export const HGComicColorStroke_METAL_TARGET_THRESHOLD = 0x60b0f as const;

/**
 * Metal fragment shader source verbatim from Helium literal pool.
 * Loaded via `leaq 0x736fb7(%rip), %rax` at @Helium 0x1bcaad;
 * RIP-after = 0x1bcab4; target address = 0x1bcab4 + 0x736fb7 = 0x8f3a6b. 936 bytes.
 * Content is a nul-terminated C string (ObjC/C++ literal pool).
 */
export const HGComicColorStroke_METAL_SHADER_SOURCE: string =
  "//Metal1.0     \n" +
  "//LEN=0000000936\n" +
  "fragment FragmentOut fragmentFunc(VertexInOut            frag        [[ stage_in ]],\n" +
  "                                  const constant float4* hg_Params   [[ buffer(0) ]],\n" +
  "                                  texture2d< float >     hg_Texture0 [[ texture(0) ]],\n" +
  "                                  sampler                hg_Sampler0 [[ sampler(0) ]],\n" +
  "                                  texture2d< float >     hg_Texture1 [[ texture(1) ]],\n" +
  "                                  sampler                hg_Sampler1 [[ sampler(1) ]])\n" +
  "{\n" +
  "    // Get the 0'th normal (e0, for an exponent value of 0, so the coeff is 1.0)\n" +
  "    float2 pointer = static_cast<float2>(hg_Texture1.sample(hg_Sampler1, frag._texCoord1.xy).yz * 2.0f) - 1.0f;\n" +
  "    float2 pointerRBack = -pointer;\n" +
  "    \n" +
  "    float4 acc = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy);\n" +
  "    float3 norma = {0.5f, 0.5f, 0.5f};\n" +
  "    \n" +
  "    for (int i {1}; i < 8; ++i)\n" +
  "    {\n" +
  "        float coeff = exp(static_cast<float>(-i) / 48.0f);\n" +
  "        norma += coeff;\n" +
  "        \n" +
  "        const float2 uPos0 = frag._texCoord0.xy + pointer;\n" +
  "        const float2 uNeg0 = frag._texCoord0.xy + pointerRBack;\n" +
  "        \n" +
  "        const float2 uPos1 = frag._texCoord1.xy + pointer;\n" +
  "        const float2 uNeg1 = frag._texCoord1.xy + pointerRBack;\n" +
  "        \n" +
  "        float2 acc_ptrTexCoord = uPos0;\n" +
  "        float2 acc_ptrBackTexCoord = uNeg0;\n" +
  "        \n" +
  "        float2 grad_ptrTexCoord = uPos1;\n" +
  "        float2 grad_ptrBackTexCoord = uNeg1;\n" +
  "        \n" +
  "        acc.rgb += coeff * (hg_Texture0.sample(hg_Sampler0, acc_ptrTexCoord).xyz +\n" +
  "                            hg_Texture0.sample(hg_Sampler0, acc_ptrBackTexCoord).xyz);\n" +
  "        \n" +
  "        pointer += static_cast<float2>(hg_Texture1.sample(hg_Sampler1, grad_ptrTexCoord).yz * 2.0f) - 1.0f;\n" +
  "        pointerRBack -= static_cast<float2>(hg_Texture1.sample(hg_Sampler1, grad_ptrBackTexCoord).yz * 2.0f) - 1.0f;\n" +
  "    }\n" +
  "    \n" +
  "    FragmentOut out {float4(float3(acc.xyz * 0.5f / norma), acc.a)};\n" +
  "    \n" +
  "    // Ensure the result is clamped [0..1]; this is the default behavior of the original\n" +
  "    // comic effect - this was implicit due to non-float, 8-bit, intermediate buffers.\n" +
  "    out.color0 = clamp(out.color0, 0.0f, 1.0f);\n" +
  "    \n" +
  "    return out;\n" +
  "}\n" +
  "//MD5=5a5a5057:ba024132:3cb1b893:2b058d5b\n" +
  "//SIG=00000000:00000000:00000000:00000000:000f:0000:0000:0000:0000:0000:0006:0000:0002:02:0:1:0\n";

/**
 * GLSL fragment shader source verbatim from Helium literal pool.
 * Loaded via `leaq 0x7378c9(%rip), %rcx` at @Helium 0x1bcad2;
 * RIP-after = 0x1bcad9; target address = 0x1bcad9 + 0x7378c9 = 0x8f43a2. 1948 bytes.
 */
export const HGComicColorStroke_GLSL_SHADER_SOURCE: string =
  "//GLfs1.0      \n" +
  "//LEN=000000079c\n" +
  "#ifndef GL_ES\n" +
  "#define lowp\n" +
  "#define mediump\n" +
  "#define highp\n" +
  "#define precision\n" +
  "#define defaultp mediump\n" +
  "#endif\n" +
  "\n" +
  " \n" +
  "precision highp float;\n" +
  "precision highp int;\n" +
  "\n" +
  "uniform defaultp sampler2DRect hg_Texture0;\n" +
  "uniform defaultp sampler2DRect hg_Texture1;\n" +
  "\n" +
  "void main (void) \n" +
  "{\n" +
  "    float alpha = texture2DRect( hg_Texture0, gl_TexCoord[0].xy ).a;\n" +
  "    vec3 acc  =  texture2DRect( hg_Texture0, gl_TexCoord[0].xy ).xyz; //L de LAB\n" +
  "    vec3 norma  =  vec3(0.5,0.5,0.5) ;\n" +
  "    \n" +
  "    vec2 gradient = texture2DRect(hg_Texture1, gl_TexCoord[1].xy).yz; //DIRECCIONES\n" +
  "    vec2 vdire = vec2( gradient.x*2.0-1.0 , gradient.y*2.0-1.0 ) ;\n" +
  "    vec2 pointer = vec2( vdire.x  , vdire.y  ) ;\n" +
  "\n" +
  "    vdire =   vec2( -(gradient.x*2.0-1.0) , -(gradient.y*2.0-1.0) ) ;\n" +
  "    vec2 pointerRBack =   vec2(  vdire.x  ,  vdire.y  ) ;\n" +
  "\n" +
  "    for (float  i=1.0 ;i < 8.0 ;i++)    // direccion normal   1 - 7\n" +
  "    {\n" +
  "        float coeff =  exp(  - i / 48.0) ;\n" +
  "        \n" +
  "        vec2 uPos0 = gl_TexCoord[0].xy + pointer;\n" +
  "        vec2 uNeg0 = gl_TexCoord[0].xy + pointerRBack;\n" +
  "\n" +
  "        vec2 uPos1 = gl_TexCoord[1].xy + pointer;\n" +
  "        vec2 uNeg1 = gl_TexCoord[1].xy + pointerRBack;\n" +
  "\n" +
  "        acc  +=coeff * (texture2DRect(hg_Texture0, uPos0).xyz +\n" +
  "                        texture2DRect(hg_Texture0, uNeg0).xyz);\n" +
  "\n" +
  "        norma += coeff;\n" +
  "\n" +
  "        gradient  = texture2DRect(hg_Texture1, uPos1).yz; //DIRECCIONES\n" +
  "        vdire =   vec2( gradient.x*2.0-1.0 , gradient.y*2.0-1.0 );\n" +
  "        pointer +=  vdire  ;\n" +
  "\n" +
  "        gradient  = texture2DRect(hg_Texture1, uNeg1).yz; //DIRECCIONES\n" +
  "        vdire =   vec2(-( gradient.x*2.0-1.0) , -(gradient.y*2.0-1.0) );\n" +
  "        pointerRBack +=  vdire  ;\n" +
  "    }\n" +
  "    \n" +
  "    // Ensure the result is clamped [0..1]; this is the default behavior of the original\n" +
  "    // comic effect - this was implicit due to non-float, 8-bit, intermediate buffers.\n" +
  "    gl_FragColor = clamp(vec4( acc*0.5/norma, alpha), 0.0, 1.0);\n" +
  "}\n" +
  "//MD5=3f48c7c9:9fb108b9:ab3c5d18:9729c820\n" +
  "//SIG=00000000:00000000:00000000:00000000:0032:0000:0000:0000:0000:0000:0000:0000:0002:02:0:1:0\n";

export function HGComicColorStroke_GetProgram(_renderer: unknown): string | null {
  // @Helium 0x1bca9c: renderer->GetTarget(0x60000)
  // @Helium 0x1bcaa6-0x1bcaab
  // We can't call the real renderer here — this method requires the renderer's GetTarget
  // vtable slot and, on the GLSL branch, an additional vtable[0x80](0x2e) call. Both are
  // undecoded. Throw with cited addrs so the caller has to wire a real HGRenderer.
  throw new Error(
    "HGComicColorStroke::GetProgram not yet transcribed @Helium 0x1bca90 — depends on " +
      "undecoded HGRenderer::GetTarget(unsigned int) @Helium 0x1bcaa1 and HGRenderer vtable " +
      "slot *0x80 @Helium 0x1bcac6. Metal and GLSL shader sources are transcribed as " +
      "HGComicColorStroke_METAL_SHADER_SOURCE and _GLSL_SHADER_SOURCE.",
  );
}

/**
 * `HGComicColorStroke::BindTexture(HGHandler* handler, int texIdx)` @Helium 0x1bcaf0.
 *
 * Verbatim disasm:
 *   Entry:
 *   0x1bcafa..0x1bcb00  r14 = texIdx, rbx = handler, this in %r15/%rdi
 *   0x1bcb00  cmpl   $0x1, %edx
 *   0x1bcb03  je     0x1bcb1d                                ## if texIdx == 1: gradient texture
 *   0x1bcb05  testl  %r14d, %r14d
 *   0x1bcb08  jne    0x1bcb55                                ## if texIdx > 1: skip to tail
 *   -- texIdx == 0 (base image): default TexCoord --
 *   0x1bcb0a  movq   %rbx, %rdi                              ## handler->TexCoord(0, 0, 0, NULL)
 *   0x1bcb0d  xorl   %esi, %esi                              ## arg0 = 0
 *   0x1bcb0f  xorl   %edx, %edx                              ## arg1 = 0
 *   0x1bcb11  xorl   %ecx, %ecx                              ## arg2 = 0
 *   0x1bcb13  xorl   %r8d, %r8d                              ## arg3 = NULL
 *   0x1bcb16  callq  __ZN9HGHandler8TexCoordEiiiPKd
 *   0x1bcb1b  jmp    0x1bcb55                                ## tail
 *   -- texIdx == 1 (gradient): stroke-width-scaled TexCoord + a virtual call --
 *   0x1bcb1d  movq   %rdi, %r15                              ## r15 = this
 *   0x1bcb20  movq   %rbx, %rdi                              ## handler->TexCoord(1, 0, 0, NULL)
 *   0x1bcb23  movl   $0x1, %esi                              ## arg0 = 1
 *   0x1bcb28  xorl   %edx, %edx                              ## arg1 = 0
 *   0x1bcb2a  xorl   %ecx, %ecx                              ## arg2 = 0
 *   0x1bcb2c  xorl   %r8d, %r8d                              ## arg3 = NULL
 *   0x1bcb2f  callq  __ZN9HGHandler8TexCoordEiiiPKd
 *   0x1bcb34  movss  0x198(%r15), %xmm0                      ## xmm0 = this->strokeWidth
 *   0x1bcb3d  cvtss2sd %xmm0, %xmm0                          ## promote to double
 *   0x1bcb41  movq   (%rbx), %rax                            ## rax = handler->vtable
 *   0x1bcb44  movsd  0x20d714(%rip), %xmm2                   ## xmm2 = 1.0 (double @0x3ca260)
 *   0x1bcb4c  movq   %rbx, %rdi                              ## arg0 = handler
 *   0x1bcb4f  movaps %xmm0, %xmm1                            ## xmm1 = (double)strokeWidth
 *   0x1bcb52  callq  *0x68(%rax)                             ## handler->vtable[0x68](handler, sw, sw, 1.0)
 *   -- tail (all paths converge here) --
 *   0x1bcb55  movq   (%rbx), %rax
 *   0x1bcb58  movq   %rbx, %rdi
 *   0x1bcb5b  movl   %r14d, %esi                             ## arg1 = original texIdx
 *   0x1bcb5e  xorl   %edx, %edx
 *   0x1bcb60  callq  *0x48(%rax)                             ## handler->vtable[0x48](texIdx, 0)
 *   0x1bcb63  movq   (%rbx), %rax
 *   0x1bcb66  movq   %rbx, %rdi
 *   0x1bcb69  xorl   %esi, %esi                              ## arg1 = 0
 *   0x1bcb6b  callq  *0x38(%rax)                             ## handler->vtable[0x38](0)
 *   0x1bcb6e  movq   (%rbx), %rax
 *   0x1bcb71  movq   %rbx, %rdi
 *   0x1bcb74  movl   $0x1, %esi                              ## arg1 = 1
 *   0x1bcb79  movl   $0x1, %edx                              ## arg2 = 1
 *   0x1bcb7e  callq  *0x30(%rax)                             ## handler->vtable[0x30](1, 1)
 *   0x1bcb81  xorl   %eax, %eax                              ## return 0
 *
 * Every callq operates on the HGHandler* whose vtable is undecoded here. Throw.
 */
export function HGComicColorStroke_BindTexture(
  self: HGComicColorStrokeState,
  _handler: unknown,
  texIdx: number,
): number {
  // @Helium 0x1bcb00
  void self;
  void texIdx;
  throw new Error(
    "HGComicColorStroke::BindTexture not yet transcribed @Helium 0x1bcaf0 — every branch " +
      "depends on undecoded HGHandler::TexCoord(int,int,int,double const*) @Helium 0x1bcb16/" +
      "0x1bcb2f and HGHandler vtable slots *0x30 @0x1bcb7e, *0x38 @0x1bcb6b, *0x48 @0x1bcb60, " +
      "*0x68 @0x1bcb52. On texIdx==1 also reads this->strokeWidth @0x1bcb34.",
  );
}

/**
 * `HGComicColorStroke::InitProgramDescriptor(HGProgramDescriptor*) const` @Helium 0x1bcb90.
 *
 * Verbatim disasm (empty function):
 *   0x1bcb90  pushq  %rbp
 *   0x1bcb91  movq   %rsp, %rbp
 *   0x1bcb94  popq   %rbp
 *   0x1bcb95  retq
 *
 * A no-op — the default HGProgramDescriptor built by the base class is used unchanged.
 */
export function HGComicColorStroke_InitProgramDescriptor(_desc: unknown): void {
  // @Helium 0x1bcb90-0x1bcb95: empty body.
  return;
}

/**
 * `HGComicColorStroke::RenderTile(HGTile*)` @Helium 0x1bc310.
 *
 * 463-line x86_64 SSE software fallback that reproduces the comic-stroke shader (see the
 * transcribed shader sources above): gradient-directed 7-step accumulation of tex0 samples,
 * bilinear texture fetches, exp(-i/48) coefficient weighting, divide-by-norma, times-0.5, clamp
 * to [0,1]. Not transcribed in this pass — the loop nest carries at least four RIP-relative
 * constant vectors (@0x20dd24, @0x20dd2c, @0x20b86b, @0x20b883, @0x20b6a8, @0x20b659, @0x6a1669,
 * @0x20b869 among others) that need per-constant decoding.
 */
export function HGComicColorStroke_RenderTile(_self: HGComicColorStrokeState, _tile: unknown): void {
  // @Helium 0x1bc310
  throw new Error(
    "HGComicColorStroke::RenderTile @Helium 0x1bc310 not yet transcribed — 463-line SSE " +
      "software fallback of the comic-color-stroke shader; requires decoding of RIP-relative " +
      "SIMD constant vectors at @0x20dd24, @0x20dd2c, @0x20b86b, @0x20b883, @0x20b6a8, " +
      "@0x20b659, @0x6a1669, @0x20b869 and of HGTile::Renderer() @0x1bc339 plus HGNode vtable " +
      "slot *0x138 @0x1bc347.",
  );
}

// FRONTIER CALLEE STUBS
// Each stub cites the @0xADDR site(s) where the real symbol is invoked from this file.
// These are placeholders that must be replaced by real transcriptions of their owning classes.

function HGNode_HGNode_stub(): void {
  // Called from HGComicColorStroke ctor @Helium 0x1bc0a9 (C2) / 0x1bc0d9 (C1).
  throw new Error("HGNode::HGNode() @Helium 0x1bc0d9 not yet transcribed");
}

function HGNode_dtor_stub(): void {
  // Called from HGComicColorStroke dtors @Helium 0x1bc105 (D2), 0x1bc115 (D1), 0x1bc129 (D0).
  throw new Error("HGNode::~HGNode() @Helium 0x1bc105 not yet transcribed");
}

function HGObject_operator_delete_stub(): void {
  // Called from HGComicColorStroke::~HGComicColorStroke() D0 @Helium 0x1bc137.
  throw new Error("HGObject::operator delete(void*) @Helium 0x1bc137 not yet transcribed");
}
