// OZGroup — a container scene node (<layer>/<group>). Extends OZElement.
// Faithful port of Ozone OZGroup::parseElement @0xeea80. OZGroup's distinguishing role is being a
// pure CONTAINER; child-scene-node recursion (0x3d layer / 0x3e scenenode / 0x3f group -> createSceneNode
// -> recurse -> registerNode, @0xeeb3b/@0xeeda9) is handled UNIVERSALLY in the OZSceneNode base
// (parseSceneNode recurses on every node's directChildren 'scenenode'), so OZGroup adds no extra
// element handling beyond the base + OZElement (mask/override). It exists as the concrete class for
// <layer>/<group> elements (vs OZImageElement for media <scenenode>s).
import { OZElement } from "./OZElement.js";

export class OZGroup extends OZElement {}
