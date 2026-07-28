// raw-port/src/render/HGDemosaic.ts
//
// FCP `HGDemosaic` — Helium HGNode-derived wrapper that OWNS a child
// `HGDemosaicImplementation` (the actual per-pixel Bayer→RGB demosaic
// worker) and forwards all render-graph traffic to it. The wrapper is a
// thin ABI: ctor allocates the 0x40-byte child, GetOutput asks the
// renderer for its input node and tail-jmps `HGDemosaicImplementation::
// GenerateGraph`, SetParameter dispatches 9 parameter slots into the
// child's inline float storage at +0xc..+0x33 via a computed-goto jump
// table, and the dtor releases the child through its vtable slot +0x18
// (== HGObject::Release).
//
// This file ports the OUTER wrapper only. The demosaic MATH lives in
// HGDemosaicImplementation (@Helium 0xdd420 / 0xdd560) and is left as a
// throwing stub cited at the exact tail-jmp site (see below).
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Helium.framework/Versions/A/Helium (x86_64 slice; VAs
//             taken from `otool -tV` + `nm` symbol table; raw bytes
//             confirmed by reading the thin x86_64 slice at file
//             offset == VA for __TEXT).
//
// Disassembly saved at:
//   raw-port/re/disasm/Helium.HGDemosaic.HGDemosaic.s      @0xdd8d0 (C1)
//   raw-port/re/disasm/Helium.HGDemosaic.~HGDemosaic.s     @0xdd9f0 (D0)
//   raw-port/re/disasm/Helium.HGDemosaic.SetParameter.s    @0xdda40
//   (GetOutput @0xddb80 not extractable via disasm.sh because otool's
//    linear sweep decoded the SetParameter jump table @0xddb58..0xddb7f
//    into "bad opcodes" and lost the label boundary at 0xddb80 —
//    disasm.sh correctly EXITED 2 rather than guess.  Bytes at 0xddb80
//    were then read directly from the thin x86_64 slice and match the
//    ICF-folded GetOutput family that HGCrop/HGInvertAlpha/… all share.)
//
// SYMBOLS PORTED:
//   @Helium 0xdd830  HGDemosaic::HGDemosaic()  (C2 base ctor — ICF-folded
//                                               into C1 body)
//   @Helium 0xdd8d0  HGDemosaic::HGDemosaic()  (C1 complete ctor)
//   @Helium 0xdd970  HGDemosaic::~HGDemosaic() (D2 base dtor)
//   @Helium 0xdd9b0  HGDemosaic::~HGDemosaic() (D1 complete dtor)
//   @Helium 0xdd9f0  HGDemosaic::~HGDemosaic() (D0 deleting dtor)
//   @Helium 0xdda40  HGDemosaic::SetParameter(int idx, float, float, float, float)
//   @Helium 0xddb80  HGDemosaic::GetOutput(HGRenderer*)
//
// EXTERNAL SYMBOLS REFERENCED (declared as throwing stubs — each cites
// its call-site @0xADDR so frontier.py can see the gap):
//   @Helium 0xdd420  HGDemosaicImplementation::SetParameter(int, float, float, float, float)
//                    (NOT called by HGDemosaic — HGDemosaic reads/writes the child's
//                     float slots directly; listed here for the ledger's benefit)
//   @Helium 0xdd560  HGDemosaicImplementation::GenerateGraph(HGRenderer*, HGNode*)
//                    (tail-jmp'd by HGDemosaic::GetOutput @0xddbb0)
//   @Helium 0xddc60  HGDemosaicImplementation::~HGDemosaicImplementation (D0)
//                    (reached indirectly via child vtable slot +0x18 in the wrapper's dtors)
//   @Helium __stubs  HGNode::HGNode()   __ZN6HGNodeC2Ev
//                    (called by C1 @0xdd8dd)
//   @Helium __stubs  HGNode::~HGNode()  __ZN6HGNodeD2Ev
//                    (called by D2 @0xdd9a1, D1 @0xdd9e1, D0 @0xdda18)
//   @Helium __stubs  HGObject::HGObject()          __ZN8HGObjectC2Ev
//                    (called by C1 @0xdd8fc — inits the fresh child)
//   @Helium __stubs  HGObject::operator new(size_t) __ZN8HGObjectnwEm
//                    (called by C1 @0xdd8f1 with size=0x40)
//   @Helium __stubs  HGObject::operator delete(void*) __ZN8HGObjectdlEPv
//                    (tail-jmp'd by D0 @0xdda26 after D2 sequence; also called
//                     from the C1 exception cleanup path @0xdd93d)
//   @Helium __stubs  HGRenderer::GetInput(HGNode*, int)  __ZN10HGRenderer8GetInputEP6HGNodei
//                    (called by GetOutput @0xddb95 with (renderer, this, 0))
//
// RIP-RELATIVE VTABLE ADDRESSES (recorded for provenance; the actual
// vtable contents are opaque and remain in native memory):
//   @0xdd8e9  leaq 0x92f5a7(%rip) → __TEXT+0xa0ce90  HGDemosaic C1 vtable slot
//   @0xdd908  leaq 0x92fc90(%rip) → __TEXT+0xa0d598  HGDemosaicImplementation vtable
//   @0xdda00  leaq 0x92f490(%rip) → __TEXT+0xa0ce90  HGDemosaic D0 vtable rebind
//   @0xdd9bd  leaq 0x92f4d3(%rip) → __TEXT+0xa0ce90  HGDemosaic D1 vtable rebind
//   @0xdd97d  leaq 0x92f513(%rip) → __TEXT+0xa0ce90  HGDemosaic D2 vtable rebind
//     (All three dtors rebind to the SAME base-class table before running
//      the sub-object cleanup — standard Itanium ABI pattern.)
//
// STRUCT LAYOUT (recovered from ctor stores + SetParameter accesses):
//   HGDemosaic (HGNode subclass, sizeof ≥ 0x1a0):
//     +0x000..+0x197  HGNode base subobject (vptr, base fields)
//     +0x198  HGDemosaicImplementation* impl   (owned child — allocated
//                                                by HGObject::operator new
//                                                with size 0x40 in the ctor,
//                                                released via impl->vtable[+0x18]
//                                                in the dtors)
//
//   HGDemosaicImplementation (sizeof 0x40 bytes exactly, per @0xdd8ec
//   `movl $0x40, %edi` fed to operator new):
//     +0x000..+0x00b  HGObject base subobject (vptr at 0x00 rebound to
//                     the impl's own vtable @0xdd908; other 4 bytes are
//                     the HGObject refcount managed by HGObject::HGObject
//                     @0xdd8fc)
//     +0x00c  float   param0        (SetParameter idx=0, single float p0)
//     +0x010  float   param1        (SetParameter idx=1, single float p0)
//     +0x014  float   param2        (SetParameter idx=2, single float p0)
//     +0x018  float   param3.a      (SetParameter idx=3, first of a
//                                    packed (p0,p1) float pair — see below)
//     +0x01c  float   param3.b
//     +0x020  float   param4        (SetParameter idx=4, single float p0)
//     +0x024  float   param5        (SetParameter idx=5, single float p0)
//     +0x028  float   param6        (SetParameter idx=6, single float p0)
//     +0x02c  float   param7        (SetParameter idx=7, single float p0)
//     +0x030  float   param8.a      (SetParameter idx=8, first of a
//                                    packed (p0,p1) float pair)
//     +0x034  float   param8.b
//     +0x038..+0x03b  zeroed by ctor at @0xdd91d (`movl $0x0, 0x3c(%r14)`
//                                                 is actually one 4-byte
//                                                 write at +0x3c; the
//                                                 SIMD `movups xmm0,0x2c(%r14)`
//                                                 above zeroed +0x2c..+0x3b)
//     +0x03c..+0x03f  int32   flags/index (initialized to 0 by ctor
//                                          @0xdd91d; not touched by
//                                          SetParameter — presumably read
//                                          in GenerateGraph)
//
//   The ctor zero-initializes the whole float block with three overlapping
//   `movups xmm0, +N(%r14)` writes at N ∈ {0xc, 0x1c, 0x2c}, followed by a
//   4-byte zero at +0x3c. The overlaps are intentional — SSE `movups` is a
//   16-byte unaligned store; the store range 0xc..0x1b union 0x1c..0x2b
//   union 0x2c..0x3b covers all 44 bytes of the parameter block exactly
//   once (except for the 4-byte overlap at each seam which is a redundant
//   zero — harmless).
//
// SetParameter JUMP TABLE (raw-port/re/disasm shows the table decoded as
// "bad opcodes" because it lives in __TEXT; bytes read directly from the
// slice and re-verified):
//   base @0xddb58  (from `leaq 0xfb(%rip),%rdx` @0xdda56 → RIP=0xdda5d → 0xdda5d+0xfb=0xddb58)
//   9 entries × int32:
//     idx=0 disp=-242 → 0xdda66   (writes +0xc)
//     idx=1 disp=-110 → 0xddaea   (writes +0x10)
//     idx=2 disp=-194 → 0xdda96   (writes +0x14)
//     idx=3 disp=-170 → 0xddaae   (writes +0x18 & +0x1c — packed pair via insertps+movlps)
//     idx=4 disp=-218 → 0xdda7e   (writes +0x20)
//     idx=5 disp= -90 → 0xddafe   (writes +0x24)
//     idx=6 disp= -70 → 0xddb12   (writes +0x28)
//     idx=7 disp=-130 → 0xddad6   (writes +0x2c)
//     idx=8 disp= -50 → 0xddb26   (writes +0x30 & +0x34 — packed pair)
//   Every case does an `ucomiss oldValue, newValue` guard: on eq+NP
//   branches to 0xddb3d which returns `0` (unchanged); on differ, writes
//   the new value(s) and returns `1`. `idx > 8` (`cmpl $0x8; ja`) returns
//   `-1` (0xFFFFFFFF).  Packed pairs (idx=3, idx=8) test BOTH old floats
//   against BOTH new floats and treat any bit-differ as "changed" (via
//   the `movshdup` trick to bring the high 32-bit lane down for a second
//   `ucomiss`).
//
// DECODE-DON'T-FIT: every case's ucomiss+conditional-write is preserved
// verbatim.  The child's demosaic math (HGDemosaicImplementation::
// GenerateGraph @0xdd560) is NOT decoded here — the wrapper only owns
// the parameter block and the graph forwarder.

/** HGRenderer — Helium render-graph runner; opaque here. GetOutput takes
 *  it as its first arg but only forwards it as a call-arg to GetInput
 *  and then to GenerateGraph. */
export type HGRenderer = unknown;

/** HGNode — Helium's render-graph node base. Opaque. HGDemosaic derives
 *  from HGNode. */
export type HGNode = unknown;

// ---------------------------------------------------------------------------
// HGDemosaicImplementation — the child compositor node owned by
// HGDemosaic.  Its parameter block is inlined here so the wrapper can
// read and write the 11 float slots directly (matching the raw byte
// offsets in the disassembly).  Everything else (the vtable and the
// GenerateGraph body) is opaque.
// ---------------------------------------------------------------------------

/** HGDemosaicImplementation — a 0x40-byte HGObject-derived compositor
 *  node holding the 11 demosaic float parameters and one int32 flag.
 *  The layout below matches the raw byte offsets observed in the
 *  disassembly of HGDemosaic's ctor + SetParameter dispatch.
 *  This TS interface exposes only the fields the wrapper touches. */
export interface HGDemosaicImplementation {
  /** float @+0x0c — SetParameter idx=0's first slot. */
  param0: number;
  /** float @+0x10 — SetParameter idx=1's first slot. */
  param1: number;
  /** float @+0x14 — SetParameter idx=2's first slot. */
  param2: number;
  /** float @+0x18 — SetParameter idx=3's low lane (packed pair). */
  param3a: number;
  /** float @+0x1c — SetParameter idx=3's high lane (packed pair). */
  param3b: number;
  /** float @+0x20 — SetParameter idx=4's first slot. */
  param4: number;
  /** float @+0x24 — SetParameter idx=5's first slot. */
  param5: number;
  /** float @+0x28 — SetParameter idx=6's first slot. */
  param6: number;
  /** float @+0x2c — SetParameter idx=7's first slot. */
  param7: number;
  /** float @+0x30 — SetParameter idx=8's low lane (packed pair). */
  param8a: number;
  /** float @+0x34 — SetParameter idx=8's high lane (packed pair). */
  param8b: number;
  /** int32 @+0x3c — initialized to 0 by the ctor; only read (never
   *  written) by GenerateGraph in the outer wrapper's traffic. */
  flags: number;
}

// ---------------------------------------------------------------------------
// Undecoded external callees — throwing stubs (PORTING_SPEC rule 3).
// ---------------------------------------------------------------------------

/** HGDemosaicImplementation::GenerateGraph(HGRenderer*, HGNode*) —
 *  the actual demosaic MATH; @Helium 0xdd560.  Tail-jmp'd by
 *  HGDemosaic::GetOutput @0xddbb0.  Body unported.  Called with:
 *    rdi = impl (this+0x198),
 *    rsi = renderer,
 *    rdx = the input node returned by HGRenderer::GetInput. */
function HGDemosaicImplementation_GenerateGraph(
  _impl: HGDemosaicImplementation,
  _renderer: HGRenderer,
  _input: HGNode,
): HGNode {
  throw new Error(
    "HGDemosaicImplementation::GenerateGraph(HGRenderer*, HGNode*) @Helium 0xdd560 " +
      "not yet transcribed (tail-jmp'd from HGDemosaic::GetOutput @0xddbb0)",
  );
}

/** HGRenderer::GetInput(HGNode*, int) — @Helium __stubs.  Called by
 *  HGDemosaic::GetOutput @0xddb95 with (this, index=0).  Returns the
 *  upstream HGNode* (or NULL if none). */
function HGRenderer_GetInput(
  _renderer: HGRenderer,
  _node: HGNode,
  _index: number,
): HGNode | null {
  throw new Error(
    "HGRenderer::GetInput(HGNode*, int) @Helium (__stubs) " +
      "not yet transcribed (called from HGDemosaic::GetOutput @0xddb95)",
  );
}

/** HGNode::HGNode() — @Helium __stubs.  Base ctor invoked by
 *  HGDemosaic::HGDemosaic() @0xdd8dd. */
function HGNode_C2(_self: HGDemosaic): void {
  throw new Error(
    "HGNode::HGNode() @Helium (__stubs) not yet transcribed " +
      "(called from HGDemosaic::HGDemosaic C1 @0xdd8dd)",
  );
}

/** HGNode::~HGNode() — @Helium __stubs.  Tail-jmp'd by every HGDemosaic
 *  dtor after the child-release sequence: D2 @0xdd9a1, D1 @0xdd9e1,
 *  D0 @0xdda18. */
function HGNode_D2(_self: HGDemosaic): void {
  throw new Error(
    "HGNode::~HGNode() @Helium (__stubs) not yet transcribed " +
      "(tail-jmp'd from HGDemosaic dtors @0xdd9a1 / @0xdd9e1 / @0xdda18)",
  );
}

/** HGObject::HGObject() — @Helium __stubs.  Base ctor for the freshly
 *  allocated HGDemosaicImplementation, called by C1 @0xdd8fc. */
function HGObject_C2(_self: HGDemosaicImplementation): void {
  throw new Error(
    "HGObject::HGObject() @Helium (__stubs) not yet transcribed " +
      "(called from HGDemosaic::HGDemosaic C1 @0xdd8fc)",
  );
}

/** HGObject::operator new(unsigned long) — @Helium __stubs.  Called with
 *  size=0x40 by C1 @0xdd8f1 to allocate the child. */
function HGObject_operator_new(_size: number): HGDemosaicImplementation {
  throw new Error(
    "HGObject::operator new(unsigned long) @Helium (__stubs) " +
      "not yet transcribed (called from HGDemosaic::HGDemosaic C1 @0xdd8f1 " +
      "with size=0x40)",
  );
}

/** HGObject::operator delete(void*) — @Helium __stubs.  Tail-jmp'd by
 *  D0 @0xdda26 after the child-release + base-dtor sequence; also
 *  invoked from C1's exception-cleanup path @0xdd93d if HGObject::HGObject
 *  or the ctor body itself throws after the child allocation. */
function HGObject_operator_delete(_p: HGDemosaic | HGDemosaicImplementation): void {
  throw new Error(
    "HGObject::operator delete(void*) @Helium (__stubs) " +
      "not yet transcribed (called from HGDemosaic D0 @0xdda26 " +
      "and C1 exception path @0xdd93d)",
  );
}

/** Child vtable slot +0x18 — HGObject::Release()-family virtual dispatch
 *  that decrements the child's refcount and, at zero, invokes its own D0
 *  dtor.  Called from HGDemosaic dtors D0/D1/D2 at @0xdda12/@0xdd9d5/
 *  @0xdd995 respectively.  Concrete target for our owned child is
 *  HGDemosaicImplementation's vtable slot +0x18 = HGObject::Release (opaque). */
function HGDemosaicImplementation_vt_18_Release(
  _impl: HGDemosaicImplementation,
): void {
  throw new Error(
    "HGDemosaicImplementation vtable[+0x18] (HGObject::Release) @Helium " +
      "not yet transcribed (called from HGDemosaic dtors @0xdd995 / " +
      "@0xdd9d5 / @0xdda12)",
  );
}

// ---------------------------------------------------------------------------
// HGDemosaic.
// ---------------------------------------------------------------------------

/** HGDemosaic — HGNode-derived wrapper around HGDemosaicImplementation.
 *  The whole 0x00..0x198 base subobject is opaque (owned by HGNode); the
 *  only wrapper-added field is the child pointer at +0x198. */
export class HGDemosaic {
  /** this+0x198 — owned HGDemosaicImplementation. Allocated in the ctor
   *  (HGObject::operator new + HGObject::HGObject); released in the dtor
   *  via the child's vtable slot +0x18 (HGObject::Release). */
  impl!: HGDemosaicImplementation;

  // -------------------------------------------------------------------------
  // HGDemosaic() — C1 complete ctor @0xdd8d0 (C2 base ctor @0xdd830 is
  // ICF-folded with the same body).
  //
  //   pushq %rbp; movq %rsp,%rbp; pushq %r15; pushq %r14; pushq %rbx; pushq %rax
  //   movq %rdi, %rbx                              ; rbx = this
  //   callq __ZN6HGNodeC2Ev                        ; HGNode::HGNode()      @0xdd8dd
  //   leaq 0x92f5a7(%rip), %rax                    ; HGDemosaic vtable     @0xdd8e2
  //   movq %rax, (%rbx)                            ; this.vptr = &vtable
  //   movl $0x40, %edi                             ; size = 0x40           @0xdd8ec
  //   callq __ZN8HGObjectnwEm                      ; HGObject::operator new@0xdd8f1
  //   movq %rax, %r14                              ; r14 = child
  //   movq %rax, %rdi
  //   callq __ZN8HGObjectC2Ev                      ; HGObject::HGObject()  @0xdd8fc
  //   leaq 0x92fc90(%rip), %rax                    ; child vtable          @0xdd901
  //   movq %rax, (%r14)                            ; child.vptr = &vtable
  //   xorps %xmm0, %xmm0
  //   movups %xmm0, 0xc(%r14)                      ; zero  +0x0c..+0x1b   @0xdd90e
  //   movups %xmm0, 0x1c(%r14)                     ; zero  +0x1c..+0x2b   @0xdd913
  //   movups %xmm0, 0x2c(%r14)                     ; zero  +0x2c..+0x3b   @0xdd918
  //   movl $0x0, 0x3c(%r14)                        ; zero  +0x3c..+0x3f   @0xdd91d
  //   movq %r14, 0x198(%rbx)                       ; this.impl = child    @0xdd925
  //   epilogue + retq                                                     @0xdd936
  //   (fall-through: exception-cleanup path @0xdd937 — HGObject::operator
  //    delete on child then HGNode::~HGNode on this then __Unwind_Resume)
  //
  // Semantics: allocate a fresh 0x40-byte child, zero all 11 float
  // params + the +0x3c flags slot, hook it in at this+0x198.

  /** HGDemosaic::HGDemosaic() [C1 complete ctor] — @0xdd8d0. */
  constructor() {
    // @0xdd8dd: HGNode::HGNode()
    HGNode_C2(this);
    // @0xdd8e2..0xdd8e9: this.vptr = HGDemosaic vtable  (opaque — no-op in TS)
    // @0xdd8ec..0xdd8f1: HGObject::operator new(0x40)
    const child: HGDemosaicImplementation = HGObject_operator_new(0x40);
    // @0xdd8fc: HGObject::HGObject() on the fresh child
    HGObject_C2(child);
    // @0xdd901..0xdd908: child.vptr = HGDemosaicImplementation vtable (opaque)
    // @0xdd90e..0xdd91d: zero the 11-float parameter block + flags slot.
    child.param0 = 0;
    child.param1 = 0;
    child.param2 = 0;
    child.param3a = 0;
    child.param3b = 0;
    child.param4 = 0;
    child.param5 = 0;
    child.param6 = 0;
    child.param7 = 0;
    child.param8a = 0;
    child.param8b = 0;
    child.flags = 0;
    // @0xdd925: this.impl = child
    this.impl = child;
  }

  // -------------------------------------------------------------------------
  // ~HGDemosaic() — three overloads (Itanium ABI):
  //   D2 @0xdd970  base dtor    : rebind vptr; if impl: call impl->vt[+0x18];
  //                               tail-jmp HGNode::~HGNode()
  //   D1 @0xdd9b0  complete dtor: same body as D2 (byte-identical, only the
  //                               vptr rebind target changes by 0x40 bytes —
  //                               they land at the SAME base-class vtable
  //                               after RIP-relative resolution).
  //   D0 @0xdd9f0  deleting dtor: same body then tail-jmp HGObject::operator
  //                               delete on this.
  //
  //   D2 skeleton (@0xdd970..0xdd9a5):
  //     pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax
  //     leaq 0x92f513(%rip),%rax                   ; base vtable       @0xdd976
  //     movq %rax,(%rdi)                           ; this.vptr = base  @0xdd97d
  //     movq 0x198(%rdi),%rax                      ; rax = this.impl   @0xdd980
  //     testq %rax,%rax
  //     je 0xdd99b                                 ; if impl==NULL skip
  //     movq (%rax),%rcx                           ; rcx = impl.vptr
  //     movq %rdi,%rbx                             ; save this
  //     movq %rax,%rdi                             ; rdi = impl
  //     callq *0x18(%rcx)                          ; impl->vt[+0x18]() @0xdd995
  //     movq %rbx,%rdi                             ; restore this
  //   0xdd99b:
  //     addq $0x8,%rsp; popq %rbx; popq %rbp
  //     jmp __ZN6HGNodeD2Ev                        ; HGNode::~HGNode() @0xdd9a1

  /** HGDemosaic::~HGDemosaic() [D2 base dtor] — @0xdd970.
   *  Rebinds vptr, releases the child through its vtable slot +0x18,
   *  then tail-jmps HGNode::~HGNode().  Does NOT free `this`. */
  dtor_D2(): void {
    // @0xdd976..0xdd97d: vptr rebind to base vtable (opaque in TS)
    // @0xdd980..0xdd998: release child if non-NULL
    if (this.impl !== null && this.impl !== undefined) {
      HGDemosaicImplementation_vt_18_Release(this.impl); // @0xdd995
    }
    // @0xdd9a1: HGNode::~HGNode() on this
    HGNode_D2(this);
  }

  /** HGDemosaic::~HGDemosaic() [D1 complete dtor] — @0xdd9b0.
   *  Byte-identical body to D2 (both rebind to the SAME base vtable and
   *  perform the SAME release + HGNode::~HGNode sequence).  Does NOT
   *  free `this`. */
  dtor_D1(): void {
    // @0xdd9b6..0xdd9bd: vptr rebind (opaque)
    // @0xdd9c0..0xdd9d8:
    if (this.impl !== null && this.impl !== undefined) {
      HGDemosaicImplementation_vt_18_Release(this.impl); // @0xdd9d5
    }
    // @0xdd9e1: HGNode::~HGNode()
    HGNode_D2(this);
  }

  /** HGDemosaic::~HGDemosaic() [D0 deleting dtor] — @0xdd9f0.
   *  Runs the D2/D1 release sequence, then HGNode::~HGNode, then
   *  tail-jmps HGObject::operator delete on `this` to free the memory.
   *
   *  Disasm skeleton (@0xdd9f0..0xdda27):
   *    pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax
   *    movq %rdi, %rbx                          ; save this
   *    leaq 0x92f490(%rip),%rax                 ; base vtable     @0xdd9f9
   *    movq %rax, (%rdi)                        ; this.vptr = base
   *    movq 0x198(%rdi), %rdi                   ; rdi = this.impl
   *    testq %rdi, %rdi
   *    je   0xdda15
   *    movq (%rdi), %rax                        ; rax = impl.vptr
   *    callq *0x18(%rax)                        ; impl->vt[+0x18]() @0xdda12
   *  0xdda15:
   *    movq %rbx, %rdi                          ; this
   *    callq __ZN6HGNodeD2Ev                    ; HGNode::~HGNode  @0xdda18
   *    movq %rbx, %rdi                          ; this
   *    epilogue
   *    jmp  __ZN8HGObjectdlEPv                  ; ::operator delete @0xdda26
   */
  dtor_D0(): void {
    // @0xdd9f9..0xdda00: vptr rebind (opaque)
    // @0xdda03..0xdda15: release child if non-NULL
    if (this.impl !== null && this.impl !== undefined) {
      HGDemosaicImplementation_vt_18_Release(this.impl); // @0xdda12
    }
    // @0xdda18: HGNode::~HGNode()
    HGNode_D2(this);
    // @0xdda26: HGObject::operator delete(this)
    HGObject_operator_delete(this);
  }

  // -------------------------------------------------------------------------
  // GetOutput @0xddb80
  //   HGNode* GetOutput(HGRenderer* renderer)
  // -------------------------------------------------------------------------
  //
  //   pushq %rbp; movq %rsp,%rbp; pushq %r14; pushq %rbx
  //   movq %rsi, %rbx                          ; rbx = renderer
  //   movq %rdi, %r14                          ; r14 = this
  //   movq %rsi, %rdi                          ; rdi = renderer  \  args for
  //   movq %r14, %rsi                          ; rsi = this       > GetInput
  //   xorl %edx, %edx                          ; edx = 0 (index) /
  //   callq __ZN10HGRenderer8GetInputEP6HGNodei         @0xddb95
  //   testq %rax, %rax
  //   je   0xddbb5                             ; NULL → return 0
  //   movq 0x198(%r14), %rdi                   ; rdi = this.impl
  //   movq %rbx, %rsi                          ; rsi = renderer
  //   movq %rax, %rdx                          ; rdx = input node
  //   popq %rbx; popq %r14; popq %rbp
  //   jmp __ZN24HGDemosaicImplementation13GenerateGraphEP10HGRendererP6HGNode
  //                                                              @0xddbb0
  // 0xddbb5:
  //   xorl %eax, %eax; popq %rbx; popq %r14; popq %rbp; retq
  //
  // Semantics: ask the renderer for our sole input at index 0.  If none,
  // return NULL (this graph node has nothing to produce).  Otherwise,
  // tail-call into the child's demosaic-graph generator with (impl,
  // renderer, input) — the child then wires the actual demosaic passes.

  GetOutput(renderer: HGRenderer): HGNode | null {
    // @0xddb95: HGRenderer::GetInput(renderer, this, 0)
    const input = HGRenderer_GetInput(renderer, this, 0);
    // @0xddb9a..0xddb9d: NULL → return 0.
    if (input === null || input === undefined) {
      return null;
    }
    // @0xddbb0: tail-jmp HGDemosaicImplementation::GenerateGraph(impl, renderer, input)
    return HGDemosaicImplementation_GenerateGraph(this.impl, renderer, input);
  }

  // -------------------------------------------------------------------------
  // SetParameter @0xdda40
  //   int SetParameter(int idx, float p0, float p1, float p2, float p3)
  // -------------------------------------------------------------------------
  //
  //   cmpl $0x8, %esi                          ; idx > 8?
  //   ja   0xddb41                             ; → return -1
  //   pushq %rbp; movq %rsp,%rbp
  //   movq 0x198(%rdi), %rax                   ; rax = this.impl
  //   movl %esi, %ecx                          ; ecx = zero-extended idx
  //   leaq 0xfb(%rip), %rdx                    ; rdx = &jumpTable (0xddb58)
  //   movslq (%rdx,%rcx,4), %rcx               ; rcx = sign-extended disp
  //   addq %rdx, %rcx                          ; rcx = target VA
  //   jmpq *%rcx                               ; computed-goto
  //
  // Each case is a "ucomiss old, new; jne (writeAndReturn1); jnp (returnUnchanged=0)"
  // sequence.  Semantics: return 1 if the write CHANGED the stored value,
  // 0 if new == old (bit-differing NaN treated as "changed" due to jne
  // firing on UNORDERED).  Cases idx=3 and idx=8 store a PACKED (p0, p1)
  // float pair via `insertps $0x10, %xmm1, %xmm0; movlps %xmm0, N(%rax)`.
  //
  // Jump-table (base @0xddb58, 9 × int32) already decoded above:
  //   idx=0 → 0xdda66 (+0xc = param0)
  //   idx=1 → 0xddaea (+0x10 = param1)
  //   idx=2 → 0xdda96 (+0x14 = param2)
  //   idx=3 → 0xddaae (+0x18 = param3a & +0x1c = param3b)
  //   idx=4 → 0xdda7e (+0x20 = param4)
  //   idx=5 → 0xddafe (+0x24 = param5)
  //   idx=6 → 0xddb12 (+0x28 = param6)
  //   idx=7 → 0xddad6 (+0x2c = param7)
  //   idx=8 → 0xddb26 (+0x30 = param8a & +0x34 = param8b)
  //
  // idx > 8 → return -1 (@0xddb41: `movl $0xffffffff, %eax; retq`)

  SetParameter(idx: number, p0: number, p1: number, _p2: number, _p3: number): number {
    // @0xdda40: idx > 8 → -1.
    if ((idx | 0) > 8) return -1;

    // Demote incoming doubles to single-precision to match the x86 float
    // ABI: SetParameter's four `float` args arrive in xmm0..xmm3 as 32-bit
    // singles.  ucomiss / movss / insertps all operate on 32-bit lanes.
    const f0 = Math.fround(p0);
    const f1 = Math.fround(p1);
    const impl = this.impl;

    switch (idx | 0) {
      case 0: {
        // @0xdda66: ucomiss +0xc, xmm0; jne .Wr; jnp .Un
        if (impl.param0 === f0) return 0;
        impl.param0 = f0; // @0xdda72
        return 1;         // @0xdda77
      }
      case 1: {
        // @0xddaea: ucomiss +0x10, xmm0
        if (impl.param1 === f0) return 0;
        impl.param1 = f0; // @0xddaf2
        return 1;
      }
      case 2: {
        // @0xdda96: ucomiss +0x14, xmm0
        if (impl.param2 === f0) return 0;
        impl.param2 = f0; // @0xddaa2
        return 1;
      }
      case 3: {
        // @0xddaae: movsd +0x18, xmm2      ; xmm2.lo = param3a, xmm2.hi = param3b
        //          ucomiss xmm2, xmm0      ; compare param3a vs new p0
        //          jne .Wr; jp .Wr         ; NaN → treat as differ
        //          movshdup xmm2, xmm2     ; xmm2.lo = param3b (bring hi lane down)
        //          ucomiss xmm2, xmm1      ; compare param3b vs new p1
        //          jne .Wr; jnp .Un
        // → any single-lane bit-differ triggers the packed store.
        const changed = impl.param3a !== f0 || impl.param3b !== f1;
        if (!changed) return 0;
        // @0xddac5: insertps $0x10, xmm1, xmm0 → xmm0 = { p0, p1, ?, ? }
        // @0xddacb: movlps  xmm0, +0x18(%rax) → stores TWO packed floats
        impl.param3a = f0;
        impl.param3b = f1;
        return 1;
      }
      case 4: {
        // @0xdda7e: ucomiss +0x20, xmm0
        if (impl.param4 === f0) return 0;
        impl.param4 = f0; // @0xdda8a
        return 1;
      }
      case 5: {
        // @0xddafe: ucomiss +0x24, xmm0
        if (impl.param5 === f0) return 0;
        impl.param5 = f0; // @0xddb06
        return 1;
      }
      case 6: {
        // @0xddb12: ucomiss +0x28, xmm0
        if (impl.param6 === f0) return 0;
        impl.param6 = f0; // @0xddb1a
        return 1;
      }
      case 7: {
        // @0xddad6: ucomiss +0x2c, xmm0
        if (impl.param7 === f0) return 0;
        impl.param7 = f0; // @0xddade
        return 1;
      }
      case 8: {
        // @0xddb26: symmetric to case 3 but on the +0x30/+0x34 pair.
        const changed8 = impl.param8a !== f0 || impl.param8b !== f1;
        if (!changed8) return 0;
        // @0xddb47..0xddb4d: insertps + movlps to +0x30.
        impl.param8a = f0;
        impl.param8b = f1;
        return 1;
      }
      default:
        // Unreachable — the `cmpl $0x8; ja` guard at the top covers this.
        // Keep the branch for TS exhaustiveness.
        return -1;
    }
  }
}
