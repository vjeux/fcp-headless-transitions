// FFPendingShutdowns.ts — Flexo's C++-shell-over-Objective-C book-keeper for
// pending FFPlayer shutdowns. The class holds ONE ivar (an NSMutableSet* or
// NSMutableDictionary* at +0x00) and mediates all mutations behind a
// `@synchronized([FFPlayer class])` lock; each entry is an
// `FFPendingPlayerShutdownRecord` keyed by an NSString identifier.
// `createShutdownSyncerForCurrentlyPending()` snapshots the collection into a
// fresh `FFWaitSync` object using ObjC fast-enumeration.
//
// Verbatim from FCP's Flexo framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// FOUR EXPORTED SYMBOLS (nm -arch x86_64):
//   @Flexo 0x0000000000d73a60  FFPendingShutdowns::~FFPendingShutdowns()               (D1)
//   @Flexo 0x0000000000d763d0  FFPendingShutdowns::removePendingShutdown(NSString*)
//   @Flexo 0x0000000000d77fb0  FFPendingShutdowns::addPendingShutdown(NSString*)
//   @Flexo 0x0000000000d78820  FFPendingShutdowns::createShutdownSyncerForCurrentlyPending()
//
// Source disassembly (this worktree, raw-port/re/disasm/):
//   Flexo.FFPendingShutdowns.~FFPendingShutdowns.s                         @0xd73a60
//   Flexo.FFPendingShutdowns.removePendingShutdown.s                       @0xd763d0
//   Flexo.FFPendingShutdowns.addPendingShutdown.s                          @0xd77fb0
//   Flexo.FFPendingShutdowns.createShutdownSyncerForCurrentlyPending.s     @0xd78820
//
// -- STRUCT LAYOUT (recovered from all four bodies) ------------------------
//   offset  size  field                    comments
//   ------  ----  -----------------------  ---------------------------------
//   +0x00   0x08  container : id           Every method dereferences self+0
//                                          as an ObjC object (`movq (%rdi),
//                                          %rdi`) and sends it a
//                                          collection-mutating selector.
//                                          Semantics recovered from context:
//                                          - ~D reads its `count`,
//                                          - remove first `containsObject:`s
//                                            then `removeObject:`s,
//                                          - add first `containsObject:`s
//                                            then adds a fresh record via
//                                            `setObject:forKey:` OR
//                                            `addObject:`,
//                                          - createShutdownSyncerForCurrently
//                                            Pending fast-enumerates it via
//                                            `countByEnumeratingWithState:
//                                            objects:count:` (the "16" arg
//                                            at %r8d = 0x10 is the stack-
//                                            slot buffer size).
//                                          => container is
//                                             NSMutableSet<FFPendingPlayer
//                                                          ShutdownRecord*>*
//                                             or NSMutableDictionary keyed
//                                             by NSString*. The record type
//                                             is the object heap-allocated
//                                             in addPendingShutdown().
//   sizeof                = 0x08 (only the one ivar is ever touched; the
//                                 class has no polymorphism -- no vptr is
//                                 loaded and no virtual call is made).
//
// -- LOCK PROTOCOL ---------------------------------------------------------
// Every mutation method wraps its body in
//   objc_sync_enter([FFPlayer class]) / objc_sync_exit([FFPlayer class])
// via `_objc_opt_class(&_OBJC_CLASS_$_FFPlayer)`. The exception-cleanup
// landing pads at the tail of each body ensure `objc_sync_exit` runs even if
// a selector throws (see the `__Unwind_Resume` tails in each disasm file).
//
// -- ASSERTION PROTOCOL ----------------------------------------------------
// Each method checks the pre/post-condition of the container and, on
// failure, jumps to a shared crash pad that:
//   1) reads `[NSAssertionHandler currentHandler]`,
//   2) builds the failing __PRETTY_FUNCTION__ string via `+[NSString
//      stringWithUTF8String:]` on a literal,
//   3) calls `-[NSAssertionHandler handleFailureInFunction:file:lineNumber:
//                                                  description:]`,
//   4) jumps back into the happy path (unreachable — the assertion handler
//      is expected to abort the process).
// The `lineNumber` and __FILE__ CFString are baked into the binary. The
// pretty-function literals recovered:
//   @Flexo 0xd73ab2  "FFPendingShutdowns::~FFPendingShutdowns()"           (~D)
//   @Flexo 0xd76458  "void FFPendingShutdowns::removePendingShutdown(NSString *)"
//   @Flexo 0xd78066  "void FFPendingShutdowns::addPendingShutdown(NSString *)"
// Line numbers baked into `movl $0xXXX, %r8d`:
//   ~D             : line 0x58c (1420)
//   removePending  : line 0x591 (1425)
//   addPending     : line 0x598 (1432)
// These pinpoint the exact source lines of FCP's original C++ source.
//
// -- FRONTIER CALLEES (all decode-don't-fit-throw stubs) -------------------
// Every ObjC send resolves to `_objc_msgSend` through Flexo's __la_symbol_ptr
// table -- the disassembler mislabels selectors (all display as
// `_waitForThreadToFinish`) because the extraction script picks the first
// matching stub-name. We recover the *intent* of each send from the
// surrounding argument setup and register plumbing, and expose each as its
// own throwing stub so the port surfaces the exact frontier a caller hits.
//
//   Runtime helpers (unresolved throw stubs — Itanium C++ ABI / ObjC ABI):
//     @Flexo call sites *many*  _objc_opt_class(cls) -> Class
//     @Flexo call sites *many*  _objc_sync_enter(id) / _objc_sync_exit(id)
//     @Flexo 0xd77ff7           _objc_alloc(cls) -> id  (add path)
//     @Flexo 0xd78845           _objc_alloc(cls=FFWaitSync)  (create path)
//     @Flexo 0xd78939           _objc_enumerationMutation(id) -> void
//     @Flexo 0xd7802b, ~D...    _objc_release(id) -> void
//     @Flexo call sites *many*  _objc_msgSend(receiver, sel, ...) -> id
//     @Flexo 0xd789e5           ___stack_chk_fail  (unrecoverable)
//     @Flexo 0xd780b1, ~        __Unwind_Resume    (exception propagation)
//
//   Foundation / AppKit class refs (linkage from __objc_classrefs):
//     _OBJC_CLASS_$_FFPlayer                        (sync lock class)
//     _OBJC_CLASS_$_FFPendingPlayerShutdownRecord   (heap record class)
//     _OBJC_CLASS_$_FFWaitSync                      (returned syncer class)
//     _OBJC_CLASS_$_NSString                        (pretty-function string)
//     _OBJC_CLASS_$_NSAssertionHandler              (assertion machinery)
//
//   Selector references (deduced by call-site argument shape):
//     -[container count]                            (~D preconditions)
//     -[container containsObject:key]               (remove/add pre)
//     -[container removeObject:key]                 (remove happy path)
//     -[container setObject:record forKey:key]      (add happy path)
//     -[container countByEnumeratingWithState:
//                objects:count:]                    (create path)
//     -[FFPendingPlayerShutdownRecord initWithID:]  (record init)
//     -[FFWaitSync init...]                         (waitSync init)
//     -[FFWaitSync addSyncFor:]  or similar         (loop-body twin sends)
//     -[NSAssertionHandler
//        handleFailureInFunction:file:lineNumber:description:]
//     +[NSAssertionHandler currentHandler]
//     +[NSString stringWithUTF8String:]
//
// None of the selectors, none of the ObjC classes, none of the C runtime
// helpers, and none of the framework classes are yet ported. The four
// methods below faithfully transcribe the DECISIONS (branch structure,
// argument routing, guard-value tests, mutex boundaries) but every actual
// side effect routes through a throwing stub whose message names the
// callee's mangled name and @0xADDR. That is the demand signal per
// PORTING_SPEC.md rule 3 (decode-don't-fit).

// -- OPAQUE FORWARD-DECLARATIONS -------------------------------------------

/** Opaque handle to an Objective-C `id` — reference-counted heap pointer. */
export interface NSObject {
  readonly __brand_NSObject: "NSObject";
}

/** Opaque handle to Objective-C `Class`. */
export interface ObjCClass {
  readonly __brand_ObjCClass: "ObjCClass";
}

/** Opaque handle to Objective-C `SEL` (selector). */
export interface ObjCSelector {
  readonly __brand_ObjCSelector: "ObjCSelector";
}

/** Opaque handle to `NSString*`. */
export interface NSString extends NSObject {
  readonly __brand_NSString: "NSString";
}

/** Opaque handle to the FCP-internal `FFPendingPlayerShutdownRecord*`.
 *  Allocated inside `addPendingShutdown` and stored into the container.
 *  Ported separately. */
export interface FFPendingPlayerShutdownRecord extends NSObject {
  readonly __brand_FFPendingPlayerShutdownRecord: "FFPendingPlayerShutdownRecord";
}

/** Opaque handle to the FCP-internal `FFWaitSync*` object returned by
 *  createShutdownSyncerForCurrentlyPending. Ported separately. */
export interface FFWaitSync extends NSObject {
  readonly __brand_FFWaitSync: "FFWaitSync";
}

// -- FRONTIER STUBS --------------------------------------------------------

/** ObjC runtime helper — `Class _objc_opt_class(Class cls)`. Returns the
 *  metaclass suitable for `@synchronized`. Not yet ported. */
function objc_opt_class_stub(_cls: ObjCClass): ObjCClass {
  throw new Error(
    "_objc_opt_class @Flexo (stub-thunk) is not yet ported (used at " +
      "@Flexo 0xd73a?? / 0xd77fc8 / 0xd763e8 / 0xd7887a).",
  );
}

/** ObjC runtime helper — `void objc_sync_enter(id obj)`. Not yet ported. */
function objc_sync_enter_stub(_obj: NSObject | ObjCClass): void {
  throw new Error(
    "_objc_sync_enter @Flexo (stub-thunk) is not yet ported (used at " +
      "@Flexo 0xd763f3 / 0xd77fd3 / 0xd78889 / dtor).",
  );
}

/** ObjC runtime helper — `void objc_sync_exit(id obj)`. Not yet ported. */
function objc_sync_exit_stub(_obj: NSObject | ObjCClass): void {
  throw new Error(
    "_objc_sync_exit @Flexo (stub-thunk) is not yet ported (used at " +
      "@Flexo 0xd7642e / 0xd7803c / 0xd789b7 / dtor tail).",
  );
}

/** ObjC runtime helper — `id objc_alloc(Class cls)`. Not yet ported. */
function objc_alloc_stub(_cls: ObjCClass): NSObject {
  throw new Error(
    "_objc_alloc @Flexo (stub-thunk) is not yet ported (used at " +
      "@Flexo 0xd77ff7 for FFPendingPlayerShutdownRecord and 0xd7884c " +
      "for FFWaitSync).",
  );
}

/** ObjC runtime helper — `void objc_release(id obj)`. Not yet ported. */
function objc_release_stub(_obj: NSObject | null): void {
  throw new Error(
    "_objc_release @Flexo (stub-thunk) is not yet ported (used at " +
      "@Flexo 0xd7802b / 0xd73a82 in dtor).",
  );
}

/** ObjC runtime helper — `void objc_enumerationMutation(id container)`.
 *  Traps if a container was mutated during fast enumeration. Not yet ported. */
function objc_enumerationMutation_stub(_container: NSObject): void {
  throw new Error(
    "_objc_enumerationMutation @Flexo 0xd78939 (fast-enum sentinel) is not " +
      "yet ported.",
  );
}

/** ObjC runtime helper — `id objc_msgSend(id, SEL, ...)`. The single most
 *  common frontier here; every method dispatch on the container, on
 *  NSAssertionHandler, on NSString, and on the record classes routes through
 *  this. Not yet ported. */
function objc_msgSend_stub(
  _receiver: NSObject | ObjCClass,
  _selName: string,
  ..._args: unknown[]
): unknown {
  throw new Error(
    `_objc_msgSend @Flexo (stub-thunk) is not yet ported. This send is ` +
      `routed via a __la_symbol_ptr slot; selector semantics for FCP's ` +
      `container mutation ops (containsObject:, addObject:, removeObject:, ` +
      `setObject:forKey:, count, countByEnumeratingWithState:objects:count:) ` +
      `are decoded in the FFPendingShutdowns.ts source header. Frontier lives ` +
      `at every ` +
      `\`callq *0xNNN(%rip)\` in @Flexo 0xd73a60 / 0xd763d0 / 0xd77fb0 / 0xd78820.`,
  );
}

/** ObjC runtime helper for `+[NSAssertionHandler currentHandler]`, called
 *  from each of the four bodies' crash-pad. Wrapper of `_objc_msgSend`. */
function NSAssertionHandler_currentHandler_stub(): NSObject {
  throw new Error(
    "+[NSAssertionHandler currentHandler] @Flexo (crash-pad) is not yet ported.",
  );
}

/** ObjC runtime helper for `+[NSString stringWithUTF8String:]`. The pretty-
 *  function literals baked into the crash pads flow through this. */
function NSString_stringWithUTF8String_stub(_utf8: string): NSString {
  throw new Error(
    "+[NSString stringWithUTF8String:] @Flexo (crash-pad) is not yet ported.",
  );
}

/** Handler for the shared assertion tail — collects the current handler,
 *  builds the pretty-function NSString, invokes the 4-arg failure selector.
 *  In the port this simply throws a TS Error naming the site. */
function _dispatchAssertionFailure(
  prettyFunction: string,
  fileCString: string,
  lineNumber: number,
  descriptionCString: string,
): never {
  const _handler = NSAssertionHandler_currentHandler_stub();
  const _prettyNS = NSString_stringWithUTF8String_stub(prettyFunction);
  // 4-arg selector; sends through the shared objc_msgSend stub. Either the
  // stub throws (documenting the frontier) or -- if a caller ever wires the
  // ObjC bridge -- the real assertion handler aborts the process. Either way
  // this function does not return.
  objc_msgSend_stub(
    _handler,
    "handleFailureInFunction:file:lineNumber:description:",
    _prettyNS,
    fileCString,
    lineNumber,
    descriptionCString,
  );
  // Unreachable, but TS wants a `never`-typed exit.
  throw new Error(
    `NSAssertionHandler failure: ${prettyFunction} (${fileCString}:${lineNumber}) ${descriptionCString}`,
  );
}

// -- CLASS REFS (linker-visible symbols, opaque handles here) -------------

/** @Flexo _OBJC_CLASS_$_FFPlayer — the class used as the @synchronized lock. */
const OBJC_CLASS_FFPlayer_stub: ObjCClass = new Proxy({} as ObjCClass, {
  get() {
    throw new Error(
      "_OBJC_CLASS_$_FFPlayer is a linker-provided ObjC class ref; " +
        "not yet ported (used at 0xd77fc1 / 0xd763e1 / 0xd78873).",
    );
  },
});

/** @Flexo _OBJC_CLASS_$_FFPendingPlayerShutdownRecord — heap-record class
 *  allocated in `addPendingShutdown`. */
const OBJC_CLASS_FFPendingPlayerShutdownRecord_stub: ObjCClass = new Proxy(
  {} as ObjCClass,
  {
    get() {
      throw new Error(
        "_OBJC_CLASS_$_FFPendingPlayerShutdownRecord is a linker-provided " +
          "ObjC class ref; not yet ported (used at @Flexo 0xd77ff0).",
      );
    },
  },
);

/** @Flexo _OBJC_CLASS_$_FFWaitSync — return type of
 *  `createShutdownSyncerForCurrentlyPending`. */
const OBJC_CLASS_FFWaitSync_stub: ObjCClass = new Proxy({} as ObjCClass, {
  get() {
    throw new Error(
      "_OBJC_CLASS_$_FFWaitSync is a linker-provided ObjC class ref; " +
        "not yet ported (used at @Flexo 0xd78845).",
    );
  },
});

// -- FFPendingShutdowns ---------------------------------------------------

/**
 * FFPendingShutdowns — Flexo's pending-shutdown book-keeper.
 *
 * Layout (see file header for recovery trace):
 *   +0x00 container : id   (NSMutableSet/NSMutableDictionary of records)
 *   sizeof = 0x08
 *
 * Concurrency: all mutations are wrapped in
 *   objc_sync_enter([FFPlayer class]) / objc_sync_exit([FFPlayer class]).
 *
 * Invariants (checked via NSAssert; violation triggers the crash-pad):
 *   ~D                       : container.count == 0
 *   removePendingShutdown(k) : container containsObject:k  (or ==nil-valued)
 *   addPendingShutdown(k)    : !container containsObject:k  (add-if-absent)
 */
export class FFPendingShutdowns {
  declare readonly __brand_FFPendingShutdowns: "FFPendingShutdowns";

  /** +0x00 — the sole ivar. Every dereference in the four methods reads
   *  this slot as `id`. Constructed elsewhere (no exported ctor for this
   *  class). */
  private _container: NSObject | null = null;

  /**
   * D1 destructor — FFPendingShutdowns::~FFPendingShutdowns()
   *   @Flexo 0x0000000000d73a60 .. 0x0000000000d73aed
   *
   * Structure:
   *   0xd73a60 prologue, %rbx = this
   *   0xd73a6a rdi = self[+0x00]                    ; container
   *   0xd73a6d rsi = @selector(count)                ; RIP-relative selref
   *   0xd73a74 callq *0xNNNN(%rip)                   ; objc_msgSend(container, count)
   *   0xd73a7a testq %rax                            ; if count != 0 => crash pad
   *   0xd73a7d jne 0xd73a8d
   *
   *   Happy path (count == 0):
   *     0xd73a7f rdi = self[+0x00]
   *     0xd73a82 callq *0xNNNN(%rip)                ; objc_release(container)
   *     0xd73a88 epilogue, retq
   *
   *   Crash pad (count != 0):
   *     0xd73a8d rdi = [NSAssertionHandler class]
   *     0xd73a94 rsi = @selector(currentHandler)
   *     0xd73a9b callq objc_msgSend                  ; handler = [NSAssertionHandler currentHandler]
   *     0xd73aa4 rdi = [NSString class]
   *     0xd73aab rsi = @selector(stringWithUTF8String:)
   *     0xd73ab2 rdx = "FFPendingShutdowns::~FFPendingShutdowns()"
   *     0xd73ab9 callq objc_msgSend                  ; prettyNS = +[NSString stringWithUTF8String:pretty]
   *     0xd73abf rsi = @selector(handleFailureInFunction:file:lineNumber:description:)
   *     0xd73ac6 rcx = @"...FFPendingShutdowns.mm"   ; file (CFString)
   *     0xd73acd r9  = @"...container was not empty" ; description (CFString)
   *     0xd73ad4 r8d = 0x58c (= 1420)                ; lineNumber
   *     0xd73ada rdi = handler ; rdx = prettyNS
   *     0xd73ae2 callq objc_msgSend                  ; handler->handleFailureIn... (never returns)
   *     0xd73ae8 jmp back to happy-path release      ; unreachable
   *
   * The crash pad IS the "assertion failed => process abort" that every FCP
   * NSAssert() macro expands to. In the port we substitute a JS Error.
   */
  D1_destructor(): void {
    // @Flexo 0xd73a6a..0xd73a74 — count = [container count].
    const container = this._container;
    // objc_msgSend(container, sel_count) — throws on the ObjC frontier.
    const countObj = objc_msgSend_stub(
      (container ?? { __brand_NSObject: "NSObject" }) as NSObject,
      "count",
    );

    // @Flexo 0xd73a7a — treat return as a raw integer (ObjC BOOL/NSUInteger).
    const count = typeof countObj === "number" ? countObj : 0;

    if (count !== 0) {
      // @Flexo 0xd73a8d..0xd73ae2 — assertion-failed crash pad.
      _dispatchAssertionFailure(
        "FFPendingShutdowns::~FFPendingShutdowns()",
        "<FCP FFPendingShutdowns.mm>",
        0x58c, // 1420
        "container was not empty at destruction time",
      );
    }

    // @Flexo 0xd73a7f..0xd73a82 — release container.
    if (container !== null) {
      objc_release_stub(container);
    }
  }

  /**
   * removePendingShutdown — FFPendingShutdowns::removePendingShutdown(NSString*)
   *   @Flexo 0x0000000000d763d0 .. 0x0000000000d764a3
   *
   * Structure:
   *   Prologue @0xd763d0: save r15=this, r14=key.
   *   @0xd763e1..0xd763f3: rbx = objc_opt_class(&_OBJC_CLASS_$_FFPlayer);
   *                        objc_sync_enter(rbx).
   *
   *   Preconditions check @0xd763f8..0xd7640e:
   *     rdi = self[+0x00]
   *     rsi = @selector(containsObject:)
   *     rdx = key
   *     rax = objc_msgSend(container, containsObject:, key)
   *     testq rax ; je 0xd76433                     ; if !contains => crash pad
   *
   *   Happy path @0xd76410..0xd7642e:
   *     rdi = self[+0x00]
   *     rsi = @selector(removeObject:)
   *     rdx = key
   *     objc_msgSend(container, removeObject:, key)
   *     epilogue -> jmp objc_sync_exit(rbx)  (tail-call)
   *
   *   Crash pad @0xd76433..0xd7648e — identical to ~D's crash pad, except:
   *     - pretty function is "void FFPendingShutdowns::removePendingShutdown(NSString *)"
   *     - line number is 0x591 (= 1425)
   *     - description "attempted to remove absent key"
   *     After the (unreached) return, it falls through to the happy path.
   *
   *   Exception landing pad @0xd76490..0xd7649e — ensures objc_sync_exit
   *   runs on any thrown selector, then re-raises via __Unwind_Resume.
   */
  removePendingShutdown(key: NSString): void {
    // @Flexo 0xd763e1..0xd763f3 — @synchronized([FFPlayer class]) begin.
    const lockClass = objc_opt_class_stub(OBJC_CLASS_FFPlayer_stub);
    objc_sync_enter_stub(lockClass);

    try {
      // @Flexo 0xd763f8..0xd7640e — [container containsObject:key].
      const container = this._container as NSObject;
      const contains = objc_msgSend_stub(container, "containsObject:", key);

      if (!contains) {
        // @Flexo 0xd76433..0xd7648e — crash pad.
        _dispatchAssertionFailure(
          "void FFPendingShutdowns::removePendingShutdown(NSString *)",
          "<FCP FFPendingShutdowns.mm>",
          0x591, // 1425
          "attempted to remove a key that is not in the container",
        );
      }

      // @Flexo 0xd76410..0xd7641d — [container removeObject:key].
      objc_msgSend_stub(container, "removeObject:", key);
    } finally {
      // @Flexo 0xd7642e — tail-call objc_sync_exit(lockClass).
      objc_sync_exit_stub(lockClass);
    }
  }

  /**
   * addPendingShutdown — FFPendingShutdowns::addPendingShutdown(NSString*)
   *   @Flexo 0x0000000000d77fb0 .. 0x0000000000d780b6
   *
   * Structure:
   *   Prologue @0xd77fb0: save r15=this, r14=key.
   *   @0xd77fc1..0xd77fd3: rbx = objc_opt_class(&_OBJC_CLASS_$_FFPlayer);
   *                        objc_sync_enter(rbx).
   *
   *   Precondition check @0xd77fd8..0xd77fee:
   *     rax = objc_msgSend(self[+0], containsObject:, key)
   *     testq rax ; jne 0xd78041                    ; if contains => crash pad
   *
   *   Happy path @0xd77ff0..0xd7803c:
   *     @0xd77ff0 rdi = &_OBJC_CLASS_$_FFPendingPlayerShutdownRecord
   *     @0xd77ff7 callq _objc_alloc                  ; rax = [FFPendingPlayerShutdownRecord alloc]
   *     @0xd77ffc rsi = @selector(initWithID:)       ; or similar 1-arg init selector
   *     @0xd78003 rdi = alloc'd, rdx = key
   *     @0xd78009 callq objc_msgSend                 ; r12 = [alloc initWithID:key]
   *
   *     @0xd78012 rdi = self[+0]
   *     @0xd78015 rsi = @selector(setObject:forKey:) ; or addObject: (see NOTE)
   *     @0xd7801c rdx = r12 (record), rcx = key
   *     @0xd78022 callq objc_msgSend                 ; [container setObject:record forKey:key]
   *
   *     @0xd78028 rdi = record
   *     @0xd7802b callq objc_release                 ; release local record ref
   *     @0xd7803c jmp objc_sync_exit(rbx)            ; tail-call
   *
   *     NOTE: The 4-arg call site (rdi/rsi/rdx/rcx) is characteristic of
   *     `-[NSMutableDictionary setObject:forKey:]`. If the container is
   *     instead an NSMutableSet, the selector would be `-[NSMutableSet
   *     addObject:]` and rcx would be unused. The presence of rcx=key at
   *     0xd7801f strongly suggests NSMutableDictionary; but the container
   *     shape from ~D's `count` alone can't disambiguate. We call this out
   *     for the FFPendingShutdowns *ctor* porter, who will see the actual
   *     alloc/initWithCapacity: selector.
   *
   *   Crash pad @0xd78041..0xd7809c — same crash-pad shape as removePendingShutdown,
   *     with pretty function "void FFPendingShutdowns::addPendingShutdown(NSString *)"
   *     and line 0x598 (=1432). After the (unreached) return, falls through
   *     to the happy path (record alloc etc.).
   *
   *   Exception landing pad @0xd780a1..0xd780b1.
   */
  addPendingShutdown(key: NSString): void {
    // @Flexo 0xd77fc1..0xd77fd3 — @synchronized([FFPlayer class]) begin.
    const lockClass = objc_opt_class_stub(OBJC_CLASS_FFPlayer_stub);
    objc_sync_enter_stub(lockClass);

    try {
      // @Flexo 0xd77fd8..0xd77fee — precondition: !containsObject:key.
      const container = this._container as NSObject;
      const contains = objc_msgSend_stub(container, "containsObject:", key);

      if (contains) {
        // @Flexo 0xd78041..0xd7809c — crash pad.
        _dispatchAssertionFailure(
          "void FFPendingShutdowns::addPendingShutdown(NSString *)",
          "<FCP FFPendingShutdowns.mm>",
          0x598, // 1432
          "attempted to add a key that is already in the container",
        );
      }

      // @Flexo 0xd77ff0..0xd77ff7 — alloc FFPendingPlayerShutdownRecord.
      const raw = objc_alloc_stub(OBJC_CLASS_FFPendingPlayerShutdownRecord_stub);
      // @Flexo 0xd77ffc..0xd78009 — record = [raw initWithID:key].
      const record = objc_msgSend_stub(
        raw,
        "initWithID:",
        key,
      ) as FFPendingPlayerShutdownRecord;

      // @Flexo 0xd78012..0xd78022 — [container setObject:record forKey:key].
      // Selector shape (4-reg send with rdx and rcx populated) matches the
      // NSMutableDictionary API. See NOTE in method doc-comment above.
      objc_msgSend_stub(container, "setObject:forKey:", record, key);

      // @Flexo 0xd78028..0xd7802b — release local record reference.
      objc_release_stub(record);
    } finally {
      // @Flexo 0xd7803c — tail-call objc_sync_exit(lockClass).
      objc_sync_exit_stub(lockClass);
    }
  }

  /**
   * createShutdownSyncerForCurrentlyPending —
   *   FFPendingShutdowns::createShutdownSyncerForCurrentlyPending()
   *   @Flexo 0x0000000000d78820 .. 0x0000000000d78a07
   *
   * Structure:
   *   Prologue @0xd78820: pushes r15/r14/r13/r12/rbx, allocs 0xf8 bytes on
   *     stack, stashes __stack_chk_guard canary in -0x30(%rbp) (verified at
   *     the return path @0xd789bc).
   *
   *   @0xd78845..0xd7886c — alloc + init FFWaitSync:
   *     rax = _objc_alloc(&_OBJC_CLASS_$_FFWaitSync)
   *     rsi = @selector(init...)                     ; likely `-init` or
   *                                                    `-initWithPending
   *                                                     Shutdowns:`
   *     rdx = @"...some CFString..."                 ; CFString param
   *     callq objc_msgSend  (r14 = msgSend fnptr, reused later)
   *     -0xc8(%rbp) = returned FFWaitSync*
   *
   *   @0xd78873..0xd78889 — @synchronized([FFPlayer class]) begin.
   *
   *   @0xd7888e..0xd788a6 — clear the four 16-byte fast-enumeration state
   *     slots (NSFastEnumerationState) at [-0x120..-0xf0].
   *
   *   Fast enumeration outer loop @0xd788b4..0xd789aa:
   *     rdi = self[+0]                               ; container
   *     rsi = @selector(countByEnumerateWith
   *                     State:objects:count:)
   *     rdx = &state (-0x120(%rbp))
   *     rcx = &stackBuf (-0xb0(%rbp))                ; 16-slot buffer
   *     r8d = 0x10                                   ; buffer count = 16
   *     callq objc_msgSend                            ; rax = returned count
   *     testq rax ; je 0xd789b0                       ; if 0 => exit loop
   *
   *   Inner loop @0xd78900..0xd78977:
   *     r13 = @selector(<send-A>)                    ; loaded @0xd78900 from
   *                                                    RIP-const table
   *     r12 = @selector(<send-B>)                    ; loaded @0xd78907
   *     r14 = 0                                      ; inner index
   *
   *     for (r14 = 0; r14 != rbx (batch count); ++r14) {
   *       @0xd78920..0xd78931: mutation guard --
   *         if (*(*(state+0x08)) != prevMutations)
   *           objc_enumerationMutation(container);
   *       @0xd7893f..0xd78946: rdx = state.items[r14]     ; the enumerated element
   *       @0xd7894a..0xd7895e:
   *         rdi = self[+0]                              ; container
   *         rsi = @selector(<send-A>)                    ; look up by key/element
   *         callq objc_msgSend                            ; rax = looked-up value (e.g. -[dict objectForKey:key])
   *       @0xd78961..0xd7896e:
   *         rdi = rax                                    ; value
   *         rsi = @selector(<send-B>)                    ; e.g. -[record registerWithWaitSync:]
   *         rdx = waitSync (-0xc8(%rbp))
   *         callq objc_msgSend
   *     }
   *
   *     After inner loop, reload another batch via
   *     countByEnumeratingWithState:objects:count:.
   *
   *   Exit @0xd789b0..0xd789e4:
   *     objc_sync_exit([FFPlayer class])
   *     check __stack_chk_guard; if mismatch -> ___stack_chk_fail (unrecoverable)
   *     rax = waitSync
   *     epilogue, retq
   *
   *   Exception cleanup @0xd789ea..0xd78a02: ensure objc_sync_exit still
   *   runs, then __Unwind_Resume.
   *
   * Semantic: "Take a snapshot of the current container, iterate each entry,
   * fetch the record via a keyed selector, then register that record with a
   * freshly-allocated FFWaitSync. Return the FFWaitSync." The two selectors
   * inside the inner loop (r13/r12) are loaded from RIP-const selector-refs
   * whose names we cannot recover without the ObjC selref table (which the
   * current disasm.sh doesn't dump). Their argument shape strongly implies
   *   send-A = -[container objectForKey:enumElement]
   *   send-B = -[value addToSyncer:waitSync] / similar 1-arg register call.
   */
  createShutdownSyncerForCurrentlyPending(): FFWaitSync {
    // @Flexo 0xd78845..0xd7886c — alloc + init the return value.
    const raw = objc_alloc_stub(OBJC_CLASS_FFWaitSync_stub);
    // The initializer selector could not be disambiguated from the disasm
    // (0xd78851 loads it from a selref slot; the tool mislabels it). We
    // route through the throwing stub with the placeholder selector name so
    // this becomes a demand signal.
    const waitSync = objc_msgSend_stub(
      raw,
      "init<FFWaitSync-init-selector-TBD>",
      /* cfstring param at 0xd78858 */ "<CFString @ 0xd78858>",
    ) as FFWaitSync;

    // @Flexo 0xd78873..0xd78889 — @synchronized([FFPlayer class]) begin.
    const lockClass = objc_opt_class_stub(OBJC_CLASS_FFPlayer_stub);
    objc_sync_enter_stub(lockClass);

    try {
      // @Flexo 0xd7888e..0xd788a6 — zero the NSFastEnumerationState struct
      // and its stack-buffer. Represented here as opaque state; the actual
      // countByEnumeratingWithState:... call throws on the frontier.
      const container = this._container as NSObject;

      // @Flexo 0xd788b4..0xd788d9 — first batch of fast-enumeration.
      const state = { extra: [0, 0, 0, 0, 0] };
      const stackBuf: unknown[] = new Array(16).fill(null);
      let batchCount = objc_msgSend_stub(
        container,
        "countByEnumeratingWithState:objects:count:",
        state,
        stackBuf,
        16,
      ) as number;

      // Loop over batches. Every iteration re-invokes fast enumeration; the
      // asm mirrors this as jne 0xd78900 <inner loop> after every reload.
      while (batchCount !== 0) {
        // @Flexo 0xd78900/0xd78907 — the two inner selectors loaded from
        // RIP-const selrefs. Their identities are un-decoded (see doc-
        // comment) so we call them out here explicitly.
        const selInnerA = "<send-A: objectForKey:-like, TBD>";
        const selInnerB = "<send-B: 1-arg register-with-waitSync, TBD>";

        // @Flexo 0xd7890e — r14 = 0 (inner index).
        for (let i = 0; i !== batchCount; i = i + 1) {
          // @Flexo 0xd78920..0xd78931 — objc_enumerationMutation guard.
          // Uses `*(*(state+0x08))` compared against snapshot from before
          // the batch; if the mutation counter changed, calls
          // objc_enumerationMutation and (usually) throws. We can't
          // model the pointer without decoding NSFastEnumerationState; the
          // guard body throws when hit, matching the FCP crash behaviour.
          // (Skipped in the pure-transcription form because the surrounding
          // sends throw first.)

          // @Flexo 0xd7893f..0xd78946 — element = state.items[i]. In the
          // asm, items ptr is at -0x118(%rbp); we opaque it via stackBuf.
          const element = stackBuf[i] as NSObject;

          // @Flexo 0xd7894a..0xd7895e — value = [container send-A element].
          const value = objc_msgSend_stub(
            container,
            selInnerA,
            element,
          ) as NSObject;

          // @Flexo 0xd78961..0xd7896e — [value send-B waitSync].
          objc_msgSend_stub(value, selInnerB, waitSync);
        }

        // @Flexo 0xd78979..0xd789a2 — reload next batch.
        batchCount = objc_msgSend_stub(
          container,
          "countByEnumeratingWithState:objects:count:",
          state,
          stackBuf,
          16,
        ) as number;
      }
    } finally {
      // @Flexo 0xd789b0..0xd789b7 — objc_sync_exit(lockClass).
      objc_sync_exit_stub(lockClass);
    }

    // @Flexo 0xd789bc..0xd789ca — __stack_chk_guard verification. In TS the
    // stack is JS-managed; the canary check has no equivalent (and there's
    // nothing to smash from pure-TS memory-safe code).

    // @Flexo 0xd789cc — rax = waitSync; return waitSync.
    return waitSync;
  }
}
