// FFDestDominantMotionPrivate.ts — Flexo FFDestDominantMotionPrivate.
//
// Motion-tracker "destination" adapter — thin C++ wrapper that (a) forwards
// four ObjC-style "push a decoded frame" entry points to whichever ObjC
// backend was configured (via `pushFrameFromDest:hgBitmap:` / `pushFrameFromDest:
// buffer2:hgBitmap1:hgBitmap2:` selectors) inside an NSAutoreleasePool scope,
// and (b) dispatches setInputBufferInfo to one of three HFDominantMotion*
// C++ interfaces (interface1 / interface2 / interface360) stored at
// this[+0x00], this[+0x08], this[+0x10] respectively.
//
// This TS file transcribes:
//
//   @0x1360d60  NextDecodedFrame(int, void**, void*)          — FRONTIER
//   @0x1360db0  NextDecodedFields(int, void**, void**, void*) — FRONTIER
//   @0x1360e10  NextDecodedFrame2(int, void**, void**, void*) — FRONTIER
//   @0x1360e70  NextDecodedFrame360(int, HGRef<HGBitmap>*, void*) — FRONTIER
//   @0x1361790  setInputBufferInfo(int, int, bool)            — FULLY PORTED
//
// The four NextDecoded* methods are pure ObjC dispatch shells with the same
// three-step body:
//     pool = [[NSAutoreleasePool alloc] init];   // via _objc_alloc_init
//     r    = [<receiver> <selector>:<args>...];  // via objc_msgSend indirect
//     [pool release];                            // via _objc_release
//     return r;
//
// The receiver is always the *last* void* argument (which the compiler moves
// into rbx before allocating the pool). The selector is a RIP-relative load
// from Flexo's __objc_selrefs; the resolved string is cited on each method.
// Because the receiver's class hierarchy is unknown at TS level (its ivar
// layout and message implementations live in a different framework's ObjC
// class table), each method is throw-stubbed with all its @-addrs cited.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Flexo.framework/Versions/A/Flexo (x86_64 slice).
// Disasm saved: raw-port/re/disasm/Flexo.FFDestDominantMotionPrivate.*.s
//
// Data-constant provenance (RIP-relative reads):
//   @Flexo 0x1c01910   __objc_selrefs slot → cstring @0x17e2d58
//                                         = "pushFrameFromDest:hgBitmap:"
//                        Loaded by NextDecodedFrame @0x1360d7f,
//                                  NextDecodedFrame2 @0x1360e36,
//                                  NextDecodedFrame360 @0x1360e8f.
//   @Flexo 0x1c01918   __objc_selrefs slot → cstring @0x17e2d29
//                                         = "pushFrameFromDest:buffer2:hgBitmap1:hgBitmap2:"
//                        Loaded by NextDecodedFields @0x1360dd3.
//   @Flexo 0x1573324   float 2048.0f = the maximum dimension the tracker
//                                       will accept before clamping (see
//                                       setInputBufferInfo @0x1361809).
//
// Instance layout (recovered from setInputBufferInfo disasm):
//   +0x00  HFDominantMotionTrackerInterface*         interface1  ; nullable
//   +0x08  HFDominantMotionTracker2Interface*        interface2  ; nullable
//   +0x10  HFDominant360MotionTrackerSimpleInterface* interface360; nullable
//   +0x120 double                                    reportedWidthD
//                     ; read via cvttsd2si @0x1361798 to seed the clamp
//   +0x128 double                                    srcOffsetX
//                     ; read via cvttsd2si @0x136181f, passed as arg3
//   +0x130 double                                    reportedHeightD
//                     ; read via cvttsd2si @0x13617a3
//   +0x138 double                                    srcOffsetY
//                     ; read via cvttsd2si @0x136182b, passed as arg4
//   +0x140 int32                                     pixFmtOrEnumArg
//                     ; read via movl @0x1361838, passed as arg5
//
// The three interface signatures (from mangled stubs at @Flexo 0x1496930,
// 0x1496984, 0x1496a5c):
//
//   HFDominantMotionTrackerInterface::SetInputBufferInfo(
//       int, int, int, int, int, int, int)
//     — 7 ints. Called via `callq 0x1496930` @0x136184d.
//
//   HFDominantMotionTracker2Interface::SetInputBufferInfo(
//       int, int, int, int, int,
//       HFDominantMotionTracker2Interface::HFDMT2I_PIXEL_FORMAT,
//       HFDominantMotionTracker2Interface::HFDMT2I_PIXEL_COLORSPACE)
//     — 5 ints + 2 enums. Called via `callq 0x1496984` @0x1361867.
//
//   HFDominant360MotionTrackerSimpleInterface::SetInputBufferInfo(
//       size_t, size_t,
//       HFDominant360MotionTrackerSimpleInterface::HFD360MTSI_COLORSPACE)
//     — 2 size_t + 1 enum. TAIL-called via `jmp 0x1496a5c` @0x136187d.

/** Opaque handle for an ObjC id (Objective-C object pointer). Kept as an
 *  `unknown` alias so we don't invent an interface for the runtime receiver
 *  (its class hierarchy is only known inside FCP's ObjC image). */
export type ObjCId = unknown;

/** The 2048.0f (float) constant at @Flexo 0x1573324 — the maximum allowed
 *  dimension. All ints > 2048 are clamped down to 2048, and the *smaller*
 *  dimension is proportionally re-scaled. Read as a scalar float via
 *  `movss 0x211b13(%rip), %xmm2` @0x1361809. */
const MAX_DIMENSION_0x1573324 = Math.fround(2048.0);

/**
 * HFDominantMotionTrackerInterface::SetInputBufferInfo(int,int,int,int,int,int,int)
 * @stub Flexo 0x1496930  (mangled __ZN32HFDominantMotionTrackerInterface18SetInputBufferInfoEiiiiiii).
 * External C++ callee — undecoded here.
 */
function HFDominantMotionTrackerInterface_SetInputBufferInfo(
  _this: ObjCId,
  _a1: number,
  _a2: number,
  _a3: number,
  _a4: number,
  _a5: number,
  _a6: number,
  _a7: number,
): number {
  throw new Error(
    "HFDominantMotionTrackerInterface::SetInputBufferInfo @Flexo stub 0x1496930 (called from FFDestDominantMotionPrivate::setInputBufferInfo @0x136184d) — external C++ frontier, not yet transcribed",
  );
}

/**
 * HFDominantMotionTracker2Interface::SetInputBufferInfo(
 *   int,int,int,int,int, HFDMT2I_PIXEL_FORMAT, HFDMT2I_PIXEL_COLORSPACE)
 * @stub Flexo 0x1496984 (mangled __ZN33HFDominantMotionTracker2Interface18SetInputBufferInfoEiiiiiNS_20HFDMT2I_PIXEL_FORMATENS_24HFDMT2I_PIXEL_COLORSPACEE).
 */
function HFDominantMotionTracker2Interface_SetInputBufferInfo(
  _this: ObjCId,
  _a1: number,
  _a2: number,
  _a3: number,
  _a4: number,
  _a5: number,
  _pixelFormat: number,
  _pixelColorspace: number,
): number {
  throw new Error(
    "HFDominantMotionTracker2Interface::SetInputBufferInfo @Flexo stub 0x1496984 (called from FFDestDominantMotionPrivate::setInputBufferInfo @0x1361867) — external C++ frontier, not yet transcribed",
  );
}

/**
 * HFDominant360MotionTrackerSimpleInterface::SetInputBufferInfo(
 *   size_t, size_t, HFD360MTSI_COLORSPACE)
 * @stub Flexo 0x1496a5c (mangled __ZN41HFDominant360MotionTrackerSimpleInterface18SetInputBufferInfoEmmNS_21HFD360MTSI_COLORSPACEE).
 */
function HFDominant360MotionTrackerSimpleInterface_SetInputBufferInfo(
  _this: ObjCId,
  _a1: number,
  _a2: number,
  _colorspace: number,
): number {
  throw new Error(
    "HFDominant360MotionTrackerSimpleInterface::SetInputBufferInfo @Flexo stub 0x1496a5c (tail-called from FFDestDominantMotionPrivate::setInputBufferInfo @0x136187d) — external C++ frontier, not yet transcribed",
  );
}

/**
 * _objc_alloc_init(Class) — Objective-C runtime helper (equivalent to
 * `[[cls alloc] init]`). @stub Flexo 0x1497908.
 * Every NextDecoded* method opens an NSAutoreleasePool via this stub.
 */
function objc_alloc_init(_cls: ObjCId): ObjCId {
  throw new Error(
    "_objc_alloc_init @Flexo stub 0x1497908 — external ObjC-runtime frontier, not yet transcribed",
  );
}

/**
 * _objc_release(id) — Objective-C runtime helper (release ARC-owned pool).
 * Every NextDecoded* method drains the autorelease pool via this stub.
 * Loaded as a RIP-relative indirect call target (fixup pointer inside
 * __la_symbol_ptr / __got); see e.g. `callq *0x58c969(%rip)` @0x1360d99.
 */
function objc_release(_id: ObjCId): void {
  throw new Error(
    "_objc_release @Flexo (indirect fixup, e.g. @0x1360d99) — external ObjC-runtime frontier, not yet transcribed",
  );
}

/**
 * objc_msgSend(receiver, selector, ...args) — the classic Objective-C
 * message-send trampoline. Loaded as an indirect call site via a fixup slot
 * (e.g. `callq *0x58c92c(%rip)` @0x1360d8e). Undecoded here: dispatching to
 * a real ObjC receiver requires the receiver's class implementation.
 */
function objc_msgSend(
  _receiver: ObjCId,
  _selector: string,
  ..._args: unknown[]
): number {
  throw new Error(
    "objc_msgSend @Flexo (indirect fixup, e.g. @0x1360d8e / @0x1360de9 / @0x1360e45 / @0x1360e9e) — external ObjC-runtime frontier, not yet transcribed",
  );
}

/** _OBJC_CLASS_$_NSAutoreleasePool — the ObjC class object handle used as
 *  the argument to _objc_alloc_init. Loaded as a RIP-relative literal-pool
 *  fixup (e.g. `movq 0x58c629(%rip), %rdi` @0x1360d70). Undecoded (a real
 *  Class handle here would require an ObjC runtime image; string-typing
 *  it makes the throw-stubs above self-documenting). */
const NSAutoreleasePool_class: ObjCId = "NSAutoreleasePool";

/**
 * FFDestDominantMotionPrivate — the "destination" adapter for the FCP
 * dominant-motion tracker channel. Owns three optional C++ backend
 * interfaces and exposes four "push a decoded frame" entry points.
 *
 * The four NextDecoded* methods are all *pure ObjC dispatch shells* — they
 * carry no algorithmic content of their own. Their receiver argument is an
 * ObjC id whose actual class implements the tracker input pipeline. All four
 * are throw-stubbed with the exact selector strings and arg mapping.
 */
export class FFDestDominantMotionPrivate {
  /** +0x00 — HFDominantMotionTrackerInterface* (nullable). Selected first
   *  by setInputBufferInfo's dispatch chain @0x136183f-@0x1361845. */
  interface1: ObjCId = null;
  /** +0x08 — HFDominantMotionTracker2Interface* (nullable). Selected second
   *  by setInputBufferInfo's dispatch chain @0x1361858-@0x136185f. */
  interface2: ObjCId = null;
  /** +0x10 — HFDominant360MotionTrackerSimpleInterface* (nullable). The
   *  final fallback branch in setInputBufferInfo @0x1361872. */
  interface360: ObjCId = null;

  /** +0x120 — double, reported input width. */
  reportedWidthD = 0.0;
  /** +0x128 — double, source horizontal offset (passed as arg3 to
   *  interface1 / interface2 SetInputBufferInfo). */
  srcOffsetX = 0.0;
  /** +0x130 — double, reported input height. */
  reportedHeightD = 0.0;
  /** +0x138 — double, source vertical offset (passed as arg4 to
   *  interface1 / interface2 SetInputBufferInfo). */
  srcOffsetY = 0.0;
  /** +0x140 — int32, extra pixel-format / enum parameter (passed as arg5
   *  to interface1 / interface2 SetInputBufferInfo). */
  pixFmtOrEnumArg = 0 | 0;

  /**
   * @@0x1360d60  NextDecodedFrame(int frameNum, void** unusedOut, void* receiver)
   *
   * Body (28 lines of asm):
   *   rbx = receiver (arg3 = rdx)                     ; @0x1360d6a
   *   r14 = frameNum (arg1 = rsi)                     ; @0x1360d6d
   *   pool = _objc_alloc_init(NSAutoreleasePool_class); @0x1360d70-@0x1360d77
   *   sel  = @sel(pushFrameFromDest:hgBitmap:)         ; @0x1360d7f
   *                        (selref @0x1c01910 → cstring @0x17e2d58)
   *   ret  = objc_msgSend(rbx=receiver, sel,
   *                       rdx=r14=frameNum, rcx=0)     ; @0x1360d8e
   *                                                    ; (i.e.
   *                                                    ;  [receiver
   *                                                    ;    pushFrameFromDest:
   *                                                    ;      frameNum
   *                                                    ;    hgBitmap:nil])
   *   _objc_release(pool);                             ; @0x1360d99
   *   return (int32_t)ret;                             ; @0x1360d9f-@0x1360d9f
   *
   * The `unusedOut` (void**) parameter is completely ignored by the asm —
   * it is neither read nor written; only its register is clobbered when the
   * msgSend re-uses %rdx.
   */
  NextDecodedFrame(_frameNum: number, _unusedOut: unknown[], _receiver: ObjCId): number {
    // Faithful shell — the real work is in the receiver's ObjC implementation.
    const pool = objc_alloc_init(NSAutoreleasePool_class);
    try {
      // @0x1360d7f: sel = pushFrameFromDest:hgBitmap: (selref @0x1c01910)
      return objc_msgSend(_receiver, "pushFrameFromDest:hgBitmap:", _frameNum, null);
    } finally {
      objc_release(pool);
    }
  }

  /**
   * @@0x1360db0  NextDecodedFields(int frameNum, void** outA, void** outB, void* receiver)
   *
   * Body (31 lines):
   *   rbx = receiver (arg4 = rcx)                     ; @0x1360dbb
   *   r14 = outB     (arg3 = rdx)                     ; @0x1360dbe
   *   r15 = frameNum (arg1 = rsi)                     ; @0x1360dc1
   *   pool = _objc_alloc_init(NSAutoreleasePool_class); @0x1360dc4-@0x1360dcb
   *   sel  = @sel(pushFrameFromDest:buffer2:hgBitmap1:hgBitmap2:)
   *                        (selref @0x1c01918 → cstring @0x17e2d29)  ; @0x1360dd3
   *   ret  = objc_msgSend(rbx=receiver, sel,
   *                       rdx=r15=frameNum, rcx=r14=outB,
   *                       r8=0, r9=0)                  ; @0x1360de9
   *                        (i.e. [receiver
   *                                pushFrameFromDest:frameNum
   *                                buffer2:outB
   *                                hgBitmap1:nil
   *                                hgBitmap2:nil])
   *   _objc_release(pool);                             ; @0x1360df4
   *   return (int32_t)ret;
   *
   * Note that `outA` (the second `void**`, which is arg2 = rdx BEFORE it is
   * overwritten with outB) is completely dropped on the floor — never read,
   * never written. This is the exact ABI mismatch a wrapper layer commonly
   * uses to expose a superset signature on top of a narrower ObjC selector.
   */
  NextDecodedFields(
    _frameNum: number,
    _outA: unknown[],
    _outB: unknown[],
    _receiver: ObjCId,
  ): number {
    const pool = objc_alloc_init(NSAutoreleasePool_class);
    try {
      // @0x1360dd3: sel = pushFrameFromDest:buffer2:hgBitmap1:hgBitmap2:
      //             (selref @0x1c01918)
      return objc_msgSend(
        _receiver,
        "pushFrameFromDest:buffer2:hgBitmap1:hgBitmap2:",
        _frameNum,
        _outB,
        null,
        null,
      );
    } finally {
      objc_release(pool);
    }
  }

  /**
   * @@0x1360e10  NextDecodedFrame2(int frameNum, void** zeroOut, void** unused, void* receiver)
   *
   * Body (29 lines):
   *   rbx = receiver (arg4 = rcx)                     ; @0x1360e1a
   *   r14 = frameNum (arg1 = rsi)                     ; @0x1360e1d
   *   *rdx = 0   (i.e. `*zeroOut = nullptr`)           ; @0x1360e20  movq $0,(%rdx)
   *   pool = _objc_alloc_init(NSAutoreleasePool_class); @0x1360e27-@0x1360e2e
   *   sel  = @sel(pushFrameFromDest:hgBitmap:)         ; @0x1360e36
   *                        (selref @0x1c01910 → cstring @0x17e2d58)
   *   ret  = objc_msgSend(rbx=receiver, sel,
   *                       rdx=r14=frameNum, rcx=0)     ; @0x1360e45
   *                        (i.e. [receiver
   *                                pushFrameFromDest:frameNum
   *                                hgBitmap:nil])
   *   _objc_release(pool);                             ; @0x1360e50
   *   return (int32_t)ret;
   *
   * The distinguishing behavior of NextDecodedFrame2 relative to
   * NextDecodedFrame is the pre-emptive `*zeroOut = null` store at @0x1360e20:
   * callers that own a `void*` they want cleared before the tracker runs
   * pass it as arg2 and get it nulled first. The third `void**` argument is
   * ignored (never read/written).
   */
  NextDecodedFrame2(
    _frameNum: number,
    zeroOut: (unknown | null)[],
    _unused: unknown[],
    _receiver: ObjCId,
  ): number {
    // @0x1360e20: movq $0, (%rdx)   ; store nil into *zeroOut
    if (zeroOut.length > 0) zeroOut[0] = null;
    const pool = objc_alloc_init(NSAutoreleasePool_class);
    try {
      // @0x1360e36: sel = pushFrameFromDest:hgBitmap: (selref @0x1c01910)
      return objc_msgSend(_receiver, "pushFrameFromDest:hgBitmap:", _frameNum, null);
    } finally {
      objc_release(pool);
    }
  }

  /**
   * @@0x1360e70  NextDecodedFrame360(int frameNum,
   *                                  HGRef<HGBitmap>* bitmapPtr,
   *                                  void* receiver)
   *
   * Body (28 lines):
   *   rbx = receiver  (arg3 = rdx)                    ; @0x1360e7a
   *   r14 = frameNum  (arg1 = rsi)                    ; @0x1360e7d
   *   pool = _objc_alloc_init(NSAutoreleasePool_class); @0x1360e80-@0x1360e87
   *   sel  = @sel(pushFrameFromDest:hgBitmap:)         ; @0x1360e8f
   *                        (selref @0x1c01910 → cstring @0x17e2d58)
   *   ret  = objc_msgSend(rbx=receiver, sel,
   *                       rdx=0, rcx=r14=frameNum)     ; @0x1360e9e
   *                        (i.e. [receiver
   *                                pushFrameFromDest:nil
   *                                hgBitmap:frameNum])
   *   _objc_release(pool);                             ; @0x1360ea9
   *   return (int32_t)ret;
   *
   * Note the unusual ObjC arg permutation: the `pushFrameFromDest:` slot
   * receives *nil* and the `hgBitmap:` slot receives the frame number — the
   * 360-tracker's implementation of this selector deliberately swaps the
   * apparent naming to reuse the same selector across code paths. This is
   * the asm at @0x1360e99 `xorl %edx,%edx` followed by @0x1360e9b `movq %r14,%rcx`.
   * The `bitmapPtr` argument (arg2 = HGRef<HGBitmap>*) is *not* read; it
   * is only used to satisfy the C++ signature at the call site.
   */
  NextDecodedFrame360(
    _frameNum: number,
    _bitmapPtr: unknown /* HGRef<HGBitmap>* — arg2, not read by this method */,
    _receiver: ObjCId,
  ): number {
    const pool = objc_alloc_init(NSAutoreleasePool_class);
    try {
      // @0x1360e8f: sel = pushFrameFromDest:hgBitmap: (selref @0x1c01910)
      // @0x1360e99: xorl %edx,%edx   → arg2 (pushFrameFromDest:) = nil
      // @0x1360e9b: movq %r14, %rcx  → arg3 (hgBitmap:)          = frameNum
      return objc_msgSend(_receiver, "pushFrameFromDest:hgBitmap:", null, _frameNum);
    } finally {
      objc_release(pool);
    }
  }

  /**
   * @@0x1361790  setInputBufferInfo(int width_arg, int height_arg, bool crop)
   *
   * Fully decoded pure-math / dispatch method. Reads five scalars from the
   * instance (this[+0x120] .. this[+0x140]) — two "reported" dimensions and
   * two source offsets plus one integer parameter — clamps whichever of the
   * two int-converted dimensions is bigger to 2048, proportionally re-scales
   * the smaller one, and then forwards to whichever of the three
   * HFDominantMotion* interfaces is non-null (checked in order 1, 2, 360).
   *
   * Faithful transcription of the asm:
   *
   *   int W = (int)(double)this[0x120];                    ; cvttsd2si @0x1361798
   *   int origH = height_arg;                              ; movl %edx,%eax @0x13617a1
   *   int H = (int)(double)this[0x130];                    ; cvttsd2si @0x13617a3
   *   int origW = width_arg;                               ; movl %esi,%r10d @0x13617ab
   *
   *   int outW = W, outH = H;                              ; local stack copies
   *                                                          -0x8=outW, -0x4=outH
   *   if (crop) {                                          ; testl %ecx,%ecx @0x13617b5
   *     if (W > H) goto tryClampMax_W;                     ; jg @0x13617cd
   *     if (H > 0x800) goto adjust_H_is_max;               ; jg @0x13617eb
   *     goto dispatch;                                     ; jmp @0x136181f
   *   } else {                                             ; !crop path
   *     if (W <= H) {                                      ; jle @0x13617e3
   *       if (H < 0x801) goto dispatch;                    ; jl @0x136181f
   *       goto adjust_H_is_max;                            ; fall to @0x13617eb
   *     }
   *     // fall through to tryClampMax_W (W > H)
   *   }
   * tryClampMax_W:                                          ; @0x13617cd
   *   if (W <= 0x800) goto dispatch;                       ; jle @0x136181f
   *   // adjust_W_is_max:                                   ; @0x13617d6
   *   pMin = &outH; pMax = &outW; smaller = H; larger = W;
   *   goto compute;
   * adjust_H_is_max:                                        ; @0x13617eb
   *   pMin = &outW; pMax = &outH; smaller = W; larger = H;
   * compute:                                                ; @0x13617f9
   *   *pMax = 0x800;                                       ; movl $0x800,(%rsi)  @0x1361803
   *   *pMin = (int)((float)0x800 / (float)larger * (float)smaller);
   *                                                        ; @0x13617f9-@0x136181d
   * dispatch:                                               ; @0x136181f
   *   int srcOffX  = (int)(double)this[0x128];             ; cvttsd2si @0x136181f
   *   int64 W64    = (int64_t)outW;                        ; movslq -0x8(%rbp),%rsi @0x1361827
   *   int srcOffY  = (int)(double)this[0x138];             ; cvttsd2si @0x136182b
   *   int64 H64    = (int64_t)outH;                        ; movslq -0x4(%rbp),%rdx @0x1361834
   *   int pxParam  = (int32_t)this[0x140];                 ; movl @0x1361838
   *   void* if1 = this[0x00];
   *   if (if1) {                                           ; test/je @0x1361842-@0x1361845
   *     return HFDominantMotionTrackerInterface::
   *              SetInputBufferInfo(if1, outW, outH, srcOffX, srcOffY, pxParam,
   *                                 origW, origH);          ; @0x136184d push_rax_r10
   *   }
   *   void* if2 = this[0x08];
   *   if (if2) {                                           ; test/je @0x136185c-@0x136185f
   *     return HFDominantMotionTracker2Interface::
   *              SetInputBufferInfo(if2, outW, outH, srcOffX, srcOffY, pxParam,
   *                                 origW, origH);          ; @0x1361867 push_rax_r10
   *   }
   *   void* if360 = this[0x10];                            ; @0x1361872
   *   return HFDominant360MotionTrackerSimpleInterface::
   *            SetInputBufferInfo(if360, (size_t)outW, (size_t)outH, (int)origH);
   *                                                        ; @0x136187d tail jmp
   *
   * Numerics: all clamp math is IEEE-754 f32 (cvtsi2ss / divss / mulss /
   * cvttss2si), and the "reported" dims from this[0x120]/[0x130] use double-
   * to-int truncation (cvttsd2si — round-toward-zero). All Math.fround-narrowed.
   */
  setInputBufferInfo(width_arg: number, height_arg: number, crop: boolean): number {
    // @0x1361798: r8d = (int)(double)this.reportedWidthD  (cvttsd2si is trunc-toward-0)
    const W = truncToInt32(this.reportedWidthD);
    // @0x13617a1: %eax = %edx = height_arg (saved before edx gets clobbered)
    const origH = height_arg | 0;
    // @0x13617a3: %edx = (int)(double)this.reportedHeightD
    const H = truncToInt32(this.reportedHeightD);
    // @0x13617ab: %r10d = %esi = width_arg
    const origW = width_arg | 0;

    // @0x13617ae/@0x13617b2: local stack slots -0x8, -0x4 seed with (W, H).
    let outW = W | 0;
    let outH = H | 0;

    // Whichever we'll clamp to 0x800; both start unassigned.
    // We follow the exact asm branch structure. `writeMax` receives the
    // 0x800 store, `writeMin` receives the scaled smaller-dim store.
    // We track them as booleans on which local var (W vs H) is which.
    // adjust==null → no adjustment needed (skip to dispatch).
    // adjust==='W_is_max' → outW=0x800, outH=scaled
    // adjust==='H_is_max' → outH=0x800, outW=scaled
    let adjust: null | "W_is_max" | "H_is_max" = null;

    // @0x13617b5: testl %ecx,%ecx  ; je @0x13617c8  (jump if !crop)
    if (crop) {
      // crop path
      // @0x13617b9: cmpl %edx, %r8d ; jg @0x13617cd  (jump if W > H)
      if (W > H) {
        // fall to @0x13617cd: cmpl $0x800, %r8d ; jle @0x136181f
        if (W > 0x800) adjust = "W_is_max";
        // else: skip (jle @0x136181f → dispatch)
      } else {
        // @0x13617be: cmpl $0x800, %edx ; jg @0x13617eb
        if (H > 0x800) adjust = "H_is_max";
        // else: @0x13617c6 jmp @0x136181f → dispatch
      }
    } else {
      // !crop path
      // @0x13617c8: cmpl %edx, %r8d ; jle @0x13617e3  (jump if W <= H)
      if (W <= H) {
        // @0x13617e3: cmpl $0x801, %edx ; jl @0x136181f (skip if H < 0x801)
        if (H >= 0x801) adjust = "H_is_max";
      } else {
        // fall through to @0x13617cd: cmpl $0x800, %r8d ; jle @0x136181f
        if (W > 0x800) adjust = "W_is_max";
      }
    }

    // @0x13617d6-@0x13617e1 (W_is_max) or @0x13617eb-@0x13617f6 (H_is_max)
    // followed by the shared compute at @0x13617f9-@0x136181d.
    if (adjust !== null) {
      // cvtsi2ss %r9d, %xmm0    xmm0 = (float)smaller
      // cvtsi2ss %r8d, %xmm1    xmm1 = (float)larger
      // movl     $0x800, (%rsi) *pMax = 0x800
      // movss    2048.0f, %xmm2 xmm2 = 2048.0f
      // divss    %xmm1, %xmm2   xmm2 = 2048 / larger
      // mulss    %xmm0, %xmm2   xmm2 = 2048 * smaller / larger
      // cvttss2si %xmm2, %edx   *pMin = (int)xmm2  (trunc-toward-0)
      if (adjust === "W_is_max") {
        const smaller = Math.fround(H | 0);
        const larger = Math.fround(W | 0);
        const scale = Math.fround(MAX_DIMENSION_0x1573324 / larger);
        const scaled = truncToInt32Float(Math.fround(scale * smaller));
        outW = 0x800;
        outH = scaled;
      } else {
        // "H_is_max"
        const smaller = Math.fround(W | 0);
        const larger = Math.fround(H | 0);
        const scale = Math.fround(MAX_DIMENSION_0x1573324 / larger);
        const scaled = truncToInt32Float(Math.fround(scale * smaller));
        outH = 0x800;
        outW = scaled;
      }
    }

    // @0x136181f-@0x1361838: read the dispatch args from `this`.
    const srcOffX = truncToInt32(this.srcOffsetX);       // @0x136181f
    const W64 = outW | 0;                                 // @0x1361827 (movslq)
    const srcOffY = truncToInt32(this.srcOffsetY);       // @0x136182b
    const H64 = outH | 0;                                 // @0x1361834 (movslq)
    const pxParam = this.pixFmtOrEnumArg | 0;             // @0x1361838

    // @0x136183f-@0x1361845: if (this.interface1) → call interface1 path.
    if (this.interface1 !== null && this.interface1 !== undefined) {
      // @0x136184d: pushq %rax(=origH) ; pushq %r10(=origW) ; callq stub
      //   → args on stack: [rsp+0]=origW, [rsp+8]=origH (SysV arg6, arg7)
      return HFDominantMotionTrackerInterface_SetInputBufferInfo(
        this.interface1,
        W64,
        H64,
        srcOffX,
        srcOffY,
        pxParam,
        origW,
        origH,
      );
    }
    // @0x1361858-@0x136185f: else if (this.interface2) → interface2 path.
    if (this.interface2 !== null && this.interface2 !== undefined) {
      // @0x1361867: same push+call pattern with different callee.
      return HFDominantMotionTracker2Interface_SetInputBufferInfo(
        this.interface2,
        W64,
        H64,
        srcOffX,
        srcOffY,
        pxParam,
        origW,   // HFDMT2I_PIXEL_FORMAT slot on stack (=origW passed in as int)
        origH,   // HFDMT2I_PIXEL_COLORSPACE slot on stack (=origH passed in as int)
      );
    }
    // @0x1361872: else tail-call the 360 interface.
    //   rdi = this[0x10];  ecx = eax = origH;  jmp 0x1496a5c
    return HFDominant360MotionTrackerSimpleInterface_SetInputBufferInfo(
      this.interface360,
      W64,                          // size_t (sign-extended from int32)
      H64,                          // size_t
      origH,                        // HFD360MTSI_COLORSPACE enum (=origH as int32)
    );
  }
}

/**
 * cvttsd2si — truncate an IEEE-754 double toward zero, saturating to the
 * int32 "indefinite integer" (0x80000000) on out-of-range inputs. Faithful
 * scalar model of the x86 `cvttsd2si` instruction. Used by setInputBufferInfo
 * to read the reported/offset dims out of this[+0x120..0x140].
 */
function truncToInt32(x: number): number {
  // NaN / Infinity / out-of-i32-range → 0x80000000 (indefinite integer)
  if (!Number.isFinite(x)) return -0x80000000;
  const t = Math.trunc(x);
  if (t < -0x80000000 || t > 0x7fffffff) return -0x80000000;
  return t | 0;
}

/**
 * cvttss2si — same as cvttsd2si but for f32. Used @0x1361819 for the
 * rescaled dimension.
 */
function truncToInt32Float(x: number): number {
  if (!Number.isFinite(x)) return -0x80000000;
  const t = Math.trunc(x);
  if (t < -0x80000000 || t > 0x7fffffff) return -0x80000000;
  return t | 0;
}
