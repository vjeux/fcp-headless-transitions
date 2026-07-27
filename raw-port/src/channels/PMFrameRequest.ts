// @class PMFrameRequest (Ozone)
//
// PMFrameRequest is a large POD-ish request struct used to describe a frame
// render request throughout Ozone (see uses like OZFxFilter::prerollBegin/End,
// scheduleTokens, remapTokens, getTokensImage, etc — all take
// `PMFrameRequest&`).
//
// The binary exposes two ported entry points:
//   @0x0837d0  PMFrameRequest::~PMFrameRequest()               (destructor)
//   @0x0c1910  PMFrameRequest::PMFrameRequest(PMFrameRequest const&)  (copy ctor)
//
// LAYOUT (recovered from the copy ctor at 0xc1910, dtor at 0x837d0):
//   0x000..0x0F   16 bytes  head block (movups)
//   0x010..0x057   ten 8-byte doubles (movsd), offsets 0x10..0x50
//   0x058..0x087  48 bytes  (three movups 128-bit copies)
//   0x088          8 bytes  CGColorSpace* (retained via PCCFRefTraits<CGColorSpace*>::retain,
//                            released via ...::release; nullable — retain gated by `testq`)
//   0x090..0x0CF  64 bytes  (four movups 128-bit copies)
//   0x0D0..0x0EF  32 bytes  (two movups 128-bit copies)
//   0x0F0..0x108  24 bytes  (two movups 128-bit copies)  [PCColor?]
//   0x110          8 bytes  CGColorSpace* (retain/release, nullable)   → PCColorSpaceHandle
//   0x118          8 bytes  CGColorSpace* (retain/release, nullable)   → PCColorSpaceHandle
//   0x120..0x12F  16 bytes  (movups)
//   0x130          8 bytes  scalar (movq)
//   0x138          PCNSRefImpl (retain@0x6df51c / release@0x6df522)
//   0x140          PCNSRefImpl (retain@0x6df51c / release@0x6df522)
//   0x148..0x167  32 bytes  (two movups 128-bit copies) — tail
//   sizeof ≈ 0x168 (360 bytes)
//
// DESTRUCTOR SEQUENCE (@0x837d0):
//   1. release PCNSRefImpl at (this + 0x140)   → sym @0x6df522
//   2. release PCNSRefImpl at (this + 0x138)   → sym @0x6df522
//   3. if (this+0x118) release CGColorSpace     → sym @0x6dda9a (PCCFRefTraits::release)
//   4. if (this+0x110) release CGColorSpace     → sym @0x6dda9a
//   5. if (this+0x088) release CGColorSpace     → sym @0x6dda9a
//   (unwind personalities all funnel to ___clang_call_terminate — noexcept dtors)
//
// COPY CTOR SEQUENCE (@0xc1910):
//   plain memcpy of every field, then:
//     - retain CGColorSpace at 0x88, 0x110, 0x118 (each nullable)
//     - retain PCNSRefImpl at 0x138 and 0x140
//   Landing pads at 0xc1ad5..0xc1b23 unwind partial state:
//     release PCNSRefImpl@0x138 → ~PCColorSpaceHandle@0x118 → @0x110 → ~PCColor@(this+0x58)
//     → _Unwind_Resume. These are ONLY unwind targets — normal path skips them.
//
// This port models the class as an opaque owning wrapper. We keep field values
// in a Uint8Array-backed "raw" buffer of length 0x168 to preserve exact byte
// offsets, and track the retained handles on the JS side. Pure math is not
// exercised here — this is a lifetime/plumbing struct — so no oracle is
// required, and no math needs to be Math.fround-guarded.

// Handle callee for release/retain — the binary calls out to C++ CFRetain/CFRelease
// wrappers. We model the retain-count semantics in a small helper so copy/destroy
// mirror the asm ordering exactly.

/**
 * Handle callback pair; both are nullable in the C++ (each callsite tests %rdi).
 * `retain` is called from the copy ctor, `release` from the destructor.
 * Callsites in the binary:
 *   PCCFRefTraits<CGColorSpace*>::retain   @stub 0x6dda94
 *   PCCFRefTraits<CGColorSpace*>::release  @stub 0x6dda9a
 *   ProCore_Impl::PCNSRefImpl::retain      @stub 0x6df51c  (member fn — takes `this`)
 *   ProCore_Impl::PCNSRefImpl::release     @stub 0x6df522  (member fn — takes `this`)
 */
export interface PMFrameRequestHandleOps {
  retainCGColorSpace(handle: unknown): void; // @stub 0x6dda94
  releaseCGColorSpace(handle: unknown): void; // @stub 0x6dda9a
  retainPCNSRef(refImpl: unknown): void; // @stub 0x6df51c
  releasePCNSRef(refImpl: unknown): void; // @stub 0x6df522
}

/**
 * Default no-op ops. Real integrations should pass a real ops table; the class
 * itself remains agnostic to how CG/NS handles are actually reference-counted
 * in the JS environment.
 */
export const PMFrameRequestNullOps: PMFrameRequestHandleOps = {
  retainCGColorSpace: () => {},
  releaseCGColorSpace: () => {},
  retainPCNSRef: () => {},
  releasePCNSRef: () => {},
};

/** Size of the PMFrameRequest struct as seen in the binary: 0x168 bytes. */
export const PMFrameRequest_SIZEOF = 0x168;

/** Field offsets recovered from the copy ctor at 0xc1910 / dtor at 0x837d0. */
export const PMFrameRequest_OFF = Object.freeze({
  CGCOLORSPACE_A: 0x088, // retained CGColorSpace* (nullable)
  CGCOLORSPACE_B: 0x110, // retained CGColorSpace* (nullable)  [PCColorSpaceHandle]
  CGCOLORSPACE_C: 0x118, // retained CGColorSpace* (nullable)  [PCColorSpaceHandle]
  PCNSREF_A: 0x138, // ProCore_Impl::PCNSRefImpl (retained, embedded)
  PCNSREF_B: 0x140, // ProCore_Impl::PCNSRefImpl (retained, embedded)
});

/**
 * PMFrameRequest — faithful transcription of the copy ctor + destructor.
 *
 * Only what the two ported symbols actually do is modelled here:
 *   • hold a 0x168-byte raw payload (bit-for-bit copyable);
 *   • retain/release five owning slots in the exact order the asm does.
 *
 * Other member functions (default-ctor @0x396108, mutators, accessors) are
 * NOT in this porting unit — they would appear as separate claim entries.
 */
export class PMFrameRequest {
  /** 0x168-byte payload — matches the binary layout so raw memcpy is possible. */
  readonly raw: Uint8Array;

  /**
   * The five retained handles. They live "inside" `raw` in the binary at the
   * offsets above; in JS we keep them as separate references (the raw bytes
   * are still copied so offsets stay stable for anything else reading raw).
   */
  private handles: {
    cgA: unknown;
    cgB: unknown;
    cgC: unknown;
    nsA: unknown;
    nsB: unknown;
  };

  private readonly ops: PMFrameRequestHandleOps;

  /** Default-construct: zeroed payload, null handles. */
  constructor(ops: PMFrameRequestHandleOps = PMFrameRequestNullOps) {
    this.raw = new Uint8Array(PMFrameRequest_SIZEOF);
    this.handles = { cgA: null, cgB: null, cgC: null, nsA: null, nsB: null };
    this.ops = ops;
  }

  /**
   * @0x0c1910  PMFrameRequest::PMFrameRequest(PMFrameRequest const&)
   *
   * Mirrors the asm exactly:
   *   1. memcpy every byte from `other.raw` into `this.raw` (movups/movsd
   *      cascade at 0xc1920..0xc1ac3).
   *   2. Retain handles in the SAME order the binary retains them:
   *        - CGColorSpace @0x88   (retain if non-null)  — 0xc19ab
   *        - CGColorSpace @0x110  (retain if non-null)  — 0xc1a3b
   *        - CGColorSpace @0x118  (retain if non-null)  — 0xc1a53
   *        - PCNSRefImpl  @0x138  (always retain)       — 0xc1a8d
   *        - PCNSRefImpl  @0x140  (always retain)       — 0xc1aa7
   *
   * The three landing pads (0xc1ad5, 0xc1ada, 0xc1adf) unwind partial retain
   * state on exception; JS doesn't need them since none of these ops throw
   * in the JS binding — but we document them here for parity.
   */
  static copyFrom(
    other: PMFrameRequest,
    ops: PMFrameRequestHandleOps = other.ops
  ): PMFrameRequest {
    const out = new PMFrameRequest(ops);
    // memcpy of the whole 0x168-byte payload — encodes every movups/movsd:
    //   0x00..0x0F (movups), 0x10..0x57 (ten movsd), 0x58..0x87 (3× movups),
    //   0x88 (movq — pointer), 0x90..0xCF (4× movups), 0xD0..0xEF (2× movups),
    //   0xF0..0x108 (2× movups), 0x110/0x118 (movq), 0x120..0x12F (movups),
    //   0x130 (movq), 0x138/0x140 (movq), 0x148..0x167 (2× movups).
    out.raw.set(other.raw);
    // Retain owning slots — exact order from disasm:
    out.handles.cgA = other.handles.cgA;
    if (out.handles.cgA != null) ops.retainCGColorSpace(out.handles.cgA); // @0xc19ab
    out.handles.cgB = other.handles.cgB;
    if (out.handles.cgB != null) ops.retainCGColorSpace(out.handles.cgB); // @0xc1a3b
    out.handles.cgC = other.handles.cgC;
    if (out.handles.cgC != null) ops.retainCGColorSpace(out.handles.cgC); // @0xc1a53
    out.handles.nsA = other.handles.nsA;
    ops.retainPCNSRef(out.handles.nsA); // @0xc1a8d — no null test in asm
    out.handles.nsB = other.handles.nsB;
    ops.retainPCNSRef(out.handles.nsB); // @0xc1aa7 — no null test in asm
    return out;
  }

  /**
   * @0x0837d0  PMFrameRequest::~PMFrameRequest()
   *
   * Mirrors the asm exactly:
   *   1. release PCNSRefImpl @ this+0x140    — @0x837e0 (no null test)
   *   2. release PCNSRefImpl @ this+0x138    — @0x837ec (no null test)
   *   3. if (this+0x118) release CGColorSpace — @0x837fd
   *   4. if (this+0x110) release CGColorSpace — @0x8380e
   *   5. if (this+0x088) release CGColorSpace — @0x8381f
   *
   * The ___clang_call_terminate targets at 0x8382b/33/3b/43/4b are the
   * noexcept-guarantee unwinders — no JS analogue needed.
   */
  destroy(): void {
    this.ops.releasePCNSRef(this.handles.nsB); // @0x837e0
    this.handles.nsB = null;
    this.ops.releasePCNSRef(this.handles.nsA); // @0x837ec
    this.handles.nsA = null;
    if (this.handles.cgC != null) {
      this.ops.releaseCGColorSpace(this.handles.cgC); // @0x837fd
      this.handles.cgC = null;
    }
    if (this.handles.cgB != null) {
      this.ops.releaseCGColorSpace(this.handles.cgB); // @0x8380e
      this.handles.cgB = null;
    }
    if (this.handles.cgA != null) {
      this.ops.releaseCGColorSpace(this.handles.cgA); // @0x8381f
      this.handles.cgA = null;
    }
  }

  /**
   * Handle-slot mutators. These are not covered by the two ported symbols;
   * exposed so callers can populate a PMFrameRequest before copying/destroying.
   * The binary offsets are documented so the future mutator ports can slot in.
   */
  setColorSpaceA(h: unknown): void {
    this.handles.cgA = h;
  } // off 0x88
  setColorSpaceB(h: unknown): void {
    this.handles.cgB = h;
  } // off 0x110
  setColorSpaceC(h: unknown): void {
    this.handles.cgC = h;
  } // off 0x118
  setNSRefA(r: unknown): void {
    this.handles.nsA = r;
  } // off 0x138
  setNSRefB(r: unknown): void {
    this.handles.nsB = r;
  } // off 0x140
}
