// MinMax__MMNode_Mode1_Axis0.ts — raw transcription of Helium
// `MinMax::MMNode<(MinMax::Mode)1, (MinMax::Axis)0>`.
//
// One instantiation of Helium's MinMax reduction node template. The template
// has two non-type parameters and Helium emits all FOUR combinations as
// separate classes with separate addresses:
//   MMNode<Mode 0, Axis 0>  ~MMNode @0x2332c0 ... InitProgramDescriptor @0x233530
//   MMNode<Mode 1, Axis 0>  ~MMNode @0x233610 ... InitProgramDescriptor @0x233880  <- this file
//   MMNode<Mode 0, Axis 1>  ~MMNode @0x233960 ... InitProgramDescriptor @0x233bd0-ish
//   MMNode<Mode 1, Axis 1>  (same shape)
// Each instantiation is its OWN ledger class, so each gets its own file; this
// one is Mode 1 / Axis 0.
//
// FILE NAME: the namespace separator is the double underscore per
// PORTING_SPEC.md (`MinMax::MMNode` -> `MinMax__MMNode`), and the template
// arguments follow with single underscores, matching the landed instantiation
// files `PCMatrix44Tmpl_double.ts`, `HGArray_float_vector4_HGFormat28.ts` and
// `std__tuple_less_4_CGColorSpace_AlphaFormat.ts`.
//
// Provenance (Helium framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// Symbol ported in this file — ONE method:
//   @0x233880  MinMax::MMNode<(MinMax::Mode)1, (MinMax::Axis)0>
//                ::InitProgramDescriptor(HGProgramDescriptor*) const
//              __ZNK6MinMax6MMNodeILNS_4ModeE1ELNS_4AxisE0EE21InitProgramDescriptorEP19HGProgramDescriptor
//
// Source disassembly (re-derived from the binary in this worktree with
// `raw-port/tools/disasm.sh --sym
//  __ZNK6MinMax6MMNodeILNS_4ModeE1ELNS_4AxisE0EE21InitProgramDescriptorEP19HGProgramDescriptor
//  Helium`):
//   raw-port/re/disasm/Helium.__ZNK6MinMax6MMNodeILNS_4ModeE1ELNS_4AxisE0EE21InitProgramDescriptorEP19HGProgramDescriptor.s
//   (6 lines)
//
// Every OTHER member of THIS instantiation is a SEPARATE ledger unit and is NOT
// ported here: label_A @0x232900, the two dtors @0x233610/@0x233620,
// SetParameter @0x233640, RenderTile @0x233680, GetProgram @0x2337e0,
// BindTexture @0x233840, GetOutput @0x233890, GetDOD @0x2338c0, GetROI
// @0x233910.
//
// CALLEES: none. No in-scope call, no extern, no virtual and no indirect
// dispatch (`depgraph.py deps` lists nothing for this symbol).

import type { HGProgramDescriptor } from "./HGProgramDescriptor.js";

/**
 * `MinMax::MMNode<(MinMax::Mode)1, (MinMax::Axis)0>` — Helium's MinMax
 * reduction node, Mode 1 / Axis 0 instantiation.
 *
 * No fields are declared: the one method ported here never reads `this` (see
 * below). Units that port members which DO touch the object will add the
 * layout, ADD-only.
 *
 * @Helium 0x233880
 */
export class MinMax__MMNode_Mode1_Axis0 {
  /**
   * `MinMax::MMNode<(MinMax::Mode)1, (MinMax::Axis)0>::InitProgramDescriptor(HGProgramDescriptor*) const`
   * @Helium 0x233880.
   *
   * Faithful transcription of the 6-line body, quoted in full:
   *
   *   0x233880  pushq %rbp                ; frame prologue
   *   0x233881  movq  %rsp, %rbp
   *   0x233884  popq  %rbp                ; frame epilogue
   *   0x233885  retq
   *   0x233886  nopw  %cs:(%rax,%rax)     ; padding to the next 0x10 boundary —
   *                                       ;   not executed
   *
   * That is the ENTIRE function: set up a frame, tear it down, return. Three
   * facts, each of which the port must preserve rather than improve upon:
   *
   *   1. `this` (%rdi) is never read — no field access, so no class layout.
   *   2. `descriptor` (%rsi) is never dereferenced and never written. The
   *      descriptor is accepted and left exactly as the caller passed it; a
   *      port that "initialised" anything would be inventing work.
   *   3. There is NO `xorl %eax, %eax` and no other write to the return
   *      register, which is what a `void` return looks like. (Contrast the
   *      FFOZNullCurve null bodies, which DO zero %eax and are therefore typed
   *      as returning 0.)
   *
   * This instantiation simply has nothing to add to the program descriptor —
   * the base class's setup is sufficient for Mode 1 / Axis 0.
   *
   * DEPENDENCIES: none in-scope; no extern.
   */
  InitProgramDescriptor(
    _descriptor: HGProgramDescriptor /* never dereferenced, never written */,
  ): void {
    // @0x233880..@0x233885 — prologue, epilogue, return. No body.
  }
}
