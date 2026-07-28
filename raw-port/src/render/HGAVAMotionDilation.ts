// raw-port/src/render/HGAVAMotionDilation.ts
//
// FCP `HGAVAMotionDilation` — Helium "Adaptive Video Analysis: Motion
// Dilation" render-graph wrapper node. A close cousin of
// HGAVAMotionDetection: an HGNode-derived outer node that owns a single
// compute-kernel child at this+0x198 and one boolean parameter at
// this+0x1a0. The boolean, set from SetParameter(0, ...), toggles which
// of TWO different Hgc compute kernels is instantiated inside GetOutput:
//   bool==1  → HgcAVAMotionDilationInit  (initialization-only variant,
//              47-byte uniform buffer, ONE input slot).
//   bool==0  → HgcAVAMotionDilation      (full 3-input dilation kernel,
//              0x87-byte uniform buffer).
//
// Transcribed from the x86_64 slice of:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// Disassembly captured at:
//   raw-port/re/disasm/Helium.HGAVAMotionDilation.HGAVAMotionDilation.s (C1, 16 lines)
//   raw-port/re/disasm/Helium.HGAVAMotionDilation.~HGAVAMotionDilation.s (D0, 23 lines)
//   raw-port/re/disasm/Helium.HGAVAMotionDilation.SetParameter.s        (18 lines)
//   raw-port/re/disasm/Helium.HGAVAMotionDilation.GetOutput.s           (180 lines)
//   plus C2 @0x216900, D1 @0x2169c0, D2 @0x216980 extracted inline from
//   /tmp/Helium_tV.txt.
//
// Seven exported symbols owned by this class:
//   @Helium 0x216900  ~C2 (base-subobject ctor)
//   @Helium 0x216940  ~C1 (complete-object ctor — identical body)
//   @Helium 0x216980  ~D2 (base-subobject dtor)
//   @Helium 0x2169c0  ~D1 (complete-object dtor — identical body)
//   @Helium 0x216a00  ~D0 (deleting dtor — D2 body + HGObject::operator delete)
//   @Helium 0x216a50  SetParameter(int, float, float, float, float)
//   @Helium 0x216a80  GetOutput(HGRenderer*)
//
// Vtables (resolve.py Helium sym):
//   0xa30428  vtable for HGAVAMotionDilation        (outer)     [installed by ctor]
//   0xa2ffa8  vtable for HgcAVAMotionDilationInit   (child A)   [path bool==1]
//   0xa301e8  vtable for HgcAVAMotionDilation       (child B)   [path bool==0]
//
// Class layout (proved by C2 + GetOutput loads):
//   this+0x000        vtable ("HGAVAMotionDilation" @0xa30428) — set at C2+0x0e
//   this+0x008..0x190 HGNode base subobject (see HGNode.ts port)
//   this+0x198        owned Hgc*AVAMotionDilation* (compute-kernel child).
//                     Initialised to null at C2+0x18. Populated by GetOutput.
//   this+0x1a0        u8 "useInitVariant" bool. Written by SetParameter(0,...).
//                     C2 writes $0 here (byte). GetOutput reads (movzbl) it.
//
// The child (either flavor) is itself HGNode-derived and owns an aligned
// uniform buffer at (child+0x198). The alignment dance is the classic
// `leaq 0x8(%rax), %rcx ; negl %ecx ; andl 0x1f, %ecx ; leaq (%rcx,%rax), %rdx
//  ; addq $0x8, %rdx ; movq %rax, (%rcx,%rax)` — stash the raw allocation base
// 8 bytes before the 32-byte-aligned view so operator delete[] can recover it.
//
// Uniform buffer contents (offsets are into the aligned view, i.e. relative
// to child+0x198):
//
//   Path A (child = HgcAVAMotionDilationInit, buffer size 0x47 = 71 bytes):
//     +0x08, +0x18  = 4xu32 ABS_MASK  <0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0>
//                     Cited by `movaps 0x675d08(%rip), %xmm0` @GetOutput+0x61
//                     (RIP-target 0x88c7f0). Bit pattern verified byte-for-
//                     byte from Helium x86_64 slice offset 0x88c7f0:
//                       ffffffff ffffffff ffffffff 00000000
//                     Lane 3 is zero — the mask has an all-lanes-clear alpha
//                     slot (unlike ALPHA_LANE_MASK below, which clears RGB
//                     and keeps A). This is a "keep RGB, zero A" bitmask.
//     (No other writes; buffer size 0x47 leaves +0x28 onwards zero-init
//      unless the caller re-fills it downstream.)
//
//   Path B (child = HgcAVAMotionDilation, buffer size 0x87 = 135 bytes):
//     +0x08, +0x18  = 4xf32 ONE_F32  <1.0, 1.0, 1.0, 1.0>
//                     Cited by `movaps 0x1b10c7(%rip), %xmm0` @GetOutput+0xf2
//                     (RIP-target 0x3c7c40). Bit pattern verified from
//                     Helium x86_64 slice offset 0x3c7c40:
//                       0000803f 0000803f 0000803f 0000803f  (= 1.0f × 4)
//     +0x28, +0x38  = 4xf32 ZERO   <0, 0, 0, 0>
//                     Cited by `xorps %xmm0, %xmm0` @GetOutput+0x103
//                     followed by `movaps %xmm0, +0x28`/`+0x38`.
//     +0x48, +0x58  = 4xu32 ALPHA_LANE_MASK <0, 0, 0, 0xFFFFFFFF>
//                     Cited by `movaps 0x6490a9(%rip), %xmm0` @GetOutput+0x110
//                     (RIP-target 0x85fc40). Bit pattern verified:
//                       00000000 00000000 00000000 ffffffff
//                     Canonical "isolate lane 3" mask — copy alpha through.
//
// SetFlags calls after buffer population (both paths):
//   Path A: direct callq HGNode::SetFlags(child, 0, 1)          @GetOutput+0x83
//   Path B: three vtable-*0x88 SetFlags calls on the child:
//           child->SetFlags(0, 1)  @GetOutput+0x135
//           child->SetFlags(1, 1)  @GetOutput+0x14b
//           child->SetFlags(2, 1)  @GetOutput+0x161
//   Both paths: flags = (child->flags & ~0x601) | 0x401         (@+0x8d / @+0x167)
//
// GetInput/SetInput plumbing after swap:
//   Path A: only slot 0.
//     input0 = renderer->GetInput(this, 0)                       @GetOutput+0x1b1
//     child->SetInput(0, input0)                                 @GetOutput+0x235
//   Path B: slots 0, 1, 2.
//     input0 = renderer->GetInput(this, 0)  ; child->SetInput(0, input0) @+0x1d8/+0x1e8
//     input1 = renderer->GetInput(this, 1)  ; child->SetInput(1, input1) @+0x1fd/+0x210
//     input2 = renderer->GetInput(this, 2)  ; child->SetInput(2, input2) @+0x225/+0x238
//
// SetParameter semantics (SetParameter(int i, float a, float b, float c, float d)):
//   if (i != 0) return 0;                                        @0x216a56 (testl+je)
//   this->useInitVariant = (a != 0.0f || is_nan(a));             @0x216a5c..0x216a6a
//     Implemented in asm as:
//       xorps  %xmm1, %xmm1
//       ucomiss %xmm1, %xmm0          ; %xmm0 = a (first f32 arg)
//       setp    %al                   ; PF=1 → unordered (NaN operand)
//       setne   %cl                   ; ZF=0 → a != 0
//       orb     %al, %cl              ; either → 1
//       movb    %cl, 0x1a0(%rdi)      ; this->useInitVariant = %cl
//   return 0;
//
// Constructor semantics (both C1 @0x216940 and C2 @0x216900 have identical bodies):
//   0x216909  callq  HGNode::HGNode()                 ; base subobject
//   0x21690e  leaq   0x819b13(%rip), %rax             ; RIP → 0xa30428
//   0x216915  movq   %rax, (%rbx)                     ; *this = HGAVAMotionDilation vtable
//   0x216918  movq   $0x0, 0x198(%rbx)                ; this->child = null
//   0x216923  movb   $0x0, 0x1a0(%rbx)                ; this->useInitVariant = false
//   0x21692a  addq   $0x8, %rsp ; popq %rbx ; popq %rbp ; retq
//
// Destructor semantics:
//   D2 @0x216980 body:
//     leaq  0x819a9b(%rip), %rax        ; RIP → 0xa30428 (re-install vtable)
//     movq  %rax, (%rdi)
//     movq  0x198(%rdi), %rax           ; child
//     testq %rax, %rax
//     je    0x2169ab                    ; null? skip release
//     movq  (%rax), %rcx
//     callq *0x18(%rcx)                 ; child->Release()  (HGObject slot)
//     jmp   HGNode::~HGNode()           ; tail-call base dtor
//   D1 @0x2169c0 body is byte-identical to D2 (both non-deleting).
//   D0 @0x216a00 body is byte-identical to D2 plus a tail-jmp to
//   HGObject::operator delete(this) at the end (@0x216a36).
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (each throws with the exact call-site addr):
//   HGNode::HGNode()                       @Helium 0x216909 (C2)
//   HGObject::operator new(unsigned long)  @Helium 0x216a9e (GetOutput)
//   operator new[](unsigned long) [__Znam] @Helium 0x216ac7 (path A) / 0x216b58 (path B)
//   HGNode::SetFlags(int, int) [direct]    @Helium 0x216b03 (path A only)
//   child->vtable[*0x88] SetFlags          @Helium 0x216bb5 / 0x216bcb / 0x216be1 (path B)
//   child->vtable[*0x18] Release()         @Helium 0x216a22 (D2) / 0x216b32 / 0x216c0d /
//                                                          0x216c1f / 0x216c46
//   HGNode::~HGNode() [tail-jmp]           @Helium 0x216a28 (D2)
//   HGObject::operator delete(void*)       @Helium 0x216a36 (D0 tail-jmp)
//   HGRenderer::GetInput(HGNode*, int)     @Helium 0x216c31 / 0x216c58 / 0x216c7d / 0x216ca5
//   child->vtable[*0x78] SetInput          @Helium 0x216c68 / 0x216c90 / 0x216cb8
//   __clang_call_terminate                 @Helium 0x216cce / 0x216cd6 / 0x216cec / 0x216d02
//                                          (exception-unwind personality — no observable
//                                          semantics on the happy path)

import { HGObject } from "./HGObject.js";
import { HGNode } from "./HGNode.js";

/** Opaque handle for Helium's `HGRenderer*` render-graph context. */
export type HGRendererPtr = { readonly __brand: "HGRenderer" };

// ---------------------------------------------------------------------------
// Frontier callees — undecoded external calls; every stub throws with the
// exact @0xADDR of the call-site so the porting frontier can find them.
// ---------------------------------------------------------------------------

/** HGObject::operator new(size_t) — allocates the child (size 0x1a0)
 *  at GetOutput+0x1e (@0x216a9e). */
function HGObject_operatorNew(_size: number): unknown {
  throw new Error(
    "HGObject::operator new(unsigned long) not yet transcribed " +
      "(frontier callee @Helium 0x216a9e in HGAVAMotionDilation::GetOutput)",
  );
}

/** operator new[](size_t) — path A uniform-buffer alloc (0x47) at
 *  GetOutput+0x47 (@0x216ac7); path B uniform-buffer alloc (0x87) at
 *  GetOutput+0xd8 (@0x216b58). __Znam stub. */
function operatorNewArray(_size: number): Uint8Array {
  throw new Error(
    "operator new[](unsigned long) not yet transcribed " +
      "(frontier callee @Helium __Znam stub in HGAVAMotionDilation::GetOutput " +
      "@0x216ac7 (path A) / @0x216b58 (path B))",
  );
}

/** HGNode::SetFlags(int, int) — direct callq on path A @GetOutput+0x83
 *  (@0x216b03), applied to the freshly-constructed child. */
function HGNode_SetFlags(_child: unknown, _which: number, _flags: number): void {
  throw new Error(
    "HGNode::SetFlags(int, int) not yet transcribed " +
      "(frontier callee @Helium 0x216b03 in HGAVAMotionDilation::GetOutput " +
      "(path A: bool==1))",
  );
}

/** child->vtable[*0x88] SetFlags — path B calls this three times at
 *  GetOutput+0x135/+0x14b/+0x161 (@0x216bb5, 0x216bcb, 0x216be1). Per
 *  resolve.py the slot *0x88 on the child's vtable is HGNode::SetFlags. */
function child_vtable_0x88_SetFlags(
  _child: unknown,
  _which: number,
  _flags: number,
): void {
  throw new Error(
    "HGNode::SetFlags(int, int) (child vtable slot *0x88) not yet transcribed " +
      "(frontier callees @Helium 0x216bb5 / 0x216bcb / 0x216be1 in HGAVAMotionDilation::GetOutput " +
      "(path B: bool==0))",
  );
}

/** child->vtable[*0x18] Release — HGObject::Release() dispatched through
 *  the child's vtable. Used from D2 @0x216a22 (and D1/D0 counterparts) and
 *  from GetOutput's swap-in dance @0x216b32 / 0x216c0d / 0x216c1f / 0x216c46. */
function child_vtable_0x18_Release(_child: unknown): void {
  throw new Error(
    "HGObject::Release() (child vtable slot *0x18) not yet transcribed " +
      "(frontier callee @Helium 0x216a22 in HGAVAMotionDilation::~HGAVAMotionDilation; " +
      "also 0x216b32 / 0x216c0d / 0x216c1f / 0x216c46 in GetOutput swap-in)",
  );
}

/** HGRenderer::GetInput(HGNode*, int) — called from GetOutput at four
 *  call-sites: 0x216c31 (path A slot 0), 0x216c58 (path B slot 0),
 *  0x216c7d (path B slot 1), 0x216ca5 (path B slot 2). */
function HGRenderer_GetInput(
  _renderer: HGRendererPtr,
  _self: HGAVAMotionDilation,
  _slot: number,
): unknown {
  throw new Error(
    "HGRenderer::GetInput(HGNode*, int) not yet transcribed " +
      "(frontier callees @Helium 0x216c31 / 0x216c58 / 0x216c7d / 0x216ca5 " +
      "in HGAVAMotionDilation::GetOutput)",
  );
}

/** child->vtable[*0x78] SetInput — HGNode::SetInput(int, HGNode*)
 *  dispatched through child vtable. Called from GetOutput at 0x216c68
 *  (slot 0, both paths), 0x216c90 (slot 1, path B), 0x216cb8 (slot 2
 *  path B — the jmp from path A @0x216c3e also lands on this same
 *  call-site with %rsi=0 pre-loaded to select slot 0). */
function child_vtable_0x78_SetInput(
  _child: unknown,
  _slot: number,
  _input: unknown,
): void {
  throw new Error(
    "HGNode::SetInput(int, HGNode*) (child vtable slot *0x78) not yet transcribed " +
      "(frontier callees @Helium 0x216c68 / 0x216c90 / 0x216cb8 " +
      "in HGAVAMotionDilation::GetOutput)",
  );
}

// ---------------------------------------------------------------------------
// Data constants — decoded from the four RIP-relative movaps loads in
// GetOutput. Bit patterns verified against the Helium x86_64 slice.
// ---------------------------------------------------------------------------

/** @Helium __DATA_CONST @0x88c7f0 — path-A uniform, "keep RGB, zero A"
 *  bitmask: `<0xFFFFFFFF, 0xFFFFFFFF, 0xFFFFFFFF, 0x00000000>`.
 *  Loaded by `movaps 0x675d08(%rip), %xmm0` @GetOutput+0x61 (@0x216ae1),
 *  written to buffer +0x18 and +0x08. Note this is DIFFERENT from
 *  HGAVAMotionDetection's ABS_MASK (@0x3c7c30) which has all four lanes
 *  set — this variant zeroes lane 3. Verified byte pattern:
 *    ff ff ff ff  ff ff ff ff  ff ff ff ff  00 00 00 00
 */
export const HGAVAMotionDilation_RGB_MASK_ZERO_A_U32: readonly [
  number,
  number,
  number,
  number,
] = [0xffffffff, 0xffffffff, 0xffffffff, 0x00000000];

/** @Helium __DATA_CONST @0x3c7c40 — path-B uniform, `<1.0, 1.0, 1.0, 1.0>` f32.
 *  Loaded by `movaps 0x1b10c7(%rip), %xmm0` @GetOutput+0xf2 (@0x216b72),
 *  written to buffer +0x18 and +0x08. Same constant used by
 *  HGAVAMotionDetection_ONE_F32; declared independently here to keep this
 *  file self-contained per the "one class per file" rule.
 *  Verified: 00 00 80 3f × 4  (= 1.0f × 4). */
export const HGAVAMotionDilation_ONE_F32: readonly [
  number,
  number,
  number,
  number,
] = [
  Math.fround(1.0),
  Math.fround(1.0),
  Math.fround(1.0),
  Math.fround(1.0),
];

/** Path-B uniform, all-zero `<0, 0, 0, 0>` f32. Produced by
 *  `xorps %xmm0, %xmm0` @GetOutput+0x103 (@0x216b83), written to buffer
 *  +0x28 and +0x38. Not from a data-const load. */
export const HGAVAMotionDilation_ZERO_F32: readonly [
  number,
  number,
  number,
  number,
] = [
  Math.fround(0.0),
  Math.fround(0.0),
  Math.fround(0.0),
  Math.fround(0.0),
];

/** @Helium __DATA_CONST @0x85fc40 — path-B uniform, "isolate lane 3" bitmask:
 *  `<0x00000000, 0x00000000, 0x00000000, 0xFFFFFFFF>`.
 *  Loaded by `movaps 0x6490a9(%rip), %xmm0` @GetOutput+0x110 (@0x216b90),
 *  written to buffer +0x58 and +0x48. Same constant used by
 *  HGAVAMotionDetection_ALPHA_LANE_MASK_U32; declared independently here.
 *  Verified: 00 00 00 00  00 00 00 00  00 00 00 00  ff ff ff ff. */
export const HGAVAMotionDilation_ALPHA_LANE_MASK_U32: readonly [
  number,
  number,
  number,
  number,
] = [0x00000000, 0x00000000, 0x00000000, 0xffffffff];

// ---------------------------------------------------------------------------
// Class
// ---------------------------------------------------------------------------

/**
 * `HGAVAMotionDilation` — Helium two-way wrapper HGNode.
 *
 * Instances hold a single owned compute-kernel child at +0x198 and a
 * `useInitVariant` bool at +0x1a0. GetOutput instantiates one of two
 * different child classes depending on the bool:
 *
 *   bool == 1  → HgcAVAMotionDilationInit  (single-input init variant)
 *   bool == 0  → HgcAVAMotionDilation      (three-input dilation kernel)
 *
 * SetParameter(0, a, ...) sets the bool to `(a != 0.0f OR is_nan(a))`.
 * Other parameter indices are ignored.
 */
export class HGAVAMotionDilation extends HGNode {
  /** this+0x198 — owned compute-kernel child (either HgcAVAMotionDilation
   *  or HgcAVAMotionDilationInit, chosen at GetOutput time). */
  private child: unknown | null;

  /** this+0x1a0 — bool "use init variant". Written by SetParameter(0,...).
   *  Read as a `movzbl 0x1a0(%rdi), %r12d` at GetOutput+0x11 (@0x216a91). */
  private useInitVariant: boolean;

  /**
   * @Helium C2 @0x216900 / C1 @0x216940 (both bodies byte-identical).
   *
   *   0x216909  callq HGNode::HGNode()                ; base subobject ctor
   *   0x21690e  leaq  0x819b13(%rip), %rax            ; RIP → 0xa30428
   *   0x216915  movq  %rax, (%rbx)                    ; install outer vtable
   *   0x216918  movq  $0x0, 0x198(%rbx)               ; this->child = null
   *   0x216923  movb  $0x0, 0x1a0(%rbx)               ; this->useInitVariant = 0
   */
  constructor() {
    // @Helium 0x216909
    super();
    // @Helium 0x216915 — install "vtable for HGAVAMotionDilation" @0xa30428.
    // The TS model of HGObject.vtable is an integer address for provenance;
    // rewrite the outer vtable slot accordingly.
    this.vtable = 0xa30428;
    // @Helium 0x216918
    this.child = null;
    // @Helium 0x216923
    this.useInitVariant = false;
  }

  /**
   * `HGAVAMotionDilation::SetParameter(int i, float a, float b, float c, float d)`
   * — @Helium 0x216a50. Returns 0 on both branches.
   *
   *   0x216a54  testl %esi, %esi
   *   0x216a56  je    0x216a5c        ; i == 0 → real path
   *   0x216a58  xorl  %eax, %eax      ; else: return 0 immediately
   *   0x216a5a  popq  %rbp ; retq
   *   0x216a5c  xorps %xmm1, %xmm1    ; xmm1 = 0.0f
   *   0x216a5f  ucomiss %xmm1, %xmm0  ; compare a with 0.0f (unordered)
   *   0x216a62  setp   %al            ; PF=1 → unordered (NaN operand)
   *   0x216a65  setne  %cl            ; ZF=0 → a != 0
   *   0x216a68  orb    %al, %cl       ; either → 1
   *   0x216a6a  movb   %cl, 0x1a0(%rdi)   ; this->useInitVariant = %cl
   *   0x216a70  xorl   %eax, %eax     ; return 0
   *   0x216a72  popq   %rbp ; retq
   *
   * Note: `b`, `c`, `d` (xmm1..xmm3 on entry) are all ignored — the
   * function only reads `xmm0` (the first f32 arg after `int i`).
   */
  SetParameter(
    i: number,
    a: number,
    _b: number,
    _c: number,
    _d: number,
  ): number {
    // @Helium 0x216a54..0x216a5a — i != 0 → return 0
    if ((i | 0) !== 0) {
      return 0;
    }
    // @Helium 0x216a5c..0x216a6a — bool = (a != 0.0f) OR is_nan(a).
    //
    // Both operands are single-precision (movss/movaps on xmm regs); apply
    // Math.fround to `a` before the compare so the JS number is rounded to
    // f32 exactly like the machine instruction. The JS `!==` on Number
    // already implements ucomiss's "unordered → not-equal" for NaN operands
    // (NaN !== 0 is true and NaN !== NaN is true), matching the C++
    // (setp || setne) disjunction bit-for-bit.
    const aF = Math.fround(a);
    // @Helium 0x216a6a — writeback to this+0x1a0 (as a single byte).
    this.useInitVariant = aF !== 0.0 || Number.isNaN(aF);
    // @Helium 0x216a70 — return 0
    return 0;
  }

  /**
   * `HGAVAMotionDilation::GetOutput(HGRenderer* r)` — @Helium 0x216a80.
   *
   * Two branches driven by this->useInitVariant (r12b = movzbl @0x1a0):
   *   r12b == 1 → path A: HgcAVAMotionDilationInit  (small buffer, 1 input)
   *   r12b == 0 → path B: HgcAVAMotionDilation      (large buffer, 3 inputs)
   *
   * Both paths follow the same 5-stage template:
   *   (1) `HGObject::operator new(0x1a0)` — allocate raw child memory.
   *   (2) `HGNode::HGNode()` on the child (base ctor).
   *   (3) Install the child's own vtable via leaq/movq.
   *   (4) `operator new[](sizeN)` a uniform buffer; align base+8 to a
   *       32-byte boundary; stash raw ptr at (align_base - 8); populate
   *       buffer slots with RIP-relative constants (see file header for
   *       the exact map).
   *   (5) `SetFlags` on the child (direct callq on path A; three vtable
   *       *0x88 calls on path B), then `flags = (flags & ~0x601) | 0x401`.
   *
   * Then the swap-in dance: if this->child != new, release the old
   * (via vtable *0x18) and install new. Path A's post-swap flow plumbs
   * only slot 0 through `child->SetInput(0, renderer->GetInput(this, 0))`;
   * path B plumbs slots 0, 1, and 2 in that order. Both return this->child.
   */
  GetOutput(renderer: HGRendererPtr): unknown {
    // @Helium 0x216a91 — %r12b = this->useInitVariant (zero-extended byte)
    const useInit = this.useInitVariant;

    // @Helium 0x216a99..0x216aa3 — allocate child (0x1a0 bytes).
    // Note: 0x1a0 == sizeof(HGNode). The subclass adds no fields (all its
    // per-instance state lives inside the uniform buffer allocated below).
    const child = HGObject_operatorNew(0x1a0);
    // @Helium 0x216aa6..0x216aaa — cmpb $1, %r12b ; jne 0x216b41
    //   r12b == 1 → fall through to path A (init variant)
    //   r12b == 0 → jump to path B (full dilation)
    if (useInit) {
      // ================================================================
      // PATH A — HgcAVAMotionDilationInit
      // Range @Helium 0x216ab0..0x216b40 (+swap-in @0x216b1a..0x216b3c).
      // ================================================================
      // @Helium 0x216ab3 — HGNode::HGNode() on child (base ctor).
      // (In this port `child` is opaque — the HGNode ctor semantics live
      //  in HGNode.ts. We keep the call as a documented no-op site so
      //  the frontier for the "operator new" gap is visible.)

      // @Helium 0x216ab8..0x216abf — install "vtable for HgcAVAMotionDilationInit"
      //   leaq 0x8194e9(%rip), %rax   ; RIP → 0xa2ffa8
      //   movq %rax, (%r14)
      // Modelled as a comment — child.vtable is not observable from the
      //  outer class in TS.

      // @Helium 0x216ac2..0x216ac7 — operator new[](0x47).
      const rawBuffer = operatorNewArray(0x47);

      // @Helium 0x216acc..0x216add — 32-byte alignment dance:
      //   leaq  0x8(%rax), %rcx        ; rcx = base + 8
      //   negl  %ecx                   ; rcx = -(rcx)
      //   andl  $0x1f, %ecx            ; rcx = (-(base+8)) & 31
      //   leaq  (%rcx,%rax), %rdx      ; rdx = base + rcx
      //   addq  $0x8, %rdx             ; rdx = aligned base + 8
      //   movq  %rax, (%rcx,%rax)      ; stash raw base 8 bytes before view
      const aligned = alignedView32(rawBuffer);
      const dv = new DataView(
        aligned.buffer,
        aligned.byteOffset,
        aligned.byteLength,
      );

      // @Helium 0x216ae1..0x216aed — write RGB_MASK to +0x18 then +0x08.
      //   movaps 0x675d08(%rip), %xmm0   ; xmm0 = <0xFF..,0xFF..,0xFF..,0>
      //   movaps %xmm0, 0x18(%rcx,%rax)
      //   movaps %xmm0, 0x08(%rcx,%rax)
      writeVec4U32(dv, 0x18, HGAVAMotionDilation_RGB_MASK_ZERO_A_U32);
      writeVec4U32(dv, 0x08, HGAVAMotionDilation_RGB_MASK_ZERO_A_U32);

      // @Helium 0x216af2 — child->uniformBuffer = aligned view
      //   (child+0x198 = rdx). Stored on our opaque child in a documented
      //   side-channel so downstream ports can pick it up when the child
      //   class lands.
      attachChildUniform(child, aligned);

      // @Helium 0x216af9..0x216b03 — direct callq HGNode::SetFlags(child, 0, 1)
      //   movq %r14, %rdi ; xorl %esi, %esi ; movl $0x1, %edx
      HGNode_SetFlags(child, 0, 1);

      // @Helium 0x216b08..0x216b16 — flags = (child.flags & ~0x601) | 0x401
      //   movl $0xfffff9fe, %eax
      //   andl 0x10(%r14), %eax
      //   orl  $0x401, %eax
      //   movl %eax, 0x10(%r14)
      updateChildFlagsMask(child);

      // @Helium 0x216b1a..0x216b3c — swap-in dance (path A):
      //   movq 0x198(%rbx), %rdi        ; oldChild
      //   cmpq %r14, %rdi ; je 0x216c19 ; identical? release new; skip
      //   testq %rdi,%rdi ; je 0x216b35 ; null? skip release
      //   movq (%rdi), %rax ; callq *0x18(%rax) ; oldChild->Release()
      //   movq %r14, 0x198(%rbx)         ; this.child = new
      //   jmp 0x216c29                   ; jump into slot-0-only tail
      const oldChildA = this.child;
      let effectiveChildA: unknown;
      if (oldChildA === child) {
        // @Helium 0x216c19..0x216c22 — release the (just-created) new child,
        //   then re-read this.child (which stays as the identical old one).
        child_vtable_0x18_Release(child);
        effectiveChildA = this.child;
      } else {
        if (oldChildA !== null) {
          // @Helium 0x216b2f..0x216b32 — oldChild->Release()
          child_vtable_0x18_Release(oldChildA);
        }
        // @Helium 0x216b35 — this.child = new
        this.child = child;
        effectiveChildA = child;
      }

      // @Helium 0x216c29..0x216c3e — slot-0-only plumbing (path A tail).
      //   input0 = renderer->GetInput(this, 0)
      //   child->SetInput(0, input0)   ; via vtable *0x78, target @0x216cb8
      const input0A = HGRenderer_GetInput(renderer, this, 0);
      child_vtable_0x78_SetInput(effectiveChildA, 0, input0A);

      // @Helium 0x216cbb..0x216cca — return this.child.
      return this.child;
    } else {
      // ================================================================
      // PATH B — HgcAVAMotionDilation
      // Range @Helium 0x216b41..0x216cca (+ shared swap-in at 0x216bf9).
      // ================================================================
      // @Helium 0x216b44 — HGNode::HGNode() on child (base ctor).

      // @Helium 0x216b49..0x216b50 — install "vtable for HgcAVAMotionDilation"
      //   leaq 0x819698(%rip), %rax   ; RIP → 0xa301e8
      //   movq %rax, (%r14)

      // @Helium 0x216b53..0x216b58 — operator new[](0x87).
      const rawBuffer = operatorNewArray(0x87);

      // @Helium 0x216b5d..0x216b6e — 32-byte alignment dance (identical to path A).
      const aligned = alignedView32(rawBuffer);
      const dv = new DataView(
        aligned.buffer,
        aligned.byteOffset,
        aligned.byteLength,
      );

      // @Helium 0x216b72..0x216b7e — write ONE_F32 to +0x18 then +0x08.
      //   movaps 0x1b10c7(%rip), %xmm0 ; xmm0 = <1.0,1.0,1.0,1.0>
      //   movaps %xmm0, 0x18(%rcx,%rax)
      //   movaps %xmm0, 0x08(%rcx,%rax)
      writeVec4F32(dv, 0x18, HGAVAMotionDilation_ONE_F32);
      writeVec4F32(dv, 0x08, HGAVAMotionDilation_ONE_F32);

      // @Helium 0x216b83..0x216b8b — write ZERO_F32 to +0x28 then +0x38.
      //   xorps  %xmm0, %xmm0
      //   movaps %xmm0, 0x28(%rcx,%rax)
      //   movaps %xmm0, 0x38(%rcx,%rax)
      writeVec4F32(dv, 0x28, HGAVAMotionDilation_ZERO_F32);
      writeVec4F32(dv, 0x38, HGAVAMotionDilation_ZERO_F32);

      // @Helium 0x216b90..0x216b9c — write ALPHA_LANE_MASK to +0x58 then +0x48.
      //   movaps 0x6490a9(%rip), %xmm0 ; xmm0 = <0,0,0,0xFFFFFFFF>
      //   movaps %xmm0, 0x58(%rcx,%rax)
      //   movaps %xmm0, 0x48(%rcx,%rax)
      writeVec4U32(dv, 0x58, HGAVAMotionDilation_ALPHA_LANE_MASK_U32);
      writeVec4U32(dv, 0x48, HGAVAMotionDilation_ALPHA_LANE_MASK_U32);

      // @Helium 0x216ba1 — child->uniformBuffer = aligned view.
      attachChildUniform(child, aligned);

      // @Helium 0x216ba8..0x216bb5 — child->vtable[*0x88](child, 0, 1)
      //   movq  (%r14), %rax
      //   movq  %r14, %rdi ; xorl %esi, %esi ; movl $0x1, %edx
      //   callq *0x88(%rax)         ; per resolve.py: SetFlags(int, int)
      child_vtable_0x88_SetFlags(child, 0, 1);
      // @Helium 0x216bbb..0x216bcb — child->vtable[*0x88](child, 1, 1)
      child_vtable_0x88_SetFlags(child, 1, 1);
      // @Helium 0x216bd1..0x216be1 — child->vtable[*0x88](child, 2, 1)
      child_vtable_0x88_SetFlags(child, 2, 1);

      // @Helium 0x216be7..0x216bf5 — flags = (child.flags & ~0x601) | 0x401
      updateChildFlagsMask(child);

      // @Helium 0x216bf9..0x216c17 — swap-in dance (path B):
      //   movq 0x198(%rbx), %rdi ; oldChild
      //   cmpq %r14, %rdi ; je 0x216c40 ; identical? release new + fall to slot-0 tail
      //   testq %rdi,%rdi ; je 0x216c10 ; null? skip release
      //   movq (%rdi), %rax ; callq *0x18(%rax) ; oldChild->Release()
      //   movq %r14, 0x198(%rbx) ; this.child = new
      //   jmp 0x216c50           ; enter full 3-slot tail
      const oldChildB = this.child;
      let effectiveChildB: unknown;
      if (oldChildB === child) {
        // @Helium 0x216c40..0x216c49 — release the new child,
        //   re-read this.child (identical old one), fall into full 3-slot tail.
        child_vtable_0x18_Release(child);
        effectiveChildB = this.child;
      } else {
        if (oldChildB !== null) {
          // @Helium 0x216c0a..0x216c0d — oldChild->Release()
          child_vtable_0x18_Release(oldChildB);
        }
        // @Helium 0x216c10 — this.child = new
        this.child = child;
        effectiveChildB = child;
      }

      // @Helium 0x216c50..0x216c68 — slot 0:
      //   input0 = renderer->GetInput(this, 0)
      //   child->SetInput(0, input0)
      const input0B = HGRenderer_GetInput(renderer, this, 0);
      child_vtable_0x78_SetInput(effectiveChildB, 0, input0B);

      // @Helium 0x216c6b..0x216c90 — slot 1:
      //   movq 0x198(%rbx), %r14  ; reload child
      //   input1 = renderer->GetInput(this, 1)
      //   child->SetInput(1, input1)
      effectiveChildB = this.child;
      const input1B = HGRenderer_GetInput(renderer, this, 1);
      child_vtable_0x78_SetInput(effectiveChildB, 1, input1B);

      // @Helium 0x216c93..0x216cb8 — slot 2:
      //   movq 0x198(%rbx), %r14  ; reload child
      //   input2 = renderer->GetInput(this, 2)
      //   child->SetInput(2, input2)
      effectiveChildB = this.child;
      const input2B = HGRenderer_GetInput(renderer, this, 2);
      child_vtable_0x78_SetInput(effectiveChildB, 2, input2B);

      // @Helium 0x216cbb..0x216cca — return this.child.
      return this.child;
    }
  }

  /**
   * `~HGAVAMotionDilation()` (D2 — non-deleting base-subobject dtor)
   * @Helium 0x216980.
   *
   *   0x216986  leaq  0x819a9b(%rip), %rax  ; RIP → 0xa30428 (re-install outer vtable)
   *   0x21698d  movq  %rax, (%rdi)
   *   0x216990  movq  0x198(%rdi), %rax     ; child
   *   0x216997  testq %rax, %rax
   *   0x21699a  je    0x2169ab              ; null? skip release
   *   0x21699c  movq  (%rax), %rcx          ; child_vtable
   *   0x2169a2  movq  %rax, %rdi            ; arg1 = child
   *   0x2169a5  callq *0x18(%rcx)           ; child->Release()
   *   0x2169b1  jmp   HGNode::~HGNode()     ; tail-call base dtor
   */
  destroyBase(): void {
    // @Helium 0x216986..0x21698d — vtable restore. TS models via
    //   this.vtable = 0xa30428 for provenance.
    this.vtable = 0xa30428;
    // @Helium 0x216990..0x2169a8 — release child iff non-null.
    if (this.child !== null) {
      child_vtable_0x18_Release(this.child);
      // (No explicit null-out — the base dtor tail-call runs and the whole
      //  object is going away. Match the disasm which does NOT zero 0x198.)
    }
    // @Helium 0x2169b1 — tail-call HGNode::~HGNode().
    //   In TS the base's `destruct()` method mirrors this.
    super.destruct();
  }

  /**
   * `~HGAVAMotionDilation()` (D1 — complete-object non-deleting dtor)
   * @Helium 0x2169c0. Body byte-identical to D2 (both restore the vtable,
   * release the child if non-null, tail-call HGNode::~HGNode()).
   * Preserved as a distinct method for provenance parity with the ABI.
   */
  destroyComplete(): void {
    // @Helium 0x2169c6..0x2169cd — vtable restore.
    this.vtable = 0xa30428;
    // @Helium 0x2169d0..0x2169e8 — release child iff non-null.
    if (this.child !== null) {
      child_vtable_0x18_Release(this.child);
    }
    // @Helium 0x2169f1 — tail-call HGNode::~HGNode().
    super.destruct();
  }

  /**
   * `~HGAVAMotionDilation()` (D0 — deleting dtor) @Helium 0x216a00.
   * D2 body plus `HGObject::operator delete(this)` as the final tail-call
   * at @0x216a36. TS GC subsumes the raw delete; we keep the operation
   * commented so the frontier for the allocator sink stays visible.
   */
  destroyAndDelete(): void {
    // @Helium 0x216a09..0x216a10 — vtable restore.
    this.vtable = 0xa30428;
    // @Helium 0x216a13..0x216a25 — release child iff non-null.
    if (this.child !== null) {
      child_vtable_0x18_Release(this.child);
    }
    // @Helium 0x216a28 — callq HGNode::~HGNode().
    super.destruct();
    // @Helium 0x216a36 — jmp HGObject::operator delete(this).
    // JS GC subsumes this; no observable side-effect to model.
  }
}

// ---------------------------------------------------------------------------
// Aligned-buffer helper — 32-byte alignment dance @GetOutput+0x4c..0x5d
// (path A) and @+0xdd..0xee (path B). Identical in both branches; extracted
// here for reuse. Mirrors:
//   leaq   0x8(%rax), %rcx
//   negl   %ecx
//   andl   $0x1f, %ecx
//   leaq   (%rcx,%rax), %rdx
//   addq   $0x8, %rdx
//   movq   %rax, (%rcx,%rax)          ; stash raw base 8 bytes before view
// ---------------------------------------------------------------------------
function alignedView32(raw: Uint8Array): Uint8Array {
  // Allocate a fresh backing ArrayBuffer with 32 bytes of slack, then
  // pick a byteOffset such that (byteOffset & 31) === 8 to match the
  // asm's "8 bytes past a 32-byte boundary" start. Fresh ArrayBuffers
  // in JS are always at least 8-byte aligned; the modular arithmetic
  // below produces a view whose offset-0 corresponds to child+0x198.
  const slack = 32;
  const buf = new ArrayBuffer(raw.byteLength + slack);
  new Uint8Array(buf).set(raw);
  let byteOffset = 0;
  while ((byteOffset & 31) !== 8) {
    byteOffset++;
    if (byteOffset >= slack) break;
  }
  return new Uint8Array(buf, byteOffset, raw.byteLength);
}

/** Write a `<4 x u32>` (little-endian) at `off` — models
 *  `movaps %xmm0, <off>(%rcx,%rax)` where xmm0 holds a u32 constant. */
function writeVec4U32(
  dv: DataView,
  off: number,
  v: readonly [number, number, number, number],
): void {
  dv.setUint32(off + 0, v[0] >>> 0, /*little-endian*/ true);
  dv.setUint32(off + 4, v[1] >>> 0, true);
  dv.setUint32(off + 8, v[2] >>> 0, true);
  dv.setUint32(off + 12, v[3] >>> 0, true);
}

/** Write a `<4 x f32>` (little-endian) at `off` — models
 *  `movaps %xmm0, <off>(%rcx,%rax)` where xmm0 holds an f32 constant. */
function writeVec4F32(
  dv: DataView,
  off: number,
  v: readonly [number, number, number, number],
): void {
  dv.setFloat32(off + 0, Math.fround(v[0]), true);
  dv.setFloat32(off + 4, Math.fround(v[1]), true);
  dv.setFloat32(off + 8, Math.fround(v[2]), true);
  dv.setFloat32(off + 12, Math.fround(v[3]), true);
}

/**
 * Attach an aligned uniform buffer to the opaque child pointer produced
 * by HGObject::operator new. In C++ this is `movq %rdx, 0x198(%r14)` at
 * GetOutput+0x92 (path A @0x216af2) / +0x121 (path B @0x216ba1). Because
 * the child class is not yet ported in this file's scope, we route the
 * write through a side-channel on the opaque object so the buffer stays
 * live and any downstream port of HgcAVAMotionDilation / *Init can pick
 * it up at (child.__hgc_uniform).
 *
 * The frontier stub for HGObject_operatorNew currently throws before this
 * function is reached — attach is included for structural completeness so
 * that when operator new becomes a real allocator the wiring is in place.
 */
function attachChildUniform(child: unknown, buffer: Uint8Array): void {
  // In TS-land the child object is opaque; store the buffer on it via a
  // symbol-like escape hatch to keep it GC-reachable. When the real child
  // class lands, this becomes `(child as HgcAVA*).uniformBuffer = buffer`.
  (child as { __hgc_uniform?: Uint8Array }).__hgc_uniform = buffer;
}

/**
 * @Helium 0x216b08..0x216b16 (path A) / 0x216be7..0x216bf5 (path B) — the
 * post-SetFlags flags rewrite:
 *   movl  $0xfffff9fe, %eax          ; = ~0x601
 *   andl  0x10(%r14), %eax           ; eax = child.flags & ~0x601
 *   orl   $0x401, %eax
 *   movl  %eax, 0x10(%r14)           ; child.flags = eax
 *
 * The child at this point is opaque; we route the update through a
 * documented side-channel identical to attachChildUniform. When
 * HgcAVAMotionDilation / *Init are ported, this becomes a direct field
 * write to (child as HgcAVA*).flags.
 */
function updateChildFlagsMask(child: unknown): void {
  const c = child as { flags?: number };
  const cur = ((c.flags ?? 0) | 0) >>> 0;
  c.flags = ((cur & 0xfffff9fe) | 0x401) >>> 0;
}

// Re-export HGObject to silence the "unused import" lint — HGObject is the
// ultimate ancestor via HGNode → HGObject and appears in the layout comments.
// (No behavioural change; keeps the class boundary self-documenting.)
export type { HGObject };
