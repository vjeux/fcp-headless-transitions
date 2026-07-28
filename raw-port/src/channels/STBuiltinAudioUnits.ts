// STBuiltinAudioUnits — Flexo's static free-function facade over
// STBuiltinAudioUnitsRegistrar (already ported at ./STBuiltinAudioUnitsRegistrar.ts).
//
// Faithful transcription from FCP's Flexo framework at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/
//     Versions/A/Flexo
//
// The class is "static only": every method is a static free function. The
// members it operates on live either in the singleton registrar or in a
// function-local `sBuiltinAURegistration` dispatch_once predicate for
// `Describe()`. There is no instance state on STBuiltinAudioUnits itself.
//
// Purpose: publish four AudioUnit registrations that FCP's Flexo audio
// engine wants to appear as first-class AudioComponents. Each entry is an
// AudioComponentDescription with:
//   componentType         = 0x61756d78 ('aumx' — Apple mixer AU 4CC)
//   componentSubType      = caller-supplied `unsigned int` (the U-code)
//   componentManufacturer = 0x7461705f ('tap_' — the flexo namespace)
//   componentFlags        = varies (0 for Describe/MakeDescriptionFor, 3 for
//                           RegisterBuiltin)
//   componentFlagsMask    = 0
//
// nm evidence (`nm -arch x86_64 -m Flexo | grep STBuiltinAudioUnits`):
//   0000000001251820 T __ZN19STBuiltinAudioUnits18MakeDescriptionForEj
//   0000000001251850 T __ZN19STBuiltinAudioUnits16ManufacturerCodeEv
//   0000000001251860 T __ZN19STBuiltinAudioUnits15RegisterBuiltin\
//                        EPFP29AudioComponentPlugInInterfacePK25AudioComponentDescriptionEj
//   0000000001251b20 T __ZN19STBuiltinAudioUnits8DescribeEj
//   0000000001251c40 T __ZN19STBuiltinAudioUnits17DeferRegistration\
//                        EPFP29AudioComponentPlugInInterfacePK25AudioComponentDescriptionEj
//   0000000001490ec0 t __ZN19STBuiltinAudioUnits8DescribeEj.cold.1
//   0000000001490ee0 t __ZN19STBuiltinAudioUnits17DeferRegistrationEj.cold.1
//
// Static bss (from nm; both are function-local `static` under Describe()):
//   __ZZN19STBuiltinAudioUnits8DescribeEjE22sBuiltinAURegistration
//     — dispatch_once_t predicate for the first-call `RegisterAllBuiltins()`
//       drain. Sentinel value -1 (~0) means "block already ran".
//
// Disassembly saved at:
//   raw-port/re/disasm/Flexo.STBuiltinAudioUnits.MakeDescriptionFor.s (11 lines)
//   raw-port/re/disasm/Flexo.STBuiltinAudioUnits.ManufacturerCode.s   (7 lines)
//   raw-port/re/disasm/Flexo.STBuiltinAudioUnits.RegisterBuiltin.s    (20 lines)
//   raw-port/re/disasm/Flexo.STBuiltinAudioUnits.Describe.s           (23 lines)
//   raw-port/re/disasm/Flexo.STBuiltinAudioUnits.DeferRegistration.s  (22 lines)

import type {
  AudioComponentDescription,
  AudioComponentFactoryFn,
} from "./STBuiltinAudioUnitsRegistrar";
import { STBuiltinAudioUnitsRegistrar } from "./STBuiltinAudioUnitsRegistrar";

// ── Constants baked into the assembly ──────────────────────────────────────
// All five values are proved by loads inside the methods below.

/** componentType — from
 *    `movl $0x61756d78, -0x14(%rbp)` @0x125186b (RegisterBuiltin),
 *    `movl $0x61756d78, (%rdi)`      @0x1251827 (MakeDescriptionFor),
 *    `movl $0x61756d78, (%rax)`      @0x1251b2d (Describe fast-path).
 *  Byte-wise 0x61='a', 0x75='u', 0x6d='m', 0x78='x' — the Apple AU 4-char
 *  code 'aumx' (kAudioUnitType_Mixer). Stored msb-first as a uint32.
 */
const kComponentType_aumx = 0x61756d78; // 'aumx'

/** componentManufacturer — from
 *    `movq $0x7461705f, 0x8(%rax)` @0x1251b36 (Describe fast-path),
 *    `movq $0x7461705f, 0x8(%rdi)` @0x1251830 (MakeDescriptionFor),
 *    low 4 bytes of `movabsq $0x37461705f`  @0x1251875 (RegisterBuiltin).
 *  Byte-wise 0x74='t', 0x61='a', 0x70='p', 0x5f='_' — the CoreAudio manufacturer
 *  4-char code 'tap_' (flexo namespace). Also the return value of ManufacturerCode().
 */
const kComponentManufacturer_tap_ = 0x7461705f; // 'tap_'

/** componentFlags for the RegisterBuiltin path — high 4 bytes of
 *    `movabsq $0x37461705f` @0x1251875 (RegisterBuiltin) — the imm is
 *      0x00000003_7461705f, so the qword at struct+0x8 is:
 *         [0x5f,0x70,0x61,0x74, 0x03,0x00,0x00,0x00]
 *       = componentManufacturer=0x7461705f + componentFlags=0x00000003.
 */
const kComponentFlags_Registered = 0x00000003;

/** componentFlags for the Describe/MakeDescriptionFor path — the
 *  `movq $0x7461705f, 0x8(%rdi)` writes a full qword with the manufacturer
 *  as the low dword and 0 as the high dword, so componentFlags=0 in both
 *  Describe (@0x1251b36) and MakeDescriptionFor (@0x1251830).
 */
const kComponentFlags_Bare = 0x00000000;

/** componentFlagsMask — from
 *    `movl $0x0, 0x10(%rax)`  @0x1251b3e (Describe fast-path),
 *    `movl $0x0, 0x10(%rdi)`  @0x1251838 (MakeDescriptionFor),
 *    `movl $0x0, -0x4(%rbp)`  @0x1251883 (RegisterBuiltin).
 *  Always zero on this class's call sites.
 */
const kComponentFlagsMask = 0x00000000;

// ── The dispatch_once predicate for Describe() ─────────────────────────────
//
// `Describe()` guards its "flush the deferred queue" side effect with a
// function-local static dispatch_once_t (`sBuiltinAURegistration`). Since we
// can't marshal a real libdispatch predicate in TS, we model the sentinel
// with a plain integer and let `_describe_cold_1()` throw citing the frontier
// callee address; a real init path must publish the queue drain and set the
// predicate to -1 before anyone reads Describe()'s fast path.
//
// @Flexo 0x1251b23 cmpq $-0x1, sBuiltinAURegistration(%rip)  (Describe)
let sBuiltinAURegistration = 0;

// The Registrar's own singleton predicate is also referenced by DeferRegistration:
//   @Flexo 0x1251c4c cmpq $-0x1, sPredicate(%rip)  (Registrar::sharedInstance::sPredicate)
// STBuiltinAudioUnitsRegistrar.ts owns the truth for that predicate; the ported
// Registrar.sharedInstance() surface already throws its own cold-path — so from
// here we just call it and let it manage the dispatch_once.

/**
 * Describe().cold.1 body — the dispatch_once slow path that flushes the
 * builtin-AU registration queue on first call to Describe().
 *
 * @Flexo 0x1490ec0 — ICF-coalesced dispatch_once trampoline
 * @Flexo 0x1251b53 callq __ZN19STBuiltinAudioUnits8DescribeEj.cold.1
 *
 * Cannot be faithfully executed in TS (real libdispatch); throws citing
 * the frontier callee so a boot-time initializer must run the drain and
 * flip `sBuiltinAURegistration` to -1 before Describe()'s fast-path reads it.
 */
function _describe_cold_1(): void {
  throw new Error(
    "STBuiltinAudioUnits::Describe.cold.1 not yet transcribed " +
      "(frontier callee @Flexo 0x1490ec0 _dispatch_once via libdispatch stub; " +
      "the block flushes STBuiltinAudioUnitsRegistrar's deferred queue via " +
      "RegisterAllBuiltins — unwired)",
  );
}

/**
 * DeferRegistration().cold.1 body — the dispatch_once slow path that
 * constructs the Registrar singleton on first call from DeferRegistration.
 *
 * @Flexo 0x1490ee0 — ICF-coalesced dispatch_once trampoline
 * @Flexo 0x1251c6f callq __ZN19STBuiltinAudioUnits17DeferRegistration...cold.1
 *
 * Note: the SAME cold-path branch construct is used by the Registrar's own
 * sharedInstance() @0x12518b0 — the cold_1 body runs the singleton
 * dispatch_once. Cannot be faithfully executed in TS; throws citing the
 * frontier callee.
 */
function _deferRegistration_cold_1(): void {
  throw new Error(
    "STBuiltinAudioUnits::DeferRegistration.cold.1 not yet transcribed " +
      "(frontier callee @Flexo 0x1490ee0 _dispatch_once via libdispatch stub; " +
      "block constructs STBuiltinAudioUnitsRegistrar::sInstance — unwired)",
  );
}

/**
 * _AudioComponentRegister — the CoreAudio C API that publishes an AU to the
 * process's AudioComponent table.
 *
 * @Flexo 0x1251897 callq 0x1494512 (symbol stub for _AudioComponentRegister)
 *
 * Signature (from CoreAudio's <AudioToolbox/AudioComponent.h>):
 *   AudioComponent _AudioComponentRegister(
 *       const AudioComponentDescription *desc,
 *       CFStringRef name,
 *       UInt32 version,
 *       AudioComponentFactoryFunction factory);
 * But `RegisterBuiltin` calls it with only 3 explicit args (rdi=&desc,
 * rsi=name-cfstring, rdx=0), passing the factory as an implicit 4th via
 * `_rcx` from the incoming `%rdi` — the compiler used `xorl %edx, %edx`
 * to zero-init `version`, and the ABI's `rcx` slot at 0x1251868 was `%rdi`
 * (i.e. the factory). See the return-boolification at 0x125189c..0x125189f
 * (`testq %rax, %rax ; setne %al` — the retval `AudioComponent` opaque handle
 * is coerced to bool "did it register").
 *
 * Faithful fp32 transcription of a CoreAudio C API is impossible in TS;
 * throws citing the frontier callee.
 */
function _AudioComponentRegister(
  _desc: AudioComponentDescription,
  _name: unknown,
  _version: number,
  _factory: AudioComponentFactoryFn,
): unknown /* AudioComponent handle */ {
  throw new Error(
    "_AudioComponentRegister not yet transcribed " +
      "(frontier callee @Flexo 0x1251897 CoreAudio _AudioComponentRegister via stub 0x1494512)",
  );
}

// ── The class ─────────────────────────────────────────────────────────────

/**
 * STBuiltinAudioUnits — the "static only" facade class. All members are
 * static; there is no instance state on this class.
 */
export class STBuiltinAudioUnits {
  /**
   * STBuiltinAudioUnits::MakeDescriptionFor(unsigned int subType)
   * @Flexo 0x1251820.
   *
   *   __ZN19STBuiltinAudioUnits18MakeDescriptionForEj:
   *     0x1251820  pushq %rbp / movq %rsp,%rbp
   *     0x1251824  movq  %rdi, %rax                 ; return the sret ptr
   *     0x1251827  movl  $0x61756d78, (%rdi)        ; +0x00 = 'aumx'
   *     0x125182d  movl  %esi, 0x4(%rdi)            ; +0x04 = subType
   *     0x1251830  movq  $0x7461705f, 0x8(%rdi)     ; +0x08 = 'tap_' | flags=0
   *     0x1251838  movl  $0x0, 0x10(%rdi)           ; +0x10 = flagsMask=0
   *     0x125183f  popq  %rbp / retq
   *
   * ABI note: the AudioComponentDescription return value uses the sysv-abi
   * "sret" convention because it's a 20-byte POD (> 16 bytes). The caller
   * passes storage in %rdi; the function fills it and returns %rdi. In TS
   * we return the value directly.
   *
   * @param subType — the `componentSubType` u32 (`%esi` on entry).
   * @returns a fresh AudioComponentDescription with type='aumx', mfg='tap_',
   *          flags=0, flagsMask=0, and componentSubType=subType.
   */
  static MakeDescriptionFor(subType: number): AudioComponentDescription {
    // @Flexo 0x1251827..0x1251838 — the four stores in fixed order.
    return {
      // @Flexo 0x1251827 movl $0x61756d78, (%rdi)
      componentType: kComponentType_aumx,
      // @Flexo 0x125182d movl %esi, 0x4(%rdi)   — u32 promotion via >>>0
      componentSubType: subType >>> 0,
      // @Flexo 0x1251830 movq $0x7461705f, 0x8(%rdi) — low4=mfg, high4=flags=0
      componentManufacturer: kComponentManufacturer_tap_,
      componentFlags: kComponentFlags_Bare,
      // @Flexo 0x1251838 movl $0x0, 0x10(%rdi)
      componentFlagsMask: kComponentFlagsMask,
    };
  }

  /**
   * STBuiltinAudioUnits::ManufacturerCode()
   * @Flexo 0x1251850.
   *
   *   __ZN19STBuiltinAudioUnits16ManufacturerCodeEv:
   *     0x1251850  pushq %rbp / movq %rsp,%rbp
   *     0x1251854  movl  $0x7461705f, %eax        ; 'tap_'
   *     0x1251859  popq  %rbp / retq
   *
   * Constant accessor for the flexo AU manufacturer 4CC.
   */
  static ManufacturerCode(): number {
    // @Flexo 0x1251854 movl $0x7461705f, %eax
    return kComponentManufacturer_tap_;
  }

  /**
   * STBuiltinAudioUnits::RegisterBuiltin(
   *     AudioComponentPlugInInterface* (*factory)(AudioComponentDescription const*),
   *     unsigned int subType)
   * @Flexo 0x1251860.
   *
   *   __ZN19STBuiltinAudioUnits15RegisterBuiltinEPFP29AudioComponentPlugInInterface
   *                                              PK25AudioComponentDescriptionEj:
   *     0x1251860  pushq %rbp / movq %rsp,%rbp
   *     0x1251864  subq  $0x20, %rsp                    ; stack for local desc
   *     0x1251868  movq  %rdi, %rcx                     ; %rcx = factory
   *     0x125186b  movl  $0x61756d78, -0x14(%rbp)       ; desc+0x00 = 'aumx'
   *     0x1251872  movl  %esi, -0x10(%rbp)              ; desc+0x04 = subType
   *     0x1251875  movabsq $0x37461705f, %rax           ; low4='tap_', hi4=flags=3
   *     0x125187f  movq  %rax, -0xc(%rbp)               ; desc+0x08 = mfg|flags
   *     0x1251883  movl  $0x0, -0x4(%rbp)               ; desc+0x10 = flagsMask=0
   *     0x125188a  leaq  0x6de357(%rip), %rsi           ; %rsi = cfstring name
   *     0x1251891  leaq  -0x14(%rbp), %rdi              ; %rdi = &desc
   *     0x1251895  xorl  %edx, %edx                     ; %rdx = 0 (version)
   *     0x1251897  callq _AudioComponentRegister        ; via stub 0x1494512
   *     0x125189c  testq %rax, %rax                     ; retval == null?
   *     0x125189f  setne %al                            ; return != null
   *     0x12518a2  addq  $0x20, %rsp / popq %rbp / retq
   *
   * ABI note: the compiler placed the factory in %rcx (the 4th arg register)
   * before calling _AudioComponentRegister — CoreAudio's
   * AudioComponentRegister(desc, name, version, factory) with desc=%rdi,
   * name=%rsi, version=%rdx, factory=%rcx.
   *
   * The cfstring at RIP+0x6de357 is undecoded here (Objc cfstring reference
   * — the FCP debug name for this AU). It's an opaque runtime pointer the
   * caller is expected to supply. Following the disasm faithfully means we
   * pass whatever the caller gives us.
   *
   * @param factory  the AudioComponent factory fn.
   * @param subType  the `componentSubType` u32.
   * @param cfstringName  the CFStringRef at RIP+0x6de357 (undecoded).
   * @returns `_AudioComponentRegister(...) != 0` (setne %al).
   */
  static RegisterBuiltin(
    factory: AudioComponentFactoryFn,
    subType: number,
    // The cfstring at 0x125188a is an Objc const-string ref that otool tags
    // as "bad cfstring ref" — an FCP-internal AU display name that the disasm
    // can't render. We surface it as a caller-supplied opaque pointer so the
    // ported code makes no invented choice for it.
    cfstringName: unknown = null,
  ): boolean {
    // @Flexo 0x125186b..0x1251883 — construct desc on stack.
    const desc: AudioComponentDescription = {
      // @Flexo 0x125186b movl $0x61756d78, -0x14(%rbp)
      componentType: kComponentType_aumx,
      // @Flexo 0x1251872 movl %esi, -0x10(%rbp)
      componentSubType: subType >>> 0,
      // @Flexo 0x1251875+0x125187f — movabsq $0x37461705f, %rax ; movq %rax, -0xc(%rbp)
      //   qword = [0x5f,0x70,0x61,0x74, 0x03,0x00,0x00,0x00]
      //   ⇒ manufacturer=0x7461705f, flags=0x00000003
      componentManufacturer: kComponentManufacturer_tap_,
      componentFlags: kComponentFlags_Registered,
      // @Flexo 0x1251883 movl $0x0, -0x4(%rbp)
      componentFlagsMask: kComponentFlagsMask,
    };
    // @Flexo 0x1251897 callq _AudioComponentRegister
    //   args: rdi=&desc, rsi=cfstringName, rdx=0 (version), rcx=factory
    const handle = _AudioComponentRegister(desc, cfstringName, 0, factory);
    // @Flexo 0x125189c testq %rax, %rax ; @0x125189f setne %al
    return handle !== null && handle !== undefined && handle !== 0;
  }

  /**
   * STBuiltinAudioUnits::Describe(unsigned int subType)
   * @Flexo 0x1251b20.
   *
   *   __ZN19STBuiltinAudioUnits8DescribeEj:
   *     0x1251b20  movq  %rdi, %rax                   ; sret ptr passthrough
   *     0x1251b23  cmpq  $-0x1, sBuiltinAURegistration(%rip)  ; done?
   *     0x1251b2b  jne   0x1251b46                    ; slow path: dispatch_once
   *     0x1251b2d  movl  $0x61756d78, (%rax)          ; +0x00 = 'aumx'
   *     0x1251b33  movl  %esi, 0x4(%rax)              ; +0x04 = subType
   *     0x1251b36  movq  $0x7461705f, 0x8(%rax)       ; +0x08 = 'tap_' | flags=0
   *     0x1251b3e  movl  $0x0, 0x10(%rax)             ; +0x10 = flagsMask=0
   *     0x1251b45  retq
   *     0x1251b46  pushq %rbp / movq %rsp,%rbp / pushq %r14 / pushq %rbx
   *     0x1251b4d  movq  %rax, %rbx                   ; save sret ptr
   *     0x1251b50  movl  %esi, %r14d                  ; save subType
   *     0x1251b53  callq Describe.cold.1              ; @0x1490ec0
   *     0x1251b58  movl  %r14d, %esi ; movq %rbx, %rax ; popq %rbx / %r14 / %rbp
   *     0x1251b62  jmp   0x1251b2d                    ; re-enter fast path
   *
   * Semantics: identical to MakeDescriptionFor() BUT the very first call
   * additionally runs a dispatch_once block (the queue drain) via cold.1.
   * We mirror the branch by consulting `sBuiltinAURegistration`.
   *
   * @param subType — the `componentSubType` u32 (`%esi` on entry).
   * @returns the AudioComponentDescription (sret in ABI).
   */
  static Describe(subType: number): AudioComponentDescription {
    // @Flexo 0x1251b23 cmpq $-0x1, sBuiltinAURegistration ; jne cold
    if ((sBuiltinAURegistration | 0) !== -1) {
      // @Flexo 0x1251b53 callq .cold.1 — dispatch_once queue-drain trampoline
      _describe_cold_1();
    }
    // @Flexo 0x1251b2d..0x1251b3e — identical stores to MakeDescriptionFor.
    return {
      // @Flexo 0x1251b2d movl $0x61756d78, (%rax)
      componentType: kComponentType_aumx,
      // @Flexo 0x1251b33 movl %esi, 0x4(%rax)
      componentSubType: subType >>> 0,
      // @Flexo 0x1251b36 movq $0x7461705f, 0x8(%rax) — low4=mfg, hi4=flags=0
      componentManufacturer: kComponentManufacturer_tap_,
      componentFlags: kComponentFlags_Bare,
      // @Flexo 0x1251b3e movl $0x0, 0x10(%rax)
      componentFlagsMask: kComponentFlagsMask,
    };
  }

  /**
   * STBuiltinAudioUnits::DeferRegistration(
   *     AudioComponentPlugInInterface* (*factory)(AudioComponentDescription const*),
   *     unsigned int flags)
   * @Flexo 0x1251c40.
   *
   *   __ZN19STBuiltinAudioUnits17DeferRegistrationEPFP...E...j:
   *     0x1251c40  pushq %rbp / movq %rsp,%rbp / pushq %r14 / pushq %rbx
   *     0x1251c47  movl  %esi, %edx                  ; edx = flags (3rd Registrar arg)
   *     0x1251c49  movq  %rdi, %rbx                  ; rbx = factory
   *     0x1251c4c  cmpq  $-0x1, sPredicate(%rip)     ; STBuiltinAudioUnitsRegistrar
   *                                                  ; ::sharedInstance()::sPredicate
   *     0x1251c54  jne   0x1251c6c                   ; slow path (init singleton)
   *     0x1251c56  movq  sInstance(%rip), %rdi       ; instance ptr (this)
   *     0x1251c5d  movq  %rbx, %rsi                  ; rsi = factory
   *     0x1251c60  callq Registrar::DeferRegistration ; ← forward to Registrar
   *     0x1251c65  movb  $0x1, %al                   ; return true
   *     0x1251c67  popq  %rbx ; popq %r14 ; popq %rbp ; retq
   *     0x1251c6c  movl  %edx, %r14d                 ; save flags across cold call
   *     0x1251c6f  callq DeferRegistration.cold.1    ; dispatch_once
   *     0x1251c74  movl  %r14d, %edx                 ; restore flags
   *     0x1251c77  jmp   0x1251c56                   ; re-enter fast path
   *
   * Return value: **always true** on this static wrapper (0x1251c65
   * `movb $0x1, %al`). Note that Registrar::DeferRegistration itself returns
   * a bool, but this facade discards it (%al is unconditionally set to 1
   * after the callq). The disasm is unambiguous.
   *
   * @param factory  the AudioComponent factory fn.
   * @param flags    the `unsigned int` flag word to store in the deferred
   *                 registration entry.
   * @returns always `true`.
   */
  static DeferRegistration(
    factory: AudioComponentFactoryFn,
    flags: number,
  ): boolean {
    // @Flexo 0x1251c4c cmpq $-0x1, sPredicate ; jne cold
    // The predicate lives inside STBuiltinAudioUnitsRegistrar's file-local
    // static storage. The ported Registrar.sharedInstance() surface is the
    // faithful mirror of the same cold-path dispatch_once behaviour — call
    // through it so the "if not yet initialised, run cold_1" semantic is
    // preserved even though we don't reach into the raw predicate here.
    //
    // NB: the disasm's cold_1 body is ICF-shared between
    //   STBuiltinAudioUnits::DeferRegistration.cold.1 @0x1490ee0 and the
    //   Registrar's own sharedInstance().cold.1 — both trampoline to
    //   _dispatch_once. Calling Registrar.sharedInstance() traverses the
    //   same guarded slow path.
    let instance: STBuiltinAudioUnitsRegistrar;
    try {
      // @Flexo 0x1251c56 movq sInstance(%rip), %rdi — fast-path read
      instance = STBuiltinAudioUnitsRegistrar.sharedInstance();
    } catch (_e) {
      // @Flexo 0x1251c6f callq DeferRegistration.cold.1 — dispatch_once trampoline
      _deferRegistration_cold_1();
      // unreachable — _deferRegistration_cold_1 always throws.
      instance = STBuiltinAudioUnitsRegistrar.sharedInstance();
    }
    // @Flexo 0x1251c60 callq Registrar::DeferRegistration(factory, flags)
    //   %rdi = instance ptr, %rsi = factory, %edx = flags
    instance.DeferRegistration(factory, flags >>> 0);
    // @Flexo 0x1251c65 movb $0x1, %al — return true unconditionally.
    return true;
  }
}
