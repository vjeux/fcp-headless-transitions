// raw-port/src/nodes/HGArrayDataRef.ts
//
// FCP `HGArrayDataRef` — Helium.framework intrusively-refcounted handle to a shared
// `HGArrayData` vertex/attribute-array buffer. Transcribed from the disassembly at
// /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium.
// One class per file (PORTING_SPEC Rule 6).
//
// HGArrayDataRef is an 8-byte handle whose single field (+0x0) is a `HGArrayData*`. The
// pointee HGArrayData is a 24-byte (0x18) heap struct with an atomic reference count at its
// head, recovered from allocate() @0xdc890 and the dtor D2 @0xdc980:
//
//   HGArrayData (24 bytes):
//     +0x00  refcount : int32 (atomic; `lock incl/decl`)
//     +0x04  count    : int32   // allocate() arg0 (esi)   — element count
//     +0x08  format   : int32   // allocate() arg1 (edx)   — HGFormat / kind tag
//     +0x0c  stride   : int32   // allocate() arg2 (ecx)   — per-element byte stride (0 => no data)
//     +0x10  data     : void*   // `operator new[](stride*count)`, or null
//
// The dtor D2 @0xdc980 confirms this exactly: dec refcount at (ptr); when it reaches 0, if
// (ptr+0x10) != null call `operator delete[]` on it, then `operator delete` the 24-byte struct.
//
// EXTERNS (out-of-scope libc, cited per PORTING_SPEC Rule 3):
//   0xdc8af  __Znwm   operator new(unsigned long)        — the 24-byte HGArrayData allocation
//   0xdc8e9  __Znam   operator new[](unsigned long)      — the (stride*count) data buffer
//   0xdc915  __ZdaPv  operator delete[](void*)           — freeing the data buffer
//   0xdc91d  __ZdlPv  operator delete(void*)             — freeing the 24-byte struct
//   0xdc96d  __Unwind_Resume                             — the C++ EH landing-pad cleanup
// There are NO in-scope Helium callees on any path; allocate() is self-contained struct
// bookkeeping plus these libc allocator externs.

/**
 * HGArrayData — the refcounted pointee. Modeled as a first-class object because, like
 * PCGenBlockRef's header, TS cannot embed the atomic refcount "inside" a typed-array buffer.
 * Two HGArrayDataRef handles share a buffer iff their `.data` field references the SAME
 * HGArrayData object (pointer identity), which is exactly what the `cmpq %rbx, %r15` check at
 * allocate @0xdc8fc tests.
 */
export interface HGArrayData {
  /** +0x00 int32 atomic reference count. allocate sets 0 then `lock incl` -> 1. */
  refcount: number;
  /** +0x04 int32 element count (allocate arg0). */
  count: number;
  /** +0x08 int32 format/kind tag (allocate arg1). */
  format: number;
  /** +0x0c int32 per-element byte stride (allocate arg2); 0 => no data buffer. */
  stride: number;
  /** +0x10 the element byte buffer `operator new[](stride*count)`, or null. */
  data: Uint8Array | null;
}

/**
 * HGArrayDataRef — the 8-byte handle. Its sole field is the HGArrayData pointer (+0x0). A null
 * pointer is the empty handle.
 */
export class HGArrayDataRef {
  /** +0x00 the HGArrayData* the handle owns a reference to, or null. */
  private ptr: HGArrayData | null = null;

  /**
   * HGArrayDataRef::allocate(int count, int format, int stride)  @Helium 0xdc890.
   *
   * Allocates a fresh HGArrayData, fills its int fields, optionally allocates the
   * (stride*count) byte data buffer, gives it refcount 1, then atomically swaps it into this
   * handle — releasing (and, at refcount 0, freeing) whatever the handle pointed at before.
   *
   *   0xdc8aa  movl $0x18,%edi; call __Znwm            ; obj = new HGArrayData (24 bytes) -> rbx
   *   0xdc8b7  movl $0x0,(rax)                          ; obj.refcount = 0
   *   0xdc8bd  movl %r12d,0x4(rax)                      ; obj.count  = count  (esi)
   *   0xdc8c1  movl %r13d,0x8(rax)                      ; obj.format = format (edx)
   *   0xdc8c5  movl $0x0,0xc(rax)                       ; obj.stride = 0
   *   0xdc8cc  movq $0x0,0x10(rax)                      ; obj.data   = null
   *   0xdc8d4  testl %r15d,%r15d; je 0xdc8f6            ; if stride == 0 -> skip data alloc
   *   0xdc8d9  movl %r15d,0xc(rbx)                      ; obj.stride = stride (ecx)
   *   0xdc8dd  testl %r12d,%r12d; je 0xdc8f0            ; if count == 0 -> data = null
   *   0xdc8e2  imull %r12d,%r15d                        ; size = stride * count  (int32)
   *   0xdc8e6  movslq %r15d,%rdi; call __Znam           ; obj.data = new byte[size]
   *   0xdc8f0  (count==0) xorl %eax,%eax                ; data = null
   *   0xdc8f2  movq %rax,0x10(rbx)                      ; obj.data = ...
   *   0xdc8f6  lock incl (rbx)                          ; obj.refcount = 1
   *   0xdc8f9  movq (r14),%r15                          ; old = *this
   *   0xdc8fc  cmpq %rbx,%r15; je 0xdc927               ; if old == obj (self) -> dec-only branch
   *   0xdc901  testq %r15,%r15; je 0xdc922              ; if old == null -> just store
   *   0xdc906  lock decl (r15); jne 0xdc922             ; if --old.refcount != 0 -> just store
   *   0xdc90c  movq 0x10(r15),rdi; test; jne del[] data ; free old.data (operator delete[])
   *   0xdc91a  rdi=old; call __ZdlPv                    ; free old struct (operator delete)
   *   0xdc922  movq %rbx,(r14)                          ; *this = obj
   *   0xdc925  jmp  ret
   *   0xdc927  (self) lock decl (rbx); jne ret          ; --obj.refcount; if 0 free obj (edge)
   *
   * The `old == obj` branch (0xdc927) is the pathological self-assign case: it just decrements
   * the count we just bumped and, if that hits 0, frees — leaving *this pointing at the (now
   * possibly freed) same object. We reproduce it faithfully.
   */
  public allocate(count: number, format: number, stride: number): void {
    // obj = new HGArrayData(24 bytes)  @0xdc8af  __Znwm
    const obj: HGArrayData = {
      refcount: 0, // @0xdc8b7 movl $0x0,(rax)
      count: count | 0, // @0xdc8bd movl %r12d,0x4(rax)
      format: format | 0, // @0xdc8c1 movl %r13d,0x8(rax)
      stride: 0, // @0xdc8c5 movl $0x0,0xc(rax)
      data: null, // @0xdc8cc movq $0x0,0x10(rax)
    };

    const s = stride | 0;
    if (s !== 0) {
      // @0xdc8d4 testl %r15d,%r15d ; je -> skip
      obj.stride = s; // @0xdc8d9 movl %r15d,0xc(rbx)
      const n = count | 0;
      if (n !== 0) {
        // @0xdc8dd testl %r12d,%r12d ; je -> data stays null
        // @0xdc8e2 imull %r12d,%r15d ; int32 product ; @0xdc8e6 movslq ; @0xdc8e9 __Znam
        const size = Math.imul(s, n) | 0;
        obj.data = new Uint8Array(size >>> 0);
      }
      // else (@0xdc8f0 xorl) obj.data remains null
    }

    // @0xdc8f6 lock incl (rbx)  -> refcount = 1
    obj.refcount = (obj.refcount + 1) | 0;

    // @0xdc8f9 old = *this
    const old = this.ptr;
    if (old === obj) {
      // @0xdc8fc je 0xdc927 — self branch: dec the count we just added.
      obj.refcount = (obj.refcount - 1) | 0; // @0xdc928 lock decl (rbx)
      if (obj.refcount === 0) {
        // @0xdc92a jne -> ret ; fall through frees
        // @0xdc92c free obj.data (operator delete[]), then @0xdc94b free obj (operator delete)
        obj.data = null;
        this.ptr = null;
      }
      return;
    }

    if (old !== null) {
      // @0xdc901 test old ; not null
      old.refcount = (old.refcount - 1) | 0; // @0xdc906 lock decl (r15)
      if (old.refcount === 0) {
        // @0xdc90a jne 0xdc922 -> just store; == 0 falls through to free
        // @0xdc90c old.data != null -> __ZdaPv (operator delete[]); @0xdc91d __ZdlPv
        old.data = null;
      }
    }

    // @0xdc922 *this = obj
    this.ptr = obj;
  }
}
