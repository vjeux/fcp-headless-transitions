// OZChannelFolder — a <parameter> that CONTAINS child parameters/channels. Extends OZChannelBase.
// Faithful port. Decode: OZChannelFolder::parseElement @ ProChannel 0x666c0.
//   - base OZChannelBase::parseElement (@0x666d2)
//   - child <parameter> (element tag 0x6e/0x6f): read id(0x6f) + factoryID(0x71) ->
//     OZFactories::lookupFactory (creates the correct channel subtype: OZChannel / nested
//     OZChannelFolder / OZChannelGradient / OZChannelBlindData / OZChannelText / ...), then
//     name(0x6e), flags(0x70 u64)->setFlags, default(0x73 dbl)->setDefaultValue,
//     value(0x72 dbl)->setInitialValue; push_back into this folder (@0x66819).
//     OZChannelBlindData gets setData; OZChannel gets setInitialValue/setDefaultValue.
// This IS the .motr <parameter id=N name=.. value=.. default=..> reader — the whole animatable
// data tree (transforms, colors, drop-zone media refs, etc.) is nested OZChannelFolders + leaf
// OZChannels.
import { PCSerializerReadStream } from "../infra/PCSerializerReadStream.js";
import { PCStreamElement } from "../infra/PCStreamElement.js";
import { OZChannelBase } from "./OZChannelBase.js";
import { OZChannel } from "./OZChannel.js";

export class OZChannelFolder extends OZChannelBase {
  children: OZChannelBase[] = [];

  push_back(c: OZChannelBase): void { this.children.push(c); }

  /**
   * getDescendant — find a child by numeric ID. DECODED from OZChannelFolder::getDescendant(uint)
   * (@0x65d68): scan the folder's children comparing each child's id field (0x18(child)) to the
   * requested id (with a flag test). Direct-children scan (the ref-path walk recurses per segment).
   */
  getDescendant(id: number): OZChannelBase | undefined {
    return this.children.find(c => c.id === id);
  }

  override parseElement(s: PCSerializerReadStream, e: PCStreamElement): void {
    super.parseElement(s, e); // OZChannelBase::parseElement @0x666d2
    if (e.tagName !== "parameter") return; // only <parameter> children are folder entries
    // factoryID selects the channel subtype (OZFactories::lookupFactory @0x6675b). Absent/0 =>
    // a plain scalar OZChannel (the overwhelmingly common case in transitions). Nested parameters
    // that themselves contain <parameter> children are folders.
    const factoryID = s.getAttributeAsUInt32(e, 0x71) ?? 0;
    const hasChildParams = e.children.some(c => c.tagName === "parameter");
    let node: OZChannelBase;
    if (hasChildParams) {
      const f = new OZChannelFolder();
      node = f;
    } else {
      const ch = new OZChannel();
      const v = s.getAttributeAsDouble(e, 0x72); if (v !== undefined) ch.setInitialValue(v);   // 0x6696c
      const d = s.getAttributeAsDouble(e, 0x73); if (d !== undefined) ch.setDefaultValue(d);    // 0x6687e
      node = ch;
    }
    node.factoryID = factoryID;
    const id = s.getAttributeAsUInt32(e, 0x6f); if (id !== undefined) node.id = id;              // 0x666f7
    const nm = s.getAttributeAsString(e, 0x6e); if (nm !== undefined) node.name = nm;            // 0x6679f
    const fl = s.getAttributeAsUInt32(e, 0x70); if (fl !== undefined) node.flags = BigInt(fl);   // 0x6683a (u64)
    // Recurse into child <parameter>/<curve> elements.
    for (const c of e.children) node.parseElement(s, c);
    this.push_back(node);                                                                        // 0x66819
  }
}

// --- Channel-tree builder (module function) -------------------------------------------------
// Build the channel tree for a <parameter> PCStreamElement. Returns an OZChannelFolder when the
// element has child <parameter>s, else a leaf OZChannel. Mirrors OZChannelFolder::parseElement
// (@0x666xx): id(0x6f)/name(0x6e)/factoryID(0x71)/flags(0x70 u64)/value(0x72->setInitialValue)/
// default(0x73->setDefaultValue); recurse child <parameter>; attach <curve> to leaves.
import { OZCurve, OZKeypoint } from "./OZCurve.js";

export function buildChannelTree(s: PCSerializerReadStream, e: PCStreamElement): OZChannelBase {
  const hasChildParams = e.children.some(c => c.tagName === "parameter");
  const node: OZChannelBase = hasChildParams ? new OZChannelFolder() : new OZChannel();
  const id = s.getAttributeAsUInt32(e, 0x6f); if (id !== undefined) node.id = id;
  const nm = s.getAttributeAsString(e, 0x6e); if (nm !== undefined) node.name = nm;
  const fid = s.getAttributeAsUInt32(e, 0x71); if (fid !== undefined) node.factoryID = fid;
  const fl = s.getAttributeAsUInt32(e, 0x70); if (fl !== undefined) node.flags = BigInt(fl >>> 0);
  if (node instanceof OZChannel) {
    const val = s.getAttributeAsDouble(e, 0x72); if (val !== undefined) node.setInitialValue(val);
    const def = s.getAttributeAsDouble(e, 0x73); if (def !== undefined) node.setDefaultValue(def);
  }
  for (const c of e.children) {
    if (c.tagName === "parameter") {
      const child = buildChannelTree(s, c);
      if (node instanceof OZChannelFolder) node.push_back(child);
    } else if (c.tagName === "curve" && node instanceof OZChannel) {
      const cv = new OZCurve();
      for (const g of c.children) cv.parseElement(s, g);
      // curve attrs on the <curve> element itself:
      const t = s.getAttributeAsUInt32(c, 0x4); if (t !== undefined) cv.type = t;
      const re = s.getAttributeAsUInt32(c, 0x7); if (re !== undefined) cv.retimingExtrapolation = re;
      node.curve = cv;
    }
  }
  return node;
}

// --- Channel-ref path resolution ------------------------------------------------------------
// DECODED from OZChannelRef::getChannel(OZChannelBase*) (@0x4af40): a channel-ref is a path string
// whose components are separated by '/' (0x2f); a leading "./" (0x2e 0x2f) means relative to the
// supplied base, otherwise the walk starts at the root. Each path component is a NUMERIC id resolved
// via OZChannelFolder::getDescendant(id) (@0x65d68) — a by-id scan of the current folder's children.
// Returns the resolved channel, or undefined if any segment is missing.
export function resolveChannelRef(path: string, base: OZChannelBase, root: OZChannelBase): OZChannelBase | undefined {
  if (!path) return undefined;
  let p = path;
  let cur: OZChannelBase | undefined;
  if (p.startsWith("./")) { cur = base; p = p.slice(2); }   // relative to base
  else { cur = root; if (p.startsWith("/")) p = p.slice(1); } // absolute from root
  for (const seg of p.split("/")) {
    if (seg === "" || seg === ".") continue;
    if (!(cur instanceof OZChannelFolder)) return undefined;
    const id = Number(seg);
    cur = Number.isFinite(id) ? cur.getDescendant(id) : cur.children.find(c => c.name === seg);
    if (!cur) return undefined;
  }
  return cur;
}
