// HGMultiTexBlendBase.ts — faithful transcription of FCP's Helium
// class HGMultiTexBlendBase (a HGNode-derived base whose static factory
// picks the concrete HGMultiTexBlend<N> template instantiation for a
// given tex-count parameter).
//
// Binary source (all x86_64 slice of the FAT Helium framework):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium
//
// Disassembly:
//   raw-port/re/disasm/Helium.HGMultiTexBlendBase.HGMultiTexBlendBase.s  @0x10f8c0  (C2)
//   raw-port/re/disasm/Helium.HGMultiTexBlendBase.~HGMultiTexBlendBase.s @0x3c3bd0  (D0 — ud2 trap)
//   raw-port/re/disasm/Helium.HGMultiTexBlendBase.create.s               @0x10f8f0  (static create(int))
//
// nm -arch x86_64 Helium:
//   000000000010f8c0 T __ZN19HGMultiTexBlendBaseC2Ev              // C2 (base ctor)
//   000000000010f8e0 T __ZN19HGMultiTexBlendBaseD2Ev              // D2 (base dtor)  — tail-jmp HGNode::~HGNode
//   000000000010f8f0 T __ZN19HGMultiTexBlendBase6createEi         // static create(int)
//   00000000003c3bd0 T __ZN19HGMultiTexBlendBaseD0Ev              // D0 (deleting dtor) — ud2 trap
//   (D1 is not present as a distinct symbol — ICF-folded onto D2.)
//
// Frontier callees this class depends on (not yet transcribed):
//   HGNode::HGNode()                                 @0x???       __ZN6HGNodeC2Ev
//   HGNode::~HGNode()                                @0x???       __ZN6HGNodeD2Ev
//   HGObject::operator new(unsigned long)            @0x???       __ZN8HGObjectnwEm
//   HGObject::operator delete(void*)                 @0x???       __ZN8HGObjectdlEPv
//   HGMultiTexBlend<2..8>::HGMultiTexBlend()         @0x???       __ZN15HGMultiTexBlendILi{2..8}EEC2Ev
//   __Unwind_Resume (libunwind stub)                 @0x3c4e02    symbol stub
//
// VTABLE:
//   C2 writes the vtable pointer at offset 0 of this-object:
//     0x10f8ce: leaq   0x90be53(%rip), %rax     ; RIP-relative to vtable const
//     0x10f8d5: movq   %rax, (%rbx)             ; *this = vtable_HGMultiTexBlendBase
//   Effective address of the vtable object: 0x10f8d5 + 0x90be53 = 0xa1b728.
//   (Standard Itanium ABI: at 0xa1b728 lie the two prefix slots
//    [offset-to-top=0, typeinfo* &typeinfo::HGMultiTexBlendBase]; virtual
//    method pointers begin at 0xa1b728+0x10.)  The vtable contents are not
//    yet transcribed — they are cited as an address only.
//
// SIZE:
//   Not observed in this class itself: HGMultiTexBlendBase has no `new`-
//   site in these three methods.  What IS observed in HGMultiTexBlendBase::
//   create is a table of allocation sizes for its subclasses:
//     tex-count 2  -> sizeof(HGMultiTexBlend<2>) = 0x1e0  @0x10f8f0..0x10f924
//     tex-count 3  -> sizeof(HGMultiTexBlend<3>) = 0x1e0  @0x10f972..0x10f987
//     tex-count 4  -> sizeof(HGMultiTexBlend<4>) = 0x1f0  @0x10f940..0x10f955
//     tex-count 5  -> sizeof(HGMultiTexBlend<5>) = 0x1f0  @0x10f957..0x10f96c
//     tex-count 6  -> sizeof(HGMultiTexBlend<6>) = 0x200  @0x10f929..0x10f93e
//     tex-count 7  -> sizeof(HGMultiTexBlend<7>) = 0x200  @0x10f989..0x10f99e
//     tex-count 8  -> sizeof(HGMultiTexBlend<8>) = 0x210  @0x10f9a0..0x10f9b5
//     (a valid range check `edi -= 2; if edi > 6 then return 0` @0x10f8f7..0x10f8fd
//      excludes any other input; the case order in the jump table is 2,6,4,5,3,7,8
//      — a linker-arranged ordering, not the natural numeric order.)
//
// Address of the vtable pointer written by C2 is retained in a
// module-level constant so downstream code can cite it precisely.
export const HGMultiTexBlendBase_VTABLE_ADDR = 0xa1b728; // @Helium 0x10f8ce/0x10f8d5

/**
 * Frontier: base-class HGNode is not yet transcribed. Every HGNode-
 * derived class in this port cites this stub as the missing base ctor.
 * @Helium HGNode::HGNode()  (symbol __ZN6HGNodeC2Ev, cited @0x10f8c9)
 */
function HGNode_ctor(_self: object): void {
  throw new Error(
    "HGNode::HGNode() not yet transcribed (base ctor, " +
    "called from HGMultiTexBlendBase::HGMultiTexBlendBase @Helium 0x10f8c9)"
  );
}

/**
 * Frontier: base-class HGNode dtor. HGMultiTexBlendBase::~HGMultiTexBlendBase
 * (D2, @Helium 0x10f8e0) is a bare tail-jmp to HGNode::~HGNode() — the
 * subclass has no fields of its own to tear down.
 * @Helium HGNode::~HGNode()  (symbol __ZN6HGNodeD2Ev, cited @0x10f8e5)
 */
function HGNode_dtor(_self: object): void {
  throw new Error(
    "HGNode::~HGNode() not yet transcribed (base dtor, " +
    "tail-jmp target from HGMultiTexBlendBase::~HGMultiTexBlendBase @Helium 0x10f8e5)"
  );
}

/**
 * Frontier: HGObject::operator new — the pool allocator that owns every
 * HGObject-derived instance. `create(int)` uses it seven times, once per
 * concrete tex-count.
 * @Helium HGObject::operator new(unsigned long)  (symbol __ZN8HGObjectnwEm)
 */
function HGObject_operator_new(_size: number): object {
  throw new Error(
    "HGObject::operator new(size_t) not yet transcribed " +
    "(called from HGMultiTexBlendBase::create @Helium 0x10f914/0x10f92e/" +
    "0x10f945/0x10f95c/0x10f977/0x10f98e/0x10f9a5)"
  );
}

/**
 * Frontier: HGObject::operator delete — called by the exception-unwind
 * landing pad of create() at @0x10f9cc..0x10f9cf when an inner subclass
 * ctor raises after the object memory has been allocated.
 * @Helium HGObject::operator delete(void*)  (symbol __ZN8HGObjectdlEPv)
 */
function HGObject_operator_delete(_p: object): void {
  throw new Error(
    "HGObject::operator delete(void*) not yet transcribed " +
    "(called from HGMultiTexBlendBase::create landing pad @Helium 0x10f9cf)"
  );
}

/**
 * Frontier: HGMultiTexBlend<N>::HGMultiTexBlend() — the concrete
 * templated multi-texture-blend nodes. `create(int)` dispatches to one
 * of seven instantiations, N in [2..8].  None of the seven have been
 * transcribed yet — each raise cites the exact call site @Helium.
 * @Helium __ZN15HGMultiTexBlendILi<N>EEC2Ev
 */
function HGMultiTexBlend_ctor(_self: object, N: number): void {
  // The N=1 case is deliberately not present in the binary; the range
  // check @0x10f8f7 (`edi -= 2; if unsigned(edi) > 6 goto default`)
  // guarantees create() only reaches this stub for N in 2..8.
  const callSite: Record<number, string> = {
    2: "0x10f91f",
    3: "0x10f982",
    4: "0x10f950",
    5: "0x10f967",
    6: "0x10f939",
    7: "0x10f999",
    8: "0x10f9b0",
  };
  throw new Error(
    `HGMultiTexBlend<${N}>::HGMultiTexBlend() not yet transcribed ` +
    `(called from HGMultiTexBlendBase::create @Helium ${callSite[N] ?? "?"})`
  );
}

/**
 * HGMultiTexBlendBase — the abstract base of the multi-texture-blend
 * node family. In the FCP binary the class itself has no fields of its
 * own beyond the HGNode base subobject; C2 does nothing more than
 * (1) construct the HGNode base and (2) overwrite the vtable slot with
 * &vtable_HGMultiTexBlendBase (so any virtual dispatch through a
 * partially-constructed HGMultiTexBlend<N> lands on the base ABI, per
 * standard Itanium C++ ABI construction order).
 *
 * @Helium HGMultiTexBlendBase (module `Helium`).
 */
export class HGMultiTexBlendBase {
  /**
   * The vtable pointer written at offset 0 of the object by C2.
   * In the C++ ABI this is the very first field; naming it here keeps
   * the layout explicit for downstream ports.
   * @Helium C2 @0x10f8ce/0x10f8d5 -> vtable @0xa1b728.
   */
  vptr: number = HGMultiTexBlendBase_VTABLE_ADDR;

  /**
   * HGMultiTexBlendBase::HGMultiTexBlendBase() — C2 base constructor.
   * @Helium __ZN19HGMultiTexBlendBaseC2Ev @0x10f8c0..0x10f8de
   *
   * Faithful mirror of the asm:
   *   pushq  %rbp                        ; frame
   *   movq   %rsp, %rbp
   *   pushq  %rbx                        ; save
   *   pushq  %rax                        ; align (16B)
   *   movq   %rdi, %rbx                  ; %rbx = this
   *   callq  HGNode::HGNode()            ; @0x10f8c9  base subobject
   *   leaq   vtable+0x10(%rip), %rax     ; @0x10f8ce  RIP-rel to 0xa1b728
   *   movq   %rax, (%rbx)                ; @0x10f8d5  *this = vtable
   *   addq   $0x8, %rsp                  ; unalign
   *   popq   %rbx / popq %rbp / retq
   */
  constructor() {
    // Base subobject construction. Frontier — HGNode is not yet ported.
    // In a real run this raises with a citation to @0x10f8c9.
    HGNode_ctor(this);
    // vtable installation @0x10f8d5 — done by field-default above.
    this.vptr = HGMultiTexBlendBase_VTABLE_ADDR;
  }

  /**
   * HGMultiTexBlendBase::~HGMultiTexBlendBase() — D2 (base dtor).
   * @Helium __ZN19HGMultiTexBlendBaseD2Ev @0x10f8e0..0x10f8e5
   *
   *   pushq  %rbp
   *   movq   %rsp, %rbp
   *   popq   %rbp
   *   jmp    __ZN6HGNodeD2Ev             ; tail-call HGNode::~HGNode()
   *
   * D1 is not a distinct symbol — ICF-folded onto D2 (identical body).
   */
  destroy(): void {
    HGNode_dtor(this);
  }

  /**
   * HGMultiTexBlendBase::~HGMultiTexBlendBase() — D0 (deleting dtor).
   * @Helium __ZN19HGMultiTexBlendBaseD0Ev @0x3c3bd0..0x3c3bd6
   *
   *   pushq  %rbp
   *   movq   %rsp, %rbp
   *   ud2                                 ; deliberate trap
   *
   * The D0 slot for this class raises `ud2` — the deleting-dtor for the
   * abstract base is not reachable in a well-formed program (a real
   * HGMultiTexBlend<N> instance always has its own D0). Any dispatch
   * that lands here is a bug; mirror that as a raise.
   */
  destroy_deleting(): never {
    // Mirrors ud2 @0x3c3bd4.
    throw new Error(
      "HGMultiTexBlendBase::~HGMultiTexBlendBase (D0, deleting) is a ud2 trap " +
      "@Helium 0x3c3bd4 — the abstract base's deleting-dtor is not reachable"
    );
  }

  /**
   * HGMultiTexBlendBase::create(int) — static factory.
   * @Helium __ZN19HGMultiTexBlendBase6createEi @0x10f8f0..0x10f9bc
   *
   * Recovered flow:
   *   %edi -= 2                             ; @0x10f8f7  bias
   *   if (unsigned(%edi) > 6) return 0;     ; @0x10f8fa..0x10f96e  range check
   *   jump-table dispatch                   ; @0x10f8ff..0x10f90d
   *     case 0 (N=2): edi=0x1e0; new;  HGMultiTexBlend<2>::HGMultiTexBlend()   ; @0x10f90f
   *     case 1 (N=3): edi=0x1e0; new;  HGMultiTexBlend<3>::HGMultiTexBlend()   ; @0x10f972
   *     case 2 (N=4): edi=0x1f0; new;  HGMultiTexBlend<4>::HGMultiTexBlend()   ; @0x10f940
   *     case 3 (N=5): edi=0x1f0; new;  HGMultiTexBlend<5>::HGMultiTexBlend()   ; @0x10f957
   *     case 4 (N=6): edi=0x200; new;  HGMultiTexBlend<6>::HGMultiTexBlend()   ; @0x10f929
   *     case 5 (N=7): edi=0x200; new;  HGMultiTexBlend<7>::HGMultiTexBlend()   ; @0x10f989
   *     case 6 (N=8): edi=0x210; new;  HGMultiTexBlend<8>::HGMultiTexBlend()   ; @0x10f9a0
   *   return %rax (the freshly-constructed object, or 0 for out-of-range).
   *
   *   The landing pad (@0x10f9c9..0x10f9d7) handles exceptions raised by
   *   the inner ctor: `%r14 = exception; HGObject::operator delete(%rbx);
   *   __Unwind_Resume(%r14)`.
   *
   * We faithfully mirror this as a switch. The subclass ctors and the
   * allocator are frontier stubs that raise with cited addresses.
   */
  static create(texCount: number): HGMultiTexBlendBase | null {
    // @0x10f8f7 bias, @0x10f8fa unsigned compare
    const biased = (texCount - 2) | 0;
    if (biased < 0 || biased > 6) {
      // @0x10f96e: xorl %ebx, %ebx ; fallthrough to return %rbx (=NULL).
      return null;
    }

    // Sizes are exact from the disasm: cited above.
    // The subclass ctor is called on a raw HGObject::operator new(size)
    // allocation. Both raise for now — the frontier is decoded but not
    // yet ported.
    let size: number;
    switch (biased) {
      case 0: // N=2
        size = 0x1e0;
        break;
      case 4: // N=6 (jump-table order places 6 next to 2 — both are 0x200 no wait: 2 is 0x1e0, 6 is 0x200)
        size = 0x200;
        break;
      case 2: // N=4
        size = 0x1f0;
        break;
      case 3: // N=5
        size = 0x1f0;
        break;
      case 1: // N=3
        size = 0x1e0;
        break;
      case 5: // N=7
        size = 0x200;
        break;
      case 6: // N=8
        size = 0x210;
        break;
      default:
        return null;
    }

    // Allocate raw object memory.
    const obj = HGObject_operator_new(size);

    // Construct the concrete subclass in-place.
    // If it raises, the C++ landing pad @0x10f9c9 would delete `obj` and
    // resume the exception; JS raises propagate naturally, so we imitate
    // the delete in a catch block for parity.
    const N = biased + 2;
    try {
      HGMultiTexBlend_ctor(obj, N);
    } catch (e) {
      // Landing pad @0x10f9c9..0x10f9d7.
      HGObject_operator_delete(obj);
      throw e;
    }
    // Return the constructed instance. Typed as the base because that's
    // the ABI return of `create` (`HGMultiTexBlendBase*`).
    return obj as HGMultiTexBlendBase;
  }
}
