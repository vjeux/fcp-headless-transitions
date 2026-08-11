// raw-port: FFOZNullCurve (chunk m4) — Flexo.framework (channels layer)
//
// Framework binary: /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
//   Versions/A/Flexo (x86_64 slice; VA == offset within thin slice).
// This chunk covers methods [80..100) of the 150-method FFOZNullCurve class, following the
// chunking already landed in FFOZNullCurve.m1.ts (methods [20..40)) and FFOZNullCurve.m2.ts
// (methods [40..60)) — chunk k holds methods [20k .. 20k+20).
//
// PORTED IN THIS CHUNK SO FAR — exactly ONE method (this file is opened by the queue unit for
// method 92 and will be EXTENDED, add-only, as later units land the rest of [80..100)):
//   92 areHandlesBroken(void*, bool*)                                   @0x0000000001287640
//
// The chunk's index arithmetic is anchored on the two already-landed chunks rather than assumed:
// FFOZNullCurve.m1.ts documents `getCurveInterpolation` @0x12871c0 as method 20 and
// FFOZNullCurve.m2.ts documents `bakeCurve` @0x1287300 as method 40. The symbol table has 73
// unique FFOZNullCurve addresses in [0x12871c0, 0x1287640] with NO gap other than 0x10 (verified
// against `nm -arch x86_64`), so
//   index(0x1287640) = 20 + (0x1287640 - 0x12871c0)/0x10 = 20 + 72 = 92,
// which places it in [80..100) = chunk 4.
//
// ── What FFOZNullCurve is ─────────────────────────────────────────────────────────────────
//
// FFOZNullCurve is the "null-object" implementation of the OZCurve interface (see the long
// explanation in FFOZNullCurve.m1.ts). Every method is a compiler-emitted empty function, so the
// concrete curve can be absent without callers null-checking each access.
//
// ── The method ported here ────────────────────────────────────────────────────────────────
//
// Disasm re-derived in this worktree with
//   `raw-port/tools/disasm.sh --sym __ZN13FFOZNullCurve16areHandlesBrokenEPvPb Flexo`
//   -> raw-port/re/disasm/Flexo.__ZN13FFOZNullCurve16areHandlesBrokenEPvPb.s (7 lines), verbatim:
//
//   0x1287640  pushq %rbp
//   0x1287641  movq  %rsp, %rbp
//   0x1287644  xorl  %eax, %eax
//   0x1287646  popq  %rbp
//   0x1287647  retq
//   0x1287648  nopl  (%rax,%rax)      ; padding to the next 0x10 boundary — not executed
//
// That is the whole function. It is the same NULL pattern m1/m2 transcribe: the frame is set up
// and torn down, the return register is zeroed, and NOTHING else happens.
//
// TWO FACTS THE DISASSEMBLY ESTABLISHES, both load-bearing for the port:
//   1. `%rsi` (the `void* handle`) and `%rdx` (the `bool* out`) are NEVER read and NEVER
//      dereferenced — there is no `movb $0x0, (%rdx)`. The out-parameter is left holding whatever
//      the caller had there. A port that wrote `*out = false` would be adding a store the machine
//      does not perform, which is exactly the kind of "behaves the same-ish" rewrite PORTING_SPEC
//      Rule 1 forbids.
//   2. `%rdi` (`this`) is never read either, so the receiver needs no layout here (same as m1/m2).
//
// RETURN VALUE: `xorl %eax, %eax` zeroes the full 32-bit return register. The Itanium mangling
// does not encode a return type, so the width is not recoverable from the symbol; this chunk
// follows the landed m1/m2 convention of typing these bodies `number` and returning 0. For what
// the zero MEANS at this interface slot, the concrete sibling implementation is
// `OZDynamicCurve::areHandlesBroken(void*, bool*)` @ProChannel 0x29108 (landed in
// OZDynamicCurve.m2.ts): it returns the handle-validity result and only writes `*out` when the
// handle is valid. So the null curve's 0 is "handle not valid / nothing reported", consistent with
// its never touching `out`.
//
// ── Frontier callees new to this chunk ────────────────────────────────────────────────────
//   NONE. Zero calls, zero vtable dispatches, zero RIP-relative loads in the body
//   (`depgraph.py deps __ZN13FFOZNullCurve16areHandlesBrokenEPvPb` lists nothing).

// ── Chunk export: object of ported methods keyed by ledger method-key ──
//
// Same convention as m1/m2 (raw-port/army/tools/assemble_class.py unions every landed
// FFOZNullCurve.m<k>_methods object into one FFOZNullCurve_methods dispatch table). The key is the
// FULL demangled signature so overloads cannot collide.

/**
 * FFOZNullCurve method chunk m4 — the NULL-pattern bodies for methods [80..100).
 * See file header for provenance and per-method @0xADDR citations.
 */
export const FFOZNullCurve_m4_methods = {
    /** @Flexo 0x0000000001287640  FFOZNullCurve::areHandlesBroken(void*, bool*) */
    "FFOZNullCurve::areHandlesBroken(void*, bool*)":
        (_self: unknown, _handle: unknown, _out: unknown): number => {
            // @0x1287644 xorl %eax, %eax -> return 0.
            // The `bool* out` at %rdx is NOT written: the body contains no store at all
            // (7 lines total, listed in the file header). Leaving `_out` untouched IS the
            // transcription.
            return 0;
        },
} as const;
