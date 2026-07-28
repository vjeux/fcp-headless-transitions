// OZSceneRangeUndo — undo record that snapshots an OZScene's timeRange and playRange (both
// PCTimeRange values, each 0x30 bytes) plus a RangeType selector. FAITHFUL PORT from
// Ozone.framework. Every method cites @0xADDR.
//
// vtable (installed via `leaq 0x73c77d(%rip),%rax` @0x100e2c ; slot table follows the same
//   {D1, D0, Swap} shape as OZLastModifiedChannelsUndo / OZMarkersUndo / OZDropZoneTypeUndo /
//   OZKeypointModificationUndo / OZEditBoxUndo / OZDocumentTypeUndo — the "Undo w/ virtual
//   Swap()" family).
//
// Struct layout (0x70 = 112 bytes; recovered from ctor @0x100e20 and Swap @0x100f50):
//   +0x00   0x08  vtable ptr
//   +0x08   0x30  timeRange : PCTimeRange   (start@+0x08 .. duration@+0x38-1)
//   +0x38   0x30  playRange : PCTimeRange   (start@+0x38 .. duration@+0x68-1)
//   +0x68   0x04  rangeType : uint32        (the RangeType enum arg; values used by Swap: 0
//                                            triggers the timeRange branch, any other value
//                                            skips it — so it's a "which range(s) to snapshot"
//                                            selector, but the CTOR unconditionally captures
//                                            BOTH ranges regardless of the type.)
//   +0x6c   0x04  (pad)
//
// PCTimeRange source offsets on OZScene (read by ctor from `scene` at rsi):
//   scene+0x480 .. scene+0x4af  → timeRange (48 bytes; captured by 2 × 24-byte reads: movups
//                                 (+16) + movq (+8) for start, then movups + movq for
//                                 duration.)
//   scene->getPlayRange()       → playRange (48 bytes; getPlayRange returns a PCTimeRange*
//                                 which is walked via the same {movups + movq} × 2 pattern.)
//
// D2 @0x100f20 and D1 @0x100f30 are EMPTY (pushq/movq/popq/retq) — no destructible fields.
// D0 @0x100f40 is the same trivial body plus a tail-jmp to __ZdlPv (operator delete).
//
// FRONTIER (undecoded — kept as throwing stubs cited by @0xADDR):
//   OZScene+0x480 timeRange field — direct offset read in ctor @0x100e36..0x100e4c
//   OZScene::getPlayRange() const @__ZNK7OZScene12getPlayRangeEv  — ctor @0x100e65, Swap @0x100fe3
//   _theApp global + OZApplication::getCurrentDoc()  — Swap @0x100f6a
//   OZScene::setTimeRange(PCTimeRange const&) @__ZN7OZScene12setTimeRangeERK11PCTimeRange
//                                                                   — Swap @0x100fbb
//   OZScene::setPlayRange(PCTimeRange const&) @__ZN7OZScene12setPlayRangeERK11PCTimeRange
//                                                                   — Swap @0x10100e
//   OZDocument::postNotification(unsigned int) @__ZN10OZDocument16postNotificationEj
//                                                                   — Swap @0x10103f (arg=0x1000)

import { OZScene } from "../nodes/OZScene";
import type { PCTimeRange } from "../infra/PCTimeRange";
import { kCMTimeZero } from "../infra/CMTime";

// OZSceneRangeUndo::RangeType — a nested enum. From Swap's `cmpl $0x0,0x68(%rbx)` @0x100f80
// we know value 0 has special meaning (triggers the timeRange swap branch). No other value
// distinguisher appears in the 6 ported methods — the full enum set requires additional
// call-site decode. We encode the observed value literally.
export enum OZSceneRangeType {
  // The default/zero enumerator — the one branch that Swap() treats specially (0x100f80).
  // Semantically this is the "swap-timeRange-too" selector; the name is unknown without
  // enum symbol recovery, so we use an addr-cited placeholder.
  RangeType_0 = 0,
}

export class OZSceneRangeUndo {
  // +0x08: snapshot of scene's timeRange at ctor time.
  timeRange: PCTimeRange = {
    start: { ...kCMTimeZero },
    duration: { ...kCMTimeZero },
  };
  // +0x38: snapshot of scene's playRange at ctor time.
  playRange: PCTimeRange = {
    start: { ...kCMTimeZero },
    duration: { ...kCMTimeZero },
  };
  // +0x68: which range(s) Swap() should touch (0 => both; else => only playRange).
  rangeType: OZSceneRangeType = OZSceneRangeType.RangeType_0;

  // OZSceneRangeUndo::OZSceneRangeUndo(OZScene const*, RangeType) @0x100e20 (C2) and
  // @0x100ea0 (C1) — IDENTICAL BODIES.
  //   0x100e2c-0x100e33: install vtable (implicit in TS)
  //   0x100e36-0x100e48: this->timeRange.start = *(CMTime*)(scene + 0x480)
  //                       (movups reads 16 bytes @+0x480; movq reads 8 bytes @+0x490 →
  //                        together == a 24-byte CMTime at offsets +0x480..+0x497)
  //   0x100e4c-0x100e5e: this->timeRange.duration = *(CMTime*)(scene + 0x498)
  //   0x100e62-0x100e65: rax = scene->getPlayRange() — returns PCTimeRange*
  //   0x100e6a-0x100e87: this->playRange.start    = *(CMTime*)(rax + 0x00)
  //                     this->playRange.duration = *(CMTime*)(rax + 0x18)
  //   0x100e8b:         this->rangeType = arg (edx)
  constructor(scene: OZScene, rangeType: OZSceneRangeType) {
    this.rangeType = rangeType;
    // The two frontier reads (scene+0x480 + scene.getPlayRange()) are undecoded — we throw
    // here so the demand signal is filed, matching the "faithful port never fabricates"
    // requirement. The field DEFAULTS above are the observable pre-throw state.
    throw new Error(
      "OZSceneRangeUndo ctor unimplemented — needs OZScene+0x480 PCTimeRange field " +
        "(read @0x100e36) and OZScene::getPlayRange() " +
        "@__ZNK7OZScene12getPlayRangeEv (call @0x100e65). Neither is ported yet." +
        ` [scene=${scene === null ? "null" : "handle"}]`,
    );
  }

  // OZSceneRangeUndo::~OZSceneRangeUndo() @0x100f20 (D2) and @0x100f30 (D1).
  //   pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq
  // Empty — the struct has no owning pointers, only value-typed PCTimeRange snapshots.
  destroy(): void {
    // No fields to destroy — PCTimeRange contents are pure-value CMTime pairs, GC handles.
  }

  // OZSceneRangeUndo::~OZSceneRangeUndo() @0x100f40 (D0 — deleting).
  //   pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; jmp __ZdlPv
  // Same empty body plus tail-jmp to operator delete(this).
  deleteThis(): void {
    // 0x100f45: operator delete(this) — no-op in TS (GC).
  }

  // OZSceneRangeUndo::Swap() @0x100f50 — virtual "apply/unapply" hook.
  //   0x100f60-0x100f6a: doc = _theApp->getCurrentDoc().doc          # r14
  //   0x100f73-0x100f76: if (!doc) skip everything (jmp epilogue @0x101044)
  //   0x100f80-0x100f84: if (this->rangeType != 0) skip timeRange branch (jmp @0x100fe0)
  //
  //   --- timeRange branch (only when rangeType == 0) ---
  //   0x100f86-0x100fb0: local = *(PCTimeRange*)(doc + 0x480)         # a 48-byte snapshot
  //                     (2 × 24-byte reads into -0x50(%rbp)/-0x40(%rbp)/(%r15)/0x10(%r15))
  //   0x100fb4-0x100fbb: doc->setTimeRange(&this->timeRange)          # apply OUR snapshot
  //   0x100fc0-0x100fdc: this->timeRange = local                      # save doc's OLD range
  //
  //   --- playRange branch (unconditional) ---
  //   0x100fe0-0x100fe3: rax = doc->getPlayRange() — returns PCTimeRange*
  //   0x100fe8-0x101003: local = *rax                                 # snapshot doc's playRange
  //   0x101007-0x10100e: doc->setPlayRange(&this->playRange)          # apply OUR snapshot
  //   0x101013-0x10102f: this->playRange = local                      # save doc's OLD range
  //
  //   0x101033-0x10103a: rdi = *(u64*)(doc + 0x588); esi = 0x1000
  //   0x10103f:          TAIL-CALL OZDocument::postNotification(rdi, 0x1000)
  //
  // Note the timeRange branch reads the DOC (r14) at +0x480, not the OZScene — but doc is
  // returned as an OZDocument*, and OZDocument's +0x480 is the SAME PCTimeRange field that
  // OZScene exposes (either OZDocument extends OZScene, or the fields are colocated). The
  // ctor took an OZScene* also at rsi and read +0x480 the same way — the two share this slot.
  swap(): void {
    throw new Error(
      "OZSceneRangeUndo::Swap unimplemented — needs _theApp, " +
        "OZApplication::getCurrentDoc @0x100f6a, doc+0x480 PCTimeRange field, " +
        "OZScene::setTimeRange @0x100fbb, OZScene::getPlayRange @0x100fe3, " +
        "OZScene::setPlayRange @0x10100e, and OZDocument::postNotification(0x1000) " +
        "@0x10103f. The rangeType==0 check @0x100f80 gates the timeRange half.",
    );
  }
}
