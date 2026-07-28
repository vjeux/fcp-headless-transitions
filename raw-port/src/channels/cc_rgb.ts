// cc_rgb.ts — FCP ProCore `cc_rgb`: a three-component (R, G, B) color triple
// with color-conversion methods to YIQ, YCbCr (BT.601/709/2020 + BT.601→BT.709
// transform), HSL, rtheta polar, and a 3×3 cc_matrix multiply.
//
// FRAMEWORK: ProCore.framework (Final Cut Pro).
// DECODE: raw-port/re/disasm/ProCore.cc_rgb.*.s.
//
// SYMBOLS ported here:
//   __ZN6cc_rgbmlERK9cc_matrix       @0x00096b42  cc_rgb::operator*(cc_matrix const&)      [full]
//   __ZN6cc_rgbmLERK9cc_matrix       @0x00096952  cc_rgb::operator*=(cc_matrix const&)     [full — tail calls operator*]
//   __ZNK6cc_rgb3YIQEv               @0x00096970  cc_rgb::YIQ() const                      [full — calls operator* with cc::matrix::rgb2YIQ]
//   __ZN6cc_rgb6rthetaEv             @0x00096882  cc_rgb::rtheta()                         [full — calls hsl() (throws) then h*2π]
//   __ZN6cc_rgbC1E8cc_YCbCr          @0x00096c4e  cc_rgb::cc_rgb(cc_YCbCr) [C1]            [full — tag-dispatched matmul]
//   __ZN6cc_rgbC2E8cc_YCbCr          @0x00096baa  cc_rgb::cc_rgb(cc_YCbCr) [C2]            [tail-jmp equivalent; same body as C1]
//   __ZNK6cc_rgb12YCbCr_scopesE14cc_YCbCr_space  @0x000969a8  cc_rgb::YCbCr_scopes(space) [full — pure switch dispatch]
//
// SYMBOLS THROW-STUBBED here (SIMD-packed BT.601/709/2020 conversions and the 118-line
// HSL decoder; each throw cites its @0xADDR so the frontier finder sees the gap):
//   __ZNK6cc_rgb3hslEv               @0x0009667e  cc_rgb::hsl() const
//   __ZNK6cc_rgb9YCbCr_601Ev         @0x000969c8  cc_rgb::YCbCr_601() const
//   __ZNK6cc_rgb9YCbCr_709Ev         @0x00096ac4  cc_rgb::YCbCr_709() const
//   __ZNK6cc_rgb10YCbCr_2020Ev       @0x00096a46  cc_rgb::YCbCr_2020() const
//   __ZNK6cc_rgb5YCbCrEv             @0x000968ce  cc_rgb::YCbCr() const
//   __ZNK6cc_rgb5YCbCrE14cc_YCbCr_space @0x000968ea  cc_rgb::YCbCr(cc_YCbCr_space) const
//   __ZN6cc_rgb17transform601to709Ev @0x000965ec  cc_rgb::transform601to709()
//
// INSTANCE LAYOUT (proven by field accesses across every ported method):
//   +0x00  float r    (movsd @0x96b49 loads (r,g) as a packed dword-pair; op* @0x96b74 reads +0x8 as b)
//   +0x04  float g    (movsd @0x96b4d loads (g,b))
//   +0x08  float b    (movss @0x96b74; ctor writes @0x96c97 extractps lane 2)
// Total size 12 bytes (0xc).
//
// cc_matrix layout (as decoded in cc_matrix.ts): 9 f32s row-major at +0..+0x20, size 0x24.
//
// cc_YCbCr layout (proven by cc_rgb(cc_YCbCr) ctor):
//   +0x00  float Y      (stack[-0x20 lane 0]: movlps xmm0)
//   +0x04  float Cb     (stack[-0x20 lane 1]: movlps xmm0)
//   +0x08  float Cr     (low 32 bits of rsi qword arg — stored @0x96c60: movq rsi,stack[-0x18])
//   +0x0c  u32   _tag   (high 32 bits of rsi qword arg — extracted @0x96c64 shrq $0x20)
// Total size 16 bytes (0x10) — passed by value in xmm0 (Y,Cb) + rsi (Cr|tag<<32).

// ============================================================================
// cc_YCbCr_space — enum type used by YCbCr_scopes / YCbCr(space) / the tag field.
// Proven by the switch dispatch @0x969a8..0x969c7 (YCbCr_scopes) and @0x968f5..0x96911
// (YCbCr(space)): values 1/2/3 route to _601/_709/_2020 respectively; value 0 (or any
// other) is the "raw / untagged" fallback that skips the matmul in cc_rgb(cc_YCbCr).
// ============================================================================
export const CC_YCBCR_SPACE_UNTAGGED = 0;  // fall-through @0x96c90 in ctor
export const CC_YCBCR_SPACE_601      = 1;  // je @0x96905 → rgb_to_YCbCr601; je @0x969b4 → YCbCr_601
export const CC_YCBCR_SPACE_709      = 2;  // je @0x9690a → rgb_to_YCbCr709; fall @0x969c2 → YCbCr_709
export const CC_YCBCR_SPACE_2020     = 3;  // je @0x9690f → rgb_to_YCbCr2020; je @0x969bc → YCbCr_2020

// ============================================================================
// Companion type interfaces (declared here — cc_YCbCr and cc_YIQ each own
// their concrete class file, but we only need the shape to type our returns).
// ============================================================================

/** cc_matrix — the 3×3 row-major float32 matrix from cc_matrix.ts, surfaced here
 *  as a 9-tuple for ergonomic pass-by-value at the API boundary. Callers who
 *  own a `cc_matrix` class instance can `.m` unpack. */
export type cc_matrix9 = readonly [
  number, number, number,   // m[0..2] row 0
  number, number, number,   // m[3..5] row 1
  number, number, number,   // m[6..8] row 2
];

/** cc_YCbCr — three float components (Y, Cb, Cr) + a colorspace tag. See ctor layout above. */
export interface cc_YCbCr_value {
  readonly Y: number;
  readonly Cb: number;
  readonly Cr: number;
  readonly tag: number;   // CC_YCBCR_SPACE_* — 0..3
}

/** cc_YIQ — three float components (Y, I, Q). Written by YIQ() @0x96970 via
 *  extractps $0x0/$0x1 + movss (%rbx) at +0/+4/+8. */
export interface cc_YIQ_value {
  readonly Y: number;
  readonly I: number;
  readonly Q: number;
}

/** cc_hsl — three float components (H, S, L). Return of hsl() — throw-stubbed here. */
export interface cc_hsl_value {
  readonly h: number;
  readonly s: number;
  readonly l: number;
}

/** cc_rtheta — two float components (r, θ). Return of rtheta() — packed in xmm0. */
export interface cc_rtheta_value {
  readonly r: number;
  readonly theta: number;
}

// ============================================================================
// Provider hooks for the global cc::matrix::* constants stored in ProCore
// __DATA_CONST. These are DATA-section constants (not code) and are NOT
// decoded here — a caller must inject their 9-float row-major bytes. Un-set
// providers cause a throwing stub citing the address of the global.
// ============================================================================

/** Symbol addresses of the eight global cc::matrix::* constants used below. */
export const CC_MATRIX_RGB2YIQ_ADDR        = 0x0015d6f0;  // cc::matrix::rgb2YIQ         (@0x9697c lea)
export const CC_MATRIX_YIQ2RGB_ADDR        = 0x0015d714;  // cc::matrix::YIQ2rgb
export const CC_MATRIX_RGB_TO_YCBCR601     = 0x0015d540;  // cc::matrix::rgb_to_YCbCr601 (@0x96923 lea)
export const CC_MATRIX_RGB_TO_YCBCR709     = 0x0015d564;  // cc::matrix::rgb_to_YCbCr709 (@0x9691a lea)
export const CC_MATRIX_RGB_TO_YCBCR2020    = 0x0015d588;  // cc::matrix::rgb_to_YCbCr2020(@0x96911 lea)
export const CC_MATRIX_YCBCR601_TO_RGB     = 0x0015d5ac;  // cc::matrix::YCbCr601_to_rgb (table[0] @0x14c380)
export const CC_MATRIX_YCBCR709_TO_RGB     = 0x0015d5d0;  // cc::matrix::YCbCr709_to_rgb (table[1] @0x14c388)
export const CC_MATRIX_YCBCR2020_TO_RGB    = 0x0015d5f4;  // cc::matrix::YCbCr2020_to_rgb(table[2] @0x14c390)

type MatrixProvider = () => cc_matrix9;
const _providers: Record<number, MatrixProvider | null> = {
  [CC_MATRIX_RGB2YIQ_ADDR]:     null,
  [CC_MATRIX_YIQ2RGB_ADDR]:     null,
  [CC_MATRIX_RGB_TO_YCBCR601]:  null,
  [CC_MATRIX_RGB_TO_YCBCR709]:  null,
  [CC_MATRIX_RGB_TO_YCBCR2020]: null,
  [CC_MATRIX_YCBCR601_TO_RGB]:  null,
  [CC_MATRIX_YCBCR709_TO_RGB]:  null,
  [CC_MATRIX_YCBCR2020_TO_RGB]: null,
};

/** Inject a runtime bytes-provider for one of the global cc::matrix::* constants.
 *  These are DATA-section blobs whose 9 float32s we do not fabricate. */
export function setCcMatrixProvider(addr: number, fn: MatrixProvider | null): void {
  if (!(addr in _providers)) throw new Error(`cc_rgb: unknown cc::matrix::* address 0x${addr.toString(16)}`);
  _providers[addr] = fn;
}

function _requireMatrix(addr: number, label: string): cc_matrix9 {
  const fn = _providers[addr];
  // Provider hooks target one of the eight addresses declared at file scope
  // (e.g. @0x0015d6f0 cc::matrix::rgb2YIQ). Frontier: data-section blobs not yet decoded.
  if (!fn) throw new Error(`cc_rgb: global cc::matrix::${label} not yet transcribed at address 0x${addr.toString(16)} (data-section constant — inject via setCcMatrixProvider; see @0x0015d6f0 rgb2YIQ etc.)`);
  return fn();
}

// ============================================================================
// cc_rgb — the main class.
// ============================================================================

export class cc_rgb {
  /** +0x00 : float r */
  r: number;
  /** +0x04 : float g */
  g: number;
  /** +0x08 : float b */
  b: number;

  constructor(r = 0, g = 0, b = 0) {
    this.r = Math.fround(r);
    this.g = Math.fround(g);
    this.b = Math.fround(b);
  }

  /**
   * cc_rgb::cc_rgb(cc_YCbCr) — construct from a YCbCr triple, applying the
   * tag-selected inverse matrix (YCbCr601/709/2020 → rgb) if the tag is in
   * {601, 709, 2020}; otherwise (tag==0) copy Y,Cb,Cr straight into r,g,b.
   * @ProCore 0x0000000000096c4e  (__ZN6cc_rgbC1E8cc_YCbCr, C1 variant)
   * @ProCore 0x0000000000096baa  (__ZN6cc_rgbC2E8cc_YCbCr, C2 variant — same body)
   *
   * DECODE (raw-port/re/disasm/ProCore.cc_rgb.cc_rgb.s):
   *   0x96c5c   movlps %xmm0, -0x20(%rbp)     ## stack[-0x20..-0x18] = (Y, Cb)
   *   0x96c60   movq   %rsi, -0x18(%rbp)      ## stack[-0x18..-0x10] = rsi = (Cr | tag<<32)
   *   0x96c64   shrq   $0x20, %rsi            ## rsi = tag (u32 upper half of the qword arg)
   *   0x96c68   decl   %esi                   ## tag - 1
   *   0x96c6a   cmpl   $0x2, %esi ; ja 0x96c90## if (u32)(tag-1) > 2 → skip matmul (fall-through)
   *   0x96c71   leaq   0xb5708(%rip), %rcx    ## table @0x96c78 + 0xb5708 = 0x14c380
   *                                          ##   table[0] = &cc::matrix::YCbCr601_to_rgb  (0x15d5ac)
   *                                          ##   table[1] = &cc::matrix::YCbCr709_to_rgb  (0x15d5d0)
   *                                          ##   table[2] = &cc::matrix::YCbCr2020_to_rgb (0x15d5f4)
   *   0x96c78   movq   (%rcx,%rax,8), %rsi    ## rsi = matrix ptr for this tag-1 index
   *   0x96c7c   leaq   -0x20(%rbp), %r14      ## r14 = &stack cc_YCbCr
   *   0x96c83   callq  __ZNK8cc_YCbCrmlERK9cc_matrix   ## cc_YCbCr::operator*(cc_matrix) — returns
   *                                                     ##   xmm0=(r,g), rax=(b_u32 | tag_u32<<32)
   *   0x96c88   movlps %xmm0, (%r14)          ## stack[+0]=r, stack[+4]=g
   *   0x96c8c   movq   %rax, 0x8(%r14)        ## stack[+8]=b, stack[+0xc]=tag
   *   0x96c90   movaps -0x20(%rbp), %xmm0     ## xmm0 = stack 16 bytes = (val0, val1, val2, tag_or_pad)
   *   0x96c94   movlps %xmm0, (%rbx)          ## this->{r,g} = (val0, val1)
   *   0x96c97   extractps $0x2, %xmm0, 0x8(%rbx) ## this->b = val2
   *   0x96c9e   addq $0x10, %rsp ; ...retq
   *
   * BEHAVIOR: if tag ∈ {601,709,2020} the values in the stack cc_YCbCr are OVERWRITTEN by the
   * matmul result (which is an RGB triple) before being copied into this->{r,g,b}. If tag ∉
   * that set (tag==0, the "untagged" case), the Y/Cb/Cr components are copied straight through
   * into r/g/b — the caller is asserting that this YCbCr was already RGB-shaped data.
   */
  static fromYCbCr(y: cc_YCbCr_value): cc_rgb {
    // 0x96c5c-0x96c64 — pack (Y, Cb, Cr, tag) into the "cc_YCbCr" register file. In our world
    // just carry the fields; only the branch on tag matters below.
    const tag = y.tag >>> 0;
    const Y = Math.fround(y.Y);
    const Cb = Math.fround(y.Cb);
    const Cr = Math.fround(y.Cr);

    // 0x96c68-0x96c6d — cmpl $0x2, (tag-1) unsigned: true iff tag ∈ {1,2,3}.
    if (((tag - 1) >>> 0) <= 2) {
      // 0x96c71-0x96c78 — table[tag-1] selects one of the three globals.
      const matrixAddr =
        tag === CC_YCBCR_SPACE_601  ? CC_MATRIX_YCBCR601_TO_RGB
      : tag === CC_YCBCR_SPACE_709  ? CC_MATRIX_YCBCR709_TO_RGB
      : /* CC_YCBCR_SPACE_2020 */     CC_MATRIX_YCBCR2020_TO_RGB;
      const label =
        tag === CC_YCBCR_SPACE_601  ? "YCbCr601_to_rgb"
      : tag === CC_YCBCR_SPACE_709  ? "YCbCr709_to_rgb"
      : /* 2020 */                    "YCbCr2020_to_rgb";
      // 0x96c83 — cc_YCbCr::operator*(cc_matrix). Undecoded here (lives in cc_YCbCr.ts, not yet
      // ported — throw-stub via _requireMatrix already surfaces the frontier). We CANNOT do the
      // multiply ourselves without the cc_YCbCr::operator* semantics, so we defer.
      _requireMatrix(matrixAddr, label);
      // Un-reachable: _requireMatrix always throws until a provider is injected. Even with a
      // provider we still need cc_YCbCr::operator*(cc_matrix) @0x00096c83 (not yet transcribed
      // in cc_YCbCr.ts) to actually apply the transform — so raise a further explicit frontier.
      throw new Error(`cc_rgb::cc_rgb(cc_YCbCr) matmul via cc_YCbCr::operator* @0x00096c83 not yet transcribed`);
    }

    // 0x96c90-0x96c9e — fall-through: copy Y,Cb,Cr straight into r,g,b (tag==0/untagged case).
    return new cc_rgb(Y, Cb, Cr);
  }

  /**
   * cc_rgb::operator*(cc_matrix const&) — returns this * M where M is a 3×3 row-major float32
   * matrix. Output packed by the SysV x86_64 ABI as xmm0=(r_out, g_out) + xmm1=b_out.
   * @ProCore 0x0000000000096b42  (__ZN6cc_rgbmlERK9cc_matrix)
   *
   * DECODE (raw-port/re/disasm/ProCore.cc_rgb.operator*.s — full trace):
   *   0x96b46 movups (%rsi),%xmm1                 ## xmm1 = [m0, m1, m2, m3]
   *   0x96b49 movsd  (%rdi),%xmm2                 ## xmm2 = [r, g, 0, 0]  (packed low qword)
   *   0x96b4d movsd  0x4(%rdi),%xmm3              ## xmm3 = [g, b, 0, 0]
   *   0x96b52 movaps %xmm2,%xmm0                  ## xmm0 = [r, g, 0, 0]
   *   0x96b55 shufps $0xe1,%xmm2,%xmm0            ## imm=0b11_10_00_01 → xmm0 = [g, r, 0, 0]
   *   0x96b59 movaps %xmm1,%xmm4                  ## xmm4 = [m0, m1, m2, m3]
   *   0x96b5c shufps $0xed,%xmm1,%xmm4            ## imm=0b11_10_11_01 → xmm4 = [m1, m3, m2, m3]
   *   0x96b60 mulps  %xmm0,%xmm4                  ## xmm4 = [m1*g, m3*r, m2*0, m3*0]
   *   0x96b63 movsd  0x10(%rsi),%xmm5             ## xmm5 = [m4, m5, 0, 0]
   *   0x96b68 insertps $0x1c,%xmm5,%xmm1          ## imm=0b00_01_1100 → xmm1[1]=m4, zmask lanes 2,3
   *                                                ## xmm1 = [m0, m4, 0, 0]
   *   0x96b6e mulps  %xmm2,%xmm1                  ## xmm1 = [m0*r, m4*g, 0, 0]
   *   0x96b71 addps  %xmm4,%xmm1                  ## xmm1 = [m0*r+m1*g, m3*r+m4*g, 0, 0]
   *   0x96b74 movss  0x8(%rdi),%xmm0              ## xmm0 = [b, 0, 0, 0]
   *   0x96b79 movsldup %xmm0,%xmm4                ## xmm4 = [b, b, 0, 0]
   *   0x96b7d movddup 0x8(%rsi),%xmm0             ## xmm0 = [m2, m3, m2, m3] (dup low qword)
   *   0x96b82 insertps $0x50,%xmm5,%xmm0          ## imm=0b01_01_0000 → xmm0[1]=xmm5[1]=m5
   *                                                ## xmm0 = [m2, m5, m2, m3]
   *   0x96b88 mulps  %xmm4,%xmm0                  ## xmm0 = [m2*b, m5*b, m2*0, m3*0]
   *   0x96b8b mulss  0x18(%rsi),%xmm2             ## xmm2 lane 0 = m6*r
   *   0x96b90 addps  %xmm1,%xmm0                  ## xmm0[0] = m0*r+m1*g + m2*b = r_out
   *                                                ## xmm0[1] = m3*r+m4*g + m5*b = g_out
   *   0x96b93 movsd  0x1c(%rsi),%xmm1             ## xmm1 = [m7, m8, 0, 0]
   *   0x96b98 mulps  %xmm3,%xmm1                  ## xmm1 = [m7*g, m8*b, 0, 0]  (xmm3=[g,b,0,0])
   *   0x96b9b addss  %xmm1,%xmm2                  ## xmm2 lane 0 = m6*r + m7*g
   *   0x96b9f movshdup %xmm1,%xmm1                ## xmm1 = [m8*b, m8*b, 0, 0]
   *   0x96ba3 addss  %xmm2,%xmm1                  ## xmm1 lane 0 = m6*r + m7*g + m8*b = b_out
   *   0x96ba7 retq                                ## return xmm0=(r_out,g_out), xmm1=b_out
   *
   * ALGEBRAIC RESULT: classical 3×3 row-major matrix × column-vector [r,g,b]ᵀ:
   *   r_out = m[0]*r + m[1]*g + m[2]*b
   *   g_out = m[3]*r + m[4]*g + m[5]*b
   *   b_out = m[6]*r + m[7]*g + m[8]*b
   * with float32 rounding at each mulss/addss/mulps/addps step.
   */
  mul(m: cc_matrix9): cc_rgb {
    // Trace of the SIMD sequence in scalar. Each Math.fround forces float32 rounding to match
    // the mulss/mulps/addss/addps semantics of the disasm one lane at a time.
    const r = Math.fround(this.r);
    const g = Math.fround(this.g);
    const b = Math.fround(this.b);

    // r_out = m[0]*r + m[1]*g + m[2]*b
    //   Broken down along the SIMD path: xmm1[0] = m[0]*r + m[1]*g (via mulps then addps @0x96b6e/@0x96b71),
    //   then xmm0[0] = xmm0[0] + xmm1[0] = m[2]*b + (m[0]*r + m[1]*g) (@0x96b90 addps).
    const r_out = Math.fround(
      Math.fround(Math.fround(m[0] * r) + Math.fround(m[1] * g))
      + Math.fround(m[2] * b)
    );
    // g_out = m[3]*r + m[4]*g + m[5]*b
    //   xmm1[1] = m[4]*g + m[3]*r  (@0x96b6e/@0x96b71 lane 1), then + xmm0[1] = m[5]*b (@0x96b90 lane 1).
    const g_out = Math.fround(
      Math.fround(Math.fround(m[4] * g) + Math.fround(m[3] * r))
      + Math.fround(m[5] * b)
    );
    // b_out = m[6]*r + m[7]*g + m[8]*b
    //   xmm2[0] = m[6]*r  (@0x96b8b), then + m[7]*g  (@0x96b9b addss), then + m[8]*b  (@0x96ba3 addss).
    const b_out = Math.fround(
      Math.fround(
        Math.fround(Math.fround(m[6] * r) + Math.fround(m[7] * g))
      )
      + Math.fround(m[8] * b)
    );

    return new cc_rgb(r_out, g_out, b_out);
  }

  /**
   * cc_rgb::operator*=(cc_matrix const&) — in-place multiply by M.
   * @ProCore 0x0000000000096952  (__ZN6cc_rgbmLERK9cc_matrix)
   *
   * DECODE (raw-port/re/disasm/ProCore.cc_rgb.operator*=.s):
   *   0x96958 movq %rdi, %rbx
   *   0x9695b callq __ZN6cc_rgbmlERK9cc_matrix   ## call operator*(cc_matrix) — returns
   *                                              ## xmm0=(r_out,g_out), xmm1=b_out
   *   0x96960 movlps %xmm0, (%rbx)               ## this->{r,g} = (r_out, g_out)
   *   0x96963 movss  %xmm1, 0x8(%rbx)            ## this->b   = b_out
   *   0x9696e retq
   * Net effect: this = this * M.
   */
  mulEq(m: cc_matrix9): void {
    // 0x9695b — recurse into operator*.
    const out = this.mul(m);
    // 0x96960/0x96963 — writeback.
    this.r = out.r;
    this.g = out.g;
    this.b = out.b;
  }

  /**
   * cc_rgb::YIQ() const — convert to YIQ by multiplying by cc::matrix::rgb2YIQ.
   * @ProCore 0x0000000000096970  (__ZNK6cc_rgb3YIQEv)
   *
   * DECODE (raw-port/re/disasm/ProCore.cc_rgb.YIQ.s):
   *   0x96979 movq %rdi, %rbx                     ## rbx = &output cc_YIQ
   *   0x9697c leaq __ZN2cc6matrix7rgb2YIQE(%rip), %rsi   ## rsi = &cc::matrix::rgb2YIQ (@0x15d6f0)
   *   0x96983 movq %rax, %rdi                     ## rdi = &this cc_rgb (rax held it — set @0x96976)
   *   0x96986 callq __ZN6cc_rgbmlERK9cc_matrix    ## cc_rgb::operator*(cc_matrix)
   *   0x9698b extractps $0x0, %xmm0, (%rbx)       ## out.Y = xmm0[0] = r_out (after RGB→YIQ mul: Y)
   *   0x96991 extractps $0x1, %xmm0, 0x4(%rbx)    ## out.I = xmm0[1] = g_out (: I)
   *   0x96998 movss %xmm1, 0x8(%rbx)              ## out.Q = xmm1     = b_out (: Q)
   *   0x9699d movq %rbx, %rax ; retq
   *
   * The identifiers "Y/I/Q" in the OUTPUT are the same three floats produced by operator* — the
   * matrix cc::matrix::rgb2YIQ IS the RGB→YIQ transform, so its rows encode the standard NTSC
   * luma/chroma weights (undecoded here — data-section constant, injected by provider).
   */
  YIQ(): cc_YIQ_value {
    const M = _requireMatrix(CC_MATRIX_RGB2YIQ_ADDR, "rgb2YIQ");
    const out = this.mul(M);
    // 0x9698b/0x96991/0x96998 — write output struct.
    return { Y: out.r, I: out.g, Q: out.b };
  }

  /**
   * cc_rgb::rtheta() — convert to polar (r, θ) coordinates via HSL.
   * @ProCore 0x0000000000096882  (__ZN6cc_rgb6rthetaEv)
   *
   * DECODE (raw-port/re/disasm/ProCore.cc_rgb.rtheta.s):
   *   0x96886   callq __ZNK6cc_rgb3hslEv         ## cc_rgb::hsl() const → xmm0[0]=H, xmm0[1]=S, xmm1[0]=L
   *   0x9688b   xorps %xmm1, %xmm1               ## clear xmm1 for the cvt below (destroys L in xmm1;
   *                                              ##   L is not used by rtheta())
   *   0x9688e   cvtss2sd %xmm0, %xmm1            ## xmm1 as double = H
   *   0x96892   mulsd 0x8bcc6(%rip), %xmm1       ## RIP+8=0x9689a → 0x9689a+0x8bcc6 = 0x122560 = double 2π
   *                                              ##   (u64 0x401921fb54442d18) — xmm1 = H * 2π = θ
   *   0x9689a   cvtsd2ss %xmm1, %xmm1            ## xmm1 as f32 = θ
   *   0x9689e   movshdup %xmm0, %xmm0            ## xmm0 = [xmm0[1], xmm0[1], xmm0[3], xmm0[3]]
   *                                              ##      = [S, S, 0, 0]
   *   0x968a2   insertps $0x10, %xmm1, %xmm0     ## imm=0b00_01_0000 → xmm0[1] = xmm1[0] = θ
   *                                              ##   result: xmm0 = [S, θ, 0, 0]  == the packed
   *                                              ##   (r=S, theta=θ) return.
   *   0x968a8   retq
   *
   * Return: r = S, theta = H * 2π.  (See cc_rtheta.ts for the reciprocal ctor.)
   *
   * NOTE: hsl() itself is throw-stubbed below (@0x0000000000096678 — its 118-line SIMD body has
   * not been transcribed yet), so this function will THROW at the callq site until hsl() lands.
   */
  rtheta(): cc_rtheta_value {
    // 0x96886 — call hsl(). Will throw pending @0x0000000000096678.
    const hsl = this.hsl();
    const H = Math.fround(hsl.h);
    const S = Math.fround(hsl.s);
    // 0x96892 — mul by 2π (double at 0x122560 = 6.283185307179586). The intermediate is done in
    // double precision by the disasm (cvtss2sd → mulsd → cvtsd2ss). Model that with a double
    // multiply and Math.fround the result.
    const TWO_PI_at_0x122560 = 6.283185307179586;
    const theta = Math.fround(H * TWO_PI_at_0x122560);
    // 0x9689e/0x968a2 — pack (r=S, theta=θ).
    return { r: S, theta };
  }

  /**
   * cc_rgb::YCbCr_scopes(cc_YCbCr_space) const — pure dispatch to the space-specific converter.
   * @ProCore 0x00000000000969a8  (__ZNK6cc_rgb12YCbCr_scopesE14cc_YCbCr_space)
   *
   * DECODE (raw-port/re/disasm/ProCore.cc_rgb.YCbCr_scopes.s):
   *   0x969ac   cmpl $0x3, %esi ; je  0x969bc → jmp YCbCr_2020
   *   0x969b1   cmpl $0x1, %esi ; jne 0x969c2 → jmp YCbCr_709
   *   0x969b6                              popq %rbp ; jmp YCbCr_601
   *
   * Behavior table:
   *   space == 1 → YCbCr_601()
   *   space == 3 → YCbCr_2020()
   *   otherwise  → YCbCr_709()  (default branch — includes space==2 AND any other value)
   *
   * Each of _601/_709/_2020 is throw-stubbed below (packed-double SIMD; frontier @0x000969c8/@0x00096ac4/@0x00096a46 not yet transcribed),
   * so this function will THROW pending the transcription of whichever branch is taken.
   */
  YCbCr_scopes(space: number): cc_YCbCr_value {
    // 0x969ac — je 0x3 → YCbCr_2020
    if (space === CC_YCBCR_SPACE_2020) return this.YCbCr_2020();
    // 0x969b1/0x969b4 — je 0x1 → YCbCr_601; otherwise fall through to YCbCr_709 default.
    if (space === CC_YCBCR_SPACE_601)  return this.YCbCr_601();
    return this.YCbCr_709();
  }

  // ==========================================================================
  // FRONTIER — SIMD-packed BT.601/709/2020 conversions + the HSL decoder.
  // Each function is a throwing stub citing its @0xADDR. Do NOT synthesize the
  // math from formulas; the packed-double SIMD sequences load hand-tuned
  // coefficient PAIRS from __DATA_CONST (0x125f88, 0x125fb0, 0x125fc0, 0x125fd0,
  // 0x125fe0, 0x126268, etc.) that must be decoded pair-by-pair before the
  // functions can be faithfully transcribed.
  // ==========================================================================

  /**
   * cc_rgb::hsl() const — HSL decoder (max/min channel, 6-sector hue).
   * @ProCore 0x000000000009667e  (__ZNK6cc_rgb3hslEv)
   *
   * FRONTIER: 118-line SIMD body with several conditional branches and RIP-relative
   * doubles at 0x125550, 0x11e074, 0x121ef8, 0x123908, etc. — not yet transcribed. See
   * raw-port/re/disasm/ProCore.cc_rgb.hsl.s for the decoded instruction stream.
   */
  hsl(): cc_hsl_value {
    throw new Error(`cc_rgb::hsl() @0x000000000009667e not yet transcribed`);
  }

  /**
   * cc_rgb::YCbCr() const — no-arg convenience; equivalent to YCbCr(0) per the disasm at 0x968ce.
   * @ProCore 0x00000000000968ce  (__ZNK6cc_rgb5YCbCrEv)
   *
   * FRONTIER: not yet transcribed (tail-calls into YCbCr(space) with space=0, which is itself
   * throw-stubbed).
   */
  YCbCr(): cc_YCbCr_value {
    throw new Error(`cc_rgb::YCbCr() @0x00000000000968ce not yet transcribed`);
  }

  /**
   * cc_rgb::YCbCr(cc_YCbCr_space) const — matmul-selected converter.
   * @ProCore 0x00000000000968ea  (__ZNK6cc_rgb5YCbCrE14cc_YCbCr_space)
   *
   * FRONTIER: dispatches by `esi` to one of rgb_to_YCbCr{601,709,2020} then calls
   * cc_rgb::operator*(cc_matrix) — but the return packs (Y,Cb,Cr,tag) via `shlq $0x20,%rbx`
   * + `orq %rbx,%rax`, which requires reproducing the exact ABI packing. Not yet transcribed.
   */
  YCbCrWithSpace(space: number): cc_YCbCr_value {
    throw new Error(`cc_rgb::YCbCr(cc_YCbCr_space=${space}) @0x00000000000968ea not yet transcribed`);
  }

  /**
   * cc_rgb::YCbCr_601() const — BT.601 (SDTV) RGB→YCbCr converter.
   * @ProCore 0x00000000000969c8  (__ZNK6cc_rgb9YCbCr_601Ev)
   *
   * FRONTIER: 30-line packed-double SIMD. Decoded coefficients at:
   *   0x125fb0 pair (-0.16873589..., 0.587)        0x125fb8
   *   0x125fc0 pair (0.299, 0.33126410...)          0x125fc8
   *   0x125fd0 pair (0.114, 0.5)                    0x125fd8
   *   0x125fe0 pair (0.5, 0.41868758...)            0x125fe8
   *   0x126268 single -0.08131241...
   * These correspond to the BT.601 luma/chroma matrix rows, but the exact SIMD packing
   * (shufpd $0x1 / hsubpd / addpd / subpd) needs a lane-by-lane transcription that has not
   * yet been done. Not yet transcribed.
   */
  YCbCr_601(): cc_YCbCr_value {
    throw new Error(`cc_rgb::YCbCr_601() @0x00000000000969c8 not yet transcribed`);
  }

  /**
   * cc_rgb::YCbCr_709() const — BT.709 (HDTV) RGB→YCbCr converter.
   * @ProCore 0x0000000000096ac4  (__ZNK6cc_rgb9YCbCr_709Ev)
   *
   * FRONTIER: 30-line packed-double SIMD, same shape as YCbCr_601 with different coefficients.
   * Not yet transcribed.
   */
  YCbCr_709(): cc_YCbCr_value {
    throw new Error(`cc_rgb::YCbCr_709() @0x0000000000096ac4 not yet transcribed`);
  }

  /**
   * cc_rgb::YCbCr_2020() const — BT.2020 (UHD/HDR) RGB→YCbCr converter.
   * @ProCore 0x0000000000096a46  (__ZNK6cc_rgb10YCbCr_2020Ev)
   *
   * FRONTIER: 30-line packed-double SIMD, same shape as YCbCr_601 with BT.2020 coefficients.
   * Not yet transcribed.
   */
  YCbCr_2020(): cc_YCbCr_value {
    throw new Error(`cc_rgb::YCbCr_2020() @0x0000000000096a46 not yet transcribed`);
  }

  /**
   * cc_rgb::transform601to709() — in-place BT.601 → BT.709 color-primary transform.
   * @ProCore 0x00000000000965ec  (__ZN6cc_rgb17transform601to709Ev)
   *
   * FRONTIER: 34-line packed-double SIMD. Decoded coefficient pairs at 0x125f88 (0.07848, 0.9136),
   * 0x125f98 (1.17217, ...), 0x125fa0 (0.00792, 0.06713), 0x126250/0x126258/0x126260 (single doubles
   * 0.009578, 0.032222, 0.9582). The instruction sequence uses shufpd/mulpd/addpd/subpd/movddup +
   * hsubpd — a lane-by-lane transcription is required. Not yet transcribed.
   */
  transform601to709(): void {
    throw new Error(`cc_rgb::transform601to709() @0x00000000000965ec not yet transcribed`);
  }
}
