// glsl — Helium.framework internal file-static namespace (`glsl::`) that
// serializes an HGShaderBinding-tree into a GLSL source-text `string_t`.
// Four static (internal-linkage) methods; all live in the `L` (local) namespace
// per the mangled prefix `__ZN4glslL...`:
//
//   0x00000000000b51c0  glsl::end(string_t&, HGLimits const&, HGString::Hash const&, bool, bool)
//   0x00000000000c0cc0  glsl::begin(string_t&, HGLimits const&, HGLimits const&)
//   0x00000000000c18b0  glsl::write(string_t&, HGShaderBinding const*, HGLimits const*, unsigned int,
//                                    HGLimits const*, unsigned int, char const*, bool, unsigned int,
//                                    int, bool)
//   0x00000000000d9770  glsl::glindex(char const*, unsigned int&)
//
// Source disassembly (dumped via raw-port/tools/disasm.sh):
//   raw-port/re/disasm/Helium.glsl.end.s      (   1918 lines,  @0xb51c0)
//   raw-port/re/disasm/Helium.glsl.begin.s    (     91 lines,  @0xc0cc0)
//   raw-port/re/disasm/Helium.glsl.write.s    (   1686 lines,  @0xc18b0)
//   raw-port/re/disasm/Helium.glsl.glindex.s  (    108 lines,  @0xd9770)
// Framework: Final Cut Pro / Helium.framework, x86_64 slice.
//
// ── STRUCT LAYOUT — `string_t` (the header that all four methods walk) ──
// The `string_t&` first-argument shape is pinned by every access we see; the
// same trio appears verbatim across begin/end/write:
//
//   +0x00  char*  data              // active write cursor / base of live buffer.
//                                   //   begin @0xc0d16 : `movq (%rbx), %rdi` — used
//                                   //     as write-target for the header `//GL...`.
//                                   //   end   @0xb5232 : `movq (%rbx), %rax` — used
//                                   //     as base for `movw $0x3d35,4(%rax,%r14)`
//                                   //     ("//MD5=" line) and the following hex
//                                   //     SIMD write chain.
//   +0x08  uint64 len               // current live length, in bytes.
//                                   //   begin @0xc0cd7 : `movq 0x8(%rdi),%rsi` — pre-alloc
//                                   //     size gate; when zero the "empty string_t"
//                                   //     path @0xc0cf5 first `str_alloc`'s a
//                                   //     0x21-byte header block.
//                                   //   begin @0xc0d02 : `movq $0x21,0x8(%rbx)`
//                                   //     bumps len past the //GL header block.
//                                   //   end   @0xb51dd/b5249 : same field walked as `r14`
//                                   //     base for hex-injection.
//                                   //   end   @0xb522d : `addq $0x6,0x8(%rbx)` after
//                                   //     the "//MD5=" prefix is written.
//   +0x10  Alloc* alloc             // header of the allocator record. Only two
//                                   //   fields decoded on it:
//                                   //     alloc->cap   at Alloc+0x00 (u64; compared
//                                   //                  in the grow gate).
//                                   //     alloc->base  at Alloc+0x10 (raw pointer
//                                   //                  handed to _realloc).
//                                   //   grow-gate example (end @0xb5251..@0xb528b):
//                                   //     leaq  0x8(%r14),%rsi           ; needed = len+8
//                                   //     testq %rax,%rax                ; alloc != nullptr?
//                                   //     je    <str_alloc call>         ; nope → alloc fresh
//                                   //     cmpq  (%rax),%rsi              ; needed < cap ?
//                                   //     jb    <skip realloc>
//                                   //     leaq  0x107(%r14),%r13         ; round-up to 0x100
//                                   //     andq  $-0x100,%r13             ; multiple-of-256
//                                   //     movq  0x10(%rax),%rdi          ; alloc->base
//                                   //     movq  %r13,%rsi
//                                   //     callq _realloc                 ; grow the buffer
//                                   //     movq  %rax,0x10(%rcx)          ; alloc->base = new
//                                   //     movq  %r13,(%rcx)              ; alloc->cap  = rounded
//                                   //     movq  %rax,(%rbx)              ; string_t.data = new
// This means the total header of `string_t` known to us is 0x18 bytes:
// `{ data*, len, alloc* }`.  The Alloc record itself is at least 0x18 bytes
// (`{ cap, ?, base }`) — its middle field isn't touched by these four fns.
//
// ── STRUCT LAYOUT — `HGLimits` (the &(uint32) primary key) ──
// begin/end/write all use `movl (%rdx),%eax` (or equivalent) on their
// HGLimits* arguments, i.e. HGLimits+0x00 is a `uint32_t` "format code" that
// carries the four-nibble/three-byte tag decoded below.  Nothing else in these
// four methods reaches past +0x00 of an HGLimits, so we do not pin the rest of
// its layout here.
//
// ── The `//GL` / `//CG` header format written by begin ──
// The 5-way switch inside `begin` (@0xc0d16..@0xc0da6) is a table of
// (fmt code → 4-byte prefix + 2-byte suffix) that writes the FCP shader-source
// header:
//
//   fmt      hex_be(u32)@0xc0d68/…  hex_be(u16)@0xc0d41/…  → header text
//   0x50700  0x4c472f2f            0x7376                  //GLvs
//   0x20600  0x4c472f2f            0x7370                  //GLps    (was: pixel? fp32? tag not decoded)
//   0x60600  0x4c472f2f            0x7366                  //GLfs
//   0x50600  0x4c472f2f            0x7376                  //GLvs
//   0x70600  0x4c472f2f            0x7375                  //GLus    (compute?  literal ASCII "//GLus")
//   0x60700  0x47432f2f            0x7366                  //CGfs
//
// The `0x4c472f2f` literal is ASCII "//GL" (little-endian), and `0x47432f2f`
// is ASCII "//CG".  The 16-bit suffixes are ASCII pairs: `0x7376`="vs",
// `0x7370`="ps", `0x7366`="fs", `0x7375`="us".  After the 6-byte prefix, the
// upper-nibble/lower-nibble of the low byte of the fmt code
// (`shrl $4;andl $0xf` and `andl $0xf,%r12d`, both OR'd with 0x30 = ASCII '0')
// are emitted as the two decimal digits of a version, separated by '.'
// (`movb $0x2e,0x7(%rdi)`).  If both nibbles are zero, the version is omitted
// entirely (jump @0xc0dd1 skips ahead to `0x6(%rdi)`).
//
// The block is then padded to 0x0F with 0x20 (spaces) via `_memset`, a newline
// is stamped at +0x0F (`movb $0xa,0xf(%rbx)`), and a fixed 16-byte tag
// "`//LEN=0000000000\n`" (loaded from RIP+0x81b73d @0xc0ded, 15 chars + '\n')
// is `movups`d in at +0x10, terminated by a newline at +0x20.  Total header
// size: 0x21 bytes (the initial `movq $0x21,0x8(%rbx)` @0xc0d02).
//
// The mask `andl $0x000fff00, %eax` @0xc0d1c isolates the three-nibble format
// switch key from HGLimits+0x00 (bits 8..19).  otool -tV mislabels this
// immediate as `__ZN5HGHLG11InverseOETFD0Ev` (which happens to live at
// Helium 0x000fff00 — pure numeric coincidence, NOT a function reference):
//   nm -arch x86_64 Helium | c++filt:
//     0x000fff00  HGHLG::InverseOETF::~InverseOETF()
// Nothing in `begin` calls that symbol; the AND is a bitmask literal.
//
// ── The `//MD5=` footer written by end ──
// `end` opens with two grow-and-append blocks that respectively reserve room
// for a 6-byte prefix and then an 8-byte hex chunk.  The first block writes
// the literal `//MD5=` @0xb523d/@0xb5235 — `movl $0x444d2f2f` = ASCII "//MD"
// + `movw $0x3d35` = ASCII "5=" — after advancing `string_t.len` by 6.  The
// long SIMD sequence @0xb5295..@0xb5315+ then splats a 32-bit HGLimits[0]
// value into an xmm register, PSHUFB-permutes the bytes, and blends nibble
// pairs before OR'ing with `0x30` (ASCII '0') / adding `0x27` where the nibble
// is > 9 to reach ASCII 'a'..'f' — the classic vectorized hex-formatter.  A
// PSHUFB table and two nibble-classifier constants sit in the rodata pool at:
//     RIP+0x3186eb  (byte-splat perm, @0xb52cc)
//     RIP+0x3186e7  (0x0f mask       , @0xb52e1)
//     RIP+0x3186e8  (nibble > 9 test , @0xb52f0)
//     RIP+0x3186f0  (OR with '0'     , @0xb52f8)
//     RIP+0x3186f4  (add 0x27 = 'a'-':' , @0xb5304)
// These are read-only tables; recovering their exact byte contents requires a
// separate rodata dump.  The remaining ~1800 lines of `end` follow the same
// pattern for each 32-bit lane of the passed-in HGString::Hash (four u32s
// concatenated into a 32-hex-digit MD5-like signature) and then emit two
// boolean trailer flags — this is not yet decoded to the byte.  Throw per
// PORTING_SPEC Rule 3.
//
// ── glsl::write — the recursive tree-walker ──
// `write` is the recursive descent that turns an HGShaderBinding tree into
// text.  Its opening arm (@0xc18d3..@0xc191f) reads a 1-byte tag at
// `HGShaderBinding+0x21` (via `%rsi = %rcx+0x21`), then does an explicit
// `strncmp` against the 13-char literal `"#ifndef GL_ES"` (RIP+0x8237d0
// @0xc18e8) and branches on whether the tag byte equals `'#' (0x23)`.  From
// there the body dispatches over the shader-binding tag types and repeatedly
// calls the four `str_*` primitive helpers plus `itoa` — none of which are
// decoded here (all four are file-static in Helium and would each require
// their own class-file per PORTING_SPEC Rule 6).  A full transcription of
// `write` is not attempted; it is stubbed per Rule 3.
//
// ── glindex — the ONE method fully transcribed ──
// `glindex(char const* p, unsigned int& out)` is a self-contained lexer.
// It reads pre-whitespace, skips C-style comments (`//...\n` and `/*...*/`),
// requires an opening `[`, parses a run of decimal digits into *out, skips
// trailing whitespace and comments, and returns a pointer past the matching
// `]`, or `nullptr` if any of those checks fails.  All arithmetic is 32-bit
// unsigned; the character classifier is the classic
// `leal -0x21(%r), %d; cmpb $-0x21, %d; ja <loop>` (= `c <= 0x20`, i.e. any
// ASCII whitespace/control including 0x00).  Faithfully transcribed below.
//
// ── Primitive helpers reached by these four methods (all Helium file-statics) ──
//   0x????   glsl::str_alloc(string_t&, unsigned long)
//     — `__ZL9str_allocR8string_tm`, called by begin@0xc0ce3/c0cfd and end@0xb5228/b5290.
//   0x????   glsl::str_ext (string_t&, unsigned long, unsigned long)
//     — `__ZL7str_extR8string_tmm`, referenced by write.
//   0x????   glsl::str_puts(string_t&, char const*, unsigned long)
//     — `__ZL8str_putsR8string_tPKcm`, referenced by write.
//   0x????   glsl::itoa   (char*, int)
//     — `__ZL4itoaPci`, referenced by write.
// None of these four are transcribed by this file — they are their own units
// (glsl.str_alloc / glsl.str_ext / glsl.str_puts / glsl.itoa) and the workers
// that decode them can then wire this file's stubs to their exports.

// ─── string_t + Alloc header shapes (documented for consumers) ────────────

/**
 * `string_t` — the (char-pointer, len, alloc-pointer) triple that
 * begin/end/write mutate.  Layout recovered from the accesses cited in the
 * header comment above.
 */
export interface StringT {
  data: Uint8Array | null;   // +0x00
  len: number;               // +0x08 (uint64)
  alloc: StringAlloc | null; // +0x10
}

/**
 * `Alloc` — the block descriptor cited by every grow-gate in this file.
 * `cap` at +0x00 (the compare `cmpq (%rax),%rsi`).
 * `base` at +0x10 (the argument passed to _realloc).
 */
export interface StringAlloc {
  cap: number;               // +0x00 (uint64)
  base: Uint8Array | null;   // +0x10
}

// ─── Frontier callees (undecoded — throw per PORTING_SPEC Rule 3) ─────────

/**
 * `str_alloc(string_t&, unsigned long)` — Helium file-static that ensures
 * `s.alloc` exists and has capacity ≥ `n`, calling `_realloc` under the hood.
 * Symbol: `__ZL9str_allocR8string_tm`.
 * Call sites in this file:
 *   begin @Helium 0xc0ce3  (grow to len+? bytes)
 *   begin @Helium 0xc0cfd  (initial alloc of 0x21 header)
 *   end   @Helium 0xb5228  (grow before "//MD5=" prefix)
 *   end   @Helium 0xb5290  (grow before hex byte-spray)
 * Not yet decoded (its own class-file per Rule 6).
 */
function str_alloc(_s: StringT, _n: number): void {
  throw new Error(
    "glsl::str_alloc not yet transcribed — sites @Helium 0xc0ce3 / 0xc0cfd / 0xb5228 / 0xb5290 (symbol __ZL9str_allocR8string_tm)"
  );
}

/**
 * `str_ext(string_t&, unsigned long, unsigned long)` — Helium file-static
 * that extends the buffer by (a,b).  Symbol: `__ZL7str_extR8string_tmm`.
 * Referenced by glsl::write but the specific call-sites are inside the
 * 1686-line write body which is stubbed below.  Not yet decoded.
 */
function str_ext(_s: StringT, _a: number, _b: number): void {
  throw new Error(
    "glsl::str_ext not yet transcribed — referenced from glsl::write @Helium 0xc18b0 (symbol __ZL7str_extR8string_tmm)"
  );
}

/**
 * `str_puts(string_t&, char const*, unsigned long)` — Helium file-static
 * that appends a raw byte range.  Symbol: `__ZL8str_putsR8string_tPKcm`.
 * Referenced by glsl::write; not yet decoded.
 */
function str_puts(_s: StringT, _p: Uint8Array, _n: number): void {
  throw new Error(
    "glsl::str_puts not yet transcribed — referenced from glsl::write @Helium 0xc18b0 (symbol __ZL8str_putsR8string_tPKcm)"
  );
}

/**
 * `itoa(char*, int)` — Helium file-static base-10 integer→ASCII writer.
 * Symbol: `__ZL4itoaPci`.  Referenced by glsl::write; not yet decoded.
 */
function itoa(_buf: Uint8Array, _v: number): void {
  throw new Error(
    "glsl::itoa not yet transcribed — referenced from glsl::write @Helium 0xc18b0 (symbol __ZL4itoaPci)"
  );
}

// ─── Public API (four methods, one class boundary) ────────────────────────

/**
 * glsl::glindex — parse an optional whitespace/comment-preamble followed by
 * `[<u32>]` at `p`, writing the parsed integer into `out` and returning a
 * pointer past the closing `]`; returns nullptr on any parse failure.
 *
 * @src Helium 0x00000000000d9770  __ZN4glslL7glindexEPKcRj
 * @disasm raw-port/re/disasm/Helium.glsl.glindex.s
 *
 * Faithful transcription — every jump target maps to a labeled step:
 *   entry @0xd9770/9774  eax = 0 (holds the eventual `null` return value if we bail)
 *   step  @0xd9780       skip-ws-and-comments outer loop:
 *                         load *p, compute (c - 0x21) unsigned; while c<=0x20 keep skipping.
 *                         Note: because 0x00 also has (c-0x21)>=0xdf, the NUL terminator is
 *                         treated as whitespace and the walker will fall off the end.
 *   test  @0xd9793       cmpl $0x2f — is this char '/' ?
 *                         no → fall through to the `[` test @0xd97fe
 *   test  @0xd9798       byte after '/' is '*' (block comment) or '/' (line comment) or bail
 *   step  @0xd97a9..97c2 line-comment: advance past the NEXT '\n' (or NUL) and loop back to skip-ws
 *   step  @0xd97d0..97fc block-comment: scan for the trailing star-slash
 *   test  @0xd97fe       require '[' — if not '[', return nullptr (eax stays 0)
 *   step  @0xd9807..983b decimal-digit run into `%eax` via `eax = eax*10 + (c - '0')`
 *                         (`leal (%rax,%rax,4),%eax` = *5, `leal (%rcx,%rax,2),%eax` = 2* + c,
 *                          `addl $-0x30` = subtract '0').  Loop while (c-0x3a)>0xf5 i.e. c<'0'.
 *                         Writes result into *out via `movl %eax,(%rsi)`.
 *   step  @0xd9850       post-digit skip-ws-and-comments (identical shape to the entry loop,
 *                         label mirror of @0xd9780).
 *   test  @0xd98ce       require ']' — if not ']', return nullptr (eax=0).  On success the
 *                         current cursor (already past ']' by the outer skip-ws increment) is
 *                         returned in eax.
 */
export function glindex(
  buf: Uint8Array,
  p0: number,
  out: { value: number },
): number {
  // eax holds the eventual return value; a "nullptr" is signalled by returning 0.
  // @0xd9776 xorl %eax,%eax
  let ret = 0;
  let p = p0;

  // ── Preamble skip-ws / skip-comment loop (@0xd9780) ────────────────────
  //   %rcx = %rdi  (save previous cursor for the '/' re-arm)
  //   c = *p++;  if (c - 0x21) > 0xde continue (c ≤ 0x20) [ja is unsigned >]
  //   if (c == '/') handle_comment;  else if (c == '[') digits;  else return null;
  outer: while (true) {
    let prev = p;
    // Inner char-skip loop.  It advances p past any byte with (c-0x21) > 0xde,
    // i.e. c <= 0x20.  Because c is loaded from *p unsigned, and NUL also
    // has (0 - 0x21) = 0xdf > 0xde, the NUL terminator silently keeps looping
    // until we walk off — mirror that exactly.
    let c: number;
    while (true) {
      prev = p;
      c = buf[p] & 0xff;              // @0xd9783 movzbl (%rdi),%edx
      const d = (c - 0x21) & 0xff;    // @0xd9786 leal -0x21(%rdx),%r8d
      p = (p + 1) | 0;                // @0xd978a incq %rdi
      if (d > 0xde) continue;         // @0xd978d/9791 cmpb $-0x21; ja loop  (i.e. c <= 0x20)
      break;
    }

    // p is now one past the first non-whitespace char c (@0xd9780 exit).
    if (c === 0x2f) {                 // @0xd9793 cmpl $0x2f — '/'
      const c2 = buf[p] & 0xff;       // @0xd9798 movzbl (%rdi),%edx  (peek at *p)
      if (c2 === 0x2a) {              // @0xd979e cmpl $0x2a — '*'  → block comment
        // @0xd97d0 leaq 0x2(%rcx),%rdi — jump PAST the "/*"
        p = (prev + 2) | 0;
        // Scan for closing "*/".  The asm structure is:
        //   loop: cur = p;
        //         if (*p == 0) return null; (fall out via je 0xd97ec/…)
        //         p++;  if (p[-2] != '*') loop; if (p[-1] != '/') loop; else done.
        // Precisely mirror the two-slot lookback at @0xd97ed/f3.
        for (;;) {
          // @0xd97e8 movq %rdi,%rcx ; @0xd97eb je 0xd9780 (empty → fall back to preamble)
          if ((buf[p] & 0xff) === 0) continue outer;
          const pp = (p + 1) | 0;      // @0xd97e0/97f9 leaq 0x1(%rcx),%rdi
          // check "…*/"
          if ((buf[p - 1] & 0xff) === 0x2a && (buf[p] & 0xff) === 0x2f) {
            // matched — advance past the '/'
            p = pp;
            continue outer;
          }
          p = pp;
        }
      } else if (c2 === 0x2f) {       // @0xd97a3 cmpl $0x2f — '/'  → line comment
        // @0xd97a9 addq $0x2,%rcx  — start at "//"+2
        p = (prev + 2) | 0;
        for (;;) {
          // @0xd97b0 cmpb $0x0,(%rcx) — hit NUL?  fall back to outer skip-ws
          if ((buf[p] & 0xff) === 0) continue outer;
          // @0xd97b5 cmpb $0xa,-0x1(%rcx) — previous was '\n'?  done, resume outer
          const wasNl = (buf[p - 1] & 0xff) === 0x0a;
          const pp = (p + 1) | 0;      // @0xd97bc leaq 0x1(%rcx),%rcx
          if (wasNl) { p = pp; continue outer; }
          p = pp;
        }
      } else {
        // @0xd97a3 else → jne 0xd98d5 (fall to return null with eax=0)
        return ret;
      }
    } else if (c === 0x5b) {          // @0xd97fe cmpl $0x5b — '['
      // ── Digit run @0xd9807..0xd983d ────────────────────────────────────
      //   c = *p (peek);  d = (c - 0x3a) unsigned;  eax = 0
      //   if (d < 0xf6) return null  (c not in '0'..'9', since -0xa = 0xf6)
      //   loop: eax = eax*10 + (c - '0');  c = *(++p);  d = (c-0x3a);  loop while d > 0xf5
      //   *out = eax
      let cc = buf[p] & 0xff;         // @0xd9807 movzbl (%rdi),%ecx
      let dd = (cc - 0x3a) & 0xff;    // @0xd980a leal -0x3a(%rcx),%edx
      ret = 0;                        // @0xd980d xorl %eax,%eax
      // @0xd980f cmpb $-0xa,%dl ; jb 0xd98d5 (return null if c < '0')
      // -0xa signed byte == 0xf6 unsigned; jb == unsigned less-than
      if (dd < 0xf6) return 0;
      // digit loop
      let acc = 0;
      for (;;) {
        // @0xd9820  eax = eax*5 (leal (%rax,%rax,4))
        // @0xd9826  eax = c + acc*2 (leal (%rcx,%rax,2))  — i.e. acc*10 + c
        // @0xd9829  addl $-0x30 (subtract '0')
        acc = (((acc * 10) | 0) + (cc - 0x30)) | 0;
        cc = buf[(p + 1) | 0] & 0xff; // @0xd982c movzbl 0x1(%rdi),%ecx
        p = (p + 1) | 0;              // @0xd9830 incq %rdi
        dd = (cc - 0x3a) & 0xff;      // @0xd9833 leal -0x3a(%rcx),%edx
        if (dd <= 0xf5) break;        // @0xd9836/9 cmpb $-0xb,%dl ; ja loop  (unsigned >)
      }
      out.value = acc >>> 0;          // @0xd983b movl %eax,(%rsi)

      // ── Post-digit skip-ws / skip-comment loop (@0xd9850) ──────────────
      // Structurally identical to the preamble loop but ends at the ']' test.
      postSkip: for (;;) {
        let prev2 = p;
        let c3: number;
        while (true) {                // @0xd9850 loop
          prev2 = p;
          c3 = buf[p] & 0xff;         // @0xd9853 movzbl (%rdi),%ecx
          const d3 = (c3 - 0x21) & 0xff; // @0xd9856 leal -0x21(%rcx),%edx
          p = (p + 1) | 0;            // @0xd9859 incq %rdi
          if (d3 > 0xde) continue;    // @0xd985c/f cmpb $-0x21 ; ja loop
          break;
        }
        if (c3 === 0x2f) {            // @0xd9861 cmpl $0x2f — '/'
          const c4 = buf[p] & 0xff;   // @0xd9866 movzbl (%rdi),%ecx
          if (c4 === 0x2a) {          // @0xd986c cmpl $0x2a — '*'  block comment
            p = (prev2 + 2) | 0;      // @0xd98a0 leaq 0x2(%rax),%rdi
            for (;;) {
              if ((buf[p] & 0xff) === 0) continue postSkip; // @0xd98b8 je 0xd9850
              const pp = (p + 1) | 0;
              if ((buf[p - 1] & 0xff) === 0x2a && (buf[p] & 0xff) === 0x2f) {
                p = pp; continue postSkip;
              }
              p = pp;
            }
          } else if (c4 === 0x2f) {   // @0xd9871 line comment
            p = (prev2 + 2) | 0;      // @0xd9873 addq $0x2,%rax
            for (;;) {
              if ((buf[p] & 0xff) === 0) continue postSkip; // @0xd9880 je 0xd983f
              const wasNl = (buf[p - 1] & 0xff) === 0x0a;    // @0xd9885 cmpb $0xa,-0x1(%rax)
              const pp = (p + 1) | 0;
              if (wasNl) { p = pp; continue postSkip; }
              p = pp;
            }
          } else {
            // @0xd9871 else → jne 0xd98d3 (return null with eax=0)
            return 0;
          }
        } else if (c3 === 0x5d) {     // @0xd98ce cmpl $0x5d — ']'
          // @0xd98d1 je 0xd98d5 (fall through to popq/retq WITHOUT zeroing eax)
          // p here already points ONE PAST the ']' (the inner loop @0xd9859 incremented).
          return p;
        } else {
          // @0xd98d3 xorl %eax,%eax ; popq/retq  — return null on any other char
          return 0;
        }
      }
    } else {
      // @0xd9801 cmpl $0x5b jne 0xd98d5 — anything but '/' or '[' → null
      return ret;
    }
  }
  // unreachable, but TS wants a terminal expression
  // @0xd98d5 popq %rbp / @0xd98d6 retq
  // eslint-disable-next-line @typescript-eslint/no-unreachable
}

/**
 * glsl::begin — write the FCP shader-source header block (0x21 bytes) into
 * `s`, keyed by the format code at `HGLimits+0x00` of `a` and gated against
 * the same field of `b` (`b` must have a matching format code or begin does
 * nothing at all after the initial grow — the `movl (%r15),%eax; cmpl (%r14),%eax; jne`
 * gates @0xc0cee/c0d10 fall THROUGH to the popq/retq @0xc0dfc).
 *
 * @src Helium 0x00000000000c0cc0  __ZN4glslL5beginER8string_tRK8HGLimitsS4_
 * @disasm raw-port/re/disasm/Helium.glsl.begin.s
 *
 * The header text is one of `//GLps 3.0 //LEN=0000000000\n<pad>`,
 * `//GLfs`, `//GLvs`, `//GLus`, or `//CGfs`, chosen by masking the format
 * code with `0x000fff00` and matching against six magic values documented
 * in the header comment.  Version digits are the two low nibbles of the low
 * byte, each OR'd with 0x30.
 *
 * Grow-gate references `str_alloc` — currently a throwing stub — so calling
 * `begin` before `str_alloc` is decoded will throw with an @0xADDR citation.
 */
export function begin(s: StringT, a: { fmt: number }, b: { fmt: number }): void {
  // @0xc0cd4 movl (%rdx),%r12d   — fmt = a->fmt (HGLimits+0x00)
  const fmt = a.fmt >>> 0;
  // @0xc0cd7/db  test s.alloc — grow before writing 0x21 bytes
  if (s.alloc !== null) {
    // @0xc0ce3 callq str_alloc(s, len)
    // (`%rsi` at this point is `s.len` loaded @0xc0cd7 — the "current length"
    //  is passed as `n`, matching the prototype's `unsigned long n`.)
    str_alloc(s, s.len);
    // @0xc0ce8/eb/ee cmpl a->fmt, b->fmt ; jne 0xc0d16
    if (a.fmt !== b.fmt) {
      // fall through to the header-write @0xc0d16
    } else {
      // @0xc0cee jmp 0xc0dfc  — mismatch-EQUAL takes the exit
      return;
    }
  } else {
    // @0xc0cf5 movl $0x21,%esi ; callq str_alloc(s, 0x21)
    str_alloc(s, 0x21);
    // @0xc0d02 movq $0x21,0x8(%rbx)
    s.len = 0x21;
    // @0xc0d0a/d/10 cmpl a->fmt,b->fmt ; je 0xc0dfc
    if (a.fmt === b.fmt) return;
  }

  // ── Header-write path @0xc0d16 ─────────────────────────────────────────
  // data = s.data (must be non-null after str_alloc; the asm dereferences it
  // unconditionally — matching that is the faithful behaviour).
  const data = s.data!;
  // @0xc0d1c andl $0x000fff00, %eax  — key isolation.
  // (otool mislabels the immediate as `__ZN5HGHLG11InverseOETFD0Ev` — a
  //  literal-vs-symbol collision at Helium 0x000fff00; see file header.)
  const key = fmt & 0x000fff00;

  // The 5-way switch @0xc0d21..0xc0da6 branches on `key` and writes a 6-byte
  // prefix `<//XX><yy>` where XX ∈ {GL,CG} and yy ∈ {vs,ps,fs,us}.
  //
  //   key         XX (u32 LE at data+0)   yy (u16 LE at data+4)
  //   0x50700     0x4c472f2f = "//GL"     0x7376 = "vs"
  //   0x20600     0x4c472f2f = "//GL"     0x7370 = "ps"
  //   0x50600     0x4c472f2f = "//GL"     0x7376 = "vs"
  //   0x60600     0x4c472f2f = "//GL"     0x7366 = "fs"
  //   0x70600     0x4c472f2f = "//GL"     0x7375 = "us"
  //   0x60700     0x47432f2f = "//CG"     0x7366 = "fs"
  //   (any other): fall to the popq/retq @0xc0dfc without writing anything
  let xxLE: number;
  let yyLE: number;
  if (key > 0x605ff) {                    // @0xc0d21 cmpl $0x605ff, %eax ; jg 0xc0d49
    if (key === 0x60600) {                // @0xc0d49 je 0xc0d7e
      xxLE = 0x4c472f2f; yyLE = 0x7366;
    } else if (key === 0x60700) {         // @0xc0d50 je 0xc0d9a
      xxLE = 0x47432f2f; yyLE = 0x7366;
    } else if (key === 0x70600) {         // @0xc0d57 jne 0xc0dfc
      xxLE = 0x4c472f2f; yyLE = 0x7375;
    } else {
      return;                             // @0xc0d5c jne 0xc0dfc
    }
  } else {
    if (key === 0x20600) {                // @0xc0d28 je 0xc0d70
      xxLE = 0x4c472f2f; yyLE = 0x7370;
    } else if (key === 0x50600) {         // @0xc0d2f je 0xc0d8c
      xxLE = 0x4c472f2f; yyLE = 0x7376;
    } else if (key === 0x50700) {         // @0xc0d36 jne 0xc0dfc
      xxLE = 0x4c472f2f; yyLE = 0x7376;
    } else {
      return;                             // @0xc0d3b jne 0xc0dfc
    }
  }

  // @0xc0d68/6e/76/… movl xxLE,(%rdi) ; movw yyLE,4(%rdi)
  data[0] = xxLE & 0xff;
  data[1] = (xxLE >>> 8) & 0xff;
  data[2] = (xxLE >>> 16) & 0xff;
  data[3] = (xxLE >>> 24) & 0xff;
  data[4] = yyLE & 0xff;
  data[5] = (yyLE >>> 8) & 0xff;

  // ── Version digits @0xc0da6..0xc0dcf ───────────────────────────────────
  //   hi = (fmt >> 4) & 0xf ;  lo = fmt & 0xf
  //   if ((hi | lo) != 0) {
  //     data[6] = '0' | hi ;  data[7] = '.' ;  data[8] = '0' | lo ;  cursor = 9
  //   } else {
  //     cursor = 6
  //   }
  const hi = (fmt >>> 4) & 0xf;           // @0xc0da9/dac shrl $0x4 ; andl $0xf
  const lo = fmt & 0xf;                   // @0xc0daf andl $0xf,%r12d
  let cursor: number;
  if ((hi | lo) !== 0) {                  // @0xc0db3/b5/b8 orl ; je 0xc0dd1
    data[6] = (hi | 0x30) & 0xff;         // @0xc0dba/bc orb $0x30 ; movb ,6(%rdi)
    data[7] = 0x2e;                       // @0xc0dbf movb $0x2e,0x7(%rdi) = '.'
    data[8] = (lo | 0x30) & 0xff;         // @0xc0dc3/c7 orb $0x30 ; movb ,8(%rdi)
    cursor = 9;                           // @0xc0dcb addq $0x9,%rdi
  } else {
    cursor = 6;                           // @0xc0dd1 addq $0x6,%rdi
  }

  // ── Space-pad to +0x0F, newline, "//LEN=0000000000\n", trailing '\n' ──
  //   memset(data+cursor, 0x20, 0x0f - cursor)  @0xc0dd8..0xc0de4
  //   data[0x0f] = 0x0a                          @0xc0de9
  //   data[0x10..0x1f] = "//LEN=0000000000"    (movups from rodata @0xc0ded)
  //   data[0x20] = 0x0a                          @0xc0df8
  for (let i = cursor; i < 0x0f; i++) data[i] = 0x20;
  data[0x0f] = 0x0a;
  // Literal loaded via `movups 0x81b73d(%rip),%xmm0` — 16 bytes.  Encoded
  // here character-by-character to keep the decoded meaning explicit.
  const lenTag = "//LEN=0000000000";   // 16 chars
  for (let i = 0; i < 16; i++) data[0x10 + i] = lenTag.charCodeAt(i);
  data[0x20] = 0x0a;
  // @0xc0dfc popq %rbx ; retq
}

/**
 * glsl::end — append the "//MD5=<32-hex>\n<flag><flag>" footer to `s`.
 *
 * @src Helium 0x00000000000b51c0  __ZN4glslL3endER8string_tRK8HGLimitsRKN8HGString4HashEbb
 * @disasm raw-port/re/disasm/Helium.glsl.end.s
 *
 * The body opens with a standard 6-byte grow-then-write of the ASCII prefix
 * `//MD5=` (`movl $0x444d2f2f,(rax,r14)` = "//MD" and `movw $0x3d35,4(rax,r14)`
 * = "5=" @0xb523d/@0xb5235, after `str_alloc` @0xb5228).  It then extends
 * by 8 bytes and enters a heavily vectorized hex-formatter (~1800 asm lines)
 * that consumes the four u32 lanes of the passed-in `HGString::Hash` (32
 * total hex digits) and finally emits two boolean-derived trailer bytes for
 * the `bool,bool` args at %ecx / -0x34(%rbp).  The SIMD pipeline pulls three
 * rodata tables (@RIP+0x3186eb/@RIP+0x3186f0/…) and two nibble classifiers.
 *
 * Not yet decoded to the byte — throw per PORTING_SPEC Rule 3 (@Helium 0xb51c0).
 * Frontier callees within this method: `str_alloc` (@0xb5228, @0xb5290) and
 * `_realloc` (stub @0xb520c, @0xb5274 …).  Their bodies live in their own
 * class-files and are not this file's responsibility.
 */
export function end(
  _s: StringT,
  _a: { fmt: number },
  _hash: { lanes: [number, number, number, number] },
  _flag1: boolean,
  _flag2: boolean,
): void {
  throw new Error(
    "glsl::end (SIMD MD5-hex footer) not yet transcribed — @Helium 0xb51c0 (1918 asm lines; uses rodata perm/mask tables @RIP+0x3186eb/e7/e8/f0/f4 and internal str_alloc @0xb5228/b5290)"
  );
}

/**
 * glsl::write — recursive shader-binding-tree text serializer.
 *
 * @src Helium 0x00000000000c18b0  __ZN4glslL5writeER8string_tPK15HGShaderBindingPK8HGLimitsjS7_jPKcbjib
 * @disasm raw-port/re/disasm/Helium.glsl.write.s
 *
 * The body opens with a tag-byte dispatch at `HGShaderBinding+0x21` and an
 * explicit `strncmp` against the 13-char literal `"#ifndef GL_ES"` (rodata
 * @RIP+0x8237d0 @0xc18e8).  It then descends the binding tree, repeatedly
 * calling the four str_* primitives (`str_alloc` / `str_ext` / `str_puts` /
 * `itoa`) plus `_calloc`/`_malloc`/`_memcpy`/`_strncmp` from libc.
 *
 * Not yet decoded to the byte — throw per PORTING_SPEC Rule 3 (@Helium 0xc18b0).  Frontier
 * callees within this method:
 *   glsl::str_alloc  @Helium 0x?????   (`__ZL9str_allocR8string_tm`)
 *   glsl::str_ext    @Helium 0x?????   (`__ZL7str_extR8string_tmm`)
 *   glsl::str_puts   @Helium 0x?????   (`__ZL8str_putsR8string_tPKcm`)
 *   glsl::itoa       @Helium 0x?????   (`__ZL4itoaPci`)
 * Each is its own class-file per PORTING_SPEC Rule 6.
 */
export function write(
  _s: StringT,
  _binding: unknown,   // HGShaderBinding const*  — layout not yet decoded
  _lim1: { fmt: number },
  _u1: number,
  _lim2: { fmt: number },
  _u2: number,
  _cstr: Uint8Array | null,
  _flagA: boolean,
  _u3: number,
  _i1: number,
  _flagB: boolean,
): void {
  throw new Error(
    "glsl::write (recursive shader-binding tree serializer) not yet transcribed — @Helium 0xc18b0 (1686 asm lines; entry `strncmp(rcx+0x21,\"#ifndef GL_ES\",13)` @0xc18f7; frontier callees glsl::str_alloc/str_ext/str_puts/itoa)"
  );
}
