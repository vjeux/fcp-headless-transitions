// raw-port/src/channels/OZChannelDecibelImpl.ts
//
// FCP `OZChannelDecibelImpl` — ProChannel concrete subclass of OZChannelImpl
// used as the *decibel* variant impl (audio gain / level). It carries the
// standard OZChannelImpl base and an embedded PCSingleton at offset +0x28.
//
// This claim ports both destructors of the class (D1 complete-object and D0
// deleting). The methods that actually IMPLEMENT the decibel-specific
// per-channel behavior are not part of the claim — a throw-stub tag at each
// unresolved base call marks the frontier.
//
// DECODE:
//   D0 transcribed from re/disasm/ProChannel.OZChannelDecibelImpl.~OZChannelDecibelImpl.s
//   D1 transcribed from re/disasm/ProChannel.OZChannelDecibelImpl.D1.s
// (D1's -tV rendering was empty due to a label boundary; the D1 body was
// pulled directly out of the ProChannel x86_64 slice bytes at 0x10784 and
// disassembled with capstone. Result matches nm's D1 address exactly.)
//
// Symbols (ProChannel framework, x86_64 slice):
//   0x0000000000010784  OZChannelDecibelImpl::~OZChannelDecibelImpl()   [D1 complete-object]
//                       __ZN20OZChannelDecibelImplD1Ev
//   0x00000000000107a4  OZChannelDecibelImpl::~OZChannelDecibelImpl()   [D0 deleting]
//                       __ZN20OZChannelDecibelImplD0Ev
//   (thunks at 0x107cc / 0x107ea are the vbase-offset-40 thunks that adjust
//    `this` back into the primary sub-object; identical body once adjusted.)
//
// STRUCT LAYOUT (proved by the two dtors — nothing else is decoded in this claim):
//   +0x00 : OZChannelImpl base sub-object   (~ProChannelImpl D2 tail-jmp @0xaa40a)
//   +0x28 : PCSingleton    embedded member  (destroyed via PCSingleton::~PCSingleton)
//   (No other slots are read; the D0 path calls the SAME two dtors then
//    forwards to `operator delete(this)` via __ZdlPv stub @0xace04.)
//
// Undecoded callees are exposed here as throw-stubs (per the porting spec),
// each citing the exact @0xADDR they were pulled from. This is the "loud
// gap" pattern — silently pretending they're a no-op would corrupt every
// downstream test that constructs a decibel-impl.

import { PCSingleton } from "../infra/PCSingleton.js";

/**
 * OZChannelImpl::~OZChannelImpl()  — @ProChannel 0xaa40a  (D2 base dtor)
 * __ZN13OZChannelImplD2Ev
 *
 * NOT decoded in this claim. Every path through OZChannelDecibelImpl's D1
 * and D0 dtors tail-jumps here; we surface it as a loud throw so any user
 * who tries to actually run the port sees exactly which upstream needs to
 * be ported first.
 *
 * @0xaa40a
 */
function OZChannelImpl_dtor_D2(_this_: unknown): never {
  throw new Error("OZChannelImpl::~OZChannelImpl() @ProChannel 0xaa40a not yet transcribed");
}

/**
 * `operator delete(void*)`  — @ProChannel 0xace04  (__ZdlPv stub)
 *
 * NOT decoded in this claim (it's the standard C++ deallocation stub —
 * effectively `free(ptr)` after global-new bookkeeping). Exposed as a
 * throw so the frontier is visible.
 *
 * @0xace04
 */
function operator_delete(_p: unknown): never {
  throw new Error("operator delete(void*) @ProChannel 0xace04 __ZdlPv not yet transcribed");
}

/**
 * Fields the destructors touch. Callers modeling more of the class may
 * extend this — this file only vouches for what the two dtors read.
 */
export interface OZChannelDecibelImplDtorShape {
  /** Embedded PCSingleton at +0x28 (destroyed via PCSingleton::~PCSingleton). */
  singleton: PCSingleton;
}

/**
 * OZChannelDecibelImpl::~OZChannelDecibelImpl()  [D1 complete-object]  @0x10784
 *
 * Instruction-by-instruction transcription (bytes from the ProChannel x86_64
 * slice at 0x10784..0x107a4, disassembled via capstone):
 *
 *   0x10784  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
 *   0x1078a  movq  %rdi, %rbx                  ; rbx = this
 *   0x1078d  addq  $0x28, %rdi                 ; rdi = &this->singleton
 *   0x10791  callq __ZN11PCSingletonD2Ev       ; PCSingleton::~PCSingleton(&this+0x28)
 *                                              ; (stub @0xacb4c -> ProCore PCSingleton D2)
 *   0x10796  movq  %rbx, %rdi                  ; rdi = this
 *   0x10799  addq  $0x8, %rsp / popq %rbx / popq %rbp
 *   0x1079f  jmp   0xaa40a                     ; TAIL-CALL: OZChannelImpl::~OZChannelImpl()
 *
 * @0x10784
 */
export function OZChannelDecibelImpl_dtor_D1(
  this_: OZChannelDecibelImplDtorShape,
): void {
  // 0x1078d + 0x10791: destroy embedded PCSingleton at +0x28.
  this_.singleton.destroy();
  // 0x1079f: tail-call base OZChannelImpl D2 dtor. Undecoded — throws loud.
  OZChannelImpl_dtor_D2(this_);
}

/**
 * OZChannelDecibelImpl::~OZChannelDecibelImpl()  [D0 deleting]  @0x107a4
 *
 * Instruction-by-instruction transcription (from
 * re/disasm/ProChannel.OZChannelDecibelImpl.~OZChannelDecibelImpl.s):
 *
 *   0x107a4  pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
 *   0x107aa  movq  %rdi, %rbx                  ; rbx = this
 *   0x107ad  addq  $0x28, %rdi                 ; rdi = &this->singleton
 *   0x107b1  callq __ZN11PCSingletonD2Ev       ; PCSingleton::~PCSingleton(&this+0x28)
 *                                              ; (stub @0xacb4c)
 *   0x107b6  movq  %rbx, %rdi                  ; rdi = this
 *   0x107b9  callq __ZN13OZChannelImplD2Ev     ; OZChannelImpl::~OZChannelImpl()
 *                                              ; (direct call to @0xaa40a — NOT a tail-call here)
 *   0x107be  movq  %rbx, %rdi                  ; rdi = this
 *   0x107c1  addq  $0x8, %rsp / popq %rbx / popq %rbp
 *   0x107c7  jmp   0xace04                     ; TAIL-CALL: operator delete(this)  (__ZdlPv)
 *
 * The D0 form differs from D1 by the operator-delete tail: D0 is the
 * "deleting destructor" that the vtable installs for `delete this;` paths.
 *
 * @0x107a4
 */
export function OZChannelDecibelImpl_dtor_D0(
  this_: OZChannelDecibelImplDtorShape,
): void {
  // 0x107ad + 0x107b1: destroy embedded PCSingleton at +0x28.
  this_.singleton.destroy();
  // 0x107b9: direct-call (not tail) OZChannelImpl base dtor. Undecoded — throws loud.
  OZChannelImpl_dtor_D2(this_);
  // 0x107c7: tail-call operator delete(this). Undecoded — throws loud.
  operator_delete(this_);
}
