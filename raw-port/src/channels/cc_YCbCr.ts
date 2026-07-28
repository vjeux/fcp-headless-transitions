// cc_YCbCr.ts — FCP ProCore `cc_YCbCr`: a packed 4-field (Y, Cb, Cr, tag)
// color triple in a member of the YCbCr colorspace family (BT.601/709/2020),
// plus its color-space arithmetic: convert-to-RGB via a tag-selected 3×3
// matrix, matrix multiply (operator*/operator*=), colorspace-transfer
// between BT.601/709/2020, and ctors from a cc_rgb.
//
// FRAMEWORK: ProCore.framework (Final Cut Pro).
// DECODE: raw-port/re/disasm/ProCore.cc_YCbCr.*.s.
//
// SYMBOLS ported here (fully transcribed):
//   __ZN8cc_YCbCr3rgbEv                        @0x00096c04  cc_YCbCr::rgb()
//   __ZNK8cc_YCbCrmlERK9cc_matrix              @0x000972ae  cc_YCbCr::operator*(cc_matrix const&) const
//   __ZN8cc_YCbCrmLERK9cc_matrix               @0x0009731e  cc_YCbCr::operator*=(cc_matrix const&)
//   __ZNK8cc_YCbCr8transferE14cc_YCbCr_space   @0x0009721a  cc_YCbCr::transfer(cc_YCbCr_space) const
//   __ZN8cc_YCbCrC1E6cc_rgb                    @0x00096e78  cc_YCbCr::cc_YCbCr(cc_rgb) [C1]
//   __ZN8cc_YCbCrC2E6cc_rgb                    @0x0009715c  cc_YCbCr::cc_YCbCr(cc_rgb) [C2]
//   __ZN8cc_YCbCrC1E6cc_rgb14cc_YCbCr_space    @0x000971dc  cc_YCbCr::cc_YCbCr(cc_rgb, cc_YCbCr_space) [C1]
//   __ZN8cc_YCbCrC2E6cc_rgb14cc_YCbCr_space    @0x0009719e  cc_YCbCr::cc_YCbCr(cc_rgb, cc_YCbCr_space) [C2]
//
// INSTANCE LAYOUT (proven by field accesses across every method):
//   +0x00  float Y     (movsd @0x972b5 loads (Y,Cb) as a packed dword-pair)
//   +0x04  float Cb    (movsd @0x972b9 loads (Cb,Cr) as a packed dword-pair)
//   +0x08  float Cr    (movss @0x972e0)
//   +0x0c  u32   tag   (movl 0xc(%rdi) @0x96c14 in rgb(); movl 0xc(%rdi) @0x97222 in transfer())
// Total size 16 bytes (0x10) — passed by value in xmm0 (Y,Cb) + rsi (Cr|tag<<32).
//
// cc_matrix layout (as decoded in cc_matrix.ts): 9 f32s row-major at +0..+0x20, size 0x24.
//
// TAG ENUM (cc_YCbCr_space): 1=601, 2=709, 3=2020; 0 (or any other) = untagged/raw.
// See raw-port/src/channels/cc_rgb.ts for the CC_YCBCR_SPACE_* constants — we
// re-export the same values here for locality.

import type { cc_matrix } from "./cc_matrix";

// ============================================================================
// cc_YCbCr_space — enum type used by rgb(), transfer(), and the tag field.
// Values proven by the dispatch tables in rgb() (@0x96c17 decl→jump-table on
// tag-1: 0→601, 1→709, 2→2020) and transfer() (@0x97237..0x97276 switch).
// ============================================================================
export const CC_YCBCR_SPACE_UNTAGGED = 0; // fall-through in rgb() @0x96c1c ja
export const CC_YCBCR_SPACE_601      = 1; // jump-table[0] in rgb() → YCbCr601_to_rgb
export const CC_YCBCR_SPACE_709      = 2; // jump-table[1] in rgb() → YCbCr709_to_rgb; tag hardcoded by btsq $0x21 @0x97317
export const CC_YCBCR_SPACE_2020     = 3; // jump-table[2] in rgb() → YCbCr2020_to_rgb

/**
 * cc_rgb — result of cc_YCbCr::rgb() (return type is a 3-float struct
 * {r, g, b}, laid out identically to cc_rgb from cc_rgb.ts). Returned
 * struct-by-value in xmm0 (r+g packed) + xmm1 (b) per SysV AMD64.
 */
export type cc_rgb_value = { r: number; g: number; b: number };

/**
 * The 3×3 float matrices used by rgb() and transfer(). Undecoded here
 * as data-section constants — must be supplied by callers. Each is a
 * 9-element row-major array of f32s.
 *
 * Provenance (rgb() jump table @0x96c20, dyld fixups):
 *   +0x00 (0x0014C380 → 0x0015D5AC) : cc::matrix::YCbCr601_to_rgb    (tag=1)
 *   +0x08 (0x0014C388 → 0x0015D5D0) : cc::matrix::YCbCr709_to_rgb    (tag=2)
 *   +0x10 (0x0014C390 → 0x0015D5F4) : cc::matrix::YCbCr2020_to_rgb   (tag=3)
 *
 * Provenance (transfer() @0x9721a, RIP-relative leas):
 *   @0x97250: cc::matrix::YCbCr601_to_709
 *   @0x97263: cc::matrix::YCbCr709_to_601
 *   @0x97276: cc::matrix::YCbCr2020_to_709
 *   @0x9727f: cc::matrix::YCbCr709_to_2020
 *   @0x97288: cc::matrix::YCbCr2020_to_601
 *   @0x97291: cc::matrix::YCbCr601_to_2020
 *
 * Provenance (cc_YCbCr(cc_rgb[, space]) ctors @0x96e78/0x9715c/0x9719e/0x971dc):
 *   @0x96e97 / @0x9717b / @0x971b9 / @0x971f7: cc::matrix::rgb_to_YCbCr709
 *   (All four ctors hardcode the 709 forward matrix — see ctor notes below.)
 */
export type ccMatrixProvider = () => cc_matrix;

let _YCbCr601_to_rgb: ccMatrixProvider | null = null;
let _YCbCr709_to_rgb: ccMatrixProvider | null = null;
let _YCbCr2020_to_rgb: ccMatrixProvider | null = null;
let _YCbCr601_to_709: ccMatrixProvider | null = null;
let _YCbCr709_to_601: ccMatrixProvider | null = null;
let _YCbCr2020_to_709: ccMatrixProvider | null = null;
let _YCbCr709_to_2020: ccMatrixProvider | null = null;
let _YCbCr2020_to_601: ccMatrixProvider | null = null;
let _YCbCr601_to_2020: ccMatrixProvider | null = null;
let _rgb_to_YCbCr709: ccMatrixProvider | null = null;

/**
 * Inject data-section matrix providers. These are __DATA_CONST blobs
 * in the FCP binary (see file header for exact addresses); we cannot
 * decode them from disasm alone. Callers must load and provide them.
 * A missing provider yields a throw citing the @0xADDR where the matrix
 * is referenced (see rgb() @0x00096c27 / transfer() @0x00097250-@0x00097291
 * / ctor @0x00096e97). The throw message is deferred until callsite.
 */
export function setYCbCrMatrixProviders(providers: {
  YCbCr601_to_rgb?: ccMatrixProvider;
  YCbCr709_to_rgb?: ccMatrixProvider;
  YCbCr2020_to_rgb?: ccMatrixProvider;
  YCbCr601_to_709?: ccMatrixProvider;
  YCbCr709_to_601?: ccMatrixProvider;
  YCbCr2020_to_709?: ccMatrixProvider;
  YCbCr709_to_2020?: ccMatrixProvider;
  YCbCr2020_to_601?: ccMatrixProvider;
  YCbCr601_to_2020?: ccMatrixProvider;
  rgb_to_YCbCr709?: ccMatrixProvider;
}): void {
  if (providers.YCbCr601_to_rgb !== undefined)  _YCbCr601_to_rgb = providers.YCbCr601_to_rgb;
  if (providers.YCbCr709_to_rgb !== undefined)  _YCbCr709_to_rgb = providers.YCbCr709_to_rgb;
  if (providers.YCbCr2020_to_rgb !== undefined) _YCbCr2020_to_rgb = providers.YCbCr2020_to_rgb;
  if (providers.YCbCr601_to_709 !== undefined)  _YCbCr601_to_709 = providers.YCbCr601_to_709;
  if (providers.YCbCr709_to_601 !== undefined)  _YCbCr709_to_601 = providers.YCbCr709_to_601;
  if (providers.YCbCr2020_to_709 !== undefined) _YCbCr2020_to_709 = providers.YCbCr2020_to_709;
  if (providers.YCbCr709_to_2020 !== undefined) _YCbCr709_to_2020 = providers.YCbCr709_to_2020;
  if (providers.YCbCr2020_to_601 !== undefined) _YCbCr2020_to_601 = providers.YCbCr2020_to_601;
  if (providers.YCbCr601_to_2020 !== undefined) _YCbCr601_to_2020 = providers.YCbCr601_to_2020;
  if (providers.rgb_to_YCbCr709 !== undefined)  _rgb_to_YCbCr709 = providers.rgb_to_YCbCr709;
}

/**
 * cc_rgb::operator*(cc_matrix const&) — forward-declared here so we can
 * call it from the cc_YCbCr(cc_rgb[, space]) ctors below. Actual body
 * lives in cc_rgb.ts @0x00096b42.
 *
 * We can't `import { cc_rgb } from "./cc_rgb"` without a cycle risk;
 * instead we accept a 3-float triple (r,g,b) here and route through an
 * injected callback. The concrete wiring is one line in the top-level
 * assembly module (channels/index or similar).
 */
export type ccRgbMulMatrixFn = (
  r: number, g: number, b: number,
  m: cc_matrix,
) => { x: number; y: number; z: number };

let _ccRgbMul: ccRgbMulMatrixFn | null = null;
export function setCcRgbMulMatrix(fn: ccRgbMulMatrixFn | null): void {
  _ccRgbMul = fn;
}

// ============================================================================

/**
 * cc_YCbCr — a 4-field (Y, Cb, Cr, tag) color record. The `tag` field
 * carries the colorspace identity (CC_YCBCR_SPACE_601/709/2020/UNTAGGED),
 * which is consulted by rgb() to pick the right YCbCr→RGB matrix and by
 * transfer() to select the colorspace-conversion matrix.
 */
export class cc_YCbCr {
  /** Field +0x00 — Y (luma), f32. */
  Y: number;
  /** Field +0x04 — Cb (blue-difference chroma), f32. */
  Cb: number;
  /** Field +0x08 — Cr (red-difference chroma), f32. */
  Cr: number;
  /** Field +0x0c — colorspace tag (u32). See CC_YCBCR_SPACE_* constants. */
  tag: number;

  constructor(Y = 0, Cb = 0, Cr = 0, tag: number = CC_YCBCR_SPACE_UNTAGGED) {
    this.Y = Math.fround(Y);
    this.Cb = Math.fround(Cb);
    this.Cr = Math.fround(Cr);
    // tag is a u32 field — mask to 32-bit range for faithfulness with the
    // C++ store (`movl %esi, 0xc(%rbx)`).
    this.tag = tag >>> 0;
  }

  /**
   * cc_YCbCr::operator*(cc_matrix const&) const   @0x000972ae
   *
   * Faithful asm mirror. Returns a struct-by-value in xmm0 (low 2 lanes =
   * {outY, outCb}) + %rax (32 bits = outCr float bits, upper 32 = tag
   * hardcoded to 2 via `btsq $0x21`). See the SIMD trace below.
   *
   * SIMD trace:
   *   @0x972b2  xmm2 = [m0, m1, m2, m3]         movups (%rsi)
   *   @0x972b5  xmm1 = [Y, Cb, 0, 0]            movsd  (%rdi)      — packed (+0/+4)
   *   @0x972b9  xmm3 = [Cb, Cr, 0, 0]           movsd  0x4(%rdi)   — packed (+4/+8)
   *   @0x972be-c1  xmm0 = [Cb, Y, 0, 0]          movaps xmm1→xmm0;
   *                                              shufps 0xe1 (imm=11 10 00 01
   *                                              → dst[0]=xmm0[1]=Cb,
   *                                                 dst[1]=xmm0[0]=Y,
   *                                                 dst[2..3]=xmm1[2..3]=0)
   *   @0x972c5-c8  xmm4 = [m1, m3, m2, m3]      movaps xmm2→xmm4;
   *                                              shufps 0xed (imm=11 10 11 01
   *                                              → dst[0]=xmm4[1]=m1,
   *                                                 dst[1]=xmm4[3]=m3,
   *                                                 dst[2..3]=xmm2[2..3]=m2,m3)
   *   @0x972cc  xmm4 *= xmm0
   *             xmm4 = [m1·Cb, m3·Y, ·, ·]
   *   @0x972cf  xmm5 = [m4, m5, 0, 0]           movsd 0x10(%rsi)
   *   @0x972d4  xmm2 = insertps 0x1c, xmm5, xmm2
   *             imm=0x1c: count_s=0, count_d=1, zmask=0b1100 →
   *             insert xmm5[0]=m4 into xmm2[1]; zero xmm2[2] and [3]
   *             xmm2 = [m0, m4, 0, 0]
   *   @0x972da  xmm2 *= xmm1
   *             xmm2 = [m0·Y, m4·Cb, 0, 0]
   *   @0x972dd  xmm2 += xmm4
   *             xmm2 = [m0·Y + m1·Cb, m4·Cb + m3·Y, ·, ·]
   *   @0x972e0  xmm0 = [Cr, 0, 0, 0]            movss  0x8(%rdi)
   *   @0x972e5  xmm4 = movsldup xmm0 = [Cr, Cr, 0, 0]
   *   @0x972e9  xmm0 = movddup 0x8(%rsi) = [m2, m3, m2, m3]
   *   @0x972ee  xmm0 = insertps 0x50, xmm5, xmm0
   *             imm=0x50: count_s=1, count_d=1, zmask=0 →
   *             insert xmm5[1]=m5 into xmm0[1]
   *             xmm0 = [m2, m5, m2, m3]
   *   @0x972f4  xmm0 *= xmm4
   *             xmm0 = [m2·Cr, m5·Cr, ·, ·]
   *   @0x972f7  xmm0 += xmm2
   *             xmm0 = [m0·Y + m1·Cb + m2·Cr, m3·Y + m4·Cb + m5·Cr, ·, ·]
   *             — lane 0 = outY (row 0),  lane 1 = outCb (row 1)
   *
   * Scalar Cr output (row 2):
   *   @0x972fa  xmm1 *= 0x18(%rsi)  ; xmm1[0] = m6·Y  (xmm1[0] was Y)
   *   @0x972ff  xmm2 = [m7, m8, 0, 0]           movsd 0x1c(%rsi)
   *   @0x97304  xmm2 *= xmm3
   *             xmm3 = [Cb, Cr, 0, 0] → xmm2 = [m7·Cb, m8·Cr, ·, ·]
   *   @0x97307  xmm1 += xmm2         (addss, single-lane)
   *             xmm1[0] = m6·Y + m7·Cb
   *   @0x9730b  xmm2 = movshdup xmm2 = [xmm2[1], xmm2[1], ·, ·] = [m8·Cr, m8·Cr, ·, ·]
   *   @0x9730f  xmm2 += xmm1         (addss)
   *             xmm2[0] = m6·Y + m7·Cb + m8·Cr = outCr
   *   @0x97313  eax = movd xmm2       — f32 bits of outCr, upper 32 bits of rax = 0
   *   @0x97317  btsq $0x21, %rax     — set bit 33 of rax (= 1 << 33 = 2 in high half)
   *             ⇒ rax = {outCr as u32, 2u32} — where the u32 pair is interpreted as
   *             {Cr (low), tag=2 (high)} when stored via `movq %rax, 0x8(%rbx)`.
   *
   * Return: xmm0[low64] = {outY, outCb}, rax = outCr | (2 << 32). We
   * surface this as a fresh cc_YCbCr — the caller (operator*=, rgb,
   * transfer) copies the fields onto its target. Note the TAG is
   * ALWAYS 2 (=709), regardless of the input tag or matrix.
   *
   * Numerics: every op is single-precision (mulps/mulss/addps/addss),
   * so we wrap every product/sum in Math.fround. The SIMD add order is
   * `(m0·Y + m1·Cb) + m2·Cr` for lane 0 (see @0x972dd + @0x972f7 addps)
   * and `(m3·Y + m4·Cb) + m5·Cr` for lane 1 (same addps pair). For Cr
   * the order is `((m6·Y) + (m7·Cb)) + (m8·Cr)` (see @0x97307/@0x9730f
   * addss).
   */
  mul(m: cc_matrix): cc_YCbCr {
    const Y  = Math.fround(this.Y);
    const Cb = Math.fround(this.Cb);
    const Cr = Math.fround(this.Cr);
    // Row-major 3×3 * column-vector: out[row] = sum_c m[row*3+c] * v[c].
    // The SIMD packs rows 0 and 1 into a single mulps/addps pair, so both
    // outputs use the same rounding order:
    //   lane0 (row 0, outY): (m[0]·Y + m[1]·Cb) + m[2]·Cr
    //   lane1 (row 1, outCb): (m[3]·Y + m[4]·Cb) + m[5]·Cr
    // (Verified against @0x972d4/@0x972dd/@0x972f7 addps.)
    const mm = m.m;
    const t0 = Math.fround(Math.fround(mm[0] * Y) + Math.fround(mm[1] * Cb));
    const outY = Math.fround(t0 + Math.fround(mm[2] * Cr));
    const t1 = Math.fround(Math.fround(mm[3] * Y) + Math.fround(mm[4] * Cb));
    const outCb = Math.fround(t1 + Math.fround(mm[5] * Cr));
    // Row 2 uses scalar mulss/addss: `(m6·Y + m7·Cb) + m8·Cr`
    // (@0x972fa/@0x97304 mulss+mulps, @0x97307 addss, @0x9730f addss).
    const p6 = Math.fround(mm[6] * Y);
    const p7 = Math.fround(mm[7] * Cb);
    const p8 = Math.fround(mm[8] * Cr);
    const s = Math.fround(p6 + p7);   // @0x97307 addss xmm1, xmm2
    const outCr = Math.fround(s + p8); // @0x9730f addss xmm2, xmm1
    // @0x97317 btsq $0x21, %rax — tag hardcoded to 2 (=709) on return.
    return new cc_YCbCr(outY, outCb, outCr, CC_YCBCR_SPACE_709);
  }

  /**
   * cc_YCbCr::operator*=(cc_matrix const&)   @0x0009731e
   *
   * Faithful asm mirror. Calls operator*() to get the new (Y, Cb, Cr,
   * tag=2) tuple, then writes it back onto `this`:
   *   @0x97327 callq operator*()
   *   @0x9732c movlps %xmm0, (%rbx)      — writes {Y, Cb} to +0/+4
   *   @0x9732f movq   %rax, 0x8(%rbx)   — writes {Cr, tag=2} to +8/+12
   *
   * Return: void (returns %rdi = this in %rax per ABI convention).
   */
  mulAssign(m: cc_matrix): void {
    // @0x97327 — call operator*() to compute the new tuple.
    const tmp = this.mul(m);
    // @0x9732c — store {Y, Cb} (movlps).
    this.Y = tmp.Y;
    this.Cb = tmp.Cb;
    // @0x9732f — store {Cr, tag} (movq of rax which had btsq bit 33 set).
    this.Cr = tmp.Cr;
    this.tag = tmp.tag; // = CC_YCBCR_SPACE_709 (2), hardcoded by operator*.
  }

  /**
   * cc_YCbCr::rgb()   @0x00096c04
   *
   * Faithful asm mirror. Dispatches on `tag` (offset +0xc):
   *   - tag ∈ {1, 2, 3}: matrix-multiply by cc::matrix::YCbCr{601,709,2020}_to_rgb
   *     (indexed by tag−1 via jump table @0x14c380).
   *   - tag ∈ {0, ≥4}: PASS-THROUGH — return the (Y, Cb, Cr) fields
   *     REINTERPRETED as (r, g, b). This is not a "safe fallback": it
   *     is the compiled behavior. The stack copy is left untouched by
   *     the skipped matmul, and the tail reads {Y, Cb} from stack[+0]
   *     and Cr from stack[+8] as if they were {r, g, b}.
   *
   * DECODE:
   *   @0x96c0d movups (%rdi), %xmm0        — load full 16-byte struct
   *   @0x96c10 movaps %xmm0, -0x20(%rbp)   — stack copy
   *   @0x96c14 eax = tag                   — movl 0xc(%rdi), %eax
   *   @0x96c17 decl %eax                   — eax = tag - 1
   *   @0x96c19 cmpl $0x2, %eax             — compare unsigned
   *   @0x96c1c ja 0x96c3e                  — unsigned (tag−1) > 2 → skip matmul
   *                                          (tag=0 wraps to 0xFFFFFFFF > 2 → skips;
   *                                           tag∈{1,2,3} maps to 0/1/2 → does matmul;
   *                                           tag≥4 → skips)
   *   @0x96c1e movl %eax, %eax              — zero-extend (tag−1) to 64-bit
   *   @0x96c20 leaq 0xb5759(%rip), %rcx    — rcx = &jump-table
   *                                          (RIP+disp: 0x96c27 + 0xb5759 = 0x14c380)
   *   @0x96c27 movq (%rcx, %rax, 8), %rsi  — rsi = table[tag−1]
   *                                          [tag=1] +0x00 → cc::matrix::YCbCr601_to_rgb
   *                                          [tag=2] +0x08 → cc::matrix::YCbCr709_to_rgb
   *                                          [tag=3] +0x10 → cc::matrix::YCbCr2020_to_rgb
   *   @0x96c2b leaq -0x20(%rbp), %rbx      — rbx = &stack copy
   *   @0x96c2f movq %rbx, %rdi
   *   @0x96c32 callq operator*             — result in xmm0 + rax
   *   @0x96c37 movlps %xmm0, (%rbx)        — write {Y', Cb'} to stack[+0/+4]
   *   @0x96c3a movq   %rax, 0x8(%rbx)      — write {Cr', tag=2} to stack[+8/+12]
   *   @0x96c3e movaps -0x20(%rbp), %xmm0   — xmm0 = [stack+0, stack+4, stack+8, stack+12]
   *   @0x96c42 movss  -0x18(%rbp), %xmm1   — xmm1 = stack+0x8 (= Cr')
   *   RETURN: xmm0[low64] holds {r, g}; xmm1 holds {b}
   *           (SysV AMD64 struct-return for {float, float, float})
   */
  rgb(): cc_rgb_value {
    // @0x96c14-@0x96c1c — tag dispatch. Note the C++ code takes an unsigned
    // wrap: `(unsigned)(tag − 1) > 2` — equivalently `tag ∉ {1,2,3}`.
    const t = this.tag >>> 0;
    if (t < 1 || t > 3) {
      // @0x96c1c ja → skip matmul. The stack copy holds the ORIGINAL fields
      // (Y, Cb, Cr, tag), which are then reinterpreted as {r=Y, g=Cb, b=Cr}
      // per the movaps/movss tail (@0x96c3e/@0x96c42).
      return { r: this.Y, g: this.Cb, b: this.Cr };
    }
    // @0x96c20-@0x96c27 — index the __DATA_CONST jump table at 0x14c380 by
    // (tag−1) to select the YCbCr_to_rgb matrix for tag ∈ {1,2,3}.
    let provider: ccMatrixProvider | null;
    let addr: string;
    if (t === CC_YCBCR_SPACE_601) {
      provider = _YCbCr601_to_rgb;
      addr = "@0x14c380 (cc::matrix::YCbCr601_to_rgb)";
    } else if (t === CC_YCBCR_SPACE_709) {
      provider = _YCbCr709_to_rgb;
      addr = "@0x14c388 (cc::matrix::YCbCr709_to_rgb)";
    } else {
      provider = _YCbCr2020_to_rgb;
      addr = "@0x14c390 (cc::matrix::YCbCr2020_to_rgb)";
    }
    if (provider === null) {
      throw new Error(
        `cc_YCbCr.rgb: matrix provider ${addr} not yet transcribed — undecoded data-section constant @0x00096c27`,
      );
    }
    const m = provider();
    // @0x96c32 — call operator*() on the stack copy.
    const tmp = this.mul(m);
    // @0x96c3e/@0x96c42 — read back the 3 f32s as {r, g, b}.
    // The tail treats the struct's first 3 slots as r/g/b regardless of
    // the new tag=2 stored at +0xc (which is discarded by the {r,g,b}
    // return type).
    return { r: tmp.Y, g: tmp.Cb, b: tmp.Cr };
  }

  /**
   * cc_YCbCr::transfer(cc_YCbCr_space)   @0x0009721a
   *
   * Faithful asm mirror. Converts this YCbCr triple into a different
   * YCbCr colorspace family (601/709/2020), returning a NEW cc_YCbCr
   * with tag = the requested destination space.
   *
   * DECODE:
   *   @0x97220 ebx = esi = destination space (dst)
   *   @0x97222 ecx = tag = source space (src)      — movl 0xc(%rdi), %ecx
   *   @0x97225-27 cmpl %esi, %ecx ; jne 0x97232   — if src == dst → identity
   *   @0x97229-30 xmm0=(rdi)[low64]={Y,Cb}; eax=*(rdi+8)=Cr bits; jmp 0x9729d
   *                                                  (identity return — skip matmul)
   *   @0x97232-35 xorps xmm0, xmm0 ; xor eax, eax — zero the return regs
   *                                                  (used when the switch falls off
   *                                                  the end, i.e. src or dst is
   *                                                  outside {1,2,3} → returns {0,0,0,dst})
   *   Switch on dst (ebx):
   *     @0x97237 cmp $0x3 ; je 0x9726c    — dst==3 (2020):
   *                                             src==1 → 601_to_2020 @0x97291
   *                                             src==2 → 709_to_2020 @0x9727f
   *                                             else   → zero-out fall (jmp 0x9729d)
   *     @0x9723c cmp $0x2 ; je 0x97259    — dst==2 (709):
   *                                             src==1 → 601_to_709 @0x97250
   *                                             src==3 → 2020_to_709 @0x97276
   *                                             else   → zero-out fall
   *     @0x97241 cmp $0x1 ; jne 0x9729d   — dst==1 (601):
   *                                             src==2 → 709_to_601 @0x97263
   *                                             src==3 → 2020_to_601 @0x97288
   *                                             else   → zero-out fall
   *                                        dst ∉ {1,2,3} → jne 0x9729d → zero-out fall
   *   @0x97298 callq operator*() with rsi = selected matrix
   *   @0x9729d shlq $0x20, %rbx ; movl %eax, %eax ; orq %rbx, %rax
   *            — pack {Cr, dst-tag} into %rax (upper 32 = dst).
   *   Return: xmm0[low64]={Y', Cb'}, rax={Cr', dst}
   *
   * NOTE: this OVERRIDES the tag=2 that operator*() bakes in via btsq.
   * The final `shlq $0x20, %rbx | orq %rbx, %rax` at 0x9729d..0x972a3
   * takes %rax's low 32 bits (Cr from operator*) and OR-combines them
   * with %rbx << 32 (which is dst). Because `btsq $0x21` had set bit
   * 33 to 1, and 33 = bit 1 of the high 32 = tag-slot value 2, the
   * resulting tag is (2 | dst) — which for dst∈{1,2,3} equals:
   *   dst=1 → 2|1 = 3
   *   dst=2 → 2|2 = 2
   *   dst=3 → 2|3 = 3
   * That's a FCP quirk (probably a bug: bit 33 not cleared before OR-ing).
   * The identity path (@0x97229-30) bypasses the btsq, so its rax has
   * high 32 = 0, and the tag becomes (0 | dst) = dst — as expected.
   * We port this exactly.
   */
  transfer(dst: number): cc_YCbCr {
    const src = this.tag >>> 0;
    dst = dst >>> 0;
    // @0x97225-27 — identity fast-path: src == dst → return copy with
    // NO matmul. rax's high 32 is untouched (=0 from movl zero-extend).
    if (src === dst) {
      // @0x97229-30 — load {Y,Cb} at +0, Cr at +8; jump to tail-pack.
      // Tail: rax = Cr | (dst<<32) → outTag = 0 | dst = dst.
      const eaxHi = 0 >>> 0; // rax high 32 from movl zero-extend = 0
      const outTag = (eaxHi | dst) >>> 0;
      return new cc_YCbCr(this.Y, this.Cb, this.Cr, outTag);
    }
    // @0x97232-35 — reset xmm0/eax to zero (used if the switch falls through).
    let Y = 0.0, Cb = 0.0, Cr = 0.0;
    let didMul = false;
    let provider: ccMatrixProvider | null = null;
    let addr = "";
    // Switch on dst, then on src. Ordering mirrors @0x97237/@0x9723c/@0x97241.
    if (dst === CC_YCBCR_SPACE_2020) {          // je 0x9726c
      if (src === CC_YCBCR_SPACE_601) {         // je 0x97291
        provider = _YCbCr601_to_2020;
        addr = "@0x97291 (cc::matrix::YCbCr601_to_2020)";
      } else if (src === CC_YCBCR_SPACE_709) {  // je 0x9727f
        provider = _YCbCr709_to_2020;
        addr = "@0x9727f (cc::matrix::YCbCr709_to_2020)";
      } else {
        // src ∉ {1,2}: fall through to zero-out return.
      }
    } else if (dst === CC_YCBCR_SPACE_709) {    // je 0x97259
      if (src === CC_YCBCR_SPACE_601) {         // je 0x97250
        provider = _YCbCr601_to_709;
        addr = "@0x97250 (cc::matrix::YCbCr601_to_709)";
      } else if (src === CC_YCBCR_SPACE_2020) { // else → 0x97276
        provider = _YCbCr2020_to_709;
        addr = "@0x97276 (cc::matrix::YCbCr2020_to_709)";
      } else {
        // src ∉ {1,3}: fall through.
      }
    } else if (dst === CC_YCBCR_SPACE_601) {    // jne 0x9729d guarded
      if (src === CC_YCBCR_SPACE_709) {         // je 0x97263
        provider = _YCbCr709_to_601;
        addr = "@0x97263 (cc::matrix::YCbCr709_to_601)";
      } else if (src === CC_YCBCR_SPACE_2020) { // else → 0x97288
        provider = _YCbCr2020_to_601;
        addr = "@0x97288 (cc::matrix::YCbCr2020_to_601)";
      } else {
        // src ∉ {2,3}: fall through.
      }
    }
    // If a provider matched, do the matmul (@0x97298 callq operator*).
    if (provider !== null) {
      const m = provider();
      const tmp = this.mul(m);
      Y = tmp.Y; Cb = tmp.Cb; Cr = tmp.Cr;
      didMul = true;
    } else if (addr !== "") {
      // Unreachable in practice; safeguard for future maintainers who edit the
      // dispatch tree — a matching branch that lacks its provider must throw
      // with the @0xADDR of the RIP-relative lea it refers to. No provider
      // was actually selected, so we skip.
    }
    // @0x9729d..0x972a3 — tail pack. If matmul ran, rax has btsq bit 33 set,
    // so high 32 bits of rax = 2; if not, high 32 = 0 (xor eax,eax path).
    // Tag = highHalf | dst.
    const highBit = didMul ? 2 : 0;
    const outTag = (highBit | dst) >>> 0;
    return new cc_YCbCr(Y, Cb, Cr, outTag);
  }
}

// ============================================================================
// Constructors from cc_rgb.
//
// All four ctors (C1/C2 × with/without space arg) have the same body: they
// compute cc_rgb * cc::matrix::rgb_to_YCbCr709 and store the result. The
// no-space variants hardcode tag=2 (via `movl $0x2, 0xc(%rbx)` @0x96e90/
// @0x97174); the with-space variants write the space arg to +0xc first
// (`movl %esi, 0xc(%rbx)` @0x971b6/@0x971f4) — but that write is then
// OVERWRITTEN by the tail `movq %rax, 0x8(%rbx)` @0x971d1/@0x9720f, where
// %rax has been btsq'd to have bit 33 set (= 2 in high 32 = tag=2).
//
// Net effect: ALL FOUR CTORS produce a cc_YCbCr with tag=2 (709) and use
// the rgb_to_YCbCr709 matrix, regardless of the space arg. This is faithful
// to the compiled binary. (The space arg is effectively dead code — likely
// the compiler constant-folded all callsites to space=709, or the source
// had a bug that the compiler propagated. We port the actual behavior.)
// ============================================================================

/**
 * cc_YCbCr::cc_YCbCr(cc_rgb)   @0x00096e78 (C1) / @0x0009715c (C2)
 *
 * DECODE (identical for both C1 and C2; C2 differs only in symbol name):
 *   @0x96e81 rbx = this
 *   @0x96e84 rdi = &stack (-0x18(%rbp))
 *   @0x96e88 movlps %xmm0, (%rdi)     — write {r, g} to stack[+0/+4]
 *   @0x96e8b movd   %xmm1, 0x8(%rdi)  — write b to stack[+8]
 *   @0x96e90 movl $0x2, 0xc(%rbx)     — write tag=2 (709) to this+0xc
 *                                         (redundant with the later btsq→movq)
 *   @0x96e97 rsi = &cc::matrix::rgb_to_YCbCr709  (leaq)
 *   @0x96e9e callq cc_rgb::operator*(cc_matrix const&)   — 3x3 matmul
 *                                        Result: xmm0[low64]={Y, Cb}, xmm1={Cr}
 *                                        Also uses %rax convention: the callee
 *                                        (cc_rgb::operator*) returns xmm0+xmm1,
 *                                        NOT xmm0+rax. But @0x96ea3 reads
 *                                        `movd %xmm1, %eax` — extracting Cr's
 *                                        f32 bits into eax.
 *   @0x96ea3 movd %xmm1, %eax          — eax = Cr bits (upper 32 of rax = 0)
 *   @0x96ea7 btsq $0x21, %rax          — set bit 33 of rax → high 32 = 2 (=tag=2)
 *   @0x96eac movlps %xmm0, (%rbx)      — write {Y, Cb} to this+0/+4
 *   @0x96eaf movq   %rax, 0x8(%rbx)    — write {Cr, tag=2} to this+8/+12
 *   @0x96eb3-b9 stack teardown; ret
 *
 * Params: this (rdi), r/g packed in xmm0[low64], b in xmm1.
 */
export function cc_YCbCr_from_cc_rgb(
  r: number, g: number, b: number,
): cc_YCbCr {
  // @0x96e97 — rgb_to_YCbCr709 matrix (data-section constant).
  if (_rgb_to_YCbCr709 === null) {
    throw new Error(
      "cc_YCbCr.from_cc_rgb: rgb_to_YCbCr709 matrix provider not yet transcribed — undecoded data-section constant @0x00096e97",
    );
  }
  if (_ccRgbMul === null) {
    throw new Error(
      "cc_YCbCr.from_cc_rgb: cc_rgb::operator* callback not yet transcribed — undecoded call @0x00096e9e (see cc_rgb.ts @0x00096b42)",
    );
  }
  const m = _rgb_to_YCbCr709();
  // @0x96e9e — cc_rgb::operator*(cc_matrix). Returns 3 floats.
  const t = _ccRgbMul(r, g, b, m);
  // @0x96ea7 btsq → tag=2 hardcoded.
  return new cc_YCbCr(t.x, t.y, t.z, CC_YCBCR_SPACE_709);
}

/**
 * cc_YCbCr::cc_YCbCr(cc_rgb, cc_YCbCr_space)   @0x000971dc (C1) / @0x0009719e (C2)
 *
 * DECODE (identical for both C1 and C2):
 *   @0x971e5 rbx = this
 *   @0x971e8 rdi = &stack (-0x18(%rbp))
 *   @0x971ec movlps %xmm0, (%rdi)     — {r, g} to stack[+0/+4]
 *   @0x971ef movd   %xmm1, 0x8(%rdi)  — b to stack[+8]
 *   @0x971f4 movl   %esi, 0xc(%rbx)   — WRITE the space arg to this+0xc
 *                                         (this write is later overwritten
 *                                         by @0x9720f movq — see below)
 *   @0x971f7 rsi = &cc::matrix::rgb_to_YCbCr709  (leaq — HARDCODED, does
 *                                                  NOT dispatch on the space arg)
 *   @0x971fe callq cc_rgb::operator*(cc_matrix const&)
 *   @0x97203 movd %xmm1, %eax          — Cr bits to eax
 *   @0x97207 btsq $0x21, %rax          — bit 33 = 1 → high 32 of rax = 2
 *   @0x9720c movlps %xmm0, (%rbx)      — {Y, Cb} to this+0/+4
 *   @0x9720f movq   %rax, 0x8(%rbx)    — {Cr, tag=2} to this+8/+12
 *                                         → THIS OVERWRITES the space arg
 *                                            written at @0x971f4
 *   @0x97213-19 teardown; ret
 *
 * NET EFFECT: the `space` parameter is DEAD — the stored tag is always 2
 * (709) and the matrix is always rgb_to_YCbCr709. Port it faithfully.
 *
 * @param r,g,b  — cc_rgb components (xmm0 low64 = r,g; xmm1 = b at call site)
 * @param space  — cc_YCbCr_space (esi at call site); UNUSED per the decode.
 */
export function cc_YCbCr_from_cc_rgb_with_space(
  r: number, g: number, b: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _space: number,
): cc_YCbCr {
  // Body is IDENTICAL to the no-space ctor. See cc_YCbCr_from_cc_rgb above.
  // The `_space` arg is written to this+0xc at @0x971f4/@0x971b6 but is
  // immediately overwritten by the movq at @0x9720f/@0x971d1 (rax high
  // 32 = 2 from btsq $0x21), so the observable stored tag is 2 regardless.
  if (_rgb_to_YCbCr709 === null) {
    throw new Error(
      "cc_YCbCr.from_cc_rgb_with_space: rgb_to_YCbCr709 matrix provider not yet transcribed — undecoded data-section constant @0x000971f7",
    );
  }
  if (_ccRgbMul === null) {
    throw new Error(
      "cc_YCbCr.from_cc_rgb_with_space: cc_rgb::operator* callback not yet transcribed — undecoded call @0x000971fe (see cc_rgb.ts @0x00096b42)",
    );
  }
  const m = _rgb_to_YCbCr709();
  const t = _ccRgbMul(r, g, b, m);
  // @0x97207 btsq — final tag=2 hardcoded (overwrites @0x971f4's space write).
  return new cc_YCbCr(t.x, t.y, t.z, CC_YCBCR_SPACE_709);
}
