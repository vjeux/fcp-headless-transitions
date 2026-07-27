// interpolators.ts — the keypoint interpolation-type -> interpolator mapping, DECODED from
// ProChannel (not guessed):
//   OZSpline::interpolate (@0x31ec8) calls OZInterpolators::getInterpolator(type) (@0x447a6):
//     type 10 -> OZXSplineInterpolator, type 12 -> OZBSplineInterpolator, else ->
//     OZInterpolatorStrategies::getInterpolator(type) (@0x44ddc).
//   getInterpolator(type): if type<=0x15, offset = table@0xb0958[type]; returns the interpolator
//     stored at that offset in the strategies singleton. The singleton ctor (@0x44a24) stores:
//       0x08 <- OZConstantInterpolator     (type 0)
//       0x10 <- OZLinearInterpolator       (type 1, 18)
//       0x18 <- OZBezierInterpolator       (types 2,3,4,5,9,10,11,12 fall here in the table)
//       0x20 <- OZCatmullRomInterpolator   (type 6)
//       0x28..0x40 <- OZInterpolator base  (types 7,8,13,14 — ease/exp/log family, base ctor)
//       0x48,0x50,0x58 <- OZLinearInterpolator (types 16,17,15)
//       0x60 <- OZConvexInterpolator       (type 19)
//       0x68 <- OZConcaveInterpolator      (type 20)
//       0x70 <- OZSCurveInterpolator       (type 21)
//   type->offset table @0xb0958 (read from the binary): 0:0x8,1:0x10,2:0x18,3:0x18,4:0x18,5:0x18,
//     6:0x20,7:0x28,8:0x30,9:0x18,10:0x18,11:0x18,12:0x18,13:0x38,14:0x40,15:0x58,16:0x48,17:0x50,
//     18:0x10,19:0x60,20:0x68,21:0x70.
// ACROSS ALL 65 TRANSITIONS the keypoint interpolation attr is overwhelmingly 1 (Linear; 12850),
// then 0 (Constant; 916), 6 (CatmullRom), 16/17 (Linear), 8/7/15. So Linear + Constant cover the
// vast majority; CatmullRom/Bezier are the next tier.

export type InterpKind =
  | "constant" | "linear" | "bezier" | "catmullRom"
  | "convex" | "concave" | "scurve" | "xspline" | "bspline" | "base";

/** DECODED type-id -> interpolator kind (see file header for the binary derivation). */
export function interpKindForType(type: number): InterpKind {
  switch (type) {
    case 0: return "constant";
    case 1: case 18: case 15: case 16: case 17: return "linear";
    case 2: case 3: case 4: case 5: case 9: case 11: return "bezier";
    case 6: return "catmullRom";
    case 10: return "xspline";
    case 12: return "bspline";
    case 19: return "convex";
    case 20: return "concave";
    case 21: return "scurve";
    default: return "base"; // 7,8,13,14 — ease/exp/log family (base OZInterpolator)
  }
}
