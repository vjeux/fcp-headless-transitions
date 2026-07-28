// Ozone.framework — OZSnap
//
// A comparable 4-field snap descriptor. Transcribed byte-for-byte from
// Ozone x86_64 disasm. Layout (16 bytes total, from ctors + operator<):
//   +0x00: int32   id      (lexicographic primary key)
//   +0x04: float32 a       (secondary; ctor arg1 is double, narrowed via cvtpd2ps)
//   +0x08: float32 b       (tertiary;  ctor arg2 is double, narrowed via cvtpd2ps)
//   +0x0c: float32 c       (quaternary; ctor arg3 is double, narrowed via cvtsd2ss)
//
// Provenance (all @Ozone.framework):
//   OZSnap()                          @0x0000000000027a660  __ZN6OZSnapC1Ev
//   OZSnap()                          @0x0000000000027a650  __ZN6OZSnapC2Ev   (ICF-folded to C1Ev body)
//   OZSnap(const OZSnap&)             @0x0000000000027a690  __ZN6OZSnapC1ERKS_
//   OZSnap(const OZSnap&)             @0x0000000000027a670  __ZN6OZSnapC2ERKS_
//   OZSnap(int,double,double,double)  @0x0000000000027a6e0  __ZN6OZSnapC1Eiddd
//   OZSnap(int,double,double,double)  @0x0000000000027a6b0  __ZN6OZSnapC2Eiddd
//   operator<(const OZSnap&) const    @0x0000000000027a710  __ZNK6OZSnapltERKS_

export class OZSnap {
  // Field names & offsets recovered from ctor stores / operator< loads.
  id: number;  // int32 @+0x00
  a: number;   // float32 @+0x04
  b: number;   // float32 @+0x08
  c: number;   // float32 @+0x0c

  /**
   * Default ctor. Disasm @0x27a660 (Ozone):
   *   xorps  %xmm0,%xmm0        ; zero 16 bytes
   *   movups %xmm0,(%rdi)       ; store to *this
   * -> all four fields = 0. int32 id becomes 0; the 12 zero bytes at 0x4..0xf
   * are three float32 zeros (bit pattern 0x00000000 == +0.0f).
   */
  constructor();
  /**
   * Copy ctor. Disasm @0x27a690 (C1ERKS_) / 0x27a670 (C2ERKS_, identical):
   *   movl    (%rsi),%eax      ; id
   *   movl    %eax,(%rdi)
   *   movsd   0x4(%rsi),%xmm0  ; 8 bytes = two float32 (a,b) copied together
   *   movsd   %xmm0,0x4(%rdi)
   *   movss   0xc(%rsi),%xmm0  ; c
   *   movss   %xmm0,0xc(%rdi)
   */
  constructor(other: OZSnap);
  /**
   * Value ctor. Disasm @0x27a6e0 (C1Eiddd) / 0x27a6b0 (C2Eiddd, identical):
   *   movl       %esi,(%rdi)              ; id = int32 arg
   *   unpcklpd   %xmm1,%xmm0              ; pack (a_d, b_d) as double2
   *   cvtpd2ps   %xmm0,%xmm0              ; narrow both to float32 (single precision)
   *   movlpd     %xmm0,0x4(%rdi)          ; store 8 bytes: a@0x4, b@0x8
   *   xorps      %xmm0,%xmm0
   *   cvtsd2ss   %xmm2,%xmm0              ; narrow c_d to float32
   *   movss      %xmm0,0xc(%rdi)
   * Rule 4: single-precision narrowing => Math.fround.
   */
  constructor(id: number, a: number, b: number, c: number);
  constructor(idOrOther?: number | OZSnap, a?: number, b?: number, c?: number) {
    if (idOrOther === undefined) {
      // default ctor @0x27a660
      this.id = 0;
      this.a = 0;
      this.b = 0;
      this.c = 0;
    } else if (typeof idOrOther === 'object') {
      // copy ctor @0x27a690 — plain field-by-field copy, no narrowing
      // (source already holds float32 bit patterns).
      this.id = idOrOther.id;
      this.a = idOrOther.a;
      this.b = idOrOther.b;
      this.c = idOrOther.c;
    } else {
      // value ctor @0x27a6e0 — narrow doubles to float32.
      this.id = idOrOther | 0; // int32
      this.a = Math.fround(a as number);
      this.b = Math.fround(b as number);
      this.c = Math.fround(c as number);
    }
  }

  /**
   * operator<(const OZSnap& rhs) const  @0x0000000000027a710 (__ZNK6OZSnapltERKS_)
   *
   * Lexicographic compare over (id:int32, a:f32, b:f32, c:f32). Mirrors the asm
   * branch-for-branch. Return type is uint8 (movb $0x1,%al; seta %al; xorl on
   * the "not-less" branch); JS returns bool.
   *
   * Disasm (Ozone @0x27a710):
   *   movl (%rdi),%ecx           ; lhs.id
   *   movl (%rsi),%edx           ; rhs.id
   *   movb $0x1,%al              ; assume TRUE
   *   cmpl %edx,%ecx             ; lhs.id ? rhs.id
   *   jge  0x27a720              ; if lhs.id >= rhs.id, keep going
   *   ret                        ; else return TRUE  (lhs.id < rhs.id)
   * 0x27a720:
   *   jle  0x27a726              ; if lhs.id == rhs.id, compare a; else fall through
   *   xorl %eax,%eax             ; lhs.id > rhs.id => return FALSE
   *   ret
   * 0x27a726:
   *   movss 0x4(%rdi),%xmm0      ; lhs.a
   *   movss 0x4(%rsi),%xmm1      ; rhs.a
   *   ucomiss %xmm0,%xmm1        ; (rhs.a vs lhs.a) — flags for "rhs.a > lhs.a"
   *   ja  0x27a71e               ; if rhs.a > lhs.a  => lhs.a < rhs.a => return TRUE
   *   ucomiss %xmm1,%xmm0        ; (lhs.a vs rhs.a)
   *   jbe 0x27a73e               ; if lhs.a <= rhs.a (i.e. equal here) => compare b
   *   xorl %eax,%eax             ; lhs.a > rhs.a => FALSE
   *   ret
   * 0x27a73e:  (same shape for b @0x8)
   *   movss 0x8(%rdi),%xmm0
   *   movss 0x8(%rsi),%xmm1
   *   ucomiss %xmm0,%xmm1
   *   ja  0x27a71e               ; TRUE
   *   ucomiss %xmm1,%xmm0
   *   jbe 0x27a756               ; equal => compare c
   *   xorl %eax,%eax             ; FALSE
   *   ret
   * 0x27a756:  (final key c @0xc — no equality fall-through; seta result)
   *   movss   0xc(%rsi),%xmm0    ; rhs.c
   *   ucomiss 0xc(%rdi),%xmm0    ; flags for (rhs.c vs lhs.c)
   *   seta    %al                ; %al = (rhs.c > lhs.c && ordered)  == (lhs.c < rhs.c)
   *   ret
   *
   * NaN behavior mirrors ucomiss: any NaN operand renders both ja and jbe
   * false-then-true depending on which comparand — this port uses the same
   * host float compare (`<`), which for JS numbers with a NaN yields false,
   * matching ucomiss+seta's unordered=CF=1,ZF=1 => seta returns 0.
   * Rule 4: values are stored as float32 (Math.fround in ctors) so JS `<`
   * over already-narrowed numbers matches ucomiss on the same bit patterns.
   */
  lt(rhs: OZSnap): boolean {
    // id: signed int32 primary key
    if (this.id < rhs.id) return true;
    if (this.id > rhs.id) return false;
    // a: float32 secondary
    if (this.a < rhs.a) return true;
    if (this.a > rhs.a) return false;
    // b: float32 tertiary
    if (this.b < rhs.b) return true;
    if (this.b > rhs.b) return false;
    // c: float32 quaternary — seta: strict less-than only, equal returns false
    return this.c < rhs.c;
  }
}
