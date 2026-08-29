// OZImageMask — Ozone's scene node for image and segmentation masks.
//
// This file currently transcribes one method:
//
//   OZImageMask::setSegmentationStrokeInProgress(OZSegmentationStroke*)
//   MANGLED: __ZN11OZImageMask31setSegmentationStrokeInProgressEP20OZSegmentationStroke
//   ADDRESS: Ozone @0x0032aa00 (x86_64 slice)
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/
// Ozone.framework/Versions/A/Ozone, x86_64 slice. The complete function is:
//
//   0x32aa00  pushq %rbp
//   0x32aa01  movq  %rsp, %rbp
//   0x32aa04  movq  %rsi, 0xf70(%rdi)
//   0x32aa0b  popq  %rbp
//   0x32aa0c  retq
//
// Apart from the standard frame prologue and epilogue, the only instruction is
// the pointer store at 0x32aa04. There are no branches, calls, or other effects.

/** Opaque segmentation stroke; this method only stores its pointer. */
export interface OZSegmentationStroke {
  readonly __brand: "OZSegmentationStroke";
}

/**
 * Partial OZImageMask layout recovered by this claimed method.
 *
 * The full C++ object has an OZSceneNode primary base and an OZImageNode
 * subobject at +0x438. This method establishes only the field it touches; later
 * sibling ports must extend this interface rather than infer unrelated fields.
 */
export interface OZImageMask {
  /** OZSegmentationStroke* stored by the instruction at @Ozone 0x0032aa04. */
  segmentationStrokeInProgress: OZSegmentationStroke | null; // +0xf70
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
