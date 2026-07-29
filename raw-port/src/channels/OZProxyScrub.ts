// OZProxyScrub — Ozone.framework
//
// A tiny helper that tracks the "proxy scrub" state during scrubbing playback.
// When the user scrubs the timeline, FCP may drop to a lower rendering scale
// (proxy scale) to keep interactive latency bounded. This class ingests the
// current scrub speed + a scale suggestion, folds in the user's rendering
// preferences (via LiRenderingTechnology), and produces (a) a per-axis scale
// factor and (b) a set of "should I drop this quality knob to X" booleans that
// the render graph consults per frame.
//
// Faithful transcription of the following disassemblies (all Ozone x86_64):
//   raw-port/re/disasm/OZProxyScrub.C1.s                              @0x579050
//   raw-port/re/disasm/OZProxyScrub.ingest.s                          @0x5790a0
//   raw-port/re/disasm/OZProxyScrub.getScale.s                        @0x579210
//   raw-port/re/disasm/OZProxyScrub.setOverride.s                     @0x579330
//   raw-port/re/disasm/OZProxyScrub.getScale.s (nullary overload)     @0x579340
//   raw-port/re/disasm/OZProxyScrub.getScaleX.s                       @0x579360
//   raw-port/re/disasm/OZProxyScrub.getScaleY.s                       @0x579380
//   raw-port/re/disasm/OZProxyScrub.getScrubQuality.s                 @0x5793a0
//   raw-port/re/disasm/OZProxyScrub.shouldProxy.s                     @0x579430
//   raw-port/re/disasm/OZProxyScrub.getScrubTextQuality.s             @0x5794c0
//   raw-port/re/disasm/OZProxyScrub.getScrubHighQualityResampling.s   @0x579550
//   raw-port/re/disasm/OZProxyScrub.getScrubShapeAntialiasing.s       @0x5795e0
//   raw-port/re/disasm/OZProxyScrub.get3DIntersectionAntialiasing.s   @0x579670
//   raw-port/re/disasm/OZProxyScrub.couldProxy.s                      @0x579700
//   raw-port/re/disasm/OZProxyScrub.computeScale.s                    @0x579720
//
// Struct layout (recovered from ctor + accessors):
//   +0x00  float  scale.x                           (init 1.0f — mov q $0x3f8000003f800000)
//   +0x04  float  scale.y                           (init 1.0f — same qword)
//   +0x08  bool   overrideSet                       (init 0    — movb $0x0, 0x8(rbx))
//   +0x0c  float  overrideScale.x                   (init 0    — mov q $0, 0xc(rdi))
//   +0x10  float  overrideScale.y                   (part of the same 8-byte zero)
//   +0x14  u16    packed(overrideSet dupped low)    (ingest fast-path writes movzwl 0x8 -> movw 0x14)
//   +0x18  LiRenderingTechnology  liRenderingTech   (44 bytes: 0x18…0x43)
//   +0x44  bool   override                          (init 0    — movb $0x0, 0x44(rbx))
//
// Frontier callees are surfaced as throwing stubs per PORTING_SPEC Rule 3.
// Every constant cites its byte address in the Ozone slice.

// ─── Frontier callees (undecoded — throw per PORTING_SPEC Rule 3) ────────────────────

/**
 * LiRenderingTechnology::getDisableProxyScrub() const -> bool
 *   symbol stub in Ozone at @0x6df714, called from every accessor here (e.g.
 *   @0x579233, @0x579441, @0x579475, @0x579708, @0x57946c ...).
 * The real body lives in another framework and is not yet transcribed.
 */
function LiRT_getDisableProxyScrub(_rt: LiRenderingTechnology): boolean {
  throw new Error("LiRenderingTechnology::getDisableProxyScrub not yet transcribed — @Ozone stub 0x6df714");
}

/**
 * LiRenderingTechnology::getDisableAdaptiveProxyScrub() const -> bool
 *   symbol stub in Ozone at @0x6df744, called at @0x579282 (getScale) and @0x57915b (ingest).
 */
function LiRT_getDisableAdaptiveProxyScrub(_rt: LiRenderingTechnology): boolean {
  throw new Error("LiRenderingTechnology::getDisableAdaptiveProxyScrub not yet transcribed — @Ozone stub 0x6df744");
}

/**
 * LiRenderingTechnology::getProxyResFPSThreshold() const -> int (returned in %eax)
 *   symbol stub in Ozone at @0x6df73e, called at @0x579734 (computeScale),
 *   @0x57929e (getScale) and @0x57918b (ingest).
 */
function LiRT_getProxyResFPSThreshold(_rt: LiRenderingTechnology): number {
  throw new Error("LiRenderingTechnology::getProxyResFPSThreshold not yet transcribed — @Ozone stub 0x6df73e");
}

/**
 * OZPreferenceManager::Instance() -> OZPreferenceManager*
 *   direct call at @0x5790bb (ingest) and @0x57906d (ctor).
 */
function OZPreferenceManager_Instance(): OZPreferenceManagerRef {
  throw new Error("OZPreferenceManager::Instance not yet transcribed — @Ozone 0x5790bb / 0x57906d");
}

/**
 * OZPreferenceManager::getRenderingTechnology() -> LiRenderingTechnology (by-value copy).
 *   Direct call at @0x5790c7 (ingest, first arg is a caller-allocated 44-byte scratch on
 *   %rbp-0x64) and @0x579078 (ctor, first arg is `&this->liRenderingTech` at %rbx+0x18).
 * Returns a 44-byte struct (compiler emits sret; three 16-byte loads + tail 13 bytes at 0x31).
 */
function OZPreferenceManager_getRenderingTechnology(_pm: OZPreferenceManagerRef): LiRenderingTechnology {
  throw new Error("OZPreferenceManager::getRenderingTechnology not yet transcribed — @Ozone 0x5790c7 / 0x579078");
}

// ─── Types ────────────────────────────────────────────────────────────────────────────

/** Opaque 44-byte handle for LiRenderingTechnology (fields not yet decoded here). */
export interface LiRenderingTechnology {
  readonly _tag: "LiRenderingTechnology";
}
/** Opaque handle for the OZPreferenceManager singleton. */
export interface OZPreferenceManagerRef {
  readonly _tag: "OZPreferenceManager";
}

/** PCVector2<float> — two packed f32 at +0x00, +0x04. */
export interface PCVector2Float {
  x: number;
  y: number;
}

/** Fourth argument to `ingest`: a `void (^)(void)` block. Only its (*this + 0x10) function
 *  pointer is invoked (`callq *0x10(%r15)`), which follows the ObjC/C block ABI.
 *  We model it opaquely; consumers must call `invoke()` themselves. */
export interface IngestVoidBlock {
  /** ABI-shape: reading a bool-returning function pointer at +0x10 of the block struct. */
  invoke(): boolean;
}

/** Integer OZQuality enum (opaque here — only its identity is used by getScrubQuality). */
export type OZQuality = number;
/** Integer OZTextQuality enum. */
export type OZTextQuality = number;

// ─── Constants (all read directly out of the Ozone x86_64 slice — cited by addr) ──────

/** scalar 1.0f const                                     @Ozone 0x706f50 (used @0x579748, @0x5792b2 etc.). */
const K_ONE_F32 = Math.fround(1.0);
/** 0.25f                                                 @Ozone 0x70bc88 (used @0x57975c, @0x5792c6 etc.). */
const K_QUARTER_F32 = Math.fround(0.25);
/** 4.0f                                                  @Ozone 0x70c9ac (used @0x579754, @0x5792be). */
const K_FOUR_F32 = Math.fround(4.0);
/** 0.25 as double                                        @Ozone 0x7083a0 (used @0x579786 mulsd). */
const K_QUARTER_F64 = 0.25;
/** packed 4×f32 = (-1.0, -1.0, 0.0, 0.0)                 @Ozone 0x70cb80 (addps at @0x57944e etc.).
 *  We do not need to materialise it — we compute (x-1, y-1) as scalar diffs.       */
/** packed 4×f32 abs-mask = (0x7fffffff × 4)              @Ozone 0x707bc0 (andps @0x579455 etc.).
 *  Materialised implicitly via `Math.abs`.                                          */
/** packed 4×f32 = (1e-5, 1e-5, 0.0, 0.0)                 @Ozone 0x708540 (cmpltps at @0x57945c etc.). */
const K_NEAR_ONE_EPS_F32 = Math.fround(9.999999747378752e-06);
/** packed 4×f32 = (0.25, 0.25, 0.0, 0.0)                 @Ozone 0x7114c0 (movaps at @0x579164). */
const K_QUARTER_PAIR: readonly [number, number] = [K_QUARTER_F32, K_QUARTER_F32];

// ─── nearOne — the SIMD abs-difference-vs-1 check reused by every accessor ────────────

/**
 * Reproduces the SSE sequence at (e.g.) @0x57944e-@0x579470:
 *   movsd  (v),xmm0            ; xmm0 = (vx, vy, 0, 0)
 *   addps  (-1,-1,0,0),xmm0    ; xmm0 = (vx-1, vy-1, 0, 0)
 *   andps  |mask| ,xmm0        ; xmm0 = (|vx-1|, |vy-1|, 0, 0)
 *   cmpltps (1e-5,1e-5,0,0)    ; lane0 = |vx-1| < 1e-5 , lane1 = |vy-1| < 1e-5,
 *                              ; lane2 = 0 < 0 = false , lane3 = 0 < 0 = false
 *   unpcklps xmm0,xmm0         ; (r0,r0,r1,r1)
 *   movmskpd -> ecx, cmpl $3   ; true iff BOTH r0 AND r1 hold
 *
 * i.e. returns (|vx-1| < 1e-5) && (|vy-1| < 1e-5).
 */
function nearOne(vx: number, vy: number): boolean {
  const dx = Math.fround(Math.fround(vx) - K_ONE_F32);
  const dy = Math.fround(Math.fround(vy) - K_ONE_F32);
  // andps 0x7fffffff = fabsf on each lane
  const ax = Math.fround(Math.abs(dx));
  const ay = Math.fround(Math.abs(dy));
  return ax < K_NEAR_ONE_EPS_F32 && ay < K_NEAR_ONE_EPS_F32;
}

// ─── The class ────────────────────────────────────────────────────────────────────────

/**
 * OZProxyScrub — see file header for provenance and full struct layout.
 *
 * Trailing byte at +0x14 is a duplicate of the +0x08 flag (ingest fast-path writes
 * movzwl 0x8(rbx),eax ; movw ax,0x14(rbx) at @0x579123-@0x579127). It is exposed as a
 * private field to preserve the observable memory image, though only +0x08 is read.
 */
export class OZProxyScrub {
  // +0x00  scale
  scale: PCVector2Float = { x: K_ONE_F32, y: K_ONE_F32 };
  // +0x08  overrideSet
  overrideSet = false;
  // +0x0c  overrideScale
  overrideScale: PCVector2Float = { x: Math.fround(0.0), y: Math.fround(0.0) };
  // +0x14  packed dup of +0x08 (kept for layout fidelity; see @0x579123-@0x579127).
  private _pad14: number = 0;
  // +0x18  liRenderingTech
  liRenderingTech: LiRenderingTechnology;
  // +0x44  override
  override_ = false;

  /**
   * Constructor — OZProxyScrub::OZProxyScrub()  @Ozone 0x579050 (C1) / 0x579000 (C2).
   *   movq $0, (rdi)            ; scale = (0,0)  — later overwritten by 1.0f pair
   *   movq $0, 0xc(rdi)         ; overrideScale = (0,0)
   *   leaq 0x18(rdi), r14       ; &this->liRenderingTech
   *   callq OZPreferenceManager::Instance()                       @0x57906d
   *   callq OZPreferenceManager::getRenderingTechnology()         @0x579078
   *   movb $0, 0x44(rbx)        ; override_ = false
   *   movabsq $0x3f8000003f800000, rax ; scale = (1.0f, 1.0f)
   *   movq rax, (rbx)
   *   movb $0, 0x8(rbx)         ; overrideSet = false
   */
  constructor() {
    // The three heap-side memsets are observable in the ctor but redundant with the
    // final stores; we set the observable final state directly.
    this.overrideScale = { x: Math.fround(0.0), y: Math.fround(0.0) };
    const pm = OZPreferenceManager_Instance();
    this.liRenderingTech = OZPreferenceManager_getRenderingTechnology(pm);
    this.override_ = false;
    this.scale = { x: K_ONE_F32, y: K_ONE_F32 };
    this.overrideSet = false;
  }

  /**
   * OZProxyScrub::setOverride(bool)  @Ozone 0x579330.
   *   movb %sil, 0x44(%rdi)
   */
  setOverride(v: boolean): void {
    this.override_ = v;
  }

  /**
   * OZProxyScrub::getScale() const -> PCVector2Float  @Ozone 0x579340.
   *   (nullary overload; the disasm text was folded into +0x340 by the linker but is
   *    a plain "load the two floats at +0x00 into an aggregate return".)
   */
  getScaleNullary(): PCVector2Float {
    return { x: this.scale.x, y: this.scale.y };
  }

  /**
   * OZProxyScrub::getScaleX(float clampMax) const -> float  @Ozone 0x579360.
   *   movss (%rdi), %xmm1     ; xmm1 = scale.x
   *   minss %xmm0, %xmm1      ; xmm1 = min(scale.x, clampMax)
   *   ret
   */
  getScaleX(clampMax: number): number {
    const sx = this.scale.x;
    const c = Math.fround(clampMax);
    // SSE minss propagates the SECOND operand on unordered — but both are ordered here
    // (fields written from ordered sources). Use ordered less-than semantics.
    return Math.fround(sx < c ? sx : c);
  }

  /**
   * OZProxyScrub::getScaleY(float clampMax) const -> float  @Ozone 0x579380.
   *   movss 0x4(%rdi), %xmm1
   *   minss %xmm0, %xmm1
   */
  getScaleY(clampMax: number): number {
    const sy = this.scale.y;
    const c = Math.fround(clampMax);
    return Math.fround(sy < c ? sy : c);
  }

  /**
   * OZProxyScrub::couldProxy() const -> bool  @Ozone 0x579700.
   *   addq $0x18, %rdi
   *   callq LiRenderingTechnology::getDisableProxyScrub    @0x579708
   *   xorb $0x1, %al                                       @0x57970d
   * i.e. !getDisableProxyScrub().
   */
  couldProxy(): boolean {
    return !LiRT_getDisableProxyScrub(this.liRenderingTech);
  }

  /**
   * OZProxyScrub::shouldProxy() const -> bool  @Ozone 0x579430.
   *
   * Control flow (compressed):
   *   if !getDisableProxyScrub() && !nearOne(scale) -> return true
   *   if !getDisableProxyScrub() && overrideSet && !nearOne(overrideScale) -> return true
   *   return false
   *
   * Note the compiler inlines the abs-vs-eps SIMD sequence twice (once per vec2), and
   * the fall-through returns from the second branch land on `xorl eax,eax` at @0x5794ad
   * before the second `movb $1,%al` sets it back to 1 when the vec test passes.
   */
  shouldProxy(): boolean {
    // First block @0x579441-@0x579470
    if (!LiRT_getDisableProxyScrub(this.liRenderingTech)) {
      if (!nearOne(this.scale.x, this.scale.y)) {
        return true;
      }
    }
    // Second block @0x579475-@0x5794ab
    if (!LiRT_getDisableProxyScrub(this.liRenderingTech)) {
      if (this.overrideSet) {
        if (!nearOne(this.overrideScale.x, this.overrideScale.y)) {
          return true;
        }
      }
    }
    // @0x5794ad xorl eax,eax
    return false;
  }

  /**
   * OZProxyScrub::getScrubQuality(OZQuality q) const -> OZQuality  @Ozone 0x5793a0.
   *
   * Same two-block SIMD dance as shouldProxy, but this time the "success" path returns
   * the passed-in q, and the "failure" path (xorl %ebx,%ebx) returns 0.
   *
   * Reading the branches carefully:
   *   Path A (@0x5793b6): if !getDisableProxyScrub():
   *                         if nearOne(scale) : jump into path-B (@0x5793e6)
   *                         else               : xorl ebx,ebx (@0x579421), then return
   *   Path B (@0x5793e9): if !getDisableProxyScrub():
   *                         if !overrideSet OR !nearOne(overrideScale) : return ebx unchanged
   *                       else: return ebx unchanged
   *
   * Combined: return 0 iff (both !getDisableProxyScrub() AND !nearOne(scale))
   *           EXCEPT the path bailed into B; and B returns q if we came from A's "near-one"
   *           path OR if getDisableProxyScrub().
   *
   * The concrete meaning: q is preserved whenever the user has effectively no scale-down
   * happening OR when adaptive proxy is disabled. Otherwise the quality is clamped to 0.
   *
   * The same pattern is repeated verbatim for getScrubTextQuality / HighQualityResampling
   * / ShapeAntialiasing / 3DIntersectionAntialiasing — only the enum type of `ebx` differs.
   */
  getScrubQuality(q: OZQuality): OZQuality {
    let result = q;
    // Path A
    let takePathB = false;
    if (!LiRT_getDisableProxyScrub(this.liRenderingTech)) {
      if (nearOne(this.scale.x, this.scale.y)) {
        takePathB = true;
      } else {
        result = 0;
        // fall-through into Path B (control lands at 0x5793e6 label with ebx=0)
        takePathB = true;
      }
    } else {
      takePathB = true;
    }
    if (takePathB) {
      // Path B — always reached at @0x5793e6 in the disasm.
      if (!LiRT_getDisableProxyScrub(this.liRenderingTech)) {
        if (this.overrideSet) {
          if (nearOne(this.overrideScale.x, this.overrideScale.y)) {
            // je 0x579423 -> return ebx unchanged
            return result;
          }
        }
        // fall-through -> xorl ebx,ebx (@0x579421) then return
        result = 0;
        return result;
      } else {
        // testb %al ; jne 0x579423 -> return ebx unchanged
        return result;
      }
    }
    return result;
  }

  /** OZProxyScrub::getScrubTextQuality(OZTextQuality)  @Ozone 0x5794c0.
   *  Byte-identical control graph to getScrubQuality — just a different arg type. */
  getScrubTextQuality(q: OZTextQuality): OZTextQuality {
    return this.getScrubQuality(q);
  }
  /** OZProxyScrub::getScrubHighQualityResampling(bool)  @Ozone 0x579550. Same pattern. */
  getScrubHighQualityResampling(q: boolean): boolean {
    return this.getScrubQuality(q ? 1 : 0) !== 0;
  }
  /** OZProxyScrub::getScrubShapeAntialiasing(bool)  @Ozone 0x5795e0. Same pattern. */
  getScrubShapeAntialiasing(q: boolean): boolean {
    return this.getScrubQuality(q ? 1 : 0) !== 0;
  }
  /** OZProxyScrub::get3DIntersectionAntialiasing(bool)  @Ozone 0x579670. Same pattern. */
  get3DIntersectionAntialiasing(q: boolean): boolean {
    return this.getScrubQuality(q ? 1 : 0) !== 0;
  }

  /**
   * OZProxyScrub::computeScale(float fps) const -> PCVector2Float  @Ozone 0x579720.
   *
   * The math step used by every scale-producing path:
   *   fpsThresh = getProxyResFPSThreshold()          ; int  in %eax
   *   xf = fps / (float)fpsThresh                    @0x579744  divss
   *   xm = min(1.0f, xf)                             @0x579748..0x579750
   *   xm = xm * 4.0f                                 @0x579754  mulss
   *   below = (xf < 0.25f)                           @0x57975c  cmpltss
   *   xm = below ? 1.0f : xm                         @0x579768  blendvps (mask lives in xmm2)
   *   d  = (double)xm                                @0x579774  cvtss2sd
   *   frac = modf(d, &intpart)                       @0x57977c  _modf   (frac in xmm0)
   *   frac *= 0.25                                   @0x579786  mulsd
   *   xy   = (float)frac                             @0x57978e  cvtsd2ss
   *   out.x = out.y = xy                             @0x579792/0x579796  movss twice
   *
   * The "below 0.25" branch selects 1.0f — i.e. if the scrub is under 25% of the FPS
   * threshold, snap the scale to 1.0f (no proxy). Above that, the (val*4).frac()*0.25
   * quantises the scale into 25%-buckets tied to the fractional part of val*4.
   */
  computeScale(fps: number): PCVector2Float {
    const fpsF = Math.fround(fps);
    const thresh = LiRT_getProxyResFPSThreshold(this.liRenderingTech);
    // cvtsi2ss %eax,%xmm0 — signed int → f32
    const threshF = Math.fround(thresh);
    // divss
    const xf = Math.fround(fpsF / threshF);
    // minss 1.0f, xf  (SSE order: xmm1 = 1.0f then minss xmm2,xmm1 -> min(xmm1,xmm2))
    let xm = Math.fround(xf < K_ONE_F32 ? xf : K_ONE_F32);
    // mulss 4.0f
    xm = Math.fround(xm * K_FOUR_F32);
    // cmpltss 0.25f in xmm2 (xf < 0.25f) -> mask
    const belowQuarter = xf < K_QUARTER_F32;
    // blendvps: if mask set, replace with 1.0f
    if (belowQuarter) {
      xm = K_ONE_F32;
    }
    // cvtss2sd -> double
    const d = xm;
    // modf(d, &intpart) — fractional part
    const frac = d - Math.trunc(d);
    // mulsd 0.25
    const scaled = frac * K_QUARTER_F64;
    // cvtsd2ss
    const xy = Math.fround(scaled);
    return { x: xy, y: xy };
  }

  /**
   * OZProxyScrub::getScale(float fps, PCVector2Float const& clampMax) const -> PCVector2Float
   *   @Ozone 0x579210.
   *
   * Control graph (compressed):
   *   if getDisableProxyScrub():                                 @0x579233
   *     out.x = clampMax.x ; out.y = clampMax.y ; return
   *   if !(clampMax.x == 1.0f && clampMax.y == 1.0f):            @0x579252..0x579279
   *     out.x = clampMax.x ; out.y = clampMax.y ; return
   *   if getDisableAdaptiveProxyScrub():                         @0x579282
   *     out.x = 0.25f ; out.y = 1.0f ; return                    @0x57928b (via 0x1929ef ptr to 1.0f pair)
   *   // otherwise: reproduce the compute-scale math (@0x57929e..0x5792f5) exactly.
   *   xy = quantiseScale(fps)  (same recipe as computeScale)
   *   if overrideSet:
   *     out.x = min(xy, overrideScale.x)
   *     out.y = min(xy, overrideScale.y)
   *   else:
   *     out.x = out.y = xy
   *
   * clampMax layout in memory: the caller passes `PCVector2Float const&` = 8 bytes.
   * The `movss (%r12),%xmm1` at @0x579238 and `movss 0x4(%r12),%xmm0` at @0x579246 read
   * .x and .y respectively.
   */
  getScale(fps: number, clampMax: PCVector2Float): PCVector2Float {
    // @0x579233 — disable-proxy short circuit
    if (LiRT_getDisableProxyScrub(this.liRenderingTech)) {
      return { x: clampMax.x, y: clampMax.y };
    }
    // @0x579252..0x579279 — pass through if user asked for non-1.0f clamp
    // ucomiss uses ordered-not-equal (jne + jp). If either lane is NaN, the branch
    // is taken — matching JS `!(a === b)` (NaN !== 1.0f).
    if (!(clampMax.x === K_ONE_F32 && clampMax.y === K_ONE_F32)) {
      return { x: clampMax.x, y: clampMax.y };
    }
    // @0x579282 — disable-adaptive-proxy short circuit
    if (LiRT_getDisableAdaptiveProxyScrub(this.liRenderingTech)) {
      // @0x57928b movl $0x3e800000, (%rbx)  ; out.x = 0.25f
      // @0x579291 movss 0x1929ef(rip),%xmm0 ; out.y = 1.0f (from const pool 0x706df0/0x706f50)
      return { x: K_QUARTER_F32, y: K_ONE_F32 };
    }
    // @0x57929e..0x5792f5 — inlined computeScale math (identical to computeScale above)
    const thresh = LiRT_getProxyResFPSThreshold(this.liRenderingTech);
    const threshF = Math.fround(thresh);
    const xf = Math.fround(Math.fround(fps) / threshF);
    let xm = Math.fround(xf < K_ONE_F32 ? xf : K_ONE_F32);
    xm = Math.fround(xm * K_FOUR_F32);
    if (xf < K_QUARTER_F32) {
      xm = K_ONE_F32;
    }
    const d = xm;
    const frac = d - Math.trunc(d);
    const scaled = frac * K_QUARTER_F64;
    const xy = Math.fround(scaled);
    // @0x5792f9 cmpb $0x1, 0x8(%r14)  ; if this->overrideSet
    // (Note: 0x8 is r14 = %rsi = `this`, not the argument. So this is `this.overrideSet`.)
    if (this.overrideSet) {
      // @0x579303/0x579309 minss with overrideScale.x/.y
      const outX = Math.fround(xy < this.overrideScale.x ? xy : this.overrideScale.x);
      const outY = Math.fround(xy < this.overrideScale.y ? xy : this.overrideScale.y);
      return { x: outX, y: outY };
    }
    // jne 0x579328 -> out.x = xy ; jmp 0x579313 (out.y = xy)
    return { x: xy, y: xy };
  }

  /**
   * OZProxyScrub::ingest(double fps, PCVector2Float const& hintScale, void (^)() gate)
   *   @Ozone 0x5790a0.
   *
   * Refreshes the cached `liRenderingTech` from OZPreferenceManager, then decides how
   * to populate `this->scale` (a packed (float,float,bool) at +0x00..+0x14).
   *
   * Control graph (compressed):
   *   liRenderingTech = OZPreferenceManager::Instance().getRenderingTechnology()   @0x5790bb-@0x5790e0
   *   if !override_ (@0x5790e4) AND !gate.invoke() (@0x5790ed) -> take fast-1.0-path (@0x57916d)
   *   if getDisableProxyScrub() (@0x5790fc) -> write scale = (hintScale.x, hintScale.y, ovr=true)
   *   if !(hintScale.x == 1.0f && hintScale.y == 1.0f)         -> same as above
   *   if getDisableAdaptiveProxyScrub() (@0x57915b)
   *     -> load {0.25, 0.25} pair from @0x7114c0 and write as scale
   *   otherwise reproduce the compute-scale math (@0x57918b..0x5791e5), then
   *     xy = quantiseScale((float)fps)
   *     if overrideSet: xy = min(xy, overrideScale.[xy])  ; note: MINPS across a doubled
   *                     xy pair (movsldup xmm0,xmm0) and overrideScale loaded as movsd.
   *
   * The store path (@0x579112..0x57912b): pack (x, y) as a single u64 via insertps, then
   *   movq %rax, (rbx)     ; scale.x, scale.y at +0x00, +0x04
   *   movb $1, 0x8(rbx)    ; overrideSet = true          (fast-1.0-path uses cl=0 instead)
   *   movq %rax, 0xc(rbx)  ; overrideScale.x, .y at +0xc, +0x10 -- MIRRORED
   *   movzwl 0x8(rbx),eax  ; grab (overrideSet, 0) as a 16-bit pair
   *   movw   %ax, 0x14(rbx); mirror to the "packed" byte at +0x14
   *
   * The fast-1.0-path (@0x57916d): movabsq $0x3f8000003f800000, %rax (two 1.0f) ; cl=0
   *   -> scale = (1.0f, 1.0f), overrideSet = false, overrideScale = (1.0f, 1.0f).
   */
  ingest(fps: number, hintScale: PCVector2Float, gate: IngestVoidBlock): void {
    // @0x5790bb-@0x5790e0 — refresh cached rendering tech
    const pm = OZPreferenceManager_Instance();
    this.liRenderingTech = OZPreferenceManager_getRenderingTechnology(pm);

    // @0x5790e4 cmpb $0x0, 0x44(%rbx) ; jne 0x5790f5  — "if override_ set: skip gate"
    // @0x5790ea callq *0x10(%r15) ; testb %al ; je 0x57916d — fast-1.0 path when gate rejects.
    let takeMain: boolean;
    if (this.override_) {
      takeMain = true;
    } else {
      const gateOk = gate.invoke();
      takeMain = gateOk;
    }
    if (!takeMain) {
      // @0x57916d — fast 1.0 path:
      //   movabsq $0x3f8000003f800000, rax  -> (1.0f, 1.0f)
      //   xorl ecx, ecx                     -> overrideSet = false
      //   store scale=(1,1), overrideSet=false, overrideScale=(1,1)
      this.scale = { x: K_ONE_F32, y: K_ONE_F32 };
      this.overrideSet = false;
      this.overrideScale = { x: K_ONE_F32, y: K_ONE_F32 };
      this._pad14 = 0; // movzwl 0x8(rbx),eax -> ax = (0,0), mirror
      return;
    }

    // @0x5790fc — main path: consult LiRenderingTechnology.
    // Load hintScale.x into xmm0, then either short-circuit or compute.
    let xy: number;
    if (LiRT_getDisableProxyScrub(this.liRenderingTech)) {
      // The insertps at @0x57910a packs (hintScale.x, hintScale.y) — write that as-is.
      this.scale = { x: hintScale.x, y: hintScale.y };
      this.overrideSet = true;
      this.overrideScale = { x: hintScale.x, y: hintScale.y };
      this._pad14 = 1;
      return;
    }

    // @0x579136 ucomiss vs 1.0f — take same "pass-through" path if hint != (1,1)
    if (!(hintScale.x === K_ONE_F32 && hintScale.y === K_ONE_F32)) {
      this.scale = { x: hintScale.x, y: hintScale.y };
      this.overrideSet = true;
      this.overrideScale = { x: hintScale.x, y: hintScale.y };
      this._pad14 = 1;
      return;
    }

    // @0x57915b — adaptive-disable path: use the {0.25, 0.25} pair.
    if (LiRT_getDisableAdaptiveProxyScrub(this.liRenderingTech)) {
      // @0x579164 movaps 0x198355(%rip),%xmm0  -> (0.25, 0.25, 0.0, 0.0) from 0x7114c0
      this.scale = { x: K_QUARTER_PAIR[0], y: K_QUARTER_PAIR[1] };
      this.overrideSet = true;
      this.overrideScale = { x: K_QUARTER_PAIR[0], y: K_QUARTER_PAIR[1] };
      this._pad14 = 1;
      return;
    }

    // @0x57917b — main compute path: quantise (float)fps via the same recipe as computeScale.
    // Note fps is passed as a double here (movsd -0x30(rbp),xmm0 @0x57917b), then
    // cvtsd2ss (@0x579180) narrows to f32. Reproduce that narrowing before the divss.
    const fpsF = Math.fround(fps);
    const thresh = LiRT_getProxyResFPSThreshold(this.liRenderingTech);
    const threshF = Math.fround(thresh);
    const xf = Math.fround(fpsF / threshF);
    let xm = Math.fround(xf < K_ONE_F32 ? xf : K_ONE_F32);
    xm = Math.fround(xm * K_FOUR_F32);
    if (xf < K_QUARTER_F32) {
      xm = K_ONE_F32;
    }
    const d = xm;
    const frac = d - Math.trunc(d);
    const scaled = frac * K_QUARTER_F64;
    xy = Math.fround(scaled);
    // @0x5791e9 movsldup xmm0,xmm0 — replicate xy across both lanes.
    // @0x5791ed cmpb $0x1, 0x8(%rbx) — if this->overrideSet ...
    if (this.overrideSet) {
      // @0x5791f7 movsd 0xc(rbx),xmm1 — load overrideScale.(x,y)
      // @0x5791fc minps xmm1,xmm0     — per-lane min
      const ox = Math.fround(xy < this.overrideScale.x ? xy : this.overrideScale.x);
      const oy = Math.fround(xy < this.overrideScale.y ? xy : this.overrideScale.y);
      this.scale = { x: ox, y: oy };
      this.overrideSet = true;
      this.overrideScale = { x: ox, y: oy };
      this._pad14 = 1;
      return;
    }
    // No override — just write xy to both lanes (fall through to @0x579112 store block).
    this.scale = { x: xy, y: xy };
    this.overrideSet = true;
    this.overrideScale = { x: xy, y: xy };
    this._pad14 = 1;
  }
}
