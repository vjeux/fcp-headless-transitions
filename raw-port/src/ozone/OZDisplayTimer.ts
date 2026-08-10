// OZDisplayTimer — Ozone's per-viewer display-timing helper. Holds back-pointers
// to the owning OZViewer and its OZFrameQueue and a small block of timing/state
// fields that later methods (their own ledger units) populate.
//
// Faithful port of the Ozone x86_64 disassembly. Every method cites its
// @Ozone addr. Framework: Ozone (thin slice extracted from
// Final Cut Pro.app/Contents/Frameworks/Ozone.framework/.../Ozone).
//
// Provenance (raw-port/re/disasm/__ZN14OZDisplayTimerC1EP8OZViewerP12OZFrameQueue.s):
//   OZDisplayTimer(OZViewer*, OZFrameQueue*)  @0x62a110
//     (__ZN14OZDisplayTimerC1EP8OZViewerP12OZFrameQueue)
//
// ── Decoded struct layout (only the fields this ctor writes are pinned; the
//    rest are filled in by their own ledger units) ─────────────────────────
//
//   +0x00  ptr  viewer      // OZViewer*      (arg %rsi)   movq %rsi,(%rdi)      @0x62a114
//   +0x08  ptr  frameQueue  // OZFrameQueue*  (arg %rdx)   movq %rdx,0x8(%rdi)   @0x62a117
//   +0x10  u64  <lo16zeroed>// movups %xmm0,0x10(%rdi)     @0x62a11e  (zeroes +0x10..+0x1f)
//   +0x18  u64
//   +0x20  u8   <flag>      // movb $0x0,0x20(%rdi)        @0x62a122
//   +0x28  u64  <lo16zeroed>// movups %xmm0,0x28(%rdi)     @0x62a126  (zeroes +0x28..+0x37)
//   +0x30  u64
//
// The two 16-byte `movups %xmm0` stores (xmm0 = 0 via `xorps`) zero-clear the
// timing/state windows [+0x10,+0x20) and [+0x28,+0x38); the single `movb $0x0`
// clears the byte flag at +0x20. No callees, no externs — a pure field-init ctor.

/** Opaque back-pointer to the owning OZViewer (arg %rsi, stored at +0x00). */
export type OZViewer = unknown;
/** Opaque back-pointer to the OZFrameQueue (arg %rdx, stored at +0x08). */
export type OZFrameQueue = unknown;

export class OZDisplayTimer {
  // +0x00  OZViewer* back-pointer (movq %rsi,(%rdi) @0x62a114).
  viewer: OZViewer | null;
  // +0x08  OZFrameQueue* back-pointer (movq %rdx,0x8(%rdi) @0x62a117).
  frameQueue: OZFrameQueue | null;
  // +0x10 .. +0x1f  zero-cleared 16-byte timing window (movups %xmm0 @0x62a11e).
  field10: bigint = 0n;
  field18: bigint = 0n;
  // +0x20  byte flag, cleared to 0 (movb $0x0 @0x62a122).
  field20: number = 0;
  // +0x28 .. +0x37  zero-cleared 16-byte state window (movups %xmm0 @0x62a126).
  field28: bigint = 0n;
  field30: bigint = 0n;

  /**
   * OZDisplayTimer::OZDisplayTimer(OZViewer*, OZFrameQueue*)
   * @0xADDR Ozone 0x000000000062a110
   *   (__ZN14OZDisplayTimerC1EP8OZViewerP12OZFrameQueue)
   *
   * DECODE (raw-port/re/disasm/__ZN14OZDisplayTimerC1EP8OZViewerP12OZFrameQueue.s):
   *   0x62a110  pushq %rbp ; movq %rsp,%rbp            ; frame
   *   0x62a114  movq %rsi, (%rdi)                      ; this->viewer     = arg0 (OZViewer*)
   *   0x62a117  movq %rdx, 0x8(%rdi)                   ; this->frameQueue = arg1 (OZFrameQueue*)
   *   0x62a11b  xorps %xmm0, %xmm0                     ; xmm0 = 0
   *   0x62a11e  movups %xmm0, 0x10(%rdi)               ; zero [+0x10,+0x20)
   *   0x62a122  movb $0x0, 0x20(%rdi)                  ; this->field20 = 0
   *   0x62a126  movups %xmm0, 0x28(%rdi)               ; zero [+0x28,+0x38)
   *   0x62a12a  popq %rbp ; retq                       ; void
   *
   * A pure field-initializing constructor: stashes the two back-pointers and
   * zero-clears the two 16-byte timing/state windows plus the byte flag. Zero
   * callees, no externs.
   */
  constructor(viewer: OZViewer | null, frameQueue: OZFrameQueue | null) {
    // @0x62a114 — movq %rsi,(%rdi)
    this.viewer = viewer;
    // @0x62a117 — movq %rdx,0x8(%rdi)
    this.frameQueue = frameQueue;
    // @0x62a11e — movups %xmm0,0x10(%rdi) : zero [+0x10,+0x20)
    this.field10 = 0n;
    this.field18 = 0n;
    // @0x62a122 — movb $0x0,0x20(%rdi)
    this.field20 = 0;
    // @0x62a126 — movups %xmm0,0x28(%rdi) : zero [+0x28,+0x38)
    this.field28 = 0n;
    this.field30 = 0n;
  }
}
