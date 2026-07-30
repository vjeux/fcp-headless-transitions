// OZPreferenceManager — Ozone framework preferences singleton. This file
// contributes ONE method (getRenderingTechnology) and the opaque model of
// the RenderingTechnology value it returns. The class as a whole is a
// per-user preferences bag (see peer disasms in re/: getAudioMuted,
// getAutosave, getPlayMode, getRenderer, getGridColor, getViewMode,
// getSpellCheck, getOSCOptions, getDropAtTime, setRenderer, …). Those
// peers are transcribed as their own units when the dependency queue
// unlocks them; this file only lands what THIS unit strictly requires.
//
// The method @0x1597d0 is a plain member-accessor: it takes an sret
// destination pointer in %rdi and copies 44 bytes (offset 0x08..0x33 of
// `this`) out of the manager into it. No callees, no branches, no state
// reads from Objective-C (the *other* getters like getRenderer/getAutosave
// funnel through NSUserDefaults; this one returns a locally-cached copy of
// the resolved RenderingTechnology struct that lives at `this+0x08`).

// -----------------------------------------------------------------------------
// RenderingTechnology (returned struct, 44 bytes = 0x2C wide)
// -----------------------------------------------------------------------------
// Layout provenance is bounded: the ONLY thing @0x1597d0 tells us is the
// size and that it is bitwise-copyable. Nothing in this method distinguishes
// individual fields — they are three overlapping xmm reads/writes:
//
//   xmm0 <- src[0x08..0x17]  ;  xmm1 <- src[0x18..0x27]  ;  xmm2 <- src[0x24..0x33]
//   dst[0x00..0x0F] <- xmm0  ;  dst[0x10..0x1F] <- xmm1  ;  dst[0x1C..0x2B] <- xmm2
//
// That is the compiler's textbook lowering of `memcpy(dst, src+8, 44)` — a
// 3×16 unaligned copy with the last 16 bytes overlapping the previous 4 to
// stitch 32+16 into 44 without a scalar tail. So the SEMANTIC content of
// this method is exactly: "copy a 44-byte RenderingTechnology value out of
// the manager". Per Rule 5 we model the struct as an opaque 44-byte byte
// buffer until a decoded peer (setRenderingTechnology, or a consumer that
// reads specific fields) grounds the individual slots. Modelling it as an
// object with imaginary named fields would be Rule-1 fabrication.
export interface OZRenderingTechnology {
  // Exactly 44 raw bytes, bit-identical to the compiler's memcpy source.
  // Length is asserted at every read/write here; a mis-sized buffer would
  // silently corrupt the sret slot and hide the divergence downstream.
  bytes: Uint8Array; // length === 44
}

/**
 * OZPreferenceManager — opaque bag of preferences. Only the `renderingTechnology`
 * slot at offset +0x08 is accessed by THIS unit. All other slots stay
 * un-modelled here (each unlocks in its own file when its accessor is
 * ported: OZPreferenceManager.getAutosave.ts etc.).
 */
export interface OZPreferenceManager_Fields {
  // +0x08 : 44-byte RenderingTechnology, read as one memcpy by @0x1597d0.
  renderingTechnology_at0x08: OZRenderingTechnology;
}

/**
 * OZPreferenceManager::getRenderingTechnology()
 * @0x00000000001597d0  Ozone   mangled: __ZN19OZPreferenceManager22getRenderingTechnologyEv
 *
 * ABI: struct-return-by-value larger than two GPRs. Under the System V x86_64
 * C++ ABI the caller passes a HIDDEN sret pointer in %rdi and `this` lands in
 * %rsi. On entry:
 *   %rdi = out-ptr to a caller-owned 44-byte RenderingTechnology slot
 *   %rsi = &OZPreferenceManager (this)
 * The prologue captures %rdi into %rax so the return value is the sret ptr
 * (SysV requires the callee return the sret in %rax). Then 3 overlapping
 * 16-byte unaligned loads/stores copy 44 bytes.
 *
 * Disasm:
 *   pushq  %rbp                        # @0x1597d0
 *   movq   %rsp, %rbp                  # @0x1597d1
 *   movq   %rdi, %rax                  # @0x1597d4  return = sret out-ptr
 *   movups 0x08(%rsi), %xmm0           # @0x1597d7  load src[0x08..0x17]
 *   movups 0x18(%rsi), %xmm1           # @0x1597db  load src[0x18..0x27]
 *   movups 0x24(%rsi), %xmm2           # @0x1597df  load src[0x24..0x33]  (overlaps xmm1)
 *   movups %xmm2, 0x1c(%rdi)           # @0x1597e3  store dst[0x1c..0x2b]
 *   movups %xmm1, 0x10(%rdi)           # @0x1597e7  store dst[0x10..0x1f]
 *   movups %xmm0, (%rdi)               # @0x1597eb  store dst[0x00..0x0f]
 *   popq   %rbp                        # @0x1597ee
 *   retq                               # @0x1597ef
 *
 * Net effect: dst[0..44) := (this+0x08)[0..44). The three-xmm-overlap dance
 * is a compiler artifact, not a semantic reordering — the source bytes at
 * offsets 0x24..0x27 are written by BOTH the xmm2 store (as dst 0x1c..0x1f)
 * AND the xmm1 store (as dst 0x1c..0x1f). Because xmm1 is stored AFTER xmm2
 * (@0x1597e7 comes after @0x1597e3), the final bytes in dst[0x1c..0x1f]
 * are the xmm1 bytes (src 0x24..0x27 = end of xmm1) — which happen to be
 * the SAME 4 bytes xmm2 also wrote there. Faithful memcpy, no reordering.
 */
export function OZPreferenceManager_getRenderingTechnology(
  self: OZPreferenceManager_Fields,
  out: OZRenderingTechnology,
): OZRenderingTechnology {
  // Rule-5 model: reproduce the memcpy WITHOUT inventing byte semantics.
  // Assert the model invariants (source and dest both 44-byte buffers) so
  // a mis-sized caller gets a loud failure instead of silent truncation.
  const src = self.renderingTechnology_at0x08.bytes;
  if (src.length !== 44) {
    throw new Error(
      "OZPreferenceManager_getRenderingTechnology: source RenderingTechnology " +
        "at this+0x08 must be exactly 44 bytes (got " +
        src.length +
        "). @0x1597d0 reads xmm0/xmm1/xmm2 spanning src[0x08..0x33] — a " +
        "shorter buffer would read uninitialised memory in the binary.",
    );
  }
  if (out.bytes.length !== 44) {
    throw new Error(
      "OZPreferenceManager_getRenderingTechnology: sret out slot must be " +
        "exactly 44 bytes (got " +
        out.bytes.length +
        "). @0x1597d0 writes dst[0..0x2c) via xmm0/xmm1/xmm2 unaligned stores.",
    );
  }

  // Ordered store simulation, matching @0x1597d7..@0x1597eb literally.
  // Each `set` here mirrors ONE movups; the three-xmm overlap is preserved.
  //
  // NB: `src` is indexed from the START of the RenderingTechnology buffer
  // (byte 0 corresponds to `this+0x08`), so the disasm's "0x08(%rsi)" load
  // is at src offset 0, "0x18(%rsi)" is at src offset 0x10, "0x24(%rsi)"
  // is at src offset 0x1c.
  //
  //   xmm0 := src[0x00..0x10]          (movups 0x8(%rsi),  %xmm0)  # bytes 0..15
  const xmm0 = src.subarray(0x00, 0x10);
  //   xmm1 := src[0x10..0x20]          (movups 0x18(%rsi), %xmm1)  # bytes 16..31
  const xmm1 = src.subarray(0x10, 0x20);
  //   xmm2 := src[0x1c..0x2c]          (movups 0x24(%rsi), %xmm2)  # bytes 28..43 (overlaps xmm1)
  const xmm2 = src.subarray(0x1c, 0x2c);

  // Stores in binary order (matters for overlap; xmm1's store wins on
  // dst[0x10..0x1f] because it comes after xmm2's store):
  //
  //   1. movups %xmm2, 0x1c(%rdi)   -> dst[0x1c..0x2b]
  out.bytes.set(xmm2, 0x1c);
  //   2. movups %xmm1, 0x10(%rdi)   -> dst[0x10..0x1f]  (overwrites xmm2's dst[0x1c..0x1f])
  out.bytes.set(xmm1, 0x10);
  //   3. movups %xmm0, (%rdi)       -> dst[0x00..0x0f]
  out.bytes.set(xmm0, 0x00);

  // SysV: return %rax (which the prologue set to the sret out-ptr).
  return out;
}
