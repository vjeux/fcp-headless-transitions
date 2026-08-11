// OZSceneNode — base class of every Motion scene node.
// Faithful port of Ozone's OZSceneNode (Ozone.framework, x86_64).
// Decode citations:
//   parseBegin    @ 0x918ed  (pushScope OZSceneNodeReadScope; base OZChannelObjectRoot::parseBegin;
//                             OZFxGenerator subtypes also pushDynamicParamScope)
//   parseElement  @ 0x91aa0  (see re/disasm/OZSceneNode.parseElement.s)
//   parseEnd      @ 0x919c... (base OZChannelObjectRoot::parseEnd; finalize hooks)
//
// OZSceneNodeReadScope (re/scopes.json) child-element tags + attribute ids:
//   tag 0x44 "filter"        attrs: 0x71 factoryID, 0x6e name, 0x6f id, 0x7 pluginUUID,
//                                   0x76 pluginName, 0x74 version(double), 0x8 pluginVersion(int),
//                                   0x9 pluginDynamicParams(bool)  -> OZFactories::lookupFactory ->
//                                   creates an OZFxFilter/OZEffect, attached to this node.
//   tag 0x45 "behavior"      attrs: 0x71 factoryID, 0x6e name, 0x6f id (+ same plugin attrs) ->
//                                   creates an OZBehavior, insertBehaviorBefore(...).
//   tag 0xc8 "flags"         -> node flags (getAsUInt32 on element text).
//   tag 0xc9 "linkedobjects" -> linked-objects list.
// parseElement first calls OZChannelObjectRoot::parseElement (channels/<parameter> tree), THEN
// switches on the element tag for the node-level children above. For OZFxGenerator subclasses it
// ALSO calls OZFxPlugSharedBase::parseDynamicParamElement first (dynamic plugin params).

import { PCSerializerReadStream } from "../infra/PCSerializerReadStream.js";
import { PCStreamElement } from "../infra/PCStreamElement.js";
import { OZChannelBase } from "../channels/OZChannelBase.js";
import { buildChannelTree } from "../channels/OZChannelFolder.js";
import type { OZRenderState } from "../channels/OZRenderState.js";
import type { LiCamera } from "../channels/LiCamera.js";

// Child-node factory hook. Registered by nodeFactory.ts to avoid a circular import
// (nodeFactory imports the OZGroup/OZImageElement subclasses which extend this base).
type SceneNodeMaker = (tagName: string, factoryID: number, uuidOrType?: string) => OZSceneNode;
let _makeSceneNode: SceneNodeMaker | undefined;
export function registerSceneNodeMaker(fn: SceneNodeMaker): void { _makeSceneNode = fn; }
function makeSceneNode(tagName: string, factoryID: number, uuidOrType?: string): OZSceneNode {
  if (_makeSceneNode) return _makeSceneNode(tagName, factoryID, uuidOrType);
  return new OZSceneNode(); // fallback before registration
}

/** A filter/effect attached to a scene node (created via OZFactories::lookupFactory). */
export interface OZAttachedEffect {
  factoryID: number;
  name?: string;
  id?: number;
  pluginUUID?: string;
  pluginName?: string;
  version?: number;
  pluginVersion?: number;
  pluginDynamicParams?: boolean;
}

/** A behavior attached to a scene node. */
export interface OZAttachedBehavior {
  factoryID: number;
  name?: string;
  id?: number;
  pluginUUID?: string;
  pluginName?: string;
}

/** PCVector2<float> - two packed float32, x @+0x00 and y @+0x04 (8 bytes, passed by const&). */
interface PCVector2Float {
  x: number; // +0x00
  y: number; // +0x04
}

export class OZSceneNode {
  // Element-type tags handled by OZSceneNodeReadScope.
  static readonly TAG_FILTER = 0x44;
  static readonly TAG_BEHAVIOR = 0x45;
  static readonly TAG_FLAGS = 0xc8;
  static readonly TAG_LINKEDOBJECTS = 0xc9;

  id = 0;
  name = "";
  flags = 0;
  /** <enabled>0</enabled> marks a hidden driver node (default: enabled/true). */
  enabled = true;
  filters: OZAttachedEffect[] = [];
  behaviors: OZAttachedBehavior[] = [];
  linkedObjects: number[] = [];
  /** The node's <parameter> channel tree roots (Properties/Object/...) — every VALUE lives here.
   *  Built via OZChannelObjectRoot::parseElement (which OZSceneNode::parseElement calls @0x91b40). */
  channels: OZChannelBase[] = [];
  /** Child scene nodes. In FCP ANY scenenode can nest child <scenenode>/<layer>/<group> (an Emitter
   *  under an Image, a Widget under a Project, etc). parseSceneNode recurses on directChildren
   *  'scenenode' for every node — so child-node handling lives in the base, not only OZGroup. */
  childNodes: OZSceneNode[] = [];

  /** Find a top-level channel folder by id (e.g. Properties=1, Object=2). */
  channel(id: number): OZChannelBase | undefined { return this.channels.find(c => c.id === id); }

  /** parseElement @ 0x91aa0. Reads a plugin descriptor (factoryID/name/id/pluginUUID/...). */
  protected readPluginDescriptor(s: PCSerializerReadStream, e: PCStreamElement): OZAttachedEffect {
    return {
      factoryID: s.getAttributeAsUInt32(e, 0x71) ?? 0, // 0x91b6c / 0x91bf4
      name: s.getAttributeAsString(e, 0x6e),           // 0x91b80 / 0x91c07
      id: s.getAttributeAsUInt32(e, 0x6f),             // 0x91b94 / 0x91c1c
      pluginUUID: s.getAttributeAsUUID(e, 0x7),        // 0x91c30
      pluginName: s.getAttributeAsString(e, 0x76),     // 0x91c44
      version: s.getAttributeAsDouble(e, 0x74),        // 0x91c69
      pluginVersion: s.getAttributeAsInt32(e, 0x8),    // 0x91c7d
      pluginDynamicParams: s.getAttributeAsBool(e, 0x9), // 0x91c91
    };
  }

  parseElement(s: PCSerializerReadStream, e: PCStreamElement): void {
    // FCP calls OZChannelObjectRoot::parseElement (the <parameter> channel tree) FIRST (@0x91b40):
    // a top-level <parameter> child is a channel-folder root (Properties=1, Object=2, ...). Build it.
    if (e.tagName === "parameter") {
      this.channels.push(buildChannelTree(s, e));
      return;
    }
    // Child scene nodes — ANY node may nest <scenenode>/<layer>/<group> (parseSceneNode recurses on
    // directChildren 'scenenode' for every node). Instantiate the concrete class and recurse.
    if (e.tagName === "scenenode" || e.tagName === "layer" || e.tagName === "group") {
      const factoryID = s.getAttributeAsUInt32(e, 0x71) ?? 0;
      const pluginUUID = s.getAttributeAsUUID(e, 0x7);
      const child = makeSceneNode(e.tagName, factoryID, s.factories.get(factoryID) ?? pluginUUID);
      const cid = s.getAttributeAsUInt32(e, 0x6f); if (cid !== undefined) child.id = cid;
      const cnm = s.getAttributeAsString(e, 0x6e); if (cnm !== undefined) child.name = cnm;
      const en = e.children.find(c => c.tagName === "enabled");
      if (en) child.enabled = s.getAsInt32(en) !== 0;
      for (const c of e.children) child.parseElement(s, c);
      this.childNodes.push(child);
      return;
    }
    if (e.tagName === "enabled") { this.enabled = s.getAsInt32(e) !== 0; return; }
    switch (e.type) {
      case OZSceneNode.TAG_FILTER: {          // 0x44 <filter>
        this.filters.push(this.readPluginDescriptor(s, e));
        break;
      }
      case OZSceneNode.TAG_BEHAVIOR: {        // 0x45 <behavior>
        const d = this.readPluginDescriptor(s, e);
        this.behaviors.push({ factoryID: d.factoryID, name: d.name, id: d.id, pluginUUID: d.pluginUUID, pluginName: d.pluginName });
        break;
      }
      case OZSceneNode.TAG_FLAGS: {           // 0xc8 <flags>
        this.flags = s.getAsUInt32(e);
        break;
      }
      case OZSceneNode.TAG_LINKEDOBJECTS: {   // 0xc9 <linkedobjects>
        // Child <object>/<id> entries collected by the linked-objects sub-handler.
        for (const c of e.children) {
          const oid = s.getAttributeAsUInt32(c, 0x6f);
          if (oid !== undefined) this.linkedObjects.push(oid);
        }
        break;
      }
      default:
        break; // not an OZSceneNode-level tag; base/subclass handles it
    }
  }

  /**
   * hitCheck(PCVector2<float> const&, OZRenderState const&, LiCamera const*, PCVector3<double>&,
   * unsigned int) @Ozone 0x90e70 - the BASE implementation, transcribed in full.
   *
   * The whole function is five instructions. It takes no branch, reads none of its five arguments
   * and writes nothing:
   *
   *   0x90e70  pushq %rbp             ; frame setup, no locals, no callee-saved registers
   *   0x90e71  movq  %rsp, %rbp
   *   0x90e74  xorl  %eax, %eax       ; return value := 0
   *   0x90e76  popq  %rbp
   *   0x90e77  retq
   *   0x90e78  nopl  (%rax,%rax)      ; alignment padding up to 0x90e80, not part of the body
   *
   * A bare scene node carries no geometry to test a point against, so the base answers "no hit"
   * and leaves the caller's PCVector3<double> out-parameter (%r8) untouched; the concrete
   * overrides do the work - OZElement @0x9d5c0, OZGroup @0xea1a0, OZTransformNode @0x1d2f40,
   * OZCamera @0x444230, OZImageMask @0x322200, OZRotoshape @0x41b1f0.
   *
   * The result is a bool: `xorl %eax, %eax` clears the whole 32-bit register, and the overrides
   * produce their answer in %al (`movb $0x1, %al` @0x9d8d6 and `xorl %eax, %eax` @0x9d88c inside
   * OZElement::hitCheck), which callers consume with `testb %al, %al` (@0x9d60a).
   *
   * Differential against the live binary (re/oracle/OZSceneNode_hitCheck_oracle.py): Ozone loaded
   * out of the app bundle under `arch -x86_64`, this symbol called on randomised argument sets
   * with every caller-owned buffer poisoned to 0xCD - every call returned 0 and left all of the
   * arenas (receiver, point, render state, camera, hit point) byte-identical, and the TS port
   * agrees on every case.
   */
  hitCheck(
    _point: PCVector2Float,   // %rsi - PCVector2<float> const&
    _state: OZRenderState,    // %rdx - OZRenderState const&
    _camera: LiCamera | null, // %rcx - LiCamera const* (may be null)
    _hitPoint: Float64Array,  // %r8  - PCVector3<double>& out-parameter (x/y/z @ +0x00/+0x08/+0x10)
    _flags: number,           // %r9d - unsigned int
  ): boolean {
    // 0x90e74  xorl %eax, %eax - the only instruction that computes anything.
    return false;
  }

}
