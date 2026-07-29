// HGTransform — Helium 4x4 double-precision transform matrix.
// Class boundary matches Helium's `HGTransform` (see /tmp/Helium_demangled.txt).
// Base: HGObject (ref-counted). Struct size = 0x90 bytes.
//
// STRUCT LAYOUT (recovered from ctor @0x1b41d0 and every accessor):
//   +0x00  vtable pointer          (HGTransform vtable @0x872fb3+RIP -> stored via C1 ctor)
//   +0x08  HGObject base state     (refcount + rtti; managed by HGObject ctor)
//   +0x10..+0x88  16 doubles       = 4x4 matrix, column-major, stride 8 bytes.
//                                    m[i][j] lives at offset 0x10 + (i + 4*j)*8 == 0x10 + i*8 + j*32
//                                    identity: [0]=1.0 @0x10, [5]=1.0 @0x38,
//                                              [10]=1.0 @0x60, [15]=1.0 @0x88 (@0x1b4207-0x1b421d).
//   sizeof == 0x90.
//
// This file will grow as methods are transcribed. Stub-only for the initial commit.

export const HG_TRANSFORM_STRUCT_SIZE = 0x90;

/**
 * HGTransform — 4x4 double matrix (column-major).
 * Ports HGTransform from Helium; see @Helium 0x1b4170..0x1b6880.
 */
export class HGTransform {
  /** m[0..15], column-major. m[i + 4*j] == matrix column j, row i. */
  public readonly m: Float64Array;

  /** HGTransform::HGTransform() @Helium 0x1b41d0.
   *  Constructs an identity 4x4. Body:
   *    - HGObject::HGObject() (@0x1b41d9)
   *    - vtable slot store (@0x1b41de-0x1b41e5)
   *    - xorps xmm0,xmm0; movups xmm0,{0x18,0x28,0x38,0x48,0x58,0x68,0x78} on rbx
   *      (@0x1b41e8-0x1b4203)  -> zeros doubles [1..14] except we then overwrite diagonals.
   *    - movabsq 0x3ff0000000000000; movq rax->{0x10,0x38,0x60,0x88}
   *      (@0x1b4207-0x1b421d)  -> writes 1.0 to m[0],m[5],m[10],m[15].
   */
  public constructor() {
    this.m = new Float64Array(16);
    this.m[0] = 1.0;
    this.m[5] = 1.0;
    this.m[10] = 1.0;
    this.m[15] = 1.0;
  }
}
