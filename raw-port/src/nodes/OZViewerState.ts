// OZViewerState — Ozone renderer's per-viewer state. This unit ports
// ONLY `getResolution()` @Ozone 0x36e2e0; the rest of the class is
// separate ledger entries to be added to this same file when their
// units are claimed (per the "one class per file, extend later" rule).
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// Ozone.framework/Versions/A/Ozone (x86_64 slice; unadjusted VAs from
// `otool -tV`). Disassembly source:
//   raw-port/re/disasm/__ZN13OZViewerState13getResolutionEv.s
//
// ─────────────────────────────────────────────────────────────────────────
// STRUCT LAYOUT (recovered from this fn's single read)
// ─────────────────────────────────────────────────────────────────────────
// OZViewerState {
//   ...                                       ; slots [+0..+0x1f] not decoded here
//   +0x20  resolutionEnum : uint32_t          ; read @0x36e2e7 as `movl 0x20(%rsi),%esi`.
//                                             ;   Values observed via the branches:
//                                             ;     0 → full     (scale 1.0)
//                                             ;     1 → half     (scale 0.5)
//                                             ;     2 → quarter  (scale 0.25)
//   ...                                       ; further slots not decoded here
// }
// This ctor/field-decoder pattern is common: getResolution() only reads
// the enum at +0x20; every other slot layout is out of scope for this
// unit.
//
// ─────────────────────────────────────────────────────────────────────────
// RETURN VALUE ABI
// ─────────────────────────────────────────────────────────────────────────
// The function has an sret return: rdi is a pointer to caller-owned
// storage for a 2-float vector (both lanes written the SAME scalar).
// Semantics: (x, y) resolution-scale factor — used by later code to
// scale render tile dimensions. On return rax = rdi (the sret pointer),
// matching the SysV ABI for sret returns.
//
// In TS we model this as a `{ x: number; y: number }` return; the two
// fields hold identical float32 values.
//
// ─────────────────────────────────────────────────────────────────────────
// CONSTANT TABLES (decoded from the Ozone binary)
// ─────────────────────────────────────────────────────────────────────────
// Two RIP-relative operands reference float32 constants in Ozone's
// __DATA_CONST/__const:
//
//   @0x36e2f9  leaq 0x39d980(%rip), %rdx     ; RIP-after=0x36e300;
//                                             ; target = 0x36e300 + 0x39d980
//                                             ;        = 0x70bc80.
//   @0x36e300  movss (%rdx,%rcx,4), %xmm0    ; xmm0 = TABLE[rcx]
//                                             ; where rcx ∈ {0,1}
//                                             ; (rcx = (enum == 1) ? 1 : 0
//                                             ;  via the setb %dl / movb %dl,%cl
//                                             ;  @0x36e2ef..0x36e2f7).
//
//   @0x36e310  movss 0x39d970(%rip), %xmm0   ; RIP-after=0x36e318;
//                                             ; target = 0x36e318 + 0x39d970
//                                             ;        = 0x70bc88 (=TABLE[2]).
//
// The two RIP operands land in adjacent slots of a single 3-entry table
// TABLE[0..2] at Ozone 0x70bc80:
//
//   xxd -s 0x70bc80 -l 12 Ozone :
//     0070bc80: 0000 803f 0000 003f 0000 803e
//     = 1.0f   , 0.5f   , 0.25f
//
// So the enum-to-scale map is:
//     resolutionEnum == 0 → 1.0
//     resolutionEnum == 1 → 0.5
//     resolutionEnum == 2 → 0.25
//     resolutionEnum == 3+ → ??? — falls through the `sete %dl` (which sets
//                              %dl only for `== 1`) and lands on `movb %dl,%cl`
//                              where %dl=0 (because %esi is neither 1 nor 2),
//                              so cl=0 → TABLE[0] = 1.0f. In effect any
//                              enum outside {0,1,2} maps to 1.0f. This is a
//                              faithful transcription; the disasm has no
//                              range check.
//
// ─────────────────────────────────────────────────────────────────────────
// FRONTIER CALLEES
// ─────────────────────────────────────────────────────────────────────────
// NONE. Pure arithmetic + one memory load; no `callq`. Zero externs.
//
// ─────────────────────────────────────────────────────────────────────────
// Symbols ported here (mangled → address)
// ─────────────────────────────────────────────────────────────────────────
//   * __ZN13OZViewerState13getResolutionEv
//       — OZViewerState::getResolution() @Ozone 0x36e2e0
//
// ─────────────────────────────────────────────────────────────────────────
// FULL DISASM (raw-port/re/disasm/__ZN13OZViewerState13getResolutionEv.s)
// ─────────────────────────────────────────────────────────────────────────
//   0x36e2e0  pushq %rbp
//   0x36e2e1  movq  %rsp, %rbp
//   0x36e2e4  movq  %rdi, %rax                ; rax = sret pointer (out)
//                                             ;   ABI: sret return -> caller
//                                             ;   supplies dest; fn returns
//                                             ;   the dest pointer in rax.
//   0x36e2e7  movl  0x20(%rsi), %esi          ; esi = this->resolutionEnum
//                                             ;   (unsigned 32-bit read).
//   0x36e2ea  xorl  %ecx, %ecx                ; ecx = 0
//   0x36e2ec  cmpl  $0x1, %esi                ; esi - 1
//   0x36e2ef  sete  %dl                       ; dl = (esi == 1)
//   0x36e2f2  cmpl  $0x2, %esi                ; esi - 2
//   0x36e2f5  je    0x36e310                  ; if (esi == 2) goto quarter
//   0x36e2f7  movb  %dl, %cl                  ; cl = (esi == 1) ? 1 : 0
//   0x36e2f9  leaq  0x39d980(%rip), %rdx      ; rdx = &TABLE[0] @0x70bc80
//   0x36e300  movss (%rdx,%rcx,4), %xmm0      ; xmm0 = TABLE[cl]
//                                             ;   cl == 0 → 1.0f (full)
//                                             ;   cl == 1 → 0.5f (half)
//   0x36e305  movss %xmm0, (%rax)             ; sret->x = xmm0
//   0x36e309  movss %xmm0, 0x4(%rax)          ; sret->y = xmm0  (same scalar)
//   0x36e30e  popq  %rbp
//   0x36e30f  retq
//
//   ─── 0x36e310: quarter branch (esi == 2) ────────────────────────────
//   0x36e310  movss 0x39d970(%rip), %xmm0     ; xmm0 = TABLE[2] = 0.25f
//   0x36e318  movss %xmm0, (%rax)             ; sret->x = 0.25f
//   0x36e31c  movss %xmm0, 0x4(%rax)          ; sret->y = 0.25f
//   0x36e321  popq  %rbp
//   0x36e322  retq
//   0x36e323  nopw  %cs:(%rax,%rax)           ; 6-byte alignment nop
// ─────────────────────────────────────────────────────────────────────────

/**
 * The two-float sret return. Both lanes hold the SAME resolution scale
 * (x==y always) — the disasm writes xmm0 twice: `movss %xmm0, (%rax)`
 * @0x36e305 and `movss %xmm0, 0x4(%rax)` @0x36e309.
 */
export interface OZViewerStateResolution {
  x: number;
  y: number;
}

/**
 * The RIP-relative constant table at Ozone 0x70bc80, decoded from the
 * binary via `xxd -s 0x70bc80 -l 12 Ozone`. Three float32 slots that
 * map the `resolutionEnum` at OZViewerState+0x20 to a scale factor.
 *
 *   0070bc80: 0000 803f 0000 003f 0000 803e   =  1.0 , 0.5 , 0.25
 *
 * Read as (little-endian) IEEE-754:
 *   0x3f800000 = 1.0        (full resolution)
 *   0x3f000000 = 0.5        (half resolution)
 *   0x3e800000 = 0.25       (quarter resolution)
 *
 * The three entries are addressed as one array — the disasm uses two
 * different RIP-relative operands, but both point into the same 12-byte
 * block: 0x36e2f9→0x70bc80 (base for indices 0,1) and 0x36e310→0x70bc88
 * (direct load of index 2).
 *
 * Wrapped in Math.fround because the memory format is float32 — reads
 * are `movss` (single-precision), so the returned scalar has 24-bit
 * mantissa precision (Rule 4: match the machine's numerics).
 */
const RESOLUTION_TABLE_0x70bc80: readonly number[] = [
  Math.fround(1.0), // @Ozone 0x70bc80 — full     resolution
  Math.fround(0.5), // @Ozone 0x70bc84 — half     resolution
  Math.fround(0.25), // @Ozone 0x70bc88 — quarter  resolution
];

/**
 * `OZViewerState` — Ozone renderer per-viewer state. This file
 * transcribes ONLY `getResolution()`; every other method is a separate
 * ledger entry to be added to this same file when claimed.
 *
 * Layout: only the +0x20 slot (resolutionEnum, u32) is decoded here.
 * The rest of the struct is deferred.
 */
export class OZViewerState {
  /**
   * @Ozone this+0x20 — the resolution-enum slot read by
   * getResolution() @0x36e2e7. `movl 0x20(%rsi), %esi` = unsigned 32-bit
   * read. Values observed via the branches: 0=full, 1=half, 2=quarter.
   */
  resolutionEnum: number = 0;

  /**
   * `OZViewerState::getResolution()` — @Ozone 0x36e2e0
   * (__ZN13OZViewerState13getResolutionEv).
   *
   * Faithful line-for-line transcription of the 20-instruction body.
   * Returns a two-float vector whose x/y components are BOTH the
   * resolution-scale factor for this viewer's current resolutionEnum:
   *   enum==0 → 1.0, enum==1 → 0.5, enum==2 → 0.25.
   * Any other enum value maps to 1.0 (see the CONSTANT TABLES section
   * in the header — the disasm has no range check, and the setb/movb
   * pair yields cl=0 for every non-{1,2} input).
   *
   * The sret ABI (rdi = out-pointer, rax = out-pointer on return) is
   * modelled here as a plain object return; the caller consumes {x,y}
   * exactly as they would consume the two `movss …, 4(%rax)` stores.
   */
  getResolution(): OZViewerStateResolution {
    // @0x36e2e0..0x36e2e4  prologue + save sret pointer in rax
    //                       (No TS-visible effect — the return value
    //                        object below IS the sret target.)
    // @0x36e2e7           esi = this->resolutionEnum
    // Note: the disasm uses u32 load, then all compares are against
    // small unsigned constants (1, 2). We model with a `| 0` truncation
    // so a float or oversize value in `resolutionEnum` behaves like
    // libc's u32→i32 semantics for the compare (which for values within
    // [0, 2^31) is identical to unsigned, matching the disasm).
    const esi: number = this.resolutionEnum | 0;

    // @0x36e2ea           ecx = 0
    let cl: number = 0;

    // @0x36e2ec..0x36e2ef  dl = (esi == 1)
    const dl: number = esi === 1 ? 1 : 0;

    // @0x36e2f2..0x36e2f5  if (esi == 2) goto quarter
    if (esi === 2) {
      // @0x36e310         xmm0 = TABLE[2] = 0.25f
      // @0x36e318,0x36e31c sret->x = sret->y = xmm0
      const q = RESOLUTION_TABLE_0x70bc80[2]; // 0.25f — @Ozone 0x70bc88
      return { x: q, y: q };
    }

    // @0x36e2f7           cl = dl
    cl = dl;
    // @0x36e2f9..0x36e300  xmm0 = TABLE[cl]  (cl ∈ {0,1})
    //                       TABLE base = 0x70bc80 (Ozone __DATA_CONST).
    const s = RESOLUTION_TABLE_0x70bc80[cl]; // @Ozone 0x70bc80 + cl*4
    // @0x36e305,0x36e309   sret->x = sret->y = xmm0
    return { x: s, y: s };
    // @0x36e30e..0x36e30f  epilogue + retq (No TS-visible effect.)
  }
}
