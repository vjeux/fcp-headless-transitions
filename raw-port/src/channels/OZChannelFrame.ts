// raw-port/src/channels/OZChannelFrame.ts
//
// FCP `OZChannelFrame` — an OZChannel<int32 frame-index> concrete subclass
// (ProChannel.framework). Represents an animatable channel whose scalar
// value is a video-frame index (used by every "Frame" channel binding —
// e.g. `<parameter type="frame">` XML tags and their in-memory Ozone
// counterparts). Structurally IDENTICAL to OZChannelDouble/OZChannelUint32
// / etc.: it plugs a distinguished pair of vtable slots into the OZChannel
// base and owns two once-guarded singletons — `_OZChannelFrameInfo` and
// `_OZChannelFrameImpl` — that back the info/impl slots when a caller
// doesn't pass them explicitly.
//
// FAITHFUL PORT. Every function cites its `@ProChannel 0xADDR` from
// /tmp/ProChannel_tV.txt + re/disasm/ProChannel.OZChannelFrame.*.s.
// Every constant / offset cites the address it was read from. Undecoded
// base callees throw citing their `@0xADDR` per Rule 3 / ANTI_SHORTCUT.
//
// Symbols (ProChannel framework, x86_64 slice; VAs unadjusted VM):
//   0x10cca  OZChannelFrame::createOZChannelFrameInfo()
//   0x10d14  OZChannelFrame::createOZChannelFrameImpl()
//   0x10c1a  OZChannelFrame::OZChannelFrame(OZFactory*, PCString const&,
//                                           unsigned int, OZChannelImpl*,
//                                           OZChannelInfo*)                 [C2]
//   0x97978  OZChannelFrame::OZChannelFrame(PCString const&,
//                                           OZChannelFolder*, unsigned int,
//                                           unsigned int, OZChannelImpl*,
//                                           OZChannelInfo*)                 [C2]
//   0x1ccfc  OZChannelFrame::getObjCWrapperName()
//   0x1d3fa  OZChannelFrame::~OZChannelFrame()                              [D1]
//   0x1d404  OZChannelFrame::~OZChannelFrame()                              [D0]
//   0x1d420  OZChannelFrame::clone() const                                  (const)
//
// STRUCT LAYOUT (recovered from the two ctors + clone; OZChannelFrame adds
// NO fields beyond OZChannel — like every leaf OZChannel<T> subclass, it
// only differs in its vtable pair and its once-guarded default singletons):
//
//   +0x000   primary vptr        ; ctors store `__ZTV14OZChannelFrame + 0x10`
//                                  @0x10c46-51 (C2-fact) / @0x979ca-d5 (C2-folder)
//                                  / @0x1d444-4b (clone).
//   +0x010   secondary vptr      ; ctors store `__ZTV14OZChannelFrame + 0x370`
//                                  @0x10c54-5a (C2-fact) / @0x979d8-de (C2-folder)
//                                  / @0x1d44e-55 (clone). The `+0x370` offset is
//                                  the DR-vtable slot for the secondary base
//                                  subobject installed by OZChannel::OZChannel.
//   +0x070   OZChannelImpl* implPrimary
//                                ; @0x10ca7 (C2-fact) / @0x97a2f (C2-folder)
//                                  `movq %rax, 0x70(%rbx)` — mirrors +0x78
//                                  after the once-init runs.
//   +0x078   OZChannelImpl* implSecondary
//                                ; OZChannel base ctor already wrote the
//                                  caller-supplied impl here; ctor mirrors
//                                  it or overwrites with singleton at
//                                  @0x10ca3 / @0x97a2b.
//   +0x080   OZChannelInfo* infoPrimary
//                                ; @0x10c82 / @0x97a08.
//   +0x088   OZChannelInfo* infoSecondary
//                                ; @0x10c7b / @0x97a01.
//
// The two `once`-guarded singletons this class owns:
//   _OZChannelFrameInfo  (data symbol @ProChannel U-extern
//                         __ZN14OZChannelFrame19_OZChannelFrameInfoE)
//     — populated by `createOZChannelFrameInfo()` under
//       `_OZChannelFrameInfo_once` (data symbol
//       __ZZN14OZChannelFrame24createOZChannelFrameInfoEvE24_OZChannelFrameInfo_once).
//   _OZChannelFrameImpl  (data symbol @ProChannel U-extern
//                         __ZN14OZChannelFrame19_OZChannelFrameImplE)
//     — populated by `createOZChannelFrameImpl()` under
//       `_OZChannelFrameImpl_once` (data symbol
//       __ZZN14OZChannelFrame24createOZChannelFrameImplEvE24_OZChannelFrameImpl_once).
// Both lambdas are only visible via std::once_proxy stubs in the framework
// (see __ZNSt3__117__call_once_proxyB9nqe210106... symbols) and are NOT
// yet decoded — the "install default singleton" paths therefore throw
// citing their @ProChannel addresses.
//
// getObjCWrapperName() @0x1ccfc — a 4-instruction body that loads a
// CFString pointer via `leaq 0xc8169(%rip),%rax`. `otool` decodes the
// target as an Objc cfstring ref with the literal placeholder text
// "bad cfstring ref" (the string that Apple's linker inserts when a
// cfstring reference cannot be resolved from the __cfstring section).
// This means: in the shipped Ozone slice this method's CFString target
// is unresolved (probably tree-shaken or defined in a companion binary).
// We surface it as a throwing stub citing the address rather than
// returning a bogus string.
//
// D1 @0x1d3fa is a pure tail-jmp into OZChannel::~OZChannel — no
// subclass-specific work. D0 @0x1d404 = D1 + `::operator delete(this)`.
// clone() @0x1d420 = ::operator new(0x98) + OZChannel::OZChannel(other,
// nullptr) copy-ctor + reinstall of BOTH vtable slots.
//
// FRONTIER (undecoded base + factory callees this file's ctors/clone JUMP into):
//   __Z29getOZChannelFrame_FactoryBasev            (external ProChannel)  — called
//     @0x9799c to get the OZFactory* the PCString/folder ctor delegates with.
//   __ZN9OZChannelC2EP9OZFactoryRK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
//     (transcribed at raw-port/src/channels/OZChannel.ts as
//     `OZChannel__C2_base`) — the OZChannel base ctor; called from both
//     ctors @0x10c41 / @0x979c5.
//   __ZN9OZChannelC2ERKS_P15OZChannelFolder      (external ProChannel; copy-ctor)
//     — called @0x1d43f from clone(). Not yet transcribed.
//   __ZN9OZChannelD2Ev                           (external ProChannel; base dtor)
//     — called @0x1d3ff (D1 tail), @0x1d40d (D0), and @0x10cbc (C2-fact
//       exception unwind).
//   __Znwm  (operator new)                       — @0x1d42f (clone).
//   __ZdlPv (operator delete)                    — @0x1d41b (D0), @0x1d467 (clone unwind).
//   __ZNSt3__111__call_onceERVmPvPFvS2_E         — @0x10cff (Info), @0x10d49 (Impl).
//   __Unwind_Resume                              — @0x10cc4 (C2-fact),
//                                                  @0x1d46f (clone).
//
// vtable + secondary vtable symbol `__ZTV14OZChannelFrame` is EXTERNAL —
// its offsets +0x10 and +0x370 are used the same way as every leaf
// OZChannel<T> subclass (see OZChannelDouble.ts / OZChannelUint32.ts).
//
// DECODE-DON'T-FIT: every field write, every vcall, every ctor delegation
// is transcribed byte-for-byte below.

import { OZChannel, OZChannel__C2_base } from "./OZChannel";
import type { OZChannelImpl, OZFactory } from "./OZChannel";
import type { OZChannelInfo } from "./OZChannelInfo";
import type { OZChannelFolder } from "./OZChannelFolder";

/* eslint-disable @typescript-eslint/no-unused-vars */

// ---------------------------------------------------------------------------------------------
// Local frontier stubs for external callees (Rule 3). See file-header FRONTIER
// list for the @ProChannel 0xADDR call-sites each stub is bound to.
// ---------------------------------------------------------------------------------------------

/** External free function `__Z29getOZChannelFrame_FactoryBasev` @ProChannel U-extern.
 *  Called @0x9799c by the PCString/folder ctor. NOT yet decoded. */
function getOZChannelFrame_FactoryBase(): OZFactory {
  throw new Error(
    "getOZChannelFrame_FactoryBase() @ProChannel U-extern " +
      "__Z29getOZChannelFrame_FactoryBasev (not yet transcribed) — " +
      "called by OZChannelFrame(PCString&, OZChannelFolder*, ...) ctor @ProChannel 0x9799c",
  );
}

/** External `__ZN9OZChannelC2ERKS_P15OZChannelFolder` — OZChannel COPY ctor.
 *  Called @0x1d43f by OZChannelFrame::clone() const. NOT yet decoded here
 *  (OZChannel.ts transcribes only the non-copy `__C2_base` ctor). */
function OZChannel_copy_ctor(
  _self: OZChannelFrame,
  _other: OZChannelFrame,
  _folder: OZChannelFolder | null,
): void {
  throw new Error(
    "OZChannel::OZChannel(OZChannel const&, OZChannelFolder*) @ProChannel U-extern " +
      "__ZN9OZChannelC2ERKS_P15OZChannelFolder (not yet transcribed) — " +
      "invoked by OZChannelFrame::clone() @ProChannel 0x1d43f",
  );
}

/** External `__ZN9OZChannelD2Ev` — OZChannel base dtor. Called from the D1
 *  tail (@0x1d3ff), from D0 (@0x1d40d), and from the C2-fact exception
 *  unwind path (@0x10cbc). NOT yet decoded. */
function OZChannel_D2(_self: OZChannelFrame): void {
  throw new Error(
    "OZChannel::~OZChannel() @ProChannel U-extern __ZN9OZChannelD2Ev " +
      "(not yet transcribed) — invoked by " +
      "OZChannelFrame::~OZChannelFrame [D1] @ProChannel 0x1d3ff, " +
      "[D0] @ProChannel 0x1d40d, and by the C2-fact exception unwind " +
      "@ProChannel 0x10cbc",
  );
}

/** External `__Znwm` (::operator new(size_t)). Called @0x1d42f from clone()
 *  with size 0x98 (152 bytes). NOT yet decoded here (allocator internals). */
function operator_new(_size: number): OZChannelFrame {
  throw new Error(
    "::operator new(unsigned long) @ProChannel stub 0xace4c (__Znwm) — " +
      "invoked by OZChannelFrame::clone() @ProChannel 0x1d42f with size 0x98",
  );
}

/** External `__ZdlPv` (::operator delete(void*)). Reached at @0x1d41b (D0
 *  tail) and @0x1d467 (clone unwind). GC subsumes in TS; throw stub for
 *  provenance. */
function operator_delete(_p: OZChannelFrame): void {
  throw new Error(
    "::operator delete(void*) @ProChannel stub 0xace04 (__ZdlPv) — " +
      "invoked by OZChannelFrame::~OZChannelFrame [D0] @ProChannel 0x1d41b " +
      "and by OZChannelFrame::clone() unwind @ProChannel 0x1d467",
  );
}

/** External `__ZNSt3__111__call_onceERVmPvPFvS2_E` — libc++ std::call_once.
 *  Called @0x10cff (Info) and @0x10d49 (Impl). We model it inline via a
 *  first-run guard on module-scope booleans below. */

/** The two lambdas registered under std::call_once. Both are visible only
 *  through the std::__1::__call_once_proxy demangled stubs in the framework
 *  — the actual lambda bodies are NOT decoded in this Ozone slice. */
function createOZChannelFrameInfo_default(): OZChannelInfo {
  throw new Error(
    "OZChannelFrame::createOZChannelFrameInfo()::'lambda'() @ProChannel — " +
      "bound via __ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN14OZChannelFrame24createOZChannelFrameInfoEvEUlvE_EEEEEvPv " +
      "and populates the __ZN14OZChannelFrame19_OZChannelFrameInfoE global. " +
      "Lambda body not yet decoded.",
  );
}
function createOZChannelFrameImpl_default(): OZChannelImpl {
  throw new Error(
    "OZChannelFrame::createOZChannelFrameImpl()::'lambda'() @ProChannel — " +
      "bound via __ZNSt3__117__call_once_proxyB9nqe210106INS_5tupleIJOZN14OZChannelFrame24createOZChannelFrameImplEvEUlvE_EEEEEvPv " +
      "and populates the __ZN14OZChannelFrame19_OZChannelFrameImplE global. " +
      "Lambda body not yet decoded.",
  );
}

// ---------------------------------------------------------------------------------------------
// Static singletons + once-guards (mirrors the two data symbols in the framework).
// Data symbols: __ZN14OZChannelFrame19_OZChannelFrameInfoE (a pointer slot;
// createOZChannelFrameInfo() @0x10cca returns `*(&_OZChannelFrameInfo)` after
// the call_once). Same shape for the Impl variant.
// ---------------------------------------------------------------------------------------------

/** @ProChannel data symbol `__ZN14OZChannelFrame19_OZChannelFrameInfoE`.
 *  Null until the first call to createOZChannelFrameInfo() runs the lambda. */
let _OZChannelFrameInfo: OZChannelInfo | null = null;
/** @ProChannel data symbol
 *  `__ZZN14OZChannelFrame24createOZChannelFrameInfoEvE24_OZChannelFrameInfo_once`.
 *  In C++ this is a `sizeof(size_t)` word initialized to 0; std::call_once
 *  atomically transitions it to (uintptr_t)-1 once the lambda has completed. */
let _OZChannelFrameInfo_once: -1 | 0 = 0;

/** Same pair for Impl (data symbols
 *  __ZN14OZChannelFrame19_OZChannelFrameImplE and
 *  __ZZN14OZChannelFrame24createOZChannelFrameImplEvE24_OZChannelFrameImpl_once). */
let _OZChannelFrameImpl: OZChannelImpl | null = null;
let _OZChannelFrameImpl_once: -1 | 0 = 0;

// ---------------------------------------------------------------------------------------------

/**
 * OZChannelFrame — see file header. Class body: two ctors, two once-guarded
 * singleton accessors, getObjCWrapperName, D1/D0 destructors, and clone.
 * OZChannelFrame adds NO fields beyond OZChannel; the class-body field list
 * mirrors OZChannelDouble's (also empty beyond the base). No `parseElement`
 * override — it inherits OZChannel's.
 */
export class OZChannelFrame extends OZChannel {
  /**
   * OZChannelFrame::createOZChannelFrameInfo() @ProChannel 0x10cca.
   *
   * Faithful transcription (see raw-port/re/disasm/
   * ProChannel.OZChannelFrame.createOZChannelFrameInfo.s):
   *   0x10cca  push rbp / mov rsp,rbp / sub $0x20,rsp
   *   0x10cd2  movq  _OZChannelFrameInfo_once(%rip), %rax
   *   0x10cd9  cmpq  $-0x1, %rax                     ; already initialized?
   *   0x10cdd  je    0x10d04                         ; -> load & return
   *   0x10cdf  leaq  -0x1(%rbp), %rax                ; build the tiny
   *   0x10ce3  leaq  -0x18(%rbp), %rcx               ; tuple<lambda&&> that
   *   0x10ce7  movq  %rax, (%rcx)                    ; the call_once_proxy
   *   0x10cea  leaq  -0x10(%rbp), %rsi               ; wraps around the
   *   0x10cee  movq  %rcx, (%rsi)                    ; lambda pointer.
   *   0x10cf1  leaq  _OZChannelFrameInfo_once(%rip), %rdi
   *   0x10cf8  leaq  __call_once_proxy<...>(%rip), %rdx
   *   0x10cff  callq __ZNSt3__111__call_onceERVmPvPFvS2_E   ; std::call_once
   *   0x10d04  leaq  _OZChannelFrameInfo(%rip), %rax        ; return *_ptr
   *   0x10d0b  movq  (%rax), %rax
   *   0x10d0e  add $0x20,rsp / pop rbp / retq
   *
   * We model the call_once via `_OZChannelFrameInfo_once`. The lambda body
   * is not decoded — the first call throws through
   * `createOZChannelFrameInfo_default`.
   */
  static createOZChannelFrameInfo(): OZChannelInfo {
    // @0x10cd2..0x10cdd  fast-path: once == -1
    if (_OZChannelFrameInfo_once !== -1) {
      // @0x10cff callq std::call_once — lambda populates _OZChannelFrameInfo,
      // then the once flag becomes -1. We call the lambda directly here;
      // Rule 3 makes it throw citing its @ProChannel address.
      _OZChannelFrameInfo = createOZChannelFrameInfo_default();
      _OZChannelFrameInfo_once = -1;
    }
    // @0x10d04..0x10d0b  return *_OZChannelFrameInfo (the data-symbol slot
    // in the framework holds a POINTER; the `movq (%rax), %rax` deref reads
    // that pointer's value — in TS we return the stored object).
    // Non-null after the lambda ran; the `!` is a mechanical decode of the
    // C++'s assumption that the initializer wrote the slot.
    return _OZChannelFrameInfo as OZChannelInfo;
  }

  /**
   * OZChannelFrame::createOZChannelFrameImpl() @ProChannel 0x10d14.
   *
   * Byte-for-byte the same shape as createOZChannelFrameInfo above, only
   * pointing at the Impl once-flag + data slot. See raw-port/re/disasm/
   * ProChannel.OZChannelFrame.createOZChannelFrameImpl.s.
   */
  static createOZChannelFrameImpl(): OZChannelImpl {
    // @0x10d1c..0x10d27
    if (_OZChannelFrameImpl_once !== -1) {
      // @0x10d49 callq std::call_once
      _OZChannelFrameImpl = createOZChannelFrameImpl_default();
      _OZChannelFrameImpl_once = -1;
    }
    // @0x10d4e..0x10d55
    return _OZChannelFrameImpl as OZChannelImpl;
  }

  /**
   * OZChannelFrame::getObjCWrapperName() @ProChannel 0x1ccfc.
   *
   * Faithful transcription (raw-port/re/disasm/
   * ProChannel.OZChannelFrame.getObjCWrapperName.s):
   *   0x1ccfc  push rbp / mov rsp,rbp
   *   0x1cd00  leaq  0xc8169(%rip), %rax   ; = Objc cfstring ref
   *                                           (otool label: "bad cfstring ref")
   *   0x1cd07  pop rbp / retq
   *
   * The `leaq` target lands in the __cfstring section but resolves to the
   * literal placeholder "bad cfstring ref" — the token Apple's linker
   * inserts when a cfstring pointer cannot be resolved from the __cfstring
   * section in this framework slice. That is NOT a legitimate return value
   * for the ObjC wrapper's class name; it means the real name is defined
   * in a linked-in companion binary and tree-shaken out of Ozone/ProChannel.
   * Rule 3: throw citing the address rather than returning the placeholder.
   */
  getObjCWrapperName(): string {
    throw new Error(
      "OZChannelFrame::getObjCWrapperName() @ProChannel 0x1ccfc — the leaq " +
        "target at 0x1cd00 (@0xc8169(%rip) => __cfstring section) resolves in " +
        "this framework slice to the literal placeholder 'bad cfstring ref' " +
        "(Apple linker's unresolved-cfstring token). The real ObjC wrapper " +
        "class-name CFString is defined in a companion binary NOT included in " +
        "the Ozone/ProChannel slice — not yet resolvable.",
    );
  }

  /**
   * OZChannelFrame::OZChannelFrame(OZFactory* factory, PCString const& name,
   *   unsigned int flags1, OZChannelImpl* impl, OZChannelInfo* info)
   * @ProChannel 0x10c1a (C2 base-object ctor variant).
   *
   * Faithful transcription (asm dumped inline in the file header). This ctor
   * variant fixes `folder = NULL` and `flags2 = 0`, then delegates to the
   * OZChannel base ctor with the caller-supplied `impl`/`info`. After the
   * base ctor:
   *   1. Store `__ZTV14OZChannelFrame + 0x10` at (this+0)  @0x10c46-51.
   *   2. Store `__ZTV14OZChannelFrame + 0x370` at (this+0x10)  @0x10c54-5a.
   *   3. Call createOZChannelFrameInfo()  @0x10c5e.
   *   4. If info != NULL @0x10c63: mirror (this+0x88) -> (this+0x80)
   *      @0x10c68-6f (skips the else branch via jmp to 0x10c82).
   *      Else load _OZChannelFrameInfo, write to BOTH (this+0x88) and
   *      (this+0x80) @0x10c71-82.
   *   5. Call createOZChannelFrameImpl()  @0x10c89.
   *   6. If impl != NULL @0x10c8e: mirror (this+0x78) -> (this+0x70)
   *      @0x10c93-97 (skips else). Else load _OZChannelFrameImpl, write
   *      to BOTH (this+0x78) and (this+0x70) @0x10c99-a7. Both paths
   *      fall through to the epilogue.
   *   7. Exception unwind path @0x10cb6-c4: OZChannel::~OZChannel() +
   *      _Unwind_Resume.
   */
  static newFromFactory(
    factory: OZFactory,
    name: string,
    flags1: number, // ecx / arg-4 (unsigned int)
    impl: OZChannelImpl | null,
    info: OZChannelInfo | null,
  ): OZChannelFrame {
    const self = new OZChannelFrame();

    // @0x10c3c..0x10c41  folder=NULL, flags2=0. Delegate to OZChannel base.
    OZChannel__C2_base(
      self,
      factory,
      name,
      /*folder*/ null,
      flags1,
      /*flags2*/ 0,
      impl,
      info,
    );

    // Steps 1-2 (@0x10c46-5a) — vptr installs are implicit in the TS class.

    // Step 3 (@0x10c5e): ensure the once-guarded info singleton is populated.
    OZChannelFrame.createOZChannelFrameInfo();
    // Step 4 (@0x10c63-82).
    if (info !== null) {
      // (base ctor already stored info at +0x88) mirror +0x88 -> +0x80.
      // @0x10c68-6f.
      self.infoPrimary = info;
    } else {
      // @0x10c71-7b: load _OZChannelFrameInfo, write to BOTH slots.
      const fi = _OZChannelFrameInfo as OZChannelInfo;
      self.infoSecondary = fi;
      self.infoPrimary = fi;
    }

    // Step 5 (@0x10c89): ensure the once-guarded impl singleton is populated.
    OZChannelFrame.createOZChannelFrameImpl();
    // Step 6 (@0x10c8e-a7).
    if (impl !== null) {
      // (base ctor already stored impl at +0x78) mirror +0x78 -> +0x70.
      // @0x10c93-97.
      self.implPrimary = impl;
    } else {
      // @0x10c99-a3: load _OZChannelFrameImpl, write to BOTH slots.
      const im = _OZChannelFrameImpl as OZChannelImpl;
      self.implSecondary = im;
      self.implPrimary = im;
    }

    return self;
  }

  /**
   * OZChannelFrame::OZChannelFrame(PCString const& name,
   *   OZChannelFolder* folder, unsigned int flags1, unsigned int flags2,
   *   OZChannelImpl* impl, OZChannelInfo* info) @ProChannel 0x97978.
   *
   * Same shape as newFromFactory above except:
   *   • factory is obtained from `getOZChannelFrame_FactoryBase()`
   *     @0x9799c (external, throwing stub).
   *   • folder + flags2 come from the caller instead of being hardcoded.
   *   • impl / info sit on the stack (r15 + rbp+0x10) rather than in
   *     r14/r15 directly (@0x97989-99). The behavior after the base ctor
   *     is byte-identical to the factory variant.
   *
   * (See file header for the full asm.)
   */
  static newFromNameAndFolder(
    name: string,
    folder: OZChannelFolder | null,
    flags1: number, // ecx / arg-4
    flags2: number, // r8d / arg-5
    impl: OZChannelImpl | null,
    info: OZChannelInfo | null,
  ): OZChannelFrame {
    const self = new OZChannelFrame();

    // @0x9799c: factory = getOZChannelFrame_FactoryBase().
    const factory = getOZChannelFrame_FactoryBase();

    // @0x979a1..0x979c5: delegate to OZChannel base with all 7 args.
    OZChannel__C2_base(self, factory, name, folder, flags1, flags2, impl, info);

    // Steps 1-2 (@0x979ca-de) — vptrs implicit.

    // Step 3 (@0x979e2).
    OZChannelFrame.createOZChannelFrameInfo();
    // Step 4 (@0x979e7-a08).
    if (info !== null) {
      // @0x979ee-f5: mirror +0x88 -> +0x80.
      self.infoPrimary = info;
    } else {
      // @0x979f7-a01: load _OZChannelFrameInfo, write to BOTH slots.
      const fi = _OZChannelFrameInfo as OZChannelInfo;
      self.infoSecondary = fi;
      self.infoPrimary = fi;
    }

    // Step 5 (@0x97a0f).
    OZChannelFrame.createOZChannelFrameImpl();
    // Step 6 (@0x97a14-2f).
    if (impl !== null) {
      // @0x97a1b-1f: mirror +0x78 -> +0x70.
      self.implPrimary = impl;
    } else {
      // @0x97a21-2b: load _OZChannelFrameImpl, write to BOTH slots.
      const im = _OZChannelFrameImpl as OZChannelImpl;
      self.implSecondary = im;
      self.implPrimary = im;
    }

    return self;
  }

  /**
   * OZChannelFrame::~OZChannelFrame() [D1 complete-object dtor]
   * @ProChannel 0x1d3fa.
   *
   *   0x1d3fa  push rbp / mov rsp,rbp
   *   0x1d3fe  pop rbp
   *   0x1d3ff  jmp __ZN9OZChannelD2Ev
   *
   * Pure tail-jmp into OZChannel::~OZChannel — no subclass-specific
   * teardown (OZChannelFrame owns no fields beyond the base subobject).
   * In TS the class-hierarchy handles base teardown; we still expose the
   * D1 entrypoint for symbol-ledger parity and route it through the base
   * dtor stub.
   */
  destroy_D1(): void {
    // @0x1d3ff jmp OZChannel::~OZChannel(this).
    OZChannel_D2(this);
  }

  /**
   * OZChannelFrame::~OZChannelFrame() [D0 deleting dtor]
   * @ProChannel 0x1d404.
   *
   *   0x1d404  push rbp/rsp/rbx/rax
   *   0x1d40a  movq  %rdi, %rbx           ; save this
   *   0x1d40d  callq __ZN9OZChannelD2Ev   ; OZChannel::~OZChannel(this)
   *   0x1d412  movq  %rbx, %rdi
   *   0x1d415  add $0x8,rsp / pop rbx/rbp
   *   0x1d41b  jmp   __ZdlPv              ; ::operator delete(this)
   *
   * D1 body + trailing ::operator delete(this). GC subsumes the delete in
   * TS; we still cite it through a throwing stub for provenance.
   */
  destroy_D0(): void {
    // @0x1d40d callq OZChannel::~OZChannel.
    OZChannel_D2(this);
    // @0x1d41b jmp ::operator delete(this).
    operator_delete(this);
  }

  /**
   * OZChannelFrame::clone() const @ProChannel 0x1d420.
   *
   *   0x1d420  push rbp/rsp/r14/rbx
   *   0x1d427  movq  %rdi, %r14                    ; r14 = this (source)
   *   0x1d42a  movl  $0x98, %edi                    ; sizeof(OZChannelFrame) = 152
   *   0x1d42f  callq __Znwm                          ; new
   *   0x1d434  movq  %rax, %rbx                     ; rbx = fresh instance
   *   0x1d437  movq  %rax, %rdi                     ; arg1 = fresh
   *   0x1d43a  movq  %r14, %rsi                     ; arg2 = source
   *   0x1d43d  xorl  %edx, %edx                     ; arg3 = folder = NULL
   *   0x1d43f  callq __ZN9OZChannelC2ERKS_P15OZChannelFolder ; OZChannel(other,NULL)
   *   0x1d444  leaq  0xb69d5(%rip), %rax             ; = __ZTV14OZChannelFrame + 0x10
   *   0x1d44b  movq  %rax, (%rbx)                    ; vptr primary
   *   0x1d44e  leaq  0xb6d2b(%rip), %rax             ; = __ZTV14OZChannelFrame + 0x370
   *   0x1d455  movq  %rax, 0x10(%rbx)                ; vptr secondary
   *   0x1d459  movq  %rbx, %rax                     ; return fresh
   *   0x1d45c..0x1d460  epilogue + retq
   *
   * Unwind path (@0x1d461-6f): __ZdlPv on the fresh alloc + __Unwind_Resume.
   *
   * NOTE: the copy ctor `__ZN9OZChannelC2ERKS_P15OZChannelFolder` is NOT
   * yet transcribed (see OZChannel.ts's `OZChannel__C2_copy` is only the
   * base-object variant used from OZChannel's own copy ctor; the shared
   * base-copy ctor callable from subclasses is the external symbol). We
   * therefore route through the throwing stub.
   */
  clone(): OZChannelFrame {
    // @0x1d42a-2f  fresh = ::operator new(0x98).
    const fresh = operator_new(0x98);
    // @0x1d437-3f  OZChannel::OZChannel(fresh, this, folder=NULL).
    OZChannel_copy_ctor(fresh, this, null);
    // @0x1d444-55  vptrs implicit in TS.
    // @0x1d459  return fresh.
    return fresh;
  }
}
