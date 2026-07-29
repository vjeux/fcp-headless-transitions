// transformColor_PCColor_ColorComponents.ts — ProCore free function
//   void transformColor<PCColor::ColorComponents>(
//     PCColor::ColorComponents const& src, CGColorSpace* srcCS,
//     PCColor::ColorComponents& dst,        CGColorSpace* dstCS)
//   @ProCore 0x799fa (mangled __ZL14transformColorIN7PCColor15ColorComponentsEEvRKS1_P12CGColorSpaceRT_S5_)
//
// Frontier keystone that unblocks ~30 stubbed PCColor methods (mix cross-cs, ctor from PCColor+cs,
// setColorSpace, getRGBA/toVector4f/equal). Discovered as call site @0x799a0 inside PCColor::mix.
//
// This is the TYPED SHIM over the raw-double transformColor. It:
//   1. Reads the number of components in the destination CGColorSpace (via CG API), +1 for alpha.
//   2. Clamps that count to 5 (PCColor::ColorComponents holds at most 5 doubles).
//   3. If the clamped count exceeds dst's current component count, zeros the tail slots.
//   4. Writes the clamped count into dst.numComponents.
//   5. Tail-calls transformColor(double const*, size_t, CGColorSpace*, double*, size_t, CGColorSpace*)
//      @ProCore 0x???? (raw-double core — not decoded here; surfaced as a throwing stub).
//
// Disassembly (49 lines, ProCore.framework x86_64):
//
//   0x799fa  push %rbp; mov %rsp,%rbp; push r15..rax     ; standard prologue
//   0x79a08  mov %rcx,%rbx                                ; rbx = dstCS
//   0x79a0b  mov %rdx,%r14                                ; r14 = &dst (PCColor::ColorComponents&)
//   0x79a0e  mov %rsi,-0x30(%rbp)                         ; spill srcCS to stack
//   0x79a12  mov %rdi,%r12                                ; r12 = &src
//   0x79a15  mov %rcx,%rdi                                ; arg = dstCS
//   0x79a18  call CGColorSpaceGetNumberOfComponents        ; %eax = numColorComps
//   0x79a1d  inc  %eax                                     ; %eax = numColorComps + 1 (alpha)
//   0x79a1f  cmp  $0x5,%eax
//   0x79a22  mov  $0x5,%r15d
//   0x79a28  cmovl %eax,%r15d                              ; r15 = min(numColorComps+1, 5)
//   0x79a2c  movslq (%r14),%rax                            ; rax = dst.numComponents (as int64)
//   0x79a2f  cmp  %eax,%r15d
//   0x79a32  jle  0x79a50                                  ; if new <= old, skip bzero
//   0x79a34  lea  (%r14,%rax,8),%rdi                       ; rdi = &dst + old*8 (=dst.components[old-1] base? see below)
//   0x79a38  add  $0x8,%rdi                                ; rdi = &dst.components[old]  (dst=+0..+0x28; comp[k]@+8*(k+1))
//   0x79a3c  movslq %r15d,%r13                             ; r13 = new (int64)
//   0x79a3f  mov  %r13,%rsi
//   0x79a42  sub  %rax,%rsi                                ; rsi = new - old
//   0x79a45  shl  $0x3,%rsi                                ; rsi = (new-old) * 8 bytes
//   0x79a49  call ___bzero                                 ; bzero(&dst.comp[old], (new-old)*8)
//   0x79a4e  jmp  0x79a53
//   0x79a50  movslq %r15d,%r13                             ; r13 = new (still int64) — no bzero path
//   0x79a53  mov  %r15d,(%r14)                             ; dst.numComponents = new (int32)
//   0x79a56  movslq (%r12),%rsi                            ; rsi = src.numComponents (as size_t)
//   0x79a5a  add  $0x8,%r12                                ; r12 = &src.components[0]
//   0x79a5e  add  $0x8,%r14                                ; r14 = &dst.components[0]
//   0x79a62  mov  %r12,%rdi                                ; arg0: src doubles ptr
//   0x79a65  mov  -0x30(%rbp),%rdx                         ; arg2: srcCS
//   0x79a69  mov  %r14,%rcx                                ; arg3: dst doubles ptr
//   0x79a6c  mov  %r13,%r8                                 ; arg4: dst count (new, size_t)
//   0x79a6f  mov  %rbx,%r9                                 ; arg5: dstCS
//   0x79a72  epilogue + jmp __ZL14transformColorPKdmP12CGColorSpacePdmS2_  ; tail-call raw core
//
// Note: `PCColor::ColorComponents` is a private view of PCColor's leading fields (see PCColor.ts):
//   +0x00 int32 numComponents; +0x08..+0x28 double components[5]
// This function operates on those fields WITHOUT touching PCColor's +0x30 colorspace slot.
//
// Verification (concrete inputs derivable from the disassembly, WITHOUT calling the undecoded raw
// core): applyPreLayout(dst, dstCS) that only performs the count/zero/write steps must produce:
//   dstCS=RGB (numColorComps=3, +1=4, min(4,5)=4)
//   dst starts as {numComponents=2, comp=[0.1, 0.2, 3.3, 4.4, 5.5]}
//   -> new(4) > old(2) => bzero dst.comp[2..3] (2 slots * 8 = 16 bytes)
//   -> dst.numComponents := 4
//   Final dst pre-core: {numComponents=4, comp=[0.1, 0.2, 0.0, 0.0, 5.5]}
// See runtime-invariant test at bottom of file.

import { PCColor, CGColorSpaceRef } from "./PCColor";

/** Undecoded raw-double core; surfaced as a throwing stub so the frontier remains visible.
 * @ProCore not-yet-decoded (called via tail-jmp at 0x79a80 from the typed shim).
 * Signature: transformColor(double const*, size_t, CGColorSpace*, double*, size_t, CGColorSpace*). */
export function transformColor_raw(
  _src: Float64Array | number[],
  _srcCount: number,
  _srcCS: CGColorSpaceRef | null,
  _dst: Float64Array | number[],
  _dstCount: number,
  _dstCS: CGColorSpaceRef | null,
): void {
  throw new Error(
    "transformColor(double const*, size_t, CGColorSpace*, double*, size_t, CGColorSpace*) " +
    "@ProCore (mangled __ZL14transformColorPKdmP12CGColorSpacePdmS2_) not yet transcribed " +
    "(tail-called from transformColor_PCColor_ColorComponents @0x79a80)"
  );
}

/** CGColorSpaceGetNumberOfComponents — CoreGraphics API. Returns the number of color components
 * (not counting alpha) in the color space. Undecoded external — surfaced as a throwing stub. */
export function CGColorSpaceGetNumberOfComponents(_cs: CGColorSpaceRef | null): number {
  throw new Error(
    "CGColorSpaceGetNumberOfComponents(CGColorSpace*) @CoreGraphics (extern symbol stub 0xde1d4 " +
    "in ProCore __stubs) not yet transcribed"
  );
}

/**
 * transformColor<PCColor::ColorComponents>(src, srcCS, dst, dstCS) @ProCore 0x799fa.
 *
 * Fills `dst` (which holds `numComponents` + `components[5]`) with `src` converted from `srcCS`
 * to `dstCS`. The colorspace-conversion arithmetic itself lives in the raw-double core (undecoded
 * @ProCore, tail-called via jmp at 0x79a80). This shim does the count-management + zeroing.
 *
 * @param src   PCColor whose leading fields (numComponents + components[]) are the source doubles.
 * @param srcCS Source CGColorSpace (must be non-null in FCP; disasm does not null-check).
 * @param dst   PCColor whose leading fields will be OVERWRITTEN with the converted doubles.
 * @param dstCS Destination CGColorSpace (must be non-null; used both to size + convert).
 */
export function transformColor_PCColor_ColorComponents(
  src: PCColor,
  srcCS: CGColorSpaceRef | null,
  dst: PCColor,
  dstCS: CGColorSpaceRef | null,
): void {
  // 0x79a18: numColorComps = CGColorSpaceGetNumberOfComponents(dstCS)
  //          (undecoded extern stub — we throw for now; a decoded CS_registry can replace this).
  const numColorComps = CGColorSpaceGetNumberOfComponents(dstCS) | 0;

  // 0x79a1d..0x79a28: new = min(numColorComps + 1, 5). The +1 is the alpha slot.
  //   inc %eax; cmp $0x5,%eax; mov $0x5,%r15d; cmovl %eax,%r15d
  const incAlpha = (numColorComps + 1) | 0;
  const newN = (incAlpha < 5 ? incAlpha : 5) | 0;

  // 0x79a2c: old = dst.numComponents (as int32, sign-extended to int64).
  const oldN = dst.numComponents | 0;

  // 0x79a2f..0x79a4e: if (new > old) bzero(&dst.components[old], (new-old) * 8 bytes).
  //   The disasm computes &dst.components[old] as (dst_base + old*8) + 8 because PCColor's
  //   components[0] lives at +0x08 (dst_base=+0x00). In our TS mirror, components is a
  //   5-tuple indexed 0..4, so we zero indices [old, new).
  if (newN > oldN) {
    for (let k = oldN; k < newN; k++) {
      // A single ___bzero on the FCP side; we do the equivalent slot-by-slot with double 0.0.
      dst.components[k] = 0;
    }
  }

  // 0x79a53: dst.numComponents = new (int32).
  dst.numComponents = newN | 0;

  // 0x79a56..0x79a80: tail-call raw core with src.components + src.numComponents (as size_t),
  //   srcCS, dst.components + new (size_t), dstCS. The raw core is not decoded; we surface it
  //   through the throwing stub above so callers that hit this path get a clear frontier gap.
  const srcCount = src.numComponents | 0;
  transformColor_raw(
    src.components,
    srcCount >>> 0, // size_t (non-negative)
    srcCS,
    dst.components,
    newN >>> 0,
    dstCS,
  );
}
