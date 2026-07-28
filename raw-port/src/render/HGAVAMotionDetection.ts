// HGAVAMotionDetection.ts — Helium "Adaptive Video Analysis: Motion
// Detection" render-graph node. A two-input Helium HGNode wrapper that
// owns a nested HgcAVAMotionDetection compute-kernel child at this+0x198
// and forwards its two render-graph inputs onto the child via
// HGNode::SetInput.
//
// Transcribed from the x86_64 slice of:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// Disassembly captured at:
//   raw-port/re/disasm/Helium.HGAVAMotionDetection.HGAVAMotionDetection.s (C1 thunk, 6 lines)
//   raw-port/re/disasm/Helium.HGAVAMotionDetection.GetOutput.s          (37 lines)
//   (C2 body @0x214300, D2 @0x214490, D1 @0x2144d0, D0 @0x214510 recovered
//    inline from /tmp/Helium_tV.txt slice offsets 560301..560472.)
//
// Six exported symbols owned by this class:
//   @Helium 0x214300  ~C2 (base-subobject ctor — the real ctor body)
//   @Helium 0x214480  ~C1 (complete-object ctor — 5-byte thin thunk → C2)
//   @Helium 0x214490  ~D2 (base-subobject dtor)
//   @Helium 0x2144d0  ~D1 (complete-object dtor — same body shape as D2)
//   @Helium 0x214510  ~D0 (deleting dtor — D-shape + HGObject::operator delete)
//   @Helium 0x214560  GetOutput(HGRenderer*)
//
// Class layout (proved by C2 loads):
//   this+0x000  vtable ("vtable for HGAVAMotionDetection" @0xa2fd68) — set at C2+0x12
//   this+0x008..0x190  HGNode base subobject (see __ZN6HGNodeC2Ev @C2+0x0d)
//   this+0x198  owned HgcAVAMotionDetection* (the compute-kernel child).
//               Initialised to null at C2+0x1c, then overwritten at C2+0xfe.
//
// The child is a stand-alone HGObject-derived HGNode subclass. Its
// vtable is spelled "vtable for HgcAVAMotionDetection" @0xa2fb18 (its
// installed-pointer target is 0xa2fb28 — see resolve.py vtable dump). The
// slots referenced by C2 & GetOutput are:
//   *0x18  HGObject::Release()          — used in D0/D1/D2 to release child
//   *0x78  HGNode::SetInput(int, HGNode*) — used in GetOutput to plumb the
//                                          two graph inputs into the child
//   *0x88  HGNode::SetFlags(int, int)    — used in C2 at +0xc5
//
// The compute-kernel child owns a 0xa7-byte-aligned scratch/uniform buffer
// (allocated at C2+0x4b via `operator new[]`) whose base pointer is stored
// at (child+0x198). That buffer is 32-byte-aligned by a
// `ptr + 8 ; neg&31 ; base+off` dance at C2+0x50..+0x5d, and receives four
// 16-byte SSE constants at offsets 0x8/0x18/0x28/0x38/0x48/0x58/0x68/0x78:
//
//   [+0x08, +0x18]  = <7FFFFFFF, 7FFFFFFF, 7FFFFFFF, 7FFFFFFF>  (u32 lanes)
//                   → f32 (NaN, NaN, NaN, NaN); by bit pattern this is the
//                     canonical "clear sign bit" mask used by SSE `andps`
//                     to implement absolute-value on f32 vec4. Cited by
//                     `movaps 0x1b38c4(%rip), %xmm0` @C2+0x65 (@0x214365)
//                     with RIP-target 0x3c7c30. (Same constant re-used at
//                     C2+0x87 (@0x214387) — RIP 0x3c7c40 is byte-adjacent,
//                     but its bit pattern is `<1.0, 1.0, 1.0, 1.0>` — see
//                     below; the two are consecutive 16-byte data slots
//                     in the __DATA_CONST const-pool, and the movaps at
//                     +0x87 targets 0x3c7c40, not 0x3c7c30.)
//
//   [+0x28, +0x38]  = <0.2, 0.2, 0.2, 0.2> (f32)
//                     RIP target 0x88c7e0 — the motion-detection threshold
//                     (per-lane f32 bit pattern 0x3E4CCCCD).
//                     Cited by `movaps 0x678463(%rip), %xmm0` @C2+0x76.
//
//   [+0x48, +0x58]  = <1.0, 1.0, 1.0, 1.0> (f32)
//                     RIP target 0x3c7c40 (u32 lanes 0x3F800000 × 4).
//                     Cited by `movaps 0x1b38b2(%rip), %xmm0` @C2+0x87.
//
//   [+0x68, +0x78]  = <0.0, 0.0, 0.0, NaN(0xFFFFFFFF)> (f32 lanes)
//                     RIP target 0x85fc40 — u32 lanes
//                     [0x00000000, 0x00000000, 0x00000000, 0xFFFFFFFF].
//                     By bit pattern this is the canonical "isolate lane 3
//                     only" mask used by SSE `andps` to copy the alpha
//                     lane through — the render node preserves the alpha
//                     channel of its output verbatim. Cited by
//                     `movaps 0x64b8a1(%rip), %xmm0` @C2+0x98.
//
// The pattern `movaps X, +0x18 ; movaps X, +0x8` (etc.) writes the same
// 16-byte constant to TWO adjacent slots — an f32-vec4 duplicated across
// two lanes of storage. This is a well-known Helium/Hgc convention for
// laying out per-node uniform constants that the compute kernel reads as
// a struct-of-arrays: the buffer holds a doubled copy of every f32-vec4
// so a `movaps` load with either +0/+16 offset yields the same value.
//
// After the uniform buffer is populated, C2 calls
//   HGNode::SetFlags(child, 0, 1)                    @0x2143ba
//   child->vtable[*0x88](child, 1, 1)                @0x2143cf  (SetFlags again)
//   flags = (child+0x10 & ~0x601) | 0x401            @0x2143d5..2143e3
// then stores the child pointer at (this+0x198), releasing any pre-existing
// child in the standard `movq ; testq ; movq (%rdi) ; callq *0x18(%rax)`
// libc++/HGObject release-old-then-swap dance @0x2143e7..0x214405.
//
// -----------------------------------------------------------------------------
// ─── GetOutput @Helium 0x214560 ──────────────────────────────────────────────
//   __ZN20HGAVAMotionDetection9GetOutputEP10HGRenderer:
//     0x214560  frame setup
//     0x21456a  movq %rsi, %r14                ; save renderer
//     0x21456d  movq %rdi, %rbx                ; save this
//     0x214570  movq 0x198(%rdi), %r15         ; child = this->child
//     0x214577  movq %rsi, %rdi                ; arg1 = renderer
//     0x21457a  movq %rbx, %rsi                ; arg2 = this
//     0x21457d  xorl %edx, %edx                ; arg3 = 0 (slot 0)
//     0x21457f  callq HGRenderer::GetInput     ; input0 = renderer->GetInput(this, 0)
//     0x214584  movq (%r15), %rcx              ; child_vtable
//     0x214587  movq %r15, %rdi                ; arg1 = child
//     0x21458a  xorl %esi, %esi                ; arg2 = 0 (slot 0)
//     0x21458c  movq %rax, %rdx                ; arg3 = input0
//     0x21458f  callq *0x78(%rcx)              ; child->SetInput(0, input0)
//     0x214592  movq 0x198(%rbx), %r15         ; reload child (SetInput may realloc)
//     0x214599  movq %r14, %rdi                ; arg1 = renderer
//     0x21459c  movq %rbx, %rsi                ; arg2 = this
//     0x21459f  movl $0x1, %edx                ; arg3 = 1 (slot 1)
//     0x2145a4  callq HGRenderer::GetInput     ; input1 = renderer->GetInput(this, 1)
//     0x2145a9  movq (%r15), %rcx              ; child_vtable
//     0x2145ac  movq %r15, %rdi                ; arg1 = child
//     0x2145af  movl $0x1, %esi                ; arg2 = 1 (slot 1)
//     0x2145b4  movq %rax, %rdx                ; arg3 = input1
//     0x2145b7  callq *0x78(%rcx)              ; child->SetInput(1, input1)
//     0x2145ba  movq 0x198(%rbx), %rax         ; return this->child as HGNode*
//     0x2145c1..0x2145cb   frame teardown + retq
//
// Semantics: the outer node has two inputs; it fetches each input from the
// renderer, plumbs it into the child compute-kernel's matching slot, then
// returns the child as the node whose output the caller should consume.
// This is the classic "wrapper node that delegates to an internal kernel"
// pattern used throughout the Helium AVA / HGC families.
//
// -----------------------------------------------------------------------------
// ─── D2/D1/D0 shape (@0x214490 / @0x2144d0 / @0x214510) ──────────────────────
// D2 body (identical shape to D1; both are non-deleting):
//   0x214496 leaq  0x81b8cb(%rip), %rax   ; restore outer vtable ptr
//   0x21449d movq  %rax, (%rdi)
//   0x2144a0 movq  0x198(%rdi), %rax      ; child = this->child
//   0x2144a7 testq %rax, %rax
//   0x2144aa je    0x2144bb               ; null child? skip release
//   0x2144ac movq  (%rax), %rcx           ; child_vtable
//   0x2144af movq  %rdi, %rbx
//   0x2144b2 movq  %rax, %rdi             ; arg1 = child
//   0x2144b5 callq *0x18(%rcx)            ; child->Release()  (HGObject slot)
//   0x2144b8 movq  %rbx, %rdi
//   0x2144bb..0x2144c1  jmp __ZN6HGNodeD2Ev  (tail-call base HGNode dtor)
//
// D0 body @0x214510 is D2 + the outer `HGObject::operator delete(this)` tail
// (`jmp __ZN8HGObjectdlEPv` @0x214546). Modelled the same as D2 in TS since
// the raw `delete` is handled by the garbage collector.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES (undecoded — throwing stubs cite their callee addr):
//   HGNode::HGNode()                       @Helium 0x21430d  (base ctor called from C2)
//   HGObject::operator new(unsigned long)  @Helium 0x21432c  (child allocation)
//   operator new[](unsigned long)          @Helium 0x21434b  (uniform-buffer allocation, __Znam stub)
//   HGNode::SetFlags(int, int)             @Helium 0x2143ba  (called on the child)
//   HGObject::Release()  (via child *0x18) @Helium 0x2144b5 / 0x214532
//   HGNode::~HGNode()                      @Helium 0x2144c1 / 0x214538
//   HGObject::operator delete(void*)       @Helium 0x214546 / 0x214451 (unwind path)
//   __clang_call_terminate                 @Helium 0x21441e / 0x214434  (unwind personality)
//   HGRenderer::GetInput(HGNode*, int)     @Helium 0x21457f / 0x2145a4  (called from GetOutput)
//   HGNode::SetInput(int, HGNode*)  (child *0x78)  @Helium 0x21458f / 0x2145b7  (from GetOutput)

import { HGRect } from "./HGRect.js";
export { HGRect };

/** Opaque handle for Helium's `HGRenderer*` render-graph context. */
export type HGRendererPtr = { readonly __brand: "HGRenderer" };
/** Opaque handle for Helium's `HGNode*` (base or subclass). */
export type HGNodePtr = { readonly __brand: "HGNode" };

// ---------------------------------------------------------------------------
// Frontier callees — every undecoded external call from this class throws
// with the exact address it is dispatched from. When one gets ported, delete
// its stub and rewire the call-sites below.
// ---------------------------------------------------------------------------

/** HGNode::HGNode() — base-subobject ctor. Called from C2 @0x21430d and
 *  from the child ctor @0x214337. */
function HGNode_C2(_self: HGNodePtr): void {
  throw new Error(
    "HGNode::HGNode() not yet transcribed " +
      "(frontier callee @Helium 0x21430d in HGAVAMotionDetection::C2)",
  );
}

/** HGObject::operator new(size_t) — allocates the child HgcAVAMotionDetection
 *  (size 0x1a0) at C2+0x2c (@0x21432c). */
function HGObject_operatorNew(_size: number): HGNodePtr {
  throw new Error(
    "HGObject::operator new(unsigned long) not yet transcribed " +
      "(frontier callee @Helium 0x21432c in HGAVAMotionDetection::C2)",
  );
}

/** operator new[](size_t) — allocates the 0xa7-byte uniform buffer at
 *  C2+0x4b (@0x21434b, `callq __Znam` stub). */
function operatorNewArray(_size: number): Uint8Array {
  throw new Error(
    "operator new[](unsigned long) not yet transcribed " +
      "(frontier callee @Helium __Znam stub @0x21434b in HGAVAMotionDetection::C2)",
  );
}

/** HGNode::SetFlags(int, int) — called on the child @0x2143ba (via a direct
 *  callq to the symbol, not through the vtable). */
function HGNode_SetFlags(_self: HGNodePtr, _which: number, _flags: number): void {
  throw new Error(
    "HGNode::SetFlags(int, int) not yet transcribed " +
      "(frontier callee @Helium 0x2143ba in HGAVAMotionDetection::C2)",
  );
}

/** child->vtable[*0x88] — which per the resolve.py dump above is
 *  `HGNode::SetFlags(int, int)`. Called @0x2143cf as `child->SetFlags(1, 1)`. */
function child_vtable_0x88_SetFlags(
  _child: HGNodePtr,
  _which: number,
  _flags: number,
): void {
  throw new Error(
    "HGNode::SetFlags(int, int) (vtable slot *0x88 on HgcAVAMotionDetection) " +
      "not yet transcribed (frontier callee @Helium 0x2143cf in HGAVAMotionDetection::C2)",
  );
}

/** child->vtable[*0x18] — HGObject::Release(). Called from D2 @0x2144b5,
 *  D1 @0x2144f5, D0 @0x214532, and from C2 @0x2143fb during the
 *  swap-in-old-child dance. */
function child_vtable_0x18_Release(_child: HGNodePtr): void {
  throw new Error(
    "HGObject::Release() (vtable slot *0x18 on HgcAVAMotionDetection) " +
      "not yet transcribed (frontier callee @Helium 0x2144b5 in HGAVAMotionDetection::D2)",
  );
}

/** HGNode::~HGNode() — base-subobject dtor. Tail-called from D2 @0x2144c1,
 *  D1 @0x214501, D0 @0x214538, and from the C2 unwind path @0x21446b. */
function HGNode_D2(_self: HGAVAMotionDetection): void {
  throw new Error(
    "HGNode::~HGNode() not yet transcribed " +
      "(frontier callee @Helium 0x2144c1 in HGAVAMotionDetection::D2)",
  );
}

/** HGObject::operator delete(void*) — tail from D0 @0x214546. TS GC subsumes
 *  the raw free, but we keep the stub so any caller that flows through this
 *  path lands on a marker instead of silently no-op'ing. */
function HGObject_operatorDelete(_p: HGAVAMotionDetection): void {
  throw new Error(
    "HGObject::operator delete(void*) not yet transcribed " +
      "(frontier callee @Helium 0x214546 in HGAVAMotionDetection::D0)",
  );
}

/** HGRenderer::GetInput(HGNode* self, int slot) — called from GetOutput
 *  @0x21457f (slot 0) and @0x2145a4 (slot 1). Returns the upstream HGNode
 *  bound at that input slot in the renderer's graph. */
function HGRenderer_GetInput(
  _renderer: HGRendererPtr,
  _self: HGAVAMotionDetection,
  _slot: number,
): HGNodePtr | null {
  throw new Error(
    "HGRenderer::GetInput(HGNode*, int) not yet transcribed " +
      "(frontier callee @Helium 0x21457f in HGAVAMotionDetection::GetOutput)",
  );
}

/** child->vtable[*0x78] — HGNode::SetInput(int, HGNode*). Called from
 *  GetOutput @0x21458f (slot 0) and @0x2145b7 (slot 1). */
function child_vtable_0x78_SetInput(
  _child: HGNodePtr,
  _slot: number,
  _input: HGNodePtr | null,
): void {
  throw new Error(
    "HGNode::SetInput(int, HGNode*) (vtable slot *0x78 on HgcAVAMotionDetection) " +
      "not yet transcribed (frontier callee @Helium 0x21458f in HGAVAMotionDetection::GetOutput)",
  );
}

// ---------------------------------------------------------------------------
// Data constants — decoded from the four `movaps <rip>, %xmm0` loads in
// C2 (see the file header for the full derivation).
// ---------------------------------------------------------------------------

/** @Helium __DATA_CONST @0x3c7c30 — the SSE absolute-value mask
 *  <0x7FFFFFFF, 0x7FFFFFFF, 0x7FFFFFFF, 0x7FFFFFFF> loaded by
 *  `movaps 0x1b38c4(%rip), %xmm0` @0x214365. Written to buffer +0x08/+0x18. */
export const HGAVAMotionDetection_ABS_MASK_U32: readonly [number, number, number, number] =
  [0x7fffffff, 0x7fffffff, 0x7fffffff, 0x7fffffff];

/** @Helium __DATA_CONST @0x88c7e0 — the per-lane motion-threshold
 *  <0.2, 0.2, 0.2, 0.2> f32 loaded by
 *  `movaps 0x678463(%rip), %xmm0` @0x214376. Written to buffer +0x28/+0x38. */
export const HGAVAMotionDetection_THRESHOLD_F32: readonly [number, number, number, number] =
  [
    Math.fround(0.2),
    Math.fround(0.2),
    Math.fround(0.2),
    Math.fround(0.2),
  ];

/** @Helium __DATA_CONST @0x3c7c40 — the per-lane unit-1.0 constant
 *  <1.0, 1.0, 1.0, 1.0> f32 loaded by
 *  `movaps 0x1b38b2(%rip), %xmm0` @0x214387. Written to buffer +0x48/+0x58. */
export const HGAVAMotionDetection_ONE_F32: readonly [number, number, number, number] =
  [
    Math.fround(1.0),
    Math.fround(1.0),
    Math.fround(1.0),
    Math.fround(1.0),
  ];

/** @Helium __DATA_CONST @0x85fc40 — the SSE "keep lane 3 only" mask
 *  <0x00000000, 0x00000000, 0x00000000, 0xFFFFFFFF> loaded by
 *  `movaps 0x64b8a1(%rip), %xmm0` @0x214398. Written to buffer +0x68/+0x78.
 *  The 0xFFFFFFFF top lane is a NaN in f32 space; treated as a bit-mask by
 *  the shader (canonical `andps`-style alpha-lane-only selector). */
export const HGAVAMotionDetection_ALPHA_LANE_MASK_U32: readonly [
  number,
  number,
  number,
  number,
] = [0x00000000, 0x00000000, 0x00000000, 0xffffffff];

// ---------------------------------------------------------------------------
// Class layout
// ---------------------------------------------------------------------------

/**
 * The compute-kernel child stored at (this+0x198). Its concrete layout
 * is owned by HgcAVAMotionDetection (not yet transcribed). We model only
 * the two fields C2 & GetOutput touch: the child object itself (opaque)
 * plus the aligned uniform buffer at (child+0x198).
 */
export interface HgcAVAMotionDetectionChild extends HGNodePtr {
  /** Opaque bag of everything HgcAVAMotionDetection owns; we only care about
   *  the uniform buffer wired up in C2. Any other fields (params, textures,
   *  RenderTile state, ...) will land here when the class itself is ported. */
  readonly __hgc_avam_child: true;
  /** child+0x198 — the 32-byte-aligned pointer into an owned 0xa7-byte
   *  scratch/uniform buffer allocated by `operator new[]` at C2+0x4b. The
   *  four vec4 constants above live at offsets 0x08/0x18/0x28/0x38/0x48/
   *  0x58/0x68/0x78 within this aligned view. */
  uniformBuffer: Uint8Array;
  /** child+0x10 — the flags word that C2 rewrites via
   *   flags = (flags & ~0x601) | 0x401                                      */
  flags: number;
}

/**
 * `HGAVAMotionDetection` — the two-input wrapper HGNode. Owns a
 * HgcAVAMotionDetection compute-kernel child.
 *
 * @Helium symbols owned by this class:
 *   C2         @0x214300
 *   C1 (thunk) @0x214480
 *   D2         @0x214490
 *   D1         @0x2144d0
 *   D0         @0x214510
 *   GetOutput  @0x214560
 */
export class HGAVAMotionDetection {
  /** this+0x198 — owned compute-kernel child. Null immediately after
   *  HGNode_C2 (see C2+0x1c `movq $0x0, 0x198(%rbx)`) and populated by
   *  the swap-in dance at C2+0xe7..+0x105. */
  private child: HgcAVAMotionDetectionChild | null = null;

  /**
   * Constructor — @Helium C1 @0x214480 is a 5-byte thunk that tail-calls
   * C2 @0x214300; both entry points share this body.
   */
  constructor() {
    // @Helium 0x21430d  callq HGNode::HGNode()  — construct base subobject
    HGNode_C2(this as unknown as HGNodePtr);

    // @Helium 0x214312..0x214319  install "vtable for HGAVAMotionDetection"
    //   leaq  0x81ba4f(%rip), %rax  ; RIP target @0xa2fd68 (+0x10 into vtbl)
    //   movq  %rax, (%rbx)
    // TS has no vtable pointer to install — no-op.

    // @Helium 0x21431c..0x214327  this->child = nullptr
    //   movq  $0x0, 0x198(%rbx)
    this.child = null;

    // @Helium 0x214327  movl $0x1a0, %edi  — child size = 0x1a0 bytes
    // @Helium 0x21432c  callq HGObject::operator new(unsigned long)
    const child = HGObject_operatorNew(0x1a0) as HgcAVAMotionDetectionChild;

    // @Helium 0x214334  movq %rax, %rdi
    // @Helium 0x214337  callq HGNode::HGNode()  — child base ctor
    HGNode_C2(child);

    // @Helium 0x21433c..0x214343  install "vtable for HgcAVAMotionDetection"
    //   leaq  0x81b7e5(%rip), %rax  ; RIP target @0xa2fb28
    //   movq  %rax, (%r14)
    // No-op in TS (child ctor already established the child's identity).

    // @Helium 0x214346  movl $0xa7, %edi  — 0xa7 (=167) byte uniform buffer
    // @Helium 0x21434b  callq __Znam       — operator new[](size_t)
    const rawBuffer = operatorNewArray(0xa7);

    // @Helium 0x214350..0x21435d  align base+8 up to a 32-byte boundary:
    //   leaq   0x8(%rax), %rcx
    //   negl   %ecx
    //   andl   $0x1f, %ecx
    //   leaq   (%rcx,%rax), %rdx
    //   addq   $0x8, %rdx
    // In TS we model this as an aligned VIEW into rawBuffer: buffer[0] holds
    // the raw begin pointer (matches `movq %rax, (%rcx,%rax)` @+0x61 which
    // stashes the raw allocation base 8 bytes before the aligned view — the
    // classic "hide raw pointer for delete[]" trick).
    //
    // The aligned view starts at rawBuffer offset (align_up(base+8, 32) - base),
    // where base is treated as address 0 for the alignment. Since Uint8Array
    // buffers are always 8-byte-aligned in JS, the same 32-byte alignment
    // dance produces a view that is 8-byte-shifted from the raw start.
    // We can only model this LOGICALLY — the real byte offset depends on the
    // runtime allocator alignment, so we produce a fresh 32-byte-aligned
    // ArrayBuffer whose semantic offset 0 corresponds to the child+0x198
    // load in the disassembly.
    const alignedBuffer = alignedView32(rawBuffer);

    // @Helium 0x214361  movq %rax, (%rcx,%rax) — stash raw allocation base
    //   8 bytes before the aligned view (so operator delete[] can recover
    //   it). TS GC subsumes this — the raw allocation is kept alive by the
    //   Uint8Array reference chain we hold in `child.uniformBuffer` (or,
    //   more precisely, via the ArrayBuffer that backs the aligned view).

    // @Helium 0x214365..0x2143a4  four `movaps <rip>, %xmm0 ; movaps %xmm0,
    // <off>` pairs. Each 16-byte constant is written to two adjacent slots
    // in the aligned buffer (see file header for the full derivation).
    const dv = new DataView(
      alignedBuffer.buffer,
      alignedBuffer.byteOffset,
      alignedBuffer.byteLength,
    );

    // @Helium 0x214365..0x214371  ABS_MASK  → +0x18 then +0x08 (u32 lanes)
    //   0x214365 movaps 0x1b38c4(%rip), %xmm0   ; xmm0 = ABS_MASK_U32
    //   0x21436c movaps %xmm0, 0x18(%rcx,%rax)
    //   0x214371 movaps %xmm0, 0x08(%rcx,%rax)
    writeVec4U32(dv, 0x18, HGAVAMotionDetection_ABS_MASK_U32);
    writeVec4U32(dv, 0x08, HGAVAMotionDetection_ABS_MASK_U32);

    // @Helium 0x214376..0x214382  THRESHOLD → +0x38 then +0x28 (f32 lanes)
    //   0x214376 movaps 0x678463(%rip), %xmm0   ; xmm0 = <0.2, 0.2, 0.2, 0.2>
    //   0x21437d movaps %xmm0, 0x38(%rcx,%rax)
    //   0x214382 movaps %xmm0, 0x28(%rcx,%rax)
    writeVec4F32(dv, 0x38, HGAVAMotionDetection_THRESHOLD_F32);
    writeVec4F32(dv, 0x28, HGAVAMotionDetection_THRESHOLD_F32);

    // @Helium 0x214387..0x214393  ONE       → +0x58 then +0x48 (f32 lanes)
    //   0x214387 movaps 0x1b38b2(%rip), %xmm0   ; xmm0 = <1.0, 1.0, 1.0, 1.0>
    //   0x21438e movaps %xmm0, 0x58(%rcx,%rax)
    //   0x214393 movaps %xmm0, 0x48(%rcx,%rax)
    writeVec4F32(dv, 0x58, HGAVAMotionDetection_ONE_F32);
    writeVec4F32(dv, 0x48, HGAVAMotionDetection_ONE_F32);

    // @Helium 0x214398..0x2143a4  ALPHA_LANE_MASK → +0x78 then +0x68 (u32)
    //   0x214398 movaps 0x64b8a1(%rip), %xmm0   ; xmm0 = <0,0,0,0xFFFFFFFF>
    //   0x21439f movaps %xmm0, 0x78(%rcx,%rax)
    //   0x2143a4 movaps %xmm0, 0x68(%rcx,%rax)
    writeVec4U32(dv, 0x78, HGAVAMotionDetection_ALPHA_LANE_MASK_U32);
    writeVec4U32(dv, 0x68, HGAVAMotionDetection_ALPHA_LANE_MASK_U32);

    // @Helium 0x2143a9  movq %rdx, 0x198(%r14)  — child->uniformBuffer = aligned view
    child.uniformBuffer = alignedBuffer;

    // @Helium 0x2143b0..0x2143ba  callq HGNode::SetFlags(child, 0, 1)
    //   xorl  %esi, %esi
    //   movl  $0x1, %edx
    HGNode_SetFlags(child, 0, 1);

    // @Helium 0x2143bf..0x2143cf  child->vtable[*0x88](child, 1, 1)
    //   movq  (%r14), %rax        ; child_vtable
    //   movl  $0x1, %esi
    //   movl  $0x1, %edx
    //   callq *0x88(%rax)         ; SetFlags(1, 1) per resolve.py dump
    child_vtable_0x88_SetFlags(child, 1, 1);

    // @Helium 0x2143d5..0x2143e3  flags = (child->flags & ~0x601) | 0x401
    //   movl  $0xfffff9fe, %eax    ; ~0x601 = 0xfffff9fe
    //   andl  0x10(%r14), %eax
    //   orl   $0x401, %eax
    //   movl  %eax, 0x10(%r14)
    child.flags = ((child.flags & 0xfffff9fe) | 0x401) >>> 0;

    // @Helium 0x2143e7..0x214405  swap-in: release the (currently-null)
    // previous child, install the new one. Because we set this.child = null
    // above, the release branch is skipped.
    //   movq   0x198(%rbx), %rdi   ; oldChild
    //   cmpq   %r14, %rdi          ; identical? skip
    //   je     0x214407
    //   testq  %rdi, %rdi          ; null? skip release
    //   je     0x2143fe
    //   movq   (%rdi), %rax
    //   callq  *0x18(%rax)         ; oldChild->Release()
    //   movq   %r14, 0x198(%rbx)   ; this->child = child
    // Because C2 initialised this.child to null on line 2 of the body, the
    // release path is dead here — but we preserve it for the swap semantics
    // in case a caller ever routes a repopulation through this class.
    const oldChild = this.child;
    if (oldChild !== child) {
      if (oldChild !== null) {
        // @Helium 0x2143f8..0x2143fb  callq *0x18(%rax)  — Release old
        child_vtable_0x18_Release(oldChild);
      }
      this.child = child;
    } else {
      // @Helium 0x214407..0x21440d  duplicate release + skip — model as no-op.
      child_vtable_0x18_Release(child);
    }
    // @Helium 0x214410..0x21441a  frame teardown + retq.
  }

  /**
   * GetOutput(HGRenderer* renderer) — @Helium 0x214560.
   *
   * Fetches this node's two upstream inputs from the renderer and forwards
   * them onto the child compute-kernel's slots 0 and 1, then returns the
   * child as the HGNode whose output the caller should consume.
   */
  GetOutput(renderer: HGRendererPtr): HGNodePtr | null {
    // @Helium 0x214570  child = this->child
    let child = this.child;

    // @Helium 0x214577..0x21457f  input0 = renderer->GetInput(this, 0)
    const input0 = HGRenderer_GetInput(renderer, this, 0);

    // @Helium 0x214584..0x21458f  child->vtable[*0x78](child, 0, input0)
    if (child !== null) {
      child_vtable_0x78_SetInput(child, 0, input0);
    }

    // @Helium 0x214592  movq 0x198(%rbx), %r15 — reload child (SetInput may
    // reallocate through some sub-object; the disasm re-reads the field).
    child = this.child;

    // @Helium 0x214599..0x2145a4  input1 = renderer->GetInput(this, 1)
    const input1 = HGRenderer_GetInput(renderer, this, 1);

    // @Helium 0x2145a9..0x2145b7  child->vtable[*0x78](child, 1, input1)
    if (child !== null) {
      child_vtable_0x78_SetInput(child, 1, input1);
    }

    // @Helium 0x2145ba  movq 0x198(%rbx), %rax  — return this->child
    return this.child;
    // @Helium 0x2145c1..0x2145cb  frame teardown + retq.
  }

  /**
   * ~HGAVAMotionDetection() (D2 — non-deleting base-subobject dtor)
   * @Helium 0x214490.
   *
   *   0x214496 leaq  0x81b8cb(%rip), %rax   ; restore outer class vtable
   *   0x21449d movq  %rax, (%rdi)
   *   0x2144a0 movq  0x198(%rdi), %rax      ; child = this->child
   *   0x2144a7 testq %rax, %rax              ; null? skip
   *   0x2144aa je    0x2144bb
   *   0x2144b5 callq *0x18(child_vtable)   ; child->Release()
   *   0x2144c1 jmp   __ZN6HGNodeD2Ev        ; TAIL — base dtor
   */
  destroyBase(): void {
    // @Helium 0x214496..0x21449d  vtable restore — no-op in TS.
    // @Helium 0x2144a0..0x2144b8  release child if non-null.
    if (this.child !== null) {
      child_vtable_0x18_Release(this.child);
    }
    // @Helium 0x2144c1  tail-call HGNode::~HGNode()
    HGNode_D2(this);
  }

  /**
   * ~HGAVAMotionDetection() (D1 — complete-object non-deleting dtor)
   * @Helium 0x2144d0.
   *
   * Identical body shape to D2 (both restore the outer vtable, release the
   * child if non-null, then tail-call HGNode::~HGNode()). Preserved as a
   * separate method because a caller that dispatches on the D1 vtable slot
   * will land here, and future frontier work may specialise it.
   */
  destroyComplete(): void {
    // @Helium 0x2144d6..0x2144dd  vtable restore — no-op in TS.
    // @Helium 0x2144e0..0x2144f8  release child if non-null.
    if (this.child !== null) {
      child_vtable_0x18_Release(this.child);
    }
    // @Helium 0x214501  tail-call HGNode::~HGNode()
    HGNode_D2(this);
  }

  /**
   * ~HGAVAMotionDetection() (D0 — deleting dtor) @Helium 0x214510.
   *
   * D1's body plus `HGObject::operator delete(this)` as the final tail-call
   * (@0x214546). TS GC subsumes the raw delete; we still call the stub so
   * any code path that lands here trips a frontier marker if the underlying
   * HGObject allocator is later modelled explicitly.
   */
  destroyAndDelete(): void {
    // @Helium 0x214519..0x214520  vtable restore — no-op in TS.
    // @Helium 0x214523..0x214535  release child if non-null.
    if (this.child !== null) {
      child_vtable_0x18_Release(this.child);
    }
    // @Helium 0x214538  callq HGNode::~HGNode()
    HGNode_D2(this);
    // @Helium 0x214546  jmp HGObject::operator delete(this)
    HGObject_operatorDelete(this);
  }
}

// ---------------------------------------------------------------------------
// Aligned-buffer helpers — model the `neg&31` alignment dance @C2+0x50..+0x5d.
// ---------------------------------------------------------------------------

/**
 * Return a 32-byte-aligned VIEW into `raw` that starts 8 bytes past a
 * 32-byte boundary (matching @C2+0x50..+0x5d: `leaq 0x8(%rax), %rcx ; negl
 * %ecx ; andl $0x1f, %ecx ; leaq (%rcx,%rax), %rdx ; addq $0x8, %rdx`).
 *
 * On JS the underlying ArrayBuffer's byte alignment is opaque; the safest
 * decoding is to allocate a FRESH aligned ArrayBuffer of the same logical
 * size and return a Uint8Array view whose byteOffset places offset 0 at
 * the 32-byte boundary + 8 required by the disasm. This preserves the
 * addressing math (`+0x08, +0x18, +0x28, ...`) verbatim on the view.
 */
function alignedView32(raw: Uint8Array): Uint8Array {
  // Allocate 32 bytes of slack so we can pick a byteOffset that lands on
  // a 32-byte-aligned+8 spot within a fresh buffer.
  const slack = 32;
  const total = raw.byteLength + slack;
  const buf = new ArrayBuffer(total);
  // Copy the raw allocation contents in — the C2 buffer is written after
  // this alignment step, but we preserve any pre-existing content faithfully.
  new Uint8Array(buf).set(raw);
  // Fresh ArrayBuffers are typically 8-byte-aligned. Pick byteOffset such
  // that (byteOffset & 31) === 8, mimicking the disasm's "+0x08 past a
  // 32-byte boundary" start point.
  const desiredMod = 8;
  let byteOffset = 0;
  while ((byteOffset & 31) !== desiredMod) {
    byteOffset++;
    if (byteOffset >= slack) break; // safety
  }
  return new Uint8Array(buf, byteOffset, raw.byteLength);
}

/** Write a `<4 x u32>` (little-endian) at offset `off` — models
 *  `movaps %xmm0, <off>(%rcx,%rax)` where xmm0 holds a u32 constant. */
function writeVec4U32(
  dv: DataView,
  off: number,
  v: readonly [number, number, number, number],
): void {
  dv.setUint32(off + 0,  v[0] >>> 0, /*little-endian*/ true);
  dv.setUint32(off + 4,  v[1] >>> 0, true);
  dv.setUint32(off + 8,  v[2] >>> 0, true);
  dv.setUint32(off + 12, v[3] >>> 0, true);
}

/** Write a `<4 x f32>` (little-endian) at offset `off` — models
 *  `movaps %xmm0, <off>(%rcx,%rax)` where xmm0 holds an f32 constant. */
function writeVec4F32(
  dv: DataView,
  off: number,
  v: readonly [number, number, number, number],
): void {
  dv.setFloat32(off + 0,  Math.fround(v[0]), true);
  dv.setFloat32(off + 4,  Math.fround(v[1]), true);
  dv.setFloat32(off + 8,  Math.fround(v[2]), true);
  dv.setFloat32(off + 12, Math.fround(v[3]), true);
}
