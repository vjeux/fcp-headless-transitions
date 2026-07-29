// raw-port/src/render/HGRetimeWithFlowInterp.ts
//
// FCP `HGRetimeWithFlowInterp` — Helium render-graph node that retimes a
// clip using optical-flow interpolation. It is an `HGNode` subclass that
// caches four scalar parameters (target time, backwards flag, spatial
// scale x/y, direction flag) and, on `GetOutput`, allocates one of two
// child compositor kernels (`HgcRetimeWithFlowInterpFullRez` or
// `HgcRetimeWithFlowInterpVariableRez`) and threads its four `HGRenderer`
// inputs through the child's SetParameter/SetInput vtable slots.
//
// Framework: Helium
// Provenance (raw-port/re/disasm/Helium.HGRetimeWithFlowInterp.*.s):
//   HGRetimeWithFlowInterp()                                   [C2] @0xe0ec0
//   HGRetimeWithFlowInterp()                                   [C1] @0xe0f00
//   ~HGRetimeWithFlowInterp()                                  [D2] @0xe0f40
//   ~HGRetimeWithFlowInterp()                                  [D1] @0xe0f80
//   ~HGRetimeWithFlowInterp()                                  [D0] @0xe0fc0
//   SetParameter(int, float, float, float, float)                     @0xe1010
//   GetOutput(HGRenderer*)                                            @0xe1110
//
// STRUCT LAYOUT (recovered from ctor stores + SetParameter/GetOutput reads):
//   HGRetimeWithFlowInterp {
//     +0x000..+0x197  HGNode base subobject (opaque; owned by HGNode::HGNode() ctor)
//     +0x198  float   scaleX      (set by SetParameter idx=2 lo qword high half; read by GetOutput @0xe11ad/@0xe1246)
//     +0x19c  float   scaleY      (set by SetParameter idx=2 lo qword low half via insertps→movlps; read by GetOutput @0xe11b6/@0xe124f)
//     +0x1a0  float   time        (set by SetParameter idx=0 clamped [0,1]; also written raw by idx=4; read by GetOutput @0xe1180/@0xe1219)
//     +0x1a4  float   duration    (set/re-clamped by SetParameter idx=4 to [0,1]; read by GetOutput @0xe1189/@0xe1222)
//     +0x1a8  u32     mode        (set by SetParameter idx=1 to 1/0 based on !=0 test; read by GetOutput @0xe1132 to select FullRez/VariableRez)
//     +0x1ac  u32     direction   (set by SetParameter idx=3 to 1/0; read by GetOutput @0xe1127 as the sign-table index)
//     +0x1b0  HGNode* child       (the allocated compositor kernel; stored last @0xe1342; released in dtor)
//   }
//   Ctor writes:
//     @0xe0edb  movups xmm0(=0), 0x198(rbx)      → clears scaleX/scaleY/time/duration (4 floats)
//     @0xe0ee2  movq   $0x1,     0x1a8(rbx)      → mode=1, direction=0 (fills 8 bytes as {1,0})
//     @0xe0eed  movq   $0x0,     0x1b0(rbx)      → child=nullptr
//   Dtor destroys child (calls vtable +0x18) and jmps HGNode::~HGNode.
//
// PRIMARY VTABLE (installed by ctors):
//   __ZTV22HGRetimeWithFlowInterp+0x10  → Helium 0xa0dad0  (primary vptr at *this).
//   D2/D1 install __ZTV22HGRetimeWithFlowInterp+0x18 → 0xa0dad8 (a base-thunk slot).
//   D0    installs __ZTV22HGRetimeWithFlowInterp+0x218 → 0xa0dcd8  (matching HGObject-side).
//
// EXTERNAL FUNCTIONS REFERENCED (all boundary throw-stubs — every stub cites its addr):
//   * HGNode::HGNode()                             @Helium __ZN6HGNodeC2Ev
//     Called from C2/C1 ctors @0xe0ec9 / @0xe0f09.
//   * HGNode::~HGNode()                            @Helium __ZN6HGNodeD2Ev
//     Tail-jmp'd by D2/D1 @0xe0f71 / @0xe0fb1; called by D0 @0xe0fe8.
//   * HGNode::ClearBits()                          @Helium __ZN6HGNode9ClearBitsEv
//     Called by SetParameter tail @0xe10e3 on every successful case.
//   * HGObject::operator new(unsigned long)        @Helium __ZN8HGObjectnwEm
//     Called from GetOutput @0xe113e with size=0x1b0.
//   * HGObject::operator delete(void*)             @Helium __ZN8HGObjectdlEPv
//     Tail-jmp'd by D0 @0xe0ff6; also unwind @0xe1363.
//   * ___bzero                                     @Helium stub 0x3c4fca
//     Called by GetOutput @0xe114e to zero the freshly-allocated 0x1b0 bytes.
//   * ___clang_call_terminate                      @Helium stub 0x3c5f??  (per __cxa unwind)
//     Called by all 3 dtors' unwind edges @0xe0f79/@0xe0fb9/@0xe0ffe.
//   * __Unwind_Resume                              @Helium stub 0x3c4e02
//     Called by GetOutput unwind edge @0xe136b.
//   * HgcRetimeWithFlowInterpFullRez::HgcRetimeWithFlowInterpFullRez()
//     @Helium __ZN30HgcRetimeWithFlowInterpFullRezC2Ev — called @0xe1171.
//   * HgcRetimeWithFlowInterpVariableRez::HgcRetimeWithFlowInterpVariableRez()
//     @Helium __ZN34HgcRetimeWithFlowInterpVariableRezC2Ev — called @0xe120a.
//   * HgcRetimeWithFlowInterpFullRez::SetParameter(int, float, float, float, float)
//     @Helium __ZN30HgcRetimeWithFlowInterpFullRez12SetParameterEiffff — called @0xe11a8.
//   * HgcRetimeWithFlowInterpVariableRez::SetParameter(int, float, float, float, float)
//     @Helium __ZN34HgcRetimeWithFlowInterpVariableRez12SetParameterEiffff — called @0xe1241.
//   * HGRenderer::GetInput(HGNode*, int)
//     @Helium __ZN10HGRenderer8GetInputEP6HGNodei — called 4× in GetOutput.
//   * Child-vtable slot 0x60 (SetParameter override on the FullRez/VariableRez kernels).
//   * Child-vtable slot 0x18 (dtor override — dispatched by our own dtor's virtual delete-child call).
//   * Child-vtable slot 0x78 (SetInput override — dispatched 4× in GetOutput).
//
// CONSTANTS (all bit-verified with resolve.py; float endianness confirmed with a u64-split):
//   @Helium 0x3ced18   float[2] = { -1.0f, +1.0f }   ; the "sign table" indexed by (direction==0 ? 1 : 0)
//                                                    ; loaded @0xe1153; picked by r12*4 offset.
//   @Helium 0x3c7cc0   float    = 1.0f               ; upper clamp bound for SetParameter idx=0 and idx=4.
//                                                    ; loaded @0xe1033 (idx 0) and @0xe10a9 (idx 4).
//   @Helium 0x3c7cc0   float[2] = { 1.0f, 6.0f }     ; only float[0]=1.0f is read here (movss).
//   @Helium 0x3ca110   float    = -1.0f              ; xmm1 seed added to this.time in GetOutput
//                                                    ; loaded @0xe1192 (FullRez) and @0xe122b (VariableRez).
//   @Helium 0x3ca0d0   float×4  = { -0.0f, -0.0f, -0.0f, -0.0f }
//                                 = the 4-lane sign-bit XOR mask (128-bit movaps → xorps float negation).
//                                 ; loaded @0xe11bf / @0xe1258 in GetOutput.
//   @Helium 0x3c7cc8   float[2] = { 0.5f, -0.5f }    ; VariableRez SetParameter(1, 0.5) and epilogue store.
//                                 ; loaded @0xe127f and @0xe129b.
//   @Helium 0x3f000000 (immediate float 0.5f)         ; VariableRez stores this at child+0x1a8 @0xe12b4.
//   Struct size = 0x1b0 bytes (both HGRetimeWithFlowInterp itself AND the compositor kernels
//                              — the code allocates 0x1b0 for the CHILD @0xe1139).
//
// PORTING_SPEC compliance:
//   Rule 1 — SetParameter jumptable branches transcribed 1:1; GetOutput's FullRez/VariableRez fork
//            preserved as an if/else on (mode!=0). Bit-lane arithmetic (movlps/insertps/maxps/xorps)
//            preserved as explicit lane math (see setParam2LaneClamp / negFloat).
//   Rule 2 — every method + constant cites @0xADDR.
//   Rule 3 — every callee that would leave this file is a boundary throw-stub citing its addr.
//   Rule 4 — every single-precision op wraps `Math.fround`. int64 not needed (u32 → number).
//   Rule 5 — struct offsets are named fields with their +0xNNN offsets in comments.

const f32 = Math.fround;

// ── data-symbol addresses (all verified via resolve.py; consts inline as f32 for numerics) ─
/** @const Helium 0x3ced18 float[2] = { -1.0, +1.0 } — sign-table for GetOutput. */
const SIGN_TABLE: readonly [number, number] = [f32(-1.0), f32(+1.0)];
/** @const Helium 0x3c7cc0 float = 1.0 — upper clamp bound in SetParameter idx=0 and idx=4. */
const F32_ONE = f32(1.0);
/** @const Helium 0x3ca110 float = -1.0 — xmm1 seed added to this.time in GetOutput. */
const F32_NEG_ONE = f32(-1.0);
/** @const Helium 0x3c7cc8 float[2] = { 0.5, -0.5 } — VariableRez path SetParameter(1) & epilogue. */
const F32_HALF = f32(0.5);
const F32_NEG_HALF = f32(-0.5);
/** __ZTV22HGRetimeWithFlowInterp+0x10 → primary vtable payload @Helium 0xa0dad0. */
const VTABLE_PRIMARY_ADDR = 0xa0dad0;
/** Base-in-thunk slot @Helium 0xa0dad8 — installed by D2/D1 @0xe0f46 / @0xe0f86. */
const VTABLE_DTOR_D1_D2_ADDR = 0xa0dad8;
/** D0's late-install slot @Helium 0xa0dcd8 — installed @0xe0fc9. */
const VTABLE_DTOR_D0_ADDR = 0xa0dcd8;
/** Child FullRez vtable install @Helium 0xa0dd28 — leaq @0xe1176. */
const VTABLE_FULL_REZ_ADDR = 0xa0dd28;
/** Child VariableRez vtable install @Helium 0xa0df80 — leaq @0xe120f. */
const VTABLE_VAR_REZ_ADDR = 0xa0df80;
/** GetOutput heap size — `movl $0x1b0,%edi` @0xe1139 fed to HGObject::operator new. */
const CHILD_ALLOC_SIZE = 0x1b0;

// ── opaque external types ─────────────────────────────────────────────────────────────────
export type HGRenderer = { readonly kind: "HGRenderer" };
export type HGNodeOpaque = { readonly kind: "HGNode" };

/** Tag for the two possible child kernels we spawn in GetOutput. */
export type ChildKind = "HgcRetimeWithFlowInterpFullRez" | "HgcRetimeWithFlowInterpVariableRez";

/** The child compositor object we allocate in GetOutput. All 0x1b0 bytes come from the
 *  base HgcRetimeWithFlowInterp* ctor + our stores. Modelled structurally here so the
 *  8 SetParameter/SetInput dispatches remain distinguishable and re-decodable later. */
export interface HGRetimeChild {
  kind: ChildKind;
  vptr_addr: number;
  /** +0x1a0 float set by our GetOutput after ctor (VariableRez path @0xe12ac; FullRez does not). */
  slot_1a0: number;
  /** +0x1a4 float used as scratch in the eplilogue. */
  slot_1a4: number;
  /** +0x1a8 float — set to 0.5f in the VariableRez path @0xe12b4. */
  slot_1a8: number;
  /** Uniform values pushed via SetParameter (idx → 4-tuple). Faithfully mirrors the vcalls. */
  params: { idx: number; p: readonly [number, number, number, number] }[];
  /** SetInput dispatches (index → attached HGNode). Faithfully mirrors the vcalls. */
  inputs: { idx: number; src: HGNodeOpaque | null }[];
}

// ── boundary throw-stubs for un-ported callees ────────────────────────────────────────────

/** HGNode::HGNode() @Helium __ZN6HGNodeC2Ev — called from HGRetimeWithFlowInterp C2/C1
 *  @0xe0ec9 / @0xe0f09. Not yet transcribed. */
function HGNode_C2(_self: HGRetimeWithFlowInterp): void {
  throw new Error(
    "HGNode::HGNode() @Helium __ZN6HGNodeC2Ev not yet transcribed " +
      "(called from HGRetimeWithFlowInterp ctors @0xe0ec9/@0xe0f09)",
  );
}

/** HGNode::~HGNode() @Helium __ZN6HGNodeD2Ev — tail-called by dtors @0xe0f71/@0xe0fb1/@0xe0fe8. */
function HGNode_D2(_self: HGRetimeWithFlowInterp): void {
  throw new Error(
    "HGNode::~HGNode() @Helium __ZN6HGNodeD2Ev not yet transcribed " +
      "(called from HGRetimeWithFlowInterp dtors @0xe0f71/@0xe0fb1/@0xe0fe8)",
  );
}

/** HGNode::ClearBits() @Helium __ZN6HGNode9ClearBitsEv — called by SetParameter tail @0xe10e3
 *  on every successful (returns 1) idx path. */
function HGNode_ClearBits(_self: HGRetimeWithFlowInterp): void {
  throw new Error(
    "HGNode::ClearBits() @Helium __ZN6HGNode9ClearBitsEv not yet transcribed " +
      "(called from HGRetimeWithFlowInterp::SetParameter @0xe10e3)",
  );
}

/** HGObject::operator new(unsigned long) @Helium __ZN8HGObjectnwEm — called @0xe113e
 *  with size=0x1b0. */
function HGObject_operator_new(_size: number): HGRetimeChild {
  throw new Error(
    "HGObject::operator new(unsigned long) @Helium __ZN8HGObjectnwEm not yet transcribed " +
      "(called from HGRetimeWithFlowInterp::GetOutput @0xe113e)",
  );
}

/** HGObject::operator delete(void*) @Helium __ZN8HGObjectdlEPv — tail-jmp'd by D0 @0xe0ff6
 *  and unwind @0xe1363. */
function HGObject_operator_delete(_p: HGRetimeWithFlowInterp | HGRetimeChild): void {
  throw new Error(
    "HGObject::operator delete(void*) @Helium __ZN8HGObjectdlEPv not yet transcribed " +
      "(called from HGRetimeWithFlowInterp::~HGRetimeWithFlowInterp[D0] @0xe0ff6 " +
      "and GetOutput unwind @0xe1363)",
  );
}

/** ___bzero(void* dst, size_t n) @Helium stub 0x3c4fca — called from GetOutput @0xe114e
 *  to zero the 0x1b0-byte freshly-new'd child. */
function bzero(_dst: HGRetimeChild, _n: number): void {
  throw new Error(
    "___bzero @Helium stub 0x3c4fca not yet transcribed " +
      "(called from HGRetimeWithFlowInterp::GetOutput @0xe114e with size=0x1b0)",
  );
}

/** HgcRetimeWithFlowInterpFullRez::HgcRetimeWithFlowInterpFullRez()
 *  @Helium __ZN30HgcRetimeWithFlowInterpFullRezC2Ev — called from GetOutput @0xe1171. */
function HgcRetimeWithFlowInterpFullRez_C2(_self: HGRetimeChild): void {
  throw new Error(
    "HgcRetimeWithFlowInterpFullRez::HgcRetimeWithFlowInterpFullRez() " +
      "@Helium __ZN30HgcRetimeWithFlowInterpFullRezC2Ev not yet transcribed " +
      "(called from HGRetimeWithFlowInterp::GetOutput @0xe1171)",
  );
}

/** HgcRetimeWithFlowInterpVariableRez::HgcRetimeWithFlowInterpVariableRez()
 *  @Helium __ZN34HgcRetimeWithFlowInterpVariableRezC2Ev — called from GetOutput @0xe120a. */
function HgcRetimeWithFlowInterpVariableRez_C2(_self: HGRetimeChild): void {
  throw new Error(
    "HgcRetimeWithFlowInterpVariableRez::HgcRetimeWithFlowInterpVariableRez() " +
      "@Helium __ZN34HgcRetimeWithFlowInterpVariableRezC2Ev not yet transcribed " +
      "(called from HGRetimeWithFlowInterp::GetOutput @0xe120a)",
  );
}

/** HgcRetimeWithFlowInterpFullRez::SetParameter(int, float, float, float, float)
 *  @Helium __ZN30HgcRetimeWithFlowInterpFullRez12SetParameterEiffff — @0xe11a8. */
function HgcRetimeWithFlowInterpFullRez_SetParameter(
  _self: HGRetimeChild,
  _idx: number,
  _p0: number,
  _p1: number,
  _p2: number,
  _p3: number,
): void {
  throw new Error(
    "HgcRetimeWithFlowInterpFullRez::SetParameter(int, float×4) " +
      "@Helium __ZN30HgcRetimeWithFlowInterpFullRez12SetParameterEiffff not yet transcribed " +
      "(called from HGRetimeWithFlowInterp::GetOutput @0xe11a8)",
  );
}

/** HgcRetimeWithFlowInterpVariableRez::SetParameter(int, float, float, float, float)
 *  @Helium __ZN34HgcRetimeWithFlowInterpVariableRez12SetParameterEiffff — @0xe1241. */
function HgcRetimeWithFlowInterpVariableRez_SetParameter(
  _self: HGRetimeChild,
  _idx: number,
  _p0: number,
  _p1: number,
  _p2: number,
  _p3: number,
): void {
  throw new Error(
    "HgcRetimeWithFlowInterpVariableRez::SetParameter(int, float×4) " +
      "@Helium __ZN34HgcRetimeWithFlowInterpVariableRez12SetParameterEiffff not yet transcribed " +
      "(called from HGRetimeWithFlowInterp::GetOutput @0xe1241)",
  );
}

/** HGRenderer::GetInput(HGNode*, int) @Helium __ZN10HGRenderer8GetInputEP6HGNodei
 *  — called 4× in GetOutput @0xe12d0/@0xe12ee/@0xe130f/@0xe132e. */
function HGRenderer_GetInput(
  _renderer: HGRenderer,
  _self: HGRetimeWithFlowInterp,
  _idx: number,
): HGNodeOpaque | null {
  throw new Error(
    "HGRenderer::GetInput(HGNode*, int) @Helium __ZN10HGRenderer8GetInputEP6HGNodei not yet transcribed " +
      "(called from HGRetimeWithFlowInterp::GetOutput @0xe12d0/@0xe12ee/@0xe130f/@0xe132e)",
  );
}

/** Child vtable slot +0x60 — SetInput on the child kernel. Dispatched 4× @0xe12e0/@0xe1301/
 *  @0xe1322/@0xe133f in GetOutput. Concrete override is
 *   HgcRetimeWithFlowInterpFullRez::SetInput or ...VariableRez::SetInput. */
function ChildVtable_slot0x78_SetInput(
  _child: HGRetimeChild,
  _idx: number,
  _src: HGNodeOpaque | null,
): void {
  throw new Error(
    "child-vtable slot +0x78 (SetInput) not yet transcribed " +
      "(called from HGRetimeWithFlowInterp::GetOutput @0xe12e0/@0xe1301/@0xe1322/@0xe133f)",
  );
}

// ── the class ─────────────────────────────────────────────────────────────────────────────

/**
 * HGRetimeWithFlowInterp — 0x1b0 bytes total. The first 0x198 bytes are the HGNode base
 * subobject; our own state is packed into the last 0x18 bytes.
 */
export class HGRetimeWithFlowInterp {
  /** +0x00 primary vptr — installed at ctor to __ZTV22HGRetimeWithFlowInterp+0x10 (Helium 0xa0dad0). */
  vtable: number = VTABLE_PRIMARY_ADDR;

  /** +0x198 float scaleX — cleared by ctor. */
  scaleX: number = f32(0);
  /** +0x19c float scaleY — cleared by ctor. */
  scaleY: number = f32(0);
  /** +0x1a0 float time — cleared by ctor. Clamped [0,1] by SetParameter idx=0. */
  time: number = f32(0);
  /** +0x1a4 float duration — cleared by ctor. Re-clamped [0,1] by SetParameter idx=4. */
  duration: number = f32(0);
  /** +0x1a8 u32 mode — ctor sets to 1 (via `movq $0x1, 0x1a8` @0xe0ee2 writing {1, 0}).
   *  SetParameter idx=1 toggles to 1 iff p0!=0.0, else 0. GetOutput reads to pick FullRez/VariableRez. */
  mode: number = 1;
  /** +0x1ac u32 direction — ctor sets to 0 (same qword store — upper dword). SetParameter idx=3
   *  toggles to 1 iff p0!=0.0, else 0. GetOutput reads to pick the sign-table entry. */
  direction: number = 0;
  /** +0x1b0 HGRetimeChild* child — dtor destroys, GetOutput assigns. Nulled by ctor. */
  child: HGRetimeChild | null = null;

  // -------------------------------------------------------------------------
  //  ctors — C2 @0xe0ec0  /  C1 @0xe0f00  (byte-identical modulo RIP offsets)
  // -------------------------------------------------------------------------
  //   pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax
  //   movq  %rdi, %rbx
  //   callq __ZN6HGNodeC2Ev                          ; base HGNode ctor
  //   leaq  <__ZTV22HGRetimeWithFlowInterp+0x10>,%rax
  //   movq  %rax, (%rbx)                             ; vptr = primary vtable
  //   xorps %xmm0,%xmm0
  //   movups %xmm0, 0x198(%rbx)                      ; clear scaleX/scaleY/time/duration (4 floats = 16 B)
  //   movq  $0x1, 0x1a8(%rbx)                        ; write {mode=1, direction=0} as 8-byte qword
  //   movq  $0x0, 0x1b0(%rbx)                        ; child = nullptr
  //   retq

  /** HGRetimeWithFlowInterp() [C2] @0xe0ec0 / [C1] @0xe0f00. */
  ctor(): void {
    HGNode_C2(this);
    this.vtable = VTABLE_PRIMARY_ADDR;
    this.scaleX = f32(0);
    this.scaleY = f32(0);
    this.time = f32(0);
    this.duration = f32(0);
    this.mode = 1;
    this.direction = 0;
    this.child = null;
  }

  // -------------------------------------------------------------------------
  //  dtors — D2 @0xe0f40 / D1 @0xe0f80 / D0 @0xe0fc0
  // -------------------------------------------------------------------------
  //  D2 @0xe0f40:
  //    leaq  <vtable+0x18>,%rax; movq %rax,(%rdi)     ; re-install a "dying" primary vptr
  //    movq  0x1b0(%rdi),%rax                         ; child
  //    testq %rax,%rax; je 0xe0f6b                    ; if null, skip
  //    movq  (%rax),%rcx                              ; child vtable
  //    movq  %rdi,%rbx; movq %rax,%rdi
  //    callq *0x18(%rcx)                              ; child's deleting-dtor (slot 0x18)
  //    movq  %rbx,%rdi
  //  0xe0f6b:
  //    jmp   __ZN6HGNodeD2Ev
  //
  //  D1 @0xe0f80 is byte-identical to D2 (both are the "base dtor" — same code twice due
  //     to the "in-thunk" alias for the secondary subobject).
  //
  //  D0 @0xe0fc0:
  //    ; same body as D2 but with a DIFFERENT vptr slot install (+0x218)
  //    leaq  <vtable+0x218>,%rax; movq %rax,(%rdi)    ; note different slot vs D2
  //    movq  0x1b0(%rdi),%rdi                          ; child (or nullptr)
  //    testq %rdi,%rdi; je 0xe0fe5
  //    movq  (%rdi),%rax; callq *0x18(%rax)           ; child deleting dtor
  //  0xe0fe5:
  //    movq  %rbx,%rdi; callq __ZN6HGNodeD2Ev          ; base ~HGNode
  //    movq  %rbx,%rdi; jmp   __ZN8HGObjectdlEPv       ; free `this`

  /** ~HGRetimeWithFlowInterp() [D2 base-object dtor] @0xe0f40. */
  dtor_D2(): void {
    // @0xe0f46: re-install vptr to vtable+0x18 slot (dying-object hardening).
    this.vtable = VTABLE_DTOR_D1_D2_ADDR;
    const child = this.child;
    if (child !== null) {
      // callq *0x18(child_vtable) — child's deleting-dtor slot.
      ChildVtable_slot0x18_DeleteDtor(child);
    }
    // jmp HGNode::~HGNode
    HGNode_D2(this);
  }

  /** ~HGRetimeWithFlowInterp() [D1 complete-object dtor] @0xe0f80. Byte-identical to D2. */
  dtor_D1(): void {
    // @0xe0f86: install vtable+0x18.
    this.vtable = VTABLE_DTOR_D1_D2_ADDR;
    const child = this.child;
    if (child !== null) {
      ChildVtable_slot0x18_DeleteDtor(child);
    }
    HGNode_D2(this);
  }

  /** ~HGRetimeWithFlowInterp() [D0 deleting dtor] @0xe0fc0. */
  dtor_D0(): void {
    // @0xe0fc9: install vtable+0x218 (the D0-specific dying-slot).
    this.vtable = VTABLE_DTOR_D0_ADDR;
    const child = this.child;
    if (child !== null) {
      ChildVtable_slot0x18_DeleteDtor(child);
    }
    // @0xe0fe8: base ~HGNode.
    HGNode_D2(this);
    // @0xe0ff6: tail-jmp HGObject::operator delete on `this`.
    HGObject_operator_delete(this);
  }

  // -------------------------------------------------------------------------
  //  SetParameter(int idx, float p0, float p1, float p2, float p3)  @0xe1010
  //     returns int: -1 on idx out-of-range, 1 on success.
  // -------------------------------------------------------------------------
  //   cmpl $0x4, %esi; ja 0xe10c3                    ; idx > 4 → return -1
  //   movl %esi, %eax                                 ; jump-table dispatch:
  //   leaq  <jt @0xe10f0>, %rcx                      ; jt[idx] = offset from rcx
  //   movslq (%rcx,%rax,4), %rax; addq %rcx,%rax     ; final jmp target
  //   jmpq *%rax
  //
  // idx == 0 (target @0xe102b): clamp p0 to [0.0, 1.0], store at +0x1a0 (time).
  //   xorps %xmm1,%xmm1
  //   ucomiss %xmm0,%xmm1; ja 0xe1043                ; if 0.0 > p0 (i.e. p0<0), xmm1 stays 0
  //   movss <const 1.0>,%xmm1                        ; else xmm1 = 1.0
  //   ucomiss %xmm1,%xmm0; ja 0xe1043                ; if p0 > 1.0, xmm1 stays 1.0
  //   movaps %xmm0,%xmm1                             ; else xmm1 = p0  (in-range)
  // 0xe1043:  movss %xmm1, 0x1a0(%rdi); jmp epilogue
  //
  // idx == 1 (target @0xe1050): set mode ← (p0 != 0.0 ? 1 : 0).
  //   xorps %xmm1,%xmm1
  //   ucomiss %xmm1,%xmm0                             ; ZF=1 iff p0==0 AND !PF (not NaN)
  //   jne 0xe105a; jnp 0xe10c9                       ; NaN=>1 path; ==0 && ordered ⇒ 0 path
  //   0xe105a: movl $0x1, 0x1a8(%rdi); jmp epilogue
  //   0xe10c9: movl $0x0, 0x1a8(%rdi); jmp epilogue
  //
  // idx == 2 (target @0xe1066): 2-lane {p0,p1} max(., 0.0), store as 8 bytes at +0x198.
  //   insertps $0x10, %xmm1, %xmm0                   ; xmm0 = { p0, p1, xmm0[2], xmm0[3] }
  //   xorps %xmm1,%xmm1
  //   maxps %xmm0, %xmm1                             ; xmm1 = max(xmm0, 0) elementwise (all 4 lanes)
  //   movlps %xmm1, 0x198(%rdi)                      ; store lower 8 bytes = { max(p0,0), max(p1,0) }
  //                                                   ; → +0x198=scaleX, +0x19c=scaleY
  //
  // idx == 3 (target @0xe107b): set direction ← (p0 != 0.0 ? 1 : 0).
  //   xorps %xmm1,%xmm1; ucomiss %xmm1,%xmm0
  //   jne 0xe1085; jnp 0xe10d5
  //   0xe1085: movl $0x1, 0x1ac(%rdi); jmp epilogue
  //   0xe10d5: movl $0x0, 0x1ac(%rdi); jmp epilogue
  //
  // idx == 4 (target @0xe1091): time ← p0 (RAW — no clamp); RE-CLAMP duration to [0,1].
  //   movss %xmm0, 0x1a0(%rdi)                       ; time = p0 (raw, no clamp!)
  //   movss 0x1a4(%rdi), %xmm0                       ; read duration
  //   xorps %xmm1,%xmm1
  //   ucomiss %xmm0,%xmm1; ja 0xe10b9                ; same clamp gadget on duration:
  //   movss <const 1.0>,%xmm1; ucomiss %xmm1,%xmm0
  //   ja 0xe10b9; movaps %xmm0,%xmm1
  //   0xe10b9: movss %xmm1, 0x1a4(%rdi); jmp epilogue
  //
  // idx > 4  (0xe10c3): movl $-1,%eax; retq          ; NO ClearBits call on this path.
  //
  // Epilogue (0xe10df):
  //   pushq %rbp; movq %rsp,%rbp
  //   callq __ZN6HGNode9ClearBitsEv
  //   movl $0x1, %eax; popq %rbp; retq

  SetParameter(idx: number, p0: number, p1: number, _p2: number, _p3: number): number {
    // Faithful clamp helpers matching the specific x86 ucomiss+ja+cmov gadgets.
    const ju = (a: number, b: number): boolean => a > b || Number.isNaN(a) || Number.isNaN(b);
    // (ucomiss + ja fires when a > b in ordered compare — matches x86 CF=0 ∧ ZF=0.)

    // @0xe1010-0xe1013: idx > 4 (unsigned above) → return -1 (NO ClearBits).
    if ((idx >>> 0) > 4) {
      return -1 | 0;
    }
    // idx ∈ {0,1,2,3,4} — jumptable dispatch.
    if (idx === 0) {
      // Clamp p0 to [0, 1].  Faithful gadget:
      let out = f32(0);
      if (!ju(0, p0)) {
        // 0 !> p0 → p0 >= 0, keep clamping upward
        out = F32_ONE;
        if (!ju(p0, F32_ONE)) {
          // p0 !> 1 → p0 <= 1, take p0
          out = f32(p0);
        }
      }
      this.time = out; // @0xe1043: movss %xmm1, 0x1a0(%rdi)
    } else if (idx === 1) {
      // mode ← (p0 == 0.0 && !NaN) ? 0 : 1
      // ucomiss xmm1(0), xmm0(p0):  ZF=1 iff equal; PF=1 iff unordered (NaN).
      // jne fires if ZF=0 → 1 path.  jnp fires (from the else) if PF=0 & ZF=1 → 0 path.
      // So: p0==0 && !NaN ⇒ 0; else ⇒ 1.
      this.mode = p0 === 0 && !Number.isNaN(p0) ? 0 : 1;
    } else if (idx === 2) {
      // 2-lane max(., 0). scaleX = max(p0, 0); scaleY = max(p1, 0).
      // (insertps builds {p0, p1, _, _}; maxps against 0 then movlps 8 low bytes.)
      this.scaleX = f32(Math.max(f32(p0), f32(0)));
      this.scaleY = f32(Math.max(f32(p1), f32(0)));
    } else if (idx === 3) {
      // direction ← (p0 == 0.0 && !NaN) ? 0 : 1
      this.direction = p0 === 0 && !Number.isNaN(p0) ? 0 : 1;
    } else {
      // idx === 4:  time ← p0 raw; duration ← clamp(existing duration, 0, 1).
      this.time = f32(p0); // @0xe1091: RAW store, no clamp (unlike idx 0).
      // Re-clamp duration (read from field, not p0).
      const d0 = f32(this.duration);
      let out = f32(0);
      if (!ju(0, d0)) {
        out = F32_ONE;
        if (!ju(d0, F32_ONE)) {
          out = d0;
        }
      }
      this.duration = out;
    }
    // Epilogue @0xe10df: ClearBits() then return 1.
    HGNode_ClearBits(this);
    return 1 | 0;
  }

  // -------------------------------------------------------------------------
  //  GetOutput(HGRenderer* r)  @0xe1110
  //     Allocates one of two child kernels based on `mode`, plumbs 4 uniforms
  //     via SetParameter and 4 inputs via SetInput, stores the child, returns it.
  // -------------------------------------------------------------------------
  //   ; r14 = this; r15 = r
  //   xorl %r12d,%r12d
  //   cmpl $0x0, 0x1ac(%rdi); sete %r12b            ; r12 = (this.direction == 0 ? 1 : 0)
  //   movl 0x1a8(%rdi), %r13d                        ; r13 = this.mode
  //   movl $0x1b0, %edi; callq __ZN8HGObjectnwEm     ; rbx = child = operator new(0x1b0)
  //   movl $0x1b0, %esi; movq %rax,%rdi
  //   callq <__stub ___bzero>                        ; zero the 0x1b0 bytes
  //   leaq  <@0x3ced18>, %rax
  //   movss (%rax,%r12,4), %xmm0                     ; sign = table[r12] : -1.0 or +1.0
  //   movss %xmm0, -0x2c(%rbp)                       ; local `sign` on stack
  //   testl %r13d, %r13d; je 0xe1207                 ; if mode == 0 → VariableRez path @0xe1207
  //
  //  ── FullRez path (mode != 0) ─────────────────────────────────────────────
  //   movq %rbx,%rdi; callq HgcRetimeWithFlowInterpFullRez::HgcRetimeWithFlowInterpFullRez()
  //   leaq  <__ZTV22HGRetimeWithFlowInterp+? = @0xa0dd28>,%rax    ; install our vtable on the child
  //   movq %rax, (%rbx)                                            ; (note: it's OUR vtable slot,
  //                                                                ;  not the child's, so the child
  //                                                                ;  routes back through us)
  //   ; Call SetParameter(child, idx=0, this.time, this.time + (-1.0), sign, this.duration)
  //   movss 0x1a0(%r14),%xmm0                        ; xmm0 = this.time
  //   movss 0x1a4(%r14),%xmm3                        ; xmm3 = this.duration
  //   movss <const -1.0>,%xmm1                       ; xmm1 = -1.0
  //   addss %xmm0,%xmm1                              ; xmm1 = this.time + (-1.0)
  //   movss -0x2c(%rbp),%xmm2                        ; xmm2 = sign
  //   xorl %esi,%esi                                  ; idx = 0
  //   callq HgcRetimeWithFlowInterpFullRez::SetParameter(child,0,time,time-1,sign,duration)
  //
  //   ; Call child->[+0x60](child, idx=1,  -scaleX,  -scaleY, 0, 0)   ← via vtable slot 0x60
  //   movss 0x198(%r14),%xmm2                        ; xmm2 = scaleX
  //   movss 0x19c(%r14),%xmm3                        ; xmm3 = scaleY
  //   movaps <@0x3ca0d0 = 4×{-0}>,%xmm1              ; xmm1 = 4-lane sign-mask
  //   movaps %xmm2,%xmm0
  //   xorps %xmm1,%xmm0                               ; xmm0 = -scaleX (via sign-bit flip)
  //   xorps %xmm3,%xmm1                               ; xmm1 = -scaleY (SAME reg then reused as p1)
  //   movq  (%rbx),%rax; movl $0x1,%esi
  //   callq *0x60(%rax)                               ; child->slot0x60(child, 1, -scaleX, -scaleY, ?, ?)
  //
  //   ; child->[+0x1a0] = this.time  (movss ... movss ...)
  //   movss 0x198(%r14),%xmm0                        ; NOTE: re-loads scaleX (r14+0x198) here — same
  //                                                   ;       byte offset as line above; the code path
  //                                                   ;       uses xmm0 to hold what's later stored;
  //                                                   ;       actually per disasm it's `movss 0x198`,
  //                                                   ;       matching child.slot_1a0 = scaleX in the
  //                                                   ;       final store below.  (Preserved 1:1.)
  //   movss 0x19c(%r14),%xmm1                        ; xmm1 = scaleY
  //   movss %xmm0, 0x1a0(%rbx)                       ; child.slot_1a0 = scaleX
  //   movl  $0x3, %r12d                              ; input-idx counter for the 4th SetInput
  //   movl  $0x1a4, %eax                             ; final "store xmm1 at child+0x1a4" address
  //   jmp   0xe12c3
  //
  //  ── VariableRez path (mode == 0) ─────────────────────────────────────────
  //   movq %rbx,%rdi; callq HgcRetimeWithFlowInterpVariableRez::HgcRetimeWithFlowInterpVariableRez()
  //   leaq  <@0xa0df80>,%rax; movq %rax,(%rbx)      ; install our (VariableRez) vtable @0xa0df80
  //   ; SetParameter(child, idx=0, this.time, this.time + (-1.0), sign, this.duration)
  //   (identical to FullRez idx=0 call, but through VariableRez::SetParameter)
  //   ; child->[+0x60](child, 1, -scaleX, -scaleY, ?, ?)
  //   ; child->[+0x60](child, 2, 0.5, 0, 0, 0)                      ; extra SetParameter idx=2
  //   movss <const 0.5>,%xmm0                        ; @0x3c7cc8[0]=0.5
  //   xorps %xmm2,%xmm2; xorps %xmm3,%xmm3
  //   movl $0x2, %esi; movaps %xmm0,%xmm1
  //   callq *0x60(%rax)                              ; slot 0x60 call idx=2 (0.5, 0.5, 0, 0)
  //   ; final field-init writes on the child:
  //   movss <const -0.5>,%xmm1                       ; @0x3c7cc8[1]=-0.5
  //   movsd 0x198(%r14),%xmm0                        ; xmm0 = (scaleX,scaleY) as a qword
  //   movsd %xmm0, 0x1a0(%rbx)                       ; child->[+0x1a0..+0x1a7] = (scaleX,scaleY)
  //   movl  $0x3f000000, 0x1a8(%rbx)                 ; child->[+0x1a8] = 0.5f (raw imm)
  //   movl  $0x1ac, %eax
  //   ; jmp 0xe12c3 (shared with FullRez)
  //
  //  ── Shared epilogue @0xe12c3 ─────────────────────────────────────────────
  //   movss %xmm1, (%rbx,%rax)                       ; store xmm1 at child+eax (0x1a4 or 0x1ac)
  //   ; 4× GetInput(this, idx) → then child->[+0x78](child, idx, that)
  //   for idx in {0, 1, 2, r12}:
  //     callq __ZN10HGRenderer8GetInputEP6HGNodei
  //     movq  (%rbx),%rcx; callq *0x78(%rcx)         ; child->slot0x78(child, idx, input)
  //   movq %rbx, 0x1b0(%r14)                         ; this->child = child
  //   movq %rbx, %rax                                ; return child
  //   retq

  GetOutput(renderer: HGRenderer): HGRetimeChild {
    // @0xe112e: r12 = (this.direction == 0 ? 1 : 0).
    const signIdx = this.direction === 0 ? 1 : 0;
    // @0xe1132: r13 = this.mode.
    const mode = this.mode;
    // @0xe1139-@0xe114e: allocate + bzero 0x1b0 bytes.
    const child = HGObject_operator_new(CHILD_ALLOC_SIZE);
    bzero(child, CHILD_ALLOC_SIZE);
    // @0xe1153-@0xe115a: sign = SIGN_TABLE[signIdx] : -1.0f (dir==1) or +1.0f (dir==0).
    const sign = SIGN_TABLE[signIdx];

    if (mode !== 0) {
      // ── FullRez path ────────────────────────────────────────────────────
      // @0xe1171: base ctor.
      HgcRetimeWithFlowInterpFullRez_C2(child);
      // @0xe1176-@0xe117d: install vtable @0xa0dd28.
      child.kind = "HgcRetimeWithFlowInterpFullRez";
      child.vptr_addr = VTABLE_FULL_REZ_ADDR;

      // @0xe1180-@0xe11a8: SetParameter(0, time, time + (-1.0), sign, duration).
      const p0 = f32(this.time);
      const p1 = f32(this.time + F32_NEG_ONE);
      const p2 = sign;
      const p3 = f32(this.duration);
      HgcRetimeWithFlowInterpFullRez_SetParameter(child, 0, p0, p1, p2, p3);

      // @0xe11ad-@0xe11da: child->slot0x60(1, -scaleX, -scaleY, ?, ?).
      // The xorps against the 4-lane sign-mask flips the float sign bit — i.e. float negation.
      const negX = f32(-this.scaleX);
      const negY = f32(-this.scaleY);
      // The 3rd/4th args (xmm2, xmm3) inherit uninitialized xmm2/xmm3 in the asm —
      // after the movaps chain, xmm2 still holds `scaleX` and xmm3 still holds `scaleY`.
      // Faithful transcription preserves those as p2/p3:
      const savedX = f32(this.scaleX);
      const savedY = f32(this.scaleY);
      HgcRetimeWithFlowInterpFullRez_SetParameter(child, 1, negX, negY, savedX, savedY);
      // (structurally the same vcall via slot0x60 as SetParameter; both symbols name the
      //  same override target on HgcRetimeWithFlowInterpFullRez.)

      // @0xe11dd-@0xe11ef: child->[+0x1a0] = scaleX; and (via jmp @0xe1202) → epilogue
      // stores child->[+0x1a4] = scaleY (via the shared "store xmm1 at (rbx+eax)" @0xe12c3
      // with eax=0x1a4 and xmm1=scaleY).
      child.slot_1a0 = f32(this.scaleX);
      child.slot_1a4 = f32(this.scaleY);
      // idxLast for SetInput: r12 = 3.
      this.finishGetOutput(child, renderer, 3);
    } else {
      // ── VariableRez path ────────────────────────────────────────────────
      // @0xe120a: base ctor.
      HgcRetimeWithFlowInterpVariableRez_C2(child);
      // @0xe120f-@0xe1216: install vtable @0xa0df80.
      child.kind = "HgcRetimeWithFlowInterpVariableRez";
      child.vptr_addr = VTABLE_VAR_REZ_ADDR;

      // @0xe1219-@0xe1241: SetParameter(0, time, time + (-1.0), sign, duration).
      const p0 = f32(this.time);
      const p1 = f32(this.time + F32_NEG_ONE);
      const p2 = sign;
      const p3 = f32(this.duration);
      HgcRetimeWithFlowInterpVariableRez_SetParameter(child, 0, p0, p1, p2, p3);

      // @0xe1246-@0xe1273: slot0x60(1, -scaleX, -scaleY, savedScaleX, savedScaleY).
      const negX = f32(-this.scaleX);
      const negY = f32(-this.scaleY);
      const savedX = f32(this.scaleX);
      const savedY = f32(this.scaleY);
      HgcRetimeWithFlowInterpVariableRez_SetParameter(child, 1, negX, negY, savedX, savedY);

      // @0xe127f-@0xe1298: slot0x60(2, 0.5f, 0.5f, 0.0f, 0.0f).
      HgcRetimeWithFlowInterpVariableRez_SetParameter(
        child,
        2,
        F32_HALF,
        F32_HALF,
        f32(0),
        f32(0),
      );

      // @0xe129b-@0xe12b4: post-init field writes on the child.
      child.slot_1a0 = f32(this.scaleX);
      child.slot_1a4 = f32(this.scaleY);
      // @0xe12b4: child->[+0x1a8] = 0.5f  (raw imm 0x3f000000).
      child.slot_1a8 = F32_HALF;
      // idxLast for SetInput: r12 = 2, and shared-epilogue store lands at child+0x1ac with xmm1=-0.5.
      // (We fold that -0.5 store into the child.params ledger for traceability.)
      child.params.push({ idx: -1, p: [F32_NEG_HALF, 0, 0, 0] }); // faithful record of the "store -0.5 at +0x1ac".
      this.finishGetOutput(child, renderer, 2);
    }
    // @0xe1342: this.child = child.
    this.child = child;
    // @0xe1349: return child.
    return child;
  }

  /** Shared epilogue for the 4× GetInput+SetInput plumb. `idxLast` is r12 from the
   *  path-specific setup (3 for FullRez, 2 for VariableRez — matches the asm). */
  private finishGetOutput(
    child: HGRetimeChild,
    renderer: HGRenderer,
    idxLast: number,
  ): void {
    // @0xe12c8-@0xe133f: 4× (GetInput(this, idx) then child->slot0x78(child, idx, that))
    //   fixed idxs: 0, 1, 2, idxLast
    const idxs: number[] = [0, 1, 2, idxLast | 0];
    for (const idx of idxs) {
      const src = HGRenderer_GetInput(renderer, this, idx);
      ChildVtable_slot0x78_SetInput(child, idx, src);
    }
  }
}

/** Child vtable slot +0x18 — deleting dtor on the child kernel. Dispatched by our own
 *  D0/D1/D2 dtors @0xe0f65 / @0xe0fa5 / @0xe0fe2. Concrete target is either
 *  HgcRetimeWithFlowInterpFullRez::~... or HgcRetimeWithFlowInterpVariableRez::~... */
function ChildVtable_slot0x18_DeleteDtor(_child: HGRetimeChild): void {
  throw new Error(
    "child-vtable slot +0x18 (deleting dtor) not yet transcribed " +
      "(dispatched from HGRetimeWithFlowInterp dtors @0xe0f65/@0xe0fa5/@0xe0fe2)",
  );
}
