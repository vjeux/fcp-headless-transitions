// FFAutoReframeAnalysis — transcribed from Flexo.framework x86_64 slice.
// Class provides helpers for the Auto-Reframe smart-conform feature: it inspects
// an FFAnchoredObject (a titled/masked/keyframed clip) to determine whether the
// clip already covers the sequence, whether it has a crop filter installed, and
// how to derive framing/crop given the target aspect ratio.
//
// x86_64 symbol table (via nm -arch x86_64 …/Flexo):
//   @0x1310180  FFAutoReframeAnalysis::AnchoredObjectMatchesSequenceDimensions(FFAnchoredObject*, signed char)
//   @0x13103f0  FFAutoReframeAnalysis::AnchoredObjectHasCropFilterApplied(FFAnchoredObject*)
//   @0x1310470  FFAutoReframeAnalysis::GetFramingForAnchoredObject(FFAnchoredObject*, CGSize&)
//   @0x1310600  FFAutoReframeAnalysis::AdjustLRTBToBounds(CGRect const&, CGPoint const&, double&, double&, double&, double&)
//   @0x13106d0  FFAutoReframeAnalysis::GetCropForAnchoredObject(FFAnchoredObject*, CGRect, FFAutoReframeAnalysisResults&)

/** Opaque FCP model object; only used as a token by the ObjC-heavy siblings. */
export type FFAnchoredObject = unknown;

/** Output struct populated by GetCropForAnchoredObject — direct TS mapping of
 *  the FFAutoReframeAnalysisResults C++ POD referenced at the call site
 *  @0x13106d0. Precise layout is not decoded here (undisassembled writer body);
 *  the field set below covers what AdjustLRTBToBounds consumes. */
export interface FFAutoReframeAnalysisResults {
  cropLeft: number;
  cropRight: number;
  cropTop: number;
  cropBottom: number;
}

/** CGRect / CGPoint / CGSize kept as plain records to avoid pulling CoreGraphics. */
export interface CGSize { width: number; height: number }
export interface CGPoint { x: number; y: number }
export interface CGRect { origin: CGPoint; size: CGSize }

/** Mutable double reference, matching the C++ `double&` out-parameters used by
 *  AdjustLRTBToBounds — the callee reads and writes `value`. */
export interface DoubleRef { value: number }

export class FFAutoReframeAnalysis {
  /**
   * AnchoredObjectMatchesSequenceDimensions(FFAnchoredObject*, signed char) @0x1310180
   *
   * ICF-folded / stripped in the shipped binary — otool -tV emits no body
   * label at this address so no instructions are available to transcribe.
   * The decode-integrity rule forbids guessing; this stub is the pending marker.
   */
  static AnchoredObjectMatchesSequenceDimensions(
    _obj: FFAnchoredObject,
    _flag: number,
  ): boolean {
    // Body ICF-folded at @0x1310180; awaiting a decoded slice.
    throw new Error("FFAutoReframeAnalysis.AnchoredObjectMatchesSequenceDimensions unresolved @0x1310180");
  }

  /**
   * AnchoredObjectHasCropFilterApplied(FFAnchoredObject*) @0x13103f0
   *
   * ObjC-heavy: sends `-arrangedEffects` (or similar) via cached selector
   * @0x1bab998, looks up the crop filter by the C-string key
   *   _FFCropFilterIDKey       (external symbol, unresolved value)
   * then does an isKindOfClass check against
   *   _OBJC_CLASS_$_FFHeCropEffect  (external ObjC class ref)
   * via _objc_opt_class @0x149798c + _objc_opt_isKindOfClass @0x1497992
   * (both dyld stubs — inspected at their addresses in the __stubs section).
   * Result path negates the effect's `-enabled` state (sete on the returned
   * BOOL) to signal "crop filter present AND enabled".
   *
   * Cannot be executed here without ObjC runtime + FCP model bridging.
   */
  static AnchoredObjectHasCropFilterApplied(_obj: FFAnchoredObject): boolean {
    // ObjC runtime required (arrangedEffects / _FFCropFilterIDKey / FFHeCropEffect); see @0x13103f0.
    throw new Error("FFAutoReframeAnalysis.AnchoredObjectHasCropFilterApplied unresolved @0x13103f0");
  }

  /**
   * GetFramingForAnchoredObject(FFAnchoredObject*, CGSize& out) @0x1310470
   *
   * Reads the anchored object's intrinsic dimensions (via _objc_msgSend_stret
   * @0x1497986 for a CGSize return), then queries a chain of ObjC selectors
   * cached at @0x1bab9b0/@0x1babcc8/@0x1bafe30/@0x1baf908/@0x1bafb90 to walk
   * into media-source geometry. Divides width by height to compare against
   * two aspect-ratio thresholds loaded via RIP-relative constants at
   *   @0x1310524 → constant near @0x156ca00 (double, undecoded)
   *   @0x1310562 → constant near @0x156ca00 (double, undecoded)
   *   @0x13105a5 → constant near @0x156ca00 (double, undecoded)
   * Emits either `out = { width: 1.0, height: 1.0/aspect }` or the mirror form
   * `out = { width: aspect, height: 1.0 }` depending on which threshold was
   * exceeded (movabsq $0x3ff0000000000000 = double 1.0 written to *rbx twice).
   *
   * All selector strings and threshold constants require targeted decoding
   * that is not in scope for this class transcription pass.
   */
  static GetFramingForAnchoredObject(_obj: FFAnchoredObject, _outSize: CGSize): void {
    // Depends on undecoded selector cache + threshold constants; see @0x1310470.
    throw new Error("FFAutoReframeAnalysis.GetFramingForAnchoredObject unresolved @0x1310470");
  }

  /**
   * AdjustLRTBToBounds(CGRect const& bounds, CGPoint const& p,
   *                    double& left, double& right,
   *                    double& top,  double& bottom) @0x1310600
   *
   * Pure math: keeps the point `p` inside a viewport of size (width, height)
   * = (bounds.size.width, bounds.size.height) by re-distributing the given
   * left/right and top/bottom insets. The residual = axis_size - (near + far).
   * If residual == axis_size (i.e. near+far == 0), the axis is left alone.
   * Otherwise the routine picks the smaller of "p offset from origin" and
   * "axis_size - halfResidual" as the new `near` inset, clamps to 0 when p is
   * on the opposite side of centre, and derives the far inset from the residual.
   *
   * Byte-for-byte decode of the disassembly:
   *   @0x1310604 xmm3 = bounds.size.width        (rdi + 0x10)
   *   @0x1310609 xmm1 = bounds.size.height       (rdi + 0x18)
   *   @0x131060e xmm0 = *left + *right           → sumX
   *   @0x1310616 xmm4 = width  − sumX            → residX
   *   @0x131061e xmm0 = *top  + *bottom          → sumY
   *   @0x1310628 xmm2 = height − sumY            → residY
   *   @0x1310630 branch: if residX == width (⇒ sumX == 0) skip X-adjust
   *   @0x1310638 xmm5 = 0.5 * residX             (const 0.5 @0x156ca38)
   *   @0x1310644 xmm6 = p.x
   *   @0x1310648 xmm0 = 0.5*residX + p.x
   *   @0x1310650 xmm7 = width − 0.5*residX
   *   @0x1310658 cmpltsd xmm3, xmm0              → mask = (0.5*residX + p.x) < width
   *   @0x131065d blendvpd → xmm7 = mask ? p.x : (width − 0.5*residX)
   *   @0x1310662 xmm7 −= 0.5*residX              → new *left
   *   @0x1310666 store *left = xmm7
   *   @0x131066a xmm7 += residX                  → new *left + residX
   *   @0x131066e xmm3 = width − (new *left + residX) → new *right
   *   @0x1310672 store *right = xmm3
   *   @0x1310676 branch: if residY == height (⇒ sumY == 0) skip Y-adjust
   *   @0x131067e xmm3 = 0.5 * residY             (const 0.5 @0x156ca38)
   *   @0x131068a xmm5 = p.y
   *   @0x131068f ucomisd; @0x1310697 jbe → if p.y <= 0.5*residY, skip blend
   *   @0x1310699 xmm0 = 0.5*residY + p.y
   *   @0x13106a1 xmm4 = height − 0.5*residY
   *   @0x13106a9 cmpltsd xmm1, xmm0              → mask = (0.5*residY + p.y) < height
   *   @0x13106ae blendvpd → xmm4 = mask ? p.y : (height − 0.5*residY)
   *   @0x13106b3 xmm4 −= 0.5*residY              → new *top
   *   @0x13106b7 store *top = xmm4
   *   @0x13106bc xmm2 += new *top                → new *top + residY
   *   @0x13106c0 xmm1 = height − xmm2            → new *bottom
   *   @0x13106c4 store *bottom = xmm1
   *
   * IEEE-754 doubles throughout — CGFloat on macOS x86_64 is 64-bit. Uses
   * default rounding; the two RIP-relative loads at @0x1310638/@0x131067e
   * both resolve to the same pooled literal double 0.5 (u64 0x3fe0000000000000)
   * at file offset @0x156ca38 (verified via raw-port/army/tools/resolve.py).
   */
  static AdjustLRTBToBounds(
    bounds: CGRect,
    p: CGPoint,
    left: DoubleRef,
    right: DoubleRef,
    top: DoubleRef,
    bottom: DoubleRef,
  ): void {
    // @0x1310604..0x1310628 — load axis sizes and compute residuals.
    const width = bounds.size.width;   // xmm3 @0x1310604
    const height = bounds.size.height; // xmm1 @0x1310609
    const residX = width - (left.value + right.value);   // xmm4 @0x1310616
    const residY = height - (top.value + bottom.value);  // xmm2 @0x1310628

    // @0x1310630 — X axis: only adjust if the sum was non-zero.
    // "residX == width" ⇔ "left+right == 0"; ucomisd unordered-safe via jne/jnp
    // pair also skips when either operand is NaN.
    if (residX !== width) {
      const halfX = 0.5 * residX;                        // xmm5 @0x1310638..0x1310640, const 0.5 @0x156ca38
      const sumX = halfX + p.x;                          // xmm0 @0x1310648
      const rightCandidate = width - halfX;              // xmm7 @0x1310650
      // @0x1310658 cmpltsd: mask = (halfX + p.x) < width
      const chosen = sumX < width ? p.x : rightCandidate; // @0x131065d blendvpd
      const newLeft = chosen - halfX;                    // @0x1310662 subsd
      left.value = newLeft;                              // @0x1310666 store
      right.value = width - (newLeft + residX);          // @0x131066a..0x1310672
    }

    // @0x1310676 — Y axis: only adjust if top+bottom != 0.
    if (residY !== height) {
      const halfY = 0.5 * residY;                        // xmm3 @0x131067e..0x1310686, const 0.5 @0x156ca38
      const py = p.y;                                    // xmm5 @0x131068a
      // @0x1310697 jbe → skip blend if p.y <= halfY (p is on the near side).
      // The skip-target subtracts halfY from itself giving newTop == 0, so:
      let newTop: number;
      if (py <= halfY) {
        newTop = 0;                                      // @0x13106b3 with xmm4=halfY → 0
      } else {
        const sumY = halfY + py;                         // xmm0 @0x131069d
        const topCandidate = height - halfY;             // xmm4 @0x13106a5
        // @0x13106a9 cmpltsd: mask = (halfY + p.y) < height
        const chosenY = sumY < height ? py : topCandidate; // @0x13106ae blendvpd
        newTop = chosenY - halfY;                        // @0x13106b3 subsd
      }
      top.value = newTop;                                // @0x13106b7 store
      bottom.value = height - (newTop + residY);         // @0x13106bc..0x13106c4
    }
  }

  /**
   * GetCropForAnchoredObject(FFAnchoredObject*, CGRect, FFAutoReframeAnalysisResults&) @0x13106d0
   *
   * 166-line body: mixes CoreGraphics geometry arithmetic with a further chain
   * of ObjC selectors used to fetch the anchored object's current transform,
   * then calls AdjustLRTBToBounds (@0x1310600, this file) to finalise the
   * crop rectangle written into FFAutoReframeAnalysisResults. Selectors and
   * result-struct field offsets are not decoded in this pass.
   */
  static GetCropForAnchoredObject(
    _obj: FFAnchoredObject,
    _viewport: CGRect,
    _out: FFAutoReframeAnalysisResults,
  ): void {
    // Body @0x13106d0 mixes ObjC msgSend with AdjustLRTBToBounds; awaiting selector map.
    throw new Error("FFAutoReframeAnalysis.GetCropForAnchoredObject unresolved @0x13106d0");
  }
}
