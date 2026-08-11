// OZMaterialFresnelLayerSequenceFolder_Factory.ts — raw transcription of the
// Ozone class `OZMaterialFresnelLayerSequenceFolder_Factory`.
//
// The folder factory for Ozone's Fresnel material-layer sequence. ONE symbol is
// transcribed in this file — `version()`. Every other member of the class is a
// SEPARATE ledger unit and is NOT ported here; do not add them without their
// own disassembly and address citations. The neighbours, for orientation only
// (addresses from the cached x86_64 inventory
// `raw-port/army/inventory/Ozone.syms.txt`, each its own unit):
//   0x29940  __call_once_proxy for getInstance()'s lambda
//   0x29a00  ~OZMaterialFresnelLayerSequenceFolder_Factory()   [D1]
//   0x29a30  ~OZMaterialFresnelLayerSequenceFolder_Factory()   [D0]
//   0x29a60  create(PCString const&, unsigned int)
//   0x29ac0  createCopy(OZFactoryBase*, unsigned int)
//   0x29b20  createInstance(OZFactoryBase*)
//   0x29b30  description()
//   0x29b50  unlocalizedDescription()
//   0x29b70  manufacturer()
//   0x29b90  version()                      <-- ported here
//   0x29ba0  revision()
//   0x29bb0  getCategoryName()
//   0x29bd0  getEnglishCategoryName()
//   0x29bf0  getBundleID()
//   0x29c00  getIconNameInternal()
//   0x29c20  getIconNameBWInternal()
//   0x29c40  getIconIDInternal()
//   0x29c50  getLibraryIconNameInternal()
//   0x29c70  createChannel(PCString const&, unsigned int)
//   0x29cd0  createChannelCopy(OZChannelBase*, unsigned int)
//   0x29d30  createChannelInstance(OZChannelBase*)
//
// Provenance (Ozone framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Symbol ported in this file:
//   @0x29b90  OZMaterialFresnelLayerSequenceFolder_Factory::version()
//               __ZN44OZMaterialFresnelLayerSequenceFolder_Factory7versionEv
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym
//  __ZN44OZMaterialFresnelLayerSequenceFolder_Factory7versionEv Ozone`):
//   raw-port/re/disasm/__ZN44OZMaterialFresnelLayerSequenceFolder_Factory7versionEv.s
//   (7 lines)
//
// ---------------------------------------------------------------------------
// FULL DISASM — the whole function, every instruction
// ---------------------------------------------------------------------------
//   0x29b90  pushq %rbp             ; frame setup (no TS counterpart)
//   0x29b91  movq  %rsp, %rbp       ; frame setup (no TS counterpart)
//   0x29b94  movl  $0x1, %eax       ; the return value: the 32-bit immediate 1
//   0x29b99  popq  %rbp             ; frame teardown
//   0x29b9a  retq                   ; returns %eax
//   0x29b9b  nopl  (%rax,%rax)      ; alignment padding to the next function,
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
// the immediate neighbour `revision()` @0x29ba0, whose body is `xorl %eax,%eax`
// — a DIFFERENT constant (0), 16 bytes away, and its own ledger unit. That
// neighbour is why the oracle byte-checks the callee before trusting it.
//
// CALLEES: none. No in-scope call, no extern, no allocation, no indirect and no
// virtual dispatch —
// `depgraph.py deps __ZN44OZMaterialFresnelLayerSequenceFolder_Factory7versionEv`
// lists nothing.
//
// ---------------------------------------------------------------------------
// ORACLE — verified by CALLING the live function
// ---------------------------------------------------------------------------
// raw-port/re/oracle/OZMaterialFresnelLayerSequenceFolder_Factory_version_oracle.py
// The symbol is LOCAL (`nm` type `t`, not `T`), so dlsym cannot reach it; the
// harness goes through raw-port/re/oracle/ozone_loader.py, which preloads
// Ozone's `@rpath` chain depth-first (Ozone DOES load outside the app bundle;
// DYLD_* cannot help because /usr/bin/python3 is hardened and dyld strips those
// variables) and calls the function at `dyld slide + 0x29b90`, with the address
// taken from the cached x86_64 inventory because a bare `nm` answers from the
// ARM64 slice even under Rosetta and would silently call some other function.
// Run under `arch -x86_64 /usr/bin/python3`, so the process executes the same
// x86_64 slice this file was transcribed from.
//
// Results (2026-08-11):
//   * byte self-check PASS — the 11 bytes at slide+0x29b90 are
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
 * `OZMaterialFresnelLayerSequenceFolder_Factory` — the folder factory for
 * Ozone's Fresnel material-layer sequence.
 *
 * No instance state is modelled: the one transcribed method touches neither
 * `this` nor any global (see the file header).
 *
 * @Ozone 0x29b90
 */
export class OZMaterialFresnelLayerSequenceFolder_Factory {
  /**
   * `OZMaterialFresnelLayerSequenceFolder_Factory::version()` — @Ozone 0x29b90
   *   __ZN44OZMaterialFresnelLayerSequenceFolder_Factory7versionEv
   *
   * Returns the 32-bit immediate 1. Full transcription — every instruction, in
   * order:
   *
   *   0x29b90  pushq %rbp        ; frame setup (no TS counterpart)
   *   0x29b91  movq  %rsp, %rbp  ; frame setup (no TS counterpart)
   *   0x29b94  movl  $0x1, %eax  ; the returned value
   *   0x29b99  popq  %rbp        ; frame teardown
   *   0x29b9a  retq              ; returns %eax
   *
   * Decode notes:
   *   * `this` (%rdi) is never dereferenced, so the result cannot depend on
   *     instance state (confirmed live across 38 `this` values, including NULL
   *     and a poisoned arena).
   *   * the sibling `revision()` @0x29ba0 is a different constant (0, via
   *     `xorl %eax, %eax`) and a separate unit — not modelled here.
   *
   * @returns `1` — always.
   */
  version(): number {
    // @0x29b94 — movl $0x1, %eax : the immediate this function returns.
    return OZ_MATERIAL_FRESNEL_LAYER_SEQUENCE_FOLDER_FACTORY_VERSION;
  }
}

/**
 * The immediate `version()` @0x29b94 loads into %eax and returns: **1**, read
 * straight out of the instruction encoding (`b8 01 00 00 00`) and confirmed by
 * calling the live function.
 *
 * @Ozone 0x29b94
 */
const OZ_MATERIAL_FRESNEL_LAYER_SEQUENCE_FOLDER_FACTORY_VERSION = 1; // @Ozone 0x29b94
