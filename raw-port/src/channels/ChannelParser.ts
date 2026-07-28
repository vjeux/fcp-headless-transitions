// ChannelParser.ts — FCP ProChannel ChannelParser:
// XML-stream serializer/deserializer helper for the OZChannelBase family.
//
// FRAMEWORK: ProChannel.framework (Final Cut Pro).
// DECODE: otool -tV -arch x86_64
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProChannel.framework/Versions/A/ProChannel
//   Symbol map: /tmp/ProChannel_symmap.tsv.
//
// STRUCT LAYOUT (recovered from methods that reference `%rdi`/this):
//   ChannelParser is EMBEDDED inside an OZChannelBase at OZChannelBase+0x10 — proved by
//   `OZChannelBase::getSerializer()` @0x518c8 which is `leaq 0x10(%rdi), %rax; ret` —
//   the getter returns a pointer to a ChannelParser held as a member sub-object.
//     +0x00  vtable                (installed by the class ctor, not shown here — this
//                                    file only ports methods that were in the ledger.
//                                    All method entries begin `pushq %rbp; movq %rsp,%rbp`
//                                    so the ctor is separate.)
//     +0x08  parent OZChannelBase* (or state-obj*) — read in parseBegin @0x4c073 and in
//                                    parseElement @0x4c0f5, and passed through as `%rsi`
//                                    to a virtual method at slot *0x1d0(vtable) in
//                                    parseBegin (see the frontier stub for slot 0x1d0).
//     +0x10  byte (bool) flag set to 1 in parseElement @0x4c0ff when a `n`-tagged element
//                                    is entered (i.e. "loadHandler was pushed").
//     +0x68  uint32 major version  (written from sscanf "%d.%d" @0x4c174)
//     +0x6c  uint32 minor version  (written from sscanf "%d.%d" @0x4c17b)
//
// EXPORTED SYMBOLS (from ledger — 8 methods):
//   @ProChannel 0x000000000004c058  __ZN13ChannelParser10parseBeginER22PCSerializerReadStream
//   @ProChannel 0x000000000004c08e  __ZN13ChannelParser12parseElementER22PCSerializerReadStreamR15PCStreamElement
//   @ProChannel 0x000000000004c49c  __ZN13ChannelParserD1Ev
//   @ProChannel 0x000000000004cadc  __ZN13ChannelParserD0Ev
//   @ProChannel 0x000000000004cae6  __ZN13ChannelParser11writeHeaderER23PCSerializerWriteStreamb
//   @ProChannel 0x000000000004caec  __ZN13ChannelParser9writeBodyER23PCSerializerWriteStreambbb
//   @ProChannel 0x000000000004caf2  __ZN13ChannelParser29markFactoriesForSerializationER23PCSerializerWriteStreamb
//   @ProChannel 0x000000000004caf8  __ZN13ChannelParser8parseEndER22PCSerializerReadStream
//
// FRONTIER (opaque callees — each a throwing stub citing its @0xADDR):
//   • PCSerializerReadStream::pushScope(PCScope*)                       @0xacc4e stub
//   • PCSerializerReadStream::pushHandler(PCSerializer*)                @0xacc42 stub
//   • PCSerializerReadStream::getAttributeAsUInt32(elem, id, u32*) const @0xacd50 stub
//   • PCSerializerReadStream::getAttributeAsDouble(elem, id, dbl*) const @0xacd44 stub
//   • PCSerializerReadStream::getAttributeAsString(elem, id, PCString*) const @0xacd4a stub
//   • PCSerializerReadStream::getAttributeAsUUID(elem, id) const -> PCUUID*  @0xacd3e stub
//   • PCString::PCString()  ctor                                        @0xacd1a stub
//   • PCString::~PCString() dtor                                        @0xacd20 stub
//   • PCString::createCStr() const  -> const char* (heap-allocated)     @0xacd80 stub
//   • OZMLScope — a static PCScope singleton at __DATA __ZL9OZMLScope   @0xebb60 (bss)
//   • OZFactories::getInstance()                                        @__ZN11OZFactories11getInstanceEv
//   • OZFactories::findFactory(PCUUID const&)                           @__ZN11OZFactories11findFactoryERK6PCUUID
//   • OZFactories::setFactoryLoadID(uint32, OZFactory*)                 @__ZN11OZFactories16setFactoryLoadIDEjP9OZFactory
//   • Virtual slot *0x1d0(vtable_of_+0x8_field)                          @0x4c07f — belongs
//       to whatever class `this+0x8` points at (NOT OZChannelBase, whose vtable ends at
//       0x118). This class hasn't been decoded yet.
//   • libc: `sscanf` @0xacf90, `free` @0xacee8, `operator delete` (__ZdlPv) @0xace04.
//
// SEMANTICS OVERVIEW
//   ChannelParser handles the XML wire format for an OZ channel. It is registered as a
//   `PCSerializer` on a stream; the stream drives it via three virtuals we port here:
//     parseBegin(stream)   -> pushes the OZMLScope onto the stream and asks the parent
//                              channel's +0x1d0 hook to notify "load started".
//     parseElement(stream, elem) -> decodes one XML element by numeric tag code.
//     parseEnd(stream)     -> returns true (no state to unwind here).
//     writeHeader / writeBody / markFactoriesForSerialization -> no-ops (this base class
//                            emits no XML; derived channels override these).
//
//   The tag-code table for parseElement (recovered from the switch chain @0x4c0af-0x4c0c7):
//     tag == 0x5A or 0x5B  -> "version" branch: fetch attr 0x74 as double (discarded) and
//                              as PCString "%d.%d"; sscanf -> this+0x68, this+0x6c.
//     tag == 0x5C          -> "factory" branch: fetch attr 0x6F as uint32 (loadID); fetch
//                              attr 0x75 as PCUUID*; if non-null:
//                                OZFactories::findFactory(*uuid);
//                                if factory: OZFactories::setFactoryLoadID(loadID, factory);
//                                operator delete(uuid);
//     tag == 0x6E          -> "handler" branch: fetch attr 0x71 as uint32 (discarded) and
//                              attr 0x6F as uint32 into a stack slot; store it into
//                              (this+0x8)->[+0x18] = loadID; set this+0x10 = 1; pushHandler
//                              with the object at (this+0x8)+0x10.
//     any other tag        -> silently ignored; fallthrough to epilogue.
//
//   All branches converge at 0x4c1f0 (destruct the throwaway PCString at -0x38, return true).

// ── Frontier opaque types (each is a black-box handle whose internals aren't ported here) ──

/**
 * `PCSerializerReadStream` — opaque handle for the read-side stream. See the six method
 * stubs below. This is the class the free functions in PCSerializerReadStream operate on;
 * ChannelParser is registered as its handler.
 */
export interface PCSerializerReadStream {
  readonly __brand_PCSerializerReadStream: unique symbol;
}

/**
 * `PCSerializerWriteStream` — opaque handle for the write-side stream. writeHeader,
 * writeBody, markFactoriesForSerialization all take one but never use it.
 */
export interface PCSerializerWriteStream {
  readonly __brand_PCSerializerWriteStream: unique symbol;
}

/**
 * `PCStreamElement` — opaque XML-element descriptor. Its only field accessed by this class
 * is the u32 tag at offset +0x8 (see parseElement @0x4c0af `movl 0x8(%r14), %eax`). We
 * expose it here as an unbranded `tag` field so parseElement can switch on it faithfully.
 */
export interface PCStreamElement {
  readonly __brand_PCStreamElement: unique symbol;
  /** +0x8  — u32 tag code (0x5A/0x5B version, 0x5C factory, 0x6E handler, …) */
  readonly tag: number;
}

/**
 * `PCString` — opaque owning string type. See its ctor/dtor/createCStr stubs.
 */
export interface PCString {
  readonly __brand_PCString: unique symbol;
}

/**
 * `PCUUID` — opaque 128-bit UUID (heap-allocated by getAttributeAsUUID and freed by the
 * caller via `operator delete`).
 */
export interface PCUUID {
  readonly __brand_PCUUID: unique symbol;
}

/**
 * `PCScope` — opaque scope singleton pushed on the read stream. The one used here is the
 * OZMLScope static (see reference below).
 */
export interface PCScope {
  readonly __brand_PCScope: unique symbol;
}

/**
 * `OZFactory` — opaque factory handle returned by `OZFactories::findFactory`.
 */
export interface OZFactory {
  readonly __brand_OZFactory: unique symbol;
}

/**
 * `OZFactories` — the singleton registry. Its instance is retrieved and used purely as an
 * opaque receiver here.
 */
export interface OZFactoriesSingleton {
  readonly __brand_OZFactoriesSingleton: unique symbol;
}

/**
 * `PCSerializer` — abstract base class of `ChannelParser`, used by `pushHandler` to accept
 * any parser. Represented as an opaque handle.
 */
export interface PCSerializer {
  readonly __brand_PCSerializer: unique symbol;
}

/** Nested sub-object at OZChannelBase_parent+0x08 (see parseElement@0x6E branch decode). */
export interface OZChannelBase_parent_subObject {
  readonly __brand_OZChannelBase_parent_subObject: unique symbol;
  /** +0x18 (u32) — receives the loadID from attribute 0x6F. */
  loadID_at_0x18: number;
  /** +0x10 (PCSerializer*-alignable) — passed to `stream.pushHandler(...)`. */
  readonly loadHandler_at_0x10: PCSerializer;
}

/**
 * `OZChannelBase` — the parent object of a ChannelParser (held at this+0x8). Not decoded
 * here; only used opaquely as the receiver for the virtual slot *0x1d0 and for its
 * subObject at +0x8.
 */
export interface OZChannelBase_parent {
  readonly __brand_OZChannelBase_parent: unique symbol;
  /** +0x08 -> nested sub-object whose +0x10/+0x18 fields are mutated. */
  readonly subObject: OZChannelBase_parent_subObject;
}

// ── Frontier throwing stubs (each cites its @0xADDR — see PORTING_SPEC rule 3) ───────────

/**
 * `__ZN22PCSerializerReadStream9pushScopeEP7PCScope` — push a scope singleton.
 *   @ProChannel 0xacc4e  symbol stub
 */
function PCSerializerReadStream_pushScope_stub(
  _self: PCSerializerReadStream,
  _scope: PCScope,
): void {
  throw new Error("PCSerializerReadStream::pushScope @ProChannel 0xacc4e is not yet decoded.");
}

/**
 * `__ZN22PCSerializerReadStream11pushHandlerEP12PCSerializer` — push an inner handler.
 *   @ProChannel 0xacc42  symbol stub
 */
function PCSerializerReadStream_pushHandler_stub(
  _self: PCSerializerReadStream,
  _handler: PCSerializer,
): void {
  throw new Error("PCSerializerReadStream::pushHandler @ProChannel 0xacc42 is not yet decoded.");
}

/**
 * `__ZNK22PCSerializerReadStream20getAttributeAsUInt32ERK15PCStreamElementjPj`
 *   @ProChannel 0xacd50  symbol stub
 * Fetches attribute `id` of `elem` as u32; writes to `*out` and returns void (or bool —
 * the return-value register is never inspected at any caller site in this class).
 */
function PCSerializerReadStream_getAttributeAsUInt32_stub(
  _self: PCSerializerReadStream,
  _elem: PCStreamElement,
  _attrId: number,
  _out: { value: number },
): void {
  throw new Error(
    "PCSerializerReadStream::getAttributeAsUInt32 @ProChannel 0xacd50 is not yet decoded.",
  );
}

/**
 * `__ZNK22PCSerializerReadStream20getAttributeAsDoubleERK15PCStreamElementjPd`
 *   @ProChannel 0xacd44  symbol stub
 */
function PCSerializerReadStream_getAttributeAsDouble_stub(
  _self: PCSerializerReadStream,
  _elem: PCStreamElement,
  _attrId: number,
  _out: { value: number },
): void {
  throw new Error(
    "PCSerializerReadStream::getAttributeAsDouble @ProChannel 0xacd44 is not yet decoded.",
  );
}

/**
 * `__ZNK22PCSerializerReadStream20getAttributeAsStringERK15PCStreamElementjP8PCString`
 *   @ProChannel 0xacd4a  symbol stub
 */
function PCSerializerReadStream_getAttributeAsString_stub(
  _self: PCSerializerReadStream,
  _elem: PCStreamElement,
  _attrId: number,
  _out: PCString,
): void {
  throw new Error(
    "PCSerializerReadStream::getAttributeAsString @ProChannel 0xacd4a is not yet decoded.",
  );
}

/**
 * `__ZNK22PCSerializerReadStream18getAttributeAsUUIDERK15PCStreamElementj`
 *   @ProChannel 0xacd3e  symbol stub
 * Returns a heap-allocated PCUUID pointer, or null. Caller must `operator delete` it.
 */
function PCSerializerReadStream_getAttributeAsUUID_stub(
  _self: PCSerializerReadStream,
  _elem: PCStreamElement,
  _attrId: number,
): PCUUID | null {
  throw new Error(
    "PCSerializerReadStream::getAttributeAsUUID @ProChannel 0xacd3e is not yet decoded.",
  );
}

/**
 * `__ZN8PCStringC1Ev` — PCString default ctor.  @ProChannel 0xacd1a  symbol stub.
 */
function PCString_ctor_stub(): PCString {
  throw new Error("PCString::PCString @ProChannel 0xacd1a is not yet decoded.");
}

/**
 * `__ZN8PCStringD1Ev` — PCString destructor.  @ProChannel 0xacd20  symbol stub.
 */
function PCString_dtor_stub(_s: PCString): void {
  throw new Error("PCString::~PCString @ProChannel 0xacd20 is not yet decoded.");
}

/**
 * `__ZNK8PCString10createCStrEv` — return a fresh heap-allocated C string.  @ProChannel 0xacd80
 *   symbol stub. Caller must `free()` the result.
 */
function PCString_createCStr_stub(_s: PCString): string {
  throw new Error("PCString::createCStr @ProChannel 0xacd80 is not yet decoded.");
}

/**
 * `sscanf` — libc.  @ProChannel 0xacf90  symbol stub. Only used with format "%d.%d".
 */
function sscanf_stub(
  _input: string,
  _fmt: string,
  _major: { value: number },
  _minor: { value: number },
): number {
  throw new Error("_sscanf @ProChannel 0xacf90 is not yet decoded.");
}

/**
 * `free` — libc.  @ProChannel 0xacee8  symbol stub. Frees C-string returned by createCStr.
 */
function free_stub(_p: string): void {
  throw new Error("_free @ProChannel 0xacee8 is not yet decoded.");
}

/**
 * `operator delete` — libc++.  @ProChannel 0xace04  symbol stub.
 */
function operatorDelete_stub(_p: unknown): void {
  throw new Error("__ZdlPv @ProChannel 0xace04 is not yet decoded.");
}

/**
 * `OZFactories::getInstance()` — direct-call (not a stub): @ProChannel `__ZN11OZFactories11getInstanceEv`.
 * Called twice in parseElement (0x4c1bd and 0x4c1d5).
 */
function OZFactories_getInstance_stub(): OZFactoriesSingleton {
  throw new Error("OZFactories::getInstance @ProChannel 0xc68 (__ZN11OZFactories11getInstanceEv) is not yet decoded.");
}

/**
 * `OZFactories::findFactory(PCUUID const&)` — direct-call: @ProChannel `__ZN11OZFactories11findFactoryERK6PCUUID`.
 */
function OZFactories_findFactory_stub(_self: OZFactoriesSingleton, _uuid: PCUUID): OZFactory | null {
  throw new Error("OZFactories::findFactory @ProChannel 0x2a3e (__ZN11OZFactories11findFactoryERK6PCUUID) is not yet decoded.");
}

/**
 * `OZFactories::setFactoryLoadID(uint32, OZFactory*)` — @ProChannel `__ZN11OZFactories16setFactoryLoadIDEjP9OZFactory`.
 */
function OZFactories_setFactoryLoadID_stub(
  _self: OZFactoriesSingleton,
  _loadId: number,
  _factory: OZFactory,
): void {
  throw new Error(
    "OZFactories::setFactoryLoadID @ProChannel 0x2980 (__ZN11OZFactories16setFactoryLoadIDEjP9OZFactory) is not yet decoded.",
  );
}

/**
 * The static `OZMLScope` singleton — a PCScope stored at the data label `__ZL9OZMLScope`
 *   @ProChannel 0xebb60  (data-segment BSS entry).
 * The layout of a PCScope isn't decoded here; the value is passed opaquely to pushScope.
 */
function OZMLScope_singleton_stub(): PCScope {
  throw new Error("OZMLScope singleton @ProChannel 0xebb60 (__ZL9OZMLScope) is not yet decoded.");
}

/**
 * Virtual method at vtable slot *0x1d0 of `this+0x8` — called from parseBegin @0x4c07f
 * with `%esi = 1` as the single explicit arg. The receiver class hasn't been decoded (its
 * vtable is at least 0x1d0/8+1 = 59 slots — bigger than OZChannelBase's 0x118 vtable).
 */
function parent_vtable_slot_0x1d0_stub(
  _receiver: OZChannelBase_parent,
  _arg_esi_equals_1: number,
): void {
  throw new Error(
    "vtable slot *0x1d0 on (ChannelParser::+0x8) receiver @ProChannel 0x4c07f is not yet " +
      "decoded — the +0x8 field's class hasn't been resolved.",
  );
}

// ── The class ────────────────────────────────────────────────────────────────────────────

export class ChannelParser {
  /** +0x00 — vtable pointer (installed by the C++ ctor which is not in the ledger). */
  readonly __vtable = "ChannelParser::vtable @ProChannel (ctor not in ledger)";

  /**
   * +0x08 — parent OZChannelBase pointer. The class layout puts ChannelParser as a member
   * at OZChannelBase+0x10 (see `OZChannelBase::getSerializer` @0x518c8), so the parent
   * pointer at +0x8 lets ChannelParser call back into the container. Non-owning.
   */
  parent_at_0x8: OZChannelBase_parent;

  /**
   * +0x10 — byte flag set to 1 by parseElement's tag-0x6E branch (@0x4c0ff) to record
   * that a load-handler has been pushed onto the stream.
   */
  handlerPushed_at_0x10: boolean;

  /** +0x68 — u32 major version, populated by parseElement@0x5A/0x5B via sscanf "%d.%d". */
  major_at_0x68: number;
  /** +0x6c — u32 minor version, populated by parseElement@0x5A/0x5B via sscanf "%d.%d". */
  minor_at_0x6c: number;

  /**
   * ChannelParser constructor is not in the ledger — the class is embedded in
   * OZChannelBase and constructed as part of the containing ctor. We DO NOT invent a body;
   * the fields are initialised to a valid neutral state so we can drive the ported methods.
   */
  constructor(parent: OZChannelBase_parent) {
    this.parent_at_0x8 = parent;
    this.handlerPushed_at_0x10 = false;
    this.major_at_0x68 = 0;
    this.minor_at_0x6c = 0;
  }

  /**
   * parseBegin(PCSerializerReadStream&)  ->  bool
   * @ProChannel 0x000000000004c058  (__ZN13ChannelParser10parseBeginER22PCSerializerReadStream)
   *
   * DECODE @0x4c058-0x4c08d:
   *   0x4c05e  movq %rsi, %rax           -> save `stream`
   *   0x4c061  movq %rdi, %rbx           -> save `this`
   *   0x4c064  leaq __ZL9OZMLScope(%rip), %rsi   -> OZMLScope singleton (@0xebb60)
   *   0x4c06b  movq %rax, %rdi           -> stream
   *   0x4c06e  callq __ZN22PCSerializerReadStream9pushScopeEP7PCScope   (@0xacc4e stub)
   *   0x4c073  movq 0x8(%rbx), %rdi      -> parent = this->parent_at_0x8
   *   0x4c077  movq (%rdi), %rax         -> parent->vtable
   *   0x4c07a  movl $0x1, %esi           -> arg = 1
   *   0x4c07f  callq *0x1d0(%rax)        -> parent->vtable[slot 0x1d0](parent, 1)
   *   0x4c085  movb $0x1, %al            -> return true
   *   0x4c087  addq $0x8,%rsp ; popq %rbx ; popq %rbp ; retq
   */
  parseBegin(stream: PCSerializerReadStream): boolean {
    // @0x4c064-0x4c06e  stream.pushScope(OZMLScope)
    PCSerializerReadStream_pushScope_stub(stream, OZMLScope_singleton_stub());
    // @0x4c073-0x4c07f  parent->vtable[*0x1d0](parent, 1)
    parent_vtable_slot_0x1d0_stub(this.parent_at_0x8, 1);
    // @0x4c085  return true
    return true;
  }

  /**
   * parseElement(PCSerializerReadStream&, PCStreamElement&)  ->  bool
   * @ProChannel 0x000000000004c08e  (__ZN13ChannelParser12parseElementER22PCSerializerReadStreamR15PCStreamElement)
   *
   * DECODE @0x4c08e-0x4c22e (see the SEMANTICS block above for the full switch/branch layout).
   *
   * Common prologue (@0x4c08e-0x4c0aa): saves regs, allocates 0x30 stack bytes, constructs
   * a throwaway `PCString` at -0x38(%rbp) via `PCString::PCString()` (@0xacd1a stub). The
   * PCString is destroyed on every exit path at 0x4c1f0 (@0xacd20 stub).
   *
   * Switch table (@0x4c0af-0x4c0c7):
   *   eax = elem.tag  (u32 at PCStreamElement+0x8)
   *   ecx = eax - 0x5A
   *   if  (ecx  < 2u)         -> tag in {0x5A, 0x5B}   goto branch_version   (@0x4c115)
   *   elif eax == 0x5C        -> tag = 0x5C           goto branch_factory   (@0x4c191)
   *   elif eax != 0x6E        ->                       goto epilogue         (@0x4c1f0)
   *   else (eax == 0x6E)      ->                       fall through to branch_handler
   *
   * All four exits merge at @0x4c1f0 which destructs the throwaway PCString and returns
   * true (`movb $0x1, %al`).
   */
  parseElement(stream: PCSerializerReadStream, elem: PCStreamElement): boolean {
    // @0x4c0a6-0x4c0aa  construct throwaway PCString at -0x38(%rbp)
    const scratch_m38 = PCString_ctor_stub();

    try {
      // @0x4c0af  load elem.tag
      const tag = elem.tag >>> 0;   // u32
      // @0x4c0b3  ecx = tag - 0x5a
      const ecx = (tag - 0x5a) >>> 0;
      // @0x4c0b6  cmpl $0x2, %ecx  ; jb -> unsigned less-than 2
      if (ecx < 2) {
        // ── branch_version @0x4c115-0x4c18f  (tag in {0x5A, 0x5B}) ──
        // @0x4c115-0x4c119  ctor another PCString at -0x28(%rbp)
        const versionStr = PCString_ctor_stub();
        try {
          // @0x4c11e-0x4c12d  getAttributeAsDouble(stream, elem, id=0x74, &-0x50)
          //   result written into a stack slot that is NEVER later read -> the fetch has
          //   no observable effect from this port's point of view, but we mirror the call
          //   faithfully so any side effect on the stream is preserved.
          const discard: { value: number } = { value: 0 };
          PCSerializerReadStream_getAttributeAsDouble_stub(stream, elem, 0x74, discard);

          // @0x4c132-0x4c141  getAttributeAsString(stream, elem, id=0x74, &versionStr)
          PCSerializerReadStream_getAttributeAsString_stub(stream, elem, 0x74, versionStr);

          // @0x4c146-0x4c14a  cStr = versionStr.createCStr()   (heap-allocated)
          const cStr = PCString_createCStr_stub(versionStr);

          // @0x4c152-0x4c16c  sscanf(cStr, "%d.%d", &major, &minor)
          //   fmt string literal recovered from RIP-relative load @0x4c152 into data pool.
          const major = { value: 0 };
          const minor = { value: 0 };
          sscanf_stub(cStr, "%d.%d", major, minor);

          // @0x4c171-0x4c17b  this->major_at_0x68 = *majorSlot ; this->minor_at_0x6c = *minorSlot
          this.major_at_0x68 = major.value | 0;   // signed reinterpret of u32 stack slot
          this.minor_at_0x6c = minor.value | 0;

          // @0x4c17e-0x4c181  free(cStr)
          free_stub(cStr);
          // @0x4c186-0x4c18a  ~PCString(&-0x28)
        } finally {
          PCString_dtor_stub(versionStr);
        }
        // @0x4c18f  jmp epilogue
      } else if (tag === 0x5c) {
        // ── branch_factory @0x4c191-0x4c1ef ──
        // @0x4c191-0x4c1a0  getAttributeAsUInt32(stream, elem, id=0x6F, &-0x2c)  -> loadID
        const loadID = { value: 0 };
        PCSerializerReadStream_getAttributeAsUInt32_stub(stream, elem, 0x6f, loadID);

        // @0x4c1a5-0x4c1b0  uuid = getAttributeAsUUID(stream, elem, id=0x75)
        const uuid = PCSerializerReadStream_getAttributeAsUUID_stub(stream, elem, 0x75);

        // @0x4c1b8-0x4c1bb  if (uuid == null) goto epilogue
        if (uuid !== null) {
          // @0x4c1bd-0x4c1c8  factory = OZFactories::getInstance()->findFactory(*uuid)
          const factories1 = OZFactories_getInstance_stub();
          const factory = OZFactories_findFactory_stub(factories1, uuid);

          // @0x4c1d0-0x4c1d3  if (factory != null):
          if (factory !== null) {
            // @0x4c1d5-0x4c1e3  OZFactories::getInstance()->setFactoryLoadID(loadID, factory)
            //                    (loadID re-read from -0x2c(%rbp))
            const factories2 = OZFactories_getInstance_stub();
            OZFactories_setFactoryLoadID_stub(factories2, loadID.value >>> 0, factory);
          }
          // @0x4c1e8-0x4c1eb  operator delete(uuid)
          operatorDelete_stub(uuid);
        }
        // @0x4c1f0  fall through to epilogue
      } else if (tag === 0x6e) {
        // ── branch_handler @0x4c0cd-0x4c110 ──
        // @0x4c0cd-0x4c0dc  getAttributeAsUInt32(stream, elem, id=0x71, &-0x44) — DISCARDED
        const attr0x71_discard = { value: 0 };
        PCSerializerReadStream_getAttributeAsUInt32_stub(stream, elem, 0x71, attr0x71_discard);

        // @0x4c0e1-0x4c0f0  getAttributeAsUInt32(stream, elem, id=0x6F, &-0x28) -> loadID
        const loadID = { value: 0 };
        PCSerializerReadStream_getAttributeAsUInt32_stub(stream, elem, 0x6f, loadID);

        // @0x4c0f5-0x4c0fc  (this->parent_at_0x8)->subObject.loadID_at_0x18 = loadID
        const parent = this.parent_at_0x8;
        parent.subObject.loadID_at_0x18 = loadID.value >>> 0;

        // @0x4c0ff  this->handlerPushed_at_0x10 = 1
        this.handlerPushed_at_0x10 = true;

        // @0x4c104-0x4c10b  stream.pushHandler(&parent.subObject + 0x10)  ->
        //   the handler is the PCSerializer at parent.subObject+0x10.
        PCSerializerReadStream_pushHandler_stub(
          stream,
          parent.subObject.loadHandler_at_0x10,
        );
        // @0x4c110  jmp epilogue
      } else {
        // @0x4c0c7  jne 0x4c1f0  -> any other tag: fall through to epilogue with no action.
      }
      // @0x4c1f0-0x4c1f9  epilogue: `~PCString(&-0x38) ; movb $0x1, %al ; ret 1`
      return true;
    } finally {
      // @0x4c1f0-0x4c1f4  destruct the -0x38 scratch PCString unconditionally
      PCString_dtor_stub(scratch_m38);
    }
  }

  /**
   * parseEnd(PCSerializerReadStream&)  ->  bool
   * @ProChannel 0x000000000004caf8
   *
   * DECODE @0x4caf8-0x4caff:
   *   0x4cafc  movb $0x1, %al     -> return true
   *   0x4cafe  popq %rbp ; retq
   *
   * The `stream` argument is never observed; parseEnd is a pure "yes I finished" ACK.
   */
  parseEnd(_stream: PCSerializerReadStream): boolean {
    // @0x4cafc  return true
    return true;
  }

  /**
   * writeHeader(PCSerializerWriteStream&, bool)
   * @ProChannel 0x000000000004cae6
   *
   * DECODE @0x4cae6-0x4caeb: `pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq` — no-op.
   * Neither argument is observed; the base class emits nothing (derived channels override).
   */
  writeHeader(_stream: PCSerializerWriteStream, _flag: boolean): void {
    // no-op @0x4cae6
  }

  /**
   * writeBody(PCSerializerWriteStream&, bool, bool, bool)
   * @ProChannel 0x000000000004caec
   *
   * DECODE @0x4caec-0x4caf1: `pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq` — no-op.
   */
  writeBody(
    _stream: PCSerializerWriteStream,
    _a: boolean,
    _b: boolean,
    _c: boolean,
  ): void {
    // no-op @0x4caec
  }

  /**
   * markFactoriesForSerialization(PCSerializerWriteStream&, bool)
   * @ProChannel 0x000000000004caf2
   *
   * DECODE @0x4caf2-0x4caf7: `pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq` — no-op.
   */
  markFactoriesForSerialization(
    _stream: PCSerializerWriteStream,
    _flag: boolean,
  ): void {
    // no-op @0x4caf2
  }

  /**
   * ~ChannelParser()  — the D1 (in-place) destructor.
   * @ProChannel 0x000000000004c49c  (__ZN13ChannelParserD1Ev)
   *
   * DECODE @0x4c49c-0x4c4a1: `pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq` — no-op
   * destructor (parent object owns the storage; no derived fields need release).
   */
  destruct_D1(): void {
    // no-op @0x4c49c
  }

  /**
   * ~ChannelParser()  — the D0 (deleting) destructor.
   * @ProChannel 0x000000000004cadc  (__ZN13ChannelParserD0Ev)
   *
   * DECODE @0x4cadc-0x4cae1: `pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; jmp __ZdlPv` ->
   * tail-calls `operator delete(this)`. In TS with GC there is nothing to do.
   */
  destruct_D0(): void {
    // Tail-call operator delete @0x4cae1 -> in TS this is a no-op under GC.
  }
}
