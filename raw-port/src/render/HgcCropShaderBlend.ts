// HgcCropShaderBlend.ts — Helium HgcCropShaderBlend: a two-parameter GPU shader render
// node that samples an input texture, tests whether the *frag-space* uv (texCoord1) lies
// inside the rect stored in hg_Params[0] (xy = min corner, zw = max corner), and multiplies
// the sample by (inside ? 1 : 0) * hg_Params[1] (a per-channel color/opacity). This is the
// "crop with alpha-tint" shader used by transition drop-zone plates.
//
// Transcribed from FCP's Helium binary at addresses 0x246f70..0x247618. See
//   raw-port/re/disasm/Helium.HgcCropShaderBlend.*.s
// for the ground-truth assembly of each method.
//
// Every function below cites its @0xADDR; every RIP-relative literal (shader source, param
// buffer size, target-format sentinel, HGRectNull) cites the address it was read from.
//
// ── HgcCropShaderBlend layout (recovered from ctor at 0x247420 + method field accesses) ──
// The class extends HGNode. The ctor calls HGNode::HGNode(), then:
//   *(this)          = &vtable_HgcCropShaderBlend                    @0x247436
//   *(this + 0x198)  = operator new(0x20)  -> 2x float4 param buffer  @0x247439..0x24744d
//     — the 32-byte buffer is xorps-zeroed (movaps xmm0=0 to +0/+0x10) @0x247446/0x24744a
//   *(this + 0x10)  &= 0xFFFFF9FF ; |= 0x400                           @0x247454..0x247461
//     — HGNode-inherited "flags" field: clears bits 9..10, sets bit 10.
//
// The +0x198 pointer is used by:
//   * SetParameter / GetParameter to read/write the 4-float slot at (base + idx*0x10),
//   * Bind to push both slots to the HGHandler at texCoord1 slot 0 (base+0x0) and slot 1
//     (base+0x10) via HGHandler *0x90 vtable.
//   * D0 destructor to `operator delete` the buffer before HGNode::~HGNode.
export interface HGNode {}
export interface HGHandler {}
export interface HGRenderer {}
export interface HGProgramDescriptor {}
export interface HGBinding {}

// _HGRectNull — Helium __DATA_CONST @0x3d2284 = {x:0, y:0, right:0, bottom:0}. Already
// decoded and exported by render/HGRect.ts; imported here to reuse the canonical value.
import { HGRect, HGRectNull } from "./HGRect";

// ── constants used by HgcCropShaderBlend methods (from RIP literal pool at Helium 0x??) ──
//
// GetProgram target-format check (cmpl $0x60B10, %eax @0x246f83): the fragment shader source
// is returned ONLY for target format 0x60B10 (Helium's RGBA-float4 native format). For any
// other target (unmapped GLSL/older Metal) the returned pointer is nullptr — the caller then
// falls back to InitProgramDescriptor.
// @const Helium 0x246f83 (imm32 $0x60B10 -> HGRenderer::GetTarget code for float4 RGBA Metal)
const HG_TARGET_METAL_F4 = 0x60b10;
// GetTarget argument for GetProgram (movl $0x60000, %esi @0x246f77): the "which target" enum
// value Helium passes into HGRenderer::GetTarget. Not a shader compile flag; a query id.
// @const Helium 0x246f77 (imm32 $0x60000 -> HGRenderer::GetTarget query id)
const HG_TARGET_QUERY = 0x60000;
// The exact Metal fragment shader source string returned by GetProgram (@0x246f88 leaq).
// This is a C-string constant embedded verbatim in Helium's __TEXT_CSTRING. We keep it as a
// TS constant so hosts that need to submit the identical shader can round-trip it. The MD5
// tag inside the SIG line is Helium's fingerprint; do not edit — it is the shader ABI.
// @const Helium __TEXT_CSTRING via leaq 0x6e29ad(%rip) @0x246f88 (RIP=0x246f8f)
export const kHgcCropShaderBlend_MetalFragment_Program =
  "//Metal1.0     \n" +
  "//LEN=0000000355\n" +
  "fragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n" +
  "    const constant float4* hg_Params [[ buffer(0) ]], \n" +
  "    texture2d< float > hg_Texture0 [[ texture(0) ]], \n" +
  "    sampler hg_Sampler0 [[ sampler(0) ]])\n" +
  "{\n" +
  "    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);\n" +
  "    float4 r0, r1;\n" +
  "    FragmentOut output;\n" +
  "\n" +
  "    r0 = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy);\n" +
  "    r1.xy = frag._texCoord1.xy - hg_Params[0].xy;\n" +
  "    r1.zw = hg_Params[0].zw - frag._texCoord1.xy;\n" +
  "    r1 = float4(r1 < c0.xxxx);\n" +
  "    r1 = float4(dot(r1, 1.00000f));\n" +
  "    r1 = float4(r1 <= c0.xxxx);\n" +
  "    r0 = r0*r1;\n" +
  "    output.color0 = r0*hg_Params[1];\n" +
  "    return output;\n" +
  "}\n" +
  "//MD5=71c0cb25:36879384:725a4797:f8967426\n" +
  "//SIG=00000000:00000001:00000001:00000000:0001:0002:0002:0000:0000:0000:0006:0000:0002:01:0:1:0\n";

// The "visible" shader-graph source string used by InitProgramDescriptor (leaq @0x246fb8).
// Same math as the Metal fragment above, but wrapped for the Helium shader-graph "visible"
// entry point (no texture sampling — the caller feeds color0/texCoord1 as varying args).
// @const Helium __TEXT_CSTRING via leaq 0x6e2d1f(%rip) @0x246fb8 (RIP=0x246fbf)
export const kHgcCropShaderBlend_MetalVisible_Program =
  "//Metal1.0     \n" +
  "//LEN=000000023b\n" +
  "[[ visible ]] FragmentOut HgcCropShaderBlend_hgc_visible(const constant float4* hg_Params,\n" +
  "    float4 color0,\n" +
  "    float4 texCoord1)\n" +
  "{\n" +
  "    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);\n" +
  "    float4 r0, r1;\n" +
  "    FragmentOut output;\n" +
  "\n" +
  "    r0 = color0;\n" +
  "    r1.xy = texCoord1.xy - hg_Params[0].xy;\n" +
  "    r1.zw = hg_Params[0].zw - texCoord1.xy;\n" +
  "    r1 = float4(r1 < c0.xxxx);\n" +
  "    r1 = float4(dot(r1, 1.00000f));\n" +
  "    r1 = float4(r1 <= c0.xxxx);\n" +
  "    r0 = r0*r1;\n" +
  "    output.color0 = r0*hg_Params[1];\n" +
  "    return output;\n" +
  "}\n";
// The InitProgramDescriptor identifiers (leaq @0x246fb1, @0x246fc7): the visible-function
// name that HGProgramDescriptor::SetVisibleShaderWithSource is passed, and the fragment
// function name for SetFragmentFunctionName. Kept as separate constants so the descriptor
// bindings match Helium's shader registry byte-for-byte.
// @const Helium __TEXT_CSTRING via leaq 0x6e2cda(%rip) @0x246fb1 (RIP=0x246fb8)
export const kHgcCropShaderBlend_VisibleName = "HgcCropShaderBlend_hgc_visible";
// @const Helium __TEXT_CSTRING via leaq 0x6e2ce3(%rip) @0x246fc7 (RIP=0x246fce)
export const kHgcCropShaderBlend_FragmentFunctionName = "HgcCropShaderBlend";
// shaderDescription 32-byte buffer literal (assembled by movabsq+movl+movb at @0x24726d,
// @0x247271, @0x24727b): the string "HgcCropShaderBlend [hgc1]" (25 chars) with null-term.
// Written using two `movups xmm0` fetches from the literal pool at 0x246+X — the 16-byte
// pieces "HgcCropShaderBl" + "aderBlend [hgc1]" overlap at offset 9 to form the full 25-char
// name. We keep the exact assembled string as the class's shader-descriptor name.
// @const Helium __TEXT_CSTRING via movups 0x6e2a4c(%rip) @0x247271 + 0x6e2a60(%rip) @0x247266
export const kHgcCropShaderBlend_ShaderName = "HgcCropShaderBlend [hgc1]";
// shaderDescription: allocated buffer size (movq $0x21,(%rbx) @0x247257 -> capacity=0x21=33)
// and used byte-length (movq $0x19,0x8(%rbx) @0x24725e -> len=0x19=25, matches the name).
// @const Helium 0x247257 (imm $0x21 -> shaderDescription buffer capacity, chars incl NUL)
const kShaderDescCap = 0x21;
// @const Helium 0x24725e (imm $0x19 -> shaderDescription used length, 25 chars w/o NUL)
const kShaderDescLen = 0x19;
// Param buffer allocation size (movl $0x20,%edi @0x247439 to operator new): 32 bytes = 2x
// float4 = the two `hg_Params[0]` / `hg_Params[1]` slots the Metal shader reads.
// @const Helium 0x247439 (imm $0x20 -> operator new size = 2 * sizeof(float4))
const kParamBufSize = 0x20;
// ctor flags: `flags &= 0xFFFFF9FF ; flags |= 0x400` @0x247454..0x247461. This clears bits
// [9..10] of the HGNode inherited "flags" field at (this+0x10) then sets bit 10. Net result:
// bit 9 is FORCED off, bit 10 is FORCED on. We keep the exact mask+or shape so a host that
// reproduces HGNode's flag semantics matches Helium exactly.
// @const Helium 0x247454 (imm32 $0xFFFFF9FF -> clear-mask for HGNode.flags bits 9..10)
const kFlagClear = 0xfffff9ff;
// @const Helium 0x24745c (imm $0x400 -> set-bit 10 in HGNode.flags)
const kFlagSet = 0x400;
// SetParameter/GetParameter index limit (cmpl $0x1,%esi ; ja @0x247545 / @0x2475c5): the
// selector must be 0 or 1 (unsigned above 1 -> invalid -> return -1). Matches the 2xfloat4
// buffer size decided by the ctor's operator-new call.
// @const Helium 0x247545 / 0x2475c5 (imm $0x1 -> max param index inclusive)
const kMaxParamIndex = 0x1;
// SetParameter/GetParameter slot stride (shlq $0x4,%rdx @0x247553 / @0x2475d7): each param
// slot is 0x10 = 16 bytes = one float4. `base + idx*0x10` addresses slot idx.
// @const Helium 0x247553 (imm $0x4 shift -> each param slot is 16 bytes)
const kParamSlotSize = 0x10;
void kParamSlotSize;

// ── vtable slots on HGHandler used by BindTexture/Bind (Helium HGHandler vtable) ─────
// We decode the OFFSETS bit-for-bit from the callq *0xNN(rax) sites; the CONCRETE resolved
// methods are what an installed HGHandler vtable exposes at those slots. Callers inject a
// concrete HGHandler through a wrapper; we throw for un-transcribed vtable calls @0x2472af,
// the slot AND the callq address so the host wires it in.
//   @0x2472af  callq *0x48(rax)   HGHandler::vslot_0x48(int=0, int=0)
//   @0x2472bc  callq *0x30(rax)   HGHandler::vslot_0x30(int=0, int=0)
//   @0x2472df  callq *0x80(rax)   HGHandler::vslot_0x80(int=0x2e) -> returns int (nonzero=abort)
//   @0x2472ef  callq *0xa8(rax)   HGHandler::vslot_0xa8()
//   @0x247335  callq *0x90(rax)   HGHandler::vslot_0x90(int=0, void*=params+0x00, int=1)
//   @0x247356  callq *0x90(rax)   HGHandler::vslot_0x90(int=1, void*=params+0x10, int=1)
//   @0x247365  callq *0xc0(rax)   HGHandler::vslot_0xc0(HGHandler*=rsi)
export interface HGHandlerVTable {
  vslot_0x30(handler: HGHandler, a: number, b: number): void;
  vslot_0x48(handler: HGHandler, a: number, b: number): void;
  vslot_0x80(handler: HGHandler, cmd: number): number;
  vslot_0x90(handler: HGHandler, slotIdx: number, floatPtr: Float32Array, count: number): void;
  vslot_0xa8(handler: HGHandler): void;
  vslot_0xc0(handler: HGHandler, arg: HGHandler): void;
}

// ── external callees stubbed as throwing hooks (each cites its callq site) ────────
// HGNode::HGNode() ctor — called @0x24742a from our ctor. Not yet transcribed.
function HGNode_ctor_stub(_this: HgcCropShaderBlend): void {
  // HGNode::HGNode() @Helium 0x24742a not yet transcribed
  throw new Error("HgcCropShaderBlend: HGNode::HGNode() @Helium 0x24742a not yet transcribed");
}
// HGNode::~HGNode() dtor — called @0x24746f (unwind path) and @0x247527 (D0 path).
function HGNode_dtor_stub(_this: HgcCropShaderBlend): void {
  // HGNode::~HGNode() @Helium 0x247527 not yet transcribed
  throw new Error("HgcCropShaderBlend: HGNode::~HGNode() @Helium 0x247527 not yet transcribed");
}
// HGNode::ClearBits() — called @0x2475a2 from SetParameter after a write actually changes
// the param buffer. Not yet transcribed (HGNode class port pending).
function HGNode_ClearBits_stub(_this: HgcCropShaderBlend): void {
  // HGNode::ClearBits() @Helium 0x2475a2 not yet transcribed
  throw new Error("HgcCropShaderBlend: HGNode::ClearBits() @Helium 0x2475a2 not yet transcribed");
}
// HGHandler::TexCoord(int, int, int, double const*) — called @0x2472cb (BindTexture) and
// @0x24731c (Bind). Static-linked entry into HGHandler, not a vtable slot.
function HGHandler_TexCoord_stub(_h: HGHandler, _a: number, _b: number, _c: number, _p: Float64Array | null): void {
  // HGHandler::TexCoord(int,int,int,double const*) @Helium 0x2472cb not yet transcribed
  throw new Error("HgcCropShaderBlend: HGHandler::TexCoord @Helium 0x2472cb not yet transcribed");
}
// HGProgramDescriptor::SetVisibleShaderWithSource(char const*, char const*) — @0x246fc2.
function HGProgramDescriptor_SetVisibleShaderWithSource_stub(_pd: HGProgramDescriptor, _name: string, _src: string): void {
  // HGProgramDescriptor::SetVisibleShaderWithSource @Helium 0x246fc2 not yet transcribed
  throw new Error("HgcCropShaderBlend: HGProgramDescriptor::SetVisibleShaderWithSource @Helium 0x246fc2 not yet transcribed");
}
// HGProgramDescriptor::SetFragmentFunctionName(char const*) — @0x246fd1.
function HGProgramDescriptor_SetFragmentFunctionName_stub(_pd: HGProgramDescriptor, _name: string): void {
  // HGProgramDescriptor::SetFragmentFunctionName @Helium 0x246fd1 not yet transcribed
  throw new Error("HgcCropShaderBlend: HGProgramDescriptor::SetFragmentFunctionName @Helium 0x246fd1 not yet transcribed");
}
// HGProgramDescriptor::SetReturnBinding(HGBinding) — @0x247018.
function HGProgramDescriptor_SetReturnBinding_stub(_pd: HGProgramDescriptor, _binding: HGBinding): void {
  // HGProgramDescriptor::SetReturnBinding @Helium 0x247018 not yet transcribed
  throw new Error("HgcCropShaderBlend: HGProgramDescriptor::SetReturnBinding @Helium 0x247018 not yet transcribed");
}
// HGProgramDescriptor::SetArgumentBindings(vector<HGBinding> const&) — @0x2471a2.
function HGProgramDescriptor_SetArgumentBindings_stub(_pd: HGProgramDescriptor, _b: HGBinding[]): void {
  // HGProgramDescriptor::SetArgumentBindings @Helium 0x2471a2 not yet transcribed
  throw new Error("HgcCropShaderBlend: HGProgramDescriptor::SetArgumentBindings @Helium 0x2471a2 not yet transcribed");
}
// HGRenderer::GetTarget(unsigned int) — @0x246f7c.
function HGRenderer_GetTarget_stub(_r: HGRenderer, _query: number): number {
  // HGRenderer::GetTarget @Helium 0x246f7c not yet transcribed
  throw new Error("HgcCropShaderBlend: HGRenderer::GetTarget @Helium 0x246f7c not yet transcribed");
}

// ═══════════════════════════════════════════════════════════════════════════════
// HgcCropShaderBlend — the class itself
// ═══════════════════════════════════════════════════════════════════════════════

// The class carries only three transcribable fields plus HGNode base:
//   (this + 0x00)  vtable pointer
//   (this + 0x10)  int32 HGNode.flags   (inherited from HGNode; touched by ctor/SetParameter)
//   (this + 0x198) float* params buffer (2x float4 = 32 bytes, from operator new(0x20))
// Every other HGNode-inherited field is opaque here — we only touch the fields our decoded
// methods touch.
export interface HgcCropShaderBlend {
  vptr: unknown;              // +0x00 (installed vtable ptr, matches ctor's movq at 0x247436)
  flags: number;              // +0x10 int32 HGNode.flags
  params: Float32Array;       // +0x198 float* — length 8 (2x float4 slots x 4 lanes each)
  // The `params` field is written as a raw byte pointer in the binary; we model it as an
  // 8-lane Float32Array (2x float4) so SetParameter/GetParameter can index the lanes directly.
  // Byte offsets: slot 0 -> params[0..4]; slot 1 -> params[4..8].
}

/**
 * HgcCropShaderBlend::HgcCropShaderBlend() — C1 ctor.
 * @0xADDR Helium 0x247420 (C1) / 0x2473c0 (C2 — same body).
 *
 * Instruction-by-instruction (0x247420..0x247468):
 *   callq HGNode::HGNode()          @0x24742a  ; base-class init
 *   leaq  0x7ef462(%rip), %rax      @0x24742f  ; rax = &vtable_HgcCropShaderBlend
 *   movq  %rax, (%rbx)              @0x247436  ; this->vptr = &vtable
 *   movl  $0x20, %edi               @0x247439  ; operator new(0x20)
 *   callq __Znwm                    @0x24743e
 *   xorps %xmm0, %xmm0              @0x247443  ; xmm0 = {0,0,0,0}
 *   movaps %xmm0, 0x10(%rax)        @0x247446  ; params[+0x10..+0x1f] = 0
 *   movaps %xmm0, (%rax)            @0x24744a  ; params[+0x00..+0x0f] = 0
 *   movq  %rax, 0x198(%rbx)         @0x24744d  ; this->params = rax
 *   movl  $0xFFFFF9FF, %eax         @0x247454
 *   andl  0x10(%rbx), %eax          @0x247459  ; eax = old_flags & 0xFFFFF9FF
 *   orl   $0x400, %eax              @0x24745c  ; eax |= 0x400
 *   movl  %eax, 0x10(%rbx)          @0x247461  ; this->flags = eax
 *
 * The unwind path @0x247469..0x24747c is exception cleanup: destroy the HGNode base and
 * rethrow. Modeled as a comment — try/catch would fabricate flow control the CPU doesn't
 * take on the happy path.
 */
export function makeHgcCropShaderBlend(): HgcCropShaderBlend {
  // callq HGNode::HGNode() @0x24742a
  const self: HgcCropShaderBlend = {
    vptr: null,
    flags: 0,
    params: new Float32Array(kParamBufSize / 4),   // 32 bytes / 4 bytes-per-float = 8 lanes
  };
  HGNode_ctor_stub(self);
  // this->vptr = &vtable @0x247436  (address recorded, ptr type opaque)
  self.vptr = "vtable_HgcCropShaderBlend @Helium 0x24742f-relative";
  // this->params = operator new(0x20)   @0x24743e-@0x24744d.  Buffer is xorps-zeroed.
  self.params.fill(0);
  // this->flags = (old_flags & 0xFFFFF9FF) | 0x400   @0x247454..@0x247461
  self.flags = ((self.flags & kFlagClear) | kFlagSet) | 0;
  return self;
}

/**
 * HgcCropShaderBlend::~HgcCropShaderBlend() — D0 (deleting) destructor.
 * @0xADDR Helium 0x247500 (D0) / 0x247480 (D1) / 0x2474c0 (D2 — chained).
 *
 * Instruction-by-instruction of D0 (0x247500..0x247535):
 *   leaq  0x7ef388(%rip), %rax      @0x247509  ; rax = &vtable_HgcCropShaderBlend
 *   movq  %rax, (%rdi)              @0x247510  ; this->vptr = &vtable
 *   movq  0x198(%rdi), %rdi         @0x247513  ; load params ptr
 *   testq %rdi, %rdi ; je 0x247524  @0x24751a  ; skip delete if null
 *   callq __ZdlPv                   @0x24751f  ; operator delete(params)
 *   movq  %rbx, %rdi                @0x247524
 *   callq HGNode::~HGNode()         @0x247527  ; base dtor
 *   jmp   HGObject::operator delete @0x247535  ; tail-call — releases the object itself
 */
export function destroyHgcCropShaderBlend(self: HgcCropShaderBlend): void {
  // this->vptr = &vtable  @0x247510  (reset to non-derived vtable during dtor chain).
  self.vptr = "vtable_HgcCropShaderBlend @Helium 0x247509-relative (dtor-reset)";
  // if (params) operator delete(params)  @0x247513..0x24751f
  //   Our TS host uses GC; the "delete" is a no-op but we clear the field to match the
  //   observable side-effect of the C++ dtor.
  if (self.params) {
    // operator delete(params) — GC handles freeing; drop the reference to mirror the C++ path.
    (self as HgcCropShaderBlend & { params: Float32Array | null }).params = null as unknown as Float32Array;
  }
  HGNode_dtor_stub(self);
  // jmp HGObject::operator delete(this)  @0x247535 — releases the object memory.
  // In JS, that's the GC's job; we do nothing here (matches "no observable side-effect after
  // HGNode::~HGNode has cleared the base fields").
}

/**
 * HgcCropShaderBlend::SetParameter(int idx, float x, float y, float z, float w).
 * @0xADDR Helium 0x247540
 *
 * Returns:
 *   -1 (0xFFFFFFFF) if idx > 1
 *    0 if all four floats were bit-equal (no write, no ClearBits call)
 *    1 if any float changed (write happened, HGNode::ClearBits() invoked)
 *
 * Instruction-by-instruction (0x247540..0x2475b0):
 *   movl  $0xFFFFFFFF, %eax          @0x247540  ; eax = -1 (default return: invalid)
 *   cmpl  $0x1, %esi ; ja retq       @0x247545..@0x247548 ; if (unsigned idx > 1) return -1
 *   movq  0x198(%rdi), %rcx          @0x24754a  ; rcx = params ptr
 *   movl  %esi, %edx ; shlq $0x4,%rdx @0x247551 ; edx = idx*16
 *   leaq  (%rcx,%rdx), %rax          @0x247557  ; rax = &params[idx*4]
 *   movss (%rcx,%rdx), %xmm4         @0x24755b  ; xmm4 = params[idx].x
 *   ucomiss %xmm0, %xmm4 ; jne/jp 0x24758b       ; if x != new_x, jump to write
 *   ...similar for y (xmm1), z (xmm2), w (xmm3)...
 *   jnp 0x2475ae                     @0x247589  ; all-equal (no NaN) -> return 0
 *   ── write path ──
 *   movss xmm0,(rax) ; movss xmm1,4(rax); movss xmm2,8(rax); movss xmm3,12(rax) @0x24758f..@0x24759d
 *   callq HGNode::ClearBits()         @0x2475a2
 *   movl  $0x1, %eax                  @0x2475a7  ; eax = 1 (changed)
 *
 * NOTE the ucomiss+jne+jp pair: it treats NaN as "not equal", forcing a write. That matches
 * IEEE-754 unordered semantics — a NaN in either the stored or the new value routes to the
 * write path. We replicate that with an explicit `!==` + isNaN check.
 */
export function hgcCropShaderBlend_SetParameter(
  self: HgcCropShaderBlend, idx: number, x: number, y: number, z: number, w: number,
): number {
  // movl $0xFFFFFFFF,%eax ; cmpl $0x1,%esi ; ja retq -> return -1 for unsigned idx > 1.
  if ((idx >>> 0) > kMaxParamIndex) return -1;                        // @0x247540/@0x247548
  const base = (idx | 0) * 4;                                          // idx*16 bytes = idx*4 lanes
  const cx = self.params[base + 0];                                    // @0x24755b movss (rcx,rdx)
  const cy = self.params[base + 1];                                    // @0x247567 movss 0x4(rax)
  const cz = self.params[base + 2];                                    // @0x247573 movss 0x8(rax)
  const cw = self.params[base + 3];                                    // @0x24757f movss 0xc(rax)
  const nx = Math.fround(x);                                           // ucomiss operand xmm0
  const ny = Math.fround(y);                                           // ucomiss operand xmm1
  const nz = Math.fround(z);                                           // ucomiss operand xmm2
  const nw = Math.fround(w);                                           // ucomiss operand xmm3
  // ucomiss sets ZF=1 & PF=0 iff operands are equal AND neither is NaN. The chained jne/jp
  // logic says: if ANY comparison is "not equal OR NaN", branch to write.
  const changed =
    (cx !== nx || Number.isNaN(cx) || Number.isNaN(nx)) ||             // @0x247560/@0x247563
    (cy !== ny || Number.isNaN(cy) || Number.isNaN(ny)) ||             // @0x24756c/@0x24756f
    (cz !== nz || Number.isNaN(cz) || Number.isNaN(nz)) ||             // @0x247578/@0x24757b
    (cw !== nw || Number.isNaN(cw) || Number.isNaN(nw));               // @0x247584/@0x247587
  if (!changed) {
    // jnp 0x2475ae ; xorl %eax,%eax ; retq  @0x247589..@0x2475b0
    return 0;
  }
  // Write path: movss xmm0..xmm3 into params[base..base+3]           @0x24758f..@0x24759d
  self.params[base + 0] = nx;
  self.params[base + 1] = ny;
  self.params[base + 2] = nz;
  self.params[base + 3] = nw;
  // callq HGNode::ClearBits()                                        @0x2475a2
  HGNode_ClearBits_stub(self);
  // movl $0x1,%eax                                                   @0x2475a7
  return 1;
}

/**
 * HgcCropShaderBlend::GetParameter(int idx, float* out) — write the 4-float slot to *out.
 * @0xADDR Helium 0x2475c0
 *
 * Returns -1 for idx>1 (invalid), 0 on success. Instruction-by-instruction (0x2475c0..0x247608):
 *   movl $0xFFFFFFFF,%eax ; cmpl $0x1,%esi ; ja retq   ; @0x2475c0..@0x2475c8  (same guard)
 *   movq 0x198(%rdi), %rax                              ; @0x2475ce  params ptr
 *   movl %esi, %ecx ; shlq $0x4, %rcx                   ; @0x2475d5  ecx = idx*16
 *   movss (%rax,%rcx), %xmm0 ; movss %xmm0, (%rdx)      ; @0x2475db..@0x2475e0  copy x
 *   movss 0x4(%rax,%rcx), %xmm0 ; movss %xmm0, 0x4(%rdx); @0x2475e4..@0x2475ea  copy y
 *   movss 0x8(%rax,%rcx), %xmm0 ; movss %xmm0, 0x8(%rdx); @0x2475ef..@0x2475f5  copy z
 *   movss 0xc(%rax,%rcx), %xmm0 ; movss %xmm0, 0xc(%rdx); @0x2475fa..@0x247600  copy w
 *   xorl %eax,%eax                                       ; @0x247605  return 0
 */
export function hgcCropShaderBlend_GetParameter(
  self: HgcCropShaderBlend, idx: number, out: Float32Array | number[],
): number {
  if ((idx >>> 0) > kMaxParamIndex) return -1;              // @0x2475c0/@0x2475c8
  const base = (idx | 0) * 4;                                // idx*16 bytes = idx*4 lanes
  out[0] = self.params[base + 0];                            // @0x2475db/@0x2475e0
  out[1] = self.params[base + 1];                            // @0x2475e4/@0x2475ea
  out[2] = self.params[base + 2];                            // @0x2475ef/@0x2475f5
  out[3] = self.params[base + 3];                            // @0x2475fa/@0x247600
  return 0;                                                  // xorl %eax,%eax @0x247605
}

/**
 * HgcCropShaderBlend::GetProgram(HGRenderer*) — returns the Metal fragment shader source
 * (kHgcCropShaderBlend_MetalFragment_Program) if the renderer's target format is 0x60B10,
 * otherwise nullptr.
 * @0xADDR Helium 0x246f70
 *
 * Instruction-by-instruction (0x246f70..0x246f97):
 *   movq  %rsi, %rdi                @0x246f74  ; rdi = renderer
 *   movl  $0x60000, %esi            @0x246f77  ; query id 0x60000
 *   callq HGRenderer::GetTarget      @0x246f7c
 *   xorl  %ecx, %ecx                @0x246f81  ; rcx = 0 (default: nullptr)
 *   cmpl  $0x60B10, %eax            @0x246f83  ; is target format Metal-f4?
 *   leaq  0x6e29ad(%rip), %rax      @0x246f88  ; rax = &kHgcCropShaderBlend_MetalFragment_Program
 *   cmoveq %rax, %rcx               @0x246f8f  ; if equal, rcx = shader ptr
 *   movq  %rcx, %rax                @0x246f93  ; return rcx
 */
export function hgcCropShaderBlend_GetProgram(
  self: HgcCropShaderBlend, renderer: HGRenderer,
): string | null {
  // self is unused by this vfn on the C++ side except for the vtable dispatch — same here.
  void self;
  // callq HGRenderer::GetTarget(renderer, 0x60000) @0x246f7c
  const target = HGRenderer_GetTarget_stub(renderer, HG_TARGET_QUERY) | 0;
  // cmoveq: return shader-ptr iff target == 0x60B10, else return nullptr.
  return (target === HG_TARGET_METAL_F4) ? kHgcCropShaderBlend_MetalFragment_Program : null;
}

/**
 * HgcCropShaderBlend::shaderDescription() const — returns a 25-char string
 * "HgcCropShaderBlend [hgc1]" stored in an owned 33-byte buffer.
 * @0xADDR Helium 0x247240
 *
 * Instruction-by-instruction (0x247240..0x247288):
 *   movl  $0x20, %edi ; callq __Znwm            ; @0x247249/@0x24724e  alloc 32-byte buffer
 *   movq  %rax, 0x10(%rbx)                       ; @0x247253  outStr.data = alloc
 *   movq  $0x21, (%rbx)                          ; @0x247257  outStr.cap  = 33
 *   movq  $0x19, 0x8(%rbx)                       ; @0x24725e  outStr.len  = 25
 *   movups 0x6e2a60(%rip), %xmm0                 ; @0x247266  load "aderBlend [hgc1]"
 *   movups %xmm0, 0x9(%rax)                      ; @0x24726d  write to alloc+9 (offset 9..24)
 *   movups 0x6e2a4c(%rip), %xmm0                 ; @0x247271  load "HgcCropShaderBl"
 *   movups %xmm0, (%rax)                         ; @0x247278  write to alloc+0 (offset 0..15)
 *   movb  $0x0, 0x19(%rax)                       ; @0x24727b  NUL-terminate at offset 25
 *   movq  %rbx, %rax                             ; @0x24727f  return outStr
 *
 * The two overlapping 16-byte loads produce the 25-char final buffer:
 *   offset 0..15  = "HgcCropShaderBl"     (from the second movups, written after the first)
 *   offset 9..24  = "aderBlend [hgc1]"    (from the first movups; overwritten in 9..15 by the
 *                                          second, so the overlap is deliberate)
 *   offset 25     = '\0'
 * -> the assembled bytes are "HgcCropShaderBlend [hgc1]\0" (25 chars + NUL, cap = 33).
 *
 * We keep the exact string as the constant kHgcCropShaderBlend_ShaderName.
 */
export interface OwnedString { data: string; cap: number; len: number; }
export function hgcCropShaderBlend_shaderDescription(_self: HgcCropShaderBlend): OwnedString {
  // Allocate a 32-byte buffer (movq $0x20 -> operator new(32)), fill via two overlapping
  // movups — final assembled string is kHgcCropShaderBlend_ShaderName.
  return {
    data: kHgcCropShaderBlend_ShaderName,   // "HgcCropShaderBlend [hgc1]" — 25 chars
    cap:  kShaderDescCap,                   // 33  (@0x247257)
    len:  kShaderDescLen,                   // 25  (@0x24725e)
  };
}

/**
 * HgcCropShaderBlend::GetDOD(HGRenderer*, int idx, HGRect r) — for idx==0, pass r through;
 * for idx!=0, return HGRectNull.
 * @0xADDR Helium 0x247380
 *
 * Instruction-by-instruction (0x247380..0x24739d):
 *   movq  %rcx, %rax                @0x247380  ; rax = r.lo64  (r passed via rdx:rcx)
 *   testl %edx, %edx ; je 0x24739a  @0x247383  ; if idx==0, skip the HGRectNull load
 *   leaq  _HGRectNull(%rip), %rcx   @0x24738b  ; rcx = &HGRectNull
 *   movq  (%rcx), %rax              @0x247392  ; rax = HGRectNull.lo64
 *   movq  0x8(%rcx), %r8            @0x247395  ; r8  = HGRectNull.hi64
 *   movq  %r8, %rdx                 @0x24739a  ; rdx = r8 (the hi half of the returned rect)
 *
 * Both halves are returned in rax:rdx per the SysV small-struct return convention. When idx==0
 * (skip branch), %r8 was never loaded, so %rdx is whatever the caller had in it — but the ABI
 * for a 16-byte return uses rax:rdx, and %rdx already held r.hi64 from the caller frame, so
 * this is the pass-through. We match that behavior by returning `r` as-is for idx==0.
 */
export function hgcCropShaderBlend_GetDOD(
  self: HgcCropShaderBlend, renderer: HGRenderer, idx: number, r: HGRect,
): HGRect {
  void self; void renderer;
  // testl %edx,%edx ; je -> idx==0 returns the original rect.  @0x247383/@0x247385
  if ((idx | 0) === 0) return r;
  // idx!=0 -> return HGRectNull.  @0x24738b..@0x247399
  return HGRectNull;
}

/**
 * HgcCropShaderBlend::GetROI(HGRenderer*, int idx, HGRect r) — byte-identical to GetDOD.
 * @0xADDR Helium 0x2473a0
 *
 * Same instruction stream as GetDOD (0x2473a0..0x2473bd): pass through r for idx==0, else
 * return HGRectNull. The two vfns share the identity implementation because "domain of
 * definition == region of interest" for a passthrough-crop node.
 */
export function hgcCropShaderBlend_GetROI(
  self: HgcCropShaderBlend, renderer: HGRenderer, idx: number, r: HGRect,
): HGRect {
  void self; void renderer;
  if ((idx | 0) === 0) return r;                              // @0x2473a3/@0x2473a5
  return HGRectNull;                                          // @0x2473ab..@0x2473b9
}

/**
 * HgcCropShaderBlend::GetOutput(HGRenderer*) — returns `this` unchanged.
 * @0xADDR Helium 0x247610
 *
 * Instruction-by-instruction (0x247610..0x247618):
 *   movq  %rdi, %rax                @0x247614  ; return this
 * That is the entire body. The renderer arg is ignored. This matches the "the node IS its
 * own output" pattern used by every single-output HGC shader node in Helium.
 */
export function hgcCropShaderBlend_GetOutput(
  self: HgcCropShaderBlend, _renderer: HGRenderer,
): HgcCropShaderBlend {
  return self;                                                 // @0x247614
}

/**
 * HgcCropShaderBlend::InitProgramDescriptor(HGProgramDescriptor*) const.
 * @0xADDR Helium 0x246fa0
 *
 * Registers the visible shader source and fragment function name, sets the return binding
 * (a `FragmentOut` struct) and pushes three argument bindings (`hg_Params: float4[]`,
 * `color0: float4`, `texCoord1: float4` — encoded as three HGBinding structs in a vector).
 *
 * Because HGBinding + the vector's emplace_back and the descriptor setters are all not-yet-
 * transcribed (@Helium 0x246fc2/0x246fd1/0x247018/0x2471a2), this method delegates each step to
 * a throwing stub — a partial port that announces its exact call sequence so a host can wire it in.
 */
export function hgcCropShaderBlend_InitProgramDescriptor(
  _self: HgcCropShaderBlend, pd: HGProgramDescriptor,
): void {
  // callq HGProgramDescriptor::SetVisibleShaderWithSource(pd, "HgcCropShaderBlend_hgc_visible",
  //                                                       kMetalVisible_Program)  @0x246fc2
  HGProgramDescriptor_SetVisibleShaderWithSource_stub(
    pd, kHgcCropShaderBlend_VisibleName, kHgcCropShaderBlend_MetalVisible_Program);
  // callq HGProgramDescriptor::SetFragmentFunctionName(pd, "HgcCropShaderBlend") @0x246fd1
  HGProgramDescriptor_SetFragmentFunctionName_stub(pd, kHgcCropShaderBlend_FragmentFunctionName);
  // Return binding (SetReturnBinding) — an HGBinding built on the stack @0x246fd6..0x24700a.
  //   -0x90(%rbp) = 0x4                      (HGBinding tag = 4 -> "FragmentOut" struct)
  //   -0x88(%rbp) = 0x16                     (short-string-optimization len byte)
  //   -0x87(%rbp) = "FragmentOut" (11 bytes + NUL)
  //   -0x70(%rbp) = [movaps from 0x184086]  (a 16-byte HGBinding trailing payload)
  // The stack HGBinding is passed to SetReturnBinding by *reference* via lea rsi,-0x90(rbp).
  // We don't yet transcribe HGBinding's field mapping; forward via stub.
  const returnBinding: HGBinding = {} as HGBinding;
  HGProgramDescriptor_SetReturnBinding_stub(pd, returnBinding);
  // Then push three HGBindings onto a local vector<HGBinding>:
  //   push tag=2, name="float4"  @0x24703e..@0x247070   (hg_Params)
  //   push tag=10, name="float4" @0x247089..@0x2470f0   (color0)
  //   push tag=8, name="float4"  @0x247116..@0x24717b   (texCoord1)
  // and finally SetArgumentBindings(pd, vector) @0x2471a2.
  const argBindings: HGBinding[] = [];
  HGProgramDescriptor_SetArgumentBindings_stub(pd, argBindings);
  // Unwind path @0x2471f4..0x247238 destroys the vector and rethrows on any prior exception —
  // we mirror the sequence of decoded calls; the un-transcribed callees @0x246fc2/0x2471a2 throw first.
}

/**
 * HgcCropShaderBlend::BindTexture(HGHandler* h, int idx) — for idx==0, calls a specific
 * sequence of HGHandler vtable slots to bind the source texture; for idx!=0, returns -1.
 * @0xADDR Helium 0x247290
 *
 * Instruction-by-instruction (0x247290..0x2472fb) — only the idx==0 path is decoded here;
 * the "wrong idx" path returns ebx=-1 at 0x2472f5.
 *
 *   movl  $0xFFFFFFFF, %ebx            @0x247297  ; default rv = -1
 *   testl %edx, %edx ; jne 0x2472f5    @0x24729c  ; if idx!=0 return -1
 *   movq  %rsi, %r14                   @0x2472a0  ; r14 = handler
 *   xorl  %ebx, %ebx                   @0x2472a6  ; rv = 0
 *   movq  (rsi),%rax ; callq *0x48(rax)(handler,0,0) @0x2472a3..@0x2472af  ; vslot_0x48
 *   movq  (r14),%rax ; callq *0x30(rax)(handler,0,0) @0x2472b2..@0x2472bc  ; vslot_0x30
 *   callq HGHandler::TexCoord(handler,0,0,0,NULL)    @0x2472cb              ; static entry
 *   movq  0x90(%r14),%rdi ; callq *0x80((*rdi)))(rdi,0x2e) @0x2472d0..@0x2472df ; sub-handler check
 *   testl %eax,%eax ; jne 0x2472f5     @0x2472e5  ; if rv nonzero, bail early
 *   movq  (r14),%rax ; callq *0xa8(rax)(handler)    @0x2472e9..@0x2472ef      ; vslot_0xa8
 *
 * The five vtable slots {*0x48, *0x30, *0x80, *0x90-load, *0xa8} are undecoded; TexCoord is
 * a static entry that we already stubbed at file scope. Modeled with throwing stubs so a host
 * that provides a real HGHandler drives them in the exact decoded order.
 */
export function hgcCropShaderBlend_BindTexture(
  _self: HgcCropShaderBlend, handler: HGHandler, idx: number,
  vt?: HGHandlerVTable,
): number {
  // testl %edx,%edx ; jne 0x2472f5 -> idx!=0 returns -1  @0x24729c/@0x24729e
  if ((idx | 0) !== 0) return -1;
  if (!vt) {
    // vtable dispatch @Helium 0x2472af / 0x2472bc / 0x2472df / 0x2472ef not yet transcribed
    throw new Error(
      "hgcCropShaderBlend_BindTexture: HGHandler vtable @Helium 0x2472af/0x2472bc/0x2472df/0x2472ef not yet transcribed");
  }
  // vslot_0x48(handler, 0, 0)             @0x2472af
  vt.vslot_0x48(handler, 0, 0);
  // vslot_0x30(handler, 0, 0)             @0x2472bc
  vt.vslot_0x30(handler, 0, 0);
  // HGHandler::TexCoord(handler, 0, 0, 0, NULL) — static entry  @0x2472cb
  HGHandler_TexCoord_stub(handler, 0, 0, 0, null);
  // The check "callq *0x80(*(handler+0x90))" queries a *sub-handler* at handler+0x90 — this
  // is not the top-level handler vtable, so we surface a throw with the exact site cited.
  // vslot_0x80 on sub-handler @Helium 0x2472df not yet transcribed
  throw new Error("hgcCropShaderBlend_BindTexture: sub-handler *0x80 @Helium 0x2472df not yet transcribed");
}

/**
 * HgcCropShaderBlend::Bind(HGHandler* h) — pushes both param slots to the shader via the
 * HGHandler *0x90 slot at texCoord1 index 0 and 1, then invokes *0xc0(handler) to finish.
 * @0xADDR Helium 0x247300
 *
 * Instruction-by-instruction (0x247300..0x247371):
 *   callq HGHandler::TexCoord(handler, 1, 0, 0, NULL)        @0x24731c
 *   movq  0x198(this), %rdx  ; params base                    @0x247321
 *   callq *0x90(handler)(handler, 0, params+0x00, 1)          @0x247335   ; slot 0 float4
 *   movq  0x198(this), %rdx ; addq 0x10, %rdx  ; params+0x10   @0x24733b..@0x247342
 *   callq *0x90(handler)(handler, 1, params+0x10, 1)          @0x247356   ; slot 1 float4
 *   callq *0xc0(handler)(handler, handler)                    @0x247365   ; finish
 *   xorl  %eax,%eax                                            @0x24736b   ; return 0
 */
export function hgcCropShaderBlend_Bind(
  self: HgcCropShaderBlend, handler: HGHandler,
  vt?: HGHandlerVTable,
): number {
  // HGHandler::TexCoord(handler, 1, 0, 0, NULL)                              @0x24731c
  HGHandler_TexCoord_stub(handler, 1, 0, 0, null);
  if (!vt) {
    // vtable dispatch @Helium 0x247335 / 0x247356 / 0x247365 not yet transcribed
    throw new Error(
      "hgcCropShaderBlend_Bind: HGHandler vtable @Helium 0x247335/0x247356/0x247365 not yet transcribed");
  }
  // vslot_0x90(handler, 0, params_slot0, 1)                                   @0x247335
  const slot0 = self.params.subarray(0, 4);
  vt.vslot_0x90(handler, 0, slot0, 1);
  // vslot_0x90(handler, 1, params_slot1, 1)                                   @0x247356
  const slot1 = self.params.subarray(4, 8);
  vt.vslot_0x90(handler, 1, slot1, 1);
  // vslot_0xc0(handler, handler)                                              @0x247365
  vt.vslot_0xc0(handler, handler);
  return 0;                                                                    // @0x24736b
}
