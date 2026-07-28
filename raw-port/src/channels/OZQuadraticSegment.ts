// OZQuadraticSegment.ts — raw port of Ozone.framework `OZQuadraticSegment::subdivide()`.
//
// Framework binary: /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
// x86_64 slice; disassembly saved at raw-port/re/disasm/OZQuadraticSegment.subdivide.s.
//
// Class-scope decode inventory (nm -arch x86_64 | c++filt on Ozone)
// -----------------------------------------------------------------
//   DEFINED here:
//     @0x004f0180  OZQuadraticSegment::subdivide(OZQuadraticSegment&, OZQuadraticSegment&)
//   Called-by (fixTriangleOverlaps — TU-local static helper in Ozone.framework):
//     @0x00309be0  fixTriangleOverlaps(OZQuadraticSegment&, OZQuadraticPath&, vector<OZQuadraticPath*>&, int)
//                  — allocates a fresh 32-byte segment (`operator new(0x20)`), zero-inits
//                    +0x04..+0x1b to zero, writes int32=1 at +0x00 and uint16=1 at +0x1c,
//                    then calls subdivide (@0x309dcd). That gives us the struct size (0x20)
//                    and the initial state of the two "sentinel" fields.
//
// Struct layout (recovered from the allocation site and every read/write in this file)
// -------------------------------------------------------------------------------------
//     offset  size   field
//     +0x00   4      _typeOrFlag : int32   // written to 1 at construction; not touched by subdivide.
//     +0x04   8      p0          : vec2f  = (x0, y0)   // two packed 32-bit floats
//     +0x0c   8      p1          : vec2f  = (x1, y1)
//     +0x14   8      p2          : vec2f  = (x2, y2)
//     +0x1c   2      _flags      : uint16                // written to 1 at construction
//     +0x1e   2      (padding to 0x20)
//   Total: 0x20 bytes. Reads in subdivide (movq / movsd / movddup) confirm the vec2f layout —
//   the accompanying fixTriangleOverlaps @0x309ce4..0x309d17 uses `movd %eax,xmm2 ; subss xmm2,xmm1`
//   which proves each 8-byte member is TWO 32-bit floats (i.e. vec2f, not one double).
//
// SSE constants (all four floats read from Ozone's __DATA_CONST rodata; verified with resolve.py)
// -----------------------------------------------------------------------------------------------
//   RIP-relative           file addr    16-byte packed value                            used at
//   0x22132c (@0x4f018d)   0x7114c0     [0.25, 0.25, 0.0,  0.0 ]                        movaps xmm1
//   0x216c5d (@0x4f019c)   0x706e00     [0.5,  0.5,  0.0,  0.0 ]                        movaps xmm3
//   0x221301 (@0x4f01c8)   0x7114d0     [0.0,  0.0,  0.5,  0.5 ]                        movaps xmm1 (second)
//
// Body of subdivide — line-by-line trace (see re/disasm/OZQuadraticSegment.subdivide.s)
// -------------------------------------------------------------------------------------
//   The single retq is at 0x4f0206; instructions from 0x4f0207 onward belong to another symbol.
//   Register roles: rdi = *this, rsi = &a (out), rdx = &b (out).
//   All arithmetic is single-precision packed on the LOW two lanes of each XMM (vec2f-wide).
//
//   0x4f0184  rax     = [rdi+0x04]              ; pack of p0 (=p0.x lo32, p0.y hi32)
//   0x4f0188  xmm0    = rax                     ; xmm0 = (p0.x, p0.y, 0, 0)
//   0x4f018d  xmm1    = C_2525 = (0.25,0.25,0,0)
//   0x4f0194  xmm0   *= xmm1                    ; xmm0 = (0.25·p0.x, 0.25·p0.y, 0, 0)
//   0x4f0197  xmm2    = movsd [rdi+0x14]        ; xmm2 = (p2.x, p2.y, 0, 0)
//   0x4f019c  xmm3    = C_5500 = (0.5, 0.5,0,0)
//   0x4f01a3  xmm2   *= xmm3                    ; xmm2 = (0.5·p2.x, 0.5·p2.y, 0, 0)
//   0x4f01a6  xmm2   += xmm0                    ; xmm2 = (0.5·p2.x + 0.25·p0.x, 0.5·p2.y + 0.25·p0.y, 0, 0)
//   0x4f01a9  xmm0    = movsd [rdi+0x0c]        ; xmm0 = (p1.x, p1.y, 0, 0)
//   0x4f01ae  [rsi+0x04] = rax                  ; a.p0 = (input) p0                              *
//   0x4f01b2  xmm4    = movddup [rdi+0x14]      ; xmm4 = (p2.x, p2.y, p2.x, p2.y)
//   0x4f01b7  xmm5    = movddup [rdi+0x04]      ; xmm5 = (p0.x, p0.y, p0.x, p0.y)
//   0x4f01bc  xmm5   += xmm4                    ; xmm5 = (p0.x+p2.x, p0.y+p2.y, p0.x+p2.x, p0.y+p2.y)
//   0x4f01bf  xmm0   *= xmm1                    ; xmm0 = (0.25·p1.x, 0.25·p1.y, 0, 0)
//   0x4f01c2  xmm0    = blendps 0xc, xmm5, xmm0 ; lanes 2,3 from xmm5
//                                                ; xmm0 = (0.25·p1.x, 0.25·p1.y, p0.x+p2.x, p0.y+p2.y)
//   0x4f01c8  xmm1    = C_0055 = (0, 0, 0.5, 0.5)
//   0x4f01cf  xmm2    = blendps 0xc, xmm1, xmm2 ; lanes 2,3 from xmm1
//                                                ; xmm2 = (..., ..., 0.5, 0.5)
//   0x4f01d5  xmm2   += xmm0
//                                                ; lo2 = 0.25·p0 + 0.25·p1 + 0.5·p2  (== curve midpoint)
//                                                ; hi2 = 0.5 + (p0+p2)   (never stored — see xmm5 rewrite below)
//   0x4f01d8  xmm5   *= xmm1                    ; xmm5 = (0, 0, 0.5·(p0.x+p2.x), 0.5·(p0.y+p2.y))
//   0x4f01db  xmm5    = blendps 0x3, xmm2, xmm5 ; lanes 0,1 from xmm2
//                                                ; xmm5 = (curve_mid.x, curve_mid.y, 0.5·(p0.x+p2.x), 0.5·(p0.y+p2.y))
//   0x4f01e1  [rsi+0x0c] = xmm5   (movups 16B)  ; a.p1 = curve_mid ; a.p2 = 0.5·(p0+p2)           *
//   0x4f01e5  [rdx+0x04] = xmm2_lo (movlps 8B)  ; b.p0 = curve_mid                                 *
//   0x4f01e9  xmm0     = movsd [rdi+0x0c]       ; xmm0 = (p1.x, p1.y, 0, 0)
//   0x4f01ee  xmm1     = movsd [rdi+0x14]       ; xmm1 = (p2.x, p2.y, 0, 0)
//   0x4f01f3  xmm1    += xmm0                   ; xmm1 = (p1.x+p2.x, p1.y+p2.y, 0, 0)
//   0x4f01f6  xmm1    *= xmm3                   ; xmm3 unchanged = (0.5,0.5,0,0)
//                                                ; xmm1 = (0.5·(p1.x+p2.x), 0.5·(p1.y+p2.y), 0, 0)
//   0x4f01f9  [rdx+0x14] = xmm1_lo (movlps 8B)  ; b.p2 = 0.5·(p1+p2)                              *
//   0x4f01fd  rax      = [rdi+0x0c]             ; pack of p1
//   0x4f0201  [rdx+0x0c] = rax                  ; b.p1 = (input) p1                               *
//   0x4f0205  pop rbp
//   0x4f0206  retq
//
// Fields NOT touched by subdivide: +0x00 (_typeOrFlag) and +0x1c (_flags). Both outputs inherit
// whatever those slots contained on entry; subdivide neither reads nor writes them.
//
// Semantic gist (documented, not editorialised)
// ---------------------------------------------
// Writing the six output points in one compact form:
//     M  := 0.25·p0 + 0.25·p1 + 0.5·p2            // "curve midpoint" (per this codepath)
//     a = { p0 = p0 , p1 = M , p2 = 0.5·(p0+p2) }
//     b = { p0 = M  , p1 = p1, p2 = 0.5·(p1+p2) }
// M is the shared midpoint (== a.p1 == b.p0). This is what the disassembly does. The port below
// mirrors it operation-for-operation — not a De Casteljau construction and not "cleaned up".

// -- Struct type. Field byte offsets documented at every declaration (P2 grounding) --
export interface OZQuadraticSegment {
  _typeOrFlag: number;  // int32   @+0x00 — initialized to 1 by callers; untouched by subdivide.
  p0x: number;          // float32 @+0x04
  p0y: number;          // float32 @+0x08
  p1x: number;          // float32 @+0x0c
  p1y: number;          // float32 @+0x10
  p2x: number;          // float32 @+0x14
  p2y: number;          // float32 @+0x18
  _flags: number;       // uint16  @+0x1c — initialized to 1 by callers; untouched by subdivide.
}

// SSE constants, transcribed from Ozone.framework's rodata (see header). Kept as `fround`
// applied to their literal double values so the port matches x86 single-precision throughout
// (rule 4 of the porting spec).
const F025 = Math.fround(0.25);   // @0x7114c0 lanes 0,1
const F05  = Math.fround(0.5);    // @0x706e00 lanes 0,1 ; @0x7114d0 lanes 2,3

/**
 * OZQuadraticSegment::subdivide(OZQuadraticSegment& a, OZQuadraticSegment& b)   @Ozone 0x4f0180
 *
 * Faithful transcription of the SSE routine above. Each output field is computed with
 * `Math.fround` at every intermediate step so the arithmetic matches the machine's f32 ops
 * bit-for-bit (per porting-spec rule 4).
 *
 * `this` (the input) is not mutated. `a` and `b` are treated as OUT parameters; only the
 * six point components are written. `_typeOrFlag` (+0x00) and `_flags` (+0x1c) are NOT
 * touched by this routine (verified from disasm), so the caller is responsible for those.
 */
export function OZQuadraticSegment_subdivide(
  self: OZQuadraticSegment,
  a: OZQuadraticSegment,
  b: OZQuadraticSegment,
): void {
  // --- Read inputs (each field is one f32 lane; the machine does packed loads, but the
  //     per-lane arithmetic is what we ultimately mirror). ------------------------------------
  const p0x = self.p0x, p0y = self.p0y;   // @+0x04, +0x08
  const p1x = self.p1x, p1y = self.p1y;   // @+0x0c, +0x10
  const p2x = self.p2x, p2y = self.p2y;   // @+0x14, +0x18

  // --- Compute M = 0.25·p0 + 0.25·p1 + 0.5·p2  (== a.p1 == b.p0) ---------------------------
  // Matches the SSE staging:
  //   step 1 (@0x4f0194)  0.25·p0
  //   step 2 (@0x4f01a3)  0.5·p2
  //   step 3 (@0x4f01a6)  add                                => 0.25·p0 + 0.5·p2
  //   step 4 (@0x4f01bf)  0.25·p1
  //   step 5 (@0x4f01d5)  add                                => 0.25·p0 + 0.5·p2 + 0.25·p1
  const ax_p0x_025 = Math.fround(F025 * p0x);           // @0x4f0194 lane0
  const ax_p0y_025 = Math.fround(F025 * p0y);           // @0x4f0194 lane1
  const ax_p2x_05  = Math.fround(F05  * p2x);           // @0x4f01a3 lane0
  const ax_p2y_05  = Math.fround(F05  * p2y);           // @0x4f01a3 lane1
  const ax_sum1x   = Math.fround(ax_p2x_05 + ax_p0x_025); // @0x4f01a6
  const ax_sum1y   = Math.fround(ax_p2y_05 + ax_p0y_025);
  const ax_p1x_025 = Math.fround(F025 * p1x);           // @0x4f01bf lane0
  const ax_p1y_025 = Math.fround(F025 * p1y);           // @0x4f01bf lane1
  const Mx = Math.fround(ax_sum1x + ax_p1x_025);         // @0x4f01d5 lane0 == curve midpoint x
  const My = Math.fround(ax_sum1y + ax_p1y_025);         // @0x4f01d5 lane1 == curve midpoint y

  // --- Compute 0.5·(p0 + p2) (== a.p2) -----------------------------------------------------
  // SSE:  xmm5 = movddup(p0)+movddup(p2) ; xmm5.hi = xmm5 * (0,0,0.5,0.5). Only the high
  // lanes reach `a.p2` via the 16-byte movups at 0x4f01e1. Bit-exactly:
  //   a.p2 = 0.5 * (p0 + p2)     with the addition happening BEFORE the multiply (@0x4f01bc → @0x4f01d8).
  const p0p2_x = Math.fround(p0x + p2x);                 // @0x4f01bc lane0/lane2 (identical)
  const p0p2_y = Math.fround(p0y + p2y);                 // @0x4f01bc lane1/lane3
  const half_p0p2_x = Math.fround(F05 * p0p2_x);         // @0x4f01d8 lane2
  const half_p0p2_y = Math.fround(F05 * p0p2_y);         // @0x4f01d8 lane3

  // --- Compute 0.5·(p1 + p2) (== b.p2) -----------------------------------------------------
  // SSE:  xmm1 = movsd(p1) ; xmm0 = movsd(p2) ; xmm1 += xmm0 ; xmm1 *= (0.5,0.5,0,0).
  //   b.p2 = 0.5 * (p1 + p2)     add-then-multiply order (@0x4f01f3 → @0x4f01f6).
  const p1p2_x = Math.fround(p1x + p2x);                 // @0x4f01f3 lane0
  const p1p2_y = Math.fround(p1y + p2y);                 // @0x4f01f3 lane1
  const half_p1p2_x = Math.fround(F05 * p1p2_x);         // @0x4f01f6 lane0
  const half_p1p2_y = Math.fround(F05 * p1p2_y);         // @0x4f01f6 lane1

  // --- Write outputs --- (store addresses and widths match the machine writes) --------------
  // @0x4f01ae  a.p0 = input p0   (8-byte copy)
  a.p0x = p0x;                a.p0y = p0y;
  // @0x4f01e1  a.p1 = M ; a.p2 = 0.5·(p0+p2)   (16-byte movups)
  a.p1x = Mx;                 a.p1y = My;
  a.p2x = half_p0p2_x;        a.p2y = half_p0p2_y;
  // @0x4f01e5  b.p0 = M                        (8-byte movlps)
  b.p0x = Mx;                 b.p0y = My;
  // @0x4f0201  b.p1 = input p1                 (8-byte movq)
  b.p1x = p1x;                b.p1y = p1y;
  // @0x4f01f9  b.p2 = 0.5·(p1+p2)              (8-byte movlps)
  b.p2x = half_p1p2_x;        b.p2y = half_p1p2_y;
}
