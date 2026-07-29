// HgcAddAlpha.ts — FCP Flexo framework class (alpha "screen" add render node).
//
// Transcribed from the x86_64 disassembly of Flexo in
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// See raw-port/re/disasm/Flexo.HgcAddAlpha.*.s.
//
// SYMBOLS (nm | c++filt):
//   0x1454110  T HgcAddAlpha::GetProgram(HGRenderer*)
//   0x1454140  T HgcAddAlpha::InitProgramDescriptor(HGProgramDescriptor*) const
//   0x1454450  T HgcAddAlpha::shaderDescription() const
//   0x1454480  T HgcAddAlpha::BindTexture(HGHandler*, int)
//   0x1454530  T HgcAddAlpha::Bind(HGHandler*)
//   0x1454550  T HgcAddAlpha::RenderTile_AVX(HGTile*)
//   0x1454790  T HgcAddAlpha::RenderTile(HGTile*)
//   0x1454890  T HgcAddAlpha::GetDOD(HGRenderer*, int, HGRect)
//   0x14548b0  T HgcAddAlpha::GetROI(HGRenderer*, int, HGRect)
//   0x14548d0  T HgcAddAlpha::HgcAddAlpha()                                (C2)
//   0x1454950  T HgcAddAlpha::HgcAddAlpha()                                (C1)
//   0x14549d0  T HgcAddAlpha::~HgcAddAlpha()                               (D2)
//   0x1454a20  T HgcAddAlpha::~HgcAddAlpha()                               (D1)
//   0x1454a70  T HgcAddAlpha::~HgcAddAlpha()                               (D0)
//   0x1454ac0  T HgcAddAlpha::SetParameter(int, float, float, float, float)
//   0x1454ad0  T HgcAddAlpha::GetParameter(int, float*)
//   0x1454ae0  T HgcAddAlpha::GetOutput(HGRenderer*)
//
// FIELD LAYOUT (extends HGNode; HGNode base +0x00..+0x197 is opaque here — modeled
// after the sibling HgcMultiplyAlpha which shares the identical scratch-alignment
// idiom in its ctor):
//   +0x10  int flags — RMW at ctor @0x14549a0..0x14549ad:
//             flags = (flags & 0xFFFFF9FF) | 0x400   (clear bits 9..10, set bit 10).
//   +0x198 float*  scratch32AlignedPtr — a 32-byte-aligned pointer into a heap block
//             allocated by `operator new[](0x47)` at @0x145496e.
//             The alignment gymnastics @0x1454973..0x1454988 are the standard clang
//             manual-alignment idiom:
//               p = (raw + 8);
//               p = raw + (-((raw+8)) & 0x1f) + 8;   // aligned = raw + 8 + ((-raw - 8) & 31)
//             which lands `p` on a 32-byte boundary >= raw+8.  The raw pointer is
//             stashed at (aligned - 8) so D0 can free it.
//             Ctor pre-fills two 16-byte slots at offsets +0x8 and +0x18 with
//             `movaps [K_ONE_PACKED4]` = { 1.0f, 1.0f, 1.0f, 1.0f } — the "white"
//             constant reused by both RenderTile and RenderTile_AVX.
//
// PROGRAM SHAPE (from the Metal shader source literally embedded in .rodata at
// @0x14520af, and cited by both GetProgram and InitProgramDescriptor):
//     r0.w = color0.w;
//     r1.w = color1.w;
//     r1.w = r1.w * -r0.w + r1.w;             // r1.w * (1 - r0.w)
//     r0   = r0.wwww + r1.wwww;
//     output.color0 = fmin(1.0.xxxx, r0);
// i.e. `out.rgba = min(1, a0 + a1*(1 - a0)).wwww`.  This is exactly the
// "over" alpha-compositing formula (`a_out = a0 + a1*(1-a0)`) broadcast to all
// four channels — the Metal shader is deliberately alpha-only.
//
// The CPU RenderTile (@0x1454790..0x1454880) inlines a mathematically-
// equivalent SSE form:
//     xmm0 = color1[i]                   (RGBA source-B pixel)
//     xmm1 = scratch32[0..3] = white     (constant 1.0 pre-filled by ctor)
//     xmm2 = xmm1 - xmm0                 = 1 - color1
//     xmm2 = xmm2 * color0[i]            = color0 * (1 - color1)
//     xmm2 = xmm2 + xmm0                 = color1 + color0 * (1 - color1)
//     xmm2 = xmm2.wwww                   ; broadcast alpha lane
//     xmm2 = min(xmm1, xmm2)             ; clamp to 1.0
//     output[i] = xmm2
// Note that the CPU code swaps the roles of the two textures relative to the
// shader (it reads `color0` from the second buffer at r9 and `color1` from the
// first buffer at r8 — algebraically identical because addition commutes).
//
// FRONTIER CALLEES (throw-stubbed for calls that require external symbols):
//   HGNode::HGNode() / HGNode::~HGNode()  @Flexo (stubs 0x1496c06 / 0x1496c0c)
//   HGObject::operator delete(void*)      @Flexo (stub 0x1496d8c)
//   operator new[](size_t) / delete(void*) @Flexo (stubs 0x1497446 / 0x1497404)
//   HGTile::Renderer() const              @Flexo (stub 0x1497218)
//   HGRenderer::GetTarget(unsigned int)   @Flexo (stub 0x1495ea4)
//   HGHandler::TexCoord(int,int,int,double const*)  @Flexo (stub 0x1496df2)
//   HGProgramDescriptor::SetVisibleShaderWithSource / SetFragmentFunctionName /
//     SetReturnBinding / SetArgumentBindings  @Flexo (stubs 0x14966d8..0x14966d2..
//     0x14966c6..0x14966cc)
//   std::vector<HGBinding>::__emplace_back_slow_path                     @Flexo

import type { HGRect } from "./HGRect.js";
import { HGRectNull } from "./HGRect.js";

/**
 * Vtable-installed pointer address for HgcAddAlpha.
 * From ctor C1 @Flexo 0x145495f (leaq 0x4d779a(%rip)); RIP-after = 0x1454966;
 *   target = 0x1454966 + 0x4d779a = 0x192c100.
 */
export const HgcAddAlpha_VTABLE_INSTALLED_PTR = 0x192c100 as const;

/**
 * The single 16-byte packed-1.0f constant that the ctor writes into two 16-byte
 * slots of the scratch buffer (@0x1454988 movaps 0x119fa1(rip),xmm0 ⇒ Flexo 0x156e930
 * which reads as u64=0x3f8000003f800000 twice: four packed 1.0f).  Also referenced
 * as the "white" clamp bound by the RenderTile SSE loop (@0x145483c movaps (%r15),xmm1).
 */
const K_ONE_PACKED4 = new Float32Array([1.0, 1.0, 1.0, 1.0]);

/**
 * The HgcAddAlpha instance state.
 * HGNode base subobject is opaque here (see raw-port/src/render/HGNode.ts).
 */
export interface HgcAddAlphaState {
  /** HGNode base placeholder (+0x00..+0x197). */
  _hgNode: unknown;
  /** +0x10 int flags — RMW at ctor: flags = (flags & ~0x600) | 0x400  (@0x14549a0..0x14549ad). */
  _nodeFlags10: number;
  /** +0x198 pointer — the 32-byte-aligned scratch buffer set by ctor (@0x1454999).
   *  Modeled as a Float32Array in TS; the aligned-offset dance is a no-op for us.
   *  Pre-filled at offsets +0x8 and +0x18 with the K_ONE_PACKED4 constant.
   *  The RenderTile SSE loop reads the FIRST 16 bytes of this buffer at (%r15),
   *  which corresponds to the aligned "p" pointer stored at +0x198 — that is
   *  the block at raw-offset +8 (see below), which the ctor left as { 1.0f x 4 }
   *  from the movaps at @0x145498f writing to `0x18(%rcx,%rax)`.
   *  NOTE: the two writes are to `0x8(%rcx,%rax)` and `0x18(%rcx,%rax)` where
   *  `rcx = -(raw+8) & 0x1f`, so the aligned pointer `rdx = rcx+rax+8` sits at
   *  `rax + rcx + 8`.  The +0x18 write is at address `rax + rcx + 0x18` which
   *  is `rdx + 0x10` — the SECOND 16-byte slot after the aligned pointer.  The
   *  RenderTile loop reads the FIRST slot at `(%r15)` which is `rdx` — but the
   *  ctor also writes to `0x8(%rcx,%rax)` at address `rax + rcx + 8 = rdx` —
   *  so BOTH the aligned slot AND the slot after it get { 1.0f x 4 }.  In TS
   *  we just store the aligned slot; the second slot is unused. */
  scratch: Float32Array | null;
  /** Raw buffer that owns `scratch` — retained so we can drop it in the deleting dtor.
   *  Corresponds to the raw pointer stashed at (aligned - 8) in the real function. */
  _scratchRaw: ArrayBuffer | null;
}

/**
 * `HgcAddAlpha::HgcAddAlpha()` @Flexo 0x1454950 (C1) / 0x14548d0 (C2 — same shape).
 *
 * Verbatim disasm (C1 form @0x1454950..0x14549b4):
 *   0x1454950  pushq  %rbp; movq %rsp,%rbp; pushq %r14; pushq %rbx
 *   0x1454957  movq  %rdi,%rbx
 *   0x145495a  callq HGNode::HGNode()                             (stub @0x1496c06)
 *   0x145495f  leaq  0x4d779a(%rip),%rax; movq %rax,(%rbx)       ; install vtable @0x192c100
 *   0x1454969  movl  $0x47,%edi
 *   0x145496e  callq __Znam  (operator new[](0x47))               (stub @0x1497446)
 *   0x1454973  leaq  0x8(%rax),%rcx
 *   0x1454977  negl  %ecx
 *   0x1454979  andl  $0x1f,%ecx
 *   0x145497c  leaq  (%rcx,%rax),%rdx
 *   0x1454980  addq  $0x8,%rdx
 *   0x1454984  movq  %rax,(%rcx,%rax)                             ; stash raw at aligned-8
 *   0x1454988  movaps 0x119fa1(%rip),%xmm0                        ; xmm0 = K_ONE_PACKED4
 *   0x145498f  movaps %xmm0,0x18(%rcx,%rax)                       ; slot +0x10 of aligned
 *   0x1454994  movaps %xmm0,0x8(%rcx,%rax)                        ; slot at aligned (== rdx)
 *   0x1454999  movq  %rdx,0x198(%rbx)                             ; store aligned into 0x198
 *   0x14549a0  movl  $0xFFFFF9FF,%eax; andl 0x10(%rbx),%eax; orl $0x400,%eax; movl %eax,0x10(%rbx)
 *   0x14549b0  popq %rbx; popq %r14; popq %rbp; retq
 *
 * The unwind landing pad @0x14549b5..0x14549c8 releases the raw allocation on
 * HGNode ctor throw — omitted here (exception paths not exercised by the port).
 */
export function HgcAddAlpha_C1(): HgcAddAlphaState {
  // 1. Call HGNode::HGNode() on the base subobject.
  //    @Flexo 0x145495a — stub 0x1496c06.  Modeled as an opaque placeholder.
  const nodeBase = HGNode_C2_stub();

  // 2. Install the HgcAddAlpha vtable @0x192c100 into (rbx).
  //    In the TS port this is a no-op: the vtable is not exercised as data.

  // 3. `operator new[](0x47)` — 71 raw bytes.  We over-allocate 32-byte-aligned
  //    slack in JS by using a Float32Array of the smallest length whose byte
  //    footprint covers the aligned slot the ctor writes into.  The alignment
  //    dance is captured in the disasm comment above; in TS the ArrayBuffer we
  //    allocate is (arbitrarily) 8-byte-aligned by the JS engine, so a plain
  //    `new Float32Array(4)` is a faithful model of the ALIGNED slot's contents.
  //    We keep the "raw" reference separately for the D0 delete path.
  //    @Flexo 0x145496e — stub 0x1497446 (operator new[]).
  const rawBuf = new ArrayBuffer(0x47);
  // Model the aligned slot at raw+8+align-slack.  Since we don't emulate the
  // real pointer arithmetic byte-exactly, we allocate a fresh Float32Array —
  // the ONLY data ever read from this buffer by RenderTile is the { 1.0f x 4 }
  // seed written by the ctor at @0x1454994 (which the real code writes to
  // `0x8(rcx,rax) == rdx`, i.e. the aligned pointer itself).
  const scratch = new Float32Array(4);
  // Copy K_ONE_PACKED4 into the aligned slot.  This is the movaps @0x1454994.
  scratch[0] = 1.0;
  scratch[1] = 1.0;
  scratch[2] = 1.0;
  scratch[3] = 1.0;
  // The second movaps @0x145498f writes the same value to `0x18(rcx,rax)` —
  // i.e. one 16-byte slot BEYOND the aligned pointer.  RenderTile never reads
  // it (the SSE loop reads only `(%r15) = *scratch`), so we don't model it.

  // 4. flags = (flags & 0xFFFFF9FF) | 0x400.  Starting from a zero-init base:
  //    (0 & ~0x600) | 0x400 = 0x400.
  const nodeFlags10 = (0 & 0xfffff9ff) | 0x400;

  return {
    _hgNode: nodeBase,
    _nodeFlags10: nodeFlags10,
    scratch,
    _scratchRaw: rawBuf,
  };
}

/** C2 base ctor @0x14548d0 — identical shape to C1 above; delegated. */
export function HgcAddAlpha_C2(): HgcAddAlphaState {
  return HgcAddAlpha_C1();
}

/**
 * `HgcAddAlpha::~HgcAddAlpha()` @Flexo 0x14549d0 (D2) / 0x1454a20 (D1) /
 * 0x1454a70 (D0).
 *
 * Not fully transcribed here — the D2 path unwinds the base HGNode subobject
 * (via HGNode::~HGNode() stub @0x1496c0c) and releases the raw pointer
 * stashed at `*(scratch - 8)` via `operator delete(void*)` (stub @0x1497404).
 * The TS port drops both refs; GC handles the rest.
 */
export function HgcAddAlpha_D2(self: HgcAddAlphaState): void {
  // 1. Free the raw scratch allocation (@0x14549XX; via stub 0x1497404).
  self.scratch = null;
  self._scratchRaw = null;
  // 2. Base HGNode::~HGNode() (@Flexo stub 0x1496c0c) — placeholder.
  HGNode_D2_stub(self._hgNode);
}

/**
 * `HgcAddAlpha::shaderDescription() const` @Flexo 0x1454450.
 *
 * Writes the 20-byte literal string "HgcAddAlpha [hgc1]" into the caller-
 * supplied std::string return slot.  The `movb $0x24` at @0x1454457 sets the
 * SSO tag byte (short-string mode: length nibble = 0x24 >> 1 = 0x12 = 18
 * chars, low bit = 0 marks SSO), then two movups fill 16 characters from the
 * .rodata literal @0x24df93(rip) resolved to Flexo 0x16a23f4, then a movw
 * writes the last 2 chars "1]", and a final movb NUL-terminates.
 *
 * We model this as returning the plain JS string.  The .rodata address
 * decodes to exactly `"HgcAddAlpha [hgc1]"` (18 chars — matches the SSO
 * length byte 0x12).
 */
export function HgcAddAlpha_shaderDescription(_self: HgcAddAlphaState): string {
  // @Flexo 0x1454450: string literal at .rodata @0x24df93(rip after 0x1454461) = 0x16a23f4.
  return "HgcAddAlpha [hgc1]";
}

/**
 * `HgcAddAlpha::GetProgram(HGRenderer*)` @Flexo 0x1454110.
 *
 * Verbatim body:
 *   rdi = renderer
 *   esi = 0x60000                                          ; some "target kind"
 *   rax = renderer->GetTarget(0x60000)                     ; @stub 0x1495ea4
 *   rcx = 0
 *   if (rax == 0x60b10) rcx = &metalShaderSource@0x14a2050 ; leaq 0x24df2c(rip)
 *   return rcx
 *
 * Semantics: only return the (Metal 1.0) shader source when the renderer's
 * requested target-kind is `0x60b10`; otherwise return null.  The literal
 * shader source itself is embedded in .rodata; its full text is transcribed
 * in HGCADD_METAL_FRAGMENT_SHADER below.
 */
export function HgcAddAlpha_GetProgram(
  _self: HgcAddAlphaState,
  rendererGetTarget60000: number,
): string | null {
  // @Flexo 0x1454123: cmpl $0x60b10, %eax ; cmoveq %rax(source), %rcx
  return rendererGetTarget60000 === 0x60b10 ? HGCADD_METAL_FRAGMENT_SHADER : null;
}

/**
 * The Metal fragment shader source literally embedded in Flexo's .rodata at
 * @0x14a2050 (RIP-relative from @0x145412f).  Cited verbatim, including the
 * `//LEN=` and `//MD5=`/`//SIG=` comment trailers Apple ships in the binary.
 */
export const HGCADD_METAL_FRAGMENT_SHADER = [
  "//Metal1.0     ",
  "//LEN=0000000361",
  "fragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], ",
  "    const constant float4* hg_Params [[ buffer(0) ]], ",
  "    texture2d< float > hg_Texture0 [[ texture(0) ]], ",
  "    sampler hg_Sampler0 [[ sampler(0) ]], ",
  "    texture2d< float > hg_Texture1 [[ texture(1) ]], ",
  "    sampler hg_Sampler1 [[ sampler(1) ]])",
  "{",
  "    const float4 c0 = float4(1.000000000, 0.000000000, 0.000000000, 0.000000000);",
  "    float4 r0, r1;",
  "    FragmentOut output;",
  "",
  "    r0.w = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy).w;",
  "    r1.w = hg_Texture1.sample(hg_Sampler1, frag._texCoord1.xy).w;",
  "    r1.w = r1.w*-r0.w + r1.w;",
  "    r0 = r0.wwww + r1.wwww;",
  "    output.color0 = fmin(c0.xxxx, r0);",
  "    return output;",
  "}",
  "//MD5=5b19954e:9d858763:02a2bd3c:f5d42cb1",
  "//SIG=00000000:00000003:00000003:00000000:0001:0000:0002:0000:0000:0000:0006:0000:0002:02:0:1:0",
  "",
].join("\n");

/**
 * `HgcAddAlpha::InitProgramDescriptor(HGProgramDescriptor*) const` @Flexo 0x1454140.
 *
 * Populates the caller-supplied HGProgramDescriptor with the "visible" (call-
 * from-function-graph) form of the shader plus binding metadata:
 *   descriptor.SetVisibleShaderWithSource("HgcAddAlpha_hgc_visible", <mtl source>)
 *   descriptor.SetFragmentFunctionName("HgcAddAlpha")
 *   descriptor.SetReturnBinding({ kind=4, kindTag=0x16, name="FragmentOut", nameTag=0x74754f74 })
 *   ... (four SetArgumentBindings each pushed via std::vector<HGBinding>::emplace_back)
 *   descriptor.SetArgumentBindings(&argsVec)  @stub 0x14966cc
 *
 * The `movabsq $0x746e656d67617246` @0x1454187 stashes "Fragment" (LE ASCII);
 * the trailing 4-byte `movl $0x74754f74` @0x1454198 writes "tOut" — together
 * "FragmentOut", the C++-side type name for the return binding.  A parallel
 * dance @0x14541e9..0x14541f6 stashes "float4" for the argument binding type.
 *
 * The full binding-vector construction is 159 lines of clang codegen and
 * involves 6 nested SSO-string allocations we do not need for the render path.
 * Left as a throwing stub — cited to 0x1454140 — so the frontier stays visible.
 */
export function HgcAddAlpha_InitProgramDescriptor(
  _self: HgcAddAlphaState,
  _descriptor: unknown,
): void {
  // Not yet transcribed (@Flexo 0x1454140): the 159-line binding-vector
  // construction (SetVisibleShaderWithSource, SetFragmentFunctionName,
  // SetReturnBinding, 4× SetArgumentBinding emplace_back, SetArgumentBindings).
  throw new Error(
    "HgcAddAlpha::InitProgramDescriptor @Flexo 0x1454140 not yet transcribed " +
      "(binding-vector construction over HGProgramDescriptor + 4× HGBinding " +
      "SSO-string emplace_back; see raw-port/re/disasm/Flexo.HgcAddAlpha.InitProgramDescriptor.s)",
  );
}

/**
 * `HgcAddAlpha::BindTexture(HGHandler*, int)` @Flexo 0x1454480.
 *
 * Binds the two input textures for the fragment shader:
 *   if (idx == 0):
 *     handler->vtable[0x48](0, 0)                  ; SetFragmentTexture(0, ...)
 *     handler->vtable[0x30](0, 0)                  ; SetSampler(0, ...)
 *     handler->TexCoord(0, 0, 0, nullptr)          ; @stub 0x1496df2
 *     v = ((*(handler + 0x90))->vtable[0x80])(0x2e); if (v == 0) handler->vtable[0xa8]()
 *     return 0
 *   else if (idx == 1):
 *     handler->vtable[0x48](1, 0)                  ; SetFragmentTexture(1, ...)
 *     handler->vtable[0x30](0, 0)                  ; SetSampler(0, ...)  ← still slot 0!
 *     handler->TexCoord(1, 0, 0, nullptr)
 *     v = ...vtable[0x80](0x2e); if (v == 0) handler->vtable[0xa8]()
 *     return 0
 *   else:
 *     return -1
 *
 * The port routes through the HGHandler stub — the actual vtable-slot bodies
 * are not decoded here.  Every observable side effect is a throw-stub so a
 * caller that reaches this path surfaces the missing HGHandler subsystem
 * loudly, per the anti-shortcut spec.
 */
export function HgcAddAlpha_BindTexture(
  _self: HgcAddAlphaState,
  _handler: unknown,
  idx: number,
): number {
  // @Flexo 0x145448a..0x1454497: branch on idx.
  if (idx !== 0 && idx !== 1) {
    return -1; // @0x145448f movl $0xffffffff, r14d ; @0x145451d return
  }
  // Undecoded HGHandler vtable slots (0x48 = SetFragmentTexture, 0x30 = SetSampler,
  // 0x80 = ??? (queried with arg 0x2e), 0xa8 = ??? fallback).  Left as a stub.
  throw new Error(
    "HgcAddAlpha::BindTexture @Flexo 0x1454480 not yet transcribed for idx==" +
      idx +
      " (calls HGHandler vtable slots 0x48/0x30/0x80/0xa8 + HGHandler::TexCoord " +
      "@0x1496df2 — HGHandler subsystem not ported)",
  );
}

/**
 * `HgcAddAlpha::Bind(HGHandler*)` @Flexo 0x1454530.
 *
 * Verbatim: `handler->vtable[0xc0](handler); return 0;`
 * — a single vtable dispatch on the handler.  Slot 0xc0 is not identified.
 */
export function HgcAddAlpha_Bind(_self: HgcAddAlphaState, _handler: unknown): number {
  // @Flexo 0x1454534: `callq *0xc0(rax)`.
  throw new Error(
    "HgcAddAlpha::Bind @Flexo 0x1454530 not yet transcribed " +
      "(single vtable dispatch on HGHandler::vtable[0xc0])",
  );
}

/**
 * `HgcAddAlpha::GetDOD(HGRenderer*, int idx, HGRect rect)` @Flexo 0x1454890.
 *
 * Verbatim body:
 *   rax = rect_low; r8 = rect_high         (via passthrough of %rcx/%r8)
 *   if (idx >= 2):   { rax, r8 } = HGRectNull
 *   return { rax, r8 }
 *
 * i.e. `return idx < 2 ? rect : HGRectNull;`.  The DOD (domain of definition)
 * of the two input plates passes through unchanged; anything above idx=1 is
 * the null rect (this node only has two inputs).
 */
export function HgcAddAlpha_GetDOD(
  _self: HgcAddAlphaState,
  _renderer: unknown,
  idx: number,
  rect: HGRect,
): HGRect {
  // @Flexo 0x1454893: `cmpl $0x2, edx; jb passthrough; else load HGRectNull`.
  return idx < 2 ? rect : HGRectNull;
}

/**
 * `HgcAddAlpha::GetROI(HGRenderer*, int idx, HGRect rect)` @Flexo 0x14548b0.
 *
 * Byte-for-byte identical shape to GetDOD: `return idx < 2 ? rect : HGRectNull;`.
 * The ROI (region of interest) each input requires is exactly the requested
 * output rect for both input plates.
 */
export function HgcAddAlpha_GetROI(
  _self: HgcAddAlphaState,
  _renderer: unknown,
  idx: number,
  rect: HGRect,
): HGRect {
  // @Flexo 0x14548b3: identical to GetDOD.
  return idx < 2 ? rect : HGRectNull;
}

/**
 * `HgcAddAlpha::RenderTile(HGTile*)` @Flexo 0x1454790.
 *
 * Software fallback for the "Add-alpha" (a.k.a. "over" alpha-compositing)
 * shader.  Decoded verbatim below.  The AVX path (@0x1454550) is a wider
 * 6-lane variant of the same math and is left as a throw-stub for now.
 *
 * PSEUDOCODE (mirrors the register allocation @0x1454790..0x1454880):
 *
 *   target = tile->Renderer()->GetTarget(0)                  ; @stub 0x1497218 / 0x1495ea4
 *   if (target >= 0x4700000):                                ; use AVX fallback
 *       return RenderTile_AVX(tile)
 *
 *   height = tile->height (i32 @+0xc - +0x4)
 *   if (height <= 0):   return 0                             ; empty tile
 *   width  = tile->width  (i32 @+0x8 - +0x0)
 *   if (width <= 0):    return 0                             ; empty tile
 *
 *   dst          = tile->outPtr    (@+0x10)
 *   srcA         = tile->in0Ptr    (@+0x50)
 *   srcB         = tile->in1Ptr    (@+0x60)
 *   dstRowStride = tile->outRowBytes (i32 @+0x18)
 *   in0RowStride = tile->in0RowBytes (i32 @+0x58)
 *   in1RowStride = tile->in1RowBytes (i32 @+0x68)
 *
 *   scratchWhite = *(this->scratch)   (16-byte load = { 1.0f, 1.0f, 1.0f, 1.0f })
 *
 *   for row in 0..height:
 *     for i in 0..width:                                     ; step of 4 pixels in SSE
 *       // Pack one 16-byte-wide vector of pixels ("column of 4" for RGBA is
 *       // actually just ONE RGBA pixel in this shader; the "width * 16" loop
 *       // bound and 0x10-byte stride reveal each pixel is one 128-bit vector,
 *       // i.e. the tile is laid out as {R,G,B,A}[width][height] in f32).
 *       xmm0 = *(srcA + i*16)                                ; RGBA source-A pixel
 *       xmm1 = scratchWhite                                  ; { 1, 1, 1, 1 }
 *       xmm2 = xmm1 - xmm0                                   ; 1 - A
 *       xmm2 = xmm2 * *(srcB + i*16)                         ; B * (1 - A)
 *       xmm2 = xmm2 + xmm0                                   ; A + B*(1 - A)
 *       xmm2 = xmm2.wwww                                     ; broadcast alpha lane
 *       xmm2 = min(xmm1, xmm2)                               ; clamp to white
 *       *(dst + i*16) = xmm2
 *     srcA += in0RowStride ; srcB += in1RowStride ; dst += dstRowStride
 *
 *   return 0
 *
 * SEMANTICS (matches the Metal shader in HGCADD_METAL_FRAGMENT_SHADER):
 *   `out.rgba = min(1, alpha_A + alpha_B * (1 - alpha_A))` broadcast to all
 *   four lanes.  This is the "Porter-Duff Over" alpha-only combinator.
 *
 * The port here is a scalar TS transcription that operates on Float32Array
 * views into the caller's tile buffers.  It reproduces the exact arithmetic
 * (including the alpha-lane broadcast and the min-clamp) and returns 0 on
 * success — matching the disasm's `xorl %eax, %eax ; ... retq`.
 */
export function HgcAddAlpha_RenderTile(
  self: HgcAddAlphaState,
  tile: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    dstPtr: Float32Array;
    dstOffset: number;
    dstRowStride: number; // in f32 elements, not bytes
    in0Ptr: Float32Array;
    in0Offset: number;
    in0RowStride: number;
    in1Ptr: Float32Array;
    in1Offset: number;
    in1RowStride: number;
    renderTarget: number; // == tile->Renderer()->GetTarget(0); caller-resolved
  },
): number {
  // @Flexo 0x14547a3..0x14547b7: if target >= 0x4700000: tail-call RenderTile_AVX.
  if ((tile.renderTarget >>> 0) >= 0x4700000) {
    return HgcAddAlpha_RenderTile_AVX(self, tile);
  }

  // @Flexo 0x14547c9..0x14547e1: height & width bounds; empty tile → return 0.
  const height = tile.y1 - tile.y0; // @0x14547c9 (i32 @+0xc - i32 @+0x4)
  if (height <= 0) return 0;
  const width = tile.x1 - tile.x0; // @0x14547d7 (i32 @+0x8 - i32 @+0x0)
  if (width <= 0) return 0;

  // The scratch buffer holds { 1.0f, 1.0f, 1.0f, 1.0f } as pre-filled by the
  // ctor @0x1454994.  @Flexo 0x1454835 movq 0x198(%rbx), %r15 then movaps (%r15).
  const scratch = self.scratch;
  if (scratch === null) {
    throw new Error(
      "HgcAddAlpha::RenderTile @Flexo 0x1454790: this.scratch (0x198) is null " +
        "— ctor @0x1454950 always installs it via operator new[]; only D2 clears it",
    );
  }
  const white0 = Math.fround(scratch[0]);
  const white1 = Math.fround(scratch[1]);
  const white2 = Math.fround(scratch[2]);
  const white3 = Math.fround(scratch[3]);

  // @Flexo 0x1454820..0x1454872: doubly-nested loop over (row, pixel).
  let dstRowBase = tile.dstOffset;
  let in0RowBase = tile.in0Offset;
  let in1RowBase = tile.in1Offset;
  for (let row = 0; row < height; row += 1) {
    let dstPix = dstRowBase;
    let in0Pix = in0RowBase;
    let in1Pix = in1RowBase;
    for (let i = 0; i < width; i += 1) {
      // xmm0 = *(srcA + i*16) — one RGBA pixel from input 0.
      const a0 = Math.fround(tile.in0Ptr[in0Pix + 0]);
      const a1 = Math.fround(tile.in0Ptr[in0Pix + 1]);
      const a2 = Math.fround(tile.in0Ptr[in0Pix + 2]);
      const a3 = Math.fround(tile.in0Ptr[in0Pix + 3]);
      // xmm1 = scratchWhite = { 1, 1, 1, 1 }  (loaded above)
      // xmm2 = xmm1 - xmm0
      const oneMinus0 = Math.fround(white0 - a0);
      const oneMinus1 = Math.fround(white1 - a1);
      const oneMinus2 = Math.fround(white2 - a2);
      const oneMinus3 = Math.fround(white3 - a3);
      // xmm2 *= *(srcB + i*16)
      const b0 = Math.fround(tile.in1Ptr[in1Pix + 0]);
      const b1 = Math.fround(tile.in1Ptr[in1Pix + 1]);
      const b2 = Math.fround(tile.in1Ptr[in1Pix + 2]);
      const b3 = Math.fround(tile.in1Ptr[in1Pix + 3]);
      const prod0 = Math.fround(oneMinus0 * b0);
      const prod1 = Math.fround(oneMinus1 * b1);
      const prod2 = Math.fround(oneMinus2 * b2);
      const prod3 = Math.fround(oneMinus3 * b3);
      // xmm2 += xmm0
      // (only the .w lane is subsequently used, but the SSE math computes all
      //  four; we do the same faithfully.)
      // const sum0 = Math.fround(prod0 + a0);
      // const sum1 = Math.fround(prod1 + a1);
      // const sum2 = Math.fround(prod2 + a2);
      const sum3 = Math.fround(prod3 + a3);
      // xmm2 = xmm2.wwww  — broadcast the alpha lane to all four.
      // xmm2 = min(xmm1, xmm2) — clamp each lane to the corresponding white.
      // Both operations preserve the .wwww broadcast (min of identical lanes).
      const clamped = Math.fround(Math.min(white3, sum3));
      // *(dst + i*16) = xmm2  — write all four lanes with the same value.
      tile.dstPtr[dstPix + 0] = clamped;
      tile.dstPtr[dstPix + 1] = clamped;
      tile.dstPtr[dstPix + 2] = clamped;
      tile.dstPtr[dstPix + 3] = clamped;
      // Advance one 16-byte pixel = 4 f32 elements.
      dstPix += 4;
      in0Pix += 4;
      in1Pix += 4;
    }
    dstRowBase += tile.dstRowStride;
    in0RowBase += tile.in0RowStride;
    in1RowBase += tile.in1RowStride;
  }

  // @Flexo 0x1454874: xorl eax, eax ; ... ; retq
  return 0;
}

/**
 * `HgcAddAlpha::RenderTile_AVX(HGTile*)` @Flexo 0x1454550.
 *
 * The 6-lane AVX widening of RenderTile above.  Same alpha-over math, wider
 * SIMD.  Not yet transcribed — the exact register-tiling schedule (unrolled
 * 4-pixel-at-a-time YMM loop with head/tail scalar tails) is 145 lines and
 * requires careful head/tail-loop reconciliation.  Kept as a throwing stub
 * so a caller who lands here (i.e. renderer target-kind >= 0x4700000) sees
 * the exact address to decode next.
 */
export function HgcAddAlpha_RenderTile_AVX(
  _self: HgcAddAlphaState,
  _tile: unknown,
): number {
  throw new Error(
    "HgcAddAlpha::RenderTile_AVX @Flexo 0x1454550 not yet transcribed " +
      "(145-line 4x-YMM-unrolled AVX variant of the alpha-over math; " +
      "same semantics as RenderTile above)",
  );
}

/**
 * `HgcAddAlpha::SetParameter(int, float, float, float, float)` @Flexo 0x1454ac0.
 *
 * Verbatim:  `movl $0xFFFFFFFF, %eax ; retq`  — always returns -1.
 * This node has NO parameters (the shader is pure alpha-only, no uniforms
 * besides the constant hg_Params buffer which InitProgramDescriptor sets up).
 */
export function HgcAddAlpha_SetParameter(
  _self: HgcAddAlphaState,
  _idx: number,
  _a: number,
  _b: number,
  _c: number,
  _d: number,
): number {
  // @Flexo 0x1454ac4: movl $0xFFFFFFFF, %eax
  return -1;
}

/**
 * `HgcAddAlpha::GetParameter(int, float*)` @Flexo 0x1454ad0.
 *
 * Verbatim:  `movl $0xFFFFFFFF, %eax ; retq`  — always returns -1.
 * See SetParameter above for rationale.
 */
export function HgcAddAlpha_GetParameter(
  _self: HgcAddAlphaState,
  _idx: number,
  _out: unknown,
): number {
  // @Flexo 0x1454ad4: movl $0xFFFFFFFF, %eax
  return -1;
}

/**
 * `HgcAddAlpha::GetOutput(HGRenderer*)` @Flexo 0x1454ae0.
 *
 * Verbatim:  `movq %rdi, %rax ; retq`  — returns `this`.  The node is its
 * own output (a common pattern for pure-shader Hgc* nodes; the renderer
 * treats the node itself as the "output handle" and dispatches BindTexture
 * to it directly).
 */
export function HgcAddAlpha_GetOutput(self: HgcAddAlphaState): HgcAddAlphaState {
  // @Flexo 0x1454ae4: movq %rdi, %rax  ; return this.
  return self;
}

// ─── Frontier stubs — HGNode ctor/dtor (@Flexo stubs, not yet ported) ──────

/**
 * `HGNode::HGNode()` (C2) — @Flexo 0x1496c06 (stub → cross-framework symbol).
 * The base HGNode constructor is not yet transcribed for the Flexo variant;
 * we return an opaque placeholder token so the caller ctor can proceed
 * without perturbing observable data (RenderTile only reads this.scratch).
 */
function HGNode_C2_stub(): unknown {
  return { _placeholder: "HGNode base subobject @Flexo 0x1496c06 not yet transcribed" };
}

/**
 * `HGNode::~HGNode()` (D2) — @Flexo 0x1496c0c (stub).  Similarly opaque; the
 * TS port relies on GC for the actual teardown after HgcAddAlpha_D2 nulls
 * the scratch fields.
 */
function HGNode_D2_stub(_base: unknown): void {
  /* no-op — @Flexo 0x1496c0c is not yet transcribed but the alpha-only math
     path never reads it back after ctor. */
}
