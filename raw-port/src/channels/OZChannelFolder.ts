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
   * getDescendant — faithful transcription of OZChannelFolder::getDescendant(uint) @ProChannel
   * 0x65d68: read the children vector at this+0x70 (begin=+0x0, end=+0x8); if the container is null
   * return null; linear-scan [begin,end), returning the FIRST child whose id (child+0x18) equals the
   * requested id, else null. Direct children only — no recursion, no flag test.
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

// --- OZChannelRef::getChannel(OZChannelBase*) — faithful transcription of ProChannel @0x4af40 ---
// The ref holds a path string (in the binary via SSO: bit0 of the ref's first byte selects inline@+1
// vs heap@+0x10; here `path` IS that string). Walk:
//   r14 = path pointer.
//   if path[0]=='.'(0x2e): cur = base; r14 += 1, and if path[1]=='/'(0x2f) r14 += 1 more (skip "./").
//   else: cur = null (the FIRST numeric segment is then matched against base's OWN id, not a child).
//   loop: parse one decimal integer segment id (r13 = r13*10 + (ch-'0')) until '\0' or '/';
//         r12 = (stop char == '/')  [1 => another segment follows]
//         if cur != null: require cur is an OZChannelFolder (flag 0x10 at +0x39 then dynamic_cast);
//                         cur = cur.getDescendant(id); if null -> return null.
//         else (cur == null): if base.id != id -> return null; else cur = base.
//         advance past the '/' (r14 += r12); if not at end, loop.
//   return cur.
// Purely NUMERIC ids resolved via getDescendant — no name matching.
export function getChannelByRef(path: string, base: OZChannelBase): OZChannelBase | undefined {
  if (base === undefined || base === null) return undefined; // testq %rsi,%rsi; je -> return null
  let i = 0;
  let cur: OZChannelBase | undefined;
  if (path.charCodeAt(0) === 0x2e /* '.' */) {
    cur = base;                                  // rax = rbx (base)
    i = 1;                                       // r14 += 1 (skip '.')
    if (path.charCodeAt(1) === 0x2f /* '/' */) i = 2; // cmove: also skip '/'
  } else {
    cur = undefined;                             // rax = 0
  }
  for (;;) {
    // parse a decimal integer segment id
    let id = 0;
    let ch = path.charCodeAt(i);
    while (!Number.isNaN(ch) && ch !== 0x2f /* '/' */) {
      id = id * 10 + (ch - 0x30);                // r13 = r13*10 + (ch-'0')
      i++;
      ch = path.charCodeAt(i);
    }
    const sepFollows = ch === 0x2f;              // r12b = (cl == '/')
    if (cur !== undefined) {
      if (!(cur instanceof OZChannelFolder)) return undefined; // flag 0x10 / dynamic_cast<Folder> fails
      cur = cur.getDescendant(id);               // getDescendant(id)
      if (cur === undefined) return undefined;
    } else {
      if (base.id !== id) return undefined;       // cmpl %r13d, base->0x18 ; jne -> null
      cur = base;
    }
    if (sepFollows) i++;                          // r14 += r12 (skip '/')
    if (Number.isNaN(path.charCodeAt(i))) break;  // *r14 == 0 (end) -> done
  }
  return cur;
}
