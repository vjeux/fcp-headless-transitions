// PainterPipelineStatesForDeviceAndMTLPixelFormat.ts — Flexo framework
// class that manages a fixed set of Metal (MTLRenderPipelineState) objects
// for a given MTLDevice + MTLPixelFormat pair used by the Painter subsystem.
// Five exported symbols:
//
//   @0x0000000000d67400  __ZN47PainterPipelineStatesForDeviceAndMTLPixelFormatC2E...
//                        PainterPipelineStatesForDeviceAndMTLPixelFormat::
//                        PainterPipelineStatesForDeviceAndMTLPixelFormat(id<MTLDevice>,
//                        MTLPixelFormat, id<MTLLibrary>)   (C2 — real ctor body,
//                        547 lines)
//   @0x0000000000d68000  __ZN47PainterPipelineStatesForDeviceAndMTLPixelFormatC1E...
//                        Same signature, C1 — pure `jmp` thunk to C2 @0xd68005.
//   @0x0000000000d68010  __ZN47PainterPipelineStatesForDeviceAndMTLPixelFormatD2Ev
//                        ::~PainterPipelineStatesForDeviceAndMTLPixelFormat()  (D2)
//   @0x0000000000d680c0  __ZN47PainterPipelineStatesForDeviceAndMTLPixelFormatD1Ev
//                        Same, D1 — pure `jmp` thunk to D2 @0xd680c5.
//   @0x0000000000d680d0  __ZN47PainterPipelineStatesForDeviceAndMTLPixelFormat26getForZebraStripeTexturingEi
//                        getForZebraStripeTexturing(int)
//
// Source disassembly files:
//   raw-port/re/disasm/Flexo.PainterPipelineStatesForDeviceAndMTLPixelFormat.PainterPipelineStatesForDeviceAndMTLPixelFormat.s (C1 thunk, 6 lines)
//   raw-port/re/disasm/Flexo.PainterPipelineStatesForDeviceAndMTLPixelFormat.C2.s   (C2, 547 lines)
//   raw-port/re/disasm/Flexo.PainterPipelineStatesForDeviceAndMTLPixelFormat.~PainterPipelineStatesForDeviceAndMTLPixelFormat.s (D1 thunk, 6 lines)
//   raw-port/re/disasm/Flexo.PainterPipelineStatesForDeviceAndMTLPixelFormat.D2.s   (D2, 41 lines)
//   raw-port/re/disasm/Flexo.PainterPipelineStatesForDeviceAndMTLPixelFormat.getForZebraStripeTexturing.s (8 lines)
//
// ── STRUCT LAYOUT (recovered from C2 @0xd67400 + D2 @0xd68010) ────────────────
//   +0x00  id<MTLDevice>              _device               (retained @0xd6744f
//          via _objc_retain, released in D2 @0xd6801c via _objc_release)
//   +0x08  MTLPixelFormat             _pixelFormat          (u64 arg, stored raw
//          @0xd67421 `movq %rdx, 0x8(%rdi)`)
//   +0x10  bool                       _invalidated          (0-init @0xd67425
//          `movb $0x0, 0x10(%rdi)`; set to 1 in each error branch when a
//          pipeline-creation call returns nil, gating downstream steps)
//   +0x18  NSError*                   _lastError            (0-init @0xd6742c
//          via `movups %xmm0, 0x18(%rdi)`; when a create fails, the NSError
//          out-param at -0x30(%rbp) is retained and stored here, e.g. at
//          @0xd674d0 / @0xd674e4 / @0xd675ab / @0xd676a9 / @0xd6782f /
//          @0xd679b5 / @0xd67b3e / @0xd67c31 / @0xd67c78. Released in D2
//          @0xd68026.)
//   +0x20  id<MTLRenderPipelineState> _videoDrawingBase     (result of the
//          first createPipelineStateForVideoDrawing call @0xd67482, stored
//          @0xd67487; released D2 @0xd68030)
//   +0x28  id<MTLRenderPipelineState> _videoDrawingCore     (second
//          createPipelineStateForVideoDrawing call @0xd674b0, stored
//          @0xd674b7; released D2 @0xd6803a)
//   +0x30  id<MTLRenderPipelineState> _zebraStripe[0]       (stored @0xd67519,
//          released D2 @0xd68044) — first element of the zebra-stripe array
//          walked by getForZebraStripeTexturing @0xd680d7.
//   +0x38  id<MTLRenderPipelineState> _zebraStripe[1]       (@0xd67542 store,
//          D2 @0xd6804e)
//   +0x40  id<MTLRenderPipelineState> _zebraStripe[2]       (@0xd6756b, D2 @0xd68058)
//   +0x48  id<MTLRenderPipelineState> _zebraStripe[3]       (@0xd67594, D2 @0xd68062)
//   +0x50  id<MTLRenderPipelineState> _zebraStripe[4]       (@0xd6767e, D2 @0xd6806c)
//   +0x58  id<MTLRenderPipelineState> _zebraStripe[5]       (@0xd67818, D2 @0xd68076)
//   +0x60  id<MTLRenderPipelineState> _zebraStripe[6]       (@0xd6799e, D2 @0xd68080)
//   +0x68  id<MTLRenderPipelineState> _zebraStripe[7]       (@0xd67b27, D2 @0xd6808a)
//   +0x70  id<MTLRenderPipelineState> _zebraStripe[8]       (@0xd67c1a, D2 @0xd68094)
//   +0x78  id<MTLRenderPipelineState> _zebraStripe[9]       (@0xd67c61 store —
//          NOTE: NOT released by D2. The 13-release dtor loop stops at 0x70;
//          the +0x78 slot is written by the last create-pipeline call at
//          @0xd67c5c but never released. This is a decoded discrepancy in
//          the FCP binary; the port preserves it faithfully rather than
//          patching. Callers that rely on _zebraStripe[9] being cleaned up
//          on destruction should be aware.)
// sizeof = 0x80 (128 bytes; 16-byte aligned).
//
// Structurally: 2 "base" video-drawing pipelines (0x20, 0x28), then 10
// zebra-stripe pipelines (0x30..0x78) each configured with a distinct
// combination of flags passed to `createPipelineStateForVideoDrawing`.
// getForZebraStripeTexturing(i) returns `this[+0x30 + i*8]` — indexing
// treats the range 0x30..0x78 as a 10-element `id<MTLRenderPipelineState>[]`
// array (signed 32-bit sign-extended index; no bounds check in the method
// itself).
//
// ── FRONTIER (unresolved imports) ─────────────────────────────────────────────
//   _objc_retain               bind libobjc/_objc_retain     (@0xd6744f etc)
//   _objc_release              bind libobjc/_objc_release    (used 13 times in D2)
//   _objc_autorelease          stub @0x149790e
//   _objc_msgSend              used indirectly through %r15 caches
//                              (dispatches selectors resolved via __objc_selrefs
//                              — not exhaustively decoded here; the ctor
//                              configures MTLRenderPipelineDescriptor,
//                              MTLLibrary::newFunctionWithName:, etc.)
//   __ZL34createPipelineStateForVideoDrawing...   internal Flexo helper,
//     signature: (id<MTLDevice>, bool, MTLPixelFormat, bool, bool, int, NSError**)
//     -> id<MTLRenderPipelineState>. Called 7 direct times (@0xd67482 etc);
//     additional MTLRenderPipelineDescriptor-based creation runs inline for
//     the zebra-stripe variants (see @0xd67818 store site and its preceding
//     descriptor setup).
//   ___clang_call_terminate                   from D2 landing pads
//                              @0xd680a4 / @0xd680ac (each objc_release could
//                              theoretically raise; the C++ frontend gated
//                              teardown with an exception handler even
//                              though _objc_release never throws in practice).
//
// ── PORT ─────────────────────────────────────────────────────────────────────
// Every method here requires the Metal runtime (MTLDevice, MTLLibrary,
// MTLRenderPipelineState, MTLRenderPipelineDescriptor) and the Objective-C
// runtime (msgSend, retain, release, autorelease). Neither is available in
// this Node.js port. The class shape is fully pinned (offsets above); each
// method raises with an @0xADDR citation identifying the exact FCP
// instruction range that would need Metal + Obj-C bridging to execute.

/** Opaque marker for an Obj-C `id<MTLDevice>` pointer. */
export type MTLDevice = { readonly __obj: "MTLDevice" };

/** Opaque marker for an Obj-C `id<MTLLibrary>` pointer. */
export type MTLLibrary = { readonly __obj: "MTLLibrary" };

/** Opaque marker for an Obj-C `id<MTLRenderPipelineState>` pointer. */
export type MTLRenderPipelineState = { readonly __obj: "MTLRenderPipelineState" };

/** `MTLPixelFormat` is a `NSUInteger` (u64 on 64-bit ABI). */
export type MTLPixelFormat = number;

/**
 * `PainterPipelineStatesForDeviceAndMTLPixelFormat` — Flexo's per-(device,
 * format) cache of Metal pipeline states used by the Painter drawing path.
 * Holds a retained MTLDevice, the MTLPixelFormat, an invalidation flag,
 * a captured NSError (of the first failure), two "base" video-drawing
 * pipelines, and a 10-element array of zebra-stripe pipelines. See the
 * file header for exact byte offsets and their store sites in the ctor.
 */
export class PainterPipelineStatesForDeviceAndMTLPixelFormat {
  /**
   * `PainterPipelineStatesForDeviceAndMTLPixelFormat::PainterPipelineStatesForDeviceAndMTLPixelFormat(
   *   id<MTLDevice>, MTLPixelFormat, id<MTLLibrary>)` @Flexo 0xd67400 (C2).
   *
   * The C1 thunk @Flexo 0xd68000 is a plain 5-byte `jmp` to C2 @0xd68005
   * and is never called for a heap-alloc-then-placement-new — the standard
   * Itanium ABI C1/C2 split.
   *
   * Ctor body summary (see raw-port/re/disasm/.C2.s for the 547-line body):
   *   1. Zero-init all instance fields: @0xd6741a..@0xd67444 store 0 at
   *      +0x00, %rdx at +0x08 (the MTLPixelFormat arg), 0 at +0x10, and
   *      write 32 bytes of xmm0 zero at +0x18/+0x50/+0x60/+0x70.
   *   2. Retain and store the MTLDevice arg: @0xd6744f _objc_retain,
   *      @0xd67455 store to +0x00.
   *   3. Also zero +0x30..+0x48 via two `movups %xmm0` writes @0xd6745b/f.
   *   4. Guarded by `_invalidated == 0` (cmpb 0x10(%rbx)): call
   *      createPipelineStateForVideoDrawing(_device, false, _pixelFormat,
   *      false, false, 0, &_lastError) @0xd67482; store result at +0x20.
   *      If result is nil (@0xd6748b testq je 0xd674d6): the invalidation
   *      path sets `_invalidated = 1` @0xd674c3 and retains the NSError
   *      out-param into +0x18.
   *   5. Repeat for +0x28 (second variant, ecx=1) @0xd674b0.
   *   6. For each zebra-stripe slot (0x30 through 0x78) — 10 in total —
   *      the ctor issues either a direct `createPipelineStateForVideoDrawing`
   *      call with distinct (bool, bool, int) parameter combinations, or
   *      an inline `MTLRenderPipelineDescriptor + MTLLibrary
   *      newFunctionWithName:` sequence for a few variants. Each attempt
   *      is gated by the same `_invalidated == 0` predicate, so a single
   *      failure short-circuits the remaining creations.
   *   7. Returns; no return value (ctor).
   *
   * Every step depends on unported Metal/Obj-C runtime primitives; the
   * body is not reproducible here.
   */
  constructor(_device: MTLDevice, _pixelFormat: MTLPixelFormat, _library: MTLLibrary) {
    /* @0xd67400 (C2) / @0xd68005 (C1 tail-jmp) — Metal runtime required. */
    throw new Error("PainterPipelineStatesForDeviceAndMTLPixelFormat::PainterPipelineStatesForDeviceAndMTLPixelFormat @Flexo 0xd67400 (C2) requires Metal runtime (createPipelineStateForVideoDrawing @Flexo internal ZL34..., MTLRenderPipelineDescriptor + MTLLibrary.newFunctionWithName: via _objc_msgSend @Flexo 0x18ed6c0, _objc_retain @Flexo 0x18ed6e0) — not yet ported"); // @0xd67400
  }

  /**
   * `PainterPipelineStatesForDeviceAndMTLPixelFormat::~PainterPipelineStatesForDeviceAndMTLPixelFormat()`
   * (D2 — base-object dtor) @Flexo 0xd68010. The D1 thunk @Flexo 0xd680c0
   * is a pure `jmp` to D2 @0xd680c5.
   *
   * Body: 13 sequential `_objc_release` calls (all via the same
   * `_objc_release` GOT slot at Flexo @0x18ed6f0 area, resolved through
   * successive RIP-relative loads at 0xb856e6 → 0xb8566e as the offsets
   * decrease by 10 bytes per call):
   *
   *   @0xd68019  movq (%rdi), %rdi ; @0xd6801c release       ; _device @+0x00
   *   @0xd68022  movq 0x18(%rbx), %rdi ; @0xd68026 release   ; _lastError @+0x18
   *   @0xd6802c  movq 0x20(%rbx), %rdi ; @0xd68030 release   ; _videoDrawingBase @+0x20
   *   @0xd68036  movq 0x28(%rbx), %rdi ; @0xd6803a release   ; _videoDrawingCore @+0x28
   *   @0xd68040  movq 0x30(%rbx), %rdi ; @0xd68044 release   ; _zebraStripe[0]
   *   @0xd6804a  movq 0x38(%rbx), %rdi ; @0xd6804e release   ; _zebraStripe[1]
   *   @0xd68054  movq 0x40(%rbx), %rdi ; @0xd68058 release   ; _zebraStripe[2]
   *   @0xd6805e  movq 0x48(%rbx), %rdi ; @0xd68062 release   ; _zebraStripe[3]
   *   @0xd68068  movq 0x50(%rbx), %rdi ; @0xd6806c release   ; _zebraStripe[4]
   *   @0xd68072  movq 0x58(%rbx), %rdi ; @0xd68076 release   ; _zebraStripe[5]
   *   @0xd6807c  movq 0x60(%rbx), %rdi ; @0xd68080 release   ; _zebraStripe[6]
   *   @0xd68086  movq 0x68(%rbx), %rdi ; @0xd6808a release   ; _zebraStripe[7]
   *   @0xd68090  movq 0x70(%rbx), %rdi ; @0xd68094 release   ; _zebraStripe[8]
   *
   *   NOTE: _zebraStripe[9] @+0x78 is written by the ctor but NOT released
   *   here. The port preserves that faithfully — see file-header note.
   *
   * @0xd680a1/@0xd680ac  landing pads → ___clang_call_terminate for any
   *                      exception raised by _objc_release (defensive; in
   *                      practice release never throws).
   */
  destroy(): void {
    /* @0xd68010 — 13 _objc_release calls; runtime not available in this port. */
    throw new Error("PainterPipelineStatesForDeviceAndMTLPixelFormat::~PainterPipelineStatesForDeviceAndMTLPixelFormat @Flexo 0xd68010 (D2) requires Obj-C runtime (_objc_release @Flexo 0x18ed708 — 13 calls at 0xd6801c/0xd68026/.../0xd68094) — not yet ported"); // @0xd68010
  }

  /**
   * `PainterPipelineStatesForDeviceAndMTLPixelFormat::getForZebraStripeTexturing(int)`
   * @Flexo 0xd680d0.
   *
   * Body (verbatim):
   *   @0xd680d0 pushq %rbp
   *   @0xd680d1 movq  %rsp, %rbp
   *   @0xd680d4 movslq %esi, %rax        ; rax = sign-extend arg 'i' to i64
   *   @0xd680d7 movq  0x30(%rdi,%rax,8), %rax
   *                                      ; rax = this->_zebraStripe[i]
   *                                      ;      (loads from base+0x30+i*8)
   *   @0xd680dc popq  %rbp
   *   @0xd680dd retq
   *
   * Semantics: returns `this->_zebraStripe[i]` — an
   * `id<MTLRenderPipelineState>` pointer from the zebra-stripe array. No
   * bounds check, no retain/release, no autorelease; the caller receives
   * an unretained pointer valid for as long as `this` outlives it. The
   * signed-32→signed-64 extension at @0xd680d4 accepts negative indices
   * (which would read into the +0x00.._invalidated region, or before
   * `this` for `i < -6`); the C++ ABI does not police this. Valid `i` is
   * `[0, 9]` per the ctor's 10 pipeline creations at 0x30..0x78.
   */
  getForZebraStripeTexturing(_i: number): MTLRenderPipelineState | null {
    /* @0xd680d0 — pointer arithmetic on this class's raw byte layout;
       returning the correct MTLRenderPipelineState* would require the
       ctor to have populated the field, which needs the Metal runtime. */
    throw new Error("PainterPipelineStatesForDeviceAndMTLPixelFormat::getForZebraStripeTexturing @Flexo 0xd680d0 reads this[+0x30+i*8] — but the ctor that populates the _zebraStripe[] array requires Metal runtime and is not yet ported"); // @0xd680d0
  }
}
