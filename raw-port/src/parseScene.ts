import "./nodes/nodeFactory.js"; // registers the scene-node maker (side-effect import)
// parseScene.ts — top-level entry: .motr XML -> OZScene (faithful parser port).
// Walks the loaded element tree (readScene) driving the ported parseElement dispatch.
// Builds the <factory> table (factoryID->uuid) first, then the scene body.
import { readMotrToElementTree } from "./infra/readScene.js";
import { PCSerializerReadStream } from "./infra/PCSerializerReadStream.js";
import { PCStreamElement } from "./infra/PCStreamElement.js";
import { OZScene } from "./nodes/OZScene.js";

export function parseScene(xml: string): OZScene {
  const root = readMotrToElementTree(xml);           // <ozml>
  const s = new PCSerializerReadStream();
  const scene = new OZScene();

  // 1) <factory id=.. uuid=..> table (top-level, before/around the scene).
  const collectFactories = (e: PCStreamElement): void => {
    if (e.tagName === "factory") {
      const fid = e.attrByName("id"); const uuid = e.attrByName("uuid");
      if (fid && uuid) s.factories.set(parseInt(fid, 10), uuid);
    }
    for (const c of e.children) collectFactories(c);
  };
  collectFactories(root);
  scene.factories = s.factories;

  // 2) document version (for isLessThanVersion gates)
  const ver = root.attrByName("version"); if (ver) s.versionMajor = parseInt(ver, 10) || 0;

  // 3) scene body: the top-level layers/groups/scenenodes/sceneSettings live under <ozml> (and/or
  //    an inner <scene>). Drive OZScene::parseElement for each.
  const driveSceneChildren = (e: PCStreamElement): void => {
    for (const c of e.children) {
      if (c.tagName === "scene") { driveSceneChildren(c); continue; }
      scene.parseElement(s, c);
    }
  };
  driveSceneChildren(root);
  return scene;
}
