// OZHeCanvas.ts
// Faithful raw-port of Ozone::OZHeCanvas.
//
// Source: Ozone framework (macOS FCP), x86_64 slice.
//   Disassembly stashed under raw-port/re/disasm/OZHeCanvas.*.s
//
// Ports (all six methods listed by claim.py):
//   - OZHeCanvas::GetDOD(HGRenderer*, int, HGRect)      @0x5a7150
//   - OZHeCanvas::GetROI(HGRenderer*, int, HGRect)      @0x5a7170
//   - OZHeCanvas::SetBound(PCRect<int> const&)          @0x5a7190
//   - OZHeCanvas::SetRect(PCRect<int> const&)           @0x5a71c0
//   - OZHeCanvas::~OZHeCanvas() [D1, base]              @0x5a7200
//   - OZHeCanvas::~OZHeCanvas() [D0, deleting]          @0x5a7210
//
// Class hierarchy — read directly off the destructor bodies:
//     HgcCanvas             (primary base; owns the class vtable at offset 0)
//     └── OZHeCanvas        (adds a boundary HGRect at this+0x1a0)
//   Both dtors tail-jmp to `HgcCanvas::~HgcCanvas()` (D2), and D0 additionally
//   frees storage via `HGObject::operator delete(void*)` (__ZN8HGObjectdlEPv @0x6def6a).
//
// Object layout (only fields the six methods actually touch):
//   0x000  primary vptr — SetBound reads it (movq (%rdi), %rax) to dispatch a
//          virtual method at slot +0x60. Not otherwise modeled here.
//   0x1a0  HGRect boundary (16 bytes; two 64-bit halves). Written by SetRect
//          @0x5a71df/@0x5a71e6, read by GetROI @0x5a717c/@0x5a7183 when the
//          `int` arg equals 1.
//
// Every load/store and callq is cited by @0xADDR in the method bodies.

import { HGObject_dtor } from "../render/HGObject_stub.js";
import type { HGRect } from "../render/HGRect.js";
import { HGRectInfinite, HGRectMake4i } from "../render/HGRect.js";

// ---------------------------------------------------------------------------
// Nominal / opaque frontier types.
// ---------------------------------------------------------------------------

/**
 * Opaque HGRenderer pointer — the 1st non-`this` argument of GetDOD and GetROI.
 * Neither body reads it (edx / rcx / r8 are used in-place); we keep it nominal.
 */
export type HGRendererPtr = unknown;

/**
 * PCRect<int> — a 4-int32 axis-aligned rectangle passed by const reference to
 * SetBound and SetRect. Offsets used by the disassembly (both methods):
 *   +0x00  x  (int32, little-endian)
 *   +0x04  y  (int32)
 *   +0x08  w  (int32; SetBound does `w += x` in-register to get right-edge, and
 *              SetRect does the same to feed HGRectMake4i)
 *   +0x0c  h  (int32; same treatment for the bottom edge)
 * All four are read at natural alignment; nothing is written.
 */
export interface PCRectInt {
  x: number;
  y: number;
  w: number;
  h: number;
}

// ---------------------------------------------------------------------------
// Undecoded frontier callees — throwing stubs, cited with @0xADDR.
// ---------------------------------------------------------------------------

/**
 * HgcCanvas::~HgcCanvas() — primary base destructor.
 *
 * Symbol: __ZN9HgcCanvasD2Ev.
 * Tail-jmp'd from D1 @0x5a7205 (`popq %rbp; jmp __ZN9HgcCanvasD2Ev`) and
 * called from D0 @0x5a7219 with `rdi = this` before the operator-delete tail.
 *
 * A throwing stub — HgcCanvas is not yet ported (@0x5a7205, @0x5a7219).
 */
function HgcCanvas_D2(_self: OZHeCanvas): void {
  throw new Error(
    "raw-port: HgcCanvas::~HgcCanvas() [D2] is not yet ported " +
      "(callq/jmp @0x5a7205, @0x5a7219 → __ZN9HgcCanvasD2Ev)",
  );
}

/**
 * HGObject::operator delete(void*) — HG-owned deallocator.
 *
 * Symbol: __ZN8HGObjectdlEPv (call target 0x6def6a — symbol stub).
 * Tail-jmp'd from D0 @0x5a7227 with `rdi = this` to release the storage after
 * the base HgcCanvas destructor has torn down the subobject state.
 *
 * We route this through the shared HGObject_stub to keep the frontier explicit.
 */
function HGObject_operator_delete(self: object): void {
  // Throwing stub — HGObject::operator delete(void*) not yet ported
  // (jmp @0x5a7227 → 0x6def6a symbol stub __ZN8HGObjectdlEPv).
  HGObject_dtor(self);
}

/**
 * OZHeCanvas::vfn(0x60) — the "commit a floating-point AABB to the canvas"
 * virtual, reached only from SetBound @0x5a71bc via `jmpq *0x60(vtable(this))`.
 *
 * Argument marshalling at the call site (all set up in-line just before the
 * indirect jmp, verified by reading @0x5a7194..@0x5a71bc):
 *   rdi = this                              (unchanged from method entry)
 *   esi = 4                                 (@0x5a71b6 — an integer tag,
 *                                             likely a "which bound to set" enum;
 *                                             its meaning is not decoded here)
 *   xmm0 = cvtsi2ss (int32)(pcrect->x)      (@0x5a7196)
 *   xmm1 = cvtsi2ss (int32)(pcrect->y)      (@0x5a719d)
 *   xmm2 = cvtsi2ss (int32)(pcrect->x + pcrect->w)   (@0x5a71a1..@0x5a71a4)
 *   xmm3 = cvtsi2ss (int32)(pcrect->y + pcrect->h)   (@0x5a71a8..@0x5a71ab)
 *   *(rax at slot 0x60 in *(void**)this)    (@0x5a71af..@0x5a71b2, @0x5a71bc)
 *
 * Signature (Itanium ABI):
 *   virtual <ret> OZHeCanvas::vfn0x60(int32_t tag,
 *                                     float x0, float y0, float x1, float y1);
 *
 * The return value is passed through unchanged (SetBound is a tail-jmp, so
 * whatever this virtual returns is what SetBound returns). We surface a
 * throwing stub — the concrete virtual isn't yet ported.
 */
function OZHeCanvas_vfn_0x60(
  _self: OZHeCanvas,
  _tag: number,
  _x0: number,
  _y0: number,
  _x1: number,
  _y1: number,
): unknown {
  throw new Error(
    "raw-port: OZHeCanvas::(virtual vtable slot +0x60) is not yet ported " +
      "(jmpq @0x5a71bc → *0x60(vtable(this)))",
  );
}

// ---------------------------------------------------------------------------
// OZHeCanvas
// ---------------------------------------------------------------------------

/**
 * OZHeCanvas — a Helium/HgcCanvas subclass that carries a per-instance boundary
 * HGRect at +0x1a0 and forwards SetBound through the vtable to the HgcCanvas
 * primary hook at slot +0x60.
 *
 * Only fields the six ported methods touch are modeled. The HgcCanvas base
 * subobject is present as an opaque field so composition is explicit.
 */
export class OZHeCanvas {
  /**
   * @0x1a0 — the current boundary rectangle in Helium HGRect layout. Written
   * by SetRect @0x5a71df/@0x5a71e6 and read by GetROI @0x5a717c/@0x5a7183 in
   * the `int == 1` branch. Initial value in the binary is not observed by any
   * of these methods (they only read after SetRect has written); we default it
   * to `HGRectInfinite` (16-byte all-INT_MAX/INT_MIN pattern) so unpopulated
   * canvases behave like a "no clipping" ROI — matching `_HGRectInfinite`,
   * which is the constant GetDOD returns unconditionally.
   */
  public boundary: HGRect = { ...HGRectInfinite };

  /**
   * OZHeCanvas::GetDOD(HGRenderer*, int, HGRect) @0x5a7150
   *
   * Full body (mirrored exactly):
   *   @0x5a7154  rcx = literal-pool ptr → _HGRectInfinite       (RIP-relative)
   *   @0x5a715b  rax = *(uint64_t*)(rcx + 0x00)                — HGRect.lo
   *   @0x5a715e  rdx = *(uint64_t*)(rcx + 0x08)                — HGRect.hi
   *   @0x5a7163  retq
   *
   * Returns `_HGRectInfinite` unconditionally. `this`, HGRenderer*, the `int`
   * arg, and the incoming HGRect are all ignored. Provenance: the RIP-relative
   * reference at @0x5a7154 is disassembled as
   * "literal pool symbol address: _HGRectInfinite", matching the Helium port's
   * `HGRectInfinite` constant.
   */
  GetDOD(_renderer: HGRendererPtr, _flags: number, _hint: HGRect): HGRect {
    // @0x5a715b/@0x5a715e: return _HGRectInfinite (both 64-bit halves).
    return { ...HGRectInfinite };
  }

  /**
   * OZHeCanvas::GetROI(HGRenderer*, int, HGRect) @0x5a7170
   *
   * Full body (mirrored exactly):
   *   @0x5a7174  rax = rcx        — default return.lo = incoming HGRect.lo
   *   @0x5a7177  cmpl $1, %edx
   *   @0x5a717a  jne  0x5a718a   — skip the override branch if flag != 1
   *   @0x5a717c  rax = *(uint64_t*)(this + 0x1a0)               — stored.lo
   *   @0x5a7183  r8  = *(uint64_t*)(this + 0x1a8)               — stored.hi
   *   @0x5a718a  rdx = r8         — return.hi = r8 (either incoming.hi or stored.hi)
   *   @0x5a718e  retq
   *
   * `HGRenderer*` (rsi) is never read. The `int flag` (edx) selects between:
   *   - flag != 1: return the incoming HGRect unchanged
   *   - flag == 1: return this->boundary (the SetRect-populated HGRect at +0x1a0)
   */
  GetROI(_renderer: HGRendererPtr, flag: number, hint: HGRect): HGRect {
    // @0x5a7174: default = incoming HGRect.
    // @0x5a7177..@0x5a718a: override with the stored boundary iff flag == 1.
    if ((flag | 0) === 1) {
      // @0x5a717c/@0x5a7183: copy both halves out of this->boundary.
      return { ...this.boundary };
    }
    return { ...hint };
  }

  /**
   * OZHeCanvas::SetBound(PCRect<int> const&) @0x5a7190
   *
   * Full body:
   *   @0x5a7194  eax = pcrect->x        (movl (%rsi), %eax)
   *   @0x5a7196  xmm0 = cvtsi2ss eax    (int32 → float32, HW-truncating widen)
   *   @0x5a719a  ecx = pcrect->y        (movl 0x4(%rsi), %ecx)
   *   @0x5a719d  xmm1 = cvtsi2ss ecx
   *   @0x5a71a1  eax += pcrect->w       (addl 0x8(%rsi), %eax)    — right edge
   *   @0x5a71a4  xmm2 = cvtsi2ss eax
   *   @0x5a71a8  ecx += pcrect->h       (addl 0xc(%rsi), %ecx)    — bottom edge
   *   @0x5a71ab  xmm3 = cvtsi2ss ecx
   *   @0x5a71af  rax = *(void**)this                              — primary vptr
   *   @0x5a71b2  rax = *(void**)(vptr + 0x60)                     — vfn slot
   *   @0x5a71b6  esi = 4                                          — tag argument
   *   @0x5a71bc  jmpq *rax                                        — tail-call
   *
   * Since this is a `jmpq *rax`, the return value of vfn(0x60) IS SetBound's
   * return value. We reflect that by returning whatever the vfn returns.
   *
   * Numeric semantics: the int32 → float32 conversions use HW cvtsi2ss, which
   * for the small ranges typical of pixel coordinates is exact; we use
   * `Math.fround(value | 0)` to force a single-precision round-trip that
   * matches cvtsi2ss on every representable int32 (JS's `| 0` yields exact
   * int32; `Math.fround` narrows to IEEE-754 f32).
   */
  SetBound(pcrect: PCRectInt): unknown {
    // @0x5a7194..@0x5a7196: xmm0 = float32(x)
    const x0 = Math.fround(pcrect.x | 0);
    // @0x5a719a..@0x5a719d: xmm1 = float32(y)
    const y0 = Math.fround(pcrect.y | 0);
    // @0x5a71a1..@0x5a71a4: xmm2 = float32(x + w)  (integer add before the widen)
    const x1 = Math.fround(((pcrect.x | 0) + (pcrect.w | 0)) | 0);
    // @0x5a71a8..@0x5a71ab: xmm3 = float32(y + h)  (integer add before the widen)
    const y1 = Math.fround(((pcrect.y | 0) + (pcrect.h | 0)) | 0);
    // @0x5a71b6: esi = 4 (tag)
    // @0x5a71bc: tail-jmp *0x60(primary vtable) with (this, 4, x0, y0, x1, y1).
    return OZHeCanvas_vfn_0x60(this, 4 | 0, x0, y0, x1, y1);
  }

  /**
   * OZHeCanvas::SetRect(PCRect<int> const&) @0x5a71c0
   *
   * Full body:
   *   @0x5a71c9  edi = pcrect->x     (movl (%rsi), %edi)          — arg1 to HGRectMake4i
   *   @0x5a71cb  eax = pcrect->y     (movl 0x4(%rsi), %eax)
   *   @0x5a71ce  edx = pcrect->w     (movl 0x8(%rsi), %edx)
   *   @0x5a71d1  edx += edi                                       — arg3 = x + w (right)
   *   @0x5a71d3  ecx = pcrect->h     (movl 0xc(%rsi), %ecx)
   *   @0x5a71d6  ecx += eax                                       — arg4 = y + h (bottom)
   *   @0x5a71d8  esi = eax           — arg2 = y (register reused as arg register)
   *   @0x5a71da  callq _HGRectMake4i(x, y, x + w, y + h)
   *   @0x5a71df  *(uint64_t*)(this + 0x1a0) = rax   — HGRect.lo
   *   @0x5a71e6  *(uint64_t*)(this + 0x1a8) = rdx   — HGRect.hi
   *   @0x5a71ed  eax = 1                            — return true
   *   @0x5a71f8  retq
   *
   * The four ints are passed to HGRectMake4i as (x, y, x+w, y+h) — the corner
   * form (left, top, right, bottom), which matches HGRectMake4i's parameter
   * order recovered from the Helium port at @0x107710.
   *
   * Returns `1` (an `int` per the C++ signature; boolean-true).
   */
  SetRect(pcrect: PCRectInt): number {
    // @0x5a71c9..@0x5a71d6: reconstitute HGRectMake4i's (x, y, x+w, y+h) arg tuple.
    // The `| 0` casts pin JS number semantics to int32, matching the movl loads.
    const x = pcrect.x | 0;
    const y = pcrect.y | 0;
    const w = pcrect.w | 0;
    const h = pcrect.h | 0;
    const right = (x + w) | 0;
    const bottom = (y + h) | 0;
    // @0x5a71da: HGRectMake4i(x, y, right, bottom) — see HGRect.ts.
    const rect = HGRectMake4i(x, y, right, bottom);
    // @0x5a71df/@0x5a71e6: store both 64-bit halves at this+0x1a0.
    this.boundary = rect;
    // @0x5a71ed: return 1.
    return 1 | 0;
  }

  /**
   * ~OZHeCanvas() [D1 — base/complete dtor] @0x5a7200
   *
   * Full body:
   *   @0x5a7200  pushq %rbp ; movq %rsp, %rbp ; popq %rbp
   *   @0x5a7205  jmp __ZN9HgcCanvasD2Ev                           — tail-call
   *
   * D1 is a pure trampoline to the HgcCanvas base D2. We forward through the
   * throwing stub, matching the ABI edge.
   */
  dtorD1(): void {
    // @0x5a7205: tail-call HgcCanvas::~HgcCanvas().
    HgcCanvas_D2(this);
  }

  /**
   * ~OZHeCanvas() [D0 — deleting dtor] @0x5a7210
   *
   * Full body:
   *   @0x5a7216  rbx = this                     — save `this` across the base call
   *   @0x5a7219  callq __ZN9HgcCanvasD2Ev(this) — run base destructor
   *   @0x5a721e  rdi = this
   *   @0x5a7227  jmp   __ZN8HGObjectdlEPv      — tail-call HG-operator-delete
   *
   * D0 = D1's teardown + a tail-jmp into HGObject::operator delete(this) to
   * release storage.
   */
  dtorD0(): void {
    // @0x5a7219: HgcCanvas::~HgcCanvas().
    HgcCanvas_D2(this);
    // @0x5a7227: HGObject::operator delete(this).
    HGObject_operator_delete(this);
  }
}
