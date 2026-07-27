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
