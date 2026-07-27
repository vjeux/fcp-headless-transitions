// OZGroup — a container scene node (a <layer> or <group>). Extends OZElement.
// Faithful port of Ozone OZGroup::parseElement @0xeea80 (re/disasm/OZGroup.parseElement.s).
//   - base OZElement::parseElement (@0xeead1)
//   - OZGroupScope child tags: 0x3d <layer>, 0x3e <scenenode>, 0x3f <group> — each is a CHILD
//     scene node. For each child it reads pluginUUID(0x7 str) + factoryID(0x71 uint) ->
//     OZApplication::createSceneNode(uuid, name, factoryID) (or OZFactories::lookupFactory ->
//     createOldNode for legacy) to instantiate the concrete node class, reads the child's
//     attributes, then OZScene::registerNode (@0xeeda9) + addAllDependencies and appends as a child.
// The concrete child class is selected by factoryID->UUID (via the <factory> table) ->
// node-type (see nodeFactory.ts). Children are parsed recursively with their own scope.
import { PCSerializerReadStream } from "../infra/PCSerializerReadStream.js";
import { PCStreamElement } from "../infra/PCStreamElement.js";
import { OZElement } from "./OZElement.js";
import { OZSceneNode } from "./OZSceneNode.js";
import { createSceneNode } from "./nodeFactory.js";

export class OZGroup extends OZElement {
  static readonly TAG_LAYER = 0x3d;
  static readonly TAG_SCENENODE = 0x3e;
  static readonly TAG_GROUP = 0x3f;

  /** Child scene nodes (layers/groups/scenenodes), in document order. */
  childNodes: OZSceneNode[] = [];

  override parseElement(s: PCSerializerReadStream, e: PCStreamElement): void {
    switch (e.type) {
      case OZGroup.TAG_LAYER:      // 0x3d <layer>
      case OZGroup.TAG_SCENENODE:  // 0x3e <scenenode>
      case OZGroup.TAG_GROUP: {    // 0x3f <group>
        // Instantiate the concrete child node by factoryID (+ pluginUUID), then parse it.
        const factoryID = s.getAttributeAsUInt32(e, 0x71) ?? 0; // 0xeeb14
        const pluginUUID = s.getAttributeAsUUID(e, 0x7);         // (createSceneNode uuid arg)
        const child = createSceneNode(e.tagName, factoryID, s.factories.get(factoryID) ?? pluginUUID);
        // read common node attributes then recurse into the child's own children
        const id = s.getAttributeAsUInt32(e, 0x6f); if (id !== undefined) child.id = id;      // 0xeeb7c
        const nm = s.getAttributeAsString(e, 0x6e); if (nm !== undefined) child.name = nm;     // 0xeeb90
        for (const c of e.children) child.parseElement(s, c);
        this.childNodes.push(child); // OZScene::registerNode + addAllDependencies (@0xeeda9)
        break;
      }
      default:
        super.parseElement(s, e); // OZElement::parseElement (@0xeead1) — mask/override/base
        break;
    }
  }
}
