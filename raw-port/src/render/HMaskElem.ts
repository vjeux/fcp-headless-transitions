// HMaskElem.ts — Flexo class HMaskElem.
//
// Faithful transcription of the FCP Flexo framework class HMaskElem.
//
// A thin subclass of HgcMaskElem — a single "mask element" (one shape/segment
// of a compound mask). Only 4 own methods; all real drawing/param work lives
// in HgcMaskElem. The two overridden methods here (GetDOD/GetROI) are
// IDENTICAL degenerate passthroughs of the form:
//
//     if (index >= 2) return HGRectNull;   // out-of-range port -> null
//     else            return rectArg;      // in-range        -> passthrough
//
// i.e. HMaskElem exposes exactly two output/input ports (indices 0 and 1),
// and for those ports the DOD and ROI equal the rect the caller supplied.
// This matches the base HgcMaskElem semantics (it computes real DOD/ROI
// on the input path); the HMaskElem override is just port-count gating.
//
// Provenance:
//   Binary: /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework
//           /Versions/A/Flexo (x86_64 slice).
//   Disassembly:
//     raw-port/re/disasm/Flexo.HMaskElem.GetDOD.s
//     raw-port/re/disasm/Flexo.HMaskElem.GetROI.s
//     raw-port/re/disasm/Flexo.HMaskElem.~HMaskElem.s
//
// Methods (all four addresses in the Flexo x86_64 slice):
//   HMaskElem::~HMaskElem()  (D1/D2, base dtor)   @Flexo 0x602090
//   HMaskElem::~HMaskElem()  (D0,    deleting)    @Flexo 0x6020a0
//   HMaskElem::GetDOD(HGRenderer*, int, HGRect)   @Flexo 0x6020c0
//   HMaskElem::GetROI(HGRenderer*, int, HGRect)   @Flexo 0x6020e0
//
// Callees (resolved):
//   HgcMaskElem::~HgcMaskElem()   (D2)   @Flexo 0x1470ed0
//     — tail-called by D1 dtor @0x602095; direct-called by D0 dtor @0x6020a9.
//   HGObject::operator delete(void*)     @Flexo stub 0x1496d8c
//     — tail-called by D0 dtor  @0x6020b7 (`jmp 0x1496d8c`).
//
// Data symbols (undecoded):
//   _HGRectNull    referenced by RIP-relative load @0x6020cc  (GetDOD)
//                                                 @0x6020ec  (GetROI)
//     — the 16-byte sentinel "null rectangle"; its exact bit pattern lives in
//       Flexo's __const, not yet transcribed. See HMaskCompSubtract.ts and
//       HMaskCompReplace.ts for the same frontier symbol.
//
// HGRect layout (recovered from register plumbing @0x6020c0..0x6020de and
// @0x6020e0..0x6020fe):
//   The rect enters in %rcx (lo qword) and %r8 (hi qword), leaves in
//   %rax:%rdx. The full 16 bytes are moved verbatim (see `movq %rcx, %rax`
//   @0x6020c0 and `movq %r8, %rdx` @0x6020db). Field split matches the sister
//   files (HMaskCompIntersect/Replace/Subtract): rcx = { i32 x, i32 y },
//   r8 = { i32 right, i32 bottom } — corner-form, four int32 lanes.
//
// Control flow, byte-for-byte (GetDOD @0x6020c0):
//   0x6020c0  movq   %rcx, %rax                ; rax = rectArg.lo
//   0x6020c3  cmpl   $0x2, %edx                ; edx = dir (int)
//   0x6020c6  jl     0x6020db                  ; if (dir < 2) skip null-load
//   0x6020c8  pushq  %rbp / movq %rsp,%rbp     ; frame for the null branch
//   0x6020cc  movq   [_HGRectNull(rip)], %rcx  ; rcx = &HGRectNull
//   0x6020d3  movq   (%rcx), %rax              ; rax = HGRectNull.lo
//   0x6020d6  movq   0x8(%rcx), %r8            ; r8  = HGRectNull.hi
//   0x6020da  popq   %rbp
//   0x6020db  movq   %r8, %rdx                 ; rdx = <hi>  (return regs)
//   0x6020de  retq
//
// GetROI is BIT-IDENTICAL to GetDOD except for offsets (see 0x6020e0..0x6020fe).
// Both encode the same rule: `dir >= 2 -> HGRectNull, else -> rectArg`.
//
// Note the (probably unintentional) small quirk in the emitted code: the
// null-branch pushes/pops %rbp inside the taken side, so the frame is only
// established when we actually load HGRectNull. That is a codegen artifact
// with no observable effect; we do not model it.

// ---------------------------------------------------------------------------
// Frontier stubs — external types/functions HMaskElem depends on. A loud gap
// is correct; a plausible guess is a defect (PORTING_SPEC Rule 3).
// ---------------------------------------------------------------------------

/**
 * HGRect — 4×int32, returned by value in %rax:%rdx (16 bytes). Layout
 * recovered from the register plumbing in GetDOD/GetROI: rcx = { x, y },
 * r8 = { right, bottom } (all i32, corner-form).
 *
 * Kept structurally compatible with the sister files' HGRect (fields left
 * unnamed here beyond the two dword pairs, since HMaskElem itself never
 * touches the fields — it moves the whole 16-byte value).
 */
export interface HGRect {
  /** low qword, dword 0 (i32) — recovered as `x` in HMaskCompIntersect */
  readonly x: number;
  /** low qword, dword 1 (i32) — recovered as `y` */
  readonly y: number;
  /** high qword, dword 0 (i32) — recovered as `right` (exclusive corner) */
  readonly right: number;
  /** high qword, dword 1 (i32) — recovered as `bottom` (exclusive corner) */
  readonly bottom: number;
}

/**
 * HGRenderer — opaque forward-declared type. HMaskElem's own methods never
 * dereference it (it enters in %rdi/%rsi and is not touched between prologue
 * and epilogue; the parameter exists only for virtual-signature parity with
 * HgcMaskElem).
 */
export interface HGRenderer { readonly __hgRenderer?: never }

/**
 * HgcMaskElem — base class. HMaskElem overrides exactly its dtor + GetDOD +
 * GetROI; every other virtual (Bind, GetParameter, RenderTile, ...) is
 * inherited unchanged. Its own transcription is the responsibility of a
 * separate worktree; we surface only the hook the HMaskElem dtor invokes.
 */
export interface HgcMaskElem {
  /**
   * HgcMaskElem::~HgcMaskElem() (D2) @Flexo 0x1470ed0 — base destructor.
   * Called both by the HMaskElem D1 dtor (tail-call @0x602095) and by the
   * HMaskElem D0 dtor (direct call @0x6020a9). Body not yet transcribed.
   */
  __dtor_base(): void;
}

/**
 * _HGRectNull — Flexo data symbol referenced by GetDOD @0x6020cc and by
 * GetROI @0x6020ec via RIP-relative literal-pool loads. The 16 bytes at
 * that address encode the "null rectangle" sentinel; a faithful port must
 * read them from the binary. Same frontier as in the sister mask files.
 *
 * Not synthesized here so that whoever ports _HGRectNull (Flexo data) —
 * or HGRectIsNull @Flexo stub — decides the bit pattern once, in one place.
 */
export function HGRectNull(): HGRect {
  // @Flexo _HGRectNull (data symbol; RIP-loaded at 0x6020cc / 0x6020ec).
  throw new Error(
    "HGRectNull @Flexo _HGRectNull (data symbol referenced at 0x6020cc / 0x6020ec) not yet transcribed",
  );
}

/**
 * HGObject::operator delete(void*) — Flexo symbol stub @Flexo 0x1496d8c.
 * Tail-jumped-to by the HMaskElem D0 dtor @0x6020b7. In TS we don't manage
 * raw memory; the symbol is surfaced only as a decoded frontier.
 */
export function HGObject_operator_delete(_p: unknown): void {
  // @Flexo 0x1496d8c — external stub, body not yet transcribed.
  throw new Error("HGObject::operator delete @Flexo 0x1496d8c not yet transcribed");
}

// ---------------------------------------------------------------------------
// HMaskElem — the class this file transcribes. Structurally identical to its
// base HgcMaskElem; the only override footprint is the dtor + GetDOD/GetROI.
// ---------------------------------------------------------------------------

/**
 * HMaskElem — Flexo mask element (one shape/segment of a compound mask).
 *
 * Struct layout is inherited unchanged from HgcMaskElem — the HMaskElem
 * subclass adds no fields of its own. Evidence: neither the D0 nor the D1
 * dtor references any offset off `%rdi` before/after the base-dtor call
 * (see 0x6020a0..0x6020b7 — only `movq %rdi, %rbx` / restore, then the two
 * calls). If HMaskElem owned member fields it would clean them up here.
 *
 * Vtable footprint (from the four own methods): slots for GetDOD and GetROI
 * differ from HgcMaskElem's; the dtor pair (D0/D1) occupies the standard
 * two dtor slots. All other virtuals fall through to HgcMaskElem.
 */
export interface HMaskElem extends HgcMaskElem {}

// ---------------------------------------------------------------------------
// HMaskElem::~HMaskElem() (D1/D2, base dtor) @Flexo 0x602090
//   Faithful to raw-port/re/disasm/Flexo.HMaskElem.~HMaskElem.s (and the
//   sibling D1Ev shown by symmap):
//     0x602090  pushq  %rbp
//     0x602091  movq   %rsp, %rbp
//     0x602094  popq   %rbp
//     0x602095  jmp    HgcMaskElem::~HgcMaskElem()  ; tail-call, @0x1470ed0
// ---------------------------------------------------------------------------

/**
 * HMaskElem::~HMaskElem() (D1) @Flexo 0x602090 — base destructor.
 * Empty own body; tail-calls HgcMaskElem::~HgcMaskElem() @Flexo 0x1470ed0.
 */
export function HMaskElem_dtor(self: HMaskElem): void {
  // @0x602095 jmp __ZN11HgcMaskElemD2Ev — HgcMaskElem::~HgcMaskElem().
  self.__dtor_base();
}

// ---------------------------------------------------------------------------
// HMaskElem::~HMaskElem() (D0, deleting dtor) @Flexo 0x6020a0
//   Faithful to raw-port/re/disasm/Flexo.HMaskElem.~HMaskElem.s:
//     0x6020a0  pushq  %rbp
//     0x6020a1  movq   %rsp, %rbp
//     0x6020a4  pushq  %rbx
//     0x6020a5  pushq  %rax
//     0x6020a6  movq   %rdi, %rbx              ; save `this`
//     0x6020a9  callq  HgcMaskElem::~HgcMaskElem()   ; @0x1470ed0
//     0x6020ae  movq   %rbx, %rdi              ; restore `this`
//     0x6020b1  addq   $0x8, %rsp
//     0x6020b5  popq   %rbx
//     0x6020b6  popq   %rbp
//     0x6020b7  jmp    HGObject::operator delete(void*)   ; stub @0x1496d8c
// ---------------------------------------------------------------------------

/**
 * HMaskElem::~HMaskElem() (D0) @Flexo 0x6020a0 — deleting destructor.
 * Runs the base HgcMaskElem dtor, then tail-jumps to HGObject::operator
 * delete on the object pointer. In TypeScript there is no manual free; we
 * surface both hooks for parity with the disassembly.
 */
export function HMaskElem_dtor_deleting(self: HMaskElem): void {
  // @0x6020a9 callq __ZN11HgcMaskElemD2Ev — HgcMaskElem::~HgcMaskElem().
  self.__dtor_base();
  // @0x6020b7 jmp __ZN8HGObjectdlEPv — HGObject::operator delete(void*).
  HGObject_operator_delete(self);
}

// ---------------------------------------------------------------------------
// HMaskElem::GetDOD(HGRenderer*, int, HGRect) @Flexo 0x6020c0
//   Faithful to raw-port/re/disasm/Flexo.HMaskElem.GetDOD.s:
//     if (dir < 2) return rectArg;
//     else         return _HGRectNull;
//
//   The `renderer` argument (rdi) and `this` (rsi) are unused — the branch
//   is purely on `dir` (edx). The rect enters in {rcx, r8} and leaves in
//   {rax, rdx}; the "keep it" path is one register move (rcx->rax) and the
//   epilogue's rdx<-r8.
// ---------------------------------------------------------------------------

/**
 * HMaskElem::GetDOD(renderer, dir, rect) @Flexo 0x6020c0.
 *
 * @param _renderer  Ignored (accepted for vtable-signature parity; disasm
 *                   never dereferences rdi in this method).
 * @param dir        Port index (int, from edx). `dir < 2` returns `rect`;
 *                   `dir >= 2` returns `HGRectNull`.
 * @param rect       The rectangle carried through on the in-range path.
 */
export function HMaskElem_GetDOD(
  _renderer: HGRenderer,
  dir: number,
  rect: HGRect,
): HGRect {
  // @0x6020c3  cmpl $0x2, %edx
  // @0x6020c6  jl   0x6020db     — the "return rect" fast path.
  if (dir < 2) {
    // @0x6020c0  movq %rcx, %rax     ; rax = rectArg.lo (x, y)
    // @0x6020db  movq %r8,  %rdx     ; rdx = rectArg.hi (right, bottom)
    return rect;
  }
  // @0x6020cc  movq [_HGRectNull(rip)], %rcx
  // @0x6020d3  movq (%rcx),   %rax    ; rax = HGRectNull.lo
  // @0x6020d6  movq 0x8(%rcx), %r8    ; r8  = HGRectNull.hi
  // @0x6020db  movq %r8, %rdx         ; return {rax, rdx}
  return HGRectNull();
}

// ---------------------------------------------------------------------------
// HMaskElem::GetROI(HGRenderer*, int, HGRect) @Flexo 0x6020e0
//   Faithful to raw-port/re/disasm/Flexo.HMaskElem.GetROI.s — BIT-IDENTICAL
//   to GetDOD save for offsets:
//     0x6020e0  movq   %rcx, %rax
//     0x6020e3  cmpl   $0x2, %edx
//     0x6020e6  jl     0x6020fb
//     0x6020e8  pushq  %rbp / movq %rsp,%rbp
//     0x6020ec  movq   [_HGRectNull(rip)], %rcx
//     0x6020f3  movq   (%rcx),   %rax
//     0x6020f6  movq   0x8(%rcx), %r8
//     0x6020fa  popq   %rbp
//     0x6020fb  movq   %r8, %rdx
//     0x6020fe  retq
//
//   Same rule: `dir >= 2 -> HGRectNull, else -> rectArg`.
// ---------------------------------------------------------------------------

/**
 * HMaskElem::GetROI(renderer, dir, rect) @Flexo 0x6020e0.
 *
 * @param _renderer  Ignored (see GetDOD).
 * @param dir        Port index. `dir < 2` returns `rect`; else `HGRectNull`.
 * @param rect       The rectangle carried through on the in-range path.
 */
export function HMaskElem_GetROI(
  _renderer: HGRenderer,
  dir: number,
  rect: HGRect,
): HGRect {
  // @0x6020e3  cmpl $0x2, %edx
  // @0x6020e6  jl   0x6020fb     — passthrough path.
  if (dir < 2) {
    // @0x6020e0  movq %rcx, %rax
    // @0x6020fb  movq %r8,  %rdx
    return rect;
  }
  // @0x6020ec  movq [_HGRectNull(rip)], %rcx  (then unpack into {rax, rdx})
  return HGRectNull();
}
