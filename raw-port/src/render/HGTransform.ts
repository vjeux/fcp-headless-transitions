// HGTransform — Helium 4x4 double-precision transform matrix.
// Class boundary matches Helium's `HGTransform` (see /tmp/Helium_demangled.txt).
// Base: HGObject (ref-counted). Struct size = 0x90 bytes.
//
// STRUCT LAYOUT (recovered from ctor @0x1b41d0 and every accessor):
//   +0x00  vtable pointer          (HGTransform vtable @0x872fb3+RIP -> stored via C1 ctor)
//   +0x08  HGObject base state     (refcount + rtti; managed by HGObject ctor)
//   +0x10..+0x88  16 doubles       = 4x4 matrix, column-major, stride 8 bytes.
//                                    m[i][j] lives at offset 0x10 + (i + 4*j)*8 == 0x10 + i*8 + j*32
//                                    Equivalently: column j occupies bytes [0x10+32*j .. 0x30+32*j).
//                                    identity: [0]=1.0 @0x10, [5]=1.0 @0x38,
//                                              [10]=1.0 @0x60, [15]=1.0 @0x88 (@0x1b4207-0x1b421d).
//   sizeof == 0x90.
//
// Column-major index mapping (used throughout this file, mirrors the offsets exactly):
//     m[i + 4*j] == matrix column j, row i   (i in [0..3], j in [0..3])
//     offset of m[i + 4*j] = 0x10 + (i + 4*j)*8
//
// Disasm sources: raw-port/re/disasm/Helium.HGTransform.*.s (all @Helium ~0x1b41d0..0x1b6920).
// vtable slots relevant here (raw-port/army/tools/resolve.py Helium vtable HGTransform):
//     *0x38 -> HGTransform::LoadIdentity()                       @0x1b4480
//     *0x40 -> HGTransform::LoadMatrixf(float const*)            @0x1b44f0
//     *0x48 -> HGTransform::LoadMatrixd(double const*)           @0x1b4540
//     *0xc0 -> HGTransform::Multiply(HGTransform const*)         @0x1b5020
//     *0xc8 -> HGTransform::PreMultiply(HGTransform const*)      @0x1b5240
//     *0xd0 -> HGTransform::Transform(float*, float const*, int) @0x1b55e0
//     *0xd8 -> HGTransform::Project(float*, int, int) const      @0x1b59d0
//     *0xe0 -> HGTransform::IsIdentity() const                   @0x1b63b0
//
// RIP-relative constants (resolved via raw-port/army/tools/resolve.py Helium const <addr>):
//     @Helium 0x3ca260  double 1.0                     (identity diagonal; used by IsIdentity, IsXYFlip)
//     @Helium 0x85d3b8  double 3.814697265625e-06 = 2^-18
//                                                     (HasPerspective epsilon @0x1b6823)
//     @Helium 0x85aad0  16-byte sign-abs mask 0x7FFFFFFF_FFFFFFFF x2
//                                                     (used to strip sign for |x| comparisons)
//     @Helium 0x85fce0  16-byte sign-negate mask 0x80000000_00000000 x2
//                                                     (xorpd -> negate double)

export const HG_TRANSFORM_STRUCT_SIZE = 0x90;

/**
 * HGTransform — 4x4 double matrix (column-major).
 * Ports HGTransform from Helium; see @Helium 0x1b4170..0x1b6920.
 * See raw-port/re/disasm/Helium.HGTransform.*.s for the source disassembly of every method.
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

  /** HGTransform::GetMatrixPtr() const @Helium 0x1b4470.
   *  Leaf: `leaq 0x10(%rdi), %rax` — returns pointer to the 16-double column-major storage.
   *  In this port we hand back the Float64Array directly. */
  public GetMatrixPtr(): Float64Array {
    return this.m;
  }

  /** HGTransform::LoadIdentity() @Helium 0x1b4480.
   *  Zero every double slot then write 1.0 to m[0], m[5], m[10], m[15]
   *  (@0x1b4484-0x1b44b9). */
  public LoadIdentity(): void {
    this.m.fill(0);
    this.m[0] = 1.0;
    this.m[5] = 1.0;
    this.m[10] = 1.0;
    this.m[15] = 1.0;
  }
}
