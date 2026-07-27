// OZHCopyMaskAlphaToMaskRGB.ts — Ozone helper node that copies a mask's alpha
// channel out into an RGB-encoded mask (name says it all: copy mask alpha ->
// mask RGB). It is a thin subclass of `HgcCopyMaskAlphaToMaskRGB` (base class
// in the same framework; the base holds the actual pixel-copy state and the
// virtual-dispatch table). This file transcribes only the three
// OZHCopyMaskAlphaToMaskRGB methods that Apple emitted in the Ozone binary:
// the DOD (domain-of-definition) query and the two variants of the dtor
// (D1 in-place / D0 deleting).
//
// Transcribed from FCP Ozone framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
// See raw-port/re/disasm/OZHCopyMaskAlphaToMaskRGB.GetDOD.s,
//     raw-port/re/disasm/OZHCopyMaskAlphaToMaskRGB.D1.s,
// and raw-port/re/disasm/OZHCopyMaskAlphaToMaskRGB.~OZHCopyMaskAlphaToMaskRGB.s
// for the full x86_64 disassembly reproduced below.
//
// Data types the ABI reveals (only what this class actually touches):
//   - HGRect: a 16-byte struct passed/returned in the two "byval class ≤ 16 B"
//     register slots. On this ABI a value-type HGRect argument occupies the
//     next two integer arg registers as (low8, high8); a returned HGRect is
//     placed in (rax, rdx). This class does no arithmetic on the rect — it
//     just forwards the passed-in rect or replaces it with the extern global
//     _HGRectNull (imported unresolved from HGCore — `U _HGRectNull` in nm).
//     Because the internal HGRect layout is not decoded here, we model it as
//     an opaque 16-byte carrier {lo: bigint; hi: bigint} matching the two
//     8-byte halves the disasm loads/returns. That is the exact shape the
//     binary manipulates; any structural interpretation is deferred to the
//     HGRect class itself (frontier).
//   - HGRenderer*: an opaque pointer, unused by this method (rsi is never
//     read after the prologue).
//   - `int` output-index argument (edx): a signed int the disasm compares
//     against 2 with a signed jl. Match with number.
//
// No numeric constants are read from the __TEXT __const segment of Ozone in
// this class; the only literal is `$0x2` (the number of outputs of this
// helper node, embedded directly in the `cmpl` immediate). Every other
// magic address in the disasm is a RIP-relative reference to _HGRectNull
// (an imported symbol) which we model as a module-level opaque handle.

/**
 * HGRect — opaque 16-byte value type, modeled as the two 8-byte halves the
 * disasm actually loads and returns. The disasm proves nothing about the
 * internal layout beyond "sizeof == 16 bytes, passed/returned as two 8-byte
 * integer register slots" (movq (%rcx),%rax ; movq 0x8(%rcx),%r8). Any
 * structural interpretation (origin/size fields, float vs int) is the
 * responsibility of the HGRect class itself and is NOT decoded here.
 *
 * We use bigint for the two halves because they are opaque 64-bit blobs and
 * we do not want silent precision loss if any half encodes a value >= 2^53.
 */
export interface HGRect {
  /** low 8 bytes of the value (loaded via movq (%rcx),%rax) */
  lo: bigint;
  /** high 8 bytes of the value (loaded via movq 0x8(%rcx),%r8) */
  hi: bigint;
}

/**
 * Extern global `_HGRectNull` (defined outside Ozone — nm reports
 * `U _HGRectNull`, i.e. an imported symbol resolved by HGCore at load time).
 * The Ozone binary reaches it via a RIP-relative movq at 0x42426c:
 *     movq 0x3fcaad(%rip), %rcx     ## literal pool symbol address: _HGRectNull
 * i.e. rcx ends up pointing at the storage for the extern _HGRectNull, then
 * the two 8-byte halves are loaded. HGRectNull's actual bit pattern lives in
 * HGCore (an undecoded frontier framework), so this accessor throws with the
 * @Ozone RIP-relative-load address so frontier.py can enumerate the gap. See
 * porting-spec Rule 3.
 */
export function getHGRectNull(): HGRect {
  // @extern _HGRectNull (imported by Ozone at 0x42426c via RIP-rel movq;
  // defined in HGCore — see `nm -arch x86_64 Ozone | grep HGRectNull` -> `U _HGRectNull`)
  throw new Error(
    "_HGRectNull @extern (imported by Ozone at 0x42426c; defined in HGCore) not yet transcribed",
  );
}

/**
 * HGRenderer — opaque forward-declared pointer type. Not dereferenced by any
 * OZHCopyMaskAlphaToMaskRGB method (rsi is never read after the prologue in
 * GetDOD, and the dtors don't take an HGRenderer at all).
 */
export type HGRendererPtr = unknown;

/**
 * HgcCopyMaskAlphaToMaskRGB base-class destructor D2 (base-object dtor).
 * @Ozone 0x00000000004252c9 (callq target from OZHCopyMaskAlphaToMaskRGB::~D0)
 * Symbol: __ZN25HgcCopyMaskAlphaToMaskRGBD2Ev
 *
 * Not transcribed in this class — HgcCopyMaskAlphaToMaskRGB is a separate FCP
 * class (base class of OZHCopyMaskAlphaToMaskRGB) with its own file. Porting
 * spec Rule 3: undecoded callees throw a citation-carrying stub.
 */
function hgcCopyMaskAlphaToMaskRGBDestroyBase(_this: OZHCopyMaskAlphaToMaskRGB): void {
  throw new Error(
    "HgcCopyMaskAlphaToMaskRGB::~HgcCopyMaskAlphaToMaskRGB() (D2) @Ozone 0x004252c9 not yet transcribed",
  );
}

/**
 * HGObject::operator delete(void*) — Apple's HGObject allocator hook.
 * @Ozone 0x00000000006def6a (symbol stub for __ZN8HGObjectdlEPv)
 *
 * Tail-called from the D0 (deleting) destructor. In TS we have GC, so the
 * "free the storage" step is a no-op semantically; but per porting spec we
 * throw if the FCP binary would meaningfully rely on this call (e.g. custom
 * allocator side-effects). None are decoded, so we deliberately keep this as
 * a no-op with a citation, matching the pattern already used for D0 dtors
 * elsewhere in the port (see OZIdentityTimeStrategy::destroyAndDelete).
 */
function hgObjectOperatorDelete(_p: OZHCopyMaskAlphaToMaskRGB): void {
  // @Ozone 0x004252d7  jmp 0x6def6a  ## symbol stub for: __ZN8HGObjectdlEPv
  //                                     -> HGObject::operator delete(void*)
  // TS is GC'd; no allocator side-effect is decoded, so this is a no-op.
}

/**
 * OZHCopyMaskAlphaToMaskRGB — Ozone helper node that copies a mask's alpha
 * channel into an RGB-encoded mask output. The three methods below are the
 * only ones the Ozone binary emits for this class; the pixel-copy work
 * itself lives in the base class `HgcCopyMaskAlphaToMaskRGB` (frontier).
 *
 * Instance layout: not directly observed in the three transcribed methods
 * (only `this` (rdi) is used, and only to hand to the base-class dtor and
 * to `operator delete`). Any fields live on the base class HgcCopyMask-
 * AlphaToMaskRGB and are not accessed from this subclass here.
 */
export class OZHCopyMaskAlphaToMaskRGB {
  /**
   * OZHCopyMaskAlphaToMaskRGB::GetDOD(HGRenderer*, int, HGRect)
   * @Ozone 0x0000000000424260
   * Mangled: __ZN25OZHCopyMaskAlphaToMaskRGB6GetDODEP10HGRendereri6HGRect
   *
   * Domain-of-definition query. For a node with N outputs, GetDOD tells the
   * renderer, for output `outputIndex` and an input DOD `inRect`, what
   * region of that output has defined pixels. This node has exactly 2
   * outputs (0..1): for those, the output DOD equals the input DOD (the
   * mask-alpha->mask-rgb copy neither expands nor shrinks the covered
   * region — a pixel present on input contributes one pixel to output).
   * For any output index >= 2 (out-of-range for this node), the DOD is
   * HGRectNull (empty rect).
   *
   * Disasm (x86_64 sysv abi):
   *   rdi = this
   *   rsi = HGRenderer*                     (never read — ignored)
   *   edx = outputIndex (signed int)
   *   rcx = inRect.lo   (low 8 bytes of the HGRect argument)
   *   r8  = inRect.hi   (high 8 bytes of the HGRect argument)
   *   Return: HGRect in (rax, rdx) — rax = out.lo, rdx = out.hi
   *
   *   0x424260  mov    rax, rcx                ; rax = inRect.lo         (preseed return.lo = input)
   *   0x424263  cmp    edx, 0x2                ; compare outputIndex, 2
   *   0x424266  jl     0x42427b                ; if outputIndex < 2  -> passthrough tail
   *   0x424268  push   rbp
   *   0x424269  mov    rbp, rsp
   *   0x42426c  mov    rcx, [rip + 0x3fcaad]   ; rcx = &_HGRectNull  (extern global from HGCore)
   *   0x424273  mov    rax, [rcx]              ; rax = _HGRectNull.lo   (override return.lo)
   *   0x424276  mov    r8,  [rcx + 0x8]        ; r8  = _HGRectNull.hi
   *   0x42427a  pop    rbp
   *   0x42427b  mov    rdx, r8                 ; rdx = return.hi (either inRect.hi or _HGRectNull.hi)
   *   0x42427e  ret
   *
   * Control flow: exactly one branch (jl outputIndex < 2). Both paths write
   * `return.lo` into rax and `return.hi` into rdx via r8; the branch chooses
   * whether they come from `inRect` (rcx / r8, i.e. the passed-in rect) or
   * from the extern _HGRectNull.
   *
   * @param _renderer  HGRenderer* — ignored by this method (matches disasm).
   * @param outputIndex signed int output index.
   * @param inRect     input DOD rect for this output (16-byte HGRect).
   * @returns          the output DOD rect: `inRect` if outputIndex < 2, else _HGRectNull.
   */
  GetDOD(
    _renderer: HGRendererPtr,
    outputIndex: number,
    inRect: HGRect,
  ): HGRect {
    // Mirror the two-path structure of the asm exactly.
    // Signed comparison; outputIndex is `int` (edx) in FCP's signature.
    if (outputIndex < 2) {
      // jl 0x42427b — passthrough. rax was pre-seeded to rcx (inRect.lo) at
      // the top of the function; r8 still holds the caller-supplied
      // inRect.hi. So return.lo = inRect.lo, return.hi = inRect.hi.
      return { lo: inRect.lo, hi: inRect.hi };
    }
    // Fall-through: load _HGRectNull's two halves and return that.
    // @Ozone 0x42426c: mov rcx, [rip + 0x3fcaad]  ## _HGRectNull
    // @Ozone 0x424273: mov rax, [rcx]             (return.lo = _HGRectNull.lo)
    // @Ozone 0x424276: mov r8,  [rcx + 0x8]       (return.hi = _HGRectNull.hi)
    // @Ozone 0x42427b: mov rdx, r8                (place high half into return slot)
    const rectNull = getHGRectNull();
    return { lo: rectNull.lo, hi: rectNull.hi };
  }

  /**
   * OZHCopyMaskAlphaToMaskRGB::~OZHCopyMaskAlphaToMaskRGB()  (D1, in-place dtor)
   * @Ozone 0x00000000004252b0
   * Mangled: __ZN25OZHCopyMaskAlphaToMaskRGBD1Ev
   *
   * Disasm:
   *   0x4252b0  push rbp
   *   0x4252b1  mov  rbp, rsp
   *   0x4252b4  pop  rbp
   *   0x4252b5  jmp  __ZN25HgcCopyMaskAlphaToMaskRGBD2Ev
   *               ; -> HgcCopyMaskAlphaToMaskRGB::~HgcCopyMaskAlphaToMaskRGB() (D2)
   *   0x4252ba  nopw (%rax,%rax)
   *
   * Pure tail-call to the base-class D2 (base-object) destructor — the
   * subclass has NO own fields to destroy, so D1 is trivially "run the base
   * dtor then return". TS is GC'd, so there is nothing to free at the
   * language level; the base-class dtor is the frontier callee.
   */
  destroyInPlace(): void {
    // @Ozone 0x4252b5: jmp __ZN25HgcCopyMaskAlphaToMaskRGBD2Ev
    hgcCopyMaskAlphaToMaskRGBDestroyBase(this);
  }

  /**
   * OZHCopyMaskAlphaToMaskRGB::~OZHCopyMaskAlphaToMaskRGB()  (D0, deleting dtor)
   * @Ozone 0x00000000004252c0
   * Mangled: __ZN25OZHCopyMaskAlphaToMaskRGBD0Ev
   *
   * Disasm:
   *   0x4252c0  push rbp
   *   0x4252c1  mov  rbp, rsp
   *   0x4252c4  push rbx
   *   0x4252c5  push rax                                ; align stack
   *   0x4252c6  mov  rbx, rdi                           ; rbx = this  (save across call)
   *   0x4252c9  call __ZN25HgcCopyMaskAlphaToMaskRGBD2Ev ; HgcCopyMaskAlphaToMaskRGB::~D2()
   *   0x4252ce  mov  rdi, rbx                           ; rdi = this (for operator delete)
   *   0x4252d1  add  rsp, 0x8                           ; undo align
   *   0x4252d5  pop  rbx
   *   0x4252d6  pop  rbp
   *   0x4252d7  jmp  0x6def6a                           ; symbol stub -> HGObject::operator delete(void*)
   *
   * Sequence: run the base-class D2 destructor on `this`, then tail-call
   * HGObject::operator delete(this) to free the storage. NOTE this class's
   * D0 does NOT call its own D1 — because D1's body is a pure tail-call to
   * the base D2, the compiler collapsed it: D0 calls base D2 directly, then
   * `operator delete`. That is exactly the "empty subclass dtor" idiom.
   *
   * TS is GC'd; the `operator delete` step is not modeled (see
   * hgObjectOperatorDelete above for the citation).
   */
  destroyAndDelete(): void {
    // @Ozone 0x4252c9: call __ZN25HgcCopyMaskAlphaToMaskRGBD2Ev
    hgcCopyMaskAlphaToMaskRGBDestroyBase(this);
    // @Ozone 0x4252d7: jmp 0x6def6a  ## HGObject::operator delete(void*)
    hgObjectOperatorDelete(this);
  }
}
