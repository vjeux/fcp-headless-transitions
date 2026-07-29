// raw-port/src/infra/Json.ts
//
// FCP `Json::` free functions (ProCore.framework). This is the vendored JsonCpp
// namespace-scope helpers (`__ZN4Json...`) — not the top-level Json::Value/
// Json::Reader/Json::Writer classes (which live in their own translation units
// and are enumerated separately in the ledger). This file ports the SIX
// namespace-scope functions the coordinator asked for:
//
//   Json::valueToString(bool)                         @ProCore 0xd1b4e   (real)
//   Json::normalizeEOL(char const*, char const*)      @ProCore 0xc7d1a   (real)
//   Json::codePointToUTF8(uint32_t)                   @ProCore 0xc8a55   (real)
//   Json::duplicateAndPrefixStringValue(char const*, uint32_t)  @ProCore 0xce51d  (real)
//   Json::throwLogicError(std::string const&)         @ProCore 0xce05c   (real: throws Error)
//   Json::throwRuntimeError(std::string const&)       @ProCore 0xc6c75   (real: throws Error)
//
// The C++ signatures return `std::string` by value; the corresponding TS
// ports return a plain `string` (the observable byte sequence). SSO buffer
// mechanics from the disassembly (short-string bit at *buf, long-form data
// ptr at *(buf+0x10), long-form length at *(buf+0x8)) are transcribed as
// COMMENTS but modelled as a JS string — matching the caller-visible
// contract exactly.
//
// duplicateAndPrefixStringValue returns a raw malloc-allocated buffer of
// the form `[u32 length][length bytes][NUL]`. In TS/JS we can't reproduce a
// raw C `char*`; the port returns a `Uint8Array` of length+5, matching the
// same byte layout that a caller would see through the returned pointer.
// (JsonCpp uses this "length-prefixed cstring" only inside Json::Value's
// internal string storage; every user-visible read/write is via the length
// prefix, never via strlen.)
//
// Provenance:
//   raw-port/re/disasm/ProCore.Json.valueToString.s               (17 lines)
//   raw-port/re/disasm/ProCore.Json.normalizeEOL.s                (54 lines)
//   raw-port/re/disasm/ProCore.Json.codePointToUTF8.s            (117 lines)
//   raw-port/re/disasm/ProCore.Json.duplicateAndPrefixStringValue.s (71 lines)
//   raw-port/re/disasm/ProCore.Json.throwLogicError.s             (22 lines)
//   raw-port/re/disasm/ProCore.Json.throwRuntimeError.s           (21 lines)

// ---------------------------------------------------------------------------
// Json::valueToString(bool)   @ProCore 0xd1b4e
// ---------------------------------------------------------------------------
// Body (17 lines, no branches, no math):
//   leaq   0x6488e(%rip), %rcx   ; %rcx = &".true"[1] literal ("true")
//   leaq   0x6488c(%rip), %rax   ; %rax = literal "false"
//   testl  %esi, %esi            ; ZF = (bool arg == 0)
//   cmovneq %rcx, %rax           ; if arg != 0, %rax = "true" else %rax = "false"
//   movq   %rax, %rsi
//   callq  std::basic_string<char>::basic_string<0>(char const*)   ; construct result
//   return %rbx (the caller-supplied std::string slot)
//
// Semantics: returns "true" if arg is true, "false" otherwise. Trivial mapping.
export function Json_valueToString(v: boolean): string {
  return v ? "true" : "false";
}

// ---------------------------------------------------------------------------
// Json::normalizeEOL(char const* begin, char const* end)   @ProCore 0xc7d1a
// ---------------------------------------------------------------------------
// Body (54 lines): reads [begin, end) byte-by-byte, appending each to a
// std::string (initialised empty with `reserve(end - begin)`). CR (0x0d) is
// canonicalised to LF (0x0a): a bare CR becomes LF, a CRLF pair becomes a
// single LF (the LF is skipped over — pointer advanced by 2, not 1). All
// other bytes pass through as-is.
//
// Control flow map:
//   %rbx = caller's std::string    (SSO-zero-inited @0xc7d2e..0xc7d34)
//   reserve(end - begin)           @0xc7d3c..0xc7d42
//   %r15 = p (cursor);  %r14 = end
//   loop @0xc7d47:
//     if (p == end) return
//     %r12 = p + 1
//     al = *p
//     if (al == 0x0d) {                       // CR
//       if (p+1 != end && *(p+1) == 0x0a) {   // CRLF pair
//         p += 2; r12 = p                     // advance past both, next slot = p+2
//       }
//       push_back('\n')                       // emit LF
//     } else {
//       push_back(al)                          // pass-through
//     }
//     p = r12
//     goto loop
//
// TS port: use string concat + normal loop. The `signed byte` movsbl is
// preserved by keeping charCodeAt() (all our chars are 0..255 in Latin-1
// interpretation; JSON is UTF-8-agnostic here since we're comparing bytes).
export function Json_normalizeEOL(input: string): string {
  // The FCP function takes (begin, end) pointers into a byte range; in TS we
  // take the equivalent byte range as a whole string. We iterate by
  // codeUnit index — since CR/LF are ASCII (single UTF-16 code units), there's
  // no surrogate-pair concern for the control chars themselves.
  let out = "";
  const n = input.length;                              // @0xc7d3f..0xc7d42: reserve(end-begin)
  // (JS strings auto-grow; the reserve() call is comment-only.)
  void n;
  let p = 0;
  const end = input.length;
  while (p !== end) {                                  // @0xc7d47..0xc7d4a
    let next = p + 1;                                  // @0xc7d4c: r12 = p+1
    const c = input.charCodeAt(p) & 0xff;              // @0xc7d50: movb (%r15), %al
    if (c === 0x0d) {                                  // @0xc7d53/@0xc7d55
      if (next !== end && (input.charCodeAt(next) & 0xff) === 0x0a) {
        // CRLF pair: advance TWO bytes and only emit one LF.
        // @0xc7d57..0xc7d67: `addq $2, %r15 ; movq %r15, %r12`
        p += 2;
        next = p;
      }
      out += "\n";                                     // @0xc7d6a..0xc7d72: push_back('\n')
    } else {
      // @0xc7d79..0xc7d7f: `movsbl %al, %esi ; push_back(al)`
      out += String.fromCharCode(c);
    }
    p = next;                                          // @0xc7d84: %r15 = %r12
  }
  return out;                                          // @0xc7d8c..0xc7d97
}

// ---------------------------------------------------------------------------
// Json::codePointToUTF8(uint32_t cp)   @ProCore 0xc8a55
// ---------------------------------------------------------------------------
// Body (117 lines): initialises a zero std::string (empty), then dispatches
// on the Unicode range of `cp` and emits 1, 2, 3, or 4 UTF-8 bytes. cp >
// 0x10FFFF returns the empty string. Threshold table:
//
//   cp <= 0x7F      1 byte:  cp
//   cp <= 0x7FF     2 bytes: 0xC0 | (cp >> 6),           0x80 | (cp        & 0x3F)
//   cp <= 0xFFFF    3 bytes: 0xE0 | (cp >>12),           0x80 | ((cp >> 6) & 0x3F), 0x80 | (cp & 0x3F)
//   cp <= 0x10FFFF  4 bytes: 0xF0 | (cp >>18),           0x80 | ((cp >>12) & 0x3F), 0x80 | ((cp >> 6) & 0x3F), 0x80 | (cp & 0x3F)
//   cp >  0x10FFFF  empty
//
// The disasm resizes(N) FIRST, then writes each continuation byte at a
// fixed positive offset from the string's data pointer, and writes the
// first (highest-order) byte LAST via r14b — this ordering is preserved
// in the TS port only for provenance narration; the final byte content is
// identical to a straight top-down encoding.
//
// SSO peek: `testb $0x1, (%rbx)` selects the long form (data ptr at
// [%rbx+0x10]) vs short form (data starts at %rbx+1). We collapse both
// paths to appending a string, since JS has no visible SSO.
export function Json_codePointToUTF8(cp: number): string {
  // uint32_t param: mask to 32 bits (matches `movl %esi, %r14d` @0xc8a5c).
  const u = cp >>> 0;
  if (u <= 0x7f) {                                     // @0xc8a70..0xc8a73
    return String.fromCharCode(u);
  }
  if (u <= 0x7ff) {                                    // @0xc8a96..0xc8a9d
    return String.fromCharCode(0xc0 | (u >>> 6)) + String.fromCharCode(0x80 | (u & 0x3f));
  }
  if (u <= 0xffff) {                                   // @0xc8ad7..0xc8ade
    return (
      String.fromCharCode(0xe0 | (u >>> 12)) +
      String.fromCharCode(0x80 | ((u >>> 6) & 0x3f)) +
      String.fromCharCode(0x80 | (u & 0x3f))
    );
  }
  if (u <= 0x10ffff) {                                 // @0xc8b30..0xc8b37
    return (
      String.fromCharCode(0xf0 | (u >>> 18)) +
      String.fromCharCode(0x80 | ((u >>> 12) & 0x3f)) +
      String.fromCharCode(0x80 | ((u >>> 6) & 0x3f)) +
      String.fromCharCode(0x80 | (u & 0x3f))
    );
  }
  // @0xc8b37: `ja 0xc8bae` — falls through directly to the `mov %rbx, %rax ;
  // ret` epilogue, leaving the zero-initialised empty string as the result.
  return "";
}

// ---------------------------------------------------------------------------
// Json::duplicateAndPrefixStringValue(char const* value, uint32_t length)
//   @ProCore 0xce51d
// ---------------------------------------------------------------------------
// Body (71 lines): allocates a raw C buffer of (length + 5) bytes via malloc.
// Layout of the returned buffer:
//     [0..3]     u32 little-endian length     (`movl %r14d, (%rax)` @0xce551)
//     [4..4+len) `length` bytes copied from `value`  (memcpy @0xce561)
//     [4+len]    0x00 NUL terminator                (@0xce566)
//
// Guards (both throw C++ exceptions):
//   if length >= 0x7FFFFFFB:  Json::throwLogicError("in Json::Value::duplicateAndPrefixStringValue(): length too big for prefixing")
//   if malloc == nullptr:     Json::throwRuntimeError("in Json::Value::duplicateAndPrefixStringValue(): Failed to allocate string value buffer")
//
// TS port: return a Uint8Array of length+5 with the identical layout. malloc
// failure has no analogue in JS (allocation throws on OOM naturally); we still
// gate on the too-big check to match the C++ semantics exactly.
export function Json_duplicateAndPrefixStringValue(value: Uint8Array | string, length: number): Uint8Array {
  const u = length >>> 0;                              // @0xce537: movl %esi, %r14d
  if (u >= 0x7ffffffb) {                               // @0xce52f..0xce535: `cmpl $0x7ffffffb, %esi ; jae ...`
    Json_throwLogicError(
      "in Json::Value::duplicateAndPrefixStringValue(): length too big for prefixing",
    );                                                 // @0xce5b6
  }
  // @0xce53d..0xce541: malloc(len+5). @0xce546..0xce549: null-check falls to
  // throwRuntimeError. In JS, `new Uint8Array(N)` cannot silently return null
  // — it throws RangeError on absurdly-large N, which is the observably-same
  // behavior (a synchronous throw of an Error).
  const buf = new Uint8Array(u + 5);                   // @0xce541 malloc(len+5)
  // Little-endian u32 length prefix (`movl %r14d, (%rax)` @0xce551 — x86 is LE).
  buf[0] = u & 0xff;
  buf[1] = (u >>> 8) & 0xff;
  buf[2] = (u >>> 16) & 0xff;
  buf[3] = (u >>> 24) & 0xff;
  // @0xce554..0xce561: memcpy(rax+4, value, len)
  if (typeof value === "string") {
    for (let i = 0; i < u; i++) buf[4 + i] = value.charCodeAt(i) & 0xff;
  } else {
    buf.set(value.subarray(0, u), 4);
  }
  // @0xce566: `movb $0x0, 0x4(%r15,%r12)` — write NUL at offset 4+len.
  buf[4 + u] = 0;
  return buf;                                          // @0xce56c: mov %r15, %rax; ret
}

// ---------------------------------------------------------------------------
// Json::throwLogicError(std::string const& msg)   @ProCore 0xce05c
// ---------------------------------------------------------------------------
// Body (22 lines):
//   __cxa_allocate_exception(0x20)           @0xce06b
//   Json::LogicError::LogicError(*, msg&)    @0xce079 (in-place construct exception object)
//   __cxa_throw(*, &typeinfo, &~LogicError)  @0xce08f
// The `movq %rax, %r14 ; ... __Unwind_Resume` tail is the landing-pad for a
// throw in the ctor — it can't be reached from a normal invocation.
//
// In TS we throw a JS Error carrying the tag "Json::LogicError" so the
// caller can dispatch on it. This is the observable contract exposed to
// downstream code (JsonCpp's public API surfaces LogicError as a subclass
// of std::logic_error whose only visible field is `what()` = msg).
export function Json_throwLogicError(msg: string): never {
  const err = new Error(msg);
  err.name = "Json::LogicError";
  throw err;
}

// ---------------------------------------------------------------------------
// Json::throwRuntimeError(std::string const& msg)   @ProCore 0xc6c75
// ---------------------------------------------------------------------------
// Body (21 lines) — identical shape to throwLogicError but constructs a
// Json::RuntimeError instead:
//   __cxa_allocate_exception(0x20)             @0xc6c84
//   Json::RuntimeError::RuntimeError(*, msg&)  @0xc6c92
//   __cxa_throw(*, &RuntimeError_typeinfo, &~RuntimeError)  @0xc6ca8
export function Json_throwRuntimeError(msg: string): never {
  const err = new Error(msg);
  err.name = "Json::RuntimeError";
  throw err;
}
