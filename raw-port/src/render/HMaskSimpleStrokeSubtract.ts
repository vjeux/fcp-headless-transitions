// HMaskSimpleStrokeSubtract.ts — Ozone HMaskSimpleStrokeSubtract: the
// compositing node for the mask "Simple Stroke — Subtract" operation.
//
// This class derives from HgcMaskStrokeSubtract (undecoded here). At the
// HMask*Subtract layer only three vfns are overridden: GetDOD (domain of
// definition), GetROI (region of interest), and the destructors. The actual
// per-pixel stroke-subtract math lives in the base HgcMaskStrokeSubtract's
// pixel core, which is NOT reached from this file.
//
// The two overrides transcribed here are pure rectangle bookkeeping for the
// FCP render graph:
//   * GetDOD: only input 0 has a DOD (input 0 UNIONed with input 1 in the
//     usual clamped-int space). All other input indices -> HGRectNull.
//   * GetROI: input 0 or 1 -> caller's requested rect passes through
//     unchanged; input index >= 2 -> HGRectNull.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Ozone.framework/Versions/A/Ozone (x86_64 slice).
// Disassembly saved in raw-port/re/disasm/HMaskSimpleStrokeSubtract.*.s.
//
// Undecoded frontier (each has a THROWing stub citing its callee address):
//   HGRenderer::GetInput(HGNode*, int)    @Ozone stub 0x6dd37a
//   HGRenderer::GetDOD(HGNode*)           @Ozone stub 0x6dd36e
//   HGRectIsNull(HGRect)                  @Ozone stub 0x6dcc9c
//   HGRectMake4i(int,int,int,int)         @Ozone stub 0x6dcca8
//   HGRectNull (const global)             @Ozone rip-relative literal pool
//   HgcMaskStrokeSubtract::~HgcMaskStrokeSubtract() @Ozone 0x425a89
//   HGObject::operator delete(void*)      @Ozone stub 0x6def6a
//
// Numerics: pure int32 arithmetic — no floats in either method. All clamps
// are on signed int32 (see cmovgel / cmovll instructions in the disasm).

// ---------------------------------------------------------------------------
// Structural types (best-effort surface — real layouts live in the base
// framework and are not yet decoded here).
// ---------------------------------------------------------------------------

/** HGNode — an opaque render-graph node handle. `this` is an HGNode subclass
 * pointer at the HGRenderer::GetInput ABI boundary. */
export interface HGNode {}

/** HGRenderer — the render context / dependency-tracker passed to every
 * vfn on a render node. Layout undecoded. */
export interface HGRenderer {}

/** HGRect — a 16-byte struct passed by value in {rax=lo64, rdx=hi64} where
 * lo64 = (y << 32) | x (as signed int32s in the low/high halves) and
 * hi64 = (h << 32) | w. Fields are signed int32.
 * Decode source: matches how GetDOD reads GetDOD()'s return in
 * raw-port/re/disasm/HMaskSimpleStrokeSubtract.GetDOD.s (rax/rdx split,
 * `shrq $0x20` extracts each high half). */
export interface HGRect {
  x: number;  // int32, low32 of  lo-qword
  y: number;  // int32, high32 of lo-qword
  w: number;  // int32, low32 of  hi-qword
  h: number;  // int32, high32 of hi-qword
}

// ---------------------------------------------------------------------------
// Constants read from Ozone's literal pool (see disasm rip-relative loads).
// ---------------------------------------------------------------------------

/** _HGRectNull — the global sentinel HGRect that GetDOD/GetROI return when
 * asked for an input that doesn't exist. Both methods load it from the same
 * literal-pool address (rip-rel 0x3fb275 at 0x425aa4, 0x3fb09d at 0x425c7c).
 * The concrete field values are not visible in Ozone's disasm — they live in
 * the __const segment behind that pointer. Callers of HGRectNull should not
 * inspect its fields; they compare against it via HGRectIsNull(). */
export const HGRectNull: HGRect = /* @Ozone rip-relative _HGRectNull */
  { x: 0, y: 0, w: 0, h: 0 };
// NOTE: (0,0,0,0) is a placeholder tag — real HGRectNull's field values are
// determined by Ozone's __const and are consumed only via HGRectIsNull, which
// is a THROWing stub below. Do not rely on these fields.

// ---------------------------------------------------------------------------
// Undecoded external helpers — each throws with its Ozone address so
// frontier.py can list them as gaps.
// ---------------------------------------------------------------------------

/** HGRenderer::GetInput(HGNode*, int)  — resolved through Ozone symbol stub
 * @Ozone 0x6dd37a (call sites at 0x425ad2 and 0x425b70 in
 * HMaskSimpleStrokeSubtract::GetDOD). Returns the input HGNode at the given
 * slot, or nullptr if none. Not yet transcribed. */
export function HGRenderer_GetInput(_r: HGRenderer, _self: HMaskSimpleStrokeSubtract, _slot: number): HGNode | null {
  throw new Error("HGRenderer::GetInput @Ozone 0x6dd37a not yet transcribed");
}

/** HGRenderer::GetDOD(HGNode*) — resolved through Ozone symbol stub
 * @Ozone 0x6dd36e (call sites at 0x425add and 0x425b7b). Returns the child
 * node's domain-of-definition rectangle (an HGRect). Not yet transcribed. */
export function HGRenderer_GetDOD(_r: HGRenderer, _node: HGNode | null): HGRect {
  throw new Error("HGRenderer::GetDOD @Ozone 0x6dd36e not yet transcribed");
}

/** HGRectIsNull(HGRect) — resolved through Ozone symbol stub @Ozone 0x6dcc9c
 * (call sites at 0x425aee and 0x425b8c). Returns non-zero iff the rect is
 * the HGRectNull sentinel / an empty rect. Not yet transcribed. */
export function HGRectIsNull(_r: HGRect): number {
  throw new Error("HGRectIsNull @Ozone 0x6dcc9c not yet transcribed");
}

/** HGRectMake4i(x,y,w,h) — resolved through Ozone symbol stub @Ozone 0x6dcca8
 * (tail-call at 0x425c68). Builds an HGRect from four signed int32s.
 * Not yet transcribed. */
export function HGRectMake4i(_x: number, _y: number, _w: number, _h: number): HGRect {
  throw new Error("HGRectMake4i @Ozone 0x6dcca8 not yet transcribed");
}

/** HgcMaskStrokeSubtract::~HgcMaskStrokeSubtract() — base-class destructor
 * called from D0/D1 (@Ozone 0x425a89 and 0x425a75). Not yet transcribed. */
export function HgcMaskStrokeSubtract_dtor(_self: HMaskSimpleStrokeSubtract): void {
  throw new Error("HgcMaskStrokeSubtract::~HgcMaskStrokeSubtract @Ozone 0x425a89 not yet transcribed");
}

/** HGObject::operator delete(void*) — Ozone symbol stub @Ozone 0x6def6a
 * (tail-called from D0 at 0x425a97). Not yet transcribed. */
export function HGObject_operatorDelete(_p: HMaskSimpleStrokeSubtract): void {
  throw new Error("HGObject::operator delete @Ozone 0x6def6a not yet transcribed");
}

// ---------------------------------------------------------------------------
// HMaskSimpleStrokeSubtract — the class itself.
// Inherits from HgcMaskStrokeSubtract (base's layout undecoded here).
// ---------------------------------------------------------------------------

export class HMaskSimpleStrokeSubtract {
  /**
   * HMaskSimpleStrokeSubtract::~HMaskSimpleStrokeSubtract() (D1, complete-obj)
   * @Ozone 0x425a70. Just tail-calls HgcMaskStrokeSubtract::~HgcMaskStrokeSubtract
   * (base destructor at symbol __ZN21HgcMaskStrokeSubtractD2Ev). No own
   * fields to tear down. */
  destroy(): void {
    // @0x425a75  jmp HgcMaskStrokeSubtract::~HgcMaskStrokeSubtract
    HgcMaskStrokeSubtract_dtor(this);
  }

  /**
   * HMaskSimpleStrokeSubtract::~HMaskSimpleStrokeSubtract() (D0, deleting)
   * @Ozone 0x425a80. Runs the base destructor, then calls
   * HGObject::operator delete on `this` (tail-call via symbol stub 0x6def6a).
   * In JS this is only meaningful as a documentation of the C++ call
   * sequence — the JS runtime handles storage. */
  destroyAndDelete(): void {
    // @0x425a89  callq HgcMaskStrokeSubtract::~HgcMaskStrokeSubtract
    HgcMaskStrokeSubtract_dtor(this);
    // @0x425a97  jmp HGObject::operator delete
    HGObject_operatorDelete(this);
  }

  /**
   * HMaskSimpleStrokeSubtract::GetDOD(HGRenderer*, int, HGRect)
   * @Ozone 0x425aa0 — computes the domain-of-definition for the given
   * output index. Only output 0 has a real DOD; any other index returns
   * HGRectNull.
   *
   * For output 0, the DOD is the UNION of the two input DODs (input 0 and
   * input 1), both first clamped into the signed-int32 range
   *   [ -0x3fffffff, +0x3ffffffe ]
   * on the axis extents (x, y) and the "far corner" values (x+w, y+h) — a
   * defensive clamp against pathological ancestor rects. If EITHER input is
   * HGRectNull, the union degenerates to just the other one.
   *
   * The final rect is (re)built via HGRectMake4i(x_min, y_min, w, h) where
   *   w = max(x2_a, x2_b) - min(x_a, x_b)
   *   h = max(y2_a, y2_b) - min(y_a, y_b)
   * (see joined block at 0x425bee..0x425c68 in the disasm).
   *
   * @param renderer   HGRenderer* (rsi)   — the render context.
   * @param outputIdx  int         (edx)   — which output to compute DOD for.
   * @param _requested HGRect      (rdx:rcx passed by value) — caller's hint;
   *                                        UNREAD by this method (its DOD is
   *                                        derived solely from the inputs).
   */
  GetDOD(renderer: HGRenderer, outputIdx: number, _requested: HGRect): HGRect {
    // @0x425aa0-0x425ab2: outputIdx != 0 short-circuits to HGRectNull.
    if (outputIdx !== 0) {
      // @0x425aa4  load _HGRectNull; @0x425ab2 retq
      return { x: HGRectNull.x, y: HGRectNull.y, w: HGRectNull.w, h: HGRectNull.h };
    }

    // ----- Input A (slot 0) -----
    // @0x425ad2  call HGRenderer::GetInput(this, 0)
    const inputA = HGRenderer_GetInput(renderer, this, 0);
    // @0x425add  call HGRenderer::GetDOD(inputA) -> HGRect A
    const A = HGRenderer_GetDOD(renderer, inputA);
    // @0x425aee  call HGRectIsNull(A)
    const aNull = HGRectIsNull(A) !== 0;

    // Defaults if A is null (jne 0x425b59 branch): see @0x425af3..0x425b08.
    //   ax_hi ("width high default")  = 0xffffffff (-1)
    //   ax_lo                         = 0x00000000
    //   ay_lo                         = 0x00000000
    //   ay_hi                         = 0xffffffff (-1)
    //   x1_A  = 0xffffffff (-1)      y1_A = 0xffffffff (-1)
    // Note these are only ever used if BOTH inputs are null / degenerate; the
    // subsequent bounds tests (js at 0x425bf5 / 0x425bfa) reject them and
    // fall through to the "return HGRectNull-shaped" tail via 0x425c52.
    let a_w_minus_x = -1;                // r13d / r14d init sentinel  @0x425af3
    let a_y_min = 0;                     // -0x2c(%rbp)                @0x425af9
    let a_x_min = 0;                     // -0x30(%rbp) / ecx           @0x425afe
    let a_x_far = -1;                    // edi                         @0x425b03
    let a_y_far = -1;                    // esi (h_minus_y sentinel)    @0x425b08

    if (!aNull) {
      // Extract A.{x, y, w, h} from the {lo64=y|x, hi64=h|w} pair.
      const xA = A.x | 0;                //          low32(rax) via %ebx      @0x425b11
      const yA = A.y | 0;                //          shrq $0x20 %rbx           @0x425b24
      const wA = A.w | 0;                //          low32(rdx) via %r13d      @0x425b31
      const hA = A.h | 0;                //          shrq $0x20 %r13           @0x425b46

      // Clamp each of A.x, A.y into [ -0x3fffffff, +INF ) — replace anything
      // that is signed-less-than -0x3ffffffe with -0x3fffffff.
      //   @0x425b11  cmpl $0xc0000002, %ebx
      //   @0x425b17  movl $0xc0000001, %ecx  (default = -0x3fffffff)
      //   @0x425b1c  movl $0xc0000001, %edx  (default = -0x3fffffff)
      //   @0x425b21  cmovgel %ebx, %edx
      const cx = (xA >= -0x3ffffffe) ? xA : -0x3fffffff;   // clamped A.x
      //   @0x425b28  cmpl $0xc0000002, %ebx (after shr → yA)
      //   @0x425b2e  cmovgel %ebx, %ecx     — ecx becomes clamped A.y
      const cy = (yA >= -0x3ffffffe) ? yA : -0x3fffffff;   // clamped A.y

      // Clamp each of A.w, A.h into ( -INF, +0x3ffffffe ] — replace anything
      // signed-greater-than-or-equal-to 0x3ffffffe with itself only when it
      // is strictly less than that bound, else keep default 0x3ffffffe.
      //   @0x425b31  cmpl $0x3ffffffe, %r13d
      //   @0x425b38  movl $0x3ffffffe, %esi
      //   @0x425b3d  movl $0x3ffffffe, %edi
      //   @0x425b42  cmovll %r13d, %edi   — edi = min(wA, 0x3ffffffe)
      const cw = (wA <  0x3ffffffe) ? wA :  0x3ffffffe;    // clamped A.w
      //   @0x425b4a  cmpl $0x3ffffffe, %r13d (after shr → hA)
      //   @0x425b51  cmovll %r13d, %esi   — esi = min(hA, 0x3ffffffe)
      const ch = (hA <  0x3ffffffe) ? hA :  0x3ffffffe;    // clamped A.h

      // @0x425b55  subl %edx, %edi  →  edi = clamped_w - clamped_x
      // @0x425b57  subl %ecx, %esi  →  esi = clamped_h - clamped_y
      // These name-swap to (x_far, y_far) semantics in the join block below.
      a_x_far     = (cw - cx) | 0;    // r13d after 0x425b5c
      a_y_far     = (ch - cy) | 0;    // -0x34(%rbp)  after 0x425b59
      a_x_min     = cx;               // -0x30(%rbp)  after 0x425b62
      a_y_min     = cy;               // -0x2c(%rbp)  after 0x425b5f
      a_w_minus_x = a_x_far;          // kept in r13d for the range test below
    }

    // ----- Input B (slot 1) -----
    // @0x425b70  call HGRenderer::GetInput(this, 1)
    const inputB = HGRenderer_GetInput(renderer, this, 1);
    // @0x425b7b  call HGRenderer::GetDOD(inputB) -> HGRect B
    const B = HGRenderer_GetDOD(renderer, inputB);
    // @0x425b8c  call HGRectIsNull(B)
    const bNull = HGRectIsNull(B) !== 0;

    // Defaults if B is null (jne 0x425bee):  see @0x425b91..0x425ba2.
    //   edi (bx) = 0,  ecx (bh_far) = -1,  esi (by) = 0,  r14d (bw_far) = -1
    let b_x_min = 0;             // edi                                @0x425b91
    let b_y_min = 0;             // esi                                @0x425b9d
    let b_x_far = 0;             // r14d (via subl below) — see @0x425be9
    let b_y_far = -1;            // ecx                                @0x425b96

    if (!bNull) {
      const xB = B.x | 0;
      const yB = B.y | 0;
      const wB = B.w | 0;
      const hB = B.h | 0;

      // Same clamp pattern as A: mins clamped to >= -0x3fffffff (default when
      // signed-less-than -0x3ffffffe), maxes clamped to <= 0x3ffffffe.
      //   @0x425ba4..@0x425bc1  →  clamped B.x, B.y
      const cxB = (xB >= -0x3ffffffe) ? xB : -0x3fffffff;
      const cyB = (yB >= -0x3ffffffe) ? yB : -0x3fffffff;
      //   @0x425bc4..@0x425be5  →  clamped B.w, B.h  (min with 0x3ffffffe)
      const cwB = (wB <  0x3ffffffe) ? wB :  0x3ffffffe;
      const chB = (hB <  0x3ffffffe) ? hB :  0x3ffffffe;

      b_x_min = cxB;                              // edi @0x425bb4
      b_y_min = cyB;                              // esi @0x425bc1
      b_x_far = (cwB - cxB) | 0;                  // r14d after @0x425be9
      b_y_far = (chB - cyB) | 0;                  // ecx  after @0x425bec
    }

    // ----- Union / degenerate combining -----
    // The tests `js` at 0x425bf5, 0x425bfa are on {r13d, r8d} = {A.x_far, A.y_far}.
    // If either is negative (i.e. A was null and r13d/r8d kept the -1 sentinel,
    // OR A collapsed to zero width/height going negative), we fall through
    // to the r8d/r14d path at 0x425c46 which just adopts B's clamped rect.
    let outMinX: number;
    let outMinY: number;
    let outFarX: number;
    let outFarY: number;

    if ((a_x_far | 0) < 0 || (a_y_far | 0) < 0) {
      // @0x425bf5/0x425bfa js 0x425c52 — "take B's ranges directly" branch
      // via the tail `addl %edi, %r14d ; addl %esi, %ecx` at 0x425c52/0x425c55.
      outMinX = b_x_min;
      outMinY = b_y_min;
      outFarX = b_x_far;                    // will get b_x_min added at tail
      outFarY = b_y_far;                    // will get b_y_min added at tail
    } else if ((b_x_far | 0) < 0 || (b_y_far | 0) < 0) {
      // @0x425c02/0x425c06 js 0x425c46 — "A only" branch. r8d holds A.y_far,
      // r14d gets A.x_far, and mins reload A's stored -0x30(%rbp)/-0x2c(%rbp).
      outMinX = a_x_min;
      outMinY = a_y_min;
      outFarX = a_x_far;
      outFarY = a_y_far;
    } else {
      // @0x425c08..0x425c44  — real union of A and B.
      // eax = min(A.x_min, B.x_min); r14d becomes max(A.x_far+A.x_min, B.x_far+B.x_min) then - eax
      // edx = min(A.y_min, B.y_min); ecx  becomes max(A.y_far+A.y_min, B.y_far+B.y_min) then - edx
      const aMinX = a_x_min | 0;
      const aMinY = a_y_min | 0;
      const minX = (aMinX < b_x_min) ? aMinX : b_x_min;   // eax @0x425c11
      const minY = (aMinY < b_y_min) ? aMinY : b_y_min;   // edx @0x425c2b

      const aFarX = (aMinX + a_x_far) | 0;                // @0x425c15 addl
      const bFarX = (b_x_min + b_x_far) | 0;              // @0x425c18 addl
      const maxFarX = (aFarX > bFarX) ? aFarX : bFarX;    // @0x425c1e cmovgl

      const aFarY = (aMinY + a_y_far) | 0;                // @0x425c2f addl
      const bFarY = (b_y_min + b_y_far) | 0;              // @0x425c32 addl
      const maxFarY = (aFarY > bFarY) ? aFarY : bFarY;    // @0x425c37 cmovgl

      // @0x425c3b/0x425c3e  subl %eax, %r14d ; subl %edx, %ecx
      outMinX = minX;
      outMinY = minY;
      outFarX = (maxFarX - minX) | 0;
      outFarY = (maxFarY - minY) | 0;
    }

    // Tail (@0x425c52..0x425c68):
    //   addl %edi, %r14d   →  r14d += edi   (w += x)   — but note in the
    //                          "A only" and "B only" branches r14d/ecx are
    //                          already the (far - min) delta and edi/esi
    //                          are the mins; this add converts to absolute
    //                          "far" coords and then HGRectMake4i re-derives.
    //   addl %esi, %ecx    →  ecx += esi   (h += y)
    //   jmp HGRectMake4i(x=%edi, y=%esi, w=%r14d, h=%ecx)
    //
    // In the UNION branch above, edi = minX, esi = minY, r14d = (maxFarX -
    // minX), ecx = (maxFarY - minY), so after the two adds we get:
    //   w = (maxFarX - minX) + minX = maxFarX
    //   h = (maxFarY - minY) + minY = maxFarY
    // These are passed to HGRectMake4i, which builds the final HGRect.
    const w = (outFarX + outMinX) | 0;
    const h = (outFarY + outMinY) | 0;
    // @0x425c68  jmp HGRectMake4i
    return HGRectMake4i(outMinX, outMinY, w, h);
  }

  /**
   * HMaskSimpleStrokeSubtract::GetROI(HGRenderer*, int, HGRect)
   * @Ozone 0x425c70 — returns the region-of-interest for the given input
   * index. Inputs 0 and 1 pass the caller's requested rect straight through;
   * input index >= 2 returns HGRectNull.
   *
   * @param _renderer  HGRenderer* (rsi) — UNREAD by this method.
   * @param inputIdx   int         (edx) — the input slot.
   * @param requested  HGRect      (rdx:rcx by value) — the caller's request.
   */
  GetROI(_renderer: HGRenderer, inputIdx: number, requested: HGRect): HGRect {
    // @0x425c70  movq %rcx, %rax   — start with the requested rect
    // @0x425c73  cmpl $0x2, %edx
    // @0x425c76  jl 0x425c8b       — if inputIdx < 2, skip the null-load
    if (inputIdx >= 2) {
      // @0x425c7c  load _HGRectNull ; @0x425c83/86 rax=lo, r8=hi
      return { x: HGRectNull.x, y: HGRectNull.y, w: HGRectNull.w, h: HGRectNull.h };
    }
    // @0x425c8b  movq %r8, %rdx    ; @0x425c8e retq  — return the caller's
    // rect unchanged (rax already = rcx from the entry `movq %rcx, %rax`).
    return { x: requested.x | 0, y: requested.y | 0, w: requested.w | 0, h: requested.h | 0 };
  }
}
