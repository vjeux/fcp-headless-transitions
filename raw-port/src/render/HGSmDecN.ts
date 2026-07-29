// HGSmDecN.ts — Helium's HGSmDecN render node (2-parameter facade over the
// inner HGSmDecN_Shader Metal-dispatch node).
//
// Faithful transcription of every externally-visible HGSmDecN method from
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium
//
// Source disassembly (bundled):
//   raw-port/re/disasm/Helium.HGSmDecN.HGSmDecN.s      (C1/C2 @0x1c20a0)
//   raw-port/re/disasm/Helium.HGSmDecN.SetParameter.s  (@0x1c21f0)
//   raw-port/re/disasm/Helium.HGSmDecN.GetOutput.s     (@0x1c2250)
//   raw-port/re/disasm/Helium.HGSmDecN.~HGSmDecN.s     (D0 @0x1c21b0)
//
// nm entries owned by this class (Helium):
//   0x1c20a0 T HGSmDecN::HGSmDecN()            [C1/C2 same body]
//   0x1c21b0 T HGSmDecN::~HGSmDecN()           [D0 — deleting]
//   (D1/D2 are ICF-folded onto D0 in the linked binary; nm still emits
//    three symbols pointing at 0x1c21b0 — see `grep HGSmDecN:: /tmp/helium_syms.txt`.)
//   0x1c21f0 T HGSmDecN::SetParameter(int, float, float, float, float)
//   0x1c2250 T HGSmDecN::GetOutput(HGRenderer*)
//
// ---------------------------------------------------------------------------
// Class shape recovered from the ctor / dtor / SetParameter / GetOutput:
//
//   HGSmDecN  is-a  HGNode                     (C2 opens with
//                                                callq __ZN6HGNodeC2Ev @0x1c20ad
//                                                and every dtor tail-jmps to
//                                                __ZN6HGNodeD2Ev @0x1c21d3)
//
//   HGSmDecN {
//     +0x000  vptr                              (set in C2 @0x1c20b9 to
//                                                vtable-for-HGSmDecN
//                                                @Helium 0xa27db8; leaq at
//                                                0x1c20b2 + 7 + 0x865cff.)
//     +0x008..+0x197                            (HGNode base subobject)
//     +0x198  HGSmDecN_Shader* m_hgcInner       (heap-allocated in C2 via
//                                                HGObject::operator new(0x1a0)
//                                                @0x1c20cc, constructed via
//                                                HGNode::HGNode() base-only
//                                                @0x1c20d7, then had its vptr
//                                                overwritten to
//                                                vtable-for-HGSmDecN_Shader
//                                                @Helium 0xa28fd0 @0x1c20e3.
//                                                Assigned raw @0x1c20e6.)
//     +0x1a0  float   param0                    (cleared to 0 by C2 @0x1c20bc
//                                                as an 8-byte movq — clears
//                                                +0x1a0..+0x1a7. SetParameter
//                                                stores idx=0 here.)
//     +0x1a4  float   param1                    (init'd to 0 by the same movq
//                                                @0x1c20bc. SetParameter stores
//                                                idx=1 here.)
//   }
//
// ---------------------------------------------------------------------------
// vtable-for-HGSmDecN (Helium @0xa27db8 — resolved via
// `raw-port/army/tools/resolve.py Helium vtable HGSmDecN`):
//   *0x00 -> HGSmDecN::~HGSmDecN()         @0x1c2170   (D1/D2 ICF-folded)
//   *0x08 -> HGSmDecN::~HGSmDecN()         @0x1c21b0   (D0)
//   *0x10 -> HGObject::Retain()            @0x1a0f20   (inherited)
//   *0x18 -> HGObject::Release()           @0x1a0f30   (inherited)
//   *0x20 -> HGNode::debugDescription()    @0x11c100   (inherited)
//   *0x28 -> HGNode::dotLabel()            @0x11c080
//   *0x30 -> HGNode::label_A()             @0x11c090
//   *0x38 -> HGNode::label_B()             @0x11c0d0
//   *0x40 -> HGNode::info(...)             @0x11c0e0
//   *0x48 -> HGNode::shaderDescription()   @0x11c3f0
//   *0x50 -> HGNode::GetParameterCount()   @0x11ca50
//   *0x58 -> HGNode::GetParameterName(int) @0x11ca60
//   *0x60 -> HGSmDecN::SetParameter(int, f,f,f,f) @0x1c21f0  (this class)
//   *0x68 -> HGNode::GetParameter(int, float*) @0x11cbe0
//   *0x70 -> HGNode::GetNumInputs()        @0x11c8a0
//   *0x78 -> HGNode::SetInput(int, HGNode*) @0x11c5f0
//   *0x80 -> HGNode::GetInput(int)          @0x11c8b0
//   (slots above 0x80 remain the HGNode-base entries — not consumed by any
//   HGSmDecN method transcribed here.)
//
// vtable-for-HGSmDecN_Shader (m_hgcInner's vtable — Helium @0xa28fd0;
// resolved via `raw-port/army/tools/resolve.py Helium vtable HGSmDecN_Shader`):
//   *0x18 -> HGObject::Release()           @0x1a0f30
//   *0x60 -> HGNode::SetParameter(int,f,f,f,f) @0x11cab0
//                                          (NOT overridden by HGSmDecN_Shader;
//                                           slot resolves to the base default.)
//   *0x78 -> HGNode::SetInput(int, HGNode*) @0x11c5f0
//                                          (also NOT overridden; base default.)
//
// ---------------------------------------------------------------------------
// HGSmDecN::HGSmDecN()  [C1/C2 — same body]                        @0x1c20a0
//
//   __ZN8HGSmDecNC1Ev:
//     0x1c20a0  pushq %rbp / movq %rsp,%rbp / pushq %r15 / pushq %r14 /
//               pushq %rbx / pushq %rax
//     0x1c20aa  movq  %rdi, %rbx                       ; save this
//     0x1c20ad  callq __ZN6HGNodeC2Ev                   ; HGNode base ctor
//     0x1c20b2  leaq  0x865cff(%rip), %rax              ; = vtable-for-HGSmDecN
//                                                        (@0xa27db8)
//     0x1c20b9  movq  %rax, (%rbx)                      ; this->vptr = vtable
//     0x1c20bc  movq  $0x0, 0x1a0(%rbx)                 ; this->{param0,param1}
//                                                        = 0,0  (8-byte zero
//                                                        clears both float slots)
//     0x1c20c7  movl  $0x1a0, %edi                      ; imm = 0x1A0 (sizeof
//                                                        HGSmDecN_Shader)
//     0x1c20cc  callq __ZN8HGObjectnwEm                 ; op-new(0x1a0)
//     0x1c20d1  movq  %rax, %r14                        ; %r14 = raw
//     0x1c20d4  movq  %rax, %rdi
//     0x1c20d7  callq __ZN6HGNodeC2Ev                   ; HGNode base-only ctor
//                                                        on the raw block
//                                                        (HGSmDecN_Shader's own
//                                                        ctor is NOT invoked
//                                                        by this class; it
//                                                        piggy-backs on the
//                                                        base HGNode init +
//                                                        vptr overwrite below)
//     0x1c20dc  leaq  0x866eed(%rip), %rax              ; = vtable-for-
//                                                        HGSmDecN_Shader
//                                                        (@0xa28fd0)
//     0x1c20e3  movq  %rax, (%r14)                      ; inner->vptr = shader
//                                                        vtable
//     0x1c20e6  movq  %r14, 0x198(%rbx)                 ; this->m_hgcInner =
//                                                        inner (raw store — NO
//                                                        HGRef swap because the
//                                                        field was zero'd by
//                                                        the earlier movq @
//                                                        0x1c20bc, and it's
//                                                        provably first-write)
//     0x1c20ed  add/pop/ret
//
//   Exception-unwind bookkeeping @0x1c20f8..0x1c2121:
//     if HGNode::HGNode() throws on the INNER (@0x1c20d7): op-delete the raw
//       inner (@0x1c20fe), then unwind through this class's own base subobject
//       (@0x1c2106  HGNode::~HGNode()), then rethrow (@0x1c210e __Unwind_Resume).
//     if the FIRST HGNode::HGNode() throws (@0x1c20ad — the base ctor for
//       THIS): jump into the second unwind stanza @0x1c2113  HGNode::~HGNode()
//       + rethrow. That stanza is the outer's own destruct path.
//   In TS the frontier ctors either throw or noop; the C++-ABI unwind bookkeeping
//   collapses into whatever the frontier stubs raise.
//
// ---------------------------------------------------------------------------
// HGSmDecN::SetParameter(int idx, float x, float, float, float)   @0x1c21f0
//
//   __ZN8HGSmDecN12SetParameterEiffff:
//     0x1c21f0  cmpl  $0x1, %esi                        ; if idx == 1
//     0x1c21f3  je    0x1c2217                          ;   -> slot 1 store
//     0x1c21f5  movl  $0xffffffff, %eax                 ; default rc = -1
//     0x1c21fa  testl %esi, %esi                        ; if idx != 0
//     0x1c21fc  jne   0x1c223d                          ;   -> ret -1
//     ; --- idx == 0 branch ---
//     0x1c21fe  movss 0x1a0(%rdi), %xmm1                ; xmm1 = this->param0
//     0x1c2206  ucomiss %xmm0, %xmm1                    ; cmp param0, x
//     0x1c2209  jne   0x1c220d                          ; if NEQ -> store
//     0x1c220b  jnp   0x1c223e                          ; if ORDERED-EQ -> ret 0
//     ; NaN-ordered inequality idiom: `jne||jnp` is TRUE iff (param0 == x AND
//     ; neither is NaN). NaN-vs-anything gives PF=1, so JNE(ZF=0) fires but
//     ; JNP does NOT jump — falls through to the store. Semantics = "if the
//     ; new value would BIT-DIFFER as ordered floats, take the store path".
//     0x1c220d  movss %xmm0, 0x1a0(%rdi)                ; this->param0 = x
//     0x1c2215  jmp   0x1c222e                          ; -> ClearBits + ret 1
//     ; --- idx == 1 branch ---
//     0x1c2217  movss 0x1a4(%rdi), %xmm1                ; xmm1 = this->param1
//     0x1c221f  ucomiss %xmm0, %xmm1                    ; cmp param1, x
//     0x1c2222  jne   0x1c2226                          ; same NaN-ordered
//     0x1c2224  jnp   0x1c223e                          ;  idempotency guard
//     0x1c2226  movss %xmm0, 0x1a4(%rdi)                ; this->param1 = x
//     ; fallthrough into ClearBits + ret 1
//     0x1c222e  pushq %rbp / movq %rsp,%rbp
//     0x1c2232  callq __ZN6HGNode9ClearBitsEv           ; HGNode::ClearBits()
//                                                        @Helium 0x11c890 (0-arg
//                                                        thunk to ClearBits(0xffff))
//     0x1c2237  movl  $0x1, %eax                        ; rc = 1
//     0x1c223c  popq  %rbp
//     0x1c223d  retq                                    ; ret with %eax
//     0x1c223e  xorl  %eax, %eax                        ; rc = 0 (no change)
//     0x1c2240  retq
//
// Return-code convention (mirrors HGMix, HGColorBias, ...):
//   -1  invalid paramIdx
//    0  value was already equal to `x` (idempotent, no invalidation)
//    1  value changed → ClearBits() was called, dependents invalidated
//
// Only the FIRST float argument (%xmm0) is consumed; args 2/3/4 (%xmm1..%xmm3)
// are ignored. HGSmDecN exposes exactly 2 scalar knobs.
//
// ---------------------------------------------------------------------------
// HGSmDecN::GetOutput(HGRenderer* renderer)                        @0x1c2250
//
//   __ZN8HGSmDecN9GetOutputEP10HGRenderer:
//     0x1c2250  pushq %rbp / movq %rsp,%rbp / pushq %r14 / pushq %rbx
//     0x1c2257  movq  %rdi, %rbx                        ; save this
//     0x1c225a  xorps %xmm0, %xmm0                      ; xmm0 = 0.0f
//     0x1c225d  ucomiss 0x1a0(%rdi), %xmm0              ; cmp 0.0f, param0
//     0x1c2264  jae   0x1c22d2                          ; if 0.0f >= param0
//                                                        (i.e. param0 <= 0.0,
//                                                        NaN takes JAE too via
//                                                        PF=1/CF=1) -> skip
//                                                        wiring, just return
//                                                        m_hgcInner
//     ; --- param0 > 0.0 branch: wire input + push params through inner ---
//     0x1c2266  movq  0x198(%rbx), %r14                 ; %r14 = m_hgcInner
//     0x1c226d  movq  %rsi, %rdi                        ; arg1 = renderer
//     0x1c2270  movq  %rbx, %rsi                        ; arg2 = this
//     0x1c2273  xorl  %edx, %edx                        ; arg3 = 0
//     0x1c2275  callq __ZN10HGRenderer8GetInputEP6HGNodei
//                                                       ; upstream0 =
//                                                        renderer->GetInput(
//                                                          this, 0)
//                                                        @Helium HGRenderer::
//                                                        GetInput(HGNode*, int)
//                                                        — plain non-virtual
//                                                        call to Helium's
//                                                        renderer.
//     0x1c227a  movq  (%r14), %rcx                      ; inner->vptr
//     0x1c227d  movq  %r14, %rdi                        ; arg1 = inner
//     0x1c2280  xorl  %esi, %esi                        ; arg2 = 0 (input idx)
//     0x1c2282  movq  %rax, %rdx                        ; arg3 = upstream0
//     0x1c2285  callq *0x78(%rcx)                       ; inner->vtable[0x78]
//                                                        = HGNode::SetInput
//                                                        @0x11c5f0
//                                                        -> SetInput(0, upstream0)
//     ; --- push param0 as a broadcast-4 into inner's slot 0 ---
//     0x1c2288  movq  0x198(%rbx), %rdi                 ; arg1 = inner
//     0x1c228f  movss 0x1a0(%rbx), %xmm0                ; xmm0 = param0
//     0x1c2297  movq  (%rdi), %rax                      ; inner->vptr
//     0x1c229a  xorps %xmm1, %xmm1                      ; xmm1 = 0.0f
//     0x1c229d  xorps %xmm2, %xmm2                      ; xmm2 = 0.0f
//     0x1c22a0  xorps %xmm3, %xmm3                      ; xmm3 = 0.0f
//     0x1c22a3  xorl  %esi, %esi                        ; arg2 = 0 (paramIdx)
//     0x1c22a5  callq *0x60(%rax)                       ; inner->vtable[0x60]
//                                                        = HGNode::SetParameter
//                                                        @0x11cab0
//                                                        -> SetParameter(
//                                                             0, param0, 0, 0, 0)
//     ; NB: only 1 scalar is broadcast — the other three lanes are ZERO
//     ; (via xorps xmm1/xmm2/xmm3). This is DIFFERENT from HGMix which
//     ; broadcasts a single value across all four lanes.
//     ; --- push param1 as a broadcast-4 (this one IS all-lanes) into slot 1 ---
//     0x1c22a8  movq  0x198(%rbx), %rdi                 ; arg1 = inner
//     0x1c22af  movss 0x1a4(%rbx), %xmm0                ; xmm0 = param1
//     0x1c22b7  movq  (%rdi), %rax                      ; inner->vptr
//     0x1c22ba  movl  $0x1, %esi                        ; arg2 = 1 (paramIdx)
//     0x1c22bf  movaps %xmm0, %xmm1                     ; xmm1 = param1
//     0x1c22c2  movaps %xmm0, %xmm2                     ; xmm2 = param1
//     0x1c22c5  movaps %xmm0, %xmm3                     ; xmm3 = param1
//     0x1c22c8  callq *0x60(%rax)                       ; inner->SetParameter(
//                                                             1, p1, p1, p1, p1)
//     0x1c22cb  movq  0x198(%rbx), %rbx                 ; return-value slot
//                                                        = m_hgcInner
//     0x1c22d2  movq  %rbx, %rax                        ; %rax = m_hgcInner
//                                                        (in the skip path
//                                                         %rbx is still `this`
//                                                         at 0x1c22d2 UNLESS
//                                                         we passed through the
//                                                         wiring block, which
//                                                         resets %rbx to
//                                                         m_hgcInner @0x1c22cb.
//                                                         BUG-CHECK: on the
//                                                         skip path %rbx is
//                                                         `this` — so the
//                                                         function returns
//                                                         `this` when param0
//                                                         <= 0. Verified from
//                                                         the asm: no branch
//                                                         from 0x1c2264 skips
//                                                         a %rbx reassignment.)
//     0x1c22d5  pop/ret
//
// Semantics — GATE ON param0 > 0.0f:
//   if param0 <= 0.0 (or NaN):  no wiring done, GetOutput returns `this`
//                                (the HGSmDecN node itself, bypassing the
//                                inner filter — effectively a passthrough).
//   if param0 >  0.0:            forward upstream slot 0 → inner slot 0, push
//                                (param0, 0, 0, 0) to inner->SetParameter(0),
//                                push (param1, param1, param1, param1) to
//                                inner->SetParameter(1), then return
//                                m_hgcInner.
//
// The asymmetric broadcast (param0 → x000, param1 → xxxx) is BINARY-EXACT
// evidence of the shader's uniform layout: uniform-0 uses only its .x lane,
// uniform-1 uses all four lanes. This is preserved verbatim below.
//
// The upstream getter is `HGRenderer::GetInput(HGNode*, int)` — a
// non-virtual member on the renderer that resolves via the callq offset
// @0x1c2275 (undecoded frontier).
//
// ---------------------------------------------------------------------------
// HGSmDecN::~HGSmDecN()  [D0 — deleting]                           @0x1c21b0
//
//   __ZN8HGSmDecND0Ev:
//     0x1c21b0  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
//     0x1c21b6  movq  %rdi, %rbx                        ; save this
//     0x1c21b9  leaq  0x865bf8(%rip), %rax              ; = vtable-for-HGSmDecN
//                                                        (@0xa27db8)
//     0x1c21c0  movq  %rax, (%rdi)                      ; this->vptr = vtable
//     0x1c21c3  movq  0x198(%rdi), %rdi                 ; %rdi = m_hgcInner
//     0x1c21ca  movq  (%rdi), %rax                      ; inner->vptr
//     0x1c21cd  callq *0x18(%rax)                       ; inner->Release()
//                                                        (vtable[0x18] =
//                                                        HGObject::Release
//                                                        @0x1a0f30)
//     0x1c21d0  movq  %rbx, %rdi
//     0x1c21d3  callq __ZN6HGNodeD2Ev                   ; base dtor
//     0x1c21d8  movq  %rbx, %rdi
//     0x1c21db  add/pop
//     0x1c21e1  jmp   __ZN8HGObjectdlEPv                ; op-delete tail-call
//     0x1c21e6  movq  %rax, %rdi
//     0x1c21e9  callq ___clang_call_terminate
//
// NB: D0 assumes m_hgcInner is non-null (no null check before deref @0x1c21ca)
// — safe because C2 always installs one, and the field is never nulled after.
// D1/D2 are ICF-folded onto D0 in this build (nm emits three symbols pointing
// at 0x1c21b0). In TS the GC subsumes the trailing op-delete and Release call.

import type { HGRenderer } from "./HGSmDecN_Shader";
export type { HGRenderer };

/**
 * Opaque brand for `HGNode*` — the base class every render node inherits
 * from. HGNode itself is (partially) decoded in HGNode.ts; only its identity
 * is exposed at this facade layer. Cited use sites for HGNode::HGNode /
 * HGNode::~HGNode / HGNode::ClearBits / HGNode::SetInput / HGNode::GetInput
 * / HGNode::SetParameter appear in the C2/dtor/GetOutput bodies above.
 */
export type HGNode = { readonly __brand: "HGNode" };

// ---------------------------------------------------------------------------
// Frontier callee stubs (undecoded at this facade layer) — see file header
// for cited addresses. Each stub throws so any accidental exercise of the
// path surfaces the exact undecoded call site.
// ---------------------------------------------------------------------------

/**
 * Frontier: `HGNode::HGNode()` — base subobject ctor. Invoked TWICE from
 * HGSmDecN::C2:
 *   @0x1c20ad  callq on `this` (the outer HGSmDecN)
 *   @0x1c20d7  callq on the raw op-new'd HGSmDecN_Shader block (the inner)
 * The inner one is followed by a vptr overwrite @0x1c20e3 that upgrades
 * the base into an HGSmDecN_Shader — HGSmDecN_Shader has no own C1/C2 body
 * in nm; the outer performs its construction inline as "HGNode base +
 * vtable slam".
 */
function HGNode_C2(_target: HGSmDecN | HGSmDecN_Shader_Inner): void {
  // @Helium 0x1c20ad callq __ZN6HGNodeC2Ev  (on this)
  // @Helium 0x1c20d7 callq __ZN6HGNodeC2Ev  (on the fresh inner block)
  throw new Error(
    "HGNode::HGNode() not yet transcribed " +
      "(frontier callee @Helium 0x1c20ad and 0x1c20d7 in HGSmDecN::C2)",
  );
}

/**
 * Frontier: `HGNode::~HGNode()` — reached from HGSmDecN::D0 via
 *   @Helium 0x1c21d3 callq __ZN6HGNodeD2Ev
 * on `this` after the inner Release. In TS, GC subsumes.
 */
function HGNode_D2(_self: HGSmDecN): void {
  // @Helium 0x1c21d3 callq __ZN6HGNodeD2Ev
  throw new Error(
    "HGNode::~HGNode() not yet transcribed " +
      "(frontier callee @Helium 0x1c21d3 in HGSmDecN::D0)",
  );
}

/**
 * Frontier: `HGObject::operator new(unsigned long)` — 0x1a0-byte allocation
 * for the inner HGSmDecN_Shader at @Helium 0x1c20cc. Size literal recovered
 * from @Helium 0x1c20c7 (`movl $0x1a0, %edi`). In TS the JS runtime handles
 * allocation; the size is cited so the layout stays traceable.
 */
function HGObject_op_new_0x1a0(): HGSmDecN_Shader_Inner {
  // @Helium 0x1c20cc callq __ZN8HGObjectnwEm
  throw new Error(
    "HGObject::operator new(0x1a0) not yet transcribed " +
      "(frontier callee @Helium 0x1c20cc in HGSmDecN::C2 — sizeof=0x1A0)",
  );
}

/**
 * Frontier: `HGNode::ClearBits()` (the 0-arg thunk that expands to
 * `ClearBits(0xffff)`) — invoked by HGSmDecN::SetParameter @Helium 0x1c2232
 * whenever an idx=0 or idx=1 store CHANGES a value. Signals dependents that
 * the node's cached output is stale.
 */
function HGNode_ClearBits(_self: HGSmDecN): void {
  // @Helium 0x1c2232 callq __ZN6HGNode9ClearBitsEv @0x11c890
  throw new Error(
    "HGNode::ClearBits() not yet transcribed " +
      "(frontier callee @Helium 0x1c2232 in HGSmDecN::SetParameter)",
  );
}

/**
 * Frontier: `HGRenderer::GetInput(HGNode* node, int inputIdx) -> HGNode*` —
 * upstream fetch, invoked once from HGSmDecN::GetOutput @Helium 0x1c2275.
 * NOT a vtable call — a direct callq to HGRenderer's non-virtual member.
 */
function HGRenderer_GetInput(
  _renderer: HGRenderer,
  _node: HGSmDecN,
  _inputIdx: number,
): HGNode {
  // @Helium 0x1c2275 callq __ZN10HGRenderer8GetInputEP6HGNodei
  throw new Error(
    "HGRenderer::GetInput(HGNode*, int) not yet transcribed " +
      "(frontier callee @Helium 0x1c2275 in HGSmDecN::GetOutput)",
  );
}

/**
 * Frontier: `HGNode::SetInput(int, HGNode*)` — invoked as a vtable call on
 * the inner HGSmDecN_Shader from HGSmDecN::GetOutput @Helium 0x1c2285.
 * Vtable slot 0x78 of HGSmDecN_Shader's vtable @0xa28fd0 resolves to
 * HGNode::SetInput @Helium 0x11c5f0 (the inner does NOT override slot 0x78).
 */
function HGNode_SetInput(
  _inner: HGSmDecN_Shader_Inner,
  _inputIdx: number,
  _upstream: HGNode,
): void {
  // @Helium 0x1c2285 callq *0x78(%rcx)
  //   -> HGNode::SetInput @Helium 0x11c5f0 (via inner's vtable slot 0x78)
  throw new Error(
    "HGNode::SetInput(int, HGNode*) not yet transcribed " +
      "(frontier callee @Helium 0x1c2285 in HGSmDecN::GetOutput)",
  );
}

/**
 * Frontier: `HGNode::SetParameter(int, float, float, float, float) -> int` —
 * invoked as vtable calls on the inner from HGSmDecN::GetOutput at
 *   @0x1c22a5   inner->SetParameter(0, param0, 0.0, 0.0, 0.0)
 *   @0x1c22c8   inner->SetParameter(1, param1, param1, param1, param1)
 * Vtable slot 0x60 of HGSmDecN_Shader's vtable @0xa28fd0 resolves to
 * HGNode::SetParameter @Helium 0x11cab0 (the inner does NOT override
 * slot 0x60).
 */
function HGNode_SetParameter(
  _inner: HGSmDecN_Shader_Inner,
  _paramIdx: number,
  _a: number,
  _b: number,
  _c: number,
  _d: number,
): number {
  // @Helium 0x1c22a5 and 0x1c22c8 callq *0x60(%rax)
  //   -> HGNode::SetParameter @Helium 0x11cab0
  throw new Error(
    "HGNode::SetParameter(int, float, float, float, float) not yet transcribed " +
      "(frontier callee @Helium 0x1c22a5 / 0x1c22c8 in HGSmDecN::GetOutput)",
  );
}

/**
 * Frontier: `HGObject::Release()` on the owned HGSmDecN_Shader. Called from
 * HGSmDecN::D0 @Helium 0x1c21cd via inner->vtable[0x18] (which resolves to
 * HGObject::Release @Helium 0x1a0f30). GC subsumes ref-counting in TS.
 */
function HGObject_Release_hgcInner(_inner: HGSmDecN_Shader_Inner): void {
  // @Helium 0x1c21cd callq *0x18(%rax) -> HGObject::Release @0x1a0f30
  // GC subsumes Release — noop.
}

/**
 * Opaque brand for the inner HGSmDecN_Shader instance. The class
 * HGSmDecN_Shader is separately ported in `raw-port/src/render/HGSmDecN_Shader.ts`
 * (GetROI / GetFilterMode / RenderTile / dtor). This facade only needs its
 * identity + the two vtable slot semantics (0x18 Release, 0x60 SetParameter,
 * 0x78 SetInput) which are ALL inherited-defaults from HGNode.
 *
 * sizeof(HGSmDecN_Shader) = 0x1a0 bytes (imm literal recovered from
 * HGSmDecN::C2 @Helium 0x1c20c7).
 *
 * vtable-for-HGSmDecN_Shader @Helium 0xa28fd0.
 */
export type HGSmDecN_Shader_Inner = { readonly __brand: "HGSmDecN_Shader" };

/**
 * `HGSmDecN` — Helium render node exposing TWO scalar knobs (param0, param1)
 * gated by `param0 > 0`. A "graph facade" that presents an HGNode identity
 * to the outer render graph, owns exactly one HGSmDecN_Shader instance, and
 * pipes the two knobs into the inner filter's SetParameter uniforms as
 *   inner.SetParameter(0, param0, 0, 0, 0)      // .x lane only
 *   inner.SetParameter(1, param1, param1, param1, param1)  // broadcast
 * whenever GetOutput is exercised WITH `param0 > 0`.
 *
 * When `param0 <= 0` (or NaN), GetOutput short-circuits and returns
 * `this` — bypassing the inner filter entirely. This is the classic
 * "amount<=0 → passthrough" facade idiom seen elsewhere in Helium.
 *
 * @Helium symbols owned by this class:
 *   C1/C2 @0x1c20a0 (same body — see @0x1c20a0 disasm; C1 and C2 map to
 *                    the same mangled entry in this build)
 *   D0 @0x1c21b0 (deleting) — D1/D2 ICF-folded onto this address
 *   SetParameter @0x1c21f0
 *   GetOutput    @0x1c2250
 */
export class HGSmDecN {
  /**
   * `this->m_hgcInner` at struct offset +0x198. First-written by C2
   * @Helium 0x1c20e6 (raw store — no HGRef swap needed because the field
   * was zero-init'd earlier by `movq $0, 0x1a0(%rbx)` @0x1c20bc which
   * covers +0x1a0..+0x1a7; the +0x198 field is left as whatever the base
   * HGNode ctor put there — the raw store overwrites it unconditionally).
   */
  m_hgcInner: HGSmDecN_Shader_Inner | null = null;

  /**
   * `this->param0` at struct offset +0x1a0 (float32). Init'd to 0 by
   * C2 @Helium 0x1c20bc (as part of the 8-byte movq that zeroes both
   * param0 and param1). Written by SetParameter(0, x, ...) @0x1c220d.
   * Read by GetOutput's gate @0x1c225d and by the inner .x-lane push
   * @0x1c228f.
   *
   * FCP stores it as a native single-precision float — every read/write
   * goes through movss. Kept as a JS number wrapped by Math.fround on
   * every store to preserve the float32 rounding profile of the original.
   */
  param0: number = Math.fround(0);

  /**
   * `this->param1` at struct offset +0x1a4 (float32). Init'd to 0 by
   * C2 @Helium 0x1c20bc. Written by SetParameter(1, x, ...) @0x1c2226.
   * Read by GetOutput's broadcast push @0x1c22af.
   */
  param1: number = Math.fround(0);

  /**
   * HGSmDecN::HGSmDecN()  [C1/C2 — same body]  @Helium 0x1c20a0
   *
   * Mirrored control flow:
   *   @0x1c20ad  HGNode::HGNode()                       (base ctor on this)
   *   @0x1c20b2..0x1c20b9  this->vptr = vtable-for-HGSmDecN (TS: noop)
   *   @0x1c20bc  {param0, param1} = {0, 0}              (8-byte zero-init)
   *   @0x1c20c7..0x1c20cc  HGObject::operator new(0x1a0) (raw inner block)
   *   @0x1c20d7  HGNode::HGNode()                       (base ctor on inner)
   *   @0x1c20dc..0x1c20e3  inner->vptr = vtable-for-HGSmDecN_Shader
   *   @0x1c20e6  this->m_hgcInner = inner               (raw store, no swap)
   *   @0x1c20ed  ret
   *
   * Unwind bookkeeping (@0x1c20f8..0x1c2121) rethrows through op-delete +
   * HGNode::~HGNode(). In TS the frontier ctors throw before completing,
   * so the ctor body below is intentionally a THROW that unwinds fully to
   * the caller — matching the ABI's exception path in the sense that no
   * partially-constructed HGSmDecN is left visible.
   */
  constructor() {
    // @0x1c20ad — base ctor on `this`. Frontier: throws below.
    HGNode_C2(this);
    // @0x1c20b9 — this->vptr = vtable-for-HGSmDecN @0xa27db8. TS: noop
    //             (identity is the class itself; we cite the address so
    //              the vtable-slot mapping stays traceable in review).
    // @0x1c20bc — this->param0 = 0, this->param1 = 0 (already set above
    //             at declaration time — the movq is what does the initial
    //             zero).
    this.param0 = Math.fround(0);
    this.param1 = Math.fround(0);
    // @0x1c20cc — op-new(0x1a0). Frontier: throws.
    const inner = HGObject_op_new_0x1a0();
    // @0x1c20d7 — HGNode::HGNode() base ctor on the raw inner block.
    //             Frontier: throws.
    HGNode_C2(inner);
    // @0x1c20dc..0x1c20e3 — inner->vptr = vtable-for-HGSmDecN_Shader
    //             @0xa28fd0. TS: noop.
    // @0x1c20e6 — this->m_hgcInner = inner (raw store).
    this.m_hgcInner = inner;
  }

  /**
   * HGSmDecN::SetParameter(int paramIdx, float x, float, float, float) -> int
   * @Helium 0x1c21f0
   *
   * Mirrored control flow (see the full asm annotation above):
   *   idx == 0  -> ordered-inequality check on param0, store, ClearBits, ret 1
   *   idx == 1  -> ordered-inequality check on param1, store, ClearBits, ret 1
   *   idx == 0/1 with no change  -> ret 0
   *   idx anything else          -> ret -1
   *
   * The NaN-ordered idempotency guard is the `ucomiss` + `jne || jnp`
   * idiom from x86: it fires the STORE path iff the two floats are NOT
   * ordered-equal (either they differ, or one is NaN, or they're +0 vs -0
   * — because ucomiss distinguishes +0 from -0? NO: ucomiss treats +0 and
   * -0 as equal, so both zeros collapse to the "no store, return 0" path).
   * We preserve that behaviour verbatim via `!== ` on Math.fround'd values.
   *
   * NB: `!== ` between two Math.fround values is BIT-EXACT for finite
   * floats, distinguishes NaN from anything (satisfying the JNE branch),
   * and treats +0 and -0 as EQUAL (matching ucomiss). This is EXACTLY the
   * ordered-inequality that the asm computes. Do NOT swap for Object.is:
   * Object.is(-0,+0) is false, which would over-fire the store path.
   */
  SetParameter(paramIdx: number, x: number, _b: number, _c: number, _d: number): number {
    // @0x1c21f0 cmpl $0x1, %esi ; je 0x1c2217   (idx == 1 branch)
    if (paramIdx === 1) {
      // @0x1c2217 movss 0x1a4(%rdi), %xmm1
      const prev = Math.fround(this.param1);
      // @0x1c221f ucomiss %xmm0, %xmm1
      // @0x1c2222 jne 0x1c2226 ; @0x1c2224 jnp 0x1c223e
      //   NaN-ordered inequality: fall through to store iff !(prev == x AND
      //   both are non-NaN). See the docstring above for the +0/-0 nuance.
      if (prev !== Math.fround(x)) {
        // @0x1c2226 movss %xmm0, 0x1a4(%rdi)
        this.param1 = Math.fround(x);
        // fallthrough into ClearBits + ret 1
        // @0x1c2232 callq HGNode::ClearBits()
        HGNode_ClearBits(this);
        // @0x1c2237 movl $0x1, %eax ; @0x1c223d retq
        return 1;
      }
      // @0x1c223e xorl %eax, %eax ; @0x1c2240 retq
      return 0;
    }
    // @0x1c21fa testl %esi, %esi ; jne 0x1c223d
    //   -> if idx is neither 0 nor 1, return the pre-set %eax = -1.
    if (paramIdx !== 0) {
      // @0x1c21f5 movl $0xffffffff, %eax ; @0x1c223d retq (via jne)
      return -1;
    }
    // --- idx == 0 branch ---
    // @0x1c21fe movss 0x1a0(%rdi), %xmm1
    const prev = Math.fround(this.param0);
    // @0x1c2206 ucomiss %xmm0, %xmm1
    // @0x1c2209 jne 0x1c220d ; @0x1c220b jnp 0x1c223e
    if (prev !== Math.fround(x)) {
      // @0x1c220d movss %xmm0, 0x1a0(%rdi)
      this.param0 = Math.fround(x);
      // @0x1c2215 jmp 0x1c222e -> ClearBits + ret 1
      HGNode_ClearBits(this);
      return 1;
    }
    // @0x1c223e xorl %eax, %eax ; retq
    return 0;
  }

  /**
   * HGSmDecN::GetOutput(HGRenderer* renderer)  @Helium 0x1c2250
   *
   * Returns either `this` (when `param0 <= 0` or NaN — passthrough gate) or
   * `this.m_hgcInner` (after wiring inputs and pushing uniforms).
   *
   * Mirrored control flow:
   *   @0x1c225d  gate: xorps xmm0, xmm0 ; ucomiss 0x1a0(%rdi),%xmm0
   *              jae 0x1c22d2  -> skip wiring iff 0.0f >= param0 (which
   *                                includes NaN via PF=1/CF=1)
   *   @0x1c2266..0x1c2285   upstream0 = renderer->GetInput(this, 0)
   *                         inner->SetInput(0, upstream0)
   *   @0x1c2288..0x1c22a5   inner->SetParameter(0, param0, 0, 0, 0)
   *                         (broadcast to .x lane only — other lanes ZERO)
   *   @0x1c22a8..0x1c22c8   inner->SetParameter(
   *                                1, param1, param1, param1, param1)
   *                         (broadcast to all four lanes)
   *   @0x1c22cb..0x1c22d5   return m_hgcInner
   *   (skip path)          return `this`
   */
  GetOutput(renderer: HGRenderer): HGSmDecN | HGSmDecN_Shader_Inner {
    // @0x1c225a xorps %xmm0,%xmm0        ; xmm0 = 0.0f
    // @0x1c225d ucomiss 0x1a0(%rdi),%xmm0 ; cmp 0.0f, param0
    // @0x1c2264 jae 0x1c22d2             ; if 0.0f >= param0 -> skip
    //
    // JAE = CF=0 = "0.0 is not below param0". Under ucomiss:
    //   param0 > 0.0        -> CF=0, ZF=0, PF=0 -> JAE fires (SKIP wiring)
    //                          WAIT — that's the opposite of what we want.
    //
    // Let me re-verify: `ucomiss %xmm0, 0x1a0(%rdi)` in AT&T means
    //   ucomiss SRC1=%xmm0, SRC2=0x1a0(%rdi)   (SRC1 is the FIRST source in
    //                                            AT&T's src,dst ordering.)
    //   -> BUT UCOMISS is one of the 2-operand instructions where the DEST
    //      slot in AT&T is actually SRC1 for the CPU. Intel-form:
    //      UCOMISS xmm0, [rdi+0x1a0]  → compare xmm0 with [rdi+0x1a0].
    //   Result: ZF/PF/CF reflect (xmm0 <op> [mem]).
    //     xmm0 == 0.0f, [mem] == param0.
    //     0.0 < param0 -> CF=1 (xmm0 below [mem]).
    //     0.0 > param0 -> CF=0, ZF=0.
    //     0.0 == param0 -> ZF=1, CF=0.
    //     any NaN -> PF=1, ZF=1, CF=1.
    //   JAE = CF=0.
    //   -> JAE fires iff (0.0 > param0) OR (0.0 == param0) — that is,
    //      "param0 <= 0". NaN sets CF=1 so JAE does NOT fire on NaN.
    //
    //   So: 0.0 fires JAE, negative param0 fires JAE, positive skips it.
    //       NaN does NOT fire JAE — falls through to the wiring path.
    //
    // Faithful port: `if (0.0 >= param0)` short-circuits (skip wiring),
    // matching the SKIP-when-not-positive semantic. NaN gets the wiring
    // path (because `0.0 >= NaN` is `false` in JS, same as ucomiss/JAE).
    if (Math.fround(0) >= Math.fround(this.param0)) {
      // @0x1c22d2 movq %rbx, %rax   ; return `this` (%rbx never touched
      //                              on the skip path).
      return this;
    }
    // --- param0 > 0 (or NaN) — wire input + push params ---
    // @0x1c2266 movq 0x198(%rbx), %r14   ; %r14 = m_hgcInner
    const inner = this.m_hgcInner;
    if (inner === null) {
      // Not present in the asm — the field is provably non-null after C2,
      // and the asm dereferences it without a null check @0x1c227a. We
      // guard here so TS's type system stays sound while still matching
      // the C++ contract (never null after ctor).
      throw new Error(
        "HGSmDecN::GetOutput @Helium 0x1c2266: m_hgcInner is null; " +
          "the C++ contract guarantees it non-null after C2 @0x1c20e6.",
      );
    }
    // @0x1c2275 upstream0 = renderer->GetInput(this, 0)
    const upstream0 = HGRenderer_GetInput(renderer, this, 0);
    // @0x1c2285 inner->SetInput(0, upstream0) via vtable[0x78]
    HGNode_SetInput(inner, 0, upstream0);
    // @0x1c22a5 inner->SetParameter(0, param0, 0, 0, 0) via vtable[0x60]
    //   NB: only .x lane carries data; xmm1/xmm2/xmm3 are all `xorps`'d to
    //   zero at @0x1c229a/@0x1c229d/@0x1c22a0. Preserve verbatim.
    HGNode_SetParameter(
      inner,
      0,
      Math.fround(this.param0),
      Math.fround(0),
      Math.fround(0),
      Math.fround(0),
    );
    // @0x1c22c8 inner->SetParameter(1, param1, param1, param1, param1)
    //   NB: broadcast — movaps xmm0->xmm1/xmm2/xmm3 at @0x1c22bf..@0x1c22c5.
    const p1 = Math.fround(this.param1);
    HGNode_SetParameter(inner, 1, p1, p1, p1, p1);
    // @0x1c22cb movq 0x198(%rbx), %rbx ; @0x1c22d2 movq %rbx, %rax
    return inner;
  }
}
