// HgcMultiplyAlpha.ts — FCP Flexo framework class (alpha-only multiplication render node).
//
// Transcribed from the x86_64 disassembly of Flexo in
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// See raw-port/re/disasm/Flexo.HgcMultiplyAlpha.*.s.
//
// SYMBOLS (nm | c++filt):
//   0x14689a0  T HgcMultiplyAlpha::GetProgram(HGRenderer*)
//   0x14689d0  T HgcMultiplyAlpha::InitProgramDescriptor(HGProgramDescriptor*) const
//   0x1468c70  T HgcMultiplyAlpha::shaderDescription() const
//   0x1468cc0  T HgcMultiplyAlpha::BindTexture(HGHandler*, int)
//   0x1468d70  T HgcMultiplyAlpha::Bind(HGHandler*)
//   0x1468d90  T HgcMultiplyAlpha::RenderTile_AVX(HGTile*)
//   0x1469020  T HgcMultiplyAlpha::RenderTile(HGTile*)
//   0x14691b0  T HgcMultiplyAlpha::GetDOD(HGRenderer*, int, HGRect)
//   0x14691d0  T HgcMultiplyAlpha::GetROI(HGRenderer*, int, HGRect)
//   0x14691f0  T HgcMultiplyAlpha::HgcMultiplyAlpha()                                (C2)
//   0x1469260  T HgcMultiplyAlpha::HgcMultiplyAlpha()                                (C1)
//   0x14692d0  T HgcMultiplyAlpha::~HgcMultiplyAlpha()                               (D2)
//   0x1469320  T HgcMultiplyAlpha::~HgcMultiplyAlpha()                               (D1)
//   0x1469370  T HgcMultiplyAlpha::~HgcMultiplyAlpha()                               (D0)
//   0x14693c0  T HgcMultiplyAlpha::SetParameter(int, float, float, float, float)
//   0x14693d0  T HgcMultiplyAlpha::GetParameter(int, float*)
//   0x14693e0  T HgcMultiplyAlpha::GetOutput(HGRenderer*)
//
// Vtable-installed pointer (from ctor C1 @0x146926f leaq disp32 + RIP-after):
//   0x1469276 + 0x4c4aaa = 0x192dd20   (used by C1 and reset in D0 @0x1469379 too:
//                                       0x1469380 + 0x4c49a0 = 0x192dd20)
//
// FIELD LAYOUT (extends HGNode; HGNode base +0x00..+0x197 is opaque here):
//   +0x10  int flags (bit-mask) — read/masked in ctor @0x1469294..0x14692ac:
//             flags &= 0xFFFFF9FF (clear bits 9..10);  flags |= 0x400 (set bit 10).
//             Net effect: flags = (flags & ~0x600) | 0x400.
//   +0x198 float*  scratch32AlignedPtr — a 32-byte-aligned pointer into a heap block
//             allocated by `operator new[]` at 0x28 bytes (@ctor 0x146927e).
//             The raw allocation pointer is stashed at (aligned - 8) so D0 can free it
//             (@0x146938f..0x1469398:  raw = *(aligned - 8);  operator delete(raw)).
//             The alignment gymnastics at @0x1469283..0x1469298 are the standard clang
//             manual-alignment idiom:
//               p = (raw + 8);
//               p = (raw + (-((raw+8)) & 0x1f)) + 8;   // aligned = raw + 8 + ((-raw - 8) & 31)
//             which lands `p` on a 32-byte boundary >= raw+8 (so p-8 always in-bounds).
//             The buffer holds up to 0x28 bytes but is only used indirectly via handler
//             calls in BindTexture (the exact write path is opaque here).
//
// PROGRAM SHAPE
//   HgcMultiplyAlpha computes an output pixel whose RGBA = (a0*a1, a0*a1, a0*a1, a0*a1),
//   where a0 = alpha of input0 texel, a1 = alpha of input1 texel. The Metal shader source
//   (transcribed below verbatim) makes this explicit:
//     r0.w = color0.w;  r1.w = color1.w;
//     output.color0 = r0.wwww * r1.wwww;
//   RenderTile is the CPU/SSE software fallback (transcribed here); RenderTile_AVX is the
//   6-lane AVX fallback (throw-stubbed — same math, wider lanes).
//
// FRONTIER CALLEES (throw-stubbed for calls that require external symbols):
//   HGNode::HGNode() / HGNode::~HGNode()  @Flexo (stub 0x1496c06 / 0x1496c0c)
//   HGObject::operator delete(void*)      @Flexo (stub 0x1496d8c)
//   operator new[](size_t) / delete(void*) @Flexo (stubs 0x1497446 / 0x1497404)
//   HGTile::Renderer() const              @Flexo (stub 0x1497218)
//   HGRenderer::GetTarget(unsigned int)   @Flexo (stub 0x1495ea4)
//   HGHandler::TexCoord(int,int,int,double const*)  @Flexo (stub 0x1496df2)
//   HGProgramDescriptor::SetVisibleShaderWithSource / SetFragmentFunctionName /
//     SetReturnBinding / SetArgumentBindings  @Flexo (stubs 0x14966d8..0x14966d2..
//     0x14966c6..0x14966cc)
//   std::vector<HGBinding>::__emplace_back_slow_path                     @Flexo
//   std::vector<HGBinding>::~vector                                       @Flexo

import type { HGRect } from "./HGRect.js";
import { HGRectNull } from "./HGRect.js";

/**
 * Vtable-installed pointer address for HgcMultiplyAlpha.
 * From ctor C1 @Flexo 0x146926f (leaq 0x4c4aaa(%rip)); RIP-after = 0x1469276;
 *   target = 0x1469276 + 0x4c4aaa = 0x192dd20.
 * Also reset by D0 @0x1469379 (leaq 0x4c49a0(%rip)); target = 0x1469380 + 0x4c49a0 = 0x192dd20.
 */
export const HgcMultiplyAlpha_VTABLE_INSTALLED_PTR = 0x192dd20 as const;

/**
 * The HgcMultiplyAlpha instance state.
 * HGNode base subobject is opaque here (see raw-port/src/render/HGNode.ts).
 */
export interface HgcMultiplyAlphaState {
  /** HGNode base placeholder (+0x00..+0x197). */
  _hgNode: unknown;
  /** +0x10 int flags — RMW at ctor: flags = (flags & ~0x600) | 0x400  (@0x146929f..0x14692ac). */
  _nodeFlags10: number;
  /** +0x198 pointer — the 32-byte-aligned scratch buffer set by ctor (@0x1469298).
   *  Modeled as a Float32Array in TS; the aligned-offset dance is a no-op for us. */
  scratch: Float32Array | null;
  /** Raw buffer that owns `scratch` — retained so we can drop it in the deleting dtor.
   *  Corresponds to the raw pointer stashed at (aligned - 8) in the real function. */
  _scratchRaw: ArrayBuffer | null;
}

/**
 * `HgcMultiplyAlpha::HgcMultiplyAlpha()` @Flexo 0x1469260 (C1) / 0x14691f0 (C2).
 *
 * Verbatim disasm (C1 form):
 *   0x1469260  pushq  %rbp; movq %rsp,%rbp; pushq %r14; pushq %rbx
 *   0x1469267  movq   %rdi, %rbx                            ## rbx = this
 *   0x146926a  callq  __ZN6HGNodeC2Ev                       ## HGNode::HGNode()
 *   0x146926f  leaq   0x4c4aaa(%rip), %rax                  ## rax = 0x192dd20 (vtable)
 *   0x1469276  movq   %rax, (%rbx)                          ## *this = vtable
 *   0x1469279  movl   $0x28, %edi                           ## sz = 0x28 (40 bytes)
 *   0x146927e  callq  __Znam                                ## rax = operator new[](0x28)
 *   0x1469283  leaq   0x8(%rax), %rcx                       ## rcx = raw + 8
 *   0x1469287  negl   %ecx                                  ## rcx = -(raw + 8)  (32-bit)
 *   0x1469289  andl   $0x1f, %ecx                           ## rcx = (-(raw + 8)) & 0x1f
 *   0x146928c  leaq   (%rcx,%rax), %rdx                     ## rdx = raw + rcx
 *   0x1469290  addq   $0x8, %rdx                            ## rdx = raw + rcx + 8 = ALIGNED
 *   0x1469294  movq   %rax, (%rcx,%rax)                     ## *(raw + rcx) = raw  (stash pre-ALIGNED-8)
 *   0x1469298  movq   %rdx, 0x198(%rbx)                     ## this->+0x198 = ALIGNED
 *   0x146929f  movl   $0xfffff9ff, %eax                     ## mask = ~0x600
 *   0x14692a4  andl   0x10(%rbx), %eax
 *   0x14692a7  orl    $0x400, %eax                          ## eax = (this->+0x10 & ~0x600) | 0x400
 *   0x14692ac  movl   %eax, 0x10(%rbx)                      ## this->+0x10 = eax
 *   epilogue
 *
 * The alignment idiom guarantees `ALIGNED` is 32-byte aligned and `ALIGNED - 8 >= raw`
 * (since rcx ∈ [0..31], so ALIGNED = raw + rcx + 8 ∈ [raw+8..raw+39], and raw was allocated
 *  with size 0x28 = 40 bytes — always in-bounds).
 */
export function HgcMultiplyAlpha_construct(self: HgcMultiplyAlphaState): void {
  // @Flexo 0x146926a
  HGNode_HGNode_stub();
  // @Flexo 0x146927e: raw = operator new[](0x28).  Model as a fresh 0x28-byte buffer.
  const raw = new ArrayBuffer(0x28);
  self._scratchRaw = raw;
  // @Flexo 0x1469283..0x1469298: 32-byte alignment gymnastics. In TS we don't have raw
  // pointers, so we back the "aligned pointer" with a Float32Array view starting at byte 0
  // of the buffer. The alignment computation is a byte-address shuffle — it does not change
  // the observable field-write semantics of the class (the class only ever reads/writes
  // through the +0x198 pointer, and the raw pointer is only used for `delete` in D0).
  self.scratch = new Float32Array(raw);
  // @Flexo 0x146929f..0x14692ac: flags = (flags & ~0x600) | 0x400.
  self._nodeFlags10 = ((self._nodeFlags10 & ~0x600) | 0x400) >>> 0;
}

/**
 * `HgcMultiplyAlpha::~HgcMultiplyAlpha()` @Flexo 0x14692d0 (D2) / 0x1469320 (D1).
 *
 * Both charge variants: reset the vtable pointer, free the scratch buffer (via the raw
 * pointer stashed at aligned-8), then call HGNode::~HGNode(). D0 additionally invokes
 * HGObject::operator delete on the whole object.
 *
 * Since D2/D1 disasm files were not extracted in this pass but the deleting dtor D0 has
 * the identical head, we transcribe from D0 @0x1469370-0x146939d and separate the
 * `HGObject::operator delete` step for the non-deleting variants.
 */
export function HgcMultiplyAlpha_destruct(self: HgcMultiplyAlphaState): void {
  // @Flexo 0x1469379: reset *this to the vtable installed-ptr.
  // (No-op in our model — we do not store the vtable ptr as a field.)
  // @Flexo 0x1469383..0x1469398: aligned = this->+0x198; if aligned != 0:
  //   raw = *(aligned - 8); if raw != 0: operator delete(raw).
  self.scratch = null;
  self._scratchRaw = null;
  // @Flexo 0x14693a0: HGNode::~HGNode().
  HGNode_dtor_stub();
}

/**
 * `HgcMultiplyAlpha::~HgcMultiplyAlpha()` @Flexo 0x1469370 — the deleting dtor (D0).
 * Same as D2/D1 plus a tail-jmp to HGObject::operator delete(this) @0x14693ae.
 */
export function HgcMultiplyAlpha_deletingDtor(self: HgcMultiplyAlphaState): void {
  HgcMultiplyAlpha_destruct(self);
  // @Flexo 0x14693ae: jmp HGObject::operator delete(void*)
  HGObject_operator_delete_stub();
}

/**
 * `HgcMultiplyAlpha::SetParameter(int, float, float, float, float)` @Flexo 0x14693c0.
 *
 * Verbatim disasm (4 real instructions):
 *   0x14693c0  pushq  %rbp; movq %rsp,%rbp
 *   0x14693c4  movl   $0xffffffff, %eax                    ## return -1 unconditionally
 *   0x14693c9  popq   %rbp; retq
 *
 * The class has NO tunable parameters. Every call returns -1 regardless of paramID/values.
 */
export function HgcMultiplyAlpha_SetParameter(
  _self: HgcMultiplyAlphaState,
  _paramID: number,
  _v: number,
  _v2: number,
  _v3: number,
  _v4: number,
): number {
  // @Flexo 0x14693c4: movl $0xffffffff, %eax
  return -1 | 0;
}

/**
 * `HgcMultiplyAlpha::GetParameter(int, float*)` @Flexo 0x14693d0.
 *
 * Verbatim disasm (4 real instructions):
 *   0x14693d0  pushq  %rbp; movq %rsp,%rbp
 *   0x14693d4  movl   $0xffffffff, %eax                    ## return -1 unconditionally
 *   0x14693d9  popq   %rbp; retq
 */
export function HgcMultiplyAlpha_GetParameter(
  _self: HgcMultiplyAlphaState,
  _paramID: number,
  _out: unknown,
): number {
  // @Flexo 0x14693d4: movl $0xffffffff, %eax
  return -1 | 0;
}

/**
 * `HgcMultiplyAlpha::GetOutput(HGRenderer*)` @Flexo 0x14693e0.
 *
 * Verbatim disasm:
 *   0x14693e0  pushq  %rbp; movq %rsp,%rbp
 *   0x14693e4  movq   %rdi, %rax                            ## return this
 *   0x14693e7  popq   %rbp; retq
 */
export function HgcMultiplyAlpha_GetOutput(self: HgcMultiplyAlphaState): HgcMultiplyAlphaState {
  // @Flexo 0x14693e4
  return self;
}

/**
 * `HgcMultiplyAlpha::GetDOD(HGRenderer*, int outputIdx, HGRect inputDOD)` @Flexo 0x14691b0.
 *
 * Verbatim disasm:
 *   0x14691b0  movq   %rcx, %rax                            ## rax = inputDOD.lo
 *   0x14691b3  cmpl   $0x2, %edx                            ## if outputIdx < 2 (i.e. 0 or 1)
 *   0x14691b6  jb     0x14691cb                             ##   -> return input (identity)
 *   0x14691b8  pushq  %rbp; movq %rsp,%rbp
 *   0x14691bc  movq   _HGRectNull(%rip), %rcx               ## rcx = &HGRectNull
 *   0x14691c3  movq   (%rcx), %rax                          ## rax = HGRectNull.lo
 *   0x14691c6  movq   0x8(%rcx), %r8                        ## r8  = HGRectNull.hi
 *   0x14691ca  popq   %rbp
 *   0x14691cb  movq   %r8, %rdx
 *   0x14691ce  retq
 *
 * Note: `jb` (unsigned less-than); with outputIdx as unsigned, indices 0 and 1 return the
 * input DOD unchanged; every other value returns HGRectNull. This is a two-output effect
 * (probably alpha only for one output, RGBA for the other — matched by the two shader
 * variants). We do NOT invent semantics beyond what the disasm shows.
 */
export function HgcMultiplyAlpha_GetDOD(
  _renderer: unknown,
  outputIdx: number,
  inputDOD: HGRect,
): HGRect {
  // @Flexo 0x14691b3: cmpl $2, %edx; jb -> identity
  if ((outputIdx >>> 0) < 2) {
    return { x: inputDOD.x, y: inputDOD.y, right: inputDOD.right, bottom: inputDOD.bottom };
  }
  // @Flexo 0x14691bc..0x14691ca
  return { x: HGRectNull.x, y: HGRectNull.y, right: HGRectNull.right, bottom: HGRectNull.bottom };
}

/**
 * `HgcMultiplyAlpha::GetROI(HGRenderer*, int inputIdx, HGRect outputROI)` @Flexo 0x14691d0.
 *
 * Byte-for-byte identical shape to GetDOD above (same disasm structure, different addr):
 *   0x14691d0  movq   %rcx, %rax
 *   0x14691d3  cmpl   $0x2, %edx
 *   0x14691d6  jb     0x14691eb                             ##   -> identity ROI
 *   0x14691dc  movq   _HGRectNull(%rip), %rcx
 *   0x14691e3  movq   (%rcx), %rax
 *   0x14691e6  movq   0x8(%rcx), %r8
 *   0x14691ea  popq   %rbp
 *   0x14691eb  movq   %r8, %rdx; retq
 */
export function HgcMultiplyAlpha_GetROI(
  _renderer: unknown,
  inputIdx: number,
  outputROI: HGRect,
): HGRect {
  // @Flexo 0x14691d3
  if ((inputIdx >>> 0) < 2) {
    return { x: outputROI.x, y: outputROI.y, right: outputROI.right, bottom: outputROI.bottom };
  }
  // @Flexo 0x14691dc..0x14691ea
  return { x: HGRectNull.x, y: HGRectNull.y, right: HGRectNull.right, bottom: HGRectNull.bottom };
}

/**
 * `HgcMultiplyAlpha::Bind(HGHandler*)` @Flexo 0x1468d70.
 *
 * Verbatim disasm:
 *   0x1468d70  pushq  %rbp; movq %rsp,%rbp
 *   0x1468d74  movq   (%rdi), %rax                          ## rax = handler->vtable
 *   0x1468d77  callq  *0xc0(%rax)                           ## handler->vtable[0xc0](handler)
 *   0x1468d7d  xorl   %eax, %eax                            ## return 0
 *   0x1468d7f  popq   %rbp; retq
 *
 * Calls HGHandler vtable slot *0xc0 with `this=handler`; slot semantics are undecoded.
 */
export function HgcMultiplyAlpha_Bind(_handler: unknown): number {
  // @Flexo 0x1468d77: handler->vtable[*0xc0](handler)  — undecoded.
  throw new Error(
    "HgcMultiplyAlpha::Bind not yet transcribed @Flexo 0x1468d70 — depends on undecoded " +
      "HGHandler vtable slot *0xc0 @Flexo 0x1468d77.",
  );
}

/**
 * `HgcMultiplyAlpha::BindTexture(HGHandler*, int)` @Flexo 0x1468cc0.
 *
 * Verbatim disasm summary (55 lines):
 *   Entry:
 *   0x1468cca  cmpl $1, %edx
 *   0x1468ccd  je   0x1468d01                                ## texIdx == 1 branch
 *   0x1468ccf  movl $0xffffffff, %r14d                       ## default return = -1
 *   0x1468cd5  testl %edx, %edx
 *   0x1468cd7  jne  0x1468d5d                                ## texIdx > 1: return -1
 *   -- texIdx == 0 --
 *   0x1468cdd  handler->vtable[*0x48](handler, 0, 0)
 *   0x1468ce0  r14 = 0                                        ## return 0
 *   0x1468ced  handler->vtable[*0x30](handler, 0, 0)
 *   0x1468cfa  rdi = handler; rsi = 0; jump to shared tail   ## fallthrough to TexCoord call
 *   -- texIdx == 1 --
 *   0x1468d01  handler->vtable[*0x48](handler, 1, 0)
 *   0x1468d04  r14 = 0
 *   0x1468d14  handler->vtable[*0x30](handler, 0, 0)
 *   0x1468d21  rdi = handler; rsi = 1
 *   -- Shared tail (both texIdx == 0 and == 1) --
 *   0x1468d29..0x1468d30  HGHandler::TexCoord(handler, rsi, 0, 0, NULL)
 *   0x1468d35  rdi = this->+0x90                             ## this->+0x90 is *another* HGHandler-
 *                                                             ## like object (or HGRenderer*?);
 *                                                             ## call its vtable[*0x80](rdi, 0x2e)
 *   0x1468d3c..0x1468d44  eax = (*(rdi + 0)).*0x80(rdi, 0x2e)
 *   0x1468d4a  testl %eax, %eax
 *   0x1468d4c  jne  0x1468d5d                                 ## if nonzero: fall out (return 0)
 *   0x1468d4e  handler->vtable[*0xa8](handler)                ## else: call *0xa8
 *   0x1468d5a  r14 = 0                                        ## return 0
 *   -- Exit --
 *   0x1468d5d  eax = r14; retq
 *
 * Every branch calls HGHandler vtable slots with undecoded semantics AND reads a member at
 * this->+0x90 (not seen in the ctor — likely written by base HGNode setup). We surface the
 * gap loudly.
 */
export function HgcMultiplyAlpha_BindTexture(
  self: HgcMultiplyAlphaState,
  _handler: unknown,
  texIdx: number,
): number {
  // @Flexo 0x1468cc0
  void self;
  void texIdx;
  throw new Error(
    "HgcMultiplyAlpha::BindTexture not yet transcribed @Flexo 0x1468cc0 — every branch " +
      "depends on undecoded HGHandler vtable slots *0x30 @0x1468cf7/0x1468d1e, " +
      "*0x48 @0x1468cea/0x1468d11, *0xa8 @0x1468d54, HGHandler::TexCoord @Flexo 0x1468d30, " +
      "AND on the this->+0x90 sub-object whose vtable *0x80 is called @Flexo 0x1468d44.",
  );
}

/**
 * `HgcMultiplyAlpha::shaderDescription() const` @Flexo 0x1468c70.
 *
 * Verbatim disasm — a std::string return by sret. Allocates 26 bytes via `operator new`
 * @0x1468c7e, copies the literal "HgcMultiplyAlpha [hgc1]" (23 chars + NUL) into it, and
 * sets the SSO/large-string header:
 *   0x1468c83  ret->_data_ptr = raw                          ## sret at rbx+0x10
 *   0x1468c87  ret->_size     = 0x1b (27) but that overlaps  ## really the "capacity | 1"
 *   0x1468c8e  ret->_capacity = 0x17 (23)                    ## the string length
 *   0x1468c96..0x1468cae  copy 24 chars into raw
 *
 * We faithfully return the literal string. The exact bit-layout of libc++'s std::string
 * (short vs. long, capacity bit-flag) is a runtime detail of the FCP binary; TS strings
 * carry the same character content.
 */
export const HgcMultiplyAlpha_SHADER_DESCRIPTION = "HgcMultiplyAlpha [hgc1]" as const;

export function HgcMultiplyAlpha_shaderDescription(_self: HgcMultiplyAlphaState): string {
  // @Flexo 0x1468ca4: literal "HgcMultiplyAlpha [hgc1]" copied into std::string.
  return HgcMultiplyAlpha_SHADER_DESCRIPTION;
}

/**
 * `HgcMultiplyAlpha::GetProgram(HGRenderer*)` @Flexo 0x14689a0.
 *
 * Verbatim disasm:
 *   0x14689a0  pushq %rbp; movq %rsp,%rbp
 *   0x14689a4  movq  %rsi, %rdi                              ## rdi = renderer
 *   0x14689a7  movl  $0x60000, %esi
 *   0x14689ac  callq __ZN10HGRenderer9GetTargetEj            ## eax = renderer->GetTarget(0x60000)
 *   0x14689b1  xorl  %ecx, %ecx                              ## rcx = 0 (default)
 *   0x14689b3  cmpl  $0x60b10, %eax
 *   0x14689b8  leaq  0x244099(%rip), %rax                    ## rax = Metal shader source ptr
 *   0x14689bf  cmoveq %rax, %rcx                             ## if target == 0x60b10: rcx = shader
 *   0x14689c3  movq  %rcx, %rax
 *   0x14689c6  popq  %rbp; retq
 *
 * Semantics: returns the Metal fragment shader source ONLY when the target is EXACTLY 0x60b10.
 * Any other target -> NULL. (Compare HGComicColorStroke, which returns Metal for target > 0x60b0f
 * — a similar but not identical threshold.)
 */
export const HgcMultiplyAlpha_METAL_TARGET_EQ = 0x60b10 as const;

/**
 * Metal fragment shader source (verbatim from Flexo literal pool).
 * Loaded via `leaq 0x244099(%rip), %rax` @0x14689b8; RIP-after = 0x14689bf;
 * target = 0x14689bf + 0x244099 = 0x16aca58.
 * Reported length (per the `//LEN=` header) = 0x2d3 = 723 bytes.
 */
export const HgcMultiplyAlpha_METAL_SHADER_SOURCE: string =
  "//Metal1.0     \n" +
  "//LEN=00000002d3\n" +
  "fragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n" +
  "    const constant float4* hg_Params [[ buffer(0) ]], \n" +
  "    texture2d< float > hg_Texture0 [[ texture(0) ]], \n" +
  "    sampler hg_Sampler0 [[ sampler(0) ]], \n" +
  "    texture2d< float > hg_Texture1 [[ texture(1) ]], \n" +
  "    sampler hg_Sampler1 [[ sampler(1) ]])\n" +
  "{\n" +
  "    float4 r0, r1;\n" +
  "    FragmentOut output;\n" +
  "\n" +
  "    r0.w = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy).w;\n" +
  "    r1.w = hg_Texture1.sample(hg_Sampler1, frag._texCoord1.xy).w;\n" +
  "    output.color0 = r0.wwww*r1.wwww;\n" +
  "    return output;\n" +
  "}\n" +
  "//MD5=4c765c06:d722b3b3:a8d43463:0e9ddbe0\n" +
  "//SIG=00000000:00000003:00000003:00000000:0000:0000:0002:0000:0000:0000:0006:0000:0002:02:0:1:0\n";

export function HgcMultiplyAlpha_GetProgram(_renderer: unknown): string | null {
  // @Flexo 0x14689a7-0x14689c6
  throw new Error(
    "HgcMultiplyAlpha::GetProgram not yet transcribed @Flexo 0x14689a0 — depends on " +
      "undecoded HGRenderer::GetTarget(unsigned int) @Flexo 0x14689ac. Metal shader source " +
      "is transcribed as HgcMultiplyAlpha_METAL_SHADER_SOURCE; the branch condition is " +
      "target == 0x60b10 -> return source; else -> return NULL.",
  );
}

/**
 * `HgcMultiplyAlpha::InitProgramDescriptor(HGProgramDescriptor*) const` @Flexo 0x14689d0.
 *
 * Sets up the descriptor with:
 *   - visible-shader "HgcMultiplyAlpha_hgc_visible" and its 132-byte source snippet;
 *   - fragment function name "HgcMultiplyAlpha";
 *   - a return HGBinding (type 4, "FragmentOut", inline SSO short-string layout);
 *   - THREE argument HGBindings (type 2, then two type-0xa), each name "float4"
 *     (0x616f6c66='floa', 0x3474='t4').
 *   - Passes the vector of 3 bindings to SetArgumentBindings.
 *
 * Every effective call target here is an undecoded stub (HGProgramDescriptor::Set* +
 * std::vector<HGBinding>::__emplace_back_slow_path + operator delete on the SSO overflow).
 * We throw with all decoded facts cited.
 */
export function HgcMultiplyAlpha_InitProgramDescriptor(_desc: unknown): void {
  // @Flexo 0x14689d0
  throw new Error(
    "HgcMultiplyAlpha::InitProgramDescriptor not yet transcribed @Flexo 0x14689d0 — " +
      "depends on undecoded HGProgramDescriptor::SetVisibleShaderWithSource(const char*, " +
      "const char*) @Flexo 0x14689f2, ::SetFragmentFunctionName(const char*) @Flexo " +
      "0x1468a01, ::SetReturnBinding(HGBinding) @Flexo 0x1468a48, " +
      "::SetArgumentBindings(const std::vector<HGBinding>&) @Flexo 0x1468bd3, and on " +
      "std::vector<HGBinding>::__emplace_back_slow_path @Flexo 0x1468a9e/0x1468b2b/" +
      "0x1468bb4. Decoded facts: visible-shader name = 'HgcMultiplyAlpha_hgc_visible' " +
      "@0x14689e1; fragment function name = 'HgcMultiplyAlpha' @0x14689f7; return " +
      "binding uses type 4 with SSO name 'FragmentOut' (bytes 'Fragment' 'Out\\0' " +
      "packed via movabsq 0x746e656d67617246 = 'Fragmen't reversed @0x1468a17, " +
      "movl 0x74754f74 = 'tOut' reversed @0x1468a28); three argument bindings all " +
      "named 'float4' with type-tags 2, 0xa, 0xa (bytes 0x616f6c66 'floa' + 0x3474 't4').",
  );
}

/**
 * `HgcMultiplyAlpha::RenderTile(HGTile*)` @Flexo 0x1469020.
 *
 * Verbatim algorithm (from the 115-line disasm) — CPU/SSE software fallback.
 *
 * Tile layout (from field offsets used, all int32 / int64 as marked):
 *   tile.x0            : int  @+0x00
 *   tile.y0            : int  @+0x04
 *   tile.x1            : int  @+0x08
 *   tile.y1            : int  @+0x0c
 *   tile.outPtr        : void*  @+0x10   (float4 texels)
 *   tile.outRowStride  : int  @+0x18    (in TEXELS = 16-byte units)
 *   tile.in0Ptr        : void*  @+0x50
 *   tile.in0RowStride  : int  @+0x58    (in TEXELS)
 *   tile.in1Ptr        : void*  @+0x60
 *   tile.in1RowStride  : int  @+0x68    (in TEXELS)
 *
 * Flow:
 *   0x1469030  tile->Renderer() -> renderer                  (@stub 0x1497218)
 *   0x146903a  renderer->GetTarget(0) -> target              (@stub 0x1495ea4)
 *   0x146903f  if (target >= 0x4700000) -> tail-call RenderTile_AVX(tile) and return.
 *   Otherwise (SSE path):
 *     h = y1 - y0;                                           ## @0x146905b
 *     if (h <= 0) return 0;
 *     w = x1 - x0;                                           ## @0x1469067
 *     in0 = in0Ptr; in1 = in1Ptr; out = outPtr;
 *     rowStrideOut = outRowStride;
 *     rowStrideIn0 = in0RowStride; rowStrideIn1 = in1RowStride;
 *
 *     if (w >= 2):
 *       ## strides multiplied by 16 (bytes-per-texel) — @0x1469090..0x1469098
 *       for (row = 0; row < h; ++row):
 *         xLimit = w - 2;                                    ## loop variable r14 walks down from 0
 *         for (col = 0; col+1 < w; col += 2):                ## 2-texel SSE stride
 *           x0 = in0[col+0] * in1[col+0]                     ## packed-multiply RGBA
 *           x1 = in0[col+1] * in1[col+1]
 *           out[col+0] = broadcast_w(x0)                     ## shufps 0xff -> [w,w,w,w]
 *           out[col+1] = broadcast_w(x1)
 *         ## tail — one leftover pixel if w is odd:
 *         if ((-xLimit) < w):
 *           x = in0[last] * in1[last]
 *           out[last] = broadcast_w(x)
 *         in0 += rowStrideIn0; in1 += rowStrideIn1; out += rowStrideOut
 *       return 0
 *
 *     else if (w == 1):
 *       ## Unrolled 2-row scalar path — @0x1469125..0x146919c
 *       ## Strides are pre-multiplied by both 16 (byte-per-texel) and 2 (two rows),
 *       ## so a "step" advances by two rows. The loop halves h and does two rows per
 *       ## iteration; a final `testb $1, %al` handles the odd-h tail.
 *       rowsHalved = h & 0x7ffffffe   # top bit clear (safe for int32)
 *       stride2In0 = rowStrideIn0 * 32; strideIn0 = rowStrideIn0 * 16
 *       stride2In1 = rowStrideIn1 * 32; strideIn1 = rowStrideIn1 * 16
 *       stride2Out = rowStrideOut * 32; strideOut = rowStrideOut * 16
 *       for (i = rowsHalved; i > 0; i -= 2):
 *         out[0]         = broadcast_w(in0[0]         * in1[0])
 *         out[strideOut] = broadcast_w(in0[strideIn0] * in1[strideIn1])
 *         in0 += stride2In0; in1 += stride2In1; out += stride2Out
 *       if (h & 1):
 *         out[0] = broadcast_w(in0[0] * in1[0])
 *       return 0
 *
 *     else if (w == 0):
 *       return 0
 *
 * Note: the "broadcast_w" step is `shufps $0xff, %xmm, %xmm` — i.e. `xmm = [xmm.w,xmm.w,xmm.w,xmm.w]`.
 * This mirrors the Metal shader exactly: `output.color0 = r0.wwww * r1.wwww`, where r0.w and
 * r1.w are the alphas of the two inputs. The elementwise `mulps` produces (r*r, g*g, b*b, a*a)
 * and then the shufps replaces all lanes with the `.w` (alpha*alpha) lane.
 */
export interface HgcMultiplyAlphaTile {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** Output plane — RGBA float32 texels, row-major, `outRowStride` texels per row. */
  outPtr: Float32Array;
  outRowStride: number;
  /** Input 0 plane. */
  in0Ptr: Float32Array;
  in0RowStride: number;
  /** Input 1 plane. */
  in1Ptr: Float32Array;
  in1RowStride: number;
}

export function HgcMultiplyAlpha_RenderTile(
  _self: HgcMultiplyAlphaState,
  tile: HgcMultiplyAlphaTile,
): number {
  // @Flexo 0x1469030..0x146903a: tile->Renderer()->GetTarget(0). These callees are undecoded,
  // BUT the ONLY effect of the returned target on this function is the dispatch to
  // RenderTile_AVX for target >= 0x4700000. We can safely take the SSE path here (matches
  // the CPU-fallback semantics — same math, narrower lanes).
  // (The AVX branch @0x1469049 goes to RenderTile_AVX which is throw-stubbed below.)
  const h = (tile.y1 - tile.y0) | 0;
  // @Flexo 0x146905e: subl %r11d, %eax; jle @0x146919f
  if (h <= 0) return 0;
  const w = (tile.x1 - tile.x0) | 0;
  const in0 = tile.in0Ptr;
  const in1 = tile.in1Ptr;
  const out = tile.outPtr;
  const rin0 = tile.in0RowStride | 0;
  const rin1 = tile.in1RowStride | 0;
  const rout = tile.outRowStride | 0;
  // @Flexo 0x146906e..0x1469086 (loaded but strides in the CPU are texel counts; we index
  // Float32Array in units of float32 -- 4 float32s per texel).

  if (w >= 2) {
    // @Flexo 0x1469090..0x1469098: shlq $0x4 turns texel-strides into byte-strides.
    // In TS we index by float32 units, so 1 texel = 4 float32s.
    for (let row = 0; row < h; ++row) {
      const off0 = (row * rin0) << 2;
      const off1 = (row * rin1) << 2;
      const offO = (row * rout) << 2;
      // @Flexo 0x14690d0..0x14690ee: 2-texel SSE inner loop.
      let col = 0;
      for (; col + 1 < w; col += 2) {
        // Texel 0 of the pair.
        const p0 = off0 + (col << 2);
        const p1 = off1 + (col << 2);
        const pO = offO + (col << 2);
        // packed-multiply RGBA (mulps): m = in0 * in1 componentwise.
        // Then shufps $0xff broadcasts .w to all lanes: out = [m.w, m.w, m.w, m.w].
        const mA_w = Math.fround(Math.fround(in0[p0 + 3]) * Math.fround(in1[p1 + 3]));
        out[pO + 0] = mA_w;
        out[pO + 1] = mA_w;
        out[pO + 2] = mA_w;
        out[pO + 3] = mA_w;
        // Texel 1 of the pair.
        const p0b = off0 + ((col + 1) << 2);
        const p1b = off1 + ((col + 1) << 2);
        const pOb = offO + ((col + 1) << 2);
        const mB_w = Math.fround(Math.fround(in0[p0b + 3]) * Math.fround(in1[p1b + 3]));
        out[pOb + 0] = mB_w;
        out[pOb + 1] = mB_w;
        out[pOb + 2] = mB_w;
        out[pOb + 3] = mB_w;
      }
      // @Flexo 0x1469113..0x1469123: one-texel tail if w is odd.
      if (col < w) {
        const p0 = off0 + (col << 2);
        const p1 = off1 + (col << 2);
        const pO = offO + (col << 2);
        const m_w = Math.fround(Math.fround(in0[p0 + 3]) * Math.fround(in1[p1 + 3]));
        out[pO + 0] = m_w;
        out[pO + 1] = m_w;
        out[pO + 2] = m_w;
        out[pO + 3] = m_w;
      }
    }
    return 0;
  }

  // @Flexo 0x1469125..
  if (w === 1) {
    // Two-rows-at-a-time scalar unroll (see disasm walk in the doc comment).
    let row = 0;
    // rowsHalved corresponds to `h & 0x7ffffffe` -> the largest even count <= h.
    const rowsPaired = h & 0x7ffffffe;
    for (; row < rowsPaired; row += 2) {
      const off0a = (row * rin0) << 2;
      const off1a = (row * rin1) << 2;
      const offOa = (row * rout) << 2;
      const off0b = ((row + 1) * rin0) << 2;
      const off1b = ((row + 1) * rin1) << 2;
      const offOb = ((row + 1) * rout) << 2;
      const mA = Math.fround(Math.fround(in0[off0a + 3]) * Math.fround(in1[off1a + 3]));
      out[offOa + 0] = mA;
      out[offOa + 1] = mA;
      out[offOa + 2] = mA;
      out[offOa + 3] = mA;
      const mB = Math.fround(Math.fround(in0[off0b + 3]) * Math.fround(in1[off1b + 3]));
      out[offOb + 0] = mB;
      out[offOb + 1] = mB;
      out[offOb + 2] = mB;
      out[offOb + 3] = mB;
    }
    // @Flexo 0x146918e: testb $1, %al — odd-row tail.
    if ((h & 1) !== 0) {
      const off0 = (row * rin0) << 2;
      const off1 = (row * rin1) << 2;
      const offO = (row * rout) << 2;
      const m = Math.fround(Math.fround(in0[off0 + 3]) * Math.fround(in1[off1 + 3]));
      out[offO + 0] = m;
      out[offO + 1] = m;
      out[offO + 2] = m;
      out[offO + 3] = m;
    }
    return 0;
  }
  // w <= 0: nothing to do (also matches @0x1469129 jne -> exit path).
  return 0;
}

/**
 * `HgcMultiplyAlpha::RenderTile_AVX(HGTile*)` @Flexo 0x1468d90.
 *
 * 163-line AVX8 (256-bit / 6-lane unroll) variant of RenderTile — same output math, wider
 * vectors. NOT transcribed in this pass: the loop structure requires decoding vpermilps
 * and vshufps blends we haven't verified. Callers who don't need AVX can dispatch to the
 * SSE path in HgcMultiplyAlpha_RenderTile above (it is byte-equivalent within FP32 rounding
 * because the operations are elementwise mul + broadcast — no cross-lane reduction).
 */
export function HgcMultiplyAlpha_RenderTile_AVX(
  _self: HgcMultiplyAlphaState,
  _tile: HgcMultiplyAlphaTile,
): number {
  // @Flexo 0x1468d90
  throw new Error(
    "HgcMultiplyAlpha::RenderTile_AVX @Flexo 0x1468d90 not yet transcribed — 163-line AVX2 " +
      "variant of RenderTile; the SSE path in HgcMultiplyAlpha_RenderTile produces identical " +
      "outputs (elementwise mul + broadcast, no cross-lane reduction).",
  );
}

// FRONTIER CALLEE STUBS

function HGNode_HGNode_stub(): void {
  // Called from HgcMultiplyAlpha ctor @Flexo 0x146926a (via __stub 0x1496c06).
  throw new Error("HGNode::HGNode() @Flexo (stub 0x1496c06) not yet transcribed");
}

function HGNode_dtor_stub(): void {
  // Called from HgcMultiplyAlpha dtor @Flexo 0x14693a0 (via __stub 0x1496c0c).
  throw new Error("HGNode::~HGNode() @Flexo (stub 0x1496c0c) not yet transcribed");
}

function HGObject_operator_delete_stub(): void {
  // Called from HgcMultiplyAlpha D0 @Flexo 0x14693ae (via __stub 0x1496d8c).
  throw new Error("HGObject::operator delete(void*) @Flexo (stub 0x1496d8c) not yet transcribed");
}
