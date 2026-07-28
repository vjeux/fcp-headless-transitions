// HGAVATemporalAverage.ts — Helium "AVA (Anti Video Aliasing) Temporal
// Average" wrapper HGNode. Encapsulates an inner `HgcAVATemporalAverage`
// sub-node (a 0x1a0-byte compute node with an aligned 32-byte coefficient
// buffer preloaded with float32 0.5f values) and exposes two named inputs
// through the HGRenderer's dependency-graph plumbing.
//
// Faithfully transcribed from Helium binary at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// Source disassembly:
//   raw-port/re/disasm/Helium.HGAVATemporalAverage.C2.s                                 (@0x212c70)
//   raw-port/re/disasm/Helium.HGAVATemporalAverage.HGAVATemporalAverage.s               (@0x212da0, C1)
//   raw-port/re/disasm/Helium.HGAVATemporalAverage.D2_D1.s                              (@0x212db0 D2, @0x212df0 D1)
//   raw-port/re/disasm/Helium.HGAVATemporalAverage.~HGAVATemporalAverage.s              (@0x212e30, D0)
//   raw-port/re/disasm/Helium.HGAVATemporalAverage.GetOutput.s                          (@0x212e80)
//
// STRUCT LAYOUT (recovered from C2 stores + destructor / GetOutput reads):
//   +0x000  vtable*  vtbl                 // outer HGAVATemporalAverage vptr.
//                                          //   Installed at @0x212c89 (C2)
//                                          //   / @0x212db6/dbd (D2 unwinds base)
//                                          //   / @0x212df6/dfd (D1 unwinds base)
//                                          //   / @0x212e39/40 (D0 unwinds base).
//                                          //   Value = 0xa2f8e8 (= __ZTV20HGAVATemporalAverage + 0x10).
//   +0x008  ...                            // Inherited HGNode fields (base class layout).
//                                          //   HGNode is not yet ported — treated as opaque.
//   +0x198  HgcAVATemporalAverage* inner   // owning pointer to the inner compute
//                                          //   sub-node. Written at @0x212c8c (initial 0),
//                                          //   swapped in at @0x212d16 (final r14),
//                                          //   read at @0x212cff (C2 rebuild path) /
//                                          //   @0x212dc0 (D2) / @0x212e00 (D1) /
//                                          //   @0x212e43 (D0) / @0x212e90 / @0x212eb2 /
//                                          //   @0x212eda (GetOutput).
//
// INNER SUB-OBJECT layout (HgcAVATemporalAverage, sizeof=0x1a0, allocated
// via HGObject::operator new @0x212c9c):
//   +0x000  vtable*  vtbl                 // inner HgcAVATemporalAverage vptr.
//                                          //   Installed at @0x212cb3 = 0xa2f6a8
//                                          //   (= __ZTV21HgcAVATemporalAverage + 0x10).
//   +0x010  uint32   flags                 // written at @0x212cfb via a bit-mask update:
//                                          //   flags = (old & ~0x600) | 0x400
//                                          //   (mask constant 0xfffff9ff = ~0x600 masks off
//                                          //    two bits at positions 9-10; then bit 10 (0x400)
//                                          //    is re-asserted — effectively storing the value
//                                          //    "bit 10 on, bit 9 off" into a two-bit field).
//   +0x198  float32* coefBuf              // aligned pointer into a `new float[]` 71-byte
//                                          //   allocation, pointing at aligned_base + 8, where
//                                          //   aligned_base is the smallest address ≥ new_ptr
//                                          //   such that (aligned_base + 8) % 32 == 0.
//                                          //   The pointer sitting -8 bytes back stores the
//                                          //   ORIGINAL `new[]` return address (for delete[]).
//                                          //   The 32 bytes at [aligned_base+8 .. aligned_base+40)
//                                          //   are initialized to 0.5f (8 × float32).
//
// PARENT (frontier — routed through explicit throwing stubs):
//   HGNode — base class. C2 calls HGNode::HGNode(this) @0x212c7d and also
//     HGNode::HGNode(inner) @0x212ca7 for the sub-object.
//   HGObject — grandparent. HGObject::operator new(unsigned long) @0x212c9c
//     supplies the 0x1a0-byte inner allocation. D0 tail-jmps HGObject::operator
//     delete @0x212e66.
//   HGObject::Release()  @0x212d22   — called on inner if it was already ==r14
//                                        (bit-level dedup — see ctor step 6 below).
//   __ZN6HGNodeD2Ev  HGNode::~HGNode  — tail-called by D2/D1 @0x212de1/@0x212e21
//                                        and by D0 @0x212e58.
//   __Znam  (::operator new[]) @0x3c4fac — inner coefficient-buffer allocation
//                                          @0x212cbb.
//
// FRONTIER SUB-OBJECT VTABLE (used indirectly):
//   HgcAVATemporalAverage vtable slot +0x18 — the "Release / dtor / detach"
//     entrypoint. Called at @0x212d13 (ctor's swap path), @0x212dd5 (D2),
//     @0x212e15 (D1), @0x212e52 (D0), and @0x212d43/@0x212d7c (unwind cleanup).
//     Signature: `void ()(HgcAVATemporalAverage*)`.
//   HgcAVATemporalAverage vtable slot +0x78 — the "connect input" primitive.
//     Called TWICE per GetOutput invocation @0x212eaf and @0x212ed7. Signature
//     (recovered from ABI): `void ()(HgcAVATemporalAverage* self, int index, HGRendererOutput* src)`.
//
// FRONTIER FREE FUNCTIONS:
//   HGRenderer::GetInput(HGNode*, int) — __ZN10HGRenderer8GetInputEP6HGNodei.
//     Called @0x212e9f (index=0) and @0x212ec4 (index=1) inside GetOutput.
//
// CONSTANT PROVENANCE (RIP-relative reads):
//   @0x212c82 leaq 0x81cc5f(%rip),%rax   -> 0xa2f8e8  outer vtable installed-ptr
//   @0x212cac leaq 0x81c9f5(%rip),%rax   -> 0xa2f6a8  inner vtable installed-ptr
//   @0x212cd5 movaps 0x1b4f94(%rip),%xmm0 -> 0x3c7c70  128-bit constant
//                                            = 0x3f0000003f000000_3f0000003f000000
//                                            = 4 × float32 0.5f (packed)
//   @0x212ced movl $0xfffff9ff,%eax                = ~0x600 (clears two bits at pos 9-10)
//   @0x212cf6 orl  $0x400,%eax                     = 0x400  (sets bit 10)
//   @0x212cbb movl $0x47,%edi                       = 71 (bytes to new[])
//   @0x212cc6 andl $0x1f,%ecx                       = 31 (align to 32-byte boundary)
//   @0x212c97 movl $0x1a0,%edi                       = 416 (sizeof inner sub-object)
//   @0x212e30-e40 D0 leaq 0x81caa8(%rip),%rax    -> 0xa2f8e8 outer vtable (same as C2)
//   @0x212db6-bd D2 leaq 0x81cb2b(%rip),%rax     -> 0xa2f8e8
//   @0x212df6-fd D1 leaq 0x81caeb(%rip),%rax     -> 0xa2f8e8
//
// NUMERIC CONTRACT: no float arithmetic — this class is pure graph plumbing.
// The 0.5f coefficient buffer is initialized-and-forgotten; downstream code
// (inner HgcAVATemporalAverage) consumes it, and is a separate port. All
// value math in HGAVATemporalAverage itself is 32-bit / 64-bit ALU + pointer
// arithmetic; no fround / f32 saturation issues to worry about here.

/**
 * Opaque HGNode base handle. HGNode is a frontier class — we surface a
 * nominal type so callers can pass it through the ported layer without
 * accidentally treating it as any other opaque handle.
 */
export type HGNodeHandle = { readonly __hgNode: unique symbol };

/**
 * Opaque HGRenderer handle. Frontier.
 */
export type HGRenderer = { readonly __hgRenderer: unique symbol };

/**
 * Opaque HGRendererOutput handle. Return type of HGRenderer::GetInput; consumed
 * by inner->vtable+0x78 (the "connect input" call).
 */
export type HGRendererOutput = { readonly __hgRendererOutput: unique symbol };

/**
 * HgcAVATemporalAverage — the inner compute sub-node. We expose a minimal
 * portable view of its ABI (the two vtable slots this file dispatches into),
 * enough to model the connect-input plumbing without pulling in the full
 * inner class (a separate port).
 */
export interface HgcAVATemporalAverage {
  /** Struct @+0x10 — bit-flags. See ctor step 5 below. */
  flags: number;
  /** Struct @+0x198 — 32-byte-aligned float32 coefficient buffer.
   *  Initialized to 0.5f × 8 by C2 @0x212cdc/@0x212ce1 (two 128-bit stores). */
  coefBuf: Float32Array | null;

  /** Vtable slot +0x18 — Release/detach entrypoint. Called from HGAVATemporalAverage
   *  destructors and from the C2 swap path @0x212d13. */
  vtable_slot_0x18(): void;

  /** Vtable slot +0x78 — connect-input primitive. Called from GetOutput
   *  @0x212eaf (index=0) and @0x212ed7 (index=1). */
  vtable_slot_0x78(index: number, src: HGRendererOutput | null): void;
}

/** __ZN6HGNodeC2Ev — HGNode::HGNode(). Frontier — not yet ported. */
function HGNode_ctor(_self: object): void { // @0x212c7d / @0x212ca7
  throw new Error("HGAVATemporalAverage frontier callee not yet transcribed: HGNode::HGNode() @call-sites 0x212c7d / 0x212ca7"); // @0x212c7d
}

/** __ZN6HGNodeD2Ev — HGNode::~HGNode(). Frontier — not yet ported. */
function HGNode_dtor(_self: object): void { // @0x212de1 / @0x212e21 / @0x212e58
  throw new Error("HGAVATemporalAverage frontier callee not yet transcribed: HGNode::~HGNode() @call-sites 0x212de1 / 0x212e21 / 0x212e58"); // @0x212de1
}

/** __ZN8HGObjectnwEm — HGObject::operator new(unsigned long). Frontier. */
function HGObject_operatorNew(_size: number): HgcAVATemporalAverage { // @0x212c9c
  throw new Error("HGAVATemporalAverage frontier callee not yet transcribed: HGObject::operator new(unsigned long) @call-site 0x212c9c"); // @0x212c9c
}

/** __ZN8HGObjectdlEPv — HGObject::operator delete(void*). Frontier. */
function HGObject_operatorDelete(_p: unknown): void { // @0x212e66
  throw new Error("HGAVATemporalAverage frontier callee not yet transcribed: HGObject::operator delete(void*) @call-site 0x212e66"); // @0x212e66
}

/** __ZN8HGObject7ReleaseEv — HGObject::Release(). Frontier. */
function HGObject_Release(_p: HgcAVATemporalAverage): void { // @0x212d22
  throw new Error("HGAVATemporalAverage frontier callee not yet transcribed: HGObject::Release() @call-site 0x212d22"); // @0x212d22
}

/** __Znam — ::operator new[](unsigned long). Frontier — routes through the
 *  Itanium global new[]. */
function operator_new_array(_size: number): Uint8Array { // @0x212cbb
  throw new Error("HGAVATemporalAverage frontier callee not yet transcribed: ::operator new[](unsigned long) @call-site 0x212cbb"); // @0x212cbb
}

/** __ZN10HGRenderer8GetInputEP6HGNodei — HGRenderer::GetInput(HGNode*, int).
 *  Returns an HGRendererOutput* that identifies the upstream output. Frontier. */
function HGRenderer_GetInput(_r: HGRenderer, _node: HGNodeHandle, _index: number): HGRendererOutput | null { // @0x212e9f / @0x212ec4
  throw new Error("HGAVATemporalAverage frontier callee not yet transcribed: HGRenderer::GetInput(HGNode*, int) @call-sites 0x212e9f / 0x212ec4"); // @0x212e9f
}

/** Outer vtable installed-ptr for HGAVATemporalAverage (Helium @0xa2f8e8).
 *  Resolved via `resolve.py sym 0xa2f8e8`. Same at C2/D2/D1/D0 (via different
 *  leaq displacements). */
export const HGAVA_TEMPORAL_AVERAGE_VPTR = 0xa2f8e8;

/** Inner vtable installed-ptr for HgcAVATemporalAverage (Helium @0xa2f6a8). */
export const HGC_AVA_TEMPORAL_AVERAGE_VPTR = 0xa2f6a8;

/**
 * HGAVATemporalAverage — HGNode-derived wrapper that owns an inner
 * HgcAVATemporalAverage compute sub-node.
 */
export class HGAVATemporalAverage {
  /** Struct @+0x00 — vtable ptr (outer). */
  vptr: number = 0;
  /** Struct @+0x198 — owning pointer to inner sub-node. */
  inner: HgcAVATemporalAverage | null = null;

  /**
   * @Helium 0x0000000000212c70  HGAVATemporalAverage::HGAVATemporalAverage()  [C2]
   * @Helium 0x0000000000212da0  HGAVATemporalAverage::HGAVATemporalAverage()  [C1]
   *
   * C1 is a trivial tail-jump to C2 (@0x212da5). The full construction lives in C2.
   *
   * Body of C2 @0x212c70..d31 (non-exception path):
   *   1. @0x212c7d  HGNode::HGNode(this).
   *   2. @0x212c82..89  install outer vtable = 0xa2f8e8 at this->+0x00.
   *   3. @0x212c8c  this->+0x198 = 0 (owner starts null).
   *   4. @0x212c97..9c  operator-new-HGObject 0x1a0 bytes -> `inner`.
   *   5. @0x212ca7  HGNode::HGNode(inner).
   *   6. @0x212cac..b3  install inner vtable = 0xa2f6a8 at inner->+0x00.
   *   7. @0x212cbb..d1  aligned coefficient buffer:
   *        raw = new[](71)
   *        aligned_base = raw + ((-((raw + 8) & 0x1f)) & 0x1f)  ← 32-byte alignment for (aligned_base+8)
   *        raw_ptr_slot_at_-8 = raw     (stored at *(aligned_base) for delete[])
   *        coefBuf = aligned_base + 8   (the "user pointer")
   *   8. @0x212cd5..e1  store {0.5f, 0.5f, 0.5f, 0.5f} twice at (aligned_base+8)
   *      and (aligned_base+24). This initializes 8 × float32 0.5f, i.e. a
   *      normalized-half temporal averaging kernel.
   *      NOTE: xmm0 = *(0x3c7c70) = 4-lane packed 0.5f.
   *   9. @0x212ce6  inner->+0x198 = coefBuf.
   *  10. @0x212ced..fb  flags update at inner->+0x10:
   *        old = *(inner + 0x10)
   *        new = (old & 0xfffff9ff) | 0x400   // clear bits 9-10, set bit 10 = "kind=temporal-average"
   *        *(inner + 0x10) = new
   *  11. @0x212cff..1d  atomic-ish swap-in of `inner` into this->+0x198:
   *        old = this->+0x198
   *        if (old != inner):
   *          if (old != null) old->vtable+0x18()   // detach old
   *          this->+0x198 = inner
   *        else:
   *          HGObject::Release(inner)              // (already owned) release the new one
   *
   * Exception-unwind edges @0x212d32..97 catch operator-new / HGNode::HGNode /
   * ::operator new[] failures and clean up in FIFO order. The TS port lifts
   * these into throw stubs — if any frontier throws, JS's exception unwinding
   * runs the same cleanup semantically (via GC + explicit release inside a
   * try/catch would be needed to match precisely; we defer that until the
   * base classes are ported).
   */
  constructor() { // @0x212c70 (C2) / @0x212da0 (C1)
    // @0x212c7d — HGNode::HGNode(this). Frontier.
    HGNode_ctor(this); // @0x212c7d
    // @0x212c82..89 — install outer vptr.
    this.vptr = HGAVA_TEMPORAL_AVERAGE_VPTR; // @0x212c89
    // @0x212c8c — this->+0x198 = null (owner starts empty).
    this.inner = null;                       // @0x212c8c

    // @0x212c97..9c — allocate 0x1a0 bytes for the inner sub-node. Frontier.
    const inner = HGObject_operatorNew(0x1a0); // @0x212c9c
    // @0x212ca7 — HGNode::HGNode(inner). Frontier.
    HGNode_ctor(inner as unknown as object);   // @0x212ca7
    // @0x212cac..b3 — install inner vptr.
    (inner as { vptr?: number }).vptr = HGC_AVA_TEMPORAL_AVERAGE_VPTR; // @0x212cb3

    // @0x212cbb — new[] 71 bytes. Frontier.
    const raw = operator_new_array(0x47); // @0x212cbb
    // @0x212cc0..d1 — compute 32-byte aligned pointer for (aligned_base + 8).
    //   Native:
    //     rcx = raw + 8
    //     rcx = -rcx
    //     rcx &= 0x1f       // 32-byte alignment slack
    //     rdx = raw + rcx + 8   // "user pointer" = aligned_base + 8
    //     *(raw + rcx) = raw    // store raw ptr at aligned_base for delete[]
    //   In TS we treat `raw` as a Uint8Array and don't emulate the negative
    //   alignment trick; JS Float32Arrays are natively 32-byte-alignable via
    //   their backing ArrayBuffer's byteOffset. We construct an 8-element
    //   Float32Array (32 bytes) directly — that's the observable buffer.
    //   The delete[]-back-pointer at -8 is a native-side allocator concern
    //   that has no TS counterpart.
    //   PROVENANCE: the raw allocation size 0x47 and the two 128-bit stores
    //   define exactly 32 bytes of live data (8 × f32 0.5) at aligned_base+8.
    void raw;
    const coefBuf = new Float32Array(8);

    // @0x212cd5 xmm0 = *(0x3c7c70) = {0.5f, 0.5f, 0.5f, 0.5f} packed.
    // @0x212cdc movaps xmm0, aligned_base+0x18  (offsets 24..40 of raw = 4 × 0.5f)
    // @0x212ce1 movaps xmm0, aligned_base+0x08  (offsets 8..24  of raw = 4 × 0.5f)
    coefBuf[0] = 0.5; coefBuf[1] = 0.5; coefBuf[2] = 0.5; coefBuf[3] = 0.5; // @0x212ce1
    coefBuf[4] = 0.5; coefBuf[5] = 0.5; coefBuf[6] = 0.5; coefBuf[7] = 0.5; // @0x212cdc

    // @0x212ce6 — inner->+0x198 = coefBuf.
    inner.coefBuf = coefBuf; // @0x212ce6

    // @0x212ced..fb — flags = (flags & ~0x600) | 0x400 at inner->+0x10.
    const oldFlags = inner.flags | 0;              // @0x212cf2  andl 0x10(%r14),%eax
    const newFlags = ((oldFlags & 0xfffff9ff) | 0x400) >>> 0; // @0x212ced/f6
    inner.flags = newFlags | 0;                    // @0x212cfb

    // @0x212cff..1d — swap-in of the inner sub-node into this->+0x198.
    // (this->+0x198 starts null per step 3, so we always take the null-branch
    //  here — old==null → skip the vtable+0x18 dtor call; store new.)
    const old = this.inner as HgcAVATemporalAverage | null;                        // @0x212cff
    if (old !== inner) {                            // @0x212d06/09  cmpq %r14,%rdi ; je
      if (old !== null) {                           // @0x212d0b/0e  testq %rdi,%rdi ; je
        // @0x212d10/13  rax = old->vtbl ; callq *(rax+0x18) — old's Release/detach.
        old.vtable_slot_0x18();                    // @0x212d13
      }
      this.inner = inner;                           // @0x212d16
    } else {
      // @0x212d1f/22 — HGObject::Release(inner). (Unreachable given step 3
      //   null-init; kept for faithful control-flow mirroring.) Frontier.
      HGObject_Release(inner);                     // @0x212d22
    }
  }

  /**
   * @Helium 0x0000000000212db0  HGAVATemporalAverage::~HGAVATemporalAverage()  [D2]
   * @Helium 0x0000000000212df0  HGAVATemporalAverage::~HGAVATemporalAverage()  [D1]
   *
   * Both bodies are byte-identical (modulo leaq displacement):
   *   1. Install outer vptr at this->+0x00 (Itanium unwind pattern —
   *      as sub-objects destruct, the vtable-pointer is walked down the
   *      inheritance chain). @0x212db6/bd (D2) / @0x212df6/fd (D1).
   *   2. Read this->+0x198 (inner). @0x212dc0 / @0x212e00.
   *   3. If non-null: call inner->vtable+0x18 (Release/detach).
   *      @0x212dd5 / @0x212e15.
   *   4. Tail-jmp HGNode::~HGNode(this). @0x212de1 / @0x212e21.
   *
   * The __clang_call_terminate landing @0x212de6/@0x212e26 catches an
   * exception in the vtable slot — not modeled here.
   */
  destroy(): void { // @0x212db0 (D2) / @0x212df0 (D1)
    // @0x212db6/bd (D2), @0x212df6/fd (D1) — reinstall outer vptr.
    this.vptr = HGAVA_TEMPORAL_AVERAGE_VPTR; // @0x212dbd / @0x212dfd
    // @0x212dc0 (D2) / @0x212e00 (D1) — read inner.
    const inner = this.inner; // @0x212dc0
    if (inner !== null) {                  // @0x212dc7/ca / @0x212e07/0a
      // @0x212dd5 / @0x212e15 — inner->vtable+0x18().
      inner.vtable_slot_0x18();            // @0x212dd5 / @0x212e15
    }
    // @0x212de1 / @0x212e21 — HGNode::~HGNode(this). Frontier.
    HGNode_dtor(this);                     // @0x212de1 / @0x212e21
  }

  /**
   * @Helium 0x0000000000212e30  HGAVATemporalAverage::~HGAVATemporalAverage()  [D0]
   *
   * Body @0x212e30..66:
   *   1. @0x212e39/40 — reinstall outer vptr (same as D2/D1).
   *   2. @0x212e43/4a/4d — read inner; if non-null call inner->vtable+0x18.
   *   3. @0x212e58 — HGNode::~HGNode(this).
   *   4. @0x212e66 — tail-jmp HGObject::operator delete(this).
   *
   * D0 = D1 + operator-delete. GC handles the delete in TS.
   */
  destroyDeleting(): void { // @0x212e30
    // @0x212e39/40 — reinstall outer vptr.
    this.vptr = HGAVA_TEMPORAL_AVERAGE_VPTR; // @0x212e40
    // @0x212e43..52 — release inner.
    const inner = this.inner; // @0x212e43
    if (inner !== null) {                     // @0x212e4a/4d
      inner.vtable_slot_0x18();               // @0x212e52
    }
    // @0x212e58 — HGNode::~HGNode(this).
    HGNode_dtor(this);                        // @0x212e58
    // @0x212e66 — HGObject::operator delete(this).
    HGObject_operatorDelete(this);            // @0x212e66
  }

  /**
   * @Helium 0x0000000000212e80  HGAVATemporalAverage::GetOutput(HGRenderer*)
   *   __ZN20HGAVATemporalAverage9GetOutputEP10HGRenderer
   *
   * Return type: HgcAVATemporalAverage* (this->+0x198). The method connects
   * the outer HGAVATemporalAverage's two graph inputs (index 0 and 1) as
   * inputs of the inner HgcAVATemporalAverage compute node, then returns the
   * inner pointer for the caller to use as the actual renderer output.
   *
   * Body @0x212e80..eeb:
   *   1. @0x212e90       r15 = this->+0x198 (inner).
   *   2. @0x212e97..9f   src0 = HGRenderer::GetInput(this, 0).
   *   3. @0x212ea4..af   inner->vtable+0x78(index=0, src=src0). ← connect input 0.
   *   4. @0x212eb2       r15 = this->+0x198 again (may have changed if the
   *                       previous vtable call reassigned it? — actually not:
   *                       vtable+0x78 is "connect input", not a swap. The reload
   *                       likely covers the case where a downstream event
   *                       invalidates the pointer. Faithful mirror below.)
   *   5. @0x212eb9..c4   src1 = HGRenderer::GetInput(this, 1).
   *   6. @0x212ec9..d7   inner->vtable+0x78(index=1, src=src1). ← connect input 1.
   *   7. @0x212eda       rax = this->+0x198 (final reload).
   *   8. @0x212eeb       ret.
   */
  GetOutput(renderer: HGRenderer): HgcAVATemporalAverage | null { // @0x212e80
    // @0x212e90 — read inner.
    let inner = this.inner; // @0x212e90 (first read; the native code re-reads twice — mirrored below)

    // @0x212e97..9f — HGRenderer::GetInput(renderer, this, 0). Frontier.
    const src0 = HGRenderer_GetInput(renderer, this as unknown as HGNodeHandle, 0); // @0x212e9f

    // @0x212ea4..af — inner->vtable+0x78(0, src0). See VTABLE header for slot desc.
    if (inner !== null) {
      inner.vtable_slot_0x78(0, src0); // @0x212eaf
    }

    // @0x212eb2 — re-read inner (native reload).
    inner = this.inner; // @0x212eb2

    // @0x212eb9..c4 — HGRenderer::GetInput(renderer, this, 1). Frontier.
    const src1 = HGRenderer_GetInput(renderer, this as unknown as HGNodeHandle, 1); // @0x212ec4

    // @0x212ec9..d7 — inner->vtable+0x78(1, src1).
    if (inner !== null) {
      inner.vtable_slot_0x78(1, src1); // @0x212ed7
    }

    // @0x212eda — return this->+0x198 (fresh reload; native code reloads once more).
    return this.inner; // @0x212eda
  }
}
