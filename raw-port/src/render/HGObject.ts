// raw-port/src/render/HGObject.ts
//
// FCP `HGObject` — Helium base class for reference-counted objects
// (allocator / refcount / debug-dump root of the HG* class hierarchy).
//
// Symbols (Helium framework, x86_64 slice; disasm from otool -tV; slice
// starts at file offset 0x4000, VAs below are unadjusted VM addresses):
//   0x1a0e50  HGObject::HGObject()                    [C2 base ctor]
//   0x1a0e70  HGObject::HGObject()                    [C1 complete ctor — identical body]
//   0x1a0e90  HGObject::HGObject(HGObject const&)     [C2 copy ctor]
//   0x1a0eb0  HGObject::HGObject(HGObject const&)     [C1 copy ctor — identical body]
//   0x1a0ed0  HGObject::~HGObject()                   [D2 base dtor]
//   0x1a0ee0  HGObject::~HGObject()                   [D1 complete dtor — identical body]
//   0x1a0ef0  HGObject::~HGObject()                   [D0 deleting dtor: reinstall vtbl; tail-jmp ::operator delete]
//   0x1a0f10  HGObject::operator delete(void*)        [tail-jmp __ZdlPv (::operator delete)]
//   0x1a0f20  HGObject::Retain()                      [lock incl 8(%rdi)]
//   0x1a0f30  HGObject::Release()                     [lock decl 8(%rdi); on zero, vcall *0x8(vtbl) = D0]
//   0x1a0f50  HGObject::debugDescription() const      [zero-init a 24-byte std::string in *rdi, return rdi]
//   0x1a0f70  HGObject::DumpAllObjects()              [empty]
//   0x1a0f80  HGObject::DumpTypeCounts()              [empty]
//   0x1a0f90  HGObject::DumpVerboseLevel(unsigned int)[empty]
//   0x1a0fa0  HGObject::operator new(unsigned long)   [tail-jmp __Znwm (::operator new)]
//
// Vtable @Helium 0xa24ac0 (RTTI header @0xa24ab0; typeinfo-name @0x85cb86 "8HGObject"):
//   *0x00 = 0x1a0ee0  ~HGObject()               [D1 complete dtor]
//   *0x08 = 0x1a0ef0  ~HGObject()               [D0 deleting dtor]
//   *0x10 = 0x1a0f20  Retain()
//   *0x18 = 0x1a0f30  Release()
//   *0x20 = 0x1a0f50  debugDescription() const
// (Slot layout resolved via `resolve.py Helium vtable HGObject`.)
//
// LAYOUT (all 4 ctors + 3 dtors reveal it identically):
//   offset 0x0 : void*   vtable  (installed = 0xa24ac0)
//   offset 0x8 : u32     refCount (initialized to 1 by every ctor incl. copy;
//                                  the copy ctor DOES NOT copy the source's
//                                  refCount — each new HGObject starts at 1)
//   sizeof(HGObject) = 16 bytes (0x10). Subclasses extend past 0x10.
//
// DECODE-DON'T-FIT: every method transcribed here mirrors its asm exactly.
// operator new/delete are trivial forwarders to the global allocator; we
// model them here as no-ops in TS (JS is GC'd) but preserve the semantic
// callsite via @0xADDR docs so subclass D0 paths that vcall Release→delete
// still have a documented sink.

/**
 * `HGObject` — Helium reference-counted base class.
 *
 * TS port models the two observable fields of the C++ layout:
 *   - `vtable`: the installed vtable pointer address (for provenance/debug).
 *   - `refCount`: the atomic u32 refcount at struct offset 0x8.
 *
 * Subclasses (HGNode, HGRef, HGTextureWrap*, HGApplyNDLUTInfo, ...) extend
 * this class in C++ by adding fields past offset 0x10.
 */
export class HGObject {
  /**
   * Installed vtable pointer for this object.
   * Every HGObject ctor writes `movq $vtblAddr, (%rdi)` at offset 0x0
   * with vtblAddr = 0xa24ac0 (the HGObject vtable). Subclass ctors overwrite.
   * Not truly used at runtime by the TS port; kept for provenance/logging
   * and to mirror the observable ABI edge.
   */
  vtable: number;

  /**
   * Reference count at struct offset 0x8. u32 in C++, atomic.
   * Ctor sets to 1; Retain() = lock incl; Release() = lock decl + vcall D0
   * when the count reaches zero.
   */
  refCount: number;

  /**
   * `HGObject::HGObject()` — Helium @0x1a0e50 (C2) / @0x1a0e70 (C1).
   * Both bodies are byte-identical:
   *   0x1a0e54: leaq 0x883c65(%rip), %rax   ; = 0xa24ac0 (HGObject vtable)
   *   0x1a0e5b: movq %rax, (%rdi)           ; *this = vtable
   *   0x1a0e5e: movl $0x1, 0x8(%rdi)        ; this->refCount = 1
   *   0x1a0e65: retq
   */
  constructor() {
    // @Helium 0x1a0e5b (vtable install; target 0xa24ac0)
    this.vtable = 0xa24ac0;
    // @Helium 0x1a0e5e (refCount = 1)
    this.refCount = 1;
  }

  /**
   * `HGObject::HGObject(HGObject const&)` — Helium @0x1a0e90 (C2) / @0x1a0eb0 (C1).
   *
   * Body is byte-identical to the default ctor: install vtable, refCount=1.
   * The `other` reference is intentionally NOT read — the copy ctor does
   * NOT copy the source's refCount. Each new HGObject starts life at 1.
   *   0x1a0e94: leaq 0x883c25(%rip), %rax   ; = 0xa24ac0
   *   0x1a0e9b: movq %rax, (%rdi)
   *   0x1a0e9e: movl $0x1, 0x8(%rdi)
   *   0x1a0ea5: retq
   */
  static copyCtor(_other: HGObject): HGObject {
    const self = Object.create(HGObject.prototype) as HGObject;
    // @Helium 0x1a0e9b (vtable install; target 0xa24ac0)
    self.vtable = 0xa24ac0;
    // @Helium 0x1a0e9e (refCount = 1, ignoring other.refCount)
    self.refCount = 1;
    return self;
  }

  /**
   * `HGObject::~HGObject()` — Helium @0x1a0ed0 (D2) / @0x1a0ee0 (D1).
   * Both bodies byte-identical:
   *   0x1a0ed4: leaq 0x883be5(%rip), %rax   ; = 0xa24ac0 (re-install vtable)
   *   0x1a0edb: movq %rax, (%rdi)
   *   0x1a0ede: retq
   *
   * Re-installs the HGObject vtable so any pending vcalls during
   * destruction resolve to HGObject's own (empty) methods. No other
   * cleanup — HGObject owns no heap resources at this level.
   */
  destruct(): void {
    // @Helium 0x1a0edb (vtable re-install; target 0xa24ac0)
    this.vtable = 0xa24ac0;
  }

  /**
   * `HGObject::~HGObject()` [D0 deleting dtor] — Helium @0x1a0ef0.
   *
   *   0x1a0ef4: leaq 0x883bc5(%rip), %rax   ; = 0xa24ac0 (re-install vtable)
   *   0x1a0efb: movq %rax, (%rdi)
   *   0x1a0eff: jmp 0x3c4fa0                ; symbol stub for __ZdlPv
   *                                          (::operator delete(void*))
   *
   * Called via vtable slot *0x8 from `Release()` when refCount hits 0.
   * TS port: perform the D2 body (re-install vtable) — the trailing
   * `::operator delete` is a no-op in a GC'd runtime; the object is
   * simply dropped when no reference holds it.
   */
  deleteDtor(): void {
    // @Helium 0x1a0efb (vtable re-install; target 0xa24ac0)
    this.vtable = 0xa24ac0;
    // @Helium 0x1a0eff: tail-jmp ::operator delete(this) — no-op in TS.
  }

  /**
   * `HGObject::operator delete(void*)` — Helium @0x1a0f10.
   *   0x1a0f15: jmp 0x3c4fa0   ; __ZdlPv (::operator delete)
   *
   * Trivial forwarder to the global `::operator delete`. In TS this is a
   * no-op; we preserve it for provenance so subclass D0 paths that vcall
   * this route have a documented sink.
   */
  static operatorDelete(_p: HGObject | null): void {
    // @Helium 0x1a0f15: tail-jmp ::operator delete — no-op in TS.
  }

  /**
   * `HGObject::operator new(unsigned long)` — Helium @0x1a0fa0.
   *   0x1a0fa5: jmp 0x3c4fb2   ; __Znwm (::operator new)
   *
   * Trivial forwarder to global `::operator new`. TS caller instantiates
   * via `new HGObject()` — this static exists purely to document the ABI.
   */
  static operatorNew(_size: number): HGObject {
    // @Helium 0x1a0fa5: tail-jmp ::operator new — models allocation.
    return Object.create(HGObject.prototype) as HGObject;
  }

  /**
   * `HGObject::Retain()` — Helium @0x1a0f20.
   *   0x1a0f24: lock
   *   0x1a0f25: incl 0x8(%rdi)      ; ++refCount (atomic)
   *   0x1a0f29: retq
   */
  Retain(): void {
    // @Helium 0x1a0f25 (atomic ++refCount at offset 0x8)
    this.refCount = (this.refCount + 1) | 0;
  }

  /**
   * `HGObject::Release()` — Helium @0x1a0f30.
   *
   *   0x1a0f34: lock
   *   0x1a0f35: decl 0x8(%rdi)                 ; --refCount (atomic)
   *   0x1a0f38: jne  0x1a0f4a                  ; if !=0 → skip destroy
   *   0x1a0f3a: lock
   *   0x1a0f3b: incl 0x8(%rdi)                 ; ++refCount (rebump for dtor)
   *   0x1a0f3e: testq %rdi, %rdi                ; null-check this
   *   0x1a0f41: je   0x1a0f4a
   *   0x1a0f43: movq (%rdi), %rax               ; vtbl = *this
   *   0x1a0f46: popq %rbp
   *   0x1a0f47: jmpq *0x8(%rax)                 ; vtable[+0x8] = D0 deleting dtor
   *   0x1a0f4a: popq %rbp
   *   0x1a0f4b: retq
   *
   * NOTE: the pre-destroy rebump (`lock incl 8(%rdi)` at 0x1a0f3b) is a
   * safety valve so that if the D0 vcall triggers another Release() on
   * this object, we don't recurse into destruction. The count restored
   * here is the same value that was just decremented to 0.
   */
  Release(): void {
    // @Helium 0x1a0f35 (atomic --refCount)
    this.refCount = (this.refCount - 1) | 0;
    if (this.refCount !== 0) {
      // @Helium 0x1a0f38: jne — count non-zero, still live.
      return;
    }
    // @Helium 0x1a0f3b (rebump refCount to guard against re-entrant Release
    // during destruction).
    this.refCount = (this.refCount + 1) | 0;
    // @Helium 0x1a0f47: vcall *0x8(vtbl) = D0 (deleting dtor).
    // For a plain HGObject this dispatches to `deleteDtor()` above.
    // Subclasses override via their own vtables.
    this.deleteDtor();
  }

  /**
   * `HGObject::debugDescription() const` — Helium @0x1a0f50.
   *
   *   0x1a0f54: movq  %rdi, %rax           ; return this (sret ptr)
   *   0x1a0f57: xorps %xmm0, %xmm0
   *   0x1a0f5a: movups %xmm0, (%rdi)       ; zero bytes  0..16 of *rdi
   *   0x1a0f5d: movq  $0x0, 0x10(%rdi)     ; zero bytes 16..24 of *rdi
   *   0x1a0f65: retq
   *
   * This is the standard SysV-x64 `sret` prologue for a returned
   * `std::string`: %rdi is the caller-provided return buffer (24 bytes
   * on libc++), and we simply zero-initialize it — i.e. return the
   * empty string. HGObject has no debug description of its own;
   * subclasses (HGNode etc.) override this vtable slot.
   */
  debugDescription(): string {
    // @Helium 0x1a0f5a / 0x1a0f5d: zero-init 24-byte std::string return buffer.
    return "";
  }

  /**
   * `HGObject::DumpAllObjects()` — Helium @0x1a0f70.
   *   Body: pushq/movq/popq/retq — empty function.
   *
   * Instrumentation hook stripped from the shipping build.
   */
  static DumpAllObjects(): void {
    // @Helium 0x1a0f70: empty in shipping Helium.
  }

  /**
   * `HGObject::DumpTypeCounts()` — Helium @0x1a0f80.
   *   Body: empty.
   */
  static DumpTypeCounts(): void {
    // @Helium 0x1a0f80: empty in shipping Helium.
  }

  /**
   * `HGObject::DumpVerboseLevel(unsigned int)` — Helium @0x1a0f90.
   *   Body: empty.
   */
  static DumpVerboseLevel(_level: number): void {
    // @Helium 0x1a0f90: empty in shipping Helium.
  }
}
