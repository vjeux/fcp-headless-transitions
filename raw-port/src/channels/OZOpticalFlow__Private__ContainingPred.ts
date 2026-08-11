// OZOpticalFlow__Private__ContainingPred.ts — raw transcription of Ozone
// `OZOpticalFlow::Private::ContainingPred`.
//
// A two-field std::find_if predicate used by the optical-flow analyzer to find
// the job that contains a given OZImageElement while EXCLUDING one job id (see
// the operator() evidence below — it early-outs when the candidate job's id
// equals the stored id). AnalyzerImpl::findJobContainingImageElement
// @Ozone 0x4dcfa0 takes exactly that (element, JobID) pair.
//
// The file is named `Outer__Inner` after the nested class, matching the landed
// convention (OZOpticalFlow__Private__JobIDPred.ts,
// OZOpticalFlow__Private__CacheFileHeader.ts, PCEvictionHeap__EquivalenceKey.ts).
//
// Provenance (Ozone framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Symbol ported in this file:
//   @0x4eca40  ContainingPred::ContainingPred(OZImageElement*, OZOpticalFlow::JobID)  [C1]
//              __ZN13OZOpticalFlow7Private14ContainingPredC1EP14OZImageElementNS_5JobIDE
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym <mangled> Ozone`):
//   raw-port/re/disasm/__ZN13OZOpticalFlow7Private14ContainingPredC1EP14OZImageElementNS_5JobIDE.s  (7 lines)
//
// NOT ported here — separate ledger units, deliberately absent rather than stubbed:
//   @0x4eca30  ContainingPred::ContainingPred(OZImageElement*, JobID)  [C2 base ctor,
//              byte-identical body at a distinct exported symbol]
//   @0x4eca50  ContainingPred::operator()(JobImpl const&) const — calls
//              OZOpticalFlow::operator!= then walks a red-black tree; its own unit.
//
// ---------------------------------------------------------------------------
// LAYOUT — recovered from the ctor's two stores and corroborated by operator()
// (that sibling body is EVIDENCE for the field TYPES, not a port):
//
//   struct ContainingPred {          // 0x10 bytes (0x8 pointer + 0x4 id + 0x4 tail padding)
//     OZImageElement* element;       // +0x00  ctor `movq %rsi,(%rdi)`  @0x4eca44
//     OZOpticalFlow::JobID jobId;    // +0x08  ctor `movl %edx,0x8(%rdi)` @0x4eca47
//   };
//
// Why +0x08 is a JobID and not a bare u32: operator() @0x4eca5d does
// `leaq 0x8(%rdi), %rsi` and passes THAT ADDRESS as the `JobID const&` second
// argument of `OZOpticalFlow::operator!=(JobID const&, JobID const&)`
// (call @0x4eca64). JobID is the 4-byte one-field POD already transcribed in
// OZOpticalFlow.ts (its operator== @0x4e9c00 compares a single u32 at offset 0),
// which is exactly what `movl` stores here.
//
// Why +0x00 is the element pointer: it is written from %rsi, the
// `OZImageElement*` parameter, with a full 8-byte `movq`; operator() later
// reloads it with `movq (%r14), %rdx` @0x4eca7a and uses it as the search key
// for the tree walk.

import type { JobID } from "./OZOpticalFlow.js";
import type { OZImageElement } from "../nodes/OZImageElement.js";

export class OZOpticalFlow__Private__ContainingPred {
  /**
   * +0x00 — the OZImageElement being searched for. Stored unretained: the ctor
   * performs a plain `movq` with no retain/addRef call anywhere in the body.
   */
  element: OZImageElement;

  /**
   * +0x08 — the JobID the predicate EXCLUDES (see the file header: operator()
   * takes the address of this field as a `JobID const&`).
   */
  jobId: JobID;

  /**
   * `ContainingPred::ContainingPred(OZImageElement*, OZOpticalFlow::JobID)`
   * — @Ozone 0x4eca40  [C1 — complete object constructor]
   *   __ZN13OZOpticalFlow7Private14ContainingPredC1EP14OZImageElementNS_5JobIDE
   *
   * FULL DISASM (6 lines — raw-port/re/disasm/
   * __ZN13OZOpticalFlow7Private14ContainingPredC1EP14OZImageElementNS_5JobIDE.s):
   *
   *   0x4eca40  pushq %rbp                  ; prologue
   *   0x4eca41  movq  %rsp, %rbp
   *   0x4eca44  movq  %rsi, (%rdi)          ; this->element = arg0  (8-byte store)
   *   0x4eca47  movl  %edx, 0x8(%rdi)       ; this->jobId   = arg1  (4-byte store)
   *   0x4eca4a  popq  %rbp
   *   0x4eca4b  retq
   *   0x4eca4c  nopl  (%rax)                ; alignment padding, not executed
   *
   * Decode notes:
   *   * The JobID parameter is passed BY VALUE in %edx — a 4-byte register, not
   *     a pointer — which is why the store is `movl` and why the struct's second
   *     field is 4 bytes wide even though it is a class type. The port copies
   *     the id out of the argument rather than aliasing the caller's object,
   *     matching pass-by-value.
   *   * The two stores leave +0x0c untouched: that is C++ tail padding for the
   *     8-byte alignment of the leading pointer, not a field.
   *   * No vtable store — ContainingPred is not polymorphic (no
   *     `leaq …vtable…(%rip)` in the body) — and no zero-init of anything else.
   *   * ZERO callees: no in-scope call, no extern, no indirect or virtual
   *     dispatch.
   *
   * @param element the OZImageElement* passed in %rsi
   * @param jobId   the JobID passed by value in %edx
   */
  constructor(element: OZImageElement, jobId: JobID) {
    // @0x4eca44  movq %rsi, (%rdi)
    this.element = element;
    // @0x4eca47  movl %edx, 0x8(%rdi) — a 32-bit copy of the by-value JobID.
    this.jobId = { id: jobId.id >>> 0 };
  }
}
