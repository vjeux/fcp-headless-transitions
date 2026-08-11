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

// -----------------------------------------------------------------------------
// previewBGColor — file-static NSColor* backing store
// -----------------------------------------------------------------------------
// The two accessors below (`getPreviewBackgroundColor()` @0x154310 and the
// sret template variant @0x154320) BOTH load the exact same rip-relative
// slot: `movq __ZL14previewBGColor(%rip), %r??`. That slot is a static
// pointer to an `NSColor` (see the ObjC msgSend siblings
// `+[LKColor ozDefaultPreviewBackgroundColor]` etc. and the setter
// `__ZN19OZPreferenceManager25setPreviewBackgroundColorEP7NSColor` @0x1543f0
// which writes this slot from an `NSColor*` argument).
//
// Under the port scope this is an out-of-scope ObjC/Foundation object —
// modelled as an opaque handle. The `Ev` getter is a pure pointer read: it
// returns whatever was last stored (or NULL if never set, matching the C++
// zero-init of a file-static `NSColor*`).
//
// Provenance:
//   otool -tv -p __ZN19OZPreferenceManager25getPreviewBackgroundColorEv Ozone
//     @0x154310  pushq  %rbp
//     @0x154311  movq   %rsp, %rbp
//     @0x154314  movq   0x7e90bd(%rip), %rax   # rax = *(&previewBGColor)
//     @0x15431b  popq   %rbp
//     @0x15431c  retq
//   nm -m Ozone | grep previewBackgroundColor
//     __ZN19OZPreferenceManager25getPreviewBackgroundColorEv  (@0x12bf7c export)
//   nm -m Ozone | grep previewBGColor  (from --sym disasm run)
//     __ZL14previewBGColor  (static; internal-linkage — the `L` in `_ZL`).
//
// The slot's ADDRESS resolves as: rip-at-next-instruction (0x15431b) +
// 0x7e90bd = 0x9433d8. It is the target of setPreviewBackgroundColor's
// `movq %rbx, 0x7e90..(%rip)` after retaining the NSColor argument.
//
// Faithful model: a module-scope mutable box holding the current pointer.
// Reads return it verbatim; writes (setter — a separate unit) will replace
// it. NULL sentinel = "never set" (== the linker-zeroed BSS slot).

/** Opaque NSColor* handle. Foundation object, out of port scope. */
export type NSColorHandle = unknown;

/**
 * previewBGColor — the ONLY external side of `__ZL14previewBGColor`.
 * Module-scope mutable pointer, initially NULL (BSS-zero). The setter
 * (`OZPreferenceManager::setPreviewBackgroundColor` @0x1543f0, a separate
 * unit) is the sole writer; the two getters (this file) are the sole
 * readers. Guarded through the two exported helpers below so tests can
 * install a value without importing this module's internal state.
 */
let previewBGColor: NSColorHandle | null = null;

/**
 * Test/boundary hook: install the current previewBGColor slot value.
 * Mirrors what `OZPreferenceManager::setPreviewBackgroundColor` @0x1543f0
 * ultimately does to the same rip slot (that unit is not ported here — it
 * involves an ObjC `retain` + release cycle around the store). We expose a
 * plain setter so peers/tests can seed the slot without depending on the
 * still-unported setter.
 *
 * NOT a port of a real FCP symbol — it is the module-visibility hatch onto
 * the static storage that BOTH getters read. Keep it minimal.
 */
export function __setPreviewBGColorSlot(v: NSColorHandle | null): void {
  previewBGColor = v;
}

/**
 * OZPreferenceManager::getPreviewBackgroundColor()
 * @0x0000000000154310  Ozone  mangled: __ZN19OZPreferenceManager25getPreviewBackgroundColorEv
 *
 * Pure static-pointer accessor. Loads the file-static `previewBGColor`
 * (an `NSColor*`, out-of-scope Foundation object modelled as an opaque
 * handle) and returns it. Ignores `this` entirely — the manager singleton
 * is not read, matching the disasm's absence of any `%rdi` use.
 *
 * Disasm (verbatim; see raw-port/re/disasm/…getPreviewBackgroundColorEv.s):
 *   pushq  %rbp                              # @0x154310
 *   movq   %rsp, %rbp                        # @0x154311
 *   movq   __ZL14previewBGColor(%rip), %rax  # @0x154314  rax = *(&previewBGColor)
 *   popq   %rbp                              # @0x15431b
 *   retq                                     # @0x15431c
 *
 * Net effect: return the current value of the static NSColor* slot.
 * No `this` dereference, no callees, no branches.
 *
 * NB: peer accessor at @0x154320 (the `ER` sret template variant) loads the
 * SAME slot and hands it to `PCManagedColorTemplate::operator=(NSColor*)`
 * — that call chain is a separate unit. This file only ports the `Ev` form.
 */
export function OZPreferenceManager_getPreviewBackgroundColor(
  _self: OZPreferenceManager_Fields,
): NSColorHandle | null {
  // @0x154314 : movq __ZL14previewBGColor(%rip), %rax
  // Reads the static slot verbatim. `_self` (rdi in the ABI) is never
  // touched by the disasm — the prologue's push/mov and epilogue's pop
  // don't count as reads. Faithful transcription: return the slot.
  return previewBGColor;
}

/**
 * guidesColor — the ONLY external side of `__ZL11guidesColor`.
 *
 * `nm -m -arch x86_64 Ozone` reports
 * `000000000093d3e8 (__DATA,__bss) non-external __ZL11guidesColor` — a
 * FILE-STATIC (`_ZL` = internal linkage) `NSColor*` living in BSS, so its
 * initial value is NULL exactly like the `previewBGColor` slot above. The sole
 * writer is `OZPreferenceManager::setGuidesColor(NSColor*)` @0x154d20 (a
 * separate ledger unit, not ported here — like the preview-background setter it
 * wraps the store in an ObjC retain/release cycle); the readers are
 * `getGuidesColor()` @0x154cf0 (ported below) and the sret template variant
 * `getGuidesColor(PCManagedColorTemplate<0>&)` @0x154d00 (its own unit).
 *
 * The sibling slot `__ZL16smartGuidesColor` @0x93d3f0 — eight bytes higher,
 * read by `getSmartGuidesColor()` @0x154db0 — is a DIFFERENT static and is not
 * modelled here.
 */
let guidesColor: NSColorHandle | null = null;

/**
 * Test/boundary hook: install the current guidesColor slot value.
 *
 * Mirrors what `OZPreferenceManager::setGuidesColor(NSColor*)` @0x154d20 does
 * to the same rip slot (that unit is not ported here). NOT a port of a real FCP
 * symbol — it is the module-visibility hatch onto the static storage the getter
 * reads, the exact counterpart of `__setPreviewBGColorSlot` above.
 */
export function __setGuidesColorSlot(v: NSColorHandle | null): void {
  guidesColor = v;
}

/**
 * `OZPreferenceManager::getGuidesColor()`
 * @0x0000000000154cf0  Ozone  mangled: __ZN19OZPreferenceManager14getGuidesColorEv
 *
 * Pure static-pointer accessor — the exact twin of
 * `getPreviewBackgroundColor()` @0x154310 above, reading `__ZL11guidesColor`
 * (@0x93d3e8) instead of `__ZL14previewBGColor`.
 *
 * Disasm (verbatim; raw-port/re/disasm/__ZN19OZPreferenceManager14getGuidesColorEv.s,
 * 6 lines):
 *   pushq  %rbp                           # @0x154cf0
 *   movq   %rsp, %rbp                     # @0x154cf1
 *   movq   __ZL11guidesColor(%rip), %rax  # @0x154cf4  rax = *(&guidesColor)
 *   popq   %rbp                           # @0x154cfb
 *   retq                                  # @0x154cfc
 *   nopl   (%rax)                         # @0x154cfd  padding, not executed
 *
 * Net effect: return the current value of the static `NSColor*` slot. `this`
 * (%rdi) is never touched — the manager singleton is not read — there is no
 * branch, no retain/autorelease, and no callee of any kind (`depgraph.py deps`
 * lists nothing). The pointer is returned RAW, NULL included.
 *
 * NB: the peer accessor @0x154d00 (the `ER` sret template variant) loads the
 * SAME slot and hands it to `PCManagedColorTemplate::operator=(NSColor*)` —
 * that call chain is a separate unit. This file ports only the `Ev` form.
 */
export function OZPreferenceManager_getGuidesColor(
  _self: OZPreferenceManager_Fields,
): NSColorHandle | null {
  // @0x154cf4 : movq __ZL11guidesColor(%rip), %rax — reads the static slot
  // verbatim. `_self` (rdi) is never dereferenced by the disasm.
  return guidesColor;
}

/**
 * smartGuidesColor — the ONLY external side of `__ZL16smartGuidesColor`.
 *
 * `nm -m -arch x86_64 Ozone` reports
 * `000000000093d3f0 (__DATA,__bss) non-external __ZL16smartGuidesColor` — the
 * slot EIGHT BYTES above `__ZL11guidesColor` @0x93d3e8, a separate file-static
 * (`_ZL` = internal linkage) `NSColor*` in BSS, hence NULL-initialised. Sole
 * writer: `OZPreferenceManager::setSmartGuidesColor(NSColor*)` @0x154de0 (a
 * separate ledger unit); readers: `getSmartGuidesColor()` @0x154db0 (ported
 * below) and the sret template variant @0x154dc0 (its own unit).
 */
let smartGuidesColor: NSColorHandle | null = null;

/**
 * Test/boundary hook: install the current smartGuidesColor slot value.
 *
 * Mirrors what `OZPreferenceManager::setSmartGuidesColor(NSColor*)` @0x154de0
 * does to the same rip slot (that unit is not ported here). NOT a port of a
 * real FCP symbol — the module-visibility hatch onto the static storage, the
 * exact counterpart of `__setGuidesColorSlot` / `__setPreviewBGColorSlot`.
 */
export function __setSmartGuidesColorSlot(v: NSColorHandle | null): void {
  smartGuidesColor = v;
}

/**
 * `OZPreferenceManager::getSmartGuidesColor()`
 * @0x0000000000154db0  Ozone  mangled: __ZN19OZPreferenceManager19getSmartGuidesColorEv
 *
 * Pure static-pointer accessor — the twin of `getGuidesColor()` @0x154cf0
 * above, reading `__ZL16smartGuidesColor` (@0x93d3f0) instead of
 * `__ZL11guidesColor` (@0x93d3e8). Identical five-instruction shape.
 *
 * Disasm (verbatim; raw-port/re/disasm/__ZN19OZPreferenceManager19getSmartGuidesColorEv.s,
 * 6 lines):
 *   pushq  %rbp                                # @0x154db0
 *   movq   %rsp, %rbp                          # @0x154db1
 *   movq   __ZL16smartGuidesColor(%rip), %rax  # @0x154db4  rax = *(&smartGuidesColor)
 *   popq   %rbp                                # @0x154dbb
 *   retq                                       # @0x154dbc
 *   nopl   (%rax)                              # @0x154dbd  padding, not executed
 *
 * Net effect: return the current value of the static `NSColor*` slot. `this`
 * (%rdi) is never touched, no branch, no retain/autorelease, zero callees
 * (`depgraph.py deps` lists nothing). The pointer is returned RAW, NULL
 * included.
 *
 * Only the `Ev` form is ported; the sret variant @0x154dc0 (which hands the
 * same slot to `PCManagedColorTemplate::operator=(NSColor*)`) is a separate
 * unit.
 */
export function OZPreferenceManager_getSmartGuidesColor(
  _self: OZPreferenceManager_Fields,
): NSColorHandle | null {
  // @0x154db4 : movq __ZL16smartGuidesColor(%rip), %rax — reads the static
  // slot verbatim. `_self` (rdi) is never dereferenced by the disasm.
  return smartGuidesColor;
}
