// OZApplication.ts — raw transcription of the FCP `OZApplication` singleton.
//
// This class is the FRONTIER SHARED SURFACE against which the entire OZ*Undo family
// (OZMarkersUndo, OZOverrideFCPColorSpaceUndo, OZSceneGamutUndo,
// OZPublishSettingsUndo, OZDocumentTypeUndo, OZEditBoxUndo,
// OZLastModifiedChannelsUndo, OZKeypointModificationUndo, OZDropZoneTypeUndo,
// OZSceneRangeUndo, OZSceneSettingsUndo, OZOSCUndo, OZCurveSetUndo, ...) route
// their Swap() first call: `_theApp->getCurrentDoc()`. This file decodes the
// singleton + the current-document accessor. Every other method is documented
// with its Ozone @0xADDR and (where its body is too heavy for this pass) kept
// as a throwing stub citing the decode-point.
//
// Provenance (FAT binary — x86_64 slice; file offset = VA + 0x4000):
//   __ZN13OZApplicationC2EPv                (C2)  @0x5040
//   __ZN13OZApplicationC1EPv                (C1)  @0x51b0  (thunk that jmps to C2)
//   __ZN13OZApplicationD1Ev                        @0x51c0
//   __ZN13OZApplicationD2Ev                        @0x5320
//   __ZN13OZApplication10initializeEv               @0x5330
//   __ZN13OZApplication27setHostApplicationDelegateEPv @0x7940
//   __ZN13OZApplication27getHostApplicationDelegateEv  @0x7a30
//   __ZN13OZApplication11newDocumentEv              @0x7a70
//   __ZN13OZApplication20setLanguageIdentifierEPK10__CFString @0x7b00
//   __ZN13OZApplication12createObjectERK6PCUUID    @0x7b40
//   __ZN13OZApplication15createSceneNodeERK6PCUUIDRK8PCStringj @0x7bb0
//   __ZN13OZApplication14createBehaviorERK6PCUUIDRK8PCStringj  @0x7c10
//   __ZN13OZApplication14createBehaviorERK6PCUUID              @0x7c70
//   __ZN13OZApplication12createEffectERK6PCUUIDRK8PCStringj    @0x7d00
//   __ZN13OZApplication12createEffectERK6PCUUID                @0x7d60
//   __ZN13OZApplication11createStyleERK6PCUUIDRK8PCStringj     @0x7df0
//   __ZN13OZApplication15createStyleCopyEP7OZStylej            @0x7e50
//   __ZN13OZApplication13saveFactoriesER22PCSerializerWriteStream @0x7eb0
//   __ZN13OZApplication15isPrimaryObjectEj                     @0x7ed0
//   __ZNK13OZApplication13getActiveGPUsEv                      @0x7f10
//   __ZN13OZApplication16loadBundleAtPathEP8NSStringP6__CFSet  @0xfb6d0
//   __ZN13OZApplication22scanPluginsInDirectoryEP8NSStringP14NSMutableSet @0xfb7c0
//   __ZN13OZApplication11ScanPluginsEv                         @0xfb8b0
//   __ZN13OZApplication24FinishInitializingPluginsEv           @0xfc4c0
//   __ZN13OZApplication14ReleasePluginsEv                      @0xfc5f0
//   __ZN13OZApplication13getCurrentDocEv                       @0x36a9a0  ← CORE (this file)
//   __ZN13OZApplication13setCurrentDocEP10OZDocument           @0x36aa20  ← CORE
//   __ZN13OZApplication22setPerThreadCurrentDocEP10OZDocument  @0x36ab10  ← CORE
//   __ZN13OZApplication15documentWillDieEP10OZDocument         @0x36ab90  ← CORE
//   __ZN13OZApplication7initPMREv                              @0x36abb0
//   __ZN13OZApplication24initializeMotionInternalsEv           @0x36abc0
//   __ZN13OZApplication23purgeSegmentationCachesEv             @0x36abd0
//   __ZN13OZApplication22purgeSegmentationCacheEP8NSString     @0x36ac10
//   __ZN13OZApplication23getSegmentationCachePathEv            @0x36ae00
//   __ZN13OZApplication33getSegmentationCacheForSharingPathEv  @0x36aee0
//   __ZN13OZApplication15addUIComponentsEv                     @0x4c78f0
//
// ============================================================================
//  GLOBAL: `_theApp` — the OZApplication singleton
// ============================================================================
//  Symbol: `_theApp` in (__DATA,__common) at Ozone VA 0x871cb0.
//  Recovered via `nm -m Ozone | grep _theApp`:
//      0x871cb0 (__DATA,__common) external _theApp
//  Every Swap() in the OZ*Undo family fetches it as an `OZApplication*` via:
//      leaq _theApp(%rip), %rax
//      movq (%rax), %rdi
//      callq __ZN13OZApplication13getCurrentDocEv
//  i.e. the SLOT holds the pointer; dereferencing the slot yields the
//  OZApplication instance. The instance is constructed once at framework
//  init (see @0x5040 C2 body) and assigned to this global by an
//  `OZApplication::initialize()` call chain (@0x5330 — frontier here).
//
// ============================================================================
//  PER-THREAD CURRENT-DOC STORAGE (Meyers-singleton pthread key)
// ============================================================================
//  Two file-scope statics live in Ozone's __bss:
//    __ZGVZL17perThreadDocumentvE6result   guard byte (Itanium ABI static-init guard)
//    __ZZL17perThreadDocumentvE6result     pthread_key_t (unsigned long)
//  Both introduced by the local function `perThreadDocument()` inside Ozone.
//  On first access:
//      * ___cxa_guard_acquire(&guard)
//      * pthread_key_create(&result, PCThreadSpecific<OZDocument>::destroy)
//      * ___cxa_guard_release(&guard)
//  Thereafter the key is used with pthread_getspecific / pthread_setspecific
//  to hold the "per-thread current document" override.
//
//  Destructor stub for the pthread key:
//    __ZN16PCThreadSpecificI10OZDocumentE7destroyEPS0_
//      = PCThreadSpecific<OZDocument>::destroy(OZDocument*)
//    Passed as the pthread_key_create destructor at @0x36a9ee /
//    @0x36aaa2 / @0x36aad6 / @0x36ab50.
//    We keep this frontier-stubbed — decoding it requires the
//    PCThreadSpecific template body which isn't part of this class.
//
// ============================================================================
//  STRUCT LAYOUT — recovered from C2 @0x5040..0x514b
// ============================================================================
//  The FCP compiler emits the following fields inside sizeof(OZApplication):
//    +0x00   hostDelegate : OZHostApplicationDelegateHandler*
//                          heap-alloced via `operator new(0x8)` @0x50b2..0x50b7
//                          and constructed with `OZHostApplicationDelegateHandlerC1(void*)`
//                          @0x50c5. Stored at 0x50ca `movq %r14,(%rbx)`.
//                          NB: This is a NON-VIRTUAL class — `(%rbx)` is a plain
//                          delegate-holder pointer, NOT a vtable ptr.
//                          (See also setHost/getHost accessors @0x7940 / @0x7a30.)
//    +0x08   currentDoc : OZDocument*
//                          initial zero (via the xorps/movups pair @0x50d5/@0x50d8
//                          which zeroes +0x08 and +0x10 together as an aligned pair).
//                          READ  @ 0x36a9cc  (getCurrentDoc fallback)
//                          WRITE @ 0x36aa82  (setCurrentDoc), 0x36ab9c (documentWillDie
//                                             clears it when the dying doc == +0x08).
//    +0x10   (reserved/other) : u64
//                          zeroed by the same xorps/movups @0x50d8. Purpose not
//                          decoded in this pass — likely a paired "primary doc"
//                          slot; documented as OPAQUE.
//    +0x28   (16-byte pair) : (u64, u64)
//                          zeroed by `xorps ; movups %xmm0,0x28(%rdi)` @0x5054/0x5057
//                          — a paired slot; NOT decoded in this pass.
//    +0x38   (u64)          : zeroed by `movq $0x0,0x38(%rdi)` @0x505b.
//    +0x48   cfBundle       : CFBundleRef
//                          `_CFBundleGetBundleWithIdentifier(@"…")` @0x50e3 →
//                          `movq %rax,0x48(%rbx)` @0x50e8. Note: the CF-string
//                          argument printed by otool as "bad cfstring ref"
//                          is a stripped CFString literal — its content is
//                          decoded elsewhere (frontier here).
//    +0x50   (u16)          : zeroed `movw $0x0,0x50(%rbx)` @0x50ec.
//    +0x52   (u8)           : zeroed `movb $0x0,0x52(%rbx)` @0x50f2.
//    +0x58   languageId     : CFStringRef  (canonical language identifier)
//                          CFLocaleCopyCurrent → CFLocaleGetIdentifier →
//                          CFLocaleCreateCanonicalLanguageIdentifierFromString →
//                          stored @0x511d `movq %rax,0x58(%rbx)`.
//                          If CFLocaleCopyCurrent returns null, slot is left zero
//                          (branch @0x5101 `je 0x5129`).
//    +0x60   pluginArray    : CFMutableArrayRef
//                          `_CFArrayCreateMutable(NULL, 0, &kCFTypeArrayCallBacks)`
//                          @0x5134 → `movq %rax,0x60(%rbx)` @0x5139.
//    +0x68   (u64)          : zeroed `movq $0x0,0x68(%rbx)` @0x50cd.
//    +0x78   sessionName    : PCString  (default-constructed @0x506a via
//                          __ZN8PCStringC1Ev). 8 bytes (SSO PCString handle).
//    +0x80   mutexA         : PCMutex   (constructed @0x507d).
//                          Size (0x80..0xc8) = 0x48 bytes.
//    +0xc8   mutexB         : PCMutex   (constructed @0x508c).
//    +0x110  activeGPUs     : (opaque handle) — set from _FxDeviceComputeActiveGPUsSet
//                          @0x5091 (return value → +0x110 @0x5096).
//                          Also logged via _FxDeviceLogActiveSet @0x50ad if
//                          _FxDeviceIsLoggingEnabled returns true.
//
//  Total sizeof at least 0x118 (fields extend to +0x110 + one u64). The rest of
//  the object may hold more members set by OZApplication::initialize()
//  @0x5330 (frontier — not decoded in this pass).
//
// FRONTIERS (kept as throwing stubs; each cites the @0xADDR that requires them):
//   • Everything except getCurrentDoc/setCurrentDoc/setPerThreadCurrentDoc/documentWillDie
//     is a throw-stub — the OZ*Undo family only depends on the current-doc surface.
//     Heavy methods (initialize/ScanPlugins/…) are large enough to warrant a
//     dedicated worktree each and would swallow this decode.
//   • PCThreadSpecific<OZDocument>::destroy — pthread_key_create destructor thunk.
//   • OZHostApplicationDelegateHandler — 8-byte helper class constructed inline.
//   • PCMutex / PCString / PCUUID / OZDocument / OZStyle / PCSerializerWriteStream
//     first-class ports (some landed elsewhere; imported below where they exist).

/**
 * OZDocument opaque handle — the OZ*Undo family only ever needs a POINTER to it
 * (for the currentDoc slot at +0x8, or the doc[+0x8]/doc[+0x2b8]/doc[+0x588]
 * struct reads inside each Swap()). Full port lives in `OZDocument.ts`.
 */
export interface OZDocumentHandle {
  readonly __ozDocument: true;
}

/**
 * OZHostApplicationDelegateHandler opaque — 8-byte helper heap-alloced in C2
 * @0x50b2..0x50c5 and stored at OZApplication+0x00. Frontier.
 */
export interface OZHostApplicationDelegateHandlerHandle {
  readonly __ozHostApplicationDelegateHandler: true;
}

/**
 * `_theApp` — the FCP-global OZApplication singleton slot.
 *
 * Symbol: `_theApp` @Ozone VA 0x871cb0 in (__DATA,__common). Every OZ*Undo Swap()
 * fetches this slot and calls getCurrentDoc() on it:
 *
 *     leaq _theApp(%rip), %rax   ; %rax = &_theApp
 *     movq (%rax), %rdi          ; %rdi = *_theApp  (the OZApplication*)
 *     callq __ZN13OZApplication13getCurrentDocEv
 *
 * In TS the slot lives on the module as a mutable `OZApplication | null` cell,
 * assigned by `initialize()` (frontier) at framework startup.
 */
export let _theApp: OZApplication | null = null;

/** Test-only helper — allow the runtime to install the singleton without decoding initialize(). */
export function _setTheApp(app: OZApplication | null): void {
  _theApp = app;
}

// ============================================================================
//  PER-THREAD CURRENT-DOC (pthread_getspecific / pthread_setspecific)
// ============================================================================
//
//  The Ozone framework backs the "override the current-doc for THIS thread"
//  feature with a Meyers-singleton pthread key. We port the observable
//  behaviour: a lazily-allocated per-thread slot that stores an OZDocument
//  pointer, cleared by a destructor when the thread exits.
//
//  In a browser/Node port we don't have pthread; we model the same shape with
//  a nullable module-scope "current thread" slot. Consumers who need real
//  thread-local semantics can swap the storage without touching Swap() call sites.

/**
 * pthread key slot recovered from `perThreadDocument()::result`
 *   (symbol `__ZZL17perThreadDocumentvE6result`).
 * Guard byte: `__ZGVZL17perThreadDocumentvE6result`.
 * Destructor thunk: __ZN16PCThreadSpecificI10OZDocumentE7destroyEPS0_
 *                   (PCThreadSpecific<OZDocument>::destroy)  — frontier @0x36a9ee.
 *
 * We use a single-slot cell here (no threading model in TS/JS by default).
 * The observable semantics preserved:
 *   • The slot starts unset (guard=false, key uninitialized).
 *   • First access lazily "creates" the key (records that init happened).
 *   • The slot may hold null (meaning "no override — fall back to instance
 *     currentDoc") or an OZDocument* (meaning "override for this thread").
 */
let _perThreadDocumentKeyCreated: boolean = false; // guard variable analogue
let _perThreadDocumentValue: OZDocumentHandle | null = null; // pthread_getspecific result

/**
 * Lazy initializer — mirrors the guard-acquire / key-create / guard-release
 * dance at @0x36a9d7..@0x36aa06 (getCurrentDoc slow path), @0x36aa8b..@0x36aaba
 * (setCurrentDoc slow path), @0x36aabf..@0x36aaee (setCurrentDoc alt slow path),
 * @0x36ab39..@0x36ab68 (setPerThreadCurrentDoc slow path).
 *
 * All four call sites go through the SAME statics. The destructor arg passed to
 * pthread_key_create is `PCThreadSpecific<OZDocument>::destroy`.
 */
function _ensurePerThreadDocumentKey(): void {
  if (_perThreadDocumentKeyCreated) return;
  // @0x36a9de/@0x36aa92/@0x36aac6/@0x36ab40: ___cxa_guard_acquire returns non-zero
  //   only for the first thread to initialize. In our single-threaded model
  //   this is idempotent — just set the guard.
  // @0x36a9f5/@0x36aaa9/@0x36aadd/@0x36ab57: pthread_key_create(&result,
  //   PCThreadSpecific<OZDocument>::destroy). We elide the destructor since
  //   the TS slot has GC — the key-create effect is captured by the flag.
  // @0x36aa01/@0x36aab5/@0x36aae9/@0x36ab63: ___cxa_guard_release.
  _perThreadDocumentKeyCreated = true;
}

/**
 * pthread_getspecific analogue — @0x36a9bb / @0x36aa3f.
 * Returns the current-thread override, or null if no override is set.
 */
function _perThreadDocumentGet(): OZDocumentHandle | null {
  _ensurePerThreadDocumentKey();
  return _perThreadDocumentValue;
}

/**
 * pthread_setspecific analogue — @0x36aa77 / @0x36ab34.
 * Installs an OZDocument as the current-thread override (may be null to clear).
 */
function _perThreadDocumentSet(doc: OZDocumentHandle | null): void {
  _ensurePerThreadDocumentKey();
  _perThreadDocumentValue = doc;
}

// ============================================================================
//  OZApplication class
// ============================================================================

/**
 * `OZApplication` — the FCP application singleton. Not a vtable-based class in
 * the asm (no `movq %rax,(%rdi)` in C2 targets a vtable pointer for
 * OZApplication itself — `(%rbx)` at 0x50ca stores the delegate handler, which
 * is what lives at +0x00). Ports are limited to the CURRENT-DOC surface used
 * by every OZ*Undo Swap(); the remaining methods are throwing stubs cited by
 * @0xADDR so the demand signal is filed.
 */
export class OZApplication {
  /**
   * +0x00 — hostDelegate : OZHostApplicationDelegateHandler*
   * heap-allocated by C2 @0x50b2 with `operator new(0x8)` and constructed
   * with `OZHostApplicationDelegateHandlerC1(void*)` @0x50c5, stored @0x50ca
   * `movq %r14,(%rbx)`.
   */
  hostDelegate: OZHostApplicationDelegateHandlerHandle | null = null;

  /**
   * +0x08 — currentDoc : OZDocument*
   * Zeroed by ctor `xorps ; movups %xmm0,0x8(%rdi)` @0x50d5/@0x50d8.
   * READ  @0x36a9cc — `movq 0x8(%rbx),%rax` in getCurrentDoc() fallback.
   * WRITE @0x36aa82 — `movq %rbx,0x8(%r14)` in setCurrentDoc().
   * CLEAR @0x36ab9c — `movq $0x0,0x8(%rdi)` in documentWillDie() when the
   *                    dying doc equals this slot.
   */
  currentDoc: OZDocumentHandle | null = null;

  /**
   * OZApplication::getCurrentDoc()  @0x36a9a0
   *   __ZN13OZApplication13getCurrentDocEv  — return type: OZDocument*
   *
   * Full disassembly (Ozone x86_64):
   *   0x36a9a0: pushq %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax   # prologue
   *   0x36a9a6: movq %rdi,%rbx                                          # rbx = this
   *   0x36a9a9: movzbl __ZGVZL17perThreadDocumentvE6result(%rip),%eax   # guard byte
   *   0x36a9b0: testb %al,%al
   *   0x36a9b2: je    0x36a9d7                                          # -> slow init
   *   0x36a9b4: movq  __ZZL17perThreadDocumentvE6result(%rip),%rdi      # rdi = pthread_key_t
   *   0x36a9bb: callq _pthread_getspecific                              # rax = override
   *   0x36a9c0: testq %rax,%rax
   *   0x36a9c3: je    0x36a9cc                                          # -> use instance slot
   *   0x36a9c5..0x36a9cb: epilogue ; retq                               # return override
   *   0x36a9cc: movq  0x8(%rbx),%rax                                    # rax = this->currentDoc
   *   0x36a9d0..0x36a9d6: epilogue ; retq
   *
   *   0x36a9d7..0x36aa06: slow static-init path (see _ensurePerThreadDocumentKey()).
   *
   * Semantics: prefer the per-thread override; if none, return the instance
   * currentDoc slot (may be null).
   */
  getCurrentDoc(): OZDocumentHandle | null {
    // @0x36a9a9-@0x36aa06: lazily initialize the pthread key (guard + key_create + release).
    // @0x36a9bb:            pthread_getspecific → override for this thread.
    const override_ = _perThreadDocumentGet();
    // @0x36a9c0-@0x36a9c3: if the override is non-null, return it.
    if (override_ !== null) return override_;
    // @0x36a9cc:            fall back to the instance slot at +0x08.
    return this.currentDoc;
  }

  /**
   * OZApplication::setCurrentDoc(OZDocument*)  @0x36aa20
   *   __ZN13OZApplication13setCurrentDocEP10OZDocument
   *
   * Full disassembly:
   *   0x36aa20: prologue ; rbx=doc ; r14=this
   *   0x36aa2d: guard-byte check; slow init if unset (@0x36aa8b)
   *   0x36aa38: movq  __ZZL17perThreadDocumentvE6result(%rip),%rdi
   *   0x36aa3f: callq _pthread_getspecific                # rax = curOverride
   *   0x36aa44: testq %rax,%rax          ; sete %cl        # cl = (curOverride == 0)
   *   0x36aa4a: cmpq  %rax,%rbx          ; sete %dl        # dl = (doc == curOverride)
   *   0x36aa50: orb   %cl,%dl            ; je   0x36aa5e   # if (!cl && !dl) -> update override
   *   0x36aa54: testq %rax,%rax          ; je   0x36aa7c   # if (curOverride == 0) -> update instance
   *   0x36aa59..0x36aa5d: epilogue ; retq                  # else no-op (override already == doc)
   *   0x36aa5e: ... second guard check + tail-jmp to _pthread_setspecific(key, doc)  @0x36aa77
   *   0x36aa7c: cmpq  0x8(%r14),%rbx     ; je   0x36aa59   # if (this->currentDoc == doc) -> no-op
   *   0x36aa82: movq  %rbx,0x8(%r14)                       # this->currentDoc = doc
   *   0x36aa86..0x36aa8a: epilogue ; retq
   *
   * Semantics (three-way):
   *   • If per-thread override is unset  → write `doc` into instance currentDoc
   *     (unless it's already there).
   *   • If override is set and equals doc → no-op.
   *   • Otherwise (override is set and != doc, OR override unset and instance
   *     also different) — the code enters the @0x36aa5e branch which
   *     unconditionally installs `doc` as the per-thread override via
   *     pthread_setspecific. NB: this OVERWRITES the override rather than the
   *     instance slot when an override already exists — mirroring exactly the
   *     asm control flow.
   */
  setCurrentDoc(doc: OZDocumentHandle | null): void {
    // @0x36aa2d-@0x36aaba: lazy key-init on first call.
    const curOverride = _perThreadDocumentGet();
    // @0x36aa44/@0x36aa4a/@0x36aa50: the FCP asm computes
    //   cl = (curOverride == 0)
    //   dl = (doc         == curOverride)
    //   if ((cl | dl) == 0) goto 0x36aa5e  # neither is true — install override
    const cl = curOverride === null;
    const dl = doc === curOverride;
    if (!(cl || dl)) {
      // @0x36aa5e-@0x36aa77: install `doc` into the per-thread override.
      _perThreadDocumentSet(doc);
      return;
    }
    // @0x36aa54: `testq %rax,%rax ; je 0x36aa7c` — if override IS set and
    //   equals doc, fall through to no-op.
    if (curOverride !== null) {
      // curOverride != null AND doc == curOverride  → no-op
      return;
    }
    // @0x36aa7c: override is null → maybe update instance slot.
    if (this.currentDoc === doc) return; // no-op
    // @0x36aa82: this->currentDoc = doc
    this.currentDoc = doc;
  }

  /**
   * OZApplication::setPerThreadCurrentDoc(OZDocument*)  @0x36ab10
   *   __ZN13OZApplication22setPerThreadCurrentDocEP10OZDocument
   *
   * Full disassembly:
   *   0x36ab10: prologue ; rbx=doc
   *   0x36ab19: guard-byte check; slow init if unset (@0x36ab39)
   *   0x36ab24: movq  __ZZL17perThreadDocumentvE6result(%rip),%rdi   # key
   *   0x36ab2b: movq  %rbx,%rsi                                       # value=doc
   *   0x36ab2e..0x36ab34: epilogue ; jmp _pthread_setspecific         # tail-call
   *
   * Semantics: unconditionally install `doc` (may be null) into the per-thread
   * override slot. Does NOT touch the instance currentDoc.
   */
  setPerThreadCurrentDoc(doc: OZDocumentHandle | null): void {
    // @0x36ab19-@0x36ab68: lazy key-init.
    // @0x36ab2b/@0x36ab34: pthread_setspecific(key, doc).
    _perThreadDocumentSet(doc);
  }

  /**
   * OZApplication::documentWillDie(OZDocument*)  @0x36ab90
   *   __ZN13OZApplication15documentWillDieEP10OZDocument
   *
   * Full disassembly:
   *   0x36ab90: pushq %rbp ; movq %rsp,%rbp                            # prologue
   *   0x36ab94: cmpq  0x8(%rdi),%rsi                                   # this->currentDoc == doc ?
   *   0x36ab98: je    0x36ab9c
   *   0x36ab9a..0x36ab9b: popq %rbp ; retq                             # no-op if not the one dying
   *   0x36ab9c: movq  $0x0,0x8(%rdi)                                   # this->currentDoc = NULL
   *   0x36aba4..0x36aba5: popq %rbp ; retq
   *
   * Semantics: called by an OZDocument's own dtor to make the app forget it if
   * it was the current doc. Does NOT touch the per-thread override — that is
   * the caller's job (mirrors the asm exactly).
   */
  documentWillDie(doc: OZDocumentHandle): void {
    // @0x36ab94: only clear if this->currentDoc == doc.
    if (this.currentDoc === doc) {
      // @0x36ab9c: this->currentDoc = null
      this.currentDoc = null;
    }
  }

  // ------------------------------------------------------------------
  // FRONTIER methods — each throws with its @0xADDR so the demand signal
  // is filed. Nothing in the OZ*Undo family calls any of these.
  // ------------------------------------------------------------------

  /** OZApplication::initialize()  @0x5330 — frontier (heavy; installs `_theApp` global). */
  initialize(): void {
    throw new Error("OZApplication::initialize unimplemented — @Ozone 0x5330");
  }

  /** OZApplication::setHostApplicationDelegate(void*)  @0x7940 — frontier. */
  setHostApplicationDelegate(_delegate: unknown): void {
    throw new Error(
      "OZApplication::setHostApplicationDelegate unimplemented — @Ozone 0x7940",
    );
  }

  /** OZApplication::getHostApplicationDelegate()  @0x7a30 — frontier. */
  getHostApplicationDelegate(): OZHostApplicationDelegateHandlerHandle | null {
    throw new Error(
      "OZApplication::getHostApplicationDelegate unimplemented — @Ozone 0x7a30",
    );
  }

  /** OZApplication::newDocument()  @0x7a70 — frontier. */
  newDocument(): OZDocumentHandle | null {
    throw new Error(
      "OZApplication::newDocument unimplemented — @Ozone 0x7a70",
    );
  }

  /** OZApplication::setLanguageIdentifier(CFStringRef)  @0x7b00 — frontier. */
  setLanguageIdentifier(_cfString: unknown): void {
    throw new Error(
      "OZApplication::setLanguageIdentifier unimplemented — @Ozone 0x7b00",
    );
  }

  /** OZApplication::createObject(PCUUID const&)  @0x7b40 — frontier. */
  createObject(_uuid: unknown): unknown {
    throw new Error(
      "OZApplication::createObject unimplemented — @Ozone 0x7b40",
    );
  }

  /** OZApplication::createSceneNode(PCUUID, PCString, u32)  @0x7bb0 — frontier. */
  createSceneNode(_uuid: unknown, _name: unknown, _flags: number): unknown {
    throw new Error(
      "OZApplication::createSceneNode unimplemented — @Ozone 0x7bb0",
    );
  }

  /** OZApplication::createBehavior(PCUUID, PCString, u32)  @0x7c10 — frontier. */
  createBehavior3(_uuid: unknown, _name: unknown, _flags: number): unknown {
    throw new Error(
      "OZApplication::createBehavior(uuid,name,flags) unimplemented — @Ozone 0x7c10",
    );
  }

  /** OZApplication::createBehavior(PCUUID)  @0x7c70 — frontier. */
  createBehavior1(_uuid: unknown): unknown {
    throw new Error(
      "OZApplication::createBehavior(uuid) unimplemented — @Ozone 0x7c70",
    );
  }

  /** OZApplication::createEffect(PCUUID, PCString, u32)  @0x7d00 — frontier. */
  createEffect3(_uuid: unknown, _name: unknown, _flags: number): unknown {
    throw new Error(
      "OZApplication::createEffect(uuid,name,flags) unimplemented — @Ozone 0x7d00",
    );
  }

  /** OZApplication::createEffect(PCUUID)  @0x7d60 — frontier. */
  createEffect1(_uuid: unknown): unknown {
    throw new Error(
      "OZApplication::createEffect(uuid) unimplemented — @Ozone 0x7d60",
    );
  }

  /** OZApplication::createStyle(PCUUID, PCString, u32)  @0x7df0 — frontier. */
  createStyle(_uuid: unknown, _name: unknown, _flags: number): unknown {
    throw new Error(
      "OZApplication::createStyle unimplemented — @Ozone 0x7df0",
    );
  }

  /** OZApplication::createStyleCopy(OZStyle*, u32)  @0x7e50 — frontier. */
  createStyleCopy(_style: unknown, _flags: number): unknown {
    throw new Error(
      "OZApplication::createStyleCopy unimplemented — @Ozone 0x7e50",
    );
  }

  /** OZApplication::saveFactories(PCSerializerWriteStream&)  @0x7eb0 — frontier. */
  saveFactories(_stream: unknown): void {
    throw new Error(
      "OZApplication::saveFactories unimplemented — @Ozone 0x7eb0",
    );
  }

  /** OZApplication::isPrimaryObject(u32)  @0x7ed0 — frontier. */
  isPrimaryObject(_id: number): boolean {
    throw new Error(
      "OZApplication::isPrimaryObject unimplemented — @Ozone 0x7ed0",
    );
  }

  /** OZApplication::getActiveGPUs() const  @0x7f10 — frontier. Returns +0x110 slot handle. */
  getActiveGPUs(): unknown {
    throw new Error(
      "OZApplication::getActiveGPUs unimplemented — @Ozone 0x7f10",
    );
  }

  /** OZApplication::loadBundleAtPath(NSString*, CFSet*)  @0xfb6d0 — frontier. */
  loadBundleAtPath(_path: unknown, _set: unknown): unknown {
    throw new Error(
      "OZApplication::loadBundleAtPath unimplemented — @Ozone 0xfb6d0",
    );
  }

  /** OZApplication::scanPluginsInDirectory(NSString*, NSMutableSet*)  @0xfb7c0 — frontier. */
  scanPluginsInDirectory(_dir: unknown, _set: unknown): void {
    throw new Error(
      "OZApplication::scanPluginsInDirectory unimplemented — @Ozone 0xfb7c0",
    );
  }

  /** OZApplication::ScanPlugins()  @0xfb8b0 — frontier. */
  ScanPlugins(): void {
    throw new Error(
      "OZApplication::ScanPlugins unimplemented — @Ozone 0xfb8b0",
    );
  }

  /** OZApplication::FinishInitializingPlugins()  @0xfc4c0 — frontier. */
  FinishInitializingPlugins(): void {
    throw new Error(
      "OZApplication::FinishInitializingPlugins unimplemented — @Ozone 0xfc4c0",
    );
  }

  /** OZApplication::ReleasePlugins()  @0xfc5f0 — frontier. */
  ReleasePlugins(): void {
    throw new Error(
      "OZApplication::ReleasePlugins unimplemented — @Ozone 0xfc5f0",
    );
  }

  /** OZApplication::initPMR()  @0x36abb0 — frontier. */
  initPMR(): void {
    throw new Error("OZApplication::initPMR unimplemented — @Ozone 0x36abb0");
  }

  /** OZApplication::initializeMotionInternals()  @0x36abc0 — frontier. */
  initializeMotionInternals(): void {
    throw new Error(
      "OZApplication::initializeMotionInternals unimplemented — @Ozone 0x36abc0",
    );
  }

  /** OZApplication::purgeSegmentationCaches()  @0x36abd0 — frontier. */
  purgeSegmentationCaches(): void {
    throw new Error(
      "OZApplication::purgeSegmentationCaches unimplemented — @Ozone 0x36abd0",
    );
  }

  /** OZApplication::purgeSegmentationCache(NSString*)  @0x36ac10 — frontier. */
  purgeSegmentationCache(_key: unknown): void {
    throw new Error(
      "OZApplication::purgeSegmentationCache unimplemented — @Ozone 0x36ac10",
    );
  }

  /** OZApplication::getSegmentationCachePath()  @0x36ae00 — frontier. */
  getSegmentationCachePath(): unknown {
    throw new Error(
      "OZApplication::getSegmentationCachePath unimplemented — @Ozone 0x36ae00",
    );
  }

  /** OZApplication::getSegmentationCacheForSharingPath()  @0x36aee0 — frontier. */
  getSegmentationCacheForSharingPath(): unknown {
    throw new Error(
      "OZApplication::getSegmentationCacheForSharingPath unimplemented — @Ozone 0x36aee0",
    );
  }

  /** OZApplication::addUIComponents()  @0x4c78f0 — frontier. */
  addUIComponents(): void {
    throw new Error(
      "OZApplication::addUIComponents unimplemented — @Ozone 0x4c78f0",
    );
  }
}
