// FactoryParser — Ozone.framework  (layer: channels; parent of DocTemplateParser).
//
// The <factory> element sub-parser used by the Ozone document serializer stack. Faithful
// transcription from Ozone.framework x86_64 disassembly (all 7 vtable methods + both dtors).
// It extends PCSerializer and provides parse{Begin,Element,End} + write{Header,Body} hooks that
// the enclosing PCSerializerReadStream/WriteStream calls while descending into a <factory> block.
//
// VTABLE (Ozone @0x832700; installed-ptr @0x832710):
//   *0x00 -> 0x6DAED0  ~FactoryParser (D1 base dtor)    — `ud2` trap
//   *0x08 -> 0x6DAEE0  ~FactoryParser (D0 deleting dtor)— `ud2` trap
//   *0x10 -> 0x4B100   writeHeader(PCSerializerWriteStream&, bool)
//   *0x18 -> 0x4B110   writeBody(PCSerializerWriteStream&, bool, bool, bool)
//   *0x28 -> 0x486C0   parseBegin(PCSerializerReadStream&)
//   *0x30 -> 0x4B120   parseEnd(PCSerializerReadStream&)
//   *0x38 -> 0x486E0   parseElement(PCSerializerReadStream&, PCStreamElement&)
//   *0x40 -> 0x1DAB0   PCSerializer::readSignificantWhiteSpace() (inherited from base)
//
// DATA:
//   FactoryScope — static local PCScope struct @Ozone 0x92E2B0 (symbol __ZL12FactoryScope), the
//   PCScope descriptor for the <factory> element's children. Element-type table for FactoryScope
//   maps: "description"->93, "version"->94, "manufacturer"->95 (see src/infra/elementTags.ts —
//   recovered from parseElement dispatch tables). This TS port references it symbolically.

import { PCSerializer } from "./PCSerializer.js";
import { PCSerializerReadStream } from "./PCSerializerReadStream.js";
import { PCSerializerWriteStream } from "./PCSerializerWriteStream.js";
import { PCStreamElement } from "./PCStreamElement.js";

/**
 * FactoryScope — PCScope singleton at Ozone 0x92E2B0 (`__ZL12FactoryScope`).
 *
 * The full PCScope struct layout (name/id tables/element-type tags) has NOT been transcribed
 * from the binary yet — accessing it requires PCScope's ctor + PCSerializerReadStream::pushScope
 * decoded, both of which live in ProChannel.framework and are not yet ported. This TS-side handle
 * exists so that parseBegin can pass the same identity to pushScope() when it is transcribed.
 */
export const FactoryScope: { readonly __addr: 0x92e2b0 } = Object.freeze({ __addr: 0x92e2b0 as const });

export class FactoryParser extends PCSerializer {
  /**
   * parseBegin @Ozone 0x486C0.
   * Body (10 lines):
   *   pushq %rbp; movq %rsp,%rbp
   *   movq  %rsi,%rdi              ; arg1 = &stream (was arg1)
   *   leaq  __ZL12FactoryScope(%rip),%rsi  ; arg2 = &FactoryScope
   *   callq __ZN22PCSerializerReadStream9pushScopeEP7PCScope   ; stream.pushScope(&FactoryScope)
   *   movb  $0x1,%al               ; return true
   *   popq  %rbp; retq
   */
  parseBegin(stream: PCSerializerReadStream): boolean {
    // PCSerializerReadStream::pushScope(PCScope*) — ProChannel.framework, __stub @Ozone 0x6DE79C.
    // Not yet transcribed on PCSerializerReadStream; throw @0x6DE79C so callers see the gap.
    const anyStream = stream as unknown as { pushScope?: (scope: unknown) => void };
    if (typeof anyStream.pushScope === "function") {
      anyStream.pushScope(FactoryScope);
    } else {
      throw new Error(
        "PCSerializerReadStream::pushScope(PCScope*) @Ozone stub 0x6DE79C not yet transcribed",
      );
    }
    return true;
  }

  /**
   * parseElement @Ozone 0x486E0.
   * Body (16 lines):
   *   cmpl  $0x5E,0x8(%rdx)       ; PCStreamElement.type == 94 ("version") ?
   *   jne   0x48705                ; else fallthrough -> return true
   *   pushq %rbp; movq %rsp,%rbp
   *   subq  $0x10,%rsp             ; alloca 16 bytes (holds one float)
   *   leaq  -0x4(%rbp),%rax        ; &out_float
   *   movq  %rsi,%rdi              ; arg1 = &stream
   *   movq  %rdx,%rsi              ; arg2 = &elem
   *   movq  %rax,%rdx              ; arg3 = &out_float
   *   callq __ZN22PCSerializerReadStream10getAsFloatER15PCStreamElementPf
   *   addq  $0x10,%rsp
   *   popq  %rbp
   *   movb  $0x1,%al               ; return true
   *   retq
   *
   * i.e. — if this child element is <version> (type-tag 94 in FactoryScope per elementTags.ts),
   * read its text as a float via PCSerializerReadStream::getAsFloat. The value is written to a
   * stack local and DISCARDED (FCP does not store it here); the return value is unconditionally
   * true. This is a "version probe" during parseBegin/parseElement descent.
   */
  parseElement(stream: PCSerializerReadStream, elem: PCStreamElement): boolean {
    if (elem.type === 0x5e) {
      // PCSerializerReadStream::getAsFloat(PCStreamElement&, float*) — ProChannel.framework,
      // __stub @Ozone 0x6DE76C. Not yet transcribed on PCSerializerReadStream — throw.
      const anyStream = stream as unknown as {
        getAsFloat?: (e: PCStreamElement, out: { value: number }) => void;
      };
      if (typeof anyStream.getAsFloat === "function") {
        const out = { value: 0 };
        anyStream.getAsFloat(elem, out);
        // return value discarded by parseElement (mirrors asm: stack slot is popped and ignored)
      } else {
        throw new Error(
          "PCSerializerReadStream::getAsFloat(PCStreamElement&, float*) @Ozone stub 0x6DE76C not yet transcribed",
        );
      }
    }
    return true;
  }

  /**
   * parseEnd @Ozone 0x4B120. Body:
   *   pushq %rbp; movq %rsp,%rbp
   *   movb  $0x1,%al   ; return true
   *   popq  %rbp; retq
   * — no work; the </factory> close is a no-op.
   */
  parseEnd(_stream: PCSerializerReadStream): boolean {
    return true;
  }

  /**
   * writeHeader @Ozone 0x4B100. Body:
   *   pushq %rbp; movq %rsp,%rbp; popq %rbp; retq
   * — empty function (void return, no side effects). FactoryParser does not emit a <factory>
   *   header itself; the enclosing document parser writes the opening tag.
   */
  writeHeader(_stream: PCSerializerWriteStream, _flag: boolean): void {
    // no-op — mirrors empty asm body
  }

  /**
   * writeBody @Ozone 0x4B110. Body:
   *   pushq %rbp; movq %rsp,%rbp; popq %rbp; retq
   * — empty function (void return). FactoryParser writes no child elements at this layer;
   *   subclasses (DocTemplateParser @0x4B160) override to emit the payload.
   */
  writeBody(_stream: PCSerializerWriteStream, _a: boolean, _b: boolean, _c: boolean): void {
    // no-op — mirrors empty asm body
  }

  /**
   * ~FactoryParser (D1 base dtor) @Ozone 0x6DAED0. Body:
   *   pushq %rbp; movq %rsp,%rbp; ud2
   * `ud2` = illegal-instruction trap. This dtor slot must never be reached at runtime; any
   * concrete subclass (DocTemplateParser) provides its own D1. If JS ever "destroys" one of
   * these, we mirror the trap by throwing.
   */
  destroyD1(): never {
    throw new Error("FactoryParser::~FactoryParser() D1 @Ozone 0x6DAED0 is `ud2` — must never be reached");
  }

  /**
   * ~FactoryParser (D0 deleting dtor) @Ozone 0x6DAEE0. Body:
   *   pushq %rbp; movq %rsp,%rbp; ud2
   * Same trap semantics as D1 — this vtable slot is emitted for RTTI/vtable completeness only.
   */
  destroyD0(): never {
    throw new Error("FactoryParser::~FactoryParser() D0 @Ozone 0x6DAEE0 is `ud2` — must never be reached");
  }
}
