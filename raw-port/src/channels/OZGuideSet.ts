// OZGuideSet.ts — raw transcription of Ozone `OZGuideSet`.
//
// The canvas-guide collection Ozone serialises with a scene (the sibling of
// OZTimeMarkerSet in the same document surface). ONE symbol is transcribed
// here — the default COMPLETE-object constructor. Every other member (the copy
// ctors @0x375230/@0x3751d0, the dtors, the serializer family
// @0x375290..@0x3753b0, and the query/insert methods) is a SEPARATE ledger unit
// and is NOT transcribed here.
//
// Provenance (Ozone framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Symbol ported in this file:
//   @0x3751b0  OZGuideSet::OZGuideSet()  [C1, complete-object ctor]
//                __ZN10OZGuideSetC1Ev
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym __ZN10OZGuideSetC1Ev Ozone`):
//   raw-port/re/disasm/__ZN10OZGuideSetC1Ev.s (11 lines)
//
// C1 vs C2: the base-object ctor `__ZN10OZGuideSetC2Ev` @0x375190 is a
// SEPARATELY EMITTED body 0x20 bytes earlier with the same three stores; it is
// its own ledger unit and is NOT ported here. This file is the C1 body only.
//
// STRUCT LAYOUT (recovered from this ctor alone — nothing else is invented):
//   +0x00  void*  vptr        = 0x854820   (@0x3751c3/@0x3751ca)
//   +0x08  void*  self-pointer to +0x10    (@0x3751b4/@0x3751bf)
//   +0x10  16 bytes zeroed                 (@0x3751b8/@0x3751bb)
//   (size >= 0x20; nothing at or past +0x20 is touched by this body)
//
// This is byte-for-byte the same shape as the landed `OZTimeMarkerSet`
// constructor port (@Ozone 0x211700, raw-port/src/channels/OZTimeMarkerSet.ts):
// an empty intrusive collection whose head points at its own embedded sentinel.
// The two classes are modelled the same way for that reason.

/**
 * The 16 bytes at +0x10..+0x1f, modelled as the two 64-bit words the single
 * `movups %xmm0, 0x10(%rdi)` @0x3751bb zeroes.
 *
 * This is the object the +0x08 slot points AT: `leaq 0x10(%rdi), %rax`
 * @0x3751b4 takes its ADDRESS and `movq %rax, 0x8(%rdi)` @0x3751bf stores it,
 * so a freshly built set holds a pointer INTO ITSELF — the empty-collection
 * encoding where "empty" means "the head points at the embedded sentinel".
 * What the two words mean once guides are inserted is NOT decoded by this ctor
 * (the insert path is another unit), so they are recorded as raw quadwords
 * rather than given invented names (Rule 5).
 *
 * @Ozone 0x3751b8 (the address whose 16 bytes this covers)
 */
export interface OZGuideSetSentinel {
  /** +0x10 — first zeroed quadword. */
  qword10: bigint;
  /** +0x18 — second zeroed quadword. */
  qword18: bigint;
}

/**
 * The INSTALLED vtable pointer this ctor writes to +0x00.
 *
 * `leaq 0x4df656(%rip), %rax` @0x3751c3 (next instruction @0x3751ca) resolves to
 * 0x3751ca + 0x4df656 = **0x854820**, and `nm -m -arch x86_64 Ozone` reports
 * `0000000000854810 (__DATA_CONST,__const) external __ZTV10OZGuideSet` — i.e.
 * the stored value is the vtable symbol + 0x10, the standard Itanium-ABI
 * "installed pointer" that skips the RTTI header pair.
 */
export const OZ_GUIDE_SET_VPTR = 0x854820; // @Ozone 0x3751c3 -> 0x854820

/**
 * `OZGuideSet` — Ozone's set of canvas guides.
 *
 * Only the three slots this ctor writes are modelled; the class's query and
 * serializer methods will ground further fields when they are transcribed.
 */
export class OZGuideSet {
  /**
   * +0x00 — the vptr slot. Written LAST by the ctor (@0x3751ca), after the data
   * slots, which is the order the binary uses.
   */
  vptrAt0 = 0;

  /**
   * +0x10..+0x1f — the embedded sentinel the +0x08 head points at. Zeroed by
   * the `movups` @0x3751bb.
   */
  sentinelAt10: OZGuideSetSentinel = { qword10: 0n, qword18: 0n };

  /**
   * +0x08 — the head pointer. Set to `this + 0x10`, i.e. to
   * {@link sentinelAt10}, so a default-constructed set points at its own
   * sentinel. NULL is never stored here by this ctor.
   */
  headAt8: OZGuideSetSentinel | null = null;

  /**
   * `OZGuideSet::OZGuideSet()` [C1] — @Ozone 0x3751b0
   * (__ZN10OZGuideSetC1Ev).
   *
   * Full transcription — every instruction, in order:
   *
   *   0x3751b0  pushq  %rbp                  ; frame setup (no TS counterpart)
   *   0x3751b1  movq   %rsp,%rbp             ; frame setup (no TS counterpart)
   *   0x3751b4  leaq   0x10(%rdi),%rax       ; rax = &this->sentinelAt10 (address only)
   *   0x3751b8  xorps  %xmm0,%xmm0           ; xmm0 = 128 zero bits
   *   0x3751bb  movups %xmm0,0x10(%rdi)      ; this->sentinelAt10 = {0, 0}  (16 bytes)
   *   0x3751bf  movq   %rax,0x8(%rdi)        ; this->headAt8 = &this->sentinelAt10
   *   0x3751c3  leaq   0x4df656(%rip),%rax   ; rax = 0x854820 (vtable + 0x10)
   *   0x3751ca  movq   %rax,(%rdi)           ; this->vptrAt0 = 0x854820
   *   0x3751cd  popq   %rbp                  ; frame teardown (no TS counterpart)
   *   0x3751ce  retq
   *   0x3751cf  nop                          ; alignment padding, not executed
   *
   * ORDER IS PRESERVED: the sentinel is zeroed FIRST, the self-pointer is
   * installed SECOND, and the vptr is written LAST. `leaq` @0x3751b4 computes an
   * EFFECTIVE ADDRESS — it loads nothing — so the value that lands in +0x08 is
   * the address of the object's own +0x10, not a copy of its contents; assigning
   * the sentinel OBJECT reproduces that aliasing exactly (mutating through
   * `headAt8` is visible via `sentinelAt10`, as in the binary).
   *
   * ZERO callees of any kind: no in-scope call, no extern (not even an
   * allocator — the storage is the caller's), no indirect and no virtual
   * dispatch (`depgraph.py deps` lists nothing). No base-class ctor is invoked
   * either, which is why C1 and C2 have the same three stores.
   */
  constructor() {
    // @0x3751b8/@0x3751bb  xorps %xmm0,%xmm0 ; movups %xmm0,0x10(%rdi)
    this.sentinelAt10 = { qword10: 0n, qword18: 0n };
    // @0x3751b4/@0x3751bf  leaq 0x10(%rdi),%rax ; movq %rax,0x8(%rdi)
    //   — the address of the just-zeroed sentinel, stored into the head slot.
    this.headAt8 = this.sentinelAt10;
    // @0x3751c3/@0x3751ca  leaq 0x4df656(%rip),%rax ; movq %rax,(%rdi)
    this.vptrAt0 = OZ_GUIDE_SET_VPTR;
  }
}
