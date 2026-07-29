// raw-port/src/render/HGRenderNode.ts
//
// Helium `HGRenderNode` — the base class Ozone's OZHGRenderNodeBase derives from and the
// argument type of the notify callback installed via HGRenderNode::SetNotifyFunc.
//
// This module surfaces ONLY the minimum surface required to compile OZHGRenderNodeBase:
//   - class HGRenderNode              (opaque base; no fields decoded yet)
//   - HGRenderNodeSetNotifyFunc(node, fn)  ; extern @HGRenderNode::SetNotifyFunc
//
// All bodies are throwing stubs so the frontier stays visible (see raw-port/army/frontier).
//
// FRAMEWORK: Helium.framework.
// Mangled cite: __ZN12HGRenderNode13SetNotifyFuncEPFvPS_E (invoked from OZHGRenderNodeBase ctor
// at Ozone 0x6352c3 as a symbol stub — the concrete address inside Helium is not resolved here).

/** Signature of HGRenderNode::SetNotifyFunc — takes a plain C function pointer. */
export type HGRenderNodeNotifyFn = (node: HGRenderNode | null) => void;

/**
 * HGRenderNode — Helium base class for asynchronous render work.
 *
 * The concrete field layout is not decoded here. Ozone's OZHGRenderNodeBase adds NO extra fields
 * (verified: the ctor at Ozone 0x6352a0 does NOT write anywhere beyond `(rbx)` = vtable ptr and
 * whatever HGRenderNode::SetNotifyFunc writes). Subclasses in this port that inherit MUST NOT
 * assume a specific layout beyond what HGRenderNode itself decodes.
 */
export class HGRenderNode {
  // No decoded fields yet. The C++ HGRenderNode constructor is __ZN12HGRenderNodeC2Ev @Helium
  // (undecoded here); our stub does nothing so subclasses inherit a valid empty base.
}

/**
 * HGRenderNode::SetNotifyFunc(void (*)(HGRenderNode*)) @Helium  (mangled __ZN12HGRenderNode13SetNotifyFuncEPFvPS_E)
 *   Called from OZHGRenderNodeBase ctor @Ozone 0x6352c3 (symbol stub → Helium implementation).
 *   Not yet decoded (extern @Helium symbol; cite via call-site @Ozone 0x6352c3); surfaced as a
 *   throwing stub so any caller path that DOES trigger a notify installation gets a clear frontier
 *   gap. This is intentional: the ctor path is exercised whenever a subclass instantiates, so
 *   leaving it as a throw guarantees callers see the gap.
 */
export function HGRenderNodeSetNotifyFunc(_node: HGRenderNode, _fn: HGRenderNodeNotifyFn): void {
  throw new Error(
    "HGRenderNode::SetNotifyFunc(void(*)(HGRenderNode*)) @Helium " +
    "(mangled __ZN12HGRenderNode13SetNotifyFuncEPFvPS_E) not yet transcribed"
  );
}
