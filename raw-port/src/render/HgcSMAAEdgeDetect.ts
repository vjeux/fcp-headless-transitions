// HgcSMAAEdgeDetect.ts — Helium framework (render layer).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//         Versions/A/Helium  (macOS FCP, x86_64 slice).
//
// -----------------------------------------------------------------------------
// SYMBOLS PORTED
// -----------------------------------------------------------------------------
//   * HgcSMAAEdgeDetect::GetParameter(int, float*)   @Helium 0x203570
//     __ZN17HgcSMAAEdgeDetect12GetParameterEiPf
//
// re/disasm:
//   raw-port/re/disasm/Helium.__ZN17HgcSMAAEdgeDetect12GetParameterEiPf.s
//
// The class's other methods (RenderTile_AVX @0x202bc0, RenderTile @0x202e50,
// GetProgram @0x202230, Bind @0x202b80, BindTexture @0x202920, GetDOD @0x203150,
// GetROI @0x2031a0, SetParameter @0x203500, GetOutput @0x2035b0, the ctors and
// dtors) are SEPARATE ledger entries and are NOT ported here. Two are quoted
// below purely as LAYOUT EVIDENCE for the parameter block.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
// NONE. The body has no `callq`, no vtable dispatch and no rip-relative operand —
// it is a bounds test plus four 32-bit loads/stores. `depgraph.py deps
// __ZN17HgcSMAAEdgeDetect12GetParameterEiPf` reports nothing.
//
// -----------------------------------------------------------------------------
// FULL DISASM (16 instructions, @0x203570..@0x2035ae)
// -----------------------------------------------------------------------------
//   0x203570  movl  $0xffffffff, %eax     ; the default return is -1, set BEFORE any test
//   0x203575  testl %esi, %esi            ; flags on index & index
//   0x203577  je    0x20357a              ; index == 0 -> do the copy
//   0x203579  retq                        ;   otherwise return -1 with NO frame and NO write
//   0x20357a  pushq %rbp                  ; (the frame is only built on the index == 0 path)
//   0x20357b  movq  %rsp, %rbp
//   0x20357e  movq  0x198(%rdi), %rax     ; rax = this->params
//   0x203585  movss (%rax), %xmm0         ; out[0] = params[0]
//   0x203589  movss %xmm0, (%rdx)
//   0x20358d  movss 0x4(%rax), %xmm0      ; out[1] = params[1]
//   0x203592  movss %xmm0, 0x4(%rdx)
//   0x203597  movss 0x8(%rax), %xmm0      ; out[2] = params[2]
//   0x20359c  movss %xmm0, 0x8(%rdx)
//   0x2035a1  movss 0xc(%rax), %xmm0      ; out[3] = params[3]
//   0x2035a6  movss %xmm0, 0xc(%rdx)
//   0x2035ab  xorl  %eax, %eax            ; return 0
//   0x2035ad  popq  %rbp
//   0x2035ae  retq
//
// THREE THINGS THE LISTING DECIDES, all of them easy to get wrong:
//   1. ONLY index 0 exists. `testl %esi,%esi ; je` is an equality test against ZERO, not a
//      range check — `index == 1` returns -1 exactly like `index == -100` does. Its writer
//      `SetParameter` @0x203500 opens with the identical two instructions, so the two agree.
//      (Contrast HgcScaleBiasCrop, whose SetParameter @0x2db170 admits 0, 1 and 2 via
//      `cmpl $0x2,%esi ; ja`. The single-slot form here is a different contract, so the
//      bound must not be copied across from a sibling class.)
//   2. The failure path writes NOTHING. `%rdx` (the `float* out`) is never touched before the
//      early `retq` @0x203579, so a rejected call leaves the caller's buffer untouched — a
//      port that zero-filled `out` on failure would add stores the machine does not perform.
//   3. It copies EXACTLY FOUR floats, as four separate `movss` pairs, not one 16-byte move.
//      There is no store to `out + 0x10` or beyond.
//
// -----------------------------------------------------------------------------
// THE PARAMETER BLOCK AT this+0x198 (LAYOUT EVIDENCE — neither method is ported)
// -----------------------------------------------------------------------------
// `HgcSMAAEdgeDetect::HgcSMAAEdgeDetect()` @0x2031f0 allocates it and pins both its alignment
// and the width of a slot:
//   0x203209  movl  $0x107,%edi ; callq __Znam        ; new char[263]
//   0x203213  leaq  0x8(%rax),%rcx
//   0x203217  negl  %ecx
//   0x203219  andl  $0x1f,%ecx                        ; pad up to a 32-byte boundary
//   0x20321c  leaq  (%rcx,%rax),%rdx ; addq $0x8,%rdx ; rdx = the aligned block
//   0x203224  movq  %rax,(%rcx,%rax)                  ; stash the raw pointer for delete[]
//   0x203228  xorps %xmm0,%xmm0
//   0x20322b  movaps %xmm0,0x8(%rcx,%rax)             ; block[+0x00] = 0,0,0,0   <-- SLOT 0
//   0x203230  movaps %xmm0,0x18(%rcx,%rax)            ; block[+0x10] = 0,0,0,0
//   0x203235..0x2032a8  six more constant pairs into block[+0x20..+0xdf]
//   0x2032b0  movq  %rdx,0x198(%rbx)                  ; this->params = block
// so the block is 32-byte aligned, 0xE0 bytes are initialised, and — the part that matters
// here — SLOT 0, the four floats this getter returns, is ZERO on a fresh node. The remaining
// six constant pairs belong to the render path and are NOT decoded by this unit; naming them
// would be the magic-offset guesswork PORTING_SPEC Rule 5 forbids.
//
// `HgcSMAAEdgeDetect::SetParameter(int, float, float, float, float)` @0x203500 is the writer:
// after the same `testl %esi,%esi` index test it packs the four floats with `insertps` and
// stores them TWICE, `movups %xmm0,0x10(%rax)` then `movups %xmm0,(%rax)` @0x203556/0x20355a —
// i.e. the settable slot is 32 bytes holding the same four floats in both halves, and the
// getter reads back the first half. It also short-circuits (returns 0, writing nothing) when
// all four values already compare equal.
//
// -----------------------------------------------------------------------------
// ORACLE — differential against the live binary, 600 cases, 0 divergences
// -----------------------------------------------------------------------------
// raw-port/re/oracle/HgcSMAAEdgeDetect_GetParameter_oracle.py. The symbol is a LOCAL
// (`t` in the cached symbol table), so it is not dlsym-able: the harness calls it at x86_64
// vmaddr + the loaded image's slide, under `arch -x86_64 /usr/bin/python3` so dyld maps the
// x86_64 slice these addresses come from (OPS_LOG "wrong architecture" — the mismatch fails
// silently toward VERIFIED).
//
// Each case builds a 32-byte-aligned 0xE0 parameter block of random float bit patterns behind a
// 0xAA-poisoned receiver, and passes an EIGHT-lane output buffer pre-filled with a -777.0
// sentinel — twice what the function should write, so an over-copy is visible. Indices swept:
// 0, ±1, 2, 7, -100, INT_MAX, INT_MIN and 90 random values in [-1000, 1000]. Results:
//   value divergences   = 0     (the four copied floats are bit-identical)
//   return divergences  = 0     (0 for index 0, -1 for every other index)
//   wrote past 16 bytes = 0     (lanes 4..7 are still the sentinel on every case)
//   object written      = 0     (the receiver is still 0xAA outside the +0x198 pointer)
// NEGATIVE CONTROLS on the same corpus: "accepts any index instead of only 0" — 582 caught;
// "returns 0 instead of -1 for a bad index" — 582; "copies 8 lanes instead of 4" — 18 (the
// direct over-copy check above is the stronger evidence for that one).

/**
 * `HgcSMAAEdgeDetect` instance state — ONLY the one field this unit reads.
 *
 * Everything below +0x198 is the opaque HGNode base as far as GetParameter is concerned; the
 * body touches `this` exactly once, for the `movq 0x198(%rdi),%rax` load, which the oracle
 * confirms (the receiver is still 0xAA-poisoned everywhere else after every call).
 */
export interface HgcSMAAEdgeDetectState {
  /** HGNode base subobject placeholder (+0x000..+0x197) — untouched by this unit. */
  _hgNode: unknown;

  /**
   * +0x198 — `float* params`, the 32-byte-aligned 0xE0-byte block the ctor allocates
   * @0x203209..0x2032b0. Loaded by `movq 0x198(%rdi),%rax` @0x20357e. Only lanes 0..3
   * (parameter slot 0, ctor-zeroed) are read by this unit; the rest belongs to the render
   * path and is not decoded here.
   *
   * Modelled as a Float32Array of at least 4 elements — the same treatment as
   * HgcAVATemporalAverage's `coefBuf` and HgcScaleBiasCrop's `params`.
   */
  params: Float32Array | null;
}

/**
 * `HgcSMAAEdgeDetect::GetParameter(int index, float* out)` — @Helium 0x203570
 *   __ZN17HgcSMAAEdgeDetect12GetParameterEiPf
 *
 * Copies parameter slot `index` into `out` and returns 0; returns -1, writing nothing, for
 * any index other than 0 (this node has a single slot). Full line-by-line decode, the
 * parameter-block evidence and the oracle results are in the file header above.
 *
 * @param self  %rdi — the HgcSMAAEdgeDetect instance.
 * @param index %esi — the parameter slot; only 0 is accepted.
 * @param out   %rdx — a caller-owned buffer of at least 4 float32 lanes, written ONLY on
 *                     success. It is not read, and on the failure path it is not touched.
 * @returns the int in %eax: 0 on success (@0x2035ab), -1 otherwise (@0x203570).
 */
export function HgcSMAAEdgeDetect_GetParameter(
  self: HgcSMAAEdgeDetectState,
  index: number,
  out: Float32Array,
): number {
  // @0x203575 testl %esi,%esi ; @0x203577 je 0x20357a — an equality test against ZERO, not a
  // range check. Every other index (negative, 1, 2, INT_MAX) takes the early
  // @0x203579 retq with %eax still holding the -1 loaded @0x203570, and writes nothing.
  if ((index | 0) !== 0) {
    return -1;
  }

  // @0x20357e movq 0x198(%rdi),%rax — the parameter block.
  const params = self.params;
  if (params === null) {
    // The disassembly does not null-check the pointer; it dereferences it immediately
    // @0x203585, so a null block faults inside this function. That is a fault, not a decoded
    // code path, and no value is defined for it, so the port refuses loudly rather than
    // inventing one. The index != 0 path above has already returned without any dereference,
    // exactly as @0x203579 does.
    throw new Error(
      "HgcSMAAEdgeDetect::GetParameter @Helium 0x203570: null parameter block "
        + "(this+0x198) — the binary would fault here",
    );
  }

  // @0x203585..@0x2035a6 — four independent `movss` load/store pairs, lane by lane. Not a
  // 16-byte move: the machine really does issue four 32-bit copies, and it writes NOTHING
  // beyond lane 3 (confirmed live — an 8-lane output buffer keeps its sentinel in lanes 4..7).
  out[0] = params[0]; // @0x203585 / @0x203589
  out[1] = params[1]; // @0x20358d / @0x203592
  out[2] = params[2]; // @0x203597 / @0x20359c
  out[3] = params[3]; // @0x2035a1 / @0x2035a6

  // @0x2035ab xorl %eax,%eax ; @0x2035ad popq %rbp ; @0x2035ae retq
  return 0;
}
