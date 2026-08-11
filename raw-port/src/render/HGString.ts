// HGString.ts — FCP Helium framework class `HGString`.
//
// Transcribed from the x86_64 disassembly of Helium in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
// Versions/A/Helium.
//
// PROVENANCE / DECODE:
//   raw-port/re/disasm/Helium.__ZNK8HGString4dataEv.s    (ported here)
//   raw-port/re/disasm/Helium.__ZNK8HGString6lengthEv.s  (layout evidence)
//   raw-port/re/disasm/Helium.__ZNK8HGString5c_strEv.s   (layout evidence)
//   raw-port/re/disasm/Helium.__ZNK8HGString6_flagsEi.s  (layout evidence)
//   raw-port/re/disasm/Helium.__ZNK8HGString4hashEv.s    (ported here)
//   raw-port/re/disasm/Helium.__ZN8HGStringD1Ev.s        (ported here)
//   raw-port/re/disasm/Helium.__ZN8HGStringD2Ev.s        (layout evidence)
//   raw-port/re/disasm/Helium.__ZN8HGStringC2EPKcbj.s    (layout evidence)
//
// SYMBOLS PORTED IN THIS FILE
//   0x000b3320 T __ZNK8HGString4dataEv     HGString::data() const
//   0x000b3330 T __ZNK8HGString6lengthEv   HGString::length() const
//   0x000b7990 T __ZN8HGStringD1Ev         HGString::~HGString()  [D1]
//   0x000b7eb0 T __ZNK8HGString4hashEv     HGString::hash() const
//
// Every other HGString method (c_str, digest, push, join, fork, gate,
// sample2d, …) is its own ledger unit and is deliberately NOT written here.
//
// FRONTIER CALLEES: none for data()/length()/hash() — the first two are single
// loads and the third is one long straight-line SSE sequence, with no `callq`
// and no indirect branch in any of them.  The D1 dtor reaches exactly two true
// out-of-scope externs, `_free` and `__ZdlPv`, cited at their call sites in the
// dtor's own block below.
//
// ── CLASS SHAPE ──────────────────────────────────────────────────────────
// HGString is Helium's shader-source string builder — the `string_t` that
// the `arb` and `glsl` emitters thread through their writers (confirmed by
// `HGString::c_str() const` @0xb8480 tail-calling
// `__ZL9str_closeR8string_t`, i.e. `str_close(string_t&)`, on `this`).
//
// The three leading fields are pinned by three independent accessors:
//   +0x00  buf     : char*    `movq (%rdi), %rax`     @0xb3324 (data(), here)
//                             `movq (%rdi), %rax`     @0xb8484 (c_str)
//   +0x08  length  : size_t   `movq 0x8(%rdi), %rax`  @0xb3334 (length)
//                             also `addq 0x8(%rdi), %rax` @0xb83e7 (_flags),
//                             which forms `buf + length` — so +0x08 is a
//                             LENGTH, not an end pointer.
//   +0x10  alloc   : Alloc*   `cmpq $0x0, 0x10(%rdi)` @0xb848c (c_str) —
//                             c_str() only returns `buf` directly when this
//                             is zero AND `buf[length] == 0`; otherwise it
//                             tail-calls str_close() to finalise the buffer.
//   +0x18  extraBegin : T*    `movq 0x18(%rbx), %rdi` @0xb79a8 / @0xb79d2 (D1)
//   +0x20  extraEnd   : T*    `movq %rdi, 0x20(%rbx)` @0xb79b1 (D1)
//   +0x28  (exists but is read by no unit ported here — the ctor's third
//           `movups %xmm0` @0xb6e91 zeroes it, which is what fixes
//           sizeof(HGString) at 0x30)
//
// +0x10 IS A POINTER TO A REFCOUNTED RECORD, not a scalar. The c_str() site
// above only null-tests it, so the data()/length() units could not tell (they
// hedged it as a `size_t pending`); the D1 dtor ported below DEREFERENCES it
// three ways and settles it:
//   @0xb799d  `testq %rax,%rax`                     — null-check, as in c_str
//   @0xb79a2  `decq 0x8(%rax)`                      — 64-bit refcount at +0x08
//   @0xb79c0  `movq 0x10(%rax),%rdi ; callq _free`  — a buffer at +0x10
//   @0xb79c9  `movq 0x10(%rbx),%rdi ; callq _free`  — and the record itself
// Two independent decodes agree: the landed `string_t` shape in
// raw-port/src/channels/glsl.ts names +0x10 `alloc`, with `cap` at Alloc+0x00
// and `base` at Alloc+0x10; and the HGString ctor @0xb6ed9 hands `this`
// straight to `str_alloc(string_t&, unsigned long)` and then runs glsl.ts's
// exact grow-gate on `0x10(%rbx)` (@0xb6efe `cmpq (%rax),%r13` = cap,
// @0xb6f15 `movq 0x10(%rax),%rdi` = base, @0xb6f25 writes the new base back).
// The dtor additionally identifies Alloc+0x08 — the one field glsl.ts left
// undecoded ("its middle field isn't touched by these four fns") — as the
// reference count. The field is therefore typed `Alloc*` here rather than as
// the `size_t` the c_str-only evidence suggested.
//
// The remainder of the object is opaque at this file's decode depth and is
// deliberately left un-modelled rather than guessed at.
//
// ── POINTER MODEL ────────────────────────────────────────────────────────
// `char*` is modelled the same way the sibling `arb.ts` models it: a
// (Uint8Array, index) pair.  `data()` hands back the raw `buf` field, so
// the port returns that pair as an object, and `null` for the C null
// pointer (which `c_str()` @0xb8487 shows is a reachable value of the
// field).

/**
 * A `char*` as stored in an HGString field: the buffer plus the byte index
 * the pointer designates.  Matches the (Uint8Array, index) convention used
 * by `arb.ts` for `char const*`.
 */
export interface HGStringBuf {
  bytes: Uint8Array;
  index: number;
}

/**
 * Runtime shape of an `HGString`.  Offsets are the ones pinned by the four
 * accessors listed in the CLASS SHAPE block above.
 */
export interface HGStringInstance {
  /** +0x00 — `char* buf`, loaded by `movq (%rdi), %rax` @0xb3324. */
  buf: HGStringBuf | null;
  /** +0x08 — `size_t length`, loaded by `movq 0x8(%rdi), %rax` @0xb3334. */
  length: number;
  /**
   * +0x10 — `Alloc*`, the refcounted buffer record. Null-tested by c_str()
   * @0xb848c and by the D1 dtor @0xb799d; dereferenced by the D1 dtor at
   * @0xb79a2 (refcount), @0xb79c0 (base) and @0xb79c9 (the record itself).
   * See the CLASS SHAPE block for why this is a pointer and not a scalar.
   */
  alloc: HGStringAlloc | null;
  /**
   * +0x18 — `__begin_` of the inlined libc++ vector triple; read by the D1
   * dtor @0xb79a8 and @0xb79d2 and handed to `::operator delete` @0xb79bb.
   */
  extraBegin: HGStringExtraBlock | null;
  /**
   * +0x20 — `__end_` of that same triple; written @0xb79b1 with the value of
   * +0x18 immediately before the block is deleted.
   */
  extraEnd: HGStringExtraBlock | null;
}

/**
 * `Alloc` — the refcounted buffer record `HGStringInstance.alloc` points at.
 *
 * `cap` (+0x00) and `base` (+0x10) come from the landed `string_t` decode in
 * raw-port/src/channels/glsl.ts and are re-confirmed by the HGString ctor's
 * grow-gate @0xb6efe/@0xb6f15/@0xb6f25. `refCount` (+0x08) is pinned by the
 * D1 dtor's `decq 0x8(%rax)` @0xb79a2 together with the free-both-on-zero
 * sequence @0xb79c0..@0xb79cd.
 */
export interface HGStringAlloc {
  /** +0x00 — allocated capacity in bytes (`cmpq (%rax),%r13` @0xb6efe). */
  cap: number;
  /** +0x08 — 64-bit reference count; decremented @0xb79a2. */
  refCount: number;
  /** +0x10 — the raw character buffer; freed @0xb79c4. */
  base: HGStringBuf | null;
}

/**
 * Opaque brand for the block managed by the inlined vector triple at
 * `HGString+0x18`. The D1 dtor only null-tests it, copies it to +0x20, and
 * hands it to `::operator delete` — it never dereferences it — so nothing
 * about its contents is decoded here.
 */
export type HGStringExtraBlock = {
  readonly __brand: "HGString::extraBlock";
};

/**
 * HGString::data() const  —  Helium @0xb3320.
 *
 * Faithful transcription of
 * raw-port/re/disasm/Helium.__ZNK8HGString4dataEv.s:
 *
 *   0xb3320  pushq %rbp
 *   0xb3321  movq  %rsp, %rbp
 *   0xb3324  movq  (%rdi), %rax        ; return this->buf   (+0x00)
 *   0xb3327  popq  %rbp
 *   0xb3328  retq
 *
 * A bare load of the +0x00 field — no NUL check, no str_close() call, and
 * no length involvement.  That is precisely what distinguishes `data()`
 * from `c_str()` @0xb8480, which loads the same field but first forces the
 * builder closed unless the buffer is already NUL-terminated.
 *
 * @param self the HGString (%rdi).
 * @returns the raw `buf` field, `null` when the field holds a null pointer.
 */
export function HGString_data(self: HGStringInstance): HGStringBuf | null {
  // 0xb3324  movq (%rdi), %rax
  return self.buf;
}

// ###########################################################################
// UNIT: HGString::length() const                                @Helium 0xb3330
//   __ZNK8HGString6lengthEv
//
// re/disasm: raw-port/re/disasm/Helium.__ZNK8HGString6lengthEv.s (7 lines)
//
// FULL DISASM (5 real insns @0xb3330..0xb3339; 0xb333a is alignment padding):
//   0xb3330  pushq %rbp
//   0xb3331  movq  %rsp, %rbp
//   0xb3334  movq  0x8(%rdi), %rax     ; return this->length   (+0x08)
//   0xb3338  popq  %rbp
//   0xb3339  retq
//   0xb333a  nopw  (%rax,%rax)         ; padding, not code
//
// A bare 64-bit load of the +0x08 field — the exact counterpart of `data()`
// @0xb3320 one slot above, which loads +0x00 the same way. No callq, no
// indirect branch, no other field touched.
//
// THAT +0x08 IS A LENGTH (not an end pointer, not a capacity) is pinned by
// three independent sites, all already cited in the CLASS SHAPE block above:
//   @0xb83e7  _flags(int):  `addq 0x8(%rdi), %rax` where %rax is the +0x00
//             buffer — forming `buf + length`, which only type-checks if
//             +0x08 is an offset.
//   @0xb8493/@0xb8497  c_str(): `movq 0x8(%rdi), %rcx ; cmpb $0x0, (%rax,%rcx)`
//             — indexes the buffer BY this field to test for the NUL
//             terminator, i.e. it is the index one past the last character.
//   @0xb9184  reset(): `movq $0x0, 0x8(%rdi)` — resetting the string zeroes
//             exactly this field and nothing else, so it is the live count.
//
// NUMERIC WIDTH — the load is `movq`, a full 64-bit `size_t`. Per PORTING_SPEC
// Rule 4 a u64 becomes `bigint` only "where the value can exceed 2^53"; this
// one cannot: it is a byte count into an in-memory shader-source buffer, and
// the sibling sites above use it as a plain `Uint8Array` index. It is
// therefore modelled as `number`, consistent with the `length: number` field
// the already-landed `data()` unit declared on HGStringInstance.
//
// FRONTIER CALLEES: zero. `depgraph.py deps __ZNK8HGString6lengthEv` reports
// nothing (0 in-scope callees, 0 externs, 0 indirect). Integer only.
// ###########################################################################

/**
 * HGString::length() const  —  Helium @0xb3330 (__ZNK8HGString6lengthEv).
 *
 * Faithful transcription of the 7-line disassembly quoted above: a single
 * `movq 0x8(%rdi), %rax`. Returns the live character count of the builder —
 * the same field `c_str()` @0xb8493 uses to index `buf` when it checks for
 * the NUL terminator, and the one `reset()` @0xb9184 zeroes.
 *
 * No NUL check, no `str_close()`, no involvement of `buf` (+0x00) or the
 * `alloc` field (+0x10) — unlike `c_str()` @0xb8480, which reads all three.
 *
 * @param self the HGString (%rdi).
 * @returns the `size_t length` field at +0x08.
 */
export function HGString_length(self: HGStringInstance): number {
  // 0xb3334  movq 0x8(%rdi), %rax
  return self.length;
}

// ###########################################################################
// UNIT: HGString::hash() const                                  @Helium 0xb7eb0
//   __ZNK8HGString4hashEv
//
// re/disasm: raw-port/re/disasm/Helium.__ZNK8HGString4hashEv.s (259 lines)
//
// FRONTIER CALLEES: zero. `depgraph.py deps __ZNK8HGString4hashEv` reports
// nothing (0 in-scope callees, 0 externs, 0 indirect). The body is one long
// straight-line block of loads, SSE integer ops and `or`s — no callq, no
// branch of any kind, not even a conditional jump (the two conditionals are
// `setge` @0xb7ec9 and `cmovl` @0xb7ee5, both branchless).
//
// ── WHAT hash() READS ────────────────────────────────────────────────────
// Every load is relative to `buf + length`, i.e. `(%rcx,%rsi)` where
//   0xb7eb5  movq (%rdi), %rcx      ; %rcx = this->buf     (+0x00)
//   0xb7eb8  movq 0x8(%rdi), %rsi   ; %rsi = this->length  (+0x08)
// so the function reads a fixed-size field sitting at a NEGATIVE displacement
// from the END of the built string. The displacements used, in order:
//
//   -0x84 -0x83 | -0x82 -0x81 -0x80 -0x7f | -0x7e -0x7d      word 0
//   -0x7b -0x7a | -0x79 -0x78 -0x77 -0x76 | -0x75 -0x74      word 1
//   -0x72 -0x71 | -0x70 -0x6f -0x6e -0x6d | -0x6c -0x6b      word 2
//   -0x69 -0x68 | -0x67 -0x66 -0x65 -0x64 | -0x63 -0x62      word 3
//
// Four runs of EIGHT consecutive bytes, separated by exactly one byte that is
// never read (-0x7c, -0x73, -0x6a). That is a 35-byte field
// `HHHHHHHH?HHHHHHHH?HHHHHHHH?HHHHHHHH` — eight hex digits, a separator,
// and so on — which `HGString::_distill(char const*, unsigned int)` @0xa8660
// appends to the distilled shader source. hash() re-parses it back into the
// 128-bit `HGString::Hash` that `HGString::cmp(Hash const&, Hash const&)`
// @0xa7c40 compares.
//
// ── HOW ONE WORD IS BUILT ────────────────────────────────────────────────
// The compiler emitted the SAME instruction sequence four times (once per
// word) with the displacements shifted by +9 each round. The four copies are
//   word 0: 0xb7ebc..0xb7fd0     word 1: 0xb7fd3..0xb80c5
//   word 2: 0xb80c8..0xb81b9     word 3: 0xb81bc..0xb829f
// Each copy converts eight hex characters into eight nibbles and ORs them
// into one uint32, most-significant digit first:
//
//   digit 0 (disp+0) -> bits 28..31    digit 4 (disp+4) -> bits 12..15
//   digit 1 (disp+1) -> bits 24..27    digit 5 (disp+5) -> bits  8..11
//   digit 2 (disp+2) -> bits 20..23    digit 6 (disp+6) -> bits  4..7
//   digit 3 (disp+3) -> bits 16..19    digit 7 (disp+7) -> bits  0..3
//
// FOUR different code shapes compute the same nibble, one per lane group:
//
//  (a) digit 0 — scalar, @0xb7ebc..0xb7ed1:
//        movzbl -0x84(%rcx,%rsi), %edx
//        xorl %eax,%eax ; cmpb $0x61,%dl ; setge %al      ; al = (c >= 'a')
//        leal (%rax,%rax,8), %eax                         ; eax = 9*al
//        addl %eax, %edx                                  ; edx = c + 9*al
//        shll $0x1c, %edx                                 ; <<28
//      `c + 9*(c>='a')` is the classic hex trick: for '0'..'9' the low nibble
//      of `c` is already the value (0x30..0x39 -> 0..9); for 'a'..'f',
//      c+9 = 0x6a..0x6f, whose low nibble is 0xa..0xf. The `shll $0x1c`
//      discards every bit above the nibble, so no explicit `& 0xf` is needed.
//      `setge` is a SIGNED byte compare, so bytes >= 0x80 count as NOT letters.
//
//  (b) digit 1 — scalar with a carry-correction, @0xb7ed4..0xb7ef4:
//        movzbl -0x83(%rcx,%rsi), %eax
//        leal 0xd9(%rax), %r8d ; cmpb $0x61,%al ; cmovll %eax,%r8d
//        shll $0x18, %r8d ; addl $0xd0000000, %r8d
//      i.e. `v = c < 'a' ? c : c + 0xd9`, then `(v << 24) + 0xd0000000`
//      truncated to 32 bits. 0xd9 = -0x27 mod 0x100 and 0xd0000000 = -0x30<<24
//      mod 2^32, so the pair is exactly "subtract 0x30, and 0x27 more for a
//      letter", carried out in wrap-around arithmetic. Check: '9' -> 0x39<<24
//      + 0xd0000000 = 0x09000000; 'a' -> (0x61+0xd9)<<24 + 0xd0000000
//      = 0x0a000000.
//
//  (c) digits 2..5 — SSE, @0xb7ef4..0xb7fc8 (see SSE BLOCK below).
//
//  (d) digits 6,7 — scalar, @0xb7f7f..0xb7fb2:
//        movsbl -0x7e(%rcx,%rsi), %eax
//        movl $0xffffffd0, %edi                    ; %edi = -0x30 (loop-invariant)
//        leal (%rax,%rdi), %r9d                    ; c - 0x30
//        cmpl $0x61, %eax
//        leal -0x27(%rax,%rdi), %eax               ; c - 0x57
//        cmovll %r9d, %eax                         ; pick c-0x30 when c < 'a'
//      This form needs no masking because it computes the true nibble value;
//      digit 6 is then `shll $0x4` (bits 4..7) and digit 7 is used unshifted.
//
// ── THE SSE BLOCK (digits 2..5) ──────────────────────────────────────────
//   0xb7ef4  movd -0x82(%rcx,%rsi), %xmm2   ; 4 chars, little-endian:
//                                           ; byte0=disp+2 … byte3=disp+5
//   0xb7f01  psrld $0x10, %xmm0             ; move bytes 2,3 down into 0,1
//   0xb7f06  pmovsxbq %xmm0, %xmm3          ; {c4, c5} as two qwords
//   0xb7f0b  pmovsxbq %xmm2, %xmm5          ; {c2, c3} as two qwords
//   0xb7f10  movdqa 0x315a58(%rip), %xmm1   ; -> 0xb7f18+0x315a58 = 0x3cd970
//   0xb7f18  pcmpgtb %xmm1, %xmm2           ; per byte: c > 0x60 ? 0xff : 0
//   0xb7f21  movdqa 0x315a57(%rip), %xmm0   ; -> 0xb7f29+0x315a57 = 0x3cd980
//   0xb7f29  pand %xmm0, %xmm4              ; letter ? 0xffffffd9 : 0
//   0xb7f2d  paddq %xmm5, %xmm4             ; v = c + (letter ? 0xffffffd9 : 0)
//   … then the two lanes are shifted into place and biased:
//   0xb7f5b/0xb7f60/0xb7f65  {c2 << 20, c3 << 16}
//   0xb7f47/0xb7f4c/0xb7f51  {c4 << 12, c5 <<  8}
//   0xb7f6b  movdqa 0x315a1d(%rip), %xmm2   ; -> 0xb7f73+0x315a1d = 0x3cd990
//   0xb7f77  movdqa 0x315a21(%rip), %xmm3   ; -> 0xb7f7f+0x315a21 = 0x3cd9a0
//   0xb7f73/0xb7f98  paddq the two bias vectors
//   0xb7fb6/0xb7fba/0xb7fbf/0xb7fc3  por + pshufd $0xee + por + movd
//                                    -> fold both qwords together, low 32 bits
//
// The four 16-byte constants, read out of the x86_64 slice (__TEXT,__const at
// vmaddr 0x3c7b80 / file offset 0x3c7000 with the fat slice at 0x4000):
//   @0x3cd970  60 60 60 60 00×12          ; pcmpgtb threshold, per byte 0x60
//   @0x3cd980  qword0 = qword1 = 0x00000000ffffffd9
//   @0x3cd990  qword0 = 0x000ffffffd000000, qword1 = 0x0000ffffffd00000
//   @0x3cd9a0  qword0 = 0x00000ffffffd0000, qword1 = 0x000000ffffffd000
//
// The bias vectors are the SSE counterpart of case (b)'s `addl $0xd0000000`:
// each is `-0x30 << shift` in 64-bit wrap-around form, so after the shift and
// add ONLY THE LOW 32 BITS are correct — which is all `movd` keeps. Worked
// check for digit 2 ('a', shift 20): v = 0x61 + 0xffffffd9 = 0x10000003a;
// v << 20 = 0x0010000003a00000; + 0x000ffffffd000000 = 0x001fffff00a00000;
// low 32 bits = 0x00a00000 — nibble 0xa at bits 20..23, as required.
//
// Because the threshold vector @0x3cd970 is 0x60 only in its first four bytes
// and `movd` zero-fills bytes 4..15, the upper twelve lanes always compare
// `0 > 0` = false and contribute nothing; only the four loaded chars matter.
//
// ── THE RETURN VALUE ─────────────────────────────────────────────────────
//   0xb82a1  shlq $0x20, %rdx ; 0xb82a5 orq %r9, %rdx   ; %rdx = w2 | w3<<32
//   0xb82a8  shlq $0x20, %r8  ; 0xb82ac orq %r8, %rax   ; %rax = w0 | w1<<32
// A 16-byte `HGString::Hash` returned in the %rax:%rdx register pair — the
// same type `HGString::cmp(Hash const&, Hash const&)` @0xa7c40 takes. Every
// contributing `orl` writes a 32-bit register, which zero-extends, so the
// two `orq`s combine cleanly with no stale high bits.
//
// NUMERIC WIDTH — both halves are full 64-bit quantities that routinely
// exceed 2^53 (they are packed hash digits), so per PORTING_SPEC Rule 4 they
// are modelled as `bigint`, not `number`. The four 32-bit words are built in
// `number` arithmetic (each fits in u32) and only widened at the final join.
// ###########################################################################

/**
 * `HGString::Hash` — the 16-byte value `HGString::hash() const` returns in
 * the %rax:%rdx pair @0xb82a1..0xb82ac, and that
 * `HGString::cmp(HGString::Hash const&, HGString::Hash const&)` @0xa7c40
 * compares.
 */
export interface HGStringHash {
  /** %rax — `w0 | (w1 << 32)`, assembled @0xb82a8/@0xb82ac. */
  lo: bigint;
  /** %rdx — `w2 | (w3 << 32)`, assembled @0xb82a1/@0xb82a5. */
  hi: bigint;
}

/**
 * Byte offset, relative to `buf + length`, of the first hex digit of the
 * hash field — the displacement of the very first load, `movzbl
 * -0x84(%rcx,%rsi), %edx` @0xb7ebc.
 */
const HGSTRING_HASH_DISP = -0x84;

/**
 * Distance between the four eight-digit runs: eight digits plus the one
 * separator byte the code steps over (-0x7c, -0x73 and -0x6a are never
 * loaded).  Derived from the displacement sequence quoted above.
 */
const HGSTRING_HASH_STRIDE = 9;

/**
 * One eight-hex-digit run of `HGString::hash()` — the instruction sequence
 * the compiler emitted four times over, at
 *   0xb7ebc..0xb7fd0 (word 0), 0xb7fd3..0xb80c5 (word 1),
 *   0xb80c8..0xb81b9 (word 2), 0xb81bc..0xb829f (word 3).
 *
 * The four copies are instruction-for-instruction identical apart from their
 * displacements and register allocation, so the sequence is transcribed once
 * here and applied at the four bases; every step below cites the word-0 copy's
 * address, which is the copy quoted in full in the UNIT block above.
 *
 * @param s    the buffer holding the built string (`this->buf`, %rcx).
 * @param base index of this run's first hex digit — `buf + length + disp`.
 * @returns the assembled uint32, as an unsigned `number`.
 */
function HGString_hash_word(s: Uint8Array, base: number): number {
  // (a) digit 0 -> bits 28..31.
  // 0xb7ebc movzbl ; 0xb7ec6 cmpb $0x61 ; 0xb7ec9 setge (SIGNED byte compare,
  // so 0x80..0xff are not letters) ; 0xb7ecc leal (%rax,%rax,8) ; 0xb7ecf addl
  const c0 = s[base];
  const isLetter0 = (c0 << 24) >> 24 >= 0x61 ? 1 : 0;
  // 0xb7ed1  shll $0x1c, %edx — keeps only the low nibble of `c + 9*isLetter`.
  const d0 = ((c0 + 9 * isLetter0) << 0x1c) >>> 0;

  // (b) digit 1 -> bits 24..27.
  // 0xb7edc leal 0xd9(%rax) ; 0xb7ee3 cmpb $0x61 ; 0xb7ee5 cmovll
  const c1 = s[base + 1];
  const v1 = (c1 << 24) >> 24 < 0x61 ? c1 : c1 + 0xd9;
  // 0xb7ee9 shll $0x18 ; 0xb7eed addl $0xd0000000 — both wrap at 32 bits.
  const d1 = (((v1 << 0x18) >>> 0) + 0xd0000000) >>> 0;

  // (c) digits 2..5 -> bits 20..23, 16..19, 12..15, 8..11, via the SSE block
  // @0xb7ef4..0xb7fc8.  Per lane: `v = c + (c > 0x60 ? 0xffffffd9 : 0)`
  // (pcmpgtb against @0x3cd970, pand with @0x3cd980, paddq), then `v << shift`
  // plus the matching bias qword from @0x3cd990 / @0x3cd9a0, then the two
  // qwords are folded with `por`/`pshufd $0xee`/`por` and only the low 32 bits
  // survive `movd` @0xb7fc3.  The 64-bit lane arithmetic is reproduced in
  // BigInt so the wrap-around bias lands exactly as the vector unit computes
  // it; the mask to 32 bits below is the `movd`.
  const SHIFTS = [20n, 16n, 12n, 8n];
  // @0x3cd990 qword0/qword1 (lanes for digits 2 and 3) then
  // @0x3cd9a0 qword0/qword1 (lanes for digits 4 and 5).
  const BIAS = [
    0x000ffffffd000000n,
    0x0000ffffffd00000n,
    0x00000ffffffd0000n,
    0x000000ffffffd000n,
  ];
  let sse = 0n;
  for (let i = 0; i < 4; i++) {
    const c = s[base + 2 + i];
    // pcmpgtb @0xb7f18 is a SIGNED byte compare against 0x60.
    const signed = (c << 24) >> 24;
    // pmovsxbq @0xb7f0b sign-extends the char itself the same way.
    const v = BigInt(signed) + (signed > 0x60 ? 0xffffffd9n : 0n);
    // psllq then paddq; the vector lanes are 64 bits wide.
    sse |= BigInt.asUintN(64, (v << SHIFTS[i]) + BIAS[i]);
  }
  // 0xb7fc3  movd %xmm4, %r10d — only the low 32 bits leave the vector unit.
  const dSse = Number(sse & 0xffffffffn) >>> 0;

  // (d) digits 6,7 -> bits 4..7 and 0..3.
  // 0xb7f84 movl $0xffffffd0,%edi ; 0xb7f89 leal (%rax,%rdi) ; 0xb7f8d cmpl
  // $0x61 ; 0xb7f90 leal -0x27(%rax,%rdi) ; 0xb7f94 cmovll — all on the
  // SIGN-EXTENDED char from `movsbl` @0xb7f7f.
  const c6 = (s[base + 6] << 24) >> 24;
  const n6 = c6 < 0x61 ? c6 - 0x30 : c6 - 0x57;
  const c7 = (s[base + 7] << 24) >> 24;
  const n7 = c7 < 0x61 ? c7 - 0x30 : c7 - 0x57;
  // 0xb7f9c  shll $0x4, %eax — digit 6 only; digit 7 is used unshifted.
  const d6 = (n6 << 4) >>> 0;

  // 0xb7fc8/0xb7fca/0xb7fcd/0xb7fd0 — the four `orl`s that assemble the word.
  // `orl` writes a 32-bit register, so the result is UNSIGNED; the trailing
  // `>>> 0` is what keeps the top nibble from turning the value negative.
  return ((((d6 | d0) >>> 0 | d1) >>> 0 | n7) >>> 0 | dSse) >>> 0;
}

/**
 * HGString::hash() const  —  Helium @0xb7eb0 (__ZNK8HGString4hashEv).
 *
 * Faithful transcription of raw-port/re/disasm/Helium.__ZNK8HGString4hashEv.s;
 * see the UNIT block above for the full instruction-level walkthrough.
 *
 * Re-parses the 35-byte hex field that `HGString::_distill(char const*,
 * unsigned int)` @0xa8660 leaves at the end of the distilled shader source —
 * `buf + length - 0x84` — back into the 128-bit `HGString::Hash` returned in
 * %rax:%rdx.
 *
 *   0xb7eb5  movq (%rdi), %rcx        ; %rcx = this->buf     (+0x00)
 *   0xb7eb8  movq 0x8(%rdi), %rsi     ; %rsi = this->length  (+0x08)
 *   …four unrolled eight-digit runs at -0x84, -0x7b, -0x72, -0x69…
 *   0xb82a1  shlq $0x20,%rdx ; orq %r9,%rdx    ; hi = w2 | w3<<32
 *   0xb82a8  shlq $0x20,%r8  ; orq %r8,%rax    ; lo = w0 | w1<<32
 *
 * The three bytes between the runs (-0x7c, -0x73, -0x6a) are separators and
 * are never loaded; the function performs no bounds check and no NUL check,
 * so `buf` must actually carry the distilled tail — exactly the precondition
 * the binary itself relies on.
 *
 * @param self the HGString (%rdi).
 * @returns the 128-bit hash as the %rax (`lo`) / %rdx (`hi`) pair.
 */
export function HGString_hash(self: HGStringInstance): HGStringHash {
  // 0xb7eb5  movq (%rdi), %rcx
  const buf = self.buf;
  if (buf === null) {
    // The binary dereferences %rcx unconditionally at 0xb7ebc; a null `buf`
    // would fault there. Surfacing that as a throw keeps the failure loud
    // instead of silently reading garbage — the port has no memory to fault on.
    throw new Error(
      "HGString::hash() @Helium 0xb7eb0 dereferences this->buf (+0x00) " +
        "unconditionally at 0xb7ebc; buf is null."
    );
  }
  // 0xb7eb8  movq 0x8(%rdi), %rsi — every load below is `buf + length + disp`.
  const end = buf.index + self.length;

  // Word 0 @0xb7ebc..0xb7fd0 (disp -0x84), word 1 @0xb7fd3..0xb80c5 (-0x7b),
  // word 2 @0xb80c8..0xb81b9 (-0x72), word 3 @0xb81bc..0xb829f (-0x69).
  const w0 = HGString_hash_word(
    buf.bytes,
    end + HGSTRING_HASH_DISP + 0 * HGSTRING_HASH_STRIDE
  );
  const w1 = HGString_hash_word(
    buf.bytes,
    end + HGSTRING_HASH_DISP + 1 * HGSTRING_HASH_STRIDE
  );
  const w2 = HGString_hash_word(
    buf.bytes,
    end + HGSTRING_HASH_DISP + 2 * HGSTRING_HASH_STRIDE
  );
  const w3 = HGString_hash_word(
    buf.bytes,
    end + HGSTRING_HASH_DISP + 3 * HGSTRING_HASH_STRIDE
  );

  return {
    // 0xb82a8  shlq $0x20, %r8 ; 0xb82ac orq %r8, %rax
    lo: BigInt(w0) | (BigInt(w1) << 32n),
    // 0xb82a1  shlq $0x20, %rdx ; 0xb82a5 orq %r9, %rdx
    hi: BigInt(w2) | (BigInt(w3) << 32n),
  };
}

// ###########################################################################
// UNIT: HGString::~HGString()  [D1, complete-object dtor]      @Helium 0xb7990
//   __ZN8HGStringD1Ev
//
// re/disasm: raw-port/re/disasm/Helium.__ZN8HGStringD1Ev.s (24 lines)
//
// FULL DISASM (@0xb7990..0xb79e1; 0xb79e2 is alignment padding):
//   0xb7990  pushq %rbp
//   0xb7991  movq  %rsp, %rbp
//   0xb7994  pushq %rbx
//   0xb7995  pushq %rax                 ; 8B of stack-alignment padding
//   0xb7996  movq  %rdi, %rbx           ; rbx = this
//   0xb7999  movq  0x10(%rdi), %rax     ; rax = this->alloc
//   0xb799d  testq %rax, %rax
//   0xb79a0  je    0xb79a8              ; no record -> skip the release
//   0xb79a2  decq  0x8(%rax)            ; --alloc->refCount (64-bit, NOT atomic)
//   0xb79a6  je    0xb79c0              ; ZF => the count reached zero
// L_b79a8:
//   0xb79a8  movq  0x18(%rbx), %rdi     ; rdi = this->extraBegin
//   0xb79ac  testq %rdi, %rdi
//   0xb79af  je    0xb79db              ; null -> nothing to delete, return
// L_b79b1:
//   0xb79b1  movq  %rdi, 0x20(%rbx)     ; this->extraEnd = this->extraBegin
//   0xb79b5  addq  $0x8, %rsp
//   0xb79b9  popq  %rbx
//   0xb79ba  popq  %rbp
//   0xb79bb  jmp   0x3c4fa0             ## symbol stub for: __ZdlPv
//                                       ; TAIL-jmp ::operator delete(extraBegin)
// L_b79c0:                              ; the refcount hit zero
//   0xb79c0  movq  0x10(%rax), %rdi     ; rdi = alloc->base
//   0xb79c4  callq 0x3c513e             ## symbol stub for: _free
//   0xb79c9  movq  0x10(%rbx), %rdi     ; rdi = this->alloc (re-read, same ptr)
//   0xb79cd  callq 0x3c513e             ## symbol stub for: _free
//   0xb79d2  movq  0x18(%rbx), %rdi     ; rdi = this->extraBegin
//   0xb79d6  testq %rdi, %rdi
//   0xb79d9  jne   0xb79b1              ; non-null -> the delete path above
// L_b79db:
//   0xb79db  addq  $0x8, %rsp
//   0xb79df  popq  %rbx
//   0xb79e0  popq  %rbp
//   0xb79e1  retq
//   0xb79e2  nopw  %cs:(%rax,%rax)      ; padding, not code
//
// D2 (__ZN8HGStringD2Ev @0xb7930) is the SAME blocks instruction for
// instruction — only the addresses and the two `_free` stub displacements
// differ. That is ordinary Itanium C1/C2 dtor aliasing for a class with no
// virtual bases. D2 is its own ledger unit and is NOT written here.
//
// CONTROL FLOW — the delete runs on BOTH paths. L_b79b1 has two predecessors:
// the fall-through @0xb79af (the record survived, or there was no record) and
// the back-edge @0xb79d9 taken after the buffer was freed. So the `extraBegin`
// block is released whether or not the refcount reached zero — the two
// resources are independent. On the first path the release is a TAIL jmp (the
// frame is torn down first); on the second it is a backwards branch into the
// same three instructions. Same operation, written once below.
//
// NOT DONE BY THE MACHINE (and therefore not done here): neither `this->alloc`
// nor `this->extraBegin` is nulled out, and the `decq` carries no `lock`
// prefix. The object is dead after the dtor, so the binary leaves both owning
// slots dangling; "tidying" them would be a rewrite, not a transcription.
//
// FRONTIER CALLEES — two true out-of-scope externs, both libc / the C++
// runtime allocator, neither of them Helium code:
//   _free    @0xb79c4 (alloc->base) and @0xb79cd (the Alloc record)
//   __ZdlPv  @0xb79bb (::operator delete, reached as a tail jmp)
// `depgraph.py deps __ZN8HGStringD1Ev` reports no in-scope callee, and the
// listing contains no indirect or virtual call. Integer/pointer only, so
// Math.fround does not apply.
// ###########################################################################

/**
 * Frontier: libc `free(void*)` — called at @0xb79c4 with `alloc->base` and at
 * @0xb79cd with the `Alloc` record itself, both through the
 * `symbol stub for: _free` at 0x3c513e. Out of scope for the raw port.
 */
function free(_p: HGStringBuf | HGStringAlloc | null): void {
  // @0xb79c4 callq 0x3c513e  ## symbol stub for: _free   (alloc->base)
  // @0xb79cd callq 0x3c513e  ## symbol stub for: _free   (this->alloc)
  //
  // A DEALLOCATION PRIMITIVE, MODELLED AS A NO-OP. `free` returns void and the
  // machine reaches both call sites as NORMAL control flow — @0xb79a2
  // `decq 0x8(%rax)` / @0xb79a6 `je 0xb79c0` is the ordinary refcount-hits-zero
  // path, i.e. the last owner destructing, which is the common case rather than
  // an error. Making it throw would raise instead of destructing on exactly
  // that path. A JS runtime owns the surrogate buffers through GC, so releasing
  // the storage is a no-op here and dropping the reference is what makes it
  // unreachable; this is the landed convention (PCIgnoreElement::destroyAndDelete
  // models the `jmp __ZdlPv` the same way, PCAtomMetadataHandler models
  // `delete[]` the same way). Value-PRODUCING externs still throw.
}

/**
 * Frontier: `::operator delete(void*)` (`__ZdlPv`) — reached at @0xb79bb as a
 * TAIL jmp through the `symbol stub for: __ZdlPv` at 0x3c4fa0, with
 * `this->extraBegin` in %rdi. Out of scope for the raw port.
 */
function operator_delete(_p: HGStringExtraBlock | null): void {
  // @0xb79bb jmp 0x3c4fa0  ## symbol stub for: __ZdlPv
  //
  // Same deallocation-primitive model as `free` above: void return, reached on
  // the reachable non-null path (@0xb79a8/@0xb79d2 `testq %rdi,%rdi` then the
  // fall-through), so it is a JS no-op. The real work of that leg — the
  // `__end_ = __begin_` store at @0xb79b1 — is transcribed in the caller and
  // must RUN, which it cannot if this raises.
}

/**
 * HGString::~HGString()  [D1, complete-object dtor]  —  Helium @0xb7990
 * (__ZN8HGStringD1Ev).
 *
 * Faithful transcription of the disassembly quoted above:
 *
 *   1. @0xb7999-@0xb79a0  if `this->alloc` is null, skip to step 3.
 *   2. @0xb79a2-@0xb79a6  `--alloc->refCount`; when it reaches zero,
 *      @0xb79c0-@0xb79cd  `free(alloc->base)` then `free(this->alloc)`.
 *   3. @0xb79a8/@0xb79d2  if `this->extraBegin` is non-null,
 *      @0xb79b1           set `this->extraEnd = this->extraBegin`, then
 *      @0xb79bb           `::operator delete(this->extraBegin)`.
 *
 * Step 3 is reached from both the refcount-survived path and the
 * refcount-hit-zero back-edge; see the CONTROL FLOW note above. The
 * apparently-pointless store at @0xb79b1 is the `__end_ = __begin_` half of an
 * inlined `std::__1::vector::~vector`, which is what pins +0x18/+0x20 as the
 * first two slots of a vector triple.
 *
 * DIFFERENTIAL EVIDENCE (against the live Helium binary, not a restatement):
 * raw-port/re/oracle/HGString_destroy_{oracle.py,driver.mts} builds a real
 * receiver in ctypes memory — a poisoned 0x40-byte arena, a malloc'd Alloc
 * record whose +0x10 base is malloc'd too, and an operator-new'd extra block,
 * separated by live spacer blocks so the tiny allocator cannot coalesce two
 * freed neighbours — calls this symbol at slide + 0xb7990 under
 * `arch -x86_64 /usr/bin/python3` (prologue bytes 55 48 89 e5 53 50 48 89 fb
 * checked at the address first), and compares six cases covering both
 * predecessors of L_b79b1. All six agree with the port, with 0 stray bytes in
 * the arena — which is also the measurement behind the NOT-DONE-BY-THE-MACHINE
 * note above: +0x10 and +0x18 still hold the freed pointers afterwards.
 * malloc_size shows the live function really does release base + record only
 * when the count reaches zero, and the extra block on every non-null path,
 * which is the fact the no-op deallocation boundaries stand in for. Controls:
 * throwing deallocators kill 4/6, dropping the 0xb79b1 store 3/6, missing the
 * 0xb79d9 back-edge 1/6, dropping the 0xb79a2 decrement 4/6.
 *
 * @param self the HGString (%rdi).
 */
export function HGString_destroy(self: HGStringInstance): void {
  // 0xb7999  movq 0x10(%rdi),%rax / 0xb799d testq %rax,%rax / 0xb79a0 je 0xb79a8
  const alloc = self.alloc;
  if (alloc !== null) {
    // 0xb79a2  decq 0x8(%rax) / 0xb79a6 je 0xb79c0
    alloc.refCount = alloc.refCount - 1;
    if (alloc.refCount === 0) {
      // 0xb79c0-0xb79c4  free(alloc->base)
      free(alloc.base);
      // 0xb79c9-0xb79cd  free(this->alloc) — the machine re-reads 0x10(%rbx)
      // rather than reusing %rax, though both name the same pointer.
      free(self.alloc);
    }
  }
  // 0xb79a8 / 0xb79d2  movq 0x18(%rbx),%rdi / testq / je 0xb79db
  const extraBegin = self.extraBegin;
  if (extraBegin !== null) {
    // 0xb79b1  movq %rdi, 0x20(%rbx)
    self.extraEnd = extraBegin;
    // 0xb79bb  jmp __ZdlPv   (a tail call on the fall-through path)
    operator_delete(extraBegin);
  }
  // 0xb79db-0xb79e1  epilogue / retq
}
