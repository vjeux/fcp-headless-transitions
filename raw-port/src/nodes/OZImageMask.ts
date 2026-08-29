// OZImageMask — Ozone's scene node for image and segmentation masks.
//
// This file currently transcribes two methods:
//
//   OZImageMask::setSegmentationStrokeInProgress(OZSegmentationStroke*)
//   MANGLED: __ZN11OZImageMask31setSegmentationStrokeInProgressEP20OZSegmentationStroke
//   ADDRESS: Ozone @0x0032aa00 (x86_64 slice)
//
//   OZImageMask::isSegmentationOperationInverted()
//   MANGLED: __ZN11OZImageMask31isSegmentationOperationInvertedEv
//   ADDRESS: Ozone @0x00325580 (x86_64 slice)
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/
// Ozone.framework/Versions/A/Ozone, x86_64 slice.

/** Opaque segmentation stroke; the setter only stores its pointer. */
export interface OZSegmentationStroke {
  readonly __brand: "OZSegmentationStroke";
}

/**
 * Partial OZImageMask layout recovered by the two transcribed methods.
 *
 * The full C++ object has an OZSceneNode primary base and an OZImageNode
 * subobject at +0x438. These methods establish only the fields they touch;
 * later sibling ports must extend this interface rather than infer unrelated
 * fields.
 */
export interface OZImageMask {
  /** OZSegmentationStroke* stored by the instruction at @Ozone 0x0032aa04. */
  segmentationStrokeInProgress: OZSegmentationStroke | null; // +0xf70

  /** Raw byte at +0xf79, read by @Ozone 0x00325584. */
  readonly segmentationOperationInvertedByte: number;
}

/**
 * `OZImageMask::setSegmentationStrokeInProgress(OZSegmentationStroke*)`
 * — @Ozone 0x0032aa00
 *
 * Transcribes `movq %rsi, 0xf70(%rdi)` at @Ozone 0x0032aa04: store the passed
 * pointer into the object's segmentation-stroke-in-progress slot.
 */
export function OZImageMask_setSegmentationStrokeInProgress(
  imageMask: OZImageMask,
  stroke: OZSegmentationStroke | null,
): void {
  imageMask.segmentationStrokeInProgress = stroke;
}

/**
 * `OZImageMask::isSegmentationOperationInverted()`
 * — @Ozone 0x00325580
 * Mangled: __ZN11OZImageMask31isSegmentationOperationInvertedEv
 *
 * @0x00325584 `movzbl 0xf79(%rdi), %eax` returns the boolean byte directly.
 */
export function OZImageMask_isSegmentationOperationInverted(
  self: OZImageMask,
): number {
  return self.segmentationOperationInvertedByte & 0xff;
}
