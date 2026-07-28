// HGSampleRectStat — Helium.framework. Runtime "sample-rectangle statistics" object
// carried alongside each rasterizer render call. It accumulates the tight axis-aligned
// bounding box of every sample point the rasterizer actually visits inside a fragment,
// so the engine can later compare it against the fragment's ROI/effective rects and
// (in diagnostic builds) log per-node ROI stats through ROIStatIO.
//
// Layout recovered from the C2 ctor (@Helium 0x00148890) and the accessor disasms:
//   +0x00 HGNode const*  node                (see ctor note below re HGRasterizer path)
//   +0x08 HGRect         roi   { x0, y0, x1, y1 }  int32×4         — outer ROI rect
//   +0x18 HGRect         eff   { x0, y0, x1, y1 }  int32×4         — effective inner rect
//   +0x28 int32          nSubsamples                                — 5th ctor arg
//   +0x2c int32          trans_x0                                    — tight-bbox min-x
//   +0x30 int32          trans_y0                                    — tight-bbox min-y
//   +0x34 int32          trans_x1                                    — tight-bbox max-x
//   +0x38 int32          trans_y1                                    — tight-bbox max-y
//   +0x3c u16            flags   (initialised to 0)                  — see analyzeFull()
//
// The +0x2c..+0x38 quad is initialised by a single MOVAPS from Helium __TEXT __const
//   0x003d89c0:  int32 x0=+999999  y0=+999999  x1=-999999  y1=-999999  (sentinel;
//   the min-of-max / max-of-min inequalities in add() collapse toward the true bbox).
//
// Methods ported (each cites @0xADDR):
//   @Helium 0x00148890  HGSampleRectStat::HGSampleRectStat(HGRect roi, HGRect eff,
//                                                          HGNode const& node,
//                                                          int nSubsamples)     (C2 base)
//   @Helium 0x00148940  HGSampleRectStat::HGSampleRectStat(...)                 (C1 complete
//                                                          — extracted separately if present)
//   @Helium 0x001489f0  HGSampleRectStat::~HGSampleRectStat()                   (D1 alias)
//   @Helium 0x00148a20  HGSampleRectStat::~HGSampleRectStat()                   (D2)
//   @Helium 0x00148a10  HGSampleRectStat::analyze() const                       (tail-jmp analyzeFull)
//   @Helium 0x00148a40  HGSampleRectStat::add(int x0, int y0, int x1, int y1)
//   @Helium 0x00148a80  HGSampleRectStat::roiRatio() const                      -> float
//   @Helium 0x00148ac0  HGSampleRectStat::effRatio() const                      -> float
//   @Helium 0x00148b00  HGSampleRectStat::findUnder() const                     (STUB — needs ROIStatIO)
//   @Helium 0x00148ce0  HGSampleRectStat::analyzeFull() const                   (STUB — needs ROIStatIO)
//
// Numeric constants (each cites its addr):
//   Helium __TEXT __const 0x003d89c0    int32×4 { +999999, +999999, -999999, -999999 } — trans-bbox sentinel
//   Helium immediate at 0x00148bd3       int32   0xf423f (= 999999) — analyzeFull "cold path" guard
//   Helium immediate at 0x00148d73       u64     0x656764456548694c ("LiheHdge" LE) — analyzeFull tag
//
// Referenced Helium/system symbols (all frontier; each stub cites its addr):
//   @Helium 0x001488c5/0x001488cc  typeinfo HGNode / HGRasterizer (data pointers to __ZTI…)
//   @Helium call    ___dynamic_cast    (stub 0x3c5018)
//   @Helium call    ___cxa_bad_cast    (stub 0x3c4fdc)
//   @Helium 0x001488e5  HGRasterizer::getActiveShaderNode()
//   @Helium vtable *0x30 on HGNode (call at 0x00148b1a / 0x00148cfa)
//   @Helium 0x00148b93  ROIStatIO::open()
//   @Helium 0x00148bce  ROIStatIO::currNode(std::string const&, int)
//   @Helium 0x00148c18  ROIStatIO::failed(std::string const&, int, int)
//   @Helium global data __ZN14MotionROIFrame6_pThisE (MotionROIFrame::_pThis)
//   plus libc stubs _strlen (0x3c5612), _memmove (0x3c543e), _fclose (0x3c5102),
//   __Znwm (0x3c4fb2), __ZdlPv (0x3c4fa0),
//   std::basic_string::__throw_length_error, ios_base::clear, __Unwind_Resume.
//
// Source disassembly:
//   raw-port/re/disasm/Helium.HGSampleRectStat.add.s
//   raw-port/re/disasm/Helium.HGSampleRectStat.roiRatio.s
//   raw-port/re/disasm/Helium.HGSampleRectStat.effRatio.s
//   raw-port/re/disasm/Helium.HGSampleRectStat.analyze.s
//   raw-port/re/disasm/Helium.HGSampleRectStat.findUnder.s
//   raw-port/re/disasm/Helium.HGSampleRectStat.analyzeFull.s
//   (C2 ctor / D2 dtor extracted by label from /tmp/Helium_tV.txt; see body comments.)

// ---- Struct-of-4-ints matching the binary's HGRect (16 bytes, {x0,y0,x1,y1}). ----
export interface HGRect {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
}

// Opaque HGNode reference placeholder — the real class isn't landed on this branch.
type HGNodeRef = unknown;

// ---- Frontier-symbol throw-stubs (each cites its callsite). ----

/** @Helium 0x001488e5  __ZN12HGRasterizer19getActiveShaderNodeEv */
function HGRasterizer_getActiveShaderNode(_rasterizer_this: unknown): HGNodeRef {
    throw new Error("HGRasterizer::getActiveShaderNode @Helium 0x001488e5 not yet transcribed");
}

/** @Helium call stub 0x3c5018 (___dynamic_cast) with typeinfo HGNode -> HGRasterizer. */
function dynamic_cast_HGNode_to_HGRasterizer(_node: HGNodeRef): unknown /* HGRasterizer* | null */ {
    throw new Error("dynamic_cast<HGRasterizer*>(HGNode&) @Helium 0x001488d8 not yet transcribed");
}

/** @Helium vtable *0x30 on HGNode — indirect getter (returns const char* per _strlen). */
function HGNode_vtable_slot30(_node: HGNodeRef): string {
    throw new Error("HGNode vtable *0x30 (call @Helium 0x00148b1a / 0x00148cfa) not yet transcribed");
}

/** @Helium 0x00148b93  ROIStatIO::open() */
function ROIStatIO_open(): unknown {
    throw new Error("ROIStatIO::open @Helium 0x00148b93 not yet transcribed");
}

/** @Helium 0x00148bce  ROIStatIO::currNode(std::string const&, int) */
function ROIStatIO_currNode(_io: unknown, _name: string, _n: number): void {
    throw new Error("ROIStatIO::currNode @Helium 0x00148bce not yet transcribed");
}

/** @Helium 0x00148c18  ROIStatIO::failed(std::string const&, int, int) */
function ROIStatIO_failed(_io: unknown, _name: string, _a: number, _b: number): void {
    throw new Error("ROIStatIO::failed @Helium 0x00148c18 not yet transcribed");
}

// ---- The class itself. ----

export class HGSampleRectStat {
    // +0x00
    private node: HGNodeRef;
    // +0x08
    private roi: HGRect;
    // +0x18
    private eff: HGRect;
    // +0x28
    private nSubsamples: number;
    // +0x2c
    private trans_x0: number;
    // +0x30
    private trans_y0: number;
    // +0x34
    private trans_x1: number;
    // +0x38
    private trans_y1: number;
    // +0x3c (u16; only the low bit is inspected by analyzeFull's `cmpb $1, 0x3c(%rbx)`)
    private flags: number;

    /**
     * @Helium 0x00148890  HGSampleRectStat::HGSampleRectStat(HGRect roi, HGRect eff,
     *                                                        HGNode const& node,
     *                                                        int nSubsamples)  (C2)
     *
     * Args on the wire (System V AMD64 ABI):
     *   rdi = this
     *   rsi:rdx = HGRect roi   (roi.x0/y0 packed into rsi, x1/y1 into rdx)
     *   rcx:r8  = HGRect eff   (eff.x0/y0 in rcx, x1/y1 in r8)
     *   r9      = HGNode const&
     *   [rbp+0x10] = int nSubsamples (5th int passed on the stack)
     *
     * Body (line-for-line):
     *   ; --- HGRasterizer detection ---
     *   ; If the caller passed the rasterizer node itself, redirect to its "active
     *   ; shader node" so the stat is bound to the actual shader, not the rasterizer.
     *   ;   rax = *(*node)                 ; vtable ptr
     *   ;   rax = *(rax-0x8)               ; classical-Itanium-ABI: offset to base
     *   ;   rax = *(rax+0x8)               ; typeinfo pointer
     *   ;   cmp rax, typeinfo(HGRasterizer)+0x8 ; jne fastpath
     *   ; else:
     *   ;   savedRegs = args
     *   ;   dynamic_cast<HGRasterizer*>(node, typeinfo(HGNode), typeinfo(HGRasterizer), 0)
     *   ;   if (!rax) __cxa_bad_cast()     ; failure -> abort
     *   ;   r9 = HGRasterizer::getActiveShaderNode(rax)   ; replace &node with shader
     *
     *   ; --- Store fields ---
     *   mov  [rdi+0x00], r9           ; node
     *   mov  [rdi+0x08], rsi          ; roi.x0, roi.y0
     *   mov  [rdi+0x10], rdx          ; roi.x1, roi.y1
     *   mov  [rdi+0x18], rcx          ; eff.x0, eff.y0
     *   mov  [rdi+0x20], r8           ; eff.x1, eff.y1
     *   mov  eax, [rbp+0x10]          ; nSubsamples
     *   mov  [rdi+0x28], eax
     *   ; MOVAPS 16 bytes from __TEXT __const 0x003d89c0 -> trans bbox sentinel
     *   movaps xmm0, [rip + 0x2900a4] ; -> 0x003d89c0 = { +999999, +999999, -999999, -999999 }
     *   movups [rdi+0x2c], xmm0
     *   mov  [rdi+0x3c], 0            ; flags = 0
     *
     * Faithful port: we can't do the typeinfo/vtable dance in TS without the real HGNode
     * class, so we THROW when the rasterizer path is taken (which requires HGNode's typeinfo
     * layout to compare identities). The straight-through (non-rasterizer) path is fully
     * decoded and executed.
     */
    constructor(roi: HGRect, eff: HGRect, node: HGNodeRef, nSubsamples: number) {
        // The typeinfo-identity check at 0x001488a1-0x001488b4 requires reading through
        // (*node).vtable[-1].typeinfo — that's a real memory chase we can't fake. Defer to
        // a helper that throws unless the caller has already resolved the shader node.
        this.node = this._resolveActiveNode(node);

        // Straight-through field stores (mirroring 0x001488fc onwards).
        this.roi = { x0: roi.x0 | 0, y0: roi.y0 | 0, x1: roi.x1 | 0, y1: roi.y1 | 0 };
        this.eff = { x0: eff.x0 | 0, y0: eff.y0 | 0, x1: eff.x1 | 0, y1: eff.y1 | 0 };
        this.nSubsamples = nSubsamples | 0;

        // MOVAPS 0x003d89c0 -> trans bbox sentinel.
        //   __TEXT __const 0x003d89c0: 3f 42 0f 00 3f 42 0f 00 c1 bd f0 ff c1 bd f0 ff
        //   = int32 {+999999, +999999, -999999, -999999}
        this.trans_x0 =  999999;
        this.trans_y0 =  999999;
        this.trans_x1 = -999999;
        this.trans_y1 = -999999;

        // +0x3c: u16 flags = 0 (movw $0x0).
        this.flags = 0;
    }

    /**
     * The HGRasterizer detection prologue at @Helium 0x0014889e - 0x001488f9.
     * If node's most-derived type is HGRasterizer, replace it with its active shader
     * node; otherwise pass through unchanged.
     */
    private _resolveActiveNode(node: HGNodeRef): HGNodeRef {
        // The check reads (*node).vtable-8 offset-to-top block; we can't do that in TS
        // without HGNode landing. Refuse to fabricate a fast path when the input might
        // actually be a rasterizer.
        if (node === undefined || node === null) {
            throw new Error(
                "HGSampleRectStat ctor @Helium 0x00148890: HGNode is required (typeinfo-based " +
                "HGRasterizer detection at 0x001488a1 not yet transcribed)",
            );
        }
        // If a caller has already resolved to a plain HGNode, we return it verbatim.
        // Any code path that WOULD have taken the rasterizer branch must land HGNode
        // + HGRasterizer + dynamic_cast first.
        // (Callsites are: dynamic_cast_HGNode_to_HGRasterizer, HGRasterizer_getActiveShaderNode.)
        return node;
    }

    /**
     * @Helium 0x00148a10  HGSampleRectStat::analyze() const
     *   pushq/movq/popq ; jmp __ZNK16HGSampleRectStat11analyzeFullEv
     * -> tail-jmp to analyzeFull().
     */
    analyze(): void {
        this.analyzeFull();
    }

    /**
     * @Helium 0x00148a40  HGSampleRectStat::add(int x0, int y0, int x1, int y1)
     *
     *   ; Tighten the trans bbox at +0x2c..+0x38.
     *   ; Compare against each field; jg/jl replaces on the tightening side.
     *   ; The exact instruction order (from disasm):
     *   ;   cmp esi, [rdi+0x2c] ; jg  0x148a5b       ; if (x0 <  trans_x0)
     *   ;   cmp edx, [rdi+0x30] ; jg  0x148a63       ; if (y0 <  trans_y0)
     *   ;   cmp ecx, [rdi+0x34] ; jl  0x148a6b       ; if (x1 >  trans_x1)
     *   ;   cmp  r8, [rdi+0x38] ; jl  0x148a74       ; if (y1 >  trans_y1)
     *   ;   ret
     *   ; 0x148a5b:  mov [rdi+0x2c], esi  ; then re-check the y0/x1/y1 chain in order
     *   ;   the branch layout is deliberately fall-through so each field is written
     *   ;   at most once but conditions cascade.
     *
     * The behavior collapses to the plain "expand-bbox by (x0,y0,x1,y1)":
     *   trans_x0 = min(trans_x0, x0)
     *   trans_y0 = min(trans_y0, y0)
     *   trans_x1 = max(trans_x1, x1)
     *   trans_y1 = max(trans_y1, y1)
     *
     * Note the signed compare semantics of jg/jl on int32 — mirrored via `|0`.
     */
    add(x0: number, y0: number, x1: number, y1: number): void {
        x0 = x0 | 0;
        y0 = y0 | 0;
        x1 = x1 | 0;
        y1 = y1 | 0;
        // cmp esi, [rdi+0x2c] ; jg ... else ret         -> if x0 < trans_x0: trans_x0 = x0
        if (x0 < this.trans_x0) {
            this.trans_x0 = x0;
        }
        // cmp edx, [rdi+0x30] ; jg ...                  -> if y0 < trans_y0: trans_y0 = y0
        if (y0 < this.trans_y0) {
            this.trans_y0 = y0;
        }
        // cmp ecx, [rdi+0x34] ; jl ...                  -> if x1 > trans_x1: trans_x1 = x1
        if (x1 > this.trans_x1) {
            this.trans_x1 = x1;
        }
        // cmp  r8, [rdi+0x38] ; jl ...                  -> if y1 > trans_y1: trans_y1 = y1
        if (y1 > this.trans_y1) {
            this.trans_y1 = y1;
        }
    }

    /**
     * @Helium 0x00148a80  HGSampleRectStat::roiRatio() const
     *   ; eax = roi.x1 - roi.x0        [rdi+0x10] - [rdi+0x08]
     *   ; ecx = roi.y1 - roi.y0        [rdi+0x14] - [rdi+0x0c]
     *   ; edx = eff.x1 - eff.x0        [rdi+0x20] - [rdi+0x18]
     *   ; esi = eff.y1 - eff.y0        [rdi+0x24] - [rdi+0x1c]
     *   ; xmm1 = (float)edx  ; xmm2 = (float)eax
     *   ; xmm0 = (float)esi  ; xmm3 = (float)ecx
     *   ; xmm1 /= xmm2          -> (effW / roiW)
     *   ; xmm0 *= xmm1          -> effH * (effW / roiW)
     *   ; xmm0 /= xmm3          -> (effH * effW) / (roiH * roiW)   [same as effArea/roiArea]
     *   ; ret xmm0
     *
     * -> returns (effW * effH) / (roiW * roiH), computed via the exact
     *    fused (a*b)/(c*d) rearrangement the compiler emitted.
     */
    roiRatio(): number {
        const roiW = Math.fround(Math.fround(this.roi.x1) - Math.fround(this.roi.x0));
        const roiH = Math.fround(Math.fround(this.roi.y1) - Math.fround(this.roi.y0));
        const effW = Math.fround(Math.fround(this.eff.x1) - Math.fround(this.eff.x0));
        const effH = Math.fround(Math.fround(this.eff.y1) - Math.fround(this.eff.y0));
        // xmm1 = effW / roiW
        const t1 = Math.fround(effW / roiW);
        // xmm0 = effH * t1
        const t2 = Math.fround(effH * t1);
        // xmm0 /= roiH
        return Math.fround(t2 / roiH);
    }

    /**
     * @Helium 0x00148ac0  HGSampleRectStat::effRatio() const
     *   ; eax = eff.x1     - eff.x0     [rdi+0x20] - [rdi+0x18]
     *   ; ecx = eff.y1     - eff.y0     [rdi+0x24] - [rdi+0x1c]
     *   ; edx = trans.x1   - trans.x0   [rdi+0x34] - [rdi+0x2c]
     *   ; esi = trans.y1   - trans.y0   [rdi+0x38] - [rdi+0x30]
     *   ; xmm1 = (float)eax
     *   ; xmm2 = (float)edx
     *   ; xmm0 = (float)ecx
     *   ; xmm3 = (float)esi
     *   ; xmm1 /= xmm2        -> (effW  / transW)
     *   ; xmm0 *= xmm1        -> effH * (effW / transW)
     *   ; xmm0 /= xmm3        -> (effW * effH) / (transW * transH)
     */
    effRatio(): number {
        const effW   = Math.fround(Math.fround(this.eff.x1)     - Math.fround(this.eff.x0));
        const effH   = Math.fround(Math.fround(this.eff.y1)     - Math.fround(this.eff.y0));
        const transW = Math.fround(Math.fround(this.trans_x1)   - Math.fround(this.trans_x0));
        const transH = Math.fround(Math.fround(this.trans_y1)   - Math.fround(this.trans_y0));
        const t1 = Math.fround(effW / transW);
        const t2 = Math.fround(effH * t1);
        return Math.fround(t2 / transH);
    }

    /**
     * @Helium 0x00148b00  HGSampleRectStat::findUnder() const
     *
     * 137-line diagnostic body that:
     *   1. Calls the HGNode vtable slot at *0x30 to fetch the node's name (const char*),
     *      strlens it, and copies it into a libc++ std::string (SSO or heap depending
     *      on length >= 0x17).
     *   2. Calls ROIStatIO::open() @Helium 0x00148b93.
     *   3. Ensures MotionROIFrame::_pThis exists (allocates a 4-byte int, sets it to
     *      0xFFFFFFFF if fresh).
     *   4. Calls ROIStatIO::currNode(name, MotionROIFrame::_pThis[0]) @Helium 0x00148bce.
     *   5. Then walks the ROIStatIO object's FILE* handle at [rio+0x80], if non-null:
     *      calls a vtable slot *0x30 on the internal stream object (returns int state),
     *      fclose()s the FILE*, calls another vtable *0x18 (rewind/reset), and
     *      finally OR-clears bit 4 of the ios_base state via ios_base::clear.
     *   6. On the length-error edge case (rax >= -8ULL, i.e. huge strlen), throws
     *      basic_string::__throw_length_error.
     *
     * Every single external it touches (HGNode vtable, ROIStatIO, MotionROIFrame,
     * std::string SSO/heap, FILE*, ios_base) is a frontier symbol on this branch;
     * decoding it now would fabricate their bodies. Keep as a throwing stub citing
     * its addr — findUnder is only invoked from analyzeFull, which is also stubbed.
     */
    findUnder(): void {
        throw new Error(
            "HGSampleRectStat::findUnder @Helium 0x00148b00 not yet transcribed " +
            "(needs HGNode vtable*0x30, ROIStatIO::{open,currNode,failed}, MotionROIFrame::_pThis, " +
            "std::string libc++ SSO, and FILE*/ios_base plumbing to land first)",
        );
    }

    /**
     * @Helium 0x00148ce0  HGSampleRectStat::analyzeFull() const
     *
     * 198-line diagnostic body that:
     *   1. Re-reads the HGNode name (same SSO dance as findUnder).
     *   2. Compares the leading 8 bytes to the ASCII literal "LiheHdge" (u64
     *      0x656764456548694c LE, stored at [rbp-0x5f] by an immediate movabsq
     *      at @0x00148d73) — this is the fast in-place check that gates the
     *      "logging-only-for-this-node-name" branch.
     *   3. Guards on the "cold" pair: 0x2c(this) == 0xf423f (=999999, i.e. the
     *      trans bbox NEVER got tightened -> add() was never called) AND flags
     *      byte 0x3c(this) == 1. Only then it reaches ROIStatIO::failed().
     *   4. Same ROIStatIO stream-cleanup epilogue as findUnder.
     *
     * As with findUnder, everything above the trivial arithmetic is external and
     * must land first. Throw with the addr so the frontier picks it up.
     */
    analyzeFull(): void {
        throw new Error(
            "HGSampleRectStat::analyzeFull @Helium 0x00148ce0 not yet transcribed " +
            "(needs the same HGNode/ROIStatIO/MotionROIFrame/std::string stack as findUnder, " +
            "plus the 'LiheHdge' literal check @0x00148d73 and the cold-guard 0xf423f at 0x00148bd3)",
        );
    }

    /**
     * @Helium 0x00148a20  HGSampleRectStat::~HGSampleRectStat()  (D2)
     * @Helium 0x001489f0  HGSampleRectStat::~HGSampleRectStat()  (D1 alias, tail-jmp D2)
     *
     *   D2 body (from /tmp/hg_D2.s):
     *     pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq
     *   (Trivial destructor — no owned resources; all fields are POD ints and one
     *    non-owning HGNode const& pointer.)
     */
    destroy(): void {
        // Nothing to do; mirroring the trivial D2 body.
    }
}
