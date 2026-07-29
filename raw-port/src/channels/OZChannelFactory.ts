// OZChannelFactory — Ozone's soft-abstract factory base for channel objects.
// Faithful transcription from x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// -----------------------------------------------------------------------------
// SOFT-ABSTRACT FACTORY (default-null bodies, not __cxa_pure_virtual)
// -----------------------------------------------------------------------------
// OZChannelFactory is the base class that every concrete channel factory in
// Ozone derives from (e.g. OZMaterialSubstanceLayer_Factory @vtable+0xd0,
// OZChannelBool3D_Factory, OZChannelDouble_Factory, ...). Unlike its cousin
// OZSceneNodeFactory (which fills its base vtable slots with
// __cxa_pure_virtual traps — see raw-port/src/nodes/OZSceneNodeFactory.ts),
// OZChannelFactory installs REAL non-throwing bodies at every slot: each one
// is the two-instruction epilogue `xor %eax,%eax ; ret`, i.e. return nullptr
// (or 0 for scalar returns). So a hypothetical caller invoking `create` on a
// bare `OZChannelFactory*` gets a null pointer back rather than a trap.
//
// Vtable @0x853120; installed instance ptr 0x853130
// (resolved via `python3 raw-port/army/tools/vtable.py Ozone OZChannelFactory`):
//
//   *0x00 -> 0x6dadf0  ~OZChannelFactory (D1, in-place)     — `pushq %rbp; movq %rsp,%rbp; ud2`
//   *0x08 -> 0x6dae00  ~OZChannelFactory (D0, deleting)     — `pushq %rbp; movq %rsp,%rbp; ud2`
//   *0x10 -> 0x1aa20   OZChannelFactory::create(PCString const&, unsigned int)
//                        `pushq %rbp; movq %rsp,%rbp; xor %eax,%eax; popq %rbp; retq`
//   *0x18 -> 0x1aa30   OZChannelFactory::createCopy(OZFactoryBase*, unsigned int)
//                        `pushq %rbp; movq %rsp,%rbp; xor %eax,%eax; popq %rbp; retq`
//   *0x20 -> 0x1aa40   OZChannelFactory::createInstance(OZFactoryBase*)
//                        `pushq %rbp; movq %rsp,%rbp; xor %eax,%eax; popq %rbp; retq`
//   *0xa8 -> 0x1aa50   OZChannelFactory::createChannel(PCString const&, unsigned int)
//                        `pushq %rbp; movq %rsp,%rbp; xor %eax,%eax; popq %rbp; retq`
//   *0xb0 -> 0x1aa60   OZChannelFactory::createChannelCopy(OZChannelBase*, unsigned int)
//                        `pushq %rbp; movq %rsp,%rbp; xor %eax,%eax; popq %rbp; retq`
//   *0xb8 -> 0x1aa70   OZChannelFactory::createChannelInstance(OZChannelBase*)
//                        `pushq %rbp; movq %rsp,%rbp; xor %eax,%eax; popq %rbp; retq`
//   *0xd0.. -> concrete subclass overrides begin here (OZMaterialSubstanceLayer_Factory
//              at 0xd0..0x118 in the same table region; the gap 0x28..0xa0 and 0xc0..0xc8
//              between the two-block "generic (create*)" and "channel (createChannel*)"
//              APIs holds description/manufacturer/version/revision/getCategoryName/
//              getBundleID/getIcon* slots — those are pure-virtual on the base and only
//              filled in by concrete subclasses; the base itself does NOT install real
//              bodies there, so they read as 0 in the abstract vtable.)
//
// The two disjoint 3-slot windows (create/createCopy/createInstance at 0x10-0x20;
// createChannel/createChannelCopy/createChannelInstance at 0xa8-0xb8) correspond to
// the two ABIs a channel factory presents:
//   - generic factory ABI  (create/createCopy/createInstance take OZFactoryBase*)
//   - channel-specific ABI (createChannel* take OZChannelBase*)
// The base defaults BOTH families to null so a subclass need only override the
// one it actually implements.
//
// -----------------------------------------------------------------------------
// D1/D0 destructor stubs  @0x6dadf0 / @0x6dae00
// -----------------------------------------------------------------------------
// Both destructor bodies (from /tmp/Ozone_tV.txt near 0x6dadf0):
//     pushq %rbp
//     movq  %rsp, %rbp
//     ud2                       ; illegal-instruction trap
//     nopw  %cs:(%rax,%rax)
//
// Matching the OZSceneNodeFactory convention: the abstract base's dtor bodies
// are `ud2`, meaning concrete subclasses are expected to terminate the dtor
// chain themselves. Any actual invocation traps the process.
//
// -----------------------------------------------------------------------------
// Method bodies (verbatim, all six identical)
// -----------------------------------------------------------------------------
// __ZN16OZChannelFactory6createERK8PCStringj                    @0x1aa20
// __ZN16OZChannelFactory10createCopyEP13OZFactoryBasej          @0x1aa30
// __ZN16OZChannelFactory14createInstanceEP13OZFactoryBase       @0x1aa40
// __ZN16OZChannelFactory13createChannelERK8PCStringj            @0x1aa50
// __ZN16OZChannelFactory17createChannelCopyEP13OZChannelBasej   @0x1aa60
// __ZN16OZChannelFactory21createChannelInstanceEP13OZChannelBase@0x1aa70
//
//     pushq %rbp
//     movq  %rsp, %rbp
//     xorl  %eax, %eax          ; return 0/nullptr
//     popq  %rbp
//     retq
//     nopl  (%rax,%rax)          ; alignment padding
//
// Nothing is read from %rdi/%rsi/%rdx; the arguments are ignored. The
// TypeScript port therefore returns `null` unconditionally.
//
// -----------------------------------------------------------------------------
// Frontier types (declared referenced but not owned here):
//   PCString      — already ported at raw-port/src/infra/PCString.ts
//   OZFactoryBase — already ported at raw-port/src/channels/OZFactoryBase.ts
//   OZChannelBase — already ported at raw-port/src/channels/OZChannelBase.ts
//
// (This class holds NO instance state of its own beyond the vtable pointer
// at +0x00 — it's a pure ABI slot bag.)
//
// -----------------------------------------------------------------------------
// CROSS-FRAMEWORK DUPLICATION — Flexo re-emits OZChannelFactory (2026-07-29)
// -----------------------------------------------------------------------------
// Flexo.framework contains a byte-identical copy of every method under a
// separate set of link addresses. Verified against /tmp/Flexo_tV.txt: each
// body is the same `pushq %rbp; movq %rsp,%rbp; xorl %eax,%eax; popq %rbp; retq`
// (or `pushq %rbp; movq %rsp,%rbp; ud2` for the dtors) as the Ozone copy above.
// The port below is a faithful transcription of BOTH — same TS body, different
// address citations. mark_ported.py flips both frameworks' ledger entries from
// the shared @0xADDR list.
//
//   @Flexo 0x2181a0 = @Ozone 0x1aa20  OZChannelFactory::create
//   @Flexo 0x2181b0 = @Ozone 0x1aa30  OZChannelFactory::createCopy
//   @Flexo 0x2181c0 = @Ozone 0x1aa40  OZChannelFactory::createInstance
//   @Flexo 0x2181d0 = @Ozone 0x1aa50  OZChannelFactory::createChannel
//   @Flexo 0x2181e0 = @Ozone 0x1aa60  OZChannelFactory::createChannelCopy
//   @Flexo 0x2181f0 = @Ozone 0x1aa70  OZChannelFactory::createChannelInstance
//   @Flexo 0x14763c0 = @Ozone 0x6dadf0  ~OZChannelFactory (D1) — `pushq %rbp; movq %rsp,%rbp; ud2`
//   @Flexo 0x14763d0 = @Ozone 0x6dae00  ~OZChannelFactory (D0) — same body
//
// (No Flexo D2 entry appears in the ledger — Flexo's binary elides the in-place
// dtor; only D1/D0 are emitted, both trapping via `ud2`.)
//
// Verified byte-for-byte against /tmp/Flexo_tV.txt @0x2181a0-0x2181f8 and
// @0x14763c0-0x14763d8.  This adds NO new bodies — it just documents that the
// same six-slot ABI + trapping-dtor is present at these Flexo addresses.

import type { PCString } from "../infra/PCString";
import type { OZChannelBase } from "./OZChannelBase";

// OZFactoryBase is the intermediary defined in ./OZFactoryBase.ts. The methods
// on OZChannelFactory that take an `OZFactoryBase*` argument only carry it as
// an opaque pointer (they don't dereference it), so a type import is enough.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { OZFactoryBase as _OZFactoryBase } from "./OZFactoryBase";

/**
 * Soft-abstract base for every Ozone channel factory. All six ABI methods
 * (three generic + three channel-specific) default to returning `null`,
 * matching the compiled `xor %eax,%eax; ret` bodies at @0x1aa20..0x1aa70.
 * Concrete subclasses override the pair they implement.
 *
 * Directly destroying an OZChannelFactory is undefined — the native D1/D0
 * bodies at @0x6dadf0/@0x6dae00 are `ud2` traps.
 *
 * Vtable @0x853120  (Ozone.framework)
 * ~D1     @0x6dadf0  ud2
 * ~D0     @0x6dae00  ud2
 */
export class OZChannelFactory {
  /**
   * D1/D0 destructor stub. The native bodies are `ud2` — trapping the
   * process on invocation of the abstract-base destructor.
   *
   * @asm ~OZChannelFactory D1 @0x6dadf0 : `pushq %rbp ; movq %rsp,%rbp ; ud2`
   * @asm ~OZChannelFactory D0 @0x6dae00 : `pushq %rbp ; movq %rsp,%rbp ; ud2`
   */
  dispose(): void {
    throw new Error(
      "OZChannelFactory::~OZChannelFactory is `ud2` (abstract-base " +
        "destructor is unreachable — concrete subclass must override).",
    );
  }

  /**
   * Generic factory: create by name.
   *
   * @vtable *0x10
   * @asm    OZChannelFactory::create(PCString const&, unsigned int) @0x1aa20
   *         `pushq %rbp ; movq %rsp,%rbp ; xor %eax,%eax ; popq %rbp ; retq`
   *
   * Body ignores `%rdi` (this), `%rsi` (name PCString&), `%rdx` (flags) and
   * returns 0/nullptr in `%rax`. Concrete subclasses override.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(_name: PCString, _flags: number): _OZFactoryBase | null {
    return null;
  }

  /**
   * Generic factory: create by copying an existing factory-backed object.
   *
   * @vtable *0x18
   * @asm    OZChannelFactory::createCopy(OZFactoryBase*, unsigned int) @0x1aa30
   *         `pushq %rbp ; movq %rsp,%rbp ; xor %eax,%eax ; popq %rbp ; retq`
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createCopy(_source: _OZFactoryBase, _flags: number): _OZFactoryBase | null {
    return null;
  }

  /**
   * Generic factory: create an instance (shared-backing "instance", not a copy).
   *
   * @vtable *0x20
   * @asm    OZChannelFactory::createInstance(OZFactoryBase*) @0x1aa40
   *         `pushq %rbp ; movq %rsp,%rbp ; xor %eax,%eax ; popq %rbp ; retq`
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createInstance(_source: _OZFactoryBase): _OZFactoryBase | null {
    return null;
  }

  /**
   * Channel-specific factory: create a fresh channel by name.
   *
   * @vtable *0xa8
   * @asm    OZChannelFactory::createChannel(PCString const&, unsigned int) @0x1aa50
   *         `pushq %rbp ; movq %rsp,%rbp ; xor %eax,%eax ; popq %rbp ; retq`
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createChannel(_name: PCString, _flags: number): OZChannelBase | null {
    return null;
  }

  /**
   * Channel-specific factory: create a channel by copying an existing one.
   *
   * @vtable *0xb0
   * @asm    OZChannelFactory::createChannelCopy(OZChannelBase*, unsigned int) @0x1aa60
   *         `pushq %rbp ; movq %rsp,%rbp ; xor %eax,%eax ; popq %rbp ; retq`
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createChannelCopy(_source: OZChannelBase, _flags: number): OZChannelBase | null {
    return null;
  }

  /**
   * Channel-specific factory: create a shared-backing instance of an existing
   * channel.
   *
   * @vtable *0xb8
   * @asm    OZChannelFactory::createChannelInstance(OZChannelBase*) @0x1aa70
   *         `pushq %rbp ; movq %rsp,%rbp ; xor %eax,%eax ; popq %rbp ; retq`
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createChannelInstance(_source: OZChannelBase): OZChannelBase | null {
    return null;
  }
}
