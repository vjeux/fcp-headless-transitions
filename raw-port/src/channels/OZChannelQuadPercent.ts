// raw-port/src/channels/OZChannelQuadPercent.ts
//
// FCP `OZChannelQuadPercent` — ProChannel compound channel that owns FOUR
// `OZChannelPositionPercent` sub-channels arranged as the four CORNERS of a
// quad (Bottom-Left, Bottom-Right, Top-Right, Top-Left). Extends
// `OZCompoundChannel`. This is the "percent" (i.e. normalized [0,1]) sibling
// of `OZChannelQuad` (see raw-port/src/channels/OZChannelQuad.ts) — the
// per-corner sub-objects here are `OZChannelPositionPercent` (0x1c0 bytes
// each, containing OZChannel2D base + X and Y sub-channels + a 1-byte
// "percent-clamp" flag), rather than the full `OZChannelPosition` (0x2c0
// bytes) used by the non-percent variant.
//
// FAITHFUL PORT — every method cites @0xADDR (ProChannel, x86_64 slice).
//
// Framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProChannel.framework/Versions/A/ProChannel
//
// Symbols in ProChannel's T-table for this class:
//   0x0a6bce  OZChannelQuadPercent::OZChannelQuadPercent(
//                 PCString const&, OZChannelFolder*, uint, uint, uint)         [C2, 5-arg]
//   0x0a6dfa  OZChannelQuadPercent::OZChannelQuadPercent(same)                 [C1, tail-jmp -> C2]
//   0x0a6e04  OZChannelQuadPercent::OZChannelQuadPercent(
//                 double x0, double y0, double x1, double y1,
//                 double x2, double y2, double x3, double y3,
//                 PCString const&, OZChannelFolder*, uint, uint, uint)          [C2, 13-arg]
//   0x0a7038  OZChannelQuadPercent::OZChannelQuadPercent(13-arg)                [C1, tail-jmp -> C2]
//   0x0a7042  OZChannelQuadPercent::OZChannelQuadPercent(
//                 OZFactory*, PCString const&, uint, uint)                     [C2, factory-4-arg]
//   0x0a71f0  OZChannelQuadPercent::OZChannelQuadPercent(factory-4-arg)         [C1, tail-jmp -> C2]
//   0x0a71fa  OZChannelQuadPercent::OZChannelQuadPercent(
//                 OZChannelQuadPercent const&, OZChannelFolder*)                [C2 copy ctor]
//   0x0a72ce  OZChannelQuadPercent::OZChannelQuadPercent(copy)                  [C1, tail-jmp -> C2]
//   0x0a72d8  OZChannelQuadPercent::clone() const
//   0x0a7318  OZChannelQuadPercent::getGeometry(CMTime const&, float*)          [NO-OP body]
//   0x0a731e  OZChannelQuadPercent::getGeometry(CMTime const&, double*)         [full transcription]
//   0x0a73ec  OZChannelQuadPercent::getGeometry(CMTime const&, PCRect<double>*) [full transcription]
//   0x0a74e0  OZChannelQuadPercent::getObjCWrapperName()
//   0x0a74ee  OZChannelQuadPercent::~OZChannelQuadPercent()                     [D1 -> D2 tail-jmp]
//   0x0a74f8  OZChannelQuadPercent::~OZChannelQuadPercent()                     [D0 -> D2 + operator delete]
//   0x0a797a  OZChannelQuadPercent::~OZChannelQuadPercent()                     [D2 base dtor]
//
// Saved disassembly under raw-port/re/disasm/ProChannel.OZChannelQuadPercent.*.s.
//
// Called-into symbols (extern / not-yet-transcribed callees; cited here so
// frontier.py sees the gap):
//   OZCompoundChannel::OZCompoundChannel(OZFactory*, PCString const&, OZChannelFolder*,
//                                        uint, uint, bool, uint)               @ProChannel (extern)
//   OZCompoundChannel::OZCompoundChannel(OZCompoundChannel const&, OZChannelFolder*)
//   OZCompoundChannel::~OZCompoundChannel()                                     @ProChannel (extern)
//   OZChannel2D::~OZChannel2D()                                                 @ProChannel (base dtor
//                                                                                for the four percent
//                                                                                sub-objects; called
//                                                                                4x from D2)
//   OZChannelPositionPercent::OZChannelPositionPercent(PCString const&, OZChannelFolder*,
//                                                       uint, uint)             @ProChannel 0x7f052 (C2)
//   OZChannelPositionPercent::OZChannelPositionPercent(double, double,
//                                                       PCString const&, OZChannelFolder*,
//                                                       uint, uint)             @ProChannel 0x7f254 (C2)
//   OZChannelPositionPercent::OZChannelPositionPercent(OZFactory*, PCString const&, uint)
//                                                                                @ProChannel 0x7f46a (C2)
//   OZChannelPositionPercent::OZChannelPositionPercent(OZChannelPositionPercent const&,
//                                                       OZChannelFolder*)        @ProChannel 0x7f644 (C2 copy)
//   OZChannelPositionPercent::getPosition(CMTime const&, double*, double*)      @ProChannel 0x0a791e
//   OZChannel::getValueAsDouble(CMTime const&, double) const                    @ProChannel (extern)
//   OZChannelQuadPercent_Factory::getInstance()                                 @ProChannel 0x0a6db2
//   PCString::PCString(CFStringRef, CFBundleRef, CFBundleRef)                   @ProChannel stub 0xacd02
//   PCString::~PCString()                                                       @ProChannel stub 0xacd20
//   getProChannelBundle()                                                       @ProChannel (extern)
//   __Znwm / __ZdlPv                                                             (libc++ new/delete)
//
// ── STRUCT LAYOUT (recovered from D2 @0x0a797a + all four ctors + clone) ────
// The dtor destroys FOUR sub-objects at strides 0x1c0 = 448 bytes (matching
// OZChannelPositionPercent's decoded class size @ raw-port/src/channels/
// OZChannelPositionPercent.ts:12), and clone() @0x0a72d8 allocates 0x788
// bytes total via `movl $0x788, %edi ; callq __Znwm` at @0x0a72e2, which
// equals 0x88 (base) + 4 × 0x1c0 (corners) = 0x788. Confirmed.
//
//   OZChannelQuadPercent {
//     +0x000..+0x087  OZCompoundChannel base subobject
//                       (destroyed by tail-jmp @0x0a79d1 to
//                        __ZN17OZCompoundChannelD2Ev — base 0x88 bytes wide,
//                        matching the leaq $0x88 in every ctor)
//     +0x000          vtable primary          — installed by every ctor to
//                       `vtable for OZChannelQuadPercent`+0x10 = 0xe3468.
//                       (leaq @0x0a6c1b/@0x0a6e79/@0x0a7213 stores here.)
//     +0x010          vtable secondary        — installed to
//                       `vtable for OZChannelQuadPercent`+0x358 = 0xe37a0.
//                       (leaq @0x0a6c25/@0x0a6e83/@0x0a721d stores here.)
//     +0x088..+0x247  p0 : OZChannelPositionPercent  (Channel Bottom Left)
//     +0x248..+0x407  p1 : OZChannelPositionPercent  (Channel Bottom Right)
//     +0x408..+0x5c7  p2 : OZChannelPositionPercent  (Channel Top Right)
//     +0x5c8..+0x787  p3 : OZChannelPositionPercent  (Channel Top Left)
//   }
//   sizeof(OZChannelQuadPercent) = 0x788 = 1928 bytes (from clone @0x0a72e2).
//
// ── VTABLES ──────────────────────────────────────────────────────────────
//   __ZTV20OZChannelQuadPercent @ProChannel 0xe3458 (RTTI header @0xe3448):
//     installed-primary   = 0xe3468 (vt+0x10)         — stored at *(this+0x00)
//     installed-secondary = 0xe37a0 (vt+0x358)        — stored at *(this+0x10)
//   Verified via `python3 raw-port/army/tools/resolve.py ProChannel sym
//   0xe3468` -> "vtable for OZChannelQuadPercent (+0x10)".
//
// ── DECODED CFSTRING NAMES (sub-channel labels) ─────────────────────────
// All four are __cfstring entries; each is 32 bytes { isa*, flags(u64),
// cstr_ptr(u64), length(u64) }. Names recovered by stripping the low-32
// fixup tag off cstr_ptr and reading `length` UTF-8 bytes at ProChannel:__DATA.
//   @0xe59d0  cstr @0xbd165 len=19  "Channel Bottom Left"    — leaq @0x0a6c35 / @0x0a6e93
//   @0xe59f0  cstr @0xbd179 len=20  "Channel Bottom Right"   — leaq @0x0a6c76 / @0x0a6ede
//   @0xe5a10  cstr @0xbd18e len=17  "Channel Top Right"      — leaq @0x0a6cb7 / @0x0a6f29
//   @0xe5a30  cstr @0xbd1a0 len=16  "Channel Top Left"       — leaq @0x0a6cf8 / @0x0a6f74
//   @0xe60f0  cstr len=20           "CHChannelQuadPercent"   — leaq @0x0a74e4 (getObjCWrapperName)
//
// ── GEOMETRY OUTPUT LAYOUT (getGeometry(double*)) ────────────────────────
// The `double*` variant writes 12 doubles (0x60 bytes) into the caller's
// buffer as four (x, y, 0)-triplets — one triplet per corner, with the third
// slot of each triplet zeroed (likely a homogeneous 'w' component reserved
// for a 3D lift-up path but always zero in the percent-quad case).
//
//   buffer[0x00] = p0.x     (from OZChannelPositionPercent::getPosition
//                            @0x0a733d — reads BOTH x AND y through p0's
//                            fast-path.  outX = buffer+0, outY = buffer+8.)
//   buffer[0x08] = p0.y
//   buffer[0x10] = 0.0                                             @0x0a7345
//   buffer[0x18] = p1.x = OZChannel::getValueAsDouble(this+0x2d0)  @0x0a7356
//   buffer[0x20] = p1.y = OZChannel::getValueAsDouble(this+0x368)  @0x0a736d
//   buffer[0x28] = 0.0                                             @0x0a7377
//   buffer[0x30] = p2.x = OZChannel::getValueAsDouble(this+0x490)  @0x0a7388
//   buffer[0x38] = p2.y = OZChannel::getValueAsDouble(this+0x528)  @0x0a739f
//   buffer[0x40] = 0.0                                             @0x0a73a9
//   buffer[0x48] = p3.x = OZChannel::getValueAsDouble(this+0x650)  @0x0a73ba
//   buffer[0x50] = p3.y = OZChannel::getValueAsDouble(this+0x6e8)  @0x0a73d4
//   buffer[0x58] = 0.0                                             @0x0a73de
//
// The individual X/Y offsets are relative-to-this = corner-base + 0x88 (for X)
// and corner-base + 0x120 (for Y), matching OZChannelPositionPercent's own
// layout (X sub-channel @+0x88, Y sub-channel @+0x120, class size 0x1c0).
// The `xorps %xmm0, %xmm0` before each getValueAsDouble sets `defaultValue=0.0`.
//
// ── BOUNDING-RECT MATH (getGeometry(PCRect<double>*)) ────────────────────
// The `PCRect<double>*` variant EVALUATES all 8 sub-channels (once each, for
// their side effects like curve caching) but only USES 4 of them:
//   — reads at 0x110, 0x1a8, 0x2d0, 0x368, 0x490, 0x528, 0x650, 0x6e8;
//   — SAVES to stack only the results from 0x2d0 (as p1.x), 0x368 (as p1.y),
//     0x650 (as p3.x), and 0x6e8 (as p3.y — held in xmm0 at bbox time);
//   — the other four reads (0x110, 0x1a8, 0x490, 0x528) are DISCARDED.
//
// Then two 2-D points are packed and min/max'd via SSE2 pd (2-double lane):
//   xmm2 = { p3.x, p1.y }  via unpcklpd -0x40 (p1.y) into %xmm2 (p3.x)
//   xmm1 = { p1.x, p3.y }  via unpcklpd %xmm0 (p3.y) into %xmm1 (p1.x)
//   xmm0 = maxpd(xmm2, xmm1) = { max(p3.x, p1.x), max(p1.y, p3.y) }
//   xmm1 = minpd(xmm2, xmm1) = { min(p1.x, p3.x), min(p3.y, p1.y) }
//   rect->origin = xmm1                                                 @0x0a74c8
//   rect->size   = xmm0 - xmm1  = (max - min)                           @0x0a74d0
//
// This is the axis-aligned bounding box of the diagonal p1..p3 (Bottom-Right
// and Top-Left corners). That's a SEMANTIC quirk in the FCP binary itself —
// the BL and TR corners are not consulted for the bbox. The other four
// getValueAsDouble calls are still made — presumably to keep the sub-channel
// cache "warm" (they still return values, discarded). We reproduce this
// exactly.
//
// ── PORT STATUS ─────────────────────────────────────────────────────────
// PARTIAL: layout, D2/D1/D0 destruction sequence, and the two non-empty
// getGeometry variants are FULLY transcribed. Every constructor is a
// throwing stub that cites its @0xADDR — the cross-class ctors it invokes
// (OZCompoundChannel::OZCompoundChannel, OZChannelPositionPercent::*)
// are extern / not-yet-decoded in the port. The stubs preserve the exact
// call graph as documentation, per PORTING_SPEC.md Rule 3 ("throw on
// undecoded"). getObjCWrapperName and getGeometry_float are fully transcribed.

import { OZCompoundChannel } from "./OZCompoundChannel.js";
import { OZChannelPositionPercent } from "./OZChannelPositionPercent.js";
import type { CMTime } from "../infra/CMTime.js";

/**
 * Narrow interface for the individual scalar X/Y sub-channels reached by
 * `OZChannel::getValueAsDouble(CMTime const&, double defaultValue) const`
 * @ProChannel (extern to this class — the base-class method itself is not
 * yet transcribed on the port's `OZChannel`, so we use this interface to
 * keep the call graph explicit without editing the shared `OZChannel.ts`).
 *
 * Call sites in this class:  @0x0a7356, @0x0a736d, @0x0a7388, @0x0a739f,
 *                            @0x0a73ba, @0x0a73d4 (getGeometry(double*));
 *                            @0x0a740d, @0x0a7420, @0x0a7433, @0x0a744b,
 *                            @0x0a7463, @0x0a7476, @0x0a7489, @0x0a74a4
 *                            (getGeometry(PCRect<double>*)).
 *
 * See raw-port/src/channels/OZChannel3D.ts:52 `OZChannelSub` for the same
 * pattern applied to OZChannel3D's three-axis frontier.
 */
export interface IOZScalarChannelAtOffset {
  /**
   * `OZChannel::getValueAsDouble(CMTime const&, double) const` — @ProChannel
   * (base method, mangled `__ZNK9OZChannel16getValueAsDoubleERK6CMTimed`);
   * not yet transcribed on the ported `OZChannel`. Throws in the port to
   * preserve a loud gap per PORTING_SPEC.md Rule 3.
   */
  getValueAsDouble(t: CMTime, defaultValue: number): number;
}

/**
 * `OZChannelQuadPercent_Factory::getInstance()` @ProChannel 0x0a6db2.
 * Not yet transcribed as a class — modelled as a throwing stub @ProChannel 0x0a6db2.
 */
function OZChannelQuadPercent_Factory_getInstance(): unknown {
  throw new Error(
    "OZChannelQuadPercent_Factory::getInstance() @ProChannel 0x0a6db2 " +
      "not yet transcribed (singleton call-once; see @0x0a6bf2 / @0x0a6e50 " +
      "ctor call sites)",
  );
}

/** `OZCompoundChannel::OZCompoundChannel(full-7arg)` @ProChannel (extern). Throw stub. */
function OZCompoundChannel_ctor_full(
  _self: OZCompoundChannel,
  _factory: unknown,
  _name: unknown,
  _folder: unknown,
  _flag1: number,
  _flag2: number,
  _flag3: boolean,
  _flag4: number,
): void {
  throw new Error(
    "OZCompoundChannel::OZCompoundChannel(OZFactory*, PCString const&, " +
      "OZChannelFolder*, uint, uint, bool, uint) @ProChannel (extern) " +
      "not yet transcribed — called from OZChannelQuadPercent ctors " +
      "@0x0a6c16 (5-arg) / @0x0a6e74 (13-arg)",
  );
}

/** `OZChannelPositionPercent::OZChannelPositionPercent(PCString, folder, u, u)` @ProChannel 0x7f052. */
function OZChannelPositionPercent_ctor_named(
  _self: OZChannelPositionPercent,
  _name: unknown,
  _folder: unknown,
  _cornerIndex: number,
  _flag: number,
): void {
  throw new Error(
    "OZChannelPositionPercent::OZChannelPositionPercent(PCString const&, " +
      "OZChannelFolder*, uint, uint) @ProChannel 0x7f052 not yet transcribed " +
      "— called from OZChannelQuadPercent 5-arg ctor @0x0a6c63 / @0x0a6ca4 " +
      "/ @0x0a6ce5 / @0x0a6d23",
  );
}

/** `OZChannelPositionPercent::OZChannelPositionPercent(x, y, PCString, folder, u, u)` @ProChannel 0x7f254. */
function OZChannelPositionPercent_ctor_xy(
  _self: OZChannelPositionPercent,
  _x: number,
  _y: number,
  _name: unknown,
  _folder: unknown,
  _cornerIndex: number,
  _flag: number,
): void {
  throw new Error(
    "OZChannelPositionPercent::OZChannelPositionPercent(double, double, " +
      "PCString const&, OZChannelFolder*, uint, uint) @ProChannel 0x7f254 " +
      "not yet transcribed — called from OZChannelQuadPercent 13-arg ctor " +
      "@0x0a6ecb / @0x0a6f16 / @0x0a6f61 / @0x0a6fa9",
  );
}

/** `OZChannelPositionPercent::OZChannelPositionPercent(copy)` @ProChannel 0x7f644. */
function OZChannelPositionPercent_ctor_copy(
  _self: OZChannelPositionPercent,
  _src: OZChannelPositionPercent,
  _folder: unknown,
): void {
  throw new Error(
    "OZChannelPositionPercent::OZChannelPositionPercent(OZChannelPositionPercent" +
      " const&, OZChannelFolder*) @ProChannel 0x7f644 not yet transcribed " +
      "— called from OZChannelQuadPercent copy ctor @0x0a723a / @0x0a7251 " +
      "/ @0x0a7268 / @0x0a727f",
  );
}

/** `OZChannelPositionPercent::getPosition(CMTime, double* x, double* y)` @ProChannel 0x0a791e. */
function OZChannelPositionPercent_getPosition(
  _self: OZChannelPositionPercent,
  _t: CMTime,
): { x: number; y: number } {
  throw new Error(
    "OZChannelPositionPercent::getPosition(CMTime const&, double*, double*) " +
      "@ProChannel 0x0a791e not yet transcribed — called from " +
      "OZChannelQuadPercent::getGeometry(double*) @0x0a733d",
  );
}

/** RIP-relative CFString @ProChannel 0xe59d0 → "Channel Bottom Left" — corner 0 label. */
const NAME_BOTTOM_LEFT = "Channel Bottom Left"; // cstr @0xbd165 len=19
/** RIP-relative CFString @ProChannel 0xe59f0 → "Channel Bottom Right" — corner 1 label. */
const NAME_BOTTOM_RIGHT = "Channel Bottom Right"; // cstr @0xbd179 len=20
/** RIP-relative CFString @ProChannel 0xe5a10 → "Channel Top Right" — corner 2 label. */
const NAME_TOP_RIGHT = "Channel Top Right"; // cstr @0xbd18e len=17
/** RIP-relative CFString @ProChannel 0xe5a30 → "Channel Top Left" — corner 3 label. */
const NAME_TOP_LEFT = "Channel Top Left"; // cstr @0xbd1a0 len=16
/** RIP-relative CFString @ProChannel 0xe60f0 → "CHChannelQuadPercent" — getObjCWrapperName's return. */
const OBJC_WRAPPER_NAME = "CHChannelQuadPercent"; // cstr len=20

/**
 * `PCRect<double>` — 4-double axis-aligned rectangle (origin + size).
 * Layout from getGeometry(PCRect<double>*) @0x0a74c8/@0x0a74d0.
 */
export interface PCRect_double {
  originX: number;
  originY: number;
  sizeX: number;
  sizeY: number;
}

/**
 * Sub-channel hosts used by `OZChannelQuadPercent::getGeometry_double` and
 * `::getGeometry_rect` — one `IOZScalarChannelAtOffset` per binary offset.
 * The field names encode the C++ member-offset from `this`.
 */
export interface IOZChannelQuadPercentGeometryHost {
  readonly channel_at_0x110: IOZScalarChannelAtOffset;
  readonly channel_at_0x1a8: IOZScalarChannelAtOffset;
  readonly channel_at_0x2d0: IOZScalarChannelAtOffset;
  readonly channel_at_0x368: IOZScalarChannelAtOffset;
  readonly channel_at_0x490: IOZScalarChannelAtOffset;
  readonly channel_at_0x528: IOZScalarChannelAtOffset;
  readonly channel_at_0x650: IOZScalarChannelAtOffset;
  readonly channel_at_0x6e8: IOZScalarChannelAtOffset;
}

/**
 * `OZChannelQuadPercent` — see file header for provenance.
 *
 * Owns four `OZChannelPositionPercent` corners in the fixed traversal order
 * (BottomLeft, BottomRight, TopRight, TopLeft). The corners are constructed
 * in-place by the various ctors (5-arg / 13-arg / factory-4-arg / copy) and
 * destroyed in REVERSE field order (TopLeft → TopRight → BottomRight →
 * BottomLeft) by D2 @0x0a797a.
 */
export class OZChannelQuadPercent extends OZCompoundChannel {
  /** @ProChannel +0x088 — first corner (p0, "Channel Bottom Left"). Constructed @0x0a6c63/@0x0a6ecb/@0x0a723a; destroyed 4th @0x0a79c3. */
  public p0: OZChannelPositionPercent | null = null;
  /** @ProChannel +0x248 — second corner (p1, "Channel Bottom Right"). Constructed @0x0a6ca4/@0x0a6f16/@0x0a7251; destroyed 3rd @0x0a79b7. */
  public p1: OZChannelPositionPercent | null = null;
  /** @ProChannel +0x408 — third corner (p2, "Channel Top Right"). Constructed @0x0a6ce5/@0x0a6f61/@0x0a7268; destroyed 2nd @0x0a79ab. */
  public p2: OZChannelPositionPercent | null = null;
  /** @ProChannel +0x5c8 — fourth corner (p3, "Channel Top Left"). Constructed @0x0a6d23/@0x0a6fa9/@0x0a727f; destroyed 1st @0x0a799f. */
  public p3: OZChannelPositionPercent | null = null;

  /**
   * External sub-channel host — provided by the caller once the ctors are
   * transcribed. Nullable; if any geometry method is called before this is
   * populated, it throws citing the sub-channel offset callsites.
   */
  public geometryHost: IOZChannelQuadPercentGeometryHost | null = null;

  /**
   * `OZChannelQuadPercent::OZChannelQuadPercent(PCString const&,
   * OZChannelFolder*, uint, uint, uint)` — @ProChannel 0x0a6bce (C2;
   * the C1 at 0x0a6dfa is a pushq/popq/jmp thunk).
   *
   * Body pattern (each corner block, corners 0..3, with cornerIndex 1..4):
   *   getProChannelBundle()  →  rax                             @0x0a6c30
   *   PCString::PCString(local, cornerNameCFString, bundle, null)  @0x0a6c45
   *   OZChannelPositionPercent::OZChannelPositionPercent(this + cornerOff,
   *     &local, this, cornerIndex, 0)                            @0x0a6c63
   *   PCString::~PCString(&local)                                @0x0a6c6c
   *
   * PORT STATUS @0x0a6bce: throwing stub — every callee is a not-yet-transcribed
   * frontier.
   */
  public static ctor_named(
    self: OZChannelQuadPercent,
    _name: unknown,
    _folder: unknown,
    _a: number,
    _b: number,
    _c: number,
  ): void {
    void self;
    void NAME_BOTTOM_LEFT;
    void NAME_BOTTOM_RIGHT;
    void NAME_TOP_RIGHT;
    void NAME_TOP_LEFT;
    void OZChannelQuadPercent_Factory_getInstance;
    void OZCompoundChannel_ctor_full;
    void OZChannelPositionPercent_ctor_named;
    throw new Error(
      "OZChannelQuadPercent::OZChannelQuadPercent(PCString const&, " +
        "OZChannelFolder*, uint, uint, uint) @ProChannel 0x0a6bce not yet " +
        "transcribed — depends on OZCompoundChannel::OZCompoundChannel " +
        "@0x0a6c16 (extern) + 4× OZChannelPositionPercent(PCString const&, " +
        "OZChannelFolder*, uint, uint) @ProChannel 0x7f052 + PCString ctors " +
        "@stub 0xacd02",
    );
  }

  /**
   * `OZChannelQuadPercent::OZChannelQuadPercent(double×8, PCString const&,
   *   OZChannelFolder*, uint, uint, uint)` — @ProChannel 0x0a6e04 (C2;
   * C1 at 0x0a7038 is a tail-jmp).
   *
   * Structurally identical to `ctor_named` but each corner's ctor is the
   * (x, y)-taking overload @0x7f254. The 8 doubles are spilled to stack at
   * @0x0a6e25..@0x0a6e48 and reloaded per-corner.
   */
  public static ctor_xy_named(
    self: OZChannelQuadPercent,
    _x0: number,
    _y0: number,
    _x1: number,
    _y1: number,
    _x2: number,
    _y2: number,
    _x3: number,
    _y3: number,
    _name: unknown,
    _folder: unknown,
    _a: number,
    _b: number,
    _c: number,
  ): void {
    void self;
    void OZChannelPositionPercent_ctor_xy;
    throw new Error(
      "OZChannelQuadPercent::OZChannelQuadPercent(double×8, PCString const&, " +
        "OZChannelFolder*, uint, uint, uint) @ProChannel 0x0a6e04 not yet " +
        "transcribed — depends on OZCompoundChannel::OZCompoundChannel " +
        "@0x0a6e74 (extern) + 4× OZChannelPositionPercent(double, double, " +
        "PCString const&, OZChannelFolder*, uint, uint) @ProChannel 0x7f254",
    );
  }

  /**
   * `OZChannelQuadPercent::OZChannelQuadPercent(OZFactory*, PCString const&,
   * uint, uint)` — @ProChannel 0x0a7042 (C2; C1 at 0x0a71f0 is a tail-jmp).
   */
  public static ctor_factory(
    self: OZChannelQuadPercent,
    _factory: unknown,
    _name: unknown,
    _a: number,
    _b: number,
  ): void {
    void self;
    throw new Error(
      "OZChannelQuadPercent::OZChannelQuadPercent(OZFactory*, PCString const&, " +
        "uint, uint) @ProChannel 0x0a7042 not yet transcribed — depends on " +
        "OZCompoundChannel::OZCompoundChannel (extern) + 4× " +
        "OZChannelPositionPercent(OZFactory*, PCString const&, uint) " +
        "@ProChannel 0x7f46a",
    );
  }

  /**
   * `OZChannelQuadPercent::OZChannelQuadPercent(OZChannelQuadPercent const&,
   * OZChannelFolder*)` — @ProChannel 0x0a71fa (C2 copy; C1 at 0x0a72ce is a
   * tail-jmp).
   *
   * Body @0x0a71fa..@0x0a7292:
   *   OZCompoundChannel::OZCompoundChannel(compound-copy)     @0x0a720e
   *   *(this+0x000) = vtable+0x10                              @0x0a721a
   *   *(this+0x010) = vtable+0x358                             @0x0a7224
   *   OZChannelPositionPercent::(copy)(this+0x088, src+0x088, this)  @0x0a723a
   *   OZChannelPositionPercent::(copy)(this+0x248, src+0x248, this)  @0x0a7251
   *   OZChannelPositionPercent::(copy)(this+0x408, src+0x408, this)  @0x0a7268
   *   OZChannelPositionPercent::(copy)(this+0x5c8, src+0x5c8, this)  @0x0a727f
   */
  public static ctor_copy(
    self: OZChannelQuadPercent,
    _src: OZChannelQuadPercent,
    _folder: unknown,
  ): void {
    void self;
    void OZChannelPositionPercent_ctor_copy;
    throw new Error(
      "OZChannelQuadPercent::OZChannelQuadPercent(OZChannelQuadPercent const&, " +
        "OZChannelFolder*) @ProChannel 0x0a71fa not yet transcribed — depends " +
        "on OZCompoundChannel::OZCompoundChannel(copy) (extern) + 4× " +
        "OZChannelPositionPercent::OZChannelPositionPercent(copy) @ProChannel 0x7f644",
    );
  }

  /**
   * `OZChannelQuadPercent::clone() const` — @ProChannel 0x0a72d8.
   *
   * Body: `operator new(0x788)` @0x0a72e7 → `ctor_copy(new, *this, nullptr)`
   * @0x0a72f7 → return new.
   */
  public clone(): OZChannelQuadPercent {
    throw new Error(
      "OZChannelQuadPercent::clone() @ProChannel 0x0a72d8 not yet " +
        "transcribed — depends on operator new(0x788) @0x0a72e7 + " +
        "ctor_copy @0x0a71fa (both frontier stubs above)",
    );
  }

  /**
   * `OZChannelQuadPercent::getGeometry(CMTime const&, float*)` —
   * @ProChannel 0x0a7318. **EMPTY BODY** in FCP.
   */
  public getGeometry_float(_t: CMTime, _out: Float32Array): void {
    // Faithful: no-op. @0x0a7318..@0x0a731d.
    return;
  }

  /**
   * `OZChannelQuadPercent::getGeometry(CMTime const&, double*)` —
   * @ProChannel 0x0a731e.
   *
   * ── EXACT ASM FLOW ─────────────────────────────────────────────────
   *   0x0a7332  leaq  0x8(rdx), rcx           ; rcx = out + 8 (outY for p0)
   *   0x0a7336  addq  $0x88, rdi              ; rdi = this + 0x88 (p0)
   *   0x0a733d  callq OZChannelPositionPercent::getPosition(this+0x88, t, out+0, out+8)
   *   0x0a7342  xorl  r12d, r12d              ; r12 = 0 (u64)
   *   0x0a7345  movq  r12, 0x10(rbx)          ; out[0x10] = 0 (w slot for p0)
   *   0x0a7349..0x0a735b  p1.x = getValueAsDouble(this+0x2d0, t, 0.0); out[0x18] = p1.x
   *   0x0a7360..0x0a7372  p1.y = getValueAsDouble(this+0x368, t, 0.0); out[0x20] = p1.y
   *   0x0a7377           out[0x28] = 0
   *   0x0a737b..0x0a738d  p2.x = getValueAsDouble(this+0x490, t, 0.0); out[0x30] = p2.x
   *   0x0a7392..0x0a73a4  p2.y = getValueAsDouble(this+0x528, t, 0.0); out[0x38] = p2.y
   *   0x0a73a9           out[0x40] = 0
   *   0x0a73ad..0x0a73bf  p3.x = getValueAsDouble(this+0x650, t, 0.0); out[0x48] = p3.x
   *   0x0a73c4  addq  $0x6e8, r15             ; r15 = this + 0x6e8 (p3.y sub-channel)
   *   0x0a73ce..0x0a73d9  p3.y = getValueAsDouble(this+0x6e8, t, 0.0); out[0x50] = p3.y
   *   0x0a73de           out[0x58] = 0
   *   0x0a73ea  retq
   */
  public getGeometry_double(t: CMTime, out: Float64Array): void {
    if (out.length < 12) {
      throw new Error(
        "OZChannelQuadPercent::getGeometry(double*) @ProChannel 0x0a731e: " +
          "output buffer must be >= 12 doubles (96 bytes)",
      );
    }
    // @0x0a733d — corner 0 (p0, BottomLeft) via the compound getPosition path.
    if (this.p0 === null) {
      throw new Error(
        "OZChannelQuadPercent::getGeometry(double*) @0x0a733d: p0 (@+0x88) " +
          "is null — the ctor did not populate it (all four ctors are " +
          "throwing stubs in this port; see class docstring)",
      );
    }
    const p0xy = OZChannelPositionPercent_getPosition(this.p0, t);
    out[0] = p0xy.x; // @0x0a733d (outX pointer = out+0)
    out[1] = p0xy.y; // @0x0a733d (outY pointer = out+8)
    // @0x0a7345 — 0-fill of the third slot of the p0 triplet (w).
    out[2] = 0.0;

    // Corners 1..3 read x and y through individual OZChannel::getValueAsDouble
    // sub-channels. We access them via IOZScalarChannelAtOffset host slots.
    if (this.geometryHost === null) {
      throw new Error(
        "OZChannelQuadPercent::getGeometry(double*) @ProChannel 0x0a731e: " +
          "geometryHost is null — the sub-channel host must be installed " +
          "by the caller (mirrors the ABI-observable fact that the 8 " +
          "sub-channels @+0x110/+0x1a8/+0x2d0/+0x368/+0x490/+0x528/+0x650/" +
          "+0x6e8 live inside the four p0..p3 OZChannelPositionPercent " +
          "corners whose ctors are frontier stubs)",
      );
    }
    const host = this.geometryHost;
    // @0x0a7356 — p1.x = getValueAsDouble(this+0x2d0, t, 0.0)
    out[3] = host.channel_at_0x2d0.getValueAsDouble(t, 0.0);
    // @0x0a736d — p1.y = getValueAsDouble(this+0x368, t, 0.0)
    out[4] = host.channel_at_0x368.getValueAsDouble(t, 0.0);
    // @0x0a7377 — 0-fill
    out[5] = 0.0;
    // @0x0a7388 — p2.x = getValueAsDouble(this+0x490, t, 0.0)
    out[6] = host.channel_at_0x490.getValueAsDouble(t, 0.0);
    // @0x0a739f — p2.y = getValueAsDouble(this+0x528, t, 0.0)
    out[7] = host.channel_at_0x528.getValueAsDouble(t, 0.0);
    // @0x0a73a9 — 0-fill
    out[8] = 0.0;
    // @0x0a73ba — p3.x = getValueAsDouble(this+0x650, t, 0.0)
    out[9] = host.channel_at_0x650.getValueAsDouble(t, 0.0);
    // @0x0a73d4 — p3.y = getValueAsDouble(this+0x6e8, t, 0.0)
    out[10] = host.channel_at_0x6e8.getValueAsDouble(t, 0.0);
    // @0x0a73de — 0-fill
    out[11] = 0.0;
  }

  /**
   * `OZChannelQuadPercent::getGeometry(CMTime const&, PCRect<double>*)` —
   * @ProChannel 0x0a73ec.
   *
   * Computes the axis-aligned bounding rect of the DIAGONAL corners p1 (BR)
   * and p3 (TL). The other 4 sub-channel reads (p0.x, p0.y, p2.x, p2.y) are
   * evaluated and DISCARDED (side-effect only). See file header BOUNDING-RECT
   * MATH block for the full SSE2 decode.
   */
  public getGeometry_rect(t: CMTime, rect: PCRect_double): void {
    if (this.geometryHost === null) {
      throw new Error(
        "OZChannelQuadPercent::getGeometry(PCRect<double>*) @ProChannel " +
          "0x0a73ec: geometryHost is null — see getGeometry_double for the " +
          "same requirement",
      );
    }
    const host = this.geometryHost;
    // @0x0a740d — DISCARDED: p0.x sub-channel read at this+0x110.
    void host.channel_at_0x110.getValueAsDouble(t, 0.0);
    // @0x0a7420 — DISCARDED: p0.y sub-channel read at this+0x1a8.
    void host.channel_at_0x1a8.getValueAsDouble(t, 0.0);
    // @0x0a7433 — p1.x, KEPT.
    const p1x = host.channel_at_0x2d0.getValueAsDouble(t, 0.0);
    // @0x0a744b — p1.y, KEPT.
    const p1y = host.channel_at_0x368.getValueAsDouble(t, 0.0);
    // @0x0a7463 — DISCARDED: p2.x sub-channel read at this+0x490.
    void host.channel_at_0x490.getValueAsDouble(t, 0.0);
    // @0x0a7476 — DISCARDED: p2.y sub-channel read at this+0x528.
    void host.channel_at_0x528.getValueAsDouble(t, 0.0);
    // @0x0a7489 — p3.x, KEPT.
    const p3x = host.channel_at_0x650.getValueAsDouble(t, 0.0);
    // @0x0a74a4 — p3.y, KEPT.
    const p3y = host.channel_at_0x6e8.getValueAsDouble(t, 0.0);

    // SSE2 minpd/maxpd + subpd @0x0a74a9..@0x0a74d0
    const minX = p1x < p3x ? p1x : p3x; // minpd lane 0
    const minY = p1y < p3y ? p1y : p3y; // minpd lane 1
    const maxX = p1x > p3x ? p1x : p3x;
    const maxY = p1y > p3y ? p1y : p3y;
    rect.originX = minX; // @0x0a74c8 movupd xmm1,(rbx)  low lane
    rect.originY = minY; // @0x0a74c8                        high lane
    rect.sizeX = maxX - minX; // @0x0a74d0 subpd + movupd low lane
    rect.sizeY = maxY - minY; // @0x0a74d0                        high lane
  }

  /**
   * `OZChannelQuadPercent::getObjCWrapperName()` — @ProChannel 0x0a74e0.
   *
   * Body: `leaq 0x3ec05(%rip), %rax` @0x0a74e4 (returns the CFStringRef at
   * @0xe60f0 = "CHChannelQuadPercent").
   */
  public getObjCWrapperName(): string {
    // @0x0a74e4 — leaq to __cfstring @0xe60f0 (cstr len=20).
    return OBJC_WRAPPER_NAME;
  }

  /**
   * `OZChannelQuadPercent::~OZChannelQuadPercent()` — the D2 base dtor at
   * @ProChannel 0x0a797a. D1 (@0x0a74ee) and D0 (@0x0a74f8) both call
   * D2 as their first action (D0 then calls `operator delete` on `this`).
   *
   * Body (D2):
   *   *(this+0x000) = vtable+0x10                     @0x0a7983
   *   *(this+0x010) = vtable+0x358                    @0x0a798d
   *   addq $0x5c8, %rdi ; OZChannel2D::~OZChannel2D()  @0x0a7998..0x0a799f  (p3)
   *   leaq 0x408(%rbx), %rdi ; OZChannel2D::~OZChannel2D()                    (p2)
   *   leaq 0x248(%rbx), %rdi ; OZChannel2D::~OZChannel2D()                    (p1)
   *   leaq 0x088(%rbx), %rdi ; OZChannel2D::~OZChannel2D()                    (p0)
   *   tail-jmp OZCompoundChannel::~OZCompoundChannel                          @0x0a79d1
   */
  public destruct(): void {
    // @0x0a7983 / @0x0a798d — vtable rebind is a no-op in TS; the values
    // are documented in the file header for provenance.
    // @0x0a7998..@0x0a79c3 — destroy p3, p2, p1, p0 in REVERSE order.
    this.p3 = null; // @0x0a799f (was via addq $0x5c8, %rdi)
    this.p2 = null; // @0x0a79ab
    this.p1 = null; // @0x0a79b7
    this.p0 = null; // @0x0a79c3
    // @0x0a79d1 — tail-jmp to OZCompoundChannel::~OZCompoundChannel (extern).
    // In TS, no base destructor call is emitted; JS GC and the OZCompoundChannel
    // fields are dropped when the parent object is unreferenced.
  }
}
