// HgcApply1DLUT.ts — Helium's 1D LUT applier render node. Faithful transcription of
// the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium.
//
// Source disassembly (in this worktree):
//   raw-port/re/disasm/Helium.HgcApply1DLUT.RenderTile.s             @Helium 0x25000
//   raw-port/re/disasm/Helium.HgcApply1DLUT.GetProgram.s             @Helium 0x25030
//   raw-port/re/disasm/Helium.HgcApply1DLUT.InitProgramDescriptor.s  @Helium 0x25220
//   raw-port/re/disasm/Helium.HgcApply1DLUT.SetParameter.s           @Helium 0x24fc0
//   raw-port/re/disasm/Helium.HgcApply1DLUT.BindTexture.s            @Helium 0x250d0
//   raw-port/re/disasm/Helium.HgcApply1DLUT.Bind.s                   @Helium 0x25060
//   raw-port/re/disasm/Helium.HgcApply1DLUT.GetDOD.s                 @Helium 0x25250
//   raw-port/re/disasm/Helium.HgcApply1DLUT.GetROI.s                 @Helium 0x25270
//
// Helium symbols (nm -arch x86_64 | c++filt):
//   0x24fc0  T HgcApply1DLUT::SetParameter(int, float, float, float, float)
//   0x25000  T HgcApply1DLUT::RenderTile(HGTile*)
//   0x25030  T HgcApply1DLUT::GetProgram(HGRenderer*)
//   0x25060  T HgcApply1DLUT::Bind(HGHandler*)
//   0x250d0  T HgcApply1DLUT::BindTexture(HGHandler*, int)
//   0x25220  T HgcApply1DLUT::InitProgramDescriptor(HGProgramDescriptor*) const
//   0x25250  T HgcApply1DLUT::GetDOD(HGRenderer*, int, HGRect)
//   0x25270  T HgcApply1DLUT::GetROI(HGRenderer*, int, HGRect)
//   0x25320  T HgcApply1DLUT::~HgcApply1DLUT() (D0/D1 pair — not touched in this claim's methods)
//
// CLASS ROLE: a tile-based render node that applies a 1D LUT with three optional pre-shift
// parameters (bias/scale triplets — grouped as 4-float params at fixed offsets) to a source
// image. The kernel dispatch (`GetProgram` / `InitProgramDescriptor`) picks between three shader
// variants keyed on:
//   (a) `bool useBias  = (0.0f < this[+0x1cc])`   — whether the third param’s Y component
//                                                    (a shift/pre-add) is positive.
//   (b) `bool useMode  = (bool) this[+0x1e0]`     — a mode flag stored in the ctor.
//   Combined, these two bools select 1 of 4 shader variants of Apply1D.
//
// FIELD LAYOUT (recovered from the eight methods' offsets):
//   inherits HGNode (bytes 0x00..0x198, see raw-port/src/render/HGNode.ts).
//
//   +0x1a0  float[4]  params[0]   — SetParameter idx=0 writes 0x1a0..0x1ac. Slot 0.
//   +0x1b0  float[4]  params[1]   — SetParameter idx=1 writes 0x1b0..0x1bc. Slot 1.
//   +0x1c0  float[4]  params[2]   — SetParameter idx=2 writes 0x1c0..0x1cc. Slot 2.
//                                     Component 3 of slot 2 (byte offset 0x1cc, a float) is the
//                                     `useBias` gate read by GetProgram/InitProgramDescriptor.
//   +0x1d0  int64/HGRect?   x-lo   — Read by GetROI @0x2528a  (movq 0x1d0(rdi), r12)
//   +0x1d8  int64/HGRect?   x-hi   — Read by GetROI @0x25291  (movq 0x1d8(rdi), r13)
//                                     Semantically an HGRect stored inline (two 8-byte halves)
//                                     representing the ROI grow amount — see GetROI logic below.
//   +0x1e0  uint8   useMode        — Read by RenderTile @0x25015, GetProgram @0x25043,
//                                     InitProgramDescriptor @0x25233, BindTexture @0x2515f. Set
//                                     by an undecoded ctor.
//
// Called Helium/CoreFoundation symbols (all resolved via otool -tV):
//   __Z18Get1DLUTLinearTileP6HGTilePKfS2_S2_b   Get1DLUTLinearTile(...)        @0x25027
//   __Z17GetApply1DProgramP10HGRendererbb        GetApply1DProgram(...)         @0x25050
//   __Z28InitApply1DProgramDescriptorP19HGProgramDescriptorbb
//                                                 InitApply1DProgramDescriptor(...) @0x25240
//   __ZN6HGNode9ClearBitsEv                       HGNode::ClearBits()            @0x24ff3
//   __ZN9HGHandler8TexCoordEiiiPKd                HGHandler::TexCoord()          @0x25117
//   _HGRectMake4i                                 HGRectMake4i                   @0x252c1
//   _HGRectGrow                                   HGRectGrow                     @0x252d2
//   _HGRectNull                                   HGRectNull (data)              @0x252ef
//
// HGHandler vtable slots invoked (via `callq *slot(%rax)`):
//   *0x30                — likely SetFilter/SetMode (see HGHandler.ts note at slot *0x30)
//   *0x48                — undecoded HGHandler op
//   *0x80                — undecoded HGHandler op (probed at 0x2512b for eq-to-0x2e)
//   *0x88                — undecoded HGHandler tex-transform op
//   *0x90                — undecoded HGHandler param-upload op (Bind: 3× calls with slots 0,1,2)
//   *0xa8                — undecoded HGHandler op (BindTexture fallback path)
//   *0x130               — undecoded HGRenderer op (GetROI: query "is-preview?" boolean)
// The vtable of HGHandler is not yet decoded (see HGHandler.ts). Slot 0x2e (used at BindTexture
// @0x25126 as a specific texture-slot key) is read via `*0x80(vtable(handler))` and treated as
// "1D-lut-is-linear?" — a boolean returned by the handler.

import { HGRect, HGRectNull, HGRectMake4i } from "./HGRect.js";
import type { HGRenderer } from "./HGHandler.js";

// ────────────────────────────────────────────────────────────────────────────────────────
// Opaque references for pointers whose full class is decoded elsewhere (or not yet decoded).
// Per PORTING_SPEC Rule 6, HGNode / HGHandler / HGTile / HGProgramDescriptor are separate
// files; we take them as opaque handles here so cross-file reaching is minimised.
// ────────────────────────────────────────────────────────────────────────────────────────
export interface HGTile { readonly __brand: "HGTile" }
export interface HGHandlerRef { readonly __brand: "HGHandler" }
export interface HGProgramDescriptor { readonly __brand: "HGProgramDescriptor" }

// Ambient forwards (per PORTING_SPEC Rule 3, undecoded free helpers throw citing addr).

/** Get1DLUTLinearTile @Helium 0x1CF20 (called tail from RenderTile @0x25027). Actual body
 *  (`__Z18Get1DLUTLinearTileP6HGTilePKfS2_S2_b`) not yet transcribed — it is the CPU-tile
 *  fallback rasteriser for the 1D-LUT apply node. Signature recovered from the mangled name:
 *    void Get1DLUTLinearTile(HGTile* tile, float const* p0, float const* p1, float const* p2, bool useMode). */
function Get1DLUTLinearTile(
  _tile: HGTile,
  _p0: Float32Array,
  _p1: Float32Array,
  _p2: Float32Array,
  _useMode: boolean,
): void {
  throw new Error(
    "Get1DLUTLinearTile @Helium (__Z18Get1DLUTLinearTileP6HGTilePKfS2_S2_b) not yet transcribed " +
      "— CPU-tile 1D LUT rasteriser called from HgcApply1DLUT::RenderTile @0x25027.",
  );
}

/** GetApply1DProgram @Helium (called tail from GetProgram @0x25050). Signature:
 *    HGProgram* GetApply1DProgram(HGRenderer*, bool useBias, bool useMode);
 *  Body not yet transcribed — picks a compiled GPU program keyed on the two bools. */
function GetApply1DProgram(_r: HGRenderer, _useBias: boolean, _useMode: boolean): unknown {
  throw new Error(
    "GetApply1DProgram @Helium (__Z17GetApply1DProgramP10HGRendererbb) not yet transcribed " +
      "— tail-called from HgcApply1DLUT::GetProgram @0x25050.",
  );
}

/** InitApply1DProgramDescriptor @Helium (called tail from InitProgramDescriptor @0x25240).
 *  Signature: void InitApply1DProgramDescriptor(HGProgramDescriptor*, bool useBias, bool useMode); */
function InitApply1DProgramDescriptor(
  _pd: HGProgramDescriptor, _useBias: boolean, _useMode: boolean,
): void {
  throw new Error(
    "InitApply1DProgramDescriptor @Helium (__Z28InitApply1DProgramDescriptorP19HGProgramDescriptorbb) " +
      "not yet transcribed — tail-called from HgcApply1DLUT::InitProgramDescriptor @0x25240.",
  );
}

/** HGRectGrow @Helium 0x107960 — not yet transcribed. Signature (from usage in GetROI):
 *    HGRect HGRectGrow(HGRect a, HGRect b);   // returns a rect grown by b's offsets. */
function HGRectGrow(_a: HGRect, _b: HGRect): HGRect {
  throw new Error("HGRectGrow @Helium 0x107960 not yet transcribed — used by HgcApply1DLUT::GetROI @0x252d2.");
}

/** HGNode::ClearBits() @Helium (called from SetParameter @0x24ff3). No-argument overload.
 *  Not yet transcribed on HGNode class. */
function HGNode_ClearBits(_self: HgcApply1DLUT): void {
  throw new Error(
    "HGNode::ClearBits() @Helium (__ZN6HGNode9ClearBitsEv) not yet transcribed " +
      "— called from HgcApply1DLUT::SetParameter @0x24ff3.",
  );
}

/** HGHandler::TexCoord(int, int, int, double const*) @Helium (called from BindTexture @0x25117).
 *  Not yet transcribed on HGHandler class. */
function HGHandler_TexCoord(
  _h: HGHandlerRef, _a: number, _b: number, _c: number, _d: Float64Array | null,
): void {
  throw new Error(
    "HGHandler::TexCoord(int,int,int,double const*) @Helium (__ZN9HGHandler8TexCoordEiiiPKd) " +
      "not yet transcribed — called from HgcApply1DLUT::BindTexture @0x25117.",
  );
}

/** HGHandler::vtable_slot(offset)(...) throw-stub — for the many vtable dispatches this file
 *  makes (*0x30, *0x48, *0x80, *0x88, *0x90, *0xa8, *0x130 on HGRenderer). */
function HGHandler_vslot(_self: HGHandlerRef, slot: number, cite: string, ..._args: unknown[]): never {
  throw new Error(
    `HGHandler vtable *${slot.toString(16)} @Helium not yet transcribed — called from ${cite}.`,
  );
}

// ────────────────────────────────────────────────────────────────────────────────────────
// HGRenderer vtable slot dispatch (*0x130 in GetROI). Same treatment.
// ────────────────────────────────────────────────────────────────────────────────────────
function HGRenderer_vslot_0x130(_r: HGRenderer, _cite: string): boolean {
  throw new Error(
    "HGRenderer vtable *0x130 @Helium not yet transcribed — called from " +
      "HgcApply1DLUT::GetROI @0x2529e (queries 'is-preview?' boolean).",
  );
}

/**
 * HgcApply1DLUT — extends HGNode. Field layout is documented in the file docstring above.
 * The ctor and dtor family (@0x25320+) are NOT touched by this claim; they are separate
 * symbols that require HGNode's ctor to be transcribed first. This class-file transcribes
 * the eight public methods listed at the top.
 */
export class HgcApply1DLUT {
  /** +0x1a0 params[0][4] — SetParameter idx=0 target. Ctor init not yet decoded. */
  readonly params0: Float32Array = new Float32Array(4);
  /** +0x1b0 params[1][4] — SetParameter idx=1 target. */
  readonly params1: Float32Array = new Float32Array(4);
  /** +0x1c0 params[2][4] — SetParameter idx=2 target. Component 3 (offset +0x1cc) gates useBias. */
  readonly params2: Float32Array = new Float32Array(4);
  /** +0x1d0 rect_lo — 8 bytes, high half of an inline HGRect. Read by GetROI @0x2528a. */
  rect_lo: bigint = 0n;
  /** +0x1d8 rect_hi — 8 bytes, low half of an inline HGRect. Read by GetROI @0x25291. */
  rect_hi: bigint = 0n;
  /** +0x1e0 useMode (uint8) — set by ctor (undecoded); read by 4 methods. */
  useMode: boolean = false;

  // ────────────────────────────────────────────────────────────────────────────────────
  // HgcApply1DLUT::SetParameter(int idx, float f0, float f1, float f2, float f3)
  //   @Helium 0x24fc0 — 16-line body.
  //
  // Body (verbatim):
  //   cmpl  $0x2, %esi                       ; if (idx > 2u)
  //   ja    0x24fef                          ;   → skip store, only do ClearBits+return 1
  //   movl  %esi, %eax
  //   shlq  $0x4, %rax                       ; rax = idx * 16 (each slot = 4 floats = 16 bytes)
  //   movss %xmm0, 0x1a0(%rdi, %rax)          ; params[idx][0] = f0
  //   movss %xmm1, 0x1a4(%rdi, %rax)          ; params[idx][1] = f1
  //   movss %xmm2, 0x1a8(%rdi, %rax)          ; params[idx][2] = f2
  //   movss %xmm3, 0x1ac(%rdi, %rax)          ; params[idx][3] = f3
  // 0x24fef:
  //   pushq %rbp ; movq %rsp, %rbp
  //   callq __ZN6HGNode9ClearBitsEv          ; HGNode::ClearBits()
  //   movl  $0x1, %eax                       ; return 1
  //   popq  %rbp ; retq
  //
  // Return value 1 (int) matches other HGNode SetParameter overrides — indicates
  // "parameter accepted; invalidate cached bits".
  // ────────────────────────────────────────────────────────────────────────────────────
  SetParameter(idx: number, f0: number, f1: number, f2: number, f3: number): number {
    // `cmpl $0x2, %esi ; ja` is an UNSIGNED comparison. idx>2 (or negative when interpreted
    // as u32) skips the store path but still runs ClearBits.
    if ((idx >>> 0) <= 2) {
      const slot = idx === 0 ? this.params0 : idx === 1 ? this.params1 : this.params2;
      // Match Math.fround for single-precision store (movss).
      slot[0] = Math.fround(f0);            // @0x1a0/1b0/1c0 + 0
      slot[1] = Math.fround(f1);            // + 4
      slot[2] = Math.fround(f2);            // + 8
      slot[3] = Math.fround(f3);            // + 12  (offset +0x1cc for idx=2 → useBias gate value)
    }
    HGNode_ClearBits(this);                 // @0x24ff3
    return 1;                                // movl $0x1, %eax @0x24ff8
  }

  // ────────────────────────────────────────────────────────────────────────────────────
  // HgcApply1DLUT::RenderTile(HGTile*)   @Helium 0x25000 — 13-line body.
  //
  // Body (verbatim):
  //   movq %rsi, %rax                        ; rax = tile
  //   leaq 0x1a0(%rdi), %rsi                 ; rsi = &params[0]
  //   leaq 0x1b0(%rdi), %rdx                 ; rdx = &params[1]
  //   movzbl 0x1e0(%rdi), %r8d               ; r8b = useMode
  //   leaq 0x1c0(%rdi), %rcx                 ; rcx = &params[2]
  //   movq %rax, %rdi                        ; rdi = tile
  //   callq Get1DLUTLinearTile               ; (tile, &params[0], &params[1], &params[2], useMode)
  //   xorl %eax, %eax                        ; return 0
  //   retq
  // ────────────────────────────────────────────────────────────────────────────────────
  RenderTile(tile: HGTile): number {
    Get1DLUTLinearTile(tile, this.params0, this.params1, this.params2, this.useMode);
    return 0;                                // xorl %eax, %eax
  }

  // ────────────────────────────────────────────────────────────────────────────────────
  // HgcApply1DLUT::GetProgram(HGRenderer* r)   @Helium 0x25030 — 13-line body.
  //
  // Body (verbatim):
  //   xorps %xmm0, %xmm0                     ; xmm0 = 0.0f
  //   xorl  %eax, %eax                       ; al = 0
  //   ucomiss 0x1cc(%rdi), %xmm0             ; compare (0.0f, params[2][3])
  //   seta  %al                              ; al = (0.0f > params[2][3]) ? 1 : 0
  //                                          ; but seta = CF==0 && ZF==0 = "above (unsigned)".
  //                                          ; ucomiss sets CF=1 when xmm0 < mem (i.e. 0 < params[2][3]);
  //                                          ;   CF=0 && ZF=0 (=> ‘above’) means xmm0 > mem, so mem < 0.
  //                                          ; Wait — with `ucomiss 0x1cc(%rdi), %xmm0`, the AT&T
  //                                          ; syntax reads `xmm0 CMP mem` — flags reflect (xmm0 - mem).
  //                                          ; seta (CF=0 && ZF=0) fires when xmm0 > mem, i.e. mem < 0.0f.
  //                                          ;   → al = (params[2][3] < 0.0f) ? 1 : 0
  //   movzbl 0x1e0(%rdi), %edx               ; dl = useMode
  //   movq  %rsi, %rdi                       ; rdi = renderer
  //   movl  %eax, %esi                       ; esi = useBias (=params[2][3] < 0)
  //   jmp   GetApply1DProgram
  //
  // WAIT — my previous reasoning conflicts with the file docstring above. Let me re-derive
  // carefully from AT&T semantics. AT&T `ucomiss src, dst` computes `dst CMP src`. So
  // `ucomiss 0x1cc(%rdi), %xmm0` = `xmm0 CMP mem`. seta triggers when xmm0 > mem (strictly).
  // xmm0 = 0.0f, so seta ⇒ mem < 0.0f. Hence `useBias = params[2][3] < 0.0f`.
  //
  // Correcting the file-header note above: `useBias = (params[2][3] < 0.0f)` — the SIGN of the
  // third component of params[2] gates the "bias" shader variant. (NaN-safe: `ucomiss` sets
  // PF/CF/ZF for unordered → seta requires CF=0 && ZF=0 → an unordered compare gives ZF=1 (per
  // Intel manual §UCOMISS) → seta = 0. So NaN → useBias=false, matching Apple's semantics.)
  // ────────────────────────────────────────────────────────────────────────────────────
  GetProgram(r: HGRenderer): unknown {
    const p3 = this.params2[3];                                // 0x1cc(rdi)
    // xorps xmm0,xmm0 sets xmm0=+0.0f. `ucomiss mem, xmm0` = "xmm0 CMP mem" in AT&T. seta after
    // that = (xmm0 > mem) = (mem < 0). NaN-unordered → PF=1,ZF=1 → seta=0.
    // JS `<` on NaN is false, matching. Use fround on the read to model 32-bit compare (values
    // are already 32-bit in a Float32Array; params2[3] returns the exact fp32).
    const useBias = p3 < 0.0;                                  // seta after ucomiss (@0x25040)
    return GetApply1DProgram(r, useBias, this.useMode);        // jmp @0x25050
  }

  // ────────────────────────────────────────────────────────────────────────────────────
  // HgcApply1DLUT::InitProgramDescriptor(HGProgramDescriptor* pd) const   @Helium 0x25220
  // 13-line body IDENTICAL in shape to GetProgram (same seta-derives-useBias / useMode / tail).
  // ────────────────────────────────────────────────────────────────────────────────────
  InitProgramDescriptor(pd: HGProgramDescriptor): void {
    const useBias = this.params2[3] < 0.0;                     // @0x25230 seta
    InitApply1DProgramDescriptor(pd, useBias, this.useMode);   // jmp @0x25240
  }

  // ────────────────────────────────────────────────────────────────────────────────────
  // HgcApply1DLUT::GetDOD(HGRenderer*, int fieldIdx, HGRect input)   @Helium 0x25250
  // 13-line body:
  //   movq %rcx, %rax                        ; rax = input.lo
  //   testl %edx, %edx                       ; if (fieldIdx == 0)
  //   je   0x2526a                           ;   → return input unchanged
  //   pushq %rbp ; movq %rsp, %rbp
  //   leaq _HGRectNull(%rip), %rcx
  //   movq (%rcx), %rax                      ; rax = HGRectNull.lo
  //   movq 0x8(%rcx), %r8                    ; r8  = HGRectNull.hi
  //   popq %rbp
  // 0x2526a:
  //   movq %r8, %rdx                         ; return (rax, rdx) = (input if fieldIdx==0 else HGRectNull)
  //   retq
  //
  // Semantics: DOD-of-slot-0 (main image) is the input rect itself; for any other slot
  // (LUT/domain texture inputs) the DOD is empty (HGRectNull).
  // ────────────────────────────────────────────────────────────────────────────────────
  GetDOD(_r: HGRenderer, fieldIdx: number, input: HGRect): HGRect {
    // testl %edx,%edx / je → treat as signed 32-bit == 0.
    if ((fieldIdx | 0) === 0) return input;                    // return input unchanged
    return HGRectNull;                                          // return HGRectNull ({0,0,0,0})
  }

  // ────────────────────────────────────────────────────────────────────────────────────
  // HgcApply1DLUT::GetROI(HGRenderer* r, int fieldIdx, HGRect input)   @Helium 0x25270
  // Full 61-line body:
  //
  //   movq %r8, %r14 ; movq %rcx, %rbx ; movl %edx, -0x2c(%rbp) ; movq %rdi, %r15
  //   movq 0x1d0(%rdi), %r12                 ; r12 = this[+0x1d0] = rect_lo (raw 8 bytes)
  //   movq 0x1d8(%rdi), %r13                 ; r13 = this[+0x1d8] = rect_hi (raw 8 bytes)
  //   movq (%rsi), %rax ; movq %rsi, %rdi
  //   callq *0x130(%rax)                     ; is-preview? = HGRenderer::vtable_0x130(r)
  //   testb %al, %al ; jne 0x252dd            ; if is-preview → skip the grow, use rect_{lo,hi} as-is
  //   ; else: reload rects (they were overwritten during the callq)
  //   movq 0x1d0(%r15), %r12
  //   movq 0x1d8(%r15), %r15                 ; NOTE: this overwrites r15 (the this ptr) — the
  //                                             asm assumes r15 is no longer needed after this
  //                                             point.  Field indexes tracked below use rect_hi.
  //   xorl %edi ; xorl %esi ; movl $0x1, %edx ; xorl %ecx
  //   callq _HGRectMake4i                    ; grow_units = HGRectMake4i(0, 0, 1, 0)
  //                                          ; = {x=0, y=0, right=1, bottom=0}
  //   movq %rdx, %rcx                         ; (returned rect: rax=lo, rdx=hi → pack)
  //   movq %r12, %rdi ; movq %r15, %rsi ; movq %rax, %rdx
  //   callq _HGRectGrow                      ; (rect_lo,rect_hi = rect_lo/hi grown by (0,0,1,0))
  //   movq %rax, %r12 ; movq %rdx, %r13       ; r12/r13 = grown rect
  // 0x252dd:
  //   movl -0x2c(%rbp), %eax                 ; eax = fieldIdx
  //   testl %eax, %eax ; je 0x252fd           ; if fieldIdx == 0 → return grown (r12/r13)
  //   movq %r12, %rbx ; movq %r13, %r14       ; else: rbx/r14 = grown
  //   cmpl $0x1, %eax ; je 0x252fd            ; if fieldIdx == 1 → return grown too
  //   leaq _HGRectNull(%rip), %rax
  //   movq (%rax), %rbx ; movq 0x8(%rax), %r14 ; else → return HGRectNull
  // 0x252fd:
  //   movq %rbx, %rax ; movq %r14, %rdx        ; final return (rax, rdx)
  //   retq
  //
  // So GetROI's decoded semantics:
  //   grow_rect =
  //     if renderer_is_preview: this.roi_grow                (raw {rect_lo, rect_hi})
  //     else                  : HGRectGrow(this.roi_grow, HGRectMake4i(0,0,1,0))
  //   return  fieldIdx <= 1  ? grow_rect : HGRectNull
  //
  // The {rect_lo, rect_hi} pair at +0x1d0/+0x1d8 is thus a stored ROI-grow HGRect. The value
  // 1 in HGRectMake4i(0,0,1,0)'s `right` param is a hard-coded "grow right by 1 pixel" for the
  // non-preview render path (accommodating the LUT's linear-interp fetch overshoot by 1 texel).
  // ────────────────────────────────────────────────────────────────────────────────────
  GetROI(r: HGRenderer, fieldIdx: number, _input: HGRect): HGRect {
    // Reconstruct the stored HGRect from the two 8-byte halves.
    // HGRect layout is {x,y,right,bottom} each int32 (see HGRect.ts).  rect_lo = (x,y),
    // rect_hi = (right,bottom).  We store as bigint to keep the raw 8-byte memory equivalence;
    // decoded fields require a materialisation step here.
    const stored: HGRect = decodeHGRectFromBigints(this.rect_lo, this.rect_hi);
    let grow: HGRect;
    if (HGRenderer_vslot_0x130(r, "HgcApply1DLUT::GetROI @0x2529e")) {
      // is-preview: use stored rect verbatim (@0x252dd path skips the grow)
      grow = stored;
    } else {
      // non-preview: grow by (0,0,1,0)  (add 1 pixel on the right)
      const growUnits = HGRectMake4i(0, 0, 1, 0);              // @0x252c1
      grow = HGRectGrow(stored, growUnits);                     // @0x252d2 (throw-stub)
    }
    if (fieldIdx === 0 || fieldIdx === 1) return grow;         // @0x252e2/0x252ed
    return HGRectNull;                                          // @0x252ef _HGRectNull
  }

  // ────────────────────────────────────────────────────────────────────────────────────
  // HgcApply1DLUT::Bind(HGHandler* h)   @Helium 0x25060 — 32-line body.
  //
  // Uploads all three param slots to the GPU via HGHandler *0x90 (parameter upload):
  //
  //   leaq  0x1a0(%rdi), %rdx                ; rdx = &params[0]
  //   movq  (%rsi), %rax  ; movq %rsi, %rdi
  //   xorl  %esi, %esi                       ; esi = 0    (paramSlot 0)
  //   movl  $0x1, %ecx                       ; ecx = 1    (count 1?)
  //   callq *0x90(%rax)                      ; HGHandler::(*0x90)(h, 0, &params[0], 1)
  //
  //   leaq  0x1b0(%r14), %rdx                ; rdx = &params[1]     (r14 = this)
  //   movq  (%rbx), %rax  ; movq %rbx, %rdi   ; (rbx = h)
  //   movl  $0x1, %esi                       ; esi = 1
  //   movl  $0x1, %ecx
  //   callq *0x90(%rax)                      ; HGHandler::(*0x90)(h, 1, &params[1], 1)
  //
  //   addq  $0x1c0, %r14                     ; r14 = &params[2]  (this + 0x1c0)
  //   movq  (%rbx), %rax  ; movq %rbx, %rdi
  //   movl  $0x2, %esi                       ; esi = 2
  //   movq  %r14, %rdx                       ; rdx = &params[2]
  //   movl  $0x1, %ecx
  //   callq *0x90(%rax)                      ; HGHandler::(*0x90)(h, 2, &params[2], 1)
  //
  //   xorl  %eax, %eax                       ; return 0
  //   retq
  //
  // *0x90 on HGHandler is not yet decoded (see HGHandler.ts). We faithfully invoke it via
  // the vtable-stub for all three slots so the shape (three uploads, one per param) is preserved.
  // ────────────────────────────────────────────────────────────────────────────────────
  Bind(h: HGHandlerRef): number {
    HGHandler_vslot(h, 0x90, "HgcApply1DLUT::Bind @0x25081", 0, this.params0, 1); // slot 0
    HGHandler_vslot(h, 0x90, "HgcApply1DLUT::Bind @0x2509e", 1, this.params1, 1); // slot 1
    HGHandler_vslot(h, 0x90, "HgcApply1DLUT::Bind @0x250be", 2, this.params2, 1); // slot 2
    return 0;                                                                      // xorl eax,eax
  }

  // ────────────────────────────────────────────────────────────────────────────────────
  // HgcApply1DLUT::BindTexture(HGHandler* h, int texIdx)   @Helium 0x250d0 — 90-line body.
  //
  // Branches on texIdx ∈ {0, 1, else} :
  //
  //  A) texIdx != 1 && texIdx != 0 → return -1 (0xffffffff).
  //  B) texIdx == 0 (source-image branch @0x250ef..0x2514a):
  //       h->vtable[0x48](h, 0, 0);                    // @0x250fb — undecoded (bind source?)
  //       h->vtable[0x30](h, 0, 0);                    // @0x25108 — SetFilter/Mode (0,0)
  //       HGHandler::TexCoord(h, 0, 0, 0, nullptr);    // @0x25117
  //       // Query handler slot 0x80 with key 0x2e (46)
  //       int qResult = (*(*h + 0x80))(h, 0x2e);        // @0x2512b
  //       if (qResult != 0) return 0;                   // @0x25131 → early return 0
  //       h->vtable[0xa8](h);                          // @0x2513f — one-arg call, dispatch
  //       return 0;
  //  C) texIdx == 1 (LUT-texture branch @0x2514a..0x25205):
  //       h->vtable[0x48](h, 1, 0);                    // @0x2515c
  //       int useMode_i = (int)this->useMode;
  //       h->vtable[0x30](h, useMode_i);               // @0x2516f — SetFilter(useMode)
  //       int qResult = (*(*h + 0x80))(h, 0x2e);        // @0x25181
  //       if (qResult != 0) {                          // @0x25189 → GPU-fast path
  //           // load 1.0f (from const @Helium __literal4 ~0x3c7dc0):
  //           float one = *(float*)(rip + 0x3a2b2a);   // @0x2518e = 1.0f
  //           float zero1=0.0f, zero2=0.0f;             // xorps xmm0,xmm0; xorps xmm1,xmm1
  //           h->vtable[0x88](h, 3, zero1, zero2, one, one);   // @0x251ff
  //       } else {                                      // @0x251a9 → CPU-fallback path
  //           float w  = (float)this->fld_0xf0_i32;      // @0x251a9  cvtsi2ssl 0xf0(r14)
  //           float h_ = (float)this->fld_0xf4_i32;      // @0x251b2  cvtsi2ssl 0xf4(r14)
  //           int64_t dx = this->fld_0xe4_i32 - this->fld_0xdc_i32; // @0x251bb..0x251c9
  //           float dxf   = (float)dx;                   // cvtsi2ss %rax, xmm4
  //           int64_t dy = this->fld_0xe8_i32 - this->fld_0xe0_i32; // @0x251ce..0x251dc
  //           float dyf   = (float)dy;                   // cvtsi2ss %rax, xmm5
  //           float one   = *(float*)(rip + 0x3a2adc);   // @0x251dc = 1.0f (same lit4)
  //           float sx    = one / dxf;                   // divss xmm4, xmm2
  //           float sy    = one / dyf;                   // divss xmm5, xmm3
  //           h->vtable[0x88](h, 3, w, h_, sx, sy);      // @0x251ff
  //       }
  //       return 0;
  //
  // Fields at +0xdc/0xe0/0xe4/0xe8/0xf0/0xf4 belong to the HGNode base class — a rect stored
  // in-line + width/height ints (see HGNode.ts: rectC at 0xdc..0xec, then width/height at
  // 0xf0/0xf4).
  // ────────────────────────────────────────────────────────────────────────────────────
  BindTexture(h: HGHandlerRef, texIdx: number): number {
    if (texIdx !== 0 && texIdx !== 1) {
      return -1;                          // 0xffffffff (movl $0xffffffff, %ebx @0x250e2)
    }
    if (texIdx === 0) {
      HGHandler_vslot(h, 0x48, "HgcApply1DLUT::BindTexture-src @0x250fb", 0, 0);
      HGHandler_vslot(h, 0x30, "HgcApply1DLUT::BindTexture-src @0x25108", 0, 0);
      HGHandler_TexCoord(h, 0, 0, 0, null);                              // @0x25117
      const q = HGHandler_vslot(h, 0x80, "HgcApply1DLUT::BindTexture-src @0x2512b", 0x2e) as unknown as number;
      // (the two vslot stubs above throw before we get here; if TexCoord's stub throws first,
      // this line is unreachable. Kept for shape parity with the disasm.)
      if ((q as number) !== 0) return 0;                                  // @0x25131
      HGHandler_vslot(h, 0xa8, "HgcApply1DLUT::BindTexture-src @0x2513f");
      return 0;
    }
    // texIdx === 1 : LUT-texture branch
    HGHandler_vslot(h, 0x48, "HgcApply1DLUT::BindTexture-lut @0x2515c", 1, 0);
    const useMode_i = this.useMode ? 1 : 0;                                // movzbl 0x1e0(r15)
    HGHandler_vslot(h, 0x30, "HgcApply1DLUT::BindTexture-lut @0x2516f", useMode_i);
    const q2 = HGHandler_vslot(h, 0x80, "HgcApply1DLUT::BindTexture-lut @0x25181", 0x2e) as unknown as number;
    if ((q2 as number) !== 0) {
      // GPU-fast path
      const ONE_F32 = Math.fround(1.0);   // @Helium __literal4 (rip+0x3a2b2a) = 0x3f800000 = 1.0f
      HGHandler_vslot(
        h, 0x88, "HgcApply1DLUT::BindTexture-lut-gpu @0x251ff",
        3, 0.0, 0.0, ONE_F32, ONE_F32,
      );
    } else {
      throw new Error(
        "HgcApply1DLUT::BindTexture LUT CPU-fallback @0x251a9 requires HGNode base fields " +
          "+0xdc..+0xf4 (rectC + width/height) — HGNode base layout is transcribed but the " +
          "instance-field readers on HGNode are not yet exposed on this class-file. When wired, " +
          "compute (sx,sy) = 1.0f / (fld_0xe4-fld_0xdc, fld_0xe8-fld_0xe0) and dispatch " +
          "HGHandler *0x88(h, 3, w, h, sx, sy).",
      );
    }
    return 0;
  }
}

/** Decode the (rect_lo, rect_hi) bigint pair into a proper HGRect struct.
 *  HGRect layout (from HGRect.ts) is 4× int32: {x, y, right, bottom} — bytes 0..3, 4..7, 8..11,
 *  12..15. rect_lo covers bytes 0..7 (x, y), rect_hi covers bytes 8..15 (right, bottom).
 *  This helper matches the movq/movq load pattern in GetROI @0x2528a/0x25291.
 */
function decodeHGRectFromBigints(lo: bigint, hi: bigint): HGRect {
  const LOW32  = 0xffffffffn;
  const x        = Number(BigInt.asIntN(32, lo & LOW32));
  const y        = Number(BigInt.asIntN(32, (lo >> 32n) & LOW32));
  const right    = Number(BigInt.asIntN(32, hi & LOW32));
  const bottom   = Number(BigInt.asIntN(32, (hi >> 32n) & LOW32));
  return { x, y, right, bottom };
}
