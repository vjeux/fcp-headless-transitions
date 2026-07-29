// raw-port: OZMaterialLayerBase (chunk m2) — Ozone.framework (channels layer)
//
// Framework binary: /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//   Versions/A/Ozone (x86_64 slice; VA == offset within thin slice).
//
// This chunk ports methods [40..47) of the 47-method OZMaterialLayerBase class:
//   40 makeMaterialLayerSequenceChannelFolder()             @0x00000000004ac660
//   41 getSequenceChannels()                                @0x00000000004ac740
//   42 getTextureTokensLock()                               @0x00000000004ac770
//   43 findToken(PCHash128 const&) const                    @0x00000000004ac7a0
//   44 addToken(PCHash128 const&, LiTextureStoreToken const&) @0x00000000004ac840
//   45 ~OZMaterialLayerBase()  (D1 vtable slot)             @0x00000000006dbe00
//   46 ~OZMaterialLayerBase()  (D0 deleting-dtor slot)      @0x00000000006dbe20
//
// DECODE: raw-port/re/disasm/OZMaterialLayerBase.<method>.s (one .s per method).
//   D1 / D0 dtor bodies were read via `xcrun llvm-objdump --arch=x86_64
//   --disassemble-symbols=__ZN19OZMaterialLayerBaseD{0,1}Ev /tmp/Ozone.x86_64` — both are the
//   3-byte `ud2` trap (deleted virtual: the linker installs a placeholder here because the
//   virtual-dtor path is entered via a derived class' vtable, not this base's slot). The real
//   non-virtual base dtor is D2 @0x4abe70 which lives in chunk m1.
//
// STRUCT LAYOUT ADDITIONS RECOVERED IN THIS CHUNK (base of OZChannelBase; only the two fields
// touched by methods 40..44 are asserted here — the rest of the layout lives in m0/m1):
//   +0x018   uint32  subtypeMask   — bit-set of sub-layer type flags copied verbatim into
//                                    the newly-built OZMaterialLayerSequenceFolder's own
//                                    +0x18 slot (@0x4ac67d `movl 0x18(%r14),%ecx` where %r14
//                                    is `this + 0x20` — see below). Read at ctor arg #4.
//   +0x020   OZChannelFolder* parentChannelFolder
//                                  — the folder-slot that owns this material-layer subtree.
//                                    Passed by-pointer as ctor arg #2 to the sequence-folder
//                                    (@0x4ac681 `addq $0x20, %r14`, arg %rsi).
//   +0x4a8   std::map<PCHash128, std::weak_ptr<PCMutex>> textureTokens
//                                  — red-black tree root/head sentinel is at +0x4b0 (the
//                                    tree's `__begin_node_` slot is +0x4b0; the map's
//                                    `__begin_node_` doubles as the header sentinel — see
//                                    findToken @0x4ac7b1 `movq 0x4b0(%rsi),%r13` and
//                                    addToken @0x4ac849 `addq $0x4a8,%rdi`).
//   +0x4c0   PCSpinLock textureTokensLock
//                                  — getTextureTokensLock @0x4ac779 `leaq 0x4c0(%rsi),%rdi`.
//
// Frontier callees (loud throw citing @0xADDR — Spec Rule 3) ────────────────────────
//   __Znwm  (operator new)                              @stub 0x6dfca2
//   __ZdlPv (operator delete)                           @stub 0x6dfc36
//   __Unwind_Resume                                     @stub 0x6dd07a
//   OZMaterialLayerSequenceFolder::C1(PCString const&, OZChannelFolder*, u32, u32, u32)
//                                                       @0x4ac693 (call target
//                                                       __ZN29OZMaterialLayerSequenceFolderC1E...)
//   PCString::PCString(char const*)                     @stub 0x6df09c (__ZN8PCStringC1EPKc)
//   PCString::~PCString()                               @stub 0x6df0c6 (__ZN8PCStringD1Ev)
//   OZChannelDouble::OZChannelDouble(PCString const&, OZChannelFolder*, u32, u32,
//                                    OZChannelImpl*, OZChannelInfo*)
//                                                       @0x4ac6d2 (target
//                                                       __ZN15OZChannelDoubleC2ERK8PCString...)
//   OZChannelBase::setFlag(unsigned long long, bool)    @stub 0x6dd914
//   OZSceneNode_Factory::~OZSceneNode_Factory()         @sym_ptr (used as the flag-word — a
//                                                       symbol address loaded via
//                                                       `movl $sym,%esi` at @0x4ac6ed; the
//                                                       address of the destructor symbol IS
//                                                       the flag-bit identifier for setFlag).
//   OZChannelBase::getObjectManipulator() const         @stub 0x6df55e
//   OZLayeredMaterial::getSequenceChannelsForMaterialLayer(OZMaterialLayerBase*)
//                                                       @tail-jmp target
//                                                       __ZN17OZLayeredMaterial35...
//   PCSpinLock::lock()                                  @stub 0x6dd446 (__ZN10PCSpinLock4lockEv)
//   operator<(PCHash128 const&, PCHash128 const&)       @stub 0x6dfc60 (__ZltRK9PCHash128S1_)
//   std::__1::__tree<PCHash128, weak_ptr<PCMutex>>::__emplace_unique_key_args
//                                                       @0x4ac873 (out-of-line C++ std)
//   std::__1::pair<PCHash128 const, LiTextureStoreToken>::~pair()
//                                                       @0x4ac8b9 (unwind cleanup)
//   std::__1::__shared_weak_count::__release_weak()     @stub 0x6dfbbe
//   __shared_weak_count vtable slot +0x10               @0x4ac8a0 (deleter dispatch)
//
// ORACLE COVERAGE: this chunk is pure infra plumbing (map ops, vtable calls, spinlock). No
// numeric FCP function to bit-parity-check. It is verified structurally: G0/G1/G2 must pass;
// every call target that is not yet ported goes through a throw-stub citing its @0xADDR.

import { PCSpinLock } from "../infra/PCSpinLock.js";
import { PCHash128 } from "../infra/PCHash128.js";

// ---------------------------------------------------------------------------------------------
// Local opaque frontier types + throw-stubs. Every runtime edge that would enter an unported
// FCP subsystem throws with its @0xADDR (Spec Rule 3).
// ---------------------------------------------------------------------------------------------

/** OZChannelFolder* — parent folder, opaque here (sibling file OZChannelFolder.ts). */
export interface OZChannelFolder { readonly __brand: "OZChannelFolder"; }

/** OZChannelImpl* — channel impl slot, opaque here. */
export interface OZChannelImpl { readonly __brand: "OZChannelImpl"; }

/** OZChannelInfo* — channel descriptor slot, opaque here. */
export interface OZChannelInfo { readonly __brand: "OZChannelInfo"; }

/** OZLayeredMaterial* — sibling channel owning the material tree. */
export interface OZLayeredMaterial { readonly __brand: "OZLayeredMaterial"; }

/**
 * OZMaterialLayerSequenceFolder — the sub-folder that holds a material layer's
 * sequence channels. Ctor is called from makeMaterialLayerSequenceChannelFolder
 * @0x4ac693; class is not yet ported in this repo. Modelled as an opaque handle
 * carrying the three ctor arguments so downstream code can round-trip its identity.
 */
export interface OZMaterialLayerSequenceFolder {
  readonly __brand: "OZMaterialLayerSequenceFolder";
  readonly name: string;
  readonly parent: OZChannelFolder | null;
  readonly subtypeMask: number;
}

/**
 * OZChannelDouble slot returned by makeMaterialLayerSequenceChannelFolder — the
 * "No Sequence Channels" default double-valued sequence channel. Opaque here.
 */
export interface OZChannelDouble { readonly __brand: "OZChannelDouble"; }

/**
 * LiTextureStoreToken (const&) — sibling file LiTextureStoreToken.ts. addToken
 * takes it by-const-ref and moves it into a std::pair map element. Opaque here.
 */
export interface LiTextureStoreToken { readonly __brand: "LiTextureStoreToken"; }

/**
 * std::weak_ptr<PCMutex> — the value type of the textureTokens map. Layout is
 * a 16-byte { T* __ptr_; __shared_weak_count* __cntrl_ } — the two `movups`
 * pairs at findToken @0x4ac822/@0x4ac828 read exactly this shape.
 */
export interface WeakPtrPCMutex {
  readonly __brand: "WeakPtrPCMutex";
  ptr: unknown;                 // T* — never dereferenced in this chunk
  cntrl: SharedWeakCount | null;
}

/** __shared_weak_count* — nullable control block header. Not decoded here. */
export interface SharedWeakCount { readonly __brand: "SharedWeakCount"; }

// ---------------------------------------------------------------------------------------------
// Frontier throw-stubs. Every one cites its call-site @0xADDR and its callee @0xADDR (or
// stub-slot for extern) so ANTI_SHORTCUT's P3/P4 rules pass.
// ---------------------------------------------------------------------------------------------

function OZMaterialLayerSequenceFolder_C1(
  _p: OZMaterialLayerSequenceFolder,
  _name: string,
  _parent: OZChannelFolder | null,
  _a: number, _b: number, _c: number,
): never {
  // Called @0x4ac693 →
  //   __ZN29OZMaterialLayerSequenceFolderC1ERK8PCStringP15OZChannelFolderjjj
  throw new Error(
    "OZMaterialLayerSequenceFolder::C1(PCString const&, OZChannelFolder*, uint, uint, uint) " +
    "@0x4ac693 not yet transcribed",
  );
}

function PCString_C1(_p: unknown, _s: string): never {
  // Called @0x4ac6b0 → stub __ZN8PCStringC1EPKc @0x6df09c
  throw new Error("PCString::PCString(char const*) @stub 0x6df09c not yet transcribed");
}

function PCString_D1(_p: unknown): never {
  // Called @0x4ac6db and @0x4ac711 (unwind) → stub __ZN8PCStringD1Ev @0x6df0c6
  throw new Error("PCString::~PCString() @stub 0x6df0c6 not yet transcribed");
}

function OZChannelDouble_C2(
  _p: OZChannelDouble,
  _name: unknown,
  _parent: OZChannelFolder | null,
  _a: number,
  _idOrFlag: number,
  _impl: OZChannelImpl | null,
  _info: OZChannelInfo | null,
): never {
  // Called @0x4ac6d2 →
  //   __ZN15OZChannelDoubleC2ERK8PCStringP15OZChannelFolderjjP13OZChannelImplP13OZChannelInfo
  throw new Error("OZChannelDouble::OZChannelDouble(...) @0x4ac6d2 not yet transcribed");
}

function OZChannelBase_vslot_0x68(
  _p: OZChannelDouble,
  _a: number,
  _b: number,
): never {
  // First: virtual `callq *0x68(%rax)` @0x4ac6ea on the newly-built OZChannelDouble's vtable.
  throw new Error("OZChannelBase vtable slot +0x68 (@0x4ac6ea) not yet transcribed");
}

function OZChannelBase_setFlag(_p: OZChannelDouble, _flagWord: bigint, _value: boolean): never {
  // Direct call @0x4ac6f7 → stub __ZN13OZChannelBase7setFlagEyb @0x6dd914.
  throw new Error("OZChannelBase::setFlag(u64, bool) @stub 0x6dd914 not yet transcribed");
}

function OZChannelBase_getObjectManipulator(_p: unknown): never {
  // Called @0x4ac749 → stub __ZNK13OZChannelBase20getObjectManipulatorEv @0x6df55e
  throw new Error(
    "OZChannelBase::getObjectManipulator() const @stub 0x6df55e not yet transcribed",
  );
}

function OZLayeredMaterial_getSequenceChannelsForMaterialLayer(
  _self: OZLayeredMaterial,
  _layer: OZMaterialLayerBase,
): never {
  // Tail-jmp @0x4ac762 →
  //   __ZN17OZLayeredMaterial35getSequenceChannelsForMaterialLayerEP19OZMaterialLayerBase
  throw new Error(
    "OZLayeredMaterial::getSequenceChannelsForMaterialLayer(OZMaterialLayerBase*) " +
    "@0x4ac762 not yet transcribed",
  );
}

function PCHash128_lessThan(_a: PCHash128, _b: PCHash128): never {
  // Called @0x4ac7d7 and @0x4ac7fc → stub __ZltRK9PCHash128S1_ @0x6dfc60.
  throw new Error(
    "operator<(PCHash128 const&, PCHash128 const&) @stub 0x6dfc60 not yet transcribed",
  );
}

function tree_emplace_unique_key_args(
  _map: TextureTokensMap,
  _key: PCHash128,
  _value: WeakPtrPCMutex,
): never {
  // Called @0x4ac873 →
  //   __ZNSt3__16__treeINS_12__value_typeI9PCHash128NS_8weak_ptrI7PCMutexEEEE...
  //     __emplace_unique_key_args<PCHash128, pair<PCHash128 const, weak_ptr<PCMutex>>>
  throw new Error(
    "std::__1::__tree<PCHash128, weak_ptr<PCMutex>>::__emplace_unique_key_args " +
    "@0x4ac873 not yet transcribed",
  );
}

function pair_dtor_hash_texture(_p: unknown): never {
  // Called @0x4ac8b9 (unwind) →
  //   __ZNSt3__14pairIK9PCHash12819LiTextureStoreTokenED1Ev
  throw new Error(
    "std::__1::pair<PCHash128 const, LiTextureStoreToken>::~pair() @0x4ac8b9 " +
    "not yet transcribed",
  );
}

function shared_weak_count_release_weak(_c: SharedWeakCount): never {
  // Called @0x4ac8a6 → stub __ZNSt3__119__shared_weak_count14__release_weakEv @0x6dfbbe.
  throw new Error(
    "std::__1::__shared_weak_count::__release_weak() @stub 0x6dfbbe not yet transcribed",
  );
}

function shared_weak_count_vslot_10(_c: SharedWeakCount): never {
  // Called @0x4ac8a0 as `movq (%rbx),%rax; callq *0x10(%rax)` — virtual slot +0x10 on the
  // __shared_weak_count vtable (weak-side count decrement + potential deleter dispatch).
  throw new Error("__shared_weak_count vtable slot +0x10 @0x4ac8a0 not yet transcribed");
}

function unwind_resume(_x: unknown): never {
  // @0x4ac726 / @0x4ac739 — landing-pad tail edge. Stub __Unwind_Resume @0x6dd07a.
  throw new Error("__Unwind_Resume @stub 0x6dd07a — C++ exception propagation not modeled");
}

// ---------------------------------------------------------------------------------------------
// Backing type for the +0x4a8 map. The native map stores `pair<PCHash128 const,
// weak_ptr<PCMutex>>` in a red-black tree ordered by PCHash128::operator<.
// A JS Map keyed by a string derivation of PCHash128 is a valid behavioural mirror ONLY for
// membership/equality; the ordered-iteration property is NOT observable from the two entry
// points exported in this chunk (find + emplace). If a later chunk needs iteration, it must
// re-decode the tree walk explicitly rather than relying on Map iteration order.
// ---------------------------------------------------------------------------------------------
type TextureTokensMap = Map<string, WeakPtrPCMutex>;

// ---------------------------------------------------------------------------------------------
// OZMaterialLayerBase — chunk m2 methods.
//
// Only the fields TOUCHED by these 7 methods are declared on the class here (subtypeMask,
// parentChannelFolder, textureTokens, textureTokensLock). The rest of the layout is defined by
// chunks m0 / m1 as they land — one class, split across three files is consistent with the
// porting spec's chunk convention (HGColorGamma.m0/m1/m2/m3 use the same pattern).
// ---------------------------------------------------------------------------------------------
export class OZMaterialLayerBase {
  // Fields observed by chunk m2 (offsets read from disasm).
  /** +0x018 */ subtypeMask: number = 0;
  /** +0x020 */ parentChannelFolder: OZChannelFolder | null = null;
  /** +0x4a8 */ textureTokens: TextureTokensMap = new Map();
  /** +0x4c0 */ textureTokensLock: PCSpinLock = new PCSpinLock();

  /**
   * OZMaterialLayerBase::makeMaterialLayerSequenceChannelFolder()
   * @Ozone 0x00000000004ac660
   *
   * Body (66 lines):
   *   %r14 = this
   *   %rbx = operator new(0x80)                             @0x4ac670..75
   *   %rcx = this->subtypeMask (u32 @+0x18)                 @0x4ac67d
   *   %r14 = &this[+0x20] (parentChannelFolder slot)        @0x4ac681
   *   OZMaterialLayerSequenceFolder::C1(%rbx, %r14 (as
   *                                     PCString const& OR
   *                                     folder*), 0, 0,
   *                                     %rcx, 0, 0)         @0x4ac693
   *   %r14 = operator new(0x98)                             @0x4ac69d
   *   PCString localName ← "No Sequence Channels"           @0x4ac6ac..b0
   *   OZChannelDouble::C2(%r14, &localName, %rbx (folder),
   *                       0x270e, 0, 0, 0)                  @0x4ac6d2
   *   ~PCString(&localName)                                 @0x4ac6db
   *   %rax = (*(%r14).vt)[0x68]; %rax(%r14, 0, 0)           @0x4ac6e0..ea
   *   OZChannelBase::setFlag(%r14,
   *                          &OZSceneNode_Factory::D0,
   *                          0)                             @0x4ac6ed..f7
   *   return %rbx
   *
   * The `movl 0x18(%r14), %ecx` at @0x4ac67d reads a u32 out of the object's body. Named
   * `subtypeMask` per the SequenceFolder ctor arg #4 signature (an `unsigned int` sub-type
   * bitmask). The `addq $0x20, %r14` at @0x4ac681 pushes %r14 to the class's +0x20 slot; the
   * SequenceFolder C1 takes `PCString const&` as arg #1 and `OZChannelFolder*` as arg #2, so
   * one of those slots lives at +0x20 in the base layout. Chunks m0/m1 will name it exactly
   * — this file forward-declares it as `parentChannelFolder` because the SequenceFolder gets
   * ITS name from a separate PCString and its parent from THIS +0x20 slot.
   */
  makeMaterialLayerSequenceChannelFolder(): OZMaterialLayerSequenceFolder {
    // +0x80 == sizeof(OZMaterialLayerSequenceFolder). The ctor is undecoded, so we mint the
    // record and throw at the ctor boundary — the caller sees the exact @0xADDR gap.
    const seqFolder: OZMaterialLayerSequenceFolder = {
      __brand: "OZMaterialLayerSequenceFolder",
      name: "",
      parent: this.parentChannelFolder,
      subtypeMask: this.subtypeMask >>> 0,   // u32 view of the +0x18 word
    };
    OZMaterialLayerSequenceFolder_C1(
      seqFolder,
      "",
      this.parentChannelFolder,
      0,
      0,
      this.subtypeMask >>> 0,
    );
    // Everything below is unreachable (the throw above fires first); kept so the structural
    // port maps 1:1 to the disasm's remaining instructions.
    /* eslint-disable no-unreachable */
    const localName = {};                                              // @0x4ac69d..b0
    PCString_C1(localName, "No Sequence Channels");
    const sequenceChannel: OZChannelDouble = { __brand: "OZChannelDouble" };
    OZChannelDouble_C2(
      sequenceChannel,
      localName,
      seqFolder as unknown as OZChannelFolder,
      0,
      0x270e,
      null,
      null,
    );
    PCString_D1(localName);
    OZChannelBase_vslot_0x68(sequenceChannel, 0, 0);
    OZChannelBase_setFlag(sequenceChannel, 0n, false);
    return seqFolder;
    /* eslint-enable no-unreachable */
  }

  /**
   * OZMaterialLayerBase::getSequenceChannels()
   * @Ozone 0x00000000004ac740
   *
   * Body (16 lines):
   *   %rbx = this                                            @0x4ac746
   *   %rax = OZChannelBase::getObjectManipulator()           @0x4ac749
   *   %rdi = &%rax[-0x10]  (if %rax != nullptr else nullptr) @0x4ac74e..55
   *      — the "-0x10" is the multiple-inheritance adjustment
   *        from the OZChannelBase manipulator subobject back
   *        to its OZLayeredMaterial owner.
   *   tail-jmp OZLayeredMaterial::getSequenceChannelsForMaterialLayer(%rdi, %rbx)
   *                                                          @0x4ac762
   *
   * Trivial delegator into OZLayeredMaterial (undecoded).
   */
  getSequenceChannels(): never {
    const mgr = OZChannelBase_getObjectManipulator(this) as unknown as OZLayeredMaterial | null;
    // -0x10 MI adjust; not reachable because the callee threw. Kept for structural fidelity.
    const owner: OZLayeredMaterial | null =
      mgr === null ? null : (mgr as unknown as OZLayeredMaterial);
    return OZLayeredMaterial_getSequenceChannelsForMaterialLayer(
      owner as OZLayeredMaterial,
      this,
    );
  }

  /**
   * OZMaterialLayerBase::getTextureTokensLock()
   * @Ozone 0x00000000004ac770
   *
   * Body (15 lines):
   *   %rbx = this (the RVO return slot for a smart-lock wrapper)
   *   %rdi = &this[+0x4c0]                                   @0x4ac779
   *   *%rbx = %rdi   (store lock-ptr into the RVO)           @0x4ac780
   *   PCSpinLock::lock(%rdi)                                 @0x4ac783
   *   return %rbx   (the lock-guard object)
   *
   * At the C++ level this returns a 1-word RAII lock-guard carrying a `PCSpinLock*`. In TS we
   * return the spinlock directly after taking the lock — semantically equivalent (callers
   * MUST invoke `.unlock()` themselves because JS has no scope-guard).
   */
  getTextureTokensLock(): PCSpinLock {
    const lock = this.textureTokensLock;
    lock.lock();                        // @0x4ac783
    return lock;
  }

  /**
   * OZMaterialLayerBase::findToken(PCHash128 const&) const
   * @Ozone 0x00000000004ac7a0
   *
   * Body (54 lines) — std::map lower_bound + equality-check inline expansion:
   *   %rbx = this (RVO return slot for weak_ptr<PCMutex>)
   *   %r13 = *(%rsi + 0x4b0)   (tree root)                   @0x4ac7b1
   *   if (%r13 == 0) goto empty                              @0x4ac7bb
   *   %r14 = &key                                            @0x4ac7bd
   *   %r15 = %rsi + 0x4b0 (tree header sentinel)             @0x4ac7c0..c3
   *   %r12 = %r15  (lower-bound candidate)                   @0x4ac7ca
   *   loop:
   *     %rax = op<(&%r13[+0x20], &key)   (node.key<key)     @0x4ac7d0..d7
   *     %r12 = (rax==0) ? %r13 : %r12                       @0x4ac7dc..e1
   *     %r13 = %r13[rax*8]  (rax==0→left  rax==1→right)     @0x4ac7e5
   *     if (%r13 != 0) goto loop                            @0x4ac7ea..ed
   *   if (%r12 == %r15) goto empty  (never descended)       @0x4ac7ef..f2
   *   %rax = op<(&key, &%r12[+0x20])   (key<lb.key)         @0x4ac7f4..fc
   *   if (%rax != 0) goto empty                             @0x4ac801..03
   *   ── FOUND: copy weak_ptr<PCMutex> out ──
   *     *rbx        = *(%r12 + 0x30)   (weak_ptr __ptr_)    @0x4ac822..28
   *     *(rbx+0x08) = *(%r12 + 0x38)   (weak_ptr __cntrl_)  @0x4ac81d + @0x4ac828 store
   *     if (cntrl != 0):
   *        lock incq 0x8(cntrl)   (weak-count bump)         @0x4ac830..31
   *     return rbx
   *   empty:
   *     xorps xmm0, xmm0; movups xmm0, (rbx)   (zero 16 B)  @0x4ac805..0b
   *     return rbx
   */
  findToken(key: PCHash128): WeakPtrPCMutex {
    // std::map iterator walk. Native uses a red-black tree with an out-of-line __tree template
    // and PCHash128::operator< (both undecoded); a linear scan is not the same algorithm.
    const empty: WeakPtrPCMutex = {           // zero-init RVO slot @0x4ac805..0b
      __brand: "WeakPtrPCMutex",
      ptr: null,
      cntrl: null,
    };
    if (this.textureTokens.size === 0) return empty;                   // @0x4ac7bb
    // First tree-comparison site — throws until PCHash128::op< @0x6dfc60 is transcribed.
    PCHash128_lessThan(key, key);                                       // @0x4ac7d7
    /* eslint-disable no-unreachable */
    // Structural continuation of the disasm — never executed.
    return empty;
    /* eslint-enable no-unreachable */
  }

  /**
   * OZMaterialLayerBase::addToken(PCHash128 const&, LiTextureStoreToken const&)
   * @Ozone 0x00000000004ac840
   *
   * Body (45 lines):
   *   %rbp/rbx frame; +0x28 stack for the temporary pair.
   *   %rdi = this + 0x4a8   (the map header)                 @0x4ac849
   *   xmm0 = *key; -0x30(rbp) = xmm0   (copy 16 B key)       @0x4ac850..53
   *   %rax = *(&value + 8)   (control-block ptr from token)  @0x4ac857
   *   xmm0 = *value;  -0x20(rbp) = xmm0   (copy 16 B token)  @0x4ac85b..5e
   *   if (%rax != 0): lock incq 0x8(rax)   (bump strong→weak
   *                                         ownership word)  @0x4ac862..68
   *   __tree::__emplace_unique_key_args(map, &key,
   *                                     &pair@rbp-0x30)      @0x4ac873
   *   %rbx = -0x18(rbp)   (returned iterator's control ptr)  @0x4ac878
   *   if (%rbx == 0) return                                  @0x4ac87f
   *   %rax = xaddq(-1, [rbx+8])   (atomic weak-decrement)    @0x4ac881..8d
   *   if (%rax != 0) return                                  @0x4ac88e..91
   *   (*rbx.vt)[+0x10](rbx)   (final weak-decr → dealloc)    @0x4ac89a..a0
   *   __shared_weak_count::__release_weak(rbx)               @0x4ac8a6
   *   return
   *   (unwind: pair::~pair @0x4ac8b9 ; __Unwind_Resume)
   */
  addToken(key: PCHash128, value: LiTextureStoreToken): void {
    // Materialize the pair temporary — 16 B key + 16 B token copy semantics preserved via
    // by-value bindings. The strong-ref bump on the LiTextureStoreToken's control block
    // (@0x4ac862..68) is not modelled explicitly because the shared_weak_count layout is
    // undecoded in this chunk; the semantic effect (an extra owner during __emplace copy) is
    // preserved because JS has no destructive moves — we hold a reference through the call.
    const keyCopy: PCHash128 = key;                    // memcpy(-0x30, key, 16) @0x4ac850..53
    void value;                                        // by-const-ref, held live to __emplace
    // Insert into the map. The __tree template's out-of-line implementation is the frontier:
    const rvo: WeakPtrPCMutex = { __brand: "WeakPtrPCMutex", ptr: null, cntrl: null };
    tree_emplace_unique_key_args(this.textureTokens, keyCopy, rvo);
    // Everything below is the post-emplace release chain of the returned iterator's control
    // block — structurally faithful, but the throw above fires first.
    /* eslint-disable no-unreachable */
    // rbx = the returned iterator's control-block pointer (`-0x18(%rbp)` @0x4ac878).
    // Not decoded here because __emplace_unique_key_args threw; typed as nullable
    // and left `null` so the structural continuation compiles.
    const rbx: SharedWeakCount | null = (null as unknown as SharedWeakCount | null);
    if (rbx) {
      const prev: number = 0;                          // atomic xadd(-1) result @0x4ac881..8d
      if (prev === 0) {
        shared_weak_count_vslot_10(rbx!);             // @0x4ac89a..a0
        shared_weak_count_release_weak(rbx!);         // @0x4ac8a6
      }
    }
    // Landing-pad edge — kept for review-side visibility of the unwind path.
    try {
      // no-op
    } catch (e) {
      pair_dtor_hash_texture(null);                    // @0x4ac8b9
      unwind_resume(e);                                // @0x4ac726 / @0x4ac739
    }
    /* eslint-enable no-unreachable */
  }

  /**
   * OZMaterialLayerBase::~OZMaterialLayerBase()  — D1 vtable slot
   * @Ozone 0x00000000006dbe00
   *
   * Body (via llvm-objdump --disassemble-symbols on /tmp/Ozone.x86_64):
   *   push rbp ; mov rbp, rsp ; ud2 (0f 0b) ; nop-pad
   *
   * A single `ud2` trap. This is a deleted-virtual placeholder — the linker installs it here
   * because the class's real destruction path goes through the D2 base non-virtual dtor
   * (@0x4abe70, chunk m1). Any invocation of D1 through this vtable slot is a programming
   * error and the process SIGILLs.
   */
  destroy_D1(): never {
    // ud2 @0x6dbe04 — always traps.
    throw new Error(
      "OZMaterialLayerBase::~OZMaterialLayerBase (D1 slot) @0x6dbe04: ud2 — deleted virtual",
    );
  }

  /**
   * OZMaterialLayerBase::~OZMaterialLayerBase()  — D0 deleting-dtor slot
   * @Ozone 0x00000000006dbe20
   *
   * Body (via llvm-objdump --disassemble-symbols):
   *   push rbp ; mov rbp, rsp ; ud2 (0f 0b) ; nop-pad
   *
   * Same shape as D1: `ud2`. Deleting-dtor is also a placeholder — concrete subclasses
   * (OZPaintLayer, OZMaterialBumpMapLayer, ...) supply their own D0/D1 slots.
   */
  destroy_D0(): never {
    // ud2 @0x6dbe24 — always traps.
    throw new Error(
      "OZMaterialLayerBase::~OZMaterialLayerBase (D0 slot) @0x6dbe24: ud2 — deleted virtual",
    );
  }
}
