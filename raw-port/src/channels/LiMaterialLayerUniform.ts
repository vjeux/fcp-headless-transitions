// LiMaterialLayerUniform.ts — Ozone framework class, faithful transcription of
// its four exported symbols:
//
//   @0x00000000005c3420  __ZN22LiMaterialLayerUniformC2Ev
//                        LiMaterialLayerUniform::LiMaterialLayerUniform()          (default ctor)
//   @0x00000000001e6080  __ZN22LiMaterialLayerUniformC2ERKS_
//                        LiMaterialLayerUniform::LiMaterialLayerUniform(const&)    (copy ctor)
//   @0x00000000005c1680  __ZN22LiMaterialLayerUniformaSERKS_
//                        LiMaterialLayerUniform::operator=(const&)
//   @0x00000000001ee0c0  __ZN22LiMaterialLayerUniformD2Ev
//                        LiMaterialLayerUniform::~LiMaterialLayerUniform()
//
// Source disassembly files:
//   raw-port/re/disasm/LiMaterialLayerUniform.LiMaterialLayerUniform.s (copy ctor, 1452 lines)
//   raw-port/re/disasm/LiMaterialLayerUniform.operator=.s              (559 lines)
//   raw-port/re/disasm/LiMaterialLayerUniform.~LiMaterialLayerUniform.s (247 lines)
//   The default ctor body was dumped separately from /tmp/Ozone_tV.txt (708 lines) — see
//   raw-port/re/disasm/LiMaterialLayerUniform.C2Ev.s below.
//
// ── STRUCT LAYOUT (recovered from default ctor @0x5c3420 + dtor @0x1ee0c0) ─────
// sizeof(LiMaterialLayerUniform) = 0x900 (=2304) bytes.
// The class is a bag of Ozone shader-uniform bindings. Two member shapes appear
// (offsets are absolute within `this`; all offsets divisible by 0x20):
//
//   ProShade::Uniform member (0x20 bytes; 42 instances):
//     +0x00  vptr    = &__ZTVN8ProShade7UniformE + 0x10       (ProShade::Uniform vtable)
//     +0x10  UniformNode*   nullable ptr                       (init'd 0)
//     +0x18  PCSharedCount  weak/strong refcount (ctor: __ZN13PCSharedCountC1Ev
//                          at Ozone stub 0x6ddae8; dtor: PCSharedCountD1Ev at
//                          Ozone stub 0x6ddaee).
//
//   ProShade::Sampler2D member (0x60 bytes; 10 instances):
//     +0x00  ProShade::Sampler   (inner subobject, 0x60 bytes)
//              +0x00 vtable ProShade::Sampler2D +0x10   (concrete override)
//              +0x10 SamplerNode*  (allocated via `new(0x88)` @0x5c3605.., ctor
//                    __ZN8ProShade11SamplerNodeC1ENS_7TexTypeEbbb @stub 0x6df156
//                    with args (0x88-heap, TexType=1, false, false, false))
//                    then attached via __ZN8ProShade7SamplerC2EPNS_11SamplerNodeE
//                    @stub 0x6df1ce.
//              +0x18 PCSharedCount
//              +0x20 vtable VarT<SamplerNode>+0x10   (second embedded VarT)
//              +0x30 SamplerNode*
//              +0x38 PCSharedCount
//              +0x40 vtable VarT<SamplerNode>+0x10   (third embedded VarT)
//              +0x50 SamplerNode*
//              +0x58 PCSharedCount
//     The Sampler2D vtable install at +0x00 (after Sampler ctor) is what upgrades
//     the base Sampler subobject to a concrete Sampler2D — the Itanium ABI
//     construction pattern.
//
// The 52 members are laid out as (offset : type):
//   0x000..0x140 : Uniform × 11   (0x000, 0x020, 0x040, 0x060, 0x080, 0x0a0,
//                                  0x0c0, 0x0e0, 0x100, 0x120, 0x140)
//   0x160        : Sampler2D
//   0x1c0        : Sampler2D
//   0x220        : Sampler2D
//   0x280        : Sampler2D
//   0x2e0        : Sampler2D
//   0x340        : Sampler2D
//   0x3a0..0x3c0 : Uniform × 2    (0x3a0, 0x3c0)
//   0x3e0        : Sampler2D
//   0x440..0x460 : Uniform × 2    (0x440, 0x460)
//   0x480        : Sampler2D
//   0x4e0        : Sampler2D
//   0x540        : Sampler2D
//   0x5a0..0x8e0 : Uniform × 27   (stride 0x20)
// Totals: 42 Uniform × 0x20 + 10 Sampler2D × 0x60 = 0x540 + 0x3C0 = 0x900. ✓
// The dtor issues 72 PCSharedCount destructor calls (42 Uniform + 30 Sampler2D
// inner counts, three per Sampler2D) — confirms the layout above.
//
// ── FRONTIER (unresolved callees / vtables — each is a demand signal for a
//    future port) ─────────────────────────────────────────────────────────────
//   __ZTVN8ProShade7UniformE                  ProShade::Uniform vtable
//   __ZTVN8ProShade4VarTINS_11UniformNodeEEE  ProShade::VarT<ProShade::UniformNode> vtable
//   __ZTVN8ProShade4VarTINS_11SamplerNodeEEE  ProShade::VarT<ProShade::SamplerNode> vtable
//   __ZTVN8ProShade7SamplerE                  ProShade::Sampler vtable
//   __ZTVN8ProShade9Sampler2DE                ProShade::Sampler2D vtable
//   __ZN13PCSharedCountC1Ev              stub 0x6ddae8   PCSharedCount::PCSharedCount()
//   __ZN13PCSharedCountD1Ev              stub 0x6ddaee   PCSharedCount::~PCSharedCount()
//   __ZN8ProShade11SamplerNodeC1ENS_7TexTypeEbbb  stub 0x6df156
//                                        ProShade::SamplerNode::SamplerNode(TexType,bool,bool,bool)
//   __ZN8ProShade7SamplerC2EPNS_11SamplerNodeE    stub 0x6df1ce
//                                        ProShade::Sampler::Sampler(SamplerNode*)
//   __ZN8ProShade9Sampler2DD1Ev          direct-call    ProShade::Sampler2D::~Sampler2D()
//   __Znwm                               stub 0x6dfca2  operator new(size_t)
//   __ZdlPv                              stub 0x6dfc36  operator delete(void*)
//   __Unwind_Resume                      stub 0x6dd07a  ABI unwind resume trampoline
// None of these are yet ported; each method below cites the exact @0xADDR at
// which it invokes them.
//
// ── PORT STRATEGY ────────────────────────────────────────────────────────────
// The class is a large uniform-binding struct built from types not yet ported
// (ProShade::Uniform, ProShade::Sampler2D, PCSharedCount, and the two VarT
// templates). Neither the ctors nor operator= execute any decoded math beyond
// vtable installs, null-pointer stores, and per-member subobject ctor/dtor
// calls into those unported types. The faithful mirror is a class whose four
// entry points throw when invoked, each citing (a) its own @0xADDR, and
// (b) the frontier callees it would need. Field layout is recorded in the
// header above so a subsequent port that lands ProShade::Uniform +
// ProShade::Sampler2D can drive concrete member construction without
// re-deriving offsets.

/**
 * `LiMaterialLayerUniform` — Ozone shader-uniform binding block for the
 * material-layer pipeline. Fixed-shape struct: 42 `ProShade::Uniform` slots
 * plus 10 `ProShade::Sampler2D` slots at pinned offsets (see file header for
 * the offset table). Total sizeof = 0x900.
 *
 * Both ctors, operator=, and the dtor all delegate to member subobject
 * ctors/dtors on unported types (`ProShade::Uniform`, `ProShade::Sampler2D`,
 * `PCSharedCount`, `ProShade::VarT<ProShade::UniformNode>`,
 * `ProShade::VarT<ProShade::SamplerNode>`). Until those callees are ported,
 * every entry point raises with an address citation so callers surface as
 * demand signals for the missing subsystem.
 */
export class LiMaterialLayerUniform {
  /**
   * `LiMaterialLayerUniform::LiMaterialLayerUniform()` (default ctor,
   * `__ZN22LiMaterialLayerUniformC2Ev`) @Ozone 0x5c3420.
   *
   * Body summary (from disasm dump; 708 instructions, all vtable installs +
   * null-ptr stores + subobject ctor calls, no computed data):
   *   1. Load `__ZTVN8ProShade4VarTINS_11UniformNodeEEE + 0x10` into %r13
   *      (base VarT<UniformNode> vptr used for each Uniform's transient
   *      base-subobject vptr install prior to derived-class vptr install).
   *   2. For each of the 42 Uniform slots at the offsets listed in the
   *      header table:
   *        movq %r13, off(%rbx)         ; base-vptr install
   *        movq $0, (off+0x10)(%rbx)    ; null UniformNode pointer
   *        leaq (off+0x18)(%rbx), %rdi
   *        callq PCSharedCountC1Ev      ; @Ozone stub 0x6ddae8
   *        movq %r15, off(%rbx)         ; %r15 = Uniform-vtable +0x10 (derived)
   *   3. For each of the 10 Sampler2D slots (each 0x60 bytes):
   *        movl $0x88, %edi ; callq __Znwm  ; @stub 0x6dfca2 — allocate SamplerNode
   *        movl $1, %esi ; xorl %edx,%edx ; xorl %ecx,%ecx ; xorl %r8d,%r8d
   *        callq SamplerNodeC1ETexTypebbb    ; @stub 0x6df156 (TexType=1, false, false, false)
   *        leaq off(%rbx), %rdi ; movq %rax, %rsi
   *        callq SamplerC2EPSamplerNode      ; @stub 0x6df1ce
   *        movq %r12, off(%rbx)              ; %r12 = Sampler2D-vtable +0x10
   *   4. Function epilogue restores callee-saved regs and returns @0x5c3dbd.
   *   5. Exception-cleanup landing pads (@0x5c3dbe..0x5c4125) unwind the
   *      partially-constructed members in reverse — reinstall base vptrs,
   *      call `PCSharedCountD1Ev` (stub 0x6ddaee) or `Sampler2DD1Ev`
   *      (@0x001ee0c0) and `operator delete` (@stub 0x6dfc36) on any
   *      already-newed SamplerNode, then tail-call `__Unwind_Resume`
   *      (@stub 0x6dd07a) at @0x5c4125.
   *
   * All subobject ctors invoked here are unported (see frontier list in file
   * header). The faithful mirror is a throw citing the address.
   */
  constructor() {
    /* @0x5c3420 — see class header for the 52-member layout this ctor builds. */
    if (arguments.length === 0) {
      throwUnported("LiMaterialLayerUniform::LiMaterialLayerUniform() @Ozone 0x5c3420 (default ctor)"); // @0x5c3420 — subobject ctors PCSharedCountC1Ev @stub 0x6ddae8, SamplerNodeC1E @stub 0x6df156, SamplerC2E @stub 0x6df1ce not yet ported
    } else {
      throwUnported("LiMaterialLayerUniform::LiMaterialLayerUniform(const LiMaterialLayerUniform&) @Ozone 0x1e6080 (copy ctor)"); // @0x1e6080 — 1452-line copy ctor copies every subobject; PCSharedCountC1EP13PCShared_base @stub 0x6ddadc, Sampler copy-ctors unported
    }
  }

  /**
   * `LiMaterialLayerUniform::LiMaterialLayerUniform(const LiMaterialLayerUniform&)`
   * (copy ctor, `__ZN22LiMaterialLayerUniformC2ERKS_`) @Ozone 0x1e6080.
   *
   * Body: 1452 instructions. Same 52-member layout as the default ctor, but
   * each subobject is copy-constructed from the corresponding slot on the
   * source (`%rsi`). Key ABI differences vs the default ctor:
   *   - The PCSharedCount ctor used is
   *     `__ZN13PCSharedCountC1EP13PCShared_base` (@Ozone stub 0x6ddadc,
   *     one-arg from-backing-object ctor), NOT the zero-arg
   *     `PCSharedCountC1Ev`.
   *   - Prior to that call the source-side vptr adjust is performed at
   *     @0x1e60b0..@0x1e60be: `testq %rsi,%rsi; je +6; movq (%rsi),%rax;
   *     addq -0x18(%rax),%rsi` — Itanium virtual-base offset table lookup.
   *   - For each Sampler2D slot the source Sampler2D is deep-copied via
   *     its own copy-ctor (unported).
   *
   * TypeScript surface: this is a plain factory hook, not a native C++
   * overload, so we thread both ctors through a single `constructor()` that
   * dispatches on argument count and raises for both cases. See body above.
   */
  static copyConstruct(_src: LiMaterialLayerUniform): LiMaterialLayerUniform {
    throwUnported("LiMaterialLayerUniform::LiMaterialLayerUniform(const&) @Ozone 0x1e6080 — copy-ctor body copies 52 subobjects via unported PCSharedCountC1EP13PCShared_base @stub 0x6ddadc and Sampler2D copy-ctors"); // @0x1e6080
  }

  /**
   * `LiMaterialLayerUniform::operator=(const LiMaterialLayerUniform&)`
   * (`__ZN22LiMaterialLayerUniformaSERKS_`) @Ozone 0x5c1680.
   *
   * Body: 559 instructions. For each of the 52 members, invokes the
   * corresponding subobject's `operator=` on the source's matching slot.
   * The Uniform and Sampler2D `operator=` symbols are unported (they in turn
   * would decrement/adjust PCSharedCount refcounts, then rebind
   * `UniformNode*` / `SamplerNode*` pointers). Returns `*this`.
   *
   * Field-layout consistency check: operator= references exactly the same
   * 52 slot offsets as the default ctor above.
   */
  assign(_other: LiMaterialLayerUniform): LiMaterialLayerUniform {
    throwUnported("LiMaterialLayerUniform::operator=(const&) @Ozone 0x5c1680 — assigns 52 subobjects via unported ProShade::Uniform::operator= and ProShade::Sampler2D::operator="); // @0x5c1680
  }

  /**
   * `LiMaterialLayerUniform::~LiMaterialLayerUniform()`
   * (`__ZN22LiMaterialLayerUniformD2Ev`) @Ozone 0x1ee0c0.
   *
   * Body summary (247 instructions):
   *   1. Load `VarT<UniformNode>+0x10` into %r14 (@0x1ee0ce) — the base vptr
   *      each Uniform slot is reset to before its inner cleanup (Itanium ABI
   *      reinstall-vptr-before-teardown, seen also in
   *      LiMaterialLayerOperator.ts).
   *   2. Walk the 42 Uniform slots in reverse offset order (@0x1ee0d9
   *      onward: 0x8e0, 0x8c0, 0x8a0, ...) — for each:
   *        movq %r14, off(%rbx)                  ; reinstall base vptr
   *        leaq (off+0x18)(%rbx), %rdi
   *        callq __ZN13PCSharedCountD1Ev         ; @stub 0x6ddaee
   *   3. At @0x1ee2da load `Sampler+0x10` into %r15 and
   *      `VarT<SamplerNode>+0x10` into %r12; walk the 10 Sampler2D slots in
   *      reverse offset order. Each Sampler2D emits the 3-count teardown:
   *        movq %r15, off(%rbx)                  ; reinstall Sampler vptr
   *        movq %r14, (off+0x40)(%rbx)           ; VarT vptr on 3rd VarT
   *        leaq (off+0x58)(%rbx), %rdi ; PCSharedCountD1Ev
   *        movq %r14, (off+0x20)(%rbx)           ; VarT vptr on 2nd VarT
   *        leaq (off+0x38)(%rbx), %rdi ; PCSharedCountD1Ev
   *        movq %r12, off(%rbx)                  ; final VarT<SamplerNode> vptr
   *        leaq (off+0x18)(%rbx), %rdi ; PCSharedCountD1Ev
   *      (This is the exact reverse of the 3-count-per-Sampler2D
   *      construction path in the default ctor.)
   *   4. Function epilogue @0x1ee1b0 restores %rbx, %r12, %r14, %r15 and
   *      returns. Total: 72 PCSharedCount D1 calls (42 + 3×10 = 72). ✓
   *
   * Every callee here is unported (see file header frontier list).
   */
  destroy(): void {
    throwUnported("LiMaterialLayerUniform::~LiMaterialLayerUniform() @Ozone 0x1ee0c0 — 72 PCSharedCountD1Ev calls @stub 0x6ddaee across 42 Uniform + 10 Sampler2D subobjects"); // @0x1ee0c0
  }
}

/**
 * Local helper — every method in this class currently raises. Centralizing
 * the throw keeps the per-method body a single line whose text captures both
 * the address citation and the frontier callee that would need porting.
 */
function throwUnported(msg: string): never {
  throw new Error(msg);
}
