// raw-port: FFOZNullCurve (chunk m4) — Flexo.framework (channels layer)
//
// Framework binary: /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
//   Versions/A/Flexo (x86_64 slice; VA == offset within thin slice).
// This chunk covers methods [80..100) of the 150-method FFOZNullCurve class, following the
// chunking already landed in FFOZNullCurve.m1.ts (methods [20..40)) and FFOZNullCurve.m2.ts
// (methods [40..60)) — chunk k holds methods [20k .. 20k+20).
//
// PORTED IN THIS CHUNK SO FAR (this file is EXTENDED, add-only, as later units land the rest
// of [80..100)):
//   82 getKeypointNormal(void*, double*)                                @0x00000000012875a0
//   92 areHandlesBroken(void*, bool*)                                   @0x0000000001287640
//
// The chunk's index arithmetic is anchored on the two already-landed chunks rather than assumed:
// FFOZNullCurve.m1.ts documents `getCurveInterpolation` @0x12871c0 as method 20 and
// FFOZNullCurve.m2.ts documents `bakeCurve` @0x1287300 as method 40. The symbol table has 73
// unique FFOZNullCurve addresses in [0x12871c0, 0x1287640] with NO gap other than 0x10 (verified
// against `nm -arch x86_64`), so
//   index(0x1287640) = 20 + (0x1287640 - 0x12871c0)/0x10 = 20 + 72 = 92,
//   index(0x12875a0) = 20 + (0x12875a0 - 0x12871c0)/0x10 = 20 + 62 = 82,
// which places both in [80..100) = chunk 4. The contiguity claim was re-checked against the
// cached inventory when method 82 was added: 73 unique FFOZNullCurve addresses in
// [0x12871c0, 0x1287640], zero gaps other than 0x10.
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
// ── Method 82: getKeypointNormal(void*, double*) @0x12875a0 ───────────────────────────────
//
// Disasm re-derived in this worktree with
//   `raw-port/tools/disasm.sh --sym __ZN13FFOZNullCurve17getKeypointNormalEPvPd Flexo`
//   -> raw-port/re/disasm/Flexo.__ZN13FFOZNullCurve17getKeypointNormalEPvPd.s (7 lines), verbatim:
//
//   0x12875a0  pushq %rbp
//   0x12875a1  movq  %rsp, %rbp
//   0x12875a4  xorl  %eax, %eax
//   0x12875a6  popq  %rbp
//   0x12875a7  retq
//   0x12875a8  nopl  (%rax,%rax)      ; padding to the next 0x10 boundary — not executed
//
// The same NULL pattern as method 92 above, and the same two load-bearing facts: `%rsi` (the
// `void* keypoint handle`) and `%rdx` (the `double* out`) are never read and never
// dereferenced — there is no `movsd %xmm0, (%rdx)` — and `%rdi` (`this`) is never read either.
// Writing `*out = 0.0` would ADD a store the machine does not perform.
//
// NOTE THE OVERLOAD. There is a second `getKeypointNormal` at 0x12875c0 taking
// `(CMTime const&, double*)`; it is a DIFFERENT method (index 84) and a different queue unit.
// The dispatch key below is the full demangled signature precisely so the two cannot collide.
//
// ORACLED — raw-port/re/oracle/FFOZNullCurve_getKeypointNormal_oracle.py, under
// `arch -x86_64 /usr/bin/python3`. The negative claim is the interesting one and reading a
// listing is the weakest way to establish it, so it was measured: called at
// slide + 0x12875a0 with the seven bytes there checked against the encoding of the whole body
// (554889e531c05d, i.e. everything up to `retq`), with a poisoned receiver, a poisoned handle
// and a poisoned `double*`. Five out-values (-12345.6789, 0.0, NaN, 1e308, -0.0): returns 0
// every time, and the out-parameter AND the 128-byte receiver are byte-identical afterwards.
// Two mutated expectations scored beside it: "it writes 0.0 through the out-pointer" killed
// 4/5 (the 0.0 case cannot tell the two apart, which is why the other four are there) and
// "it writes to the receiver" killed 5/5.
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
    /** @Flexo 0x00000000012875a0  FFOZNullCurve::getKeypointNormal(void*, double*) */
    "FFOZNullCurve::getKeypointNormal(void*, double*)":
        (_self: unknown, _handle: unknown, _out: unknown): number => {
            // @0x12875a4 xorl %eax, %eax -> return 0.
            // The `double* out` at %rdx is NOT written: the body has no store at all (7 lines,
            // listed in the file header). Leaving `_out` untouched IS the transcription, and it
            // was measured against the live routine rather than read off the listing.
            return 0;
        },

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
