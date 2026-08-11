// PCWorkingColorVector — ProCore 4-float RGBA colour value (SIMD-packed).
//
// A tiny 16-byte class holding four IEEE-754 single-precision floats
// contiguous at offsets +0x00..+0x0c (r,g,b,a). Every operator uses
// packed-single SSE (`addps`/`mulps`/`movups`) confirming a flat float[4]
// layout with NO trailing colour-space handle (contrast: PCWorkingColor,
// which extends the layout with a CGColorSpace* at +0x10 — the copy ctor
// only reads the low 16 bytes so a PCWorkingColor SLICES into a Vector).
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProCore.framework/Versions/A/ProCore (x86_64 sub-slice). Framework: ProCore.
// Source disassembly: raw-port/re/disasm/ProCore.PCWorkingColorVector.*.s
// and the flat symbol dump in /tmp/ProCore_tV.txt.
//
// STRUCT LAYOUT — recovered from every ctor + accessor (all four operate on
// exactly 16 bytes with `movups`/`movss %xmm,4*i(%rdi)`, i=0..3):
//   +0x00  r  float32   (also treated as `components[0]`)
//   +0x04  g  float32
//   +0x08  b  float32
//   +0x0c  a  float32
//   sizeof(PCWorkingColorVector) = 0x10
//
// The 4-float ctor @0x7adf0 stores xmm0..xmm3 with `movss` to +0,+4,+8,+c;
// the default ctor @0x7add8 zeros the whole 16-byte quantity with a single
// `movups %xmm0, (%rdi)` after `xorps %xmm0, %xmm0`; the copy-from-
// PCWorkingColor ctors @0x7ae24 / @0x7ae30 blit the source's low 16 bytes
// with `movups (%rsi), %xmm0; movups %xmm0, (%rdi)` — this is a
// deliberate SLICE that drops PCWorkingColor's +0x10 colour-space handle.
//
// SIMD numerics (Rule 4): all arithmetic runs at IEEE-754 single-precision
// via packed-single or scalar-single instructions — every store crosses
// the API boundary and we wrap every write with `Math.fround` to force
// the JS number back onto the same float32 grid.
//
//   operator+=(const&)  addps  (all 4 lanes summed)                 @0x7ae4c
//   operator*=(const&)  mulps  (all 4 lanes multiplied)             @0x7ae62
//   operator*=(float)   mulps low-2 lanes then mulss lane 2         @0x7ae78
//                       — the alpha lane +0x0c is NEVER TOUCHED
//                         (scalar scale applies to r,g,b only).
//
// SYMBOL BASENAMES (see /tmp/ProCore_symmap.tsv):
//   __ZN20PCWorkingColorVectorC2Ev              default ctor (base)    @0x7add8
//   __ZN20PCWorkingColorVectorC1Ev              default ctor (complete)@0x7ade4
//   __ZN20PCWorkingColorVectorC2Effff           (f,f,f,f) ctor (base)  @0x7adf0
//   __ZN20PCWorkingColorVectorC1Effff           (f,f,f,f) ctor (compl) @0x7ae0a
//   __ZN20PCWorkingColorVectorC2ERK14PCWorkingColor   (const&) base    @0x7ae24
//   __ZN20PCWorkingColorVectorC1ERK14PCWorkingColor   (const&) compl   @0x7ae30
//   __ZN20PCWorkingColorVectoraSERK14PCWorkingColor   operator=(PCW&)  @0x7ae3c
//   __ZN20PCWorkingColorVectorpLERKS_                 operator+=       @0x7ae4c
//   __ZN20PCWorkingColorVectormLERKS_                 operator*=(vec)  @0x7ae62
//   __ZN20PCWorkingColorVectormLEf                    operator*=(f)    @0x7ae78
//   __ZN20PCWorkingColorVector6setRGBEfff             setRGB           @0x7ae9a
//   __ZNK20PCWorkingColorVector6getRGBEPfS0_S0_       getRGB (const)   @0x7aeae
//   __ZN20PCWorkingColorVector7setRGBAEffff           setRGBA          @0x7aece
//   __ZNK20PCWorkingColorVector7getRGBAEPfS0_S0_S0_   getRGBA (const)  @0x7aee8
//   __ZplRK20PCWorkingColorVectorS1_                  operator+ (free) @0x7af88
//
// C1/C2 (complete-object / base-object) pairs are ICF-identical in every
// case here — the class has no non-trivial base to skip so the two
// variants execute the exact same instructions. We expose only one TS
// entry point per semantic ctor and cite BOTH addresses.

/** PCWorkingColorVector — flat 4×float32 RGBA colour, packed to 16 bytes.
 *  Storage matches the on-disk layout (r,g,b,a at +0/4/8/c). All fields
 *  are held as JS numbers pre-frounded to float32.  */
export class PCWorkingColorVector {
  /** r component at C++ +0x00. */
  public r: number;
  /** g component at C++ +0x04. */
  public g: number;
  /** b component at C++ +0x08. */
  public b: number;
  /** a component at C++ +0x0c. */
  public a: number;

  private constructor(r: number, g: number, b: number, a: number) {
    // Every write is float32-quantised — see `movss` stores in every ctor.
    this.r = Math.fround(r);
    this.g = Math.fround(g);
    this.b = Math.fround(b);
    this.a = Math.fround(a);
  }

  // ==========================================================================
  // Ctors — one exported factory per FCP overload.
  // ==========================================================================

  /**
   * PCWorkingColorVector()  @ProCore 0x7add8 (C2) / 0x7ade4 (C1).
   *
   * DISASM (identical for C1/C2 — ICF-folded pair):
   *   0x7ade4  pushq  %rbp
   *   0x7ade5  movq   %rsp, %rbp
   *   0x7ade8  xorps  %xmm0, %xmm0
   *   0x7adeb  movups %xmm0, (%rdi)      ; store 16 zero bytes at this[+0]
   *   0x7adee  popq   %rbp
   *   0x7adef  retq
   *
   * A single `movups` of an XOR-zeroed xmm register writes 16 bytes of
   * 0.0f — mirroring exactly on the JS side.  */
  public static default_ctor(): PCWorkingColorVector {
    // @0x7ade8-@0x7adeb — zero r,g,b,a as float32.
    return new PCWorkingColorVector(0, 0, 0, 0);
  }

  /**
   * PCWorkingColorVector(float r, float g, float b, float a)
   *   @ProCore 0x7adf0 (C2) / 0x7ae0a (C1).
   *
   * DISASM (C1 @0x7ae0a — identical to C2):
   *   0x7ae0a  pushq  %rbp
   *   0x7ae0e  movss  %xmm0, (%rdi)       ; this->r  = arg0
   *   0x7ae12  movss  %xmm1, 0x4(%rdi)    ; this->g  = arg1
   *   0x7ae17  movss  %xmm2, 0x8(%rdi)    ; this->b  = arg2
   *   0x7ae1c  movss  %xmm3, 0xc(%rdi)    ; this->a  = arg3
   *   0x7ae21  popq   %rbp
   *   0x7ae22  retq
   *
   * `movss` stores are scalar-single writes (32-bit) — arguments arrive
   * as float32 and the store is a bit-copy, so a `Math.fround` on each
   * arg reproduces the exact numeric outcome.  */
  public static from_rgba(r: number, g: number, b: number, a: number): PCWorkingColorVector {
    // @0x7ae0e/12/17/1c — four scalar-single stores.
    return new PCWorkingColorVector(r, g, b, a);
  }

  /**
   * PCWorkingColorVector(PCWorkingColor const& other)
   *   @ProCore 0x7ae24 (C2) / 0x7ae30 (C1).
   *
   * DISASM (C1 @0x7ae30 — identical to C2):
   *   0x7ae30  pushq  %rbp
   *   0x7ae34  movups (%rsi), %xmm0       ; load 16 bytes = other's r,g,b,a
   *   0x7ae37  movups %xmm0, (%rdi)       ; blit into this[+0]
   *   0x7ae3a  popq   %rbp
   *   0x7ae3b  retq
   *
   * This is an EXPLICIT SLICING copy: PCWorkingColor's layout extends
   * to +0x18 (with a CGColorSpace* handle at +0x10 — see
   * ./PCWorkingColor.ts), but only its first 16 bytes are read. The
   * colour-space handle is intentionally DROPPED. */
  public static from_PCWorkingColor(other: {
    r: number; g: number; b: number; a: number;
  }): PCWorkingColorVector {
    // @0x7ae34 — read source's 16-byte float4 payload only (slice).
    return new PCWorkingColorVector(other.r, other.g, other.b, other.a);
  }

  // ==========================================================================
  // Assignment / arithmetic operators.
  // ==========================================================================

  /**
   * operator=(PCWorkingColor const&)  @ProCore 0x7ae3c.
   *
   * DISASM:
   *   0x7ae3c  pushq  %rbp
   *   0x7ae40  movq   %rdi, %rax                 ; return value = &*this
   *   0x7ae43  movups (%rsi), %xmm0              ; load 16 bytes from other
   *   0x7ae46  movups %xmm0, (%rdi)              ; blit into this[+0]
   *   0x7ae49  popq   %rbp
   *   0x7ae4a  retq
   *
   * Same slicing semantics as the copy ctor above: colour-space handle
   * at other[+0x10] is not read.  */
  public assign_from_PCWorkingColor(other: {
    r: number; g: number; b: number; a: number;
  }): this {
    // @0x7ae43-@0x7ae46 — blit 16 bytes.
    this.r = Math.fround(other.r);
    this.g = Math.fround(other.g);
    this.b = Math.fround(other.b);
    this.a = Math.fround(other.a);
    return this;
  }

  /**
   * operator+=(PCWorkingColorVector const&)  @ProCore 0x7ae4c.
   *
   * DISASM:
   *   0x7ae4c  pushq  %rbp
   *   0x7ae50  movq   %rdi, %rax                 ; return &*this
   *   0x7ae53  movups (%rdi), %xmm0              ; xmm0 = this  (r,g,b,a)
   *   0x7ae56  movups (%rsi), %xmm1              ; xmm1 = other (r,g,b,a)
   *   0x7ae59  addps  %xmm0, %xmm1               ; xmm1 = xmm0 + xmm1 (4-lane)
   *   0x7ae5c  movups %xmm1, (%rdi)              ; this  = xmm1
   *   0x7ae5f  popq   %rbp
   *   0x7ae60  retq
   *
   * `addps` — 4-wide packed single-precision add: each component is
   * summed as float32. Alpha included. */
  public plusEq(other: PCWorkingColorVector): this {
    // @0x7ae59 — packed-single add, all four lanes.
    this.r = Math.fround(this.r + other.r);
    this.g = Math.fround(this.g + other.g);
    this.b = Math.fround(this.b + other.b);
    this.a = Math.fround(this.a + other.a);
    return this;
  }

  /**
   * operator*=(PCWorkingColorVector const&)  @ProCore 0x7ae62.
   *
   * DISASM:
   *   0x7ae62  pushq  %rbp
   *   0x7ae66  movq   %rdi, %rax                 ; return &*this
   *   0x7ae69  movups (%rdi), %xmm0
   *   0x7ae6c  movups (%rsi), %xmm1
   *   0x7ae6f  mulps  %xmm0, %xmm1               ; xmm1 = xmm0 * xmm1 (4-lane)
   *   0x7ae72  movups %xmm1, (%rdi)
   *   0x7ae75  popq   %rbp
   *   0x7ae76  retq
   *
   * `mulps` — 4-wide packed single-precision multiply. Component-wise
   * (including alpha).  */
  public timesEqVec(other: PCWorkingColorVector): this {
    // @0x7ae6f — packed-single multiply, all four lanes.
    this.r = Math.fround(this.r * other.r);
    this.g = Math.fround(this.g * other.g);
    this.b = Math.fround(this.b * other.b);
    this.a = Math.fround(this.a * other.a);
    return this;
  }

  /**
   * operator*=(float scale)  @ProCore 0x7ae78.
   *
   * DISASM:
   *   0x7ae78  pushq   %rbp
   *   0x7ae7c  movq    %rdi, %rax                ; return &*this
   *   0x7ae7f  movsd   (%rdi), %xmm1             ; xmm1[low 8B] = r,g (as packed)
   *   0x7ae83  movsldup %xmm0, %xmm2             ; xmm2 lanes = [xmm0[0],xmm0[0],xmm0[2],xmm0[2]]
   *                                              ; low two lanes both hold `scale`.
   *   0x7ae87  mulps   %xmm1, %xmm2              ; xmm2 = (r*scale, g*scale, ., .)
   *   0x7ae8a  movlps  %xmm2, (%rdi)             ; store 8 bytes = new r,g
   *   0x7ae8d  mulss   0x8(%rdi), %xmm0          ; xmm0 = b * scale
   *   0x7ae92  movss   %xmm0, 0x8(%rdi)          ; this->b = xmm0
   *   0x7ae97  popq    %rbp
   *   0x7ae98  retq
   *
   * IMPORTANT: alpha (`+0x0c`) is NOT touched — the scalar-scale
   * variant applies to r,g,b ONLY. This is a deliberate asymmetry from
   * the vector-multiplication variant above, and matches typical colour
   * arithmetic where "scale the colour" excludes opacity. */
  public timesEqScalar(scale: number): this {
    // Scale is a `float` argument (passed in xmm0 as single).
    const s = Math.fround(scale);
    // @0x7ae87 — packed multiply of (r,g)*(s,s).
    this.r = Math.fround(this.r * s);
    this.g = Math.fround(this.g * s);
    // @0x7ae8d — scalar multiply of b*s. NOTE: alpha is untouched.
    this.b = Math.fround(this.b * s);
    return this;
  }

  // ==========================================================================
  // RGB / RGBA setter+getter pairs.
  // ==========================================================================

  /**
   * setRGB(float r, float g, float b)  @ProCore 0x7ae9a.
   *
   * DISASM:
   *   0x7ae9a  pushq  %rbp
   *   0x7ae9e  movss  %xmm0, (%rdi)              ; this->r = r
   *   0x7aea2  movss  %xmm1, 0x4(%rdi)           ; this->g = g
   *   0x7aea7  movss  %xmm2, 0x8(%rdi)           ; this->b = b
   *   0x7aeac  popq   %rbp
   *   0x7aead  retq
   *
   * Only 3 stores. Alpha (`+0x0c`) is left unchanged. */
  public setRGB(r: number, g: number, b: number): void {
    // @0x7ae9e/a2/a7 — three scalar-single stores; alpha untouched.
    this.r = Math.fround(r);
    this.g = Math.fround(g);
    this.b = Math.fround(b);
  }

  /**
   * getRGB(float* r, float* g, float* b) const  @ProCore 0x7aeae.
   *
   * DISASM:
   *   0x7aeae  pushq  %rbp
   *   0x7aeb2  movss  (%rdi),   %xmm0
   *   0x7aeb6  movss  %xmm0,    (%rsi)           ; *rp = this->r
   *   0x7aeba  movss  0x4(%rdi), %xmm0
   *   0x7aebf  movss  %xmm0,    (%rdx)           ; *gp = this->g
   *   0x7aec3  movss  0x8(%rdi), %xmm0
   *   0x7aec8  movss  %xmm0,    (%rcx)           ; *bp = this->b
   *   0x7aecc  popq   %rbp
   *   0x7aecd  retq
   *
   * The C++ signature writes through three float* out-params; JS returns
   * a fresh tuple with the three float32 values in r,g,b order.  */
  public getRGB(): { r: number; g: number; b: number } {
    // @0x7aeb2/ba/c3 — three single-precision reads.
    return {
      r: Math.fround(this.r),
      g: Math.fround(this.g),
      b: Math.fround(this.b),
    };
  }

  /**
   * setRGBA(float r, float g, float b, float a)  @ProCore 0x7aece.
   *
   * DISASM:
   *   0x7aece  pushq  %rbp
   *   0x7aed2  movss  %xmm0, (%rdi)              ; this->r = r
   *   0x7aed6  movss  %xmm1, 0x4(%rdi)           ; this->g = g
   *   0x7aedb  movss  %xmm2, 0x8(%rdi)           ; this->b = b
   *   0x7aee0  movss  %xmm3, 0xc(%rdi)           ; this->a = a
   *   0x7aee5  popq   %rbp
   *   0x7aee6  retq
   *
   * All four channels stored (contrast setRGB above which leaves alpha).*/
  public setRGBA(r: number, g: number, b: number, a: number): void {
    // @0x7aed2/6/b/0 — four scalar-single stores.
    this.r = Math.fround(r);
    this.g = Math.fround(g);
    this.b = Math.fround(b);
    this.a = Math.fround(a);
  }

  /**
   * getRGBA(float* r, float* g, float* b, float* a) const  @ProCore 0x7aee8.
   *
   * DISASM:
   *   0x7aee8  pushq  %rbp
   *   0x7aeec  movss  (%rdi),    %xmm0
   *   0x7aef0  movss  %xmm0,     (%rsi)          ; *rp = this->r
   *   0x7aef4  movss  0x4(%rdi), %xmm0
   *   0x7aef9  movss  %xmm0,     (%rdx)          ; *gp = this->g
   *   0x7aefd  movss  0x8(%rdi), %xmm0
   *   0x7af02  movss  %xmm0,     (%rcx)          ; *bp = this->b
   *   0x7af06  movss  0xc(%rdi), %xmm0
   *   0x7af0b  movss  %xmm0,     (%r8)           ; *ap = this->a
   *   0x7af10  popq   %rbp
   *   0x7af11  retq  */
  public getRGBA(): { r: number; g: number; b: number; a: number } {
    // @0x7aeec/f4/fd/06 — four single-precision reads.
    return {
      r: Math.fround(this.r),
      g: Math.fround(this.g),
      b: Math.fround(this.b),
      a: Math.fround(this.a),
    };
  }
}

/**
 * `operator+(PCWorkingColorVector const& lhs, PCWorkingColorVector const& rhs)`
 * — @ProCore 0x7af88 (`__ZplRK20PCWorkingColorVectorS1_`).
 *
 * The free binary `+` for the colour vector — distinct from the member
 * `operator+=` @0x7ae50, which mutates `*this` and returns a reference. This
 * one reads both operands and returns a NEW value.
 *
 * Full transcription — every instruction, in order
 * (raw-port/re/disasm/ProCore.__ZplRK20PCWorkingColorVectorS1_.s):
 *
 *   0x7af88  pushq    %rbp              ; frame setup (no TS counterpart)
 *   0x7af89  movq     %rsp, %rbp        ; frame setup (no TS counterpart)
 *   0x7af8c  movups   (%rdi), %xmm1     ; xmm1 = lhs (r,g,b,a) — 16 bytes
 *   0x7af8f  movups   (%rsi), %xmm0     ; xmm0 = rhs (r,g,b,a) — 16 bytes
 *   0x7af92  addps    %xmm1, %xmm0      ; xmm0 = rhs + lhs, FOUR float32 lanes
 *   0x7af95  movaps   %xmm0, %xmm1
 *   0x7af98  unpckhpd %xmm0, %xmm1      ; xmm1 = the HIGH eightbyte (b,a)
 *   0x7af9c  popq     %rbp              ; frame teardown (no TS counterpart)
 *   0x7af9d  retq                       ; return in xmm0:xmm1
 *
 * The trailing `movaps`/`unpckhpd` pair is not arithmetic — it is the SysV
 * return-value packing: a 16-byte all-float struct is class SSE, so it comes
 * back in TWO registers, `%xmm0` carrying (r,g) and `%xmm1` carrying (b,a).
 * The port returns one object instead, which is the same four values.
 *
 * `addps` is a PACKED SINGLE-precision add, so each lane is a float32 add;
 * the class's ctor already `Math.fround`s every component, which reproduces
 * that per-lane rounding (Rule 4). Nothing is clamped, saturated or
 * normalised — an out-of-gamut sum stays out of gamut, exactly as here.
 *
 * ZERO callees, zero externs, no indirect/virtual dispatch — pure SIMD
 * arithmetic on the two 16-byte operands.
 *
 * @param lhs the left operand (`%rdi`).
 * @param rhs the right operand (`%rsi`).
 * @returns a new vector holding the per-lane sum.
 */
export function PCWorkingColorVector_operator_add(
  lhs: PCWorkingColorVector,
  rhs: PCWorkingColorVector,
): PCWorkingColorVector {
  // @0x7af8c/@0x7af8f/@0x7af92 — movups both operands, then one 4-lane addps.
  return PCWorkingColorVector.from_rgba(
    lhs.r + rhs.r,
    lhs.g + rhs.g,
    lhs.b + rhs.b,
    lhs.a + rhs.a,
  );
  // @0x7af95/@0x7af98 — the unpckhpd is the two-register SysV return packing.
}
