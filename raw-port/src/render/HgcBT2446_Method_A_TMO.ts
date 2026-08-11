// HgcBT2446_Method_A_TMO — Helium's ITU-R BT.2446 Method A tone-mapping node.
// This commit ports its `GetDOD` (domain-of-definition) query.
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
// BINARY:    /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//            (x86_64 slice — every address below is an x86_64 offset)
// DECODE:    raw-port/re/disasm/Helium.__ZN22HgcBT2446_Method_A_TMO6GetDODEP10HGRendereri6HGRect.s
//
// This file ports ONLY the symbol listed below. The rest of the class — GetProgram @0x357130,
// InitProgramDescriptor @0x357160, shaderDescription @0x357380, BindTexture @0x3573d0, Bind
// @0x357440, RenderTile_AVX @0x357460, RenderTile @0x358300 — are separate ledger entries and are
// NOT ported here. In particular NOTHING about the tone-mapping maths is in this commit; per
// OPS_LOG, "this class already has a landed file" must never be read as "its AVX body is ported".
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN22HgcBT2446_Method_A_TMO6GetDODEP10HGRendereri6HGRect
//       — HgcBT2446_Method_A_TMO::GetDOD(HGRenderer*, int, HGRect) @Helium 0x359130
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
//   none. No `callq`, no stub, no indirect dispatch. The only external reference is the DATA
//   symbol `_HGRectNull`, already decoded and exported by raw-port/src/render/HGRect.ts
//   (@Helium 0x3d2284, 16 zero bytes = {x:0, y:0, right:0, bottom:0}).
//
// -----------------------------------------------------------------------------
// FULL DISASM — GetDOD @0x359130 (every instruction, in order)
// -----------------------------------------------------------------------------
//   0x359130  movq  %rcx, %rax                ; rax = r.lo  (the caller's rect, low qword)
//   0x359133  testl %edx, %edx                ; flags on inputIdx & inputIdx
//   0x359135  je    0x35914a                  ; inputIdx == 0 -> straight to the shared tail,
//                                             ;   leaving rax = r.lo and r8 = r.hi untouched
//   0x359137  pushq %rbp                      ; (the frame exists only on the non-zero path)
//   0x359138  movq  %rsp, %rbp
//   0x35913b  leaq  _HGRectNull(%rip), %rcx   ; @Helium 0x3d2284
//   0x359142  movq  (%rcx), %rax              ; rax = HGRectNull.lo
//   0x359145  movq  0x8(%rcx), %r8            ; r8  = HGRectNull.hi
//   0x359149  popq  %rbp
//   0x35914a  movq  %r8, %rdx                 ; the 16-byte return is (rax, rdx)
//   0x35914d  retq
//   0x35914e  nop                             ; padding — not executed
//
// DECODE NOTES
//  - SysV: %rdi = this, %rsi = HGRenderer*, %edx = inputIdx, and the 16-byte HGRect argument
//    arrives in the register PAIR %rcx:%r8 (an INTEGER-class aggregate of exactly two eightbytes).
//    The 16-byte return leaves in %rax:%rdx. That is why `movq %rcx, %rax` at the very top is the
//    whole "return the argument" path — the low half is moved into place before the branch and the
//    high half never moves out of %r8 until the shared tail.
//  - `testl %edx,%edx ; je` fires when inputIdx == 0, and the branch is to the TAIL, i.e. input 0
//    gets the caller's rect back unchanged; every other input index gets HGRectNull. Reading the
//    polarity backwards would invert the node's entire domain, and the oracle measures it.
//  - Neither `this` nor the HGRenderer* is dereferenced anywhere in the body — measured below by
//    passing poison for both.
//  - This is the same body shape as the landed HgcBT2100_HLG_OETF::GetDOD @0x3b0e90 (and its
//    GetROI twin @0x3b0eb0); the only differences are the address and which class owns it.

import { type HGRect, HGRectNull } from "./HGRect.js";

/**
 * `HgcBT2446_Method_A_TMO::GetDOD(HGRenderer*, int inputIdx, HGRect r)` @Helium 0x359130
 *   (__ZN22HgcBT2446_Method_A_TMO6GetDODEP10HGRendereri6HGRect)
 *
 * Full transcription of the 11-instruction body (see the FULL DISASM block in the file header):
 * input 0's domain of definition is the caller's rect, unchanged; any other input index has the
 * NULL rect. No callees, no state read, no allocation.
 *
 * DIFFERENTIAL against the live binary. The symbol is LOCAL (`t` in
 * raw-port/army/inventory/Helium.syms.txt), so dlsym cannot reach it; instead
 * raw-port/re/oracle/HgcBT2446_Method_A_TMO_GetDOD_oracle.py loads Helium under
 * `arch -x86_64 /usr/bin/python3`, measures the image slide from an exported symbol, verifies the
 * OPCODE BYTES at slide+0x359130 against the transcribed instructions (so the address arithmetic
 * is self-checking — per OPS_LOG a bare `nm` hands back arm64 addresses even under Rosetta), and
 * then calls it. It sweeps input indices — 0, ±1, 2, 3, INT_MIN, INT_MAX and random values — over
 * a corpus of rects including the null rect, the infinite rect and random corners, with `this` and
 * the HGRenderer* both set to poison so that any dereference of either would crash rather than
 * pass. See the commit message for the recorded run.
 *
 * @param _renderer  the HGRenderer* (%rsi) — never dereferenced.
 * @param inputIdx   the input index (%edx).
 * @param r          the caller's rect (%rcx:%r8).
 * @returns the domain of definition (%rax:%rdx).
 */
export function HgcBT2446_Method_A_TMO_GetDOD(
  _renderer: unknown,
  inputIdx: number,
  r: HGRect,
): HGRect {
  // @0x359130 — movq %rcx, %rax : the argument's low half is already the answer for input 0.
  // @0x359133/@0x359135 — testl %edx,%edx ; je 0x35914a : inputIdx == 0 keeps it.
  // @0x35913b..@0x359145 — otherwise load the two qwords of _HGRectNull @0x3d2284.
  // @0x35914a..@0x35914d — movq %r8, %rdx ; retq : the shared 16-byte return.
  return inputIdx === 0 ? r : HGRectNull;
}
