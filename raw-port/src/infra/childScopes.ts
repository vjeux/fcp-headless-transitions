// childScopes.ts — element-name -> child-scope mapping (which PCScope to push when descending into
// a child element). Mirrors PCSerializer getElementInfo's scope resolution.
//
// In FCP this is resolved via each element's registered scope + (for scenenode/group/behavior/
// filter/mask/parameter) the node's factoryID -> the factory's own scope. For the common structural
// elements the scope is fixed by element name; factory-typed nodes (scenenode/parameter) resolve
// their concrete scope from factoryID at parseBegin. We start with the fixed structural map and the
// generic channel scope for <parameter>; factory-specialized scopes are layered in as node classes
// are ported. Decoded from the scope symbol set (re/scope_symbols*.txt) + OZXMLRootScope children.
export const CHILD_SCOPE: Record<string, string> = {
  // top-level / document
  ozml: "OZMLScope",
  scene: "OZSceneScope",
  factory: "FactoryScope",
  sceneSettings: "OZSceneSettingsScope",
  primaryObjects: "OZScopePrimaryObjectsScope",
  primaryFactories: "OZScopePrimaryFactoriesScope",
  // scene graph containers
  layer: "OZGroupScope",       // a <layer> is a group container
  group: "OZGroupScope",
  scenenode: "OZSceneNodeReadScope", // generic; factory refines (image/footage/camera/light/...)
  footage: "OZFootageScope",
  footageLayer: "OZFootageLayerScope",
  audio: "OZAudioLayerScope",
  // per-node children
  behavior: "OZBehaviorScope",
  filter: "OZFxFilterScope",
  effect: "OZEffectScope",
  mask: "OZImageMaskScope",
  rotoshape: "OZRotoshapeScope",
  style: "OZStyleScope",
  material: "OZMaterialBaseScope",
  rig: "OZRigScope",
  // channel / parameter tree
  parameter: "OZChannelFolderScope",
  curve: "OZCurveScope",
  vertex: "OZChannelVertexFolderScope",
  // markers / guides / editor state (low priority, still mapped)
  timemarkerset: "OZTimeMarkerSetScope",
  timemarker: "OZTimeMarkerScope",
  guideset: "OZGuideSetScope",
  guide: "OZGuideScope",
};

/** The scope to push when descending into `<name>` from `parentScope` (falls back to parent). */
export function childScope(parentScope: string, name: string): string {
  return CHILD_SCOPE[name] ?? parentScope;
}

/** The root scope for a Motion .motr document. */
export const ROOT_SCOPE = "OZXMLRootScope";
