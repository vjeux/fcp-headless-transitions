// HGFormatUtils.ts — Helium's format-descriptor helpers.
//
import type { HGRect } from "./HGRect";
//
// FAITHFUL x86_64 transcription from:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium
//
// Source disassembly (both methods live in the same 0xa1d?? cluster):
//   raw-port/re/disasm/Helium.__ZN13HGFormatUtils13bytesPerPixelE8HGFormat.s  @0xa1d60
//   raw-port/re/disasm/Helium.__ZN13HGFormatUtils12rowBytesHintE8HGFormatj.s  @0xa1d80
//
// Both methods index the anonymous-namespace data table
//   (anonymous namespace)::formatInfos                                       @0xa0ba40
// as an array of 32-byte struct entries; the u32 field at +0x10 is the
// "bytes per pixel" datum.  The table has 44 entries (fmt 0..0x2b); the
// clamp `cmp $0x2b ; jg` is a signed comparison so negative/higher fmts
// short-circuit to bpp = 0.  The full table body was read from the binary
// via macOS __DATA_CONST/__const at file offset 10533440 (see FORMAT_INFOS
// annotation below) — every bpp entry is transcribed verbatim.

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
// (anonymous namespace)::formatInfos[fmt].metalFormat — the u64 at +0x0 of
// each 32-byte entry.  Read directly from the Helium binary at file offset
// 10549824 (Mach-O __DATA_CONST/__const; the "@0xa0ba40" comment near
// FORMAT_INFOS_BPP referenced an older linker layout — the actual file
// offset of the table is 10549824 in the current shipping x86_64 Helium
// binary; verified by scanning for the exact FORMAT_INFOS_BPP pattern at
// +0x10 across 44 entries with a 32-byte stride).
//
// Each value is an Apple `MTLPixelFormat` enum constant (u64) — the raw
// mapping from FCP's `HGFormat` enum to a Metal pixel-format enum. A
// value of 0 corresponds to `MTLPixelFormatInvalid` (Apple's canonical
// "not representable in Metal" sentinel) and appears at every HGFormat
// slot that has no direct Metal equivalent (fmt 17..21 = 24-bit RGB
// packings, fmt 39..41, etc.).  A value of 252 is
// `MTLPixelFormatDepth32Float` (Apple `Depth32Float`) at fmt 9.  A value
// of 53 is `MTLPixelFormatR8Snorm` at fmt 36; 103 is
// `MTLPixelFormatRG8Snorm` at fmt 38; 123 is `MTLPixelFormatRGBA8Snorm`
// at fmt 42.  Every other value maps to the standard MTLPixelFormat
// numeric constants (10=R8Unorm, 20=R16Unorm, 25=R16Float, 55=R32Float,
// 30=RG8Unorm, 60=RG16Unorm, 65=RG16Float, 70=RGBA8Unorm, 80=BGRA8Unorm,
// 90=RGB10A2Unorm, 105=RG32Float, 110=RGBA16Unorm, 115=RGBA16Float,
// 125=RGBA32Float).  We DO NOT interpret these values at this layer —
// we transcribe them verbatim from the binary.
//
// This is the raw u64 column that `metalFormat(HGFormat)` reads at
// @0xa1461 via `movq (fmt*32 + &formatInfos), %rax`.  Values held in
// number form (all 44 are <= 252, well within JS's safe integer range
// of 2^53 - 1).
const FORMAT_INFOS_METAL_FORMAT: readonly number[] = Object.freeze([
  //   0    1    2    3    4    5    6    7    8    9
  /* 0*/    0,  10,   1,  20,  20,  25,  25,  55,  55, 252,
  /*10*/   30,  60,  65, 105,  80,  80, 110,   0,   0,   0,
  /*20*/    0,   0,  80,  80,  70, 110, 110, 115, 125, 125,
  /*30*/  110,  90,  70, 110,   0,   0,  53,   0, 103,   0,
  /*40*/    0,   0, 123,   0,
]);

// ---------------------------------------------------------------------------
// HGFormatUtils::metalFormat(HGFormat fmt)                      @Helium 0xa1450
//
// Disasm (10 lines):
//   0xa1450  pushq   %rbp
//   0xa1451  movq    %rsp, %rbp
//   0xa1454  movl    %edi, %eax                 ; rax = fmt (zero-extended low 32b)
//   0xa1456  shlq    $0x5, %rax                 ; rax = fmt * 32   (32-byte stride)
//   0xa145a  leaq    formatInfosE(%rip), %rcx   ; rcx = &formatInfos[0]  (file off 10549824)
//   0xa1461  movq    (%rax,%rcx), %rax          ; rax = *(u64*)(&formatInfos[fmt] + 0x0)
//   0xa1465  popq    %rbp
//   0xa1466  retq
//
// Semantics: look up the 8-byte `metalFormat` field at +0x0 of the
// `formatInfos[fmt]` entry.  NO bounds check — unlike `bytesPerPixel`
// (which has an explicit `cmpl $0x2b ; jg` clamp), this method reads
// directly from `formatInfos + fmt*32 + 0`.  If `fmt` is >= 44 or
// negative, the machine will read past the end of the 44-entry table
// (C++ undefined behaviour); a faithful port raises rather than
// silently returning garbage — the caller is expected to have already
// clamped `fmt` to a valid HGFormat value.
//
// The `movl %edi, %eax` zero-extends the low 32 bits of `%edi` into
// `%rax` — so `fmt` is treated as an UNSIGNED 32-bit value for the
// index computation (a negative int32 in %edi would be interpreted
// as a large positive u32, indexing far past the table). We mirror
// that: the range check treats `fmt` after `>>> 0` truncation, so a
// negative input surfaces as a large u32 that will fail the bounds
// check and throw with the same @0xADDR.
//
// Zero in-scope callees, zero externs, zero indirect calls — pure
// table lookup (confirmed by `depgraph.py why`: 0 in-scope deps, 0
// indirect, 0 out-of-scope externs; READY at wave 0).
//
// Source disassembly:
//   raw-port/re/disasm/Helium.__ZN13HGFormatUtils11metalFormatE8HGFormat.s
export function HGFormatUtils_metalFormat(fmt: number): number {
  // @Helium 0xa1454: movl %edi,%eax  — zero-extend fmt to u32.
  const s = (fmt | 0) >>> 0;
  // @Helium 0xa1456-0xa1461: rax = *(u64*)(&formatInfos[fmt] + 0x0)
  //   NO bounds check in the disasm — we raise for OOB rather than
  //   fabricate a value (Rule 3 — throw on undecoded, never approximate).
  //   The 44-entry table is decoded verbatim into FORMAT_INFOS_METAL_FORMAT;
  //   the disasm's raw read is well-defined only for fmt in [0, 43].
  if (s > 0x2b) {
    throw new Error(
      "HGFormatUtils::metalFormat(fmt=" +
        String(fmt) +
        ") — fmt out of range [0, 0x2b]; disasm @Helium 0xa1461 has NO " +
        "bounds check and would read past the 44-entry formatInfos table " +
        "(&formatInfos + fmt*32 + 0x0 = file offset 10549824 + " +
        String(s * 32) +
        "), yielding C++ undefined behaviour.  Callers must clamp fmt to " +
        "a valid HGFormat before invoking this. @Helium 0xa1450",
    );
  }
  return FORMAT_INFOS_METAL_FORMAT[s]!;
}
// ---------------------------------------------------------------------------
// HGFormatUtils::toHGGLContextID(HGFormat fmt)                 @Helium 0xa1bf0
//
// Disasm (13 lines):
//   0xa1bf0  pushq   %rbp
//   0xa1bf1  movq    %rsp, %rbp
//   0xa1bf4  leal    -0x1(%rdi), %eax     ; eax = fmt - 1
//   0xa1bf7  cmpl    $0x23, %eax          ; (fmt-1) vs 0x23 (35), UNSIGNED (setb)
//   0xa1bfa  setb    %al                  ; al = (u32)(fmt-1) < 35      (CF=1)
//   0xa1bfd  andl    $-0x2, %edi          ; edi = fmt & 0xFFFFFFFE  (clear low bit)
//   0xa1c00  cmpl    $0x22, %edi          ; (fmt & ~1) vs 0x22 (34)
//   0xa1c03  setne   %cl                  ; cl = (fmt & ~1) != 34       (ZF=0)
//   0xa1c06  andb    %al, %cl             ; cl = al & cl
//   0xa1c08  movzbl  %cl, %eax            ; return (u8) cl  (0 or 1)
//   0xa1c0b  popq    %rbp
//   0xa1c0c  retq
//
// Pure integer arithmetic — zero callees, zero externs, zero indirect calls
// (confirmed: raw-port/army/tools/depgraph.py deps prints nothing; the
// disasm has no `callq`).  Two predicates AND-ed:
//   A = (u32)(fmt - 1) < 35  — i.e. fmt in the UNSIGNED window [1, 35].
//       (`setb`/CF is the unsigned test: (fmt-1) - 35 borrows iff
//        (fmt-1) < 35 as unsigned; fmt==0 wraps to 0xFFFFFFFF and fails.)
//   B = (fmt & ~1) != 34     — masking the low bit collapses {34,35} onto 34,
//       so B excludes BOTH fmt==34 and fmt==35.
// Net accepted set: fmt in [1, 33].  We transcribe the EXACT two-predicate
// machine form (not the folded [1,33]) so the port mirrors the instructions.
// Returns a 0/1 int to match the `movzbl %cl,%eax` byte-to-int result.
//
// Source disassembly:
//   raw-port/re/disasm/Helium.__ZN13HGFormatUtils15toHGGLContextIDE8HGFormat.s
export function HGFormatUtils_toHGGLContextID(fmt: number): number {
  // @Helium 0xa1bf4-0xa1bfa: al = (u32)(fmt-1) < 0x23
  //   `>>> 0` gives the unsigned 32-bit view the `setb` (CF) test uses; a
  //   fmt of 0 becomes 0xFFFFFFFF here and correctly fails the bound.
  const a: boolean = (((fmt | 0) - 1) >>> 0) < 0x23;
  // @Helium 0xa1bfd-0xa1c03: cl = (fmt & ~1) != 0x22
  const b: boolean = ((fmt | 0) & 0xfffffffe) !== 0x22;
  // @Helium 0xa1c06-0xa1c08: cl = al & cl ; movzbl -> 0/1
  return a && b ? 1 : 0;
}

// ---------------------------------------------------------------------------
// HGFormatUtils::textureSizeBytes(unsigned int width,          @Helium 0xa1e20
//                                 unsigned int height,
//                                 HGFormat fmt)
//
// Disasm (16 lines):
//   0xa1e20  pushq   %rbp
//   0xa1e21  movq    %rsp, %rbp
//   0xa1e24  cmpl    $0x2b, %edx          ; fmt vs 0x2b (43), SIGNED (jle)
//   0xa1e27  jle     0xa1e2d              ; fmt <= 43 -> lookup; else bpp = 0
//   0xa1e29  xorl    %ecx, %ecx           ; bpp = 0
//   0xa1e2b  jmp     0xa1e3e
//   0xa1e2d  movl    %edx, %eax           ; rax = fmt (zero-extended u32)
//   0xa1e2f  shlq    $0x5, %rax           ; rax = fmt * 32  (32-byte stride)
//   0xa1e33  leaq    formatInfosE(%rip), %rcx  ; &formatInfos[0]
//   0xa1e3a  movl    0x10(%rax,%rcx), %ecx     ; bpp = *(u32*)(&formatInfos[fmt]+0x10)
//   0xa1e3e  movl    %edi, %edx           ; rdx = width  (zero-extended u32)
//   0xa1e40  movl    %esi, %eax           ; rax = height (zero-extended u32)
//   0xa1e42  imulq   %rdx, %rax           ; rax = height * width       (64-bit)
//   0xa1e46  imulq   %rcx, %rax           ; rax = (height*width) * bpp (64-bit)
//   0xa1e4a  popq    %rbp
//   0xa1e4b  retq
//
// Returns width * height * bytesPerPixel[fmt] as an UNSIGNED 64-bit product
// (three `movl`s zero-extend the 32-bit operands into the 64-bit regs; both
// `imulq`s keep the full 64-bit low result).  Texture byte counts can exceed
// 2^53 for pathologically large dimensions, so we compute in BigInt and
// truncate to 64 bits with BigInt.asUintN(64, ...) to match imulq exactly,
// returning a bigint (Rule 4: int64 -> bigint).
//
// The bpp datum is the SAME +0x10 u32 column of `formatInfos` that
// HGFormatUtils_bytesPerPixel / _rowBytesHint read — decoded verbatim into
// FORMAT_INFOS_BPP above.  Zero callees / externs / indirect calls
// (`formatInfos` is a static data table, not a function).
//
// Guard: the machine uses a SIGNED `jle $0x2b` — so fmt <= 43 (INCLUDING
// negative fmt) takes the lookup arm, then indexes with `movl %edx,%eax`
// which zero-extends fmt to an UNSIGNED u32.  For fmt in [0, 43] this is
// FORMAT_INFOS_BPP[fmt].  A NEGATIVE fmt passes `jle` yet the u32 index is
// far past the 44-entry table — C++ UB; per Rule 3 we throw rather than
// fabricate.  fmt > 43 short-circuits to bpp = 0 (product = 0).
//
// Source disassembly:
//   raw-port/re/disasm/Helium.__ZN13HGFormatUtils16textureSizeBytesEjj8HGFormat.s
export function HGFormatUtils_textureSizeBytes(
  width: number,
  height: number,
  fmt: number,
): bigint {
  // @Helium 0xa1e24-0xa1e2b: SIGNED `cmpl $0x2b,%edx ; jle` selects lookup.
  let bpp = 0;
  const s = fmt | 0;
  if (s <= 0x2b) {
    // @Helium 0xa1e2d: `movl %edx,%eax` zero-extends fmt to u32 for indexing.
    const idx = s >>> 0;
    if (idx > 0x2b) {
      // Negative fmt passes the signed `jle` but the u32 index is OOB — the
      // machine would read past formatInfos (C++ undefined behaviour). Do
      // not approximate. @Helium 0xa1e3a
      throw new Error(
        "HGFormatUtils::textureSizeBytes(fmt=" +
          String(fmt) +
          ") — negative fmt passes the signed `jle $0x2b` but yields the " +
          "unsigned index " +
          String(idx) +
          ", reading past the 44-entry formatInfos table (C++ UB). @Helium 0xa1e3a",
      );
    }
    // @Helium 0xa1e2f-0xa1e3a: bpp = *(u32*)(&formatInfos[fmt] + 0x10)
    bpp = FORMAT_INFOS_BPP[idx]!;
  }
  // @Helium 0xa1e3e-0xa1e42: rax = (u64)height * (u64)width
  const w = BigInt((width | 0) >>> 0);
  const h = BigInt((height | 0) >>> 0);
  const hw = BigInt.asUintN(64, h * w);
  // @Helium 0xa1e46: imulq %rcx,%rax — rax = (height*width) * bpp (mod 2^64).
  return BigInt.asUintN(64, hw * BigInt(bpp));
}

// ---------------------------------------------------------------------------
// HGFormatUtils::collapseRectForFormat(HGRect const& r, HGFormat fmt)
//                                                              @Helium 0xa22f0
//
// Source disassembly (46 lines):
//   raw-port/re/disasm/Helium.__ZN13HGFormatUtils21collapseRectForFormatERK6HGRect8HGFormat.s
//
// Full transcription:
//   0xa22f0  pushq   %rbp
//   0xa22f1  movq    %rsp, %rbp
//   0xa22f4  movabsq $-0x100000000, %rax        ; rax = 0xFFFFFFFF00000000 (hi-32 mask)
//   0xa22fe  movq    (%rdi), %rcx               ; rcx = *(r+0x0) = x | (y<<32)
//   0xa2301  movq    0x8(%rdi), %rdx            ; rdx = *(r+0x8) = right | (bottom<<32)
//   0xa2305  leal    -0xe(%rsi), %edi           ; edi = fmt - 14
//   0xa2308  cmpl    $0x3, %edi                 ; (fmt-14) vs 3
//   0xa230b  jae     0xa2340                    ; UNSIGNED >= 3 -> not in {14,15,16}
//   ----- ARM A: fmt in {14,15,16} — halve the horizontal corners -----
//   0xa230d  cvtsi2ss %edx, %xmm0              ; xmm0 = (float)(int)right   (edx = rdx low32)
//   0xa2311  movss   0x3259af(%rip), %xmm1     ; xmm1 = 0.5f   @0x3c7cc8
//   0xa2319  mulss   %xmm1, %xmm0              ; xmm0 = right * 0.5
//   0xa231d  roundss $0xa, %xmm0, %xmm0        ; imm 0xa = round toward +INF (ceil)
//   0xa2323  cvttss2si %xmm0, %esi             ; esi = trunc(ceil(right*0.5))
//   0xa2327  andq    %rax, %rdx                ; clear rdx low32 (keep bottom in hi32)
//   0xa232a  orq     %rsi, %rdx                ; rdx.low32 = new right
//   0xa232d  xorps   %xmm0, %xmm0
//   0xa2330  cvtsi2ss %ecx, %xmm0              ; xmm0 = (float)(int)x       (ecx = rcx low32)
//   0xa2334  mulss   %xmm1, %xmm0              ; xmm0 = x * 0.5
//   0xa2338  roundss $0x9, %xmm0, %xmm0        ; imm 0x9 = round toward -INF (floor)
//   0xa233e  jmp     0xa2386
//   ----- ARM dispatch for fmt-14 >= 3 -----
//   0xa2340  cmpl    $0x1f, %esi                ; fmt vs 31 (esi still = fmt)
//   0xa2343  jne     0xa2394                    ; not 31 -> passthrough
//   ----- ARM B: fmt == 31 — ceil/floor(corner/6)*4 -----
//   0xa2345  cvtsi2ss %edx, %xmm0             ; xmm0 = (float)(int)right
//   0xa2349  movss   0x325973(%rip), %xmm1     ; xmm1 = 6.0f   @0x3c7cc4
//   0xa2351  divss   %xmm1, %xmm0             ; xmm0 = right / 6.0
//   0xa2355  roundss $0xa, %xmm0, %xmm0        ; ceil
//   0xa235b  movss   0x327f89(%rip), %xmm2     ; xmm2 = 4.0f   @0x3ca2ec
//   0xa2363  mulss   %xmm2, %xmm0             ; xmm0 = ceil(right/6) * 4
//   0xa2367  cvttss2si %xmm0, %esi            ; esi = trunc(...)
//   0xa236b  andq    %rax, %rdx               ; clear rdx low32
//   0xa236e  orq     %rsi, %rdx               ; rdx.low32 = new right
//   0xa2371  xorps   %xmm0, %xmm0
//   0xa2374  cvtsi2ss %ecx, %xmm0             ; xmm0 = (float)(int)x
//   0xa2378  divss   %xmm1, %xmm0             ; xmm0 = x / 6.0
//   0xa237c  roundss $0x9, %xmm0, %xmm0        ; floor
//   0xa2382  mulss   %xmm2, %xmm0             ; xmm0 = floor(x/6) * 4
//   ----- common tail (both ARM A and ARM B fall here) -----
//   0xa2386  cvttss2si %xmm0, %esi            ; esi = trunc(new x)
//   0xa238a  andq    %rax, %rcx               ; clear rcx low32 (keep y in hi32)
//   0xa238d  movl    %esi, %eax               ; eax = new x (zero-extends into rax low32)
//   0xa238f  orq     %rcx, %rax               ; rax.low32 = new x
//   0xa2392  popq    %rbp
//   0xa2393  retq                             ; return rax=(x|y<<32), rdx=(right|bottom<<32)
//   ----- ARM C: passthrough (fmt not in {14,15,16,31}) -----
//   0xa2394  movl    %ecx, %esi               ; esi = x (unchanged)
//   0xa2396  jmp     0xa238a                  ; -> tail rebuilds rax with unchanged x
//
// Semantics — the rect's corners are collapsed to the chroma/packing grid of
// the pixel format, LEAVING y and bottom untouched (only the horizontal x /
// right corners are rewritten):
//   fmt in {14,15,16}: x = floor(x * 0.5),   right = ceil(right * 0.5)
//   fmt == 31 (0x1f):  x = trunc(floor(x/6) * 4), right = trunc(ceil(right/6) * 4)
//   otherwise:         rect returned unchanged.
//
// The `roundss` uses single-precision ops throughout (cvtsi2ss/mulss/divss),
// so every float step is wrapped in Math.fround; the final cvttss2si is a
// truncation toward zero (| 0) of the single-precision rounded product.
//
// Constants (single-precision float32, read via resolve.py ripconst):
//   @0x3c7cc8  0.5f   (movss @0xa2311)
//   @0x3c7cc4  6.0f   (movss @0xa2349)
//   @0x3ca2ec  4.0f   (movss @0xa235b)
//
// Zero in-scope callees, zero externs, zero indirect calls — pure arithmetic
// on the HGRect struct (defined in HGRect.ts). x/y/right/bottom are the four
// int32 fields at +0x0/+0x4/+0x8/+0xc.
export function HGFormatUtils_collapseRectForFormat(
  r: HGRect,
  fmt: number,
): HGRect {
  // @Helium 0xa22fe-0xa2301: load the four int32 corners.
  const x = r.x | 0; // rcx low32
  const y = r.y | 0; // rcx high32 (passthrough)
  const right = r.right | 0; // rdx low32
  const bottom = r.bottom | 0; // rdx high32 (passthrough)

  // @Helium 0xa2305-0xa230b: (fmt-14) UNSIGNED < 3 selects ARM A.
  const s = fmt | 0;
  const off = (s - 14) >>> 0; // leal -0xe(%rsi); unsigned compare below

  let newX = x;
  let newRight = right;

  if (off < 3) {
    // @Helium 0xa230d-0xa233e: ARM A — halve horizontal corners (fmt in {14,15,16}).
    // right = trunc(ceil(right * 0.5f))    @0xa230d-0xa232a
    newRight =
      Math.trunc(Math.ceil(Math.fround(Math.fround(right) * Math.fround(0.5)))) | 0;
    // x = trunc(floor(x * 0.5f))           @0xa2330-0xa2386
    newX =
      Math.trunc(Math.floor(Math.fround(Math.fround(x) * Math.fround(0.5)))) | 0;
  } else if (s === 0x1f) {
    // @Helium 0xa2345-0xa2382: ARM B — fmt == 31.
    // right = trunc(ceil(right / 6.0f) * 4.0f)
    newRight =
      Math.trunc(
        Math.fround(
          Math.ceil(Math.fround(Math.fround(right) / Math.fround(6.0))) *
            Math.fround(4.0),
        ),
      ) | 0;
    // x = trunc(floor(x / 6.0f) * 4.0f)
    newX =
      Math.trunc(
        Math.fround(
          Math.floor(Math.fround(Math.fround(x) / Math.fround(6.0))) *
            Math.fround(4.0),
        ),
      ) | 0;
  }
  // @Helium 0xa2394 (ARM C): otherwise newX = x, newRight = right (unchanged).

  // @Helium 0xa238a-0xa238f: rebuild rax = newX | (y<<32); rdx = newRight | (bottom<<32).
  return { x: newX, y: y, right: newRight, bottom: bottom };
}

// ---------------------------------------------------------------------------
// HGFormatUtils::buildFormat(HGFormatComponents, unsigned int)     @Helium 0xa26e0
//   — __ZN13HGFormatUtils11buildFormatE18HGFormatComponentsj
//
// Composes an HGFormat enum value from a component-layout selector
// (HGFormatComponents `components` in %edi, 1-based) and a bit-depth/packing
// selector (`sel` in %esi). It is a validity-gated 2-level table lookup.
//
// Disasm (18 real insns):
//   0xa26e0  movl    %esi, %ecx                 ; ecx = sel
//   0xa26e2  decl    %ecx                       ; ecx = sel - 1
//   0xa26e4  cmpl    $0x8, %ecx                 ; (sel-1) vs 8  (unsigned)
//   0xa26e7  setb    %al                        ; al = ((sel-1) < 8)  [unsigned]
//   0xa26ea  movb    $-0x75, %dl                ; dl = 0x8B (validity bitmask)
//   0xa26ec  shrb    %cl, %dl                   ; dl >>= (sel-1)      [byte shift]
//   0xa26ee  andb    %al, %dl                   ; dl &= al
//   0xa26f0  xorl    %eax, %eax                 ; result = 0
//   0xa26f2  cmpb    $0x1, %dl
//   0xa26f5  jne     0xa2710                    ; if (dl != 1) return 0
//   0xa26f7  pushq   %rbp
//   0xa26f8  movq    %rsp, %rbp
//   0xa26fb  movl    %ecx, %eax                 ; eax = sel - 1  (outer index)
//   0xa26fd  leaq    0x9698bc(%rip), %rcx       ; rcx = &OUTER_TABLE[0]  @0xa0bfc0
//   0xa2704  movq    (%rcx,%rax,8), %rax        ; rax = OUTER_TABLE[sel-1]  (ptr)
//   0xa2708  movslq  %edi, %rcx                 ; rcx = (i64)components
//   0xa270b  movl    -0x4(%rax,%rcx,4), %eax    ; eax = subarray[components - 1] (u32)
//   0xa270f  popq    %rbp
//   0xa2710  retq                               ; return eax
//   0xa2711  nopw    %cs:(%rax,%rax)
//
// VALIDITY GATE
//   `dl = (0x8B >> (sel-1)) & ((sel-1) < 8)`. 0x8B = 0b1000_1011, so the
//   valid `sel-1` positions are the SET bits: {0, 1, 3, 7} — i.e.
//   sel in {1, 2, 4, 8}. Any other sel returns 0.
//
// OUTER_TABLE  @Helium 0xa0bfc0 (__DATA_CONST __const, 8 x u64 pointers).
//   Read directly from the binary (file offset 10534848):
//     [0] -> 0x3cd610   [1] -> 0x3cd620   [2] -> 0  (null)
//     [3] -> 0x3cd630   [4] -> 0  (null)  [5] -> 0  (null)
//     [6] -> 0  (null)  [7] -> 0x3cd640
//   The null slots are exactly the CLEAR bits of 0x8B, so the validity gate
//   guarantees the dereferenced pointer is always non-null.
//
// The four non-null sub-arrays live in __TEXT __const (addr 0x3c7b80) as
// contiguous 4-entry u32 rows (each row is 16 bytes; consecutive rows are
// 0x10 apart at 0x3cd610/0x3cd620/0x3cd630/0x3cd640). Each is indexed by
// `components - 1` (the `-0x4` byte offset with a 4-byte stride ⇒ 1-based).
// Values read verbatim from the binary:
//
//   sel (bit)      components:  1    2    3    4
//   ----------------------------------------------
//   sel=1 (slot0)              1   10   17   24
//   sel=2 (slot1)              3   11   19   25
//   sel=4 (slot3)              5   12   20   27
//   sel=8 (slot7)              7   13   21   28
//
// Every value is an HGFormat enum ordinal (consistent with the 0..0x2b range
// of the formatInfos table above).
const BUILD_FORMAT_TABLE: Readonly<Record<number, readonly number[]>> = Object.freeze({
  // key = (sel - 1) outer index (the set bits of the 0x8B validity mask);
  // value = the 4-entry sub-array indexed by (components - 1).
  0: Object.freeze([1, 10, 17, 24]),   // OUTER_TABLE[0] @0x3cd610  (sel = 1)
  1: Object.freeze([3, 11, 19, 25]),   // OUTER_TABLE[1] @0x3cd620  (sel = 2)
  3: Object.freeze([5, 12, 20, 27]),   // OUTER_TABLE[3] @0x3cd630  (sel = 4)
  7: Object.freeze([7, 13, 21, 28]),   // OUTER_TABLE[7] @0x3cd640  (sel = 8)
});

/**
 * `HGFormatUtils::buildFormat(HGFormatComponents components, unsigned int sel)`
 *   — @Helium 0xa26e0.
 *
 * Faithful transcription. Returns an HGFormat enum value composed from the
 * component-layout `components` (1-based, in %edi) and the bit-depth/packing
 * selector `sel` (in %esi), via the validity-gated 2-level table lookup
 * documented above. Returns 0 for any invalid `sel` (i.e. `sel` not in {1,2,4,8}).
 *
 * No in-scope callees, no externs — pure arithmetic + a data-table read whose
 * bytes are transcribed verbatim from the binary.
 */
export function HGFormatUtils_buildFormat(components: number, sel: number): number {
  // @0xa26e0-0xa26e2: ecx = sel - 1.
  const cl = (sel - 1) & 0xffffffff;
  // @0xa26e4-0xa26e7: al = ((sel-1) < 8)  [unsigned].
  const below8 = (cl >>> 0) < 8 ? 1 : 0;
  // @0xa26ea-0xa26ee: dl = ((0x8B >> (sel-1)) & 1) & al   (byte-domain shift).
  // The byte shift uses the low 3 bits of cl as the count (shrb %cl uses cl&7
  // for an 8-bit operand); below8 already forces the out-of-range case to 0.
  const maskBit = below8 !== 0 ? ((0x8b >> (cl & 7)) & 1) : 0;
  const dl = maskBit & below8;
  // @0xa26f0-0xa26f5: if (dl != 1) return 0.
  if (dl !== 1) {
    // @0xa2710 retq with eax = 0.
    return 0;
  }
  // @0xa26fb: outer index = sel - 1 (guaranteed in {0,1,3,7} by the gate).
  const outerIdx = cl >>> 0;
  // @0xa26fd-0xa2704: rax = OUTER_TABLE[sel-1] (a non-null sub-array pointer).
  const sub = BUILD_FORMAT_TABLE[outerIdx];
  // @0xa2708-0xa270b: eax = sub[components - 1]  (movslq sign-extends %edi;
  // the -0x4 byte offset with a 4-byte stride is a 1-based index).
  // The binary performs no bounds check on `components`; a faithful port
  // reads the same 32-bit slot. Only components in [1,4] are in-table.
  return (sub[(components | 0) - 1] as number) >>> 0;
}
// ---------------------------------------------------------------------------
// (anonymous namespace)::s_HGGLFormatInfos  — @Helium __TEXT,__const 0x3cd400
//   __ZN12_GLOBAL__N_117s_HGGLFormatInfosE   (x86_64 slice; arm64 slice at
//   0x323af8, both confirmed by nm)
//
// A 44-entry static table (fmt 0..0x2b), each entry three consecutive u32s:
//   +0x0  internalFormat  (GL internal format enum, e.g. 0x8058 = GL_RGBA8)
//   +0x4  format          (GL pixel format enum, e.g. 0x1908 = GL_RGBA)
//   +0x8  type            (GL pixel type enum,  e.g. 0x1401 = GL_UNSIGNED_BYTE)
// read respectively by toGLInternalFormat/toGLFormat/toGLType. The 528-byte
// table extent (44*12) is bounded by the next static symbol
// (__ZZN13HGFormatUtils11buildFormat...UInt8Formats @0x3cd610).
//
// This unit ports ONLY the +0x0 (internalFormat) column that
// toGLInternalFormat reads. The other two columns are read by
// toGLFormat/toGLType (separate ledger entries) and are NOT decoded here
// per Rule 6 (one symbol per file/method) — we transcribe verbatim only the
// column this method touches. Values are the raw GL enum u32s read directly
// from the binary at file offset (slice+0x3cd400 + fmt*12 + 0x0).
const S_HGGLFORMATINFOS_INTERNAL_FORMAT: readonly number[] = Object.freeze([
  //          fmt : internalFormat  (raw GL enum u32 @+0x0 of each 12-byte entry)
  /*  0 */ 0x8058, /*  1 */ 0x8229, /*  2 */ 0x803c, /*  3 */ 0x822a,
  /*  4 */ 0x822a, /*  5 */ 0x822d, /*  6 */ 0x822d, /*  7 */ 0x822e,
  /*  8 */ 0x822e, /*  9 */ 0x822e, /* 10 */ 0x822b, /* 11 */ 0x822c,
  /* 12 */ 0x822f, /* 13 */ 0x8230, /* 14 */ 0x8058, /* 15 */ 0x8058,
  /* 16 */ 0x805b, /* 17 */ 0x8051, /* 18 */ 0x8051, /* 19 */ 0x8054,
  /* 20 */ 0x881b, /* 21 */ 0x8815, /* 22 */ 0x8058, /* 23 */ 0x8058,
  /* 24 */ 0x8058, /* 25 */ 0x805b, /* 26 */ 0x805b, /* 27 */ 0x881a,
  /* 28 */ 0x8814, /* 29 */ 0x8814, /* 30 */ 0x805b, /* 31 */ 0x8059,
  /* 32 */ 0x8058, /* 33 */ 0x805b, /* 34 */ 0x822a, /* 35 */ 0x822c,
  /* 36 */ 0x8058, /* 37 */ 0x8058, /* 38 */ 0x8058, /* 39 */ 0x8058,
  /* 40 */ 0x8058, /* 41 */ 0x8058, /* 42 */ 0x8058, /* 43 */ 0x8058,
]);

// ---------------------------------------------------------------------------
// HGFormatUtils::toGLInternalFormat(HGFormat fmt, bool)        @Helium 0xa1c10
//   __ZN13HGFormatUtils18toGLInternalFormatE8HGFormatb
//
// Disasm (10 lines, x86_64 slice):
//   0xa1c10  pushq   %rbp
//   0xa1c11  movq    %rsp, %rbp
//   0xa1c14  movl    %edi, %eax                        ; rax = fmt (zero-ext low 32b)
//   0xa1c16  leaq    (%rax,%rax,2), %rax               ; rax = fmt * 3
//   0xa1c1a  leaq    s_HGGLFormatInfos(%rip), %rcx     ; rcx = &s_HGGLFormatInfos[0]
//   0xa1c21  movl    (%rcx,%rax,4), %eax               ; rax = *(u32*)(&table + (fmt*3)*4)
//                                                      ;      = *(u32*)(&table + fmt*12 + 0)
//                                                      ;      = table[fmt].internalFormat
//   0xa1c24  popq    %rbp
//   0xa1c25  retq
//   0xa1c26  nopw    %cs:(%rax,%rax)                   ; padding
//   (arm64 slice @0x9b1a8 is identical: w8=fmt*0xc; ldr w0,[table,x8])
//
// SEMANTICS: index the s_HGGLFormatInfos table by `fmt` and return the +0x0
// (internalFormat) u32 field of that entry. `fmt*3` scaled by the 4-byte
// `movl` operand size == `fmt*12` byte stride == one 3-u32 entry; the +0x0
// column selected is `internalFormat`. The `bool` second argument is
// IGNORED by this overload (it exists only to distinguish the two-arg
// signature; %esi is never read). `movl %edi,%eax` treats fmt as an
// UNSIGNED 32-bit index.
//
// NO bounds check in the disasm (like `metalFormat`, unlike `bytesPerPixel`).
// A `fmt` outside [0, 43] would read past the 44-entry table (C++ UB); per
// Rule 3 we throw citing @0xADDR rather than fabricate a value — callers
// must clamp fmt to a valid HGFormat first.
//
// Zero in-scope callees, zero externs, zero indirect calls — pure table
// lookup (depgraph.py deps prints nothing; no `callq` in the disasm).
//
// Source disassembly:
//   raw-port/re/disasm/Helium.__ZN13HGFormatUtils18toGLInternalFormatE8HGFormatb.s (10 lines)
export function HGFormatUtils_toGLInternalFormat(fmt: number, _flag: boolean): number {
  // @Helium 0xa1c14: movl %edi,%eax — zero-extend fmt to an unsigned index.
  //   The bool arg (%esi) is unused by this overload.
  const s = (fmt | 0) >>> 0;
  // @Helium 0xa1c16-0xa1c21: rax = *(u32*)(&s_HGGLFormatInfos + fmt*12 + 0x0)
  //   NO bounds check in the disasm; raise for OOB rather than read past the
  //   44-entry table (Rule 3 — throw on undecoded/UB, never approximate).
  if (s > 0x2b) {
    throw new Error(
      "HGFormatUtils::toGLInternalFormat(fmt=" +
        String(fmt) +
        ") — fmt out of range [0, 0x2b]; disasm @Helium 0xa1c21 has NO bounds " +
        "check and would read past the 44-entry s_HGGLFormatInfos table " +
        "(&s_HGGLFormatInfos + fmt*12 + 0x0), yielding C++ undefined behaviour. " +
        "Callers must clamp fmt to a valid HGFormat. @Helium 0xa1c10",
    );
  }
  // Result is the u32 internalFormat column value, returned in %eax.
  return S_HGGLFORMATINFOS_INTERNAL_FORMAT[s]! >>> 0;
}

// ---------------------------------------------------------------------------
// (anonymous namespace)::s_HGGLFormatInfos[fmt].type — the u32 at +0x8 of each
// 12-byte entry of the table documented above (@Helium __TEXT,__const
// 0x3cd400, x86_64 slice).  This is the THIRD column of the same 44-entry
// table whose +0x0 (internalFormat) column is transcribed into
// S_HGGLFORMATINFOS_INTERNAL_FORMAT; only the column this method reads is
// decoded here (the +0x4 `format` column belongs to toGLFormat, a separate
// ledger entry).
//
// Values read verbatim from the shipping x86_64 Helium slice at
// (0x3cd400 + fmt*12 + 0x8) — the exact effective address the `movl
// 0x8(%rcx,%rax,4)` at 0xa1ca1 computes.  They are raw GL pixel-type enums:
//   0x1401 GL_UNSIGNED_BYTE            0x1403 GL_UNSIGNED_SHORT
//   0x1406 GL_FLOAT                    0x140b GL_HALF_FLOAT
//   0x8367 GL_UNSIGNED_INT_8_8_8_8_REV 0x8368 GL_UNSIGNED_INT_2_10_10_10_REV
// The 528-byte (44 * 12) table extent is bounded by the next static symbol
// (the buildFormat UInt8Formats sub-array @0x3cd610), so fmt 0..0x2b is the
// full in-table range.  We DO NOT interpret these values at this layer — they
// are transcribed verbatim.
const S_HGGLFORMATINFOS_TYPE: readonly number[] = Object.freeze([
  //          fmt : type  (raw GL enum u32 @+0x8 of each 12-byte entry)
  /*  0 */ 0x1401, /*  1 */ 0x1401, /*  2 */ 0x1401, /*  3 */ 0x1403,
  /*  4 */ 0x1403, /*  5 */ 0x140b, /*  6 */ 0x140b, /*  7 */ 0x1406,
  /*  8 */ 0x1406, /*  9 */ 0x1406, /* 10 */ 0x1401, /* 11 */ 0x1403,
  /* 12 */ 0x140b, /* 13 */ 0x1406, /* 14 */ 0x8367, /* 15 */ 0x8367,
  /* 16 */ 0x1403, /* 17 */ 0x1401, /* 18 */ 0x1401, /* 19 */ 0x1403,
  /* 20 */ 0x140b, /* 21 */ 0x1406, /* 22 */ 0x8367, /* 23 */ 0x8367,
  /* 24 */ 0x1401, /* 25 */ 0x1403, /* 26 */ 0x1403, /* 27 */ 0x140b,
  /* 28 */ 0x1406, /* 29 */ 0x1406, /* 30 */ 0x1403, /* 31 */ 0x8368,
  /* 32 */ 0x1401, /* 33 */ 0x1403, /* 34 */ 0x1403, /* 35 */ 0x1403,
  /* 36 */ 0x1401, /* 37 */ 0x1401, /* 38 */ 0x1401, /* 39 */ 0x1401,
  /* 40 */ 0x1401, /* 41 */ 0x1401, /* 42 */ 0x1401, /* 43 */ 0x1401,
]);

// ---------------------------------------------------------------------------
// HGFormatUtils::toGLType(HGFormat fmt, bool)                  @Helium 0xa1c90
//   __ZN13HGFormatUtils8toGLTypeE8HGFormatb
//
// Disasm (x86_64 slice, 8 real insns + padding):
//   0xa1c90  pushq   %rbp
//   0xa1c91  movq    %rsp, %rbp
//   0xa1c94  movl    %edi, %eax                        ; rax = fmt (zero-ext low 32b)
//   0xa1c96  leaq    (%rax,%rax,2), %rax               ; rax = fmt * 3
//   0xa1c9a  leaq    s_HGGLFormatInfos(%rip), %rcx     ; rcx = &s_HGGLFormatInfos[0]
//                                                      ;   0xa1ca1 + 0x32b75f = 0x3cd400
//   0xa1ca1  movl    0x8(%rcx,%rax,4), %eax            ; eax = *(u32*)(&table + (fmt*3)*4 + 8)
//                                                      ;     = *(u32*)(&table + fmt*12 + 0x8)
//                                                      ;     = table[fmt].type
//   0xa1ca5  popq    %rbp
//   0xa1ca6  retq
//   0xa1ca7  nopw    (%rax,%rax)                       ; padding
//
// SEMANTICS: index s_HGGLFormatInfos by `fmt` and return the +0x8 (`type`)
// u32 field of that entry.  `fmt*3` scaled by the 4-byte `movl` operand size
// == a `fmt*12` byte stride == exactly one 3-u32 entry, and the extra +0x8
// displacement selects the third column.  The `bool` second argument is
// IGNORED by this overload (%esi is never read) — it exists only to
// distinguish the two-arg signature from the one-arg `toGLType(HGFormat)`
// @0xa1cb0, whose body is byte-identical.
//
// `movl %edi,%eax` zero-extends, so `fmt` is used as an UNSIGNED 32-bit index.
// There is NO bounds check (same as `toGLInternalFormat`/`metalFormat`, unlike
// `bytesPerPixel`): a `fmt` outside [0, 43] reads past the 44-entry table
// (C++ UB).  Per Rule 3 we throw citing @0xADDR rather than fabricate a value;
// callers must clamp fmt to a valid HGFormat first.
//
// Zero in-scope callees, zero externs, zero indirect calls — pure table lookup
// (`depgraph.py deps __ZN13HGFormatUtils8toGLTypeE8HGFormatb` prints nothing;
// there is no `callq` in the disasm).
//
// Source disassembly:
//   raw-port/re/disasm/Helium.__ZN13HGFormatUtils8toGLTypeE8HGFormatb.s (10 lines)
export function HGFormatUtils_toGLType(fmt: number, _flag: boolean): number {
  // @Helium 0xa1c94: movl %edi,%eax — zero-extend fmt to an unsigned index.
  //   The bool arg (%esi) is unused by this overload.
  const s = (fmt | 0) >>> 0;
  // @Helium 0xa1c96-0xa1ca1: eax = *(u32*)(&s_HGGLFormatInfos + fmt*12 + 0x8)
  //   NO bounds check in the disasm; raise for OOB rather than read past the
  //   44-entry table (Rule 3 — throw on undecoded/UB, never approximate).
  if (s > 0x2b) {
    throw new Error(
      "HGFormatUtils::toGLType(fmt=" +
        String(fmt) +
        ") — fmt out of range [0, 0x2b]; disasm @Helium 0xa1ca1 has NO bounds " +
        "check and would read past the 44-entry s_HGGLFormatInfos table " +
        "(&s_HGGLFormatInfos + fmt*12 + 0x8), yielding C++ undefined behaviour. " +
        "Callers must clamp fmt to a valid HGFormat. @Helium 0xa1c90",
    );
  }
  // Result is the u32 `type` column value, returned in %eax.
  return S_HGGLFORMATINFOS_TYPE[s]! >>> 0;
}
