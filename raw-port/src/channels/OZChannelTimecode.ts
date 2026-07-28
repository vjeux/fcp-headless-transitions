// OZChannelTimecode.ts — ProChannel OZChannelTimecode: concrete OZChannel
// subclass for a "timecode" (Timecode-formatted uint32) animation channel.
// A multiple-inheritance class carrying two vtable slots (primary at +0x00,
// secondary at +0x10 — Itanium ABI thunk table for OZChannel's second
// base sub-object).
//
// FAITHFUL transcription of the x86_64 disassembly of
// /Applications/Final Cut Pro.app/Contents/Frameworks/ProChannel.framework/Versions/A/ProChannel.
//
// Source disassembly files (all under raw-port/re/disasm/):
//   ProChannel.OZChannelTimecode.OZChannelTimecode.s        (ctor       @0x1140a)
//   ProChannel.OZChannelTimecode.~OZChannelTimecode.s       (D0 dtor    @0x1d4b0)
//   ProChannel.OZChannelTimecode.clone.s                    (clone      @0x1d4cc)
//   ProChannel.OZChannelTimecode.getObjCWrapperName.s       (           @0x1cd14)
//   ProChannel.OZChannelTimecode.createOZChannelTimecodeImpl.s (          @0x11504)
//   ProChannel.OZChannelTimecode.createOZChannelTimecodeInfo.s (          @0x114ba)
//
// Symbols transcribed here:
//   __ZN17OZChannelTimecodeC2EP9OZFactoryRK8PCStringjP13OZChannelImplP13OZChannelInfo
//                                                     @0x1140a  (C2 == C1 body)
//   __ZN17OZChannelTimecodeD0Ev                       @0x1d4b0  (D0 deleting)
//   __ZN17OZChannelTimecodeD1Ev                       (D1 in-place; same body minus operator delete tail)
//   __ZNK17OZChannelTimecode5cloneEv                  @0x1d4cc
//   __ZN17OZChannelTimecode18getObjCWrapperNameEv     @0x1cd14
//   __ZN17OZChannelTimecode27createOZChannelTimecodeImplEv @0x11504
//   __ZN17OZChannelTimecode27createOZChannelTimecodeInfoEv @0x114ba
//
// Vtable installed at (this+0x00) := __ZTV17OZChannelTimecode + 0x10 (VA 0xd41f0).
// Vtable installed at (this+0x10) := __ZTV17OZChannelTimecode + 0x370 (VA 0xd4550).
// Both installs performed by ctor (@0x11441/0x1144a) and by clone (@0x1d4f7/0x1d501).
// Full slot map via `raw-port/army/tools/vtable.py ProChannel OZChannelTimecode`
// (33+ slots — most inherit from OZChannelBase / OZChannel / OZFactoryBase;
// OZChannelTimecode overrides: 0x00 D1 @0x1d4a6, 0x08 D0 @0x1d4b0,
// 0x58 getObjCWrapperName @0x1cd14, 0xf8 clone @0x1d4cc).
//
// LAYOUT (mirrored from ctor writes @0x11431..0x11497 — same base layout
// as any OZChannel<T> subclass, see OZChannel.ts for the full 0x70/0x78/
// 0x80/0x88 impl/info block explanation):
//   +0x00  vtable primary   (installed = 0xd41f0)
//   +0x10  vtable secondary (installed = 0xd4550)  -- multiple-inheritance thunk table
//   ...OZChannel base sub-object fields (implPrimary/implSecondary/infoPrimary/infoSecondary/auxRef)...
//   +0x70  implPrimary                  (ctor: copied from +0x78 unconditionally @0x11497)
//   +0x78  implSecondary                (ctor: base ctor set this from arg r14=impl;
//                                        overwritten here @0x11493 with singleton if impl==null)
//   +0x80  infoPrimary                  (ctor: copied from +0x88 unconditionally @0x11472)
//   +0x88  infoSecondary                (ctor: base ctor set this from arg r15=info;
//                                        overwritten here @0x1146b with singleton if info==null)
//
// Sizeof(OZChannelTimecode) = 0x98 (from clone's `movl $0x98, %edi` @0x1d4d6 fed to
// operator new).
//
// The two file-static singleton refs (both C++ Meyers-singletons guarded by
// std::call_once) are:
//   __ZN17OZChannelTimecode22_OZChannelTimecodeInfoE  — static OZChannelInfo*
//   __ZN17OZChannelTimecode22_OZChannelTimecodeImplE  — static OZChannelImpl*
// The ctor calls createOZChannelTimecodeInfo() (@0x1146a...ish) / createOZChannelTimecodeImpl()
// which use std::__1::__call_once (@0xacdc8 stub) with a lambda proxy to lazy-init the
// singleton; the ctor then reads the singleton and writes it into +0x88/+0x78 iff the
// caller-supplied info/impl argument was null.
//
// FRONTIER — the OZChannel base ctor is already ported (see raw-port/src/channels/OZChannel.ts
// OZChannel__C2_base). The Info/Impl singleton lambdas themselves (nested
// __ZZN17OZChannelTimecode27createOZChannelTimecodeInfoEvEUlvE_ ~ the lambda operator())
// are un-decoded — they call into HGColorConform-like init code that constructs the
// TimecodeInfo (probably OZChannelInfo::OZChannelInfo(min,max,default,step,increment,name)
// with timecode-specific values). Modelled as throwing stubs below.
//
// The `getObjCWrapperName` @0x1cd14 loads a CFString pointer at RIP-relative 0xc8171
// (next-IP 0x1cd1f + 0xc8171 = 0xe4e90) which otool cannot decode ("bad cfstring ref").
// Result is a Foundation NSString* handed to Objective-C runtime. It is transcribed as
// a throw-stub with the addr; the actual name string requires walking the __DATA,__cfstring
// section header to recover the literal, which we don't do here.

import { OZChannel, OZChannel__C2_base, type OZChannelImpl, type OZFactory } from "./OZChannel";
import type { OZChannelInfo } from "./OZChannelInfo";
import type { OZChannelFolder } from "./OZChannelFolder";
import type { PCString } from "../infra/PCString";

// ---------------------------------------------------------------------------
// Frontier stubs for un-decoded callees.
// ---------------------------------------------------------------------------

/**
 * `OZChannelTimecode::createOZChannelTimecodeInfo()` — ProChannel @0x114ba.
 * A std::call_once-guarded lazy init of the file-static
 * __ZN17OZChannelTimecode22_OZChannelTimecodeInfoE OZChannelInfo* singleton.
 * The nested lambda operator() (mangled __ZZN17OZChannelTimecode27createOZChannelTimecodeInfoEvEUlvE_)
 * is NOT decoded here — it constructs an OZChannelInfo with timecode-specific
 * range/step/name constants. When the lambda decodes, this stub becomes a
 * one-shot lazy init returning the singleton pointer.
 */
export function createOZChannelTimecodeInfo(): OZChannelInfo | null {
  throw new Error(
    "OZChannelTimecode::createOZChannelTimecodeInfo @ProChannel 0x114ba not yet transcribed: " +
    "std::call_once (@0xacdc8 stub) with lambda proxy " +
    "__ZNSt3__117__call_once_proxyB9nqe210106... @0x11532 running " +
    "__ZZN17OZChannelTimecode27createOZChannelTimecodeInfoEvEUlvE_ (nested lambda operator()) " +
    "to lazy-init __ZN17OZChannelTimecode22_OZChannelTimecodeInfoE. Lambda body is undecoded."
  );
}

/**
 * `OZChannelTimecode::createOZChannelTimecodeImpl()` — ProChannel @0x11504.
 * Analogous std::call_once-guarded lazy init for the OZChannelImpl* singleton.
 */
export function createOZChannelTimecodeImpl(): OZChannelImpl | null {
  throw new Error(
    "OZChannelTimecode::createOZChannelTimecodeImpl @ProChannel 0x11504 not yet transcribed: " +
    "std::call_once (@0xacdc8 stub) with lambda proxy " +
    "__ZNSt3__117__call_once_proxyB9nqe210106... @0x11539 running " +
    "__ZZN17OZChannelTimecode27createOZChannelTimecodeImplEvEUlvE_ (nested lambda operator()) " +
    "to lazy-init __ZN17OZChannelTimecode22_OZChannelTimecodeImplE. Lambda body is undecoded."
  );
}

/**
 * OZChannelTimecode's file-static singletons. The ctor and the two
 * create...() helpers read these through the leaq/movq pattern:
 *   leaq __ZN17OZChannelTimecode22_OZChannelTimecodeInfoE(%rip), %rax   @0x11461
 *   movq (%rax), %rax                                                     @0x11468
 * i.e. the symbol IS the address of a pointer variable; the ctor loads
 * that pointer. Kept as null here; when the lambda lands, populate.
 */
let _OZChannelTimecodeInfoSingleton: OZChannelInfo | null = null;
let _OZChannelTimecodeImplSingleton: OZChannelImpl | null = null;

// ---------------------------------------------------------------------------
// OZChannelTimecode
// ---------------------------------------------------------------------------

/**
 * `OZChannelTimecode` — subclass of OZChannel.
 *
 * The class body carries the ABI-observable fields; the actual initialization
 * runs through the `OZChannelTimecode__C2` free function below (matches the
 * pattern used by other landed OZChannel* subclasses — the JS `new` builds
 * the raw slot table, and `__C2` does the transcribed field writes).
 */
export class OZChannelTimecode extends OZChannel {
  // Static references to the file-static singletons — allowed to be null
  // pre-init (matches C++'s uninitialised state at process start).
  static _OZChannelTimecodeInfo: OZChannelInfo | null = null;
  static _OZChannelTimecodeImpl: OZChannelImpl | null = null;

  /**
   * `OZChannelTimecode::~OZChannelTimecode()` — ProChannel @0x1d4b0 (D0 deleting;
   * D1 in-place is @0x1d4a6, same body minus the operator delete tail).
   *
   *   @0x1d4b9  callq __ZN9OZChannelD2Ev              ; OZChannel::~OZChannel(this)
   *   @0x1d4c7  jmp   __ZdlPv                         ; (D0 only) ::operator delete(this)
   *
   * OZChannelTimecode adds NO owned resources beyond the base — the impl/info
   * singletons are process-shared and NOT released here. Faithful transcription
   * = do nothing beyond what OZChannel::~OZChannel does. Since JS GC handles
   * raw memory, and the base dtor's semantics haven't been ported yet either,
   * we leave this a no-op destroy() method (matches how HGYUVPlanarTo444.ts /
   * HGYUVPlanarToRGBA.ts model dtors).
   */
  destroy(): void {
    // OZChannel::~OZChannel — the base dtor is un-ported; JS GC covers.
    // No OZChannelTimecode-owned fields to release beyond that.
  }

  /**
   * `OZChannelTimecode::getObjCWrapperName()` — ProChannel @0x1cd14.
   *
   *   @0x1cd18  leaq  0xc8171(%rip), %rax             ; = 0xe4e90 (CFString pointer;
   *                                                     otool prints "bad cfstring ref"
   *                                                     — the __cfstring struct lives here
   *                                                     and its .isa/length/bytes fields
   *                                                     would need to be walked to recover
   *                                                     the literal.)
   *   @0x1cd20  retq
   *
   * Returns a `Foundation NSString*` pointing at a static __cfstring literal.
   * The exact string bytes require reading `__DATA,__cfstring` @0xe4e90 —
   * not yet decoded here. Throw-stubbed with the addr.
   */
  getObjCWrapperName(): string {
    throw new Error(
      "OZChannelTimecode::getObjCWrapperName @ProChannel 0x1cd14 not yet transcribed " +
      "(returns static __cfstring @0xe4e90 loaded via `leaq 0xc8171(%rip), %rax`; " +
      "otool: 'bad cfstring ref' — string literal requires __DATA,__cfstring walk)"
    );
  }

  /**
   * `OZChannelTimecode::clone() const` — ProChannel @0x1d4cc.
   *
   *   @0x1d4d6  movl  $0x98, %edi                   ; sizeof(OZChannelTimecode) = 0x98
   *   @0x1d4db  callq __Znwm                        ; new (0x98)
   *   @0x1d4e6  movq  %r14, %rsi                    ; rsi = this (source)
   *   @0x1d4e9  xorl  %edx, %edx                    ; rdx = folder = NULL
   *   @0x1d4eb  callq __ZN9OZChannelC2ERKS_P15OZChannelFolder ; OZChannel::OZChannel(other, NULL)
   *   @0x1d4f0  leaq  0xb6cf9(%rip), %rax           ; = 0xd41f0 (OZChannelTimecode vt+0x10)
   *   @0x1d4f7  movq  %rax, (%rbx)                  ; install primary vtable
   *   @0x1d4fa  leaq  0xb704f(%rip), %rax           ; = 0xd4550 (OZChannelTimecode vt+0x370)
   *   @0x1d501  movq  %rax, 0x10(%rbx)              ; install secondary vtable
   *   @0x1d505  movq  %rbx, %rax                    ; return clone
   *   @0x1d50c  retq
   *
   * Note that clone() delegates to OZChannel's copy ctor (which deep-clones
   * impl/info and vcall's aux — see OZChannel__C2_copy in OZChannel.ts) and
   * then re-installs the OZChannelTimecode-specific vtable pointers. The
   * OZChannel::OZChannel(const&, NULL) call is IN raw-port/src/channels/OZChannel.ts
   * as OZChannel__C2_copy — we delegate to it here.
   */
  clone(): OZChannelTimecode {
    // Faithful mirror: build a fresh OZChannelTimecode instance, run the
    // OZChannel base copy ctor via the ported helper, then install the two
    // subclass-specific vtable pointers.
    const dst = new OZChannelTimecode();
    // OZChannel__C2_copy exists in OZChannel.ts. It expects (self, other, folder).
    // We import it lazily to avoid a cycle-risk at module init.
    // The 0x1d4eb callq runs the copy ctor with folder=NULL.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const OZChannelMod = require("./OZChannel") as { OZChannel__C2_copy?: (self: unknown, other: unknown, folder: OZChannelFolder | null) => void };
    if (OZChannelMod.OZChannel__C2_copy) {
      OZChannelMod.OZChannel__C2_copy(dst, this, null);
    }
    // @0x1d4f0..0x1d501: install both vtable pointers.
    (dst as unknown as { ozChannelVtablePrimary?: number }).ozChannelVtablePrimary = 0xd41f0;
    (dst as unknown as { ozChannelVtableSecondary?: number }).ozChannelVtableSecondary = 0xd4550;
    return dst;
  }
}

/**
 * `OZChannelTimecode::OZChannelTimecode(OZFactory*, PCString const&, unsigned int,
 *                                       OZChannelImpl*, OZChannelInfo*)` — ProChannel @0x1140a.
 *
 * Faithful ctor body (byte-for-byte, otool-tV):
 *   @0x11417  movq  %r9, %r15                     ; r15 = arg5 = info
 *   @0x1141a  movq  %r8, %r14                     ; r14 = arg4 = impl
 *   @0x1141d  movl  %ecx, %r8d                    ; r8d(new) = arg3 = flags1 (u32)
 *   @0x11420  movq  %rdi, %rbx                    ; rbx = this
 *   @0x11423  movq  %r9, 0x8(%rsp)                ; stash info on stack (SysV ABI: arg7 of base ctor)
 *   @0x11428  movq  %r14, (%rsp)                  ; stash impl on stack (arg6 of base ctor)
 *   @0x1142c  xorl  %ecx, %ecx                    ; ecx = arg3 of base = folder = NULL
 *   @0x1142e  xorl  %r9d, %r9d                    ; r9d = arg5 of base = flags2 = 0
 *   @0x11431  callq __ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
 *                                                 ; OZChannel::OZChannel(fact, name, NULL, flags1, 0, impl, info)
 *   @0x11441  movq  %rcx, (%rbx)                  ; install vtable primary = 0xd41f0 (leaq @0x11436+leaq @0x1143d)
 *   @0x1144a  movq  %rax, 0x10(%rbx)              ; install vtable secondary = 0xd4550 (leaq @0x11436 + $0x370)
 *   @0x1144e  callq __ZN17OZChannelTimecode27createOZChannelTimecodeInfoEv
 *                                                 ; ensure singleton exists (lazy init via call_once)
 *   @0x11453  testq %r15, %r15                    ; if info arg != NULL:
 *   @0x11458    movq 0x88(%rbx), %rax             ;   rax = this->infoSecondary  (base ctor set this from arg r15)
 *   @0x1145f    jmp 0x11472
 *              else:
 *   @0x11461    leaq __ZN17OZChannelTimecode22_OZChannelTimecodeInfoE(%rip), %rax
 *   @0x11468    movq (%rax), %rax                 ;   rax = *singletonInfoPtr (the OZChannelInfo* singleton)
 *   @0x1146b    movq %rax, 0x88(%rbx)             ;   this->infoSecondary = singleton
 *   @0x11472  movq  %rax, 0x80(%rbx)              ; this->infoPrimary = (arg's infoSecondary | singleton)
 *   @0x11479  callq __ZN17OZChannelTimecode27createOZChannelTimecodeImplEv
 *   @0x1147e  testq %r14, %r14                    ; if impl arg != NULL:
 *   @0x11483    movq 0x78(%rbx), %rax             ;   rax = this->implSecondary
 *   @0x11487    jmp 0x11497
 *              else:
 *   @0x11489    leaq __ZN17OZChannelTimecode22_OZChannelTimecodeImplE(%rip), %rax
 *   @0x11490    movq (%rax), %rax
 *   @0x11493    movq %rax, 0x78(%rbx)             ;   this->implSecondary = impl singleton
 *   @0x11497  movq  %rax, 0x70(%rbx)              ; this->implPrimary = (arg's implSecondary | singleton)
 *
 * The unwind cleanup landing pad @0x114a6..0x114b4 runs OZChannel::~OZChannel
 * on partial construction failure and re-throws.
 *
 * This is an EXPORTED free function (naming matches the convention used by
 * other landed OZChannel* subclass ctors — OZChannel__C2_base +
 * OZChannelXxxx__ctor helpers). The class body is separate (see class above).
 */
export function OZChannelTimecode__C2(
  self: OZChannelTimecode,
  factory: OZFactory | null,
  name: PCString | string,
  flags1: number,
  impl: OZChannelImpl | null,
  info: OZChannelInfo | null,
): void {
  // @0x11431 base-ctor delegation: OZChannel::OZChannel(fact, name, NULL, flags1, 0, impl, info)
  // — routed through the ported OZChannel__C2_base helper (folder=NULL, flags2=0).
  OZChannel__C2_base(
    self as unknown as Parameters<typeof OZChannel__C2_base>[0],
    factory,
    name,
    null,          // @0x1142c xorl %ecx, %ecx  -> folder = NULL
    flags1,
    0,             // @0x1142e xorl %r9d, %r9d -> flags2 = 0
    impl,
    info,
  );
  // @0x11441/@0x1144a: install both vtable pointers. Overwrites what
  // OZChannel__C2_base wrote (base installs 0xd0f08/0xd1268; subclass
  // overrides to 0xd41f0/0xd4550).
  (self as unknown as { ozChannelVtablePrimary?: number }).ozChannelVtablePrimary = 0xd41f0;
  (self as unknown as { ozChannelVtableSecondary?: number }).ozChannelVtableSecondary = 0xd4550;
  // @0x1144e: ensure info singleton is initialised.
  try {
    createOZChannelTimecodeInfo();
  } catch {
    // Lambda un-decoded — silently swallow to keep decoded field-write path
    // observable. When the lambda lands, this try/catch is removed. Tracked
    // by the createOZChannelTimecodeInfo throw-stub above with its addr.
  }
  // @0x11453..@0x11472: infoPrimary/infoSecondary swap in singleton if arg was null.
  const anySelf = self as unknown as { infoPrimary?: OZChannelInfo | null; infoSecondary?: OZChannelInfo | null };
  if (info != null) {
    // base ctor set both slots to `info`; the ctor then just copies +0x88 -> +0x80 unchanged.
    const kept = anySelf.infoSecondary ?? null;
    anySelf.infoPrimary = kept;
  } else {
    const singleton = _OZChannelTimecodeInfoSingleton;
    anySelf.infoSecondary = singleton;
    anySelf.infoPrimary = singleton;
  }
  // @0x11479: ensure impl singleton is initialised.
  try {
    createOZChannelTimecodeImpl();
  } catch {
    // Same lambda-not-yet-transcribed pattern; see createOZChannelTimecodeImpl above.
  }
  // @0x1147e..@0x11497: implPrimary/implSecondary swap in singleton if arg was null.
  const anySelfImpl = self as unknown as { implPrimary?: OZChannelImpl | null; implSecondary?: OZChannelImpl | null };
  if (impl != null) {
    const kept = anySelfImpl.implSecondary ?? null;
    anySelfImpl.implPrimary = kept;
  } else {
    const singleton = _OZChannelTimecodeImplSingleton;
    anySelfImpl.implSecondary = singleton;
    anySelfImpl.implPrimary = singleton;
  }
}

/**
 * Second ctor overload:
 *   OZChannelTimecode::OZChannelTimecode(PCString const&, OZChannelFolder*, unsigned int,
 *                                        unsigned int, OZChannelImpl*, OZChannelInfo*)
 *   @ProChannel — mangled __ZN17OZChannelTimecodeC2ERK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
 *
 * Not yet disassembled in this pass (mangled name matches the pattern
 * of every other OZChannel<T> subclass's folder-scoped ctor, which
 * uniformly delegates to OZChannel__C2_base with `folder != NULL`). Kept
 * as a throw-stub referencing the mangled name so `frontier.py` picks it up.
 */
export function OZChannelTimecode__C2_folder(
  _self: OZChannelTimecode,
  _name: PCString | string,
  _folder: OZChannelFolder | null,
  _flags1: number,
  _flags2: number,
  _impl: OZChannelImpl | null,
  _info: OZChannelInfo | null,
): void {
  throw new Error(
    "OZChannelTimecode::OZChannelTimecode(PCString const&, OZChannelFolder*, unsigned int, " +
    "unsigned int, OZChannelImpl*, OZChannelInfo*) @ProChannel (mangled " +
    "__ZN17OZChannelTimecodeC2ERK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo) " +
    "not yet transcribed in this pass — mirrors the pattern of the other landed " +
    "OZChannel<T> subclass folder-scoped ctors."
  );
}

// Suppress "unused variable" for the two module-scoped singletons —
// they're the JS mirror of the file-static ProChannel symbols
// __ZN17OZChannelTimecode22_OZChannelTimecodeInfoE and *_ImplE. Referenced
// via the C2 body above; kept mutable so the future lambda-decode can
// populate them at first-touch.
void _OZChannelTimecodeInfoSingleton;
void _OZChannelTimecodeImplSingleton;
