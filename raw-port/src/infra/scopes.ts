// AUTO-GENERATED from re/scopes.json by tools/gen_scopes_ts.py — DO NOT EDIT BY HAND.
// Per-scope attribute-id -> XML-attribute-name tables, decoded from Ozone's PCScope
// descriptor arrays (__DATA __data). Each scenenode class's parseElement reads attributes
// by integer id within its own scope; this maps those ids back to the real XML names.

export type ScopeTable = Record<number, string>;
export const SCOPES: Record<string, ScopeTable> = {
  "FactoryScope": { 0x0: "manufacturer" },
  "OZ3DEngineSceneFileScope": { 0x0: "relativeBookmark" },
  "OZAudioLayerScope": { 0x0: "audioTrack", 0x6e: "name", 0x6f: "id", 0x71: "factoryID" },
  "OZBehaviorScope": { 0x0: "behavior", 0x6e: "name", 0x71: "factoryID" },
  "OZCanvasStateScope": { 0x0: "activeView" },
  "OZChannelBehaviorScope": { 0x0: "channelBehavior", 0x1: "affectingFactory", 0x2: "affectingChannel", 0x3: "sliderRange", 0x4: "excludeCompoundFlags" },
  "OZChannelEnumWithListScope": { 0x0: "entry", 0x1: "name", 0x2: "tag" },
  "OZChannelFontBaseScope": { 0x0: "font", 0x6e: "name", 0x6f: "id", 0x70: "flags", 0x71: "factoryID" },
  "OZChannelObjectRootScope": { 0x0: "GLRenderer::useROIParameter" },
  "OZChannelStringEnumScope": { 0x0: "savedName" },
  "OZDocumentScope": { 0x0: "FCPOriginated", 0x9: "subview", 0x6f: "id", 0x74: "version", 0x75: "uuid" },
  "OZEffectScope": { 0x0: "filter", 0x6e: "name", 0x6f: "id", 0x71: "factoryID", 0x76: "pluginName" },
  "OZElementScope": { 0x0: "OZFootage::kFieldOrderOverride", 0x6e: "name", 0x71: "factoryID" },
  "OZExportSettingsScope": { 0x0: "depthOfFieldMode" },
  "OZFootageLayerScope": { 0x0: "scenenode", 0x6e: "name", 0x6f: "id", 0x71: "factoryID" },
  "OZFootageScope": { 0x0: "RAWProcessorFourCC" },
  "OZFxFilterScope": { 0x0: "filter", 0x7: "pluginUUID", 0x8: "pluginVersion", 0x9: "pluginDynamicParams", 0x6e: "name", 0x6f: "id", 0x71: "factoryID", 0x76: "pluginName" },
  "OZGroupScope": { 0x0: "layer", 0x7: "pluginUUID", 0x8: "pluginVersion", 0x9: "pluginDynamicParams", 0x6e: "name", 0x6f: "id", 0x71: "factoryID", 0x74: "version", 0x76: "pluginName" },
  "OZGuideScope": { 0x0: "vertical" },
  "OZGuideSetScope": { 0x0: "guide" },
  "OZImageElementScope": { 0x0: "type" },
  "OZImageMaskScope": { 0x0: "analysisFrameDuration", 0x1: "offset", 0x2: "duration" },
  "OZInspectorScope": { 0x0: "collapseState", 0x1: "id" },
  "OZLayeredMaterialScope": { 0x0: "styleJitterRandomSeed" },
  "OZLayeredMaterialSequenceScope": { 0x0: "parameter", 0x6e: "name", 0x6f: "id", 0x71: "factoryID" },
  "OZLinkBehaviorScope": { 0x0: "dynamicChannelIDSet", 0x406: "offsetChannelID", 0x407: "rangeMinChannelID" },
  "OZMaterialBaseScope": { 0x0: "isNamed", 0x6e: "name", 0x6f: "id", 0x71: "factoryID" },
  "OZMaterialLayerSequenceScope": { 0x0: "parameter", 0x6e: "name", 0x6f: "id", 0x70: "flags", 0x71: "factoryID" },
  "OZProjectNodeScope": { 0x0: "scenenode", 0x6e: "name", 0x6f: "id", 0x71: "factoryID" },
  "OZProjectPanelStateScope": { 0x0: "mediaDileModifiedColumn" },
  "OZPublishSettingsScope": { 0x0: "target", 0x1: "channel", 0x2: "object", 0x3: "name" },
  "OZRigScope": { 0x0: "scenenode", 0x6e: "name", 0x71: "factoryID" },
  "OZRigWidgetScope": { 0x0: "affecting" },
  "OZRotoshapeScope": { 0x0: "scenenode", 0x6e: "name", 0x71: "factoryID", 0x1f6: "flags", 0x1f8: "index" },
  "OZSceneNodeReadScope": { 0x0: "linkedobjects", 0x7: "pluginUUID", 0x8: "pluginVersion", 0x9: "pluginDynamicParams", 0x6e: "name", 0x6f: "id", 0x71: "factoryID", 0x74: "version", 0x76: "pluginName" },
  "OZSceneNodeWriteScope": { 0x0: "linkedobjects", 0x7: "pluginUUID", 0x8: "pluginVersion", 0x9: "pluginDynamicParams", 0x6e: "name", 0x6f: "id", 0x71: "factoryID", 0x74: "version", 0x76: "pluginName" },
  "OZSceneScope": { 0x0: "360ProjectMode", 0x1: "selected", 0x2: "duration", 0x6e: "name", 0x6f: "id", 0x71: "factoryID" },
  "OZSceneSettingsScope": { 0x0: "antialiasing", 0x1: "red", 0x2: "green", 0x3: "blue", 0x4: "alpha" },
  "OZScopePrimaryFactoriesScope": { 0x0: "uuid" },
  "OZScopePrimaryObjectsScope": { 0x0: "id" },
  "OZShapeBehaviorScope": { 0x0: "affectedVertex" },
  "OZStyleScope": { 0x0: "style", 0x6e: "name", 0x71: "factoryID" },
  "OZTimeMarkerScope": { 0x0: "type" },
  "OZTimeMarkerSetScope": { 0x0: "timemarker" },
  "OZTimelineStateScope": { 0x0: "displayRange", 0x1: "in" },
  "OZTransformNodeScope": { 0x0: "ignoreBehaviorsBeforeID" },
  "OZTransitiveBehaviorScope": { 0x0: "affectedNode" },
  "OZViewerStateScope": { 0x0: "mirrorHMD", 0x9: "subview", 0x20: "type", 0x22: "x", 0x23: "y", 0x24: "z", 0x26: "s", 0x27: "vx", 0x28: "vy", 0x29: "vz", 0x2b: "x", 0x2c: "y", 0x2e: "camera", 0x2f: "zoom", 0x30: "mode", 0x31: "panX", 0x32: "panY", 0x33: "centered" },
  "OZXMLRootScope": { 0x0: "*", 0x7: "pluginUUID", 0x8: "pluginVersion", 0x9: "pluginDynamicParams", 0x6e: "name", 0x6f: "id", 0x71: "factoryID", 0x74: "version", 0x75: "uuid", 0x76: "pluginName" },
  "SceneScope": { 0x0: "sceneSettings" },
  "TemplateScope": { 0x0: "flags" },
};

/** Look up an attribute name by (scope, id). */
export function attrName(scope: string, id: number): string | undefined {
  return SCOPES[scope]?.[id];
}
