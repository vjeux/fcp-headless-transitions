// raw-port: FFOZNullCurve (chunk m6) — Flexo.framework (channels layer)
//
// Framework binary: /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
//   Versions/A/Flexo (x86_64 slice; VA == offset within the thin slice).
// This chunk covers methods [120..140) of the 150-method FFOZNullCurve class, following the
// chunking already landed in FFOZNullCurve.m1.ts (methods [20..40)), .m2.ts ([40..60)),
// .m4.ts ([80..100)) and .m5.ts ([100..120)) — chunk k holds methods [20k .. 20k+20).
//
// PORTED IN THIS CHUNK SO FAR — exactly ONE method (this file is opened by the queue unit for
// method 124 and will be EXTENDED, add-only, as later units land the rest of [120..140)):
//   124 scaleCurve(double)                                            @0x0000000001287840
//
// The chunk index is DERIVED the same way m5 derives its own, and it reproduces every landed
// anchor. Anchored on m1's `getCurveInterpolation` @0x12871c0 = method 20, the addresses run at a
// uniform 0x10 stride: checked against the cached symbol table
// raw-port/army/inventory/Flexo.syms.txt (never `nm` on the 78 MB fat binary — OPS_LOG #22),
// 106 unique FFOZNullCurve addresses lie in [0x12871c0, 0x1287850] with NO gap other than 0x10.
//   index(0x1287300) = 20 + (0x1287300 - 0x12871c0)/0x10 = 40   ✓ matches m2
//   index(0x1287640) = 20 + (0x1287640 - 0x12871c0)/0x10 = 92   ✓ matches m4
//   index(0x12877c0) = 20 + (0x12877c0 - 0x12871c0)/0x10 = 116  ✓ matches m5
//   index(0x1287840) = 20 + (0x1287840 - 0x12871c0)/0x10 = 124  -> [120..140) = chunk m6
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
//   `raw-port/tools/disasm.sh --sym __ZN13FFOZNullCurve10scaleCurveEd Flexo`
//   -> raw-port/re/disasm/Flexo.__ZN13FFOZNullCurve10scaleCurveEd.s (7 lines), verbatim:
//
//   0x1287840  pushq %rbp
//   0x1287841  movq  %rsp, %rbp
//   0x1287844  xorl  %eax, %eax
//   0x1287846  popq  %rbp
//   0x1287847  retq
//   0x1287848  nopl  (%rax,%rax)      ; padding to the next 0x10 boundary — not executed
//
// That is the whole function — the same NULL pattern m1/m2/m4/m5 transcribe.
//
// THE ARGUMENTS, AND WHY NEITHER IS TOUCHED. SysV places them as
//   %rdi   = this
//   %xmm0  = double          (the scale factor)
// and the body reads neither. There is no load from %rdi and no `mulsd` anywhere, so the scale
// factor cannot reach any state. A port that stored or multiplied anything would be adding
// instructions the machine does not execute (PORTING_SPEC Rule 1), so `_scale` is accepted and
// deliberately ignored.
//
// RETURN VALUE: `xorl %eax, %eax` zeroes the return register. The concrete implementation of the
// same virtual makes the meaning unambiguous — `OZCurve::scaleCurve(double)` @ProChannel 0x2190c
// (a separate, unported ledger entry, quoted here only as evidence, and used as this port's
// oracle control):
//
//   0x2191a  movsd 0x38(%rdi), %xmm2 ; mulsd %xmm0, %xmm2 ; movsd %xmm2, 0x38(%rdi)
//                                     ; scale the curve's end time in place
//   0x21928… ucomisd against the limits at +0x80 and +0x78, clamping the result
//   0x21971  callq OZSplineNode::getSpline() ; and if there is one,
//   0x2199f  callq OZSpline::scaleSpline(double, double, double, CMTime const&)
//   0x219a4  movb  $0x1, %al          ; return TRUE
//
// So the interface contract is "scale me and return true". The null curve returns 0 (false) and
// scales nothing — a coherent "there is no curve to scale", not a stub. This chunk follows the
// landed m1/m2/m4/m5 convention of typing these bodies `number`.
//
// ── Frontier callees new to this chunk ────────────────────────────────────────────────────
//   NONE. Zero calls, zero vtable dispatches, zero RIP-relative loads in the body
//   (`depgraph.py deps __ZN13FFOZNullCurve10scaleCurveEd` lists nothing).
//
// ── ORACLE — live differential against the binary ─────────────────────────────────────────
// raw-port/re/oracle/FFOZNullCurve_scaleCurve_oracle.py. The symbol is a LOCAL (`t` in the cached
// symbol table), so it is not dlsym-able: the harness calls it at x86_64 vmaddr + the loaded
// image's slide, under `arch -x86_64 /usr/bin/python3` so dyld maps the x86_64 slice these
// addresses come from, walking Flexo's `@rpath` chain with `otool -L` + CDLL first (the technique
// OPS_LOG records).
//
// 400 cases with a random scale factor — including ±0, ±Inf, NaN, denormals and the exact 1.0 —
// against a 0xAA-poisoned 0x100-byte receiver:
//   non-zero returns  = 0    (it always returns 0)
//   object written    = 0    (every byte of the receiver is still 0xAA afterwards)
//
// AND THE CONTROL THAT MAKES THOSE TWO ZEROES MEAN SOMETHING, because a harness that never read
// %al and never noticed a write would print exactly the same table: the REAL override of the same
// virtual, `OZCurve::scaleCurve(double)` @ProChannel 0x2190c, is called through the IDENTICAL
// CFUNCTYPE on an identical arena (in a forked child, since it calls on into OZSplineNode). It
// returns 1 — not 0 — and it MUTATES its receiver at +0x38 and +0x30. So the instrument can see
// both a different return value and a write, and "0, unchanged" is a measurement of this function
// rather than a property of the measurement.

/**
 * FFOZNullCurve method chunk m6 — the NULL-pattern bodies for methods [120..140).
 * See file header for provenance and per-method @0xADDR citations.
 */
export const FFOZNullCurve_m6_methods = {
    /** @Flexo 0x0000000001287840  FFOZNullCurve::scaleCurve(double) */
    "FFOZNullCurve::scaleCurve(double)":
        (_self: unknown, _scale: number): number => {
            // @0x1287844 xorl %eax, %eax -> return 0.
            // NOTHING else executes: the 7-line body (listed in the file header) contains no
            // load, no store and no arithmetic, so the scale factor in %xmm0 is never read and
            // the receiver at %rdi is never touched. Verified on the live binary: 400 calls, 0
            // non-zero returns, 0 bytes of the receiver changed — while the real override of the
            // same virtual, called through the identical plumbing, returns 1 and writes at +0x38.
            // Ignoring the arguments IS the transcription.
            return 0;
        },
} as const;
