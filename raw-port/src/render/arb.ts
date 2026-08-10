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
//   raw-port/re/disasm/Helium.__ZN3arbL4achrEPKcc.s   (the body ported here)
//
// SYMBOL PORTED IN THIS UNIT
//   0x000d35b0 t __ZN3arbL4achrEPKcc   arb::achr(char const*, char)
//
// SIBLING SYMBOLS IN THE SAME NAMESPACE (each its own ledger unit — still
// `todo`, deliberately NOT written here):
//   0x000ae020 t arb::atok(char const*)
//   0x000b3340 t arb::end(string_t&, HGLimits const&, HGString::Hash const&, bool)
//   0x000bd500 t arb::begin(string_t&, HGLimits const&, HGLimits const&)
//   0x000bdbd0 t arb::write(string_t&, HGShaderBinding const*, ...)
//   0x000c6dc0 t arb::undo(string_t&)
//   0x000d2280 t arb::isunpremult(arb::object_t*, char const*, char const*)
//   0x000d30a0 t arb::aidx(char const*, unsigned int*, unsigned int*)
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
// FRONTIER CALLEES: none.  arb::achr is a leaf — the disassembly contains no
// `callq` and no indirect branch, only loads, compares and jumps.
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
