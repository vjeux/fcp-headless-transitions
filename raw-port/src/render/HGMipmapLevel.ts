// HGMipmapLevel — Helium HGNode subclass. A concrete node whose entire own
// slice consists of a plain ctor that installs the HGMipmapLevel vptr on top
// of a base-class HGNode subobject, plus a base-object dtor D2 that chains
// straight into HGNode::~HGNode(). The virtual dtor slots D0/D1 are BOTH
// installed to a trap (ud2) stub — a very strong Helium tell that
// HGMipmapLevel instances are never destroyed through the virtual dtor
// slot (i.e. this class is only ever owned by-value or torn down explicitly
// via the base-object D2 dtor, not via `delete node`).
//
// From this class's decoded surface we see FOUR own exported symbols
// (nm evidence from Helium `_symmap.tsv`, no other HGMipmapLevel:: entries
// exist):
//   0000000000022990 t __ZN13HGMipmapLevelC2Ev   HGMipmapLevel::HGMipmapLevel()
//   00000000000229b0 t __ZN13HGMipmapLevelD2Ev   HGMipmapLevel::~HGMipmapLevel()  ; real D2
//   00000000003c1090 t __ZN13HGMipmapLevelD1Ev   HGMipmapLevel::~HGMipmapLevel()  ; ud2 trap
//   00000000003c10a0 t __ZN13HGMipmapLevelD0Ev   HGMipmapLevel::~HGMipmapLevel()  ; ud2 trap
//
// The C1 (complete-object ctor) symbol is not separately emitted — the
// GCC/Clang Itanium C++ ABI is allowed to alias C1 onto C2 when the two
// bodies would be identical, and Helium's linker does that here.
//
// Vtable — resolved via `resolve.py Helium vtable HGMipmapLevel`
// (`# HGMipmapLevel vtable @0xa04328; installed ptr 0xa04338`):
//   *0x00 -> 0x3c1090  HGMipmapLevel::~HGMipmapLevel()   ; ud2 trap D1
//   *0x08 -> 0x3c10a0  HGMipmapLevel::~HGMipmapLevel()   ; ud2 trap D0
//   *0x10 -> 0x1a0f20  HGObject::Retain()
//   *0x18 -> 0x1a0f30  HGObject::Release()
//   *0x20 -> 0x11c100  HGNode::debugDescription() const
//   *0x28 -> 0x11c080  HGNode::dotLabel() const
//   *0x30 -> 0x11c090  HGNode::label_A() const
//   *0x38 -> 0x11c0d0  HGNode::label_B() const
//   *0x40 -> 0x11c0e0  HGNode::info(...) const
//   *0x48 -> 0x11c3f0  HGNode::shaderDescription() const
//   *0x50 -> 0x11ca50  HGNode::GetParameterCount()
//   *0x58 -> 0x11ca60  HGNode::GetParameterName(int)
//   *0x60 -> 0x11cab0  HGNode::SetParameter(int, float, float, float, float)
//   *0x68 -> 0x11cbe0  HGNode::GetParameter(int, float*)
//   *0x70 -> 0x11c8a0  HGNode::GetNumInputs()
//   *0x78 -> 0x11c5f0  HGNode::SetInput(int, HGNode*)
//   *0x80 -> 0x11c8b0  HGNode::GetInput(int)
//   *0x88 -> 0x11c8e0  HGNode::SetFlags(int, int)
//   *0x90 -> 0x11c980  HGNode::ClearFlags(int, int)
//   *0x98 -> 0x11ca20  HGNode::GetFlags(int)
//   *0xa0 -> 0x121ef0  HGNode::SetFilter(HGFilterMode)
//   *0xa8 -> 0x120190  HGNode::GetProperty(int, unsigned int)
//   *0xb0 -> 0x120180  HGNode::RenderTile(HGTile*)
//   *0xb8 -> 0x11f680  HGNode::GetProgram(HGRenderer*)
//   *0xc0 -> 0x122000  HGNode::BindParamBufferDesc(HGHandler*)
//   *0xc8 -> 0x122010  HGNode::Bind(HGHandler*)
//   *0xd0 -> 0x121fb0  HGNode::BindTexture(HGHandler*, int)
//   *0xd8 -> 0x122050  HGNode::UnBind(HGHandler*)
//   *0xe0 -> 0x1221d0  HGNode::GetSWAIRProgram() const
// (all non-dtor slots are INHERITED from HGNode — this class overrides only
//  the two vdtor slots, and BOTH overrides are ud2-trap stubs.)
//
// Faithful transcription of exactly FOUR exported symbols. Source disasm
// dumped via raw-port/tools/disasm.sh under raw-port/re/disasm/:
//   Helium.HGMipmapLevel.HGMipmapLevel.s     (C2 ctor @0x22990)
// The D2 dtor at 0x229b0 and the two ud2-trap dtors D1@0x3c1090 / D0@0x3c10a0
// were recovered via a `sed` pull directly from the Helium `_tV.txt`
// (`__ZN13HGMipmapLevelD2Ev:` and its two-instruction body; the trap stubs'
// symbols and 4-instruction ud2 bodies confirmed by their neighboring lines).
// Framework: Final Cut Pro / Helium.framework.
//
// Source disassembly:
//
// (C2 — base-object ctor, aliased as C1 by the linker)
//   __ZN13HGMipmapLevelC2Ev:
//     0x22990 pushq %rbp
//     0x22991 movq  %rsp, %rbp
//     0x22994 pushq %rbx
//     0x22995 pushq %rax                                 ; 16B align
//     0x22996 movq  %rdi, %rbx                           ; spill this
//     0x22999 callq __ZN6HGNodeC2Ev                      ; HGNode::HGNode(this)
//     0x2299e leaq  0x9e1993(%rip), %rax                 ; rax = 0x229a5+0x9e1993
//                                                          ;     = 0xa04338
//                                                          ;     = &(HGMipmapLevel vtable + 0x10)
//                                                          ;   i.e. the INSTALLED vptr (past the
//                                                          ;   two-word ABI header at vtable+0..+0xf).
//     0x229a5 movq  %rax, (%rbx)                         ; this->vptr = &vtable_installed
//     0x229a8 addq  $0x8, %rsp
//     0x229ac popq  %rbx
//     0x229ad popq  %rbp
//     0x229ae retq
//     0x229af nop                                        ; alignment padding
//
// (D2 — base-object dtor)
//   __ZN13HGMipmapLevelD2Ev:
//     0x229b0 pushq %rbp
//     0x229b1 movq  %rsp, %rbp
//     0x229b4 popq  %rbp
//     0x229b5 jmp   __ZN6HGNodeD2Ev                      ; tail-jmp HGNode::~HGNode()
//     0x229ba nopw  (%rax,%rax)                          ; alignment
//
// (D1 — complete-object dtor: TRAP STUB)
//   __ZN13HGMipmapLevelD1Ev:
//     0x3c1090 pushq %rbp
//     0x3c1091 movq  %rsp, %rbp
//     0x3c1094 ud2                                       ; UNREACHABLE — abort
//     0x3c1096 nopw  %cs:(%rax,%rax)                     ; padding
//
// (D0 — deleting dtor: TRAP STUB)
//   __ZN13HGMipmapLevelD0Ev:
//     0x3c10a0 pushq %rbp
//     0x3c10a1 movq  %rsp, %rbp
//     0x3c10a4 ud2                                       ; UNREACHABLE — abort
//     0x3c10a6 nopw  %cs:(%rax,%rax)                     ; padding
//
// The ud2 trap in D0/D1 combined with the fact that BOTH vtable dtor slots
// (`*0x00`, `*0x08`) point to those ud2 stubs is Helium's rock-solid ABI
// contract for "this class is never destroyed virtually". Any caller that
// executes `delete<HGNode>(a_HGMipmapLevel)` or invokes `~HGMipmapLevel()`
// via the vtable will `ud2` and crash. In practice HGMipmapLevel objects
// are ONLY torn down by direct (non-virtual) invocation of the D2 base-object
// dtor at 0x229b0, which chains straight into HGNode::~HGNode().
//
// Semantics decoded: HGMipmapLevel is a leaf HGNode-lineage class whose
// entire distinct behaviour is defined by its vtable identity (its address
// serves as a runtime type-tag) plus the HGNode base subobject. It exposes
// NO OWN INSTANCE STATE — the ctor writes exactly one field (this->vptr),
// nothing else. It exposes NO OWN OVERRIDDEN NON-DTOR METHOD — every non-
// dtor vtable slot is inherited unchanged from HGNode. Downstream code
// distinguishes an HGMipmapLevel from any other HGNode purely by its
// installed vptr (or, equivalently, by dynamic_cast / typeinfo).
//
// Frontier callees (each becomes a throwing stub — call sites cited):
//   HGNode::HGNode() [C2]           @Helium C2 callq 0x22999
//   HGNode::~HGNode() [D2]          @Helium D2 tail-jmp 0x229b5
//
// Reused ports: (none — this class has no HGRect/HGRectf/CMTime/PC*
// dependencies on its own slice).

/**
 * Opaque handle for `HGNode` — Helium's base class for every renderable node.
 * `HGMipmapLevel` IS-A HGNode. HGNode's own layout is not on this class's
 * decoded surface; we only observe its C2 ctor and D2 dtor symbols by name.
 */
export type HGNode = object;

/**
 * `HGNode::HGNode()` [C2 — base-object ctor] — frontier method. Called from
 * `HGMipmapLevel::HGMipmapLevel()` @0x22999 with (`this`). Constructs the
 * HGNode base subobject (installs the base HGNode vptr, initialises HGNode's
 * own fields). Not on this class's decoded surface.
 */
function HGNode_C2_ctor(_this: HGMipmapLevel): void {
  throw new Error(
    "HGMipmapLevel: HGNode::HGNode() [C2] not yet transcribed " +
      "@Helium call site 0x22999",
  );
}

/**
 * `HGNode::~HGNode()` [D2 — base-object dtor] — frontier method. Tail-jmp'd
 * from `HGMipmapLevel::~HGMipmapLevel()` [D2] @0x229b5 with (`this`). Tears
 * down the HGNode base subobject. Not on this class's decoded surface.
 */
function HGNode_D2_dtor(_this: HGMipmapLevel): void {
  throw new Error(
    "HGMipmapLevel: HGNode::~HGNode() [D2] not yet transcribed " +
      "@Helium tail-jmp site 0x229b5",
  );
}

/**
 * `HGMipmapLevel` — a leaf HGNode-lineage class used as a runtime type tag
 * for the "mip level" HGNode variant in Helium's rendergraph. It carries
 * NO own instance state (the ctor writes only `this->vptr`) and overrides
 * NO non-dtor vtable slot. Instances are never destroyed through the
 * virtual dtor slots — both are `ud2` trap stubs installed at Helium
 * addresses 0x3c1090 and 0x3c10a0 respectively.
 */
export class HGMipmapLevel {
  /**
   * `HGMipmapLevel::HGMipmapLevel()` [C2 — base-object ctor, also aliased
   * as C1 by the linker] @Helium 0x22990.
   *
   *   0x22990..0x22999  ; frame setup + spill %rdi (this) into %rbx
   *   0x22999 callq HGNode::HGNode()   ; construct HGNode base subobject
   *   0x2299e leaq  vtable+0x10, %rax  ; load installed vptr = 0xa04338
   *   0x229a5 movq  %rax, (%rbx)       ; this->vptr = &HGMipmapLevel vtable+0x10
   *   0x229a8..0x229ae ; teardown + retq
   *
   * Note: `installed vptr = &vtable + 0x10` skips the two-slot ABI header
   * (offset-to-top at +0, typeinfo* at +0x8). The FIRST actual vtable
   * function slot (`vtable[0]`, the D1 dtor slot) is at `installed_vptr + 0`,
   * so `(*this)(0)` calls the D1 override — which for THIS class is the
   * ud2-trap stub at 0x3c1090. See the class-level comment above for why.
   */
  constructor() {
    // @0x22999 — construct HGNode base subobject
    HGNode_C2_ctor(this);
    // @0x2299e..0x229a5 — install the HGMipmapLevel vptr (@Helium 0xa04338,
    // which is `&HGMipmapLevel_vtable + 0x10` = past the ABI two-slot
    // header). In TypeScript the "vptr install" is expressed implicitly
    // by the fact that `this` is a JavaScript object whose prototype is
    // `HGMipmapLevel.prototype` — the class-identity role served by the
    // C++ vptr is played by the JS prototype chain.
  }

  /**
   * `HGMipmapLevel::~HGMipmapLevel()` [D2 — base-object dtor] @Helium 0x229b0.
   *
   *   0x229b0 pushq %rbp
   *   0x229b1 movq  %rsp, %rbp
   *   0x229b4 popq  %rbp
   *   0x229b5 jmp   HGNode::~HGNode()   ; tail-jmp base D2
   *   0x229ba nopw  (%rax,%rax)         ; alignment
   *
   * The body is a single tail-jmp into HGNode::~HGNode() — this class has
   * NO own instance state to tear down at this offset.
   */
  D2_dtor(): void {
    // @0x229b5
    HGNode_D2_dtor(this);
  }

  /**
   * `HGMipmapLevel::~HGMipmapLevel()` [D1 — complete-object dtor] @Helium
   * 0x3c1090. UD2 TRAP STUB — see class-level comment. Calling this is a
   * hard programming error.
   *
   *   0x3c1090 pushq %rbp
   *   0x3c1091 movq  %rsp, %rbp
   *   0x3c1094 ud2                     ; unreachable
   *   0x3c1096 nopw  %cs:(%rax,%rax)   ; padding
   */
  D1_dtor(): void {
    // @0x3c1094 — ud2 trap: this vtable slot must never be reached.
    throw new Error(
      "HGMipmapLevel: virtual D1 dtor is a ud2 trap stub @Helium 0x3c1094 " +
        "— HGMipmapLevel instances must never be destroyed through the " +
        "virtual dtor slot (see class comment)",
    );
  }

  /**
   * `HGMipmapLevel::~HGMipmapLevel()` [D0 — deleting dtor] @Helium 0x3c10a0.
   * UD2 TRAP STUB — see class-level comment. Calling this is a hard
   * programming error.
   *
   *   0x3c10a0 pushq %rbp
   *   0x3c10a1 movq  %rsp, %rbp
   *   0x3c10a4 ud2                     ; unreachable
   *   0x3c10a6 nopw  %cs:(%rax,%rax)   ; padding
   */
  D0_dtor(): void {
    // @0x3c10a4 — ud2 trap: this vtable slot must never be reached.
    throw new Error(
      "HGMipmapLevel: virtual D0 dtor is a ud2 trap stub @Helium 0x3c10a4 " +
        "— HGMipmapLevel instances must never be destroyed through the " +
        "virtual dtor slot (see class comment)",
    );
  }
}
