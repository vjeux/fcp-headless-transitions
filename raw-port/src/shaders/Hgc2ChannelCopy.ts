// @shader Hgc2ChannelCopy (Helium) @0x14a6
// Transcribed from Helium.framework/Versions/A/Resources/
// HeliumFiltersHgcMetalShaders_derived.metallib (function offset 0x14a6).
// IR: raw-port/re/shaders/Hgc2ChannelCopy.ll (79 lines).
//
// Two-input channel-copy fragment shader.  Given two source textures A/B
// with their own UV inputs (texcoord0, texcoord1), it fetches one texel
// from each (with a half-pixel-center offset produced by fast_floor+0.5,
// i.e. nearest-neighbour sampling snapped to the pixel-centre grid), and
// picks per-lane which of the two RGBA values to output based on a
// per-channel MASK read from a uniform buffer:
//
//   mask = params.rgba   (uniform buffer at binding 7, i.e. `<4 x float>`)
//   perLane(i): mask.i > 0 ? texelB.i : texelA.i
//
// So a mask channel > 0 selects texture1, otherwise texture0 — for each
// of R/G/B/A independently.  Common use: mixing "which source contributes
// this channel" for mattes / channel-swap operations.
//
// GATE NOTE: fast-math (reassoc/afn/no-signed-zeros/unsafe-fp-math);
// plain JS float ops with Math.fround at fp32 boundaries.  No pow / no
// fp32-narrowed double literals — the only numeric literal in the IR is
// the exact fp32 value 0.5 in `<0.5, 0.5>` used for the pixel-centre bias.

/**
 * A sample callback for texture reads.  The Metal shader samples through
 * a caller-supplied sampler (linear/clamp per Helium's usual filter setup);
 * from the JS port's perspective it's a UV → RGBA function.
 * @shader Hgc2ChannelCopy (Helium) IR %13/%18
 */
export type TextureSample2D = (uv: [number, number]) => [number, number, number, number];

/**
 * Hgc2ChannelCopy — per-channel mux between two textures.
 *
 * Signature (from .ll):
 *   (%0 vec4 position,       air.position (unused in body)
 *    %1 vec4 texcoord0,      per-vertex UV for texture0
 *    %2 vec4 texcoord1,      per-vertex UV for texture1
 *    %3 texture2d texture0,
 *    %4 texture2d texture1,
 *    %5 sampler sampler0,
 *    %6 sampler sampler1,
 *    %7 vec4* params buffer)  → mask
 *
 * Body:
 *   %9    : load params.rgba mask                                (float4)
 *   %10   : uv0 = texcoord0.xy                                   (shufflevector)
 *   %11   : uv0Floor = fast_floor(uv0)                           (v2 lane-parallel)
 *   %12   : uv0Snap  = uv0Floor + <0.5, 0.5>                     (pixel-centre)
 *   %13   : texelA = sample(texture0, sampler0, uv0Snap)         (rgba+i8 residency)
 *   %14   : texelA = extractvalue lane 0                         (drop residency)
 *   %15..%17: same recipe for texcoord1/texture1 → texelB
 *   %18   : texelB
 *   %19   : mask > 0 (per lane)                                  (fcmp ogt)
 *   %20/%21: select per lane: mask>0 ? texelB : texelA
 *   ret   : blended vec4
 *
 * @shader Hgc2ChannelCopy (Helium) IR %9..%21
 */
export function Hgc2ChannelCopy(
  _position: [number, number, number, number],
  texcoord0: [number, number, number, number],
  texcoord1: [number, number, number, number],
  sampleTexture0: TextureSample2D,
  sampleTexture1: TextureSample2D,
  params: [number, number, number, number],
): [number, number, number, number] {
  // %9 : mask uniform buffer read.
  const mask = params;

  // %10..%12 : snap UV for texture0 to nearest pixel-centre.
  const uv0x = Math.fround(texcoord0[0]);
  const uv0y = Math.fround(texcoord0[1]);
  const uv0Snap: [number, number] = [
    Math.fround(Math.floor(uv0x) + 0.5),
    Math.fround(Math.floor(uv0y) + 0.5),
  ];
  // %13..%14 : sample texture0; drop residency i8 lane.
  const texelA = sampleTexture0(uv0Snap);

  // %15..%17 : same recipe for texture1.
  const uv1x = Math.fround(texcoord1[0]);
  const uv1y = Math.fround(texcoord1[1]);
  const uv1Snap: [number, number] = [
    Math.fround(Math.floor(uv1x) + 0.5),
    Math.fround(Math.floor(uv1y) + 0.5),
  ];
  // %18 : sample texture1.
  const texelB = sampleTexture1(uv1Snap);

  // %19..%21 : per-lane select on mask > 0.
  //   The .ll uses `fcmp fast ogt <4 x float> %9, zeroinitializer`, i.e.
  //   an ordered-greater-than-zero test per channel.  `fast` means
  //   NaN-behaviour is unspecified; we mirror ogt (returns false for NaN,
  //   which is JavaScript's default > semantic).
  const r = mask[0] > 0 ? texelB[0] : texelA[0];
  const g = mask[1] > 0 ? texelB[1] : texelA[1];
  const b = mask[2] > 0 ? texelB[2] : texelA[2];
  const a = mask[3] > 0 ? texelB[3] : texelA[3];
  return [Math.fround(r), Math.fround(g), Math.fround(b), Math.fround(a)];
}

// ════════════════════════════════════════════════════════════════════════════════════════════════
// HOST SIDE — the C++ class `Hgc2ChannelCopy` (Helium), which owns the uniform buffer the shader
// above reads. The file already carries the GPU half (the metallib function @0x14a6); this section
// carries methods of the same-named C++ node, added one ledger unit at a time. They live together
// because they ARE one thing: `GetParameterBuffer` below returns the address of the very `params`
// float4 the shader takes as its mask, and `check_duplicate_classes.py` would (correctly) reject a
// second file with this basename.
//
// Provenance (Helium framework, x86_64 slice of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium):
//
//   @0x2dc1e0  Hgc2ChannelCopy::GetParameterBuffer(int)
//                __ZN15Hgc2ChannelCopy18GetParameterBufferEi                 (nm class `T`)
//
// Disassembly (regenerate with
//   `bash raw-port/tools/disasm.sh --sym __ZN15Hgc2ChannelCopy18GetParameterBufferEi Helium`):
//   raw-port/re/disasm/Helium.__ZN15Hgc2ChannelCopy18GetParameterBufferEi.s (8 instructions)
//
// The class's other members are each their own ledger unit and are NOT ported here (one class =
// one file; G6 add-only). From the inventory, all `T`: C2 @0x2dbfb0, C1 @0x2dc010, D2 @0x2dc070,
// D1 @0x2dc080, D0 @0x2dc090, SetParams @0x2dc0e0, GetParameter @0x2dc130,
// SetParameter @0x2dc180, GetParameterName @0x2dc1b0, GetParameterCount @0x2dc1d0,
// BindParamBufferDesc @0x2dc200, Bind @0x2dc430, BindTexture @0x2dc470, GetROI @0x2dc4e0,
// GetDOD @0x2dc560, PrepareMetalHandler @0x2dc590.
//
// LAYOUT, everything this unit can ground, with where each fact comes from:
//   +0x1a0  float32[4]  paramBuffer — the shader's `params` mask. THIS unit proves only that
//           something lives at +0x1a0 and that the node hands out its address; the SIZE and TYPE
//           come from two siblings read (not ported) while grounding it:
//             * `GetParameterCount()` @0x2dc1d0 is `movl $0x1,%eax ; retq` — exactly ONE parameter
//               buffer exists, which is why index 0 is the only accepted index below;
//             * `SetParams(float4 const*, size_t)` @0x2dc0e0 REFUSES any size other than 0x10
//               (`cmpq $0x10,%rdx ; setne`) and writes with a 16-byte `movaps` to `0x1a0(%rdi)`,
//               so the slot is exactly 16 bytes and 16-byte aligned — a float4, matching the
//               `<4 x float>` the shader above binds at buffer 7.

/**
 * The part of an `Hgc2ChannelCopy` NODE (the C++ object, not the shader) that this file grounds.
 * Deliberately minimal: one field, at the one offset the transcribed body computes an address for.
 */
export interface Hgc2ChannelCopyNodeState {
  /**
   * +0x1a0, 16 bytes — the per-channel mask uniform. Held as the 4-tuple the shader consumes; the
   * shader's `params` argument is a reference to THIS array, which is what makes the pointer
   * return below meaningful rather than decorative.
   */
  paramBufferAt1a0: [number, number, number, number];
}

/**
 * `Hgc2ChannelCopy::GetParameterBuffer(int index)` — @Helium 0x2dc1e0
 *   `__ZN15Hgc2ChannelCopy18GetParameterBufferEi`
 *
 * FULL transcription of the 8-instruction body:
 *
 *   0x2dc1e0  55                    pushq  %rbp             ; prologue (no TS counterpart)
 *   0x2dc1e1  48 89 e5              movq   %rsp, %rbp       ; prologue (no TS counterpart)
 *   0x2dc1e4  48 8d 8f a0 01 00 00  leaq   0x1a0(%rdi),%rcx ; rcx = &this->paramBuffer  (+0x1a0)
 *   0x2dc1eb  31 c0                 xorl   %eax, %eax       ; rax = nullptr  — the DEFAULT answer
 *   0x2dc1ed  85 f6                 testl  %esi, %esi       ; index == 0 ?  (32-bit test)
 *   0x2dc1ef  48 0f 44 c1           cmoveq %rcx, %rax       ; if so, rax = that address
 *   0x2dc1f3  5d                    popq   %rbp             ; epilogue
 *   0x2dc1f4  c3                    retq                    ; -> &paramBuffer, or nullptr
 *
 * `return index == 0 ? &this->paramBuffer : nullptr;` — and three details of the shape are load
 * bearing:
 *
 * 1. `leaq`, NOT a load: the address is COMPUTED, and the buffer is INLINE in the object rather
 *    than pointed to by it. The method never reads or writes memory at all — the receiver is only
 *    ever an address to add to. So a caller gets an INTERIOR POINTER and writes through it land in
 *    the node. This is the case where returning a REFERENCE is the faithful port: modelling it as
 *    a copy would be the defect, the mirror image of the by-value CMTime getters in
 *    `channels/OZChannel.ts`, where the machine copies into the caller's sret slot and returning
 *    the source object is what a reviewer rejected. The disassembly says which is which, both
 *    times.
 * 2. `cmov`, not a branch: both the null and the address are materialised unconditionally and one
 *    is selected. Behaviourally identical to a branch here (no memory is touched on either side,
 *    so there is nothing to fault), and worth naming only because the port's `? :` looks like a
 *    branch and the machine's is not.
 * 3. `testl` is 32-BIT, and `int` is the declared parameter type. Only index 0 yields the buffer;
 *    every other index — including negative — yields nullptr, which pairs with
 *    `GetParameterCount()` @0x2dc1d0 answering exactly 1.
 *
 * ZERO callees: no call, no extern, no indirect and no virtual dispatch
 * (`depgraph.py deps __ZN15Hgc2ChannelCopy18GetParameterBufferEi` lists nothing).
 *
 * ORACLE — EXECUTED against live FCP, not read:
 * `raw-port/re/oracle/Hgc2ChannelCopy_GetParameterBuffer_oracle.py`, with THIS FILE run by
 * `raw-port/re/oracle/Hgc2ChannelCopy_GetParameterBuffer_driver.mts` under
 * `node --experimental-strip-types` — this module imports nothing, so the driver loads it as
 * committed with no hook and nothing stubbed. The symbol is exported, so `dlsym` reaches it, and
 * the address is cross-checked against `slide + 0x2dc1e0` from the x86_64 inventory with the 21
 * body bytes verified before the first call, under `arch -x86_64`.
 *
 * The live side returns a POINTER, so the comparison is: does it equal `arena + 0x1a0` exactly, and
 * does the TypeScript hand back the same object identity (`===` the state's own array) in the same
 * cases? MEASURED (2026-08-11): index 0 -> `arena+0x1a0` on both sides; indices -1, 1, 2, 7 and
 * INT32_MAX -> null on both sides; 0 of 6 calls modified any byte of the 0xCD-poisoned receiver;
 * and writing through the returned pointer changed the arena at exactly +0x1a0..+0x1af, which is
 * the positive proof that the pointer is interior and live rather than merely non-null. Mutants
 * (real copies of this file, one token changed), with the reason each count is what it is — every
 * one of them is bounded by how many of the six indices can possibly disagree:
 *   M0  unmutated baseline ............................. killed 0 of 6
 *   M1  return the buffer for EVERY index .............. killed 5 of 6  (index 0 agrees)
 *   M2  return a COPY instead of the array ............. killed 1 of 6  (only index 0 returns a
 *       handle at all; its four values are identical, so the identity column is the only thing
 *       that catches it — which is the reason that column exists)
 *   M3  accept index 1 instead of index 0 .............. killed 2 of 6  (0 and 1 swap answers;
 *       the other four indices are null either way)
 *
 * @Helium 0x2dc1e0
 */
export function Hgc2ChannelCopy_GetParameterBuffer(
  self: Hgc2ChannelCopyNodeState,
  index: number,
): [number, number, number, number] | null {
  // @0x2dc1e4  leaq 0x1a0(%rdi),%rcx — the address of the inline buffer; nothing is dereferenced.
  // @0x2dc1eb  xorl %eax,%eax        — nullptr is the default.
  // @0x2dc1ed-0x2dc1ef  testl %esi,%esi ; cmoveq %rcx,%rax — index 0 selects the address.
  //   The array is returned BY REFERENCE, because the machine returns an interior pointer: a
  //   caller writing through it must reach this node's own storage.
  return (index | 0) === 0 ? self.paramBufferAt1a0 : null;
}
