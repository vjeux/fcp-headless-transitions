// HGColorConformLUTInfo.ts — FCP Helium HGColorConformLUTInfo, an
// HGLUTCache::LUTInfo subclass that pairs an N-D lookup table's raw byte
// payload (either owned as a std::vector<uint8_t> or referenced through
// an HGColorConformLUTData ref-count handle) with the polymorphic
// HGApplyNDLUTInfo header (numBins, numDims, rangeScale, rangeOffset,
// storage-format tag).
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
// DECODE: raw-port/re/disasm/Helium.HGColorConformLUTInfo.*.s (captured
// via disasm.sh) + otool -tV dump around 0x1d21d0-0x1d2a10.
//
// Method map (Helium x86_64 VAs):
//   @0x1d21d0  C2  — HGColorConformLUTInfo(u64, u64, vector<u8>, f32, f32, LUTStorageFormat)
//                    (no LUTData ref; the +0x28 handle field is zeroed).
//   @0x1d2340  D1  — ~HGColorConformLUTInfo (base dtor, no operator delete).
//   @0x1d2390  D0  — ~HGColorConformLUTInfo (deleting dtor: base body + `jmp __ZdlPv`).
//   @0x1d23e0  duplicate() const — allocate a new 0x50-byte instance, chain
//                    to C2@0x1d2a10 with the CURRENT payload/params.
//   @0x1d2570  isEqual(HGLUTCache::LUTInfo* other) const — dynamic_cast +
//                    structural equality: numDims, numBins, storage, and
//                    the raw vector<u8> byte body (memcmp of sizes+bytes).
//   @0x1d2640  colorAtIndex(f32 R, f32 G, f32 B, f32* oR, f32* oG, f32* oB, f32* oA) const
//                    — 1-D and 3-D sampled-LUT lookup for HGFormat 0x13 (rgba_u16),
//                    HGFormat 0x19 (rgba_u16), and the FLOAT fallback (all other formats).
//                    Falls THROUGH to `HGApplyNDLUTInfo::colorAtIndex(...)`
//                    (tail-jmp) for the "no LUT payload" / no-op path.
//   @0x1d2a10  C2  — HGColorConformLUTInfo(HGRef<HGColorConformLUTData>,
//                    u64, u64, vector<u8>, f32, f32, LUTStorageFormat).
//                    Identical body to the no-Ref ctor except +0x28 is
//                    initialized from the HGRef pointer (with a vtable
//                    slot-2 retain call). This is the CANONICAL ctor
//                    that `duplicate()` chains to.
//
// Vtable @Helium 0xa2a028 (installed-ptr recovered via vtable.py):
//   *0x00 -> 0x1d2340  ~HGColorConformLUTInfo (D1)
//   *0x08 -> 0x1d2390  ~HGColorConformLUTInfo (D0)
//   *0x10 -> 0x1d23e0  duplicate() const
//   *0x18 -> 0x1d2570  isEqual(HGLUTCache::LUTInfo*) const
//   *0x20 -> 0x1d2640  colorAtIndex(...)
//
// STRUCT LAYOUT (recovered from C2 stores + duplicate `movl $0x50,%edi;
// __Znwm` sizing @0x1d23f4):
//   +0x00  void*  vtable          (installed = 0xa2a028)
//   +0x08 .. +0x27  inherited HGApplyNDLUTInfo state — see
//         raw-port/src/render/HGApplyNDLUTInfo.ts:
//           +0x08  u64  numBins
//           +0x10  u64  numDims          (clamped {1,2,3} by parent ctor)
//           +0x18  f32  rangeScale
//           +0x1c  f32  rangeOffset
//           +0x20  i32  storage (LUTStorageFormat)
//   +0x28  HGColorConformLUTData*  lutDataRef  (nullable; retained via
//         vtable-slot-2 call @0x1d2a4e/@0x1d2411; released via
//         vtable-slot-3 call in dtors @0x1d2371/@0x1d23c1)
//   +0x30  bool  vectorIsAllZeros  (set to 1 initially @0x1d21fe/@0x1d2a51;
//         updated by the "tail scan" body @0x1d2274-@0x1d229f and by the
//         SIMD scan @0x1d22be-@0x1d2300 to reflect whether the entire
//         raw byte payload copied in from arg#3 is zero. Purpose: fast
//         "no-op LUT" short-circuit — see the `cmpb $0,0x30(%rbx)` guards
//         in isEqual @0x1d25ae/@0x1d25b4.)
//   +0x38  u8*  vec_begin         (heap ptr, malloc'd via `__Znwm`)
//   +0x40  u8*  vec_end
//   +0x48  u8*  vec_cap           (== vec_begin + capacity)
//   sizeof(HGColorConformLUTInfo) = 0x50 bytes (from __Znwm(0x50) @0x1d23f4).
//
// The +0x38..+0x48 triple is a libc++ `std::__1::vector<unsigned char>`
// (begin/end/end_cap in-line, no allocator state).
//
// COLOR-AT-INDEX MATH (colorAtIndex @0x1d2640):
//   For the 1-D path (numDims==1) — used by 1-D transfer LUTs — the
//   green input is ignored (this class extracts only the R channel):
//     r  = (R - GetRangeOffset()) / GetRangeScale()
//     r  = min(r, 1.0f)                 // 0x3c7cc0 = 1.0f
//     r  = max(r, 0.0f)                 // xorps xmm0,xmm0
//     u  = (u64)(numBins - 1) as f32
//     rf = r * u                         // wants to be in [0, numBins-1]
//     idx = round-half-to-even(rf)      // via
//              addss xmm0, (signmask(rf) OR 0.4999999701976776) ;
//              roundss $0xb, xmm0 ; cvttss2si
//           where 0x3ca0d0 = 4x 0x80000000 (sign mask)
//                 0x3ca310 = 4x 0x3effffff (= 0.4999999701976776f)
//                 roundss $0xb == ROUND_TO_TRUNC (drop fractional part)
//           This IS bit-exact "round to nearest, ties toward zero".
//     If idx >= numBins  ->  TAIL-JMP into HGApplyNDLUTInfo::colorAtIndex
//                            (the base's zero-fill stub — writes 0.0f to
//                            all four *out pointers and returns). This is
//                            an out-of-range fallback path.
//     Otherwise index the underlying byte buffer with per-quad stride 16
//     bytes (RGBA_F32).
//
//   For the 3-D path (numDims==3) the same round-half-to-even index-
//   from-normalized-value is computed independently for each of R,G,B.
//   Then the FLAT byte offset is:
//     bpp   = HGFormatUtils::bytesPerPixel(storage_extracted_from_LUTData)
//     row   = bpp * numBins
//     slice = row * numBins
//     byteOff = idxR*bpp + idxG*row + idxB*slice
//     For storage `0x19` (rgba_u16) or `0x13` (rgba_u16 alt), each
//     channel is a u16 divided by 65535.0f -> [0,1] float.
//     For any other storage, each channel is a raw f32 read.
//     The 4th out (*oA / hgP0.a slot) is ALWAYS written as `0x3f800000`
//     (1.0f, @0x1d29f3) — this LUT is opaque; alpha is forced to 1.
//
// STORAGE FORMAT TAGS (from `cmpl $0x19` and `cmpl $0x13` @0x1d2921/@0x1d2927):
//   0x13, 0x19       — u16-per-channel path (divide by 65535.0f = 0x477fff00 @0x3cccf4).
//   any other value  — float-per-channel path.
// The storage tag is READ FROM THE HGColorConformLUTData handle at
// `handle->0x20` (`movl 0x20(%rax),%eax` @0x1d26e0), NOT from the base
// class's `storage` field at +0x20. That is intentional: HGColorConformLUTData
// is what OWNS the bit-encoding of the packed LUT bytes; the base
// class's LUTStorageFormat is a higher-level cache-key tag.
//
// RIP-relative constants used by colorAtIndex (verified by reading the
// Helium binary at those file offsets after the x86_64 slice offset
// 0x4000; see raw-port/army/notes on constant extraction):
//   @Helium 0x3c7cc0  = 1.0f                          (minss clamp bound)
//   @Helium 0x3ca0d0  = 4x 0x80000000                 (sign-bit mask)
//   @Helium 0x3ca310  = 4x 0x3effffff (0.4999999701976776f)  (½-bias OR-mask)
//   @Helium 0x3cccf4  = 65535.0f                      (u16 → normalized f32 divisor)
//
// DUPLICATE:
//   duplicate() @0x1d23e0 does a value-copy: it re-runs C2@0x1d2a10 with
//   (this->lutDataRef, this->getNumBins(), this->getNumDims(),
//    a fresh vector<u8> value-constructed from (this->vec_begin,this->vec_end),
//    this->getRangeScale(),
//    this->getRangeOffset()   [via the ICF-collapsed name below],
//    this->getLUTStorageFormat()).
//
// SYMBOL-ICF NOTE:
//   The disasm shows a call to
//     __ZNK21HGComicImplementation24GetEdgeThresholdCoeffAdjEv
//   at @0x1d248d and @0x1d2697/@0x1d26e9/@0x1d282a/@0x1d286a in
//   colorAtIndex and duplicate. That mangled symbol resolves (via
//   `nm -arch x86_64 -n Helium`) to address 0x3d650 — the SAME address
//   as HGApplyNDLUTInfo::getRangeOffset() (see HGApplyNDLUTInfo.ts
//   method map: "@0x3d650 getRangeOffset()"). These two symbols share a
//   folded body via linker ICF (identical trailing
//   `movl 0x1c(%rdi),%eax; ret`). In THIS class's semantics the call is
//   unambiguously `HGApplyNDLUTInfo::getRangeOffset()` — we're invoking
//   it on `this` (an HGColorConformLUTInfo, not an HGComicImplementation),
//   and the value flows into the parent ctor's `rangeOffset` slot in
//   duplicate() @0x1d24bb. Documented here so readers of the disasm
//   don't chase the misleading Comic name.
//
// FRONTIER (undecoded — kept as throwing stubs cited by @0xADDR):
//   HGColorConformLUTData vtable — the ctors and dtors call three
//   virtual slots on the +0x28 handle:
//     *0x10  retain()    @0x1d2411 (duplicate)  &  @0x1d2a4e (C2 with HGRef)
//     *0x18  release()   @0x1d23c1 (D0)         &  @0x1d2371 (D1)
//     0x20-offset field  (LUT-format tag)       @0x1d26e0 (colorAtIndex)
//   Also referenced but not decoded here: HGColorConformLUTData::copy,
//   getFormat, getBytePtr, getConstBytePtr, HGColorConformLUTDataC1 ctor.
//   HGFormatUtils::bytesPerPixel(HGFormat)  @0x1d290f  — kept as an
//     opaque function call; will be resolved when HGFormatUtils lands.

import { HGApplyNDLUTInfo, type LUTStorageFormat } from "./HGApplyNDLUTInfo";

/**
 * HGColorConformLUTData — opaque ref-counted handle to a raw LUT byte
 * payload with a packing-format tag readable at handle-offset +0x20.
 *
 * Not yet transcribed as its own class file. Modelled here as a minimal
 * shape: a reader for the +0x20 format tag, plus retain/release for the
 * two ctor/dtor v-slots. Any actual data access goes through
 * `getConstBytePtr()` (undecoded — throwing stub) once the class lands.
 *
 * Frontier @Helium 0x1d2a4e (C2 retain via `callq *0x10(%rax)`),
 *          @Helium 0x1d2371 (D1 release via `callq *0x18(%rax)`),
 *          @Helium 0x1d23c1 (D0 release via `callq *0x18(%rax)`),
 *          @Helium 0x1d26e0 (colorAtIndex reads `movl 0x20(%rax),%eax`).
 */
export interface HGColorConformLUTDataRef {
  /** @Helium 0x1d26e0 — u32 at handle+0x20 = HGFormat tag for the raw
   *  LUT byte payload. Values observed by colorAtIndex: 0x13, 0x19
   *  (u16-per-channel) → divide-by-65535.0f path; anything else →
   *  float-per-channel path. */
  readonly formatTagAt0x20: number;
  /** @Helium 0x1d2a4e (vslot 2) — retain the handle when a fresh
   *  HGColorConformLUTInfo takes ownership. */
  retain(): void;
  /** @Helium 0x1d2371 / @Helium 0x1d23c1 (vslot 3) — release the handle
   *  when an HGColorConformLUTInfo is destroyed. */
  release(): void;
  /** @Helium (undecoded) — pointer to the raw LUT byte payload. This is
   *  what the colorAtIndex 3-D indexing reads via `movq 0x18(%rcx),%rcx`
   *  at @0x1d27c2 / @0x1d2938 / @0x1d29a6 (handle+0x18). Treated as an
   *  opaque byte buffer. */
  getConstBytePtr(): Uint8Array;
}

/**
 * HGFormatUtils::bytesPerPixel(HGFormat) — @Helium (external, called
 * at @0x1d290f). Not yet transcribed. Kept as a throw-stub — decoding
 * the per-format table lives in HGFormatUtils and is out of scope for
 * THIS class port. When it lands, remove this stub and import.
 */
function HGFormatUtils_bytesPerPixel_stub(_format: number): number {
  throw new Error(
    "HGFormatUtils::bytesPerPixel(HGFormat) @Helium (extern) not yet transcribed — called from HGColorConformLUTInfo::colorAtIndex @0x1d290f",
  );
}

/**
 * HGColorConformLUTInfo — full port. See file header for decode
 * provenance, layout, and semantics.
 */
export class HGColorConformLUTInfo extends HGApplyNDLUTInfo {
  /** +0x28 — HGColorConformLUTData ref-counted handle. Nullable in the
   *  no-Ref ctor path (C2@0x1d21d0); populated + retained in the
   *  HGRef-taking ctor (C2@0x1d2a10 @0x1d2a3f-@0x1d2a4e). */
  private lutDataRef: HGColorConformLUTDataRef | null = null;

  /** +0x30 — bool "vector-is-all-zeros" fast-path flag. Ctors set it to
   *  1 (@0x1d21fe/@0x1d2a51) and then the payload-copy loop clears it if
   *  any non-zero byte is seen (@0x1d2274-@0x1d229f simple path and
   *  @0x1d22be-@0x1d2300 SIMD path). isEqual short-circuits when EITHER
   *  operand has this flag set (@0x1d25ae..@0x1d25b8). */
  private vectorIsAllZeros = true;

  /** +0x38..+0x48 — libc++ `std::vector<unsigned char>` triple. Modelled
   *  as a single Uint8Array (capacity == length here since the ctors
   *  always allocate exactly the source length). vec_end is
   *  `vec_begin + rawBytes.length`. */
  private rawBytes: Uint8Array = new Uint8Array(0);

  /**
   * HGColorConformLUTInfo::HGColorConformLUTInfo(unsigned long numBins,
   *                                              unsigned long numDims,
   *                                              std::vector<uint8_t> bytes,
   *                                              float rangeScale,
   *                                              float rangeOffset,
   *                                              LUTStorageFormat storage)
   *
   * Mangled: __ZN21HGColorConformLUTInfoC2EmmNSt3__16vectorIhNS0_9allocatorIhEEEEffN16HGApplyNDLUTInfo16LUTStorageFormatE
   * @Helium 0x1d21d0
   *
   * ALSO (HGRef-taking variant):
   *   Mangled: __ZN21HGColorConformLUTInfoC2E5HGRefI21HGColorConformLUTDataEmmNSt3__16vectorIhNS3_9allocatorIhEEEEffN16HGApplyNDLUTInfo16LUTStorageFormatE
   *   @Helium 0x1d2a10 — this is the canonical ctor `duplicate()` targets.
   *
   * Both bodies are ONE-FOR-ONE identical except for +0x28 init:
   *   No-Ref  @0x1d21f6:  movq $0x0, 0x28(%rbx)
   *   HGRef   @0x1d2a3f:  movq (%r15),%rdi ; movq %rdi,0x28(%rbx)
   *                      testq %rdi,%rdi ; je +8
   *                        movq (%rdi),%rax ; callq *0x10(%rax)   ; vslot 2 = retain()
   *
   * Chained call to the base ctor (@0x1d21e7 / @0x1d2a30):
   *   parent(this, numBins, numDims, rangeScale, rangeOffset, storage)
   *   — SysV register shuffle @0x1d21e4/@0x1d2a2d drops the vector arg
   *     and lifts storage from %r9d to %ecx.
   *
   * Vtable install (@0x1d21ec-@0x1d21f3 / @0x1d2a35-@0x1d2a3c):
   *   leaq <0xa2a028>(%rip),%rax ; movq %rax,(%rbx).
   *
   * Then the vector<u8> COPY (@0x1d2211-@0x1d2260 / @0x1d2a64-@0x1d2ab0):
   *   Load source: begin=%r12=(%r14), end=%rax=0x8(%r14), len=%r15=end-begin.
   *   If len==0: skip alloc/copy, vectorIsAllZeros stays 1.
   *   If len<0:  __throw_length_error — unreachable in practice.
   *   Else:
   *     new_buf = __Znwm(len)
   *     +0x38 = new_buf; +0x40 = new_buf+len; +0x48 = new_buf+len.
   *     memcpy(new_buf, src_begin, len).
   *
   * Then the ZERO-SCAN (@0x1d2264-@0x1d2300 / @0x1d2ab3-@0x1d2b3c):
   *   Two-tier:
   *   Tail loop @0x1d2274-@0x1d229f — scan the trailing `len & 3` bytes
   *     one-at-a-time. %cl holds the running "all-zero-so-far" bit.
   *   SIMD block @0x1d22be-@0x1d2300 — 4-byte-per-iter loop over
   *     `len & ~3` bytes; each 4-byte block compares bytes 0/1/2/3
   *     against zero. Any non-zero byte falls to `xorl %ecx,%ecx` (clear
   *     flag). Whole zero block sets %cl via `sete` on the 4th byte.
   *   Final store  movb %cl,0x30(%rbx)  — commit result.
   *
   *   The observable is: `vectorIsAllZeros == every byte is 0`. TS
   *   models this with a straightforward loop — bit-exact same result.
   */
  constructor(
    numBins: number,
    numDims: number,
    bytes: Uint8Array,
    rangeScale: number,
    rangeOffset: number,
    storage: LUTStorageFormat,
    /** Optional (unset in C2@0x1d21d0; set in C2@0x1d2a10). */
    lutDataRef?: HGColorConformLUTDataRef | null,
  ) {
    // @0x1d21e7 / @0x1d2a30: chain to parent ctor with same 5 numeric
    // args. HGApplyNDLUTInfo does its own numDims-clamp {1,2,3}.
    super(numBins, numDims, rangeScale, rangeOffset, storage);
    // @0x1d21ec-@0x1d21f3 (& @0x1d2a35-@0x1d2a3c): vtable install is a
    // no-op in TS (typing handles polymorphism). Documented here.

    // @0x1d21f6  vs  @0x1d2a3f-@0x1d2a4e — lutDataRef either null OR
    // retained. In C2@0x1d2a10, the retain is `callq *0x10(%rax)`
    // (vtable slot 2 on the handle). We call retain() on the interface
    // to model that ref-count bump.
    if (lutDataRef) {
      lutDataRef.retain();
      this.lutDataRef = lutDataRef;
    } else {
      // @0x1d21f6: movq $0x0, 0x28(%rbx)
      this.lutDataRef = null;
    }

    // @0x1d21fe / @0x1d2a51: movb $0x1, 0x30(%rbx)  — initial guess.
    this.vectorIsAllZeros = true;

    // @0x1d2202-@0x1d2260  &  @0x1d2a55-@0x1d2ab0: copy the src vector
    // byte-for-byte. TS view: slice() to guarantee an owned buffer;
    // bytes.length==0 goes straight to the "empty" branch (@0x1d221e).
    const len = bytes.length | 0;
    if (len > 0) {
      this.rawBytes = bytes.slice(0, len);
      // @0x1d2264-@0x1d2300: zero-scan. Equivalent to `bytes.every(b=>b===0)`
      // — the disasm's byte-by-byte + 4-byte block SIMD is a faithful
      // implementation of that predicate; the observable output written
      // to +0x30 is identical.
      let allZero = true;
      for (let i = 0; i < len; i++) {
        if (this.rawBytes[i] !== 0) {
          allZero = false;
          break;
        }
      }
      this.vectorIsAllZeros = allZero;
    } else {
      // @0x1d221e/@0x1d22a2 empty path — vectorIsAllZeros stays 1.
      this.rawBytes = new Uint8Array(0);
      this.vectorIsAllZeros = true;
    }
  }

  /**
   * HGColorConformLUTInfo::~HGColorConformLUTInfo() — @Helium 0x1d2340 (D1)
   * and 0x1d2390 (D0). D0's body is D1's body plus a tail-jmp into
   * `operator delete` (__ZdlPv @0x3c4fa0) after re-installing the vtable
   * to catch use-after-free.
   *
   *   0x1d2340/0x1d2390  push rbp; mov rsp,rbp; push rbx; sub rsp,8
   *   0x1d2349/0x1d2399  leaq <vtable>(%rip),%rax ; movq %rax,(%rdi)
   *                      — re-install this class's vtable (defensive).
   *   0x1d2353/0x1d23a3  movq 0x38(%rdi),%rdi  ; testq %rdi,%rdi
   *                      je +0x0b
   *                        movq %rdi,0x40(%rbx)
   *                        callq __ZdlPv           — delete[] vec_begin.
   *   0x1d2365/0x1d23b5  movq 0x28(%rbx),%rdi  ; testq %rdi,%rdi
   *                      je +0x08
   *                        movq (%rdi),%rax        — vtable ptr on the ref.
   *                        callq *0x18(%rax)       — vslot 3 = release().
   *   D1 @0x1d237a       retq (base dtor completes; caller may reuse).
   *   D0 @0x1d23cd       jmp __ZdlPv               — delete this.
   *
   * TS has no explicit destructors. We model the observable side effect
   * of D1 (`release()` on the LUTData ref) so that a caller who
   * relinquishes ownership can drop the ref-count. Callers must invoke
   * `destroy()` explicitly — matching the base-vs-deleting-dtor
   * distinction is not observable from TS.
   */
  destroy(): void {
    // @0x1d2353/@0x1d23a3: `delete[] vec_begin` — TS: drop the reference.
    this.rawBytes = new Uint8Array(0);
    // @0x1d2365/@0x1d23b5: release the LUTData handle if present.
    if (this.lutDataRef) {
      this.lutDataRef.release();
      this.lutDataRef = null;
    }
  }

  /**
   * HGColorConformLUTInfo::duplicate() const — @Helium 0x1d23e0
   *
   * Body:
   *   0x1d23f4  movl $0x50,%edi ; callq __Znwm
   *             — allocate 0x50 bytes (== sizeof(HGColorConformLUTInfo)).
   *   0x1d2401  movq 0x28(%r14),%rdi ; movq %rdi,-0x38(%rbp)
   *             — copy the LUTData handle into a stack slot for the
   *               ctor call below.
   *             testq %rdi,%rdi ; je +0x08
   *               movq (%rdi),%rax ; callq *0x10(%rax)
   *               — vslot 2 = retain(). We're about to give this handle
   *                 to a new instance; bump the refcount here.
   *   0x1d2414  callq HGApplyNDLUTInfo::getNumBins()
   *   0x1d2420  callq HGApplyNDLUTInfo::getNumDims()
   *   0x1d242b  xorps + movaps + movq — zero-fill a stack std::vector
   *             (begin=0, end=0, cap=0).
   *   0x1d243a-0x1d247d — copy this->vec_begin..vec_end into that stack
   *             vector by allocating a fresh buffer of the same length
   *             and _memcpy'ing. Identical asm shape to the ctor's copy
   *             loop.
   *   0x1d2480  callq HGApplyNDLUTInfo::getRangeScale()   -> stash %xmm0
   *   0x1d248d  callq __ZNK21HGComicImplementation24GetEdgeThresholdCoeffAdjEv
   *             — ICF-alias for HGApplyNDLUTInfo::getRangeOffset()
   *               (see file header "SYMBOL-ICF NOTE"). Stash %xmm0.
   *   0x1d249a  callq HGApplyNDLUTInfo::getLUTStorageFormat()
   *   0x1d24be  callq HGColorConformLUTInfoC2  (the HGRef-taking one)
   *             — 7 args in the exact order:
   *                   %rdi=new_this, %rsi=&lutDataRef_stackslot,
   *                   %rdx=numBins, %rcx=numDims, %r8=&stack_vector,
   *                   %xmm0=rangeScale, %xmm1=rangeOffset, %r9d=storage.
   *   0x1d24c3-0x1d24d5  delete the stack vector's heap buffer.
   *   0x1d24e4  return the new pointer.
   *
   * This is a straight VALUE COPY that shares the LUTData handle (via
   * retain, not memcpy). The class is fundamentally a small header
   * around a shared refcounted payload.
   */
  duplicate(): HGColorConformLUTInfo {
    // @0x1d23f4: allocate a new 0x50-byte object — implicit in `new`.
    // @0x1d2401-0x1d2411: the retain is performed BY the ctor below when
    // it sees a non-null lutDataRef, so we simply forward the ref.
    // @0x1d2414/@0x1d2420/@0x1d2480/@0x1d248d/@0x1d249a: read all 5 args
    // through the parent's public accessors — bit-exact same values.
    return new HGColorConformLUTInfo(
      this.getNumBins(),
      this.getNumDims(),
      // @0x1d243a-0x1d247d: rawBytes value-copy. slice() below is what
      // the ctor's internal `bytes.slice()` already does; we forward the
      // full buffer and let the ctor do the copy exactly once (matches
      // the disasm where the stack vector's buffer is a temporary that
      // is immediately deleted after the ctor consumes it).
      this.rawBytes,
      this.getRangeScale(),
      // @0x1d248d: ICF-shared symbol; this IS getRangeOffset(). See
      // file header "SYMBOL-ICF NOTE".
      this.getRangeOffset(),
      this.getLUTStorageFormat(),
      this.lutDataRef, // ctor bumps refcount via retain()
    );
  }

  /**
   * HGColorConformLUTInfo::isEqual(HGLUTCache::LUTInfo* other) const
   * — @Helium 0x1d2570
   *
   * Body:
   *   0x1d257b  testq %rsi,%rsi ; je 0x1d2630   — null other → return 0
   *   0x1d2587  RIP-relative literal-pool lookup of &typeinfo(HGLUTCache::LUTInfo)
   *   0x1d258e  leaq <typeinfo(HGColorConformLUTInfo)>(%rip),%rdx
   *   0x1d25a0  callq ___dynamic_cast
   *             — dynamic_cast<HGColorConformLUTInfo*>(other). Returns
   *               null on failure -> fall through to the return-0 path.
   *   0x1d25ae  cmpb $0, 0x30(%rbx)  ; jne 0x1d2630
   *             cmpb $0, 0x30(%rax)  ; jne 0x1d2630
   *             — if EITHER instance has vectorIsAllZeros==1, the LUTs
   *               are considered unequal. Rationale: an "all zeros"
   *               instance is a sentinel that hasn't yet been populated
   *               with real data; two such sentinels or a sentinel-vs-real
   *               pair should not collapse in the cache. (Preserving
   *               exact FCP behaviour — the reason for this asymmetric
   *               short-circuit lives one level above us in HGLUTCache.)
   *   0x1d25ba  callq getNumDims() ; save ; callq other->getNumDims() ; cmp ; jne fail
   *   0x1d25d8  callq getNumBins() ; save ; callq other->getNumBins() ; cmp ; jne fail
   *   0x1d25f0  callq getLUTStorageFormat() ; save ; callq other-> ; cmp ; jne fail
   *   0x1d2608  movq 0x38(%rbx),%rdi ; movq 0x40(%rbx),%rdx ; subq %rdi,%rdx    — this vec length
   *             movq 0x38(%r14),%rsi ; movq 0x40(%r14),%rax ; subq %rsi,%rax    — other vec length
   *             cmpq %rax,%rdx ; jne fail                                      — length mismatch → fail
   *             callq _memcmp                                                  — byte-by-byte cmp
   *             testl %eax,%eax ; sete %r14b                                   — equal iff memcmp==0.
   *
   * NB: rangeScale, rangeOffset are NOT compared here (unlike the base
   * class's isEqual). The equality contract of HGColorConformLUTInfo is:
   * same numDims, same numBins, same storage tag, same raw bytes. The
   * scale/offset are metadata for the query, not part of the LUT
   * identity — this is the whole reason HGColorConform derives from
   * HGApplyNDLUTInfo but overrides isEqual: the LUT bytes ARE the
   * fingerprint.
   */
  isEqual(other: HGApplyNDLUTInfo | null): boolean {
    // @0x1d257b: null-check.
    if (other === null || other === undefined) return false;
    // @0x1d258e/@0x1d25a0: dynamic_cast — TS instanceof is the analogue.
    if (!(other instanceof HGColorConformLUTInfo)) return false;
    // @0x1d25ae/@0x1d25b4: either-side vectorIsAllZeros short-circuit.
    if (this.vectorIsAllZeros) return false;
    if (other.vectorIsAllZeros) return false;
    // @0x1d25ba-@0x1d25d6: numDims via base accessor.
    if (this.getNumDims() !== other.getNumDims()) return false;
    // @0x1d25d8-@0x1d25ee: numBins.
    if (this.getNumBins() !== other.getNumBins()) return false;
    // @0x1d25f0-@0x1d2606: storage tag.
    if ((this.getLUTStorageFormat() | 0) !== (other.getLUTStorageFormat() | 0)) return false;
    // @0x1d2608-@0x1d2621: length match.
    if (this.rawBytes.length !== other.rawBytes.length) return false;
    // @0x1d2623-@0x1d262a: memcmp.
    const a = this.rawBytes,
      b = other.rawBytes;
    for (let i = 0, n = a.length; i < n; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  /**
   * HGColorConformLUTInfo::colorAtIndex(float R, float G, float B,
   *                                     float* oR, float* oG,
   *                                     float* oB, float* oA) const
   * — @Helium 0x1d2640
   *
   * See file header "COLOR-AT-INDEX MATH" for the algorithm summary.
   * This transcription mirrors the asm branch structure exactly.
   *
   * SysV entry:
   *   %rdi=this, %xmm0..%xmm2 = R,G,B,
   *   %rsi=oR, %rdx=oG, %rcx=oB, %r8=oA.
   *
   * Body walk:
   *   0x1d2671  callq getNumDims()  ; store in %r14
   *   0x1d267c  callq getNumBins()  ; store in %r13
   *   0x1d2684  cmpq $3,%r14 ; je 0x1d26dc      — 3-D path.
   *   0x1d268a  cmpq $1,%r14 ; jne 0x1d2740     — not-1 → fallback path.
   *   [1-D path @0x1d2694-@0x1d27fd]
   *   [3-D path @0x1d26dc-@0x1d29f9]
   *   [Fallback @0x1d2740-@0x1d27b9] tail-jmps into base's zero-fill.
   *
   * 1-D branch (numDims==1) @0x1d2694-@0x1d27bd:
   *   xmm0 (R) = R - GetEdgeThresholdCoeffAdj()  // ICF alias for getRangeOffset
   *   xmm0 /= getRangeScale()
   *   xmm0 = min(xmm0, 1.0f)  // 0x3c7cc0
   *   xmm0 = max(xmm0, 0.0f)
   *   %rax = (i64)(numBins - 1)                  // dec ; js branch handles u64 top-bit
   *   xmm0 (binMaxIndexAsFloat) = f32(numBins-1)
   *   xmm1 (normalized r) *= xmm0                // mulss
   *   round-half-away-from-zero xmm1 via
   *     xmm0 = signmask(xmm1) OR 0x3effffff       // 0x3ca0d0 & 0x3ca310
   *     xmm0 += xmm1
   *     roundss $0xb  (trunc-toward-zero)
   *     idx = cvttss2si(xmm0)
   *   if ((u64)idx >= numBins) tail-jmp base->colorAtIndex(...)
   *     [i.e. `HGApplyNDLUTInfo::colorAtIndex` — the zero-fill stub —
   *      whose SysV args we've reassembled into rsi,rdx,rcx,r8 from
   *      the stack slots we spilled to at entry.]
   *   else read the RGBA_F32 quad at
   *     handle  = (HGColorConformLUTData*) this[+0x28]
   *     bytePtr = handle[+0x18]      // @0x1d27c2  movq 0x18(%rcx),%rcx
   *     base = bytePtr + 16*idx       // shll $0x2,%eax ; cltq ; ...(%rcx,%rax,4)
   *     *oR = f32 @ base+0
   *     *oG = f32 @ base+4
   *     *oB = f32 @ base+8
   *     *oA = f32 @ base+12
   *   return.
   *
   * NB: The 1-D path in FCP always reads FLOATS from the LUTData
   * payload (no format branch). This makes sense because 1-D transfer
   * LUTs are always materialized as f32 RGBA quads by
   * HGColorConformLUTData::copy — the storage tag on the *info* object
   * is a cache-key hint for the 3-D path only.
   *
   * 3-D branch (numDims==3) @0x1d26dc-@0x1d29f9:
   *   Load storage tag: `movq 0x28(%rbx),%rax ; movl 0x20(%rax),%eax`
   *     → %r15d (spilled at @0x1d2908 for use by bytesPerPixel).
   *   Then INDEPENDENTLY for each of R, G, B (order matters for spill
   *   slots but is otherwise identical):
   *     v = ((in - getRangeOffset()) / getRangeScale())
   *     v = clamp(v, 0, 1)                   // minss 1.0f, maxss 0.0f
   *     v *= f32(numBins - 1)                // %xmm0 = binMaxIndexAsFloat
   *     idx = trunc(v + copysign(0.4999999701976776, v))
   *   Then compute:
   *     bpp = HGFormatUtils::bytesPerPixel(storage_tag)      // 8 or 16
   *     row = numBins * bpp   (= imulq %rcx (=bpp), %rax (=numBins))
   *     slice = row * numBins (= imulq %rax (=row), %r13 (=numBins))
   *     byteOff = idxR*bpp + idxG*row + idxB*slice
   *   Read the payload byte pointer:
   *     %rdx = this[+0x28] ; %rdx = handle[+0x18] (a byte pointer field)
   *   Decode:
   *     if storage_tag ∈ {0x13, 0x19}:
   *        u16* p = (u16*)(payload + byteOff)
   *        *oR = f32(p[0]) / 65535.0f      (0x3cccf4 = 65535.0)
   *        *oG = f32(p[1]) / 65535.0f
   *        *oB = f32(p[2]) / 65535.0f
   *     else:
   *        f32* p = (f32*)(payload + byteOff)
   *        *oR = p[0] ; *oG = p[1] ; *oB = p[2]
   *   *oA = 1.0f  (0x3f800000, always) @0x1d29f3.
   *
   * FLOAT NUMERICS: every intermediate is single-precision. TS uses
   * Math.fround at each combining operation to match cvtss2ss / addss /
   * mulss / divss / minss / maxss precision.
   */
  colorAtIndex(
    R: number,
    G: number,
    B: number,
    oR: [number],
    oG: [number],
    oB: [number],
    oA: [number],
  ): void {
    const fr = Math.fround;
    // @0x1d2671/@0x1d267c: load numDims, numBins.
    const numDims = this.getNumDims() | 0;
    const numBins = this.getNumBins() >>> 0;

    // Common: compute rounded index for one input channel using the
    // exact banker-rounding-toward-zero sequence in the asm.
    // @0x1d276f-@0x1d2784 and @0x1d28ab-@0x1d2901.
    const indexFor = (x: number, binMaxF: number): number => {
      // v = (x - rangeOffset) / rangeScale
      const off = fr(this.getRangeOffset());
      const scl = fr(this.getRangeScale());
      let v = fr(fr(x) - off);
      v = fr(v / scl);
      // minss 1.0f  (@0x3c7cc0)  -> min(v, 1.0f)
      if (v > 1.0) v = 1.0;
      // xorps xmm0,xmm0 ; maxss xmm0,%xmm1 -> max(v, 0.0f).
      // Note: `maxss` returns the SECOND operand on NaN, so NaN
      // propagates through; TS `Math.max(NaN, 0)` yields NaN too — matches.
      if (v < 0.0) v = 0.0;
      // v *= binMaxF (== f32(numBins - 1))
      v = fr(v * binMaxF);
      // Rounding: add copysign(0x3effffff, v)  (== ±0.4999999701976776),
      // then trunc toward zero, then int-cast.
      // "signmask(v) OR 0x3effffff" = copysign(0.499..., v).
      const bias = v < 0 ? -0.4999999701976776 : 0.4999999701976776;
      let biased = fr(v + fr(bias));
      // roundss $0xb == trunc toward zero.
      biased = Math.trunc(biased);
      // cvttss2si — trunc toward zero already applied above.
      return biased | 0;
    };

    // binMaxIndexAsFloat computation: `%rax = numBins - 1 ; cvtsi2ss`.
    // For numBins==0 the disasm's `decq %rax ; js` branch executes the
    // UNSIGNED-int64-to-float shift-and-add-self recipe (@0x1d2749) —
    // handling values with the top bit set. In practice numBins is
    // always >= 1 in FCP (a 0-bin LUT is meaningless), and TS number
    // handles both cases uniformly via `Number(numBinsMinusOne)` since
    // JS numbers cover the entire u64 non-negative range up to 2^53.
    const binMaxF = fr(numBins === 0 ? -1 : numBins - 1);

    if (numDims === 3) {
      // @0x1d26dc: 3-D path.
      // Load storage tag from LUTData handle @+0x20.
      // @0x1d26dc-@0x1d26e3: `movq 0x28(%rbx),%rax ; movl 0x20(%rax),%eax`.
      if (this.lutDataRef === null) {
        // The C++ asm would deref null and crash. Model this as a loud
        // frontier — a well-formed HGColorConformLUTInfo in 3-D mode
        // ALWAYS has a LUTData handle (the fabric ctor is C2@0x1d2a10).
        throw new Error(
          "HGColorConformLUTInfo::colorAtIndex(3D) @Helium 0x1d26dc — lutDataRef is null (unreachable in FCP; missing 3-D LUT payload)",
        );
      }
      const storageTag = this.lutDataRef.formatTagAt0x20 >>> 0;

      // @0x1d26e6-@0x1d27bd + @0x1d281a-@0x1d290c: three independent
      // "normalize + round" pipelines for R, G, B.
      const idxR = indexFor(R, binMaxF);
      const idxG = indexFor(G, binMaxF);
      const idxB = indexFor(B, binMaxF);

      // @0x1d290f: bpp = HGFormatUtils::bytesPerPixel(storage_tag).
      // Frontier — kept as a throw-stub, per anti-shortcut rules.
      const bpp = HGFormatUtils_bytesPerPixel_stub(storageTag);
      // (Unreachable in this port — the stub throws. When HGFormatUtils
      // lands, the branches below reproduce the exact indexing math.)

      // @0x1d2916-@0x1d291d: row = numBins * bpp ; slice = row * numBins.
      const row = numBins * bpp;
      const slice = row * numBins;
      // @0x1d293c-@0x1d294a: byteOff = idxR*bpp + idxG*row + idxB*slice.
      const byteOff = idxR * bpp + idxG * row + idxB * slice;

      // @0x1d292d: payload byte pointer = handle[+0x18].
      const payload = this.lutDataRef.getConstBytePtr();

      // @0x1d2921/@0x1d2927: format-tag branch on 0x19/0x13.
      if (storageTag === 0x19 || storageTag === 0x13) {
        // @0x1d294e-@0x1d2999: u16 path, / 65535.0f.
        const dv = new DataView(
          payload.buffer,
          payload.byteOffset,
          payload.byteLength,
        );
        const u0 = dv.getUint16(byteOff, true);
        const u1 = dv.getUint16(byteOff + 2, true);
        const u2 = dv.getUint16(byteOff + 4, true);
        oR[0] = fr(u0 / 65535.0);
        oG[0] = fr(u1 / 65535.0);
        oB[0] = fr(u2 / 65535.0);
      } else {
        // @0x1d299b-@0x1d29da: f32 path.
        const dv = new DataView(
          payload.buffer,
          payload.byteOffset,
          payload.byteLength,
        );
        oR[0] = fr(dv.getFloat32(byteOff, true));
        oG[0] = fr(dv.getFloat32(byteOff + 4, true));
        oB[0] = fr(dv.getFloat32(byteOff + 8, true));
      }
      // @0x1d29f3: *oA := 1.0f (0x3f800000).
      oA[0] = 1.0;
      return;
    }

    if (numDims === 1) {
      // @0x1d2694-@0x1d27bd: 1-D path.
      const idx = indexFor(R, binMaxF);
      // @0x1d2787-@0x1d278a: bounds check on idx as UNSIGNED (`cmpq %rcx,%r13 ; jae`
      // reads: if numBins <= idx then fall to the out-of-range branch).
      if (idx < 0 || (idx >>> 0) >= numBins) {
        // @0x1d278c-@0x1d27b9: tail-jmp into HGApplyNDLUTInfo::colorAtIndex.
        // Base's colorAtIndex is a zero-fill stub (see HGApplyNDLUTInfo.ts):
        // writes 0.0f to *oR/*oG/*oB/*oA. Preserve that exactly.
        oR[0] = 0.0;
        oG[0] = 0.0;
        oB[0] = 0.0;
        oA[0] = 0.0;
        return;
      }
      // @0x1d27be-@0x1d27f8: 1-D path always uses the FLOAT layout —
      // the disasm sign-extends via `shll $2,%eax ; cltq` (which yields
      // idx*4 in %rax, and the following `movss (%rcx,%rax,4)` further
      // multiplies by 4 for a per-quad stride of 16 bytes = one RGBA_F32).
      if (this.lutDataRef === null) {
        throw new Error(
          "HGColorConformLUTInfo::colorAtIndex(1D) @Helium 0x1d27be — lutDataRef is null (unreachable in FCP; missing 1-D LUT payload)",
        );
      }
      const payload = this.lutDataRef.getConstBytePtr();
      const dv = new DataView(
        payload.buffer,
        payload.byteOffset,
        payload.byteLength,
      );
      // Per-quad stride: 16 bytes  (idx * 4 * 4).
      const base = idx * 16;
      oR[0] = fr(dv.getFloat32(base + 0, true));
      oG[0] = fr(dv.getFloat32(base + 4, true));
      oB[0] = fr(dv.getFloat32(base + 8, true));
      oA[0] = fr(dv.getFloat32(base + 12, true));
      return;
    }

    // @0x1d2740-@0x1d27b9: numDims not 1 or 3 → tail-jmp base.
    // Base colorAtIndex is a zero-fill stub; write 0.0f into all outs.
    oR[0] = 0.0;
    oG[0] = 0.0;
    oB[0] = 0.0;
    oA[0] = 0.0;
  }
}
