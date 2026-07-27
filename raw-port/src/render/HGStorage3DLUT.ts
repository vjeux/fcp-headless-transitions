// HGStorage3DLUT.ts — Helium's HGStorage3DLUT class (destructor pair only).
//
// Faithful transcription from the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium
//
// Source disassembly:
//   raw-port/re/disasm/Helium.HGStorage3DLUT.~HGStorage3DLUT.s
//     (contains __ZN14HGStorage3DLUTD0Ev @0x74170 — the "deleting" dtor)
//   The base dtor __ZN14HGStorage3DLUTD1Ev @0x74130 is included inline in
//   the notes below (same otool -tV dump, adjacent symbol).
//
// -----------------------------------------------------------------------------
// vtable resolved via `raw-port/army/tools/resolve.py Helium vtable HGStorage3DLUT`
//   HGStorage3DLUT vtable  @0xa09d00
//   installed ptr          @0xa09d10  (points past the 2-qword RTTI prefix)
//   *0x00 -> 0x74130  HGStorage3DLUT::~HGStorage3DLUT()  (D1 = base dtor)
//   *0x08 -> 0x74170  HGStorage3DLUT::~HGStorage3DLUT()  (D0 = deleting dtor)
//   *0x10 -> 0x1a0f20 HGObject::Retain()
//   *0x18 -> 0x1a0f30 HGObject::Release()
//   *0x20 -> 0x1a0f50 HGObject::debugDescription() const
//   *0x30 -> 0x3cce39 typeinfo name for HGStorage3DLUT
//   *0x38 -> 0xa24ae8 typeinfo for HGObject
//   *0x40..            hg_read_span_* function-pointer table (per pixel layout /
//                      gamma-transform combination). NOT invoked by the
//                      destructors; documented here only as evidence that
//                      HGStorage3DLUT derives from HGObject and stores an array
//                      of read-span function pointers as part of its vtable.
//
// -----------------------------------------------------------------------------
// HGStorage3DLUT LAYOUT (recovered strictly from the two dtors)
//
//   The base dtor (@0x74130) touches exactly:
//     - (this + 0x00): the vtable pointer, overwritten with the installed
//                      HGStorage3DLUT vtable pointer @0xa09d10
//                      (RIP-relative leaq 0x995bd9(%rip) at 0x74130
//                       ->  0x74137 + 0x995bd9 = 0xa09d10   ✓ )
//     - (this + 0x18): a pointer to a heap-allocated array; released via
//                      operator delete[] (`__ZdaPv`) when non-null. This is
//                      the 3-D LUT sample buffer owned by the object.
//     - (this + 0x10): 16 bytes cleared with `movups %xmm0, 0x10(%rdi)` after
//                      the delete[] branch merges. That 16-byte window
//                      overlaps the LUT-buffer pointer at +0x18, so it zeros
//                      TWO 8-byte fields side-by-side:
//                        +0x10  (uintptr) — meaning unknown from these dtors
//                                            alone; conservatively a paired
//                                            metadata slot (e.g. size/stride
//                                            or a companion pointer). Left
//                                            as an untyped 64-bit field.
//                        +0x18  (void*)   — the LUT buffer pointer just freed.
//
//   The deleting dtor (@0x74170) additionally frees the whole object via
//   `HGObject::operator delete(void*)` (@0x1a01d0 tail-called at 0x741a9).
//
//   Everything else (the read_span[] vtable tail, HGObject subobject) is
//   inherited/laid out but NOT read or written by either destructor, so it is
//   NOT declared here. Any richer field model must come from a decoded ctor
//   or member function — do not invent it.
//
// -----------------------------------------------------------------------------
// Ported cross-refs used below:
//   `operator_delete_array` — the C++ ABI `__ZdaPv` runtime stub
//       (@0x3c4f9a in Helium's __TEXT.__stubs). Modelled as a THROWing stub
//       because JS/TS has garbage collection: the raw-port has no notion of
//       "free a native heap buffer". If a caller ever reaches this in a live
//       simulation we want to know.
//   `HGObject_D2` — HGObject::~HGObject() @0x1a0ed0. The disasm shows it
//       is a pure vtable-slot re-install (leaq 0x883be5(%rip) into (rdi)).
//       There is no ported HGObject class yet, so this is a THROWing stub
//       matching Rule 3.
//   `HGObject_operator_delete` — HGObject::operator delete(void*) @0x1a01d0
//       (tail-jmp target of the deleting dtor). Also a THROWing stub.
//
// -----------------------------------------------------------------------------

/**
 * Address of the installed vtable pointer for HGStorage3DLUT.
 * Read from `leaq 0x995bd9(%rip), %rax` at @0x74130:
 *   RIP-after-instruction = 0x74137
 *   target = 0x74137 + 0x995bd9 = 0xa09d10
 * Confirmed by `resolve.py Helium sym 0xa09d10` -> "vtable for HGStorage3DLUT (+0x10)".
 */
export const HGStorage3DLUT_VTABLE_PTR = 0xa09d10;

/**
 * Address of the installed vtable pointer used by HGObject::~HGObject() @0x1a0ed0
 * (documented for parity — not read from TS since HGObject_D2 is a stub).
 *   leaq 0x883be5(%rip), %rax  ; RIP-after = 0x1a0edb ; +0x883be5 = 0xa24ac0
 */
export const HGObject_VTABLE_PTR = 0xa24ac0;

/** Object memory layout consumed by the two destructors. */
export interface HGStorage3DLUT_Object {
  /** +0x00 — vtable pointer; overwritten by the dtor. */
  vtable: number;
  /**
   * +0x10 — companion 64-bit slot cleared alongside +0x18 by
   * `movups %xmm0, 0x10(%rbx)` / `movups %xmm0, 0x10(%rdi)`.
   * Purpose not decodable from the dtors alone; kept as a raw slot.
   */
  slot10: bigint;
  /**
   * +0x18 — pointer to a heap-allocated LUT sample buffer.
   * Freed with operator delete[] when non-null; then zeroed.
   * Modelled as `unknown` because TS owns no native heap — the value
   * carried here corresponds to whatever the caller stored.
   */
  lutBuffer: unknown | null;
}

// ------ throwing stubs for undecoded callees (per porting spec rule 3) ------

/** __ZdaPv @0x3c4f9a — `operator delete[](void*)`. */
function operator_delete_array(_p: unknown): void {
  throw new Error(
    "operator delete[] (__ZdaPv) @0x3c4f9a not yet transcribed — " +
      "raw heap free has no direct TS equivalent"
  );
}

/** __ZN8HGObjectD2Ev @0x1a0ed0 — HGObject::~HGObject() (base). */
function HGObject_D2(_this: HGStorage3DLUT_Object): void {
  throw new Error("HGObject::~HGObject() @0x1a0ed0 not yet transcribed");
}

/** __ZN8HGObjectdlEPv @0x1a01d0 — HGObject::operator delete(void*). */
function HGObject_operator_delete(_p: unknown): void {
  throw new Error(
    "HGObject::operator delete(void*) @0x1a01d0 not yet transcribed"
  );
}

// ------------------------------ D1 (base) -----------------------------------
/**
 * `HGStorage3DLUT::~HGStorage3DLUT()` — base (non-deleting) destructor.
 * Symbol: __ZN14HGStorage3DLUTD1Ev
 *
 * Faithful transcription @0x74130:
 * ```
 *   0x74130  leaq   0x995bd9(%rip), %rax     ; rax = &vtable_installed (0xa09d10)
 *   0x74137  movq   %rax, (%rdi)             ; this->vtable = 0xa09d10
 *   0x7413a  movq   0x18(%rdi), %rax         ; rax = this->lutBuffer
 *   0x7413e  testq  %rax, %rax
 *   0x74141  je     0x7415d                  ; skip delete[] if null
 *   0x74143  pushq  %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
 *   0x74149  movq   %rdi, %rbx               ; save this in rbx
 *   0x7414c  movq   %rax, %rdi               ; arg = lutBuffer
 *   0x7414f  callq  __ZdaPv (stub @0x3c4f9a) ; operator delete[](lutBuffer)
 *   0x74154  movq   %rbx, %rdi               ; restore this
 *   0x74157..0x7415c  epilogue of the delete-branch (pops)
 *   0x7415d  xorps  %xmm0, %xmm0
 *   0x74160  movups %xmm0, 0x10(%rdi)        ; this->slot10=0; this->lutBuffer=null
 *   0x74164  jmp    __ZN8HGObjectD2Ev @0x1a0ed0 ; tail-call base HGObject dtor
 * ```
 */
export function HGStorage3DLUT_D1(self: HGStorage3DLUT_Object): void {
  // @0x74130..0x74137 — install this class's vtable slot.
  self.vtable = HGStorage3DLUT_VTABLE_PTR;

  // @0x7413a..0x7414f — if this->lutBuffer != null, operator delete[] it.
  const buf = self.lutBuffer; // movq 0x18(%rdi), %rax
  if (buf !== null && buf !== undefined) {
    // testq %rax,%rax / je fallthrough
    operator_delete_array(buf); // callq __ZdaPv
  }

  // @0x7415d..0x74163 — xorps xmm0 ; movups xmm0, 0x10(this)
  //   Two 8-byte fields at +0x10 and +0x18 are both cleared to zero.
  self.slot10 = 0n;
  self.lutBuffer = null;

  // @0x74164 — jmp HGObject::~HGObject()  (tail call, so no extra work after).
  HGObject_D2(self);
}

// ------------------------------ D0 (deleting) -------------------------------
/**
 * `HGStorage3DLUT::~HGStorage3DLUT()` — deleting destructor.
 * Symbol: __ZN14HGStorage3DLUTD0Ev
 *
 * Faithful transcription @0x74170:
 * ```
 *   0x74170  pushq  %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
 *   0x74176  movq   %rdi, %rbx               ; save this
 *   0x74179  leaq   0x995b90(%rip), %rax     ; rax = &vtable_installed (0xa09d10)
 *   0x74180  movq   %rax, (%rdi)             ; this->vtable = 0xa09d10
 *   0x74183  movq   0x18(%rdi), %rdi         ; rdi = this->lutBuffer
 *   0x74187  testq  %rdi, %rdi
 *   0x7418a  je     0x74191                  ; skip delete[] if null
 *   0x7418c  callq  __ZdaPv (stub @0x3c4f9a) ; operator delete[](lutBuffer)
 *   0x74191  xorps  %xmm0, %xmm0
 *   0x74194  movups %xmm0, 0x10(%rbx)        ; slot10=0; lutBuffer=null
 *   0x74198  movq   %rbx, %rdi
 *   0x7419b  callq  __ZN8HGObjectD2Ev @0x1a0ed0 ; base HGObject dtor
 *   0x741a0  movq   %rbx, %rdi               ; arg = this
 *   0x741a3  addq   $0x8,%rsp / popq %rbx / popq %rbp
 *   0x741a9  jmp    __ZN8HGObjectdlEPv @0x1a01d0 ; HGObject::operator delete(this)
 * ```
 *
 * The D0 form is structurally identical to D1 through the buffer-free and
 * zeroing block. Where D1 tail-jumps into HGObject's base dtor, D0 first
 * CALLs the base dtor (so control returns) and then tail-jmps to
 * HGObject::operator delete(this) to release the object storage itself.
 */
export function HGStorage3DLUT_D0(self: HGStorage3DLUT_Object): void {
  // @0x74179..0x74180 — install vtable.
  self.vtable = HGStorage3DLUT_VTABLE_PTR;

  // @0x74183..0x7418c — operator delete[] the LUT buffer if non-null.
  const buf = self.lutBuffer;
  if (buf !== null && buf !== undefined) {
    operator_delete_array(buf);
  }

  // @0x74191..0x74197 — clear the [+0x10, +0x20) 16-byte window.
  self.slot10 = 0n;
  self.lutBuffer = null;

  // @0x74198..0x7419b — call (not jmp) the HGObject base destructor.
  HGObject_D2(self);

  // @0x741a9 — tail-jmp HGObject::operator delete(this).
  HGObject_operator_delete(self);
}
