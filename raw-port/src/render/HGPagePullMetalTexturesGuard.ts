/**
 * HGPagePullMetalTexturesGuard — Helium framework (render layer)
 *
 * A stack-scope RAII guard that "pulls" Metal textures onto an HGPage from an
 * HGNode source when constructed, and releases them from the HGPage when it
 * goes out of scope. Ctor takes (HGNode* src, HGPage* page); dtor calls
 * `HGPage::ReleaseTextures()` on the captured page (guarding against null).
 *
 * The pull itself is performed via a VIRTUAL method on the source `HGNode` at
 * vtable slot +0x1d0 (recovered from the ctor's `movq 0x1d0(%rax), %rax`).
 * The four arguments handed to that virtual method are (this=src, page, 0)
 * — a three-argument member function with an int/enum-style third arg pinned
 * to 0. This matches an "HGNode::PullTextures(HGPage*, int mode=0)" virtual
 * (name inferred from the class purpose; the mangled name is NOT visible in
 * the ctor since it's dispatched via vtable, so we do NOT bake the name in).
 *
 * FOUR SYMBOLS PORTED (Helium.framework/Versions/A/Helium):
 *   @Helium 0x11b980  HGPagePullMetalTexturesGuard::HGPagePullMetalTexturesGuard(HGNode*, HGPage*)  [C2]
 *   @Helium 0x11b9b0  HGPagePullMetalTexturesGuard::HGPagePullMetalTexturesGuard(HGNode*, HGPage*)  [C1]
 *                      (C1 and C2 are byte-identical — see the .s file; standard for
 *                       a class with no virtual bases.)
 *   @Helium 0x11b9e0  HGPagePullMetalTexturesGuard::~HGPagePullMetalTexturesGuard()                 [D2]
 *   @Helium 0x11ba00  HGPagePullMetalTexturesGuard::~HGPagePullMetalTexturesGuard()                 [D1]
 *                      (D1 and D2 are byte-identical.)
 *
 * STRUCT LAYOUT (recovered from the four methods):
 *   struct HGPagePullMetalTexturesGuard {
 *     +0x00  page   HGPage*   (the page whose ReleaseTextures we owe in the dtor)
 *   };
 *   (There is only one field — the ctor writes `page` to (%rdi) at 0x11b984,
 *    the dtor loads `page` from (%rdi) at 0x11b9e4. No further fields are
 *    stored or read anywhere.)
 *
 * External callees / vtable slots cited:
 *   HGNode vtable slot @+0x1d0                — src's virtual "PullTextures"       @0x11b98f / @0x11b9bf
 *   __ZN6HGPage15ReleaseTexturesEv            — HGPage::ReleaseTextures()          @0x11b9ec / @0x11ba0c
 *   ___clang_call_terminate                    — cold-path terminate trampoline    @0x11b9f6 / @0x11ba16
 */

/** Opaque HGPage handle. Real HGPage is a big class — not ported here. Only its
 *  `ReleaseTextures()` method is invoked from this guard. */
export interface HGPage {
  /** @Helium __ZN6HGPage15ReleaseTexturesEv — external Helium method @0x11b9ec.
   *  Contract only; throws in the unported default binding. */
  ReleaseTextures(): void;
}

/** Opaque HGNode handle. The ctor dispatches through vtable slot +0x1d0. Modelled
 *  here as a plain method (`PullTextures`) so the dispatch is visible in TS. */
export interface HGNode {
  /**
   * @Helium HGNode vtable slot +0x1d0 — src's virtual "pull textures onto page"
   * method. Called as `src.vtable[+0x1d0](src, page, 0)` at ctor @0x11b99f. The
   * third argument is a hardcoded `0` (`xorl %edx,%edx` @0x11b99c) — we surface
   * it as `mode` here for readability. The exact contract of that vtable slot
   * is external to this port. */
  PullTextures(page: HGPage, mode: number): void;
}

export class HGPagePullMetalTexturesGuard {
  /** +0x00 in the C++ struct — the page we captured; may be released by the dtor. */
  page: HGPage | null = null;

  /**
   * @Helium 0x11b980  __ZN28HGPagePullMetalTexturesGuardC2EP6HGNodeP6HGPage
   * @Helium 0x11b9b0  __ZN28HGPagePullMetalTexturesGuardC1EP6HGNodeP6HGPage  (byte-identical)
   *
   * Faithful transcription of C2 (16 lines):
   *   0x11b980 pushq %rbp / movq %rsp,%rbp
   *   0x11b984 movq  %rdx, (%rdi)          ; this->page = page  (arg3 → +0x00 field)
   *   0x11b987 testq %rsi, %rsi            ; src == nullptr ?
   *   0x11b98a je    0x11b9a1              ; if null → skip the vtable dispatch
   *   0x11b98c movq  (%rsi), %rax          ; rax = src->vtable
   *   0x11b98f movq  0x1d0(%rax), %rax     ; rax = vtable[+0x1d0]  (PullTextures slot)
   *   0x11b996 movq  %rsi, %rdi            ; rdi = src   (this-pointer of the virtual call)
   *   0x11b999 movq  %rdx, %rsi            ; rsi = page  (arg2)
   *   0x11b99c xorl  %edx, %edx            ; edx = 0     (arg3 / mode)
   *   0x11b99e popq  %rbp
   *   0x11b99f jmpq  *%rax                 ; tail-call src->PullTextures(page, 0)
   *   -- null path (@0x11b9a1) --
   *   0x11b9a1 popq  %rbp / retq
   *
   * Reduced semantics:
   *   this->page = page;
   *   if (src != null) src->PullTextures(page, 0);
   *
   * Note: `page` is stored FIRST — even in the null-src branch, so a
   * subsequent dtor call will still (attempt to) ReleaseTextures on it.
   */
  constructor(src: HGNode | null, page: HGPage | null) {
    // @0x11b984 — this->page = page  (stored first, unconditionally)
    this.page = page;
    // @0x11b987 — testq %rsi, %rsi  (src == null?)
    if (src !== null && page !== null) {
      // @0x11b98c-0x11b99f — src->vtable[+0x1d0](src, page, 0)  (tail-call)
      src.PullTextures(page, 0);
    }
    // @0x11b9a1 — ret
  }

  /**
   * @Helium 0x11b9e0  __ZN28HGPagePullMetalTexturesGuardD2Ev
   * @Helium 0x11ba00  __ZN28HGPagePullMetalTexturesGuardD1Ev  (byte-identical)
   *
   * Faithful transcription of D2 (12 lines):
   *   0x11b9e0 pushq %rbp / movq %rsp,%rbp
   *   0x11b9e4 movq  (%rdi), %rdi          ; rdi = this->page
   *   0x11b9e7 testq %rdi, %rdi            ; page == nullptr ?
   *   0x11b9ea je    0x11b9f1              ; if null → skip
   *   0x11b9ec callq HGPage::ReleaseTextures()   ; page->ReleaseTextures()
   *   0x11b9f1 popq  %rbp / retq
   *   -- cold path (@0x11b9f3..0x11b9f6) --
   *   0x11b9f3 movq  %rax, %rdi
   *   0x11b9f6 callq ___clang_call_terminate    ; only reached if ReleaseTextures throws
   *
   * Reduced semantics:
   *   if (this->page != null) this->page->ReleaseTextures();
   */
  destroy(): void {
    // @0x11b9e4-0x11b9ea — this->page && this->page->ReleaseTextures()
    if (this.page !== null) {
      // @0x11b9ec — HGPage::ReleaseTextures()
      this.page.ReleaseTextures();
    }
    // @0x11b9f1 — ret  (note: we do NOT null-out this.page — the asm leaves the field alone)
  }
}
