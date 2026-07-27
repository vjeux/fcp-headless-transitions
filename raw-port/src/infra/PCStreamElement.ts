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
}
