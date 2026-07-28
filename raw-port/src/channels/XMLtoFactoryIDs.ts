// raw-port/src/channels/XMLtoFactoryIDs.ts
//
// FCP `XMLtoFactoryIDs` — Ozone.framework serializer that reads the
// <FactoryIDs> section of an OZML XML stream and populates the global
// OZFactories load-ID table (mapping serialization loadIDs to actual
// OZFactory objects looked up by UUID).
//
// This is a REAL parser (not a pure ObjC facade) — it dispatches on
// PCStreamElement tag codes and does UUID/UInt32 attribute lookups
// against the read stream. The write-side methods (writeHeader,
// writeBody, markFactoriesForSerialization) are all empty stubs: the
// data is emitted by the SIBLING XMLtoFactoryBase base class's write*
// methods (not overridden here), so XMLtoFactoryIDs is a READ-only
// specialization that overrides just the parse-side virtuals.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Ozone.framework/Versions/A/Ozone (x86_64 slice; VAs
//             below are unadjusted VM addresses from `otool -tV`).
//
// Disassembly saved at:
//   raw-port/re/disasm/XMLtoFactoryIDs.parseBegin.s        @0x33cea0
//   raw-port/re/disasm/XMLtoFactoryIDs.parseEnd.s          @0x33cee0
//   raw-port/re/disasm/XMLtoFactoryIDs.parseElement.s      @0x33cf10 (90 lines)
//   raw-port/re/disasm/XMLtoFactoryIDs.writeHeader.s       @0x33dca0 (6 lines — nop)
//   raw-port/re/disasm/XMLtoFactoryIDs.writeBody.s         @0x33dcb0 (6 lines — nop)
//   raw-port/re/disasm/XMLtoFactoryIDs.markFactoriesForSerialization.s @0x33dcc0 (6 lines — nop)
//   (D2 @0x33cd40, D1 @0x33cdc0, D0 @0x33ce30 — inline-dumped)
//
// Ledger addresses (all Ozone):
//   0x33cd40  XMLtoFactoryIDs::~XMLtoFactoryIDs()  [D2 base dtor]
//   0x33cdc0  XMLtoFactoryIDs::~XMLtoFactoryIDs()  [D1 complete dtor]
//   0x33ce30  XMLtoFactoryIDs::~XMLtoFactoryIDs()  [D0 deleting dtor]
//   0x33cea0  XMLtoFactoryIDs::parseBegin(PCSerializerReadStream&)
//   0x33cee0  XMLtoFactoryIDs::parseEnd(PCSerializerReadStream&)
//   0x33cf10  XMLtoFactoryIDs::parseElement(PCSerializerReadStream&, PCStreamElement&)
//   0x33dca0  XMLtoFactoryIDs::writeHeader(...)                                [nop]
//   0x33dcb0  XMLtoFactoryIDs::writeBody(...)                                  [nop]
//   0x33dcc0  XMLtoFactoryIDs::markFactoriesForSerialization(...)              [nop]
//
// VTABLE INSTALLED IN THIS CLASS:
//   D2 @0x33cd4a  leaq 0x5137af(%rip),%rax -> 0x33cd51 + 0x5137af = 0x850500
//   D1 @0x33cdca  leaq 0x51372f(%rip),%rax -> 0x33cdd1 + 0x51372f = 0x850500
//   D0 @0x33ce3a  leaq 0x5136bf(%rip),%rax -> 0x33ce41 + 0x5136bf = 0x850500
//   All 3 agree at 0x850500 (installed-ptr per `vtable.py Ozone
//   XMLtoFactoryIDs` — the vtable object itself is at 0x8504f0).
//
// STRUCT LAYOUT (recovered from D2 + parseElement offset math):
//   XMLtoFactoryIDs {
//     +0x000  vptr                        (= 0x850500 by all dtors)
//     +0x008  <sub-object A: PCSerializer* or similar> (parseElement
//                                          @0x33cf44 does `addq $0x8, %rdi`
//                                          to reach it, then passes it to
//                                          PCSerializerReadStream::pushHandler
//                                          which expects a PCSerializer*.
//                                          So +0x8 is a nested/embedded
//                                          PCSerializer-shaped sub-object —
//                                          almost certainly the vtable-
//                                          extension for the XMLtoFactoryBase
//                                          base class subobject; see the
//                                          full vtable dump for
//                                          XMLtoFactoryBase entries at
//                                          slot *0x68 onward.)
//     +0x018  <heap ptr?>                  (D2 @0x33cd84 loads +0x18, tests,
//                                          and if non-null writes it into
//                                          +0x20 then jmps ::operator delete —
//                                          i.e. some kind of owned buffer
//                                          whose start-address is cached in
//                                          +0x18 and mirrored to +0x20.)
//     +0x020  <heap ptr mirror>            (see +0x18 above.)
//     +0x030  PCString                     (D2 @0x33cd7b invokes
//                                          PCString::~PCString on &this+0x30;
//                                          parseElement tag 0x14 @0x33cff8
//                                          does `addq $0x30, %rdi` to
//                                          reach it as target of an attr
//                                          getter via stream->vtable[*0x10].)
//     +0x038  PCString                     (D2 @0x33cd72 invokes
//                                          PCString::~PCString on &this+0x38;
//                                          parseElement tag 0x17 @0x33cffe
//                                          does `addq $0x38, %rdi` similarly.)
//     +0x040  u8 (bool) primaryFactoriesFound
//                                          (parseElement tag 0x3c @0x33d01b
//                                          writes `movb $0x1, 0x40(%rdi)`.)
//   }
//
// GLOBALS REFERENCED:
//   _theApp                @Ozone 0x934c20  (S = pointer-to-OZApplication)
//   _OZXMLRootScope        @Ozone 0x931370  (D = PCScope root scope singleton)
//
//   `_theApp` is loaded RIP-relative in parseBegin @0x33ceaa, parseEnd
//   @0x33cee6, D0/D1/D2, and parseElement tag=0x5c @0x33cfae. All uses
//   dereference _theApp then read `[_theApp + 0x20]` to get the
//   OZFactories* singleton (i.e. `theApp->factories`).
//
// FACTORY-LOAD-ID STATE MUTATION (visible in parseBegin, parseEnd, D*):
//   Three separate places emit the SAME two operations against the
//   OZFactories singleton at [theApp + 0x20]:
//     (a) OZFactories::clearFactoryLoadIDs()                @0x6dd5d2 stub
//     (b) [theApp+0x30] = [theApp+0x28]                     (i.e. a
//         self-write of the +0x28 slot back into +0x30 — the OZFactories
//         load-ID cursor being reset to its base pointer. The offsets
//         belong to OZApplication, not to us. Provenance-only.)
//
// --- parseElement tag-code table (recovered from switch @0x33cf24..) ---
//   tag == 0x14  -> read attr as PCString into this.+0x30
//                    via stream_or_elem->vtable[*0x10](elem, &this+0x30)
//                    (@0x33cff8..@0x33d00e)
//   tag == 0x17  -> read attr as PCString into this.+0x38
//                    (@0x33cffe..@0x33d00e — same shape as 0x14, different offset)
//   tag == 0x1d  -> PCSerializerReadStream::pushHandler(stream, this+0x8)
//                    (@0x33cf44..@0x33cf56)
//   tag == 0x3c  -> primaryFactoriesFound flag = 1;
//                    call stream->vtable[*0x20] with just (stream)
//                    (@0x33d01b..@0x33d028)  — a "sub-parser done" hook
//   tag in {0x5a, 0x5b} -> checkVersion(stream, elem)  (local static
//                                       @Ozone 0x33be70)  (@0x33cfeb..@0x33cff6)
//   tag == 0x5c  -> "factory" entry: getAttributeAsUInt32(elem, 0x6f, &loadID);
//                    uuid = getAttributeAsUUID(elem, 0x75);
//                    if (uuid) {
//                      factory = theApp.factories.findFactory(*uuid);
//                      if (factory) theApp.factories.setFactoryLoadID(loadID, factory);
//                      ::operator delete(uuid);
//                    }
//                    then stream->vtable[*0x28](stream)  ["skip / consume"]
//   any other tag -> stream->vtable[*0x28](stream)  [fall-through skip]
//
//   Return: mov $0x1, %al ; retq  (always returns `true` — the class
//   accepts every element by either handling it or asking the stream to
//   skip. Same convention as ChannelParser::parseElement.)
//
// --- FRONTIER CALLEES (undecoded — throwing stubs cite them) ---
//   __ZN11OZFactories19clearFactoryLoadIDsEv        @Ozone stub 0x6dd5d2 (via 3 sites)
//   __ZN11OZFactories11findFactoryERK6PCUUID        @Ozone stub 0x6dd5ae (via 0x33cfbf)
//   __ZN11OZFactories16setFactoryLoadIDEjP9OZFactory @Ozone stub 0x6dd5c6 (via 0x33cfd6)
//   __ZN22PCSerializerReadStream9pushScopeEP7PCScope @Ozone stub 0x6de79c (parseBegin @0x33ced2)
//   __ZN22PCSerializerReadStream11pushHandlerEP12PCSerializer
//                                                    @Ozone stub 0x6de790 (parseElement @0x33cf51)
//   __ZNK22PCSerializerReadStream20getAttributeAsUInt32ERK15PCStreamElementjPj
//                                                    @Ozone stub 0x6df798 (parseElement @0x33cf8e)
//   __ZNK22PCSerializerReadStream18getAttributeAsUUIDERK15PCStreamElementj
//                                                    @Ozone stub 0x6df780 (parseElement @0x33cfa1)
//   __ZdlPv                                          @Ozone stub 0x6dfc36 (operator delete)
//   __ZN8PCStringD1Ev                                (PCString::~PCString, D2/D1/D0 @0x33cd76/etc.)
//   __ZL12checkVersionR22PCSerializerReadStreamR15PCStreamElement
//                                                    @Ozone local 0x33be70 (tag 0x5a/0x5b handler)
//
//   Also depends on:
//     elem->vtable[*0x10]  — PCStreamElement's "getAttrAsPCString" (used
//                            by tag 0x14 / 0x17). Not yet transcribed.
//     stream->vtable[*0x20] — parser's "sub-parsed done" hook (tag 0x3c).
//                            Not yet transcribed.
//     stream->vtable[*0x28] — parser's "skip/consume" hook (default + 0x5c).
//                            Not yet transcribed.

/* eslint-disable @typescript-eslint/no-unused-vars */

import { PCSerializerReadStream } from "../infra/PCSerializerReadStream.js";
import { PCStreamElement } from "../infra/PCStreamElement.js";

/** Opaque handle for `OZApplication*` — the global `_theApp` singleton
 *  at Ozone data address 0x934c20. Every access in this class threads
 *  through `[theApp + 0x20]` to reach `OZFactories*`. */
export interface OZApplicationPtr {
  readonly __brand: "OZApplication";
}

/** Opaque handle for `OZFactories*` — the global factory registry.
 *  Reached via `theApp.factories` (i.e. `[theApp+0x20]`) in this file. */
export interface OZFactoriesPtr {
  readonly __brand: "OZFactories";
}

/** Opaque handle for `OZFactory*` — a registered factory. Returned by
 *  `OZFactories::findFactory`, consumed by `setFactoryLoadID`. */
export interface OZFactoryPtr {
  readonly __brand: "OZFactory";
}

/** Opaque handle for `PCUUID*` — the UUID parsed from the "u" (0x75)
 *  attribute of a <factory> element. Heap-allocated by
 *  `getAttributeAsUUID` and freed via `::operator delete` @0x33cfde. */
export interface PCUUIDPtr {
  readonly __brand: "PCUUID";
}

/** Opaque handle for `PCScope*` — an OZML parser scope. The static
 *  singleton `_OZXMLRootScope` @Ozone 0x931370 is pushed by parseBegin. */
export interface PCScopePtr {
  readonly __brand: "PCScope";
}

/** Opaque handle for the sub-object at `this+0x8`, treated as a
 *  `PCSerializer*` by pushHandler. Not decoded further here (it's the
 *  XMLtoFactoryBase base subobject's vtable-extension pointer). */
export interface PCSerializerHandlePtr {
  readonly __brand: "PCSerializerHandle";
}

/** Global at Ozone 0x934c20 — `_theApp` pointer to the OZApplication
 *  singleton. Loaded RIP-relative in every method that touches
 *  factory state (parseBegin @0x33ceaa, parseEnd @0x33cee6,
 *  parseElement tag=0x5c @0x33cfae, D0/D1/D2). */
export function get_theApp(): OZApplicationPtr {
  throw new Error(
    "OZApplication singleton _theApp @Ozone 0x934c20 not yet transcribed",
  );
}

/** Read `[theApp + 0x20]` — the OZFactories singleton pointer. */
export function theApp_factories(_app: OZApplicationPtr): OZFactoriesPtr {
  throw new Error(
    "OZApplication.factories accessor (theApp->[+0x20]) not yet transcribed " +
      "(read by parseBegin @0x33ceb4, parseEnd @0x33cef0, D2 @0x33cd5e, D1 @0x33cddb, D0 @0x33ce4b, parseElement @0x33cfb8)",
  );
}

/** Mirror `[theApp+0x30] = [theApp+0x28]` — the OZFactories load-ID
 *  cursor reset. Emitted by parseBegin @0x33cec0..@0x33cec4, parseEnd
 *  @0x33cefc..@0x33cf00, and all 3 dtors. */
export function theApp_resetFactoryLoadCursor(_app: OZApplicationPtr): void {
  throw new Error(
    "OZApplication.resetFactoryLoadCursor ([+0x30] = [+0x28]) @Ozone " +
      "not yet transcribed (used by parseBegin/parseEnd/D*)",
  );
}

/** Frontier: `OZFactories::clearFactoryLoadIDs()` — @Ozone stub 0x6dd5d2. */
export function OZFactories_clearFactoryLoadIDs(_f: OZFactoriesPtr): void {
  throw new Error(
    "OZFactories::clearFactoryLoadIDs @Ozone __ZN11OZFactories19clearFactoryLoadIDsEv stub@0x6dd5d2 not yet transcribed",
  );
}

/** Frontier: `OZFactories::findFactory(const PCUUID&)` — @Ozone stub 0x6dd5ae. */
export function OZFactories_findFactory(
  _f: OZFactoriesPtr,
  _uuid: PCUUIDPtr,
): OZFactoryPtr | null {
  throw new Error(
    "OZFactories::findFactory @Ozone __ZN11OZFactories11findFactoryERK6PCUUID stub@0x6dd5ae not yet transcribed (called from parseElement @0x33cfbf)",
  );
}

/** Frontier: `OZFactories::setFactoryLoadID(uint32 loadID, OZFactory* f)`
 *  — @Ozone stub 0x6dd5c6. */
export function OZFactories_setFactoryLoadID(
  _f: OZFactoriesPtr,
  _loadID: number,
  _factory: OZFactoryPtr,
): void {
  throw new Error(
    "OZFactories::setFactoryLoadID @Ozone __ZN11OZFactories16setFactoryLoadIDEjP9OZFactory stub@0x6dd5c6 not yet transcribed (called from parseElement @0x33cfd6)",
  );
}

/** Frontier: `PCSerializerReadStream::pushScope(PCScope*)` — @Ozone stub 0x6de79c.
 *  parseBegin @0x33ced2 pushes the `_OZXMLRootScope` singleton. */
export function PCSerializerReadStream_pushScope(
  _stream: PCSerializerReadStream,
  _scope: PCScopePtr,
): void {
  throw new Error(
    "PCSerializerReadStream::pushScope @Ozone __ZN22PCSerializerReadStream9pushScopeEP7PCScope stub@0x6de79c not yet transcribed (called from parseBegin @0x33ced2)",
  );
}

/** Frontier: `PCSerializerReadStream::pushHandler(PCSerializer*)` —
 *  @Ozone stub 0x6de790. parseElement tag 0x1d passes `this+0x8`. */
export function PCSerializerReadStream_pushHandler(
  _stream: PCSerializerReadStream,
  _handler: PCSerializerHandlePtr,
): void {
  throw new Error(
    "PCSerializerReadStream::pushHandler @Ozone __ZN22PCSerializerReadStream11pushHandlerEP12PCSerializer stub@0x6de790 not yet transcribed (called from parseElement @0x33cf51)",
  );
}

/** Frontier: `PCSerializerReadStream::getAttributeAsUInt32(elem, id, out&)`
 *  — @Ozone stub 0x6df798. parseElement tag 0x5c reads attr 0x6f. */
export function PCSerializerReadStream_getAttributeAsUInt32(
  _stream: PCSerializerReadStream,
  _elem: PCStreamElement,
  _attrId: number,
  _outLoadID: { v: number },
): void {
  throw new Error(
    "PCSerializerReadStream::getAttributeAsUInt32 @Ozone __ZNK22PCSerializerReadStream20getAttributeAsUInt32ERK15PCStreamElementjPj stub@0x6df798 not yet transcribed (called from parseElement @0x33cf8e)",
  );
}

/** Frontier: `PCSerializerReadStream::getAttributeAsUUID(elem, id)` —
 *  @Ozone stub 0x6df780. Returns a HEAP-ALLOCATED PCUUID* (nullable);
 *  parseElement tag 0x5c calls this with attrId=0x75 and MUST free
 *  the result via `::operator delete` @0x33cfde. */
export function PCSerializerReadStream_getAttributeAsUUID(
  _stream: PCSerializerReadStream,
  _elem: PCStreamElement,
  _attrId: number,
): PCUUIDPtr | null {
  throw new Error(
    "PCSerializerReadStream::getAttributeAsUUID @Ozone __ZNK22PCSerializerReadStream18getAttributeAsUUIDERK15PCStreamElementj stub@0x6df780 not yet transcribed (called from parseElement @0x33cfa1)",
  );
}

/** Frontier: global `::operator delete` — @Ozone stub 0x6dfc36. Used
 *  to free the heap PCUUID returned by getAttributeAsUUID. */
export function operator_delete(_p: PCUUIDPtr): void {
  throw new Error(
    "::operator delete @Ozone __ZdlPv stub@0x6dfc36 not yet transcribed (called from parseElement @0x33cfde)",
  );
}

/** Frontier: local static `checkVersion(stream, elem)` @Ozone 0x33be70.
 *  Handles tags 0x5a and 0x5b (the two "version" attribute cases in
 *  the OZML root <ozml> element). Not yet transcribed. */
export function checkVersion(
  _stream: PCSerializerReadStream,
  _elem: PCStreamElement,
): void {
  throw new Error(
    "checkVersion @Ozone local __ZL12checkVersionR22PCSerializerReadStreamR15PCStreamElement @0x33be70 not yet transcribed (called from parseElement @0x33cff1)",
  );
}

/** Frontier: `elem->vtable[*0x10]` — the "read this element's attribute
 *  as PCString into &out" vfn on PCStreamElement. Called from
 *  parseElement tag 0x14 (into &this+0x30) and tag 0x17 (into &this+0x38).
 *  Not yet transcribed. */
export function PCStreamElement_vfn_0x10_getAttrAsString(
  _elem: PCStreamElement,
  _outString: unknown,
): void {
  throw new Error(
    "PCStreamElement vtable[*0x10] (getAttrAsString) @Ozone @0x33d00b/@0x33d00b not yet transcribed",
  );
}

/** Frontier: `stream->vtable[*0x20]` — a "sub-parsed done" hook, called
 *  from parseElement tag 0x3c @0x33d025 with just (stream). Not yet
 *  transcribed. */
export function PCSerializerReadStream_vfn_0x20_subDone(
  _stream: PCSerializerReadStream,
): void {
  throw new Error(
    "PCSerializerReadStream vtable[*0x20] (sub-parsed-done hook) @Ozone @0x33d025 not yet transcribed",
  );
}

/** Frontier: `stream->vtable[*0x28]` — a "skip / consume default element"
 *  hook, called from parseElement default arm @0x33d016 and from the
 *  0x5c arm's fallthrough @0x33d016. Not yet transcribed. */
export function PCSerializerReadStream_vfn_0x28_skipDefault(
  _stream: PCSerializerReadStream,
): void {
  throw new Error(
    "PCSerializerReadStream vtable[*0x28] (skip-default hook) @Ozone @0x33d016 not yet transcribed",
  );
}

/** `PCStreamElement` field access: element tag id at +0x8 (u32).
 *  Read by parseElement @0x33cf21 as `movl 0x8(%rdx),%eax`. */
function PCStreamElement_getTag(_elem: PCStreamElement): number {
  throw new Error(
    "PCStreamElement.tag (+0x8 u32) accessor @Ozone (used by XMLtoFactoryIDs::parseElement @0x33cf21) not yet transcribed",
  );
}

/**
 * `XMLtoFactoryIDs` — Ozone serializer for the <FactoryIDs> XML
 * section. Read-side only (all write* virtuals are empty bodies at
 * this level; the base XMLtoFactoryBase provides real write behavior).
 *
 * @Ozone symbols owned by this class:
 *   D2 @0x33cd40   D1 @0x33cdc0   D0 @0x33ce30
 *   parseBegin @0x33cea0
 *   parseEnd @0x33cee0
 *   parseElement @0x33cf10
 *   writeHeader @0x33dca0                        [nop]
 *   writeBody @0x33dcb0                          [nop]
 *   markFactoriesForSerialization @0x33dcc0      [nop]
 *
 * VTable installed at Ozone 0x850500.
 */
export class XMLtoFactoryIDs {
  /** +0x008 sub-object: XMLtoFactoryBase base subobject vptr extension.
   *  Passed to pushHandler as `PCSerializer*` in parseElement tag 0x1d
   *  (@0x33cf44 `addq $0x8, %rdi`). Not modeled beyond a stub. */
  private _subHandlerAt_0x008: PCSerializerHandlePtr | null = null;

  /** +0x018 owned heap buffer pointer (freed via D2 @0x33cd8d/D1/D0). */
  private _ownedBufAt_0x018: unknown = null;

  /** +0x020 mirror of +0x018 (D2 writes +0x18 into +0x20 before ::operator delete).
   *  Provenance-only; not a distinct field in TS. */

  /** +0x030 PCString field, target of parseElement tag 0x14 attribute
   *  read. Destroyed by D2 @0x33cd7b via PCString::~PCString. */
  stringAt_0x030: unknown = null;

  /** +0x038 PCString field, target of parseElement tag 0x17 attribute
   *  read. Destroyed by D2 @0x33cd76 via PCString::~PCString. */
  stringAt_0x038: unknown = null;

  /** +0x040 u8 (bool) — the "primary factories found" flag written by
   *  parseElement tag 0x3c @0x33d01b. */
  primaryFactoriesFound = false;

  /**
   * `XMLtoFactoryIDs::parseBegin(PCSerializerReadStream& stream)` —
   * Ozone @0x33cea0. Returns bool (always `true`).
   *
   *   @0x33ceaa  leaq _theApp(%rip), %r14
   *   @0x33ceb1  movq (%r14), %rax                     ; rax = theApp
   *   @0x33ceb4  movq 0x20(%rax), %rdi                 ; rdi = theApp->factories
   *   @0x33ceb8  callq OZFactories::clearFactoryLoadIDs
   *   @0x33cebd  movq (%r14), %rax                     ; rax = theApp (reload)
   *   @0x33cec0  movq 0x28(%rax), %rcx                 ; rcx = theApp->[+0x28]
   *   @0x33cec4  movq %rcx, 0x30(%rax)                 ; theApp->[+0x30] = rcx
   *   @0x33cec8  leaq _OZXMLRootScope(%rip), %rsi      ; rsi = &_OZXMLRootScope (PCScope*)
   *   @0x33cecf  movq %rbx, %rdi                       ; rdi = stream
   *   @0x33ced2  callq PCSerializerReadStream::pushScope(stream, &OZXMLRootScope)
   *   @0x33ced7  movb $0x1, %al                         ; return true
   */
  parseBegin(stream: PCSerializerReadStream): boolean {
    // @0x33ceaa..@0x33ceb1: theApp = _theApp
    const theApp = get_theApp();
    // @0x33ceb4..@0x33ceb8: theApp.factories.clearFactoryLoadIDs()
    OZFactories_clearFactoryLoadIDs(theApp_factories(theApp));
    // @0x33cebd..@0x33cec4: theApp.[+0x30] = theApp.[+0x28]
    theApp_resetFactoryLoadCursor(theApp);
    // @0x33cec8..@0x33ced2: stream.pushScope(&_OZXMLRootScope)
    PCSerializerReadStream_pushScope(stream, get_OZXMLRootScope());
    // @0x33ced7: return true
    return true;
  }

  /**
   * `XMLtoFactoryIDs::parseEnd(PCSerializerReadStream& stream)` —
   * Ozone @0x33cee0. Returns bool (always `true`). Body is a proper
   * SUBSET of parseBegin — NO pushScope, just the two theApp
   * mutations.
   *
   *   @0x33cee6  leaq _theApp(%rip), %rbx
   *   @0x33ceed  movq (%rbx), %rax
   *   @0x33cef0  movq 0x20(%rax), %rdi
   *   @0x33cef4  callq OZFactories::clearFactoryLoadIDs
   *   @0x33cef9  movq (%rbx), %rax
   *   @0x33cefc  movq 0x28(%rax), %rcx
   *   @0x33cf00  movq %rcx, 0x30(%rax)
   *   @0x33cf04  movb $0x1, %al                         ; return true
   */
  parseEnd(_stream: PCSerializerReadStream): boolean {
    // @0x33cee6..@0x33ceed: theApp = _theApp
    const theApp = get_theApp();
    // @0x33cef0..@0x33cef4: theApp.factories.clearFactoryLoadIDs()
    OZFactories_clearFactoryLoadIDs(theApp_factories(theApp));
    // @0x33cef9..@0x33cf00: theApp.[+0x30] = theApp.[+0x28]
    theApp_resetFactoryLoadCursor(theApp);
    // @0x33cf04: return true
    return true;
  }

  /**
   * `XMLtoFactoryIDs::parseElement(PCSerializerReadStream& stream, PCStreamElement& elem)`
   * — Ozone @0x33cf10. Returns bool (always `true`). Dispatches on
   * `elem.tag` (a u32 at PCStreamElement+0x8, read @0x33cf21).
   *
   * Switch table (see file header for full trace):
   *   tag == 0x14 -> elem.vtable[*0x10](elem, &this.stringAt_0x030)
   *   tag == 0x17 -> elem.vtable[*0x10](elem, &this.stringAt_0x038)
   *   tag == 0x1d -> stream.pushHandler(this+0x8)
   *   tag == 0x3c -> this.primaryFactoriesFound = true;
   *                    stream.vtable[*0x20](stream)
   *   tag == 0x5a || 0x5b -> checkVersion(stream, elem)
   *   tag == 0x5c -> stream.getAttributeAsUInt32(elem, 0x6f, &loadID);
   *                    uuid = stream.getAttributeAsUUID(elem, 0x75);
   *                    if (uuid) {
   *                      factory = theApp.factories.findFactory(*uuid);
   *                      if (factory)
   *                        theApp.factories.setFactoryLoadID(loadID, factory);
   *                      ::operator delete(uuid);
   *                    }
   *                    stream.vtable[*0x28](stream)   [fallthrough skip]
   *   default     -> stream.vtable[*0x28](stream)
   *
   * The frame-local `loadID` is stack-spilled at `-0x1c(%rbp)`
   * (@0x33cf1a `movl $0x0, -0x1c(%rbp)`) then written by
   * getAttributeAsUInt32 and read by setFactoryLoadID @0x33cfcc.
   *
   * Return: `movb $0x1, %al ; retq` @0x33d028.
   */
  parseElement(
    stream: PCSerializerReadStream,
    elem: PCStreamElement,
  ): boolean {
    // @0x33cf1a: loadID = 0 (frame-local u32 at -0x1c(%rbp))
    const loadIDBox = { v: 0 };
    // @0x33cf21: eax = elem.tag  (u32 at PCStreamElement+0x8)
    const tag = PCStreamElement_getTag(elem);

    // @0x33cf24: if (tag > 0x3b) -> high branch
    if (tag > 0x3b) {
      // @0x33cf5b..@0x33cf61: if tag in {0x5a, 0x5b}
      if (tag === 0x5a || tag === 0x5b) {
        // @0x33cff1: checkVersion(stream, elem)
        checkVersion(stream, elem);
      } else if (tag === 0x3c) {
        // @0x33d01b: this.primaryFactoriesFound = 1
        this.primaryFactoriesFound = true;
        // @0x33d025: stream.vtable[*0x20](stream)
        PCSerializerReadStream_vfn_0x20_subDone(stream);
      } else if (tag === 0x5c) {
        // @0x33cf79..@0x33cf8e: stream.getAttributeAsUInt32(elem, 0x6f, &loadID)
        PCSerializerReadStream_getAttributeAsUInt32(
          stream,
          elem,
          0x6f,
          loadIDBox,
        );
        // @0x33cf96..@0x33cfa1: uuid = stream.getAttributeAsUUID(elem, 0x75)
        const uuid = PCSerializerReadStream_getAttributeAsUUID(
          stream,
          elem,
          0x75,
        );
        // @0x33cfa6..@0x33cfa9: if (uuid != NULL)
        if (uuid !== null) {
          // @0x33cfae..@0x33cfbf: factory = theApp.factories.findFactory(*uuid)
          const theApp = get_theApp();
          const factories = theApp_factories(theApp);
          const factory = OZFactories_findFactory(factories, uuid);
          // @0x33cfc4..@0x33cfc7: if (factory != NULL)
          if (factory !== null) {
            // @0x33cfcc..@0x33cfd6: theApp.factories.setFactoryLoadID(loadID, factory)
            // (theApp re-read @0x33cfc9 for correctness across the call;
            // we're already dereferencing the cached copy in TS — same
            // observable state per Rule 1 mirror-of-arithmetic.)
            OZFactories_setFactoryLoadID(factories, loadIDBox.v, factory);
          }
          // @0x33cfdb..@0x33cfde: ::operator delete(uuid)
          operator_delete(uuid);
        }
        // @0x33cfe3..@0x33d016: stream.vtable[*0x28](stream)  [fallthrough skip]
        PCSerializerReadStream_vfn_0x28_skipDefault(stream);
      } else {
        // @0x33d010..@0x33d016: default arm — stream.vtable[*0x28](stream)
        PCSerializerReadStream_vfn_0x28_skipDefault(stream);
      }
    } else {
      // Low branch (tag <= 0x3b).
      if (tag === 0x14) {
        // @0x33cff8..@0x33d00e: elem.vtable[*0x10](elem, &this.stringAt_0x030)
        PCStreamElement_vfn_0x10_getAttrAsString(elem, {
          target: this,
          field: "stringAt_0x030" as const,
        });
      } else if (tag === 0x17) {
        // @0x33cffe..@0x33d00e: elem.vtable[*0x10](elem, &this.stringAt_0x038)
        PCStreamElement_vfn_0x10_getAttrAsString(elem, {
          target: this,
          field: "stringAt_0x038" as const,
        });
      } else if (tag === 0x1d) {
        // @0x33cf44..@0x33cf51: stream.pushHandler(this+0x8)
        PCSerializerReadStream_pushHandler(
          stream,
          this._subHandlerAt_0x008 as PCSerializerHandlePtr,
        );
      } else {
        // @0x33d010..@0x33d016: default arm — stream.vtable[*0x28](stream)
        PCSerializerReadStream_vfn_0x28_skipDefault(stream);
      }
    }

    // @0x33d028: movb $0x1, %al ; retq  (always true)
    return true;
  }

  /**
   * `XMLtoFactoryIDs::writeHeader(PCSerializerWriteStream&, bool)` —
   * Ozone @0x33dca0. Empty body — 3 instructions (push/mov/pop/ret).
   *
   *   @0x33dca0  pushq %rbp
   *   @0x33dca1  movq %rsp, %rbp
   *   @0x33dca4  popq %rbp
   *   @0x33dca5  retq
   *
   * The base XMLtoFactoryBase::writeHeader (@Ozone 0x33dcd0, vtable
   * slot *0x68) provides the actual write behavior. This override
   * shadows the base's HGYUV444...-style dispatch so that when the
   * MOST-derived vtable slot is called on an XMLtoFactoryIDs, no
   * XML output is emitted. Provenance-only. */
  writeHeader(_ws: unknown, _flag: boolean): void {
    // @0x33dca0..@0x33dca5 — empty body.
    return;
  }

  /**
   * `XMLtoFactoryIDs::writeBody(PCSerializerWriteStream&, bool, bool, bool)`
   * — Ozone @0x33dcb0. Empty body (same 3-instr shape). Base version
   * is at @0x33dce0 (vtable slot *0x70).
   */
  writeBody(_ws: unknown, _a: boolean, _b: boolean, _c: boolean): void {
    // @0x33dcb0..@0x33dcb5 — empty body.
    return;
  }

  /**
   * `XMLtoFactoryIDs::markFactoriesForSerialization(PCSerializerWriteStream&, bool)`
   * — Ozone @0x33dcc0. Empty body. Base version @0x33dcf0 (vtable slot *0x78).
   */
  markFactoriesForSerialization(_ws: unknown, _flag: boolean): void {
    // @0x33dcc0..@0x33dcc5 — empty body.
    return;
  }

  /**
   * `XMLtoFactoryIDs::~XMLtoFactoryIDs()` — Ozone D1 @0x33cdc0 (D2
   * @0x33cd40 has an identical body; D0 @0x33ce30 is D1's body plus
   * a trailing `::operator delete(this)` — the Itanium deleting-dtor).
   *
   *   @0x33cdca (D1) / @0x33cd4a (D2) / @0x33ce3a (D0)
   *     leaq (rip),%rax                          ; = 0x850500 vtable
   *     movq %rax, (%rdi)                        ; reset vptr
   *
   *   @0x33cdd4 (D1) / @0x33cd54 (D2) / @0x33ce44 (D0)
   *     leaq _theApp(%rip), %r14                  ; r14 = &_theApp
   *     movq (%r14), %rax                         ; rax = theApp
   *     movq 0x20(%rax), %rdi                     ; rdi = theApp.factories
   *     callq OZFactories::clearFactoryLoadIDs    ; @stub 0x6dd5d2
   *     movq (%r14), %rax                         ; reload theApp
   *     movq 0x28(%rax), %rcx                     ; rcx = theApp.[+0x28]
   *     movq %rcx, 0x30(%rax)                     ; theApp.[+0x30] = rcx
   *
   *   Then:
   *     leaq 0x38(%rbx), %rdi ; PCString::~PCString(&this.stringAt_0x038)  @stub 0x33cd76 (D2 addrs vary)
   *     leaq 0x30(%rbx), %rdi ; PCString::~PCString(&this.stringAt_0x030)
   *     movq 0x18(%rbx), %rdi ; rdi = this.ownedBuf_0x18
   *     testq %rdi, %rdi
   *     je    <skip-delete>
   *     movq %rdi, 0x20(%rbx) ; this.ownedBuf_0x20 = rdi (mirror)
   *     jmp   ::operator delete(this.ownedBuf_0x18)  [tail-jmp in D1/D2]
   *
   *   D0's trailing @0x33ce8d/@0x33ce8d: jmp ::operator delete(this)
   *   — Itanium deleting-dtor. GC in TS subsumes the trailing delete.
   *
   * No virtual bases — D1 and D2 have identical bodies.
   */
  destroy_D1(): void {
    // vptr reset — no-op in TS (provenance only).
    // theApp factory-load-ID reset (same shape as parseBegin/parseEnd):
    const theApp = get_theApp();
    OZFactories_clearFactoryLoadIDs(theApp_factories(theApp));
    theApp_resetFactoryLoadCursor(theApp);

    // Destroy the two PCString fields (order matches asm: +0x38 then +0x30).
    PCString_destruct(this.stringAt_0x038);
    PCString_destruct(this.stringAt_0x030);

    // Free the owned buffer if present.
    if (this._ownedBufAt_0x018 !== null) {
      // (this.ownedBufAt_0x020 = this.ownedBufAt_0x018; then operator delete)
      operator_delete(this._ownedBufAt_0x018 as PCUUIDPtr);
      this._ownedBufAt_0x018 = null;
    }
  }

  /** `XMLtoFactoryIDs::~XMLtoFactoryIDs()` — Ozone D0 @0x33ce30 (deleting).
   *  Body identical to D1 plus a trailing ::operator delete(this)
   *  @0x33ce8d (GC-subsumed in TS). */
  destroy_D0(): void {
    this.destroy_D1();
    // @0x33ce8d — ::operator delete(this) — GC-subsumed.
  }
}

/** Global @Ozone 0x931370 — `_OZXMLRootScope`, the PCScope singleton
 *  pushed by parseBegin. Not yet transcribed. */
function get_OZXMLRootScope(): PCScopePtr {
  throw new Error(
    "_OZXMLRootScope @Ozone 0x931370 singleton not yet transcribed (pushed by XMLtoFactoryIDs::parseBegin @0x33cec8)",
  );
}

/** Frontier: `PCString::~PCString()` — @Ozone stub 0x6df0c6 (D1 overload).
 *  Called from D2 @0x33cd76 (+0x38) and @0x33cd7f (+0x30). */
function PCString_destruct(_s: unknown): void {
  throw new Error(
    "PCString::~PCString @Ozone __ZN8PCStringD1Ev stub@0x6df0c6 not yet transcribed (called from XMLtoFactoryIDs::D* @0x33cd76/@0x33cd7f)",
  );
}
