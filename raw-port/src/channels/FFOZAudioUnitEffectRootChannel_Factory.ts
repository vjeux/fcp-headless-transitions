// FFOZAudioUnitEffectRootChannel_Factory.ts — raw transcription of Flexo's
// `FFOZAudioUnitEffectRootChannel_Factory`.
//
// ONE symbol is transcribed in this file — `version()`. Every other member is a
// SEPARATE ledger unit and is NOT ported here; the class's other symbols, for
// orientation only (from raw-port/army/inventory/Flexo.syms.txt):
//   0x2187b0  the getInstance() std::call_once proxy
//   0x218870  ~FFOZAudioUnitEffectRootChannel_Factory()   [D1]
//   0x2188a0  ~FFOZAudioUnitEffectRootChannel_Factory()   [D0]
//   0x2188d0  create(PCString const&, unsigned int)
//   0x218940  createCopy(OZFactoryBase*, unsigned int)
//   0x2189b0  createInstance(OZFactoryBase*)
//   0x2189c0  description()
//   0x2189e0  unlocalizedDescription()
//
// Provenance (Flexo framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// Symbol ported in this file:
//   @0x218a20  FFOZAudioUnitEffectRootChannel_Factory::version()
//                __ZN38FFOZAudioUnitEffectRootChannel_Factory7versionEv
//     (`t` in the symbol table — internal linkage.)
//
// Source disassembly (re-derived with
// `raw-port/tools/disasm.sh --sym __ZN38FFOZAudioUnitEffectRootChannel_Factory7versionEv Flexo`):
//   raw-port/re/disasm/Flexo.__ZN38FFOZAudioUnitEffectRootChannel_Factory7versionEv.s (6 lines)
//
// ---------------------------------------------------------------------------
// FULL DISASM — the whole function
// ---------------------------------------------------------------------------
//   0x218a20  pushq %rbp                  ; frame setup (no TS counterpart)
//   0x218a21  movq  %rsp, %rbp
//   0x218a24  movl  $0x1, %eax            ; return 1
//   0x218a29  popq  %rbp
//   0x218a2a  retq
//   0x218a2b  nopl  (%rax,%rax)           ; padding, not executed
//
// A constant getter. `movl $0x1, %eax` writes the 32-bit register, which zeroes
// the upper half of %rax, so the value is exactly 1 whatever the declared return
// width is. There is no `(%rdi)` operand anywhere, so the result cannot depend on
// instance state — this file therefore models NO fields (PORTING_SPEC Rule 5).
// This is the same shape as the landed
// OZChannelPositionPercent3D_Factory::version() @ProChannel 0xa6a1e, whose
// sibling `revision()` returns 0 via `xorl %eax,%eax`; the two constants are how
// a factory declares its interface version, and both are ported as constants
// rather than invented enums.
//
// CALLEES: none — no callq, no extern, no indirect or virtual dispatch
// (`depgraph.py deps` lists nothing).
//
// ---------------------------------------------------------------------------
// ORACLE
// ---------------------------------------------------------------------------
// raw-port/re/oracle/FFOZAudioUnitEffectRootChannel_Factory_version_oracle.py
// calls the LIVE function. The symbol is LOCAL (`nm` type `t`), so dlsym cannot
// reach it; it is called at `dyld slide + 0x218a20` through ozone_loader.py,
// which loads FLEXO outside the app bundle by preloading its `@rpath` chain
// depth-first — the standing "Flexo cannot be dlopen'd" note is wrong, as
// OPS_LOG now records — and refuses to run outside an x86_64 process. Six calls
// with different `this` values, including NULL and 0x4141414141414141, all
// returned exactly 1 and all returned the SAME value, confirming the body reads
// no instance state.
// NEGATIVE CONTROLS (measured): a port returning 0 (the `revision()` constant)
// -> 6/6 wrong; a port returning -1 (the `getIconIDInternal` shape) -> 6/6 wrong.

/**
 * `version()` returns `1` — `movl $0x1, %eax` @Flexo 0x218a24.
 *
 * @const Flexo 0x218a24 (the immediate operand of the only instruction with an
 *        effect in the body)
 */
const FFOZ_AUDIO_UNIT_EFFECT_ROOT_CHANNEL_FACTORY_VERSION = 1; // @Flexo 0x218a24

/**
 * `FFOZAudioUnitEffectRootChannel_Factory` — Flexo's factory singleton for the
 * Ozone audio-unit-effect root channel.
 *
 * No instance state is modelled: the one transcribed method touches neither
 * `this` nor any global (see the file header).
 *
 * @Flexo 0x218a20
 */
export class FFOZAudioUnitEffectRootChannel_Factory {
  /**
   * `FFOZAudioUnitEffectRootChannel_Factory::version()` — @Flexo 0x218a20
   *   __ZN38FFOZAudioUnitEffectRootChannel_Factory7versionEv
   *
   * Returns the factory's interface version, the constant 1. Full
   * transcription — every instruction, in order:
   *
   *   0x218a20  pushq %rbp       ; frame setup (no TS counterpart)
   *   0x218a21  movq  %rsp, %rbp
   *   0x218a24  movl  $0x1, %eax ; the whole body: return 1
   *   0x218a29  popq  %rbp
   *   0x218a2a  retq
   *
   * Not a stub: the binary genuinely returns a constant here, and the live
   * function was called to confirm it (see the ORACLE note in the file header).
   *
   * @returns `1`, always.
   */
  version(): number {
    // @0x218a24 — movl $0x1, %eax.
    return FFOZ_AUDIO_UNIT_EFFECT_ROOT_CHANNEL_FACTORY_VERSION;
  }
}
