// PCString.ts — ProCore's PCString class.  Transcribed from the x86_64
// disassembly of /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProCore.framework/Versions/A/ProCore (see /tmp/ProCore_tV.txt).
//
// Every function below cites its @0xADDR in ProCore, every called C
// runtime / CoreFoundation symbol is resolved by name from
// /tmp/ProCore_symmap.tsv (the framework's own dynamic symbol table),
// every hex offset comes straight out of the assembly.  Per Itanium C++
// ABI there are C1/C2 (complete/base) and D1/D2 (complete/base) aliases
// for the ctors and dtor; the C2/D2 body is the real work and C1/D1 is
// an identical (independent, not-a-jump) function whose bytes match
// C2/D2 — both entry points are recorded.
//
// ── STRUCT LAYOUT ────────────────────────────────────────────────────
// Recovered from the default ctor @0x31ab8/@0x31ac6 (`movq $0x0,(%rdi)`
// — nothing else written), from every setter/getter which touches
// only (rdi) (i.e. `movq (%rdi), %rdi`), and from the dtor @0x31fb6
// which `_CFRelease`s the single pointer at +0x00 and returns.
//
//     +0x00  ref : CFStringRef       // owning strong reference, may be null
//
// Total size: 8 bytes.  There is NO small-string-optimization buffer,
// NO length/capacity field, NO heap-vs-inline discriminator — the
// underlying storage is entirely delegated to CoreFoundation's
// CFStringRef (which itself does small-string optimization internally,
// but that is opaque to PCString and invisible at this ABI boundary).
//
// Ownership convention: whenever the slot is written, PCString takes
// ownership of a +1-retained CFStringRef (either freshly created via
// _CFStringCreateWithCString, or copied via _CFStringCreateCopy which
// bumps the retain count on immutable strings).  Whenever the slot is
// cleared/overwritten the old ref is _CFRelease()d.  A null ref means
// "empty string" and is handled explicitly at every read site.
//
// ── ABI NOTE (JS port) ──────────────────────────────────────────────
// The real class stores an opaque CoreFoundation handle.  In this port
// there is no live CoreFoundation, so the "handle" is modelled as a
// nullable JS string (`string | null`) — that carries exactly the two
// pieces of information every method in the native class observes:
// (a) is the slot populated? (b) if so, what are the code units?
// _CFRelease is a no-op (JS GC handles memory), _CFStringCreateCopy is
// identity (JS strings are immutable), and _CFStringCreateWithCString
// with encoding 0x8000100 (kCFStringEncodingUTF8) is identity on the
// already-decoded JS string.  This is the minimal faithful model of a
// CFStringRef wrapper; anything more (UTF-16 buffers, retain counts,
// mutable subclasses) is neither exercised by the transcribed methods
// nor observable through them.
//
// ── FRONTIER (methods NOT ported in this pass) ───────────────────────
// PCString has 89 total symbols in ProCore; this file transcribes only
// the eight core methods listed below (identified as the keystone set
// used by every OZChannelInfo/OZChannel*Info ctor).  All other methods
// remain undecoded and will be added in future passes.  Notable
// deferrals include:
//   0x31b70  PCString(char const*, char const*)
//   0x31c02  PCString(__CFString const*, char const*)
//   0x31c72  PCString(__CFString const*, __CFString const*)
//   0x31cce  PCString(__CFString const*, __CFBundle*, __CFString const*)  ← NOW PORTED (C2 base; byte-identical to C1 @0x31cec, both routed through fromCFString_CFBundle_CFString)
//   0x31d0a  PCString(char const*, char const*, char const*)
//   0x31dde  PCString(char const*, __CFBundle*, char const*)
//   0x31e7a  PCString(unsigned short const*)  ← NOW PORTED (C2 base; byte-identical to C1 @0x31eac, both routed through fromChar16)
//   0x31f32  PCString(__CFString const*)
//   0x31f76  PCString(__CFString const*, bool)
//   0x31fdc  intern(PCString const&)
//   0x3209c  clear()
//   0x320f0  set(char const*, unsigned int)
//   0x3212a  set(unsigned short const*)
//   0x321c8  set(__CFString const*)
//   0x32200  setOSType(unsigned int)
//   0x32246  empty() const
//   0x32262  size() const
//   0x32278  createCStr() const
//   0x322ee  createUTF8Str() const
//   0x32352  u_str() const
//   0x32368  cf_str() const
//   0x32380  createUniStr() const
//   0x323dc  get_OSType() const
//   0x32438  createVerifiedFormatString(char const*) const
//   0x324a2  createVerifiedFormatCFString(char const*) const
//   0x32532  compare(unsigned long, unsigned int, PCString const&) const
//   0x3258a  compare(unsigned long, unsigned int, PCString const&, unsigned long) const
//   0x325bc  caseInsensitiveCompare(PCString const&) const
//   0x32694  insert(unsigned long, PCString const&)
//   0x32704  append(PCString const&)
//   0x327c0  append(PCString const&, unsigned long, unsigned int)
//   0x327fa  repeat(PCString const&, int)
//   0x32850  append(char const*)
//   0x328c4  append(unsigned short const*)
//   0x328fe  push_back(char)
//   0x3292a  erase(unsigned long, unsigned int)
//   0x3299a  replace(unsigned long, unsigned int, PCString const&)
//   0x32a12  find(PCString const&) const
//   0x32a4e  substr(unsigned long, unsigned int) const
//   0x32ab0  substrTo(unsigned long) const
//   0x32b18  substrFrom(unsigned long) const
//   0x32b9a  debugShow() const
//   0x32ba8  sprintf(__CFString const*, ...)
//   0x32c80  vsprintf(char const*, __va_list_tag*)
//   0x32cba  sprintf(char const*, ...)
//   0x32d88  ssprintf(char const*, ...)
//   0x32e72  format(short) / 0x32eae format(int) / 0x32eea format(long)
//   0x32f28  format(float) / 0x32f66 format(double)
//   0x32fa0  toLower() const
//   0x33006  toCapitalize() const
//   0x3230   ns_str() const
//   0x3254   stringWithoutDiacritics() const
//   0x32b0   toUpper() const
//   0x32e4   stringWithoutSpacesAndNewlines() const
//   0x333c   composedCharacterCount() const
//   0x3352   glyphCount() const
//   0x3368   isWhitespace() const
//   0x3384   isWhitespaceAndNewline() const
//   0x33a0   isNewline() const
//   0x33bc   isUUID() const
//   0x31b18  PCString(std::__1::basic_string<char> const&)
//   0x31b38  set(std::__1::basic_string<char> const&)
// plus the std::__1::basic_string overloads.

// ── CoreFoundation frontier ──────────────────────────────────────────
// The methods below call into CoreFoundation via ProCore's __stubs
// section.  Their real semantics live in CoreFoundation.framework,
// which is not part of this port.  We model each stub at the minimum
// fidelity the transcribed callers actually observe (see the ABI note
// above); anything richer would be inventing behavior.

/** _CFStringCreateWithCString(alloc=NULL, cStr, encoding=0x8000100)
 *  — creates an immutable CFString from a NUL-terminated C string in
 *  the given encoding (0x8000100 == kCFStringEncodingUTF8).  Returns
 *  a +1-retained CFStringRef or NULL on failure.  Called from
 *  PCString(char const*) @0x31aee and set(char const*) @0x320cb. */
function _CFStringCreateWithCString(cStr: string | null, encoding: number): string | null {
  // Faithful model: JS strings are already-decoded UTF-16, so the
  // "decode from UTF-8" step is a no-op at this fidelity.  The real
  // symbol returns NULL if `cStr` is NULL; we mirror that.
  if (cStr === null) return null;
  if (encoding !== 0x8000100) {
    throw new Error(
      `_CFStringCreateWithCString: encoding 0x${encoding.toString(16)} @ProCore stub — only kCFStringEncodingUTF8 (0x8000100) is exercised by the transcribed callers`,
    );
  }
  return cStr;
}

/** _CFStringCreateCopy(alloc=NULL, src) — for immutable inputs returns
 *  the same pointer with a +1 retain; for mutable inputs makes a copy.
 *  Called from PCString(char const*) @0x31afe, PCString(PCString const&)
 *  @0x31ef8, set(PCString const&) @0x3208f. */
function _CFStringCreateCopy(src: string | null): string | null {
  return src;
}

/** _CFRelease(cf) — decrements retain count; frees at zero.  Called
 *  from ~PCString @0x31fc2, set(char const*) @0x320e2, set(PCString
 *  const&) @0x32080. */
function _CFRelease(_cf: string | null): void {
  // no-op in JS
}

/** _CFRetain(cf) — increments retain count on a CFTypeRef; returns
 *  the SAME pointer.  Called from PCString(__CFString const*) [C1
 *  @0x31f54, C2 @0x31f32] when the incoming ref is non-null (see
 *  the null-guard test at @0x31f61/@0x31f3f in each). In this port
 *  the JS-string model has no retain-counted lifecycle, so this is
 *  identity — same policy as `_CFStringCreateCopy` above. */
function _CFRetain(cf: string | null): string | null {
  // Identity — the disasm's `callq _CFRetain` @0x31f69 returns its
  // input in rax; we mirror that (JS GC subsumes the retain count).
  return cf;
}

/** _CFStringCreateWithCharacters(alloc=NULL, chars, numChars) — creates
 *  an immutable CFString from a COUNTED (not NUL-terminated) buffer of
 *  UTF-16 code units.  Reached through the mach-o symbol stub at
 *  @ProCore 0xde078; the only transcribed call site is
 *  PCString(unsigned short const*) @0x31ecf (C1) / @0x31e9d (C2), which
 *  passes alloc = NULL (`xorl %edi, %edi`), chars = the caller's %rsi
 *  untouched, and numChars = the code-unit count its own inline scan
 *  computed in %rdx.
 *
 *  Unlike `_CFStringCreateWithCString` above there is no encoding
 *  argument: the input is already UTF-16, which is CFString's native
 *  representation.  In this port a CFStringRef is modelled as a JS
 *  string (see the ABI NOTE in the file header) and a JS string IS a
 *  sequence of UTF-16 code units, so the faithful model is
 *  "the first `numChars` units, verbatim" — including unpaired
 *  surrogates, which CoreFoundation also stores without repair (checked
 *  against the live function: a lone 0xD83D round-trips unchanged).
 *  Returns a +1-retained CFStringRef, i.e. the caller owns it. */
function _CFStringCreateWithCharacters(chars: Uint16Array, numChars: number): string {
  // @ProCore 0xde078 (symbol stub for: _CFStringCreateWithCharacters).
  // `subarray` + a value iteration, deliberately: there is no computed index
  // to read out of range (the caller's `numChars` is the scan's terminator
  // index, hence < chars.length), so this cannot degrade into the
  // `undefined -> NaN` silent-wrong-answer class that gate G7 guards.
  let out = '';
  for (const unit of chars.subarray(0, numChars)) {
    out += String.fromCharCode(unit);
  }
  return out;
}

/** _CFStringCompare(a, b, options).  In native code it returns a
 *  CFComparisonResult of -1, 0, or +1.  Called from compare(PCString
 *  const&) @0x3252a with options=0x20 (kCFCompareNonliteral).  Only
 *  invoked when both operands are non-null (the caller pre-guards
 *  null on either side and returns +/-1 without invoking CF). */
function _CFStringCompare(a: string, b: string, options: number): number {
  if (options !== 0x20) {
    throw new Error(
      `_CFStringCompare: options 0x${options.toString(16)} @ProCore stub — only kCFCompareNonliteral (0x20) is exercised by the transcribed callers`,
    );
  }
  // kCFCompareNonliteral: canonically-equivalent code-point sequences
  // compare equal.  We do not implement Unicode canonical equivalence
  // in this port; fall back to code-unit comparison, which is exact
  // for all ASCII / already-normalised inputs (the case observed for
  // every OZChannel*Info name in the corpus).
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/** _CFStringGetLength(cf) — CoreFoundation extern.  Returns the number
 *  of UTF-16 code units in the CFStringRef.  Called from createCStr()
 *  @0x3228d in the non-null branch.  In this port CFStringRef is
 *  modelled as a JS string; JS's `.length` gives the number of UTF-16
 *  code units (identical to CFStringGetLength's contract). */
function _CFStringGetLength(cf: string): number {
  return cf.length;
}

/** _CFStringGetMaximumSizeForEncoding(len, encoding) — CoreFoundation
 *  extern.  Returns an upper bound on the number of BYTES needed to
 *  represent a `len`-code-unit string in the target encoding, NOT
 *  including a trailing NUL.  Called from createCStr() @0x3229a with
 *  encoding=0x8000100 (kCFStringEncodingUTF8).
 *
 *  For UTF-8, CFStringGetMaximumSizeForEncoding returns len * 3 (each
 *  UTF-16 code unit can encode to at most 3 UTF-8 bytes; surrogate
 *  pairs — two code units — encode to 4 bytes, which fits within
 *  2 * 3 = 6, so the bound holds). This exact formula is the one CF
 *  returns for kCFStringEncodingUTF8; a faithful port uses the same
 *  bound so downstream `malloc(bound + 1)` sizes match the machine.
 */
function _CFStringGetMaximumSizeForEncoding(len: number, encoding: number): number {
  if (encoding !== 0x8000100) {
    throw new Error(
      `_CFStringGetMaximumSizeForEncoding: encoding 0x${encoding.toString(16)} @ProCore stub — only kCFStringEncodingUTF8 (0x8000100) is exercised by createCStr @0x3229a`,
    );
  }
  // UTF-8 upper bound: 3 bytes per UTF-16 code unit (CF's own return
  // for kCFStringEncodingUTF8). Matches CFStringGetMaximumSizeForEncoding's
  // observable behaviour bit-for-bit at the sizing step.
  return len * 3;
}

/** _CFStringGetCString(cf, buf, bufLen, encoding) — CoreFoundation
 *  extern.  Writes cf's payload into `buf` as a NUL-terminated C-string
 *  in `encoding`.  Returns true on success, false if buf was too small.
 *  Called from createCStr() @0x322c3 with encoding=0x8000100
 *  (kCFStringEncodingUTF8) and bufLen = maxSizeForEncoding(len)+1.
 *
 *  In this port `buf` is modelled as an object with a mutable `bytes`
 *  slot (the caller's `char *`); we assign the encoded string into it
 *  and return true.  The JS-string model already carries UTF-16 code
 *  units so the "encode to UTF-8" step is deferred to the sole consumer
 *  (callers use TextEncoder if they need raw UTF-8 bytes; every current
 *  caller just re-decodes back to a JS string).
 */
function _CFStringGetCString(
  cf: string,
  buf: { bytes: string | null },
  _bufLen: number,
  encoding: number,
): boolean {
  if (encoding !== 0x8000100) {
    throw new Error(
      `_CFStringGetCString: encoding 0x${encoding.toString(16)} @ProCore stub — only kCFStringEncodingUTF8 (0x8000100) is exercised by createCStr @0x322c3`,
    );
  }
  buf.bytes = cf;
  return true;
}

/** _malloc(size) — libc/malloc extern (out of scope, modelled as a
 *  boundary stub).  createCStr @0x322a8 calls it to allocate the
 *  destination C-string buffer; a NULL return signals allocation
 *  failure and createCStr returns NULL in that case.
 *
 *  In JS there is no bounded heap so allocation never fails; the
 *  buffer object we hand back carries a mutable `bytes` slot that
 *  `_CFStringGetCString` later writes into, plus a `capacity` slot
 *  that mirrors the real size passed to malloc (retained for
 *  debuggability / fidelity of the ABI shape). @0x322a8 and @0x322cf.
 */
function _malloc(size: number): { bytes: string | null; capacity: number } | null {
  // JS never fails; return a fresh buffer object with bytes=null (the
  // uninitialised memory that malloc returns) and the requested size.
  return { bytes: null, capacity: size };
}

// The literal CFString @"bad cfstring ref" referenced from PCString(char
// const*) @0x31af5 and cf_str() @0x32372 — a ProCore-internal sentinel
// CFStringRef used when the source pointer is NULL/empty.  The string
// payload lives in __TEXT,__cstring; the address 0x11b27c(%rip) resolves
// to the CFConstantString wrapper for the C-literal "bad cfstring ref".
const BAD_CFSTRING_REF_LITERAL = "bad cfstring ref";

/**
 * PCString — ProCore's CFString-backed string wrapper.  Every method
 * is transcribed line-for-line from the ProCore disassembly; each
 * cites its @0xADDR in ProCore.
 *
 * The single instance field `ref` corresponds to the CFStringRef at
 * this+0x00 in the native layout (see STRUCT LAYOUT header above).
 */
export class PCString {
  /** +0x00: CFStringRef.  null == empty / uninitialised.  Held with a
   *  +1 retain by convention (set/copy paths bump; dtor releases). */
  ref: string | null = null;

  // ── Constructors ────────────────────────────────────────────────
  //
  // The native class exposes many overloads at distinct addresses; JS
  // has no overloading, so we route through a single constructor that
  // switches on argument kind.  Each branch is documented with the
  // exact FCP symbol/address it corresponds to.

  constructor(arg?: PCString | string | null) {
    if (arg === undefined) {
      this._ctor_default();
    } else if (arg instanceof PCString) {
      this._ctor_copy(arg);
    } else {
      // `string | null` — the char* ctor accepts both a valid pointer
      // and NULL, and additionally treats an empty first byte as
      // "bad cfstring ref"; we forward null and empty-string alike
      // into the NULL/empty branch faithfully to the asm.
      this._ctor_cstr(arg);
    }
  }

  /**
   * PCString::PCString() [base]  — @ProCore 0x31ab8
   * PCString::PCString() [complete] — @ProCore 0x31ac6 (identical bytes)
   *
   *   0x31ab8  movq $0x0, (%rdi)      ; this->ref = nullptr
   *   0x31abf  retq                    ; (complete variant also
   *                                       pushes/pops rbp — same net)
   *
   * No callees, no reads.  Simply zeroes the single pointer field. */
  private _ctor_default(): void {
    // 0x31ab8: movq $0x0, (%rdi)
    this.ref = null;
  }

  /**
   * PCString::PCString(char const*) [base] — @ProCore 0x31ad4
   * PCString::PCString(char const*) [complete] — @ProCore 0x31b0e (thunk, same body)
   *
   *   0x31ad4  push rbp / mov rbp,rsp / push rbx / push rax
   *   0x31ada  movq %rdi, %rbx            ; rbx = this
   *   0x31add  testq %rsi, %rsi           ; if (cstr == NULL) goto empty
   *   0x31ae0  je   0x31af5
   *   0x31ae2  cmpb $0x0, (%rsi)          ; if (*cstr == '\0') goto empty
   *   0x31ae5  je   0x31af5
   *   0x31ae7  xorl %edi, %edi            ; alloc = NULL
   *   0x31ae9  movl $0x8000100, %edx      ; encoding = kCFStringEncodingUTF8
   *   0x31aee  callq _CFStringCreateWithCString  (rsi already = cstr)
   *   0x31af3  jmp  0x31b03
   *   0x31af5  leaq @"bad cfstring ref"(%rip), %rsi
   *   0x31afc  xorl %edi, %edi            ; alloc = NULL
   *   0x31afe  callq _CFStringCreateCopy  ; copy the sentinel CFString
   *   0x31b03  movq %rax, (%rbx)          ; this->ref = rax
   *   0x31b06  ...                         ; epilogue */
  private _ctor_cstr(cstr: string | null): void {
    let created: string | null;
    // 0x31add-0x31ae5: NULL pointer OR empty-first-byte falls to sentinel.
    if (cstr === null || cstr.length === 0 || cstr.charCodeAt(0) === 0) {
      // 0x31af5-0x31afe: alloc=NULL, src=@"bad cfstring ref"
      created = _CFStringCreateCopy(BAD_CFSTRING_REF_LITERAL);
    } else {
      // 0x31ae7-0x31aee: alloc=NULL, cStr=rsi, encoding=UTF8
      created = _CFStringCreateWithCString(cstr, 0x8000100);
    }
    // 0x31b03: movq %rax, (%rbx)
    this.ref = created;
  }

  /**
   * PCString::PCString(PCString const&) [base]     — @ProCore 0x31ede
   * PCString::PCString(PCString const&) [complete] — @ProCore 0x31f08 (identical bytes)
   *
   *   0x31ede  movq $0x0, (%rdi)         ; this->ref = nullptr
   *   0x31ee5  movq (%rsi), %rsi         ; rsi = other.ref
   *   0x31ee8  testq %rsi, %rsi          ; if (rsi == NULL) return
   *   0x31eeb  je   0x31f06
   *   0x31eed  push rbp / mov rbp,rsp / push rbx / push rax
   *   0x31ef3  movq %rdi, %rbx           ; rbx = this
   *   0x31ef6  xorl %edi, %edi           ; alloc = NULL
   *   0x31ef8  callq _CFStringCreateCopy ; rax = copy(other.ref)
   *   0x31efd  movq %rax, (%rbx)         ; this->ref = rax
   *   0x31f00  ...                        ; epilogue */
  private _ctor_copy(other: PCString): void {
    // 0x31ede: movq $0x0, (%rdi)
    this.ref = null;
    // 0x31ee5: movq (%rsi), %rsi
    const src = other.ref;
    // 0x31ee8-0x31eeb: null-check on other.ref, early return
    if (src === null) return;
    // 0x31ef8: _CFStringCreateCopy(NULL, src)
    const copied = _CFStringCreateCopy(src);
    // 0x31efd: movq %rax, (%rbx)
    this.ref = copied;
  }

  /**
   * PCString::PCString(__CFString const*) [C1 complete ctor] — @ProCore 0x31f54
   *   (__ZN8PCStringC1EPK10__CFString)
   * PCString::PCString(__CFString const*) [C2 base ctor]     — @ProCore 0x31f32
   *   (__ZN8PCStringC2EPK10__CFString) — byte-identical twin
   *
   * Full disasm (raw-port/re/disasm/ProCore.__ZN8PCStringC1EPK10__CFString.s;
   * the C2 body at 0x31f32 is byte-for-byte identical, differing only in the
   * entry-point address):
   *
   *   0x31f54  pushq  %rbp                    ; frame prologue
   *   0x31f55  movq   %rsp, %rbp
   *   0x31f58  pushq  %r14                    ; save r14 (callee-saved)
   *   0x31f5a  pushq  %rbx                    ; save rbx (callee-saved)
   *                                            ; (no `pushq %rax` padding —
   *                                            ; two pushes already keep rsp
   *                                            ; 16-byte aligned)
   *   0x31f5b  movq   %rsi, %rbx              ; rbx = cfstr (the incoming ref)
   *   0x31f5e  movq   %rdi, %r14              ; r14 = this
   *   0x31f61  testq  %rsi, %rsi              ; if (cfstr == NULL) skip retain
   *   0x31f64  je     0x31f6e
   *   0x31f66  movq   %rbx, %rdi              ; rdi = cfstr (arg for CFRetain)
   *   0x31f69  callq  _CFRetain               ; @stub ProCore 0xde018 —
   *                                            ; +1 the incoming CFString
   *   0x31f6e  movq   %rbx, (%r14)            ; this->ref = cfstr
   *                                            ; (the RETAINED ref if we
   *                                            ; retained; the original ref
   *                                            ; if null; _CFRetain returns
   *                                            ; its input, so this is the
   *                                            ; same pointer either way)
   *   0x31f71  popq   %rbx                    ; frame epilogue
   *   0x31f72  popq   %r14
   *   0x31f74  popq   %rbp
   *   0x31f75  retq
   *
   * Callees:
   *   * _CFRetain  @stub ProCore 0xde018 — TRUE out-of-scope extern
   *     (CoreFoundation.framework). Modelled as an identity function in
   *     `_CFRetain` above (JS GC subsumes retain counts; same policy as
   *     `_CFStringCreateCopy` for the char-ptr / PCString-copy ctors above).
   *
   * Ownership: the C1/C2 CFString ctor takes a NON-owning input and
   * RETAINS it into `this->ref` (the +0 -> +1 bump is the whole point of
   * this ctor variant, distinguishing it from the raw-char* and copy
   * ctors above which do CFStringCreate*). ~PCString @0x31fb6 releases
   * that retained ref through `_CFRelease` @0x31fc2 — the retain/release
   * pair is balanced.
   *
   * Modelling in this port: since `_CFRetain` is identity in JS, the two
   * branches (null and non-null) both end with `this.ref = cfstr` — same
   * as the disasm, which stores rbx to (r14) unconditionally after the
   * skip. We preserve the branch structure (null-skip vs retain-then-
   * store) so the machine's control flow is observable, and cite the
   * exact addresses.
   */
  private _ctor_cfstr(cfstr: string | null): void {
    // 0x31f5b/0x31f5e: rbx = cfstr, r14 = this (register renames only).
    // 0x31f61-0x31f64: null-check on cfstr.
    if (cfstr !== null) {
      // 0x31f66/0x31f69: _CFRetain(cfstr). Return value goes back to
      // rax; the disasm ignores it (rbx still holds the input pointer,
      // and _CFRetain returns its argument — CF invariant). We mirror
      // that by discarding the return value.
      void _CFRetain(cfstr);
    }
    // 0x31f6e: movq %rbx, (%r14) — this->ref = cfstr (the fall-through
    // target of the null-skip). Same store executes on both paths.
    this.ref = cfstr;
  }

  /**
   * PCString::PCString(__CFString const*) — public C1 entry point at
   * @ProCore 0x31f54. This static factory exposes the CFString-taking
   * ctor variant separately from the polymorphic `constructor(...)`
   * above (whose `string | null` arm already routes to the char* ctor
   * `_ctor_cstr` @0x31ad4, which has DIFFERENT semantics — that one
   * calls _CFStringCreateWithCString, whereas this one calls _CFRetain).
   * Keeping them as distinct entry points matches the FCP ABI: two
   * different mangled symbols, two different bodies, at different
   * addresses. Byte-identical C2 twin lives at @ProCore 0x31f32.
   */
  static fromCFString(cfstr: string | null): PCString {
    // Allocate an uninitialized PCString (default-ctor lays down
    // `this->ref = null` @0x31ab8) and immediately overwrite via the
    // C1 body. This mirrors what a caller does in C++: they pass a
    // raw storage `this` pointer into the C1 ctor and expect it
    // fully initialised on return.
    const s = new PCString(); // @0x31ab8 (default ctor sets ref=null)
    s._ctor_cfstr(cfstr); // @0x31f54 (C1 CFString ctor body)
    return s;
  }

  // ── PCString(__CFString const*, __CFBundle*, __CFString const*) ──────
  // ─── C1 ctor @ProCore 0x31cec (byte-identical C2 twin @0x31cce) ──────
  //
  // Disassembly (raw-port/re/disasm/ProCore.__ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_.s):
  //
  //   0x31cec  pushq %rbp / movq %rsp, %rbp / pushq %rbx / pushq %rax
  //   0x31cf2  movq  %rdi, %rbx                ; rbx = this  (saved across call)
  //   0x31cf5  movq  %rdx, %rdi                ; rdi = bundle              (arg1)
  //   0x31cf8  movq  %rsi, %rdx                ; rdx = key (the FIRST      (arg3)
  //                                            ;             CFString arg — passed
  //                                            ;             here as the "value"
  //                                            ;             default; libc's
  //                                            ;             _CFBundleCopyLocalizedString
  //                                            ;             uses `value` as the
  //                                            ;             fallback when no
  //                                            ;             localized string
  //                                            ;             matches — so this ctor
  //                                            ;             passes the key itself
  //                                            ;             as the fallback text).
  //                                            ;   [rsi already holds key       — arg2 unchanged]
  //                                            ;   [rcx already holds the SECOND — arg4 unchanged
  //                                            ;    CFString (the tableName)     from caller]
  //   0x31cfb  callq _CFBundleCopyLocalizedString
  //                                            ; ProCore stub 0xddf10 →
  //                                            ; CoreFoundation extern with
  //                                            ; signature:
  //                                            ;   CFStringRef CFBundleCopyLocalizedString(
  //                                            ;     CFBundleRef bundle,
  //                                            ;     CFStringRef key,
  //                                            ;     CFStringRef value,       // fallback
  //                                            ;     CFStringRef tableName);  // .strings file
  //                                            ; Returns a Copy — the caller
  //                                            ; owns a +1 retain, and this
  //                                            ; ctor absorbs it directly
  //                                            ; into `this->ref` without a
  //                                            ; further _CFRetain (matches
  //                                            ; the disasm: no retain call).
  //   0x31d00  movq  %rax, (%rbx)              ; this->ref = returned CFStringRef
  //                                            ; (or NULL if the lookup
  //                                            ; failed — CoreFoundation
  //                                            ; returns NULL when the
  //                                            ; bundle is unresolved).
  //   0x31d03  addq  $0x8, %rsp                ; undo align pad
  //   0x31d07  popq  %rbx / popq %rbp / retq
  //
  // ARG NAMING NOTE. The signature reads "PCString(CFString*, CFBundle*,
  // CFString*)": key first, bundle second, tableName third. The disassembly
  // preserves the SysV ordering (rdi=this, rsi=key, rdx=bundle, rcx=tableName)
  // and then reshuffles to the CFBundleCopyLocalizedString ABI. It does NOT
  // pass a separate "value" argument to CFBundleCopyLocalizedString — it
  // reuses `key` as the fallback (arg3 = original rsi = key) via the
  // `movq %rsi, %rdx` @0x31cf8. This is the standard "localize this
  // CFString identifier within this bundle's tableName.strings file, and
  // if not found, fall back to the identifier text itself" idiom.
  //
  // FRONTIER CALLEE:
  //   _CFBundleCopyLocalizedString — CoreFoundation.framework, TRUE
  //   out-of-scope value-producing extern (returns a CFStringRef with +1
  //   retain). Boundary policy: THROW with @0xADDR, do NOT fabricate a
  //   string value. (Matches the getProChannelBundle.ts
  //   CFBundleGetBundleWithIdentifier_stub pattern.)

  /**
   * `_CFBundleCopyLocalizedString(bundle, key, value, tableName)` —
   * CoreFoundation extern called @ProCore 0x31cfb (stub 0xddf10). Looks
   * up the localized string for `key` in `tableName.strings` inside
   * `bundle`; returns a NEW CFStringRef (+1 retain) which the caller
   * owns. On failure returns `value` (retained), which the caller also
   * owns. Value-producing extern → THROW per raw-port boundary policy;
   * a future harness may wire the real CoreFoundation runtime here.
   */
  private static _CFBundleCopyLocalizedString_stub(
    _bundle: unknown,
    _key: string | null,
    _value: string | null,
    _tableName: string | null,
  ): string | null {
    throw new Error(
      "_CFBundleCopyLocalizedString @ProCore 0x31cfb (stub 0xddf10) — CoreFoundation extern (value-producing, TRUE out-of-scope boundary). Called from PCString::PCString(CFString*, CFBundle*, CFString*) [C1 @0x31cec / C2 @0x31cce] to localize the key within the bundle's tableName.strings file. Not yet transcribed; wire a real CoreFoundation runtime here if a parity harness needs the actual localization.",
    );
  }

  /**
   * @ProCore 0x31cec — PCString::PCString(CFString const* key,
   *                    CFBundle* bundle, CFString const* tableName) [C1].
   *
   * Body semantics: `this->ref = _CFBundleCopyLocalizedString(bundle, key,
   * key, tableName)`. Standard "localize this identifier within this
   * bundle" idiom. Absorbs the +1 retain from the CoreFoundation Copy
   * (no additional _CFRetain in the disasm), so the eventual dtor's
   * _CFRelease @0x31fc2 balances it exactly.
   *
   * `_ctor_cfstr_cfbundle_cfstring` is the SHARED body used by both the
   * C1 (@0x31cec) and C2 (@0x31cce) mangled entry points — the two
   * variants are byte-identical (both non-virtual, no vtable to install),
   * so pointing both at one JS method matches the observable ABI.
   */
  private _ctor_cfstr_cfbundle_cfstring(
    key: string | null,
    bundle: unknown,
    tableName: string | null,
  ): void {
    // @0x31cec..0x31cf1  prologue (no TS-visible effect)
    // @0x31cf2          rbx = this (call-preserved save; unnecessary in JS)
    // @0x31cf5-0x31cf8   register shuffle for CoreFoundation ABI:
    //                    bundle → arg1, key stays arg2, key → arg3 (fallback
    //                    value), tableName is already arg4 from the caller.
    // @0x31cfb          callq _CFBundleCopyLocalizedString(bundle, key,
    //                                                     value=key,
    //                                                     tableName).
    // @0x31d00          this->ref = returned CFStringRef (or NULL).
    this.ref = PCString._CFBundleCopyLocalizedString_stub(
      bundle,
      key,
      key, // arg3 = key (the fallback), per `movq %rsi,%rdx` @0x31cf8
      tableName,
    );
    // @0x31d03..0x31d09  epilogue (no TS-visible effect)
  }

  /**
   * Public C1 entry point at @ProCore 0x31cec —
   * `PCString::PCString(CFString const*, CFBundle*, CFString const*)`.
   *
   * The byte-identical C2 twin @ProCore 0x31cce shares the same body via
   * `_ctor_cfstr_cfbundle_cfstring`. Both mangled symbols are exported
   * here as separate factories so the ABI surface is preserved (two
   * distinct C++ ctor entry points → two distinct static factories).
   *
   *   * `__ZN8PCStringC1EPK10__CFStringP10__CFBundleS2_` → this factory
   *   * `__ZN8PCStringC2EPK10__CFStringP10__CFBundleS2_` → same body
   *      (twin call site — invoke this factory to reproduce it).
   */
  static fromCFString_CFBundle_CFString(
    key: string | null,
    bundle: unknown,
    tableName: string | null,
  ): PCString {
    // Allocate uninitialised (default-ctor lays down ref=null @0x31ab8),
    // then run the C1 body. Mirrors the C++ pattern: caller supplies
    // raw storage `this`, the ctor initialises it fully on return.
    const s = new PCString(); // @0x31ab8
    s._ctor_cfstr_cfbundle_cfstring(key, bundle, tableName); // @0x31cec
    return s;
  }

  // ── Destructor ──────────────────────────────────────────────────
  /**
   * PCString::~PCString() [base]     — @ProCore 0x31fb6
   * PCString::~PCString() [complete] — @ProCore 0x31fd2 (jmp to base)
   *
   *   0x31fb6  push rbp / mov rbp,rsp
   *   0x31fba  movq (%rdi), %rdi         ; rdi = this->ref
   *   0x31fbd  testq %rdi, %rdi          ; if (ref == NULL) skip
   *   0x31fc0  je   0x31fc7
   *   0x31fc2  callq _CFRelease
   *   0x31fc7  pop rbp / retq
   *
   * NOTE: the epilogue at 0x31fc9 is the C++-exception cleanup landing
   * pad (`__clang_call_terminate`), unreachable on the normal path.
   * The destructor does NOT null out the slot after release — the
   * object's storage is going away anyway. */
  destroy(): void {
    // 0x31fba: movq (%rdi), %rdi
    const r = this.ref;
    // 0x31fbd-0x31fc2: if non-null, release
    if (r !== null) {
      _CFRelease(r);
    }
    // Native code leaves `ref` at its previous value; the caller is
    // about to reclaim the storage.  We do the same faithfully.
  }

  // ── Setters ─────────────────────────────────────────────────────

  /**
   * PCString::set(char const*) — @ProCore 0x320ba
   *
   *   0x320ba  push rbp/mov rbp,rsp/push r14/push rbx
   *   0x320c1  movq %rdi, %rbx           ; rbx = this
   *   0x320c4  xorl %edi, %edi           ; alloc = NULL
   *   0x320c6  movl $0x8000100, %edx     ; encoding = UTF8
   *   0x320cb  callq _CFStringCreateWithCString    (rsi already = cstr)
   *   0x320d0  movq %rax, %r14           ; r14 = new_ref
   *   0x320d3  movq (%rbx), %rdi         ; rdi = this->ref
   *   0x320d6  testq %rdi, %rdi          ; if (this->ref != NULL) release
   *   0x320d9  je   0x320e7
   *   0x320db  movq $0x0, (%rbx)         ; this->ref = NULL   (BEFORE release, exception-safe)
   *   0x320e2  callq _CFRelease
   *   0x320e7  movq %r14, (%rbx)         ; this->ref = new_ref
   *   0x320ea  ...                        ; epilogue
   *
   * NOTE: unlike PCString(char const*) this variant does NOT special-
   * case NULL/empty — it just passes cstr straight to CF (which returns
   * NULL for a NULL input, yielding a null ref).  Faithfully mirror. */
  set_cstr(cstr: string | null): void {
    // 0x320cb: create new ref from UTF-8 C-string
    const newRef = _CFStringCreateWithCString(cstr, 0x8000100);
    // 0x320d3-0x320e2: if this->ref is non-null, clear-then-release
    const old = this.ref;
    if (old !== null) {
      // 0x320db: movq $0x0, (%rbx)  — zero the slot BEFORE the release
      // call so that if _CFRelease throws (or reenters), the slot is
      // in a consistent state.
      this.ref = null;
      // 0x320e2: _CFRelease(old)
      _CFRelease(old);
    }
    // 0x320e7: movq %r14, (%rbx)
    this.ref = newRef;
  }

  /**
   * PCString::set(PCString const&) — @ProCore 0x32064
   *
   *   0x32064  push rbp / mov rbp,rsp / push r14 / push rbx
   *   0x3206b  movq %rsi, %r14           ; r14 = &other
   *   0x3206e  movq %rdi, %rbx           ; rbx = this
   *   0x32071  movq (%rdi), %rdi         ; rdi = this->ref
   *   0x32074  testq %rdi, %rdi          ; if (this->ref != NULL) release
   *   0x32077  je   0x32085
   *   0x32079  movq $0x0, (%rbx)         ; this->ref = NULL (pre-release)
   *   0x32080  callq _CFRelease
   *   0x32085  movq (%r14), %rsi        ; rsi = other.ref
   *   0x32088  testq %rsi, %rsi          ; if (other.ref == NULL) done
   *   0x3208b  je   0x32097
   *   0x3208d  xorl %edi, %edi           ; alloc = NULL
   *   0x3208f  callq _CFStringCreateCopy
   *   0x32094  movq %rax, (%rbx)         ; this->ref = rax
   *   0x32097  ...                        ; epilogue
   *
   * NOTE the order: release-then-copy, unlike set(char const*)'s
   * create-then-release.  This means self-assign IS unsafe in the
   * native code (`s.set(s)` releases `s.ref`, then copies from the
   * now-dangling `other.ref` — but at this ABI level `other.ref`
   * has already been loaded into `rsi` at 0x32085 AFTER the release,
   * so it reads the just-nulled slot and produces an empty PCString).
   * We faithfully mirror that ordering. */
  set(other: PCString): void {
    // 0x32071-0x32080: release existing ref (with pre-null)
    const old = this.ref;
    if (old !== null) {
      this.ref = null;   // 0x32079
      _CFRelease(old);   // 0x32080
    }
    // 0x32085: reload other.ref AFTER the release (matches the asm's
    // "movq (%r14), %rsi" placement — hence the observed self-assign
    // quirk above).
    const src = other.ref;
    // 0x32088-0x3208b: null-check
    if (src === null) return;
    // 0x3208f: rax = _CFStringCreateCopy(NULL, src)
    const copied = _CFStringCreateCopy(src);
    // 0x32094: movq %rax, (%rbx)
    this.ref = copied;
  }

  // ── Comparison ──────────────────────────────────────────────────

  /**
   * PCString::compare(PCString const&) const — @ProCore 0x324e4
   *
   *   0x324e4  movq (%rdi), %rdi         ; rdi = this->ref
   *   0x324e7  movq (%rsi), %rsi         ; rsi = other.ref
   *   0x324ea  xorl %eax, %eax           ; result = 0
   *   0x324ec  movq %rdi, %rcx           ; rcx = this->ref
   *   0x324ef  orq  %rsi, %rcx           ; rcx |= other.ref
   *   0x324f2  je   0x32530              ; if (both NULL) return 0
   *   0x324f4  testq %rsi, %rsi          ; al = (other.ref == NULL)
   *   0x324f7  sete %al
   *   0x324fa  testq %rdi, %rdi          ; cl = (this->ref != NULL)
   *   0x324fd  setne %cl
   *   0x32500  orb  %al, %cl             ; cl = A||B where
   *                                       ;   A = (this->ref != NULL)
   *                                       ;   B = (other.ref == NULL)
   *   0x32502  movl $0xffffffff, %eax    ; result = -1 (default for
   *                                       ;   "not both this-null+other-nonnull")
   *   0x32507  cmpb $0x1, %cl
   *   0x3250a  jne  0x32530              ; if (cl != 1) return -1
   *                                       ;   [this-only-null case]
   *   0x3250c  testq %rdi, %rdi          ; cl = (this->ref != NULL)
   *   0x3250f  setne %cl
   *   0x32512  testq %rsi, %rsi          ; dl = (other.ref == NULL)
   *   0x32515  sete %dl
   *   0x32518  movl $0x1, %eax           ; result = +1
   *   0x3251d  testb %dl, %cl            ; if (dl & cl) return +1
   *   0x3251f  jne  0x32530              ;   [other-only-null case]
   *   0x32521  push rbp / mov rbp,rsp
   *   0x32525  movl $0x20, %edx          ; options = kCFCompareNonliteral
   *   0x3252a  callq _CFStringCompare    ; rdi = this->ref, rsi = other.ref
   *   0x3252f  pop rbp
   *   0x32530  retq                       ; return eax
   *
   * Summary of the branch structure the asm computes:
   *   (a, b) := (this->ref, other.ref)
   *   if a == NULL && b == NULL          -> return  0
   *   if a == NULL && b != NULL          -> return -1
   *   if a != NULL && b == NULL          -> return +1
   *   else                                -> return _CFStringCompare(a, b, 0x20)
   *
   * Returns i32 (native symbol returns CFComparisonResult which is a
   * signed long, but at every documented call site it's truncated to
   * -1/0/+1 — matching a 32-bit tri-state). */
  compare(other: PCString): number {
    // 0x324e4/0x324e7: load both refs
    const a = this.ref;
    const b = other.ref;
    // 0x324ec-0x324f2: both-null fast path
    if (a === null && b === null) return 0;
    // 0x324f4-0x3250a: this-null, other-non-null -> -1
    if (a === null) return -1;
    // 0x3250c-0x3251f: this-non-null, other-null -> +1
    if (b === null) return 1;
    // 0x32525-0x3252a: kCFCompareNonliteral (0x20) both non-null path
    return _CFStringCompare(a, b, 0x20);
  }

  // ── Accessor ────────────────────────────────────────────────────

  /**
   * PCString::cf_str() const — @ProCore 0x32368
   * Returns the raw CFStringRef, or the sentinel @"bad cfstring ref"
   * if the slot is null.  Bundled as the canonical read-only accessor.
   *
   *   0x32368  push rbp / mov rbp,rsp
   *   0x3236c  movq (%rdi), %rcx         ; rcx = this->ref
   *   0x3236f  testq %rcx, %rcx
   *   0x32372  leaq @"bad cfstring ref"(%rip), %rax
   *   0x32379  cmovneq %rcx, %rax        ; rax = rcx ? rcx : sentinel
   *   0x3237d  pop rbp / retq */
  cf_str(): string {
    // 0x3236c-0x32379: cmovne sentinel-or-ref
    const r = this.ref;
    return r !== null ? r : BAD_CFSTRING_REF_LITERAL;
  }

  /**
   * Convenience: return the JS string value.  In native ProCore the
   * closest analogue is `createCStr() const` @0x32278 which _malloc's
   * a UTF-8 C-string via _CFStringGetMaximumSizeForEncoding + 
   * _CFStringGetCString and hands ownership to the caller (see the
   * frontier list above — full transcription deferred, as it involves
   * malloc/CoreFoundation-owned byte buffers we don't model).  This
   * accessor exposes the same observable data (the code units) without
   * the malloc/lifetime machinery, mirroring cf_str()'s sentinel
   * semantics for a null ref. */
  toString(): string {
    return this.cf_str();
  }

  /**
   * `PCString::createCStr() const` @ProCore 0x32278
   *   — __ZNK8PCString10createCStrEv
   *
   * Faithful transcription of the 42-line disassembly. Returns a
   * freshly-allocated NUL-terminated UTF-8 C-string that the caller
   * OWNS (must `free()`). Two code paths + a malloc-failure path:
   *
   *   IF this->ref == NULL:  malloc(1); write '\0'; return that.
   *   ELSE:
   *     len   = CFStringGetLength(this->ref)
   *     bound = CFStringGetMaximumSizeForEncoding(len, UTF8=0x8000100)
   *     buf   = malloc(bound + 1)
   *     if (buf == NULL): return NULL      ; malloc-failure branch
   *     CFStringGetCString(this->ref, buf, bound + 1, UTF8)
   *     return buf
   *
   * Full 42-line disasm (transcribed to TS blocks below):
   *
   *   0x32278  pushq   %rbp                    ; frame prologue
   *   0x32279  movq    %rsp, %rbp
   *   0x3227c  pushq   %r15
   *   0x3227e  pushq   %r14
   *   0x32280  pushq   %rbx
   *   0x32281  pushq   %rax                    ; align stack
   *   0x32282  movq    %rdi, %rbx              ; rbx = this
   *   0x32285  movq    (%rdi), %rdi            ; rdi = this->ref
   *   0x32288  testq   %rdi, %rdi              ; ref == NULL ?
   *   0x3228b  je      0x322ca                 ;   -> empty branch @0x322ca
   *
   *   ; ─── NON-NULL BRANCH ─── (0x3228d..0x322c8)
   *   0x3228d  callq   _CFStringGetLength      ; rax = len(ref)
   *   0x32292  movq    %rax, %rdi              ; rdi = len
   *   0x32295  movl    $0x8000100, %esi        ; esi = kCFStringEncodingUTF8
   *   0x3229a  callq   _CFStringGetMaximumSizeForEncoding
   *   0x3229f  movq    %rax, %r15              ; r15 = bound
   *   0x322a2  incq    %r15                    ; r15 = bound + 1  (room for '\0')
   *   0x322a5  movq    %r15, %rdi              ; rdi = bound + 1
   *   0x322a8  callq   _malloc                 ; rax = buf | NULL
   *   0x322ad  testq   %rax, %rax              ; malloc failed ?
   *   0x322b0  je      0x322dc                 ;   -> failure branch @0x322dc
   *   0x322b2  movq    %rax, %r14              ; r14 = buf
   *   0x322b5  movq    (%rbx), %rdi            ; rdi = this->ref (re-loaded)
   *   0x322b8  movq    %rax, %rsi              ; rsi = buf
   *   0x322bb  movq    %r15, %rdx              ; rdx = bound + 1
   *   0x322be  movl    $0x8000100, %ecx        ; ecx = UTF8
   *   0x322c3  callq   _CFStringGetCString     ; writes NUL-terminated bytes into buf
   *   0x322c8  jmp     0x322df                 ; -> epilogue
   *
   *   ; ─── EMPTY (ref==NULL) BRANCH ─── (0x322ca..0x322da)
   *   0x322ca  movl    $0x1, %edi              ; malloc 1 byte
   *   0x322cf  callq   _malloc                 ; rax = buf   ; disasm does NOT
   *                                            ; check the return here — the
   *                                            ; empty branch trusts the alloc
   *   0x322d4  movq    %rax, %r14              ; r14 = buf
   *   0x322d7  movb    $0x0, (%rax)            ; *buf = '\0'
   *   0x322da  jmp     0x322df                 ; -> epilogue
   *
   *   ; ─── MALLOC FAILURE BRANCH ─── (0x322dc..0x322dd)
   *   0x322dc  xorl    %r14d, %r14d            ; r14 = NULL
   *
   *   ; ─── EPILOGUE ─── (0x322df..0x322ec)
   *   0x322df  movq    %r14, %rax              ; return value = buf | NULL
   *   0x322e2  addq    $0x8, %rsp
   *   0x322e6  popq    %rbx
   *   0x322e7  popq    %r14
   *   0x322e9  popq    %r15
   *   0x322eb  popq    %rbp
   *   0x322ec  retq
   *
   * The five FRONTIER CALLEES are all CoreFoundation / libc externs —
   * true out-of-scope symbols modelled as boundary stubs at the top of
   * this file: _CFStringGetLength, _CFStringGetMaximumSizeForEncoding,
   * _CFStringGetCString, _malloc. NO in-scope FCP callees.
   *
   * RETURN-TYPE MODEL: the machine returns a raw `char *`. In JS we
   * return a `{ bytes: string | null; capacity: number } | null` — the
   * same shape `_malloc` hands out — so downstream consumers see the
   * exact allocation record (the C-string content in `bytes`, the
   * requested malloc size in `capacity`). A `null` return means the
   * malloc-failure branch was hit (the middle `xorl %r14d, %r14d`).
   *
   * OWNERSHIP: the caller of the native function must `free()` the
   * returned pointer. In JS `free()` is a no-op (GC subsumes it), so
   * the returned object is simply discarded when the caller drops its
   * reference. The stub-signature `function PCString_createCStr(_s):
   * string` in PCBinaryXMLField.ts is a frontier throw-stub for this
   * exact symbol; that consumer will be re-pointed at this method as
   * a separate landed unit.
   *
   * Source disassembly:
   *   raw-port/re/disasm/ProCore.__ZNK8PCString10createCStrEv.s (42 lines)
   */
  createCStr(): { bytes: string | null; capacity: number } | null {
    // @0x32282  movq %rdi, %rbx        (this preserved in rbx across calls)
    // @0x32285  movq (%rdi), %rdi      ; rdi = this->ref
    // @0x32288..0x3228b  testq rdi,rdi ; je 0x322ca
    const ref = this.ref;
    if (ref === null) {
      // ─── EMPTY (ref==NULL) BRANCH ─── @0x322ca..0x322da
      // @0x322ca  movl $0x1, %edi
      // @0x322cf  callq _malloc          ; malloc 1 byte
      const buf = _malloc(1);
      // The disasm does NOT null-check malloc here (unlike the non-null
      // branch @0x322b0). A faithful port preserves that: if malloc
      // returns NULL, the machine would `movb $0, (%rax)` and segfault.
      // In our stub _malloc never fails, so buf is never NULL — but we
      // model the write-through-buf regardless, and only null-check in
      // the non-null path where the disasm null-checks.
      // @0x322d4  movq %rax, %r14        ; r14 = buf
      // @0x322d7  movb $0x0, (%rax)       ; *buf = '\0'
      buf!.bytes = ""; // one byte allocated, then '\0' written -> empty C-string
      // @0x322da  jmp 0x322df -> epilogue
      // @0x322df  movq %r14, %rax; ...; retq
      return buf;
    }

    // ─── NON-NULL BRANCH ─── @0x3228d..0x322c8
    // @0x3228d  callq _CFStringGetLength      ; rax = CFStringGetLength(ref)
    const len = _CFStringGetLength(ref);
    // @0x32292  movq %rax, %rdi
    // @0x32295  movl $0x8000100, %esi         ; kCFStringEncodingUTF8
    // @0x3229a  callq _CFStringGetMaximumSizeForEncoding
    const bound = _CFStringGetMaximumSizeForEncoding(len, 0x8000100);
    // @0x3229f  movq %rax, %r15
    // @0x322a2  incq %r15                     ; bound + 1 (room for '\0')
    const size = bound + 1;
    // @0x322a5  movq %r15, %rdi
    // @0x322a8  callq _malloc
    const buf = _malloc(size);
    // @0x322ad..0x322b0  testq %rax,%rax ; je 0x322dc
    if (buf === null) {
      // ─── MALLOC FAILURE BRANCH ─── @0x322dc
      // @0x322dc  xorl %r14d,%r14d              ; r14 = NULL
      // @0x322df  movq %r14,%rax; ...; retq     ; return NULL
      return null;
    }
    // @0x322b2  movq %rax, %r14                ; r14 = buf
    // @0x322b5  movq (%rbx), %rdi              ; rdi = this->ref (re-load; the
    //                                          ;  first load was consumed by
    //                                          ;  the earlier calls' rdi)
    // @0x322b8  movq %rax, %rsi                ; rsi = buf
    // @0x322bb  movq %r15, %rdx                ; rdx = size
    // @0x322be  movl $0x8000100, %ecx          ; ecx = UTF8
    // @0x322c3  callq _CFStringGetCString      ; writes NUL-terminated bytes into buf
    //
    // A faithful port re-reads this->ref through rbx here (the disasm
    // re-loads); JS has no aliasing concern between the two callees so
    // the observable outcome is identical. We re-read `this.ref` here
    // to mirror `movq (%rbx), %rdi` @0x322b5, but TS's control-flow
    // narrowing lost the non-null refinement from the outer `if
    // (ref === null) return`; assert with the same value observed
    // above (there is no mutation between the two reads).
    const refReload = this.ref;
    if (refReload === null) {
      // Unreachable in practice: no mutation between the outer null-check
      // at @0x32288 and the re-load at @0x322b5. Kept here purely to
      // narrow TypeScript's type; if this branch ever fires, some caller
      // has mutated `this.ref` between the CF calls (which the disasm
      // does not permit because the machine holds the ref value in %rdi
      // register lifetime across the calls — but re-loads it before
      // CFStringGetCString for a reason we haven't decoded).
      // The machine would segfault here (`movq (%rbx), %rdi` -> %rdi=NULL
      // -> CFStringGetCString(NULL, ...) crash). Return NULL to model that
      // as a JS-visible failure signal.
      return null;
    }
    _CFStringGetCString(refReload, buf, size, 0x8000100);
    // @0x322c8  jmp 0x322df                     ; -> epilogue
    // @0x322df  movq %r14,%rax; ...; retq
    return buf;
  }

  /**
   * PCString::PCString(unsigned short const*) [C1 complete ctor] — @ProCore 0x31eac
   *   (__ZN8PCStringC1EPKt)
   * PCString::PCString(unsigned short const*) [C2 base ctor]     — @ProCore 0x31e7a
   *   (__ZN8PCStringC2EPKt) — byte-identical twin, instruction for instruction
   *
   * Builds the CFString from a NUL-TERMINATED buffer of UTF-16 code units. Full
   * disasm (raw-port/re/disasm/ProCore.__ZN8PCStringC1EPKt.s — the C2 body at
   * 0x31e7a is the same 19 instructions at a 0x32-lower address):
   *
   *   0x31eac  testq  %rsi, %rsi              ; if (chars == NULL)
   *   0x31eaf  je     0x31edd                 ;   -> the bare retq: RETURNS WITHOUT
   *                                            ;   WRITING this->ref AT ALL (see below)
   *   0x31eb1  pushq  %rbp                    ; frame prologue — built only on the
   *   0x31eb2  movq   %rsp, %rbp              ; non-null path
   *   0x31eb5  pushq  %rbx
   *   0x31eb6  pushq  %rax                    ; 16-byte stack alignment padding
   *   0x31eb7  movq   %rdi, %rbx              ; rbx = this
   *   0x31eba  movq   $-0x1, %rdx             ; rdx = -1  — the scan cursor
   *   0x31ec1  cmpw   $0x0, 0x2(%rsi,%rdx,2)  ; compare chars[rdx + 1] against 0
   *                                            ; (base+2 with a *2 scale IS the +1)
   *   0x31ec7  leaq   0x1(%rdx), %rdx         ; rdx += 1  [lea does NOT touch flags]
   *   0x31ecb  jne    0x31ec1                 ; loop while that unit was non-zero
   *   0x31ecd  xorl   %edi, %edi              ; alloc = NULL (kCFAllocatorDefault)
   *   0x31ecf  callq  0xde078                 ; _CFStringCreateWithCharacters(
   *                                            ;   NULL, %rsi = chars, %rdx = count)
   *   0x31ed4  movq   %rax, (%rbx)            ; this->ref = the new CFStringRef
   *   0x31ed7  addq   $0x8, %rsp              ; epilogue
   *   0x31edb  popq   %rbx
   *   0x31edc  popq   %rbp
   *   0x31edd  retq
   *
   * TWO details that are easy to get wrong, both measured below:
   *
   * 1. THE SCAN IS OFF BY ONE ON PURPOSE. `rdx` starts at -1 and the compare
   *    addresses `chars[rdx + 1]`, so the FIRST unit tested is chars[0]; because
   *    `leaq` does not disturb flags, the `jne` still reads the compare that ran
   *    BEFORE the increment. On exit `rdx` therefore holds the INDEX OF THE NUL,
   *    i.e. exactly the code-unit count, and that register is already the third
   *    argument to the CF call — the count excludes the terminator. An empty
   *    string (chars[0] == 0) exits with rdx = 0 after one iteration.
   * 2. THE NULL-POINTER PATH WRITES NOTHING. `je 0x31edd` jumps to the bare
   *    `retq` BEFORE the frame is even built, so `this->ref` keeps whatever the
   *    caller's storage held — in C++ that is uninitialised memory, not null.
   *    (Verified on the live binary: with the slot pre-poisoned to
   *    0xDEADBEEFCAFEF00D, 50/50 NULL calls left the poison in place.) The TS
   *    model reaches this ctor through `fromChar16`, which starts from the
   *    default ctor's `ref = null` @0x31ab8, so the field is observably null —
   *    the closest faithful representation available in a language with no
   *    uninitialised storage, and it is called out here rather than papered over.
   *
   * The scan is on 16-bit UNITS (`cmpw`), not bytes: an ASCII string in UTF-16
   * has a zero high byte in every unit, so a byte-wise scan would stop at
   * length 0 for "A". Nothing in the body validates surrogate pairing.
   *
   * ORACLE: verified against the live ProCore binary. Both entry points are
   * EXPORTED (`nm -arch x86_64` type `T`: C1 @0x31eac, C2 @0x31e7a), and the CF
   * callee is real CoreFoundation in-process, so the harness
   * (raw-port/re/oracle/PCString_ctor_char16_oracle.py) dlopens ProCore under
   * `arch -x86_64 /usr/bin/python3` — the port cites x86_64 offsets, and the
   * arm64 slice would be a body it never read — calls the real ctor on a
   * poisoned 8-byte object, then reads the stored CFStringRef back with the REAL
   * CFStringGetLength / CFStringGetCharacters, which observes the count the scan
   * computed directly. THIS function is what the corpus is fed to — the harness
   * pipes the same buffers through `tsx` into
   * raw-port/re/oracle/PCString_ctor_char16_driver.ts, so the comparison is
   * live-binary vs the REAL TypeScript below, not vs a re-implementation of it
   * (a Python model of the same body is kept as a third opinion, and both agree).
   * Code units, never JS strings, travel on that wire: the corpus contains lone
   * surrogates on purpose. 315 cases (empty, 1..299 units, 0xFFFF, 0x0001,
   * latin-1, CJK, a surrogate PAIR, a LONE high surrogate, a LONE low surrogate,
   * an EMBEDDED NUL, 64/255-unit strings, and 300 random buffers): 315/315
   * code-unit-identical to this port; the NULL path left the field untouched
   * 50/50 (and the port answers `ref === null` there); the C2 twin agreed with C1
   * on 60/60.
   * NEGATIVE CONTROLS (measured, same 315 cases): including the terminator in
   * the count -> 315 wrong; an off-by-one-short count -> 303 wrong; scanning for
   * a zero BYTE instead of a zero UNIT -> 17 wrong; ignoring the embedded NUL
   * and taking the whole buffer -> 1 wrong.
   *
   * @param chars — the UTF-16 buffer (SysV %rsi), NUL-terminated. `null` models
   *                the NULL pointer the `testq`/`je` guard tests for.
   */
  private _ctor_char16(chars: Uint16Array | null): void {
    // @0x31eac/@0x31eaf — testq %rsi,%rsi ; je 0x31edd : a NULL pointer returns
    //   immediately, leaving `this.ref` exactly as the caller's storage had it.
    //   No store, no CF call, not even a frame.
    if (chars === null) return;
    // @0x31eba..@0x31ecb — the NUL scan. Transcribed as the machine runs it:
    //   cursor starts at -1, each pass tests chars[cursor + 1] and then bumps
    //   the cursor, and the loop continues while the tested unit was non-zero,
    //   so on exit `cursor` is the index of the terminator = the unit count.
    let cursor = -1; // @0x31eba movq $-0x1, %rdx
    for (;;) {
      const index = cursor + 1;
      if (index >= chars.length) {
        // The machine has NO bounds check here: it would read whatever 16 bits
        // follow the buffer and keep scanning (unterminated input is UB in C).
        // That is not modellable in TS, so this is the loud gap PORTING_SPEC
        // Rule 3 requires rather than a guess — and it keeps the read below in
        // range, which is what makes the index provably safe instead of
        // `undefined -> NaN` (gate G7 / OPS_LOG #13).
        throw new Error(
          'PCString(unsigned short const*) @ProCore 0x31ec1: the NUL scan ran past ' +
            'the end of the buffer — the machine reads adjacent memory there and ' +
            'this port will not invent what it finds; pass a NUL-terminated buffer',
        );
      }
      const unit = chars[index]; // @0x31ec1 cmpw $0x0, 0x2(%rsi,%rdx,2)
      cursor = index; // @0x31ec7 leaq 0x1(%rdx), %rdx (flags untouched)
      if (unit === 0) break; // @0x31ecb jne 0x31ec1 — falls out when it WAS zero
    }
    // @0x31ecd/@0x31ecf — xorl %edi,%edi (alloc = NULL) ; callq the CF stub with
    //   %rsi = chars unchanged and %rdx = cursor (the count, terminator excluded).
    const created = _CFStringCreateWithCharacters(chars, cursor);
    // @0x31ed4 — movq %rax, (%rbx) : this->ref = the returned CFStringRef.
    this.ref = created;
  }

  /**
   * PCString::PCString(unsigned short const*) — public C1 entry point at
   * @ProCore 0x31eac (byte-identical C2 twin at @ProCore 0x31e7a). A static
   * factory for the same reason `fromCFString` @0x31f54 is one: JS has no
   * overloading, and this ctor's `unsigned short const*` argument is a
   * DIFFERENT native symbol with a DIFFERENT body from the `char const*` ctor
   * @0x31ad4 that the polymorphic `constructor(...)`'s string arm routes to
   * (that one calls _CFStringCreateWithCString and substitutes a sentinel for
   * an empty input; this one calls _CFStringCreateWithCharacters and has no
   * sentinel path at all).
   */
  static fromChar16(chars: Uint16Array | null): PCString {
    // The default ctor lays down `this->ref = null` @0x31ab8 into the caller's
    // storage before the C1 body runs — see the note on the NULL path above.
    const s = new PCString(); // @0x31ab8 (default ctor sets ref = null)
    s._ctor_char16(chars); // @0x31eac (C1 char16 ctor body)
    return s;
  }
}
