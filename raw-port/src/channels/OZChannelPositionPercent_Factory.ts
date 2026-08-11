// OZChannelPositionPercent_Factory — ProChannel factory singleton for
// OZChannelPositionPercent channels.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// ProChannel.framework/Versions/A/ProChannel (x86_64 slice; unadjusted VAs
// from `otool -tV`).
//
// This unit ports ONE method:
//
//   __ZN32OZChannelPositionPercent_Factory11getBundleIDEv
//     — OZChannelPositionPercent_Factory::getBundleID()   @ProChannel 0x8680
//
// This is a FRESH class (not previously on origin/main): the landed
// neighbours are the CHANNEL class `OZChannelPositionPercent.ts` and the 3D
// factory `OZChannelPositionPercent3D_Factory.ts`, both different C++ classes.
// Every other method of THIS factory (createInstance, description,
// manufacturer, version, the C2 ctor, …) is a separate ledger entry and must
// be ADDED to this file (additive extension only), never rewritten.
//
// Re-derive with:
//   raw-port/tools/disasm.sh --sym \
//     __ZN32OZChannelPositionPercent_Factory11getBundleIDEv ProChannel
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/ProChannel.__ZN32OZChannelPositionPercent_Factory11getBundleIDEv.s
// — 7 lines, the whole function)
// -----------------------------------------------------------------------------
//   __ZN32OZChannelPositionPercent_Factory11getBundleIDEv:
//     0x8680  pushq %rbp                     ; frame prologue
//     0x8681  movq  %rsp, %rbp
//     0x8684  leaq  0xb3d6d(%rip), %rax      ; rax = &"" — see the address
//                                            ;   arithmetic below
//     0x868b  popq  %rbp                     ; frame epilogue
//     0x868c  retq                           ; return rax (const char*)
//     0x868d  nop                            ; alignment pad — no effect
//
// FRONTIER CALLEES — none. No calls, no branches, no memory reads, no `this`
// access at all: the body ignores %rdi entirely (`depgraph.py deps
// __ZN32OZChannelPositionPercent_Factory11getBundleIDEv` lists nothing).
//
// -----------------------------------------------------------------------------
// THE LITERAL, RESOLVED
// -----------------------------------------------------------------------------
// RIP-relative addressing is relative to the address of the NEXT instruction:
//   RIP-after(0x8684) = 0x868b;  0x868b + 0xb3d6d = 0xbc3f8
// The byte at __cstring VA 0xbc3f8 in the x86_64 slice is 0x00, so the literal
// is the EMPTY STRING "" (length 0). Verified two independent ways:
//   1. Read directly out of the thin binary at that VA (the preceding bytes are
//      "…Channel\0Apple\0", i.e. this is the shared literal pool, and the next
//      literal after it is "Channel Gradient Desc").
//   2. otool -tV annotates the very same instruction `## literal pool for: ""`.
//   3. Cross-check: the LANDED sibling `OZChannelPositionPercent3D_Factory.ts`
//      records its own `getBundleID()` @0xa6a62 as resolving to __cstring VA
//      0xbc3f8 — the identical address. Two unrelated factories share the one
//      empty-string literal, which is exactly what a literal pool does.
//
// So this factory advertises NO bundle identifier. That is a real, deliberate
// value, not a missing decode: the sibling factory does the same, while its
// `manufacturer()` points at a genuinely non-empty literal ("Apple" @0xbc3f2)
// only 6 bytes earlier in the same pool — so a wrong pointer would have landed
// on visible text.
//
// NOTE ON THE RETURN TYPE. Unlike `description()` / `manufacturer()`, which
// wrap their literal in a PCString through an sret parameter, `getBundleID()`
// returns the RAW `const char*` in %rax — there is no PCString construction and
// no sret. The landed 3D sibling documents the same asymmetry. In TypeScript
// the pointer-to-immutable-literal is modelled as the string itself.
//
// -----------------------------------------------------------------------------
// ORACLE EVIDENCE (differential vs the LIVE Final Cut Pro binary)
// -----------------------------------------------------------------------------
// Checked against the real function: ProChannel is dlopen-able, so the harness
// runs under `arch -x86_64 /usr/bin/python3` (the port is transcribed from the
// x86_64 slice), resolves this LOCAL (`nm` type `t`) symbol as
// `nm -n -arch x86_64` vmaddr 0x8680 + the dyld image slide — NOT the bare
// `nm -n` fct/parity/local_call uses, which reports the ARM64 slice even from a
// Rosetta process — calls it, and reads the C string back through the returned
// pointer. RESULT: the returned pointer is exactly `image_base + 0xbc3f8`, and
// the bytes there are a single NUL: the live binary returns "" , matching this
// port. Called with several different `this` values (null, a noise buffer, a
// second noise buffer): the returned pointer was IDENTICAL every time, which
// confirms the decode that the body never touches %rdi.

/**
 * `getBundleID()` returns a raw `const char*` into the framework's literal
 * pool: `leaq 0xb3d6d(%rip), %rax` @ProChannel 0x8684, RIP-after 0x868b, so the
 * target is __cstring VA 0xbc3f8 — the **empty string ""**.
 *
 * Held as a named constant with its address so the provenance survives, in the
 * same shape the landed OZChannelPositionPercent3D_Factory uses for its own
 * (identical, and identically-addressed) bundle ID.
 */
const OZ_CHANNEL_POSITION_PERCENT_FACTORY_BUNDLE_ID = "";

/** The __cstring VA the literal above lives at. @ProChannel 0xbc3f8. */
const OZ_CHANNEL_POSITION_PERCENT_FACTORY_BUNDLE_ID_LIT_ADDR = 0xbc3f8;

/**
 * `OZChannelPositionPercent_Factory` — ProChannel factory singleton that mints
 * OZChannelPositionPercent channel instances.
 *
 * Only `getBundleID()` is decoded here; the factory's state (vptrs, the
 * embedded PCSingleton, the OZFactory UUID pair) is NOT modelled, because the
 * one ported method reads none of it. Fields will be added as the ctor and the
 * create/metadata methods are ported.
 */
export class OZChannelPositionPercent_Factory {
  /**
   * `OZChannelPositionPercent_Factory::getBundleID()` — @ProChannel 0x8680
   *   (__ZN32OZChannelPositionPercent_Factory11getBundleIDEv).
   *
   * Faithful line-for-line transcription of the 7-line disassembly quoted in
   * the file header:
   *
   *   @0x8684  leaq 0xb3d6d(%rip), %rax   ; rax = 0x868b + 0xb3d6d = 0xbc3f8, the
   *                                       ;   address of the empty-string literal
   *   @0x868c  retq                       ; return that const char*
   *
   * No callees, no branches, and no use of `this` — the body is a single
   * address computation, so the answer does not depend on the instance.
   *
   * Returns the empty string. See the file header for the three independent
   * confirmations of that literal and for why the raw `const char*` return (no
   * PCString wrapper) is the correct shape here.
   */
  getBundleID(): string {
    // @0x8684 leaq 0xb3d6d(%rip),%rax : &"" at __cstring VA
    //   OZ_CHANNEL_POSITION_PERCENT_FACTORY_BUNDLE_ID_LIT_ADDR (0xbc3f8).
    // @0x868c retq                    : return that pointer.
    void OZ_CHANNEL_POSITION_PERCENT_FACTORY_BUNDLE_ID_LIT_ADDR;
    return OZ_CHANNEL_POSITION_PERCENT_FACTORY_BUNDLE_ID;
  }
}
