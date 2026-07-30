// std::__1::__tuple_less<4ul>::operator()[abi:nqe210106]  — ProCore.framework
//
// The one instantiation the FCP binary embeds is:
//   bool std::__1::__tuple_less<4ul>::operator()<
//        std::__1::tuple<PCCFRef<CGColorSpace*>,
//                        PCColorUtil::AlphaFormat,
//                        PCCFRef<CGColorSpace*>,
//                        PCColorUtil::AlphaFormat>,
//        std::__1::tuple<PCCFRef<CGColorSpace*>,
//                        PCColorUtil::AlphaFormat,
//                        PCCFRef<CGColorSpace*>,
//                        PCColorUtil::AlphaFormat>>(
//     std::__1::tuple<…> const& lhs,
//     std::__1::tuple<…> const& rhs);
//
// This is libc++'s standard "lexicographic tuple compare for the first 4
// elements" helper — it's the concrete `operator()` inside
// `std::__1::__tuple_less<4>`, which is what `std::__1::less<std::tuple<…>>`
// falls back to for a 4-tuple key. The FCP embeds it as the ordering
// comparator for a PCEvictionHeap/PCCacheImpl map keyed on the tuple
// `(dstCS, dstAlpha, srcCS, srcAlpha)` — the memoized-vImageConverter
// cache in PCColorUtil (see the ledger's neighbour instantiations listed
// under this same tuple type in ProCore.ledger.json).
//
// Provenance:
//   Binary: /Applications/Final Cut Pro.app/Contents/Frameworks/
//           ProCore.framework/Versions/A/ProCore (x86_64 slice; unadjusted
//           VAs from `otool -tV`).
//   Disasm: raw-port/re/disasm/ProCore.__ZNSt3__112__tuple_lessILm4EE
//           clB9nqe210106INS_5tupleIJ7PCCFRefIP12CGColorSpaceEN11PCColorUtil
//           11AlphaFormatES7_S9_EEESA_EEbRKT_RKT0_.s
//
// ─────────────────────────────────────────────────────────────────────────
// SYMBOL PORTED HERE
// ─────────────────────────────────────────────────────────────────────────
//   * __ZNSt3__112__tuple_lessILm4EEclB9nqe210106INS_5tupleIJ7PCCFRefIP12
//       CGColorSpaceEN11PCColorUtil11AlphaFormatES7_S9_EEESA_EEbRKT_RKT0_
//                                                              @ProCore 0x11934
//
// ─────────────────────────────────────────────────────────────────────────
// FULL DISASM (28 lines from otool -tV)
// ─────────────────────────────────────────────────────────────────────────
//   0x11934  pushq %rbp
//   0x11935  movq  %rsp, %rbp
//   0x11938  movq  (%rsi), %rcx                ; rcx = *(lhs + 0x00) — 8-byte
//   0x1193b  movq  (%rdx), %rdi                ; rdi = *(rhs + 0x00) — 8-byte
//   0x1193e  movb  $0x1, %al                   ; default return = true
//   0x11940  cmpq  %rdi, %rcx                  ; flags = rcx - rdi (AT&T)
//   0x11943  jb    0x11955                     ; if rcx <  rdi -> ret 1 (true)
//   0x11945  jbe   0x1194b                     ; if rcx == rdi -> compare next
//   0x11947  xorl  %eax, %eax                  ; else (rcx > rdi) ret 0 (false)
//   0x11949  jmp   0x11955
//   0x1194b  movl  0x8(%rsi), %ecx             ; ecx = *(lhs + 0x08) — 4-byte
//   0x1194e  movl  0x8(%rdx), %edi             ; edi = *(rhs + 0x08) — 4-byte
//   0x11951  cmpl  %edi, %ecx                  ; flags = ecx - edi
//   0x11953  jge   0x11957                     ; if ecx >= edi (signed) -> skip
//   0x11955  popq  %rbp                        ; return %al
//   0x11956  retq
//   0x11957  jg    0x11947                     ; if ecx >  edi (signed) -> ret 0
//   0x11959  movq  0x10(%rsi), %rcx            ; rcx = *(lhs + 0x10) — 8-byte
//   0x1195d  movq  0x10(%rdx), %rdi            ; rdi = *(rhs + 0x10) — 8-byte
//   0x11961  cmpq  %rdi, %rcx                  ; flags = rcx - rdi
//   0x11964  jb    0x11955                     ; if rcx <  rdi -> ret 1 (true)
//   0x11966  ja    0x11947                     ; if rcx >  rdi -> ret 0 (false)
//   0x11968  movl  0x18(%rsi), %eax            ; eax = *(lhs + 0x18) — 4-byte
//   0x1196b  cmpl  0x18(%rdx), %eax            ; flags = eax - rhs[+0x18]
//   0x1196e  setl  %al                         ; al = (eax < rhs[+0x18]) signed
//   0x11971  jmp   0x11955
//   0x11973  nop
// ─────────────────────────────────────────────────────────────────────────
//
// SEMANTIC (line-by-line):
//   Lexicographic 4-element compare with mixed widths and mixed signedness:
//     element 0 @ +0x00 : 8-byte, UNSIGNED (jb/jbe/ja are CF-based)
//     element 1 @ +0x08 : 4-byte, SIGNED   (jge/jg/setl are SF/OF-based)
//     element 2 @ +0x10 : 8-byte, UNSIGNED (jb/ja)
//     element 3 @ +0x18 : 4-byte, SIGNED   (setl)
//   Returns TRUE iff lhs < rhs under this ordering; FALSE if lhs >= rhs.
//
//   The 8-byte fields are `PCCFRef<CGColorSpace*>` — a single-pointer wrapper
//   around a `CGColorSpaceRef`. Comparing them as unsigned 64-bit values is
//   the standard libc++ pointer-ordering used by `std::less<T*>` (well-defined
//   for `std::less` even across distinct allocations, per [comparisons]).
//   The 4-byte fields are `PCColorUtil::AlphaFormat` (an unscoped enum with
//   `int` underlying type — hence signed compare).
//
// ─────────────────────────────────────────────────────────────────────────
// STRUCT LAYOUT (recovered from the offsets used above)
// ─────────────────────────────────────────────────────────────────────────
//   std::__1::tuple<PCCFRef<CGColorSpace*>, AlphaFormat,
//                   PCCFRef<CGColorSpace*>, AlphaFormat> (24-byte-aligned; 32
//   bytes total assuming +0x08 → 4 bytes + 4 padding, +0x18 → 4 bytes + 4 pad):
//     +0x00  void*         elem_at_00   ; PCCFRef<CGColorSpace*> value bits
//     +0x08  int32         elem_at_08   ; AlphaFormat (signed enum)
//     +0x10  void*         elem_at_10   ; PCCFRef<CGColorSpace*> value bits
//     +0x18  int32         elem_at_18   ; AlphaFormat (signed enum)
//
//   Note: libc++'s __tuple_impl stores elements in REVERSE declaration order
//   internally (the leaf-recursion base is the last element), but the OFFSETS
//   the compiler emits for this particular instantiation happen to place the
//   4-tuple such that the first probed field is at +0x00 and the last at
//   +0x18. What matters for a faithful port is that we read the SAME BYTES the
//   binary reads, at the SAME OFFSETS, with the SAME SIGNEDNESS — this file
//   models the byte view exactly. The mapping from these fields back to the
//   declared-order tuple elements is left to the CALLER (the map keys it
//   builds); this helper only cares about the memory image.
// ─────────────────────────────────────────────────────────────────────────

// ─── Types for the on-wire layout the disasm dereferences ───────────────────

/**
 * Byte-accurate view of the 4-tuple key the FCP binary passes to this helper.
 * The four probed offsets — 0x00, 0x08, 0x10, 0x18 — appear directly in the
 * disasm (@ProCore 0x11938, 0x1194b, 0x11959, 0x11968) and are the only bytes
 * this function ever inspects.
 *
 * Field naming keeps the raw offset in the name so callers cannot accidentally
 * bind an element to the wrong slot — the ordering established by the
 * comparator is `elem_at_00 (unsigned 64) → elem_at_08 (signed 32) →
 * elem_at_10 (unsigned 64) → elem_at_18 (signed 32)`.
 */
export interface Tuple4_CGCS_Alpha_CGCS_Alpha {
  /** @ProCore 0x11938 (`movq (%rsi),%rcx`) — PCCFRef<CGColorSpace*> value
   *  bits; compared as an UNSIGNED 64-bit integer (CF-based `jb`/`jbe`). */
  elem_at_00: bigint;
  /** @ProCore 0x1194b (`movl 0x8(%rsi),%ecx`) — PCColorUtil::AlphaFormat; a
   *  4-byte SIGNED integer (jge/jg/setl are signed). */
  elem_at_08: number;
  /** @ProCore 0x11959 (`movq 0x10(%rsi),%rcx`) — PCCFRef<CGColorSpace*> value
   *  bits; compared as UNSIGNED 64-bit. */
  elem_at_10: bigint;
  /** @ProCore 0x11968 (`movl 0x18(%rsi),%eax`) — PCColorUtil::AlphaFormat;
   *  4-byte SIGNED integer. */
  elem_at_18: number;
}

// ─── Helpers that faithfully model the machine's compare + branch chains ────

/** 32-bit-signed compare, matching `cmpl %edi,%ecx` → signed jCC. Returns
 *  negative/zero/positive like C's `memcmp`-style sign; the caller uses the
 *  same branch table as the disasm (`jge`, `jg`, `setl`).
 *  Both inputs are assumed already narrowed into signed 32-bit range. */
function cmp_i32(lhs: number, rhs: number): -1 | 0 | 1 {
  // Narrow to int32 to reproduce the truncation the machine does when loading
  // via `movl` (32-bit load — no sign-extension beyond int32).
  const a = lhs | 0;
  const b = rhs | 0;
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/** 64-bit-UNSIGNED compare, matching `cmpq %rdi,%rcx` → CF-based jCC (`jb`,
 *  `ja`). BigInts in TS are signed-arbitrary-precision, but by construction
 *  `PCCFRef<CGColorSpace*>` values here are non-negative 64-bit pointer bits;
 *  a straight `<`/`>` on two non-negative bigints yields the same result as
 *  an unsigned 64-bit compare. */
function cmp_u64(lhs: bigint, rhs: bigint): -1 | 0 | 1 {
  if (lhs < rhs) return -1;
  if (lhs > rhs) return 1;
  return 0;
}

// ─── The ported function ────────────────────────────────────────────────────

/**
 * `bool std::__1::__tuple_less<4>::operator()<Tuple, Tuple>(const Tuple& lhs,
 * const Tuple& rhs)` — libc++'s lexicographic 4-tuple compare, instantiated
 * for the tuple `(PCCFRef<CGColorSpace*>, AlphaFormat, PCCFRef<CGColorSpace*>,
 * AlphaFormat)` that FCP uses as the key of the memoized-vImageConverter
 * cache in PCColorUtil.
 *
 * Returns `true` iff `lhs < rhs` under lexicographic ordering; `false`
 * otherwise (including all cases of `lhs == rhs`).
 *
 * @ProCore 0x11934
 */
export function std__tuple_less_4_CGColorSpace_AlphaFormat_op_call(
  lhs: Tuple4_CGCS_Alpha_CGCS_Alpha,
  rhs: Tuple4_CGCS_Alpha_CGCS_Alpha,
): boolean {
  // ─── @ProCore 0x11934..0x11935  frame prologue — no TS-visible effect ───

  // ─── @ProCore 0x11938..0x11940  first field: 8-byte UNSIGNED compare ───
  //   0x11938  movq (%rsi),%rcx            rcx = lhs.elem_at_00
  //   0x1193b  movq (%rdx),%rdi            rdi = rhs.elem_at_00
  //   0x1193e  movb $0x1,%al               al  = 1  (default return: true)
  //   0x11940  cmpq %rdi,%rcx              flags = rcx - rdi
  const c0 = cmp_u64(lhs.elem_at_00, rhs.elem_at_00);

  // 0x11943  jb 0x11955   — CF=1 ⇒ rcx < rdi ⇒ ret 1 (true).
  if (c0 < 0) {
    // Falls through @0x11955..0x11956 (`popq %rbp ; retq`) with %al still 1.
    return true;
  }
  // 0x11945  jbe 0x1194b  — ZF=1 (rcx == rdi, since CF already 0) ⇒ next field.
  if (c0 > 0) {
    // 0x11947  xorl %eax,%eax             al = 0
    // 0x11949  jmp  0x11955               → ret 0 (false).
    return false;
  }
  // (c0 === 0) — fall through to the +0x08 compare at 0x1194b.

  // ─── @ProCore 0x1194b..0x11951  second field: 4-byte SIGNED compare ────
  //   0x1194b  movl 0x8(%rsi),%ecx        ecx = lhs.elem_at_08
  //   0x1194e  movl 0x8(%rdx),%edi        edi = rhs.elem_at_08
  //   0x11951  cmpl %edi,%ecx             flags = ecx - edi
  const c1 = cmp_i32(lhs.elem_at_08, rhs.elem_at_08);

  // 0x11953  jge 0x11957  — SF==OF ⇒ ecx >= edi ⇒ jump forward.
  //   ELSE (ecx < edi) fall through: 0x11955..0x11956 with %al still 1
  //   (never rewritten between 0x1194b and here) ⇒ ret true.
  if (!(c1 >= 0)) {
    return true;
  }
  // 0x11957  jg 0x11947   — signed strict greater ⇒ ret 0 (false).
  if (c1 > 0) {
    return false;
  }
  // (c1 === 0) — fall through to the +0x10 compare at 0x11959.

  // ─── @ProCore 0x11959..0x11961  third field: 8-byte UNSIGNED compare ───
  //   0x11959  movq 0x10(%rsi),%rcx       rcx = lhs.elem_at_10
  //   0x1195d  movq 0x10(%rdx),%rdi       rdi = rhs.elem_at_10
  //   0x11961  cmpq %rdi,%rcx             flags = rcx - rdi
  const c2 = cmp_u64(lhs.elem_at_10, rhs.elem_at_10);

  // 0x11964  jb 0x11955   — rcx < rdi ⇒ ret 1 (true).
  //   Note: at this program point %al has NOT been changed since 0x1193e,
  //   so it's still the 1 the prologue set. This is why the machine can
  //   just fall to the shared epilogue.
  if (c2 < 0) {
    return true;
  }
  // 0x11966  ja 0x11947   — rcx > rdi ⇒ ret 0 (false).
  if (c2 > 0) {
    return false;
  }
  // (c2 === 0) — fall through to the +0x18 compare at 0x11968.

  // ─── @ProCore 0x11968..0x1196e  fourth field: 4-byte SIGNED compare ────
  //   0x11968  movl 0x18(%rsi),%eax       eax = lhs.elem_at_18
  //   0x1196b  cmpl 0x18(%rdx),%eax       flags = eax - rhs.elem_at_18
  //   0x1196e  setl %al                   al = (eax < rhs.elem_at_18) ? 1 : 0
  //   0x11971  jmp 0x11955                → ret al
  //
  // `setl` is the signed strict-less setter — this is the tie-breaker on the
  // last tuple element. Note that on equality the whole compare returns
  // false (setl sets 0), which matches strict-weak-ordering semantics for
  // std::less<tuple>.
  const eq_or_less_last = cmp_i32(lhs.elem_at_18, rhs.elem_at_18);
  return eq_or_less_last < 0;
}
