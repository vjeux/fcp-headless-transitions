// FFOZMediaRefChannel.m1.ts — raw transcription of Flexo `FFOZMediaRefChannel`
// (methods [20..28) of 28 — CHUNK 1 of a 2-chunk port: setAnchoredObject / anchoredObject / the
// serialization family writeHeader/writeBody/parseBegin/parseElement/parseEnd + calcHashForState).
//
// FFOZMediaRefChannel is Flexo's OZChannel subclass that ties a video/audio media reference to a
// timeline anchor. Its persistent state lives at:
//   +0xa0   u32 flags       (bit 0x1 = "asset resolvable", 0x2 = "resolvable-check-enabled",
//                            0x80 = "no-hash-contribution" — see calcHashForState.)
//   +0xa8   16-byte CMTime  (parseBegin resets to _kCMTimeZero at @0x21d67e-@0x21d681)
//   +0xb8   int64   CMTime .flags/tag (parseBegin @0x21d68c copies +0x10 from _kCMTimeZero)
//   +0xa4   u32 secondary count/version (parseBegin resets to 0 @0x21d693)
//   +0xc0   16-byte CMTime  (parseBegin resets — start of the "state end time" pair)
//   +0xd0   int64   CMTime .flags/tag        (parseBegin @0x21d6a7-@0x21d6ab)
//   +0xd8   PCString     (parseBegin calls PCString::clear on it @0x21d6b9)
//   +0x38   FFAnchoredObject* or a compressed-pointer u64 (writeHeader gates the anchor branch on
//                                                          `movq 0x38(%r14),%r14; testq %r14`
//                                                          @0x21d1d4-@0x21d1db)
//   +0x98   ObjC wrapper backing pointer     (setAnchoredObject/anchoredObject use it via
//                                              _CHChannelWrapperForOZChannel(this, 0)).
//   +0x18   u32                              — a "kind/type" field passed to writeHeader as tag 0x6f
//                                              @0x21d1bf-@0x21d1ce.
//   +0x20   PCString name                    — written as tag 0x6e @0x21d1aa-@0x21d1b9.
//
// Provenance (Flexo framework, x86_64 slice; FAT offset 0x4000 == VA parity):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//   `nm -arch x86_64 | c++filt | grep FFOZMediaRefChannel`.
//
// Symbols ported in THIS chunk (m1, methods [20..28)):
//   @0x21d090  setAnchoredObject(FFAnchoredObject*, bool)
//                __ZN19FFOZMediaRefChannel17setAnchoredObjectEP16FFAnchoredObjectb
//   @0x21d150  anchoredObject() const
//                __ZNK19FFOZMediaRefChannel14anchoredObjectEv
//   @0x21d180  writeHeader(PCSerializerWriteStream&, bool)
//                __ZN19FFOZMediaRefChannel11writeHeaderER23PCSerializerWriteStreamb
//   @0x21d2e0  writeBody(PCSerializerWriteStream&, bool, bool, bool)
//                __ZN19FFOZMediaRefChannel9writeBodyER23PCSerializerWriteStreambbb
//   @0x21d660  parseBegin(PCSerializerReadStream&)
//                __ZN19FFOZMediaRefChannel10parseBeginER22PCSerializerReadStream
//   @0x21d760  parseElement(PCSerializerReadStream&, PCStreamElement&)
//                __ZN19FFOZMediaRefChannel12parseElementER22PCSerializerReadStreamR15PCStreamElement
//   @0x21d810  parseEnd(PCSerializerReadStream&)
//                __ZN19FFOZMediaRefChannel8parseEndER22PCSerializerReadStream
//   @0x21d840  calcHashForState(PCSerializerWriteStream&, CMTime const&)
//                __ZN19FFOZMediaRefChannel16calcHashForStateER23PCSerializerWriteStreamRK6CMTime
//
// The corresponding __ZThn16_... non-virtual thunks (@0x21d6e0 parseBegin thunk, @0x21d7b0
// parseElement thunk, @0x21d820 parseEnd thunk) do `addq $-0x10, %rdi` to rebase from the
// secondary sub-object vptr slot back to the primary, then tail-call the same body — they are
// vtable-only entry points and share the body listed above.

// -----------------------------------------------------------------------------
// External hooks (loud stubs per PORTING_SPEC Rule 3).
// -----------------------------------------------------------------------------

/**
 * OZChannelBase base subroutines called by this chunk.
 * @provenance Flexo stubs
 *   __ZN13OZChannelBase10parseBeginER22PCSerializerReadStream                (stub @0x1496246)
 *   __ZN13OZChannelBase12parseElementER22PCSerializerReadStreamR15PCStreamElement (stub @0x149624c)
 *   __ZN13OZChannelBase8parseEndER22PCSerializerReadStream                    (stub @0x149626a)
 *   __ZNK13OZChannelBase8testFlagEy                                            (stub @0x1496fcc)
 *   __ZN9OZChannel16calcHashForStateER23PCSerializerWriteStreamRK6CMTime      (stub @0x1496e94)
 */
export interface OZChannelBaseLike {
  parseBegin(_s: PCSerializerReadStreamRef): void;
  parseElement(_s: PCSerializerReadStreamRef, _el: PCStreamElementRef): void;
  parseEnd(_s: PCSerializerReadStreamRef): void;
  testFlag(_flag: bigint): boolean;
  /** OZChannel::calcHashForState — the base implementation this chunk tail-chains to. */
  calcHashForState(_ws: PCSerializerWriteStreamRef, _t: CMTimeRef): void;
}

/**
 * PCSerializerWriteStream — outbound serialization stream.
 * @provenance Flexo stubs
 *   __ZN23PCSerializerWriteStream9pushScopeEP7PCScope    (stub @0x149684c)
 *   plus a stack of vtable slots on the stream itself (writeHeader/writeBody dispatch through
 *   *0x10(%rax) / *0xd8(%rax) / *0x90(%rax) / *0xe8(%rax) / *0x68(%rax) — the stream's
 *   per-tag emit methods).
 */
export interface PCSerializerWriteStreamLike {
  pushScope(_scope: unknown): void;
  /** vtable *0x10 — the `beginTag(u32)` emitter (writeHeader @0x21d1a7, writeBody @0x21d35c). */
  emitBeginTag(_tag: number): void;
  /** vtable *0xd8 — the `writeString(u32, PCString const&)` emitter (writeHeader @0x21d1b9). */
  emitStringTag(_tag: number, _s: unknown): void;
  /** vtable *0x90 — the `writeU32(u32, u32)` emitter (writeHeader @0x21d1ce). */
  emitU32Tag(_tag: number, _v: number): void;
  /** vtable *0xe8 — the "should-emit-full-body" predicate (writeHeader @0x21d1e3, writeBody @0x21d2fe). */
  shouldEmitFullBody(): boolean;
  /** vtable *0x68 — the `writeString(PCString const&)` emitter (writeBody @0x21d369). */
  emitString(_s: unknown): void;
}

/**
 * PCSerializerReadStream — inbound serialization stream.
 * @provenance Flexo stubs
 *   __ZN22PCSerializerReadStream9pushScopeEP7PCScope    (stub @0x1496810)
 */
export interface PCSerializerReadStreamLike {
  pushScope(_scope: unknown): void;
}

/** PCStreamElement — one element in a PCSerializer* stream. Reads +0x8 as u32 tag. */
export interface PCStreamElementRef {
  /** @provenance parseElement @0x21d777 (`addl 0x8(%rbx),%eax`) — the element's tag. */
  readonly tagAt0x8: number;
}

/**
 * External free functions called by this chunk.
 * @provenance Flexo stub _CHChannelWrapperForOZChannel @0x1494f32 — bridges an OZChannel* into
 * its owning FCP-CH Objective-C wrapper. Called with (this, 0) from setAnchoredObject/anchoredObject/writeBody.
 */
export function CHChannelWrapperForOZChannel(_ch: unknown, _flag: number): unknown {
  throw new Error(
    "CHChannelWrapperForOZChannel @Flexo 0x1494f32 not yet transcribed — bridges an OZChannel* " +
      "into its FCP-CH ObjC wrapper (Objective-C boundary).",
  );
}

/**
 * PCString — the FCP string type. `PCString::clear()` @0x1496db6 called by parseBegin.
 * `PCString::set(CFStringRef)` @0x1496da4 called by writeBody. Not yet transcribed.
 */
export interface PCStringRef {
  /** @provenance Flexo stub __ZN8PCString5clearEv @0x1496db6 */
  clear(): void;
  /** @provenance Flexo stub __ZN8PCString3setEPK10__CFString @0x1496da4 */
  setFromCFString(_cf: unknown): void;
}

/**
 * FFAnchoredObject — Flexo's anchored-object handle. setAnchoredObject sets/clears it via ObjC
 * dispatch on the owning FCP-CH wrapper.
 */
export type FFAnchoredObjectRef = { readonly __ff_anchored_object: true };

/** CMTime — opaque here. */
export type CMTimeRef = { readonly __cm_time: true };

/**
 * `_kCMTimeZero` — the invalid/zero CMTime constant from CoreMedia. parseBegin reads its two
 * 8-byte halves (`movups (%rax),%xmm0` @0x21d67e loads value+timescale; `0x10(%rax)` @0x21d688
 * loads flags+epoch) and copies them into +0xa8 and +0xb8 of `this` (and again into +0xc0/+0xd0
 * for the "state end time" pair). Not-yet-transcribed as a bit-pattern — declared opaque.
 * @provenance Flexo `_kCMTimeZero` (external CoreMedia symbol; RIP-relative literal-pool
 *   dereferences at @0x21d677, @0x21d69d in parseBegin).
 */
export type KCMTimeZeroRef = { readonly __kcmtime_zero: true };

/**
 * `FFOZMediaRefChannelScope` — Flexo-private PCScope singleton pushed into the serializer for
 * every writeHeader / parseBegin call. Referenced by symbol
 * `__ZL24FFOZMediaRefChannelScope` at writeHeader @0x21d18d and parseBegin @0x21d6c9. Not yet
 * transcribed (defined in a translation unit outside this chunk).
 */
export type FFOZMediaRefChannelScopeRef = { readonly __ff_media_ref_channel_scope: true };

// PCSerializerWriteStream / PCSerializerReadStream aliases used in the API signatures.
export type PCSerializerWriteStreamRef = PCSerializerWriteStreamLike;
export type PCSerializerReadStreamRef = PCSerializerReadStreamLike;

/** ObjC selector cache — the disassembler labels every `callq *0xNNN(%rip)` as `currentModelVersion`
 *  because the ObjC-selref table's default label is that one; the ACTUAL selector at each RIP is
 *  determined by the __objc_selrefs entry at that RIP. Selectors we depend on:
 *    @0x21d0c2 / @0x21d0e7 — `respondsTo:` / `-isKindOfClass:` style predicate on the arg's
 *                             FCP-CH wrapper (returns bool "should we install this anchor?").
 *    @0x21d132 — the terminal ObjC message that actually publishes the anchor to the wrapper
 *                (`setAnchoredObject:withWrapper:`-shaped selector).
 *    @0x21d177 — the ObjC read that returns the current anchored object as an FFAnchoredObject*
 *                (an `anchoredObject`-shaped selector).
 *  We don't have a decoded __objc_selrefs table on hand — the selectors are stubbed as opaque.
 */
export type ObjCSelector = { readonly __objc_selector: true };

// -----------------------------------------------------------------------------
// The class (chunk m1).
// -----------------------------------------------------------------------------

/**
 * Flags mask bit 0x1 read at @0x21d0d8 (`andl $0x1,%eax`) — "resolvable" bit.
 * @provenance Flexo setAnchoredObject @0x21d0d8
 */
export const FFOZ_MRC_FLAG_RESOLVABLE = 0x1;

/**
 * Flags mask bit 0x2 read at @0x21d0a9 (`testb $0x2,%al`) — "check-resolvable" bit.
 * @provenance Flexo setAnchoredObject @0x21d0a9
 */
export const FFOZ_MRC_FLAG_CHECK_RESOLVABLE = 0x2;

/**
 * Flags mask bit 0x80 read at @0x21d853 (`movl $0x80,%esi; callq testFlag`) — "no-hash-contribution"
 * bit. When set, calcHashForState short-circuits and contributes nothing to the hash.
 * @provenance Flexo calcHashForState @0x21d853
 */
export const FFOZ_MRC_FLAG_NO_HASH = 0x80;

/**
 * Vtable slot 0x1d0 called by setAnchoredObject at @0x21d101 — a "before-anchor-change" hook
 * on `this` (`callq *0x1d0(%rax); movl $0x1,%esi` beforehand). Slot NOT yet mapped to a symbol.
 * @provenance Flexo setAnchoredObject @0x21d101
 */
export const FFOZ_MRC_VSLOT_PRE_ANCHOR_CHANGE = 0x1d0;

export class FFOZMediaRefChannel {
  // Fields at their real byte offsets. Only slots TOUCHED by this chunk are modelled.

  /** @provenance +0x18 read by writeHeader @0x21d1bf (`movl 0x18(%r14),%edx`) as u32 tag-0x6f arg. */
  fieldKindAt0x18: number = 0;

  /** @provenance +0x20 addressed by writeHeader @0x21d1aa (`leaq 0x20(%r14),%rdx`) as PCString tag-0x6e arg. */
  nameAt0x20!: PCStringRef;

  /**
   * @provenance +0x38 read by writeHeader @0x21d1d4 (`movq 0x38(%r14),%r14`) — the anchored-object
   *   handle (FFAnchoredObject* or a compressed u64 pointer, gated by the shouldEmitFullBody predicate).
   */
  anchorPtrAt0x38: FFAnchoredObjectRef | null = null;

  /** @provenance +0x98 read by setAnchoredObject @0x21d107 / anchoredObject @0x21d156 (`movq 0x98(%rdi),%rbx`). */
  chWrapperBackingAt0x98: unknown = null;

  /** @provenance +0xa0 flags word — the u32 bits `RESOLVABLE`/`CHECK_RESOLVABLE`/`NO_HASH` above. */
  flagsAt0xa0: number = 0;

  /** @provenance +0xa4 secondary counter, reset to 0 by parseBegin @0x21d693. */
  counterAt0xa4: number = 0;

  /** @provenance +0xa8..+0xc0 — the first CMTime slot (value/timescale/flags/epoch). */
  timeAAt0xa8!: CMTimeRef;

  /** @provenance +0xc0..+0xd8 — the second CMTime slot. */
  timeBAt0xc0!: CMTimeRef;

  /** @provenance +0xd8 — PCString scratch buffer, cleared by parseBegin @0x21d6b9. */
  scratchStringAt0xd8!: PCStringRef;

  /** base — the OZChannelBase sub-object used to tail-chain the serializer virtuals. */
  base!: OZChannelBaseLike;

  // ------------------------------------------------------------------------
  // Real transcribed methods.
  // ------------------------------------------------------------------------

  /**
   * setAnchoredObject(FFAnchoredObject*, bool) — @Flexo 0x21d090.
   *
   * Body ~180 bytes. Control flow:
   *
   *   @0x21d0a3  load flags = this+0xa0
   *   @0x21d0a9-@0x21d0b6  early-out gate:
   *              (flags & 0x2)==0  OR  arg1==null   → skip the "check-resolvable" ObjC probe;
   *              else                              → run the probe.
   *   @0x21d0b8-@0x21d0ca  ObjC probe on arg1 (via ObjC selector at RIP 0x16d05f8) — if it
   *              returns 0, jump to @0x21d138 (early return, no state change).
   *   @0x21d0cc  reload flags (in case the ObjC call recursed).
   *   @0x21d0d3-@0x21d0ef  second gate: if arg1!=null AND (flags & 0x1) set, run a SECOND ObjC
   *              probe (selector at RIP 0x16d05d3); if 0, jump @0x21d138.
   *   @0x21d0f1-@0x21d101  if !arg2, call `this->vtable[0x1d0](this, 1)` — the pre-change hook.
   *   @0x21d107  r15 = this+0x98 (wrapper backing).
   *   @0x21d10e-@0x21d113  wrapper = CHChannelWrapperForOZChannel(this, 0).
   *   @0x21d118-@0x21d132  tail-call ObjC message on wrapper (selector at RIP 0x16d0588),
   *              args = (this+0x98 as receiver? — actually rdi=%r15, rdx=arg1, rcx=wrapper).
   *              This is the terminal "install anchor on the wrapper" dispatch.
   *   @0x21d138  early-return path (no state change).
   *
   * Every ObjC call site is a boundary — not yet transcribed on the TS side.
   *
   * @provenance Flexo @0x21d090
   */
  setAnchoredObject(anchor: FFAnchoredObjectRef | null, skipPreHook: boolean): void {
    const flags = this.flagsAt0xa0;
    // Gate: run the "check-resolvable" ObjC probe only if BOTH bit 0x2 is set AND anchor is non-null.
    // `sete %cl; sete %dl; orb %cl,%dl; jne 0x21d0d3` — the branch is taken when EITHER predicate
    // is FALSE (bit clear OR anchor null); in the taken path the probe is skipped.
    const skipProbe1 = (flags & FFOZ_MRC_FLAG_CHECK_RESOLVABLE) === 0 || anchor === null;
    if (!skipProbe1) {
      // @0x21d0c2 — first ObjC probe. Returns bool.
      const ok1 = this.dispatchObjCProbeCheckResolvable(anchor);
      if (!ok1) return; // @0x21d0ca -> @0x21d138
    }
    // @0x21d0cc — reload flags (the ObjC call may have mutated them).
    const flags2 = this.flagsAt0xa0;
    // Second gate: only if anchor!=null AND (flags & 0x1) — run "already-installed?" probe.
    if (anchor !== null && (flags2 & FFOZ_MRC_FLAG_RESOLVABLE) !== 0) {
      const ok2 = this.dispatchObjCProbeAlreadyInstalled(anchor);
      if (!ok2) return; // @0x21d0ef -> @0x21d138
    }
    // Pre-change vtable hook — unless the caller asked us to skip it (arg2 == true).
    if (!skipPreHook) {
      // @0x21d0fc-@0x21d101 — `callq *0x1d0(%rax); movl $0x1,%esi` (arg is 1).
      this.dispatchVtablePreAnchorChange(1);
    }
    // Bridge to the FCP-CH wrapper and terminal ObjC dispatch on the wrapper.
    const wrapper = CHChannelWrapperForOZChannel(this, 0);
    this.dispatchObjCInstallAnchor(this.chWrapperBackingAt0x98, anchor, wrapper);
  }

  /**
   * anchoredObject() const — @Flexo 0x21d150.
   *
   * 30-byte tail-call to an ObjC selector on the FCP-CH wrapper:
   *
   *   @0x21d156  rbx = this+0x98        ; wrapper backing
   *   @0x21d15f  wrapper = CHChannelWrapperForOZChannel(this, 0)
   *   @0x21d16b  rdi = rbx (wrapper backing), rdx = wrapper
   *   @0x21d177  tail-jmpq to ObjC message (selector at RIP 0x16d0543)
   *
   * @provenance Flexo @0x21d150
   */
  anchoredObject(): FFAnchoredObjectRef | null {
    const wrapper = CHChannelWrapperForOZChannel(this, 0);
    return this.dispatchObjCReadAnchor(this.chWrapperBackingAt0x98, wrapper);
  }

  /**
   * writeHeader(PCSerializerWriteStream&, bool) — @Flexo 0x21d180.
   *
   *   @0x21d18d  s.pushScope(&FFOZMediaRefChannelScope)
   *   @0x21d1a7  s.emitBeginTag(0x6e)                           ; "name"
   *   @0x21d1b9  s.emitStringTag(0x6e, &this->nameAt0x20)       ; write PCString name
   *   @0x21d1ce  s.emitU32Tag(0x6f, this->fieldKindAt0x18)      ; write kind/type u32
   *   @0x21d1d4  r14 = this->anchorPtrAt0x38
   *   @0x21d1db  if (r14 == null) fall through past the anchor block to @0x21d21d
   *   @0x21d1e3  if (s.shouldEmitFullBody() == false):
   *              mask = 0xFFFFFFFDECA4CF86
   *              else: mask = 0xFFFFFFFFFFFFFFBF (-0x41 sign-extended)
   *              r14 &= mask                                     ; strip type-tag bits
   *   @0x21d203  if (r14 & mask == 0) fall through past the anchor block to @0x21d21d
   *   @0x21d205  s.<vtable[0xa0]-emit>(0x70, ...)               ; the "anchor" tag  — 0x70
   *   ... continues past the sed window — deep write path.
   *
   * NOT YET TRANSCRIBED past @0x21d217 — the tail of writeHeader dispatches through the
   * PCSerializerWriteStream vtable a further 4-5 times to emit the packed anchor descriptor.
   *
   * @provenance Flexo @0x21d180
   */
  writeHeader(s: PCSerializerWriteStreamRef, _fullBodyHint: boolean): void {
    // Faithful head of the method (up to @0x21d1d4). The tail is not-yet-transcribed and throws.
    s.pushScope(this.getScopeSingleton());
    s.emitBeginTag(0x6e);
    s.emitStringTag(0x6e, this.nameAt0x20);
    s.emitU32Tag(0x6f, this.fieldKindAt0x18);
    if (this.anchorPtrAt0x38 == null) {
      // @0x21d1db jump-past-anchor branch — nothing more to do.
      return;
    }
    // Anchor branch. shouldEmitFullBody() decides the mask constants used to strip type-tag bits.
    // Not yet transcribed past this point.
    throw new Error(
      "FFOZMediaRefChannel::writeHeader tail @Flexo 0x21d1dd..0x21d21d not yet transcribed — " +
        "packed-anchor-descriptor emit path uses PCSerializerWriteStream vtable slots not modelled here " +
        "(mask constants 0xFFFFFFFDECA4CF86 @0x21d1eb and -0x41 @0x21d1f5 recovered).",
    );
  }

  /**
   * writeBody(PCSerializerWriteStream&, bool, bool, bool) — @Flexo 0x21d2e0.
   *
   * ~230 bytes. Prologue @0x21d2e0-@0x21d2fe: if !s.shouldEmitFullBody(), fast-return via
   * @0x21d306->0x21d37e. Otherwise: fetch this+0x98 (wrapper backing) into r15, ObjC-bridge to
   * the FCP-CH wrapper (`_CHChannelWrapperForOZChannel(this, 0)` @0x21d314), then run two ObjC
   * probes (both dispatched through r12 = *0x16d0399(%rip)):
   *
   *   1) wrapper.<currentModelVersion-shape>(0x19a52e0(%rip))  → returns an NSObject
   *   2) that result.<currentModelVersion-shape>(0x19a0e89(%rip))  → returns a CFString
   *
   * Then loads the returned CFString into a stack-local PCString (via
   * PCString::set(CFStringRef) @0x21d34c), and emits tag 0x72 to the stream (s.emitBeginTag(0x72)
   * @0x21d35c, then s.emitString(&stackString) @0x21d369, then a third stream vtable call at
   * @0x21d36f — tag close).
   *
   * NOT YET TRANSCRIBED past the second stream vtable call — the remainder of the body walks
   * further packed anchor state.
   *
   * @provenance Flexo @0x21d2e0
   */
  writeBody(
    s: PCSerializerWriteStreamRef,
    _b1: boolean,
    _b2: boolean,
    _b3: boolean,
  ): void {
    if (!s.shouldEmitFullBody()) return; // @0x21d306
    throw new Error(
      "FFOZMediaRefChannel::writeBody main path @Flexo 0x21d308.. not yet transcribed — depends on " +
        "_CHChannelWrapperForOZChannel (stub @0x1494f32), a pair of ObjC selectors dispatched through " +
        "r12=*0x16d0399(%rip), PCString::set(CFStringRef) (stub @0x1496da4), and PCSerializerWriteStream " +
        "vtable slots *0x10 (emitBeginTag) / *0x68 (emitString) not modelled here.",
    );
  }

  /**
   * parseBegin(PCSerializerReadStream&) — @Flexo 0x21d660.
   *
   * Zero-initializes the persistent state, then chains to base::parseBegin and pushes the scope.
   *
   *   @0x21d66d  this->flagsAt0xa0 = 0
   *   @0x21d67e  load `_kCMTimeZero`  (16-byte xmm0 = value+timescale)
   *   @0x21d681  store into this+0xa8..+0xb7   (timeAAt0xa8: value+timescale)
   *   @0x21d688  load  _kCMTimeZero+0x10       (flags+epoch, 8-byte)
   *   @0x21d68c  store into this+0xb8         (timeAAt0xa8: flags+epoch tail)
   *   @0x21d693  this->counterAt0xa4 = 0
   *   @0x21d69d  load `_kCMTimeZero`   again
   *   @0x21d6a0  store into this+0xc0..+0xcf  (timeBAt0xc0: value+timescale)
   *   @0x21d6a7  load  _kCMTimeZero+0x10
   *   @0x21d6ab  store into this+0xd0          (timeBAt0xc0: flags+epoch tail)
   *   @0x21d6b9  this->scratchStringAt0xd8.clear()                (PCString::clear)
   *   @0x21d6c4  OZChannelBase::parseBegin(this, s)               (base chain)
   *   @0x21d6d3  s.pushScope(&FFOZMediaRefChannelScope)
   *   @0x21d6d8  return true (movb $0x1,%al)
   *
   * @provenance Flexo @0x21d660
   */
  parseBegin(s: PCSerializerReadStreamRef): boolean {
    this.flagsAt0xa0 = 0;
    // We can't do the raw byte-copy of _kCMTimeZero without exposing its 24-byte layout — the
    // ported semantics are "reset both CMTime slots to CMTimeZero". Delegated to a helper that
    // sets them to a canonical zero (which is what the FCP-CH runtime observes).
    this.resetCMTimeAToZero();
    this.counterAt0xa4 = 0;
    this.resetCMTimeBToZero();
    this.scratchStringAt0xd8.clear();
    this.base.parseBegin(s);
    s.pushScope(this.getScopeSingleton());
    return true;
  }

  /**
   * parseElement(PCSerializerReadStream&, PCStreamElement&) — @Flexo 0x21d760.
   *
   * 74 bytes. Chains to base::parseElement, then does a compact jump-table dispatch on the
   * element's tag byte:
   *
   *   @0x21d76d  base::parseElement(this, s, el)
   *   @0x21d772-@0x21d77d  eax = 0xFFFFFF60 + el.tagAt0x8   ; == tag - 0xA0 (u32 wrap)
   *              if (eax u> 4) fall through (unmatched — return true)
   *   @0x21d781  jump-table @rip+0x13516b0 (offset table, 5 entries of u64)
   *   @0x21d788  handler-table @rip+0x13516d1 (5 entries of u64 vtable-slot deltas)
   *   @0x21d78f  rdx = handlerTable[eax]         ; extra byte-offset into this (mostly 0)
   *   @0x21d793  r14 = this + offsetTable[eax]   ; sub-object base pointer
   *   @0x21d797  rax = *r14                       ; sub-object vtable
   *   @0x21d79d  rsi = r14                        ; sub-object as arg
   *   @0x21d7a0  callq *(rax + rdx)               ; dispatch through the sub-object's vtable
   *   @0x21d7a3  return true (movb $0x1,%al)
   *
   * The 5 possible tags are 0xA0..0xA4 — 5 packed anchor fields. The dispatch tables live in
   * Flexo's __const section at RIP 0x13516b0 / 0x13516d1; each pair says which sub-slot on `this`
   * to hand to which per-slot parser vtable slot. Not yet transcribed as concrete offsets — this
   * ports the DISPATCH SHAPE but leaves the actual per-slot parser calls as a throwing stub.
   *
   * @provenance Flexo @0x21d760
   */
  parseElement(s: PCSerializerReadStreamRef, el: PCStreamElementRef): boolean {
    this.base.parseElement(s, el);
    // `addl $0xffffff60,%eax; cmpl $0x4,%eax; ja` — equivalent to `if ((tag - 0xA0) <= 4)`.
    // The subtraction is done as u32 add + unsigned-above; a tag OUTSIDE [0xA0..0xA4] wraps to a
    // value > 4 and falls through.
    const tag = el.tagAt0x8 >>> 0;
    const idx = (tag + 0xffffff60) >>> 0;
    if (idx <= 4) {
      this.dispatchParseElementSubslot(idx, s, el);
    }
    return true;
  }

  /**
   * parseEnd(PCSerializerReadStream&) — @Flexo 0x21d810.
   *
   * 14 bytes: pure tail-call to OZChannelBase::parseEnd, then `movb $0x1,%al; ret`.
   *
   *   @0x21d814  callq OZChannelBase::parseEnd(this, s)
   *   @0x21d819  return true
   *
   * @provenance Flexo @0x21d810
   */
  parseEnd(s: PCSerializerReadStreamRef): boolean {
    this.base.parseEnd(s);
    return true;
  }

  /**
   * calcHashForState(PCSerializerWriteStream&, CMTime const&) — @Flexo 0x21d840.
   *
   *   @0x21d853  if (OZChannelBase::testFlag(this, 0x80)) return    ; "no hash contribution"
   *   @0x21d872  OZChannel::calcHashForState(this, s, t)             ; base contribution
   *   @0x21d885  callq *0x190(this-vtable)(this, s, 0)               ; "hash-this-body" hook
   *   @0x21d89d..@0x21d8a2  callq *0x198(this-vtable)(this, s, 0, 0, 0) ; "hash-anchor" hook
   *   fall-through into epilogue via popq chain (matches the pushq sequence @0x21d844).
   *
   * NOT YET FULLY TRANSCRIBED past the base call — the two additional vtable dispatches read
   * slots 0x190 and 0x198 on `this` which are not modelled in this chunk. Base contribution IS
   * transcribed and the flag-0x80 short-circuit is faithful.
   *
   * @provenance Flexo @0x21d840
   */
  calcHashForState(s: PCSerializerWriteStreamRef, t: CMTimeRef): void {
    if (this.base.testFlag(BigInt(FFOZ_MRC_FLAG_NO_HASH))) return;
    // Base OZChannel contribution — via the parent sub-object.
    this.base.calcHashForState(s, t);
    // Vtable *0x190 + *0x198 body/anchor contributions.
    throw new Error(
      "FFOZMediaRefChannel::calcHashForState tail @Flexo 0x21d885-0x21d8a2 not yet transcribed — " +
        "depends on this-vtable slots *0x190 (hash-body) and *0x198 (hash-anchor) not modelled.",
    );
  }

  // ------------------------------------------------------------------------
  // ObjC / vtable boundary stubs (loud per PORTING_SPEC Rule 3).
  // ------------------------------------------------------------------------

  /**
   * Selector-dispatch used by setAnchoredObject @0x21d0c2 (first "check-resolvable" probe).
   * @provenance Flexo setAnchoredObject @0x21d0c2 (`callq *0x16d05f8(%rip)`)
   */
  protected dispatchObjCProbeCheckResolvable(_anchor: FFAnchoredObjectRef): boolean {
    throw new Error(
      "FFOZMediaRefChannel::setAnchoredObject ObjC probe @Flexo 0x21d0c2 (selector at RIP 0x16d05f8) " +
        "not yet transcribed — Objective-C boundary.",
    );
  }

  /**
   * Selector-dispatch used by setAnchoredObject @0x21d0e7 (second "already installed?" probe).
   * @provenance Flexo setAnchoredObject @0x21d0e7 (`callq *0x16d05d3(%rip)`)
   */
  protected dispatchObjCProbeAlreadyInstalled(_anchor: FFAnchoredObjectRef): boolean {
    throw new Error(
      "FFOZMediaRefChannel::setAnchoredObject ObjC probe @Flexo 0x21d0e7 (selector at RIP 0x16d05d3) " +
        "not yet transcribed — Objective-C boundary.",
    );
  }

  /**
   * this-vtable slot 0x1d0 dispatch used by setAnchoredObject @0x21d101 (pre-anchor-change hook).
   * @provenance Flexo setAnchoredObject @0x21d101
   */
  protected dispatchVtablePreAnchorChange(_arg: number): void {
    throw new Error(
      "FFOZMediaRefChannel::setAnchoredObject vtable-slot-0x1d0 (pre-anchor-change hook) " +
        "@Flexo 0x21d101 not yet transcribed.",
    );
  }

  /**
   * Terminal ObjC selector called by setAnchoredObject @0x21d132 (tail-jmp) — installs the
   * anchor on the FCP-CH wrapper.
   * @provenance Flexo setAnchoredObject @0x21d132 (`jmpq *0x16d0588(%rip)`)
   */
  protected dispatchObjCInstallAnchor(
    _wrapperBacking: unknown,
    _anchor: FFAnchoredObjectRef | null,
    _wrapper: unknown,
  ): void {
    throw new Error(
      "FFOZMediaRefChannel::setAnchoredObject terminal ObjC dispatch @Flexo 0x21d132 " +
        "(selector at RIP 0x16d0588) not yet transcribed — Objective-C boundary.",
    );
  }

  /**
   * Terminal ObjC selector called by anchoredObject @0x21d177 (tail-jmp) — reads the anchor
   * from the FCP-CH wrapper.
   * @provenance Flexo anchoredObject @0x21d177 (`jmpq *0x16d0543(%rip)`)
   */
  protected dispatchObjCReadAnchor(
    _wrapperBacking: unknown,
    _wrapper: unknown,
  ): FFAnchoredObjectRef | null {
    throw new Error(
      "FFOZMediaRefChannel::anchoredObject terminal ObjC dispatch @Flexo 0x21d177 " +
        "(selector at RIP 0x16d0543) not yet transcribed — Objective-C boundary.",
    );
  }

  /**
   * The __ZL24FFOZMediaRefChannelScope PCScope singleton (Flexo-private, TU-local).
   * @provenance Flexo writeHeader @0x21d18d / parseBegin @0x21d6c9.
   */
  protected getScopeSingleton(): FFOZMediaRefChannelScopeRef {
    throw new Error(
      "FFOZMediaRefChannel::getScopeSingleton (`FFOZMediaRefChannelScope`) @Flexo referenced " +
        "@0x21d18d and @0x21d6c9 not yet transcribed — Flexo-private TU-local PCScope.",
    );
  }

  /**
   * Reset the first CMTime slot (+0xa8..+0xb7 payload + +0xb8..+0xbf epoch/flags tail) to
   * `_kCMTimeZero`. The disasm copies 24 bytes verbatim from CoreMedia's exported constant.
   * @provenance Flexo parseBegin @0x21d677-@0x21d68c.
   */
  protected resetCMTimeAToZero(): void {
    throw new Error(
      "FFOZMediaRefChannel::parseBegin CMTime-A reset @Flexo 0x21d677 not yet transcribed — " +
        "depends on CoreMedia _kCMTimeZero bit-pattern (24 bytes: value/timescale/flags/epoch).",
    );
  }

  /**
   * Reset the second CMTime slot (+0xc0..+0xd7) to `_kCMTimeZero`.
   * @provenance Flexo parseBegin @0x21d69d-@0x21d6ab.
   */
  protected resetCMTimeBToZero(): void {
    throw new Error(
      "FFOZMediaRefChannel::parseBegin CMTime-B reset @Flexo 0x21d69d not yet transcribed — " +
        "depends on CoreMedia _kCMTimeZero bit-pattern.",
    );
  }

  /**
   * Per-subslot parseElement dispatch — the 5 possible tag indices (0xA0..0xA4) each pick a
   * different (offset, vtable-slot) pair from Flexo's __const tables at RIP 0x13516b0 /
   * 0x13516d1. Those tables have not been decoded on the TS side yet.
   * @provenance Flexo parseElement @0x21d781-@0x21d7a0.
   */
  protected dispatchParseElementSubslot(
    _idx: number,
    _s: PCSerializerReadStreamRef,
    _el: PCStreamElementRef,
  ): void {
    throw new Error(
      "FFOZMediaRefChannel::parseElement subslot dispatch @Flexo 0x21d781 not yet transcribed — " +
        "depends on Flexo __const tables at RIP 0x13516b0 (per-slot offset) and 0x13516d1 " +
        "(per-slot vtable-delta) for tags 0xA0..0xA4.",
    );
  }
}
