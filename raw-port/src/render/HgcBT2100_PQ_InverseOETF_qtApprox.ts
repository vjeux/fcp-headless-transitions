// HgcBT2100_PQ_InverseOETF_qtApprox.ts — Helium framework (render layer).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//         Versions/A/Helium  (macOS FCP, x86_64 slice).
//
// NOT the same class as the landed `HgcBT2100_PQ_InverseOETF.ts`. That one is
// `HgcBT2100_PQ_InverseOETF` (24 characters in the mangling, methods at @0x3ac7d0..); this is
// `HgcBT2100_PQ_InverseOETF_qtApprox` (33 characters, methods at @0x3ae7f0..) — the `qtApprox`
// variant, a distinct C++ class with its own vtable and its own method addresses. (The name is
// FCP's, not a description of this port: every instruction below is transcribed exactly.)
// The two file names differ by a real suffix, not by case, so this is NOT one of the APFS
// case-collision hazards (there is no `..._qtapprox.ts` on main).
//
// -----------------------------------------------------------------------------
// SYMBOL PORTED
// -----------------------------------------------------------------------------
//   * HgcBT2100_PQ_InverseOETF_qtApprox::GetParameter(int, float*)  @Helium 0x3b00e0
//     __ZN33HgcBT2100_PQ_InverseOETF_qtApprox12GetParameterEiPf
//
// re/disasm:
//   raw-port/re/disasm/Helium.__ZN33HgcBT2100_PQ_InverseOETF_qtApprox12GetParameterEiPf.s
//
// The class's other methods (RenderTile_AVX @0x3aeb70, RenderTile @0x3af3b0, GetProgram
// @0x3ae7f0, Bind @0x3aeb10, BindTexture @0x3aeaa0, GetDOD @0x3afc20, GetROI @0x3afc40,
// SetParameter @0x3b0060, GetOutput @0x3b0130, the ctors/dtors) are SEPARATE ledger entries and
// are NOT ported here. Two are quoted below purely as LAYOUT EVIDENCE.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
// NONE. A bounds test, a shift, and four 32-bit load/store pairs; no callq, no dispatch.
// `depgraph.py deps __ZN33HgcBT2100_PQ_InverseOETF_qtApprox12GetParameterEiPf` reports nothing.
//
// -----------------------------------------------------------------------------
// FULL DISASM (18 instructions, @0x3b00e0..@0x3b0128)
// -----------------------------------------------------------------------------
//   0x3b00e0  movl  $0xffffffff, %eax     ; the default return is -1, set BEFORE any test
//   0x3b00e5  cmpl  $0x1, %esi            ; index vs 1
//   0x3b00e8  ja    0x3b0128              ; UNSIGNED above -> return -1, no frame, no write
//   0x3b00ea  pushq %rbp                  ; (the frame is built only on the accepted path)
//   0x3b00eb  movq  %rsp, %rbp
//   0x3b00ee  movq  0x198(%rdi), %rax     ; rax = this->params
//   0x3b00f5  movl  %esi, %ecx            ; ZERO-extend the accepted index into rcx
//   0x3b00f7  shlq  $0x5, %rcx            ; rcx = index * 32 — the slot stride is 0x20
//   0x3b00fb  movss (%rax,%rcx), %xmm0    ; out[0] = slot[0]
//   0x3b0100  movss %xmm0, (%rdx)
//   0x3b0104  movss 0x4(%rax,%rcx), %xmm0 ; out[1] = slot[1]
//   0x3b010a  movss %xmm0, 0x4(%rdx)
//   0x3b010f  movss 0x8(%rax,%rcx), %xmm0 ; out[2] = slot[2]
//   0x3b0115  movss %xmm0, 0x8(%rdx)
//   0x3b011a  movss 0xc(%rax,%rcx), %xmm0 ; out[3] = slot[3]
//   0x3b0120  movss %xmm0, 0xc(%rdx)
//   0x3b0125  xorl  %eax, %eax            ; return 0
//   0x3b0127  popq  %rbp
//   0x3b0128  retq
//
// THREE DECISIONS THE LISTING MAKES:
//   1. THE BOUND IS UNSIGNED. `cmpl $0x1, %esi ; ja` rejects everything whose UNSIGNED value
//      exceeds 1, so index -1 is 0xFFFFFFFF and is REJECTED — a signed `index <= 1` test would
//      wrongly accept every negative index and then read at a negative slot offset. This node
//      has exactly TWO parameter slots, 0 and 1. (The bound is per-class and must not be
//      carried across: the sibling HgcSMAAEdgeDetect @0x203570 admits only index 0 via
//      `testl %esi,%esi`, and HgcScaleBiasCrop @0x2db170 admits 0..2 via `cmpl $0x2 ; ja`.)
//   2. THE SLOT STRIDE IS 0x20, not 0x10 — `shlq $0x5`. Each 32-byte slot holds the same four
//      floats twice; the getter reads the first half. (See SetParameter below, which writes
//      both halves.)
//   3. THE REJECT PATH WRITES NOTHING. `%rdx` is untouched before the early `retq` @0x3b0128,
//      so a rejected call leaves the caller's buffer exactly as it was, and only FOUR floats
//      are ever written — four separate `movss` pairs, not a 16-byte move.
//
// -----------------------------------------------------------------------------
// THE PARAMETER BLOCK AT this+0x198 (LAYOUT EVIDENCE — neither method is ported)
// -----------------------------------------------------------------------------
// The ctor @0x3afc60 allocates and aligns it, exactly the shape this node family uses:
//   0x3afc79  movl  $0x3e7,%edi ; callq __Znam       ; new char[999]
//   0x3afc83  leaq  0x8(%rax),%rcx ; negl %ecx ; andl $0x1f,%ecx
//   0x3afc8c  leaq  (%rcx,%rax),%rdx ; addq $0x8,%rdx ; rdx = the 32-byte-aligned block
//   0x3afc94  movq  %rax,(%rcx,%rax)                 ; stash the raw pointer for delete[]
//   0x3afc98  xorps %xmm0,%xmm0
//   0x3afc9b  movaps %xmm0,0x8(%rcx,%rax)            ; block[+0x00] = 0,0,0,0  <-- SLOT 0
//   0x3afca0  movaps %xmm0,0x18(%rcx,%rax)           ; block[+0x10] = 0,0,0,0  (slot 0, 2nd half)
//   0x3afca5  movaps %xmm0,0x28(%rcx,%rax)           ; block[+0x20] = 0,0,0,0  <-- SLOT 1
//   0x3afcaa  movaps %xmm0,0x38(%rcx,%rax)           ; block[+0x30] = 0,0,0,0  (slot 1, 2nd half)
//   0x3afcaf..                                       ; then many constant pairs into +0x40..
// so both SETTABLE slots — the only two this getter can return — are ZERO on a fresh node, and
// the constants above +0x40 belong to the render path and are NOT decoded by this unit.
//
// `SetParameter(int, float, float, float, float)` @0x3b0060 is the writer and confirms both the
// bound and the stride with the identical opening:
//   0x3b0060  movl $0xffffffff,%eax ; 0x3b0065 cmpl $0x1,%esi ; 0x3b0068 ja  -> return -1
//   0x3b006a  movq 0x198(%rdi),%rcx ; 0x3b0073 shlq $0x5,%rdx ; ...
// It then compares the four incoming floats against the slot and returns 0 unchanged if they
// already match, else packs them with `insertps` and stores to BOTH halves of the 32-byte slot.
//
// -----------------------------------------------------------------------------
// ORACLE — differential against the live binary, 600 cases, 0 divergences
// -----------------------------------------------------------------------------
// raw-port/re/oracle/HgcBT2100_PQ_InverseOETF_qtApprox_GetParameter_oracle.py. The symbol is a
// LOCAL (`t` in the cached symbol table), so it is called at x86_64 vmaddr + the loaded image's
// slide, under `arch -x86_64 /usr/bin/python3` so dyld maps the x86_64 slice these addresses
// come from (OPS_LOG "wrong architecture" — the mismatch fails silently toward VERIFIED).
//
// Each case builds a 32-byte-aligned 0x160-byte parameter block of random float bit patterns
// behind a 0xAA-poisoned receiver and passes an EIGHT-lane output buffer pre-filled with a
// -777.0 sentinel, so an over-copy is visible. Indices swept: 0, 1, 2, 3, -1, -2, 7, -100,
// INT_MAX, INT_MIN and 88 more drawn from {0, 1, random in [-1000, 1000]}. Results:
//   value divergences   = 0    (the four copied floats are bit-identical, for both slots)
//   return divergences  = 0    (0 for indices 0 and 1, -1 for everything else)
//   wrote past 16 bytes = 0    (lanes 4..7 keep the sentinel on every case)
//   object written      = 0    (the receiver is still 0xAA outside the +0x198 pointer)
// NEGATIVE CONTROLS, scored over the 100-entry index corpus: a SIGNED bound (which would accept
// negative indices) — 16 caught; bound 0 instead of 1 (rejecting slot 1) — 32; bound 2 instead
// of 1 — 1; and a 0x10 slot stride instead of 0x20 — caught on the one index (1) where the two
// strides differ.

/**
 * `HgcBT2100_PQ_InverseOETF_qtApprox` instance state — ONLY the one field this unit reads.
 *
 * Everything below +0x198 is the opaque HGNode base as far as GetParameter is concerned; the
 * body touches `this` exactly once, for the `movq 0x198(%rdi),%rax` load, which the oracle
 * confirms (the receiver is still 0xAA-poisoned everywhere else after every call).
 */
export interface HgcBT2100_PQ_InverseOETF_qtApproxState {
  /** HGNode base subobject placeholder (+0x000..+0x197) — untouched by this unit. */
  _hgNode: unknown;

  /**
   * +0x198 — `float* params`, the 32-byte-aligned block the ctor allocates
   * @0x3afc79..@0x3afd4b (`new char[0x3e7]`). Loaded by `movq 0x198(%rdi),%rax` @0x3b00ee.
   * Laid out as 32-byte slots; this unit reads slots 0 and 1 (lanes 0..3 and 8..11), both
   * ctor-zeroed. The constants above +0x40 belong to the render path and are not decoded here.
   *
   * Modelled as a Float32Array — the same treatment as HgcAVATemporalAverage's `coefBuf`,
   * HgcScaleBiasCrop's and HgcSMAAEdgeDetect's `params`.
   */
  params: Float32Array | null;
}

/** `shlq $0x5` @0x3b00f7 — the parameter slot stride, in float32 LANES (32 bytes / 4). */
const SLOT_LANES = 0x20 >> 2;

/**
 * `HgcBT2100_PQ_InverseOETF_qtApprox::GetParameter(int index, float* out)` — @Helium 0x3b00e0
 *   __ZN33HgcBT2100_PQ_InverseOETF_qtApprox12GetParameterEiPf
 *
 * Copies parameter slot `index` into `out` and returns 0; returns -1, writing nothing, unless
 * the UNSIGNED index is 0 or 1. Full line-by-line decode, the parameter-block evidence and the
 * oracle results are in the file header above.
 *
 * @param self  %rdi — the node instance.
 * @param index %esi — the parameter slot; compared UNSIGNED against 1, so negatives are rejected.
 * @param out   %rdx — a caller-owned buffer of at least 4 float32 lanes, written ONLY on success.
 * @returns the int in %eax: 0 on success (@0x3b0125), -1 otherwise (@0x3b00e0).
 */
export function HgcBT2100_PQ_InverseOETF_qtApprox_GetParameter(
  self: HgcBT2100_PQ_InverseOETF_qtApproxState,
  index: number,
  out: Float32Array,
): number {
  // @0x3b00e5 cmpl $0x1,%esi ; @0x3b00e8 ja — an UNSIGNED compare. `>>> 0` reproduces it:
  // index -1 becomes 4294967295, which is > 1, so it is rejected exactly as the machine
  // rejects it. A signed `index > 1` test here would wrongly accept every negative index.
  if ((index >>> 0) > 1) {
    return -1;
  }

  // @0x3b00ee movq 0x198(%rdi),%rax — the parameter block.
  const params = self.params;
  if (params === null) {
    // The disassembly does not null-check the pointer; it dereferences it immediately
    // @0x3b00fb, so a null block faults inside this function. That is a fault, not a decoded
    // code path, and no value is defined for it, so the port refuses loudly rather than
    // inventing one. The rejected-index path above has already returned without dereferencing,
    // exactly as @0x3b0128 does.
    throw new Error(
      "HgcBT2100_PQ_InverseOETF_qtApprox::GetParameter @Helium 0x3b00e0: null parameter block "
        + "(this+0x198) — the binary would fault here",
    );
  }

  // @0x3b00f5 movl %esi,%ecx — a 32-bit move that ZERO-extends into rcx; the index is already
  //   known to be 0 or 1 here. @0x3b00f7 shlq $0x5 — 32 bytes per slot, i.e. 8 float lanes.
  const base = ((index >>> 0) * SLOT_LANES) | 0;

  // @0x3b00fb..@0x3b0120 — four independent `movss` load/store pairs, lane by lane. Not a
  // 16-byte move, and nothing beyond lane 3 is written (confirmed live against an 8-lane
  // output buffer that keeps its sentinel in lanes 4..7).
  out[0] = params[base + 0]; // @0x3b00fb / @0x3b0100
  out[1] = params[base + 1]; // @0x3b0104 / @0x3b010a
  out[2] = params[base + 2]; // @0x3b010f / @0x3b0115
  out[3] = params[base + 3]; // @0x3b011a / @0x3b0120

  // @0x3b0125 xorl %eax,%eax ; @0x3b0127 popq %rbp ; @0x3b0128 retq
  return 0;
}
