// OZDocument.ts — raw transcription of the FCP `OZDocument` class.
//
// This is the SHARED SURFACE the OZ*Undo family reaches through after
// `OZApplication::getCurrentDoc()` returns. Every Undo::Swap() then:
//   1) reads `doc[+0x08]` (the OZScene* — decoded here as a struct offset),
//   2) mutates scene state,
//   3) calls `doc->postNotification(<u32 id>)` — decoded here as a forwarder to
//      OZNotificationManager (@doc+0x98).
//
// Ozone x86_64 addresses in this file:
//   __ZN10OZDocumentC2Eb                          @0x465d0  (C2)
//   __ZN10OZDocumentC1Eb                          @0x46a60  (C1 — thunk to C2)
//   __ZN10OZDocumentC2ERKS_b                      @0x46a70  (copy-ctor C2)
//   __ZN10OZDocumentC1ERKS_b                      @0x47230  (copy-ctor C1)
//   __ZN10OZDocument9copySceneEP7OZScene          @0x46eb0
//   __ZN10OZDocumentD2Ev                          @0x47240
//   __ZN10OZDocumentD1Ev                          @0x474c0
//   __ZN10OZDocumentD0Ev                          @0x474d0
//   __ZN10OZDocument10resetSceneEv                @0x474f0
//   __ZN10OZDocument16addDefaultCameraEv          @0x475a0
//   __ZN10OZDocument32adjustCanvasStateFor360ProjectionEv @0x476f0
//   __ZN10OZDocument19getProjectPanelStateEv      @0x47770
//   __ZN10OZDocument15addObjCObserverEPvl         @0x477d0
//   __ZN10OZDocument14addCPPObserverEP13OZCPPObserverl @0x477f0
//   __ZN10OZDocument17removeCPPObserverEP13OZCPPObserver @0x47810
//   __ZN10OZDocument18removeObjCObserverEPv      @0x47830
//   __ZN10OZDocument14hasCPPObserverEP13OZCPPObserver    @0x47850
//   __ZN10OZDocument15hasObjCObserverEPv         @0x47870
//   __ZN10OZDocument14ignoreObserverEPvbj         @0x47890
//   __ZN10OZDocument18ignoreObserverOnceEPvj      @0x478b0
//   __ZN10OZDocument20unignoreObserverOnceEPvj    @0x478d0
//   __ZN10OZDocument40setIsProcessingNotificationsAutomaticallyEb @0x478f0
//   __ZNK10OZDocument21isNotificationPendingEj    @0x47910
//   __ZN10OZDocument18pauseNotificationsEv        @0x47930
//   __ZN10OZDocument19resumeNotificationsEv       @0x47950
//   __ZN10OZDocument27startCaptureModifiedChannelsERK8PCString @0x47970
//   __ZN10OZDocument25endCaptureModifiedChannelsEv @0x479f0
//   __ZN10OZDocument18willModifyChannelEPK13OZChannelBasej @0x47a60
//   __ZN10OZDocument28markFactoriesForSerializationER22PCSerializerWriteStreamb @0x47c70
//   __ZN10OZDocument11writeHeaderER22PCSerializerWriteStreamb                  @0x47c90
//   __ZN10OZDocument9writeBodyER22PCSerializerWriteStreambbb                   @0x47ca0
//   __ZN10OZDocument4saveERK5PCURLS2_             @0x48300
//   __ZN10OZDocument10parseBeginER21PCSerializerReadStream @0x48810
//   __ZN10OZDocument8parseEndER21PCSerializerReadStream    @0x48900
//   __ZN10OZDocument19makeFCPv1CorrectionsEv       @0x48e60
//   __ZN10OZDocument19makeFCPv2CorrectionsEv       @0x49a60
//   __ZN10OZDocument19makeFCPv3CorrectionsEv       @0x49f80
//   __ZN10OZDocument12parseElementER21PCSerializerReadStreamR15PCStreamElement @0x4a1c0
//   __ZN10OZDocument25checkVersionForReadStreamER21PCSerializerReadStream       @0x4a730
//   __ZN10OZDocument22correct4CornerChannelER17OZChannelPositiondd              @0x4ab20
//   __ZN10OZDocument26setIsTemplateDesignedFor4kEb   @0x4add0   ← CORE (this file)
//   __ZNK10OZDocument26getIsTemplateDesignedFor4kEv  @0x4adf0   ← CORE
//   __ZN10OZDocument24setOverrideFCPColorSpaceEb     @0x4ae00   ← CORE (used by OZOverrideFCPColorSpaceUndo)
//   __ZNK10OZDocument24getOverrideFCPColorSpaceEv    @0x4ae20   ← CORE
//   __ZN10OZDocument15setIsEditLockedEb              @0x4ae30   ← CORE
//   __ZNK10OZDocument12isEditLockedEv                @0x4ae50   ← CORE
//   __ZN10OZDocument4openERK5PCURL                @0x4ae60
//   __ZN10OZDocument27shouldCollectMediaByDefaultEv    @0x4b090
//   __ZN10OZDocument18isDepthOfFieldUsedEv        @0x4b0b0
//   __ZN10OZDocument16postNotificationEj          @0x46970    ← CORE (this file)
//   __ZN10OZDocument9addToUndoEP12OZUndoActionRK8PCString @0xfc920
//   __ZN10OZDocument23clearTemporaryUndoItemsEv   @0xfca60
//   __ZN10OZDocument14beginUndoGroupERK8PCString  @0xfcac0
//   __ZN10OZDocument12endUndoGroupEv              @0xfcbf0
//   __ZN10OZDocument9isUndoingEv                  @0xfcc30
//   __ZN10OZDocument9isRedoingEv                  @0xfcc70
//   __ZN10OZDocument10setIsReadyEb                @0xfccb0
//   __ZN10OZDocument18getUndoDescriptionEv        @0xfccc0
//   __ZN10OZDocument18setUndoDescriptionERK8PCString @0xfcd10
//   __ZN10OZDocument11importFilesEj               @0xfcd60
//   __ZN10OZDocument15getAllSequencesERNSt3__16vectorI8PCStringNS0_9allocatorIS1_EEEE @0xfd250
//   __ZN10OZDocument6importERNSt3__16vectorI8PCStringNS0_9allocatorIS1_EEEEP7OZGroupRK9PCVector2IfEbj6CMTimeP11OZSceneNode @0xfdb50
//   __ZNK10OZDocument11getFilenameEv              @0xfebc0
//   __ZNK10OZDocument32getContainingFolderAsSystemStringEv @0xfec10
//   __ZN10OZDocument14resetFilenameEv             @0xfec60
//   __ZN10OZDocument15localizeContentERK5PCURL    @0xfec80
//   __ZN10OZDocument22checkForSupportedConfigEv   @0xfef90
//   __ZN10OZDocument25checkEditLockForReadStreamER21PCSerializerReadStream @0xff100
//   __ZN10OZDocument8postLoadEv                   @0xff270
//   __ZNK10OZDocument14isBundleFormatEv           @0xff6a0    ← CORE (this file)
//   __ZN10OZDocument15supportsFCPiPadEv           @0xff6b0    ← CORE (this file)
//   __ZN10OZDocument18setSupportsFCPiPadEb        @0xff6c0    ← CORE (this file)
//
// ============================================================================
//  STRUCT LAYOUT — recovered from C2 @0x465d0..0x467f2 (partial; see below)
// ============================================================================
//  +0x00   vtable ptr           installed at 0x465e6/0x465ed: leaq 0x7ec063(%rip),%rax
//                                → resolves to VA 0x832660 (vtable body for OZDocument).
//                                Also serves as base class of `OZChannelListener`
//                                (see D0/D1 dispatch — see wxOZUndoAction family).
//                                Frontier — the observer chain (add/removeCPPObserver
//                                etc.) walks this vtable.
//  +0x08   scene : OZScene*     allocated `operator new(0x718)` @0x46727 and
//                                constructed with __ZN7OZSceneC1EP10OZDocument
//                                @0x4673a, stored @0x4673f (`movq %r12,0x8(%r14)`).
//                                CRITICAL: this is the slot OZSceneGamutUndo,
//                                OZSceneRangeUndo, OZSceneSettingsUndo,
//                                OZPublishSettingsUndo and the OZChannelUndo family
//                                read at `movq 0x8(%rax),%r14` after
//                                getCurrentDoc().
//  +0x10   name : PCString      default-constructed @0x465f7 (SSO layout).
//  +0x18   headList : {prev,next} — intrusive-list head; @0x46600/@0x46604 install
//                                the sentinel self-pointers (`movq %r15,0x18` and
//                                `movq %r15,0x20`).
//  +0x28   (2×u64)              zeroed by movups @0x4660f.
//  +0x38   (2×u64)              zeroed by movups @0x46614.
//  +0x48   filename : PCString  default-constructed @0x46620.
//  +0x50   (u32)                zeroed @0x46625 `movl $0x0,0x50(%r14)`.
//  +0x54   (u16)                zeroed @0x4662d.
//  +0x58   (u32)                zeroed @0x46634.
//  +0x5c   (u8)                 zeroed @0x4663c.
//  +0x60   modifiedChanFlag : u32  set to 3 @0x46641 `movl $0x3,0x60(%r14)`.
//  +0x68   captureName : PCString  default-constructed @0x46655.
//  +0x70   undoDescription : PCString  default-constructed @0x46662.
//  +0x78   flags : u32          zeroed @0x46667 `movl $0x0,0x78(%r14)`.
//                                BITFIELD (recovered from the four accessors):
//                                  bit 0  (0x01) — isTemplateDesignedFor4k
//                                  bit 2  (0x04) — overrideFCPColorSpace
//                                  bit 3  (0x08) — isEditLocked
//                                Other bits (0x02, 0x10..) unknown in this pass —
//                                DO NOT touch bits we haven't decoded.
//  +0x80   (PCString? — "" literal init)  __ZN8PCStringC1EPKc @0x46681 with the
//                                empty string literal at 0x7a090b(%rip). Layout
//                                as PCString.
//  +0x88   (u64)                zeroed @0x46686.
//  +0x90   (u8)                 zeroed @0x46691.
//  +0x98   notificationMgr : OZNotificationManager*   heap-alloced 0x90 bytes
//                                @0x46747, constructed with
//                                __ZN21OZNotificationManagerC1EP10OZDocumentb
//                                @0x4675f, stored @0x4676b `movq %rbx,(%rax)`
//                                (rax = &doc[+0x98]). NULL if the ctor's `bool`
//                                arg is false (branch @0x46745 skips creation).
//                                → postNotification(u32) reads this slot and
//                                  forwards. If null, the call is a no-op.
//  +0xa0   (u64)                zeroed by movups @0x466a4 (paired with +0x98).
//  +0xa8   (u8)                 zeroed @0x466ac.
//  +0xd0   canvasState : OZCanvasState*   heap-alloced @0x467f2 (0x10 bytes) and
//                                stored @0x46807. Created only if _theApp+0x50==0
//                                (branch @0x4679c) — a "no-UI mode" gate.
//  +0xd8   (u64)                zeroed by movups @0x46786 (paired with +0xe0).
//  +0xe0   timelineState : OZTimelineState*  heap-alloced @0x4679e / stored @0x467b3.
//  +0xe8   curveEditorState : OZCurveEditorState*   heap-alloced @0x467ba /
//                                stored @0x467cf.
//  +0xf0   inspectorState : OZInspectorState*   heap-alloced @0x467d6 /
//                                stored @0x467eb.
//  +0xf8   (u8)                 zeroed @0x46699.
//  +0xfc   (u64 = 0xf00000005)  written @0x466b4-@0x466be `movabsq $0xf00000005`.
//                                Purpose not decoded — likely a version/format
//                                pair (u32 top=0xf, u32 bot=0x5).
//  +0x108  (PCString)           default-constructed @0x466cc.
//  +0x110  (u8)                 zeroed @0x466d4.
//  +0x118  (2×u64)              zeroed by movups @0x466e9.
//  +0x128  (2×u64)              zeroed by movups @0x466f1.
//  +0x138  (u32)                zeroed @0x466f9.
//  +0x13c  format : u32         Not zeroed here — set elsewhere. isBundleFormat()
//                                (@0xff6a0) returns (this->format == 1).
//  +0x140  supportsFCPiPad : u8 written by setSupportsFCPiPad @0xff6c4, read by
//                                supportsFCPiPad @0xff6b4. Also zeroed to 0
//                                by C2 `movw $0x0,0x140(%r14)` @0x466dc (16-bit
//                                store — clears +0x140 AND +0x141 together).
//  +0x148  transientDocId : u64  atomic post-increment of
//                                __ZN10OZDocument24_nextTransientDocumentIDE
//                                @0x46717 → stored @0x46720.
//  +0x2b8  channelFolder root — used by OZSceneGamutUndo Swap as an argument to
//                                updateColorChannelsForWorkingGamut. NB: in
//                                OZSceneGamutUndo the r14 IS the SCENE at that
//                                point, not the doc — so this is a SCENE +0x2b8,
//                                NOT a doc offset. Documented in OZScene.ts.
//  +0x588  (undecoded)          used as `scene[+0x588]` (again in the SCENE, not
//                                the doc — see OZSceneGamutUndo). This offset
//                                is a SCENE slot, not a doc slot.
//
// The full sizeof extends beyond +0x148 (the ctor exits before touching later
// fields; more are set by parseBegin/open/postLoad — all frontier).
//
// ============================================================================
//  NOTIFICATION IDS emitted through OZDocument (raw provenance constants)
// ============================================================================
//  Seen in-call across the OZ*Undo family Swap()s and the OZDocument ctor:
//    0x0008 — used by OZDocumentTypeUndo/OZEditBoxUndo (see landed files)
//    0x0030 — posted by C2 @0x46776 right after the notification-manager is
//             constructed (bootstrap "document ready" tick).
//    0x0400 — OZMarkersUndo::Swap @Ozone 0x1008d0-0x10098b tail-call
//    0x1000 — OZLastModifiedChannelsUndo::Swap (see landed file)
//    0x1010 — OZOverrideFCPColorSpaceUndo::Swap @0x1017a1 /
//             OZSceneGamutUndo::Swap @0x101651
//  These are raw ints — the enum is defined elsewhere in Ozone
//  (frontier — kept as bare numeric constants exported below).

import { OZApplication, _theApp } from "./OZApplication";

// Re-export the doc-handle type so other Undo ports can import it from here
// as the canonical decode point.
export interface OZSceneHandle {
  readonly __ozScene: true;
}

/**
 * `OZNotificationManager` — heap-alloced 0x90-byte helper at OZDocument+0x98.
 * The only method decoded here is `postNotification(u32)`, called by
 * OZDocument::postNotification via a `jmp` tail-call at 0x46981.
 * Frontier for its ctor/dtor and observer wiring.
 */
export interface OZNotificationManagerHandle {
  readonly __ozNotificationManager: true;
  /** Forwarded target of OZDocument::postNotification (Ozone @0x46981). */
  postNotification(notif: number): void;
}

/**
 * Notification-id constants emitted by OZDocument::postNotification across the
 * OZ*Undo family. Recovered directly from the disassembly of each Undo's
 * Swap() (see file header) — these are the ONLY values we've observed in this
 * pass; the underlying enum has more members that are not decoded yet.
 */
export const NOTIF_DOCUMENT_READY = 0x30; // C2 @0x46776 (post-init bootstrap)
export const NOTIF_MARKERS_CHANGED = 0x400; // OZMarkersUndo::Swap @0x10098b
export const NOTIF_LAST_MODIFIED_CHANNELS_CHANGED = 0x1000; // OZLastModifiedChannelsUndo::Swap (per landed file)
export const NOTIF_COLOR_PROCESSING_MODE_CHANGED = 0x1010; // OZSceneGamutUndo::Swap @0x101651 & OZOverrideFCPColorSpaceUndo::Swap @0x1017a1
export const NOTIF_DOCUMENT_TYPE_CHANGED = 0x8; // OZDocumentTypeUndo (per landed file)

/**
 * Flag-word offsets/bits inside doc[+0x78] recovered from the getter/setter pairs.
 * Exposed so that other ports (e.g. serialization) can reason about the same
 * bitfield without inventing constants.
 */
export const OZ_DOCUMENT_FLAGS_OFFSET = 0x78;
export const OZ_DOCUMENT_FLAG_IS_TEMPLATE_DESIGNED_FOR_4K = 0x1; // bit 0
export const OZ_DOCUMENT_FLAG_OVERRIDE_FCP_COLOR_SPACE = 0x4; // bit 2
export const OZ_DOCUMENT_FLAG_IS_EDIT_LOCKED = 0x8; // bit 3

export class OZDocument {
  /**
   * +0x00 — vtable ptr. The C++ virtual dispatch is handled by TS class methods;
   * we preserve the observation of the address (`leaq 0x7ec063(%rip),%rax` @0x465e6
   * resolves to Ozone VA 0x832660 = OZDocument vtable body).
   */
  static readonly VTABLE_BODY_VA = 0x832660;

  /**
   * +0x08 — scene : OZScene*
   * Set by C2 @0x4673f. Read by every OZ*Undo Swap() via `movq 0x8(%rax),%r14`.
   * Nullable so that a partially-initialized/torn-down document can be modelled
   * without violating asm control flow (Swap()s early-return when this is 0).
   */
  scene: OZSceneHandle | null = null;

  /**
   * +0x60 — modifiedChanFlag : u32 (initial 3 @0x46641). Purpose partially
   * decoded (used by startCapture/endCapture — frontier here).
   */
  modifiedChanFlag: number = 3;

  /**
   * +0x78 — flags : u32. Bitfield containing (at least):
   *   bit 0  isTemplateDesignedFor4k
   *   bit 2  overrideFCPColorSpace
   *   bit 3  isEditLocked
   * We store the full u32 to preserve the observable "AND/OR back other bits"
   * behaviour when setters run (see setOverrideFCPColorSpace decode).
   */
  flags: number = 0;

  /**
   * +0x98 — notificationMgr : OZNotificationManager*
   * Constructed by C2 only when the `bool` ctor arg is true (branch @0x46745).
   * When null, postNotification() is a no-op (see 0x4697e branch).
   */
  notificationMgr: OZNotificationManagerHandle | null = null;

  /**
   * +0x13c — format : u32. `isBundleFormat` returns (format == 1). Not written
   * by the ctor path we decoded; set by parseBegin/open (frontier).
   */
  format: number = 0;

  /**
   * +0x140 — supportsFCPiPad : u8. Set by setSupportsFCPiPad @0xff6c4, read
   * by supportsFCPiPad @0xff6b4. Zeroed by the 16-bit store @0x466dc which
   * also clears +0x141.
   */
  supportsFCPiPadFlag: number = 0;

  /**
   * +0x148 — transientDocumentID : u64. Atomic post-increment of the
   * static `__ZN10OZDocument24_nextTransientDocumentIDE` @0x46717
   * (`lock xaddq %rax, _nextTransientDocumentID(%rip)` — starts at 1 per doc).
   */
  transientDocumentID: bigint = 0n;

  // ==========================================================================
  //  CORE — the shared surface required by every OZ*Undo Swap()
  // ==========================================================================

  /**
   * OZDocument::postNotification(unsigned int)  @0x46970
   *   __ZN10OZDocument16postNotificationEj
   *
   * Full disassembly (Ozone x86_64):
   *   0x46970: pushq %rbp ; movq %rsp,%rbp                            # prologue
   *   0x46974: movq 0x98(%rdi),%rdi                                    # rdi = this->notificationMgr
   *   0x4697b: testq %rdi,%rdi
   *   0x4697e: je    0x46986                                           # if null -> no-op
   *   0x46980: popq %rbp
   *   0x46981: jmp __ZN21OZNotificationManager16postNotificationEj     # tail-call
   *   0x46986: popq %rbp
   *   0x46987: retq
   *
   * Semantics: forward to the manager if present; drop silently otherwise.
   * The `unsigned int` payload is one of the NOTIF_* ids above.
   */
  postNotification(notif: number): void {
    // @0x46974: load this->notificationMgr.
    const mgr = this.notificationMgr;
    // @0x4697b-@0x4697e: null-guard.
    if (mgr === null) return;
    // @0x46981: tail-call OZNotificationManager::postNotification(u32).
    mgr.postNotification(notif);
  }

  /**
   * OZDocument::setOverrideFCPColorSpace(bool)  @0x4ae00
   *   __ZN10OZDocument24setOverrideFCPColorSpaceEb
   *
   *   0x4ae00: pushq %rbp ; movq %rsp,%rbp
   *   0x4ae04: movl  0x78(%rdi),%eax                                   # eax = flags
   *   0x4ae07: andl  $-0x5,%eax                                        # clear bit 2 (0x04)
   *   0x4ae0a: leal  (%rax,%rsi,4),%eax                                # eax += (bool * 4) — sets bit 2 from arg
   *   0x4ae0d: movl  %eax,0x78(%rdi)                                   # store back
   *
   * Preserves all other bits of the +0x78 flag word.
   */
  setOverrideFCPColorSpace(v: boolean): void {
    // @0x4ae04-@0x4ae0d
    const cleared = (this.flags & ~OZ_DOCUMENT_FLAG_OVERRIDE_FCP_COLOR_SPACE) >>> 0;
    // (v?1:0) * 4 == v?4:0
    this.flags = (cleared + (v ? OZ_DOCUMENT_FLAG_OVERRIDE_FCP_COLOR_SPACE : 0)) >>> 0;
  }

  /**
   * OZDocument::getOverrideFCPColorSpace() const  @0x4ae20
   *   __ZNK10OZDocument24getOverrideFCPColorSpaceEv
   *
   *   0x4ae24: movzbl 0x78(%rdi),%eax                                  # eax = (u8) flags
   *   0x4ae28: andb   $0x4,%al                                         # keep bit 2
   *   0x4ae2a: shrb   $0x2,%al                                         # shift into bit 0
   *   → returns (flags & 0x04) >> 2 as a bool.
   */
  getOverrideFCPColorSpace(): boolean {
    // @0x4ae24-@0x4ae2a
    return ((this.flags & OZ_DOCUMENT_FLAG_OVERRIDE_FCP_COLOR_SPACE) >>> 2) !== 0;
  }

  /**
   * OZDocument::setIsEditLocked(bool)  @0x4ae30
   *   __ZN10OZDocument15setIsEditLockedEb
   *
   *   0x4ae34: movl  0x78(%rdi),%eax
   *   0x4ae37: andl  $-0x9,%eax                                        # clear bit 3 (0x08)
   *   0x4ae3a: leal  (%rax,%rsi,8),%eax                                # add (bool * 8)
   *   0x4ae3d: movl  %eax,0x78(%rdi)
   */
  setIsEditLocked(v: boolean): void {
    // @0x4ae34-@0x4ae3d
    const cleared = (this.flags & ~OZ_DOCUMENT_FLAG_IS_EDIT_LOCKED) >>> 0;
    this.flags = (cleared + (v ? OZ_DOCUMENT_FLAG_IS_EDIT_LOCKED : 0)) >>> 0;
  }

  /**
   * OZDocument::isEditLocked() const  @0x4ae50
   *   __ZNK10OZDocument12isEditLockedEv
   *
   *   0x4ae54: movzbl 0x78(%rdi),%eax
   *   0x4ae58: andb   $0x8,%al
   *   0x4ae5a: shrb   $0x3,%al
   *   → (flags & 0x08) >> 3
   */
  isEditLocked(): boolean {
    // @0x4ae54-@0x4ae5a
    return ((this.flags & OZ_DOCUMENT_FLAG_IS_EDIT_LOCKED) >>> 3) !== 0;
  }

  /**
   * OZDocument::setIsTemplateDesignedFor4k(bool)  @0x4add0
   *   __ZN10OZDocument26setIsTemplateDesignedFor4kEb
   *
   *   0x4add4: movl  0x78(%rdi),%eax
   *   0x4add7: andl  $-0x2,%eax                                        # clear bit 0 (0x01)
   *   0x4adda: orl   %esi,%eax                                         # or in (bool & 0x01)
   *   0x4addc: movl  %eax,0x78(%rdi)
   */
  setIsTemplateDesignedFor4k(v: boolean): void {
    // @0x4add4-@0x4addc
    const cleared = (this.flags & ~OZ_DOCUMENT_FLAG_IS_TEMPLATE_DESIGNED_FOR_4K) >>> 0;
    this.flags = (cleared | (v ? OZ_DOCUMENT_FLAG_IS_TEMPLATE_DESIGNED_FOR_4K : 0)) >>> 0;
  }

  /**
   * OZDocument::getIsTemplateDesignedFor4k() const  @0x4adf0
   *   __ZNK10OZDocument26getIsTemplateDesignedFor4kEv
   *
   *   0x4adf4: movzbl 0x78(%rdi),%eax
   *   0x4adf8: andb   $0x1,%al
   *   → (flags & 0x01)
   */
  getIsTemplateDesignedFor4k(): boolean {
    // @0x4adf4-@0x4adf8
    return (this.flags & OZ_DOCUMENT_FLAG_IS_TEMPLATE_DESIGNED_FOR_4K) !== 0;
  }

  /**
   * OZDocument::isBundleFormat() const  @0xff6a0
   *   __ZNK10OZDocument14isBundleFormatEv
   *
   *   0xff6a4: cmpl $0x1,0x13c(%rdi)
   *   0xff6ab: sete %al
   *   → returns (this->format == 1).
   */
  isBundleFormat(): boolean {
    // @0xff6a4-@0xff6ab
    return this.format === 1;
  }

  /**
   * OZDocument::supportsFCPiPad()  @0xff6b0
   *   __ZN10OZDocument15supportsFCPiPadEv
   *
   *   0xff6b4: movzbl 0x140(%rdi),%eax
   *   → returns *(u8*)(this + 0x140) — bool.
   */
  supportsFCPiPad(): boolean {
    // @0xff6b4
    return this.supportsFCPiPadFlag !== 0;
  }

  /**
   * OZDocument::setSupportsFCPiPad(bool)  @0xff6c0
   *   __ZN10OZDocument18setSupportsFCPiPadEb
   *
   *   0xff6c4: movb %sil,0x140(%rdi)
   *   → *(u8*)(this + 0x140) = (u8)arg.
   */
  setSupportsFCPiPad(v: boolean): void {
    // @0xff6c4
    this.supportsFCPiPadFlag = v ? 1 : 0;
  }

  // ==========================================================================
  //  FRONTIER — all other 60+ methods kept as throwing stubs.
  // ==========================================================================

  /** OZDocument::OZDocument(bool) C2 @0x465d0 / C1 @0x46a60 — heavy; frontier. */
  static construct(_hasNotifMgr: boolean): OZDocument {
    throw new Error(
      "OZDocument::OZDocument(bool) unimplemented — @Ozone 0x465d0 (C2) / 0x46a60 (C1) — " +
        "requires OZScene ctor @Ozone 0x4673a, OZNotificationManager ctor @Ozone 0x4675f, " +
        "OZTimelineState/OZCurveEditorState/OZInspectorState/OZCanvasState allocations, " +
        "and _theApp+0x50 no-UI-mode gate @Ozone 0x46798.",
    );
  }

  /** OZDocument::OZDocument(OZDocument const&, bool)  C2 @0x46a70 / C1 @0x47230 — frontier. */
  static constructCopy(_other: OZDocument, _flag: boolean): OZDocument {
    throw new Error("OZDocument copy-ctor unimplemented — @Ozone 0x46a70 (C2) / 0x47230 (C1)");
  }

  /** OZDocument::copyScene(OZScene*)  @0x46eb0 — frontier. */
  copyScene(_scene: OZSceneHandle): void {
    throw new Error("OZDocument::copyScene unimplemented — @Ozone 0x46eb0");
  }

  /** OZDocument::~OZDocument()  D2 @0x47240 / D1 @0x474c0 / D0 @0x474d0 — frontier. */
  destroy(): void {
    throw new Error("OZDocument::~OZDocument unimplemented — @Ozone 0x47240 (D2) / 0x474c0 (D1) / 0x474d0 (D0)");
  }

  /** OZDocument::resetScene()  @0x474f0 — frontier. */
  resetScene(): void {
    throw new Error("OZDocument::resetScene unimplemented — @Ozone 0x474f0");
  }

  /** OZDocument::addDefaultCamera()  @0x475a0 — frontier. */
  addDefaultCamera(): void {
    throw new Error("OZDocument::addDefaultCamera unimplemented — @Ozone 0x475a0");
  }

  /** OZDocument::adjustCanvasStateFor360Projection()  @0x476f0 — frontier. */
  adjustCanvasStateFor360Projection(): void {
    throw new Error(
      "OZDocument::adjustCanvasStateFor360Projection unimplemented — @Ozone 0x476f0",
    );
  }

  /** OZDocument::getProjectPanelState()  @0x47770 — frontier. */
  getProjectPanelState(): unknown {
    throw new Error("OZDocument::getProjectPanelState unimplemented — @Ozone 0x47770");
  }

  /** OZDocument::addObjCObserver(void*, long)  @0x477d0 — frontier. */
  addObjCObserver(_obs: unknown, _mask: bigint): void {
    throw new Error("OZDocument::addObjCObserver unimplemented — @Ozone 0x477d0");
  }

  /** OZDocument::addCPPObserver(OZCPPObserver*, long)  @0x477f0 — frontier. */
  addCPPObserver(_obs: unknown, _mask: bigint): void {
    throw new Error("OZDocument::addCPPObserver unimplemented — @Ozone 0x477f0");
  }

  /** OZDocument::removeCPPObserver(OZCPPObserver*)  @0x47810 — frontier. */
  removeCPPObserver(_obs: unknown): void {
    throw new Error("OZDocument::removeCPPObserver unimplemented — @Ozone 0x47810");
  }

  /** OZDocument::removeObjCObserver(void*)  @0x47830 — frontier. */
  removeObjCObserver(_obs: unknown): void {
    throw new Error("OZDocument::removeObjCObserver unimplemented — @Ozone 0x47830");
  }

  /** OZDocument::hasCPPObserver(OZCPPObserver*)  @0x47850 — frontier. */
  hasCPPObserver(_obs: unknown): boolean {
    throw new Error("OZDocument::hasCPPObserver unimplemented — @Ozone 0x47850");
  }

  /** OZDocument::hasObjCObserver(void*)  @0x47870 — frontier. */
  hasObjCObserver(_obs: unknown): boolean {
    throw new Error("OZDocument::hasObjCObserver unimplemented — @Ozone 0x47870");
  }

  /** OZDocument::ignoreObserver(void*, bool, u32)  @0x47890 — frontier. */
  ignoreObserver(_obs: unknown, _flag: boolean, _mask: number): void {
    throw new Error("OZDocument::ignoreObserver unimplemented — @Ozone 0x47890");
  }

  /** OZDocument::ignoreObserverOnce(void*, u32)  @0x478b0 — frontier. */
  ignoreObserverOnce(_obs: unknown, _mask: number): void {
    throw new Error("OZDocument::ignoreObserverOnce unimplemented — @Ozone 0x478b0");
  }

  /** OZDocument::unignoreObserverOnce(void*, u32)  @0x478d0 — frontier. */
  unignoreObserverOnce(_obs: unknown, _mask: number): void {
    throw new Error("OZDocument::unignoreObserverOnce unimplemented — @Ozone 0x478d0");
  }

  /** OZDocument::setIsProcessingNotificationsAutomatically(bool)  @0x478f0 — frontier. */
  setIsProcessingNotificationsAutomatically(_v: boolean): void {
    throw new Error(
      "OZDocument::setIsProcessingNotificationsAutomatically unimplemented — @Ozone 0x478f0",
    );
  }

  /** OZDocument::isNotificationPending(u32) const  @0x47910 — frontier. */
  isNotificationPending(_notif: number): boolean {
    throw new Error("OZDocument::isNotificationPending unimplemented — @Ozone 0x47910");
  }

  /** OZDocument::pauseNotifications()  @0x47930 — frontier. */
  pauseNotifications(): void {
    throw new Error("OZDocument::pauseNotifications unimplemented — @Ozone 0x47930");
  }

  /** OZDocument::resumeNotifications()  @0x47950 — frontier. */
  resumeNotifications(): void {
    throw new Error("OZDocument::resumeNotifications unimplemented — @Ozone 0x47950");
  }

  /** OZDocument::startCaptureModifiedChannels(PCString const&)  @0x47970 — frontier. */
  startCaptureModifiedChannels(_name: unknown): void {
    throw new Error(
      "OZDocument::startCaptureModifiedChannels unimplemented — @Ozone 0x47970",
    );
  }

  /** OZDocument::endCaptureModifiedChannels()  @0x479f0 — frontier. */
  endCaptureModifiedChannels(): void {
    throw new Error(
      "OZDocument::endCaptureModifiedChannels unimplemented — @Ozone 0x479f0",
    );
  }

  /** OZDocument::willModifyChannel(OZChannelBase const*, u32)  @0x47a60 — frontier. */
  willModifyChannel(_ch: unknown, _flags: number): void {
    throw new Error("OZDocument::willModifyChannel unimplemented — @Ozone 0x47a60");
  }

  /** OZDocument::markFactoriesForSerialization(PCSerializerWriteStream&, bool)  @0x47c70 — frontier. */
  markFactoriesForSerialization(_s: unknown, _b: boolean): void {
    throw new Error(
      "OZDocument::markFactoriesForSerialization unimplemented — @Ozone 0x47c70",
    );
  }

  /** OZDocument::writeHeader(PCSerializerWriteStream&, bool)  @0x47c90 — frontier. */
  writeHeader(_s: unknown, _b: boolean): void {
    throw new Error("OZDocument::writeHeader unimplemented — @Ozone 0x47c90");
  }

  /** OZDocument::writeBody(PCSerializerWriteStream&, bool, bool, bool)  @0x47ca0 — frontier. */
  writeBody(_s: unknown, _a: boolean, _b: boolean, _c: boolean): void {
    throw new Error("OZDocument::writeBody unimplemented — @Ozone 0x47ca0");
  }

  /** OZDocument::save(PCURL const&, PCURL const&)  @0x48300 — frontier. */
  save(_dest: unknown, _bkp: unknown): void {
    throw new Error("OZDocument::save unimplemented — @Ozone 0x48300");
  }

  /** OZDocument::parseBegin(PCSerializerReadStream&)  @0x48810 — frontier. */
  parseBegin(_s: unknown): void {
    throw new Error("OZDocument::parseBegin unimplemented — @Ozone 0x48810");
  }

  /** OZDocument::parseEnd(PCSerializerReadStream&)  @0x48900 — frontier. */
  parseEnd(_s: unknown): void {
    throw new Error("OZDocument::parseEnd unimplemented — @Ozone 0x48900");
  }

  /** OZDocument::makeFCPv1Corrections()  @0x48e60 — frontier. */
  makeFCPv1Corrections(): void {
    throw new Error("OZDocument::makeFCPv1Corrections unimplemented — @Ozone 0x48e60");
  }

  /** OZDocument::makeFCPv2Corrections()  @0x49a60 — frontier. */
  makeFCPv2Corrections(): void {
    throw new Error("OZDocument::makeFCPv2Corrections unimplemented — @Ozone 0x49a60");
  }

  /** OZDocument::makeFCPv3Corrections()  @0x49f80 — frontier. */
  makeFCPv3Corrections(): void {
    throw new Error("OZDocument::makeFCPv3Corrections unimplemented — @Ozone 0x49f80");
  }

  /** OZDocument::parseElement(PCSerializerReadStream&, PCStreamElement&)  @0x4a1c0 — frontier. */
  parseElement(_rs: unknown, _el: unknown): void {
    throw new Error("OZDocument::parseElement unimplemented — @Ozone 0x4a1c0");
  }

  /** OZDocument::checkVersionForReadStream(PCSerializerReadStream&)  @0x4a730 — frontier. */
  checkVersionForReadStream(_rs: unknown): void {
    throw new Error(
      "OZDocument::checkVersionForReadStream unimplemented — @Ozone 0x4a730",
    );
  }

  /** OZDocument::correct4CornerChannel(OZChannelPosition&, double, double)  @0x4ab20 — frontier. */
  correct4CornerChannel(_ch: unknown, _a: number, _b: number): void {
    throw new Error("OZDocument::correct4CornerChannel unimplemented — @Ozone 0x4ab20");
  }

  /** OZDocument::open(PCURL const&)  @0x4ae60 — frontier. */
  open(_url: unknown): void {
    throw new Error("OZDocument::open unimplemented — @Ozone 0x4ae60");
  }

  /** OZDocument::shouldCollectMediaByDefault()  @0x4b090 — frontier. */
  shouldCollectMediaByDefault(): boolean {
    throw new Error(
      "OZDocument::shouldCollectMediaByDefault unimplemented — @Ozone 0x4b090",
    );
  }

  /** OZDocument::isDepthOfFieldUsed()  @0x4b0b0 — frontier. */
  isDepthOfFieldUsed(): boolean {
    throw new Error("OZDocument::isDepthOfFieldUsed unimplemented — @Ozone 0x4b0b0");
  }

  /** OZDocument::addToUndo(OZUndoAction*, PCString const&)  @0xfc920 — frontier. */
  addToUndo(_undo: unknown, _desc: unknown): void {
    throw new Error("OZDocument::addToUndo unimplemented — @Ozone 0xfc920");
  }

  /** OZDocument::clearTemporaryUndoItems()  @0xfca60 — frontier. */
  clearTemporaryUndoItems(): void {
    throw new Error(
      "OZDocument::clearTemporaryUndoItems unimplemented — @Ozone 0xfca60",
    );
  }

  /** OZDocument::beginUndoGroup(PCString const&)  @0xfcac0 — frontier. */
  beginUndoGroup(_name: unknown): void {
    throw new Error("OZDocument::beginUndoGroup unimplemented — @Ozone 0xfcac0");
  }

  /** OZDocument::endUndoGroup()  @0xfcbf0 — frontier. */
  endUndoGroup(): void {
    throw new Error("OZDocument::endUndoGroup unimplemented — @Ozone 0xfcbf0");
  }

  /** OZDocument::isUndoing()  @0xfcc30 — frontier. */
  isUndoing(): boolean {
    throw new Error("OZDocument::isUndoing unimplemented — @Ozone 0xfcc30");
  }

  /** OZDocument::isRedoing()  @0xfcc70 — frontier. */
  isRedoing(): boolean {
    throw new Error("OZDocument::isRedoing unimplemented — @Ozone 0xfcc70");
  }

  /** OZDocument::setIsReady(bool)  @0xfccb0 — frontier. */
  setIsReady(_v: boolean): void {
    throw new Error("OZDocument::setIsReady unimplemented — @Ozone 0xfccb0");
  }

  /** OZDocument::getUndoDescription()  @0xfccc0 — frontier. */
  getUndoDescription(): unknown {
    throw new Error("OZDocument::getUndoDescription unimplemented — @Ozone 0xfccc0");
  }

  /** OZDocument::setUndoDescription(PCString const&)  @0xfcd10 — frontier. */
  setUndoDescription(_desc: unknown): void {
    throw new Error("OZDocument::setUndoDescription unimplemented — @Ozone 0xfcd10");
  }

  /** OZDocument::importFiles(u32)  @0xfcd60 — frontier. */
  importFiles(_flags: number): void {
    throw new Error("OZDocument::importFiles unimplemented — @Ozone 0xfcd60");
  }

  /** OZDocument::getAllSequences(std::vector<PCString>&)  @0xfd250 — frontier. */
  getAllSequences(_out: unknown): void {
    throw new Error("OZDocument::getAllSequences unimplemented — @Ozone 0xfd250");
  }

  /** OZDocument::import(vector<PCString>&, OZGroup*, PCVector2<float> const&, bool, u32, CMTime, OZSceneNode*)  @0xfdb50 — frontier. */
  import(
    _files: unknown,
    _grp: unknown,
    _pos: unknown,
    _b: boolean,
    _flags: number,
    _t: unknown,
    _node: unknown,
  ): void {
    throw new Error("OZDocument::import unimplemented — @Ozone 0xfdb50");
  }

  /** OZDocument::getFilename() const  @0xfebc0 — frontier. */
  getFilename(): unknown {
    throw new Error("OZDocument::getFilename unimplemented — @Ozone 0xfebc0");
  }

  /** OZDocument::getContainingFolderAsSystemString() const  @0xfec10 — frontier. */
  getContainingFolderAsSystemString(): unknown {
    throw new Error(
      "OZDocument::getContainingFolderAsSystemString unimplemented — @Ozone 0xfec10",
    );
  }

  /** OZDocument::resetFilename()  @0xfec60 — frontier. */
  resetFilename(): void {
    throw new Error("OZDocument::resetFilename unimplemented — @Ozone 0xfec60");
  }

  /** OZDocument::localizeContent(PCURL const&)  @0xfec80 — frontier. */
  localizeContent(_url: unknown): void {
    throw new Error("OZDocument::localizeContent unimplemented — @Ozone 0xfec80");
  }

  /** OZDocument::checkForSupportedConfig()  @0xfef90 — frontier. */
  checkForSupportedConfig(): void {
    throw new Error(
      "OZDocument::checkForSupportedConfig unimplemented — @Ozone 0xfef90",
    );
  }

  /** OZDocument::checkEditLockForReadStream(PCSerializerReadStream&)  @0xff100 — frontier. */
  checkEditLockForReadStream(_rs: unknown): void {
    throw new Error(
      "OZDocument::checkEditLockForReadStream unimplemented — @Ozone 0xff100",
    );
  }

  /** OZDocument::postLoad()  @0xff270 — frontier. */
  postLoad(): void {
    throw new Error("OZDocument::postLoad unimplemented — @Ozone 0xff270");
  }
}

// Reference the OZApplication imports so that the singleton wiring is explicit
// even though this file does not construct/lookup the doc itself. The static
// side-effect (`_theApp(%rip)` read @Ozone 0x4678e in the ctor) is preserved
// as a NON-EXECUTABLE demonstration reference so that dead-code elimination
// keeps the import graph honest.
export const _OZ_APPLICATION_LINK: {
  cls: typeof OZApplication;
  slot: OZApplication | null;
} = {
  cls: OZApplication,
  get slot() {
    // Read of `_theApp` — mirrors the C2 sequence at @0x4678e/@0x46795 without
    // actually calling into the frontier initialize path.
    return _theApp;
  },
};
