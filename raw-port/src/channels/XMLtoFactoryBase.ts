// raw-port/src/channels/XMLtoFactoryBase.ts
//
// FCP `XMLtoFactoryBase` — Ozone.framework base serializer for OZML factory-owning
// XML elements. The SIBLING class `XMLtoFactoryIDs` (already ported in the same
// directory) inherits this base's write-side no-ops but overrides the parse-side
// virtuals with a compact factory-ID table reader. `XMLtoFactoryBase` itself is
// the full parse machinery for the OZML root <factory-body> descent: it walks a
// large tag-switch (elem.tag in [0x3C..0x5C]) over an OZFactory tree, resolving
// factories by uuid/loadID and dispatching to their virtual constructors.
//
// This is REAL parser code (not a shader/UI/ObjC facade): the meat is a jump
// table over PCStreamElement.tag values that reads attributes from a
// PCSerializerReadStream, consults `theApp->[+0x20]` (the global OZFactories
// singleton), does two dynamic_casts (OZFxGenerator_Factory / OZSceneNodeFactory)
// and forwards to their virtual `create(...)` slots, then pushes the newly-made
// child object back onto the stream as a nested handler.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Ozone.framework/Versions/A/Ozone (x86_64 slice; VAs below are
//             unadjusted VM addresses from `otool -tV -arch x86_64`).
//
// Disassembly saved at:
//   raw-port/re/disasm/XMLtoFactoryBase.~XMLtoFactoryBase.s  @0x33d100 (D0, 29 lines)
//   raw-port/re/disasm/XMLtoFactoryBase.parseBegin.s         @0x33d160 (22 lines)
//   raw-port/re/disasm/XMLtoFactoryBase.parseEnd.s           @0x33d1a0 (18 lines)
//   raw-port/re/disasm/XMLtoFactoryBase.parseElement.s       @0x33d1d0 (428 lines)
//   raw-port/re/disasm/XMLtoFactoryBase.writeHeader.s        @0x33dcd0 (6 lines — nop)
//   raw-port/re/disasm/XMLtoFactoryBase.writeBody.s          @0x33dce0 (6 lines — nop)
//   raw-port/re/disasm/XMLtoFactoryBase.markFactoriesForSerialization.s @0x33dcf0 (6 lines — nop)
//   D2 @0x33d040, D1 @0x33d0a0 dumped inline from /tmp/Ozone_tV.txt.
//
// Ledger addresses (all Ozone):
//   0x33d040  XMLtoFactoryBase::~XMLtoFactoryBase()          [D2  in-place dtor]
//   0x33d0a0  XMLtoFactoryBase::~XMLtoFactoryBase()          [D1  complete dtor]
//   0x33d100  XMLtoFactoryBase::~XMLtoFactoryBase()          [D0  deleting dtor]
//   0x33d160  XMLtoFactoryBase::parseBegin(PCSerializerReadStream&)
//   0x33d1a0  XMLtoFactoryBase::parseEnd(PCSerializerReadStream&)
//   0x33d1d0  XMLtoFactoryBase::parseElement(PCSerializerReadStream&, PCStreamElement&)
//   0x33dcd0  XMLtoFactoryBase::writeHeader(PCSerializerWriteStream&, bool)              [nop]
//   0x33dce0  XMLtoFactoryBase::writeBody(PCSerializerWriteStream&, bool, bool, bool)    [nop]
//   0x33dcf0  XMLtoFactoryBase::markFactoriesForSerialization(PCSerializerWriteStream&, bool)  [nop]
//
// VTABLE INSTALLED IN THIS CLASS: All three dtors install the same vtable slot
//   D2 @0x33d049  leaq 0x513508(%rip),%rax  -> 0x33d050 + 0x513508 = 0x850558
//   D1 @0x33d0a9  leaq 0x5134a8(%rip),%rax  -> 0x33d0b0 + 0x5134a8 = 0x850558
//   D0 @0x33d10a  leaq 0x513447(%rip),%rax  -> 0x33d111 + 0x513447 = 0x850558
//   All agree at 0x850558 — the installed-ptr for XMLtoFactoryBase's vtable.
//
// STRUCT LAYOUT (recovered from dtor + parseElement offset math):
//   XMLtoFactoryBase {
//     +0x000  vptr                          (= 0x850558 by all dtors)
//     +0x008  OZScene*                      (parseElement @0x33d633 loads +0x8
//                                            and if non-null calls
//                                            `OZScene::addRootNode(OZSceneNode*)`
//                                            on it — so this slot is the target
//                                            scene the factory-created nodes
//                                            attach into.)
//     +0x010  OZSceneNode*                  (parseElement @0x33d610-@0x33d61e
//                                            reads +0x10; if it's null it writes
//                                            the just-created OZFactoryBase*
//                                            (r12) into +0x10 — so this slot is
//                                            a "root node cache" that latches
//                                            the FIRST created node. The dtors
//                                            @0x33d114-@0x33d123 tear it down:
//                                            load +0x10, if non-null call its
//                                            vtable[1] (D0 deleting dtor) and
//                                            null out +0x10.)
//   }
//
// External globals cited by the code:
//   _theApp                (Ozone _theApp)   — global OZApplication*.
//                          theApp->[+0x20]   = OZFactories*  (the singleton)
//                          theApp->[+0x28]   = a "next-loadID" cursor which
//                                              the dtors and parseBegin/parseEnd
//                                              copy into theApp->[+0x30].
//   _OZXMLRootScope        Ozone @0x931370   — global PCScope descriptor for
//                                              the OZML document-root scope,
//                                              passed to `pushScope` by
//                                              parseBegin.
//
// Runtime helpers used by parseElement (all through symbol stubs — provenance
// only, bodies are NOT decoded here; see the throw-stub declarations below):
//   OZFactories::clearFactoryLoadIDs()     __ZN11OZFactories19clearFactoryLoadIDsEv
//   OZFactories::findFactory(PCUUID&)      __ZN11OZFactories11findFactoryERK6PCUUID
//   OZFactories::setFactoryLoadID(u32, OZFactory*)
//                                          __ZN11OZFactories16setFactoryLoadIDEjP9OZFactory
//   OZFactories::lookupFactory(u32)        __ZN11OZFactories13lookupFactoryEj
//   PCSerializerReadStream::pushScope(PCScope*)   __ZN22PCSerializerReadStream9pushScopeEP7PCScope
//   PCSerializerReadStream::pushHandler(PCSerializer*)
//                                          __ZN22PCSerializerReadStream11pushHandlerEP12PCSerializer
//   PCSerializerReadStream::getAttributeAsString  (id=0x6E, 0x76, 0x7)
//   PCSerializerReadStream::getAttributeAsUInt32  (id=0x6F, 0x71)
//   PCSerializerReadStream::getAttributeAsInt32   (id=0x8)
//   PCSerializerReadStream::getAttributeAsBool    (id=0x9)
//   PCSerializerReadStream::getAttributeAsUUID    (id=0x75)  — returns owned buffer
//   PCString::PCString() default ctor      __ZN8PCStringC1Ev
//   PCString::~PCString()                  __ZN8PCStringD1Ev
//   PCString::empty()                      __ZNK8PCString5emptyEv
//   OZFxGenerator::setInternalName(PCString const&)
//                                          __ZN13OZFxGenerator15setInternalNameERK8PCString
//   OZChannelBase::setID(u32)              __ZN13OZChannelBase5setIDEj
//   OZScene::addRootNode(OZSceneNode*)     __ZN7OZScene11addRootNodeEP11OZSceneNode
//   operator delete                        __ZdlPv
//   __dynamic_cast                         ___dynamic_cast
//
// jf sf.

import type {
  PCSerializerReadStream,
  PCSerializerWriteStream,
  PCStreamElement,
} from "./ChannelParser.js";

// ── Opaque frontier types (declared here, not decoded) ──────────────────────────────
/** OZScene — target scene into which root-node factories attach. */
export interface OZScene { readonly __brand_OZScene: unique symbol; }
/** OZSceneNode — the base class for OZFactory-produced node objects. */
export interface OZSceneNode { readonly __brand_OZSceneNode: unique symbol; }

// ── XMLtoFactoryBase ────────────────────────────────────────────────────────────────
/**
 * `XMLtoFactoryBase` — base serializer for OZML factory-owning XML elements.
 *
 * Fields recovered from dtor + parseElement offset math (see file header block
 * above for the addresses that justify each offset).
 */
export class XMLtoFactoryBase {
  /** +0x08 — target OZScene* used by parseElement @0x33d633 for addRootNode. */
  scene_at_0x08: OZScene | null = null;
  /** +0x10 — cached root OZSceneNode*; null until the first factory-created node. */
  rootNode_at_0x10: OZSceneNode | null = null;

  /**
   * `~XMLtoFactoryBase()` — the D1 complete-object dtor.
   * @Ozone 0x000000000033d0a0  (__ZN16XMLtoFactoryBaseD1Ev)
   *
   * DECODE @0x33d0a0-0x33d0ee:
   *   0x33d0a9  leaq 0x5134a8(%rip),%rax   ; RIP-relative to vtable @0x850558
   *   0x33d0b0  movq %rax,(%rdi)           ; install vtable
   *   0x33d0b3  movq 0x10(%rdi),%rdi       ; load owned rootNode
   *   0x33d0b7  testq %rdi,%rdi            ;
   *   0x33d0ba  je   0x33d0ca              ; if non-null:
   *   0x33d0bc    movq (%rdi),%rax         ;   load its vtable
   *   0x33d0bf    callq *0x8(%rax)         ;   invoke slot *0x8  (D0 deleting dtor)
   *   0x33d0c2    movq $0x0,0x10(%rbx)     ;   null +0x10
   *   0x33d0ca  leaq _theApp(%rip),%rbx
   *   0x33d0d1  movq (%rbx),%rax
   *   0x33d0d4  movq 0x20(%rax),%rdi       ; OZFactories* = theApp->[+0x20]
   *   0x33d0d8  callq  __ZN11OZFactories19clearFactoryLoadIDsEv
   *   0x33d0dd  movq (%rbx),%rax
   *   0x33d0e0  movq 0x28(%rax),%rcx       ; nextLoadIDCursor = theApp->[+0x28]
   *   0x33d0e4  movq %rcx,0x30(%rax)       ; theApp->[+0x30] = cursor  (reset)
   *   0x33d0e8  addq $0x8,%rsp; popq %rbx; popq %rbp; retq
   *
   * D2 @0x33d040 is byte-identical modulo the leaq immediate (still resolves to
   * 0x850558) — same body. D0 @0x33d100 differs only by a final tail-jmp to
   * `__ZdlPv`. All three tear down +0x10, reset the OZFactories load-ID table,
   * and rewind theApp's load-ID cursor.
   */
  destroy_D1(): void {
    // vptr install is a runtime-vtable-op with no TS analogue; the OWNED-object
    // teardown at +0x10, however, is real semantic work.
    if (this.rootNode_at_0x10 !== null) {
      OZSceneNode_deleting_dtor_stub(this.rootNode_at_0x10);
      this.rootNode_at_0x10 = null;
    }
    theApp_OZFactories_clearFactoryLoadIDs_stub();
    theApp_resetLoadIDCursor_stub();
  }

  /**
   * `parseBegin(PCSerializerReadStream&)` — enter the OZML root scope.
   * @Ozone 0x000000000033d160  (__ZN16XMLtoFactoryBase10parseBeginER22PCSerializerReadStream)
   *
   * DECODE @0x33d160-0x33d19d:
   *   0x33d16a  leaq _theApp(%rip),%r14
   *   0x33d171  movq (%r14),%rax
   *   0x33d174  movq 0x20(%rax),%rdi        ; OZFactories* = theApp->[+0x20]
   *   0x33d178  callq __ZN11OZFactories19clearFactoryLoadIDsEv
   *   0x33d17d  movq (%r14),%rax
   *   0x33d180  movq 0x28(%rax),%rcx        ; nextLoadIDCursor = theApp->[+0x28]
   *   0x33d184  movq %rcx,0x30(%rax)        ; theApp->[+0x30] = cursor  (reset)
   *   0x33d188  leaq _OZXMLRootScope(%rip),%rsi   ; &OZXMLRootScope @Ozone 0x931370
   *   0x33d18f  movq %rbx,%rdi              ; stream
   *   0x33d192  callq __ZN22PCSerializerReadStream9pushScopeEP7PCScope
   *   0x33d197  movb $0x1,%al               ; return true
   *   0x33d199  popq %rbx; popq %r14; popq %rbp; retq
   *
   * Semantics: reset OZFactories load-ID state, then push the OZML root scope
   * onto the read stream so subsequent parseElement calls resolve element names
   * in the root PCScope. Returns true (never fails).
   */
  parseBegin(stream: PCSerializerReadStream): boolean {
    theApp_OZFactories_clearFactoryLoadIDs_stub();
    theApp_resetLoadIDCursor_stub();
    PCSerializerReadStream_pushScope_OZXMLRoot_stub(stream);
    return true;
  }

  /**
   * `parseEnd(PCSerializerReadStream&)` — release factory state at document end.
   * @Ozone 0x000000000033d1a0  (__ZN16XMLtoFactoryBase8parseEndER22PCSerializerReadStream)
   *
   * DECODE @0x33d1a0-0x33d1cc:
   *   0x33d1a6  leaq _theApp(%rip),%rbx
   *   0x33d1ad  movq (%rbx),%rax
   *   0x33d1b0  movq 0x20(%rax),%rdi        ; OZFactories* = theApp->[+0x20]
   *   0x33d1b4  callq __ZN11OZFactories19clearFactoryLoadIDsEv
   *   0x33d1b9  movq (%rbx),%rax
   *   0x33d1bc  movq 0x28(%rax),%rcx        ; nextLoadIDCursor = theApp->[+0x28]
   *   0x33d1c0  movq %rcx,0x30(%rax)        ; theApp->[+0x30] = cursor  (reset)
   *   0x33d1c4  movb $0x1,%al               ; return true
   *   0x33d1c6  addq $0x8,%rsp; popq %rbx; popq %rbp; retq
   *
   * Semantics: same clear+rewind as parseBegin, but does NOT push a scope
   * (the caller has already unwound). Note the `_stream` parameter is loaded
   * into %rbx (0x33d1a6) but never used — parseEnd's cleanup targets only
   * theApp's OZFactories state.
   */
  parseEnd(_stream: PCSerializerReadStream): boolean {
    theApp_OZFactories_clearFactoryLoadIDs_stub();
    theApp_resetLoadIDCursor_stub();
    return true;
  }

  /**
   * `parseElement(PCSerializerReadStream&, PCStreamElement&)` — the OZML
   * factory-element dispatch. NOT YET TRANSCRIBED (large jump-table over 33
   * possible tag values, many callee subroutines not yet decoded).
   *
   * @Ozone 0x000000000033d1d0  (__ZN16XMLtoFactoryBase12parseElementER22PCSerializerReadStreamR15PCStreamElement)
   *
   * DECODE SUMMARY (428 lines saved at re/disasm/XMLtoFactoryBase.parseElement.s):
   *
   *   Entry:
   *     0x33d1e1  save r15=&elem, rbx=&stream, r14=this
   *     0x33d1ea  movl $0x0,-0x30(%rbp)          ; local loadID  = 0
   *     0x33d1f1  movl 0x8(%rdx),%eax            ; eax = elem.tag  (PCStreamElement+0x8)
   *     0x33d1f4  addl $-0x3c,%eax               ; normalize to 0..0x20
   *     0x33d1f7  cmpl $0x20,%eax
   *     0x33d1fa  ja  0x33d4c4                   ; default (tag=0x71 factoryref) branch
   *     0x33d200  leaq 0x4d9(%rip),%rcx          ; jump-table base @0x33d6e0
   *     0x33d207  movslq (%rcx,%rax,4),%rax      ; 33 signed-32 offsets
   *     0x33d20b  addq %rcx,%rax
   *     0x33d20e  jmpq *%rax                     ; dispatch
   *
   *   The 33-entry jump table lives at 0x33d6e0-0x33d763 (visible as the
   *   `.byte`/bad-opcode block at the tail of the disasm dump). Each entry is
   *   a signed-32 delta from 0x33d6e0.
   *
   *   Case blocks decoded (grouped by their tail-share pattern):
   *
   *     A) 0x33d210 (tag=0x3c "version")
   *        calls __ZL12checkVersionR22PCSerializerReadStreamR15PCStreamElement  (file-local)
   *        jumps to the epilogue at 0x33d684 (returns true).
   *
   *     B) 0x33d220 (tag=0x3d), 0x33d24a (tag=0x3e), 0x33d274 (tag=0x3f),
   *        0x33d29e (tag=0x40) — four sibling blocks: each reads attribute
   *        0x6F (a u32 attr) into local -0x34, loads _theApp, then loads a
   *        HARDCODED UUID from the constant pool (movaps + fixed RIP-relative
   *        constant) into xmm0, and jumps to the shared block at 0x33d352.
   *          UUID @0x33d23e -> pool @ 0x33d245 + 0x3c82fb = ...
   *          UUID @0x33d268 -> pool @ 0x33d26f + 0x3c82a1 = ...
   *          UUID @0x33d292 -> pool @ 0x33d299 + 0x3c8297 = ...
   *          UUID @0x33d2bc -> pool @ 0x33d2c3 + 0x3c829d = ...
   *        These are the compiled-in UUIDs of the four "well-known" factories
   *        (OZFxGenerator_Factory, OZSceneNodeFactory, etc.) that this parser
   *        auto-binds without needing an explicit uuid= attribute. Reading them
   *        out of the __TEXT const pool needs an oracle pass (not done here).
   *
   *     C) 0x33d2c8 (tag=0x41 "factory" — explicit UUID branch):
   *        - reads attribute 0x6F (loadID)  -> local -0x30
   *        - reads attribute 0x75 (uuid, owned buffer returned by getAttributeAsUUID)
   *        - if uuid buffer is null -> jmp 0x33d50e (error-out branch below)
   *        - else: OZFactories::findFactory(uuid), setFactoryLoadID(loadID, factory),
   *          delete uuid buffer, jmp 0x33d50e.
   *        This is the primary `<factory loadID=... uuid=...>` handler.
   *
   *     D) 0x33d32d (tag=0x42..0x5C? default overflow group):
   *        reads attribute 0x6F, loads _theApp, xmm0 constant from pool,
   *        falls into the shared 0x33d352 findFactory block.
   *
   *     Shared block @0x33d352:
   *       - stack-materializes the hardcoded UUID via movaps xmm0,-0x60(%rbp)
   *       - calls OZFactories::findFactory(&stack_uuid), returning OZFactory*
   *       - null-check -> jmp 0x33d50e on failure
   *       - constructs 3 local PCStrings at -0x60, -0x40, -0x48
   *       - reads five attributes: 0x6E str -> -0x60,  0x6F u32 -> -0x30,
   *         0x9 bool -> -0x29,  0x8 i32 -> -0x64,  0x7 str -> -0x48
   *       - if 0x7 was absent, tries 0x76 str -> -0x40 (else -> jmp 0x33d51c)
   *       - dynamic_cast<OZFxGenerator_Factory*>(factory):
   *           on HIT (0x33d43d):  call factory->vtable[*0xC8]  (its
   *              create-by-name virtual) with args (name@-0x40, isEmpty?@al,
   *              bool@-0x29, i32@-0x64, u32@-0x30) — the branch at 0x33d460
   *              picks the 6-arg overload if the -0x48 PCString was NON-empty,
   *              or a 5-arg fallback if it was empty.
   *           on MISS (0x33d476):  dynamic_cast<OZSceneNodeFactory*>(factory),
   *              call factory->vtable[*0xA8] similarly (5-arg / 6-arg overload
   *              selected by the -0x48 PCString.empty() predicate at 0x33d4a8).
   *         -> new object returned to r12 (also r15 = new object cast-view).
   *
   *     Default (elem.tag NOT in 0x3C..0x5C, i.e. tag=0x71 "factoryref"):
   *       @0x33d4c4:
   *         reads attribute 0x6F (loadID) into -0x34,
   *         reads attribute 0x71 (factoryID) into -0x30,
   *         OZFactories::lookupFactory(factoryID) — if null -> error-out branch,
   *         else jumps back to 0x33d36f to reuse the "read name/params + create"
   *         block above with the already-resolved factory.
   *
   *     Error-out branch @0x33d50e:
   *         movq (%rbx),%rax; callq *0x28(%rax)         ; stream->vtable[*0x28] (failElement)
   *         jmp 0x33d684 (epilogue).
   *
   *     Post-create tail @0x33d51c:
   *         Called when the primary 0x7 attribute was absent AND the 0x76 fallback
   *         was also absent. Uses vtable slot *0x10 of the factory to construct a
   *         DEFAULT node (no name arg), then dynamic_cast<OZSceneNode>(result).
   *
   *     Merge/emit tail @0x33d610-@0x33d669:
   *         if (this->rootNode_at_0x10 == null)
   *             this->rootNode_at_0x10 = r12  (the created OZFactoryBase*)
   *             if (r15 == null) jmp cleanup 0x33d644 else fall-through.
   *         else if (r15 != null) fall-through.
   *         Fall-through (@0x33d627):
   *             OZChannelBase::setID(r15 + 0x30, loadID_at_-0x34)   ; every new
   *                             node carries a +0x30 OZChannelBase base subobject
   *                             whose setID is called with the parsed loadID.
   *             if (this->scene_at_0x08 != null)
   *                 OZScene::addRootNode(this->scene_at_0x08, r15)
   *         @0x33d644:
   *             if (r12 != null)
   *                 handler = r12->vtable[*0x40](r12)     ; get PCSerializer* for
   *                                                        ; the child scope
   *                 stream->pushHandler(handler)
   *             else
   *                 stream->vtable[*0x28]()               ; failElement
   *         Then destroy the 3 local PCStrings and return true.
   *
   *   Faithful transcription of the above requires (all not yet decoded here):
   *     - the 33-entry jump table at 0x33d6e0 -> a tag-to-handler map
   *     - the four RIP-relative UUID constants for tags 0x3D-0x40 and the tag
   *       0x42+ default (5 hardcoded __TEXT-pool 16-byte PCUUIDs)
   *     - checkVersion() @Ozone 0x33d??? (file-local static in the same .o)
   *     - OZFactory vtable slot layout: *0x10 (default-construct), *0x28
   *       (failElement on the stream), *0x40 (get inner PCSerializer*),
   *       *0xA8 (OZSceneNodeFactory::create-by-name), *0xC8
   *       (OZFxGenerator_Factory::create-by-name).
   *
   *   Therefore per PORTING_SPEC rule 3 (loud gap over silent guess), this
   *   method is a throw-stub citing its @0xADDR. The class dtor + parse{Begin,
   *   End} + write* + markFactoriesForSerialization are all fully transcribed
   *   above / below.
   */
  parseElement(
    _stream: PCSerializerReadStream,
    _elem: PCStreamElement,
  ): boolean {
    throw new Error(
      "XMLtoFactoryBase::parseElement @Ozone 0x33d1d0 is not yet transcribed — " +
      "428-line tag-dispatch (elem.tag - 0x3c in 0..0x20) with 33-entry jump " +
      "table @0x33d6e0, five hardcoded PCUUIDs in the __TEXT pool, and factory " +
      "vtable slots *0x10/*0x28/*0x40/*0xA8/*0xC8 not yet decoded.",
    );
  }

  /**
   * `writeHeader(PCSerializerWriteStream&, bool)` — no-op.
   * @Ozone 0x000000000033dcd0  (__ZN16XMLtoFactoryBase11writeHeaderER23PCSerializerWriteStreamb)
   *
   * DECODE @0x33dcd0-0x33dcd5: pushq %rbp; movq %rsp,%rbp; popq %rbp; retq
   *   Empty body. XMLtoFactoryBase does not emit a header; subclasses
   *   (XMLtoFactoryIDs et al.) that need one override this slot.
   */
  writeHeader(_stream: PCSerializerWriteStream, _flag: boolean): void {
    // no-op @0x33dcd0
  }

  /**
   * `writeBody(PCSerializerWriteStream&, bool, bool, bool)` — no-op.
   * @Ozone 0x000000000033dce0  (__ZN16XMLtoFactoryBase9writeBodyER23PCSerializerWriteStreambbb)
   *
   * DECODE @0x33dce0-0x33dce5: pushq %rbp; movq %rsp,%rbp; popq %rbp; retq
   *   Empty body. Subclass hook.
   */
  writeBody(
    _stream: PCSerializerWriteStream,
    _a: boolean,
    _b: boolean,
    _c: boolean,
  ): void {
    // no-op @0x33dce0
  }

  /**
   * `markFactoriesForSerialization(PCSerializerWriteStream&, bool)` — no-op.
   * @Ozone 0x000000000033dcf0  (__ZN16XMLtoFactoryBase29markFactoriesForSerializationER23PCSerializerWriteStreamb)
   *
   * DECODE @0x33dcf0-0x33dcf5: pushq %rbp; movq %rsp,%rbp; popq %rbp; retq
   *   Empty body. Subclass hook — XMLtoFactoryIDs @Ozone 0x33dcc0 is likewise
   *   an empty override (cited from its own file).
   */
  markFactoriesForSerialization(
    _stream: PCSerializerWriteStream,
    _flag: boolean,
  ): void {
    // no-op @0x33dcf0
  }
}

// ── Frontier throw-stubs (each cites its @0xADDR per PORTING_SPEC rule 3) ────────────

/**
 * `OZFactories::clearFactoryLoadIDs()` — reset the load-ID -> factory table.
 * Called through _theApp->[+0x20]. Symbol stub @Ozone 0x6dd5d2.
 *   __ZN11OZFactories19clearFactoryLoadIDsEv
 */
function theApp_OZFactories_clearFactoryLoadIDs_stub(): void {
  throw new Error(
    "OZFactories::clearFactoryLoadIDs @Ozone stub 0x6dd5d2 (called from " +
    "XMLtoFactoryBase dtors @0x33d078/@0x33d0d8/@0x33d139, parseBegin @0x33d178, " +
    "parseEnd @0x33d1b4) — not yet transcribed.",
  );
}

/**
 * The dtor / parseBegin / parseEnd all execute the same 2-instruction sequence:
 *   movq theApp->[+0x28],%rcx
 *   movq %rcx,theApp->[+0x30]
 * i.e. rewind theApp->[+0x30] to the value stored at theApp->[+0x28] (the
 * per-document "starting" load-ID cursor). No decoded OZApplication layout yet.
 * Sites: @0x33d080-@0x33d084, @0x33d0e0-@0x33d0e4, @0x33d141-@0x33d145,
 *        @0x33d180-@0x33d184, @0x33d1bc-@0x33d1c0.
 */
function theApp_resetLoadIDCursor_stub(): void {
  throw new Error(
    "theApp load-ID cursor rewind (theApp->[+0x30] = theApp->[+0x28]) @Ozone " +
    "sites 0x33d080/0x33d0e0/0x33d141/0x33d180/0x33d1bc — OZApplication layout " +
    "not yet transcribed.",
  );
}

/**
 * `PCSerializerReadStream::pushScope(OZXMLRootScope)` — push the OZML root
 * scope onto the read stream so subsequent element-name lookups resolve there.
 * Symbol stub @Ozone 0x6de79c.  Called from parseBegin @0x33d192 with the
 * global _OZXMLRootScope (@Ozone 0x931370) as the scope arg.
 *   __ZN22PCSerializerReadStream9pushScopeEP7PCScope
 */
function PCSerializerReadStream_pushScope_OZXMLRoot_stub(
  _stream: PCSerializerReadStream,
): void {
  throw new Error(
    "PCSerializerReadStream::pushScope(_OZXMLRootScope @Ozone 0x931370) — " +
    "@Ozone stub 0x6de79c, called from parseBegin @0x33d192, not yet transcribed.",
  );
}

/**
 * OZSceneNode deleting-dtor call via vtable[*0x8]. Sites in dtors:
 *   D2 @0x33d05f, D1 @0x33d0bf, D0 @0x33d120.
 * The specific concrete subclass held at XMLtoFactoryBase+0x10 varies (it's
 * whatever the factory create() virtual returned), so this call is polymorphic
 * — no single symbol addr; the vtable slot itself (*0x8 of an OZSceneNode
 * subclass) is not decoded here.
 */
function OZSceneNode_deleting_dtor_stub(_n: OZSceneNode): void {
  throw new Error(
    "OZSceneNode deleting-dtor (vtable slot *0x8) — polymorphic call from " +
    "XMLtoFactoryBase dtors @Ozone 0x33d05f / 0x33d0bf / 0x33d120, target " +
    "subclass depends on factory that produced +0x10; not yet transcribed.",
  );
}
