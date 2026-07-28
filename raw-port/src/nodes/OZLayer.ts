// OZLayer — the concrete scene-node class for <layer> elements.
// Faithful port of Ozone OZLayer. OZLayer is a pure structural subclass of OZGroup:
// the disassembly shows every ctor is exactly (a) delegate to OZGroup's matching ctor, then
// (b) install four OZLayer-vtable pointers into the OZGroup base sub-object slots (0x00, 0x10,
// 0x28, 0x1978). It defines NO new fields and adds NO new virtual overrides — the OZLayer vtable
// (dumped via vtable.py Ozone OZLayer @0x832e88) is entirely inherited entries: slots resolve to
// OZGroup:: / OZSceneNode:: / OZFactoryBase:: implementations. The dtor and operator= are trivial
// thunks that jmp to the OZGroup versions.
//
// Symbols (Ozone framework):
//   OZLayer::OZLayer(OZFactory*, PCString const&, unsigned int)  @0x8c340  __ZN7OZLayerC1EP9OZFactoryRK8PCStringj
//     0x8c349 callq OZGroup::OZGroup(OZFactory*, PCString const&, unsigned int) @0x8c...(base)
//     0x8c34e-0x8c375 install vtable pointers:
//       *(this+0x00)    = &OZLayer::vtable+0x10   [primary  vptr, resolves to 0x832e98]
//       *(this+0x10)    = &OZLayer::vtable+0x968  [OZGroup base sub-object vptr, resolves to 0x8337f0]
//       *(this+0x28)    = &OZLayer::vtable+0xbc0  [OZFactoryBase sub-object vptr,  resolves to 0x833a48]
//       *(this+0x1978)  = &OZLayer::vtable+0xc18  [tail sub-object vptr,           resolves to 0x833aa0]
//   OZLayer::OZLayer(OZLayer const&, unsigned int) @0x8c3e0  __ZN7OZLayerC1ERKS_j
//     Same shape: calls OZGroup(OZGroup const&, unsigned int) then installs the SAME four vptrs.
//   OZLayer::~OZLayer() (D1) @0x8c440                          __ZN7OZLayerD1Ev
//     `jmp OZGroup::~OZGroup()` — a pure tail-call thunk to the base dtor.
//   OZLayer::~OZLayer() (D0, deleting) @0x8c450                __ZN7OZLayerD0Ev
//     calls OZGroup::~OZGroup() then jmp operator delete(void*) __stub __ZdlPv @0x6dfc36.
//   OZLayer::operator=(OZSceneNode const&) @0x8c430           __ZN7OZLayeraSERK11OZSceneNode
//     `jmp OZGroup::operator=(OZSceneNode const&)` — pure tail-call thunk.
//
// Semantic conclusion: at the port level OZLayer contributes nothing beyond `class OZLayer extends
// OZGroup {}`. The vtable-pointer installation is the C++ compiler's ABI machinery; TypeScript's
// single-vtable model is already correct because we do not override anything (assign/dtor/copy-
// ctor thunks would be `super.…` and any callsite that would have dispatched through the OZLayer
// vptrs dispatches through the same JS prototype chain). Registration under the <layer> element
// tag (0x3d, per OZSceneNode) is what selects OZLayer at parse time — same as OZGroup does today.
import { OZGroup } from "./OZGroup.js";

export class OZLayer extends OZGroup {}
