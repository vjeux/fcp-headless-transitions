// HgcAVASpatialAverageAdaptive_LowerField.ts — Helium's inner "Hgc"-prefixed handler-callable
// for the AVA (Adaptive Video Analysis) spatial-average deinterlace filter, LOWER-field variant.
//
// Companion to HGAVASpatialAverageAdaptive_LowerField (the outer HGNode subclass — see
// raw-port/src/render/HGAVASpatialAverageAdaptive_LowerField.ts). The Hgc* class here is the
// GPU-shader-carrying implementation: it owns the parameter block passed to the shader
// (hg_Params) and provides Bind / BindTexture / RenderTile / RenderTile_AVX / GetProgram /
// InitProgramDescriptor / shaderDescription.
//
// Transcribed from the x86_64 disassembly of Helium in
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// See raw-port/re/disasm/Helium.HgcAVASpatialAverageAdaptive_LowerField.*.s.
//
// SYMBOLS (nm | c++filt):
//   0x21cec0  T HgcAVASpatialAverageAdaptive_LowerField::GetProgram(HGRenderer*)
//   0x21cef0  T HgcAVASpatialAverageAdaptive_LowerField::InitProgramDescriptor(HGProgramDescriptor*) const
//   0x21d670  T HgcAVASpatialAverageAdaptive_LowerField::shaderDescription() const
//   0x21d6d0  T HgcAVASpatialAverageAdaptive_LowerField::BindTexture(HGHandler*, int)
//   0x21da10  T HgcAVASpatialAverageAdaptive_LowerField::Bind(HGHandler*)
//   0x21da60  T HgcAVASpatialAverageAdaptive_LowerField::RenderTile_AVX(HGTile*)
//   0x21e470  T HgcAVASpatialAverageAdaptive_LowerField::RenderTile(HGTile*)
//   0x21ef10  T HgcAVASpatialAverageAdaptive_LowerField::GetDOD(HGRenderer*, int, HGRect)
//   0x21ef70  T HgcAVASpatialAverageAdaptive_LowerField::GetROI(HGRenderer*, int, HGRect)
//   0x21eff0  T HgcAVASpatialAverageAdaptive_LowerField::HgcAVASpatialAverageAdaptive_LowerField()  (C2)
//   0x21f1c0  T HgcAVASpatialAverageAdaptive_LowerField::HgcAVASpatialAverageAdaptive_LowerField()  (C1 tail-jmps to C2)
//   0x21f1d0  T HgcAVASpatialAverageAdaptive_LowerField::~HgcAVASpatialAverageAdaptive_LowerField() (D2)
//   0x21f220  T HgcAVASpatialAverageAdaptive_LowerField::~HgcAVASpatialAverageAdaptive_LowerField() (D1)
//   0x21f270  T HgcAVASpatialAverageAdaptive_LowerField::~HgcAVASpatialAverageAdaptive_LowerField() (D0)
//   0x21f2c0  T HgcAVASpatialAverageAdaptive_LowerField::SetParameter(int, float, float, float, float)
//   0x21f330  T HgcAVASpatialAverageAdaptive_LowerField::GetParameter(int, float*)
//   0x21f370  T HgcAVASpatialAverageAdaptive_LowerField::GetOutput(HGRenderer*)
//
// FIELD LAYOUT (extends HGNode)
//   HGNode base +0x00..+0x197 opaque.
//   +0x198  aligned pointer into a heap block. Same 32-byte alignment idiom as
//           HgcMultiplyAlpha (raw = *(aligned - 8)):
//              raw = operator new[](0x207)                                @Flexo-analogue @0x21f00e
//              aligned = raw + ((-(raw+8)) & 0x1f) + 8                     @0x21f013..0x21f020
//              *(aligned - 8) = raw                                        @0x21f024
//              this->+0x198 = aligned                                     (stored later)
//           The block is initialized with a mix of zero-vectors and RIP-relative constant
//           vectors at offsets 0x08..0x1a0 (see raw-port/re/disasm/*.HgcAVA*.HgcAVA*.s @0x21f028..).
//           Each pair of adjacent 16-byte slots receives the same xmm value (paired-store idiom),
//           strongly suggesting the block holds (parameter, parameter-shadow) pairs — likely
//           the shader's hg_Params[0..N] with a "pending" and "committed" copy that SetParameter
//           writes.
//
// The first 16 bytes of the block (offsets +0x00 and +0x10 into the aligned block) hold the
// FIRST 4 floats read/written by SetParameter/GetParameter (paramID must be 0 for those to
// engage; see disasm below).
//
// FRONTIER CALLEES (throw-stubbed for calls that require external symbols):
//   HGNode::HGNode() / HGNode::~HGNode() / HGNode::ClearBits()  @Helium
//   HGObject::operator delete(void*) @Helium
//   operator new[] / delete           @Helium (stubs 0x3c4fac / 0x3c4fa0)
//   HGRenderer::GetTarget / GetInput / GetDOD  @Helium
//   HGHandler::TexCoord(int,int,int,double const*)  @Helium
//   HGRect::Grow, HGRectMake4i  @Helium (Grow, HGRectMake4i)
//
// FILE STATUS: partial port. Simple accessors (Get/SetParameter, GetOutput, GetDOD, GetROI,
// shaderDescription, GetProgram (branch condition + shader source constant)) are transcribed
// with full @0xADDR citations. Heavy methods (ctor's constant-table init, RenderTile,
// RenderTile_AVX, InitProgramDescriptor, BindTexture, Bind) are throw-stubs with cited addrs.

import type { HGRect } from "./HGRect.js";
import { HGRectNull, HGRectInfinite } from "./HGRect.js";

/**
 * Vtable-installed pointer address for HgcAVASpatialAverageAdaptive_LowerField.
 * From ctor C2 @Helium 0x21efff (leaq 0x811f62(%rip)); RIP-after = 0x21f006;
 *   target = 0x21f006 + 0x811f62 = 0xa30f68.
 * Also reset by D0 @0x21f279 (leaq 0x811ce8(%rip)); target = 0x21f280 + 0x811ce8 = 0xa30f68.
 */
export const HgcAVASpatialAverageAdaptive_LowerField_VTABLE_INSTALLED_PTR = 0xa30f68 as const;

/** State of a HgcAVASpatialAverageAdaptive_LowerField instance. */
export interface HgcAVASpatialAverageAdaptive_LowerFieldState {
  /** HGNode base placeholder (+0x00..+0x197). */
  _hgNode: unknown;
  /** +0x198 aligned pointer into the 0x207-byte parameter-block heap allocation.
   *  Modeled here as a Float32Array of length >= 0x200/4 = 128 float32 slots.
   *  Real function stores the raw allocation pointer at (aligned - 8).
   *  SetParameter/GetParameter interact with the FIRST 4 floats at offsets 0x00..0x0c
   *  (see method docs). */
  paramBlock: Float32Array | null;
  /** Raw buffer that owns paramBlock; freed by D0 (`operator delete(*(aligned - 8))`). */
  _paramBlockRaw: ArrayBuffer | null;
}

/**
 * `HgcAVASpatialAverageAdaptive_LowerField::HgcAVASpatialAverageAdaptive_LowerField()`
 * @Helium 0x21eff0 (C2) / 0x21f1c0 (C1 — tail-jmps to C2).
 *
 * Verbatim disasm walk of C2 (partial — the head is transcribed, the 500-byte constant-table
 * init at 0x21f028..0x21f1bf is deferred to a full second pass):
 *   0x21eff0  prologue; rbx = this
 *   0x21effa  callq  __ZN6HGNodeC2Ev                    ## HGNode base ctor
 *   0x21efff  leaq   0x811f62(%rip), %rax               ## rax = 0xa30f68 (vtable installed-ptr)
 *   0x21f006  movq   %rax, (%rbx)                       ## *this = vtable
 *   0x21f009  movl   $0x207, %edi                       ## sz = 0x207 (519 bytes)
 *   0x21f00e  callq  __Znam                             ## rax = operator new[](0x207)
 *   0x21f013..0x21f020  aligned = raw + ((-(raw+8)) & 0x1f) + 8      (32-byte alignment)
 *   0x21f024  movq   %rax, (%rcx,%rax)                  ## *(aligned - 8) = raw
 *   0x21f028..0x21f1bf  fill the aligned block with paired-store constants (RIP-rel float
 *                       vectors at 0x1a8bf4, 0x1a8bf3, 0x66d778, 0x66d771, 0x66d76a, 0x66d763,
 *                       0x1ab047, 0x1a8c2f, 0x1ab1fb, 0x1abe7f, ...; not yet decoded here).
 *   0x21f1bc (approx)  movq   this->paramBlockAligned = aligned into this->+0x198
 *   epilogue
 *
 * We THROW rather than emit a fitted stand-in — the 30+ RIP-relative constants inside the init
 * block ARE the shader's parameter table, and getting them wrong would silently corrupt every
 * downstream deinterlace.
 */
export function HgcAVASpatialAverageAdaptive_LowerField_construct(
  self: HgcAVASpatialAverageAdaptive_LowerFieldState,
): void {
  // @Helium 0x21eff0 (C2) / 0x21f1c0 (C1)
  void self;
  throw new Error(
    "HgcAVASpatialAverageAdaptive_LowerField::HgcAVASpatialAverageAdaptive_LowerField() " +
      "not yet transcribed @Helium 0x21eff0 — depends on undecoded HGNode::HGNode() @0x21effa " +
      "and on the parameter-block constant-table init at @0x21f028..0x21f1bf (30+ RIP-relative " +
      "float vectors at Helium data addresses 0x1a8bf4, 0x1a8bf3, 0x66d778, 0x66d771, 0x66d76a, " +
      "0x66d763, 0x1ab047, 0x1a8c2f, 0x1ab1fb, 0x1abe7f which each need per-constant decoding).",
  );
}

/**
 * `HgcAVASpatialAverageAdaptive_LowerField::~HgcAVASpatialAverageAdaptive_LowerField()`
 * @Helium 0x21f270 (D0 — the deleting dtor). D2/D1 have the same core (reset vtable, free
 * param-block via raw pointer at aligned-8, then HGNode::~HGNode()); D0 additionally tail-jmps
 * to HGObject::operator delete on the whole object.
 *
 * Verbatim disasm of D0:
 *   0x21f270  prologue; rbx = this
 *   0x21f279  leaq   0x811ce8(%rip), %rax               ## reset vtable ptr = 0xa30f68
 *   0x21f280  movq   %rax, (%rdi)
 *   0x21f283  movq   0x198(%rdi), %rax                  ## aligned = this->+0x198
 *   0x21f28a  testq  %rax, %rax
 *   0x21f28d  je     0x21f29d                           ## if (aligned == 0) skip
 *   0x21f28f  movq   -0x8(%rax), %rdi                   ## raw = *(aligned - 8)
 *   0x21f293  testq  %rdi, %rdi
 *   0x21f296  je     0x21f29d                           ## if (raw == 0) skip
 *   0x21f298  callq  __ZdlPv                            ## operator delete(raw)
 *   0x21f29d  movq   %rbx, %rdi
 *   0x21f2a0  callq  __ZN6HGNodeD2Ev                    ## HGNode::~HGNode()
 *   0x21f2a5..0x21f2ad  restore stack
 *   0x21f2ae  jmp    __ZN8HGObjectdlEPv                 ## HGObject::operator delete(void*)
 */
export function HgcAVASpatialAverageAdaptive_LowerField_deletingDtor(
  self: HgcAVASpatialAverageAdaptive_LowerFieldState,
): void {
  // @Helium 0x21f283..0x21f298: free raw allocation.
  self.paramBlock = null;
  self._paramBlockRaw = null;
  // @Helium 0x21f2a0: HGNode::~HGNode()
  HGNode_dtor_stub();
  // @Helium 0x21f2ae: HGObject::operator delete(void*)
  HGObject_operator_delete_stub();
}

/**
 * `HgcAVASpatialAverageAdaptive_LowerField::SetParameter(int, float, float, float, float)`
 * @Helium 0x21f2c0.
 *
 * Verbatim disasm:
 *   0x21f2c0  movl   $0xffffffff, %eax                  ## return -1 (default)
 *   0x21f2c5  testl  %esi, %esi                         ## if (paramID != 0)
 *   0x21f2c7  je     0x21f2ca                           ##   fall through
 *   0x21f2c9  retq                                      ## else return -1
 *   0x21f2ca  movq   0x198(%rdi), %rax                  ## rax = this->paramBlock (aligned)
 *   0x21f2d1  movss  (%rax), %xmm4                      ## xmm4 = block[0]
 *   0x21f2d5  ucomiss %xmm0, %xmm4                      ## compare block[0] vs v0
 *   0x21f2d8  jne    0x21f300                           ## if not equal -> set
 *   0x21f2da  jp     0x21f300                           ## if unordered  -> set
 *   0x21f2dc  movss  0x4(%rax), %xmm4                   ## xmm4 = block[1]
 *   0x21f2e1  ucomiss %xmm1, %xmm4
 *   0x21f2e4  jne    0x21f300
 *   0x21f2e6  jp     0x21f300
 *   0x21f2e8  movss  0x8(%rax), %xmm4                   ## block[2]
 *   0x21f2ed  ucomiss %xmm2, %xmm4
 *   0x21f2f0  jne    0x21f300
 *   0x21f2f2  jp     0x21f300
 *   0x21f2f4  movss  0xc(%rax), %xmm4                   ## block[3]
 *   0x21f2f9  ucomiss %xmm3, %xmm4
 *   0x21f2fc  jne    0x21f300
 *   0x21f2fe  jnp    0x21f329                           ## all four equal AND ordered -> return 0
 *
 *   0x21f300  pushq  %rbp; movq %rsp,%rbp
 *   0x21f304  insertps $0x10, %xmm1, %xmm0              ## xmm0 = [v0, v1, xmm0.2, xmm0.3]
 *   0x21f30a  insertps $0x20, %xmm2, %xmm0              ## xmm0 = [v0, v1, v2, xmm0.3]
 *   0x21f310  insertps $0x30, %xmm3, %xmm0              ## xmm0 = [v0, v1, v2, v3]
 *   0x21f316  movups %xmm0, 0x10(%rax)                  ## paramBlock[0x10..0x1f] = [v0,v1,v2,v3]
 *   0x21f31a  movups %xmm0, (%rax)                      ## paramBlock[0x00..0x0f] = [v0,v1,v2,v3]
 *   0x21f31d  callq  __ZN6HGNode9ClearBitsEv            ## HGNode::ClearBits()
 *   0x21f322  return 1
 *
 *   0x21f329  return 0
 *
 * Semantics: paramID must be 0. Sets 4-vector (v0,v1,v2,v3) into both `paramBlock[0..3]`
 * (offsets 0..0x0c) and its shadow at `paramBlock[4..7]` (offsets 0x10..0x1c). The paired
 * write pattern matches the ctor's paired-init idiom (pending/committed). Change-detection:
 * if all four floats are already ordered-equal to the incoming ones, no-op and return 0.
 * Otherwise write both slots, ClearBits() the HGNode, and return 1.
 */
export function HgcAVASpatialAverageAdaptive_LowerField_SetParameter(
  self: HgcAVASpatialAverageAdaptive_LowerFieldState,
  paramID: number,
  v0: number,
  v1: number,
  v2: number,
  v3: number,
): number {
  // @Helium 0x21f2c5-0x21f2c9
  if ((paramID | 0) !== 0) return -1 | 0;
  const p = self.paramBlock;
  if (p === null) {
    // Real ctor guarantees p != NULL, but if we're partial-ported and construct threw,
    // downstream calls must NOT silently pretend to write.
    throw new Error(
      "HgcAVASpatialAverageAdaptive_LowerField::SetParameter @Helium 0x21f2ca — paramBlock " +
        "is null; ctor @Helium 0x21eff0 has not been transcribed and thus never allocated it.",
    );
  }
  const nv0 = Math.fround(v0);
  const nv1 = Math.fround(v1);
  const nv2 = Math.fround(v2);
  const nv3 = Math.fround(v3);
  const c0 = Math.fround(p[0]);
  const c1 = Math.fround(p[1]);
  const c2 = Math.fround(p[2]);
  const c3 = Math.fround(p[3]);
  // ucomiss semantics: jne || jp -> "not-equal or unordered" branches to the SET path.
  // Ordered-equal on all 4 -> "return 0" path.
  const orderedEqAll =
    !Number.isNaN(c0) && !Number.isNaN(nv0) && c0 === nv0 &&
    !Number.isNaN(c1) && !Number.isNaN(nv1) && c1 === nv1 &&
    !Number.isNaN(c2) && !Number.isNaN(nv2) && c2 === nv2 &&
    !Number.isNaN(c3) && !Number.isNaN(nv3) && c3 === nv3;
  if (orderedEqAll) {
    // @Helium 0x21f329: xorl %eax, %eax
    return 0;
  }
  // @Helium 0x21f304-0x21f31a: write (v0,v1,v2,v3) to both p[0..3] and p[4..7].
  p[0] = nv0;
  p[1] = nv1;
  p[2] = nv2;
  p[3] = nv3;
  p[4] = nv0;
  p[5] = nv1;
  p[6] = nv2;
  p[7] = nv3;
  // @Helium 0x21f31d: HGNode::ClearBits()
  HGNode_ClearBits_stub();
  // @Helium 0x21f322: movl $1, %eax
  return 1;
}

/**
 * `HgcAVASpatialAverageAdaptive_LowerField::GetParameter(int, float*)` @Helium 0x21f330.
 *
 * Verbatim disasm:
 *   0x21f330  movl   $0xffffffff, %eax                  ## default return -1
 *   0x21f335  testl  %esi, %esi                         ## if (paramID != 0)
 *   0x21f337  je     0x21f33a                           ##   fall through
 *   0x21f339  retq
 *   0x21f33a  pushq  %rbp; movq %rsp,%rbp
 *   0x21f33e  movq   0x198(%rdi), %rax                  ## rax = paramBlock
 *   0x21f345  movss  (%rax), %xmm0
 *   0x21f349  movss  %xmm0, (%rdx)                      ## out[0] = block[0]
 *   0x21f34d  movss  0x4(%rax), %xmm0
 *   0x21f352  movss  %xmm0, 0x4(%rdx)                   ## out[1] = block[1]
 *   0x21f357  movss  0x8(%rax), %xmm0
 *   0x21f35c  movss  %xmm0, 0x8(%rdx)                   ## out[2] = block[2]
 *   0x21f361  movss  0xc(%rax), %xmm0
 *   0x21f366  movss  %xmm0, 0xc(%rdx)                   ## out[3] = block[3]
 *   0x21f36b  xorl   %eax, %eax                         ## return 0
 *
 * paramID must be 0; writes the 4-vector from paramBlock[0..3] into out[0..3].
 */
export function HgcAVASpatialAverageAdaptive_LowerField_GetParameter(
  self: HgcAVASpatialAverageAdaptive_LowerFieldState,
  paramID: number,
  out: Float32Array,
): number {
  // @Helium 0x21f335-0x21f339
  if ((paramID | 0) !== 0) return -1 | 0;
  const p = self.paramBlock;
  if (p === null) {
    throw new Error(
      "HgcAVASpatialAverageAdaptive_LowerField::GetParameter @Helium 0x21f33e — paramBlock " +
        "is null; ctor @Helium 0x21eff0 has not been transcribed and thus never allocated it.",
    );
  }
  // @Helium 0x21f345-0x21f366
  out[0] = Math.fround(p[0]);
  out[1] = Math.fround(p[1]);
  out[2] = Math.fround(p[2]);
  out[3] = Math.fround(p[3]);
  return 0;
}

/**
 * `HgcAVASpatialAverageAdaptive_LowerField::GetOutput(HGRenderer*)` @Helium 0x21f370.
 *
 * Verbatim disasm:
 *   0x21f370  pushq %rbp; movq %rsp,%rbp
 *   0x21f374  movq  %rdi, %rax                          ## return this
 *   0x21f377  popq  %rbp; retq
 */
export function HgcAVASpatialAverageAdaptive_LowerField_GetOutput(
  self: HgcAVASpatialAverageAdaptive_LowerFieldState,
): HgcAVASpatialAverageAdaptive_LowerFieldState {
  // @Helium 0x21f374
  return self;
}

/**
 * `HgcAVASpatialAverageAdaptive_LowerField::GetDOD(HGRenderer*, int outputIdx, HGRect inputDOD)`
 * @Helium 0x21ef10.
 *
 * Verbatim disasm:
 *   0x21ef10  testl  %edx, %edx
 *   0x21ef12  je     0x21ef51                           ## outputIdx == 0 -> HGRectInfinite
 *   0x21ef14  cmpl   $0x1, %edx
 *   0x21ef17  jne    0x21ef60                           ## outputIdx > 1 -> HGRectNull
 *   -- outputIdx == 1 branch --
 *   0x21ef20  edi = 0xfffffffc (= -4)
 *   0x21ef25  esi = 0xffffffff (= -1)
 *   0x21ef2a  edx = 4
 *   0x21ef2f  ecx-slot = HGRect.hi (r14 stashed)
 *   0x21ef32  ecx = 0
 *   0x21ef37  callq  _HGRectMake4i                      ## rect(-4, -1, 4, 0)
 *   0x21ef3c..0x21ef45  set rdi = inputDOD.lo, rsi = inputDOD.hi, rdx = rect (from HGRectMake4i)
 *   0x21ef4c  jmp    _HGRectGrow                        ## return HGRectGrow(inputDOD, rect(-4,-1,4,0))
 *   -- outputIdx == 0 branch @0x21ef51 --
 *   0x21ef51..0x21ef5f  return HGRectInfinite
 *   -- outputIdx > 1 branch @0x21ef60 --
 *   0x21ef60..0x21ef6e  return HGRectNull
 *
 * Semantics: outputIdx 0 -> full-domain (Infinite); outputIdx 1 -> grow inputDOD by
 * `HGRectMake4i(-4, -1, 4, 0)` (left 4, top 1, right 4, bottom 0); else HGRectNull.
 */
export function HgcAVASpatialAverageAdaptive_LowerField_GetDOD(
  _renderer: unknown,
  outputIdx: number,
  inputDOD: HGRect,
): HGRect {
  // @Helium 0x21ef10..0x21ef17
  const idx = outputIdx | 0;
  if (idx === 0) {
    // @Helium 0x21ef51: HGRectInfinite
    return {
      x: HGRectInfinite.x,
      y: HGRectInfinite.y,
      right: HGRectInfinite.right,
      bottom: HGRectInfinite.bottom,
    };
  }
  if (idx !== 1) {
    // @Helium 0x21ef60: HGRectNull
    return { x: HGRectNull.x, y: HGRectNull.y, right: HGRectNull.right, bottom: HGRectNull.bottom };
  }
  // idx == 1: HGRectGrow(inputDOD, HGRectMake4i(-4, -1, 4, 0)).
  // Both callees are declared in HGRect.ts as HGRectMake4i and HGRectGrow. However, the tail-
  // jmp to _HGRectGrow @0x21ef4c calls into a *C* symbol (`_HGRectGrow`), not the C++
  // HGRect::Grow method used elsewhere. To stay faithful we THROW rather than remap.
  void inputDOD;
  throw new Error(
    "HgcAVASpatialAverageAdaptive_LowerField::GetDOD(outputIdx=1) not yet transcribed " +
      "@Helium 0x21ef19 — depends on _HGRectMake4i @Helium 0x21ef37 and _HGRectGrow " +
      "@Helium 0x21ef4c (C entry points, not decoded here).",
  );
}

/**
 * `HgcAVASpatialAverageAdaptive_LowerField::GetROI(HGRenderer*, int inputIdx, HGRect outputROI)`
 * @Helium 0x21ef70.
 *
 * Verbatim disasm:
 *   0x21ef77  testl  %edx, %edx
 *   0x21ef79  je     0x21efb1                           ## inputIdx == 0 -> renderer bridge
 *   0x21ef7b  cmpl   $0x1, %edx
 *   0x21ef7e  jne    0x21efd3                           ## inputIdx > 1 -> HGRectNull
 *   -- inputIdx == 1 -- (identical shape to GetDOD outputIdx==1)
 *   0x21ef80..0x21ef97  HGRectMake4i(-4, -1, 4, 0)
 *   0x21efac  jmp    _HGRectGrow                        ## HGRectGrow(outputROI, (-4,-1,4,0))
 *   -- inputIdx == 0 --
 *   0x21efb1..0x21efbf  renderer->GetInput(this, 0)      ## get the input-node bound at slot 0
 *   0x21efce  jmp    __ZN10HGRenderer6GetDODEP6HGNode   ## renderer->GetDOD(inputNode)
 *   -- inputIdx > 1 --
 *   0x21efd3..0x21efe5  return HGRectNull
 *
 * Semantics:
 *   - inputIdx 0: return the DOD of the primary input node (`renderer->GetInput(this, 0)`
 *     then `renderer->GetDOD(...)`).
 *   - inputIdx 1: grow outputROI by (-4,-1,4,0) — same halo as GetDOD outputIdx==1.
 *   - else: HGRectNull.
 */
export function HgcAVASpatialAverageAdaptive_LowerField_GetROI(
  _self: HgcAVASpatialAverageAdaptive_LowerFieldState,
  _renderer: unknown,
  inputIdx: number,
  outputROI: HGRect,
): HGRect {
  // @Helium 0x21ef77..0x21ef7e
  const idx = inputIdx | 0;
  if (idx === 0) {
    // @Helium 0x21efbf: renderer->GetInput(this, 0)
    // @Helium 0x21efce: renderer->GetDOD(inputNode)
    throw new Error(
      "HgcAVASpatialAverageAdaptive_LowerField::GetROI(inputIdx=0) not yet transcribed " +
        "@Helium 0x21efb1 — depends on undecoded HGRenderer::GetInput(HGNode*, int) @Helium " +
        "0x21efbf and HGRenderer::GetDOD(HGNode*) @Helium 0x21efce.",
    );
  }
  if (idx !== 1) {
    // @Helium 0x21efd3
    return { x: HGRectNull.x, y: HGRectNull.y, right: HGRectNull.right, bottom: HGRectNull.bottom };
  }
  // idx == 1
  void outputROI;
  throw new Error(
    "HgcAVASpatialAverageAdaptive_LowerField::GetROI(inputIdx=1) not yet transcribed " +
      "@Helium 0x21ef80 — depends on _HGRectMake4i @Helium 0x21ef97 and _HGRectGrow " +
      "@Helium 0x21efac (C entry points, not decoded here).",
  );
}

/**
 * `HgcAVASpatialAverageAdaptive_LowerField::shaderDescription() const` @Helium 0x21d670.
 *
 * Verbatim disasm — a std::string return by sret. Allocates 48 bytes and copies the literal
 * "HgcAVASpatialAverageAdaptive_LowerField [hgc1]" (46 chars + NUL). Three 16-byte MOVUPS
 * chunks from the literal pool cover the full string:
 *   @0x21d6b3  chunk 0 (bytes 0..15)  = "HgcAVASpatialAv"
 *   @0x21d6a8  chunk 1 (bytes 16..31) = "erageAdaptive_LowerField [hgc1]" (first 16)
 *   @0x21d69d  chunk 2 (bytes 30..45) = "owerField [hgc1]"
 *   @0x21d6b6  movb $0, 0x2e(%rax)      = terminator at index 46
 *
 * We return the literal string.
 */
export const HgcAVASpatialAverageAdaptive_LowerField_SHADER_DESCRIPTION =
  "HgcAVASpatialAverageAdaptive_LowerField [hgc1]" as const;

export function HgcAVASpatialAverageAdaptive_LowerField_shaderDescription(
  _self: HgcAVASpatialAverageAdaptive_LowerFieldState,
): string {
  // @Helium 0x21d6ac..0x21d6b6
  return HgcAVASpatialAverageAdaptive_LowerField_SHADER_DESCRIPTION;
}

/**
 * `HgcAVASpatialAverageAdaptive_LowerField::GetProgram(HGRenderer*)` @Helium 0x21cec0.
 *
 * Verbatim disasm:
 *   0x21cec0  pushq %rbp; movq %rsp,%rbp
 *   0x21cec4  movq  %rsi, %rdi                          ## rdi = renderer
 *   0x21cec7  movl  $0x60000, %esi
 *   0x21cecc  callq __ZN10HGRenderer9GetTargetEj        ## eax = renderer->GetTarget(0x60000)
 *   0x21ced1  xorl  %ecx, %ecx
 *   0x21ced3  cmpl  $0x60b10, %eax
 *   0x21ced8  leaq  0x6edc2c(%rip), %rax                ## rax = Metal shader source ptr
 *   0x21cedf  cmoveq %rax, %rcx                         ## if target == 0x60b10: rcx = shader
 *   0x21cee3  movq  %rcx, %rax
 *   0x21cee6  popq  %rbp; retq
 *
 * Semantics: returns the Metal fragment shader ONLY when the target is EXACTLY 0x60b10.
 */
export const HgcAVASpatialAverageAdaptive_LowerField_METAL_TARGET_EQ = 0x60b10 as const;

/**
 * Metal fragment shader source verbatim from Helium literal pool.
 * Loaded via `leaq 0x6edc2c(%rip), %rax` @Helium 0x21ced8; RIP-after = 0x21cedf;
 * target = 0x21cedf + 0x6edc2c = 0x90ab0b. Reported length (per the `//LEN=` header) =
 * 0x17fa = 6138 bytes.
 *
 * The shader body defines four `const float4` parameters (c0..c3) and implements the
 * adaptive-spatial-average deinterlace formula:
 *   c0 = (3, -1, 4, 0)
 *   c1 = (2,  0, 1, 3)
 *   c2 = (4,  1, 0.57, -0.07)
 *   c3 = (9999, 0.5, 0, 0)
 * It samples hg_Texture1 (motion / prev-field) at 9 neighbour offsets driven by texCoord2..6
 * plus 5 offset combinations of texCoord1, computes per-direction differences, thresholds them
 * against hg_Params[0].xx, picks the direction with minimal min-motion, then samples
 * hg_Texture0 (image) at ±(direction offset) around texCoord0 and averages.
 */
export const HgcAVASpatialAverageAdaptive_LowerField_METAL_SHADER_SOURCE: string =
  "//Metal1.0     \n" +
  "//LEN=00000017fa\n" +
  "fragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n" +
  "    const constant float4* hg_Params [[ buffer(0) ]], \n" +
  "    texture2d< float > hg_Texture0 [[ texture(0) ]], \n" +
  "    sampler hg_Sampler0 [[ sampler(0) ]], \n" +
  "    texture2d< float > hg_Texture1 [[ texture(1) ]], \n" +
  "    sampler hg_Sampler1 [[ sampler(1) ]])\n" +
  "{\n" +
  "    const float4 c0 = float4(3.000000000, -1.000000000, 4.000000000, 0.000000000);\n" +
  "    const float4 c1 = float4(2.000000000, 0.000000000, 1.000000000, 3.000000000);\n" +
  "    const float4 c2 = float4(4.000000000, 1.000000000, 0.5699999928, -0.07000000030);\n" +
  "    const float4 c3 = float4(9999.000000, 0.5000000000, 0.000000000, 0.000000000);\n" +
  "    float4 r0, r1, r2, r3, r4, r5, r6, r7, r8;\n" +
  "    FragmentOut output;\n" +
  "\n" +
  "    r0.y = hg_Texture1.sample(hg_Sampler1, frag._texCoord3.xy).y;\n" +
  "    r1.y = hg_Texture1.sample(hg_Sampler1, frag._texCoord2.xy).y;\n" +
  "    r0.x = r0.y - r1.y;\n" +
  "    r1.y = hg_Texture1.sample(hg_Sampler1, frag._texCoord5.xy).y;\n" +
  "    r2.y = hg_Texture1.sample(hg_Sampler1, frag._texCoord4.xy).y;\n" +
  "    r0.y = r1.y - r2.y;\n" +
  "    r1.y = hg_Texture1.sample(hg_Sampler1, frag._texCoord6.xy).y;\n" +
  "    r2.xy = frag._texCoord1.xy - c0.xy;\n" +
  "    r2.xy = r2.xy*hg_Params[2].zw;\n" +
  "    r2.y = hg_Texture1.sample(hg_Sampler1, r2.xy).y;\n" +
  "    r0.z = r1.y - r2.y;\n" +
  "    r1.xy = frag._texCoord1.xy + c0.zw;\n" +
  "    r1.xy = r1.xy*hg_Params[2].zw;\n" +
  "    r1.y = hg_Texture1.sample(hg_Sampler1, r1.xy).y;\n" +
  "    r2.xy = frag._texCoord1.xy - c0.zy;\n" +
  "    r2.xy = r2.xy*hg_Params[2].zw;\n" +
  "    r2.y = hg_Texture1.sample(hg_Sampler1, r2.xy).y;\n" +
  "    r0.w = r1.y - r2.y;\n" +
  "    r0 = abs(r0);\n" +
  "    r1.xy = frag._texCoord1.xy + c0.yw;\n" +
  "    r1.xy = r1.xy*hg_Params[2].zw;\n" +
  "    r1.y = hg_Texture1.sample(hg_Sampler1, r1.xy).y;\n" +
  "    r2.xy = frag._texCoord1.xy - c0.yy;\n" +
  "    r2.xy = r2.xy*hg_Params[2].zw;\n" +
  "    r2.y = hg_Texture1.sample(hg_Sampler1, r2.xy).y;\n" +
  "    r1.x = r1.y - r2.y;\n" +
  "    r2.xy = frag._texCoord1.xy - c1.xy;\n" +
  "    r2.xy = r2.xy*hg_Params[2].zw;\n" +
  "    r2.y = hg_Texture1.sample(hg_Sampler1, r2.xy).y;\n" +
  "    r3.xy = frag._texCoord1.xy + c1.xz;\n" +
  "    r3.xy = r3.xy*hg_Params[2].zw;\n" +
  "    r3.y = hg_Texture1.sample(hg_Sampler1, r3.xy).y;\n" +
  "    r1.y = r2.y - r3.y;\n" +
  "    r2.xy = frag._texCoord1.xy - c0.xw;\n" +
  "    r2.xy = r2.xy*hg_Params[2].zw;\n" +
  "    r2.y = hg_Texture1.sample(hg_Sampler1, r2.xy).y;\n" +
  "    r3.xy = frag._texCoord1.xy + c1.wz;\n" +
  "    r3.xy = r3.xy*hg_Params[2].zw;\n" +
  "    r3.y = hg_Texture1.sample(hg_Sampler1, r3.xy).y;\n" +
  "    r1.z = r2.y - r3.y;\n" +
  "    r2.xy = frag._texCoord1.xy - c0.zw;\n" +
  "    r2.xy = r2.xy*hg_Params[2].zw;\n" +
  "    r2.y = hg_Texture1.sample(hg_Sampler1, r2.xy).y;\n" +
  "    r3.xy = frag._texCoord1.xy + c2.xy;\n" +
  "    r3.xy = r3.xy*hg_Params[2].zw;\n" +
  "    r3.y = hg_Texture1.sample(hg_Sampler1, r3.xy).y;\n" +
  "    r1.w = r2.y - r3.y;\n" +
  "    r1 = abs(r1);\n" +
  "    r2.xy = frag._texCoord1.xy*hg_Params[2].zw;\n" +
  "    r2.y = hg_Texture1.sample(hg_Sampler1, r2.xy).y;\n" +
  "    r3.xy = frag._texCoord1.xy + c1.yz;\n" +
  "    r3.xy = r3.xy*hg_Params[2].zw;\n" +
  "    r3.y = hg_Texture1.sample(hg_Sampler1, r3.xy).y;\n" +
  "    r2.z = r2.y - r3.y;\n" +
  "    r2.z = abs(r2.z);\n" +
  "    r3 = float4(r0 < hg_Params[0].xxxx);\n" +
  "    r4.x = dot(r3, 1.00000f);\n" +
  "    r5 = float4(r1 < hg_Params[0].xxxx);\n" +
  "    r4.y = dot(r5, 1.00000f);\n" +
  "    r6.xy = hg_Params[0].yy - r0.xy;\n" +
  "    r6.z = hg_Params[0].y - r2.z;\n" +
  "    r6.xyz = float3(r6.xyz < c1.yyy);\n" +
  "    r4.z = fmin(r6.x, r6.y);\n" +
  "    r4.z = fmin(r6.z, r4.z);\n" +
  "    r6.xy = hg_Params[0].yy - r1.xy;\n" +
  "    r6.z = hg_Params[0].y - r2.z;\n" +
  "    r6.xyz = float3(r6.xyz < c1.yyy);\n" +
  "    r4.w = fmin(r6.x, r6.y);\n" +
  "    r4.w = fmin(r6.z, r4.w);\n" +
  "    r4.xy = r4.xy*r4.wz;\n" +
  "    r4.xy = select(c2.yy, c1.yy, r4.xy <= 0.00000f);\n" +
  "    r2.xy = frag._texCoord0.xy - c1.yz;\n" +
  "    r6.xy = frag._texCoord0.xy - c1.yz;\n" +
  "    r6.xy = r6.xy + hg_Params[1].xy;\n" +
  "    r6.xy = r6.xy*hg_Params[1].zw;\n" +
  "    r6 = hg_Texture0.sample(hg_Sampler0, r6.xy);\n" +
  "    r7.xy = frag._texCoord0.xy + hg_Params[1].xy;\n" +
  "    r7.xy = r7.xy*hg_Params[1].zw;\n" +
  "    r7 = hg_Texture0.sample(hg_Sampler0, r7.xy);\n" +
  "    r6 = r6 + r7;\n" +
  "    r6 = r6*c2.zzzz;\n" +
  "    r7.xy = frag._texCoord0.xy - c1.yx;\n" +
  "    r7.xy = r7.xy + hg_Params[1].xy;\n" +
  "    r7.xy = r7.xy*hg_Params[1].zw;\n" +
  "    r7 = hg_Texture0.sample(hg_Sampler0, r7.xy);\n" +
  "    r8.xy = frag._texCoord0.xy + c1.yz;\n" +
  "    r8.xy = r8.xy + hg_Params[1].xy;\n" +
  "    r8.xy = r8.xy*hg_Params[1].zw;\n" +
  "    r8 = hg_Texture0.sample(hg_Sampler0, r8.xy);\n" +
  "    r7 = r7 + r8;\n" +
  "    r6 = r7*c2.wwww + r6;\n" +
  "    r4 = r4.xxxx - r4.yyyy;\n" +
  "    r5 = select(c1.yyyy, r5, r4 < 0.00000f);\n" +
  "    r5 = select(r5, r3, r4 > 0.00000f);\n" +
  "    r1 = select(c1.yyyy, r1, r4 < 0.00000f);\n" +
  "    r1 = select(r1, r0, r4 > 0.00000f);\n" +
  "    r5 = select(c3.xxxx, r1, r5 > 0.00000f);\n" +
  "    r5.xyz = fmin(r5.xyz, r5.yxw);\n" +
  "    r5.xyz = fmin(r5.xyz, r5.zzx);\n" +
  "    r5.xyz = r5.xyz - r1.xyz;\n" +
  "    r8.xy = select(c0.zw, c1.wy, r5.zz >= 0.00000f);\n" +
  "    r8.xy = select(r8.xy, c1.xy, r5.yy >= 0.00000f);\n" +
  "    r8.xy = select(r8.xy, c1.zy, r5.xx >= 0.00000f);\n" +
  "    r8.x = r8.x*r4.x;\n" +
  "    r2.xy = r2.xy + r8.xy;\n" +
  "    r2.xy = r2.xy + hg_Params[1].xy;\n" +
  "    r2.xy = r2.xy*hg_Params[1].zw;\n" +
  "    r2 = hg_Texture0.sample(hg_Sampler0, r2.xy);\n" +
  "    r8.xy = frag._texCoord0.xy - r8.xy;\n" +
  "    r8.xy = r8.xy + hg_Params[1].xy;\n" +
  "    r8.xy = r8.xy*hg_Params[1].zw;\n" +
  "    r8 = hg_Texture0.sample(hg_Sampler0, r8.xy);\n" +
  "    r2 = mix(r8, r2, c3.yyyy);\n" +
  "    r7.xy = frag._texCoord0.xy - c1.yz;\n" +
  "    r7.xy = r7.xy + hg_Params[1].xy;\n" +
  "    r7.xy = r7.xy*hg_Params[1].zw;\n" +
  "    r7 = hg_Texture0.sample(hg_Sampler0, r7.xy);\n" +
  "    r3.xy = frag._texCoord0.xy + hg_Params[1].xy;\n" +
  "    r3.xy = r3.xy*hg_Params[1].zw;\n" +
  "    r3 = hg_Texture0.sample(hg_Sampler0, r3.xy);\n" +
  "    r0.x = fmin(r7.x, r3.x);\n" +
  "    r0.y = fmin(r7.x, r2.x);\n" +
  "    r0.z = fmin(r3.x, r2.x);\n" +
  "    r1.xz = float2(r0.yy >= r0.xz);\n" +
  "    r5.yz = float2(r0.xx >= r0.yz);\n" +
  "    r5.x = fmin(r5.y, r5.z);\n" +
  "    r1.y = fmin(r1.x, r1.z);\n" +
  "    r5.y = mix(r1.y, c1.y, r5.x);\n" +
  "    r5.z = fmax(r5.x, r5.y);\n" +
  "    r5.z = c2.y - r5.z;\n" +
  "    r5.x = dot(r5.xyz, r0.xyz);\n" +
  "    r8.x = r7.x - r5.x;\n" +
  "    r8.y = r3.x - r5.x;\n" +
  "    r2 = select(r2, r7, r8.xxxx == 0.00000f);\n" +
  "    r2 = select(r2, r3, r8.yyyy == 0.00000f);\n" +
  "    output.color0 = select(r2, r6, r4 == 0.00000f);\n" +
  "    return output;\n" +
  "}\n" +
  "//MD5=bcbf2a52:4a3f1e21:4fa5cf32:67629fb1\n" +
  "//SIG=00000000:00000000:00000000:00000000:0004:0003:0009:0000:0000:0000:00fe:0000:0007:02:0:1:0\n";

export function HgcAVASpatialAverageAdaptive_LowerField_GetProgram(_renderer: unknown): string | null {
  // @Helium 0x21cec7-0x21cee6
  throw new Error(
    "HgcAVASpatialAverageAdaptive_LowerField::GetProgram not yet transcribed @Helium " +
      "0x21cec0 — depends on undecoded HGRenderer::GetTarget(unsigned int) @Helium 0x21cecc. " +
      "Metal shader source is transcribed as HgcAVASpatialAverageAdaptive_LowerField_" +
      "METAL_SHADER_SOURCE; the branch condition is target == 0x60b10 -> return source; " +
      "else -> return NULL.",
  );
}

/**
 * `HgcAVASpatialAverageAdaptive_LowerField::Bind(HGHandler*)` @Helium 0x21da10.
 *
 * Verbatim disasm walk:
 *   0x21da29  HGHandler::TexCoord(handler, 0, 0, 0, NULL)
 *   0x21da2e  rdx = this->+0x198 (paramBlock aligned ptr)
 *   0x21da35..0x21da42  handler->vtable[*0x90](handler, 0, paramBlock, 1)
 *   0x21da48..0x21da51  this->vtable[*0xc0](this, handler)  ## delegate to base
 *   0x21da57  return 0
 *
 * Calls handler->vtable[*0x90] with (handler, 0, paramBlock, 1) — likely a
 * SetConstantBuffer/SetParams call. Then invokes this->vtable[*0xc0] to let the base
 * HGNode's Bind chain execute. Both callees are opaque. Throw.
 */
export function HgcAVASpatialAverageAdaptive_LowerField_Bind(
  self: HgcAVASpatialAverageAdaptive_LowerFieldState,
  _handler: unknown,
): number {
  // @Helium 0x21da10
  void self;
  throw new Error(
    "HgcAVASpatialAverageAdaptive_LowerField::Bind not yet transcribed @Helium 0x21da10 — " +
      "depends on undecoded HGHandler::TexCoord @Helium 0x21da29, HGHandler vtable *0x90 " +
      "@Helium 0x21da42, and this->vtable *0xc0 @Helium 0x21da51 (base HGNode::Bind).",
  );
}

/**
 * `HgcAVASpatialAverageAdaptive_LowerField::BindTexture(HGHandler*, int)` @Helium 0x21d6d0.
 *
 * 211-line dispatch that on texIdx==0/1 configures the corresponding texture unit with
 * texCoord + samplers via a series of undecoded HGHandler vtable calls. Not transcribed.
 */
export function HgcAVASpatialAverageAdaptive_LowerField_BindTexture(
  self: HgcAVASpatialAverageAdaptive_LowerFieldState,
  _handler: unknown,
  texIdx: number,
): number {
  // @Helium 0x21d6d0
  void self;
  void texIdx;
  throw new Error(
    "HgcAVASpatialAverageAdaptive_LowerField::BindTexture not yet transcribed @Helium " +
      "0x21d6d0 — 211-line HGHandler-vtable dispatch not yet decoded.",
  );
}

/**
 * `HgcAVASpatialAverageAdaptive_LowerField::InitProgramDescriptor(HGProgramDescriptor*) const`
 * @Helium 0x21cef0.
 *
 * 447-line descriptor build. Not transcribed.
 */
export function HgcAVASpatialAverageAdaptive_LowerField_InitProgramDescriptor(
  _desc: unknown,
): void {
  // @Helium 0x21cef0
  throw new Error(
    "HgcAVASpatialAverageAdaptive_LowerField::InitProgramDescriptor not yet transcribed " +
      "@Helium 0x21cef0 — 447-line HGProgramDescriptor build.",
  );
}

/**
 * `HgcAVASpatialAverageAdaptive_LowerField::RenderTile(HGTile*)` @Helium 0x21e470.
 *
 * 621-line CPU/SSE software fallback of the deinterlace shader. Not transcribed.
 */
export function HgcAVASpatialAverageAdaptive_LowerField_RenderTile(
  self: HgcAVASpatialAverageAdaptive_LowerFieldState,
  _tile: unknown,
): number {
  // @Helium 0x21e470
  void self;
  throw new Error(
    "HgcAVASpatialAverageAdaptive_LowerField::RenderTile not yet transcribed @Helium " +
      "0x21e470 — 621-line SSE software fallback of the adaptive-spatial-average deinterlace " +
      "shader; requires per-vector decoding of the parameter block.",
  );
}

/**
 * `HgcAVASpatialAverageAdaptive_LowerField::RenderTile_AVX(HGTile*)` @Helium 0x21da60.
 *
 * AVX2 variant of RenderTile — same math, wider lanes. Not transcribed.
 */
export function HgcAVASpatialAverageAdaptive_LowerField_RenderTile_AVX(
  self: HgcAVASpatialAverageAdaptive_LowerFieldState,
  _tile: unknown,
): number {
  // @Helium 0x21da60
  void self;
  throw new Error(
    "HgcAVASpatialAverageAdaptive_LowerField::RenderTile_AVX not yet transcribed @Helium " +
      "0x21da60 — AVX2 variant of RenderTile.",
  );
}

// FRONTIER CALLEE STUBS

function HGNode_dtor_stub(): void {
  // Called from HgcAVASpatialAverageAdaptive_LowerField D0 @Helium 0x21f2a0.
  throw new Error("HGNode::~HGNode() @Helium 0x21f2a0 not yet transcribed");
}

function HGObject_operator_delete_stub(): void {
  // Called from HgcAVASpatialAverageAdaptive_LowerField D0 @Helium 0x21f2ae.
  throw new Error("HGObject::operator delete(void*) @Helium 0x21f2ae not yet transcribed");
}

function HGNode_ClearBits_stub(): void {
  // Called from SetParameter @Helium 0x21f31d.
  throw new Error("HGNode::ClearBits() @Helium 0x21f31d not yet transcribed");
}
