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
//   * HGCVPixelBuffer::unlock(bool) const          @Helium 0x1e0710
//     __ZNK15HGCVPixelBuffer6unlockEb
//   * HGCVPixelBuffer::rowBytes(unsigned long) const  @Helium 0x1e0690
//     __ZNK15HGCVPixelBuffer8rowBytesEm
//   * HGCVPixelBuffer::w(unsigned long) const       @Helium 0x1e05d0
//     __ZNK15HGCVPixelBuffer1wEm
//
// re/disasm:
//   raw-port/re/disasm/Helium.__ZNK15HGCVPixelBuffer3ptrEm.s
//   raw-port/re/disasm/Helium.__ZNK15HGCVPixelBuffer4lockEb.s
//   raw-port/re/disasm/Helium.__ZNK15HGCVPixelBuffer6unlockEb.s
//   raw-port/re/disasm/Helium.__ZNK15HGCVPixelBuffer8rowBytesEm.s
//   raw-port/re/disasm/Helium.__ZNK15HGCVPixelBuffer1wEm.s
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
//   _CVPixelBufferUnlockBaseAddress    Helium symbol stub @0x3c4d90
//   _CVPixelBufferGetBytesPerRowOfPlane Helium symbol stub @0x3c4d42
//   _CVPixelBufferGetBytesPerRow       Helium symbol stub @0x3c4d3c
//   _CVPixelBufferGetPixelFormatType   Helium symbol stub @0x3c4d60
//   _CVPixelBufferGetWidth             Helium symbol stub @0x3c4d6c
//   _CVPixelBufferGetWidthOfPlane      Helium symbol stub @0x3c4d72

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
 * `CVPixelBufferUnlockBaseAddress(CVPixelBufferRef, CVPixelBufferLockFlags)` —
 * CoreVideo extern, entered via Helium symbol stub @0x3c4d90 (called
 * @Helium 0x1e071a by `unlock`). Returns a `CVReturn` (0 == kCVReturnSuccess).
 */
function CVPixelBufferUnlockBaseAddress(
  _buf: CVPixelBufferRef,
  _lockFlags: number,
): number {
  throw new Error(
    "CVPixelBufferUnlockBaseAddress — CoreVideo extern, out-of-scope; entered " +
      "via Helium symbol stub @0x3c4d90 (called @Helium 0x1e071a). Not transcribed.",
  );
}

/**
 * `CVPixelBufferGetBytesPerRowOfPlane(CVPixelBufferRef, size_t)` — CoreVideo
 * extern, entered via Helium symbol stub @0x3c4d42 (tail-jumped @Helium
 * 0x1e06b6 by `rowBytes`). Returns `size_t`.
 */
function CVPixelBufferGetBytesPerRowOfPlane(
  _buf: CVPixelBufferRef,
  _planeIndex: bigint,
): bigint {
  throw new Error(
    "CVPixelBufferGetBytesPerRowOfPlane — CoreVideo extern, out-of-scope; " +
      "entered via Helium symbol stub @0x3c4d42 (tail-jmp @Helium 0x1e06b6). " +
      "Not transcribed.",
  );
}

/**
 * `CVPixelBufferGetBytesPerRow(CVPixelBufferRef)` — CoreVideo extern, entered
 * via Helium symbol stub @0x3c4d3c (tail-jumped @Helium 0x1e06bf by
 * `rowBytes`). Returns `size_t`.
 */
function CVPixelBufferGetBytesPerRow(_buf: CVPixelBufferRef): bigint {
  throw new Error(
    "CVPixelBufferGetBytesPerRow — CoreVideo extern, out-of-scope; entered " +
      "via Helium symbol stub @0x3c4d3c (tail-jmp @Helium 0x1e06bf). " +
      "Not transcribed.",
  );
}

/**
 * `CVPixelBufferGetPixelFormatType(CVPixelBufferRef)` — CoreVideo extern,
 * entered via Helium symbol stub @0x3c4d60 (called @Helium 0x1e05ef by `w`).
 * Returns an `OSType` FourCC as a 32-bit value.
 */
function CVPixelBufferGetPixelFormatType(_buf: CVPixelBufferRef): number {
  throw new Error(
    "CVPixelBufferGetPixelFormatType — CoreVideo extern, out-of-scope; " +
      "entered via Helium symbol stub @0x3c4d60 (called @Helium 0x1e05ef). " +
      "Not transcribed.",
  );
}

/**
 * `CVPixelBufferGetWidth(CVPixelBufferRef)` — CoreVideo extern, entered via
 * Helium symbol stub @0x3c4d6c (called @Helium 0x1e05ff, tail-jumped
 * @Helium 0x1e0610 by `w`). Returns `size_t`.
 */
function CVPixelBufferGetWidth(_buf: CVPixelBufferRef): bigint {
  throw new Error(
    "CVPixelBufferGetWidth — CoreVideo extern, out-of-scope; entered via " +
      "Helium symbol stub @0x3c4d6c (@Helium 0x1e05ff / tail-jmp 0x1e0610). " +
      "Not transcribed.",
  );
}

/**
 * `CVPixelBufferGetWidthOfPlane(CVPixelBufferRef, size_t)` — CoreVideo extern,
 * entered via Helium symbol stub @0x3c4d72 (tail-jumped @Helium 0x1e061c by
 * `w`). Returns `size_t`.
 */
function CVPixelBufferGetWidthOfPlane(
  _buf: CVPixelBufferRef,
  _planeIndex: bigint,
): bigint {
  throw new Error(
    "CVPixelBufferGetWidthOfPlane — CoreVideo extern, out-of-scope; entered " +
      "via Helium symbol stub @0x3c4d72 (tail-jmp @Helium 0x1e061c). " +
      "Not transcribed.",
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

  /**
   * `HGCVPixelBuffer::unlock(bool lockFlags) const` — @Helium 0x1e0710
   * (__ZNK15HGCVPixelBuffer6unlockEb).
   *
   * The mirror of `lock` @0x1e06f0. Faithful transcription:
   *
   *   0x1e0714  movq 0x18(%rdi), %rdi        ; rdi = this->cvBuffer_at_0x18
   *   0x1e0718  movl %esi, %esi              ; rsi = (u32)lockFlags (zero-extend)
   *   0x1e071a  callq _CVPixelBufferUnlockBaseAddress  ; eax = CVReturn
   *   0x1e071f  testl %eax, %eax             ; CVReturn == 0 ?
   *   0x1e0721  sete  %al                    ; return (CVReturn == kCVReturnSuccess)
   *
   * The sole callee is a CoreVideo extern (out of scope, boundary stub); the
   * FCP method body itself is fully transcribed.
   *
   * (Content re-applied verbatim from the sibling worker commit 4a5a599e
   * during a union-rebase onto current main, so that landing `rowBytes` does
   * not drop it — the branch previously carried this method in a file that
   * had been rewritten without main's `ptr`/`lock`.)
   *
   * Source disassembly:
   *   raw-port/re/disasm/Helium.__ZNK15HGCVPixelBuffer6unlockEb.s
   */
  unlock(lockFlags: boolean): boolean {
    // @0x1e0714: rdi = this->cvBuffer_at_0x18
    const cvbuf = this.cvBuffer_at_0x18!;
    // @0x1e0718: rsi = (u32)lockFlags  (movl zero-extends the bool arg to 32b)
    const flags = (lockFlags ? 1 : 0) >>> 0;
    // @0x1e071a: eax = CVPixelBufferUnlockBaseAddress(cvbuf, flags)
    const cvReturn = CVPixelBufferUnlockBaseAddress(cvbuf, flags);
    // @0x1e071f-0x1e0721: testl %eax,%eax ; sete %al -> (CVReturn == 0)
    return (cvReturn | 0) === 0;
  }

  /**
   * `HGCVPixelBuffer::rowBytes(unsigned long planeIndex) const` —
   * @Helium 0x1e0690 (__ZNK15HGCVPixelBuffer8rowBytesEm).
   *
   * Structurally identical to `ptr` @0x1e0730: ask CoreVideo whether the
   * buffer is planar, then forward to the per-plane or the whole-buffer
   * accessor. Faithful transcription of every instruction:
   *
   *   0x1e0697  movq %rsi, %rbx              ; rbx = planeIndex (arg1)
   *   0x1e069a  movq %rdi, %r14              ; r14 = this
   *   0x1e069d  movq 0x18(%rdi), %rdi        ; rdi = this->cvBuffer_at_0x18
   *   0x1e06a1  callq _CVPixelBufferGetPlaneCount     ; rax = plane count
   *   0x1e06a6  movq 0x18(%r14), %rdi        ; rdi = this->cvBuffer_at_0x18 (reload)
   *   0x1e06aa  testq %rax, %rax             ; planeCount == 0 ?
   *   0x1e06ad  je   0x1e06bb                ; planeCount == 0 -> GetBytesPerRow
   *   0x1e06af  movq %rbx, %rsi              ; rsi = planeIndex
   *   0x1e06b6  jmp  _CVPixelBufferGetBytesPerRowOfPlane  ; tail call (planar)
   *   0x1e06bf  jmp  _CVPixelBufferGetBytesPerRow          ; tail call (non-planar)
   *
   * Both exits are TAIL JUMPS (`jmp`, after the epilogue pops) — the CoreVideo
   * result is returned unchanged, with no post-processing, no clamp and no
   * error check. Note the `movq 0x18(%r14)` @0x1e06a6 RELOADS the buffer
   * pointer after the first CoreVideo call; that reload is mirrored here
   * rather than reusing the first read.
   *
   * `planeIndex` is `unsigned long` (u64) and the return is `size_t` (u64), so
   * both stay bigint per Rule 4 — a row-byte count is bounded in practice, but
   * the ABI width is 64-bit and the value is passed straight through.
   *
   * Every callee is a CoreVideo extern (out of scope, boundary stubs above);
   * the FCP method body itself is fully transcribed.
   *
   * Source disassembly:
   *   raw-port/re/disasm/Helium.__ZNK15HGCVPixelBuffer8rowBytesEm.s
   */
  rowBytes(planeIndex: bigint): bigint {
    // @0x1e069d: rdi = this->cvBuffer_at_0x18 (the __CVBuffer*)
    const cvbuf = this.cvBuffer_at_0x18!;
    // @0x1e06a1: rax = CVPixelBufferGetPlaneCount(cvbuf)
    const planeCount = CVPixelBufferGetPlaneCount(cvbuf);
    // @0x1e06a6: reload this->cvBuffer_at_0x18 (the machine re-reads +0x18).
    const cvbufReloaded = this.cvBuffer_at_0x18!;
    // @0x1e06aa-0x1e06ad: testq %rax,%rax ; je -> non-planar path
    if (planeCount !== 0) {
      // @0x1e06af-0x1e06b6: planar -> tail call GetBytesPerRowOfPlane(buf, idx)
      return CVPixelBufferGetBytesPerRowOfPlane(cvbufReloaded, planeIndex);
    }
    // @0x1e06bf: non-planar -> tail call GetBytesPerRow(buf)
    return CVPixelBufferGetBytesPerRow(cvbufReloaded);
  }

  /**
   * `HGCVPixelBuffer::w(unsigned long planeIndex) const` — @Helium 0x1e05d0
   * (__ZNK15HGCVPixelBuffer1wEm) — the wrapper's WIDTH accessor.
   *
   * Same planar probe as `ptr` @0x1e0730 / `rowBytes` @0x1e0690, but with an
   * extra pixel-format special case in the planar arm. Every instruction:
   *
   *   0x1e05d7  movq %rsi, %rbx              ; rbx = planeIndex (arg1)
   *   0x1e05da  movq %rdi, %r14              ; r14 = this
   *   0x1e05dd  movq 0x18(%rdi), %rdi        ; rdi = this->cvBuffer_at_0x18
   *   0x1e05e1  callq _CVPixelBufferGetPlaneCount      ; rax = plane count
   *   0x1e05e6  movq 0x18(%r14), %rdi        ; rdi = cvBuffer_at_0x18 (reload)
   *   0x1e05ea  testq %rax, %rax             ; planeCount == 0 ?
   *   0x1e05ed  je   0x1e060c                ;   -> non-planar arm
   *   0x1e05ef  callq _CVPixelBufferGetPixelFormatType ; eax = OSType FourCC
   *   0x1e05f4  movq 0x18(%r14), %rdi        ; rdi = cvBuffer_at_0x18 (reload #2)
   *   0x1e05f8  cmpl $0x62313671, %eax       ; FourCC == 0x62313671 ?
   *   0x1e05fd  jne  0x1e0615                ;   -> per-plane arm
   *   0x1e05ff  callq _CVPixelBufferGetWidth ; rax = full-buffer width
   *   0x1e0604  shrq %rax                    ; rax >>= 1  (UNSIGNED, by one)
   *   0x1e060b  retq                         ; return width/2
   *   0x1e0610  jmp  _CVPixelBufferGetWidth              ; non-planar tail call
   *   0x1e0615  movq %rbx, %rsi
   *   0x1e061c  jmp  _CVPixelBufferGetWidthOfPlane(buf, planeIndex)  ; tail call
   *
   * THREE exits:
   *   • planeCount == 0 (non-planar)              -> GetWidth(buf)
   *   • planar AND format == 0x62313671           -> GetWidth(buf) >> 1
   *   • planar AND any other format               -> GetWidthOfPlane(buf, i)
   *
   * `cmpl $0x62313671, %eax` is a 32-bit EQUALITY test against an `OSType`
   * FourCC literal; the four bytes of 0x62313671, most-significant first, are
   * 0x62 0x31 0x36 0x71 = `'b' '1' '6' 'q'`. The constant is transcribed as the
   * raw immediate read at @0x1e05f8 — no Apple constant name is asserted for
   * it, since none is visible in the binary.
   *
   * `shrq %rax` with no count operand is a shift by ONE and is the UNSIGNED
   * (logical) shift, so the halving is `width >> 1n` on the u64 `size_t`, not
   * an arithmetic shift and not a divide-with-rounding.
   *
   * Note both `movq 0x18(%r14)` reloads (@0x1e05e6 and @0x1e05f4): the machine
   * re-reads the buffer pointer after EACH CoreVideo call, and both reloads are
   * mirrored here rather than caching the first read.
   *
   * `planeIndex` is `unsigned long` (u64) and the results are `size_t` (u64),
   * so both stay bigint per Rule 4. Every callee is a CoreVideo extern (out of
   * scope, boundary stubs above); the FCP method body is fully transcribed.
   *
   * Source disassembly:
   *   raw-port/re/disasm/Helium.__ZNK15HGCVPixelBuffer1wEm.s
   */
  w(planeIndex: bigint): bigint {
    // @0x1e05dd: rdi = this->cvBuffer_at_0x18 (the __CVBuffer*)
    const cvbuf = this.cvBuffer_at_0x18!;
    // @0x1e05e1: rax = CVPixelBufferGetPlaneCount(cvbuf)
    const planeCount = CVPixelBufferGetPlaneCount(cvbuf);
    // @0x1e05e6: reload this->cvBuffer_at_0x18.
    const cvbufReloaded = this.cvBuffer_at_0x18!;
    // @0x1e05ea-0x1e05ed: testq %rax,%rax ; je -> non-planar arm.
    if (planeCount === 0) {
      // @0x1e0610: tail call GetWidth(buf).
      return CVPixelBufferGetWidth(cvbufReloaded);
    }
    // @0x1e05ef: eax = CVPixelBufferGetPixelFormatType(buf).
    const pixelFormat = CVPixelBufferGetPixelFormatType(cvbufReloaded);
    // @0x1e05f4: reload this->cvBuffer_at_0x18 (second reload).
    const cvbufReloaded2 = this.cvBuffer_at_0x18!;
    // @0x1e05f8-0x1e05fd: cmpl $0x62313671,%eax ; jne -> per-plane arm.
    if ((pixelFormat >>> 0) === 0x62313671) {
      // @0x1e05ff: rax = GetWidth(buf).
      const fullWidth = CVPixelBufferGetWidth(cvbufReloaded2);
      // @0x1e0604: shrq %rax — logical shift right by one (halve, u64).
      return fullWidth >> 1n;
    }
    // @0x1e0615-0x1e061c: tail call GetWidthOfPlane(buf, planeIndex).
    return CVPixelBufferGetWidthOfPlane(cvbufReloaded2, planeIndex);
  }
}
