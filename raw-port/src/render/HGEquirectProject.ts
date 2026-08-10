// HGEquirectProject.ts — Helium `HGEquirectProject`: an equirectangular
// projection render node. Only one method is transcribed here so far:
// `setParams`, which copies an `HGEquirectProjectParams` record into the
// node and (unless a "params locked" byte is set) derives a block of
// projection transform coefficients from the incoming width/height/pan
// integers.
//
// Faithful transcription of the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium.
//
// Source disassembly (in this worktree):
//   raw-port/re/disasm/Helium.__ZN17HGEquirectProject9setParamsERK23HGEquirectProjectParams.s
//
// Helium symbol transcribed:
//   @0x001c0820  HGEquirectProject::setParams(HGEquirectProjectParams const&)
//                — __ZN17HGEquirectProject9setParamsERK23HGEquirectProjectParams
//
// STRUCT LAYOUT (recovered from setParams' store/load offsets — see
//   raw-port/re/HGEquirectProject_LAYOUT.md for the full table):
//
//   HGEquirectProject (only the region touched by setParams is modeled):
//     +0x198  HGEquirectProjectParams params   (0x9c bytes; memcpy target
//                                                @0x1c0829/@0x1c0835)
//       within params (params_base = +0x198):
//         +0x1e0 (=params+0x48)  i32  srcWidth        [load @0x1c0860]
//         +0x1e4 (=params+0x4c)  i32  srcHeight       [load @0x1c0866]
//         +0x1e8 (=params+0x50)  i32  panX            [load @0x1c08c3 sub]
//         +0x1ec (=params+0x54)  i32  panY            [load @0x1c08f8 sub]
//         +0x1f0 (=params+0x58)  u8   paramsLocked    [cmpb  @0x1c083a]
//     --- derived projection transform coefficients (written only when
//         paramsLocked == 0) ---
//         +0x1f4  f32  xformA_scaleX   = 1.0        [movlps @0x1c08b0 lo]
//         +0x1f8  f32  xformA_scaleY   = 6.0        [movlps @0x1c08b0 hi]
//         +0x1fc  u32  xformA_pad      = 0          [movl   @0x1c08b7]
//         +0x200  f32  xformA_transX   = -panX*0.5  [movss  @0x1c08de]
//         +0x204  f32  xformA_r0       = 0.0        [movsd  @0x1c08e6 lo]
//         +0x208  f32  xformA_r1       = 1.0        [movsd  @0x1c08e6 hi]
//         +0x20c  u32  xformA_pad2     = 0          [movl   @0x1c08ee]
//         +0x210  f32  xformA_transY   = -panY*0.5  [movss  @0x1c0909]
//         +0x214  f32  xformB_scaleX   = 1.0        [movlps @0x1c084f lo]
//         +0x218  f32  xformB_scaleY   = 6.0        [movlps @0x1c084f hi]
//         +0x21c  u32  xformB_pad      = 0          [movl   @0x1c0856]
//         +0x220  f32  xformB_halfW    = srcWidth/2 [movss  @0x1c0879]
//         +0x224  f32  xformB_r0       = 0.0        [movsd  @0x1c0896 lo]
//         +0x228  f32  xformB_r1       = 1.0        [movsd  @0x1c0896 hi]
//         +0x22c  u32  xformB_pad2     = 0          [movl   @0x1c089e]
//         +0x230  f32  xformB_halfH    = srcHeight/2[movss  @0x1c08a8]
//
//   Field *semantic* names are inferred (the two 8-byte {scaleX,scaleY}
//   pairs, the two center offsets, the two half-dimensions) but the raw
//   offsets + observed constants are what is authoritative. Names use the
//   `xformA_`/`xformB_` grouping the two movlps/movsd 8-byte writes imply.
//
// Constants (RIP-relative literal loads; raw bytes verified on the x86_64
//   slice at file-offset slice_base(0x4000)+VA):
//   @0x1c0847  movss  0x207471(%rip),%xmm0  -> 0x3c7cc0 : 00 00 80 3f 00 00 c0 40
//              = {1.0f, 6.0f}  (movlps writes the low 8 bytes = this pair)
//   @0x1c0881  movsd  0x207427(%rip),%xmm1  -> 0x3c7cb0 : 00 00 00 00 00 00 80 3f
//              = {0.0f, 1.0f}  (movsd writes 8 bytes = this pair)
//   @0x1c08d2  movss  0x2073ee(%rip),%xmm2  -> 0x3c7cc8 : 00 00 00 3f
//              = 0.5f          (the center-offset scale factor)
//
// Called stubs / data:
//   @0x1c0835  callq _memcpy   (Helium stub 0x3c5438) — TRUE out-of-scope
//              extern (libc); modeled as a field-by-field copy of the
//              0x9c-byte params record.
//
// Frontier callees (not-yet-transcribed): NONE (the only call is libc memcpy).

// ---------------------------------------------------------------------------
// HGEquirectProjectParams — the 0x9c-byte plain-data record copied in by
// setParams. Only the five fields setParams reads are modeled with decoded
// names; the remainder of the 0x9c bytes is preserved opaquely so the copy
// is faithful (setParams memcpy's the WHOLE record, then reads five fields).
// A full field-by-field decode of the params record is a separate unit
// (its producer/ctor is not yet ported).
// ---------------------------------------------------------------------------
export interface HGEquirectProjectParams {
  /** @+0x48 within params — i32 source width  (read @0x1c0860). */
  srcWidth: number;
  /** @+0x4c within params — i32 source height (read @0x1c0866). */
  srcHeight: number;
  /** @+0x50 within params — i32 pan X         (read @0x1c08c3). */
  panX: number;
  /** @+0x54 within params — i32 pan Y         (read @0x1c08f8). */
  panY: number;
  /** @+0x58 within params — u8 "params locked" flag (read @0x1c083a).
   *  When nonzero, setParams copies the record and returns WITHOUT
   *  recomputing the projection transform. */
  paramsLocked: number;
}

/**
 * `HGEquirectProject` — equirectangular projection node. Only the
 * `params` sub-record (+0x198) and the derived transform block
 * (+0x1f4..+0x233) are modeled here; the rest of the object (vtable,
 * base HGNode fields) is filled in when other methods are ported.
 */
export class HGEquirectProject {
  /** @+0x198 — the copied-in params record. */
  params: HGEquirectProjectParams = {
    srcWidth: 0,
    srcHeight: 0,
    panX: 0,
    panY: 0,
    paramsLocked: 0,
  };

  // --- derived projection transform coefficients (see layout table) ---
  /** @+0x1f4 f32 */ xformA_scaleX = 0;
  /** @+0x1f8 f32 */ xformA_scaleY = 0;
  /** @+0x1fc u32 */ xformA_pad = 0;
  /** @+0x200 f32 */ xformA_transX = 0;
  /** @+0x204 f32 */ xformA_r0 = 0;
  /** @+0x208 f32 */ xformA_r1 = 0;
  /** @+0x20c u32 */ xformA_pad2 = 0;
  /** @+0x210 f32 */ xformA_transY = 0;
  /** @+0x214 f32 */ xformB_scaleX = 0;
  /** @+0x218 f32 */ xformB_scaleY = 0;
  /** @+0x21c u32 */ xformB_pad = 0;
  /** @+0x220 f32 */ xformB_halfW = 0;
  /** @+0x224 f32 */ xformB_r0 = 0;
  /** @+0x228 f32 */ xformB_r1 = 0;
  /** @+0x22c u32 */ xformB_pad2 = 0;
  /** @+0x230 f32 */ xformB_halfH = 0;

  /**
   * `HGEquirectProject::setParams(HGEquirectProjectParams const&)`
   *   — @Helium 0x1c0820
   *   — __ZN17HGEquirectProject9setParamsERK23HGEquirectProjectParams
   *
   * Copies the incoming params record into `this+0x198` and, unless the
   * `paramsLocked` byte (+0x1f0) is set, derives the equirectangular
   * projection transform coefficients from the source dimensions and pan.
   *
   * Verbatim decode (rbx = this):
   *
   *   0x1c0829  addq  $0x198,%rdi              ; dst = this+0x198
   *   0x1c0830  movl  $0x9c,%edx               ; n = 0x9c
   *   0x1c0835  callq _memcpy                  ; copy params record
   *   0x1c083a  cmpb  $0x0, 0x1f0(%rbx)        ; paramsLocked ?
   *   0x1c0841  jne   0x1c0911                 ; locked -> return
   *   0x1c0847  movss 0x3c7cc0(%rip),%xmm0     ; xmm0.lo = {1.0f, 6.0f}
   *   0x1c084f  movlps %xmm0, 0x214(%rbx)      ; xformB_scaleX=1.0, xformB_scaleY=6.0
   *   0x1c0856  movl  $0x0, 0x21c(%rbx)        ; xformB_pad = 0
   *   0x1c0860  movl  0x1e0(%rbx),%eax         ; eax = srcWidth
   *   0x1c0866  movl  0x1e4(%rbx),%ecx         ; ecx = srcHeight
   *   0x1c086c  movl  %eax,%edx                ; edx = srcWidth
   *   0x1c086e  shrl  $0x1f,%edx               ; edx = sign bit
   *   0x1c0871  addl  %eax,%edx                ; edx = srcWidth + sign
   *   0x1c0873  sarl  %edx                     ; edx = srcWidth / 2 (round-to-zero)
   *   0x1c0875  cvtsi2ss %edx,%xmm1            ; xmm1 = (float)(srcWidth/2)
   *   0x1c0879  movss %xmm1, 0x220(%rbx)       ; xformB_halfW = srcWidth/2
   *   0x1c0881  movsd 0x3c7cb0(%rip),%xmm1     ; xmm1 = {0.0f, 1.0f}
   *   0x1c0889  movl  %ecx,%eax                ; eax = srcHeight
   *   0x1c088b  shrl  $0x1f,%eax               ; sign
   *   0x1c088e  addl  %ecx,%eax
   *   0x1c0890  sarl  %eax                     ; eax = srcHeight/2
   *   0x1c0892  cvtsi2ss %eax,%xmm2            ; xmm2 = (float)(srcHeight/2)
   *   0x1c0896  movsd %xmm1, 0x224(%rbx)       ; xformB_r0=0.0, xformB_r1=1.0
   *   0x1c089e  movl  $0x0, 0x22c(%rbx)        ; xformB_pad2 = 0
   *   0x1c08a8  movss %xmm2, 0x230(%rbx)       ; xformB_halfH = srcHeight/2
   *   0x1c08b0  movlps %xmm0, 0x1f4(%rbx)      ; xformA_scaleX=1.0, xformA_scaleY=6.0
   *   0x1c08b7  movl  $0x0, 0x1fc(%rbx)        ; xformA_pad = 0
   *   0x1c08c1  xorl  %eax,%eax
   *   0x1c08c3  subl  0x1e8(%rbx),%eax         ; eax = -panX
   *   0x1c08c9  xorps %xmm0,%xmm0
   *   0x1c08cc  cvtsi2ss %eax,%xmm0            ; xmm0 = (float)(-panX)
   *   0x1c08d0  xorl  %eax,%eax                ; eax = 0
   *   0x1c08d2  movss 0x3c7cc8(%rip),%xmm2     ; xmm2 = 0.5f
   *   0x1c08da  mulss %xmm2,%xmm0              ; xmm0 = -panX * 0.5
   *   0x1c08de  movss %xmm0, 0x200(%rbx)       ; xformA_transX = -panX*0.5
   *   0x1c08e6  movsd %xmm1, 0x204(%rbx)       ; xformA_r0=0.0, xformA_r1=1.0
   *   0x1c08ee  movl  $0x0, 0x20c(%rbx)        ; xformA_pad2 = 0
   *   0x1c08f8  subl  0x1ec(%rbx),%eax         ; eax = -panY   (eax was 0)
   *   0x1c08fe  xorps %xmm0,%xmm0
   *   0x1c0901  cvtsi2ss %eax,%xmm0            ; xmm0 = (float)(-panY)
   *   0x1c0905  mulss %xmm2,%xmm0              ; xmm0 = -panY * 0.5
   *   0x1c0909  movss %xmm0, 0x210(%rbx)       ; xformA_transY = -panY*0.5
   *   0x1c0911  (epilogue) retq
   *
   * Note `sarl %edx` with no count is a 1-bit arithmetic shift; combined
   * with `edx += (edx>>>31)` this is the classic signed "divide by 2 toward
   * zero" idiom. All float writes are single-precision (movss/movlps/movsd
   * of f32 pairs) so results are wrapped in Math.fround.
   *
   * DEPENDENCIES: zero in-scope callees; only libc memcpy (extern).
   */
  setParams(params: HGEquirectProjectParams): void {
    // @0x1c0829..0x1c0835 — memcpy the whole 0x9c-byte params record.
    //   Modeled as a copy of the (five) decoded fields; the opaque tail
    //   of the record is not read by setParams.
    this.params = {
      srcWidth: params.srcWidth | 0,
      srcHeight: params.srcHeight | 0,
      panX: params.panX | 0,
      panY: params.panY | 0,
      paramsLocked: params.paramsLocked | 0,
    };

    // @0x1c083a/0x1c0841 — if paramsLocked != 0, stop after the copy.
    if ((this.params.paramsLocked | 0) !== 0) return;

    // Constant xmm0 = {1.0f, 6.0f}  (literal @0x3c7cc0).
    const scaleX = Math.fround(1.0);
    const scaleY = Math.fround(6.0);

    // @0x1c084f — xformB_scaleX/scaleY.
    this.xformB_scaleX = scaleX;
    this.xformB_scaleY = scaleY;
    // @0x1c0856 — xformB_pad = 0.
    this.xformB_pad = 0;

    // @0x1c0860/0x1c0866 — eax=srcWidth, ecx=srcHeight.
    const srcWidth = this.params.srcWidth | 0;
    const srcHeight = this.params.srcHeight | 0;

    // @0x1c086c..0x1c0873 — edx = srcWidth/2 (signed round-toward-zero).
    const halfW = (srcWidth + (srcWidth >>> 31)) >> 1;
    // @0x1c0875/0x1c0879 — xformB_halfW = (float)(srcWidth/2).
    this.xformB_halfW = Math.fround(halfW);

    // Constant xmm1 = {0.0f, 1.0f}  (literal @0x3c7cb0).
    const r0 = Math.fround(0.0);
    const r1 = Math.fround(1.0);

    // @0x1c0889..0x1c0890 — eax = srcHeight/2 (signed round-toward-zero).
    const halfH = (srcHeight + (srcHeight >>> 31)) >> 1;

    // @0x1c0896 — xformB_r0=0.0, xformB_r1=1.0.
    this.xformB_r0 = r0;
    this.xformB_r1 = r1;
    // @0x1c089e — xformB_pad2 = 0.
    this.xformB_pad2 = 0;
    // @0x1c08a8 — xformB_halfH = (float)(srcHeight/2).
    this.xformB_halfH = Math.fround(halfH);

    // @0x1c08b0 — xformA_scaleX/scaleY (same xmm0 = {1.0f, 6.0f}).
    this.xformA_scaleX = scaleX;
    this.xformA_scaleY = scaleY;
    // @0x1c08b7 — xformA_pad = 0.
    this.xformA_pad = 0;

    // @0x1c08c1..0x1c08da — xformA_transX = (float)(-panX) * 0.5.
    const negPanX = (0 - (this.params.panX | 0)) | 0;
    const half = Math.fround(0.5); // literal @0x3c7cc8
    this.xformA_transX = Math.fround(Math.fround(negPanX) * half);

    // @0x1c08e6 — xformA_r0=0.0, xformA_r1=1.0.
    this.xformA_r0 = r0;
    this.xformA_r1 = r1;
    // @0x1c08ee — xformA_pad2 = 0.
    this.xformA_pad2 = 0;

    // @0x1c08f8..0x1c0909 — xformA_transY = (float)(-panY) * 0.5.
    //   The disasm reuses eax=0 then `subl 0x1ec,%eax`, so this is 0-panY.
    const negPanY = (0 - (this.params.panY | 0)) | 0;
    this.xformA_transY = Math.fround(Math.fround(negPanY) * half);
  }
}
