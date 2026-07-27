// nodeFactory.ts — instantiate the concrete OZSceneNode subclass for a child element, and register
// the maker with OZSceneNode (so the base can recurse into child nodes without a circular import).
// Mirrors OZApplication::createSceneNode(uuid,name,factoryID) / OZFactories::lookupFactory: factoryID
// (via the <factory> table) -> plugin UUID -> node class. As concrete leaf classes are ported
// (camera/light/rotoshape/mask/emitter/...), extend the dispatch below.
import { OZSceneNode, registerSceneNodeMaker } from "./OZSceneNode.js";
import { OZGroup } from "./OZGroup.js";
import { OZImageElement } from "./OZImageElement.js";

export function createSceneNode(tagName: string, _factoryID: number, _uuidOrType?: string): OZSceneNode {
  // <layer>/<group> are always containers. A <scenenode> may be a leaf OR a container (Emitter,
  // Rectangle-with-Emitter, Project-with-Widget); it recurses via the base OZSceneNode child
  // handling regardless of class, so OZImageElement (which extends OZElement -> OZSceneNode) still
  // nests children faithfully. Container vs leaf is thus not a hard split here.
  if (tagName === "layer" || tagName === "group") return new OZGroup();
  return new OZImageElement();
}

// Wire the base's child-node recursion to this factory.
registerSceneNodeMaker(createSceneNode);
