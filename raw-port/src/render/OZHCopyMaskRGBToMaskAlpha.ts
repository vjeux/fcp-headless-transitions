// OZHCopyMaskRGBToMaskAlpha — Ozone.framework.
// Faithful transcription. This class is a thin Ozone-side wrapper around the ProCore/Hg engine
// class HgcCopyMaskRGBToMaskAlpha (the base is invoked from both destructors below); the derived
// Ozone class contributes ONLY three symbols to the binary:
//
//   0x0000000000424280  OZHCopyMaskRGBToMaskAlpha::GetDOD(HGRenderer*, int, HGRect)
//   0x00000000004252e0  OZHCopyMaskRGBToMaskAlpha::~OZHCopyMaskRGBToMaskAlpha()   (D1, complete-object dtor)
//   0x00000000004252f0  OZHCopyMaskRGBToMaskAlpha::~OZHCopyMaskRGBToMaskAlpha()   (D0, deleting  dtor)
//
// Decode evidence (raw-port/re/disasm/):
//   OZHCopyMaskRGBToMaskAlpha.GetDOD.s
//   OZHCopyMaskRGBToMaskAlpha.~OZHCopyMaskRGBToMaskAlpha.s
// D1 (base-object dtor) body, hand-dumped from /tmp/Ozone_tV.txt at 0x4252e0:
//   pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; jmp __ZN25HgcCopyMaskRGBToMaskAlphaD2Ev
// D0 (deleting dtor) body @0x4252f0:
//   pushq %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax ; movq %rdi,%rbx
//   callq __ZN25HgcCopyMaskRGBToMaskAlphaD2Ev
//   movq %rbx,%rdi ; addq $0x8,%rsp ; popq %rbx ; popq %rbp
//   jmp    __ZN8HGObjectdlEPv                (== HGObject::operator delete(void*))
//
// Callees referenced in the disassembly (frontier — NOT yet transcribed):
//   __ZN25HgcCopyMaskRGBToMaskAlphaD2Ev  HgcCopyMaskRGBToMaskAlpha::~HgcCopyMaskRGBToMaskAlpha() (base dtor)
//   __ZN8HGObjectdlEPv                    HGObject::operator delete(void*)
// External data:
//   _HGRectNull  — literal-pool symbol referenced at 0x424285→0x42428b via RIP+0x3fca8e.
//                  It is a global HGRect (16 bytes on x86_64) that represents "empty rectangle".
//                  We do not know its numeric value from THIS class alone; a stub returns it
//                  through hgRectNull() below (throws — deferred to a decoder of ProCore/HG).
//
// HGRect ABI (from the fact that GetDOD takes it in {rcx, r8} and returns it in {rax, rdx}
// per the SysV x86_64 struct-in-regs rule for 16-byte trivially-copyable POD): the type is a
// 16-byte struct. Its interior field layout is opaque to this class; every value is treated as
// two 64-bit halves (lo, hi) exactly like the register pair the ABI uses. This matches the
// disassembly: GetDOD moves rcx→rax and r8→rdx with NO reads of the interior, and when it
// returns HGRectNull it dereferences (rcx) and 0x8(rcx) — i.e. it reads the two 8-byte halves.

/**
 * HGRect — Ozone/HG's 2D rectangle type. The Ozone binary passes and returns it as two
 * 8-byte halves in {rax,rdx}. See file header for the ABI note.
 *
 * Layout is opaque to OZHCopyMaskRGBToMaskAlpha (never accessed by field here), so this class
 * models it as an opaque {lo,hi} pair matching the register-pair the SysV ABI uses. Any decoder
 * that later recovers the field layout (int32 x/y/w/h or float64 xy/wh) MUST replace this
 * interface repo-wide; keeping the halves means we do not INVENT a layout here.
 */
export interface HGRect {
    lo: bigint;   // register half 0 (bytes 0..7)
    hi: bigint;   // register half 1 (bytes 8..15)
}

/**
 * Forward declarations for pointer args. These stand in for real FCP types the decoder has not
 * needed to open up yet; we keep them as opaque handles so this class doesn't pretend to know
 * their layout.
 */
export type HGRenderer = { readonly __hgRendererBrand: unique symbol } | object;

/**
 * _HGRectNull — the "empty rectangle" global HGRect exported by the Ozone binary and read at
 * @Ozone 0x42428b (GetDOD's non-zero-input branch). Its numeric value is not encoded in
 * OZHCopyMaskRGBToMaskAlpha itself; it lives in the Ozone data segment. Frontier stub.
 */
export function hgRectNull(): HGRect {
    throw new Error("_HGRectNull @Ozone 0x42428b not yet transcribed (data-segment global)");
}

/**
 * HgcCopyMaskRGBToMaskAlpha::~HgcCopyMaskRGBToMaskAlpha() — base-class base-object dtor,
 * invoked by both OZH... dtors below. Frontier stub (lives in the engine layer,
 * __ZN25HgcCopyMaskRGBToMaskAlphaD2Ev, referenced from @Ozone 0x4252e5 and @Ozone 0x4252f9).
 */
export function hgcCopyMaskRGBToMaskAlphaDtor(_self: OZHCopyMaskRGBToMaskAlpha): void {
    throw new Error("HgcCopyMaskRGBToMaskAlpha::~HgcCopyMaskRGBToMaskAlpha() @Ozone 0x4252e5 not yet transcribed");
}

/**
 * HGObject::operator delete(void*) — global HGObject deleter, tail-called from D0 at
 * @Ozone 0x425307. Under a GC (TypeScript) this is a no-op; we still keep the shape so a
 * future engine-side transcription can wire it. Frontier stub for the address record.
 */
export function hgObjectOperatorDelete(_p: OZHCopyMaskRGBToMaskAlpha): void {
    throw new Error("HGObject::operator delete(void*) @Ozone 0x425307 not yet transcribed");
}

export class OZHCopyMaskRGBToMaskAlpha {
    /**
     * OZHCopyMaskRGBToMaskAlpha::GetDOD(HGRenderer*, int, HGRect) — @Ozone 0x424280.
     *
     * Line-for-line control flow of the 13-instruction routine:
     *   0x424280  movq %rcx,%rax        ; rax  <- rect.lo   (return low half = input low half)
     *   0x424283  testl %edx,%edx       ; flags <- inputIndex
     *   0x424285  je   0x42429a         ; if inputIndex == 0 -> skip to epilogue with rect
     *   0x424287  pushq %rbp / movq %rsp,%rbp
     *   0x42428b  movq  _HGRectNull(%rip),%rcx   ; rcx <- &_HGRectNull
     *   0x424292  movq  (%rcx),%rax              ; rax <- _HGRectNull[0..8]
     *   0x424295  movq  0x8(%rcx),%r8            ; r8  <- _HGRectNull[8..16]
     *   0x424299  popq %rbp
     *   0x42429a  movq %r8,%rdx          ; rdx <- return high half (either rect.hi or Null.hi)
     *   0x42429d  retq
     *
     * Semantics: for input index 0 return the caller-supplied rect verbatim; for any other input
     * index return _HGRectNull. This is the standard "single-input filter, DOD = input rect on
     * pin 0, empty otherwise" shape used across HG's per-pin Domain-of-Definition queries.
     *
     * The `renderer` and `this` pointers are received (rdi/rsi) but never read by this method —
     * confirmed by the disassembly having no loads through rdi or rsi.
     */
    getDOD(_renderer: HGRenderer, inputIndex: number, rect: HGRect): HGRect {
        // rax <- rect.lo  (unconditional, before the branch)
        let retLo: bigint = rect.lo;
        // r8   holds rect.hi at function entry
        let retHi: bigint = rect.hi;

        // testl %edx,%edx ; je 0x42429a  — branch iff inputIndex == 0
        if ((inputIndex | 0) !== 0) {
            // Non-zero input pin -> both halves come from _HGRectNull.
            const nullRect: HGRect = hgRectNull();
            retLo = nullRect.lo;      // movq (%rcx),%rax
            retHi = nullRect.hi;      // movq 0x8(%rcx),%r8
        }

        // movq %r8,%rdx ; retq
        return { lo: retLo, hi: retHi };
    }

    /**
     * OZHCopyMaskRGBToMaskAlpha::~OZHCopyMaskRGBToMaskAlpha() — @Ozone 0x4252e0.
     * Complete-object destructor (Itanium ABI's D1). Tail-jumps to the base class dtor.
     * Under TypeScript's GC there is no memory to release directly; we still call through the
     * base dtor stub so the address chain is honest and the frontier is visible.
     */
    destruct(): void {
        // jmp __ZN25HgcCopyMaskRGBToMaskAlphaD2Ev  @Ozone 0x4252e5
        hgcCopyMaskRGBToMaskAlphaDtor(this);
    }

    /**
     * OZHCopyMaskRGBToMaskAlpha::~OZHCopyMaskRGBToMaskAlpha() — @Ozone 0x4252f0.
     * Deleting destructor (Itanium ABI's D0): runs the base dtor, then hands the object to
     * HGObject::operator delete. Same rationale as D1 for the GC world.
     */
    deleteDestruct(): void {
        // callq __ZN25HgcCopyMaskRGBToMaskAlphaD2Ev  @Ozone 0x4252f9
        hgcCopyMaskRGBToMaskAlphaDtor(this);
        // jmp __ZN8HGObjectdlEPv                    @Ozone 0x425307
        hgObjectOperatorDelete(this);
    }
}
