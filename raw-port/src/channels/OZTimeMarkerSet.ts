// OZTimeMarkerSet.ts — raw transcription of Ozone `OZTimeMarkerSet`.
//
// The marker-set container Ozone's timeline queries (findTopMarker,
// findFirstMarker, findNextMarker, findPreviousMarker) run over. ONE symbol is
// transcribed here — the default COMPLETE-object constructor. Every other
// member (the copy ctors @0x2117e0/@0x211720, the dtors @0x212e80/@0x212ea0,
// the four find* queries @0x2118a0/@0x211be0/@0x211f80/@0x212220/@0x212540/
// @0x212700, the serializer family @0x212c10..@0x212d90) is a SEPARATE ledger
// unit and is NOT transcribed here.
//
// Provenance (Ozone framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Symbol ported in this file:
//   @0x211700  OZTimeMarkerSet::OZTimeMarkerSet()  [C1, complete-object ctor]
//                __ZN15OZTimeMarkerSetC1Ev
//
// Source disassembly:
//   raw-port/re/disasm/__ZN15OZTimeMarkerSetC1Ev.s (11 lines)
//
// C1 vs C2: the base-object ctor `__ZN15OZTimeMarkerSetC2Ev` @0x2116e0 is a
// SEPARATELY EMITTED body with the IDENTICAL instruction sequence (same three
// stores, same order; only the RIP displacement differs — 0x635c5e @0x2116f3
// vs 0x635c3e @0x211713 — because the two bodies sit 0x20 bytes apart and both
// resolve to the SAME vtable address 0x847358). It is its own ledger unit and
// is not ported here; this file is the C1 body only.
//
// STRUCT LAYOUT (recovered from this ctor alone — nothing else is invented):
//   +0x00  void*   vptr        = 0x847358   (@0x211713/@0x21171a)
//   +0x08  void*   self-pointer to +0x10    (@0x211704/@0x21170f)
//   +0x10  16 bytes zeroed                  (@0x211708/@0x21170b)
//   (size >= 0x20; nothing at or past +0x20 is touched by this body)

/**
 * The 16 bytes at +0x10..+0x1f, modelled as the two 64-bit words the single
 * `movups %xmm0, 0x10(%rdi)` @0x21170b zeroes.
 *
 * This is the object the +0x08 slot points AT: `leaq 0x10(%rdi), %rax`
 * @0x211704 takes its ADDRESS and `movq %rax, 0x8(%rdi)` @0x21170f stores it,
 * so the freshly built set holds a pointer INTO ITSELF — the classic empty
 * intrusive-list head, where "empty" is encoded as "the head points at the
 * embedded sentinel". What the two words mean once markers are inserted is NOT
 * decoded by this ctor (the insert path lives in another unit), so they are
 * recorded as raw quadwords rather than given invented names (Rule 5).
 *
 * Modelled as an OBJECT so the self-reference is expressible: a JS object value
 * IS a reference, so `headAt8 === sentinelAt10` reproduces exactly the aliasing
 * the machine creates — the same modelling the landed
 * `OZRenderParams::getWorkingColorDescription()` port uses for `leaq &member`.
 *
 * @Ozone 0x211708 (the address whose 16 bytes this covers)
 */
export interface OZTimeMarkerSetSentinel {
  /** +0x10 — first zeroed quadword. */
  qword10: bigint;
  /** +0x18 — second zeroed quadword. */
  qword18: bigint;
}

/**
 * The INSTALLED vtable pointer this ctor writes to +0x00.
 *
 * `leaq 0x635c3e(%rip), %rax` @0x211713 (next instruction @0x21171a) resolves
 * to 0x21171a + 0x635c3e = **0x847358**, and `nm -m -arch x86_64 Ozone` reports
 * `0000000000847348 (__DATA_CONST,__const) external __ZTV15OZTimeMarkerSet` —
 * i.e. the stored value is the vtable symbol + 0x10, the standard Itanium-ABI
 * "installed pointer" that skips the RTTI header pair. The C2 body @0x2116f3
 * independently resolves to the same 0x847358.
 */
export const OZ_TIME_MARKER_SET_VPTR = 0x847358; // @Ozone 0x211713 -> 0x847358

/**
 * `OZTimeMarkerSet` — Ozone's set of timeline markers.
 *
 * Only the three slots this ctor writes are modelled. The class's query and
 * serializer methods will ground further fields when they are transcribed.
 */
export class OZTimeMarkerSet {
  /**
   * +0x00 — the vptr slot. Written LAST by the ctor (@0x21171a), after the
   * data slots, which is the order the binary uses.
   */
  vptrAt0 = 0;

  /**
   * +0x10..+0x1f — the embedded sentinel the +0x08 head points at.
   * Zeroed by the `movups` @0x21170b.
   */
  sentinelAt10: OZTimeMarkerSetSentinel = { qword10: 0n, qword18: 0n };

  /**
   * +0x08 — the head pointer. Set to `this + 0x10`, i.e. to
   * {@link sentinelAt10}, so a default-constructed set points at its own
   * sentinel. NULL is never stored here by this ctor.
   */
  headAt8: OZTimeMarkerSetSentinel | null = null;

  /**
   * `OZTimeMarkerSet::OZTimeMarkerSet()` [C1] — @Ozone 0x211700
   * (__ZN15OZTimeMarkerSetC1Ev).
   *
   * Full transcription — every instruction, in order:
   *
   *   0x211700  pushq %rbp                   ; frame setup (no TS counterpart)
   *   0x211701  movq  %rsp, %rbp             ; frame setup (no TS counterpart)
   *   0x211704  leaq  0x10(%rdi), %rax       ; rax = &this->sentinelAt10 (address only)
   *   0x211708  xorps %xmm0, %xmm0           ; xmm0 = 128 zero bits
   *   0x21170b  movups %xmm0, 0x10(%rdi)     ; this->sentinelAt10 = {0, 0}   (16 bytes)
   *   0x21170f  movq  %rax, 0x8(%rdi)        ; this->headAt8 = &this->sentinelAt10
   *   0x211713  leaq  0x635c3e(%rip), %rax   ; rax = 0x847358 (vtable + 0x10)
   *   0x21171a  movq  %rax, (%rdi)           ; this->vptrAt0 = 0x847358
   *   0x21171d  popq  %rbp                   ; frame teardown (no TS counterpart)
   *   0x21171e  retq
   *   0x21171f  nop                          ; alignment padding, not executed
   *
   * ORDER IS PRESERVED: the sentinel is zeroed FIRST, the self-pointer is
   * installed SECOND, and the vptr is written LAST. `leaq` @0x211704 computes
   * an EFFECTIVE ADDRESS — it loads nothing — so the value that lands in +0x08
   * is the address of the object's own +0x10, not a copy of its contents; the
   * TS assignment of the sentinel OBJECT reproduces that aliasing exactly
   * (mutating through `headAt8` is visible via `sentinelAt10`, as in the
   * binary).
   *
   * ZERO callees of any kind: no in-scope call, no extern (not even an
   * allocator — the storage is the caller's), no indirect and no virtual
   * dispatch (`depgraph.py deps` lists nothing). No base-class ctor is invoked
   * either, which is why C1 and C2 have identical bodies.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZN15OZTimeMarkerSetC1Ev.s (11 lines)
   */
  constructor() {
    // @0x211708/@0x21170b  xorps %xmm0,%xmm0 ; movups %xmm0,0x10(%rdi)
    this.sentinelAt10 = { qword10: 0n, qword18: 0n };
    // @0x211704/@0x21170f  leaq 0x10(%rdi),%rax ; movq %rax,0x8(%rdi)
    //   — the address of the just-zeroed sentinel, stored into the head slot.
    this.headAt8 = this.sentinelAt10;
    // @0x211713/@0x21171a  leaq 0x635c3e(%rip),%rax ; movq %rax,(%rdi)
    this.vptrAt0 = OZ_TIME_MARKER_SET_VPTR;
  }
}
