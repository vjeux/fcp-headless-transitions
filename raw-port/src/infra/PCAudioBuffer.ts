// raw-port of ProCore C++ class PCAudioBuffer (ctor + 3 dtor variants).
// Source: ProCore.framework (x86_64 slice). Addresses cite the raw file
// offset from `otool -tV -arch x86_64` / `nm -arch x86_64`.
//
// Class layout (36..40 bytes; total 0x38):
//   0x00  void*    vptr                (installed by C2 @0x351c9)
//   0x08  uint64   frames              (arg1, %rsi)
//   0x10  uint32   channels            (arg2, %edx)
//   0x14  uint32   bytesPerSample      (arg3 slot 3, %ecx)     [NOTE: xmm0 is the double]
//   0x18  double   sampleRate          (arg3 slot 2, %xmm0)
//   0x20  uint8    interleaved         (arg4, %r8b — a bool)
//   0x21  uint8    unused              (set to 0 by ctor)
//   0x28  uint64   totalBytes          = frames * channels * bytesPerSample
//   0x30  uint8_t* buffer              = new[](allocSize)
//
// Note: the SysV x86_64 arg ordering for the ctor is
//   `PCAudioBuffer(uint64_t frames, uint32_t channels, double sampleRate,
//                  uint32_t bytesPerSample, bool interleaved)`
// where the double-arg slots in xmm0 while the four integer args go to
// rsi (frames), edx (channels), ecx (bytesPerSample), r8b (interleaved).
// The stored fields at 0x10 / 0x14 / 0x18 are (channels, bytesPerSample,
// sampleRate) in memory order — but the ctor writes them in the source
// order (channels @0x10, bytesPerSample @0x14, sampleRate @0x18).

/**
 * PCAudioBuffer — audio buffer with owned byte storage. Manages a raw
 * `new[]`-allocated buffer sized by `frames * channels * bytesPerSample`,
 * with an interleaved-mode multiplier applied at allocation time.
 *
 * The vtable pointer stored at offset 0x00 by the C++ ctor is an
 * implementation detail of the runtime dispatch model — in TS the
 * equivalent is method dispatch on the class prototype, so we do NOT
 * simulate a vptr field.
 */
export class PCAudioBuffer {
  /** Number of frames.  @0x08 (arg1, rsi).  Stored via movq. */
  readonly frames: bigint;

  /** Channel count.  @0x10 (arg2, edx).  Stored via movl. */
  readonly channels: number;

  /** Bytes per sample.  @0x14 (ecx).  Stored via movl. */
  readonly bytesPerSample: number;

  /** Sample rate (Hz).  @0x18 (xmm0).  Stored via movsd. */
  readonly sampleRate: number;

  /** Interleaved-mode flag.  @0x20 (r8b).  Stored via movb. */
  readonly interleaved: boolean;

  /**
   * @0x28: totalBytes = frames * channels * bytesPerSample.
   * All three inputs are unsigned; the ctor does
   *   rax = channels; imulq rsi = channels * frames      (as u64)
   *   rcx = bytesPerSample (u32 zero-extended)
   *   rcx = rcx * rax = bytesPerSample * channels * frames
   */
  readonly totalBytes: bigint;

  /**
   * @0x30: owned storage. Populated by a single `new uint8_t[allocSize]`
   * call (`__Znam` @0xde6c6 stub) at @0x351bb / @0x3521b. In TS we hold a
   * Uint8Array; freeing is a no-op (GC).
   *
   * Allocation size is a two-branch computation @0x351fa..0x35217 /
   * @0x35266..0x35283:
   *   rcx = totalBytes
   *   rax = rcx >> 62                     ; upper-2-bits test
   *   rdx = rcx * 4                       ; leaq (,%rcx,4)
   *   rdi = 0
   *   neg rax ; sbb rdi, rdi              ; rdi = -1 iff rax != 0, else 0
   *   rdi = rdi | rdx                     ; if rcx*4 would overflow u64,
   *                                       ;   rdi = 0xFFFF..FF (saturate to
   *                                       ;   SIZE_MAX so new[] throws)
   *   test r8d, r8d                       ; interleaved?
   *   cmoveq rcx, rdi                     ; if interleaved==false (ZF=1),
   *                                       ;   rdi = rcx (allocate totalBytes)
   *                                       ; else rdi keeps rcx*4 (saturated)
   * i.e. `allocBytes = interleaved ? saturate_u64(totalBytes * 4) : totalBytes`.
   *
   * The *4 multiplier on the interleaved branch encodes a per-frame
   * float32-wide store layout (4 bytes per sample-slot) that the caller
   * relies on at read/write time; the non-interleaved branch trusts that
   * `bytesPerSample` already fully describes the layout.
   */
  readonly buffer: Uint8Array;

  /**
   * PCAudioBuffer::PCAudioBuffer(uint64_t frames, uint32_t channels,
   *                               double sampleRate, uint32_t bytesPerSample,
   *                               bool interleaved)
   *
   * C2 body @0x351c0..0x3522a (base-object ctor).
   * C1 body @0x3522c..0x35296 (complete-object ctor) — byte-identical to
   * C2 except for the vtable RIP-relative offset (0x114d10 vs 0x114ca4)
   * which resolves to the SAME `__ZTV13PCAudioBuffer+0x10` at final link.
   * Both are cited by `nm -arch x86_64` on the ProCore binary.
   *
   * Asm (@0x351c0/@0x3522c):
   *   leaq   0x114d10(rip), rax    ; rax = &vtable+0x10           @0x351c9
   *   movq   rax, (rdi)            ; this[0x00] = &vtable         @0x351d0
   *   movq   rsi, 0x8(rdi)         ; this[0x08] = frames          @0x351d3
   *   movl   edx, 0x10(rdi)        ; this[0x10] = channels        @0x351d7
   *   movl   ecx, 0x14(rdi)        ; this[0x14] = bytesPerSample  @0x351da
   *   movsd  xmm0, 0x18(rdi)       ; this[0x18] = sampleRate      @0x351dd
   *   movb   r8b, 0x20(rdi)        ; this[0x20] = interleaved     @0x351e2
   *   movb   $0x0, 0x21(rdi)       ; this[0x21] = 0               @0x351e6
   *   movl   edx, eax              ; totalBytes = channels *
   *   imulq  rsi, rax              ;              frames *
   *   movl   ecx, ecx              ; (zero-extend bytesPerSample)
   *   imulq  rax, rcx              ;              bytesPerSample
   *   movq   rcx, 0x28(rdi)        ; this[0x28] = totalBytes      @0x35262
   *   [alloc-size branch above]                                   @0x35266..0x35283
   *   callq  __Znam                ; operator new[](allocBytes)   @0x35287
   *   movq   rax, 0x30(rbx)        ; this[0x30] = buffer          @0x3528c
   */
  constructor(
    frames: bigint,
    channels: number,
    sampleRate: number,
    bytesPerSample: number,
    interleaved: boolean,
  ) {
    // Force integer widths on the u32 fields (matches movl / zero-extension).
    const chU32 = channels >>> 0;
    const bpsU32 = bytesPerSample >>> 0;

    this.frames = BigInt.asUintN(64, frames);
    this.channels = chU32;
    this.bytesPerSample = bpsU32;
    this.sampleRate = sampleRate; // double @0x18
    this.interleaved = !!interleaved;

    // totalBytes = frames * channels * bytesPerSample, all as u64.
    // Mirrors: rax=channels; rax*=rsi(frames); rcx=bpsU32; rcx*=rax.
    const totalBytes = BigInt.asUintN(
      64,
      (this.frames * BigInt(chU32)) * BigInt(bpsU32),
    );
    this.totalBytes = totalBytes;

    // Allocation size: see the field-doc for `buffer` above. We faithfully
    // reproduce the saturating u64 computation from @0x351fa..0x35217.
    let allocBytes: bigint;
    if (this.interleaved) {
      // interleaved: alloc = saturate_u64(totalBytes * 4)
      // Any of the top 2 bits set -> overflow of *4 in u64 -> saturate.
      const upperTwoBits = totalBytes >> 62n;
      if (upperTwoBits !== 0n) {
        allocBytes = (1n << 64n) - 1n; // 0xFFFF..FF (SIZE_MAX)
      } else {
        allocBytes = totalBytes * 4n;
      }
    } else {
      allocBytes = totalBytes;
    }

    // JS TypedArray length is bounded by Number.MAX_SAFE_INTEGER (2^53-1)
    // and, on real engines, by ~2^32-ish. If the saturated allocation
    // asks for more than that, the raw port cannot honor it — new
    // Uint8Array(allocSize) would throw. Preserve the C++ behavior of
    // "new[] throws on huge allocation" by letting the runtime throw.
    if (allocBytes > BigInt(Number.MAX_SAFE_INTEGER)) {
      // Faithful to __Znam @0xde6c6 raising std::bad_alloc for
      // saturated / gigantic requests.
      // (Cited: alloc-size saturate at @0x35211/@0x35217.)
      throw new Error(
        `PCAudioBuffer: allocation size ${allocBytes} exceeds JS TypedArray limit (raw-port of __Znam @0xde6c6 saturating throw @0x35287)`,
      );
    }
    this.buffer = new Uint8Array(Number(allocBytes));
  }

  /**
   * PCAudioBuffer::~PCAudioBuffer()  [D2 base dtor]  @0x35298
   *
   * Asm (@0x35298..0x352b7):
   *   leaq  0x114c3d(rip), rax    ; rax = &vtable+0x10
   *   movq  rax, (rdi)            ; re-install vptr (defensive base-dtor)
   *   movq  0x30(rdi), rdi        ; rdi = this->buffer
   *   testq rdi, rdi              ; if buffer != nullptr
   *   je    0x352b5
   *   jmp   __ZdaPv               ; operator delete[](buffer)     @0xde6ba
   *
   * PCAudioBuffer::~PCAudioBuffer()  [D1 complete dtor]  @0x352b8
   *
   * Asm (@0x352b8..0x352d7): byte-identical to D2 except the vtable RIP
   * offset (0x114c1d — resolves to same __ZTV13PCAudioBuffer+0x10). This
   * is a compiler-emitted alias.
   *
   * In TS/JS the buffer is a Uint8Array owned by GC — there is nothing to
   * free. The dtor becomes a no-op. If callers need to *observe*
   * destruction (e.g. to null out references) they can null out their
   * PCAudioBuffer reference; the underlying storage is then GC-eligible.
   */
  dispose(): void {
    // No-op. Faithful to @0x35298 / @0x352b8, which do nothing beyond
    // (a) reinstalling the vptr (irrelevant to TS) and (b) invoking
    // operator delete[] on this->buffer @0xde6ba — irrelevant in a GC
    // runtime because `this.buffer` is a Uint8Array collected on drop.
  }

  /**
   * PCAudioBuffer::~PCAudioBuffer()  [D0 deleting dtor]  @0x352d8
   *
   * Asm (@0x352d8..0x35302):
   *   leaq  0x114bf8(rip), rax    ; vptr install
   *   movq  rax, (rdi)
   *   movq  0x30(rdi), rdi        ; rdi = buffer
   *   testq rdi, rdi
   *   je    0x352f9
   *   callq __ZdaPv               ; operator delete[](buffer)    @0xde6ba
   *   movq  rbx, rdi              ; rdi = this
   *   jmp   __ZdlPv               ; operator delete(this)        @0xde6c0
   *
   * The extra `operator delete(this)` on top of D1/D2 is the "deleting
   * dtor" variant emitted for virtual-destructor call sites (called via
   * vtable slot 0 when `delete p;` is invoked on a base-pointer). In TS
   * this is exactly the same no-op story as `dispose()` above — the JS
   * engine will collect `this` once no references remain.
   *
   * Provided for API parity with call sites translated from C++
   * `delete p` on a PCAudioBuffer*.
   */
  disposeAndDelete(): void {
    this.dispose();
    // The __ZdlPv @0xde6c0 tail-jmp releases `this` — a no-op in JS.
  }
}
