// raw-port: FFOZNullCurve (chunk m5) — Flexo.framework (channels layer)
//
// Framework binary: /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
//   Versions/A/Flexo (x86_64 slice; VA == offset within the thin slice).
// This chunk covers methods [100..120) of the 150-method FFOZNullCurve class, following the
// chunking already landed in FFOZNullCurve.m1.ts (methods [20..40)), .m2.ts ([40..60)) and
// .m4.ts ([80..100)) — chunk k holds methods [20k .. 20k+20).
//
// PORTED IN THIS CHUNK SO FAR — exactly ONE method (this file is opened by the queue unit for
// method 116 and will be EXTENDED, add-only, as later units land the rest of [100..120)):
//   116 getPointWithoutBehavior(CMTime const&, double, double*)        @0x00000000012877c0
//
// The chunk index is DERIVED, not assumed, and it reproduces both already-landed anchors.
// FFOZNullCurve.m2.ts documents `bakeCurve` @0x1287300 as method 40 and FFOZNullCurve.m4.ts
// documents `areHandlesBroken` @0x1287640 as method 92, both anchored on m1's
// `getCurveInterpolation` @0x12871c0 = method 20. The class has 150 unique addresses, of which
// the 130 at or above 0x12871c0 run to 0x12879d0 with NO gap other than the 0x10 stride
// (checked against the cached symbol table raw-port/army/inventory/Flexo.syms.txt rather than
// by running `nm` on the 78 MB fat binary). So
//   index(0x1287300) = 20 + (0x1287300 - 0x12871c0)/0x10 = 40   ✓ matches m2
//   index(0x1287640) = 20 + (0x1287640 - 0x12871c0)/0x10 = 92   ✓ matches m4
//   index(0x12877c0) = 20 + (0x12877c0 - 0x12871c0)/0x10 = 116  -> [100..120) = chunk m5
//
// ── What FFOZNullCurve is ─────────────────────────────────────────────────────────────────
//
// FFOZNullCurve is the "null-object" implementation of the OZCurve interface (see the long
// explanation in FFOZNullCurve.m1.ts). Every method is a compiler-emitted empty function, so a
// channel whose concrete curve is absent can still be dispatched through the standard OZCurve
// surface without callers null-checking each access.
//
// ── The method ported here ────────────────────────────────────────────────────────────────
//
// Disasm re-derived in this worktree with
//   `raw-port/tools/disasm.sh --sym __ZN13FFOZNullCurve23getPointWithoutBehaviorERK6CMTimedPd Flexo`
//   -> raw-port/re/disasm/Flexo.__ZN13FFOZNullCurve23getPointWithoutBehaviorERK6CMTimedPd.s
//      (7 lines), verbatim:
//
//   0x12877c0  pushq %rbp
//   0x12877c1  movq  %rsp, %rbp
//   0x12877c4  xorl  %eax, %eax
//   0x12877c6  popq  %rbp
//   0x12877c7  retq
//   0x12877c8  nopl  (%rax,%rax)      ; padding to the next 0x10 boundary — not executed
//
// That is the whole function — the same NULL pattern m1/m2/m4 transcribe.
//
// THE ARGUMENTS, AND WHY NONE OF THEM IS TOUCHED. SysV places them as
//   %rdi   = this
//   %rsi   = CMTime const&   (a 24-byte struct passed BY REFERENCE, per the `RK6CMTime` mangling)
//   %xmm0  = double          (the first floating-point argument)
//   %rdx   = double*         (the out-parameter)
// and the body reads NONE of the four. In particular there is no `movsd %xmm0,(%rdx)` and no store
// of any kind: the out-parameter keeps whatever the caller left in it. A port that wrote
// `*out = 0.0` would be adding an instruction the machine does not execute — the "behaves the
// same-ish" rewrite PORTING_SPEC Rule 1 forbids — so `_out` is accepted and deliberately ignored.
//
// RETURN VALUE: `xorl %eax, %eax` zeroes the return register. The concrete base implementation
// makes the meaning unambiguous — `OZCurve::getPointWithoutBehavior(CMTime const&, double, double*)`
// @ProChannel 0x20bc4 (a separate, unported ledger entry, quoted here only as evidence):
//
//   0x20bc4  testq %rdx, %rdx          ; out == null?
//   0x20bc7  je    0x20be7             ;   -> skip straight to the return
//   0x20bd2  movq  (%rdi), %rax        ; vtable
//   0x20bd7  callq *0x4e0(%rax)        ; virtual: compute the point
//   0x20bdd  movsd %xmm0, (%rbx)       ; *out = the computed value
//   0x20be7  movb  $0x1, %al           ; return TRUE
//
// So the interface contract is "return true and publish the value through `out`". The null curve
// returns 0 (false) and publishes nothing — a coherent "there is no point here", not a stub.
// This chunk follows the landed m1/m2/m4 convention of typing these bodies `number`.
//
// ── Frontier callees new to this chunk ────────────────────────────────────────────────────
//   NONE. Zero calls, zero vtable dispatches, zero RIP-relative loads in the body
//   (`depgraph.py deps __ZN13FFOZNullCurve23getPointWithoutBehaviorERK6CMTimedPd` lists nothing).
//
// ── ORACLE — live differential against the binary ─────────────────────────────────────────
// raw-port/re/oracle/FFOZNullCurve_getPointWithoutBehavior_oracle.py. The symbol is a LOCAL
// (`t` in the cached symbol table), so it is not dlsym-able: the harness calls it at x86_64
// vmaddr + the loaded image's slide, under `arch -x86_64 /usr/bin/python3` so dyld maps the
// x86_64 slice these addresses come from. Flexo is not plain-dlopen-able outside the app bundle
// (its @rpath chain, and a hardened /usr/bin/python3 strips DYLD_*), so the harness walks
// `otool -L` and CDLLs each @rpath dependency depth-first first — the technique OPS_LOG records.
//
// 800 cases with a randomly-filled CMTime, a random double, a random pre-set out-parameter and a
// 0xAA-poisoned 0x100-byte object:
//   non-zero returns = 0      (it always returns 0)
//   out-param written = 0     (the caller's double is bit-identical after the call)
//   object written = 0        (every byte of the receiver is still 0xAA)
// The middle line is the one that matters: it is direct evidence for the "no store" claim above,
// which reading the listing alone can only assert.

// ── Chunk export: object of ported methods keyed by ledger method-key ──
//
// Same convention as m1/m2/m4 (raw-port/army/tools/assemble_class.py unions every landed
// FFOZNullCurve.m<k>_methods object into one FFOZNullCurve_methods dispatch table). The key is the
// FULL demangled signature so overloads cannot collide.

/**
 * FFOZNullCurve method chunk m5 — the NULL-pattern bodies for methods [100..120).
 * See file header for provenance and per-method @0xADDR citations.
 */
export const FFOZNullCurve_m5_methods = {
    /** @Flexo 0x00000000012877c0  FFOZNullCurve::getPointWithoutBehavior(CMTime const&, double, double*) */
    "FFOZNullCurve::getPointWithoutBehavior(CMTime const&, double, double*)":
        (_self: unknown, _time: unknown, _value: number, _out: unknown): number => {
            // @0x12877c4 xorl %eax, %eax -> return 0.
            // NOTHING else executes: the 7-line body (listed in the file header) contains no
            // store, so the `double* out` at %rdx is left exactly as the caller had it, and
            // neither the CMTime at %rsi nor the double in %xmm0 is ever read. Verified on the
            // live binary: 800 calls, 0 wrote the out-parameter. Ignoring the arguments IS the
            // transcription.
            return 0;
        },
} as const;
