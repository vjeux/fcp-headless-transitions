// raw-port/src/channels/OpticalFlowFields.ts
//
// FCP `OpticalFlowFields` — Helium wrapper for a persisted optical-flow
// buffer computed by `VTOpticalFlow` (VideoToolbox). The class packages a
// forward-and-backward flow pair backed by an `NSData` blob with a fixed
// header layout and two 32-byte-aligned float2 planes.
//
// Symbols decoded (Helium framework, x86_64 slice; VAs are otool -tV VMAs):
//   0x000256f0  OpticalFlowFields::OpticalFlowFields(int,int,int,void*,void*,int,NSData*(*)(unsigned long),int&)  [C2 factory ctor]
//   0x00025820  OpticalFlowFields::ComputeNSDataDimensions(unsigned long, unsigned long)
//   0x00025870  OpticalFlowFields::Serialize()
//   0x00025a10  OpticalFlowFields::OpticalFlowFields(int,int,int,void*,void*,int,NSData*(*)(unsigned long),int&)  [C1 complete factory ctor — trampoline]
//   0x00025a20  OpticalFlowFields::OpticalFlowFields(HGRect, NSData*, int&)                    [C2 deserializing ctor]
//   0x00025b40  OpticalFlowFields::ComputeFlowDimensions(HGRect const&)
//   0x00025d60  OpticalFlowFields::Deserialize()
//   0x00025da0  OpticalFlowFields::OpticalFlowFields(HGRect, NSData*, int&)                    [C1 complete deserializing ctor]
//   0x00025ec0  OpticalFlowFields::~OpticalFlowFields()                                        [D2 — identical to D1]
//   0x00025ee0  OpticalFlowFields::~OpticalFlowFields()                                        [D1]
//   0x00025f60  OpticalFlowFields::GetHGRectString(HGRect const&)                              [static]
//   0x000260b0  OpticalFlowFields::GetFlowNSData()
//   0x000260c0  OpticalFlowFields::GetFrameKey()
//   0x000260d0  OpticalFlowFields::GetFlowHGCVBitmap(OpticalFlowFields::FlowType, HGMetalContext*)
//   0x000262c0  OpticalFlowFields::GetOpticalFlowAPIRevisionNumber()                           [static]
//   0x003c1560  OpticalFlowFields::ComputeFlowDimensions(HGRect const&).cold.1                 [__isPlatformVersionAtLeast fail-path]
//
// ── STRUCT LAYOUT (recovered from Deserialize @0x25d60, C2 ctor @0x25da0,
//    ComputeNSDataDimensions @0x25820, GetFlowNSData @0x260b0, GetFrameKey
//    @0x260c0). Total size = 0x98 bytes. ─────────────────────────────────────
//     0x00 : HGRect  frameRectA                (movups %xmm0 zero-inits it before
//                                                ComputeFlowDimensions overwrites at
//                                                @0x25ba5 `movups %xmm0, 0x10(%r14)`  — wait,
//                                                that's 0x10, so frameRectA lives at 0x10.)
//     0x10 : HGRect  frameRect                 (16 bytes; overwritten by ComputeFlowDimensions
//                                                @0x25ba5 `movups %xmm0, 0x10(%r14)` from arg.)
//     0x20 : NSData* nsData                    (retained @0x25dbc, released via _objc_release
//                                                in ~OpticalFlowFields @0x25ee8, exposed by
//                                                GetFlowNSData @0x260b4)
//     0x28 : u64     flowWidth                 (from ComputeFlowDimensions, copied to 0x60 by C2 @0x25e1a)
//     0x30 : u64     flowHeight                (from ComputeFlowDimensions, copied to 0x68 by C2 @0x25e1e)
//     0x38 : u64     _pad38                    (movups xmm0=0 @0x25dcd; unused so far)
//     0x40 : void*   forwardFlowPtr            (nsData.bytes + headerBytes)
//     0x48 : void*   backwardFlowPtr           (forwardFlowPtr + alignedDataBytes)
//     0x50 : u64     frameKey                  (first 8 bytes of nsData.bytes; also default -1
//                                                @0x25dd9 in the deserializing ctor before overwrite)
//     0x58 : u64     _pad58                    (part of the 16B xorps @0x25dd1?)
//                                                (movq $0 into 0x48 by C2 @0x25dd1 zeroes 0x48;
//                                                 the movq $-1, 0x50 @0x25dd9 sets frameKey=-1)
//     0x60 : u64     width                     (0x28 copied here, or from ComputeNSDataDimensions arg)
//     0x68 : u64     height                    (0x30 copied here, or from ComputeNSDataDimensions arg)
//     0x70 : u64     rowBytes                  (width << 2 = width * 4 (bytes per float row))
//     0x78 : u64     dataBytes                 (rowBytes * height)
//     0x80 : u64     alignedDataBytes          ((dataBytes + 0x1f) & -0x20 — round up to 32 bytes)
//     0x88 : u64     headerBytes               (constant 0x20)
//     0x90 : u64     totalNSDataBytes          (0x20 + 2 * alignedDataBytes)
//
// ── SEMANTICS: this class packages a VTOpticalFlow-computed forward+backward
// pair as: header(0x20 bytes; first 8 bytes are the frameKey identifier) +
// forwardFlow(alignedDataBytes) + backwardFlow(alignedDataBytes), all inside
// one NSData blob. ────────────────────────────────────────────────────────────
//
// ── DECODED FUNCTION-SCOPE STATICS ────────────────────────────────────────
//   __ZZN17OpticalFlowFields21ComputeFlowDimensionsERK6HGRectE9onceToken
//     — dispatch_once_t for the first-time initialization of the cache.
//   __ZL30g_mapFrameToFlowDimensionsLock
//     — std::mutex for the g_mapFrameToFlowDimensions cache.
//   __ZL26g_mapFrameToFlowDimensions
//     — std::unordered_map<std::string, HGRect>. Keyed by GetHGRectString(rect).
//
// ── DECIDED SCOPE (this port) ──────────────────────────────────────────────
// PORTED (faithful transcription):
//   ComputeNSDataDimensions            @0x25820 — pure numeric layout computation.
//   GetHGRectString                    @0x25f60 — pure string formatting "WxH".
//   GetFlowNSData                      @0x260b0 — trivial field return.
//   GetFrameKey                        @0x260c0 — trivial field return.
//   Deserialize                        @0x25d60 — pointer/offset assignments from nsData.
//   GetOpticalFlowAPIRevisionNumber    @0x262c0 — platform-version-gated sign flip.
//
// STUBBED (throwing @0xADDR — undecoded ObjC / std::unordered_map / VTOpticalFlow
// / HGMetalContext / HGCVBitmap plumbing needed):
//   OpticalFlowFields (both ctors)     — retain NSData, mutex+cache lookup, ObjC message.
//   ~OpticalFlowFields                 — _objc_release on 0x20.
//   Serialize                          — @0x25870 (112 lines; ObjC + memcpy).
//   ComputeFlowDimensions              — @0x25b40 (mutex + hash-map + VTOpticalFlow + platform gate).
//   GetFlowHGCVBitmap                  — @0x260d0 (HGMetalContext, HGCVBitmap, Metal texture wrap).
//
// Each stubbed method throws citing its @0xADDR so frontier.py sees the outstanding decode work.

import { HGRect } from '../render/HGRect.js';

// ---------------------------------------------------------------------------
// Frontier stubs: FCP classes / OS APIs referenced but not yet transcribed.
// ---------------------------------------------------------------------------

/** Opaque NSData pointer (retained). Not yet transcribed as a class. */
export interface NSData {
  /** ObjC `-[NSData bytes]` — @Helium 0x25e7c, 0x25d74 (via objc selector "bytes"). */
  bytes(): { readonly buffer: ArrayBuffer; readonly byteOffset: number };
  /** ObjC `-[NSData length]` — @Helium 0x25e62. */
  length(): number;
}

/** Opaque HGMetalContext — used by GetFlowHGCVBitmap only. Not yet transcribed. */
export interface HGMetalContext {}

/** Opaque HGCVBitmap — return type of GetFlowHGCVBitmap. Not yet transcribed. */
export interface HGCVBitmap {}

/**
 * FlowType enum — the `NS_ENUM` argument to GetFlowHGCVBitmap.
 * Not directly readable from disasm (the caller passes a raw int); values
 * are inferred from the two-way branch at @0x260d0..0x26160.
 * @Helium enum type used in __ZN17OpticalFlowFields17GetFlowHGCVBitmapENS_8FlowTypeEP14HGMetalContext.
 */
export enum FlowType {
  /** @Helium GetFlowHGCVBitmap @0x260d0 — the "0" branch selects forwardFlowPtr @0x40. */
  Forward = 0,
  /** @Helium GetFlowHGCVBitmap @0x260d0 — the "!= 0" branch selects backwardFlowPtr @0x48. */
  Backward = 1,
}

// ---------------------------------------------------------------------------
// OpticalFlowFields
// ---------------------------------------------------------------------------

/**
 * `OpticalFlowFields` — a persisted forward+backward optical-flow pair.
 *
 * @Helium ctors @0x256f0 (C2 factory) / 0x25a10 (C1 factory);
 *         @0x25a20 (C2 deserializing) / 0x25da0 (C1 deserializing);
 *         dtors  @0x25ec0 (D2) / 0x25ee0 (D1).
 */
export class OpticalFlowFields {
  /** @Helium 0x25ba5 — HGRect at +0x10 (copied from ctor arg by ComputeFlowDimensions). */
  frameRect: HGRect;
  /** @Helium 0x25dc2 — NSData* @+0x20 (retained via _objc_retain @0x25dbc). */
  nsData: NSData | null;
  /** @Helium 0x25e1a — flowWidth @+0x28 (from ComputeFlowDimensions). */
  flowWidth: number;
  /** @Helium 0x25e1e — flowHeight @+0x30 (from ComputeFlowDimensions). */
  flowHeight: number;
  /** @Helium 0x25e90 — pointer into NSData bytes at header offset. u64 raw addr in the C++. */
  forwardFlowPtr: number;
  /** @Helium 0x25e9b — pointer to backward plane = forwardFlowPtr + alignedDataBytes. */
  backwardFlowPtr: number;
  /** @Helium 0x25e85 / 0x25dd9 default — first 8 bytes of NSData.bytes (or -1 sentinel). */
  frameKey: bigint;
  /** @Helium 0x25e1a → 0x25824 — width fed to ComputeNSDataDimensions and stored at +0x60. */
  width: number;
  /** @Helium 0x25e1e → 0x25828 — height fed to ComputeNSDataDimensions and stored at +0x68. */
  height: number;
  /** @Helium 0x25830 — width << 2 (bytes per row of float2/float4 pixels). */
  rowBytes: bigint;
  /** @Helium 0x25838 — rowBytes * height. */
  dataBytes: bigint;
  /** @Helium 0x2583c-0x25840 — (dataBytes + 0x1f) & -0x20. */
  alignedDataBytes: bigint;
  /** @Helium 0x2584b — constant 0x20 (header size). */
  headerBytes: bigint;
  /** @Helium 0x25856-0x2585e — 0x20 + 2 * alignedDataBytes. */
  totalNSDataBytes: bigint;

  /**
   * `OpticalFlowFields::OpticalFlowFields(HGRect, NSData*, int&)` — @Helium 0x25da0.
   * NOT yet transcribed. Body retains nsData, zero-inits fields 0x28..0x90,
   * calls ComputeFlowDimensions (throws), computes NSData layout math (which
   * we DO port in a helper below), then verifies `[nsData length] == totalNSDataBytes`
   * and writes back int& err = 0 (or -1).
   *
   * @Helium 0x25da0 — throws (ObjC + ComputeFlowDimensions frontier).
   */
  constructor() {
    // We don't run the real ctor here — this class is a data container the
    // helper methods operate on. A JS-side factory is deferred until the
    // ObjC + VTOpticalFlow bridging is transcribed. Fields are initialized
    // to their default zero values so the type is well-formed.
    // @Helium 0x25dc6..0x25df0: xorps/movups zero the layout region.
    this.frameRect = { x: 0, y: 0, right: 0, bottom: 0 };
    this.nsData = null;
    this.flowWidth = 0;
    this.flowHeight = 0;
    this.forwardFlowPtr = 0;
    this.backwardFlowPtr = 0;
    // @Helium 0x25dd9: default frameKey = -1 (0xFFFFFFFFFFFFFFFF).
    this.frameKey = -1n;
    this.width = 0;
    this.height = 0;
    this.rowBytes = 0n;
    this.dataBytes = 0n;
    this.alignedDataBytes = 0n;
    // @Helium 0x25841 / 0x2584b: constant 0x20.
    this.headerBytes = 0x20n;
    this.totalNSDataBytes = 0n;
  }

  /**
   * `OpticalFlowFields::ComputeNSDataDimensions(u64 width, u64 height)` — @Helium 0x25820.
   *
   * Asm (verbatim):
   *   0x25824  movq  %rsi, 0x60(%rdi)          ; this.width = width
   *   0x25828  movq  %rdx, 0x68(%rdi)          ; this.height = height
   *   0x2582c  shlq  $2, %rsi                  ; rsi = width * 4
   *   0x25830  movq  %rsi, 0x70(%rdi)          ; this.rowBytes = width * 4
   *   0x25834  imulq %rdx, %rsi                ; rsi = rowBytes * height
   *   0x25838  movq  %rsi, 0x78(%rdi)          ; this.dataBytes = rowBytes * height
   *   0x2583c  addq  $0x1f, %rsi               ; rsi += 31
   *   0x25840  andq  $-0x20, %rsi              ; rsi &= ~31   (round up to 32)
   *   0x25844  movq  %rsi, 0x80(%rdi)          ; this.alignedDataBytes = rsi
   *   0x2584b  movq  $0x20, 0x88(%rdi)         ; this.headerBytes = 0x20
   *   0x25856  leaq  0x20(,%rsi,2), %rax       ; rax = 2 * alignedDataBytes + 0x20
   *   0x2585e  movq  %rax, 0x90(%rdi)          ; this.totalNSDataBytes = 2*aligned + 0x20
   *   0x25865  ret
   *
   * `shlq $2` is a signed shift on a signed 64-bit; here rsi is unsigned
   * width, so overflow only happens for width > 2^62 (impractical).
   * The AND-with-negative constant is a mask: `-0x20` == `0xFFFF...FFE0`.
   */
  ComputeNSDataDimensions(width: bigint, height: bigint): void {
    // @Helium 0x25824-0x25828
    this.width = Number(width);
    this.height = Number(height);
    // @Helium 0x2582c-0x25830: rowBytes = width * 4
    const rowBytes = width << 2n;
    this.rowBytes = rowBytes;
    // @Helium 0x25834-0x25838: dataBytes = rowBytes * height
    const dataBytes = rowBytes * height;
    this.dataBytes = dataBytes;
    // @Helium 0x2583c-0x25844: alignedDataBytes = (dataBytes + 31) & ~31
    const aligned = (dataBytes + 0x1fn) & ~0x1fn;
    this.alignedDataBytes = aligned;
    // @Helium 0x2584b: headerBytes = 0x20
    this.headerBytes = 0x20n;
    // @Helium 0x25856-0x2585e: totalNSDataBytes = 0x20 + 2 * alignedDataBytes
    this.totalNSDataBytes = 0x20n + 2n * aligned;
  }

  /**
   * `OpticalFlowFields::GetHGRectString(HGRect const&)` — @Helium 0x25f60. Static.
   *
   * Returns a std::string of the form `"WxH"` where W = rect.right - rect.x and
   * H = rect.bottom - rect.y (as unsigned 32-bit widths).
   *
   * Asm (verbatim, minus SSO/string cleanup):
   *   0x25f73  movl  0x8(%rdx), %esi         ; esi = rect.right
   *   0x25f76  subl  (%rdx), %esi            ; esi = rect.right - rect.x  (i32 sub)
   *   0x25f7f  callq __ZNSt3__19to_stringEj  ; s = std::to_string((u32)esi)
   *   0x25f8e  callq basic_string::append("x")
   *   0x25fb0  movl  0xc(%r14), %esi         ; esi = rect.bottom
   *   0x25fb4  subl  0x4(%r14), %esi         ; esi = rect.bottom - rect.y
   *   0x25fbc  callq __ZNSt3__19to_stringEj  ; s2 = std::to_string((u32)esi)
   *   0x25fde  callq basic_string::append(s2)
   *   0x25fe7-0x25ff7  copy result into caller's std::string slot
   *   0x2601a  ret
   *
   * `__ZNSt3__19to_stringEj` is the `unsigned int` overload — so a negative
   * width silently wraps. This exactly matches JS's `>>> 0` unsigned reading.
   */
  static GetHGRectString(rect: HGRect): string {
    // @Helium 0x25f73-0x25f76: (rect.right - rect.x) as u32.
    const w = (rect.right - rect.x) >>> 0;
    // @Helium 0x25fb0-0x25fb4: (rect.bottom - rect.y) as u32.
    const h = (rect.bottom - rect.y) >>> 0;
    // @Helium 0x25f7f + 0x25f8e + 0x25fde: to_string(w) + "x" + to_string(h)
    return `${w}x${h}`;
  }

  /**
   * `OpticalFlowFields::GetFlowNSData()` — @Helium 0x260b0.
   *
   * Asm (verbatim):
   *   0x260b4  movq  0x20(%rdi), %rax        ; rax = this.nsData
   *   0x260b8  popq  %rbp
   *   0x260b9  retq
   */
  GetFlowNSData(): NSData | null {
    // @Helium 0x260b4: return this.nsData.
    return this.nsData;
  }

  /**
   * `OpticalFlowFields::GetFrameKey()` — @Helium 0x260c0.
   *
   * Asm (verbatim):
   *   0x260c4  movq  0x50(%rdi), %rax        ; rax = this.frameKey  (u64)
   *   0x260c8  popq  %rbp
   *   0x260c9  retq
   */
  GetFrameKey(): bigint {
    // @Helium 0x260c4: return this.frameKey.
    return this.frameKey;
  }

  /**
   * `OpticalFlowFields::Deserialize()` — @Helium 0x25d60.
   *
   * Reads the first 8 bytes of nsData.bytes as the frameKey, then sets
   * forwardFlowPtr = bytes + headerBytes and backwardFlowPtr = bytes +
   * headerBytes + alignedDataBytes.
   *
   * Asm (verbatim):
   *   0x25d69  movq 0x20(%rdi), %rdi         ; rdi = this.nsData
   *   0x25d6d  movq (selector "bytes"), %rsi
   *   0x25d74  callq *(objc_msgSend)         ; rax = nsData.bytes  (const void*)
   *   0x25d7a  movq (%rax), %rcx             ; rcx = *(u64*)rax    (first 8 bytes)
   *   0x25d7d  movq %rcx, 0x50(%rbx)         ; this.frameKey = rcx
   *   0x25d81  addq 0x88(%rbx), %rax         ; rax += this.headerBytes (0x20)
   *   0x25d88  movq %rax, 0x40(%rbx)         ; this.forwardFlowPtr = bytes + 0x20
   *   0x25d8c  addq 0x80(%rbx), %rax         ; rax += this.alignedDataBytes
   *   0x25d93  movq %rax, 0x48(%rbx)         ; this.backwardFlowPtr = bytes + 0x20 + alignedDataBytes
   *   0x25d9c  retq
   *
   * @Helium 0x25d60 — this port models the pointer arithmetic on numeric
   * offsets since JS has no raw void*. Callers work in (buffer, offset) pairs.
   */
  Deserialize(): void {
    // @Helium 0x25d69-0x25d74: nsData.bytes (throws if nsData is null; ObjC frontier).
    if (this.nsData == null) {
      throw new Error(
        'OpticalFlowFields::Deserialize @Helium 0x25d69: nsData is null ' +
          '(retain in ctor @0x25dbc must have populated it — the ObjC ctor is a frontier stub)',
      );
    }
    const bytes = this.nsData.bytes();
    // @Helium 0x25d7a-0x25d7d: this.frameKey = *(u64*)bytes.
    const dv = new DataView(bytes.buffer, bytes.byteOffset, 8);
    // Little-endian on x86_64 (macOS).
    this.frameKey = dv.getBigUint64(0, true);
    // @Helium 0x25d81-0x25d88: this.forwardFlowPtr = byteOffset + headerBytes.
    // (We store the OFFSET-into-buffer, not a raw address, since JS has none.)
    const baseOffset = BigInt(bytes.byteOffset);
    this.forwardFlowPtr = Number(baseOffset + this.headerBytes);
    // @Helium 0x25d8c-0x25d93: this.backwardFlowPtr = forwardFlowPtr + alignedDataBytes.
    this.backwardFlowPtr = Number(
      baseOffset + this.headerBytes + this.alignedDataBytes,
    );
  }

  /**
   * `OpticalFlowFields::GetOpticalFlowAPIRevisionNumber()` — @Helium 0x262c0. Static.
   *
   * Asm (verbatim):
   *   0x262c4  movl $1,  %edi                 ; platform = macOS (1)
   *   0x262c9  movl $0xf, %esi                ; major = 15
   *   0x262ce  movl $4,  %edx                 ; minor = 4
   *   0x262d3  xorl %ecx, %ecx                ; patch = 0
   *   0x262d5  callq ___isPlatformVersionAtLeast   ; eax = (macOS >= 15.4) ? 1 : 0
   *   0x262da  xorl %ecx, %ecx
   *   0x262dc  cmpl $1, %eax                  ; cf = (eax < 1) ? 1 : 0
   *   0x262df  setae %cl                      ; cl = (eax >= 1) ? 1 : 0
   *   0x262e2  leaq -1(,%rcx,2), %rax         ; rax = 2*cl - 1  ∈ {-1, +1}
   *   0x262eb  retq
   *
   * Returns +1 on macOS ≥ 15.4, else -1.
   */
  static GetOpticalFlowAPIRevisionNumber(): number {
    // @Helium 0x262d5: __isPlatformVersionAtLeast(macOS, 15, 4, 0) — throws (OS API frontier).
    const atLeast = OpticalFlowFields_isPlatformVersionAtLeast(1, 0xf, 4, 0);
    // @Helium 0x262dc-0x262e2: cl = (atLeast >= 1) ? 1 : 0; ret = 2*cl - 1.
    const cl = atLeast >= 1 ? 1 : 0;
    return 2 * cl - 1;
  }

  /**
   * `OpticalFlowFields::OpticalFlowFields(int, int, int, void*, void*, int,
   *                                       NSData* (*)(unsigned long), int&)`
   * — @Helium 0x256f0 (C2) / 0x25a10 (C1 trampoline).
   *
   * Factory ctor: builds an NSData of totalNSDataBytes via the passed allocator
   * function pointer, memcpy's the two flow planes into it, and stores as
   * `this.nsData`. NOT yet transcribed — needs NSData/ObjC bridging.
   *
   * @Helium 0x256f0 — throws (ObjC + function-pointer allocator frontier).
   */
  static ctorFromRawFlows(): OpticalFlowFields {
    throw new Error(
      'OpticalFlowFields::OpticalFlowFields(int,int,int,void*,void*,int,NSData*(*)(u64),int&) ' +
        'not yet transcribed @Helium 0x256f0 (C2) / 0x25a10 (C1) — requires NSData + ObjC bridging',
    );
  }

  /**
   * `OpticalFlowFields::OpticalFlowFields(HGRect, NSData*, int&)` — @Helium
   * 0x25a20 (C2) / 0x25da0 (C1). Deserializing ctor: retains nsData, calls
   * ComputeFlowDimensions (throws — frontier), computes the NSData layout,
   * verifies `[nsData length] == totalNSDataBytes` (writes -1 to err if not).
   *
   * @Helium 0x25da0 — throws (ObjC retain + ComputeFlowDimensions frontier).
   */
  static ctorFromNSData(_frameRect: HGRect, _nsData: NSData): OpticalFlowFields {
    throw new Error(
      'OpticalFlowFields::OpticalFlowFields(HGRect, NSData*, int&) ' +
        'not yet transcribed @Helium 0x25da0 (C1) / 0x25a20 (C2) — requires ObjC + ComputeFlowDimensions',
    );
  }

  /**
   * `OpticalFlowFields::~OpticalFlowFields()` — @Helium 0x25ec0 (D2) / 0x25ee0 (D1).
   *
   * Asm (verbatim, D1 @0x25ee0):
   *   0x25ee4  movq 0x20(%rdi), %rdi           ; rdi = this.nsData
   *   0x25ee8  callq *(literal-pool _objc_release) ; _objc_release(nsData)
   *   0x25eef  retq
   *
   * @Helium 0x25ee8 — throws (ObjC release frontier).
   */
  destruct(): void {
    if (this.nsData != null) {
      throw new Error(
        'OpticalFlowFields::~OpticalFlowFields not yet transcribed @Helium 0x25ee0 ' +
          '(_objc_release on nsData @0x25ee8 — ObjC frontier)',
      );
    }
  }

  /**
   * `OpticalFlowFields::Serialize()` — @Helium 0x25870. 112 lines. NOT yet
   * transcribed — memcpy's the two flow planes plus the frameKey header into
   * the retained NSData blob (opposite direction of Deserialize).
   *
   * @Helium 0x25870 — throws.
   */
  Serialize(): void {
    throw new Error(
      'OpticalFlowFields::Serialize not yet transcribed @Helium 0x25870 ' +
        '(112 lines of ObjC + memcpy)',
    );
  }

  /**
   * `OpticalFlowFields::ComputeFlowDimensions(HGRect const&)` — @Helium 0x25b40.
   * 
   * Calls __isPlatformVersionAtLeast(1,15,4,0) (@0x25b68) to gate on macOS 15.4;
   * on older systems the .cold.1 handler @0x3c1560 fires. On new systems, acquires
   * `g_mapFrameToFlowDimensionsLock` (@0x25b8d), looks up GetHGRectString(rect) in
   * `g_mapFrameToFlowDimensions` (@0x25bb5), and either reuses the cached HGRect
   * or invokes VTOpticalFlow to compute new dimensions via `VTOpticalFlowConfiguration`
   * (@0x25bcc allocates the ObjC class, @0x25bd8+ reads rect.right-rect.x for width).
   *
   * NOT yet transcribed — needs VideoToolbox, std::mutex, std::unordered_map bridging.
   *
   * @Helium 0x25b40 — throws.
   */
  ComputeFlowDimensions(_rect: HGRect): void {
    throw new Error(
      'OpticalFlowFields::ComputeFlowDimensions not yet transcribed @Helium 0x25b40 ' +
        '(VTOpticalFlowConfiguration + std::mutex + std::unordered_map + platform gate)',
    );
  }

  /**
   * `OpticalFlowFields::GetFlowHGCVBitmap(FlowType, HGMetalContext*)` — @Helium 0x260d0.
   * 150 lines. NOT yet transcribed — wraps the appropriate flow plane
   * (forwardFlowPtr @0x40 for FlowType::Forward, backwardFlowPtr @0x48 otherwise)
   * in an HGCVBitmap object bound to the passed HGMetalContext.
   *
   * @Helium 0x260d0 — throws.
   */
  GetFlowHGCVBitmap(_type: FlowType, _ctx: HGMetalContext): HGCVBitmap {
    throw new Error(
      'OpticalFlowFields::GetFlowHGCVBitmap not yet transcribed @Helium 0x260d0 ' +
        '(HGMetalContext + HGCVBitmap wrapping — 150 lines)',
    );
  }
}

/**
 * `__isPlatformVersionAtLeast(platform, major, minor, patch)` — libSystem stub.
 * Called from ComputeFlowDimensions @0x25b68 and
 * GetOpticalFlowAPIRevisionNumber @0x262d5. Not part of the Helium binary; a
 * proper JS-side implementation would query `process.platform` + macOS
 * version, but that has no place in a bit-exact port. Throws until wired.
 */
function OpticalFlowFields_isPlatformVersionAtLeast(
  _platform: number,
  _major: number,
  _minor: number,
  _patch: number,
): number {
  throw new Error(
    '__isPlatformVersionAtLeast not yet transcribed — libSystem stub ' +
      '(called from OpticalFlowFields::ComputeFlowDimensions @Helium 0x25b68 ' +
      'and OpticalFlowFields::GetOpticalFlowAPIRevisionNumber @Helium 0x262d5)',
  );
}
