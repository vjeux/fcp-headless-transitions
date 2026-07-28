// OZSingleChanBehaviorIF.m0.ts — chunk 0 (all 7 methods) of the OZSingleChanBehaviorIF
// interface class in Ozone.framework. This is an abstract single-channel behavior interface;
// the five real virtual methods are default IF implementations that concrete subclasses
// (`OZ*SingleChanBehavior*`) override. Both destructor slots are pure/unreachable (`ud2`).
//
// Framework: Ozone
// Vtable  : @0x870c98  (installed-ptr 0x870ca8) — confirmed via raw-port/army/tools/vtable.py
//
// Method source disassemblies:
//   raw-port/re/disasm/OZSingleChanBehaviorIF.getNeededRange.s        @0x4c1de0  (vt+0x20)
//   raw-port/re/disasm/OZSingleChanBehaviorIF.getNeededTime.s         @0x4c5bc0  (vt+0x28)
//   raw-port/re/disasm/OZSingleChanBehaviorIF.isPointToPoint.s        @0x4c5be0  (vt+0x30)
//   raw-port/re/disasm/OZSingleChanBehaviorIF.isRemappingTime.s       @0x4c5bf0  (vt+0x38)
//   raw-port/re/disasm/OZSingleChanBehaviorIF.scbIsEvalCyclic.s       @0x4c5c00  (vt+0x40)
//   raw-port/re/disasm/OZSingleChanBehaviorIF.~OZSingleChanBehaviorIF.s @0x6dbe40 (D1, vt+0x00)
//                                                                    @0x6dbe50  (D0, vt+0x08)

import { CMTime } from "../infra/CMTime";
import { OZCurveNodeParam } from "../nodes/OZCurveNodeParam";

// ---------------------------------------------------------------------------
// OZSingleChanBehaviorIF::getNeededRange(unsigned int, OZCurveNodeParam*)  @0x4c1de0
// ---------------------------------------------------------------------------
// AMD64 args: %rdi=this (unused), %esi=uint (unused), %rdx=OZCurveNodeParam*
// Body (asm mirrored line-for-line from raw-port/re/disasm/OZSingleChanBehaviorIF.getNeededRange.s):
//   mov  %rdx, %rax                                     ; return = the OZCurveNodeParam*
//   mov  0x70(%rdx), %rcx  ; mov  %rcx, 0x28(%rdx)      ; p->t0.epoch  (+0x28) <- p->t2.epoch  (+0x70)
//   movups 0x60(%rdx),%xmm0; movups %xmm0, 0x18(%rdx)   ; p->t0 lo16   (+0x18) <- p->t2 lo16   (+0x60)
//   movups 0x78(%rdx),%xmm0; movups %xmm0, 0x30(%rdx)   ; p->t1 lo16   (+0x30) <- p->t3 lo16   (+0x78)
//   mov  0x88(%rdx), %rcx  ; mov  %rcx, 0x40(%rdx)      ; p->t1.epoch  (+0x40) <- p->t3.epoch  (+0x88)
//   mov  0x90(%rdx), %ecx  ; mov  %ecx, 0x48(%rdx)      ; p->count_a   (+0x48) <- p->count_b   (+0x90) [i32]
//   movb $0x0, 0x58(%rdx)                               ; p->owns_a    (+0x58) <- 0
//   mov  0x98(%rdx), %rcx  ; mov  %rcx, 0x50(%rdx)      ; p->buf_a     (+0x50) <- p->buf_b     (+0x98)
//   ret
//
// Effect: overwrite the "a" side (t0,t1,count_a,buf_a,owns_a) of the OZCurveNodeParam
// with the "b" side (t2,t3,count_b,buf_b) — and set owns_a=0 so the "a" side is a
// non-owning VIEW of the "b" side's buffer. The uint arg is ignored at this IF level.
// (Note: p->owns_b (+0xa0) is NOT touched — only the "a" side is rewritten.)
// Returns the same OZCurveNodeParam* passed in (identity).
export function OZSingleChanBehaviorIF_getNeededRange(
  _self: unknown,
  _u: number,             // unsigned int arg1, unused by the IF default
  p: OZCurveNodeParam,
): OZCurveNodeParam {
  // t0 <- t2  (asm: 16B xmm move for value+timescale+flags, then 8B qword move for epoch)
  p.t0 = {
    value: p.t2.value,
    timescale: p.t2.timescale,
    flags: p.t2.flags,
    epoch: p.t2.epoch,
  };
  // t1 <- t3
  p.t1 = {
    value: p.t3.value,
    timescale: p.t3.timescale,
    flags: p.t3.flags,
    epoch: p.t3.epoch,
  };
  // count_a <- count_b (i32, `movl` in asm)
  p.count_a = p.count_b | 0;
  // owns_a <- 0  (base copy is a non-owning view of buf_b)
  p.owns_a = 0;
  // buf_a <- buf_b  (pointer/ref copy — the asm is a plain qword mov, not a deep copy)
  p.buf_a = p.buf_b;
  return p;
}

// ---------------------------------------------------------------------------
// OZSingleChanBehaviorIF::getNeededTime(CMTime const&)                    @0x4c5bc0
// ---------------------------------------------------------------------------
// AMD64 args: %rdi=sret CMTime*, %rsi=this (unused), %rdx=&input CMTime
// Body:
//   mov     %rdi, %rax
//   mov     0x10(%rdx), %rcx ; mov %rcx, 0x10(%rdi)   ; sret.epoch  <- src.epoch  (qword @+0x10)
//   movups  (%rdx), %xmm0    ; movups %xmm0, (%rdi)   ; sret[0..16] <- src[0..16] (value+timescale+flags)
//   ret
//
// Effect: 24-byte byte-for-byte copy of the input CMTime into the sret slot.
// The IF default is IDENTITY — "the needed time is the requested time". The asm
// never touches `this`; the IF-level function ignores it.
export function OZSingleChanBehaviorIF_getNeededTime(_self: unknown, t: CMTime): CMTime {
  return { value: t.value, timescale: t.timescale, flags: t.flags, epoch: t.epoch };
}

// ---------------------------------------------------------------------------
// OZSingleChanBehaviorIF::isPointToPoint()                                @0x4c5be0
// ---------------------------------------------------------------------------
// Body:  movb $0x1, %al ; ret        ->  return true
export function OZSingleChanBehaviorIF_isPointToPoint(_self: unknown): boolean {
  return true;
}

// ---------------------------------------------------------------------------
// OZSingleChanBehaviorIF::isRemappingTime()                               @0x4c5bf0
// ---------------------------------------------------------------------------
// Body:  xorl %eax, %eax ; ret       ->  return false
export function OZSingleChanBehaviorIF_isRemappingTime(_self: unknown): boolean {
  return false;
}

// ---------------------------------------------------------------------------
// OZSingleChanBehaviorIF::scbIsEvalCyclic()                               @0x4c5c00
// ---------------------------------------------------------------------------
// Body:  xorl %eax, %eax ; ret       ->  return false
export function OZSingleChanBehaviorIF_scbIsEvalCyclic(_self: unknown): boolean {
  return false;
}

// ---------------------------------------------------------------------------
// OZSingleChanBehaviorIF::~OZSingleChanBehaviorIF()  D0 @0x6dbe50  (vt+0x08 deleting-dtor)
// OZSingleChanBehaviorIF::~OZSingleChanBehaviorIF()  D1 @0x6dbe40  (vt+0x00 base-dtor)
// ---------------------------------------------------------------------------
// Both destructor bodies are exactly:
//   push %rbp ; mov %rsp, %rbp ; ud2 ; nopw ...
// i.e. `ud2` — an intentional trap. This is a PURE-VIRTUAL / abstract-only class:
// there is never a concrete OZSingleChanBehaviorIF instance to destruct at this level.
// Concrete subclasses provide their own vt+0x00 / vt+0x08 slots. If our port ever
// dispatches to these IF-level destructors it means someone constructed the abstract
// base directly — which is a logic bug worth throwing on, matching the binary's `ud2`.
export function OZSingleChanBehaviorIF_dtor_D0(_self: unknown): never {
  throw new Error("OZSingleChanBehaviorIF::~OZSingleChanBehaviorIF (D0) @0x6dbe50 is `ud2` — abstract IF, never call directly");
}
export function OZSingleChanBehaviorIF_dtor_D1(_self: unknown): never {
  throw new Error("OZSingleChanBehaviorIF::~OZSingleChanBehaviorIF (D1) @0x6dbe40 is `ud2` — abstract IF, never call directly");
}

// ---------------------------------------------------------------------------
// Dispatch table (assemble_class.py convention: <Class>_m<k>_methods).
// Keys use the concise selector-style names FCP uses for these v-slots; each fn
// takes `(self, ...args)`. Callers going through the union receive an object
// whose method properties match this exact key set.
// ---------------------------------------------------------------------------
export const OZSingleChanBehaviorIF_m0_methods = {
  getNeededRange:   OZSingleChanBehaviorIF_getNeededRange,
  getNeededTime:    OZSingleChanBehaviorIF_getNeededTime,
  isPointToPoint:   OZSingleChanBehaviorIF_isPointToPoint,
  isRemappingTime:  OZSingleChanBehaviorIF_isRemappingTime,
  scbIsEvalCyclic:  OZSingleChanBehaviorIF_scbIsEvalCyclic,
  // Both destructors are `ud2` in the binary — abstract-only. Included so a caller
  // dispatching through vt+0x00 / vt+0x08 gets the same crash-on-call semantics.
  dtor_D0: OZSingleChanBehaviorIF_dtor_D0,
  dtor_D1: OZSingleChanBehaviorIF_dtor_D1,
};
