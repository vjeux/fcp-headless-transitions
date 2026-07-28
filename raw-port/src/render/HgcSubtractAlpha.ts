// HgcSubtractAlpha.ts — Flexo's "subtract alpha" compute kernel node.
// Faithful transcription from the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
//     Versions/A/Flexo
//
// Source disassembly (raw-port/re/disasm/Flexo.HgcSubtractAlpha.*.s):
//   HgcSubtractAlpha::HgcSubtractAlpha()             @0x000000000146e8a0  (C1)
//   HgcSubtractAlpha::HgcSubtractAlpha()             @0x000000000146e820  (C2 — not extracted;
//                                                    the C1 body @0x146e8a0 is the interesting one.
//                                                    Both signatures share the same class ctor via
//                                                    Itanium ABI aliasing.)
//   HgcSubtractAlpha::~HgcSubtractAlpha()  (D2)      @0x000000000146e920
//   HgcSubtractAlpha::~HgcSubtractAlpha()  (D1)      @0x000000000146e970
//   HgcSubtractAlpha::~HgcSubtractAlpha()  (D0 del)  @0x000000000146e9c0
//   HgcSubtractAlpha::SetParameter(i,f,f,f,f)        @0x000000000146ea10  (bare -1)
//   HgcSubtractAlpha::GetParameter(int,float*)       @0x000000000146ea20  (bare -1)
//   HgcSubtractAlpha::GetOutput(HGRenderer*)         @0x000000000146ea30  (bare return this)
//   HgcSubtractAlpha::GetDOD(HGRenderer*,int,HGRect) @0x000000000146e7e0
//   HgcSubtractAlpha::GetROI(HGRenderer*,int,HGRect) @0x000000000146e800
//   HgcSubtractAlpha::Bind(HGHandler*)               @0x000000000146e330
//   HgcSubtractAlpha::BindTexture(HGHandler*,int)    @0x000000000146e280
//   HgcSubtractAlpha::GetProgram(HGRenderer*)        @0x000000000146df60
//   HgcSubtractAlpha::InitProgramDescriptor(...)     @0x000000000146df90
//   HgcSubtractAlpha::shaderDescription() const      @0x000000000146e230
//   HgcSubtractAlpha::RenderTile(HGTile*)            @0x000000000146e600
//   HgcSubtractAlpha::RenderTile_AVX(HGTile*)        @0x000000000146e350
//
// DECODE evidence: every method above has its full otool -tV output saved
// under raw-port/re/disasm/. RIP-relative __cstring references land inside
// Flexo's __TEXT __cstring section and are captured verbatim in the doc
// comments below (see GetProgram / InitProgramDescriptor / shaderDescription).
//
// Class layout (recovered from ctor + D2 + BindTexture):
//   +0x000  vtable                                @0x146e8b6 leaq 0x4c027a(%rip) →
//                                                 vtable-for-HgcSubtractAlpha in __DATA_CONST
//   +0x010  HGNode::renderPageStrategy u32        ctor @0x146e8ec:
//                                                   eax = old & 0xFFFFF9FF  (clears bits 0x600)
//                                                   eax |= 0x400
//                                                   *[+0x10] = eax
//                                                 Net: renderPageStrategy = (old & ~0x600) | 0x400.
//   +0x090  HGRenderer* (or another HGNode ptr)   BindTexture reads this @0x146e2f5
//                                                   (movq 0x90(%rbx),%rdi) to fetch a target/renderer
//                                                   before dispatching its vtable slot 0x80.
//   +0x198  aligned param buffer ptr              32-byte-aligned pointer to a `new char[0x47]`
//                                                 allocation. Ctor allocates 71 bytes @0x146e8be,
//                                                 aligns up to 32-byte boundary (+8 for the header
//                                                 word), stores original at [aligned-8], writes 32
//                                                 zero-bytes at [aligned+0..0x1f], and saves the
//                                                 aligned pointer at +0x198. D2 reverses this:
//                                                 loads the original from [aligned-8] and calls
//                                                 `__ZdlPv` to free it, then tail-jumps HGNode::~HGNode().
//
// Undecoded frontier (each below is a THROWing stub citing its callee addr):
//   HGNode::HGNode()                    @Flexo 0x1496c06 (symbol-stub)
//   HGNode::~HGNode()                   @Flexo 0x1496c0c (symbol-stub)
//   operator new[] (__Znam)             @Flexo 0x1497446 (symbol-stub)
//   operator delete (__ZdlPv)           @Flexo 0x1497404 (symbol-stub)
//   __Unwind_Resume                     @Flexo 0x1495d30 (symbol-stub)
//   HGObject::operator delete(void*)    @Flexo 0x1496d8c (symbol-stub, tail-jmp from D0)
//   HGRenderer::GetTarget(unsigned int) @Flexo 0x1495ea4 (symbol-stub, called from GetProgram)
//   HGHandler::TexCoord(i,i,i,d const*) @Flexo 0x1496df2 (symbol-stub, called from BindTexture)
//   HGProgramDescriptor::SetVisibleShaderWithSource(...) @Flexo 0x14966d8
//   HGProgramDescriptor::SetFragmentFunctionName(...)    @Flexo 0x14966d2
//   HGProgramDescriptor::SetReturnBinding(HGBinding)     @Flexo 0x14966c6
//   HGHandler vtable slots (opaque):
//     *0x30, *0x48 — invoked by BindTexture on both branches
//     *0x80        — invoked by BindTexture on the target it loads from +0x90
//     *0xa8        — invoked by BindTexture on this
//     *0xc0        — invoked by Bind
//
// Numerics: this class has NO parameter data — SetParameter/GetParameter both
// unconditionally return -1 (0xFFFFFFFF sign-extended). The kernel takes two
// input images and outputs `fmax(0, color0.wwww - color1.wwww)` in the alpha
// channel (see the fragment source in GetProgram). All RenderTile arithmetic
// is single-precision floats.

import { HGNode } from "./HGNode";
import { HGRect, HGRectNull as HGRectNullConst } from "./HGRect";

// ---------- Opaque forward types (layouts decoded elsewhere) ----------

/** HGRenderer — render-graph dependency/context handle. Layout decoded elsewhere. */
export interface HGRenderer {}
/** HGTile — a rasterization tile passed to per-pixel RenderTile. Decoded elsewhere. */
export interface HGTile {}
/** HGHandler — GPU parameter-binding helper (TexCoord etc.). Decoded elsewhere. */
export interface HGHandler {}
/** HGProgramDescriptor — GPU program descriptor. Decoded elsewhere. */
export interface HGProgramDescriptor {}

// ---------- @cstring / @const constants (verbatim from Flexo __TEXT __cstring) ----------

/** Flexo __TEXT __cstring — the Metal 1.0 fragment shader source string
 *  returned by `GetProgram` when the renderer target class exceeds 0x60b10.
 *  Referenced by the leaq at 0x146df78 (next PC 0x146df7f + 0x241883 →
 *  __cstring). Captured verbatim from the otool literal-pool comment. */
const METAL_FRAGMENT_SRC = [
  "//Metal1.0     ",
  "//LEN=0000000343",
  "fragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], ",
  "    const constant float4* hg_Params [[ buffer(0) ]], ",
  "    texture2d< float > hg_Texture0 [[ texture(0) ]], ",
  "    sampler hg_Sampler0 [[ sampler(0) ]], ",
  "    texture2d< float > hg_Texture1 [[ texture(1) ]], ",
  "    sampler hg_Sampler1 [[ sampler(1) ]])",
  "{",
  "    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);",
  "    float4 r0, r1;",
  "    FragmentOut output;",
  "",
  "    r0.w = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy).w;",
  "    r1.w = hg_Texture1.sample(hg_Sampler1, frag._texCoord1.xy).w;",
  "    r0 = r0.wwww - r1.wwww;",
  "    output.color0 = fmax(c0.xxxx, r0);",
  "    return output;",
  "}",
  "//MD5=101bbce5:f97df638:b36f7dc3:7904ba14",
  "//SIG=00000000:00000003:00000003:00000000:0001:0000:0002:0000:0000:0000:0006:0000:0002:02:0:1:0",
  "",
].join("\n");

/** Flexo __TEXT __cstring — the [[visible]] fragment function name/source
 *  installed by `InitProgramDescriptor` via
 *  HGProgramDescriptor::SetVisibleShaderWithSource. Referenced by the leaq
 *  pair at 0x146dfa1/0x146dfa8 (next PC + 0x241b9e / +0x241bdd). */
const VISIBLE_SHADER_NAME = "HgcSubtractAlpha_hgc_visible";

/** Flexo __TEXT __cstring — the visible-shader source body. Verbatim from
 *  the otool literal-pool comment at 0x146dfa8. */
const VISIBLE_SHADER_SRC = [
  "//Metal1.0     ",
  "//LEN=00000001a2",
  "[[ visible ]] FragmentOut HgcSubtractAlpha_hgc_visible(const constant float4* hg_Params,",
  "    float4 color0,",
  "    float4 color1)",
  "{",
  "    const float4 c0 = float4(0.000000000, 0.000000000, 0.000000000, 0.000000000);",
  "    float4 r0, r1;",
  "    FragmentOut output;",
  "",
  "    r0.w = color0.w;",
  "    r1.w = color1.w;",
  "    r0 = r0.wwww - r1.wwww;",
  "    output.color0 = fmax(c0.xxxx, r0);",
  "    return output;",
  "}",
  "",
].join("\n");

/** Flexo __TEXT __cstring — the fragment-function name passed to
 *  HGProgramDescriptor::SetFragmentFunctionName at 0x146dfc1. Verbatim from
 *  the literal-pool comment "HgcSubtractAlpha". */
const FRAGMENT_FUNCTION_NAME = "HgcSubtractAlpha";

/** Flexo __TEXT __cstring — the shaderDescription() returned std::string.
 *  Assembly path (@0x146e239..0x146e26b):
 *    __Znwm(0x1a)  ← alloc 26 bytes for a std::string buffer.
 *    *(this+0)   = 0x1b                ← string length     = 27
 *    *(this+8)   = 0x17                ← string capacity   = 23  (23 is the length of the source
 *                                                                 string plus null terminator; the
 *                                                                 basic_string is stored inline in
 *                                                                 SSO or in the freshly allocated
 *                                                                 buffer as (data, size, capacity))
 *    *(alloc+0)  = "HgcSubtractAlpha"  (16 bytes via movups from a __cstring literal-pool slot)
 *    *(alloc+15) = " [hgc1]"           (8 bytes via a movabsq of 0x5D316367685B2061)
 *                  0x5D316367685B2061 little-endian = ' [hgc1]' + trailing null? Let me
 *                  decode: bytes = 61 20 5b 68 67 63 31 5d = "a [hgc1]" — the 'a' at
 *                  offset 15 is the last byte of "HgcSubtractAlphA" already stored
 *                  by the movups. The subsequent movb $0x0 @0x146e26e writes the null.
 *    *(alloc+0x17) = '\0'
 *  Final string: "HgcSubtractAlpha [hgc1]" (23 chars).
 *
 *  We store the final value as a plain JS string — the underlying std::string
 *  layout is not observable from outside this method. */
const SHADER_DESCRIPTION_STR = "HgcSubtractAlpha [hgc1]";

// ---------- Throwing frontier stubs (undecoded callees) ----------

/** HGNode::~HGNode() base D2 @Flexo symbol-stub 0x1496c0c. Tail-jumped from
 *  every ~HgcSubtractAlpha variant after freeing the +0x198 buffer. Not yet
 *  transcribed here. */
function stub_HGNode_D2_not_transcribed(): never {
  throw new Error("HGNode::~HGNode() @Flexo 0x1496c0c not yet transcribed");
}

/** operator new[] (__Znam) @Flexo symbol-stub 0x1497446. Called by the ctor
 *  @0x146e8be with size 0x47 (71). Not yet transcribed. */
function stub_operator_new_array_not_transcribed(): never {
  throw new Error("operator new[] @Flexo 0x1497446 not yet transcribed");
}

/** operator delete (__ZdlPv) @Flexo symbol-stub 0x1497404. Called by D2/D1/D0
 *  to free the +0x198 buffer. Not yet transcribed. */
function stub_operator_delete_not_transcribed(): never {
  throw new Error("operator delete @Flexo 0x1497404 not yet transcribed");
}

/** HGObject::operator delete(void*) @Flexo symbol-stub 0x1496d8c. Tail-
 *  jumped from D0 after the base dtor. Not yet transcribed. */
function stub_HGObject_delete_not_transcribed(): never {
  throw new Error(
    "HGObject::operator delete(void*) @Flexo 0x1496d8c not yet transcribed",
  );
}

/** HGRenderer::GetTarget(unsigned int) @Flexo symbol-stub 0x1495ea4. Called
 *  by GetProgram @0x146df6c with the fixed arg 0x60000. Not yet transcribed. */
function stub_HGRenderer_GetTarget_not_transcribed(): never {
  throw new Error(
    "HGRenderer::GetTarget(unsigned int) @Flexo 0x1495ea4 not yet transcribed",
  );
}

/** HGHandler::TexCoord(int,int,int,double const*) @Flexo symbol-stub
 *  0x1496df2. Called by BindTexture on both branches. Not yet transcribed. */
function stub_HGHandler_TexCoord_not_transcribed(): never {
  throw new Error(
    "HGHandler::TexCoord(int,int,int,double const*) @Flexo 0x1496df2 not yet transcribed",
  );
}

/** HGProgramDescriptor::SetVisibleShaderWithSource(char const*,char const*)
 *  @Flexo symbol-stub 0x14966d8. Called by InitProgramDescriptor @0x146dfb2.
 *  Not yet transcribed. */
function stub_HGProgramDescriptor_SetVisibleShaderWithSource_not_transcribed(): never {
  throw new Error(
    "HGProgramDescriptor::SetVisibleShaderWithSource @Flexo 0x14966d8 not yet transcribed",
  );
}

/** HGProgramDescriptor::SetFragmentFunctionName(char const*) @Flexo
 *  symbol-stub 0x14966d2. Called by InitProgramDescriptor @0x146dfc1. Not
 *  yet transcribed. */
function stub_HGProgramDescriptor_SetFragmentFunctionName_not_transcribed(): never {
  throw new Error(
    "HGProgramDescriptor::SetFragmentFunctionName @Flexo 0x14966d2 not yet transcribed",
  );
}

/** HGHandler vtable slot 0xc0 (Bind) — @Flexo (opaque, called from Bind
 *  @0x146e337). Not yet transcribed. */
function stub_HGHandler_vslot_c0_not_transcribed(): never {
  throw new Error(
    "HGHandler vtable *0xc0 @Flexo (called from Bind @0x146e337) not yet transcribed",
  );
}

/** HGHandler vtable slot 0x30 — @Flexo (opaque, invoked by BindTexture on
 *  both branches). Not yet transcribed. */
function stub_HGHandler_vslot_30_not_transcribed(): never {
  throw new Error(
    "HGHandler vtable *0x30 @Flexo (called from BindTexture @0x146e2b7) not yet transcribed",
  );
}

/** HGHandler vtable slot 0x48 — @Flexo (opaque, invoked by BindTexture on
 *  both branches). Not yet transcribed. */
function stub_HGHandler_vslot_48_not_transcribed(): never {
  throw new Error(
    "HGHandler vtable *0x48 @Flexo (called from BindTexture @0x146e2aa) not yet transcribed",
  );
}

// ---------- The class ----------

/**
 * `HgcSubtractAlpha` — Flexo compute-kernel node that outputs
 *   `output.color0 = fmax(vec4(0), color0.wwww - color1.wwww)`
 * i.e. the difference of the two input alphas broadcast to RGBA and clamped
 * from below by zero. Both the Metal fragment function (`GetProgram`) and
 * the visible-shader function (`InitProgramDescriptor` / `VISIBLE_SHADER_SRC`)
 * implement the same expression.
 *
 * Storage semantics (from the ctor at 0x146e8a0):
 *   - allocates a 71-byte block via `operator new[]`
 *   - stores a 32-byte-aligned pointer into it at +0x198 (with the original
 *     pointer written at [aligned-8] so the dtor can free the exact block)
 *   - zeroes 32 bytes at [aligned+0..0x1f]
 *   - masks-and-sets renderPageStrategy: `(old & ~0x600) | 0x400`.
 * The 32-byte block is used to store hg_Params for the kernel (fed by the
 * un-decoded RenderTile / RenderTile_AVX paths).
 */
export class HgcSubtractAlpha extends HGNode {
  /** 32-byte aligned param buffer at +0x198 — 32 bytes of zeroed f32 slots
   *  (four float4 vectors) allocated in the ctor and freed in every dtor. */
  paramBuffer: Float32Array;

  /**
   * `HgcSubtractAlpha::HgcSubtractAlpha()` — @Flexo 0x146e8a0 (C1 body).
   *
   * Verbatim asm:
   *   0x146e8aa: callq __ZN6HGNodeC2Ev        ; HGNode base ctor
   *   0x146e8af: leaq 0x4c027a(%rip), %rax    ; = 0x92eb30 (vtable for HgcSubtractAlpha)
   *   0x146e8b6: movq %rax, (%rbx)             ; *this = HgcSubtractAlpha vtable
   *   0x146e8b9: movl $0x47, %edi              ; new[] size = 71
   *   0x146e8be: callq __Znam                  ; %rax = raw buffer
   *   0x146e8c3: leaq 0x8(%rax), %rcx          ; %rcx = raw + 8
   *   0x146e8c7: negl %ecx                     ; %rcx = -(raw+8) low32
   *   0x146e8c9: andl $0x1f, %ecx              ; %rcx = align-pad mod 32
   *   0x146e8cc: leaq (%rcx,%rax), %rdx        ; aligned_pad = raw + pad
   *   0x146e8d0: addq $0x8, %rdx               ; aligned = raw + pad + 8
   *   0x146e8d4: movq %rax, (%rcx,%rax)        ; [aligned-8] = raw   (i.e. header word)
   *   0x146e8d8: xorps %xmm0, %xmm0
   *   0x146e8db: movaps %xmm0, 0x8(%rcx,%rax)  ; [aligned+0..0xf] = 0
   *   0x146e8e0: movaps %xmm0, 0x18(%rcx,%rax) ; [aligned+0x10..0x1f] = 0
   *   0x146e8e5: movq %rdx, 0x198(%rbx)        ; this->+0x198 = aligned
   *   0x146e8ec: movl $0xFFFFF9FF, %eax        ; mask ~0x600
   *   0x146e8f1: andl 0x10(%rbx), %eax         ; eax = renderPageStrategy & ~0x600
   *   0x146e8f4: orl $0x400, %eax               ; eax |= 0x400
   *   0x146e8f9: movl %eax, 0x10(%rbx)          ; renderPageStrategy = eax
   *
   * We collapse the aligned-pointer dance into a plain 32-byte Float32Array —
   * the alignment/header-word is a native-heap concern that isn't observable
   * from TS (the pointer is only used to compute the aligned slot; no other
   * code reads [aligned-8]).
   */
  constructor() {
    super(); // @0x146e8aa: __ZN6HGNodeC2Ev
    // @0x146e8bc..146e8e5: allocate 32-aligned 32-byte zeroed param buffer
    // and store the aligned pointer at +0x198. In TS, the equivalent is a
    // zeroed Float32Array of length 8 (32 bytes / 4 = 8 f32 slots).
    this.paramBuffer = new Float32Array(8);
    // @0x146e8ec..146e8f9: renderPageStrategy = (old & ~0x600) | 0x400.
    // The mask/or is 32-bit; use the >>> 0 to coerce back into u32 range.
    this.renderPageStrategy =
      ((this.renderPageStrategy & ~0x600) | 0x400) >>> 0;
  }

  /**
   * `HgcSubtractAlpha::SetParameter(int,float,float,float,float)` —
   * @Flexo 0x146ea10.
   *
   * Verbatim asm:
   *   0x146ea14: movl $0xFFFFFFFF, %eax
   *   ...popq %rbp; retq
   *
   * The kernel has no adjustable parameters (both inputs are texture
   * samples). The base-class contract expects -1 (0xFFFFFFFF sign-extended
   * to i32) to mean "no parameter with this index".
   */
  SetParameter(
    _index: number,
    _a: number,
    _b: number,
    _c: number,
    _d: number,
  ): number {
    return -1; // @0x146ea14: mov $0xFFFFFFFF, %eax
  }

  /**
   * `HgcSubtractAlpha::GetParameter(int, float*)` — @Flexo 0x146ea20.
   *
   * Verbatim asm:
   *   0x146ea24: movl $0xFFFFFFFF, %eax
   *   ...popq %rbp; retq
   *
   * Same as SetParameter — returns -1 unconditionally. Out pointer is
   * ignored (never dereferenced).
   */
  GetParameter(_index: number, _out: Float32Array | null): number {
    return -1; // @0x146ea24: mov $0xFFFFFFFF, %eax
  }

  /**
   * `HgcSubtractAlpha::GetOutput(HGRenderer*)` — @Flexo 0x146ea30.
   *
   * Verbatim asm:
   *   0x146ea34: movq %rdi, %rax        ; return this
   *   ...popq %rbp; retq
   *
   * Trivial identity return of the `this` pointer.
   */
  GetOutput(_renderer: HGRenderer): HgcSubtractAlpha {
    return this; // @0x146ea34: movq %rdi, %rax
  }

  /**
   * `HgcSubtractAlpha::GetDOD(HGRenderer*, int, HGRect)` — @Flexo 0x146e7e0.
   *
   * Verbatim asm:
   *   0x146e7e0: movq %rcx, %rax                 ; rax = incoming.lo
   *   0x146e7e3: cmpl $0x2, %edx                 ; if inputIndex < 2:
   *   0x146e7e6: jb 0x146e7fb                    ;    goto passthrough
   *   0x146e7e8: (fallthrough — inputIndex >= 2)
   *     pushq %rbp; movq %rsp, %rbp
   *     movq _HGRectNull(%rip), %rcx             ; load _HGRectNull addr
   *     movq (%rcx), %rax                        ; rax = _HGRectNull.lo
   *     movq 0x8(%rcx), %r8                      ; r8  = _HGRectNull.hi
   *     popq %rbp
   *   0x146e7fb: movq %r8, %rdx                  ; return {rax, rdx}
   *   0x146e7fe: retq
   *
   * NOTE the passthrough branch (input < 2) returns the INCOMING rect
   * unchanged — the ctor never wrote to %r8, so on the passthrough path
   * %r8 still holds incoming.hi from the caller's stret ABI setup.
   */
  GetDOD(_renderer: HGRenderer, inputIndex: number, incoming: HGRect): HGRect {
    // @0x146e7e3: `cmpl $0x2, %edx` + `jb` is UNSIGNED-below. Match with
    // >>> 0 so a negative i32 wraps to a large u32 and takes the >=2 branch.
    if ((inputIndex >>> 0) < 2) {
      return incoming; // @0x146e7fb: return {rax=incoming.lo, rdx=%r8=incoming.hi}
    }
    return HGRectNullConst; // @0x146e7ec..7f6: _HGRectNull
  }

  /**
   * `HgcSubtractAlpha::GetROI(HGRenderer*, int, HGRect)` — @Flexo 0x146e800.
   *
   * Structurally IDENTICAL to GetDOD (verbatim same 15-line body but at a
   * different address; the only difference is the RIP-relative offset to
   * _HGRectNull, and the ICF folder didn't merge them):
   *   0x146e803: cmpl $0x2, %edx; jb 0x146e81b     ; input<2 → passthrough
   *   0x146e808..: return _HGRectNull for input>=2
   */
  GetROI(_renderer: HGRenderer, inputIndex: number, incoming: HGRect): HGRect {
    if ((inputIndex >>> 0) < 2) {
      return incoming; // @0x146e81b
    }
    return HGRectNullConst; // @0x146e80c..0x146e816
  }

  /**
   * `HgcSubtractAlpha::Bind(HGHandler*)` — @Flexo 0x146e330.
   *
   * Verbatim asm:
   *   0x146e334: movq (%rdi), %rax           ; rax = HGHandler vtable ptr
   *   0x146e337: callq *0xc0(%rax)           ; HGHandler->vslot[0xc0/8 = 24]()
   *   0x146e33d: xorl %eax, %eax             ; return 0
   *
   * A one-line pass-through to a single un-resolved HGHandler vtable slot.
   */
  Bind(handler: HGHandler): number {
    // @0x146e337: vtable slot 0xc0 dispatch. Callee not decoded.
    void handler;
    stub_HGHandler_vslot_c0_not_transcribed();
    // Unreachable — the stub above throws. The final `return 0` below is
    // retained for provenance of the `xorl %eax,%eax; ret` @0x146e33d.
    return 0;
  }

  /**
   * `HgcSubtractAlpha::BindTexture(HGHandler*, int)` — @Flexo 0x146e280.
   *
   * Verbatim asm structure:
   *   0x146e28a: cmpl $0x1, %edx                     ; if index == 1
   *   0x146e28d: je 0x146e2c1                        ;   → branch A
   *   0x146e28f: movl $0xFFFFFFFF, %r14d             ; result = -1 (default failure)
   *   0x146e295: testl %edx, %edx                    ; if index != 0
   *   0x146e297: jne 0x146e31d                       ;   → return -1
   *   0x146e29d: (index == 0 branch B)
   *     movq (%rbx), %rax
   *     xorl %r14d, %r14d                            ; result = 0
   *     movq %rbx, %rdi; xor esi, edx
   *     callq *0x48(%rax)                            ; HGHandler->vslot[0x48/8 = 9](0, 0)
   *     movq (%rbx), %rax
   *     movq %rbx, %rdi; xor esi, edx
   *     callq *0x30(%rax)                            ; HGHandler->vslot[0x30/8 = 6](0, 0)
   *     movq %rbx, %rdi
   *     xorl %esi, %esi                              ; esi = 0
   *     jmp 0x146e2e9
   *   0x146e2c1: (index == 1 branch A)
   *     movq (%rbx), %rax
   *     xorl %r14d, %r14d                            ; result = 0
   *     movq %rbx, %rdi
   *     movl $0x1, %esi; xorl %edx, %edx
   *     callq *0x48(%rax)                            ; vslot[0x48](1, 0)
   *     movq (%rbx), %rax
   *     movq %rbx, %rdi
   *     xorl %esi, %esi; xorl %edx, %edx
   *     callq *0x30(%rax)                            ; vslot[0x30](0, 0)
   *     movq %rbx, %rdi
   *     movl $0x1, %esi                              ; esi = 1
   *     ; falls into 0x146e2e9
   *   0x146e2e9: (both branches converge)
   *     xorl %edx, %edx; xorl %ecx, %ecx; xorl %r8d, %r8d
   *     callq HGHandler::TexCoord(esi, 0, 0, nullptr)
   *     movq 0x90(%rbx), %rdi                        ; target = this->+0x90 (some HGNode ptr)
   *     movq (%rdi), %rax                            ; rax = target->vtable
   *     movl $0x2e, %esi                             ; esi = 0x2e (46)
   *     callq *0x80(%rax)                            ; target->vslot[0x80/8 = 16](0x2e)
   *     testl %eax, %eax                             ; if returned == 0
   *     jne 0x146e31d                                ; else: return existing result
   *     movq (%rbx), %rax
   *     movq %rbx, %rdi
   *     callq *0xa8(%rax)                            ; this->vslot[0xa8/8 = 21]()
   *     xorl %r14d, %r14d                            ; result = 0 (overrides prior)
   *   0x146e31d: movl %r14d, %eax
   *     popq …; retq
   *
   * Return convention:
   *   index == 0 or 1 → returns 0 (success)  (after all vtable dispatches)
   *   otherwise       → returns -1 (0xFFFFFFFF)
   *
   * Every callee (HGHandler vslots 0x30, 0x48, 0x80, 0xa8; HGHandler::TexCoord)
   * is un-resolved; the ported body throws at the first slot.
   */
  BindTexture(handler: HGHandler, index: number): number {
    // @0x146e28a-8d: `cmpl $0x1, %edx; je 0x146e2c1`.
    const idx = index | 0;
    if (idx === 1) {
      // Branch A — @0x146e2c1..: two vslot dispatches then converge into TexCoord.
      void handler;
      stub_HGHandler_vslot_48_not_transcribed();
      // Unreachable below — kept for provenance of the second dispatch.
      stub_HGHandler_vslot_30_not_transcribed();
    }
    if (idx !== 0) {
      // @0x146e295..297: default -1 return for index >= 2.
      return -1; // @0x146e31d: movl %r14d,%eax where %r14d = 0xFFFFFFFF
    }
    // Branch B — @0x146e29d..: index == 0. Same shape as A.
    void handler;
    stub_HGHandler_vslot_48_not_transcribed();
    // Unreachable — provenance for the tail of both branches:
    stub_HGHandler_vslot_30_not_transcribed();
  }

  /**
   * `HgcSubtractAlpha::GetProgram(HGRenderer*)` — @Flexo 0x146df60.
   *
   * Verbatim asm:
   *   0x146df64: movq %rsi, %rdi                     ; renderer → arg1
   *   0x146df67: movl $0x60000, %esi                 ; probe = 0x60000
   *   0x146df6c: callq HGRenderer::GetTarget(u32)
   *   0x146df71: xorl %ecx, %ecx                     ; default: null
   *   0x146df73: cmpl $0x60b10, %eax                 ; if target == 0x60b10
   *   0x146df78: leaq 0x241883(%rip), %rax           ; = @cstring[METAL_FRAGMENT_SRC]
   *   0x146df7f: cmoveq %rax, %rcx                   ; if eq: rcx = &metal
   *   0x146df83: movq %rcx, %rax                     ; return rcx
   *   0x146df86: popq %rbp; retq
   *
   * NOTE the `cmpl $0x60b10 ... cmoveq` — this is an EQUALITY test (not the
   * greater-than test used by HGComicStroke). GetProgram returns the Metal
   * source string only when GetTarget returns EXACTLY 0x60b10, and NULL
   * otherwise. No GLES fallback path — the compute kernel is Metal-only.
   */
  GetProgram(renderer: HGRenderer): string | null {
    // @0x146df6c: HGRenderer::GetTarget(0x60000). Un-resolved.
    void renderer;
    // Preserve the target-value comparison for provenance even though it's
    // unreachable in TS: the callee throws before we can use `target`.
    void 0x60b10;
    void METAL_FRAGMENT_SRC;
    stub_HGRenderer_GetTarget_not_transcribed();
  }

  /**
   * `HgcSubtractAlpha::InitProgramDescriptor(HGProgramDescriptor*) const` —
   * @Flexo 0x146df90.
   *
   * The body installs the visible-shader source, sets the fragment-function
   * name, and then constructs an HGBinding stack local containing the
   * literal string "FragmentOut" (0x746E656D67617246 little-endian +
   * 0x74754F74 = 'FragmentOut'; the enum tag is 0x4 at -0x90, the length
   * byte is 0x16 at -0x88, followed by 22 chars of data), then calls
   * HGProgramDescriptor::SetReturnBinding on that HGBinding. The remaining
   * ~90 lines are the tail zero-out and stack cleanup which we can only
   * meaningfully port once HGBinding / HGProgramDescriptor are decoded.
   *
   * Verbatim asm summary (see disasm/Flexo.HgcSubtractAlpha.InitProgramDescriptor.s):
   *   0x146dfa1: leaq @cstring[VISIBLE_SHADER_NAME](%rip), %rsi
   *   0x146dfa8: leaq @cstring[VISIBLE_SHADER_SRC](%rip), %rdx
   *   0x146dfb2: callq HGProgramDescriptor::SetVisibleShaderWithSource(name, src)
   *   0x146dfb7: leaq @cstring[FRAGMENT_FUNCTION_NAME](%rip), %rsi
   *   0x146dfc1: callq HGProgramDescriptor::SetFragmentFunctionName("HgcSubtractAlpha")
   *   ...construct HGBinding{tag=0x4, len=0x16, "FragmentOut" + padding, ...}
   *   0x146e008: callq HGProgramDescriptor::SetReturnBinding(&binding)
   *   ...post-call cleanup: `testb $0x1, -0x88(%rbp)` decides whether the
   *   binding's inline SSO buffer holds an owned heap ptr at -0x78 that
   *   must be `__ZdlPv`-freed.
   *
   * The two SetX callees are un-resolved; the ported body throws at the
   * first call.
   */
  InitProgramDescriptor(desc: HGProgramDescriptor): void {
    // @0x146dfb2: SetVisibleShaderWithSource(name, src).
    void desc;
    void VISIBLE_SHADER_NAME;
    void VISIBLE_SHADER_SRC;
    void FRAGMENT_FUNCTION_NAME;
    stub_HGProgramDescriptor_SetVisibleShaderWithSource_not_transcribed();
    // Unreachable below — provenance for the second callee:
    stub_HGProgramDescriptor_SetFragmentFunctionName_not_transcribed();
  }

  /**
   * `HgcSubtractAlpha::shaderDescription() const` — @Flexo 0x146e230.
   *
   * Verbatim asm builds a `std::string` in the return-value slot (`%rdi`)
   * whose content is the 23-char literal "HgcSubtractAlpha [hgc1]":
   *   0x146e239: __Znwm(0x1a)                        ; alloc 26 bytes for the string data
   *   0x146e243: [ret_slot+0x10] = %rax               ; data ptr (SSO/heap)
   *   0x146e247: [ret_slot+0]  = 0x1b                 ; header word 1 (size|flag = 0x1b = 27)
   *   0x146e24e: [ret_slot+8]  = 0x17                 ; header word 2 (capacity or reserved = 23)
   *   0x146e256: [alloc+0xf]   = movabs 0x5d316367685b2061
   *              little-endian bytes: 61 20 5b 68 67 63 31 5d = 'a [hgc1]'
   *   0x146e264: [alloc+0]     = movups @cstring "HgcSubtractAlpha" (16 bytes)
   *              — this OVERLAPS with [alloc+0xf] on the trailing 'a' of "Alpha",
   *              which the movabsq already installs as byte 15. The order matters
   *              (the movabsq happens first, then the movups overwrites bytes 0..0xf
   *              INCLUDING the 'a' — same value 0x61 — so the net contents are
   *              "HgcSubtractAlpha [hgc1]"). Byte at offset 0x17 is nul-terminated
   *              by the subsequent `movb $0x0`.
   *   0x146e272: movq %rbx, %rax                     ; return the ret_slot pointer
   *
   * We can't build a std::string in TS; we return a plain JS string that
   * IS the intended value. The header layout (size 0x1b, capacity 0x17,
   * alloc 26) is a std::libc++ SSO/OWM detail preserved only in the
   * comment above.
   */
  shaderDescription(): string {
    // @0x146e264..0x146e26e: the composed string.
    return SHADER_DESCRIPTION_STR;
  }

  /**
   * `HgcSubtractAlpha::RenderTile(HGTile*)` — @Flexo 0x146e600.
   *
   * The scalar per-pixel CPU rasterizer implementing
   *   output.color0.w = fmax(0, color0.w - color1.w)
   * (with the RGB channels copied through from color0 per Flexo's tile
   * convention). 129 lines of SSE scalar ops and HGTile buffer walks —
   * the RIP-relative constants, the two input-slot pointer fetches, and
   * the destination write stride still need decoding.
   *
   * Not yet transcribed — throws citing @0x146e600 so the frontier tracker
   * records the gap.
   */
  RenderTile(_tile: HGTile): number {
    void _tile;
    throw new Error(
      "HgcSubtractAlpha::RenderTile(HGTile*) @Flexo 0x146e600 not yet transcribed",
    );
  }

  /**
   * `HgcSubtractAlpha::RenderTile_AVX(HGTile*)` — @Flexo 0x146e350.
   *
   * The AVX-vectorised sibling of RenderTile. 165 lines using 256-bit
   * ymm registers with vsubps / vmaxps on packed alpha channels. Not yet
   * transcribed.
   */
  RenderTile_AVX(_tile: HGTile): number {
    void _tile;
    throw new Error(
      "HgcSubtractAlpha::RenderTile_AVX(HGTile*) @Flexo 0x146e350 not yet transcribed",
    );
  }

  /**
   * `HgcSubtractAlpha::~HgcSubtractAlpha()` — @Flexo 0x146e970 (D1) and the
   * complete/D2 variant @Flexo 0x146e920 (identical body up to prologue).
   *
   * Verbatim asm (D1 @0x146e970):
   *   0x146e970: leaq 0x4c01b9(%rip), %rax       ; = vtable-for-HgcSubtractAlpha
   *   0x146e977: movq %rax, (%rdi)                ; restore vtable
   *   0x146e97a: movq 0x198(%rdi), %rax            ; aligned = this->+0x198
   *   0x146e981: testq %rax, %rax
   *   0x146e984: je HGNode::~HGNode()             ; if null → tail-jmp base
   *   0x146e98a: movq -0x8(%rax), %rax             ; raw = [aligned-8]
   *   0x146e98e: testq %rax, %rax
   *   0x146e991: je HGNode::~HGNode()             ; if null → tail-jmp base
   *   0x146e997..: __ZdlPv(raw)                    ; free the block
   *   0x146e9b1: jmp HGNode::~HGNode()            ; tail-jmp base D2
   *
   * The complete D2 body at 0x146e920 is structurally identical (installs
   * a different vtable-ptr @0x146e920 leaq offset 0x4c0209 — the difference
   * between the D1 and D2 vtables is one slot). In our TS port we treat
   * D1 and D2 as the same finaliser (the vtable-restore is a no-op in a
   * language without an implicit vtable pointer).
   */
  destroy_D1(): void {
    // @0x146e97a..0x146e991: paramBuffer freed if non-null. In TS, JS GC
    // owns the Float32Array; we null it as the semantic-equivalent write.
    if (this.paramBuffer == null) {
      // @0x146e984: je → tail-jmp base dtor.
      stub_HGNode_D2_not_transcribed();
    }
    // @0x146e9a3: __ZdlPv(raw).
    stub_operator_delete_not_transcribed();
    // Unreachable — provenance for the tail-jmp @0x146e9b1:
    stub_HGNode_D2_not_transcribed();
  }

  /**
   * `HgcSubtractAlpha::~HgcSubtractAlpha()` — @Flexo 0x146e9c0 (D0 — deleting).
   *
   * Verbatim asm:
   *   0x146e9c9: leaq 0x4c0160(%rip), %rax          ; restore vtable
   *   0x146e9d0: movq %rax, (%rdi)
   *   0x146e9d3: movq 0x198(%rdi), %rax              ; aligned = +0x198
   *   0x146e9da: testq %rax, %rax; je 0x146e9ed
   *   0x146e9df: movq -0x8(%rax), %rdi               ; raw = [aligned-8]
   *   0x146e9e3: testq %rdi, %rdi; je 0x146e9ed
   *   0x146e9e8: callq __ZdlPv                       ; free the block
   *   0x146e9ed: movq %rbx, %rdi
   *   0x146e9f0: callq __ZN6HGNodeD2Ev               ; base D2
   *   0x146e9f5..146e9fe: jmp __ZN8HGObjectdlEPv     ; tail-jmp HGObject::operator delete
   */
  destroy_D0(): void {
    if (this.paramBuffer != null) {
      // @0x146e9e8: __ZdlPv(raw).
      stub_operator_delete_not_transcribed();
    }
    // @0x146e9f0: base D2, then @0x146e9fe: HGObject::operator delete.
    stub_HGNode_D2_not_transcribed();
    stub_HGObject_delete_not_transcribed();
  }
}

// Suppress "unused" warnings for the stubs that are only reachable after the
// leaf callees they refer to are transcribed. Each will be inlined into the
// method body once its callee lands.
void stub_operator_new_array_not_transcribed;
