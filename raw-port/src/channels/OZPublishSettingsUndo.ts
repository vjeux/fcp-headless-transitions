// OZPublishSettingsUndo.ts — Ozone undo record for OZPublishSettings.
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/
//         Ozone.framework/Versions/A/Ozone (macOS FCP, x86_64 slice).
//
// Symbols ported (all six methods brief.py listed):
//   * OZPublishSettingsUndo::OZPublishSettingsUndo(
//         OZPublishSettings const&)                              [C2] @0x1017c0
//   * OZPublishSettingsUndo::OZPublishSettingsUndo(
//         OZPublishSettings const&)                              [C1] @0x1017e0
//   * OZPublishSettingsUndo::~OZPublishSettingsUndo()            [D2] @0x101800
//   * OZPublishSettingsUndo::~OZPublishSettingsUndo()            [D1] @0x101820
//   * OZPublishSettingsUndo::~OZPublishSettingsUndo()            [D0] @0x101840
//   * OZPublishSettingsUndo::Swap()                              @0x101870
//
// Also referenced (installed by the ctor/dtor bodies):
//   * vtable for OZPublishSettingsUndo:  `__ZTV21OZPublishSettingsUndo`
//     installed-ptr at Ozone VA 0x83d650 (base+0x10 skew per Itanium ABI);
//     verified via `resolve.py Ozone sym 0x83d650` → "vtable for
//     OZPublishSettingsUndo (+0x10)". Slot layout (from vtable.py):
//       *0x00 → ~OZPublishSettingsUndo  (D1 @0x101820)
//       *0x08 → ~OZPublishSettingsUndo  (D0 @0x101840, delete-thunk)
//       *0x10 → Swap()                  (@0x101870)
//     The remainder of the __ZTV blob at 0x83d650 is a sequence of
//     secondary sub-object vtables (OZCurveSetUndo at +0x20,
//     OZLastModifiedChannelsUndo at +0x48, OZKeypointModificationUndo at
//     +0x70, OZEditBoxUndo at +0x98) — NOT part of this class; they are
//     siblings that share the enclosing "undo-record" family. Only the
//     first three primary-vtable slots are exposed by this class.
//
// -----------------------------------------------------------------------------
// OBJECT LAYOUT
// -----------------------------------------------------------------------------
//   +0x00  vptr    — installed by the ctor (`leaq 0x73be85(%rip),%rax;
//                    movq %rax,(%rdi)` @0x1017c4..0x1017cb).
//   +0x08  OZPublishSettings   subobject (embedded, not pointer).
//                    The ctor's `addq $0x8, %rdi; jmp OZPublishSettings::C1`
//                    @0x1017ce..0x1017d3 tail-jumps into the OZPublishSettings
//                    copy-ctor with `this+0x08` as its own `this` pointer.
//                    The dtor mirror does the same for
//                    OZPublishSettings::~OZPublishSettings() @0x101813.
//
//   sizeof(OZPublishSettingsUndo) = 8 + sizeof(OZPublishSettings). The C++
//   class is essentially `class OZPublishSettingsUndo : polymorphic-tag {
//       OZPublishSettings settings; }` — a virtual-vtable wrapper around
//   an OZPublishSettings by-value. This layout is confirmed by the Swap()
//   body: `addq $0x8, %rbx` @0x1018b1 converts the OZPublishSettingsUndo*
//   into a pointer to its embedded OZPublishSettings, then passes that
//   into a virtual and into `OZPublishSettings::operator=`.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES — cited by symbol + address; all THROW when hit.
// -----------------------------------------------------------------------------
//   * OZPublishSettings::OZPublishSettings(OZPublishSettings const&)
//                                             — @0x1017d3 (C2 tail-jmp)
//                                                / @0x1017f3 (C1 tail-jmp)
//                                                / @0x1018ac (Swap tmp)
//   * OZPublishSettings::~OZPublishSettings() — @0x101813 (D2 tail-jmp)
//                                                / @0x101833 (D1 tail-jmp)
//                                                / @0x101857 (D0 body)
//                                                / @0x1018ec (Swap tmp cleanup)
//                                                / @0x10190b (Swap unwind cleanup)
//   * OZPublishSettings::operator=(OZPublishSettings const&)
//                                             — @0x1018cf (Swap)
//   * OZPublishSettings vtable slot +0x48    — @0x1018c2 (Swap; virtual
//                                                dispatched on the SCENE's
//                                                OZPublishSettings subobject
//                                                to copy the sentinel's
//                                                previous state into it — see
//                                                below).
//   * _theApp                                 — a global at Ozone RIP-relative
//                                                +0x1018 (via `leaq _theApp(%rip)`
//                                                @0x101883). Holds the running
//                                                `OZApplication*`.
//   * OZApplication::getCurrentDoc()          — @0x10188d
//   * OZScene::getTokensImage(...)            — @0x1018db loads its symbol
//                                                ADDRESS into %esi with
//                                                `movl $sym, %esi` (i.e.
//                                                truncated to 32 bits). This
//                                                is not called — its address
//                                                is USED AS A NOTIFICATION KEY
//                                                (a common Cocoa/Ozone idiom:
//                                                a function pointer's address
//                                                is used as a unique unsigned-
//                                                int identifier for a
//                                                notification channel).
//   * OZDocument::postNotification(unsigned int)
//                                             — @0x1018e0
//   * operator delete (__ZdlPv)               — @0x101865 (D0 tail-jmp)
//   * __Unwind_Resume                         — @0x101913 (Swap unwind)
//
// -----------------------------------------------------------------------------
// SCENE/DOCUMENT LAYOUT (only offsets touched by this class)
// -----------------------------------------------------------------------------
//   OZDocument:
//     +0x08  OZScene*    currentScene? — `movq 0x8(%rax), %r15` @0x101892.
//                                        Null-guarded @0x101896-0x101899.
//   OZScene:
//     +0x1f0  OZPublishSettings  publishSettings (embedded).
//                                        Address taken @0x10189b; vtable
//                                        loaded @0x1018b5.
//     +0x588  ptr        — the OZDocument (or similar) that
//                          `postNotification` is called on.
//                          `movq 0x588(%r15), %rdi` @0x1018d4.
//
// -----------------------------------------------------------------------------
// The class holds no arithmetic — it is a virtualized undo-record: on
// destruction (via ~D1) the OZPublishSettings state stored inside it is
// simply released; the interesting side-effect is Swap(), which pushes
// the sentinel's captured state back onto the live document. Nothing here
// is bit-exactable, so raw-port/army/gate/oracle_map.json is NOT extended.
//
// @class OZPublishSettingsUndo (Ozone)

/**
 * `OZPublishSettings` — the embedded value the undo record wraps. Its C++
 * ctor/dtor/copy-assign are ALL that this class calls; not yet ported.
 *
 * @source Ozone (`17OZPublishSettings`)
 */
export interface OZPublishSettings {
  /** Fresh copy of this OZPublishSettings — @Ozone 0x1017d3 etc. */
  clone(): OZPublishSettings;
  /**
   * Copy-assign — writes the other's state into this. @Ozone 0x1018cf.
   */
  assign(other: OZPublishSettings): OZPublishSettings;
  /**
   * Virtual vtable slot +0x48 (dispatched at @Ozone 0x1018c2). The Swap
   * body calls `sceneSettings.vtable+0x48(&this.settings)` — that is,
   * copies the caller-provided `dst` INTO `sceneSettings` in some
   * class-specific way (e.g. "replace all keys AND repost").  The exact
   * semantics require porting OZPublishSettings itself.
   */
  vtable_slot_48_copyInto(dst: OZPublishSettings): void;
  /** Non-polymorphic dtor — @Ozone 0x101813 etc. */
  destroy(): void;
}

/**
 * `OZScene` — the current-doc's active scene. Only two fields are
 * touched (see layout comment above); not yet ported.
 *
 * @source Ozone (`7OZScene`)
 */
export interface OZScene {
  /** +0x1f0 — the scene's OZPublishSettings subobject (by value in C++). */
  publishSettings: OZPublishSettings;
  /**
   * +0x588 — the owning OZDocument (or a similar notification host).
   * `postNotification` @Ozone 0x1018e0 is dispatched on it.
   */
  notificationHost: OZDocument;
}

/**
 * `OZDocument` — the running document.
 *
 * @source Ozone (`10OZDocument`)
 */
export interface OZDocument {
  /** +0x08 — the currently-active OZScene (or null). */
  currentScene: OZScene | null;
  /**
   * `postNotification(u32)` — @Ozone 0x1018e0. The u32 identifier is
   * commonly the low 32 bits of a distinguishing function-symbol address
   * (see notes on `OZScene::getTokensImage` below).
   */
  postNotification(notificationId: number): void;
}

/**
 * `OZApplication` — the singleton hanging off `_theApp` at Ozone
 * RIP+0x1018 (loaded @0x101883). Not yet ported.
 *
 * @source Ozone (`13OZApplication`)
 */
export interface OZApplication {
  /** @Ozone 0x10188d — returns the front-of-stack document (or null). */
  getCurrentDoc(): OZDocument | null;
}

/**
 * `_theApp` — the global Ozone Application pointer. Its address is
 * baked into the executable via `leaq _theApp(%rip), %rax; movq (%rax),
 * %rdi` @0x101883-0x10188a; the JS port surfaces it as an injectable
 * accessor rather than a module-level singleton.
 *
 * @addr 0x101883 (Ozone, RIP-relative to `_theApp`)
 */
export type TheAppGetter = () => OZApplication;

/**
 * The notification identifier used at @Ozone 0x1018db is the LOW-32-BITS
 * of the symbol address of
 * `OZScene::getTokensImage(OZRenderParams const&, ...)`.  The `movl
 * $sym, %esi` truncation is deliberate — Ozone reuses the symbol's
 * address as a unique unsigned-int key for the notification channel.
 * The JS port surfaces this as a brand-typed number the host is expected
 * to seed with the actual runtime address; the sentinel just forwards it.
 *
 * @addr 0x1018db (Ozone; `movl $__ZN7OZScene14getTokensImage..., %esi`)
 */
export type OZScene_getTokensImage_notification_key = number & {
  readonly __brand: "OZScene::getTokensImage low32 addr";
};

/**
 * OZPublishSettingsUndo — a virtual-tagged wrapper around a copy of
 * `OZPublishSettings` that, when destroyed via ~D0 or when its Swap()
 * method is invoked, restores/broadcasts the captured settings.
 *
 * Layout:
 *   +0x00  vtable  → Ozone installed-ptr 0x83d650 (`__ZTV21OZPublishSettingsUndo`)
 *   +0x08  settings — the embedded OZPublishSettings value.
 *
 * @source Ozone
 * @classAddr 0x1017c0 (C2)
 */
export class OZPublishSettingsUndo {
  /**
   * +0x08 — the embedded OZPublishSettings copy. Populated by the ctor
   * via `OZPublishSettings::OZPublishSettings(const&)` tail-jumping with
   * `this+0x08` as its `this` @0x1017ce-0x1017d3.
   */
  settings: OZPublishSettings;

  /**
   * `OZPublishSettingsUndo::OZPublishSettingsUndo(OZPublishSettings const&)`
   * — C2 body @0x1017c0 (C1 @0x1017e0 is byte-identical; both install
   * the same vtable base+0x10 = Ozone VA 0x83d650 and tail-jmp into
   * `OZPublishSettings::OZPublishSettings(OZPublishSettings const&)`
   * with `this+0x08` as the callee's `this`).
   *
   * Mirrored control flow:
   *   pushq %rbp; movq %rsp, %rbp                                  @0x1017c0
   *   leaq 0x73be85(%rip), %rax                                    @0x1017c4
   *     — %rax = &__ZTV21OZPublishSettingsUndo + 0x10 (Ozone 0x83d650).
   *   movq %rax, (%rdi)                                            @0x1017cb
   *     — install vtable pointer at *(this).
   *   addq $0x8, %rdi ; popq %rbp                                  @0x1017ce-0x1017d2
   *     — %rdi = &this->settings (subobject base = this + 0x08).
   *   jmp __ZN17OZPublishSettingsC1ERKS_                            @0x1017d3
   *     — tail-jmp: copy-construct the embedded OZPublishSettings from
   *       the caller-supplied const-ref (%rsi is preserved from the
   *       outer call).
   *
   * In JavaScript we express the "install-vtable" bit as an implicit
   * class-identity fact (the `this instanceof OZPublishSettingsUndo`
   * relationship stands in for the __ZTV pointer), and the "tail-jmp
   * copy-ctor" as a straight `settings = other.clone()` call. The
   * semantic equivalence is byte-preserving so long as
   * `OZPublishSettings.clone()` mirrors its C++ copy-ctor.
   *
   * @addr 0x1017c0 (Ozone C2)
   */
  constructor(other: OZPublishSettings) {
    // @0x1017c4-0x1017cb — vtable install. Modeled by JS class identity.
    // @0x1017ce-0x1017d3 — tail-jmp to OZPublishSettings::OZPublishSettings.
    this.settings = other.clone();
  }

  /**
   * ~OZPublishSettingsUndo() — the class publishes THREE dtor symbols:
   *   * D2 @0x101800 — the base-object dtor (`pushq %rbp; movq %rsp,%rbp;
   *       leaq vtable, %rax; movq %rax,(%rdi); addq $0x8,%rdi; popq %rbp;
   *       jmp OZPublishSettings::~()`).
   *   * D1 @0x101820 — byte-identical to D2. Both are complete-object
   *       dtors — they REinstall the vtable pointer at *(this) (per the
   *       standard Itanium ABI's "as you leave a base subobject, install
   *       ITS vtable so any subsequent virtual call in a derived-class
   *       dtor sees the right override table") and then tail-jump into
   *       the OZPublishSettings dtor with `this+0x08` as `this`.
   *   * D0 @0x101840 — the delete-thunk. Same vtable re-install + tail-
   *       release, PLUS a `__ZdlPv` (`operator delete`) call at the end
   *       (`callq __ZN17OZPublishSettingsD1Ev; movq %rbx,%rdi;
   *         jmp __ZdlPv` @0x101857-0x101865).
   *
   * In JS the three collapse to one method; a host that needs the
   * "delete-thunk" form can call `destroy()` and then drop the reference
   * — the JS GC does the operator-delete step.
   *
   * @addr 0x101800 (Ozone D2) / 0x101820 (D1) / 0x101840 (D0)
   */
  destroy(): void {
    // @0x101804-0x10180b — re-install vtable (modeled by JS class identity).
    // @0x10180e-0x101813 — tail-jmp OZPublishSettings::~OZPublishSettings.
    this.settings.destroy();
  }

  /**
   * OZPublishSettingsUndo::Swap() @0x101870.
   *
   * Purpose: this is the "apply undo" operation. It (1) snapshots the
   * live scene's OZPublishSettings, (2) writes the sentinel's captured
   * previous state INTO the live scene via a virtual slot, (3) copies
   * the just-snapped previous-scene state INTO the sentinel's own slot
   * (so that a subsequent Swap() flips back the other way — classic
   * undo/redo alternation), and (4) posts a notification.
   *
   * Mirrored control flow:
   *   %rdi = this (OZPublishSettingsUndo*)
   *   pushq %rbp; movq %rsp,%rbp
   *   pushq %r15; pushq %r14; pushq %rbx
   *   subq $0xc8, %rsp                                             @0x101879
   *   movq %rdi, %rbx                                              @0x101880
   *     — %rbx = this.
   *   leaq _theApp(%rip), %rax ; movq (%rax), %rdi                 @0x101883-0x10188a
   *   callq OZApplication::getCurrentDoc()                          @0x10188d
   *     — %rax = doc (or null; but null is not tested here — the code
   *       trusts getCurrentDoc's return).
   *   movq 0x8(%rax), %r15                                          @0x101892
   *     — %r15 = doc->currentScene (via OZDocument +0x08).
   *   testq %r15, %r15 ; je .Lret                                   @0x101896-0x101899
   *     — null-scene guard: skip everything.
   *   leaq 0x1f0(%r15), %r14                                        @0x10189b
   *     — %r14 = &scene->publishSettings (scene + 0x1f0).
   *   leaq -0xe0(%rbp), %rdi ; movq %r14, %rsi                      @0x1018a2-0x1018a9
   *     — build a stack-tmp OZPublishSettings from the scene's copy.
   *   callq OZPublishSettings::OZPublishSettings(const&)            @0x1018ac
   *     — tmp = scene->publishSettings.
   *   addq $0x8, %rbx                                               @0x1018b1
   *     — %rbx = &this->settings (this + 0x08).
   *   movq 0x1f0(%r15), %rax                                        @0x1018b5
   *     — %rax = *(scene+0x1f0) = the vtable ptr at the start of the
   *       scene's embedded OZPublishSettings subobject.
   *   movq %r14, %rdi ; movq %rbx, %rsi ; callq *0x48(%rax)          @0x1018bc-0x1018c2
   *     — virtual slot +0x48 on scene->publishSettings; arg is
   *       &this->settings. Semantically: "copy `this.settings` INTO the
   *       scene's publishSettings via the settings' virtual copy slot".
   *   leaq -0xe0(%rbp), %rsi ; movq %rbx, %rdi                       @0x1018c5-0x1018cc
   *   callq OZPublishSettings::operator=(const&)                     @0x1018cf
   *     — this.settings = tmp  (the snapped prev-scene state).
   *   movq 0x588(%r15), %rdi                                          @0x1018d4
   *     — %rdi = scene->notificationHost (a doc / notification host).
   *   movl $__ZN7OZScene14getTokensImage..., %esi                    @0x1018db
   *     — %esi = low-32-bits of the address of OZScene::getTokensImage,
   *       used here as an unsigned-int notification key (see note above).
   *   callq OZDocument::postNotification(unsigned int)               @0x1018e0
   *     — dispatch the notification.
   *   leaq -0xe0(%rbp), %rdi ; callq OZPublishSettings::~()          @0x1018e5-0x1018ec
   *     — tmp dtor.
   *   .Lret: epilogue.
   *
   * Exception path @0x1018ff-0x101913 destroys the stack tmp and
   * re-raises via `__Unwind_Resume`. In JS the equivalent is a
   * try/finally around the tmp lifetime; the stub-throwing callees
   * we wire in propagate naturally, so we skip the explicit finally.
   *
   * @addr 0x101870 (Ozone)
   */
  Swap(getTheApp: TheAppGetter, notificationKey: OZScene_getTokensImage_notification_key): void {
    // @0x101883-0x101892 — resolve doc.currentScene from the app singleton.
    const app = getTheApp();
    const doc = app.getCurrentDoc();
    // The asm skips a null-doc check but WILL crash on `movq 0x8(NULL)`
    // if getCurrentDoc returned null. We model that as a preserved
    // precondition — if the doc is null, the C++ code segfaults; the
    // JS port raises rather than silently no-op.
    if (doc === null) {
      throw new Error(
        "OZPublishSettingsUndo::Swap @Ozone 0x101892 — " +
          "OZApplication::getCurrentDoc() returned null; the C++ path " +
          "dereferences that pointer at %rax+0x8 with no guard — a null " +
          "doc is undefined behavior and cannot be transcribed to a " +
          "meaningful JS op.",
      );
    }
    const scene = doc.currentScene;
    // @0x101896-0x101899 — testq %r15; je .Lret. Null-scene short-circuits.
    if (scene === null) return;

    // @0x10189b-0x1018ac — tmp = scene.publishSettings.clone().
    const tmp: OZPublishSettings = scene.publishSettings.clone();

    // @0x1018b1-0x1018c2 — virtual slot +0x48 on scene.publishSettings,
    // with THIS undo record's captured settings as the src arg.
    // Semantically: scene.publishSettings <- this.settings (with virtual
    // behavior for subclass-specific fields).
    scene.publishSettings.vtable_slot_48_copyInto(this.settings);

    // @0x1018c5-0x1018cf — this.settings = tmp (the snapshot from
    // BEFORE we clobbered the scene). Classic swap-through-copy.
    this.settings.assign(tmp);

    // @0x1018d4-0x1018e0 — post notification. The %esi arg is the low-
    // 32 bits of OZScene::getTokensImage's symbol address — the JS host
    // supplies that number as `notificationKey` (see the
    // `OZScene_getTokensImage_notification_key` brand type above).
    scene.notificationHost.postNotification(notificationKey);

    // @0x1018e5-0x1018ec — drop the stack tmp.
    tmp.destroy();
  }
}
