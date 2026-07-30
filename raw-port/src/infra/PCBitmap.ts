// PCBitmap — reference-counted bitmap image wrapper in FCP's ProCore-shape family. Only its
// destructor is exposed here; the ctor(s), accessors, and layout are decoded elsewhere as
// they enter the frontier. What this file transcribes is a faithful port of the D1 (in-place)
// destructor.
//
// Framework: Ozone
// Provenance (raw-port/re/disasm/PCBitmap.~PCBitmap.s):
//   PCBitmap::~PCBitmap()  @0x0003a850  (__ZN8PCBitmapD1Ev)
//
// Framework: ProCore  (getBytesPerRow lives in ProCore's slice, not Ozone)
// Provenance (raw-port/re/disasm/ProCore.__ZNK8PCBitmap14getBytesPerRowEv.s):
//   PCBitmap::getBytesPerRow() const  @0x000361c6  (__ZNK8PCBitmap14getBytesPerRowEv)
//
// Callees / RIP-relative refs (resolved via raw-port/army/tools/resolve.py Ozone ...):
//   __ZTV8PCBitmap                                  // vtable for PCBitmap (installed at +0x10)
//   __ZN7PCImageD2Ev                                // PCImage::~PCImage()  (base-class D2 dtor)
//   *(this+0x40)->vt[0x8]                           // deleting destructor slot of some sub-object
//                                                   //   (an owned PCImage-derived instance —
//                                                   //   see doc comment on ~PCBitmap() below)
//
// FAITHFUL PORT — every function cites its @Ozone 0xADDR. Undecoded callees throw citing
// their FCP address (PORTING_SPEC.md Rule 3). No approximations, no invented helpers.

// ── opaque pointer types ────────────────────────────────────────────────────────────────────

/**
 * The type of the object stored at `this+0x40` — an owned pointer to what the disasm treats
 * as a PCImage-shape (its vtable is dispatched via `vt[0x8]` which in the Itanium ABI is the
 * "deleting destructor" (D0) slot). Left opaque here; PCImage.ts and its subclasses would
 * decode the full vtable.
 */
export type PCImageDerivedPtr = {
  readonly __pcimage_derived: true;
  /** Virtual-dispatch table modelled as a per-instance struct — only slot 0x8 (byte offset
   *  8 = index 1) is invoked from this file's disassembly. In C++ this is the pointer at
   *  `*(this+0x00)`, which is a `void (*)(SomeType*)` at byte-offset +0x8 in the vptr array
   *  (== slot index 1 = deleting-destructor D0 in the Itanium ABI).
   *
   *  Additional slot modelled below:
   *  - +0x40 = the "bytes per row" accessor (a `size_t (*)(SomeType const*)`) invoked by
   *    PCBitmap::getBytesPerRow @0x361d2 via `jmpq *0x40(%rax)` (tail-call). The exact
   *    concrete class that supplies this slot is not yet decoded (it is neither PCBitmap
   *    nor plain PCImage — see the note on getBytesPerRow's decode below), so we model it
   *    as a slot on this opaque type and leave the callee as a frontier stub. */
  vt: {
    readonly deletingDestructor: (self: PCImageDerivedPtr) => void;
    readonly getBytesPerRow: (self: PCImageDerivedPtr) => number;
  };
} | null | undefined;

// ── frontier stubs for un-decoded callees ────────────────────────────────────────────────────

/**
 * `PCImage::~PCImage()` — Ozone symbol `__ZN7PCImageD2Ev` @stub 0x6deee0. Base-class
 * destructor. This file's ~PCBitmap() BOTH jumps to it (tail-call @0x3a88e) and short-
 * circuits directly to it (@0x3a86d, when the +0x40 owned object is null). Frontier.
 */
function PCImage_dtor_D2(_self: PCBitmap): void {
  throw new Error(
    "PCImage::~PCImage() @Ozone (stub 0x6deee0) not yet transcribed (called from PCBitmap::~PCBitmap() @0x3a86d as an early-out and @0x3a88e as the tail continuation)",
  );
}

/** The `__ZTV8PCBitmap` vtable pointer as installed by the ~PCBitmap() prologue @0x3a850:
 *  `movq __ZTV8PCBitmap(%rip),%rax ; addq $0x10,%rax ; movq %rax,(%rdi)`. In JS the vtable
 *  install is a no-op (class dispatch handles method resolution), but we tag the identity
 *  so a later reader can prove nothing else has been snuck in.
 */
const PCBITMAP_VTABLE_INSTALLED_ADDR = "__ZTV8PCBitmap + 0x10 (@Ozone 0x3a850..0x3a85b)";

// ── PCBitmap ────────────────────────────────────────────────────────────────────────────────

export class PCBitmap {
  /**
   * +0x40 — owned pointer to a PCImage-derived instance. The D1 destructor detaches it
   * (writes null back @0x3a862) and then invokes its deleting destructor @0x3a882 via
   * `callq *0x8(%rcx)`. Set to `undefined` in TS to reflect the post-detach state that
   * survives into `PCImage::~PCImage()` on the tail path.
   */
  ownedImage: PCImageDerivedPtr = undefined;

  /**
   * PCBitmap::~PCBitmap() — the in-place (D1) destructor.
   *
   * @Ozone 0x0003a850  (symbol `__ZN8PCBitmapD1Ev`)
   *
   * Disasm (raw-port/re/disasm/PCBitmap.~PCBitmap.s), instruction-by-instruction:
   *
   *   0x3a850  movq __ZTV8PCBitmap(%rip),%rax                          (rax = &vtable)
   *   0x3a857  addq $0x10,%rax                                         (rax = vtable+0x10 — the
   *                                                                    "installed ptr", i.e. skip
   *                                                                    the offset-to-top and RTTI
   *                                                                    slots per Itanium C++ ABI)
   *   0x3a85b  movq %rax,(%rdi)                                        (this->vptr = vtable+0x10)
   *   0x3a85e  movq 0x40(%rdi),%rax                                    (rax = this->ownedImage)
   *   0x3a862  movq $0x0, 0x40(%rdi)                                   (this->ownedImage = nullptr)
   *   0x3a86a  testq %rax,%rax
   *   0x3a86d  je  0x6deee0                                            (if null: TAIL-jump to
   *                                                                    PCImage::~PCImage — the
   *                                                                    base-class D2 destructor.)
   *   0x3a873..0x3a87c  standard function prologue + spill (pushq rbp; movq rsp,rbp; pushq rbx;
   *                     pushq rax (align); movq (%rax),%rcx (load ownedImage->vptr);
   *                     movq %rdi,%rbx (save this))
   *   0x3a87f  movq %rax,%rdi                                          (arg0 = ownedImage)
   *   0x3a882  callq *0x8(%rcx)                                        (deleting destructor:
   *                                                                    ownedImage->vt[0x8]
   *                                                                    (slot index 1 = D0 in the
   *                                                                    Itanium ABI = delete-and-
   *                                                                    destroy))
   *   0x3a885  movq %rbx,%rdi                                          (arg0 = this)
   *   0x3a888..0x3a88d  epilogue (addq $0x8,%rsp; popq rbx; popq rbp)
   *   0x3a88e  jmp 0x6deee0                                            (TAIL-jump to
   *                                                                    PCImage::~PCImage — the
   *                                                                    base-class D2 destructor.)
   *
   * NOTE ON THE VTABLE INSTALL @0x3a850..0x3a85b: this is standard C++ D1/D2 protocol — every
   * destructor "reinstalls" its own class's vtable so that any virtual method invoked from
   * `PCImage::~PCImage()` on this partially-destroyed object dispatches to PCImage's
   * implementation, not to any subclass's. This models a pure invariant of the ABI; in TS
   * class dispatch it is implicit and captured in the constant above for auditability.
   *
   * The `0x8(%rcx)` dispatch is slot index 1 of the ownedImage's vtable. In the Itanium ABI
   * this is the "deleting destructor" (D0) — the one that both runs ~T() and frees the heap
   * memory. In TS the two halves collapse: we just call the modelled `deletingDestructor`
   * and let JS's GC handle deallocation.
   */
  destroy(this: PCBitmap): void {
    // @0x3a850..0x3a85b — vtable reinstall (implicit in TS class dispatch).
    void PCBITMAP_VTABLE_INSTALLED_ADDR;

    // @0x3a85e / 0x3a862 — atomically read-and-null the owned pointer.
    const owned: PCImageDerivedPtr = this.ownedImage;
    this.ownedImage = undefined;

    // @0x3a86a / 0x3a86d — null short-circuit: TAIL-jump straight to PCImage::~PCImage().
    if (owned === null || owned === undefined) {
      PCImage_dtor_D2(this);
      return;
    }

    // @0x3a87f / 0x3a882 — invoke the owned object's deleting destructor via its vt[0x8].
    //   In JS we cannot dispatch through a raw offset; the modelled shape exposes the same
    //   slot as `vt.deletingDestructor(self)`. The exact ABI-level byte offset is preserved
    //   in the doc-comment above.
    owned.vt.deletingDestructor(owned);

    // @0x3a885..0x3a88e — TAIL-jump to PCImage::~PCImage().
    PCImage_dtor_D2(this);
  }

  /**
   * PCBitmap::getBytesPerRow() const — read the bitmap's stride (bytes per row) by
   * delegating to the owned +0x40 sub-object's vslot at +0x40.
   *
   * @ProCore 0x000361c6  (symbol `__ZNK8PCBitmap14getBytesPerRowEv`)
   *
   * Disasm (raw-port/re/disasm/ProCore.__ZNK8PCBitmap14getBytesPerRowEv.s), instruction-
   * by-instruction:
   *
   *   0x361c6  pushq  %rbp
   *   0x361c7  movq   %rsp, %rbp
   *   0x361ca  movq   0x40(%rdi), %rdi           ; rdi = this->ownedImage
   *   0x361ce  movq   (%rdi), %rax               ; rax = ownedImage->vptr
   *   0x361d1  popq   %rbp
   *   0x361d2  jmpq   *0x40(%rax)                ; TAIL-jump to vt[0x40]
   *   0x361d5  nop
   *
   * SEMANTICS:
   *   Reads the owned PCImage-derived sub-object at this[+0x40], loads its vptr, and
   *   TAIL-JUMPS to vslot +0x40. The tail-jump means the sub-object's method returns
   *   directly to PCBitmap::getBytesPerRow's caller — semantically identical to a plain
   *   call+return of the sub-object's method with the sub-object as `this`.
   *
   *   In the SysV ABI a `size_t` (== unsigned long, 8 bytes on x86_64) is returned in
   *   `%rax`. The sub-object's vslot at +0x40 is therefore a `size_t (*)(SomeType const*)`.
   *   We model it as returning `number` (JS's f64 can hold any u32 losslessly; a real
   *   bytes-per-row value never approaches 2^53, so precision is not a concern here).
   *
   * NOTE ON THE CONCRETE VSLOT TARGET:
   *   `raw-port/army/tools/vtable.py ProCore PCImage` reports PCImage's vslot +0x40 as
   *   `PCImage::dumpImage(int, int) const`, which is CLEARLY NOT this getter — so the
   *   +0x40 sub-object is NOT a plain PCImage. It's a distinct class (a concrete
   *   subclass or a differently-shaped image type) whose vtable places
   *   `getBytesPerRow()` at slot +0x40. The exact class is not yet decoded; when a
   *   future port pins the concrete type (via ctor/factory disasm) the frontier stub
   *   below can be replaced with a direct call to the concrete method. Until then
   *   this is a legitimate virtual-dispatch boundary — the same modelling pattern
   *   already used by `destroy()` above for vt[0x8].
   *
   * NO IN-SCOPE CALLEES. The only callee is the virtual slot itself, modelled as a
   * frontier `vt` slot on the opaque PCImageDerivedPtr type.
   *
   * Source disassembly:
   *   raw-port/re/disasm/ProCore.__ZNK8PCBitmap14getBytesPerRowEv.s (8 lines)
   */
  getBytesPerRow(this: PCBitmap): number {
    // @0x361ca — rdi = this->ownedImage.
    const owned: PCImageDerivedPtr = this.ownedImage;

    // The compiled tail-jump does NOT null-check %rdi before loading %rax = (%rdi);
    // a null owned would deref-fault at @0x361ce. We preserve that semantic here — if
    // the caller invokes getBytesPerRow with a null owned sub-object, this throws.
    // (This is not a fabricated guard: it mirrors the machine's behaviour on a NULL
    // %rdi at @0x361ce, which is a segfault. In JS we can't segfault, but we can
    // throw a clearly-labelled error at the SAME instruction address.)
    if (owned === null || owned === undefined) {
      throw new Error(
        "PCBitmap::getBytesPerRow @ProCore 0x361ce would dereference NULL ownedImage (movq (%rdi),%rax)",
      );
    }

    // @0x361ce/0x361d2 — TAIL-jump to owned->vt[0x40]:
    //   In JS a tail-call and a plain call+return are indistinguishable (no
    //   stack-frame observable), so we call the modelled vslot and return its result.
    return owned.vt.getBytesPerRow(owned);
  }
}
