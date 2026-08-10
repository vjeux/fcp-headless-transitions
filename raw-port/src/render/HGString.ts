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
//
// SYMBOL PORTED IN THIS UNIT
//   0x000b3320 T __ZNK8HGString4dataEv   HGString::data() const
//
// Every other HGString method (length, c_str, hash, digest, push, join,
// fork, gate, sample2d, …) is its own ledger unit and is deliberately NOT
// written here.
//
// FRONTIER CALLEES: none.  The body is a single load; it contains no
// `callq` and no indirect branch.
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
//   +0x10  pending : size_t   `cmpq $0x0, 0x10(%rdi)` @0xb848c (c_str) —
//                             c_str() only returns `buf` directly when this
//                             is zero AND `buf[length] == 0`; otherwise it
//                             tail-calls str_close() to finalise the
//                             buffer.  Named for that role; its exact
//                             semantics belong to the str_close/str_ext
//                             units, which are not yet transcribed.
//
// The remainder of the object is opaque at this unit's decode depth and is
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
  /** +0x10 — `size_t`, tested by `cmpq $0x0, 0x10(%rdi)` @0xb848c. */
  pending: number;
}

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
