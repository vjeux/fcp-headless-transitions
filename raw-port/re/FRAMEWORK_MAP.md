# Framework map — where FCP's .motr parser actually lives (decoded 2026-07-27)

The parser spans THREE frameworks. All are universal (x86_64 + arm64); RE the x86_64 slice.

## ProCore.framework — serialization INFRA (the SAX engine)
- `PCMotionProjectXMLParser` (ObjC, NSXMLParser): the actual file reader —
  parser:didStartElement:namespaceURI:qualifiedName:attributes:, didEndElement, foundCharacters.
- `PCSerializerReadStream`: getAttributeAs{Int32,UInt32,Double,Float,String,Bool,UUID}(elem,id,&out),
  getAs{Int32,UInt32,Double,String}, pushScope(PCScope*), pushHandler, getElementInfo(name)->type/scope,
  isLessThanVersion, setTimeScale.
- `PCXMLStreamElement`: element-type tag at +0x8; attributes keyed by integer id; getAttributeAsCString(id)
  scans an inline (id->cstr) array + overflow tree; addAttribute(name,value) resolves NAME->id by strcmp
  against the active PCScope descriptor table.  (getAttributeAsCString @0x290f6, addAttribute @0x29080.)
- `PCScope`: the id<->name<->type registry (descriptor tables). In Ozone these live in __DATA __data.

## Ozone.framework — SCENE NODES (Motion's scene engine)
- OZSceneNode -> OZElement -> OZTransformNode -> {OZGroup, OZImageElement, OZFootageLayer, OZCamera,
  OZLight, OZRotoshape, OZStyle, ...}; plus OZScene, OZSceneSettings, OZDocument, OZFootage, behaviors
  (OZBehavior, OZLinkBehavior, OZRigBehavior, OZRig, OZRigWidget, OZWriteOnBehavior, ...), OZImageMask,
  OZFxFilter, OZFxGenerator, materials, and the file/template parsers (TemplateParser, FactoryParser,
  DocTemplateParser, OZXMLHelpers::*).
- The PCScope descriptor tables (attrId<->name per element) are Ozone static data -> re/scopes.json.

## ProChannel.framework — the CHANNEL / PARAMETER / CURVE tree (all animatable VALUES)
- `OZChannelObjectRootBase` (the <parameter> tree root that every OZSceneNode owns via
  OZChannelObjectRoot), `OZChannelFolder` (nested <parameter> groups), `OZChannel` / `OZChannelBase`
  (leaf value channels), `OZCurve` / `OZChannelCurve` (keyframe curves), and typed channels:
  OZChannelGradient(+Folder/Sample), OZChannelText, OZChannel2DOverRange, OZChannelAngleOverRange,
  OZChannelDoubleOverRange, OZChannelPercentOverRange, OZChannelScaleOverRange, OZChannelRotation3D,
  OZChannelColorNoAlpha, OZChannelBlindData, OZChannelVaryingFolder, OZChannelEnumWithList,
  OZChannelStringEnum. Driven by `ChannelParser`.
- THIS is where Position/Scale/Rotation/Anchor, colors, and every keyframed value are read. The
  OZTransformNode itself has almost no attributes — its transform is <parameter> channels here.

## Port implication
- Phase 1 (Ozone node classes): structure — children, factory refs, masks, behaviors, A/B.
- Phase 2 (ProChannel): the <parameter>/<curve> tree — the bulk of the data. Port
  OZChannelObjectRootBase + OZChannelFolder + OZChannel + OZCurve first; typed channels after.
- Infra (ProCore): already skeletoned (PCStreamElement/PCSerializerReadStream/scopes).
