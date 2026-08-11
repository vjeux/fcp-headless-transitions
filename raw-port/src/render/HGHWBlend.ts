// HGHWBlend.ts — raw transcription of the Helium class `HGHWBlend`.
//
// ONE symbol is transcribed in this file — `AVXEnabled()`. Every other member
// of the class is a SEPARATE ledger unit and is NOT ported here; do not add
// them without their own disassembly and address citations. The neighbours, for
// orientation only (addresses from the cached x86_64 inventory
// `raw-port/army/inventory/Helium.syms.txt`, each its own unit):
//   0x1a92e0  HGHWBlend()                                        [C2]
//   0x1a93c0  HGHWBlend()                                        [C1]
//   0x1a94a0  HGHWBlend(HGHWBlend::AdaptationMode)               [C2]
//   0x1a9610  ~HGHWBlend()                                       [D2]
//   0x1a9900  GetBlendModeLabel(unsigned int)
//   0x1a9930  SetParameter(int, float, float, float, float)
//   0x1a9a30  SetState(HGRenderer*, int)
//   0x2a0580  AVXEnabled()                       <-- ported here
//   0x2a0590  HGHWBlend::State::State()          [C2 — a nested class; it would
//             be its own file `HGHWBlend__State.ts`, per the Outer__Inner rule]
//
// Provenance (Helium framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// Symbol ported in this file:
//   @0x2a0580  HGHWBlend::AVXEnabled()   __ZN9HGHWBlend10AVXEnabledEv
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym __ZN9HGHWBlend10AVXEnabledEv Helium`):
//   raw-port/re/disasm/Helium.__ZN9HGHWBlend10AVXEnabledEv.s (7 lines)
//
// ---------------------------------------------------------------------------
// FULL DISASM — the whole function, every instruction
// ---------------------------------------------------------------------------
//   0x2a0580  pushq %rbp           ; frame setup (no TS counterpart)
//   0x2a0581  movq  %rsp, %rbp     ; frame setup (no TS counterpart)
//   0x2a0584  movb  $0x1, %al      ; the return value: the bool `true` in AL
//   0x2a0586  popq  %rbp           ; frame teardown
//   0x2a0587  retq                 ; returns AL
//   0x2a0588  nopl  (%rax,%rax)    ; alignment padding, not executed
//
// `movb` writes only AL, which is where the Itanium ABI returns a `bool`; the
// upper bits of RAX are undefined and a caller may not read them. That is why
// this port returns a boolean and not a number.
//
// ---------------------------------------------------------------------------
// THIS IS A COMPILE-TIME CONSTANT, NOT A CPU PROBE — AND THAT IS THE FINDING
// ---------------------------------------------------------------------------
// The name invites the assumption that `AVXEnabled()` asks the processor
// whether AVX is available. It does not. There is no `cpuid`, no `xgetbv`, no
// load of a cached feature word, and no branch — the eight bytes of the body
// are `55 48 89 e5 b0 01 5d c3` and nothing else. Apple compiled this
// build with AVX unconditionally on, so the predicate is a constant `true` and
// every caller's AVX path is always selected.
//
// This matters for two reasons beyond this one function:
//   * a port that "helpfully" modelled a feature query here would be a
//     REWRITE, not a transcription, and would introduce a runtime-dependent
//     answer where the binary has a constant;
//   * the standing OPS_LOG warning that AVX FEATURE BITS LIE UNDER ROSETTA
//     (probe by executing, never by inferring from `sysctl`) is about kernels
//     whose behavior varies with those bits. It does not apply to this body,
//     and the oracle demonstrates that rather than assuming it: it asserts the
//     absence of the `cpuid` (`0f a2`) and `xgetbv` (`0f 01 d0`) encodings in
//     the function's own bytes, so there is nothing here for a translated
//     process to misreport.
//
// ---------------------------------------------------------------------------
// LAYOUT
// ---------------------------------------------------------------------------
// NONE is observable. There is no `(%rdi)` memory operand, so the function
// reads no field of `this` and no global. This file therefore models NO
// instance state; the real layout must come from the ctor units @0x1a92e0 /
// @0x1a94a0 when those are ported. Confirmed live: 36 different `this`
// pointers, including NULL and every 16-byte step through a poisoned 512-byte
// arena, all return 1, and the arena is byte-identical afterwards.
//
// CALLEES: none — `depgraph.py deps __ZN9HGHWBlend10AVXEnabledEv` lists nothing
// (0 in-scope callees, 0 externs, 0 indirect).
//
// ---------------------------------------------------------------------------
// ORACLE — verified by CALLING the live function
// ---------------------------------------------------------------------------
// raw-port/re/oracle/HGHWBlend_AVXEnabled_oracle.py, run under
// `arch -x86_64 /usr/bin/python3` so the process executes the same x86_64 slice
// this file was transcribed from. Results (2026-08-11):
//   * dlsym cross-check PASS — the symbol is exported (`nm` `T`); dlsym and
//     `slide + 0x2a0580` resolve to the same address, so the call cannot have
//     landed on the neighbouring `HGHWBlend::State::State()` 16 bytes later.
//   * byte self-check PASS — `55 48 89 e5 b0 01 5d c3`, and neither `cpuid`
//     nor `xgetbv` appears in it.
//   * 36 `this` values: 36 agreements, 0 divergences; AL is 1 every time.
//   * 0 of 512 poison bytes modified — the body touches no memory.
//   * negative controls: returns-0 36/36, returns-2 36/36, returns-0xff 36/36,
//     reads-a-flag-from-`this` 33/36. The three misses in the last one are the
//     `this` values whose low bit is already 1 (0x41…41, 1, 0xff…ff), where
//     that mutant coincidentally computes the right answer — equivalent points,
//     not a blind harness; the other 33 kill it.

/**
 * `HGHWBlend` — Helium's hardware blend node.
 *
 * No instance state is modelled: the one transcribed method touches neither
 * `this` nor any global (see the file header).
 *
 * @Helium 0x2a0580
 */
export class HGHWBlend {
  /**
   * `HGHWBlend::AVXEnabled()` — @Helium 0x2a0580
   *   __ZN9HGHWBlend10AVXEnabledEv
   *
   * Returns `true`, unconditionally. Full transcription — every instruction,
   * in order:
   *
   *   0x2a0580  pushq %rbp        ; frame setup (no TS counterpart)
   *   0x2a0581  movq  %rsp, %rbp  ; frame setup (no TS counterpart)
   *   0x2a0584  movb  $0x1, %al   ; the returned bool
   *   0x2a0586  popq  %rbp        ; frame teardown
   *   0x2a0587  retq              ; returns AL
   *
   * Decode notes:
   *   * `movb $0x1, %al` sets ONLY AL, the ABI's bool return register — hence
   *     `boolean` here rather than a number (landed precedent for the same
   *     idiom: `FFLockBase` @0x12b91ba, `HGColorConform` @0x1ccb60).
   *   * there is no `cpuid`/`xgetbv` and no load anywhere in the body, so this
   *     is a compile-time constant and NOT a runtime CPU-feature query — see
   *     the file header.
   *   * `this` is never dereferenced (confirmed live across 36 `this` values).
   *
   * @returns `true` — always.
   */
  AVXEnabled(): boolean {
    // @Helium 0x2a0584 — movb $0x1, %al : the constant this function returns.
    return HGHWBLEND_AVX_ENABLED;
  }
}

/**
 * The immediate `AVXEnabled()` @0x2a0584 loads into AL: **1**, i.e. `true`,
 * read straight out of the instruction encoding (`b0 01`) and confirmed by
 * calling the live function.
 *
 * @Helium 0x2a0584
 */
const HGHWBLEND_AVX_ENABLED = true; // @Helium 0x2a0584
