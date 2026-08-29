// HGG9D2X_HgcBlur_cs9s.ts — Helium framework.
//
// Faithful x86_64 transcription of the horizontal, factor-two, nine-sample
// convolution implemented by HGG9D2X<HgcBlur_cs9s>::RenderTile(HGTile*).
//
// Binary source:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// Disassembly:
//   raw-port/re/disasm/Helium.__ZN7HGG9D2XI12HgcBlur_cs9sE10RenderTileEP6HGTile.s

import type { HGTile } from "./HGTile.js";

type Float4 = readonly [number, number, number, number];

/**
 * One aligned 16-byte `movaps` load, represented as four float32 lanes.
 * Used for the coefficient loads @0x1f6635..0x1f6640 and source-window loads
 * @0x1f666c..0x1f6695 / @0x1f66c4..0x1f66ca.
 */
function movapsLoad4(buffer: Float32Array, base: number): Float4 {
  const x = buffer[base];
  const y = buffer[base + 1];
  const z = buffer[base + 2];
  const w = buffer[base + 3];
  if (x === undefined || y === undefined || z === undefined || w === undefined) {
    // The machine's aligned load would fault rather than fabricate values.
    throw new RangeError(`movaps source outside buffer at float index ${base}`);
  }
  return [x, y, z, w];
}

/** Mirrors one lane of @0x1f66cf..0x1f670a, including every f32 rounding point. */
function convolveLane(
  w0: number,
  w1: number,
  w2: number,
  w3: number,
  w4: number,
  pm4: number,
  pm3: number,
  pm2: number,
  pm1: number,
  p0: number,
  pp1: number,
  pp2: number,
  pp3: number,
  pp4: number,
): number {
  let acc = Math.fround(w0 * p0); // @0x1f66d3

  let pair = Math.fround(pp1 + pm1); // @0x1f66db
  acc = Math.fround(Math.fround(w1 * pair) + acc); // @0x1f66df..0x1f66e3

  pair = Math.fround(pp2 + pm2); // @0x1f66eb
  acc = Math.fround(Math.fround(w2 * pair) + acc); // @0x1f66ef..0x1f66f3

  pair = Math.fround(pp3 + pm3); // @0x1f66f7
  acc = Math.fround(Math.fround(w3 * pair) + acc); // @0x1f66fb..0x1f66ff

  pair = Math.fround(pp4 + pm4); // @0x1f6703
  return Math.fround(Math.fround(w4 * pair) + acc); // @0x1f6707..0x1f670a
}

/**
 * HGG9D2X<HgcBlur_cs9s>, represented with only the field this claimed method
 * reads. The binary loads a pointer from `this+0x30`, then reads five packed
 * float4 tap vectors from offsets +0x00, +0x10, +0x20, +0x30 and +0x40.
 */
export class HGG9D2X_HgcBlur_cs9s {
  /**
   * @+0x30 pointer to five packed float4 convolution taps.
   * Proven by @Helium 0x1f6631 followed by movaps loads @0x1f6635..0x1f6640.
   */
  coefficients!: Float32Array;

  /**
   * HGG9D2X<HgcBlur_cs9s>::RenderTile(HGTile*)
   * @Helium __ZN7HGG9D2XI12HgcBlur_cs9sE10RenderTileEP6HGTile
   * @0x1f6610..0x1f6740
   *
   * The outer loop covers `bottom-top` rows. For each output pixel it samples
   * one input pixel at the tile's `left + 2*x` coordinate and its four
   * neighbours on each side. Each sample and coefficient is a packed RGBA
   * float4. The arithmetic is the exact five-stage SSE order:
   *
   *   w0*p[0]
   *     + w1*(p[-1] + p[1])
   *     + w2*(p[-2] + p[2])
   *     + w3*(p[-3] + p[3])
   *     + w4*(p[-4] + p[4])
   *
   * `Math.fround` after every `addps` and `mulps` preserves the binary32
   * rounding points of @0x1f66d3..0x1f670a. The register-window rotation at
   * @0x1f6717..0x1f672a is mirrored below rather than reloading old samples;
   * this also preserves the machine's load-before-store behaviour if buffers
   * ever alias.
   */
  RenderTile(tile: HGTile): void {
    // @0x1f6610..0x1f6616: signed int32 height, with a `jle` empty gate.
    const height = (tile.bottom - tile.top) | 0;
    if (height <= 0) return;

    // @0x1f661c..0x1f6627: width = right-left; only zero is an empty gate.
    const left = tile.left | 0;
    const width = (tile.right - left) | 0;
    if (width === 0) return;

    // @0x1f6631..0x1f6640: this+0x30, then five aligned float4 loads.
    const w0 = movapsLoad4(this.coefficients, 0);
    const w1 = movapsLoad4(this.coefficients, 4);
    const w2 = movapsLoad4(this.coefficients, 8);
    const w3 = movapsLoad4(this.coefficients, 12);
    const w4 = movapsLoad4(this.coefficients, 16);

    // The binary dereferences these fields without null checks.
    const sourcePlane = tile.texPlanes[0]!;
    const source = sourcePlane.pixels!; // @0x1f6650 this HGTile+0x50
    const sourceStride = sourcePlane.stride | 0; // @0x1f6654 this HGTile+0x58
    const destination = tile.outSlot!; // @0x1f66a2 this HGTile+0x10
    const destinationStride = tile.outStride | 0; // @0x1f6695 this HGTile+0x18

    // @0x1f6648..0x1f6737: row counter starts at zero and advances to height.
    for (let row = 0; row !== height; row = (row + 1) | 0) {
      // @0x1f6650..0x1f666c: input row + tile.left, in 16-byte pixels.
      const sourceCenter = Math.imul(row, sourceStride) + left;

      // @0x1f666c..0x1f6695: preload p[-4] through p[+2] into SSE registers.
      let pm4 = movapsLoad4(source, (sourceCenter - 4) * 4);
      let pm3 = movapsLoad4(source, (sourceCenter - 3) * 4);
      let pm2 = movapsLoad4(source, (sourceCenter - 2) * 4);
      let pm1 = movapsLoad4(source, (sourceCenter - 1) * 4);
      let p0 = movapsLoad4(source, sourceCenter * 4);
      let pp1 = movapsLoad4(source, (sourceCenter + 1) * 4);
      let pp2 = movapsLoad4(source, (sourceCenter + 2) * 4);

      // @0x1f6695..0x1f66a2: output rows begin at outSlot + row*outStride.
      const destinationRow = Math.imul(row, destinationStride) * 4;

      // @0x1f6648 / @0x1f66b0 / @0x1f672e: the machine counter starts at
      // left-right (-width) and increments until zero. Keeping that counter,
      // rather than using x<width, preserves the exact int32 loop condition.
      let remaining = (left - tile.right) | 0;
      let x = 0;
      do {
        // @0x1f66c4..0x1f66ca: factor-two horizontal advance loads p[+3],p[+4].
        const incoming = sourceCenter + Math.imul(x, 2);
        const pp3 = movapsLoad4(source, (incoming + 3) * 4);
        const pp4 = movapsLoad4(source, (incoming + 4) * 4);
        const outBase = destinationRow + x * 4;

        // @0x1f66cf..0x1f670e: four packed lanes, with one rounding point for
        // every SSE addps/mulps instruction and in the same accumulation order.
        destination[outBase] = convolveLane(
          w0[0], w1[0], w2[0], w3[0], w4[0],
          pm4[0], pm3[0], pm2[0], pm1[0], p0[0], pp1[0], pp2[0], pp3[0], pp4[0],
        );
        destination[outBase + 1] = convolveLane(
          w0[1], w1[1], w2[1], w3[1], w4[1],
          pm4[1], pm3[1], pm2[1], pm1[1], p0[1], pp1[1], pp2[1], pp3[1], pp4[1],
        );
        destination[outBase + 2] = convolveLane(
          w0[2], w1[2], w2[2], w3[2], w4[2],
          pm4[2], pm3[2], pm2[2], pm1[2], p0[2], pp1[2], pp2[2], pp3[2], pp4[2],
        );
        destination[outBase + 3] = convolveLane(
          w0[3], w1[3], w2[3], w3[3], w4[3],
          pm4[3], pm3[3], pm2[3], pm1[3], p0[3], pp1[3], pp2[3], pp3[3], pp4[3],
        ); // @0x1f670e movaps

        // @0x1f6717..0x1f672a: slide the nine-sample window by two pixels.
        pm4 = pm2;
        pm3 = pm1;
        pm2 = p0;
        pm1 = pp1;
        p0 = pp2;
        pp1 = pp3;
        pp2 = pp4;

        x = (x + 1) | 0;
        remaining = (remaining + 1) | 0;
      } while (remaining !== 0);
    }

    // @0x1f673e: xorl %eax,%eax before the void return.
  }
}
