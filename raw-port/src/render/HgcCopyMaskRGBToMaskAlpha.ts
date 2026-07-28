// HgcCopyMaskRGBToMaskAlpha.ts — FCP Ozone framework class.
//
// Faithful transcription of the x86_64 disassembly of Ozone in
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
// See raw-port/re/disasm/HgcCopyMaskRGBToMaskAlpha.*.s .
//
// SYMBOLS (from nm | c++filt on the Ozone binary):
//   0x6a1f40  T HgcCopyMaskRGBToMaskAlpha::Setup(void*)
//   0x6a2030  T HgcCopyMaskRGBToMaskAlpha::GetProgram(HGRenderer*)
//   0x6a2080  T HgcCopyMaskRGBToMaskAlpha::InitProgramDescriptor(HGProgramDescriptor*) const
//   0x6a2260  T HgcCopyMaskRGBToMaskAlpha::shaderDescription() const
//   0x6a2290  T HgcCopyMaskRGBToMaskAlpha::BindTexture(HGHandler*, int)
//   0x6a2320  T HgcCopyMaskRGBToMaskAlpha::Bind(HGHandler*)
//   0x6a2350  T HgcCopyMaskRGBToMaskAlpha::RenderTile_AVX(HGTile*)
//   0x6a2920  T HgcCopyMaskRGBToMaskAlpha::RenderTile(HGTile*)
//   0x6a2af0  T HgcCopyMaskRGBToMaskAlpha::GetDOD(HGRenderer*, int, HGRect)
//   0x6a2b50  T HgcCopyMaskRGBToMaskAlpha::GetROI(HGRenderer*, int, HGRect)
//   0x6a2bb0  T HgcCopyMaskRGBToMaskAlpha::HgcCopyMaskRGBToMaskAlpha()                (C2)
//   0x6a2cb0  T HgcCopyMaskRGBToMaskAlpha::HgcCopyMaskRGBToMaskAlpha()                (C1)
//   0x6a2cd0  T HgcCopyMaskRGBToMaskAlpha::~HgcCopyMaskRGBToMaskAlpha()               (D2)
//   0x6a2d20  T HgcCopyMaskRGBToMaskAlpha::~HgcCopyMaskRGBToMaskAlpha()               (D1)
//   0x6a2d40  T HgcCopyMaskRGBToMaskAlpha::~HgcCopyMaskRGBToMaskAlpha()               (D0)
//   0x6a2d70  T HgcCopyMaskRGBToMaskAlpha::SetParameter(int, float, float, float, float)
//   0x6a2da0  T HgcCopyMaskRGBToMaskAlpha::GetParameter(int, float*)
//   0x6a2dc0  T HgcCopyMaskRGBToMaskAlpha::GetOutput(HGRenderer*)
//
// CLASS HIERARCHY: extends HGColorMatrix.
//   - C2 @0x6a2bc4 calls HGColorMatrix::HGColorMatrix() (stub 0x6dd7be).
//   - D2 @0x6a2d10 calls HGColorMatrix::~HGColorMatrix() (stub 0x6dd7c4).
//   - GetOutput @0x6a2e4b tail-calls HGColorMatrix::GetOutput(HGRenderer*) (stub 0x6dd7b2).
//
// Vtable installed by ctor C2 @0x6a2bcd (leaq 0x1e82dc(%rip)); RIP-after = 0x6a2bd4;
//   target = 0x6a2bd4 + 0x1e82dc = 0x88aeb0 — the vtable-for-HgcCopyMaskRGBToMaskAlpha.
// Reset by D2 @0x6a2ce4 as `leaq __ZTV25HgcCopyMaskRGBToMaskAlpha(%rip), %rcx; addq $0x10, %rcx`
//   — i.e. `vtable + 0x10` (skipping the top-of-vtable typeinfo/offset-to-top pair).
//
// FIELD LAYOUT (extends HGColorMatrix; HGColorMatrix base +0x00..+0x1af is opaque here):
//   +0x00  vtable pointer                             — installed by C2 @0x6a2bd4; reset by D2 @0x6a2cef
//   +0x10  int flags                                  — modified by C2 @0x6a2c0b..0x6a2c20:
//               flags |= 0x400                        — @0x6a2c0e: orl $0x400, %ecx
//               flags &= ~0x200                       — @0x6a2c1a: andl $0xfffffdff, %ecx
//               (net: set bit 10, clear bit 9)
//   +0x1b0 float4 row0                                — 4-row output color-matrix (see GetOutput/Setup)
//   +0x1c0 float4 row1                                — populated by GetOutput @0x6a2dfc..0x6a2e32
//   +0x1d0 float4 row2                                   from state->[+0x00..+0x60]
//   +0x1e0 float4 row3
//   +0x1f0 State*  state                              — allocated in C2 @0x6a2c04 via
//               HgcCombineFields::State::operator new(0x100)
//               and initialized by HgcCopyMaskRGBToMaskAlpha::State::State() @stub 0x6a2bf5.
//               Freed by D2 @0x6a2d07 via HgcCopyMaskRGBToMaskAlpha::State::operator delete.
//   +0x1f8 int  dirty                                 — set to 1 by C2 @0x6a2bd7; read by GetOutput
//               @0x6a2dd8 (if != 0: call Setup then clear @0x6a2e39).
//
// State LAYOUT (256 bytes = 0x100, per operator new(0x100) @0x6a2be1):
//   +0x00..+0x7f  8 x float4 output-row buffer          — written by Setup @0x6a1fd0..0x6a2028
//                                                        (each of 4 rows written to two consecutive
//                                                         float4 slots — likely AVX 256-bit twin-copy)
//   +0x80..+0xdf  input color-matrix rows              — read by Setup @0x6a1f57/0x6a1f69/0x6a1f7b
//   +0xe0..+0xff  opaque tail                          — untouched by decoded methods
//
// PROGRAM SHAPE
//   HgcCopyMaskRGBToMaskAlpha reads a texture and packs its RGB into ALL FOUR output channels:
//     r0.xyz = tex0.xyz
//     output.color0 = r0.xyzx     (i.e. lanes = [r, g, b, r])
//   The Metal shader source is transcribed verbatim as HgcCopyMaskRGBToMaskAlpha_METAL_SHADER_SOURCE.
//   RenderTile (SSE) and RenderTile_AVX (AVX) both implement the same lane shuffle with
//     `shufps $0x24` / `vpermilps $0x24` -> `xmm[0,1,2,0]`
//   which is bit-identical to the shader's `r0.xyzx`.
//
// FRONTIER CALLEES (throw-stubbed for calls that require external symbols):
//   HGColorMatrix::HGColorMatrix()                  @Ozone (stub 0x6dd7be)
//   HGColorMatrix::~HGColorMatrix()                 @Ozone (stub 0x6dd7c4)
//   HGColorMatrix::GetOutput(HGRenderer*)           @Ozone (stub 0x6dd7b2)
//   HgcCombineFields::State::operator new(size_t)   @Ozone (called @0x6a2be6 by C2)
//   HgcCopyMaskRGBToMaskAlpha::State::State()       @Ozone (called @0x6a2bf5 by C2; sibling class)
//   HgcCopyMaskRGBToMaskAlpha::State::operator delete(void*)  @Ozone (called @0x6a2c47/0x6a2d07)
//   HGObject::operator delete(void*)                @Ozone (stub 0x6def6a, called by D0 @0x6a2d5d)
//   HGRenderer::GetTarget(unsigned int)             @Ozone (stub 0x6dd380)
//   HGTile::Renderer() const                        @Ozone (stub 0x6df882)
//   HGRect::w() const                               @Ozone (called @0x6a2979/0x6a2377)
//   HGTile::Height() const                          @Ozone (called @0x6a2985/0x6a238b)
//   HGHandler::SetFilter(int)                       @Ozone (called @0x6a22c1)
//   HGHandler::TexCoord(int,int,int,double const*)  @Ozone (stub 0x6df21c)
//   HGHandler::GetRenderer() const                  @Ozone (called @0x6a22de)
//   HGProgramDescriptor::SetVisibleShaderWithSource / SetFragmentFunctionName /
//     SetReturnBinding / SetArgumentBindings        @Ozone (stubs 0x6de520/0x6de51a/
//                                                            0x6de50e/0x6de514)
//   GetHgcCopyMaskRGBToMaskAlphaVisibleProgram()    @Ozone (translation-unit-local, @0x6a209e)
//   HGBinding::HGBinding / ~HGBinding               @Ozone
//   std::vector<HGBinding>::{vector,push_back,~vector} @Ozone
//   __Unwind_Resume                                 @Ozone (stub 0x6dd07a)

import type { HGRect } from "./HGRect.js";
import { HGRectNull } from "./HGRect.js";

/**
 * Vtable-installed pointer address for HgcCopyMaskRGBToMaskAlpha.
 * From ctor C2 @Ozone 0x6a2bcd (`leaq 0x1e82dc(%rip), %rcx`); RIP-after = 0x6a2bd4;
 *   target = 0x6a2bd4 + 0x1e82dc = 0x88aeb0.
 * D2 @Ozone 0x6a2ce4 reloads the same vtable symbol + 0x10 (skip top-of-vtable pair).
 */
export const HgcCopyMaskRGBToMaskAlpha_VTABLE_INSTALLED_PTR = 0x88aeb0 as const;

/**
 * The HgcCopyMaskRGBToMaskAlpha instance state.
 * HGColorMatrix base subobject is opaque here (see raw-port/src/render/HGColorMatrix.ts if/when
 *   that class is ported).
 */
export interface HgcCopyMaskRGBToMaskAlphaState {
  /** HGColorMatrix base placeholder (+0x00..+0x1af). */
  _hgColorMatrix: unknown;
  /** +0x10 int flags — RMW at ctor C2 @0x6a2c0b..0x6a2c20: set bit 10 (|= 0x400), clear bit 9 (&= ~0x200). */
  _nodeFlags10: number;
  /**
   * +0x1b0..+0x1ef  4 x float4 output color-matrix rows.
   * Written by GetOutput @0x6a2dfc..0x6a2e32 from state->[+0x00..+0x60] whenever `dirty` is nonzero.
   * Modeled as a single 16-float Float32Array (row `i` at offset `i*4`).
   */
  colorMatrix: Float32Array;
  /**
   * +0x1f0  State* state — HgcCombineFields::State* allocated at 0x100 bytes (@0x6a2be1 in C2).
   * Modeled as a Float32Array view of 0x100 bytes = 64 float32 slots.
   * Nullable so the D2 branch @0x6a2cfd (`if (state != 0) State::operator delete(state)`) is faithful.
   */
  state: Float32Array | null;
  /** +0x1f8 int dirty — set to 1 in C2 @0x6a2bd7; cleared by GetOutput @0x6a2e39 after Setup. */
  dirty: number;
}

/** Fresh, zeroed State (used by C2 to model the allocation @0x6a2be1). */
function HgcCopyMaskRGBToMaskAlpha_newState(): Float32Array {
  // C2 @0x6a2be1 allocates 0x100 bytes = 64 float32 slots.
  return new Float32Array(0x100 / 4);
}

/**
 * `HgcCopyMaskRGBToMaskAlpha::HgcCopyMaskRGBToMaskAlpha()` @Ozone 0x6a2bb0 (C2) / 0x6a2cb0 (C1).
 *
 * C1 @0x6a2cb0 is a thin trampoline: calls C2 directly (@0x6a2cc0).
 *
 * Verbatim C2 disasm (main path):
 *   0x6a2bb0  pushq %rbp; movq %rsp,%rbp; subq $0x30,%rsp
 *   0x6a2bc4  callq HGColorMatrix::HGColorMatrix()                            ## base ctor
 *   0x6a2bcd  leaq  0x1e82dc(%rip), %rcx                                      ## rcx = vtable @0x88aeb0
 *   0x6a2bd4  movq  %rcx, (%rax)                                              ## *this = vtable
 *   0x6a2bd7  movl  $0x1, 0x1f8(%rax)                                         ## dirty = 1
 *   0x6a2be1  movl  $0x100, %edi
 *   0x6a2be6  callq HgcCombineFields::State::operator new(unsigned long)      ## rax = new(0x100)
 *   0x6a2bf5  callq HgcCopyMaskRGBToMaskAlpha::State::State()                 ## placement-new
 *   0x6a2c04  movq  %rcx, 0x1f0(%rax)                                         ## this->state = raw
 *   0x6a2c0b..0x6a2c14  eax = this->+0x10 | 0x400;  this->+0x10 = eax         ## set bit 10
 *   0x6a2c17..0x6a2c20  eax = this->+0x10 & ~0x200; this->+0x10 = eax         ## clear bit 9
 *   0x6a2c23  addq  $0x30, %rsp; popq %rbp; retq
 *
 * The unwind block @0x6a2c29..0x6a2c59 rolls back the State allocation and the base ctor on
 * exception; it is not observable in the happy path modeled here.
 */
export function HgcCopyMaskRGBToMaskAlpha_construct(
  self: HgcCopyMaskRGBToMaskAlphaState,
): void {
  // @Ozone 0x6a2bc4: HGColorMatrix::HGColorMatrix() — opaque base ctor.
  HGColorMatrix_HGColorMatrix_stub();
  // @Ozone 0x6a2bd4: vtable install (no-op in our model — we don't store the vtable ptr as a field).
  // @Ozone 0x6a2bd7: dirty = 1.
  self.dirty = 1;
  // @Ozone 0x6a2be6..0x6a2bf5: allocate + construct State (256 bytes, zeroed by placement-new).
  self.state = HgcCopyMaskRGBToMaskAlpha_newState();
  // @Ozone 0x6a2c0b..0x6a2c20: flags |= 0x400 (set bit 10) then flags &= ~0x200 (clear bit 9).
  self._nodeFlags10 = ((self._nodeFlags10 | 0x400) & ~0x200) >>> 0;
}

/**
 * `HgcCopyMaskRGBToMaskAlpha::~HgcCopyMaskRGBToMaskAlpha()` @Ozone 0x6a2cd0 (D2) / 0x6a2d20 (D1).
 *
 * D1 @0x6a2d20 is a thin trampoline that calls D2 @0x6a2d30.
 *
 * Verbatim D2 disasm:
 *   0x6a2cd0  pushq %rbp; movq %rsp,%rbp; subq $0x20,%rsp
 *   0x6a2ce4  leaq  __ZTV25HgcCopyMaskRGBToMaskAlpha(%rip), %rcx; addq $0x10,%rcx  ## rcx = vtable+16
 *   0x6a2cef  movq  %rcx, (%rax)                                                    ## *this = vtable+16
 *   0x6a2cf2  movq  0x1f0(%rax), %rax                                               ## rax = state
 *   0x6a2cfd  cmpq  $0x0, %rax
 *   0x6a2d01  je    0x6a2d0c                                                        ## if state == NULL: skip
 *   0x6a2d07  callq HgcCopyMaskRGBToMaskAlpha::State::operator delete(void*)
 *   0x6a2d0c  movq  -0x18(%rbp), %rdi                                               ## rdi = this
 *   0x6a2d10  callq HGColorMatrix::~HGColorMatrix()
 *   0x6a2d15  addq  $0x20, %rsp; popq %rbp; retq
 */
export function HgcCopyMaskRGBToMaskAlpha_destruct(
  self: HgcCopyMaskRGBToMaskAlphaState,
): void {
  // @Ozone 0x6a2cef: reset vtable ptr to (vtable + 0x10). No-op in our model.
  // @Ozone 0x6a2cfd..0x6a2d07: free the State if allocated.
  self.state = null;
  // @Ozone 0x6a2d10: HGColorMatrix::~HGColorMatrix().
  HGColorMatrix_dtor_stub();
}

/**
 * `HgcCopyMaskRGBToMaskAlpha::~HgcCopyMaskRGBToMaskAlpha()` @Ozone 0x6a2d40 — the deleting dtor (D0).
 *
 * Verbatim disasm:
 *   0x6a2d40  pushq %rbp; movq %rsp,%rbp; subq $0x10,%rsp
 *   0x6a2d54  callq HgcCopyMaskRGBToMaskAlpha::~HgcCopyMaskRGBToMaskAlpha()  ## D1
 *   0x6a2d5d  callq HGObject::operator delete(void*)                        ## stub 0x6def6a
 *   0x6a2d62  addq  $0x10, %rsp; popq %rbp; retq
 */
export function HgcCopyMaskRGBToMaskAlpha_deletingDtor(
  self: HgcCopyMaskRGBToMaskAlphaState,
): void {
  HgcCopyMaskRGBToMaskAlpha_destruct(self);
  // @Ozone 0x6a2d5d: HGObject::operator delete(this).
  HGObject_operator_delete_stub();
}

/**
 * `HgcCopyMaskRGBToMaskAlpha::SetParameter(int, float, float, float, float)` @Ozone 0x6a2d70.
 *
 * Verbatim disasm — 4 real instructions after the prologue: everything is stored on the stack
 * (never re-read); the function returns -1 unconditionally. The class has NO tunable parameters.
 *
 *   0x6a2d70  pushq %rbp; movq %rsp,%rbp
 *   0x6a2d74..0x6a2d8a  spill rdi,esi,xmm0..xmm3 to stack (dead stores)
 *   0x6a2d8f  movl  $0xffffffff, %eax                                        ## return -1
 *   0x6a2d94  popq  %rbp; retq
 */
export function HgcCopyMaskRGBToMaskAlpha_SetParameter(
  _self: HgcCopyMaskRGBToMaskAlphaState,
  _paramID: number,
  _v0: number,
  _v1: number,
  _v2: number,
  _v3: number,
): number {
  // @Ozone 0x6a2d8f: movl $0xffffffff, %eax
  return -1 | 0;
}

/**
 * `HgcCopyMaskRGBToMaskAlpha::GetParameter(int, float*)` @Ozone 0x6a2da0.
 *
 * Same body as SetParameter — dead stores + return -1.
 *   0x6a2da0  pushq %rbp; movq %rsp,%rbp
 *   0x6a2da4..0x6a2dab  spill rdi,esi,rdx (dead)
 *   0x6a2daf  movl  $0xffffffff, %eax
 *   0x6a2db4  popq  %rbp; retq
 */
export function HgcCopyMaskRGBToMaskAlpha_GetParameter(
  _self: HgcCopyMaskRGBToMaskAlphaState,
  _paramID: number,
  _out: unknown,
): number {
  // @Ozone 0x6a2daf: movl $0xffffffff, %eax
  return -1 | 0;
}

/**
 * `HgcCopyMaskRGBToMaskAlpha::shaderDescription() const` @Ozone 0x6a2260.
 *
 * Constructs a std::string by sret from a C-string literal:
 *   0x6a2277  leaq  0x156b94(%rip), %rsi     ## literal "HgcCopyMaskRGBToMaskAlpha [hgc1]"
 *   0x6a227e  callq std::basic_string<char>::basic_string(const char*)
 *   0x6a2287  return sret pointer (was rdi)
 *
 * The literal string is transcribed verbatim.
 */
export const HgcCopyMaskRGBToMaskAlpha_SHADER_DESCRIPTION =
  "HgcCopyMaskRGBToMaskAlpha [hgc1]" as const;

export function HgcCopyMaskRGBToMaskAlpha_shaderDescription(
  _self: HgcCopyMaskRGBToMaskAlphaState,
): string {
  // @Ozone 0x6a2277: literal loaded into std::string sret.
  return HgcCopyMaskRGBToMaskAlpha_SHADER_DESCRIPTION;
}

/**
 * `HgcCopyMaskRGBToMaskAlpha::GetProgram(HGRenderer*)` @Ozone 0x6a2030.
 *
 * Verbatim disasm:
 *   0x6a2030  pushq %rbp; movq %rsp,%rbp; subq $0x20,%rsp
 *   0x6a2044  movl  $0x60000, %esi
 *   0x6a2049  callq HGRenderer::GetTarget(0x60000)                    ## stub 0x6dd380
 *   0x6a2051  cmpl  $0x60b10, -0x1c(%rbp)
 *   0x6a2058  jne   0x6a2067                                          ## if target != 0x60b10: NULL
 *   0x6a205a  leaq  0x156b48(%rip), %rax                              ## rax = Metal shader ptr
 *   0x6a2061  movq  %rax, -0x8(%rbp)
 *   0x6a2065  jmp   0x6a206f
 *   0x6a2067  movq  $0x0, -0x8(%rbp)                                  ## else: NULL
 *   0x6a206f  movq  -0x8(%rbp), %rax; retq
 *
 * Semantics: returns the Metal fragment shader source ONLY when the renderer target is EXACTLY
 * 0x60b10. Any other target -> NULL.
 */
export const HgcCopyMaskRGBToMaskAlpha_METAL_TARGET_EQ = 0x60b10 as const;

/**
 * Metal fragment shader source (verbatim from the Ozone binary's literal pool).
 * Loaded via `leaq 0x156b48(%rip), %rax` @0x6a205a; RIP-after = 0x6a2061;
 *   literal absolute address = 0x6a2061 + 0x156b48 = 0x7f8ba9.
 * Reported length (per the `//LEN=` header) = 0x228 = 552 bytes.
 */
export const HgcCopyMaskRGBToMaskAlpha_METAL_SHADER_SOURCE: string =
  "//Metal1.0     \n" +
  "//LEN=0000000228\n" +
  "fragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n" +
  "    const constant float4* hg_Params [[ buffer(0) ]], \n" +
  "    texture2d< float > hg_Texture0 [[ texture(0) ]], \n" +
  "    sampler hg_Sampler0 [[ sampler(0) ]])\n" +
  "{\n" +
  "    float4 r0;\n" +
  "    FragmentOut output;\n" +
  "\n" +
  "    r0.xyz = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy).xyz;\n" +
  "    output.color0 = r0.xyzx;\n" +
  "    return output;\n" +
  "}\n" +
  "//MD5=60c2618d:6648efc9:fffa8e87:b7ed2f65\n" +
  "//SIG=00000000:00000001:00000001:00000000:0000:0000:0001:0000:0000:0000:0002:0000:0001:01:0:1:0\n";

export function HgcCopyMaskRGBToMaskAlpha_GetProgram(_renderer: unknown): string | null {
  // @Ozone 0x6a2049: renderer->GetTarget(0x60000) — undecoded stub 0x6dd380.
  throw new Error(
    "HgcCopyMaskRGBToMaskAlpha::GetProgram not yet transcribed @Ozone 0x6a2030 — depends on " +
      "undecoded HGRenderer::GetTarget(unsigned int) @Ozone stub 0x6dd380. The Metal shader " +
      "source is transcribed as HgcCopyMaskRGBToMaskAlpha_METAL_SHADER_SOURCE; the branch " +
      "condition is: target == 0x60b10 -> return source; else -> return NULL.",
  );
}

/**
 * `HgcCopyMaskRGBToMaskAlpha::InitProgramDescriptor(HGProgramDescriptor*) const` @Ozone 0x6a2080.
 *
 * Sets up the descriptor with:
 *   - visible-shader "HgcCopyMaskRGBToMaskAlpha_hgc_visible" (@0x6a20ad, string @0x6a20b4-preceding)
 *     whose source is returned by the TU-local GetHgcCopyMaskRGBToMaskAlphaVisibleProgram() @0x6a209e;
 *   - fragment function name "HgcCopyMaskRGBToMaskAlpha" (@0x6a20bd);
 *   - one HGReturnBinding: attr=4, name="FragmentOut" (@0x6a20dd, ctor @0x6a2100, arg r9d=1);
 *   - two HGBindings pushed onto a std::vector<HGBinding>:
 *       binding[0]: attr=2, name="float4", r8d=3, r9d=0  (@0x6a2154 ctor)
 *       binding[1]: attr=0xa, name="float4", r8d=0, r9d=1 (@0x6a21a1 ctor)
 *     — then SetArgumentBindings(vector) @0x6a21ce.
 *
 * Every effective call target here is an undecoded stub. We throw with all decoded facts cited.
 */
export function HgcCopyMaskRGBToMaskAlpha_InitProgramDescriptor(_desc: unknown): void {
  // @Ozone 0x6a2080
  throw new Error(
    "HgcCopyMaskRGBToMaskAlpha::InitProgramDescriptor not yet transcribed @Ozone 0x6a2080 — " +
      "depends on undecoded HGProgramDescriptor::SetVisibleShaderWithSource @Ozone stub 0x6de520, " +
      "::SetFragmentFunctionName @Ozone stub 0x6de51a, " +
      "::SetReturnBinding @Ozone stub 0x6de50e, " +
      "::SetArgumentBindings @Ozone stub 0x6de514, " +
      "HGBinding::HGBinding @Ozone 0x6a2100, and " +
      "GetHgcCopyMaskRGBToMaskAlphaVisibleProgram() @Ozone 0x6a209e (TU-local). " +
      "Decoded facts: visible-shader name='HgcCopyMaskRGBToMaskAlpha_hgc_visible' (@Ozone 0x6a20ad); " +
      "fragment function name='HgcCopyMaskRGBToMaskAlpha' (@Ozone 0x6a20bd); " +
      "return-binding attr=4 name='FragmentOut' (@Ozone 0x6a20dd, ctor @0x6a2100); " +
      "two arg-bindings both named 'float4' with (attr,r8,r9) = (2,3,0) (@Ozone 0x6a2154) and " +
      "(0xa,0,1) (@Ozone 0x6a21a1).",
  );
}

/**
 * `HgcCopyMaskRGBToMaskAlpha::Bind(HGHandler*)` @Ozone 0x6a2320.
 *
 * Verbatim disasm:
 *   0x6a2320  pushq %rbp; movq %rsp,%rbp; subq $0x10,%rsp
 *   0x6a2338  movq  (%rdi), %rax                    ## rax = handler->vtable
 *   0x6a233b  callq *0xc0(%rax)                     ## handler->vtable[*0xc0](handler)
 *   0x6a2341  xorl  %eax, %eax                      ## return 0
 *   0x6a2343  addq  $0x10, %rsp; popq %rbp; retq
 *
 * Calls HGHandler vtable slot *0xc0 with `this=handler`; slot semantics are undecoded.
 */
export function HgcCopyMaskRGBToMaskAlpha_Bind(_handler: unknown): number {
  // @Ozone 0x6a233b: handler->vtable[*0xc0](handler) — undecoded.
  throw new Error(
    "HgcCopyMaskRGBToMaskAlpha::Bind not yet transcribed @Ozone 0x6a2320 — depends on " +
      "undecoded HGHandler vtable slot *0xc0 @Ozone 0x6a233b.",
  );
}

/**
 * `HgcCopyMaskRGBToMaskAlpha::BindTexture(HGHandler*, int)` @Ozone 0x6a2290.
 *
 * Verbatim disasm summary:
 *   0x6a22a3  testl %edx, %edx
 *   0x6a22a8  jne   0x6a230f            ## texIdx != 0 -> return -1
 *   -- texIdx == 0 --
 *   0x6a22b8  handler->vtable[*0x48](handler, texIdx, 0)                    ## texIdx forwarded via esi
 *   0x6a22c1  HGHandler::SetFilter(handler, 0)                              ## direct call
 *   0x6a22d5  HGHandler::TexCoord(handler, 0, 0, 0, NULL)                   ## stub 0x6df21c
 *   0x6a22de  renderer = HGHandler::GetRenderer(handler)                    ## direct call
 *   0x6a22ee  callq *0x80(renderer->vtable)(renderer, 0x2e)                 ## esi=0x2e
 *   0x6a22f4..0x6a22f7  if (eax != 0): skip the following                   ## on failure: fallthrough
 *   0x6a2300  callq *0xa8(handler->vtable)(handler)                         ## the "clear filter" hook
 *   0x6a2306  ret = 0
 *   0x6a230f  ret = -1     (texIdx != 0 branch)
 *
 * Every branch that does real work calls HGHandler vtable slots with undecoded semantics.
 */
export function HgcCopyMaskRGBToMaskAlpha_BindTexture(
  _self: HgcCopyMaskRGBToMaskAlphaState,
  _handler: unknown,
  _texIdx: number,
): number {
  // @Ozone 0x6a2290
  throw new Error(
    "HgcCopyMaskRGBToMaskAlpha::BindTexture not yet transcribed @Ozone 0x6a2290 — " +
      "depends on undecoded HGHandler vtable slots *0x48 @Ozone 0x6a22b8, *0xa8 @Ozone 0x6a2300, " +
      "HGHandler::SetFilter @Ozone 0x6a22c1, HGHandler::TexCoord @Ozone stub 0x6df21c, " +
      "HGHandler::GetRenderer @Ozone 0x6a22de, and HGRenderer vtable *0x80 @Ozone 0x6a22ee. " +
      "Decoded facts: texIdx != 0 -> return -1 (@Ozone 0x6a22a8); texIdx == 0 forwards to the " +
      "handler vtable path and returns 0 unless the *0x80 hook returns 0 (in which case it also " +
      "invokes *0xa8 @Ozone 0x6a2300 before returning 0).",
  );
}

/**
 * `HgcCopyMaskRGBToMaskAlpha::GetDOD(HGRenderer*, int outputIdx, HGRect inputDOD)` @Ozone 0x6a2af0.
 *
 * Verbatim disasm:
 *   0x6a2af0  pushq %rbp; movq %rsp,%rbp
 *   0x6a2af4..0x6a2b04  spill args: inputDOD.lo@-0x20, inputDOD.hi@-0x18, this@-0x28, renderer@-0x30,
 *                                    outputIdx@-0x34
 *   0x6a2b07  movl  -0x34(%rbp), %eax               ## eax = outputIdx
 *   0x6a2b0a  testl %eax, %eax
 *   0x6a2b0c  jne   0x6a2b22                        ## outputIdx != 0 -> HGRectNull
 *   -- outputIdx == 0 --
 *   0x6a2b10..0x6a2b1c  return inputDOD             ## copy inputDOD.lo/hi into ret slot
 *   -- outputIdx != 0 --
 *   0x6a2b22..0x6a2b34  return HGRectNull           ## load from _HGRectNull
 *
 * Note: `testl/jne` — outputIdx == 0 is the ONLY passing case (compare HgcMultiplyAlpha which uses
 * `cmpl $2/jb` allowing indices 0 AND 1). HgcCopyMaskRGBToMaskAlpha has a single output slot.
 */
export function HgcCopyMaskRGBToMaskAlpha_GetDOD(
  _renderer: unknown,
  outputIdx: number,
  inputDOD: HGRect,
): HGRect {
  // @Ozone 0x6a2b0a..0x6a2b0c
  if (outputIdx === 0) {
    return { x: inputDOD.x, y: inputDOD.y, right: inputDOD.right, bottom: inputDOD.bottom };
  }
  // @Ozone 0x6a2b22..0x6a2b34
  return { x: HGRectNull.x, y: HGRectNull.y, right: HGRectNull.right, bottom: HGRectNull.bottom };
}

/**
 * `HgcCopyMaskRGBToMaskAlpha::GetROI(HGRenderer*, int inputIdx, HGRect outputROI)` @Ozone 0x6a2b50.
 *
 * Byte-for-byte identical structure to GetDOD (different addresses, same semantics):
 *   0x6a2b67  movl  -0x34(%rbp), %eax
 *   0x6a2b6a  testl %eax, %eax
 *   0x6a2b6c  jne   0x6a2b82                        ## inputIdx != 0 -> HGRectNull
 *   0x6a2b70..0x6a2b7c  return outputROI
 *   0x6a2b82..0x6a2b94  return HGRectNull
 */
export function HgcCopyMaskRGBToMaskAlpha_GetROI(
  _renderer: unknown,
  inputIdx: number,
  outputROI: HGRect,
): HGRect {
  // @Ozone 0x6a2b6a..0x6a2b6c
  if (inputIdx === 0) {
    return { x: outputROI.x, y: outputROI.y, right: outputROI.right, bottom: outputROI.bottom };
  }
  // @Ozone 0x6a2b82..0x6a2b94
  return { x: HGRectNull.x, y: HGRectNull.y, right: HGRectNull.right, bottom: HGRectNull.bottom };
}

/**
 * `HgcCopyMaskRGBToMaskAlpha::Setup(void*)` @Ozone 0x6a1f40.
 *
 * Rebuilds the 8-row (twin-copy) output matrix table inside `state[+0x00..+0x7f]` from the 3
 * input-matrix rows at `state[+0x80..+0xdf]`, applying the same lane shuffle as the shader:
 * `[0,1,2,0]` (i.e. `r0.xyzx` — R broadcast into the alpha lane, RGB unchanged).
 *
 * Verbatim disasm walk (all reads/writes indirect via `rcx = this->+0x1f0`, `rax = this`):
 *   loadMatrixRows (@0x6a1f57..0x6a1f82):
 *     rowA = state[+0x80]                        ## 4 x float32 = row 0
 *     rowB = state[+0xa0]                        ## row 1
 *     rowC = state[+0xc0]                        ## row 2
 *     rowD = 0                                   ## row 3 = zero (xorps @0x6a1f86, mov @0x6a1f89)
 *   shuffle each (@0x6a1f95..0x6a1fc1):
 *     shufps $0x24  ->  lanes = [src0, src1, src2, src0]
 *     rowA' = rowA[0,1,2,0]
 *     rowB' = rowB[0,1,2,0]
 *     rowC' = rowC[0,1,2,0]
 *     rowD' = [0,0,0,0]
 *   twin-store back into state[+0x00..+0x7f] — each shuffled row written to TWO consecutive
 *   float4 slots (AVX-256 twin-lane pattern):
 *     @0x6a1fd0  state[+0x10] = rowA'            ## (note: high half first, then low)
 *     @0x6a1fdb  state[+0x00] = rowA'
 *     @0x6a1fe9  state[+0x30] = rowB'
 *     @0x6a1ff4  state[+0x20] = rowB'
 *     @0x6a2003  state[+0x50] = rowC'
 *     @0x6a200e  state[+0x40] = rowC'
 *     @0x6a201d  state[+0x70] = rowD'
 *     @0x6a2028  state[+0x60] = rowD'
 *   return 0 (@0x6a202c: xorl %eax, %eax)
 *
 * The `_scratch` parameter (rsi) is spilled to the stack and never read.
 */
export function HgcCopyMaskRGBToMaskAlpha_Setup(
  self: HgcCopyMaskRGBToMaskAlphaState,
  _scratch: unknown,
): number {
  // @Ozone 0x6a1f4c: rax = this; rcx = this->+0x1f0 (state).
  const state = self.state;
  if (state === null) {
    // The disasm dereferences state unconditionally — real FCP crashes here if state is NULL.
    // We surface the invariant explicitly so a bad caller trips loudly rather than silently 0-ing.
    throw new Error(
      "HgcCopyMaskRGBToMaskAlpha::Setup @Ozone 0x6a1f50 dereferences this->state; state is null.",
    );
  }
  // Read rows @Ozone 0x6a1f57 / 0x6a1f69 / 0x6a1f7b (state+0x80 / +0xa0 / +0xc0). Float32Array
  // indices are in float32 slots: +0x80 bytes = index 0x20 = 32; +0xa0 bytes = 40; +0xc0 bytes = 48.
  const iA = 0x80 >> 2; // 32
  const iB = 0xa0 >> 2; // 40
  const iC = 0xc0 >> 2; // 48
  const a0 = Math.fround(state[iA + 0]);
  const a1 = Math.fround(state[iA + 1]);
  const a2 = Math.fround(state[iA + 2]);
  // a3 loaded but overwritten by shufps ([0,1,2,0] takes src[0])
  const b0 = Math.fround(state[iB + 0]);
  const b1 = Math.fround(state[iB + 1]);
  const b2 = Math.fround(state[iB + 2]);
  const c0 = Math.fround(state[iC + 0]);
  const c1 = Math.fround(state[iC + 1]);
  const c2 = Math.fround(state[iC + 2]);
  // Row 3 is zeroed at @Ozone 0x6a1f86..0x6a1f8d before being shuffled -> still all zero.
  // shufps $0x24 = [0,1,2,0]. Each shuffled row = [src0, src1, src2, src0].
  const A = [a0, a1, a2, a0];
  const B = [b0, b1, b2, b0];
  const C = [c0, c1, c2, c0];
  const D = [0, 0, 0, 0];
  // Twin-store each row at two consecutive float4 slots (AVX-256 layout).
  // Byte offsets: +0x00, +0x10, +0x20, +0x30, +0x40, +0x50, +0x60, +0x70 -> float32 slots 0..28 step 4.
  const writeRow = (byteOff: number, row: number[]): void => {
    const idx = byteOff >> 2;
    state[idx + 0] = Math.fround(row[0]);
    state[idx + 1] = Math.fround(row[1]);
    state[idx + 2] = Math.fround(row[2]);
    state[idx + 3] = Math.fround(row[3]);
  };
  // Order matches the disasm exactly (high slot first, then low slot for each pair).
  writeRow(0x10, A); // @Ozone 0x6a1fd0
  writeRow(0x00, A); // @Ozone 0x6a1fdb
  writeRow(0x30, B); // @Ozone 0x6a1fe9
  writeRow(0x20, B); // @Ozone 0x6a1ff4
  writeRow(0x50, C); // @Ozone 0x6a2003
  writeRow(0x40, C); // @Ozone 0x6a200e
  writeRow(0x70, D); // @Ozone 0x6a201d
  writeRow(0x60, D); // @Ozone 0x6a2028
  // @Ozone 0x6a202c: xorl %eax, %eax -> return 0.
  return 0;
}

/**
 * `HgcCopyMaskRGBToMaskAlpha::GetOutput(HGRenderer*)` @Ozone 0x6a2dc0.
 *
 * Verbatim disasm:
 *   0x6a2dc0  pushq %rbp; movq %rsp,%rbp; subq $0x20,%rsp
 *   0x6a2dd8  cmpl  $0x0, 0x1f8(%rax)                                       ## if dirty == 0: skip
 *   0x6a2ddf  je    0x6a2e43
 *   -- dirty != 0 branch (@0x6a2de1..0x6a2e39) --
 *     0x6a2de9  callq HgcCopyMaskRGBToMaskAlpha::Setup(NULL)                ## refresh state matrix
 *     0x6a2df9  movaps (state), %xmm0;  movaps %xmm0, this->+0x1b0          ## row0 <- state[+0x00]
 *     0x6a2e0a  movaps 0x20(state), %xmm0; movaps %xmm0, this->+0x1c0       ## row1 <- state[+0x20]
 *     0x6a2e1c  movaps 0x40(state), %xmm0; movaps %xmm0, this->+0x1d0       ## row2 <- state[+0x40]
 *     0x6a2e2e  movaps 0x60(state), %xmm0; movaps %xmm0, this->+0x1e0       ## row3 <- state[+0x60]
 *     0x6a2e39  movl  $0x0, 0x1f8(%rax)                                     ## dirty = 0
 *   -- shared tail --
 *   0x6a2e4b  callq HGColorMatrix::GetOutput(HGRenderer*)                   ## stub 0x6dd7b2
 *   0x6a2e50  addq $0x20,%rsp; popq %rbp; retq
 */
export function HgcCopyMaskRGBToMaskAlpha_GetOutput(
  self: HgcCopyMaskRGBToMaskAlphaState,
  _renderer: unknown,
): unknown {
  // @Ozone 0x6a2dd8..0x6a2ddf: lazy refresh gated on `dirty`.
  if (self.dirty !== 0) {
    // @Ozone 0x6a2de9: Setup(NULL).
    HgcCopyMaskRGBToMaskAlpha_Setup(self, null);
    const state = self.state;
    if (state === null) {
      throw new Error(
        "HgcCopyMaskRGBToMaskAlpha::GetOutput @Ozone 0x6a2df2 reads this->state; state is null.",
      );
    }
    // @Ozone 0x6a2df9..0x6a2e32: copy state[+0x00/+0x20/+0x40/+0x60] into this->[+0x1b0/+0x1c0/+0x1d0/+0x1e0].
    // Byte offsets +0x00,+0x20,+0x40,+0x60 -> float32 slots 0, 8, 16, 24. Each row is 4 float32s.
    for (let row = 0; row < 4; ++row) {
      const src = row * 8; // 8 float32 = 0x20 bytes
      const dst = row * 4;
      self.colorMatrix[dst + 0] = Math.fround(state[src + 0]);
      self.colorMatrix[dst + 1] = Math.fround(state[src + 1]);
      self.colorMatrix[dst + 2] = Math.fround(state[src + 2]);
      self.colorMatrix[dst + 3] = Math.fround(state[src + 3]);
    }
    // @Ozone 0x6a2e39: dirty = 0.
    self.dirty = 0;
  }
  // @Ozone 0x6a2e4b: tail-call HGColorMatrix::GetOutput(renderer) — undecoded base-class method.
  throw new Error(
    "HgcCopyMaskRGBToMaskAlpha::GetOutput not yet transcribed @Ozone 0x6a2dc0 — the dirty-flag " +
      "refresh path is faithful, but the tail dispatch to HGColorMatrix::GetOutput @Ozone stub " +
      "0x6dd7b2 (@0x6a2e4b) is undecoded and must be ported before this method can return a real " +
      "HGRenderer output handle.",
  );
}

/**
 * Tile layout used by RenderTile / RenderTile_AVX. Field offsets are recovered from the
 * disasm's direct-address reads:
 *   +0x00..+0x0c  HGRect (x,y,right,bottom) — accessed via HGRect::w() @0x6a2979 and
 *                                             HGTile::Height() @0x6a2985 which read from
 *                                             here; we model them as decoded fields.
 *   +0x10  out plane  (float4 texels)         — @0x6a29a7
 *   +0x18  out row stride (in TEXELS)         — @0x6a29b3
 *   +0x50  in0 plane  (float4 texels)         — @0x6a299b
 *   +0x58  in0 row stride (in TEXELS)         — @0x6a2991
 */
export interface HgcCopyMaskRGBToMaskAlphaTile {
  /** HGRect.w() and HGTile::Height() derive from this HGRect (from HGTile base). */
  rect: HGRect;
  /** Output plane — RGBA float32 texels, row-major, `outRowStride` texels per row. */
  outPtr: Float32Array;
  outRowStride: number;
  /** Input plane (single input, per shader's `hg_Texture0`). */
  inPtr: Float32Array;
  inRowStride: number;
}

/**
 * `HgcCopyMaskRGBToMaskAlpha::RenderTile(HGTile*)` @Ozone 0x6a2920.
 *
 * SSE software fallback (2-texel unrolled inner loop; matches the shader's `output.color0 = r0.xyzx`).
 *
 * Verbatim algorithm from the 121-line disasm:
 *   0x6a2942  renderer = HGTile::Renderer()                          ## stub 0x6df882
 *   0x6a294c  target = renderer->GetTarget(0)                        ## stub 0x6dd380
 *   0x6a2954  if (target >= 0x4700000) tail-call RenderTile_AVX(tile) and return
 *   -- SSE path --
 *   0x6a2979  w = HGRect::w(&tile->rect)
 *   0x6a2985  h = HGTile::Height(tile)
 *   0x6a298d  inRowStride  = *(int*)(tile + 0x58)                    ## in0RowStride
 *   0x6a299b  inPtr        = *(void**)(tile + 0x50)                  ## in0Ptr
 *   0x6a29a7  outPtr       = *(void**)(tile + 0x10)                  ## outPtr
 *   0x6a29b3  outRowStride = *(int*)(tile + 0x18)                    ## outRowStride
 *   0x6a29b9  for (row = 0; row < h; ++row):                         ## y loop @0x6a29c0
 *   0x6a29cc     for (col = 0; w - col >= 2; col += 2):              ## 2-texel x loop @0x6a29d3
 *   0x6a29e2       xmm0 = in[col + 0]                                ## movaps
 *   0x6a2a02       xmm1 = in[col + 1]                                ## movaps
 *   0x6a2a0f       xmm0 = shufps 0x24, xmm0 -> [in[col+0].xyzx]
 *   0x6a2a1b       xmm1 = shufps 0x24, xmm1 -> [in[col+1].xyzx]
 *   0x6a2a3b       out[col + 0] = xmm0
 *   0x6a2a56       out[col + 1] = xmm1
 *   0x6a2a67     if (col < w):                                       ## 1-texel tail @0x6a2a6a
 *   0x6a2a6f       xmm0 = in[col]
 *   0x6a2a87       xmm0 = shufps 0x24, xmm0
 *   0x6a2aa2       out[col] = xmm0
 *   0x6a2aa5     inPtr  += inRowStride  * 16 bytes                   ## @0x6a2aa5..0x6a2ab6
 *   0x6a2aba     outPtr += outRowStride * 16 bytes                   ## @0x6a2aba..0x6a2acb
 *   0x6a2add  return 0
 *
 * Note: `shufps $0x24` writes lane [0,1,2,0] — i.e. dst = [src.x, src.y, src.z, src.x]. This
 * copies R into the alpha lane while keeping RGB unchanged, which is EXACTLY the shader's
 * `r0.xyz = tex.xyz; output = r0.xyzx`.
 */
export function HgcCopyMaskRGBToMaskAlpha_RenderTile(
  _self: HgcCopyMaskRGBToMaskAlphaState,
  tile: HgcCopyMaskRGBToMaskAlphaTile,
): number {
  // @Ozone 0x6a2942..0x6a2958: renderer = tile->Renderer(); target = renderer->GetTarget(0);
  //   if (target >= 0x4700000) return RenderTile_AVX(tile).
  // Callees are undecoded — but the AVX branch is a pure performance dispatch: same math, wider
  // lanes. The SSE body below is bit-identical (elementwise shuffle + copy, no cross-lane ops).
  // @Ozone 0x6a2979: HGRect::w() (opaque method call — we read from the modeled HGRect.w field).
  const w = ((tile.rect.right | 0) - (tile.rect.x | 0)) | 0;
  // @Ozone 0x6a2985: HGTile::Height() (opaque — modeled as HGRect bottom-top).
  const h = ((tile.rect.bottom | 0) - (tile.rect.y | 0)) | 0;
  const inPtr = tile.inPtr;
  const outPtr = tile.outPtr;
  const rin = tile.inRowStride | 0;
  const rout = tile.outRowStride | 0;
  // @Ozone 0x6a29c0: for (row = 0; row < h; ++row).
  for (let row = 0; row < h; ++row) {
    const inRowOff = (row * rin) << 2; // texels -> float32s (4 per texel).
    const outRowOff = (row * rout) << 2;
    // @Ozone 0x6a29d3: 2-texel unrolled inner loop `for (col=0; w-col>=2; col+=2)`.
    let col = 0;
    for (; w - col >= 2; col += 2) {
      // @Ozone 0x6a29e2: in[col + 0].
      const p0 = inRowOff + (col << 2);
      const iR0 = Math.fround(inPtr[p0 + 0]);
      const iG0 = Math.fround(inPtr[p0 + 1]);
      const iB0 = Math.fround(inPtr[p0 + 2]);
      // shufps $0x24 -> [iR, iG, iB, iR]. @Ozone 0x6a2a0f.
      // @Ozone 0x6a2a3b: out[col + 0] = shuffled.
      const q0 = outRowOff + (col << 2);
      outPtr[q0 + 0] = iR0;
      outPtr[q0 + 1] = iG0;
      outPtr[q0 + 2] = iB0;
      outPtr[q0 + 3] = iR0;
      // @Ozone 0x6a2a02: in[col + 1]; shufps @0x6a2a1b; write @0x6a2a56.
      const p1 = inRowOff + ((col + 1) << 2);
      const iR1 = Math.fround(inPtr[p1 + 0]);
      const iG1 = Math.fround(inPtr[p1 + 1]);
      const iB1 = Math.fround(inPtr[p1 + 2]);
      const q1 = outRowOff + ((col + 1) << 2);
      outPtr[q1 + 0] = iR1;
      outPtr[q1 + 1] = iG1;
      outPtr[q1 + 2] = iB1;
      outPtr[q1 + 3] = iR1;
    }
    // @Ozone 0x6a2a67..0x6a2a6d: 1-texel tail if w is odd.
    if (col < w) {
      const p = inRowOff + (col << 2);
      const iR = Math.fround(inPtr[p + 0]);
      const iG = Math.fround(inPtr[p + 1]);
      const iB = Math.fround(inPtr[p + 2]);
      const q = outRowOff + (col << 2);
      outPtr[q + 0] = iR;
      outPtr[q + 1] = iG;
      outPtr[q + 2] = iB;
      outPtr[q + 3] = iR;
    }
    // @Ozone 0x6a2aa5..0x6a2acb: advance inPtr/outPtr by row strides. In our model the base ptrs
    // don't advance; the offsets computed above already fold in (row * stride).
  }
  // @Ozone 0x6a2add: return 0.
  return 0;
}

/**
 * `HgcCopyMaskRGBToMaskAlpha::RenderTile_AVX(HGTile*)` @Ozone 0x6a2350.
 *
 * 220-line AVX (256-bit / 6-texel unrolled) variant of RenderTile — same output math, wider
 * vectors. NOT transcribed in this pass: the surrounding block-copy patterns require decoding
 * multiple vmovaps->stack->vmovups round-trips that the compiler generated to satisfy vector
 * alignment; the SSE path in HgcCopyMaskRGBToMaskAlpha_RenderTile above produces bit-identical
 * outputs (elementwise shuffle + copy, no cross-lane reduction) so callers who need the result
 * (rather than the AVX-specific memory-access pattern) can use the SSE port.
 */
export function HgcCopyMaskRGBToMaskAlpha_RenderTile_AVX(
  _self: HgcCopyMaskRGBToMaskAlphaState,
  _tile: HgcCopyMaskRGBToMaskAlphaTile,
): number {
  // @Ozone 0x6a2350
  throw new Error(
    "HgcCopyMaskRGBToMaskAlpha::RenderTile_AVX not yet transcribed @Ozone 0x6a2350 — 220-line " +
      "AVX2 variant of RenderTile using `vpermilps $0x24` (same [0,1,2,0] lane shuffle as the SSE " +
      "path); the SSE port in HgcCopyMaskRGBToMaskAlpha_RenderTile is functionally equivalent.",
  );
}

// ============================================================================
// FRONTIER CALLEE STUBS
// ============================================================================
//
// Each stub cites the callsite address inside HgcCopyMaskRGBToMaskAlpha (so P4's "throw must
// cite @0xADDR" rule fires) AND the target stub address inside Ozone where the external symbol
// lives (for downstream porters).

function HGColorMatrix_HGColorMatrix_stub(): void {
  // Called from HgcCopyMaskRGBToMaskAlpha C2 @Ozone 0x6a2bc4 (via __stub 0x6dd7be).
  throw new Error("HGColorMatrix::HGColorMatrix() @Ozone (stub 0x6dd7be) not yet transcribed");
}

function HGColorMatrix_dtor_stub(): void {
  // Called from HgcCopyMaskRGBToMaskAlpha D2 @Ozone 0x6a2d10 (via __stub 0x6dd7c4).
  throw new Error("HGColorMatrix::~HGColorMatrix() @Ozone (stub 0x6dd7c4) not yet transcribed");
}

function HGObject_operator_delete_stub(): void {
  // Called from HgcCopyMaskRGBToMaskAlpha D0 @Ozone 0x6a2d5d (via __stub 0x6def6a).
  throw new Error("HGObject::operator delete(void*) @Ozone (stub 0x6def6a) not yet transcribed");
}
