// cc_matrix.ts — 3×3 float32 color-conversion matrix. Transcribed from FCP ProCore framework
// (Final Cut Pro.app/.../ProCore). Class holds 9 consecutive `float`s in row-major order at
// offsets +0x00..+0x20; three exported member functions: identity(), mul(other), invert().
//
// DECODE: raw-port/re/disasm/ProCore.cc_matrix.identity.s
//         raw-port/re/disasm/ProCore.cc_matrix.mul.s
//         raw-port/re/disasm/ProCore.cc_matrix.invert.s
//
// Struct layout (from ordered offset reads in every method):
//   +0x00 m[0] : float32  (row 0 col 0 — "a")
//   +0x04 m[1] : float32  (row 0 col 1 — "b")
//   +0x08 m[2] : float32  (row 0 col 2 — "c")
//   +0x0c m[3] : float32  (row 1 col 0 — "d")
//   +0x10 m[4] : float32  (row 1 col 1 — "e")
//   +0x14 m[5] : float32  (row 1 col 2 — "f")
//   +0x18 m[6] : float32  (row 2 col 0 — "g")
//   +0x1c m[7] : float32  (row 2 col 1 — "h")
//   +0x20 m[8] : float32  (row 2 col 2 — "i")
// Confirmed by mul()'s row×col k-loop (rdx stride 0xC = 12 bytes = 3 floats, r9 stride 0xC per
// row of the other matrix) and by invert()'s cofactor expansion loading exactly these offsets.
//
// RIP-relative constants referenced across the three methods (all resolved via
// resolve.py ProCore const 0x...):
//    0xe1f68 : low 4 bytes 0x3f800000 = 1.0f (movss target in identity@0x4a12 and mul@0x4d1c)
//    0xe1f70 : low 4 bytes 0x3f800000 = 1.0f (movss target in invert@0x4c10 — the 1/det step)
//    0xe2060 : u64 = 0x8000000080000000 (two -0.0f — xorps sign-flip mask on low 2 lanes)
//    0xe2070 : u64 = 0x8000000000000000 (one -0.0f — xorps sign-flip mask on low lane)
//    0xe2080 : double 2^-23 ≈ 1.19e-07 (u64 0x3e80000000000000) — the FLT_EPSILON tolerance
//                                          for the invert() singularity check

/** 3×3 float32 matrix in row-major order.  See file header for offset map. */
export class cc_matrix {
  m: Float32Array = new Float32Array(9);

  /**
   * cc_matrix::identity() — set this matrix to the 3×3 identity.
   * @ProCore 0x0000000000004a0e  (__ZN9cc_matrix8identityEv)
   *
   * DECODE (raw-port/re/disasm/ProCore.cc_matrix.identity.s):
   *   0x4a12   movss  0xdd556(%rip), %xmm0    ## RIP+disp = 0xe1f68 → 1.0f (u32 0x3f800000).
   *                                          After movss, xmm0 = {1.0f, 0.0f, 0.0f, 0.0f}.
   *   0x4a1a   movups %xmm0, (%rdi)           ## m[0..3] = {1.0, 0.0, 0.0, 0.0}
   *   0x4a1d   movups %xmm0, 0x10(%rdi)       ## m[4..7] = {1.0, 0.0, 0.0, 0.0}
   *   0x4a21   movl   $0x3f800000, 0x20(%rdi) ## m[8] = 1.0f
   *   0x4a28   popq %rbp ; retq
   *
   * Net effect: m[0]=1, m[1..3]=0, m[4]=1, m[5..7]=0, m[8]=1  — 3×3 identity in row-major.
   */
  identity(): void {
    // 0x4a12-0x4a21 — three writes producing the identity pattern.
    this.m[0] = 1.0; this.m[1] = 0.0; this.m[2] = 0.0;
    this.m[3] = 0.0; this.m[4] = 1.0; this.m[5] = 0.0;
    this.m[6] = 0.0; this.m[7] = 0.0; this.m[8] = 1.0;
  }

  /**
   * cc_matrix::mul(cc_matrix const& other) — this = this * other  (classical 3×3 matmul).
   * @ProCore 0x0000000000004d18  (__ZN9cc_matrix3mulERKS_)
   *
   * DECODE (raw-port/re/disasm/ProCore.cc_matrix.mul.s):
   *   0x4d1c   movss  0xdd24c(%rip), %xmm0    ## same 1.0f const at 0xe1f68 as identity()
   *   0x4d24-0x4d2f  Prepare a "dead identity" 9-float buffer on stack [rbp-0x30..rbp-0x10]
   *                  (the compiler emits identity-shaped init that is IMMEDIATELY overwritten by
   *                  the loop's `movl $0x0,(%rax)` at 0x4d42 — kept in the disasm but has no
   *                  observable effect).
   *   0x4d36   xorl %ecx, %ecx                ## i = 0 (outer row index)
   *   0x4d38   movq %rdi, %rdx                ## rdx = &this->m[i * 3]
   *   0x4d3b   xorl %r8d, %r8d                ## j = 0  — LOOP HEAD i (0x4d3b tag)
   *   0x4d3e   leaq (%rsi,%r8,4), %r9         ## r9 = &other->m[0*3+j]
   *   0x4d42   movl $0x0, (%rax)              ## acc[i, j] = 0
   *   0x4d48   xorps %xmm0, %xmm0             ## scalar acc = 0
   *   0x4d4b   xorl %r10d, %r10d              ## k = 0  — LOOP HEAD k
   *   0x4d4e   movss (%rdx,%r10,4), %xmm1     ## xmm1 = this->m[i, k]
   *   0x4d54   mulss (%r9), %xmm1             ## xmm1 *= other->m[k, j]
   *   0x4d59   addss %xmm1, %xmm0             ## acc += that
   *   0x4d5d   movss %xmm0, (%rax)            ## partial store to stack cell (i, j)
   *   0x4d61   addq $0xc, %r9                 ## r9 += 12 bytes = next row of `other`
   *   0x4d65   incq %r10 ; cmpl $0x3,%r10d ; jne 0x4d4e   ## k < 3
   *   0x4d6e   addq $0x4, %rax                ## next output float cell
   *   0x4d72   incq %r8 ; cmpq $0x3,%r8 ; jne 0x4d3e     ## j < 3
   *   0x4d7b   incq %rcx ; addq $0xc,%rdx ; cmpq $0x3,%rcx ; jne 0x4d3b   ## i < 3
   *   0x4d88-0x4d9a  Copy stack accumulator → this: m[8] then m[0..3] then m[4..7].
   */
  mul(other: cc_matrix): void {
    // 0x4d24-0x4d42 — allocate the accumulator (initial contents overwritten every iteration).
    const acc = new Float32Array(9);

    // 0x4d36-0x4d86 — classical i/j/k row-major matrix multiply, float32 rounding at each op.
    for (let i = 0; i < 3; i++) {                    // 0x4d3b outer  (rcx = i)
      for (let j = 0; j < 3; j++) {                  // 0x4d3e middle (r8 = j)
        // 0x4d42: acc[i*3+j] = 0
        let sum = Math.fround(0);
        for (let k = 0; k < 3; k++) {                // 0x4d4b inner (r10 = k)
          // 0x4d4e-0x4d54: mulss single-precision — Math.fround forces float32 rounding.
          const prod = Math.fround(this.m[i * 3 + k] * other.m[k * 3 + j]);
          // 0x4d59: addss single-precision.
          sum = Math.fround(sum + prod);
        }
        acc[i * 3 + j] = sum;
      }
    }

    // 0x4d88-0x4d9a — write accumulator back to this (order of writes irrelevant for correctness).
    for (let k = 0; k < 9; k++) this.m[k] = acc[k];
  }

  /**
   * cc_matrix::invert() — replace this matrix with its inverse via cofactor expansion.
   * @ProCore 0x0000000000004a2a  (__ZN9cc_matrix6invertEv)
   *
   * DECODE (raw-port/re/disasm/ProCore.cc_matrix.invert.s — 167 lines of SSE float32 math):
   *
   * REGISTER MAP (load block 0x4a2e-0x4a50 + later reloads):
   *   xmm4       = m[0]   = a       xmm7       = m[1]   = b   (loaded at 0x4a78)
   *   xmm8       = m[2]   = c       stack[-0x20] = m[3] = d
   *   xmm6       = m[4]   = e       xmm11      = m[5]   = f   (loaded at 0x4a7d)
   *   xmm9       = m[6]   = g       stack[-0x04] = m[7] = h
   *   xmm2       = m[8]   = i
   *   xmm13      = 0.0f  (xorps at 0x4a63) — zero reference
   *   xmm3       = SIGNED running sum of the 6 signed triple products
   *   xmm15      = MAGNITUDE running sum (via cmpnless + blendvps at 0x4a8d/0x4ac6/0x4af9/…) —
   *                a Kahan-style magnitude bound run alongside the signed sum
   *
   * SIX SIGNED TRIPLE PRODUCTS (cofactor expansion of det):
   *   +a*e*i    (0x4a55-0x4a5f: xmm1 = a*e; xmm0 = xmm1*i)
   *   +c*d*h    (0x4a97-0x4aa6: xmm10 = d*h; xmm5 = c*(d*h))
   *   +b*f*g    (0x4acc-0x4ad9: xmm12 = b*g; xmm5 = f*b*g)
   *   -c*e*g    (0x4aff-0x4b10: xmm14 = -g via xorps 0xdd555(%rip)=0xe2060=-0.0f;
   *              xmm14 *= e (=xmm6); xmm14 *= c (=xmm8)) — product = -g*e*c = -c*e*g
   *   -b*d*i    (0x4b38-0x4b4a: xmm14 = -d via xorps 0xdd51b(%rip)=0xe2060; xmm14 *= b (=xmm7);
   *              xmm14 *= i (=xmm2))
   *   -a*f*h    (0x4b72-0x4b84: xmm14 = -a via xorps 0xdd4e2(%rip)=0xe2060; xmm14 *= h
   *              (=stack[-0x04]); xmm14 *= f (=xmm11))
   *   → det = a*e*i + c*d*h + b*f*g - c*e*g - b*d*i - a*f*h
   *     (the classical 3×3 determinant along row 0: a(ei-fh) - b(di-fg) + c(dh-eg)).
   *
   * Each signed product is added to xmm3 ONLY IF `jb` after `ucomiss xmm13(=0),xmmProd` — i.e.
   * only when the product is non-negative — otherwise the negative products flow into the
   * magnitude bound xmm15 via blendvps but not into xmm3. The result: xmm3 is a "positive-only
   * sum" and xmm15 is a signed "all-terms sum". The DIVISOR used for 1/det at 0x4c10 is derived
   * from `xmm14 = xmm3 + xmm15` at 0x4bb0 — a value that reduces to the classical determinant
   * under stable arithmetic.
   *
   * SINGULARITY / CONDITIONING GATES (0x4bb5-0x4c0a):
   *   Gate A: 0x4bca-0x4bd6 — compare |xmm14| (as double after cvtss2sd + xorps of -0.0)
   *                            against double 0x3e80000000000000 at 0xe2080 (≈ 2^-23 = FLT_EPSILON).
   *                            If |det| < that ε, JUMP to 0x4d15 (bail — leave this unchanged).
   *   Gate B: 0x4bdc-0x4c0a — compute xmm3 -= xmm15, then xmm0 = xmm14 / xmm3, then |xmm0|
   *                            via xorps mask (movaps 0xdd470(%rip)=0xe2060=two -0.0 lanes) +
   *                            maxss. Convert to double and compare against 0x3e8… at 0xe2080.
   *                            If |ratio| > that ε, JUMP to 0x4d15 (bail — matrix is ill-cond).
   *
   * INVERSE (0x4c10-0x4d10) — classical 3×3 adjugate transpose divided by det:
   *   0x4c10-0x4c18  invDet = 1.0f / xmm14  (1.0f loaded from 0xdd358(%rip)=0xe1f70 = 0x3f800000).
   *   0x4c1d-0x4c35  adj[0] = e*i - f*h
   *   0x4c3a-0x4c55  adj[1] = c*h - b*i     (xorps 0xdd40b(%rip)=0xe2060 negates b*i - c*h)
   *   0x4c5c-0x4c70  adj[2] = b*f - c*e     (via insertps at 0x4c70)
   *   0x4c77-0x4c9e  adj[3] = f*g - d*i     (xorps 0xdd3c2(%rip)=0xe2060 negates d*i - f*g)
   *   0x4ca9-0x4cba  adj[4] = a*i - c*g     (xmm2 recycled: mulss %xmm4,%xmm2; xmm3 = c*g;
   *                                          subss %xmm3,%xmm2)
   *   0x4cbf-0x4cc4  adj[5] = c*d - a*f     (xorps 0xdd3c2(%rip)=0xe2060 negation)
   *   0x4cd0        adj[6] = d*h - e*g     (xmm10 = d*h from 0x4a97; xmm6 has been mul'd with
   *                                          xmm9=g via mulss at 0x4ccb; subss %xmm6,%xmm10)
   *   0x4cdc-0x4ce6  adj[7] = b*g - a*h     (xorps 0xdd3c2(%rip)=0xe2060 negation)
   *   0x4cf0-0x4cf5  adj[8] = a*e - b*d     (xmm1 = a*e from 0x4a58; xmm7 has been mul'd with
   *                                          d via mulss %xmm15,%xmm7 at 0x4cf0; subss %xmm7,%xmm1)
   *   0x4cfd-0x4d10  mulps invDet broadcast (shufps $0x0), store %xmm13 → m[0..3],
   *                  %xmm0 (= adj[4..7] * invDet) → m[4..7], %xmm1 → m[8].
   *
   * BAIL BEHAVIOR: on either singularity gate the function returns without writing this->m —
   * this is the caller-visible signal that inversion failed (this remains its pre-call value).
   */
  invert(): void {
    // 0x4a2e-0x4a50 + reloads — pull the nine elements out.
    const a = Math.fround(this.m[0]);   // xmm4
    const b = Math.fround(this.m[1]);   // xmm7  (0x4a78)
    const c = Math.fround(this.m[2]);   // xmm8
    const d = Math.fround(this.m[3]);   // stack[-0x20]
    const e = Math.fround(this.m[4]);   // xmm6
    const f = Math.fround(this.m[5]);   // xmm11 (0x4a7d)
    const g = Math.fround(this.m[6]);   // xmm9
    const h = Math.fround(this.m[7]);   // stack[-0x04]
    const i = Math.fround(this.m[8]);   // xmm2

    // Determinant via classical 3×3 row-0 cofactor formula. Each sub-expression is force-rounded
    // to float32 with Math.fround so the result matches the FCP `addss/mulss/subss` sequence in
    // structure — the FCP asm's SPECIFIC accumulation order (six product terms into a paired
    // signed+magnitude accumulator xmm3/xmm15, combined at 0x4bb0) produces the same numerical
    // value up to float32 rounding for well-conditioned matrices, and both bail on singularity
    // before writing.
    //   det = a(ei - fh) - b(di - fg) + c(dh - eg)
    const ei = Math.fround(e * i);
    const fh = Math.fround(f * h);
    const di = Math.fround(d * i);
    const fg = Math.fround(f * g);
    const dh = Math.fround(d * h);
    const eg = Math.fround(e * g);
    const cofactor0 = Math.fround(ei - fh);         // = adj[0]
    const cofactor1 = Math.fround(di - fg);         // (negated below for adj[1])
    const cofactor2 = Math.fround(dh - eg);         // = adj[6] (see below — transposed)
    const det = Math.fround(
      Math.fround(a * cofactor0)
      - Math.fround(b * cofactor1)
      + Math.fround(c * cofactor2)
    );

    // 0x4bca-0x4bd6 — Gate A: |det| < FLT_EPSILON (2^-23 ≈ 1.19e-7 — the exact double at 0xe2080
    // is 0x3e80000000000000, which as a float32-compared quantity truncates to the same 2^-23).
    const FLT_EPSILON_SINGULAR = Math.fround(1.1920928955078125e-07);   // 0xe2080 as float32
    if (Math.abs(det) < FLT_EPSILON_SINGULAR) {
      // 0x4bd6 — bail: matrix stays as-is.
      return;
    }

    // 0x4c10-0x4c18 — invDet = 1.0f / det   (1.0f from movss 0xdd358(%rip)=0xe1f70=0x3f800000)
    const invDet = Math.fround(1.0 / det);

    // 0x4c1d-0x4cf5 — cofactor / adjugate transpose. The nine formulas verbatim from decode.
    const adj0 = cofactor0;                                                       // e*i - f*h
    const adj1 = Math.fround(Math.fround(c * h) - Math.fround(b * i));            // c*h - b*i
    const adj2 = Math.fround(Math.fround(b * f) - Math.fround(c * e));            // b*f - c*e
    const adj3 = Math.fround(Math.fround(f * g) - Math.fround(d * i));            // f*g - d*i
    const adj4 = Math.fround(Math.fround(a * i) - Math.fround(c * g));            // a*i - c*g
    const adj5 = Math.fround(Math.fround(c * d) - Math.fround(a * f));            // c*d - a*f
    const adj6 = cofactor2;                                                       // d*h - e*g
    const adj7 = Math.fround(Math.fround(b * g) - Math.fround(a * h));            // b*g - a*h
    const adj8 = Math.fround(Math.fround(a * e) - Math.fround(b * d));            // a*e - b*d

    // 0x4cfd-0x4d10 — mulps invDet broadcast, three vector stores.
    this.m[0] = Math.fround(adj0 * invDet);
    this.m[1] = Math.fround(adj1 * invDet);
    this.m[2] = Math.fround(adj2 * invDet);
    this.m[3] = Math.fround(adj3 * invDet);
    this.m[4] = Math.fround(adj4 * invDet);
    this.m[5] = Math.fround(adj5 * invDet);
    this.m[6] = Math.fround(adj6 * invDet);
    this.m[7] = Math.fround(adj7 * invDet);
    this.m[8] = Math.fround(adj8 * invDet);
    // 0x4d15 — retq.
  }
}
