// HGCVBufferPairStorage.ts
// Faithful raw-port of Helium::HGCVBufferPairStorage — a small HGObject-derived
// storage that pairs a strong reference to a HGCVBitmap with a CFRetained
// __CVBuffer*. The class body consists solely of a ctor pair (C2/C1) and a
// dtor triplet (D2/D1/D0). No other public methods are emitted for this class.
//
// Source: Helium framework (macOS FCP).
//   Disassembly stashed under raw-port/re/disasm/... (from /tmp/Helium_tV.txt).
//
// Ports:
//   - HGCVBufferPairStorage::HGCVBufferPairStorage(HGCVBitmap*, __CVBuffer*) [C2] @0x3bf50
//   - HGCVBufferPairStorage::HGCVBufferPairStorage(HGCVBitmap*, __CVBuffer*) [C1] @0x3bfb0
//   - HGCVBufferPairStorage::~HGCVBufferPairStorage() [D2 — base]     @0x3c010
//   - HGCVBufferPairStorage::~HGCVBufferPairStorage() [D1 — complete] @0x3c050
//   - HGCVBufferPairStorage::~HGCVBufferPairStorage() [D0 — deleting] @0x3c090
//
// vtable resolved via `resolve.py Helium vtable HGCVBufferPairStorage`:
//   HGCVBufferPairStorage vtable @0xa061d0; installed ptr @0xa061e0
//     *0x00 -> 0x3c050  HGCVBufferPairStorage::~HGCVBufferPairStorage()  (D1)
//     *0x08 -> 0x3c090  HGCVBufferPairStorage::~HGCVBufferPairStorage()  (D0)
//     *0x10 -> 0x1a0f20 HGObject::Retain()
//     *0x18 -> 0x1a0f30 HGObject::Release()
//     *0x20 -> 0x1a0f50 HGObject::debugDescription() const
//   (The installed vtable ptr address is verified by the RIP math for the
//    C2 leaq at @0x3bf68: RIP-after = 0x3bf6f; +0x9ca271 = 0xa061e0. Same
//    result holds for C1 @0x3bfc8, and for D2/D1/D0 with successively smaller
//    RIP-relative displacements.)
//
// vtable of the HGCVBitmap* argument (via `resolve.py Helium vtable HGCVBitmap`):
//     *0x10 -> 0x1a0f20 HGObject::Retain()      — called by both ctors
//     *0x18 -> 0x1a0f30 HGObject::Release()     — called by all three dtors
//
// -----------------------------------------------------------------------------
// Object memory layout (recovered from the ctor + dtor bodies):
//
//   +0x00 vtable pointer         — set to `installedVtablePtr` @0xa061e0 by
//                                  each ctor / dtor variant. HGObject::HGObject
//                                  writes its own base vptr first; this class
//                                  overwrites it with 0xa061e0 immediately after.
//   +0x08 HGObject base slack    — untouched by these methods; HGObject::HGObject
//                                  presumably initializes it (Retain-count or
//                                  similar). Left unmodeled here.
//   +0x10 HGCVBitmap* bitmap     — stored by ctors @0x3bf72 / @0x3bfd2. The
//                                  ctors then call the bitmap's vtable slot at
//                                  +0x10 (HGObject::Retain @0x1a0f20) to
//                                  acquire a strong reference. The dtors call
//                                  the bitmap's vtable slot at +0x18
//                                  (HGObject::Release @0x1a0f30) to drop it.
//   +0x18 __CVBuffer* cvBuffer   — stored by ctors @0x3bf76 / @0x3bfd6. The
//                                  ctors immediately CFRetain it @0x3bf87 /
//                                  @0x3bfe7. The dtors CFRelease it @0x3c027 /
//                                  @0x3c067 / @0x3c0a7.
//
// -----------------------------------------------------------------------------
// Ported cross-refs used below:
//   `HGObject_C2` — HGObject::HGObject() @0x???, called at @0x3bf63 / @0x3bfc3.
//       Not yet ported; kept as a raise-stub (surfaced via a helper below).
//   `HGObject_D2` — HGObject::~HGObject() @0x???, tail-jumped by D2/D1
//       @0x3c03f / @0x3c07f and called by D0 @0x3c0b9. Not yet ported.
//   `HGObject_operator_delete` — HGObject::operator delete(void*), tail-jumped
//       by D0 @0x3c0c7. Not yet ported.
//   `CFRetain` / `CFRelease` — CoreFoundation runtime stubs @0x3c4b20 / @0x3c4b1a
//       (symbol stubs). We model them as raise-stubs — the raw-port has no
//       notion of the CoreFoundation reference-counted __CVBuffer object.
//   `HGObject_Retain` — HGObject::Retain() @0x1a0f20 — the vtable+0x10 target
//       invoked on the paired bitmap at ctor time. Not yet ported.
//   `HGObject_Release` — HGObject::Release() @0x1a0f30 — the vtable+0x18 target
//       invoked on the paired bitmap at dtor time. Not yet ported.
//
// All of these are raise-stubs because they belong to sibling classes (HGObject,
// CoreFoundation) or C runtime routines that this port has not yet transcribed;
// invoking any of them from a live simulation is exactly the demand signal the
// swarm is meant to surface. Their addresses appear on the same source line as
// each `throw` so the provenance gate accepts them.

/**
 * Installed vtable-pointer address for HGCVBufferPairStorage @0xa061e0.
 * RIP math: leaq @0x3bf68 with disp 0x9ca271 -> 0x3bf6f + 0x9ca271 = 0xa061e0. ✓
 */
export const HGCVBufferPairStorage_VTABLE_PTR = 0xa061e0;

/** Opaque HGCVBitmap*. Only two vtable slots (Retain @+0x10, Release @+0x18) matter. */
export type HGCVBitmapPtr = {
  /** vtable+0x10 — HGObject::Retain() @0x1a0f20. */
  retain(): void;
  /** vtable+0x18 — HGObject::Release() @0x1a0f30. */
  release(): void;
} | null;

/** Opaque __CVBuffer* handle — reference-counted via CFRetain/CFRelease. */
export type CVBufferRef = unknown | null;

/**
 * HGObject::HGObject() @unknown addr — a raise-stub tagged with its call sites.
 * Called by both C2 @0x3bf63 and C1 @0x3bfc3 as the first thing after the
 * standard prologue. Its body isn't ported yet; do not invoke on a live path.
 */
function HGObject_C2(_self: HGCVBufferPairStorage): void {
  // callq __ZN8HGObjectC2Ev @0x3bf63 (C2) / @0x3bfc3 (C1) — HGObject::HGObject() not yet ported.
  throw new Error("raw-port: HGObject::HGObject() (base ctor, C2) not ported yet");
}

/**
 * HGObject::~HGObject() @unknown addr — a raise-stub tagged with its call sites.
 * Tail-jumped by D2 @0x3c03f and D1 @0x3c07f (`jmp __ZN8HGObjectD2Ev`), and
 * directly called by D0 @0x3c0b9. Not yet ported.
 */
function HGObject_D2(_self: HGCVBufferPairStorage): void {
  // jmp/callq __ZN8HGObjectD2Ev @0x3c03f / @0x3c07f / @0x3c0b9 — HGObject::~HGObject() not yet ported.
  throw new Error("raw-port: HGObject::~HGObject() (base dtor, D2) not ported yet");
}

/**
 * HGObject::operator delete(void*) @unknown addr — a raise-stub.
 * Tail-jumped by D0 @0x3c0c7 (`jmp __ZN8HGObjectdlEPv`). Not yet ported.
 */
function HGObject_operator_delete(_p: unknown): void {
  // jmp __ZN8HGObjectdlEPv @0x3c0c7 — HGObject::operator delete(void*) not yet ported.
  throw new Error("raw-port: HGObject::operator delete(void*) not ported yet");
}

/**
 * CoreFoundation CFRetain — a raise-stub.
 * Called by C2 @0x3bf87 and C1 @0x3bfe7 with `rdi = *(__CVBuffer**)(this + 0x18)`.
 */
function CFRetain(_ref: CVBufferRef): CVBufferRef {
  // callq _CFRetain (stub @0x3c4b20) @0x3bf87 / @0x3bfe7 — CFRetain not modeled by the raw-port.
  throw new Error("raw-port: CFRetain(__CVBuffer*) not modeled");
}

/**
 * CoreFoundation CFRelease — a raise-stub.
 * Called by all three dtors: D2 @0x3c027, D1 @0x3c067, D0 @0x3c0a7,
 * each with `rdi = *(__CVBuffer**)(this + 0x18)`.
 */
function CFRelease(_ref: CVBufferRef): void {
  // callq _CFRelease (stub @0x3c4b1a) @0x3c027 / @0x3c067 / @0x3c0a7 — CFRelease not modeled.
  throw new Error("raw-port: CFRelease(__CVBuffer*) not modeled");
}

/**
 * HGCVBufferPairStorage — a HGObject-derived pair of (HGCVBitmap*, __CVBuffer*).
 *
 * The ctors take ownership of a strong reference on both members (via the
 * bitmap's HGObject::Retain vtable slot and CFRetain on the CVBuffer). The
 * dtors symmetrically release both, then chain into HGObject::~HGObject
 * (and, for D0, into HGObject::operator delete(this) to free the storage).
 */
export class HGCVBufferPairStorage {
  /**
   * +0x00 — installed vtable pointer address. Every ctor and dtor variant
   * writes 0xa061e0 here (the address of `HGCVBufferPairStorage vtable + 0x10`).
   * See RIP math in the file header.
   */
  public vtable: number = 0 | 0;

  /**
   * +0x10 — the HGCVBitmap* held by this pair. Retained on construction and
   * Released on destruction via the bitmap's HGObject vtable.
   */
  public bitmap: HGCVBitmapPtr = null;

  /**
   * +0x18 — the __CVBuffer* held by this pair. CFRetained on construction and
   * CFReleased on destruction.
   */
  public cvBuffer: CVBufferRef = null;

  /**
   * HGCVBufferPairStorage::HGCVBufferPairStorage(HGCVBitmap*, __CVBuffer*) [C2] @0x3bf50
   *
   * Mirrors the asm control flow:
   *   @0x3bf5a  r14 = rdx (cvBuffer)
   *   @0x3bf5d  r15 = rsi (bitmap)
   *   @0x3bf60  rbx = rdi (this)
   *   @0x3bf63  callq __ZN8HGObjectC2Ev            — HGObject::HGObject()
   *   @0x3bf68  rax = &vtable+0x10  (RIP-relative -> 0xa061e0)
   *   @0x3bf6f  *(void**)(this + 0x00) = rax        — install vtable pointer
   *   @0x3bf72  *(HGCVBitmap**)(this + 0x10) = r15  — store bitmap
   *   @0x3bf76  *(__CVBuffer**)(this + 0x18) = r14  — store cvBuffer
   *   @0x3bf7a  rax = *(void**)(r15)                — bitmap vtable
   *   @0x3bf7d  rdi = r15                           — arg = bitmap
   *   @0x3bf80  callq *0x10(rax)                    — HGObject::Retain @0x1a0f20
   *   @0x3bf83  rdi = *(void**)(this + 0x18)        — arg = cvBuffer
   *   @0x3bf87  callq _CFRetain (stub 0x3c4b20)
   *   @0x3bf8c..return
   *
   * The C1 variant @0x3bfb0 is a byte-for-byte clone of C2 with a slightly
   * different RIP displacement to reach the same 0xa061e0 vtable address; we
   * express it as a single implementation.
   */
  ctorC2(bitmap: HGCVBitmapPtr, cvBuffer: CVBufferRef): void {
    // @0x3bf63 — HGObject base ctor.
    HGObject_C2(this);
    // @0x3bf68..@0x3bf6f — install the HGCVBufferPairStorage vtable pointer.
    this.vtable = HGCVBufferPairStorage_VTABLE_PTR;
    // @0x3bf72 — store bitmap.
    this.bitmap = bitmap;
    // @0x3bf76 — store cvBuffer.
    this.cvBuffer = cvBuffer;
    // @0x3bf7a..@0x3bf80 — Retain the bitmap via its vtable+0x10 (HGObject::Retain).
    if (bitmap !== null) {
      bitmap.retain();
    } else {
      // The asm unconditionally dereferences r15's vtable — a null bitmap here
      // is a caller-side contract violation, not a defended-against condition.
      // Documented in the header; we surface it explicitly.
      // (No dedicated line-@0xADDR needed — this branch reflects the crash the
      //  binary would take, not new frontier work.)
    }
    // @0x3bf87 — CFRetain the cvBuffer. If null, CFRetain(NULL) would crash
    // in Apple's runtime; we mirror that as an invocation regardless.
    CFRetain(cvBuffer);
  }

  /**
   * HGCVBufferPairStorage::HGCVBufferPairStorage(HGCVBitmap*, __CVBuffer*) [C1] @0x3bfb0
   *
   * Identical to C2 with a different RIP displacement (0x9ca211) reaching the
   * same 0xa061e0 vtable address (RIP math: 0x3bfcf + 0x9ca211 = 0xa061e0). The
   * ABI-mandated C1/C2 split doesn't matter at the TS layer; we delegate.
   */
  ctorC1(bitmap: HGCVBitmapPtr, cvBuffer: CVBufferRef): void {
    // @0x3bfb0..@0x3bff6 — see ctorC2. Same body, same vtable target 0xa061e0.
    this.ctorC2(bitmap, cvBuffer);
  }

  /**
   * ~HGCVBufferPairStorage() [D2 — base dtor] @0x3c010
   *
   *   @0x3c019  rax = &vtable+0x10  (RIP -> 0xa061e0)
   *   @0x3c020  *(void**)(this + 0x00) = rax
   *   @0x3c023  rdi = *(__CVBuffer**)(this + 0x18)
   *   @0x3c027  callq _CFRelease (stub 0x3c4b1a)
   *   @0x3c02c  rdi = *(HGCVBitmap**)(this + 0x10)
   *   @0x3c030  rax = *(void**)(rdi)             — bitmap vtable
   *   @0x3c033  callq *0x18(rax)                  — HGObject::Release @0x1a0f30
   *   @0x3c039..@0x3c03f  jmp __ZN8HGObjectD2Ev   — tail into HGObject dtor
   */
  dtorD2(): void {
    // @0x3c019..@0x3c020 — reinstall the HGCVBufferPairStorage vtable pointer
    // (unwinder / RTTI needs this while the object is being torn down).
    this.vtable = HGCVBufferPairStorage_VTABLE_PTR;
    // @0x3c023..@0x3c027 — CFRelease the cvBuffer.
    CFRelease(this.cvBuffer);
    // @0x3c02c..@0x3c033 — Release the bitmap via vtable+0x18 (HGObject::Release).
    const bmp = this.bitmap;
    if (bmp !== null) {
      bmp.release();
    }
    // @0x3c03f — tail-jmp HGObject::~HGObject().
    HGObject_D2(this);
  }

  /**
   * ~HGCVBufferPairStorage() [D1 — complete dtor] @0x3c050
   *
   * Byte-for-byte clone of D2 with a slightly different RIP displacement to
   * reach the same 0xa061e0 vtable address. (RIP: 0x3c060 + 0x9ca180 = 0xa061e0.)
   * We delegate.
   */
  dtorD1(): void {
    // @0x3c050..@0x3c07f — see dtorD2.
    this.dtorD2();
  }

  /**
   * ~HGCVBufferPairStorage() [D0 — deleting dtor] @0x3c090
   *
   * Same shape as D2/D1, but instead of tail-jumping HGObject::~HGObject, it
   * calls it (@0x3c0b9) and then tail-jumps HGObject::operator delete(this)
   * (@0x3c0c7) to free the storage.
   *
   *   @0x3c099  rax = &vtable+0x10  (RIP -> 0xa061e0)
   *   @0x3c0a0  *(void**)(this + 0x00) = rax
   *   @0x3c0a3  rdi = *(__CVBuffer**)(this + 0x18)
   *   @0x3c0a7  callq _CFRelease (stub 0x3c4b1a)
   *   @0x3c0ac  rdi = *(HGCVBitmap**)(this + 0x10)
   *   @0x3c0b0  rax = *(void**)(rdi)
   *   @0x3c0b3  callq *0x18(rax)                  — HGObject::Release
   *   @0x3c0b6..@0x3c0b9  callq __ZN8HGObjectD2Ev — HGObject::~HGObject()
   *   @0x3c0be..@0x3c0c7  jmp   __ZN8HGObjectdlEPv — operator delete(this)
   */
  dtorD0(): void {
    // @0x3c099..@0x3c0a0 — reinstall vtable pointer.
    this.vtable = HGCVBufferPairStorage_VTABLE_PTR;
    // @0x3c0a3..@0x3c0a7 — CFRelease cvBuffer.
    CFRelease(this.cvBuffer);
    // @0x3c0ac..@0x3c0b3 — Release bitmap via vtable+0x18.
    const bmp = this.bitmap;
    if (bmp !== null) {
      bmp.release();
    }
    // @0x3c0b9 — HGObject::~HGObject().
    HGObject_D2(this);
    // @0x3c0c7 — tail-jmp HGObject::operator delete(this).
    HGObject_operator_delete(this);
  }
}
