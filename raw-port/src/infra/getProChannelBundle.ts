// getProChannelBundle — ProChannel free function.
//
// @ProChannel /Applications/Final Cut Pro.app/Contents/Frameworks/
//             ProChannel.framework/Versions/A/ProChannel
// @0xa9ee4    getProChannelBundle() -> CFBundleRef
//
// DECODE: raw-port/re/disasm/ProChannel.__Z19getProChannelBundlev.s
//
// FULL DISASM (12 instructions; a function-local-static bundle cache):
//   0xa9ee4  movq  __ZZ19getProChannelBundlevE7sBundle(%rip), %rax
//                                       ; rax = sBundle (function-local static)
//   0xa9eeb  testq %rax, %rax           ; is sBundle already resolved?
//   0xa9eee  je    0xa9ef1              ; no → fall through to slow path
//   0xa9ef0  retq                       ; yes → return cached rax
//   0xa9ef1  pushq %rbp                 ; slow path prologue
//   0xa9ef2  movq  %rsp, %rbp
//   0xa9ef5  leaq  0x3c2d4(%rip), %rdi  ; rdi = &@"com.apple.prochannel.framework"
//                                       ; CFString literal @ProChannel 0xe61d0
//                                       ; (RIP-after 0xa9efc + 0x3c2d4 = 0xe61d0;
//                                       ;  __DATA_CONST/__cfstring; the C-string
//                                       ;  contents "com.apple.prochannel.framework"
//                                       ;  are the ONLY match in `strings ProChannel`
//                                       ;  for the CFBundleGetBundleWithIdentifier
//                                       ;  pattern, and match the framework's own id).
//   0xa9efc  callq _CFBundleGetBundleWithIdentifier
//                                       ; CoreFoundation extern stub @0xaca4a.
//                                       ; Signature: CFBundleRef(CFStringRef ident).
//                                       ; Returns the CFBundleRef whose identifier
//                                       ; matches, or NULL if not yet loaded.
//                                       ; (No retain — this is a "Get" API.)
//   0xa9f01  movq  %rax, __ZZ19getProChannelBundlevE7sBundle(%rip)
//                                       ; cache the result (even NULL) into sBundle
//                                       ; — the null-check @0xa9eeb re-triggers the
//                                       ;   slow path on subsequent calls only if
//                                       ;   the first lookup returned NULL, which
//                                       ;   handles the "framework not yet loaded"
//                                       ;   race window at process startup.
//   0xa9f08  popq  %rbp
//   0xa9f09  retq                       ; return rax = the (freshly cached) bundle
//
// SEMANTIC READING: standard "resolve-once framework self-bundle" helper. Returns
// the CFBundleRef for the currently-loaded ProChannel.framework, caching it in a
// static so subsequent calls are a single load-test-return.
//
// FRONTIER EXTERN (TRUE out-of-scope):
//   _CFBundleGetBundleWithIdentifier — CoreFoundation public API. Not part of
//   the five in-scope FCP frameworks. Called via ProChannel stub 0xaca4a.
//
// CFString literal @ProChannel 0xe61d0:
//   Recovered by dereferencing the CFConstantString data pointer through the
//   binary's __TEXT/__cstring section; the only ProChannel bundle-identifier
//   string in the strings table is `com.apple.prochannel.framework`. This is
//   also the framework's declared CFBundleIdentifier (per its Info.plist),
//   so it matches the compiler's inevitable choice for a self-bundle lookup.

/**
 * @const CFString literal @ProChannel 0xe61d0  (CFConstantString, __cfstring)
 *   C-string contents: "com.apple.prochannel.framework".
 *   This is the framework's own CFBundleIdentifier — the exact key the
 *   function-local-static lookup here is hard-coded to resolve.
 */
const kProChannelBundleIdentifier = "com.apple.prochannel.framework";

/**
 * `_CFBundleGetBundleWithIdentifier(CFStringRef bundleID)` — CoreFoundation
 * (CoreFoundation.framework). Called from getProChannelBundle @0xa9efc via
 * ProChannel stub 0xaca4a. TRUE out-of-scope extern.
 *
 * Semantics (from CFBundle.h): returns the CFBundleRef of an already-loaded
 * bundle whose CFBundleIdentifier equals `bundleID`, or NULL if no such
 * bundle is currently loaded. NOT retained (a "Get" not "Copy" API).
 *
 * Modelled here as a boundary throw. The port has no CFBundle runtime; any
 * caller of getProChannelBundle() reaches this documented boundary rather
 * than silently receiving a synthetic ref.
 */
function CFBundleGetBundleWithIdentifier_stub(_bundleID: string): unknown {
  throw new Error(
    "_CFBundleGetBundleWithIdentifier @ProChannel 0xa9efc (stub 0xaca4a) " +
      "not yet transcribed — CoreFoundation extern (TRUE out-of-scope " +
      "boundary). Called with the framework's own identifier " +
      `"${kProChannelBundleIdentifier}"; expected to return the CFBundleRef ` +
      "for the currently-loaded ProChannel.framework.",
  );
}

/**
 * @ProChannel BSS `__ZZ19getProChannelBundlevE7sBundle`.
 *   Function-local static caching the resolved CFBundleRef. Zero-initialised
 *   at load (matches the ELF/Mach-O convention that __common/__bss is zeroed).
 *   Written @0xa9f01 exactly once per successful lookup; read @0xa9ee4 on
 *   every call, and the null-check @0xa9eeb decides fast-path vs slow-path.
 *   Race semantics in the original: an unguarded write-once (no
 *   std::call_once) — two threads may both take the slow path once, but they
 *   both write the same CoreFoundation-interned pointer so the observable
 *   result is identical. In JS single-threaded model this is just a lazy
 *   memoised getter.
 */
let sBundle: unknown = null;

/**
 * `getProChannelBundle()`  — @ProChannel 0xa9ee4 (__Z19getProChannelBundlev).
 * Returns the CFBundleRef for the currently-loaded ProChannel.framework,
 * caching it in a function-local static so the first call is a single
 * CoreFoundation lookup and every subsequent call is a load-test-return.
 *
 * Faithful line-for-line transcription of the 12-instruction body:
 *   1. Load sBundle; if non-NULL, return it (fast path — cached).
 *   2. Otherwise call _CFBundleGetBundleWithIdentifier(
 *          "com.apple.prochannel.framework").
 *   3. Store the result (which may be NULL) into sBundle and return it.
 */
export function getProChannelBundle(): unknown {
  // ------------------------------------------------------------
  // @0xa9ee4  movq __ZZ19getProChannelBundlevE7sBundle(%rip), %rax
  // @0xa9eeb  testq %rax, %rax
  // @0xa9eee  je   0xa9ef1                    (goto slow path if sBundle == NULL)
  // @0xa9ef0  retq                            (fast path — cached)
  // ------------------------------------------------------------
  if (sBundle !== null && sBundle !== undefined) {
    return sBundle;
  }

  // ------------------------------------------------------------
  // @0xa9ef1..0xa9ef5 — prologue (no TS effect).
  // @0xa9ef5  leaq 0x3c2d4(%rip), %rdi       ; rdi = &@"com.apple.prochannel.framework"
  // @0xa9efc  callq _CFBundleGetBundleWithIdentifier
  // ------------------------------------------------------------
  const bundle = CFBundleGetBundleWithIdentifier_stub(
    kProChannelBundleIdentifier,
  );

  // ------------------------------------------------------------
  // @0xa9f01  movq %rax, sBundle(%rip)        ; cache result (even NULL)
  // @0xa9f08..0xa9f09  epilogue + retq
  // ------------------------------------------------------------
  sBundle = bundle;
  return bundle;
}
