// OZTrackerMotionSpecific.ts — Ozone's motion-tracker host adapter (partial port).
//
// FRAMEWORK: Ozone.framework (Final Cut Pro).
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// SYMBOL PORTED IN THIS UNIT
//   @Ozone 0x0000000000340610
//     OZTrackerMotionSpecific::OZTrackerMotionSpecific()      [C2 base ctor]
//     mangled: __ZN23OZTrackerMotionSpecificC2Ev
//
// SOURCE DISASSEMBLY:
//   raw-port/re/disasm/__ZN23OZTrackerMotionSpecificC2Ev.s (10 lines)
//
// Every other member of this class (C1, the two copy ctors, D0/D1/D2, and the
// ~40 OZTracker host callbacks — cleanup, getImage, getImageBounds, notify,
// init, finalize, setToTime, moveObject, ...) is its own ledger unit and is
// deliberately NOT written here.
//
// ═══════════════════════════════════════════════════════════════════════════
// DECODE — OZTrackerMotionSpecific::OZTrackerMotionSpecific() @0x340610 (AT&T)
// ═══════════════════════════════════════════════════════════════════════════
//
//   0x340610  pushq  %rbp
//   0x340611  movq   %rsp, %rbp
//   0x340614  leaq   0x510615(%rip), %rax   ; rax = 0x34061b + 0x510615
//                                           ;     = 0x850c30
//   0x34061b  movq   %rax, (%rdi)           ; this->vptr = 0x850c30
//   0x34061e  xorps  %xmm0, %xmm0
//   0x340621  movups %xmm0, 0x8(%rdi)       ; zero +0x08..+0x17
//   0x340625  movw   $0x0, 0x18(%rdi)       ; zero +0x18..+0x19
//   0x34062b  popq   %rbp
//   0x34062c  retq
//   0x34062d  nopl   (%rax)                 ; padding, not code
//
// No callq, no base-class constructor call, no indirect branch — this class
// has no constructed base subobject; the ctor just installs the vptr and
// zero-fills the 0x12 bytes of state that follow it.
//
// ── THE VPTR (derived from the instruction bytes, not guessed) ──────────────
//   `leaq 0x510615(%rip), %rax` @0x340614 encodes 48 8d 05 15 06 51 00, so
//   disp32 = 0x00510615 and the target is 0x34061b + 0x510615 = 0x850c30.
//   `nm` places `__ZTV23OZTrackerMotionSpecific` at 0x850c20, so the stored
//   value is `vtable + 0x10` — the standard Itanium-ABI installed-pointer
//   offset past the offset-to-top and RTTI words (`__ZTI23OZTrackerMotion
//   Specific` is at 0x850d88). Reading the slots at 0x850c30 confirms it:
//     *0x00 -> 0x3406e0  ~OZTrackerMotionSpecific()          [D1]
//     *0x08 -> 0x340730  ~OZTrackerMotionSpecific()          [D0]
//     *0x10 -> 0x340790  cleanup(OZTracker*, OZChannelBase&)
//     *0x18 -> 0x343070  clone()
//     *0x20 -> 0x341bb0  notify(OZChannelBase&, bool)
//     *0x28 -> 0x3417d0  getImageBounds(CMTime const&, OZChannelBase&)
//   — every one a real method of this class, so the value is the class's own
//   vtable and not some neighbour's.
//
// ── STRUCT LAYOUT (recovered from this ctor + the members that touch it) ────
//
//   +0x00  void*  vptr                        ; installed here @0x34061b
//   +0x08  u64    field_08                    ; zeroed here (low half of the
//                                             ;   `movups %xmm0, 0x8(%rdi)`)
//   +0x10  T*     refCountedPtr               ; zeroed here (high half of the
//                                             ;   same movups)
//   +0x18  u8     supportInterlacedTracking   ; zeroed here (low byte of the
//                                             ;   `movw $0x0, 0x18(%rdi)`)
//   +0x19  u8     compensateForAspectRatio    ; zeroed here (high byte)
//   sizeof == 0x1a
//
//   The two flag bytes are NAMED, not invented — each has a one-line setter
//   that writes exactly that byte:
//     @0x3430c4  setSupportInterlacedTracking(bool): movb %sil, 0x18(%rdi)
//     @0x3430d4  setCompensateForAspectRatio(bool) : movb %sil, 0x19(%rdi)
//
//   +0x10 is identified as an owning pointer to a REFERENCE-COUNTED object by
//   the destructor `~OZTrackerMotionSpecific()` [D2] @0x340690, which does the
//   canonical atomic release on it:
//     0x3406a0  movq  0x10(%rdi), %rbx          ; rbx = this->refCountedPtr
//     0x3406a4  testq %rbx, %rbx ; je           ; skip when null
//     0x3406a9  movq  $-0x1, %rax
//     0x3406b0  lock xaddq %rax, 0x8(%rbx)      ; atomic fetch_add(-1) on the
//                                               ;   pointee's +0x08 refcount
//     0x3406b6  testq %rax, %rax ; je           ; old count 0 -> last ref
//   The pointee's type is not determinable from this ctor, so it stays
//   generic (PORTING_SPEC Rule 5 — offsets documented, semantics not invented);
//   likewise +0x08, which nothing in this unit's evidence reads.
//
//   NOTE (evidence only, not ported): the COPY constructor
//   `OZTrackerMotionSpecific(OZTrackerMotionSpecific const&)` [C2] @0x340650
//   has a byte-identical body — same vptr store, same `movups %xmm0, 0x8`,
//   same `movw $0x0, 0x18` — i.e. it IGNORES its source operand and
//   default-initialises. That corroborates this exact field set as the whole
//   of the object's state.
//
// ── Callees ─────────────────────────────────────────────────────────────────
//   ZERO callees of any kind. `depgraph.py deps __ZN23OZTrackerMotionSpecificC2Ev`
//   prints nothing; there is no `callq` and no indirect branch in the body.
//
// ── END DECODE ──────────────────────────────────────────────────────────────

/**
 * The installed vtable pointer for `OZTrackerMotionSpecific`:
 * `__ZTV23OZTrackerMotionSpecific` (@Ozone 0x850c20) + 0x10, i.e. 0x850c30 —
 * the value the constructor stores at +0x00.
 *
 * @Ozone 0x0000000000850c30
 */
export const OZ_TRACKER_MOTION_SPECIFIC_VPTR = 0x850c30;

/**
 * `OZTrackerMotionSpecific` — Ozone's `OZTracker` host adapter for
 * motion-specific tracking. Only the state this constructor establishes is
 * modelled; the ~40 host callbacks are separate ledger units and must be
 * ADDED to this class as they land.
 *
 * @Ozone 0x0000000000340610
 */
export class OZTrackerMotionSpecific {
  /**
   * +0x00 — the vtable pointer, installed by the constructor
   * @0x34061b (`movq %rax, (%rdi)` with %rax = 0x850c30).
   */
  vptr: number = 0;

  /**
   * +0x08 (u64) — zeroed by the constructor as the LOW half of
   * `movups %xmm0, 0x8(%rdi)` @0x340621. Nothing this unit decodes reads it,
   * so it stays an opaque 64-bit slot rather than a guessed field. Held as a
   * `bigint` because the store is 64-bit wide.
   */
  field_08: bigint = 0n;

  /**
   * +0x10 — an owning pointer to a reference-counted object, zeroed by the
   * constructor as the HIGH half of the same `movups` @0x340621. Identified by
   * the destructor's atomic release on it (`lock xaddq $-1, 0x8(%rbx)`
   * @0x3406b1 after `movq 0x10(%rdi), %rbx` @0x3406a0). The pointee's type is
   * not determinable from this unit, so it is left opaque.
   */
  refCountedPtr_at_0x10: object | null = null;

  /**
   * +0x18 (u8) — zeroed by the constructor as the LOW byte of
   * `movw $0x0, 0x18(%rdi)` @0x340625. Written by
   * `setSupportInterlacedTracking(bool)` @0x3430c4 (`movb %sil, 0x18(%rdi)`),
   * which is what names it.
   */
  supportInterlacedTracking_at_0x18: number = 0;

  /**
   * +0x19 (u8) — zeroed by the constructor as the HIGH byte of the same
   * `movw` @0x340625. Written by `setCompensateForAspectRatio(bool)`
   * @0x3430d4 (`movb %sil, 0x19(%rdi)`), which is what names it.
   */
  compensateForAspectRatio_at_0x19: number = 0;

  /**
   * `OZTrackerMotionSpecific::OZTrackerMotionSpecific()` [C2 base-object
   * constructor] — @Ozone 0x340610 (__ZN23OZTrackerMotionSpecificC2Ev).
   *
   * Faithful transcription of the 8-instruction body decoded in the header:
   * install the vptr, then zero every byte of state from +0x08 through +0x19.
   * There is no base-class constructor call and no callee of any kind.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZN23OZTrackerMotionSpecificC2Ev.s
   */
  constructor() {
    // @0x340614-0x34061b: leaq 0x510615(%rip), %rax ; movq %rax, (%rdi)
    //   -> this->vptr = vtable(0x850c20) + 0x10 = 0x850c30.
    this.vptr = OZ_TRACKER_MOTION_SPECIFIC_VPTR;
    // @0x34061e-0x340621: xorps %xmm0,%xmm0 ; movups %xmm0, 0x8(%rdi)
    //   -> zero the 16 bytes spanning +0x08 (u64) and +0x10 (pointer).
    this.field_08 = 0n;
    this.refCountedPtr_at_0x10 = null;
    // @0x340625: movw $0x0, 0x18(%rdi)
    //   -> zero both flag bytes at +0x18 and +0x19 in one 16-bit store.
    this.supportInterlacedTracking_at_0x18 = 0;
    this.compensateForAspectRatio_at_0x19 = 0;
    // @0x34062b-0x34062c: popq %rbp ; retq.
  }
}
