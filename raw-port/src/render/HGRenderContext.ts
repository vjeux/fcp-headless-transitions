// raw-port/src/render/HGRenderContext.ts
//
// FCP `HGRenderContext` — Helium's per-compute-device render context (the object an
// HGRenderQueue hands to each HGRenderExecUnit; created by
// HGRenderQueue::CreateRenderContextForComputeDevice @Helium 0x61c90).
//
// Framework binary: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//                   Versions/A/Helium (macOS FCP, x86_64 slice; VA == offset in the thin slice).
//
// THIS FILE PORTS ONE METHOD (one C++ method = one exported function citing its @0xADDR):
//
//   @Helium 0x31290  HGRenderContext::IsGPU() const
//                    mangled: __ZNK15HGRenderContext5IsGPUEv
//                    DECODE:  raw-port/re/disasm/Helium.__ZNK15HGRenderContext5IsGPUEv.s
//
// The class's other exported members (Lock @0x311f0, Unlock @0x31240, IsCPU @0x31280,
// IsGL @0x312a0, PauseRendering @0x312b0, RestartRendering @0x312e0,
// SetIntermediateBufferFormat @0x31300, SetDefaultFilteringMode @0x31370,
// SetRenderGraphDumpLevel @0x313e0, SetWorkMode @0x31450, GetType @0x31460,
// GetComputeDevice @0x31470, GetComputeDeviceIndex @0x31480, GetWorkMode @0x31490,
// GetState @0x314a0, GetRenderer @0x314b0, GetIntermediateBufferFormat @0x314c0,
// GetDefaultFilteringMode @0x314d0, PushRenderTime @0x314e0, SetRenderStatsFlag @0x31630,
// SetRenderStatsWarmup @0x31640, SetRenderStatsMaxVals @0x31650, GetRenderStats @0x31660,
// DumpHistogram @0x31950, ClearStats @0x31d60, the ctors @0x30ef0 / @0x31010 and the dtors
// @0x31150 / @0x3c1580 / @0x3c1590) are NOT ported here — this file is ADD-ONLY and each of
// those methods lands as its own exported function when its unit is claimed.
//
// ── FIELD-LAYOUT EVIDENCE USED BY THIS METHOD ───────────────────────────────────────────
//   +0x24  int32  contextType   — the device-class discriminator. It is the ONLY field this
//                                 method touches (`cmpl $0x1, 0x24(%rdi)` @Helium 0x31294).
//
//   The three sibling predicates prove the encoding of that field exhaustively; all three are
//   the identical `cmpl $<k>, 0x24(%rdi) ; sete %al` shape, differing only in the immediate:
//     HGRenderContext::IsCPU() const @Helium 0x31280 → `cmpl $0x0, 0x24(%rdi)` @0x31284  ⇒ 0 = CPU
//     HGRenderContext::IsGPU() const @Helium 0x31290 → `cmpl $0x1, 0x24(%rdi)` @0x31294  ⇒ 1 = GPU
//     HGRenderContext::IsGL()  const @Helium 0x312a0 → `cmpl $0x2, 0x24(%rdi)` @0x312a4  ⇒ 2 = GL
//   and HGRenderContext::GetType() @Helium 0x31460 returns that same slot verbatim
//   (`movl 0x24(%rdi), %eax` @0x31464) as a 32-bit value — i.e. +0x24 is a plain int enum, and
//   IsGPU is an EQUALITY test against the GPU code, not a bit test.
//
//   Default value: the default ctor HGRenderContext::HGRenderContext() @Helium 0x30ef0 stores
//   `movq $0x1, 0x20(%rbx)` @0x30f48 — an 8-byte store covering BOTH the u32 at +0x20 (the
//   `state` slot returned by GetState @0x314a4) and the u32 at +0x24, leaving
//   state = 1 and contextType = 0 (= CPU) on a freshly constructed context. That store is what
//   fixes +0x24 as a 32-bit field at that exact offset (the next field written is +0x28,
//   `movl $0x2, 0x28(%rbx)` @0x30f50).
//
// NUMERICS: the compare is a 32-bit integer compare (`cmpl`) against the immediate 1; no
// floating point, no widening. `sete %al` writes the low byte only, which is exactly a C++
// `bool` return under the SysV ABI — so the TS return type is `boolean`.

/**
 * The subset of the `HGRenderContext` object layout that
 * {@link hgRenderContext_IsGPU} reads. Modelled as an explicit fields record (rather than a
 * class) because only one method of the class is transcribed so far: the remaining ~0x88 bytes
 * of the object (see the ctor @Helium 0x30ef0, whose last write is
 * `movq $0x186a0, 0x68(%rbx)` @0x30fbb, over an `operator new` of a 0x88-byte
 * HGSynchronizable at +0x38) are not decoded by this unit and are deliberately not invented
 * here. Sibling methods extend this record as they land.
 */
export interface HGRenderContextTypeField {
  /**
   * `+0x24  int32 contextType` — device-class discriminator.
   *   0 = CPU (HGRenderContext::IsCPU @Helium 0x31284)
   *   1 = GPU (HGRenderContext::IsGPU @Helium 0x31294)
   *   2 = GL  (HGRenderContext::IsGL  @Helium 0x312a4)
   * Returned verbatim by HGRenderContext::GetType() @Helium 0x31464.
   */
  contextType: number;
}

/**
 * `HGRenderContext::IsGPU() const` @Helium 0x31290
 * (mangled `__ZNK15HGRenderContext5IsGPUEv`).
 *
 * Full body — every instruction of the function, in order
 * (raw-port/re/disasm/Helium.__ZNK15HGRenderContext5IsGPUEv.s):
 *
 *   0x31290  pushq %rbp                   ; frame setup (no TS counterpart)
 *   0x31291  movq  %rsp, %rbp             ; frame setup (no TS counterpart)
 *   0x31294  cmpl  $0x1, 0x24(%rdi)       ; flags on (this->contextType - 1)
 *   0x31298  sete  %al                    ; al = (ZF == 1) = (contextType == 1)
 *   0x3129b  popq  %rbp                   ; frame teardown (no TS counterpart)
 *   0x3129c  retq                         ; return al as bool
 *   0x3129d  nopl  (%rax)                 ; inter-function alignment padding, not executed
 *
 * AT&T decode note (PORTING_SPEC Rule 4 cheat-sheet): `cmpl $0x1, 0x24(%rdi)` computes
 * `dst - src` = `contextType - 1`, and `sete` is the ZF=1 condition, i.e. exactly
 * `contextType == 1`. There is no `ja/jb` ordering involved, so no signedness question arises.
 *
 * @param self the receiver (`%rdi`); only `+0x24` is read.
 * @returns `true` iff this context's type code is 1 (GPU).
 */
export function hgRenderContext_IsGPU(self: HGRenderContextTypeField): boolean {
  // @Helium 0x31294: cmpl $0x1, 0x24(%rdi)
  // @Helium 0x31298: sete %al
  return (self.contextType | 0) === 1;
}
