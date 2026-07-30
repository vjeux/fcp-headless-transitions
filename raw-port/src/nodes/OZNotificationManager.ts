// OZNotificationManager.ts — Ozone notification-manager per-observer flag toggles.
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//         Versions/A/Ozone (macOS FCP, x86_64 slice)
//
// The two methods here (`ignoreObserverOnce` / `unignoreObserverOnce`) are
// symmetric linked-list operations: given an observer key (a raw `void*`)
// and a bitmask (unsigned int), walk a circular doubly-linked list of
// observer records rooted in the manager, find the record whose observer
// pointer matches, and OR/AND-NOT the mask into a per-observer flags word.
//
// Both methods are pure pointer walks: NO in-scope callees, NO externs.
// Their entire body is decodable from the disassembly (see below).
//
// -----------------------------------------------------------------------------
// SHAPE — recovered from the disasm of both methods
// -----------------------------------------------------------------------------
// The manager (this = %rdi) is used ONLY as the sentinel node of a
// circular doubly-linked list of observer records:
//
//   OZNotificationManager (this):
//     +0x08   next-observer-record pointer         (%rax = 0x8(%rdi) on entry;
//                                                   also used as the LIST
//                                                   TERMINATOR: `cmpq %rdi,%rax
//                                                   ; je exit` — list ends when
//                                                   the walker returns to the
//                                                   manager itself, classic
//                                                   circular-list sentinel).
//
//   ObserverRecord (list node, at each %rax step):
//     +0x08   next-record pointer                  (advance step:
//                                                   `movq 0x8(%rax), %rax`)
//     +0x10   observer key (void*)                 (match test:
//                                                   `cmpq %rsi, 0x10(%rax)`)
//     +0x28   flags word (unsigned int)            (target of the OR / AND-NOT
//                                                   at `0x28(%rax)`)
//
// The layout is derived STRICTLY from the two disassemblies quoted below.
// Additional record fields (prev pointer at +0x00, other bookkeeping) are
// not touched by these two methods so they are not documented here.
//
// -----------------------------------------------------------------------------
// FULL DISASM — ignoreObserverOnce
//   (raw-port/re/disasm/__ZN21OZNotificationManager18ignoreObserverOnceEPvj.s)
// -----------------------------------------------------------------------------
//   __ZN21OZNotificationManager18ignoreObserverOnceEPvj:
//     0x4bef0  pushq  %rbp
//     0x4bef1  movq   %rsp, %rbp
//     0x4bef4  movq   %rdi, %rax                   ; rax = this (list head/sentinel)
//     0x4bef7  nopw   (%rax,%rax)                  ; alignment nop
//     0x4bf00  movq   0x8(%rax), %rax              ; rax = rax->next  (record+0x8)
//     0x4bf04  cmpq   %rdi, %rax                   ; end-of-list?  cmp: rax-rdi
//     0x4bf07  je     0x4bf12                      ;   je => rax == rdi => exit
//     0x4bf09  cmpq   %rsi, 0x10(%rax)             ; observer match? cmp: [rax+0x10]-rsi
//     0x4bf0d  jne    0x4bf00                      ;   jne => not equal => keep walking
//     0x4bf0f  orl    %edx, 0x28(%rax)             ; [rax+0x28] |= edx  (mask bits set)
//     0x4bf12  popq   %rbp
//     0x4bf13  retq
//
// FULL DISASM — unignoreObserverOnce
//   (raw-port/re/disasm/__ZN21OZNotificationManager20unignoreObserverOnceEPvj.s)
// -----------------------------------------------------------------------------
//   __ZN21OZNotificationManager20unignoreObserverOnceEPvj:
//     0x4bf20  pushq  %rbp
//     0x4bf21  movq   %rsp, %rbp
//     0x4bf24  movq   %rdi, %rax                   ; rax = this (list head/sentinel)
//     0x4bf27  nopw   (%rax,%rax)                  ; alignment nop
//     0x4bf30  movq   0x8(%rax), %rax              ; rax = rax->next  (record+0x8)
//     0x4bf34  cmpq   %rdi, %rax                   ; end-of-list?  cmp: rax-rdi
//     0x4bf37  je     0x4bf44                      ;   je => rax == rdi => exit
//     0x4bf39  cmpq   %rsi, 0x10(%rax)             ; observer match? cmp: [rax+0x10]-rsi
//     0x4bf3d  jne    0x4bf30                      ;   jne => not equal => keep walking
//     0x4bf3f  notl   %edx                         ; edx = ~edx   (invert mask, 32-bit)
//     0x4bf41  andl   %edx, 0x28(%rax)             ; [rax+0x28] &= ~mask  (mask bits clr)
//     0x4bf44  popq   %rbp
//     0x4bf45  retq
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
// NONE. Both methods are pure pointer arithmetic + a bitwise op. No callq /
// jmp to any symbol. No indirect calls. No externs. No in-scope FCP callees.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN21OZNotificationManager18ignoreObserverOnceEPvj
//         OZNotificationManager::ignoreObserverOnce(void*, unsigned int)   @0x4bef0
//   * __ZN21OZNotificationManager20unignoreObserverOnceEPvj
//         OZNotificationManager::unignoreObserverOnce(void*, unsigned int) @0x4bf20
//

/**
 * A per-observer bookkeeping record hanging off the OZNotificationManager's
 * circular list.  Layout recovered from `ignoreObserverOnce` /
 * `unignoreObserverOnce` disasm alone — only the fields these two methods
 * touch are named here; other fields (prev pointer at +0x00, etc.) are
 * intentionally not modelled since the disasm does not exercise them.
 */
export interface OZObserverRecord {
  /** (record+0x08) — next record in the circular doubly-linked list.
   *  When the walker's `rax = rax->next` returns the manager sentinel
   *  itself, the list has been fully traversed. */
  next_at_0x8: OZObserverRecord | OZNotificationManager;
  /** (record+0x10) — the raw `void*` observer key the caller passes in
   *  %rsi.  Match test at disasm 0x4bf09/0x4bf39:
   *  `cmpq %rsi, 0x10(%rax)`. */
  observer_at_0x10: object | null;
  /** (record+0x28) — flags word (unsigned int).  Target of the OR at
   *  `ignoreObserverOnce` 0x4bf0f (`orl %edx, 0x28(%rax)`) and the
   *  AND-NOT at `unignoreObserverOnce` 0x4bf41
   *  (`andl (~edx), 0x28(%rax)`). */
  flags_at_0x28: number;
}

/**
 * `OZNotificationManager` — the sentinel head of a circular doubly-linked
 * list of `OZObserverRecord`s.  Recovered from the disasm of the two
 * ported methods: `this` itself is the list terminator (`cmpq %rdi, %rax`
 * at 0x4bf04 / 0x4bf34 exits the walk when the next-pointer cycles back
 * to the manager).
 *
 * Only `next_at_0x8` is exercised by these two methods; other fields of
 * the manager (its `prev` link at +0x00, message-broadcast state, etc.)
 * are not touched, so they are not modelled here — future porters will
 * add fields as new methods land.
 */
export class OZNotificationManager {
  /** (this+0x08) — head of the observer-record chain.  On entry each
   *  method does `movq %rdi, %rax` then `movq 0x8(%rax), %rax`, i.e.
   *  `first = this->next_at_0x8`.  The list is circular: when `next`
   *  points back to `this`, the walk ends. */
  next_at_0x8: OZObserverRecord | OZNotificationManager = this;

  // ═════════════════════════════════════════════════════════════════════════
  // OZNotificationManager::ignoreObserverOnce(void* observer, unsigned int mask)
  //
  // Disassembly source:
  //   raw-port/re/disasm/__ZN21OZNotificationManager18ignoreObserverOnceEPvj.s
  //
  // FULL DISASM (repeated inline for reviewer convenience):
  //   0x4bef0  pushq  %rbp
  //   0x4bef1  movq   %rsp, %rbp
  //   0x4bef4  movq   %rdi, %rax                   ; rax = this
  //   0x4bef7  nopw   (%rax,%rax)                  ; alignment nop
  //   0x4bf00  movq   0x8(%rax), %rax              ; rax = rax->next
  //   0x4bf04  cmpq   %rdi, %rax                   ; sub: rax - rdi
  //   0x4bf07  je     0x4bf12                      ;   ZF=1 => rax == rdi => exit
  //   0x4bf09  cmpq   %rsi, 0x10(%rax)             ; sub: [rax+0x10] - rsi
  //   0x4bf0d  jne    0x4bf00                      ;   ZF=0 => mismatch => loop
  //   0x4bf0f  orl    %edx, 0x28(%rax)             ; [rax+0x28] |= edx
  //   0x4bf12  popq   %rbp
  //   0x4bf13  retq
  //
  // AT&T `cmpq %rdi, %rax` computes `rax - rdi` (dst - src); je iff rax==rdi.
  // AT&T `cmpq %rsi, 0x10(%rax)` computes `[rax+0x10] - rsi`; jne iff !=.
  //
  // FRONTIER CALLEES: none.
  // ═════════════════════════════════════════════════════════════════════════
  /**
   * `OZNotificationManager::ignoreObserverOnce(void*, unsigned int)` —
   * @Ozone 0x4bef0 (__ZN21OZNotificationManager18ignoreObserverOnceEPvj).
   *
   * Walk the circular observer list; when the record with matching
   * observer key is found, OR the given mask into its per-observer flags
   * word.  If no record matches, exit silently (this is why the method
   * is called "*Once*": at most one flag flip per call, and none if the
   * observer is not currently registered).
   */
  ignoreObserverOnce(observer: object | null, mask: number): void {
    // @0x4bef4 movq %rdi, %rax : rax = this (list sentinel).
    let rax: OZObserverRecord | OZNotificationManager = this;
    // Mask is treated 32-bit: the disasm uses `orl %edx, 0x28(%rax)`
    // (32-bit form), so ensure only the low 32 bits participate.
    const edx = mask >>> 0;

    // Circular list walk: `for (rax = rax->next; rax != this; rax = rax->next)`.
    // @0x4bf00..0x4bf07  loop head (advance + terminator check).
    // @0x4bf09..0x4bf0d  match test on observer pointer at record+0x10.
    // @0x4bf0f            OR the mask into flags at record+0x28.
    // Note: the disasm does NOT `break` after the OR — it falls through
    // to the `popq/ret` at 0x4bf12. So the method flips AT MOST the
    // FIRST record with the matching observer, then returns. We mirror
    // that exactly.
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // @0x4bf00 movq 0x8(%rax), %rax : rax = rax->next.
      rax = (rax as { next_at_0x8: OZObserverRecord | OZNotificationManager }).next_at_0x8;
      // @0x4bf04 cmpq %rdi, %rax ; @0x4bf07 je exit  : end-of-list ==
      // walker returned to the sentinel manager itself.
      if (rax === this) {
        // @0x4bf12 popq %rbp ; @0x4bf13 retq
        return;
      }
      // rax is now a record (not the sentinel).
      const rec = rax as OZObserverRecord;
      // @0x4bf09 cmpq %rsi, 0x10(%rax) ; @0x4bf0d jne loop  :
      // keep walking on mismatch.
      if (rec.observer_at_0x10 !== observer) continue;
      // @0x4bf0f orl %edx, 0x28(%rax) : record.flags |= mask (32-bit).
      rec.flags_at_0x28 = (rec.flags_at_0x28 | edx) >>> 0;
      // @0x4bf12 popq %rbp ; @0x4bf13 retq  (fall-through, NO further
      // iteration — first match wins, rest of chain is untouched).
      return;
    }
  }

  // ═════════════════════════════════════════════════════════════════════════
  // OZNotificationManager::unignoreObserverOnce(void* observer, unsigned int mask)
  //
  // Disassembly source:
  //   raw-port/re/disasm/__ZN21OZNotificationManager20unignoreObserverOnceEPvj.s
  //
  // FULL DISASM (repeated inline for reviewer convenience):
  //   0x4bf20  pushq  %rbp
  //   0x4bf21  movq   %rsp, %rbp
  //   0x4bf24  movq   %rdi, %rax                   ; rax = this
  //   0x4bf27  nopw   (%rax,%rax)                  ; alignment nop
  //   0x4bf30  movq   0x8(%rax), %rax              ; rax = rax->next
  //   0x4bf34  cmpq   %rdi, %rax                   ; sub: rax - rdi
  //   0x4bf37  je     0x4bf44                      ;   ZF=1 => rax == rdi => exit
  //   0x4bf39  cmpq   %rsi, 0x10(%rax)             ; sub: [rax+0x10] - rsi
  //   0x4bf3d  jne    0x4bf30                      ;   ZF=0 => mismatch => loop
  //   0x4bf3f  notl   %edx                         ; edx = ~edx  (32-bit not)
  //   0x4bf41  andl   %edx, 0x28(%rax)             ; [rax+0x28] &= ~mask
  //   0x4bf44  popq   %rbp
  //   0x4bf45  retq
  //
  // Exact mirror of `ignoreObserverOnce` except the flag mutation:
  //   ignoreObserverOnce   : flags |= mask
  //   unignoreObserverOnce : flags &= ~mask   (via `notl %edx ; andl %edx, mem`)
  //
  // FRONTIER CALLEES: none.
  // ═════════════════════════════════════════════════════════════════════════
  /**
   * `OZNotificationManager::unignoreObserverOnce(void*, unsigned int)` —
   * @Ozone 0x4bf20 (__ZN21OZNotificationManager20unignoreObserverOnceEPvj).
   *
   * Symmetric to `ignoreObserverOnce`: walk the circular observer list,
   * and on the first record whose observer pointer matches, clear the
   * bits named by `mask` in that record's flags word (`flags &= ~mask`).
   * No match ⇒ silent exit.
   */
  unignoreObserverOnce(observer: object | null, mask: number): void {
    // @0x4bf24 movq %rdi, %rax : rax = this.
    let rax: OZObserverRecord | OZNotificationManager = this;
    // @0x4bf3f notl %edx : invert the mask (32-bit) BEFORE the AND.
    // We fuse the not+and here to mirror the machine exactly at the bit
    // level: (~mask & 0xffffffff), then AND into flags.
    const not_edx = (~mask) >>> 0;

    // Circular list walk: identical to `ignoreObserverOnce` above, only
    // the mutation on match differs.
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // @0x4bf30 movq 0x8(%rax), %rax : rax = rax->next.
      rax = (rax as { next_at_0x8: OZObserverRecord | OZNotificationManager }).next_at_0x8;
      // @0x4bf34 cmpq %rdi, %rax ; @0x4bf37 je exit.
      if (rax === this) {
        // @0x4bf44 popq %rbp ; @0x4bf45 retq
        return;
      }
      const rec = rax as OZObserverRecord;
      // @0x4bf39 cmpq %rsi, 0x10(%rax) ; @0x4bf3d jne loop.
      if (rec.observer_at_0x10 !== observer) continue;
      // @0x4bf3f..0x4bf41 : flags &= ~mask  (32-bit).
      rec.flags_at_0x28 = (rec.flags_at_0x28 & not_edx) >>> 0;
      // @0x4bf44 popq %rbp ; @0x4bf45 retq  (fall-through, first match wins).
      return;
    }
  }
}
