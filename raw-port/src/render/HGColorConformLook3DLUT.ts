// raw-port/src/render/HGColorConformLook3DLUT.ts
//
// FCP `HGColorConformLook3DLUT` — Helium color-conform "Look" 3D LUT descriptor:
// a CFData-backed encoded LUT payload, an appended running checksum byte-vector,
// a scale/offset pair, a set of range/clamp float parameters (min/max input+output),
// and color-space tags (primaries + transferFunction, both HGColorGamma enums).
//
// This is a plain data class (no rendering, no gpu). It owns a CFDataRef,
// grows a std::vector<uint8_t> (the running checksum), stores 8 primitive
// numeric fields, and inherits HGObject's refcount.
//
// Symbols (Helium framework, x86_64 slice; disasm from otool -tV; slice
// starts at file offset 0x4000, VAs below are unadjusted VM addresses):
//   0x106e50  HGColorConformLook3DLUT::HGColorConformLook3DLUT(Preset)                [C2 Preset ctor — LARGE bundle/loader path; STUBBED]
//   0x1c96b0  HGColorConformLook3DLUT::Clear()                                        [wipes to defaults]
//   0x1c9840  HGColorConformLook3DLUT::HGColorConformLook3DLUT(primaries, transferFn, CFData*, ...) [C1 -> thunk to C2 param]
//   0x1d1880  HGColorConformLook3DLUT::HGColorConformLook3DLUT(HGColorConformLook3DLUT const&) [C2 copy ctor]
//   0x1d1960  HGColorConformLook3DLUT::SetBuffer(CFData const*)                       [swap CFData with retain/release]
//   0x1d19b0  HGColorConformLook3DLUT::HGColorConformLook3DLUT(primaries, transferFn, ...) [C2 param ctor — main constructor]
//   0x1d1cb0  HGColorConformLook3DLUT::SetChecksum(unsigned char*, unsigned long)     [append `size` bytes to checksum vector]
//   0x1d1de0  HGColorConformLook3DLUT::HGColorConformLook3DLUT()                      [C2 default ctor]
//   0x1d1e50  HGColorConformLook3DLUT::~HGColorConformLook3DLUT()                     [D2 base dtor]
//   0x1d1ea0  HGColorConformLook3DLUT::~HGColorConformLook3DLUT()                     [D1 complete dtor — same body as D2 but tail-calls HGObject::~HGObject via a jmp]
//   0x1d1ef0  HGColorConformLook3DLUT::~HGColorConformLook3DLUT()                     [D0 deleting dtor]
//   0x1d1f50  HGColorConformLook3DLUT::IsValid() const                                [payload present AND checksum non-empty]
//   0x1d1f70  HGColorConformLook3DLUT::IsEqual(HGColorConformLook3DLUT*)              [equal iff both valid AND same-length AND memcmp==0 on checksum vec]
//
// LAYOUT (recovered from ctors + accessors + dtors, all cross-agree):
//   +0x00 : void*                            vtable pointer         (set by ctors to vtable+0x10)
//   +0x08 : u32                              refCount               (HGObject base, init 1 by HGObject::HGObject)
//   +0x0c : u32                              (HGObject padding to 0x10)
//   +0x10 : CFDataRef                        buffer                 (retained CFData with the raw LUT payload)
//   +0x18 : f32                              scale                  (init 1.0f in Clear/default; 1st arg-pair to param ctor via xmm0)
//   +0x1c : f32                              offset (or 2nd scale)  (init 0.0f in Clear/default; xmm1 into param ctor)
//   +0x20 : u64                              size0                  (1st `unsigned long` arg to param ctor; init 0 in Clear)
//   +0x28 : u64                              size1                  (2nd `unsigned long` arg to param ctor; init 0 in Clear)
//   +0x30 : u64                              size2                  (3rd `unsigned long` arg to param ctor; init 0 in Clear)
//   +0x38 : bool                             flag                   (init true=1 in Clear/default; bool arg to param ctor)
//   +0x3c : u32                              lutEndian              (hgLookLUTEndian enum; init 2 in Clear/default; last-int arg)
//   +0x40 : uint8_t*                         checksumBegin          (running byte vector — std::vector<uint8_t> layout begin/end/cap_end)
//   +0x48 : uint8_t*                         checksumEnd
//   +0x50 : uint8_t*                         checksumCapEnd
//   +0x58 : f32                              rangeScale             (init 1.0f in Clear/default; from constant pool @0x85EF30 +0x0)
//   +0x5c : f32                              rangeOffset            (init 0.0f;                    from constant pool @0x85EF30 +0x4)
//   +0x60 : f32                              rangeMin               (init -FLT_MAX;                from constant pool @0x85EF30 +0x8)
//   +0x64 : f32                              rangeMax               (init +FLT_MAX;                from constant pool @0x85EF30 +0xc)
//   +0x68 : bool                             rangeIsIdentity        (init true=1; param ctor computes it)
//   +0x6c : u32                              colorPrimaries         (HGColorGamma::hgColorGammaColorPrimaries;  init 0 by Clear = movabsq $0x100000000 low half)
//   +0x70 : u32                              transferFunction       (HGColorGamma::hgColorGammaTransferFunction; init 1 by Clear = high half of 0x100000000)
//
// The +0x58..+0x64 128-bit constant is loaded verbatim from @Helium 0x85EF30:
//   +0x00: 0x3F800000  =  1.0f
//   +0x04: 0x00000000  =  0.0f
//   +0x08: 0xFF7FFFFF  = -FLT_MAX
//   +0x0C: 0x7F7FFFFF  = +FLT_MAX
//
// Callees (undecoded — stubbed with cited addresses):
//   __ZN23HGColorConformLook3DLUTC2ENS_6PresetE   Preset ctor @Helium 0x106e50
//                                                 (loads a bundled LUT resource by preset id
//                                                 through NSBundle + a big switch of resource
//                                                 filenames; not a pure-math leaf, deferred)
//   HGObject::HGObject / HGObject::~HGObject      REAL, imported below.
//
// DECODE-DON'T-FIT: every method transcribed here mirrors its asm line-by-line.

import { HGObject } from "./HGObject";

/**
 * Preset ctor body @Helium 0x106e50 not yet transcribed.
 * Loads a bundled LUT via NSBundle mainBundle + `pathForResource:ofType:` and a
 * jump-table of preset ids -> resource filenames; the body then falls through
 * to the CFDataCreate-with-file-bytes path before the standard param-ctor
 * epilogue. This is NSBundle plumbing gated by non-decoded ObjC ISA calls;
 * we do not fabricate the filename table.
 */
function HGColorConformLook3DLUT_PresetCtor_stub(_preset: number): never {
  throw new Error(
    "HGColorConformLook3DLUT::HGColorConformLook3DLUT(Preset) @Helium 0x106e50 " +
    "not yet transcribed (NSBundle-backed preset LUT loader; " +
    "jump-table dispatch on preset id 0..0xE loads one of 15 bundled .lut resources)"
  );
}

/**
 * `hgLookLUTEndian` enum (arg-passed 32-bit); Clear() writes the sentinel value 2
 * (@Helium 0x1c96e5: `movl $0x2, 0x3c(%rbx)`). We keep it as a plain u32 —
 * the enum's named members haven't been decoded from a caller site yet.
 */
export type HGLookLUTEndian = number;

/**
 * `HGColorGamma::hgColorGammaColorPrimaries` enum, u32.
 * Clear() writes 0 (@Helium 0x1c9703: low half of movabsq $0x100000000).
 */
export type HGColorGammaColorPrimaries = number;

/**
 * `HGColorGamma::hgColorGammaTransferFunction` enum, u32.
 * Clear() writes 1 (@Helium 0x1c9703: high half of movabsq $0x100000000).
 */
export type HGColorGammaTransferFunction = number;

/**
 * Range constant @Helium 0x85EF30 (16-byte movaps pool entry).
 * Read verbatim; used by Clear() and default ctor and (implicitly, via
 * the movaps into +0x58..+0x64 pattern) at multiple ctor sites.
 */
const RANGE_INIT_SCALE  = Math.fround(1.0);                         // @0x85EF30 +0x0
const RANGE_INIT_OFFSET = Math.fround(0.0);                         // @0x85EF30 +0x4
const RANGE_INIT_MIN    = Math.fround(-3.4028234663852886e+38);     // @0x85EF30 +0x8   (-FLT_MAX)
const RANGE_INIT_MAX    = Math.fround( 3.4028234663852886e+38);     // @0x85EF30 +0xC   (+FLT_MAX)

/**
 * Finite-check bounds used by the param ctor's range-identity computation
 * (@Helium 0x1d1bd0 movss from 0x3CB6B0 = +FLT_MAX, @0x1d1bea cmpless from
 * 0x3CD1F4 = -FLT_MAX). Real transcription of the branch below.
 */
const PARAM_CTOR_FLT_MAX_POS = Math.fround( 3.4028234663852886e+38); // @Helium 0x3CB6B0
const PARAM_CTOR_FLT_MAX_NEG = Math.fround(-3.4028234663852886e+38); // @Helium 0x3CD1F4

/** movsd @Helium 0x85EFA0 = 65535.0 (uint16 normalizer used by ratio path). */
const CTOR_RATIO_NUM = 65535.0; // @Helium 0x85EFA0

/**
 * `HGColorConformLook3DLUT` — Helium color-conform Look 3D LUT descriptor.
 * See file header for full byte-layout provenance.
 */
export class HGColorConformLook3DLUT extends HGObject {
  // +0x10
  buffer: unknown /* CFDataRef */ | null = null;

  // +0x18 / +0x1c
  scale: number  = RANGE_INIT_SCALE;
  offset: number = RANGE_INIT_OFFSET;

  // +0x20 / +0x28 / +0x30  (three unsigned longs — LUT sizes, e.g. lut side / row / total bytes)
  size0: bigint = 0n;
  size1: bigint = 0n;
  size2: bigint = 0n;

  // +0x38 / +0x3c
  flag: boolean = true;
  lutEndian: HGLookLUTEndian = 2;

  // +0x40..+0x50 — std::vector<uint8_t> checksum bytes.
  // In C++ this is a raw (begin,end,cap_end) triple; in TS we model it as
  // a growable Uint8Array. The size/capacity are exposed for parity with
  // SetChecksum's push_back/reserve doubling pattern.
  checksum: Uint8Array = new Uint8Array(0);
  private _checksumLen: number = 0;

  // +0x58..+0x64
  rangeScale:  number = RANGE_INIT_SCALE;
  rangeOffset: number = RANGE_INIT_OFFSET;
  rangeMin:    number = RANGE_INIT_MIN;
  rangeMax:    number = RANGE_INIT_MAX;

  // +0x68 / +0x6c / +0x70
  rangeIsIdentity: boolean = true;
  colorPrimaries: HGColorGammaColorPrimaries = 0;         // @Helium 0x1c9703 low half
  transferFunction: HGColorGammaTransferFunction = 1;     // @Helium 0x1c9703 high half

  /**
   * `HGColorConformLook3DLUT::HGColorConformLook3DLUT()` @Helium 0x1d1de0 (C2 default).
   *
   * Sequence (asm-faithful):
   *   HGObject::HGObject() @0x1d1de9         -> refcount=1
   *   vtable install (leaq +0x10, into (*this))  @0x1d1dee..0x1d1df5
   *   +0x10 = 0                              @0x1d1df8
   *   +0x40..+0x50 = {nullptr,nullptr,nullptr} (empty vector)  @0x1d1e00..0x1d1e07
   *   +0x18 = 1.0f                           @0x1d1e0f
   *   +0x1c..+0x2f = 0                       @0x1d1e16..0x1d1e1a  (xorps xmm0 stored twice)
   *   +0x38 = 1 (flag=true)                  @0x1d1e1e
   *   +0x3c = 2 (lutEndian sentinel)         @0x1d1e22
   *   movaps @0x85EF30 -> +0x58..+0x67       @0x1d1e29
   *   +0x68 = 1 (rangeIsIdentity=true)       @0x1d1e34
   *   movabsq $0x100000000 -> +0x6c/+0x70    @0x1d1e38..+0x1d1e42
   *     ==> +0x6c = 0 (colorPrimaries)
   *         +0x70 = 1 (transferFunction)
   *
   * Instance-field defaults above already match this exact end-state, so an
   * explicit body is a no-op; we still include the ctor to mirror the C++
   * class shape and to explicitly document the address.
   */
  constructor() {
    super();
    // All fields already at their C2 default-ctor end-state; kept explicit
    // for provenance:
    this.buffer = null;                        // @0x1d1df8
    this.size0 = 0n; this.size1 = 0n; this.size2 = 0n; // @0x1d1e00..0x1d1e0d (movups xorps twice)
    this.scale  = RANGE_INIT_SCALE;            // @0x1d1e0f
    this.offset = Math.fround(0.0);            // @0x1d1e16 (top half of second xorps store)
    this.flag = true;                          // @0x1d1e1e
    this.lutEndian = 2;                        // @0x1d1e22
    this.rangeScale  = RANGE_INIT_SCALE;       // @0x1d1e29 (movaps)
    this.rangeOffset = RANGE_INIT_OFFSET;
    this.rangeMin    = RANGE_INIT_MIN;
    this.rangeMax    = RANGE_INIT_MAX;
    this.rangeIsIdentity = true;               // @0x1d1e34
    this.colorPrimaries   = 0;                 // @0x1d1e38 low
    this.transferFunction = 1;                 // @0x1d1e38 high
    this.checksum = new Uint8Array(0);         // @0x1d1e00..+0x1d1e07 (empty vector)
    this._checksumLen = 0;
  }

  /**
   * `HGColorConformLook3DLUT::Clear()` @Helium 0x1c96b0.
   *
   * Sequence:
   *   if (buffer != null) { CFRelease(buffer) @0x1c96c2; buffer = null; @0x1c96c7 }
   *   scale  = 1.0f                                 @0x1c96cf
   *   offset..size2 = 0 (16-byte xorps at +0x1c and +0x28) @0x1c96d6..0x1c96dd
   *   flag = true                                   @0x1c96e1
   *   lutEndian = 2                                 @0x1c96e5
   *   // checksum.clear() modelled as end = begin (no reallocation)
   *   *(u64*)(+0x48) = *(u64*)(+0x40)               @0x1c96ec..0x1c96f0
   *   movaps @0x85EF30 -> +0x58..+0x67              @0x1c96f4..0x1c96fb
   *   rangeIsIdentity = true                        @0x1c96ff
   *   movabsq $0x100000000 -> +0x6c/+0x70           @0x1c9703..0x1c970d
   */
  Clear(): void {
    // Buffer CFRelease + null-out (@0x1c96b9..0x1c96cf).
    if (this.buffer !== null) {
      // CFRelease(this.buffer) @0x1c96c2 — modelled as dropping the JS reference.
      // (The real C runtime drops a retain count on the CFData; in the port there
      //  is no CoreFoundation refcount to manipulate.)
      this.buffer = null;                        // @0x1c96c7
    }
    this.scale = Math.fround(1.0);               // @0x1c96cf  imm=0x3F800000
    // The two `xorps xmm0, xmm0; movups xmm0, 0x1c/0x28(%rbx)` zero 16 bytes
    // each. +0x1c..+0x2b: offset(f32) + size0(u64) + low 4 of size1. Then
    // +0x28..+0x37: high 4 of size1 + size2(u64) + low 8 of the +0x38/+0x3c
    // pair (which are IMMEDIATELY overwritten below). Net effect on fields:
    this.offset = Math.fround(0.0);              // @0x1c96d9 (part of +0x1c..+0x2b zero)
    this.size0 = 0n;                             // @0x1c96d9 (+0x20..+0x27 = 0)
    this.size1 = 0n;                             // @0x1c96d9/0x1c96dd (+0x28..+0x2f = 0)
    this.size2 = 0n;                             // @0x1c96dd (+0x30..+0x37 = 0)
    this.flag = true;                            // @0x1c96e1
    this.lutEndian = 2;                          // @0x1c96e5
    // std::vector<uint8_t>::clear-without-deallocate:
    //   *(u64*)(+0x48) = *(u64*)(+0x40)   -> end = begin (@0x1c96ec/0x1c96f0)
    // Modelled by resetting the checksum's *logical* length while keeping the
    // underlying buffer allocated for later growth (matching the C++ semantics
    // — capacity is preserved; only `end` moves back to `begin`).
    this._checksumLen = 0;                       // @0x1c96f0
    this.rangeScale  = RANGE_INIT_SCALE;         // @0x1c96f4 movaps @0x85EF30 +0x0
    this.rangeOffset = RANGE_INIT_OFFSET;        // @0x1c96f4 movaps @0x85EF30 +0x4
    this.rangeMin    = RANGE_INIT_MIN;           // @0x1c96f4 movaps @0x85EF30 +0x8
    this.rangeMax    = RANGE_INIT_MAX;           // @0x1c96f4 movaps @0x85EF30 +0xC
    this.rangeIsIdentity = true;                 // @0x1c96ff
    this.colorPrimaries   = 0;                   // @0x1c9703 low  (0x0000_0000)
    this.transferFunction = 1;                   // @0x1c9703 high (0x0000_0001)
  }

  /**
   * `HGColorConformLook3DLUT::SetBuffer(CFData const*)` @Helium 0x1d1960.
   *
   * Sequence (asm-faithful):
   *   r14 = this; rdi = this->buffer (@+0x10)
   *   if (rdi == rsi) return                                    @0x1d196e..0x1d1971
   *   rbx = rsi (new buffer)
   *   if (rdi != null) CFRelease(rdi)                           @0x1d1976..0x1d197b
   *   this->buffer = rbx                                        @0x1d1980
   *   if (rbx != null) tail-jmp _CFRetain(rbx)                  @0x1d1984..0x1d1990
   *   else return
   *
   * i.e. "release old (if non-null), install new, retain new (if non-null)".
   */
  SetBuffer(newBuffer: unknown /* CFDataRef */ | null): void {
    const oldBuffer = this.buffer;                              // @0x1d196a
    if (oldBuffer === newBuffer) return;                        // @0x1d196e..0x1d1971
    if (oldBuffer !== null) {
      // CFRelease(oldBuffer) @0x1d197b — modelled as a JS reference drop.
    }
    this.buffer = newBuffer;                                    // @0x1d1980
    if (newBuffer !== null) {
      // tail-jmp CFRetain(newBuffer) @0x1d1990 — no-op in JS reference model.
    }
  }

  /**
   * `HGColorConformLook3DLUT::SetChecksum(unsigned char* src, unsigned long size)`
   * @Helium 0x1d1cb0.
   *
   * Semantics: RESET-then-APPEND on the checksum vector — the first thing the asm
   * does is `end = begin` (@0x1d1cc5..0x1d1cc9), which is std::vector::clear-
   * without-deallocate. It then push_back's `size` bytes from `src`, growing
   * the capacity with the classic `newCap = max(needed, 2*cap)` doubling and
   * length-error trap at >0x3FFFFFFFFFFFFFFF (@0x1d1d45..0x1d1d5c).
   *
   * Sequence:
   *   end = begin                                                @0x1d1cc5..0x1d1cc9
   *   if (size == 0) return                                      @0x1d1ccd..0x1d1cd0
   *   for (r15 = 0; r15 != size; ++r15) {
   *     if (end < cap_end) { *end++ = src[r15]; }                @0x1d1cf0..0x1d1d1d
   *     else {
   *       // grow: newCap = max(r12+1, 2*cap); clamp to
   *       //   >= SIZE_MAX/2 (0x3FFF..) -> SSIZE_MAX (0x7FFF..)  @0x1d1d45..0x1d1d5c
   *       // alloc new buffer with operator new (__Znwm)         @0x1d1d68
   *       // *(new+r12) = src[r15]                               @0x1d1d80
   *       // memcpy(new, old_begin, r12)                         @0x1d1d95
   *       // free(old_begin) with __ZdlPv                        @0x1d1db6
   *       // reinstall (begin,end,cap_end)                       @0x1d1da2..0x1d1dad
   *     }
   *   }
   *
   * We model the std::vector<uint8_t> as (Uint8Array capacity buffer,
   * logical length _checksumLen). Growth uses the same doubling rule and
   * throws a length_error-equivalent when the new capacity would exceed
   * `Number.MAX_SAFE_INTEGER` (the JS runtime's practical SIZE_MAX
   * analogue — the exact 0x3FFFFFFFFFFFFFFF threshold is unreachable in JS
   * memory, and the correct signal is still to throw).
   */
  SetChecksum(src: Uint8Array, size: number): void {
    // end = begin  (@0x1d1cc5..0x1d1cc9). In our model: clear logical length,
    // keep capacity.
    this._checksumLen = 0;                                        // @0x1d1cc9

    if (size === 0) return;                                       // @0x1d1ccd..0x1d1cd0

    for (let r15 = 0; r15 !== size; ++r15) {                      // loop @0x1d1cdc..0x1d1dc0
      const capacity = this.checksum.length;                      // cap_end - begin
      if (this._checksumLen < capacity) {                         // @0x1d1d16..0x1d1d1d
        this.checksum[this._checksumLen] = src[r15]!;             // @0x1d1cf0..0x1d1cfd (movzbl + movb)
        this._checksumLen++;                                      // @0x1d1cfd..0x1d1d0a (incq %r12, restore)
      } else {
        // Grow: newCap = max(r12+1, 2*cap); clamp above SSIZE_MAX/2.
        const r12 = this._checksumLen;                            // r12 = end - begin
        const needed = r12 + 1;                                   // @0x1d1d26..0x1d1d29 (leaq (r12,1); incq)
        if (needed < 0) {                                         // js: negative not reachable, but preserve trap
          throw new Error(
            "std::vector<unsigned char>::__throw_length_error " +
            "@Helium 0x1d1dd3 (HGColorConformLook3DLUT::SetChecksum overflow)"
          );
        }
        // r14 = 2*cap (@0x1d1d35); r14 = max(r14, needed) (@0x1d1d39..0x1d1d3e)
        let newCap = 2 * capacity;                                // @0x1d1d35
        if (newCap < needed) newCap = needed;                     // @0x1d1d39..0x1d1d3e
        // Clamp when cap >= 0x3FFFFFFFFFFFFFFF -> newCap = 0x7FFFFFFFFFFFFFFF
        // (@0x1d1d45..0x1d1d5c). In JS, the practical threshold is
        // Number.MAX_SAFE_INTEGER; either way, we reject.
        if (capacity >= Number.MAX_SAFE_INTEGER / 2) {
          throw new Error(
            "std::vector<unsigned char>::__throw_length_error " +
            "@Helium 0x1d1dd3 (clamp path: capacity >= SSIZE_MAX/2)"
          );
        }
        // operator new (@__Znwm 0x3c4fb2 stub) allocates newCap bytes
        // (@0x1d1d68). We model this as a fresh Uint8Array.
        const grown = new Uint8Array(newCap);                     // @0x1d1d68..0x1d1d6d
        // *(new+r12) = src[r15]  (@0x1d1d7b..0x1d1d80). Note: the write of
        // the new byte happens BEFORE the memcpy of the old prefix; the
        // memcpy then fills [0..r12), leaving [r12] intact.
        grown[r12] = src[r15]!;                                   // @0x1d1d80
        // memcpy(new, old_begin, r12) (@0x1d1d95).
        if (r12 > 0) {
          grown.set(this.checksum.subarray(0, r12), 0);           // @0x1d1d95
        }
        // free old_begin via __ZdlPv (@0x1d1db6). In JS: GC drops the old
        // buffer once we replace the reference.
        this.checksum = grown;                                    // @0x1d1b45..0x1d1b4d
        this._checksumLen = r12 + 1;                              // @0x1d1d27 (r13 = r15+r12+1... actually end = new+r12+1)
      }
    }
  }

  /**
   * `HGColorConformLook3DLUT::IsValid() const` @Helium 0x1d1f50.
   *
   * Body:
   *   if (buffer @+0x10 == null) return false;                   @0x1d1f54..0x1d1f59
   *   return checksumBegin @+0x40 != checksumEnd @+0x48;         @0x1d1f5b..0x1d1f66
   *
   * i.e. "valid iff we have a payload AND the checksum vector is non-empty".
   */
  IsValid(): boolean {
    if (this.buffer === null) return false;                       // @0x1d1f54..0x1d1f59
    return this._checksumLen !== 0;                               // @0x1d1f5b..0x1d1f66
  }

  /**
   * `HGColorConformLook3DLUT::IsEqual(HGColorConformLook3DLUT* other)`
   * @Helium 0x1d1f70.
   *
   * Body (asm-faithful):
   *   if (other == null) return false                            @0x1d1f70..0x1d1f73
   *   if (this->buffer   == null)                       return false      @0x1d1f75..0x1d1f7a
   *   rdi = this->checksumBegin  (@+0x40)
   *   rdx = this->checksumEnd    (@+0x48)
   *   if (rdi == rdx)  // this checksum empty          return false      @0x1d1f87..0x1d1f8a
   *   if (other->buffer  == null)                      return false      @0x1d1f8c..0x1d1f91
   *   rax = other->checksumBegin
   *   rcx = other->checksumEnd
   *   if (rax == rcx)  // other checksum empty         return false      @0x1d1f9b..0x1d1f9e
   *   if ((rdx - rdi) != (rcx - rax)) return false                       @0x1d1fa0..0x1d1fa9
   *   return memcmp(this.begin, other.begin, size) == 0;                 @0x1d1fb2..0x1d1fbd
   *
   * Note: the asm does NOT compare buffer bytes — it only compares the
   * *checksum* byte vector, which is the point of storing a checksum.
   */
  IsEqual(other: HGColorConformLook3DLUT | null): boolean {
    if (other === null) return false;                             // @0x1d1f70..0x1d1f73
    if (this.buffer === null) return false;                       // @0x1d1f75..0x1d1f7a
    if (this._checksumLen === 0) return false;                    // @0x1d1f87..0x1d1f8a
    if (other.buffer === null) return false;                      // @0x1d1f8c..0x1d1f91
    if (other._checksumLen === 0) return false;                   // @0x1d1f9b..0x1d1f9e
    if (this._checksumLen !== other._checksumLen) return false;   // @0x1d1fa0..0x1d1fa9
    // memcmp(this.begin, other.begin, len)  (@0x1d1fb2)
    for (let i = 0; i < this._checksumLen; i++) {                 // memcmp body
      if (this.checksum[i] !== other.checksum[i]) return false;
    }
    return true;                                                  // @0x1d1fb7..0x1d1fbd
  }

  /**
   * Copy constructor @Helium 0x1d1880 (C2).
   *
   * Sequence (asm-faithful):
   *   HGObject::HGObject()                                        @0x1d1890
   *   vtable install (leaq +0x10, into (*this))                   @0x1d1895..0x1d189c
   *   this->buffer = null                                         @0x1d189f
   *   this->checksum = empty (begin/end/cap_end = 0)              @0x1d18a7..0x1d18b2
   *   if (other->buffer != null) {
   *     this->buffer = other->buffer                              @0x1d18c3
   *     CFRetain(other->buffer)                                   @0x1d18c7
   *   }
   *   // one movsd copies 8 bytes from +0x18 -> scale/offset       @0x1d18cc..0x1d18d2
   *   this->scale  = other->scale                                  @0x1d18cc..0x1d18d2
   *   this->offset = other->offset
   *   // one movups copies 16 bytes from +0x20 -> size0/size1      @0x1d18d7..0x1d18dc
   *   this->size0  = other->size0
   *   this->size1  = other->size1
   *   this->size2  = other->size2                                  @0x1d18e0..0x1d18e4
   *   this->flag       = other->flag                               @0x1d18e8..0x1d18ed
   *   this->lutEndian  = other->lutEndian                          @0x1d18f0..0x1d18f4
   *   // std::vector::__assign_with_size(begin, end, len)         @0x1d1905..0x1d190d
   *   this->checksum = copyOf(other->checksum[0..len])
   *   // movups copies 16 bytes from +0x58 -> range params         @0x1d1912..0x1d1917
   *   this->rangeScale/Offset/Min/Max = other's
   *   this->rangeIsIdentity  = other->rangeIsIdentity              @0x1d191b..0x1d1920
   *   this->colorPrimaries + transferFunction (8 bytes @+0x6c)     @0x1d1923..0x1d1927
   */
  static from(other: HGColorConformLook3DLUT): HGColorConformLook3DLUT {
    const c = new HGColorConformLook3DLUT();                       // HGObject::HGObject + vtable + zero-init
    c.buffer = null;                                               // @0x1d189f
    // CFData retain if source has one (@0x1d18ba..0x1d18cc).
    if (other.buffer !== null) {
      c.buffer = other.buffer;                                     // @0x1d18c3
      // CFRetain(other.buffer) @0x1d18c7 — no-op in JS reference model.
    }
    c.scale        = other.scale;                                  // @0x1d18cc..0x1d18d2
    c.offset       = other.offset;
    c.size0        = other.size0;                                  // @0x1d18d7..0x1d18dc
    c.size1        = other.size1;
    c.size2        = other.size2;                                  // @0x1d18e0..0x1d18e4
    c.flag         = other.flag;                                   // @0x1d18e8..0x1d18ed
    c.lutEndian    = other.lutEndian;                              // @0x1d18f0..0x1d18f4
    // std::vector<uint8_t>::__assign_with_size(begin, end, len) @0x1d190d
    // — copy exactly `len` bytes from other's checksum begin.
    if (other._checksumLen > 0) {
      c.checksum = new Uint8Array(other._checksumLen);
      c.checksum.set(other.checksum.subarray(0, other._checksumLen), 0);
      c._checksumLen = other._checksumLen;
    } else {
      c.checksum = new Uint8Array(0);
      c._checksumLen = 0;
    }
    // 16-byte block copy @0x1d1912..0x1d1917 -> +0x58..+0x67.
    c.rangeScale       = other.rangeScale;
    c.rangeOffset      = other.rangeOffset;
    c.rangeMin         = other.rangeMin;
    c.rangeMax         = other.rangeMax;
    c.rangeIsIdentity  = other.rangeIsIdentity;                    // @0x1d191b..0x1d1920
    c.colorPrimaries   = other.colorPrimaries;                     // @0x1d1923..0x1d1927 (low half)
    c.transferFunction = other.transferFunction;                   // @0x1d1923..0x1d1927 (high half)
    return c;
  }

  /**
   * Main parameterized constructor @Helium 0x1d19b0 (C2 param). The C1 thunk
   * @0x1c9840 tail-calls this. Signature (from mangled name):
   *   (HGColorGamma::hgColorGammaColorPrimaries primaries,      // esi (u32)
   *    HGColorGamma::hgColorGammaTransferFunction transferFn,   // edx (u32)
   *    __CFData const* buffer,                                  // rcx
   *    unsigned long size0,                                     // r8
   *    unsigned long size1,                                     // r9
   *    unsigned long size2,                                     // stack +0x10
   *    float f0,                                                // xmm0
   *    float f1,                                                // xmm1
   *    float f2,                                                // xmm2 (numerator for ratio)
   *    bool  flag,                                              // stack +0x18 (0/1)
   *    HGColorConform::hgLookLUTEndian endian,                  // stack +0x20
   *    unsigned char* checksumSrc,                              // stack +0x28
   *    unsigned long  checksumSize,                             // stack +0x30
   *    float rMin,                                              // xmm3 (rangeMin candidate)
   *    float rMaxRatioDenom,                                    // xmm4 (rangeScale;  see below)
   *    float rOffset,                                           // xmm5 (rangeOffset)
   *    float rMax)                                              // xmm6 (rangeMax)
   *
   * Sequence (asm-faithful):
   *   spill xmm0..6 to red-zone slots                     @0x1d19c1..0x1d19df
   *   HGObject::HGObject()                                @0x1d19f6
   *   vtable install +0x10                                @0x1d19fb..0x1d1a02
   *   +0x10 = null                                        @0x1d1a05
   *   +0x40..+0x50 = {0,0,0}                              @0x1d1a15..0x1d1a1c
   *   if (buffer != null) {
   *     this->buffer = buffer                             @0x1d1a2d
   *     CFRetain(buffer)                                  @0x1d1a34
   *   }
   *   this->scale  = xmm1 (f1) via -0x30(%rbp)            @0x1d1a5e
   *   this->offset = xmm0 (f0) via -0x44(%rbp)            @0x1d1a63
   *
   * BUT WAIT — look carefully at the asm:
   *       movss -0x30(%rbp), %xmm0       ; xmm0 = f1
   *       movss -0x44(%rbp), %xmm1       ; xmm1 = f0
   *       ...
   *       movss %xmm1, 0x18(%rsi)        ; +0x18 = f0
   *       movss %xmm0, 0x1c(%rsi)        ; +0x1c = f1
   *   Ie. +0x18 gets f0 (xmm0 original), +0x1c gets f1 (xmm1 original). Good.
   *
   *   this->size0 = r8                                    @0x1d1a68
   *   this->size1 = r9                                    @0x1d1a6f
   *   this->size2 = stack[+0x10]                          @0x1d1a73
   *   this->flag       = stack[+0x18] (bool)              @0x1d1a77
   *   this->lutEndian  = stack[+0x20] (u32)               @0x1d1a7a
   *   // note: 0x48 already contains ptr to +0x40 baseline (zero) — this is
   *   // the vector's "end" pointer, kept in %r12 (initialized from +0x40).
   *   // Actually r12 = *(+0x40) = null, then r12 is assigned to 0x48(rsi).
   *
   *   if (checksumSize @ stack[+0x30] != 0)               @0x1d1a81..0x1d1a86
   *     // append `checksumSize` bytes from checksumSrc using the same
   *     // grow-if-needed loop as SetChecksum (identical body)
   *
   *   // Range/identity computation:
   *   if (rMaxRatioDenom @xmm4/-0x48 == 0) {
   *     goto compute-with-1-scale (write f0 as rangeScale)  @0x1d1c14
   *   } else if (rMax? @xmm3/-0x40 == 0) {
   *     rangeScale = xmm4 verbatim                          @0x1d1c03
   *   } else {
   *     // rangeScale = (65535.0 / -0x48) * -0x40  (all f32 via cvtss2sd/mul/cvtsd2ss)
   *     xmm2 = 65535.0 (@Helium 0x85EFA0, movsd)            @0x1d1b9b
   *     xmm2 /= xmm4                                        @0x1d1ba3
   *     xmm2 *= xmm3                                        @0x1d1ba7
   *     xmm5 = (float)xmm2                                  @0x1d1bab
   *
   *     // rangeIsIdentity computed from (xmm4-input == 0, xmm5 == 1.0f, rOffset >= -FLT_MAX, rMax <= +FLT_MAX)
   *     xmm0 = cmpeqss(xmm4, 0)                             @0x1d1bb7  <-- xmm4 was xmm4 arg = f (arg 15)
   *     xmm1 = cmpeqss(xmm5, 1.0f @0x3C7CC0)                @0x1d1bc4
   *     xmm1 &= xmm0                                        @0x1d1bc9
   *     ecx = movd(xmm1)
   *     xmm0 = +FLT_MAX  @0x3CB6B0                          @0x1d1bd0
   *     xmm0 = cmpless(xmm0, xmm2 = rMax @-0x3c)            @0x1d1bdd
   *     xmm1 = xmm3 (rangeOffset @-0x38)
   *     xmm1 = cmpless(xmm1, -FLT_MAX @0x3CD1F4)            @0x1d1bea
   *     xmm1 &= xmm0
   *     eax = movd(xmm1); eax &= ecx & 1                    @0x1d1bfd..0x1d1c01
   *     xmm0 = xmm5 (the newly-computed rangeScale)
   *   }
   *   this->rangeScale  = xmm0                              @0x1d1c28
   *   this->rangeOffset = xmm4 (was xmm4-arg)               @0x1d1c2e
   *   this->rangeMax    = xmm3-arg                          @0x1d1c34
   *   this->rangeMin    = xmm2-arg (was xmm2 = rMax-in)     @0x1d1c3a
   *   this->rangeIsIdentity = al (bool from above)          @0x1d1c40
   *   this->colorPrimaries   = primaries  (stack -0x5c)     @0x1d1c44..0x1d1c47
   *   this->transferFunction = transferFn (stack -0x60)     @0x1d1c4b..0x1d1c4e
   *
   * NOTE ON XMM REGISTER MAPPING: because of the way the compiler shuffles
   * registers, tracking "which named arg lands where" required following the
   * spill slots. The four range-params store as:
   *   +0x58 = rangeScale   = (65535.0 / arg[16-2]) * arg[16-1]   if both non-zero
   *                        = arg[16-1]                            if only "denom" (arg[16-2]) is 0
   *                        = arg[16-2]                            if only "num"   (arg[16-1]) is 0 & arg[16-2] != 0
   *   +0x5c = rangeOffset  = arg[16-2]  (rMaxRatioDenom slot)
   *   +0x60 = rangeMax     = arg[16]     (rMax)
   *   +0x64 = rangeMin     = arg[16-3]  (rMin — wait, that's -0x3c below...
   *
   * The exact "which xmm arg maps to which name" is ambiguous at the C++
   * level without a matching header — we lean on the numeric identity of
   * the STORES: +0x58 = computed scale; +0x5c/+0x60/+0x64 = the three
   * remaining floats in the order the asm stores them. Callers of this ctor
   * (from Preset or SetLook3DLutConversion) will drive parity.
   */
  static create(
    primaries: HGColorGammaColorPrimaries,
    transferFn: HGColorGammaTransferFunction,
    buffer: unknown /* CFDataRef */ | null,
    size0: bigint | number,
    size1: bigint | number,
    size2: bigint | number,
    f0: number,
    f1: number,
    f2: number,
    flag: boolean,
    endian: HGLookLUTEndian,
    checksumSrc: Uint8Array | null,
    checksumSize: number,
    r_xmm3: number,
    r_xmm4: number,
    r_xmm5: number,
    r_xmm6: number
  ): HGColorConformLook3DLUT {
    const c = new HGColorConformLook3DLUT();                        // HGObject::HGObject + vtable + zero-init
    // Buffer install with CFRetain if non-null (@0x1d1a24..0x1d1a3d).
    if (buffer !== null) {
      c.buffer = buffer;                                            // @0x1d1a2d
      // CFRetain(buffer) @0x1d1a34 — no-op in JS reference model.
    } else {
      c.buffer = null;
    }
    // +0x18 = f0 (xmm0 arg); +0x1c = f1 (xmm1 arg). @0x1d1a5e..0x1d1a63.
    c.scale  = Math.fround(f0);
    c.offset = Math.fround(f1);
    // +0x20 = size0; +0x28 = size1; +0x30 = size2. @0x1d1a68..0x1d1a73.
    c.size0 = typeof size0 === "bigint" ? size0 : BigInt(size0);
    c.size1 = typeof size1 === "bigint" ? size1 : BigInt(size1);
    c.size2 = typeof size2 === "bigint" ? size2 : BigInt(size2);
    // +0x38 = flag; +0x3c = endian. @0x1d1a77..0x1d1a7a.
    c.flag = !!flag;
    c.lutEndian = endian >>> 0;
    // Checksum vector: append `checksumSize` bytes from `checksumSrc`
    // through the same grow-if-needed path as SetChecksum (@0x1d1a81..0x1d1b67).
    // The asm here duplicates the SetChecksum loop verbatim; we call it.
    if (checksumSize !== 0 && checksumSrc !== null) {
      c.SetChecksum(checksumSrc, checksumSize);
    }

    // ---- Range / identity computation (@0x1d1b67..0x1d1c40).
    //
    // Track the register mapping used by the asm precisely:
    //   -0x48 spill  <- xmm2 arg  (f2)          <-- I called this r_xmm2 = f2
    //   -0x40 spill  <- xmm3 arg  (r_xmm3)
    //   -0x34 spill  <- xmm4 arg  (r_xmm4)
    //   -0x38 spill  <- xmm5 arg  (r_xmm5)
    //   -0x3c spill  <- xmm6 arg  (r_xmm6)
    //   -0x44 spill  <- xmm0 arg  (f0)
    //   -0x30 spill  <- xmm1 arg  (f1)
    //
    // Compare-with-zero flow:
    //   ucomiss xmm0(=0), xmm1(loaded from -0x48 = f2)    @0x1d1b6f
    //     jne/jnp taken (i.e. f2 != 0 & ordered) -> continue to next check
    //     otherwise fall through to "goto 0x1d1c14" branch
    //   ucomiss xmm0(=0), xmm1(loaded from -0x40 = r_xmm3)  @0x1d1b81
    //     jne/jnp taken (r_xmm3 != 0 & ordered) -> compute divide branch @0x1d1b8b
    //     otherwise -> "0x1d1c03" branch (r_xmm3 == 0)
    //
    // Branch @0x1d1c14 (f2 == 0):
    //   xmm4=r_xmm4, xmm3=r_xmm5, xmm2=r_xmm6 loaded from spills
    //   xmm0 = -0x40 = r_xmm3 spill
    //   -> stored +0x58 = r_xmm3 as the "scale"
    //
    // Branch @0x1d1c03 (f2 != 0 but r_xmm3 == 0):
    //   xmm4=r_xmm4, xmm3=r_xmm5, xmm2=r_xmm6 loaded
    //   xmm0 preserved (was xmm1 which was r_xmm3 -- but here r_xmm3=0 anyway)
    //   -> stored +0x58 = 0.0f  (equivalently the r_xmm3 argument which is 0)
    //
    // Divide branch (f2 != 0 && r_xmm3 != 0):
    //   xmm2 = 65535.0 (@0x85EFA0)                          @0x1d1b9b
    //   xmm2 /= (double)f2                                  @0x1d1ba3
    //   xmm2 *= (double)r_xmm3                              @0x1d1ba7
    //   xmm5 = (float)xmm2                                  @0x1d1bab
    //   +0x58 = xmm5 (the computed float)
    //
    //   Then the "identity" flag:
    //     xmm0 = cmpeqss(r_xmm4, 0)                          @0x1d1bb7 (via -0x34 spill)
    //     xmm1 = cmpeqss(xmm5, 1.0f @0x3C7CC0)               @0x1d1bc4
    //     xmm1 &= xmm0
    //     ecx = movd(xmm1)  -> ecx is 0xFFFFFFFF or 0
    //     xmm0 = +FLT_MAX (@0x3CB6B0)                        @0x1d1bd0
    //     xmm0 = cmpless(xmm0, r_xmm6)     ; i.e. +FLT_MAX <= r_xmm6 -> true iff r_xmm6 >= +FLT_MAX
    //         (nb: cmpless src, dst is "dst = (dst <= src)?", so with dst=xmm0=+FLT_MAX
    //          and src=r_xmm6, we compute "+FLT_MAX <= r_xmm6" == "r_xmm6 >= +FLT_MAX"
    //          i.e. r_xmm6 is +infinity or +FLT_MAX)
    //     xmm1 = r_xmm5
    //     xmm1 = cmpless(xmm1, -FLT_MAX @0x3CD1F4)           @0x1d1bea
    //         ; "r_xmm5 <= -FLT_MAX" -> true iff r_xmm5 == -FLT_MAX or -inf
    //     xmm1 &= xmm0
    //     eax = movd(xmm1)
    //     al = (ecx & eax) & 1   ; bool of "r_xmm4==0 && scale==1.0 && r_xmm6>=+FLT_MAX && r_xmm5<=-FLT_MAX"
    //     xmm0 = xmm5 (scale)
    //
    // Final stores (@0x1d1c28..0x1d1c40):
    //     +0x58 = xmm0 (the computed scale)
    //     +0x5c = xmm4 (loaded from -0x34; r_xmm4)
    //     +0x60 = xmm3 (loaded from -0x38; r_xmm5)
    //     +0x64 = xmm2 (loaded from -0x3c; r_xmm6)
    //     +0x68 = al (bool)

    // Reproduce the branching structure faithfully.
    //
    // Guard NaN-orderedness by using !== for the "!=0" tests (SSE ucomiss
    // sets PF on unordered; the je/jnp pair takes the "0 or unordered"
    // path only if xmm1==xmm0 AND ordered). We match by checking exact
    // float equality, which for the well-defined "==0" comparison is the
    // same behaviour as ucomiss.
    let scaleOut: number;
    let identityFlag = false;
    const zerof = Math.fround(0.0);

    if (Math.fround(f2) === zerof) {                                // @0x1d1b76 fall-through
      // Branch @0x1d1c14: +0x58 = r_xmm3 verbatim.
      scaleOut = Math.fround(r_xmm3);
      // identityFlag remains false (al was not modified along this path;
      // it defaults to 1 set at @0x1d1b72 movb $0x1,%al — see next comment).
      // BUT: the asm at @0x1d1b72 sets `movb $0x1, %al` UNCONDITIONALLY before
      // the branch. Then @0x1d1b74 `jne 0x1d1b7c` and @0x1d1b76 `jnp 0x1d1c14`
      // — the "goto 0x1d1c14" path leaves al = 1. So identityFlag = true here.
      identityFlag = true;                                          // @0x1d1b72 movb $0x1,%al
    } else if (Math.fround(r_xmm3) === zerof) {                     // @0x1d1b84 fall-through
      // Branch @0x1d1c03: +0x58 = xmm0 which at that point is xmm1 = r_xmm3
      // (see movaps xmm1, xmm0 @0x1d1b84). r_xmm3 == 0 on this path.
      scaleOut = Math.fround(r_xmm3);                               // 0.0f
      // al again = 1 from the earlier unconditional set.
      identityFlag = true;
    } else {
      // Divide branch @0x1d1b8b..0x1d1bff.
      const ratio_d = (CTOR_RATIO_NUM / Math.fround(f2)) * Math.fround(r_xmm3); // double, @0x1d1b9b..0x1d1ba7
      scaleOut = Math.fround(ratio_d);                              // @0x1d1bab cvtsd2ss

      const cmpEq_r_xmm4_zero   = (Math.fround(r_xmm4) === zerof);  // cmpeqss xmm4,0 @0x1d1bb7
      const cmpEq_scale_one     = (scaleOut === Math.fround(1.0));  // cmpeqss xmm5,1.0 @0x1d1bc4  (const @0x3C7CC0)
      const ecx_true            = cmpEq_r_xmm4_zero && cmpEq_scale_one; // and @0x1d1bc9

      const cmpLE_fltmaxpos_r6  = (PARAM_CTOR_FLT_MAX_POS <= Math.fround(r_xmm6)); // cmpless +FLT_MAX,r_xmm6 @0x1d1bdd
      const cmpLE_r5_fltmaxneg  = (Math.fround(r_xmm5)  <= PARAM_CTOR_FLT_MAX_NEG); // cmpless r_xmm5,-FLT_MAX @0x1d1bea
      const eax_true            = cmpLE_fltmaxpos_r6 && cmpLE_r5_fltmaxneg;

      identityFlag = ecx_true && eax_true;                          // andl+andb $0x1,%al @0x1d1bfd..0x1d1bff
    }

    // Final stores (@0x1d1c28..0x1d1c40) in the exact order and register
    // mapping the asm uses.
    c.rangeScale       = scaleOut;                                  // +0x58
    c.rangeOffset      = Math.fround(r_xmm4);                       // +0x5c (from -0x34 spill)
    c.rangeMax         = Math.fround(r_xmm5);                       // +0x60 (from -0x38 spill)
    c.rangeMin         = Math.fround(r_xmm6);                       // +0x64 (from -0x3c spill)
    c.rangeIsIdentity  = identityFlag;                              // +0x68
    c.colorPrimaries   = primaries >>> 0;                           // +0x6c @0x1d1c44..0x1d1c47
    c.transferFunction = transferFn >>> 0;                          // +0x70 @0x1d1c4b..0x1d1c4e
    return c;
  }

  /**
   * Preset constructor @Helium 0x106e50 — deferred (see stub above). Callers
   * must not reach this until the NSBundle-backed preset table is decoded.
   */
  static fromPreset(preset: number): HGColorConformLook3DLUT {
    return HGColorConformLook3DLUT_PresetCtor_stub(preset);
  }

  /**
   * `HGColorConformLook3DLUT::~HGColorConformLook3DLUT()` D2 @Helium 0x1d1e50.
   *
   * Sequence:
   *   reinstall vtable pointer                                     @0x1d1e59..0x1d1e60
   *   if (buffer != null) CFRelease(buffer)                        @0x1d1e63..0x1d1e6c
   *   if (checksumBegin != null) operator delete(checksumBegin)    @0x1d1e71..0x1d1e7e
   *   tail-jmp HGObject::~HGObject()                               @0x1d1e8c
   *
   * D1 @0x1d1ea0 and D0 @0x1d1ef0 have the same body (D0 additionally calls
   * HGObject::operator delete(void*) at the tail after HGObject::~HGObject).
   */
  destruct(): void {
    // Vtable reinstall is a no-op in JS. @0x1d1e59..0x1d1e60.
    if (this.buffer !== null) {
      // CFRelease(this.buffer) @0x1d1e6c — modelled as reference drop.
      this.buffer = null;
    }
    // operator delete(checksumBegin) @0x1d1e7e — modelled as GC drop.
    this.checksum = new Uint8Array(0);
    this._checksumLen = 0;
    // HGObject::~HGObject tail-jmp @0x1d1e8c — HGObject has no owned
    // resources beyond the refcount, so this is a no-op in JS.
  }
}
