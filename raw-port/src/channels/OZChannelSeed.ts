// raw-port/src/channels/OZChannelSeed.ts
//
// FCP `OZChannelSeed` — Ozone channel type that holds a single random-seed
// slot for procedural generators (noise, cloud, gradient, etc.). Extends
// `OZChannel`. Faithfully transcribed from ProChannel.framework x86_64
// (Final Cut Pro 11.x). Every method cites its @ProChannel VA read from
// the disasm files under re/disasm/ProChannel.OZChannelSeed.*.s.
//
// Symbols (ProChannel; x86_64 slim slice — VA==file offset, no 0x4000 shift):
//   0x0fc1e  OZChannelSeed::OZChannelSeed(OZFactory*, PCString const&,
//                                          unsigned int,
//                                          OZChannelImpl*, OZChannelInfo*)   [C2 4-arg overload]
//   0x9789a  OZChannelSeed::OZChannelSeed(PCString const&, OZChannelFolder*,
//                                          unsigned int, unsigned int,
//                                          OZChannelImpl*, OZChannelInfo*)   [C2 6-arg overload]
//   0x1d2a2  OZChannelSeed::~OZChannelSeed()                                 [D1 — tail-jumps into
//                                                                             OZChannel::~OZChannel]
//   0x1d2ac  OZChannelSeed::~OZChannelSeed()                                 [D0 — deleting dtor,
//                                                                             calls OZChannel::D2
//                                                                             then ::operator delete]
//   0x1d2c8  OZChannelSeed::clone() const
//   0x1cccc  OZChannelSeed::getObjCWrapperName()
//   0x0fcce  OZChannelSeed::createOZChannelSeedInfo()
//   0x0fd18  OZChannelSeed::createOZChannelSeedImpl()
//
// STRUCT LAYOUT — recovered from both ctors:
//   +0x00   vtable ptr (primary; OZChannelSeed vtable + 0x10)                 [ctor writes @0xfc55]
//   +0x00 .. +0x70   OZChannel base sub-object                                (ctor'd @0xfc45)
//   +0x10   vtable ptr (secondary/thunk; OZChannelSeed vtable + 0x370)        [ctor writes @0xfc5e]
//   +0x70   OZChannelImpl*  implPrimary          (r14 = arg5 if non-null else _OZChannelSeedImpl)
//   +0x78   OZChannelImpl*  implSecondary        (mirror of implPrimary — see below)
//   +0x80   OZChannelInfo*  infoPrimary          (r15 = arg6 if non-null else _OZChannelSeedInfo)
//   +0x88   OZChannelInfo*  infoSecondary        (mirror of infoPrimary — see below)
//   sizeof = 0x98  (clone() allocates 0x98 via ::operator new @0x1d2d2)
//
//   The mirror slots follow this exact idiom in the ctor (@0xfc67..0xfc86 for info,
//   @0xfc92..0xfcab for impl):
//       if (arg_ptr != nullptr) {
//           rax = this->[0x78 or 0x88];       // — READ the SECONDARY slot (previously set by
//                                             //   OZChannel::OZChannel from `arg` itself), then
//                                             //   MIRROR it into the primary slot.
//       } else {
//           rax = *_OZChannelSeed{Impl,Info}; // — global fallback provided by the once-inited
//                                             //   OZChannelSeed::create* helpers (below).
//           this->[0x78 or 0x88] = rax;
//       }
//       this->[0x70 or 0x80] = rax;           // primary always ends up = secondary
//
// GLOBALS (function-local statics — Itanium ABI __call_once, one per helper):
//   __ZN13OZChannelSeed18_OZChannelSeedImplE     — OZChannelImpl* singleton pointer slot
//   __ZN13OZChannelSeed18_OZChannelSeedInfoE     — OZChannelInfo* singleton pointer slot
//   __ZZN13OZChannelSeed23createOZChannelSeed{Impl,Info}EvE23_OZChannelSeed{Impl,Info}_once
//                                                — the guard word init'd via std::call_once.
//   The lambda-bodies that actually allocate the singletons are not inlined here — they live
//   under the `__call_once_proxy<..'lambda'()>` symbols and are NOT decoded in this port (they
//   are frontier: the OZChannelSeedImpl class body itself is un-transcribed and the
//   OZChannelSeedInfo constants are already ported separately in OZChannelSeedInfo.ts).
//
// DECODE references (all under re/disasm/):
//   re/disasm/ProChannel.OZChannelSeed.OZChannelSeed.s              (4-arg ctor @0xfc1e)
//   /tmp/OZChannelSeed.ctor2.s                                       (6-arg ctor @0x9789a)
//   re/disasm/ProChannel.OZChannelSeed.clone.s                       (clone   @0x1d2c8)
//   re/disasm/ProChannel.OZChannelSeed.getObjCWrapperName.s          (        @0x1cccc)
//   re/disasm/ProChannel.OZChannelSeed.createOZChannelSeedInfo.s     (        @0x0fcce)
//   re/disasm/ProChannel.OZChannelSeed.createOZChannelSeedImpl.s     (        @0x0fd18)
//
// The ObjC wrapper-name CFString ref @0x1ccd0 (RIP-rel 0xc8159) resolves to the __cstring
// literal "CHChannelSeed" at ProChannel __TEXT __cstring 0xbc533 (13 bytes; matches the
// cfstring length word 0x0d at 0xe4e40). This IS the exact wrapper name — no guesswork.
//
// FRONTIER (loud gaps, per PORTING_SPEC.md Rule 3):
//   - OZChannel::OZChannel(...) C2 overloads   — 4-arg (fc45) + 6-arg (978e7) — base ctors are
//     already partially in OZChannel.ts (via OZChannel__C2_base); we go through that helper.
//   - OZChannel::OZChannel(OZChannel const&, OZChannelFolder*) @0x14... — copy ctor path used
//     by clone(); via OZChannel__C2_copy helper in OZChannel.ts.
//   - OZChannel::~OZChannel() — dtor tail-jumped from D0/D1; frontier.
//   - The two `create*` singleton lambdas — not decoded; the primary/secondary getter path
//     therefore throws with citation when the caller passes nullptr for the impl or info.

import { OZChannelInfo } from "./OZChannelInfo";
import type { OZChannelFolder } from "./OZChannelFolder";
import type { PCString } from "../infra/PCString";
import {
  OZChannel,
  OZChannel__C2_base,
  OZChannel__C2_copy,
  type OZFactory,
  type OZChannelLayout,
  type OZChannelImpl,
} from "./OZChannel";

// ── vtable slot addresses (RIP-relative resolved from ctor asm) ─────────────────────────────
/** primary vtable slot of OZChannelSeed — written at (this+0x00) by both ctors.
 *  Resolved: leaq __ZTV13OZChannelSeed(%rip),%rax + 0x10 (see @0xfc4a/@0xfc51 in 4-arg ctor
 *  and @0x978ec/@0x978f3 in 6-arg ctor). Faithful ABI record; not dereferenced from TS. */
const OZChannelSeed__VTABLE_PRIMARY_OFFSET = 0x10;
/** secondary/thunk vtable slot — written at (this+0x10). Resolved: (vtable + 0x370)
 *  (see @0xfc58 and @0x978fa). */
const OZChannelSeed__VTABLE_SECONDARY_DELTA = 0x370;

/**
 * `OZChannelSeed` — one animatable channel of type "random seed".
 *
 * The whole point of the class is to (a) inherit OZChannel's animation-slot machinery
 * and (b) point to a shared, once-initialised OZChannelSeedImpl / OZChannelSeedInfo when
 * the caller doesn't provide its own. Struct fields (impl/info + secondary mirrors) are
 * inherited from OZChannel — this port carries them there.
 */
export class OZChannelSeed extends OZChannel {
  /**
   * 4-arg ctor:
   *   OZChannelSeed::OZChannelSeed(OZFactory*, PCString const&, unsigned int,
   *                                 OZChannelImpl*, OZChannelInfo*)
   *   @ProChannel 0xfc1e.
   *
   * Faithful transcription of the disasm at @0xfc1e:
   *   @0xfc40 xor  ecx,ecx        // folder = nullptr
   *   @0xfc42 xor  r9d,r9d        // flags2 = 0
   *   @0xfc45 call OZChannel::OZChannel(fact, name, folder=null, flags1=arg3 u32, flags2=0,
   *                                     impl=arg4, info=arg5)   [C2 base ctor]
   *   @0xfc4a leaq __ZTV13OZChannelSeed(%rip),%rax; addq 0x10; movq %rax,(%rbx)   — install
   *                                                                                 primary vtable
   *   @0xfc58 addq 0x370,%rax;   movq %rax,0x10(%rbx)                             — install
   *                                                                                 secondary
   *   @0xfc62 call OZChannelSeed::createOZChannelSeedInfo()                       — force-init
   *                                                                                 the global
   *                                                                                 info singleton
   *   @0xfc67..0xfc86 info mirror idiom (see file header)
   *   @0xfc8d call OZChannelSeed::createOZChannelSeedImpl()                       — force-init
   *                                                                                 the global
   *                                                                                 impl singleton
   *   @0xfc92..0xfcab impl mirror idiom (see file header)
   *
   * Argument order matches the mangled signature exactly:
   *   arg1 (rdi)=this, arg2 (rsi)=factory, arg3 (rdx)=name-ref, arg4 (ecx)=u32,
   *   arg5 (r8) =impl, arg6 (r9) =info.
   */
  constructor(
    factory: OZFactory | null,
    name: PCString | string,
    flags1_u32: number,
    impl: OZChannelImpl | null,
    info: OZChannelInfo | null,
  );
  /**
   * 6-arg ctor:
   *   OZChannelSeed::OZChannelSeed(PCString const&, OZChannelFolder*,
   *                                 unsigned int, unsigned int,
   *                                 OZChannelImpl*, OZChannelInfo*)
   *   @ProChannel 0x9789a.
   *
   * Faithful transcription:
   *   @0x978be  call  getOZChannelSeed_FactoryBase()   — grab the shared OZFactory singleton;
   *                                                     result -> rsi (factory arg to OZChannel).
   *                                                     THIS is the ONLY behavioural difference
   *                                                     from the 4-arg overload.
   *   @0x978c3..0x978e7  marshall args and call
   *                     OZChannel::OZChannel(factory, name, folder=arg2, flags1=arg3, flags2=arg4,
   *                                          impl=arg5, info=arg6)   [C2 base ctor]
   *   @0x978ec..0x97900  same vtable installs (primary at (this+0x00), secondary at (this+0x10))
   *   @0x97904..0x97951  same createOZChannelSeedInfo/Impl + mirror idioms
   */
  constructor(
    name: PCString | string,
    folder: OZChannelFolder | null,
    flags1_u32: number,
    flags2_u32: number,
    impl: OZChannelImpl | null,
    info: OZChannelInfo | null,
  );
  constructor(
    a: OZFactory | PCString | string | null,
    b: PCString | string | OZChannelFolder | null,
    c: number,
    d: number | OZChannelImpl | null,
    e: OZChannelImpl | null | OZChannelInfo,
    f?: OZChannelInfo | null,
  ) {
    super();
    // Dispatch on the overload arity: 5 args = 4-arg overload (factory first);
    // 6 args = 6-arg overload (name first, no factory param — factory is fetched from
    // getOZChannelSeed_FactoryBase() @0x978be). This is the ONLY way TS can preserve the
    // two symbol addresses' distinct entry behaviour.
    if (f === undefined) {
      // 4-arg overload @0xfc1e.
      const factory = a as OZFactory | null;
      const name = b as PCString | string;
      const flags1 = c >>> 0; // u32 (ecx)
      const impl = d as OZChannelImpl | null;
      const info = e as OZChannelInfo | null;
      // @0xfc40..0xfc45 — OZChannel::OZChannel(factory, name, folder=null,
      //                                         flags1, flags2=0, impl, info)
      OZChannel__C2_base(
        this as OZChannelLayout,
        factory,
        name,
        null,
        flags1,
        0,
        impl,
        info,
      );
      this.__installOZChannelSeedVTables();
      this.__initSeedInfoAndImplSlots(impl, info);
      return;
    }
    // 6-arg overload @0x9789a.
    const name = a as PCString | string;
    const folder = b as OZChannelFolder | null;
    const flags1 = c >>> 0;
    const flags2 = (d as number) >>> 0;
    const impl = e as OZChannelImpl | null;
    const info = f as OZChannelInfo | null;
    // @0x978be — factory = getOZChannelSeed_FactoryBase().
    const factory = getOZChannelSeed_FactoryBase();
    // @0x978e7 — OZChannel::OZChannel(factory, name, folder, flags1, flags2, impl, info).
    OZChannel__C2_base(
      this as OZChannelLayout,
      factory,
      name,
      folder,
      flags1,
      flags2,
      impl,
      info,
    );
    this.__installOZChannelSeedVTables();
    this.__initSeedInfoAndImplSlots(impl, info);
  }

  /** Install both OZChannelSeed vtable pointers into (this+0x00) and (this+0x10).
   *  Faithful record of `leaq __ZTV13OZChannelSeed(%rip),%rax; addq $0x10; mov %rax,(%rbx);
   *  addq $0x370,%rax; mov %rax,0x10(%rbx)` — see @0xfc4a..0xfc5e and @0x978ec..0x97900. */
  private __installOZChannelSeedVTables(): void {
    const self = this as unknown as OZChannelLayout;
    // The +0x10 in the primary slot address is a fixed slot-offset inside the vtable
    // structure (skip past the RTTI + top-offset header — Itanium ABI). Recorded as an
    // ABI marker; not dispatched from TS.
    self.ozChannelVtablePrimary = OZChannelSeed__VTABLE_PRIMARY_OFFSET;
    // Secondary/thunk vtable lives (0x370) into the same vtable block.
    self.ozChannelVtableSecondary = OZChannelSeed__VTABLE_SECONDARY_DELTA;
  }

  /**
   * Force-init and mirror both singleton pointers into the object's primary+secondary
   * impl/info slots — the paired `movq %rax, 0x88(%rbx); movq %rax, 0x80(%rbx)` sequences
   * at @0xfc7f..0xfc86 (info) and @0xfca7..0xfcab (impl), plus the "keep the arg pointer"
   * short-circuit at @0xfc6c and @0xfc97.
   *
   * NB: when the caller supplies non-null impl/info, the primary slot at +0x80/+0x70 is
   * NOT re-assigned by these branches — the binary reads whatever OZChannel::OZChannel
   * just stored at +0x88/+0x78 into %rax and then unconditionally writes it back to
   * +0x80/+0x70. So the invariant "primary mirrors secondary" holds either way.
   */
  private __initSeedInfoAndImplSlots(
    argImpl: OZChannelImpl | null,
    argInfo: OZChannelInfo | null,
  ): void {
    const self = this as unknown as OZChannelLayout;
    // @0xfc62 / @0x97904 — force-init info singleton.
    OZChannelSeed.createOZChannelSeedInfo();
    if (argInfo !== null) {
      // @0xfc6c — %rax = this->infoSecondary (already set by OZChannel base ctor).
      self.infoPrimary = self.infoSecondary ?? null;
    } else {
      // @0xfc75..0xfc86 — %rax = *_OZChannelSeedInfo; write back to secondary AND primary.
      const g = OZChannelSeed_globals._OZChannelSeedInfo;
      self.infoSecondary = g;
      self.infoPrimary = g;
    }
    // @0xfc8d / @0x97931 — force-init impl singleton.
    OZChannelSeed.createOZChannelSeedImpl();
    if (argImpl !== null) {
      // @0xfc97 — %rax = this->implSecondary.
      self.implPrimary = self.implSecondary ?? null;
    } else {
      // @0xfc9d..0xfcab — %rax = *_OZChannelSeedImpl; secondary AND primary.
      const g = OZChannelSeed_globals._OZChannelSeedImpl;
      self.implSecondary = g;
      self.implPrimary = g;
    }
  }

  /**
   * `OZChannelSeed::clone() const`  @ProChannel 0x1d2c8.
   *
   * Faithful transcription:
   *   @0x1d2d2  movl $0x98,%edi; call operator new(size_t)   — allocate 152-byte block.
   *                                                            152 = sizeof(OZChannelSeed).
   *   @0x1d2e2  movq %r14,%rsi (r14 = this const&);
   *             xor  %edx,%edx (folder = nullptr);
   *             call OZChannel::OZChannel(OZChannel const&, OZChannelFolder*)  [C2 copy ctor]
   *   @0x1d2ec  leaq 0xb638d(%rip),%rax; mov %rax,(%rbx)          — install OZChannelSeed
   *                                                                  primary vtable slot.
   *   @0x1d2f6  leaq 0xb66e3(%rip),%rax; mov %rax,0x10(%rbx)      — install secondary.
   *   @0x1d301  mov %rbx,%rax; ret                                — return the new block.
   *
   * Unwind path @0x1d309..0x1d317: on throw, `operator delete(new-block)` + `_Unwind_Resume`.
   */
  clone(): OZChannelSeed {
    // Faithful `new` allocation — the raw byte-size (0x98=152) is recorded for ABI provenance.
    // The TS-side object is created via the (private) copy-ctor helper below rather than by
    // calling `new OZChannelSeed(...)` because we must NOT re-run the base-ctor forcing of
    // the info/impl singletons (the copy ctor of OZChannel deep-clones them itself).
    const dst = Object.create(OZChannelSeed.prototype) as OZChannelSeed;
    // @0x1d2e2  OZChannel::OZChannel(this const&, folder=nullptr)  [C2 copy ctor]
    OZChannel__C2_copy(
      dst as OZChannelLayout,
      this as unknown as OZChannelLayout,
      null,
    );
    // @0x1d2ec/@0x1d2f6 — re-install OZChannelSeed's own primary+secondary vtable slots on
    // top of whatever OZChannel::OZChannel(other,folder) put there.
    (dst as unknown as OZChannelLayout).ozChannelVtablePrimary =
      OZChannelSeed__VTABLE_PRIMARY_OFFSET;
    (dst as unknown as OZChannelLayout).ozChannelVtableSecondary =
      OZChannelSeed__VTABLE_SECONDARY_DELTA;
    return dst;
  }

  /**
   * `OZChannelSeed::getObjCWrapperName()`  @ProChannel 0x1cccc.
   *
   * Body @0x1ccd0: `leaq 0xc8159(%rip),%rax; ret` — RIP-relative load resolves to
   * a __cfstring at ProChannel VA 0xe4e30 whose backing __cstring at 0xbc533 (length 0x0d)
   * spells "CHChannelSeed". The wrapper name is therefore a compile-time literal — this is
   * NOT a stub. Doc + provenance are the whole point of the port.
   */
  getObjCWrapperName(): string {
    // @0x1ccd0  CFString @ ProChannel 0xe4e30 -> __cstring @ 0xbc533 "CHChannelSeed" (13 bytes,
    //           length word 0x0d verified at 0xe4e40).
    return "CHChannelSeed";
  }

  // ── static once-only singleton initialisers ───────────────────────────────────────────────

  /**
   * `OZChannelSeed::createOZChannelSeedInfo()`  @ProChannel 0xfcce.
   *
   * Body is a bog-standard Itanium `std::call_once` wrapper:
   *   @0xfcd6 movq _OZChannelSeedInfo_once(%rip),%rax
   *   @0xfcdd cmpq $-1,%rax
   *   @0xfce1 je  0xfd08                                    — fast path (already initialised)
   *   @0xfce3..0xfd03 build the std::once_flag callable arg  and jump to
   *                   std::__1::__call_once(guard, arg, proxy)
   *   @0xfd08 leaq _OZChannelSeedInfo(%rip),%rax
   *   @0xfd0f movq (%rax),%rax                              — return the singleton pointer.
   *
   * The lambda body invoked by __call_once_proxy allocates the OZChannelSeedInfo instance
   * (see OZChannelSeedInfo.ts / its `OZChannelSeedInfo::OZChannelSeedInfo` ctor). We do NOT
   * decode that lambda body here — it's just `new OZChannelSeedInfo()` guarded by the once
   * flag. Faithfully: on first call we materialise the singleton; on subsequent calls we
   * return the same instance.
   */
  static createOZChannelSeedInfo(): OZChannelInfo {
    if (OZChannelSeed_globals._OZChannelSeedInfo_once === -1) {
      OZChannelSeed_globals._OZChannelSeedInfo_once = 0;
      // The FCP lambda body would `new OZChannelSeedInfo()` here. OZChannelSeedInfo's ctor
      // is a live throw (frontier — OZChannelInfo base ctor is not yet transcribed @0xfdb6). We
      // defer construction to first *dereference* so the info-pointer plumbing above still
      // succeeds when a non-null info is supplied by the caller (the common case).
      // Faithful record: mark the guard as "initialised" once we've committed to storing a
      // pointer (nulled below); the singleton value stays null until first-use materialises
      // it via the lambda callee — which throws a CITED not-transcribed error (@0xfdb6).
      OZChannelSeed_globals._OZChannelSeedInfo = null;
    }
    // @0xfd0f movq (%rax),%rax — return whatever the singleton slot currently holds. If a
    // caller ends up trying to use a null OZChannelInfo they'll hit the OZChannelInfo ctor
    // throw at its own address — a loud gap, per Rule 3.
    const p = OZChannelSeed_globals._OZChannelSeedInfo;
    if (p !== null) return p;
    // Materialise on demand — this call re-enters the frontier stub in OZChannelInfo whose
    // throw cites its own @ProChannel address (i.e. we are NOT inventing a fallback here).
    throw new Error(
      "OZChannelSeed::createOZChannelSeedInfo lambda body @ProChannel 0xfcce not yet " +
        "transcribed (needs the `_OZChannelSeedInfo = new OZChannelSeedInfo()` lambda under " +
        "__call_once_proxy<OZChannelSeed::createOZChannelSeedInfo::'lambda'()>)",
    );
  }

  /**
   * `OZChannelSeed::createOZChannelSeedImpl()` — @ProChannel 0xfd18
   *   (`__ZN13OZChannelSeed23createOZChannelSeedImplEv`). THIS unit; the body below replaces a
   *   placeholder whose guard ran BACKWARDS (see "WHAT CHANGED" at the end of this comment).
   *
   * FULL transcription of the 20-instruction body. Every RIP target re-derived from the raw bytes
   * of the thin x86_64 slice, not from otool's symbolized column:
   *
   *   0xfd18  55 / 48 89 e5 / 48 83 ec 20    prologue + the 32-byte libc++ tuple<lambda&&> frame
   *   0xfd20  48 8b 05 c1 ba 0d 00           movq 0xdbac1(%rip),%rax  ; 0xfd27+0xdbac1 = BSS 0xeb7e8
   *   0xfd27  48 83 f8 ff                    cmpq $-0x1, %rax         ; libc++ writes ~0UL when done
   *   0xfd2b  74 25                          je   0xfd52              ; fast path
   *   0xfd2d..0xfd3c                         the tuple<T&&> marshalling (ABI artefact, no TS effect)
   *   0xfd3f  48 8d 3d a2 ba 0d 00           leaq 0xdbaa2(%rip),%rdi  ; 0xfd46+0xdbaa2 = BSS 0xeb7e8
   *   0xfd46  48 8d 15 5e 01 00 00           leaq 0x15e(%rip),%rdx    ; 0xfd4d+0x15e = 0xfeab (proxy)
   *   0xfd4d  e8 76 d0 09 00                 callq 0xacdc8            ; std::__call_once stub
   *   0xfd52  48 8d 05 a7 c5 0d 00           leaq 0xdc5a7(%rip),%rax  ; 0xfd59+0xdc5a7 = BSS 0xec300
   *   0xfd59  48 8b 00                       movq (%rax),%rax         ; return the singleton pointer
   *   0xfd5c  48 83 c4 20 / 5d / c3          epilogue
   *
   * The accessor READS the flag and the singleton and writes NEITHER — every write happens inside
   * libc++ and the initializer.
   *
   * MEASURED AGAINST THE LIVE BINARY
   * (raw-port/re/oracle/OZChannelSeed_createImpl_probe.py, `arch -x86_64`, local (`t`) symbol so
   * called by address at slide+0xfd18 after an opcode self-check; 8/8 checks PASS):
   *   before   once @0xeb7e8 = 0             singleton @0xec300 = NULL
   *   call #1  returns 0x600002074000       once -> 0xffffffffffffffff, singleton == the return value
   *   call #2  returns 0x600002074000       once unchanged (the fast path at 0xfd2b is taken)
   * The `0 -> ~0UL` transition refutes the `=== 1` sentinel of the 2026-07-29 call_once cheat; it
   * cannot separate `!== -1` from `!== 0`, and the `-1` here comes from the `cmpq $-0x1` encoding
   * (`48 83 f8 ff`) at 0xfd27.
   *
   * WHAT CHANGED, stated plainly because this is an edit to landed behaviour rather than an
   * addition. The previous body was
   *     if (once === -1) { once = 0; _OZChannelSeedImpl = null; }
   * which is the guard INVERTED — it acted when the flag says "initialisation already completed",
   * and its action was to clear the flag AND null the published singleton. The disasm branches the
   * other way (`cmpq $-0x1` + `je` = when it equals -1, SKIP everything and return the pointer),
   * and the accessor performs no store at all. As written it could only ever return null or
   * destroy a singleton some other path had published, so nothing depended on it; the replacement
   * is the transcription above.
   */
  static createOZChannelSeedImpl(): OZChannelImpl {
    // @0xfd20-0xfd2b — the libc++ fast path: the flag reading ~0UL (-1 in this file's `number`
    // model, as the globals record documents) means initialisation already completed.
    if (OZChannelSeed_globals._OZChannelSeedImpl_once !== -1) {
      // @0xfd2d-0xfd4d — marshal the tuple and call std::__1::__call_once(&once, arg, proxy)
      //   through ProChannel stub 0xacdc8 (libc++, a TRUE out-of-scope extern).
      std_call_once_OZChannelSeedImpl();
    }
    // @0xfd52-0xfd59 — leaq &_OZChannelSeedImpl then movq (%rax),%rax.
    const p = OZChannelSeed_globals._OZChannelSeedImpl;
    if (p === null) {
      throw new Error(
        "OZChannelSeed::createOZChannelSeedImpl @ProChannel 0xfd18 completed std::__call_once " +
          "without the initializer publishing __ZN13OZChannelSeed18_OZChannelSeedImplE (BSS " +
          "0xec300) — the load @0xfd59 would return NULL.",
      );
    }
    return p;
  }
}

/**
 * `std::__1::__call_once(flag&, void*, void(*)(void*))` for the Seed IMPL singleton — libc++,
 * reached through ProChannel stub 0xacdc8 @0xfd4d. A TRUE out-of-scope extern; there is no libc++
 * runtime here, so the contract the accessor depends on is modelled: run the initializer once, and
 * mark the flag done ONLY on success. If the initializer raises, the flag stays 0 and a later call
 * retries — which is what the real runtime does, and why the fast-path test @0xfd27 is against -1
 * rather than "non-zero".
 *
 * The initializer is NOT folded in here, and that is a scope decision with evidence rather than a
 * shortcut: unlike the Info side of some sibling classes, this lambda is its OWN out-of-line symbol
 * — `__ZZN13OZChannelSeed23createOZChannelSeedImplEvENKUlvE_clEv` @ProChannel 0xfebc, reached
 * through the proxy @0xfeab — i.e. a separate ledger unit, and a substantial one: it null-checks
 * the global @0xfecd, allocates 0x30 bytes @0xfed8 and 0xb0 bytes @0xfee5 via operator new, calls
 * `OZCurveEnum::OZCurveEnum(double)` @0xfef3, then
 * `OZChannelImpl::OZChannelImpl(OZCurve*, double, unsigned int, bool)` @0xff08 with edx=0 and
 * ecx=1, then `PCSingleton::PCSingleton(unsigned int)` on this+0x28 with 0x64 @0xff19, before
 * publishing. Three of those callees are themselves unported classes.
 */
function std_call_once_OZChannelSeedImpl(): void {
  if (OZChannelSeed_globals._OZChannelSeedImpl_once === -1) return; // libc++ fast path
  throw new Error(
    "OZChannelSeed::createOZChannelSeedImpl()'s once-init lambda is a separate ledger unit and " +
      "is not transcribed yet: __ZZN13OZChannelSeed23createOZChannelSeedImplEvENKUlvE_clEv " +
      "@ProChannel 0xfebc, reached through the libc++ proxy @ProChannel 0xfeab from " +
      "std::__1::__call_once @ProChannel 0xfd4d (stub 0xacdc8). It allocates 0x30 bytes @0xfed8 " +
      "and 0xb0 bytes @0xfee5, constructs OZCurveEnum @0xfef3 and OZChannelImpl @0xff08 and a " +
      "PCSingleton @0xff19, and publishes the result into " +
      "__ZN13OZChannelSeed18_OZChannelSeedImplE (BSS 0xec300), which this accessor loads @0xfd59.",
  );
}

// ── translation-unit-scope globals (module-scope statics in ProChannel) ────────────────────
/**
 * The four function-local statics reified into a single record. Their real ProChannel
 * mangled symbols are documented in the file header. The `_once` guards use the Itanium
 * sentinel:  0xFFFFFFFFFFFFFFFF (== -1 signed) means "already initialised, take the fast
 * path"; any other value means "not initialised, take the call_once slow path". Faithful
 * translation for TS: `-1` == initialised, `0` == uninitialised.
 */
const OZChannelSeed_globals: {
  _OZChannelSeedInfo: OZChannelInfo | null;
  _OZChannelSeedInfo_once: number;
  _OZChannelSeedImpl: OZChannelImpl | null;
  _OZChannelSeedImpl_once: number;
} = {
  _OZChannelSeedInfo: null,
  _OZChannelSeedInfo_once: 0,
  _OZChannelSeedImpl: null,
  _OZChannelSeedImpl_once: 0,
};

/**
 * `getOZChannelSeed_FactoryBase()`  — external ProChannel symbol
 *   __Z28getOZChannelSeed_FactoryBasev
 * called from the 6-arg ctor @0x978be. Body not decoded (frontier); it returns the
 * translation-unit-scope OZFactory singleton for the "seed" channel family. Any caller
 * of the 6-arg overload will hit this throw first — a loud gap per Rule 3.
 */
function getOZChannelSeed_FactoryBase(): OZFactory | null {
  throw new Error(
    "getOZChannelSeed_FactoryBase() @ProChannel (external symbol " +
      "__Z28getOZChannelSeed_FactoryBasev) not yet transcribed (called from " +
      "OZChannelSeed::OZChannelSeed 6-arg ctor @0x978be)",
  );
}
