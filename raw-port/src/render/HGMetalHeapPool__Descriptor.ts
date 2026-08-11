// HGMetalHeapPool__Descriptor.ts — raw transcription of the Helium NESTED
// class `HGMetalHeapPool::Descriptor`.
//
// The file name joins the outer and inner names with a DOUBLE underscore, per
// PORTING_SPEC ("nested classes are `Outer__Inner`"; precedent
// `PCBezierNamespace__SampledContour.ts`). The outer class `HGMetalHeapPool`
// is NOT ported here and has no file on main yet.
//
// ONE symbol is transcribed in this file — `operator==`. Every other member is
// a SEPARATE ledger unit and is NOT ported here. The neighbours, for
// orientation only (addresses from the cached x86_64 inventory
// `raw-port/army/inventory/Helium.syms.txt`):
//   0x171170  HGMetalHeapPool::Descriptor::size() const
//   0x171180  HGMetalHeapPool::Descriptor::operator==(...) const  <-- here
//   0x1711a0  HGMetalHeapPool::HGMetalHeapPool(HGMTLDeviceType)   [outer C2]
//   0x1715a0  HGPool::Pool<MTLHeap*, Descriptor>::newObjectWithRecovery(
//             Descriptor const&, bool)  — the pool that USES this comparison
//   0x1717c0  HGPool::Pool<MTLHeap*, Descriptor>::releaseObject(MTLHeap*)
//
// Provenance (Helium framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// Symbol ported in this file:
//   @0x171180  HGMetalHeapPool::Descriptor::operator==(Descriptor const&) const
//                __ZNK15HGMetalHeapPool10DescriptoreqERKS0_
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym __ZNK15HGMetalHeapPool10DescriptoreqERKS0_
//  Helium`):
//   raw-port/re/disasm/Helium.__ZNK15HGMetalHeapPool10DescriptoreqERKS0_.s
//   (15 lines)
//
// ---------------------------------------------------------------------------
// FULL DISASM — the whole function, every instruction
// ---------------------------------------------------------------------------
//   0x171180  pushq %rbp             ; frame setup (no TS counterpart)
//   0x171181  movq  %rsp, %rbp       ; frame setup (no TS counterpart)
//   0x171184  movq  (%rsi), %rax     ; rax = other.<u64 @+0x0>
//   0x171187  cmpq  (%rdi), %rax     ; flags on rax - this.<u64 @+0x0>
//   0x17118a  jne   0x171197         ; differ -> return false
//   0x17118c  movl  0x8(%rsi), %eax  ; eax = other.<u32 @+0x8>   (32-bit!)
//   0x17118f  cmpl  0x8(%rdi), %eax  ; flags on eax - this.<u32 @+0x8>
//   0x171192  sete  %al              ; al = (they are equal)
//   0x171195  popq  %rbp
//   0x171196  retq                   ; returns al
//   0x171197  xorl  %eax, %eax       ; the early-out: false
//   0x171199  popq  %rbp
//   0x17119a  retq
//   0x17119b  nopl  (%rax,%rax)      ; alignment padding, not executed
//
// AT&T note: `cmpq %src, %dst` computes `dst - src`, so `cmpq (%rdi), %rax`
// subtracts `this` from `other`. For an EQUALITY test the direction does not
// change the answer — but it is written down here because reading the operand
// order backwards is the most repeated decode mistake in this codebase, and
// the very next unit in this class may well be an ordering comparison where it
// does matter.
//
// ---------------------------------------------------------------------------
// THE WIDTHS ARE THE WHOLE UNIT
// ---------------------------------------------------------------------------
// The two compares are NOT the same size:
//   +0x0  `movq`/`cmpq`  (REX.W `48 8b 06` / `48 3b 07`)  — 64 bits
//   +0x8  `movl`/`cmpl`  (no REX.W, `8b 46 08` / `3b 47 08`) — 32 bits
// So the four bytes at +0xc are NOT part of the comparison. Two Descriptors
// that differ only there are EQUAL to this operator. That is the one way this
// port could be silently wrong, so it is what the oracle attacks hardest: 36
// of its 400 pairs differ ONLY in +0xc, and the live function calls every one
// of them equal.
//
// ---------------------------------------------------------------------------
// LAYOUT — only what THIS body observes
// ---------------------------------------------------------------------------
//   +0x00  u64  size      — the sibling `Descriptor::size() const` @0x171170 is
//                           exactly `movq (%rdi), %rax ; retq`, which is what
//                           names this field. That accessor is its own ledger
//                           unit and is NOT ported here.
//   +0x08  u32  field_8   — deliberately NOT named. Nothing in this body, and
//                           nothing in `size()`, reveals its meaning; the
//                           plausible guesses (an MTLStorageMode, an
//                           MTLResourceOptions bitfield, a heap type) are
//                           guesses, and inventing a name would be the
//                           "invent-a-meaning" smell. Its writer is in the
//                           outer class's ctor/pool code, not here.
//   +0x0c  4 bytes        — not read by this function. Present in the object
//                           (the pool's Entry type is 16-byte aligned) but
//                           outside the 32-bit compare, as proven live.
// The object is modelled as those observed fields ONLY; total size is not
// derivable from this body and is not claimed.
//
// CALLEES: none. Two loads, two compares, one `sete` —
// `depgraph.py deps __ZNK15HGMetalHeapPool10DescriptoreqERKS0_` lists nothing.
//
// ---------------------------------------------------------------------------
// ORACLE — verified by CALLING the live function
// ---------------------------------------------------------------------------
// raw-port/re/oracle/HGMetalHeapPool__Descriptor_operator_eq_oracle.py, run
// under `arch -x86_64 /usr/bin/python3` so the process executes the same
// x86_64 slice this file was transcribed from. Results (2026-08-11):
//   * dlsym cross-check PASS — the symbol is exported (`nm` `T`); dlsym and
//     `slide + 0x171180` agree.
//   * byte self-check PASS —
//     `55 48 89 e5 48 8b 06 48 3b 07 75 0b 8b 46 08 3b 47 08 0f 94 c0 5d c3
//      31 c0 5d c3`. The absence of REX.W on the +0x8 pair is visible right
//     there in the encoding.
//   * 400 pairs, 0 divergences — 72 reported equal and 328 not equal, so BOTH
//     outcomes are exercised (an all-one-answer corpus would prove nothing).
//   * 36 of those pairs differ ONLY in the +0xc bytes, and the live function
//     called every one EQUAL.
//   * the operands are byte-identical after every call, as `const` implies.
//   * negative controls, all live: u64-compare-at-+0x8 36/400 (killed by
//     exactly the padding cases), compare-only-+0x0 72/400,
//     compare-only-+0x8 36/400, compare-all-16-bytes 36/400, always-equal
//     328/400, always-different 72/400.

/**
 * `HGMetalHeapPool::Descriptor` — the key the Metal heap pool matches
 * allocations against (`HGPool::Pool<MTLHeap*, Descriptor>` @0x1715a0 is its
 * only observed consumer).
 *
 * Only the two fields the transcribed comparison reads are modelled; see the
 * LAYOUT note in the file header.
 *
 * @Helium 0x171180
 */
export class HGMetalHeapPool__Descriptor {
  /**
   * (+0x00) The heap size, as a 64-bit value. Named from the sibling accessor
   * `Descriptor::size() const` @Helium 0x171170, whose entire body is
   * `movq (%rdi), %rax ; retq` — that accessor is a separate ledger unit and
   * is not ported here.
   *
   * Modelled as `bigint` because the compare is a full 64-bit `cmpq` and a
   * heap size can exceed 2^53 (PORTING_SPEC Rule 4).
   *
   * @Helium 0x171184
   */
  size_at_0x0: bigint = 0n;

  /**
   * (+0x08) A 32-bit field, compared with `cmpl`. Its MEANING is not
   * observable from this body and is deliberately not guessed — see the LAYOUT
   * note. Stored as an unsigned 32-bit number.
   *
   * @Helium 0x17118c
   */
  field_8: number = 0;

  /**
   * `HGMetalHeapPool::Descriptor::operator==(Descriptor const& other) const`
   * — @Helium 0x171180 (__ZNK15HGMetalHeapPool10DescriptoreqERKS0_).
   *
   * Two Descriptors are equal iff their 64-bit field at +0x0 and their
   * 32-BIT field at +0x8 both match. Full transcription — every instruction,
   * in order:
   *
   *   0x171184  movq (%rsi), %rax    ; other.size
   *   0x171187  cmpq (%rdi), %rax    ; vs this.size (64-bit)
   *   0x17118a  jne  0x171197        ; -> xorl %eax,%eax ; retq  (false)
   *   0x17118c  movl 0x8(%rsi), %eax ; other.field_8
   *   0x17118f  cmpl 0x8(%rdi), %eax ; vs this.field_8 (32-bit)
   *   0x171192  sete %al             ; the result
   *
   * Decode notes:
   *   * the second compare is `movl`/`cmpl`, NOT `movq`/`cmpq` — the bytes
   *     carry no REX.W prefix. Bytes +0xc..+0xf are therefore outside the
   *     comparison, and two Descriptors differing only there are EQUAL
   *     (confirmed live over 36 such pairs).
   *   * the early-out at 0x171197 returns via `xorl %eax,%eax`, i.e. plain
   *     false — it is not a `sete` of the first compare, so there is no path
   *     that returns the first compare's flags.
   *   * `const`: the body only loads. Confirmed live — both operands are
   *     byte-identical after every call.
   *
   * @returns whether the two descriptors compare equal.
   */
  equals(other: HGMetalHeapPool__Descriptor): boolean {
    // @0x171184/@0x171187 — movq (%rsi), %rax ; cmpq (%rdi), %rax : the full
    // 64-bit size compare. @0x17118a jne -> the false early-out at 0x171197.
    if (other.size_at_0x0 !== this.size_at_0x0) {
      // @0x171197 — xorl %eax, %eax ; retq
      return false;
    }
    // @0x17118c/@0x17118f — movl 0x8(%rsi), %eax ; cmpl 0x8(%rdi), %eax : a
    // 32-BIT compare, so only the low four bytes at +0x8 participate.
    // @0x171192 — sete %al
    return (other.field_8 >>> 0) === (this.field_8 >>> 0);
  }
}
