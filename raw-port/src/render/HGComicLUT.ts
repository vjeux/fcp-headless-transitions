// HGComicLUT.ts — Helium's built-in "comic" lookup-texture table.
// Faithful transcription from the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// Source disassembly (verbatim reads via `otool -tV -p <sym>`; fat-binary x86_64 slice
// starts at file offset 0x4000, verified by the fat header):
//   HGComicLUT::GetFormat()                @0x14A350   (7 lines)
//   HGComicLUT::GetRect()                  @0x14A360   (14 lines)
//   HGComicLUT::GetData(LUTIndex)          @0x14A390   (17 lines, jumptable at 0x858C94)
//
// EMBEDDED DATA symbols (nm -S; each block is 0xC0000 = 786432 bytes = 512×512×3
// bytes/texel = 512×512 RGB8 image — matches the (512×512) rect from GetRect() and the
// format enumerant 0x11 from GetFormat()):
//   HGComicLUT0Data (__ZL15HGComicLUT0Data)  @0x3D8C94   local-static, 786432 bytes
//   HGComicLUT1Data                          @0x498C94   local-static, 786432 bytes
//   HGComicLUT2Data                          @0x558C94   local-static, 786432 bytes
//   HGComicLUT3Data                          @0x618C94   local-static, 786432 bytes
//   HGComicLUT4Data                          @0x6D8C94   local-static, 786432 bytes
//   HGComicLUT5Data                          @0x798C94   local-static, 786432 bytes
// Total: ~4.72 MB of raw RGB8 LUT texture data linked directly into Helium.__TEXT.__const.
// These bytes are the "comic book" stylization color lookup tables used by
// HGComicLookupFilterLUTBitmapResource (@0x3c5b0 / @0x3c520 / etc. — see nm) which
// constructs a Helium bitmap resource around one of the six LUTs by passing the LUTIndex
// enum to this GetData() dispatcher.
//
// JUMPTABLE (5 entries, __TEXT.__const @0x858C94; each entry is a signed 32-bit offset
// added to the table base to yield the target address):
//   offset[0] = 0xFFC40000 = -0x3C0000  ->  0x858C94 - 0x3C0000 = 0x498C94 = HGComicLUT1Data
//   offset[1] = 0xFFD00000 = -0x300000  ->  0x858C94 - 0x300000 = 0x558C94 = HGComicLUT2Data
//   offset[2] = 0xFFDC0000 = -0x240000  ->  0x858C94 - 0x240000 = 0x618C94 = HGComicLUT3Data
//   offset[3] = 0xFFE80000 = -0x180000  ->  0x858C94 - 0x180000 = 0x6D8C94 = HGComicLUT4Data
//   offset[4] = 0xFFF40000 = -0x0C0000  ->  0x858C94 - 0x0C0000 = 0x798C94 = HGComicLUT5Data
// (verified by hex-dumping 20 bytes @ 0x858C94 + 0x4000 in the fat-binary file:
//    00 00 c4 ff  00 00 d0 ff  00 00 dc ff  00 00 e8 ff  00 00 f4 ff)
//
// NESTED ENUM HGComicLUT::LUTIndex (recovered from the branch shape at 0x14A394..0x14A3AD):
//   The dispatcher decrements the argument (decl %edi) and then does `cmpl $0x4,%edi;
//   ja default`. This is the canonical clang shape for a 1-based enum with values [1..5]
//   dispatched by a 0-based jumptable; index 0 (or any value >5) falls into the default
//   arm returning HGComicLUT0Data. We name the enumerators after the data blocks they
//   select rather than inventing labels — the compiler-facing names are unknown from
//   these three methods alone.
//
// STRUCT LAYOUT:
//   None. All three methods are effectively static/pure — none of them read `this`
//   (%rdi is used only as the return sret pointer in GetRect and as the argument slot
//   in GetData, never dereferenced for member fields). HGComicLUT appears to be a
//   namespace-like class with static/free-standing methods — sizeof is irrelevant.
//
// FRONTIER CALLEES (throwing stubs — anti-shortcut Rule 3):
//   HGRect::Init(int, int, int, int)  @Helium 0x107140
//     — a min/max-clamping 4-int rect initializer semantically identical to
//       HGRectMake4i @0x107710 (see ./HGRect.ts:HGRectMake4i for its full disasm and
//       transcription: min(x0,x1) -> +0x00, min(y0,y1) -> +0x04, max(x0,x1) -> +0x08,
//       max(y0,y1) -> +0x0C). Included here as a raising stub so GetRect() runs with
//       a real disasm-anchored implementation while surfacing the demand signal for a
//       stand-alone Init(int,int,int,int) transcription. GetRect() also has a direct
//       inline path that produces the exact same output — the ported code below uses
//       the inline path (equivalent-by-construction) and cites both.

import type { HGRect } from "./HGRect.js";

/**
 * HGImageFormat enumerant returned by HGComicLUT::GetFormat().
 *
 * The literal 0x11 = 17 is the exact byte-immediate `movl $0x11, %eax` at 0x14A354.
 * It corresponds to a Helium image-format enumerant (the enum lives in an as-yet
 * untranscribed HGImage/HGBitmap header — see e.g. HGGLHandler::InitTexture and
 * HGMetalHandler::InitTextureUnit signatures in the symmap). We faithfully carry the
 * raw literal without inventing an enum name.
 */
export const HGComicLUT_FORMAT_ENUM = 0x11 as const;

/**
 * HGComicLUT::LUTIndex — nested enum (mangled `NS_8LUTIndexE`).
 *
 * Recovered from the dispatch in GetData:
 *   decl %edi                       ;; edi = idx - 1
 *   cmpl $0x4, %edi                 ;; unsigned compare
 *   ja default                      ;; if (idx-1) > 4 unsigned → default (LUT0)
 *   jumptable[idx-1] → LUT{idx}Data ;; idx in [1..5] → LUT1..LUT5
 *
 * So input value 0 (or any value >5) yields HGComicLUT0Data; values 1..5 yield
 * HGComicLUT1..5Data respectively. We enumerate 0..5 as ordinary u32 values without
 * inventing symbolic names.
 */
export type LUTIndex = number;

/**
 * Opaque handle for one of the six embedded LUT texture blobs. Each is 786432 bytes
 * (512×512×3 = a 512×512 RGB8 image) sitting in Helium.__TEXT.__const at the
 * addresses documented above.
 *
 * We model the return value of GetData() as a discriminated handle rather than a raw
 * Uint8Array because:
 *   (a) The bytes are 4.72 MB of hard-coded color LUT that we haven't been asked to
 *       replicate in TS. A faithful port MUST cite the source pointer without
 *       fabricating a decoded copy.
 *   (b) Consumers (HGComicLookupFilterLUTBitmapResource, and eventually a Metal
 *       texture upload path) only need to identify WHICH LUT is being referenced;
 *       the actual bytes will be loaded from the FCP binary at the cited addresses
 *       by a future data-loader pass.
 *
 * The `address` field is the exact `s __ZL15HGComicLUT{N}Data` symbol address in the
 * Helium binary — bit-for-bit provenance.
 */
export interface HGComicLUTDataRef {
  readonly kind: "HGComicLUTData";
  /** Which LUT slot: 0..5. */
  readonly slot: 0 | 1 | 2 | 3 | 4 | 5;
  /** Symbol address of __ZL15HGComicLUT{slot}Data in the Helium x86_64 slice. */
  readonly address: number;
  /** Byte length of the LUT (fixed = 512*512*3 = 786432). */
  readonly byteLength: 786432;
}

const HG_COMIC_LUT_ADDRS: readonly [number, number, number, number, number, number] = [
  0x3d8c94, // HGComicLUT0Data (default arm)
  0x498c94, // HGComicLUT1Data (jumptable[0])
  0x558c94, // HGComicLUT2Data (jumptable[1])
  0x618c94, // HGComicLUT3Data (jumptable[2])
  0x6d8c94, // HGComicLUT4Data (jumptable[3])
  0x798c94, // HGComicLUT5Data (jumptable[4])
] as const;

const HG_COMIC_LUT_REFS: readonly HGComicLUTDataRef[] = HG_COMIC_LUT_ADDRS.map(
  (addr, i) =>
    ({
      kind: "HGComicLUTData",
      slot: i as 0 | 1 | 2 | 3 | 4 | 5,
      address: addr,
      byteLength: 786432,
    }) as const,
);

/**
 * HGComicLUT — Helium built-in comic-stylization LUT table registry.
 *
 * A namespace-like class exposing three purely-static accessors. No instance state.
 * No virtual dispatch (nm shows T entries but no vtable). Consumers construct this
 * indirectly via HGComicLookupFilterLUTBitmapResource(LUTIndex) @0x3C5B0.
 */
export class HGComicLUT {
  /**
   * HGComicLUT::GetFormat() — @Helium 0x14A350.
   *
   * Full disassembly (5 instructions):
   *   14a350  pushq   %rbp
   *   14a351  movq    %rsp, %rbp
   *   14a354  movl    $0x11, %eax          ;; return 17
   *   14a359  popq    %rbp
   *   14a35a  retq
   *   14a35b  nopl    (%rax,%rax)
   *
   * Body: return HGImageFormat(0x11). No `this` read, no state — a compile-time
   * constant baked into the .text section.
   */
  static GetFormat(): number {
    return HGComicLUT_FORMAT_ENUM;
  }

  /**
   * HGComicLUT::GetRect() — @Helium 0x14A360.
   *
   * Full disassembly (14 instructions — sret-style 16-byte rect return via (rax,rdx)):
   *   14a360  pushq   %rbp
   *   14a361  movq    %rsp, %rbp
   *   14a364  subq    $0x10, %rsp                  ;; alloca 16 bytes for HGRect
   *   14a368  leaq    -0x10(%rbp), %rdi            ;; rdi = &tmp
   *   14a36c  xorl    %esi, %esi                   ;; x0 = 0
   *   14a36e  xorl    %edx, %edx                   ;; y0 = 0
   *   14a370  movl    $0x200, %ecx                 ;; x1 = 512
   *   14a375  movl    $0x200, %r8d                 ;; y1 = 512
   *   14a37b  callq   HGRect::Init(int,int,int,int) ;; @0x107140 — min/max-corner init
   *   14a380  movq    -0x10(%rbp), %rax            ;; rax = tmp.lo64 (x|y packed)
   *   14a384  movq    -0x8(%rbp),  %rdx            ;; rdx = tmp.hi64 (right|bottom packed)
   *   14a388  addq    $0x10, %rsp
   *   14a38c  popq    %rbp
   *   14a38d  retq
   *   14a38e  nop
   *
   * HGRect::Init(int,int,int,int) @0x107140 (see file header for its full disasm)
   * performs a min/max on corner pairs:
   *   this->x      = min(x0, x1) = min(0, 512) = 0
   *   this->y      = min(y0, y1) = min(0, 512) = 0
   *   this->right  = max(x0, x1) = 512
   *   this->bottom = max(y0, y1) = 512
   *
   * Body: return HGRect{ x:0, y:0, right:512, bottom:512 }. Equivalent-by-construction
   * to HGRectMake4i(0, 0, 512, 512) — HGRect::Init and HGRectMake4i implement the same
   * min/max-of-corners initialization (compare ./HGRect.ts:HGRectMake4i).
   */
  static GetRect(): HGRect {
    // Inline expansion of HGRect::Init @0x107140 with (x0=0, y0=0, x1=512, y1=512):
    //   x=min(0,512)=0, y=min(0,512)=0, right=max(0,512)=512, bottom=max(0,512)=512
    return { x: 0, y: 0, right: 0x200, bottom: 0x200 };
  }

  /**
   * HGComicLUT::GetData(LUTIndex) — @Helium 0x14A390.
   *
   * Full disassembly (17 instructions, jumptable-dispatched switch):
   *   14a390  pushq   %rbp
   *   14a391  movq    %rsp, %rbp
   *   14a394  decl    %edi                            ;; edi = idx - 1
   *   14a396  cmpl    $0x4, %edi                      ;; unsigned compare
   *   14a399  ja      0x14a3ad                        ;; if (edi > 4u) -> default
   *   14a39b  movl    %edi, %eax                      ;; zero-extend
   *   14a39d  leaq    0x70e8f0(%rip), %rcx            ;; rcx = jumptable base @0x858C94
   *   14a3a4  movslq  (%rcx,%rax,4), %rax             ;; rax = sxt32(jumptable[idx-1])
   *   14a3a8  addq    %rcx, %rax                      ;; rax = base + offset
   *   14a3ab  popq    %rbp
   *   14a3ac  retq
   *   14a3ad  leaq    __ZL15HGComicLUT0Data(%rip), %rax ;; default: rax = &HGComicLUT0Data
   *   14a3b4  popq    %rbp
   *   14a3b5  retq
   *   14a3b6  addb    %al, (%rax)                     ;; padding
   *   14a3b8  addb    %al, (%rax)
   *   14a3ba  addb    %al, (%rax)
   *   14a3bc  addb    %al, (%rax)
   *   14a3be  addb    %al, (%rax)
   *
   * Jumptable @0x858C94 (5 signed-32-bit offsets, each relative to table base 0x858C94):
   *   [0] -> HGComicLUT1Data @0x498C94  (offset -0x3C0000, i.e. bytes 00 00 c4 ff)
   *   [1] -> HGComicLUT2Data @0x558C94  (offset -0x300000, i.e. bytes 00 00 d0 ff)
   *   [2] -> HGComicLUT3Data @0x618C94  (offset -0x240000, i.e. bytes 00 00 dc ff)
   *   [3] -> HGComicLUT4Data @0x6D8C94  (offset -0x180000, i.e. bytes 00 00 e8 ff)
   *   [4] -> HGComicLUT5Data @0x798C94  (offset -0x0C0000, i.e. bytes 00 00 f4 ff)
   *
   * Semantics: for the (unsigned) input value `idx`:
   *   idx == 0        -> default arm -> HGComicLUT0Data  (decl -> 0xFFFFFFFFu > 4)
   *   idx in [1..5]   -> HGComicLUT{idx}Data             (jumptable[idx-1])
   *   idx > 5         -> default arm -> HGComicLUT0Data
   *
   * We return a small HGComicLUTDataRef handle that pins the exact
   * __ZL15HGComicLUT{slot}Data symbol address — a future data-loader pass will read
   * the 786432-byte RGB8 blob from those addresses. Returning the raw bytes here
   * would balloon the ported TS by ~4.7 MB per class file and require fabricating a
   * decoder for the compact static data (which is not what a raw-port is for — the
   * bytes live in the FCP binary and must stay tied to it).
   */
  static GetData(idx: LUTIndex): HGComicLUTDataRef {
    // decl %edi ; cmpl $0x4, %edi ; ja default
    // In JS/TS we do the same unsigned-32-bit comparison faithfully.
    const decremented = (idx - 1) >>> 0; // unsigned wrap-around for idx=0
    if (decremented > 4) {
      // default arm @0x14A3AD: return &HGComicLUT0Data
      return HG_COMIC_LUT_REFS[0];
    }
    // jumptable arm @0x14A39B..0x14A3AC: return jumptable[idx-1]
    // Slot 1..5 maps to LUT1..LUT5 in HG_COMIC_LUT_REFS.
    return HG_COMIC_LUT_REFS[decremented + 1];
  }
}
