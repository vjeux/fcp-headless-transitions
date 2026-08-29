// PCPlane_double.ts — ProCore's PCPlane<double> ray intersection.
//
// Faithfully transcribed from the x86_64 ProCore symbol
//   __ZNK7PCPlaneIdE9intersectERK6PCRay3IdER9PCVector3IdE
//   PCPlane<double>::intersect(PCRay3<double> const&, PCVector3<double>&) const
//   @ProCore 0x1a396
//
// ABI layouts recovered directly from the loads in this body:
//   PCPlane<double>  +0x00/+0x08/+0x10 point x/y/z
//                    +0x18/+0x20/+0x28 normal x/y/z
//   PCRay3<double>   +0x00/+0x08/+0x10 origin x/y/z
//                    +0x18/+0x20/+0x28 direction x/y/z
//   PCVector3<double> out +0x00/+0x08/+0x10 x/y/z
//
// The shared ProCore constants are:
//   @ProCore 0x122670  packed 0x7fffffffffffffff absolute-value mask
//   @ProCore 0x122860  f64 1.0000000116860974e-7 normal-length epsilon

/** PCPlane<double>'s six contiguous f64 words: point followed by normal. */
export type PCPlaneDoubleStorage = Float64Array;

/** PCRay3<double>'s six contiguous f64 words: origin followed by direction. */
export type PCRay3DoubleStorage = Float64Array;

/**
 * `PCPlane<double>::intersect(PCRay3<double> const&, PCVector3<double>&) const`
 * @ProCore 0x1a396
 *
 * Returns true and writes `outPoint` when the ray/plane parameter is finite.
 * For an infinite or NaN parameter it returns false and leaves `outPoint`
 * untouched. The plane normal is conditionally normalized when its length is
 * not below the binary's epsilon; the operation order below mirrors the packed
 * SSE lanes because changing the grouping can change the final f64 bits.
 */
export function PCPlane_double_intersect(
  plane: PCPlaneDoubleStorage,
  ray: PCRay3DoubleStorage,
  outPoint: Float64Array,
): boolean {
  // @0x1a39a..0x1a3b1 — plane point and normal components.
  const normalZ = plane[5]; // +0x28
  const normalZSquared = normalZ * normalZ;
  const pointX = plane[0]; // +0x00
  const pointY = plane[1]; // +0x08
  const pointZ = plane[2]; // +0x10

  // @0x1a3b6..0x1a3c9 — point - ray origin, preserving the machine's
  // three independent scalar subtractions.
  const originZ = ray[2]; // +0x10
  const deltaZ = pointZ - originZ;
  const originX = ray[0]; // +0x00
  const originY = ray[1]; // +0x08
  const deltaY = pointY - originY;
  const deltaX = pointX - originX;

  // @0x1a3cd — ray direction x/y. @0x1a40a loads direction z.
  const directionX = ray[3]; // +0x18
  const directionY = ray[4]; // +0x20
  const directionZ = ray[5]; // +0x28

  // @0x1a3d2..0x1a3ea — packed square/horizontal-add of normal x/y,
  // then scalar add of normal z squared and sqrt.
  let normalX = plane[3]; // +0x18
  let normalY = plane[4]; // +0x20
  let normalizedZ = normalZ;
  const normalXYLengthSquared = normalX * normalX + normalY * normalY;
  const normalLength = Math.sqrt(normalXYLengthSquared + normalZSquared);

  // @0x1a3ef — andpd with the sign-clearing mask @ProCore 0x122670.
  const absoluteNormalLength = Math.abs(normalLength);
  // @0x1a3fc..0x1a40f — compare epsilon @ProCore 0x122860 with |length|.
  // `ucomisd %xmm0,%xmm6; setbe` is true for |length| >= epsilon AND for
  // unordered (NaN); `ja` skips only when epsilon > |length|.
  const normalize = !(NORMAL_LENGTH_EPSILON > absoluteNormalLength);

  // @0x1a412..0x1a437 — blend normalized x/y into xmm9 and conditionally
  // divide z by the same length. Keeping three divisions mirrors divpd/divsd.
  if (normalize) {
    normalX = normalX / normalLength;
    normalY = normalY / normalLength;
    normalizedZ = normalizedZ / normalLength;
  }

  // @0x1a43c..0x1a475 — the two packed lanes form denominator and numerator.
  // Preserve the exact association/order from the SIMD instructions:
  //   lane 0 = dz*nz + (dx*nx + dy*ny)
  //   lane 1 = (pz-oz)*nz + ((py-oy)*ny + (px-ox)*nx)
  const denominatorXY = directionX * normalX + directionY * normalY;
  const numeratorXY = deltaY * normalY + deltaX * normalX;
  const denominator = directionZ * normalizedZ + denominatorXY;
  const numerator = deltaZ * normalizedZ + numeratorXY;

  // @0x1a47a..0x1a482 — ray parameter t = numerator / denominator.
  const t = numerator / denominator;

  // @0x1a486..0x1a49d and @0x1a4bc..0x1a4c9 clear t's sign bit and compare
  // its magnitude bits with DBL_MAX / +infinity. This is exactly a finite
  // test: both infinities and every NaN return false and skip the stores.
  if (!Number.isFinite(t)) {
    return false;
  }

  // @0x1a49f..0x1a4b7 — out = origin + direction * t.
  outPoint[0] = originX + directionX * t; // +0x00
  outPoint[1] = originY + directionY * t; // +0x08
  outPoint[2] = originZ + directionZ * t; // +0x10
  return true;
}

/** @ProCore 0x122860 — f64 bits 0x3e7ad7f2a0000000. */
const NORMAL_LENGTH_EPSILON = 1.0000000116860974e-7;
