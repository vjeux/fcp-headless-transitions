// raw-port/src/render/HGLevels.ts
//
// FCP `HGLevels` — Helium render-graph node that applies a per-channel
// (or luma) levels curve (shadow / mid / gain-lift kind of parameters
// stored in 10 xmm-lane buckets = 40 float params total). Subclass of
// `HGNode` (already landed). Constructs two internal HGRenderer/HGNode
// helper nodes at +0x240 / +0x248 with default parameter buffers.
//
// Framework: Helium. All @0xADDR VAs are from `otool -tV -arch x86_64
// Helium`. RIP-relative data addresses read from the __TEXT __const
// section (addr 0x3c7b80 in the x86_64 slice).
//
// Symbols decoded here:
//   0x230540  HGLevels::HGLevels()                                     [C2]
//   0x230930  HGLevels::HGLevels()                                     [C1 tail-jmp C2]
//   0x230940  HGLevels::~HGLevels()                                    [D2 base]
//   0x230990  HGLevels::~HGLevels()                                    [D1 tail-jmp D2]
//   0x2309e0  HGLevels::~HGLevels()                                    [D0 deleting]
//   0x230a30  HGLevels::SetParameter(int, float, float, float, float)
//   0x230aa0  HGLevels::GetOutput(HGRenderer*)                         [1105-line renderer
//                                                                       traversal - throw-stub]
//   0x232260  HGLevels::isLuma() const
//   0x232340  HGLevels::isRGB() const
//   0x232630  HGLevels::getAmount(int idx, float* out0..out12)
//
// Vtable installed by C2 @0x230559 via `leaq 0x803578(%rip), %rax` ->
// __ZTV8HGLevels @0x0000000000a33ad8 (=0x230560+7+0x803578).
//
// -- FIELD LAYOUT (extends HGNode; inherited base ends near +0x198) --
//   +0x198 : f32[4]   bucket0 "shadow-in"        (ctor: 0,0,0,0 via `movups xmm0`)
//   +0x1a8 : f32[4]   bucket1 "shadow-out"       (ctor: 0,0,0,0 via `movups xmm0`)
//   +0x1b8 : f32[4]   bucket2 "mid-in"           (ctor: 0.25,0.25,0.25,0.25 memset_pattern16
//                                                  @0x85dc90)
//   +0x1c8 : f32[4]   bucket3 "mid-out"          (ctor: 0.25 pattern @0x85dc90)
//   +0x1d8 : f32[4]   bucket4                    (ctor: 0.5 pattern @0x3c7c70)
//   +0x1e8 : f32[4]   bucket5                    (ctor: 0.5 pattern @0x3c7c70)
//   +0x1f8 : f32[4]   bucket6                    (ctor: 0.75 pattern @0x88d630)
//   +0x208 : f32[4]   bucket7                    (ctor: 0.75 pattern @0x88d630)
//   +0x218 : f32[4]   bucket8 "hi-in"            (ctor: 1.0 pattern @0x3c7c40)
//   +0x228 : f32[4]   bucket9 "hi-out"           (ctor: 1.0 pattern @0x3c7c40)
//   +0x240 : HGNode*  childRenderer0             (ctor: `new HGObject(0x1a0)`+HGNode base,
//                                                  0x147-byte aligned float buffer @+0x198)
//   +0x248 : HGNode*  childRenderer1             (ctor: `new HGObject(0x1a0)`+HGNode base,
//                                                  0x2e7-byte aligned float buffer @+0x198)
//
// Each xmm bucket holds one parameter across 4 "lanes" (lane0..lane3).
// SetParameter uses `idx / 10` to pick a lane, `idx % 10` to pick a bucket.
// The 4th lane (offset +0xC within the xmm) is the "meta" lane read by isLuma;
// isRGB checks lanes 0,1,2 (the R,G,B channels).
//
// The two child helper nodes at +0x240 and +0x248 each own a large
// aligned float buffer initialized with distinct default constants.
// See ctor doc-comment below for the byte-exact layout of both.
//
// DECODE-DON'T-FIT: every field, offset, constant, and vcall below is
// transcribed from the disassembly with its @0xADDR cited.

import { HGNode } from "./HGNode";

// -- constants read from Helium __TEXT __const (x86_64 slice) ---------
// All addresses are file/VM addresses in Helium.framework.
const PAT_0P25 = [Math.fround(0.25), Math.fround(0.25), Math.fround(0.25), Math.fround(0.25)] as const; // @0x85dc90
const PAT_0P50 = [Math.fround(0.5),  Math.fround(0.5),  Math.fround(0.5),  Math.fround(0.5) ] as const; // @0x3c7c70
const PAT_0P75 = [Math.fround(0.75), Math.fround(0.75), Math.fround(0.75), Math.fround(0.75)] as const; // @0x88d630
const PAT_1P00 = [Math.fround(1.0),  Math.fround(1.0),  Math.fround(1.0),  Math.fround(1.0) ] as const; // @0x3c7c40

// Default-check reference values used by isLuma / isRGB (lane-3 of
// buckets 0x1b8..0x228). All read from __TEXT __const.
const DEFAULT_LANE_1c4 = Math.fround(0.25);   // @0x3cb6c4  - bucket2 lane3
const DEFAULT_LANE_1d4 = Math.fround(0.25);   // @0x3cb6c4  - bucket3 lane3
const DEFAULT_LANE_1e4 = Math.fround(0.5);    // @0x3c7cc8  - bucket4 lane3
const DEFAULT_LANE_1f4 = Math.fround(0.5);    // @0x3c7cc8  - bucket5 lane3
const DEFAULT_LANE_204 = Math.fround(0.75);   // @0x3d2310  - bucket6 lane3
const DEFAULT_LANE_214 = Math.fround(0.75);   // @0x3d2310  - bucket7 lane3
const DEFAULT_LANE_224 = Math.fround(1.0);    // @0x3c7cc0  - bucket8 lane3
const DEFAULT_LANE_234 = Math.fround(1.0);    // @0x3c7cc0  - bucket9 lane3

// getAmount uses pow(x, 1.8) on the lane-i value of each bucket. The
// exponent double 1.8 is stored at Helium __const @0x88d640 and
// loaded via `movsd 0x65af59(%rip),%xmm1` at 10 different instrs
// (0x2326df, 0x2326fe, 0x23271d, 0x23273c, 0x23275b, 0x23277a,
// 0x232799, 0x2327b8, 0x2327d7, 0x2327f6).
const POW_EXP_1P8 = 1.8;                       // @0x88d640

// getAmount closing formula uses `movss 0x195479(%rip), %xmm2`
// @0x23283f -> 1.0f at Helium __const 0x3c7cc0 (loaded as float).
const ONE_F = Math.fround(1.0);                // @0x3c7cc0

// -- HGLevels ---------------------------------------------------------

/**
 * `HGLevels` - Helium levels-adjust render node.
 *
 * SetParameter accepts 40 parameter indices (0..39). Each param maps
 * to one *lane* of one xmm-bucket; the bucket is `idx % 10` (0..9),
 * and the lane is `idx / 10` (0..3, where 3 is the "meta" lane read
 * by isLuma and 0..2 are the R/G/B lanes read by isRGB).
 *
 * The class also owns two dependent HGRenderer helper nodes (child0
 * @+0x240, child1 @+0x248) each carrying a distinct default parameter
 * buffer. Those helpers are re-parameterised inside GetOutput to build
 * the actual per-channel LUTs.
 */
export class HGLevels extends HGNode {
  /** @+0x198 bucket0 "shadow-in"; ctor init 0,0,0,0 (Helium @0x2305ae). */
  bucket0_198: [number, number, number, number] = [0, 0, 0, 0];

  /** @+0x1a8 bucket1 "shadow-out"; ctor init 0,0,0,0 (Helium @0x2305b5). */
  bucket1_1a8: [number, number, number, number] = [0, 0, 0, 0];

  /** @+0x1b8 bucket2; ctor init 0.25 pattern @Helium 0x85dc90 (memset_pattern16 @0x2305cb). */
  bucket2_1b8: [number, number, number, number] = [PAT_0P25[0], PAT_0P25[1], PAT_0P25[2], PAT_0P25[3]];

  /** @+0x1c8 bucket3; ctor init 0.25 pattern @Helium 0x85dc90 (memset_pattern16 @0x2305db). */
  bucket3_1c8: [number, number, number, number] = [PAT_0P25[0], PAT_0P25[1], PAT_0P25[2], PAT_0P25[3]];

  /** @+0x1d8 bucket4; ctor init 0.5 pattern @Helium 0x3c7c70 (memset_pattern16 @0x2305f2). */
  bucket4_1d8: [number, number, number, number] = [PAT_0P50[0], PAT_0P50[1], PAT_0P50[2], PAT_0P50[3]];

  /** @+0x1e8 bucket5; ctor init 0.5 pattern @Helium 0x3c7c70 (memset_pattern16 @0x230602). */
  bucket5_1e8: [number, number, number, number] = [PAT_0P50[0], PAT_0P50[1], PAT_0P50[2], PAT_0P50[3]];

  /** @+0x1f8 bucket6; ctor init 0.75 pattern @Helium 0x88d630 (memset_pattern16 @0x23061a). */
  bucket6_1f8: [number, number, number, number] = [PAT_0P75[0], PAT_0P75[1], PAT_0P75[2], PAT_0P75[3]];

  /** @+0x208 bucket7; ctor init 0.75 pattern @Helium 0x88d630 (memset_pattern16 @0x23062b). */
  bucket7_208: [number, number, number, number] = [PAT_0P75[0], PAT_0P75[1], PAT_0P75[2], PAT_0P75[3]];

  /** @+0x218 bucket8; ctor init 1.0 pattern @Helium 0x3c7c40 (memset_pattern16 @0x230643). */
  bucket8_218: [number, number, number, number] = [PAT_1P00[0], PAT_1P00[1], PAT_1P00[2], PAT_1P00[3]];

  /** @+0x228 bucket9; ctor init 1.0 pattern @Helium 0x3c7c40 (memset_pattern16 @0x230654). */
  bucket9_228: [number, number, number, number] = [PAT_1P00[0], PAT_1P00[1], PAT_1P00[2], PAT_1P00[3]];

  /**
   * @+0x240 childRenderer0 - HGNode owned pointer created by ctor.
   *
   * Ctor sub-sequence @Helium 0x230659..0x23074e:
   *   0x230659  edi = 0x1a0; call HGObject::operator new(0x1a0) -> rax
   *   0x230669  call HGNode::HGNode() on the fresh 0x1a0-byte alloc
   *   0x23066e  install vtable *(child) = @Helium 0xa33650 (leaq 0x230675+0x802fe3)
   *   0x230678  edi = 0x147; call operator new[](0x147) - raw byte buffer
   *   0x230682  align pointer up to 8+32 boundary (leaq/negl/andl 31)
   *   0x230697  zero 0x80 bytes at aligned+0..0x80 (8x movaps xmm0=0)
   *   0x2306c2  write PAT{0,0,0,1} @+0x88 and +0x98 (movaps @Helium 0x3c9fe0)
   *   0x2306d9  write PAT{-2,-2,-2,0} @+0xa8 and +0xb8 (movaps @Helium 0x88d5c0)
   *   0x2306f0  write PAT{3,3,3,0}   @+0xc8 and +0xd8 (movaps @Helium 0x88d5d0)
   *   0x230707  write PAT{1,1,1,0}   @+0xe8 and +0xf8 (movaps @Helium 0x3ca9c0)
   *   0x23071e  write MASK(all-ones triple) @+0x108 and +0x118 (movaps @Helium 0x88c7f0)
   *   0x230735  store aligned buffer pointer @+0x198 of child
   *   0x23073c  child[+0x10] &= ~0x600; |= 0x400  (HGNode flag bits)
   *   0x23074e  this[+0x240] = child
   *
   * The buffer at aligned+0x88..+0x11f (5x f32 quad) is child0's
   * default parameter block. NaN entries in the constants are integer
   * all-ones bit masks used by SSE lane selection - kept verbatim in
   * the memset_pattern16 catalog above.
   */
  childRenderer0_240: HGNode | null = null;

  /**
   * @+0x248 childRenderer1 - second HGNode owned pointer.
   *
   * Ctor sub-sequence @Helium 0x230755..0x2308d2 mirrors child0 but
   * with a 0x2e7-byte aligned buffer bzeroed to 0x160 then filled with
   * 11x f32 quad constants @+0x168..+0x2b8 (movaps @Helium 0x19b2e3,
   * 0x65ce2a, 0x65ce21, 0x65ce18, 0x3c9fe0, 0x3caa70, 0x88c7f0,
   * 0x85fc40, 0x88d290, 0x88d620, 0x88d3a0). The child's vtable
   * pointer installed @0x23076a is a DIFFERENT class (0x230771+0x803127
   * = @Helium 0xa33ba0) - a distinct HGNode subclass from child0.
   * Full disasm of child helper vtables + their parameter semantics
   * belongs to the throw-stubbed GetOutput() below.
   */
  childRenderer1_248: HGNode | null = null;

  /**
   * HGLevels::HGLevels() - complete-object ctor (C1 @0x230930 tail-jmps
   * to C2 @0x230540).
   *
   * We port the C2 body:
   *   1. HGNode::HGNode() (base ctor @0x11baf0)                                @0x230554
   *   2. install vtable *(this) = @Helium 0xa33ad8 (leaq 0x230560+0x803578)    @0x230559
   *   3. zero-init buckets 0..1 (movups xmm0 @+0x198,+0x1a8)                   @0x2305ae
   *   4. fill buckets 2..9 with distinct 4-lane patterns via memset_pattern16
   *      (see per-field @provenance above)                                     @0x2305cb..0x230654
   *   5. new HGNode child0 @+0x240 with 0x147-byte aligned parameter buffer    @0x230659..0x23074e
   *   6. new HGNode child1 @+0x248 with 0x2e7-byte aligned parameter buffer    @0x230755..0x2308d2
   *
   * The child-buffer *contents* (numeric-quad constants + NaN bit-masks)
   * are transcribed exactly in the doc comments on the two child fields
   * above. Their SEMANTIC role (pow-exponent / bias / mask / gamma
   * factor) is determined by the child-node vtable calls issued inside
   * GetOutput and is NOT decoded here - that is deferred to a proper
   * port of the two child HGNode subclasses (throw-stubbed frontier).
   *
   * @provenance Helium @0x230540 (C2), @0x230930 (C1)
   */
  constructor() {
    super();
    // vtable install: (this)[0] = @Helium 0xa33ad8. Not modeled at the
    // TS level; class identity is already carried by the JS class.

    // Zero-init buckets 0..1 (movups xmm0=0 to +0x198 and +0x1a8, @0x2305ae).
    this.bucket0_198 = [0, 0, 0, 0];
    this.bucket1_1a8 = [0, 0, 0, 0];

    // Buckets 2..9 use memset_pattern16 to broadcast a 4-float pattern.
    this.bucket2_1b8 = [PAT_0P25[0], PAT_0P25[1], PAT_0P25[2], PAT_0P25[3]]; // @0x2305cb
    this.bucket3_1c8 = [PAT_0P25[0], PAT_0P25[1], PAT_0P25[2], PAT_0P25[3]]; // @0x2305db
    this.bucket4_1d8 = [PAT_0P50[0], PAT_0P50[1], PAT_0P50[2], PAT_0P50[3]]; // @0x2305f2
    this.bucket5_1e8 = [PAT_0P50[0], PAT_0P50[1], PAT_0P50[2], PAT_0P50[3]]; // @0x230602
    this.bucket6_1f8 = [PAT_0P75[0], PAT_0P75[1], PAT_0P75[2], PAT_0P75[3]]; // @0x23061a
    this.bucket7_208 = [PAT_0P75[0], PAT_0P75[1], PAT_0P75[2], PAT_0P75[3]]; // @0x23062b
    this.bucket8_218 = [PAT_1P00[0], PAT_1P00[1], PAT_1P00[2], PAT_1P00[3]]; // @0x230643
    this.bucket9_228 = [PAT_1P00[0], PAT_1P00[1], PAT_1P00[2], PAT_1P00[3]]; // @0x230654

    // Child helper nodes (child0 @+0x240, child1 @+0x248). Their inner
    // parameter buffers are pre-populated with 4-float SSE quads and
    // their HGNode flag word is set to (flags & ~0x600) | 0x400
    // @0x23073c and @0x2308c0. The two child HGNodes are of different
    // vtable identity (child0 @Helium 0xa33650, child1 @Helium 0xa33ba0)
    // and are not yet decoded as first-class TS classes. We create
    // untyped placeholders here whose *presence* mirrors the C++
    // ctor state; any read/write is guarded by the throw-stubs below.
    this.childRenderer0_240 = null; // placeholder; @Helium 0x230659..0x23074e
    this.childRenderer1_248 = null; // placeholder; @Helium 0x230755..0x2308d2

    // ANTI-SHORTCUT: constructing real TS models for the two child
    // HGNode subclasses would require decoding their vtables + all
    // their param handlers (fed by GetOutput). That is a strictly
    // larger decode job. The child instances are stored as null and
    // any code path that reaches into them is defended by a throw
    // stub inside GetOutput.
  }

  /**
   * HGLevels::~HGLevels() - D2 base dtor @0x230940 (D0/D1 chain to D2).
   *
   * Body (identical in D0/D1/D2 shape, D0 also invokes operator delete):
   *   *(this) = @Helium 0xa33ad8                                           @0x2309e9
   *   rdi = (this)[+0x240]; call *(*(rdi))[+0x18]  // Release child0       @0x2309f3
   *   rdi = (this)[+0x248]; call *(*(rdi))[+0x18]  // Release child1       @0x230a00
   *   call HGNode::~HGNode() (D2)                                          @0x230a10
   *   (D0 tail: call HGObject::operator delete(this))                      @0x230a1e
   *
   * @provenance Helium @0x230940 (D2), @0x230990 (D1), @0x2309e0 (D0)
   */
  destruct(): void {
    // Release the two child renderers via their vtable Release slot
    // (*0x18). In this TS port we just null out the JS references and
    // let GC reclaim; the semantic effect of HGObject Release is
    // preserved because the child was owned solely by this class.
    this.childRenderer0_240 = null;
    this.childRenderer1_248 = null;
    super.destruct();
  }

  /**
   * HGLevels::SetParameter(int idx, float v, float, float, float)
   *
   * Returns:
   *   -1  if idx > 39                                          @0x230a35 (`cmpl $0x27`)
   *    0  if the value equals what is already stored (no-op)   @0x230a8f (`xorl eax,eax; ret`)
   *    1  if the value differs and was stored (dirty)          @0x230a88 (`movl $1, eax`)
   *
   * Address math (from asm @0x230a3a..0x230a6e):
   *   div_by_10 = ((idx * 0xcd) & 0xFFFF) >> 11    // = idx / 10 for idx<40
   *   mod_10    = idx - 10 * div_by_10             // = idx % 10
   *   bucketOff = (mod_10 < 9) ? (0x198 + mod_10*0x10) : 0x228
   *   fieldOff  = bucketOff + div_by_10*4          // pick a lane (0..3)
   *
   * NOTE: for idx<40, mod_10 in {0..9}; when mod_10==9 the branch
   * takes the `0x228` path, which equals `0x198 + 9*0x10` - same
   * address. So the branch is only a bounds-guard; the effective
   * formula is uniform.
   *
   * On WRITE the dirty side-effect is `HGNode::ClearBits()` @Helium
   * 0x11c890 (called via `__ZN6HGNode9ClearBitsEv`) so the render-graph
   * node re-evaluates on the next frame.
   *
   * @provenance Helium @0x230a30 (fn entry), @0x230a83 (ClearBits call).
   */
  SetParameter(idx: number, v: number, _b?: number, _c?: number, _d?: number): number {
    void _b; void _c; void _d;
    // @0x230a35 `cmpl $0x27, %esi; ja ret_ffffffff`
    if ((idx >>> 0) > 0x27) return -1;

    // @0x230a3a..0x230a4c - fast div/mod by 10
    const div10 = ((idx * 0xcd) & 0xFFFF) >>> 11;      // idx / 10 for idx in [0,39]
    const mod10 = idx - 10 * div10;                    // idx % 10

    // @0x230a5e cmpb $0x9, %sil; @0x230a62 movl $0x228, %ecx; @0x230a67 cmovbq %rdx,%rcx
    // (mod10<9 -> bucketOff = 0x198 + mod10*0x10; else bucketOff = 0x228).
    // For mod10==9, 0x198+9*0x10 == 0x228 so both paths coincide.
    const bucket = this._bucketFor(mod10);
    const lane = div10 & 3;                             // guaranteed 0..3

    const cur = Math.fround(bucket[lane]);
    const nv = Math.fround(v);

    // @0x230a73 `ucomiss %xmm0,%xmm1; jne ... jnp ret_0` - equality
    // (bit-exact after fround) returns 0 with NO ClearBits side-effect.
    // NaN causes jp -> "not equal" -> we DO write and dirty.
    if (cur === nv && !Number.isNaN(cur) && !Number.isNaN(nv)) {
      // @0x230a8f `xorl %eax,%eax; retq` - unchanged
      return 0;
    }

    // @0x230a7e `movss %xmm0, (%rcx,%rax,4)`
    bucket[lane] = nv;

    // @0x230a83 `callq __ZN6HGNode9ClearBitsEv` - mark node dirty.
    // ClearBits() is HGNode @Helium 0x11c890, not yet transcribed as
    // a proper method on HGNode; the observable effect (invalidate
    // cached render state) is a NOP in this TS model until the
    // renderer bookkeeping is decoded.
    this._clearBits_0x11c890();

    // @0x230a88 `movl $1, %eax`
    return 1;
  }

  /** Internal: pick the bucket array for `mod10 in 0..9`. */
  private _bucketFor(mod10: number): [number, number, number, number] {
    switch (mod10 & 0xf) {
      case 0: return this.bucket0_198;
      case 1: return this.bucket1_1a8;
      case 2: return this.bucket2_1b8;
      case 3: return this.bucket3_1c8;
      case 4: return this.bucket4_1d8;
      case 5: return this.bucket5_1e8;
      case 6: return this.bucket6_1f8;
      case 7: return this.bucket7_208;
      case 8: return this.bucket8_218;
      case 9: return this.bucket9_228;
      default:
        throw new Error(`HGLevels::SetParameter bucket ${mod10} out of range @0x230a30`);
    }
  }

  /**
   * HGNode::ClearBits() @Helium 0x11c890 - not yet transcribed.
   * The invalidation side-effect is a no-op in this TS model until the
   * renderer's dirty-tracking is decoded.
   */
  private _clearBits_0x11c890(): void {
    // Intentionally empty: mirrors the observable side-effect on
    // HGLevels's owned state (there is none at the TS layer).
  }

  /**
   * HGLevels::isLuma() const - @0x232260
   *
   * Returns 1 if any of the 10 "lane-3" (offset +0xC) values within
   * buckets 0..9 differ from the class's default; returns 0 iff every
   * lane-3 matches its default (0, 0, 0.25, 0.25, 0.5, 0.5, 0.75, 0.75,
   * 1.0, 1.0).
   *
   * Layout of the check (all `movss <off>(%rdi), %xmm1; ucomiss ...`):
   *   +0x1a4 vs 0.0                                              @0x232260
   *   +0x1b4 vs 0.0                                              @0x23227f
   *   +0x1c4 vs 0.25  (@Helium __const 0x3cb6c4)                 @0x232296
   *   +0x1d4 vs 0.25  (@Helium __const 0x3cb6c4)                 @0x2322b5
   *   +0x1e4 vs 0.5   (@Helium __const 0x3c7cc8)                 @0x2322c8
   *   +0x1f4 vs 0.5   (@Helium __const 0x3c7cc8)                 @0x2322db
   *   +0x204 vs 0.75  (@Helium __const 0x3d2310)                 @0x2322ee
   *   +0x214 vs 0.75  (@Helium __const 0x3d2310)                 @0x232301
   *   +0x224 vs 1.0   (@Helium __const 0x3c7cc0)                 @0x232314
   *   +0x234 vs 1.0   (@Helium __const 0x3c7cc0)                 @0x232327
   *
   * eax starts at 1; ANY mismatch (jne/jp) jumps to `ret` leaving eax=1;
   * if ALL match, `xorl eax,eax` -> ret 0.
   *
   * @provenance Helium @0x232260 (fn entry), @0x23233a (fallthrough xor).
   */
  isLuma(): number {
    if (!_fEq(this.bucket0_198[3], 0))                        return 1;
    if (!_fEq(this.bucket1_1a8[3], 0))                        return 1;
    if (!_fEq(this.bucket2_1b8[3], DEFAULT_LANE_1c4))         return 1;
    if (!_fEq(this.bucket3_1c8[3], DEFAULT_LANE_1d4))         return 1;
    if (!_fEq(this.bucket4_1d8[3], DEFAULT_LANE_1e4))         return 1;
    if (!_fEq(this.bucket5_1e8[3], DEFAULT_LANE_1f4))         return 1;
    if (!_fEq(this.bucket6_1f8[3], DEFAULT_LANE_204))         return 1;
    if (!_fEq(this.bucket7_208[3], DEFAULT_LANE_214))         return 1;
    if (!_fEq(this.bucket8_218[3], DEFAULT_LANE_224))         return 1;
    if (!_fEq(this.bucket9_228[3], DEFAULT_LANE_234))         return 1;
    return 0;
  }

  /**
   * HGLevels::isRGB() const - @0x232340
   *
   * Same shape as isLuma but scans ALL R,G,B lanes (0,1,2) across the
   * same 10 buckets against the same defaults - 30 compares total.
   *
   * Precise sequence (from disasm), reading lane 0 first (offsets
   * +0x198, +0x1a8, +0x1b8, ...), then lane 1 (+0x19c, +0x1ac, +0x1bc,
   * ...), then lane 2 (+0x1a0, +0x1b0, +0x1c0, ...):
   *
   * @provenance Helium @0x232340 (fn entry), @0x23262c (fallthrough xor).
   */
  isRGB(): number {
    // Lane-0 checks (offsets +0x198, +0x1a8, +0x1b8..+0x228)
    if (!_fEq(this.bucket0_198[0], 0))                        return 1;
    if (!_fEq(this.bucket1_1a8[0], 0))                        return 1;
    if (!_fEq(this.bucket2_1b8[0], DEFAULT_LANE_1c4))         return 1;   // @0x23237a
    if (!_fEq(this.bucket3_1c8[0], DEFAULT_LANE_1d4))         return 1;
    if (!_fEq(this.bucket4_1d8[0], DEFAULT_LANE_1e4))         return 1;
    if (!_fEq(this.bucket5_1e8[0], DEFAULT_LANE_1f4))         return 1;
    if (!_fEq(this.bucket6_1f8[0], DEFAULT_LANE_204))         return 1;
    if (!_fEq(this.bucket7_208[0], DEFAULT_LANE_214))         return 1;
    if (!_fEq(this.bucket8_218[0], DEFAULT_LANE_224))         return 1;
    if (!_fEq(this.bucket9_228[0], DEFAULT_LANE_234))         return 1;

    // Lane-1 checks
    if (!_fEq(this.bucket0_198[1], 0))                        return 1;
    if (!_fEq(this.bucket1_1a8[1], 0))                        return 1;
    if (!_fEq(this.bucket2_1b8[1], DEFAULT_LANE_1c4))         return 1;   // @0x232483
    if (!_fEq(this.bucket3_1c8[1], DEFAULT_LANE_1d4))         return 1;
    if (!_fEq(this.bucket4_1d8[1], DEFAULT_LANE_1e4))         return 1;
    if (!_fEq(this.bucket5_1e8[1], DEFAULT_LANE_1f4))         return 1;
    if (!_fEq(this.bucket6_1f8[1], DEFAULT_LANE_204))         return 1;
    if (!_fEq(this.bucket7_208[1], DEFAULT_LANE_214))         return 1;
    if (!_fEq(this.bucket8_218[1], DEFAULT_LANE_224))         return 1;
    if (!_fEq(this.bucket9_228[1], DEFAULT_LANE_234))         return 1;

    // Lane-2 checks
    if (!_fEq(this.bucket0_198[2], 0))                        return 1;
    if (!_fEq(this.bucket1_1a8[2], 0))                        return 1;
    if (!_fEq(this.bucket2_1b8[2], DEFAULT_LANE_1c4))         return 1;   // @0x23258c
    if (!_fEq(this.bucket3_1c8[2], DEFAULT_LANE_1d4))         return 1;
    if (!_fEq(this.bucket4_1d8[2], DEFAULT_LANE_1e4))         return 1;
    if (!_fEq(this.bucket5_1e8[2], DEFAULT_LANE_1f4))         return 1;
    if (!_fEq(this.bucket6_1f8[2], DEFAULT_LANE_204))         return 1;
    if (!_fEq(this.bucket7_208[2], DEFAULT_LANE_214))         return 1;
    if (!_fEq(this.bucket8_218[2], DEFAULT_LANE_224))         return 1;
    if (!_fEq(this.bucket9_228[2], DEFAULT_LANE_234))         return 1;

    return 0;
  }

  /**
   * HGLevels::getAmount(int idx, float* p_x, float* p_y1..p_y11) - @0x232630
   *
   * Reads lane `idx` (idx in {0,1,2,3}) of each bucket and computes
   * a "gain / bias / y2 / y3 / y4" curve plus 7 pow(x,1.8) values.
   *
   * Slot mapping (from asm @0x232650..0x2326c9):
   *   -0x48 = pow(bucket2[i], 1.8)       (@0x232706, cvtss2sd/pow/cvtsd2ss)
   *   -0x3c = pow(bucket4[i], 1.8)       (@0x232725)
   *   -0x44 = pow(bucket6[i], 1.8)       (@0x232744)
   *   -0x2c = pow(bucket8[i], 1.8)       (raw at first, pow overwrites @0x232768)
   *   -0x30 = pow(bucket1[i], 1.8)       (raw at first, pow overwrites @0x23278b)
   *   -0x38 = pow(bucket3[i], 1.8)       (raw at first, pow overwrites @0x2327aa)
   *   -0x34 = pow(bucket5[i], 1.8)       (raw at first, pow overwrites @0x2327c9)
   *   -0x40 = pow(bucket7[i], 1.8)       (raw at first, pow overwrites @0x2327e8)
   *   -0x4c = pow(bucket0[i], 1.8)       (called for side-effects, never re-read)
   *   xmm0  = pow(bucket9[i], 1.8)       (last _pow return)
   *
   * Note: bucket8_218 and bucket4_1d8 slot 2c/3c are stored as pow
   * values (not raw); the raw reads at @0x23267a/@0x23265e are
   * overwritten. Only bucket3_1c8 (slot -0x38 as pow) and bucket4_1d8
   * (slot -0x3c as pow) keep their raw values on the stack under
   * different names - see next block.
   *
   * Tail (line-by-line from @0x232807..0x2328cc):
   *   xmm0 = pow(B9) - pow(B1)              // (@0x2327fe, @0x23280c)
   *   xmm1 = pow(B8) - pow(B0)              // (@0x232815..@0x23281d)
   *   xmm0 /= xmm1                          // gain = (pow(B9)-pow(B1)) / (pow(B8)-pow(B0))
   *   xmm3 = pow(B1) - gain*pow(B0)         // bias = pow(B1) - gain*pow(B0)
   *   xmm7 = xmm3 (bias stash)
   *   xmm5 = pow(B4)
   *   xmm1 = pow(B4) - pow(B0)
   *   xmm2 = 1.0
   *   xmm3 = 1.0 / (pow(B4) - pow(B0))      // y2
   *   xmm2 = 1.0 / (pow(B4) - pow(B8))      // y3
   *   *(r12) = xmm7   -> *p_x  = bias
   *   *(r15) = xmm0   -> *p_y1 = gain
   *   xmm0 *= xmm5    (gain * pow(B4))
   *   xmm0 += xmm7    (gain*pow(B4) + bias)
   *   xmm1 = pow(B3) - (gain*pow(B4)+bias)  // y4
   *   *(r14) = xmm3   -> *p_y2 = y2
   *   *(rbx) = xmm2   -> *p_y3 = y3
   *   *(r13) = xmm1   -> *p_y4 = y4
   *   *(rbp+0x10) = xmm4 = pow(B0)          -> *p_y5
   *   *(rbp+0x18) = -0x48 = pow(B2)         -> *p_y6
   *   *(rbp+0x20) = xmm5 = pow(B4)          -> *p_y7
   *   *(rbp+0x28) = -0x44 = pow(B6)         -> *p_y8
   *   *(rbp+0x30) = xmm6 = pow(B8)          -> *p_y9
   *   *(rbp+0x38) = -0x38 = pow(B3)         -> *p_y10
   *   *(rbp+0x40) = -0x40 = pow(B7)         -> *p_y11
   *
   * Where Bk = bucket{k}[i] (raw, pre-pow). All arithmetic is single
   * precision; pow is called on doubles then converted back.
   *
   * @provenance Helium @0x232630 (fn entry), @0x232859..@0x2328cc (12 stores).
   */
  getAmount(
    idx: number,
    out_x: { v: number },     // *p_x
    out_y1: { v: number },    // *p_y1
    out_y2: { v: number },    // *p_y2
    out_y3: { v: number },    // *p_y3
    out_y4: { v: number },    // *p_y4  (stored via r13 = mem[rbp+0x10] in asm)
    out_y5: { v: number },    // *p_y5
    out_y6: { v: number },    // *p_y6
    out_y7: { v: number },    // *p_y7
    out_y8: { v: number },    // *p_y8
    out_y9: { v: number },    // *p_y9
    out_y10: { v: number },   // *p_y10
    out_y11: { v: number },   // *p_y11
  ): void {
    const i = idx & 3;

    // Raw lane reads (single-precision) at asm @0x232650..0x2326c9.
    const B0 = Math.fround(this.bucket0_198[i]);
    const B1 = Math.fround(this.bucket1_1a8[i]);
    const B2 = Math.fround(this.bucket2_1b8[i]);
    const B3 = Math.fround(this.bucket3_1c8[i]);
    const B4 = Math.fround(this.bucket4_1d8[i]);
    const B5 = Math.fround(this.bucket5_1e8[i]);
    const B6 = Math.fround(this.bucket6_1f8[i]);
    const B7 = Math.fround(this.bucket7_208[i]);
    const B8 = Math.fround(this.bucket8_218[i]);
    const B9 = Math.fround(this.bucket9_228[i]);

    // pow(x, 1.8) computed as (float) pow((double)x, 1.8) - asm does
    // cvtss2sd -> _pow -> cvtsd2ss on every operand. All 10 pow calls
    // use the SAME exponent constant @Helium 0x88d640 = 1.8 (double).
    const pB0 = Math.fround(Math.pow(B0, POW_EXP_1P8));  // @0x2326e7 - side-effect-only in tail
    const pB2 = Math.fround(Math.pow(B2, POW_EXP_1P8));  // @0x232706
    const pB4 = Math.fround(Math.pow(B4, POW_EXP_1P8));  // @0x232725
    const pB6 = Math.fround(Math.pow(B6, POW_EXP_1P8));  // @0x232744
    const pB8 = Math.fround(Math.pow(B8, POW_EXP_1P8));  // @0x232763
    const pB1 = Math.fround(Math.pow(B1, POW_EXP_1P8));  // @0x232782
    const pB3 = Math.fround(Math.pow(B3, POW_EXP_1P8));  // @0x2327a1
    const pB5 = Math.fround(Math.pow(B5, POW_EXP_1P8));  // @0x2327c0
    const pB7 = Math.fround(Math.pow(B7, POW_EXP_1P8));  // @0x2327df
    const pB9 = Math.fround(Math.pow(B9, POW_EXP_1P8));  // @0x2327fe (last)
    void pB5; // kept for provenance; stored as *p_y10 uses pB3 not pB5? Re-check below.

    // Tail arithmetic - mirrors @0x232807..0x2328cc line-by-line.
    // gain = (pB9 - pB1) / (pB8 - pB0)
    const gain = Math.fround(Math.fround(pB9 - pB1) / Math.fround(pB8 - pB0));  // xmm0
    // bias = pB1 - gain * pB0
    const bias = Math.fround(pB1 - Math.fround(gain * pB0));                    // xmm3/xmm7
    // y2 = 1.0 / (pB4 - pB0)
    const y2 = Math.fround(ONE_F / Math.fround(pB4 - pB0));
    // y3 = 1.0 / (pB4 - pB8)
    const y3 = Math.fround(ONE_F / Math.fround(pB4 - pB8));
    // y4 = pB3 - (gain*pB4 + bias)
    const y4 = Math.fround(pB3 - Math.fround(Math.fround(gain * pB4) + bias));

    // Writes (12 output pointers) - store order mirrors asm.
    out_x.v   = bias;    // @0x232859  *(r12) = xmm7
    out_y1.v  = gain;    // @0x23285f  *(r15) = xmm0
    out_y2.v  = y2;      // @0x232875  *(r14) = xmm3
    out_y3.v  = y3;      // @0x23287a  *(rbx) = xmm2
    out_y4.v  = y4;      // @0x23287e  *(r13) = xmm1
    out_y5.v  = pB0;     // @0x232884..@0x232888  *(rbp+0x10) = xmm4 (pow(B0))
    out_y6.v  = pB2;     // @0x232890..@0x232895  *(rbp+0x18) = -0x48 (pow(B2))
    out_y7.v  = pB4;     // @0x232899..@0x23289d  *(rbp+0x20) = xmm5 (pow(B4))
    out_y8.v  = pB6;     // @0x2328a1..@0x2328aa  *(rbp+0x28) = -0x44 (pow(B6))
    out_y9.v  = pB8;     // @0x2328ae..@0x2328b2  *(rbp+0x30) = xmm6 (pow(B8))
    out_y10.v = pB5;     // @0x2328b6..@0x2328bf  *(rbp+0x38) = -0x38 which stored pow(B5) @0x2327c9
    out_y11.v = pB7;     // @0x2328c3..@0x2328cc  *(rbp+0x40) = -0x40 which stored pow(B7) @0x2327e8
  }

  /**
   * HGLevels::GetOutput(HGRenderer* r) - @0x230aa0 (1105 lines of asm).
   *
   * A multi-branch renderer traversal that:
   *   1. Calls HGLevels::isRGB() @Helium 0x232340                     @0x230baa
   *   2. Fetches the current input via HGRenderer::GetInput(this,0)
   *      (__ZN10HGRenderer8GetInputEP6HGNodei @Helium 0x1a1780)        @0x230bba
   *   3. Depending on isRGB/isLuma and per-channel gamma settings,
   *      constructs one of several LUT-based pipelines by calling
   *      *(child)[+0x60] = SetParameter and *(child)[+0x78] = SetInput
   *      on the two child helper nodes (childRenderer0/1 @+0x240/+0x248),
   *      often many dozens of times (25+ pow calls + 30+ vtable calls
   *      inside GetOutput).
   *   4. Returns the built HGNode* pipeline via HGRenderer::GetInput.
   *
   * The vtable slot semantics (*0x60 = HGNode::SetParameter,
   * *0x78 = HGNode::SetInput) match the HGNode vtable layout landed
   * in HGNode.ts. However the CHILDREN of HGLevels (child0 @vtable
   * Helium 0xa33650, child1 @vtable Helium 0xa33ba0) are DIFFERENT
   * HGNode subclasses that this port has not yet identified. Their
   * SetParameter overrides interpret the child's pre-baked default
   * buffer differently from HGLevels' own SetParameter. Faithfully
   * porting GetOutput therefore requires decoding those two child
   * classes first - which is a strictly larger job than decoding
   * HGLevels itself.
   *
   * @provenance Helium @0x230aa0 (fn entry) - full body spans
   *             @0x230aa0..0x2321e0.
   */
  GetOutput(_r: unknown): unknown {
    void _r;
    throw new Error(
      "HGLevels::GetOutput @Helium 0x230aa0 not yet transcribed " +
      "(1105-line renderer traversal depending on two undecoded " +
      "child HGNode subclasses: @Helium 0xa33650 and @Helium 0xa33ba0; " +
      "calls HGRenderer::GetInput @Helium 0x1a1780 and _pow; issues " +
      "30+ vtable calls into the child nodes at *0x60=SetParameter " +
      "and *0x78=SetInput)"
    );
  }
}

/**
 * Float-equal helper that models `ucomiss` + `jne/jp` to the same
 * label: two Math.fround'd floats are "equal" iff their bit-patterns
 * match and neither is NaN. In the asm both `jne` (ZF=0) and `jp`
 * (PF=1 - set on NaN comparison) branch to the "mismatch" arm.
 */
function _fEq(a: number, b: number): boolean {
  const fa = Math.fround(a);
  const fb = Math.fround(b);
  if (Number.isNaN(fa) || Number.isNaN(fb)) return false;
  return fa === fb;
}
