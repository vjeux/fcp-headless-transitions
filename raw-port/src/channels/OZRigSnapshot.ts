// raw-port/src/channels/OZRigSnapshot.ts
//
// FCP `OZRigSnapshot` — a small OZChannelFolder subclass that packages a rig's
// "value" (double) and "interpolation" (enum) sub-channels and exposes a single
// piece of shipped math: `applyInterpolation(double)`.
//
// Framework: Ozone (thin x86_64 slice; VA==offset when the fat header is skipped
// by 0x4000; disasm.sh already writes the un-adjusted VA — the addresses cited
// below match `otool -tV -arch x86_64` output byte-for-byte).
//
// Enumerated methods from raw-port/army/ledger/Ozone.ledger.json (the ledger is
// the source of truth for completion — every listed address is either transcribed
// here or throws citing that same address so `mark_ported.py` can see the gap):
//   OZRigSnapshot(OZChannelFolder*, unsigned int)                    C2 @0x574ab0
//   OZRigSnapshot(OZChannelFolder*, unsigned int)                    C1 @0x574cf0
//   OZRigSnapshot(OZRigSnapshot const&, OZChannelFolder*)            C2 @0x574d00
//   OZRigSnapshot(OZRigSnapshot const&, OZChannelFolder*)            C1 @0x574dc0
//   ~OZRigSnapshot()                                                 D2 @0x574e80
//   ~OZRigSnapshot()                                                 D1 @0x574ee0
//   ~OZRigSnapshot()                                                 D0 @0x574f40
//   applyInterpolation(double)                                       @0x574fa0
//
// STRUCT LAYOUT recovered exhaustively from the two ctors above (@0x574ab0 and
// @0x574d00). The class virtually-inherits — a single vptr at +0x0 is installed
// from `(rip+0x30ad37)` @0x574aca / `(rip+0x30aaf0)` @0x574d11 (i.e. the
// OZRigSnapshot vtable). The class stitches together three sub-objects laid out
// end-to-end:
//
//   +0x000 : void*                 vptr                (@0x574ad1 / @0x574d18)
//   +0x008 : OZChannelFolder       folderBase          (this is the "rig folder"
//                                                       itself; ctor installs it
//                                                       via OZChannelFolder C1
//                                                       @0x574b11 / @0x574d26.
//                                                       Occupies +0x008..+0x087.)
//   +0x088 : OZChannel [value]     valueChan           (an OZChannel that is
//                                                       downcast to OZChannelDouble
//                                                       — see copy-ctor @0x574d45:
//                                                       primary vtable slot at
//                                                       +0x088 is
//                                                       __ZTV15OZChannelDouble+0x10,
//                                                       secondary at +0x098 is
//                                                       __ZTV15OZChannelDouble+0x380.
//                                                       Occupies +0x088..+0x11F.)
//   +0x120 : OZChannelEnum         interpolationChan   (an OZChannelEnum built by
//                                                       __ZN13OZChannelEnumC1... —
//                                                       see @0x574c4d /
//                                                       @0x574d7d. Occupies
//                                                       +0x120..end.)
//
// SUB-OBJECT SIZES (from base + delta offsets):
//   OZChannelFolder subobject : 0x88 - 0x08 = 0x80 bytes
//   OZChannel      subobject  : 0x120 - 0x88 = 0x98 bytes
//
// The C2(OZChannelFolder*, uint) ctor walks these three sub-objects in order,
// building each with a localized PCString name (looked up via
// _theApp.vtbl@+0x48 — the app's localization service; the actual strings live
// in the app's resource bundle and we treat them as opaque IDs here) and an
// OZChannel* impl+info pair via a std::__call_once-guarded static getter
// (`OZRigSnapshot_valueChanImpl::getInstance` / `_interpolationChanImpl::
// getInstance`). None of the ctor's arithmetic contributes to the shipped
// motion output; the constructor is a wiring stub for the runtime rig-editor
// UI. Per PORTING_SPEC.md Rule 3 we do NOT invent a plausible port — the ctors
// throw citing their @0xADDR so the frontier stays visible.
//
// The ONE shipped-math method is `applyInterpolation(double)`, disassembled at
// /raw-port/re/disasm/OZRigSnapshot.applyInterpolation.s (40 lines). Its full
// decode is inline below.

import { kCMTimeZero } from "../infra/CMTime.js";
import { easeInOut } from "../infra/PCMath.js";
import type { OZChannelBase } from "./OZChannelBase.js";

// ── Frontier interface — the pieces of OZChannel/OZChannelEnum used here ─────
//
// OZChannel::getValueAsInt(CMTime const&, double) const — mangled
// `__ZNK9OZChannel13getValueAsIntERK6CMTimed`. Read as a tri-state int for the
// interpolation enum. Only this one method is used; the full OZChannel port is a
// separate frontier item (see raw-port/src/channels/OZChannel.ts).
//
// @provenance Ozone @0x574fbe (`callq _...getValueAsInt...` in
//             OZRigSnapshot::applyInterpolation).
export interface OZChannelWithGetValueAsInt {
  getValueAsInt(t: typeof kCMTimeZero, tolerance: number): number;
}

// ── Opaque frontier types — no fields exposed; every ctor is a throwing stub ──
//
// PORTING_SPEC Rule 3: undecoded control flow is a THROW citing its @0xADDR.
// The ctors below wire a PCString/OZChannelFolder/OZChannelEnum tree that we
// have not transcribed yet — they are the frontier, not this file's math.
export interface OZChannelFolderRef { readonly __ozChannelFolder: unique symbol }

/**
 * OZRigSnapshot — Ozone rig-editor snapshot record. See file-level comment for
 * the struct layout and the enumerated method table.
 */
export class OZRigSnapshot {
  /**
   * +0x008 : OZChannelFolder subobject. Not transcribed here — the C2 ctor at
   * @0x574ab0 wires it through `OZChannelFolder::OZChannelFolder(PCString const&,
   * OZChannelFolder*, uint, uint, uint)` @stub 0x6ddffe.
   */
  readonly folderBase: OZChannelBase | undefined;

  /**
   * +0x088 : OZChannel "value" subobject (downcast to OZChannelDouble via the
   * vtable stores @0x574d50 / @0x574d5e in the copy-ctor).
   */
  readonly valueChan: OZChannelWithGetValueAsInt | undefined;

  /**
   * +0x120 : OZChannelEnum "interpolation" subobject. The mode-selector for
   * `applyInterpolation`.
   */
  readonly interpolationChan: OZChannelWithGetValueAsInt;

  /**
   * OZRigSnapshot::OZRigSnapshot(OZChannelFolder* parent, unsigned int flags)
   *
   * C2 @Ozone 0x574ab0 (base ctor), C1 @Ozone 0x574cf0 (tail-jumps to C2).
   *
   * The body from otool -tV -arch x86_64 (label present for C2 body):
   *   0x574aca  vptr <- (rip+0x30ad37)                              // __ZTV13OZRigSnapshot+0x10
   *   0x574af6  PCString::PCString(&valueName, _theApp[+0x48], NULL) // localized "value"
   *   0x574b11  OZChannelFolder::OZChannelFolder(this+0x8,           // folderBase
   *                                              valueName,
   *                                              parent, flags, 0, 0)
   *   0x574b1d  PCString::~PCString(valueName)
   *   0x574b3d  PCString::PCString(&interpName, _theApp[+0x48], NULL) // localized "interp"
   *   0x574b56  std::__call_once(...OZRigSnapshot_valueChanImpl::getInstance...)
   *   0x574b71-0x574bde  (build OZChannelDouble at this+0x88 via the once-guarded impl)
   *   0x574c0c  std::__call_once(...OZRigSnapshot_interpolationChanImpl::getInstance...)
   *   0x574c4d  OZChannelEnum::OZChannelEnum(this+0x120, id=1, interpName,
   *                                          this+0x8 [folderBase], NULL, defaultVal, 2,
   *                                          _OZRigSnapshot_interpolationChan, &info)
   *   0x574c56  PCString::~PCString(interpName)
   *   0x574c5f  PCString::~PCString(valueName)  // (mislabeled -0x30 slot)
   *
   * The wiring is 100% Objective-C++/PCString/OZChannelFolder/OZChannelEnum
   * plumbing; no numeric constants of the shipped motion math are set here.
   * Rule 3: THROW citing @0xADDR — do not fabricate a plausible port.
   *
   * @provenance Ozone @0x574ab0 (C2) / @0x574cf0 (C1).
   */
  constructor(_parent: OZChannelFolderRef, _flags: number) {
    // The `interpolationChan` field is only touched by `applyInterpolation`,
    // which will read `getValueAsInt(kCMTimeZero, 0.0)` from it. Any caller
    // that reaches applyInterpolation without a decoded ctor will fail via the
    // thrown ctor below — which is the correct behaviour under Rule 3.
    void _parent; void _flags;
    // eslint-disable-next-line no-throw-literal
    throw new Error(
      "OZRigSnapshot::OZRigSnapshot(OZChannelFolder*, unsigned int) @Ozone 0x574ab0 not yet transcribed " +
        "(frontier callees: PCString, OZChannelFolder ctor @stub 0x6ddffe, OZChannelEnum ctor @stub 0x6dd9b0, " +
        "OZRigSnapshot_valueChanImpl::getInstance, OZRigSnapshot_interpolationChanImpl::getInstance)",
    );
    // Unreachable — but placed so the class fields are structurally satisfied
    // for TypeScript if the throw is ever removed and the ctor is properly
    // transcribed.
    // this.folderBase = undefined;
    // this.valueChan = undefined;
    // this.interpolationChan = ...;
  }

  /**
   * OZRigSnapshot::applyInterpolation(double t) — the shipped rig-snapshot
   * interpolation dispatcher.
   *
   * Faithful transcription of raw-port/re/disasm/OZRigSnapshot.applyInterpolation.s
   * (40 lines) — every branch, every constant cited.
   *
   * Control flow, line by line:
   *
   *   ; 0x574fa0  push %rbp; mov %rsp,%rbp; sub $0x10,%rsp
   *   ; 0x574fa8  movsd %xmm0, -0x8(%rbp)          ; spill `t` (double arg 0)
   *   ; 0x574fad  addq $0x120, %rdi                ; %rdi = this + 0x120 (interpolationChan)
   *   ; 0x574fb4  movq _kCMTimeZero(%rip), %rsi    ; time argument
   *   ; 0x574fbb  xorps %xmm0, %xmm0               ; tolerance = 0.0
   *   ; 0x574fbe  callq __ZNK9OZChannel13getValueAsIntERK6CMTimed
   *   ;                                            ; eax <- mode (tri-state int)
   *   ; 0x574fc3  xorps %xmm0, %xmm0               ; pre-load result = 0.0
   *   ; 0x574fc6  testl %eax, %eax
   *   ; 0x574fc8  je 0x574fff                      ; mode == 0 → return 0.0
   *   ; 0x574fca  cmpl $0x2, %eax
   *   ; 0x574fcd  je 0x575005                      ; mode == 2 → easeInOut branch
   *   ; 0x574fcf  cmpl $0x1, %eax
   *   ; 0x574fd2  je 0x574ffa                      ; mode == 1 → return t
   *   ; 0x574fd4  leaq "File %s, line %d..." (%rip), %rdi   ; else: assertion
   *   ; 0x574fdb  leaq "...OZRigSnapshot.cpp"    (%rip), %rsi
   *   ; 0x574fe2  leaq ""                        (%rip), %rcx
   *   ; 0x574fe9  movl $0x40, %edx                 ; line 64
   *   ; 0x574fee  xorl %eax, %eax
   *   ; 0x574ff0  callq _PCPrint
   *   ; 0x574ff5  callq _pcAbortImpl               ; NORETURN (abort)
   *   ;
   *   ; 0x574ffa  movsd -0x8(%rbp), %xmm0          ; return t (mode 1)
   *   ; 0x574fff  addq $0x10,%rsp; pop %rbp; retq
   *   ;
   *   ; 0x575005  movsd (rip+0x191e9b), %xmm1       ; 0x706ea8 = 0.5   (accelIn/accelOut base)
   *   ; 0x57500d  movsd (rip+0x1903cb), %xmm4       ; 0x7053e0 = 1.0   (t1)
   *   ; 0x575015  leaq  -0x10(%rbp), %rdi           ; &outValue
   *   ; 0x575019  xorps %xmm3, %xmm3                ; t0 = 0.0
   *   ; 0x57501c  movsd -0x8(%rbp), %xmm0           ; t
   *   ; 0x575021  movaps %xmm1, %xmm2               ; xmm2 = 0.5 → passed as accelOut
   *   ; 0x575024  xorl  %esi, %esi                  ; &outSpeed = NULL (unused)
   *   ; 0x575026  callq __ZN6PCMath9easeInOutEdddddPdS0_
   *   ;          i.e. PCMath::easeInOut(t=xmm0, accelIn=xmm1=0.5, accelOut=xmm2=0.5,
   *   ;                                 t0=xmm3=0.0, t1=xmm4=1.0, &out=rdi, &speed=NULL)
   *   ; 0x57502b  movsd -0x10(%rbp), %xmm0          ; return out
   *   ; 0x575030  addq $0x10,%rsp; pop %rbp; retq
   *
   * CONSTANTS (thin-x86_64 slice, VA==file-offset; resolved via
   * `raw-port/army/tools/resolve.py Ozone const 0x...`):
   *   @0x706ea8 = 0.5   (u64 0x3fe0000000000000) — passed as `accelIn` AND `accelOut`
   *   @0x7053e0 = 1.0   (u64 0x3ff0000000000000) — passed as `t1`
   *
   * Micro-check (assertable at review time from the disasm alone):
   *   applyInterpolation on mode==2 with t = 0.25 must equal
   *   `PCMath.easeInOut(0.25, 0.5, 0.5, 0.0, 1.0).out`. That in turn is
   *   already oracle-gated (curve.interp.ease) at G4, so if PCMath.easeInOut
   *   is byte-exact vs Apple's `__ZN6PCMath9easeInOutEdddddPdS0_`, this
   *   composition is byte-exact vs Apple's __ZN13OZRigSnapshot18applyInterpolationEd
   *   for mode==2 (a linear composition of a bit-exact primitive).
   *
   * @provenance Ozone @0x574fa0
   *             (`__ZN13OZRigSnapshot18applyInterpolationEd`).
   */
  applyInterpolation(t: number): number {
    // 0x574fad-0x574fbe : mode <- interpolationChan.getValueAsInt(kCMTimeZero, 0.0)
    const mode = this.interpolationChan.getValueAsInt(kCMTimeZero, 0);
    // 0x574fc6-0x574fc8 : mode == 0 → return 0.0
    if (mode === 0) return 0;
    // 0x574fca-0x574fcd : mode == 2 → easeInOut(t, 0.5, 0.5, 0.0, 1.0).out
    if (mode === 2) {
      // Constants cited from the thin x86_64 slice: 0x706ea8 = 0.5, 0x7053e0 = 1.0.
      return easeInOut(t, 0.5, 0.5, 0, 1).out;
    }
    // 0x574fcf-0x574fd2 : mode == 1 → return t (raw)
    if (mode === 1) return t;
    // 0x574fd4-0x574ff5 : else → PCPrint(...) + pcAbortImpl (NORETURN)
    // Assertion source (as embedded in the binary): file
    // "/Library/Caches/com.apple.xbs/Sources/MotionSharedCode/Motion-45000.0.157/Ozone/CompositorObject/OZRigSnapshot.cpp",
    // line 64. We mirror the abort as a hard throw — matching a NORETURN.
    throw new Error(
      "OZRigSnapshot::applyInterpolation: unreachable mode " + mode +
        " (Ozone @0x574fa0 assertion at OZRigSnapshot.cpp:64 — mode from interpolationChan " +
        "must be 0, 1, or 2)",
    );
  }

  /**
   * OZRigSnapshot::OZRigSnapshot(OZRigSnapshot const& other, OZChannelFolder* newParent)
   *
   * C2 @Ozone 0x574d00 (base copy-ctor), C1 @Ozone 0x574dc0 (tail-jumps to C2).
   *
   * Body from otool -tV:
   *   0x574d11  vptr <- (rip+0x30aaf0)                              // __ZTV13OZRigSnapshot+0x10
   *   0x574d26  OZChannelFolder::OZChannelFolder(this+0x8,
   *                                              other+0x8,
   *                                              newParent)          // C2 copy ctor
   *   0x574d40  OZChannel::OZChannel(this+0x88, other+0x88, this+0x8) // C2 copy ctor
   *   0x574d50  *(this+0x88) = __ZTV15OZChannelDouble+0x10           ; downcast
   *   0x574d5e  *(this+0x98) = __ZTV15OZChannelDouble+0x380
   *   0x574d7d  OZChannelEnum::OZChannelEnum(this+0x120,
   *                                          other+0x120,
   *                                          this+0x8)               // C2 copy ctor
   *
   * @provenance Ozone @0x574d00 (C2) / @0x574dc0 (C1).
   */
  static copy(_other: OZRigSnapshot, _newParent: OZChannelFolderRef): OZRigSnapshot {
    void _other; void _newParent;
    throw new Error(
      "OZRigSnapshot::OZRigSnapshot(OZRigSnapshot const&, OZChannelFolder*) @Ozone 0x574d00 not yet " +
        "transcribed (frontier callees: OZChannelFolder copy ctor @stub 0x6de004, OZChannel copy ctor " +
        "@stub 0x6df47a, OZChannelEnum copy ctor @stub 0x6dd9aa; vtable __ZTV15OZChannelDouble installed " +
        "at +0x88/+0x98)",
    );
  }

  /**
   * OZRigSnapshot::~OZRigSnapshot() — three variants (D2 base, D1 complete, D0
   * deleting). All three iterate the same sub-objects in reverse construction
   * order:
   *   ~OZChannelEnum   (@this+0x120)
   *   ~OZChannel       (@this+0x88)
   *   ~OZChannelFolder (@this+0x8)
   * (D0 additionally calls ::operator delete on `this`.)
   *
   * Not transcribed — memory-management plumbing, no shipped motion math.
   *
   * @provenance Ozone @0x574e80 (D2) / @0x574ee0 (D1) / @0x574f40 (D0).
   */
  static destroy(_x: OZRigSnapshot, _kind: "D2" | "D1" | "D0"): void {
    void _x; void _kind;
    throw new Error(
      "OZRigSnapshot::~OZRigSnapshot() @Ozone 0x574e80 (D2) / 0x574ee0 (D1) / 0x574f40 (D0) not yet " +
        "transcribed (frontier: OZChannelEnum::~OZChannelEnum, OZChannel::~OZChannel, " +
        "OZChannelFolder::~OZChannelFolder — pure ABI teardown)",
    );
  }
}
