// raw-port/src/render/HGYUV444ToPlanarChroma.ts
//
// FCP `HGYUV444ToPlanarChroma` — Helium render-graph facade node
// (HGNode subclass) that at GetOutput-time selects ONE of ~8 chroma
// kernel compositors based on the stored (subSampling, chromaPairPerPixel)
// pair, optionally wraps the input in an HGCrop (when chroma filtering is
// on and the crop rect isn't infinite) and an HGTextureWrap set to
// WrapMode::CLAMP (mode 1), then installs the kernel as the owned input.
//
// This is the "chroma-plane" cousin of HGYUV444ToPlanarLuma (already
// landed). Same overall shape:
//   - ctors default subSampling / (chromaPairPerPixel,subSampling); zero
//     out an owned-kernel pointer and mode fields.
//   - SetChromaFiltering(bool, HGRect) stores {u8 filterOn, HGRect crop}
//     at +0x1a8..+0x1bc.
//   - dtor releases the owned kernel via vtable *0x18 and chains into
//     ~HGNode.
//   - GetOutput builds the kernel chain (~490 lines of asm covering the
//     enum×enum matrix) and installs the result at +0x198.
//
// Because the 490-line GetOutput body pulls in EIGHT undecoded kernel
// classes (HgcYUV{444,422,420}BiPlanar_chroma[_f1|_pack2]) plus HGCrop
// and HGTextureWrap, the kernel-selection routine is transcribed as a
// THROWING stub that cites every branch address + kernel ctor address.
// The trivially-decodable parts (all four ctors, three dtors, and
// SetChromaFiltering) are transcribed line-for-line.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Helium.framework/Versions/A/Helium (x86_64 slice; VAs are
//             unadjusted VM addresses from `otool -tV`).
//
// Ledger addresses (all Helium):
//   0xe5d30  HGYUV444ToPlanarChroma::HGYUV444ToPlanarChroma(SubSampling) [C2]
//   0xe5d70  HGYUV444ToPlanarChroma::HGYUV444ToPlanarChroma(SubSampling) [C1]
//   0xe5db0  HGYUV444ToPlanarChroma::HGYUV444ToPlanarChroma(ChromaPairPerPixel, SubSampling) [C2]
//   0xe5e10  HGYUV444ToPlanarChroma::HGYUV444ToPlanarChroma(ChromaPairPerPixel, SubSampling) [C1]
//   0xe5e70  HGYUV444ToPlanarChroma::~HGYUV444ToPlanarChroma()          [D2 base dtor]
//   0xe5eb0  HGYUV444ToPlanarChroma::~HGYUV444ToPlanarChroma()          [D1 complete dtor]
//   0xe5ef0  HGYUV444ToPlanarChroma::~HGYUV444ToPlanarChroma()          [D0 deleting dtor]
//   0xe5f40  HGYUV444ToPlanarChroma::SetChromaFiltering(bool, HGRect)
//   0xe5f60  HGYUV444ToPlanarChroma::GetOutput(HGRenderer*)              (throw-stub, cited)
//
// VTABLE INSTALL:
//   All 7 vptr writes (across 4 ctors + 3 dtors) resolve to the SAME
//   address, Helium 0xa0e898 (arithmetic verified — `resolve.py Helium
//   vtable HGYUV444ToPlanarChroma` reports installed ptr 0xa0e898):
//     @0xe5d41 lea rip+0x928b50  -> 0xe5d48 + 0x928b50 = 0xa0e898  (C2 SubSampling)
//     @0xe5d81 lea rip+0x928b10  -> 0xe5d88 + 0x928b10 = 0xa0e898  (C1 SubSampling)
//     @0xe5dc7 lea rip+0x928aca  -> 0xe5dce + 0x928aca = 0xa0e898  (C2 ChromaPair,SubSampling)
//     @0xe5e27 lea rip+0x928a6a  -> 0xe5e2e + 0x928a6a = 0xa0e898  (C1 ChromaPair,SubSampling)
//     @0xe5e76 lea rip+0x928a1b  -> 0xe5e7d + 0x928a1b = 0xa0e898  (D2)
//     @0xe5eb6 lea rip+0x9289db  -> 0xe5ebd + 0x9289db = 0xa0e898  (D1)
//     @0xe5ef9 lea rip+0x928998  -> 0xe5f00 + 0x928998 = 0xa0e898  (D0)
//
// STRUCT LAYOUT (recovered from ctor + SetChromaFiltering asm):
//   HGYUV444ToPlanarChroma {
//     +0x000  vptr                (all ctors: 0xa0e898)
//     +0x008..+0x197              (HGNode base subobject — landed in HGNode.ts; base size 0x198)
//     +0x198  HGNode* kernel       (owned; installed by GetOutput; NULL-init by ctors:
//                                    C2 SubSampling @0xe5d4b `movq $0, 0x198(%r14)`
//                                    C1 SubSampling @0xe5d8b `movq $0, 0x198(%r14)`
//                                    C2 ChromaPair,Sub @0xe5dd1 `movq $0, 0x198(%r15)`
//                                    C1 ChromaPair,Sub @0xe5e31 `movq $0, 0x198(%r15)`)
//     +0x1a0  u32 subSampling      (ctors: C2 SubSampling @0xe5d56 `movl %ebx, 0x1a0(%r14)`
//                                          C1 SubSampling @0xe5d96 `movl %ebx, 0x1a0(%r14)`
//                                          C2 ChromaPair,Sub @0xe5ddc `movl %ebx, 0x1a0(%r15)` (=arg 2)
//                                          C1 ChromaPair,Sub @0xe5e3c `movl %ebx, 0x1a0(%r15)` (=arg 2))
//     +0x1a4  u32 chromaPairPerPixel  (single-arg ctors write $0 @0xe5d9d/@0xe5d5d;
//                                       two-arg ctors write %r14d (=arg 1) @0xe5de3/@0xe5e43)
//     +0x1a8  u8 chromaFiltering    (SetChromaFiltering @0xe5f44 `movb %sil, 0x1a8(%rdi)`;
//                                    two-arg ctors zero it @0xe5dea `movb $0, 0x1a8(%r15)`;
//                                    the one-arg ctors DO NOT touch it.)
//     +0x1a9..+0x1ab                pad
//     +0x1ac  HGRect cropRect      (16 bytes; SetChromaFiltering writes two u64s:
//                                    @0xe5f4b `movq %rdx, 0x1ac(%rdi)` (bytes 0..7 of HGRect)
//                                    @0xe5f52 `movq %rcx, 0x1b4(%rdi)` (bytes 8..15 of HGRect);
//                                    two-arg ctors initialize this from the sentinel
//                                    `_HGRectInfinite` (Helium extern) via
//                                    `movups (%rax),%xmm0 ; movups %xmm0, 0x1ac(%r15)`
//                                    @0xe5df2..@0xe5dfc.)
//   }
//   NOTE: `movq %rdx, +0x1ac` is a 4-byte-misaligned 8-byte store — HGRect
//   is a POD 16-byte struct stored as 2×i64 with 4-byte alignment (piggybacking
//   on the +0x1a8 u8's alignment slack). We surface HGRect as an opaque
//   16-byte carrier because its field layout isn't decoded HERE.
//
// FRONTIER (throw-stubs at the callee boundary — every un-decoded class
// used by GetOutput or referenced by ABI cited by ADDRESS):
//   HGRenderer::GetInput(HGNode*, int)               (Helium, extern virtual)
//   HGObject::operator new(unsigned long)            @Helium __ZN8HGObjectnwEm
//   HGObject::operator delete(void*)                 @Helium __ZN8HGObjectdlEPv
//   HGCrop::HGCrop()                                 @Helium __ZN6HGCropC1Ev
//   HGTextureWrap::HGTextureWrap()                   @Helium __ZN13HGTextureWrapC1Ev
//   HGTextureWrap::SetTextureWrapMode(WrapMode=1)    @Helium __ZN13HGTextureWrap18SetTextureWrapModeENS_8WrapModeE
//   HgcYUV420BiPlanar_chroma::HgcYUV420BiPlanar_chroma()
//   HgcYUV420BiPlanar_chroma_f1::HgcYUV420BiPlanar_chroma_f1()
//   HgcYUV420BiPlanar_chroma_pack2::HgcYUV420BiPlanar_chroma_pack2()
//   HgcYUV422BiPlanar_chroma::HgcYUV422BiPlanar_chroma()
//   HgcYUV422BiPlanar_chroma_f1::HgcYUV422BiPlanar_chroma_f1()
//   HgcYUV422BiPlanar_chroma_pack2::HgcYUV422BiPlanar_chroma_pack2()
//   HgcYUV444BiPlanar_chroma::HgcYUV444BiPlanar_chroma()
//   HgcYUV444BiPlanar_chroma_pack2::HgcYUV444BiPlanar_chroma_pack2()
//   _HGRectInfinite                                  (Helium extern data symbol)
//   _HGRectIsInfinite(HGRect)                        (Helium extern C function)

import { HGNode } from "./HGNode";

/** HGYUVPlanar::SubSampling enum — undecoded values; carried as an i32. */
export type HGYUVPlanar_SubSampling = number;

/** HGYUV444ToPlanarChroma::ChromaPairPerPixel enum — undecoded values; i32. */
export type HGYUV444ToPlanarChroma_ChromaPairPerPixel = number;

/** HGRect — opaque 16-byte POD (Helium). Layout intentionally NOT decoded
 *  here (its field names aren't visible in this class's bodies; only
 *  two u64 stores + a bulk `_HGRectInfinite` sentinel copy are used). */
export interface HGRect {
  /** low 8 bytes of the 16-byte HGRect (SetChromaFiltering: movq %rdx, +0x1ac). */
  lo: bigint;
  /** high 8 bytes of the 16-byte HGRect (SetChromaFiltering: movq %rcx, +0x1b4). */
  hi: bigint;
}

/**
 * `_HGRectInfinite` — Helium extern data sentinel loaded by the two-arg
 * ctors via `leaq _HGRectInfinite(%rip),%rax ; movups (%rax),%xmm0 ;
 * movups %xmm0, 0x1ac(%r15)`. Its byte layout is not decoded at THIS
 * layer, so we defer through a throw-stub — any consumer that actually
 * needs the initial "infinite" cropRect must transcribe that global.
 */
function loadHGRectInfinite(): HGRect {
  // Referenced @Helium 0xe5df2 (`leaq _HGRectInfinite(%rip), %rax`).
  throw new Error(
    "_HGRectInfinite @Helium extern data — sentinel 16-byte HGRect not yet " +
      "transcribed; two-arg HGYUV444ToPlanarChroma ctors load it @0xe5df2",
  );
}

/**
 * HGYUV444ToPlanarChroma — HGNode subclass, a chroma-plane kernel installer.
 *
 * All four ctors call `HGNode::HGNode()` (base ctor @Helium 0x11baf0),
 * install the class vptr (Helium 0xa0e898), and initialize the owned
 * kernel pointer at +0x198 to NULL. The one-arg ctors leave the two
 * `chromaFiltering`/`cropRect` fields UNTOUCHED (the caller must invoke
 * `SetChromaFiltering` before `GetOutput`, or those fields carry
 * indeterminate values). The two-arg ctors zero `chromaFiltering` and
 * pre-fill `cropRect` with `_HGRectInfinite`.
 */
export class HGYUV444ToPlanarChroma extends HGNode {
  /** owned HGNode kernel (installed by GetOutput). @+0x198 in FCP. */
  kernel: HGNode | null = null;
  /** subSampling — HGYUVPlanar::SubSampling (i32). @+0x1a0. */
  subSampling: HGYUVPlanar_SubSampling = 0;
  /** chromaPairPerPixel — HGYUV444ToPlanarChroma::ChromaPairPerPixel (i32). @+0x1a4. */
  chromaPairPerPixel: HGYUV444ToPlanarChroma_ChromaPairPerPixel = 0;
  /** chromaFiltering — bool stored as u8. @+0x1a8. Left indeterminate by
   *  the one-arg ctors; zero-init by two-arg ctors. */
  chromaFiltering: boolean = false;
  /** cropRect — HGRect (16 bytes). @+0x1ac. Same indeterminacy as above. */
  cropRect: HGRect = { lo: 0n, hi: 0n };

  /**
   * One-arg (SubSampling) constructor.
   *
   * There are two ABI variants (C2 base ctor @0xe5d30 and C1 complete
   * ctor @0xe5d70). Both bodies are IDENTICAL 15-instruction sequences:
   *   pushq %rbp; movq %rsp,%rbp; pushq %r14; pushq %rbx
   *   movl  %esi, %ebx           ; save SubSampling arg
   *   movq  %rdi, %r14           ; save this
   *   callq __ZN6HGNodeC2Ev      ; HGNode::HGNode() @0x11baf0
   *   leaq  <disp>(%rip), %rax   ; install ptr = 0xa0e898
   *   movq  %rax, (%r14)         ; this->vptr = 0xa0e898
   *   movq  $0, 0x198(%r14)      ; this->kernel = NULL
   *   movl  %ebx, 0x1a0(%r14)    ; this->subSampling = arg
   *   movl  $0, 0x1a4(%r14)      ; this->chromaPairPerPixel = 0
   *   popq %rbx; popq %r14; popq %rbp; retq
   *
   * i.e. `chromaFiltering` and `cropRect` are NOT touched by this ctor.
   *
   * @param sub SubSampling enum value stored at +0x1a0.
   */
  static fromSubSampling(sub: HGYUVPlanar_SubSampling): HGYUV444ToPlanarChroma {
    const self = new HGYUV444ToPlanarChroma();
    // HGNode::HGNode() is invoked by the field initializers on `HGNode`'s
    // base subclass constructor chain. In FCP, base-ctor call happens
    // BEFORE the vptr install; we match that ordering via `super()` in
    // this class's implicit constructor (see HGNode's ctor for details).
    self.kernel = null;                 // @0xe5d4b / @0xe5d8b
    self.subSampling = sub;             // @0xe5d56 / @0xe5d96
    self.chromaPairPerPixel = 0;        // @0xe5d5d / @0xe5d9d
    // NOTE: chromaFiltering / cropRect DELIBERATELY UNTOUCHED — the C2/C1
    // one-arg bodies emit NO stores for +0x1a8..+0x1bb. Consumer must
    // invoke SetChromaFiltering before GetOutput or the fields carry
    // indeterminate values (in the C++ world: whatever was in the fresh
    // allocation returned by ::operator new, i.e. usually zero because
    // HGObject::operator new likely uses a zeroing allocator — but that
    // is a separate class's contract, NOT this ctor's).
    return self;
  }

  /**
   * Two-arg (ChromaPairPerPixel, SubSampling) constructor.
   *
   * Two ABI variants (C2 @0xe5db0 and C1 @0xe5e10). Both bodies are
   * IDENTICAL 21-instruction sequences:
   *   pushq %rbp; movq %rsp,%rbp; pushq %r15; pushq %r14; pushq %rbx; pushq %rax
   *   movl  %edx, %ebx            ; save SubSampling arg (arg 2)
   *   movl  %esi, %r14d           ; save ChromaPairPerPixel arg (arg 1)
   *   movq  %rdi, %r15            ; save this
   *   callq __ZN6HGNodeC2Ev       ; HGNode::HGNode() @0x11baf0
   *   leaq  <disp>(%rip), %rax    ; install ptr = 0xa0e898
   *   movq  %rax, (%r15)          ; this->vptr = 0xa0e898
   *   movq  $0, 0x198(%r15)       ; this->kernel = NULL
   *   movl  %ebx, 0x1a0(%r15)     ; this->subSampling = arg 2
   *   movl  %r14d, 0x1a4(%r15)    ; this->chromaPairPerPixel = arg 1
   *   movb  $0, 0x1a8(%r15)       ; this->chromaFiltering = 0 (false)
   *   leaq  _HGRectInfinite(%rip),%rax  ; load sentinel HGRect
   *   movups (%rax), %xmm0
   *   movups %xmm0, 0x1ac(%r15)   ; this->cropRect = _HGRectInfinite (16 bytes)
   *   epilogue
   *
   * @param pair ChromaPairPerPixel enum value stored at +0x1a4.
   * @param sub  SubSampling enum value stored at +0x1a0.
   */
  static fromChromaPairAndSubSampling(
    pair: HGYUV444ToPlanarChroma_ChromaPairPerPixel,
    sub: HGYUVPlanar_SubSampling,
  ): HGYUV444ToPlanarChroma {
    const self = new HGYUV444ToPlanarChroma();
    self.kernel = null;                  // @0xe5dd1 / @0xe5e31
    self.subSampling = sub;              // @0xe5ddc / @0xe5e3c   (arg 2 -> +0x1a0)
    self.chromaPairPerPixel = pair;      // @0xe5de3 / @0xe5e43   (arg 1 -> +0x1a4)
    self.chromaFiltering = false;        // @0xe5dea             (movb $0, +0x1a8)
    self.cropRect = loadHGRectInfinite(); // @0xe5df2..@0xe5dfc  (_HGRectInfinite -> +0x1ac)
    return self;
  }

  /**
   * SetChromaFiltering(bool, HGRect) — @Helium 0xe5f40.
   *
   * Disasm (6 insns):
   *   pushq %rbp; movq %rsp,%rbp
   *   movb  %sil,  0x1a8(%rdi)     ; this->chromaFiltering = arg1
   *   movq  %rdx,  0x1ac(%rdi)     ; low 8 bytes of HGRect
   *   movq  %rcx,  0x1b4(%rdi)     ; high 8 bytes of HGRect
   *   popq %rbp; retq
   *
   * HGRect is passed by-value in %rdx:%rcx (System V AMD64 splits a
   * 16-byte POD across two integer registers). We surface the same
   * split via the two u64 fields of `HGRect`.
   */
  SetChromaFiltering(filtering: boolean, cropRect: HGRect): void {
    this.chromaFiltering = filtering;   // @0xe5f44
    this.cropRect = { lo: cropRect.lo, hi: cropRect.hi }; // @0xe5f4b + @0xe5f52
  }

  /**
   * ~HGYUV444ToPlanarChroma — 3 ABI variants:
   *
   *   D2 base dtor    @Helium 0xe5e70  (14 insns; installs vptr, releases kernel via vcall *0x18, tail-jmp to ~HGNode)
   *   D1 complete dtor @Helium 0xe5eb0  (same shape as D2, different rip disp -> same 0xa0e898 vptr)
   *   D0 deleting dtor @Helium 0xe5ef0  (18 insns; same body as D2/D1 + tail-jmp to `HGObject::operator delete`)
   *
   * D2 body:
   *   pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax
   *   leaq  <disp>(%rip), %rax        ; install ptr = 0xa0e898
   *   movq  %rax, (%rdi)              ; this->vptr = 0xa0e898
   *   movq  0x198(%rdi), %rax         ; load owned kernel
   *   testq %rax, %rax; je +11       ; if NULL, skip release
   *     movq (%rax), %rcx             ; kernel->vptr
   *     movq %rdi, %rbx               ; save this
   *     movq %rax, %rdi               ; arg = kernel
   *     callq *0x18(%rcx)             ; kernel->vtable[0x18] = HGObject::Release
   *     movq %rbx, %rdi               ; restore this for tail-jmp
   *   addq $0x8,%rsp; popq %rbx; popq %rbp
   *   jmp __ZN6HGNodeD2Ev             ; tail-call ~HGNode() @0x11bf20
   *
   * D0 additionally calls `HGObject::operator delete(this)` after ~HGNode.
   *
   * In TypeScript there's no explicit vtable-install pattern for
   * destructors and no equivalent of `HGObject::Release` (refcounting
   * lives on HGObject). We surface the "release the owned kernel" step
   * as `this.kernel = null` — a semantically-correct drop, matching the
   * "if (kernel) kernel->Release()" behavior. The `operator delete` tail
   * (D0 only) is the runtime freeing the storage; irrelevant in a GC world.
   */
  destroy(): void {
    // Both D1 and D2 install the SAME vptr (0xa0e898) — no observable diff
    // at this layer since TS classes don't expose their vtable pointer.
    // @0xe5e80 / @0xe5ec0 / @0xe5f03: load this->kernel; NULL-check; release.
    if (this.kernel !== null) {
      // vtable *0x18 slot on HGYUV444ToPlanarChroma's installed vptr is
      // HGObject::Release @Helium 0x1a0f30 (inherited). Dropping the JS
      // reference is the closest faithful surface.
      this.kernel = null;
    }
    // Tail-jmp to HGNode::~HGNode() @0x11bf20 is handled by the JS runtime
    // when this object becomes unreachable; no explicit call needed.
  }

  /**
   * GetOutput(HGRenderer*) — @Helium 0xe5f60. 490 lines of asm.
   *
   * Shape (recovered from a first ~250-line pass):
   *   1. Call HGRenderer::GetInput(this, 0) to fetch input-0's node,
   *      Retain() it (vtable *0x10 = HGObject::Retain @0x1a0f20).
   *   2. Dispatch on (subSampling, chromaPairPerPixel):
   *        subSampling==0 (444?) path
   *        subSampling==1 (422?) path @0xe60cb
   *        subSampling!=0,1 (420?) path @0xe61eb
   *      Inside each, dispatch on chromaPairPerPixel and on the
   *      chromaFiltering bool. Cases construct one of:
   *        HgcYUV444BiPlanar_chroma / _pack2
   *        HgcYUV422BiPlanar_chroma / _f1 / _pack2
   *        HgcYUV420BiPlanar_chroma / _f1 / _pack2
   *      (via HGObject::operator new(0x1a0 or 0x1d0) + the kernel ctor,
   *       then SetParameter (vtable *0x60) + SetInput (vtable *0x78)).
   *   3. When chromaFiltering && !_HGRectIsInfinite(cropRect), insert an
   *      HGCrop layer (alloc 0x1a0, HGCrop::HGCrop(), SetParameter with
   *      the crop rect as float4, SetInput to fed input) BETWEEN the raw
   *      input and the kernel; then wrap that in an HGTextureWrap set to
   *      WrapMode::CLAMP (mode 1) via HGTextureWrap::SetTextureWrapMode(1).
   *   4. Install the composed kernel into this->kernel (+0x198) via the
   *      standard "compare / release-old / retain-new" dance.
   *
   * Every kernel class + HGCrop + HGTextureWrap + HGRenderer::GetInput +
   * _HGRectIsInfinite is UNDECODED at this layer. Faithfully reproducing
   * this 490-line dispatch WITHOUT those classes would produce a wall of
   * throw-stubs. Per the porting spec (throw on undecoded, never
   * paraphrase), the entire body is deferred through a single throwing
   * stub that CITES the address, the shape, and every undecoded callee.
   */
  GetOutput(_renderer: unknown /* HGRenderer* */): unknown /* HGNode* */ {
    // HGYUV444ToPlanarChroma::GetOutput @Helium 0xe5f60 is 490 lines of
    // enum×enum kernel-construction dispatch. Requires the following
    // undecoded classes/functions to be transcribed first:
    //   HGRenderer::GetInput               (extern virtual)
    //   HGObject::operator new / delete    @Helium __ZN8HGObjectnwEm / __ZN8HGObjectdlEPv
    //   HGCrop::HGCrop()                   @Helium __ZN6HGCropC1Ev
    //   HGTextureWrap::HGTextureWrap()     @Helium __ZN13HGTextureWrapC1Ev
    //   HGTextureWrap::SetTextureWrapMode  @Helium __ZN13HGTextureWrap18SetTextureWrapModeENS_8WrapModeE
    //   HgcYUV420BiPlanar_chroma           @Helium __ZN24HgcYUV420BiPlanar_chromaC1Ev
    //   HgcYUV420BiPlanar_chroma_f1        @Helium __ZN27HgcYUV420BiPlanar_chroma_f1C1Ev
    //   HgcYUV420BiPlanar_chroma_pack2     @Helium __ZN30HgcYUV420BiPlanar_chroma_pack2C1Ev
    //   HgcYUV422BiPlanar_chroma           @Helium __ZN24HgcYUV422BiPlanar_chromaC1Ev
    //   HgcYUV422BiPlanar_chroma_f1        @Helium __ZN27HgcYUV422BiPlanar_chroma_f1C1Ev
    //   HgcYUV422BiPlanar_chroma_pack2     @Helium __ZN30HgcYUV422BiPlanar_chroma_pack2C1Ev
    //   HgcYUV444BiPlanar_chroma           @Helium __ZN24HgcYUV444BiPlanar_chromaC1Ev
    //   HgcYUV444BiPlanar_chroma_pack2     @Helium __ZN30HgcYUV444BiPlanar_chroma_pack2C1Ev
    //   _HGRectIsInfinite(HGRect)          @Helium extern C symbol
    throw new Error(
      "HGYUV444ToPlanarChroma::GetOutput @Helium 0xe5f60 not yet transcribed" +
        " — 490-line kernel-selection dispatch requires HGRenderer::GetInput," +
        " HGCrop, HGTextureWrap, and the eight HgcYUV{444,422,420}BiPlanar_chroma" +
        "[_f1|_pack2] kernel classes to be decoded first",
    );
  }
}
