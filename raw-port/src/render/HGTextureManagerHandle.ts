// HGTextureManagerHandle.ts — FCP Helium `HGTextureManagerHandle`: the
// polymorphic abstract base class of the "texture-manager handle" hierarchy
// used by Helium's render layer to inject a HGTextureManager-backed policy
// into a HGTexturePoolingPolicy. The concrete subclass in the same framework
// is `HGTextureManagerHandleImpl` (its own vtable at Helium 0xa07960/RTTI,
// separate D0/D1/D2 plus lockFreePool / getNumBytes / getNumTextures /
// getTotalTextureMemory / ctor from HGTextureManager*). This file transcribes
// ONLY the abstract base — the four member functions Helium exports for the
// base type itself.
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// EXPORTED SYMBOLS (four member functions of the abstract base class):
//   @Helium 0x0000000000043e80  HGTextureManagerHandle::HGTextureManagerHandle()  (C2, base ctor)
//   @Helium 0x0000000000043eb0  HGTextureManagerHandle::~HGTextureManagerHandle() (D2, base-subobject dtor)
//   @Helium 0x00000000003c16d0  HGTextureManagerHandle::~HGTextureManagerHandle() (D1, in-place dtor — ud2 trap)
//   @Helium 0x00000000003c16e0  HGTextureManagerHandle::~HGTextureManagerHandle() (D0, deleting dtor — ud2 trap)
//
// SOURCE DISASSEMBLY (in this worktree's raw-port/re/disasm/):
//   Helium.HGTextureManagerHandle.HGTextureManagerHandle.s (C2 body @0x43e80..0x43ea2)
//   Helium.HGTextureManagerHandle.~HGTextureManagerHandle.s (D0 body @0x3c16e0..0x3c16e5)
//   D2 body @0x43eb0..0x43eb5 recovered from otool -tV of `__ZN22HGTextureManagerHandleD2Ev`.
//   D1 body @0x3c16d0..0x3c16d5 recovered from otool -tV of `__ZN22HGTextureManagerHandleD1Ev`
//     (D1 is at a DIFFERENT address than D0 in this binary, so it is a
//      distinct 6-byte trap stub — not ICF-folded — even though its shape
//      matches D0 exactly. The two entry points are kept separate so callers
//      taking &~HGTextureManagerHandle via the D1 slot and callers dispatching
//      through the deleting-dtor slot both land on legitimate trap addresses.)
//
// SYMBOL TABLE EVIDENCE (nm -arch x86_64 on Helium):
//   0x0000000000043e80 T __ZN22HGTextureManagerHandleC2Ev
//   0x0000000000043eb0 T __ZN22HGTextureManagerHandleD2Ev
//   0x00000000003c16d0 T __ZN22HGTextureManagerHandleD1Ev
//   0x00000000003c16e0 T __ZN22HGTextureManagerHandleD0Ev
//   0x0000000000a07530 s __ZTV22HGTextureManagerHandle   (vtable base)
//   0x0000000000a07978 S __ZTI22HGTextureManagerHandle   (type_info)
//   0x00000000003cb74b S __ZTS22HGTextureManagerHandle   (type_info string)
//
// USED-BY:
//   @Helium 0x0000000000044cb0 HGTexturePoolingPolicy::setManagerHandle(HGRef<HGTextureManagerHandle>)
//     — this is the only Helium export that traffics in the base type by
//       name. The subclass HGTextureManagerHandleImpl is the concrete node
//       that a caller actually constructs; it is then wrapped in HGRef<> and
//       fed to setManagerHandle to attach a manager-backed pooling policy.
//
// ── STRUCT LAYOUT (base subobject only) ─────────────────────────────────────
//
//   The C2 body writes exactly one field:
//
//     @0x43e89  callq __ZN8HGObjectC2Ev                (HGObject::HGObject(this))
//     @0x43e8e  leaq  __ZTV22HGTextureManagerHandle(%rip), %rax   ; = 0xa07530
//     @0x43e95  addq  $0x10, %rax                     ; +0x10 = vfn-slot base
//                                                       (past +0=offset-to-top,
//                                                        +0x8=RTTI pointer)
//     @0x43e99  movq  %rax, (%rbx)                    ; *this = vfn-slot base
//
//   And D2 (@0x43eb0..0x43eb5) is exactly:
//
//     @0x43eb0  pushq %rbp
//     @0x43eb1  movq  %rsp, %rbp
//     @0x43eb4  popq  %rbp
//     @0x43eb5  jmp   __ZN8HGObjectD2Ev                 ; tail-call HGObject dtor
//
//   Together these prove:
//     +0x00  const void* __vptr        ; vtable pointer for
//                                         HGTextureManagerHandle,
//                                         value 0xa07530 + 0x10 = 0xa07540
//                                         (the Itanium-ABI virtual-fn-slot
//                                         base, past offset-to-top + RTTI).
//     +[HGObject base subobject]       ; whatever HGObject::HGObject() writes
//                                         into `this`.  HGObject is not yet
//                                         transcribed — see HGObject_stub.ts.
//                                         The base ctor is the ONLY thing C2
//                                         does before installing the vptr,
//                                         and D2 tail-calls HGObject::~HGObject
//                                         on exit.
//
//   sizeof: NOT directly provable from these four bodies alone (no `movl $N,
//   %edi ; callq operator new` inside any of them — allocation happens in the
//   subclass ctor `HGTextureManagerHandleImpl(HGTextureManager*)` at 0x44630
//   which is outside this file's scope). We therefore do not encode a
//   sizeof-bound field-set on the base — only the vptr edge that C2 installs
//   and the HGObject base subobject it forwards to.
//
// UD2 SEMANTICS: D0 (deleting) and D1 (in-place) at 0x3c16e0 and 0x3c16d0
// are BOTH 6-byte trap stubs:
//
//     55           pushq %rbp
//     48 89 e5     movq  %rsp, %rbp
//     0f 0b        ud2                     ; SIGILL — "must never be reached"
//
// The `ud2` opcode is x86_64's canonical "raise SIGILL right here" marker;
// the compiler emits this pattern for a dtor slot that must never be reached
// (because the class is abstract — no instance of THIS type is ever
// destroyed directly; every legitimate destruction hits an override in
// HGTextureManagerHandleImpl's vtable). The base-subobject dtor (D2) IS
// legitimately callable because subclass D0/D1 tail-call it as the
// "run base subobject dtor after own cleanup" step of the Itanium ABI.
//
// In TS we model D0/D1 as functions that immediately throw an Error citing
// the trap address, and D2 as a no-op that forwards to HGObject_dtor (the
// undecoded HGObject base — see raw-port/src/render/HGObject_stub.ts).
//
// UNDECODED CALLEES:
//   - HGObject::HGObject()   @Helium (referenced from C2 @0x43e89) — imported
//     from HGObject_stub as `HGObject_ctor`. Frontier class.
//   - HGObject::~HGObject()  @Helium (referenced from D2 @0x43eb5 as a tail
//     jmp) — imported from HGObject_stub as `HGObject_dtor`.
//
// FRONTIER FAMILY (referenced but out of scope for this file):
//   HGTextureManagerHandleImpl (concrete subclass, its own vtable at
//     __ZTV26HGTextureManagerHandleImpl; ctor from HGTextureManager* at
//     0x44630; virtual methods lockFreePool / getNumBytes / getNumTextures /
//     getTotalTextureMemory at 0x44690/0x44940/0x446e0/0x44c00).
//   HGTexturePoolingPolicy::setManagerHandle(HGRef<HGTextureManagerHandle>)
//     — the sole consumer of the base type by name (@0x44cb0).
//   HGObject — the base class of HGTextureManagerHandle itself.

import { HGObject_ctor, HGObject_dtor } from "./HGObject_stub";

// ─────────────────────────────────────────────────────────────────────────────
// Vtable pointer value — as installed by the C2 body.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Symbolic value of the vptr that
 * `HGTextureManagerHandle::HGTextureManagerHandle()` (C2 @0x43e80) writes
 * into `*this`. Recovered from the asm at @0x43e8e..@0x43e99:
 *
 *     leaq __ZTV22HGTextureManagerHandle(%rip), %rax  ; = 0xa07530
 *     addq $0x10, %rax                                 ; = 0xa07540
 *     movq %rax, (%rbx)                                ; *this = 0xa07540
 *
 * i.e. the address of the first virtual-function-slot in the vtable, past
 * the Itanium-ABI +0=offset-to-top and +0x8=RTTI pointer slots.
 *
 * We only use this as a distinctive TS marker so that a fresh instance's
 * `__vptr` field is bit-identifiable in tests.
 */
export const HGTextureManagerHandle_vtable_slot_base = 0xa07540;

// ─────────────────────────────────────────────────────────────────────────────
// HGTextureManagerHandle — abstract polymorphic base class
// ─────────────────────────────────────────────────────────────────────────────

/**
 * HGTextureManagerHandle — abstract base class.
 *
 * Cannot be instantiated directly at the C++ level: its D0 and D1 dtor slots
 * are `ud2` trap stubs (`push rbp ; mov rsp,rbp ; ud2` at Helium 0x3c16e0
 * and 0x3c16d0). Only its concrete subclass HGTextureManagerHandleImpl
 * (whose own D0/D1/D2 override these slots) is ever legitimately destroyed.
 *
 * The four exported members of this base class are:
 *   - C2 @0x43e80: chains through HGObject::HGObject() then installs the
 *                  HGTextureManagerHandle vtable slot-base pointer at *this.
 *   - D2 @0x43eb0: trivial base-subobject dtor — tail-calls HGObject::~HGObject().
 *   - D1 @0x3c16d0: `ud2` trap — must never be reached directly.
 *   - D0 @0x3c16e0: `ud2` trap — must never be reached directly.
 */
export abstract class HGTextureManagerHandle {
  /** Brand marker so subclass types can be distinguished at the type level.
   *  No runtime storage or observable behaviour — the abstract base has no
   *  fields we can prove from the four exported member bodies alone (the
   *  only writable slot inside C2 is the vptr, which we model separately). */
  readonly __hgTextureManagerHandleBrand: "HGTextureManagerHandle" =
    "HGTextureManagerHandle";

  /**
   * The vptr slot installed by C2 @0x43e99 (`movq %rax, (%rbx)`).
   * Mirrors offset +0x00 of the C++ layout.
   *
   * A subclass ctor (e.g. HGTextureManagerHandleImpl's ctor at 0x44630)
   * overwrites this with its OWN vtable-slot-base after chaining through
   * this base ctor — that overwrite is exactly the Itanium-ABI construction
   * order and it is the reason the base's D0/D1 slots are `ud2`: a live
   * subclass instance's vptr never points at THIS class's vtable.
   */
  __vptr: number = HGTextureManagerHandle_vtable_slot_base;

  /**
   * HGTextureManagerHandle::HGTextureManagerHandle()  C2 — @Helium 0x43e80
   * [__ZN22HGTextureManagerHandleC2Ev]
   *
   * Full disassembly (15-line otool dump; see
   *   raw-port/re/disasm/Helium.HGTextureManagerHandle.HGTextureManagerHandle.s):
   *
   *   @0x43e80  pushq %rbp
   *   @0x43e81  movq  %rsp, %rbp
   *   @0x43e84  pushq %rbx
   *   @0x43e85  pushq %rax                         ; align stack (scratch)
   *   @0x43e86  movq  %rdi, %rbx                   ; save `this` in %rbx
   *   @0x43e89  callq __ZN8HGObjectC2Ev            ; HGObject::HGObject(this)
   *   @0x43e8e  leaq  __ZTV22HGTextureManagerHandle(%rip), %rax  ; = 0xa07530
   *   @0x43e95  addq  $0x10, %rax                  ; = 0xa07540 (vfn slot base)
   *   @0x43e99  movq  %rax, (%rbx)                 ; *this = vfn slot base
   *   @0x43e9c  addq  $0x8, %rsp                   ; drop scratch slot
   *   @0x43ea0  popq  %rbx
   *   @0x43ea1  popq  %rbp
   *   @0x43ea2  retq
   *
   * i.e. exactly: chain to HGObject base ctor, then install our vptr.
   *
   * The base ctor is invoked here as part of C++ subclass-construction:
   * HGTextureManagerHandleImpl's C1/C2 (@0x44630) will call THIS ctor as its
   * first step, and then OVERWRITE `__vptr` with its own vtable-slot-base
   * — the standard Itanium-ABI construction dance. We therefore mark this
   * ctor `protected`: it is legitimate for a subclass to invoke it via
   * `super()`, but no external code should construct the abstract base
   * directly.
   */
  protected constructor() {
    // @0x43e89 — HGObject::HGObject(this)
    HGObject_ctor(this);
    // @0x43e8e..@0x43e99 — install vtable-slot-base pointer at *this
    this.__vptr = HGTextureManagerHandle_vtable_slot_base;
  }

  /**
   * HGTextureManagerHandle::~HGTextureManagerHandle()  D2 — @Helium 0x43eb0
   * [__ZN22HGTextureManagerHandleD2Ev]
   *
   * Raw bytes @0x43eb0..@0x43eb5 (per `otool -tV` on Helium):
   *   `55 48 89 e5 5d e9 <rel32>`   (push/mov/pop + JMP to HGObject::~HGObject)
   *
   * Full disassembly:
   *   @0x43eb0  pushq %rbp
   *   @0x43eb1  movq  %rsp, %rbp
   *   @0x43eb4  popq  %rbp
   *   @0x43eb5  jmp   __ZN8HGObjectD2Ev             ; tail-call HGObject::~HGObject()
   *
   * A trivial base-subobject dtor: standard prologue, restore frame, tail-jump
   * into HGObject's D2. No cleanup of HGTextureManagerHandle-specific fields
   * because the abstract base OWNS no fields beyond the vptr (which the ABI
   * does not require the dtor to zero).
   *
   * This IS legitimately callable — it is invoked as the last step of a
   * subclass's D0/D1/D2 to run the base-subobject destruction (Itanium ABI).
   *
   * We model this in TS as a no-op that forwards to HGObject_dtor. The
   * current HGObject_stub.ts models HGObject_dtor as an unconditional throw
   * citing @Helium 0x711cc — invoking this dtor therefore surfaces the
   * undecoded HGObject frontier at that address, matching the porting spec's
   * contract that undecoded callees are hard, cited failures rather than
   * silent no-ops.
   */
  destroy_D2(): void {
    // @0x43eb5 — jmp HGObject::~HGObject()  (tail call)
    HGObject_dtor(this);
  }

  /**
   * HGTextureManagerHandle::~HGTextureManagerHandle()  D1 — @Helium 0x3c16d0
   * [__ZN22HGTextureManagerHandleD1Ev]
   *
   * Raw bytes @0x3c16d0..@0x3c16d5 (per `otool -tV` on Helium):
   *   `55 48 89 e5 0f 0b`   (push rbp ; mov rsp,rbp ; ud2)
   *
   * Full disassembly:
   *   @0x3c16d0  pushq %rbp
   *   @0x3c16d1  movq  %rsp, %rbp
   *   @0x3c16d4  ud2                               ; SIGILL — must never be reached
   *   @0x3c16d6  nopw  %cs:(%rax,%rax)             ; alignment padding
   *
   * `ud2` is x86_64's canonical "raise SIGILL right here" trap. Emitted for
   * the in-place-destructor slot of an abstract base whose live subclass
   * override (HGTextureManagerHandleImpl::D1 @0xa07960/vtable) always shadows
   * it — so any dispatch that landed HERE would be a bug in the caller.
   *
   * TS models this as an unconditional throw citing the trap address.
   */
  destroy_D1(): never {
    // @0x3c16d4 — ud2 trap
    throw new Error(
      "HGTextureManagerHandle::~HGTextureManagerHandle() D1 @Helium 0x3c16d0 " +
        "is a `ud2` trap stub — the abstract base's in-place-dtor slot must " +
        "never be reached directly; the concrete subclass " +
        "HGTextureManagerHandleImpl overrides this vtable entry."
    );
  }

  /**
   * HGTextureManagerHandle::~HGTextureManagerHandle()  D0 — @Helium 0x3c16e0
   * [__ZN22HGTextureManagerHandleD0Ev]
   *
   * Raw bytes @0x3c16e0..@0x3c16e5 (per `otool -tV` on Helium):
   *   `55 48 89 e5 0f 0b`   (push rbp ; mov rsp,rbp ; ud2)
   *
   * Full disassembly:
   *   @0x3c16e0  pushq %rbp
   *   @0x3c16e1  movq  %rsp, %rbp
   *   @0x3c16e4  ud2                               ; SIGILL — must never be reached
   *   @0x3c16e6  nopw  %cs:(%rax,%rax)             ; alignment padding
   *
   * Identical byte-for-byte to the D1 slot above (55 48 89 e5 0f 0b) but at
   * a different address (0x3c16e0 vs 0x3c16d0), i.e. these are TWO distinct
   * trap stubs — the linker did not ICF-fold them, so both `&D0` and `&D1`
   * remain independently addressable in the base vtable's two dtor slots.
   *
   * `ud2` is x86_64's canonical "raise SIGILL right here" trap. Emitted for
   * the deleting-destructor slot of an abstract base whose live subclass
   * override always shadows it — so any dispatch that landed HERE would be
   * a bug in the caller.
   *
   * TS models this as an unconditional throw citing the trap address.
   */
  destroy_D0(): never {
    // @0x3c16e4 — ud2 trap
    throw new Error(
      "HGTextureManagerHandle::~HGTextureManagerHandle() D0 @Helium 0x3c16e0 " +
        "is a `ud2` trap stub — the abstract base's deleting-dtor slot must " +
        "never be reached directly; the concrete subclass " +
        "HGTextureManagerHandleImpl overrides this vtable entry."
    );
  }
}
