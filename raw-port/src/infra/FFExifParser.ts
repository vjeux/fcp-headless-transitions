// FFExifParser.ts — Flexo FFExifParser (Objective-C class-methods-only helper).
//
// Two class methods that read the EXIF "DateTimeOriginal" and "OffsetTimeOriginal"
// fields from an NSDictionary of image metadata and return a real NSDate. Pure
// text-decode math: date-string parsing (yyyy:MM:dd HH:mm:ss) plus a
// ±HH:MM offset parser. No AppKit, no UI plumbing — this is legitimate
// data-decode math (byte-level EXIF timestamp resolution).
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Flexo.framework/Versions/A/Flexo (x86_64 slice).
// Disasm saved: raw-port/re/disasm/Flexo.FFExifParser.dateTimeOriginalFromMetadata.s
//               raw-port/re/disasm/Flexo.FFExifParser.secondsFromOffsetString.s
//
// Symbols:
//   +[FFExifParser dateTimeOriginalFromMetadata:]   @0x397700
//   +[FFExifParser secondsFromOffsetString:]        @0x397860
//
// Selrefs/cfstrings resolved via chained-fixups + __cfstring layout on the
// thin x86_64 binary (see /tmp/build_selref_map.py output during porting).

// ---- tiny stand-in ObjC surface -------------------------------------------
//
// The FCP binary calls NSDictionary.objectForKey:, NSString.length /
// hasPrefix: / substringFromIndex: / componentsSeparatedByString: /
// isEqualToString: / integerValue, NSDateFormatter, NSTimeZone, and NSDate.
// The port replicates the OBSERVABLE BEHAVIOUR of those calls in plain TS —
// this is a pure text-parse; the only side effect is producing a Date.
//
// SENTINEL: matches the assembly's `movabsq $0x7fffffffffffffff, %rbx`
// initial value + returns. Cited: @0x397874, @0x3977ca. Int64 max fits in a
// plain number (2^63-1 ≈ 9.22e18) so we return `Number.MAX_SAFE_INTEGER`
// only where it's ever compared — the ONLY consumer,
// dateTimeOriginalFromMetadata, compares against this same constant, so we
// carry it as a distinguishable "invalid" marker without needing bigint.
export const FF_EXIF_INVALID_OFFSET_SECONDS = 0x7fffffffffffffff; // @0x397874, @0x3977ca

/**
 * Metadata dictionary shape accepted by the parser. The FCP call sites feed
 * this from `CGImageSourceCopyPropertiesAtIndex` results, whose Exif dict
 * values are either NSString (for the timestamp / offset strings) or NSDate
 * (for pre-parsed timestamps). We model both.
 */
export type FFExifMetadata = Readonly<{ [key: string]: string | Date | undefined | null | unknown }>;

// -----------------------------------------------------------------------------
// +[FFExifParser secondsFromOffsetString:]                              @0x397860
// -----------------------------------------------------------------------------
//
// Parses an EXIF `OffsetTimeOriginal` string of the form "+HH:MM" / "-HH:MM"
// and returns the signed offset in seconds. On any format failure returns
// `FF_EXIF_INVALID_OFFSET_SECONDS` (the same INT64_MAX sentinel the FCP
// function returns).
//
// Assembly walk (single line per branch, addresses cited):
//   @0x397874  rbx = 0x7FFFFFFFFFFFFFFF               (sentinel — the default return)
//   @0x39788e  if [str length] != 6      -> return rbx
//   @0x3978b2  rcx = -1                              (initial "sign" = negative)
//   @0x3978bb  if [str hasPrefix:@"-"]              -> jmp 0x3978dd  (sign already -1)
//   @0x3978c4  else if [str hasPrefix:@"+"]         -> rcx = 1, jmp 0x3978dd
//              else -> return rbx (INT64_MAX)
//   @0x3978dd  save sign at -0x38(%rbp) (spilled)
//   @0x3978e1  sub = [str substringFromIndex:1]                          (5-char remainder)
//   @0x3978fa  parts = [sub componentsSeparatedByString:@":"]
//   @0x397918  if [parts count] != 2                -> return rbx
//   @0x397928  hStr = [parts objectAtIndex:0]
//   @0x397942  mStr = [parts objectAtIndex:1]
//   @0x397953  if [hStr length] != 2                -> return rbx
//   @0x397973  if [mStr length] != 2                -> return rbx
//   @0x39797f  h   = [hStr integerValue]  (NSInteger)
//   @0x397996  if h < 0 (signed)                    -> return rbx
//   @0x3979a1  m   = [mStr integerValue]
//   @0x3979aa  if m < 0                             -> return rbx
//   @0x3979ac  total_s = h * 3600 + m * 60            (imulq $0xe10 / $0x3c, addq)
//   @0x3979ba  if total_s != 0                      -> jmp @0x3979f1 (sign multiply)
//              else — check literal "+00:00" / "-00:00":
//   @0x3979d0  if [str isEqualToString:@"+00:00"]   -> fall through (total_s stays 0)
//   @0x3979e7  else if [str isEqualToString:@"-00:00"] -> fall through
//              else                                 -> return rbx (reject e.g. weird whitespace)
//   @0x3979f1  rbx = total_s * sign                   (imulq -0x38(%rbp), %r12; mov r12->rbx)
//   @0x3979f9  return rbx
//
// The sentinel-vs-zero-vs-nonzero pathway is transcribed line-for-line: we do
// NOT collapse the "explicit +00:00 / -00:00 accept" branch, because a valid
// signed-zero offset is materially different from "unparsable" — FCP callers
// downstream distinguish them (see setTimeZone check in
// dateTimeOriginalFromMetadata below).
export function FFExifParser_secondsFromOffsetString(str: string | null | undefined): number {
  // @0x397874
  const invalid = FF_EXIF_INVALID_OFFSET_SECONDS;

  // @0x39788e — cmpq $0x6, %rax (length check)
  if (typeof str !== "string" || str.length !== 6) return invalid;

  // @0x3978b2..@0x3978d7 — sign selection.
  //   default rcx=-1 (from movq $-0x1); if hasPrefix "-" -> keep -1;
  //   else if hasPrefix "+" -> rcx=+1; else -> return invalid.
  let sign: number;
  if (str.startsWith("-")) {              // hasPrefix:@"-"   selref @0x3978a9
    sign = -1;
  } else if (str.startsWith("+")) {       // hasPrefix:@"+"   selref @0x3978ca
    sign = 1;
  } else {
    return invalid;
  }

  // @0x3978e1 — [str substringFromIndex:1]
  const sub = str.substring(1);

  // @0x3978fa — [sub componentsSeparatedByString:@":"]
  const parts = sub.split(":");
  // @0x397918 — cmpq $0x2, %rax  ; jne 0x3979f9
  if (parts.length !== 2) return invalid;

  // @0x397928, @0x397942 — objectAtIndex:0 / :1
  const hStr = parts[0];
  const mStr = parts[1];

  // @0x397953..@0x397979 — both parts must be length 2 (two-digit fields).
  if (hStr.length !== 2) return invalid;
  if (mStr.length !== 2) return invalid;

  // @0x39797f, @0x3979a1 — [NSString integerValue].
  // NSString.integerValue skips leading whitespace, accepts an optional sign,
  // parses decimal digits, and returns 0 on no-digits. That maps to
  // parseInt(s, 10) for our 2-char digit-only strings — but we still branch on
  // the raw result the way the assembly does (js<0 tests).
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);

  // @0x397996 — testq %rax,%rax ; js 0x3979f9 (NSInteger < 0 rejected)
  //   NB: NaN from parseInt is NOT < 0, so we must reject it explicitly to
  //   preserve the "NSString.integerValue returns 0 for garbage, but total==0
  //   then falls into the +00:00/-00:00 branch" behaviour. parseInt on a
  //   non-digit 2-char string returns NaN in JS, whereas NSString would
  //   return 0. Match NSString exactly: coerce NaN -> 0, and let the
  //   downstream "+00:00"/"-00:00" gate decide accept/reject.
  const hNs = Number.isFinite(h) ? h : 0;
  const mNs = Number.isFinite(m) ? m : 0;
  if (hNs < 0) return invalid;
  if (mNs < 0) return invalid;

  // @0x3979ac — imulq $0xe10 (3600) ; @0x3979b3 imulq $0x3c (60) ; @0x3979b7 addq
  const totalS = hNs * 3600 + mNs * 60;

  // @0x3979ba — jne 0x3979f1  (nonzero: skip literal-check, go straight to sign mul)
  if (totalS !== 0) {
    // @0x3979f1 — imulq -0x38(%rbp), %r12  ; movq %r12, %rbx
    return sign * totalS;
  }

  // totalS == 0 — only accept if the ORIGINAL string is exactly "+00:00" or
  // "-00:00" (the FCP assembly explicitly re-checks the input, presumably to
  // reject e.g. "-0:00" or " 0:00 " that NSString.integerValue would happily
  // parse to zero).
  // @0x3979d0 selref isEqualToString:  @0x3979c3 cfstr "+00:00"
  // @0x3979e7 selref isEqualToString:  @0x3979da cfstr "-00:00"
  if (str === "+00:00" || str === "-00:00") {
    return sign * 0; // 0 either way — but keeps the shape identical to disasm.
  }
  return invalid;
}

// -----------------------------------------------------------------------------
// +[FFExifParser dateTimeOriginalFromMetadata:]                          @0x397700
// -----------------------------------------------------------------------------
//
// Reads @"{Exif}.DateTimeOriginal" from a metadata dictionary and returns
// the resulting NSDate. Fields:
//   - If missing / nil -> return nil.
//   - If NOT NSString but IS NSDate -> return it verbatim (short-circuit).
//   - If NOT NSString and NOT NSDate -> return nil.
//   - Otherwise: build an NSDateFormatter with pattern "yyyy:MM:dd HH:mm:ss"
//     and, if @"{Exif}.OffsetTimeOriginal" is present AND parses successfully,
//     configure the formatter's timeZone. Return -[formatter dateFromString:].
//
// Assembly walk:
//   @0x397725  dt = [meta objectForKey:@"{Exif}.DateTimeOriginal"]
//   @0x39772e  if dt == nil                          -> return nil
//   @0x39773e  cls = objc_opt_class(NSString)
//   @0x397749  if !objc_opt_isKindOfClass(dt, NSString) -> branch to NSDate check @0x397822
//   @0x39775d  fmt = [[NSDateFormatter alloc] init]
//   @0x39777d  [fmt setDateFormat:@"yyyy:MM:dd HH:mm:ss"]
//   @0x39778d  off = [meta objectForKey:@"{Exif}.OffsetTimeOriginal"]
//   @0x397793  if off == nil                         -> jmp @0x3977fd (skip TZ)
//   @0x39779f  cls = objc_opt_class(NSString)
//   @0x3977aa  if !isKindOfClass(off, NSString)      -> jmp @0x3977fd (skip TZ)
//   @0x3977c4  secs = +[FFExifParser secondsFromOffsetString:off]
//   @0x3977d4  if secs == 0x7FFFFFFFFFFFFFFF         -> jmp @0x3977fd (skip TZ)
//   @0x3977ea  tz   = +[NSTimeZone timeZoneForSecondsFromGMT:secs]
//   @0x3977fa  [fmt setTimeZone:tz]
//   @0x3977fd: result = [fmt dateFromString:dt]
//   @0x397816  release fmt
//   @0x39781c  return result
//   @0x397822  (NSDate branch) if isKindOfClass(dt, NSDate) return dt, else return nil
//
// One subtle behaviour we preserve: the "not-a-string-but-is-a-date"
// short-circuit does NOT touch the offset field — the formatter is never
// constructed. This matches FCP.
export function FFExifParser_dateTimeOriginalFromMetadata(meta: FFExifMetadata | null | undefined): Date | null {
  // @0x39772e
  if (meta == null) return null;

  // @0x397725 — [meta objectForKey:@"{Exif}.DateTimeOriginal"]
  const dt = meta["{Exif}.DateTimeOriginal"];
  if (dt == null) return null; // @0x39772e — testq/rax je

  // @0x397749 — kind-of-NSString check. If dt is already a Date instance we
  // take the NSDate short-circuit branch @0x397822.
  if (typeof dt !== "string") {
    // @0x397822..@0x39783d — objc_opt_isKindOfClass(dt, NSDate); returns dt
    // if true, nil otherwise.
    return dt instanceof Date ? dt : null;
  }

  // @0x39777d — [NSDateFormatter setDateFormat:@"yyyy:MM:dd HH:mm:ss"]
  const dateFormat = "yyyy:MM:dd HH:mm:ss"; // cfstr @0x1948128
  //
  // We build a UTC-anchored parser; a real NSDateFormatter defaults to the
  // system time zone, but the FCP path always overrides via setTimeZone
  // (see below). To preserve the "override wins, default is local" contract,
  // we track the effective time zone offset explicitly:
  //  - default: use the host's LOCAL time zone at that wall-clock instant
  //    (mirrors NSDateFormatter's default timeZone).
  //  - if a valid @"{Exif}.OffsetTimeOriginal" exists: use that offset.
  //
  // (The NSDateFormatter object itself is not exposed to callers — its only
  // effect on the return value is the timeZone it uses to interpret the
  // wall-clock timestamp.)
  let tzOffsetSeconds: number | null = null; // null means "use local"

  // @0x39778d — objectForKey:@"{Exif}.OffsetTimeOriginal"
  const off = meta["{Exif}.OffsetTimeOriginal"];
  if (off != null && typeof off === "string") {
    // @0x3977c4 — +[FFExifParser secondsFromOffsetString:off]
    const secs = FFExifParser_secondsFromOffsetString(off);
    // @0x3977d4 — cmpq %rcx (INT64_MAX), %rax ; je skip
    if (secs !== FF_EXIF_INVALID_OFFSET_SECONDS) {
      // @0x3977ea — [NSTimeZone timeZoneForSecondsFromGMT:secs]
      // @0x3977fa — [fmt setTimeZone:tz]
      tzOffsetSeconds = secs;
    }
  }

  // @0x3977fd — [fmt dateFromString:dt].
  return parseExifDateTime(dt, dateFormat, tzOffsetSeconds);
}

/**
 * Parses an EXIF date-time string using the fixed pattern
 * `yyyy:MM:dd HH:mm:ss`. If tzOffsetSeconds is null the string is
 * interpreted in the host's local time zone (matching an NSDateFormatter
 * with its default timeZone); otherwise the string is interpreted in the
 * fixed GMT offset the caller supplied.
 *
 * The pattern is `yyyy:MM:dd HH:mm:ss` — five colon-separated numeric parts
 * (year, month, day, hour, minute, second) — the only date format FCP hands
 * to NSDateFormatter here (@0x39776c cfstr "yyyy:MM:dd HH:mm:ss").
 * NSDateFormatter returns nil for input that doesn't match the pattern; we
 * return null.
 */
function parseExifDateTime(s: string, _dateFormat: string, tzOffsetSeconds: number | null): Date | null {
  // Format: "yyyy:MM:dd HH:mm:ss" — 19 chars, colons at 4,7,13,16, space at 10.
  if (s.length !== 19) return null;
  if (s[4] !== ":" || s[7] !== ":" || s[10] !== " " || s[13] !== ":" || s[16] !== ":") return null;
  const y = Number(s.substring(0, 4));
  const mo = Number(s.substring(5, 7));
  const d = Number(s.substring(8, 10));
  const h = Number(s.substring(11, 13));
  const mi = Number(s.substring(14, 16));
  const se = Number(s.substring(17, 19));
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d)) return null;
  if (!Number.isFinite(h) || !Number.isFinite(mi) || !Number.isFinite(se)) return null;
  // Range-check the way NSDateFormatter would reject (setLenient:NO by default).
  if (mo < 1 || mo > 12) return null;
  if (d < 1 || d > 31) return null;
  if (h < 0 || h > 23) return null;
  if (mi < 0 || mi > 59) return null;
  if (se < 0 || se > 60) return null; // NSDateFormatter accepts leap-second 60.

  if (tzOffsetSeconds === null) {
    // Local time — Date constructor with (Y,M-1,D,h,m,s) interprets in local TZ.
    const dt = new Date(y, mo - 1, d, h, mi, se);
    // NSDateFormatter rejects mismatched fields (e.g. Feb 30) — Date happily
    // rolls over. Detect and reject.
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
    if (dt.getHours() !== h || dt.getMinutes() !== mi || dt.getSeconds() !== Math.min(se, 59)) return null;
    return dt;
  }

  // Fixed GMT offset: build a UTC instant then shift.
  const utcMs = Date.UTC(y, mo - 1, d, h, mi, se);
  if (!Number.isFinite(utcMs)) return null;
  // Validate no rollover (Date.UTC accepts out-of-range and normalizes).
  const check = new Date(utcMs);
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== d) return null;
  if (check.getUTCHours() !== h || check.getUTCMinutes() !== mi || check.getUTCSeconds() !== Math.min(se, 59)) return null;
  // Subtract the tz offset — a "+05:00" string represents a wall-clock time
  // that is 5h AHEAD of UTC, so the corresponding UTC instant is 5h EARLIER.
  return new Date(utcMs - tzOffsetSeconds * 1000);
}
