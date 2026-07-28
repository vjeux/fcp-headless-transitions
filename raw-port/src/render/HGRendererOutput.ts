// HGRendererOutput.ts — Helium's HGRendererOutput POD constructor family.
// Faithful transcription from the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium
//
// Source disassembly:
//   raw-port/re/disasm/Helium.HGRendererOutput.HGRendererOutput.s
//
// Four exported symbols (Itanium C1/C2 pairs — base and complete constructors
// are byte-identical for this non-virtual POD, matching the ABI):
//   __ZN16HGRendererOutputC2EP6HGNodeP8HGBitmap                          @0x000e8eb0
//   __ZN16HGRendererOutputC1EP6HGNodeP8HGBitmap                          @0x000e8ef0
//   __ZN16HGRendererOutputC2EP6HGNode6HGRect8HGFormat24HGRendererBufferLocation @0x000e8f30
//   __ZN16HGRendererOutputC1EP6HGNode6HGRect8HGFormat24HGRendererBufferLocation @0x000e8f60
//
// RIP-relative data symbol referenced:
//   _HGRectNull (Helium __DATA_CONST, ported in HGRect.ts) — 16 zero bytes,
//   HGRect{x:0, y:0, right:0, bottom:0}.
//
// STRUCT LAYOUT (recovered from stores in the two constructors — total 40 bytes,
// no padding thanks to 16-byte HGRect alignment):
//   0x00  HGNode*                       node
//   0x08  HGBitmap*                     bitmap        (0 in the rect variant)
//   0x10  HGRect                        rect          (16 bytes = 4 * i32)
//   0x20  HGFormat                      format        (u32)
//   0x24  HGRendererBufferLocation      location      (u32)

import { HGRect, HGRectNull } from './HGRect';

/** HGFormat — Helium pixel format tag (u32). Enum values live elsewhere in the
 *  framework; treated here as an opaque 32-bit width just like the asm does
 *  (`movl %r8d, 0x20(%rdi)` @0x000e8f47, `movl 0x10(%rdx), %eax` @0x000e8f16). */
export type HGFormat = number;

/** HGRendererBufferLocation — Helium enum tag (u32). Opaque to this file — the
 *  asm only stores it via `movl %r9d, 0x24(%rdi)` @0x000e8f4b, and the bitmap
 *  variant hard-codes zero (`movl $0x0, 0x24(%rdi)` @0x000e8f1c / @0x000e8edc). */
export type HGRendererBufferLocation = number;

/** HGNode — forward-declared in Helium headers; the ctors only take an
 *  `HGNode*` and store it verbatim at 0x00 (`movq %rsi, (%rdi)` @0x000e8eb4 /
 *  @0x000e8ef4 / @0x000e8f34 / @0x000e8f64). No node fields are read. */
export interface HGNode {}

/** HGBitmap — Helium's pixel-buffer descriptor. The bitmap-variant ctor reads
 *  two members at fixed offsets, so those slots are pinned by the asm:
 *    +0x10  u32 format   (`movl 0x10(%rdx), %eax` @0x000e8ed6 / @0x000e8f16)
 *    +0x14  HGRect rect  (`leaq 0x14(%rdx), %rcx`  @0x000e8ebb / @0x000e8efb,
 *                         `movups (%rcx), %xmm0`   @0x000e8ecd / @0x000e8f0d)
 *  Anything else on HGBitmap is not observed here and is left to the class's
 *  own port. */
export interface HGBitmap {
  /** @Helium HGBitmap +0x10 — u32 format tag. */
  format: HGFormat;
  /** @Helium HGBitmap +0x14 — 16-byte HGRect (x, y, right, bottom : i32). */
  rect: HGRect;
}

/**
 * HGRendererOutput — a 40-byte POD paired to a render target: a node, an
 * optional source bitmap, a rect (either inherited from the bitmap or supplied
 * explicitly), a pixel-format tag, and a buffer-location tag.
 *
 * The four exported constructors (@0x000e8eb0, @0x000e8ef0, @0x000e8f30,
 * @0x000e8f60) share this exact layout — they only differ in how the four
 * value fields are initialized.
 */
export class HGRendererOutput {
  /** @Helium HGRendererOutput +0x00 — `movq %rsi, (%rdi)` @0x000e8eb4 /
   *  @0x000e8ef4 / @0x000e8f34 / @0x000e8f64. */
  node: HGNode | null;

  /** @Helium HGRendererOutput +0x08 — `movq %rdx, 0x8(%rdi)` @0x000e8eb7 /
   *  @0x000e8ef7 (bitmap variant) OR `movq $0x0, 0x8(%rdi)` @0x000e8f37 /
   *  @0x000e8f67 (rect variant). */
  bitmap: HGBitmap | null;

  /** @Helium HGRendererOutput +0x10 — 16-byte HGRect. Rect variant stores the
   *  caller's rect via `movq %rdx, 0x10(%rdi); movq %rcx, 0x18(%rdi)`
   *  @0x000e8f3f/@0x000e8f43 (the SysV ABI passes an HGRect by-value across
   *  %rdx:%rcx = two 8-byte halves). Bitmap variant copies 16 bytes from
   *  either `bitmap+0x14` or `_HGRectNull` via one xmm move
   *  (`movups (%rcx), %xmm0; movups %xmm0, 0x10(%rdi)` @0x000e8ecd/@0x000e8ed0
   *  and @0x000e8f0d/@0x000e8f10). */
  rect: HGRect;

  /** @Helium HGRendererOutput +0x20 — u32 format. Rect variant: `movl %r8d,
   *  0x20(%rdi)` @0x000e8f47 / @0x000e8f77. Bitmap variant: value comes from
   *  the branch `xorl %eax, %eax; testq %rdx, %rdx; jne ...; movl 0x10(%rdx),
   *  %eax; movl %eax, 0x20(%rdi)` @0x000e8ebf..@0x000e8ed9 — i.e. bitmap==null
   *  yields 0, else bitmap->format at +0x10. */
  format: HGFormat;

  /** @Helium HGRendererOutput +0x24 — u32 buffer location. Rect variant:
   *  `movl %r9d, 0x24(%rdi)` @0x000e8f4b / @0x000e8f7b. Bitmap variant is
   *  hard-coded to 0 by `movl $0x0, 0x24(%rdi)` @0x000e8edc / @0x000e8f1c. */
  location: HGRendererBufferLocation;

  /**
   * Overload dispatcher matching both C1/C2 ctor pairs. The two Itanium base
   * (C2) and complete (C1) variants are byte-identical (this class has no
   * virtual bases and no vtable), so one method body faithfully covers all
   * four exported symbols.
   */
  constructor(node: HGNode | null, bitmap: HGBitmap | null);
  constructor(
    node: HGNode | null,
    rect: HGRect,
    format: HGFormat,
    location: HGRendererBufferLocation,
  );
  constructor(
    node: HGNode | null,
    arg1: HGBitmap | null | HGRect,
    format?: HGFormat,
    location?: HGRendererBufferLocation,
  ) {
    // `movq %rsi, (%rdi)` — store node unconditionally at +0x00. Applies to
    // all four ctors @0x000e8eb4 / @0x000e8ef4 / @0x000e8f34 / @0x000e8f64.
    this.node = node;

    if (format === undefined) {
      // ---------- Bitmap variant (C1@0x000e8ef0 / C2@0x000e8eb0) ----------
      const bitmap = arg1 as HGBitmap | null;

      // `movq %rdx, 0x8(%rdi)` @0x000e8eb7 / @0x000e8ef7 — store bitmap ptr.
      this.bitmap = bitmap;

      // `leaq 0x14(%rdx), %rcx`      @0x000e8ebb / @0x000e8efb
      //   — pre-compute &bitmap->rect assuming bitmap != null.
      // `xorl %eax, %eax`            @0x000e8ebf / @0x000e8eff
      //   — default format-scratch to 0.
      // `testq %rdx, %rdx; jne +0x9` @0x000e8ec1..@0x000e8ec4 / @0x000e8f01..@0x000e8f04
      //   — if bitmap == null, fall through and rewrite %rcx to _HGRectNull.
      // `leaq _HGRectNull(%rip), %rcx` @0x000e8ec6 / @0x000e8f06
      //   — pointer swap: read the null-rect literal instead of bitmap+0x14.
      // `movups (%rcx), %xmm0; movups %xmm0, 0x10(%rdi)` — 16-byte copy.
      // `je +0x3; movl 0x10(%rdx), %eax` — only if bitmap != null, load
      //   format = bitmap->format (else keep %eax==0).
      // `movl %eax, 0x20(%rdi)` — store final format.
      // `movl $0x0, 0x24(%rdi)` — location always 0 in the bitmap variant.
      if (bitmap !== null) {
        // Deep-copy the HGRect so the caller's HGBitmap.rect and our own
        // slot are independent (matches the `movups` byte-copy — the asm
        // does not alias; our object owns 16 fresh bytes at +0x10).
        this.rect = {
          x: bitmap.rect.x,
          y: bitmap.rect.y,
          right: bitmap.rect.right,
          bottom: bitmap.rect.bottom,
        };
        this.format = bitmap.format;
      } else {
        this.rect = {
          x: HGRectNull.x,
          y: HGRectNull.y,
          right: HGRectNull.right,
          bottom: HGRectNull.bottom,
        };
        this.format = 0;
      }
      this.location = 0;
    } else {
      // ---------- Rect variant (C1@0x000e8f60 / C2@0x000e8f30) ------------
      const rect = arg1 as HGRect;

      // `movq $0x0, 0x8(%rdi)` @0x000e8f37 / @0x000e8f67 — bitmap := nullptr.
      this.bitmap = null;

      // `movq %rdx, 0x10(%rdi); movq %rcx, 0x18(%rdi)`
      //   @0x000e8f3f/@0x000e8f43 (and @0x000e8f6f/@0x000e8f73)
      //   — the SysV ABI passes HGRect by value in the two 8-byte halves
      //     %rdx (x,y) and %rcx (right,bottom). Copy all four i32 fields.
      this.rect = {
        x: rect.x,
        y: rect.y,
        right: rect.right,
        bottom: rect.bottom,
      };

      // `movl %r8d, 0x20(%rdi)` @0x000e8f47 / @0x000e8f77.
      this.format = format;
      // `movl %r9d, 0x24(%rdi)` @0x000e8f4b / @0x000e8f7b.
      this.location = location as HGRendererBufferLocation;
    }
  }
}
