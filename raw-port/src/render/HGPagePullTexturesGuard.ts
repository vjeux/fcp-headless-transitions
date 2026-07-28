// HGPagePullTexturesGuard.ts — Helium
//
// A stack-scope RAII guard that "pulls textures" onto an HGPage while the
// guard is alive and releases them when the guard leaves scope. The ctor
// receives an HGNode* + an HGPage*; it stashes the page into the guard
// and (if the node is non-null) tail-calls a specific virtual-function
// slot on the node with the page as its first argument, which is the
// "pull textures for this page onto this node" hook. The dtor calls
// HGPage::ReleaseTextures() on the stashed page pointer if it is non-null.
//
// Faithful transcription of the x86_64 disassembly of
// /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium.
//
// Source disassembly:
//   raw-port/re/disasm/Helium.HGPagePullTexturesGuard.HGPagePullTexturesGuard.s
//   raw-port/re/disasm/Helium.HGPagePullTexturesGuard.~HGPagePullTexturesGuard.s
//
// FOUR SYMBOLS PORTED (Helium.framework/Versions/A/Helium):
//   @Helium 0x11b8e0  HGPagePullTexturesGuard::HGPagePullTexturesGuard(HGNode*, HGPage*)  [C2]
//   @Helium 0x11b910  HGPagePullTexturesGuard::HGPagePullTexturesGuard(HGNode*, HGPage*)  [C1]
//                     (C1 and C2 are byte-identical — Itanium ABI base+complete ctors
//                      coincide for a class with no vbases and the compiler emitted
//                      both copies verbatim: 0x11b8e0 body == 0x11b910 body byte-for-byte,
//                      verified via `otool -tV` output for both symbols.)
//   @Helium 0x11b940  HGPagePullTexturesGuard::~HGPagePullTexturesGuard()                 [D2]
//   @Helium 0x11b960  HGPagePullTexturesGuard::~HGPagePullTexturesGuard()                 [D1]
//                     (D1 and D2 are also byte-identical — verified same way.)
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (recovered from the load/store offsets in the four methods)
// -----------------------------------------------------------------------------
//   struct HGPagePullTexturesGuard {
//     +0x00  page   HGPage*    (stashed by ctor @0x11b8e4 `movq %rdx, (%rdi)`
//                               and reloaded by dtor @0x11b944 `movq (%rdi), %rdi`)
//   };                          // sizeof = 8
//
// The class has NO vptr — the destructors are non-virtual and neither ctor
// installs a vtable pointer at self+0x00. Instead, self+0x00 is directly
// the owned HGPage* (which the dtor then unconditionally passes to
// HGPage::ReleaseTextures if non-null).
//
// -----------------------------------------------------------------------------
// External callees cited (all Helium; addresses are __stubs / vtable slots):
//
//   Ctor @0x11b8e0 / @0x11b910:
//     * self+0x00 = %rdx (the HGPage*).                          @0x11b8e4 / @0x11b914
//     * If (%rsi != 0):                                          @0x11b8e7 / @0x11b917
//         load %rax = *(void**)%rsi         // node->vptr        @0x11b8ec / @0x11b91c
//         load %rax = *(void**)(%rax+0x1c8) // node->vt[0x1c8]   @0x11b8ef / @0x11b91f
//         call %rax(node=%rsi, page=%rdx, 0)   [tail-jmp]        @0x11b8ff / @0x11b92f
//       Virtual slot @+0x1c8 on HGNode is UNDECODED (frontier vfn — the "pull
//       textures for this page onto this node" hook). It receives (HGNode* self,
//       HGPage* page, int flag=0) with a `xorl %edx,%edx` @0x11b8fc/@0x11b92c
//       setting the third arg to zero.
//     * Note: the tail-jmp form (`jmpq *%rax` after `popq %rbp`) means the
//       ctor returns the vfn's return value, but the C++ ctor signature is
//       `void`, so the return is discarded by the caller — the vfn is called
//       for its side-effect ("pull textures").
//
//   Dtor @0x11b940 / @0x11b960:
//     * page = *(HGPage**)(%rdi+0x00)                            @0x11b944 / @0x11b964
//     * if (page != nullptr)  HGPage::ReleaseTextures(page)      @0x11b94c / @0x11b96c
//       (via callq __ZN6HGPage15ReleaseTexturesEv — an HGPage
//        instance method taking `this` in %rdi; the dtor already
//        holds page in %rdi at that point.)
//     * Exception path @0x11b953/@0x11b973: `___clang_call_terminate` — the
//       standard clang exception-termination trampoline reached when the
//       destructor's callee (HGPage::ReleaseTextures) itself throws while
//       an exception is already unwinding.
//
// FRONTIER TYPES / CALLEES (surfaced as opaque handles / throwing stubs;
// each cited by @0xADDR):
//   - HGNode (opaque; vtable slot @+0x1c8 is the frontier vfn "pull textures")
//   - HGPage (opaque; HGPage::ReleaseTextures is the frontier callee)
//
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Frontier types.
// -----------------------------------------------------------------------------

/** HGNode — opaque render-graph node. The ctor reads its vptr (offset 0)
 *  and calls the vfn at vtable slot 0x1c8 with (node, page, 0). All other
 *  fields are frontier / undecoded here. */
export type HGNode = { readonly __brand: "HGNode" };

/** HGPage — opaque render-page handle. Owned by the guard for its lifetime;
 *  the dtor calls `HGPage::ReleaseTextures()` on it via callq @0x11b94c /
 *  @0x11b96c. */
export type HGPage = { readonly __brand: "HGPage" };

// -----------------------------------------------------------------------------
// Frontier callees — throwing stubs, each cited by @0xADDR.
// -----------------------------------------------------------------------------

/** HGNode vtable slot @+0x1c8 — the "pull textures for this page onto this
 *  node" hook. Signature: (HGNode* self, HGPage* page, int flag) -> ?
 *  (return value is discarded by the ctor's tail-jmp). Called from
 *  @Helium 0x11b8ef / @Helium 0x11b91f. UNDECODED frontier virtual: the
 *  concrete vtable-holder classes and their bodies are not yet transcribed. */
function HGNode_vt_1c8_PullTextures(
  _node: HGNode,
  _page: HGPage,
  _flag: number,
): void {
  throw new Error(
    "HGNode vtable slot @+0x1c8 (PullTextures) not yet transcribed: tail-called by HGPagePullTexturesGuard ctor @Helium 0x11b8ef / @Helium 0x11b91f — vfn body and its concrete overrides are undecoded frontier symbols.",
  );
}

/** HGPage::ReleaseTextures() @Helium (import stub — resolved at @0x11b94c /
 *  @0x11b96c). UNDECODED frontier method: instance method on HGPage. Called
 *  by the guard's dtor when self.page is non-null. */
function HGPage_ReleaseTextures(_page: HGPage): void {
  throw new Error(
    "HGPage::ReleaseTextures @Helium not yet transcribed: called by HGPagePullTexturesGuard dtor @Helium 0x11b94c / @Helium 0x11b96c — method body is an undecoded frontier symbol.",
  );
}

// -----------------------------------------------------------------------------
// The guard object.
// -----------------------------------------------------------------------------

/** HGPagePullTexturesGuard — an 8-byte RAII object with a single field:
 *  the owned HGPage*. Layout was recovered from the ctor's single store
 *  `movq %rdx, (%rdi)` @0x11b8e4 and the dtor's single load
 *  `movq (%rdi), %rdi` @0x11b944 (both at offset +0x00). */
export interface HGPagePullTexturesGuard {
  /** self+0x00 — the owned HGPage*, or null. Written by the ctor and
   *  read (and consumed) by the dtor. Can also be null when the guard
   *  was constructed with a null HGPage. */
  page: HGPage | null;
}

// -----------------------------------------------------------------------------
// HGPagePullTexturesGuard::HGPagePullTexturesGuard(HGNode*, HGPage*)
// @Helium 0x11b8e0 [C2] / @Helium 0x11b910 [C1]  — byte-identical bodies.
//
//   @0x11b8e0/@0x11b910  pushq %rbp ; movq %rsp, %rbp
//   @0x11b8e4/@0x11b914  movq  %rdx, (%rdi)           ; self.page = %rdx = page
//   @0x11b8e7/@0x11b917  testq %rsi, %rsi              ; %rsi = node
//   @0x11b8ea/@0x11b91a  je    0x11b901/0x11b931       ; if (node == nullptr) -> return
//   @0x11b8ec/@0x11b91c  movq  (%rsi), %rax            ; %rax = node->vptr
//   @0x11b8ef/@0x11b91f  movq  0x1c8(%rax), %rax       ; %rax = node->vt[0x1c8]
//   @0x11b8f6/@0x11b926  movq  %rsi, %rdi              ; arg1 = node
//   @0x11b8f9/@0x11b929  movq  %rdx, %rsi              ; arg2 = page
//   @0x11b8fc/@0x11b92c  xorl  %edx, %edx              ; arg3 = 0
//   @0x11b8fe/@0x11b92e  popq  %rbp
//   @0x11b8ff/@0x11b92f  jmpq  *%rax                   ; TAIL-CALL vt[0x1c8](node, page, 0)
//   @0x11b901/@0x11b931  popq  %rbp ; retq             ; (nullptr-node path)
// -----------------------------------------------------------------------------

/** HGPagePullTexturesGuard::HGPagePullTexturesGuard(node, page) @Helium 0x11b8e0
 *  (C2) / 0x11b910 (C1) — byte-identical bodies.
 *
 *  Stashes `page` into `self.page` and, if `node != nullptr`, tail-calls
 *  `node->vt[0x1c8](node, page, 0)` (the "pull textures onto node for this
 *  page" hook — an undecoded frontier vfn; see `HGNode_vt_1c8_PullTextures`).
 *
 *  Note: because the ctor tail-calls the vfn, invoking this ctor with a
 *  non-null node will throw from the frontier stub — that's the intended
 *  "demand signal" for the undecoded vfn. Passing a null node completes
 *  the ctor cleanly (matching the je @0x11b8ea/@0x11b91a fallthrough). */
export function HGPagePullTexturesGuard_ctor(
  self: HGPagePullTexturesGuard,
  node: HGNode | null,
  page: HGPage | null,
): void {
  // @0x11b8e4 / @0x11b914 : movq %rdx, (%rdi)  ; self.page = page
  //   Note: %rdx is the passed HGPage* (may be null); we mirror that here.
  self.page = page;
  // @0x11b8e7 / @0x11b917 : testq %rsi, %rsi ; @0x11b8ea / @0x11b91a : je -> return
  if (node === null) {
    return;
  }
  // @0x11b8ec-@0x11b8ff / @0x11b91c-@0x11b92f : tail-call the vfn.
  //   *%rax where %rax = *((*(void**)node) + 0x1c8), with args
  //   (node, page, 0). page may be null — the vfn receives whatever value
  //   %rdx held on entry, which was the same value we already wrote into
  //   self.page above.
  HGNode_vt_1c8_PullTextures(node, page as HGPage, 0);
}

// -----------------------------------------------------------------------------
// HGPagePullTexturesGuard::~HGPagePullTexturesGuard()
// @Helium 0x11b940 [D2] / @Helium 0x11b960 [D1]  — byte-identical bodies.
//
//   @0x11b940/@0x11b960  pushq %rbp ; movq %rsp, %rbp
//   @0x11b944/@0x11b964  movq  (%rdi), %rdi           ; %rdi = self.page
//   @0x11b947/@0x11b967  testq %rdi, %rdi
//   @0x11b94a/@0x11b96a  je    0x11b951/0x11b971      ; if (page == nullptr) -> return
//   @0x11b94c/@0x11b96c  callq __ZN6HGPage15ReleaseTexturesEv   ; HGPage::ReleaseTextures(page)
//   @0x11b951/@0x11b971  popq  %rbp ; retq
//   @0x11b953/@0x11b973  movq  %rax, %rdi ; callq ___clang_call_terminate  (exception cold path)
// -----------------------------------------------------------------------------

/** HGPagePullTexturesGuard::~HGPagePullTexturesGuard() @Helium 0x11b940 (D2) /
 *  0x11b960 (D1) — byte-identical bodies.
 *
 *  If `self.page` is non-null, calls `HGPage::ReleaseTextures(self.page)`
 *  (the frontier import at @0x11b94c/@0x11b96c). The exception cold path
 *  @0x11b953/@0x11b973 dispatches to `___clang_call_terminate` — the standard
 *  clang trampoline invoked when a destructor's callee throws during unwind. */
export function HGPagePullTexturesGuard_dtor(self: HGPagePullTexturesGuard): void {
  // @0x11b944 / @0x11b964 : reload self.page.
  const page = self.page;
  // @0x11b947 / @0x11b967 : testq %rdi, %rdi ; je -> return.
  if (page === null) {
    return;
  }
  // @0x11b94c / @0x11b96c : callq HGPage::ReleaseTextures(page).
  HGPage_ReleaseTextures(page);
  // (fall through to popq %rbp ; retq @0x11b951 / @0x11b971)
}
