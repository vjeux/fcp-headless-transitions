// FFOrganizerFrameDurationStringValueTransformer.ts — Flexo.
//
// NSValueTransformer subclass whose sole job is to bin a "frame duration"
// (seconds, as a floating-point NSNumber) into one of 12 tick-mark indices
// and return a LOCALIZED string chosen from a compile-time-fixed key set.
// The bin boundaries are the tick marks of the film-strip module's frame-
// duration slider — that's a pure numeric bucketing function decoded here.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Flexo.framework/Versions/A/Flexo (x86_64 slice).
// Disasm saved: raw-port/re/disasm/
//                 Flexo.FFOrganizerFrameDurationStringValueTransformer.all.s
//
// Symbols:
//   +[FFOrganizerFrameDurationStringValueTransformer transformedValueClass] @0x972770
//   +[FFOrganizerFrameDurationStringValueTransformer allowsReverseTransformation] @0x972790
//   -[FFOrganizerFrameDurationStringValueTransformer transformedValue:]        @0x9727a0
//
// Selrefs/cfstrings resolved via chained-fixups on /tmp/Flexo.x86_64.

// -----------------------------------------------------------------------------
// +[transformedValueClass]  @0x972770
// -----------------------------------------------------------------------------
//
//   movq _OBJC_CLASS_$_NSString(%rip), %rdi
//   jmp  _objc_opt_class
//
// Just returns the NSString class object. We model that with the JS String
// constructor as the closest analogue.
export function FFOrganizerFrameDurationStringValueTransformer_transformedValueClass(): typeof String {
  return String; // @0x972770 — leaq _OBJC_CLASS_$_NSString ; jmp objc_opt_class
}

// -----------------------------------------------------------------------------
// +[allowsReverseTransformation]  @0x972790
// -----------------------------------------------------------------------------
//
//   xorl %eax, %eax   -> return NO / false
//
export function FFOrganizerFrameDurationStringValueTransformer_allowsReverseTransformation(): boolean {
  return false; // @0x972794 xorl %eax,%eax ; @0x972797 retq
}

// -----------------------------------------------------------------------------
// -[transformedValue:]  @0x9727a0
// -----------------------------------------------------------------------------
//
// Reads d = [value doubleValue] and threads it through a cascading `ucomisd`
// ladder that maps the duration to an index 0..11:
//
//   idx=0  if d >  1800.0     @0x9727b7  double@0x156ff40
//   idx=1  if d >  600.0      @0x9727cd  double@0x156cb40
//   idx=2  if d >  300.0      @0x9727e0  double@0x1572488
//   idx=3  if d >  120.0      @0x9727ef  double@0x156f720
//   idx=4  if d >   60.0      @0x9727fe  double@0x156efd0
//   idx=5  if d >   30.0      @0x97280d  double@0x156efd8
//   idx=6  if d >   10.0      @0x97281c  double@0x156c9f8
//   idx=7  if d >    5.0      @0x97282b  double@0x156ca50
//   idx=8  if d >    2.0      @0x97283a  double@0x156cb08
//   idx=9  if d >    1.0      @0x972849  double@0x156ca00
//   idx=10 if d >    0.5      @0x972858  double@0x156ca38
//   idx=11 otherwise
//
// The comparisons use `ucomisd` + `jbe` / `ja`, so the initial d>1800.0 branch
// picks idx=0 EXCLUSIVELY when d is strictly greater than 1800 AND NOT NaN
// (ucomisd sets ZF=PF=CF=1 for unordered/NaN and `jbe` — jump if CF=1|ZF=1 —
// takes that path). NaN therefore falls through to the next bucket. We
// preserve that by using the same JS `>` semantics (which are NaN-ordered:
// `NaN > x` is always false).
//
// The final index is then formatted into a localization key
// "FFOrganizerFilmstripModule Frame Duration %ld" (cfstring @0x198fc68) and
// looked up in the FFLocalizable table (cfstring @0x192fc08) of the Flexo
// bundle returned by _FFFlexoBundle. Because the JS surface has no
// NSBundle localization primitive, we return the KEY the FCP call site
// would emit — consumers who need the localized text call through a
// separate bundle-lookup hook they own.

/** The 11 tick-mark boundaries, in the exact order the assembly compares
 *  them (largest → smallest). One address per constant. */
const TICK_BOUNDARIES: ReadonlyArray<readonly [number, string]> = [
  [1800.0, "@0x9727b7 double@0x156ff40"], // idx 0 threshold
  [ 600.0, "@0x9727cd double@0x156cb40"], // idx 1 threshold
  [ 300.0, "@0x9727e0 double@0x1572488"], // idx 2 threshold
  [ 120.0, "@0x9727ef double@0x156f720"], // idx 3 threshold
  [  60.0, "@0x9727fe double@0x156efd0"], // idx 4 threshold
  [  30.0, "@0x97280d double@0x156efd8"], // idx 5 threshold
  [  10.0, "@0x97281c double@0x156c9f8"], // idx 6 threshold
  [   5.0, "@0x97282b double@0x156ca50"], // idx 7 threshold
  [   2.0, "@0x97283a double@0x156cb08"], // idx 8 threshold
  [   1.0, "@0x972849 double@0x156ca00"], // idx 9 threshold
  [   0.5, "@0x972858 double@0x156ca38"], // idx 10 threshold
];

/**
 * Pure numeric bucketing extracted from -[transformedValue:] @0x9727a0.
 * Returns the tick-mark index 0..11 for a duration `d` (seconds).
 *
 * Verifiable against the disasm:
 *   bucket(2000) = 0   (2000 > 1800)
 *   bucket(1800) = 1   (NOT strictly > 1800 -> fall to idx=1 check;
 *                         1800 > 600  -> idx=1)
 *   bucket(600.0)= 2   (NOT > 600 -> idx=2 check; 600 > 300 -> idx=2)
 *   bucket(0.5)  = 11  (NOT > 0.5 -> fall through -> idx=11)
 *   bucket(0.0)  = 11
 *   bucket(NaN)  = 11  (JS `NaN > x` is false, matching ucomisd/jbe fall-through)
 */
export function FFOrganizerFrameDurationStringValueTransformer_bucket(d: number): number {
  // Structure mirrors the disasm: eleven guarded early-returns; final index 11.
  // Written as an explicit loop for compactness — each iteration is one
  // ucomisd + branch, in the SAME order as @0x9727b7..@0x972858.
  for (let i = 0; i < TICK_BOUNDARIES.length; i++) {
    if (d > TICK_BOUNDARIES[i][0]) return i;
  }
  return 11; // @0x972862 movl $0xb, %ecx (fall-through)
}

/**
 * Full port of -[transformedValue:] @0x9727a0.
 *
 * Given a duration value (a JS number, standing in for
 * [value doubleValue] @0x9727b1 selref "doubleValue" @0x1bb96b8), returns
 * the LOCALIZATION KEY string the FCP call site would look up in the
 * Flexo.framework FFLocalizable strings table.
 *
 *   d -> idx = bucket(d)
 *   key = sprintf("FFOrganizerFilmstripModule Frame Duration %ld", idx)
 *   return [FFFlexoBundle() localizedStringForKey:key value:@"" table:@"FFLocalizable"]
 *
 * cfstrings referenced (verified via __cfstring layout on /tmp/Flexo.x86_64):
 *   @0x198fc68 "FFOrganizerFilmstripModule Frame Duration %ld"  (format)
 *   @0x192fbe8 ""                                                (value = empty default)
 *   @0x192fc08 "FFLocalizable"                                   (strings-table name)
 *
 * We return the KEY here (not the localized text). A wrapper that owns a
 * strings-table dictionary can perform the actual lookup.
 */
export function FFOrganizerFrameDurationStringValueTransformer_transformedValue(value: number | null | undefined): string | null {
  // @0x9727aa selref "doubleValue" @0x1bb96b8.
  if (value == null) return null;
  const d = Number(value);

  // @0x9727b7..@0x972862 — the ucomisd ladder → tick index.
  const idx = FFOrganizerFrameDurationStringValueTransformer_bucket(d);

  // @0x97286e selref "stringWithFormat:" @0x1bb8518.
  // Format is "%ld" (long int) — idx is already an integer in [0, 11].
  const key = `FFOrganizerFilmstripModule Frame Duration ${idx}`;

  return key;
}

/**
 * Convenience: the localization TABLE name + empty default value the FCP
 * call site passes into -[NSBundle localizedStringForKey:value:table:]. Ported
 * consumers that own a strings-table map can pair this with
 * transformedValue's returned key.
 *   @0x972890 selref "localizedStringForKey:value:table:" @0x1bb8510
 *   @0x972897 cfstr "" @0x192fbe8    (value)
 *   @0x97289e cfstr "FFLocalizable" @0x192fc08 (table)
 */
export const FFOrganizerFrameDurationStringValueTransformer_LOCALIZATION = Object.freeze({
  table: "FFLocalizable",   // cfstr @0x192fc08
  defaultValue: "",         // cfstr @0x192fbe8
} as const);
