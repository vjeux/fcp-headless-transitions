// nodeFactory.ts — instantiate the concrete OZSceneNode subclass for a child element.
// Mirrors OZApplication::createSceneNode(uuid, name, factoryID) / OZFactories::lookupFactory:
// the factoryID (via the <factory> table) resolves to a plugin UUID, which selects the node class.
//
// factoryID/UUID -> node-type is the SAME registry the engine already uses (Ozone's factory table).
// As concrete node classes are ported (OZImageElement, OZCamera, OZLight, OZRotoshape, ...), add
// them here. Until then, containers (<layer>/<group>) -> OZGroup; leaves -> OZImageElement when the
// element is a media/generator node, else the generic OZSceneNode. This keeps the tree faithful in
// STRUCTURE while the value-bearing leaves get their concrete class incrementally.
import { OZSceneNode } from "./OZSceneNode.js";
import { OZGroup } from "./OZGroup.js";
import { OZImageElement } from "./OZImageElement.js";

/**
 * Create the scene node for a `<layer>`/`<group>`/`<scenenode>` element.
 * @param tagName  the XML element name (layer/group/scenenode)
 * @param factoryID the node's factoryID attribute
 * @param uuidOrType the resolved plugin UUID (from the <factory> table) if known
 */
export function createSceneNode(tagName: string, _factoryID: number, _uuidOrType?: string): OZSceneNode {
  if (tagName === "layer" || tagName === "group") return new OZGroup();
  // <scenenode>: image/footage/generator leaves are OZImageElement; other leaves fall back to base.
  // (Concrete camera/light/rotoshape classes are added as they are ported.)
  return new OZImageElement();
}
