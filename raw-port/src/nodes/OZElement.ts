// OZElement — a renderable element (has a mask list + override/freezeKey). Extends OZTransformNode.
// Faithful port of Ozone OZElement (parseElement @ 0x9e730).
// Decode: parseElement calls OZTransformNode::parseElement (base, @0x9e758) then handles the
//   OZElementScope tags:
//     0x46  <mask>       attrs 0x71 factoryID, 0x6e name, 0x6f id -> OZFactories::lookupFactory ->
//                        creates a mask node; OZScene::registerNode (@0x9e8ed) + addAllDependencies.
//     0x190 <override>   (id 0x0 = "override")
//     0x191 <freezeKey>  (id 0x0 = "freezeKey")
import { PCSerializerReadStream } from "../infra/PCSerializerReadStream.js";
import { PCStreamElement } from "../infra/PCStreamElement.js";
import { OZTransformNode } from "./OZTransformNode.js";

export interface OZMaskRef { factoryID: number; name?: string; id?: number; }

export class OZElement extends OZTransformNode {
  static readonly TAG_MASK = 0x46;
  static readonly TAG_OVERRIDE = 0x190;
  static readonly TAG_FREEZEKEY = 0x191;

  masks: OZMaskRef[] = [];
  overrides: PCStreamElement[] = [];
  freezeKeys: PCStreamElement[] = [];

  override parseElement(s: PCSerializerReadStream, e: PCStreamElement): void {
    super.parseElement(s, e); // OZTransformNode::parseElement @0x9e758
    switch (e.type) {
      case OZElement.TAG_MASK: // 0x46
        this.masks.push({
          factoryID: s.getAttributeAsUInt32(e, 0x71) ?? 0, // 0x9e7d6
          name: s.getAttributeAsString(e, 0x6e),           // 0x9e7ea
          id: s.getAttributeAsUInt32(e, 0x6f),             // 0x9e7fe
        });
        break;
      case OZElement.TAG_OVERRIDE:  this.overrides.push(e); break;   // 0x190
      case OZElement.TAG_FREEZEKEY: this.freezeKeys.push(e); break;  // 0x191
      default: break;
    }
  }
}
