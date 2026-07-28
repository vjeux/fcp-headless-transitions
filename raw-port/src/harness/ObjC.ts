// H1 — ObjC runtime harness for the raw-port army.
//
// Faithful transcription of the Darwin ObjC dispatch + ARC refcount surface that
// FCP's frameworks (Flexo, Ozone, ProChannel, ProCore) actually call. The 66K+
// ObjC-touching Flexo functions (BWF_Parser, FFProviderPSDAssistant, OZ*Undo
// Cocoa epilogues, device arbiters, …) all bottom out on the same handful of
// libobjc entry-points; this file models THOSE PRIMITIVES so a class port can
// import { objc_msgSend, objc_retain, ObjCClass } and stop hand-rolling stubs.
//
// ── DECODE PROVENANCE (all citations against Flexo.framework x86_64 slice) ──
// The primitives, their __stubs (jmp qword [rip+disp]) trampolines, and their
// __DATA_CONST.__got fixup targets were resolved with
//   otool -tvV -arch x86_64 /tmp/Flexo.x86_64
//   otool -Iv           -arch x86_64 /tmp/Flexo.x86_64
//   dyld_info -fixups   /tmp/Flexo.x86_64
// on /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/…/Flexo
// (lipo -thin x86_64 -> /tmp/Flexo.x86_64, 40 724 000 bytes). See re/disasm/
// for saved disassembly of representative call sites (BWF_Parser.parse_chunks
// @0xdd2850, BWF_Parser.~BWF_Parser @0xdd3f00, FFAssetUser refcounts near
// 0x36c6f3/0x36c77c).
//
// ── STUBS TABLE (Flexo __TEXT.__stubs, VA -> __got, decoded 2026-07-28) ──
//   0x14978fc  jmp *[rip+0x455d1e] -> __got 0x18ed620  _objc_alloc
//   0x1497902  jmp *[rip+…]        -> __got 0x18ed628  _objc_allocWithZone
//   0x149790e  jmp *[rip+…]        -> __got 0x18ed638  _objc_autorelease
//   0x1497974  jmp *[rip+0x455d46] -> __got 0x18ed6c0  _objc_msgSend
//   0x149797a  jmp *[rip+…]        -> __got 0x18ed6c8  _objc_msgSendSuper2
//   0x1497986  jmp *[rip+…]        -> __got 0x18ed6d8  _objc_msgSend_stret
//   0x14979da  jmp *[rip+…]        -> __got 0x18ed758  _objc_storeStrong
//   (no __stubs entry) __got 0x18ed708  _objc_release   (ARC calls it directly)
//   (no __stubs entry) __got 0x18ed710  _objc_retain    (ARC calls it directly)
//
// ── REAL CALL SITES (scan @2026-07-28: text 0x39c0…0x1494105, thin slice) ──
// via FF 15 disp32 (call qword [rip+disp32]) to __got directly:
//   _objc_retain          @Flexo 0x3d79, 0x4234, 0x4422  (raw ARC bump)
//   _objc_release         @Flexo 0x4178, 0x42a3, 0x449e  (raw ARC drop)
// via E8 rel32 to the __stubs trampoline:
//   _objc_alloc           @Flexo 0x40aa, 0x65bf, 0x7659
//   _objc_autorelease     @Flexo 0x6c8b, 0x6cdf, 0x785d
//   _objc_msgSendSuper2   @Flexo 0x4524, 0x6653, 0x68c0
//   _objc_msgSend_stret   @Flexo 0x77bd, 0x77f8, 0x7832  (stret buffer in %rdi)
//   _objc_storeStrong     @Flexo 0x5b22ef, 0x5b22fa, 0x5b2a55
//   _objc_msgSend         @Flexo 0x13c2619, 0x13c2bfa, 0x13c3075  (also cached
//                          into %r15 across BWF_Parser::parse_chunks @0xdd288a)
//
// ── SELECTOR RECOVERY (documented so every facade can cite REAL selectors) ──
// otool -tvV labels every _objc_msgSend call site with a stock phantom selector
// (whatever selref happens to sit at offset zero of __objc_selrefs). The REAL
// selector is the __objc_selrefs slot loaded into %rsi/%rdx just before the
// call. The recipe, calibrated against BWF_Parser::parse_chunks @0xdd2850:
//   1. Read the "movq disp32(%rip), %rsi" (7-byte REX.W movq r/m64 -> r64).
//      selrefSlotVA = movqVA + 7 + disp32
//   2. selrefSlotVA lives inside __DATA.__objc_selrefs (Flexo: 0x1bb8468 +
//      0x58250 = 0x1c106b8). The 8-byte value at that slot is a chained-fixup
//      qword whose LOW 32 bits are the file offset (== VA on x86_64) of the
//      selector's __objc_methname C-string.
//   3. On the Flexo x86_64 slice, file offset == VA for every load segment
//      (segment __TEXT starts at file 0 / VA 0), so python does
//        with open('/tmp/Flexo.x86_64','rb') as f: buf=f.read()
//        val = int.from_bytes(buf[slot:slot+8],'little')
//        methnameVA = val & 0xffffffff
//        selector = buf[methnameVA:methnameVA+64].split(b'\x00',1)[0]
//      dyld_info -fixups confirms it:
//        __DATA __objc_selrefs 0x01BC9530  rebase  0x0176E767
//      and reading @0x176E767 gives the ASCII "contentLength".
//
// Worked examples recovered from BWF_Parser::parse_chunks (Flexo @0xdd2850):
//   @0xdd286e  callq *[rip+0xb1ae4c]   -> _objc_msgSend
//   @0xdd2867  movq  [rip+0xdf6cc2],%rsi -> selref 0x1BC9530 -> "contentLength"
//   @0xdd2883  movq  [rip+0xdf6cae],%r13 -> selref 0x1BC9538 -> "setReadPosition:"
//   @0xdd289c  movq  [rip+0xdf6c9d],%rsi -> selref 0x1BC9540 -> "read:maxLength:"
//   @0xdd2924  movq  [rip+0xdea76d],%rsi -> selref 0x1BC1098 -> "unsignedLongLongValue"
// This is exactly why BWF_Parser.ts comments name the selectors
// (contentLength/setReadPosition:/read:maxLength:) instead of parroting otool's
// phantom label. Every facade that ports an ObjC call MUST run this recovery
// and cite the recovered selector — never trust otool's default annotation.
//
// ── MODEL SEMANTICS (single-threaded JS is faithful for the ARC surface) ──
// ObjC objects live on the heap with an isa pointer identifying their class;
// the class carries a method-table (selector -> IMP). objc_msgSend(receiver,
// sel, ...args) walks the class chain looking up `sel`, then tail-calls the
// IMP with the receiver + args. ARC (_objc_retain/release/autorelease) mutates
// a per-object atomic refcount; on JS's single-threaded model, "atomic" is a
// no-op — the balanced retain/release pairs the ARC compiler emits are
// faithfully represented by literal ++count / --count on a Number field.
// (Where the deallocation path or the retain-cycle collector is off-scope, the
// throw-stubs below cite the exact libobjc symbol left as a frontier.)
//
// Anything genuinely out of scope for the dispatch+refcount surface (weak refs,
// side-table lookup, class_getMethodImplementation cache lines, the tagged-
// pointer decoder) is left as a throwing stub citing the libobjc entry-point;
// the facades that need those will land them lazily the same way ordinary
// callee frontiers get landed.

/* eslint-disable @typescript-eslint/no-explicit-any */

// ────────────────────────────────────────────────────────────────────────────
// TYPES — model libobjc's runtime types (isa/Class/SEL/IMP) as plain TS.
// ────────────────────────────────────────────────────────────────────────────

/**
 * SEL — an ObjC selector. Native libobjc uniques selectors into a global table
 * (`sel_registerName`) and hands out canonical `char*` pointers so equality is
 * pointer-equality. In TS a JS string is already interned by the engine and
 * `===`-comparable, so SEL is just the selector-name string.
 * Selector names are recovered via the __objc_selrefs walk documented at the
 * top of this file (e.g. "contentLength", "setReadPosition:", "read:maxLength:").
 */
export type SEL = string;

/**
 * IMP — an ObjC method implementation. libobjc IMPs have the C signature
 *   id (*IMP)(id self, SEL _cmd, ...)
 * We match that exactly so a class port can register a method whose body reads
 * `self` / `_cmd` in the same order libobjc's tail-call to the IMP would land.
 */
export type IMP = (self: ObjCObject, _cmd: SEL, ...args: any[]) => any;

/**
 * ObjCClass — the "isa" side. libobjc holds a per-class method table
 * (`class_rw_t.methods`) which msgSend walks (with a hot inline cache). Here
 * we model the method table as a `Map<SEL, IMP>` on the class, plus the
 * superclass chain that objc_msgSend follows when a selector isn't found on
 * the receiver's class. Ivar layout / class_ro_t is deliberately absent — the
 * facade ports keep ivars on the JS object itself, which is faithful because
 * ObjC ivar loads compile to plain `mov` at fixed offsets that the disasm
 * already documents per-class (e.g. BWF_Parser +0x00 stream, +0x08 ChunkList).
 */
export interface ObjCClass {
  /** The class name (e.g. "NSData", "NSNumber", "PAECustomPSDAsset"). */
  readonly name: string;
  /** Superclass, or null for NSObject / root class. objc_msgSendSuper2 walks
   *  this pointer once, then falls back into ordinary lookup on the parent. */
  readonly superclass: ObjCClass | null;
  /** SEL -> IMP method table. A class registers this via `registerMethods()`
   *  when its .ts port loads; msgSend does the walk. */
  readonly methods: Map<SEL, IMP>;
}

/**
 * ObjCObject — one heap instance. `isa` is the class pointer libobjc reads
 * off `*self` (Objective-C's very first ivar). `retainCount` models the ARC
 * refcount libobjc mutates through _objc_retain / _objc_release (see the
 * "raw ARC" call sites @Flexo 0x3d79 / 0x4178 above). Any port-specific ivars
 * live as additional properties on this object.
 */
export interface ObjCObject {
  isa: ObjCClass;
  /** ARC refcount. Fresh objects (from _objc_alloc) come in at 1. Balanced
   *  retain/release pairs land it back at 0 -> dealloc. Single-threaded JS
   *  makes the count field literal (see file header). */
  retainCount: number;
  /** Every ObjC object may carry arbitrary ivars — modelled as extra
   *  properties. The class-port .ts files document the offsets from disasm. */
  [ivar: string]: any;
}

// ────────────────────────────────────────────────────────────────────────────
// REGISTRY — class definition, method registration, selector-name interning.
// ────────────────────────────────────────────────────────────────────────────

/**
 * The runtime class table. libobjc keeps it in the (opaque) NXMapTable that
 * `objc_getClass` reads; here it's a plain Map so a facade port can look its
 * class up by name in `initFromCoder:`-style paths.
 */
const _classes: Map<string, ObjCClass> = new Map();

/**
 * Define a new ObjC class + register it in the runtime table. A facade .ts
 * port calls this once at module load, then attaches methods with
 * `registerMethods`. This mirrors libobjc's `objc_allocateClassPair` +
 * `class_addMethod` + `objc_registerClassPair` sequence.
 * See re/disasm/ Flexo class-touching ctors for the shape.
 */
export function defineClass(name: string, superclass: ObjCClass | null = null): ObjCClass {
  const existing = _classes.get(name);
  if (existing) return existing;
  const cls: ObjCClass = { name, superclass, methods: new Map() };
  _classes.set(name, cls);
  return cls;
}

/**
 * Look up a registered class by name — the TS analogue of libobjc's
 * `objc_getClass(const char*)`. Returns null if the class hasn't been ported
 * yet (a facade using it will throw at that boundary, adding the class to the
 * frontier the same way any undecoded callee does).
 */
export function getClass(name: string): ObjCClass | null {
  return _classes.get(name) ?? null;
}

/**
 * Register one or more selector -> IMP entries on a class. Matches the shape
 * of `class_addMethod(cls, sel, imp, types)` — we drop the type-encoding
 * string (used by libobjc for varargs / stret dispatch) because TS keeps
 * types in the function signatures directly.
 */
export function registerMethods(cls: ObjCClass, methods: Record<SEL, IMP>): void {
  for (const sel of Object.keys(methods)) {
    cls.methods.set(sel, methods[sel]);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// DISPATCH — objc_msgSend, objc_msgSendSuper2, objc_msgSend_stret.
// ────────────────────────────────────────────────────────────────────────────

/**
 * Walk `receiver.isa` up the superclass chain looking for `sel`. This is the
 * lookup libobjc's `class_getMethodImplementation` performs after the inline
 * cache miss; we skip the cache (single-threaded JS + Map hit is already O(1)
 * amortised, and the cache is a performance optimisation not a semantic one).
 * The full libobjc cache (`_class_lookupMethodAndLoadCache3` and friends) is
 * out of scope — see the throw-stub at the bottom of this file.
 */
function _lookup(cls: ObjCClass | null, sel: SEL): IMP | null {
  let c: ObjCClass | null = cls;
  while (c) {
    const imp = c.methods.get(sel);
    if (imp) return imp;
    c = c.superclass;
  }
  return null;
}

/**
 * `_objc_msgSend(id self, SEL _cmd, ...)` — the ObjC runtime dispatcher.
 * Trampoline decoded @Flexo stub 0x1497974 -> __got 0x18ed6c0 (bind
 * libobjc/_objc_msgSend). Representative call sites recorded above; the
 * cached-into-%r15 flavour is @Flexo 0xdd288a (BWF_Parser::parse_chunks).
 *
 * libobjc's msgSend semantics we model:
 *   - `nil` receiver: returns 0 / null / zero-struct. The disasm evidence is
 *     the `testq %rax, %rax; je …` idiom that follows the very first send in
 *     parse_chunks (`callq *…; testq %rax,%rax; je 0xdd2ce0` @0xdd2874) —
 *     libobjc's msgSend-to-nil returns zero and the caller branches on it.
 *   - non-nil: look up `sel` starting at `receiver.isa`, walk superclasses,
 *     tail-call the IMP with (receiver, _cmd, ...args).
 *   - selector not found: libobjc would raise `doesNotRecognizeSelector:`;
 *     we throw citing the selector so the frontier surfaces the missing
 *     method port.
 */
export function objc_msgSend(receiver: ObjCObject | null, sel: SEL, ...args: any[]): any {
  // nil-receiver = 0 return, per libobjc _objc_msgSend fast-path (Flexo @0xdd2874 evidence).
  if (receiver == null) return 0;
  const imp = _lookup(receiver.isa, sel);
  if (!imp) {
    throw new Error(
      `objc_msgSend: [${receiver.isa.name} ${sel}] — selector not registered ` +
      `(libobjc _objc_msgSend @__got 0x18ed6c0; ` +
      `doesNotRecognizeSelector: path not yet transcribed @0x18ed6c0)`
    );
  }
  return imp(receiver, sel, ...args);
}

/**
 * `_objc_msgSendSuper2(struct objc_super2 {receiver, class}*, SEL, ...)` —
 * the `[super foo]` dispatcher. Trampoline @Flexo stub 0x149797a -> __got
 * 0x18ed6c8. Real call sites @Flexo 0x4524, 0x6653, 0x68c0.
 *
 * libobjc reads `objc_super2->class` (the CURRENT class, not the receiver's
 * dynamic isa) and starts the lookup on its SUPERCLASS. That's the sole
 * semantic difference from ordinary msgSend and it's why libobjc has a
 * separate entry-point (using ordinary msgSend on the receiver would recurse
 * back into the overriding method).
 */
export function objc_msgSendSuper2(
  receiver: ObjCObject | null,
  currentClass: ObjCClass,
  sel: SEL,
  ...args: any[]
): any {
  if (receiver == null) return 0;
  const imp = _lookup(currentClass.superclass, sel);
  if (!imp) {
    throw new Error(
      `objc_msgSendSuper2: [super ${sel}] from ${currentClass.name} — ` +
      `no super IMP (libobjc @__got 0x18ed6c8; doesNotRecognizeSelector: ` +
      `path not yet transcribed @0x18ed6c8)`
    );
  }
  return imp(receiver, sel, ...args);
}

/**
 * `_objc_msgSend_stret(struct_out*, id self, SEL _cmd, ...)` — struct-return
 * variant. Trampoline @Flexo stub 0x1497986 -> __got 0x18ed6d8. Real call
 * sites @Flexo 0x77bd, 0x77f8, 0x7832 — every one loads the stret-out buffer
 * pointer into %rdi and shifts self/sel/args by one register (%rsi=self,
 * %rdx=sel, %rcx/%r8/... args). Confirming disasm line:
 *   0x77ef  leaq -0xb0(%rbp), %rdi       ; %rdi = stret buffer
 *   0x77f6  xorl %ecx, %ecx              ; args = 0
 *   0x77f8  callq 0x1497986              ; objc_msgSend_stret
 *
 * We model the stret buffer as a plain object the IMP is expected to WRITE
 * INTO (mutating the properties the caller reads back). That matches the ABI:
 * libobjc's msgSend_stret allocates nothing itself — it just forwards the
 * pointer to the IMP, which fills the caller's stack slot.
 */
export function objc_msgSend_stret<T extends object>(
  out: T,
  receiver: ObjCObject | null,
  sel: SEL,
  ...args: any[]
): T {
  if (receiver == null) return out; // nil -> caller sees zero-initialised buffer
  const imp = _lookup(receiver.isa, sel);
  if (!imp) {
    throw new Error(
      `objc_msgSend_stret: [${receiver.isa.name} ${sel}] — selector not registered ` +
      `(libobjc _objc_msgSend_stret @__got 0x18ed6d8; ` +
      `doesNotRecognizeSelector: path not yet transcribed @0x18ed6d8)`
    );
  }
  // ABI: the IMP receives the stret pointer as its first "hidden" argument.
  // We pass `out` as the first user arg so the IMP can `out.field = …`.
  imp(receiver, sel, out, ...args);
  return out;
}

// ────────────────────────────────────────────────────────────────────────────
// ARC — retain / release / autorelease / alloc / storeStrong.
// ────────────────────────────────────────────────────────────────────────────

/**
 * Autorelease pool — a stack of pending-release objects that ARC drains at
 * scope end. libobjc's `objc_autoreleasePoolPush` returns a token that
 * `objc_autoreleasePoolPop` uses to truncate the pool back to that mark.
 * We model it literally as an array of "marker" tokens + pending objects.
 */
const _autoreleasePool: ObjCObject[] = [];
/** Sentinel objects used as push-tokens; each pool push inserts one. */
const _poolMarkers: symbol[] = [];

/**
 * `_objc_retain(id) -> id` — bump refcount, return the same object.
 * Called directly via FF 15 disp32 to __got 0x18ed710 (no __stubs entry).
 * Real call sites @Flexo 0x3d79, 0x4234, 0x4422; FFAssetUser cites @0x36c6f3.
 *
 * libobjc's actual implementation dispatches on isa tag bits (tagged pointer,
 * side-table, ordinary refcount) and does an atomic increment. On single-
 * threaded JS we're faithful with a plain integer bump because the ARC
 * compiler emits BALANCED retain/release pairs — the atomicity libobjc
 * provides is a race-safety property, not a semantic one for balanced pairs.
 * Tagged-pointer handling (isa low-bit set) is a frontier — see the throw-stub.
 */
export function objc_retain<T extends ObjCObject | null>(obj: T): T {
  if (obj == null) return obj; // libobjc _objc_retain(nil) == nil (fast path)
  obj.retainCount++;
  return obj;
}

/**
 * `_objc_release(id) -> void` — drop refcount; when it hits zero, send
 * `dealloc`. Called directly via FF 15 disp32 to __got 0x18ed708.
 * Real call sites @Flexo 0x4178, 0x42a3, 0x449e; BWF_Parser cites @0xdd3f0c
 * (dtor releases the +0x00 stream ivar), FFAssetUser cites @0x36c77c / @0x36c73c.
 *
 * The dealloc path is a selector send (`[self dealloc]`) which itself walks
 * the ivar release chain and frees the object; libobjc does this inline in
 * _objc_rootRelease. If the class hasn't registered a `dealloc` we skip the
 * send (matches libobjc's NSObject.dealloc which is effectively a no-op after
 * ivar release) so plain data-holder classes port cleanly.
 */
export function objc_release(obj: ObjCObject | null): void {
  if (obj == null) return; // libobjc _objc_release(nil) is a no-op (fast path)
  obj.retainCount--;
  if (obj.retainCount <= 0) {
    const dealloc = _lookup(obj.isa, "dealloc");
    if (dealloc) dealloc(obj, "dealloc");
    // libobjc then hands the storage to `free` — GC handles that in TS.
  }
}

/**
 * `_objc_autorelease(id) -> id` — enqueue the object for release at the next
 * pool drain, return the same object. Trampoline @Flexo stub 0x149790e ->
 * __got 0x18ed638. Real call sites @Flexo 0x6c8b, 0x6cdf, 0x785d.
 *
 * We enqueue the object and return it. `objc_autoreleasePoolPop` drains the
 * pool up to the given marker.
 */
export function objc_autorelease<T extends ObjCObject | null>(obj: T): T {
  if (obj != null) _autoreleasePool.push(obj);
  return obj;
}

/**
 * `_objc_autoreleasePoolPush() -> void*` — trampoline @Flexo stub 0x1497914
 * -> __got 0x18ed640. Returns an opaque marker. libobjc actually returns a
 * sentinel address into its per-thread pool page; we return a JS symbol
 * which is cheap and unique.
 */
export function objc_autoreleasePoolPush(): symbol {
  const tok = Symbol("arpool");
  _poolMarkers.push(tok);
  // Record the pool depth at push time by pushing a matching marker into the
  // pool array itself (cast through unknown — the pop path recognises it).
  _autoreleasePool.push(tok as unknown as ObjCObject);
  return tok;
}

/**
 * `_objc_autoreleasePoolPop(void*) -> void` — trampoline @Flexo stub
 * 0x1497914 (see push) -> __got 0x18ed648. Pop everything back to the marker
 * and release each pooled object once.
 */
export function objc_autoreleasePoolPop(token: symbol): void {
  // Walk from the top of the pool releasing objects until we hit our marker.
  while (_autoreleasePool.length > 0) {
    const top = _autoreleasePool.pop();
    if ((top as unknown as symbol) === token) {
      // Also clear the parallel marker stack.
      const idx = _poolMarkers.lastIndexOf(token);
      if (idx >= 0) _poolMarkers.splice(idx, 1);
      return;
    }
    if (top != null) objc_release(top as ObjCObject);
  }
}

/**
 * `_objc_alloc(Class) -> id` — trampoline @Flexo stub 0x14978fc -> __got
 * 0x18ed620. Real call sites @Flexo 0x40aa, 0x65bf, 0x7659.
 *
 * libobjc's fast path: `class_createInstance(cls, 0)` — allocate zeroed
 * storage sized to `cls->instanceSize`, set `isa = cls`, refcount = 1.
 * In TS we don't have a fixed instance size; the returned object has just
 * isa + retainCount and ivars are attached by the class's initialiser
 * (`init` / class-specific `initWith…:` selector).
 */
export function objc_alloc(cls: ObjCClass): ObjCObject {
  return { isa: cls, retainCount: 1 };
}

/**
 * `_objc_allocWithZone(Class, NSZone*) -> id` — trampoline @Flexo stub
 * 0x1497902 -> __got 0x18ed628. Zones have been a no-op since Mac OS X 10.6;
 * libobjc's allocWithZone tail-calls the same `class_createInstance` alloc
 * ignoring the zone. We do the same.
 */
export function objc_allocWithZone(cls: ObjCClass, _zone: unknown = null): ObjCObject {
  return objc_alloc(cls);
}

/**
 * `_objc_storeStrong(id* location, id newValue) -> void` — trampoline @Flexo
 * stub 0x14979da -> __got 0x18ed758. Real call sites @Flexo 0x5b22ef,
 * 0x5b22fa, 0x5b2a55. This is the ARC __strong assignment helper:
 *   old = *location;
 *   *location = objc_retain(newValue);
 *   objc_release(old);
 * Because TS doesn't have raw C pointers, we model the "location" as a
 * (holder, key) pair — the caller passes the object whose ivar is being
 * assigned and the property name.
 */
export function objc_storeStrong<K extends string>(
  location: { [P in K]: ObjCObject | null },
  key: K,
  newValue: ObjCObject | null,
): void {
  const old = location[key];
  location[key] = objc_retain(newValue) as ObjCObject | null;
  objc_release(old);
}

// ────────────────────────────────────────────────────────────────────────────
// SELECTOR RECOVERY HELPER — documents & performs the __objc_selrefs walk.
// ────────────────────────────────────────────────────────────────────────────

/**
 * `selectorAt(fw, callSiteVA)` — documents the real-selector recovery for a
 * given _objc_msgSend call site in a shipped FCP framework.
 *
 * This is a DOCUMENTATION HELPER — it doesn't need to load the binary at
 * runtime (the porting workflow reads selrefs offline via python + otool).
 * What it MUST do is throw a clear message pointing the porter at the exact
 * recovery recipe, so nobody parrots otool's phantom-selector annotation.
 *
 * Example (BWF_Parser::parse_chunks call site @0xdd286e in Flexo):
 *   selectorAt("Flexo", 0xdd286e)
 *     throws with:
 *       - the recipe (movq disp32 -> selref -> methname)
 *       - the observed selrefs from the parse_chunks decode
 *       - the requirement that the porter run resolve.py / dyld_info -fixups
 *         to recover the concrete selector string for THIS call site
 *
 * Live selector lookup from a running JS port isn't the right layer — the
 * facade port bakes in the recovered selector as a literal string
 * (`objc_msgSend(stream, "contentLength")`), and this helper exists purely
 * so a porter who tries `objc_msgSend(stream, otool_phantom_selector)` gets
 * a loud failure with the recovery recipe attached.
 */
export function selectorAt(fw: string, callSiteVA: number): never {
  throw new Error(
    `selectorAt(${fw}, 0x${callSiteVA.toString(16)}): otool mislabels every ` +
    `_objc_msgSend site with a stock phantom selector. Recover the REAL ` +
    `selector before porting:\n` +
    `  1. Locate the "movq disp32(%rip), %rsi" (or %r13/%rdx for stret) ` +
    `preceding the callq. It is 7 bytes (REX.W 0x48/0x4c, opcode 0x8b, ` +
    `modrm 0x05..0x3d, imm32).\n` +
    `  2. selrefSlotVA = movqVA + 7 + disp32.\n` +
    `  3. On the x86_64 slice (lipo -thin x86_64), file offset == VA. ` +
    `Open the slice and read 8 little-endian bytes at selrefSlotVA.\n` +
    `  4. Low 32 bits of that value = __objc_methname C-string VA. Read ` +
    `until NUL — that is the ACTUAL selector.\n` +
    `Cross-check with:  dyld_info -fixups <slice> | grep <selref hex>\n` +
    `Confirmed on Flexo (2026-07-28): __objc_selrefs 0x1BC9530 rebase ` +
    `0x0176E767 -> "contentLength" (BWF_Parser::parse_chunks @0xdd286e).`
  );
}

// ────────────────────────────────────────────────────────────────────────────
// FRONTIERS — libobjc entry-points intentionally left as throwing stubs.
// A facade that needs one lands the port lazily, same as any other callee.
// ────────────────────────────────────────────────────────────────────────────

/**
 * `class_getMethodImplementation(Class, SEL) -> IMP` — libobjc's cached IMP
 * lookup used by e.g. KVO / bridged Swift interop. The inline cache
 * (`_class_lookupMethodAndLoadCache3` in libobjc.A.dylib) and the associated
 * `objc-cache.mm` machinery are not needed for ordinary msgSend (our
 * `_lookup` above walks the class chain directly), so they're a frontier.
 */
export function class_getMethodImplementation(_cls: ObjCClass, _sel: SEL): IMP {
  throw new Error(
    "class_getMethodImplementation: libobjc cache path not yet transcribed " +
    "(see libobjc _class_lookupMethodAndLoadCache3 @0x18ed6c0 __got neighborhood; " +
    "frontier — ordinary msgSend routes through _lookup without touching the cache)"
  );
}

/**
 * `_objc_retainAutoreleasedReturnValue(id) -> id` — the ARC compiler's
 * caller-side helper that pairs with `_objc_autoreleaseReturnValue` on the
 * callee side to elide a retain/autorelease. Trampoline @Flexo stub
 * 0x14979b6 -> __got 0x18ed728. Ports that need it should call `objc_retain`
 * directly if the elision optimisation is not being modelled; landing the
 * exact elision handshake is a separate frontier because it interlocks with
 * the return-value register (%rax) inspection libobjc does on the thread state.
 */
export function objc_retainAutoreleasedReturnValue<T extends ObjCObject | null>(_obj: T): T {
  throw new Error(
    "objc_retainAutoreleasedReturnValue: return-value elision handshake not yet " +
    "transcribed (libobjc @__got 0x18ed728; frontier — most call sites can be " +
    "modelled by plain objc_retain, the elision is a perf-only optimisation)"
  );
}

/**
 * `_objc_storeWeak(id* location, id newValue) -> id` — weak-reference
 * assignment. Trampoline @Flexo stub 0x14979e0 -> __got 0x18ed760. Weak
 * references touch libobjc's side-table (`weak_entry_t`) which is a whole
 * separate subsystem; a facade that needs it should land it as its own port.
 */
export function objc_storeWeak(
  _location: unknown,
  _newValue: ObjCObject | null,
): ObjCObject | null {
  throw new Error(
    "objc_storeWeak: weak side-table not yet transcribed " +
    "(libobjc @__got 0x18ed760; frontier — separate weak_table_t subsystem)"
  );
}

/**
 * `_objc_loadWeakRetained(id* location) -> id` — companion to storeWeak.
 * Trampoline @Flexo stub 0x149796e -> __got 0x18ed770. Same frontier.
 */
export function objc_loadWeakRetained(_location: unknown): ObjCObject | null {
  throw new Error(
    "objc_loadWeakRetained: weak side-table not yet transcribed " +
    "(libobjc @__got 0x18ed770; frontier — companion to objc_storeWeak)"
  );
}
