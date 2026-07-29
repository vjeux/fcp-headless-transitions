// dovImageTransform — anonymous-namespace helper from ProCore's PCColorUtil transform code.
// Thin wrapper that packs two source/dest BufferArgs<float> into a pair of vImage_Buffer
// stack structs and calls Accelerate.framework's vImageConvert_AnyToAny.
//
// Symbol: __ZL17dovImageTransformmP15vImageConverterRKN12_GLOBAL__N_110BufferArgsIKfEERKNS2_IfEE
// Demangled: dovImageTransform(unsigned long, vImageConverter*,
//                              (anonymous namespace)::BufferArgs<float const> const&,
//                              (anonymous namespace)::BufferArgs<float> const&)
// Address:  @ProCore 0x1131c
//
// Source disassembly: raw-port/re/disasm/ProCore.__ZL17dovImageTransformmP15vImageConverterRKN12_GLOBAL__N_110BufferArgsIKfEERKNS2_IfEE.s
//
// Body (29 lines, faithful):
//   0x1131c  pushq %rbp
//   0x1131d  movq %rsp, %rbp
//   0x11320  subq $0x40, %rsp                ; reserve 64 bytes = 2 x vImage_Buffer (each 0x20)
//   0x11324  movq %rsi, %rax                 ; rax = converter (2nd arg, preserved for the call)
//   ; ---- Build dst vImage_Buffer at -0x40(%rbp)  (rdx = &args-const  ... wait, %rdx = 3rd arg = SRC BufferArgs)
//   0x11327  movq (%rdx), %r8                ; r8 = src.buffer                    (BufferArgs +0x00)
//   0x1132a  leaq -0x40(%rbp), %rsi          ; rsi = &srcBuffer (top stack slot)
//   0x1132e  movq %r8, (%rsi)                ; srcBuffer.data       = src.buffer
//   0x11331  movl $0x1, %r8d
//   0x11337  movq %r8, 0x8(%rsi)             ; srcBuffer.height     = 1            (one row per call)
//   0x1133b  movq %rdi, 0x10(%rsi)           ; srcBuffer.width      = nPixels      (nPixels = 1st arg)
//   0x1133f  leaq (,%rdi,4), %r9             ; r9 = nPixels * 4  = row bytes per single-float channel
//   0x11347  movq 0x8(%rdx), %rdx            ; rdx = src.count      (BufferArgs +0x08 = channels)
//   0x1134b  imulq %r9, %rdx                 ; rdx = channels * nPixels * 4  = rowBytes
//   0x1134f  movq %rdx, 0x18(%rsi)           ; srcBuffer.rowBytes   = channels * nPixels * 4
//   ; ---- Build src vImage_Buffer at -0x20(%rbp)  (%rcx = 4th arg = DST BufferArgs)
//   0x11353  movq (%rcx), %r10               ; r10 = dst.buffer
//   0x11356  leaq -0x20(%rbp), %rdx          ; rdx = &dstBuffer (lower stack slot)
//   0x1135a  movq %r10, (%rdx)               ; dstBuffer.data       = dst.buffer
//   0x1135d  movq %r8, 0x8(%rdx)             ; dstBuffer.height     = 1
//   0x11361  movq %rdi, 0x10(%rdx)           ; dstBuffer.width      = nPixels
//   0x11365  imulq 0x8(%rcx), %r9            ; r9 = (nPixels*4) * dst.count = dst.channels*nPixels*4
//   0x1136a  movq %r9, 0x18(%rdx)            ; dstBuffer.rowBytes   = dst.channels * nPixels * 4
//   ; ---- call vImageConvert_AnyToAny(converter, &src, &dst, tempBuffer=NULL, flags=0)
//   0x1136e  movq %rax, %rdi                 ; arg1 = converter
//   0x11371  xorl %ecx, %ecx                 ; arg4 = 0 (tempBuffer=NULL — let vImage allocate)
//   0x11373  xorl %r8d, %r8d                 ; arg5 = 0 (kvImageNoFlags)
//   0x11376  callq _vImageConvert_AnyToAny   ; TAIL-ish (rax not used after)
//   0x1137b  addq $0x40, %rsp
//   0x1137f  popq %rbp
//   0x11380  retq
//
// Notice the ORDER: the FIRST built struct (at -0x40, %rsi) uses the %rdx argument (3rd arg = SRC
// per the demangled signature `BufferArgs<float const> const&` — the const-input) — this is
// consistent because vImageConvert_AnyToAny expects (converter, src, dst, ...) and the CALL passes
// %rsi as src and %rdx as dst. So the -0x40 struct really IS the SRC and -0x20 is the DST — the
// stack layout has DST at the LOWER address because vImage_Buffer is 32 bytes and rsp grows down,
// but the call passes %rsi (higher, populated from %rdx=SRC BufferArgs) first and %rdx (lower,
// populated from %rcx=DST BufferArgs) second, matching (src, dst) ABI. The code labels look "flipped"
// but the semantics are src→dst. See in-line comments above.
//
// vImage_Buffer struct layout (from libaccelerate.dylib SDK headers):
//   +0x00  void*   data       (base pointer to the pixel data)
//   +0x08  size_t  height     (number of rows)
//   +0x10  size_t  width      (number of columns / pixels per row)
//   +0x18  size_t  rowBytes   (bytes between successive rows in `data`)

/**
 * BufferArgs<float> layout (subset needed by this function; see writeOpaqueBlack.ts for the full
 * shape).
 */
export interface BufferArgs_dov_float_const {
  /** +0x00  float const*  buffer */
  buffer: Float32Array;
  /** +0x08  size_t  count  — # of float channels per pixel (used to compute rowBytes = count*width*4) */
  count: number;
}
export interface BufferArgs_dov_float {
  /** +0x00  float*  buffer */
  buffer: Float32Array;
  /** +0x08  size_t  count */
  count: number;
}

/**
 * Opaque vImageConverter pointer — Accelerate.framework type. Cannot be constructed in JS;
 * the actual vImage conversion is out-of-scope for this port.
 */
export type vImageConverterRef = { readonly __brand: "vImageConverter" };

/**
 * dovImageTransform(unsigned long nPixels, vImageConverter* converter,
 *                    BufferArgs<float const> const& src, BufferArgs<float> const& dst)
 * @ProCore 0x1131c  __ZL17dovImageTransformmP15vImageConverterRKN12_GLOBAL__N_110BufferArgsIKfEERKNS2_IfEE
 *
 * Faithful body — construct 2 vImage_Buffer structs from the BufferArgs, one for source and
 * one for destination, then call `_vImageConvert_AnyToAny`.
 *
 * vImageConvert_AnyToAny is an OUT-OF-SCOPE EXTERN (Accelerate.framework, dylib call, GOT
 * import stub @ProCore 0xdebf4 → dyld-resolved to the system Accelerate implementation).
 * The 5-framework port scope explicitly excludes Accelerate; per policy, we throw here at
 * the boundary citing the exact call-site + GOT slot addresses, matching how every other
 * CG/CF/ObjC extern is handled in this codebase.
 *
 * The RECORD of what would be dispatched (the two vImage_Buffer structs) is preserved so
 * a reviewer or a later Accelerate-boundary port can wire the conversion.
 */
export function dovImageTransform(
  nPixels: number,
  converter: vImageConverterRef | null,
  src: BufferArgs_dov_float_const,
  dst: BufferArgs_dov_float,
): void {
  // @0x11320  subq $0x40, %rsp — reserve 2 x vImage_Buffer on the stack.
  // We model the two structs as plain records mirroring the vImage_Buffer layout.
  const nPix = nPixels | 0;

  // @0x11327..0x1134f — SRC vImage_Buffer construction (built at -0x40(%rbp) via %rsi).
  //   data = src.buffer  ; height = 1 ; width = nPixels ; rowBytes = src.count * nPixels * 4
  const srcBuffer = {
    data: src.buffer,                              // @0x11327 movq (%rdx), %r8 ; @0x1132e movq %r8, (%rsi)
    height: 1,                                     // @0x11331 movl $0x1  ; @0x11337 movq %r8, 0x8(%rsi)
    width: nPix,                                   // @0x1133b movq %rdi, 0x10(%rsi)
    rowBytes: ((src.count | 0) * nPix * 4) | 0,    // @0x1133f leaq(,%rdi,4)   ; @0x11347 movq 0x8(%rdx),%rdx ; @0x1134b imulq %r9,%rdx
  };

  // @0x11353..0x1136a — DST vImage_Buffer construction (built at -0x20(%rbp) via %rdx).
  //   data = dst.buffer  ; height = 1 ; width = nPixels ; rowBytes = dst.count * nPixels * 4
  const dstBuffer = {
    data: dst.buffer,                              // @0x11353 movq (%rcx), %r10 ; @0x1135a movq %r10,(%rdx)
    height: 1,                                     // @0x1135d movq %r8, 0x8(%rdx)
    width: nPix,                                   // @0x11361 movq %rdi, 0x10(%rdx)
    rowBytes: ((dst.count | 0) * nPix * 4) | 0,    // @0x11365 imulq 0x8(%rcx),%r9 ; @0x1136a movq %r9, 0x18(%rdx)
  };

  // @0x1136e..0x11376  Call vImageConvert_AnyToAny(converter, &srcBuffer, &dstBuffer, NULL, 0)
  //   arg1 = %rdi = converter
  //   arg2 = %rsi = &srcBuffer
  //   arg3 = %rdx = &dstBuffer
  //   arg4 = %rcx = NULL         (xorl %ecx,%ecx — no temporary buffer; vImage allocates internally)
  //   arg5 = %r8  = 0            (xorl %r8d,%r8d — kvImageNoFlags)
  //
  // Accelerate.framework is a TRUE OUT-OF-SCOPE EXTERN — throw at the boundary citing
  // the exact GOT import-stub @ProCore 0xdebf4 (dyld resolves to the live Accelerate
  // implementation on macOS; we don't reproduce it in this port).
  throw new Error(
    `dovImageTransform @ProCore 0x1131c: would call vImageConvert_AnyToAny(` +
      `converter=${String(converter)}, src=${JSON.stringify({...srcBuffer, data: `<Float32Array len=${srcBuffer.data.length}>`})}, ` +
      `dst=${JSON.stringify({...dstBuffer, data: `<Float32Array len=${dstBuffer.data.length}>`})}, ` +
      `tempBuffer=NULL, flags=0) via import stub @ProCore 0xdebf4. ` +
      `_vImageConvert_AnyToAny is a TRUE out-of-scope extern (Accelerate.framework, libvImage) — ` +
      `see policy on boundary stubs (same as _CGColorSpaceRelease etc.).`,
  );
}
