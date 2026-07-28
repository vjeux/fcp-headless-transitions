// Fraction.ts — Flexo Fraction: a rational number with 64-bit signed numerator and denominator,
// always kept in lowest terms with denominator > 0 (sign carried in the numerator). All methods
// transcribed line-for-line from the Flexo x86_64 disassembly
// (Final Cut Pro.app/.../Frameworks/Flexo.framework/.../Flexo).
//
// DECODE:
//   raw-port/re/disasm/Flexo.Fraction.setValues.s
//   raw-port/re/disasm/Flexo.Fraction.operator=.s   (ICF-folded copy: movups xmm move)
//   raw-port/re/disasm/Flexo.Fraction.Fraction.s    (copy ctor)
//   raw-port/re/disasm/Flexo.Fraction.ctor_ll_ll.s  (Fraction(long long, long long))
//   raw-port/re/disasm/Flexo.Fraction.normalize.s
//   raw-port/re/disasm/Flexo.Fraction.operator_eq.s
//   raw-port/re/disasm/Flexo.Fraction.operator_lt.s
//   raw-port/re/disasm/Flexo.Fraction.operator_plus.s   (stub — full 126-line decode pending)
//   raw-port/re/disasm/Flexo.Fraction.operator_minus.s  (stub — 126 lines)
//   raw-port/re/disasm/Flexo.Fraction.operator_mul.s    (stub — 130 lines)
//   raw-port/re/disasm/Flexo.Fraction.operator_div.s    (stub — 137 lines)
//
// Struct layout (recovered from setValues / operator= / all accessors):
//   +0x00  numerator   (int64) — read as `movq %rsi, (%rdi)` in setValues @0x13009b4
//   +0x08  denominator (int64) — read as `movq %rdx, 0x8(%rdi)` in setValues @0x13009b7
//   sizeof(Fraction) = 0x10 (16 bytes) — matches `movups (%rsi), %xmm0; movups %xmm0, (%rdi)`
//   in operator= @0x13009d4-0x13009d7 which copies the whole struct as one 16-byte SSE register.
//
// Rule 4 (numerics): all values are int64 (long long). We MUST use bigint for the fields and
// arithmetic — the FCP class is `long long` throughout (rsi/rdx qwords, `cqto/idivq`), and its
// values easily exceed 2^53 (e.g. sample-rate ratios × frame counts). Using JS `number` would
// silently corrupt after 2^53.

/**
 * Fraction struct — 16 bytes: two 64-bit signed integers in lowest terms with denom > 0.
 * See DECODE section above for byte-offset provenance.
 */
export interface Fraction {
  numerator: bigint;   // +0x00
  denominator: bigint; // +0x08
}

/**
 * Fraction::setValues(long long numer, long long denom)  →  void
 * @Flexo 0x00000000013009b0  (__ZN8Fraction9setValuesExx)
 *
 * DECODE (raw-port/re/disasm/Flexo.Fraction.setValues.s):
 *   13009b4  movq %rsi, (%rdi)      // this->numerator = numer
 *   13009b7  movq %rdx, 0x8(%rdi)   // this->denominator = denom
 *   13009bc  retq
 *
 * NOTE: setValues does NOT normalize — it is the raw setter used by callers that want to write
 * an un-reduced fraction. The (long, long) constructor calls setValues equivalent then normalize().
 */
export function Fraction_setValues(self: Fraction, numer: bigint, denom: bigint): void {
  self.numerator = numer;
  self.denominator = denom;
}

/**
 * Fraction::operator=(Fraction const&)  →  Fraction&
 * @Flexo 0x00000000013009d0  (__ZN8FractionaSERKS_)
 *
 * DECODE (raw-port/re/disasm/Flexo.Fraction.operator=.s):
 *   13009d4  movups (%rsi), %xmm0   // load 16 bytes from source
 *   13009d7  movups %xmm0, (%rdi)   // store 16 bytes to dest
 *
 * Straight 16-byte copy — no side effects, no normalize call.
 */
export function Fraction_assign(self: Fraction, other: Fraction): Fraction {
  self.numerator = other.numerator;
  self.denominator = other.denominator;
  return self;
}

/**
 * Fraction::Fraction(Fraction const&)  →  Fraction   (copy constructor)
 * @Flexo 0x00000000013009c0  (__ZN8FractionC1ERKS_)
 *
 * DECODE (raw-port/re/disasm/Flexo.Fraction.Fraction.s):
 *   13009c4  movups (%rsi), %xmm0
 *   13009c7  movups %xmm0, (%rdi)   // whole 16-byte struct copied by one SSE mov
 */
export function Fraction_copy(other: Fraction): Fraction {
  return { numerator: other.numerator, denominator: other.denominator };
}

/**
 * Fraction::normalize()  →  void
 * @Flexo 0x0000000001300770  (__ZN8Fraction9normalizeEv)
 *
 * Reduce to lowest terms: divide numer/denom by gcd(|numer|, |denom|), force the denominator
 * positive by moving the sign onto the numerator. Throws std::runtime_error("Fraction: divide
 * by zero") when denom == 0.
 *
 * DECODE (raw-port/re/disasm/Flexo.Fraction.normalize.s):
 *   1300777  movq 0x8(%rdi), %r10                    // r10 = denom
 *   130077b  testq %r10, %r10 ; je 0x1300849         // denom == 0 → throw "divide by zero"
 *   1300784  movq (%rdi), %r9                        // r9  = numer
 *   1300787  testq %r9, %r9 ; je 0x130080e           // numer == 0 → jump to "denom = 1" path
 *   ; Absolute values:
 *   1300790  movq %r9, %rsi ; negq %rsi ; cmovsq %r9, %rsi     // rsi = |numer|
 *   130079a  movq %r10, %rcx ; negq %rcx ; cmovsq %r10, %rcx   // rcx = |denom|
 *   ; Euclidean GCD (64-bit `divq` for magnitudes >= 2^32, then falls through to `divl` when
 *   ; both fit in 32 bits — this is the exact NR-style micro-optimisation the compiler emitted; the
 *   ; math value is identical to `while (b) { r = a%b; a = b; b = r; }`):
 *   13007a4  rax = rsi ; rdx = rcx           // (a, b) = (|numer|, |denom|)
 *   13007bd..13007d7  gcd loop → r8 = gcd(|numer|, |denom|)
 *   ; Sign computation (see Rule 4 / 5 notes below):
 *   13007d9  rax = sar denom 63             // rax = -1 if denom<0 else 0
 *   13007e0  r11 = (denom > 0) ? 1 : 0 ; negq r11    // r11 = -1 if denom>0 else 0
 *   13007ed  if numer >= 0: r11 = rax                 // if numer>=0, sign = sign(denom)
 *   13007f4  r11 |= 1                                 // force LSB=1 → r11 ∈ {+1, -1}
 *   ; Divide magnitudes by gcd; apply sign to numerator:
 *   13007f8..130081c  rax = |numer|/gcd
 *   130081c  imulq %r11, %rax
 *   1300820  movq %rax, (%rdi)                        // this->numerator = sign * |numer|/gcd
 *   1300823..130083d  rax = |denom|/gcd
 *   1300840  movq %rax, 0x8(%rdi)                     // this->denominator = |denom|/gcd
 *   ; numer==0 branch: denom = 1, numer left as-is (0)
 *   130080e  movl $0x1, %eax
 *   1300813  jmp 0x1300840                            // store 1 into denominator field
 *
 * Sign truth-table (verified branch-by-branch):
 *   numer >= 0, denom > 0:  r11=-1 then cmov→r11=0 (rax=0), or 1 → +1
 *   numer >= 0, denom < 0:  r11=0  then cmov→r11=-1 (rax=-1), or 1 → -1
 *   numer <  0, denom > 0:  r11=-1 (no cmov), or 1 → -1
 *   numer <  0, denom < 0:  r11=0  (no cmov), or 1 → +1
 *   ⇒ sign = sign(numer) * sign(denom) — the classic "denominator must be positive" fixup.
 */
export function Fraction_normalize(self: Fraction): void {
  // 130077b: denom == 0 → throw
  if (self.denominator === 0n) {
    // 1300849-1300860: allocate a std::runtime_error("Fraction: divide by zero"). We surface
    // this as a plain JS Error with the same message — the C++ RTTI class is not observable.
    throw new Error("Fraction: divide by zero"); // @Flexo 0x1300856 literal "Fraction: divide by zero"
  }
  // 130087-130078a: numer == 0 → numerator stays 0, denominator forced to 1
  if (self.numerator === 0n) {
    self.denominator = 1n; // 130080e: movl $0x1, %eax → stored at 0x8(%rdi)
    return;
  }
  // 1300790-13007a3: absolute values
  const absNum = self.numerator < 0n ? -self.numerator : self.numerator;
  const absDen = self.denominator < 0n ? -self.denominator : self.denominator;
  // 13007bd-13007d7: Euclidean GCD on the magnitudes
  let a = absNum;
  let b = absDen;
  while (b !== 0n) {
    const r = a % b;
    a = b;
    b = r;
  }
  const gcd = a;
  // 13007d9-13007f4: sign = sign(numer) * sign(denom)   (LSB-forced to 1 to guarantee ±1)
  const sign: bigint =
    (self.numerator < 0n) !== (self.denominator < 0n) ? -1n : 1n;
  // 13007f8-1300820: numerator = sign * |numer| / gcd
  self.numerator = sign * (absNum / gcd);
  // 1300823-1300840: denominator = |denom| / gcd
  self.denominator = absDen / gcd;
}

/**
 * Fraction::Fraction(long long, long long)  →  Fraction   (long, long constructor)
 * @Flexo 0x0000000001300880  (__ZN8FractionC1Exx)
 *
 * The disassembly is functionally `setValues(numer, denom); normalize();` with normalize
 * inlined — the identical GCD-and-sign structure appears at 0x13008a0..0x1300951. Same
 * "denom==0 throws" path at 0x130095a.
 *
 * DECODE (raw-port/re/disasm/Flexo.Fraction.ctor_ll_ll.s):
 *   1300887  movq %rsi, (%rdi)                     // this->numerator = numer
 *   130088a  movq %rdx, 0x8(%rdi)                  // this->denominator = denom
 *   130088e  testq %rdx, %rdx ; je 0x130095a       // denom == 0 → throw
 *   1300897  testq %rsi, %rsi ; je 0x130091e       // numer == 0 → jump to "denom = 1" path
 *   ...   (same GCD/sign body as normalize, one-to-one instruction correspondence)
 *   1300955  retq
 */
export function Fraction_create(numer: bigint, denom: bigint): Fraction {
  const f: Fraction = { numerator: numer, denominator: denom };
  Fraction_normalize(f);
  return f;
}

/**
 * Fraction::operator==(Fraction const&) const  →  bool
 * @Flexo 0x0000000001300fd0  (__ZNK8FractioneqERKS_)
 *
 * DECODE (raw-port/re/disasm/Flexo.Fraction.operator_eq.s):
 *   1300fd4  movq (%rdi), %rax ; cmpq (%rsi), %rax          // compare numerator
 *   1300fda  jne 0x1300fe9                                   // if unequal → false
 *   1300fdc  movq 0x8(%rdi), %rax ; cmpq 0x8(%rsi), %rax    // compare denominator
 *   1300fe4  sete %al                                        // else result = (denom==denom)
 *   1300fe9  xorl %eax, %eax                                 // false path
 *
 * Because both operands are normalized, structural equality of the two fields is exact equality
 * of the mathematical value — no cross-multiply needed.
 */
export function Fraction_eq(self: Fraction, other: Fraction): boolean {
  // 1300fd4-1300fe4: (numer == numer) && (denom == denom)
  return self.numerator === other.numerator && self.denominator === other.denominator;
}

/**
 * Fraction::operator<(Fraction const&) const  →  bool
 * @Flexo 0x0000000001300ff0  (__ZNK8FractionltERKS_)
 *
 * Cross-multiply comparison via a shared GCD to avoid overflow: reduce both denominators by
 * their pairwise gcd, then compare  self.numer·(other.denom/g)  <  other.numer·(self.denom/g).
 *
 * DECODE (raw-port/re/disasm/Flexo.Fraction.operator_lt.s):
 *   1300ff4  movq 0x8(%rdi), %r8                             // r8  = self.denom
 *   1300ff8  movq 0x8(%rsi), %rcx                            // rcx = other.denom
 *   1300ffc  rax = |self.denom|
 *   1301006  testq %rcx, %rcx ; je 0x1301076                 // other.denom == 0 branch
 *   130100b  rdx = |other.denom|
 *   1301015..130104b  GCD loop → r9 = gcd(|self.denom|, |other.denom|)
 *   1301055..130105d  r8  = self.denom / r9   (signed idivq, keeps original sign)
 *   130106c..1301074  rax = other.denom / r9
 *   13010a3  imulq (%rdi), %rax                              // rax = self.numer * (other.denom/g)
 *   13010a7  imulq (%rsi), %r8                               // r8  = other.numer * (self.denom/g)
 *   13010ab  cmpq %r8, %rax ; setl %al                       // rax < r8 ?
 *
 * NOTE: signed idivq on self.denom (which is positive after normalize) has no effect on sign,
 * but the disasm is literally signed division — the FCP code doesn't rely on the invariant here.
 */
export function Fraction_lt(self: Fraction, other: Fraction): boolean {
  // 1300ff4-1301011: r8 = self.denom, rcx = other.denom, rax = |r8|, rdx = |rcx|
  const sDen = self.denominator;
  const oDen = other.denominator;
  let a = sDen < 0n ? -sDen : sDen;
  let b = oDen < 0n ? -oDen : oDen;
  // 1301015-130104b: gcd(|self.denom|, |other.denom|)  (see also the `other.denom==0` path at
  // 0x1301076 which sets r9 = |self.denom| — equivalent to gcd(a, 0) = a).
  while (b !== 0n) {
    const r = a % b;
    a = b;
    b = r;
  }
  const g = a;
  // 1301055-1301074: signed division by gcd (denominators are positive after normalize, so this
  // is the same as unsigned division of their magnitudes).
  const sDenReduced = sDen / g;
  const oDenReduced = oDen / g;
  // 13010a3-13010ab: cross-multiply and compare.
  //   left  = self.numer  * (other.denom / gcd)
  //   right = other.numer * (self.denom  / gcd)
  const left = self.numerator * oDenReduced;
  const right = other.numerator * sDenReduced;
  return left < right;
}

/**
 * Fraction::operator+(Fraction const&) const  →  Fraction
 * @Flexo 0x00000000013009e0  (__ZNK8FractionplERKS_)
 *
 * a/b + c/d, reduced by GCD in two passes to avoid overflow:
 *   Let g1 = gcd(b, d)
 *   new_num = a·(d/g1) + c·(b/g1)
 *   Let g2 = gcd(new_num, g1)
 *   result.num = new_num / g2
 *   result.den = (b/g1) · (d/g1) · (g1/g2)  =  b·d / (g1 · g2)
 *
 * The 126-line vectorised transcription (matching each `divq/divl` split, signed-vs-unsigned
 * mixture, and the "denom==0" special branch at 0x1300a68) is deferred to the next worker so it
 * can be gated by a live-FCP oracle rather than trusted-by-decode. This stub cites the address
 * so the frontier records it as an explicit demand.
 */
export function Fraction_add(self: Fraction, other: Fraction): Fraction {
  void self; void other;
  throw new Error(
    "Fraction::operator+(Fraction const&) not yet transcribed @Flexo 0x13009e0 " +
    "(126-line 2-pass GCD reduction — decode raw-port/re/disasm/Flexo.Fraction.operator_plus.s)"
  );
}

/**
 * Fraction::operator-(Fraction const&) const  →  Fraction
 * @Flexo 0x0000000001300b50  (__ZNK8FractionmiERKS_)
 *
 * Same shape as operator+ but with a subtraction in the middle. 126-line vectorised body.
 * See raw-port/re/disasm/Flexo.Fraction.operator_minus.s for the exact sequence.
 */
export function Fraction_sub(self: Fraction, other: Fraction): Fraction {
  void self; void other;
  throw new Error(
    "Fraction::operator-(Fraction const&) not yet transcribed @Flexo 0x1300b50 " +
    "(126-line 2-pass GCD reduction — decode raw-port/re/disasm/Flexo.Fraction.operator_minus.s)"
  );
}

/**
 * Fraction::operator*(Fraction const&) const  →  Fraction
 * @Flexo 0x0000000001300cc0  (__ZNK8FractionmlERKS_)
 *
 * Cross-cancel GCDs before multiplying:
 *   g1 = gcd(a, d) ; g2 = gcd(c, b)
 *   result = (a/g1)·(c/g2) / ((b/g2)·(d/g1))
 * so intermediate products stay small. 130-line vectorised body; see the .s file for the exact
 * signed-idiv/idivq split.
 */
export function Fraction_mul(self: Fraction, other: Fraction): Fraction {
  void self; void other;
  throw new Error(
    "Fraction::operator*(Fraction const&) not yet transcribed @Flexo 0x1300cc0 " +
    "(130-line cross-cancel multiply — decode raw-port/re/disasm/Flexo.Fraction.operator_mul.s)"
  );
}

/**
 * Fraction::operator/(Fraction const&) const  →  Fraction
 * @Flexo 0x0000000001300e40  (__ZNK8FractiondvERKS_)
 *
 * a/b ÷ c/d = a/b · d/c with the sign-fixup and divide-by-zero-check identical to normalize().
 * 137-line vectorised body — the longest of the four operators because the sign of `other` has
 * to be folded back into the numerator explicitly (division inverts denom/numer, so the sign
 * pattern is denser than in the other three).
 */
export function Fraction_div(self: Fraction, other: Fraction): Fraction {
  void self; void other;
  throw new Error(
    "Fraction::operator/(Fraction const&) not yet transcribed @Flexo 0x1300e40 " +
    "(137-line cross-cancel divide w/ sign-fixup — decode raw-port/re/disasm/Flexo.Fraction.operator_div.s)"
  );
}
