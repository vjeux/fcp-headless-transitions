// PCStreamElement — one XML element in FCP's PCSerializer stream.
//
// Faithful port of ProCore's PCXMLStreamElement (ProCore.framework). Decoded 2026-07-27:
//   - Each element carries an integer element-TYPE tag (the C++ code switches on
//     *(int32*)(elem+0x8)); attributes are keyed by integer ids resolved from the active
//     PCScope's descriptor table (see scopes.ts). getAttributeAsCString(id) scans the element's
//     (id -> value) attribute set. addAttribute(name,value) resolves NAME->id via the scope by
//     strcmp on the descriptor name (PCXMLStreamElement::addAttribute(const char*,const char*)
//     @ ProCore 0x29080).
//
// In this port the underlying XML is parsed to (name -> value) string pairs (we HAVE the real
// attribute names), and getAttribute*(id) maps id->name through the element's scope. This is
// behaviorally identical to FCP: the same id yields the same value; we just skip the numeric
// interning that FCP does for binary streams.

import { attrName } from "./scopes.js";
import type { PCSerializerParseTarget } from "./PCSerializerReadStream.js";

export class PCStreamElement {
  /** XML tag name (e.g. "scenenode", "parameter", "layer", "clip"). */
  readonly tagName: string;
  /** Integer element-type tag FCP switches on in parseElement (assigned by the scope). */
  type: number;
  /** The scope name active for THIS element's attributes (id->name space). */
  scope: string;
  /** Raw attributes by XML name. */
  private attrs: Map<string, string>;
  /** Element text content (for value-carrying elements). */
  text: string;
  children: PCStreamElement[];


  /**
   * @ProCore PCStreamElement layout **+0x0c** — one byte, the "this element has
   * been handed to its serializer" flag.
   *
   * Established by the constructor
   * `PCStreamElement::PCStreamElement(unsigned, PCScope*, PCSerializer*)`
   * @ProCore 0x286e0, which ZEROES it: `xorl %eax, %eax` @0x286f1 then
   * `movb %al, 0xc(%rdi)` @0x286f3 — hence the initial value 0 here. The only
   * writer in the currently-transcribed set is
   * `PCSerializerReadStream::processElement` @ProCore 0x2682f
   * (`movb $0x1, 0xc(%rdx)`), which sets it to 1 immediately BEFORE dispatching
   * to the element's serializer — and deliberately does NOT set it on its
   * NULL-serializer path.
   *
   * Modelled as the byte the machine writes (0 or 1) rather than as a
   * `boolean`, so the store the disasm performs is the store this field
   * receives; readers of the slot are separate ledger units.
   */
  processedFlagAt0xc = 0;

  /**
   * @ProCore PCStreamElement layout **+0x18** — the `PCSerializer*` this
   * element was constructed with: the object whose `parseElement` virtual
   * consumes it.
   *
   * Established by the same constructor @ProCore 0x286e0, from its third
   * pointer argument: `movq %rcx, 0x18(%rdi)` @0x286fa (the mangled name
   * `__ZN15PCStreamElementC2EjP7PCScopeP12PCSerializer` types that argument
   * `PCSerializer*`; the sibling `PCScope*` lands one slot lower at +0x10
   * @0x286f6). NULL is a legal state — `processElement` @ProCore 0x2682a tests
   * for it and answers `false` — so the field defaults to null, and the
   * abstraction-level constructor above (which models the XML reader's own
   * element creation) leaves it unset until an owner attaches itself.
   *
   * Typed by the one slot the decoded call site uses; see
   * {@link PCSerializerParseTarget} for how vtable slot 7 was resolved.
   */
  serializerAt0x18: PCSerializerParseTarget | null = null;

  constructor(tagName: string, scope: string, type = 0) {
    this.tagName = tagName;
    this.scope = scope;
    this.type = type;
    this.attrs = new Map();
    this.text = "";
    this.children = [];
  }

  setAttribute(name: string, value: string): void { this.attrs.set(name, value); }
  hasAttributeName(name: string): boolean { return this.attrs.has(name); }
  attrByName(name: string): string | undefined { return this.attrs.get(name); }

  /** Resolve an attribute value by integer id within this element's scope. */
  private raw(id: number): string | undefined {
    const nm = attrName(this.scope, id);
    if (nm === undefined) return undefined;
    return this.attrs.get(nm);
  }

  // --- getAttributeAs* — mirror PCSerializerReadStream's coercions (strtoul/strtod/etc). ---
  getAttributeAsString(id: number): string | undefined { return this.raw(id); }
  getAttributeAsUInt32(id: number): number | undefined {
    const s = this.raw(id); if (s === undefined) return undefined;
    const v = parseInt(s, 10); return Number.isNaN(v) ? undefined : v >>> 0;
  }
  getAttributeAsInt32(id: number): number | undefined {
    const s = this.raw(id); if (s === undefined) return undefined;
    const v = parseInt(s, 10); return Number.isNaN(v) ? undefined : v | 0;
  }
  getAttributeAsDouble(id: number): number | undefined {
    const s = this.raw(id); if (s === undefined) return undefined;
    const v = parseFloat(s); return Number.isNaN(v) ? undefined : v;
  }
  getAttributeAsBool(id: number): boolean | undefined {
    const s = this.raw(id); if (s === undefined) return undefined;
    return s === "1" || s.toLowerCase() === "true";
  }
  getAttributeAsUUID(id: number): string | undefined {
    const s = this.raw(id); return s; // UUIDs kept as their canonical string form
  }

  /**
   * PCStreamElement::~PCStreamElement() — D1 (complete-object dtor) @ProCore 0x000DD63A.
   *
   * Disassembly (4 lines — from otool -tV of ProCore.framework x86_64):
   *   dd63a  pushq  %rbp
   *   dd63b  movq   %rsp, %rbp
   *   dd63e  ud2
   *
   * Body: `ud2` @ProCore 0xDD63A — abstract-class trap. Byte-identical shape
   * to PCSerializer::~PCSerializer() D1 @Ozone 0x6DAF30 (see PCSerializer.ts):
   * clang's canonical output when the compiler proves the base-class dtor
   * entry can never be reached (all live instances are concrete subclasses
   * whose own D1 handles teardown). The sibling D0 (deleting dtor) at
   * @ProCore 0x000DD640 is byte-identical (also `ud2`).
   *
   * Ported as a raising stub that cites the address, per PCSerializer._dtorD1
   * precedent — an unreachable trap must be a loud gap, not a silent no-op.
   * The decode IS `ud2`; this throw is the faithful port, not a deferral of
   * an undecoded body.
   */
  protected _dtorD1(): never {
    throw new Error(
      "PCStreamElement::~PCStreamElement() D1 @ProCore 0xdd63a is `ud2` — abstract-class trap, must never be reached",
    );
  }
}
