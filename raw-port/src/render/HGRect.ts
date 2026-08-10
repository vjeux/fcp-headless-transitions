// HGRect.ts — Helium's rectangle geometry free-function family.
// Faithful transcription from the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium
//
// Source disassembly:
//   raw-port/re/disasm/Helium._HGRectMake4i.s        @0x107710
//   raw-port/re/disasm/Helium._HGRectMake4f.s        @0x107d50
//   raw-port/re/disasm/Helium._HGRectIsNull.s        @0x107b20
//   raw-port/re/disasm/Helium.__ZNK6HGRect6IsNullEv.s @0x1074a0 (class-member twin)
//   raw-port/re/disasm/Helium.__ZNK6HGRect7IsEqualES_.s @0x107410 (class-member twin)
//   raw-port/re/disasm/Helium._HGRectContainsRect.s  @0x107b60
//   raw-port/re/disasm/Helium._HGRectExcludesRect.s  @0x107ba0
//   raw-port/re/disasm/Helium._HGRectGrow.s          @0x107960
//   raw-port/re/disasm/Helium._HGRectHasSameOrigin.s @0x107a70
//   raw-port/re/disasm/Helium._HGRectIntegral.s      @0x107be0
//   raw-port/re/disasm/Helium._HGRectIntersection.s  @0x107ca0
//   raw-port/re/disasm/Helium._HGRectIsEqual.s       @0x107a80
//   raw-port/re/disasm/Helium._HGRectIsEqualSize.s   @0x107aa0
//   raw-port/re/disasm/Helium._HGRectIsInfinite.s    @0x107ae0
//   raw-port/re/disasm/Helium._HGRectFloat.s         @0x107930
//
// DATA symbols read directly from the Helium __DATA_CONST section (nm S entries):
//   _HGRectNull      @0x3d2284  16 bytes = 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
//                    = {x:0, y:0, right:0, bottom:0}
//   _HGRectInfinite  @0x3d2294  16 bytes = 00 00 00 80 00 00 00 80 ff ff ff 7f ff ff ff 7f
//                    = {x:INT_MIN, y:INT_MIN, right:INT_MAX, bottom:INT_MAX}
//
// RIP-relative float/int constants used by HGRectIntegral and HGRectMake4f
// (also in Helium __DATA_CONST, resolved via `raw-port/army/tools/resolve.py`):
//   @0x3d2280   float32 = 0xCF000000 = -2^31 = -2147483648.0f
//               (single-precision INT_MIN-as-float; used to clamp low corners
//                before roundss floor + cvttss2si)
//   @0x3d2240   packed 4 x float32 = [0x4F000000, 0x4F000000, 0, 0]
//                                  = [2^31, 2^31, 0, 0]
//               (single-precision +INT_MAX+1-as-float; used to clamp high
//                corners before roundps ceil + cvttss2si)
//   @0x3d2260   packed 4 x int32   = [0x7fffffff, 0, 0, 0x7fffffff]
//               (INT_MAX saturation for HGRectIntegral)
//   @0x3d2270   packed 4 x int32   = [0, 0x7fffffff, 0x7fffffff, 0]
//               (INT_MAX saturation for HGRectMake4f — swapped lane order
//                relative to 0x3d2260 because HGRectMake4f interleaves the
//                lanes as (y, x) whereas HGRectIntegral works on already
//                (x, y)-ordered HGRectf lanes.)
//
// ---------------------------------------------------------------------------
// HGRect LAYOUT (recovered from HGRectMake4i @0x107710 and confirmed by the
// bytes of _HGRectNull / _HGRectInfinite read directly from the binary):
//
//   struct HGRect {           // 16 bytes total, returned by value in (rax, rdx)
//     int32_t x;              // +0x00  low32 of the lo-qword
//     int32_t y;              // +0x04  high32 of the lo-qword
//     int32_t right;          // +0x08  low32 of the hi-qword (exclusive corner)
//     int32_t bottom;         // +0x0c  high32 of the hi-qword (exclusive corner)
//   };
//
// Passing convention (observed by every function here):
//   arg1 lo qword (rdi) = x     | (y      << 32)
//   arg1 hi qword (rsi) = right | (bottom << 32)
//   return  rax = x | y<<32,  rdx = right | bottom<<32

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** HGRect — Helium's rectangle. Corner-form int32 (see file header). Layout
 *  recovered from HGRectMake4i @0x107710 + _HGRectNull/_HGRectInfinite bytes. */
export interface HGRect {
  readonly x: number;      // int32, +0x00
  readonly y: number;      // int32, +0x04
  readonly right: number;  // int32, +0x08 (exclusive)
  readonly bottom: number; // int32, +0x0c (exclusive)
}

/** HGRectf — Helium's float32 rectangle. Same corner-form layout as HGRect
 *  but with single-precision floats (see HGRectFloat @0x107930). */
export interface HGRectf {
  readonly x: number;
  readonly y: number;
  readonly right: number;
  readonly bottom: number;
}

// ---------------------------------------------------------------------------
// Data constants (read directly from Helium __DATA_CONST — see file header)
// ---------------------------------------------------------------------------

/** _HGRectNull @Helium 0x3d2284 — the 16 zero bytes read from the binary. */
export const HGRectNull: HGRect = { x: 0, y: 0, right: 0, bottom: 0 };

/** _HGRectInfinite @Helium 0x3d2294 — bytes 00 00 00 80 00 00 00 80 ff ff ff
 *  7f ff ff ff 7f (= {INT_MIN, INT_MIN, INT_MAX, INT_MAX}). */
export const HGRectInfinite: HGRect = {
  x: -0x80000000,    // INT_MIN
  y: -0x80000000,
  right: 0x7fffffff, // INT_MAX
  bottom: 0x7fffffff,
};

// Sentinel scalars used in the int-corner arithmetic below.
const INT_MIN = -0x80000000;
const INT_MAX = 0x7fffffff;

// Single-precision helpers matching x86 SSE semantics.
const f32 = Math.fround;

// Truncate a float to int32 (cvttss2si). Every call site here has already
// max/min-clamped to [-2^31, +2^31] and swapped NaN out, so a straight
// truncate-toward-zero is the correct semantics.
function cvttss2si(v: number): number {
  if (Number.isNaN(v)) return INT_MIN;      // x86 "indefinite integer"
  if (v >= 2147483648.0) return INT_MIN;
  if (v < -2147483648.0) return INT_MIN;
  return (v < 0 ? Math.ceil(v) : Math.floor(v)) | 0;
}

// SSE roundss imm 0x9 = round-toward-negative-inf (floor), PE suppressed.
// SSE roundss imm 0xa = round-toward-positive-inf (ceil ), PE suppressed.
function roundssFloor(v: number): number { return f32(Math.floor(v)); }
function roundssCeil (v: number): number { return f32(Math.ceil (v)); }

// ---------------------------------------------------------------------------
// HGRectMake4i @Helium 0x107710
//   Args: (edi=x0, esi=y0, edx=x1, ecx=y1). Normalises so that the returned
//   HGRect has x <= right and y <= bottom:
//     eax = min(x0, x1)  ; cmpl+cmovll @0x107714-0x107718
//     edx = max(x0, x1)  ; cmovgl      @0x10771b
//     edi = min(y0, y1)  ; cmpl+cmovll @0x10771e-0x107722
//     ecx = max(y0, y1)  ; cmovgl      @0x107725
//   Packing @0x107728-0x107733:
//     rax = eax | (edi << 32) = x | y<<32           -> HGRect.lo
//     rdx = edx | (ecx << 32) = right | bottom<<32  -> HGRect.hi
// ---------------------------------------------------------------------------
export function HGRectMake4i(x0: number, y0: number, x1: number, y1: number): HGRect {
  const a = x0 | 0, b = y0 | 0, c = x1 | 0, d = y1 | 0;
  const x      = a < c ? a : c;
  const right  = a > c ? a : c;
  const y      = b < d ? b : d;
  const bottom = b > d ? b : d;
  return { x, y, right, bottom };
}

// ---------------------------------------------------------------------------
// HGRectIsNull @Helium 0x107b20
//   dl = (r.right  <= r.x)   ; cmpl %edi, %esi + setle %dl  @0x107b32-0x107b34
//   al = (r.bottom <= r.y)   ; cmpl %eax, %ecx + setle %al  @0x107b37-0x107b39
//   return al | dl           ; orb %dl, %al                 @0x107b3c
// ---------------------------------------------------------------------------
export function HGRectIsNull(r: HGRect): boolean {
  return (r.right | 0) <= (r.x | 0) || (r.bottom | 0) <= (r.y | 0);
}

// ---------------------------------------------------------------------------
// HGRect::IsNull() const @Helium 0x1074a0  (__ZNK6HGRect6IsNullEv)
//
// Class-member twin of the free HGRectIsNull @0x107b20 above. The free
// function takes the HGRect packed into %rdi|%rsi (pass-by-value corner
// form); this method takes a `const HGRect*` in %rdi and dereferences
// each field individually. Same logical result, different ABI: the C++
// method is emitted separately because its calling convention differs
// (pointer this vs packed value).
//
// Disassembly source:
//   raw-port/re/disasm/Helium.__ZNK6HGRect6IsNullEv.s
//
// FULL DISASM
//   0x1074a0  pushq  %rbp
//   0x1074a1  movq   %rsp, %rbp
//   0x1074a4  movl   0x8(%rdi), %ecx           ; ecx = this->right (+0x8)
//   0x1074a7  movb   $0x1, %al                 ; al = 1 (default "IsNull=true")
//   0x1074a9  cmpl   (%rdi), %ecx              ; flags on right - x   (AT&T dst-src)
//   0x1074ab  jle    0x1074b6                  ; taken iff right <= x  -> return al=1
//   0x1074ad  movl   0xc(%rdi), %eax           ; eax = this->bottom (+0xc)
//                                              ; NB: this clobbers %al (low byte
//                                              ; of eax) — that's intentional; the
//                                              ; next setle overwrites al again.
//   0x1074b0  cmpl   0x4(%rdi), %eax           ; flags on bottom - y
//   0x1074b3  setle  %al                       ; al = 1 iff bottom <= y
//   0x1074b6  popq   %rbp
//   0x1074b7  retq                             ; return al
//
// TRUTH TABLE (from the AT&T dst-src decode)
//   right <= x            -> return true    (jle branch taken)
//   right >  x, bottom<=y -> return true    (setle sets al=1)
//   right >  x, bottom> y -> return false   (setle sets al=0)
// Both edges are SIGNED int32 (`jle`/`setle`, not `jbe`/`setbe`). This is
// the standard "empty rectangle" test: a corner-form rect is null iff
// EITHER its width (right - x) OR its height (bottom - y) is non-positive.
//
// FRONTIER CALLEES: none — leaf function (no calls, no in-scope deps).
// ---------------------------------------------------------------------------

/** `HGRect::IsNull() const` — @Helium 0x1074a0 (__ZNK6HGRect6IsNullEv).
 *
 * Class-member accessor. Because our `HGRect` is modelled as a plain
 * TS interface (not a class — see the type declaration above), this
 * function receives the "this" pointer as an explicit parameter.
 * Semantically identical to the free `HGRectIsNull` above; kept
 * separate so the ledger entry for the member mangled name maps 1:1
 * to a real ported symbol.
 *
 * @param self  the `HGRect` — `this` in the native method.
 */
export function HGRect__IsNull(self: HGRect): boolean {
  // @0x1074a4..0x1074ab — cmpl (%rdi), %ecx ; jle : right <= x → true.
  //   AT&T `cmpl (%rdi), %ecx` sets flags on `ecx - (this+0)` =
  //   `right - x`, so `jle` is taken iff `right <= x`.
  if ((self.right | 0) <= (self.x | 0)) {
    // @0x1074ab — jle taken; al is still 1 from @0x1074a7.
    return true;
  }
  // @0x1074ad..0x1074b3 — cmpl 0x4(%rdi), %eax ; setle : bottom <= y.
  //   AT&T `cmpl 0x4(%rdi), %eax` sets flags on `eax - (this+0x4)` =
  //   `bottom - y`, so `setle` = 1 iff `bottom <= y`.
  return (self.bottom | 0) <= (self.y | 0);
  // @0x1074b6..0x1074b7 — epilogue + retq.
}

// ---------------------------------------------------------------------------
// HGRect::IsZero() const — @Helium 0x1074c0 (__ZNK6HGRect6IsZeroEv)
// ---------------------------------------------------------------------------
// Class-member accessor. Distinct from IsNull: IsZero is TRUE iff all four
// int32 fields are exactly 0 (i.e. the rect equals _HGRectNull byte-for-byte).
// IsNull is TRUE for any corner-form rect with non-positive width or height,
// so `HGRectNull` is IsNull-true AND IsZero-true, but e.g. {5,5,3,3} is
// IsNull-true (right<=x, bottom<=y) yet IsZero-false. Different semantics —
// both member accessors ship separately.
//
// Disassembly source:
//   raw-port/re/disasm/Helium.__ZNK6HGRect6IsZeroEv.s
//
// FULL DISASM (23 lines — a short-circuit chain of four zero-tests)
//   0x1074c0  pushq  %rbp
//   0x1074c1  movq   %rsp, %rbp
//   0x1074c4  cmpl   $0x0, (%rdi)           ; flags on (0 - x)  == flags on -x
//   0x1074c7  je     0x1074cd               ; taken iff x == 0  -> continue
//   0x1074c9  xorl   %eax, %eax             ; else return 0
//   0x1074cb  popq   %rbp
//   0x1074cc  retq
//   0x1074cd  cmpl   $0x0, 0x4(%rdi)        ; flags on (0 - y)  == flags on -y
//   0x1074d1  je     0x1074d7               ; taken iff y == 0
//   0x1074d3  xorl   %eax, %eax             ; else return 0
//   0x1074d5  popq   %rbp
//   0x1074d6  retq
//   0x1074d7  cmpl   $0x0, 0x8(%rdi)        ; flags on (0 - right)
//   0x1074db  je     0x1074e1               ; taken iff right == 0
//   0x1074dd  xorl   %eax, %eax             ; else return 0
//   0x1074df  popq   %rbp
//   0x1074e0  retq
//   0x1074e1  cmpl   $0x0, 0xc(%rdi)        ; flags on (0 - bottom)
//   0x1074e5  sete   %al                    ; al = 1 iff bottom == 0
//   0x1074e8  popq   %rbp
//   0x1074e9  retq
//
// TRUTH TABLE (AT&T dst-src decode of `cmpl $0x0, m` == `flags on (m - 0)`):
//   Each `je` @0x1074c7/0x1074d1/0x1074db is taken iff its inspected int32
//   field equals zero. The four `cmpl $0`s short-circuit: any non-zero field
//   returns false immediately; only when x==y==right==bottom==0 does the
//   final `sete %al` set al=1.
//
// EQUIVALENT to:  return self.x==0 && self.y==0 && self.right==0 && self.bottom==0
//
// The compiler chose the branch-per-field encoding over an OR-reduce because
// short-circuit early-out is the tighter uop dispatch (Sandy-Bridge era) and
// the fields alias `_HGRectNull`'s 16 zero bytes, so the common path is
// most-likely-nonzero-early.
//
// FRONTIER CALLEES: none — leaf function (no calls, no in-scope deps).
// ---------------------------------------------------------------------------

/** `HGRect::IsZero() const` — @Helium 0x1074c0 (__ZNK6HGRect6IsZeroEv).
 *
 * Class-member accessor: returns true iff all four int32 fields (x, y,
 * right, bottom) are exactly zero — i.e. the rect equals `_HGRectNull`
 * byte-for-byte. This is a strictly stronger predicate than `IsNull`:
 * IsZero(r) => IsNull(r), but not the reverse (a rect like `{5,5,3,3}`
 * is IsNull-true, IsZero-false).
 *
 * Because our `HGRect` is modelled as a plain TS interface (not a class),
 * the "this" pointer is passed as an explicit `self` parameter, mirroring
 * the sibling `HGRect__IsNull` above.
 *
 * @param self  the `HGRect` — `this` in the native method.
 */
export function HGRect__IsZero(self: HGRect): boolean {
  // @0x1074c4..0x1074c7 — cmpl $0, (%rdi) ; je : x == 0 -> continue.
  //   `| 0` matches the 32-bit sign-agnostic compare emitted by the
  //   compiler; the disasm's `cmpl` operates on the exact 4 bytes.
  if ((self.x | 0) !== 0) {
    // @0x1074c9..0x1074cc — xorl %eax,%eax ; popq ; retq  -> return false.
    return false;
  }
  // @0x1074cd..0x1074d1 — cmpl $0, 0x4(%rdi) ; je : y == 0 -> continue.
  if ((self.y | 0) !== 0) {
    // @0x1074d3..0x1074d6 — xorl %eax,%eax ; popq ; retq  -> return false.
    return false;
  }
  // @0x1074d7..0x1074db — cmpl $0, 0x8(%rdi) ; je : right == 0 -> continue.
  if ((self.right | 0) !== 0) {
    // @0x1074dd..0x1074e0 — xorl %eax,%eax ; popq ; retq  -> return false.
    return false;
  }
  // @0x1074e1..0x1074e5 — cmpl $0, 0xc(%rdi) ; sete %al  -> al = (bottom==0).
  return (self.bottom | 0) === 0;
  // @0x1074e8..0x1074e9 — epilogue + retq.
}

// ---------------------------------------------------------------------------
// HGRect::IsEqual(HGRect) const @Helium 0x107410 (__ZNK6HGRect7IsEqualES_)
//
// The CLASS-MEMBER twin of the free `HGRectIsEqual` @0x107a80 above. Same
// predicate, DIFFERENT machine code — and a different symbol, so it gets its
// own exported function (one C++ method = one exported function, Rule 6):
// the free function XORs both packed qwords and tests the OR, while the member
// does four separate 32-bit compares with an early-out. Both are transcribed
// as written.
//
// The by-value `HGRect` argument (16 bytes, two eightbytes) arrives in the SysV
// INTEGER class registers: %rsi = {x, y} (x in the low 32 bits, y in the high
// 32) and %rdx = {right, bottom}. That is what the two `shrq $0x20` shifts are
// for — they move the HIGH field of each eightbyte down into the low half so a
// 32-bit `cmpl` can see it.
//
//   0x107414  cmpl %esi, (%rdi)        ; this.x      - other.x
//   0x107416  jne  0x107432            ;   != -> return false
//   0x107418  shrq $0x20, %rsi         ; %esi = other.y
//   0x10741c  cmpl %esi, 0x4(%rdi)     ; this.y      - other.y
//   0x10741f  jne  0x107432            ;   != -> return false
//   0x107421  cmpl %edx, 0x8(%rdi)     ; this.right  - other.right
//   0x107424  jne  0x107432            ;   != -> return false
//   0x107426  shrq $0x20, %rdx         ; %edx = other.bottom
//   0x10742a  cmpl %edx, 0xc(%rdi)     ; this.bottom - other.bottom
//   0x10742d  sete %al                 ; return (== )
//   0x107432  xorl %eax, %eax          ; the shared "return false" tail
//
// AT&T note (PORTING_SPEC Rule 4): `cmpl %esi, (%rdi)` computes `dst - src` =
// `this.x - other.x`; `jne`/`sete` are the ZF conditions, so every test is a
// plain 32-bit EQUALITY — no signed/unsigned ordering is involved and the
// field order tested is x, y, right, bottom.
//
// FRONTIER CALLEES: none — leaf function (no calls, no in-scope deps).
// ---------------------------------------------------------------------------

/** `HGRect::IsEqual(HGRect) const` — @Helium 0x107410 (__ZNK6HGRect7IsEqualES_).
 *
 * Class-member predicate. Because our `HGRect` is modelled as a plain TS
 * interface (not a class — see the type declaration above), the native `this`
 * pointer is passed as the explicit first parameter, exactly like
 * {@link HGRect__IsNull} and {@link HGRect__IsZero}.
 *
 * @param self  the `HGRect` — `this` (%rdi) in the native method.
 * @param other the by-value `HGRect` argument (%rsi = {x,y}, %rdx = {right,bottom}).
 */
export function HGRect__IsEqual(self: HGRect, other: HGRect): boolean {
  // @0x107414..0x107416 — cmpl %esi, (%rdi) ; jne : this.x != other.x -> false.
  if ((self.x | 0) !== (other.x | 0)) {
    // @0x107432 — xorl %eax,%eax ; popq ; retq.
    return false;
  }
  // @0x107418..0x10741f — shrq $0x20,%rsi (other.y) ; cmpl %esi,0x4(%rdi) ; jne.
  if ((self.y | 0) !== (other.y | 0)) {
    // @0x107432 — shared false tail.
    return false;
  }
  // @0x107421..0x107424 — cmpl %edx, 0x8(%rdi) ; jne : right mismatch -> false.
  if ((self.right | 0) !== (other.right | 0)) {
    // @0x107432 — shared false tail.
    return false;
  }
  // @0x107426..0x10742d — shrq $0x20,%rdx (other.bottom) ; cmpl %edx,0xc(%rdi) ;
  //                        sete %al -> the result is this last equality.
  return (self.bottom | 0) === (other.bottom | 0);
  // @0x107430..0x107431 — epilogue + retq.
}

// ---------------------------------------------------------------------------
// HGRectContainsRect @Helium 0x107b60 — true iff r1 fully contains r2.
//   dil = (r1.x      <= r2.x)      ; setle @0x107b6d
//   al  = (r1.y      <= r2.y)      ; setle @0x107b77
//   dl  = (r1.right  >= r2.right)  ; setge @0x107b7c
//   al  = (r1.bottom >= r2.bottom) ; setge @0x107b8e
//   AND all four                    ; andb  @0x107b7f,0x107b82,0x107b91
// ---------------------------------------------------------------------------
export function HGRectContainsRect(r1: HGRect, r2: HGRect): boolean {
  const x1 = r1.x | 0, y1 = r1.y | 0, rt1 = r1.right | 0, bt1 = r1.bottom | 0;
  const x2 = r2.x | 0, y2 = r2.y | 0, rt2 = r2.right | 0, bt2 = r2.bottom | 0;
  return x1 <= x2 && y1 <= y2 && rt1 >= rt2 && bt1 >= bt2;
}

// ---------------------------------------------------------------------------
// HGRectExcludesRect @Helium 0x107ba0 — true iff r1 and r2 do NOT overlap.
//   dil = (r1.x      >  r2.right)  ; setg @0x107bad
//   al  = (r1.y      >  r2.bottom) ; setg @0x107bb7
//   cl  = (r1.right  <  r2.x)      ; setl @0x107bbc
//   al  = (r1.bottom <  r2.y)      ; setl @0x107bce
//   OR all four                     ; orb  @0x107bbf,0x107bc2,0x107bd1
// ---------------------------------------------------------------------------
export function HGRectExcludesRect(r1: HGRect, r2: HGRect): boolean {
  const x1 = r1.x | 0, y1 = r1.y | 0, rt1 = r1.right | 0, bt1 = r1.bottom | 0;
  const x2 = r2.x | 0, y2 = r2.y | 0, rt2 = r2.right | 0, bt2 = r2.bottom | 0;
  return x1 > rt2 || y1 > bt2 || rt1 < x2 || bt1 < y2;
}

// ---------------------------------------------------------------------------
// HGRectHasSameOrigin @Helium 0x107a70 — compares the lo-qwords only.
//   xorl %eax, %eax; cmpq %rdx, %rdi; sete %al   @0x107a74-0x107a79
//   Equivalent to r1.x == r2.x && r1.y == r2.y.
// ---------------------------------------------------------------------------
export function HGRectHasSameOrigin(r1: HGRect, r2: HGRect): boolean {
  return (r1.x | 0) === (r2.x | 0) && (r1.y | 0) === (r2.y | 0);
}

// ---------------------------------------------------------------------------
// HGRectIsEqual @Helium 0x107a80 — (r1.lo^r2.lo) | (r1.hi^r2.hi) == 0.
// Byte-for-byte equality of both packed qwords.               @0x107a84-0x107a8f
// ---------------------------------------------------------------------------
export function HGRectIsEqual(r1: HGRect, r2: HGRect): boolean {
  return (r1.x | 0) === (r2.x | 0)
      && (r1.y | 0) === (r2.y | 0)
      && (r1.right  | 0) === (r2.right  | 0)
      && (r1.bottom | 0) === (r2.bottom | 0);
}

// ---------------------------------------------------------------------------
// HGRectIsEqualSize @Helium 0x107aa0
//   r8d = r1.right  - r1.x;   r9d = r2.right  - r2.x   ; subl @0x107aa7,0x107aad
//   if (r8d != r9d) return 0                             ; jne  @0x107ab5
//   esi = r1.bottom - r1.y;   ecx = r2.bottom - r2.y   ; subl @0x107ac7,0x107ac9
//   return (esi == ecx)                                  ; sete @0x107acf
// Subtractions are 32-bit; use `| 0` on the difference to match wraparound.
// ---------------------------------------------------------------------------
export function HGRectIsEqualSize(r1: HGRect, r2: HGRect): boolean {
  const w1 = ((r1.right | 0) - (r1.x | 0)) | 0;
  const w2 = ((r2.right | 0) - (r2.x | 0)) | 0;
  if (w1 !== w2) return false;
  const h1 = ((r1.bottom | 0) - (r1.y | 0)) | 0;
  const h2 = ((r2.bottom | 0) - (r2.y | 0)) | 0;
  return h1 === h2;
}

// ---------------------------------------------------------------------------
// HGRectIsInfinite @Helium 0x107ae0
//   al = (r.x == INT_MIN)             ; negl+seto   @0x107ae4-0x107ae8
//   cl = (r.y == INT_MIN)             ; cmpq $-0x7fffffff00000000,rdi + setl
//        (rdi is packed x|y<<32; the signed-int64 compare against
//        0x8000000100000000 is TRUE iff the high 32 bits of rdi are INT_MIN,
//        i.e. r.y == INT_MIN.)                                @0x107aeb-0x107af8
//   cl |= al                          ; orb          @0x107afb
//   al = (r.right  == INT_MAX)        ; cmpl+sete    @0x107afd-0x107b03
//   dl = (r.bottom == INT_MAX)        ; cmpl+sete    @0x107b06-0x107b10
//   return al | dl | cl               ; orb          @0x107b13,0x107b15
// ---------------------------------------------------------------------------
export function HGRectIsInfinite(r: HGRect): boolean {
  return (r.x | 0) === INT_MIN
      || (r.y | 0) === INT_MIN
      || (r.right  | 0) === INT_MAX
      || (r.bottom | 0) === INT_MAX;
}

// ---------------------------------------------------------------------------
// HGRectFloat @Helium 0x107930 — HGRect (int32) -> HGRectf (float32).
//   cvtsi2ss %edi, %xmm0   -> f(x)          @0x107934
//   shrq $0x20, %rdi; cvtsi2ss %edi, %xmm2 -> f(y)         @0x107938-0x107940
//   cvtsi2ss %esi, %xmm1   -> f(right)      @0x10793c
//   shrq $0x20, %rsi; cvtsi2ss %esi, %xmm3 -> f(bottom)    @0x107944-0x107948
//   insertps packs (x, y) into xmm0[0..1] and (right, bottom) into xmm1[0..1]
//   for the packed return. Every lane is a single-precision float.
// ---------------------------------------------------------------------------
export function HGRectFloat(r: HGRect): HGRectf {
  return {
    x:      f32(r.x | 0),
    y:      f32(r.y | 0),
    right:  f32(r.right  | 0),
    bottom: f32(r.bottom | 0),
  };
}

// ---------------------------------------------------------------------------
// HGRectIntersection @Helium 0x107ca0
//
//   Early exit @0x107ca2: `jle 0x107d3d` when `r1.right <= r1.x` (r1 already
//   empty on the x axis) -> HGRectNull.
//
//   The 4-way non-degenerate + non-disjoint AND-chain @0x107cce-0x107d09:
//     r1 non-degenerate on y:  r1.bottom > r1.y             ; setg @0x107cd1
//     r2 non-degenerate on x:  r2.right  > r2.x             ; setg @0x107cd7
//     r2 non-degenerate on y:  r2.bottom > r2.y             ; setg @0x107ce0
//     r1 crosses r2's lo:     r1.right > r2.x  AND  r1.bottom > r2.y
//                                                              ; setg @0x107ce6,cf3
//     r1 crosses r2's hi:     r1.x < r2.right AND  r1.y < r2.bottom
//                                                              ; setl @0x107cf9,d02
//     AND them all.
//   If false -> HGRectNull (0x107d3d).
//
//   Otherwise materialise corners @0x107d16-0x107d2a:
//     rax     = max(r1.x, r2.x)          ; cmpl+cmovgl @0x107d16-0x107d18
//     r8d     = max(r1.y, r2.y)          ; cmpl+cmovgl @0x107d1b-0x107d1e
//     ecx     = min(r1.right,  r2.right) ; cmpl+cmovll @0x107d22-0x107d24
//     edx     = min(r1.bottom, r2.bottom); cmpl+cmovll @0x107d27-0x107d2a
//   Packing @0x107d2e-0x107d39:
//     rax = rax | (r8d<<32)  = x | y<<32          -> HGRect.lo
//     rdx = ecx | (edx<<32)  = right | bottom<<32 -> HGRect.hi
// ---------------------------------------------------------------------------
export function HGRectIntersection(r1: HGRect, r2: HGRect): HGRect {
  const x1 = r1.x | 0, y1 = r1.y | 0, rt1 = r1.right | 0, bt1 = r1.bottom | 0;
  const x2 = r2.x | 0, y2 = r2.y | 0, rt2 = r2.right | 0, bt2 = r2.bottom | 0;

  // Early null: r1 empty on x  (jle at 0x107ca2)
  if (rt1 <= x1) return { x: 0, y: 0, right: 0, bottom: 0 };

  // The 4-way AND-chain (see comment above).
  const nonDegen  = bt1 > y1 && rt2 > x2 && bt2 > y2;
  const overlapLo = rt1 > x2 && bt1 > y2;
  const overlapHi = x1 < rt2 && y1 < bt2;
  if (!(nonDegen && overlapLo && overlapHi)) {
    return { x: 0, y: 0, right: 0, bottom: 0 };
  }

  const x      = x1  > x2  ? x1  : x2;   // cmovgl @0x107d18
  const y      = y1  > y2  ? y1  : y2;   // cmovgl @0x107d1e
  const right  = rt1 < rt2 ? rt1 : rt2;  // cmovll @0x107d24
  const bottom = bt1 < bt2 ? bt1 : bt2;  // cmovll @0x107d2a
  return { x, y, right, bottom };
}

// ---------------------------------------------------------------------------
// HGRectGrow @Helium 0x107960 — corner-wise SATURATING int32 add of r + g.
// (Int arithmetic — the disasm has zero SSE ops; every step is `leal
//  (%src,%dst), %tmp` guarded by a signed-overflow saturation check.)
//
//   Each corner c_out = sat_add_i32(c_in, g_in) via:
//     temp = c_in + g_in                            ; leal
//     if g_in > 0:                                  ; testl+jle
//         if (INT_MAX - g_in) <= c_in: temp = INT_MAX
//         (`xorl $0x7fffffff, g` when g>0 == INT_MAX - g since bit-31 of g
//          is 0; `cmovlel` triggers on `<=` (SF=OF or ZF).)
//     else:                                         ; g_in <= 0
//         if (INT_MIN - g_in) >= c_in: temp = INT_MIN
//         (`movl 0x80000000,r11d; subl g,r11d; cmpl c,r11d; cmovgel` triggers
//          on `>=`, matching the low-overflow saturation.)
//
//   Corner order (in the code): x, y, right, bottom.
//     x      leal @0x10796e
//     y      leal @0x1079ab
//     right  leal @0x1079c8
//     bottom leal @0x1079e1
//   Packing @0x107a55-0x107a65:
//     rax = x_sat | (y_sat << 32)          -> HGRect.lo
//     rdx = right_sat | (bottom_sat << 32) -> HGRect.hi
// ---------------------------------------------------------------------------
function satAddI32(a: number, g: number): number {
  const A = a | 0, G = g | 0;
  if (G > 0) {
    // INT_MAX - G <= A  ->  A + G overflows high
    if (((INT_MAX - G) | 0) <= A) return INT_MAX;
    return (A + G) | 0;
  } else {
    // INT_MIN - G >= A  ->  A + G overflows low
    // (subl of INT_MIN - G is a 32-bit signed sub; wrap emulated with `| 0`)
    const lo = ((INT_MIN | 0) - G) | 0;
    if (lo >= A) return INT_MIN;
    return (A + G) | 0;
  }
}
export function HGRectGrow(r: HGRect, g: HGRect): HGRect {
  return {
    x:      satAddI32(r.x,      g.x),
    y:      satAddI32(r.y,      g.y),
    right:  satAddI32(r.right,  g.right),
    bottom: satAddI32(r.bottom, g.bottom),
  };
}

// ---------------------------------------------------------------------------
// HGRectIntegral @Helium 0x107be0 — HGRectf -> HGRect via floor(low)/ceil(high)
//
//   Guard @0x107be0-0x107bff:
//     ucomiss xmm1, xmm0 ; ja return-null                 -> x > right OR NaN
//     cmpltps xmm0, xmm2 ; pextrb $0x4 ; testb $1         -> bottom < y
//   -> HGRectNull if either.
//
//   Body @0x107c00-0x107c94:
//     Lo corners (x, y):  clamp to -2^31 (maxss @0x3d2280), roundss $0x9
//     (floor), cvttss2si.
//     Hi corners (right, bottom): clamp to +2^31 (minps @0x3d2240), NaN
//     -> +2^31 (blendvps with cmpunordps mask), roundps $0xa (ceil),
//     cvttss2si.  Per-lane INT_MAX saturation when result >= +2^31 selects
//     from the packed constant @0x3d2260 = [0x7fffffff, 0, 0, 0x7fffffff].
//   Packing @0x107c8c-0x107c94:
//     rax = int_x | (int_y << 32)                      -> HGRect.lo
//     rdx = int_right | (int_bottom << 32)             -> HGRect.hi
// ---------------------------------------------------------------------------
export function HGRectIntegral(rf: HGRectf): HGRect {
  const fx = f32(rf.x), fy = f32(rf.y), frt = f32(rf.right), fbt = f32(rf.bottom);

  // Early null: unordered OR x > right OR bottom < y  @0x107be0-0x107bf4
  if (Number.isNaN(fx) || Number.isNaN(frt) || fx > frt) {
    return { x: 0, y: 0, right: 0, bottom: 0 };
  }
  if (Number.isNaN(fy) || Number.isNaN(fbt) || fbt < fy) {
    return { x: 0, y: 0, right: 0, bottom: 0 };
  }

  const NEG_2_31 = f32(-2147483648.0);           // @0x3d2280
  const POS_2_31 = f32( 2147483648.0);           // @0x3d2240

  // Lo corners
  const lx = f32(Math.max(NEG_2_31, fx));        // maxss @0x107c10
  const ly = f32(Math.max(NEG_2_31, fy));
  const x = cvttss2si(roundssFloor(lx));         // @0x107c14-0x107c1a
  const y = cvttss2si(roundssFloor(ly));

  // Hi corners
  let hr = f32(Math.min(POS_2_31, frt));         // minps @0x107c39
  let hb = f32(Math.min(POS_2_31, fbt));
  if (Number.isNaN(frt)) hr = POS_2_31;          // blendvps NaN mask @0x107c43
  if (Number.isNaN(fbt)) hb = POS_2_31;
  const cr = roundssCeil(hr);                    // roundps $0xa @0x107c48
  const cb = roundssCeil(hb);
  const right  = (POS_2_31 <= cr) ? INT_MAX : cvttss2si(cr);  // cmpleps + blendvpd @0x3d2260
  const bottom = (POS_2_31 <= cb) ? INT_MAX : cvttss2si(cb);
  return { x, y, right, bottom };
}

// ---------------------------------------------------------------------------
// HGRectMake4f @Helium 0x107d50 — (float x0, float y0, float x1, float y1)
// -> HGRect (integer). Same clamp/floor/ceil/trunc/saturate pipeline as
// HGRectIntegral, preceded by a min/max normalisation of each axis.
//
//   Setup @0x107d50-0x107d68: interleave into the machine's "(y, x)" lane
//   order, then packed minps/maxps of the two corner vectors.
//   NaN handling @0x107d6b-0x107d77: any lane where xmm4 (=(y0, x0, ...))
//   was unordered gets replaced by xmm3 (=(y1, x1, ...)) in BOTH min and
//   max — collapsing that lane to the second corner's value.
//
//   Null guard @0x107d7c-0x107d92: `cmpltps xmm2, xmm0(=xmm1)` = max < min
//   per-lane; unpcklps duplicates lanes; movmskpd -> low 2 bits. Any bit
//   set (either axis inverted) -> HGRectNull.
//
//   The body from 0x107d93 mirrors HGRectIntegral exactly, but on the
//   interleaved (y, x) lane order, and with the fallback constant swapped to
//   @0x3d2270 = [0, INT_MAX, INT_MAX, 0] to match the lane swap.
//
//   Final packing:
//     rax = x_int | (y_int      << 32)              -> HGRect.lo
//     rdx = ceil_right_int | (ceil_bottom_int << 32) -> HGRect.hi
// ---------------------------------------------------------------------------
export function HGRectMake4f(x0: number, y0: number, x1: number, y1: number): HGRect {
  const fx0 = f32(x0), fy0 = f32(y0), fx1 = f32(x1), fy1 = f32(y1);

  // NaN in xmm4 (=xmm1,xmm0=y0,x0 lane) collapses that lane's min AND max
  // to the (x1,y1) value (blendvps @0x107d72,d77). NaN in xmm3 propagates
  // through minps/maxps naturally per SSE semantics.
  let minX: number, maxX: number;
  if (Number.isNaN(fx0)) { minX = fx1; maxX = fx1; }
  else                   { minX = f32(Math.min(fx0, fx1)); maxX = f32(Math.max(fx0, fx1)); }

  let minY: number, maxY: number;
  if (Number.isNaN(fy0)) { minY = fy1; maxY = fy1; }
  else                   { minY = f32(Math.min(fy0, fy1)); maxY = f32(Math.max(fy0, fy1)); }

  // Null guard: either axis inverted (or NaN survived).
  if (Number.isNaN(minX) || Number.isNaN(maxX) || maxX < minX) {
    return { x: 0, y: 0, right: 0, bottom: 0 };
  }
  if (Number.isNaN(minY) || Number.isNaN(maxY) || maxY < minY) {
    return { x: 0, y: 0, right: 0, bottom: 0 };
  }

  const NEG_2_31 = f32(-2147483648.0);           // @0x3d2280
  const POS_2_31 = f32( 2147483648.0);           // @0x3d2240

  // Lo corners
  const lx = f32(Math.max(NEG_2_31, minX));      // maxss @0x107db1
  const ly = f32(Math.max(NEG_2_31, minY));      // maxss @0x107da3
  const x = cvttss2si(roundssFloor(lx));         // @0x107db8-0x107dbe
  const y = cvttss2si(roundssFloor(ly));         // @0x107da7-0x107dad

  // Hi corners
  let hr = f32(Math.min(POS_2_31, maxX));
  let hb = f32(Math.min(POS_2_31, maxY));
  if (Number.isNaN(maxX)) hr = POS_2_31;         // blendvps NaN mask @0x107dd6
  if (Number.isNaN(maxY)) hb = POS_2_31;
  const cr = roundssCeil(hr);                    // roundps $0xa @0x107ddb
  const cb = roundssCeil(hb);
  const right  = (POS_2_31 <= cr) ? INT_MAX : cvttss2si(cr);  // cmpleps + blendvpd @0x3d2270
  const bottom = (POS_2_31 <= cb) ? INT_MAX : cvttss2si(cb);
  return { x, y, right, bottom };
}

// ---------------------------------------------------------------------------
// Numeric self-checks (transcribed from the formulas above and hand-verified
// against the disasm — every entry should be reproducible by the port):
//
//   HGRectMake4i(3, 4, 1, 2)              -> {x:1, y:2, right:3, bottom:4}
//     (both corners swap so x<=right and y<=bottom)
//   HGRectIsNull({0,0,0,0})               -> true   (right<=x)
//   HGRectIsNull({0,0,10,10})             -> false
//   HGRectContainsRect({0,0,10,10}, {2,2,8,8})    -> true
//   HGRectContainsRect({0,0,10,10}, {2,2,12,8})   -> false (r2.right>r1.right)
//   HGRectExcludesRect({0,0,10,10}, {20,0,30,10}) -> true  (r1.right=10 < r2.x=20)
//   HGRectExcludesRect({0,0,10,10}, {5,5,15,15})  -> false (overlap)
//   HGRectIntersection({0,0,10,10}, {5,5,15,15})
//     -> {x:5, y:5, right:10, bottom:10}
//   HGRectIntersection({0,0,10,10}, {20,20,30,30}) -> HGRectNull
//   HGRectHasSameOrigin({0,0,10,10}, {0,0,20,20}) -> true
//   HGRectHasSameOrigin({0,0,10,10}, {1,0,10,10}) -> false
//   HGRectIsEqual(HGRectNull, HGRectNull)         -> true
//   HGRectIsEqualSize({0,0,10,10}, {5,5,15,15})   -> true (both 10x10)
//   HGRectIsInfinite(HGRectInfinite)              -> true
//   HGRectIsInfinite({0,0,10,10})                 -> false
//   HGRectIntegral({x:0.5, y:1.5, right:2.5, bottom:3.5})
//     -> {x:0, y:1, right:3, bottom:4}
//   HGRectFloat({0,0,10,10})                      -> {0.0f, 0.0f, 10.0f, 10.0f}
//   HGRectMake4f(0.5, 3.5, 2.5, 1.5)              -> {x:0, y:1, right:3, bottom:4}
//     (normalise (x=0.5 vs 2.5, y=3.5 vs 1.5) then floor lo / ceil hi)
//   HGRectGrow({0,0,10,10}, {-1,-1,1,1})          -> {-1,-1,11,11}
//   HGRectGrow({INT_MAX,0,0,0}, {1,0,0,0})        -> {INT_MAX,0,0,0}
//   HGRectGrow({INT_MIN,0,0,0}, {-1,0,0,0})       -> {INT_MIN,0,0,0}
