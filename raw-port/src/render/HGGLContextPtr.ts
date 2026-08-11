// HGGLContextPtr — Helium framework OpenGL-context pointer wrapper.
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//         Versions/A/Helium  (x86_64 slice, unadjusted VAs).
//
// This file ports ONLY the method listed under "Symbols ported here". Every
// other HGGLContextPtr method is a separate ledger entry, added to THIS file
// (additive extension only) when claimed — never a rewrite/drop of a landed one.
//
// -----------------------------------------------------------------------------
// SYMBOLS PORTED
// -----------------------------------------------------------------------------
//   * HGGLContextPtr::HGGLContextPtr(void*)   @Helium 0x1b3930   (C1 ctor)
//   * HGGLContextPtr::~HGGLContextPtr()       @Helium 0x1b3950   (D1 dtor)
//   * HGGLContextPtr::HGGLContextPtr(void*)   @Helium 0x1b3920   (C2 ctor)
//
// re/disasm:
//   raw-port/re/disasm/Helium.__ZN14HGGLContextPtrC1EPv.s   (7 lines)
//   raw-port/re/disasm/Helium.__ZN14HGGLContextPtrD1Ev.s    (7 lines)
//   raw-port/re/disasm/Helium.__ZN14HGGLContextPtrC2EPv.s   (7 lines)
//
// -----------------------------------------------------------------------------
// C1 AND C2 ARE TWO SYMBOLS, NOT ONE — AND HERE THEY ARE TWO BODIES TOO
// -----------------------------------------------------------------------------
// Itanium gives a constructor up to three entry points: C1 builds a COMPLETE object,
// C2 builds a BASE SUBOBJECT (the form a derived class's constructor calls), C3 is the
// allocating form. A compiler is free to emit one body and alias the other symbol to it;
// this one did not. The cached inventory lists four distinct addresses for this class's
// constructors —
//
//   0x1b3900 T __ZN14HGGLContextPtrC2Ev     0x1b3910 T __ZN14HGGLContextPtrC1Ev
//   0x1b3920 T __ZN14HGGLContextPtrC2EPv    0x1b3930 T __ZN14HGGLContextPtrC1EPv
//
// — 16 bytes apart, each with its own prologue, so C2 is a separate function that happens
// to contain the same three instructions as C1. It is transcribed here as its own export
// citing its own address, and the sameness is a MEASURED fact (both bodies re-derived from
// the binary, and the oracle calls each symbol separately), not an assumption from the
// mangling. The class has no base and no virtual table — `movq %rsi, (%rdi)` is the entire
// object — which is why the two forms coincide.
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (recovered fully from this ctor)
// -----------------------------------------------------------------------------
// HGGLContextPtr {
//   void* ctx;   // +0x00 — the raw context pointer. The ctor stores its
//                //   single void* argument straight here:
//                //     movq %rsi, (%rdi)   @0x1b3934
//                //   This is a thin single-pointer wrapper (a "smart pointer"
//                //   whose only state is the wrapped GL-context handle).
//                //
//                //   Corroborated by the two other enumerated methods, which
//                //   touch the SAME single slot and no other:
//                //     ~HGGLContextPtr()  movq $0x0, (%rdi)  @0x1b3954
//                //     ptr() const        movq (%rdi), %rax  @0x1b3964
//                //   (raw-port/re/disasm/Helium.__ZNK14HGGLContextPtr3ptrEv.s)
//                //   sizeof(HGGLContextPtr) == 8 — no other offset is ever
//                //   loaded or stored by any HGGLContextPtr method.
// }

/**
 * HGGLContextPtr — a thin wrapper holding one raw OpenGL-context pointer.
 * Modelled as an opaque handle: the wrapped `ctx` is an out-of-scope
 * platform OpenGL/CGL context object, so we hold it as `unknown`.
 */
export interface HGGLContextPtr_Fields {
  // +0x00 : the wrapped raw context pointer (opaque platform handle, or null).
  ctx_at0x00: unknown;
}

/**
 * HGGLContextPtr::HGGLContextPtr(void* ctx)   [C1 complete-object ctor]
 * @0x00000000001b3930  Helium   mangled: __ZN14HGGLContextPtrC1EPv
 *
 * ABI: %rdi = this, %rsi = void* ctx argument.
 *
 * Disasm (full):
 *   pushq %rbp              # @0x1b3930
 *   movq  %rsp, %rbp        # @0x1b3931
 *   movq  %rsi, (%rdi)      # @0x1b3934  this->ctx = ctx
 *   popq  %rbp              # @0x1b3937
 *   retq                    # @0x1b3938
 *   nopl  (%rax)            # @0x1b3939  padding
 *
 * Net effect: store the void* argument into this+0x0. No callees, no branches.
 */
export function HGGLContextPtr_ctor(
  self: HGGLContextPtr_Fields,
  ctx: unknown,
): void {
  // movq %rsi, (%rdi)  @0x1b3934 — plain single-word store of the argument.
  self.ctx_at0x00 = ctx;
}

/**
 * HGGLContextPtr::HGGLContextPtr(void* ctx)   [C2 base-object ctor]
 * @0x00000000001b3920  Helium   mangled: __ZN14HGGLContextPtrC2EPv
 *
 * ABI: %rdi = this, %rsi = void* ctx argument.
 *
 * Disasm (full — raw-port/re/disasm/Helium.__ZN14HGGLContextPtrC2EPv.s, re-derived from the
 * binary after deleting the cached copy):
 *   pushq %rbp              # @0x1b3920
 *   movq  %rsp, %rbp        # @0x1b3921
 *   movq  %rsi, (%rdi)      # @0x1b3924  this->ctx = ctx
 *   popq  %rbp              # @0x1b3927
 *   retq                    # @0x1b3928
 *   nopl  (%rax)            # @0x1b3929  padding
 *
 * Net effect: store the void* argument into this+0x0. No callees, no branches, and — the
 * thing a base-object constructor could plausibly do and this one does not — no vtable
 * pointer store and no base-class constructor call. The whole object is the one word.
 *
 * WHY IT IS A SEPARATE EXPORT FROM `HGGLContextPtr_ctor` (the C1 form at @0x1b3930): they are
 * two distinct symbols at two distinct addresses, each is a ledger unit, and each cites its
 * own body. Pointing this name at the landed C1 function would make the file claim an address
 * it does not transcribe.
 *
 * ORACLED against the live exported symbol (`nm` T, so dlsym-able):
 * raw-port/re/oracle/HGGLContextPtr_ctor_C2_oracle.py calls it under `arch -x86_64` on a
 * poisoned 0x40-byte arena after checking the seven prologue bytes at slide+0x1b3920 against
 * `554889e5488937`, and byte-diffs the whole arena afterwards. 44 pointer values — 0, 1, 8,
 * the arena's own address, kernel-looking and sign-bit addresses, 0xffffffffffffffff and
 * randoms — comparing the live memory, this port, and C1 called at its own address:
 * **44/44 agree, 0 bytes changed outside +0x00..+0x08, and C2 and C1 leave identical arenas**.
 * Negative controls in the same run: a model that stores 0 (the destructor's body) kills 43/44
 * — the survivor is the case that passes a null pointer, where the two are the same store —
 * one that leaves the slot untouched kills 44/44, and one that transposes the operands and
 * stores `this` kills 44/44.
 *
 * @param self the object being constructed (`%rdi`).
 * @param ctx  the raw context pointer to wrap (`%rsi`).
 */
export function HGGLContextPtr_ctor_C2(
  self: HGGLContextPtr_Fields,
  ctx: unknown,
): void {
  // movq %rsi, (%rdi)  @0x1b3924 — plain single-word store of the argument.
  self.ctx_at0x00 = ctx;
  // popq %rbp @0x1b3927 ; retq @0x1b3928 — void return.
}

/**
 * HGGLContextPtr::~HGGLContextPtr()   [D1 complete-object destructor]
 * @0x00000000001b3950  Helium   mangled: __ZN14HGGLContextPtrD1Ev
 *
 * ABI: %rdi = this. No arguments, no return value.
 *
 * Disasm (full — raw-port/re/disasm/Helium.__ZN14HGGLContextPtrD1Ev.s):
 *   pushq   %rbp             # @0x1b3950
 *   movq    %rsp, %rbp       # @0x1b3951
 *   movq    $0x0, (%rdi)     # @0x1b3954  this->ctx = NULL
 *   popq    %rbp             # @0x1b395b
 *   retq                     # @0x1b395c
 *   nopl    (%rax)           # @0x1b395d  padding
 *
 * Net effect: store the immediate 0 into this+0x0. Nothing else.
 *
 * FAITHFULNESS NOTE — this destructor is NON-OWNING. There is no CGLDestroyContext,
 * no CGLReleaseContext, no `operator delete`, no atomic refcount decrement and no
 * call of any kind: the whole body is one 7-byte `movq $0x0, (%rdi)` store. So
 * HGGLContextPtr is a borrowed/observer handle over a context whose lifetime is
 * owned elsewhere, and the dtor merely clears the slot. Adding any release call
 * here would be a rewrite, not a transcription.
 */
export function HGGLContextPtr_dtor(self: HGGLContextPtr_Fields): void {
  // movq $0x0, (%rdi)  @0x1b3954 — write the immediate 0 over the wrapped
  // pointer slot at +0x00. Modelled as null (the JS spelling of a NULL pointer
  // in the `unknown` opaque-handle slot). No callees, no branches, no frees.
  self.ctx_at0x00 = null;
  // popq %rbp @0x1b395b ; retq @0x1b395c — void return.
}
