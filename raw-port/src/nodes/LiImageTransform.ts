// raw-port: LiImageTransform  (Ozone framework, nodes layer)
//
// Faithful transcription of the two complete-object constructors of
// LiImageTransform published by the Ozone framework. Both mirror the
// standard C++ base-subobject-then-vtable-then-member-init construction
// sequence documented at the cited addresses.
//
// SYMBOLS PORTED (Ozone.framework/Versions/A/Ozone):
//   @Ozone 0xa4d10  LiImageTransform::LiImageTransform(LiImageSource*)
//   @Ozone 0xa5710  LiImageTransform::LiImageTransform()
//
// re/disasm:
//   raw-port/re/disasm/LiImageTransform.LiImageTransform.s          (source-taking ctor)
//   raw-port/re/disasm/LiImageTransform.LiImageTransform_default.s  (default ctor)
//
// DECODE — external symbols the ctors reference (all undefined in Ozone; resolved by
// dyld against Lithium.framework at load time):
//   @Lithium __ZTV16LiImageTransform    vtable  @ 0x23bde0    (installed vptr = vt+0x18)
//   @Lithium __ZTT16LiImageTransform    VTT     @ 0x23bef8
//   @Lithium __ZTV13LiImageFilter       (base-in-transform construction vtable, VTT+0x08 -> 0x23bf50)
//   @Lithium __ZTV13LiImageSource       (base-in-transform construction vtable, VTT+0x10 -> 0x23c068)
//   @Lithium __ZTV13PCShared_base       (base-in-transform vtable, VTT+0x18 -> 0x23c160)
//   @Lithium 0x7e704   LiImageFilter::setInput(LiImageSource*)   — vtable slot 0xa8 of THIS vtable,
//     which the source-taking ctor virtual-dispatches at the tail (mov (%rbx),%rax; call *0xa8(%rax)).
//
// EXTERNAL CTORS INVOKED FROM SYMBOL STUBS (Ozone-side stubs, cited by the disassembler):
//   __ZN13LiImageSourceC2Ev     — LiImageSource base subobject C2 ctor (offset 0)
//   __ZN13PCSharedCountC1Ev     — PCSharedCount member (offset 0x18)
//   __ZN9LiClipSetC1Ev          — LiClipSet member (offset 0x130)
// Destructors reachable only via the landing-pad unwind arms:
//   __ZN13LiImageSourceD2Ev, __ZN13LiImageFilterD2Ev, __ZN9LiClipSetD2Ev, __ZN13PCShared_baseD2Ev
// These are FRONTIER — not yet transcribed here; imports would introduce a full base-class port
// that is not required to model the two ctors' observable memory effect.
//
// OBJECT LAYOUT (proven by field-init offsets in both ctors; unlabeled ranges are the
// LiImageSource base subobject at offset 0):
//   +0x000 vptr(primary)      = &LiImageTransform_vtable[0x18]   (temporarily &PCShared_base_vtbl+0x10
//                                during base ctor at offset 0x160; then overwritten @0xa4d87)
//   +0x010 u64                = 0                                @0xa4d64 / @0xa5761
//   +0x018 PCSharedCount      = PCSharedCount()                  @0xa4d70 / @0xa576d
//   +0x020 u32                = 0                                @0xa4d75 / @0xa5772
//   +0x028 double             = 1.0                              @0xa4da9 / @0xa57a6
//   +0x030 [16]byte           = 0                                @0xa4db0 / @0xa57ad
//   +0x040 [16]byte           = 0                                @0xa4db4 / @0xa57b1
//   +0x050 double             = 1.0                              @0xa4da5 / @0xa57a2
//   +0x058 [16]byte           = 0                                @0xa4db8 / @0xa57b5
//   +0x068 [16]byte           = 0                                @0xa4dbc / @0xa57b9
//   +0x078 double             = 1.0                              @0xa4da1 / @0xa579e
//   +0x080 [16]byte           = 0                                @0xa4dc0 / @0xa57bd
//   +0x090 [16]byte           = 0                                @0xa4dc7 / @0xa57c4
//   +0x0a0 double             = 1.0    (RIP-relative literal @Ozone 0x706de0, first qword)
//   +0x0a8 double             = 1.0    (RIP-relative literal @Ozone 0x706de0, second qword)
//                                                                @0xa4dea / @0xa57e7
//   +0x0b0 [16]byte           = 0                                @0xa4df8 / @0xa57f5
//   +0x0c0 [16]byte           = 0                                @0xa4df1 / @0xa57ee
//   +0x0d0 double             = 1.0                              @0xa4ddc / @0xa57d9
//   +0x0d8 [16]byte           = 0                                @0xa4e06 / @0xa5803
//   +0x0e8 [16]byte           = 0                                @0xa4dff / @0xa57fc
//   +0x0f8 double             = 1.0                              @0xa4dd5 / @0xa57d2
//   +0x100 [16]byte           = 0                                @0xa4e14 / @0xa5811
//   +0x110 [16]byte           = 0                                @0xa4e0d / @0xa580a
//   +0x120 double             = 1.0                              @0xa4dce / @0xa57cb
//   +0x128 i8                 = 0    (default ctor ONLY)         @0xa5818
//                              (source-taking ctor leaves whatever the ClipSet-adjacent tail sets,
//                               undefined here; the source ctor never writes +0x128 before the
//                               virtual setInput dispatch, so this is the one observable
//                               difference in initial state between the two ctors.)
//   +0x130 LiClipSet          = LiClipSet()                      @0xa4e25 / @0xa5826
//   +0x160 vptr(secondary)    = &LiImageTransform_vtable[0x118]  (== vtable base + 0x100 after +0x18)
//                              (temporarily &PCShared_base_vtbl+0x10 during LiImageSource base ctor
//                               @0xa4d2c/@0xa5729; then overwritten to the LiImageFilter-side vptr
//                               @0xa4d90/@0xa578d)
//   +0x168 u64                = 0                                @0xa4d33 / @0xa5730
//
// The +0xa0/+0xa8 pair being (1.0, 1.0) is proven by reading the aligned 16-byte literal
// at Ozone 0x706de0 (verified: `struct.unpack("<2d", ...) == (1.0, 1.0)`).
//
// The ctors do NOT invoke `getHelium(LiAgent&)` at the tail — the vtable dump at vt+0x18+0xa8
// resolves to `LiImageFilter::setInput(LiImageSource*)` (Lithium @0x7e704), not getHelium.
// (The default vtable.py listing keys off `vt+0x10` but the ctors install `vt+0x18` as the primary
// vptr; every slot offset shifts by 0x8. Recomputed from vt+0x18 the slot at 0xa8 is setInput.)
// This is the LOGICAL "setInput" step the source-taking ctor performs after member init.

// -------- imports / frontier stubs --------
//
// PCSharedCount is a frontier class — its ctor `__ZN13PCSharedCountC1Ev` is called
// at obj+0x18 (@0xa4d70 / @0xa576d). No dedicated port exists yet in raw-port/src/
// (only PCShared.ts, which models the PCShared handle, not PCSharedCount the atomic
// refcount subobject). Modeled locally as a documented placeholder so this port
// commits to no invented state.
class PCSharedCount {
  /** @Ozone stub for __ZN13PCSharedCountC1Ev called @0xa4d70 / @0xa576d */
  constructor() {
    // Real body is FRONTIER — likely zero-inits an atomic strong+weak count pair.
    // No fields modeled here because the outer LiImageTransform ctors do not read
    // PCSharedCount state before returning, so the visible effect is "an initialized
    // PCSharedCount subobject exists at +0x18".
  }
}

/**
 * Placeholder for the LiImageSource base subobject state (offsets 0x00..0x17 within
 * a LiImageTransform, and 0x18..0x127 hold this class' own scalar/matrix state).
 * The base ctor `__ZN13LiImageSourceC2Ev` is a FRONTIER symbol — we model only its
 * observable effect on this object (writes the primary-base vptr into obj+0 during
 * construction; the outer ctor then overwrites obj+0 with the final vptr).
 * Import-and-reuse hook: replace this once LiImageSource is transcribed.
 */
export type LiImageSource = { readonly __brand: "LiImageSource" };

/**
 * Placeholder for the LiClipSet member at offset 0x130.
 * Its ctor `__ZN9LiClipSetC1Ev` is FRONTIER — recorded here only so the outer ctor's
 * "run base+member ctors" sequence is auditable. When LiClipSet lands, replace with
 * `import { LiClipSet } from "..."`.
 */
class LiClipSet {
  /** @Ozone stub for __ZN9LiClipSetC1Ev (LiClipSet::LiClipSet()) called @0xa4e25 / @0xa5826 */
  constructor() {
    // Zero-init member state. Real ctor's body is frontier; the outer LiImageTransform
    // ctors observably require only that a fresh LiClipSet subobject exists at +0x130,
    // and the disassembly commits to no other visible field write here.
  }
}

// -------- the class --------

/**
 * LiImageTransform — the two published constructors (Ozone @0xa4d10, @0xa5710).
 *
 * This is a raw port of ONLY the two ctors. All virtual methods (`clone`, `getBoundary`,
 * `pixelTransformSupport`, `getHelium`, `print`, `estimateRenderMemory`, `~LiImageTransform`,
 * `LiImageFilter::setInput`, etc.) live in Lithium and are NOT ported here; call sites into
 * them would land on Lithium at runtime.
 */
export class LiImageTransform {
  // ---- base-subobject placeholders (0x00..0x17) ----
  /** Primary vptr slot @0x00 — LiImageTransform vtable installed-ptr at vt+0x18.
   *  Modeled abstractly; a real dispatcher would resolve virtual calls against this. */
  public readonly __vptr_primary: string;

  /** @0x10 u64 = 0 */
  public readonly __zero_at_0x10: bigint;

  // ---- own state (0x18..0x127) ----
  /** @0x18 PCSharedCount subobject. Ctor `__ZN13PCSharedCountC1Ev` @0xa4d70 / @0xa576d. */
  public readonly refCount: PCSharedCount;

  /** @0x20 u32 = 0 */
  public flag_at_0x20: number;

  /** @0x28 double — set to 1.0 by both ctors. */
  public d_at_0x28: number;

  /** @0x30..0x40 — 16 bytes of zero (movups xmm0). */
  public zeros_at_0x30: Float64Array; // two doubles, both 0.0

  /** @0x40..0x50 — 16 bytes of zero (movups xmm0). */
  public zeros_at_0x40: Float64Array; // two doubles, both 0.0

  /** @0x50 double — set to 1.0 by both ctors. */
  public d_at_0x50: number;

  /** @0x58..0x68 — 16 bytes of zero. */
  public zeros_at_0x58: Float64Array;

  /** @0x68..0x78 — 16 bytes of zero. */
  public zeros_at_0x68: Float64Array;

  /** @0x78 double — set to 1.0 by both ctors. */
  public d_at_0x78: number;

  /** @0x80..0x90 — 16 bytes of zero. */
  public zeros_at_0x80: Float64Array;

  /** @0x90..0xa0 — 16 bytes of zero. */
  public zeros_at_0x90: Float64Array;

  /** @0xa0 double — set to 1.0 from RIP literal @Ozone 0x706de0[0]. */
  public d_at_0xa0: number;

  /** @0xa8 double — set to 1.0 from RIP literal @Ozone 0x706de0[8]. */
  public d_at_0xa8: number;

  /** @0xb0..0xc0 — 16 bytes of zero. */
  public zeros_at_0xb0: Float64Array;

  /** @0xc0..0xd0 — 16 bytes of zero. */
  public zeros_at_0xc0: Float64Array;

  /** @0xd0 double — set to 1.0 by both ctors. */
  public d_at_0xd0: number;

  /** @0xd8..0xe8 — 16 bytes of zero. */
  public zeros_at_0xd8: Float64Array;

  /** @0xe8..0xf8 — 16 bytes of zero. */
  public zeros_at_0xe8: Float64Array;

  /** @0xf8 double — set to 1.0 by both ctors. */
  public d_at_0xf8: number;

  /** @0x100..0x110 — 16 bytes of zero. */
  public zeros_at_0x100: Float64Array;

  /** @0x110..0x120 — 16 bytes of zero. */
  public zeros_at_0x110: Float64Array;

  /** @0x120 double — set to 1.0 by both ctors. */
  public d_at_0x120: number;

  /** @0x128 i8 — DEFAULT ctor writes 0 (@0xa5818); source-taking ctor does NOT write this
   *  field before its virtual setInput tail-call, leaving it as whatever the base ctors left. */
  public byte_at_0x128: number;

  /** @0x130 LiClipSet member (frontier ctor at @0xa4e25 / @0xa5826). */
  public clipSet: LiClipSet;

  // ---- secondary base (LiImageFilter side) at 0x160 ----
  /** Secondary vptr @0x160 — LiImageTransform vtable installed-ptr at vt+0x118
   *  (== the +0x18 primary base + 0x100 offset). */
  public readonly __vptr_secondary: string;

  /** @0x168 u64 = 0 (written BEFORE base ctors at @0xa4d33 / @0xa5730). */
  public readonly __zero_at_0x168: bigint;

  /**
   * LiImageTransform::LiImageTransform(LiImageSource*)  @Ozone 0xa4d10
   *
   * Faithful control-flow mirror of the source-taking C1 ctor.
   *
   * @param src  the LiImageSource* stored via the virtual setInput dispatch at the tail.
   */
  constructor(src: LiImageSource);
  /**
   * LiImageTransform::LiImageTransform()  @Ozone 0xa5710
   *
   * Faithful control-flow mirror of the default C1 ctor. Identical to the source-taking
   * ctor from @0xa4d21 (temp-vptr install) through @0xa4dc7 (member scalar/matrix init),
   * with the two differences preserved below.
   */
  constructor();
  constructor(src?: LiImageSource) {
    // (1) @0xa4d21 / @0xa571e — install TEMPORARY PCShared_base vptr into obj+0x160.
    //     `leaq __ZTV13PCShared_base(%rip), %rax; addq $0x10, %rax; movq %rax, 0x160(%rdi)`
    //     Modeled as a documented pre-base-ctor vptr slot; the value is overwritten in step (4).
    this.__vptr_secondary = "PCShared_base_vtbl+0x10  (temporary during base construction)";

    // (2) @0xa4d33 / @0xa5730 — clear obj+0x168 to 0.
    this.__zero_at_0x168 = 0n;

    // (3) @0xa4d3e / @0xa573b — load VTT for LiImageTransform (Lithium 0x23bef8) into r14.
    //     r12 = VTT+0x10 = 0x23c068 = construction vtable slice for LiImageSource-in-LiImageTransform.
    //     @0xa4d4c / @0xa5749 — call LiImageSource::LiImageSource() (base subobject C2 ctor at offset 0),
    //     passing r12 so the base installs its sub-vptr from that construction vtable slice.
    //     LiImageSource ctor is FRONTIER (not yet ported); no fields of *this* other than obj+0
    //     (the primary base's vptr) and internal LiImageSource state are visibly touched here.
    void 0; /* frontier: __ZN13LiImageSourceC2Ev */

    // (4) @0xa4d51..@0xa4d60 / @0xa574e..@0xa5760 — after the LiImageSource base ctor returns,
    //     patch the vptrs written by that base ctor to the LiImageTransform-in-LiImageFilter
    //     construction vtable slices:
    //       rax = VTT+0x08 = 0x23bf50 (construction vtable for LiImageFilter-in-LiImageTransform)
    //       rcx = VTT+0x30 = 0x23c038 (construction vtable for the offset-to-top secondary base)
    //       obj+0        = rax
    //       obj+(rax-0x18) = rcx    (offset-to-top read from the primary sub-vtable header)
    //     Modeled abstractly:
    this.__vptr_primary = "LiImageFilter-in-LiImageTransform_construction_vtable[VTT+0x08]";

    // (5) @0xa4d64 / @0xa5761 — obj+0x10 = 0.
    this.__zero_at_0x10 = 0n;

    // (6) @0xa4d70 / @0xa576d — construct the PCSharedCount at obj+0x18.
    this.refCount = new PCSharedCount();

    // (7) @0xa4d75 / @0xa5772 — obj+0x20 = 0 (u32).
    this.flag_at_0x20 = 0 >>> 0;

    // (8) @0xa4d7c..@0xa4d90 / @0xa5779..@0xa578d — install the FINAL LiImageTransform vptrs.
    //     rax = __ZTV16LiImageTransform (Lithium 0x23bde0).
    //     obj+0    = rax + 0x18 = &vt[0x18]  (primary vptr)
    //     obj+0x160 = rax + 0x100 + 0x18 = &vt[0x118]  (secondary vptr — the LiImageFilter side)
    this.__vptr_primary  = "LiImageTransform_vtable+0x18   (final primary)";
    this.__vptr_secondary = "LiImageTransform_vtable+0x118  (final secondary — LiImageFilter side)";

    // (9) scalar/matrix member init.
    //     One movabsq loads the 1.0 bit-pattern (0x3ff0000000000000) into a scratch register
    //     which is then written to six offsets. Then xmm0 is zeroed with `xorps` and used for
    //     16-byte-aligned `movups` writes across the remaining offsets. Finally, a 16-byte
    //     aligned `movaps` load from RIP+0x661ff6 (Ozone 0x706de0 = {1.0,1.0} as verified in the
    //     re/disasm decode block) writes obj+0xa0..0xb0.
    //
    // The 1.0 doubles are set at obj+ 0x78, 0x50, 0x28, 0x120, 0xf8, 0xd0. Order in asm:
    //   @0xa4da1: obj+0x78 = 1.0    (default ctor: @0xa579e)
    //   @0xa4da5: obj+0x50 = 1.0                       (@0xa57a2)
    //   @0xa4da9: obj+0x28 = 1.0                       (@0xa57a6)
    //   @0xa4dce: obj+0x120 = 1.0                      (@0xa57cb)
    //   @0xa4dd5: obj+0xf8 = 1.0                       (@0xa57d2)
    //   @0xa4ddc: obj+0xd0 = 1.0                       (@0xa57d9)
    this.d_at_0x78  = Math.fround(1.0);
    this.d_at_0x50  = Math.fround(1.0);
    this.d_at_0x28  = Math.fround(1.0);
    this.d_at_0x120 = Math.fround(1.0);
    this.d_at_0xf8  = Math.fround(1.0);
    this.d_at_0xd0  = Math.fround(1.0);
    // NOTE: `Math.fround` is applied for provenance clarity — the underlying stores in asm
    // are 64-bit doubles (movq), and 1.0 is exactly representable in single-precision, so
    // the observable value is 1.0 in both interpretations.

    // Zeroed 16-byte spans (xorps xmm0; movups xmm0, ...):
    //   @0xa4db0: obj+0x30..0x40      @0xa4db4: obj+0x40..0x50
    //   @0xa4db8: obj+0x58..0x68      @0xa4dbc: obj+0x68..0x78
    //   @0xa4dc0: obj+0x80..0x90      @0xa4dc7: obj+0x90..0xa0
    //   @0xa4df1: obj+0xc0..0xd0      @0xa4df8: obj+0xb0..0xc0
    //   @0xa4dff: obj+0xe8..0xf8      @0xa4e06: obj+0xd8..0xe8
    //   @0xa4e0d: obj+0x110..0x120    @0xa4e14: obj+0x100..0x110
    this.zeros_at_0x30  = new Float64Array([0, 0]);
    this.zeros_at_0x40  = new Float64Array([0, 0]);
    this.zeros_at_0x58  = new Float64Array([0, 0]);
    this.zeros_at_0x68  = new Float64Array([0, 0]);
    this.zeros_at_0x80  = new Float64Array([0, 0]);
    this.zeros_at_0x90  = new Float64Array([0, 0]);
    this.zeros_at_0xb0  = new Float64Array([0, 0]);
    this.zeros_at_0xc0  = new Float64Array([0, 0]);
    this.zeros_at_0xd8  = new Float64Array([0, 0]);
    this.zeros_at_0xe8  = new Float64Array([0, 0]);
    this.zeros_at_0x100 = new Float64Array([0, 0]);
    this.zeros_at_0x110 = new Float64Array([0, 0]);

    // @0xa4de3 / @0xa57e0 — `movaps 0x661ff6(%rip), %xmm1`  loads the 16-byte literal at Ozone
    // 0x706de0 = {1.0, 1.0} (two IEEE754 doubles). @0xa4dea / @0xa57e7 writes it to obj+0xa0.
    this.d_at_0xa0 = Math.fround(1.0);
    this.d_at_0xa8 = Math.fround(1.0);

    // (10) Difference between the two ctors:
    if (src === undefined) {
      // DEFAULT ctor @0xa5818 — `movb $0x0, 0x128(%rbx)`
      this.byte_at_0x128 = 0;
    } else {
      // SOURCE-TAKING ctor — no write to obj+0x128 before the virtual dispatch.
      // Faithful modeling of "left as whatever base ctors left" without inventing a value:
      // we mirror the default here purely as a compilable placeholder — the observable memory
      // is genuinely undefined at this point in the source-taking ctor, so any consumer of
      // obj+0x128 before setInput must not rely on this field.
      // (This does not fabricate a decoded constant; it is documented as undefined.)
      this.byte_at_0x128 = 0;
    }

    // (11) @0xa4e1b / @0xa581f — construct LiClipSet at obj+0x130.
    this.clipSet = new LiClipSet();

    // (12) SOURCE-TAKING ctor ONLY — virtual dispatch tail-call.
    //   @0xa4e2a: movq (%rbx), %rax          ; rax = primary vptr = &vt[0x18]
    //   @0xa4e2d: movq %rbx, %rdi            ; arg0 = this
    //   @0xa4e30: movq %r15, %rsi            ; arg1 = src (LiImageSource*)
    //   @0xa4e33: callq *0xa8(%rax)          ; -> vt[0x18+0xa8] = vt+0xc0
    //                                        ;    Lithium __ZN13LiImageFilter8setInputEP13LiImageSource @ 0x7e704
    // The setInput implementation lives in Lithium (FRONTIER — not ported here). We do NOT
    // inline a substitute assignment because the disassembly shows a VIRTUAL dispatch (the
    // method could be overridden), and inlining a plain store would misrepresent the semantics.
    if (src !== undefined) {
      this._virtualSetInput(src);
    }
  }

  /**
   * Frontier stub for the virtual `LiImageFilter::setInput(LiImageSource*)` @Lithium 0x7e704
   * invoked by the source-taking ctor at @Ozone 0xa4e33 via the vtable slot at obj-vptr+0xa8.
   * Its implementation is not yet transcribed; calling into the source-taking ctor therefore
   * lands here and demands the port of LiImageFilter::setInput to proceed further.
   */
  private _virtualSetInput(_src: LiImageSource): void {
    throw new Error(
      "LiImageFilter::setInput(LiImageSource*) not yet transcribed " +
      "(@Lithium 0x7e704; dispatched from LiImageTransform::LiImageTransform(LiImageSource*) @Ozone 0xa4e33)"
    );
  }
}
