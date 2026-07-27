# raw-port/re — Reverse-engineering reference data for the Ozone parser port

- `parse_defined.txt`  — every DEFINED parse method in Ozone (x86_64): `<addr> <demangled sig>` (327 methods, 150 classes)
- `parse_symbols.txt`  — broader grep incl. checkVersion/readFile/didReadSceneFile
- `infra_symbols.txt`  — PCSerializerReadStream / PCStreamElement / PCString / PCScope API
- `parse_classes.json` — {class:{method:addr}} machine index
- `disasm/<Class>.<method>.s` — saved otool -tV disassembly per function, produced by `../tools/disasm.sh`

## Decoded so far (2026-07-27)
- Parse model: SAX visitor. Each element -> current handler's `parseElement(stream, elem)`.
- `parseElement` switches on the element-type enum at `*(int32*)(elem+0x8)` (e.g. OZSceneNode
  cases 0x44,0x45,0xc7,0xc8,0xc9). Attributes read via `getAttributeAsX(elem, <attrId:int>, &out)`.
- Inheritance chain (base-call trace): OZChannelObjectRoot <- OZSceneNode <- OZElement <-
  OZTransformNode <- {OZGroup, OZImageElement, OZFootageLayer, ...}. Each parseElement calls its
  BASE parseElement (OZSceneNode also dispatches OZFxPlugSharedBase::parseDynamicParamElement for
  OZFxGenerator subclasses, then OZChannelObjectRoot::parseElement for channels).

## Tooling
- `../tools/disasm.sh <Class> [method]` — fast (uses /tmp caches: ozone_symmap.tsv + ozone_tV.txt).
