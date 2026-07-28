// OZSceneSettingsUndo — undo record that snapshots an OZScene's OZSceneSettings (0x110 =
// 272 bytes) plus a companion vector<uint32_t> of "groups that would be converted to 3D for
// 360-project-mode" IDs. FAITHFUL PORT from Ozone.framework. Every method cites @0xADDR.
//
// vtable (installed via `leaq 0x73c570(%rip),%rax` @0x101061). Same {D1, D0, Swap} shape as
// the rest of the OZ*Undo family (OZSceneRangeUndo, OZMarkersUndo, etc.).
//
// Struct layout (0x28 = 40 bytes; recovered from ctor @0x101050 and dtor @0x101170):
//   +0x00   0x08  vtable ptr
//   +0x08   0x08  settings : OZSceneSettings*   heap-allocated 0x110 bytes copied from
//                                              `scene+0x90` via OZSceneSettings::OZSceneSettings
//                                              (OZSceneSettings const&) @__ZN15OZSceneSettings
//                                              C1ERKS_. Owned; freed by virtual dtor slot +0x8.
//   +0x10   0x18  groups3D : std::vector<uint32_t>
//                                              (begin@+0x10, end@+0x18, cap_end@+0x20; element
//                                               size 4 confirmed by `groupsThatWouldBe...` call
//                                               taking a `vector<unsigned int>&` — see mangled
//                                               name @0x1010a4. Zero-initialized in ctor via
//                                               xmm0 + movq at 0x10106f-0x101076.)
//
// D2 @0x101170 and D1 @0x1011c0 are IDENTICAL bodies:
//   - Re-install vtable
//   - If settings != null: `callq *(settings->vt + 8)` — virtual DELETING dtor on settings
//                          (releases the 0x110-byte object).
//   - settings = null
//   - If groups3D.begin != null:
//        groups3D.end = groups3D.begin      (movq %rdi, 0x18(%rbx))
//        operator delete(groups3D.begin)     (tail-jmp __ZdlPv)
//     Else: return.
// D0 @0x101210 has the SAME body plus a final `operator delete(this)` @0x101255.
//
// FRONTIER (undecoded — kept as throwing stubs cited by @0xADDR):
//   OZSceneSettings::OZSceneSettings(OZSceneSettings const&)  @__ZN15OZSceneSettingsC1ERKS_
//     (ctor @0x101095, Swap @0x1012a4 — each after operator new(0x110))
//   OZSceneSettings virtual dtor (vtable[+0x8])               (D2/D1/D0 + Swap @0x10141b)
//   OZScene::groupsThatWouldBeConvertedTo3DFor360ProjectMode(vector<uint32>&)
//     @__ZN7OZScene47groupsThatWouldBeConvertedTo3DFor360ProjectModeERNSt3__16vectorIjNS0_9allocatorIjEEEE
//     — ctor @0x1010a4, Swap @0x101440
//   OZScene::setPixelAspectRatio(double)                       @__ZN7OZScene19setPixelAspectRatioEd  — Swap @0x1012b5
//   OZSceneSettings::is360Project() const                      @__ZNK15OZSceneSettings12is360ProjectEv — Swap @0x1012bd / @0x1012c9
//   OZScene::didSet360ProjectMode()                            @__ZN7OZScene20didSet360ProjectModeEv — Swap @0x101448
//   OZScene::getNode(unsigned int)                             @__ZN7OZScene7getNodeEj — Swap @0x101490
//   OZGroup::setDimensionType(OZDimensionType, bool)           @__ZN7OZGroup16setDimensionTypeE15OZDimensionTypeb — Swap @0x1014d4
//   OZSceneNode vtable[+0x680]                                 — Swap @0x1014c0
//   PCString::set(PCString const&)                             @stub 0x6df048 — Swap @0x1013ba
//   PCCFRefTraits<CGColorSpace*>::retain / release             @stubs 0x6dda94 / 0x6dda9a — Swap @0x101357 / @0x101376
//   dynamic_cast<OZGroup*>(OZSceneNode*)                       @stub 0x6dfd0e — Swap @0x1014ad
//   _theApp + OZApplication::getCurrentDoc()                    — Swap @0x10127b
//   OZDocument::postNotification(unsigned int)                 @__ZN10OZDocument16postNotificationEj (arg=8) — Swap @0x101500
//
// Consumers referencing OZSceneSettingsUndoC1 (10+ call sites): 0x4fe1a, 0x5073f, 0x5e2a25,
// 0x5e2bb4, 0x5e2f81, 0x5e3169, 0x5e3917, 0x5e3a09, 0x5e3b0a, 0x5e3dfc, ...

import { OZScene } from "../nodes/OZScene";

// OZSceneSettings — 272-byte (0x110) settings object. Not yet ported; modelled as opaque.
// Direct field-offset reads in Swap (@+0x30 pixelAspectRatio, @+0x48 someUint, @+0x8..+0xd8
// SIMD blocks, @+0x50/+0x60/+0x70 blocks, @+0x80 CGColorSpace*, @+0x88/+0x98/+0xa4 SIMD,
// @+0xb8 PCString, @+0x100 SIMD) confirm at least 272 bytes of struct with many mixed types.
export interface OZSceneSettings {
  readonly __ozSceneSettings: true;
}

export class OZSceneSettingsUndo {
  // +0x08: owning ptr to a heap-allocated OZSceneSettings snapshot.
  private settings: OZSceneSettings | null = null;

  // +0x10: vector<uint32_t> of group IDs. Modeled as a Uint32Array-backed slice; length
  // corresponds to (end-begin)/4. In FCP the vector's storage is heap-allocated (freed in
  // dtor); TS GC handles the array.
  private groups3D: number[] = [];

  // OZSceneSettingsUndo::OZSceneSettingsUndo(OZScene*) @0x101050 (C2) and @0x1010e0 (C1) —
  // IDENTICAL BODIES (C1 not shown separately here, byte-equivalent to C2).
  //   0x101061-0x101068: install vtable
  //   0x10106b-0x101076: this->groups3D = {}    (xmm0=0 → begin/end zeroed, then movq $0
  //                                              → cap_end zeroed)
  //   0x10107e-0x101083: p = operator new(0x110)
  //   0x101088-0x101095: OZSceneSettings::OZSceneSettings(p, scene+0x90)   # copy-ctor
  //   0x10109a:         this->settings = p
  //   0x10109e-0x1010a4: scene->groupsThatWouldBeConvertedTo3DFor360ProjectMode(this->groups3D)
  //                                              (populates the vector by out-arg reference)
  //
  //   Cleanup pad @0x1010b2: if OZSceneSettings ctor throws, delete p; then rethrow. If the
  //   `groupsThatWould...` call throws, free the vector's begin storage then rethrow.
  constructor(scene: OZScene) {
    // Groups3D field init above handles the zero-init.
    // The two frontier calls are undecoded — throw with the exact addresses.
    throw new Error(
      "OZSceneSettingsUndo ctor unimplemented — needs OZSceneSettings copy-ctor " +
        "@__ZN15OZSceneSettingsC1ERKS_ (call @0x101095 after operator new(0x110)) " +
        "and OZScene::groupsThatWouldBeConvertedTo3DFor360ProjectMode " +
        "@__ZN7OZScene47groupsThatWouldBe...ERNSt3__16vectorIjNS0_9allocatorIjEEEE " +
        "(call @0x1010a4)." +
        ` [scene=${scene === null ? "null" : "handle"}]`,
    );
  }

  // OZSceneSettingsUndo::~OZSceneSettingsUndo() @0x101170 (D2) and @0x1011c0 (D1) —
  // IDENTICAL BODIES.
  //   0x101179-0x101180: re-install vtable
  //   0x101183-0x10118f: if (settings) { settings->vt[+8](settings); }
  //                       (virtual DELETING dtor — releases the 0x110-byte block)
  //   0x101192:         settings = null
  //   0x10119a-0x1011a1: rdi = groups3D.begin; if (!rdi) return.
  //   0x1011a3-0x1011ad: groups3D.end = groups3D.begin;  operator delete(groups3D.begin);
  //                       (tail-jmp — the cap_end at +0x20 is NEVER touched by the dtor)
  //
  // In TS: null the fields. The virtual dtor dispatch on `settings` would require porting
  // OZSceneSettings, so we DON'T explicitly invoke it — GC handles the underlying object.
  destroy(): void {
    // 0x101183-0x101192: release settings (virtual deleting dtor)
    this.settings = null;
    // 0x10119a-0x1011ad: free groups3D storage — GC in TS. We clear the array.
    this.groups3D.length = 0;
  }

  // OZSceneSettingsUndo::~OZSceneSettingsUndo() @0x101210 (D0 — deleting).
  // Same as D1/D2 for both fields, then `operator delete(this)` @0x101255. In TS: GC.
  deleteThis(): void {
    this.settings = null;
    this.groups3D.length = 0;
    // 0x101255: operator delete(this) — no-op in TS (GC).
  }

  // OZSceneSettingsUndo::Swap() @0x101260 — virtual "apply/unapply" hook.
  //
  // High-level flow (>150 asm lines — kept as throw-stub; every referenced address cited):
  //   0x101271-0x101280: doc = _theApp->getCurrentDoc().doc              # rbx
  //   0x101284-0x101287: if (!doc) return                                # jmp epilogue @0x101452
  //   0x10128d-0x1012a4: newSet = new OZSceneSettings(*(doc+0x90))       # copy of doc's settings
  //                       (operator new(0x110) + copy-ctor)
  //   0x1012a9-0x1012b5: doc->setPixelAspectRatio( this->settings[+0x30] as double )
  //   0x1012bd-0x1012ce: was360 = newSet->is360Project(); is360 = this->settings->is360Project()
  //   0x1012d1-0x101408: FIELD-COPY: overwrites doc's settings block (`rbx`) with the fields of
  //                       `this->settings` (r12) using SIMD moves. Individual copies:
  //                          +0xd8 (u32)         @0x1012d5-0x1012da
  //                          +0x98..+0xd7 (4 xmm) @0x1012e0-0x10130d
  //                          +0xe0..+0x10f (3 xmm) @0x101314-0x101334
  //                          +0x110 (CGColorSpace* w/ retain/release exchange) @0x10133b-0x101374
  //                          +0x118..+0x143 (3 xmm) @0x10137b-0x1013a4
  //                          +0x148 (PCString::set) @0x1013ab-0x1013ba
  //                          +0x150 (xmm) + +0x100 (xmm) @0x1013bf-0x101408
  //   0x10140f-0x10141e: if (doc->settings) { doc->settings->vt[+8](doc->settings); }
  //                       (virtually delete the OLD settings)
  //   0x10141e:         doc->settings = newSet                            # our snapshot
  //   0x101422-0x101426: if (was360 == is360) skip 360-mode transition
  //   0x101430-0x101448: if (is360) { /* 360 mode ON — set vec.end=begin then call
  //                       groupsThatWouldBe... + didSet360ProjectMode */ }
  //   0x101461-0x1014d9: if (was360) { /* 360 mode OFF — walk previous groups3D vector, for
  //                       each ID call getNode → dynamic_cast<OZGroup*> → vt[+0x680] → if
  //                       non-zero, setDimensionType(OZDimensionType::e0, true) */ }
  //   0x1014e6-0x101500: post OZDocument::postNotification(*(doc+0x588), 0x8)
  swap(): void {
    throw new Error(
      "OZSceneSettingsUndo::Swap unimplemented — 150+ asm lines through frontier: " +
        "_theApp/getCurrentDoc @0x10127b, OZSceneSettings copy-ctor @0x1012a4, " +
        "OZScene::setPixelAspectRatio @0x1012b5, OZSceneSettings::is360Project " +
        "@0x1012bd/0x1012c9, direct field-copy of OZSceneSettings blocks " +
        "(0x98/0xe0/0x110/0x118/0x148/0x150/0x100), PCCFRefTraits retain/release " +
        "@0x101357/0x101376, PCString::set @0x1013ba, groupsThatWouldBe... @0x101440, " +
        "OZScene::didSet360ProjectMode @0x101448, OZScene::getNode @0x101490, " +
        "dynamic_cast<OZGroup*> @0x1014ad, OZSceneNode vtable[+0x680] @0x1014c0, " +
        "OZGroup::setDimensionType @0x1014d4, and " +
        "OZDocument::postNotification(0x8) @0x101500.",
    );
  }
}
