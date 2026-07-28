// OZChannelAffectedNodesInfo.ts — channel-info subclass that also owns a PCSingleton at +0x50.
// Faithfully transcribed from Ozone (ProChannel) framework binary at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProChannel.framework/Versions/A/ProChannel
// (nm/otool `-arch x86_64`; framework=Ozone is the internal name for the ProChannel binary.)
// Source disassembly:
//   raw-port/re/disasm/OZChannelAffectedNodesInfo.~OZChannelAffectedNodesInfo.s    (D0 @0x1d7c0)
//   raw-port/re/disasm/OZChannelAffectedNodesInfo.~OZChannelAffectedNodesInfo.D1.s (D1 @0x1d7a0)
//
// Ledger methods (nm on ProChannel):
//   @Ozone 0x000000000001d7a0  OZChannelAffectedNodesInfo::~OZChannelAffectedNodesInfo()  (D1)
//   @Ozone 0x000000000001d7c0  OZChannelAffectedNodesInfo::~OZChannelAffectedNodesInfo()  (D0 deleting)
//
// STRUCT LAYOUT (recovered from the two destructors' calls; ctor is not on this ledger slice —
// we can only assert offsets that are observed):
//   +0x00..+0x4F  OZChannelInfo base sub-object    (D2 chain-called via `movq %rbx,%rdi;
//                                                   jmp OZChannelInfo::D2` @0x1d7bb / D0 @0x1d7d5)
//   +0x50..+0x??  PCSingleton member (or secondary base) — D2'd @0x1d7ad/@0x1d7cd via
//                                     `addq $0x50,%rdi ; callq PCSingleton::D2`
//   Total sizeof ≥ 0x50 + sizeof(PCSingleton). PCSingleton is 0x50 bytes (checked in its port),
//   so total is 0xA0 = 160 bytes at minimum. Ctor is on the frontier and may add fields; when
//   ported we'll extend here.
//
// Related sibling on the ledger:
//   __ZNSt3__117__call_once_proxy...OZChannelAffectedNodes::createOZChannelAffectedNodesInfo()
//   — a `std::call_once` proxy that lazily constructs the (presumed) singleton instance. The
//   class shape "OZChannelInfo + PCSingleton member at +0x50" exactly matches the (already
//   ported) OZChannelFrameInfo pattern; see raw-port/src/channels/OZChannelFrameInfo.ts for the
//   full ctor pattern this dtor reverses.
//
// FRONTIER CALLEES @0x1d7ad and @0x1d7cd (PCSingleton::~PCSingleton D2, __ZN11PCSingletonD2Ev)
// and @0x1d7bb / @0x1d7d5 (OZChannelInfo::~OZChannelInfo D2, __ZN13OZChannelInfoD2Ev).
// Both are already transcribed in this repo — we import them and invoke their `destroy()` shims
// so the JS teardown mirrors the native C++ chain order EXACTLY.

import { PCSingleton } from "../infra/PCSingleton";
import { OZChannelInfo } from "./OZChannelInfo";

/**
 * OZChannelAffectedNodesInfo — an OZChannelInfo with a PCSingleton companion at +0x50.
 *
 * The complete-object destructor (D1 @0x1d7a0) tears down PCSingleton first, then the
 * OZChannelInfo base. The deleting destructor (D0 @0x1d7c0) does the same then `operator
 * delete`s the object; in JS that's a GC no-op.
 *
 * NOTE: The ctor is on the frontier (only D1/D0 are on this ledger slice). Fields set by
 * the ctor cannot be documented here without further disassembly. We keep the base-sub-object
 * fields and expose destroy() with the exact tear-down order.
 */
export class OZChannelAffectedNodesInfo {
  // +0x00..+0x4F  OZChannelInfo base
  base: OZChannelInfo;

  // +0x50..+0x??  PCSingleton member
  singleton: PCSingleton;

  constructor(base: OZChannelInfo, singleton: PCSingleton) {
    // The primary/companion ctors are frontier — this JS constructor merely wires up the two
    // sub-objects the destructor will tear down. When we port the ctor we'll replace this with a
    // faithful transcription.
    this.base = base;
    this.singleton = singleton;
  }

  /**
   * @Ozone 0x000000000001d7a0  OZChannelAffectedNodesInfo::~OZChannelAffectedNodesInfo()  (D1)
   *
   * Disasm (0x1d7a0..0x1d7bb):
   *   push %rbp ; mov %rsp,%rbp ; push %rbx ; push %rax
   *   mov  %rdi,%rbx                       ; rbx = this
   *   add  $0x50,%rdi                      ; rdi = &this->singleton
   *   callq __ZN11PCSingletonD2Ev          ; PCSingleton::~PCSingleton()   @0x1d7ad
   *   mov  %rbx,%rdi                       ; rdi = this
   *   add  $0x8,%rsp ; pop %rbx ; pop %rbp
   *   jmp  __ZN13OZChannelInfoD2Ev         ; TAIL-CALL OZChannelInfo::~OZChannelInfo()  @0x1d7bb
   *
   * Order: PCSingleton first, then OZChannelInfo base. Faithful mirror in TS.
   *
   * @Ozone 0x000000000001d7c0  OZChannelAffectedNodesInfo::~OZChannelAffectedNodesInfo()  (D0 deleting)
   *
   * Disasm (0x1d7c0..0x1d7e3): identical body PLUS an operator delete tail-call:
   *   ...
   *   callq __ZN11PCSingletonD2Ev          ; @0x1d7cd
   *   mov  %rbx,%rdi
   *   callq __ZN13OZChannelInfoD2Ev        ; @0x1d7d5  (call, not tail-jmp — because we still
   *                                        ;  have to free the object afterwards)
   *   mov  %rbx,%rdi
   *   add  $0x8,%rsp ; pop %rbx ; pop %rbp
   *   jmp  __ZdlPv                         ; operator delete(void*)        @0x1d7e3
   *
   * In JS both D1 and D0 collapse to the same observable teardown; `operator delete` is a GC
   * no-op. We expose a single `destroy()` shim, matching how PCSingleton/OZChannelInfo already
   * export their teardowns in this repo.
   */
  destroy(): void {
    // @0x1d7a9/@0x1d7ad: PCSingleton::~PCSingleton on this+0x50 (member subobject).
    this.singleton.destroy();

    // @0x1d7bb (D1 tail-jmp) / @0x1d7d5 (D0 call): OZChannelInfo::~OZChannelInfo on `this` base.
    this.base.destroy();

    // D0 additionally tail-jmps to operator delete @0x1d7e3 — GC no-op in JS.
  }
}
