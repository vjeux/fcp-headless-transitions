// OZSceneGamutUndo.ts — raw transcription of Ozone `OZSceneGamutUndo`.
//
// Sibling of the "Swap-based undo record" family (see OZOverrideFCPColorSpaceUndo,
// OZLastModifiedChannelsUndo, OZMarkersUndo, …). Snapshots an OZScene's working-gamut
// value and dynamic-range-tracking flag at construction; `Swap()` swaps the snapshot
// with the live OZScene of the currently-active OZDocument and posts a
// ColorProcessingModeChanged notification.
//
// Provenance (Ozone framework, x86_64 slice):
//   OZSceneGamutUndo::OZSceneGamutUndo(OZScene const*)   [C2]  @0x101520
//   OZSceneGamutUndo::OZSceneGamutUndo(OZScene const*)   [C1]  @0x101560
//   OZSceneGamutUndo::~OZSceneGamutUndo()                [D2]  @0x1015a0
//   OZSceneGamutUndo::~OZSceneGamutUndo()                [D1]  @0x1015b0
//   OZSceneGamutUndo::~OZSceneGamutUndo()                [D0]  @0x1015c0
//   OZSceneGamutUndo::Swap()                                    @0x1015d0
//
// vtable @0x83d5f0 (installed ptr = table+0x10 = 0x83d600). Slots (from
// `raw-port/army/tools/vtable.py Ozone OZSceneGamutUndo`):
//   *0x00 -> 0x1015b0  ~OZSceneGamutUndo (D1 non-deleting, empty)
//   *0x08 -> 0x1015c0  ~OZSceneGamutUndo (D0 deleting; tail-calls operator delete via stub 0x6dfc36)
//   *0x10 -> 0x1015d0  Swap()
//
// Struct layout (0x10 bytes; recovered from ctors @0x101520/@0x101560 and Swap @0x1015d0):
//   +0x00  vtable ptr        installed at ctor (leaq &vtable+0x10,%rax ; movq %rax,(%rdi))
//   +0x08  savedGamut : u32  PCWorkingGamutValue captured from scene->getRawWorkingGamut()
//                            (`movl %eax,0x8(%r14)` @0x10157f / @0x10153f)
//   +0x0c  savedDR : u8/bool captured from scene->dynamicRangeTrackingEnabled()
//                            (`movb %al,0xc(%r14)` @0x10158b / @0x10154b)
//
// Callee/const citations (via raw-port/army/tools/resolve.py Ozone):
//   sym   0x83d5f0 (vtable body — `vtable for OZSceneGamutUndo (+0x10)`; ctors store
//                   0x83d600 which is table+0x10 as the installed vptr)
//   stub  __ZNK7OZScene18getRawWorkingGamutEv
//                   — OZScene::getRawWorkingGamut() const  (ctor @0x10157a / @0x10153a; Swap @0x1015fd)
//   stub  __ZNK7OZScene27dynamicRangeTrackingEnabledEv
//                   — OZScene::dynamicRangeTrackingEnabled() const
//                                                   (ctor @0x101586 / @0x101546; Swap @0x101608)
//   stub  __ZN7OZScene18setRawWorkingGamutE19PCWorkingGamutValue
//                   — OZScene::setRawWorkingGamut(PCWorkingGamutValue)  (Swap @0x101616)
//   stub  __ZN7OZScene30setDynamicRangeTrackingEnabledEb
//                   — OZScene::setDynamicRangeTrackingEnabled(bool)     (Swap @0x101622)
//   stub  __ZN7OZScene34updateColorChannelsForWorkingGamutE19PCWorkingGamutValuebP15OZChannelFolder
//                   — OZScene::updateColorChannelsForWorkingGamut(gamut, bool, OZChannelFolder*)
//                                                                       (Swap @0x101638)
//   stub  __ZN13OZApplication13getCurrentDocEv
//                   — OZApplication::getCurrentDoc()                    (Swap @0x1015e8)
//   stub  __ZN10OZDocument16postNotificationEj
//                   — OZDocument::postNotification(unsigned int)        (Swap @0x101651)
//   stub  __ZdlPv (operator delete) — D0 tail-call @0x1015c5 via stub 0x6dfc36
//   objc  class ref @0x8205c0 = _OBJC_CLASS_$_NSNotificationCenter (Swap movq @0x101656)
//   objc  class ref @0x8205b8 = _OBJC_CLASS_$_NSNotification        (Swap movq @0x101671)
//   objc  fn   ref @0x826028 = _objc_msgSend (Swap movq @0x101664 → r14 = msgSend fn ptr)
//   objc  sel  ref @0x908f18 → __objc_methname "defaultCenter"      (Swap movq @0x10165d)
//   objc  sel  ref @0x90a020 → __objc_methname "notificationWithName:object:"
//                                                                     (Swap movq @0x101682)
//   objc  sel  ref @0x90a028 → __objc_methname "postNotification:"   (Swap movq @0x10168e)
//   extern NSString* _ColorProcessingModeChangedNotification
//                   — literal-pool pointer @0x101678 (leaq _ColorProcessingModeChangedNotification(%rip),%rax)
//
// Notification id 0x1010 (Swap @0x10164c `movl $0x1010,%esi`) — raw provenance constant.
// Same code as OZOverrideFCPColorSpaceUndo::Swap; the two "scene/document color-mode"
// undos share the notification channel.
//
// Field offset 0x8/0xc on scene's OZDocument at Swap @0x1015ed (`movq 0x8(%rax),%r14`) —
// OZDocument's first payload slot at +0x8 is the OZScene pointer (matches the fbcode
// idiom: doc[0]=vtable, doc[0x8]=scene). The doc[0x2b8]/doc[0x588] fields (used at
// @0x101627 and @0x101645) are frontier: 0x2b8 is passed as an `OZChannelFolder*` to
// updateColorChannelsForWorkingGamut (i.e. the scene's channel-folder tree root), and
// 0x588 is the "notification-posting doc-child" (matches OZOverrideFCPColorSpaceUndo's
// use of `movq 0x0(%r14),%rdi` there; here Ozone uses `movq 0x588(%r14),%rdi` instead —
// i.e. it posts on a sub-object at +0x588 of the SCENE, not the doc itself).
//
// FRONTIERS (undecoded — kept as throwing stubs):
//   • OZApplication (theApp singleton + getCurrentDoc)
//   • OZScene::getRawWorkingGamut / dynamicRangeTrackingEnabled /
//              setRawWorkingGamut / setDynamicRangeTrackingEnabled /
//              updateColorChannelsForWorkingGamut
//   • OZDocument::postNotification
//   • Objective-C runtime (NSNotificationCenter defaultCenter →
//     [NSNotification notificationWithName:object:] → [center postNotification:])
//   • operator delete
//
// Sibling family template followed: OZOverrideFCPColorSpaceUndo.ts (Ozone @0x1016c0..
// 0x1017b0) — identical vtable ABI, identical Swap-with-notification pattern (the two
// diverge only in payload count/type and the addition of an ObjC notification post
// alongside the OZDocument::postNotification call).

/**
 * Opaque OZScene handle. Not yet ported as a first-class class here — kept as an
 * interface so the frontier stubs can consume it without inventing shape.
 * `Scene::getRawWorkingGamut()` returns a `PCWorkingGamutValue` (a 32-bit enum) and
 * `dynamicRangeTrackingEnabled()` returns a bool.
 */
export interface OZSceneHandle {
  readonly __ozScene: true;
}

/**
 * Opaque OZDocument handle. In Swap() we only read `doc[+0x8]` (its scene pointer) and
 * `doc[+0x588]` (its notification-posting child) — both stay behind the frontier.
 */
export interface OZDocumentHandle {
  readonly __ozDocument: true;
}

/**
 * PCWorkingGamutValue — 32-bit enum (movl %eax,0x8(%r14) @0x10157f). No enumerators are
 * baked into this file; treated as an opaque u32 so we don't invent values.
 */
export type PCWorkingGamutValue = number;

/**
 * OZApplication global (`_theApp` @Ozone via `leaq _theApp(%rip),%rax ; movq (%rax),%rdi`
 * at Swap @0x1015de/@0x1015e5) followed by `callq __ZN13OZApplication13getCurrentDocEv`
 * at @0x1015e8. Frontier-stubbed.
 */
export function ozGetTheApp_getCurrentDoc(): OZDocumentHandle | null {
  // raise: _theApp / OZApplication::getCurrentDoc() @ __ZN13OZApplication13getCurrentDocEv @0x1015e8
  throw new Error(
    "OZApplication::getCurrentDoc frontier @Ozone 0x1015e8 not yet ported",
  );
}

/**
 * OZDocument -> OZScene pointer read at `movq 0x8(%rax),%r14` (Swap @0x1015ed).
 * i.e. doc[+0x8] is the current scene.
 */
export function ozDocument_getScene(_doc: OZDocumentHandle): OZSceneHandle | null {
  // raise: OZDocument +0x8 field read @Ozone 0x1015ed (doc layout not decoded)
  throw new Error(
    "OZDocument scene-slot (+0x8) read frontier @Ozone 0x1015ed not yet ported",
  );
}

/**
 * OZDocument -> notification-posting child read at `movq 0x588(%r14),%rdi` (Swap @0x101645).
 * Since %r14 is the SCENE at that point (not the doc), 0x588 is a scene field —
 * likely the scene's owning "document-view child" that surfaces
 * `postNotification(unsigned int)`. Frontier-stubbed.
 */
export function ozScene_getNotificationTarget(
  _scene: OZSceneHandle,
): OZDocumentHandle {
  // raise: OZScene +0x588 field read @Ozone 0x101645
  throw new Error(
    "OZScene notification-target-slot (+0x588) read frontier @Ozone 0x101645 not yet ported",
  );
}

/** OZScene::getRawWorkingGamut() const — frontier @0x10157a / @0x10153a / @0x1015fd. */
export function ozScene_getRawWorkingGamut(
  _scene: OZSceneHandle,
): PCWorkingGamutValue {
  // raise: OZScene::getRawWorkingGamut @ __ZNK7OZScene18getRawWorkingGamutEv
  throw new Error(
    "OZScene::getRawWorkingGamut frontier @Ozone 0x10157a not yet ported",
  );
}

/** OZScene::dynamicRangeTrackingEnabled() const — frontier @0x101586 / @0x101546 / @0x101608. */
export function ozScene_dynamicRangeTrackingEnabled(
  _scene: OZSceneHandle,
): boolean {
  // raise: OZScene::dynamicRangeTrackingEnabled @ __ZNK7OZScene27dynamicRangeTrackingEnabledEv
  throw new Error(
    "OZScene::dynamicRangeTrackingEnabled frontier @Ozone 0x101586 not yet ported",
  );
}

/** OZScene::setRawWorkingGamut(PCWorkingGamutValue) — frontier @0x101616. */
export function ozScene_setRawWorkingGamut(
  _scene: OZSceneHandle,
  _v: PCWorkingGamutValue,
): void {
  // raise: OZScene::setRawWorkingGamut @ __ZN7OZScene18setRawWorkingGamutE19PCWorkingGamutValue
  throw new Error(
    "OZScene::setRawWorkingGamut frontier @Ozone 0x101616 not yet ported",
  );
}

/** OZScene::setDynamicRangeTrackingEnabled(bool) — frontier @0x101622. */
export function ozScene_setDynamicRangeTrackingEnabled(
  _scene: OZSceneHandle,
  _v: boolean,
): void {
  // raise: OZScene::setDynamicRangeTrackingEnabled @ __ZN7OZScene30setDynamicRangeTrackingEnabledEb
  throw new Error(
    "OZScene::setDynamicRangeTrackingEnabled frontier @Ozone 0x101622 not yet ported",
  );
}

/**
 * OZScene::updateColorChannelsForWorkingGamut(PCWorkingGamutValue, bool, OZChannelFolder*)
 *   — frontier @0x101638. The third arg is `scene + 0x2b8` (leaq 0x2b8(%r14),%rcx
 *   @0x101627) — i.e. the scene's channel-folder root at fixed offset 0x2b8, passed
 *   by pointer. Represented here as an opaque handle.
 */
export interface OZChannelFolderHandle {
  readonly __ozChannelFolder: true;
}
export function ozScene_getChannelFolderAt0x2b8(
  _scene: OZSceneHandle,
): OZChannelFolderHandle {
  // raise: OZScene +0x2b8 field-of-address (leaq) @Ozone 0x101627
  throw new Error(
    "OZScene channel-folder-slot (+0x2b8) address-of frontier @Ozone 0x101627 not yet ported",
  );
}
export function ozScene_updateColorChannelsForWorkingGamut(
  _scene: OZSceneHandle,
  _gamut: PCWorkingGamutValue,
  _dr: boolean,
  _folder: OZChannelFolderHandle,
): void {
  // raise: OZScene::updateColorChannelsForWorkingGamut @
  //   __ZN7OZScene34updateColorChannelsForWorkingGamutE19PCWorkingGamutValuebP15OZChannelFolder
  throw new Error(
    "OZScene::updateColorChannelsForWorkingGamut frontier @Ozone 0x101638 not yet ported",
  );
}

/** OZDocument::postNotification(unsigned int) — frontier @0x101651. */
export function ozDocument_postNotification(
  _target: OZDocumentHandle,
  _notif: number,
): void {
  // raise: OZDocument::postNotification @ __ZN10OZDocument16postNotificationEj
  throw new Error(
    "OZDocument::postNotification frontier @Ozone 0x101651 not yet ported",
  );
}

/**
 * Objective-C runtime frontier — three msgSend calls in Swap()'s tail:
 *   1. `id center = [NSNotificationCenter defaultCenter]`
 *   2. `NSNotification* n = [NSNotification notificationWithName:_ColorProcessingModeChangedNotification object:nil]`
 *   3. tail-call: `[center postNotification:n]`
 *
 * Selectors resolved via __objc_selrefs → __objc_methname on the x86_64 slice:
 *   sel @0x908f18 -> "defaultCenter"
 *   sel @0x90a020 -> "notificationWithName:object:"
 *   sel @0x90a028 -> "postNotification:"
 * NS classes at @0x8205c0 (NSNotificationCenter) and @0x8205b8 (NSNotification).
 * `_ColorProcessingModeChangedNotification` is an extern NSString* symbol.
 */
export function objc_postColorProcessingModeChangedNotification(): void {
  // raise: three-msgSend Cocoa post — decoded at Swap @0x101656..@0x10169b
  //   [[NSNotificationCenter defaultCenter]
  //     postNotification:[NSNotification
  //         notificationWithName:_ColorProcessingModeChangedNotification
  //                       object:nil]]
  throw new Error(
    "Cocoa NSNotificationCenter postNotification frontier @Ozone 0x101656..0x10169b not yet ported",
  );
}

/**
 * OZDocument-post-notification code used by Swap() (@0x10164c `movl $0x1010,%esi`).
 * Raw provenance constant recovered directly from the disassembly — not invented.
 * Same code posted by OZOverrideFCPColorSpaceUndo::Swap; the two "scene/document
 * color-mode" undos share the notification channel.
 */
export const NOTIF_SCENE_GAMUT_CHANGED = 0x1010;

export class OZSceneGamutUndo {
  /** Installed vtable pointer (Ozone @0x83d600). Base = 0x83d5f0. */
  static readonly INSTALLED_VPTR = 0x83d600;
  /** vtable base (Ozone @0x83d5f0). */
  static readonly VTABLE_BASE = 0x83d5f0;

  /** +0x00 vtable pointer — installed by the ctor to INSTALLED_VPTR. */
  vptr: number = OZSceneGamutUndo.INSTALLED_VPTR;

  /**
   * +0x08 (u32). PCWorkingGamutValue captured from `scene->getRawWorkingGamut()` at
   * construction time, swapped with the live scene by Swap().
   * `movl %eax,0x8(%r14)` @0x10157f / @0x10153f.
   */
  private savedGamut: PCWorkingGamutValue = 0;

  /**
   * +0x0c (u8/bool). Dynamic-range-tracking flag captured from
   * `scene->dynamicRangeTrackingEnabled()` at construction time, swapped by Swap().
   * `movb %al,0xc(%r14)` @0x10158b / @0x10154b.
   */
  private savedDR: boolean = false;

  /**
   * OZSceneGamutUndo::OZSceneGamutUndo(OZScene const*)
   *
   * C1 body @0x101560..0x101593 (identical structure to C2 @0x101520..0x101553 modulo
   * the RIP delta on the vtable leaq — C1 uses `leaq 0x73c08c(%rip),%rax` from
   * instruction end 0x101574, C2 uses `leaq 0x73c0cc(%rip),%rax` from end 0x101534;
   * both resolve to the same vtable+0x10 = 0x83d600):
   *
   *   0x101560: pushq %rbp ; movq %rsp,%rbp ; pushq %r14 ; pushq %rbx     # prologue
   *   0x101567: movq %rsi,%rbx                                             # rbx = scene
   *   0x10156a: movq %rdi,%r14                                             # r14 = this
   *   0x10156d: leaq 0x73c08c(%rip),%rax   # rax = &vtable+0x10 = 0x83d600
   *   0x101574: movq %rax,(%rdi)           # this->vptr = INSTALLED_VPTR
   *   0x101577: movq %rsi,%rdi             # rdi = scene
   *   0x10157a: callq __ZNK7OZScene18getRawWorkingGamutEv   # rax = scene->getRawWorkingGamut()
   *   0x10157f: movl %eax,0x8(%r14)                          # this->savedGamut = rax
   *   0x101583: movq %rbx,%rdi                               # rdi = scene
   *   0x101586: callq __ZNK7OZScene27dynamicRangeTrackingEnabledEv   # rax = scene->dynamicRangeTrackingEnabled()
   *   0x10158b: movb %al,0xc(%r14)                           # this->savedDR = al
   *   0x10158f..0x101593: pop %rbx ; pop %r14 ; pop %rbp ; retq
   */
  constructor(scene: OZSceneHandle) {
    // @0x10157a / @0x10157f
    this.savedGamut = ozScene_getRawWorkingGamut(scene);
    // @0x101586 / @0x10158b
    this.savedDR = ozScene_dynamicRangeTrackingEnabled(scene);
  }

  /**
   * OZSceneGamutUndo::~OZSceneGamutUndo() (D1/D2 non-deleting)
   *
   * D2 body @0x1015a0..0x1015a5:  pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq
   * D1 body @0x1015b0..0x1015b5:  identical — pure return
   *
   * The class owns no heap-allocated payload (bool + u32 only), so both non-deleting
   * destructors are empty. TS models this as an idempotent no-op.
   */
  destroy(): void {
    // no-op — mirrors @0x1015a0 / @0x1015b0 empty bodies.
  }

  /**
   * OZSceneGamutUndo::~OZSceneGamutUndo() (D0 deleting)
   *
   * D0 body @0x1015c0..0x1015c5:
   *   pushq %rbp ; movq %rsp,%rbp ; popq %rbp
   *   jmp stub 0x6dfc36                    # tail-call operator delete(void*) [__ZdlPv]
   *
   * i.e. the deleting dtor is a bare wrapper that just frees the object. In TS this
   * is a no-op (garbage-collected) beyond calling destroy().
   */
  deleteAndFree(): void {
    this.destroy();
    // @0x1015c5: tail-call operator delete via stub 0x6dfc36 — no-op in GC land.
  }

  /**
   * OZSceneGamutUndo::Swap()
   *
   * Body @0x1015d0..0x1016b0:
   *   0x1015d0: pushq %rbp ; movq %rsp,%rbp ; pushq %r15/r14/r12/rbx        # prologue
   *   0x1015db: movq %rdi,%rbx                                               # rbx = this
   *   0x1015de: leaq _theApp(%rip),%rax
   *   0x1015e5: movq (%rax),%rdi                                             # rdi = _theApp
   *   0x1015e8: callq OZApplication::getCurrentDoc()                         # rax = doc
   *   0x1015ed: movq 0x8(%rax),%r14                                          # r14 = doc[+0x8] (scene ptr)
   *   0x1015f1: testq %r14,%r14
   *   0x1015f4: je    0x1016a8                                               # if (!scene) -> bail
   *   0x1015fa: movq %r14,%rdi
   *   0x1015fd: callq OZScene::getRawWorkingGamut()                          # r15d = curGamut
   *   0x101602: movl %eax,%r15d
   *   0x101605: movq %r14,%rdi
   *   0x101608: callq OZScene::dynamicRangeTrackingEnabled()                 # r12b = curDR
   *   0x10160d: movl %eax,%r12d
   *   0x101610: movl 0x8(%rbx),%esi                                          # esi = this->savedGamut
   *   0x101613: movq %r14,%rdi
   *   0x101616: callq OZScene::setRawWorkingGamut(PCWorkingGamutValue)       # scene.set(saved)
   *   0x10161b: movzbl 0xc(%rbx),%esi                                        # esi = (u8)this->savedDR
   *   0x10161f: movq %r14,%rdi
   *   0x101622: callq OZScene::setDynamicRangeTrackingEnabled(bool)          # scene.set(saved)
   *   0x101627: leaq 0x2b8(%r14),%rcx                                        # rcx = &scene[+0x2b8]  (OZChannelFolder*)
   *   0x10162e: movl 0x8(%rbx),%esi                                          # esi = this->savedGamut  (post-swap == new-live)
   *   0x101631: movzbl 0xc(%rbx),%edx                                        # edx = (u8)this->savedDR (post-swap == new-live)
   *   0x101635: movq %r14,%rdi
   *   0x101638: callq OZScene::updateColorChannelsForWorkingGamut(gamut,bool,folder)
   *   0x10163d: movl %r15d,0x8(%rbx)                                         # this->savedGamut = prevGamut
   *   0x101641: movb %r12b,0xc(%rbx)                                         # this->savedDR    = prevDR
   *   0x101645: movq 0x588(%r14),%rdi                                        # rdi = scene[+0x588] (notif target)
   *   0x10164c: movl $0x1010,%esi
   *   0x101651: callq OZDocument::postNotification(0x1010)
   *
   *   0x101656: movq 0x71ef63(%rip),%rdi  # rdi = _OBJC_CLASS_$_NSNotificationCenter @0x8205c0
   *   0x10165d: movq 0x8078b4(%rip),%rsi  # rsi = @sel(defaultCenter)       [__objc_selrefs @0x908f18]
   *   0x101664: movq 0x7249bd(%rip),%r14  # r14 = _objc_msgSend fn ptr      @0x826028
   *   0x10166b: callq *%r14                                                  # rax = [NSNotificationCenter defaultCenter]
   *   0x10166e: movq %rax,%rbx                                               # rbx = center
   *   0x101671: movq 0x71ef40(%rip),%rdi  # rdi = _OBJC_CLASS_$_NSNotification @0x8205b8
   *   0x101678: leaq _ColorProcessingModeChangedNotification(%rip),%rax
   *   0x10167f: movq (%rax),%rdx                                             # rdx = *_CPMCN  (NSString*)
   *   0x101682: movq 0x808997(%rip),%rsi  # rsi = @sel(notificationWithName:object:)  [selref @0x90a020]
   *   0x101689: xorl %ecx,%ecx                                               # rcx = nil (4th arg -> object:)
   *   0x10168b: callq *%r14                                                  # rax = [NSNotification notificationWithName:.. object:nil]
   *   0x10168e: movq 0x808993(%rip),%rsi  # rsi = @sel(postNotification:) [selref @0x90a028]
   *   0x101695: movq %rbx,%rdi                                               # rdi = center
   *   0x101698: movq %rax,%rdx                                               # rdx = notification
   *   0x10169b: movq %r14,%rax                                               # rax = objc_msgSend fn ptr
   *   0x10169e..0x1016a6: pop %rbx/r12/r14/r15/rbp ; jmpq *%rax               # tail-call [center postNotification:notif]
   *
   *   0x1016a8..0x1016b0: (null-scene bail-out) pop %rbx/r12/r14/r15/rbp ; retq
   *
   * Semantics: atomically SWAP the current scene's `(gamut, drTracking)` pair with
   * this->saved{Gamut,DR}, re-derive color channels for the new gamut, then post
   * the "color-processing-mode-changed" notification (both via
   * OZDocument::postNotification(0x1010) on scene[+0x588] AND via the Cocoa
   * NSNotificationCenter path). If there is no current document/scene, do nothing.
   *
   * Note the asm calls updateColorChannelsForWorkingGamut with `this->savedGamut`
   * and `this->savedDR` AFTER `setRawWorkingGamut`/`setDynamicRangeTrackingEnabled`
   * but BEFORE the swap-back writes at @0x10163d/@0x101641 — so the args passed to
   * updateColorChannelsForWorkingGamut are still the "originally-saved" values (the
   * NEW live values on the scene at that point). We preserve that ordering exactly.
   */
  Swap(): void {
    // @0x1015e8: fetch the app-global "current document".
    const doc = ozGetTheApp_getCurrentDoc();
    // @0x1015ed/@0x1015f1/@0x1015f4: read scene = doc[+0x8]; if null, early-return.
    if (doc === null) return;
    const scene = ozDocument_getScene(doc);
    if (scene === null) return;

    // @0x1015fd/@0x101602: capture the scene's current gamut.
    const prevGamut = ozScene_getRawWorkingGamut(scene);
    // @0x101608/@0x10160d: capture the scene's current DR flag.
    const prevDR = ozScene_dynamicRangeTrackingEnabled(scene);

    // @0x101610/@0x101616: write this->savedGamut into the scene.
    ozScene_setRawWorkingGamut(scene, this.savedGamut);
    // @0x10161b/@0x101622: write this->savedDR into the scene.
    ozScene_setDynamicRangeTrackingEnabled(scene, this.savedDR);

    // @0x101627/@0x101638: re-derive scene's color channels for the newly-applied
    // gamut. `this->savedGamut` / `this->savedDR` are still the pre-swap values
    // here (matches the ordering in the asm — writes-back happen AFTER this call).
    const folder = ozScene_getChannelFolderAt0x2b8(scene);
    ozScene_updateColorChannelsForWorkingGamut(
      scene,
      this.savedGamut,
      this.savedDR,
      folder,
    );

    // @0x10163d/@0x101641: complete the swap — store the previous scene values into
    // this->saved* so a subsequent Swap() reverses the change.
    this.savedGamut = prevGamut;
    this.savedDR = prevDR;

    // @0x101645/@0x10164c/@0x101651: post int notification 0x1010 on scene[+0x588].
    const notifTarget = ozScene_getNotificationTarget(scene);
    ozDocument_postNotification(notifTarget, NOTIF_SCENE_GAMUT_CHANGED);

    // @0x101656..@0x1016a6: three-msgSend Cocoa post
    //   [[NSNotificationCenter defaultCenter]
    //       postNotification:[NSNotification
    //           notificationWithName:_ColorProcessingModeChangedNotification
    //                         object:nil]]
    objc_postColorProcessingModeChangedNotification();
  }
}
