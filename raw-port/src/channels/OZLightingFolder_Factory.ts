// OZLightingFolder_Factory.ts — raw transcription of Ozone `OZLightingFolder_Factory`.
//
// The folder factory for Ozone's lighting group. ONE symbol is transcribed in
// this file — `getBundleID()`. Every other member of the class is a SEPARATE
// ledger unit and is NOT ported here; do not add them without their own
// disassembly and address citations. The neighbours, for orientation only
// (addresses from `nm -n -arch x86_64`, each its own unit):
//   0x4b26f0  createCopy(OZFactoryBase*, unsigned int)
//   0x4b2750  createInstance(OZFactoryBase*)
//   0x4b2760  description()
//   0x4b27a0  manufacturer()
//   0x4b27e0  getCategoryName()
//   0x4b2870  getIconIDInternal()
//   0x4b28a0  createChannel(PCString const&, unsigned int)
//   0x4b2900  createChannelCopy(OZChannelBase*, unsigned int)
//
// Provenance (Ozone framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Symbol ported in this file:
//   @0x4b2820  OZLightingFolder_Factory::getBundleID()
//                __ZN24OZLightingFolder_Factory11getBundleIDEv
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym __ZN24OZLightingFolder_Factory11getBundleIDEv Ozone`):
//   raw-port/re/disasm/__ZN24OZLightingFolder_Factory11getBundleIDEv.s (7 lines)
//
// ---------------------------------------------------------------------------
// FULL DISASM — the whole function
// ---------------------------------------------------------------------------
//   0x4b2820  pushq %rbp                    ; frame setup (no TS counterpart)
//   0x4b2821  movq  %rsp, %rbp              ; frame setup (no TS counterpart)
//   0x4b2824  leaq  0x33475d(%rip), %rax    ## literal pool for: ""
//   0x4b282b  popq  %rbp                    ; frame teardown
//   0x4b282c  retq                          ; returns the pointer in %rax
//   0x4b282d  nopl  (%rax)                  ; alignment padding, not executed
//
// The RIP-relative target is computed from the address of the NEXT instruction:
// 0x4b282b + 0x33475d = 0x7e6f88, which lands inside __TEXT,__cstring
// (VA 0x7c62e0, size 0x39f61). The byte at 0x7e6f88 is 0x00 — read straight out
// of the Mach-O — so the literal is the EMPTY string, matching otool's own `""`
// annotation. For context, that NUL sits in the alignment padding between the
// literals "multiple_materials" and "Woods_EnvMapIcon".
//
// ---------------------------------------------------------------------------
// LAYOUT
// ---------------------------------------------------------------------------
// NONE is observable from this body: there is no `(%rdi)` memory operand
// anywhere, so it reads no field of `this`. This file therefore models NO
// instance state — the factory's real layout must come from the ctor /
// `getInstance` units when those are ported.
//
// ---------------------------------------------------------------------------
// THE EMPTY STRING IS THE ANSWER, NOT A GAP
// ---------------------------------------------------------------------------
// This override genuinely returns a pointer to an empty C string; it is not an
// undecoded stub and must not be modelled as a throw. The landed
// `OZChannelPositionPercent3D_Factory::getBundleID()` @ProChannel 0xa6a62 is the
// same shape (`leaq` of that framework's own empty literal at VA 0xbc3f8) and is
// ported as a plain empty-string return — this file follows that precedent.
// Note the contrast with the sibling `getCategoryName` / `getIconNameInternal`
// family, which return a PCString by sret; `getBundleID` hands back the RAW
// `const char*` with no wrapper, so the TS returns a bare string.
//
// CALLEES: none. No in-scope call, no extern, no allocation, no indirect and no
// virtual dispatch — `depgraph.py deps __ZN24OZLightingFolder_Factory11getBundleIDEv`
// lists nothing.
//
// ---------------------------------------------------------------------------
// ORACLE
// ---------------------------------------------------------------------------
// Verified by CALLING the live function: raw-port/re/oracle/
// OZLightingFolder_Factory_getBundleID_oracle.py. The symbol is LOCAL (`nm` type
// `t`, not `T`), so dlsym cannot reach it; the harness loads Ozone outside the
// app bundle through the new reusable raw-port/re/oracle/ozone_loader.py — which
// preloads the `@rpath` chain depth-first, the only thing that ever blocked
// Ozone (DYLD_* variables cannot work: /usr/bin/python3 is hardened and dyld
// strips them) — and calls the function at `dyld slide + 0x4b2820`, with the
// address taken from `nm -n -arch x86_64` because a bare `nm` answers from the
// ARM64 slice even under Rosetta and would silently call some other function.
// Results: the returned pointer minus the slide is 0x7e6f88 on every call —
// i.e. the live function really does hand back the literal this port's `leaq`
// arithmetic identified, which is a stronger claim than "the string looks empty"
// — the bytes there are `b''`, and six different `this` values (including NULL
// and 0x4141414141414141) all return the identical pointer, confirming the body
// reads no instance state.

/**
 * `OZLightingFolder_Factory` — the folder factory for Ozone's lighting group.
 *
 * No instance state is modelled: the one transcribed method touches neither
 * `this` nor any global (see the file header).
 *
 * @Ozone 0x4b2820
 */
export class OZLightingFolder_Factory {
  /**
   * `OZLightingFolder_Factory::getBundleID()` — @Ozone 0x4b2820
   *   __ZN24OZLightingFolder_Factory11getBundleIDEv
   *
   * Returns the raw `const char*` at __cstring VA 0x7e6f88, which is the EMPTY
   * string. Full transcription — every instruction, in order:
   *
   *   0x4b2820  pushq %rbp                 ; frame setup (no TS counterpart)
   *   0x4b2821  movq  %rsp, %rbp           ; frame setup (no TS counterpart)
   *   0x4b2824  leaq  0x33475d(%rip), %rax ; %rax = 0x4b282b + 0x33475d = 0x7e6f88
   *                                        ; = const char *"" (byte 0x00 in
   *                                        ; __TEXT,__cstring)
   *   0x4b282b  popq  %rbp                 ; frame teardown
   *   0x4b282c  retq                       ; returns %rax
   *
   * Decode notes:
   *   * RIP-relative displacements are measured from the NEXT instruction, so
   *     the base is 0x4b282b (not 0x4b2824). Getting that wrong by the 7-byte
   *     instruction length would name a different literal.
   *   * the returned pointer is a valid pointer TO an empty string, not NULL —
   *     modelling it as `null` would be a different value (measured live: the
   *     pointer is always slide + 0x7e6f88, never 0).
   *   * `this` is never dereferenced, so the result cannot depend on instance
   *     state (confirmed live across six `this` values).
   *
   * @returns `''` — always.
   */
  getBundleID(): string {
    // @0x4b2824 — leaq 0x33475d(%rip), %rax : the empty literal at VA 0x7e6f88.
    return OZ_LIGHTING_FOLDER_FACTORY_BUNDLE_ID;
  }
}

/**
 * The `const char*` literal `getBundleID()` @0x4b2824 returns: the empty string
 * stored at __TEXT,__cstring VA **0x7e6f88** in Ozone (a single 0x00 byte, read
 * directly out of the Mach-O and confirmed through the live pointer).
 *
 * @Ozone 0x7e6f88
 */
const OZ_LIGHTING_FOLDER_FACTORY_BUNDLE_ID = ''; // @Ozone 0x7e6f88
