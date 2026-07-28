// OZPrimatteRT.ts — FCP Ozone framework class.
// Transcribed from the x86_64 disassembly of Ozone in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
// (see raw-port/re/disasm/OZPrimatteRT.OZPrimatteRT.s and the primatte_ctors
// dump for the C2/C1/copy/dtor entries).
//
// SYMBOLS (nm | c++filt):
//   0x61b660  T OZPrimatteRT::OZPrimatteRT(OZFactory*, PCString const&, unsigned int)  (C2 base)
//   0x61b6c0  T OZPrimatteRT::OZPrimatteRT(OZFactory*, PCString const&, unsigned int)  (C1 complete)
//   0x61b720  T OZPrimatteRT::OZPrimatteRT(OZPrimatteRT const&, unsigned int)           (C2 copy)
//   0x61b770  T OZPrimatteRT::OZPrimatteRT(OZPrimatteRT const&, unsigned int)           (C1 copy)
//   0x61b7c0  T OZPrimatteRT::~OZPrimatteRT()                                           (D2)
//   0x61b7d0  T OZPrimatteRT::~OZPrimatteRT()                                           (D1)
//   0x61b830  T OZPrimatteRT::~OZPrimatteRT()                                           (D0)
//   0x61b910  t __GLOBAL__sub_I_OZPrimatteRT.cpp                                        (kPrimatteFxPlugUUID init)
//   0x884778  S vtable for OZPrimatteRT  (primary, __ZTV12OZPrimatteRT)
//   0x87bbf0  b kPrimatteFxPlugUUID (PCString, .bss, filled by __GLOBAL__sub_I)
//
// PROVENANCE / DECODE:
//   Every ctor body (Ozone @0x61b660, 0x61b6c0, 0x61b720, 0x61b770) has the SAME shape:
//     1. tail-call OZFxFilter::OZFxFilter(...)                (base sub-object init)
//     2. patch this->+0x00, +0x20, +0x30, +0x48, +0x168 with 5 RIP-relative pointers
//        These are secondary vtable pointers for multiple-inheritance sub-objects
//        (OZPrimatteRT overrides only its own vtable — the sub-object vptrs point
//        into the OZPrimatteRT vtable @0x884778 rather than the OZFxFilter vtable).
//     3. return
//
//   All three destructors (@0x61b7c0 D2, @0x61b7d0 D1, @0x61b830 D0) are pass-throughs:
//     D2/D1: `popq %rbp; jmp OZFxFilter::~OZFxFilter()`
//     D0   : `callq OZFxFilter::~OZFxFilter(); jmp __ZdlPv`
//
//   So OZPrimatteRT introduces NO NEW OWN METHOD BODY beyond the ctor/dtor plumbing.
//   Its full behaviour is inherited (see vtable dump via vtable.py Ozone OZPrimatteRT):
//     *0x00  ~OZPrimatteRT     -> 0x61b7d0 / 0x61b830
//     *0x10  getBounds         -> OZFxFilter @0x293560
//     *0x18  getPreviewBounds  -> OZRenderNode @0x83320
//     *0x20  getBoundary       -> OZRenderNode @0x83330
//     ... (35 more slots, all inherited from OZFxFilter/OZImageNode/OZRenderNode/OZEffect/OZEffect_Base)
//
//   The class exists as a THIN wrapper around OZFxFilter whose sole distinguishing
//   attribute is the plugin-UUID string passed to the base ctor.
//
// ── PLUGIN UUID (constant) ─────────────────────────────────────────────────
//   kPrimatteFxPlugUUID @Ozone .bss 0x87bbf0 is initialized once at load time
//   by __GLOBAL__sub_I_OZPrimatteRT.cpp @0x61b910:
//
//     0x61b91d  leaq  <literal>, %rsi        ## "D4902242-F23A-49D4-8002-8A8991BF52FB"
//     0x61b924  movq  %rbx, %rdi             ## rdi = &kPrimatteFxPlugUUID
//     0x61b927  callq PCString::PCString(char const*)
//     0x61b943  jmp   ___cxa_atexit          ## register PCString::~PCString for teardown
//
//   That single literal is what identifies the Primatte real-time effect to
//   FCP's effect factory registry.
//
// @class Ozone OZPrimatteRT
// @provenance Ozone @0x61b660 (C2), @0x61b6c0 (C1), @0x61b720 (C2 copy),
//             @0x61b770 (C1 copy), @0x61b7c0 (D2), @0x61b7d0 (D1),
//             @0x61b830 (D0), @0x61b910 (kPrimatteFxPlugUUID init),
//             @0x884778 (vtable), @0x87bbf0 (kPrimatteFxPlugUUID .bss)

/**
 * OZPrimatteRT — Ozone plugin wrapper for the "Primatte" real-time chroma-key
 * FxPlug effect.
 *
 * The class is a THIN specialisation of OZFxFilter that supplies exactly ONE
 * identifying constant — the plugin UUID `D4902242-F23A-49D4-8002-8A8991BF52FB`
 * — to the OZFxFilter constructor.  It defines no new decoded behaviour of
 * its own; every method visible through its vtable is inherited from the
 * OZFxFilter / OZImageNode / OZRenderNode / OZEffect / OZEffect_Base chain.
 *
 * Because the entire OZFxFilter base is NOT YET TRANSCRIBED (see
 * raw-port/army/ledger/CLASSES.tsv: `Ozone  OZFxFilter  121  0`), constructing
 * an instance here would require calling a base ctor whose body is unknown.
 * Per PORTING_SPEC Rule 3 (throw on undecoded), the constructor bodies below throw a "not yet transcribed" error citing OZFxFilter ctors @0x61b6d6 / @0x61b779 and OZFxFilter dtor @0x61b7c5.
 */
export class OZPrimatteRT {
  /**
   * The FxPlug plugin UUID that identifies Primatte RT to the FCP effect
   * registry.  Loaded verbatim from the string-literal pool at
   * Ozone @0x61b91d and stored (as a PCString) into the .bss singleton
   * `kPrimatteFxPlugUUID` at Ozone @0x87bbf0 by
   * __GLOBAL__sub_I_OZPrimatteRT.cpp @0x61b910.
   *
   * @provenance Ozone @0x61b91d (literal-pool address for the C string)
   */
  static readonly kPrimatteFxPlugUUID: string =
    "D4902242-F23A-49D4-8002-8A8991BF52FB";

  /**
   * OZPrimatteRT::OZPrimatteRT(OZFactory*, PCString const&, unsigned int)
   * — C1 complete-object constructor.
   *
   * Ozone @0x61b6c0..0x61b71a:
   *
   *     pushq %rbp; movq %rsp,%rbp
   *     pushq %rbx; pushq %rax
   *     movq  %rdi, %rbx                        ; save `this`
   *     leaq  kPrimatteFxPlugUUID(%rip), %rdx   ; rdx = 3rd arg = plug UUID
   *     xorl  %r8d, %r8d                        ; r8  = 4th arg = 0 (int)
   *     xorl  %r9d, %r9d                        ; r9  = 5th arg = false (bool)
   *     callq OZFxFilter::OZFxFilter(OZFactory*, PCString const&,
   *                                  unsigned int, int, bool)   @0x?????? (undecoded)
   *     leaq  <vtblFragment0>(%rip), %rax; movq %rax, (%rbx)      ; *this+0x00
   *     leaq  <vtblFragment1>(%rip), %rax; movq %rax, 0x20(%rbx) ; MI sub-obj vptr
   *     leaq  <vtblFragment2>(%rip), %rax; movq %rax, 0x30(%rbx) ; MI sub-obj vptr
   *     leaq  <vtblFragment3>(%rip), %rax; movq %rax, 0x48(%rbx) ; MI sub-obj vptr
   *     leaq  <vtblFragment4>(%rip), %rax; movq %rax, 0x168(%rbx); MI sub-obj vptr
   *     addq  $0x8,%rsp; popq %rbx; popq %rbp; retq
   *
   * The five RIP-relative loads all resolve into the OZPrimatteRT vtable region
   * at Ozone @0x884778..0x884c00 (primary + secondary sub-object vptrs for the
   * multi-inheritance chain OZFxFilter -> OZImageNode -> OZRenderNode ->
   * OZEffect -> OZEffect_Base).
   *
   * @provenance Ozone @0x61b6c0
   */
  constructor(
    _factory: unknown,
    _name: unknown,
    _flags: number,
    // OZFxFilter's ctor takes two additional args (int, bool) — here we mirror
    // the FCP call convention where OZPrimatteRT hard-codes both to 0/false.
    // (See @0x61b6d0..0x61b6d3: `xorl %r8d,%r8d; xorl %r9d,%r9d` before the
    // callq to OZFxFilter::OZFxFilter.)
    _mode: "OZPrimatteRT::C1(OZFactory*,PCString const&,unsigned int)" =
      "OZPrimatteRT::C1(OZFactory*,PCString const&,unsigned int)",
  ) {
    // Base subobject requires OZFxFilter::OZFxFilter — not yet transcribed.
    throw new Error(
      "OZPrimatteRT::OZPrimatteRT(OZFactory*,PCString const&,unsigned int) " +
      "@Ozone 0x61b6c0 requires " +
      "OZFxFilter::OZFxFilter(OZFactory*,PCString const&,unsigned int,int,bool) " +
      "(callq @Ozone 0x61b6d6) which is not yet transcribed. " +
      "See raw-port/army/ledger/CLASSES.tsv (Ozone OZFxFilter 121 0)."
    );
  }

  /**
   * OZPrimatteRT::OZPrimatteRT(OZPrimatteRT const&, unsigned int)
   * — C1 copy-constructor.
   *
   * Ozone @0x61b770..0x61b7bd:
   *
   *     pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax
   *     movq  %rdi,%rbx
   *     callq OZFxFilter::OZFxFilter(OZFxFilter const&, unsigned int)  (undecoded)
   *     [same 5 vptr writes at *0x00, *0x20, *0x30, *0x48, *0x168]
   *     addq $0x8,%rsp; popq %rbx; popq %rbp; retq
   *
   * @provenance Ozone @0x61b770
   */
  static copy(_other: OZPrimatteRT, _flags: number): OZPrimatteRT {
    throw new Error(
      "OZPrimatteRT::OZPrimatteRT(OZPrimatteRT const&,unsigned int) " +
      "@Ozone 0x61b770 requires OZFxFilter::OZFxFilter(OZFxFilter const&,unsigned int) " +
      "(callq @Ozone 0x61b779) which is not yet transcribed."
    );
  }

  /**
   * OZPrimatteRT::~OZPrimatteRT() — D2 base-object destructor.
   *
   * Ozone @0x61b7c0..0x61b7c9:
   *
   *     pushq %rbp; movq %rsp,%rbp; popq %rbp
   *     jmp   OZFxFilter::~OZFxFilter()      ## @0x?????? (undecoded)
   *
   * Pure tail-call: the derived class carries NO OWN destructible members,
   * so all cleanup is done by the OZFxFilter dtor.
   *
   * @provenance Ozone @0x61b7c0
   */
  destroyBase(): void {
    throw new Error(
      "OZPrimatteRT::~OZPrimatteRT() D2 @Ozone 0x61b7c0 tail-jumps to " +
      "OZFxFilter::~OZFxFilter() @Ozone (undecoded) — base dtor not yet transcribed."
    );
  }

  /**
   * OZPrimatteRT::~OZPrimatteRT() — D1 complete-object destructor.
   *
   * Ozone @0x61b7d0..0x61b7d9: identical body to D2 — pure tail-call into
   * OZFxFilter::~OZFxFilter().
   *
   * @provenance Ozone @0x61b7d0
   */
  destroy(): void {
    throw new Error(
      "OZPrimatteRT::~OZPrimatteRT() D1 @Ozone 0x61b7d0 tail-jumps to " +
      "OZFxFilter::~OZFxFilter() @Ozone (undecoded) — base dtor not yet transcribed."
    );
  }

  /**
   * OZPrimatteRT::~OZPrimatteRT() — D0 deleting destructor.
   *
   * Ozone @0x61b830..0x61b848:
   *
   *     pushq %rbp; movq %rsp,%rbp; pushq %rbx; pushq %rax
   *     movq  %rdi,%rbx
   *     callq OZFxFilter::~OZFxFilter()            ## @0x?????? (undecoded)
   *     movq  %rbx,%rdi
   *     addq $0x8,%rsp; popq %rbx; popq %rbp
   *     jmp   __ZdlPv                              ## operator delete(void*)
   *
   * @provenance Ozone @0x61b830
   */
  destroyAndFree(): void {
    throw new Error(
      "OZPrimatteRT::~OZPrimatteRT() D0 @Ozone 0x61b830 calls " +
      "OZFxFilter::~OZFxFilter() (@0x61b839) then jumps to operator delete " +
      "(__ZdlPv @0x6dfc36) — base dtor not yet transcribed."
    );
  }
}
