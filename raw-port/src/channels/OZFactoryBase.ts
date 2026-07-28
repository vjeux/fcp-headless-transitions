// OZFactoryBase (Flexo.framework build) — Flexo's copy of a small delegator
// intermediary that adapts an object holding a "factory" pointer at +0x8
// into the OZ factory interface. Every public method just re-dispatches to
// a slot on the delegate's vtable — the class itself introduces NO logic;
// it exists to give the compiler a place to hang non-virtual dispatchers
// against a fixed vtable layout inherited from OZChannelBase-family bases.
//
// (Ozone.framework has its own copy of this class @0x1fab0..; this port is
// the Flexo.framework copy at @0x217a80.. — same shape, different framework.)
//
// FRAMEWORK: Flexo.framework (Final Cut Pro).
// BINARY:    /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// DECODE:    raw-port/re/disasm/Flexo.OZFactoryBase.*.s + /tmp/Flexo_tV.txt
//
// SYMBOLS (from /tmp/Flexo_symmap.tsv):
//   __ZNK13OZFactoryBase11getIconNameEv           @0x00217a80
//     ; PCString getIconName() const                    -> sret path, returns by value
//   __ZNK13OZFactoryBase13getIconNameBWEv         @0x00217aa0
//     ; PCString getIconNameBW() const                  -> sret path, returns by value
//   __ZNK13OZFactoryBase9getIconIDEv              @0x00217ac0
//     ; <scalar> getIconID() const                      -> no sret, returns in %rax
//   __ZNK13OZFactoryBase18getLibraryIconNameEv    @0x00217ad0
//     ; PCString getLibraryIconName() const             -> sret path, returns by value
//   __ZN13OZFactoryBase11descriptionEv            @0x00217af0
//     ; PCString description()                          -> sret path, returns by value
//   __ZNK13OZFactoryBase26getFactoryForSerializationER23PCSerializerWriteStreamb  @0x00217b30
//     ; <pointer> getFactoryForSerialization(PCSerializerWriteStream&, bool) const
//     ; -> returns this->[+0x8] regardless of args
//
// INSTANCE LAYOUT (recovered from the six bodies):
//   +0x00  vtable pointer               (touched by callers via base classes;
//                                        THIS class never writes it)
//   +0x08  factory delegate pointer     — the target of every forwarded call.
//                                        Its own vtable is loaded from *(delegate+0)
//                                        and one of the slots below is invoked.
//   (No other fields are read/written by any of the six methods.)
//
// DELEGATE (POINTER @+0x8) VTABLE SLOTS INVOKED HERE:
//   *0x28  description()               (used by @0x00217b00)
//   *0x50  getIconName() const         (used by @0x00217a90)
//   *0x58  getIconNameBW() const       (used by @0x00217ab0)
//   *0x60  getIconID() const           (used by @0x00217acc, tail-called via jmpq)
//   *0x68  getLibraryIconName() const  (used by @0x00217ae0)
//
// The sret ABI in the four PCString-returning methods:
//   %rdi arrives holding the caller-provided return buffer pointer; we save it
//   in %rbx and pass it straight through to the delegate's vtable slot as its
//   first argument (also %rdi). The delegate's vtable slot writes into that
//   buffer, then we recover %rbx into %rax as the return value.
//
// FRONTIER TYPES (referenced but not decoded here):
//   PCString                  — already ported at raw-port/src/infra/PCString.ts
//   PCSerializerWriteStream   — opaque frontier type; we don't call any of its
//                                methods, we just pass a reference through.
//
// No math, no state — just five forwarders and one "return this->delegate".

import type { PCString } from "../infra/PCString";

// PCSerializerWriteStream — opaque. Only used by getFactoryForSerialization
// which does not touch it.
export interface PCSerializerWriteStream { /* opaque */ }

/**
 * The delegate whose vtable slots this class forwards to. In the C++ world
 * this is another polymorphic object (a "factory") that lives at +0x8 of
 * every OZFactoryBase. Only five specific slots are called by this class —
 * that's the minimum shape we require.
 */
export interface OZFactoryBaseDelegate {
  // vtable *0x28
  description(): PCString;
  // vtable *0x50
  getIconName(): PCString;
  // vtable *0x58
  getIconNameBW(): PCString;
  // vtable *0x60
  getIconID(): number; // 32/64-bit scalar
  // vtable *0x68
  getLibraryIconName(): PCString;
}

/**
 * OZFactoryBase (Flexo).
 *
 * All six methods forward to `this.delegate` (equivalent to native +0x8).
 * No local field access, no math, no branching in the sources.
 */
export class OZFactoryBase {
  // +0x08 — the delegate factory pointer. Callers must supply it.
  // Kept public-readonly to mirror the C++ POD-ish layout where the field is
  // written by whichever ctor sets it up (not one of the six methods here).
  readonly delegate: OZFactoryBaseDelegate;

  constructor(delegate: OZFactoryBaseDelegate) {
    // NOTE: The Flexo binary does not export an OZFactoryBase ctor as a
    // standalone symbol — this class is always constructed as part of a
    // subclass. We accept the delegate directly so the six forwarders below
    // work as documented. This corresponds to the native writing of +0x8.
    this.delegate = delegate;
  }

  // ---------------------------------------------------------------------
  // @0x00217a80  PCString OZFactoryBase::getIconName() const
  //   pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
  //   movq %rdi,%rbx           ; rbx = sret buffer
  //   movq 0x8(%rsi),%rsi      ; new-this = this->delegate (arg was 'this' in %rsi)
  //   movq (%rsi),%rax          ; rax = delegate->vtable
  //   callq *0x50(%rax)         ; delegate->vtable[0x50] (getIconName)
  //   movq %rbx,%rax            ; return the sret pointer
  //   epilogue
  // ---------------------------------------------------------------------
  getIconName(): PCString {
    // @0x00217a90  delegate->vtable[0x50] -> getIconName()
    return this.delegate.getIconName();
  }

  // ---------------------------------------------------------------------
  // @0x00217aa0  PCString OZFactoryBase::getIconNameBW() const
  //   Same shape as getIconName; vtable slot 0x58.
  // ---------------------------------------------------------------------
  getIconNameBW(): PCString {
    // @0x00217ab0  delegate->vtable[0x58] -> getIconNameBW()
    return this.delegate.getIconNameBW();
  }

  // ---------------------------------------------------------------------
  // @0x00217ac0  <scalar> OZFactoryBase::getIconID() const
  //   pushq %rbp / movq %rsp,%rbp
  //   movq 0x8(%rdi),%rdi       ; this = this->delegate (this was %rdi — no sret!)
  //   movq (%rdi),%rax           ; rax = delegate->vtable
  //   popq %rbp
  //   jmpq *0x60(%rax)           ; TAIL-CALL delegate->vtable[0x60] (getIconID)
  //
  // Different ABI than the sret forwarders: scalar-return means no hidden sret
  // buffer, %rdi is 'this' directly, and the forwarder does a *jmp* not a *call*
  // (perfect tail-call — the delegate slot's return value flows straight back).
  // ---------------------------------------------------------------------
  getIconID(): number {
    // @0x00217acc  tail-jmp delegate->vtable[0x60] -> getIconID()
    return this.delegate.getIconID();
  }

  // ---------------------------------------------------------------------
  // @0x00217ad0  PCString OZFactoryBase::getLibraryIconName() const
  //   Same shape as getIconName; vtable slot 0x68.
  // ---------------------------------------------------------------------
  getLibraryIconName(): PCString {
    // @0x00217ae0  delegate->vtable[0x68] -> getLibraryIconName()
    return this.delegate.getLibraryIconName();
  }

  // ---------------------------------------------------------------------
  // @0x00217af0  PCString OZFactoryBase::description()
  //   Same shape as getIconName; vtable slot 0x28. Note: this is a
  //   non-const method (mangled __ZN…, not __ZNK…) but the body reads
  //   only this->delegate — no mutation.
  // ---------------------------------------------------------------------
  description(): PCString {
    // @0x00217b00  delegate->vtable[0x28] -> description()
    return this.delegate.description();
  }

  // ---------------------------------------------------------------------
  // @0x00217b30  <ptr> OZFactoryBase::getFactoryForSerialization(
  //                                     PCSerializerWriteStream&, bool) const
  //   pushq %rbp / movq %rsp,%rbp
  //   movq 0x8(%rdi),%rax        ; rax = this->delegate
  //   popq %rbp
  //   retq
  //
  // The arguments (%rsi = &writeStream, %dl = bool) are NEVER READ. This
  // method literally just returns the delegate pointer. In TS that means
  // returning `this.delegate` — for callers, the "factory for
  // serialization" IS the delegate itself.
  // ---------------------------------------------------------------------
  getFactoryForSerialization(
    _writeStream: PCSerializerWriteStream,
    _flag: boolean,
  ): OZFactoryBaseDelegate {
    // @0x00217b34  return this->[+0x8]
    return this.delegate;
  }
}
