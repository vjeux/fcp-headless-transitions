// OZRemapTimeStrategy — Ozone.framework time-remap strategy.
// Faithful transcription from the Ozone Mach-O in Final Cut Pro.
// DECODE: raw-port/re/disasm/OZRemapTimeStrategy.operator().s
//         raw-port/re/disasm/OZRemapTimeStrategy.~OZRemapTimeStrategy.s
//
// STRUCT LAYOUT (recovered from disasm — operator() reads NOTHING from `this` beyond having a
// vtable slot; D1 is trivial pop/ret; D0 is `delete this`):
//   +0x00 vptr          // vtable pointer  (Ozone _ZTV19OZRemapTimeStrategy @0x886610, non-mangled
//                          demangle-only visibility — no instance fields are ever loaded via `this`)
// So the object has NO ported instance state. If a later frontier pass reveals fields (e.g.
// a stored remap curve or an OZFootage ref) accessed by another caller, they belong to a
// subclass or are set/used outside operator(); nothing to model here.
//
// SEMANTIC NOTE (verified by side-by-side disasm compare):
// OZRemapTimeStrategy::operator()(CMTime const&) @0x62a3e0  is BYTE-FOR-BYTE identical to
// OZIdentityTimeStrategy::operator()(CMTime const&) @0x62a3c0 in the shipping binary — both read
// the incoming CMTime's `value` (int64 @+0x00) and `timescale` (int32 @+0x08) and rebuild a
// fresh CMTime via `CMTimeMake(value, timescale)`. Flags and epoch are DISCARDED. That is what
// FCP actually runs; don't "fix" it.
//
// FRAMEWORK: Ozone
// CALLEES: _CMTimeMake (CoreMedia, via __stubs)
// CONSTS/VTABLES: none referenced from this method.

import { CMTime, CMTimeMake } from "../infra/CMTime.js";

/**
 * OZRemapTimeStrategy::operator()(CMTime const& t)  @Ozone 0x62a3e0
 *
 * Disasm (0x62a3e0..0x62a3fd):
 *   pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax        ; frame
 *   movq  %rdi, %rbx                                             ; save sret ptr
 *   movq  (%rdx), %rsi                                           ; %rsi = t.value       (@+0x00, int64)
 *   movl  0x8(%rdx), %edx                                        ; %edx = t.timescale   (@+0x08, int32)
 *   callq __stub _CMTimeMake                                     ; CMTimeMake(out=%rdi=sret, value, timescale)
 *   movq  %rbx, %rax                                             ; return sret ptr
 *   ret
 *
 * i.e. return CMTimeMake(t.value, t.timescale). Flags and epoch are NOT copied — the returned
 * CMTime has flags=kCMTimeFlags_Valid and epoch=0 (per CMTimeMake's contract, CMTime.h).
 */
export function OZRemapTimeStrategy_call(t: CMTime): CMTime {
  // (%rdx) load  -> value      (int64, +0x00)
  // 0x8(%rdx)    -> timescale  (int32, +0x08)
  return CMTimeMake(t.value, t.timescale);
}

/**
 * OZRemapTimeStrategy::~OZRemapTimeStrategy()  @Ozone 0x62a420 (D1 — complete-object dtor)
 *
 * Disasm (0x62a420..0x62a425):
 *   pushq %rbp / movq %rsp,%rbp / popq %rbp / ret
 *
 * Trivial — nothing to destroy (no owned resources, no member subobjects with dtors). In TS
 * there is nothing to model; provided as a citation-carrying no-op so the ledger sees the addr.
 */
export function OZRemapTimeStrategy_dtor(_self: object): void {
  // no-op: FCP's D1 is a pure prologue/epilogue.
}

/**
 * OZRemapTimeStrategy::~OZRemapTimeStrategy()  @Ozone 0x62a430 (D0 — deleting dtor)
 *
 * Disasm (0x62a430..0x62a435):
 *   pushq %rbp / movq %rsp,%rbp / popq %rbp
 *   jmp   __stub _ZdlPv                                          ; tail-call operator delete(this)
 *
 * D0 tail-calls the standard `operator delete(void*)`. It does NOT first invoke D1 because D1 is
 * a no-op (see above) — the compiler folded the trivial dtor away and left only the free. In TS
 * memory is GC'd; there is nothing to free. Provided as a citation-carrying no-op.
 */
export function OZRemapTimeStrategy_deleting_dtor(_self: object): void {
  // no-op: FCP's D0 tail-calls operator delete(this); GC handles storage in TS.
}
