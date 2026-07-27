// OZScene — the top-level scene: layers + sceneSettings + factory table.
// Faithful port of Ozone OZScene::parseElement @0x57... (OZSceneScope):
//   child tags: 0x3c scene, 0x3d layer, 0x3f group, 0x3e scenenode, 0x42 footage, 0x4a sceneSettings,
//   markers/guides/editor-state (low priority). Layers/groups are OZGroup nodes; the <sceneSettings>
//   block carries canvas format. The <factory> table (factoryID->uuid) is parsed at the document
//   level (FactoryParser) into the read stream's `factories` map before the scene body.
import { PCSerializerReadStream } from "../infra/PCSerializerReadStream.js";
import { PCStreamElement } from "../infra/PCStreamElement.js";
import { OZSceneNode } from "./OZSceneNode.js";
import { OZGroup } from "./OZGroup.js";
import { OZImageElement } from "./OZImageElement.js";
import { createSceneNode } from "./nodeFactory.js";

export interface OZSceneSettings {
  width?: number; height?: number; duration?: number; frameRate?: number; pixelAspectRatio?: number;
}

export class OZScene {
  layers: OZSceneNode[] = [];
  settings: OZSceneSettings = {};
  factories = new Map<number, string>();

  parseElement(s: PCSerializerReadStream, e: PCStreamElement): void {
    switch (e.tagName) {
      case "layer": case "group": case "scenenode": {
        const factoryID = s.getAttributeAsUInt32(e, 0x71) ?? 0;
        const node = createSceneNode(e.tagName, factoryID, s.factories.get(factoryID));
        const id = s.getAttributeAsUInt32(e, 0x6f); if (id !== undefined) node.id = id;
        const nm = s.getAttributeAsString(e, 0x6e); if (nm !== undefined) node.name = nm;
        for (const c of e.children) node.parseElement(s, c);
        this.layers.push(node);
        break;
      }
      case "sceneSettings": {
        // OZSceneSettingsScope: width/height/duration/frameRate/pixelAspectRatio live as CHILD
        // elements (text content), not attributes. Read them by child tag name.
        for (const c of e.children) {
          const v = s.getAsDouble(c);
          if (c.tagName === "width") this.settings.width = v;
          else if (c.tagName === "height") this.settings.height = v;
          else if (c.tagName === "duration") this.settings.duration = v;
          else if (c.tagName === "frameRate") this.settings.frameRate = v;
          else if (c.tagName === "pixelAspectRatio") this.settings.pixelAspectRatio = v;
        }
        break;
      }
      default: break;
    }
  }
}
