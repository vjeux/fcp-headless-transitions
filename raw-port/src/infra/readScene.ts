// readScene.ts — load a Motion .motr XML string into a PCStreamElement tree.
//
// Mirrors FCP's PCMotionProjectXMLParser (NSXMLParser SAX driver, ProCore) + PCSerializer scope
// descent: each element is opened within its PARENT's scope; the loader assigns the child's
// element-type tag (elementTag(parentScope, name)) and pushes the child scope (childScope(...))
// for its own children. Attribute NAMES from the XML are stored directly on PCStreamElement (which
// resolves attrId->name via its scope when parseElement asks). Text content is captured.
//
// This produces the same (type-tagged, scoped) element tree that FCP's parseElement dispatch walks.
import { DOMParser as XmlDomParser } from "@xmldom/xmldom";
import { PCStreamElement } from "./PCStreamElement.js";
import { elementTag } from "./elementTags.js";
import { childScope, ROOT_SCOPE } from "./childScopes.js";

const _DOMParser: typeof DOMParser =
  typeof (globalThis as unknown as { DOMParser?: unknown }).DOMParser !== "undefined"
    ? (globalThis as unknown as { DOMParser: typeof DOMParser }).DOMParser
    : (XmlDomParser as unknown as typeof DOMParser);

function walk(domEl: Element, parentScope: string): PCStreamElement {
  const name = domEl.tagName;
  const scope = childScope(parentScope, name);
  const type = elementTag(parentScope, name);
  const e = new PCStreamElement(name, scope, type);
  // attributes (by XML name — PCStreamElement maps name<->id via its scope)
  const attrs = domEl.attributes;
  for (let i = 0; i < attrs.length; i++) {
    const a = attrs.item(i);
    if (a) e.setAttribute(a.name, a.value);
  }
  // children + text
  let text = "";
  for (let i = 0; i < domEl.childNodes.length; i++) {
    const c = domEl.childNodes[i];
    if (c.nodeType === 1) {
      e.children.push(walk(c as Element, scope));
    } else if (c.nodeType === 3 || c.nodeType === 4) {
      text += c.nodeValue ?? "";
    }
  }
  e.text = text.trim();
  return e;
}

/** Parse a .motr XML string into the root PCStreamElement (the <ozml> document root). */
export function readMotrToElementTree(xml: string): PCStreamElement {
  const doc = new _DOMParser().parseFromString(xml, "text/xml");
  const root = doc.documentElement;
  if (!root) throw new Error("readMotr: empty document");
  return walk(root as unknown as Element, ROOT_SCOPE);
}
