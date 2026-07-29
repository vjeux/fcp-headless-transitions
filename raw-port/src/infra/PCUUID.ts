// PCUUID.ts — FCP ProCore PCUUID:
// 128-bit UUID canonical string formatter.
//
// FRAMEWORK: ProCore.framework (Final Cut Pro).
// DECODE: raw-port/re/disasm/ProCore.PCUUID.toCStr.s
//         (captured symbol __ZNK6PCUUID6toCStrEv @0x21994 on x86_64 slice VA.)
//
// STRUCT LAYOUT (recovered from field loads at 0x219c2..0x219cd + duplicate at 0x21a06..0x21a2d):
//   sizeof = 0x10 (16 bytes) — a 128-bit UUID stored as four little-endian uint32 words.
//     +0x00  uint32  field0  (read via `movl (%r14), %ecx`          @0x219c2)
//     +0x04  uint32  field1  (read via `movl 0x4(%r14), %r8d`       @0x219c5)
//     +0x08  uint32  field2  (read via `movl 0x8(%r14), %r9d`       @0x219c9)
//     +0x0C  uint32  field3  (read via `movl 0xc(%r14), %eax`       @0x219cd)
//   The four fields are passed to `snprintf` in that order as %08X arguments — so the
//   canonical stringification treats them as big-endian-hex-uppercase words.
//
// EXPORTED SYMBOLS (one method — from the class brief):
//   @ProCore 0x0000000000021994  toCStr() const
//
// SEMANTICS (from toCStr disasm @0x21994-0x21a4b):
//   Produces a canonical 36-character UUID string of the form
//       "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"  (8-4-4-4-12 uppercase hex, dashes at 8/13/18/23)
//   followed by a null terminator. The output is allocated on the heap via calloc(1, 0x29)
//   (41 bytes, zero-filled), so the trailing bytes past position 35 are all NUL.
//
//   Algorithm:
//     1. `calloc(0x29, 1)`  →  41-byte zeroed heap buffer (`buf`).
//     2. Format the 4 uint32 fields into a stack buffer via
//          snprintf(stack, 0x28, "%08X%08X%08X%08X", field0, field1, field2, field3)
//        (@0x219b0-0x219e9). This produces 32 uppercase-hex characters at stack[0..31] plus
//        a NUL at stack[32].
//     3. Pre-fill `buf` with the dash-and-spaces template that matches the UUID skeleton:
//          buf[0..7]   = "        "                (8 spaces)   ← from xmm0 movups literal
//          buf[8]      = '-'                                    ← from xmm0 movups literal
//          buf[9..12]  = "    "                    (4 spaces)   ← from xmm0 movups literal
//          buf[13]     = '-'                                    ← from xmm0 movups literal
//          buf[14..15] = "  "                      (2 spaces)   ← from xmm0 movups literal
//          buf[16..17] = "  "                      (2 spaces)   ← from imm 0x2d202020202d2020
//          buf[18]     = '-'                                    ← from imm 0x2d202020202d2020
//          buf[19..22] = "    "                    (4 spaces)   ← from imm 0x2d202020202d2020
//          buf[23]     = '-'                                    ← from imm 0x2d202020202d2020
//        (@0x219ee-0x21a03; the 16-byte movups from RIP + the 8-byte movabsq at 0x10 into buf
//        exactly land on positions 0-15 and 16-23 respectively.)
//     4. Splice the 8-char hex fields from the stack buffer over the template:
//          buf[0..7]   = stack[0..7]    (field0's 8 hex chars)   @0x21a06-0x21a09  movq
//          buf[9..12]  = stack[8..11]   (field1 hi 4 hex chars)  @0x21a0c-0x21a10  movl
//          buf[14..17] = stack[12..15]  (field1 lo 4 hex chars)  @0x21a13-0x21a17  movl
//          buf[19..22] = stack[16..19]  (field2 hi 4 hex chars)  @0x21a1a-0x21a1e  movl
//          buf[24..31] = stack[20..27]  (field2 lo 4 hex + field3 hi 4 hex) @0x21a21-0x21a25 movq
//          buf[32..35] = stack[28..31]  (field3 lo 4 hex chars)  @0x21a29-0x21a2d  movl
//        The dashes at positions 8/13/18/23 survive from step 3 because none of the splice
//        writes touch those bytes; positions 36-40 remain NUL from calloc.
//     5. Stack cookie check (@0x21a30-0x21a4b) — abort if the canary changed; otherwise return
//        the heap buffer pointer.
//
// FRONTIER (deferred — cited as throwing stubs below):
//   • __stack_chk_fail — libc canary-mismatch abort (never triggered for correct memory).
//     @ProCore 0x21a4c  callq 0x3c4e02  ## symbol stub for: ___stack_chk_fail
//     Reachable only under memory corruption; we transcribe the check but the failure branch
//     is a hardened abort.
//
// Called stubs (transcribed inline as JS-native equivalents; each cites its call-site addr):
//   • _calloc(1, 0x29)          @ProCore 0x219ba  callq 0xde7a4   → allocates 41-byte zeroed buf.
//   • _snprintf(buf, 0x28, ...) @ProCore 0x219e9  callq 0xdeb3a   → writes 32 hex chars + NUL.
//   • _stack_chk_guard          @0x148220 (via `movq 0x126877(%rip), %rax` @0x219a2)  → canary.
//
// STRING CONSTANTS (recovered by reading __TEXT bytes at RIP-rel targets):
//   @ProCore 0x131a05  "%08X%08X%08X%08X\0"     (format string; passed as %rdx to snprintf)
//   @ProCore 0x131a16  16 bytes: "        -    -  "   (buf[0..15] template loaded by xmm0)
//   Imm     0x2d202020202d2020  8 bytes: "  -    -"    (buf[16..23] template — little-endian)
//
// NOTE ON C++ SEMANTICS: The C++ signature is `char const* toCStr() const`. The returned
// pointer references a freshly heap-allocated buffer owned by the caller (no ref-counting
// visible on the buffer). The port therefore returns a plain JS string, which matches the
// observable output (the caller only reads bytes; it never mutates or frees under our nose).

// ── Recovered constants ──────────────────────────────────────────────────────────────────

// Format string @ProCore __TEXT 0x131a05 — verified by reading 17 bytes at that offset in
// /tmp/ProCore.x86_64 (FAT-slice VA == file offset).
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const K_snprintf_fmt = "%08X%08X%08X%08X";        // @ProCore 0x131a05  passed to snprintf @0x219e9

// Dash positions in the UUID canonical form 8-4-4-4-12. Derived from the template writes:
//   buf[8]  = '-'  (from xmm0 movups literal @0x131a16 + position 8)
//   buf[13] = '-'  (from xmm0 movups literal @0x131a16 + position 13)
//   buf[18] = '-'  (from imm 0x2d202020202d2020 written to buf+0x10, i.e. position 16+2)
//   buf[23] = '-'  (from imm 0x2d202020202d2020 written to buf+0x10, i.e. position 16+7)
// These are exactly the standard UUID dash offsets.

// ── Frontier stubs ───────────────────────────────────────────────────────────────────────

/**
 * `__stack_chk_fail` — libc canary-mismatch abort. Never returns.
 *   @ProCore 0x21a4c  callq 0x3c4e02   ## symbol stub for: ___stack_chk_fail
 *
 * Reached only when the stack cookie loaded from `__stack_chk_guard` @0x148220 differs
 * from the value that was captured on entry (@0x219a2-0x219ac). In JS we can never
 * observe this — the stack cookie protects the native `stack` buffer used by snprintf,
 * which has no analogue in JS. The compare-and-branch is transcribed for provenance but
 * cannot fire under a faithful JS reimplementation.
 */
function stack_chk_fail_stub(): never {
  throw new Error(
    "___stack_chk_fail @ProCore 0x21a4c is not reachable from JS (no native stack buffer) — " +
      "citation preserved for provenance; the underlying libc symbol aborts the process.",
  );
}

// ── The class ────────────────────────────────────────────────────────────────────────────

/**
 * PCUUID — 128-bit UUID value type.
 *
 * Layout (16 bytes) recovered from `toCStr` @ProCore 0x21994 (see file header):
 *   +0x00  uint32  field0
 *   +0x04  uint32  field1
 *   +0x08  uint32  field2
 *   +0x0C  uint32  field3
 *
 * All four fields are formatted through `%08X` in `snprintf`, so they are treated as
 * unsigned 32-bit big-endian-hex-uppercase words in the canonical string. JS numbers can
 * hold uint32 exactly, so we use plain `number` (validated via `>>> 0` at read time).
 */
export class PCUUID {
  /** +0x00 — first 32-bit word of the UUID. */
  field0: number;
  /** +0x04 — second 32-bit word of the UUID. */
  field1: number;
  /** +0x08 — third 32-bit word of the UUID. */
  field2: number;
  /** +0x0C — fourth 32-bit word of the UUID. */
  field3: number;

  constructor(field0: number, field1: number, field2: number, field3: number) {
    // Force uint32 semantics (mirrors `movl` from struct offsets — 32-bit loads).
    this.field0 = field0 >>> 0;
    this.field1 = field1 >>> 0;
    this.field2 = field2 >>> 0;
    this.field3 = field3 >>> 0;
  }

  /**
   * toCStr() const  →  char const*
   * @ProCore 0x0000000000021994  (__ZNK6PCUUID6toCStrEv)
   *
   * DECODE (raw-port/re/disasm/ProCore.PCUUID.toCStr.s):
   *   0x21994-0x219ac  frame setup + capture stack canary from @0x148220 → -0x18(rbp)
   *   0x219b0-0x219ba  edi=0x29, esi=0x1 ; callq _calloc  → rax = calloc(1, 0x29) → 41-byte zeroed buf
   *   0x219bf         movq %rax, %rbx     → save `buf` in rbx
   *   0x219c2-0x219cd  load field0/1/2/3 from `this` into ecx, r8d, r9d, eax (%eax spilled)
   *   0x219d1         movl %eax, (%rsp)   → 4th snprintf arg on stack (field3)
   *   0x219d4         leaq @0x131a05, %rdx → fmt = "%08X%08X%08X%08X"
   *   0x219db         leaq -0x40(%rbp), %r14 → stack buffer address
   *   0x219df-0x219e4  rdi=stack, esi=0x28 → snprintf(stack, 40, fmt, field0, field1, field2, field3)
   *   0x219e7         xorl %eax, %eax     → number of xmm args = 0
   *   0x219e9         callq _snprintf     → writes 32 hex chars at stack[0..31] + NUL @stack[32]
   *   0x219ee-0x219f8  movabsq $0x2d202020202d2020, %rax ; movq %rax, 0x10(%rbx)
   *                     → buf[0x10..0x17] = "  -    -"  (template for positions 16..23)
   *   0x219fc-0x21a03  movups @0x131a16(%rip), %xmm0 ; movups %xmm0, (%rbx)
   *                     → buf[0x00..0x0f] = "        -    -  "  (template for positions 0..15)
   *   0x21a06-0x21a09  movq (%r14), %rax ; movq %rax, (%rbx)
   *                     → buf[0..7] = stack[0..7]  (field0's 8 hex chars, overwriting spaces)
   *   0x21a0c-0x21a10  movl 0x8(%r14), %eax ; movl %eax, 0x9(%rbx)
   *                     → buf[9..12] = stack[8..11]  (field1 hi 4 hex chars)
   *   0x21a13-0x21a17  movl 0xc(%r14), %eax ; movl %eax, 0xe(%rbx)
   *                     → buf[14..17] = stack[12..15]  (field1 lo 4 hex chars)
   *   0x21a1a-0x21a1e  movl 0x10(%r14), %eax ; movl %eax, 0x13(%rbx)
   *                     → buf[19..22] = stack[16..19]  (field2 hi 4 hex chars)
   *   0x21a21-0x21a25  movq 0x14(%r14), %rax ; movq %rax, 0x18(%rbx)
   *                     → buf[24..31] = stack[20..27]  (field2 lo 4 + field3 hi 4 hex chars)
   *   0x21a29-0x21a2d  movl 0x1c(%r14), %eax ; movl %eax, 0x20(%rbx)
   *                     → buf[32..35] = stack[28..31]  (field3 lo 4 hex chars)
   *   0x21a30-0x21a3e  reload stack canary from @0x148220, compare with saved -0x18(%rbp)
   *   0x21a3e         jne 0x21a4c         → mismatch → call ___stack_chk_fail (abort)
   *   0x21a40-0x21a4b  movq %rbx, %rax ; frame teardown ; retq  → return buf
   *   0x21a4c         callq ___stack_chk_fail  (never returns; hardened abort)
   *
   * The composed 36-byte string at buf[0..35] (with NUL at 36 from calloc) is exactly the
   * canonical UUID form: 8 hex - 4 hex - 4 hex - 4 hex - 12 hex, in uppercase.
   *
   * @returns A newly-owned char* (in JS: a 36-char string). The binary returns a heap
   *   pointer; the JS port returns the equivalent string content. Callers that expected
   *   a pointer they'd later `free` should treat the returned string as owned-by-caller.
   */
  toCStr(): string {
    // @0x219ba _calloc(1, 0x29) — 41 zeroed bytes; the trailing 5 bytes past position 35 stay
    // NUL in the native code but are irrelevant in the JS string.

    // @0x219e9 _snprintf(stack, 0x28, "%08X%08X%08X%08X", field0, field1, field2, field3)
    //  → 32 uppercase-hex chars. `%08X` = uppercase hex, width 8, zero-padded. JS's toString(16)
    //  is lowercase, so we uppercase and pad.
    const hex = (u: number): string => (u >>> 0).toString(16).toUpperCase().padStart(8, "0");

    // Format field-by-field into the four positional slots. The stack writes at
    // @0x21a06..0x21a2d essentially reassemble these 8-hex chunks with dashes injected at
    // fixed positions — bypassing the 4-space-runs from the template.
    const f0 = hex(this.field0);   // stack[0..7]   → buf[0..7]
    const f1 = hex(this.field1);   // stack[8..15]  → buf[9..12] + buf[14..17]
    const f2 = hex(this.field2);   // stack[16..23] → buf[19..22] + buf[24..27]
    const f3 = hex(this.field3);   // stack[24..31] → buf[28..31] + buf[32..35]

    // Assemble the canonical UUID form. The disasm's splice writes correspond exactly to:
    //   buf[0..7]   = f0                        (8 chars)
    //   buf[8]      = '-'                       (from template)
    //   buf[9..12]  = f1[0..3]                  (4 chars)
    //   buf[13]     = '-'                       (from template)
    //   buf[14..17] = f1[4..7]                  (4 chars)
    //   buf[18]     = '-'                       (from template)
    //   buf[19..22] = f2[0..3]                  (4 chars)
    //   buf[23]     = '-'                       (from template)
    //   buf[24..27] = f2[4..7]                  (4 chars)
    //   buf[28..31] = f3[0..3]                  (4 chars)  ← part of the 0x18(%rbx) movq
    //   buf[32..35] = f3[4..7]                  (4 chars)  ← the 0x20(%rbx) movl
    //   buf[36]     = '\0'                      (from calloc; string boundary)
    const out =
      f0 +
      "-" +
      f1.substring(0, 4) +
      "-" +
      f1.substring(4, 8) +
      "-" +
      f2.substring(0, 4) +
      "-" +
      f2.substring(4, 8) +
      f3.substring(0, 4) +
      f3.substring(4, 8);

    // @0x21a30-0x21a3e — canary check. In JS there is no stack buffer to protect; the
    // comparison is transcribed as a no-op citation. If corruption WERE possible, this
    // would call stack_chk_fail_stub() (never returns). The stub is preserved as a
    // provenance-visible symbol.
    void stack_chk_fail_stub;

    // @0x21a40 movq %rbx, %rax ; @0x21a4b retq — return `buf`.
    return out;
  }
}
