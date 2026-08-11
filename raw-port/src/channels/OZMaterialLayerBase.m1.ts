// OZMaterialLayerBase.m1.ts — Ozone.framework, chunk 1 (methods 20..39 of 47).
//
// The class is ported in CHUNKS on main — `OZMaterialLayerBase.m0.ts` holds
// methods 0..19 and `OZMaterialLayerBase.m2.ts` holds 40..47 — so this file
// opens the missing middle chunk and follows m0's shape exactly: free functions
// named `OZMaterialLayerBase_<method>` taking the shared
// `OZMaterialLayerBaseState` that m0 declares. It currently holds the ONE
// method claimed so far; the rest of the 20..39 range will be ADDED here as
// those ledger entries are claimed. ADD-ONLY.
//
// Framework: /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//   Versions/A/Ozone (x86_64 slice).
//
// Symbol ported in this file — ONE method:
//   @0x4ac050  OZMaterialLayerBase::layerUIParameterChanged()
//              __ZN19OZMaterialLayerBase23layerUIParameterChangedEv
//
// Source disassembly (re-derived from the binary in this worktree with
// `raw-port/tools/disasm.sh --sym __ZN19OZMaterialLayerBase23layerUIParameterChangedEv Ozone`;
// note disasm.sh writes Ozone symbols WITHOUT a framework prefix, by design):
//   raw-port/re/disasm/__ZN19OZMaterialLayerBase23layerUIParameterChangedEv.s   (6 lines)
//
// ---------------------------------------------------------------------------
// FULL DISASM — layerUIParameterChanged @0x4ac050
// ---------------------------------------------------------------------------
//   0x4ac050  pushq %rbp                       ; frame prologue
//   0x4ac051  movq  %rsp, %rbp
//   0x4ac054  popq  %rbp                       ; epilogue
//   0x4ac055  retq
//   0x4ac056  nopw  %cs:(%rax,%rax)            ; padding — not executed
//
// That is the WHOLE function: six lines, no load, no store, no call, no return
// value. It is the base class's do-nothing default for a UI notification hook —
// the same shape as the empty defaults already landed in chunk m0
// (checkDeprecatedChannels @0x8e950, updateLocalTransformVisibility @0x8e970,
// setTransformValuesAsDefaults @0x8e980, ...), which this file matches down to
// the `/* empty per disasm */` marker. A subclass override is where the work
// happens; each override is its own symbol and its own ledger entry.
//
// FRONTIER CALLEES: none.
//
// ---------------------------------------------------------------------------
// ORACLE — an empty body is exactly where "no-op" and "not ported" look alike,
// so it is proved positively rather than asserted:
// raw-port/re/oracle/OZMaterialLayerBase_layerUIParameterChanged_oracle.py runs
// under `arch -x86_64 /usr/bin/python3`, dlopens Ozone through the depth-first
// @rpath preload (OPS_LOG 2026-08-10), and
//   * checks the bytes AT the entry point are exactly `55 48 89 e5 5d c3` —
//     push rbp / mov rsp,rbp / pop rbp / ret and nothing else, which is what
//     rules out "the real body lives elsewhere" and, together with the arch
//     assert, rules out reading the wrong slice;
//   * calls it 600 times on a 0x400-byte object poisoned with 0xAA, 0x00, 0xFF
//     and 0x5A, and confirms NOT ONE BYTE of the object changes;
//   * runs a SENSITIVITY CONTROL — a symbol whose whole job is a store
//     (HGRenderJob::SetUserTag @Helium 0x54650) measured the same way DID change
//     its poisoned object — so "nothing changed" is a measurement, not a blind
//     harness.
// Result: 600 cases, 0 divergences, control sensitive.

import type { OZMaterialLayerBaseState } from "./OZMaterialLayerBase.m0.js";

/**
 * `OZMaterialLayerBase::layerUIParameterChanged()` — @Ozone 0x4ac050
 *   (__ZN19OZMaterialLayerBase23layerUIParameterChangedEv)
 *
 * The base class's empty default for the "a layer UI parameter changed"
 * notification. Disasm: `pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq` —
 * an empty body, verified byte-for-byte and by 600 live calls that leave a
 * poisoned receiver untouched (see the file header).
 *
 * @param _self the receiver (%rdi) — never read by this body.
 */
export function OZMaterialLayerBase_layerUIParameterChanged(
  _self: OZMaterialLayerBaseState,
): void {
  /* empty per disasm — @0x4ac050..0x4ac055 is prologue + epilogue only */
}
