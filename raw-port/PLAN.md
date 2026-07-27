# raw-port/ — Faithful TypeScript Port of FCP's Ozone Scene Parser

## Goal
Reverse-engineer FCP's **actual** `.motr`/`.ozml` parsing code from `Ozone.framework`
and port it 1:1 to TypeScript — **one file per C++ class**. This replaces the current
`engine/src/parser/` (a 5,374-line inference-based reimplementation) with a faithful,
decode-exact port that mirrors FCP's real class hierarchy and per-element dispatch.

Rationale: the minimize->fix loop has hit diminishing returns (repros collapse to
canvas/empty-media artifacts, not the real per-transition bugs). A faithful port of the
parser removes an entire class of "we guessed the parse semantics wrong" bugs at the root.

## Source of truth
- **Binary:** `/Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone`
  - Universal (x86_64 + arm64). **Use the x86_64 slice** — `otool -tV -arch x86_64` gives the
    cleanest disassembly with demangled symbol-stub comments (PCString, PCSerializerReadStream,
    dynamic_cast, typeinfo names annotated inline).
  - C++ symbols are fully mangled+demanglable (`nm -C`, `c++filt`) — class + method names
    recoverable. Huge RE advantage.
- The `.motr` files under `.../MotionEffect.fxp/.../Transitions.localized/**/*.motr` are the inputs.

## Architecture discovered (2026-07-27)
FCP parses `.motr` with a SAX-style visitor over `PCSerializer`:
- `PCSerializerReadStream` — read cursor. API (decoded from symbols):
  - `getAttributeAsInt32/UInt32/Double/Float/String/Bool/UUID(elem, attrId, &out)`
  - `getAsInt/UInt/Double/Float/String(&out)` (element text/value)
  - `pushScope(PCScope*)` / `pushHandler(...)` — register child-element handlers
  - `isLessThanVersion(...)` / `setTimeScale(...)`
- `PCStreamElement` — one XML element. Field at `+0x8` is an **element-type enum (int32)**;
  attributes addressed by small integer IDs (0x6e, 0x6f, 0x71, 0x74, 0x76 … decode per element).
- `PCString` — the string type.

Every scene class implements the triple:
- `parseBegin(stream)` — element open; pushes the class read-scope + calls BASE parseBegin.
- `parseElement(stream, elem)` — per child element; switches on `*(int*)(elem+0x8)`, reads
  attributes, populates fields. Calls BASE parseElement (inheritance), then own elements.
- `parseEnd(stream)` — finalize (resolve refs, defaults).

Inheritance chain (confirmed via base-call trace):
```
OZChannelObjectRoot
   -> OZSceneNode              (id, name, enabled, timing, factoryID, pluginUUID)
        -> OZElement           (blend, opacity, transform container)
             -> OZTransformNode (Position/Scale/Rotation/Anchor channels)
                  -> OZGroup
                  -> OZImageElement  (drop-zone / media / generator)
                  -> OZFootageLayer
                  -> OZLight / OZCamera / OZRotoshape / OZStyle ...
```

## The full parse surface
- **150 distinct classes** with defined `parse{Begin,Element,End}` (327 methods total).
- Reference tables (generated, checked in):
  - `re/parse_defined.txt`  — every defined parse method: `<addr> <demangled signature>`
  - `re/parse_symbols.txt`  — broader grep incl. checkVersion/readFile/didReadSceneFile
  - `re/infra_symbols.txt`  — PCSerializerReadStream / PCStreamElement / PCString / PCScope API
  - `re/parse_classes.json` — {class:{method:addr}} machine index

## Directory layout
```
raw-port/
  PLAN.md                    <- this file
  re/                        <- RE reference data (symbol/addr tables, disasm dumps)
    parse_defined.txt  parse_symbols.txt  infra_symbols.txt  parse_classes.json
    disasm/<Class>.<method>.s  <- saved otool disassembly per function as RE'd
  src/
    infra/
      PCString.ts            <- string helpers (mostly JS string; port only quirky methods)
      PCStreamElement.ts     <- XML element (element-type enum + attribute-id access)
      PCSerializerReadStream.ts <- read cursor over parsed DOM; getAttributeAs*/pushScope
      elementTypes.ts        <- element-type enum constants (decoded from switch tables)
      attributeIds.ts        <- attribute-id constants per element (decoded)
    scene/  OZChannelObjectRoot.ts OZSceneNode.ts OZElement.ts OZTransformNode.ts
            OZGroup.ts OZImageElement.ts OZFootageLayer.ts OZFootage.ts OZScene.ts ...
    channels/ OZChannel.ts OZCurve.ts OZChannelGradient.ts ...
    behaviors/ OZBehavior.ts OZLinkBehavior.ts OZRigBehavior.ts OZWriteOnBehavior.ts ...
    readScene.ts             <- entry: XML string -> parsed OZScene object tree
  test/ parity.test.ts       <- parse every shipped .motr with raw-port + engine; diff trees
  tools/ disasm.sh <Class> [method]  <- dump+demangle a class's parse methods to re/disasm/
```

## Method: how to RE one class (repeatable recipe)
For class `C` at address `A` (from `re/parse_defined.txt`):
1. `tools/disasm.sh C parseElement` -> saves `re/disasm/C.parseElement.s`.
2. Read the switch on `*(int32*)(elem+0x8)` (element-type enum). Each `cmpl $0xNN,%eax` is a case.
   Map 0xNN -> element name via the read-scope table + the raw `.motr` element/attribute names.
3. Per case: note which `getAttributeAsX(elem, attrId, &field)` fire + which struct offset
   `+0xNNN(%rbx)` they write -> that's a TS field.
4. Port to TS: `parseElement(stream, elem)` switching on `elem.type`, reading the same
   attributes, writing the same fields. Call `super.parseElement` first (inheritance).
5. Save disasm + cite the address range in a top-of-file comment (DECODE-BEFORE-IMPLEMENT).

## Ordered build plan (phases)
Phase 0 — Infra: elementTypes.ts + attributeIds.ts (decode the enum + attr-id constants —
  highest leverage), PCStreamElement.ts, PCSerializerReadStream.ts, PCString.ts.
Phase 1 — Core node chain (~80% of every .motr): OZChannelObjectRoot -> OZSceneNode ->
  OZElement -> OZTransformNode -> OZGroup -> OZImageElement -> OZFootageLayer -> OZFootage ->
  OZScene -> OZSceneSettings -> readScene entry.
Phase 2 — Channels & curves: OZChannel(Base), OZCurve, OZChannelFolder, OZChannelGradient,
  OZChannelEnumWithList, OZChannelStringEnum, OZChannelBlindData, OZChanSceneNodeRef.
Phase 3 — Behaviors: OZBehavior, OZTransitiveBehavior, OZSingleChannelBehavior, OZLinkBehavior,
  OZRig, OZRigBehavior, OZRigWidget(AspectRatio), OZShapeBehavior, OZMotionPathBehavior,
  OZWriteOnBehavior, OZReflexiveBehavior.
Phase 4 — Shapes/masks/styles/generators: OZRotoshape, OZImageMask, OZStyle, OZImageGenerator,
  OZFxGenerator, OZCloneGenerator, OZImageEnvironment, OZFxFilter, OZEffect.
Phase 5 — Materials/3D/lights: OZMaterialBase + OZMaterial*Layer*, OZLayeredMaterial*, OZLight,
  OZLightingFolder, OZCamera, OZ3DExtrusionProperties, OZ3DEngineScene*.
Phase 6 — Doc/template/factory envelope: OZDocument, OZProjectNode, TemplateParser,
  DocTemplateParser, FactoryParser, SceneInfoParser, OZXMLHelpers::*, XMLtoFactory*,
  XMLGetProjectInfo. (Editor-only state classes are LOW priority / stub.)

## Verification (every phase)
- Parse all 65 shipped `.motr` with raw-port; assert no throw + snapshot the object tree.
- Cross-check raw-port's tree vs current engine/src/parser field-by-field; on divergence the
  disassembly is the tiebreaker (raw-port wins — it's the real code).
- When raw-port is complete + trusted, wire the evaluator/compositor to consume the raw-port
  tree and re-score the 65 transitions. Parse-semantic bugs should vanish.

## Rules (inherited)
- DECODE-BEFORE-IMPLEMENT: every ported function cites the Ozone address range it came from.
- No feature flags. One faithful behavior, always on.
- Commit + push after each class (or small batch) lands with its disasm reference.

---

## FRAMEWORK MAP (decoded 2026-07-27) — parsing spans THREE frameworks
The `.motr` parser is NOT in one binary. Confirmed by symbol-definition search:
- **ProCore.framework** — the SAX serialization infra: `PCSerializerReadStream`, `PCXMLStreamElement`
  (attribute id<->name via PCScope, getAttributeAs*), `PCScope`, `PCMotionProjectXMLParser`
  (the NSXMLParser driver: didStartElement/didEndElement/foundCharacters). PORTED in src/infra/.
- **ProChannel.framework** — the CHANNEL/PARAMETER tree (all animatable VALUES): `ChannelParser`,
  `OZChannelObjectRootBase`, `OZChannel`, `OZChannelBase`, `OZChannelFolder`, `OZCurve`,
  `OZChannelCurve`, and typed channels (`OZChannel2DOverRange`, `OZChannelAngleOverRange`,
  `OZChannelScaleOverRange`, `OZChannelPercentOverRange`, `OZChannelDoubleOverRange`,
  `OZChannelGradient(Folder/Sample)`, `OZChannelText`, `OZChannelBlindData`, `OZChannelVaryingFolder`,
  `OZChannelColorNoAlpha`, `OZChannelRotation3D`). Full list: re/prochannel_parse.txt.
  THIS IS PHASE 2 and holds the BULK of the data (every <parameter id=N .. value=..> + <curve>
  keyframe lives here). The transform (Position/Scale/Rotation/Anchor) of every node is here, NOT
  on OZTransformNode.
- **Ozone.framework** — the SCENE-NODE classes (structure): OZSceneNode/OZElement/OZTransformNode/
  OZGroup/OZImageElement/OZFootage(Layer)/behaviors/OZScene/OZSceneSettings/OZDocument + the PCScope
  static tables. PORTED in src/nodes/, src/behaviors/.

Disasm the channel classes from ProChannel:
  otool -tV -arch x86_64 ".../ProChannel.framework/Versions/A/ProChannel"
(the disasm.sh tool targets Ozone by default; add a $BIN arg for ProChannel/ProCore — TODO).

### Node vs Channel split (KEY architectural fact)
Ozone node `parseElement` methods handle STRUCTURE (child scenenodes, factory refs, masks,
behaviors, flags). All VALUES flow through OZChannelObjectRootBase::parseElement (ProChannel),
which OZSceneNode::parseElement calls first (@0x91b40). So porting a node = (a) its structural
tags from Ozone + (b) delegating <parameter> children to the ProChannel channel-tree port.

---

## PARITY STATUS (2026-07-27)
Node-ID-set diff of raw-port vs engine/src/parser across all 65 transitions:
- **onlyEng = 0 for ALL 65** — raw-port captures every scene node the engine parser produces.
- raw-port is a SUPERSET: the extra `onlyRaw` nodes are the helper/driver nodes the engine's
  renderer-oriented parser deliberately skips (Project widget, Camera, Rig behavior host, Widget,
  and the fully-recursed Emitter/Cell particle subtree). Faithful to FCP — these ARE real nodes.
- All 65 parse without error; full <parameter> channel tree + behaviors + factory table captured.

Remaining port work (values/semantics, not structure):
1. Concrete leaf classes where the engine specializes: OZCamera, OZLight, OZRotoshape, OZImageMask,
   OZFxGenerator, replicator/emitter (OZChannel typed subclasses for gradient/text/overrange).
2. parseEnd passes (OZScene::parseEnd ref/dependency resolution; OZSceneNode::parseEnd defaults).
3. Behavior/rig channel semantics (OZLinkBehavior/OZRigBehavior read their channelBehavior refs).
4. Then: transform-matrix + A/B + media resolution derived FROM the channel tree (the render-facing
   projection the engine currently guesses) — computed faithfully from the decoded channels.
5. Wire the evaluator/compositor to consume the raw-port tree; re-score the 65.
