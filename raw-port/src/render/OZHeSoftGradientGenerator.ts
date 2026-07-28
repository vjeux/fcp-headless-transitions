// raw-port/src/render/OZHeSoftGradientGenerator.ts
//
// FCP `OZHeSoftGradientGenerator` — Ozone framework subclass of
// `OZHeSoftGradientGeneratorShader` (the compute-shader base). This
// derived class exists purely to install its own vtable at [this+0x0]
// and to override two methods on the render/HGNode surface:
//   - GetDOD (Domain-Of-Definition query for a given input port index)
//   - setDOD (mutator that writes the stored DOD HGRect at this+0x1a0)
// All render/shader machinery (GetProgram, RenderTile, Bind, BindTexture,
// GetParameter, SetParameter, shaderDescription, State) is inherited from
// the base `OZHeSoftGradientGeneratorShader` — those symbols show up as
// vtable entries pointing at the *base* class's addresses (0x6d14e0 etc.).
//
// Source disassembly (Ozone.framework, x86_64 slice; VAs verbatim from
// `otool -tV`):
//   raw-port/re/disasm/OZHeSoftGradientGenerator.OZHeSoftGradientGenerator.s
//   raw-port/re/disasm/OZHeSoftGradientGenerator.~OZHeSoftGradientGenerator.s
//   raw-port/re/disasm/OZHeSoftGradientGenerator.GetDOD.s
//   raw-port/re/disasm/OZHeSoftGradientGenerator.setDOD.s
//   otool -tV -arch x86_64 slice /tmp/Ozone_tV.txt for C2/D1/D2 variants.
//
// Symbols ported (all cited @Ozone VA):
//   0x4daf30  OZHeSoftGradientGenerator::OZHeSoftGradientGenerator()   [C2 base ctor]
//   0x4daf50  OZHeSoftGradientGenerator::OZHeSoftGradientGenerator()   [C1 complete ctor, identical body]
//   0x4daf70  OZHeSoftGradientGenerator::~OZHeSoftGradientGenerator()  [D2 base dtor, tail-jmp Shader::D2]
//   0x4daf80  OZHeSoftGradientGenerator::~OZHeSoftGradientGenerator()  [D1 complete dtor, identical body]
//   0x4daf90  OZHeSoftGradientGenerator::~OZHeSoftGradientGenerator()  [D0 deleting dtor: Shader::D2 + HGObject::operator delete]
//   0x4dafb0  OZHeSoftGradientGenerator::GetDOD(HGRenderer*, int, HGRect)
//   0x4dafe0  OZHeSoftGradientGenerator::setDOD(HGRect const&)
//
// Own-class vtable @Ozone 0x876e18 (installed pointer read from ctors:
//   C2  @0x4daf3e  leaq 0x39bee3(%rip), %rax  ; %rax=0x876e28
//   C1  @0x4daf5e  leaq 0x39bec3(%rip), %rax  ; %rax=0x876e28
// resolve.py Ozone sym 0x876e28 -> "vtable for OZHeSoftGradientGenerator (+0x10)").
// Vtable slots overriding vs inheriting (from `resolve.py Ozone vtable`):
//   *0x00 -> 0x4daf80  ~OZHeSoftGradientGenerator [D1]                (this class)
//   *0x08 -> 0x4daf90  ~OZHeSoftGradientGenerator [D0]                (this class)
//   *0x48 -> 0x6d1720  Shader::shaderDescription() const              (inherited)
//   *0x60 -> 0x6d45a0  Shader::SetParameter(int,f,f,f,f)              (inherited)
//   *0x68 -> 0x6d4eb0  Shader::GetParameter(int, float*)              (inherited)
//   *0xb0 -> 0x6d32f0  Shader::RenderTile(HGTile*)                    (inherited)
//   *0xb8 -> 0x6d14e0  Shader::GetProgram(HGRenderer*)                (inherited)
//   *0xc8 -> 0x6d1770  Shader::Bind(HGHandler*)                       (inherited)
//   *0xd0 -> 0x6d1750  Shader::BindTexture(HGHandler*, int)           (inherited)
// (The GetDOD/setDOD slots are elsewhere in the table but resolve to this
// class's own bodies @0x4dafb0 / @0x4dafe0. Note the base Shader also
// exports GetDOD/GetROI @0x6d3480/0x6d34b0 — this class overrides GetDOD
// with a fixed-DOD, ignore-renderer implementation.)
//
// FRONTIER CALLEES (declared as throwing stubs per PORTING_SPEC rule 3):
//   OZHeSoftGradientGeneratorShader::OZHeSoftGradientGeneratorShader()
//                                    [C2 base ctor] @Ozone C1 callq 0x4daf59 / C2 callq 0x4daf39
//   OZHeSoftGradientGeneratorShader::~OZHeSoftGradientGeneratorShader()
//                                    [D2 base dtor] @Ozone D2 tail-jmp 0x4daf75
//                                                    D1 tail-jmp 0x4daf85
//                                                    D0 callq    0x4daf99
//   HGObject::operator delete(void*) @Ozone D0 tail-jmp stub 0x6def6a
//                                    (resolve.py Ozone sym 0x6def6a -> the
//                                     __stubs entry to HGObject::operator delete)
//
// LAYOUT (inherited from OZHeSoftGradientGeneratorShader; observed offsets):
//   offset 0x000 : void*    vtable (installed @ctor to 0x876e28)
//   offset 0x1a0 : HGRect   dod  (16 bytes; read by GetDOD when idx==0,
//                                 written by setDOD from src argument)
// The 0x1a0 offset is set by the base `Shader` class (this ctor only
// installs the vtable at [this+0x0] on top of what the base ctor built).
//
// DECODE-DON'T-FIT NOTE on GetDOD:
//   The disassembly is a branchless cmov pair that returns two qwords
//   (rax:rdx) i.e. the 16 bytes of an HGRect. Read carefully:
//     rax  = &this[+0x1a0]     ; candidate hi-half base for "idx==0" case
//     rdi  = &this[+0x1a8]     ; candidate lo-half base for "idx==0" case
//                                (this += 0x1a8 clobbers %rdi arg — no
//                                further use of the renderer ptr)
//     rcx  = &_HGRectNull       ; candidate hi-half base for "idx!=0" case
//     rsi  = &_HGRectNull + 8   ; candidate lo-half base for "idx!=0" case
//     testl %edx,%edx           ; idx == 0 ?
//     cmovneq %rcx, %rax        ; if idx!=0: rax = &HGRectNull
//     cmoveq  %rdi, %rsi        ; if idx==0: rsi = &this[+0x1a8]
//     movq (%rsi), %rdx         ; return.hi = *rsi  (bytes +0x08..+0x10 of the chosen rect)
//     movq (%rax), %rax         ; return.lo = *rax  (bytes +0x00..+0x08 of the chosen rect)
//   Net semantics:
//     idx == 0  -> return this.dod              (the HGRect at this+0x1a0)
//     idx != 0  -> return HGRectNull            (the zero rect at &_HGRectNull)
//   The `renderer` (rdi) and `defaultRect` (stack passed HGRect) arguments
//   are both IGNORED by this override. This matches the semantic that a
//   soft-gradient generator has exactly ONE output (idx 0) and no inputs.
//
// setDOD is a raw 128-bit copy (movups; single unaligned SSE) from
// *src into this+0x1a0 — the full HGRect field replaced in one op.
//
// Reused ports (imports only per rule 6):
//   HGRect, HGRectNull — raw-port/src/render/HGRect.ts (covers _HGRectNull
//   @Helium 0x3d2284 data symbol, which Ozone shares via the same struct
//   ABI; the Ozone binary's `movq 0x345d57(%rip), %rcx` @0x4dafc2 loads a
//   pointer-to-HGRectNull whose target has the same {0,0,0,0} bytes).

import { HGRect, HGRectNull } from "./HGRect.js";

/**
 * Opaque handle for `HGRenderer` — Helium's render orchestrator. GetDOD
 * receives one but never dereferences it (see decode note above); left
 * unused here on purpose to mirror the asm.
 */
export type HGRenderer = object;

/**
 * Opaque handle for `HGHandler` — GL/Metal command handler used by the
 * base Shader's Bind/BindTexture. Not touched by this class's own
 * methods; declared for API-shape symmetry only.
 */
export type HGHandler = object;

/**
 * Opaque handle for `HGTile` — a render tile passed to the base
 * Shader's RenderTile. Not touched by this class's own methods.
 */
export type HGTile = object;

/**
 * `OZHeSoftGradientGeneratorShader::OZHeSoftGradientGeneratorShader()`
 * [C2 base-object ctor] — the primary base class's ctor. Called from
 * both this class's ctors:
 *   C2  @Ozone 0x4daf39  callq __ZN31OZHeSoftGradientGeneratorShaderC2Ev
 *   C1  @Ozone 0x4daf59  callq __ZN31OZHeSoftGradientGeneratorShaderC2Ev
 * Its body — including whatever ctor initialises this+0x1a0 (the DOD
 * field) and the shader State — is frontier from this class's slice.
 */
function OZHeSoftGradientGeneratorShader_C2_ctor(
  _self: OZHeSoftGradientGenerator,
): void {
  throw new Error(
    "OZHeSoftGradientGenerator: " +
      "OZHeSoftGradientGeneratorShader::OZHeSoftGradientGeneratorShader() " +
      "[C2] not yet transcribed @Ozone callq sites 0x4daf39, 0x4daf59",
  );
}

/**
 * `OZHeSoftGradientGeneratorShader::~OZHeSoftGradientGeneratorShader()`
 * [D2 base-object dtor]. Chained by all three of this class's dtors:
 *   D2  @Ozone 0x4daf75  jmp   __ZN31OZHeSoftGradientGeneratorShaderD2Ev
 *   D1  @Ozone 0x4daf85  jmp   __ZN31OZHeSoftGradientGeneratorShaderD2Ev
 *   D0  @Ozone 0x4daf99  callq __ZN31OZHeSoftGradientGeneratorShaderD2Ev
 */
function OZHeSoftGradientGeneratorShader_D2_dtor(
  _self: OZHeSoftGradientGenerator,
): void {
  throw new Error(
    "OZHeSoftGradientGenerator: " +
      "OZHeSoftGradientGeneratorShader::~OZHeSoftGradientGeneratorShader() " +
      "[D2] not yet transcribed @Ozone tail-jmp 0x4daf75/0x4daf85, callq 0x4daf99",
  );
}

/**
 * `HGObject::operator delete(void*)` — the HGObject-scoped operator
 * delete (Helium's, forwarded through Ozone's __stubs section).
 * Tail-jmp'd from D0 @Ozone 0x4dafa7 to stub 0x6def6a
 * (resolve.py Ozone sym 0x6def6a -> the __stubs entry).
 */
function HGObject_operator_delete(_p: OZHeSoftGradientGenerator): void {
  throw new Error(
    "OZHeSoftGradientGenerator: HGObject::operator delete(void*) not yet " +
      "transcribed @Ozone D0 tail-jmp 0x4dafa7 (stub 0x6def6a)",
  );
}

/**
 * `OZHeSoftGradientGenerator` — Ozone render node that produces a soft
 * (feathered) gradient image. This class overlays its own vtable on top
 * of the base `OZHeSoftGradientGeneratorShader` layout; it doesn't add
 * any new instance fields (the ctor body has no writes beyond the
 * vtable install at [this+0x0]).
 *
 * `dod` is the HGRect field at inherited offset +0x1a0 — the "domain of
 * definition" rectangle that this node reports for its single output.
 */
export class OZHeSoftGradientGenerator {
  /**
   * Vtable pointer at struct offset +0x0. Set by both ctors to
   * `0x876e28` (Ozone.framework), the address just past the vtable
   * header for this class — the same address `resolve.py Ozone sym
   * 0x876e28` reports as "vtable for OZHeSoftGradientGenerator (+0x10)".
   */
  vtable: number = 0x876e28;

  /**
   * `dod` field at inherited struct offset +0x1a0. Initial value is
   * whatever `OZHeSoftGradientGeneratorShader`'s ctor writes there —
   * not decoded here, so the port initialises to a copy of HGRectNull
   * to give a well-defined starting state while the base is a stub.
   * (A subsequent `setDOD` overwrites this regardless.)
   */
  dod: HGRect = { ...HGRectNull };

  /**
   * `OZHeSoftGradientGenerator::OZHeSoftGradientGenerator()` — both the
   * C1 complete-object ctor @Ozone 0x4daf50 and the C2 base-object ctor
   * @Ozone 0x4daf30 have byte-identical bodies:
   *   push %rbp; mov %rsp,%rbp; push %rbx; push %rax
   *   mov %rdi,%rbx                                      ; save this
   *   callq __ZN31OZHeSoftGradientGeneratorShaderC2Ev    ; base(this)
   *   leaq  0x39bec3(%rip),%rax                          ; %rax = 0x876e28
   *   movq  %rax,(%rbx)                                  ; this->vtable = 0x876e28
   *   add   $0x8,%rsp; pop %rbx; pop %rbp; retq
   * (The C2 variant uses `leaq 0x39bee3(%rip)` because it sits 0x20
   * lower in the binary; both resolve to the same target 0x876e28.)
   *
   * Address citations for this constructor:
   *   @Ozone 0x4daf30 [C2]
   *   @Ozone 0x4daf50 [C1]
   */
  constructor() {
    // 0x4daf39 / 0x4daf59: callq base ctor
    OZHeSoftGradientGeneratorShader_C2_ctor(this);
    // 0x4daf3e / 0x4daf5e: leaq 0x876e28
    // 0x4daf45 / 0x4daf65: movq %rax,(%rbx)  -> vtable pointer install
    this.vtable = 0x876e28;
  }

  /**
   * `OZHeSoftGradientGenerator::~OZHeSoftGradientGenerator()` [D1/D2] —
   * complete-object and base-object dtors, byte-identical bodies:
   *   push %rbp; mov %rsp,%rbp; pop %rbp
   *   jmp __ZN31OZHeSoftGradientGeneratorShaderD2Ev      ; tail-call
   * Neither variant writes any field on `this` before tail-jumping.
   *
   *   @Ozone 0x4daf70 [D2]
   *   @Ozone 0x4daf80 [D1]
   */
  destroy_D1(): void {
    // 0x4daf85 (D1) / 0x4daf75 (D2): jmp base D2 dtor
    OZHeSoftGradientGeneratorShader_D2_dtor(this);
  }

  /**
   * `OZHeSoftGradientGenerator::~OZHeSoftGradientGenerator()` [D0 —
   * deleting dtor] @Ozone 0x4daf90:
   *   push %rbp; mov %rsp,%rbp; push %rbx; push %rax
   *   mov %rdi,%rbx                                      ; save this
   *   callq __ZN31OZHeSoftGradientGeneratorShaderD2Ev    ; base D2(this)
   *   mov %rbx,%rdi                                      ; restore this
   *   add $0x8,%rsp; pop %rbx; pop %rbp
   *   jmp <stub 0x6def6a>                                ; HGObject::operator delete(this)
   */
  destroy_D0(): void {
    // 0x4daf99: callq base D2 dtor
    OZHeSoftGradientGeneratorShader_D2_dtor(this);
    // 0x4dafa7: tail-jmp HGObject::operator delete
    HGObject_operator_delete(this);
  }

  /**
   * `OZHeSoftGradientGenerator::GetDOD(HGRenderer*, int, HGRect)`
   * @Ozone 0x4dafb0. Returns the DOD (16-byte HGRect) for output port
   * `idx`. See the decode note in the file header for the branchless-
   * cmov walkthrough; net semantics:
   *
   *   idx == 0  -> return this.dod
   *   idx != 0  -> return HGRectNull
   *
   * Both `renderer` and `defaultRect` are received but never
   * dereferenced (`%rdi` is clobbered by `addq $0x1a8,%rdi` at 0x4dafbb
   * and never restored; the stack-passed HGRect is untouched).
   *
   * Instruction-level provenance:
   *   0x4dafb4 leaq 0x1a0(%rdi), %rax               ; rax = &this[+0x1a0]
   *   0x4dafbb addq $0x1a8, %rdi                    ; rdi = &this[+0x1a8]
   *   0x4dafc2 movq 0x345d57(%rip), %rcx            ; rcx = &_HGRectNull
   *   0x4dafc9 leaq 0x8(%rcx), %rsi                 ; rsi = &_HGRectNull[+0x8]
   *   0x4dafcd testl %edx, %edx                     ; idx==0?
   *   0x4dafcf cmovneq %rcx, %rax                   ; if idx!=0: rax=&HGRectNull
   *   0x4dafd3 cmoveq  %rdi, %rsi                   ; if idx==0: rsi=&this[+0x1a8]
   *   0x4dafd7 movq (%rsi), %rdx                    ; return.hi
   *   0x4dafda movq (%rax), %rax                    ; return.lo
   *   0x4dafdd popq %rbp; retq
   */
  GetDOD(_renderer: HGRenderer, idx: number, _defaultRect: HGRect): HGRect {
    // Branchless cmov pair -> ternaries. We keep both halves as
    // independent selections to mirror the two cmovs in the asm even
    // though they co-select in this override.
    const rectForLoHalf: HGRect = idx !== 0 ? HGRectNull : this.dod;
    const rectForHiHalf: HGRect = idx === 0 ? this.dod : HGRectNull;
    // rax path (return.lo) reads bytes +0x00..+0x08 (x, y):
    const x = rectForLoHalf.x;
    const y = rectForLoHalf.y;
    // rsi path (return.hi) reads bytes +0x08..+0x10 (right, bottom):
    const right = rectForHiHalf.right;
    const bottom = rectForHiHalf.bottom;
    return { x, y, right, bottom };
  }

  /**
   * `OZHeSoftGradientGenerator::setDOD(HGRect const&)` @Ozone 0x4dafe0.
   * Copies the 16 bytes at *src into this+0x1a0 as a single unaligned
   * SSE store — i.e. wholesale HGRect replacement.
   *
   *   0x4dafe4 movups (%rsi), %xmm0        ; xmm0 = *src (16B)
   *   0x4dafe7 movups %xmm0, 0x1a0(%rdi)   ; this->dod = xmm0
   *   0x4dafee popq %rbp; retq
   */
  setDOD(src: HGRect): void {
    // 0x4dafe4/0x4dafe7 fused: single 128-bit copy of all four int32
    // fields of the HGRect.
    this.dod = { x: src.x, y: src.y, right: src.right, bottom: src.bottom };
  }
}
