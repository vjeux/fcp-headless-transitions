// raw-port/src/channels/OZChannelAngleImpl.ts
//
// FCP `OZChannelAngleImpl` — the concrete Impl subclass under an
// `OZChannelAngle` (e.g. wired at OZChannelAngle::createOZChannelAngleImpl()
// singletons in the family). Adds a PCSingleton subobject at +0x28 to the
// base OZChannelImpl layout — nothing else. All enumerated methods here are
// destructors.
//
// Framework: ProChannel (x86_64 slice; slice offset 0x4000).
// Provenance: raw-port/re/disasm/ProChannel.OZChannelAngleImpl.~OZChannelAngleImpl.s
//   (extracted via raw-port/tools/disasm.sh OZChannelAngleImpl "~OZChannelAngleImpl"
//    ProChannel; only the D0 body lands there because otool -tV picks the last
//    label — the D1 body @0x84c5c..0x84c77 is quoted verbatim in the header
//    below, cross-checked against /tmp/ProChannel_tV.txt).
//
// Enumerated methods:
//   OZChannelAngleImpl::~OZChannelAngleImpl() [D1 non-deleting]  @ProChannel 0x00084c5c
//     (__ZN18OZChannelAngleImplD1Ev)
//   OZChannelAngleImpl::~OZChannelAngleImpl() [D0 deleting]      @ProChannel 0x00084c7c
//     (__ZN18OZChannelAngleImplD0Ev)
//
// STRUCT LAYOUT (recovered from both D1 and D0 — the only fields touched are
// the embedded PCSingleton at +0x28; everything else is inherited from
// OZChannelImpl and destructed by its base dtor):
//   +0x00..+0x28  OZChannelImpl base subobject (opaque here; owns the vptr,
//                   curve*/value/uint/bool fields per the sibling ports —
//                   see the OZChannelDecibel createOZChannelDecibelImpl
//                   lambda decode in raw-port/src/channels/OZChannelDecibel.ts
//                   for the layout it constructs).
//   +0x28..+0x38  PCSingleton subobject (16 bytes; layout decoded in
//                   raw-port/src/infra/PCSingleton.ts). D1 destroys it in
//                   place @0x84c65..0x84c69 by calling
//                   __ZN11PCSingletonD2Ev on `this + 0x28`.
//
// Cross-framework references (all resolved from the disasm + nm outputs):
//   __ZN11PCSingletonD2Ev                       @ ProCore via ProChannel stub 0xacb4c
//                                                  -- PCSingleton::~PCSingleton()
//                                                  called @0x84c69 (D1) and @0x84c89 (D0).
//   __ZN13OZChannelImplD2Ev                     @ ProChannel (extern, not yet enumerated in
//                                                  the ledger as a dedicated class port; the
//                                                  D0/D1/D2 base dtors all exist as symbols
//                                                  per grep on /tmp/ProChannel_symmap.tsv)
//                                                  -- OZChannelImpl::~OZChannelImpl()
//                                                  tail-jmp target @0x84c77 (D1) and
//                                                  direct callq @0x84c91 (D0).
//   __ZdlPv                                     @ ProChannel stub 0xace04
//                                                  -- operator delete(void*) tail-jmp target
//                                                  @0x84c9f (D0 only).
//
// FULL DISASM (D1 lifted from /tmp/ProChannel_tV.txt at 0x84c5c; D0 from the
// disasm.sh output at raw-port/re/disasm/ProChannel.OZChannelAngleImpl.*.s):
//
// D1  @0x84c5c __ZN18OZChannelAngleImplD1Ev:
//   0x84c5c  pushq  %rbp
//   0x84c5d  movq   %rsp, %rbp
//   0x84c60  pushq  %rbx
//   0x84c61  pushq  %rax                        ; 16-byte stack pad
//   0x84c62  movq   %rdi, %rbx                  ; save this
//   0x84c65  addq   $0x28, %rdi                 ; rdi = this + 0x28 (PCSingleton subobject)
//   0x84c69  callq  __ZN11PCSingletonD2Ev       ; PCSingleton::~PCSingleton(this+0x28)
//                                               ; (stub @0xacb4c)
//   0x84c6e  movq   %rbx, %rdi                  ; rdi = this
//   0x84c71  addq   $0x8, %rsp                  ; epilogue
//   0x84c75  popq   %rbx
//   0x84c76  popq   %rbp
//   0x84c77  jmp    __ZN13OZChannelImplD2Ev     ; TAIL-JMP OZChannelImpl::~OZChannelImpl(this)
//
// D0  @0x84c7c __ZN18OZChannelAngleImplD0Ev:
//   0x84c7c  pushq  %rbp
//   0x84c7d  movq   %rsp, %rbp
//   0x84c80  pushq  %rbx
//   0x84c81  pushq  %rax                        ; 16-byte stack pad
//   0x84c82  movq   %rdi, %rbx                  ; save this
//   0x84c85  addq   $0x28, %rdi                 ; rdi = this + 0x28 (PCSingleton subobject)
//   0x84c89  callq  __ZN11PCSingletonD2Ev       ; PCSingleton::~PCSingleton(this+0x28)
//   0x84c8e  movq   %rbx, %rdi                  ; rdi = this
//   0x84c91  callq  __ZN13OZChannelImplD2Ev     ; OZChannelImpl::~OZChannelImpl(this)
//   0x84c96  movq   %rbx, %rdi                  ; rdi = this (for the tail-jmp below)
//   0x84c99  addq   $0x8, %rsp                  ; epilogue
//   0x84c9d  popq   %rbx
//   0x84c9e  popq   %rbp
//   0x84c9f  jmp    __ZdlPv                     ; TAIL-JMP ::operator delete(this)
//                                               ; (stub @0xace04; no-op in TS/GC).
//
// Both bodies are trivial: they destroy the embedded PCSingleton at +0x28
// (which unlinks the singleton entry from the global vector; see
// raw-port/src/infra/PCSingleton.ts destroy()), then invoke the base
// OZChannelImpl destructor. D0 additionally frees the heap allocation via
// ::operator delete — a no-op in TS's GC.

import { PCSingleton } from "../infra/PCSingleton.js";

// -------------------------------- Frontier stubs -------------------------------
//
// The OZChannelImpl base destructor is not yet transcribed — no dedicated
// `raw-port/src/channels/OZChannelImpl.ts` exists at time of writing. We stub
// it here with a throw that cites the D1/D0 call sites (@0x84c77 and @0x84c91)
// so frontier.py can see the gap. Once OZChannelImpl.ts lands, replace this
// import with the real base dtor from that file.

/** OZChannelImpl::~OZChannelImpl() [D2 base] @ProChannel U-extern __ZN13OZChannelImplD2Ev.
 *  Not yet transcribed — call sites @ProChannel 0x84c77 (D1 tail-jmp) and @ProChannel
 *  0x84c91 (D0 direct call). The base dtor releases the OZCurve* / value / uint / bool
 *  fields recorded in raw-port/src/channels/OZChannelDecibel.ts's createOZChannelDecibelImpl
 *  decode (layout is shared across all Impl subclasses); porting requires that file. */
function OZChannelImpl_base_dtor(_self: OZChannelAngleImpl): void {
  throw new Error("OZChannelImpl::~OZChannelImpl() @ProChannel U-extern __ZN13OZChannelImplD2Ev — call sites @ProChannel 0x84c77 (D1 tail-jmp) and @ProChannel 0x84c91 (D0 direct callq); base dtor releases the OZCurve*/value/uint/bool fields common to all Impl subclasses (layout in OZChannelDecibel::createOZChannelDecibelImpl @ProChannel 0x106ce) not yet transcribed");
}

// -----------------------------------------------------------------------------

/**
 * `OZChannelAngleImpl` — extends the OZChannelImpl base with an embedded
 * PCSingleton subobject at +0x28. No public methods beyond the destructors
 * are enumerated for this class in the ProChannel symbol table. TS does not
 * extend a real OZChannelImpl class here for the same reason
 * raw-port/src/channels/OZChannelDecibel.ts does not extend OZChannel
 * (base ctor is a frontier throw — extending would only pull in fields we
 * cannot populate faithfully). We model the PCSingleton subobject as a
 * proper composed field.
 */
export class OZChannelAngleImpl {
  /**
   * (this+0x28) — embedded PCSingleton subobject (16 bytes in C++;
   * modelled as a full PCSingleton instance in TS). Destroyed in place by
   * both D1 (@0x84c69) and D0 (@0x84c89). The C++ ctor for this class is
   * not enumerated — the singleton is presumably constructed in place by
   * the OZChannelImpl ctor family (see the OZChannelDecibel Impl-lambda
   * decode @ProChannel 0x1072e which does the sibling pattern: PCSingleton(0x64)
   * at Impl+0x28); left uninitialised here (constructor not enumerated).
   */
  singleton_at_0x28!: PCSingleton;

  /**
   * `OZChannelAngleImpl::~OZChannelAngleImpl()` [D1 non-deleting] — @ProChannel 0x00084c5c
   * (__ZN18OZChannelAngleImplD1Ev).
   *
   * Faithful transcription of the disassembly quoted in the file header:
   *   1. rbx = this                                @0x84c62
   *   2. PCSingleton::~PCSingleton(this + 0x28)    @0x84c65..0x84c69
   *   3. rdi = this                                @0x84c6e
   *   4. tail-jmp OZChannelImpl::~OZChannelImpl(this)  @0x84c77
   */
  destruct(): void {
    // @0x84c65..0x84c69 — destroy the embedded PCSingleton in place.
    // PCSingleton.destroy() unlinks the entry from the global singletons
    // vector (see raw-port/src/infra/PCSingleton.ts). We do not fabricate
    // the singleton if the field was never initialised (that would be a
    // ctor-uninitialised state which would faithfully crash in C++ too).
    this.singleton_at_0x28.destroy();

    // @0x84c77 — TAIL-JMP OZChannelImpl::~OZChannelImpl(this). Frontier throw.
    OZChannelImpl_base_dtor(this);
  }

  /**
   * `OZChannelAngleImpl::~OZChannelAngleImpl()` [D0 deleting] — @ProChannel 0x00084c7c
   * (__ZN18OZChannelAngleImplD0Ev).
   *
   * Identical to D1 except the base dtor is called (not tail-jmp'd), and the
   * function then tail-jmps ::operator delete(this) to free the heap slot.
   * The operator delete is a no-op in TS's GC.
   *
   *   1. rbx = this                                @0x84c82
   *   2. PCSingleton::~PCSingleton(this + 0x28)    @0x84c85..0x84c89
   *   3. rdi = this                                @0x84c8e
   *   4. callq OZChannelImpl::~OZChannelImpl(this) @0x84c91
   *   5. tail-jmp ::operator delete(this)          @0x84c9f
   */
  deleteDtor(): void {
    // @0x84c85..0x84c89 — same PCSingleton in-place destroy as D1.
    this.singleton_at_0x28.destroy();

    // @0x84c91 — direct callq to the base dtor (NOT tail-jmp, because the
    // D0 body continues with the operator delete). Frontier throw.
    OZChannelImpl_base_dtor(this);

    // @0x84c9f — tail-jmp ::operator delete(this). TS is garbage-collected;
    // this is a genuine no-op.
  }
}
