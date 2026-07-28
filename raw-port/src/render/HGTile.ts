// HGTile.ts — Helium's HGTile (the axis-aligned tile primitive used by the
// Helium renderer's tile-scanning pipeline). Exposed as three const-qualified
// getters — Width(), Height(), and Position() — all decoded here.
//
// Verbatim from FCP's Ozone framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
// (The class is HELIUM's HGTile but is used in Ozone; only Ozone's build re-emits
//  the getters — Helium.framework does not export them separately in FCP's binary.)
//
// Source disassembly (in this worktree's raw-port/re/disasm/):
//   HGTile.Width.s      IS ICF-FOLDED with HGRect::w() @Ozone 0x688500 —
//                       identical 4-instruction body at the shared address.
//                       Body recovered from /tmp/Ozone_tV.txt at that address
//                       and inlined below.
//   HGTile.Height.s     @0x688520..0x688534
//   HGTile.Position.s   @0x690cc0..0x690d1a
//
// THREE EXPORTED SYMBOLS (only members of the class):
//   @Ozone 0x0000000000688500  HGTile::Width() const     (ICF-folded with HGRect::w() const)
//   @Ozone 0x0000000000688520  HGTile::Height() const
//   @Ozone 0x0000000000690cc0  HGTile::Position() const
// No ctor, dtor, or copy-op is exported: HGTile is a PLAIN-OLD-DATA aggregate
// constructed inline by its owner (e.g. HgcStraight::RenderTile, HgcWrapRepeat::
// RenderTile — see /tmp/Ozone_symmap.tsv for the many `HgcXxx::RenderTile(HGTile*)`
// entry points that consume it).
//
// ── STRUCT LAYOUT ────────────────────────────────────────────────────────────
// From Width() / Height() bodies:
//   Width  = *(int32_t*)(this+0x8) - *(int32_t*)(this+0x0)      ; right-left
//   Height = *(int32_t*)(this+0xc) - *(int32_t*)(this+0x4)      ; bottom-top
// From Position()'s `movaps (%rax), %xmm0` + `cvtdq2ps`:
//   the FIRST 16 bytes at (this+0x0) are FOUR int32s treated as a v4int32
//   loaded/converted with the same cvtdq2ps that a v4i32→v4f32 conversion uses.
// So the leading 16 bytes are the SAME layout as HGRect (int32 corner-form,
// see raw-port/src/render/HGRect.ts):
//
//   offset  size  field                    comments
//   ------  ----  -----------------------  --------------------------------------------------
//   +0x00   0x04  left   : int32           first int32 subtracted in Width() @0x68852f
//                                           (via subl (%rcx),%eax; ICF-folded body).
//   +0x04   0x04  top    : int32           first int32 subtracted in Height() @0x68852f
//                                           (subl 0x4(%rcx),%eax).
//   +0x08   0x04  right  : int32           minuend in Width()  (movl 0x8(%rcx),%eax  when
//                                           folded to HGRect::w — for HGTile the same 4-instr
//                                           body applies).
//   +0x0c   0x04  bottom : int32           minuend in Height() (movl 0xc(%rcx),%eax).
//
// The Width/Height bodies do NOT read past offset 0xf; Position() likewise only
// reads (this+0). The total sizeof from just these three getters is therefore
// unknowable — HGTile MAY carry more fields past +0xf (tile index, sample buffer
// pointer, etc.) that the CONSUMERS (HgcStraight::RenderTile etc.) read. We
// keep the layout budget at "≥ 16 bytes"; anything beyond +0xf is deferred to
// its own port.
//
// ── ICF NOTE ────────────────────────────────────────────────────────────────
// The linker (ld64) collapsed HGTile::Width() with HGRect::w() because they
// have byte-identical bodies. `nm -arch x86_64` lists them at the SAME address
// (0x688500). This is FAITHFUL — the shipped binary really has one function
// serving both symbols. In TS we implement Width() directly (following the
// asm) and note the folding provenance.
//
// ── POSITION() — SUBPIXEL CENTER + HOMOGENEOUS COORD ─────────────────────────
// Position() @0x690cc0 loads the 4 int32 tile corners, converts to float32, then
// multiplies by [1,1,0,0] and adds [0.5,0.5,0,1]:
//
//   xmm0  = (int32x4)*(this)                          // {left, top, right, bottom}
//   xmm0  = cvtdq2ps(xmm0)                             // 4 floats
//   xmm1  = [1.0f, 1.0f, 0.0f, 0.0f]                   // @Ozone __TEXT const 0x70afe0
//   xmm1  = mulps(xmm0, xmm1)                          // {L, T, 0, 0}
//   xmm0  = [0.5f, 0.5f, 0.0f, 1.0f]                   // @Ozone __TEXT const 0x714420
//   xmm0  = addps(xmm1, xmm0)                          // {L+0.5, T+0.5, 0.0, 1.0}
//   return xmm0
//
// This is a HOMOGENEOUS 2D POSITION at the tile's TOP-LEFT PIXEL CENTER
// (subpixel offset of 0.5 in both axes, z=0, w=1). The mask lane pattern
// `[1,1,0,0]` in the multiplier is what zeros out the `right`/`bottom` corner
// lanes — Position() by definition returns the tile ORIGIN, never its extent.
//
// Const provenance (each verified by direct byte read of the x86_64 slice):
//   @Ozone 0x70afe0  packed 4x f32 = { 0x3f800000, 0x3f800000, 0x00000000, 0x00000000 }
//                                  = { 1.0f, 1.0f, 0.0f, 0.0f }
//   @Ozone 0x714420  packed 4x f32 = { 0x3f000000, 0x3f000000, 0x00000000, 0x3f800000 }
//                                  = { 0.5f, 0.5f, 0.0f, 1.0f }

import type { HGRect } from "./HGRect";

// Single-precision helper matching x86 SSE semantics (movaps + cvtdq2ps + mulps + addps
// all operate on IEEE-754 binary32 lanes with round-to-nearest-even). Math.fround gives
// exact single-precision rounding after every arithmetic step.
const f32 = Math.fround;

// The two RIP-relative packed constants, transcribed verbatim from the binary.
// Each is a 4-lane float32 vector; we hold them as fixed tuples with Math.fround'd
// components (a no-op for these exact-representable IEEE-754 values, but preserved for
// symmetry with the arithmetic path).
const POSITION_MUL_MASK: readonly [number, number, number, number] = [
  f32(1.0),
  f32(1.0),
  f32(0.0),
  f32(0.0),
];
const POSITION_ADD_OFFSET: readonly [number, number, number, number] = [
  f32(0.5),
  f32(0.5),
  f32(0.0),
  f32(1.0),
];

/**
 * HGTile — 16-byte (or larger) aggregate whose first 16 bytes are laid out
 * identically to HGRect (int32 {left, top, right, bottom} corner form). All
 * three exported const getters are decoded here.
 *
 * The class has NO exported ctor/dtor — it is constructed by direct field
 * writes from its owners. We expose the layout as public fields for the same
 * reason: the class shape is decoded, the ownership pattern is not.
 */
export class HGTile {
  /** @+0x00  left   : int32.  First int32 subtracted in Width() (@0x68852f). */
  left: number = 0 | 0;

  /** @+0x04  top    : int32.  First int32 subtracted in Height() (@0x68852f). */
  top: number = 0 | 0;

  /** @+0x08  right  : int32 (exclusive corner). Minuend in Width(). */
  right: number = 0 | 0;

  /** @+0x0c  bottom : int32 (exclusive corner). Minuend in Height(). */
  bottom: number = 0 | 0;

  /**
   * HGTile::Width() const — returns the tile's pixel width as an int32.
   *   @Ozone 0x0000000000688500..0x0000000000688513  (ICF-folded with HGRect::w() const)
   *
   * Disassembly (shared body — same 4 code instructions serve both symbols):
   *   0x688500  pushq %rbp
   *   0x688501  movq  %rsp, %rbp
   *   0x688504  movq  %rdi, -0x8(%rbp)           ; spill this
   *   0x688508  movq  -0x8(%rbp), %rcx           ; rcx = this
   *   0x68850c  movl  0x8(%rcx), %eax            ; eax = right (int32)
   *   0x68850f  subl  (%rcx), %eax               ; eax -= left  (int32)
   *   0x688511  popq  %rbp
   *   0x688512  retq
   *   0x688513  nopw  %cs:(%rax,%rax)            ; alignment padding
   *
   * The `subl` result is an int32 (unsigned wraparound = 32-bit two's-complement
   * subtraction). We match with `| 0` to truncate to int32 semantics.
   */
  Width(): number {
    // 0x68850c → 0x68850f: right - left as int32.
    return (this.right - this.left) | 0;
  }

  /**
   * HGTile::Height() const — returns the tile's pixel height as an int32.
   *   @Ozone 0x0000000000688520..0x0000000000688534
   *
   * Disassembly:
   *   0x688520  pushq %rbp
   *   0x688521  movq  %rsp, %rbp
   *   0x688524  movq  %rdi, -0x8(%rbp)           ; spill this
   *   0x688528  movq  -0x8(%rbp), %rcx           ; rcx = this
   *   0x68852c  movl  0xc(%rcx), %eax            ; eax = bottom (int32)
   *   0x68852f  subl  0x4(%rcx), %eax            ; eax -= top    (int32)
   *   0x688532  popq  %rbp
   *   0x688533  retq
   *   0x688534  nopw  %cs:(%rax,%rax)            ; alignment padding
   */
  Height(): number {
    // 0x68852c → 0x68852f: bottom - top as int32.
    return (this.bottom - this.top) | 0;
  }

  /**
   * HGTile::Position() const — returns the tile's top-left ORIGIN as a
   * homogeneous float4 with a half-pixel subpixel center offset.
   *   @Ozone 0x0000000000690cc0..0x0000000000690d1a
   *
   * Disassembly (stack-slot spills elided in commentary — semantically it's
   * just `xmm0 = mask*cvtdq2ps(load(this)) + offset`):
   *   0x690cc0  pushq %rbp / movq %rsp,%rbp
   *   0x690cc4  movq  %rdi, -0x58(%rbp)             ; spill this
   *   0x690cc8  movq  -0x58(%rbp), %rax             ; rax = this
   *   0x690ccc  movaps 0x7a30d(%rip), %xmm0          ; xmm0 = [1.0, 1.0, 0.0, 0.0]
   *                                                  ;  RIP=0x690cd3; target=0x70afe0
   *   0x690cd3  movaps %xmm0, -0x70(%rbp)            ; spill mask
   *   0x690cd7  movaps -0x70(%rbp), %xmm1            ; reload mask into xmm1
   *   0x690cdb  movaps (%rax), %xmm0                 ; xmm0 = *(v4i32*)this
   *                                                  ;    = {left, top, right, bottom}
   *   0x690cde  movaps %xmm0, -0x10(%rbp)            ; spill v4i32
   *   0x690ce2  cvtdq2ps -0x10(%rbp), %xmm0          ; xmm0 = v4f32(v4i32)
   *   0x690ce6  movaps %xmm1, -0x40(%rbp)            ; spill mask
   *   0x690cea  movaps %xmm0, -0x50(%rbp)            ; spill v4f32
   *   0x690cee  movaps -0x40(%rbp), %xmm1            ; reload mask
   *   0x690cf2  movaps -0x50(%rbp), %xmm0            ; reload v4f32
   *   0x690cf6  mulps  %xmm0, %xmm1                  ; xmm1 = v4f32 * mask
   *                                                  ;    = {L*1, T*1, R*0, B*0}
   *                                                  ;    = {L, T, 0, 0}
   *   0x690cf9  movaps 0x83720(%rip), %xmm0          ; xmm0 = [0.5, 0.5, 0.0, 1.0]
   *                                                  ;  RIP=0x690d00; target=0x714420
   *   0x690d00  movaps %xmm0, -0x80(%rbp)            ; spill offset
   *   0x690d04  movaps -0x80(%rbp), %xmm0            ; reload offset
   *   0x690d08  movaps %xmm1, -0x20(%rbp)            ; spill (L,T,0,0)
   *   0x690d0c  movaps %xmm0, -0x30(%rbp)            ; spill offset
   *   0x690d10  movaps -0x20(%rbp), %xmm0            ; xmm0 = (L,T,0,0)
   *   0x690d14  addps  -0x30(%rbp), %xmm0            ; xmm0 = (L+0.5, T+0.5, 0.0, 1.0)
   *   0x690d18  popq  %rbp / retq
   *
   * The spills are compiler artefacts (this looks like a -O0 or -O1 build slice
   * with debug spill code); semantically the whole thing is:
   *
   *   return (float4)(int4){left, top, right, bottom}
   *        * float4{1, 1, 0, 0}
   *        + float4{0.5, 0.5, 0, 1}
   *
   * i.e. `{ left+0.5, top+0.5, 0.0, 1.0 }` — the tile's TOP-LEFT PIXEL CENTER in
   * homogeneous 2D coordinates (z=0, w=1).
   *
   * The int→float conversion (cvtdq2ps) is signed-32-bit-to-single-precision;
   * for typical tile coordinates well within 2^24 the conversion is exact, and
   * Math.fround captures the exact-representable half-integer additions
   * losslessly.
   */
  Position(): readonly [number, number, number, number] {
    // 0x690cdb → 0x690ce2: cvtdq2ps of {left, top, right, bottom}.
    const l = f32(this.left | 0);
    const t = f32(this.top | 0);
    const r = f32(this.right | 0);
    const b = f32(this.bottom | 0);

    // 0x690cf6: mulps against POSITION_MUL_MASK (@Ozone 0x70afe0) = [1,1,0,0].
    const mx = f32(l * POSITION_MUL_MASK[0]); // = l
    const my = f32(t * POSITION_MUL_MASK[1]); // = t
    const mz = f32(r * POSITION_MUL_MASK[2]); // = 0
    const mw = f32(b * POSITION_MUL_MASK[3]); // = 0

    // 0x690d14: addps against POSITION_ADD_OFFSET (@Ozone 0x714420) = [0.5,0.5,0,1].
    const px = f32(mx + POSITION_ADD_OFFSET[0]); // = l + 0.5
    const py = f32(my + POSITION_ADD_OFFSET[1]); // = t + 0.5
    const pz = f32(mz + POSITION_ADD_OFFSET[2]); // = 0
    const pw = f32(mw + POSITION_ADD_OFFSET[3]); // = 1

    return [px, py, pz, pw] as const;
  }

  /**
   * Type-level marker: HGTile's leading 16 bytes ARE structurally an HGRect
   * (see STRUCT LAYOUT above; both use int32 {left, top, right, bottom} corner
   * form). Provided as a helper so callers that only want the rectangle view
   * of the tile can obtain it without paying for a copy.
   */
  asHGRect(): HGRect {
    return { x: this.left | 0, y: this.top | 0, right: this.right | 0, bottom: this.bottom | 0 };
  }
}
