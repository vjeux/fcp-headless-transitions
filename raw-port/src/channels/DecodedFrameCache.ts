// DecodedFrameCache.ts — Flexo framework (channels layer).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
//         Versions/A/Flexo  (macOS FCP, x86_64 slice).
//
// -----------------------------------------------------------------------------
// SYMBOLS PORTED
// -----------------------------------------------------------------------------
//   * DecodedFrameCache::createDuplicateWithSameBacking(__CVBuffer*) @Flexo 0xdef430
//     __ZN17DecodedFrameCache30createDuplicateWithSameBackingEP10__CVBuffer
//
// re/disasm:
//   raw-port/re/disasm/Flexo.__ZN17DecodedFrameCache30createDuplicateWithSameBackingEP10__CVBuffer.s
//
// The mangling carries no implicit `this` use: the entry test at @0xdef452 is
// `testq %rdi,%rdi` and %rdi is then used as the CVPixelBuffer for every
// CoreVideo call, so this is a STATIC member function taking the buffer in the
// first argument register.
//
// -----------------------------------------------------------------------------
// WHAT THE FUNCTION DOES
// -----------------------------------------------------------------------------
// Given a decoded CVPixelBuffer it produces a SECOND CVPixelBuffer that shares
// the SAME backing memory (never a copy of the pixels), by one of three routes:
//
//   1. the source is not a CVPixelBuffer            -> return NULL   @0xdef479
//   2. the source is backed by an IOSurface         -> CVPixelBufferCreateWithIOSurface
//                                                      @0xdef4a6
//   3. otherwise: lock + retain the source and wrap its base address(es) —
//      CVPixelBufferCreateWithPlanarBytes @0xdef634 for a planar buffer,
//      CVPixelBufferCreateWithBytes @0xdef6ee for a chunky one — handing
//      CoreVideo a release callback that owns the unlock/release of the source.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
// Every callee is a TRUE OUT-OF-SCOPE extern: CoreVideo (`_CV*`) and
// CoreFoundation (`_CFGetTypeID`, `_CFRelease`). None of the five in-scope
// frameworks (ProCore/ProChannel/Helium/Ozone/Flexo) is called at all —
// `depgraph.py deps` on this symbol lists nothing.
//
// They are split the way the RESOLVED extern-boundary ruling splits them
// (DEP_WORKER_BRIEF.md, "The only legitimate throw"):
//
//   * LIFETIME / OWNERSHIP primitives are a JS NO-OP, never a throw —
//     `_CFRelease` @0xdef65d, `_CVPixelBufferRetain` @0xdef509 (returns its
//     argument unchanged) and `_CVPixelBufferRelease` @0xdef714. They produce
//     no value to invent; the JS GC owns our surrogate handles.
//   * VALUE-PRODUCING externs THROW, citing the Flexo symbol stub they are
//     entered through and the call site. That is every getter, every creator,
//     and the two attachment mutators, whose EFFECT on a CoreVideo buffer this
//     host cannot produce either. Same convention as the landed
//     `raw-port/src/render/HGCVPixelBuffer.ts`, which models exactly this
//     CoreVideo getter family as throwing boundary stubs.
//
// `CVPixelBufferLockBaseAddress` / `UnlockBaseAddress` throw rather than
// no-op: they are not refcount operations, they are what makes a base address
// valid to read, and `HGCVPixelBuffer.ts` (landed) already models this pair as
// throwing boundary stubs.
//
//   _CFGetTypeID                        Flexo symbol stub @0x14947dc
//   _CFRelease                          Flexo symbol stub @0x149484e   (no-op)
//   _CVBufferPropagateAttachments       Flexo symbol stub @0x149532e
//   _CVBufferRemoveAllAttachments       Flexo symbol stub @0x149533a
//   _CVBufferSetAttachment              Flexo symbol stub @0x149534c
//   _CVPixelBufferCopyCreationAttributes Flexo symbol stub @0x14953d6
//   _CVPixelBufferCreateWithBytes       Flexo symbol stub @0x14953e2
//   _CVPixelBufferCreateWithIOSurface   Flexo symbol stub @0x14953e8
//   _CVPixelBufferCreateWithPlanarBytes Flexo symbol stub @0x14953ee
//   _CVPixelBufferGetBaseAddress        Flexo symbol stub @0x14953f4
//   _CVPixelBufferGetBaseAddressOfPlane Flexo symbol stub @0x14953fa
//   _CVPixelBufferGetBytesPerRow        Flexo symbol stub @0x1495400
//   _CVPixelBufferGetBytesPerRowOfPlane Flexo symbol stub @0x1495406
//   _CVPixelBufferGetDataSize           Flexo symbol stub @0x149540c
//   _CVPixelBufferGetHeight             Flexo symbol stub @0x1495418
//   _CVPixelBufferGetHeightOfPlane      Flexo symbol stub @0x149541e
//   _CVPixelBufferGetIOSurface          Flexo symbol stub @0x1495424
//   _CVPixelBufferGetPixelFormatType    Flexo symbol stub @0x149542a
//   _CVPixelBufferGetPlaneCount         Flexo symbol stub @0x1495430
//   _CVPixelBufferGetTypeID             Flexo symbol stub @0x1495436
//   _CVPixelBufferGetWidth              Flexo symbol stub @0x149543c
//   _CVPixelBufferGetWidthOfPlane       Flexo symbol stub @0x1495442
//   _CVPixelBufferGetIsPlanar           Flexo symbol stub @0x1495448  (_CVPixelBufferIsPlanar)
//   _CVPixelBufferLockBaseAddress       Flexo symbol stub @0x149544e
//   _CVPixelBufferRelease               Flexo symbol stub @0x1495472  (no-op)
//   _CVPixelBufferRetain                Flexo symbol stub @0x1495478  (returns its argument)
//   _CVPixelBufferUnlockBaseAddress     Flexo symbol stub @0x149547e
//
// `___stack_chk_guard` @0xdef444/@0xdef669 and `___stack_chk_fail` @0xdef727
// are the frame's stack-protector prologue/epilogue, not semantics — not
// modelled, following the landed convention (`src/infra/PCImageAttributes.ts`).

/**
 * `CVPixelBufferRef` / `CVBufferRef` — Apple CoreVideo opaque handle
 * (`__CVBuffer*`, the parameter type in the mangled name). Out of port scope;
 * modelled as an opaque brand so the boundary-stub signatures type-check.
 */
export interface CVBufferRef {
  readonly __cvBufferRef: unique symbol;
}

/** `IOSurfaceRef` — Apple IOSurface opaque handle. Out of port scope. */
export interface IOSurfaceRef {
  readonly __ioSurfaceRef: unique symbol;
}

/** `CFDictionaryRef` — CoreFoundation opaque handle. Out of port scope. */
export interface CFDictionaryRef {
  readonly __cfDictionaryRef: unique symbol;
}

/** `CFStringRef` — CoreFoundation opaque handle. Out of port scope. */
export interface CFStringRef {
  readonly __cfStringRef: unique symbol;
}

/** `CFAllocatorRef` — CoreFoundation opaque handle. Out of port scope. */
export interface CFAllocatorRef {
  readonly __cfAllocatorRef: unique symbol;
}

/**
 * A CoreVideo release callback passed BY ADDRESS, never called from here.
 *
 * `leaq <fn>(%rip), %r11` @0xdef5e9 / @0xdef6cb loads the address of a
 * FILE-LOCAL Flexo function and pushes it as the `releaseCallback` argument of
 * the CoreVideo creator. The creator is an out-of-scope extern that raises
 * before the pointer could ever be invoked, so what the transcription has to
 * carry is the ADDRESS, not a body: modelling it as a callable here would be
 * inventing an in-scope function (both are their own porting units — they are
 * `t` local symbols in `army/inventory/Flexo.syms.txt`, not yet in
 * `raw-port/src/`).
 */
export interface CVPixelBufferReleaseCallbackAddr {
  /** Flexo virtual address of the callback function. */
  readonly addr: number;
  /** The (demangled) function the address belongs to. */
  readonly name: string;
}

/**
 * `releaseUnderlyingPlanarCVPixelBuffer(void*, void const*, unsigned long, unsigned long, void const**)`
 * — file-local Flexo function `__ZL36releaseUnderlyingPlanarCVPixelBufferPvPKvmmPS1_` @Flexo
 * 0xdef730, loaded @0xdef5e9 and passed as the planar creator's release callback.
 */
const RELEASE_UNDERLYING_PLANAR_CV_PIXEL_BUFFER: CVPixelBufferReleaseCallbackAddr = {
  addr: 0xdef730, // @Flexo 0xdef730 (leaq @0xdef5e9)
  name: "releaseUnderlyingPlanarCVPixelBuffer(void*, void const*, unsigned long, unsigned long, void const**)",
};

/**
 * `releaseUnderlyingCVPixelBuffer(void*, void const*)` — file-local Flexo function
 * `__ZL30releaseUnderlyingCVPixelBufferPvPKv` @Flexo 0xdef750, loaded @0xdef6cb and passed as the
 * chunky creator's release callback.
 */
const RELEASE_UNDERLYING_CV_PIXEL_BUFFER: CVPixelBufferReleaseCallbackAddr = {
  addr: 0xdef750, // @Flexo 0xdef750 (leaq @0xdef6cb)
  name: "releaseUnderlyingCVPixelBuffer(void*, void const*)",
};

/**
 * `kCVAttachmentMode_ShouldNotPropagate` = 0 — the attachment mode handed to
 * `CVBufferSetAttachment` as `xorl %ecx,%ecx` @0xdef4e0.
 */
const kCVAttachmentMode_ShouldNotPropagate = 0; // @Flexo 0xdef4e0

/**
 * The attachment key the IOSurface duplicate carries back to its source buffer:
 * `"com.apple.flexo.originalCVPixelBufferForIOSurf"` (46 bytes).
 *
 * `leaq 0xbc2b8b(%rip), %rsi` @0xdef4d6 targets the `__DATA_CONST,__cfstring`
 * record @Flexo 0x19b2068, whose (chained-fixup) data pointer resolves to
 * `__TEXT,__cstring` @Flexo 0x1662679, length 46. The disassembler prints
 * `@"bad cfstring ref"` for this operand — it cannot follow a chained pointer —
 * so the bytes were read out of the x86_64 slice directly.
 */
const kOriginalCVPixelBufferForIOSurfaceKey =
  "com.apple.flexo.originalCVPixelBufferForIOSurf" as unknown as CFStringRef; // @Flexo 0x19b2068 -> 0x1662679

// --- CoreFoundation / CoreVideo boundary stubs ---------------------------------------------------

/** `CFTypeID CFGetTypeID(CFTypeRef)` — CoreFoundation extern, entered via Flexo symbol stub
 *  @0x14947dc (`callq` @Flexo 0xdef469). VALUE-PRODUCING: its result is compared against
 *  `CVPixelBufferGetTypeID()` @0xdef476 to select the branch @0xdef479. Out of scope. */
function CFGetTypeID(_cf: CVBufferRef): bigint {
  throw new Error(
    "CFGetTypeID — CoreFoundation extern, out-of-scope; entered via Flexo symbol stub 0x14947dc " +
      "(called @Flexo 0xdef469). Its type id selects the branch @0xdef479 and cannot be fabricated.",
  );
}

/** `void CFRelease(CFTypeRef)` — CoreFoundation LIFETIME primitive, entered via Flexo symbol stub
 *  @0x149484e (`callq` @Flexo 0xdef65d). Modelled as a NO-OP per the RESOLVED extern-boundary
 *  ruling: a refcount drop produces no value, and the JS GC owns our surrogate handle. */
function CFRelease(_cf: CFDictionaryRef): void {
  // no-op — @Flexo 0xdef65d
}

/** `CFTypeID CVPixelBufferGetTypeID(void)` — CoreVideo extern, entered via Flexo symbol stub
 *  @0x1495436 (`callq` @Flexo 0xdef471). VALUE-PRODUCING. Out of scope. */
function CVPixelBufferGetTypeID(): bigint {
  throw new Error(
    "CVPixelBufferGetTypeID — CoreVideo extern, out-of-scope; entered via Flexo symbol stub " +
      "0x1495436 (called @Flexo 0xdef471). Not transcribed.",
  );
}

/** `CFDictionaryRef CVPixelBufferCopyCreationAttributes(CVPixelBufferRef)` — CoreVideo extern,
 *  entered via Flexo symbol stub @0x14953d6 (`callq` @Flexo 0xdef482). VALUE-PRODUCING (it
 *  returns a +1 dictionary, released @0xdef65d). Out of scope. */
function CVPixelBufferCopyCreationAttributes(_buf: CVBufferRef): CFDictionaryRef | null {
  throw new Error(
    "CVPixelBufferCopyCreationAttributes — CoreVideo extern, out-of-scope; entered via Flexo " +
      "symbol stub 0x14953d6 (called @Flexo 0xdef482). Not transcribed.",
  );
}

/** `IOSurfaceRef CVPixelBufferGetIOSurface(CVPixelBufferRef)` — CoreVideo extern, entered via
 *  Flexo symbol stub @0x1495424 (`callq` @Flexo 0xdef48d). VALUE-PRODUCING: NULL vs non-NULL
 *  selects the whole duplication strategy @0xdef495. Out of scope. */
function CVPixelBufferGetIOSurface(_buf: CVBufferRef): IOSurfaceRef | null {
  throw new Error(
    "CVPixelBufferGetIOSurface — CoreVideo extern, out-of-scope; entered via Flexo symbol stub " +
      "0x1495424 (called @Flexo 0xdef48d). Its result selects the branch @0xdef495.",
  );
}

/** `CVReturn CVPixelBufferCreateWithIOSurface(CFAllocatorRef, IOSurfaceRef, CFDictionaryRef,
 *  CVPixelBufferRef *out)` — CoreVideo extern, entered via Flexo symbol stub @0x14953e8
 *  (`callq` @Flexo 0xdef4a6). VALUE-PRODUCING (it writes the new buffer through `out`). */
function CVPixelBufferCreateWithIOSurface(
  _allocator: CFAllocatorRef | null,
  _surface: IOSurfaceRef,
  _attrs: CFDictionaryRef | null,
  _out: { value: CVBufferRef | null },
): number {
  throw new Error(
    "CVPixelBufferCreateWithIOSurface — CoreVideo extern, out-of-scope; entered via Flexo symbol " +
      "stub 0x14953e8 (called @Flexo 0xdef4a6). It produces the duplicate buffer this function " +
      "returns and cannot be fabricated.",
  );
}

/** `void CVBufferRemoveAllAttachments(CVBufferRef)` — CoreVideo extern, entered via Flexo symbol
 *  stub @0x149533a (`callq` @Flexo 0xdef4bb). NOT a lifetime primitive: it mutates the buffer's
 *  attachment dictionary, an EFFECT on a CoreVideo object this host does not own. */
function CVBufferRemoveAllAttachments(_buf: CVBufferRef): void {
  throw new Error(
    "CVBufferRemoveAllAttachments — CoreVideo extern, out-of-scope; entered via Flexo symbol stub " +
      "0x149533a (called @Flexo 0xdef4bb). Not transcribed.",
  );
}

/** `void CVBufferPropagateAttachments(CVBufferRef src, CVBufferRef dst)` — CoreVideo extern,
 *  entered via Flexo symbol stub @0x149532e (`callq` @Flexo 0xdef4ca and @0xdef650). Mutating
 *  EFFECT on a CoreVideo object, not a refcount op. */
function CVBufferPropagateAttachments(_src: CVBufferRef, _dst: CVBufferRef): void {
  throw new Error(
    "CVBufferPropagateAttachments — CoreVideo extern, out-of-scope; entered via Flexo symbol stub " +
      "0x149532e (called @Flexo 0xdef4ca, @Flexo 0xdef650). Not transcribed.",
  );
}

/** `void CVBufferSetAttachment(CVBufferRef, CFStringRef key, CFTypeRef value, CVAttachmentMode)` —
 *  CoreVideo extern, entered via Flexo symbol stub @0x149534c (`callq` @Flexo 0xdef4e2).
 *  Mutating EFFECT on a CoreVideo object, not a refcount op. */
function CVBufferSetAttachment(
  _buf: CVBufferRef,
  _key: CFStringRef,
  _value: CVBufferRef,
  _mode: number,
): void {
  throw new Error(
    "CVBufferSetAttachment — CoreVideo extern, out-of-scope; entered via Flexo symbol stub " +
      "0x149534c (called @Flexo 0xdef4e2). Not transcribed.",
  );
}

/** `CVReturn CVPixelBufferLockBaseAddress(CVPixelBufferRef, CVPixelBufferLockFlags)` — CoreVideo
 *  extern, entered via Flexo symbol stub @0x149544e (`callq` @Flexo 0xdef501). Throws rather than
 *  no-ops: making a base address valid is not a refcount operation (same treatment as the landed
 *  `src/render/HGCVPixelBuffer.ts`). */
function CVPixelBufferLockBaseAddress(_buf: CVBufferRef, _flags: bigint): number {
  throw new Error(
    "CVPixelBufferLockBaseAddress — CoreVideo extern, out-of-scope; entered via Flexo symbol stub " +
      "0x149544e (called @Flexo 0xdef501). Not transcribed.",
  );
}

/** `CVReturn CVPixelBufferUnlockBaseAddress(CVPixelBufferRef, CVPixelBufferLockFlags)` — CoreVideo
 *  extern, entered via Flexo symbol stub @0x149547e (`callq` @Flexo 0xdef70c). */
function CVPixelBufferUnlockBaseAddress(_buf: CVBufferRef, _flags: bigint): number {
  throw new Error(
    "CVPixelBufferUnlockBaseAddress — CoreVideo extern, out-of-scope; entered via Flexo symbol " +
      "stub 0x149547e (called @Flexo 0xdef70c). Not transcribed.",
  );
}

/** `CVPixelBufferRef CVPixelBufferRetain(CVPixelBufferRef)` — CoreVideo LIFETIME primitive,
 *  entered via Flexo symbol stub @0x1495478 (`callq` @Flexo 0xdef509). Retain-family: returns its
 *  argument unchanged (RESOLVED extern-boundary ruling). */
function CVPixelBufferRetain(buf: CVBufferRef): CVBufferRef {
  return buf; // @Flexo 0xdef509
}

/** `void CVPixelBufferRelease(CVPixelBufferRef)` — CoreVideo LIFETIME primitive, entered via Flexo
 *  symbol stub @0x1495472 (`callq` @Flexo 0xdef714). Release-family: no-op. */
function CVPixelBufferRelease(_buf: CVBufferRef): void {
  // no-op — @Flexo 0xdef714
}

/** `Boolean CVPixelBufferIsPlanar(CVPixelBufferRef)` — CoreVideo extern, entered via Flexo symbol
 *  stub @0x1495448 (`callq` @Flexo 0xdef511). VALUE-PRODUCING: `testb %al,%al` @0xdef519 selects
 *  the planar vs chunky path. Out of scope. */
function CVPixelBufferIsPlanar(_buf: CVBufferRef): boolean {
  throw new Error(
    "CVPixelBufferIsPlanar — CoreVideo extern, out-of-scope; entered via Flexo symbol stub " +
      "0x1495448 (called @Flexo 0xdef511). Its result selects the branch @0xdef51b.",
  );
}

/** `size_t CVPixelBufferGetPlaneCount(CVPixelBufferRef)` — CoreVideo extern, entered via Flexo
 *  symbol stub @0x1495430 (`callq` @Flexo 0xdef521, @0xdef57c, @0xdef5d9). VALUE-PRODUCING. */
function CVPixelBufferGetPlaneCount(_buf: CVBufferRef): bigint {
  throw new Error(
    "CVPixelBufferGetPlaneCount — CoreVideo extern, out-of-scope; entered via Flexo symbol stub " +
      "0x1495430 (called @Flexo 0xdef521, 0xdef57c, 0xdef5d9). Not transcribed.",
  );
}

/** `void *CVPixelBufferGetBaseAddressOfPlane(CVPixelBufferRef, size_t)` — CoreVideo extern,
 *  entered via Flexo symbol stub @0x14953fa (`callq` @Flexo 0xdef536). VALUE-PRODUCING. */
function CVPixelBufferGetBaseAddressOfPlane(_buf: CVBufferRef, _plane: bigint): bigint {
  throw new Error(
    "CVPixelBufferGetBaseAddressOfPlane — CoreVideo extern, out-of-scope; entered via Flexo symbol " +
      "stub 0x14953fa (called @Flexo 0xdef536). Not transcribed.",
  );
}

/** `size_t CVPixelBufferGetWidthOfPlane(CVPixelBufferRef, size_t)` — CoreVideo extern, entered via
 *  Flexo symbol stub @0x1495442 (`callq` @Flexo 0xdef546). VALUE-PRODUCING. */
function CVPixelBufferGetWidthOfPlane(_buf: CVBufferRef, _plane: bigint): bigint {
  throw new Error(
    "CVPixelBufferGetWidthOfPlane — CoreVideo extern, out-of-scope; entered via Flexo symbol stub " +
      "0x1495442 (called @Flexo 0xdef546). Not transcribed.",
  );
}

/** `size_t CVPixelBufferGetHeightOfPlane(CVPixelBufferRef, size_t)` — CoreVideo extern, entered
 *  via Flexo symbol stub @0x149541e (`callq` @Flexo 0xdef556). VALUE-PRODUCING. */
function CVPixelBufferGetHeightOfPlane(_buf: CVBufferRef, _plane: bigint): bigint {
  throw new Error(
    "CVPixelBufferGetHeightOfPlane — CoreVideo extern, out-of-scope; entered via Flexo symbol stub " +
      "0x149541e (called @Flexo 0xdef556). Not transcribed.",
  );
}

/** `size_t CVPixelBufferGetBytesPerRowOfPlane(CVPixelBufferRef, size_t)` — CoreVideo extern,
 *  entered via Flexo symbol stub @0x1495406 (`callq` @Flexo 0xdef569). VALUE-PRODUCING. */
function CVPixelBufferGetBytesPerRowOfPlane(_buf: CVBufferRef, _plane: bigint): bigint {
  throw new Error(
    "CVPixelBufferGetBytesPerRowOfPlane — CoreVideo extern, out-of-scope; entered via Flexo symbol " +
      "stub 0x1495406 (called @Flexo 0xdef569). Not transcribed.",
  );
}

/** `size_t CVPixelBufferGetWidth(CVPixelBufferRef)` — CoreVideo extern, entered via Flexo symbol
 *  stub @0x149543c (`callq` @Flexo 0xdef59a, @0xdef68f). VALUE-PRODUCING. */
function CVPixelBufferGetWidth(_buf: CVBufferRef): bigint {
  throw new Error(
    "CVPixelBufferGetWidth — CoreVideo extern, out-of-scope; entered via Flexo symbol stub " +
      "0x149543c (called @Flexo 0xdef59a, 0xdef68f). Not transcribed.",
  );
}

/** `size_t CVPixelBufferGetHeight(CVPixelBufferRef)` — CoreVideo extern, entered via Flexo symbol
 *  stub @0x1495418 (`callq` @Flexo 0xdef5a9, @0xdef69e). VALUE-PRODUCING. */
function CVPixelBufferGetHeight(_buf: CVBufferRef): bigint {
  throw new Error(
    "CVPixelBufferGetHeight — CoreVideo extern, out-of-scope; entered via Flexo symbol stub " +
      "0x1495418 (called @Flexo 0xdef5a9, 0xdef69e). Not transcribed.",
  );
}

/** `OSType CVPixelBufferGetPixelFormatType(CVPixelBufferRef)` — CoreVideo extern, entered via
 *  Flexo symbol stub @0x149542a (`callq` @Flexo 0xdef5b8, @0xdef6a9). VALUE-PRODUCING; the
 *  result is kept as a 32-bit OSType (`movl %eax,%r15d` @0xdef5bd). */
function CVPixelBufferGetPixelFormatType(_buf: CVBufferRef): number {
  throw new Error(
    "CVPixelBufferGetPixelFormatType — CoreVideo extern, out-of-scope; entered via Flexo symbol " +
      "stub 0x149542a (called @Flexo 0xdef5b8, 0xdef6a9). Not transcribed.",
  );
}

/** `void *CVPixelBufferGetBaseAddress(CVPixelBufferRef)` — CoreVideo extern, entered via Flexo
 *  symbol stub @0x14953f4 (`callq` @Flexo 0xdef5c3, @0xdef6b4). VALUE-PRODUCING. */
function CVPixelBufferGetBaseAddress(_buf: CVBufferRef): bigint {
  throw new Error(
    "CVPixelBufferGetBaseAddress — CoreVideo extern, out-of-scope; entered via Flexo symbol stub " +
      "0x14953f4 (called @Flexo 0xdef5c3, 0xdef6b4). Not transcribed.",
  );
}

/** `size_t CVPixelBufferGetDataSize(CVPixelBufferRef)` — CoreVideo extern, entered via Flexo
 *  symbol stub @0x149540c (`callq` @Flexo 0xdef5ce). VALUE-PRODUCING. */
function CVPixelBufferGetDataSize(_buf: CVBufferRef): bigint {
  throw new Error(
    "CVPixelBufferGetDataSize — CoreVideo extern, out-of-scope; entered via Flexo symbol stub " +
      "0x149540c (called @Flexo 0xdef5ce). Not transcribed.",
  );
}

/** `size_t CVPixelBufferGetBytesPerRow(CVPixelBufferRef)` — CoreVideo extern, entered via Flexo
 *  symbol stub @0x1495400 (`callq` @Flexo 0xdef6bf). VALUE-PRODUCING. */
function CVPixelBufferGetBytesPerRow(_buf: CVBufferRef): bigint {
  throw new Error(
    "CVPixelBufferGetBytesPerRow — CoreVideo extern, out-of-scope; entered via Flexo symbol stub " +
      "0x1495400 (called @Flexo 0xdef6bf). Not transcribed.",
  );
}

/** `CVReturn CVPixelBufferCreateWithPlanarBytes(...)` — CoreVideo extern, entered via Flexo symbol
 *  stub @0x14953ee (`callq` @Flexo 0xdef634). VALUE-PRODUCING (it writes the new buffer through
 *  `pixelBufferOut`). The argument order below is the stack layout the call site builds: the six
 *  register arguments, then `numberOfPlanes` (the LAST `pushq %rax` @0xdef633, i.e. the lowest
 *  stack slot = argument 7), then the four plane arrays, the release callback, its refcon, the
 *  attributes dictionary and the out-pointer (`pushq %r10` @0xdef60e, the deepest slot). */
function CVPixelBufferCreateWithPlanarBytes(
  _allocator: CFAllocatorRef | null,
  _width: bigint,
  _height: bigint,
  _pixelFormatType: number,
  _dataPtr: bigint,
  _dataSize: bigint,
  _numberOfPlanes: bigint,
  _planeBaseAddress: bigint[],
  _planeWidth: bigint[],
  _planeHeight: bigint[],
  _planeBytesPerRow: bigint[],
  _releaseCallback: CVPixelBufferReleaseCallbackAddr,
  _releaseRefCon: CVBufferRef,
  _pixelBufferAttributes: CFDictionaryRef | null,
  _pixelBufferOut: { value: CVBufferRef | null },
): number {
  throw new Error(
    "CVPixelBufferCreateWithPlanarBytes — CoreVideo extern, out-of-scope; entered via Flexo symbol " +
      "stub 0x14953ee (called @Flexo 0xdef634). It produces the duplicate buffer this function " +
      "returns and cannot be fabricated.",
  );
}

/** `CVReturn CVPixelBufferCreateWithBytes(...)` — CoreVideo extern, entered via Flexo symbol stub
 *  @0x14953e2 (`callq` @Flexo 0xdef6ee). VALUE-PRODUCING. Stack arguments in call-site order:
 *  `pushq %r11` @0xdef6ec (release callback, argument 7) … `pushq %r10` @0xdef6e7 (the
 *  out-pointer, argument 10). */
function CVPixelBufferCreateWithBytes(
  _allocator: CFAllocatorRef | null,
  _width: bigint,
  _height: bigint,
  _pixelFormatType: number,
  _baseAddress: bigint,
  _bytesPerRow: bigint,
  _releaseCallback: CVPixelBufferReleaseCallbackAddr,
  _releaseRefCon: CVBufferRef,
  _pixelBufferAttributes: CFDictionaryRef | null,
  _pixelBufferOut: { value: CVBufferRef | null },
): number {
  throw new Error(
    "CVPixelBufferCreateWithBytes — CoreVideo extern, out-of-scope; entered via Flexo symbol stub " +
      "0x14953e2 (called @Flexo 0xdef6ee). It produces the duplicate buffer this function returns " +
      "and cannot be fabricated.",
  );
}

/**
 * `CFAllocatorRef kCFAllocatorDefault` — CoreFoundation global read through the literal pool
 * @0xdef586 (`movq 0xb0007b(%rip),%rax` then `movq (%rax),%rax` @0xdef58d). Out of port scope:
 * the value is a CoreFoundation allocator this host does not have, so it is carried as an opaque
 * handle rather than invented.
 *
 * Note the asymmetry the transcription must preserve: the PLANAR path passes this allocator
 * @0xdef5f0, while the CHUNKY path passes NULL (`xorl %edi,%edi` @0xdef6d2).
 */
const kCFAllocatorDefault = { __kCFAllocatorDefault: "@Flexo 0xdef586" } as unknown as CFAllocatorRef;

// --- DecodedFrameCache ---------------------------------------------------------------------------

export class DecodedFrameCache {
  /**
   * `DecodedFrameCache::createDuplicateWithSameBacking(__CVBuffer*)` @Flexo 0xdef430
   * (`__ZN17DecodedFrameCache30createDuplicateWithSameBackingEP10__CVBuffer`).
   *
   * Static member function: `%rdi` is the buffer, not a `this` (see the header note).
   *
   * Returns the duplicate CVPixelBuffer, or NULL when the input is NULL @0xdef455, when the input
   * is not a CVPixelBuffer @0xdef479, or when the creator left the out-slot NULL.
   */
  static createDuplicateWithSameBacking(buf: CVBufferRef | null): CVBufferRef | null {
    // @0xdef452  testq %rdi,%rdi ; je 0xdef4f5 -> xorl %eax,%eax ; jmp 0xdef669 (return NULL)
    if (buf === null) {
      return null;
    }
    // @0xdef45b  movq %rdi,%rbx — the source buffer is held in %rbx for the whole body.
    // @0xdef45e  movq $0x0,-0xb8(%rbp) — the creators' out-parameter slot, initialised to NULL.
    //            It is also what @0xdef662 returns, which is why the "not a CVPixelBuffer" and
    //            "creator failed" paths return NULL without any further store.
    const dup: { value: CVBufferRef | null } = { value: null };

    // @0xdef469  callq _CFGetTypeID(buf)                 -> %r14
    const bufTypeID = CFGetTypeID(buf);
    // @0xdef471  callq _CVPixelBufferGetTypeID()         -> %rax
    const pixelBufferTypeID = CVPixelBufferGetTypeID();
    // @0xdef476  cmpq %rax,%r14 (computes %r14 - %rax) ; jne 0xdef662 -> return dup (still NULL)
    if (bufTypeID !== pixelBufferTypeID) {
      return dup.value;
    }

    // @0xdef482  callq _CVPixelBufferCopyCreationAttributes(buf) -> %r14 (a +1 dictionary; the
    //            NULL test @0xdef4e7 / @0xdef655 / @0xdef719 is what decides whether it is
    //            released @0xdef65d)
    const attrs = CVPixelBufferCopyCreationAttributes(buf);

    // @0xdef48d  callq _CVPixelBufferGetIOSurface(buf) -> %rax
    // @0xdef492  testq %rax,%rax ; je 0xdef4fc (the base-address path)
    const surface = CVPixelBufferGetIOSurface(buf);
    if (surface !== null) {
      // ---- IOSurface-backed source: wrap the SAME IOSurface ------------------------------------
      // @0xdef497  leaq -0xb8(%rbp),%rcx   (&dup)
      // @0xdef49e  xorl %edi,%edi          (allocator = NULL)
      // @0xdef4a0  movq %rax,%rsi          (the IOSurface)
      // @0xdef4a3  movq %r14,%rdx          (the creation attributes)
      // @0xdef4a6  callq _CVPixelBufferCreateWithIOSurface
      CVPixelBufferCreateWithIOSurface(null, surface, attrs, dup);

      // @0xdef4ab  movq -0xb8(%rbp),%rdi ; testq %rdi,%rdi ; je 0xdef655 (skip straight to the
      //            attributes release)
      if (dup.value !== null) {
        // @0xdef4bb  callq _CVBufferRemoveAllAttachments(dup)
        CVBufferRemoveAllAttachments(dup.value);
        // @0xdef4ca  callq _CVBufferPropagateAttachments(%rdi=buf, %rsi=dup)
        CVBufferPropagateAttachments(buf, dup.value);
        // @0xdef4e2  callq _CVBufferSetAttachment(%rdi=dup, %rsi=CFSTR(...), %rdx=buf, %ecx=0)
        CVBufferSetAttachment(
          dup.value,
          kOriginalCVPixelBufferForIOSurfaceKey,
          buf,
          kCVAttachmentMode_ShouldNotPropagate,
        );
      }
      // @0xdef4e7 / @0xdef655  testq %r14,%r14 ; the release @0xdef65d only runs when non-NULL
      if (attrs !== null) {
        CFRelease(attrs); // @0xdef65d
      }
      // @0xdef662  movq -0xb8(%rbp),%rax
      return dup.value;
    }

    // ---- No IOSurface: lock the source and wrap its base address(es) -----------------------------
    // @0xdef4ff  xorl %esi,%esi ; callq _CVPixelBufferLockBaseAddress(buf, 0)
    CVPixelBufferLockBaseAddress(buf, 0n);
    // @0xdef509  callq _CVPixelBufferRetain(buf) — the duplicate's release callback owns this
    //            reference (and the unlock); nothing on the success path drops it here.
    CVPixelBufferRetain(buf);
    // @0xdef511  callq _CVPixelBufferIsPlanar(buf) ; @0xdef519 testb %al,%al ; je 0xdef68f
    const planar = CVPixelBufferIsPlanar(buf);

    if (planar) {
      // ---- planar: collect the per-plane geometry -----------------------------------------------
      // Four 0x20-byte stack arrays (four 8-byte slots each), indexed by %r15:
      //   -0x50 plane base addresses, -0x70 plane widths, -0x90 plane heights,
      //   -0xb0 plane bytes-per-row.
      const planeBaseAddress: bigint[] = [0n, 0n, 0n, 0n]; // -0x50(%rbp)
      const planeWidth: bigint[] = [0n, 0n, 0n, 0n]; // -0x70(%rbp)
      const planeHeight: bigint[] = [0n, 0n, 0n, 0n]; // -0x90(%rbp)
      const planeBytesPerRow: bigint[] = [0n, 0n, 0n, 0n]; // -0xb0(%rbp)

      // @0xdef521  callq _CVPixelBufferGetPlaneCount(buf) ; @0xdef526 testq %rax,%rax ;
      // @0xdef529  je 0xdef586 — an empty plane count skips the loop entirely.
      if (CVPixelBufferGetPlaneCount(buf) !== 0n) {
        // @0xdef52b  xorl %r15d,%r15d
        let plane = 0n;
        // The loop RE-READS the plane count every iteration (@0xdef57c) and continues while
        // `planeCount > plane` unsigned (`cmpq %r15,%rax` computes %rax - %r15 ; `ja` @0xdef584).
        for (;;) {
          // @0xdef536  planeBaseAddress[plane] = _CVPixelBufferGetBaseAddressOfPlane(buf, plane)
          planeBaseAddress[Number(plane)] = CVPixelBufferGetBaseAddressOfPlane(buf, plane);
          // @0xdef546  planeWidth[plane] = _CVPixelBufferGetWidthOfPlane(buf, plane)
          planeWidth[Number(plane)] = CVPixelBufferGetWidthOfPlane(buf, plane);
          // @0xdef556  planeHeight[plane] = _CVPixelBufferGetHeightOfPlane(buf, plane)
          planeHeight[Number(plane)] = CVPixelBufferGetHeightOfPlane(buf, plane);
          // @0xdef569  planeBytesPerRow[plane] = _CVPixelBufferGetBytesPerRowOfPlane(buf, plane)
          planeBytesPerRow[Number(plane)] = CVPixelBufferGetBytesPerRowOfPlane(buf, plane);
          // @0xdef576  incq %r15
          plane += 1n;
          // @0xdef57c  callq _CVPixelBufferGetPlaneCount(buf) ; @0xdef581 cmpq %r15,%rax ;
          // @0xdef584  ja 0xdef530
          if (!(CVPixelBufferGetPlaneCount(buf) > plane)) {
            break;
          }
        }
      }

      // @0xdef586  movq _kCFAllocatorDefault(%rip),%rax ; movq (%rax),%rax -> -0xc0(%rbp)
      const allocator = kCFAllocatorDefault;
      // @0xdef59a  -0xd0(%rbp) = _CVPixelBufferGetWidth(buf)
      const width = CVPixelBufferGetWidth(buf);
      // @0xdef5a9  -0xc8(%rbp) = _CVPixelBufferGetHeight(buf)
      const height = CVPixelBufferGetHeight(buf);
      // @0xdef5b8  movl %eax,%r15d = _CVPixelBufferGetPixelFormatType(buf)  (32-bit OSType)
      const pixelFormatType = CVPixelBufferGetPixelFormatType(buf);
      // @0xdef5c3  %r12 = _CVPixelBufferGetBaseAddress(buf)
      const dataPtr = CVPixelBufferGetBaseAddress(buf);
      // @0xdef5ce  %r13 = _CVPixelBufferGetDataSize(buf)
      const dataSize = CVPixelBufferGetDataSize(buf);
      // @0xdef5d9  %rax = _CVPixelBufferGetPlaneCount(buf) — read a THIRD time, for the argument
      const numberOfPlanes = CVPixelBufferGetPlaneCount(buf);
      // @0xdef634  callq _CVPixelBufferCreateWithPlanarBytes
      CVPixelBufferCreateWithPlanarBytes(
        allocator,
        width,
        height,
        pixelFormatType,
        dataPtr,
        dataSize,
        numberOfPlanes,
        planeBaseAddress,
        planeWidth,
        planeHeight,
        planeBytesPerRow,
        RELEASE_UNDERLYING_PLANAR_CV_PIXEL_BUFFER,
        buf,
        attrs,
        dup,
      );
    } else {
      // ---- chunky: one base address ---------------------------------------------------------
      // @0xdef68f  -0xc0(%rbp) = _CVPixelBufferGetWidth(buf)
      const width = CVPixelBufferGetWidth(buf);
      // @0xdef69e  %r12 = _CVPixelBufferGetHeight(buf)
      const height = CVPixelBufferGetHeight(buf);
      // @0xdef6a9  movl %eax,%r13d = _CVPixelBufferGetPixelFormatType(buf)
      const pixelFormatType = CVPixelBufferGetPixelFormatType(buf);
      // @0xdef6b4  %r15 = _CVPixelBufferGetBaseAddress(buf)
      const baseAddress = CVPixelBufferGetBaseAddress(buf);
      // @0xdef6bf  %rax = _CVPixelBufferGetBytesPerRow(buf)
      const bytesPerRow = CVPixelBufferGetBytesPerRow(buf);
      // @0xdef6d2  xorl %edi,%edi — allocator NULL here, NOT kCFAllocatorDefault as in the
      //            planar path @0xdef5f0.
      // @0xdef6ee  callq _CVPixelBufferCreateWithBytes
      CVPixelBufferCreateWithBytes(
        null,
        width,
        height,
        pixelFormatType,
        baseAddress,
        bytesPerRow,
        RELEASE_UNDERLYING_CV_PIXEL_BUFFER,
        buf,
        attrs,
        dup,
      );
    }

    // Both creators rejoin here: @0xdef63d (planar) / @0xdef6f7 (chunky) reload the out-slot.
    if (dup.value !== null) {
      // @0xdef64d  callq _CVBufferPropagateAttachments(%rdi=buf, %rsi=dup)
      CVBufferPropagateAttachments(buf, dup.value);
    } else {
      // @0xdef707  the creator produced nothing, so THIS frame owns the undo: unlock and release
      //            the source it locked @0xdef501 and retained @0xdef509.
      // @0xdef70c  xorl %esi,%esi ; callq _CVPixelBufferUnlockBaseAddress(buf, 0)
      CVPixelBufferUnlockBaseAddress(buf, 0n);
      // @0xdef714  callq _CVPixelBufferRelease(buf)
      CVPixelBufferRelease(buf);
    }

    // @0xdef655 / @0xdef719  testq %r14,%r14 ; the release @0xdef65d only runs when non-NULL
    if (attrs !== null) {
      CFRelease(attrs); // @0xdef65d
    }
    // @0xdef662  movq -0xb8(%rbp),%rax ; the epilogue @0xdef669 is the stack-protector check.
    return dup.value;
  }
}
