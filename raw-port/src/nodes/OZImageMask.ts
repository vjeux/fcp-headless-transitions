/**
 * OZImageMask — Ozone.framework image-mask scene node.
 *
 * This file models only the field read by the currently ported method. The
 * x86_64 body loads one byte from `this + 0xf79`; no constructor or setter is
 * inferred here.
 * Source disassembly:
 * raw-port/re/disasm/__ZN11OZImageMask31isSegmentationOperationInvertedEv.s
 */
export interface OZImageMask {
  /** Raw byte at +0xf79, read by @Ozone 0x325584. */
  readonly segmentationOperationInvertedByte: number;
}

/**
 * OZImageMask::isSegmentationOperationInverted()
 * @Ozone 0x325580
 * Mangled: __ZN11OZImageMask31isSegmentationOperationInvertedEv
 *
 * @0x325584 `movzbl 0xf79(%rdi), %eax` returns the boolean byte directly.
 */
export function OZImageMask_isSegmentationOperationInverted(
  self: OZImageMask,
): number {
  return self.segmentationOperationInvertedByte & 0xff;
}
