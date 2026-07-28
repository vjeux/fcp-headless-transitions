// FFAudioPanAdvancedSettingChannelKey.ts
// Faithful raw-port of Flexo::FFAudioPanAdvancedSettingChannelKey — a small
// value class that pairs two NSString* refs (a "channel identifier" and a
// "setting identifier", presumably) and defines ==, <, copy-ctor, and dtor
// on top of them.
//
// Source: Flexo framework (macOS FCP).
//   Disassembly stashed under raw-port/re/disasm/... (from /tmp/Flexo_tV.txt).
//
// Ports:
//   - FFAudioPanAdvancedSettingChannelKey(NSString*, NSString*) [C2] @0x7e7630
//   - FFAudioPanAdvancedSettingChannelKey(FFAudioPanAdvancedSettingChannelKey const&) [C2] @0x7e7670
//   - ~FFAudioPanAdvancedSettingChannelKey() [D2 — base]     @0x7e76b0
//   - ~FFAudioPanAdvancedSettingChannelKey() [D1 — complete] @0x7e76e0
//   - operator==(FFAudioPanAdvancedSettingChannelKey const&) const @0x7e7710
//   - operator<(FFAudioPanAdvancedSettingChannelKey const&) const  @0x7e7760
//
// Object memory layout (recovered from all six methods):
//   +0x00 NSString* keyA — first ObjC string ref, retained on all ctors,
//                          released on both dtors.
//   +0x08 NSString* keyB — second ObjC string ref, same lifecycle discipline.
//
// -----------------------------------------------------------------------------
// Frontier callees (unported; each surfaces as a raise-stub tagged with the
// call sites where it appears):
//   _objc_retain  — the Apple ObjC ARC runtime retain helper, addressed via
//     RIP-relative literal-pool load at 0x11060c9(%rip) (C2 @0x7e7640) and
//     0x1106086(%rip) (copy-ctor @0x7e7683). Called at @0x7e764a, @0x7e7653
//     (C2), @0x7e768a, @0x7e7694 (copy-ctor).
//   _objc_release — ARC release helper, dispatched through the literal pool
//     at @0x7e76bc / @0x7e76c6 (D2) and @0x7e76ec / @0x7e76f6 (D1).
//   _objc_msgSend on selector A (used by operator==)  — selref RIP-loaded
//     at @0x7e7726 (0x13d0e9b); dispatched twice through the same stub at
//     @0x7e7730 and @0x7e7745, both times with `rdi = self.keyX, rdx = other.keyX`.
//     By the calling convention (msgSend(receiver, selref, arg)) and the
//     return-value test (@0x7e7736 `testb %al, %al`), the selector is a
//     bool-returning binary method on NSString. It is not decoded here.
//   _objc_msgSend on selector B (used by operator<)   — selref RIP-loaded
//     at @0x7e7776 (0x13d1b8b); dispatched twice at @0x7e7780 and @0x7e7796.
//     Its return is an integer NSComparisonResult (compared to -1 at
//     @0x7e779c `cmpq $-1, %rax`, i.e. NSOrderedAscending).
//
// -----------------------------------------------------------------------------
// Semantics captured:
//   - operator== ANDs the two per-slot boolean returns, short-circuiting on the
//     first `false` (matches the je @0x7e7738 branch to the `xorl %eax, %eax`
//     tail @0x7e7752). If selector A on keyA returns false, keyB is not
//     compared and the whole result is false. Otherwise result is bool(selA_B).
//   - operator< returns true iff the selector on keyA returns -1 (
//     NSOrderedAscending) OR keyA-comparison returned 0 AND selector on keyB
//     returned -1. That's the lexicographic pair-compare pattern:
//       if a < b : return true
//       if a > b : return false
//       else     : return c < d
//     BUT the recovered asm is subtler: it tests `testq %rax, %rax; jne` at
//     @0x7e7789, i.e. "if a-compare != 0, skip the b-compare and return
//     (a-compare == -1)". If a-compare == 0 (equal), it does the b-compare
//     and returns (b-compare == -1). See operator< body below for exact flow.

/**
 * Opaque NSString reference — modelled as an unknown value the retain/release
 * helpers act on. The port does not decode NSString.
 */
export type NSStringRef = unknown | null;

/**
 * Raise-stub for `_objc_retain(NSString*)` @literal-pool 0x11060c9 / 0x1106086.
 * Called at @0x7e764a, @0x7e7653 (C2) and @0x7e768a, @0x7e7694 (copy-ctor).
 * ARC retain is not modelled by the raw-port; the JS layer has no reference
 * counting to mirror.
 */
function objc_retain(_p: NSStringRef): NSStringRef {
  throw new Error("raw-port: _objc_retain(NSString*) @0x7e764a/@0x7e7653/@0x7e768a/@0x7e7694 not modelled");
}

/**
 * Raise-stub for `_objc_release(NSString*)` — dispatched at @0x7e76bc,
 * @0x7e76c6 (D2) and @0x7e76ec, @0x7e76f6 (D1). Same rationale as retain.
 */
function objc_release(_p: NSStringRef): void {
  throw new Error("raw-port: _objc_release(NSString*) @0x7e76bc/@0x7e76c6/@0x7e76ec/@0x7e76f6 not modelled");
}

/**
 * Raise-stub for the ObjC binary selector used by `operator==`
 * (selref loaded @0x7e7726, dispatched @0x7e7730 and @0x7e7745).
 * The IR calls msgSend(receiver, selref, arg) and reads the byte-sized bool
 * return. Selector name is not decoded from this class alone.
 */
function objc_binaryBoolSel_eq(_recv: NSStringRef, _arg: NSStringRef): boolean {
  throw new Error("raw-port: NSString ObjC selector @selref 0x13d0e9b (dispatched @0x7e7730/@0x7e7745) not decoded");
}

/**
 * Raise-stub for the ObjC binary comparator used by `operator<`
 * (selref loaded @0x7e7776, dispatched @0x7e7780 and @0x7e7796).
 * The IR reads the returned NSInteger and tests `cmpq $-1, %rax; sete %al`
 * (i.e. NSOrderedAscending == -1). Selector name is not decoded here.
 */
function objc_binaryOrderSel_lt(_recv: NSStringRef, _arg: NSStringRef): number {
  throw new Error("raw-port: NSString ObjC selector @selref 0x13d1b8b (dispatched @0x7e7780/@0x7e7796) not decoded");
}

/**
 * FFAudioPanAdvancedSettingChannelKey — a two-field value pair over NSString.
 * The two slots are addressed at +0x00 and +0x08; we call them keyA/keyB.
 */
export class FFAudioPanAdvancedSettingChannelKey {
  /** +0x00 — first NSString*. */
  public keyA: NSStringRef = null;
  /** +0x08 — second NSString*. */
  public keyB: NSStringRef = null;

  /**
   * FFAudioPanAdvancedSettingChannelKey(NSString*, NSString*) [C2] @0x7e7630
   *
   *   @0x7e763a  rbx = rdx (arg keyB)   ; @0x7e763d  r14 = rdi (this)
   *   @0x7e7640  r15 = _objc_retain fnptr from literal pool
   *   @0x7e7647  rdi = rsi (arg keyA)   ; @0x7e764a  callq *r15 (retain keyA)
   *   @0x7e764d  *(void**)(this + 0)  = retained keyA
   *   @0x7e7650  rdi = rbx (arg keyB)   ; @0x7e7653  callq *r15 (retain keyB)
   *   @0x7e7656  *(void**)(this + 8)  = retained keyB
   *   @0x7e7664  retq
   */
  ctorC2(keyA: NSStringRef, keyB: NSStringRef): void {
    // @0x7e764a — retain keyA (result becomes this.keyA)
    this.keyA = objc_retain(keyA);
    // @0x7e7653 — retain keyB (result becomes this.keyB)
    this.keyB = objc_retain(keyB);
  }

  /**
   * FFAudioPanAdvancedSettingChannelKey(FFAudioPanAdvancedSettingChannelKey const&) [C2] @0x7e7670
   *
   *   @0x7e767a  rbx = rsi (arg other) ; @0x7e767d  r14 = rdi (this)
   *   @0x7e7680  rdi = *(void**)(other + 0) = other.keyA
   *   @0x7e7683  r15 = _objc_retain fnptr from literal pool
   *   @0x7e768a  callq *r15 (retain other.keyA)
   *   @0x7e768d  *(void**)(this + 0)  = retained other.keyA
   *   @0x7e7690  rdi = *(void**)(other + 8) = other.keyB
   *   @0x7e7694  callq *r15 (retain other.keyB)
   *   @0x7e7697  *(void**)(this + 8)  = retained other.keyB
   *   @0x7e76a5  retq
   */
  ctorCopyC2(other: FFAudioPanAdvancedSettingChannelKey): void {
    // @0x7e768a — retain other.keyA
    this.keyA = objc_retain(other.keyA);
    // @0x7e7694 — retain other.keyB
    this.keyB = objc_retain(other.keyB);
  }

  /**
   * ~FFAudioPanAdvancedSettingChannelKey() [D2 — base] @0x7e76b0
   *
   *   @0x7e76b9  rdi = *(void**)(this + 0)
   *   @0x7e76bc  callq *_objc_release (via lit pool)
   *   @0x7e76c2  rdi = *(void**)(this + 8)
   *   @0x7e76c6  callq *_objc_release
   *   @0x7e76d2  retq
   */
  dtorD2(): void {
    // @0x7e76bc — release this.keyA
    objc_release(this.keyA);
    // @0x7e76c6 — release this.keyB
    objc_release(this.keyB);
  }

  /**
   * ~FFAudioPanAdvancedSettingChannelKey() [D1 — complete] @0x7e76e0
   *
   * Byte-for-byte clone of D2 with a slightly different literal-pool RIP
   * displacement. We delegate.
   */
  dtorD1(): void {
    // @0x7e76e0..@0x7e7702 — see dtorD2.
    this.dtorD2();
  }

  /**
   * operator==(FFAudioPanAdvancedSettingChannelKey const&) const @0x7e7710
   *
   *   @0x7e7720  rdi = *(void**)(this + 0) = this.keyA
   *   @0x7e7723  rdx = *(void**)(other + 0) = other.keyA
   *   @0x7e7726  r14 = selref A (RIP-loaded)
   *   @0x7e772d  rsi = r14
   *   @0x7e7730  callq objc_msgSend(this.keyA, selA, other.keyA)  -> al
   *   @0x7e7736  testb %al, %al
   *   @0x7e7738  je   0x7e7752  (return false)
   *   @0x7e773a  rdi = *(void**)(this + 8) = this.keyB
   *   @0x7e773e  rdx = *(void**)(other + 8) = other.keyB
   *   @0x7e7742  rsi = r14  (same selref A)
   *   @0x7e7745  callq objc_msgSend(this.keyB, selA, other.keyB) -> al
   *   @0x7e774b  setne %al  (i.e. bool)
   *   @0x7e7750  jmp 0x7e7754
   *   @0x7e7752  xorl %eax, %eax  (false)
   *   @0x7e7754..@0x7e775e  epilogue and retq
   *
   * Result: (selA(this.keyA, other.keyA)) && (selA(this.keyB, other.keyB)).
   * Short-circuits when keyA compare returns false.
   */
  eq(other: FFAudioPanAdvancedSettingChannelKey): boolean {
    // @0x7e7730 — first ObjC bool compare on the keyA slot.
    const eqA = objc_binaryBoolSel_eq(this.keyA, other.keyA);
    // @0x7e7736..@0x7e7738 — short-circuit-false when eqA is false.
    if (!eqA) {
      return false;
    }
    // @0x7e7745 — second ObjC bool compare on the keyB slot.
    // @0x7e774b setne %al — the returned byte is coerced back to bool.
    return objc_binaryBoolSel_eq(this.keyB, other.keyB) ? true : false;
  }

  /**
   * operator<(FFAudioPanAdvancedSettingChannelKey const&) const @0x7e7760
   *
   *   @0x7e7770  rdi = *(void**)(this + 0)   = this.keyA
   *   @0x7e7773  rdx = *(void**)(other + 0)  = other.keyA
   *   @0x7e7776  r14 = selref B (RIP-loaded)
   *   @0x7e777d  rsi = r14
   *   @0x7e7780  callq objc_msgSend(this.keyA, selB, other.keyA) -> rax
   *   @0x7e7786  testq %rax, %rax
   *   @0x7e7789  jne 0x7e779c   (skip keyB compare when keyA cmp != 0)
   *   @0x7e778b  rdi = *(void**)(this + 8) = this.keyB
   *   @0x7e778f  rdx = *(void**)(other + 8) = other.keyB
   *   @0x7e7793  rsi = r14  (same selref B)
   *   @0x7e7796  callq objc_msgSend(this.keyB, selB, other.keyB) -> rax
   *   @0x7e779c  cmpq $-1, %rax
   *   @0x7e77a0  sete %al  (bool)
   *   @0x7e77ad  retq
   *
   * Semantic: if keyA-compare returns 0 (equal), fall through to keyB-compare.
   * Otherwise, the keyA-compare's return is what's compared to -1.
   * Result: (final-cmp-result == -1), i.e. NSOrderedAscending.
   */
  lt(other: FFAudioPanAdvancedSettingChannelKey): boolean {
    // @0x7e7780 — keyA comparator; returns an NSInteger.
    let cmp = objc_binaryOrderSel_lt(this.keyA, other.keyA);
    // @0x7e7786..@0x7e7789 — if keyA cmp != 0, skip keyB comparator; else run.
    if (cmp === 0) {
      // @0x7e7796 — keyB comparator, in place, in the same register.
      cmp = objc_binaryOrderSel_lt(this.keyB, other.keyB);
    }
    // @0x7e779c..@0x7e77a0 — return (cmp == -1), matching NSOrderedAscending.
    return cmp === -1;
  }
}
