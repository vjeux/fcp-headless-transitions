// raw-port/src/render/HGConvolution.ts
//
// FCP `HGConvolution` — Helium render-graph node that owns one or two
// `HGLinearFilter2D` sub-objects (single or separable 2-D filter) plus an
// origin/size window into that kernel. Extends HGNode. Every accessor is
// bounds-checked; every setter dirty-marks (field_1d8) and calls back
// through `HGNode::ClearBits()` to invalidate the render cache. Kernel
// coefficients are stored as float4 (RGBA-broadcast for the scalar
// setter, per-channel for the vec4 setter) with 16-byte stride.
//
// FRAMEWORK: Helium.framework  (x86_64 slice; file offset 0x4000; VAs
// below are unadjusted VM addresses from otool -tV / nm -n).
//
// DECODE:
//   raw-port/re/disasm/Helium.HGConvolution.HGConvolution.s
//   raw-port/re/disasm/Helium.HGConvolution.Separable.s
//   raw-port/re/disasm/Helium.HGConvolution.GetSize.s
//   raw-port/re/disasm/Helium.HGConvolution.GetOrigin.s
//   raw-port/re/disasm/Helium.HGConvolution.SetSize.s
//   raw-port/re/disasm/Helium.HGConvolution.SetOrigin.s
//   raw-port/re/disasm/Helium.HGConvolution.SetBounds.s
//   raw-port/re/disasm/Helium.HGConvolution.SetCoefficient.s
//   raw-port/re/disasm/Helium.HGConvolution.GetCoefficient.s
//   raw-port/re/disasm/Helium.HGConvolution.ConvolutionFilter2D.s
//   raw-port/re/disasm/Helium.HGConvolution.SeparableFilter2D.s
//   raw-port/re/disasm/Helium.HGConvolution.SetParameter.s
//
// SYMBOLS (@Helium):
//   0x166b50  HGConvolution::HGConvolution()                            [C1 → C2]
//   0x166c50  HGConvolution::Separable() const
//   0x166c60  HGConvolution::GetOrigin(int) const
//   0x166cb0  HGConvolution::SetOrigin(int, int)
//   0x166d20  HGConvolution::GetSize(int) const
//   0x166d70  HGConvolution::SetSize(int, int)
//   0x166e60  HGConvolution::SetBounds(int, int, int, int)
//   0x166f50  HGConvolution::GetCoefficient(int, int)
//   0x167030  HGConvolution::GetCoefficient(int, int, unsigned int)     [stub — RGBA channel accessor]
//   0x167130  HGConvolution::SetCoefficient(int, int, float, float, float, float)  [stub — 4-arg overload]
//   0x167250  HGConvolution::SetCoefficient(int, int, float)
//   0x167350  HGConvolution::SetParameter(int, float, float, float, float)
//   0x1675a0  HGConvolution::ConvolutionFilter2D(HGFilterPreset)
//   0x1675e0  HGConvolution::ConvolutionFilter2D(HGLinearFilter2D const&)  [stub]
//   0x167630  HGConvolution::SeparableFilter2D(HGFilterPreset, HGFilterPreset)
//   0x167680  HGConvolution::SeparableFilter2D(HGLinearFilter2D const&, HGLinearFilter2D const&)  [stub]
//   0x167740  HGConvolution::PopulateCoeffInputForKernel(HGGPURenderer*, int)   [stub — GPU]
//   0x167880  HGConvolution::GetOutput(HGRenderer*)                             [stub — GPU]
//
// STRUCT LAYOUT (recovered from method disasm; extends HGNode):
//   ---- inherited HGNode (0x0..0x198) ----
//   0x198 : HGLinearFilter2D  filterX             (inline sub-object, size 0x20)
//                                                  first field @+0 = float4* coeffs (16B stride)
//   0x1a0 : i32   originX                          (window origin x for filterX)
//   0x1a4 : i32   originY                          (window origin y for filterX)
//   0x1a8 : i32   sizeW                            (window width  for filterX)
//   0x1ac : i32   sizeH                            (window height for filterX)
//   0x1b8 : HGLinearFilter2D  filterY             (only used when mode>=2 = separable)
//   0x1c0 : i32   originX2                         (window origin x for filterY / separable extent)
//   0x1c4 : i32   originY2                         (window origin y for filterY)
//   0x1c8 : i32   sizeW2                           (window width  for filterY)
//   0x1cc : i32   sizeH2                           (window height for filterY)
//   0x1d8 : u32   dirtyBits                        (0xffffffff = fully invalidated; setters or-in
//                                                   0x11 for coeff writes, 0x15 for kernel resets)
//   0x200 : i32   mode                             (1 = single-filter, 2 = separable 2D;
//                                                   compared against $0x2 in every accessor)
//
// Coefficient array indexing (from SetCoefficient/GetCoefficient/SetParameter):
//   base   = *(filterX + 0) = filterX._coefs         ; float4[] (16-byte stride per coef)
//   idx    = (x - originX) + sizeW * (y - originY)   ; note: NOT sizeH — row stride is width
//   coeff  = base[idx]                               ; a float4 (RGBA lanes)
// For SetCoefficient(x,y,v):  the scalar `v` is broadcast to all 4 lanes
//   (`shufps $0x0, xmm0, xmm0` @0x1672f7) then written as a float4.
// For separable mode (0x200>=2), any *coefficient write first collapses the
// filter pair back to a single filter by calling
//   HGLinearFilter2D::convolve(filterX, filterY)  → in-place into filterX
// setting mode := 1, or-in dirtyBits |= 0x15.
//
// FRONTIER (throw-stubs; each cites its @0xADDR per Rule 3):
//   HGLinearFilter2D::convolve(const&)      @Helium 0x10eb60
//   HGLinearFilter2D::translate(int,int)    @Helium 0x10c080
//   HGLinearFilter2D::resize(i,i,i,i,i)     @Helium 0x10b160
//   HGLinearFilter2D::reset(int,int)        @Helium 0x109f11
//   HGLinearFilter2D::setType(preset,u32)   @Helium 0x10acd0
//
// Import HGNode for the ClearBits() invalidation hook (already ported).

import { HGNode } from "./HGNode";

/**
 * HGFilterPreset — enum tag consumed by HGLinearFilter2D::setType.
 * Values live in Helium's rodata; we treat as opaque int32 here (the actual
 * preset dispatch is inside HGLinearFilter2D::setType @Helium 0x10acd0 and
 * has not yet been transcribed).
 */
export type HGFilterPreset = number;

/**
 * Field layout of HGLinearFilter2D (inline sub-object of HGConvolution).
 * Recovered from HGConvolution disasm; matches the interface already stubbed
 * in HGPrefilterUtils.ts. Every method here is a throw-stub citing its
 * source @0xADDR per Rule 3 — we only *own* the outer HGConvolution logic.
 *
 * @Helium HGLinearFilter2D
 */
export class HGLinearFilter2D {
  // +0x00: float4* coeffs; treated as flat Float32Array of stride 4 (rgba per texel).
  //        (16-byte stride confirmed at HGConvolution.SetCoefficient @0x1672f3
  //         `shlq $0x4, %rcx` — index-times-16 into (%rax).)
  _coefs: Float32Array | null = null;
  // +0x08..: opaque width/height/etc. (see HGPrefilterUtils.ts stubs).

  /**
   * `HGLinearFilter2D::reset(int width, int height)`
   * @Helium 0x109f11
   * Rule-3 stub: called by HGConvolution.SetSize/SetBounds when the new
   * geometry collapses to empty.
   */
  reset(_w: number, _h: number): void {
    throw new Error("HGLinearFilter2D::reset(int,int) @Helium 0x109f11 not yet transcribed");
  }

  /**
   * `HGLinearFilter2D::resize(int x, int y, int, int, int)`
   * @Helium 0x10b160
   * Called by HGConvolution.SetSize/SetBounds when the window changes size.
   */
  resize(_x: number, _y: number, _x2: number, _y2: number, _flags: number): void {
    throw new Error("HGLinearFilter2D::resize(i,i,i,i,i) @Helium 0x10b160 not yet transcribed");
  }

  /**
   * `HGLinearFilter2D::translate(int dx, int dy)`
   * @Helium 0x10c080
   * Called by HGConvolution.SetOrigin/SetBounds when only the origin shifts
   * (same size).
   */
  translate(_dx: number, _dy: number): void {
    throw new Error("HGLinearFilter2D::translate(int,int) @Helium 0x10c080 not yet transcribed");
  }

  /**
   * `HGLinearFilter2D::convolve(HGLinearFilter2D const&)`
   * @Helium 0x10eb60
   * Called by HGConvolution.SetCoefficient/SetParameter when a coeff write
   * arrives on a separable filter — collapses filterX ⊛ filterY into
   * filterX, then the outer mode transitions from 2 back to 1.
   */
  convolve(_other: HGLinearFilter2D): void {
    throw new Error("HGLinearFilter2D::convolve(const&) @Helium 0x10eb60 not yet transcribed");
  }

  /**
   * `HGLinearFilter2D::setType(HGFilterPreset, unsigned int)`
   * @Helium 0x10acd0
   * Called by HGConvolution.ConvolutionFilter2D / SeparableFilter2D with
   * `arg2 = 4` (a channel-mask? bit-plane count? — undecoded).
   */
  setType(_preset: HGFilterPreset, _flags: number): void {
    throw new Error("HGLinearFilter2D::setType(preset,u32) @Helium 0x10acd0 not yet transcribed");
  }
}

/**
 * `HGConvolution` — Helium filter-node wrapper around one or two
 * `HGLinearFilter2D` sub-objects.
 *
 * @Helium HGConvolution
 */
export class HGConvolution extends HGNode {
  filterX: HGLinearFilter2D;   // +0x198
  originX: number;             // +0x1a0 (i32)
  originY: number;             // +0x1a4 (i32)
  sizeW: number;               // +0x1a8 (i32)
  sizeH: number;               // +0x1ac (i32)
  filterY: HGLinearFilter2D;   // +0x1b8 (unused when mode==1)
  originX2: number;            // +0x1c0 (i32)
  originY2: number;            // +0x1c4 (i32)
  sizeW2: number;              // +0x1c8 (i32)
  sizeH2: number;              // +0x1cc (i32)
  dirtyBits: number;           // +0x1d8 (u32)
  mode: number;                // +0x200 (i32: 1=single, 2=separable)

  /**
   * `HGConvolution::HGConvolution()`  — @Helium 0x166a50 (C2), 0x166b50 (C1 tail-jmp).
   * The C1 ctor at 0x166b50 is a bare tail-jmp to C2 — we only need default
   * field values here. C2's body is not yet fully transcribed (initialises
   * HGNode base + two HGLinearFilter2D sub-objects); we lean on the field
   * defaults captured from the accessor disasm (0x200 default = 1 = single).
   */
  constructor() {
    super();
    this.filterX = new HGLinearFilter2D();
    this.originX = 0;
    this.originY = 0;
    this.sizeW = 0;
    this.sizeH = 0;
    this.filterY = new HGLinearFilter2D();
    this.originX2 = 0;
    this.originY2 = 0;
    this.sizeW2 = 0;
    this.sizeH2 = 0;
    this.dirtyBits = 0;
    // mode default 1 confirmed by SetSize/SetOrigin/etc setting $1 at 0x166e44
    // (SetSize) and by every getter reading 0x200 and comparing to $0x2.
    this.mode = 1;
  }

  /**
   * `bool HGConvolution::Separable() const` — @Helium 0x166c50.
   *
   *   0x166c54  cmpl $0x2, 0x200(%rdi)
   *   0x166c5b  setge %al
   *   → return (mode >= 2) as bool.
   */
  Separable(): boolean {
    return this.mode >= 2;
  }

  /**
   * `int HGConvolution::GetSize(int dim) const` — @Helium 0x166d20.
   *
   * dim == 0 → width; dim != 0 → height.  Separable (mode>=2) returns the
   * "combined" filter extent: primary + secondary − 1 (classic separable
   * outer-product footprint).  Single mode returns just the primary size.
   *
   *   mode >= 2  &&  dim == 0  → sizeW2 + sizeW - 1
   *   mode >= 2  &&  dim != 0  → sizeH2 + sizeH - 1
   *   mode <  2  &&  dim == 0  → sizeW
   *   mode <  2  &&  dim != 0  → sizeH
   */
  GetSize(dim: number): number {
    if (this.mode >= 2) {
      return (dim === 0)
        ? (this.sizeW2 + this.sizeW - 1) | 0
        : (this.sizeH2 + this.sizeH - 1) | 0;
    }
    return (dim === 0) ? this.sizeW : this.sizeH;
  }

  /**
   * `int HGConvolution::GetOrigin(int dim) const` — @Helium 0x166c60.
   *
   * dim == 0 → origin.x; dim != 0 → origin.y. Separable adds the two
   * origins (filterX's + filterY's; see SetBounds which offsets by both
   * to produce the composite origin).
   *
   *   mode >= 2  &&  dim == 0  → originX2 + originX
   *   mode >= 2  &&  dim != 0  → originY2 + originY
   *   mode <  2  &&  dim == 0  → originX
   *   mode <  2  &&  dim != 0  → originY
   */
  GetOrigin(dim: number): number {
    if (this.mode >= 2) {
      return (dim === 0)
        ? (this.originX2 + this.originX) | 0
        : (this.originY2 + this.originY) | 0;
    }
    return (dim === 0) ? this.originX : this.originY;
  }

  /**
   * `int HGConvolution::SetSize(int w, int h)` — @Helium 0x166d70.
   *
   * Returns 1 (changed) or 0 (unchanged / degenerate).  Semantics:
   *
   *   1. If w<=0 || h<=0  → collapse to empty.  If filterX._coefs is
   *      non-null, call filterX.reset(0,0); mark dirty via ClearBits path;
   *      set mode=1; return 0.  (@0x166dd4..0x166dee, 0x166e44..0x166e47)
   *
   *   2. Compute the "current effective" (origX, origY, W, H).  If mode>=2,
   *      this is (originX2+originX, originY2+originY, sizeW+sizeW2-1,
   *      sizeH+sizeH2-1).  If mode<2, it's (originX, originY, sizeW, sizeH).
   *      If (W,H) already equals (w,h), return 0 with mode:=1 (@0x166e09..).
   *
   *   3. Otherwise call
   *        filterX.resize(origX, origY, origX + w - 1, origY + h - 1, 0)
   *      then dirtyBits := 0xffffffff, HGNode::ClearBits(),  mode := 1,
   *      return 1.  (@0x166e0d..0x166e42)
   *
   * NOTE: SetSize does NOT itself write to this.sizeW/H — the width/height
   * are considered a property of the filter sub-object (its internal
   * bookkeeping), NOT of HGConvolution's outer window fields. The outer
   * fields are read but not mutated by SetSize; the resize call carries the
   * new geometry into filterX.  (Verified: 0x166d70..0x166e54 contains no
   * writes to 0x1a8/0x1ac/0x1c8/0x1cc.)
   */
  SetSize(w: number, h: number): number {
    // @0x166d79..0x166d85: w<=0 || h<=0 → collapse.
    if (w <= 0 || h <= 0) {
      // @0x166dd4: if filterX._coefs != nullptr → filterX.reset(0,0).
      if (this.filterX._coefs !== null) {
        this.filterX.reset(0, 0);
        // @0x166e2d..0x166e44: fall through to dirty+ClearBits+mode=1+ret 1
        this.dirtyBits = 0xffffffff >>> 0;
        this.ClearBits(0xffff);
        this.mode = 1;
        return 1;
      }
      // no coeffs → return 0 with mode:=1 (@0x166e09..0x166e44 xorl %eax,%eax).
      this.mode = 1;
      return 0;
    }
    // @0x166d87..: compute (origX, origY, W, H) from mode.
    let origX = this.originX;
    let origY: number;
    let W: number;
    let H: number;
    if (this.mode >= 2) {
      // @0x166d96..0x166dcc
      origX = (origX + this.originX2) | 0;
      origY = (this.originY2 + this.originY) | 0;
      W = ((this.sizeW + this.sizeW2) | 0) - 1;
      H = ((this.sizeH + this.sizeH2) | 0) - 1;
    } else {
      // @0x166df0..0x166e07
      origY = this.originY;
      W = this.sizeW;
      H = this.sizeH;
    }
    // @0x166dba/@0x166e05: if unchanged → 0, else resize.
    if (W === w && H === h) {
      // @0x166e09: xorl %eax,%eax ; @0x166e44: mode:=1 ; ret 0.
      this.mode = 1;
      return 0;
    }
    // @0x166e0d..0x166e2b: filterX.resize(origX, origY, origX+w-1, origY+h-1, 0)
    //   (r8d = origY + rax(w) - 1; but the actual call uses new width/height
    //    passed as ecx=w-1+origX, r8d=h-1+origY — the "x2,y2" corners; the
    //    5th arg r9d is xor'd to 0.)
    // Careful with argument order: the disasm sets
    //   %esi = origX (this.originX / effective, already in %rsi via prior load)
    //   %edx = origY (via %r9d — actually r9d holds origY here @0x166e22)
    // Then @0x166e14 `leal (%rsi,%rax),%ecx ; decl` → ecx = origX+w-1
    // Then @0x166e19 `leal (%rdx,%r9),%r8d ; decl` → r8d = origY+h-1
    // Then r9d cleared, callq resize.  So resize(origX, origY, origX+w-1, origY+h-1, 0).
    this.filterX.resize(origX, origY, (origX + w - 1) | 0, (origY + h - 1) | 0, 0);
    // @0x166e2d
    this.dirtyBits = 0xffffffff >>> 0;
    // @0x166e37: HGNode::ClearBits() — the void thunk → ClearBits(0xffff).
    this.ClearBits(0xffff);
    // @0x166e3f: eax = 1, then @0x166e44: 0x200 := 1.
    this.mode = 1;
    return 1;
  }

  /**
   * `int HGConvolution::SetOrigin(int x, int y)` — @Helium 0x166cb0.
   *
   * Returns 1 if the origin moved (translate applied), 0 otherwise.
   *
   *   1. Load effective origin: (originX, originY) for mode<2, or
   *      (originX+originX2, originY+originY2) for mode>=2.  (@0x166cb0..0x166cd7)
   *   2. dx := x - effOX, dy := y - effOY.  If (dx|dy) == 0 → return 0.
   *      (@0x166cd9..0x166ce1)
   *   3. Else filterX.translate(dx, dy); dirtyBits := 0xffffffff;
   *      HGNode::ClearBits(); return 1.  (@0x166ce9..0x166d18)
   */
  SetOrigin(x: number, y: number): number {
    let effOX: number;
    let effOY: number;
    if (this.mode >= 2) {
      // @0x166cbf..0x166ccb
      effOX = (this.originX + this.originX2) | 0;
      effOY = (this.originY2 + this.originY) | 0;
    } else {
      // @0x166cd3..0x166cd7 (edx already has originY from earlier load @0x166cd3)
      effOX = this.originX;
      effOY = this.originY;
    }
    // @0x166cd9..0x166cdd: signed subtract dx = x - effOX, dy = y - effOY.
    const dx = (x - effOX) | 0;
    const dy = (y - effOY) | 0;
    // @0x166cdd..0x166ce1: (dy | dx) == 0 → nothing to do, return 0.
    if (((dy | dx) | 0) === 0) return 0;
    // @0x166cf6: filterX.translate(dx, dy).
    this.filterX.translate(dx, dy);
    // @0x166cfb: dirtyBits := 0xffffffff.
    this.dirtyBits = 0xffffffff >>> 0;
    // @0x166d08: HGNode::ClearBits() (void thunk).
    this.ClearBits(0xffff);
    // @0x166d0d: eax := 1.
    return 1;
  }

  /**
   * `int HGConvolution::SetBounds(int x0, int y0, int x1, int y1)` — @Helium 0x166e60.
   *
   * Returns 1 (changed) or 0 (unchanged / degenerate).
   *
   *   w := x1 - x0
   *   h := y1 - y0
   *   1. If (w|h) has the sign bit set (i.e. w<0 || h<0)  →  collapse path:
   *      if filterX._coefs != nullptr → filterX.reset(0,0); dirty+ClearBits+
   *      mode=1+ret 1; else ret 0.  (@0x166e75..0x166ec5)
   *   2. Compute (curW-1, curH-1) via mode:
   *        mode>=2  → curW-1 = sizeW+sizeW2-2, curH-1 = sizeH+sizeH2-2   (@0x166e83..0x166eae)
   *        mode<2   → curW-1 = sizeW-1,        curH-1 = sizeH-1         (@0x166ed7..0x166eeb)
   *      If (w,h) matches those (i.e. w==curW-1 && h==curH-1 in the
   *      integer world where SetBounds passes {w,h+1} directly), the code
   *      re-uses the origin comparison from SetOrigin: dx=x0-effOX,
   *      dy=y0-effOY; if dx==0 && dy==0 return 0, else translate + dirty.
   *   3. Otherwise filterX.resize(x0, y0, x1, y1, 0); dirty; ClearBits;
   *      mode:=1; return 1.  (@0x166f21..0x166f42)
   *
   * NOTE: like SetSize, SetBounds mutates only the sub-object (via
   * translate/resize/reset); the outer HGConvolution.origin_/size_ fields
   * remain the "logical description" that is re-read on the next call.
   */
  SetBounds(x0: number, y0: number, x1: number, y1: number): number {
    // @0x166e69..0x166e75
    const w = (x1 - x0) | 0;
    const h = (y1 - y0) | 0;
    // @0x166e72..0x166e78: (w|h) sign-bit → negative → collapse.
    if (((w | h) | 0) < 0) {
      // @0x166eb7..0x166ec5
      if (this.filterX._coefs !== null) {
        this.filterX.reset(0, 0);
        // @0x166f29..0x166f46
        this.dirtyBits = 0xffffffff >>> 0;
        this.ClearBits(0xffff);
        this.mode = 1;
        return 1;
      }
      // @0x166f47: xorl %eax,%eax + ret (no ClearBits, no mode write).
      return 0;
    }
    // Non-degenerate: compute (curWm1, curHm1) — "cur - 1" as sitting in disasm.
    let curWm1: number;
    let curHm1: number;
    if (this.mode >= 2) {
      // @0x166e83..0x166eae: r9d = sizeW+sizeW2-2 ; edi = sizeH+sizeH2-1, then incl %eax below.
      // We keep the same "-1" convention as the disasm: curWm1 = sizeW+sizeW2-2.
      curWm1 = ((this.sizeW + this.sizeW2) | 0) - 2;
      curHm1 = ((this.sizeH + this.sizeH2) | 0) - 1; // note: NOT symmetric — this matches disasm
    } else {
      // @0x166ed7..0x166ee9
      curWm1 = this.sizeW; // pre-decrement was `incl %edi` — see below
      curHm1 = this.sizeH;
      // The disasm at 0x166ed7 does `incl %edi` (edi=w) BEFORE comparing to sizeW.
      // Equivalently: check (w+1 == sizeW) && (h+1 == sizeH).
    }
    let matched: boolean;
    if (this.mode >= 2) {
      // @0x166e98: cmpl %r9d, %edi ; @0x166ead: decl %edi ; @0x166eaf: incl %eax ;
      //           @0x166eb1: cmpl %edi, %eax ; je → 0x166eed (translate branch).
      matched = (w === curWm1) && ((h + 1) === curHm1);
    } else {
      // @0x166ed7 incl %edi ; @0x166ed9 cmpl 0x1a8(%rbx),%edi ; jne 0x166f1a (resize)
      // @0x166ee7 incl %eax ; @0x166ee9 cmpl %edi,%eax ; jne 0x166f1a (resize)
      matched = ((w + 1) === curWm1) && ((h + 1) === curHm1);
    }
    if (matched) {
      // @0x166eed..0x166f18: origin-shift path (like SetOrigin).
      let effOX: number;
      let effOY: number;
      if (this.mode >= 2) {
        effOX = (this.originX + this.originX2) | 0;
        effOY = (this.originY + this.originY2) | 0;
      } else {
        effOX = this.originX;
        effOY = this.originY;
      }
      // @0x166ef9..0x166f06: dx = x0 - effOX, dy = y0 - effOY (via xor→or trick).
      const dx = (x0 - effOX) | 0;
      const dy = (y0 - effOY) | 0;
      if ((dx | dy) === 0) {
        // @0x166f47: return 0 (no dirty, no ClearBits).
        return 0;
      }
      // @0x166f13: filterX.translate(dy, dx). Note operand order from disasm:
      //   `subl %ecx,%edx ; subl %eax,%esi ; callq translate` → esi=dx, edx=dy.
      // System-V ABI: rdi=this, esi=arg1, edx=arg2 → translate(arg1=dx, arg2=dy).
      this.filterX.translate(dx, dy);
      // @0x166f29..0x166f42: dirty + ClearBits + eax=1 (mode NOT written here in
      // the "matched-size" translate branch — the disasm falls to 0x166f33 which
      // skips the 0x200 write at 0x166e44).
      this.dirtyBits = 0xffffffff >>> 0;
      this.ClearBits(0xffff);
      return 1;
    }
    // @0x166f1a..0x166f42: resize branch.
    //   filterX.resize(x0, y0, x1, y1, 0).
    // Args: `esi=x0 (survives from param), edx=y0, ecx=x1, r8=y1, r9d xor→0`.
    this.filterX.resize(x0, y0, x1, y1, 0);
    this.dirtyBits = 0xffffffff >>> 0;
    this.ClearBits(0xffff);
    this.mode = 1;
    return 1;
  }

  /**
   * `float HGConvolution::GetCoefficient(int x, int y)` — @Helium 0x166f50.
   *
   * Returns the float4 coefficient at (x,y) as a scalar (RGBA-broadcast — see
   * SetCoefficient below).  Callers only take xmm0's low lane, which per the
   * disasm is `movaps (%rdi,%rax),%xmm0` so the RETURN is a full float4 but
   * TypeScript exposes just the R-lane as a number.  If (x,y) is out of the
   * window bounds, returns 0.0f (`xorps %xmm0,%xmm0` @0x166f56).
   *
   * Window is:  originX <= x <= originX+sizeW-1  &&  originY <= y <= originY+sizeH-1.
   * Index in filterX._coefs: idx = (x - originX) + sizeW * (y - originY).
   *
   * Separable (mode>=2): first collapses filterX ⊛ filterY into filterX by
   * calling filterX.convolve(filterY), mode:=1, dirtyBits:=0xffffffff, then
   * falls through to the single-filter path.  (@0x166fcb..0x166fe9)
   */
  GetCoefficient(x: number, y: number): number {
    // @0x166f50..0x166f97: bounds check against filterX window (originX/Y + sizeW/H).
    const oX = this.originX;
    const oY = this.originY;
    const w = this.sizeW;
    const h = this.sizeH;
    if (x < oX) return 0;
    if (x > ((oX + w - 1) | 0)) return 0;
    if (y < oY) return 0;
    if (y > ((oY + h - 1) | 0)) return 0;
    // @0x166fb2..: if separable, collapse.
    if (this.mode >= 2) {
      // @0x166fce: filterX.convolve(filterY).
      this.filterX.convolve(this.filterY);
      // @0x166fd9: dirty := 0xffffffff.
      this.dirtyBits = 0xffffffff >>> 0;
      // @0x166fe5: mode := 1.
      this.mode = 1;
      // Note: parameters x,y survive across the call (@0x166fd3/@0x166fd6).
      // origin/size are re-loaded @0x166ff1..0x167001 — they may have changed?
      // In fact the disasm reads them AGAIN after convolve, so if convolve resized
      // the underlying filter, we honour the fresh geometry. We already have oX/oY/w
      // in locals though — reload to be faithful to the machine's re-read.
      // (This ONLY matters for the index computation, not the earlier bounds check.)
    }
    // @0x167009..0x167016: idx = (x - originX) + sizeW * (y - originY).
    const oX2 = this.originX;
    const oY2 = this.originY;
    const w2  = this.sizeW;
    const dx = (x - oX2) | 0;
    const dy = (y - oY2) | 0;
    const idx = (dx + Math.imul(w2, dy)) | 0;
    // @0x167019..0x16701d: coefs[idx] as float4 → return R-lane.
    const coefs = this.filterX._coefs;
    if (coefs === null) return 0;
    // 16-byte stride == 4 float lanes; R-lane is base[idx*4+0].
    return Math.fround(coefs[(idx << 2) | 0]);
  }

  /**
   * `int HGConvolution::SetCoefficient(int x, int y, float v)` — @Helium 0x167250.
   *
   * Returns 1 if coeff changed, 0 otherwise (no change / out-of-bounds).
   *
   *   1. If mode>=2, collapse via filterX.convolve(filterY); dirtyBits |= 0x15;
   *      mode:=1. (@0x166f97..0x1672a1 — orb $0x15 then movl $1,0x200)
   *   2. Bounds check: originX <= x <= originX+sizeW-1 && originY <= y <=
   *      originY+sizeH-1.  Out-of-bounds → return 0xffffffff (i.e. -1 as i32
   *      / 0xffffffff as u32; @0x1672a7 movl $0xffffffff,%eax).
   *   3. Broadcast `v` to all 4 lanes: xmm0 = v.repeat(4).
   *      Read existing coefs[idx*4..idx*4+3] as a float4.
   *      Compute a "changed" bitmask via SSE:
   *        m1 = (new != 0.0)    ; per-lane
   *        m2 = (old != 0.0)    ; per-lane
   *        m2 ^= m1             ; per-lane
   *        movmskps → 4-bit sign mask.  (@0x1672fb..0x167310)
   *      If mask == 0 (no signed-bit difference between new & old zero-ness), the
   *      write is treated as "no change" and eax:=0 (@0x167323 xorl %eax,%eax);
   *      the ClearBits pass at 0x16732b is still taken IF mode>=2 (i.e. we came
   *      from the separable-collapse path) but NOT otherwise.
   *      Otherwise, dirtyBits |= 0x11 (@0x167317) and coefs[idx*4..idx*4+3] := xmm0
   *      as float4 (@0x16731e movaps %xmm0,(%rax)); then HGNode::ClearBits();
   *      return 1.  (@0x167338: return with eax as loaded.)
   */
  SetCoefficient(x: number, y: number, v: number): number {
    const wasSeparable = this.mode >= 2;
    // @0x1672a1..: bounds check (must load originX BEFORE any collapse — the
    // disasm at 0x1672a1 reads 0x1a0(%rbx) AFTER the convolve call, but SetOrigin
    // logic can't change originX during convolve so reading before is equivalent
    // for our TS model).  We match the disasm ordering: collapse first, then check.
    if (wasSeparable) {
      // @0x167275..0x167287: filterX.convolve(filterY).
      this.filterX.convolve(this.filterY);
      // @0x167290: dirtyBits |= 0x15.
      this.dirtyBits = ((this.dirtyBits | 0x15) >>> 0);
      // @0x167297: mode := 1.
      this.mode = 1;
    }
    // @0x1672a1..0x1672e2: bounds check.
    const oX = this.originX;
    const oY = this.originY;
    const w  = this.sizeW;
    const h  = this.sizeH;
    if (x < oX) return 0xffffffff >>> 0;
    if (x > ((oX + w - 1) | 0)) return 0xffffffff >>> 0;
    if (y < oY) return 0xffffffff >>> 0;
    if (y > ((oY + h - 1) | 0)) return 0xffffffff >>> 0;
    // @0x1672e4..0x1672f3: idx = (x - originX) + sizeW * (y - originY); stride*16.
    const dx = (x - oX) | 0;
    const dy = (y - oY) | 0;
    const idx = (dx + Math.imul(w, dy)) | 0;
    const coefs = this.filterX._coefs;
    if (coefs === null) {
      // The disasm loads *(filterX + 0) into %rax unconditionally; if it's null
      // it'd segfault. We model that as "no coeffs yet → treat as no-change";
      // caller error at that point is Apple's problem, not ours.
      return 0;
    }
    // @0x1672f7..0x167310: SSE "value-changed" mask.
    // new-lane == 0.0? old-lane == 0.0? if any lane's zero-ness differs OR any
    // lane's raw bits differ where zero-ness matches... let's follow the exact
    // sequence:
    //     xmm0 = broadcast(v)   (via shufps $0x0)
    //     xmm2 = 0.0
    //     xmm1 = xmm0                  ; then cmpneqps xmm2  → per-lane (new != 0)
    //     xmm2 = old_lane              ; then cmpneqps xmm2  → per-lane (old != 0)
    //     xmm2 ^= xmm1                 ; → per-lane (new_is_nonzero != old_is_nonzero)
    //     mask = movmskps(xmm2)        ; 4-bit sign mask
    // So the "changed" test collapses to: does the zero/non-zero PATTERN differ?
    // (Note: this is NOT "did the value change" — two nonzeros differ silently!
    //  Apple's early-out is intentionally coarse; we transcribe it faithfully.)
    const base = (idx << 2) | 0;
    const vfr = Math.fround(v);
    // Per-lane raw compare (float !=) using JS strict inequality on Math.fround.
    // Because JS === treats NaN as unequal to itself, we need to preserve C's
    // semantics of `x != y` (which is TRUE for either NaN operand). Use `!==`
    // then Number.isNaN() adjustment: cmpneqps returns TRUE if either arg is NaN.
    const l0 = Math.fround(coefs[base + 0]);
    const l1 = Math.fround(coefs[base + 1]);
    const l2 = Math.fround(coefs[base + 2]);
    const l3 = Math.fround(coefs[base + 3]);
    const newNz = [vfr !== 0 || Number.isNaN(vfr),
                   vfr !== 0 || Number.isNaN(vfr),
                   vfr !== 0 || Number.isNaN(vfr),
                   vfr !== 0 || Number.isNaN(vfr)];
    const oldNz = [l0 !== 0 || Number.isNaN(l0),
                   l1 !== 0 || Number.isNaN(l1),
                   l2 !== 0 || Number.isNaN(l2),
                   l3 !== 0 || Number.isNaN(l3)];
    let mask = 0;
    for (let i = 0; i < 4; i++) if ((newNz[i] as unknown as boolean) !== (oldNz[i] as unknown as boolean)) mask |= (1 << i);
    if (mask === 0) {
      // @0x167323: xorl %eax,%eax.  Then @0x167325..0x167329: if mode>=2 →
      // ClearBits+eax=1, else fall to ret with eax=0.  But mode was already
      // clobbered to 1 above if wasSeparable — the disasm reads the ORIGINAL
      // %r12d (which captured 0x200 BEFORE convolve).
      if (wasSeparable) {
        this.ClearBits(0xffff);
        return 1;
      }
      return 0;
    }
    // @0x167314..0x167321: dirtyBits |= 0x11 ; coefs[idx*4..+3] := broadcast(v).
    this.dirtyBits = ((this.dirtyBits | 0x11) >>> 0);
    coefs[base + 0] = vfr;
    coefs[base + 1] = vfr;
    coefs[base + 2] = vfr;
    coefs[base + 3] = vfr;
    // @0x16732b: HGNode::ClearBits() ; @0x167333: eax:=1.
    this.ClearBits(0xffff);
    return 1;
  }

  /**
   * `int HGConvolution::SetParameter(int idx, float a, float b, float c, float d)`
   * @Helium 0x167350.
   *
   * `idx==0` is HGNode's built-in "resize+origin" parameter:
   *   1. Round c toward zero → newW ; round d toward zero → newH   (roundss $0xa = trunc)
   *   2. this.SetSize(newW, newH)   ; capture its return in r14d.
   *   3. Load (effOX, effOY) as in SetOrigin.  If (a,b) differ from (effOX, effOY)
   *      by any lane → filterX.translate(dx, dy); dirty; ClearBits(); return
   *      (translate-flag | SetSize-flag).  Otherwise fall through to return
   *      SetSize's flag.
   *   (@0x16740b..0x167570)
   *
   * `idx!=0` is a coefficient write:
   *   1. If mode>=2: collapse via convolve. (@0x1673c2..0x1673e0)
   *   2. Bounds-check idx against ((sizeW*sizeH)-1) or the separable outer
   *      product; if idx-1 >= product → return 0xffffffff.
   *      (@0x16736a..0x1673aa or @0x16746e..0x167480)
   *   3. Decompose (idx-1) / w into (row, col); target coef at (col+originX,
   *      row+originY).  (@0x1673ae..0x1673bf or @0x167486..0x167497)
   *   4. Assemble xmm0 = <a,b,c,d> via `insertps` (@0x1674fc..0x167508) —
   *      each lane is an INDEPENDENT float, NOT a broadcast.
   *   5. Same "zero-pattern-changed" SSE mask as SetCoefficient. Same write path.
   *
   * NOTE: The scalar-broadcast SetCoefficient is DIFFERENT semantics from the
   * 4-arg overload here — that's why they're separate mangled entries.
   */
  SetParameter(idx: number, a: number, b: number, c: number, d: number): number {
    // @0x167362: testl %esi,%esi  ; @0x167364: je 0x16740b  (idx==0 branch).
    if (idx === 0) {
      // @0x16740f..0x167418: newW = (int)trunc(c) ; newH = (int)trunc(d).
      // roundss $0xa = ROUND_TO_ZERO ; then cvttss2si.  Model with Math.trunc + i32.
      const newW = ((Math.trunc(Math.fround(c))) | 0);
      const newH = ((Math.trunc(Math.fround(d))) | 0);
      // @0x16742c..0x167430: this.SetSize(newW, newH) → r14d.
      const setSizeRet = this.SetSize(newW, newH);
      // @0x167435..0x16743b: reload (originX, effOY) after SetSize.
      // @0x167444..0x167469: effOX/OY from mode.
      let effOX: number;
      let effOY: number;
      if (this.mode >= 2) {
        // @0x167457..0x167463
        effOX = (this.originX + this.originX2) | 0;
        effOY = (this.originY + this.originY2) | 0;
      } else {
        // @0x167536..0x16753a
        effOX = this.originX;
        effOY = this.originY;
      }
      // @0x16743b: cvtss2si a → i32 ; cvtss2si b → i32. Round-to-nearest (default MXCSR).
      const ax = Math.round(Math.fround(a)) | 0;
      const ay = Math.round(Math.fround(b)) | 0;
      // @0x16753c..0x167544: dx = ax - effOX, dy = ay - effOY. If both zero → no translate.
      const dx = (ax - effOX) | 0;
      const dy = (ay - effOY) | 0;
      if ((dx | dy) === 0) {
        // @0x16756b..0x16756d: xorl %eax,%eax ; orl %r14d,%eax → return setSizeRet.
        return setSizeRet | 0;
      }
      // @0x167546..0x167564: filterX.translate(dx, dy); dirty; ClearBits; eax=1.
      this.filterX.translate(dx, dy);
      this.dirtyBits = 0xffffffff >>> 0;
      this.ClearBits(0xffff);
      // @0x16756d: orl %r14d,%eax → 1 | setSizeRet.
      return (1 | setSizeRet) | 0;
    }

    // idx != 0 → coefficient write with 4 explicit RGBA values.
    // @0x16736a..: capture sizeW, mode, then compute idx-space product.
    const w = this.sizeW;
    const modeAtEntry = this.mode;
    let rowStride: number;   // divisor for row extraction
    let colStride: number;   // divisor for col extraction
    let product: number;     // total coeff count (bounds check)
    if (modeAtEntry >= 2) {
      // @0x167381..0x16739a
      const h = this.sizeH;
      const w2 = this.sizeW2;
      const h2 = this.sizeH2;
      const combinedW = ((w + w2) | 0) - 1;  // edi @0x16738d..0x167390
      const combinedH = ((h2 + h) | 0) - 1;  // ecx @0x167398..0x16739a
      product = Math.imul(combinedH, combinedW) | 0;
      // Layout is row-major with row length = combinedW.
      rowStride = combinedW;
      colStride = combinedH;  // used for computing rows in the div sequence below
    } else {
      // @0x16746e..0x167476
      const h = this.sizeH;
      product = Math.imul(w, h) | 0;
      rowStride = w;
      colStride = h;
    }
    // @0x1673a6..0x1673aa OR @0x16747e..0x167480: bounds. Note the compare is
    // `cmpl %edx,%esi ; jg 0x167570`  → if (idx > product) return -1.
    // Then @0x1673ae/@0x167486 `decl %esi` → normalizes to idx-1.
    if (idx > product) return 0xffffffff >>> 0;
    const idx0 = (idx - 1) | 0;
    // @0x1673b0..0x1673bf: unsigned divide sequence.
    //   %eax = idx-1 ; xorl %edx,%edx ; divl %edi (rowStride)  → r15d = edx (remainder), eax=quot
    //   %eax = idx-1 ; xorl %edx,%edx ; divl %ecx (colStride)  → r14d = eax (quot)
    // r15d becomes the target COLUMN in filterX, r14d the ROW.
    const idxU = idx0 >>> 0;
    const col = (idxU % (rowStride >>> 0)) >>> 0;   // r15d
    const row = ((idxU / (colStride >>> 0)) | 0) >>> 0; // r14d (integer division)

    // If mode>=2, collapse first via convolve. (@0x1673c2..0x1673fc)
    if (modeAtEntry >= 2) {
      this.filterX.convolve(this.filterY);
      this.dirtyBits = ((this.dirtyBits | 0x15) >>> 0);
      this.mode = 1;
    }

    // @0x16749a..0x1674e3: bounds check the (col,row) point against filterX
    // window (originX/Y, sizeW/H). Note: filterX may have been resized by
    // convolve, but we use the current (possibly-updated) values — the disasm
    // reloads originX @0x16749a.
    const oX = this.originX;
    const oY = this.originY;
    const w2 = this.sizeW;
    const h2 = this.sizeH;
    const targetX = (col | 0);
    const targetY = (row | 0);
    if (targetX < oX) return 0xffffffff >>> 0;
    if (targetX > ((oX + w2 - 1) | 0)) return 0xffffffff >>> 0;
    if (targetY < oY) return 0xffffffff >>> 0;
    if (targetY > ((oY + h2 - 1) | 0)) return 0xffffffff >>> 0;

    // @0x1674e9..0x1674f8: linear index into coefs; 16-byte stride.
    const dx = (targetX - oX) | 0;
    const dy = (targetY - oY) | 0;
    const flatIdx = (dx + Math.imul(w2, dy)) | 0;
    const coefs = this.filterX._coefs;
    if (coefs === null) return 0;
    const base = (flatIdx << 2) | 0;

    // @0x1674fc..0x167508: xmm0 = <a,b,c,d>  (insertps builds float4 from 4 scalars).
    const af = Math.fround(a);
    const bf = Math.fround(b);
    const cf = Math.fround(c);
    const df = Math.fround(d);

    // @0x16750e..0x167523: same zero-pattern SSE mask as SetCoefficient(scalar).
    const l0 = Math.fround(coefs[base + 0]);
    const l1 = Math.fround(coefs[base + 1]);
    const l2 = Math.fround(coefs[base + 2]);
    const l3 = Math.fround(coefs[base + 3]);
    const newNz = [
      af !== 0 || Number.isNaN(af),
      bf !== 0 || Number.isNaN(bf),
      cf !== 0 || Number.isNaN(cf),
      df !== 0 || Number.isNaN(df),
    ];
    const oldNz = [
      l0 !== 0 || Number.isNaN(l0),
      l1 !== 0 || Number.isNaN(l1),
      l2 !== 0 || Number.isNaN(l2),
      l3 !== 0 || Number.isNaN(l3),
    ];
    let mask = 0;
    for (let i = 0; i < 4; i++) if (newNz[i] !== oldNz[i]) mask |= (1 << i);
    if (mask === 0) {
      // @0x16757d..0x167592: xorl %eax,%eax ; if r12d>=2 → ClearBits+eax=1.
      if (modeAtEntry >= 2) {
        this.ClearBits(0xffff);
        return 1;
      }
      return 0;
    }
    // @0x167527..0x167531: dirty |= 0x11 ; coefs[base..+3] := xmm0.
    this.dirtyBits = ((this.dirtyBits | 0x11) >>> 0);
    coefs[base + 0] = af;
    coefs[base + 1] = bf;
    coefs[base + 2] = cf;
    coefs[base + 3] = df;
    // @0x16749a-fallthrough continues to 0x167585..0x16758d: ClearBits+eax=1.
    this.ClearBits(0xffff);
    return 1;
  }

  /**
   * `void HGConvolution::ConvolutionFilter2D(HGFilterPreset)` — @Helium 0x1675a0.
   *
   *   1. filterX.setType(preset, 4)                     (@0x1675a9..0x1675b5)
   *   2. dirtyBits |= 0x15                              (@0x1675ba orb $0x15)
   *   3. mode := 1                                      (@0x1675c1 movl $1,0x200)
   *
   * Returns void; the disasm's implicit return value is the caller-provided rbx.
   */
  ConvolutionFilter2D(preset: HGFilterPreset): void {
    // @0x1675b5: HGLinearFilter2D::setType(preset, 4).
    this.filterX.setType(preset, 4);
    this.dirtyBits = ((this.dirtyBits | 0x15) >>> 0);
    this.mode = 1;
  }

  /**
   * `void HGConvolution::SeparableFilter2D(HGFilterPreset px, HGFilterPreset py)`
   * @Helium 0x167630.
   *
   *   1. filterX.setType(px, 4)                         (@0x16763c..0x167648)
   *   2. filterY.setType(py, 4)                         (@0x16764d..0x16765b)
   *   3. dirtyBits := 0xffffffff                        (@0x167660)
   *   4. mode := 2                                      (@0x16766b)
   *
   * Note dirtyBits is FULLY set (not |=) here — this is a full kernel rebuild.
   */
  SeparableFilter2D(px: HGFilterPreset, py: HGFilterPreset): void {
    this.filterX.setType(px, 4);
    this.filterY.setType(py, 4);
    this.dirtyBits = 0xffffffff >>> 0;
    this.mode = 2;
  }

  //
  // GPU-side facades — Rule-3 stubs. These wire the (already-computed) kernel
  // coefficients into the GPU renderer and produce the actual output tile.
  // Their bodies depend on HGGPURenderer / HGRenderer subsystems that are not
  // yet transcribed; the point of this class is the kernel + geometry math
  // above, which is fully decodable.
  //

  /**
   * `void HGConvolution::PopulateCoeffInputForKernel(HGGPURenderer*, int)`
   * @Helium 0x167740 — GPU coefficient-buffer upload path.
   */
  PopulateCoeffInputForKernel(_renderer: unknown, _idx: number): void {
    throw new Error("HGConvolution::PopulateCoeffInputForKernel @Helium 0x167740 not yet transcribed");
  }

  /**
   * `HGImage* HGConvolution::GetOutput(HGRenderer*)` — @Helium 0x167880.
   */
  GetOutput(_renderer: unknown): unknown {
    throw new Error("HGConvolution::GetOutput @Helium 0x167880 not yet transcribed");
  }
}
