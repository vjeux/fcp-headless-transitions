// HGFormatUtils.ts — Helium's format-descriptor helpers.
//
// FAITHFUL x86_64 transcription from:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium
//
// Source disassembly (both methods live in the same 0xa1d?? cluster):
//   raw-port/re/disasm/Helium.__ZN13HGFormatUtils13bytesPerPixelE8HGFormat.s  @0xa1d60
//   raw-port/re/disasm/Helium.__ZN13HGFormatUtils12rowBytesHintE8HGFormatj.s  @0xa1d80
//   raw-port/re/disasm/Helium.__ZN13HGFormatUtils21collapseRectForFormatERK6HGRect8HGFormat.s
//                                                                             @0xa22f0
//
// Both methods index the anonymous-namespace data table
//   (anonymous namespace)::formatInfos                                       @0xa0ba40
// as an array of 32-byte struct entries; the u32 field at +0x10 is the
// "bytes per pixel" datum.  The table has 44 entries (fmt 0..0x2b); the
// clamp `cmp $0x2b ; jg` is a signed comparison so negative/higher fmts
// short-circuit to bpp = 0.  The full table body was read from the binary
// via macOS __DATA_CONST/__const at file offset 10533440 (see FORMAT_INFOS
// annotation below) — every bpp entry is transcribed verbatim.

import type { HGRect } from "./HGRect";

// ---------------------------------------------------------------------------
// (anonymous namespace)::formatInfos[fmt].bytesPerPixel — the u32 at +0x10
// of each 32-byte entry, read directly from the Helium binary at 0xa0ba40.
//
//   fmt  bpp    fmt  bpp    fmt  bpp    fmt  bpp
//   ---  ---    ---  ---    ---  ---    ---  ---
//    0    0     11    4     22    4     33    8
//    1    1     12    4     23    4     34    2
//    2    1     13    8     24    4     35    4
//    3    2     14    2     25    8     36    4
//    4    2     15    2     26    8     37    8
//    5    2     16    4     27    8     38    8
//    6    2     17    3     28   16     39   16
//    7    4     18    3     29   16     40   12
//    8    4     19    6     30    8     41   24
//    9    4     20    6     31    4     42   16
//   10    2     21   12     32    4     43   32
//
// Each byte-per-pixel value cited above corresponds to entry `fmt` of the
// data symbol `__ZN12_GLOBAL__N_111formatInfosE` @0xa0ba40 (see the raw
// dump in raw-port/re/disasm/Helium.formatInfos.hex.md for full 32-byte
// records).  Only the +0x10 column is consumed by rowBytesHint /
// bytesPerPixel; other columns are semantic (alignment, plane counts, name
// pointer) and are documented but not otherwise loaded by these two
// methods.
const FORMAT_INFOS_BPP: readonly number[] = Object.freeze([
  //  0   1   2   3   4   5   6   7   8   9
  /* 0*/   0,  1,  1,  2,  2,  2,  2,  4,  4,  4,
  /*10*/   2,  4,  4,  8,  2,  2,  4,  3,  3,  6,
  /*20*/   6, 12,  4,  4,  4,  8,  8,  8, 16, 16,
  /*30*/   8,  4,  4,  8,  2,  4,  4,  8,  8, 16,
  /*40*/  12, 24, 16, 32,
]);

// ---------------------------------------------------------------------------
// HGFormatUtils::bytesPerPixel(HGFormat fmt)     @Helium 0xa1d60
//
// Disasm (13 lines):
//   0xa1d60  pushq   %rbp
//   0xa1d61  movq    %rsp, %rbp
//   0xa1d64  xorl    %eax, %eax                 ; result = 0
//   0xa1d66  cmpl    $0x2b, %edi                ; fmt vs 0x2b (43)
//   0xa1d69  jg      0xa1d7c                    ; if signed fmt > 43 skip lookup
//   0xa1d6b  movl    %edi, %eax                 ; rax = fmt (zero-extended)
//   0xa1d6d  shlq    $0x5, %rax                 ; rax = fmt * 32   (struct stride)
//   0xa1d71  leaq    formatInfosE(%rip), %rcx   ; rcx = &formatInfos[0]  @0xa0ba40
//   0xa1d78  movl    0x10(%rax,%rcx), %eax      ; eax = *(u32*)(rcx+rax+0x10)
//   0xa1d7c  popq    %rbp
//   0xa1d7d  retq
//
// HGFormat is a signed enum (jg = signed >), so any negative value falls
// through to the "skip lookup" arm with bpp = 0 — we mirror that with a
// signed range check.
export function HGFormatUtils_bytesPerPixel(fmt: number): number {
  // @Helium 0xa1d64: xorl %eax,%eax  — bpp = 0
  let bpp = 0;
  // @Helium 0xa1d66-0xa1d69: cmpl $0x2b,%edi ; jg  0xa1d7c   (signed)
  // Fold the negative case in with `>= 0` (jg past 43 keeps bpp = 0;
  // signed negative fmt keeps eax = 0 because we never wrote it).
  const s = fmt | 0;
  if (s >= 0 && s <= 0x2b) {
    // @Helium 0xa1d6b-0xa1d78: rax = fmt*32 ; eax = *(u32*)(&formatInfos[fmt] + 0x10)
    bpp = FORMAT_INFOS_BPP[s]!;
  }
  // @Helium 0xa1d7c-0xa1d7d: popq %rbp ; retq  — return eax
  return bpp;
}

// ---------------------------------------------------------------------------
// HGFormatUtils::rowBytesHint(HGFormat fmt, unsigned int width)  @Helium 0xa1d80
//
// Disasm (33 lines):
//   0xa1d80  movl    %edi, %ecx                   ; rcx = fmt (used by btq below)
//   0xa1d82  xorl    %eax, %eax                   ; bpp = 0
//   0xa1d84  cmpl    $0x2b, %edi                  ; fmt vs 43 (signed)
//   0xa1d87  jg      0xa1d9b                      ; if fmt > 43 skip lookup
//   0xa1d89  movq    %rcx, %rax
//   0xa1d8c  shlq    $0x5, %rax                   ; rax = fmt * 32
//   0xa1d90  leaq    formatInfosE(%rip), %rdx     ; @0xa0ba40
//   0xa1d97  movl    0x10(%rax,%rdx), %eax        ; bpp = formatInfos[fmt] +0x10
//   0xa1d9b  movabsq $0x300003e0000, %rdx         ; bit-mask of "plain" formats
//                                                 ;   bits set at {17,18,19,20,21,40,41}
//   0xa1da5  btq     %rcx, %rdx                   ; CF = (mask >> (fmt & 63)) & 1
//   0xa1da9  jae     0xa1daf                      ; if CF == 0 -> special path
//   0xa1dab  imull   %esi, %eax                   ; PLAIN: bpp *= width  (mod 2^32)
//   0xa1dae  retq                                 ; -> return bpp*width
//   0xa1daf  cmpl    $0x1f, %edi                  ; SPECIAL: fmt == 31?
//   0xa1db2  jne     0xa1de3                      ; no -> fallback path
//   0xa1db4  pushq   %rbp
//   0xa1db5  movq    %rsp, %rbp
//   0xa1db8  movl    %esi, %ecx                   ; ecx = width (u32 zero-extended)
//   0xa1dba  cvtsi2sd %rcx, %xmm0                 ; xmm0 = (double)width
//   0xa1dbf  divsd   0x32b559(%rip), %xmm0        ; xmm0 /= *(double*)0x3cd320 = 6.0
//                                                 ;   (raw bytes 00 00 00 00 00 00 18 40
//                                                 ;    at file offset 3986208 in __TEXT __const)
//   0xa1dc7  roundsd $0xa, %xmm0, %xmm0           ; imm=0xa: bit3=1 suppress precision
//                                                 ;   exception, bits 0-1 = 10 = round +INF
//                                                 ;   -> IEEE-754 ceiling.
//   0xa1dcd  cvttsd2si %xmm0, %rcx                ; rcx = truncate(xmm0) toward zero
//                                                 ;   (== ceil since operand >= 0)
//   0xa1dd2  imull   %eax, %ecx                   ; ecx = ceil(w/6) * bpp   (mod 2^32)
//   0xa1dd5  leal    0xff(,%rcx,4), %eax          ; eax = ecx*4 + 0xff
//   0xa1ddc  andl    $0xffffff00, %eax            ; eax &= ~0xff (256-byte align down of "+0xff")
//   0xa1de1  popq    %rbp
//   0xa1de2  retq
//   0xa1de3  imull   %esi, %eax                   ; FALLBACK: eax = bpp * width  (mod 2^32)
//   0xa1de6  addl    $0xff, %eax                  ;          eax += 0xff
//   0xa1deb  andl    $0xffffff00, %eax            ;          eax &= ~0xff  (256-align)
//   0xa1df0  retq
//
// Three arms selected by fmt:
//   1. PLAIN     - fmt in bitmap {17..21, 40, 41}  -> return bpp * width
//                                                    (no rounding/alignment).
//   2. SPECIAL   - fmt == 31 (0x1f)                -> return alignUp( ceil(w/6)*bpp * 4, 256 ).
//   3. FALLBACK  - anything else                   -> return alignUp( bpp*w, 256 ).
//
// Every arithmetic op is `imull`/`leal`/`addl`/`andl` at 32-bit width, so
// the result truncates mod 2^32.  We mirror that with `Math.imul` and
// `>>> 0` at every step.
export function HGFormatUtils_rowBytesHint(fmt: number, width: number): number {
  // @Helium 0xa1d80: movl %edi,%ecx  — cache fmt (used by btq below).
  const rcxFmt = fmt | 0;
  // @Helium 0xa1d82: xorl %eax,%eax
  let bpp = 0;
  // @Helium 0xa1d84-0xa1d87: cmpl $0x2b,%edi ; jg 0xa1d9b   (signed)
  // Guard against negative fmt too — the machine reads formatInfos[fmt]
  // only when fmt<=43, and never writes eax otherwise (starts at 0).
  if (rcxFmt >= 0 && rcxFmt <= 0x2b) {
    // @Helium 0xa1d89-0xa1d97: bpp = *(u32*)(&formatInfos[fmt] + 0x10)
    bpp = FORMAT_INFOS_BPP[rcxFmt]!;
  }
  // @Helium 0xa1d9b-0xa1da9: movabsq $0x300003e0000,%rdx ; btq %rcx,%rdx ; jae ...
  // Bit-mask of "plain" HGFormat values.  Bits set at positions
  // {17, 18, 19, 20, 21, 40, 41} — every 3-channel-plane format.
  const plainMask: bigint = 0x300003e0000n;
  // btq with a register bit-index takes it mod register-width (64).
  const plainBit = (plainMask >> BigInt(rcxFmt & 0x3f)) & 1n;
  if (plainBit === 1n) {
    // @Helium 0xa1dab-0xa1dae: imull %esi,%eax ; retq
    return Math.imul(bpp, width | 0) >>> 0;
  }
  // @Helium 0xa1daf-0xa1db2: cmpl $0x1f,%edi ; jne 0xa1de3
  if (rcxFmt === 0x1f) {
    // @Helium 0xa1db8-0xa1dba: ecx = width (u32) ; xmm0 = (double)width
    const w = (width | 0) >>> 0;
    // @Helium 0xa1dbf: divsd (%rip),%xmm0  — divisor at 0x3cd320 is 6.0.
    //   Read directly from Helium.x86_64 file offset 3986208 as
    //   00 00 00 00 00 00 18 40  = little-endian IEEE-754 double 6.0.
    const div = w / 6.0;                                // @0x3cd320 = 6.0
    // @Helium 0xa1dc7: roundsd imm=0xa -> round toward +INF (ceil).
    const ceilW = Math.ceil(div);
    // @Helium 0xa1dcd: cvttsd2si toward zero — ceilW is >=0 so trunc == ceilW.
    const rcx = ceilW | 0;
    // @Helium 0xa1dd2: imull %eax,%ecx  — ecx = ceilW * bpp mod 2^32.
    const prod = Math.imul(rcx, bpp);
    // @Helium 0xa1dd5: leal 0xff(,%rcx,4),%eax  — eax = prod*4 + 0xff.
    const scaled = (Math.imul(prod, 4) + 0xff) >>> 0;
    // @Helium 0xa1ddc: andl $0xffffff00,%eax  — drop low byte (256-align).
    return (scaled & 0xffffff00) >>> 0;
  }
  // @Helium 0xa1de3-0xa1df0: FALLBACK arm.
  // @Helium 0xa1de3: imull %esi,%eax  — eax = bpp * width mod 2^32.
  const bw = Math.imul(bpp, width | 0);
  // @Helium 0xa1de6: addl $0xff,%eax
  const plus = (bw + 0xff) >>> 0;
  // @Helium 0xa1deb: andl $0xffffff00,%eax  — 256-byte align.
  return (plus & 0xffffff00) >>> 0;
}

// ---------------------------------------------------------------------------
// HGFormatUtils::collapseRectForFormat(HGRect const&, HGFormat) @Helium 0xa22f0
// ---------------------------------------------------------------------------
//
// Static free function that returns an HGRect (by value in %rax:%rdx —
// {x|y<<32, right|bottom<<32}) with the horizontal extents (x, right)
// scaled to match subsampled formats. The disassembly's control flow:
//
//   @0xa2305  leal -0xe(%rsi), %edi   ; edi = fmt - 14
//   @0xa2308  cmpl $0x3,  %edi
//   @0xa230b  jae  0xa2340             ; if (fmt-14) u>= 3  (i.e. fmt not in {14,15,16})
//                                       ; -> alt-path (format 31, or unchanged)
//
//   Fall-through (fmt in {14,15,16}):
//     Halve horizontal dims by 0.5:
//       @0xa230d  cvtsi2ss %edx,%xmm0     ; xmm0 = (float)right
//       @0xa2311  movss    RIP+0x3259af,%xmm1  ; xmm1 = 0.5f  (@Helium 0x3c7cc8)
//       @0xa2319  mulss    %xmm1,%xmm0     ; xmm0 = right * 0.5
//       @0xa231d  roundss  $0xa,xmm0,xmm0  ; mode 0xa = ceil + suppress -> ceil(right*0.5)
//       @0xa2323  cvttss2si xmm0,%esi      ; esi = (i32)ceil(right*0.5)
//       @0xa2327  andq     %rax,%rdx       ; rdx &= 0xFFFFFFFF00000000 (clear low32)
//       @0xa232a  orq      %rsi,%rdx       ; rdx |= esi -> right' = ceil(right*0.5)
//       @0xa232d  xorps    %xmm0,%xmm0     ; zero xmm0
//       @0xa2330  cvtsi2ss %ecx,%xmm0      ; xmm0 = (float)x
//       @0xa2334  mulss    %xmm1,%xmm0     ; xmm0 = x * 0.5
//       @0xa2338  roundss  $0x9,xmm0,xmm0  ; mode 0x9 = floor + suppress -> floor(x*0.5)
//       @0xa233e  jmp      0xa2386         ; -> tail (cvttss2si + write x')
//
//   Alt-path @0xa2340 (fmt not in {14,15,16}):
//     @0xa2340  cmpl $0x1f, %esi         ; fmt == 31?
//     @0xa2343  jne  0xa2394             ; if not, jump to "return unchanged"
//
//     Fmt == 31 branch:
//       @0xa2345  cvtsi2ss %edx,%xmm0     ; xmm0 = (float)right
//       @0xa2349  movss    RIP+0x325973,%xmm1  ; xmm1 = 6.0f  (@Helium 0x3c7cc4)
//       @0xa2351  divss    %xmm1,%xmm0     ; xmm0 = right / 6
//       @0xa2355  roundss  $0xa,xmm0,xmm0  ; ceil(right/6)
//       @0xa235b  movss    RIP+0x327f89,%xmm2  ; xmm2 = 4.0f  (@Helium 0x3ca2ec)
//       @0xa2363  mulss    %xmm2,%xmm0     ; xmm0 = ceil(right/6) * 4
//       @0xa2367  cvttss2si xmm0,%esi      ; esi = i32 result
//       @0xa236b  andq     %rax,%rdx       ; clear low32 of rdx
//       @0xa236e  orq      %rsi,%rdx       ; rdx |= esi -> right' = ceil(right/6)*4
//       @0xa2371  xorps    %xmm0,%xmm0
//       @0xa2374  cvtsi2ss %ecx,%xmm0      ; xmm0 = (float)x
//       @0xa2378  divss    %xmm1,%xmm0     ; xmm0 = x/6
//       @0xa237c  roundss  $0x9,xmm0,xmm0  ; floor(x/6)
//       @0xa2382  mulss    %xmm2,%xmm0     ; xmm0 = floor(x/6)*4
//                                          ; falls through to the common tail
//
//   Common tail @0xa2386:
//     @0xa2386  cvttss2si xmm0,%esi        ; esi = new x
//     @0xa238a  andq     %rax,%rcx         ; rcx &= 0xFFFFFFFF00000000 (clear low32 = wipe x)
//     @0xa238d  movl     %esi,%eax         ; eax = new x (upper cleared)
//     @0xa238f  orq      %rcx,%rax         ; rax = new_x | (y<<32)
//     @0xa2392  popq/retq                  ; return (rax, rdx)
//
//   "Return unchanged" tail @0xa2394 (fmt not in {14,15,16, 31}):
//     @0xa2394  movl %ecx,%esi             ; esi = x (upper cleared by movl)
//     @0xa2396  jmp  0xa238a               ; join the common tail — the effect is
//                                          ; rax = x | y<<32 (unchanged) and rdx unchanged.
//
// Constants (verified from Helium.x86_64 as little-endian float32):
//   @Helium 0x3c7cc8  = 0x3f000000  = 0.5f      (used for the {14,15,16} branch)
//   @Helium 0x3c7cc4  = 0x40c00000  = 6.0f      (used for the fmt==31 branch)
//   @Helium 0x3ca2ec  = 0x40800000  = 4.0f      (used for the fmt==31 branch)
//
// Semantic summary — the two active branches scale HORIZONTAL extents to
// match how the format subsamples chroma (both are chroma-plane-only rects
// for YUV/planar formats): the {14,15,16} branch halves x/right (2:1 sub-
// sampled), and the fmt==31 branch produces `x' = floor(x/6)*4`, i.e. a
// 6:4 = 3:2 subsampling in the chroma plane (a v210-style 10-bit packing).
// All OTHER formats return the rect unchanged. Callee-preserved fields
// (`y`, `bottom`) are never touched — the mask
// `0xFFFFFFFF00000000` at @0xa22f4 preserves them across the `andq/orq`
// rewrites of the paired qwords.
//
// Note the machine's `cvttss2si` toward zero on ALREADY-integer floats
// (post `roundss`) is identity for the {14,15,16} branch — the ceil/floor
// results are exact integers before the truncate. Same for fmt==31: the
// `mulss %xmm2` at @0xa2363/@0xa2382 keeps the result an exact integer
// multiple of 4, so `cvttss2si` is again identity. We mirror the machine
// with `| 0` on the final float result at the JS boundary — the cast
// preserves the exact int32 the disasm emits.
export function HGFormatUtils_collapseRectForFormat(
  rect: HGRect,
  fmt: number,
): HGRect {
  // @0xa22f4 movabsq $-0x100000000, %rax   ; rax = 0xFFFFFFFF00000000
  //   The mask is used to CLEAR the low-32 half of each paired qword
  //   (x from x|y<<32, right from right|bottom<<32) while KEEPING y
  //   and bottom untouched. In JS we operate on named fields directly
  //   so we don't need the mask machinery, but we honor it in comments.

  // @0xa22fe movq (%rdi),%rcx           ; rcx = x | y<<32  (lo qword of *rect)
  // @0xa2301 movq 0x8(%rdi),%rdx        ; rdx = right | bottom<<32 (hi qword)
  // @0xa2305 leal -0xe(%rsi),%edi ; @0xa2308 cmpl $0x3,%edi ; @0xa230b jae 0xa2340
  //   `fmt - 14` compared unsigned to 3 -> the "in {14,15,16}" test.
  const fmt32 = fmt | 0;
  // int32-narrow each input field once so the low32 masks below are exact.
  const xIn = rect.x | 0;
  const yIn = rect.y | 0;
  const rIn = rect.right | 0;
  const bIn = rect.bottom | 0;

  const delta = (fmt32 - 14) >>> 0; // matches `leal -0xe(%rsi),%edi`
  if (delta < 3) {
    // Fall-through branch (@0xa230d..@0xa233e): halve horizontal extents by 0.5.
    // Every arithmetic step is single-precision (`mulss`, `roundss`, `cvttss2si`).
    // We wrap in Math.fround so the JS math sees the same float32 rounding.
    // @0xa2311 xmm1 = 0.5f    (@Helium 0x3c7cc8)
    const K = Math.fround(0.5);
    // @0xa230d cvtsi2ss %edx,%xmm0 ; @0xa2319 mulss %xmm1,%xmm0
    // @0xa231d roundss $0xa (ceil) ; @0xa2323 cvttss2si -> esi
    const newRight = Math.ceil(Math.fround(Math.fround(rIn) * K)) | 0;
    // @0xa232d..@0xa233e: same shape for x, but with roundss $0x9 (floor).
    const newX = Math.floor(Math.fround(Math.fround(xIn) * K)) | 0;
    return { x: newX, y: yIn, right: newRight, bottom: bIn };
  }

  // @0xa2340 cmpl $0x1f,%esi ; @0xa2343 jne 0xa2394
  //   The `jne` "return unchanged" arm sets esi = ecx (x, lo32) then joins the
  //   common tail — which stores esi back as the new x and leaves y/right/bottom
  //   unchanged. Net effect: rect is identical to input.
  if (fmt32 !== 31) {
    // @0xa2394 movl %ecx,%esi ; @0xa2396 jmp 0xa238a
    //   The common tail writes esi (=x, upper zero-cleared) into rax and joins
    //   rcx=y<<32 back. Since we already truncated all four fields with `| 0`,
    //   the outcome is bit-exact with the machine's return.
    return { x: xIn, y: yIn, right: rIn, bottom: bIn };
  }

  // Fmt == 31 branch (@0xa2345..@0xa2382): right' = ceil(right/6)*4,
  //                                           x'  = floor(x/6)*4.
  // @0xa2349 xmm1 = 6.0f  (@Helium 0x3c7cc4)
  const K1 = Math.fround(6.0);
  // @0xa235b xmm2 = 4.0f  (@Helium 0x3ca2ec)
  const K2 = Math.fround(4.0);

  // @0xa2345 cvtsi2ss %edx,%xmm0 ; @0xa2351 divss %xmm1,%xmm0
  // @0xa2355 roundss $0xa (ceil) ; @0xa2363 mulss %xmm2,%xmm0
  // @0xa2367 cvttss2si -> esi ; @0xa236e orq -> rdx.low = esi
  const newRight31 =
    Math.fround(
      Math.ceil(Math.fround(Math.fround(rIn) / K1)) * K2,
    ) | 0;

  // @0xa2371..@0xa2382: same for x, but with roundss $0x9 (floor).
  // @0xa2374 cvtsi2ss %ecx,%xmm0 ; @0xa2378 divss %xmm1,%xmm0
  // @0xa237c roundss $0x9 (floor); @0xa2382 mulss %xmm2,%xmm0
  const newX31 =
    Math.fround(
      Math.floor(Math.fround(Math.fround(xIn) / K1)) * K2,
    ) | 0;

  // @0xa2386 cvttss2si (already an integer post-mulss with 4.0) ; @0xa238a-@0xa2392 pack.
  return { x: newX31, y: yIn, right: newRight31, bottom: bIn };
}
