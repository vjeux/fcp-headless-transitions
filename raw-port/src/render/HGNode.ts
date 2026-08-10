// raw-port/src/render/HGNode.ts
//
// FCP `HGNode` — Helium base class for every render-graph node (the
// second-tier ABI base under `HGObject`). Every HGColorBias / HGMix /
// HGClampPremultiplied / HGTextureWrap* / HGApplyNDLUTInfo... facade
// node inherits this class, so its layout + ctor/dtor + input-slot
// plumbing is a mass-unblocker.
//
// Symbols decoded here (Helium, x86_64 slice; file offset 0x4000; VAs
// below are unadjusted VM addresses from otool -tV):
//   0x11baa0  HGNode::Init(float* params, int paramCount, int flags)
//   0x11bad0  HGNode::ClearNodeChain()
//   0x11baf0  HGNode::HGNode()                       [C2 base ctor]
//   0x11bcc0  HGNode::HGNode()                       [C1 complete ctor — tail-jmp to C2]
//   0x11bf20  HGNode::~HGNode()                      [D2 base dtor]
//   0x11c050  HGNode::~HGNode()                      [D1 complete dtor — tail-jmp to D2]
//   0x11c060  HGNode::~HGNode()                      [D0 deleting dtor: D2; then ::operator delete]
//   0x11c890  HGNode::ClearBits()                    [void-arg thunk → ClearBits(0xffff)]
//   0x11c8b0  HGNode::GetInput(int idx)
//   0x11f6b0  HGNode::ClearBits(int mask)            [clears field_88 bits + walks back-links]
//   0x11c5f0  HGNode::SetInput(int idx, HGNode* src) [large — throw-stub w/ full @0xADDR trail]
//
// Vtable @Helium 0xa1d7c8 (RTTI header @0xa1d7b8). Slots relevant here:
//   *0x00 = 0x11c050  ~HGNode() [D1 complete dtor]
//   *0x08 = 0x11c060  ~HGNode() [D0 deleting dtor]
//   *0x10 = 0x1a0f20  HGObject::Retain()    (inherited)
//   *0x18 = 0x1a0f30  HGObject::Release()   (inherited)
//   *0x20 = 0x11c100  HGNode::debugDescription() const
//   *0x28 = 0x11c080  HGNode::dotLabel() const
//   *0x30 = 0x11c090  HGNode::label_A() const
//   *0x38 = 0x11c0d0  HGNode::label_B() const
//   *0x40 = 0x11c0e0  HGNode::info(...)
//   *0x48 = 0x11c3f0  HGNode::shaderDescription() const
//   *0x50 = 0x11ca50  HGNode::GetParameterCount()
//   *0x58 = 0x11ca60  HGNode::GetParameterName(int)
//   *0x60 = 0x11cab0  HGNode::SetParameter(int,float,float,float,float)
//   *0x68 = 0x11cbe0  HGNode::GetParameter(int,float*)
//   *0x70 = 0x11c8a0  HGNode::GetNumInputs()
//   *0x78 = 0x11c5f0  HGNode::SetInput(int, HGNode*)     ← used by SetInput slot vcall
//   *0x80 = 0x11c8b0  HGNode::GetInput(int)
// (Full slot map via `resolve.py Helium vtable HGNode`.)
//
// STRUCT LAYOUT (recovered from HGNode::HGNode() @0x11baf0 field-by-field):
//   ---- inherited from HGObject (size 0x10) ----
//     0x00 : void*    vtable                     (overwritten to 0xa1d7c8 in this ctor)
//     0x08 : u32      refCount                   (inherited; set to 1 by HGObject::HGObject())
//     0x0c : u32      flags/state field          (ctor writes $0 → offset 0xc)
//   ---- HGNode-specific fields (start at 0x10) ----
//     0x10 : u32      renderPageStrategy         (ctor: $0x200; Init also stores 0x200)
//     0x18 : void*    renderer / owner pointer   (ctor: $0)
//     0x20 : u64      packedField_20             (ctor: 0xf00000004 immediate)
//                                                 = { u32 lo=0x00000004, u32 hi=0x0000000f }
//     0x28 : u64      renderState                (ctor: $0)
//     0x2c : u32      paramCount                 (Init writes edx here)
//     0x30 : float*   paramArray                 (Init writes rsi here)
//     0x38 : u32      paramFlags                 (Init writes ecx here; ctor sets $0x2)
//     0x40 : f32[3]   float triple A             (movaps xmm0 @0x40 zero-init)
//     0x4c : f32[3]   float triple B             (movups xmm0 @0x4c zero-init)
//     0x50 : HGInputSlot**  inputSlots           (dynamic realloc'd array — see SetInput)
//     0x58 : i32      numInputSlots              (capacity; grown by SetInput)
//     0x60 : HGObject*  ownedRefA                (ctor: $0; dtor releases via vcall *0x18)
//     0x65 : u8[8]    inline byte block          (ctor writes qword $0 @0x65 — unaligned)
//     0x70 : void*    treeNode header ptr        (ctor: pointer to (this+0x78))
//     0x78 : std::__1::__tree<...NodePixelsStats...> node header (16 bytes zero-init xmm0)
//     0x80 : u64      treeNode size counter      (part of __tree)
//     0x88 : u32      field_88                   (ctor: $0)
//                                                 = "dirty-bits" mask — cleared by ClearBits(int)
//                                                 (@0x11f6b0) via `field_88 &= ~mask`. Subclass
//                                                 SetParameter overrides call ClearBits() when a
//                                                 param write actually changes a value, propagating
//                                                 the invalidation to dependent nodes via the
//                                                 back-link __tree at 0x70..0x88.
//     0x90 : void*    field_90                   (ctor: $0)
//     0x98 : HGRect   rectA  (16 bytes)          (ctor: copies _HGRectNull)
//     0xa8 : HGRect   rectB  (16 bytes)          (ctor: copies _HGRectNull)
//     0xb8 : f32[4]   float quad C               (ctor: xmm0 zero-init)
//     0xc0 : HGObject* ownedRefB                 (dtor releases via vcall *0x18)
//     0xc8 : f32[4]   float quad D               (ctor: xmm0 zero-init)
//     0xd8 : u32      field_d8                   (ctor: $0)
//     0xdc : HGRect   rectC  (16 bytes)          (ctor: copies _HGRectNull @0xdc — unaligned)
//     0xec : u64      field_ec                   (ctor: $0)
//     0xf8 : HGObject* ownedRefC                 (dtor releases via vcall *0x18)
//     0x104: HGShaderBinding shaderBinding       (ctor: ends by calling reset()@0x11bc51;
//                                                  Init also resets it @0x11bacb)
//     0x128: void*   heapBuf                     (ctor: $0; dtor calls operator delete on it
//                                                  after copying it to 0x130 first)
//     0x130: void*   heapBufSaved               (ClearNodeChain copies 0x128 → 0x130;
//                                                  Init does the same before shader reset)
//     0x148: i32     field_148                   (ctor: 0xffffffff = -1)
//     0x14c: u8      field_14c                   (ctor: $0)
//     0x150: u64     field_150                   (ctor: $0)
//     0x158: u64x2   field_158                   (ctor: copies 16-byte const @0x3ca320 =
//                                                  {u32 1, u32 0, u32 1, u32 0})
//     0x168: u64     field_168                   (ctor: $0)
//     0x170: f32     field_170                   (ctor: 0x3f800000 = 1.0f)
//     0x180: f32[4]  field_180                   (ctor: copies 16-byte const @0x3c7c40 =
//                                                  four 1.0f values)
//     0x190: HGObject* ownedRefD                 (ctor: $0; dtor releases via vcall *0x18)
//
// sizeof(HGNode) ≈ 0x198+ (dtor's last touched offset is 0x190; ctor writes 0x190 last).
//
// DECODE-DON'T-FIT: every field & offset above is transcribed byte-for-
// byte from the ctor asm. Fields whose *semantic name* isn't recoverable
// from the ctor alone are given `field_XX` names and cited by @0xADDR.
// This matches the strict "no invention" rule of the port.

import { HGObject } from "./HGObject";

/**
 * `HGNode` — Helium render-graph node base class.
 *
 * Subclasses (HGColorBias, HGMix, HGClampPremultiplied, HGTextureWrap*,
 * HGApplyNDLUTInfo, ...) construct via this class's C2 body, which
 * chains to HGObject::HGObject() then zero/one-fills the 0x180+ bytes
 * of HGNode-specific fields.
 *
 * The TS model preserves the *observable* layout: every field the C++
 * ctor writes is mirrored here with a matching name. Un-decoded sub-
 * structures (HGRect, HGShaderBinding, HGInputSlot, the __tree of
 * NodePixelsStats) are typed loosely because their internal layout is
 * decoded elsewhere (HGRect is landed; the others are open frontiers).
 */
export class HGNode extends HGObject {
  // --- HGNode-specific fields (offsets in comments) ---
  renderPageStrategy: number;                  // 0x10, u32 — @Helium 0x11bc3b init $0x200
  renderer: unknown | null;                     // 0x18
  packedField_20: number;                       // 0x20 — 0xF00000004 immediate
  renderState: number;                          // 0x28
  paramCount: number;                           // 0x2c
  paramArray: Float32Array | null;              // 0x30
  paramFlags: number;                           // 0x38 — @Helium 0x11bc4a init $0x2
  floatTripleA: [number, number, number];       // 0x40..0x4c
  floatTripleB: [number, number, number];       // 0x4c..0x58
  inputSlots: Array<HGInputSlot | null>;        // 0x50 — dynamic array
  numInputSlots: number;                        // 0x58 — capacity
  ownedRefA: HGObject | null;                   // 0x60
  inlineByteBlock: Uint8Array;                  // 0x65..0x6d
  treeHeaderPtr: unknown;                       // 0x70
  treeNode: unknown;                            // 0x78..0x88 — __tree<NodePixelsStats>
  treeNodeSize: number;                         // 0x80 — part of __tree
  field_88: number;                             // 0x88
  field_90: unknown | null;                     // 0x90
  rectA: HGRectLite;                            // 0x98..0xa8 — copy of _HGRectNull
  rectB: HGRectLite;                            // 0xa8..0xb8 — copy of _HGRectNull
  floatQuadC: [number, number, number, number]; // 0xb8..0xc8
  ownedRefB: HGObject | null;                   // 0xc0
  floatQuadD: [number, number, number, number]; // 0xc8..0xd8
  field_d8: number;                             // 0xd8
  rectC: HGRectLite;                            // 0xdc..0xec (unaligned)
  field_ec: number;                             // 0xec
  ownedRefC: HGObject | null;                   // 0xf8
  shaderBinding: HGShaderBindingLite;           // 0x104..0x128
  heapBuf: unknown | null;                      // 0x128
  heapBufSaved: unknown | null;                 // 0x130
  field_148: number;                            // 0x148 — 0xffffffff (-1)
  field_14c: number;                            // 0x14c
  field_150: number;                            // 0x150
  field_158: [number, number, number, number];  // 0x158..0x168 — const {1,0,1,0}
  field_168: number;                            // 0x168
  field_170: number;                            // 0x170 — 1.0f
  field_180: [number, number, number, number];  // 0x180..0x190 — const {1.0f x 4}
  ownedRefD: HGObject | null;                   // 0x190

  /**
   * `HGNode::HGNode()` — Helium @0x11baf0 (C2). The C1 body @0x11bcc0
   * is a bare tail-jmp to C2 (`jmp __ZN6HGNodeC2Ev`), so both signatures
   * share this body.
   *
   * Full transcription of the C2 asm:
   *   0x11bafd: callq __ZN8HGObjectC2Ev     ; HGObject::HGObject()
   *   0x11bb02: leaq  0x901cbf(%rip), %rax  ; = 0xa1d7c8 (HGNode vtable)
   *   0x11bb09: movq  %rax, (%rbx)          ; *this = HGNode vtable
   *   0x11bb0c: movl  $0x0, 0xc(%rbx)
   *   0x11bb13: movq  $0x0, 0x18(%rbx)
   *   0x11bb1b: movabsq $0xf00000004, %rax
   *   0x11bb25: movq  %rax, 0x20(%rbx)      ; 0x20 = 0xf00000004
   *   0x11bb29: leaq  0x70(%rbx), %r14
   *   0x11bb2d: leaq  0x78(%rbx), %rax
   *   0x11bb31: xorps %xmm0, %xmm0
   *   0x11bb34: movups %xmm0, 0x78(%rbx)    ; 0x78..0x88 = 0 (tree hdr)
   *   0x11bb38: movq  $0x0, 0x28(%rbx)
   *   0x11bb40: movaps %xmm0, 0x40(%rbx)    ; 0x40..0x50 = 0 (floatTripleA)
   *   0x11bb44: movups %xmm0, 0x4c(%rbx)    ; 0x4c..0x5c = 0 (floatTripleB, overlaps 0x50!)
   *                                            → this zeroes inputSlots ptr(0x50) + numInputSlots(0x58)
   *   0x11bb48: movq  $0x0, 0x60(%rbx)      ; ownedRefA
   *   0x11bb50: movq  $0x0, 0x65(%rbx)      ; inlineByteBlock (unaligned!)
   *   0x11bb58: movq  %rax, 0x70(%rbx)      ; treeHeaderPtr = &this->treeNode
   *   0x11bb5c: movl  $0x0, 0x88(%rbx)
   *   0x11bb66: movq  $0x0, 0x90(%rbx)
   *   0x11bb71: leaq  _HGRectNull(%rip), %rax
   *   0x11bb78: movups (%rax), %xmm1
   *   0x11bb7b: movups %xmm1, 0x98(%rbx)    ; rectA = _HGRectNull
   *   0x11bb82: movups (%rax), %xmm1
   *   0x11bb85: movups %xmm1, 0xa8(%rbx)    ; rectB = _HGRectNull
   *   0x11bb8c: movups %xmm0, 0xb8(%rbx)    ; floatQuadC = 0
   *   0x11bb93: movups %xmm0, 0xc8(%rbx)    ; floatQuadD = 0 (overlaps ownedRefB at 0xc0!)
   *                                            → this zeroes ownedRefB(0xc0) too
   *   0x11bb9a: movl  $0x0, 0xd8(%rbx)
   *   0x11bba4: movups (%rax), %xmm1
   *   0x11bba7: movups %xmm1, 0xdc(%rbx)    ; rectC = _HGRectNull (unaligned)
   *   0x11bbae: movq  $0x0, 0xec(%rbx)
   *   0x11bbb9: leaq  0x104(%rbx), %rdi     ; &this->shaderBinding
   *   0x11bbc0: movups %xmm0, 0x138(%rbx)   ; 0x138..0x148 = 0
   *   0x11bbc7: movups %xmm0, 0x128(%rbx)   ; heapBuf/heapBufSaved = 0
   *   0x11bbce: movups %xmm0, 0x118(%rbx)   ; shaderBinding inner slot 1
   *   0x11bbd5: movups %xmm0, 0x108(%rbx)   ; shaderBinding inner slot 0
   *   0x11bbdc: movups %xmm0, 0xf8(%rbx)    ; ownedRefC = 0 + shaderBinding start
   *   0x11bbe3: movl  $0xffffffff, 0x148(%rbx)   ; field_148 = -1
   *   0x11bbed: movb  $0x0, 0x14c(%rbx)
   *   0x11bbf4: movq  $0x0, 0x150(%rbx)
   *   0x11bbff: movaps 0x2ae71a(%rip), %xmm0 ; = 16 bytes @0x3ca320 = {1u,0u,1u,0u}
   *   0x11bc06: movups %xmm0, 0x158(%rbx)   ; field_158 = {1,0,1,0}
   *   0x11bc0d: movq  $0x0, 0x168(%rbx)
   *   0x11bc18: movl  $0x3f800000, 0x170(%rbx)   ; field_170 = 1.0f
   *   0x11bc22: movaps 0x2ac017(%rip), %xmm0 ; = 16 bytes @0x3c7c40 = {1.0f,1.0f,1.0f,1.0f}
   *   0x11bc29: movaps %xmm0, 0x180(%rbx)   ; field_180 = {1.0f}x4
   *   0x11bc30: movq  $0x0, 0x190(%rbx)     ; ownedRefD = null
   *   0x11bc3b: movl  $0x200, 0x10(%rbx)    ; renderPageStrategy = 0x200
   *   0x11bc42: movq  $0x0, 0x30(%rbx)      ; paramArray = null
   *   0x11bc4a: movl  $0x2, 0x38(%rbx)      ; paramFlags = 2
   *   0x11bc51: callq __ZN15HGShaderBinding5resetEv ; HGShaderBinding::reset()
   *
   * The tail after ret is an exception-unwind cleanup landing pad (releases
   * ownedRefD @0x190 via vcall *0x18, frees heapBuf @0x128, destroys the
   * tree, then chains to HGObject::~HGObject() — nothing observable from
   * the happy path).
   */
  constructor() {
    // @Helium 0x11bafd: HGObject::HGObject() — installs HGObject vtable + refCount=1
    super();
    // @Helium 0x11bb09: overwrite vtable with HGNode vtable @0xa1d7c8
    this.vtable = 0xa1d7c8;
    // (offset 0xc: 32-bit flags/state field is part of the HGObject
    //  base's tail padding; the compiler set it via `movl $0, 0xc(%rbx)`
    //  at 0x11bb0c. Modeled through HGObject.refCount at 0x8 + this write.)

    // @Helium 0x11bc3b: renderPageStrategy (@0x10) = 0x200
    this.renderPageStrategy = 0x200;
    // @Helium 0x11bb13: renderer (@0x18) = null
    this.renderer = null;
    // @Helium 0x11bb1b + 0x11bb25: packedField_20 (@0x20) = 0xf00000004
    this.packedField_20 = 0xf00000004;
    // @Helium 0x11bb38: renderState (@0x28) = 0
    this.renderState = 0;
    // @Helium 0x11bc42: paramArray (@0x30) = null
    this.paramArray = null;
    // (paramCount @0x2c is *not* explicitly written by C2 — left zero by
    //  the earlier 16-byte movaps of xmm0 to 0x40 does NOT cover it, but
    //  a preceding zero-write pass covers it implicitly through the
    //  movups @0x28 (…$0,0x28) at 0x11bb38? No — 0x28 covers 0x28..0x2f
    //  as a qword-zero, which INCLUDES offset 0x2c. So paramCount = 0.)
    this.paramCount = 0;
    // @Helium 0x11bc4a: paramFlags (@0x38) = 2
    this.paramFlags = 2;
    // @Helium 0x11bb40: floatTripleA (@0x40..0x4c) = 0
    this.floatTripleA = [0, 0, 0];
    // @Helium 0x11bb44: floatTripleB (@0x4c..0x58) = 0. Note the movups
    // at 0x4c is 16-byte, which *also* zeroes 0x50..0x5c → i.e. it
    // zero-clears inputSlots ptr (0x50) and numInputSlots (0x58).
    this.floatTripleB = [0, 0, 0];
    // @Helium 0x11bb44 (spillover): inputSlots (@0x50) = empty, numInputSlots (@0x58) = 0
    this.inputSlots = [];
    this.numInputSlots = 0;
    // @Helium 0x11bb48: ownedRefA (@0x60) = null
    this.ownedRefA = null;
    // @Helium 0x11bb50: inlineByteBlock (@0x65..0x6d) = 0 (unaligned qword zero!)
    this.inlineByteBlock = new Uint8Array(8);
    // @Helium 0x11bb58: treeHeaderPtr (@0x70) = &this->treeNode (self-ref sentinel)
    this.treeHeaderPtr = this; // conceptually pointer to inner __tree end-node
    // @Helium 0x11bb34: treeNode (@0x78..0x88) = 0 (xmm0)
    this.treeNode = null;
    this.treeNodeSize = 0;
    // @Helium 0x11bb5c: field_88 (@0x88) = 0
    this.field_88 = 0;
    // @Helium 0x11bb66: field_90 (@0x90) = null
    this.field_90 = null;
    // @Helium 0x11bb71..0x11bb7b: rectA (@0x98) = _HGRectNull
    this.rectA = HGRectNull_copy();
    // @Helium 0x11bb82..0x11bb85: rectB (@0xa8) = _HGRectNull
    this.rectB = HGRectNull_copy();
    // @Helium 0x11bb8c: floatQuadC (@0xb8..0xc8) = 0 (16-byte xmm0).
    // Note: this covers ownedRefB @0xc0 too, zeroing it in one go.
    this.floatQuadC = [0, 0, 0, 0];
    // @Helium 0x11bb93 (spillover): ownedRefB (@0xc0) = null
    this.ownedRefB = null;
    // @Helium 0x11bb93: floatQuadD (@0xc8..0xd8) = 0
    this.floatQuadD = [0, 0, 0, 0];
    // @Helium 0x11bb9a: field_d8 (@0xd8) = 0
    this.field_d8 = 0;
    // @Helium 0x11bba4..0x11bba7: rectC (@0xdc, unaligned) = _HGRectNull
    this.rectC = HGRectNull_copy();
    // @Helium 0x11bbae: field_ec (@0xec) = 0
    this.field_ec = 0;
    // @Helium 0x11bbdc: ownedRefC (@0xf8) = 0 (xmm0 write to 0xf8)
    this.ownedRefC = null;
    // @Helium 0x11bbc7 + 0x11bbce + 0x11bbd5 + 0x11bbdc: 5 xmm0 writes
    // (0xf8, 0x108, 0x118, 0x128, 0x138) zero-fill the ~0x104..0x148
    // region, i.e. the shaderBinding struct (0x104..0x128) + heapBuf
    // slot (0x128) + saved-slot (0x130) + up to 0x148.
    this.shaderBinding = HGShaderBinding_reset();
    // @Helium 0x11bbc7: heapBuf (@0x128) = null
    this.heapBuf = null;
    // (heapBufSaved @0x130 also zeroed by the same 16-byte write)
    this.heapBufSaved = null;
    // @Helium 0x11bbe3: field_148 (@0x148) = 0xffffffff (-1)
    this.field_148 = -1 | 0;
    // @Helium 0x11bbed: field_14c (@0x14c) = 0 (byte write)
    this.field_14c = 0;
    // @Helium 0x11bbf4: field_150 (@0x150) = 0
    this.field_150 = 0;
    // @Helium 0x11bbff+0x11bc06: field_158 = {1u,0u,1u,0u} from const @0x3ca320
    // (verified: bytes 01000000 00000000 01000000 00000000)
    this.field_158 = [1, 0, 1, 0];
    // @Helium 0x11bc0d: field_168 (@0x168) = 0
    this.field_168 = 0;
    // @Helium 0x11bc18: field_170 (@0x170) = 1.0f  (0x3f800000)
    this.field_170 = Math.fround(1.0);
    // @Helium 0x11bc22+0x11bc29: field_180 = {1.0f,1.0f,1.0f,1.0f} from const @0x3c7c40
    // (verified: 0000803f 0000803f 0000803f 0000803f)
    this.field_180 = [Math.fround(1.0), Math.fround(1.0), Math.fround(1.0), Math.fround(1.0)];
    // @Helium 0x11bc30: ownedRefD (@0x190) = null
    this.ownedRefD = null;
    // @Helium 0x11bc51: HGShaderBinding::reset() on &this->shaderBinding — already modeled
    // by HGShaderBinding_reset() above (returned a fresh zero-state binding).
  }

  /**
   * `HGNode::Init(float* params, int paramCount, int flags)` — Helium @0x11baa0.
   *
   *   0x11baa4: movl  $0x200, 0x10(%rdi)    ; renderPageStrategy = 0x200
   *   0x11baab: movl  %edx, 0x2c(%rdi)      ; paramCount = paramCount
   *   0x11baae: movq  %rsi, 0x30(%rdi)      ; paramArray  = params
   *   0x11bab2: movl  %ecx, 0x38(%rdi)      ; paramFlags  = flags
   *   0x11bab5: movq  0x128(%rdi), %rax     ; heapBufSaved = heapBuf
   *   0x11bac3: addq  $0x104, %rdi          ; &this->shaderBinding
   *   0x11bacb: jmp   __ZN15HGShaderBinding5resetEv  ; tail-jmp reset()
   */
  Init(params: Float32Array | null, paramCount: number, flags: number): void {
    // @Helium 0x11baa4
    this.renderPageStrategy = 0x200;
    // @Helium 0x11baab
    this.paramCount = paramCount | 0;
    // @Helium 0x11baae
    this.paramArray = params;
    // @Helium 0x11bab2
    this.paramFlags = flags | 0;
    // @Helium 0x11bab5..0x11babc: heapBufSaved = heapBuf
    this.heapBufSaved = this.heapBuf;
    // @Helium 0x11bacb: tail-jmp HGShaderBinding::reset()
    this.shaderBinding = HGShaderBinding_reset();
  }

  /**
   * `HGNode::ClearNodeChain()` — Helium @0x11bad0.
   *
   *   0x11bad4: movq  0x128(%rdi), %rax
   *   0x11badb: movq  %rax, 0x130(%rdi)     ; heapBufSaved = heapBuf
   *   0x11bae3: retq
   *
   * Sole effect: snapshot heapBuf → heapBufSaved so a later step can
   * distinguish freshly-allocated vs saved memory.
   */
  ClearNodeChain(): void {
    // @Helium 0x11badb
    this.heapBufSaved = this.heapBuf;
  }

  /**
   * `HGNode::GetInput(int idx)` — Helium @0x11c8b0.
   *
   *   0x11c8b0: testl %esi, %esi            ; idx < 0 ?
   *   0x11c8b2: js    0x11c8d2               ;   yes → return 0
   *   0x11c8b4: cmpl  0x58(%rdi), %esi      ; idx >= numInputSlots ?
   *   0x11c8b7: jge   0x11c8d2               ;   yes → return 0
   *   0x11c8bd: movq  0x50(%rdi), %rax      ; rax = inputSlots
   *   0x11c8c1: movl  %esi, %ecx
   *   0x11c8c3: movq  (%rax,%rcx,8), %rax   ; rax = inputSlots[idx]
   *   0x11c8c7: testq %rax, %rax             ; if slot == null → return 0
   *   0x11c8ca: je    0x11c8d5
   *   0x11c8cc: movq  0x10(%rax), %rax      ; return slot->srcNode (HGInputSlot offset 0x10)
   *   0x11c8d1: retq
   *   (both fall-throughs to xorl %eax,%eax → return null)
   *
   * NOTE: this confirms the HGInputSlot layout — offset 0x10 holds the
   * pointer to the source HGNode (which SetInput sets, at 0x11c7ca).
   */
  GetInput(idx: number): HGNode | null {
    // @Helium 0x11c8b0: bounds check
    if (idx < 0) return null;
    // @Helium 0x11c8b4
    if (idx >= this.numInputSlots) return null;
    // @Helium 0x11c8bd..0x11c8c3: inputSlots[idx]
    const slot = this.inputSlots[idx];
    // @Helium 0x11c8c7: null-slot guard
    if (!slot) return null;
    // @Helium 0x11c8cc: return slot.srcNode (HGInputSlot @0x10)
    return slot.srcNode;
  }

  /**
   * `HGNode::SetInput(int idx, HGNode* src)` — Helium @0x11c5f0.
   *
   * LARGE (~660 bytes of asm). Does five things, in order:
   *   1. Bounds/grow: if idx >= numInputSlots(@0x58), round up capacity to
   *      the next multiple of 8 via `leal 0x8(%r15), %r13d; andl 0x7ffffff8, %r13d`
   *      (=  `(idx + 8) & ~7`), then realloc/malloc `inputSlots` (@0x50)
   *      and bzero the new tail (@0x11c651 realloc / @0x11c757 malloc /
   *      @0x11c66d bzero of the freshly-added slots), and store new size
   *      (@0x11c680 → 0x58).
   *   2. Slot alloc: if inputSlots[idx] is null, `__Znwm(0x38)` a new
   *      HGInputSlot (@0x11c690..0x11c6c5). Slot fields, from asm writes:
   *         slot->parent   @0x00 = this          (movq %rbx,(%rax))
   *         slot->index    @0x08 = idx           (movl %r15d,0x8(%rax))
   *         slot->pad_0c   @0x0c..0x1c = 0       (xorps %xmm0; movups %xmm0,0xc)
   *         slot->srcNode  @0x10                 (initially cleared by the xmm0 write)
   *         slot->field_1c @0x1c = 0             (movl $0,0x1c)
   *         slot->rect     @0x20 = _HGRectNull   (movups (rcx),%xmm0; movups xmm0,0x20)
   *         slot->tail_30  @0x30 = 0             (movq $0,0x30)
   *      → sizeof(HGInputSlot) = 0x38.
   *   3. Old-source removal: if old slot->srcNode (@0x10) != new src, walk
   *      the old srcNode's __tree<...> back-link map @0x78..0x80 (the same
   *      __tree we saw zero-init in the ctor — it maps HGNode* to
   *      "parents that link to this node"), red-black remove the entry
   *      whose value == current slot (@0x11c7a3 __tree_remove), delete
   *      the removed tree_node (@0x11c7ab operator delete), and Release
   *      the old srcNode via vcall *0x18 (@0x11c7bf).
   *   4. New-source install: write slot->srcNode = src (@0x11c7ca), then
   *      if src != null: Retain via vcall *0x10 (@0x11c7e1), and insert
   *      a fresh 0x28-byte tree_node into src's __tree, calling
   *      __tree_balance_after_insert (@0x11c85d) and incrementing
   *      src->treeNodeSize (@0x11c862).
   *   5. Trailing: `ClearBits(0xffff)` on this (@0x11c871) and return 1.
   *      Return 0xffffffff (-1) if idx<0 (@0x11c62b).
   *
   * PORT STATUS: this method wires refcount lifecycle + intrusive
   * bookkeeping through the __tree<type_info*, NodePixelsStats> and the
   * still-un-decoded HGInputSlot layout. A faithful transcription
   * requires porting `__tree_remove`/`__tree_balance_after_insert`
   * (libc++ RB internals) and `ClearBits(int)` (Helium HGNode @0x11f6b0).
   * Landing those is a separate work item — throwing here is the correct
   * "demand signal" for the next port pass.
   */
  SetInput(_idx: number, _src: HGNode | null): number {
    // @Helium 0x11c5f0: full body pending. See doc-comment above for the
    // exact asm trail (bounds/grow @0x11c608..0x11c680; slot alloc
    // @0x11c690..0x11c6c5; old-source unlink @0x11c6e3..0x11c7c2; new-
    // source install @0x11c7ca..0x11c869; ClearBits+ret @0x11c871).
    // Blocked on: libc++ __tree_remove / __tree_balance_after_insert,
    // HGInputSlot 0x38-byte layout, HGNode::ClearBits(int) @0x11f6b0.
    // raise Error — decode-don't-fit; do not invent a placeholder.
    throw new Error(
      "HGNode::SetInput not yet transcribed @Helium 0x11c5f0 " +
      "(depends on libc++ __tree ops + HGInputSlot@0x38 + ClearBits@0x11f6b0)"
    );
  }

  /**
   * `HGNode::~HGNode()` — Helium @0x11bf20 (D2). The D1 body @0x11c050
   * is a bare tail-jmp to D2. The D0 body @0x11c060 is `D2; delete this`.
   *
   * Full D2 asm trace (0x11bf20..0x11c02d):
   *   0x11bf2a: leaq  0x901897(%rip), %rax  ; = 0xa1d7c8 (HGNode vtable)
   *   0x11bf31: movq  %rax, (%rdi)          ; re-install HGNode vtable
   *   0x11bf34: movq  0xc0(%rdi), %rdi      ; ownedRefB
   *   0x11bf3e: je    0x11bf51               ;   if null, skip
   *   0x11bf43: callq *0x18(%rax)           ; Release() via vtable
   *   0x11bf46: movq  $0x0, 0xc0(%rbx)      ; ownedRefB = null
   *   0x11bf51..0x11bf6e: same for ownedRefC (@0xf8, cleared to 0)
   *   0x11bf6e..0x11bf85: same for ownedRefA (@0x60, cleared to 0)
   *   0x11bf85..0x11bfc9: iterate i in [0..numInputSlots):
   *                       if inputSlots[i] != null:
   *                          vcall *0x78(vtbl) with (i, 0)   ; SetInput(i, null)
   *                          if inputSlots[i] != null: ::operator delete(inputSlots[i])
   *   0x11bfc9..0x11bfd7: if inputSlots ptr != null: free(inputSlots)
   *   0x11bfd7..0x11bfeb: if paramFlags != 0 && paramArray != null: HGFree(paramArray)
   *   0x11bfeb..0x11bfef: orb $-0x80, 0x13(%rbx)   ; set high bit of byte @0x13
   *                                                  (some "destroyed" flag inside
   *                                                   HGObject's tail padding)
   *   0x11bfef..0x11c001: ownedRefD @0x190 → Release() via vcall *0x18
   *   0x11c001..0x11c019: if heapBuf @0x128 != null:
   *                          heapBufSaved = heapBuf; ::operator delete(heapBuf)
   *   0x11c019..0x11c021: __tree destroy over &this->treeNode
   *   0x11c02d: jmp  __ZN8HGObjectD2Ev
   *
   * Multi-Release + delete on each inputSlot: the vcall to *0x78 on the
   * SUBCLASS's own vtable dispatches back to HGNode::SetInput(i, null),
   * which unlinks the source and releases it — a graph-teardown pattern.
   *
   * Because the dtor invokes SetInput (which is currently a throwing
   * stub), a full destruct-with-inputs run would raise. For nodes with
   * numInputSlots == 0 (a very common case for leaf HGTextureWrap*, etc.
   * that never call SetInput on this node), destruct still runs cleanly.
   */
  destruct(): void {
    // @Helium 0x11bf31: re-install HGNode vtable @0xa1d7c8
    this.vtable = 0xa1d7c8;

    // @Helium 0x11bf34..0x11bf51: Release ownedRefB @0xc0
    if (this.ownedRefB) {
      this.ownedRefB.Release();
      this.ownedRefB = null;
    }
    // @Helium 0x11bf51..0x11bf6e: Release ownedRefC @0xf8
    if (this.ownedRefC) {
      this.ownedRefC.Release();
      this.ownedRefC = null;
    }
    // @Helium 0x11bf6e..0x11bf85: Release ownedRefA @0x60
    if (this.ownedRefA) {
      this.ownedRefA.Release();
      this.ownedRefA = null;
    }

    // @Helium 0x11bf85..0x11bfc9: iterate inputSlots and SetInput(i,null)
    // then ::operator delete each slot.
    if (this.numInputSlots > 0) {
      for (let i = 0; i < this.numInputSlots; i++) {
        const slot = this.inputSlots[i];
        if (slot != null) {
          // @Helium 0x11bfb2: vcall *0x78(vtbl) = SetInput(i, null).
          // This delegates to the subclass override; on plain HGNode
          // it currently raises — see SetInput above.
          this.SetInput(i, null);
          // @Helium 0x11bfc2: ::operator delete(inputSlots[i]) — no-op in TS.
        }
      }
    }
    // @Helium 0x11bfc9..0x11bfd7: free(inputSlots) — no-op in TS.
    this.inputSlots = [];
    this.numInputSlots = 0;

    // @Helium 0x11bfd7..0x11bfeb: HGFree(paramArray) iff paramFlags != 0.
    // Modeled as clearing the reference — GC handles the storage.
    if (this.paramFlags !== 0 && this.paramArray != null) {
      this.paramArray = null;
    }

    // @Helium 0x11bfeb: set high bit of byte @0x13 (a "destroyed" marker
    // that lives inside HGObject's tail padding). We don't expose it as
    // a distinct field; the observable effect is the vtable revert to
    // HGObject's dtor via the trailing tail-call.

    // @Helium 0x11bfef..0x11c001: Release ownedRefD @0x190
    if (this.ownedRefD) {
      this.ownedRefD.Release();
      this.ownedRefD = null;
    }

    // @Helium 0x11c001..0x11c019: heapBufSaved = heapBuf; delete heapBuf.
    if (this.heapBuf != null) {
      this.heapBufSaved = this.heapBuf;
      this.heapBuf = null;
    }

    // @Helium 0x11c019..0x11c021: destroy the __tree<NodePixelsStats>.
    // In TS the JS runtime will GC the tree nodes; nothing to release.

    // @Helium 0x11c02d: HGObject::~HGObject() — re-install HGObject vtable.
    super.destruct();
  }

  /**
   * `HGNode::ClearBits(int mask)` — Helium @0x11f6b0.
   *
   * Clears the given bit-mask from `this->field_88` (@0x88 — the render-
   * graph "dirty bits" field) and then recursively clears the low byte
   * (0xff) on every descendant HGNode reachable through the internal
   * __tree<NodePixelsStats> rooted at `this->treeHeaderPtr` (@0x70). If
   * the node is currently mid-render (`renderState == 1` @0x28) it also
   * emits an HGLogger::warning first.
   *
   * Full asm transcription:
   *   0x11f6bd: cmpl  $0x1, 0x28(%rdi)                ; renderState == 1 ?
   *   0x11f6c1: jne   0x11f6d1                         ;   no → skip warn
   *   0x11f6c3: leaq  ..(%rip), %rdi                   ;   literal "ClearBits() : called during render\n"
   *   0x11f6ca: xorl  %eax, %eax                       ;   varargs count = 0
   *   0x11f6cc: callq HGLogger::warning
   *   0x11f6d1: movl  0x88(%rbx), %eax                 ; eax = field_88
   *   0x11f6d7: testl %r14d, %eax                      ; if (mask & field_88) == 0 → done
   *   0x11f6da: je    0x11f6f5
   *   0x11f6dc: notl  %r14d
   *   0x11f6df: andl  %r14d, %eax                      ; eax = field_88 & ~mask
   *   0x11f6e2: movl  %eax, 0x88(%rbx)                 ; field_88 = eax
   *   0x11f6e8: movq  0x70(%rbx), %r14                 ; r14 = treeHeaderPtr
   *   0x11f6ec: addq  $0x78, %rbx                      ; rbx = &this->treeNode (empty-sentinel)
   *   0x11f6f0: cmpq  %rbx, %r14                       ; treeHeaderPtr == sentinel → empty tree
   *   0x11f6f3: jne   0x11f708                         ;   else walk
   *   0x11f6f5: popq  %rbx / retq
   *
   * Tree-walk body (@0x11f708..0x11f74c): standard libc++ __tree in-order
   * iteration — for each entry `n`, load `*(n+0x20)` as an HGNode* and
   * tail-recurse `HGNode::ClearBits(0xff)` on it (@0x11f708..0x11f714).
   * `+0x8` / `+0x10` links are the __tree_node left/right/parent walk
   * (`(n+0x8)` = right subtree; when null, unwind via `(n+0x10)` = parent).
   *
   * Faithful state model: HGNode's ctor initializes `treeHeaderPtr = this`
   * (self-referential = empty tree — see @0x11bb58 in the ctor above), and
   * no tree-insert path is decoded yet in this port (every SetParameter/
   * SetInput code path that would grow the tree is still a throw-stub in
   * its subclass). The walk branch is therefore unreachable at current
   * runtime; if a future port populates the tree it MUST also port the
   * __tree in-order iterator here (the exact asm is above).
   */
  ClearBits(mask: number): void {
    // @Helium 0x11f6bd..0x11f6cc: renderState==1 → HGLogger::warning
    if (this.renderState === 1) {
      HGLogger_warning("ClearBits() : called during render\n");
    }
    // @Helium 0x11f6d1: eax = field_88
    const cur = this.field_88 | 0;
    const m = mask | 0;
    // @Helium 0x11f6d7: if (mask & field_88) == 0 → nothing to clear, return
    if ((m & cur) === 0) {
      return;
    }
    // @Helium 0x11f6dc..0x11f6e2: field_88 = field_88 & ~mask  (32-bit)
    this.field_88 = (cur & ~m) >>> 0;
    // @Helium 0x11f6e8..0x11f6f3: if treeHeaderPtr === &this->treeNode-sentinel → empty
    // tree, done. In this port, the ctor writes `treeHeaderPtr = this` as the
    // empty-tree sentinel (line noted above) — semantically identical to the
    // "== &this->treeNode" check the asm does on the real 0x78 sub-object.
    if (this.treeHeaderPtr === this) {
      return;
    }
    // @Helium 0x11f708..0x11f74c: libc++ __tree in-order walk, calling
    // `HGNode::ClearBits(0xff)` on `*(node+0x20)` for each node. The __tree
    // internals (`NodePixelsStats` layout, +0x8 right, +0x10 parent) are
    // not yet decoded in this port and no code path currently populates
    // the tree, so reaching here is a decode gap — throw per anti-shortcut
    // rule (loud gap > silent guess).
    throw new Error(
      "HGNode::ClearBits @Helium 0x11f708 tree-walk (libc++ __tree<NodePixelsStats> " +
      "in-order iterator + tail-recursive ClearBits(0xff) on entry+0x20) not yet transcribed"
    );
  }

  /**
   * `HGNode::ClearBits()` — Helium @0x11c890.
   *
   * The void-arg thunk. Full body (7 bytes):
   *   0x11c890: pushq %rbp
   *   0x11c891: movq  %rsp, %rbp
   *   0x11c894: movl  $0xffff, %esi                    ; mask = 0xFFFF
   *   0x11c899: popq  %rbp
   *   0x11c89a: jmp   __ZN6HGNode9ClearBitsEi          ; tail-jmp ClearBits(int)
   *
   * Equivalent to `this->ClearBits(0xFFFF)` — clear all 16 low bits.
   */
  ClearBitsAll(): void {
    // @Helium 0x11c894: mask = 0xFFFF
    // @Helium 0x11c89a: tail-jmp HGNode::ClearBits(int)
    this.ClearBits(0xffff);
  }

  // ---------------------------------------------------------------------------
  // UNIT: HGNode::SupportsGLSL() const                         @Helium 0x1221a0
  //   __ZNK6HGNode12SupportsGLSLEv
  //
  // re/disasm: raw-port/re/disasm/Helium.__ZNK6HGNode12SupportsGLSLEv.s (9 lines)
  //
  // FULL DISASM (6 real insns @0x1221a0..0x1221ad; 0x1221ae is padding):
  //   0x1221a0  pushq  %rbp
  //   0x1221a1  movq   %rsp, %rbp
  //   0x1221a4  movzbl 0x11(%rdi), %eax   ; al = *(u8*)(this + 0x11)
  //   0x1221a8  andb   $0x2, %al          ; al &= 0x02
  //   0x1221aa  shrb   %al                ; al >>= 1   (implicit count 1)
  //   0x1221ac  popq   %rbp
  //   0x1221ad  retq
  //   0x1221ae  nop                       ; padding, not code
  //
  // WHICH BIT — the load is of the BYTE at +0x11, which is byte 1 of the u32
  // `renderPageStrategy` at +0x10 (see the STRUCT LAYOUT block at the top of
  // this file). So `(*(u8*)(this+0x11)) & 0x02` selects bit 9 of that u32,
  // i.e. the 0x200 bit — EXACTLY the value the constructor stores there:
  //   @0x11bc3b  movl $0x200, 0x10(%rbx)   (HGNode::HGNode, already ported
  //                                          above as renderPageStrategy = 0x200)
  //   @0x11baa4  movl $0x200, 0x10(%rdi)   (HGNode::Init, likewise)
  // So a default-constructed HGNode reports SupportsGLSL() == 1, which is the
  // strongest available confirmation that +0x10 is a capability bitfield and
  // that bit 9 is the GLSL capability.
  //
  // The two IMMEDIATELY ADJACENT accessors are the same six instructions on
  // the same byte with the next two bits, which pins the bit assignment:
  //   @0x1221b4/0x1221b8/0x1221ba  SupportsMetal: (u8@+0x11 & 0x04) >> 2
  //                                               -> bit 10 of +0x10 (0x400)
  //   @0x1221c4/0x1221c8/0x1221ca  SupportsSWAIR: (u8@+0x11 & 0x08) >> 3
  //                                               -> bit 11 of +0x10 (0x800)
  // Both are separate ledger units and are NOT ported here — cited only as
  // the evidence for the bit numbering.
  //
  // RETURN TYPE — there is no `sete`; the machine narrows with `andb` then
  // `shrb`, leaving the SHIFTED BIT in %al. Following the convention this
  // port already uses (a `sete`-terminated predicate becomes `boolean`, e.g.
  // HGLimits::isfragment @0xa7973; an and/shift/cmov-terminated one stays an
  // integer, e.g. HGFormatUtils::toHGGLContextID @0xa1c08), this returns a
  // `number` that is 0 or 1.
  //
  // FRONTIER CALLEES: zero. One byte load, one mask, one shift —
  // `depgraph.py deps __ZNK6HGNode12SupportsGLSLEv` reports nothing (0
  // in-scope callees, 0 externs, 0 indirect). Integer only.
  // ---------------------------------------------------------------------------

  /**
   * `HGNode::SupportsGLSL() const` — @Helium 0x1221a0
   * (__ZNK6HGNode12SupportsGLSLEv).
   *
   * Returns bit 1 of the byte at +0x11 — i.e. the 0x200 bit of the
   * `renderPageStrategy` u32 at +0x10 — as a 0/1 integer. Both the
   * constructor @0x11bc3b and `Init` @0x11baa4 store 0x200 there, so this
   * reports 1 on a freshly constructed node.
   *
   * Faithful transcription:
   *   0x1221a4  movzbl 0x11(%rdi), %eax
   *   0x1221a8  andb   $0x2, %al
   *   0x1221aa  shrb   %al
   *
   * No callees, no externs, no indirect calls; the `const` qualifier matches
   * the `__ZNK...` mangling and the body only reads.
   *
   * Source disassembly:
   *   raw-port/re/disasm/Helium.__ZNK6HGNode12SupportsGLSLEv.s
   */
  SupportsGLSL(): number {
    // @Helium 0x1221a4: movzbl 0x11(%rdi), %eax — the BYTE at +0x11 is byte 1
    //   of the u32 modelled here as renderPageStrategy (+0x10).
    const byteAt0x11 = ((this.renderPageStrategy >>> 8) & 0xff) >>> 0;
    // @Helium 0x1221a8: andb $0x2, %al
    const masked = byteAt0x11 & 0x2;
    // @Helium 0x1221aa: shrb %al  (implicit shift count of 1)
    return masked >>> 1;
  }

  // NOTE: the vtable slot *0x78 for HGNode is HGNode::SetInput @0x11c5f0,
  // and *0x80 is HGNode::GetInput @0x11c8b0. Subclasses that inherit
  // HGNode's default behavior get exactly the methods above.
}

/**
 * `HGLogger::warning(char const*, ...)` — Helium extern.
 * Not decoded in this port; wired as a thin console warning wrapper so
 * ClearBits' warn path is observable without pulling in the full HGLogger
 * translation unit. The literal-string @Helium 0x8e81d0 is passed verbatim.
 */
function HGLogger_warning(msg: string): void {
  // eslint-disable-next-line no-console
  console.warn(msg);
}

// ---------------------------------------------------------------------------
// Supporting types recovered from HGNode asm (declarations, not full ports).
// ---------------------------------------------------------------------------

/**
 * `HGInputSlot` — recovered structure (0x38 bytes) from HGNode::SetInput
 * asm @0x11c690..0x11c6c5 and HGNode::GetInput @0x11c8cc:
 *   0x00 : HGNode* parent
 *   0x08 : i32     index
 *   0x0c : u32     pad
 *   0x10 : HGNode* srcNode        ← what GetInput returns
 *   0x1c : u32     field_1c
 *   0x20 : HGRect  rect (16 bytes)
 *   0x30 : u64     tail
 *
 * Full port lives elsewhere; here we declare only the fields the two
 * decoded methods (Init/GetInput) reference.
 */
export interface HGInputSlot {
  parent: HGNode;
  index: number;
  srcNode: HGNode | null;
  // ...other fields decoded in SetInput but not read from here.
}

/** Minimal HGRect view — the full class is landed elsewhere in this port. */
interface HGRectLite {
  x: number; y: number; w: number; h: number;
}

/** Emulates the effect of copying `_HGRectNull` (a 16-byte "null" rect) into a fresh slot. */
function HGRectNull_copy(): HGRectLite {
  // _HGRectNull semantic per HGRect.ts port: an "empty" rect. We keep
  // it opaque here — the exact numeric fields are the HGRect.ts port's
  // responsibility. Providing zero here is only structurally correct;
  // arithmetic ops on the resulting rect are decoded in HGRect.ts.
  return { x: 0, y: 0, w: 0, h: 0 };
}

/** Minimal HGShaderBinding view. The real reset() is @Helium
 *  __ZN15HGShaderBinding5resetEv — not decoded here. */
interface HGShaderBindingLite { /* opaque */ __resetMarker: 0; }
function HGShaderBinding_reset(): HGShaderBindingLite {
  // @Helium HGShaderBinding::reset() — return a fresh zero-state binding.
  return { __resetMarker: 0 };
}
