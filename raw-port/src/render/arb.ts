// arb.ts — Helium's `arb` namespace: the ARB-assembly shader text emitter /
// scanner used by HGShaderBinding when Helium writes GPU programs out as ARB
// vertex/fragment program source.  Every function in the namespace has
// INTERNAL linkage (`nm` shows them as `t`, and the mangled names carry the
// `L` internal-linkage marker), so this file is the translation unit's
// TypeScript image, keyed by the namespace exactly as the ledger keys it.
//
// Transcribed from the x86_64 disassembly of Helium in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
// Versions/A/Helium.
//
// PROVENANCE / DECODE:
//   raw-port/re/disasm/Helium.__ZN3arbL4achrEPKcc.s   (arb::achr, ported here)
//   raw-port/re/disasm/Helium.__ZN3arbL4aidxEPKcPjS2_.s (arb::aidx, ported here)
//
// SYMBOLS PORTED IN THIS FILE
//   0x000d35b0 t __ZN3arbL4achrEPKcc      arb::achr(char const*, char)
//   0x000d30a0 t __ZN3arbL4aidxEPKcPjS2_  arb::aidx(char const*, unsigned int*,
//                                                   unsigned int*)
//
// SIBLING SYMBOLS IN THE SAME NAMESPACE (each its own ledger unit — still
// `todo`, deliberately NOT written here):
//   0x000ae020 t arb::atok(char const*)
//   0x000b3340 t arb::end(string_t&, HGLimits const&, HGString::Hash const&, bool)
//   0x000bd500 t arb::begin(string_t&, HGLimits const&, HGLimits const&)
//   0x000bdbd0 t arb::write(string_t&, HGShaderBinding const*, ...)
//   0x000c6dc0 t arb::undo(string_t&)
//   0x000d2280 t arb::isunpremult(arb::object_t*, char const*, char const*)
//   0x000d40c0 t arb::alen(char const*, bool, bool)
//   0x000d4430 t arb::obj_declare(...)
//   0x000d5640 t arb::ascan(char const**, unsigned long, char const*, bool)
//   0x000d6270 t arb::acpy(char*, char const*, unsigned long)
//   0x000d6340 t arb::asymbol(char const*, char const*&, unsigned long&)
//   0x000d6c80 t arb::isidentity(char const*, char const*, unsigned long, char const*, int)
//   0x000d6d30 t arb::obj_search(arb::object_t const*, char const*, unsigned long)
//   0x000d7020 t arb::atoi(char const*, int&)
//   0x000d7140 t arb::obj_write_op(...)
//   0x000d7a30 t arb::obj_write_dest(...)
//   0x000d8030 t arb::obj_write_symbol(...)
//   0x000d8db0 t arb::obj_write_ssat(...)
//
// FRONTIER CALLEES: none.  arb::achr and arb::aidx are both leaves — neither
// disassembly contains a `callq` or an indirect branch, only loads, compares
// and jumps.  `depgraph.py deps __ZN3arbL4aidxEPKcPjS2_` reports nothing at
// all (0 in-scope callees, 0 externs, 0 indirect), matching the listing.
//
// ── POINTER MODEL ────────────────────────────────────────────────────────
// `char const*` is modelled as a (Uint8Array, index) pair and the returned
// `char const*` as an index INTO THAT SAME array, with the C NULL return
// modelled as `null`.  The buffer must be NUL-terminated, exactly as the C
// contract requires: the disassembly's only loop terminator for the comment
// scanners is a zero byte, so a caller handing over an unterminated buffer
// would run off the end in the binary too.
//
// ── THE TWO BYTE CLASSES THE SCANNER USES ───────────────────────────────
// Both classes are computed the same way by the compiler — one `leal
// -0x21(%rcx),%edx` followed by an UNSIGNED byte compare of %dl.  Reading
// them with the AT&T `dst - src` rule (see PORTING_SPEC's cheat-sheet):
//
//   0xd35c1  cmpb $-0x20,%dl ; jb   -> taken iff (u8)(ch-0x21) <  0xe0
//   0xd35da  cmpb $-0x21,%dl ; ja   -> taken iff (u8)(ch-0x21) >  0xdf
//
// `(u8)(ch-0x21) >= 0xe0` is exactly `ch` in [0x01,0x20] — i.e. every ASCII
// control character plus the space.  That is this scanner's "skippable
// whitespace" class.  Note where the NUL lands: ch = 0 gives
// (u8)(0-0x21) = 0xdf, which is BELOW 0xe0, so a NUL is NOT whitespace and
// always falls out of the skip loops — that is how the loops terminate.
// The two predicates are complements over the byte range, so `jb` at
// 0xd35c4/0xd361f and `jae` at 0xd3670 select the identical set; the
// helpers below name the one class both of them test.
//
// ── WHAT achr DOES ───────────────────────────────────────────────────────
// "assembly char": assert that the next significant character of an ARB
// source line is `c`, and return a cursor positioned after it.
//   1. Skip whitespace and whole `#`-to-end-of-line comments.
//   2. The first significant byte must equal `c`; if not, return NULL.
//   3. Step past it, then skip whitespace and comments again, and return
//      the cursor at the next significant byte (or at the NUL).
//
// Two deliberate ASYMMETRIES between the pre-match and post-match comment
// scanners are preserved verbatim below, because they give different
// results at end-of-input:
//   * The PRE-match scanner @0xd35f0 tests `rdx[1]` for NUL and returns
//     NULL (0xd3674) when the input ends inside the leading comment run.
//   * The POST-match scanner @0xd3650 tests `*rax` for NUL and returns the
//     CURSOR (0xd3676) when the input ends inside the trailing comment run.
// The pre-match scanner also compares `*rdx` while the post-match scanner
// compares `*(rax-1)`, so they sit one byte apart in the newline test.

/** `'#'` — the ARB comment introducer, tested @0xd35df and @0xd363f. */
const ARB_COMMENT = 0x23;
/** `'\n'` — the comment terminator, tested @0xd35fc and @0xd365b. */
const ARB_NEWLINE = 0x0a;

/**
 * The skip class the scanner tests via `leal -0x21(%rcx),%edx` +
 * unsigned byte compare: bytes 0x01..0x20 (controls and space).
 *
 * `(u8)(ch - 0x21) >= 0xe0`, the NOT-taken side of `jb` @0xd35c4 / @0xd361f
 * and the taken side of `jae` @0xd3670.
 */
function arb_isSkippable(ch: number): boolean {
  return ((ch - 0x21) & 0xff) >= 0xe0;
}

/**
 * The loop-continuation form of the same class, from
 * `cmpb $-0x21,%dl ; ja` @0xd35da / @0xd363a: `(u8)(ch - 0x21) > 0xdf`.
 * Identical membership to {@link arb_isSkippable} — kept separate so each
 * compare in the disassembly maps to its own predicate.
 */
function arb_isSkippableLoop(ch: number): boolean {
  return ((ch - 0x21) & 0xff) > 0xdf;
}

/**
 * The decimal-digit class in the `jae`/`jb` form the compiler emits for the
 * FIRST digit of a run: `leal -0x3a(%rax),%ecx ; cmpb $-0xa,%cl ; jae`
 * @0xd3164/@0xd3167 (and its inverted `jb` twin @0xd32d5/@0xd32d9).
 *
 * Per the AT&T `dst - src` rule, `jae` (CF=0) is taken iff
 * `(u8)(ch - 0x3a) >= 0xf6`, i.e. `ch - 0x3a` wrapped into [-10,-1], i.e.
 * `ch` in [0x30,0x39] — exactly `'0'..'9'`.  NUL is NOT a digit
 * ((u8)(0-0x3a) = 0xc6 < 0xf6), which is how the digit runs terminate.
 */
function arb_isDigit(ch: number): boolean {
  return ((ch - 0x3a) & 0xff) >= 0xf6;
}

/**
 * The same digit class in the loop-continuation form the compiler emits for
 * the digit-accumulation back-edge: `leal -0x3a(%rax),%r8d ;
 * cmpb $-0xb,%r8b ; ja` @0xd31fd/@0xd3201 (and @0xd32f9/@0xd32fc for the
 * second integer).  `ja` (CF=0 & ZF=0) is taken iff
 * `(u8)(ch - 0x3a) > 0xf5` — identical membership to {@link arb_isDigit}.
 * Kept separate so each compare in the disassembly maps to its own predicate.
 */
function arb_isDigitLoop(ch: number): boolean {
  return ((ch - 0x3a) & 0xff) > 0xf5;
}

/**
 * arb::achr(char const*, char)  —  Helium @0xd35b0 (internal linkage).
 *
 * Faithful transcription of raw-port/re/disasm/Helium.__ZN3arbL4achrEPKcc.s.
 * Register map: %rdi/%rax = the cursor, %cl = the current byte, %sil = `c`,
 * %rdx = the comment scanner's own cursor (pre-match) or scratch.
 *
 *   0xd35b0  movzbl (%rdi), %ecx              ; cl = *s
 *   0xd35b3  testb  %cl, %cl
 *   0xd35b5  je     0xd3606                   ; empty string -> NULL (no frame)
 *   0xd35bb  movq   %rdi, %rax                ; p = s
 *  A:0xd35be  leal  -0x21(%rcx), %edx         ; whitespace test
 *   0xd35c4  jb     0xd35df                   ; not skippable -> C
 *  B:0xd35d0  movzbl 0x1(%rax), %ecx          ; skip-whitespace loop
 *   0xd35d4  incq   %rax
 *   0xd35dd  ja     0xd35d0
 *  C:0xd35df  cmpb  $0x23, %cl
 *   0xd35e2  jne    0xd3609                   ; not '#' -> E
 *  D:0xd35f0  movzbl 0x1(%rdx), %ecx          ; skip-comment loop
 *   0xd35f6  je     0xd3674                   ; input ends in comment -> NULL
 *   0xd35fc  cmpb   $0xa, (%rdx)
 *   0xd3602  jne    0xd35f0
 *   0xd3604  jmp    0xd35be                   ; past the newline -> A
 *  E:0xd3609  cmpb  %sil, %cl
 *   0xd360c  jne    0xd3674                   ; wrong character -> NULL
 *   0xd360e  movzbl 0x1(%rax), %ecx           ; step past the match
 *   0xd3612  incq   %rax
 *   0xd3617  je     0xd3676                   ; ended right after -> p
 *   0xd361f  jb     0xd363f                   ; whitespace test (same class)
 *  F:0xd3630  movzbl 0x1(%rax), %ecx          ; skip-whitespace loop
 *   0xd363d  ja     0xd3630
 *  G:0xd363f  cmpb  $0x23, %cl
 *   0xd3642  jne    0xd3676                   ; not '#' -> return p
 *   0xd3644  incq   %rax
 *  H:0xd3650  movzbl (%rax), %ecx             ; skip-comment loop
 *   0xd3655  je     0xd3676                   ; input ends in comment -> p
 *   0xd365b  cmpb   $0xa, -0x1(%rax)
 *   0xd3662  jne    0xd3650
 *   0xd3664  decq   %rdx                      ; back onto the byte just read
 *   0xd3670  jae    0xd3630                   ; whitespace -> F
 *   0xd3672  jmp    0xd363f                   ; else -> G
 *
 * The 0xd361f `jb`-to-G and 0xd3670 `jae`-to-F pair test the SAME byte
 * class from opposite sides and both converge on G, so the post-match
 * scanner is written below as one loop whose head is the whitespace skip
 * and whose body is the comment skip — the identical instruction set with
 * the two entry edges merged.
 *
 * @param s   NUL-terminated buffer holding the ARB source (%rdi's target).
 * @param sIndex cursor into `s` (the value of %rdi).
 * @param c   the byte that must appear next (%sil).
 * @returns index into `s` just past `c` and past any following whitespace /
 *          comments, or `null` for the C NULL return.
 */
export function arb_achr(
  s: Uint8Array,
  sIndex: number,
  c: number
): number | null {
  // 0xd35b0  movzbl (%rdi), %ecx
  let cl = s[sIndex];
  // 0xd35b3  testb %cl, %cl / 0xd35b5 je 0xd3606
  if (cl === 0) {
    // 0xd3606  xorl %eax, %eax ; retq   — returns before the frame is set up.
    return null;
  }
  // 0xd35bb  movq %rdi, %rax
  let p = sIndex;

  // ── A: skip whitespace + leading comments, up to the significant byte ──
  for (;;) {
    // 0xd35be  leal -0x21(%rcx), %edx / 0xd35c4 jb 0xd35df
    if (arb_isSkippable(cl)) {
      // B @0xd35d0 — advance while the byte stays in the skip class.
      do {
        cl = s[p + 1]; // 0xd35d0  movzbl 0x1(%rax), %ecx
        p = p + 1; //     0xd35d4  incq %rax
      } while (arb_isSkippableLoop(cl)); // 0xd35da/0xd35dd
    }
    // C @0xd35df  cmpb $0x23, %cl / jne 0xd3609
    if (cl !== ARB_COMMENT) break;

    // D @0xd35e4  movq %rax, %rdx — the comment scanner runs on its own cursor.
    let q = p;
    for (;;) {
      cl = s[q + 1]; // 0xd35f0  movzbl 0x1(%rdx), %ecx
      // 0xd35f4/0xd35f6 — the input ended inside the comment.
      if (cl === 0) {
        // 0xd3674  xorl %eax, %eax (falls into the 0xd3676 epilogue)
        return null;
      }
      // 0xd35fc  cmpb $0xa, (%rdx) — tested BEFORE %rdx advances.
      const atNewline = s[q] === ARB_NEWLINE;
      // 0xd35f8  leaq 0x1(%rdx), %rax / 0xd35ff movq %rax, %rdx
      q = q + 1;
      // 0xd3602  jne 0xd35f0
      if (atNewline) break;
    }
    // 0xd3604  jmp 0xd35be — %rax is the scanner's cursor; %cl is *%rax.
    p = q;
  }

  // ── E @0xd3609: the significant byte must be `c` ──
  // 0xd3609  cmpb %sil, %cl / 0xd360c jne 0xd3674
  if (cl !== c) return null;

  // 0xd360e  movzbl 0x1(%rax), %ecx / 0xd3612 incq %rax
  cl = s[p + 1];
  p = p + 1;
  // 0xd3615/0xd3617  je 0xd3676 — nothing after the match.
  if (cl === 0) return p;

  // ── F/G/H: skip trailing whitespace + comments and report the cursor ──
  for (;;) {
    // 0xd361f jb 0xd363f (first pass) and 0xd3670 jae 0xd3630 (later passes)
    // select the same byte class; both land here.
    if (arb_isSkippable(cl)) {
      // F @0xd3630
      do {
        cl = s[p + 1]; // 0xd3630  movzbl 0x1(%rax), %ecx
        p = p + 1; //     0xd3634  incq %rax
      } while (arb_isSkippableLoop(cl)); // 0xd3637/0xd363d
    }
    // G @0xd363f  cmpb $0x23, %cl / jne 0xd3676
    if (cl !== ARB_COMMENT) return p;

    // 0xd3644  incq %rax — step onto the byte after the '#'.
    p = p + 1;
    // H @0xd3650 — note this scanner reads *%rax and tests *(%rax-1),
    // one byte behind the pre-match scanner at D.
    for (;;) {
      cl = s[p]; // 0xd3650  movzbl (%rax), %ecx
      // 0xd3653/0xd3655 — input ended inside the trailing comment: unlike D
      // this returns the CURSOR, not NULL.
      if (cl === 0) return p;
      // 0xd365b  cmpb $0xa, -0x1(%rax)
      const prevWasNewline = s[p - 1] === ARB_NEWLINE;
      // 0xd3657  leaq 0x1(%rax), %rdx / 0xd365f movq %rdx, %rax
      p = p + 1;
      // 0xd3662  jne 0xd3650
      if (prevWasNewline) break;
    }
    // 0xd3664  decq %rdx / 0xd3667 movq %rdx, %rax — step back onto the
    // byte just loaded into %cl, so the class test below matches it.
    p = p - 1;
    // 0xd366a/0xd366d/0xd3670 — fall back into F or G; the loop head above
    // re-evaluates exactly that choice.
  }
}

/** `'['` — the index-open bracket, tested @0xd3102. */
const ARB_LBRACKET = 0x5b;
/** `']'` — the index-close bracket, tested @0xd31df. */
const ARB_RBRACKET = 0x5d;
/** `'.'` — the range separator; `..` is tested @0xd3268 and @0xd3271. */
const ARB_DOT = 0x2e;
/** `'0'` — subtracted from each digit char @0xd31f3 and @0xd32ef. */
const ARB_ZERO = 0x30;
/**
 * The "unbounded upper index" sentinel the binary materialises with
 * `movl $0xffffffff,%eax` @0xd3171 and @0xd3283 and stores through the
 * `hi` out-pointer @0xd3181.
 */
const ARB_IDX_UNBOUNDED = 0xffffffff;

/**
 * arb::aidx(char const* s, unsigned int* lo, unsigned int* hi)
 *   —  Helium @0xd30a0 (internal linkage, `__ZN3arbL4aidxEPKcPjS2_`).
 *
 * Faithful transcription of
 * raw-port/re/disasm/Helium.__ZN3arbL4aidxEPKcPjS2_.s (220 instructions).
 *
 * "assembly index": parse an ARB array subscript at `s` — after skipping
 * whitespace and `#`-to-end-of-line comments — in one of three forms, and
 * return a cursor just past the closing `]` (NULL on any failure):
 *
 *     [ n ]        ->  *lo = n,  *hi = n
 *     [ n .. m ]   ->  *lo = n,  *hi = m
 *     [ ]          ->  *lo = 0,  *hi = 0xffffffff   (requires hi != NULL)
 *
 * Both out-pointers are independently optional (`testq %rsi,%rsi`
 * @0xd3176/@0xd3253 and `testq %rdx,%rdx` @0xd316c/@0xd325a) — EXCEPT that
 * the empty-`[]` form bails to NULL when `hi` is NULL (@0xd316f).
 *
 * ── REGISTER MAP ────────────────────────────────────────────────────────
 *   %rdi = `s` cursor            -> `p`
 *   %rsi = `lo` out-pointer      -> `lo`   (reused as a scratch BYTE from
 *                                   @0xd327b onward, once *lo is already
 *                                   written — that dead alias is `ch2` here)
 *   %rdx = `hi` out-pointer      -> `hi`   (reused as scratch from @0xd318c
 *                                   onward, likewise after its last store)
 *   %rax = return cursor (0 == NULL) and, on the @0xd3181 path, the u32
 *          destined for *hi      -> the `return` value / `hiVal`
 *   %rcx = current byte, then the first integer, then a scanner cursor
 *   %r8  = the comment scanner's own cursor
 *
 * ── BLOCK MAP (every label in the listing) ──────────────────────────────
 *   0xd30a0  entry: `*s == 0` -> NULL, taken BEFORE the frame is built
 *   0xd30ad  A  skip-ws/comment #1; a NUL inside the comment -> NULL @0xd30e7
 *   0xd30d1  A' `'#'` test
 *   0xd30ff  require `'['`, else NULL @0xd31d6
 *   0xd310b  step past `'['`
 *   0xd3116  B  skip-ws/comment #2; a NUL (@0xd3114/@0xd3145) -> the empty
 *               form at 0xd316c rather than a failure
 *   0xd3164  digit test: digit -> 0xd31e8, else the empty form
 *   0xd316c  empty form: need hi, then *lo = 0 and *hi = 0xffffffff
 *   0xd3181  store *hi, fall into the `']'` scan
 *   0xd3183  D  skip-ws/comment #3, then require `']'`
 *   0xd31da  `']'` test: `cmoveq %rdi,%rax` returns the cursor past it
 *   0xd31e8  first integer: n = n*10 + (c - '0'), 32-bit wrapping
 *   0xd3207  C  skip-ws/comment #4
 *   0xd3253  store *lo = n; if hi is NULL jump straight to the `']'` scan
 *   0xd3263  store *hi = n (the single-index form), then look for `..`
 *   0xd327b  range form: step past `..`, default *hi to 0xffffffff
 *   0xd3294  E  skip-ws/comment #5 (runs on %rcx, leaving %rdi parked just
 *               after the `..` — so the three bail-outs @0xd328b/@0xd32c0/
 *               @0xd32dd resume the `']'` scan from THERE, not from %rcx)
 *   0xd32d5  digit test for the upper bound; non-digit -> *hi stays
 *               0xffffffff and the `']'` scan resumes
 *   0xd32e3  second integer m (same 32-bit wrapping recurrence)
 *   0xd3302  F  skip-ws/comment #6
 *   0xd334f  %rdi = %rcx, then *hi = m via 0xd3181
 *
 * ── THE SIX INLINED SKIP-WS/COMMENT SCANNERS ────────────────────────────
 * The compiler inlined the same source-level scanner six times and the
 * copies are NOT interchangeable — they differ in what happens when the
 * input ends inside a comment, and in whether the comment loop reads
 * `q[1]` and tests `*q` (copies #1, #3, #5) or reads `*p` and tests `p[-1]`
 * (copies #2, #4, #6, which then `dec` back onto the byte just read).  Each
 * copy is transcribed at its own site below rather than factored out, so
 * the end-of-input behaviour of each stays exactly as the binary has it.
 *
 * ── NUMERICS ────────────────────────────────────────────────────────────
 * The accumulator recurrence is emitted as three separate 32-bit ops —
 * `leal (%rcx,%rcx,4),%ecx` (*5), `leal (%rax,%rcx,2),%ecx` (2*+c),
 * `addl $-0x30,%ecx` (-'0') — each wrapping mod 2^32.  Each is mirrored
 * with its own `>>> 0`.  No floating point is involved, so `Math.fround`
 * does not apply.
 *
 * @param s      NUL-terminated buffer holding the ARB source (%rdi's target).
 * @param sIndex cursor into `s` (the value of %rdi).
 * @param lo     `unsigned int*` out-cell for the lower index, or `null`.
 * @param hi     `unsigned int*` out-cell for the upper index, or `null`.
 * @returns index into `s` just past the `]`, or `null` for the C NULL return.
 */
export function arb_aidx(
  s: Uint8Array,
  sIndex: number,
  lo: { value: number } | null,
  hi: { value: number } | null
): number | null {
  // 0xd30a0  movzbl (%rdi), %ecx
  let ch = s[sIndex];
  // 0xd30a3  testb %cl,%cl / 0xd30a5 je 0xd30fc
  if (ch === 0) {
    // 0xd30fc  xorl %eax,%eax ; 0xd30fe retq — no frame is ever built.
    return null;
  }
  // 0xd30a7/0xd30a8  pushq %rbp ; movq %rsp,%rbp
  // 0xd30ab  xorl %eax,%eax — %rax is the eventual cursor; 0 means NULL.
  let p = sIndex;

  // ── A @0xd30ad: skip-ws/comment #1 (comment-NUL -> NULL) ───────────────
  for (;;) {
    // 0xd30ad/0xd30b1/0xd30b5  leal -0x21(%rcx),%r8d ; cmpb $-0x20 ; jb 0xd30d1
    if (arb_isSkippable(ch)) {
      do {
        ch = s[p + 1]; // 0xd30c0  movzbl 0x1(%rdi),%ecx
        p = p + 1; //     0xd30c4  incq %rdi
      } while (arb_isSkippableLoop(ch)); // 0xd30c7..0xd30cf
    }
    // 0xd30d1  cmpb $0x23,%cl / 0xd30d4 jne 0xd30ff
    if (ch !== ARB_COMMENT) break;

    // 0xd30d6  movq %rdi,%r8 — the comment scanner runs on its own cursor.
    let q = p;
    for (;;) {
      ch = s[q + 1]; // 0xd30e0  movzbl 0x1(%r8),%ecx
      // 0xd30e5/0xd30e7  je 0xd31e6 with %rax still 0 — input ends in comment.
      if (ch === 0) return null;
      const atNewline = s[q] === ARB_NEWLINE; // 0xd30f1  cmpb $0xa,(%r8)
      q = q + 1; // 0xd30ed leaq 0x1(%r8),%rdi / 0xd30f5 movq %rdi,%r8
      if (atNewline) break; // 0xd30f8  jne 0xd30e0
    }
    p = q; // 0xd30fa  jmp 0xd30ad (%rdi is the scanner cursor, %cl is *%rdi)
  }

  // ── @0xd30ff: the first significant byte must be '[' ───────────────────
  // 0xd30ff movzbl %cl,%eax / 0xd3102 cmpl $0x5b,%eax / 0xd3105 jne 0xd31d6
  if (ch !== ARB_LBRACKET) return null;

  // 0xd310b  movzbl 0x1(%rdi),%eax / 0xd310f incq %rdi
  ch = s[p + 1];
  p = p + 1;

  // ── B @0xd3116: skip-ws/comment #2, then the digit test @0xd3164 ───────
  // Unlike copy #1, running out of input here is NOT a failure: both
  // @0xd3114 and @0xd3145 jump to the empty-index handler at 0xd316c.
  let hasDigit = false;
  emptyForm: {
    if (ch === 0) break emptyForm; // 0xd3112/0xd3114  je 0xd316c
    for (;;) {
      // 0xd3116/0xd3119/0xd311c  jb 0xd312f
      if (arb_isSkippable(ch)) {
        do {
          ch = s[p + 1]; // 0xd3120  movzbl 0x1(%rdi),%eax
          p = p + 1; //     0xd3124  incq %rdi
        } while (arb_isSkippableLoop(ch)); // 0xd3127..0xd312d
      }
      // 0xd312f  cmpb $0x23,%al / 0xd3131 jne 0xd3164
      if (ch !== ARB_COMMENT) break;
      p = p + 1; // 0xd3133  incq %rdi — step onto the byte after the '#'.
      for (;;) {
        ch = s[p]; // 0xd3140  movzbl (%rdi),%eax
        if (ch === 0) break emptyForm; // 0xd3143/0xd3145  je 0xd316c
        // 0xd314b  cmpb $0xa,-0x1(%rdi) — the byte BEFORE the cursor.
        const prevWasNewline = s[p - 1] === ARB_NEWLINE;
        p = p + 1; // 0xd3147 leaq 0x1(%rdi),%rcx / 0xd314f movq %rcx,%rdi
        if (prevWasNewline) break; // 0xd3152  jne 0xd3140
      }
      // 0xd3154 decq %rcx / 0xd3157 movq %rcx,%rdi — back onto the byte in
      // %al, so the class re-test @0xd315a..@0xd3162 (which picks between
      // the ws loop @0xd3120 and the '#' test @0xd312f) sees it.  The loop
      // head above re-evaluates exactly that choice.
      p = p - 1;
    }
    // 0xd3164/0xd3167/0xd316a  leal -0x3a(%rax),%ecx ; cmpb $-0xa ; jae 0xd31e8
    hasDigit = arb_isDigit(ch);
  }

  // %eax when it carries the u32 that @0xd3181 stores through `hi`.
  let hiVal = 0;
  // %ecx once the first integer starts accumulating.
  let n = 0;
  // True on every path that reaches @0xd3181 (i.e. that stores through hi).
  let storeHi = false;

  if (!hasDigit) {
    // ── @0xd316c: the empty `[ ]` form ──────────────────────────────────
    // 0xd316c testq %rdx,%rdx / 0xd316f je 0xd31d6 — no hi cell, no parse.
    if (hi === null) return null;
    hiVal = ARB_IDX_UNBOUNDED; // 0xd3171  movl $0xffffffff,%eax
    // 0xd3176 testq %rsi,%rsi / 0xd3179 je 0xd3181 / 0xd317b movl $0x0,(%rsi)
    if (lo !== null) lo.value = 0;
    storeHi = true; // falls into 0xd3181
  } else {
    // ── @0xd31e8: the first integer ─────────────────────────────────────
    n = 0; // 0xd31e8  xorl %ecx,%ecx
    do {
      n = (n * 5) >>> 0; //             0xd31ea  leal (%rcx,%rcx,4),%ecx
      n = (ch + n * 2) >>> 0; //        0xd31ed/0xd31f0  leal (%rax,%rcx,2),%ecx
      n = (n - ARB_ZERO) >>> 0; //      0xd31f3  addl $-0x30,%ecx
      ch = s[p + 1]; //                 0xd31f6  movzbl 0x1(%rdi),%eax
      p = p + 1; //                     0xd31fa  incq %rdi
    } while (arb_isDigitLoop(ch)); //   0xd31fd..0xd3205  ja 0xd31ea

    // ── C @0xd3207: skip-ws/comment #4 (all exits land on 0xd3253) ──────
    afterFirst: {
      if (ch === 0) break afterFirst; // 0xd3207/0xd3209  je 0xd3253
      for (;;) {
        // 0xd320b/0xd320f/0xd3213  jb 0xd3226
        if (arb_isSkippable(ch)) {
          do {
            ch = s[p + 1]; // 0xd3215  movzbl 0x1(%rdi),%eax
            p = p + 1; //     0xd3219  incq %rdi
          } while (arb_isSkippableLoop(ch)); // 0xd321c..0xd3224
        }
        // 0xd3226  cmpb $0x23,%al / 0xd3228 jne 0xd3253
        if (ch !== ARB_COMMENT) break;
        p = p + 1; // 0xd322a  incq %rdi
        for (;;) {
          ch = s[p]; // 0xd322d  movzbl (%rdi),%eax
          if (ch === 0) break afterFirst; // 0xd3230/0xd3232  je 0xd3253
          const prevWasNewline = s[p - 1] === ARB_NEWLINE; // 0xd3238
          p = p + 1; // 0xd3234 leaq 0x1(%rdi),%r8 / 0xd323c movq %r8,%rdi
          if (prevWasNewline) break; // 0xd323f  jne 0xd322d
        }
        p = p - 1; // 0xd3241 decq %r8 / 0xd3244 movq %r8,%rdi
      }
    }

    // ── @0xd3253 ────────────────────────────────────────────────────────
    // 0xd3253 testq %rsi,%rsi / 0xd3256 je 0xd325a / 0xd3258 movl %ecx,(%rsi)
    if (lo !== null) lo.value = n;
    // 0xd325a testq %rdx,%rdx / 0xd325d je 0xd3183 — no hi cell: straight to
    // the ']' scan, and the `..` range suffix is never even looked at.
    if (hi !== null) {
      hi.value = n; // 0xd3263  movl %ecx,(%rdx) — the single-index form.
      ch = s[p]; //   0xd3265  movzbl (%rdi),%ecx
      // 0xd3268  cmpb $0x2e,%cl / 0xd326b jne 0xd3186 (%cl already loaded)
      // 0xd3271  cmpb $0x2e,0x1(%rdi) / 0xd3275 jne 0xd3183
      if (ch === ARB_DOT && s[p + 1] === ARB_DOT) {
        // ── @0xd327b: the `n .. m` range form ───────────────────────────
        // %rsi stops being the `lo` pointer here (its store already
        // happened @0xd3258); from now on it is a scratch byte.
        let ch2 = s[p + 2]; // 0xd327b  movzbl 0x2(%rdi),%esi
        p = p + 2; //          0xd327f  addq $0x2,%rdi
        hiVal = ARB_IDX_UNBOUNDED; // 0xd3283  movl $0xffffffff,%eax
        storeHi = true; // every exit below reaches 0xd3181
        upperBound: {
          // 0xd3288/0xd328b  testb %sil,%sil ; je 0xd3181
          if (ch2 === 0) break upperBound;
          // 0xd3291  movq %rdi,%rcx — copy #5 walks %rcx and leaves %rdi
          // parked just past the "..", which is where the ']' scan resumes
          // on every bail-out from this block.
          let q = p;
          for (;;) {
            // 0xd3294/0xd3298/0xd329c  jb 0xd32af
            if (arb_isSkippable(ch2)) {
              do {
                ch2 = s[q + 1]; // 0xd329e  movzbl 0x1(%rcx),%esi
                q = q + 1; //      0xd32a2  incq %rcx
              } while (arb_isSkippableLoop(ch2)); // 0xd32a5..0xd32ad
            }
            // 0xd32af  cmpb $0x23,%sil / 0xd32b3 jne 0xd32d5
            if (ch2 !== ARB_COMMENT) break;
            let r = q; // 0xd32b5  movq %rcx,%r8
            for (;;) {
              ch2 = s[r + 1]; // 0xd32b8  movzbl 0x1(%r8),%esi
              // 0xd32bd/0xd32c0  je 0xd3181 — *hi keeps the 0xffffffff.
              if (ch2 === 0) break upperBound;
              const atNewline = s[r] === ARB_NEWLINE; // 0xd32ca cmpb $0xa,(%r8)
              r = r + 1; // 0xd32c6 leaq 0x1(%r8),%rcx / 0xd32ce movq %rcx,%r8
              if (atNewline) break; // 0xd32d1  jne 0xd32b8
            }
            q = r; // 0xd32d3  jmp 0xd3294 (%rcx is the scanner cursor)
          }
          // 0xd32d5/0xd32d9/0xd32dd  cmpb $-0xa,%r8b ; jb 0xd3181 — a
          // non-digit upper bound leaves *hi at 0xffffffff and rewinds the
          // ']' scan to %rdi (just past the ".."), NOT to %rcx.
          if (!arb_isDigit(ch2)) break upperBound;

          // ── @0xd32e3: the second integer ──────────────────────────────
          let m = 0; // 0xd32e3  xorl %eax,%eax
          do {
            m = (m * 5) >>> 0; //          0xd32e5  leal (%rax,%rax,4),%eax
            m = (ch2 + m * 2) >>> 0; //    0xd32e8/0xd32ec  leal (%rsi,%rax,2),%eax
            m = (m - ARB_ZERO) >>> 0; //   0xd32ef  addl $-0x30,%eax
            ch2 = s[q + 1]; //             0xd32f2  movzbl 0x1(%rcx),%esi
            q = q + 1; //                  0xd32f6  incq %rcx
          } while (arb_isDigitLoop(ch2)); // 0xd32f9..0xd3300  ja 0xd32e5
          hiVal = m;

          // ── F @0xd3302: skip-ws/comment #6 (all exits land on 0xd334f) ─
          afterSecond: {
            if (ch2 === 0) break afterSecond; // 0xd3302/0xd3305  je 0xd334f
            for (;;) {
              // 0xd3307/0xd330a/0xd330e  jb 0xd3320
              if (arb_isSkippable(ch2)) {
                do {
                  ch2 = s[q + 1]; // 0xd3310  movzbl 0x1(%rcx),%esi
                  q = q + 1; //      0xd3314  incq %rcx
                } while (arb_isSkippableLoop(ch2)); // 0xd3317..0xd331e
              }
              // 0xd3320  cmpb $0x23,%sil / 0xd3324 jne 0xd334f
              if (ch2 !== ARB_COMMENT) break;
              q = q + 1; // 0xd3326  incq %rcx
              for (;;) {
                ch2 = s[q]; // 0xd3329  movzbl (%rcx),%esi
                if (ch2 === 0) break afterSecond; // 0xd332c/0xd332f je 0xd334f
                const prevWasNewline = s[q - 1] === ARB_NEWLINE; // 0xd3335
                q = q + 1; // 0xd3331 leaq 0x1(%rcx),%rdi / 0xd3339 movq %rdi,%rcx
                if (prevWasNewline) break; // 0xd333c  jne 0xd3329
              }
              q = q - 1; // 0xd333e decq %rdi / 0xd3341 movq %rdi,%rcx
            }
          }
          p = q; // 0xd334f  movq %rcx,%rdi ; 0xd3352 jmp 0xd3181
        }
      }
      // else: 0xd326b (no '.') or 0xd3275 (a lone '.') fall straight into
      // the ']' scan with *hi already holding n.
    }
    // 0xd3183 reloads %cl from (%rdi); on the 0xd3186 edge it is already
    // the same byte, so the reload below covers both entries.
  }

  // ── @0xd3181: store the pending *hi, then fall into the ']' scan ───────
  if (storeHi && hi !== null) hi.value = hiVal; // 0xd3181  movl %eax,(%rdx)

  // ── D @0xd3183: skip-ws/comment #3, then require ']' ───────────────────
  ch = s[p]; // 0xd3183  movzbl (%rdi),%ecx
  // 0xd3186  xorl %eax,%eax — the return cursor resets to NULL here.
  if (ch === 0) return null; // 0xd3188/0xd318a  je 0xd31e6
  for (;;) {
    // 0xd318c/0xd318f/0xd3192  jb 0xd31af.  (%rdx is scratch from here on —
    // its last store as the `hi` pointer already happened.)
    if (arb_isSkippable(ch)) {
      do {
        ch = s[p + 1]; // 0xd31a0  movzbl 0x1(%rdi),%ecx
        p = p + 1; //     0xd31a4  incq %rdi
      } while (arb_isSkippableLoop(ch)); // 0xd31a7..0xd31ad
    }
    // 0xd31af  cmpb $0x23,%cl / 0xd31b2 jne 0xd31da
    if (ch !== ARB_COMMENT) break;
    let q = p; // 0xd31b4  movq %rdi,%rdx
    for (;;) {
      ch = s[q + 1]; // 0xd31c0  movzbl 0x1(%rdx),%ecx
      // 0xd31c4/0xd31c6  je 0xd31e6 with %rax = 0 — like copy #1, an input
      // that ends inside this comment is a hard failure.
      if (ch === 0) return null;
      const atNewline = s[q] === ARB_NEWLINE; // 0xd31cc  cmpb $0xa,(%rdx)
      q = q + 1; // 0xd31c8 leaq 0x1(%rdx),%rdi / 0xd31cf movq %rdi,%rdx
      if (atNewline) break; // 0xd31d2  jne 0xd31c0
    }
    p = q; // 0xd31d4  jmp 0xd318c
  }
  // 0xd31da  incq %rdi — step past the byte in %cl whatever it is.
  p = p + 1;
  // 0xd31dd xorl %eax,%eax / 0xd31df cmpb $0x5d,%cl / 0xd31e2 cmoveq %rdi,%rax
  return ch === ARB_RBRACKET ? p : null;
}
