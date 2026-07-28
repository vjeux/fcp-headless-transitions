// Port of Helium HGLoggerUtils (Final Cut Pro).
//
// Source:  /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// Class:   HGLoggerUtils
// Layer:   render  (pure formatting helpers used by the render/log path)
//
// This class has four static member functions in the FCP binary:
//   @0x1acb40  HGLoggerUtils::bytesPrettyString(unsigned long long)
//   @0x1acd40  HGLoggerUtils::timePrettyString(unsigned long long)
//   @0x1acf50  HGLoggerUtils::matrixPrettyString(double const*, int, int, string const&, string const&)
//   @0x1ad3d0  HGLoggerUtils::matrixPrettyString(float  const*, int, int, string const&, string const&)
//
// The two matrixPrettyString overloads are thin trampolines that tail-call a
// free templated helper `MatrixPrettyString<T>` (still un-transcribed).

// -----------------------------------------------------------------------------
// HGLoggerUtils::bytesPrettyString(unsigned long long)  @0x1acb40
// -----------------------------------------------------------------------------
//
// ASM shape (Helium @0x1acb40 .. @0x1acd1f):
//   if (bytes == 0) {                                @0x1acb56 testq / je 0x1acb8f
//     group = 0;
//   } else {
//     // uint64 -> double via the classic "punpckldq + subpd" trick:
//     //   xmm1 = [ (uint32)bytes | 0x43300000 ,  (uint32)(bytes>>32) | 0x45300000 ]
//     //     @0x1acb60 punpckldq  0x21e338(%rip)   (magic u64 0x4530000043300000 @VA 0x3caea0)
//     //     @0x1acb68 subpd      0x21e340(%rip)   (bias  double 4503599627370496.0
//     //                                             packed 2x @VA 0x3caeb0)
//     //   x_as_double = lo_double + hi_double     (unpckhpd + addsd)
//     //     @0x1acb7c call _log2                  (symbol stub @0x3c53fc)
//     //     @0x1acb81 divsd  0x6b0737(%rip)       (10.0 at VA 0x85d2c0)
//     //     @0x1acb89 cvttsd2si -> eax
//     const g = Math.floor(Math.log2(bytes) / 10);   // truncation via cvttsd2si
//   }
//   // clamp to <= 4 (last unit is TB):
//   //   @0x1acb91 cmpl $0x4, %eax ; movl $0x4, %r15d ; cmovll %eax, %r15d
//
//   // uint64 -> float. Sign-bit-aware; for bytes < 2^63 the direct cvtsi2ss
//   // branch runs (@0x1acba3..@0x1acbab). This matches Number(BigInt) in JS.
//
//   // divisor = ldexp(1.0, 10 * groupIdx) = 1024^groupIdx
//   //   @0x1acbcf leal (%r15,%r15), %eax        -> eax = 2*group
//   //   @0x1acbd3 leal (%rax,%rax,4), %edi      -> edi = 10*group
//   //   @0x1acbd6 movsd 0x21d682(%rip), %xmm0   -> 1.0  at VA 0x3ca260
//   //   @0x1acbde call _ldexp                    (stub @0x3c53d8)
//   //   @0x1acbe8 divsd  %xmm0, %xmm1           -> mantissa = x_as_f32 / 1024^g
//   //   @0x1acbef cvtsd2ss                     -> narrow to f32
//   //
//   // Then stream: `os << (float)mantissa << units[groupIdx];` and return os.str().
//
// The FCP function returns a std::string of the form "<mantissa><UNIT>",
// where <mantissa> is a `float` emission by `std::ostream::operator<<(float)`
// with the default 6-digit precision and NO fixed / scientific fmtflags set
// (the `andl $0xFFFFFEFB, ... ; orl $0x4, ...` at @0x1acc16 clears floatfield
// and sets basefield=dec; it does NOT touch fixed/scientific).
//
// The `units` array is at VA 0xa266b0 (5 char* slots, each is " B", " KB",
// " MB", " GB", " TB"). Verified by pointer table read.

/** units table @VA 0xa266b0 — see HGLoggerUtils::bytesPrettyString @0x1acc4c */
const BYTES_UNITS: readonly string[] = [' B', ' KB', ' MB', ' GB', ' TB'];

/**
 * HGLoggerUtils::bytesPrettyString(uint64) @0x1acb40
 *
 * Returns a human-readable byte size string, e.g. `1536` -> `"1.5 KB"`.
 *
 * Algorithm (mirrors the FCP asm exactly):
 *   1. If bytes==0, groupIdx=0. Else groupIdx = trunc(log2((double)bytes)/10),
 *      clamped to <= 4.  (Groups: 0=B, 1=KB, 2=MB, 3=GB, 4=TB.)
 *   2. mantissa (as float) = (float)bytes / 1024^groupIdx.
 *   3. Format as `<mantissa><units[groupIdx]>` using default C++ ostream
 *      formatting for float (precision=6, no fixed/scientific).
 *
 * Callees:
 *   - _log2                                        (stub @0x3c53fc)
 *   - _ldexp                                       (stub @0x3c53d8)
 *   - basic_stringstream ctor/dtor + operator<<    (libc++)
 *   - _strlen, __put_character_sequence            (libc++/libc)
 * Constants:
 *   - 0x4530000043300000                @VA 0x3caea0  (uint64->double magic hi/lo)
 *   - 4503599627370496.0 (packed 2x)    @VA 0x3caeb0  (uint64->double bias)
 *   - 10.0                              @VA 0x85d2c0  (log2->log1024 divisor)
 *   - 1.0                               @VA 0x3ca260  (ldexp mantissa)
 *   - units[5]                          @VA 0xa266b0  (" B",...," TB")
 */
export function bytesPrettyString(bytes: bigint | number): string {
  // Accept a Number for convenience; the FCP prototype is uint64.
  const b = typeof bytes === 'bigint' ? bytes : BigInt(bytes);
  if (b < 0n) {
    throw new Error(
      'HGLoggerUtils::bytesPrettyString @0x1acb40: negative bytes; FCP takes uint64',
    );
  }

  // Step 1: group index from log2.  @0x1acb56 testq / je 0x1acb8f
  let group: number;
  if (b === 0n) {
    group = 0; // @0x1acb8f xorl %eax, %eax
  } else {
    // uint64 -> double.  BigInt->Number preserves the value up to 2^53 exactly;
    // above that it rounds to nearest-even, which matches the FCP
    // punpckldq+subpd sequence (both are IEEE-754 round-to-nearest-even).
    const bAsDouble = Number(b);
    // @0x1acb7c _log2 ; @0x1acb81 divsd 10.0
    // @0x1acb89 cvttsd2si -> truncate toward zero to int32
    group = Math.trunc(Math.log2(bAsDouble) / 10);
  }

  // @0x1acb91 clamp: cmovll — keep 4 unless group<4, then use group.
  // For b>=1 group is always >= 0 (log2(1)/10 = 0), so no lower clamp needed.
  const groupIdx = group < 4 ? group : 4;

  // Step 2: mantissa = (float)b / 1024^groupIdx.
  //   @0x1acba1..@0x1acbc6: uint64 -> float. For b < 2^63 the direct
  //   cvtsi2ss branch runs; Number(BigInt) matches IEEE-754 round-to-nearest.
  //   @0x1acbcf..@0x1acbe8: ldexp(1.0, 10*group) then divsd, then cvtsd2ss.
  const bAsF32 = Math.fround(Number(b));
  const divisor = Math.pow(2, 10 * groupIdx); // ldexp(1.0, 10*group) = 2^(10g)
  const mantissa = Math.fround(bAsF32 / divisor);

  // Step 3: stream mantissa (as float, default C++ ostream precision=6) + unit.
  //   Emulates: std::ostringstream os; os << (float)mantissa << units[groupIdx];
  //   return os.str();
  return formatFloatDefault(mantissa) + BYTES_UNITS[groupIdx];
}

// -----------------------------------------------------------------------------
// HGLoggerUtils::timePrettyString(unsigned long long)  @0x1acd40
// -----------------------------------------------------------------------------
//
// ASM shape (Helium @0x1acd40 .. @0x1acf29):
//   Same uint64->double magic (0x4530000043300000 / bias) at @0x1acd60/@0x1acd68.
//   Then: _log10 (stub 0x3c53f0) @0x1acd7c ; cvttsd2si -> eax @0x1acd81.
//   Signed div-by-3 by mul-hi with 0x55555556 (@0x1acd87..@0x1acd99):
//     imulq $0x55555556, %rax, %rax  ; movq %rax, %rcx
//     shrq $0x3f, %rcx               ; shrq $0x20, %rax
//     addl %ecx, %eax                -> eax = floor(log10(x)/3) (signed).
//   Clamp:    @0x1acd9f cmpl $0x3, %eax ; cmovll -> groupIdx = min(eax, 3).
//   uint64->float, same branch as bytesPrettyString (@0x1acdac..@0x1acdd8).
//   Divisor:  eax = 3*groupIdx via leal (%r15,%r15,2), %eax  @0x1acddd
//             xmm0 = (double)eax                             @0x1acde4
//             ___exp10                                        @0x1acde8 (stub @0x3c501e)
//             mantissa = f32 / 10^(3g), cvtsd2ss.
//   Then same ostringstream<<(float)+units and return.
//
// Units array is at VA 0xa266e0 (4 slots): " ns", " us", " ms", " sec".
// Nanoseconds is the input scale; groups are ns, µs, ms, s (each ×1000).

/** units table @VA 0xa266e0 — see HGLoggerUtils::timePrettyString @0x1ace56 */
const TIME_UNITS: readonly string[] = [' ns', ' us', ' ms', ' sec'];

/**
 * HGLoggerUtils::timePrettyString(uint64) @0x1acd40
 *
 * Formats a nanosecond count as a human string: e.g. `1500000` -> `"1.5 ms"`.
 *
 * Algorithm (mirrors the FCP asm):
 *   1. If nanos==0, groupIdx=0. Else groupIdx = trunc(log10((double)nanos))/3,
 *      then clamped to <= 3.  Groups: 0=ns, 1=us, 2=ms, 3=sec.
 *   2. mantissa (float) = (float)nanos / 10^(3*groupIdx).
 *   3. Format `<mantissa><units[groupIdx]>` with default ostream precision.
 *
 * Callees:
 *   - _log10   (stub @0x3c53f0)
 *   - ___exp10 (stub @0x3c501e)
 * Constants: same magic as bytesPrettyString (uint64->double); units @VA 0xa266e0.
 */
export function timePrettyString(nanos: bigint | number): string {
  const n = typeof nanos === 'bigint' ? nanos : BigInt(nanos);
  if (n < 0n) {
    throw new Error(
      'HGLoggerUtils::timePrettyString @0x1acd40: negative time; FCP takes uint64',
    );
  }

  // @0x1acd56 testq / je 0x1acd9d
  let group: number;
  if (n === 0n) {
    group = 0;
  } else {
    const nAsDouble = Number(n);
    // @0x1acd7c _log10 ; @0x1acd81 cvttsd2si -> eax  (truncate toward zero)
    const l10 = Math.trunc(Math.log10(nAsDouble));
    // @0x1acd87..@0x1acd99 signed division by 3 (mul-hi 0x55555556 + shifts).
    // For non-negative l10 this is exactly Math.trunc(l10 / 3).  For very
    // small inputs (n==0 handled above) l10 is never negative here since
    // n >= 1 -> log10(n) >= 0, so cvttsd2si gives >= 0.
    group = Math.trunc(l10 / 3);
  }

  // @0x1acd9f cmovll clamp: min(group, 3).
  const groupIdx = group < 3 ? group : 3;

  // uint64->float (same trick as bytesPrettyString).
  const nAsF32 = Math.fround(Number(n));
  // divisor = 10^(3*groupIdx).  @0x1acde8 ___exp10((double)(3*group)).
  const divisor = Math.pow(10, 3 * groupIdx);
  const mantissa = Math.fround(nAsF32 / divisor);

  return formatFloatDefault(mantissa) + TIME_UNITS[groupIdx];
}

// -----------------------------------------------------------------------------
// HGLoggerUtils::matrixPrettyString(double const*, int, int, string const&, string const&)
//     @0x1acf50
// HGLoggerUtils::matrixPrettyString(float  const*, int, int, string const&, string const&)
//     @0x1ad3d0
// -----------------------------------------------------------------------------
//
// Both bodies are thin trampolines to the free templated helper
//   MatrixPrettyString<T>(T const*, int, int, string const&, string const&)
// (mangled __Z18MatrixPrettyStringI{d,f}E...).
//
// Double overload asm (13 lines, @0x1acf50..@0x1acf67):
//   pushq %rbp ; movq %rsp, %rbp ; pushq %rbx ; pushq %rax
//   movq  %rdi, %rbx                             ; save NRVO out ptr
//   callq __Z18MatrixPrettyStringId... (@0x1acf59)  ; forward to template
//   movq  %rbx, %rax ; addq $8, %rsp ; popq %rbx ; popq %rbp ; retq
//
// The float overload at @0x1ad3d0 is identical in shape, calling
// __Z18MatrixPrettyStringIfE... .
//
// The free template body is NOT yet transcribed (frontier). We surface these
// class methods as calling into it, and throw with the @0xADDR of the
// un-decoded callee so a future worker can wire it up.

/** @see HGLoggerUtils::matrixPrettyString<double>  @0x1acf50 (tail-calls @0x1acf59) */
export function matrixPrettyStringD(
  _values: Float64Array | ReadonlyArray<number>,
  _rows: number,
  _cols: number,
  _prefix: string,
  _suffix: string,
): string {
  // Delegates to MatrixPrettyString<double> — free template not yet transcribed.
  throw new Error(
    'HGLoggerUtils::matrixPrettyString<double> @0x1acf50: MatrixPrettyString<double> free template @0x1acf59 not yet transcribed',
  );
}

/** @see HGLoggerUtils::matrixPrettyString<float>  @0x1ad3d0 (tail-calls MatrixPrettyString<float>) */
export function matrixPrettyStringF(
  _values: Float32Array | ReadonlyArray<number>,
  _rows: number,
  _cols: number,
  _prefix: string,
  _suffix: string,
): string {
  // Delegates to MatrixPrettyString<float> — free template not yet transcribed.
  throw new Error(
    'HGLoggerUtils::matrixPrettyString<float> @0x1ad3d0: MatrixPrettyString<float> free template not yet transcribed',
  );
}

// -----------------------------------------------------------------------------
// C++ default ostream float formatting.
// -----------------------------------------------------------------------------
//
// The FCP disasm at @0x1acc16 does:
//   movl $0xfffffefb, %edx    ; mask = clear floatfield bits (fixed|scientific)
//   andl -0x120(%rbp,%rcx), %edx
//   orl  $0x4, %edx           ; sets basefield = dec (bit 0x4 in fmtflags)
//   movq $0x1, -0x118(%rbp,%rax)   ; sets width=1 (reset after operator<<)
// It does NOT touch precision (default 6) and does NOT set fixed/scientific,
// so `operator<<(ostream&, float)` uses libc++ num_put default formatting.
//
// Rules of libc++ default float output (C locale):
//   - precision = 6 significant digits
//   - trailing zeros after decimal point are stripped when neither fixed nor
//     scientific is set
//   - values with magnitude in [1e-4, 1e6) print in fixed form; outside, scientific.
//
// For byte/time formatting the mantissa is clamped to [0, 1024) or [0, 1000)
// respectively, so it's always in the fixed-form range.
function formatFloatDefault(x: number): string {
  // 6 significant digits, mirroring libc++ default precision.
  const s = x.toPrecision(6);
  // Strip trailing zeros in the fractional part (C++ default doesn't emit
  // them unless showpoint or fixed is set — neither is here).
  if (s.indexOf('.') >= 0 && s.indexOf('e') < 0 && s.indexOf('E') < 0) {
    return s.replace(/\.?0+$/, '');
  }
  return s;
}
