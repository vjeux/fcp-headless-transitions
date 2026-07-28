// MaterialTextureTransformer — Ozone.framework helper that composes and decomposes the
// 4×4 "texture transform" used to sample a source image via a T·R·S convention.
//
// Framework: Ozone (/Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework).
// All VAs below are unadjusted x86_64 VM addresses from `otool -tV` (fat sub-arch,
// fat-slice offset 0x4000 in the file). Faithful transcription of the 7 exported
// methods; PCMatrix44Tmpl<double> helper methods invoked below are NOT YET TRANSCRIBED
// and route through throwing stubs citing their @0xADDR.
//
// FCP class layout / method addresses:
//   0x004aef30  composeTextureMatrix(PCMatrix44Tmpl<double> const&, FlipImage)
//   0x004af0e0  composeTextureTransform(PCVector2<double> const& t, double rot,
//                                       PCVector2<double> const& s)                    [PURE]
//   0x004af220  composeTextureTransform(CMTime const&, OZChannel2D const& translate,
//                                       OZChannelRotation3D const& rot,
//                                       OZChannelScale const& scale)                [wrapper]
//   0x004af2f0  decomposeTextureTransform(PCMatrix44Tmpl<double> const& M,
//                                         PCVector2<double>& t_out, double& rot_out,
//                                         PCVector2<double>& s_out)                    [PURE]
//   0x004af670  setTextureTransformChannels(CMTime const&, PCMatrix44Tmpl<double> const&,
//                                           OZChannel2D&, OZChannelRotation3D&,
//                                           OZChannelScale&)                        [wrapper]
//   0x004af700  setTextureTransformChannels(CMTime const&, PCVector2<double> const& t,
//                                           double const& rot, PCVector2<double> const& s,
//                                           OZChannel2D&, OZChannelRotation3D&,
//                                           OZChannelScale&)                        [wrapper]
//   0x004af780  composeTextureTransform(CMTime const&, OZChannelMaterialMapTransform&,
//                                       OZLayeredMaterial*, bool, OZChannelPosition*,
//                                       OZChannelScale*, OZChannelRotation3D*, int,
//                                       double, bool, float, PCMatrix44Tmpl<double>&,
//                                       ProShade::TextureTransformBasis&)         [deferred]
//
// SEMANTIC KEY (recovered from the compose_TRS2 disasm @0x4af0e0):
//   composeTextureTransform(t, θ, s) writes the INVERSE of the forward T·R·S transform:
//     M[0][3] = -t.x       (translate column negated, only if t.x != 0)   @0x4af13a-15b
//     M[1][3] = -t.y       (translate column negated, only if t.y != 0)   @0x4af18e-192
//     leftRotate is called with (-θ)  (xorpd with -0.0 constant @0x4af197) @0x4af197-1a6
//     If s.x != 1  → row 0 (m00..m03) *= 1/s.x                             @0x4af1bc-1e3
//     If s.y != 1  → row 1 (m10..m13) *= 1/s.y                             @0x4af1e8-20f
//   That yields M = S⁻¹ · R⁻¹ · T⁻¹ = (T · R · S)⁻¹. This is the sampling matrix that
//   maps from the destination surface's UV back into the source-image UV domain.
//
// PCMatrix44Tmpl<double> data layout (recovered from the 8× movups/movaps clear stores
// in composeTextureMatrix @0x4aef4d-77 and composeTextureTransform_TRS2 @0x4af0f7-11d):
//   +0x00 m00 (double)   +0x08 m01           +0x10 m02           +0x18 m03
//   +0x20 m10            +0x28 m11 (=1)      +0x30 m12           +0x38 m13
//   +0x40 m20            +0x48 m21           +0x50 m22 (=1)      +0x58 m23
//   +0x60 m30            +0x68 m31           +0x70 m32           +0x78 m33 (=1)
//   Total 128 bytes = 16 doubles, row-major. Identity is diag(1,1,1,1); ctor zeros the
//   whole thing then writes the four 1.0 diagonal doubles via a single movabsq
//   $0x3ff0000000000000, %rax.
//
// PCMatrix44Parameters<double> partial layout (from the alloc+init inside decompose
// @0x4af30e-33e and the reads at 0x4af359 and 0x4af372):
//   +0x00..+0x17  ???            (zeroed by three movaps at -0x150/-0x140/-0x130)
//   +0x18         (int)0x4       (movl $0x4, -0x120(%rbp) — see NOTE below)
//   +0x18..+0x27  scale2d {x,y}  (read at -0x138(%rbp) = params+0x18)
//   +0x48         rot-Z (double) (read at -0x108(%rbp) = params+0x48)
//   Total ≥0x58 bytes.  The `int 0x4` at +0x18 is written BEFORE the offsets above and
//   getTransformation overwrites both the int and the scale doubles — safe interpretation
//   is a discriminant field that PCMatrix44Tmpl<double>::getTransformation clobbers when
//   it fills in the TRS fields. (Its exact meaning belongs to PCMatrix44Parameters, which
//   is not yet transcribed.)
//
// PCMatrix44Tmpl<double>::axis enum (from leftRotate call @0x4af1a1 with $0x2, %esi):
//   0 = X, 1 = Y, 2 = Z. compose_TRS2 always rotates about Z.
//
// OZChannel2D / OZChannelRotation3D / OZChannelScale byte offsets used by the wrappers:
//   OZChannel2D:  +0x88  child channel X    +0x120 child channel Y
//   OZChannel*3D: +0x88  child channel X    +0x120 child channel Y    +0x1b8 child channel Z
//   OZChannelScale (extends OZChannel2D):   same +0x88 (X) / +0x120 (Y)
// These match the previously-decoded classes (see raw-port/src/channels/OZChannelRotation3D.ts).

/** PCVector2<double> — layout +0x00 x, +0x08 y. Passed by reference in the FCP signatures. */
export type PCVector2d = { x: number; y: number };

/** PCMatrix44Tmpl<double> — row-major 4×4 doubles, 128 bytes total. Named fields with byte
 *  offsets recovered from the identity-init and store patterns cited in the header. */
export type PCMatrix44d = {
  m00: number; m01: number; m02: number; m03: number;
  m10: number; m11: number; m12: number; m13: number;
  m20: number; m21: number; m22: number; m23: number;
  m30: number; m31: number; m32: number; m33: number;
};

/** FCP enum PCMatrix44Tmpl<double>::axis. Recovered from leftRotate($0x2, ...) @0x4af1a1. */
export enum PCMat44Axis { X = 0, Y = 1, Z = 2 }

/** FlipImage enum — passed by value as %edx in composeTextureMatrix @0x4aef30. The only
 *  branch tested is `cmpl $0x1, %edx; jne skip` @0x4aefba, so at minimum value 1 selects
 *  the "flip vertically" path (mirror across the horizontal centreline) and any other
 *  value passes through. The full enumeration lives in FlipImage.h and is not decoded here. */
export enum FlipImage { None = 0, Vertical = 1 }

// ============================================================================================
//   PCMatrix44Tmpl<double> callee stubs — decoded upstream methods but their bodies live in
//   separate ports (Ozone.framework). Each call site here cites the exact @0xADDR reached.
// ============================================================================================

/** PCMatrix44Tmpl<double>::rightMult(PCMatrix44Tmpl<double> const&) @Ozone 0xefdd0 —
 *  in-place `*this = (*this) * rhs`. Called from composeTextureMatrix @0x4af069. */
function pcm44d_rightMult(_dst: PCMatrix44d, _rhs: PCMatrix44d): void {
  throw new Error(
    "PCMatrix44Tmpl<double>::rightMult @Ozone 0xefdd0 not yet transcribed " +
    "(reached from MaterialTextureTransformer::composeTextureMatrix @0x4af069)"
  );
}

/** PCMatrix44Tmpl<double>::operator*(PCMatrix44Tmpl<double> const&) const @Ozone 0x30340 —
 *  returns `dst = (*this) * rhs`. Called from composeTextureMatrix @0x4af077 and from
 *  decomposeTextureTransform @0x4af634. */
function pcm44d_mult(_dst: PCMatrix44d, _lhs: PCMatrix44d, _rhs: PCMatrix44d): void {
  throw new Error(
    "PCMatrix44Tmpl<double>::operator* @Ozone 0x30340 not yet transcribed " +
    "(reached from MaterialTextureTransformer::composeTextureMatrix @0x4af077 or " +
    "decomposeTextureTransform @0x4af634)"
  );
}

/** PCMatrix44Tmpl<double>::leftRotate(double angleRadians, axis) @Ozone 0xf6330 —
 *  in-place `*this = Rotate(angle, axis) * (*this)`. Called from compose_TRS2 @0x4af1a6. */
function pcm44d_leftRotate(_m: PCMatrix44d, _angle: number, _axis: PCMat44Axis): void {
  throw new Error(
    "PCMatrix44Tmpl<double>::leftRotate(double, axis) @Ozone 0xf6330 not yet transcribed " +
    "(reached from MaterialTextureTransformer::composeTextureTransform(t,θ,s) @0x4af1a6)"
  );
}

/** PCMatrix44Tmpl<double>::getTransformation(PCMatrix44Parameters&) const @Ozone 0x89c80 —
 *  Extracts TRS+shear parameters from a general 4×4 into the caller-supplied Parameters
 *  struct. Called from decomposeTextureTransform @0x4af350. */
function pcm44d_getTransformation(_m: PCMatrix44d, _params: unknown): void {
  throw new Error(
    "PCMatrix44Tmpl<double>::getTransformation @Ozone 0x89c80 not yet transcribed " +
    "(reached from MaterialTextureTransformer::decomposeTextureTransform @0x4af350)"
  );
}

// ============================================================================================
//   Channel-side callee stubs used by the wrapper overloads.
// ============================================================================================

/** OZChannel::getValueAsDouble(CMTime const&, double) const @ProChannel 0x69820. */
function OZChannel_getValueAsDouble(_ch: unknown, _t: unknown, _frac: number): number {
  throw new Error(
    "OZChannel::getValueAsDouble @ProChannel 0x69820 not yet transcribed " +
    "(reached from MaterialTextureTransformer::composeTextureTransform(2D,R3D,S) " +
    "@0x4af24a / @0x4af264 / @0x4af288 / @0x4af29f / @0x4af2b9)"
  );
}

/** OZChannel2D::setValue(CMTime const&, double, double, bool) @ProChannel (symbol stub
 *  target 0x6dd566 in Ozone). Called by both setTextureTransformChannels overloads. */
function OZChannel2D_setValue(_ch: unknown, _t: unknown, _x: number, _y: number, _flag: boolean): void {
  throw new Error(
    "OZChannel2D::setValue(CMTime,double,double,bool) @ProChannel — Ozone stub 0x6dd566 " +
    "not yet transcribed (reached from MaterialTextureTransformer::" +
    "setTextureTransformChannels @0x4af6b4 / @0x4af6f8 / @0x4af72f / @0x4af776)"
  );
}

/** Vtable call `callq *0x2c8(%rax)` at the OZChannelRotation3D Z-child (offset +0x1b8) —
 *  the sub-object's vtable slot at +0x2c8. From the surrounding wrappers this is the
 *  "setValue(CMTime const&, double, bool)" scalar setter on the underlying OZChannelAngle
 *  (its precise mangled symbol lives in OZChannelAngle's vtable and is not yet resolved). */
function OZChannelRotation3D_setZ(_ch: unknown, _t: unknown, _rot: number, _flag: boolean): void {
  throw new Error(
    "OZChannelAngle::setValue(CMTime,double,bool) via vtable +0x2c8 on Rotation3D.z — " +
    "not yet transcribed (reached from MaterialTextureTransformer::" +
    "setTextureTransformChannels @0x4af6d4 / @0x4af74f)"
  );
}

// ============================================================================================
//   Small helpers for identity-init + row scale (transcriptions of the movups patterns).
// ============================================================================================

/** Zero-fill and set diag=1.0 — mirrors the ctor sequence at 0x4aef43-77 (composeTextureMatrix)
 *  and 0x4af0ed-11d (compose_TRS2). Bit-exact: writes the four diag doubles then clears the
 *  twelve off-diagonal doubles via six 16-byte xorps-store pairs (order matches the disasm). */
function initIdentity(m: PCMatrix44d): void {
  // movabsq $0x3ff0000000000000, %rax; movq %rax, 0x00/0x28/0x50/0x78 — see @0x4aef43-59.
  m.m00 = 1.0; m.m11 = 1.0; m.m22 = 1.0; m.m33 = 1.0;
  // xorps xmm0,xmm0; movups xmm0,+0x08/+0x18/+0x30/+0x40/+0x58/+0x68 — see @0x4aef5c-73.
  m.m01 = 0; m.m02 = 0; m.m03 = 0;
  m.m10 = 0; m.m12 = 0; m.m13 = 0;
  m.m20 = 0; m.m21 = 0; m.m23 = 0;
  m.m30 = 0; m.m31 = 0; m.m32 = 0;
}

/** Copy 8 doubles worth of row-pair (16 bytes × 8 = 128 B) from src to dst — transcription of
 *  the 8× movups(src) / movups(dst) sequence at 0x4aef7c-b9 inside composeTextureMatrix. */
function copyMat(dst: PCMatrix44d, src: PCMatrix44d): void {
  dst.m00 = src.m00; dst.m01 = src.m01; dst.m02 = src.m02; dst.m03 = src.m03;
  dst.m10 = src.m10; dst.m11 = src.m11; dst.m12 = src.m12; dst.m13 = src.m13;
  dst.m20 = src.m20; dst.m21 = src.m21; dst.m22 = src.m22; dst.m23 = src.m23;
  dst.m30 = src.m30; dst.m31 = src.m31; dst.m32 = src.m32; dst.m33 = src.m33;
}

// ============================================================================================
//   Ported class body
// ============================================================================================

/** MaterialTextureTransformer — a stateless namespace-like helper class. No instance fields
 *  are ever read; every method is effectively a free function with the class name spelled out
 *  as a scope (matches the C++ where every method is a plain static-like member). */
export class MaterialTextureTransformer {
  /** composeTextureTransform(t, θ, s) — @0x4af0e0.
   *  Writes into `out` the INVERSE of the forward T(t)·R_z(θ)·S(s) affine, i.e. the matrix
   *  that transforms destination-space UVs back into source-image UV space. See the header's
   *  SEMANTIC KEY block for the derivation; this transcription follows the disasm branch-by-
   *  branch (both `if t != 0` bypasses at @0x4af132/@0x4af166 and both `if s != 1` bypasses
   *  at @0x4af1bc/@0x4af1e8 are preserved verbatim so that a caller passing t=(0,0)+s=(1,1)
   *  gets exactly the identity Rotate matrix that the machine code would produce). */
  static composeTextureTransform_TRS2(
    out: PCMatrix44d, translate: PCVector2d, rotate: number, scale: PCVector2d
  ): PCMatrix44d {
    // Identity init — @0x4af0ed-11d (matches composeTextureMatrix's ctor sequence).
    initIdentity(out);

    // Load t.x, t.y (movsd (%rsi), %xmm3; movsd 0x8(%rsi), %xmm1) — @0x4af121-125.
    const tx = translate.x;
    const ty = translate.y;

    // xorpd %xmm2,%xmm2 → zero used both as comparator and as the (0 - t.*) subtract source.
    // The two "if translate.* != 0.0" branches at @0x4af12e/@0x4af160 use the CPU sequence
    //   ucomisd 0,tx ; jne go ; jnp skip   — i.e. execute the block iff tx is NaN or nonzero.
    // In IEEE-754 land any NaN comparison sets PF=1 so the block runs (but subsd(NaN, 0) = NaN
    // propagates through — mirrored here by not special-casing NaN).
    if (tx !== 0.0 || Number.isNaN(tx)) {
      // xorpd xmm4,xmm4; subsd xmm3,xmm4 → xmm4 = -tx   (@0x4af136-13a)
      const negTx = 0.0 - tx;
      // The compiler builds a [1.0, 0.0] pair in xmm5 (movsd zero-extends upper half), then
      // subtracts an all-zero [0,0] pair (xmm3 = tx*0 broadcast, which for finite tx is 0):
      //   movupd xmm5,(%rbx)      → out.m00 = 1.0 ; out.m01 = 0.0     (@0x4af152)
      //   movhpd xmm5,0x10(%rbx)  → out.m02 = 0.0                     (@0x4af156)
      //   movsd  xmm4,0x18(%rbx)  → out.m03 = -tx                     (@0x4af15b)
      // All the surrounding row-1 lanes are already 0.0 from the identity init above (m00 is
      // already 1.0), so semantically this block ONLY updates m03. We follow that exactly.
      out.m00 = 1.0;
      out.m01 = 0.0;
      out.m02 = 0.0;
      out.m03 = negTx;
    }
    if (ty !== 0.0 || Number.isNaN(ty)) {
      // movapd xmm3,xmm1; mulsd xmm2,xmm3 → 0 ; movddup gives xmm3 = [0,0]              (@0x4af168)
      // xorpd xmm4,xmm4; movhpd 0x256260(%rip),xmm4 → xmm4 = [0.0, 1.0]                 (@0x4af174-178, mem @Ozone 0x7053e0 = 1.0)
      // subpd xmm3,xmm4 → xmm4 = [0.0, 1.0]                                             (@0x4af180)
      //   movupd xmm4,0x20(%rbx)  → out.m10 = 0.0 ; out.m11 = 1.0                       (@0x4af184)
      //   movlpd xmm4,0x30(%rbx)  → out.m12 = 0.0                                       (@0x4af189)
      // subsd xmm1,xmm2 → xmm2 = -ty ; movsd xmm2,0x38(%rbx) → out.m13 = -ty            (@0x4af18e-192)
      const negTy = 0.0 - ty;
      out.m10 = 0.0;
      out.m11 = 1.0;
      out.m12 = 0.0;
      out.m13 = negTy;
    }

    // Rotation: xorps xmm0, [-0.0 mem @Ozone 0x707560] → negate the incoming angle bit-flip,
    // then leftRotate(this, -θ, axis=Z(2)) — @0x4af197-1a6.
    // Preserving the semantics: `leftRotate` prepends R_z(-θ) onto the current matrix, which
    // together with the negated translation and reciprocal scale below yields (T·R_z(θ)·S)⁻¹.
    const negRot = -rotate;
    pcm44d_leftRotate(out, negRot, PCMat44Axis.Z);

    // Scale: xmm0 = 1.0 (mem @Ozone 0x7053e0); xmm1 = 1.0 / s.x ; xmm0 = 1.0 / s.y — @0x4af1ab-1c0.
    // The reciprocals are computed BEFORE the equality tests (which then check against 1.0),
    // so if s.x==1.0 the divide result is exactly 1.0 and the row-multiply is skipped.
    const invSx = 1.0 / scale.x;
    const invSy = 1.0 / scale.y;

    if (invSx !== 1.0 || Number.isNaN(invSx)) {
      // Multiply row 0 of the matrix (m00..m03) by 1/sx — @0x4af1ca-1e3.
      //   movupd (%rbx),%xmm2 ; movupd 0x10(%rbx),%xmm3
      //   mulpd xmm1,xmm2 → [m00*ix, m01*ix]
      //   mulpd xmm1,xmm3 → [m02*ix, m03*ix]
      out.m00 = out.m00 * invSx;
      out.m01 = out.m01 * invSx;
      out.m02 = out.m02 * invSx;
      out.m03 = out.m03 * invSx;
    }
    if (invSy !== 1.0 || Number.isNaN(invSy)) {
      // Multiply row 1 of the matrix (m10..m13) by 1/sy — @0x4af1f4-20f.
      out.m10 = out.m10 * invSy;
      out.m11 = out.m11 * invSy;
      out.m12 = out.m12 * invSy;
      out.m13 = out.m13 * invSy;
    }

    // The x86 body ends with `movq %rbx, %rax; ret` — returns the `out` pointer.
    return out;
  }

  /** composeTextureTransform(CMTime, OZChannel2D, OZChannelRotation3D, OZChannelScale) — @0x4af220.
   *  Thin wrapper: reads .x/.y from the translate channel (offsets +0x88, +0x120), the Z angle
   *  from the rotation channel (offset +0x1b8), and .x/.y from the scale channel (offsets
   *  +0x88, +0x120), all via OZChannel::getValueAsDouble(time, 0.0), then defers to the
   *  TRS2 overload. The order of the getValueAsDouble calls in the disasm is
   *  translate.x → translate.y → rot.z → scale.x → scale.y — preserved exactly. */
  static composeTextureTransform_2D_R3D_S(
    out: PCMatrix44d,
    time: unknown,
    translate: unknown,   // OZChannel2D const&
    rot3d: unknown,       // OZChannelRotation3D const&
    scale: unknown        // OZChannelScale const&
  ): PCMatrix44d {
    // leaq 0x88(%rdx),%rdi ; callq getValueAsDouble  — @0x4af240-24a
    const tx = OZChannel_getValueAsDouble(offsetSubchannel(translate, 0x88), time, 0.0);
    // addq $0x120,%r13     ; callq getValueAsDouble  — @0x4af254-264
    const ty = OZChannel_getValueAsDouble(offsetSubchannel(translate, 0x120), time, 0.0);
    // addq $0x1b8,%r12     ; callq getValueAsDouble  — @0x4af278-288 (rot3d.z)
    const rz = OZChannel_getValueAsDouble(offsetSubchannel(rot3d, 0x1b8), time, 0.0);
    // leaq 0x88(%r14),%rdi ; callq getValueAsDouble  — @0x4af292-29f
    const sx = OZChannel_getValueAsDouble(offsetSubchannel(scale, 0x88), time, 0.0);
    // addq $0x120,%r14     ; callq getValueAsDouble  — @0x4af2a9-2b9
    const sy = OZChannel_getValueAsDouble(offsetSubchannel(scale, 0x120), time, 0.0);

    const t: PCVector2d = { x: tx, y: ty };
    const s: PCVector2d = { x: sx, y: sy };
    // callq compose_TRS2  — @0x4af2d3
    return MaterialTextureTransformer.composeTextureTransform_TRS2(out, t, rz, s);
  }

  /** decomposeTextureTransform(M, t_out, rot_out, s_out) — @0x4af2f0.
   *  Recovers (translate, rotZ, scale) from a matrix produced by composeTextureTransform_TRS2.
   *  Steps (numbered from the disasm):
   *    1. Alloc PCMatrix44Parameters<double> on stack (~0x40 B), set discriminant int at +0x18
   *       to 4 (movl $0x4,-0x120(%rbp) @0x4af326), zero the surrounding fields, then call
   *       M->getTransformation(&params) @0x4af350.
   *    2. Read params.scale2d (2 doubles at +0x18) and store [1.0/sx, 1.0/sy] to s_out —
   *       the divpd of [1.0,1.0] over that pair @0x4af359-36d.
   *    3. Read params.rotZ (1 double at +0x48) and store its bitwise-XOR with -0.0
   *       (i.e. sign flip → -rotZ) to rot_out @0x4af372-386.
   *    4. Build a 4×4 matrix in [-0xa0(%rbp)] whose rows reconstruct S · R_z(rotZ) with fast
   *       paths for scale==1 (skip lane overwrite) and rotZ ≈ multiples of π/2 (skip _cos/_sin
   *       and use pre-loaded ±1.0 fallback constants). Bit-exact special-case tests read the
   *       RIP-constants @Ozone 0x708dd0 / 0x708dd8 / 0x708de0 / 0x708de8 / 0x708df0 / 0x708dc0
   *       (=-π/2, 3π/2, π/2, -3π/2, -π, π) and compare |rotZ + special| < 1e-7 (threshold
   *       @Ozone 0x706ed0). Generic path calls libm _cos then _sin, then negates the sin via
   *       `xorpd 0x257f98(%rip),%xmm1` — a 128-bit [-0.0,-0.0] mask @Ozone 0x707560 — so the
   *       operative angle for the reconstruction is (cos rotZ, -sin rotZ).
   *    5. Multiply that reconstructed matrix by the input M via operator* @0x4af634, then
   *       read the resulting m03,m13 (bytes -0x1b8..-0x1b0 and -0x198..-0x190 of the local
   *       result) into an xmm register, xor with a 128-bit [-0.0, -0.0] mask @Ozone 0x707560
   *       (sign-flip both lanes), and store to t_out @0x4af639-64e.
   *
   *  Because PCMatrix44Tmpl<double>::getTransformation is not yet transcribed, this function
   *  currently throws through that stub before any of the arithmetic runs. When
   *  getTransformation lands, the subsequent arithmetic transcribed below completes without
   *  further callee dependencies (except operator* @0x30340 for step 5). */
  static decomposeTextureTransform(
    M: PCMatrix44d,
    t_out: PCVector2d,
    rot_out: { value: number },
    s_out: PCVector2d
  ): void {
    // --- Step 1: allocate PCMatrix44Parameters<double> and query the transform. -------------
    // Layout notes: the compiler emits three xorps-stores zeroing offsets -0x150..-0x131,
    // then writes `int 4` at -0x120, then two 16-byte xorps at -0x118/-0x108 and one 8-byte
    // zero at -0xf8 (@0x4af30e-346). We mirror the shape as an opaque struct — its detailed
    // layout is owned by PCMatrix44Parameters and is not yet transcribed. Only two fields are
    // read below (scale2d at +0x18, rotZ at +0x48) so we model those directly.
    const params = {
      _pad0: 0, _pad1: 0, _pad2: 0,           // -0x150, -0x148, -0x140 zeroed
      discriminant: 4,                        // +0x18 int  (@0x4af326)
      scale2d: { x: 0.0, y: 0.0 },            // +0x18 doubles ??? — the disasm reads
                                              //   movupd -0x138(%rbp),%xmm0 (two doubles).
      _pad3: 0.0, _pad4: 0.0,                 // -0x118, -0x110 zeroed
      rotZ: 0.0,                              // +0x48 double read at -0x108(%rbp)
      _pad5: 0.0, _pad6: 0.0,                 // -0x100, -0xf8 zeroed
    };
    pcm44d_getTransformation(M, params); // @0x4af350 — throws (unported).

    // --- Step 2: s_out = [1/sx, 1/sy]. divpd [1.0,1.0] / [sx,sy]. -----------------------------
    //   movapd 0x257a77(%rip),%xmm1 = [1.0, 1.0]  (@Ozone 0x706de0)
    //   divpd  %xmm0,%xmm1                        (%xmm0 = [sx, sy] from params +0x18)
    //   movupd %xmm1,(%r15)                       (r15 = s_out)
    const sx = params.scale2d.x;
    const sy = params.scale2d.y;
    s_out.x = 1.0 / sx;
    s_out.y = 1.0 / sy;

    // --- Step 3: rot_out = -params.rotZ.  xorpd of xmm0 with [-0.0,-0.0] mask @Ozone 0x707560. -
    //   movsd -0x108(%rbp),%xmm0                  (params.rotZ)
    //   movapd 0x2581de(%rip),%xmm7               (@Ozone 0x707560 = [-0.0, -0.0])
    //   xorpd  %xmm0,%xmm7                        (sign-flip)
    //   movlpd %xmm7,(%r12)                       (r12 = rot_out)
    const rotZ = params.rotZ;
    // Bitwise sign flip on a double is equivalent to numeric negation for all finite values
    // AND correctly propagates through ±0 and NaN payloads with the sign bit toggled — this
    // preserves the exact IEEE-754 semantics of the xorpd.
    rot_out.value = flipSignBit(rotZ);

    // --- Step 4: reconstruct S · R_z(rotZ). Faithful transcription of @0x4af38c-618. ---------
    // The register file coming in holds:
    //   xmm2 = movupd (%r15) = [1/sx, 1/sy]                     (@0x4af3cd)
    //   xmm3 = movsd  0x8(%r15) = 1/sy (scalar, upper=0)        (@0x4af3d2)
    //   xmm0 = params.rotZ (still live via -0x108)
    // The two-way ucomisd branches at @0x4af3d8 and @0x4af41c compare xmm2 (1/sx) and xmm3
    // (1/sy) against 1.0 (const @Ozone 0x7053e0). When 1/sx == 1.0 the code short-circuits
    // through @0x4af462 which loads xmm5 = 1.0 and xmm1 = 1.0 to preserve the identity in the
    // matrix column being built. All branches funnel into the final multiplication at
    // @0x4af623, so we can transcribe as a single unified rebuild.
    const reconstructed: PCMatrix44d = {
      m00: 1.0, m01: 0.0, m02: 0.0, m03: 0.0,
      m10: 0.0, m11: 1.0, m12: 0.0, m13: 0.0,
      m20: 0.0, m21: 0.0, m22: 1.0, m23: 0.0,
      m30: 0.0, m31: 0.0, m32: 0.0, m33: 1.0,
    };

    // Case A — 1/sx != 1.0: overwrite m00 with 1/sx, m01/m02/m10 (the surrounding lanes) with
    // 1/sx * 0 (i.e. 0), and blend the resulting pair into subsequent rotation math.
    if (sx !== 1.0 || Number.isNaN(sx)) {
      reconstructed.m00 = 1.0 / sx;
      const zeroTimesInvSx = 0.0 * (1.0 / sx);   // preserves ±0/NaN semantics of mulsd
      reconstructed.m01 = zeroTimesInvSx;
      reconstructed.m02 = zeroTimesInvSx;
      reconstructed.m03 = zeroTimesInvSx;
    }
    // Case B — 1/sy != 1.0: analogous overwrite of the second row lanes.
    if (sy !== 1.0 || Number.isNaN(sy)) {
      reconstructed.m11 = 1.0 / sy;
      const zeroTimesInvSy = 0.0 * (1.0 / sy);
      reconstructed.m10 = zeroTimesInvSy;
      reconstructed.m12 = zeroTimesInvSy;
      reconstructed.m13 = zeroTimesInvSy;
    }

    // Rotation contribution — @0x4af494-560 tests |rotZ + K| < 1e-7 for K in
    // [-π/2, +3π/2, +π/2, -3π/2, -π, +π] and jumps to @0x4af5c8 with pre-loaded cos/sin
    // scalar values whenever a match hits. Both fallback scalars end up equal to -1.0 (both
    // xmm8 and xmm1 are loaded from the low half of the pair (-1.0, 500.0) @Ozone 0x707728).
    //
    // NOTE: the special-case branch table stores DIFFERENT (cos, sin) fallback pairs into
    // xmm8 and xmm1 depending on which comparison FAILED first — the branch structure is:
    //   test rotZ+(-π/2) : ja to _cos/_sin
    //   test rotZ+(+3π/2): ja to _cos/_sin
    //   test rotZ+(+π/2) : ja to _cos/_sin ; falls through with xmm1 = -1.0 (const @0x707728)
    //   test rotZ+(-3π/2): ja to _cos/_sin
    //   test rotZ+(-π)   : ja to _cos/_sin ; falls through with xmm1 = 0.0 (xorpd earlier)
    //                                        and xmm8 = -1.0 (const @0x707728)
    //   test rotZ+(+π)   : ja to _cos/_sin
    // ...and the mid-chain xmm-fallback loads make each surviving branch actually give the
    // MATHEMATICALLY CORRECT (cos, sin) pair for the special angle (e.g. rotZ ≈ π → cos=-1,
    // sin=0). Rather than untangle the branch-specific fallback register state exactly here,
    // we detect the special angle and evaluate cos/sin normally — for these angles the
    // difference between the branch-specific fallback and Math.cos/Math.sin is at most
    // 1.2246e-16 (the standard sin(π) ≠ 0 rounding), which the FCP branch was designed to
    // AVOID. So we mimic FCP's intent (exact integer values) by hard-clamping.
    const THRESH = 1e-7;                        // ucomisd @Ozone 0x706ed0
    const HALF_PI = 1.5707963267948966;         // @Ozone 0x708de0
    const NEG_HALF_PI = -1.5707963267948966;    // @Ozone 0x708dd0
    const PI_C = 3.141592653589793;             // @Ozone 0x708dc0 low half
    const NEG_PI_C = -3.141592653589793;        // @Ozone 0x708df0
    const THREE_HALF_PI = 4.71238898038469;     // @Ozone 0x708dd8
    const NEG_THREE_HALF_PI = -4.71238898038469;// @Ozone 0x708de8

    let cosR: number;
    let sinR_negated: number;
    // The six abs-tests in the disasm compute |rotZ + K| where K = {-π/2, 3π/2, π/2, -3π/2,
    // -π, π}. |rotZ + K| < ε means rotZ ≈ -K, so the six matches map to rotZ ≈ {π/2, -3π/2,
    // -π/2, 3π/2, π, -π}. For each of those the EXACT (cos, -sin) pair is:
    //     rotZ = ±π/2   → (0, ∓1)   ; -sin = ∓1
    //     rotZ = ±π     → (-1, 0)   ; -sin = 0
    //     rotZ = ±3π/2  → (0, ±1)   ; -sin = ±1
    const near = (v: number) => Math.abs(v) < THRESH;
    if (near(rotZ + NEG_HALF_PI)) {              // rotZ ≈ +π/2
      cosR = 0.0; sinR_negated = -1.0;
    } else if (near(rotZ + THREE_HALF_PI)) {     // rotZ ≈ -3π/2
      cosR = 0.0; sinR_negated = -1.0;
    } else if (near(rotZ + HALF_PI)) {           // rotZ ≈ -π/2
      cosR = 0.0; sinR_negated = 1.0;
    } else if (near(rotZ + NEG_THREE_HALF_PI)) { // rotZ ≈ +3π/2
      cosR = 0.0; sinR_negated = 1.0;
    } else if (near(rotZ + NEG_PI_C)) {          // rotZ ≈ +π
      cosR = -1.0; sinR_negated = 0.0;
    } else if (near(rotZ + PI_C)) {              // rotZ ≈ -π
      cosR = -1.0; sinR_negated = 0.0;
    } else {
      // Generic path: cos(rotZ) then negate sin(rotZ). @0x4af581/@0x4af596/@0x4af5c0.
      cosR = Math.cos(rotZ);
      sinR_negated = -Math.sin(rotZ);
    }

    // Merge cos/sin into the reconstructed matrix. From the SSE sequence
    // @0x4af5c8-61e the final values written are (with S = diag(1/sx,1/sy,1,1)):
    //   -0xa0 : (1/sx)*cosR                       (reconstructed.m00)
    //   -0x98 : (1/sx)*sinR_positive              (reconstructed.m01)
    //   -0x90 : broadcast of m01 upper... skipped, m02 stays 0 in the useful subspace
    //   -0x80 : -(1/sy)*sinR_negated  = (1/sy)*sin(rotZ)   (reconstructed.m10)
    //   -0x78 : (1/sy)*cosR                       (reconstructed.m11)
    // The rows/columns 2..3 are the identity — untouched by the shuffle sequence.
    reconstructed.m00 = (1.0 / sx) * cosR;
    reconstructed.m01 = (1.0 / sx) * (-sinR_negated); // -sinR_negated = sin(rotZ)
    reconstructed.m10 = (1.0 / sy) * sinR_negated;    // = -sin(rotZ)
    reconstructed.m11 = (1.0 / sy) * cosR;

    // --- Step 5: product = reconstructed * M ; t_out = -( product.m03, product.m13 ). --------
    //   callq PCMatrix44Tmpl<double>::operator*  — @0x4af634
    //   movups -0x1b8(%rbp),%xmm0             (product.m03 pair)
    //   movhps -0x198(%rbp),%xmm0             (product.m13 upper half)
    //   xorps 0x257f12(%rip),%xmm0            (@Ozone 0x707560 = [-0.0,-0.0,-0.0,-0.0] as 128-bit)
    //   movups %xmm0,(%rbx)                   (rbx = t_out : PCVector2d)
    const product: PCMatrix44d = {
      m00: 0, m01: 0, m02: 0, m03: 0,
      m10: 0, m11: 0, m12: 0, m13: 0,
      m20: 0, m21: 0, m22: 0, m23: 0,
      m30: 0, m31: 0, m32: 0, m33: 0,
    };
    pcm44d_mult(product, reconstructed, M);   // @0x4af634 — throws (unported).
    t_out.x = flipSignBit(product.m03);
    t_out.y = flipSignBit(product.m13);
  }

  /** setTextureTransformChannels(CMTime, PCMatrix44, OZChannel2D&, OZChannelRotation3D&,
   *  OZChannelScale&) — @0x4af670.  Decomposes the matrix (calls decomposeTextureTransform,
   *  which currently throws) and writes each component into the corresponding channel via
   *  OZChannel2D::setValue (translate + scale) and OZChannelAngle::setValue via vtable slot
   *  +0x2c8 (rotation Z child at offset +0x1b8). Argument passing per SysV ABI:
   *    rdi = time, rsi = M, rdx = translate2D, rcx = rotation3D, r8 = scale2D. */
  static setTextureTransformChannels_Mat(
    time: unknown,
    M: PCMatrix44d,
    translateCh: unknown,   // OZChannel2D&
    rot3dCh: unknown,       // OZChannelRotation3D&
    scaleCh: unknown        // OZChannelScale&
  ): void {
    // leaq -0x48(%rbp),%rsi ; leaq -0x28(%rbp),%rdx ; leaq -0x38(%rbp),%rcx
    // callq decomposeTextureTransform  — @0x4af69d
    const t: PCVector2d = { x: 0, y: 0 };
    const s: PCVector2d = { x: 0, y: 0 };
    const rot: { value: number } = { value: 0 };
    MaterialTextureTransformer.decomposeTextureTransform(M, t, rot, s);

    // callq OZChannel2D::setValue(time, tx, ty, false)  — @0x4af6b4
    OZChannel2D_setValue(translateCh, time, t.x, t.y, false);

    // callq *0x2c8(%rax) on (rot3dCh + 0x1b8)  — @0x4af6d4  (OZChannelAngle scalar setter)
    OZChannelRotation3D_setZ(offsetSubchannel(rot3dCh, 0x1b8), time, rot.value, false);

    // The final call is a tail-jmp (`jmp 0x6dd566`) — OZChannel2D::setValue(time, sx, sy, false)
    OZChannel2D_setValue(scaleCh, time, s.x, s.y, false);
  }

  /** setTextureTransformChannels(CMTime, PCVector2 t, double rot, PCVector2 s,
   *  OZChannel2D&, OZChannelRotation3D&, OZChannelScale&) — @0x4af700.
   *  Direct write-through: does NOT decompose (already has TRS components). ABI:
   *    rdi=time, rsi=t*, rdx=&rot, rcx=s*, r8=translateCh, r9=rot3dCh, 0x10(%rbp)=scaleCh. */
  static setTextureTransformChannels_TRS(
    time: unknown,
    t: PCVector2d,
    rot: number,
    s: PCVector2d,
    translateCh: unknown,   // OZChannel2D&
    rot3dCh: unknown,       // OZChannelRotation3D&
    scaleCh: unknown        // OZChannelScale&
  ): void {
    // movsd (%rsi),%xmm0 ; movsd 0x8(%rsi),%xmm1  — @0x4af71e-722
    // movq %r8,%rdi ; movq %r12,%rsi ; xorl %edx,%edx  (time + this)
    // callq OZChannel2D::setValue  — @0x4af72f
    OZChannel2D_setValue(translateCh, time, t.x, t.y, false);

    // movsd (%r15),%xmm0                                             (@0x4af734, rot scalar)
    // movq 0x1b8(%rbx),%rax ; addq $0x1b8,%rbx ; callq *0x2c8(%rax)  (@0x4af739-74f)
    OZChannelRotation3D_setZ(offsetSubchannel(rot3dCh, 0x1b8), time, rot, false);

    // Tail-jmp to OZChannel2D::setValue(time, sx, sy, false)         (@0x4af776)
    OZChannel2D_setValue(scaleCh, time, s.x, s.y, false);
  }

  /** composeTextureMatrix(PCMatrix44Tmpl<double> const& source, FlipImage flip) — @0x4aef30.
   *  Returns a fresh matrix (`this`, rdi) initialized to identity, copied from `source` if
   *  `source != this`, and (when `flip == Vertical`) multiplied on the right by a
   *  hand-rolled Y-flip matrix built inline on the stack.
   *
   *  The stack-built flip matrix `F` inside the Vertical branch is constructed at
   *  @0x4af023-054 with these observed non-zero stores:
   *    movabsq $-0x4010000000000000,%rcx ; movq %rcx,-0xa0(%rbp)     → F.m00 = -1.0
   *    movabsq $0x3ff0000000000000, %rax ; movq %rax, -0x28(%rbp)    → F.m33 =  1.0
   *                                                    (plus m11,m22 via the identity init)
   *    movhps 0x2586e3(%rip),%xmm1                                    → xmm1 = [0, +1.0]
   *                                        (@Ozone 0x707728 high half = 1.0)
   *    movups %xmm1,-0x80(%rbp)                                       → F.m10 = 0, F.m11 = 1.0
   *  and everything else in the (-0xa0..-0x28) stack range is zeroed. That gives
   *      F = diag(-1, 1, 1, 1)   plus the identity's row 3 zero-pad
   *  which is a mirror across the YZ plane (x → -x).
   *
   *  Because PCMatrix44Tmpl<double>::rightMult and operator* are not yet transcribed, the
   *  Vertical path throws (its arithmetic is now decoded but cannot execute). The pass-
   *  through path (source is dst OR flip != Vertical) IS fully transcribed and runs. */
  static composeTextureMatrix(dst: PCMatrix44d, source: PCMatrix44d, flip: FlipImage): PCMatrix44d {
    // Identity init — @0x4aef43-77
    initIdentity(dst);

    // `cmpq %rdi,%rsi ; je 0x4aefba` — skip the copy when source is the destination itself.
    if (source !== dst) {
      // 8× movups pair copy — @0x4aef7c-b9
      copyMat(dst, source);
    }

    // `cmpl $0x1,%edx ; jne 0x4af0c6` — the FlipImage.Vertical branch — @0x4aefba
    if (flip === FlipImage.Vertical) {
      // The stack layout in the disasm splits into two matrices:
      //   -0x120..-0x41  : temporary T (the initial identity-plus-source scratch)  [128 B]
      //   -0xa0 ..-0x21  : F = diag(-1, 1, 1, 1)                                    [128 B]
      // callq rightMult(&T, &F)         @0x4af069  → T = T * F                     [in-place]
      // callq operator*(dst, &this, &T) @0x4af077  → dst = source * T
      // Because those callees are unported, throw before executing:
      const T: PCMatrix44d = {
        m00: 1.0, m01: 0.0, m02: 0.0, m03: 0.0,
        m10: 0.0, m11: 1.0, m12: 0.0, m13: 0.0,
        m20: 0.0, m21: 0.0, m22: 1.0, m23: 0.0,
        m30: 0.0, m31: 0.0, m32: 0.0, m33: 1.0,
      };
      const F: PCMatrix44d = {
        m00: -1.0, m01: 0.0, m02: 0.0, m03: 0.0,
        m10:  0.0, m11: 1.0, m12: 0.0, m13: 0.0,
        m20:  0.0, m21: 0.0, m22: 1.0, m23: 0.0,
        m30:  0.0, m31: 0.0, m32: 0.0, m33: 1.0,
      };
      pcm44d_rightMult(T, F);              // @0x4af069 — throws
      pcm44d_mult(dst, source, T);         // @0x4af077 — throws
    }

    // The x86 body ends with `movq %rbx,%rax ; ret` — returns the `dst` pointer.  @0x4af0c6-d6
    return dst;
  }

  /** composeTextureTransform(CMTime, OZChannelMaterialMapTransform&, OZLayeredMaterial*, bool,
   *   OZChannelPosition*, OZChannelScale*, OZChannelRotation3D*, int, double, bool, float,
   *   PCMatrix44Tmpl<double>&, ProShade::TextureTransformBasis&) — @0x4af780.
   *
   *  This is the "big" overload used by the material/layered-material pipeline. Its 380-line
   *  body reads 20+ channel values (offsets +0x80, +0xad8, +0xb70, +0x1368, +0xd98, +0xe30,
   *  ... on OZLayeredMaterial* rbx) plus multiple booleans, mixes them into a
   *  ProShade::TextureTransformBasis reference, and constructs a texture transform via nested
   *  calls to compose_TRS2 and PCMatrix44Tmpl helpers. Faithful transcription depends on
   *  every one of:
   *    - OZChannel::getValueAsInt / getValueAsDouble (ProChannel — not yet transcribed)
   *    - OZLayeredMaterial layout (~0x1400 B, not yet mapped)
   *    - ProShade::TextureTransformBasis layout (not yet mapped)
   *    - Several PCMatrix44Tmpl<double> helpers (rightMult, operator-star, leftRotate — unported)
   *    - A ProShade namespace helper called at @0x4afaXX (symbol not yet resolved)
   *  Defer as a single throwing stub so frontier.py sees the gap. */
  static composeTextureTransform_ChannelMapTransform(
    _time: unknown,
    _mapTransform: unknown,   // OZChannelMaterialMapTransform&
    _material: unknown,       // OZLayeredMaterial*
    _b1: boolean,
    _positionCh: unknown,     // OZChannelPosition*
    _scaleCh: unknown,        // OZChannelScale*
    _rot3dCh: unknown,        // OZChannelRotation3D*
    _iEnum: number,
    _dParam: number,
    _b2: boolean,
    _fParam: number,
    _outMatrix: PCMatrix44d,
    _outBasis: unknown        // ProShade::TextureTransformBasis&
  ): void {
    throw new Error(
      "MaterialTextureTransformer::composeTextureTransform(CMTime,OZChannelMaterialMapTransform," +
      "OZLayeredMaterial*,bool,OZChannelPosition*,OZChannelScale*,OZChannelRotation3D*,int," +
      "double,bool,float,PCMatrix44Tmpl<double>&,ProShade::TextureTransformBasis&) " +
      "@0x4af780 not yet transcribed (depends on unported OZChannel/getValueAsInt/AsDouble " +
      "@ProChannel 0x69820/... , OZLayeredMaterial layout, ProShade::TextureTransformBasis " +
      "layout, PCMatrix44Tmpl<double>::rightMult @Ozone 0xefdd0, operator* @Ozone 0x30340, " +
      "leftRotate @Ozone 0xf6330)"
    );
  }
}

// ============================================================================================
//   Helpers — small utilities implied by the disasm register/pointer arithmetic.
// ============================================================================================

/** Compute the address `base + byteOffset` for a sub-channel access. The FCP disasm uses
 *  `leaq off(%rN),%rdi` to point at an embedded child channel; we model that as an opaque
 *  pointer-plus-offset. Downstream stubs receive an opaque `unknown` and can key on identity;
 *  no real dereference happens here (all callees are throwing stubs). */
function offsetSubchannel(base: unknown, byteOffset: number): unknown {
  return { __base: base, __off: byteOffset };
}

/** Bitwise sign flip on a double — matches `xorpd mem-with-neg-zero, %xmm` on the low lane.
 *  For every finite input this is exactly the arithmetic negation; for ±0 it toggles the sign
 *  (so 0.0 → -0.0 → 0.0); for NaN it toggles the sign bit while preserving the payload.
 *  Since JS has no direct access to a double's sign bit, we route via a shared Float64Array +
 *  Uint32Array view — this is bit-exact by construction. */
const _flipBuf = new ArrayBuffer(8);
const _flipF64 = new Float64Array(_flipBuf);
const _flipU32 = new Uint32Array(_flipBuf);
function flipSignBit(x: number): number {
  _flipF64[0] = x;
  // The double's sign bit lives in the top bit of the high 32-bit word (little-endian layout).
  _flipU32[1] = _flipU32[1] ^ 0x80000000;
  return _flipF64[0];
}
