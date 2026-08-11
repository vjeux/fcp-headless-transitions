// raw-port/src/nodes/OZCanvasState.ts
//
// FCP class `OZCanvasState` (Ozone.framework, x86_64) — the tiny serializable
// record that persists the document Canvas's UI state (which layout is shown
// and which view is active) inside a Motion/FCP scene file. It is a
// PCSerializer subclass with exactly two POD fields and no other state.
//
// Symbols transcribed here (Ozone.framework, x86_64):
//   0x487e70  OZCanvasState::OZCanvasState()   [C1 — complete object constructor]
//             __ZN13OZCanvasStateC1Ev
//
// Source disassembly (dumped via raw-port/tools/disasm.sh --sym … Ozone):
//   raw-port/re/disasm/__ZN13OZCanvasStateC1Ev.s
//
// NOT transcribed here — each is its own ledger unit, left absent rather than stubbed:
//   0x487e50  OZCanvasState::OZCanvasState()            [C2 base-object ctor]
//   0x487e90  OZCanvasState::OZCanvasState(OZCanvasState const&)  [C2 copy ctor]
//   0x487eb0  OZCanvasState::OZCanvasState(OZCanvasState const&)  [C1 copy ctor]
//   0x487ed0  OZCanvasState::writeHeader(PCSerializerWriteStream&, bool)
//   0x487f10  OZCanvasState::writeBody(PCSerializerWriteStream&, bool, bool, bool)
//   0x487f90  OZCanvasState::markFactoriesForSerialization(PCSerializerWriteStream&, bool)
//   0x487fa0  OZCanvasState::parseBegin(PCSerializerReadStream&)
//   0x487fc0  OZCanvasState::parseEnd(PCSerializerReadStream&)
//   0x487fd0  OZCanvasState::parseElement(PCSerializerReadStream&, PCStreamElement&)
//   0x488020  OZCanvasState::~OZCanvasState()  [D1]   /  0x488030  [D0]
//
// ── STRUCT LAYOUT: OZCanvasState (complete — 0x10 bytes) ───────────────────
//   +0x00 : vptr   — `leaq 0x3e2c55(%rip), %rax ; movq %rax, (%rdi)`
//                    @Ozone 0x487e74/0x487e7b. The RIP-relative target resolves to
//                    0x487e7b + 0x3e2c55 = 0x86aad0, which is
//                    `__ZTV13OZCanvasState` (@Ozone 0x86aac0) + 0x10 — i.e. the
//                    standard "vtable for OZCanvasState, past the RTTI/offset-to-top
//                    pair". Modelled implicitly by the TS class identity.
//   +0x08 : layout     : i32
//   +0x0c : activeView : i32
//
// Both data fields are 32 bits wide, read and written with `movl` on both sides of
// serialization — never `movq`:
//   writeBody   @Ozone 0x487f2f  movl 0x8(%r14), %r15d   (then element tag 1)
//               @Ozone 0x487f56  movl 0xc(%r14), %r14d   (then element tag 2)
//   parseElement@Ozone 0x487ff6  movl %eax, 0x8(%rbx)    (when tag == 1)
//               @Ozone 0x48800b  movl %eax, 0xc(%rbx)    (when tag == 2)
//
// ── SCOPE / ELEMENT-TAG TABLE ──────────────────────────────────────────────
// Every parse/write hook pushes the static scope `__ZL18OZCanvasStateScope`
// (`leaq __ZL18OZCanvasStateScope(%rip), %rsi` @Ozone 0x487ed9 / 0x487f20). Its tag
// table is already transcribed in raw-port/src/infra/elementTags.ts:
//
//   "OZCanvasStateScope": { "layout": 1, "activeView": 2, "canvas": 84 }
//
// which is what NAMES the two fields above rather than leaving them as offsets:
// parseElement dispatches tag 1 into +0x08 and tag 2 into +0x0c (see the `movl`s
// cited above), and writeHeader emits the container element with tag
// `movl $0x54, %esi` @Ozone 0x487eee — 0x54 = 84 = "canvas".

import { PCSerializer } from "../infra/PCSerializer.js";

/**
 * OZCanvasState — persisted Canvas UI state (layout + active view).
 *
 * @provenance Ozone @0x487e70 (C1 ctor). Struct is 0x10 bytes:
 *   vptr @+0x00 + i32 layout @+0x08 + i32 activeView @+0x0c.
 */
export class OZCanvasState extends PCSerializer {
  /**
   * +0x08 — `layout`, element tag 1 of OZCanvasStateScope.
   *
   * @provenance Ozone @0x487f2f `movl 0x8(%r14), %r15d` (writeBody reads it and
   *   emits it under tag 1), @0x487ff6 `movl %eax, 0x8(%rbx)` (parseElement
   *   stores tag 1 here). Initialized to 1 by the ctor below (@0x487e7e).
   */
  layout: number;

  /**
   * +0x0c — `activeView`, element tag 2 of OZCanvasStateScope.
   *
   * @provenance Ozone @0x487f56 `movl 0xc(%r14), %r14d` (writeBody reads it and
   *   emits it under tag 2), @0x48800b `movl %eax, 0xc(%rbx)` (parseElement
   *   stores tag 2 here). Initialized to 0 by the ctor below (@0x487e7e).
   */
  activeView: number;

  /**
   * OZCanvasState::OZCanvasState() @Ozone 0x487e70  [C1 — complete object ctor].
   * Mangled: __ZN13OZCanvasStateC1Ev
   *
   * Faithful transcription — the whole body is six instructions:
   *
   *   0x487e70  pushq %rbp                      ; frame setup, no semantic effect
   *   0x487e71  movq  %rsp, %rbp                ; frame setup, no semantic effect
   *   0x487e74  leaq  0x3e2c55(%rip), %rax      ; rax = 0x86aad0 = __ZTV13OZCanvasState + 0x10
   *   0x487e7b  movq  %rax, (%rdi)              ; this->vptr = that vtable slot
   *   0x487e7e  movq  $0x1, 0x8(%rdi)           ; ONE 8-byte store covering BOTH data fields
   *   0x487e86  popq  %rbp
   *   0x487e87  retq
   *
   * The single `movq $0x1, 0x8(%rdi)` at 0x487e7e is the compiler fusing the two
   * 32-bit member initializers into one quadword store: x86 is little-endian, so
   * the low 4 bytes (+0x08 = `layout`) receive 1 and the high 4 bytes
   * (+0x0c = `activeView`) receive 0. It is NOT a 64-bit field — every other
   * accessor touches these two slots separately with `movl` (see the layout table
   * in this file's header). The copy ctor at 0x487e9e likewise moves both fields
   * as one `movq 0x8(%rsi), %rax`, which is the same fusion on the copy path.
   *
   * The vptr store is reproduced implicitly: in TS the class identity carries the
   * dispatch, so there is no field to assign for +0x00.
   */
  constructor() {
    // @0x487e74/0x487e7b — vptr := __ZTV13OZCanvasState + 0x10 (implicit in TS).
    super();
    // @0x487e7e — movq $0x1, 0x8(%rdi): low half of the quad store.
    this.layout = 1;
    // @0x487e7e — high half of the SAME quad store: activeView := 0.
    this.activeView = 0;
  }
}
