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
//   * __ZN21OZNotificationManager15hasObjCObserverEPv
//         OZNotificationManager::hasObjCObserver(void*)                    @0x4be90
//   * __ZN21OZNotificationManager15addObjCObserverEPvl
//         OZNotificationManager::addObjCObserver(void*, long)              @0x4ba90
//   * __ZN21OZNotificationManager14addCPPObserverEP13OZCPPObserverl
//         OZNotificationManager::addCPPObserver(OZCPPObserver*, long)      @0x4bc30
//

// The `OZCPPObserver*` the C++-observer overload stores at record+0x10.  It is
// an opaque handle: `addCPPObserver` @0x4bc30 only ever MOVES the pointer
// (`movq %r15, 0x10(%rax)` @0x4bc6b) and never dereferences it, so the port
// imports the brand the OZReflexiveBehavior decode already declares for this
// exact class rather than inventing a second, incompatible one.
import type { OZCPPObserver } from "../channels/OZReflexiveBehavior.js";


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
  /** (record+0x00) — PREV pointer of the circular doubly-linked list.
   *  Recovered from `addObjCObserver` (@Ozone 0x4bae2 `movq (%r12), %rcx`
   *  reads the insertion node's prev; @0x4baea `movq %rcx, (%rax)` writes
   *  the new node's prev; @0x4bb1c `movq (%rbx), %rcx` reads the sentinel's
   *  prev = tail on the append path).  Points at the previous record, or
   *  at the manager sentinel when this record is the list head. */
  prev_at_0x0: OZObserverRecord | OZNotificationManager;
  /** (record+0x18) — the observer's `long` tag / priority key.  Set on
   *  insert (@0x4bacf / 0x4bb05 `movq %r14, 0x18(%rax)`) and used as the
   *  sort key in `addObjCObserver`'s walk (@0x4baba
   *  `cmpq 0x18(%r12), %r14 ; jle` keeps advancing while `tag <=
   *  node.tag`, so records are ordered by DESCENDING tag with the new
   *  node inserted before the first node with a strictly smaller tag). */
  tag_at_0x18: bigint;
  /** (record+0x20) — a `long` initialised to 1 on insert
   *  (@0x4bad3 / 0x4bb09 `movq $0x1, 0x20(%rax)`).  Likely a refcount /
   *  "once" bookkeeping word; only its initial value is exercised by
   *  `addObjCObserver`, so only that is modelled here. */
  field_at_0x20: bigint;
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

  /** (this+0x00) — PREV pointer of the circular list.  On the append path
   *  of `addObjCObserver` (@0x4bb1c `movq (%rbx), %rcx`) this is read as
   *  the list TAIL, and @0x4bb26 `movq %rax, (%rbx)` writes it.  Circular:
   *  starts pointing at the manager itself (empty list). */
  prev_at_0x0: OZObserverRecord | OZNotificationManager = this;

  /** (this+0x10) — observer count.  Bumped once per successful insert
   *  (@0x4bb29 `incq 0x10(%rbx)`). */
  count_at_0x10 = 0n;

  /** (this+0x70) — pointer to an owner object whose `+0xa0` slot holds an
   *  Objective-C object that is `_objc_retain`-ed on every insert
   *  (@0x4bb2d `movq 0x70(%rbx), %rax` ; @0x4bb31 `movq 0xa0(%rax), %rdi`
   *  ; @0x4bb45 `jmpq *_objc_retain`).  Only the load chain is modelled;
   *  the retained object itself is an out-of-scope ObjC extern. */
  owner_at_0x70: { objcObject_at_0xa0: object | null } | null = null;

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

  // ═════════════════════════════════════════════════════════════════════════
  // OZNotificationManager::hasObjCObserver(void* observer)
  //
  // Disassembly source:
  //   raw-port/re/disasm/__ZN21OZNotificationManager15hasObjCObserverEPv.s
  //
  // FULL DISASM (20 lines, @0x4be90..@0x4bebe):
  //
  //   0x4be90  movq   0x8(%rdi), %rax          ; rax = first = this->next_at_0x8
  //   0x4be94  movq   %rdi, %rcx               ; rcx = this  (default "found=self=not-found")
  //   0x4be97  cmpq   %rdi, %rax               ; sub: rax - rdi
  //   0x4be9a  je     0x4beb8                  ;   ZF=1 => empty list => exit
  //   0x4be9c  pushq  %rbp                     ; frame prologue (only if loop entered)
  //   0x4be9d  movq   %rsp, %rbp
  //   0x4bea0  cmpq   0x10(%rax), %rsi         ; sub: rsi - [rax+0x10]
  //   0x4bea4  je     0x4beb4                  ;   ZF=1 => observer matches
  //   0x4bea6  movq   0x8(%rax), %rax          ; rax = rax->next_at_0x8
  //   0x4beaa  cmpq   %rdi, %rax               ; sub: rax - rdi
  //   0x4bead  jne    0x4bea0                  ;   ZF=0 => continue walk
  //   0x4beaf  movq   %rdi, %rcx               ; end-of-list: rcx = this (not found)
  //   0x4beb2  jmp    0x4beb7                  ;   -> epilogue
  //   0x4beb4  movq   %rax, %rcx               ; found: rcx = current record
  //   0x4beb7  popq   %rbp                     ; frame epilogue (matches only the loop-entered path)
  //   0x4beb8  cmpq   %rdi, %rcx               ; sub: rcx - rdi
  //   0x4bebb  setne  %al                      ; al = (rcx != this) => "found?"
  //   0x4bebe  retq
  //
  // NOTES:
  //   AT&T: `cmpq %rsrc, %rdst` computes `dst - src`. So:
  //     - `cmpq %rdi, %rax` => `rax - rdi`; je iff rax == rdi (walker returned to sentinel).
  //     - `cmpq 0x10(%rax), %rsi` => `rsi - [rax+0x10]`; je iff rsi == [rax+0x10]
  //       (observer key matches record's observer_at_0x10 slot).
  //   The prologue+epilogue is asymmetric: `pushq %rbp` at 0x4be9c happens
  //   ONLY when the list is non-empty (loop is entered).  The empty-list
  //   fast-exit at 0x4be9a skips over the prologue AND the epilogue — the
  //   final `cmpq/setne/retq` at 0x4beb8..0x4bebe runs with the caller's
  //   frame intact.  In TS this is transparent (we have no explicit rbp),
  //   but we mirror the control flow for clarity.
  //
  //   The register `rcx` is the "found record" scratch — it starts as
  //   `this` (default = not found), gets overwritten with `rax` when the
  //   match is found @0x4beb4, or with `this` again @0x4beaf when the
  //   walker cycles back to `this` (end-of-list without match).  The
  //   final `setne %al` on `cmpq %rdi, %rcx` returns true iff rcx !=
  //   this, i.e. a matching record was found.
  //
  //   Interesting asymmetry vs ignoreObserverOnce / unignoreObserverOnce:
  //   here the loop-head checks the MATCH first (0x4bea0) THEN advances
  //   (0x4bea6) THEN checks end-of-list (0x4beaa); those two do it in
  //   the reverse order (advance @0x4bf00 / 0x4bf30, then end-check
  //   @0x4bf04 / 0x4bf34, then match @0x4bf09 / 0x4bf39).  Both patterns
  //   correctly implement "walk the circular list once, first match
  //   wins" — just different loop rotations chosen by the compiler.
  //   We transcribe THIS function's rotation exactly.
  //
  // FRONTIER CALLEES: none.  Pure pointer walk + boolean setne.
  //
  // Dependency status: 0 in-scope deps, 0 indirect, 0 out-of-scope
  // externs (confirmed by `depgraph.py why` — READY at wave 0).
  // ═════════════════════════════════════════════════════════════════════════
  /**
   * `OZNotificationManager::hasObjCObserver(void*)` —
   * @Ozone 0x4be90 (__ZN21OZNotificationManager15hasObjCObserverEPv).
   *
   * Walk the circular observer list; return true iff a record with
   * `observer_at_0x10 === observer` is found.  The empty-list fast-path
   * (list head's next pointer is the sentinel itself) returns false
   * without entering the loop.
   *
   * This is a pure read — no fields are mutated.  Same list topology
   * as the two sibling `*ObserverOnce` methods above; only the loop
   * rotation and the return value differ.
   */
  hasObjCObserver(observer: object | null): boolean {
    // @0x4be90 movq 0x8(%rdi), %rax : rax = this.next_at_0x8
    let rax: OZObserverRecord | OZNotificationManager = this.next_at_0x8;
    // @0x4be94 movq %rdi, %rcx : rcx = this  (default: "not found")
    let rcx: OZObserverRecord | OZNotificationManager = this;

    // @0x4be97 cmpq %rdi, %rax ; @0x4be9a je 0x4beb8
    //   Empty-list fast-exit: skip the loop entirely if the first
    //   next-pointer is the sentinel manager itself.  Falls straight
    //   through to the final `cmpq %rdi, %rcx ; setne %al` at 0x4beb8,
    //   which returns false since rcx == this.
    if (rax !== this) {
      // @0x4be9c pushq %rbp ; @0x4be9d movq %rsp, %rbp
      //   Frame setup (only when loop is entered — asymmetric prologue).
      //   TS has no explicit frame; noted for provenance.

      // Loop: check-match FIRST, then advance, then check end-of-list.
      // eslint-disable-next-line no-constant-condition
      while (true) {
        // @0x4bea0 cmpq 0x10(%rax), %rsi ; @0x4bea4 je 0x4beb4
        //   AT&T: cmp computes rsi - [rax+0x10]; je iff equal.
        const rec = rax as OZObserverRecord;
        if (rec.observer_at_0x10 === observer) {
          // @0x4beb4 movq %rax, %rcx  (found)
          rcx = rec;
          break;
        }

        // @0x4bea6 movq 0x8(%rax), %rax : rax = rax->next
        rax = rec.next_at_0x8;

        // @0x4beaa cmpq %rdi, %rax ; @0x4bead jne 0x4bea0
        //   If we cycled back to the sentinel, drop out.
        if (rax === this) {
          // @0x4beaf movq %rdi, %rcx (not found)
          rcx = this;
          // @0x4beb2 jmp 0x4beb7
          break;
        }
      }

      // @0x4beb7 popq %rbp  (epilogue; TS has no frame).
    }

    // @0x4beb8 cmpq %rdi, %rcx ; @0x4bebb setne %al : al = (rcx != this)
    // @0x4bebe retq
    return rcx !== this;
  }

  // ═════════════════════════════════════════════════════════════════════════
  // OZNotificationManager::addObjCObserver(void* observer, long tag)
  //
  // Disassembly source:
  //   raw-port/re/disasm/__ZN21OZNotificationManager15addObjCObserverEPvl.s
  //
  // FULL DISASM (@Ozone 0x4ba90..0x4bb53):
  //   0x4ba90  pushq %rbp ; movq %rsp,%rbp ; pushq r15/r14/r12/rbx (frame)
  //   0x4ba9b  movq %rdx, %r14              ; r14 = tag  (arg2, long)
  //   0x4ba9e  movq %rsi, %r15              ; r15 = observer (arg1, void*)
  //   0x4baa1  movq %rdi, %rbx              ; rbx = this
  //   0x4baa4  movq %rdi, %r12              ; r12 = this (walk cursor)
  //   -- walk to find insertion point (ordered by DESCENDING tag) --
  //   0x4bab0  movq 0x8(%r12), %r12         ; r12 = r12->next
  //   0x4bab5  cmpq %rbx, %r12              ; sub: r12 - this
  //   0x4bab8  je   0x4baf7                 ;   je => cursor cycled back to
  //                                         ;   sentinel => APPEND-AT-TAIL path
  //   0x4baba  cmpq 0x18(%r12), %r14        ; sub: r14 - [r12+0x18] = tag - node.tag
  //   0x4babf  jle  0x4bab0                 ;   jle (signed <=0) => tag <= node.tag
  //                                         ;   => keep walking
  //   -- INSERT-BEFORE r12 (found node with node.tag < tag) --
  //   0x4bac1  movl $0x30,%edi ; callq __Znwm   ; rax = new node (0x30 bytes)
  //   0x4bacb  movq %r15, 0x10(%rax)        ; new.observer = observer
  //   0x4bacf  movq %r14, 0x18(%rax)        ; new.tag = tag
  //   0x4bad3  movq $0x1, 0x20(%rax)        ; new.field20 = 1
  //   0x4badb  movl $0x0, 0x28(%rax)        ; new.flags = 0
  //   0x4bae2  movq (%r12), %rcx            ; rcx = r12->prev
  //   0x4bae6  movq %rax, 0x8(%rcx)         ; r12.prev->next = new
  //   0x4baea  movq %rcx, (%rax)            ; new.prev = r12.prev
  //   0x4baed  movq %rax, (%r12)            ; r12.prev = new
  //   0x4baf1  movq %r12, 0x8(%rax)         ; new.next = r12
  //   0x4baf5  jmp  0x4bb29                 ; -> common tail
  //   -- APPEND-AT-TAIL (insert before sentinel = at list end) --
  //   0x4baf7  movl $0x30,%edi ; callq __Znwm   ; rax = new node
  //   0x4bb01  movq %r15, 0x10(%rax)        ; new.observer = observer
  //   0x4bb05  movq %r14, 0x18(%rax)        ; new.tag = tag
  //   0x4bb09  movq $0x1, 0x20(%rax)        ; new.field20 = 1
  //   0x4bb11  movl $0x0, 0x28(%rax)        ; new.flags = 0
  //   0x4bb18  movq %rbx, 0x8(%rax)         ; new.next = this (sentinel)
  //   0x4bb1c  movq (%rbx), %rcx            ; rcx = this->prev  (= tail)
  //   0x4bb1f  movq %rcx, (%rax)            ; new.prev = tail
  //   0x4bb22  movq %rax, 0x8(%rcx)         ; tail->next = new
  //   0x4bb26  movq %rax, (%rbx)            ; this->prev = new
  //   -- common tail --
  //   0x4bb29  incq 0x10(%rbx)             ; this->count += 1
  //   0x4bb2d  movq 0x70(%rbx), %rax        ; rax = this->owner (+0x70)
  //   0x4bb31  movq 0xa0(%rax), %rdi        ; rdi = owner->objcObject (+0xa0)
  //   0x4bb38  testq %rdi,%rdi ; je 0x4bb4b ; skip retain if NULL
  //   0x4bb45  jmpq *_objc_retain          ; tail-call _objc_retain(rdi)
  //   0x4bb53  retq
  //
  // AT&T decode notes (dst - src):
  //   `cmpq %rbx, %r12`     => r12 - this ; je iff r12 == this (sentinel).
  //   `cmpq 0x18(%r12),%r14`=> tag - node.tag ; jle (signed) iff tag <= node.tag,
  //     so the walk ADVANCES while `tag <= node.tag`, stopping at the first
  //     node whose tag is strictly LESS than `tag` — the list is kept sorted
  //     by descending tag and the new node is spliced just before that node.
  //   Both branches do an IDENTICAL circular doubly-linked-list splice
  //   (`prev->next = new ; new.prev = prev ; new.next = cur ; cur.prev = new`);
  //   they differ only in whether `cur` is the found record (insert-before)
  //   or the sentinel `this` (append-at-tail).  A single splice against the
  //   chosen `cur` covers both, but we mirror the two machine branches.
  //
  // OUT-OF-SCOPE EXTERNS (modelled at the boundary, per PORTING_SPEC Rule 3):
  //   * __Znwm  (operator new, libc++)                   @0x4bac6 / 0x4bafc
  //   * _objc_retain (ObjC runtime)                       @0x4bb45
  //   Neither is an in-scope FCP callee.  The node allocation is a direct
  //   in-frame `__Znwm` (NOT a call_once boundary), so it is a legitimate
  //   allocation extern — we materialise the record as a plain object and
  //   retain the owner's ObjC object through the extern stub below.
  //
  // FRONTIER CALLEES: none in-scope.
  // ═════════════════════════════════════════════════════════════════════════
  /**
   * `OZNotificationManager::addObjCObserver(void*, long)` —
   * @Ozone 0x4ba90 (__ZN21OZNotificationManager15addObjCObserverEPvl).
   *
   * Insert a new observer record into the circular doubly-linked list,
   * keeping it ordered by DESCENDING `tag`: the new node is spliced
   * immediately before the first existing record whose tag is strictly
   * smaller than `tag` (or at the tail, before the sentinel, if none is).
   * The record's flags start 0 and its `+0x20` word starts 1.  Bumps the
   * manager's observer count and, if the owner (`+0x70`) holds a non-null
   * ObjC object (`+0xa0`), `_objc_retain`s it (out-of-scope ObjC extern).
   */
  addObjCObserver(observer: object | null, tag: bigint): void {
    // @0x4baa1/0x4baa4 rbx = r12 = this.
    // @0x4bab0.. walk: r12 = r12->next until either r12 == this (sentinel)
    // or tag > node.tag (found strictly-smaller node ⇒ insert before it).
    let cur: OZObserverRecord | OZNotificationManager = this;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // @0x4bab0 movq 0x8(%r12), %r12 : advance.
      cur = (cur as { next_at_0x8: OZObserverRecord | OZNotificationManager }).next_at_0x8;
      // @0x4bab5 cmpq %rbx,%r12 ; @0x4bab8 je APPEND : cycled back to sentinel.
      if (cur === this) break; // -> append-at-tail branch (cur === this)
      // @0x4baba cmpq 0x18(%r12),%r14 (tag - node.tag) ; @0x4babf jle => tag<=node.tag => keep walking.
      const node = cur as OZObserverRecord;
      if (tag <= node.tag_at_0x18) continue;
      // tag > node.tag : stop. Insert BEFORE `cur` (branch @0x4bac1).
      break;
    }

    // @0x4bac6 / 0x4bafc callq __Znwm : allocate a 0x30-byte record.
    // Field init is IDENTICAL on both branches (@0x4bacb.. / 0x4bb01..).
    const rec: OZObserverRecord = {
      observer_at_0x10: observer, // @0x4bacb/0x4bb01 movq %r15, 0x10(%rax)
      tag_at_0x18: tag, // @0x4bacf/0x4bb05 movq %r14, 0x18(%rax)
      field_at_0x20: 1n, // @0x4bad3/0x4bb09 movq $0x1, 0x20(%rax)
      flags_at_0x28: 0, // @0x4badb/0x4bb11 movl $0x0, 0x28(%rax)
      // links filled by the splice below.
      prev_at_0x0: this,
      next_at_0x8: this,
    };

    // Splice `rec` immediately before `cur`:
    //   insert-before branch (@0x4bae2..0x4baf1) with cur = found node, and
    //   append-at-tail branch (@0x4bb18..0x4bb26) with cur = this sentinel,
    //   are the SAME operation against `cur`.
    // @0x4bae2/0x4bb1c  prev = cur->prev.
    const prev = cur.prev_at_0x0;
    // @0x4bae6/0x4bb22  prev->next = rec.
    prev.next_at_0x8 = rec;
    // @0x4baea/0x4bb1f  rec.prev = prev.
    rec.prev_at_0x0 = prev;
    // @0x4baf1/0x4bb18  rec.next = cur.
    rec.next_at_0x8 = cur;
    // @0x4baed/0x4bb26  cur.prev = rec.
    cur.prev_at_0x0 = rec;

    // @0x4bb29 incq 0x10(%rbx) : this->count += 1.
    this.count_at_0x10 += 1n;

    // @0x4bb2d movq 0x70(%rbx), %rax : rax = this->owner.
    // @0x4bb31 movq 0xa0(%rax), %rdi : rdi = owner->objcObject.
    const objcObject = this.owner_at_0x70?.objcObject_at_0xa0 ?? null;
    // @0x4bb38 testq %rdi,%rdi ; je 0x4bb4b : skip retain if NULL.
    if (objcObject !== null) {
      // @0x4bb45 jmpq *_objc_retain : tail-call the ObjC-runtime extern.
      OZNotificationManager.objc_retain(objcObject);
    }
    // @0x4bb53 retq
  }

  // ═════════════════════════════════════════════════════════════════════════
  // OZNotificationManager::addCPPObserver(OZCPPObserver* observer, long tag)
  //
  // Disassembly source:
  //   raw-port/re/disasm/__ZN21OZNotificationManager14addCPPObserverEP13OZCPPObserverl.s
  //
  // FULL DISASM (@Ozone 0x4bc30..0x4bcd5):
  //   0x4bc30  pushq %rbp ; movq %rsp,%rbp ; pushq r15/r14/r12/rbx (frame)
  //   0x4bc3b  movq %rdx, %r14              ; r14 = tag  (arg2, long)
  //   0x4bc3e  movq %rsi, %r15              ; r15 = observer (arg1, OZCPPObserver*)
  //   0x4bc41  movq %rdi, %rbx              ; rbx = this
  //   0x4bc44  movq %rdi, %r12              ; r12 = this (walk cursor)
  //   0x4bc47  nopw (%rax,%rax)             ; alignment nop
  //   -- walk to find insertion point (ordered by DESCENDING tag) --
  //   0x4bc50  movq 0x8(%r12), %r12         ; r12 = r12->next
  //   0x4bc55  cmpq %rbx, %r12              ; sub: r12 - this
  //   0x4bc58  je   0x4bc97                 ;   je => cursor cycled back to the
  //                                         ;   sentinel => APPEND-AT-TAIL path
  //   0x4bc5a  cmpq 0x18(%r12), %r14        ; sub: r14 - [r12+0x18] = tag - node.tag
  //   0x4bc5f  jle  0x4bc50                 ;   jle (signed <=0) => tag <= node.tag
  //                                         ;   => keep walking
  //   -- INSERT-BEFORE r12 (found node with node.tag < tag) --
  //   0x4bc61  movl $0x30,%edi
  //   0x4bc66  callq __Znwm                 ; rax = new node (0x30 = 48 bytes)
  //   0x4bc6b  movq %r15, 0x10(%rax)        ; new.observer = observer
  //   0x4bc6f  movq %r14, 0x18(%rax)        ; new.tag = tag
  //   0x4bc73  movq $0x0, 0x20(%rax)        ; new.field20 = 0   <-- NOTE: 0, not 1
  //   0x4bc7b  movl $0x0, 0x28(%rax)        ; new.flags = 0
  //   0x4bc82  movq (%r12), %rcx            ; rcx = r12->prev
  //   0x4bc86  movq %rax, 0x8(%rcx)         ; r12.prev->next = new
  //   0x4bc8a  movq %rcx, (%rax)            ; new.prev = r12.prev
  //   0x4bc8d  movq %rax, (%r12)            ; r12.prev = new
  //   0x4bc91  movq %r12, 0x8(%rax)         ; new.next = r12
  //   0x4bc95  jmp  0x4bcc9                 ; -> common tail
  //   -- APPEND-AT-TAIL (insert before the sentinel = at list end) --
  //   0x4bc97  movl $0x30,%edi
  //   0x4bc9c  callq __Znwm                 ; rax = new node
  //   0x4bca1  movq %r15, 0x10(%rax)        ; new.observer = observer
  //   0x4bca5  movq %r14, 0x18(%rax)        ; new.tag = tag
  //   0x4bca9  movq $0x0, 0x20(%rax)        ; new.field20 = 0
  //   0x4bcb1  movl $0x0, 0x28(%rax)        ; new.flags = 0
  //   0x4bcb8  movq %rbx, 0x8(%rax)         ; new.next = this (sentinel)
  //   0x4bcbc  movq (%rbx), %rcx            ; rcx = this->prev  (= tail)
  //   0x4bcbf  movq %rcx, (%rax)            ; new.prev = tail
  //   0x4bcc2  movq %rax, 0x8(%rcx)         ; tail->next = new
  //   0x4bcc6  movq %rax, (%rbx)            ; this->prev = new
  //   -- common tail --
  //   0x4bcc9  incq 0x10(%rbx)              ; this->count += 1  (64-bit)
  //   0x4bccd  popq %rbx/%r12/%r14/%r15 ; popq %rbp             (epilogue)
  //   0x4bcd5  retq
  //   0x4bcd6  nopw %cs:(%rax,%rax)         ; alignment padding, not executed
  //
  // AT&T decode notes (a compare computes dst - src):
  //   `cmpq %rbx, %r12`      => r12 - this ; je iff r12 == this (the sentinel),
  //     i.e. the cursor walked the whole circular list without finding a
  //     smaller-tag node.
  //   `cmpq 0x18(%r12),%r14` => tag - node.tag ; `jle` is the SIGNED <=0 test
  //     (the key is a `long`), so the walk ADVANCES while `tag <= node.tag` and
  //     stops at the first node whose tag is strictly LESS than `tag`.  The list
  //     is therefore kept sorted by DESCENDING tag, and among equal tags the new
  //     record lands AFTER the existing ones (the walk keeps going on `==`).
  //   Both branches perform the SAME circular doubly-linked-list splice
  //   (`prev->next = new ; new.prev = prev ; new.next = cur ; cur.prev = new`),
  //   differing only in whether `cur` is the found record or the sentinel
  //   `this`, and in the order the four stores are emitted — an order that is
  //   unobservable here because no other thread or callee runs between them
  //   (the whole body is straight-line stores with no call after `__Znwm`).
  //
  // DIFFERENCE FROM THE SIBLING `addObjCObserver` @0x4ba90 (landed above) —
  // this is the C++-observer overload and it differs in exactly two ways:
  //   1. `+0x20` is initialised to ZERO (`movq $0x0, 0x20(%rax)` @0x4bc73 /
  //      @0x4bca9) where the ObjC overload writes ONE (@0x4bad3 / 0x4bb09);
  //   2. there is NO ObjC retain tail: the body ends at the `incq` — it never
  //      loads `this->owner` (+0x70) and never reaches `_objc_retain`.
  // Everything else (the 0x30-byte record, the descending-tag walk, the splice,
  // the count bump) is instruction-for-instruction the same shape.
  //
  // OUT-OF-SCOPE EXTERNS (modelled at the boundary, per PORTING_SPEC Rule 3):
  //   * __Znwm (operator new, libc++)  @0x4bc66 / 0x4bc9c — a direct in-frame
  //     allocation, not a call_once boundary; the record is materialised as a
  //     plain object exactly as the landed `addObjCObserver` does.
  //
  // FRONTIER CALLEES: none in-scope (`depgraph.py deps` lists nothing).
  // ═════════════════════════════════════════════════════════════════════════
  /**
   * `OZNotificationManager::addCPPObserver(OZCPPObserver*, long)` —
   * @Ozone 0x4bc30 (__ZN21OZNotificationManager14addCPPObserverEP13OZCPPObserverl).
   *
   * Insert a new observer record for a C++ observer into the circular
   * doubly-linked list, keeping it ordered by DESCENDING `tag`: the new node is
   * spliced immediately before the first existing record whose tag is strictly
   * smaller than `tag`, or at the tail (before the sentinel) when no such
   * record exists.  The record's flags (+0x28) and its `+0x20` word both start
   * at ZERO — the `+0x20` value is the one field that differs from the ObjC
   * overload, which starts it at 1.  Bumps the manager's observer count.  No
   * ObjC retain happens on this path.
   *
   * @param observer the `OZCPPObserver*` from %rsi (stored unretained at +0x10).
   * @param tag      the `long` sort key from %rdx (stored at +0x18).
   */
  addCPPObserver(observer: OZCPPObserver | null, tag: bigint): void {
    // @0x4bc41/0x4bc44 rbx = r12 = this.
    // @0x4bc50.. walk: r12 = r12->next until either r12 == this (sentinel)
    // or tag > node.tag (found a strictly-smaller node ⇒ insert before it).
    let cur: OZObserverRecord | OZNotificationManager = this;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      // @0x4bc50 movq 0x8(%r12), %r12 : advance.
      cur = (cur as { next_at_0x8: OZObserverRecord | OZNotificationManager }).next_at_0x8;
      // @0x4bc55 cmpq %rbx,%r12 ; @0x4bc58 je APPEND : cycled back to sentinel.
      if (cur === this) break; // -> append-at-tail branch (cur === this)
      // @0x4bc5a cmpq 0x18(%r12),%r14 (tag - node.tag) ; @0x4bc5f jle => tag <= node.tag => keep walking.
      const node = cur as OZObserverRecord;
      if (tag <= node.tag_at_0x18) continue;
      // tag > node.tag : stop. Insert BEFORE `cur` (branch @0x4bc61).
      break;
    }

    // @0x4bc66 / 0x4bc9c callq __Znwm : allocate a 0x30-byte record.
    // Field init is IDENTICAL on both branches (@0x4bc6b.. / 0x4bca1..).
    const rec: OZObserverRecord = {
      observer_at_0x10: observer, // @0x4bc6b/0x4bca1 movq %r15, 0x10(%rax)
      tag_at_0x18: tag, // @0x4bc6f/0x4bca5 movq %r14, 0x18(%rax)
      field_at_0x20: 0n, // @0x4bc73/0x4bca9 movq $0x0, 0x20(%rax) — ZERO here
      flags_at_0x28: 0, // @0x4bc7b/0x4bcb1 movl $0x0, 0x28(%rax)
      // links filled by the splice below.
      prev_at_0x0: this,
      next_at_0x8: this,
    };

    // Splice `rec` immediately before `cur`:
    //   insert-before branch (@0x4bc82..0x4bc91) with cur = the found node, and
    //   append-at-tail branch (@0x4bcb8..0x4bcc6) with cur = this sentinel,
    //   are the SAME operation against `cur`.
    // @0x4bc82/0x4bcbc  prev = cur->prev.
    const prev = cur.prev_at_0x0;
    // @0x4bc86/0x4bcc2  prev->next = rec.
    prev.next_at_0x8 = rec;
    // @0x4bc8a/0x4bcbf  rec.prev = prev.
    rec.prev_at_0x0 = prev;
    // @0x4bc91/0x4bcb8  rec.next = cur.
    rec.next_at_0x8 = cur;
    // @0x4bc8d/0x4bcc6  cur.prev = rec.
    cur.prev_at_0x0 = rec;

    // @0x4bcc9 incq 0x10(%rbx) : this->count += 1 (64-bit increment).
    this.count_at_0x10 += 1n;
    // @0x4bcd5 retq — no ObjC retain on the C++ path.
  }

  /**
   * Out-of-scope ObjC-runtime extern boundary for `_objc_retain`
   * (@Ozone 0x4bb45, `jmpq *_objc_retain`).  The Objective-C reference
   * count is not modelled by the value port; a faithful transcription
   * only needs to record that the retain happens here.  Marked as a
   * boundary per PORTING_SPEC Rule 3 (out-of-scope extern, cites addr).
   */
  private static objc_retain(_obj: object): void {
    // _objc_retain @0x4bb45 — ObjC runtime extern, no in-frame side effect
    // to model beyond the refcount, which is outside the port scope.
  }

  // ═════════════════════════════════════════════════════════════════════════
  // OZNotificationManager::removeObjCObserver(void* observer)
  //
  //   __ZN21OZNotificationManager18removeObjCObserverEPv   @Ozone 0x4bdc0
  //   Disassembly source:
  //     raw-port/re/disasm/__ZN21OZNotificationManager18removeObjCObserverEPv.s
  //
  // ADDED to this class rather than to a second file. `OZNotificationManager`
  // already lives here, and the file header above says it in as many words —
  // "the exact class rather than inventing a second, incompatible one". This
  // method reuses the landed `OZObserverRecord` model and the landed sentinel
  // convention (`this` IS the list terminator) instead of restating them.
  //
  // FULL DISASM (34 real insns, @0x4bdc0..@0x4be26):
  //   0x4bdc0  pushq %rbp ; movq %rsp,%rbp ; pushq %r14 ; pushq %rbx
  //   0x4bdc7  movq  0x8(%rdi), %rax        ; rax = this->next_at_0x8 (first)
  //   0x4bdcb  cmpq  %rdi, %rax
  //   0x4bdce  je    0x4bddf                ; empty list -> skip the search
  //   ── search loop @0x4bdd0 ──
  //   0x4bdd0  cmpq  0x10(%rax), %rsi       ; rec->observer_at_0x10 == observer ?
  //   0x4bdd4  je    0x4bddf                ;   found
  //   0x4bdd6  movq  0x8(%rax), %rax        ; rax = rec->next_at_0x8
  //   0x4bdda  cmpq  %rdi, %rax
  //   0x4bddd  jne   0x4bdd0                ; not back at the sentinel -> keep walking
  //   ── @0x4bddf ──
  //   0x4bddf  cmpq  %rdi, %rax
  //   0x4bde2  je    0x4be22                ; landed on the sentinel -> NOT FOUND, return
  //   0x4bde4  movl  0x20(%rax), %ebx       ; ebx = LOW 32 BITS of rec->field_at_0x20
  //   0x4bde7  movq  (%rax), %rcx           ; prev = rec->prev_at_0x0
  //   0x4bdea  movq  0x8(%rax), %rdx        ; next = rec->next_at_0x8
  //   0x4bdee  movq  %rdx, 0x8(%rcx)        ; prev->next = next
  //   0x4bdf2  movq  %rcx, (%rdx)           ; next->prev = prev
  //   0x4bdf5  decq  0x10(%rdi)             ; this->count_at_0x10 -= 1
  //   0x4bdff  callq __ZdlPv                ; operator delete(rec)   [libc extern]
  //   0x4be04  movq  0x70(%r14), %rax       ; owner = this->owner_at_0x70
  //   0x4be08  movq  0xa0(%rax), %rdi       ; target = owner->objcObject_at_0xa0
  //   0x4be0f  testq %rdi, %rdi ; je 0x4be22    ; null target -> return
  //   0x4be14  testl %ebx, %ebx ; je 0x4be22    ; field_at_0x20 low word 0 -> return
  //   0x4be1c  jmpq  *_objc_release          ; TAIL-CALL objc_release(target)
  //   0x4be22  popq/popq/popq ; retq
  //
  // WHAT THIS UNIT RESOLVES ABOUT THE LANDED LAYOUT. `field_at_0x20` is documented
  // above as "a long initialised to 1 on insert ... likely a refcount / once
  // bookkeeping word; only its initial value is exercised". This method exercises it:
  // it is the flag deciding whether the owner's ObjC object gets released when the
  // record goes away. Note it is read with `movl` — only the LOW 32 BITS are tested,
  // even though `addObjCObserver` writes all 64 with `movq $0x1`. The name is left
  // alone (renaming a landed declaration is what G6 refuses); the meaning is recorded.
  //
  // TWO PLACES THE MACHINE HAS NO GUARD, PRESERVED:
  //   * `operator delete` @0x4bdff is a no-op here, as everywhere in this tree — the
  //     GC reclaims the unlinked record and there is no observable field effect.
  //   * @0x4be04/@0x4be08 dereference `owner` UNCONDITIONALLY. There is no null test
  //     on it anywhere in the body; the only two tests are on the loaded target
  //     (@0x4be0f) and on the flag (@0x4be14). So this port does not invent an
  //     owner-null early return either — reading through a null owner raises, which
  //     is the nearest thing the model has to the fault FCP takes.
  //
  // @0xADDR Ozone 0x4bdc0
  removeObjCObserver(observer: object | null): void {
    // @0x4bdc7  movq 0x8(%rdi), %rax : first = this->next_at_0x8.
    let cur: OZObserverRecord | OZNotificationManager = this.next_at_0x8;

    // @0x4bdcb/@0x4bdce  cmpq %rdi,%rax ; je : an empty list skips the search entirely.
    if (cur !== this) {
      // @0x4bdd0..@0x4bddd — walk, testing the cookie BEFORE advancing, exactly as the
      // machine does (the `je` at 0x4bdd4 is checked at the top of each iteration).
      for (;;) {
        // @0x4bdd0  cmpq 0x10(%rax), %rsi
        if ((cur as OZObserverRecord).observer_at_0x10 === observer) break;
        // @0x4bdd6  movq 0x8(%rax), %rax
        cur = (cur as OZObserverRecord).next_at_0x8;
        // @0x4bdda/@0x4bddd  cmpq %rdi,%rax ; jne : stop when we wrap to the sentinel.
        if (cur === this) break;
      }
    }

    // @0x4bddf/@0x4bde2  cmpq %rdi,%rax ; je 0x4be22 : landing on the sentinel means the
    // observer is not in the list — return without touching anything.
    if (cur === this) return;
    const rec = cur as OZObserverRecord;

    // @0x4bde4  movl 0x20(%rax), %ebx : the LOW 32 BITS only.
    const flagLow32 = Number(BigInt.asUintN(32, rec.field_at_0x20));

    // @0x4bde7..@0x4bdf2 — unlink: prev->next = next ; next->prev = prev.
    const prev = rec.prev_at_0x0;
    const next = rec.next_at_0x8;
    prev.next_at_0x8 = next;
    next.prev_at_0x0 = prev;

    // @0x4bdf5  decq 0x10(%rdi) : this->count_at_0x10 -= 1, 64-bit.
    this.count_at_0x10 = BigInt.asUintN(64, this.count_at_0x10 - 1n);

    // @0x4bdff  callq __ZdlPv : operator delete(rec) — libc extern boundary, a no-op
    // here; the GC reclaims the record now that nothing links to it.

    // @0x4be04/@0x4be08 — owner = this->owner_at_0x70 ; target = owner->objcObject_at_0xa0.
    // Unguarded on purpose: see the note in the block comment above.
    const target = (this.owner_at_0x70 as { objcObject_at_0xa0: object | null })
      .objcObject_at_0xa0;

    // @0x4be0f  testq %rdi,%rdi ; je : a null ObjC target releases nothing.
    if (target === null) return;
    // @0x4be14  testl %ebx,%ebx ; je : and neither does a zero flag word.
    if (flagLow32 === 0) return;

    // @0x4be1c  jmpq *_objc_release : tail-call the ObjC-runtime extern.
    OZNotificationManager.objc_release(target);
  }

  /**
   * Out-of-scope ObjC-runtime extern boundary for `_objc_release`
   * (@Ozone 0x4be1c, `jmpq *_objc_release`).
   *
   * A NO-OP, and deliberately so — the exact twin of `objc_retain` below it.
   * `objc_release` is a LIFETIME/OWNERSHIP primitive returning void, and under the
   * RESOLVED lifetime-primitive ruling the faithful JS boundary model for the
   * retain/release family is a no-op, because the JS GC owns the surrogate. It also
   * sits on the NORMAL reachable path here — it is reached for exactly the inputs the
   * machine tail-calls on, i.e. a removed record with a non-zero flag word and a
   * non-null `objcObject_at_0xa0` — so a throw would break the ordinary case rather
   * than mark an undecoded gap. Kept as a real call at the real place so the call site
   * still mirrors the `jmpq`, and documented so a parity harness can hook the boundary.
   */
  private static objc_release(_obj: object): void {
    // _objc_release @0x4be1c — ObjC runtime extern; the reference count is outside
    // the port's scope and there is no in-frame side effect to model.
  }
}
