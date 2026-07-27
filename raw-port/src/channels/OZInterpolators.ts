// OZInterpolators — the interpolator REGISTRY / type dispatch (ProChannel.framework).
// Faithful port. Decode: OZInterpolators::getInterpolator(uint) @ProChannel 0x447a6 +
// OZInterpolatorStrategies::getInterpolator(uint) @0x44ddc (re/INTERPOLATION_TYPES.md).
//   N==10 -> XSpline, N==12 -> BSpline; else if N<=0x15: offset = table[N] (jump table @0xb0958),
//   returns the singleton interpolator at that offset (ctor @0x44a24 stores the classes); else the
//   default offset 0x18 = Bezier. The offset->class + type->offset tables were read from the binary.

export type InterpKind =
  | "constant" | "linear" | "bezier" | "catmullRom" | "convex" | "concave" | "scurve"
  | "xspline" | "bspline" | "base";

// type-id -> singleton offset (table @0xb0958, read from the binary; entries 0..0x15).
const TYPE_TO_OFFSET: Record<number, number> = {
  0:0x08, 1:0x10, 2:0x18, 3:0x18, 4:0x18, 5:0x18, 6:0x20, 7:0x28, 8:0x30,
  9:0x18, 10:0x18, 11:0x18, 12:0x18, 13:0x38, 14:0x40, 15:0x58, 16:0x48,
  17:0x50, 18:0x10, 19:0x60, 20:0x68, 21:0x70,
};
// singleton offset -> interpolator class (ctor @0x44a24 store order, read from the binary).
const OFFSET_TO_KIND: Record<number, InterpKind> = {
  0x08:"constant", 0x10:"linear", 0x18:"bezier", 0x20:"catmullRom",
  0x28:"base", 0x30:"base", 0x38:"base", 0x40:"base",
  0x48:"linear", 0x50:"linear", 0x58:"linear",
  0x60:"convex", 0x68:"concave", 0x70:"scurve",
};

/** OZInterpolators::getInterpolator(type) — returns the interpolator KIND for a keypoint's type. */
export function getInterpolatorKind(type: number): InterpKind {
  if (type === 10) return "xspline";     // OZInterpolators::getInterpolator pre-empts 10/12
  if (type === 12) return "bspline";
  if (type >= 0 && type <= 0x15) return OFFSET_TO_KIND[TYPE_TO_OFFSET[type]] ?? "bezier";
  return "bezier";                        // else default offset 0x18
}
