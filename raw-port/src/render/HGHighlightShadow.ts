// HGHighlightShadow — Helium highlight/shadow adjust render-graph node. Framework: Helium.
//
// Symbols on Helium (x86_64 thin slice VA==offset):
//   __ZN17HGHighlightShadowC1Ev                         @0x14d150  ctor complete (tail-jmp to C2)
//   __ZN17HGHighlightShadowC2Ev                         @0x14cdf0  ctor base-subobj (real body)
//   __ZN17HGHighlightShadowD0Ev                         @0x14d2a0  deleting dtor
//   __ZN17HGHighlightShadowD1Ev                         @0x14d200  base dtor
//   __ZN17HGHighlightShadowD2Ev                         @0x14d160  base-subobj dtor
//   __ZN17HGHighlightShadow12SetParameterEiffff         @0x14d340  SetParameter(int,float,float,float,float)
//   __ZN17HGHighlightShadow9GetOutputEP10HGRenderer     @0x14d480  GetOutput(HGRenderer*)
//
// Provenance disasm files:
//   raw-port/re/disasm/Helium.HGHighlightShadow.HGHighlightShadow.s   (C1 stub @0x14d150)
//   raw-port/re/disasm/Helium.HGHighlightShadow.SetParameter.s       (SetParameter @0x14d340)
//   raw-port/re/disasm/Helium.HGHighlightShadow.~HGHighlightShadow.s (D0 @0x14d2a0)
//   (C2 body @0x14cdf0..0x14d149 read from /tmp/Helium_tV.txt; GetOutput @0x14d480 is ICF-adjacent
//    and was hand-decoded with capstone on the raw x86_64 thin-slice bytes.)
//
// FAITHFUL PORT — every function cites @Helium 0xADDR. Every numeric constant cites the address
// it was read from. Undecoded callees throw citing their FCP address (PORTING_SPEC.md Rule 3).
// Single-precision (movss/ucomiss) stores are wrapped in Math.fround (Rule 4). The NaN-ordered
// equality idiom (ucomiss + jne + jnp -> skip) is preserved with !== (not Object.is).

// ── STRUCT LAYOUT (recovered from HGHighlightShadow::HGHighlightShadow C2 @0x14cdf0..0x14d0f8) ─
//   The class inherits from HGNode (HGNode::HGNode() called @0x14ce01). Fields observed:
//     +0x00   vptr slot                       (set to HGHighlightShadow vtable payload via
//                                              `leaq 0x8d222b(%rip),%rax; movq %rax,(%rbx)` @0x14ce06
//                                              -> RIP-end=0x14ce0d, disp=0x8d222b -> target=0xa1f038)
//     +0x198  HGNode*   subA_gain0            — new HGNode(0x1a0) @0x14ce36 (basic HGNode ctor)
//     +0x1a0  HGNode*   subA_gain1            — new HGNode(0x1a0) @0x14ce5c
//     +0x1a8  HGNode*   subA_gain2            — new HGNode(0x1a0) @0x14ce7b
//     +0x1b0  HGBlur*   blurH                 — new HGBlur (0x220 bytes) @0x14ce9a
//     +0x1b8  HGBlur*   blurM                 — new HGBlur (0x220 bytes) @0x14ceb6
//     +0x1c0  HGBlur*   blurS                 — new HGBlur (0x220 bytes) @0x14ced2
//     +0x1c8  HGNode*   mixNode               — new HGNode(0x1a0) @0x14ceee (vptr @0xa1e978)
//     +0x1d0  HGNode*   outputNode            — new HGNode(0x1a0) @0x14cf4c (vptr @0xa1e738)
//     +0x1d8  u32       dirty flag            — set to 1 by SetParameter on any real change; cleared
//                                               to 0 at GetOutput entry (@0x14d4d0) once consumed.
//                                               Init to 0 @0x14ce2c.
//     +0x1dc  f32   param0 (input gain?)      — 0.0f init @0x14ce10 (movaps A[0])
//     +0x1e0  f32   param1 (mid)              — 40.0f init @0x14ce10 (movaps A[1])
//     +0x1e4  f32   param2 (highlight amt)    — 0.0f init @0x14ce10 (movaps A[2])
//     +0x1e8  f32   param3 (shadow amt)       — 40.0f init @0x14ce10 (movaps A[3])
//     +0x1ec  f32   param4 (radius)           — 200.0f init @0x14ce1e (movaps B[0])
//     +0x1f0  f32   param5                    — 0.0f init @0x14ce1e (movaps B[1])
//     +0x1f4  f32   param6                    — 0.0f init @0x14ce1e (movaps B[2])
//     +0x1f8  f32   param7 (mix?)             — 1.0f init @0x14ce1e (movaps B[3])
//
// ── seed constants (all read from Helium thin-slice @VA==offset) ───────────────────────────────
/** @const 0x859020  packed float4 = (0.0, 40.0, 0.0, 40.0)
 *  — ctor `movaps 0x70c209(%rip),%xmm0` @0x14ce10 (RIP-end=0x14ce17, disp=0x70c209 -> 0x859020)
 *  written into +0x1dc..+0x1eb via `movups %xmm0, 0x1dc(%rbx)` @0x14ce17. */
const CTOR_INIT_A: readonly [number, number, number, number] = [0.0, 40.0, 0.0, 40.0];

/** @const 0x859030  packed float4 = (200.0, 0.0, 0.0, 1.0)
 *  — ctor `movaps 0x70c20b(%rip),%xmm0` @0x14ce1e (RIP-end=0x14ce25, disp=0x70c20b -> 0x859030)
 *  written into +0x1ec..+0x1fb via `movups %xmm0, 0x1ec(%rbx)` @0x14ce25. */
const CTOR_INIT_B: readonly [number, number, number, number] = [200.0, 0.0, 0.0, 1.0];

/** @const 0x3c7cc8  f32 = 0.5  — ctor `movss 0x27ac5d(%rip),%xmm0` @0x14d063
 *  (RIP-end=0x14d06b, disp=0x27ac5d -> 0x3c7cc8). Broadcast as (0.5,0.5,0.5,0) to blur node's
 *  SetVec4 (vt[0x60]) call @0x14d079. */
const KBLUR0: number = 0.5;

/** @const 0x3ca288  f32 = 0.3333333432674408  — ctor `movss 0x27d201(%rip),%xmm0` @0x14d07f
 *  (RIP-end=0x14d087, disp=0x27d201 -> 0x3ca288). Broadcast as (1/3,1/3,1/3,0) to another blur
 *  node @0x14d095. Note: 1/3 in float32 rounds to this exact bit pattern. */
const KBLUR1: number = 0.3333333432674408;

/** @const 0x3c7cc0  f32 = 1.0  — ctor `movss 0x27ac16(%rip),%xmm0` @0x14d0a2 and again @0x14d0c2
 *  (RIP-end=0x14d0aa+0x27ac16=0x3c7cc0; and 0x14d0ca+0x27abf6=0x3c7cc0). Broadcast (1,1,1,1) to
 *  mixNode(+0x1c8) and outputNode(+0x1d0) via SetVec4 (vt[0x60]) @0x14d0b5, @0x14d0d5. */
const KONE: number = 1.0;

// ── opaque frontier types (Helium base classes; not decoded here) ──────────────────────────────
/** Base render-graph node. Layout opaque here; ctor/dtor/vt-slots resolved via HGNode.ts port. */
export interface HGNode {
  /** vt[0x18] = HGObject::Release() — called by D0 on each child @0x14d2bd/…/0x14d318. */
  Release(): void;
  /** vt[0x60] = HGNode::SetVec4(int, float, float, float, float) — called by ctor at 0x14d079,
   *  0x14d095, 0x14d0b5, 0x14d0d5 to seed default color/mix values on child nodes. */
  SetVec4(idx: number, x: number, y: number, z: number, w: number): void;
  /** vt[0x78] = HGNode::SetInput(int, HGNode*) — called by ctor 12 times @0x14cf8a..0x14d05d
   *  to wire the highlight/shadow subgraph. */
  SetInput(idx: number, src: HGNode | null): void;
}

/** HGBlur — Helium separable-blur node (0x220-byte struct). Layout opaque here; the ctor calls
 *  `HGBlur::HGBlur()` @Helium 0x1?????   (mangled __ZN6HGBlurC1Ev, at 0x14ceaa, 0x14cec6, 0x14cee2). */
export interface HGBlur extends HGNode {}

/** HGRenderer — Helium frame renderer. Only GetInput is referenced by GetOutput. */
export interface HGRenderer {
  /** HGRenderer::GetInput(HGNode*, int) @Helium 0xf2dd0 — called by GetOutput @0x14d499 with
   *  edx=0 (index=0). Returns the source-image handle for the given node. */
  GetInput(node: HGNode, idx: number): unknown;
}

/** Opaque handle returned by HGRenderer::GetInput and by GetOutput. */
export type HGImageRef = unknown;

// ── frontier: local `getSettings(float,float,settings*)` translation-unit static ────────────────
/** getSettings @Helium 0x14dca0 (mangled __ZL11getSettingsffP8settings, file-static).
 *  Fills a stack-local `settings` struct with the parameter derivation used by GetOutput. The body
 *  reads a static LUT `settingsTable` @Helium 0x859ff0 (mangled __ZL13settingsTable). Not yet
 *  transcribed — GetOutput cannot proceed until this and the LUT are decoded. */
function getSettings(_a: number, _b: number, _out: object): void {
  throw new Error('getSettings @Helium 0x14dca0 not yet transcribed');
}

// ── the class ──────────────────────────────────────────────────────────────────────────────────
export class HGHighlightShadow implements HGNode {
  // Child pipeline nodes — allocated by the ctor with `HGObject::operator new`
  // and initialized by `HGNode::HGNode()` (or `HGBlur::HGBlur()`).
  /** +0x198 */ subA_gain0!: HGNode;
  /** +0x1a0 */ subA_gain1!: HGNode;
  /** +0x1a8 */ subA_gain2!: HGNode;
  /** +0x1b0 */ blurH!: HGBlur;
  /** +0x1b8 */ blurM!: HGBlur;
  /** +0x1c0 */ blurS!: HGBlur;
  /** +0x1c8 */ mixNode!: HGNode;
  /** +0x1d0 */ outputNode!: HGNode;

  // Dirty flag — 1 if any param changed since the last GetOutput.
  /** +0x1d8 */ private dirty: number = 0;

  // 8 float parameters — see STRUCT LAYOUT block above.
  /** +0x1dc */ private p0: number = Math.fround(CTOR_INIT_A[0]);
  /** +0x1e0 */ private p1: number = Math.fround(CTOR_INIT_A[1]);
  /** +0x1e4 */ private p2: number = Math.fround(CTOR_INIT_A[2]);
  /** +0x1e8 */ private p3: number = Math.fround(CTOR_INIT_A[3]);
  /** +0x1ec */ private p4: number = Math.fround(CTOR_INIT_B[0]);
  /** +0x1f0 */ private p5: number = Math.fround(CTOR_INIT_B[1]);
  /** +0x1f4 */ private p6: number = Math.fround(CTOR_INIT_B[2]);
  /** +0x1f8 */ private p7: number = Math.fround(CTOR_INIT_B[3]);

  /**
   * HGHighlightShadow::HGHighlightShadow() @Helium 0x14cdf0 (C2, real body) and @0x14d150 (C1,
   * tail-jump to C2). The ctor is a graph builder — it allocates 8 sub-nodes (3 HGNode "gain"
   * stages, 3 HGBlur separable-blur stages, a mix node, an output node), calls each one's ctor,
   * seeds their default vec4 values via vt[0x60], and wires 12 SetInput edges (vt[0x78]) that
   * define the highlight/shadow pipeline topology.
   *
   * Because HGNode/HGBlur ctors are undecoded frontiers, the actual allocation+wiring cannot be
   * faithfully executed here. The parameter-slot initialization (which is fully decoded from
   * two `movaps` constants @0x859020 and @0x859030) is done inline by the field initializers
   * above — that part IS the transcription.
   */
  constructor() {
    // Field initializers above cover the parameter-slot writes:
    //   +0x1dc..+0x1eb = CTOR_INIT_A @0x859020    (movaps @0x14ce10, movups @0x14ce17)
    //   +0x1ec..+0x1fb = CTOR_INIT_B @0x859030    (movaps @0x14ce1e, movups @0x14ce25)
    //   +0x1d8         = 0                         (`movl $0x0, 0x1d8(%rbx)` @0x14ce2c)
    //
    // Sub-node allocation @0x14ce36..0x14cf6c and SetInput wiring @0x14cf8a..0x14d05d and SetVec4
    // seeds @0x14d079..0x14d0d5 depend on undecoded HGNode/HGBlur ctors — leaving those to the
    // frontier port (HGNode.ts / HGBlur.ts). This class's OWN work (param slots + dirty flag) is
    // fully transcribed above.
    void KBLUR0; void KBLUR1; void KONE; // referenced when the sub-node ctors are wired in.
  }

  /**
   * HGHighlightShadow::~HGHighlightShadow() @Helium 0x14d2a0 (D0, deleting), @0x14d200 (D1, base),
   * @0x14d160 (D2, base-subobj). D0 installs the base vptr (via `leaq 0x8d1d88(%rip),%rax; movq
   * %rax,(%rdi)` @0x14d2a9 -> target=0x14d2b0+0x8d1d88=0xa1f038; that's the HGHighlightShadow
   * vtable payload address itself, the "in-destructor" vtable slot used for RTTI-safe virtual
   * dispatch during teardown), then calls `Release()` (vt[0x18]) on each of the 8 sub-nodes at
   * +0x198, +0x1a0, +0x1a8, +0x1b0, +0x1b8, +0x1c0, +0x1c8, +0x1d0 (`callq *0x18(%rax)` at
   * 0x14d2bd, 0x14d2ca, 0x14d2d7, 0x14d2e4, 0x14d2f1, 0x14d2fe, 0x14d30b, 0x14d318), then invokes
   * `HGNode::~HGNode()` @0x14d31e and tail-jumps to `HGObject::operator delete` @0x14d32c.
   */
  destroy(): void {
    // Release all 8 sub-nodes (each via its vtable[0x18] slot).
    this.subA_gain0?.Release();  // @0x14d2bd
    this.subA_gain1?.Release();  // @0x14d2ca
    this.subA_gain2?.Release();  // @0x14d2d7
    this.blurH?.Release();       // @0x14d2e4
    this.blurM?.Release();       // @0x14d2f1
    this.blurS?.Release();       // @0x14d2fe
    this.mixNode?.Release();     // @0x14d30b
    this.outputNode?.Release();  // @0x14d318
    // HGNode::~HGNode() @0x14d31e and `HGObject::operator delete` @0x14d32c are the caller's
    // responsibility (JS has GC — no explicit base-dtor / operator-delete call needed).
  }

  // Interface wiring — this class IS an HGNode, so it exposes the vt-slot methods. All three are
  // inherited unchanged from HGNode (the HGHighlightShadow vtable @0xa1f038 doesn't override
  // Release/SetVec4/SetInput — only SetParameter and GetOutput are class-specific).
  /** @vt-slot 0x18 (inherited from HGNode). */
  Release(): void {
    throw new Error('HGNode::Release @Helium 0x1a0f30 not yet transcribed');
  }
  /** @vt-slot 0x60 (inherited from HGNode). */
  SetVec4(_idx: number, _x: number, _y: number, _z: number, _w: number): void {
    throw new Error('HGNode::SetVec4 vt[0x60] @Helium (callsite 0x14d079) not yet transcribed');
  }
  /** @vt-slot 0x78 (inherited from HGNode). */
  SetInput(_idx: number, _src: HGNode | null): void {
    throw new Error('HGNode::SetInput @Helium 0x11c5f0 not yet transcribed');
  }

  /**
   * HGHighlightShadow::SetParameter(int idx, float a, float b, float c, float d) @Helium 0x14d340.
   *
   * Signature: only `idx` (esi, cast from int) and `a` (xmm0) are used; b/c/d are ignored. The
   * body is a jump table over `idx` (0..7); values >=8 return -1 unchanged.
   *
   * Jump-table @0x14d45c (read from thin slice, 8 signed 32-bit displacements relative to the
   * table base 0x14d45c, per `leaq 0x10a(%rip),%rcx; movslq (%rcx,%rax,4),%rax; addq %rcx,%rax;
   * jmpq *%rax` @0x14d34b..0x14d359):
   *   idx=0 -> 0x14d35b  writes +0x1dc
   *   idx=1 -> 0x14d3ee  writes +0x1e0
   *   idx=2 -> 0x14d39b  writes +0x1e4
   *   idx=3 -> 0x14d3b8  writes +0x1e8
   *   idx=4 -> 0x14d37b  writes +0x1ec
   *   idx=5 -> 0x14d407  writes +0x1f0
   *   idx=6 -> 0x14d420  writes +0x1f4
   *   idx=7 -> 0x14d3d5  writes +0x1f8
   *
   * Each case is the same 3-line pattern:
   *   movss  field, %xmm1
   *   ucomiss %xmm0, %xmm1        ; NaN-ordered compare
   *   jne    L_do_write           ; different unordered -> write
   *   jnp    L_return_0           ; equal-and-ordered   -> no-op (return 0)
   *   L_do_write:
   *   movss  %xmm0, field
   *   jmp    L_common_tail
   *
   * Common tail @0x14d437:
   *   movl   $1, 0x1d8(%rdi)      ; dirty = 1
   *   callq  HGNode::ClearBits()  @0x14d445  (frontier)
   *   movl   $1, %eax             ; return 1
   *
   * Return semantics: 1 = changed (dirty set + ClearBits invoked), 0 = no-op (identical value
   * already stored, NaN treated as equal by `jne+jnp` short-circuit — actual FCP behavior on NaN
   * writes: if the STORED value is NaN, ucomiss sets PF=1 so `jne` (ZF=0? Actually NaN sets ZF=PF=CF=1)
   * — for NaN vs anything, `jne` (ZF=0) does not jump AND `jnp` (PF=0) does not jump either, so
   * both fall through to `L_do_write`. So a NaN-vs-non-NaN triggers a write. Only exact bit-equal
   * ordered floats short-circuit — this MUST be preserved with `!==` not Object.is, because
   * Object.is(NaN,NaN)===true would wrongly short-circuit NaN writes.), -1 = idx out of range.
   */
  SetParameter(idx: number, a: number, _b: number, _c: number, _d: number): number {
    // @0x14d340: cmpl $0x7, %esi; ja 0x14d454 -> return -1
    if ((idx >>> 0) > 7) {
      return -1; // @0x14d454: movl $0xffffffff, %eax; retq @0x14d459
    }
    // @0x14d343..0x14d359: switch on idx via jump table @0x14d45c
    // Preserve single-precision on read (movss loads from the float slot into %xmm1 unchanged
    // because the slot is already float32) and on write (movss stores %xmm0 as-is; incoming `a`
    // is xmm0 which C++ delivered as float already — we Math.fround at the store to match).
    const aF = Math.fround(a);
    let cur: number;
    switch (idx) {
      case 0: // @0x14d35b writes +0x1dc
        cur = this.p0;
        // ucomiss xmm0,xmm1; jne .W; jnp .R0  -> only skip when ordered-equal.
        if (cur !== aF || cur !== cur || aF !== aF) { this.p0 = aF; break; }
        return 0; // @0x14d451: xorl %eax,%eax; retq
      case 1: // @0x14d3ee writes +0x1e0
        cur = this.p1;
        if (cur !== aF || cur !== cur || aF !== aF) { this.p1 = aF; break; }
        return 0;
      case 2: // @0x14d39b writes +0x1e4
        cur = this.p2;
        if (cur !== aF || cur !== cur || aF !== aF) { this.p2 = aF; break; }
        return 0;
      case 3: // @0x14d3b8 writes +0x1e8
        cur = this.p3;
        if (cur !== aF || cur !== cur || aF !== aF) { this.p3 = aF; break; }
        return 0;
      case 4: // @0x14d37b writes +0x1ec
        cur = this.p4;
        if (cur !== aF || cur !== cur || aF !== aF) { this.p4 = aF; break; }
        return 0;
      case 5: // @0x14d407 writes +0x1f0
        cur = this.p5;
        if (cur !== aF || cur !== cur || aF !== aF) { this.p5 = aF; break; }
        return 0;
      case 6: // @0x14d420 writes +0x1f4
        cur = this.p6;
        if (cur !== aF || cur !== cur || aF !== aF) { this.p6 = aF; break; }
        return 0;
      case 7: // @0x14d3d5 writes +0x1f8
        cur = this.p7;
        if (cur !== aF || cur !== cur || aF !== aF) { this.p7 = aF; break; }
        return 0;
      default:
        return -1;
    }
    // Common tail @0x14d437:
    this.dirty = 1;                    // @0x14d43b: movl $1, 0x1d8(%rdi)
    this._ClearBits();                 // @0x14d445: callq HGNode::ClearBits()
    return 1;                          // @0x14d44a: movl $1, %eax; retq
  }

  /** HGNode::ClearBits() @Helium not-yet-decoded — invoked by SetParameter's common tail @0x14d445.
   *  A no-arg member on HGNode. Frontier: port when HGNode is transcribed. */
  private _ClearBits(): void {
    throw new Error('HGNode::ClearBits @Helium 0x14d445-callsite not yet transcribed');
  }

  /**
   * HGHighlightShadow::GetOutput(HGRenderer* r) @Helium 0x14d480.
   *
   * Structure (hand-decoded via capstone on the raw thin-slice bytes @0x14d480..0x14dc92; otool
   * -tV didn't emit a label here, ICF-adjacent to SetParameter):
   *   1) `r14 = HGRenderer::GetInput(r, this, 0)`  @0x14d499  (source-image handle)
   *   2) short-circuit @0x14d4a1..0x14d4bd: if `p0 <= 0.0` AND `p2 <= 0.0` (both `ucomiss 0.0,pi`
   *      with `jb`/`jae`, using @0x27a80f-relative 0.0f const at 0x3c7cc0), goto out-of-graph @0x14dc84
   *      and RETURN `outputNode` (+0x1d0) directly — no re-computation needed.
   *   3) if `dirty == 0` @0x14d4c3 -> goto 0x14dc35 (skip re-parameterization, only re-run the
   *      SetInput plumbing).
   *   4) else clear dirty @0x14d4d0 and call the file-static `getSettings(p1, p2, &localSettings)`
   *      @0x14dca0 twice — once for the highlight branch, once for the shadow branch (@0x14d535,
   *      0x14d54b) with parameters loaded from +0x1e0..+0x1f4. The `settings` struct is filled
   *      from a static LUT @0x859ff0 (`__ZL13settingsTable`).
   *   5) apply exp() (via `_exp` stub @0x3c50ea) to negated versions of the settings values, run
   *      several float-widen (cvtss2sd) + double-op cycles, then re-issue SetVec4/SetInput calls
   *      to the six child gain/blur/mix nodes to reconfigure the pipeline for this parameter set.
   *   6) return `outputNode` (+0x1d0) @0x14dc84 (mov r14,+0x1d0; mov rax,r14; leave; ret).
   *
   * Faithful transcription requires: getSettings @0x14dca0, settingsTable LUT @0x859ff0, and the
   * six SetInput/SetVec4 vtable slots on HGNode/HGBlur (frontiers). Left as a throw-stub per
   * PORTING_SPEC.md Rule 3.
   */
  GetOutput(_r: HGRenderer): HGImageRef {
    throw new Error(
      'HGHighlightShadow::GetOutput @Helium 0x14d480 not yet transcribed ' +
      '(depends on getSettings @0x14dca0, settingsTable @0x859ff0, HGNode::SetInput @0x14d0f? ' +
      'HGNode::SetVec4, HGBlur.* — call the frontier ports first)',
    );
  }
}
