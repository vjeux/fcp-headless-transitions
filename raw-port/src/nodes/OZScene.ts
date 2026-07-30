// OZScene — the top-level scene: layers + sceneSettings + factory table.
// Faithful port of Ozone OZScene::parseElement @Ozone 0x62dd0 (parseBegin @0x62140, parseEnd @0x62480;
// OZSceneScope). Decode from re/disasm/ + the ledger (army/ledger/Ozone.ledger.json).
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

// =============================================================================
// Layout-recovered OZScene handle + child-list iterator (from disasm, ADD-only).
// =============================================================================
//
// The pre-existing `OZScene` class above is the .motr PARSER view — a hand-
// modelled `layers: OZSceneNode[]` + `settings` bag used by parseScene. The
// FCP runtime OZScene binary layout is completely separate: it is a large
// (>0x3E0-byte) node object whose child-list bookkeeping lives at offset
// +0x3D0 (list-head sentinel/marker) and +0x3D8 (first-node pointer). The
// two views MUST NOT be conflated — the parser class never had those fields.
// So we add the runtime handle as a distinct opaque interface, and the port
// of `begin()` operates on that interface only. Existing callers of `OZScene`
// (parseScene et al.) are untouched.

/**
 * OZScene runtime layout — ONLY the fields THIS unit touches.
 *
 * Offsets recovered from `begin()` @0x63760 (identical pattern in `end()`
 * @0x637a0; see re/disasm/__ZN7OZScene3endEv.s):
 *   this+0x3D0 : list-head SENTINEL (address of the header/marker node —
 *                the invariant "end of the child list" sentinel that both
 *                begin() and end() bake into iterator.pos_after=+0x10 slot).
 *   this+0x3D8 : list-head FIRST-CHILD pointer (== sentinel when empty).
 *
 * The rest of OZScene's layout is not exercised by this unit. It will land
 * as its peers are ported (setActiveLayer @0x63630 already has a re/disasm
 * entry and will refine the layout on its own commit).
 */
export interface OZSceneRuntime {
  // NOTE: modelled as a bag so peers can add their offsets without cross-file
  // reaches. Only the two slots @0x3D0 / @0x3D8 that begin()/end() read are
  // named here; both are typed as opaque handles because their pointee is a
  // linked-list node whose layout begin() itself doesn't touch.
  childListSentinel_at0x3D0: OZSceneChildListNode;
  firstChildPtr_at0x3D8: OZSceneChildListNode;
}

/**
 * A node in OZScene's child list — the pointee begin()/end() copy into the
 * returned iterator. begin() never dereferences it; it just captures the
 * pointer bit-for-bit. Modelled as an opaque tag; a peer method that walks
 * the list (operator++, dereference) will decode the linked-list layout.
 */
export interface OZSceneChildListNode {
  readonly __ozSceneChildListNodeBrand: unique symbol;
}

/**
 * Return value of OZScene::begin() and OZScene::end() — a 0x44-byte
 * (68-byte) iterator handle. Layout recovered directly from the sret
 * stores at @0x63778..@0x63792:
 *
 *   dst+0x00 : (begin) firstChild = this+0x3D8   value of *(this+0x3D8),
 *              (end)   sentinel   = this+0x3D0   (address of the sentinel)
 *   dst+0x08 : "current-fromEnd" mirror slot — begin stores rcx = *(this+0x3D8),
 *              end also stores rcx = *(this+0x3D8). So this is ALWAYS the
 *              first-child pointer regardless of which endpoint we make.
 *   dst+0x10 : owner/end marker = this+0x3D0 (address of the sentinel; the
 *              "one-past-the-end" position used to detect exhaustion).
 *   dst+0x18 : 1 byte, cleared to 0. Likely a "reversed" or "removed" flag.
 *   dst+0x19..0x1F : NOT WRITTEN by begin() — the caller owns the 8-byte
 *              slot; the compiler leaves 7 padding bytes untouched (they
 *              retain whatever the caller's stack allocator left there).
 *              Because this is an sret slot, in C++ the caller default-inits
 *              or reserves — we model the field as `undefined | number` for
 *              those pad bytes so tests can't observe a "wrong" byte here.
 *   dst+0x20..0x2F : zeroed via `movups %xmm0, 0x20(%rdi)` (xmm0 was xor'd).
 *   dst+0x30..0x3F : zeroed via `movups %xmm0, 0x30(%rdi)`.
 *   dst+0x40 : float 1.0 (0x3F800000) — an fp32 scalar. Given the iterator
 *              is over a scene's children, this is almost certainly a
 *              "progress"/"weight" scratch slot that operator++ will
 *              overwrite. Not consumed by begin() itself.
 *   dst+0x44 : END of writes (68 bytes total).
 *
 * We model the zeroed 16-byte blocks as opaque 16-byte Uint8Arrays because
 * begin() writes them as raw movups; naming individual fields inside them
 * would require peer disasm we haven't ported yet.
 */
export interface OZSceneChildIterator {
  /**
   * +0x00: current-position pointer.
   * begin() stores `rcx = *(this+0x3D8) = firstChildPtr_at0x3D8` here.
   * end() stores `rsi = this+0x3D0 = &childListSentinel_at0x3D0` here.
   */
  cur_at0x00: OZSceneChildListNode;
  /**
   * +0x08: mirror of `*(this+0x3D8)` = firstChildPtr_at0x3D8.
   * BOTH begin() and end() store the SAME value here (rcx captured before
   * the rsi = rsi+0x3D0 rewrite). Named as "firstChildAtSnapshot" because
   * it's an at-construction snapshot of the list head, independent of
   * endpoint.
   */
  firstChildAtSnapshot_at0x08: OZSceneChildListNode;
  /**
   * +0x10: end-sentinel pointer = &childListSentinel_at0x3D0.
   * Both begin() and end() store `rsi + 0x3D0 = this + 0x3D0` here.
   */
  endSentinel_at0x10: OZSceneChildListNode;
  /**
   * +0x18: single byte, zeroed. Likely a flag; not otherwise inspected here.
   */
  flag_at0x18: number;
  /**
   * +0x19..+0x1F: 7 bytes of untouched padding. begin() does NOT write
   * these; keep as undefined to make it a runtime error to read them.
   */
  pad_0x19_to_0x1F?: undefined;
  /** +0x20..+0x2F: zeroed 16 bytes (movups %xmm0). */
  zeroBlock_at0x20: Uint8Array; // length === 16, all bytes 0
  /** +0x30..+0x3F: zeroed 16 bytes (movups %xmm0). */
  zeroBlock_at0x30: Uint8Array; // length === 16, all bytes 0
  /**
   * +0x40: float32 1.0 (0x3F800000). Stored via `movl $0x3f800000, 0x40(%rdi)`.
   * Must be a genuine fp32 (Math.fround-clamped) because the compiler used
   * a 32-bit immediate movl, not movsd.
   */
  weight_at0x40: number; // fp32; always 1.0f at construction
}

/**
 * OZScene::begin()
 * @0x0000000000063760  Ozone   mangled: __ZN7OZScene5beginEv
 *
 * ABI: sret struct-return. Caller passes 68-byte OZSceneChildIterator slot
 * in %rdi; this = OZScene* in %rsi. Returns the sret pointer in %rax.
 *
 * Disasm:
 *   pushq  %rbp                        # @0x63760
 *   movq   %rsp, %rbp                  # @0x63761
 *   movq   %rdi, %rax                  # @0x63764  return = sret out-ptr
 *   movq   0x3d8(%rsi), %rcx           # @0x63767  rcx = *(this+0x3D8) = first child
 *   addq   $0x3d0, %rsi                # @0x6376e  rsi = this+0x3D0 = sentinel addr
 *   xorps  %xmm0, %xmm0                # @0x63775  xmm0 = 0
 *   movups %xmm0, 0x30(%rdi)           # @0x63778  dst[0x30..0x3F] = 0
 *   movups %xmm0, 0x20(%rdi)           # @0x6377c  dst[0x20..0x2F] = 0
 *   movl   $0x3f800000, 0x40(%rdi)     # @0x63780  dst[0x40..0x43] = float 1.0f
 *   movq   %rcx, (%rdi)                # @0x63787  dst[0x00] = rcx (= first child)
 *   movq   %rcx, 0x8(%rdi)             # @0x6378a  dst[0x08] = rcx (mirror)
 *   movq   %rsi, 0x10(%rdi)            # @0x6378e  dst[0x10] = rsi (= sentinel addr)
 *   movb   $0x0, 0x18(%rdi)            # @0x63792  dst[0x18] = 0 (flag byte)
 *   popq   %rbp                        # @0x63796
 *   retq                               # @0x63797
 *
 * Contrast with `end()` @0x637a0: identical except @0x637c7 does
 * `movq %rsi, (%rdi)` (dst[0x00] = sentinel), not `movq %rcx, (%rdi)`.
 * i.e. end.cur = sentinel; begin.cur = firstChild. Both share dst[0x08]
 * = first-child snapshot, dst[0x10] = sentinel, dst[0x18] = 0, and the
 * zeroed 0x20/0x30 blocks and 1.0f weight — this is the same iterator
 * shape with a different starting position.
 *
 * Nothing here reads through rcx (the first-child pointer) or the sentinel
 * address — begin() is pure pointer arithmetic + a byte-shape build. So it
 * has ZERO callees; it can be transcribed without any imports.
 */
export function OZScene_begin(
  self: OZSceneRuntime,
  out: OZSceneChildIterator,
): OZSceneChildIterator {
  // Assert the two out-slot invariants: the 16-byte zero blocks must be
  // pre-allocated by the caller (in C++ the sret slot is caller-owned). If
  // they aren't sized right, our movups-simulation would silently truncate.
  if (!(out.zeroBlock_at0x20 instanceof Uint8Array) || out.zeroBlock_at0x20.length !== 16) {
    throw new Error(
      "OZScene_begin: out.zeroBlock_at0x20 must be a 16-byte Uint8Array " +
        "(sret iterator slot @0x20..0x2F). @0x63778 stores 16 bytes here.",
    );
  }
  if (!(out.zeroBlock_at0x30 instanceof Uint8Array) || out.zeroBlock_at0x30.length !== 16) {
    throw new Error(
      "OZScene_begin: out.zeroBlock_at0x30 must be a 16-byte Uint8Array " +
        "(sret iterator slot @0x30..0x3F). @0x6377c stores 16 bytes here.",
    );
  }

  // @0x63767  rcx = *(this + 0x3D8) = firstChildPtr_at0x3D8
  const rcx: OZSceneChildListNode = self.firstChildPtr_at0x3D8;
  // @0x6376e  rsi = this + 0x3D0 = &childListSentinel_at0x3D0
  //           (in TS we don't have a pointer arithmetic model — we
  //            capture the referenced node by identity; peers that
  //            care about "is this the sentinel?" compare by identity.)
  const rsi_plus_3d0: OZSceneChildListNode = self.childListSentinel_at0x3D0;

  // Stores, in binary order:
  //   @0x63775: xorps %xmm0, %xmm0    (xmm0 = 0)
  //   @0x63778: movups %xmm0, 0x30(%rdi)   -> dst[0x30..0x3F] = 0
  out.zeroBlock_at0x30.fill(0);
  //   @0x6377c: movups %xmm0, 0x20(%rdi)   -> dst[0x20..0x2F] = 0
  out.zeroBlock_at0x20.fill(0);
  //   @0x63780: movl $0x3f800000, 0x40(%rdi)   -> fp32 1.0f
  //   The immediate 0x3f800000 IS the IEEE-754 fp32 encoding of 1.0. Under
  //   x86 SysV the store is 32-bit, so numerically it is exactly 1.0f. In
  //   TS we clamp via Math.fround so any downstream fp32 op sees the same
  //   bit pattern the binary sees.
  out.weight_at0x40 = Math.fround(1.0);
  //   @0x63787: movq %rcx, (%rdi)      -> dst[0x00] = firstChild
  out.cur_at0x00 = rcx;
  //   @0x6378a: movq %rcx, 0x8(%rdi)   -> dst[0x08] = firstChild (mirror)
  out.firstChildAtSnapshot_at0x08 = rcx;
  //   @0x6378e: movq %rsi, 0x10(%rdi)  -> dst[0x10] = sentinel addr
  out.endSentinel_at0x10 = rsi_plus_3d0;
  //   @0x63792: movb $0x0, 0x18(%rdi)  -> dst[0x18] = 0
  out.flag_at0x18 = 0;

  // SysV: %rax already holds the sret out-ptr (set at @0x63764).
  return out;
}

// ---------------------------------------------------------------------------
// OZScene::setActiveLayer(OZGroup*) @Ozone 0x50b40
// ---------------------------------------------------------------------------
//
// Faithful transcription (7-line disasm, one meaningful store):
//
//   0x50b40  pushq %rbp
//   0x50b41  movq  %rsp, %rbp
//   0x50b44  movq  %rsi, 0x3f0(%rdi)     ; this->activeLayer_at0x3F0 = layer
//   0x50b4b  popq  %rbp
//   0x50b4c  retq
//   0x50b4d  nopl  (%rax)                ; alignment
//
// SysV: %rdi = this (OZScene*), %rsi = layer (OZGroup*). The function is a
// pure single-slot setter — no null check, no validation, no reference-count
// bump: the binary just writes the pointer. There is NO in-scope callee, and
// NO out-of-scope extern either — 3 stack management ops and one movq.
//
// Runtime layout extension: this method proves OZScene has a slot at +0x3F0
// holding a pointer to an OZGroup ("the active layer"). This is a NEW field
// distinct from the +0x3D0/+0x3D8 childList slots that OZScene_begin/end
// already recovered — the class's layout is deliberately grown as new peers
// land. We add the field to OZSceneRuntime as `activeLayer_at0x3F0`, typed
// as `OZGroupRef | null` (opaque handle — begin()/end() don't touch it and
// this setter never dereferences it, so we don't need OZGroup's layout yet).

/**
 * An opaque OZGroup* stored at OZScene+0x3F0. setActiveLayer() writes the
 * pointer verbatim; no field of the pointee is read here, so we don't need
 * an OZGroup layout yet. Peers that read (`getActiveLayer`) or dereference
 * (any group-walking peer) will refine this into a concrete OZGroup type.
 */
export interface OZGroupRef {
  readonly __ozGroupRefBrand: unique symbol;
}

/**
 * OZScene::setActiveLayer(OZGroup*) @Ozone 0x50b40
 *   __ZN7OZScene14setActiveLayerEP7OZGroup
 *
 * Single-slot setter: `this->activeLayer_at0x3F0 = layer`. No validation, no
 * retain/release, no null check — the binary is literally three stack ops
 * and one `movq %rsi, 0x3f0(%rdi)`. Layer may legitimately be null (nothing
 * in the body forbids it), matching the standard "clear the active layer"
 * caller pattern.
 *
 * ZERO callees (in-scope or extern) — this is pure state mutation.
 */
export function OZScene_setActiveLayer(
  self: OZSceneRuntime & { activeLayer_at0x3F0: OZGroupRef | null },
  layer: OZGroupRef | null,
): void {
  // @0x50b44  movq %rsi, 0x3f0(%rdi)   — the entire body.
  self.activeLayer_at0x3F0 = layer;
}
