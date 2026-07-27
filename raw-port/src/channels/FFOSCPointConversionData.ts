// FFOSCPointConversionData — Flexo on-screen-control (OSC) point conversion cache.
// A small POD-with-vtable that snapshots the OSC's live-view geometry so subsequent
// point conversions (screen<->normalized) don't have to re-query the AppKit view every call.
// Faithful transcription of Flexo class FFOSCPointConversionData (4 methods total).
//
// Source disassembly: raw-port/re/disasm/Flexo.FFOSCPointConversionData.*.s
// Framework: Final Cut Pro / Flexo.framework
//
// DECODE — struct layout (recovered from the ctor @0xcd7ba0 and the sibling method
// -[FFSimpleOSC _internal_clampToViewBoundsX:pointY:pcd:] @0xcd7d40 which reads this
// same object; matching stores/loads pin the field offsets):
//   +0x00  vtable pointer (installed to `vtable for FFOSCPointConversionData + 0x10`
//          @ Flexo 0x19106a0 — see leaq @0xcd7bb1 / 0xcd7c89 / 0xcd7cc9 / 0xcd7d09)
//   +0x08  FFSimpleOSC*  simpleOSC (owning OSC; not retained — set from `%rsi` @0xcd7bbb)
//   +0x10  NSRect        convertedRect (32B; written from the 2nd stret msgSend @0xcd7c57;
//                        two halves via `movups %xmm0/xmm1, 0x10/0x20(%rbx)` @0xcd7c64/68)
//   +0x30  { NSPoint origin; CGFloat width } — 24 bytes of the "resized OSC view" bounds
//          NSRect returned by the 1st stret msgSend @0xcd7c07 (only 24 of 32 bytes copied:
//          `movups %xmm0,0x30(%rbx)` @0xcd7c29 + `movq %rax,0x40(%rbx)` @0xcd7c21). The
//          same 24-byte struct is then passed BY VALUE as the sole struct-arg into the
//          2nd stret call @0xcd7c48/4c/43. See `-[FFSimpleOSC _internal_clampToViewBoundsX:
//          pointY:pcd:]` @0xcd7d90/95 which reads +0x10 & +0x20 (i.e. the converted NSRect)
//          confirming the +0x10 slot is the derived NSRect.
//   +0x48  id  retainedObjA (nil'd in ctor via `movups %xmm0,0x48(%rdi)` @0xcd7bc2;
//               released by ~ctor at 0xcd7c93/0xcd7cd3/0xcd7d13). Not written by the ctor
//               itself — filled later by whichever OSC-facing method needs a cached ObjC
//               handle (undecoded here; ctor only reserves and zeros the slot).
//   +0x50  id  retainedObjB (same shape as +0x48; released by ~ctor at 0xcd7c9d/0xcd7cdd/0xcd7d1d).
//   +0x58  NSRect  viewBoundsCopy (copied from `_NSZeroRect` @0xcd7bcd/d0/d4/d8 via
//                  two 16B movups; later read as the "view bounds" NSRect @ +0x58 & +0x68
//                  by `-[FFSimpleOSC _internal_clampToViewBoundsX:pointY:pcd:]` @0xcd7d58/5d).
// Total sizeof ≈ 0x78 (120 bytes).
//
// The four methods are the ctor and the C++ ABI triplet of dtors (D0 deleting, D1 complete,
// D2 base). All three dtors install the same vtable pointer at +0x00 then release the two ObjC
// slots at +0x48/+0x50; D0 additionally jmps to `operator delete` (@ __ZdlPv stub @0x1497404).

// FFSimpleOSC is an ObjC class; typed as a black-box handle here (its ivars and selectors
// live on the AppKit/Flexo side and are not part of this class's decoded surface).
type FFSimpleOSC = object;
// AppKit NSRect: { origin: {x,y}, size: {w,h} } — 4 doubles = 32 bytes.
type NSRect = { originX: number; originY: number; sizeW: number; sizeH: number };
// The truncated 24-byte view of an NSRect that the ctor stores at +0x30 (origin + width;
// height slot is unread — see @0xcd7c21/29 store pair).
type NSRectHead24 = { originX: number; originY: number; sizeW: number };

/**
 * `-[<view> bounds]`-family selector fetched from the OSC's `resizedOSCView`.
 * Actual selector name lives at Flexo selref slot 0x1bd44f8 (loaded @0xcd7bf9). Returns an
 * NSRect but this ctor only reads the first 24 bytes of it.
 * Not yet transcribed @Flexo 0xcd7c07 (msgSend_stret call site).
 */
function resizedOSCView_boundsSelectorStretA(_view: object): NSRectHead24 {
  throw new Error(
    "FFOSCPointConversionData: resizedOSCView bounds-selector stret call " +
      "not yet transcribed @Flexo 0xcd7c07 (selref @Flexo 0x1bd44f8)"
  );
}

/**
 * `-[FFSimpleOSC <selector>:pcd:]`-family selector: takes the OSC's `_effect` ivar
 * and a 24-byte struct (the view-bounds head captured above), returns an NSRect.
 * Actual selector name lives at Flexo selref slot 0x1bf05b0 (loaded @0xcd7c38).
 * Not yet transcribed @Flexo 0xcd7c57 (msgSend_stret call site).
 */
function ffSimpleOSC_convertRectSelectorStretB(
  _osc: FFSimpleOSC,
  _effect: object,
  _in: NSRectHead24
): NSRect {
  throw new Error(
    "FFOSCPointConversionData: FFSimpleOSC convert-rect selector stret call " +
      "not yet transcribed @Flexo 0xcd7c57 (selref @Flexo 0x1bf05b0)"
  );
}

/**
 * Fetch the current value of the FFSimpleOSC `_effect` ivar (an ObjC id).
 * Reads the runtime ivar offset from `_OBJC_IVAR_$_FFSimpleOSC._effect` at
 * @Flexo 0xcd7bdc / 0xcd7c2d and dereferences at `(%rsi, %rax)`.
 * Not yet transcribed @Flexo 0xcd7bdc.
 */
function ffSimpleOSC_effect_ivar(_osc: FFSimpleOSC): object {
  throw new Error(
    "FFOSCPointConversionData: FFSimpleOSC._effect ivar load " +
      "not yet transcribed @Flexo 0xcd7bdc"
  );
}

/**
 * `-[<view> resizedOSCView]` — fetch the AppKit view that the OSC currently renders into.
 * Selref at Flexo 0x1bf05a8 (loaded @0xcd7be7). Regular (non-stret) msgSend @0xcd7bee.
 * May legitimately return nil (branch @0xcd7bf7 -> 0xcd7c0e zeroes the 24B buffer).
 * Not yet transcribed @Flexo 0xcd7bee.
 */
function view_resizedOSCView(_effect: object): object | null {
  throw new Error(
    "FFOSCPointConversionData: -resizedOSCView msgSend not yet transcribed " +
      "@Flexo 0xcd7bee (selref @Flexo 0x1bf05a8)"
  );
}

/**
 * `objc_release` — decrements an ObjC object's retain count (may free).
 * Called via `_objc_release` @Flexo 0xcd7c97/0xcd7ca1 (D2), 0xcd7cd7/0xcd7ce1 (D1),
 * 0xcd7d17/0xcd7d21 (D0). Not yet transcribed @Flexo 0xcd7c97.
 */
function objc_release(_p: object | null): void {
  // The ctor sets both slots to nil, so a same-turn ctor-then-dtor sequence hits nil here;
  // release-on-nil is defined and a no-op in the ObjC runtime. Anything else must decode.
  if (_p === null) return;
  throw new Error(
    "FFOSCPointConversionData: objc_release of a non-nil ObjC handle " +
      "not yet transcribed @Flexo 0xcd7c97"
  );
}

/**
 * C++ `operator delete(void*)` — deallocates the class instance.
 * Called by the deleting dtor D0 via a tail-jmp to `__ZdlPv` stub @Flexo 0x1497404
 * (see @Flexo 0xcd7d30). Not yet transcribed @Flexo 0xcd7d30.
 */
function operator_delete(_p: object): void {
  throw new Error(
    "FFOSCPointConversionData: operator delete(void*) not yet transcribed " +
      "@Flexo 0xcd7d30 (__ZdlPv stub @Flexo 0x1497404)"
  );
}

// AppKit `NSZeroRect` — the global all-zero NSRect symbol. Loaded from the literal pool
// @Flexo 0xcd7bc6 and splatted via two movups into +0x58 & +0x68 of `this`.
const NSZeroRect: NSRect = { originX: 0, originY: 0, sizeW: 0, sizeH: 0 };

export class FFOSCPointConversionData {
  // +0x00 vtable — modelled implicitly by the class identity in TS.
  /** +0x08 FFSimpleOSC* (unretained back-ref set in the ctor @0xcd7bbb). */
  simpleOSC: FFSimpleOSC;
  /** +0x10 NSRect — the "converted" rect produced by the 2nd stret msgSend @0xcd7c57. */
  convertedRect: NSRect;
  /**
   * +0x30 — 24-byte snapshot of the resized-OSC-view bounds (head of an NSRect).
   * This is the INPUT to the 2nd stret call; its 4th double (height) is not captured
   * (see truncated store pair @0xcd7c21 + @0xcd7c29).
   */
  viewBoundsHead24: NSRectHead24;
  /** +0x48 id — retained ObjC slot A (nil'd in the ctor @0xcd7bc2, released in the dtor). */
  retainedObjA: object | null;
  /** +0x50 id — retained ObjC slot B (nil'd in the ctor @0xcd7bc2, released in the dtor). */
  retainedObjB: object | null;
  /** +0x58 NSRect — copy of AppKit `NSZeroRect` set in the ctor @0xcd7bcd..0xcd7bd8. */
  viewBoundsCopy: NSRect;

  /**
   * FFOSCPointConversionData::FFOSCPointConversionData(FFSimpleOSC*) — @Flexo 0xcd7ba0.
   *
   * Faithful transcription:
   *  - @0xcd7bb1..bb8   install vtable pointer at +0x00 (vtable for FFOSCPointConversionData + 0x10 = Flexo 0x19106a0).
   *  - @0xcd7bbb        store the FFSimpleOSC* argument at +0x08.
   *  - @0xcd7bbf..bc2   zero the 16B pair at +0x48 & +0x50 (the two retained-id slots).
   *  - @0xcd7bc6..bd8   copy `NSZeroRect` into +0x58 & +0x68 (the 32B viewBoundsCopy slot).
   *  - @0xcd7bdc..bee   fetch FFSimpleOSC._effect ivar and call `-[effect resizedOSCView]`
   *                     (regular msgSend; selref @Flexo 0x1bf05a8).
   *  - @0xcd7bf4..c0c   if the view is non-nil, stret-call the bounds-family selector
   *                     (selref @Flexo 0x1bd44f8) into the 32B stack buffer -0x30(%rbp);
   *                     otherwise zero the low 24B of that buffer (`xorps xmm0; movaps
   *                     xmm0,-0x30(%rbp); movq $0,-0x20(%rbp)` @0xcd7c0e..15).
   *  - @0xcd7c1d..29    copy 24 bytes of that buffer into `this`: 16B origin+width via
   *                     `movups -0x30(%rbp),xmm0` -> `+0x30(%rbx)`, and the next 8B via
   *                     `movq -0x20(%rbp),rax` -> `+0x40(%rbx)`. The height slot (bytes
   *                     24..32 of the returned NSRect) is deliberately not stored.
   *  - @0xcd7c2d..57    stret-call `-[FFSimpleOSC <selref@0x1bf05b0>:pcd:]` on `%r14`,
   *                     passing the just-captured 24B struct at (%rsp) and its trailing
   *                     qword at 0x10(%rsp), with `_effect` in %rcx. The 32B return goes
   *                     into the same -0x30(%rbp) buffer.
   *  - @0xcd7c5c..68    scatter that 32B return into +0x10 & +0x20 of `this`
   *                     (the `convertedRect` NSRect).
   */
  constructor(simpleOSC: FFSimpleOSC) {
    // @0xcd7bbb — +0x08 = simpleOSC
    this.simpleOSC = simpleOSC;

    // @0xcd7bc2 — zero +0x48 & +0x50 (the two retained-id slots)
    this.retainedObjA = null;
    this.retainedObjB = null;

    // @0xcd7bc6..bd8 — viewBoundsCopy := NSZeroRect (copied 32B via two movups)
    this.viewBoundsCopy = {
      originX: NSZeroRect.originX,
      originY: NSZeroRect.originY,
      sizeW: NSZeroRect.sizeW,
      sizeH: NSZeroRect.sizeH,
    };

    // @0xcd7bdc..bee — effect = simpleOSC._effect ; view = -[effect resizedOSCView]
    const effect = ffSimpleOSC_effect_ivar(simpleOSC);
    const view = view_resizedOSCView(effect);

    // -0x30(%rbp) stack buffer that the two stret calls share.
    let boundsHead24: NSRectHead24;

    // @0xcd7bf4..c1b — branch on view != nil
    if (view !== null) {
      // @0xcd7c07 — 1st stret msgSend: [view <boundsSelector>]
      boundsHead24 = resizedOSCView_boundsSelectorStretA(view);
    } else {
      // @0xcd7c0e..15 — else path: zero 24B of the stack buffer
      boundsHead24 = { originX: 0, originY: 0, sizeW: 0 };
    }

    // @0xcd7c1d..29 — store the 24B head into +0x30..+0x48 of `this`
    this.viewBoundsHead24 = boundsHead24;

    // @0xcd7c2d..57 — 2nd stret msgSend: [simpleOSC <selectorB>:effect pcd:boundsHead24]
    // Return goes into `convertedRect` at +0x10..+0x30.
    this.convertedRect = ffSimpleOSC_convertRectSelectorStretB(simpleOSC, effect, boundsHead24);
  }

  /**
   * FFOSCPointConversionData::~FFOSCPointConversionData() [base object dtor, D2] — @Flexo 0xcd7c80.
   *
   * Faithful transcription:
   *  - @0xcd7c89..90  reinstall vtable pointer at +0x00 (Flexo 0x19106a0).
   *  - @0xcd7c93..97  `objc_release( this->retainedObjA @+0x48 )`.
   *  - @0xcd7c9d..a1  `objc_release( this->retainedObjB @+0x50 )`.
   *  - @0xcd7ca7..ad  epilogue / retq.
   */
  destroyBase(): void {
    // Vtable reinstall is a C++ ABI artefact of virtual destruction; no observable effect in TS.
    // @0xcd7c93 / @0xcd7c9d
    objc_release(this.retainedObjA);
    objc_release(this.retainedObjB);
    this.retainedObjA = null;
    this.retainedObjB = null;
  }

  /**
   * FFOSCPointConversionData::~FFOSCPointConversionData() [complete object dtor, D1] — @Flexo 0xcd7cc0.
   *
   * Bit-for-bit identical to D2 in this class (no virtual bases): reinstall vtable @0xcd7cc9..d0,
   * `objc_release(+0x48)` @0xcd7cd3..d7, `objc_release(+0x50)` @0xcd7cdd..e1.
   */
  destroyComplete(): void {
    // @0xcd7cd3 / @0xcd7cdd
    objc_release(this.retainedObjA);
    objc_release(this.retainedObjB);
    this.retainedObjA = null;
    this.retainedObjB = null;
  }

  /**
   * FFOSCPointConversionData::~FFOSCPointConversionData() [deleting dtor, D0] — @Flexo 0xcd7d00.
   *
   * Faithful transcription:
   *  - @0xcd7d09..10  reinstall vtable pointer at +0x00 (Flexo 0x19106a0).
   *  - @0xcd7d13..17  `objc_release( this->retainedObjA @+0x48 )`.
   *  - @0xcd7d1d..21  `objc_release( this->retainedObjB @+0x50 )`.
   *  - @0xcd7d27..30  tail-`jmp` to `operator delete(void*)` (__ZdlPv stub @Flexo 0x1497404).
   */
  destroyAndDelete(): void {
    // @0xcd7d17 / @0xcd7d21
    objc_release(this.retainedObjA);
    objc_release(this.retainedObjB);
    this.retainedObjA = null;
    this.retainedObjB = null;
    // @0xcd7d30 — tail call to operator delete(this).
    operator_delete(this);
  }
}
