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
//                                    ; tests mask 0xA000 (bits 0x2000|0x8000),
//                                    ; isDisplaySlivers tests 0xC000 (0x4000|0x8000).
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
//   * __ZN13OZViewerState23getFullscreenViewOffsetEv
//       — OZViewerState::getFullscreenViewOffset() @Ozone 0x36e650
//         (raw-port/re/disasm/__ZN13OZViewerState23getFullscreenViewOffsetEv.s
//          — 8 lines)
//         (raw-port/re/disasm/__ZNK13OZViewerState10isSnappingEv.s — 8 lines)
//   * __ZN13OZViewerState15setMirroringHMDEb
//       — OZViewerState::setMirroringHMD(bool) @Ozone 0x36e5a0
//         (raw-port/re/disasm/__ZN13OZViewerState15setMirroringHMDEb.s — 7 lines)
//         one `movb %sil, 0x102(%rdi)` — u8 flag field @+0x102.
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

// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/__ZN13OZViewerState23getFullscreenViewOffsetEv.s)
// -----------------------------------------------------------------------------
//   0x36e650  pushq   %rbp                       ; frame prologue
//   0x36e651  movq    %rsp, %rbp
//   0x36e654  movq    %rdi, %rax                 ; return the sret pointer in %rax
//                                                ; (System-V: a MEMORY-class return
//                                                ;  makes %rdi the hidden out-param
//                                                ;  and %rsi the real `this`)
//   0x36e657  movq    0x104(%rsi), %rcx          ; rcx = *(u64*)(this + 0x104)
//                                                ; ONE unaligned 8-byte read covering
//                                                ; both int32 lanes at +0x104/+0x108
//   0x36e65e  movq    %rcx, (%rdi)               ; store those 8 bytes into the
//                                                ; caller's return slot
//   0x36e661  popq    %rbp                       ; frame epilogue
//   0x36e662  retq
//   0x36e663  nopw    %cs:(%rax,%rax)            ; padding — no effect
//
// The hidden-sret calling convention is what identifies the return type as a
// BY-VALUE class rather than a plain 8-byte scalar: an 8-byte POD would come
// back in %rax directly. The type itself is named by the matching setter,
// `OZViewerState::setFullscreenViewOffset(PCVector2<int> const&)`
// (__ZN13OZViewerState23setFullscreenViewOffsetERK9PCVector2IiE) @Ozone 0x36e230,
// whose body is the exact mirror image of this getter:
//   0x36e234  movq (%rsi), %rax        ; read the 8 bytes of the PCVector2<int>
//   0x36e237  movq %rax, 0x104(%rdi)   ; write them to this + 0x104
// so `PCVector2<int>` is 8 bytes and lives at OZViewerState+0x104.

/**
 * `PCVector2<int>` — the 8-byte, two-lane integer vector that
 * `getFullscreenViewOffset()` returns and
 * `setFullscreenViewOffset(PCVector2<int> const&)` @Ozone 0x36e230 accepts.
 *
 * Both accessors move the whole thing as a single `movq`, so the only facts the
 * binary pins here are: 8 bytes total, and the class is non-trivial enough for
 * the System-V ABI to give it MEMORY class (hence the sret pointer in %rdi).
 * The two `int` lanes at +0x00 and +0x04 come from the `PCVector2IiE`
 * mangling — `I i E` is the template argument `int`.
 *
 * `PCVector2` itself is a ProCore template with its own (not-yet-ported) ledger
 * entries; this interface models only the storage the Ozone accessors touch.
 *
 * @0xADDR Ozone 0x36e657 (the 8-byte read) / 0x36e237 (the mirroring write)
 */
export interface PCVector2Int {
  /** +0x00 (int32) — lane 0, the low half of the `movq` @Ozone 0x36e657. */
  x: number;
  /** +0x04 (int32) — lane 1, the high half of the same `movq`. */
  y: number;
}

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
   * @Ozone +0x58 (u8) — the "render full view" flag, written by
   * `setRenderFullView(bool)` @0x36e554 via `movb %sil, 0x58(%rdi)`.
   *
   * The single-BYTE store (`movb` of `%sil`, the low byte of the second
   * integer argument register) is what fixes both the offset and the width:
   * this is a C++ `bool`, one byte, and nothing adjacent is touched. Modelled
   * as a `number` in [0, 255] so the exact byte the machine writes stays
   * legible; no reader of this slot is ported yet, so nothing here interprets
   * it further.
   */
  renderFullViewAt58: number = 0; // u8 field @+0x58

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
   * @Ozone +0x34 (8-byte qword) — copied wholesale by
   * `cloneSettings(OZViewerState const&)` @0x36dfc4 via a single
   * `movq 0x34(%rsi),%rax ; movq %rax,0x34(%rdi)`. The `movq` copies the
   * raw 8 bytes with no interpretation, so we preserve them as an opaque
   * `bigint` (u64) to keep every bit exact. The internal semantics of this
   * slot (whether it is a double, a pair of u32s, or a pointer) are OUT OF
   * SCOPE until a method that READS a typed view of it is ported.
   */
  settingsQwordAt34: bigint = 0n; // opaque u64 @+0x34

  /**
   * @Ozone +0x3c (u8) — copied by `cloneSettings` @0x36dfcc via
   * `movzbl 0x3c(%rsi),%eax ; movb %al,0x3c(%rdi)` (byte load, byte store).
   * A single settings byte; its bit semantics are OUT OF SCOPE until a
   * reader is ported. Modelled as a `number` in [0, 255].
   */
  settingsByteAt3c: number = 0; // u8 @+0x3c

  /**
   * @Ozone +0x3d (u8) — copied by `cloneSettings` @0x36dfd3 via
   * `movzbl 0x3d(%rsi),%eax ; movb %al,0x3d(%rdi)`, directly adjacent to
   * +0x3c. A second settings byte kept in the same clone set. Modelled as
   * a `number` in [0, 255].
   *
   * NAMED by its writer: `setCompensateAspectRatio(bool)` @0x36e404 stores the
   * incoming `bool` into exactly this slot (`movb %sil, 0x3d(%rdi)`), so the
   * byte is the viewer's "compensate aspect ratio" flag. The field keeps its
   * offset-based name because `cloneSettings` — the method that introduced it —
   * treats it as an opaque settings byte, and renaming a landed field would
   * churn its callers; the role is recorded here instead.
   */
  settingsByteAt3d: number = 0; // u8 @+0x3d  (a.k.a. compensateAspectRatio)

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
   * @Ozone +0x102 (u8) — the "mirroring HMD" flag byte written by
   * `setMirroringHMD(bool)` @0x36e5a4 via `movb %sil, 0x102(%rdi)`.
   *
   * The store is a plain 8-bit `movb` of the argument register's low byte
   * (`%sil` = low byte of `%rsi`, the second System-V integer argument):
   * the setter neither masks the value to 0/1 nor reads the field back, so
   * this unit learns only that ONE byte lives at +0x102 and that it holds
   * whatever byte the caller supplied. Modelled as a `number` in [0, 255]
   * rather than a `boolean` so that fidelity is preserved — a C++ `bool`
   * argument is 0 or 1 by ABI, but the instruction copies the byte
   * verbatim, and the getter that reads it back is a separate ledger unit
   * which may or may not mask it.
   *
   * This also pushes the known lower bound on `sizeof(OZViewerState)` to
   * >= 0x103; the bytes between +0x3e and +0x102 remain UNDECODED and no
   * field is invented for them (Rule 5).
   */
  mirroringHMD_at_0x102: number = 0; // u8 flag @+0x102

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

  /**
   * `OZViewerState::isDisplaySlivers() const` @Ozone 0x36e6a0
   *   — __ZNK13OZViewerState16isDisplaySliversEv
   *
   * Faithful transcription of the body: load the u32 display-flags word at
   * +0x38, invert it, then test it against the 2-bit mask 0xC000 and set the
   * boolean from ZF. Structurally identical to isDisplay3DGrid() but with a
   * different mask (0xC000 = 0x4000 | 0x8000).
   *
   *   0x36e6a0  pushq  %rbp
   *   0x36e6a1  movq   %rsp, %rbp
   *   0x36e6a4  movl   0x38(%rdi), %eax     ; eax = *(u32*)(this + 0x38)
   *   0x36e6a7  notl   %eax                 ; eax = ~flags
   *   0x36e6a9  testl  $0xc000, %eax        ; ZF = ((~flags & 0xC000) == 0)
   *   0x36e6ae  sete   %al                  ; al = ZF
   *   0x36e6b1  popq   %rbp
   *   0x36e6b2  retq                        ; return al
   *
   * `testl $0xc000, ~flags` sets ZF iff `(~flags & 0xC000) == 0`, i.e. iff
   * BOTH bits of the mask 0xC000 (0x4000 and 0x8000) are SET in `flags`.
   * `sete %al` returns true exactly in that case. Equivalent boolean:
   *   `(flags & 0xC000) === 0xC000`.
   *
   * Zero in-scope callees, zero externs — one word-load, one mask-test.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZNK13OZViewerState16isDisplaySliversEv.s (10 lines)
   */
  isDisplaySlivers(): boolean {
    // @0x36e6a0..0x36e6a1 — prologue (no TS-visible effect).
    // @0x36e6a4           — movl 0x38(%rdi), %eax: read the u32 at +0x38.
    // @0x36e6a7           — notl %eax: eax = ~flags.
    // @0x36e6a9           — testl $0xc000, %eax: ZF = ((~flags & 0xC000)==0).
    // @0x36e6ae           — sete %al: al = ZF, i.e. both mask bits set in flags.
    // @0x36e6b1..0x36e6b2 — epilogue + retq (return al as a bool).
    // (flags & 0xC000) === 0xC000  ⇔  (~flags & 0xC000) === 0.
    const MASK_0xC000 = 0xc000; // @0x36e6a9 imm — bits 0x4000 | 0x8000
    return (this.displayFlags_at_0x38 & MASK_0xC000) === MASK_0xC000;
  }

  /**
   * `OZViewerState::cloneSettings(OZViewerState const&)` @Ozone 0x36dfc0
   *   — __ZN13OZViewerState13cloneSettingsERKS_
   *
   * Faithful line-for-line transcription of the 12-line disassembly. `%rdi`
   * is `this` (the destination), `%rsi` is the `OZViewerState const&` source.
   * The body copies THREE adjacent settings slots from src into this:
   *   0x36dfc0  pushq  %rbp
   *   0x36dfc1  movq   %rsp, %rbp
   *   0x36dfc4  movq   0x34(%rsi), %rax     ; rax = src->+0x34 (8-byte qword)
   *   0x36dfc8  movq   %rax, 0x34(%rdi)     ; this->+0x34 = rax
   *   0x36dfcc  movzbl 0x3c(%rsi), %eax     ; eax = (u8) src->+0x3c
   *   0x36dfd0  movb   %al, 0x3c(%rdi)      ; this->+0x3c = al
   *   0x36dfd3  movzbl 0x3d(%rsi), %eax     ; eax = (u8) src->+0x3d
   *   0x36dfd7  movb   %al, 0x3d(%rdi)      ; this->+0x3d = al
   *   0x36dfda  popq   %rbp
   *   0x36dfdb  retq
   *   0x36dfdc  nopl   (%rax)               ; padding
   *
   * SEMANTICS: copy the "settings" sub-state (one 8-byte qword at +0x34 and
   * two adjacent bytes at +0x3c, +0x3d) from another OZViewerState into this
   * one. No return value; a pure field-to-field copy — no branches, no
   * callees, no externs.
   *
   * Note the qword at +0x34 (bytes +0x34..+0x3b) and the bytes at +0x3c/+0x3d
   * are contiguous but copied with distinct widths (one movq, two byte
   * moves), so they are modelled as three separate fields to match exactly
   * what the machine touches.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZN13OZViewerState13cloneSettingsERKS_.s (12 lines)
   */
  cloneSettings(src: OZViewerState): void {
    // @0x36dfc4..0x36dfc8  movq 0x34(%rsi),%rax ; movq %rax,0x34(%rdi)
    //   Copy the raw 8-byte qword at +0x34. BigInt.asUintN(64,...) preserves
    //   the exact 64-bit pattern the movq moves.
    this.settingsQwordAt34 = BigInt.asUintN(64, src.settingsQwordAt34);
    // @0x36dfcc..0x36dfd0  movzbl 0x3c(%rsi),%eax ; movb %al,0x3c(%rdi)
    //   Copy the u8 at +0x3c (byte width preserved with & 0xff).
    this.settingsByteAt3c = src.settingsByteAt3c & 0xff;
    // @0x36dfd3..0x36dfd7  movzbl 0x3d(%rsi),%eax ; movb %al,0x3d(%rdi)
    //   Copy the u8 at +0x3d.
    this.settingsByteAt3d = src.settingsByteAt3d & 0xff;
  }

  /**
   * `OZViewerState::setMirroringHMD(bool)` @Ozone 0x36e5a0
   *   — __ZN13OZViewerState15setMirroringHMDEb
   *
   * Faithful line-for-line transcription of the 6-instruction body — a
   * single-byte store, no read-back, no branch, no return value:
   *
   *   0x36e5a0  pushq  %rbp                     ; frame prologue
   *   0x36e5a1  movq   %rsp, %rbp
   *   0x36e5a4  movb   %sil, 0x102(%rdi)        ; *(u8*)(this + 0x102) = (u8)arg
   *   0x36e5ab  popq   %rbp                     ; frame epilogue
   *   0x36e5ac  retq                            ; void
   *   0x36e5ad  nopl   (%rax)                   ; alignment padding
   *
   * System-V x86_64: `%rdi` = `this`, `%rsi` = the `bool` argument, and
   * `%sil` is `%rsi`'s low byte. The `movb` writes exactly that byte to
   * +0x102 — it is NOT masked to 0/1 and NOT sign/zero-extended, so the
   * port stores `arg & 0xff` (the byte the machine copies) rather than
   * normalising to a boolean.
   *
   * The parameter is typed `number` for the same reason: the mangled name
   * says `b` (C++ `bool`, so callers pass 0 or 1), but the instruction
   * copies whatever 8 bits arrive, and typing it `boolean` would silently
   * normalise any other byte a caller could produce.
   *
   * Returns void — %rax is never written before `retq`.
   *
   * Zero in-scope callees, zero externs, no indirect calls — one store.
   * Confirmed via `depgraph.py deps __ZN13OZViewerState15setMirroringHMDEb`
   * (no dependencies reported).
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZN13OZViewerState15setMirroringHMDEb.s (7 lines)
   */
  setMirroringHMD(mirroringHMD: number): void {
    // @0x36e5a0..0x36e5a1 — prologue (no TS-visible effect).
    // @0x36e5a4           — movb %sil, 0x102(%rdi): store the argument's
    //                       low byte into the u8 field at +0x102.
    this.mirroringHMD_at_0x102 = mirroringHMD & 0xff;
    // @0x36e5ab..0x36e5ac — epilogue + retq (no return value).
  }

  /**
   * `OZViewerState::setResolutionMode(OZResolution mode)` @Ozone 0x36e260
   *   — __ZN13OZViewerState17setResolutionModeE12OZResolution
   *
   * The setter for the SAME +0x20 field `getResolution()` @0x36e2e7 reads.
   * A single 32-bit store; no clamping, no validation, no other field
   * touched, returns void.
   *
   * FULL DISASM (4 real insns @0x36e260..0x36e268; 0x36e269 is padding):
   *   0x36e260  pushq %rbp
   *   0x36e261  movq  %rsp, %rbp
   *   0x36e264  movl  %esi, 0x20(%rdi)   ; this->resolutionMode = mode
   *   0x36e267  popq  %rbp
   *   0x36e268  retq
   *   0x36e269  nopl  (%rax)             ; padding, not code
   *
   * That the destination is exactly the field `getResolution()` consumes is
   * what fixes the meaning of the argument: `getResolution()` @0x36e2ec
   * compares that same u32 against 1 and 2 to pick 0.5f / 0.25f, defaulting
   * to 1.0f — so `OZResolution` values 1 and 2 are half- and
   * quarter-resolution and anything else is full-resolution. This method
   * invents no policy of its own; it just writes the word.
   *
   * `movl` is a 32-bit store, so the argument is truncated to 32 bits —
   * mirrored with `| 0`, matching the 32-bit `movl 0x20(%rsi), %esi` load on
   * the getter side.
   *
   * Zero in-scope callees, zero externs, zero indirect calls — one store.
   * (`depgraph.py deps __ZN13OZViewerState17setResolutionModeE12OZResolution`
   * prints nothing; there is no `callq` in the body.)
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZN13OZViewerState17setResolutionModeE12OZResolution.s
   */
  setResolutionMode(mode: number): void {
    // @0x36e260..0x36e261 — prologue (no TS-visible effect).
    // @0x36e264           — movl %esi, 0x20(%rdi): 32-bit store of the arg.
    this.resolutionMode = mode | 0;
    // @0x36e267..0x36e268 — epilogue + retq (void).
  }

  /**
   * @Ozone +0x104 (int32) — lane 0 of the `PCVector2<int>` fullscreen view
   * offset. Read by `getFullscreenViewOffset()` @0x36e657 and written by
   * `setFullscreenViewOffset()` @0x36e237; both do it with a single unaligned
   * 8-byte `movq` spanning this field and the one at +0x108. Note the offset is
   * NOT 8-byte aligned (0x104 = 260), which is exactly what you expect from two
   * `int`s packed at +0x104/+0x108 rather than one 64-bit member.
   */
  fullscreenViewOffsetX_at_0x104: number = 0; // int32 @+0x104

  /**
   * @Ozone +0x108 (int32) — lane 1 of the same `PCVector2<int>`. Covered by the
   * upper half of the `movq 0x104(%rsi), %rcx` @0x36e657.
   */
  fullscreenViewOffsetY_at_0x108: number = 0; // int32 @+0x108

  /**
   * `OZViewerState::getFullscreenViewOffset()` — @Ozone 0x36e650
   * (`__ZN13OZViewerState23getFullscreenViewOffsetEv`).
   *
   * Faithful line-for-line transcription of the 8-line disassembly quoted in
   * the file header: copy the 8 bytes at `this + 0x104` into the caller's
   * return slot and hand that slot back.
   *
   * The C++ signature returns `PCVector2<int>` BY VALUE, which the System-V ABI
   * classifies as MEMORY — so the machine receives the destination in %rdi and
   * the real `this` in %rsi, copies 8 bytes, and returns the destination
   * pointer in %rax (`movq %rdi, %rax` @0x36e654). In TypeScript the caller does
   * not pass storage, so the port returns a fresh object holding the same two
   * lanes; that is the same value contract, with the ABI's out-param mechanics
   * left to the ABI.
   *
   * Zero in-scope callees, zero externs, no branches — one 8-byte load, one
   * 8-byte store.
   *
   * @0xADDR Ozone 0x36e650
   */
  getFullscreenViewOffset(): PCVector2Int {
    // @0x36e650..0x36e651 — prologue (no TS-visible effect).
    // @0x36e654           — movq %rdi, %rax: the sret slot is also the return
    //                       value; in TS that slot is the object we build below.
    // @0x36e657           — movq 0x104(%rsi), %rcx: ONE 8-byte read of both
    //                       int32 lanes at +0x104 and +0x108.
    // @0x36e65e           — movq %rcx, (%rdi): store both lanes into the slot.
    // @0x36e661..0x36e662 — epilogue + retq.
    return {
      x: this.fullscreenViewOffsetX_at_0x104,
      y: this.fullscreenViewOffsetY_at_0x108,
    };
  }

  /**
   * `OZViewerState::setRenderFullView(bool)` — @Ozone 0x36e550
   * (__ZN13OZViewerState17setRenderFullViewEb).
   *
   * Full transcription — every instruction, in order
   * (raw-port/re/disasm/__ZN13OZViewerState17setRenderFullViewEb.s):
   *
   *   0x36e550  pushq %rbp                 ; frame setup (no TS counterpart)
   *   0x36e551  movq  %rsp, %rbp           ; frame setup (no TS counterpart)
   *   0x36e554  movb  %sil, 0x58(%rdi)     ; this->renderFullViewAt58 = arg
   *   0x36e558  popq  %rbp                 ; frame teardown (no TS counterpart)
   *   0x36e559  retq                       ; void return
   *   0x36e55a  nopw  (%rax,%rax)          ; alignment padding, not executed
   *
   * A plain unsynchronized single-BYTE store and nothing else: no lock, no
   * callees, no externs, no indirect/virtual dispatch, no validation of the
   * incoming value, no return value, and no notification of any observer.
   * `%sil` is the low byte of the second integer argument register — the
   * `bool` parameter under the SysV AMD64 ABI — and `movb` writes exactly that
   * one byte, leaving +0x59 and everything else untouched.
   *
   * The port stores 0/1 for a JS boolean, or the caller's raw low byte if a
   * number is passed, mirroring what the register actually holds.
   *
   * @param renderFullView the new flag (`%sil`).
   */
  setRenderFullView(renderFullView: boolean | number): void {
    // @0x36e554  movb %sil, 0x58(%rdi) — one byte, verbatim.
    this.renderFullViewAt58 =
      typeof renderFullView === "boolean"
        ? renderFullView
          ? 1
          : 0
        : renderFullView & 0xff;
  }

  /**
   * `OZViewerState::setCompensateAspectRatio(bool)` — @Ozone 0x36e400
   * (__ZN13OZViewerState24setCompensateAspectRatioEb).
   *
   * Full transcription — every instruction, in order
   * (raw-port/re/disasm/__ZN13OZViewerState24setCompensateAspectRatioEb.s):
   *
   *   0x36e400  pushq %rbp                 ; frame setup (no TS counterpart)
   *   0x36e401  movq  %rsp, %rbp           ; frame setup (no TS counterpart)
   *   0x36e404  movb  %sil, 0x3d(%rdi)     ; this->settingsByteAt3d = arg
   *   0x36e408  popq  %rbp                 ; frame teardown (no TS counterpart)
   *   0x36e409  retq                       ; void return
   *   0x36e40a  nopw  (%rax,%rax)          ; alignment padding, not executed
   *
   * The same shape as the sibling `setRenderFullView(bool)` @0x36e554 — one
   * unsynchronized `movb` of `%sil` (the SysV `bool` argument byte) and
   * nothing else: no lock, no callees, no externs, no indirect/virtual
   * dispatch, no validation, no return value.
   *
   * It writes an EXISTING modelled slot rather than a new one: +0x3d is the
   * byte `cloneSettings` @0x36dfd3 copies (`movzbl 0x3d(%rsi),%eax ; movb
   * %al,0x3d(%rdi)`), so this setter is what NAMES that clone-set byte as the
   * compensate-aspect-ratio flag. Adjacent +0x3c is a different slot and stays
   * untouched, exactly as the single-byte store implies.
   *
   * @param compensateAspectRatio the new flag (`%sil`).
   */
  setCompensateAspectRatio(compensateAspectRatio: boolean | number): void {
    // @0x36e404  movb %sil, 0x3d(%rdi) — one byte, verbatim.
    this.settingsByteAt3d =
      typeof compensateAspectRatio === "boolean"
        ? compensateAspectRatio
          ? 1
          : 0
        : compensateAspectRatio & 0xff;
  }
}
