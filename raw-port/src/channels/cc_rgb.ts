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
   * DECODE (raw-port/re/disasm/ProCore.__ZNK6cc_rgb3hslEv.s):
   *   0x96682   movss (%rdi), %xmm4                 ## xmm4 = r      (float @+0x0)
   *   0x96686   movss 0x4(%rdi), %xmm5              ## xmm5 = g      (float @+0x4)
   *   0x9668b   movss 0x8(%rdi), %xmm6              ## xmm6 = b      (float @+0x8)
   *   0x96690   movaps %xmm5, %xmm0
   *   0x96693   maxss  %xmm6, %xmm0                 ## xmm0 = max(g, b)
   *   0x96697   movaps %xmm4, %xmm2
   *   0x9669a   maxss  %xmm0, %xmm2                 ## xmm2 = max(r, max(g,b)) = max
   *   0x9669e   movaps %xmm5, %xmm0
   *   0x966a1   minss  %xmm6, %xmm0                 ## xmm0 = min(g, b)
   *   0x966a5   movaps %xmm4, %xmm8
   *   0x966a9   minss  %xmm0, %xmm8                 ## xmm8 = min(r, min(g,b)) = min
   *   0x966ae   movaps %xmm8, %xmm9
   *   0x966b2   addss  %xmm2, %xmm9                 ## xmm9 = min + max (float)
   *   0x966b7   xorps  %xmm0, %xmm0
   *   0x966ba   cvtss2sd %xmm9, %xmm0               ## xmm0 (dbl) = (double)(min+max)
   *   0x966bf   mulsd  0x8eec9(%rip), %xmm0         ## @0x125590 = 0.5  → xmm0 = L (dbl) = (min+max)/2
   *   0x966c7   movaps %xmm2, %xmm3
   *   0x966ca   subss  %xmm8, %xmm3                 ## xmm3 (float) = max - min = delta
   *   0x966cf   cvtss2sd %xmm3, %xmm7               ## xmm7 (dbl) = (double)delta
   *   0x966d3   xorps  %xmm1, %xmm1
   *   0x966d6   ucomiss %xmm3, %xmm1                ## flags on (0 - delta) — signals delta < 0
   *   0x966d9   jbe    0x966e2                      ## 0 <= delta → skip (normal path)
   *   0x966db   xorps  0x4b98e(%rip), %xmm7         ## @0xe2070 = 128-bit sign-flip mask
   *                                                 ##   (xorps of dbl sign bits) — xmm7 = |delta|_dbl
   *   0x966e2   xorps  %xmm1, %xmm1                 ## zero xmm1 low for cvt
   *   0x966e5   cvtsd2ss %xmm0, %xmm1               ## xmm1 (float) = L
   *   0x966e9   xorps  %xmm0, %xmm0                 ## xmm0 = 0 (accumulator for return H/S)
   *   0x966ec   movsd  0x4b98b(%rip), %xmm10        ## @0xe2080 = 2^-23 = 1.192092896e-07 (dbl)
   *   0x966f5   ucomisd %xmm7, %xmm10               ## flags on (eps - |delta|)
   *   0x966fa   ja     0x96880                      ## |delta| < eps  → ACHROMATIC: return (0, 0, L)
   *
   *   0x96700   movss  0x4b880(%rip), %xmm0         ## @0xe1f88 = 0.5f
   *   0x96708   ucomiss %xmm1, %xmm0                ## flags on (0.5 - L)
   *   0x9670b   jae    0x96737                      ## 0.5 >= L → divisor = min+max ; skip the block
   *   0x9670d   xorps  %xmm0, %xmm0                 ## L > 0.5 path
   *   0x96710   cvtss2sd %xmm2, %xmm0               ## xmm0 = (dbl)max
   *   0x96714   movsd  0x8be4c(%rip), %xmm7         ## @0x122568 = 2.0 (dbl)
   *   0x9671c   xorps  %xmm9, %xmm9
   *   0x96720   cvtss2sd %xmm8, %xmm9               ## xmm9 = (dbl)min
   *   0x96725   subsd  %xmm0, %xmm7                 ## xmm7 = 2 - max
   *   0x96729   subsd  %xmm9, %xmm7                 ## xmm7 = 2 - max - min
   *   0x9672e   xorps  %xmm9, %xmm9
   *   0x96732   cvtsd2ss %xmm7, %xmm9               ## xmm9 (float) = 2 - min - max  (divisor)
   *
   *   0x96737   movaps 0x4b922(%rip), %xmm0         ## @0xe2060 = (-0f,-0f,-0f,-0f) sign-flip pack
   *   0x9673e   xorps  %xmm9, %xmm0                 ## xmm0[0] = -xmm9 (lane 0 flipped)
   *   0x96742   maxss  %xmm9, %xmm0                 ## xmm0 = max(-div, div) = |div|
   *   0x96747   cvtss2sd %xmm0, %xmm0               ## xmm0 (dbl) = |div|
   *   0x9674b   movsd  0x8ce0d(%rip), %xmm7         ## @0x123560 = 0.0001 (dbl)
   *   0x96753   ucomisd %xmm0, %xmm7                ## flags on (0.0001 - |div|)
   *   0x96757   jbe    0x96762                      ## |div| >= 0.0001  → keep divisor xmm9 as-is
   *   0x96759   movss  0x8fbce(%rip), %xmm9         ## @0x126330 = 1e-4f  — clamp divisor to 1e-4
   *
   *   0x96762   movaps %xmm3, %xmm7                 ## xmm7 (float) = delta
   *   0x96765   movaps %xmm4, %xmm10                ## xmm10 = r
   *   0x96769   subss  %xmm2, %xmm10                ## xmm10 = r - max
   *   0x9676e   andps  0x4b43a(%rip), %xmm10        ## @0xe1bb0 = |...|_pack   → xmm10 = |r - max|
   *   0x96776   divss  %xmm9, %xmm7                 ## xmm7 (float) = delta / divisor = S
   *   0x9677b   movss  0x8ee89(%rip), %xmm0         ## @0x12560c = 1.192092896e-07f (eps)
   *   0x96783   ucomiss %xmm10, %xmm0               ## flags on (eps - |r-max|)
   *   0x96787   jbe    0x967b9                      ## |r-max| >= eps → r NOT max → to r-not-max block
   *
   *   ; r IS max
   *   0x96789   movaps %xmm5, %xmm4                 ## xmm4 = g
   *   0x9678c   subss  %xmm8, %xmm4                 ## xmm4 = g - min
   *   0x96791   andps  0x4b418(%rip), %xmm4         ## xmm4 = |g - min|
   *   0x96798   ucomiss %xmm4, %xmm0                ## flags on (eps - |g-min|)
   *   0x9679b   jbe    0x967fd                      ## |g-min| >= eps → g NOT min → b=min branch
   *
   *   ; r=max, g=min (b is middle) — TERMINAL 1
   *   0x9679d   subss  %xmm6, %xmm2                 ## xmm2 = max - b = r - b
   *   0x967a1   divss  %xmm3, %xmm2                 ## xmm2 = (r - b) / delta
   *   0x967a5   xorps  %xmm0, %xmm0
   *   0x967a8   cvtss2sd %xmm2, %xmm0
   *   0x967ac   addsd  0x8d164(%rip), %xmm0         ## @0x123918 = 5.0 → H_dbl = 5 + (r-b)/delta
   *   0x967b4   jmp    0x9686e
   *
   *   0x967b9:  ; r NOT max
   *   0x967b9   movaps %xmm5, %xmm9
   *   0x967bd   subss  %xmm2, %xmm9                 ## xmm9 = g - max
   *   0x967c2   andps  0x4b3e6(%rip), %xmm9         ## xmm9 = |g - max|
   *   0x967ca   ucomiss %xmm9, %xmm0                ## flags on (eps - |g-max|)
   *   0x967ce   jbe    0x96813                      ## |g-max| >= eps → g NOT max → b=max block
   *
   *   ; g IS max
   *   0x967d0   movaps %xmm6, %xmm5
   *   0x967d3   subss  %xmm8, %xmm5                 ## xmm5 = b - min
   *   0x967d8   andps  0x4b3d1(%rip), %xmm5         ## xmm5 = |b - min|
   *   0x967df   ucomiss %xmm5, %xmm0                ## flags on (eps - |b-min|)
   *   0x967e2   jbe    0x96840                      ## |b-min| >= eps → b NOT min → r=min branch
   *
   *   ; g=max, b=min — TERMINAL 3
   *   0x967e4   subss  %xmm4, %xmm2                 ## xmm2 = max - r = g - r
   *   0x967e8   divss  %xmm3, %xmm2                 ## xmm2 = (g - r) / delta
   *   0x967ec   xorps  %xmm0, %xmm0
   *   0x967ef   cvtss2sd %xmm2, %xmm0
   *   0x967f3   addsd  0x8bd35(%rip), %xmm0         ## @0x122530 = 1.0 → H_dbl = 1 + (g-r)/delta
   *   0x967fb   jmp    0x9686e
   *
   *   ; r=max, b=min (g NOT min) — TERMINAL 2
   *   0x967fd   subss  %xmm5, %xmm2                 ## xmm2 = max - g = r - g
   *   0x96801   divss  %xmm3, %xmm2                 ## xmm2 = (r - g) / delta
   *   0x96805   cvtss2sd %xmm2, %xmm2
   *   0x96809   movsd  0x8bd1f(%rip), %xmm0         ## @0x122530 = 1.0
   *   0x96811   jmp    0x9686a                      ## H_dbl = 1 - (r-g)/delta
   *
   *   ; g NOT max ; b IS max branch
   *   0x96813   movaps %xmm4, %xmm6
   *   0x96816   subss  %xmm8, %xmm6                 ## xmm6 = r - min
   *   0x9681b   andps  0x4b38e(%rip), %xmm6         ## xmm6 = |r - min|
   *   0x96822   ucomiss %xmm6, %xmm0                ## flags on (eps - |r-min|)
   *   0x96825   jbe    0x96856                      ## |r-min| >= eps → r NOT min → g=min branch
   *
   *   ; b=max, r=min — TERMINAL 5
   *   0x96827   subss  %xmm5, %xmm2                 ## xmm2 = max - g = b - g
   *   0x9682b   divss  %xmm3, %xmm2                 ## (b - g) / delta
   *   0x9682f   xorps  %xmm0, %xmm0
   *   0x96832   cvtss2sd %xmm2, %xmm0
   *   0x96836   addsd  0x8bdea(%rip), %xmm0         ## @0x122628 = 3.0 → H_dbl = 3 + (b-g)/delta
   *   0x9683e   jmp    0x9686e
   *
   *   ; g=max, r=min (b NOT min) — TERMINAL 4
   *   0x96840   subss  %xmm6, %xmm2                 ## xmm2 = max - b = g - b
   *   0x96844   divss  %xmm3, %xmm2                 ## (g - b) / delta
   *   0x96848   cvtss2sd %xmm2, %xmm2
   *   0x9684c   movsd  0x8bdd4(%rip), %xmm0         ## @0x122628 = 3.0
   *   0x96854   jmp    0x9686a                      ## H_dbl = 3 - (g-b)/delta
   *
   *   ; b=max, g=min — TERMINAL 6
   *   0x96856   subss  %xmm4, %xmm2                 ## xmm2 = max - r = b - r
   *   0x9685a   divss  %xmm3, %xmm2                 ## (b - r) / delta
   *   0x9685e   cvtss2sd %xmm2, %xmm2
   *   0x96862   movsd  0x8d0ae(%rip), %xmm0         ## @0x123918 = 5.0
   *                                                 ##   jmp 0x9686a → H_dbl = 5 - (b-r)/delta
   *
   *   0x9686a   subsd  %xmm2, %xmm0                 ## H_dbl = const - ratio   (terminals 2,4,6)
   *   0x9686e   cvtsd2ss %xmm0, %xmm0               ## H (float)
   *   0x96872   divss  0x8ed96(%rip), %xmm0         ## @0x125610 = 6.0f → H /= 6
   *   0x9687a   insertps $0x10, %xmm7, %xmm0        ## xmm0[1] = xmm7[0] = S (float)
   *                                                 ##   result packed: xmm0 = (H, S, ?, ?)
   *                                                 ##   xmm1 = L (float, set @0x966e5)
   *   0x96880   popq %rbp
   *   0x96881   retq
   *
   * SIX HUE TERMINALS (H in [0, 6) sector units, then divided by 6):
   *   r=max, g=min : H = 5 + (r-b)/delta   ; b is middle, hue in [5, 6)
   *   r=max, b=min : H = 1 - (r-g)/delta   ; g is middle, hue in [0, 1)
   *   g=max, b=min : H = 1 + (g-r)/delta   ; r is middle, hue in [1, 2)
   *   g=max, r=min : H = 3 - (g-b)/delta   ; b is middle, hue in [2, 3)
   *   b=max, r=min : H = 3 + (b-g)/delta   ; g is middle, hue in [3, 4)
   *   b=max, g=min : H = 5 - (b-r)/delta   ; r is middle, hue in [4, 5)
   * Equivalent to the standard piecewise HSL hue formula, wrapped positive.
   *
   * ACHROMATIC (delta < 2^-23): returns { h: 0, s: 0, l: L } (xmm0 = 0 packed).
   * DIVISOR (denominator for saturation): min+max if L<=0.5, else 2-min-max;
   *   further clamped to a floor of 1e-4f to prevent div-by-zero on tiny sums.
   */
  hsl(): cc_hsl_value {
    // 0x96682-0x9668b — load fields as float32.
    const r = Math.fround(this.r);
    const g = Math.fround(this.g);
    const b = Math.fround(this.b);

    // 0x96690-0x966a9 — scalar max/min via maxss/minss.
    const max = Math.fround(Math.max(r, Math.max(g, b)));
    const min = Math.fround(Math.min(r, Math.min(g, b)));

    // 0x966ae-0x966bf — L (double) = (min + max) * 0.5.
    //   Note: xmm9 (float) = min + max first, THEN cvtss2sd, THEN * 0.5 in double.
    const minPlusMax_f = Math.fround(min + max);              // 0x966b2 addss  (float32)
    const CC_D_HALF_AT_0x00125590 = 0.5000000000000001;       // @0x125590 dbl u64 0x3fe0000000000001
    const L_dbl = minPlusMax_f * CC_D_HALF_AT_0x00125590;     // 0x966bf mulsd  (double)

    // 0x966c7-0x966cf — delta (float) and its (double) copy.
    const delta_f = Math.fround(max - min);                   // 0x966ca subss
    // 0x966d6-0x966db — abs(delta) in double via xor of dbl-sign mask if 0 > delta.
    //   For non-negative delta this is a no-op. Model with plain Math.abs on double.
    const absDelta_dbl = Math.abs(delta_f);

    // 0x966e5 — L as float32.
    const L_f = Math.fround(L_dbl);                           // 0x966e5 cvtsd2ss

    // 0x966ec-0x966fa — ACHROMATIC early return: if |delta_dbl| < eps, return (0, 0, L_f).
    const CC_D_2POWNEG23_AT_0x000e2080 = 1.1920928955078125e-07;  // @0xe2080 dbl 2^-23
    if (CC_D_2POWNEG23_AT_0x000e2080 > absDelta_dbl) {
      // xmm0 was zeroed at 0x966e9; branch target 0x96880 returns xmm0 (=0 packed) + xmm1 (=L_f).
      return { h: 0, s: 0, l: L_f };
    }

    // 0x96700-0x9670b — select divisor: L > 0.5 → 2 - min - max ; L <= 0.5 → min + max.
    //   L compared as float32 vs 0.5f (movss @0xe1f88).
    const CC_F_HALF_AT_0x000e1f88 = Math.fround(0.5);         // @0xe1f88 float 0.5
    let divisor_f: number;
    if (CC_F_HALF_AT_0x000e1f88 >= L_f) {
      // 0x9670b jae → skip block → divisor = min+max (still in xmm9 as float from 0x966b2).
      divisor_f = minPlusMax_f;
    } else {
      // 0x9670d-0x96732 — 2 - max - min in double, then cvtsd2ss to float.
      const max_dbl = max;                                    // 0x96710 cvtss2sd
      const min_dbl = min;                                    // 0x96720 cvtss2sd
      const CC_D_TWO_AT_0x00122568 = 2.0;                     // @0x122568 dbl 2.0
      const tmp_dbl = (CC_D_TWO_AT_0x00122568 - max_dbl) - min_dbl;  // 0x96725/0x96729 subsd, subsd
      divisor_f = Math.fround(tmp_dbl);                       // 0x96732 cvtsd2ss
    }

    // 0x96737-0x96747 — |divisor| in double (xorps + maxss + cvtss2sd).
    //   For non-negative divisor this is Math.abs on the double.
    const absDivisor_dbl = Math.abs(divisor_f);

    // 0x9674b-0x96759 — if |divisor|_dbl < 0.0001, clamp divisor float to 1e-4f.
    //   (Only the divisor magnitude is compared; the sign of divisor_f is preserved but for
    //   RGB inputs divisor_f is >=0 always so this is a positive-floor.)
    const CC_D_1EM4_AT_0x00123560 = 0.0001;                   // @0x123560 dbl 0.0001
    const CC_F_1EM4_AT_0x00126330 = Math.fround(9.999999747378752e-05);  // @0x126330 float 1e-4
    if (CC_D_1EM4_AT_0x00123560 > absDivisor_dbl) {
      // 0x96757 jbe not-taken (|div| < 0.0001) → load clamp.
      divisor_f = CC_F_1EM4_AT_0x00126330;                    // 0x96759 movss
    }

    // 0x96762-0x96776 — Saturation: S = delta / divisor  (all float32).
    const S_f = Math.fround(delta_f / divisor_f);             // 0x96776 divss

    // 0x96765-0x9676e — |r - max| as float (for the r-is-max compare).
    const absRminusMax = Math.abs(Math.fround(r - max));      // 0x96769 subss + 0x9676e andps
    // 0x9677b — eps as float32 (for comparisons).
    const CC_F_EPS_AT_0x0012560c = Math.fround(1.1920928955078125e-07);   // @0x12560c float 2^-23

    // 0x96783-0x96787 — is r the max?  |r - max| < eps  ⇒  YES.
    //   ucomiss xmm10, xmm0 (xmm0=eps, xmm10=|r-max|); jbe (eps <= |r-max|) → jump to r-NOT-max.
    //   Fall through: eps > |r-max| → r IS max.
    let H_sixths: number;   // H_dbl expressed in [0, 6) BEFORE the final /6.
    if (CC_F_EPS_AT_0x0012560c > absRminusMax) {
      // ---- r IS max ----
      // 0x96789-0x96798 — |g - min| < eps?
      const absGminusMin = Math.abs(Math.fround(g - min));    // 0x9678c/0x96791
      if (CC_F_EPS_AT_0x0012560c > absGminusMin) {
        // TERMINAL 1: r=max, g=min → H = 5 + (r - b)/delta
        //   0x9679d subss %xmm6, %xmm2 : xmm2 (was max) becomes max - b = r - b
        //   0x967a1 divss %xmm3, %xmm2 : (r-b)/delta
        //   0x967ac addsd @0x123918=5.0 (in double)
        const ratio_f = Math.fround(Math.fround(max - b) / delta_f);
        const CC_D_5_AT_0x00123918 = 5.0;                     // @0x123918 dbl 5.0
        H_sixths = ratio_f + CC_D_5_AT_0x00123918;            // 0x967ac addsd (dbl)
      } else {
        // TERMINAL 2: r=max, b=min (g NOT min) → H = 1 - (r - g)/delta
        //   0x967fd subss %xmm5, %xmm2 : max - g = r - g
        //   0x96801 divss %xmm3, %xmm2
        //   0x96809 movsd @0x122530=1.0 ; jmp 0x9686a → subsd
        const ratio_f = Math.fround(Math.fround(max - g) / delta_f);
        const CC_D_1_AT_0x00122530 = 1.0;                     // @0x122530 dbl 1.0
        H_sixths = CC_D_1_AT_0x00122530 - ratio_f;            // 0x9686a subsd (dbl)
      }
    } else {
      // ---- r NOT max ----
      // 0x967b9-0x967ce — |g - max| < eps?
      const absGminusMax = Math.abs(Math.fround(g - max));    // 0x967bd/0x967c2
      if (CC_F_EPS_AT_0x0012560c > absGminusMax) {
        // ---- g IS max ----
        // 0x967d0-0x967e2 — |b - min| < eps?
        const absBminusMin = Math.abs(Math.fround(b - min));  // 0x967d3/0x967d8
        if (CC_F_EPS_AT_0x0012560c > absBminusMin) {
          // TERMINAL 3: g=max, b=min → H = 1 + (g - r)/delta
          //   0x967e4 subss %xmm4, %xmm2 : max - r = g - r
          //   0x967f3 addsd @0x122530=1.0
          const ratio_f = Math.fround(Math.fround(max - r) / delta_f);
          const CC_D_1_AT_0x00122530 = 1.0;                   // @0x122530 dbl 1.0
          H_sixths = ratio_f + CC_D_1_AT_0x00122530;          // 0x967f3 addsd
        } else {
          // TERMINAL 4: g=max, r=min (b NOT min) → H = 3 - (g - b)/delta
          //   0x96840 subss %xmm6, %xmm2 : max - b = g - b
          //   0x9684c movsd @0x122628=3.0 ; jmp 0x9686a → subsd
          const ratio_f = Math.fround(Math.fround(max - b) / delta_f);
          const CC_D_3_AT_0x00122628 = 3.0;                   // @0x122628 dbl 3.0
          H_sixths = CC_D_3_AT_0x00122628 - ratio_f;          // 0x9686a subsd
        }
      } else {
        // ---- b IS max ----
        // 0x96813-0x96825 — |r - min| < eps?
        const absRminusMin = Math.abs(Math.fround(r - min));  // 0x96816/0x9681b
        if (CC_F_EPS_AT_0x0012560c > absRminusMin) {
          // TERMINAL 5: b=max, r=min → H = 3 + (b - g)/delta
          //   0x96827 subss %xmm5, %xmm2 : max - g = b - g
          //   0x96836 addsd @0x122628=3.0
          const ratio_f = Math.fround(Math.fround(max - g) / delta_f);
          const CC_D_3_AT_0x00122628 = 3.0;                   // @0x122628 dbl 3.0
          H_sixths = ratio_f + CC_D_3_AT_0x00122628;          // 0x96836 addsd
        } else {
          // TERMINAL 6: b=max, g=min → H = 5 - (b - r)/delta
          //   0x96856 subss %xmm4, %xmm2 : max - r = b - r
          //   0x96862 movsd @0x123918=5.0 ; jmp 0x9686a → subsd
          const ratio_f = Math.fround(Math.fround(max - r) / delta_f);
          const CC_D_5_AT_0x00123918 = 5.0;                   // @0x123918 dbl 5.0
          H_sixths = CC_D_5_AT_0x00123918 - ratio_f;          // 0x9686a subsd
        }
      }
    }

    // 0x9686e-0x96872 — H (float) = H_dbl / 6.0f.
    const CC_F_6_AT_0x00125610 = Math.fround(6.0);            // @0x125610 float 6.0
    const H_f = Math.fround(Math.fround(H_sixths) / CC_F_6_AT_0x00125610);

    // 0x9687a — pack (H, S) in xmm0[0..1], xmm1 = L. Model as struct.
    return { h: H_f, s: S_f, l: L_f };
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
