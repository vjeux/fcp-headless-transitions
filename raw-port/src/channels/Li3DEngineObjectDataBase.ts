// Li3DEngineObjectDataBase — Ozone framework
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone (x86_64 slice).
//
// Layout observed from D1/D0 destructors:
//   +0x00  : vtable slot  (set to __ZTV24Li3DEngineObjectDataBase + 0x10 @0x3c0969)
//   +0xa8  : embedded PCArray<LiLight> subobject — its own vtable slot is at +0xa8
//            (set to __ZTV7PCArrayI7LiLight14PCArray_TraitsIS0_EE + 0x10 @0x3c097e).
//   +0xb0  : int32 — size/logical-count of the PCArray<LiLight> (read @0x3c0990).
//   +0xb8  : pointer — heap storage for the PCArray<LiLight>, freed via __ZdaPv
//            (operator delete[]) @0x3c09b3 when non-null.
//
// Instance methods:
//   0x003c0960  ~Li3DEngineObjectDataBase() [D1]  — real work
//   0x003c09e0  ~Li3DEngineObjectDataBase() [D0]  — D1 body + operator delete
//   0x003c0a50  getHelium3DEngine(LiAgent&)      — empty stub (pushq/popq/ret) — likely
//                                                  overridden by a subclass; the base
//                                                  returns nothing / no side effects.
//   0x003c0a60  applyChanges(SCNScene*, HGMTLDeviceType, float)   — empty stub
//   0x003c0a70  unapplyChanges(SCNScene*, HGMTLDeviceType)        — empty stub

/* eslint-disable @typescript-eslint/no-unused-vars */

// Frontier / not-yet-ported types this class references.
// - PCArray<LiLight>                (base of the +0xa8 subobject; resize(int,int) called
//                                     @0x3c09a2 with (esi=0, edx=max(1,size)))
// - LiLight                          (element type of the PCArray)
// - LiAgent                          (getHelium3DEngine arg — ref)
// - Helium3DEngine                   (nominal return of getHelium3DEngine)
// - SCNScene                         (ObjC SceneKit type; apply/unapplyChanges arg)
// - HGMTLDeviceType                  (Metal device tag; enum-like)
export type LiLight = unknown;
export type LiAgent = unknown;
export type Helium3DEngine = unknown;
export type SCNScene = unknown;
export type HGMTLDeviceType = unknown;

/**
 * PCArray<LiLight> subobject-shaped slot at +0xa8. Only the fields actually
 * touched by the dtor are modelled; PCArray internals live in its own port.
 */
export interface PCArrayLiLight {
  /** +0xa8 (=+0x00 of subobject): vtable slot */
  vtable: unknown;
  /** +0xb0 (=+0x08 of subobject): logical size (int32) */
  size: number;
  /** +0xb8 (=+0x10 of subobject): heap storage pointer (or null) */
  storage: LiLight[] | null;
}

/**
 * Li3DEngineObjectDataBase — the base data-holder for a 3D-engine object in
 * Ozone. It owns an embedded PCArray<LiLight> subobject. All three virtual-ish
 * ops (getHelium3DEngine, applyChanges, unapplyChanges) are empty in the base
 * class; concrete subclasses override them.
 */
export class Li3DEngineObjectDataBase {
  /** +0xa8..+0xc0 — embedded PCArray<LiLight> subobject */
  public lights: PCArrayLiLight = { vtable: null, size: 0, storage: null };

  /**
   * Li3DEngineObjectDataBase::~Li3DEngineObjectDataBase() [D1] @0x003c0960
   *
   * Asm (verbatim):
   *   0x3c0969  leaq __ZTV24Li3DEngineObjectDataBase(%rip), %rax
   *   0x3c0970  addq $0x10, %rax                      ; skip the 2 typeinfo/offset entries
   *   0x3c0974  movq %rax, (%rdi)                     ; this->vtable = &vtbl[+0x10]
   *   0x3c0977  addq $0xa8, %rdi                      ; step into PCArray subobject
   *   0x3c097e  leaq __ZTV7PCArrayI7LiLight14PCArray_TraitsIS0_EE(%rip), %rax
   *   0x3c0985  addq $0x10, %rax
   *   0x3c0989  movq %rax, 0xa8(%rbx)                 ; subobject vtable
   *   0x3c0990  movl 0xb0(%rbx), %eax                 ; eax = this->lights.size
   *   0x3c0996  testl %eax, %eax
   *   0x3c0998  movl $0x1, %edx                       ; edx = 1
   *   0x3c099d  cmovnsl %eax, %edx                    ; edx = (eax>=0) ? eax : 1  → max(1, eax) for non-negative; for negative keeps 1
   *   0x3c09a0  xorl %esi, %esi                       ; esi = 0
   *   0x3c09a2  callq PCArray<LiLight>::resize(int esi=0, int edx=...)
   *   0x3c09a7  movq 0xb8(%rbx), %rdi                 ; rdi = this->lights.storage
   *   0x3c09ae  testq %rdi, %rdi
   *   0x3c09b1  je   0x3c09b8                         ; if (storage) delete[] storage
   *   0x3c09b3  callq __ZdaPv                         ; operator delete[]
   *   0x3c09b8  movq $0, 0xb8(%rbx)                   ; this->lights.storage = null
   *   0x3c09c3  movl $0, 0xb0(%rbx)                   ; this->lights.size = 0
   *   0x3c09d3  retq
   *   (0x3c09d4 tail: exception cleanup → ___clang_call_terminate)
   *
   * Note the cmov trick: for `eax < 0` the flags cause cmovns to NOT overwrite,
   * leaving edx=1; for `eax >= 0` it copies eax. So the arg is
   *   arg = (size >= 0) ? size : 1
   * which is defensive against a negative logical-size sentinel. We mirror it
   * exactly rather than folding to Math.max.
   */
  dtorD1(): void {
    // @0x3c0969..@0x3c0989 : reinstall base vtable pointers (no-op in TS).
    // @0x3c0990 : eax = this.lights.size
    const size = this.lights.size | 0;
    // @0x3c0996..@0x3c099d : edx = (size >= 0) ? size : 1
    const resizeArg = (size >= 0) ? size : 1;
    // @0x3c09a2 : PCArray<LiLight>::resize(newSize=0, capacityHint=resizeArg)
    Li3DEngineObjectDataBase.PCArray_LiLight_resize(this.lights, 0, resizeArg);
    // @0x3c09a7..@0x3c09b3 : if storage != null, operator delete[] storage
    if (this.lights.storage !== null) {
      // @0x3c09b3 : callq __ZdaPv (operator delete[]) — GC handles this in TS.
      // (nothing to do — releasing the reference is enough)
    }
    // @0x3c09b8 : this.lights.storage = null
    this.lights.storage = null;
    // @0x3c09c3 : this.lights.size = 0
    this.lights.size = 0;
  }

  /**
   * Li3DEngineObjectDataBase::~Li3DEngineObjectDataBase() [D0] @0x003c09e0
   *
   * Byte-for-byte identical body to D1 (same instructions @0x3c09e9–@0x3c0a33),
   * then instead of returning it jmps to __ZdlPv (operator delete) @0x3c0a41 to
   * free the whole object. We reuse dtorD1() then hand back to the ambient
   * allocator (no-op in TS).
   */
  dtorD0(): void {
    // @0x3c09e9..@0x3c0a33 : same body as D1.
    this.dtorD1();
    // @0x3c0a41 : jmp __ZdlPv (operator delete) — GC handles this in TS.
  }

  /**
   * Li3DEngineObjectDataBase::getHelium3DEngine(LiAgent&) @0x003c0a50
   *
   * Asm:
   *   0x3c0a50  pushq %rbp
   *   0x3c0a51  movq  %rsp, %rbp
   *   0x3c0a54  popq  %rbp
   *   0x3c0a55  retq
   *
   * Empty base — returns nothing (return type in the mangled symbol is a
   * pointer/reference, meaning rax is undefined here; concrete subclasses
   * override to yield an actual Helium3DEngine). To keep call-sites honest we
   * raise: this base implementation isn't supposed to be invoked directly.
   */
  getHelium3DEngine(_agent: LiAgent): Helium3DEngine {
    // Empty base body @0x003c0a50 (rax is unset; would be UB to consume).
    // Callers must go through an override; raise the mismatch loudly.
    throw new Error('Li3DEngineObjectDataBase.getHelium3DEngine @0x003c0a50 base body is empty (subclass must override)');
  }

  /**
   * Li3DEngineObjectDataBase::applyChanges(SCNScene*, HGMTLDeviceType, float) @0x003c0a60
   *
   * Empty body (pushq/movq/popq/retq) — base does nothing; subclasses override.
   */
  applyChanges(_scene: SCNScene, _dev: HGMTLDeviceType, _f: number): void {
    // no-op @0x003c0a60
  }

  /**
   * Li3DEngineObjectDataBase::unapplyChanges(SCNScene*, HGMTLDeviceType) @0x003c0a70
   *
   * Empty body (pushq/movq/popq/retq) — base does nothing; subclasses override.
   */
  unapplyChanges(_scene: SCNScene, _dev: HGMTLDeviceType): void {
    // no-op @0x003c0a70
  }

  /**
   * Frontier callee — PCArray<LiLight, PCArray_Traits<LiLight>>::resize(int, int)
   * called @0x003c09a2 (and again @0x003c0a22). Not yet transcribed; raises so
   * the demand for PCArray is visible.
   */
  private static PCArray_LiLight_resize(
    _arr: PCArrayLiLight,
    _newSize: number,
    _capacityHint: number,
  ): void {
    throw new Error('PCArray<LiLight>::resize(int,int) @callq 0x003c09a2 not yet transcribed');
  }
}
