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

  /**
   * `OZScene::updateInvalidFreezeNodeIDs()` — @Ozone 0x311ce0
   *
   * Full disassembly (re/disasm/__ZN7OZScene26updateInvalidFreezeNodeIDsEv.s):
   *   0x311ce0  pushq %rbp                 ; frame prologue
   *   0x311ce1  movq  %rsp, %rbp
   *   0x311ce4  popq  %rbp                 ; frame epilogue
   *   0x311ce5  retq                       ; return void
   *   0x311ce6  nopw  %cs:(%rax,%rax)      ; alignment padding (not executed)
   *
   * A REAL no-op in the shipping binary: it establishes and tears down a
   * stack frame and returns immediately, never touching `this` (rdi is
   * untouched) and calling nothing. Transcribed faithfully as an empty
   * body. Kept as a distinct method to preserve the FCP class boundary —
   * this WAS a method on OZScene, even though its body compiled to nothing.
   */
  updateInvalidFreezeNodeIDs(): void {
    // no-op (@Ozone 0x311ce0 — push rbp; mov rbp,rsp; pop rbp; ret)
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


// ---------------------------------------------------------------------------
// OZScene::getDependantNodes(unsigned int) @Ozone 0x58db0
//   __ZN7OZScene17getDependantNodesEj
// ---------------------------------------------------------------------------
//
// FULL DISASM (raw-port/re/disasm/__ZN7OZScene17getDependantNodesEj.s, 29 lines)
// ---------------------------------------------------------------------------
//   0x58db0  movq   0x418(%rdi), %rcx             ; rcx = root = this->depMapRoot@0x418
//   0x58db7  testq  %rcx, %rcx
//   0x58dba  je     0x58df3                       ; empty map => return 0
//   0x58dbc  pushq  %rbp / movq %rsp,%rbp
//   0x58dc0  addq   $0x418, %rdi                  ; rdi = &this->depMap@0x418 (header)
//   0x58dc7  movq   %rdi, %rax                    ; rax = best = header
//   0x58dca  nopw   (%rax,%rax)
//   -------- LOWER_BOUND LOOP --------
//   0x58dd0  xorl   %edx, %edx                    ; edx = 0
//   0x58dd2  cmpl   %esi, 0x20(%rcx)              ; AT&T: dst-src => node.key - searchKey
//   0x58dd5  setb   %dl                           ; dl = (node.key < searchKey) ? 1 : 0
//                                                 ;   (setb: CF=1 => unsigned less-than)
//   0x58dd8  cmovaeq %rcx, %rax                   ; CF=0 (node.key >= key) => best = cur
//   0x58ddc  movq   (%rcx,%rdx,8), %rcx           ; rcx = cur->child[dl] (left if 0, right if 1)
//                                                 ;   (libc++ __tree_node<>::__left_ @+0x00,
//                                                 ;    __right_ @+0x08)
//   0x58de0  testq  %rcx, %rcx
//   0x58de3  jne    0x58dd0                       ; loop until nil
//   -------- POST-LOOP CHECK --------
//   0x58de5  cmpq   %rdi, %rax                    ; best == header?  (never updated)
//   0x58de8  je     0x58def                       ; yes => return 0 (empty range)
//   0x58dea  cmpl   0x20(%rax), %esi              ; AT&T: dst-src => key - best.key
//   0x58ded  jae    0x58df6                       ; key >= best.key => match (since best.key >= key
//                                                 ;   from the loop invariant, jae here means
//                                                 ;   key == best.key, i.e. std::map::find hit)
//   0x58def  xorl   %eax, %eax                    ; miss => return 0
//   0x58df1  popq   %rbp / retq
//   0x58df3  xorl   %eax, %eax / retq             ; empty map fast path
//   0x58df6  movq   0x28(%rax), %rax              ; return best.value (pointer at +0x28)
//   0x58dfa  popq   %rbp / retq
//
// STRUCTURE INTERPRETATION
// ---------------------------------------------------------------------------
// This is `std::map<unsigned int, T*>::find(key)` on a libc++ `__tree` where
// the header sentinel is embedded inside OZScene at offset 0x418 and the
// `__tree_node` layout is the standard
//     +0x00  __left_    (__tree_node_base*)
//     +0x08  __right_   (__tree_node_base*)
//     +0x10  __parent_  (__tree_node_base*)         (unused here)
//     +0x18  __is_black_ / padding
//     +0x20  key        (unsigned int, 4 bytes + padding)
//     +0x28  value      (T*, 8 bytes)
// (Key type is `unsigned int` — see the `cmpl %esi, 0x20(%rcx)` 4-byte compare.
//  Value type is a pointer because the return is loaded via a single `movq`.)
//
// The `addq $0x418, %rdi` before the loop makes `%rdi` point to the header;
// on the miss path the code compares `%rax == %rdi` (best-still-pointing-at-
// header) to detect the "key smaller than every element" corner. This is the
// libc++ codegen for the very common
//     auto it = m.find(key); return it == m.end() ? nullptr : it->second;
// pattern, hand-inlined by clang -O2.
//
// The stored value is *the raw pointer at +0x28* — no retain, no bounds
// check, no copy — so the caller borrows it. The demangled type signature
// declares the return as untyped (`getDependantNodes(unsigned int)` mangles
// no return-type token), matching a raw `T*` returned by value.
//
// PORT STRATEGY
// ---------------------------------------------------------------------------
// The libc++ red-black tree is out of scope for the port (it's an STL
// template, not an FCP function), so we use JS's ordered/unordered `Map`.
// For a find-only method the difference is invisible: `Map.prototype.get`
// returns the stored value or `undefined` for a miss; we normalise the miss
// to `null` to preserve the "0 vs pointer" distinction of the machine code.
//
// The field is modelled on `OZSceneRuntime` as `depMap_at0x418` (a
// `Map<number, OZSceneDependantNodesEntry>` — the value type is opaque
// because this method never dereferences the pointer). Peers that MUTATE
// the map (there must be a `setDependantNodes` or the constructor of a
// per-node registry) will land on the same field as they are ported; we
// use `add-only` semantics (never destroy a landed sibling method).
//
// ZERO in-scope callees; ZERO externs. Pure structure read.

/**
 * Opaque pointee of a `depMap_at0x418` entry. FCP stores an 8-byte pointer
 * at `__tree_node+0x28`; getDependantNodes just returns it, never touching
 * whatever is on the other side. Modelled as a branded object so the type
 * system can distinguish it from arbitrary pointers without pretending to
 * know the internal layout (which is decoded by whichever `set`/`insert`
 * peer lands next).
 */
export interface OZSceneDependantNodesEntry {
  readonly __ozSceneDependantNodesEntryBrand: unique symbol;
}

/**
 * `OZScene::getDependantNodes(unsigned int)` — @Ozone 0x58db0.
 *
 * `std::map<unsigned int, T*>::find(key)` on the embedded map at
 * `this+0x418`; returns the stored pointer on hit, `null` on miss (the
 * machine returns 0). See the disasm block above for the line-by-line
 * transcription.
 *
 * The `OZSceneRuntime` extension adds a single field `depMap_at0x418`.
 * Peer methods that populate the map (still un-ported at time of writing)
 * MUST use the same field name so this method continues to observe their
 * writes; the field name is stable and address-anchored to 0x418.
 */
export function OZScene_getDependantNodes(
  self: OZSceneRuntime & {
    depMap_at0x418: Map<number, OZSceneDependantNodesEntry> | null;
  },
  key: number,
): OZSceneDependantNodesEntry | null {
  // 0x58db0  movq 0x418(%rdi), %rcx  ; rcx = root pointer
  // 0x58db7  testq %rcx, %rcx / je 0x58df3 — empty map fast path returns 0.
  //   In the port, `null` (uninitialised) or an empty Map both stand in for
  //   "no root". `Map.get` on an empty Map returns undefined, which the
  //   `?? null` below normalises to null — bit-for-bit equivalent to the
  //   xor-eax-eax return.
  const map = self.depMap_at0x418;
  if (map === null) return null; // @0x58dba je => xorl %eax,%eax / retq @0x58df3

  // 0x58dc0..0x58de3  LOWER_BOUND LOOP + POST-LOOP EQUALITY CHECK.
  //   The disassembled loop walks a libc++ red-black tree; the exact
  //   invariant is "return the pointer at __tree_node+0x28 if a node with
  //   key == searchKey exists, else return 0". JS's `Map.get` implements
  //   the same set-membership + value fetch on a hash table. Both return
  //   `null` on miss; both return the stored pointer on hit. Faithful
  //   transcription of the observable semantics (not the traversal
  //   micro-ops — the tree walk itself is libc++ template code, not FCP).
  //
  //   Key type is `uint32_t` (the `cmpl` is a 4-byte compare on %esi vs
  //   [node+0x20]). We mask the JS `number` to 32 unsigned bits so a
  //   caller passing a negative int or a value > 2**32-1 collides on the
  //   same key the machine would (uint truncation is how the compare in
  //   the ABI is defined).
  const key32 = key >>> 0; // uint32_t coercion, matching `cmpl` operand width
  // 0x58df6  movq 0x28(%rax), %rax   — hit: return best.value (T* at +0x28)
  // 0x58def  xorl %eax, %eax         — miss (best.key > key strictly, so
  //                                   the JAE at 0x58ded didn't fire).
  return map.get(key32) ?? null;
}


// ---------------------------------------------------------------------------
// OZScene::setNeedsDesperationMode(bool) @Ozone 0x7ec30
//   __ZN7OZScene23setNeedsDesperationModeEb
//   DECODE: raw-port/re/disasm/__ZN7OZScene23setNeedsDesperationModeEb.s
// ---------------------------------------------------------------------------

/**
 * The single slot this unit touches.
 *
 * `+0x660  std::atomic<bool> needsDesperationMode` — the "renderer had to fall
 * back to the low-memory / low-quality path for this scene" latch that
 * GLRenderer's desperation machinery (`GLRenderer::enterDesperationMode(OZScene*)`
 * @Ozone 0x239000, `GLRenderer::leaveDesperationMode(OZScene*)` @0x2390f0,
 * `GLRenderer::inDesperationMode()` @0x235460) drives.
 *
 * Grounding — every `0x660(<this>)` access on an OZScene in the Ozone slice:
 *   OZScene::OZScene(OZDocument*)            @0x4cf21 `movb $0x0, 0x660(%r13)`
 *                                             (default = false)
 *   OZScene::OZScene(OZScene const&,
 *                    OZDocument*)            @0x4da85 `movzbl 0x660(%r13),%eax`
 *                                             @0x4da8d `movb %al, 0x660(%r12)`
 *                                             (copy ctor propagates the byte)
 *   OZScene::setNeedsDesperationMode(bool)   @0x7ec36 `xchgb %al, 0x660(%rdi)`
 *   OZScene::inDesperationMode() const       @0x7ec44 `movzbl 0x660(%rdi),%eax`
 * One byte wide (`movb`/`movzbl`/`xchgb` throughout). Modelled as `number`
 * (0..255) rather than `boolean` so the exact stored byte — which the setter
 * below can leave as any value the caller passed — stays observable, exactly
 * as `inDesperationMode()`'s `movzbl` would see it.
 */
export interface OZSceneDesperationField {
  /** `+0x660` — the atomic desperation-mode byte (see the interface doc). */
  needsDesperationMode_at0x660: number;
}

/**
 * `OZScene::setNeedsDesperationMode(bool)` — @Ozone 0x0007ec30
 * (mangled `__ZN7OZScene23setNeedsDesperationModeEb`).
 *
 * FULL DISASM (7 lines — every instruction, in order):
 *
 *   0x7ec30  pushq %rbp                 ; prologue
 *   0x7ec31  movq  %rsp, %rbp
 *   0x7ec34  movl  %esi, %eax           ; eax = the bool argument
 *   0x7ec36  xchgb %al, 0x660(%rdi)     ; ATOMIC swap: al <-> this[+0x660]
 *   0x7ec3c  andb  $0x1, %al            ; al = OLD byte & 1
 *   0x7ec3e  popq  %rbp
 *   0x7ec3f  retq                       ; return that old value
 *
 * This is `std::atomic<bool>::exchange`, not a plain store:
 *
 *  * `xchg` with a MEMORY operand is implicitly LOCKed on x86 (no `lock`
 *    prefix is emitted or needed), i.e. the read-modify-write is atomic and
 *    carries full sequential-consistency fencing. A plain `movb` — what the
 *    sibling one-line setters in this file compile to — would NOT.
 *  * The instruction is a SWAP: the argument byte goes into +0x660 and the
 *    PREVIOUS byte comes back in `%al`.
 *  * `andb $0x1, %al` @0x7ec3c then narrows that old byte to its low bit and
 *    leaves it in the return register, so despite the `set…` name the function
 *    RETURNS the previous flag (`bool`). The mask is the C++ `bool` narrowing
 *    libc++ applies to a loaded `atomic<bool>` — note it applies ONLY to the
 *    returned value; the byte actually STORED is the caller's argument
 *    unmasked, since `%al` was written from `%esi` @0x7ec34 before the swap.
 *
 * The port therefore mirrors both halves: it stores the caller's byte verbatim
 * and returns `old & 1`. Callers that want the classic "did I flip it?" idiom
 * get exactly what the binary gives them.
 *
 * ZERO in-scope callees, zero externs, zero indirect calls, no branches. The
 * atomicity has no JS counterpart (single-threaded), so the swap is expressed
 * as a read-then-write pair in the order the instruction performs them.
 *
 * @param self the `OZScene` — `this` (%rdi).
 * @param needsDesperationMode the new flag — `%sil`/`%esi` (arg 1).
 * @returns the PREVIOUS flag, masked to its low bit (`andb $0x1` @0x7ec3c).
 */
export function OZScene_setNeedsDesperationMode(
  self: OZSceneDesperationField,
  needsDesperationMode: boolean | number,
): boolean {
  // @0x7ec34  movl %esi, %eax — the argument byte, as the machine sees it.
  const incoming =
    typeof needsDesperationMode === "boolean"
      ? needsDesperationMode
        ? 1
        : 0
      : needsDesperationMode & 0xff;

  // @0x7ec36  xchgb %al, 0x660(%rdi) — atomic swap: read the old byte out and
  // write the incoming byte in, in one indivisible step.
  const old = self.needsDesperationMode_at0x660 & 0xff;
  self.needsDesperationMode_at0x660 = incoming;

  // @0x7ec3c  andb $0x1, %al — the RETURNED old value is masked to its low bit
  // (the stored byte above is NOT masked).
  // @0x7ec3f  retq
  return (old & 0x1) !== 0;
}

// ---------------------------------------------------------------------------
// OZScene::end_all() — the "all descendants" iterator family
// ---------------------------------------------------------------------------

/**
 * The sret struct `OZScene::begin_all()` @0x4f120 / `OZScene::end_all()`
 * @0x4f160 return. It is NOT the same shape as {@link OZSceneChildIterator}
 * (the direct-children iterator built by `begin()` @0x63760 / `end()`
 * @0x637a0): every slot after the three leading pointers sits 0x10 bytes
 * higher, and the flag at +0x28 is written as a DWORD (`movl $0x0`) where the
 * child iterator's flag at +0x18 is written as a BYTE (`movb $0x0`). Both the
 * offsets and the store widths below are read straight off `end_all`:
 *
 *   dst+0x00 : movq %rsi, (%rdi)             @0x4f18b  (end: the sentinel)
 *   dst+0x08 : movq %rcx, 0x8(%rdi)          @0x4f18e  (first-child snapshot)
 *   dst+0x10 : movq %rsi, 0x10(%rdi)         @0x4f192  (the sentinel)
 *   dst+0x18 : movups %xmm0, 0x18(%rdi)      @0x4f180  (16 zero bytes)
 *   dst+0x28 : movl $0x0, 0x28(%rdi)         @0x4f196  (4 zero bytes)
 *   dst+0x30 : movups %xmm0, 0x30(%rdi)      @0x4f17c  (16 zero bytes)
 *   dst+0x40 : movups %xmm0, 0x40(%rdi)      @0x4f178  (16 zero bytes)
 *   dst+0x50 : movl $0x3f800000, 0x50(%rdi)  @0x4f184  (fp32 1.0)
 *   dst+0x54 : END of writes (84 bytes total).
 *
 * The three zeroed 16-byte runs stay opaque `Uint8Array`s for the same reason
 * the child iterator's do: they are written as raw `movups`, and naming
 * fields inside them would need peer disasm that is not ported yet.
 */
export interface OZSceneAllIterator {
  /**
   * +0x00: current-position pointer.
   * `end_all()` stores `rsi = this+0x3D0 = &childListSentinel_at0x3D0` here
   * (@0x4f18b); `begin_all()` @0x4f14b stores `rcx = *(this+0x3D8)` instead.
   * That single instruction is the ONLY difference between the two functions.
   */
  cur_at0x00: OZSceneChildListNode;
  /**
   * +0x08: mirror of `*(this+0x3D8)` = firstChildPtr_at0x3D8 — the list head
   * captured (@0x4f167) BEFORE `rsi` is rewritten to the sentinel address.
   * Both `begin_all` (@0x4f14e) and `end_all` (@0x4f18e) store the same value.
   */
  firstChildAtSnapshot_at0x08: OZSceneChildListNode;
  /** +0x10: end-sentinel pointer = `this + 0x3D0` (@0x4f192 / @0x4f152). */
  endSentinel_at0x10: OZSceneChildListNode;
  /** +0x18..+0x27: zeroed 16 bytes (`movups %xmm0` @0x4f180). */
  zeroBlock_at0x18: Uint8Array; // length === 16, all bytes 0
  /**
   * +0x28: 32-bit zero (`movl $0x0, 0x28(%rdi)` @0x4f196). Note the DWORD
   * width — the child iterator's corresponding flag is a single `movb`.
   */
  flag_at0x28: number;
  /**
   * +0x2C..+0x2F: 4 bytes neither function writes. Kept `undefined` so
   * reading them is a runtime error rather than a silent zero.
   */
  pad_0x2C_to_0x2F?: undefined;
  /** +0x30..+0x3F: zeroed 16 bytes (`movups %xmm0` @0x4f17c). */
  zeroBlock_at0x30: Uint8Array; // length === 16, all bytes 0
  /** +0x40..+0x4F: zeroed 16 bytes (`movups %xmm0` @0x4f178). */
  zeroBlock_at0x40: Uint8Array; // length === 16, all bytes 0
  /**
   * +0x50: float32 1.0 (0x3F800000), stored with a 32-bit
   * `movl $0x3f800000, 0x50(%rdi)` @0x4f184 — a genuine fp32 immediate, so the
   * port fround-clamps it exactly as the child iterator's +0x40 weight does.
   */
  weight_at0x50: number; // fp32; always 1.0f at construction
}

/**
 * OZScene::end_all()
 * @0x000000000004f160  Ozone   mangled: __ZN7OZScene7end_allEv
 *
 * ABI: sret struct-return. The caller passes an 84-byte
 * {@link OZSceneAllIterator} slot in %rdi; `this` = `OZScene*` arrives in
 * %rsi; the sret pointer is returned in %rax.
 *
 * Full transcription — every instruction, in order
 * (raw-port/re/disasm/__ZN7OZScene7end_allEv.s):
 *
 *   0x4f160  pushq  %rbp                     ; frame setup (no TS counterpart)
 *   0x4f161  movq   %rsp, %rbp               ; frame setup (no TS counterpart)
 *   0x4f164  movq   %rdi, %rax               ; return value = the sret slot
 *   0x4f167  movq   0x3d8(%rsi), %rcx        ; rcx = *(this+0x3D8) = first child
 *   0x4f16e  addq   $0x3d0, %rsi             ; rsi = this+0x3D0 = &sentinel
 *   0x4f175  xorps  %xmm0, %xmm0             ; xmm0 = 0
 *   0x4f178  movups %xmm0, 0x40(%rdi)        ; dst[0x40..0x4F] = 0
 *   0x4f17c  movups %xmm0, 0x30(%rdi)        ; dst[0x30..0x3F] = 0
 *   0x4f180  movups %xmm0, 0x18(%rdi)        ; dst[0x18..0x27] = 0
 *   0x4f184  movl   $0x3f800000, 0x50(%rdi)  ; dst[0x50] = fp32 1.0
 *   0x4f18b  movq   %rsi, (%rdi)             ; dst[0x00] = sentinel  <-- END
 *   0x4f18e  movq   %rcx, 0x8(%rdi)          ; dst[0x08] = first child
 *   0x4f192  movq   %rsi, 0x10(%rdi)         ; dst[0x10] = sentinel
 *   0x4f196  movl   $0x0, 0x28(%rdi)         ; dst[0x28] = 0 (DWORD)
 *   0x4f19d  popq   %rbp                     ; frame teardown (no TS counterpart)
 *   0x4f19e  retq                            ; return %rax (the sret slot)
 *   0x4f19f  nop                             ; alignment padding, not executed
 *
 * `begin_all()` @0x4f120 is byte-identical except for ONE instruction: at
 * @0x4f14b it does `movq %rcx, (%rdi)` (dst[0x00] = FIRST CHILD) where this
 * function does `movq %rsi, (%rdi)` @0x4f18b (dst[0x00] = SENTINEL). Same
 * relationship as `begin()` @0x63787 vs `end()` @0x637c7 on the direct-child
 * iterator — so this is the past-the-end position of the same iterator shape.
 *
 * Note the ORDER the machine uses: `rcx` is loaded from +0x3D8 BEFORE `rsi` is
 * advanced to `this+0x3D0` (@0x4f167 then @0x4f16e), which is why the snapshot
 * at dst+0x08 is the list head and not something derived from the sentinel.
 *
 * Nothing is read THROUGH `rcx` or the sentinel address — `end_all` is pure
 * pointer arithmetic plus a fixed byte-shape build, so it has ZERO callees,
 * zero externs and no indirect dispatch.
 */
export function OZScene_end_all(
  self: OZSceneRuntime,
  out: OZSceneAllIterator,
): OZSceneAllIterator {
  // The three 16-byte zero runs are caller-owned storage in the C++ sret slot;
  // if they are not sized right, the movups-simulation below would silently
  // truncate, so refuse loudly (same guard style as OZScene_begin).
  if (!(out.zeroBlock_at0x18 instanceof Uint8Array) || out.zeroBlock_at0x18.length !== 16) {
    throw new Error(
      "OZScene_end_all: out.zeroBlock_at0x18 must be a 16-byte Uint8Array " +
        "(sret iterator slot @0x18..0x27). @0x4f180 stores 16 bytes here.",
    );
  }
  if (!(out.zeroBlock_at0x30 instanceof Uint8Array) || out.zeroBlock_at0x30.length !== 16) {
    throw new Error(
      "OZScene_end_all: out.zeroBlock_at0x30 must be a 16-byte Uint8Array " +
        "(sret iterator slot @0x30..0x3F). @0x4f17c stores 16 bytes here.",
    );
  }
  if (!(out.zeroBlock_at0x40 instanceof Uint8Array) || out.zeroBlock_at0x40.length !== 16) {
    throw new Error(
      "OZScene_end_all: out.zeroBlock_at0x40 must be a 16-byte Uint8Array " +
        "(sret iterator slot @0x40..0x4F). @0x4f178 stores 16 bytes here.",
    );
  }

  // @0x4f167  rcx = *(this + 0x3D8) = firstChildPtr_at0x3D8 (captured FIRST).
  const rcx: OZSceneChildListNode = self.firstChildPtr_at0x3D8;
  // @0x4f16e  rsi = this + 0x3D0 = &childListSentinel_at0x3D0. (No pointer
  //           arithmetic in TS — the referenced node stands in for the
  //           address; peers compare sentinel-ness by identity.)
  const rsi_plus_3d0: OZSceneChildListNode = self.childListSentinel_at0x3D0;

  // Stores, in binary order:
  //   @0x4f175: xorps %xmm0, %xmm0             (xmm0 = 0)
  //   @0x4f178: movups %xmm0, 0x40(%rdi)
  out.zeroBlock_at0x40.fill(0);
  //   @0x4f17c: movups %xmm0, 0x30(%rdi)
  out.zeroBlock_at0x30.fill(0);
  //   @0x4f180: movups %xmm0, 0x18(%rdi)
  out.zeroBlock_at0x18.fill(0);
  //   @0x4f184: movl $0x3f800000, 0x50(%rdi) — 0x3F800000 IS the IEEE-754
  //   fp32 encoding of 1.0, stored 32-bit wide, so fround it.
  out.weight_at0x50 = Math.fround(1.0);
  //   @0x4f18b: movq %rsi, (%rdi)   -> dst[0x00] = sentinel (the END position;
  //             this is the one instruction begin_all @0x4f14b differs on).
  out.cur_at0x00 = rsi_plus_3d0;
  //   @0x4f18e: movq %rcx, 0x8(%rdi) -> dst[0x08] = first-child snapshot
  out.firstChildAtSnapshot_at0x08 = rcx;
  //   @0x4f192: movq %rsi, 0x10(%rdi) -> dst[0x10] = sentinel
  out.endSentinel_at0x10 = rsi_plus_3d0;
  //   @0x4f196: movl $0x0, 0x28(%rdi) -> dst[0x28] = 0 (DWORD, not a byte)
  out.flag_at0x28 = 0;

  // SysV: %rax already holds the sret out-ptr (set @0x4f164).
  return out;
}


// ---------------------------------------------------------------------------
// OZScene::begin_all() @Ozone 0x4f120
//   __ZN7OZScene9begin_allEv
//   DECODE: raw-port/re/disasm/__ZN7OZScene9begin_allEv.s
// ---------------------------------------------------------------------------

/**
 * `OZScene::begin_all()`
 * @0x000000000004f120  Ozone   mangled: __ZN7OZScene9begin_allEv
 *
 * The BEGIN endpoint of the "all descendants" iterator family whose END
 * endpoint (`end_all()` @0x4f160) is ported directly above; both build the
 * same {@link OZSceneAllIterator} sret struct, which is reused unchanged here.
 *
 * ABI: sret struct-return — the destination slot arrives in `%rdi`, the
 * receiver (`this`) in `%rsi`, and the sret pointer is handed back in `%rax`
 * (`movq %rdi, %rax` @0x4f124).
 *
 * FULL DISASM (16 lines — every instruction, in order,
 * raw-port/re/disasm/__ZN7OZScene9begin_allEv.s):
 *
 *   0x4f120  pushq  %rbp                        ; prologue
 *   0x4f121  movq   %rsp, %rbp
 *   0x4f124  movq   %rdi, %rax                  ; return value = the sret slot
 *   0x4f127  movq   0x3d8(%rsi), %rcx           ; rcx = *(this+0x3D8) = first child
 *   0x4f12e  addq   $0x3d0, %rsi                ; rsi = this+0x3D0 = &sentinel
 *   0x4f135  xorps  %xmm0, %xmm0                ; xmm0 = 0
 *   0x4f138  movups %xmm0, 0x40(%rdi)           ; dst[0x40..0x4F] = 0
 *   0x4f13c  movups %xmm0, 0x30(%rdi)           ; dst[0x30..0x3F] = 0
 *   0x4f140  movups %xmm0, 0x18(%rdi)           ; dst[0x18..0x27] = 0
 *   0x4f144  movl   $0x3f800000, 0x50(%rdi)     ; dst[0x50] = fp32 1.0
 *   0x4f14b  movq   %rcx, (%rdi)                ; dst[0x00] = FIRST CHILD
 *   0x4f14e  movq   %rcx, 0x8(%rdi)             ; dst[0x08] = first-child snapshot
 *   0x4f152  movq   %rsi, 0x10(%rdi)            ; dst[0x10] = &sentinel
 *   0x4f156  movl   $0x0, 0x28(%rdi)            ; dst[0x28] = 0  (DWORD)
 *   0x4f15d  popq   %rbp
 *   0x4f15e  retq
 *   0x4f15f  nop                                ; alignment padding, not executed
 *
 * It is byte-identical to `end_all()` @0x4f160 except for ONE instruction:
 *   begin_all @0x4f14b  `movq %rcx, (%rdi)`   -> cur = the FIRST CHILD
 *   end_all   @0x4f18b  `movq %rsi, (%rdi)`   -> cur = the SENTINEL
 * Everything else — the capture order (`rcx` read @0x4f127 BEFORE `%rsi` is
 * rewritten @0x4f12e), the three `movups` zero runs, the fp32 1.0 at +0x50,
 * the +0x08 snapshot, the +0x10 sentinel and the DWORD zero at +0x28 — matches
 * instruction for instruction at the corresponding addresses. That is exactly
 * the begin/end relationship the direct-children pair `begin()` @0x63760 /
 * `end()` @0x637a0 has on the smaller iterator.
 *
 * Neither pointer is dereferenced: the body is pure pointer arithmetic plus a
 * fixed byte-shape build, so it has ZERO callees, zero externs, zero indirect
 * calls and no branches.
 *
 * @param self the receiver (`%rsi`).
 * @param out  the caller-provided sret slot (`%rdi`).
 * @returns `out` — the value `%rax` carries back.
 */
export function OZScene_begin_all(
  self: OZSceneRuntime,
  out: OZSceneAllIterator,
): OZSceneAllIterator {
  // The three 16-byte zero runs are caller-owned storage in the C++ sret slot;
  // if they are not sized right the movups-simulation below would silently
  // truncate, so refuse loudly (same guard style as OZScene_end_all above).
  if (!(out.zeroBlock_at0x18 instanceof Uint8Array) || out.zeroBlock_at0x18.length !== 16) {
    throw new Error(
      "OZScene_begin_all: out.zeroBlock_at0x18 must be a 16-byte Uint8Array " +
        "(sret iterator slot @0x18..0x27). @0x4f140 stores 16 bytes here.",
    );
  }
  if (!(out.zeroBlock_at0x30 instanceof Uint8Array) || out.zeroBlock_at0x30.length !== 16) {
    throw new Error(
      "OZScene_begin_all: out.zeroBlock_at0x30 must be a 16-byte Uint8Array " +
        "(sret iterator slot @0x30..0x3F). @0x4f13c stores 16 bytes here.",
    );
  }
  if (!(out.zeroBlock_at0x40 instanceof Uint8Array) || out.zeroBlock_at0x40.length !== 16) {
    throw new Error(
      "OZScene_begin_all: out.zeroBlock_at0x40 must be a 16-byte Uint8Array " +
        "(sret iterator slot @0x40..0x4F). @0x4f138 stores 16 bytes here.",
    );
  }

  // @0x4f127  rcx = *(this + 0x3D8) = firstChildPtr_at0x3D8 (captured FIRST,
  //           before %rsi is rewritten).
  const rcx: OZSceneChildListNode = self.firstChildPtr_at0x3D8;
  // @0x4f12e  rsi = this + 0x3D0 = &childListSentinel_at0x3D0. (No pointer
  //           arithmetic in TS — the referenced node stands in for the
  //           address; peers compare sentinel-ness by identity.)
  const rsi_plus_3d0: OZSceneChildListNode = self.childListSentinel_at0x3D0;

  // Stores, in binary order:
  //   @0x4f135: xorps %xmm0, %xmm0        (xmm0 = 0)
  //   @0x4f138: movups %xmm0, 0x40(%rdi)
  out.zeroBlock_at0x40.fill(0);
  //   @0x4f13c: movups %xmm0, 0x30(%rdi)
  out.zeroBlock_at0x30.fill(0);
  //   @0x4f140: movups %xmm0, 0x18(%rdi)
  out.zeroBlock_at0x18.fill(0);
  //   @0x4f144: movl $0x3f800000, 0x50(%rdi) — 0x3F800000 IS the IEEE-754
  //   fp32 encoding of 1.0, stored 32-bit wide, so fround it.
  out.weight_at0x50 = Math.fround(1.0);
  //   @0x4f14b: movq %rcx, (%rdi)  — THE distinguishing store: begin_all's
  //   cursor starts at the FIRST CHILD (end_all @0x4f18b stores the sentinel).
  out.cur_at0x00 = rcx;
  //   @0x4f14e: movq %rcx, 0x8(%rdi)
  out.firstChildAtSnapshot_at0x08 = rcx;
  //   @0x4f152: movq %rsi, 0x10(%rdi)
  out.endSentinel_at0x10 = rsi_plus_3d0;
  //   @0x4f156: movl $0x0, 0x28(%rdi)  — DWORD-wide zero (the child iterator's
  //   corresponding flag is a single movb; this family uses movl).
  out.flag_at0x28 = 0;

  // SysV: %rax already holds the sret out-ptr (set @0x4f124).
  return out;
}
