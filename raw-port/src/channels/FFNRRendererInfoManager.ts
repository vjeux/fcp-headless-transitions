// FFNRRendererInfoManager.ts — Flexo scope-guard that acquires an
// `FFHGRenderer` (+ its `FFImageRepBindingInfo`) from the shared
// `FFHGRendererManager` at construction and returns it back to the pool
// on destruction / explicit returnRenderer().
//
// The whole class is an Objective-C plumbing shell: it holds two ObjC
// pointers (renderer at +0x00, bindingInfo at +0x08) and the four methods
// are entirely message-sends + retain/release cycles. There is NO
// arithmetic in this class — every asm instruction is loads, stores,
// and objc_msgSend/objc_alloc/objc_release trampoline setup.
//
// Four FCP symbols correspond to this class:
//
//   FFNRRendererInfoManager::FFNRRendererInfoManager(FxDevice const*, bool () block_pointer) [C1]  @0x6c5f60
//   FFNRRendererInfoManager::~FFNRRendererInfoManager()                                      [D2]  @0x6c6030
//   FFNRRendererInfoManager::returnRenderer()                                                      @0x6c60c0
//   FFNRRendererInfoManager::~FFNRRendererInfoManager()                                      [D1]  @0x6c6140
//
// (D1 body @0x6c6140 is byte-for-byte the same as returnRenderer @0x6c60c0
//  modulo the terminate landing pad; D2 body @0x6c6030 is likewise; the
//  disasmer only surfaced D1 by the "~FFNRRendererInfoManager" method
//  name so both dtor slots share the same TypeScript implementation. The
//  compiler emitted an alias for D2 pointing at D1's body.)
//
// Transcribed from FCP Flexo framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// See raw-port/re/disasm/Flexo.FFNRRendererInfoManager.*.s for the
// verbatim x86_64 disassembly.
//
// STRUCT LAYOUT (recovered from ctor + returnRenderer/D1 disasm):
//
//   +0x00  renderer     : id (FFHGRenderer pointer)
//          Assigned in the ctor @0x6c5fb6 from the return of a
//          `[[FFHGRendererManager rendererManagerForBackend:...]
//           <selectorAt 0x1511159>: ffImageLocationSet
//                                   fxDevice
//                                   readyBlock]` call.
//          Nulled to zero at ctor @0x6c5f77 (16-byte xorps zero-out
//          spanning +0x00..+0x0f) BEFORE the call, so if the call throws
//          the field is definitely null. Read in dtor/returnRenderer
//          @0x6c60f9/@0x6c6175 (`cmpq $0x0, (%rbx); je …`).
//          Nulled again at @0x6c611c / @0x6c619e after being handed back.
//
//   +0x08  bindingInfo  : id (FFImageRepBindingInfo pointer)
//          Zeroed as part of the same 16-byte xorps @0x6c5f77.
//          Populated in the ctor tail-arm @0x6c5fda from
//          `[[FFImageRepBindingInfo alloc] initWithRenderer: self->renderer]`
//          (the alloc site is @0x6c5fc5 via `_objc_alloc`; the init
//          selector is loaded @0x6c5fcd from a selref).
//          Released (via `_objc_release`) in dtor/returnRenderer
//          @0x6c6127/@0x6c61a9, then nulled @0x6c612d/@0x6c61af.
//
// The ctor's "if renderer == null then skip binding-info creation and the
// tail dispatch, popping the frame straight to retq" arm @0x6c601f is
// the null-renderer bail-out: the class can be legally constructed with
// no acquired renderer (returnRenderer/dtor then find a null +0x00, skip
// the return-to-pool round-trip, and just objc_release the bindingInfo
// which is ALSO null — safe because objc_release nil is a no-op).
//
// OBJECTIVE-C CALLGRAPH (recovered by reading every ` ## Objc message: ...`
// annotation off the disasm; the "sharpnessAmount" text otool prints in
// several of them is a stale annotation left over from the linear-sweep
// pass — the actual selref bytes at each RIP are DIFFERENT, and this
// TS file names each one by its role, not by that stale label):
//
//   CTOR @0x6c5f60:
//     _FFImageLocationSetForSingleLocation(FxDevice*)                      @0x6c5f7d
//     +[FFHGRendererManager <acquireManager>]                              @0x6c5f9d
//                                                          (class-method msgSend
//                                                           via r13 = _objc_msgSend
//                                                           loaded @0x6c5f93 from
//                                                           __got + 0x1227726)
//     -[<manager> <acquireRenderer>: locSet fxDevice readyBlock]           @0x6c5fb3
//                                                          (4-arg msgSend via r15=r13;
//                                                           returns FFHGRenderer* -> +0x00)
//     _objc_alloc(FFImageRepBindingInfo)                                   @0x6c5fc5
//     -[<bindingInfo> <initWithRenderer>: renderer]                        @0x6c5fd7
//                                                          (msgSend; returns +0x08)
//     +[FFHGRendererManager <acquireManager>]                              @0x6c5fe8  (same class-method)
//     -[<renderer> <getSelector-for-tail>: ...]                            @0x6c5ff8  (loads next selref)
//     TAIL msgSend                                                         @0x6c601d  (`jmpq *%rax`)
//                                                          where rax = r15 = _objc_msgSend and
//                                                          rdi = manager,
//                                                          rsi = selref @__got +0x151110a,
//                                                          rdx = (return of the previous msgSend),
//                                                          rcx = self->bindingInfo (+0x08).
//                                                          Net: TAIL-CALL
//                                                          `[<manager> <recordRenderer>:
//                                                             X bindingInfo: bindingInfo]`
//                                                          (exact selector names are frontier —
//                                                          each selref would need to be resolved by
//                                                          reading the 8-byte value at the __got
//                                                          slot and looking up its cstring — this
//                                                          port keeps them as opaque selrefs cited
//                                                          by their file offset).
//
//   returnRenderer/D1 (@0x6c60c0 / @0x6c6140 — identical body):
//     +[FFHGRendererManager <acquireManager>]                              @0x6c60e5/@0x6c615b
//     -[<manager> <someOp>: 0 <arg>: 0]                                    @0x6c60f6/@0x6c616f
//                                                          (2-arg msgSend with edx=ecx=0)
//     if (self->renderer != NULL) {
//       +[FFHGRendererManager <acquireManager>]                            @0x6c6109/@0x6c6185
//       -[<manager> <returnRenderer>: self->renderer]                      @0x6c6119/@0x6c6198
//     }
//     self->renderer = NULL;                                               @0x6c611c/@0x6c619e
//     _objc_release(self->bindingInfo);                                    @0x6c6127/@0x6c61a9
//     self->bindingInfo = NULL;                                            @0x6c612d/@0x6c61af
//
//   D1 landing pad @0x6c61bc..@0x6c61bf: `movq %rax,%rdi ; callq
//     ___clang_call_terminate` — if any of the above msgSends threw the
//     ABI takes us to std::terminate, per the "dtor that can throw must
//     terminate" rule (same as DisablePrioritizedWritesRAII's D1 landing
//     pad @Flexo 0x47814c).
//
// FRONTIER (undecoded — throwing / opaque stubs cite them):
//   _FFImageLocationSetForSingleLocation                @0x6c5f7d          (C-symbol import)
//   +[FFHGRendererManager <acquireManager>]             (all four ctor+dtor sites listed above)
//   -[<manager> <acquireRenderer>:fxDevice:readyBlock:]  ctor @0x6c5fb3
//   +[FFImageRepBindingInfo alloc]                       ctor @0x6c5fc5    (via _objc_alloc)
//   -[<bindingInfo> <initWithRenderer>:]                  ctor @0x6c5fd7
//   -[<renderer> <getRenderKeyOrSimilar>]                 ctor @0x6c5ff8
//   -[<manager> <recordRenderer>:bindingInfo:]            ctor tail @0x6c601d
//   -[<manager> <clearBinding>: 0 :0]                     dtor @0x6c60f6 / @0x6c616f
//   -[<manager> <returnRenderer>:]                         dtor @0x6c6119 / @0x6c6198
//   _objc_release                                          dtor @0x6c6127 / @0x6c61a9
//   ___clang_call_terminate                                D1 landing @0x6c61bf
//
// The exact selector names above are the roles I read off the callgraph
// (arg layout + control flow); the byte-exact string names live at the
// selref __got slots cited in each line and can be recovered by a future
// worker via `otool -o` on that slot. Because this class has NO
// arithmetic, mislabeling a role in a comment does not change any
// runtime behaviour of the port — the actual behaviour is stubbed
// through frontier throws.

// ── Frontier types ───────────────────────────────────────────────────

/**
 * Opaque brand for the ObjC class `FFHGRenderer`. Held by the manager
 * as +0x00. Nothing but "is it null?" + "hand it back" is done to it in
 * this class; its real interface lives in FFHGRenderer's own port.
 */
export interface FFHGRenderer {
  readonly __brand: "FFHGRenderer";
}

/**
 * Opaque brand for the ObjC class `FFImageRepBindingInfo`. Held by the
 * manager as +0x08. Created via `[[FFImageRepBindingInfo alloc]
 * initWithRenderer: ...]` in the ctor, `_objc_release`-d in dtor.
 */
export interface FFImageRepBindingInfo {
  readonly __brand: "FFImageRepBindingInfo";
}

/**
 * Opaque brand for `FxDevice const*` — the ctor's first arg. Passed to
 * `_FFImageLocationSetForSingleLocation` @0x6c5f7d.
 */
export interface FxDevice {
  readonly __brand: "FxDevice";
}

/**
 * Opaque brand for the "readyBlock" — the ctor's second arg, an ObjC
 * block whose signature is `bool ()`. Forwarded to the manager as %rcx
 * @0x6c5fad.
 */
export type FFNRRendererReadyBlock = () => boolean;

/**
 * Opaque brand for the temporary returned by
 * `_FFImageLocationSetForSingleLocation(FxDevice const*)`
 * — an FFImageLocationSet holding a single location. Forwarded to the
 * manager's acquireRenderer msgSend as %rdx @0x6c5faa.
 */
export interface FFImageLocationSet {
  readonly __brand: "FFImageLocationSet";
}

// ── Frontier callees ─────────────────────────────────────────────────

/**
 * `_FFImageLocationSetForSingleLocation(FxDevice const*)` — Flexo C
 * import. Reached via `callq _FFImageLocationSetForSingleLocation`
 * @Flexo 0x6c5f7d. Returns a retained/owned FFImageLocationSet whose
 * ownership transfers to the manager on the acquireRenderer msgSend.
 */
function FFImageLocationSetForSingleLocation(
  _device: FxDevice,
): FFImageLocationSet {
  throw new Error(
    "FFImageLocationSetForSingleLocation not yet transcribed — call site @Flexo 0x6c5f7d in FFNRRendererInfoManager ctor",
  );
}

/**
 * `+[FFHGRendererManager <acquireManager>]` — class-method msgSend
 * that returns the shared FFHGRendererManager instance. Loaded from
 * `_OBJC_CLASS_$_FFHGRendererManager` (@0x6c5f85 / @0x6c5fde / @0x6c60cd
 * / @0x6c60ff / @0x6c614a / @0x6c617b) and dispatched via the same
 * selref stored in r14 (from __got + 0x14f30f5 in ctor, 0x14f2fad in
 * returnRenderer, 0x14f2f30 in D1). Result: the shared manager.
 */
function FFHGRendererManager_acquireManager(): unknown {
  throw new Error(
    "FFHGRendererManager class-method acquireManager not yet transcribed — call sites in FFNRRendererInfoManager @Flexo 0x6c5f9d / 0x6c5fe8 / 0x6c60e5 / 0x6c6109 / 0x6c615b / 0x6c6185",
  );
}

/**
 * `-[<FFHGRendererManager> acquireRenderer: locSet fxDevice: readyBlock:]`
 * — the 4-arg instance msgSend that returns the acquired FFHGRenderer.
 * Call site: ctor @Flexo 0x6c5fb3; selref loaded @0x6c5fa0 from
 * `__got + 0x1511159`. Returns null on backend-not-available; the ctor
 * bail-out arm @0x6c5fbc handles that (skip binding-info creation and
 * the tail dispatch).
 */
function FFHGRendererManager_acquireRenderer(
  _manager: unknown,
  _locSet: FFImageLocationSet,
  _device: FxDevice,
  _readyBlock: FFNRRendererReadyBlock,
): FFHGRenderer | null {
  throw new Error(
    "FFHGRendererManager -acquireRenderer:fxDevice:readyBlock: not yet transcribed — call site @Flexo 0x6c5fb3 (selref __got+0x1511159)",
  );
}

/**
 * `+[FFImageRepBindingInfo alloc]` — invoked via the `_objc_alloc`
 * runtime shortcut at @Flexo 0x6c5fc5, then followed by an
 * `-initWithRenderer:` msgSend @0x6c5fd7 (selref from __got + 0x1511134).
 */
function FFImageRepBindingInfo_allocInit(
  _renderer: FFHGRenderer,
): FFImageRepBindingInfo {
  throw new Error(
    "FFImageRepBindingInfo alloc + initWithRenderer: not yet transcribed — call sites @Flexo 0x6c5fc5 (_objc_alloc) and @0x6c5fd7 (init msgSend, selref __got+0x1511134)",
  );
}

/**
 * `-[<renderer> <getRenderKeyOrSimilar>]` — msgSend at ctor @Flexo
 * 0x6c5ff8; selref loaded @0x6c5ff1 from `__got + 0x1502df8`. The
 * result feeds into the tail dispatch @0x6c601d as %rdx. Exact selector
 * name is frontier (would need to be recovered from the selref's byte
 * contents); we call it `getRendererKey` here as a role name.
 */
function FFHGRenderer_getRendererKey(
  _renderer: FFHGRenderer,
): unknown {
  throw new Error(
    "FFHGRenderer -getRendererKey (role name) not yet transcribed — call site @Flexo 0x6c5ff8 (selref __got+0x1502df8)",
  );
}

/**
 * `-[<manager> <recordRenderer>: X bindingInfo: bindingInfo]` — ctor tail
 * msgSend @Flexo 0x6c601d (indirect `jmpq *%rax` where rax = _objc_msgSend
 * cached in r15). Selref loaded @0x6c5fff from `__got + 0x151110a`. Argument
 * layout at call:  rdi=manager, rsi=selref, rdx=return-of-prior-msgSend,
 * rcx=self->bindingInfo (+0x08). Return value is discarded.
 */
function FFHGRendererManager_recordRenderer(
  _manager: unknown,
  _rendererKey: unknown,
  _bindingInfo: FFImageRepBindingInfo,
): unknown {
  throw new Error(
    "FFHGRendererManager -recordRenderer: bindingInfo: not yet transcribed — tail call @Flexo 0x6c601d (selref __got+0x151110a)",
  );
}

/**
 * `-[<manager> <clearBinding>: 0 :0]` — 2-arg msgSend @Flexo 0x6c60f6
 * (returnRenderer) / @0x6c616f (D1). Selref loaded @0x6c60e8/@0x6c6161
 * from `__got + 0x1511021`/`0x1510fa8`. Both extra args are zero
 * (`xorl %edx,%edx ; xorl %ecx,%ecx`). Result is discarded.
 */
function FFHGRendererManager_clearBinding(
  _manager: unknown,
): unknown {
  throw new Error(
    "FFHGRendererManager -clearBinding:_:_ not yet transcribed — call sites @Flexo 0x6c60f6 (returnRenderer) / 0x6c616f (D1) (selrefs __got+0x1511021 / 0x1510fa8)",
  );
}

/**
 * `-[<manager> <returnRenderer>: renderer]` — msgSend @Flexo 0x6c6119
 * (returnRenderer) / @0x6c6198 (D1); selref loaded @0x6c610f/@0x6c618e
 * from `__got + 0x1511002`/`0x1510f83`. Executed only when
 * self->renderer is non-null.
 */
function FFHGRendererManager_returnRenderer(
  _manager: unknown,
  _renderer: FFHGRenderer,
): unknown {
  throw new Error(
    "FFHGRendererManager -returnRenderer: not yet transcribed — call sites @Flexo 0x6c6119 (returnRenderer) / 0x6c6198 (D1) (selrefs __got+0x1511002 / 0x1510f83)",
  );
}

/**
 * `_objc_release(id)` — Runtime function that decrements the ObjC
 * retain count and frees when it reaches zero. In a GC'd runtime this
 * is a no-op; kept for control-flow fidelity. Call sites:
 *   returnRenderer @Flexo 0x6c6127 (`callq *[__got + 0x12275db]`)
 *   D1             @Flexo 0x6c61a9 (`callq *[__got + 0x1227559]`)
 */
function objc_release(_obj: unknown): void {
  // GC-subsumed; documented for provenance.
}

/**
 * `___clang_call_terminate(void*)` — reached on the D1 landing pad
 * @Flexo 0x6c61bf when any of the dtor's msgSends throws. The Itanium
 * ABI requires that a throwing dtor terminate; TS exceptions propagate
 * naturally so this is documented, not called.
 */
function __clang_call_terminate(_exc: unknown): never {
  throw new Error(
    "FFNRRendererInfoManager::~D1 landing pad hit (@Flexo 0x6c61bf): an ObjC msgSend threw and the Itanium ABI would std::terminate here.",
  );
}

// ── The class ────────────────────────────────────────────────────────

/**
 * FFNRRendererInfoManager — Flexo scope-guard that acquires an
 * FFHGRenderer + FFImageRepBindingInfo from the shared
 * FFHGRendererManager at construction and returns them at destruction
 * (or via explicit returnRenderer()).
 */
export class FFNRRendererInfoManager {
  /** +0x00 renderer (FFHGRenderer). Zeroed in the ctor xorps @0x6c5f77
   *  before the acquire msgSend, populated @0x6c5fb6, nulled again in
   *  returnRenderer/dtor @0x6c611c/@0x6c619e. */
  renderer: FFHGRenderer | null = null;

  /** +0x08 bindingInfo (FFImageRepBindingInfo). Zeroed in the same
   *  xorps @0x6c5f77, populated @0x6c5fda when the renderer acquire
   *  succeeded, released & nulled in returnRenderer/dtor
   *  @0x6c6127/@0x6c612d and @0x6c61a9/@0x6c61af. */
  bindingInfo: FFImageRepBindingInfo | null = null;

  /**
   * @src Flexo 0x6c5f60  FFNRRendererInfoManager::FFNRRendererInfoManager(FxDevice const*, bool () block_pointer) [C1]
   * @disasm raw-port/re/disasm/Flexo.FFNRRendererInfoManager.FFNRRendererInfoManager.s
   *
   * Faithful transcription of the ctor's control flow:
   *
   *   0x6c5f74  xorps %xmm0,%xmm0
   *   0x6c5f77  movups %xmm0,(%rdi)       ; this[0..15] = 0 — zeroes +0x00,+0x08
   *   0x6c5f7a  movq %rsi,%rdi            ; %rdi = FxDevice*
   *   0x6c5f7d  callq _FFImageLocationSetForSingleLocation
   *   0x6c5f82  movq %rax,%r12            ; %r12 = FFImageLocationSet
   *   ; ── Acquire the manager (class-method msgSend) ────────────────
   *   0x6c5f85  leaq _OBJC_CLASS_$_FFHGRendererManager(%rip),%rdi
   *   0x6c5f8c  movq __got+0x14f30f5(%rip),%r14   ; r14 = selref A ("acquireManager"-role)
   *   0x6c5f93  movq __got+0x1227726(%rip),%r13   ; r13 = _objc_msgSend
   *   0x6c5f9a  movq %r14,%rsi
   *   0x6c5f9d  callq *%r13                       ; manager = +[FFHGRendererManager <A>]
   *   ; ── Acquire the renderer (instance msgSend, 4 args) ───────────
   *   0x6c5fa0  movq __got+0x1511159(%rip),%rsi   ; selref B ("acquireRenderer:fxDevice:readyBlock:")
   *   0x6c5fa7  movq %rax,%rdi                    ; %rdi = manager
   *   0x6c5faa  movq %r12,%rdx                    ; %rdx = locSet
   *   0x6c5fad  movq %r15,%rcx                    ; %rcx = readyBlock (original %rdx)
   *   0x6c5fb0  movq %r13,%r15                    ; cache _objc_msgSend in %r15
   *   0x6c5fb3  callq *%r13                       ; renderer = [manager <B>: locSet fxDevice: readyBlock]
   *   0x6c5fb6  movq %rax,(%rbx)                  ; self->renderer = result
   *   0x6c5fb9  testq %rax,%rax
   *   0x6c5fbc  je   0x6c601f                     ; if (renderer == null) skip the wire-up + tail
   *   ; ── Allocate + init the binding info ──────────────────────────
   *   0x6c5fbe  leaq _OBJC_CLASS_$_FFImageRepBindingInfo(%rip),%rdi
   *   0x6c5fc5  callq _objc_alloc                 ; bindingInfoRaw = [FFImageRepBindingInfo alloc]
   *   0x6c5fca  movq (%rbx),%rdx                  ; %rdx = self->renderer
   *   0x6c5fcd  movq __got+0x1511134(%rip),%rsi   ; selref C ("initWithRenderer:")
   *   0x6c5fd4  movq %rax,%rdi                    ; %rdi = bindingInfoRaw
   *   0x6c5fd7  callq *%r15                       ; bindingInfo = [bindingInfoRaw <C>: renderer]
   *   0x6c5fda  movq %rax,0x8(%rbx)               ; self->bindingInfo = bindingInfo
   *   ; ── Wire the pair back to the manager (tail dispatch) ─────────
   *   0x6c5fde  leaq _OBJC_CLASS_$_FFHGRendererManager(%rip),%rdi
   *   0x6c5fe5  movq %r14,%rsi                    ; selref A again
   *   0x6c5fe8  callq *%r15                       ; manager2 = +[FFHGRendererManager <A>]
   *   0x6c5feb  movq %rax,%r14
   *   0x6c5fee  movq (%rbx),%rdi                  ; %rdi = self->renderer
   *   0x6c5ff1  movq __got+0x1502df8(%rip),%rsi   ; selref D ("getRendererKey"-role)
   *   0x6c5ff8  callq *%r15                       ; key = [renderer <D>]
   *   0x6c5ffb  movq 0x8(%rbx),%rcx               ; %rcx = self->bindingInfo
   *   0x6c5fff  movq __got+0x151110a(%rip),%rsi   ; selref E ("recordRenderer:bindingInfo:")
   *   0x6c6006  movq %r14,%rdi                    ; %rdi = manager2
   *   0x6c6009  movq %rax,%rdx                    ; %rdx = key
   *   0x6c600c  movq %r15,%rax                    ; %rax = _objc_msgSend
   *   0x6c600f-0x6c601d  epilogue + `jmpq *%rax`  ; TAIL [manager2 <E>: key bindingInfo: bindingInfo]
   *   0x6c601f-0x6c602d  bail-out epilogue (renderer==null)
   */
  constructor(device: FxDevice, readyBlock: FFNRRendererReadyBlock) {
    // @0x6c5f74/@0x6c5f77 — 16-byte zero of +0x00..+0x0f. Fields are
    // already `null` by TS default; the writes are redundant here but
    // documented for the ABI trace.
    this.renderer = null;
    this.bindingInfo = null;

    // @0x6c5f7d — build the FFImageLocationSet from the FxDevice.
    const locSet = FFImageLocationSetForSingleLocation(device);

    // @0x6c5f9d — acquire the shared FFHGRendererManager.
    const manager = FFHGRendererManager_acquireManager();

    // @0x6c5fb3 — ask the manager for a renderer for (locSet, device, readyBlock).
    const acquired = FFHGRendererManager_acquireRenderer(
      manager,
      locSet,
      device,
      readyBlock,
    );
    // @0x6c5fb6 — store the (possibly null) acquired renderer.
    this.renderer = acquired;

    // @0x6c5fbc — bail out if the acquire returned null. The remainder
    // of the ctor (binding-info creation + tail wire-up) is skipped.
    if (acquired === null) {
      // @0x6c601f..@0x6c602d — retq.
      return;
    }

    // @0x6c5fc5..@0x6c5fda — alloc + init the binding info, store at +0x08.
    const bindingInfo = FFImageRepBindingInfo_allocInit(acquired);
    this.bindingInfo = bindingInfo;

    // @0x6c5fe8 — RE-acquire the manager (a second call — this matches
    // the disasm literally; the compiler chose not to CSE this because
    // the class-method msgSend can in principle return a different
    // shared instance, though in practice it doesn't).
    const manager2 = FFHGRendererManager_acquireManager();

    // @0x6c5ff8 — [renderer <getRendererKey-role>]
    const rendererKey = FFHGRenderer_getRendererKey(acquired);

    // @0x6c601d — TAIL msgSend
    //   [manager2 <recordRenderer:bindingInfo:>: rendererKey bindingInfo: bindingInfo]
    // The return value is discarded on entry to the epilogue; TS's
    // returning-from-constructor implicit-return matches the `jmpq *%rax`
    // control transfer.
    FFHGRendererManager_recordRenderer(manager2, rendererKey, bindingInfo);
  }

  /**
   * @src Flexo 0x6c60c0  FFNRRendererInfoManager::returnRenderer()
   * @src Flexo 0x6c6140  FFNRRendererInfoManager::~FFNRRendererInfoManager() [D1]
   *   (also aliased as [D2] @0x6c6030 — same body)
   * @disasm raw-port/re/disasm/Flexo.FFNRRendererInfoManager.returnRenderer.s
   * @disasm raw-port/re/disasm/Flexo.FFNRRendererInfoManager.~FFNRRendererInfoManager.s
   *
   * The three methods share a body (D1 adds only the terminate landing
   * pad at @0x6c61bc). Sequence:
   *
   *   1. manager = +[FFHGRendererManager <acquireManager>]
   *   2. [manager <clearBinding>: 0 :0]                     (discarded result)
   *   3. if (self->renderer != null) {
   *        manager2 = +[FFHGRendererManager <acquireManager>]
   *        [manager2 <returnRenderer>: self->renderer]     (discarded result)
   *      }
   *   4. self->renderer = null
   *   5. objc_release(self->bindingInfo)                     (nil-safe)
   *   6. self->bindingInfo = null
   *
   * The two class-method acquireManager calls (steps 1 and 3.a) are
   * SEPARATE msgSends in the asm — this port preserves that literal
   * shape.
   */
  returnRenderer(): void {
    // @0x6c60cd..@0x6c60e5 — acquire the manager.
    const manager = FFHGRendererManager_acquireManager();
    // @0x6c60e8..@0x6c60f6 — 2-arg msgSend with edx=ecx=0 (clear binding).
    FFHGRendererManager_clearBinding(manager);
    // @0x6c60f9..@0x6c60fd — if (self->renderer != null) …
    if (this.renderer !== null) {
      // @0x6c60ff..@0x6c6109 — re-acquire the manager (literal shape).
      const manager2 = FFHGRendererManager_acquireManager();
      // @0x6c610c/@0x6c6116..@0x6c6119 — return the renderer to the pool.
      FFHGRendererManager_returnRenderer(manager2, this.renderer);
    }
    // @0x6c611c — self->renderer = null.
    this.renderer = null;
    // @0x6c6123..@0x6c6127 — objc_release(self->bindingInfo).
    if (this.bindingInfo !== null) {
      objc_release(this.bindingInfo);
    }
    // @0x6c612d — self->bindingInfo = null.
    this.bindingInfo = null;
    // @0x6c6135..@0x6c613f — epilogue.
  }

  /**
   * @src Flexo 0x6c6140  FFNRRendererInfoManager::~FFNRRendererInfoManager() [D1]
   *      also aliased as [D2] @0x6c6030 (the disasm labelled the same
   *      offset only once — the two entries share code).
   *
   * The dtor body IS returnRenderer() plus a `___clang_call_terminate`
   * landing pad @0x6c61bc..@0x6c61bf for the "any msgSend inside the
   * dtor throws" path. TS exceptions propagate naturally, so the
   * landing pad is documented but not materialised as a try/catch.
   */
  destroy(): void {
    this.returnRenderer();
    // @0x6c61bc..@0x6c61bf — landing pad (unreachable in the happy path).
  }
}
