// raw-port: FFOZNullCurve (chunk m2) — Flexo.framework (channels layer)
//
// Framework binary: /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
//   Versions/A/Flexo (x86_64 slice; VA == offset within thin slice).
// This chunk ports methods [40..60) of the 150-method FFOZNullCurve class:
//   40 bakeCurve(void*, CMTime const&, CMTime const&, CMTime const&, double, double)  @0x0000000001287300
//   41 simplifyCurve(CMTime const&, CMTime const&, CMTime const&, double, double, uint, int) @0x0000000001287310
//   42 smoothCurve(CMTime const&, CMTime const&, CMTime const&)                        @0x0000000001287320
//   43 getCurrentMaxValueU(CMTime*)                                                    @0x0000000001287330
//   44 getCurrentMinValueU(CMTime*)                                                    @0x0000000001287340
//   45 getCurrentMaxValueV(double*, bool)                                              @0x0000000001287350
//   46 getCurrentMinValueV(double*, bool)                                              @0x0000000001287360
//   47 getAbsoluteMaxValueV(double*)                                                   @0x0000000001287370
//   48 getAbsoluteMinValueV(double*)                                                   @0x0000000001287380
//   49 setAbsoluteMaxValueV(double)                                                    @0x0000000001287390
//   50 setAbsoluteMinValueV(double)                                                    @0x00000000012873a0
//   51 getNumberOfKeypoints()                                                          @0x00000000012873b0
//   52 setCurveOffset(CMTime const&, double)                                           @0x00000000012873c0
//   53 setCurveSegmentValue(CMTime const&, double, bool)                               @0x00000000012873d0
//   54 setCurveSegmentValueBounded(CMTime const&, double, double, double, bool)        @0x00000000012873e0
//   55 createCurveSegment(CMTime const&, CMTime const&, CMTime const&, bool, bool)     @0x00000000012873f0
//   56 setKeypoint(CMTime const&, bool)                                                @0x0000000001287400
//   57 setKeypoint(void*, CMTime const&, double, bool)                                 @0x0000000001287410
//   58 setKeypoint(CMTime const&, double, bool)                                        @0x0000000001287420
//   59 moveKeypoint(void*, CMTime const&, bool, bool, bool)                            @0x0000000001287430
//
// DECODE: raw-port/re/disasm/Flexo.FFOZNullCurve.<method>.s (one .s per method — see the
//   demangled-map suffix convention below for the three overloaded setKeypoint variants and
//   the two "V(Pd, bool)" methods with distinct signatures).
//
// PATTERN. ALL 20 methods in this chunk are the same 5-instruction NULL-pattern body:
//
//   pushq %rbp
//   movq  %rsp, %rbp
//   xorl  %eax, %eax           ; return 0  (as int32/OSStatus/HRESULT — the ABI return slot)
//   popq  %rbp
//   retq
//   nopl  (%rax,%rax)          ; padding to 16-byte alignment for the next method
//
// Verified bit-identical across all 20 disasm files. This is FCP's canonical "null-object"
// implementation of the OZCurve interface — a placeholder curve that succeeds every call
// with zero side effects, used where a curve slot must be non-null but no curve data is
// present (e.g. before a channel has been keyframed). The int-return methods (bakeCurve,
// simplifyCurve, smoothCurve, get*Value*, setKeypoint, moveKeypoint, etc.) all return 0
// (which in OZCurve's error-code convention is "OK, no work done"); the void-return methods
// (setAbsoluteMaxValueV / setAbsoluteMinValueV / setCurveOffset / setCurveSegmentValue*) 
// produce the same body because at the ABI level "return 0 in %eax" and "void return" share
// identical machine code — %eax is a caller-saves register the caller ignores for voids.
//
// NOTE. Method 44 (`getCurrentMinValueU`) does NOT appear in the printed disasm as a
// separately-labeled entry — otool's ICF pass merged it into the identical body of method 43
// (`getCurrentMaxValueU`) because both bodies are byte-identical. Verified by extracting
// method 44 from Flexo_tV.txt (labeled entry present at 0x1287340); the pattern is the same
// 5-instruction NULL stub. See raw-port/re/disasm/Flexo.FFOZNullCurve.getCurrentMinValueU.s.
//
// The ledger records these as `cpp` symbols (mangled `_ZN13FFOZNullCurve...`); we key the
// dispatch table by the mangled-signature-derived TS-safe name (see the map below) rather
// than the demangled string because setKeypoint has three overloads that would collide.

// ── Chunk export: object of ported methods keyed by ledger method-key ──
//
// The chunk assembler (raw-port/army/tools/assemble_class.py) unions every landed
// FFOZNullCurve.m<k>_methods object into a single FFOZNullCurve_methods dispatch table.
// Each entry takes `(self, ...args)` where `self` is a placeholder for the FFOZNullCurve
// instance (this class has no state relevant to any method in this chunk — every body
// ignores %rdi/%rsi/%rdx/... entirely, verified by the disasm having zero moves-from-arg-regs).
//
// The keys below MUST match the demangled string in Flexo.ledger.json (see PORTING_SPEC Rule 6
// — reviewers verify keys against the ledger). For the three overloaded `setKeypoint`
// symbols we distinguish by full demangled signature.

/**
 * FFOZNullCurve method chunk m2 — all 20 bodies are the NULL-pattern
 * `xorl %eax,%eax; retq` verified bit-identical in FCP.
 * See file header for provenance and per-method @0xADDR citations.
 */
export const FFOZNullCurve_m2_methods = {
    /** @Flexo 0x0000000001287300  FFOZNullCurve::bakeCurve(void*, CMTime const&, CMTime const&, CMTime const&, double, double) */
    "FFOZNullCurve::bakeCurve(void*, CMTime const&, CMTime const&, CMTime const&, double, double)":
        (_self: unknown, _outBuf: unknown, _t0: unknown, _t1: unknown, _t2: unknown, _d0: number, _d1: number): number => {
            // @0x1287304 xorl %eax, %eax -> return 0.
            return 0;
        },

    /** @Flexo 0x0000000001287310  FFOZNullCurve::simplifyCurve(CMTime const&, CMTime const&, CMTime const&, double, double, unsigned int, int) */
    "FFOZNullCurve::simplifyCurve(CMTime const&, CMTime const&, CMTime const&, double, double, unsigned int, int)":
        (_self: unknown, _t0: unknown, _t1: unknown, _t2: unknown, _d0: number, _d1: number, _u: number, _i: number): number => {
            // @0x1287314 xorl %eax, %eax -> return 0.
            return 0;
        },

    /** @Flexo 0x0000000001287320  FFOZNullCurve::smoothCurve(CMTime const&, CMTime const&, CMTime const&) */
    "FFOZNullCurve::smoothCurve(CMTime const&, CMTime const&, CMTime const&)":
        (_self: unknown, _t0: unknown, _t1: unknown, _t2: unknown): number => {
            // @0x1287324 xorl %eax, %eax -> return 0.
            return 0;
        },

    /** @Flexo 0x0000000001287330  FFOZNullCurve::getCurrentMaxValueU(CMTime*) */
    "FFOZNullCurve::getCurrentMaxValueU(CMTime*)":
        (_self: unknown, _outT: unknown): number => {
            // @0x1287334 xorl %eax, %eax -> return 0. The out-param is NOT written
            // (no `movq $0, (%rsi)` etc. in the disasm — the caller must have zeroed it).
            return 0;
        },

    /** @Flexo 0x0000000001287340  FFOZNullCurve::getCurrentMinValueU(CMTime*) */
    "FFOZNullCurve::getCurrentMinValueU(CMTime*)":
        (_self: unknown, _outT: unknown): number => {
            // @0x1287344 xorl %eax, %eax -> return 0. Same body as getCurrentMaxValueU;
            // otool ICF-merged both entries in the printed disasm — the labeled entry at
            // 0x1287340 exists (verified via /tmp/Flexo_tV.txt extraction).
            return 0;
        },

    /** @Flexo 0x0000000001287350  FFOZNullCurve::getCurrentMaxValueV(double*, bool) */
    "FFOZNullCurve::getCurrentMaxValueV(double*, bool)":
        (_self: unknown, _outD: unknown, _flag: boolean): number => {
            // @0x1287354 xorl %eax, %eax -> return 0. Out-param NOT written.
            return 0;
        },

    /** @Flexo 0x0000000001287360  FFOZNullCurve::getCurrentMinValueV(double*, bool) */
    "FFOZNullCurve::getCurrentMinValueV(double*, bool)":
        (_self: unknown, _outD: unknown, _flag: boolean): number => {
            // @0x1287364 xorl %eax, %eax -> return 0. Out-param NOT written.
            return 0;
        },

    /** @Flexo 0x0000000001287370  FFOZNullCurve::getAbsoluteMaxValueV(double*) */
    "FFOZNullCurve::getAbsoluteMaxValueV(double*)":
        (_self: unknown, _outD: unknown): number => {
            // @0x1287374 xorl %eax, %eax -> return 0. Out-param NOT written.
            return 0;
        },

    /** @Flexo 0x0000000001287380  FFOZNullCurve::getAbsoluteMinValueV(double*) */
    "FFOZNullCurve::getAbsoluteMinValueV(double*)":
        (_self: unknown, _outD: unknown): number => {
            // @0x1287384 xorl %eax, %eax -> return 0. Out-param NOT written.
            return 0;
        },

    /** @Flexo 0x0000000001287390  FFOZNullCurve::setAbsoluteMaxValueV(double) */
    "FFOZNullCurve::setAbsoluteMaxValueV(double)":
        (_self: unknown, _v: number): number => {
            // @0x1287394 xorl %eax, %eax -> return 0. Setter is a no-op — no state to modify.
            return 0;
        },

    /** @Flexo 0x00000000012873a0  FFOZNullCurve::setAbsoluteMinValueV(double) */
    "FFOZNullCurve::setAbsoluteMinValueV(double)":
        (_self: unknown, _v: number): number => {
            // @0x12873a4 xorl %eax, %eax -> return 0. Setter is a no-op.
            return 0;
        },

    /** @Flexo 0x00000000012873b0  FFOZNullCurve::getNumberOfKeypoints() */
    "FFOZNullCurve::getNumberOfKeypoints()":
        (_self: unknown): number => {
            // @0x12873b4 xorl %eax, %eax -> return 0. Null curve has zero keypoints; this is
            // an OBSERVABLE contract for consumers (unlike the setters), and it's grounded to
            // the concrete `xorl %eax,%eax; retq` sequence at 0x12873b0-b7.
            return 0;
        },

    /** @Flexo 0x00000000012873c0  FFOZNullCurve::setCurveOffset(CMTime const&, double) */
    "FFOZNullCurve::setCurveOffset(CMTime const&, double)":
        (_self: unknown, _t: unknown, _off: number): number => {
            // @0x12873c4 xorl %eax, %eax -> return 0.
            return 0;
        },

    /** @Flexo 0x00000000012873d0  FFOZNullCurve::setCurveSegmentValue(CMTime const&, double, bool) */
    "FFOZNullCurve::setCurveSegmentValue(CMTime const&, double, bool)":
        (_self: unknown, _t: unknown, _v: number, _flag: boolean): number => {
            // @0x12873d4 xorl %eax, %eax -> return 0.
            return 0;
        },

    /** @Flexo 0x00000000012873e0  FFOZNullCurve::setCurveSegmentValueBounded(CMTime const&, double, double, double, bool) */
    "FFOZNullCurve::setCurveSegmentValueBounded(CMTime const&, double, double, double, bool)":
        (_self: unknown, _t: unknown, _v: number, _lo: number, _hi: number, _flag: boolean): number => {
            // @0x12873e4 xorl %eax, %eax -> return 0.
            return 0;
        },

    /** @Flexo 0x00000000012873f0  FFOZNullCurve::createCurveSegment(CMTime const&, CMTime const&, CMTime const&, bool, bool) */
    "FFOZNullCurve::createCurveSegment(CMTime const&, CMTime const&, CMTime const&, bool, bool)":
        (_self: unknown, _t0: unknown, _t1: unknown, _t2: unknown, _f0: boolean, _f1: boolean): number => {
            // @0x12873f4 xorl %eax, %eax -> return 0.
            return 0;
        },

    /** @Flexo 0x0000000001287400  FFOZNullCurve::setKeypoint(CMTime const&, bool) — overload 1 of 3 */
    "FFOZNullCurve::setKeypoint(CMTime const&, bool)":
        (_self: unknown, _t: unknown, _flag: boolean): number => {
            // @0x1287404 xorl %eax, %eax -> return 0.
            return 0;
        },

    /** @Flexo 0x0000000001287410  FFOZNullCurve::setKeypoint(void*, CMTime const&, double, bool) — overload 2 of 3 */
    "FFOZNullCurve::setKeypoint(void*, CMTime const&, double, bool)":
        (_self: unknown, _kp: unknown, _t: unknown, _v: number, _flag: boolean): number => {
            // @0x1287414 xorl %eax, %eax -> return 0.
            return 0;
        },

    /** @Flexo 0x0000000001287420  FFOZNullCurve::setKeypoint(CMTime const&, double, bool) — overload 3 of 3 */
    "FFOZNullCurve::setKeypoint(CMTime const&, double, bool)":
        (_self: unknown, _t: unknown, _v: number, _flag: boolean): number => {
            // @0x1287424 xorl %eax, %eax -> return 0.
            return 0;
        },

    /** @Flexo 0x0000000001287430  FFOZNullCurve::moveKeypoint(void*, CMTime const&, bool, bool, bool) */
    "FFOZNullCurve::moveKeypoint(void*, CMTime const&, bool, bool, bool)":
        (_self: unknown, _kp: unknown, _t: unknown, _f0: boolean, _f1: boolean, _f2: boolean): number => {
            // @0x1287434 xorl %eax, %eax -> return 0.
            return 0;
        },
} as const;
