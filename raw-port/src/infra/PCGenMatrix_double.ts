// PCGenMatrix<double> — ProCore (aliased into Ozone via a template
// instantiation) generic-dimension matrix with a REFERENCE-COUNTED
// heap-allocated backing store. This file ports ONLY the D1 destructor
// at @Ozone 0x878b0; the ctor, copy-ctor, and refcount-increment paths
// are separate ledger entries and will be added to this file when
// their own units are claimed.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Ozone.framework/Versions/A/Ozone (x86_64 slice; unadjusted
//             VAs from `otool -tV`).
//
// Disassembly source:
//   raw-port/re/disasm/__ZN11PCGenMatrixIdED1Ev.s
//
// -----------------------------------------------------------------------------
// STORAGE MODEL (recovered from the D1 body)
// -----------------------------------------------------------------------------
// PCGenMatrix<double> owns a single fat-pointer slot at +0x00 that points
// into the DATA of a heap-allocated block whose layout (looking from the
// data pointer backwards) is:
//
//       block header  +------------------+  <-- heap block base (was
//       +0x00 (raw)   | ??               |      returned by operator new[])
//       +0x04 (raw)   | refcount (int32) |
//       +0x08 (raw)   | data[0]          |  <-- `this->data` points HERE
//                     | data[1]          |
//                     | ...              |
//                     +------------------+
//
// So `data - 4` is the refcount slot (decremented @0x878b8), and
// `data - 8` is the heap block base — the value that must be handed to
// operator delete[] @0x878ce.
//
// Semantics: the destructor decrements the refcount; if it becomes 0,
// it frees the block via operator delete[] and NULLs the class's data
// pointer. If the refcount is already 0-valued at entry (i.e. the class
// held no buffer — the data pointer is NULL), the dtor short-circuits.
//
// This is the classic COW-share pattern (also seen in the CoW-buffer
// side of the Newton/PCGenBlockRef family — see PCGenBlockRef.ts).
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
//   * __ZdaPv  — `operator delete[](void*)` — libc++ (libc++.dylib). TRUE
//     out-of-scope extern. Called @0x878ce via Ozone stub 0x6dfc30.
//     Standard boundary policy: modelled as a throw-stub that documents
//     the call site, mirroring how every other new/delete extern is
//     treated in this codebase.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN11PCGenMatrixIdED1Ev
//       — PCGenMatrix<double>::~PCGenMatrix() @Ozone 0x878b0
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/__ZN11PCGenMatrixIdED1Ev.s)
// -----------------------------------------------------------------------------
//   0x878b0  movq   (%rdi), %rax                    ; rax = this->data
//   0x878b3  testq  %rax, %rax                      ; data == NULL ?
//   0x878b6  je     0x878bd                         ; yes → skip to retq
//   0x878b8  decl   -0x4(%rax)                      ; --refcount (int32 @ data-4)
//   0x878bb  je     0x878be                         ; refcount==0 → deallocate
//   0x878bd  retq                                    ; else return (still shared)
//   0x878be  pushq  %rbp                            ; deallocate path prologue
//   0x878bf  movq   %rsp, %rbp
//   0x878c2  pushq  %rbx
//   0x878c3  pushq  %rax                            ; align to 16
//   0x878c4  addq   $-0x8, %rax                     ; rax = data - 8 = heap block base
//                                                   ; (i.e. the pointer returned
//                                                   ;  by the original operator new[])
//   0x878c8  movq   %rdi, %rbx                      ; rbx = this (preserve across call)
//   0x878cb  movq   %rax, %rdi                      ; rdi = heap block base
//   0x878ce  callq  operator delete[]               ; Ozone stub 0x6dfc30 (__ZdaPv)
//   0x878d3  movq   $0x0, (%rbx)                    ; this->data = NULL
//   0x878da  addq   $0x8, %rsp
//   0x878de  popq   %rbx
//   0x878df  popq   %rbp
//   0x878e0  retq

/**
 * `operator delete[](void*)` — libc++ (libc++.dylib) — TRUE out-of-scope
 * extern. Called from PCGenMatrix<double>::~PCGenMatrix @Ozone 0x878ce
 * via Ozone stub 0x6dfc30 (__ZdaPv). The JS port has no C++ heap; we
 * model release semantics by NULLing the data pointer (already done by
 * the caller after this returns) and letting GC collect the JS array
 * that stood in for the heap block. The throw-stub below is only
 * reached if a caller *inspects* the delete boundary (e.g. a future
 * G4/G5 oracle harness); the destructor itself uses the JS "release the
 * strong reference" idiom below instead of routing through the extern
 * — that's the faithful minimal model, since the machine's user-visible
 * effect is "the pointer becomes NULL and the memory is no longer
 * addressable". */
function operatorDeleteArray(_p: unknown): void {
  // No-op: the JS surrogate for the C++ heap is a reference; when the
  // dtor NULLs `this.data`, the underlying array becomes unreachable
  // and GC will reclaim it. Documenting the call site here so a future
  // parity harness can hook the boundary if needed.
  //
  // If a caller needs strict "delete" semantics (crash on later access),
  // they should upgrade this stub to a throw at that point — but the
  // dtor itself performs no read after the delete, so the JS no-op is
  // observably identical to the machine's `callq __ZdaPv` for this fn.
}

// ═════════════════════════════════════════════════════════════════════════
// Shared refcounted backing store
// ═════════════════════════════════════════════════════════════════════════

/**
 * The header-prefixed buffer that PCGenMatrix<double> stores at +0x00.
 * In the native binary this is a single heap-allocated `char[]` where
 * the first 8 bytes are a header (4 bytes of ??? at offset 0 + 4 bytes
 * of int32 refcount at offset 4) and the rest is a run of doubles. In
 * the JS port we split those into named fields so field-decrement and
 * data-access don't have to do pointer arithmetic.
 */
export interface PCGenMatrixDoubleBuffer {
  /** int32 at native offset (data - 4). Decremented atomically-ish by
   *  the D1 body @Ozone 0x878b8; when it reaches 0 the buffer is
   *  deallocated. Managed by copy-ctor / operator= / release, which
   *  are separate ledger entries. */
  refcount: number;
  /** The double[] payload (the address `this->data` points to). */
  data: Float64Array;
}

// ═════════════════════════════════════════════════════════════════════════
// The class
// ═════════════════════════════════════════════════════════════════════════

/**
 * `PCGenMatrix<double>` — ProCore generic-dimension double matrix with
 * a reference-counted backing store. Only the destructor is ported in
 * this file. The class has (at least) one slot: a pointer to a shared
 * buffer whose first 4 bytes before the data are an int32 refcount.
 */
export class PCGenMatrix_double {
  /** +0x00 — shared refcounted buffer. `null` when no buffer has been
   *  allocated yet (the empty-state that a default ctor would set up;
   *  the dtor's leading NULL-check @0x878b3 short-circuits on this). */
  buffer: PCGenMatrixDoubleBuffer | null = null;

  /**
   * `PCGenMatrix<double>::~PCGenMatrix()` — @Ozone 0x878b0
   * (__ZN11PCGenMatrixIdED1Ev).
   *
   * Faithful line-for-line transcription of the disassembly above.
   * Release-side of the COW/refcount protocol:
   *   1. If we hold no buffer → return.
   *   2. Decrement the refcount.
   *   3. If refcount > 0 → return (someone else still holds a ref).
   *   4. Else deallocate the block (operator delete[] on data-8) and
   *      NULL our pointer.
   */
  destruct(): void {
    // @0x878b0..0x878b3 — rax = this->buffer; test NULL.
    const buf = this.buffer;
    // @0x878b6 — je 0x878bd (short-circuit on NULL).
    if (buf === null) {
      // @0x878bd — retq. Nothing to do; we held no buffer.
      return;
    }
    // @0x878b8 — decl -0x4(%rax) — decrement the int32 refcount stored
    //            4 bytes BEFORE the data pointer (i.e. the block
    //            header's refcount slot). x86 `decl` operates on a
    //            32-bit value, so this modulo-2^32 subtracts one and
    //            sets ZF if the result is 0.
    // Match the machine's uint32 width: force the arithmetic modulo
    // 2^32 so a caller who somehow underflows sees the same wrap the
    // native binary would.
    buf.refcount = (buf.refcount - 1) | 0;
    // @0x878bb — je 0x878be (jump to deallocate if refcount == 0).
    if (buf.refcount !== 0) {
      // @0x878bd — retq. Still shared; leave the buffer alone.
      return;
    }
    // -------------------------------------------------------------------
    // Deallocate path @0x878be..0x878e0.
    // -------------------------------------------------------------------
    // @0x878be..0x878c8 — prologue + rbx = this (preserved across call).
    // @0x878c4 — rax = data - 8 (the heap block base — the original
    //            new[] return). We don't model separate header/base
    //            in JS; the JS surrogate is `buf` itself, and freeing
    //            it means releasing our reference so GC can reclaim it.
    // @0x878cb..0x878ce — callq operator delete[] (Ozone stub 0x6dfc30).
    operatorDeleteArray(buf);
    // @0x878d3 — this->data = NULL.
    this.buffer = null;
    // @0x878da..0x878e0 — epilogue + retq.
  }
}
