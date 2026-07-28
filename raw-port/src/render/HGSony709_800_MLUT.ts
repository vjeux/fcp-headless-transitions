// HGSony709_800_MLUT — Helium HGNode-lineage render-graph wrapper for the
// "Sony 709 → 800% MLUT" tone-mapping node. This is the render-graph-facing
// wrapper (HG* / uppercase); it owns a single 0x1a0-byte HgcSony709_800_MLUT
// compute kernel (Hgc* / lowercase-c) at +0x198 and pre-configures it with
// three parameter-tuples (indices 0/1/2) each frame in GetOutput.
//
// Framework: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework
// (x86_64 slice at fat-binary file offset 0x4000).
//
// Faithful transcription of exactly SIX exported symbols. Raw disasm saved to
// raw-port/re/disasm/Helium.HGSony709_800_MLUT.all.s:
//   0x104cc0  HGSony709_800_MLUT::HGSony709_800_MLUT()             [C2]
//   0x104d40  HGSony709_800_MLUT::HGSony709_800_MLUT()             [C1]
//   0x104dc0  HGSony709_800_MLUT::~HGSony709_800_MLUT()            [D2]
//   0x104e00  HGSony709_800_MLUT::~HGSony709_800_MLUT()            [D1]
//   0x104e40  HGSony709_800_MLUT::~HGSony709_800_MLUT()            [D0]
//   0x104e90  HGSony709_800_MLUT::GetOutput(HGRenderer*)
//
// VTABLE — resolved via `resolve.py Helium vtable HGSony709_800_MLUT`
// (`# HGSony709_800_MLUT vtable @0xa1a2b0; installed ptr 0xa1a2c0`):
//   *0x00 -> 0x104e00  ~HGSony709_800_MLUT() [D1]
//   *0x08 -> 0x104e40  ~HGSony709_800_MLUT() [D0]
//   *0x10 -> 0x1a0f20  HGObject::Retain()
//   *0x18 -> 0x1a0f30  HGObject::Release()
//   *0x20..*0xf8       ALL INHERITED from HGNode (this class overrides ONLY
//                      the two vdtor slots — it does not override
//                      GetOutput/RenderTile/SetParameter/etc. at the vtable
//                      level; GetOutput() below is the class-level method).
// The C2 loads `leaq 0x9155e7(%rip), %rax` @0x104cd2 (next-insn 0x104cd9 +
// 0x9155e7 = 0xa1a2c0), matching the installed vptr from resolve.py. All
// five entry points (C2, C1, D2, D1, D0) install the SAME vptr = 0xa1a2c0
// (each with its own PC-relative displacement).
//
// STRUCT LAYOUT (decoded from field references in this class's own slice):
//   +0x000 vptr                     — installed HGSony709_800_MLUT vptr
//                                     (@0x104cd9/0x104d59/0x104dcd/0x104e0d
//                                     /0x104e50 all resolve to 0xa1a2c0).
//   +0x008..+0x197  ...            — HGNode base subobject (opaque).
//   +0x198 HgcSony709_800_MLUT*     — owned kernel handle (0x1a0=416 bytes).
//                                     Allocated in C2/C1 @0x104ce1/0x104d61
//                                     via HGObject::operator new(0x1a0),
//                                     constructed via
//                                     HgcSony709_800_MLUT::HgcSony709_800_MLUT()
//                                     @0x104cec/0x104d6c, stored @0x104cf1
//                                     /0x104d71. Released by all three
//                                     dtors via vtable slot *0x18 on the
//                                     kernel (HGObject::Release).
//   sizeof(HGSony709_800_MLUT) >= 0x1a0 (last observed +0x198 is an 8-byte
//     pointer; no field access is emitted for +0x1a0 or higher).
//
// FRONTIER CALLEES (each surfaced as a throwing stub with its call site cited):
//   HGNode::HGNode()                    [C2]  @Helium call 0x104ccd, 0x104d4d
//   HGNode::~HGNode()                   [D2]  @Helium tail-jmp 0x104df1, 0x104e31
//                                              call 0x104e68 (also via unwind
//                                              paths 0x104d11/0x104d24/0x104d91
//                                              /0x104da4).
//   HGObject::operator new(unsigned long)     @Helium call 0x104ce1, 0x104d61
//                                              (0x1a0 = 416 bytes for kernel).
//   HGObject::operator delete(void*)          @Helium call 0x104d09, 0x104d89
//                                              (C2/C1 exception-unwind) and
//                                              tail-jmp 0x104e76 (D0 body).
//   HgcSony709_800_MLUT::HgcSony709_800_MLUT()  @Helium call 0x104cec, 0x104d6c
//                                              (kernel default ctor).
//   HGRenderer::GetInput(HGNode*, int)         @Helium call 0x104ea9 (with
//                                              this, 0 → returns the upstream
//                                              input HGNode at slot 0).
//   HgcSony709_800_MLUT::SetInput(int,HGNode*) [vtable slot *0x78, inherited
//                                              from HGNode::SetInput] @Helium
//                                              indirect call 0x104eb9 with
//                                              (kernel, 0, upstream-input).
//   HgcSony709_800_MLUT::SetParameter(int, float, float, float, float)
//                                              [vtable slot *0x60] @Helium
//                                              indirect calls 0x104ee3 (idx=0),
//                                              0x104f15 (idx=1), 0x104f42
//                                              (idx=2).  See parameter table
//                                              below for the exact float
//                                              literals fed at each call site.
//   HGObject::Release()                        [vtable slot *0x18] @Helium
//                                              indirect calls 0x104de5 (D2),
//                                              0x104e25 (D1), 0x104e62 (D0).
//   __Unwind_Resume                            @Helium 0x104d19, 0x104d2c,
//                                              0x104d99, 0x104dac.
//   __clang_call_terminate                     @Helium 0x104df9, 0x104e39,
//                                              0x104e7e (double-fault handler).
//
// PARAMETER LITERALS FED TO THE KERNEL IN GetOutput (RIP-relative float32
// loads decoded by seeking into the x86_64 slice at file-offset 0x4000+VA):
//
//   SetParameter(kernel, 0,  0.006666666828095913,  0.017999999225139618,
//                            0.3790000081062317,    0.0):
//     xmm0 @0x104ec6 movss 0x2cc19a(%rip) -> VA 0x3d1068 = 0x3bda740e
//                                          = 0.006666666828095913 (=1/150)
//     xmm1 @0x104ece movss 0x2cc096(%rip) -> VA 0x3d0f6c = 0x3c9374bc
//                                          = 0.017999999225139618
//     xmm2 @0x104ed6 movss 0x2cc18e(%rip) -> VA 0x3d106c = 0x3ec20c4a
//                                          = 0.3790000081062317
//     xmm3 @0x104ede xorps %xmm3, %xmm3   -> +0.0f
//     esi  @0x104ee1 xorl %esi, %esi      -> paramIndex = 0
//
//   SetParameter(kernel, 1,  4.5,
//                            1.0989999771118164,
//                           -0.0989999994635582,
//                            0.44999998807907104):
//     xmm0 @0x104ef0 movss 0x2cc094(%rip) -> VA 0x3d0f8c = 0x40900000 = 4.5f
//     xmm1 @0x104ef8 movss 0x2cc084(%rip) -> VA 0x3d0f84 = 0x3f8cac08
//                                          = 1.0989999771118164
//     xmm2 @0x104f00 movss 0x2cc080(%rip) -> VA 0x3d0f88 = 0xbdcac083
//                                          = -0.0989999994635582
//     xmm3 @0x104f08 movss 0x2cc060(%rip) -> VA 0x3d0f70 = 0x3ee66666
//                                          = 0.44999998807907104 (=0.45f)
//     esi  @0x104f10 movl $0x1, %esi      -> paramIndex = 1
//
//   SetParameter(kernel, 2,  0.125,
//                            1.090000033378601,
//                           28.96603775024414,
//                            0.0):
//     xmm0 @0x104f22 movss 0x2c5aaa(%rip) -> VA 0x3ca9d4 = 0x3e000000 = 0.125f
//     xmm1 @0x104f2a movss 0x2cc13e(%rip) -> VA 0x3d1070 = 0x3f8b851f
//                                          = 1.090000033378601 (=1.09f)
//     xmm2 @0x104f32 movss 0x2cc13a(%rip) -> VA 0x3d1074 = 0x41e7ba72
//                                          = 28.96603775024414
//     xmm3 @0x104f3a xorps %xmm3, %xmm3   -> +0.0f
//     esi  @0x104f3d movl $0x2, %esi      -> paramIndex = 2
//
// The (paramIndex, args) triples above look like the classic "1.099 * x^0.45
// - 0.099" Rec.709 OETF constants (index 1 carries the 4.5 slope + 1.099 gain
// + −0.099 offset + 0.45 gamma-exponent), with index 0 carrying the
// linearization break-point (~0.018, matching Rec.709/Rec.601) and slope
// helpers (1/150 ≈ 0.00667), and index 2 carrying "S-log-800%"-family
// coefficients (0.125 pivot; 1.09 nominal gain; 28.966 log-scale). We do
// NOT name-invent them here — every literal is transcribed verbatim from
// the disasm with its @VA cited, matching PORTING_SPEC "no invented magic".
//
// REUSED PORTS: none. The HGColorBias / HGColorMatrix ports were consulted
// as the canonical "wrapper owns a Hgc* kernel at +0x198" template.
//
// Source disassembly saved verbatim to:
//   raw-port/re/disasm/Helium.HGSony709_800_MLUT.all.s

/**
 * Opaque handle for `HGNode` — Helium's base class for every renderable
 * node.  `HGSony709_800_MLUT` IS-A HGNode.  HGNode's own instance layout
 * occupies bytes +0x08..+0x197 and is not on this class's decoded surface.
 */
export type HGNode = object;

/**
 * Opaque handle for `HGRenderer` — Helium's per-frame render context.
 * Passed by pointer to `GetOutput`; forwarded verbatim to
 * `HGRenderer::GetInput(HGNode*, int)` @Helium 0x104ea9.
 */
export type HGRenderer = {
  /**
   * `HGRenderer::GetInput(HGNode*, int)` — frontier method invoked from
   * GetOutput @0x104ea9 with (`this = renderer`, `node = this-wrapper`,
   * `slot = 0`).  Returns the upstream HGNode wired into slot 0 of the
   * wrapper (the tone-mapping-input node).
   */
  GetInput(_node: HGNode, _slot: number): HGNode | null;
};

/**
 * Opaque handle for `HgcSony709_800_MLUT` — the owned 0x1a0-byte compute
 * kernel (uppercase HG* is the graph wrapper; lowercase-c Hgc* is the
 * kernel). Vtable at Helium 0xa55920 (installed 0xa55930).
 */
export type HgcSony709_800_MLUT = {
  /**
   * `HgcSony709_800_MLUT::SetParameter(int, float, float, float, float)`
   * — vtable slot *0x60. Called three times by GetOutput @Helium 0x104ee3
   * (idx=0), 0x104f15 (idx=1), 0x104f42 (idx=2) with the parameter tuples
   * transcribed in the file header above.
   */
  SetParameter(
    _idx: number,
    _a: number,
    _b: number,
    _c: number,
    _d: number,
  ): void;

  /**
   * `HgcSony709_800_MLUT::SetInput(int, HGNode*)` — vtable slot *0x78
   * (inherited from HGNode::SetInput @Helium 0x11c5f0). Called by
   * GetOutput @0x104eb9 with (0, upstream-input) to wire the kernel's
   * slot 0 to the graph's slot-0 upstream.
   */
  SetInput(_slot: number, _node: HGNode | null): void;

  /**
   * `HGObject::Release()` — vtable slot *0x18 (inherited @Helium 0x1a0f30).
   * Called by all three dtors of this class to release the owned kernel.
   */
  Release(): void;
};

// ─────────────────────────────────────────────────────────────────────────
// Frontier callees.
// ─────────────────────────────────────────────────────────────────────────

/**
 * `HGNode::HGNode()` [C2 — base-object ctor] — frontier method. Called
 * from this class's C2 ctor @Helium 0x104ccd and C1 ctor @0x104d4d with
 * (`this`). Constructs the HGNode base subobject.
 */
function HGNode_C2_ctor(_self: HGSony709_800_MLUT): void {
  throw new Error(
    "HGNode::HGNode() [C2] not yet transcribed " +
      "(referenced from HGSony709_800_MLUT C2 @Helium 0x104ccd, C1 @0x104d4d)",
  );
}

/**
 * `HGNode::~HGNode()` [D2 — base-object dtor] — frontier method.
 * Called from this class's D2/D1 dtors @Helium tail-jmp 0x104df1/0x104e31
 * and D0 @0x104e68, plus C2/C1 exception-unwind paths @0x104d11/0x104d24
 * /0x104d91/0x104da4.
 */
function HGNode_D2_dtor(_self: HGSony709_800_MLUT): void {
  throw new Error(
    "HGNode::~HGNode() [D2] not yet transcribed " +
      "(referenced from HGSony709_800_MLUT D2 tail-jmp @Helium 0x104df1, D1 tail-jmp @0x104e31, D0 call @0x104e68)",
  );
}

/**
 * `HGObject::operator new(unsigned long)` — frontier method. Called
 * @Helium 0x104ce1 (C2) and 0x104d61 (C1) with size = 0x1a0 = 416 bytes
 * for the owned HgcSony709_800_MLUT kernel.
 */
function HGObject_operator_new(size: number): object {
  throw new Error(
    "HGObject::operator new(unsigned long) not yet transcribed " +
      "(referenced from HGSony709_800_MLUT C2 @Helium 0x104ce1, C1 @0x104d61; requested size=" +
      String(size) +
      ")",
  );
}

/**
 * `HGObject::operator delete(void*)` — frontier method. Called from
 * this class's C2/C1 exception-unwind paths @0x104d09/0x104d89 and
 * from D0's tail-jmp @0x104e76 (the deleting-dtor "delete this;" step).
 */
function HGObject_operator_delete(_p: object): void {
  throw new Error(
    "HGObject::operator delete(void*) not yet transcribed " +
      "(referenced from HGSony709_800_MLUT C2-unwind @Helium 0x104d09, C1-unwind @0x104d89, D0 tail-jmp @0x104e76)",
  );
}

/**
 * `HgcSony709_800_MLUT::HgcSony709_800_MLUT()` — frontier method
 * (owned-kernel default ctor). Called @Helium 0x104cec (C2) and
 * 0x104d6c (C1) with (`this = freshly-new'd 0x1a0-byte block`).
 */
function HgcSony709_800_MLUT_C1_ctor(_self: HgcSony709_800_MLUT): void {
  throw new Error(
    "HgcSony709_800_MLUT::HgcSony709_800_MLUT() not yet transcribed " +
      "(referenced from HGSony709_800_MLUT C2 @Helium 0x104cec, C1 @0x104d6c)",
  );
}

// ─────────────────────────────────────────────────────────────────────────
// The class itself.
// ─────────────────────────────────────────────────────────────────────────

/**
 * `HGSony709_800_MLUT` — Helium HGNode-lineage render-graph wrapper for
 * the "Sony 709 → 800% MLUT" tone-mapping node. Owns exactly one
 * HgcSony709_800_MLUT kernel at +0x198 and, in `GetOutput`, wires the
 * kernel's input 0 to the graph's input 0 then pushes three parameter
 * tuples (indices 0/1/2) with the float literals cited in the header
 * PARAMETER LITERALS block.
 *
 * The class overrides ONLY the two vdtor slots at the vtable level —
 * `GetOutput` here is a class-level method, NOT a vtable override
 * (this class's vtable slots *0xb0/*0xb8/... all inherit from HGNode).
 */
export class HGSony709_800_MLUT {
  // +0x198 — owned kernel handle. Non-null immediately after ctor,
  // released on dtor.
  private field_0x198: HgcSony709_800_MLUT | null = null;

  /**
   * `HGSony709_800_MLUT::HGSony709_800_MLUT()` — @Helium 0x104cc0 [C2]
   * and @0x104d40 [C1]. Both bodies are byte-for-byte identical (only
   * the `leaq` displacement differs; the resolved vptr is 0xa1a2c0 in
   * both).
   *
   * DISASM (C2 @0x104cc0):
   *   0x104cc0..0x104cca  frame setup + spill %rdi(this)->%rbx
   *   0x104ccd callq HGNode::HGNode()                    ; base subobject ctor
   *   0x104cd2 leaq  0x9155e7(%rip), %rax                ; rax = 0xa1a2c0 (vptr)
   *   0x104cd9 movq  %rax, (%rbx)                        ; this->vptr = vtable+0x10
   *   0x104cdc movl  $0x1a0, %edi                        ; size = 416 bytes
   *   0x104ce1 callq HGObject::operator new(unsigned long)
   *   0x104ce6 movq  %rax, %r14                          ; r14 = fresh kernel
   *   0x104ce9 movq  %rax, %rdi
   *   0x104cec callq HgcSony709_800_MLUT::HgcSony709_800_MLUT()
   *   0x104cf1 movq  %r14, 0x198(%rbx)                   ; this->+0x198 = kernel
   *   0x104cf8..0x104d02  frame teardown + retq
   *   [0x104d03..0x104d31 : exception-unwind pad — operator delete on
   *    fresh kernel; HGNode::~HGNode() on this; __Unwind_Resume.]
   *
   * DISASM (C1 @0x104d40): identical except `leaq 0x915567(%rip)` (same
   * resolved vptr 0xa1a2c0) and unwind PCs shifted by 0x80.
   */
  constructor() {
    // @0x104ccd (C2) / @0x104d4d (C1) — construct HGNode base subobject.
    HGNode_C2_ctor(this);

    // @0x104cd9 (C2) / @0x104d59 (C1) — install vptr = 0xa1a2c0. No-op
    // in TypeScript (prototype identity).

    // @0x104ce1 (C2) / @0x104d61 (C1) — allocate 0x1a0 (416) bytes for
    // the kernel; @0x104cec (C2) / @0x104d6c (C1) — construct kernel.
    const kernel = HGObject_operator_new(0x1a0) as HgcSony709_800_MLUT;
    HgcSony709_800_MLUT_C1_ctor(kernel);

    // @0x104cf1 (C2) / @0x104d71 (C1) — this->+0x198 = kernel.
    this.field_0x198 = kernel;
  }

  /**
   * `HGSony709_800_MLUT::~HGSony709_800_MLUT()` — @Helium 0x104dc0 [D2],
   * @0x104e00 [D1], @0x104e40 [D0]. All three share the "reset vptr →
   * (if kernel != null) kernel->Release() → chain HGNode::~HGNode()"
   * spine; D0 additionally tail-calls `HGObject::operator delete(this)`.
   *
   * DISASM (D2 @0x104dc0):
   *   0x104dc0..0x104dc5  frame setup
   *   0x104dc6 leaq  0x9154f3(%rip), %rax                ; rax = 0xa1a2c0 (vptr)
   *   0x104dcd movq  %rax, (%rdi)                        ; this->vptr = same vtable
   *   0x104dd0 movq  0x198(%rdi), %rax                   ; rax = kernel
   *   0x104dd7 testq %rax, %rax
   *   0x104dda je    0x104deb                            ; skip Release on null
   *   0x104ddc movq  (%rax), %rcx                        ; rcx = kernel->vptr
   *   0x104ddf movq  %rdi, %rbx                          ; save this
   *   0x104de2 movq  %rax, %rdi                          ; rdi = kernel
   *   0x104de5 callq *0x18(%rcx)                         ; kernel->Release()
   *   0x104de8 movq  %rbx, %rdi                          ; restore this
   *   0x104deb..0x104df0  frame teardown
   *   0x104df1 jmp   HGNode::~HGNode()                   ; tail-jmp base dtor
   *
   * DISASM (D1 @0x104e00): identical spine (`leaq 0x9154b3`, same vptr;
   * Release @0x104e25; tail-jmp @0x104e31).
   *
   * DISASM (D0 @0x104e40): spine `leaq 0x915470`; Release @0x104e62;
   * `callq HGNode::~HGNode()` @0x104e68 (NOT tail-jmp — followed by
   * `jmp HGObject::operator delete(void*)` @0x104e76).
   */
  destructor(): void {
    // @0x104dcd/0x104e0d/0x104e50 — defensively re-install vptr = 0xa1a2c0.
    // No-op in TypeScript.

    // @0x104dd0/0x104e10/0x104e53 — release the kernel (if non-null).
    const kernel = this.field_0x198;
    if (kernel !== null) {
      kernel.Release();
      this.field_0x198 = null;
    }

    // @0x104df1 (D2) / @0x104e31 (D1) / @0x104e68 (D0) — chain HGNode dtor.
    HGNode_D2_dtor(this);

    // @0x104e76 (D0 only) — `HGObject::operator delete(this)`. Cited above;
    // no explicit TS mirror (JS GC reclaims once no live refs remain).
  }

  /**
   * `HGSony709_800_MLUT::GetOutput(HGRenderer*)` — @Helium 0x104e90.
   * Returns the owned kernel (`this->+0x198`) after wiring its input 0
   * to the upstream slot-0 input from the renderer and pushing three
   * parameter tuples.
   *
   * DISASM (@0x104e90):
   *   0x104e90..0x104e97  frame setup + spill %rdi(this)->%rbx
   *   0x104e9a movq  0x198(%rdi), %r14                   ; r14 = kernel
   *   0x104ea1 movq  %rsi, %rdi                          ; rdi = renderer
   *   0x104ea4 movq  %rbx, %rsi                          ; rsi = this
   *   0x104ea7 xorl  %edx, %edx                          ; edx = 0 (slot)
   *   0x104ea9 callq HGRenderer::GetInput(HGNode*, int)  ; rax = upstream input
   *   0x104eae movq  (%r14), %rcx                        ; rcx = kernel->vptr
   *   0x104eb1 movq  %r14, %rdi                          ; rdi = kernel
   *   0x104eb4 xorl  %esi, %esi                          ; esi = 0 (slot)
   *   0x104eb6 movq  %rax, %rdx                          ; rdx = upstream input
   *   0x104eb9 callq *0x78(%rcx)                         ; kernel->SetInput(0, input)
   *
   *   ; SetParameter(kernel, 0, 1/150, 0.018f, 0.379f, 0.0f)  — see header
   *   0x104ebc movq  0x198(%rbx), %rdi
   *   0x104ec3 movq  (%rdi), %rax
   *   0x104ec6 movss 0x2cc19a(%rip), %xmm0                ; VA 0x3d1068 = 0.006666...
   *   0x104ece movss 0x2cc096(%rip), %xmm1                ; VA 0x3d0f6c = 0.017999...
   *   0x104ed6 movss 0x2cc18e(%rip), %xmm2                ; VA 0x3d106c = 0.379...
   *   0x104ede xorps %xmm3, %xmm3
   *   0x104ee1 xorl  %esi, %esi
   *   0x104ee3 callq *0x60(%rax)                         ; kernel->SetParameter(0,...)
   *
   *   ; SetParameter(kernel, 1, 4.5f, 1.099f, -0.099f, 0.45f)
   *   0x104ee6 movq  0x198(%rbx), %rdi
   *   0x104eed movq  (%rdi), %rax
   *   0x104ef0 movss 0x2cc094(%rip), %xmm0                ; VA 0x3d0f8c = 4.5
   *   0x104ef8 movss 0x2cc084(%rip), %xmm1                ; VA 0x3d0f84 = 1.099
   *   0x104f00 movss 0x2cc080(%rip), %xmm2                ; VA 0x3d0f88 = -0.099
   *   0x104f08 movss 0x2cc060(%rip), %xmm3                ; VA 0x3d0f70 = 0.45
   *   0x104f10 movl  $0x1, %esi
   *   0x104f15 callq *0x60(%rax)                         ; kernel->SetParameter(1,...)
   *
   *   ; SetParameter(kernel, 2, 0.125f, 1.09f, 28.966f, 0.0f)
   *   0x104f18 movq  0x198(%rbx), %rdi
   *   0x104f1f movq  (%rdi), %rax
   *   0x104f22 movss 0x2c5aaa(%rip), %xmm0                ; VA 0x3ca9d4 = 0.125
   *   0x104f2a movss 0x2cc13e(%rip), %xmm1                ; VA 0x3d1070 = 1.09
   *   0x104f32 movss 0x2cc13a(%rip), %xmm2                ; VA 0x3d1074 = 28.966
   *   0x104f3a xorps %xmm3, %xmm3
   *   0x104f3d movl  $0x2, %esi
   *   0x104f42 callq *0x60(%rax)                         ; kernel->SetParameter(2,...)
   *
   *   0x104f45 movq  0x198(%rbx), %rax                   ; rax = kernel (return)
   *   0x104f4c..0x104f50  frame teardown + retq
   */
  GetOutput(renderer: HGRenderer): HgcSony709_800_MLUT {
    // @0x104e9a — kernel = this->+0x198.
    const kernel = this.field_0x198;
    if (kernel === null) {
      // Not a possible ctor postcondition (ctor always assigns), but
      // preserved as a defensive early-signal.
      throw new Error(
        "HGSony709_800_MLUT::GetOutput @Helium 0x104e9a — this->+0x198 is null (kernel was never constructed or has already been released)",
      );
    }

    // @0x104ea9 — input = renderer.GetInput(this, 0).
    const input = renderer.GetInput(this, 0);

    // @0x104eb9 — kernel.SetInput(0, input).
    kernel.SetInput(0, input);

    // @0x104ee3 — kernel.SetParameter(0, 1/150, 0.018, 0.379, 0.0).
    // Float32 literals recovered by seeking into the x86_64 slice at
    // file-offset 0x4000+VA (see header PARAMETER LITERALS block).
    // Wrapped in Math.fround so the values are the exact 32-bit floats
    // the CPU sees at those RIP-relative slots.
    kernel.SetParameter(
      0,
      Math.fround(0.006666666828095913), // VA 0x3d1068 = 0x3bda740e
      Math.fround(0.017999999225139618), // VA 0x3d0f6c = 0x3c9374bc
      Math.fround(0.3790000081062317), //   VA 0x3d106c = 0x3ec20c4a
      Math.fround(0.0), //                   xorps %xmm3, %xmm3 @0x104ede
    );

    // @0x104f15 — kernel.SetParameter(1, 4.5, 1.099, -0.099, 0.45).
    kernel.SetParameter(
      1,
      Math.fround(4.5), //                   VA 0x3d0f8c = 0x40900000
      Math.fround(1.0989999771118164), //    VA 0x3d0f84 = 0x3f8cac08
      Math.fround(-0.0989999994635582), //   VA 0x3d0f88 = 0xbdcac083
      Math.fround(0.44999998807907104), //   VA 0x3d0f70 = 0x3ee66666
    );

    // @0x104f42 — kernel.SetParameter(2, 0.125, 1.09, 28.966, 0.0).
    kernel.SetParameter(
      2,
      Math.fround(0.125), //                 VA 0x3ca9d4 = 0x3e000000
      Math.fround(1.090000033378601), //     VA 0x3d1070 = 0x3f8b851f
      Math.fround(28.96603775024414), //     VA 0x3d1074 = 0x41e7ba72
      Math.fround(0.0), //                   xorps %xmm3, %xmm3 @0x104f3a
    );

    // @0x104f45 — return this->+0x198 (the kernel).
    return kernel;
  }
}
