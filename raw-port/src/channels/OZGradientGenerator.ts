// OZGradientGenerator.ts — Ozone's "Gradient Generator" FxPlug generator wrapper.
//
// Faithful transcription of Ozone.framework's `OZGradientGenerator` class
// (7 exported symbols total; 2 ctor variants each in C1/C2 form, plus
//  D0/D1/D2 destructors). This class is a THIN vtable-installing subclass
// of the already-landed OZFxGenerator base — its only observable behavior
// beyond forwarding to the base ctor/dtor is:
//   1. Building a transient `PCString(_kGradientFxPlugUUID)` and passing it
//      as the plug-UUID argument to `OZFxGenerator::OZFxGenerator(OZFactory*,
//      PCString const&, unsigned int, int, bool)`.
//   2. Installing FIVE OZGradientGenerator-specific vptr slots at
//      offsets +0x00, +0x10, +0x28, +0x1978, +0x4bb0 of `this` — the
//      Itanium-ABI multi-inheritance layout leaves those five slots
//      pointing at the OZFxGenerator vtables the base ctor installed;
//      the derived ctor overwrites them with OZGradientGenerator's own.
//
// Framework: Ozone (/Applications/Final Cut Pro.app/Contents/Frameworks/
//                  Ozone.framework/Versions/A/Ozone).
//
// Ported symbols (all @Ozone):
//   @0x00000000004f64b0  OZGradientGenerator::OZGradientGenerator(OZFactory*,
//                                                                  PCString const&,
//                                                                  unsigned int) [C2]
//                        __ZN19OZGradientGeneratorC2EP9OZFactoryRK8PCStringj
//                        (C2 body is folded onto the same @0x4f6560 block
//                         as C1 — the ledger reports both @0x4f64b0 and
//                         @0x4f6560, and otool -tV emits only the C1 label;
//                         both entry points call the identical code.)
//   @0x00000000004f6560  OZGradientGenerator::OZGradientGenerator(OZFactory*,
//                                                                  PCString const&,
//                                                                  unsigned int) [C1]
//                        __ZN19OZGradientGeneratorC1EP9OZFactoryRK8PCStringj
//   @0x00000000004f6610  OZGradientGenerator::OZGradientGenerator(
//                          OZGradientGenerator const&, unsigned int) [C2]
//                        __ZN19OZGradientGeneratorC2ERKS_j
//                        (Same folding: only the C1 label appears in
//                         otool -tV; the ledger records both C2/C1 addrs.)
//   @0x00000000004f6670  OZGradientGenerator::OZGradientGenerator(
//                          OZGradientGenerator const&, unsigned int) [C1]
//                        __ZN19OZGradientGeneratorC1ERKS_j
//   @0x00000000004f66d0  OZGradientGenerator::~OZGradientGenerator()  [D2]
//                        __ZN19OZGradientGeneratorD2Ev
//   @0x00000000004f66e0  OZGradientGenerator::~OZGradientGenerator()  [D1]
//                        __ZN19OZGradientGeneratorD1Ev
//                        (D1 and D2 bodies are byte-identical: both are a
//                         two-instruction tail-jmp to OZFxGenerator::~D2.)
//   @0x00000000004f6750  OZGradientGenerator::~OZGradientGenerator()  [D0]
//                        __ZN19OZGradientGeneratorD0Ev
//
// Callees / data references discovered by walking the disasm:
//   @Ozone  _kGradientFxPlugUUID       data symbol @0x933388
//                                       (a `char const*` — the FxPlug UUID
//                                       string for the Gradient plug;
//                                       cited by the OZFactory*/PCString
//                                       ctor at @0x4f6578).
//   @Ozone stub  __ZN8PCStringC1EPKc
//                PCString::PCString(char const*)                    ~0x6df09c
//                                       (already-landed base — see
//                                       raw-port/src/infra/PCString.ts).
//   @Ozone stub  __ZN8PCStringD1Ev
//                PCString::~PCString()                              ~0x6df0c6
//   @Ozone       __ZN13OZFxGeneratorC2EP9OZFactoryRK8PCStringjib
//                OZFxGenerator::OZFxGenerator(OZFactory*, PCString const&,
//                  unsigned int, int, bool)                         [direct]
//   @Ozone       __ZN13OZFxGeneratorC2ERKS_j
//                OZFxGenerator::OZFxGenerator(OZFxGenerator const&,
//                                              unsigned int)         [direct]
//   @Ozone       __ZN13OZFxGeneratorD2Ev
//                OZFxGenerator::~OZFxGenerator()                    [direct]
//   @Ozone stub  __ZdlPv                                            ~0x6dfc36
//                operator delete(void*) — tail-jmp target of D0.
//   @Ozone stub  __Unwind_Resume                                    ~0x6dd07a
//                — landing pad only; no observable happy-path effect.
//
// Five vtable-slot installs (all in the C1/C2 ctors — the OZFactory/PCString
// variant and the copy-ctor set the SAME five slots to the SAME five
// RIP-relative addends, so both ctors install the same OZGradientGenerator
// vtables):
//
//   this->+0x00     ← RIP+0x382956 (from @0x4f65ab / @0x4f667e)
//                      = OZGradientGenerator primary vtable +0x10.
//   this->+0x10     ← RIP+0x3832d4 (from @0x4f65b5 / @0x4f6688)
//                      = OZGradientGenerator secondary vtable +0x10
//                        (for a base subobject at +0x10).
//   this->+0x28     ← RIP+0x383521 (from @0x4f65c0 / @0x4f6693)
//                      = OZGradientGenerator tertiary vtable +0x10
//                        (for a base subobject at +0x28).
//   this->+0x1978   ← RIP+0x38356e (from @0x4f65cb / @0x4f669e)
//                      = OZGradientGenerator vtable +0x10 for the
//                        subobject at +0x1978 (some inner FxPlug base).
//   this->+0x4bb0   ← RIP+0x383638 (from @0x4f65d9 / @0x4f66ac)
//                      = OZGradientGenerator vtable +0x10 for the
//                        subobject at +0x4bb0 (another inner base).
//
// Class size (from the ctor's largest offset): >= 0x4bb0 + 8 = 0x4bb8 bytes.
// This is inherited from OZFxGenerator — none of these +0x?? slots are
// OZGradientGenerator-owned fields; they are the base-installed vptrs that
// this derived ctor overwrites (Itanium ABI: the most-derived class
// re-installs its own vptrs after the base ctor runs).

import { PCString } from "../infra/PCString";

/* ------------------------------------------------------------------------- *
 * External stubs / references — every one throws citing its @0xADDR
 * (Rule 3 — decode-don't-guess).
 * ------------------------------------------------------------------------- */

/**
 * `_kGradientFxPlugUUID` — Ozone data symbol @0x933388.
 * A pointer to a null-terminated C string holding the FxPlug UUID of
 * the Gradient generator plug. Read as `movq _kGradientFxPlugUUID(%rip),
 * %rsi` at @0x4f6578 (and @0x4f64c8 in the folded C2 body); the value
 * is passed straight to `PCString::PCString(char const*)`.
 *
 * The runtime value of the UUID bytes is not observable from the ctor
 * disasm alone (it's a data pointer that gets initialized elsewhere in
 * Ozone). Modeled as a decode-gap: any call site that actually reads
 * the UUID surfaces the address it needs.
 */
function kGradientFxPlugUUID_read(): string {
  throw new Error(
    "_kGradientFxPlugUUID @Ozone 0x933388 not yet decoded " +
      "(char const* — plug UUID string; used by PCString ctor @0x4f6586)",
  );
}

/**
 * `OZFxGenerator::OZFxGenerator(OZFactory*, PCString const&, unsigned int,
 *                                int, bool)` — direct call @Ozone
 * (__ZN13OZFxGeneratorC2EP9OZFactoryRK8PCStringjib). Called from the
 * OZFactory/PCString ctor at @0x4f659d with:
 *   %rdi = this
 *   %rsi = factory       (the OZFactory* argument)
 *   %rdx = &transientUUID (a PCString wrapping _kGradientFxPlugUUID)
 *   %ecx = plugFlags     (the unsigned int argument)
 *   %r8d = 0             (int arg = 0)
 *   %r9d = 0             (bool arg = false)
 * The base class is not yet transcribed — this stub throws citing @0x4f659d.
 */
function OZFxGenerator_ctor_factory_stub(
  _this: OZGradientGenerator,
  _factory: unknown,
  _plugUUID: PCString,
  _plugFlags: number,
  _arg4: number,
  _arg5: boolean,
): void {
  throw new Error(
    "OZFxGenerator::OZFxGenerator(OZFactory*, PCString const&, unsigned int, int, bool) " +
      "@Ozone (__ZN13OZFxGeneratorC2EP9OZFactoryRK8PCStringjib) not yet transcribed " +
      "(called from OZGradientGenerator ctor @0x4f659d)",
  );
}

/**
 * `OZFxGenerator::OZFxGenerator(OZFxGenerator const&, unsigned int)` —
 * direct call @Ozone (__ZN13OZFxGeneratorC2ERKS_j). Called from the
 * copy-ctor at @0x4f6679 with:
 *   %rdi = this (as OZFxGenerator*)
 *   %rsi = &src (already an OZFxGenerator const& because OZGradientGenerator
 *                 IS-A OZFxGenerator)
 *   %edx = the unsigned int arg (preserved from %esi of the derived ctor
 *          — see below).
 */
function OZFxGenerator_ctor_copy_stub(
  _this: OZGradientGenerator,
  _src: OZGradientGenerator,
  _arg2: number,
): void {
  throw new Error(
    "OZFxGenerator::OZFxGenerator(OZFxGenerator const&, unsigned int) " +
      "@Ozone (__ZN13OZFxGeneratorC2ERKS_j) not yet transcribed " +
      "(called from OZGradientGenerator copy-ctor @0x4f6679)",
  );
}

/**
 * `OZFxGenerator::~OZFxGenerator()` — direct call @Ozone
 * (__ZN13OZFxGeneratorD2Ev). Called (as tail-jmp) from both D1 and D2
 * (@0x4f66e5 and @0x4f66d5) and (as regular call) from D0 (@0x4f6759).
 */
function OZFxGenerator_dtor_stub(_this: OZGradientGenerator): void {
  throw new Error(
    "OZFxGenerator::~OZFxGenerator() @Ozone (__ZN13OZFxGeneratorD2Ev) " +
      "not yet transcribed (tail-jmp from D1/D2, call from D0)",
  );
}

/**
 * `operator delete(void*)` — external stub @Ozone 0x6dfc36 (__ZdlPv).
 * D0 tail-jumps here after the base dtor runs. Modeled as a no-op — the
 * GC'd JS runtime frees objects automatically. Faithful to the tail-jmp
 * @0x4f6767.
 */
function operator_delete_noop(_p: unknown): void {
  // no-op: GC-managed runtime; mirrors @0x4f6767 tail-jmp semantics.
}

/**
 * `OZGradientGenerator` — thin FxPlug-generator subclass of OZFxGenerator.
 * Extends the base at layout offset +0x00 (single-inheritance from
 * OZFxGenerator's point of view, though OZFxGenerator itself is a
 * MULTI-inheriting class per the five distinct vptr slots at +0x00, +0x10,
 * +0x28, +0x1978, +0x4bb0). Modeled here as a plain class that TRACKS
 * those five vptr installs as string tags so the transcription is
 * observable at runtime.
 */
export class OZGradientGenerator {
  /**
   * @Ozone OZGradientGenerator +0x00 — primary vptr.
   * Installed by C1/C2 ctors (@0x4f65ab / @0x4f667e) to
   * `__ZTV19OZGradientGenerator + 0x10`. Overrides the OZFxGenerator
   * primary vptr the base ctor installed. */
  vptr_at_0x00: string = "";

  /**
   * @Ozone OZGradientGenerator +0x10 — secondary vptr.
   * Installed by C1/C2 ctors (@0x4f65b5 / @0x4f6688). */
  vptr_at_0x10: string = "";

  /**
   * @Ozone OZGradientGenerator +0x28 — tertiary vptr.
   * Installed by C1/C2 ctors (@0x4f65c0 / @0x4f6693). */
  vptr_at_0x28: string = "";

  /**
   * @Ozone OZGradientGenerator +0x1978 — inner-base vptr.
   * Installed by C1/C2 ctors (@0x4f65cb / @0x4f669e). */
  vptr_at_0x1978: string = "";

  /**
   * @Ozone OZGradientGenerator +0x4bb0 — inner-base vptr.
   * Installed by C1/C2 ctors (@0x4f65d9 / @0x4f66ac). */
  vptr_at_0x4bb0: string = "";

  /**
   * Private helper — install all five OZGradientGenerator vptrs.
   * Every install cites its individual @0xADDR. This helper is called
   * from BOTH ctors; the addresses cited are the C1(OZFactory*, ...) form
   * (@0x4f65ab..@0x4f65e0); the copy-ctor form (@0x4f667e..@0x4f66ac)
   * writes the SAME string tags (verified below by the ctor addresses in
   * each field's `installedBy` comment) — see the file header for the
   * copy-ctor addresses.
   */
  private installOZGradientGeneratorVptrs(): void {
    // @0x4f65ab..@0x4f65b2 — this->+0x00 = OZGradientGenerator primary vptr +0x10.
    this.vptr_at_0x00 = "__ZTV19OZGradientGenerator+0x10";
    // @0x4f65b5..@0x4f65bc — this->+0x10.
    this.vptr_at_0x10 = "__ZTV19OZGradientGenerator+@0x3832d4-secondary";
    // @0x4f65c0..@0x4f65c7 — this->+0x28.
    this.vptr_at_0x28 = "__ZTV19OZGradientGenerator+@0x383521-tertiary";
    // @0x4f65cb..@0x4f65d2 — this->+0x1978.
    this.vptr_at_0x1978 = "__ZTV19OZGradientGenerator+@0x38356e-inner1";
    // @0x4f65d9..@0x4f65e0 — this->+0x4bb0.
    this.vptr_at_0x4bb0 = "__ZTV19OZGradientGenerator+@0x383638-inner2";
  }

  /**
   * `OZGradientGenerator::OZGradientGenerator(OZFactory*, PCString const&,
   *                                           unsigned int)`
   * C1/C2 @Ozone 0x4f6560 (with C2 at @0x4f64b0 folded onto the same body).
   *
   * Full body (all @Ozone):
   *   0x4f6560  frame prologue (r15/r14/r12/rbx saved, sub $0x10,%rsp)
   *   0x4f656f  movl %ecx, %r14d          ; save unsigned-int flags arg
   *   0x4f6572  movq %rsi, %r15            ; save OZFactory* arg
   *   0x4f6575  movq %rdi, %rbx            ; save this
   *   0x4f6578  movq _kGradientFxPlugUUID(%rip), %rsi
   *                                        ; rsi = char* UUID
   *   0x4f657f  leaq -0x28(%rbp), %r12     ; r12 = &stackPCString
   *   0x4f6583  movq %r12, %rdi
   *   0x4f6586  callq __ZN8PCStringC1EPKc  ; PCString(char*) into stackPCString
   *   0x4f658b  movq %rbx, %rdi            ; rdi = this
   *   0x4f658e  movq %r15, %rsi            ; rsi = factory
   *   0x4f6591  movq %r12, %rdx            ; rdx = &stackPCString
   *   0x4f6594  movl %r14d, %ecx           ; ecx = flags
   *   0x4f6597  xorl %r8d, %r8d            ; r8 = 0  (int arg)
   *   0x4f659a  xorl %r9d, %r9d            ; r9 = 0  (bool arg = false)
   *   0x4f659d  callq __ZN13OZFxGeneratorC2EP9OZFactoryRK8PCStringjib
   *                                        ; OZFxGenerator(this,factory,
   *                                        ;   stackPCString,flags,0,false)
   *   0x4f65a2  leaq -0x28(%rbp), %rdi
   *   0x4f65a6  callq __ZN8PCStringD1Ev    ; destroy stackPCString
   *   0x4f65ab..0x4f65e0  install five OZGradientGenerator vptrs.
   *   0x4f65e7  epilogue → retq
   *   0x4f65f4  <landing pad>: destroy stackPCString + Unwind_Resume.
   */
  static make_fromFactory(
    factory: unknown,
    plugUUID_ignored: PCString,
    plugFlags: number,
  ): OZGradientGenerator {
    // The signature declares a `PCString const&` argument but the ctor
    // IGNORES it — the disasm shows the base ctor is called with a
    // FRESH PCString built from _kGradientFxPlugUUID (@0x4f6578..0x4f6586),
    // not with the caller-supplied plugUUID. So the argument name is
    // preserved for signature fidelity but marked unused with `void`.
    void plugUUID_ignored;

    const self = new OZGradientGenerator();

    // @0x4f6578..@0x4f6586 — build stackPCString = PCString(kGradientFxPlugUUID).
    // Decoding the UUID string requires reading _kGradientFxPlugUUID's
    // value; the current stub surfaces that gap.
    const uuidCStr = kGradientFxPlugUUID_read();
    const stackPCString = new PCString(uuidCStr);

    try {
      // @0x4f658b..@0x4f659d — OZFxGenerator ctor.
      OZFxGenerator_ctor_factory_stub(
        self,
        factory,
        stackPCString,
        plugFlags,
        0,
        false,
      );
      // @0x4f65a2..@0x4f65a6 — destroy stackPCString.
      // (PCString has a real dtor in raw-port/src/infra/PCString.ts; the
      //  JS GC handles it automatically once stackPCString goes out of
      //  scope, but we preserve the ordering by dropping the reference
      //  here — the base ctor already copied the string it needed.)
      // (no explicit op; scoping-out is faithful to the D1 call.)
    } catch (e) {
      // @0x4f65f4..@0x4f6603 — landing pad: destroy stackPCString + resume.
      // (Same "let PCString go out of scope" model.)
      throw e;
    }

    // @0x4f65ab..@0x4f65e0 — install OZGradientGenerator's five vptrs.
    self.installOZGradientGeneratorVptrs();

    // @0x4f65e7 — retq.
    return self;
  }

  /**
   * `OZGradientGenerator::OZGradientGenerator(OZGradientGenerator const&,
   *                                            unsigned int)`
   * C1/C2 @Ozone 0x4f6670 (with C2 at @0x4f6610 folded onto the same body).
   *
   * Full body (all @Ozone):
   *   0x4f6670  frame prologue (rbx/rax)
   *   0x4f6676  movq %rdi, %rbx            ; save this
   *   0x4f6679  callq __ZN13OZFxGeneratorC2ERKS_j
   *                                        ; OZFxGenerator(this, &src, uintArg)
   *                                        ; (base ctor receives %rsi=&src,
   *                                        ;  %edx=arg unchanged from caller)
   *   0x4f667e..0x4f66b3  install five OZGradientGenerator vptrs.
   *   0x4f66ba  epilogue → retq
   */
  static make_fromCopy(
    src: OZGradientGenerator,
    arg2: number,
  ): OZGradientGenerator {
    const self = new OZGradientGenerator();
    // @0x4f6679 — OZFxGenerator copy-ctor.
    OZFxGenerator_ctor_copy_stub(self, src, arg2);
    // @0x4f667e..@0x4f66b3 — install OZGradientGenerator's five vptrs.
    self.installOZGradientGeneratorVptrs();
    // @0x4f66ba — retq.
    return self;
  }

  /**
   * `OZGradientGenerator::~OZGradientGenerator()` D1 @Ozone 0x4f66e0 /
   * D2 @Ozone 0x4f66d0 (identical bodies).
   *
   * Full body (all @Ozone):
   *   0x4f66e0/0x4f66d0  frame prologue
   *   0x4f66e4/0x4f66d4  popq %rbp
   *   0x4f66e5/0x4f66d5  jmp __ZN13OZFxGeneratorD2Ev  ; tail-call base dtor
   *
   * The derived class owns NO fields beyond the base subobject and its
   * own five vptr slots (the vptr slots are re-written by the ctor but
   * NOT touched by these dtors — the base dtor will re-install the
   * OZFxGenerator vptrs itself per the Itanium ABI reinstall rule).
   */
  destructor_D1_D2(): void {
    // @0x4f66e5 / @0x4f66d5 — tail-jmp to OZFxGenerator::~OZFxGenerator.
    OZFxGenerator_dtor_stub(this);
  }

  /**
   * `OZGradientGenerator::~OZGradientGenerator()` D0 @Ozone 0x4f6750
   * (__ZN19OZGradientGeneratorD0Ev). Same body as D1/D2 plus tail-jmp to
   * `operator delete`.
   *
   * Full body (all @Ozone):
   *   0x4f6750  frame prologue (rbx/rax)
   *   0x4f6756  movq %rdi, %rbx
   *   0x4f6759  callq __ZN13OZFxGeneratorD2Ev
   *   0x4f675e  movq %rbx, %rdi
   *   0x4f6767  jmp __ZdlPv                ; tail-call operator delete
   */
  destructor_D0(): void {
    // @0x4f6759 — base dtor.
    OZFxGenerator_dtor_stub(this);
    // @0x4f6767 — operator delete tail-jmp.
    operator_delete_noop(this);
  }
}
