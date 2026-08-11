// raw-port/src/channels/OZOpticalFlow_Private_ElementMatchesPred.ts
//
// FCP class `OZOpticalFlow::Private::ElementMatchesPred` (Ozone.framework,
// x86_64) — a one-pointer std::find_if predicate used by the optical-flow
// analyzer to locate the job that references a given OZImageElement.
//
// Symbols transcribed here (Ozone.framework, x86_64):
//   0x4ec980  ElementMatchesPred::ElementMatchesPred(OZImageElement*)  [C1, complete object ctor]
//             __ZN13OZOpticalFlow7Private18ElementMatchesPredC1EP14OZImageElement
//
// Source disassembly (dumped via raw-port/tools/disasm.sh --sym … Ozone):
//   raw-port/re/disasm/__ZN13OZOpticalFlow7Private18ElementMatchesPredC1EP14OZImageElement.s
//
// NOT transcribed here — each is its own ledger unit and must not be faked:
//   0x4ec970  ElementMatchesPred::ElementMatchesPred(OZImageElement*)  [C2, base object ctor]
//             Byte-for-byte identical to C1 (`movq %rsi, (%rdi)` @0x4ec974), as is normal for
//             a class with no virtual bases — but it is a DISTINCT exported symbol and a
//             distinct ledger entry, so it is left for its own unit rather than aliased here.
//   0x4ec990  ElementMatchesPred::operator()(JobImpl const&) const
//             Walks the job's std::set at JobImpl+0x18 (a red-black tree lower_bound over
//             node key +0x20) after an early-out on JobImpl.state == 2; that traversal is a
//             separate unit and is deliberately absent rather than stubbed.
//
// ── STRUCT LAYOUT: OZOpticalFlow::Private::ElementMatchesPred ───────────────
// Recovered from the ctor itself, which performs exactly one store:
//
//   +0x00 : element : OZImageElement*   — `movq %rsi, (%rdi)` @Ozone 0x4ec984
//
// sizeof is 8 (one pointer): the ctor writes nothing else, and operator()
// @0x4ec9ad reads the object back with a single `movq (%rdi), %rdx`, i.e. the
// same lone slot at +0x00 and no other field.

import type { OZImageElement } from "../nodes/OZImageElement.js";

export class OZOpticalFlow_Private_ElementMatchesPred {
  /**
   * +0x00 — OZImageElement* the predicate matches against. Stored unretained:
   * the ctor's single instruction (`movq %rsi, (%rdi)` @Ozone 0x4ec984) is a
   * plain pointer store with no retain/addRef call anywhere in the body.
   */
  element: OZImageElement;

  /**
   * OZOpticalFlow::Private::ElementMatchesPred::ElementMatchesPred(OZImageElement*)
   * @Ozone 0x4ec980  [C1 — complete object constructor].
   * Mangled: __ZN13OZOpticalFlow7Private18ElementMatchesPredC1EP14OZImageElement
   *
   * Faithful transcription — the whole body is five instructions:
   *
   *   0x4ec980  pushq %rbp             ; frame setup, no semantic effect
   *   0x4ec981  movq  %rsp, %rbp       ; frame setup, no semantic effect
   *   0x4ec984  movq  %rsi, (%rdi)     ; this->element = argument
   *   0x4ec987  popq  %rbp
   *   0x4ec988  retq
   *
   * There is no vtable store (the class is not polymorphic — no `leaq
   * vtable…(%rip)` appears in the body), no zero-init of any further slot, and
   * no ownership call: the object is exactly one raw pointer.
   *
   * @param element  the OZImageElement* passed in %rsi
   */
  constructor(element: OZImageElement) {
    // movq %rsi, (%rdi) @0x4ec984 — the only store in the function.
    this.element = element;
  }
}
