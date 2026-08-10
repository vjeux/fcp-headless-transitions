// OZViewerState — Ozone.framework class (partial port).
//
// This unit ports ONLY the single one-line accessor
// `OZViewerState::getDynamicResolution()` at @Ozone 0x36e2d0. Every other
// member of OZViewerState (ctors, dtors, setters, other getters) is a
// SEPARATE ledger entry and remains OUT OF SCOPE for this file — later
// worker(s) will EXTEND this file with additional methods per the
// one-class-per-file rule.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// Ozone.framework/Versions/A/Ozone (x86_64 slice). Disassembly source:
//   raw-port/re/disasm/__ZN13OZViewerState20getDynamicResolutionEv.s
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (partial — recovered from this getter's single field read)
// -----------------------------------------------------------------------------
//   size ≥ 0x25 (this file only decodes ONE offset)
//   +0x24  dynamicResolution : u8    ; movzbl 0x24(%rdi), %eax  @0x36e2d4
//                                    ; the accessor zero-extends this byte
//                                    ; into a 32-bit return value in %eax.
//   +0x38  displayFlags      : u32   ; movl 0x38(%rdi), %eax    @0x36e684
//                                    ; packed display-flags word; isDisplay3DGrid
//                                    ; tests mask 0xA000 (bits 0x2000|0x8000).
//
// Layout is deliberately UNDER-specified here: we only claim the offset
// we actually read; other slots will be documented as their own methods
// are ported. Adding a `dynamicResolution: number` field is honest at
// this granularity — a u8 field materialised as a JS number.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
//   NONE. This body performs one byte-load and returns. No in-scope
//   callees; no externs; no field writes; no branches.
//
// -----------------------------------------------------------------------------
// SYMBOLS PORTED HERE (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN13OZViewerState20getDynamicResolutionEv
//       — OZViewerState::getDynamicResolution() @Ozone 0x36e2d0
//   * __ZN13OZViewerState13getResolutionEv
//       — OZViewerState::getResolution() @Ozone 0x36e2e0
//         (raw-port/re/disasm/__ZN13OZViewerState13getResolutionEv.s — 23 lines)
//   * __ZNK13OZViewerState10isSnappingEv
//       — OZViewerState::isSnapping() const @Ozone 0x36e670
//         (raw-port/re/disasm/__ZNK13OZViewerState10isSnappingEv.s — 8 lines)
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/__ZNK13OZViewerState10isSnappingEv.s)
// -----------------------------------------------------------------------------
//   0x36e670  pushq   %rbp                       ; frame prologue
//   0x36e671  movq    %rsp, %rbp
//   0x36e674  movzbl  0x3a(%rdi), %eax           ; eax = *(u8*)(this + 0x3a)
//                                                ; zero-extend the byte at +0x3a
//   0x36e678  andb    $0x1, %al                  ; al &= 1 — isolate bit 0
//                                                ; (packed-bitfield read; the
//                                                ;  "snapping" flag is bit 0 of
//                                                ;  the byte at +0x3a)
//   0x36e67a  popq    %rbp                       ; frame epilogue
//   0x36e67b  retq                               ; return al (bool)
//   0x36e67c  nopl    (%rax)                     ; padding — no effect
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/__ZN13OZViewerState20getDynamicResolutionEv.s)
// -----------------------------------------------------------------------------
//   0x36e2d0  pushq   %rbp                       ; frame prologue
//   0x36e2d1  movq    %rsp, %rbp
//   0x36e2d4  movzbl  0x24(%rdi), %eax           ; eax = *(u8*)(this + 0x24)
//                                                ; (zero-extend into 32 bits)
//                                                ; System-V ABI: this = %rdi.
//                                                ; %eax is the return register
//                                                ; (upper 32 bits of %rax are
//                                                ;  implicitly cleared by the
//                                                ;  movzbl-to-32-bit form).
//   0x36e2d8  popq    %rbp                       ; frame epilogue
//   0x36e2d9  retq
//   0x36e2da  nopw    (%rax,%rax)                ; padding — no effect

// ═════════════════════════════════════════════════════════════════════════
// The class
// ═════════════════════════════════════════════════════════════════════════

/**
 * `OZViewerState` — Ozone playback/viewer state (partial port).
 *
 * ONLY the `getDynamicResolution()` accessor is transcribed in this
 * file; every other member is a separate ledger entry and OUT OF SCOPE
 * for this claim. Do NOT add un-transcribed methods to this class —
 * later worker(s) will extend it per the one-class-per-file rule.
 */
export class OZViewerState {
  /**
   * @Ozone +0x24 (u8) — the dynamic-resolution byte. Read by
   * `getDynamicResolution()` @0x36e2d4 via `movzbl 0x24(%rdi), %eax`.
   * The other 0x24 bytes of the object are OUT OF SCOPE for this
   * file and remain undocumented until their own methods are ported.
   */
  dynamicResolution: number = 0; // u8 field @+0x24

  /**
   * @Ozone +0x20 (u32) — the resolution-mode discriminator read by
   * `getResolution()` @0x36e2e7 via `movl 0x20(%rsi), %esi`. A 32-bit
   * load whose value is compared against 1 and 2 to choose a resolution
   * scale factor (see `getResolution` for the mapping). Modelled as a
   * `number` (int32-clamped at truncation points via `| 0`).
   */
  resolutionMode: number = 0; // int32 field @+0x20

  /**
   * @Ozone +0x3a (u8, packed bitfield) — the byte read by `isSnapping()`
   * @0x36e674 via `movzbl 0x3a(%rdi), %eax`. Only bit 0 is consumed by
   * that accessor (`andb $0x1, %al` @0x36e678); the remaining 7 bits hold
   * other packed flags that are OUT OF SCOPE for this file (documented as
   * the methods that read them are ported). Modelled as a `number` in
   * [0, 255].
   */
  snappingFlags: number = 0; // u8 packed-bitfield @+0x3a

  /**
   * @Ozone +0x38 (u32, packed display-flags word) — the 32-bit word read by
   * `isDisplay3DGrid()` @0x36e684 via `movl 0x38(%rdi), %eax`. That accessor
   * consumes only the two bits in mask 0xA000 (bit 13 = 0x2000, bit 15 =
   * 0x8000); the remaining 30 bits hold other packed display flags that are
   * OUT OF SCOPE for this file (documented as the methods that read them are
   * ported). Modelled as a `number` interpreted as an unsigned 32-bit word.
   */
  displayFlags_at_0x38: number = 0; // u32 packed-bitfield @+0x38

  /**
   * `OZViewerState::getDynamicResolution()` @Ozone 0x36e2d0
   *   — __ZN13OZViewerState20getDynamicResolutionEv
   *
   * Faithful transcription of the 4-instruction body: pushq/movq %rbp
   * (prologue), `movzbl 0x24(%rdi), %eax` — load the u8 at +0x24 and
   * zero-extend to 32 bits — popq %rbp (epilogue), retq. The return
   * value is a u8 zero-extended to u32; expressed in JS as a number in
   * the range [0, 255] (masking with `& 0xff` preserves the movzbl
   * semantics against a hypothetical wider field).
   *
   *   0x36e2d0  pushq  %rbp
   *   0x36e2d1  movq   %rsp, %rbp
   *   0x36e2d4  movzbl 0x24(%rdi), %eax
   *   0x36e2d8  popq   %rbp
   *   0x36e2d9  retq
   */
  getDynamicResolution(): number {
    // @0x36e2d0..0x36e2d1 — prologue (no TS-visible effect).
    // @0x36e2d4           — movzbl 0x24(%rdi), %eax: read the u8 at
    //                       offset +0x24 and zero-extend to 32 bits.
    // @0x36e2d8..0x36e2d9 — epilogue + retq.
    return this.dynamicResolution & 0xff;
  }

  /**
   * `OZViewerState::getResolution()` @Ozone 0x36e2e0
   *   — __ZN13OZViewerState13getResolutionEv
   *
   * Returns a `PCVector2<float>` (two f32s: x, y) whose components are
   * BOTH set to the same scalar picked from a 3-entry lookup based on
   * the `resolutionMode` field at +0x20:
   *
   *     resolutionMode == 2  →  0.25f   (quarter-res)
   *     resolutionMode == 1  →  0.50f   (half-res)
   *     otherwise           →  1.00f    (full-res / any other mode)
   *
   * The C++ ABI here is sret: %rdi = out-pointer to the caller's 8-byte
   * PCVector2<float> slot, %rsi = `this`. `%rax` is set to `%rdi` at
   * prologue exit (System V sret returns the out-ptr in %rax). Both
   * writes are `movss` (fp32 stores).
   *
   * Faithful line-for-line transcription of the 23-line disassembly:
   *
   *   0x36e2e0  pushq  %rbp                       ; prologue
   *   0x36e2e1  movq   %rsp, %rbp
   *   0x36e2e4  movq   %rdi, %rax                 ; %rax = sret out-ptr
   *   0x36e2e7  movl   0x20(%rsi), %esi           ; esi = this->resolutionMode (32-bit load)
   *   0x36e2ea  xorl   %ecx, %ecx                 ; ecx = 0
   *   0x36e2ec  cmpl   $0x1, %esi                 ; flags = mode - 1
   *   0x36e2ef  sete   %dl                        ; dl = (mode == 1) ? 1 : 0
   *   0x36e2f2  cmpl   $0x2, %esi                 ; flags = mode - 2
   *   0x36e2f5  je     0x36e310                   ; if (mode == 2) goto QUARTER
   *   0x36e2f7  movb   %dl, %cl                   ; cl = dl (0 or 1)
   *   0x36e2f9  leaq   0x39d980(%rip), %rdx       ; rdx = &FULL_HALF_TABLE @0x70bc80
   *   0x36e300  movss  (%rdx,%rcx,4), %xmm0       ; xmm0 = FULL_HALF_TABLE[cl] fp32
   *   0x36e305  movss  %xmm0, (%rax)              ; out->x = scalar
   *   0x36e309  movss  %xmm0, 0x4(%rax)           ; out->y = scalar
   *   0x36e30e  popq   %rbp
   *   0x36e30f  retq
   *
   *   ; QUARTER-RES BRANCH (@0x36e310):
   *   0x36e310  movss  0x39d970(%rip), %xmm0      ; xmm0 = QUARTER_RES fp32 @0x70bc88
   *   0x36e318  movss  %xmm0, (%rax)              ; out->x = 0.25f
   *   0x36e31c  movss  %xmm0, 0x4(%rax)           ; out->y = 0.25f
   *   0x36e321  popq   %rbp
   *   0x36e322  retq
   *   0x36e323  nopw   %cs:(%rax,%rax)            ; padding
   *
   * CONSTANTS decoded from Ozone x86_64 __TEXT.__const:
   *   @0x70bc80  fp32  1.0f   (FULL_HALF_TABLE[0])   [decoded from file offset 0x707480+0x6900]
   *   @0x70bc84  fp32  0.5f   (FULL_HALF_TABLE[1])
   *   @0x70bc88  fp32  0.25f  (QUARTER-RES scalar; separate rip-relative load)
   *
   * The two "cmpl" instructions in AT&T order compute `mode - immediate`;
   * `sete` after `cmp $1` sets the byte when `mode - 1 == 0` i.e. mode==1;
   * `je` after `cmp $2` branches when mode==2. `movb %dl, %cl` then makes
   * `cl == 1` iff mode == 1 (and 0 otherwise), which indexes the 2-entry
   * FULL_HALF_TABLE. `xorl %ecx, %ecx` at the top zeroes the upper bits so
   * the 8-bit `movb` write leaves rcx = 0 or 1 exactly.
   *
   * Zero in-scope callees, zero externs — pure branch + table read.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZN13OZViewerState13getResolutionEv.s (23 lines)
   */
  getResolution(): { x: number; y: number } {
    // @0x36e2e7  movl 0x20(%rsi), %esi
    //   32-bit load: clamp with `| 0` so the compare below observes the
    //   same int32 range the machine sees. (JS number stores int32 exactly.)
    const mode = this.resolutionMode | 0;

    // fp32 table constants — Math.fround-clamped since the machine's
    // `movss` load returns a 32-bit float. 1.0 and 0.5 and 0.25 are all
    // exactly representable in f32, so fround is a no-op here — kept
    // for machine-numerics fidelity per Rule 4.
    const FULL_RES_1_0 = Math.fround(1.0);     // @0x70bc80 fp32
    const HALF_RES_0_5 = Math.fround(0.5);     // @0x70bc84 fp32
    const QUARTER_RES_0_25 = Math.fround(0.25); // @0x70bc88 fp32

    // @0x36e2f2..0x36e2f5  cmpl $2, %esi; je 0x36e310
    //   AT&T operand order: cmpl imm, reg computes `reg - imm`. `je`
    //   takes on ZF==1 i.e. `mode - 2 == 0` i.e. mode == 2.
    if (mode === 2) {
      // @0x36e310..0x36e31c — QUARTER-RES branch
      const s = QUARTER_RES_0_25;
      return { x: s, y: s };
    }

    // @0x36e2ec..0x36e2ef  cmpl $1, %esi; sete %dl
    //   dl = (mode == 1) ? 1 : 0.
    // @0x36e2ea  xorl %ecx, %ecx     ; @0x36e2f7  movb %dl, %cl
    //   cl = dl (upper bits of ecx were pre-zeroed).
    const cl = mode === 1 ? 1 : 0;

    // @0x36e2f9..0x36e300  leaq FULL_HALF_TABLE(rip), %rdx;
    //                      movss (%rdx, %rcx, 4), %xmm0
    //   Two-entry fp32 table: [FULL_RES_1_0, HALF_RES_0_5].
    const FULL_HALF_TABLE: readonly [number, number] = [FULL_RES_1_0, HALF_RES_0_5];
    const s = FULL_HALF_TABLE[cl]!;

    // @0x36e305..0x36e309  movss %xmm0, (%rax); movss %xmm0, 0x4(%rax)
    //   out->x = out->y = scalar (both 32-bit stores).
    return { x: s, y: s };
  }

  /**
   * `OZViewerState::isSnapping() const` @Ozone 0x36e670
   *   — __ZNK13OZViewerState10isSnappingEv
   *
   * Faithful transcription of the 5-instruction body: a packed-bitfield
   * read. Loads the u8 at +0x3a (`movzbl 0x3a(%rdi), %eax`, zero-extended
   * to 32 bits), then masks bit 0 (`andb $0x1, %al`), and returns that
   * single bit as the boolean result. `this` is %rdi (System-V ABI);
   * %al/%eax is the return register.
   *
   *   0x36e670  pushq  %rbp
   *   0x36e671  movq   %rsp, %rbp
   *   0x36e674  movzbl 0x3a(%rdi), %eax    ; eax = *(u8*)(this + 0x3a)
   *   0x36e678  andb   $0x1, %al           ; al &= 1 — isolate bit 0
   *   0x36e67a  popq   %rbp
   *   0x36e67b  retq                       ; return al
   *
   * Zero in-scope callees, zero externs — one byte-load, one mask.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZNK13OZViewerState10isSnappingEv.s (8 lines)
   */
  isSnapping(): boolean {
    // @0x36e670..0x36e671 — prologue (no TS-visible effect).
    // @0x36e674           — movzbl 0x3a(%rdi), %eax: read the u8 at +0x3a.
    // @0x36e678           — andb $0x1, %al: isolate bit 0 of that byte.
    // @0x36e67a..0x36e67b — epilogue + retq (return al as a bool).
    return (this.snappingFlags & 0x1) !== 0;
  }

  /**
   * `OZViewerState::isDisplay3DGrid() const` @Ozone 0x36e680
   *   — __ZNK13OZViewerState15isDisplay3DGridEv
   *
   * Faithful transcription of the body: load the u32 display-flags word at
   * +0x38, invert it, then test it against the 2-bit mask 0xA000 and set the
   * boolean from ZF.
   *
   *   0x36e680  pushq  %rbp
   *   0x36e681  movq   %rsp, %rbp
   *   0x36e684  movl   0x38(%rdi), %eax     ; eax = *(u32*)(this + 0x38)
   *   0x36e687  notl   %eax                 ; eax = ~flags
   *   0x36e689  testl  $0xa000, %eax        ; ZF = ((~flags & 0xA000) == 0)
   *   0x36e68e  sete   %al                  ; al = ZF
   *   0x36e691  popq   %rbp
   *   0x36e692  retq                        ; return al
   *
   * `testl $0xa000, ~flags` sets ZF iff `(~flags & 0xA000) == 0`, i.e. iff
   * BOTH bits of the mask 0xA000 (0x2000 and 0x8000) are SET in `flags`.
   * `sete %al` returns true exactly in that case. Equivalent boolean:
   *   `(flags & 0xA000) === 0xA000`.
   *
   * Zero in-scope callees, zero externs — one word-load, one mask-test.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZNK13OZViewerState15isDisplay3DGridEv.s (10 lines)
   */
  isDisplay3DGrid(): boolean {
    // @0x36e680..0x36e681 — prologue (no TS-visible effect).
    // @0x36e684           — movl 0x38(%rdi), %eax: read the u32 at +0x38.
    // @0x36e687           — notl %eax: eax = ~flags.
    // @0x36e689           — testl $0xa000, %eax: ZF = ((~flags & 0xA000)==0).
    // @0x36e68e           — sete %al: al = ZF, i.e. both mask bits set in flags.
    // @0x36e691..0x36e692 — epilogue + retq (return al as a bool).
    // (flags & 0xA000) === 0xA000  ⇔  (~flags & 0xA000) === 0.
    const MASK_0xA000 = 0xa000; // @0x36e689 imm — bits 0x2000 | 0x8000
    return (this.displayFlags_at_0x38 & MASK_0xA000) === MASK_0xA000;
  }
}
