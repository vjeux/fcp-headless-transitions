// HGCVPixelBuffer.ts — Helium framework (render layer).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//         Versions/A/Helium  (macOS FCP, x86_64 slice).
//
// -----------------------------------------------------------------------------
// SYMBOLS PORTED
// -----------------------------------------------------------------------------
//   * HGCVPixelBuffer::ptr(unsigned long) const   @Helium 0x1e0730
//     __ZNK15HGCVPixelBuffer3ptrEm
//   * HGCVPixelBuffer::lock(bool) const            @Helium 0x1e06f0
//     __ZNK15HGCVPixelBuffer4lockEb
//
// re/disasm:
//   raw-port/re/disasm/Helium.__ZNK15HGCVPixelBuffer3ptrEm.s
//   raw-port/re/disasm/Helium.__ZNK15HGCVPixelBuffer4lockEb.s
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES — all TRUE OUT-OF-SCOPE CoreVideo externs
// -----------------------------------------------------------------------------
// Both methods dereference the `CVPixelBufferRef` (`__CVBuffer*`) the wrapper
// caches at this[+0x18] and forward to Apple CoreVideo C functions. CoreVideo
// is OUTSIDE the 5-framework port scope (ProCore/ProChannel/Helium/Ozone/
// Flexo), so — exactly like the CGColorSpace / _kCVImageBuffer* externs
// already in-tree — these are modelled as boundary stubs that throw, each
// citing the Helium symbol-stub address it is entered through (Rule 3: throw
// on out-of-scope, never approximate). They are NOT in-scope callees; there
// is no FCP function body to transcribe for them.
//
//   _CVPixelBufferGetPlaneCount        Helium symbol stub @0x3c4d66
//   _CVPixelBufferGetBaseAddressOfPlane Helium symbol stub @0x3c4d36
//   _CVPixelBufferGetBaseAddress       Helium symbol stub @0x3c4d30
//   _CVPixelBufferLockBaseAddress      Helium symbol stub @0x3c4d7e

/**
 * `CVPixelBufferRef` — Apple CoreVideo opaque handle (`__CVBuffer*`). Out of
 * port scope; modelled as an opaque brand so the wrapper field and the
 * boundary-stub signatures type-check.
 */
export interface CVPixelBufferRef {
  readonly __cvPixelBufferRef: unique symbol;
}

// --- CoreVideo boundary stubs (TRUE out-of-scope externs) ----------------------------------------

/** `CVPixelBufferGetPlaneCount(CVPixelBufferRef)` — CoreVideo extern, entered
 *  via Helium symbol stub @0x3c4d66 (`callq` @Helium 0x1e0741). Out of scope. */
function CVPixelBufferGetPlaneCount(_buf: CVPixelBufferRef): number {
  throw new Error(
    "CVPixelBufferGetPlaneCount — CoreVideo extern, out-of-scope; entered via " +
      "Helium symbol stub @0x3c4d66 (called @Helium 0x1e0741). Not transcribed.",
  );
}

/** `CVPixelBufferGetBaseAddressOfPlane(CVPixelBufferRef, size_t)` — CoreVideo
 *  extern, tail-called via Helium symbol stub @0x3c4d36 (`jmp` @Helium
 *  0x1e0756). Out of scope. */
function CVPixelBufferGetBaseAddressOfPlane(
  _buf: CVPixelBufferRef,
  _planeIndex: bigint,
): unknown {
  throw new Error(
    "CVPixelBufferGetBaseAddressOfPlane — CoreVideo extern, out-of-scope; " +
      "entered via Helium symbol stub @0x3c4d36 (tail-called @Helium 0x1e0756). Not transcribed.",
  );
}

/** `CVPixelBufferGetBaseAddress(CVPixelBufferRef)` — CoreVideo extern,
 *  tail-called via Helium symbol stub @0x3c4d30 (`jmp` @Helium 0x1e075f).
 *  Out of scope. */
function CVPixelBufferGetBaseAddress(_buf: CVPixelBufferRef): unknown {
  throw new Error(
    "CVPixelBufferGetBaseAddress — CoreVideo extern, out-of-scope; entered " +
      "via Helium symbol stub @0x3c4d30 (tail-called @Helium 0x1e075f). Not transcribed.",
  );
}

/** `CVPixelBufferLockBaseAddress(CVPixelBufferRef, CVPixelBufferLockFlags)` —
 *  CoreVideo extern, entered via Helium symbol stub @0x3c4d7e (`callq`
 *  @Helium 0x1e06fa). Returns a `CVReturn` (0 == kCVReturnSuccess). Out of
 *  scope. */
function CVPixelBufferLockBaseAddress(
  _buf: CVPixelBufferRef,
  _lockFlags: number,
): number {
  throw new Error(
    "CVPixelBufferLockBaseAddress — CoreVideo extern, out-of-scope; entered " +
      "via Helium symbol stub @0x3c4d7e (called @Helium 0x1e06fa). Not transcribed.",
  );
}

/**
 * `HGCVPixelBuffer` — Helium's thin wrapper around an Apple
 * `CVPixelBufferRef`. Only the field the two ported methods touch (the
 * `__CVBuffer*` at +0x18) is decoded here; every other field is undecoded
 * and NOT modelled (per Rule 5 — no fabricated fields).
 */
export class HGCVPixelBuffer {
  /**
   * @Helium offset +0x18 — the wrapped `CVPixelBufferRef` (`__CVBuffer*`).
   * Read @0x1e073d (`movq 0x18(%rdi), %rdi`) in `ptr()` and @0x1e06f4 in
   * `lock()`. Pointer-sized (8-byte `movq`); the writer lives in a different
   * (not-yet-ported) HGCVPixelBuffer method and is OUT OF SCOPE here.
   */
  cvBuffer_at_0x18: CVPixelBufferRef | null = null;

  /**
   * `HGCVPixelBuffer::ptr(unsigned long planeIndex) const` — @Helium 0x1e0730
   * (__ZNK15HGCVPixelBuffer3ptrEm).
   *
   * Faithful transcription of the disassembly:
   *
   *   0x1e0737  movq %rsi, %rbx              ; rbx = planeIndex (arg1)
   *   0x1e073a  movq %rdi, %r14              ; r14 = this
   *   0x1e073d  movq 0x18(%rdi), %rdi        ; rdi = this->cvBuffer_at_0x18
   *   0x1e0741  callq _CVPixelBufferGetPlaneCount     ; rax = plane count
   *   0x1e0746  movq 0x18(%r14), %rdi        ; rdi = this->cvBuffer_at_0x18 (reload)
   *   0x1e074a  testq %rax, %rax             ; planeCount == 0 ?
   *   0x1e074d  je   0x1e075b                ; planeCount == 0 -> GetBaseAddress
   *   0x1e074f  movq %rbx, %rsi              ; rsi = planeIndex
   *   0x1e0756  jmp  _CVPixelBufferGetBaseAddressOfPlane  ; tail call (planeCount != 0)
   *   0x1e075f  jmp  _CVPixelBufferGetBaseAddress          ; tail call (planeCount == 0)
   *
   * If the buffer is planar (`CVPixelBufferGetPlaneCount(cvbuf) != 0`) return
   * `CVPixelBufferGetBaseAddressOfPlane(cvbuf, planeIndex)`; otherwise
   * (non-planar) return `CVPixelBufferGetBaseAddress(cvbuf)`. Note the
   * `movq 0x18(%r14)` at @0x1e0746 RELOADS the buffer pointer after the first
   * CoreVideo call — we mirror that reload. Every callee is a CoreVideo
   * extern (out of scope); the FCP method body itself is fully transcribed —
   * only the extern targets are boundary stubs.
   *
   * `planeIndex` is `unsigned long` (u64); kept as bigint per Rule 4 and
   * passed straight through to the plane accessor.
   *
   * Source disassembly:
   *   raw-port/re/disasm/Helium.__ZNK15HGCVPixelBuffer3ptrEm.s
   */
  ptr(planeIndex: bigint): unknown {
    // @0x1e073d: rdi = this->cvBuffer_at_0x18 (the __CVBuffer*)
    const cvbuf = this.cvBuffer_at_0x18!;
    // @0x1e0741: rax = CVPixelBufferGetPlaneCount(cvbuf)
    const planeCount = CVPixelBufferGetPlaneCount(cvbuf);
    // @0x1e0746: reload this->cvBuffer_at_0x18 (the machine re-reads +0x18).
    const cvbufReloaded = this.cvBuffer_at_0x18!;
    // @0x1e074a-0x1e074d: testq %rax,%rax ; je -> non-planar path
    if (planeCount !== 0) {
      // @0x1e074f-0x1e0756: planar -> tail call GetBaseAddressOfPlane(buf, idx)
      return CVPixelBufferGetBaseAddressOfPlane(cvbufReloaded, planeIndex);
    }
    // @0x1e075f: non-planar -> tail call GetBaseAddress(buf)
    return CVPixelBufferGetBaseAddress(cvbufReloaded);
  }

  /**
   * `HGCVPixelBuffer::lock(bool lockFlags) const` — @Helium 0x1e06f0
   * (__ZNK15HGCVPixelBuffer4lockEb).
   *
   * Faithful transcription of the disassembly:
   *
   *   0x1e06f4  movq 0x18(%rdi), %rdi        ; rdi = this->cvBuffer_at_0x18
   *   0x1e06f8  movl %esi, %esi              ; rsi = (u32)lockFlags (zero-extend arg1)
   *   0x1e06fa  callq _CVPixelBufferLockBaseAddress  ; eax = CVReturn
   *   0x1e06ff  testl %eax, %eax             ; CVReturn == 0 ?
   *   0x1e0701  sete  %al                    ; return (CVReturn == kCVReturnSuccess)
   *
   * Locks the wrapped CVPixelBuffer's base address and returns whether the
   * lock SUCCEEDED — `CVPixelBufferLockBaseAddress(cvbuf, flags) == 0`
   * (0 == `kCVReturnSuccess`). The `movl %esi, %esi` zero-extends the `bool`
   * lock-flags argument to a 32-bit `CVPixelBufferLockFlags`; a JS boolean is
   * mapped to 0/1 to match. The sole callee is a CoreVideo extern (out of
   * scope, boundary stub); the FCP method body is fully transcribed.
   *
   * Source disassembly:
   *   raw-port/re/disasm/Helium.__ZNK15HGCVPixelBuffer4lockEb.s
   */
  lock(lockFlags: boolean): boolean {
    // @0x1e06f4: rdi = this->cvBuffer_at_0x18
    const cvbuf = this.cvBuffer_at_0x18!;
    // @0x1e06f8: rsi = (u32)lockFlags  (movl zero-extends the bool arg to 32b)
    const flags = lockFlags ? 1 : 0;
    // @0x1e06fa: eax = CVPixelBufferLockBaseAddress(cvbuf, flags)  (CVReturn)
    const cvReturn = CVPixelBufferLockBaseAddress(cvbuf, flags);
    // @0x1e06ff-0x1e0701: testl %eax,%eax ; sete %al -> (CVReturn == 0)
    return cvReturn === 0;
  }
}
