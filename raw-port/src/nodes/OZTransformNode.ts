// OZTransformNode — a scene node with a 3D transform. Extends OZSceneNode.
// Faithful port of Ozone OZTransformNode (parseElement @ 0x1ce930).
// Decode: parseElement calls OZSceneNode::parseElement (base, @0x1ce941) then handles only
//   tags 0x12c / 0x12d (OZTransformNodeScope id 0x0 = "ignoreBehaviorsBeforeID" + a sibling).
// CRUCIAL: the transform VALUES (Position/Scale/Rotation/Anchor) are NOT attributes here — they
// live in the CHANNEL tree as <parameter> elements parsed by OZChannelObjectRoot (Phase 2). This
// class only carries the transform-specific structural fields.
import { PCSerializerReadStream } from "../infra/PCSerializerReadStream.js";
import { PCStreamElement } from "../infra/PCStreamElement.js";
import { OZSceneNode } from "./OZSceneNode.js";

export class OZTransformNode extends OZSceneNode {
  static readonly TAG_IGNORE_BEHAVIORS_BEFORE = 0x12c;
  static readonly TAG_TRANSFORM_MISC = 0x12d;

  ignoreBehaviorsBeforeID = 0;

  override parseElement(s: PCSerializerReadStream, e: PCStreamElement): void {
    super.parseElement(s, e); // OZSceneNode::parseElement @0x1ce941
    switch (e.type) {
      case OZTransformNode.TAG_IGNORE_BEHAVIORS_BEFORE: // 0x12c
        this.ignoreBehaviorsBeforeID = s.getAsUInt32(e);
        break;
      case OZTransformNode.TAG_TRANSFORM_MISC: // 0x12d
        break;
      default:
        break;
    }
  }
}
