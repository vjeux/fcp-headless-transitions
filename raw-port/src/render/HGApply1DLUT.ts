/**
 * HGApply1DLUT (Helium framework) — 1-D lookup-table applicator, sibling of HGApply3DLUT.
 *
 * A 1-D LUT filter used by the color/grade pipeline. This class owns an internal HGBitmap
 * (a 1×N or width-tiled Wx1 texture) whose texels are the LUT samples generated either by a
 * user-supplied callback (SetLUT), raw pixel data (SetLUTData), or an externally-provided
 * HGBitmap (SetLUTBitmap). The GetOutput pass wires the input node through the LUT.
 *
 * All method bodies interact with HGNode/HGBitmap/HGMemory/HGFormatUtils runtime services
 * absent from raw-port — so every non-trivial method is a deferred stub citing @Helium 0x240e0
 * (and its siblings). The pieces that ARE decoded here are the DATA
 * pieces the header commits to (struct layout + constants) that no downstream can invent.
 *
 * Struct layout (recovered from HGApply1DLUT::Init @0x240e0 and HGApply1DLUT::HGApply1DLUT @0x24470
 * plus SetLUT/SetLUTBitmap/SetLUTData/CreateBitmap/GetOutput as cross-references):
 *   +0x000  HGNode base subobject                — constructed by HGNode::HGNode() @0x24481
 *   +0x198  HGNode*   inputChild                 — set/cleared @0x24149..24183, 0x24226 in Init
 *   +0x1a0  HGBitmap* lutBitmap                  — the storage texture (SetLUTBitmap @0x24e42)
 *   +0x1a8  HGRect    rect                       — 16 bytes {xy,wh} stored as two u64 halves
 *                                                 (Init: HGRectMake4i(0,0,size+1,1)); if wide
 *                                                 (>=0x801) it re-tiles as (0,0,0x800,size/2K)
 *   +0x1b8  bool      dirty                      — Init@0x2410e / SetLUT@0x24879 / SetLUTData@0x24d2e
 *                                                 / SetLUTBitmap@0x24e2f / cleared GetOutput@0x24eb5
 *   +0x1bc  int32_t   size                       — LUT sample count (edx from Init arg)
 *   +0x1c0  float     minInput                   — SetLUT range start (Init stores at +0x1c0)
 *   +0x1c4  float     maxInput                   — SetLUT range end   (Init stores at +0x1c4)
 *   +0x1c8  uint8_t   channelR                   — R enable (packusdw/packuswb pack of 4 bools)
 *   +0x1c9  uint8_t   channelG
 *   +0x1ca  uint8_t   channelB
 *   +0x1cb  uint8_t   channelA
 *   +0x1cc  bool      clampToEdgeExtra           — enables textureWrap set in GetOutput @0x24ee8
 *   +0x1cd  bool      floatFormat                — 0 = half-float packed path, 1 = raw float path
 *
 * The Init wrapper is called from the ctor (HGApply1DLUT(size)) with (size, 0.0f, 1.0f, 1,1,1,1,1,0)
 * so the default state is: range=[0,1], all channels enabled, clampToEdgeExtra=on, half-float
 * output format. min/max f32 loads:
 *   @0x244a9 movss 0x3a380f(%rip),%xmm0  -> RIP=0x244b1  target=0x3c7cc0 = 1.0f (max default)
 *   @0x244b1 xorps %xmm1,%xmm1                                           = 0.0f (min default)
 */

// DECODE reference:
//   raw-port/re/disasm/Helium.HGApply1DLUT.HGApply1DLUT.s   (@Helium 0x24470)
//   raw-port/re/disasm/Helium.HGApply1DLUT.Init.s           (@Helium 0x240e0)
//   raw-port/re/disasm/Helium.HGApply1DLUT.SetLUT.s         (@Helium 0x24820)
//   raw-port/re/disasm/Helium.HGApply1DLUT.SetLUTData.s     (@Helium 0x24d00)
//   raw-port/re/disasm/Helium.HGApply1DLUT.SetLUTBitmap.s   (@Helium 0x24de0)
//   raw-port/re/disasm/Helium.HGApply1DLUT.CreateBitmap.s   (@Helium 0x24730)
//   raw-port/re/disasm/Helium.HGApply1DLUT.GetOutput.s      (@Helium 0x24e60)
// Constants below are RIP-relative reads resolved against /tmp/Helium.x86_64 (thin x86_64 slice,
// VA == file offset for __const at 0x3c7b80..; verified with raw-port/army/tools/resolve.py).
//
// Default constants from the ctor / SetLUT constant pool:
//   @const 0x3c7cc0 (f32) =  1.0f                    ; ctor: movss @0x244a9 (default maxInput)
//   @const 0x3caaf0 (f32×4) = -65536.0f              ; SetLUT half-float pack lo clamp @0x2494f (maxps xmm0)
//   @const 0x3cab00 (f32×4) = +65536.0f              ; SetLUT half-float pack hi clamp @0x24959 (minps xmm1)
//   @const 0x3cab10 (u32×4) =  0x07800000            ; SetLUT F32->F16 exponent-rebias scale (mulps @0x24963)
//   @const 0x3cab1f (u32×4) =  0x007fff00 / 0x00800000 alternating — pack high/low nibble masks @0x24981..0x2498f
// Half-float clamp/scale: this is the classic "no-overflow F32→F16" trick — first clamp to
// ±65536 (F16-max magnitude), then multiply by 2^(-112) (exponent-bias adjust), then repack
// the top nibble via psrld+pand+pblendw. See Init@0x241d5 (rect layout) and SetLUT@0x24949..0x249a4
// for the scalar-lane version of the same pack.
const K_ONE_F32_MAX_INPUT: number = 1.0;               // @Helium 0x3c7cc0
const K_F16_CLAMP_LO:      number = -65536.0;          // @Helium 0x3caaf0
const K_F16_CLAMP_HI:      number =  65536.0;          // @Helium 0x3cab00
const K_F16_EXP_REBIAS_U32: number = 0x07800000;       // @Helium 0x3cab10 (interpreted as f32 in mulps)

/** HGFormat enum values referenced by this class (SetLUTData branch @0x24d54: (fmt-0x1b) <= 1). */
export enum HGApply1DLUT_KnownFormat {
  /** kV4H (half-float 4-channel). SetLUTData accepts this. */
  kV4H = 0x1b,
  /** kV4F (float32   4-channel). SetLUTData accepts this. */
  kV4F = 0x1c,
}

/**
 * Struct fields of HGApply1DLUT beyond the HGNode base (base occupies 0x00..0x198 as verified by
 * HGNode::HGNode() @0x24481 followed by leaq vtable @0x24486, then xorps@0x24490 zeros +0x198..+0x1a7).
 */
export interface HGApply1DLUTLayout {
  /** +0x198 HGNode*   inputChild.  */                 inputChild: unknown | null;
  /** +0x1a0 HGBitmap* lutBitmap.   */                 lutBitmap:  unknown | null;
  /** +0x1a8 HGRect    rect (16 B). */                 rect:       { x: number; y: number; w: number; h: number };
  /** +0x1b8 bool      dirty.       */                 dirty:      boolean;
  /** +0x1bc int32_t   size.        */                 size:       number;
  /** +0x1c0 float     minInput.    */                 minInput:   number;
  /** +0x1c4 float     maxInput.    */                 maxInput:   number;
  /** +0x1c8 uint8_t   channelR.    */                 channelR:   boolean;
  /** +0x1c9 uint8_t   channelG.    */                 channelG:   boolean;
  /** +0x1ca uint8_t   channelB.    */                 channelB:   boolean;
  /** +0x1cb uint8_t   channelA.    */                 channelA:   boolean;
  /** +0x1cc bool      clampToEdgeExtra. */             clampToEdgeExtra: boolean;
  /** +0x1cd bool      floatFormat.      */             floatFormat:      boolean;
}

/**
 * HGApply1DLUT — Helium 1D-LUT node.
 *
 * NOTE: method bodies below are deferred stubs; each cites its source @Helium 0x…
 * so the ledger can see the gap (per raw-port PORTING_SPEC §3).
 * The struct-layout + constants above are the decoded-and-committed portion of this port.
 */
export class HGApply1DLUT implements HGApply1DLUTLayout {
  inputChild: unknown | null = null;                   // +0x198
  lutBitmap:  unknown | null = null;                   // +0x1a0
  rect: { x: number; y: number; w: number; h: number } // +0x1a8
       = { x: 0, y: 0, w: 0, h: 0 };
  dirty:      boolean = false;                         // +0x1b8
  size:       number  = 0;                             // +0x1bc
  minInput:   number  = 0;                             // +0x1c0
  maxInput:   number  = 0;                             // +0x1c4
  channelR:   boolean = false;                         // +0x1c8
  channelG:   boolean = false;                         // +0x1c9
  channelB:   boolean = false;                         // +0x1ca
  channelA:   boolean = false;                         // +0x1cb
  clampToEdgeExtra: boolean = false;                   // +0x1cc
  floatFormat:      boolean = false;                   // +0x1cd

  /**
   * HGApply1DLUT::HGApply1DLUT(unsigned int size) @Helium 0x24470
   *
   * Ctor. Runs HGNode::HGNode(), installs the class vtable at 0x9e03eb+rip (@0x24486),
   * zeroes +0x198..+0x1a7 (inputChild/lutBitmap), then delegates to
   *   Init(size, minInput=0.0f, maxInput=1.0f, 1, 1, 1, 1, 1, floatFormat=0)
   * The min=xorps→0.0f is at @0x244b1; max=movss 1.0f (@const 0x3c7cc0) is at @0x244a9.
   */
  constructor(_size: number) {
    // Full ctor body not yet transcribed — invokes HGNode base ctor + vtable install + Init.
    throw new Error("HGApply1DLUT::HGApply1DLUT(unsigned int) @Helium 0x24470 not yet transcribed");
  }

  /**
   * HGApply1DLUT::Init(unsigned int size, float minInput, float maxInput,
   *                    bool r, bool g, bool b, bool a, bool clampToEdgeExtra, bool floatFormat)
   * @Helium 0x240e0
   *
   * Stores (min,max,size, packed channel bools at +0x1c8, clampToEdge at +0x1cc, floatFormat at
   * +0x1cd, dirty=1 at +0x1b8), releases any existing lutBitmap and inputChild via vtable*0x18,
   * builds a new HGRect via HGRectMake4i(0,0,size+1,1) — retiled to (0,0,0x800, ceil(size/0x800))
   * if size+1 >= 0x801 — allocates a fresh 0x1f0-byte input HGNode (new HGNode + SetFlags(1,4) +
   * clears bit 0x600 and sets 0x400 in +0x10), stores the rect into the input node's +0x1d0
   * (movaps), then makes two vtable-*0x60 calls on that node with (size-1)*(max-min)/size (double-
   * precision, negated: xorps against sign-bit-const at rip+0x3a688a @0x2424f) and (size-1)f
   * respectively. Body not yet transcribed — depends on HGNode/HGRect/HGObject runtime.
   */
  Init(
    _size: number,
    _minInput: number,
    _maxInput: number,
    _r: boolean, _g: boolean, _b: boolean, _a: boolean,
    _clampToEdgeExtra: boolean,
    _floatFormat: boolean,
  ): void {
    throw new Error("HGApply1DLUT::Init @Helium 0x240e0 not yet transcribed");
  }

  /**
   * HGApply1DLUT::CreateBitmap() @Helium 0x24730
   *
   * Releases any existing lutBitmap (*vtbl 0x18), computes HGFormat = 0x1c - floatFormat
   *   -> if floatFormat=1 (raw float): 0x1b (kV4H)?  actually 0x1c-1=0x1b so kV4H;
   *   -> if floatFormat=0 (half-float): 0x1c (kV4F).  Wait — the mapping is inverted; the
   *      floatFormat=0 branch actually produces the half-float pack path in SetLUT
   *      (see 0x248cf jne 0x249c6). Need to reconcile at transcription time.
   * Then bytesPerPixel(fmt) * (rect.w-rect.x) * (rect.h-rect.y) bytes are allocated as an
   * HGMemory::StorageObject (new @0x24795) and wrapped in an HGBitmap(rect, fmt, storagePtr)
   * (new @0x247ad). SetStorage attaches storage, and finally the storage's vtbl*0x18 releases
   * its temporary handle before returning. Body not yet transcribed — depends on HGBitmap/HGMemory.
   */
  CreateBitmap(): void {
    throw new Error("HGApply1DLUT::CreateBitmap @Helium 0x24730 not yet transcribed");
  }

  /**
   * HGApply1DLUT::SetLUT(int (*fn)(void*, float, float*R, float*G, float*B, float*A),
   *                     void* userdata) @Helium 0x24820
   *
   * Regenerates the internal LUT texture by sampling `fn` at N = this.size evenly-spaced points
   * f_i = minInput + i * (maxInput-minInput)/size, i in [0,size). Four format×callback branches:
   *
   *   floatFormat=1 (path @0x249c6..) + fn != NULL     : write raw 4×f32 per texel
   *   floatFormat=1 (path @0x24b62..) + fn == NULL     : identity — write f_i on all 4 channels
   *   floatFormat=0 (path @0x248da..) + fn != NULL     : F32→F16 pack via SSE
   *      clamp lanes to [−65536, +65536] (@const 0x3caaf0 / 0x3cab00), multiply by 2^-112
   *      (@const 0x3cab10 = 0x07800000 as f32), then blend the high nibble of each lane with
   *      pblendw+pand+por into a packed 16-bit-per-channel qword written to the bitmap.
   *   floatFormat=0 (path @0x24a5c..) + fn == NULL     : identity, half-float pack the ramp
   *      (the SIMD-4-lane loop @0x24ae0..0x24b4c is the same F32→F16 pack in packed form).
   *
   * On entry: sets dirty=+0x1b8=1, calls CreateBitmap if lutBitmap==NULL, then computes
   *   ramp step  = (maxInput - minInput) / (size + 1.0f)   at @0x24854..0x24867 (float division
   *   after cvtsi2ss+addss@0x24854..24864 of size+1.0f from const @0x3a58a9+RIP=?).
   *   Note: verify the +1.0f — it may be the F16-scale-adjust off-by-one, need line-by-line pass.
   *
   * Body not yet transcribed — half-float SSE pack + callback dispatch depends on a runtime
   * function-pointer model we don't have.
   */
  SetLUT(
    _fn: ((userdata: unknown, x: number, outR: {v:number}, outG: {v:number}, outB: {v:number}, outA: {v:number}) => number) | null,
    _userdata: unknown | null,
  ): number {
    throw new Error("HGApply1DLUT::SetLUT @Helium 0x24820 not yet transcribed");
  }

  /**
   * HGApply1DLUT::SetLUTData(void* data, int count, HGFormat fmt) @Helium 0x24d00
   *
   * Bulk-load LUT samples from raw memory. Validates `count == this.size` (else warns
   * "Invalid LUT data size." @0x24db2), validates fmt ∈ {kV4H (0x1b), kV4F (0x1c)} (else warns
   * "Invalid LUT format (must be kV4H or kV4F)." @0x24dbb via HGLogger::warning @0x24dc4).
   *
   * Sets dirty=1, ensures lutBitmap exists (CreateBitmap if NULL), then computes
   *   bpp   = HGFormatUtils::bytesPerPixel(fmt) @0x24d4b
   *   bytes = bpp * count
   * and memcpy's `data` into the bitmap's storage pointer at +0x50 of lutBitmap->storage.
   * If the bitmap's rect width > count (tiled wide layout — Init's fallback branch), it does a
   * second memcpy for the row-2 tail (@0x24d97). Returns 0 on success, -1 on validation failure.
   */
  SetLUTData(_data: ArrayBuffer, _count: number, _fmt: number): number {
    throw new Error("HGApply1DLUT::SetLUTData @Helium 0x24d00 not yet transcribed");
  }

  /**
   * HGApply1DLUT::SetLUTBitmap(HGBitmap* bmp) @Helium 0x24de0
   *
   * Adopts an externally-provided HGBitmap as the LUT texture. Guards:
   *   - bmp != NULL                                                                 (else return -1)
   *   - HGRect::IsEqual(bmp->rect@+0x14, this->rect)                                (else return -1)
   *   - (bmp->format@+0x10 - 0x1b) <= 1  (i.e. kV4H or kV4F)                        (else return -1)
   *   - bmp != current lutBitmap                                                     (else return  0)
   * On accept: set dirty=1, release old lutBitmap via vtable*0x18, store `bmp`, and call
   * bmp->vtable*0x10 (SetStorage-adjacent retain). Returns 0 on accept-and-changed, -1 on reject.
   */
  SetLUTBitmap(_bmp: unknown | null): number {
    throw new Error("HGApply1DLUT::SetLUTBitmap @Helium 0x24de0 not yet transcribed");
  }

  /**
   * HGApply1DLUT::GetOutput(HGRenderer*) @Helium 0x24e60
   *
   * Render pass:
   *   1. If lutBitmap==NULL, self-heal by calling SetLUT(NULL, NULL) (identity)         @0x24e7a
   *   2. Fetch the current input via HGRenderer::GetInput(inputChild, 0)                @0x24e95
   *   3. Wire it as input #0 on the internal HGNode (vtable*0x78 with idx=0)            @0x24ea5
   *   4. If dirty: allocate an HGBitmapLoader over lutBitmap                            @0x24ec1
   *      Also, if !renderer->supportsClampAll (vtable*0x130) AND clampToEdgeExtra:
   *         allocate an HGTextureWrap, SetTextureWrapMode(kClampToEdge=2)               @0x24ef1
   *         wire the wrap-node as input #0 with the loader as its input                 @0x24f1e
   *      Clear dirty=0                                                                  @0x24eb5
   *   5. Set the internal node's input #1 to the loader (or wrap-node) via vtable*0x78  @0x24f41
   *   6. Return the internal HGNode (inputChild @+0x198).                                @0x24f4d
   */
  GetOutput(_renderer: unknown): unknown {
    throw new Error("HGApply1DLUT::GetOutput @Helium 0x24e60 not yet transcribed");
  }
}
