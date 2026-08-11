// OZOpticalFlow__ProgressControllerFacade.ts — raw transcription of Ozone
// `OZOpticalFlow::ProgressControllerFacade`.
//
// A one-pointer wrapper the optical-flow analyzer hands out so callers can
// reach the progress controller without owning it. ONE symbol is transcribed
// here — the complete-object constructor. `getController()` @0x4b3c80 and the
// C2 ctor @0x4b3c60 are SEPARATE ledger units and are NOT ported here; do not
// add them without their own disassembly and address citations.
//
// The file is named `Outer__Inner` after the nested class, matching the landed
// convention (OZOpticalFlow__Private__JobIDPred.ts,
// OZOpticalFlow__Private__CacheFileHeader.ts).
//
// Provenance (Ozone framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Symbol ported in this file:
//   @0x4b3c70  OZOpticalFlow::ProgressControllerFacade::ProgressControllerFacade(OZOpticalFlowProgressController*)
//                __ZN13OZOpticalFlow24ProgressControllerFacadeC1EP31OZOpticalFlowProgressController
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym __ZN13OZOpticalFlow24ProgressControllerFacadeC1EP31OZOpticalFlowProgressController Ozone`):
//   raw-port/re/disasm/__ZN13OZOpticalFlow24ProgressControllerFacadeC1EP31OZOpticalFlowProgressController.s (6 lines)
//
// ---------------------------------------------------------------------------
// LAYOUT
// ---------------------------------------------------------------------------
//   struct ProgressControllerFacade {
//     OZOpticalFlowProgressController* controller;  // +0x00 — the ONLY field
//   };
//
// Corroborated by the accessor (cited as evidence, NOT transcribed — its own
// ledger unit): `ProgressControllerFacade::getController() const` @0x4b3c80 is
// exactly `movq (%rdi),%rax` @0x4b3c84 — it reads back the same +0x00 slot this
// ctor writes, and nothing else. The C2 base-object ctor @0x4b3c60 is a
// separately emitted body with the identical single store.
//
// The facade does NOT own the controller: the ctor takes a raw pointer, stores
// it verbatim (no retain, no allocation, no null check) and returns.
//
// CALLEES: none. No in-scope call, no extern, no indirect or virtual dispatch
// (`depgraph.py deps` lists nothing).

/**
 * An `OZOpticalFlowProgressController*` as this body sees it: an opaque
 * identity. The controller class is a separate ledger unit and this body never
 * dereferences the pointer — it only stores it — so an opaque reference is
 * exactly what the machine handles here. `null` models a NULL argument, which
 * the ctor accepts without checking.
 *
 * @Ozone 0x4b3c70
 */
export type OZOpticalFlowProgressControllerRef = object;

/**
 * `OZOpticalFlow::ProgressControllerFacade` — the one-pointer progress facade.
 *
 * @Ozone 0x4b3c70
 */
export class OZOpticalFlow__ProgressControllerFacade {
  /**
   * +0x00 — the wrapped controller pointer, stored verbatim by the ctor
   * (`movq %rsi,(%rdi)` @0x4b3c74) and read back by `getController()`
   * @0x4b3c84.
   */
  controller: OZOpticalFlowProgressControllerRef | null = null;

  /**
   * `ProgressControllerFacade::ProgressControllerFacade(OZOpticalFlowProgressController*)`
   * [C1] — @Ozone 0x4b3c70
   *   — __ZN13OZOpticalFlow24ProgressControllerFacadeC1EP31OZOpticalFlowProgressController
   *
   * Full transcription — every instruction, in order:
   *
   *   0x4b3c70  pushq %rbp                ; frame setup (no TS counterpart)
   *   0x4b3c71  movq  %rsp,%rbp           ; frame setup (no TS counterpart)
   *   0x4b3c74  movq  %rsi,(%rdi)         ; this->controller = controller
   *   0x4b3c77  popq  %rbp                ; frame teardown (no TS counterpart)
   *   0x4b3c78  retq
   *   0x4b3c79  nopl  (%rax)              ; alignment padding, not executed
   *
   * Decode notes:
   *   * a single 64-bit store of the incoming pointer — no retain, no
   *     allocation, no NULL check, no vptr (the class has none: neither this
   *     body nor C2 @0x4b3c60 writes one).
   *   * ZERO callees of any kind.
   *
   * @param controller the controller to wrap (`%rsi`), possibly NULL.
   */
  constructor(controller: OZOpticalFlowProgressControllerRef | null) {
    // @0x4b3c74  movq %rsi,(%rdi)
    this.controller = controller;
  }
}
