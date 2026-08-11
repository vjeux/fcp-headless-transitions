// OZOpticalFlow__Private__JobIDPred.ts — raw transcription of Ozone
// `OZOpticalFlow::Private::JobIDPred`.
//
// A one-field predicate functor: it captures an `OZOpticalFlow::JobID` so it can
// later be matched against the job records the optical-flow analyzer keeps
// (the classic `std::find_if(..., JobIDPred(id))` shape). ONE symbol is
// transcribed here — the complete-object constructor. The call operator and any
// other member are SEPARATE ledger units and are NOT ported here; do not add
// them without their own disassembly and address citations.
//
// The file is named `Outer__Inner` after the nested class, matching the landed
// convention for nested types (PCBezierNamespace__SampledContour.ts,
// PCEvictionHeap__EquivalenceKey.ts, OZChannelColor__OZChannelColor_alphaInfo.ts).
//
// Provenance (Ozone framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Symbol ported in this file:
//   @0x4eca00  OZOpticalFlow::Private::JobIDPred::JobIDPred(OZOpticalFlow::JobID)
//                __ZN13OZOpticalFlow7Private9JobIDPredC1ENS_5JobIDE   [Itanium C1]
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym __ZN13OZOpticalFlow7Private9JobIDPredC1ENS_5JobIDE Ozone`):
//   raw-port/re/disasm/__ZN13OZOpticalFlow7Private9JobIDPredC1ENS_5JobIDE.s (7 lines)
//
// ---------------------------------------------------------------------------
// LAYOUT
// ---------------------------------------------------------------------------
//   struct JobIDPred {
//     uint32_t jobId;    // +0x00 — the ONLY field this ctor writes
//                        //   (`movl %esi,(%rdi)` @0x4eca04, a 32-bit store)
//   };
//
// The argument is an `OZOpticalFlow::JobID` passed BY VALUE. JobID is a 4-byte
// POD whose single u32 field lives at +0x00 — proven by the landed
// `OZOpticalFlow::operator==` @0x4e9c00 / `operator!=` @0x4e9c10 ports (each does
// one 32-bit load from offset 0 of both arguments), which is why the whole
// struct arrives in the low half of a single register (%esi) and one `movl`
// stores it.
//
// C1 vs C2: the base-object ctor `__ZN13OZOpticalFlow7Private9JobIDPredC2ENS_5JobIDE`
// @0x4ec9f0 is a SEPARATELY EMITTED body with the IDENTICAL three instructions
// (`pushq %rbp ; movq %rsp,%rbp ; movl %esi,(%rdi)`). It is its own ledger unit
// and is NOT ported here; it is cited only as corroboration that the object has
// no base class and no vtable (neither body writes a vptr or calls anything).
//
// CALLEES: none. No in-scope call, no extern, no allocation, no indirect or
// virtual dispatch (`depgraph.py deps` lists nothing).

import type { JobID } from "./OZOpticalFlow.js";

/**
 * `OZOpticalFlow::Private::JobIDPred` — the captured-JobID predicate functor.
 *
 * Only the field this ctor writes is modelled.
 *
 * @Ozone 0x4eca00
 */
export class OZOpticalFlow__Private__JobIDPred {
  /**
   * +0x00 — the captured job id (u32).
   *
   * Written by the ctor's single `movl %esi,(%rdi)` @0x4eca04. A 32-bit store,
   * so the value is the JobID's `id` word, not a pointer.
   */
  jobId = 0;

  /**
   * `OZOpticalFlow::Private::JobIDPred::JobIDPred(OZOpticalFlow::JobID)` [C1]
   *   — @Ozone 0x4eca00
   *   — __ZN13OZOpticalFlow7Private9JobIDPredC1ENS_5JobIDE
   *
   * Full transcription — every instruction, in order:
   *
   *   0x4eca00  pushq %rbp                  ; frame setup (no TS counterpart)
   *   0x4eca01  movq  %rsp,%rbp             ; frame setup (no TS counterpart)
   *   0x4eca04  movl  %esi,(%rdi)           ; this->jobId = id  (32-bit store)
   *   0x4eca06  popq  %rbp                  ; frame teardown (no TS counterpart)
   *   0x4eca07  retq
   *   0x4eca08  nopl  (%rax,%rax)           ; alignment padding, not executed
   *
   * Decode notes:
   *   * the by-value `JobID` occupies one register half (%esi) because it is a
   *     4-byte POD — see the file header for the operator==/!= evidence that
   *     pins its single u32 at +0x00.
   *   * the store is `movl`, i.e. 32-bit: the port keeps the value as a
   *     `number` and does not widen it.
   *   * nothing else is written — no vptr, no second field, no call.
   *
   * @param id the JobID to capture (`%esi`).
   */
  constructor(id: JobID) {
    // @0x4eca04  movl %esi,(%rdi)
    this.jobId = id.id;
  }
}
