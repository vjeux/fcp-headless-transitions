// HGArray_float_vector4_HGFormat28.ts -- Helium framework.
// HGArray<float vector[4], (HGFormat)28>::~HGArray() -- the D1 (complete-object)
// destructor of the HGArray template instantiation whose element type is a
// 4-lane single-precision float vector (`float vector[4]`) and whose HGFormat
// tag is 28. HGArray is a reference-counted array container: the HGArray object
// holds, at +0x00, a pointer to a shared control block (an HGArrayDataRef-style
// header) whose first word is an atomic reference count and whose +0x10 field is
// the heap-allocated element buffer. Destroying an HGArray atomically decrements
// the shared refcount; only when it reaches zero does it release the element
// buffer (operator delete[]) and then the control block itself (operator delete).
//
// Verbatim transcription of x86_64 disassembly from FCP's Helium framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// Source disasm: raw-port/re/disasm/Helium.__ZN7HGArrayIDv4_fL8HGFormat28EED1Ev.s (25 lines)
//
// -----------------------------------------------------------------------------
// FULL DISASM (@Helium 0xdc0f0  __ZN7HGArrayIDv4_fL8HGFormat28EED1Ev)
// -----------------------------------------------------------------------------
//   0xdc0f0  pushq %rbp ; movq %rsp,%rbp ; pushq %rbx ; pushq %rax   ; frame
//   0xdc0f6  movq  (%rdi), %rbx              ; rbx = this->dataRef (control block ptr, +0x00)
//   0xdc0f9  testq %rbx, %rbx                ; if (dataRef == null)
//   0xdc0fc  je    0xdc11f                    ;   -> return (nothing to release)
//   0xdc0fe  lock                             ; atomic
//   0xdc0ff  decl  (%rbx)                     ;   --(*dataRef)   (refcount at cb+0x00, 32-bit)
//   0xdc101  jne   0xdc11f                    ; if (refcount != 0) -> return (still shared)
//   0xdc103  movq  0x10(%rbx), %rdi           ; rdi = dataRef->buffer (element storage, +0x10)
//   0xdc107  testq %rdi, %rdi                 ; if (buffer == null)
//   0xdc10a  je    0xdc111                     ;   skip delete[]
//   0xdc10c  callq __ZdaPv                      ; operator delete[](buffer)   (C++ runtime extern)
//   0xdc111  movq  %rbx, %rdi                  ; rdi = dataRef (control block)
//   0xdc114  addq $0x8,%rsp ; popq %rbx ; popq %rbp
//   0xdc11a  jmp   __ZdlPv                      ; TAIL: operator delete(dataRef) (C++ runtime extern)
//   0xdc11f  addq $0x8,%rsp ; popq %rbx ; popq %rbp ; retq            ; return (no free)
//
// The `lock decl (%rbx)` is the atomic release; only the thread that observes the
// post-decrement count == 0 (ZF set, `jne` NOT taken) proceeds to free. Both
// frees are out-of-scope C++ runtime externs (Itanium ABI `operator delete[]`
// __ZdaPv @0x3c4f9a and `operator delete` __ZdlPv @0x3c4fa0), modelled below as
// NO-OP boundaries per the deallocation/lifetime-primitive ruling; the refcount
// + null-guard control flow is transcribed exactly.

/**
 * The shared, reference-counted control block an HGArray points at (+0x00).
 * Only the fields this destructor touches are modelled:
 *   +0x00  refCount  : atomic 32-bit reference count
 *   +0x10  buffer    : heap-allocated element storage (operator new[]'d), or null
 */
interface HGArrayDataRef_f4_28 {
  /** +0x00 atomic 32-bit reference count (`lock decl (%rbx)` @0xdc0ff). */
  refCount: number;
  /** +0x10 element buffer pointer (@0xdc103); null when unallocated. */
  buffer: object | null;
}

export class HGArray_float_vector4_HGFormat28 {
  /** +0x00 pointer to the shared refcounted control block; null when empty. */
  dataRef: HGArrayDataRef_f4_28 | null = null;

  /** Boundary: Itanium C++ ABI `operator delete[]` (__ZdaPv @Helium 0x3c4f9a,
   *  called @0xdc10c). Out-of-scope C++ runtime.
   *
   *  DEALLOCATION primitive, so the faithful boundary model is a NO-OP, not a
   *  throw — the same ruling the CFRelease family already carries on main
   *  (`infra/PCCFRef_CFString.ts`, `infra/PCURL.ts`'s CFRetain), and the same
   *  treatment the landed OZNotificationManager port gives its `operator
   *  delete` @0x4bdff. JS GC owns the surrogate objects; there is no native
   *  block for a fake free to release, and the real call produces no value.
   *
   *  It is also the difference between a boundary marker and a deleted
   *  function body: @0xdc10c is on the ORDINARY last-reference path — the
   *  branch taken whenever `lock decl` brings the refcount to 0, which is what
   *  a destructor exists to do — and @0xdc11a is a TAIL call, so a throw at
   *  either point means the dtor can never return normally on that path. */
  private static __operatorDeleteArray(_buffer: object | null): void {
    // @0xdc10c stub 0x3c4f9a — TS-side no-op. See the doc comment for policy.
  }

  /** Boundary: Itanium C++ ABI `operator delete` (__ZdlPv @Helium 0x3c4fa0,
   *  tail-called @0xdc11a). Out-of-scope C++ runtime. NO-OP for the same
   *  reason as `__operatorDeleteArray` above: a deallocation primitive, on the
   *  last-reference path, reached by a TAIL jump that IS the function's
   *  return. */
  private static __operatorDelete(_block: object): void {
    // @0xdc11a stub 0x3c4fa0 — TS-side no-op. See the doc comment for policy.
  }

  /**
   * HGArray<float vector[4], (HGFormat)28>::~HGArray()
   * @0xdc0f0 Helium  (__ZN7HGArrayIDv4_fL8HGFormat28EED1Ev)
   *
   * Atomically releases one reference to the shared control block; on the last
   * reference (refcount hits 0) frees the element buffer then the block itself.
   * Returns void.
   *
   * ORACLE — raw-port/re/oracle/HGArray_float_vector4_HGFormat28_oracle.py
   *   (+ HGArray_float_vector4_HGFormat28_driver.mts; run it with
   *    arch -x86_64 /usr/bin/python3 raw-port/re/oracle/HGArray_float_vector4_HGFormat28_oracle.py)
   * The symbol is LOCAL (nm class t), so it is called at slide + 0xdc0f0 from
   * the cached x86_64 inventory, and the prologue bytes at that address are
   * checked against 55 48 89 e5 53 50 before any number is reported. The
   * control block and the element buffer are real malloc blocks, allocated
   * NON-ADJACENTLY with a live spacer between them (macOS coalesces two
   * neighbouring freed blocks, which reads as "nothing was freed" on the one
   * case where both frees happen). Whether a free happened is read as
   * malloc_size(p) == 0, which is stable run to run; address reuse is not, and
   * is deliberately not part of the verdict.
   * Measured, 5 cases, 0 divergences: a NULL dataRef frees nothing @0xdc0fc;
   * refcount 3 and 2 decrement to 2 and 1 and free nothing @0xdc101; refcount 1
   * with a buffer frees delete[] then delete, in that order; refcount 1 with a
   * NULL buffer frees only the block, skipping delete[] @0xdc10a. The 24 arena
   * bytes past the +0x00 slot are untouched in every case. The TypeScript side
   * is this file, imported by the driver, with the two boundary statics
   * replaced by recorders so the free ORDER is observable.
   * NEGATIVE CONTROL — the pre-fix model, in which both boundaries throw, is
   * run in the same node process and killed on 2 of the 5 cases: exactly the
   * two whose refcount reaches 0. On rc1-with-buffer it records delete[] and
   * then unwinds, so the tail delete @0xdc11a never happens at all. That is the
   * defect review named, reproduced by execution rather than described.
   */
  destroy(): void {
    // @0xdc0f6 movq (%rdi),%rbx : dataRef = this->dataRef (+0x00)
    const dataRef = this.dataRef;
    // @0xdc0f9 testq %rbx,%rbx ; @0xdc0fc je -> return
    if (dataRef === null) {
      return;
    }
    // @0xdc0fe lock ; @0xdc0ff decl (%rbx) : atomic --dataRef->refCount (32-bit)
    dataRef.refCount = (dataRef.refCount - 1) | 0;
    // @0xdc101 jne -> return : if refcount != 0, another owner remains
    if (dataRef.refCount !== 0) {
      return;
    }
    // last reference: free the element buffer, then the control block
    // @0xdc103 movq 0x10(%rbx),%rdi ; @0xdc107 testq %rdi,%rdi ; @0xdc10a je -> skip delete[]
    if (dataRef.buffer !== null) {
      // @0xdc10c callq __ZdaPv : operator delete[](buffer)  (C++ runtime boundary)
      HGArray_float_vector4_HGFormat28.__operatorDeleteArray(dataRef.buffer);
    }
    // @0xdc111 movq %rbx,%rdi ; @0xdc11a jmp __ZdlPv : TAIL operator delete(dataRef) (boundary)
    HGArray_float_vector4_HGFormat28.__operatorDelete(dataRef);
  }
}
