// raw-port/src/render/HGColorConformLUTData.ts
//
// FCP `HGColorConformLUTData` — Helium heap-owned byte buffer used as a
// LUT payload during color-conform (a size + tagged HGFormat + raw bytes,
// heap-allocated via new[] and owned by the object).
//
// Symbols (Helium framework, x86_64 slice; disasm from otool -tV):
//   0x1c9da0  HGColorConformLUTData::getBytePtr()                                 [returns +0x18]
//   0x1d0cb0  HGColorConformLUTData::copy(unsigned char const*, unsigned long,
//                                        bool, unsigned long)                    [dual-mode blit]
//   0x1d1fd0  HGColorConformLUTData::HGColorConformLUTData(unsigned long, HGFormat)  [C2]
//   0x1d2030  HGColorConformLUTData::HGColorConformLUTData(unsigned long, HGFormat)  [C1 — identical body]
//   0x1d2090  HGColorConformLUTData::~HGColorConformLUTData()                    [D2]
//   0x1d20d0  HGColorConformLUTData::~HGColorConformLUTData()                    [D1 — identical body]
//   0x1d2110  HGColorConformLUTData::~HGColorConformLUTData()                    [D0 deleting dtor]
//   0x1d2150  HGColorConformLUTData::getConstBytePtr()                           [returns +0x18]
//   0x1d2160  HGColorConformLUTData::getFormat()                                 [returns u32 @+0x20]
//
// Vtable @Helium 0xa29f68 (installed-ptr 0xa29f78):
//   *0x00 -> 0x1d20d0  ~HGColorConformLUTData()  [D1]
//   *0x08 -> 0x1d2110  ~HGColorConformLUTData()  [D0]
//   (Only two slots — same shape as HGObject's vtable.)
//
// LAYOUT (recovered from ctor + accessors + dtors, all agree):
//   +0x00 : void*         vtable   (installed = 0xa29f78, from ctor @0x1d2048)
//   +0x08 : u32           refCount (HGObject base, initialized to 1 by HGObject::HGObject)
//   +0x0c : ...           HGObject base padding to 0x10
//   +0x10 : unsigned long size     (payload size in bytes, arg1 to ctor; @0x1d2052)
//   +0x18 : unsigned char* bytes   (heap buffer of `size` bytes allocated with new[];
//                                   set from operator new[] @0x1d2062; freed via
//                                   __ZdaPv in D2 @0x1d20af)
//   +0x20 : u32           format   (HGFormat enum, arg2 to ctor; @0x1d2056)
//
// DECODE-DON'T-FIT: every method transcribed here mirrors its asm exactly.
// The bytes buffer is modeled as `Uint8Array` (a heap-allocated byte array in
// the C++ = a Uint8Array in TS); the ownership contract from D2 is preserved
// by releasing the reference in destruct().
//
// Callees / cross-refs (undecoded — stubbed with cited addresses):
//   __ZN13HGFormatUtils13bytesPerPixelE8HGFormat   HGFormatUtils::bytesPerPixel(HGFormat)  @Helium 0xe5687
//   __Znam                                          operator new[](size_t)                  [platform, tail-called from ctor]
//   __ZdaPv                                         operator delete[](void*)                [platform, tail-called from D2/D1/D0]
//   __memcpy                                        (platform, tail-jmp from copy)
//   __ZN8HGObjectC2Ev / __ZN8HGObjectD2Ev           HGObject base ctor/dtor — REAL, imported below.
//   __ZN8HGObjectdlEPv                              HGObject::operator delete(void*)        @Helium 0x1a0f10 (real, imported).

import { HGObject } from "./HGObject";

/**
 * Undecoded shim for `HGFormatUtils::bytesPerPixel(HGFormat)` @Helium 0xe5687.
 * The copy(...) float path relies on this to compute the destination stride;
 * we cannot invent the mapping (HGFormat -> bytes-per-pixel table is
 * data-driven from another Helium function which is not yet transcribed).
 * Any caller entering the float path will throw here — the correct signal.
 */
function HGFormatUtils_bytesPerPixel_stub(_fmt: number): number {
  throw new Error(
    "HGFormatUtils::bytesPerPixel(HGFormat) @Helium 0xe5687 not yet transcribed " +
    "(referenced from HGColorConformLUTData::copy @Helium 0x1d0cd1)"
  );
}

/**
 * `HGColorConformLUTData` — Helium heap-owned byte buffer for a color-conform LUT.
 *
 * Extends `HGObject` (real base, imported from ./HGObject). The observable
 * layout adds three fields past the HGObject header:
 *   `size`   — u64 length in bytes of the payload buffer;
 *   `bytes`  — the heap-allocated payload buffer (new[]/delete[]);
 *   `format` — u32 `HGFormat` enum tag (kept for downstream color-space use).
 */
export class HGColorConformLUTData extends HGObject {
  /**
   * Payload size in bytes. Set from ctor arg1 (@0x1d2052:
   *   `movq %r15, 0x10(%rbx)` — r15 was ctor arg1 rsi).
   * D2 zeroes it (@0x1d20c0: `movups %xmm0, 0x10(%rdi)` — 16 zero bytes over
   *  the size/bytes pair).
   */
  size: number;

  /**
   * Heap-allocated byte buffer of length `size`. Set from ctor @0x1d2062
   * (`callq __Znam` with rdi=size; rax stored to 0x18(%rbx)). Freed in D2
   * @0x1d20af via `callq __ZdaPv` iff non-null (test at @0x1d209e).
   *
   * TS models this as a Uint8Array. `null` means "already freed" (post-D2),
   * mirroring the `movq $0, 0x18(%rdi)` implicit clear in D2's xorps store.
   */
  bytes: Uint8Array | null;

  /**
   * `HGFormat` enum value at struct offset 0x20. Set from ctor @0x1d2056
   * (`movl %r14d, 0x20(%rbx)` — r14d = ctor arg2 edx zero-extended).
   */
  format: number;

  /**
   * `HGColorConformLUTData::HGColorConformLUTData(unsigned long size, HGFormat fmt)`
   * — Helium @0x1d1fd0 (C2) / @0x1d2030 (C1) [byte-identical bodies].
   *
   * Disasm (C1 @0x1d2030 — the C2 differs only by its RIP offset for the
   * vtable install; both target 0xa29f78):
   *   0x1d2043: callq __ZN8HGObjectC2Ev            ; HGObject::HGObject()
   *   0x1d2048: leaq  0x857f29(%rip), %rax         ; = 0xa29f78 (this vtable)
   *   0x1d204f: movq  %rax, (%rbx)                 ; *this = vtable
   *   0x1d2052: movq  %r15, 0x10(%rbx)             ; this->size = size
   *   0x1d2056: movl  %r14d, 0x20(%rbx)            ; this->format = fmt
   *   0x1d205a: movq  %r15, %rdi                   ; rdi = size
   *   0x1d205d: callq __Znam                       ; operator new[](size)
   *   0x1d2062: movq  %rax, 0x18(%rbx)             ; this->bytes = allocation
   *   0x1d2066: <epilogue>
   *
   * There is an unwind edge @0x1d2071 (`__Unwind_Resume`) which is only
   * taken if `operator new[]` throws; in TS `new Uint8Array(size)` throws
   * a RangeError for invalid sizes, so the observable semantics match.
   */
  constructor(size: number, fmt: number) {
    // @0x1d2043 — HGObject base ctor.
    super();
    // @0x1d204f — install this-class vtable (target 0xa29f78).
    this.vtable = 0xa29f78;
    // @0x1d2052
    this.size = size;
    // @0x1d2056 — u32 format
    this.format = fmt >>> 0;
    // @0x1d205d — operator new[](size). Uninitialized bytes in C++;
    // Uint8Array is zero-filled. This is a deviation forced by the JS runtime
    // (there is no observable API to obtain uninitialized memory here); a
    // read of unwritten bytes in C++ would already be undefined behavior.
    // @0x1d2062 — store into this->bytes.
    this.bytes = new Uint8Array(size);
  }

  /**
   * `HGColorConformLUTData::~HGColorConformLUTData()` — Helium @0x1d2090 (D2)
   * / @0x1d20d0 (D1) [byte-identical bodies].
   *
   * Disasm (D2 @0x1d2090):
   *   0x1d2090: leaq 0x857ee1(%rip), %rax  ; = 0xa29f78 (re-install this vtable)
   *   0x1d2097: movq %rax, (%rdi)
   *   0x1d209a: movq 0x18(%rdi), %rax      ; rax = this->bytes
   *   0x1d209e: testq %rax, %rax
   *   0x1d20a1: je   0x1d20bd              ; skip delete if null
   *   0x1d20af: callq __ZdaPv              ; ::operator delete[](this->bytes)
   *   0x1d20bd: xorps %xmm0, %xmm0
   *   0x1d20c0: movups %xmm0, 0x10(%rdi)   ; zero size + bytes fields (16 bytes)
   *   0x1d20c4: jmp __ZN8HGObjectD2Ev      ; tail-jmp HGObject base dtor
   *
   * TS: we drop the Uint8Array reference (no explicit free — the GC handles
   * it) and zero the two owned fields, mirroring the observable end-state.
   * Note format @+0x20 is NOT zeroed by D2/D1 — mirror that.
   */
  destruct(): void {
    // @0x1d2097 — re-install vtable pointer.
    this.vtable = 0xa29f78;
    // @0x1d20a1 — skip delete when bytes is null; otherwise release it.
    // (In TS, dropping the reference is the equivalent of operator delete[].)
    if (this.bytes !== null) {
      // @0x1d20af — __ZdaPv (::operator delete[])
      this.bytes = null;
    }
    // @0x1d20c0 — zero the 16 bytes at +0x10 (size + bytes-ptr).
    this.size = 0;
    this.bytes = null;
    // @0x1d20c4 — chain into HGObject::~HGObject().
    super.destruct();
  }

  /**
   * `HGColorConformLUTData::~HGColorConformLUTData()` [D0 deleting dtor]
   * — Helium @0x1d2110.
   *
   * Disasm:
   *   0x1d2119: leaq 0x857e58(%rip), %rax   ; = 0xa29f78 (re-install this vtable)
   *   0x1d2120: movq %rax, (%rdi)
   *   0x1d2123: movq 0x18(%rdi), %rdi       ; rdi = this->bytes
   *   0x1d2127: testq %rdi, %rdi
   *   0x1d212a: je   0x1d2131
   *   0x1d212c: callq __ZdaPv               ; delete[] this->bytes
   *   0x1d2131: xorps %xmm0, %xmm0
   *   0x1d2134: movups %xmm0, 0x10(%rbx)    ; zero size + bytes
   *   0x1d213b: callq __ZN8HGObjectD2Ev     ; HGObject::~HGObject()
   *   0x1d2149: jmp   __ZN8HGObjectdlEPv    ; HGObject::operator delete(this)
   *
   * Called via vtable slot *0x8 from HGObject::Release() when refCount hits
   * zero. TS: identical body to destruct() with the trailing operator delete
   * modeled as a no-op (GC), mirroring the pattern used in HGObject.deleteDtor.
   */
  deleteDtor(): void {
    // @0x1d2120 — re-install vtable pointer.
    this.vtable = 0xa29f78;
    // @0x1d212a — skip delete when bytes is null; otherwise __ZdaPv.
    if (this.bytes !== null) {
      // @0x1d212c — ::operator delete[](this->bytes)
      this.bytes = null;
    }
    // @0x1d2134 — zero size + bytes fields.
    this.size = 0;
    this.bytes = null;
    // @0x1d213b — HGObject base dtor.
    super.destruct();
    // @0x1d2149 — tail-jmp HGObject::operator delete(this) — no-op in GC.
  }

  /**
   * `HGColorConformLUTData::getBytePtr()` — Helium @0x1c9da0.
   *
   * Disasm:
   *   0x1c9da4: movq 0x18(%rdi), %rax   ; return this->bytes
   *   0x1c9da9: retq
   *
   * Returns the raw payload pointer; TS returns the Uint8Array reference.
   */
  getBytePtr(): Uint8Array | null {
    // @0x1c9da4 — load this->bytes @+0x18.
    return this.bytes;
  }

  /**
   * `HGColorConformLUTData::getConstBytePtr()` — Helium @0x1d2150.
   *
   * Byte-identical body to getBytePtr — same load of this->bytes @+0x18.
   *   0x1d2154: movq 0x18(%rdi), %rax
   *   0x1d2159: retq
   */
  getConstBytePtr(): Uint8Array | null {
    // @0x1d2154 — load this->bytes @+0x18.
    return this.bytes;
  }

  /**
   * `HGColorConformLUTData::getFormat()` — Helium @0x1d2160.
   *
   * Disasm:
   *   0x1d2164: movl 0x20(%rdi), %eax   ; return this->format (u32)
   *   0x1d2168: retq
   */
  getFormat(): number {
    // @0x1d2164 — load this->format @+0x20.
    return this.format;
  }

  /**
   * `HGColorConformLUTData::copy(unsigned char const* src, unsigned long size,
   *                              bool isFloat, unsigned long dstOffset)`
   * — Helium @0x1d0cb0.
   *
   * Dual-mode blit into the owned bytes buffer. The `isFloat` flag switches
   * between a strided float-widen path (each 4-byte input written at 4×
   * offset in the destination — a promote-to-float layout) and a raw
   * memcpy path (paged-tile write).
   *
   * Disasm (annotated exactly as emitted):
   *   0x1d0cb0..0x1d0cbe: prologue; save r14=src, rbx=dstOffset (r8).
   *   0x1d0cc1: testl %ecx, %ecx           ; isFloat?
   *   0x1d0cc3: je    0x1d0d0a             ; -> raw memcpy path
   *   ; --- FLOAT-WIDEN PATH ---
   *   0x1d0cc5: movq  0x18(%rdi), %r15     ; r15 = this->bytes
   *   0x1d0cc9: movq  %rdi, %r12           ; save this
   *   0x1d0ccc: movl  $0x1c, %edi          ; call w/ HGFormat=0x1c (fixed literal)
   *   0x1d0cd1: callq HGFormatUtils::bytesPerPixel(HGFormat)  ; -> eax = bpp
   *   0x1d0cd6: shlq  $0x2, %rbx           ; rbx = dstOffset << 2   (= dstOffset*4)
   *   0x1d0cda: movq  0x10(%r12), %rcx     ; rcx = this->size (loop bound)
   *   0x1d0cdf: cmpq  %rcx, %rbx
   *   0x1d0ce2: jae   0x1d0d18             ; if dstOffset*4 >= size -> ret
   *   0x1d0ce4: movl  %eax, %eax           ; zero-extend bpp to 64-bit
   *   0x1d0ce6: addq  %rbx, %r15           ; dst = this->bytes + dstOffset*4
   *   0x1d0ce9: xorl  %edx, %edx           ; rdx = 0 (src stride index)
   *   .align
   *   0x1d0cf0: addq  %rax, %rbx           ; rbx += bpp   (post-inc loop counter)
   *   0x1d0cf3: movss (%r14,%rdx), %xmm0   ; xmm0 = *(float*)(src + rdx)
   *   0x1d0cf9: movss %xmm0, (%r15,%rdx,4) ; *(float*)(dst + rdx*4) = xmm0
   *   0x1d0cff: addq  $0x4, %rdx
   *   0x1d0d03: cmpq  %rcx, %rbx
   *   0x1d0d06: jb    0x1d0cf0             ; loop while rbx < this->size
   *   0x1d0d08: jmp   0x1d0d18             ; -> ret
   *   ; --- RAW MEMCPY PATH ---
   *   0x1d0d0a: imulq %rdx, %rbx           ; rbx = size * dstOffset
   *   0x1d0d0e: leaq  (%rbx,%rdx), %rax    ; rax = size*dstOffset + size
   *   0x1d0d12: cmpq  0x10(%rdi), %rax     ; > this->size?
   *   0x1d0d16: jbe   0x1d0d21             ; only copy if it fits
   *   0x1d0d18: <epilogue -- return>
   *   0x1d0d21: addq  0x18(%rdi), %rbx     ; rbx = this->bytes + size*dstOffset
   *   0x1d0d25: movq  %rbx, %rdi           ; rdi = dst
   *   0x1d0d28: movq  %r14, %rsi           ; rsi = src
   *   0x1d0d33: jmp   __memcpy             ; memcpy(dst, src, size) — rdx unchanged
   *
   * Provenance for the `HGFormat 0x1c` literal: read directly from
   * @0x1d0ccc (`movl $0x1c, %edi`). No invention.
   */
  copy(src: Uint8Array, size: number, isFloat: boolean, dstOffset: number): void {
    // @0x1d0cc1 — isFloat branch.
    if (isFloat) {
      // @0x1d0cc5 — r15 = this->bytes
      const dst = this.bytes;
      if (dst === null) {
        // C++ would deref a null buffer pointer here; signal loudly.
        throw new Error(
          "HGColorConformLUTData::copy @Helium 0x1d0cc5 — bytes buffer is null"
        );
      }
      // @0x1d0ccc / @0x1d0cd1 — bytesPerPixel(HGFormat=0x1c). UNDECODED — throws.
      // The literal 0x1c is read verbatim from the movl instruction @0x1d0ccc.
      const bpp = HGFormatUtils_bytesPerPixel_stub(0x1c);
      // @0x1d0cd6 — rbx = dstOffset << 2 (initial byte cursor into dst).
      let rbx = (dstOffset >>> 0) * 4;
      // @0x1d0cda — rcx = this->size (loop bound in bytes).
      const bound = this.size;
      // @0x1d0ce2 — early-out if cursor >= bound.
      if (rbx >= bound) {
        return;
      }
      // @0x1d0ce6 — r15 (dst base) advanced by rbx bytes.
      const dstBaseByteOffset = rbx;
      // @0x1d0ce9 — rdx = 0 (index used for both src stride and dst stride).
      let rdx = 0;
      // Views over the underlying byte buffers for single-precision I/O.
      // Both accesses in the loop are 4-byte movss — natively single precision.
      const dstView = new DataView(dst.buffer, dst.byteOffset, dst.byteLength);
      const srcView = new DataView(src.buffer, src.byteOffset, src.byteLength);
      // Float-widen loop @0x1d0cf0 .. @0x1d0d06 — mirrored branch-for-branch:
      //   0x1d0cf0: rbx += bpp
      //   0x1d0cf3: xmm0 = *(float*)(src + rdx)
      //   0x1d0cf9: *(float*)(dst_base + rdx*4) = xmm0    [dst_base = this->bytes + dstOffset*4]
      //   0x1d0cff: rdx += 4
      //   0x1d0d03/06: while (rbx < bound)
      // eslint-disable-next-line no-constant-condition
      while (true) {
        // @0x1d0cf0
        rbx = rbx + bpp;
        // @0x1d0cf3 — movss load (little-endian on x86_64).
        const f = Math.fround(srcView.getFloat32(rdx, true));
        // @0x1d0cf9 — movss store at (r15 + rdx*4).
        dstView.setFloat32(dstBaseByteOffset + rdx * 4, f, true);
        // @0x1d0cff
        rdx += 4;
        // @0x1d0d03/06
        if (rbx >= bound) break;
      }
      // @0x1d0d08 — fall through to epilogue.
      return;
    }
    // --- @0x1d0d0a: RAW MEMCPY PATH ---
    // In this branch the raw asm uses rdx as the second argument = `size`.
    // Mirror: `imulq %rdx, %rbx` = size * dstOffset.
    const totalOffset = (size >>> 0) * (dstOffset >>> 0);
    // @0x1d0d0e — leaq (rbx, rdx), rax : end = totalOffset + size.
    const end = totalOffset + size;
    // @0x1d0d12/16 — copy only if end <= this->size.
    if (end > this.size) {
      // @0x1d0d18 — return without copying.
      return;
    }
    // @0x1d0d21..0x1d0d33 — memcpy(this->bytes + totalOffset, src, size).
    const dst = this.bytes;
    if (dst === null) {
      throw new Error(
        "HGColorConformLUTData::copy @Helium 0x1d0d21 — bytes buffer is null"
      );
    }
    // The tail memcpy copies exactly `size` bytes; Uint8Array.set enforces
    // both source read and destination write bounds and throws RangeError
    // (matching the C++ contract that the caller supplied ≥`size` bytes).
    dst.set(src.subarray(0, size), totalOffset);
  }
}
