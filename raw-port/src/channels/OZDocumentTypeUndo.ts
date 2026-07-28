// OZDocumentTypeUndo — undo record capturing a whole OZDocument's "type" (project-type)
// change: the outgoing document type, its group-ID vector, its drop-zone vector, and the
// tail-of-flags block. FAITHFUL PORT from Ozone.framework — every method cites @0xADDR.
//
// vtable installed at ctor @0x102790 via `leaq 0x73af81(%rip),%rax` (C2) / @0x1028d0 (C1);
// vtable @0x83d718-ish holds {op-delete-ptr, D1, D0, Swap} — same {D1, D0, Swap} shape as
// the rest of the OZ*Undo family (OZSceneSettingsUndo, OZSceneRangeUndo, OZMarkersUndo, …).
//
// Struct layout (raw byte offsets recovered from ctor @0x102780 / @0x1028c0 and dtor
// @0x102980 / @0x102a00 / @0x102a80):
//   +0x00   0x08  vtable ptr                                    @0x102797 / @0x1028d7
//   +0x08   0x08  doc : OZDocument*             (raw pointer)   @0x1027b9 / @0x1028f9
//   +0x10   0x04  type : uint32_t               (project type)  @0x1027bd-0x1027bf / @0x1028fd-0x1028ff
//                     (copied from `params->type` = *(rdx))
//   +0x14   0x04  <pad — never explicitly touched, zeroed by the 0x28 SIMD store below>
//   +0x18   0x08  ids.begin : uint32_t*         (vector<u32>)   zeroed @0x1027a1 / @0x1028e1
//   +0x20   0x08  ids.end   : uint32_t*                          zeroed (in same 16-byte store)
//   +0x28   0x08  ids.cap_end : uint32_t*                        zeroed @0x1027a5 / @0x1028e5
//   +0x30   0x08  zones.begin : OZDropZoneTypeUndoParams*        zeroed (same 16-byte store)
//   +0x38   0x08  zones.end   : OZDropZoneTypeUndoParams*        zeroed @0x1027a9 / @0x1028e9
//   +0x40   0x08  zones.cap_end : OZDropZoneTypeUndoParams*      zeroed (same 16-byte store)
//   +0x48   0x11  tailBlob   : 17 bytes         (raw bytes copied verbatim from
//                                                 `params+0x38` and `params+0x41`)
//                              @0x102809-0x102819 / @0x10294b-0x102959: two overlapping
//                              16-byte SIMD moves (0x38→+0x48 and 0x41→+0x51) then a
//                              `movq $0x0, 0x59(%rdi)` @0x1027b1 / @0x1028f1 zeroes +0x59
//                              (the SIMD stores overwrite +0x48..+0x60 total).
//                              Contents (per the block-descriptor mangled name @0x102b40):
//                                +0x48  int32_t
//                                +0x4c  uint32_t   ← zeroed by the movups @0x1027ad
//                                +0x50  uint32_t
//                                +0x54  uint32_t
//                                +0x58  bool (BBBBB → 5 packed bytes) = 5 flags @+0x58..+0x5c
//   Total size: 0x60 (`0x59 + 5 packed bytes ≈ 0x5e` rounded up to 0x60 alignment; ctor never
//                     writes past +0x60).
//
// PARAMS struct layout (OZDocumentTypeUndoParams; recovered from the C2 body reads of `r14`):
//   +0x00   0x04  type : uint32_t          (u32 loaded via `movl (%rdx),%eax` @0x1027bd)
//   +0x08   0x08  ids.begin : uint32_t*    read @0x1027cb / @0x10290b
//   +0x10   0x08  ids.end   : uint32_t*    read @0x1027cf / @0x10290f  (byteLen = end-begin;
//                                            elemCount = byteLen>>2, `sarq $0x2` @0x1027d9)
//   +0x20   0x08  zones.begin : OZDropZoneTypeUndoParams*  read @0x1027e6 / @0x102926
//   +0x28   0x08  zones.end   : OZDropZoneTypeUndoParams*  read @0x1027ea / @0x10292a
//                                            (byteLen = end-begin; elemCount = byteLen/0xe0
//                                             via the classic `sarq $5` + `imulq 0x6db6db6db6db6db7`
//                                             magic @0x1027f4-0x102802 = ÷0xe0.)
//   +0x38   0x11  tail 17-byte block       — copied straight through the two overlapping xmm
//                                            moves @0x102809-0x102819 into `this+0x48..+0x59`.
//
// C1 (@0x1028c0) and C2 (@0x102780) BODIES ARE BYTE-IDENTICAL modulo the `leaq` offset for
// the vtable RIP-relative load — same field init sequence, same two `__assign_with_size`
// calls, same tail SIMD copy, same exception-cleanup pad that runs
// `OZDocumentTypeUndoParams::~OZDocumentTypeUndoParams()` @__ZN24OZDocumentTypeUndoParamsD1Ev
// on the params-by-ref (via r15 = this+0x10 which IS the params — i.e. this class's
// storage is the params-in-place) and then `__Unwind_Resume`.
//
// D2 @0x102980 and D1 @0x102a00 BODIES ARE BYTE-IDENTICAL:
//   1. re-install vtable                          @0x102994 / @0x102a14
//   2. r15 = zones.begin (`+0x30`)                @0x102997 / @0x102a17
//   3. if (!r15) skip to (7)                      @0x10299e / @0x102a1e
//   4. r14 = zones.end (`+0x38`)                  @0x1029a0 / @0x102a20
//   5. while (r14 != r15) {                       @0x1029a7-0x1029c2 / @0x102a27-0x102a42
//        r14 -= 0xe0;                             (walk BACKWARDS)
//        OZDropZoneTypeUndoParams::~OZDropZoneTypeUndoParams(r14);
//          → __ZN24OZDropZoneTypeUndoParamsD2Ev @stub 0x102aba / @0x102a3a
//      }
//   6. zones.end = zones.begin;                   @0x1029c8 / @0x102a48
//      operator delete(zones.begin);              @0x1029cc / @0x102a4c (tail-jmp @stub 0x6dfc36)
//   7. rdi = ids.begin (`+0x18`)                  @0x1029d1 / @0x102a51
//      if (!rdi) return                           @0x1029d8 / @0x102a58
//      ids.end = ids.begin;                       @0x1029da / @0x102a5a
//      operator delete(ids.begin);                @0x1029e8 / @0x102a68 (tail-jmp @stub 0x6dfc36)
//   NB: `zones.cap_end` (+0x40) and `ids.cap_end` (+0x28) are NEVER touched by the dtor —
//   consistent with the libc++ __assign_with_size fast-path that reused pre-sized storage.
//
// D0 @0x102a80 has the SAME body plus a final `operator delete(this)` @0x102af0. In TS: GC.
//
// SWAP @0x102b00 dispatches an Objective-C BLOCK via `[currentTool doNotUndoBlock:^{...}]`:
//   0x102b00-0x102b10: if (!doc || !doc->currentTool) return;   (rax = *(doc+0), rcx = *(rax+8))
//   0x102b1a:          tool = *(currentTool + 0xa0)             (nested tool ptr)
//   0x102b21:          block.isa    = __NSConcreteStackBlock
//   0x102b2c-0x102b31: block.flags  = 0xE2000000 (COPY_DISPOSE|STRET flags)
//   0x102b35-0x102b40: block.invoke = ____ZN18OZDocumentTypeUndo4SwapEv_block_invoke @0x102b80
//   0x102b40:          block.descriptor = ___block_descriptor_56_e8_32o_e267_ (size 56)
//                        — the descriptor's Objective-C encoding string spells out the
//                        captured layout (see block-mangled name @0x102b40): captures
//                        {rdi=this, rcx=currentTool} at ofs 0x30..0x40.
//   0x102b57-0x102b65: `[tool <selector>:&block]` — the selref slot @rip+0x80755a resolves
//                        to a REAL selector (otool's "getCurrentTool" label is the stock
//                        phantom decode — the actual selref must be recovered from the
//                        `__objc_selrefs` slot at this call-site's RIP displacement; almost
//                        certainly `@selector(performBlockWithoutUndoRegistration:)` or
//                        similar "run this block with undo disabled" pattern given the
//                        block body's `isUndoing`/`deleteNodes` shape).
//
// SWAP_BLOCK_INVOKE @0x102b80 (the block body — ~600 lines; kept as data here since we
// cannot invoke it directly from Swap without a full Objective-C dispatch shim):
//   - `OZDocument::isUndoing()` @__ZN10OZDocument9isUndoingEv @0x102ba3 — branch on undoing
//     vs redoing paths.
//   - UNDOING path: OZScene::deleteNodes(ids, 0, PCString{}, 8, false)
//     @__ZN7OZScene11deleteNodesERKNSt3__16vectorIjNS0_9allocatorIjEEEEjRK8PCStringjb
//     @0x102bdf — deletes captured node IDs from the scene.
//   - Writes `doc->currentScene->type = this.type` @0x102bed-0x102bf4 (offset +0x138 on
//     doc's `doc+0x8`-loaded thing — likely doc->currentScene: +0x138 = scene.type).
//   - Then iterates zones vector (walk +0xe0 each step) allocating a fresh 0xf0-byte
//     OZDropZoneSomething per zone via `operator new(0xf0)` @0x102c15, copy-assigning the
//     captured params via `OZDropZoneTypeUndoParams::operator=` @0x102cb5, then dispatching
//     the vtable slots +0x18 (setter with 0/0) then +0x8 (dtor/release).
//   - REDOING path (@0x102ce7 onward, not fully disassembled here) is the symmetric fold.
//   - The block-invoke's own frontier: PCString ctor/dtor stubs @0x6df0c0/@0x6df0c6,
//     OZScene::deleteNodes, operator new/delete, OZDropZoneTypeUndoParams::operator=.
//
// FRONTIER (undecoded — kept as throwing citations):
//   __ZN24OZDocumentTypeUndoParamsD1Ev                       — exception cleanup pad @0x10282e
//   __ZN24OZDropZoneTypeUndoParamsD2Ev                       — dtor loop @0x1029ba / @0x102a3a
//   std::vector<uint32_t>::__assign_with_size[abi:nqe210106] @0x1027dd / @0x10291d
//   std::vector<OZDropZoneTypeUndoParams>::__assign_with_size@0x102806 / @0x102946
//   OZDocument::isUndoing()                                  @0x102ba3   (block-invoke)
//   OZScene::deleteNodes(vector<u32>&, u32, PCString&, u32, bool)  @0x102bdf
//   OZDropZoneTypeUndoParams::operator=                      @0x102cb5   (block-invoke)
//   PCString ctor/dtor                                       @0x6df0c0 / @0x6df0c6
//   __NSConcreteStackBlock                                   @rip 0x8258d8 (Swap block prologue)
//   real Objective-C selector for the block-dispatch call    @rip 0x8258b8 selref @0x102b57
//   operator new / operator delete                           @0x6dfca2 / @0x6dfc36
//
// @0x102780 (C2), @0x1028c0 (C1), @0x102980 (D2), @0x102a00 (D1), @0x102a80 (D0), @0x102b00 (Swap)
// Faithful transcription — 6 methods.

// OZDocument — not yet ported; modelled opaquely (only stored as a raw pointer by this
// class, per the ctor's `movq %rsi, 0x8(%rdi)` @0x1027b9 / @0x1028f9).
export interface OZDocument {
  readonly __ozDocument: true;
}

// Params object — layout in the header above. Modelled opaquely; consumers pass a shape
// carrying the exact byte-level data (type + ids + zones + 17-byte tail).
export interface OZDocumentTypeUndoParams {
  readonly type: number;             // +0x00 uint32
  readonly ids: readonly number[];   // +0x08..+0x10 vector<u32>  (elemCount = end-begin>>2)
  readonly zones: readonly OZDropZoneTypeUndoParamsHandle[]; // +0x20..+0x28 vector<0xe0>
  // +0x38 tail (17 bytes) — copied verbatim into `this+0x48..+0x58`.
  // Layout per the block-descriptor: int32 @+0, uint32 @+4, uint32 @+8, uint32 @+c, then
  // 5 bool bytes @+0x10..+0x14. We keep them as five typed fields.
  readonly tailI32: number;   // +0x38 int32
  readonly tailU32a: number;  // +0x3c uint32 (zeroed by ctor's 16-byte SIMD store)
  readonly tailU32b: number;  // +0x40 uint32
  readonly tailU32c: number;  // +0x44 uint32
  readonly tailFlags: readonly [boolean, boolean, boolean, boolean, boolean]; // +0x48..+0x4c
}

// OZDropZoneTypeUndoParams — already ported at raw-port/src/channels/OZDropZoneTypeUndoParams.ts
// (0xe0 = 224-byte POD). Modelled opaquely here to avoid a heavy dependency; the vector's
// element size 0xe0 is what matters for the ctor's __assign_with_size copy.
export interface OZDropZoneTypeUndoParamsHandle {
  readonly __ozDropZoneTypeUndoParams: true;
}

export class OZDocumentTypeUndo {
  // +0x08: raw non-owning pointer to the OZDocument the undo belongs to. Copied verbatim
  //         from `rsi` @0x1027b9 / @0x1028f9. Nulled on dtor via GC.
  private doc: OZDocument | null;

  // +0x10: captured project type (u32).
  private type: number = 0;

  // +0x18..+0x28: vector<uint32_t> of node IDs. In FCP the vector's storage is heap-
  // allocated (freed in dtor via operator delete + 0-length); TS GC handles the array.
  private ids: number[] = [];

  // +0x30..+0x40: vector<OZDropZoneTypeUndoParams> — element size 0xe0. Same story.
  private zones: OZDropZoneTypeUndoParamsHandle[] = [];

  // +0x48..+0x5c: the 17-byte tail block (int32 + 3 uint32 + 5 flags). Copied verbatim
  // in the ctor via the two overlapping xmm moves @0x102809-0x102819 / @0x10294b-0x102959
  // and the `movq $0, 0x59` @0x1027b1 / @0x1028f1.
  private tailI32: number = 0;
  private tailU32a: number = 0;
  private tailU32b: number = 0;
  private tailU32c: number = 0;
  private tailFlags: [boolean, boolean, boolean, boolean, boolean] = [
    false, false, false, false, false,
  ];

  // OZDocumentTypeUndo::OZDocumentTypeUndo(OZDocument*, OZDocumentTypeUndoParams const&)
  // — C2 @0x102780 and C1 @0x1028c0 BODIES BYTE-IDENTICAL modulo vtable RIP-relative offset.
  //
  //   0x102790-0x102797 / 0x1028d0-0x1028d7: install vtable
  //   0x10279a-0x1027b1 / 0x1028da-0x1028f1: zero-init the ids and zones vectors
  //     (three 16-byte movups + one 8-byte movq of $0 → +0x18..+0x40 all zero, and +0x4c
  //      + +0x59 zeroed as a side-effect of the same 16-byte stores that ALSO clobber
  //      the tail block just before it gets rewritten by the two SIMD copies below).
  //   0x1027b9 / 0x1028f9: this->doc = doc                                      (movq %rsi, 0x8)
  //   0x1027bd-0x1027bf / 0x1028fd-0x1028ff: this->type = params->type          (movl (%rdx))
  //   0x1027c2-0x1027c5 / 0x102902-0x102905: `cmpq %rdx, %r15` — SELF-ASSIGN CHECK. If the
  //     params pointer IS `this+0x10` (i.e. the caller passed our own params-block back),
  //     SKIP the two vector copies (no aliasing hazard). Otherwise:
  //     0x1027c7-0x1027dd / 0x102907-0x10291d: ids-vector __assign_with_size copy
  //       (byteLen = params->ids.end - params->ids.begin; elemCount = byteLen >> 2)
  //     0x1027e2-0x102806 / 0x102922-0x102946: zones-vector __assign_with_size copy
  //       (byteLen = params->zones.end - params->zones.begin;
  //        elemCount = byteLen / 0xe0 via the imul-magic `0x6db6db6db6db6db7 * (byteLen>>5)`)
  //   0x102809-0x102819 / 0x10294b-0x102959: two overlapping 16-byte SIMD copies of the
  //     17-byte tail block from params+0x38 → this+0x48 (movups params+0x38 → this+0x48;
  //     movups params+0x41 → this+0x51 — the second write overlaps the first, ensuring
  //     the full 17 bytes @0x48..0x58 land exactly).
  //
  //   Exception-cleanup pad @0x102828-0x102837 / @0x102968-0x10297b: if either vector-copy
  //   throws, run `OZDocumentTypeUndoParams::~OZDocumentTypeUndoParams(this+0x10)` and
  //   re-raise via __Unwind_Resume — because `this+0x10` IS the params-in-place storage.
  //
  //   ⚠️ TS SEMANTIC NOTE: We faithfully copy the fields by value. `ids` and `zones` are
  //   deep-copied at the array level (element identity for zones is preserved — same object
  //   handles — since OZDropZoneTypeUndoParams is not yet ported here). If FCP callers rely
  //   on the C++ ctor throwing when either `params` field is malformed (e.g. end < begin),
  //   that error is surfaced by the array-length arithmetic in the .slice() calls below.
  constructor(doc: OZDocument | null, params: OZDocumentTypeUndoParams) {
    this.doc = doc;
    this.type = params.type >>> 0;
    // Self-aliasing check: the ONLY way `params === this` in TS terms is if the caller
    // handed us back our own already-captured params. Since we're a fresh object here,
    // the copies always run (the asm's `je 0x10280b` is a defensive skip that TS can't
    // hit — but we mirror the semantic by copying with slice().).
    this.ids = params.ids.slice();
    this.zones = params.zones.slice();
    // Tail block — verbatim.
    this.tailI32 = params.tailI32 | 0;
    this.tailU32a = params.tailU32a >>> 0;
    this.tailU32b = params.tailU32b >>> 0;
    this.tailU32c = params.tailU32c >>> 0;
    this.tailFlags = [
      params.tailFlags[0],
      params.tailFlags[1],
      params.tailFlags[2],
      params.tailFlags[3],
      params.tailFlags[4],
    ];
  }

  // OZDocumentTypeUndo::~OZDocumentTypeUndo() — D2 @0x102980 and D1 @0x102a00 BODIES
  // BYTE-IDENTICAL. Walks zones back-to-front invoking each element's dtor, then frees
  // zones storage, then frees ids storage. In TS: GC handles both — we just clear.
  destroy(): void {
    // 0x1029a0-0x1029c2: walk zones.end down by 0xe0 until it meets zones.begin,
    //   invoking OZDropZoneTypeUndoParams::~OZDropZoneTypeUndoParams @stub 0x1029ba.
    //   In TS the array elements are GC'd when we clear the array.
    this.zones.length = 0;
    // 0x1029d1-0x1029e8: free ids storage.
    this.ids.length = 0;
    this.doc = null;
  }

  // OZDocumentTypeUndo::~OZDocumentTypeUndo() — D0 @0x102a80 (deleting). Same body as D1/D2
  // plus `operator delete(this)` @0x102af0. In TS: GC.
  deleteThis(): void {
    this.zones.length = 0;
    this.ids.length = 0;
    this.doc = null;
    // 0x102af0: operator delete(this) — no-op in TS (GC).
  }

  // OZDocumentTypeUndo::Swap() @0x102b00.
  //
  // Sets up an ObjC stack block capturing `this` and `currentTool = doc->tool->tool` (raw
  // pointer chain `*(doc+0)+8` then `*(rax+0xa0)`), then dispatches it via `[currentTool
  // <sel>:&block]`. The selref @0x102b57 resolves via the RIP-relative slot into
  // `__objc_selrefs` — otool's phantom label "getCurrentTool" is a decode artefact; the
  // real selector must be recovered from the `__objc_selrefs` slot (VA + RIP + 4). Without
  // a full Objective-C bridge the dispatch cannot be reproduced faithfully.
  //
  // The block body (____ZN18OZDocumentTypeUndo4SwapEv_block_invoke @0x102b80, ~600 asm
  // lines) implements the actual undo/redo:
  //   - branch on OZDocument::isUndoing() @0x102ba3
  //   - UNDOING: OZScene::deleteNodes(this->ids, 0, PCString{}, 8, false)
  //         @__ZN7OZScene11deleteNodesERKNSt3__16vectorIjNS0_9allocatorIjEEEEjRK8PCStringjb
  //         @0x102bdf
  //   - write doc->currentScene->type = this->type   @0x102bed-0x102bf4  (offset +0x138)
  //   - iterate this->zones: for each z, new OZDropZone*(0xf0), copy-assign the captured
  //         OZDropZoneTypeUndoParams via `operator=` @0x102cb5, dispatch vtable[+0x18](0,0)
  //         then vtable[+0x8] (release) @0x102cc5 / @0x102ccf. (Walks +0xe0 per step
  //         @0x102cd2.)
  //   - REDOING branch @0x102ce7 onward: symmetric restore path (further disassembly
  //         needed to reconstruct — kept opaque here).
  swap(): void {
    // 0x102b04-0x102b10: guard — if doc or its tool is null, return.
    if (this.doc === null) return;
    // The real dispatch requires:
    //   (a) an Objective-C bridge for the [tool <sel>:^block] call,
    //   (b) OZDocument::isUndoing / OZScene::deleteNodes / OZDropZoneTypeUndoParams::operator=,
    //   (c) OZScene::type field access at +0x138.
    // None of those are decoded yet in this port. Throw with the exact citations.
    throw new Error(
      "OZDocumentTypeUndo::Swap unimplemented @0x102b00 — needs ObjC dispatch for " +
        "[doc.currentTool.tool <sel>:^block] (selref @0x102b57, stack block prologue " +
        "@0x102b21-0x102b40, block invoke @0x102b80). Block body @0x102b80 needs: " +
        "OZDocument::isUndoing @0x102ba3, OZScene::deleteNodes " +
        "@__ZN7OZScene11deleteNodesERKNSt3__16vectorIjNS0_9allocatorIjEEEEjRK8PCStringjb " +
        "@0x102bdf, scene->type write @0x102bed-0x102bf4, and the zone-restore loop " +
        "@0x102c10-0x102cdc calling OZDropZoneTypeUndoParams::operator= @0x102cb5 and " +
        "vtable[+0x18]/[+0x8] @0x102cc5/@0x102ccf per element.",
    );
  }

  // Getters — expose the captured snapshot for consumers/tests. These are not real FCP
  // methods (the C++ side accesses fields directly at their raw offsets); they're the
  // TS-idiomatic way to read the frozen state.
  getDoc(): OZDocument | null { return this.doc; }
  getType(): number { return this.type; }
  getIds(): readonly number[] { return this.ids; }
  getZones(): readonly OZDropZoneTypeUndoParamsHandle[] { return this.zones; }
  getTailI32(): number { return this.tailI32; }
  getTailU32a(): number { return this.tailU32a; }
  getTailU32b(): number { return this.tailU32b; }
  getTailU32c(): number { return this.tailU32c; }
  getTailFlags(): readonly [boolean, boolean, boolean, boolean, boolean] {
    return this.tailFlags;
  }
}
