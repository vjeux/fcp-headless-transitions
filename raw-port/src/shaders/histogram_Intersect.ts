// @shader histogram_Intersect (Flexo)
//
// Compute kernel from Flexo's default.metallib (metallib offset 0x29f0 per
// the .ll header line `0x000000000029f0 -- histogram_Intersect:`).
//
// Source LLVM IR: raw-port/re/shaders/histogram_Intersect.ll
// Extracted from: Flexo.framework/Versions/A/Resources/default.metallib
// (via `bash raw-port/tools/shader_disasm.sh histogram_Intersect Flexo`)
//
// PURPOSE
// -------
// Per-bin three-way histogram intersect. The `histo` buffer is laid out as
// FOUR concatenated histograms of `num_bins` uint bins each; this kernel is
// dispatched with one thread per bin (gid = 0 .. num_bins-1) and writes the
// per-bin minimum of the first three histograms into the fourth slot:
//
//   bin[gid]:
//     h0 = histo[gid + 0*num_bins]
//     h1 = histo[gid + 1*num_bins]
//     h2 = histo[gid + 2*num_bins]
//     histo[gid + 3*num_bins] = min(h0, h1, h2)     (unsigned min)
//
// This is the standard "min-histogram" intersection used by video-scope
// analytics (e.g. computing what all three input videos share, per bin).
//
// AIR signature (from air.kernel metadata !15..!19):
//   define void @histogram_Intersect(
//     i32 %0,                                   ; air.thread_position_in_grid "gid"
//     %"struct.metal::_atomic" addrspace(1)* %1 ; air.buffer index 1, read_write, address_space 1 "histo"
//   )
//   with function constant  @_ZL8num_bins  (uint, initialized from air.fc_initializer,
//                                             see !21 -> @_Z8num_bins.MTL_FC_INIT_0_j).
//
// Struct `metal::_atomic` (from !20): 4-byte, 4-align, single uint field __s.
// So `metal::_atomic addrspace(1)* + i64 N` = `histo_uint_base + 4*N` bytes,
// which is `histo[N]` when we view the buffer as `uint32_t[]`.
//
// Function attributes: `no-nans-fp-math`, `no-infs-fp-math`,
// `no-signed-zeros-fp-math`, `unsafe-fp-math`, `approx-func-fp-math` — all
// float-relaxation flags; but this kernel has NO floating-point math (only
// i32 atomic loads/stores and one i32 unsigned min), so no relaxation applies.
//
// Atomic semantics (from the AIR intrinsic calls in the .ll):
//   air.atomic.global.load.i32(ptr, /*ordering=*/i32 0, /*scope=*/i32 2, /*volatile=*/i1 true)
//   air.atomic.global.store.i32(ptr, val, /*ordering=*/i32 0, /*scope=*/i32 2, /*volatile=*/i1 true)
//
//   ordering=0 is `metal::memory_order_relaxed` (per the Metal Shading
//   Language spec's enum ordering: relaxed=0, consume=1, acquire=2, ...).
//   scope=2 is device-scope (metal::memory_scope_device). Volatile is a
//   compiler-side barrier — no reordering with other memory ops on the same
//   thread. The three loads and one store therefore have NO cross-thread
//   sync guarantees other than atomicity of each individual 32-bit access.
//
// In this TS port we run the kernel on a plain host `Uint32Array`. There is
// no cross-thread contention here — the caller invokes the kernel once per
// bin sequentially — so atomicity degenerates to a plain load/store, and
// we model it that way. The port preserves the exact math and layout.
//
// IR line-by-line map (from the .ll body of @histogram_Intersect):
//   %3  = zext i32 %0 to i64                                   ; gid_i64 = (u64)gid
//   %4  = getelementptr inbounds ...atomic*, %1, i64 %3        ; p0 = &histo[gid + 0*num_bins]
//                                                                (%1 is the buffer base, so
//                                                                 p0 = base + gid)
//   %5  = load i32, addrspace(2)* @_ZL8num_bins, align 4       ; nb = num_bins
//   %6  = zext i32 %5 to i64                                   ; nb_i64
//   %7  = getelementptr inbounds ...atomic*, %4, i64 %6        ; p1 = p0 + nb        = &histo[gid + 1*nb]
//   %8  = shl i32 %5, 1                                        ; 2*nb (i32 shift)
//   %9  = zext i32 %8 to i64                                   ; (2*nb)_i64
//   %10 = getelementptr inbounds ...atomic*, %4, i64 %9        ; p2 = p0 + 2*nb      = &histo[gid + 2*nb]
//   %11 = mul i32 %5, 3                                        ; 3*nb (i32 mul)
//   %12 = zext i32 %11 to i64                                  ; (3*nb)_i64
//   %13 = getelementptr inbounds ...atomic*, %4, i64 %12       ; p3 = p0 + 3*nb      = &histo[gid + 3*nb]
//   %14 = getelementptr ...struct-field-0 of *p0               ; -> &p0->__s (the uint field)
//   %15 = call i32 @air.atomic.global.load.i32(%14, 0, 2, true); h0 = load p0
//   %16 = getelementptr ...struct-field-0 of *p1
//   %17 = call i32 @air.atomic.global.load.i32(%16, 0, 2, true); h1 = load p1
//   %18 = getelementptr ...struct-field-0 of *p2
//   %19 = call i32 @air.atomic.global.load.i32(%18, 0, 2, true); h2 = load p2
//   %20 = call i32 @air.min.u.i32(i32 %15, i32 %17)            ; m01 = umin(h0, h1)
//   %21 = call i32 @air.min.u.i32(i32 %20, i32 %19)            ; m012 = umin(m01, h2)
//   %22 = getelementptr ...struct-field-0 of *p3
//   call void @air.atomic.global.store.i32(%22, %21, 0, 2, true) ; store p3 = m012
//   ret void
//
// NOTES on the offset arithmetic (@0x%8-%13 vs @0x%11-%13):
//   - `shl i32 nb, 1` (line %8) is an i32 SHIFT with wrap-around at 2^32;
//     Metal `num_bins` is uint, so we mirror as `(nb << 1) >>> 0`.
//   - `mul i32 nb, 3` (line %11) is an i32 MUL, similarly wrap-around at 2^32;
//     we mirror as `Math.imul(nb, 3) >>> 0`. Realistic num_bins values are
//     small (e.g. 64 or 256), so no wrap occurs in practice.
//   - The `%4 + i64 %6` pointer arithmetic uses u64 additions (`zext` to i64
//     erases sign bits), so integer overflow is not a concern at the pointer
//     level for realistic bin counts.
//
// The `_GLOBAL__sub_I_FFVideoScopesShaders.metal` static-init function in the
// .ll (lines 15-17) copies the function-constant initializer
// @_Z8num_bins.MTL_FC_INIT_0_j into the shader-private @_ZL8num_bins global;
// in TS this is just "the caller passes num_bins as a parameter."
//
// The metallib name `FFVideoScopesShaders.metal` (visible in the static-init
// function's mangled name and TBAA metadata) identifies this as part of the
// Flexo Video Scopes suite — i.e. the underlying kernel for the histogram-
// intersection display when three videos are overlaid in the vectorscope /
// waveform / histogram scopes.

/**
 * TS translation of the AIR compute kernel `histogram_Intersect`.
 *
 * @param gid       The bin index (equivalent to `air.thread_position_in_grid`
 *                  in the AIR kernel). The caller should invoke this function
 *                  once per bin, for `gid` in `[0, num_bins)`.
 * @param histo     The histogram buffer viewed as `uint32[4 * num_bins]`. On
 *                  entry, the first three histograms (indices `0..num_bins`,
 *                  `num_bins..2*num_bins`, `2*num_bins..3*num_bins`) hold the
 *                  input histograms. On return, `histo[3*num_bins + gid]`
 *                  holds `min(histo[gid], histo[gid+num_bins], histo[gid+2*num_bins])`.
 * @param num_bins  The per-histogram bin count (Metal function constant
 *                  `num_bins`; see !21 in the .ll).
 *
 * @shader histogram_Intersect (Flexo)
 */
export function histogram_Intersect(
  gid: number,
  histo: Uint32Array,
  num_bins: number,
): void {
  // %3  = zext i32 %0 to i64
  // %4  = getelementptr ...atomic*, %1, i64 %3     -> p0 = base + gid
  const p0 = gid >>> 0;

  // %5  = load i32, ..., @_ZL8num_bins            -> nb = num_bins
  const nb = num_bins >>> 0;

  // %7  = getelementptr ...atomic*, %4, i64 (zext nb) -> p1 = p0 + nb
  const p1 = (p0 + nb) >>> 0;

  // %8  = shl i32 nb, 1                           -> 2*nb  (i32 shift)
  // %9  = zext i32 %8 to i64
  // %10 = getelementptr ...atomic*, %4, i64 %9    -> p2 = p0 + 2*nb
  const twoNb = (nb << 1) >>> 0;
  const p2 = (p0 + twoNb) >>> 0;

  // %11 = mul i32 nb, 3                           -> 3*nb  (i32 mul)
  // %12 = zext i32 %11 to i64
  // %13 = getelementptr ...atomic*, %4, i64 %12   -> p3 = p0 + 3*nb
  const threeNb = Math.imul(nb, 3) >>> 0;
  const p3 = (p0 + threeNb) >>> 0;

  // %14 = getelementptr ...struct-field-0 of *p0                (unit-strided; same uint32)
  // %15 = call @air.atomic.global.load.i32(%14, 0, 2, true)     -> h0
  //   ordering=0 (relaxed), scope=2 (device), volatile=true.
  //   Modeled as a plain load on the caller's Uint32Array; see the header
  //   comment on why single-thread invocation makes atomicity degenerate.
  const h0 = histo[p0];

  // %16..%17 -> h1
  const h1 = histo[p1];

  // %18..%19 -> h2
  const h2 = histo[p2];

  // %20 = call @air.min.u.i32(%15, %17)          -> m01 = umin(h0, h1)
  // %21 = call @air.min.u.i32(%20, %19)          -> m012 = umin(m01, h2)
  //   `air.min.u.i32` is UNSIGNED min. All inputs come from Uint32Array
  //   reads (already unsigned), so plain Math.min is bit-exact for these
  //   values. We use a fold with `Math.min` on two operands at a time to
  //   preserve the IR's exact reduction order (h0,h1 then result,h2).
  const m01 = Math.min(h0, h1);
  const m012 = Math.min(m01, h2);

  // %22 = getelementptr ...struct-field-0 of *p3
  // call @air.atomic.global.store.i32(%22, %21, 0, 2, true)
  //   Store the intersected value into the fourth histogram slot.
  histo[p3] = m012 >>> 0;

  // ret void
}
