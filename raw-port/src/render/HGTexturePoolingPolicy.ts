// HGTexturePoolingPolicy.ts — Helium's HGTexturePoolingPolicy: a small
// abstract HGObject subclass that carries one owned smart-pointer field
// (`HGRef<HGTextureManagerHandle>` stored at offset 0x10 on `this`) and
// exposes trivial get/set accessors for it. The base-object dtor
// (D2 @0x44c60) does the ref-drop; D1 and D0 are emitted as `ud2` traps —
// this class is abstract and the deleting/complete-object dtors are never
// meant to be dispatched directly (subclasses provide their own overrides).
//
// This is the standard Helium "policy" shape: a virtual base class with
// a single owned handle + refcount-manipulating accessors. The
// setManagerHandle vfn pattern (compare, release-old-if-different,
// store-new, retain-new via tail-jmp) is the classical "assignment
// operator on a smart pointer" idiom.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Helium.framework/Versions/A/Helium (x86_64 slice at file
//             offset 0x4000 + text VA).
// Disassembly saved at:
//   raw-port/re/disasm/Helium.HGTexturePoolingPolicy.C2Ev.s                        @0x44c30
//   raw-port/re/disasm/Helium.HGTexturePoolingPolicy.D2Ev.s                        @0x44c60
//   raw-port/re/disasm/Helium.HGTexturePoolingPolicy.16getManagerHandleEv.s        @0x44ca0
//   raw-port/re/disasm/Helium.HGTexturePoolingPolicy.16setManagerHandleE5HGRefI22HGTextureManagerHandleE.s  @0x44cb0
//   raw-port/re/disasm/Helium.HGTexturePoolingPolicy.D1Ev.s                        @0x3c16f0  (ud2 — abstract)
//   raw-port/re/disasm/Helium.HGTexturePoolingPolicy.D0Ev.s                        @0x3c1700  (ud2 — abstract)
//
// STRUCT LAYOUT (recovered from C2 / D2 / accessors):
//   HGTexturePoolingPolicy {
//     +0x000  vptr                    (set to vtable-for-HGTexturePoolingPolicy
//                                       @Helium __DATA_CONST via rip-relative
//                                       leaq — C2 @0x44c3e loads 0x9c2a13; D2
//                                       @0x44c66 loads 0x9c29eb — both resolve
//                                       to the same absolute vtable slot)
//     +0x008..+0x00f                  (HGObject base subobject tail — the
//                                       HGObject base occupies bytes 0x0..0x7
//                                       shared with the vptr slot; this
//                                       8-byte gap is padding to 16-byte
//                                       align the handle field)
//     +0x010  HGTextureManagerHandle* (owned, refcounted; nulled by C2
//                                       @0x44c48; released by D2 @0x44c82
//                                       via vtable slot 0x18; released +
//                                       replaced + retained by setManagerHandle
//                                       @0x44cd4/@0x44cea)
//   }
//
// The `HGRef<HGTextureManagerHandle>` argument to setManagerHandle is a
// simple pointer-holding smart pointer: its layout is just
//   struct HGRef<T> { T* raw; };
// deducible from setManagerHandle's `movq (%rsi), %rdi` @0x44cbe which
// extracts the raw pointer via a single indirection. The passed HGRef is
// consumed by-value (it lives on the caller's stack); this class only
// retains a fresh reference on the raw pointer, never on the HGRef itself.
//
// ─── C2 @Helium 0x44c30 (base-object ctor) ──────────────────────────────────
//   Arguments: %rdi = this
//   __ZN22HGTexturePoolingPolicyC2Ev:
//     0x44c30 push rbp/rsp/rbx/rax
//     0x44c36 movq  %rdi, %rbx
//     0x44c39 callq __ZN8HGObjectC2Ev              ; HGObject::HGObject()
//     0x44c3e leaq  0x9c2a13(%rip), %rax           ; = vtable-for-...
//     0x44c45 movq  %rax, (%rbx)                   ; this->vptr = vtable
//     0x44c48 movq  $0x0, 0x10(%rbx)               ; this->handle = null
//     0x44c50..0x44c56 epilogue / retq
//
// ─── D2 @Helium 0x44c60 (base-object dtor) ──────────────────────────────────
//   __ZN22HGTexturePoolingPolicyD2Ev:
//     0x44c60 push rbp/rsp/rbx/rax
//     0x44c66 leaq  0x9c29eb(%rip), %rax           ; = vtable-for-...
//     0x44c6d movq  %rax, (%rdi)                   ; reset vptr (defensive)
//     0x44c70 movq  0x10(%rdi), %rax               ; rax = this->handle
//     0x44c74 testq %rax, %rax
//     0x44c77 je    0x44c88                        ; skip if null
//     0x44c79 movq  (%rax), %rcx                   ; rcx = handle->vptr
//     0x44c7c movq  %rdi, %rbx
//     0x44c7f movq  %rax, %rdi                     ; arg1 = handle
//     0x44c82 callq *0x18(%rcx)                    ; handle->vptr[3] release
//     0x44c85 movq  %rbx, %rdi                     ; restore this
//     0x44c88 add $0x8,%rsp / pop rbx/rbp
//     0x44c8e jmp   __ZN8HGObjectD2Ev              ; tail-chain HGObject::~D2
//
// ─── D1 @Helium 0x3c16f0  (ud2 — abstract) ──────────────────────────────────
//   __ZN22HGTexturePoolingPolicyD1Ev:
//     0x3c16f0 push rbp / mov rsp,rbp / ud2
//
// ─── D0 @Helium 0x3c1700  (ud2 — abstract) ──────────────────────────────────
//   __ZN22HGTexturePoolingPolicyD0Ev:
//     0x3c1700 push rbp / mov rsp,rbp / ud2
//
//   The ud2 sled is Clang's emission for a virtual base class whose
//   complete-object and deleting dtors are marked pure or deleted — the
//   binary must ship a symbol at the mangled name (so the linker resolves
//   references from vtables and typeinfo), but the body raises an illegal
//   instruction trap so that hitting it at runtime crashes hard. Subclasses
//   supply their own overriding D1/D0 that actually run.
//
// ─── getManagerHandle @Helium 0x44ca0 ───────────────────────────────────────
//   __ZN22HGTexturePoolingPolicy16getManagerHandleEv:
//     0x44ca0 push rbp / mov rsp,rbp
//     0x44ca4 movq  0x10(%rdi), %rax               ; return this->handle
//     0x44ca8 pop rbp / retq
//
//   Trivial getter. Returns the raw pointer at +0x10 — no retain is
//   performed, so the returned HGRef-shape is unretained/borrowed. The
//   mangled return type is not `HGRef<T>` here despite the class field's
//   type being `HGRef<T>` — the compiler has already unwrapped the wrapper
//   for the return, so we return the raw pointer.
//
// ─── setManagerHandle @Helium 0x44cb0 ───────────────────────────────────────
//   Arguments: %rdi = this, %rsi = pointer to caller's HGRef<T>{raw}
//   __ZN22HGTexturePoolingPolicy16setManagerHandleE5HGRefI22HGTextureManagerHandleE:
//     0x44cb0 push rbp/rsp/r14/rbx
//     0x44cb7 movq  %rdi, %rbx                     ; save this
//     0x44cba movq  0x10(%rdi), %rax               ; rax = old = this->handle
//     0x44cbe movq  (%rsi), %rdi                   ; rdi = new = HGRef.raw
//     0x44cc1 cmpq  %rdi, %rax                     ; old == new ?
//     0x44cc4 je    0x44ced                        ; -> no-op, return
//     0x44cc6 testq %rax, %rax                     ; old == null ?
//     0x44cc9 je    0x44cda                        ; -> skip release-old
//     0x44ccb movq  %rsi, %r14                     ; save &new
//     0x44cce movq  (%rax), %rcx                   ; rcx = old->vptr
//     0x44cd1 movq  %rax, %rdi                     ; arg1 = old
//     0x44cd4 callq *0x18(%rcx)                    ; old->vptr[3] release
//     0x44cd7 movq  (%r14), %rdi                   ; rdi = new (reload)
//     0x44cda movq  %rdi, 0x10(%rbx)               ; this->handle = new
//     0x44cde testq %rdi, %rdi                     ; new == null ?
//     0x44ce1 je    0x44ced                        ; -> return
//     0x44ce3 movq  (%rdi), %rax                   ; rax = new->vptr
//     0x44ce6..0x44ce9 pop rbx/r14/rbp
//     0x44cea jmpq  *0x10(%rax)                    ; TAIL: new->vptr[2] retain
//     0x44ced pop rbx/r14/rbp / retq
//
//   Semantics: standard smart-pointer assignment.
//     1. Read old = this->handle and new = HGRef.raw.
//     2. If old == new, do nothing (self-assignment or same-value guard).
//     3. If old != null, call old->vfn18 (release/dec-ref).
//     4. Store new into this->handle.
//     5. If new != null, tail-jump to new->vfn10 (retain/inc-ref).
//
//   Vtable slot 0x10 is the retain vfn (called via tail-jmp so its return
//   value propagates — HGRef's retain vfn conventionally returns the
//   retained pointer). Vtable slot 0x18 is the release vfn (called with
//   a plain callq, return value discarded).
//
// FRONTIER CALLEES (undecoded — throwing stubs cite them):
//   __ZN8HGObjectC2Ev              HGObject::HGObject()          @0x44c39
//   __ZN8HGObjectD2Ev              HGObject::~HGObject()         @0x44c8e (tail-jmp)
//   HGTextureManagerHandle vfn @0x10 (retain)  — @0x44cea tail-jmp
//   HGTextureManagerHandle vfn @0x18 (release) — @0x44c82 @0x44cd4
//   ___clang_call_terminate                     — @0x44c96 (D2 landing pad)
//
// Numerics: none. Pure pointer bookkeeping.

/* eslint-disable @typescript-eslint/no-unused-vars */

import { HGObject_ctor, HGObject_dtor } from "./HGObject_stub.js";
import { HGTextureManagerHandle } from "./HGTextureManagerHandle.js";

/**
 * `HGRef<T>` — Helium's owning smart-pointer template. The mangled arg
 * `5HGRefI22HGTextureManagerHandleE` decodes to `HGRef<HGTextureManagerHandle>`.
 * Layout deduced from setManagerHandle @0x44cbe (`movq (%rsi), %rdi`): the
 * single field is the raw T* at offset 0. Not yet transcribed as its own
 * class; we model the caller's argument as `{ raw: T | null }`.
 */
export interface HGRef<T> {
  raw: T | null;
}

/**
 * Frontier: HGTextureManagerHandle vtable slot 0x10 — the handle's retain /
 * inc-ref vfn. Tail-jumped-to from setManagerHandle @0x44cea. Not yet
 * transcribed in HGTextureManagerHandle.ts (which currently only exports
 * the abstract class + vtable-slot-base constant).
 */
function HGTextureManagerHandle_vfn_0x10_retain(
  _self: HGTextureManagerHandle,
): HGTextureManagerHandle {
  // @0x44cea jmpq *0x10(new->vptr)
  throw new Error(
    "HGTextureManagerHandle vtable[0x10] (retain) @Helium @0x44cea not yet transcribed",
  );
}

/**
 * Frontier: HGTextureManagerHandle vtable slot 0x18 — the handle's release /
 * dec-ref vfn. Called from D2 @0x44c82 and setManagerHandle @0x44cd4. Not
 * yet transcribed.
 */
function HGTextureManagerHandle_vfn_0x18_release(
  _self: HGTextureManagerHandle,
): void {
  // @0x44c82 callq *0x18(old->vptr)  (D2)
  // @0x44cd4 callq *0x18(old->vptr)  (setManagerHandle)
  throw new Error(
    "HGTextureManagerHandle vtable[0x18] (release) @Helium @0x44c82/@0x44cd4 not yet transcribed",
  );
}

/**
 * `HGTexturePoolingPolicy` — Helium's abstract base for texture-pool
 * eviction/allocation policies. Owns one HGTextureManagerHandle via
 * refcounted smart-pointer semantics at offset 0x10.
 *
 * @Helium symbols owned by this class:
 *   C2               @0x44c30
 *   D2               @0x44c60
 *   getManagerHandle @0x44ca0
 *   setManagerHandle @0x44cb0
 *   D1               @0x3c16f0  (ud2 — abstract; unreachable at runtime)
 *   D0               @0x3c1700  (ud2 — abstract; unreachable at runtime)
 *
 * Struct fields:
 *   vptr                       (offset 0x000)
 *   HGObject base tail padding (offsets 0x008..0x00f)
 *   handle                     (offset 0x010 — HGTextureManagerHandle*, refcounted)
 */
export abstract class HGTexturePoolingPolicy {
  /**
   * The owned HGTextureManagerHandle at offset 0x10. Nulled in C2
   * @0x44c48; released and cleared by D2 @0x44c82; replaced with
   * release-old + retain-new by setManagerHandle @0x44cd4/@0x44cea.
   */
  handle: HGTextureManagerHandle | null = null;

  /**
   * HGTexturePoolingPolicy::HGTexturePoolingPolicy() [C2, base-object ctor]
   * @0x44c30.
   *
   *   @0x44c39 callq HGObject::HGObject()
   *   @0x44c3e leaq  vtable-for-... into rax
   *   @0x44c45 movq  %rax, (%rbx)                  // this->vptr = vtable
   *   @0x44c48 movq  $0x0, 0x10(%rbx)              // this->handle = null
   */
  constructor() {
    // @0x44c39 HGObject::HGObject()  (frontier — pure init; safe stub)
    HGObject_ctor(this);
    // @0x44c48
    this.handle = null;
  }

  /**
   * HGTexturePoolingPolicy::getManagerHandle() @0x44ca0.
   *
   *   @0x44ca4 movq  0x10(%rdi), %rax  // return this->handle
   *
   * Trivial getter — returns the borrowed raw pointer without retaining.
   */
  getManagerHandle(): HGTextureManagerHandle | null {
    // @0x44ca4
    return this.handle;
  }

  /**
   * HGTexturePoolingPolicy::setManagerHandle(HGRef<HGTextureManagerHandle>)
   * @0x44cb0.
   *
   *   @0x44cba movq 0x10(%rdi), %rax                // old = this->handle
   *   @0x44cbe movq (%rsi), %rdi                    // new = ref.raw
   *   @0x44cc1 cmpq %rdi, %rax                      // old == new ?
   *   @0x44cc4 je   0x44ced                         //   -> ret
   *   @0x44cc6 testq %rax, %rax                     // old == null ?
   *   @0x44cc9 je   0x44cda                         //   -> skip release
   *   @0x44cd4 callq *0x18(old->vptr)               // release old
   *   @0x44cda movq %rdi, 0x10(%rbx)                // this->handle = new
   *   @0x44cde testq %rdi, %rdi                     // new == null ?
   *   @0x44ce1 je   0x44ced                         //   -> ret
   *   @0x44cea jmpq *0x10(new->vptr)                // TAIL: retain new
   *
   * The three branches (early-out on self-assignment, skip release on null
   * old, skip retain on null new) are all preserved verbatim below.
   */
  setManagerHandle(ref: HGRef<HGTextureManagerHandle>): void {
    // @0x44cba
    const old = this.handle;
    // @0x44cbe
    const next = ref.raw;
    // @0x44cc1..@0x44cc4  early-out on identity
    if (old === next) {
      // @0x44ced pop / retq
      return;
    }
    // @0x44cc6..@0x44cc9  skip release-old if null
    if (old !== null) {
      // @0x44cd4 callq *0x18(old->vptr)
      HGTextureManagerHandle_vfn_0x18_release(old);
    }
    // @0x44cda
    this.handle = next;
    // @0x44cde..@0x44ce1  skip retain-new if null
    if (next !== null) {
      // @0x44cea jmpq *0x10(new->vptr)  (tail-jmp)
      HGTextureManagerHandle_vfn_0x10_retain(next);
    }
    // @0x44ced pop / retq
  }

  /**
   * HGTexturePoolingPolicy::~HGTexturePoolingPolicy() [D2, base-object dtor]
   * @0x44c60.
   *
   *   @0x44c6d movq %rax, (%rdi)                    // reset vptr (defensive)
   *   @0x44c70 movq 0x10(%rdi), %rax                // rax = this->handle
   *   @0x44c74 testq %rax, %rax
   *   @0x44c77 je   0x44c88                         // skip release if null
   *   @0x44c82 callq *0x18(handle->vptr)            // release handle
   *   @0x44c8e jmp  HGObject::~HGObject
   */
  destroy_D2(): void {
    // @0x44c6d vptr reset — no-op in TS.
    // @0x44c70..@0x44c85 release handle if non-null
    if (this.handle !== null) {
      HGTextureManagerHandle_vfn_0x18_release(this.handle);
    }
    // @0x44c8e tail-jmp HGObject::~HGObject
    HGObject_dtor(this);
  }

  /**
   * HGTexturePoolingPolicy::~HGTexturePoolingPolicy() [D1, complete-object
   * dtor] @0x3c16f0.
   *
   *   @0x3c16f4 ud2
   *
   * Abstract sentinel: reaching this at runtime is a hard bug (a concrete
   * subclass failed to override D1). Modeled as a throw so any accidental
   * caller trips loudly at test time.
   */
  destroy_D1(): void {
    // @0x3c16f4 ud2
    throw new Error(
      "HGTexturePoolingPolicy::~D1 is abstract (ud2 sentinel @Helium @0x3c16f4) — subclasses must override",
    );
  }

  /**
   * HGTexturePoolingPolicy::~HGTexturePoolingPolicy() [D0, deleting dtor]
   * @0x3c1700.
   *
   *   @0x3c1704 ud2
   *
   * Abstract sentinel — same rationale as D1.
   */
  destroy_D0(): void {
    // @0x3c1704 ud2
    throw new Error(
      "HGTexturePoolingPolicy::~D0 is abstract (ud2 sentinel @Helium @0x3c1704) — subclasses must override",
    );
  }
}
