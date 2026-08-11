// OZLayeredMaterialSequenceFolder_Factory.ts — raw transcription of the
// Ozone class `OZLayeredMaterialSequenceFolder_Factory`.
//
// The folder factory for Ozone's LAYERED material sequence. ONE symbol is
// transcribed in this file — `version()`. Every other member of the class is a
// SEPARATE ledger unit and is NOT ported here; do not add them without their
// own disassembly and address citations. The neighbours, for orientation only
// (addresses from the cached x86_64 inventory
// `raw-port/army/inventory/Ozone.syms.txt`, each its own unit):
//   0x27f60  __call_once_proxy for getInstance()'s lambda
//   0x28020  ~OZLayeredMaterialSequenceFolder_Factory()   [D1]
//   0x28050  ~OZLayeredMaterialSequenceFolder_Factory()   [D0]
//   0x28080  create(PCString const&, unsigned int)
//   0x280e0  createCopy(OZFactoryBase*, unsigned int)
//   0x28140  createInstance(OZFactoryBase*)
//   0x28150  description()
//   0x28170  unlocalizedDescription()
//   0x28190  manufacturer()
//   0x281b0  version()                      <-- ported here
//   0x281c0  revision()
//   0x281d0  getCategoryName()
//   0x281f0  getEnglishCategoryName()
//   0x28210  getBundleID()
//   0x28220  getIconNameInternal()
//   0x28240  getIconNameBWInternal()
//   0x28260  getIconIDInternal()
//   0x28270  getLibraryIconNameInternal()
//   0x28290  createChannel(PCString const&, unsigned int)
//   0x282f0  createChannelCopy(OZChannelBase*, unsigned int)
//   0x28350  createChannelInstance(OZChannelBase*)
//   0x28360  thunk ~...() [Thn128 D1]      (0x28380 = [Thn128 D0])
//
// Provenance (Ozone framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Symbol ported in this file:
//   @0x281b0  OZLayeredMaterialSequenceFolder_Factory::version()
//               __ZN39OZLayeredMaterialSequenceFolder_Factory7versionEv
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym
//  __ZN39OZLayeredMaterialSequenceFolder_Factory7versionEv Ozone`):
//   raw-port/re/disasm/__ZN39OZLayeredMaterialSequenceFolder_Factory7versionEv.s
//   (7 lines)
//
// ---------------------------------------------------------------------------
// FULL DISASM — the whole function, every instruction
// ---------------------------------------------------------------------------
//   0x281b0  pushq %rbp             ; frame setup (no TS counterpart)
//   0x281b1  movq  %rsp, %rbp       ; frame setup (no TS counterpart)
//   0x281b4  movl  $0x1, %eax       ; the return value: the 32-bit immediate 1
//   0x281b9  popq  %rbp             ; frame teardown
//   0x281ba  retq                   ; returns %eax
//   0x281bb  nopl  (%rax,%rax)      ; alignment padding to the next function,
//                                   ; not executed
//
// `movl` (not `movq`) writes EAX and zero-extends into RAX, so the value is the
// 32-bit 1 whether the C++ declares `int` or `unsigned int` — the Itanium
// mangling carries no return type, and nothing in the body distinguishes them.
// Either way the observable result is 1.
//
// ---------------------------------------------------------------------------
// LAYOUT
// ---------------------------------------------------------------------------
// NONE is observable from this body. There is no `(%rdi)` memory operand
// anywhere in the five instructions, so the function reads no field of `this`
// and writes nothing. This file therefore models NO instance state; the real
// layout of the factory must come from the ctor / `getInstance` units when
// those are ported. Confirmed live, not just by reading: the oracle below calls
// the function with 38 different `this` pointers — NULL, poison, and every
// 8-byte offset into a 256-byte 0xCD-filled arena — and the arena is
// byte-identical afterwards.
//
// ---------------------------------------------------------------------------
// A CONSTANT IS THE ANSWER, NOT A GAP
// ---------------------------------------------------------------------------
// This override genuinely returns the immediate 1; it is not an undecoded stub
// and must not be modelled as a throw. Landed precedent of exactly this shape:
// `OZChannelPositionPercent3D_Factory::version()` @ProChannel 0xa6a1e, also
// `movl $0x1, %eax`, ported as a plain constant return. Note the contrast with
// the immediate neighbour `revision()` @0x281c0, whose body is `xorl %eax,%eax`
// — a DIFFERENT constant (0), 16 bytes away, and its own ledger unit. That
// neighbour is why the oracle byte-checks the callee before trusting it.
//
// CALLEES: none. No in-scope call, no extern, no allocation, no indirect and no
// virtual dispatch —
// `depgraph.py deps __ZN39OZLayeredMaterialSequenceFolder_Factory7versionEv`
// lists nothing.
//
// ---------------------------------------------------------------------------
// ORACLE — verified by CALLING the live function
// ---------------------------------------------------------------------------
// raw-port/re/oracle/OZLayeredMaterialSequenceFolder_Factory_version_oracle.py
// The symbol is LOCAL (`nm` type `t`, not `T`), so dlsym cannot reach it; the
// harness goes through raw-port/re/oracle/ozone_loader.py, which preloads
// Ozone's `@rpath` chain depth-first (Ozone DOES load outside the app bundle;
// DYLD_* cannot help because /usr/bin/python3 is hardened and dyld strips those
// variables) and calls the function at `dyld slide + 0x281b0`, with the address
// taken from the cached x86_64 inventory because a bare `nm` answers from the
// ARM64 slice even under Rosetta and would silently call some other function.
// Run under `arch -x86_64 /usr/bin/python3`, so the process executes the same
// x86_64 slice this file was transcribed from.
//
// Results (2026-08-11):
//   * byte self-check PASS — the 11 bytes at slide+0x281b0 are
//     `55 48 89 e5 b8 01 00 00 00 5d c3`, exactly the encoding of the five
//     instructions above. This is what proves the call landed on the
//     transcribed function and not on a neighbour.
//   * 38 `this` values, 38 agreements, 0 divergences; live return is 1 every
//     time.
//   * 0 of the 256 poison bytes modified — the body writes no memory.
//   * negative controls (deliberately wrong models, each of which MUST be
//     caught, or the harness is blind): returns-0 38/38, returns-2 38/38,
//     returns-(-1) 38/38, returns-low-byte-of-`this` 37/38. The one miss in the
//     last control is not a harness hole: at `this == 1` that mutant happens to
//     compute 1, which is the correct answer — a single equivalent point, and
//     the other 37 cases still kill it.

/**
 * `OZLayeredMaterialSequenceFolder_Factory` — the folder factory for
 * Ozone's layered material sequence.
 *
 * No instance state is modelled: the one transcribed method touches neither
 * `this` nor any global (see the file header).
 *
 * @Ozone 0x281b0
 */
export class OZLayeredMaterialSequenceFolder_Factory {
  /**
   * `OZLayeredMaterialSequenceFolder_Factory::version()` — @Ozone 0x281b0
   *   __ZN39OZLayeredMaterialSequenceFolder_Factory7versionEv
   *
   * Returns the 32-bit immediate 1. Full transcription — every instruction, in
   * order:
   *
   *   0x281b0  pushq %rbp        ; frame setup (no TS counterpart)
   *   0x281b1  movq  %rsp, %rbp  ; frame setup (no TS counterpart)
   *   0x281b4  movl  $0x1, %eax  ; the returned value
   *   0x281b9  popq  %rbp        ; frame teardown
   *   0x281ba  retq              ; returns %eax
   *
   * Decode notes:
   *   * `this` (%rdi) is never dereferenced, so the result cannot depend on
   *     instance state (confirmed live across 38 `this` values, including NULL
   *     and a poisoned arena).
   *   * the sibling `revision()` @0x281c0 is a different constant (0, via
   *     `xorl %eax, %eax`) and a separate unit — not modelled here.
   *
   * @returns `1` — always.
   */
  version(): number {
    // @0x281b4 — movl $0x1, %eax : the immediate this function returns.
    return OZ_LAYERED_MATERIAL_SEQUENCE_FOLDER_FACTORY_VERSION;
  }
}

/**
 * The immediate `version()` @0x281b4 loads into %eax and returns: **1**, read
 * straight out of the instruction encoding (`b8 01 00 00 00`) and confirmed by
 * calling the live function.
 *
 * @Ozone 0x281b4
 */
const OZ_LAYERED_MATERIAL_SEQUENCE_FOLDER_FACTORY_VERSION = 1; // @Ozone 0x281b4
