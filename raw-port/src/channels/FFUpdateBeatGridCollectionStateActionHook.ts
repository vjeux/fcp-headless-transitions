// FFUpdateBeatGridCollectionStateActionHook.ts — Flexo Objective-C action-hook that reacts
// to a "sequence action" (timeline edit) ending, and updates the per-collection beat-grid
// enable state in FFBeatGridUserSettings when the affected collection's membership changed.
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//         (macOS FCP, x86_64 slice).
//
// Symbols ported:
//   * -[FFUpdateBeatGridCollectionStateActionHook sequenceActionWillEnd:]  @0x709770
//
// This is the class's ONLY exported method (per the Flexo ledger). No ctor/dtor/dealloc is
// exported for this class in the framework's x86_64 slice — the Objective-C runtime provides
// the default lifecycle. The single instance method is 0x142 bytes (@0x709770..0x7098b2) and
// is composed entirely of `objc_msgSend` dispatch through a cached IMP (register r12) plus
// two direct `_objc_opt_class` / `_objc_opt_isKindOfClass` calls.
//
// -----------------------------------------------------------------------------
// CONTROL FLOW (decoded from the 0x142-byte body, @0x709770..0x7098b2)
// -----------------------------------------------------------------------------
//   changeDict = [action changeDictionary]                        // sel@0x1bbfc00, msgSend@0x70978f
//   if ([changeDict count] == 0) return;                          // sel@0x1bb8550, msgSend@0x7097a2, je@0x7097a8
//   backdoor = [action storyTimelinePresentationBackdoor]         // sel@0x1bb99c8, msgSend@0x7097b8
//   collection = [backdoor rootItem]                              // sel@0x1bb8a70, msgSend@0x7097c5
//   ac_class = _objc_opt_class(FFAnchoredCollection)              // callq@0x7097d2 -> 0x149798c
//   if (collection != nil) {                                      // testq %rbx,%rbx @0x7097d7
//     if (!_objc_opt_isKindOfClass(collection, ac_class))         // callq@0x7097e2 -> 0x1497992
//       collection = nil;                                         // xor %ebx,%ebx @0x7097eb
//   }
//   settings = [FFBeatGridUserSettings                            // sel@0x1bc3580, msgSend@0x7097fe
//                 beatGridEnableStateForCollection:collection]
//   if (settings != nil) {                                        // 0x709810 branch (rax != 0)
//     removedObjs = [changeDict objectForKey:FFActionRemovedObjectsKey]  // sel@0x1bb9158, msgSend@0x70981d
//     if ([removedObjs count] == 0) return;                       // sel@0x1bb8550 (r14), msgSend@0x709826, je@0x70982c
//     if ([FFEnableBeatGridCommand                                // sel@0x1bd7ed0, msgSend@0x70983f
//            areAnyObjectsInCollectionShowingBeats:collection]) return; // jne@0x709847
//     newState = 0;                                               // xor %edx,%edx @0x709849
//   } else {                                                      // 0x70984d branch (rax == 0)
//     newObjs = [changeDict objectForKey:FFActionNewObjectsKey]   // sel@0x1bb9158, msgSend@0x70985a
//     newObjsAll = [newObjs allObjects]                           // sel@0x1bb9300, msgSend@0x70986e
//     ok = [FFEnableBeatGridCommand                               // sel@0x1bd7a18, msgSend@0x70987e
//            canHideBeatsOnObjects:newObjsAll];
//     newState = 2;                                               // mov $0x2,%edx @0x709881
//     if (!ok) return;                                            // je@0x709888
//   }
//   // TAIL @0x70988a:
//   //   [FFBeatGridUserSettings setBeatGridEnableState:newState onCollection:collection]
//   // (encoded as tail-jmp through objc_msgSend @0x18ed6c0; rcx = collection, rdx = newState).
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT
// -----------------------------------------------------------------------------
//   NONE observable from this method — it never reads `self` (rdi) beyond the ObjC prologue.
//   The class stores no ivars visible in this method. `sequenceActionWillEnd:` is a stateless
//   observer that mutates FFBeatGridUserSettings global state in response to the sequence
//   edit described in `action`.
//
// -----------------------------------------------------------------------------
// RESOLVED SELECTORS (each read from __objc_selrefs @<selref-va>, target string in
// __objc_methname)
// -----------------------------------------------------------------------------
//   0x1bbfc00 -> "changeDictionary"
//   0x1bb8550 -> "count"
//   0x1bb99c8 -> "storyTimelinePresentationBackdoor"
//   0x1bb8a70 -> "rootItem"
//   0x1bc3580 -> "beatGridEnableStateForCollection:"
//   0x1bb9158 -> "objectForKey:"
//   0x1bb9300 -> "allObjects"
//   0x1bd7a18 -> "canHideBeatsOnObjects:"
//   0x1bd7ed0 -> "areAnyObjectsInCollectionShowingBeats:"
//   0x1bd7ec0 -> "setBeatGridEnableState:onCollection:"
//
// -----------------------------------------------------------------------------
// RESOLVED DIRECT CALLS (non-selector)
// -----------------------------------------------------------------------------
//   callq 0x149798c  -> _objc_opt_class          (__stubs, Flexo x86_64)
//   callq 0x1497992  -> _objc_opt_isKindOfClass  (__stubs, Flexo x86_64)
//   callq *%r12 / *0x18ed6c0(%rip)  -> _objc_msgSend (cached IMP, __got, Flexo x86_64)
//
// -----------------------------------------------------------------------------
// RESOLVED EXTERNAL SYMBOLS (dylib class refs + string keys)
// -----------------------------------------------------------------------------
//   _OBJC_CLASS_$_FFAnchoredCollection                @0x1c30a40  (leaq @0x7097cb)
//   _OBJC_CLASS_$_FFBeatGridUserSettings              @0x1c41980  (leaq @0x7097ed)
//   _OBJC_CLASS_$_FFEnableBeatGridCommand             @0x1c419f8  (leaq @0x70982e, @0x70985d, @0x70988a)
//   _FFActionRemovedObjectsKey                        @0x19242d8  (leaq @0x709810)
//   _FFActionNewObjectsKey                            @0x19242c8  (leaq @0x70984d)
//
// -----------------------------------------------------------------------------
// FRONTIER (undecoded — throwing stubs; ObjC selectors implemented by other Flexo classes
// NOT yet in the raw-port graph. Each carries the exact addr where its selref was resolved.)
// -----------------------------------------------------------------------------
//   * -[FFSequenceAction changeDictionary]                        selref@0x1bbfc00
//   * -[NSDictionary/NSSet count]                                 selref@0x1bb8550 (Foundation)
//   * -[FFSequenceAction storyTimelinePresentationBackdoor]       selref@0x1bb99c8
//   * -[<StoryTimelinePresentation> rootItem]                     selref@0x1bb8a70
//   * +[FFBeatGridUserSettings beatGridEnableStateForCollection:] selref@0x1bc3580
//   * -[NSDictionary objectForKey:]                               selref@0x1bb9158 (Foundation)
//   * -[NSSet allObjects]                                         selref@0x1bb9300 (Foundation)
//   * +[FFEnableBeatGridCommand canHideBeatsOnObjects:]           selref@0x1bd7a18
//   * +[FFEnableBeatGridCommand areAnyObjectsInCollectionShowingBeats:]  selref@0x1bd7ed0
//   * +[FFBeatGridUserSettings setBeatGridEnableState:onCollection:]     selref@0x1bd7ec0
//   * _objc_opt_class(cls)          libobjc                       (__stubs 0x149798c)
//   * _objc_opt_isKindOfClass(obj, cls)  libobjc                  (__stubs 0x1497992)
//   * _objc_msgSend(recv, sel, ...) libobjc                       (__got 0x18ed6c0)
//
// The class references above (FFAnchoredCollection / FFBeatGridUserSettings /
// FFEnableBeatGridCommand) live in the same Flexo binary and are not ported yet.

/**
 * Opaque forward-references. Each is a real Flexo ObjC class whose implementation lives
 * in a separate ledger entry. We surface them as unique-symbol brands so callers can
 * pass values around type-safely without any of the class internals being invented here.
 */
export interface FFAnchoredCollection {
  readonly __ffAnchoredCollectionBrand: unique symbol;
}
export interface FFBeatGridUserSettings {
  readonly __ffBeatGridUserSettingsBrand: unique symbol;
}
export interface FFEnableBeatGridCommand {
  readonly __ffEnableBeatGridCommandBrand: unique symbol;
}

/**
 * Foundation NSString-keyed dictionary. Signature-only; the body dispatches everything
 * through `-[NSDictionary objectForKey:]` / `-[NSDictionary count]`.
 */
export interface NSDictionary<_K = unknown, _V = unknown> {
  readonly __nsDictionary: unique symbol;
}

/**
 * Foundation NSSet (or any -allObjects/-count container). Signature-only.
 */
export interface NSSet<_E = unknown> {
  readonly __nsSet: unique symbol;
}

/**
 * A "sequence action" — Flexo's model of a timeline edit. The only two selectors
 * `sequenceActionWillEnd:` invokes on it are `changeDictionary` (the edit's before/after
 * bag keyed by FFAction* string keys) and `storyTimelinePresentationBackdoor`.
 */
export interface FFSequenceAction {
  readonly __ffSequenceAction: unique symbol;
}

/**
 * The presentation object returned by `storyTimelinePresentationBackdoor`. Only its
 * `-rootItem` selector is called from `sequenceActionWillEnd:` — we treat it as
 * signature-only.
 */
export interface FFStoryTimelinePresentation {
  readonly __ffStoryTimelinePresentation: unique symbol;
}

/**
 * The generic root-item returned by `-rootItem`; the method then narrows it to
 * FFAnchoredCollection via `_objc_opt_isKindOfClass`. Kept as an opaque any-object
 * placeholder pending decode of `FFStoryTimelinePresentation.rootItem`.
 */
export interface NSObject {
  readonly __nsObject: unique symbol;
}

/**
 * The three-valued beat-grid enable state passed to
 * `+[FFBeatGridUserSettings setBeatGridEnableState:onCollection:]`.
 *
 * Values observed as immediates in the body:
 *   - `0`  — set via `xorl %edx, %edx` @0x709849 (branch: "objects removed and none of the
 *            remaining objects are still showing beats" then force-DISABLE beats).
 *   - `2`  — set via `movl $0x2, %edx` @0x709881 (branch: "new objects were added and can
 *            legally hide beats" then force-ENABLE (or auto?) beats). Value `2` is what the
 *            binary encodes; the exact meaning of "2" belongs to FFBeatGridUserSettings.
 *
 * The value `1` never appears in this method's constant pool, so we don't invent it.
 */
export type FFBeatGridEnableState = 0 | 2;

/**
 * `_objc_msgSend(receiver, selector, ...)` — libobjc runtime call. In the decode this is
 * called through a cached IMP (register r12, loaded once from __got@0x18ed6c0). Every ObjC
 * selector invocation in the body is one of these. Signature-only stub: this port never
 * ships a JS runtime for ObjC dispatch — each observed message becomes a typed stub below.
 *
 * @throws always — decoded call sites resolve to concrete stubs, so this generic escape
 * hatch must not be reachable at runtime.
 */
function _objc_msgSend(_receiver: unknown, _selectorName: string, ..._args: unknown[]): never {
  throw new Error(
    "_objc_msgSend @Flexo 0x18ed6c0 not yet transcribed — libobjc runtime dispatch is out of scope; " +
    "each real selector site has its own throwing stub."
  );
}

/**
 * `_objc_opt_class(cls)` — libobjc fast-path returning `cls`. Called at @0x7097d2. Not
 * transcribed here; only used as an argument to `_objc_opt_isKindOfClass`.
 */
function _objc_opt_class(_cls: unknown): never {
  throw new Error("_objc_opt_class @Flexo __stubs 0x149798c not yet transcribed");
}

/**
 * `_objc_opt_isKindOfClass(obj, cls)` — libobjc fast-path for `[obj isKindOfClass:cls]`.
 * Called at @0x7097e2. Not transcribed here; the caller uses only its truthy/falsy return.
 */
function _objc_opt_isKindOfClass(_obj: unknown, _cls: unknown): never {
  throw new Error("_objc_opt_isKindOfClass @Flexo __stubs 0x1497992 not yet transcribed");
}

// -----------------------------------------------------------------------------
// Selector stubs — one per observed selref. Each is a throwing stub that cites the
// selref address it was resolved from, so `stubscan.py`/`frontier.py` can see the gap.
// -----------------------------------------------------------------------------

/** `-[FFSequenceAction changeDictionary]` — selref@0x1bbfc00, sent @0x70978f. */
function changeDictionary(_action: FFSequenceAction): NSDictionary {
  throw new Error(
    "-[FFSequenceAction changeDictionary] (selref @Flexo 0x1bbfc00, sent @0x70978f) not yet transcribed"
  );
}

/** `-[NSDictionary count]` — Foundation; selref@0x1bb8550, sent @0x7097a2 and @0x709826. */
function count(_container: NSDictionary | NSSet): number {
  throw new Error(
    "-[NSDictionary/NSSet count] (Foundation; selref @Flexo 0x1bb8550, sent @0x7097a2 and @0x709826) not yet transcribed"
  );
}

/** `-[FFSequenceAction storyTimelinePresentationBackdoor]` — selref@0x1bb99c8, sent @0x7097b8. */
function storyTimelinePresentationBackdoor(_action: FFSequenceAction): FFStoryTimelinePresentation {
  throw new Error(
    "-[FFSequenceAction storyTimelinePresentationBackdoor] (selref @Flexo 0x1bb99c8, sent @0x7097b8) not yet transcribed"
  );
}

/** `-[FFStoryTimelinePresentation rootItem]` — selref@0x1bb8a70, sent @0x7097c5. */
function rootItem(_pres: FFStoryTimelinePresentation): NSObject | null {
  throw new Error(
    "-[FFStoryTimelinePresentation rootItem] (selref @Flexo 0x1bb8a70, sent @0x7097c5) not yet transcribed"
  );
}

/**
 * `+[FFBeatGridUserSettings beatGridEnableStateForCollection:]` — class method,
 * selref@0x1bc3580, sent @0x7097fe. Return type is object-valued (rax truthy = "has
 * settings"), NOT scalar — the caller only checks `!= nil`, never reads the state.
 */
function beatGridEnableStateForCollection(
  _cls: "FFBeatGridUserSettings",
  _collection: FFAnchoredCollection | null,
): NSObject | null {
  throw new Error(
    "+[FFBeatGridUserSettings beatGridEnableStateForCollection:] (selref @Flexo 0x1bc3580, sent @0x7097fe) not yet transcribed"
  );
}

/** `-[NSDictionary objectForKey:]` — Foundation; selref@0x1bb9158, sent @0x70981d and @0x70985a. */
function objectForKey(_dict: NSDictionary, _key: string): NSObject | null {
  throw new Error(
    "-[NSDictionary objectForKey:] (Foundation; selref @Flexo 0x1bb9158, sent @0x70981d and @0x70985a) not yet transcribed"
  );
}

/** `-[NSSet allObjects]` — Foundation; selref@0x1bb9300, sent @0x70986e. */
function allObjects(_set: NSObject): NSObject {
  throw new Error(
    "-[NSSet allObjects] (Foundation; selref @Flexo 0x1bb9300, sent @0x70986e) not yet transcribed"
  );
}

/**
 * `+[FFEnableBeatGridCommand canHideBeatsOnObjects:]` — class method, selref@0x1bd7a18,
 * sent @0x70987e. Returns a boolean (only `testb %al, %al` @0x709886 checks its result).
 */
function canHideBeatsOnObjects(
  _cls: "FFEnableBeatGridCommand",
  _objects: NSObject,
): boolean {
  throw new Error(
    "+[FFEnableBeatGridCommand canHideBeatsOnObjects:] (selref @Flexo 0x1bd7a18, sent @0x70987e) not yet transcribed"
  );
}

/**
 * `+[FFEnableBeatGridCommand areAnyObjectsInCollectionShowingBeats:]` — class method,
 * selref@0x1bd7ed0, sent @0x70983f. Returns a boolean (only `testb %al, %al` @0x709845
 * checks its result).
 */
function areAnyObjectsInCollectionShowingBeats(
  _cls: "FFEnableBeatGridCommand",
  _collection: FFAnchoredCollection | null,
): boolean {
  throw new Error(
    "+[FFEnableBeatGridCommand areAnyObjectsInCollectionShowingBeats:] (selref @Flexo 0x1bd7ed0, sent @0x70983f) not yet transcribed"
  );
}

/**
 * `+[FFBeatGridUserSettings setBeatGridEnableState:onCollection:]` — class method,
 * selref@0x1bd7ec0, invoked as a tail-jmp @0x7098a3 (i.e. the body pops all callee-saved
 * regs and jumps through the cached msgSend IMP).
 */
function setBeatGridEnableStateOnCollection(
  _cls: "FFBeatGridUserSettings",
  _state: FFBeatGridEnableState,
  _collection: FFAnchoredCollection | null,
): void {
  throw new Error(
    "+[FFBeatGridUserSettings setBeatGridEnableState:onCollection:] (selref @Flexo 0x1bd7ec0, tail-sent @0x7098a3) not yet transcribed"
  );
}

/**
 * Global NSString constants — Flexo action-dictionary keys. The body loads their address
 * via `leaq _FFActionRemovedObjectsKey(%rip), %rax; movq (%rax), %rdx` — i.e. the
 * key-strings are read from imported __DATA symbols. Their VALUES are not decoded here;
 * we treat them as opaque tokens matching the FCP-app-side string constants.
 */
const kFFActionRemovedObjectsKey: string = "@Flexo 0x19242d8 FFActionRemovedObjectsKey (not yet transcribed)";
const kFFActionNewObjectsKey: string = "@Flexo 0x19242c8 FFActionNewObjectsKey (not yet transcribed)";

/**
 * FFUpdateBeatGridCollectionStateActionHook — Flexo NSObject subclass with a single
 * instance selector, `sequenceActionWillEnd:`.
 *
 * The port is written as a class so the FCP method boundary maps 1:1 to a TS boundary
 * (Rule 6, one class per file, matches the ledger key exactly).
 */
export class FFUpdateBeatGridCollectionStateActionHook {
  /**
   * `-[FFUpdateBeatGridCollectionStateActionHook sequenceActionWillEnd:]`
   * `@Flexo 0x709770` — full 0x142-byte transcription (see file header for full flow).
   *
   * Structure faithfully mirrors the disasm branches:
   *   - empty-changeDict short-circuit at @0x7097a8
   *   - kind-of-class narrowing of the presentation root-item at @0x7097d2..0x7097eb
   *   - `beatGridEnableStateForCollection:` split @0x70980e — settings-present vs settings-absent
   *   - removed-objects short-circuits at @0x70982c and @0x709847
   *   - new-objects short-circuit at @0x709888
   *   - tail-call `setBeatGridEnableState:onCollection:` at @0x7098a3
   *
   * Every branch calls into a throwing stub above — the caller CANNOT execute this in
   * this port; the transcription documents the exact dispatch shape so downstream
   * porters filling in the selector stubs can wire the whole tree without re-decoding.
   *
   * @param action  the FFSequenceAction whose edit is about to complete
   */
  sequenceActionWillEnd(action: FFSequenceAction): void {
    // @0x70978f — msgSend(action, "changeDictionary")
    const changeDict: NSDictionary = changeDictionary(action);
    // @0x7097a2 — msgSend(changeDict, "count"); test rax; je 0x7098a9 (EXIT).
    if (count(changeDict) === 0) {
      return;
    }
    // @0x7097b8 — msgSend(action, "storyTimelinePresentationBackdoor")
    const presentation: FFStoryTimelinePresentation = storyTimelinePresentationBackdoor(action);
    // @0x7097c5 — msgSend(presentation, "rootItem"); mov rax, rbx
    let collection: FFAnchoredCollection | null = null;
    const rootItemResult: NSObject | null = rootItem(presentation);
    // @0x7097cb — leaq _OBJC_CLASS_$_FFAnchoredCollection(%rip), %rdi
    // @0x7097d2 — callq _objc_opt_class  (returns the class object in %rax)
    const acClass = _objc_opt_class("FFAnchoredCollection");
    // @0x7097d7..0x7097eb — the "if rootItem == nil, keep collection nil" AND the
    // "if !isKindOfClass, set collection nil" combined via je 0x7097ed + jne 0x7097ed.
    if (rootItemResult !== null) {
      // @0x7097e2 — callq _objc_opt_isKindOfClass(rootItem, FFAnchoredCollection)
      if (_objc_opt_isKindOfClass(rootItemResult, acClass)) {
        collection = rootItemResult as unknown as FFAnchoredCollection;
      }
      // else: leave `collection` = null (encoded as `xorl %ebx, %ebx` @0x7097eb).
    }

    // @0x7097fe — msgSend(FFBeatGridUserSettings.class,
    //                     "beatGridEnableStateForCollection:", collection)
    const settings: NSObject | null = beatGridEnableStateForCollection(
      "FFBeatGridUserSettings",
      collection,
    );

    // @0x70980b — testq %rax, %rax; @0x70980e — je 0x70984d (ELSE_NEW branch).
    let newState: FFBeatGridEnableState;
    if (settings !== null) {
      // THEN branch (settings present) — "removedObjects" leg, starts @0x709810.
      // @0x70981d — msgSend(changeDict, "objectForKey:", FFActionRemovedObjectsKey)
      const removedObjs = objectForKey(changeDict, kFFActionRemovedObjectsKey);
      // @0x709826 — msgSend(removedObjs, "count"); testq; je 0x7098a9 (EXIT)
      // (Note: -count on nil returns 0 in ObjC, so this correctly no-ops when the key
      //  is absent — the disasm relies on that runtime behavior.)
      if (removedObjs === null || count(removedObjs as unknown as NSDictionary) === 0) {
        return;
      }
      // @0x70983f — msgSend(FFEnableBeatGridCommand.class,
      //                     "areAnyObjectsInCollectionShowingBeats:", collection)
      // @0x709845 — testb %al, %al; @0x709847 — jne 0x7098a9 (EXIT)
      if (areAnyObjectsInCollectionShowingBeats("FFEnableBeatGridCommand", collection)) {
        return;
      }
      // @0x709849 — xorl %edx, %edx  (newState = 0)
      newState = 0;
      // @0x70984b — jmp 0x70988a (falls into the TAIL block).
    } else {
      // ELSE branch (settings absent) — "newObjects" leg, starts @0x70984d.
      // @0x70985a — msgSend(changeDict, "objectForKey:", FFActionNewObjectsKey)
      const newObjs = objectForKey(changeDict, kFFActionNewObjectsKey);
      // @0x70986e — msgSend(newObjs, "allObjects")
      // (Same nil-tolerance as above: -allObjects on nil returns nil; -canHideBeatsOnObjects:
      //  is a class method that handles a nil array.)
      const newObjsArr = newObjs === null ? (newObjs as unknown as NSObject) : allObjects(newObjs);
      // @0x70987e — msgSend(FFEnableBeatGridCommand.class,
      //                     "canHideBeatsOnObjects:", newObjsArr)
      const ok: boolean = canHideBeatsOnObjects("FFEnableBeatGridCommand", newObjsArr);
      // @0x709881 — movl $0x2, %edx  (newState = 2, set BEFORE the test)
      newState = 2;
      // @0x709886 — testb %al, %al; @0x709888 — je 0x7098a9 (EXIT when !ok).
      if (!ok) {
        return;
      }
      // fall through to TAIL.
    }

    // TAIL @0x70988a..0x7098a3 —
    //   [FFBeatGridUserSettings setBeatGridEnableState:newState onCollection:collection]
    // In the disasm this is a `jmpq *0x18ed6c0(%rip)` after restoring callee-saved regs;
    // %rdi = FFBeatGridUserSettings class, %rsi = "setBeatGridEnableState:onCollection:"
    // selref, %rdx = newState, %rcx = rbx = collection.
    setBeatGridEnableStateOnCollection("FFBeatGridUserSettings", newState, collection);
  }
}
