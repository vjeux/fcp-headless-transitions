// FFOZBlindDataCustomUIChannelInfo — Flexo class: an OZChannelInfo specialization
// that additionally embeds a PCSingleton subobject at offset +0x50. Its exported
// symbol surface is exactly the Itanium ABI destructor pair — no ctor, no other
// methods — so what we can decode faithfully IS just the two dtor bodies (D1 and
// D0), which do the compiler-synthesized chained-base destruction:
//
//   1. call PCSingleton::~PCSingleton() (D2, base-subobject variant) on the
//      embedded PCSingleton at (this + 0x50), then
//   2. call OZChannelInfo::~OZChannelInfo() (D2, base-object variant) on `this`
//      itself (offset 0),
//   3. only in D0 (deleting dtor variant) additionally call operator delete
//      on `this` (__ZdlPv).
//
// The class exposes NO ctor / accessor / behavior methods in Flexo's export
// table — its whole decoded surface here is the dtor pair. This is common for
// singleton-info descriptor classes whose bodies live entirely in the framework
// they specialize (OZChannel*Info-style factories construct instances via base
// ctors + PCSingleton registration; there is no per-class body to transcribe).
//
// Source disassembly (dumped via raw-port/tools/disasm.sh):
//   __ZN32FFOZBlindDataCustomUIChannelInfoD1Ev @0x00000000002197b0 (complete-object dtor)
//   __ZN32FFOZBlindDataCustomUIChannelInfoD0Ev @0x00000000002197d0 (deleting dtor)
//   Framework: Flexo.framework
//
// DECODE — struct layout (recovered from the dtor accesses):
//   +0x00  OZChannelInfo  base       // the OZChannelInfo base subobject. Its own
//                                    // layout is fully decoded in
//                                    // raw-port/src/channels/OZChannelInfo.ts.
//                                    // Read here as %rbx (== %rdi on entry), then
//                                    // passed as %rdi to OZChannelInfo::~D2 in
//                                    // both dtors:
//                                    //   D1 @0x2197c2 movq %rbx,%rdi ; @0x2197cb
//                                    //      jmp OZChannelInfo::~D2 (tail-jump)
//                                    //   D0 @0x2197e2 movq %rbx,%rdi ; @0x2197e5
//                                    //      callq OZChannelInfo::~D2
//   +0x50  PCSingleton    singleton  // an embedded PCSingleton subobject. This is
//                                    // the ONLY per-class field beyond the base.
//                                    // Both dtors compute its address via
//                                    //   addq $0x50, %rdi   (@0x2197b9 D1 / @0x2197d9 D0)
//                                    // and then call PCSingleton::~D2 via the
//                                    // stub  callq 0x1495ff4 (@0x2197bd D1 /
//                                    // @0x2197dd D0). No other offset is
//                                    // touched by either dtor body — no per-
//                                    // class data-members exist beyond
//                                    // this PCSingleton.
//
// sizeof(FFOZBlindDataCustomUIChannelInfo) is NOT decodable from the dtors
// alone: they only touch +0x00 (base) and +0x50 (PCSingleton). The tail size
// is set by whatever OZChannelInfo::sizeof + PCSingleton::sizeof + any
// alignment padding yield in the actual class layout, which would require
// the ctor (not present in the export table) to observe directly. We record
// the two decoded offsets and no more, per decode-before-implement.
//
// Frontier callees (all called via symbol-stub jmps/callqs — the stub target
// resolves to the exported symbol name; a stub jmp/callq is a normal PLT-style
// import redirection, semantically identical to a direct callq for our purposes):
//   PCSingleton::~PCSingleton() (D2)   symbol stub 0x1495ff4  called @0x2197bd (D1) / @0x2197dd (D0)
//   OZChannelInfo::~OZChannelInfo() (D2) symbol stub 0x14962c4  called @0x2197cb (D1 tail-jmp) / @0x2197e5 (D0 call)
//   operator delete (__ZdlPv)            symbol stub 0x1497404  called @0x2197f3 (D0 tail-jmp)

import { PCSingleton } from "../infra/PCSingleton";
import { OZChannelInfo } from "./OZChannelInfo";

/**
 * `operator delete(void*)` — libc++ / system runtime allocator hook. Tail-jumped
 * from D0 @0x2197f3 via  jmp 0x1497404 (symbol stub for __ZdlPv). Not modeled in
 * TS (GC handles freeing). Throwing stub keeps the call site honest.
 */
function operator_delete(_p: FFOZBlindDataCustomUIChannelInfo): void {
  // jmpq 0x1497404 (symbol stub for __ZdlPv)  @0x2197f3
  throw new Error(
    "operator delete (__ZdlPv) not modeled in the TS port; JS/TS objects are GC'd. Cited call site: FFOZBlindDataCustomUIChannelInfo::~FFOZBlindDataCustomUIChannelInfo() D0 @0x2197f3"
  );
}

/**
 * FFOZBlindDataCustomUIChannelInfo — Flexo class, decoded surface = dtor pair.
 *
 * Modeled as a plain class that *contains* an OZChannelInfo base subobject
 * (rather than `extends OZChannelInfo`) because the Flexo class's only exported
 * body is the dtor chain: we have not observed a ctor that would let us
 * faithfully transcribe base-class initialization here. The composition-not-
 * inheritance modeling makes the "delegate to base D2" step explicit and
 * lossless: it exactly mirrors  callq OZChannelInfo::~D2  in the asm.
 */
export class FFOZBlindDataCustomUIChannelInfo {
  /** +0x00 OZChannelInfo base subobject — see the class-header decode block. */
  readonly base: OZChannelInfo;

  /** +0x50 PCSingleton subobject — the class's only per-instance field beyond
   *  the base. Its address is what  addq $0x50, %rdi  (D1 @0x2197b9 /
   *  D0 @0x2197d9) computes before the PCSingleton::~D2 callq. */
  readonly singleton: PCSingleton;

  constructor(base: OZChannelInfo, singleton: PCSingleton) {
    // No ctor is exported for FFOZBlindDataCustomUIChannelInfo in Flexo's
    // symbol table (only D1/D0 are). We therefore do NOT transcribe any
    // decoded ctor body here — the caller provides the pre-constructed base
    // and singleton subobjects, matching the Itanium ABI convention that a
    // subclass's ctor is responsible for running base + member ctors before
    // its own body executes.
    this.base = base;
    this.singleton = singleton;
  }

  /**
   * ~FFOZBlindDataCustomUIChannelInfo — Itanium ABI D1 (complete-object destructor).
   * Faithful transcription of __ZN32FFOZBlindDataCustomUIChannelInfoD1Ev @0x2197b0.
   *
   * Body, byte-for-byte:
   *   @0x2197b0..@0x2197b5  standard prologue (pushq %rbp / movq %rsp,%rbp /
   *                         pushq %rbx / pushq %rax — 8-byte spill for align).
   *   @0x2197b6             movq %rdi, %rbx                — save `this`.
   *   @0x2197b9             addq $0x50, %rdi               — %rdi = &this->singleton.
   *   @0x2197bd             callq 0x1495ff4 (stub __ZN11PCSingletonD2Ev)
   *                                                        — destroy embedded PCSingleton.
   *   @0x2197c2             movq %rbx, %rdi                — %rdi = `this`.
   *   @0x2197c5..@0x2197ca  epilogue (addq $0x8,%rsp / popq %rbx / popq %rbp).
   *   @0x2197cb             jmp 0x14962c4 (stub __ZN13OZChannelInfoD2Ev)
   *                                                        — tail-jump to base D2.
   *
   * The tail `jmp` (not `call`) means D1 == "own body + control transfer to
   * base D2 as if the current stack frame had never existed". In TS we sequence
   * the two steps as ordinary calls in order.
   */
  __dtor_D1(): void {
    // @0x2197bd — PCSingleton::~PCSingleton() (D2 base-subobject dtor) on
    // the embedded singleton at +0x50.  Using PCSingleton.destroy() which is
    // the raw-port's transcription of the same D2 body (see
    // raw-port/src/infra/PCSingleton.ts).
    this.singleton.destroy();

    // @0x2197cb — tail-jmp to OZChannelInfo::~OZChannelInfo() (D2 base-object
    // dtor) on `this`.  Using OZChannelInfo.destroy() which is the raw-port's
    // transcription of the same D2 body (see raw-port/src/channels/OZChannelInfo.ts).
    this.base.destroy();
  }

  /**
   * ~FFOZBlindDataCustomUIChannelInfo — Itanium ABI D0 (deleting destructor).
   * Faithful transcription of __ZN32FFOZBlindDataCustomUIChannelInfoD0Ev @0x2197d0.
   *
   * Structurally identical to D1 (same PCSingleton::~D2 + OZChannelInfo::~D2
   * sequence, matching the asm one-for-one at @0x2197d9/@0x2197dd for the
   * singleton destroy and @0x2197e2/@0x2197e5 for the base destroy). Differs
   * only in the tail: instead of tail-JUMPING to OZChannelInfo::~D2, D0 CALLS
   * OZChannelInfo::~D2 @0x2197e5 (returns), then tail-jumps to `operator
   * delete(this)` (__ZdlPv) at @0x2197f3.
   *
   * In TS the "operator delete" step has no observable counterpart (garbage
   * collection handles storage reclamation), but we invoke the stubbed
   * `operator_delete` anyway — its throw documents that the C++ ABI expected
   * the object's storage to be returned to the allocator at exactly this
   * point, and any caller that relies on D0 to actually free memory is buggy
   * against the TS port.
   */
  __dtor_D0(): void {
    // @0x2197dd — PCSingleton::~PCSingleton() (D2) on +0x50.
    this.singleton.destroy();

    // @0x2197e5 — OZChannelInfo::~OZChannelInfo() (D2) on `this`.
    this.base.destroy();

    // @0x2197f3 — tail-jmp to operator delete(this).
    operator_delete(this);
  }
}

