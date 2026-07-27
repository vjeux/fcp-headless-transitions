// PCBitDepth.ts — ProCore's PCBitDepth free-function bit-depth / pixel-format enum plumbing.
// One class = one file (per porting-spec Rule 6). Transcribed line-for-line from the six methods
// in ProCore at 0x3572c..0x35854; see raw-port/re/disasm/ProCore.PCBitDepth.*.s.
//
// The Type enum is 0..3 (U8=0, U16=1, F16=2, F32=3). Two of the getters (getBitsPerPixel and
// getBitsPerChannel) do NO bounds check in the binary — they blindly index a 4-entry u32 table.
// We mirror that exactly and let the caller pass a Type. Two others (bitDepthToPixelFormat and
// getFromPixelFormat) DO bounds-check the input and return 0 (kUnsupported) on out-of-range.
//
// Data tables read verbatim from /tmp/ProCore.x86_64 (thin x86_64 slice of
// /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore):
//
//   __ZN10PCBitDepth13_bitsPerPixelE   @0x15af40  u32[4] = [32, 64, 64, 128]
//   __ZN10PCBitDepth15_bitsPerChannelE @0x15af50  u32[4] = [ 8, 16, 16,  32]
//
//   bitDepthToPixelFormat const table  @0x124010  u32[4] = [3, 10, 13, 16]
//     (referenced by leaq 0xee81e(%rip) at 0x357eb -> 0x357f2+0xee81e = 0x124010)
//
//   getFromPixelFormat  const table    @0x123fe0  u32[11] =
//       [1, 0, 1, 1, 2, 0, 2, 3, 0, 3, 3]
//     (referenced by leaq 0xee807(%rip) at 0x357d2 -> 0x357d9+0xee807 = 0x123fe0;
//      only the first 11 entries are used since cmpl $0xa/ja returns 0 for index>10.)
//
// Self-check (numeric ground-truth from the tables + branch logic):
//   getBitsPerPixel(U8=0)        = 32
//   getBitsPerPixel(F32=3)       = 128
//   getBitsPerChannel(F16=2)     = 16
//   bitDepthToPixelFormat(U16=1) = 10
//   bitDepthToPixelFormat(4)     = 0        // ja branch: index>3 -> 0
//   getFromPixelFormat(7)        = 1        // (7-7)=0 -> table[0]=1
//   getFromPixelFormat(17)       = 3        // (17-7)=10 -> table[10]=3
//   getFromPixelFormat(18)       = 0        // (18-7)=11 > 10 -> ja returns 0
//   getFromPixelFormat(6)        = 0        // (6-7)=0xFFFFFFFF > 10 (unsigned) -> 0
//   getFromBitsPerChannel(32, false) = 3    // F32
//   getFromBitsPerChannel(16, false) = 2    // 2-0 = 2 (F16)
//   getFromBitsPerChannel(16, true ) = 1    // 2-1 = 1 (U16)
//   getFromBitsPerChannel(8, false)  = 0    // U8
//   getFromQTDepth(0x29 /*41*/, _)   = 1    // U16
//   getFromQTDepth(0x30 /*48*/, _)   = 1
//   getFromQTDepth(0x40 /*64*/, false) = 2  // 2-0 (F16)
//   getFromQTDepth(0x40 /*64*/, true)  = 1  // 2-1 (U16)
//   getFromQTDepth(0x80 /*128*/, _)  = 3
//   getFromQTDepth(0x428/*1064*/, _) = 2
//   getFromQTDepth(0, _)             = 0

/** PCBitDepth::Type enum values (0..3). Matches the 4-entry _bitsPerPixel / _bitsPerChannel tables
 *  and the 4-entry bitDepthToPixelFormat table indexed by this enum. */
export const PCBitDepthType = {
  U8: 0,
  U16: 1,
  F16: 2,
  F32: 3,
} as const;
export type PCBitDepthType = number; // the C++ enum widens to int32 in every accessor.

// -----------------------------------------------------------------------------
// Data tables — bytes read verbatim from /tmp/ProCore.x86_64 at the addresses
// above. Every element is a u32 stored little-endian in the binary.
// -----------------------------------------------------------------------------

/** @const ProCore __ZN10PCBitDepth13_bitsPerPixelE @0x15af40 (u32[4]). */
const _bitsPerPixel: readonly number[] = [32, 64, 64, 128];

/** @const ProCore __ZN10PCBitDepth15_bitsPerChannelE @0x15af50 (u32[4]). */
const _bitsPerChannel: readonly number[] = [8, 16, 16, 32];

/** @const ProCore __TEXT __const @0x124010 (u32[4]) — bitDepthToPixelFormat lookup. */
const _bitDepthToPixelFormatTable: readonly number[] = [3, 10, 13, 16];

/** @const ProCore __TEXT __const @0x123fe0 (u32[11]) — getFromPixelFormat lookup,
 *  indexed by (ChannelOrder - 7). */
const _getFromPixelFormatTable: readonly number[] = [
  1, 0, 1, 1, 2, 0, 2, 3, 0, 3, 3,
];

// -----------------------------------------------------------------------------
// Methods (transcribed 1:1 from disasm)
// -----------------------------------------------------------------------------

/**
 * PCBitDepth::getBitsPerPixel(Type) -> int
 * @0x3572c ProCore (__ZN10PCBitDepth15getBitsPerPixelENS_4TypeE)
 *
 * Disasm:
 *   movl  %edi, %eax                        ; eax = t (32-bit zero-extend)
 *   leaq  __ZN10PCBitDepth13_bitsPerPixelE(%rip), %rcx
 *   movl  (%rcx,%rax,4), %eax                ; eax = _bitsPerPixel[t]
 *   ret
 *
 * NO bounds check in the binary.
 */
export function getBitsPerPixel(t: PCBitDepthType): number {
  const idx = (t | 0) >>> 0;               // movl %edi,%eax — zero-extend low 32 into eax
  return _bitsPerPixel[idx] | 0;           // movl (%rcx,%rax,4),%eax — signed-int result
}

/**
 * PCBitDepth::getBitsPerChannel(Type) -> int
 * @0x3573e ProCore (__ZN10PCBitDepth17getBitsPerChannelENS_4TypeE)
 *
 * Same shape as getBitsPerPixel — blind indexed table read of _bitsPerChannel.
 */
export function getBitsPerChannel(t: PCBitDepthType): number {
  const idx = (t | 0) >>> 0;
  return _bitsPerChannel[idx] | 0;
}

/**
 * PCBitDepth::getFromQTDepth(int depth, bool alpha) -> Type
 * @0x35750 ProCore (__ZN10PCBitDepth14getFromQTDepthEib)
 *
 * Disasm summary:
 *   xorl  %eax,%eax                         ; result = 0 (U8) by default
 *   cmpl  $0x3f, %edi
 *   jle   0x35777                           ; if depth <= 63 goto small-branch
 *   cmpl  $0x40, %edi ; je 0x35788          ; depth == 64  -> "64 branch"
 *   cmpl  $0x80, %edi ; je 0x35795          ; depth == 128 -> $3
 *   cmpl  $0x428, %edi ; jne 0x3579a        ; depth != 1064 -> return 0
 *   movl  $0x2, %eax ; jmp 0x3579a          ; depth == 1064 -> $2
 * small-branch (0x35777):
 *   cmpl  $0x29, %edi ; je 0x35781          ; depth == 41  -> $1
 *   cmpl  $0x30, %edi ; jne 0x3579a         ; depth != 48  -> return 0
 *   movl  $0x1, %eax ; jmp 0x3579a          ; depth == 48  -> $1
 * "64 branch" (0x35788):
 *   movzbl %sil,%ecx ; movl $0x2,%eax ; subl %ecx,%eax   ; result = 2 - (alpha?1:0)
 *   jmp 0x3579a
 */
export function getFromQTDepth(depth: number, alpha: boolean): PCBitDepthType {
  const d = depth | 0;                       // signed 32-bit compare
  if (d <= 0x3f) {
    if (d === 0x29 || d === 0x30) return 1;  // U16 for QT depths 41 or 48
    return 0;                                // U8 default
  }
  if (d === 0x40) {                          // 64-bit — depends on alpha flag
    const a = alpha ? 1 : 0;                 // movzbl %sil,%ecx (bool -> 0/1)
    return (2 - a) | 0;                      // 2 (F16) or 1 (U16)
  }
  if (d === 0x80) return 3;                  // F32
  if (d === 0x428) return 2;                 // F16
  return 0;
}

/**
 * PCBitDepth::getFromBitsPerChannel(int bits, bool alpha) -> Type
 * @0x3579c ProCore (__ZN10PCBitDepth21getFromBitsPerChannelEib)
 *
 * Disasm:
 *   cmpl $0x20, %edi ; je 0x357b7           ; bits == 32 -> return 3
 *   cmpl $0x10, %edi ; jne 0x357be          ; bits != 16 -> return 0
 *   movzbl %sil, %ecx ; movl $0x2, %eax
 *   subl  %ecx, %eax                        ; result = 2 - (alpha?1:0)
 *   jmp   0x357c0
 */
export function getFromBitsPerChannel(
  bits: number,
  alpha: boolean,
): PCBitDepthType {
  const b = bits | 0;
  if (b === 0x20) return 3;                  // F32
  if (b === 0x10) {                          // 16-bit — depends on alpha flag
    const a = alpha ? 1 : 0;
    return (2 - a) | 0;                      // 2 (F16) or 1 (U16)
  }
  return 0;                                  // xorl %eax,%eax fall-through
}

/**
 * PCBitDepth::getFromPixelFormat(PCPixelFormat::ChannelOrder) -> Type
 * @0x357c2 ProCore (__ZN10PCBitDepth18getFromPixelFormatEN13PCPixelFormat12ChannelOrderE)
 *
 * Disasm:
 *   addl  $-0x7, %edi                       ; edi = order - 7
 *   xorl  %eax, %eax                        ; result = 0 default
 *   cmpl  $0xa, %edi
 *   ja    0x357dc                           ; UNSIGNED compare — order-7 > 10 -> return 0
 *   movl  %edi, %eax
 *   leaq  0xee807(%rip), %rcx                ; -> 0x123fe0
 *   movl  (%rcx,%rax,4), %eax                ; eax = table[order-7]
 *   ret
 *
 * The `ja` (unsigned above) is critical — passing order < 7 wraps to a huge unsigned
 * number and hits the bounds path, returning 0.
 */
export function getFromPixelFormat(order: number): PCBitDepthType {
  const shifted = ((order | 0) - 7) >>> 0;   // (order - 7) as u32 (addl $-0x7,%edi)
  if (shifted > 0xa) return 0;               // ja 0x357dc
  return _getFromPixelFormatTable[shifted] | 0;
}

/**
 * PCBitDepth::bitDepthToPixelFormat(Type) -> PCPixelFormat
 * @0x357de ProCore (__ZN10PCBitDepth21bitDepthToPixelFormatENS_4TypeE)
 *
 * Disasm:
 *   xorl  %eax, %eax                        ; result = 0 default
 *   cmpl  $0x3, %edi
 *   ja    0x357f5                           ; unsigned t > 3 -> return 0
 *   movl  %edi, %eax
 *   leaq  0xee81e(%rip), %rcx                ; -> 0x124010
 *   movl  (%rcx,%rax,4), %eax                ; eax = table[t]
 *   ret
 */
export function bitDepthToPixelFormat(t: PCBitDepthType): number {
  const idx = (t | 0) >>> 0;                 // unsigned compare via `ja`
  if (idx > 3) return 0;
  return _bitDepthToPixelFormatTable[idx] | 0;
}
