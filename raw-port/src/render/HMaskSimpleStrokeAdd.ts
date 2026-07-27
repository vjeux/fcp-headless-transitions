// HMaskSimpleStrokeAdd.ts — Ozone HMaskSimpleStrokeAdd: mask stroke "add"
// compositing op. Faithful transcription of the four Ozone symbols at
// @Ozone 0x425850, @Ozone 0x425860, @Ozone 0x425880, @Ozone 0x425a50.
//
// This class derives from HgcMaskStrokeAdd (its base dtor is called from both
// D1/D0 destructors — see re/disasm/HMaskSimpleStrokeAdd.~HMaskSimpleStrokeAdd.s
// @0x425855, @0x425869). Only the two virtual overrides GetDOD and GetROI have
// interesting logic here; everything else is a thin shim over HGRenderer /
// HGRect helpers.
//
// Provenance / decode references (all in re/disasm/):
//   HMaskSimpleStrokeAdd.~HMaskSimpleStrokeAdd.s  ->  D1 @0x425850, D0 @0x425860
//   HMaskSimpleStrokeAdd.GetDOD.s                 ->  GetDOD @0x425880
//   HMaskSimpleStrokeAdd.GetROI.s                 ->  GetROI @0x425a50
//
// All numeric literals below are read directly from those saved disassemblies;
// nothing is invented. Every callee stub cites its symbol stub @0xADDR.

// ---------------------------------------------------------------------------
// Type stubs — the real HGRect / HGRenderer / HGNode / HGObject live in the
// Ozone C++ side and are not yet transcribed. We surface the exact ABI shape
// GetDOD/GetROI touch (HGRect = { x, y, r, b } four int32s packed as two
// 64-bit registers — see @0x425880: `movq %rax,%rbx ; movq %rdx,%r13` where
// %rax holds x|y<<32 and %rdx holds r|b<<32). Kept local per the "one class
// per file" rule; a future HGRect.ts port will replace this alias.
// ---------------------------------------------------------------------------

// HGRect is the canonical Helium type — corner-form int32 {x, y, right, bottom}.
// See raw-port/src/render/HGRect.ts. This file's old field names {x, y, r, b}
// were the SAME corner form (r = right, b = bottom — recovered from the
// register split at GetDOD @0x425880-@0x425926) and map 1:1 to canonical
// {x, y, right, bottom}. _HGRectIsNull @0x6dcc9c, _HGRectMake4i @0x6dcca8 and
// _HGRectNull @0x425884/@0x425a5c all resolve to the real Helium impls
// decoded in HGRect.ts.
import {
  HGRect,
  HGRectIsNull as HGRectIsNullCanonical,
  HGRectMake4i as HGRectMake4iCanonical,
  HGRectNull as HGRectNullConst,
} from "./HGRect.js";
export { HGRect };

/** HGRenderer — opaque. GetDOD only exercises two of its members:
 *   HGRenderer::GetInput(HGNode*, int)   @Ozone symbol stub 0x6dd37a
 *   HGRenderer::GetDOD(HGNode*)          @Ozone symbol stub 0x6dd36e */
export interface HGRenderer {
  /** __ZN10HGRenderer8GetInputEP6HGNodei — symbol stub @0x6dd37a. Returns the
   *  Nth input node of `node` (numbered by index; GetDOD asks for 0 and 1). */
  GetInput(node: HGNode, index: number): HGNode;
  /** __ZN10HGRenderer6GetDODEP6HGNode — symbol stub @0x6dd36e. Returns the
   *  domain-of-definition rect for `node` (may be HGRectNull). */
  GetDOD(node: HGNode): HGRect;
}

/** HGNode — opaque. HMaskSimpleStrokeAdd is used as an HGNode* in
 *  GetInput/GetDOD (see @0x4258aa `movq %rdi, %r12` -> passed as %rsi to
 *  HGRenderer::GetInput). */
export type HGNode = object;

// ---------------------------------------------------------------------------
// External Ozone symbols — throwing stubs. Every stub cites the @0xADDR of
// its symbol-stub call site in the disassembly so frontier.py can enumerate
// the remaining gap. NEVER approximate these — a bad HGRectIsNull answer
// changes the union path taken.
// ---------------------------------------------------------------------------

/** _HGRectIsNull — @Ozone 0x6dcc9c symbol stub -> canonical Helium
 *  _HGRectIsNull @0x107b20 (`r.right <= r.x || r.bottom <= r.y`). Called from
 *  GetDOD @0x4258ce and @0x42596c. */
function HGRectIsNull(rect: HGRect): boolean {
  return HGRectIsNullCanonical(rect);
}

/** _HGRectMake4i — @Ozone 0x6dcca8 symbol stub -> canonical Helium
 *  _HGRectMake4i @0x107710. Tail-called from GetDOD @0x425a48; packs four
 *  int32s (x, y, right, bottom) into an HGRect (normalising so x<=right,
 *  y<=bottom — matches the callsite's precomputed union corners). */
function HGRectMake4i(x: number, y: number, r: number, b: number): HGRect {
  return HGRectMake4iCanonical(x, y, r, b);
}

/** _HGRectNull — @Ozone data symbol (RIP-loaded @0x425884 / @0x425a5c) ->
 *  canonical Helium _HGRectNull @0x3d2284 = {0,0,0,0}. */
function HGRectNull(): HGRect {
  return HGRectNullConst;
}

/** HgcMaskStrokeAdd::~HgcMaskStrokeAdd — base-class destructor called by both
 *  ~HMaskSimpleStrokeAdd overloads. Not yet transcribed (symbol
 *  __ZN16HgcMaskStrokeAddD2Ev, direct call at @0x425855 (D1) and @0x425869
 *  (D0)). */
function HgcMaskStrokeAdd_dtor(_self: HMaskSimpleStrokeAdd): void {
  throw new Error("HgcMaskStrokeAdd::~HgcMaskStrokeAdd @Ozone (direct call @0x425855 / @0x425869) — not yet transcribed");
}

/** HGObject::operator delete(void*) — symbol stub @Ozone 0x6def6a
 *  (tail-called from D0 @0x425877). Not yet transcribed. */
function HGObject_delete(_self: HMaskSimpleStrokeAdd): void {
  throw new Error("HGObject::operator delete @Ozone 0x6def6a symbol stub — not yet transcribed");
}

// ---------------------------------------------------------------------------
// HMaskSimpleStrokeAdd
// ---------------------------------------------------------------------------

/**
 * HMaskSimpleStrokeAdd — Ozone class. Faithful port of the four Ozone symbols:
 *   D1  @0x425850 ~HMaskSimpleStrokeAdd()   (in-place dtor: base dtor tail)
 *   D0  @0x425860 ~HMaskSimpleStrokeAdd()   (deleting dtor: base dtor + delete)
 *   GetDOD @0x425880  (HGRenderer*, int, HGRect) -> HGRect
 *   GetROI @0x425a50  (HGRenderer*, int, HGRect) -> HGRect
 *
 * The class holds no instance state visible from these four methods (no member
 * loads other than `this` used as an HGNode*). All the work lives in the
 * inherited HgcMaskStrokeAdd base + the two DOD/ROI overrides transcribed
 * below.
 */
export class HMaskSimpleStrokeAdd {
  /**
   * ~HMaskSimpleStrokeAdd() (D1, in-place) — @Ozone 0x425850.
   *
   * Disasm re/disasm/HMaskSimpleStrokeAdd.~HMaskSimpleStrokeAdd.s (D1 body):
   *   pushq %rbp ; movq %rsp,%rbp ; popq %rbp
   *   jmp __ZN16HgcMaskStrokeAddD2Ev
   * Pure tail-call into the base dtor; no member state to tear down here.
   */
  destroyInPlace(): void {
    HgcMaskStrokeAdd_dtor(this);
  }

  /**
   * ~HMaskSimpleStrokeAdd() (D0, deleting) — @Ozone 0x425860.
   *
   * Disasm (D0 body): call HgcMaskStrokeAdd::~HgcMaskStrokeAdd, then tail-call
   *   __ZN8HGObjectdlEPv (HGObject::operator delete) on `this`.
   */
  destroyAndDelete(): void {
    HgcMaskStrokeAdd_dtor(this);
    HGObject_delete(this);
  }

  /**
   * HMaskSimpleStrokeAdd::GetDOD(HGRenderer*, int, HGRect) — @Ozone 0x425880.
   *
   * ABI (System V x86_64):
   *   rdi = this, rsi = renderer, edx = mode, then HGRect passed by value in
   *   %rcx (low 8B: x|y<<32) and %r8 (low 8B: r|b<<32). Returns HGRect in
   *   %rax (x|y<<32) : %rdx (r|b<<32).
   *
   * Control flow (see re/disasm/HMaskSimpleStrokeAdd.GetDOD.s):
   *   @0x425880  if (mode != 0) return HGRectNull.
   *   @0x425893  a = renderer.GetDOD(renderer.GetInput(this, 0)).
   *              If HGRectIsNull(a): mark input-0 invalid via sentinels
   *                (r14=-1 => sub-rect width becomes -1 = negative sentinel,
   *                 esi/edi=-1, edx/ecx=0). Otherwise clamp a and convert to
   *                width/height form: (x,y,r,b) with x,y >= -0x3FFFFFFF and
   *                r,b <=  0x3FFFFFFD, then set w = r - x, h = b - y.
   *   @0x425945  b = renderer.GetDOD(renderer.GetInput(this, 1)).
   *              Same clamp + convert on b (or the same negative-sentinel path
   *              on HGRectIsNull).
   *   @0x4259ce  Merge:
   *                if A invalid (w0<0 || h0<0): result = B (may itself be all
   *                  sentinel; in that case r14=ecx=-1 and edi=esi=-1, and the
   *                  tail-add gives HGRectMake4i(-1,-1,-2,-2) which is the
   *                  binary's shape for "null result" — see @0x425a32).
   *                else if B invalid (w1<0 || h1<0): result = A.
   *                else union: x = min(x0,x1), y = min(y0,y1),
   *                            r = max(x0+w0, x1+w1),
   *                            b = max(y0+h0, y1+h1),
   *                            width = r - x, height = b - y.
   *   @0x425a32  Tail-call HGRectMake4i(x, y, x+width, y+height).
   */
  GetDOD(renderer: HGRenderer, mode: number, _rect: HGRect): HGRect {
    // @0x425880-@0x425892 — early-out for mode != 0.
    if ((mode | 0) !== 0) {
      return HGRectNull();
    }

    // @0x4258aa-@0x4258bd — a = renderer.GetDOD(renderer.GetInput(this, 0)).
    const inputA = renderer.GetInput(this, 0);
    const rectA = renderer.GetDOD(inputA);

    // @0x4258d3-@0x4258e8 — initialize the "input invalid" sentinels used
    // when HGRectIsNull(rectA). The disasm loads: r14=-1 (=> width becomes
    // -1 after sub), edx=0, ecx=0, edi=-1, esi=-1. These map to
    // (x0,y0)=(0,0) and (w0,h0)=(-1,-1) below.
    let x0 = 0 | 0;
    let y0 = 0 | 0;
    let w0 = -1 | 0;
    let h0 = -1 | 0;

    // @0x4258ed-@0x425937 — if !HGRectIsNull(rectA): clamp + convert to w/h.
    if (!HGRectIsNull(rectA)) {
      // @0x4258f1-@0x425901 — x0 = (rectA.x >= 0xC0000002) ? rectA.x : 0xC0000001.
      // 0xC0000002 as signed int32 = -1073741822; 0xC0000001 = -1073741823.
      // So: clamp x to a lower bound of -0x3FFFFFFF (= 0xC0000001 signed).
      x0 = (rectA.x | 0) >= (0xc0000002 | 0) ? (rectA.x | 0) : (0xc0000001 | 0);
      // @0x425904-@0x42590e — y0 same clamp on rectA.y.
      y0 = (rectA.y | 0) >= (0xc0000002 | 0) ? (rectA.y | 0) : (0xc0000001 | 0);
      // @0x425911-@0x425922 — r0 = (rectA.right < 0x3FFFFFFE) ? rectA.right : 0x3FFFFFFE.
      const r0 = (rectA.right | 0) < 0x3ffffffe ? (rectA.right | 0) : 0x3ffffffe;
      // @0x425926-@0x425931 — b0 same clamp on rectA.b.
      const b0 = (rectA.bottom | 0) < 0x3ffffffe ? (rectA.bottom | 0) : 0x3ffffffe;
      // @0x425935-@0x425937 — convert to width/height (int32 subtraction).
      w0 = ((r0 - x0) | 0);
      h0 = ((b0 - y0) | 0);
    }

    // @0x425939-@0x425945 — spill (esi=h0 -> -0x34(rbp), edx=x0 -> -0x2c(rbp),
    // ecx=y0 -> -0x30(rbp); r13d retains w0). Then b = renderer.GetDOD(
    // renderer.GetInput(this, 1)).
    const inputB = renderer.GetInput(this, 1);
    const rectB = renderer.GetDOD(inputB);

    // @0x425971-@0x425982 — same sentinel initialization for the B branch:
    // edi=0, ecx=-1, esi=0, r14=-1.
    let x1 = 0 | 0;
    let y1 = 0 | 0;
    let w1 = -1 | 0;
    let h1 = -1 | 0;

    // @0x425982-@0x4259cc — if !HGRectIsNull(rectB): clamp + convert.
    if (!HGRectIsNull(rectB)) {
      x1 = (rectB.x | 0) >= (0xc0000002 | 0) ? (rectB.x | 0) : (0xc0000001 | 0);
      y1 = (rectB.y | 0) >= (0xc0000002 | 0) ? (rectB.y | 0) : (0xc0000001 | 0);
      const r1 = (rectB.right | 0) < 0x3ffffffe ? (rectB.right | 0) : 0x3ffffffe;
      const b1 = (rectB.bottom | 0) < 0x3ffffffe ? (rectB.bottom | 0) : 0x3ffffffe;
      w1 = ((r1 - x1) | 0);
      h1 = ((b1 - y1) | 0);
    }

    // @0x4259ce-@0x425a24 — three-way merge on the sign of the widths/heights.
    // The disasm uses `testl ..; js .Lskip` which branches when the value is
    // negative (sign flag set). w<0 || h<0 marks the corresponding rect
    // invalid.
    let outX: number;
    let outY: number;
    let outW: number;
    let outH: number;
    if ((w0 | 0) < 0 || (h0 | 0) < 0) {
      // @0x425a32 fall-through: A invalid -> result = B (still in edi/esi/
      // r14d/ecx). The tail add turns (w1,h1) back into (r1,b1).
      outX = x1;
      outY = y1;
      outW = w1;
      outH = h1;
    } else if ((w1 | 0) < 0 || (h1 | 0) < 0) {
      // @0x425a26: B invalid -> copy A. Disasm: ecx=h0, r14d=w0 (from edx
      // which was set to w0 at @0x4259dc), esi=y0, edi=x0.
      outX = x0;
      outY = y0;
      outW = w0;
      outH = h0;
    } else {
      // @0x4259e8-@0x425a1e: union.
      //   eax = min(x0, x1)                     (0x4259ec-0x4259f1)
      //   edx = x0 + w0 (= r0)                  (0x4259f5)
      //   r14 = x1 + w1 (= r1)                  (0x4259f8)
      //   r14 = max(edx, r14) = max(r0, r1)     (0x4259fb-0x4259fe)
      //   edx = min(y0, y1)                     (0x425a06-0x425a0b)
      //   r8  = y0 + h0 (= b0)                  (0x425a0f)
      //   ecx = y1 + h1 (= b1)                  (0x425a12)
      //   ecx = max(r8, ecx) = max(b0, b1)      (0x425a14-0x425a17)
      //   r14 -= eax   (union width  = maxR - minX)   (0x425a1b)
      //   ecx -= edx   (union height = maxB - minY)   (0x425a1e)
      //   esi = edx (unionY), edi = eax (unionX)      (0x425a20/22)
      const minX = (x0 | 0) < (x1 | 0) ? (x0 | 0) : (x1 | 0);
      const minY = (y0 | 0) < (y1 | 0) ? (y0 | 0) : (y1 | 0);
      const r0 = ((x0 + w0) | 0);
      const r1 = ((x1 + w1) | 0);
      const maxR = (r0 | 0) > (r1 | 0) ? (r0 | 0) : (r1 | 0);
      const b0 = ((y0 + h0) | 0);
      const b1 = ((y1 + h1) | 0);
      const maxB = (b0 | 0) > (b1 | 0) ? (b0 | 0) : (b1 | 0);
      outX = minX;
      outY = minY;
      outW = ((maxR - minX) | 0);
      outH = ((maxB - minY) | 0);
    }

    // @0x425a32-@0x425a48 — convert (x, y, w, h) back to (x, y, r, b) and
    // tail-call HGRectMake4i. Note: the disasm computes r14+=edi (r=x+w) and
    // ecx+=esi (b=y+h) unconditionally, so the "A invalid, B all-sentinel"
    // path produces HGRectMake4i(-1, -1, -1+-1, -1+-1) = (-1,-1,-2,-2). That
    // is not HGRectNull's canonical value; it is the exact shape the binary
    // returns and we preserve it bit-for-bit.
    const outR = ((outX + outW) | 0);
    const outB = ((outY + outH) | 0);
    return HGRectMake4i(outX, outY, outR, outB);
  }

  /**
   * HMaskSimpleStrokeAdd::GetROI(HGRenderer*, int, HGRect) — @Ozone 0x425a50.
   *
   * ABI: same as GetDOD. The rect arg is passed in %rcx (x|y<<32) and %r8
   * (r|b<<32); return in %rax:%rdx.
   *
   * Disasm re/disasm/HMaskSimpleStrokeAdd.GetROI.s:
   *   @0x425a50  movq %rcx, %rax           ; rax = rect.x|y (pass-through)
   *   @0x425a53  cmpl $0x2, %edx
   *   @0x425a56  jl 0x425a6b               ; if (index < 2) skip null-load
   *   @0x425a58  ...load HGRectNull into rax/r8...
   *   @0x425a6b  movq %r8, %rdx            ; rdx = rect.r|b (or null.r|b)
   *   @0x425a6e  retq
   *
   * i.e. GetROI returns the caller-supplied rect for indices 0 and 1 (the
   * two mask stroke inputs), and HGRectNull for any other index. The input
   * HGNode* / HGRenderer* are unused.
   */
  GetROI(_renderer: HGRenderer, index: number, rect: HGRect): HGRect {
    // @0x425a53-@0x425a56 — signed comparison against 2.
    if ((index | 0) >= 2) {
      // @0x425a58-@0x425a6a — return HGRectNull (RIP-relative load of the
      // _HGRectNull data symbol @0x425a5c).
      return HGRectNull();
    }
    // @0x425a6b-@0x425a6e — pass-through of the caller-supplied rect.
    return rect;
  }
}
