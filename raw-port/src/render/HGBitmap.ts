// raw-port: HGBitmap — Helium framework bitmap wrapper.
//
// This file contributes ONE method (GetStorage) and the opaque model of
// the storage pointer it returns. The class as a whole is a Helium bitmap
// buffer wrapper (peer methods include GetWidth/GetHeight/GetFormat/
// GetBytesPerRow/etc. — each unlocks in its own file when its accessor is
// ported). This file only lands what THIS unit strictly requires.
//
// Framework: Helium
// Binary:   /Applications/Final Cut Pro.app/Contents/Frameworks/
//           Helium.framework/Versions/A/Helium (x86_64 slice; unadjusted VAs).
// Disasm:   raw-port/re/disasm/Helium.__ZN8HGBitmap10GetStorageEv.s
//
// -----------------------------------------------------------------------------
// FIELD LAYOUT (fields discovered from GetStorage's read; other slots are
// as-yet-undecoded and left OPAQUE — no invented fields)
// -----------------------------------------------------------------------------
//   +0x78  void*  storageAt78   ; @0x1e5d04 read (8 bytes, 64-bit pointer)
//
// The +0x78 slot holds an opaque pointer that GetStorage returns unchanged.
// From peer methods (not yet transcribed) we may later learn that this points
// to a raw pixel buffer, a HGStorage object, or an ObjC MTLBuffer wrapper —
// but this getter alone tells us only the offset and the pointer-sized
// (`movq`) width. Per Rule 5 we model it as `unknown` (an opaque handle).
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN8HGBitmap10GetStorageEv
//       — HGBitmap::GetStorage() @Helium 0x1e5d00
//   * __ZNK8HGBitmap13GetEdgePolicyEv
//       — HGBitmap::GetEdgePolicy() const @Helium 0x1e5d10
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/Helium.__ZN8HGBitmap10GetStorageEv.s)
// -----------------------------------------------------------------------------
//   __ZN8HGBitmap10GetStorageEv:
//     0x1e5d00  pushq  %rbp                        ; frame prologue
//     0x1e5d01  movq   %rsp, %rbp
//     0x1e5d04  movq   0x78(%rdi), %rax             ; rax = this[+0x78]
//     0x1e5d08  popq   %rbp                        ; frame epilogue
//     0x1e5d09  retq                                ; return rax

/**
 * `HGBitmap` — Helium bitmap buffer wrapper. Only the storage slot at +0x78
 * is decoded at this layer; the rest of the object is OPAQUE (undecoded)
 * and is intentionally NOT modelled here — future ports of other HGBitmap
 * methods (GetWidth/GetHeight/GetFormat/GetBytesPerRow/…) will add fields
 * as their addresses are read.
 */
export class HGBitmap {
  /**
   * @Helium offset +0x78 — a pointer-sized (8-byte) opaque storage slot
   * read by `GetStorage()` @0x1e5d04 via `movq 0x78(%rdi), %rax`.
   *
   * The `movq` (64-bit load) fixes the field as a pointer; the value it
   * points to is not decoded by THIS unit (the getter returns it
   * unchanged as an opaque `void*`). Peer methods (GetWidth/GetPixels/
   * etc.) that dereference this slot will ground it as a concrete
   * struct/handle when ported.
   *
   * Modelled as `unknown` (opaque handle) to preserve the "pointer, no
   * decoded interior" semantics faithfully — Rule 5 forbids inventing a
   * shape for an un-touched interior.
   */
  storageAt78: unknown = null;

  /**
   * `HGBitmap::GetStorage()`
   *   — @Helium 0x1e5d00
   *   — __ZN8HGBitmap10GetStorageEv
   *
   * Faithful line-for-line transcription of the 6-instruction disassembly:
   *   0x1e5d00  pushq  %rbp                        ; frame prologue
   *   0x1e5d01  movq   %rsp, %rbp
   *   0x1e5d04  movq   0x78(%rdi), %rax             ; rax = this[+0x78]
   *   0x1e5d08  popq   %rbp                        ; frame epilogue
   *   0x1e5d09  retq                                ; return %rax
   *
   * Single-instruction body: load the 8-byte pointer at offset +0x78 of
   * `this` into the return register (`%rax`). Zero in-scope callees,
   * zero externs, no indirect calls — pure field read.
   *
   * Source disassembly:
   *   raw-port/re/disasm/Helium.__ZN8HGBitmap10GetStorageEv.s (7 lines)
   */
  GetStorage(): unknown {
    // @0x1e5d04  movq 0x78(%rdi), %rax
    //   Return the opaque 8-byte pointer stored at this[+0x78] unchanged.
    return this.storageAt78;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // NEW FIELDS added for byteOffset() @Helium 0x1e5c60
  // ═══════════════════════════════════════════════════════════════════════
  // The 28-line disassembly of byteOffset (raw-port/re/disasm/
  // Helium.__ZNK8HGBitmap10byteOffsetEii.s) reveals five previously-
  // undecoded fields at offsets 0x10, 0x14, 0x18, 0x38, 0x40. Each is
  // documented @0xADDR below and modelled minimally (Rule 5 — only
  // fields we OBSERVE this method touch).

  /** @Helium offset +0x10 — 4-byte integer format code. Compared to
   *  `0x1f` @0x1e5c6e via `cmpl $0x1f, 0x10(%rdi)`. Format 0x1f selects
   *  the "packed subsampled" stride path (stride * ΔY * 4/3) which is
   *  characteristic of YUV 4:2:0 planar/semi-planar layouts (where the
   *  effective row-stride across all three planes is 1.5 * the luma
   *  stride). Any other format falls through to the plain
   *  `stride * ΔY` path. The name `format` is the standard Helium
   *  terminology observed in peer method GetFormat (not yet ported). */
  formatCode_at_0x10: number = 0;

  /** @Helium offset +0x14 — 4-byte integer baseline Y coordinate. Loaded
   *  as signed int64 @0x1e5c64 via `movslq 0x14(%rdi), %rax`, then
   *  subtracted from the caller's `y` to produce a 0-relative row index
   *  (ΔY = y - baseY). Peer method (setter) will land in a separate
   *  ledger unit. Signed 32-bit integer (movslq sign-extends to 64). */
  baseY_at_0x14: number = 0;

  /** @Helium offset +0x18 — 4-byte integer baseline X coordinate. Loaded
   *  as signed int64 @0x1e5c74 via `movslq 0x18(%rdi), %r8`, then
   *  subtracted from the caller's `x` to produce a 0-relative column
   *  index (ΔX = x - baseX). Signed 32-bit integer. */
  baseX_at_0x18: number = 0;

  /** @Helium offset +0x38 — 8-byte signed integer row stride (in bytes).
   *  Loaded @0x1e5c7c via `movq 0x38(%rdi), %rax`, then multiplied by
   *  the ΔY row-index. For the packed-subsampled path (format==0x1f) it
   *  is additionally multiplied by 4 and divided by 3 (see comments on
   *  the magic-multiply below). Bigint domain to preserve exact 64-bit
   *  arithmetic — row × stride easily exceeds 2^53. */
  rowStride_at_0x38: bigint = 0n;

  /** @Helium offset +0x40 — 8-byte signed integer bytes-per-pixel.
   *  Loaded @0x1e5c78 via `movq 0x40(%rdi), %rcx`, then multiplied by
   *  the ΔX column-index (regardless of format). Bigint domain for the
   *  same reason as rowStride_at_0x38 — pathological pixel counts can
   *  overflow number precision at ~53 bits. */
  bytesPerPixel_at_0x40: bigint = 0n;

  /**
   * `HGBitmap::byteOffset(int, int) const`
   *   — @Helium 0x1e5c60
   *   — __ZNK8HGBitmap10byteOffsetEii
   *
   * Compute the byte offset within the underlying pixel buffer for a
   * given (y, x) coordinate. The formula is:
   *
   *     if formatCode == 0x1f:
   *         byteOffset = rowStride * (y - baseY) * 4 / 3
   *                    + bytesPerPixel * (x - baseX)
   *     else:
   *         byteOffset = rowStride * (y - baseY)
   *                    + bytesPerPixel * (x - baseX)
   *
   * where the `* 4 / 3` on the packed-subsampled branch is emitted by
   * the compiler as `shl 2` then a `mulq` by the unsigned 64-bit magic
   * constant `0xAAAAAAAAAAAAAAAB` and `shrq 2` — the standard Hacker's
   * Delight recipe for unsigned-divide-by-3 on a 64-bit lane. See the
   * commentary at 0x1e5c8a below.
   *
   * FULL DISASM (raw-port/re/disasm/Helium.__ZNK8HGBitmap10byteOffsetEii.s):
   *   0x1e5c60  pushq  %rbp                              ; frame prologue
   *   0x1e5c61  movq   %rsp, %rbp
   *   0x1e5c64  movslq 0x14(%rdi), %rax                  ; rax = (i64) baseY
   *   0x1e5c68  movslq %esi,      %r9                    ; r9  = (i64) y
   *   0x1e5c6b  subq   %rax,      %r9                    ; r9  = y - baseY  = ΔY
   *   0x1e5c6e  cmpl   $0x1f, 0x10(%rdi)                 ; format == 0x1f ?
   *   0x1e5c72  movl   %edx,      %esi                   ; esi = x (staged)
   *   0x1e5c74  movslq 0x18(%rdi), %r8                   ; r8  = (i64) baseX
   *   0x1e5c78  movq   0x40(%rdi), %rcx                  ; rcx = bytesPerPixel
   *   0x1e5c7c  movq   0x38(%rdi), %rax                  ; rax = rowStride
   *   0x1e5c80  jne    0x1e5ca0                          ; format != 0x1f -> plain path
   *   0x1e5c82  imulq  %r9,       %rax                   ; rax = stride * ΔY
   *   0x1e5c86  shlq   $0x2,      %rax                   ; rax *= 4
   *   0x1e5c8a  movabsq $-0x5555555555555555, %rdx       ; rdx = 0xAAAAAAAAAAAAAAAB
   *   0x1e5c94  mulq   %rdx                              ; rdx:rax = rax * 0xAAA...B
   *                                                      ;  (unsigned 128-bit product;
   *                                                      ;   only the high half (rdx)
   *                                                      ;   carries useful bits after
   *                                                      ;   the shrq below).
   *   0x1e5c97  movq   %rdx,      %rax                   ; rax = high(product)
   *   0x1e5c9a  shrq   $0x2,      %rax                   ; rax >>= 2
   *                                                      ;  ; rax = rax_pre / 3
   *   0x1e5c9e  jmp    0x1e5ca4                          ; join
   *   0x1e5ca0  imulq  %r9,       %rax                   ; plain: rax = stride * ΔY
   *   0x1e5ca4  movslq %esi,      %rdx                   ; rdx = (i64) x
   *   0x1e5ca7  subq   %r8,       %rdx                   ; rdx = x - baseX = ΔX
   *   0x1e5caa  imulq  %rdx,      %rcx                   ; rcx = bpp * ΔX
   *   0x1e5cae  addq   %rax,      %rcx                   ; rcx += rax (rows term)
   *   0x1e5cb1  movq   %rcx,      %rax                   ; return rcx
   *   0x1e5cb4  popq   %rbp
   *   0x1e5cb5  retq
   *   0x1e5cb6  nopw   %cs:(%rax,%rax)                   ; alignment padding
   *
   * NOTE on the *4/3 recipe (@0x1e5c8a..0x1e5c9a):
   *   The compiler expands `(a * 4) / 3` into
   *     `high((a * 4) * 0xAAAAAAAAAAAAAAAB) >> 2`
   *   which is the branch-free unsigned-divide-by-3 using the magic
   *   reciprocal. For any non-negative a with `4*a < 2^64`, this gives
   *   exactly `(4*a) / 3` (integer division). We mirror the SEMANTICS,
   *   not the byte-shuffle: the JS mirror computes `(4n * a) / 3n`
   *   with BigInt integer division (round-toward-zero for non-negative
   *   operands, matching the machine's unsigned mulhi+shr).
   *
   * Zero in-scope callees; zero externs; zero indirect calls. Verified
   * via `python3 raw-port/army/tools/depgraph.py deps
   *      __ZNK8HGBitmap10byteOffsetEii`.
   */
  byteOffset(y: number, x: number): bigint {
    // @0x1e5c64  movslq 0x14(%rdi), %rax  ; rax = (i64) baseY
    const baseY: bigint = BigInt(this.baseY_at_0x14 | 0); // sign-extend i32 to i64
    // @0x1e5c68  movslq %esi, %r9         ; r9 = (i64) y
    const yLong: bigint = BigInt(y | 0);
    // @0x1e5c6b  subq %rax, %r9           ; r9 = y - baseY
    const dY: bigint = yLong - baseY;
    // @0x1e5c74  movslq 0x18(%rdi), %r8   ; r8 = (i64) baseX
    const baseX: bigint = BigInt(this.baseX_at_0x18 | 0);
    // @0x1e5c78  movq 0x40(%rdi), %rcx    ; rcx = bytesPerPixel (i64)
    const bpp: bigint = this.bytesPerPixel_at_0x40;
    // @0x1e5c7c  movq 0x38(%rdi), %rax    ; rax = rowStride (i64)
    const stride: bigint = this.rowStride_at_0x38;
    // @0x1e5c6e  cmpl $0x1f, 0x10(%rdi)
    // @0x1e5c80  jne  0x1e5ca0            ; NOT-EQUAL -> plain path
    let rowsTerm: bigint;
    if (this.formatCode_at_0x10 === 0x1f) {
      // @0x1e5c82  imulq %r9, %rax        ; rax = stride * ΔY
      // @0x1e5c86  shlq $0x2, %rax        ; rax = stride * ΔY * 4
      // @0x1e5c8a..0x1e5c9a  divide-by-3 via magic-multiply
      //   High(rax * 0xAAAAAAAAAAAAAAAB) >> 2 == rax / 3 for unsigned rax
      //   with rax < 2^64. We use bigint integer division to mirror the
      //   same result exactly (rounds toward zero for non-negative
      //   operands, and byteOffset is only ever computed on non-negative
      //   pixel-position deltas in practice).
      const fourAtimesΔY: bigint = stride * dY * 4n;
      rowsTerm = fourAtimesΔY / 3n;
    } else {
      // @0x1e5ca0  imulq %r9, %rax        ; rax = stride * ΔY (plain)
      rowsTerm = stride * dY;
    }
    // @0x1e5ca4  movslq %esi, %rdx        ; rdx = (i64) x
    const xLong: bigint = BigInt(x | 0);
    // @0x1e5ca7  subq %r8, %rdx           ; rdx = x - baseX
    const dX: bigint = xLong - baseX;
    // @0x1e5caa  imulq %rdx, %rcx         ; rcx = bpp * ΔX
    const colsTerm: bigint = bpp * dX;
    // @0x1e5cae  addq %rax, %rcx          ; rcx = rowsTerm + colsTerm
    // @0x1e5cb1  movq %rcx, %rax          ; return rcx
    return rowsTerm + colsTerm;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // NEW FIELD added for GetEdgePolicy() const @Helium 0x1e5d10
  // ═══════════════════════════════════════════════════════════════════════

  /** @Helium offset +0x60 — the start of an embedded SUBOBJECT whose address
   *  (not contents) is handed back by `GetEdgePolicy() const` @0x1e5d14 via
   *  `leaq 0x60(%rdi), %rax`.
   *
   *  The instruction is a `leaq`, NOT a `movq`: the machine never
   *  dereferences +0x60 here, so this unit learns only that an object
   *  BEGINS at +0x60 and that callers receive a pointer/reference into the
   *  bitmap itself. Its interior (width? mode enum? clamp/wrap/mirror
   *  descriptor?) is UNDECODED — per Rule 5 no field of it is invented.
   *
   *  Modelled as an owned, always-present record so the reference the
   *  getter returns has the same two properties the `leaq` guarantees:
   *  it is never null (it is `this + 0x60`, an interior address), and it is
   *  IDENTICAL across calls on the same bitmap (`===` mirrors pointer
   *  equality). Peer methods that read inside the policy will add typed
   *  fields at their own @0xADDRs when they are ported. */
  readonly edgePolicyAt60: Record<string, unknown> = {};

  /**
   * `HGBitmap::GetEdgePolicy() const`
   *   — @Helium 0x1e5d10
   *   — __ZNK8HGBitmap13GetEdgePolicyEv
   *
   * Faithful line-for-line transcription of the 6-instruction disassembly:
   *   0x1e5d10  pushq  %rbp                        ; frame prologue
   *   0x1e5d11  movq   %rsp, %rbp
   *   0x1e5d14  leaq   0x60(%rdi), %rax             ; rax = this + 0x60
   *   0x1e5d18  popq   %rbp                        ; frame epilogue
   *   0x1e5d19  retq                                ; return %rax
   *   0x1e5d1a  nopw   (%rax,%rax)                  ; alignment padding
   *
   * Single-instruction body: form the INTERIOR ADDRESS of the subobject
   * embedded at offset +0x60 of `this` and return it. Note the contrast
   * with the sibling `GetStorage()` @0x1e5d00, which is a `movq` (a LOAD
   * of a stored pointer at +0x78); here the `leaq` computes an address
   * without touching memory, which is the C++ codegen for returning a
   * reference/pointer to an embedded member rather than a stored handle.
   * Consequently the result can never be null and never varies for a
   * given bitmap.
   *
   * Zero in-scope callees, zero externs, no indirect calls — pure address
   * arithmetic. Confirmed via `depgraph.py deps
   * __ZNK8HGBitmap13GetEdgePolicyEv` (no dependencies reported).
   *
   * Source disassembly:
   *   raw-port/re/disasm/Helium.__ZNK8HGBitmap13GetEdgePolicyEv.s (7 lines)
   */
  GetEdgePolicy(): Record<string, unknown> {
    // @0x1e5d14  leaq 0x60(%rdi), %rax
    //   Return the address of the embedded subobject at this[+0x60]. In the
    //   JS mirror an object reference IS the address, so handing back the
    //   owned record reproduces both the non-nullness and the pointer
    //   identity of `this + 0x60`.
    return this.edgePolicyAt60;
  }
}

/**
 * Alias export: mangled symbol name.
 * @0x1e5d00 Helium  __ZN8HGBitmap10GetStorageEv
 */
export function __ZN8HGBitmap10GetStorageEv(self: HGBitmap): unknown {
  return self.GetStorage();
}

/**
 * Alias export: mangled symbol name.
 * @0x1e5d10 Helium  __ZNK8HGBitmap13GetEdgePolicyEv
 */
export function __ZNK8HGBitmap13GetEdgePolicyEv(
  self: HGBitmap,
): Record<string, unknown> {
  return self.GetEdgePolicy();
}
