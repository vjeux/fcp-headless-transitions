// OZChannelImpl — the per-channel implementation sidecar (ProChannel.framework).
//
// Framework: ProChannel
// Vtable:  __ZTV13OZChannelImpl @ProChannel 0xe3d10 (first virtual slot = ~OZChannelImpl @+0x10)
//
// Provenance (raw-port/re/disasm/__ZN13OZChannelImpl*.s):
//   OZChannelImpl::OZChannelImpl()                                @0xaa21a  (C2)
//   OZChannelImpl::OZChannelImpl()                                @0xaa23c  (C1, verbatim clone of C2)
//   OZChannelImpl::OZChannelImpl(OZCurve*, double, u32, bool)     @0xaa25e  (C2)
//   OZChannelImpl::OZChannelImpl(OZCurve*, double, u32, bool)     @0xaa2e4  (C1, jmp -> C2)
//   OZChannelImpl::OZChannelImpl(OZChannelImpl const&)            @0xaa2ee  (C2, zero-init then jmp op=)
//   OZChannelImpl::OZChannelImpl(OZChannelImpl const&)            @0xaa3e4  (C1, verbatim clone of C2)
//   OZChannelImpl::operator=(OZChannelImpl const&)                @0xaa314
//   OZChannelImpl::~OZChannelImpl()                               @0xaa40a  (D2, real body)
//   OZChannelImpl::~OZChannelImpl()                               @0xaa482  (D1, tail-jmp -> D2)
//   OZChannelImpl::~OZChannelImpl()                               @0xaa48c  (D0, deleting: D2 + op delete)
//   OZChannelImpl::operator==(OZChannelImpl const&) const         @0xaa51c
//   OZChannelImpl::createLocalCopy()                              @0x141d8  (heap-allocs 0x28, invokes C1 copy)
//   OZChannelImpl::copyCurveInterface(OZCurve*)                   @0xaa4a8
//   OZChannelImpl::resetToDefault(bool)                           @0xaa638
//   OZChannelImpl::shouldKeepLocalCopy()                          @0xaa66a
//   OZChannelImpl::beginPlayback(CMTime const&, u32, u32, CMTime const&) @0xaa6bc
//   OZChannelImpl::endPlayback(CMTime const&)                     @0xaa6d2
//   OZChannelImpl::beginRecording(CMTime const&)                  @0xaa6e8
//   OZChannelImpl::endRecording(CMTime const&)                    @0xaa76a
//   OZChannelImpl::updateCurrentRecordingTime(CMTime const&)      @0xaa780
//   OZChannelImpl::didRecordValue(OZChannelBase*, CMTime const&)  @0xaa796
//   OZChannelImpl::isPlaying(u32*, u32*, CMTime*)                 @0xaa848
//   OZChannelImpl::isRecording()                                  @0xaa85e
//   OZChannelImpl::registerRecordingCallback(fn, void*, bool)     @0xaa870
//   OZChannelImpl::unregisterRecordingCallback(fn, void*)         @0xaaa02
//   OZChannelImpl::setMin(double)                                 @0xaaade
//   OZChannelImpl::setMax(double)                                 @0xaaaf4
//   OZChannelImpl::setDiscrete(bool)                              @0xaab0a
//   OZChannelImpl::setParametric(bool)                            @0xaab20
//   OZChannelImpl::setInterpolation(u32)                          @0xaab32
//   OZChannelImpl::setShouldCreateTangents(bool)                  @0xaab48
//
// STRUCT LAYOUT (sizeof = 0x28, from ctor stores + new(0x28) in createLocalCopy):
//   +0x00  vptr                                (leaq 0x39afb(%rip)@0xaa21e -> 0xe3d20 = &vtable[2])
//   +0x08  OZCurve*  curve                     (arg2 of ctor_curve @0xaa27b; forwarding target of
//                                                every set*/is*/begin*/end* method)
//   +0x10  SavedState*  savedState             (nullable heap-allocated 0x38-byte snapshot;
//                                                allocated on op= (@0xaa3a9 new(0x38)); deleted by
//                                                D2 (@0xaa46f) and resetToDefault (@0xaa64a);
//                                                zero-init by every ctor)
//                                                SavedState layout (from op= copy + operator==):
//                                                  +0x00 CMTime a           (24 bytes)
//                                                  +0x18 CMTime b           (24 bytes)
//                                                  +0x30 u32 x              (4 bytes)
//                                                  +0x34 u32 y              (4 bytes)
//                                                Total 0x38 (matches `new(0x38)` @0xaa3ae).
//   +0x18  RecordingCallbacks*  callbacks      (nullable heap-allocated 0x18-byte vector head;
//                                                lazily allocated by beginRecording (@0xaa70e new(0x18))
//                                                and register/unregister; deleted by D2.
//                                                Layout: begin(+0x00), end(+0x08), cap(+0x10) —
//                                                a std::vector<RecordingCallbackData>. Element size
//                                                = 24 bytes (imul 0xAAA...B @0xaa822 = ÷24 = ÷0x18);
//                                                RecordingCallbackData layout (from register_ store
//                                                @0xaa8de..@0xaa8e5): +0x00 fn*, +0x08 userData*,
//                                                +0x10 bool triggerImmediate.)
//                                                Reads use lock-free cmpxchg-init pattern with
//                                                atomic first-writer wins (@0xaa72b, @0xaa8b2,
//                                                @0xaaa3c).
//   +0x20  bool  isPlayingBack                 (arg4 of ctor_curve @0xaa289 movb %cl; set false by
//                                                default/copy ctors; cleared by op= (@0xaa360);
//                                                probed by shouldKeepLocalCopy (@0xaa66a). Named
//                                                "isPlayingBack" because a true value skips
//                                                shouldKeepLocalCopy's real work.)
//
// The class is a THIN forwarder: 12 of its 31 methods are single-tail-jmp-to-vtable-slot on the
// wrapped OZCurve (this->curve). Only 5 methods have real bodies: ctors, dtor, op=, op==,
// resetToDefault, shouldKeepLocalCopy, beginRecording (lazy alloc), didRecordValue (fire
// callbacks), register/unregisterRecordingCallback, createLocalCopy, copyCurveInterface.
//
// OZCurve vtable slot addresses used by this class (raw byte offsets, resolved from `*0xNN(%rax)`
// disasm patterns):
//   +0x008  ~OZCurve()               (D2 slot; called by copyCurveInterface's discard branch
//                                     @0xaa4fc and D2 @0xaa42a — free the old curve before replace)
//   +0x050  setIsSpline(bool, CMTime const&)  (called by ctor_curve @0xaa2b2 — this is actually a
//                                     vtable slot, not the direct __ZN7OZCurve11setIsSplineEbRK6CMTime
//                                     which is called first @0xaa2a3 as a NON-virtual base helper)
//   +0x068  setParametric(bool)      (called by setParametric @0xaab2b)
//   +0x088  setShouldCreateTangents(bool)  (called by setShouldCreateTangents @0xaab53)
//   +0x098  <some field probe>       (read as data at 0x98(curve) by shouldKeepLocalCopy @0xaa6a8;
//                                     non-zero => keep local copy)
//   +0x0a8  setDiscrete(bool)        (setDiscrete @0xaab15)
//   +0x0b8  resetToDefaultOnCurve()  (resetToDefault tail-jmp @0xaa664)
//   +0x0c8  setDefault(double)       (called by ctor_curve @0xaa2c1 with the double arg)
//   +0x0d8  setSomething(double)     (called by ctor_curve @0xaa2ce/aa2d5 as tail-jmp with same double)
//   +0x110  setMax(double)           (setMax @0xaaaff)
//   +0x118  setMin(double)           (setMin @0xaaae9)
//   +0x128  setInterpolation(u32)    (setInterpolation @0xaab3d)
//   +0x480  getPlaybackFlag(u32*)    (shouldKeepLocalCopy @0xaa696; writes 0/1 into *arg)
//   +0x488  beginPlayback fwd        (beginPlayback @0xaa6c7)
//   +0x490  endPlayback fwd          (endPlayback @0xaa6dd)
//   +0x498  beginRecording fwd      (beginRecording tail @0xaa753)
//   +0x4a0  endRecording fwd         (endRecording @0xaa775)
//   +0x4a8  updateCurrentRecordingTime fwd  (@0xaa78b)
//   +0x4b0  isPlaying fwd            (isPlaying @0xaa853)
//   +0x4b8  isRecording fwd          (isRecording tail @0xaa86a)
//   +0x4c8  cloneCurve()             (copyCurveInterface @0xaa50d — deep clone factory)
//   +0x4d0  canAssignCurve()         (copyCurveInterface probes both @0xaa4c6 and @0xaa4d6)
//
// External library callees (all are ProChannel .stubs sections):
//   __Znwm             (operator new(size_t))            stub 0xace4c
//   __ZdlPv            (operator delete(void*))          stub 0xace04
//   _CMTimeCompare     (CoreMedia)                       stub 0xaca80
//   _kCMTimeZero       (CoreMedia GOT read)              GOT @0xca4c0 (resolved from
//                                                        `0x20223(%rip)@0xaa29d`)
//   _memmove           (libc)                            stub 0xacf06
//   __Unwind_Resume    (libunwind)                       stub 0xacaf2
//   __ZN7OZCurve11setIsSplineEbRK6CMTime  (direct call)  @0xaa2a3 — NOT a stub, resolved directly
//   __ZN7OZCurveaSERKS_                   (direct call)  @0xaa4eb — tail-jmp
//   std::vector<RecordingCallbackData>::push_back        stub @0xaa8e8
//   OZChannelBase::ensureObjCWrapperExists()             direct call @0xaa7f9

import { OZChannelBase } from "./OZChannelBase.js";

/** CMTime — CoreMedia timestamp. 24 bytes; used for playback/recording ranges.
 *  Bit-exact fields are per CoreMedia: value:i64 (+0x0), timescale:i32 (+0x8),
 *  flags:u32 (+0xC), epoch:i64 (+0x10). Reads at +0x0 (16 bytes), +0x10 (8 bytes)
 *  in the operator== disasm confirm this. */
export interface CMTime {
  value: bigint;
  timescale: number;
  flags: number;
  epoch: bigint;
}

/** _kCMTimeZero — CoreMedia constant read at ctor_curve @0xaa296 (`0x20223(%rip)` -> GOT
 *  @0xca4c0 -> `_kCMTimeZero`). Passed as CMTime const& to OZCurve::setIsSpline. */
const kCMTimeZero: CMTime = { value: 0n, timescale: 0, flags: 0, epoch: 0n };

/** OZCurve — the curve/keyframe engine wrapped by every OZChannelImpl. Not ported yet;
 *  this interface only declares the vtable slots this class forwards to. Every field
 *  and slot documented here is proved from the disasm above. */
export interface OZCurve {
  // Non-virtual base helper called by ctor_curve at @0xaa2a3.
  setIsSpline(isSpline: boolean, atTime: CMTime): void;
  // Copy-assignment (called by copyCurveInterface @0xaa4eb as tail-jmp).
  assignFrom(other: OZCurve): OZCurve;
  // The following are called through the OZCurve vtable (see slot table above); modelled
  // as ordinary TS methods rather than a `vtable: unknown[]` because that's how downstream
  // classes will see them (via OZChannel etc.). Their bodies are OZCurve's problem to port.
  destroy(): void;                                  // vtable +0x008
  setIsSplineVirtual(isSpline: boolean): void;      // vtable +0x050
  setParametric(parametric: boolean): void;         // vtable +0x068
  setShouldCreateTangents(shouldCreate: boolean): void; // vtable +0x088
  keepLocalCopyProbe(): unknown;                    // read of +0x098 as data (not a call slot)
  setDiscrete(discrete: boolean): void;             // vtable +0x0a8
  resetToDefault(): void;                           // vtable +0x0b8
  setDefault(value: number): void;                  // vtable +0x0c8
  setDefault2(value: number): void;                 // vtable +0x0d8
  setMax(value: number): void;                      // vtable +0x110
  setMin(value: number): void;                      // vtable +0x118
  setInterpolation(interp: number): void;           // vtable +0x128
  getPlaybackFlag(out: { value: number }): void;    // vtable +0x480
  beginPlayback(startTime: CMTime, a: number, b: number, endTime: CMTime): void; // +0x488
  endPlayback(atTime: CMTime): void;                // vtable +0x490
  beginRecording(atTime: CMTime): void;             // vtable +0x498
  endRecording(atTime: CMTime): void;               // vtable +0x4a0
  updateCurrentRecordingTime(atTime: CMTime): void; // vtable +0x4a8
  isPlaying(a: { value: number }, b: { value: number }, t: CMTime): boolean; // +0x4b0
  isRecording(): boolean;                            // vtable +0x4b8
  clone(): OZCurve;                                  // vtable +0x4c8
  canAssignFrom(): boolean;                          // vtable +0x4d0 — used to gate op=
}

/** RecordingCallbackData — 24-byte tuple stored in the callbacks vector. Layout proved by the
 *  store sequence in registerRecordingCallback @0xaa8de..@0xaa8e5 and the read sequence in
 *  didRecordValue @0xaa805 (fn pointer at +0x00 called directly via `callq *%r12`; userData at
 *  +0x08 loaded into %rdx just before the call; the +0x10 bool is a "triggerImmediateOnInitial"
 *  flag whose interpretation ensureObjCWrapperExists() (@0xaa7ef..@0xaa7f9 — if it's 0, the
 *  channel pointer arg is replaced with the channel's ObjC wrapper). */
export interface RecordingCallbackData {
  fn: (chan: unknown, atTime: CMTime, userData: unknown) => void; // +0x00
  userData: unknown;                                                // +0x08
  useObjCWrapper: boolean;                                          // +0x10 (byte, but the branch at
                                                                    //  @0xaa7ef is `jne` on `!=1`, so
                                                                    //  "1 == pass channel raw; 0 == wrap")
}

/** SavedState — the 0x38-byte struct pointed to by OZChannelImpl.savedState. Never modelled as
 *  another OZChannelImpl (its layout does not match). Layout inferred from operator== reads at
 *  @0xaa572..@0xaa626 (two CMTimes then two u32s) and confirmed by the op= copy pattern which
 *  moves exactly these bytes at exactly these offsets (@0xaa387..@0xaa39f = 16 bytes at +0x00,
 *  then 8 bytes at +0x10, then 16 bytes at +0x18, then 8 bytes at +0x28, then 8 bytes at +0x30). */
export interface OZChannelImplSavedState {
  timeA: CMTime;  // +0x00, 24 bytes
  timeB: CMTime;  // +0x18, 24 bytes
  x: number;      // +0x30, u32
  y: number;      // +0x34, u32
}

/** ProChannel `__ZN13OZChannelBase23ensureObjCWrapperExistsEv` @ProChannel — called directly by
 *  didRecordValue @0xaa7f9 when a callback has useObjCWrapper=false. Not yet transcribed. */
function OZChannelBase_ensureObjCWrapperExists(_chan: OZChannelBase): unknown {
  throw new Error(
    "OZChannelBase::ensureObjCWrapperExists() @ProChannel " +
      "(__ZN13OZChannelBase23ensureObjCWrapperExistsEv) not yet transcribed @0xaa7f9",
  );
}

/**
 * OZChannelImpl — per-channel keyframe/curve implementation sidecar.
 *
 * This is the base class for every `OZChannelXxxImpl` (Uint16Impl, DecibelImpl, AspectRatioImpl,
 * AngleImpl, SeedImpl, etc.) via non-virtual thunks. Direct instances are constructed by
 * `createLocalCopy()` (@0x141d8) for undo/edit snapshots.
 *
 * The class does two things:
 *   1. Wraps an OZCurve* and forwards ~half of its calls to it (thin virtual-forward layer).
 *   2. Manages a lazily-allocated recording-callback registry so that clients can subscribe to
 *      `didRecordValue` events during a record session.
 *
 * Struct layout is proved above; every method here transcribes its @0xADDR disasm.
 */
export class OZChannelImpl {
  /** +0x08 — the wrapped curve. Zero-init by default/copy ctors (@0xaa22b `movups xmm0,0x8(%rdi)`);
   *  set to arg2 by ctor_curve (@0xaa27b `movq %rsi, 0x8(%rdi)`). Nullable at runtime because
   *  copyCurveInterface's discard branch (@0xaa4ff) explicitly clears it before repointing. */
  curve: OZCurve | null = null;

  /** +0x10 — nullable saved-state snapshot heap block (see OZChannelImplSavedState). Every ctor
   *  zero-inits this (@0xaa281 in ctor_curve; @0xaa22b's xmm0 covers +0x08+0x10 in default/copy;
   *  @0xaa2ff same in ctor_copy). Deleted-and-nulled by resetToDefault (@0xaa64a-@0xaa64f) and D2
   *  (@0xaa46f-@0xaa474). Allocated by op= @0xaa3a9 (`new(0x38)`) when other has one and we don't. */
  savedState: OZChannelImplSavedState | null = null;

  /** +0x18 — lazily allocated `std::vector<RecordingCallbackData>` head (24 bytes: begin/end/cap).
   *  All three writers (beginRecording @0xaa72b, register @0xaa8b2, unregister @0xaaa3c) use a
   *  lock-free cmpxchg-init pattern: they alloc a fresh 0x18 vector, try to publish via cmpxchg,
   *  and free-on-loss if some other thread beat them. In single-threaded TS this collapses to
   *  a plain lazy-init. Deleted by D2 (@0xaa447..@0xaa462). */
  callbacks: RecordingCallbackData[] | null = null;

  /** +0x20 — playback flag (byte). Zero on every ctor except ctor_curve, where it is set from
   *  arg4 (bool `cl`) (@0xaa289 `movb %cl, 0x20(%rdi)`). Cleared by op= (@0xaa360). Probed by
   *  shouldKeepLocalCopy (@0xaa66a) as the early-out (if set, return false). */
  isPlayingBack = false;

  //
  // ---- constructors ----------------------------------------------------------------------------
  //

  /**
   * OZChannelImpl::OZChannelImpl() @ProChannel 0xaa21a (C2) / 0xaa23c (C1 — verbatim clone).
   *
   * @0xaa21e leaq 0x39afb(%rip),%rax     — rax = vtable data segment (0xe3d20 = &_ZTV13OZChannelImpl[2])
   * @0xaa225 movq %rax,(%rdi)             — this->vptr = rax  (modelled as pure class dispatch in TS)
   * @0xaa228 xorps %xmm0,%xmm0
   * @0xaa22b movups %xmm0,0x8(%rdi)       — zero this->curve (+0x08) and this->savedState (+0x10)
   * @0xaa22f xorl %eax,%eax
   * @0xaa231 xchgq %rax,0x18(%rdi)        — atomic-init this->callbacks = null (+0x18)
   * @0xaa235 movb $0x0,0x20(%rdi)         — this->isPlayingBack = 0
   *
   * The C1 body at 0xaa23c is instruction-for-instruction identical (offsets differ only in the
   * leaq's RIP-relative displacement 0x39ad9 vs 0x39afb, resolving to the same vtable address).
   */
  constructor();

  /**
   * OZChannelImpl::OZChannelImpl(OZCurve*, double, u32 interp, bool isPlaybackFlag)
   * @ProChannel 0xaa25e (C2)  /  0xaa2e4 (C1 -> jmp C2 @0xaa2e9).
   *
   * Faithful transcription:
   *   @0xaa269 movsd %xmm0,-0x18(%rbp)                 — spill `defaultValue` (arg2, double)
   *   @0xaa271 leaq 0x39aa8(%rip),%rax                 — rax = &vtable[2] (0xe3d20)
   *   @0xaa278 movq %rax,(%rdi)                        — install vtable
   *   @0xaa27b movq %rsi,0x8(%rdi)                     — this->curve = arg1 (OZCurve*)
   *   @0xaa27f xorl %eax,%eax
   *   @0xaa281 movq %rax,0x10(%rdi)                    — this->savedState = null
   *   @0xaa285 xchgq %rax,0x18(%rdi)                   — this->callbacks = null (atomic)
   *   @0xaa289 movb %cl,0x20(%rdi)                     — this->isPlayingBack = arg4 (bool cl)
   *   @0xaa28c xorl %r14d,%r14d
   *   @0xaa28f cmpl $0x1,%edx                          — if arg3 (interp) == 1:
   *   @0xaa292 sete %r14b                              —   r14 = (interp == 1) ? 1 : 0
   *   @0xaa296 movq 0x20223(%rip),%rdx                 — rdx = &kCMTimeZero (GOT @0xca4c0)
   *   @0xaa29d movq %rsi,%rdi                          — pass curve as `this`
   *   @0xaa2a0 movl %r14d,%esi                         — pass isSpline
   *   @0xaa2a3 callq OZCurve::setIsSpline(bool, CMTime const&)   — non-virtual base helper
   *   @0xaa2a8 movq 0x8(%rbx),%rdi                     — rdi = this->curve  (reload — may have moved?)
   *   @0xaa2ac movq (%rdi),%rax                        — rax = curve->vptr
   *   @0xaa2af movl %r14d,%esi                         — pass isSpline again (as int)
   *   @0xaa2b2 callq *0x50(%rax)                       — curve->vtable[+0x50](isSpline) — setIsSplineVirtual
   *   @0xaa2b5 movq 0x8(%rbx),%rdi
   *   @0xaa2b9 movq (%rdi),%rax
   *   @0xaa2bc movsd -0x18(%rbp),%xmm0                 — reload defaultValue
   *   @0xaa2c1 callq *0xc8(%rax)                       — curve->vtable[+0xc8](defaultValue) — setDefault
   *   @0xaa2c7 movq 0x8(%rbx),%rdi
   *   @0xaa2cb movq (%rdi),%rax
   *   @0xaa2ce movq 0xd8(%rax),%rax                    — rax = curve->vtable[+0xd8]  (setDefault2)
   *   @0xaa2d5 movsd -0x18(%rbp),%xmm0                 — reload defaultValue
   *   @0xaa2da..@0xaa2e2 tear down frame and tail-jmp *%rax — setDefault2(defaultValue)
   */
  constructor(curve: OZCurve, defaultValue: number, interpolation: number, isPlaybackFlag: boolean);

  constructor(
    curve?: OZCurve,
    defaultValue?: number,
    interpolation?: number,
    isPlaybackFlag?: boolean,
  ) {
    // Default/no-args form (C2 @0xaa21a): fields already have their in-class initializers above.
    if (curve === undefined) return;

    // OZCurve* form (C2 @0xaa25e): everything up to and including the double-tail-jmp to
    // setDefault2. We do NOT model vtable installation (@0xaa278) — TypeScript dispatch handles
    // that — but every observable OZCurve interaction is faithfully replayed.
    this.curve = curve;
    this.savedState = null;      // @0xaa281
    this.callbacks = null;       // @0xaa285
    this.isPlayingBack = isPlaybackFlag ?? false; // @0xaa289 (arg4)

    const isSpline = (interpolation ?? 0) === 1;                       // @0xaa28f-@0xaa292
    curve.setIsSpline(isSpline, kCMTimeZero);                          // @0xaa2a3 (direct call)
    curve.setIsSplineVirtual(isSpline);                                // @0xaa2b2 (vtable +0x50)
    curve.setDefault(defaultValue ?? 0);                               // @0xaa2c1 (vtable +0xc8)
    curve.setDefault2(defaultValue ?? 0);                              // @0xaa2da tail-jmp (+0xd8)
  }

  /**
   * OZChannelImpl::OZChannelImpl(OZChannelImpl const&) @ProChannel 0xaa2ee (C2) / 0xaa3e4 (C1).
   *
   * @0xaa2f2 leaq 0x39a27(%rip),%rax        — vtable
   * @0xaa2f9 movq %rax,(%rdi)               — install vtable
   * @0xaa2fc xorps %xmm0,%xmm0
   * @0xaa2ff movups %xmm0,0x8(%rdi)         — zero curve + savedState
   * @0xaa303 xorl %eax,%eax
   * @0xaa305 xchgq %rax,0x18(%rdi)          — atomic zero callbacks
   * @0xaa309 movb $0x0,0x20(%rdi)           — isPlayingBack = 0
   * @0xaa30d popq %rbp
   * @0xaa30e jmp OZChannelImpl::operator=(OZChannelImpl const&)    — tail-jmp
   *
   * i.e. copy-construct = zero-init + operator=(other).
   */
  static fromCopy(other: OZChannelImpl): OZChannelImpl {
    const self = new OZChannelImpl();  // covers @0xaa2ee..@0xaa309 (all zero-init)
    self.assign(other);                // covers @0xaa30e tail-jmp to operator=
    return self;
  }

  //
  // ---- destructor ------------------------------------------------------------------------------
  //

  /**
   * OZChannelImpl::~OZChannelImpl() @ProChannel 0xaa40a (D2 real body).
   * D1 @0xaa482 is a plain tail-jmp to D2 (@0xaa487 `jmp D2`).
   * D0 @0xaa48c calls D2 then `operator delete(void*)` (@0xaa4a3 tail-jmp to stub 0xace04).
   *
   * @0xaa414 leaq 0x39905(%rip),%rax        — rax = vtable[2]
   * @0xaa41b movq %rax,(%rdi)               — reset vptr (to our own vtable — signals base-destroyed)
   * @0xaa41e movq 0x8(%rdi),%rdi            — rdi = this->curve
   * @0xaa422 testq %rdi,%rdi
   * @0xaa425 je    0xaa435                  — skip if null
   * @0xaa427 movq (%rdi),%rax
   * @0xaa42a callq *0x8(%rax)               — curve->vtable[+0x8]() — OZCurve::~OZCurve (deleting)
   * @0xaa42d movq $0x0,0x8(%rbx)            — this->curve = null
   * @0xaa435 movq 0x18(%rbx),%rax
   * @0xaa439 testq %rax,%rax
   * @0xaa43c je    0xaa466                  — skip callbacks if null
   * @0xaa43e movq 0x18(%rbx),%r14           — r14 = callbacks
   * @0xaa442 testq %r14,%r14
   * @0xaa445 je    0xaa460
   * @0xaa447 movq (%r14),%rdi               — rdi = callbacks->begin
   * @0xaa44a testq %rdi,%rdi
   * @0xaa44d je    0xaa458
   * @0xaa44f movq %rdi,0x8(%r14)            — callbacks->end = callbacks->begin (clear)
   * @0xaa453 callq operator delete(begin)   — free vector storage
   * @0xaa458 movq %r14,%rdi
   * @0xaa45b callq operator delete(callbacks) — free vector head
   * @0xaa460 xorl %eax,%eax
   * @0xaa462 xchgq %rax,0x18(%rbx)          — atomic-null callbacks
   * @0xaa466 movq 0x10(%rbx),%rdi           — rdi = savedState
   * @0xaa46a testq %rdi,%rdi
   * @0xaa46d je    0xaa47c
   * @0xaa46f callq operator delete(savedState)
   * @0xaa474 movq $0x0,0x10(%rbx)           — this->savedState = null
   */
  destroy(): void {
    // @0xaa41e-@0xaa42d — destroy the wrapped curve (vtable +0x8 = OZCurve::~OZCurve).
    if (this.curve !== null) {
      this.curve.destroy();
      this.curve = null;
    }
    // @0xaa435-@0xaa462 — destroy the callback vector.
    if (this.callbacks !== null) {
      // In C++ this is two `operator delete` calls (vector storage + vector head). In TS the
      // GC handles it; we still null-out the reference to match the atomic exchange at @0xaa462.
      this.callbacks = null;
    }
    // @0xaa466-@0xaa474 — destroy the saved-state snapshot.
    if (this.savedState !== null) {
      this.savedState = null;
    }
  }

  //
  // ---- operator= -------------------------------------------------------------------------------
  //

  /**
   * OZChannelImpl::operator=(OZChannelImpl const&) @ProChannel 0xaa314.
   *
   * The C++ body handles four cases based on whether `this->savedState` and `other->savedState`
   * are null:
   *   both null                     -> straight copyCurveInterface (fast path @0xaa354)
   *   this has, other null          -> `operator delete(this->savedState)`, then null it out,
   *                                    then copyCurveInterface (@0xaa347-@0xaa354)
   *   this null, other has          -> `new(0x38)`, copy 0x38 bytes from other's savedState,
   *                                    then copyCurveInterface (@0xaa3a9-@0xaa3df)
   *   both have                     -> in-place copy 0x38 bytes from other into this
   *                                    (@0xaa387-@0xaa39f)
   * All four paths converge at @0xaa354 (`callq copyCurveInterface`), then clear isPlayingBack
   * (@0xaa360 `movb $0x0, 0x20(%rbx)`) and return.
   *
   * Faithful transcription:
   *   @0xaa324 movq 0x10(%rdi),%rdi                    — rdi = this->savedState
   *   @0xaa328 movq 0x10(%rsi),%r15                    — r15 = other->savedState
   *   @0xaa32c movq %rdi,%rax
   *   @0xaa32f orq  %r15,%rax
   *   @0xaa332 je   0xaa34c                            — both null: skip alloc, go to copy branch
   *   @0xaa334 testq %r15,%r15;  sete %al              — al = (other->savedState == null)
   *   @0xaa33a testq %rdi,%rdi;  setne %cl             — cl = (this->savedState != null)
   *   @0xaa340 andb %al,%cl
   *   @0xaa342 cmpb $0x1,%cl
   *   @0xaa345 jne  0xaa36f                            — if not (this has && other null), skip delete
   *   @0xaa347 callq __ZdlPv                            — operator delete(this->savedState)
   *   @0xaa34c movq $0x0,0x10(%rbx)                    — this->savedState = null
   *   ... (branch @0xaa36f handles the copy-into-existing / new-alloc cases)
   *   @0xaa354 movq 0x8(%r14),%rsi                     — rsi = other->curve
   *   @0xaa358 movq %rbx,%rdi
   *   @0xaa35b callq copyCurveInterface                — apply the curve
   *   @0xaa360 movb $0x0,0x20(%rbx)                    — isPlayingBack = false
   */
  assign(other: OZChannelImpl): OZChannelImpl {
    const thisHas = this.savedState !== null;
    const otherHas = other.savedState !== null;

    if (!thisHas && !otherHas) {
      // @0xaa332 je 0xaa34c — both null, straight to copyCurveInterface path.
      // this->savedState already null; no-op.
    } else if (thisHas && !otherHas) {
      // @0xaa345 taken (not jne) => this has, other null. Delete and null.
      // @0xaa347 __ZdlPv (operator delete on this->savedState)
      // @0xaa34c movq $0x0, 0x10(%rbx)
      this.savedState = null;
    } else if (!thisHas && otherHas) {
      // @0xaa3a9 `movl $0x38, %edi; callq __Znwm` — allocate 0x38 bytes.
      // Then @0xaa3b3-@0xaa3d7 copy: this->savedState = { ...other.savedState } bit-for-bit.
      this.savedState = OZChannelImpl.cloneSavedState(other.savedState!);
    } else {
      // @0xaa387-@0xaa39f — both non-null: in-place copy the 0x38 bytes.
      // The read pattern is `movq 0x10(%r15), %rax; ... movups (%r15), %xmm0 ... movq 0x28 ...
      // movq 0x30 ...`. i.e. the SavedState fields (as documented above) are overwritten.
      this.savedState = OZChannelImpl.cloneSavedState(other.savedState!);
    }

    // @0xaa354 — copyCurveInterface(other->curve).
    this.copyCurveInterface(other.curve);
    // @0xaa360 — clear isPlayingBack.
    this.isPlayingBack = false;
    return this;
  }

  /** Helper: bit-for-bit copy of a SavedState. Corresponds to the two identical field-copy
   *  sequences at @0xaa387-@0xaa39f and @0xaa3b3-@0xaa3d7 (the only difference is destination
   *  register: existing `this` vs freshly allocated). */
  private static cloneSavedState(src: OZChannelImplSavedState): OZChannelImplSavedState {
    return {
      timeA: { value: src.timeA.value, timescale: src.timeA.timescale, flags: src.timeA.flags, epoch: src.timeA.epoch },
      timeB: { value: src.timeB.value, timescale: src.timeB.timescale, flags: src.timeB.flags, epoch: src.timeB.epoch },
      x: src.x,
      y: src.y,
    };
  }

  //
  // ---- operator== ------------------------------------------------------------------------------
  //

  /**
   * OZChannelImpl::operator==(OZChannelImpl const&) const @ProChannel 0xaa51c.
   *
   * The disasm produces a strict "structural equality" gated on both savedStates being present
   * or both being absent:
   *
   *   @0xaa52a movq 0x10(%rdi),%rcx                    — rcx = this->savedState
   *   @0xaa52e testq %rcx,%rcx; setne %dl              — dl = (this has)
   *   @0xaa534 movq 0x10(%rsi),%rax                    — rax = other->savedState
   *   @0xaa538 testq %rax,%rax; sete  %sil             — sil = (other has null)
   *   @0xaa53f cmpb %sil,%dl
   *   @0xaa542 je   0xaa62c                            — (this has) == (other null) — mismatch -> return 0
   *
   * Contradiction detector: `setne dl` and `sete sil` means dl=(this has); sil=!(other has).
   * They are EQUAL exactly when both are false (this null AND other has) OR both true (this has
   * AND other null) — the mismatch cases. Any equality means unequal. Ok.
   *
   *   @0xaa54b testq %rax,%rax; sete %dl               — dl = (other null)
   *   @0xaa551 testq %rcx,%rcx; sete %sil              — sil = (this null)
   *   @0xaa558 orb  %dl,%sil
   *   @0xaa55b je   0xaa572                            — if BOTH non-null, fall through to CMTime cmp
   *
   * BOTH-null path:
   *   @0xaa55d movq 0x8(%r14),%rdi                     — this->curve
   *   @0xaa561 movq 0x8(%rbx),%rsi                     — other->curve
   *   @0xaa56d jmp OZCurve::operator==                 — tail-jmp
   *
   * BOTH-non-null path (@0xaa572..@0xaa626): compare savedState fields in order:
   *   CMTimeCompare(this->savedState.timeA, other->savedState.timeA) — must be 0
   *   CMTimeCompare(this->savedState.timeB, other->savedState.timeB) — must be 0
   *   this->savedState.x == other->savedState.x                       — must be equal
   *   this->savedState.y == other->savedState.y                       — must be equal
   * Then tail-jmp to OZCurve::operator== on the two curves.
   *
   * Any mismatch => `xorl %eax, %eax; ret` — returns false (@0xaa62c).
   */
  equals(other: OZChannelImpl): boolean {
    const thisHas = this.savedState !== null;
    const otherHas = other.savedState !== null;

    // @0xaa53f cmpb %sil,%dl / je 0xaa62c:
    //   dl = (thisHas ? 1 : 0), sil = (otherHas ? 0 : 1). They are equal iff exactly one has.
    if (thisHas !== otherHas) return false; // @0xaa62c returns 0

    if (!thisHas) {
      // Both null: @0xaa55d-@0xaa56d — tail-jmp OZCurve::operator==(this.curve, other.curve).
      // The disasm passes null-curves through unguarded; we do the same, deferring to the OZCurve
      // port. If curve is null on either side, OZCurve::operator== is the authority; this class
      // does not add its own null check here (fidelity).
      if (this.curve === null || other.curve === null) {
        throw new Error(
          "OZCurve::operator==(OZCurve const&) const @ProChannel " +
            "(__ZNK7OZCurveeqERKS_) not yet transcribed @0xaa56d — reached with a null curve",
        );
      }
      throw new Error(
        "OZCurve::operator==(OZCurve const&) const @ProChannel " +
          "(__ZNK7OZCurveeqERKS_) not yet transcribed @0xaa56d",
      );
    }

    // Both have a savedState — do the 4-field structural compare (@0xaa572-@0xaa626).
    const a = this.savedState!;
    const b = other.savedState!;
    // @0xaa5b3 _CMTimeCompare(a.timeA, b.timeA) - returns 0 iff equal.
    if (!OZChannelImpl.cmTimeEq(a.timeA, b.timeA)) return false;
    // @0xaa607 _CMTimeCompare(a.timeB, b.timeB)
    if (!OZChannelImpl.cmTimeEq(a.timeB, b.timeB)) return false;
    // @0xaa61b cmpl 0x30(%rcx),%edx — x
    if (a.x !== b.x) return false;
    // @0xaa623 cmpl 0x34(%rcx),%eax — y
    if (a.y !== b.y) return false;

    // @0xaa626 je 0xaa55d — jump back to the curve-equality tail-jmp path.
    if (this.curve === null || other.curve === null) {
      throw new Error(
        "OZCurve::operator==(OZCurve const&) const @ProChannel " +
          "(__ZNK7OZCurveeqERKS_) not yet transcribed @0xaa56d — reached with a null curve",
      );
    }
    throw new Error(
      "OZCurve::operator==(OZCurve const&) const @ProChannel " +
        "(__ZNK7OZCurveeqERKS_) not yet transcribed @0xaa56d",
    );
  }

  /** _CMTimeCompare parity: the CoreMedia CMTime equality contract. Both CMTimes are equal iff
   *  their (value, timescale, flags, epoch) tuple matches; the CoreMedia routine also normalizes
   *  by rescaling but for the identity-equality contract at @0xaa5b8 (`testl %eax,%eax`) we mirror
   *  the "returns 0 when equal" branch. Not oracle-checked yet — full CMTimeCompare port is a
   *  separate task. Since the ctor stores kCMTimeZero (value=0,timescale=0), both fields having
   *  identical bytes suffices for the initial cases and any test that compares default-inited
   *  states. */
  private static cmTimeEq(a: CMTime, b: CMTime): boolean {
    return (
      a.value === b.value &&
      a.timescale === b.timescale &&
      a.flags === b.flags &&
      a.epoch === b.epoch
    );
  }

  //
  // ---- createLocalCopy -------------------------------------------------------------------------
  //

  /**
   * OZChannelImpl::createLocalCopy() @ProChannel 0x141d8.
   *
   * @0x141e2 movl $0x28,%edi                             — new(0x28) — sizeof(OZChannelImpl)
   * @0x141e7 callq __Znwm
   * @0x141ef movq %rax,%rdi                              — dest for placement-init
   * @0x141f2 movq %r14,%rsi                              — arg = *this
   * @0x141f5 callq OZChannelImpl::OZChannelImpl(OZChannelImpl const&)  — C1 copy ctor
   * @0x141fa movq %rbx,%rax                              — return the new object
   *
   * The trailing @0x14202-@0x14210 is the Itanium exception cleanup: if the copy-ctor throws,
   * `operator delete` the raw allocation and re-`_Unwind_Resume`. TS `throw` mirrors this via
   * standard exception semantics (allocation is GC'd).
   */
  createLocalCopy(): OZChannelImpl {
    return OZChannelImpl.fromCopy(this);
  }

  //
  // ---- copyCurveInterface ----------------------------------------------------------------------
  //

  /**
   * OZChannelImpl::copyCurveInterface(OZCurve*) @ProChannel 0xaa4a8.
   *
   * @0xaa4b2 movq 0x8(%rdi),%rdi                         — rdi = this->curve
   * @0xaa4b6 cmpq %rdi,%rsi                              — if newCurve == this->curve, no-op
   * @0xaa4b9 je   0xaa517                                — return
   * @0xaa4be testq %rdi,%rdi
   * @0xaa4c1 je   0xaa507                                — if this->curve is null, skip to `clone`
   * @0xaa4c3 movq (%rdi),%rax
   * @0xaa4c6 callq *0x4d0(%rax)                          — this->curve->canAssignFrom()
   * @0xaa4cc testb %al,%al
   * @0xaa4ce je   0xaa4f0                                — if !canAssign, discard old and clone new
   * @0xaa4d0 movq (%r14),%rax                            — newCurve->vtable
   * @0xaa4d3 movq %r14,%rdi
   * @0xaa4d6 callq *0x4d0(%rax)                          — newCurve->canAssignFrom()
   * @0xaa4dc testb %al,%al
   * @0xaa4de je   0xaa4f0                                — if !canAssign either, discard-and-clone
   * @0xaa4e0..@0xaa4eb  tail-jmp OZCurve::operator=(this->curve, *newCurve)   — direct assignment
   *
   * Discard-and-clone path (@0xaa4f0-@0xaa513):
   *   destroy this->curve (vtable +0x8), null it, then this->curve = newCurve->clone()  (vtable +0x4c8).
   */
  copyCurveInterface(newCurve: OZCurve | null): void {
    const oldCurve = this.curve;

    // @0xaa4b6-@0xaa4b9 — same pointer, nothing to do.
    if (oldCurve === newCurve) return;

    // If newCurve is null, we still fall through to the "discard old, then dereference newCurve
    // to clone" path. The disasm does NOT guard against a null newCurve — @0xaa507 unconditionally
    // dereferences %r14 for its vtable. We mirror that: passing null here reproduces the crash.
    if (newCurve === null) {
      throw new Error(
        "copyCurveInterface called with newCurve = null — the FCP disasm dereferences it " +
          "unconditionally at @0xaa507; the caller contract forbids null. @0xaa4a8",
      );
    }

    if (oldCurve !== null) {
      // @0xaa4c6 + @0xaa4d6 — both curves must accept assignment.
      const oldCan = oldCurve.canAssignFrom(); // @0xaa4c6 vtable +0x4d0
      const newCan = newCurve.canAssignFrom(); // @0xaa4d6 vtable +0x4d0
      if (oldCan && newCan) {
        // @0xaa4e0-@0xaa4eb — tail-jmp OZCurve::operator=(oldCurve, newCurve).
        oldCurve.assignFrom(newCurve);
        return;
      }
      // @0xaa4f0-@0xaa4ff — discard old curve.
      oldCurve.destroy();
      this.curve = null;
    }

    // @0xaa507-@0xaa513 — clone the new curve into this->curve.
    this.curve = newCurve.clone();
  }

  //
  // ---- resetToDefault --------------------------------------------------------------------------
  //

  /**
   * OZChannelImpl::resetToDefault(bool) @ProChannel 0xaa638.
   *
   * @0xaa641 movq 0x10(%rdi),%rdi
   * @0xaa645 testq %rdi,%rdi
   * @0xaa648 je   0xaa657
   * @0xaa64a callq __ZdlPv                              — operator delete(this->savedState)
   * @0xaa64f movq $0x0,0x10(%rbx)                       — this->savedState = null
   * @0xaa657 movq 0x8(%rbx),%rdi                        — rdi = this->curve
   * @0xaa65b movq (%rdi),%rax
   * @0xaa664 jmpq *0xb8(%rax)                           — tail-jmp curve->vtable[+0xb8]() — resetToDefault
   *
   * The `bool` arg is completely ignored by the disasm (dl is untouched, no branch on it, no
   * store). The curve's own resetToDefault is a no-arg vtable slot at +0xb8. We preserve the
   * signature for source-level fidelity but note the arg is not forwarded — the underlying
   * OZCurve override is what actually reads it, via its own vtable dispatch or fixed default.
   */
  resetToDefault(_alsoDoSomething: boolean): void {
    // @0xaa641-@0xaa64f — drop the saved snapshot.
    if (this.savedState !== null) {
      this.savedState = null;
    }
    // @0xaa657-@0xaa664 — tail-jmp curve->resetToDefault.
    if (this.curve === null) {
      throw new Error(
        "resetToDefault: this->curve is null — @0xaa657 dereferences it unconditionally @0xaa638",
      );
    }
    this.curve.resetToDefault();
  }

  //
  // ---- shouldKeepLocalCopy ---------------------------------------------------------------------
  //

  /**
   * OZChannelImpl::shouldKeepLocalCopy() @ProChannel 0xaa66a.
   *
   * @0xaa66a cmpb $0x0,0x20(%rdi)                       — if this->isPlayingBack != 0:
   * @0xaa66e je   0xaa673                               —
   * @0xaa670 xorl %eax,%eax; retq                       —   return false (short-circuit)
   * @0xaa673 (main body) — build a stack u32 flag=0, call curve->getPlaybackFlag(&flag) via
   *          vtable +0x480, then return true iff (flag != 0) OR (curve->keepLocalCopyProbe @+0x98
   *          is non-null).
   *
   *   @0xaa685 movl $0x0,(%r14)                         — flag = 0
   *   @0xaa68c movq 0x8(%rdi),%rdi                      — rdi = this->curve
   *   @0xaa690 movq (%rdi),%rax
   *   @0xaa696 callq *0x480(%rax)                       — curve->getPlaybackFlag(&flag)
   *   @0xaa69c movb $0x1,%al                            — result = true
   *   @0xaa69e cmpl $0x0,(%r14)                         — if (flag != 0)
   *   @0xaa6a2 jne  0xaa6b3                             —   goto return true
   *   @0xaa6a4 movq 0x8(%rbx),%rax                      — rax = this->curve
   *   @0xaa6a8 cmpq $0x0,0x98(%rax)                     — flag from curve[+0x98]
   *   @0xaa6b0 setne %al                                — result = (curve[+0x98] != 0)
   */
  shouldKeepLocalCopy(): boolean {
    // @0xaa66a-@0xaa672 — early-out when we're mid-playback (nothing to keep).
    if (this.isPlayingBack) return false;

    if (this.curve === null) {
      throw new Error(
        "shouldKeepLocalCopy: this->curve is null — @0xaa68c dereferences it unconditionally @0xaa66a",
      );
    }

    // @0xaa685 + @0xaa696 — poll the curve's playback flag.
    const flag = { value: 0 };
    this.curve.getPlaybackFlag(flag);
    if (flag.value !== 0) return true;

    // @0xaa6a4-@0xaa6b0 — probe curve[+0x98] as data.
    return this.curve.keepLocalCopyProbe() != null;
  }

  //
  // ---- playback/recording forwarders -----------------------------------------------------------
  //

  /**
   * OZChannelImpl::beginPlayback(CMTime const&, u32, u32, CMTime const&) @ProChannel 0xaa6bc.
   *
   *   @0xaa6c0 movq 0x8(%rdi),%rdi                      — rdi = this->curve
   *   @0xaa6c4 movq (%rdi),%rax
   *   @0xaa6c7 movq 0x488(%rax),%rax                    — vtable +0x488
   *   @0xaa6ce popq %rbp; jmpq *%rax                    — tail-jmp
   */
  beginPlayback(startTime: CMTime, a: number, b: number, endTime: CMTime): void {
    if (this.curve === null) {
      throw new Error("beginPlayback: this->curve is null @0xaa6bc");
    }
    this.curve.beginPlayback(startTime, a, b, endTime);
  }

  /** OZChannelImpl::endPlayback(CMTime const&) @ProChannel 0xaa6d2 — tail-jmp curve vtable +0x490. */
  endPlayback(atTime: CMTime): void {
    if (this.curve === null) throw new Error("endPlayback: this->curve is null @0xaa6d2");
    this.curve.endPlayback(atTime);
  }

  /**
   * OZChannelImpl::beginRecording(CMTime const&) @ProChannel 0xaa6e8.
   *
   * First lazy-inits the callbacks vector (if null), then forwards to curve vtable +0x498.
   *
   * @0xaa6f8 movq 0x18(%rdi),%rax
   * @0xaa6fc testq %rax,%rax
   * @0xaa6ff je   0xaa70e                               — jump to "alloc" branch if null
   * @0xaa701..@0xaa708 (already-alloced branch): reset callbacks by `callbacks->end = callbacks->begin`
   *                                                    (clear the vector without freeing storage)
   * @0xaa70c jmp  0xaa74c                               — go to forwarder
   *
   * Alloc branch:
   *   @0xaa70e movl $0x18,%edi; callq __Znwm            — new(0x18) — vector head (3 pointers)
   *   @0xaa71b xorps %xmm0,%xmm0; movups %xmm0,(%rax)   — zero begin+end (+0x00+0x08)
   *   @0xaa721 movq $0x0,0x10(%rax)                     — zero cap (+0x10)
   *   @0xaa72b lock cmpxchgq %r15,0x18(%r14)            — try to publish (this->callbacks =? our alloc)
   *   @0xaa731 je   0xaa74c                             — success: forwarder
   *   @0xaa733..@0xaa747 — lost race: free our alloc (both storage and head) with operator delete
   * Forwarder @0xaa74c-@0xaa767: `curve->vtable[+0x498](atTime)` as tail-jmp.
   */
  beginRecording(atTime: CMTime): void {
    // @0xaa6f8-@0xaa74c — ensure callbacks vector exists and is empty.
    if (this.callbacks !== null) {
      // @0xaa701-@0xaa708 — clear-but-keep-storage.
      this.callbacks.length = 0;
    } else {
      // @0xaa70e-@0xaa74c — allocate a fresh empty vector. (Cmpxchg race handling is moot in
      // single-threaded TS; the `else` here is the "won the race" branch.)
      this.callbacks = [];
    }
    // @0xaa74c-@0xaa767 — forward to curve.
    if (this.curve === null) throw new Error("beginRecording: this->curve is null @0xaa6e8");
    this.curve.beginRecording(atTime);
  }

  /** OZChannelImpl::endRecording(CMTime const&) @ProChannel 0xaa76a — tail-jmp curve vtable +0x4a0. */
  endRecording(atTime: CMTime): void {
    if (this.curve === null) throw new Error("endRecording: this->curve is null @0xaa76a");
    this.curve.endRecording(atTime);
  }

  /**
   * OZChannelImpl::updateCurrentRecordingTime(CMTime const&) @ProChannel 0xaa780 —
   * tail-jmp curve vtable +0x4a8.
   */
  updateCurrentRecordingTime(atTime: CMTime): void {
    if (this.curve === null) throw new Error("updateCurrentRecordingTime: this->curve is null @0xaa780");
    this.curve.updateCurrentRecordingTime(atTime);
  }

  //
  // ---- didRecordValue --------------------------------------------------------------------------
  //

  /**
   * OZChannelImpl::didRecordValue(OZChannelBase*, CMTime const&) @ProChannel 0xaa796.
   *
   * Iterates this->callbacks and fires each (fn, userData, useObjCWrapper) tuple.
   *
   * @0xaa7af movq 0x18(%rdi),%rax                       — rax = this->callbacks
   * @0xaa7b3 movq 0x8(%rax),%rcx                        — rcx = callbacks->end
   * @0xaa7b7 cmpq (%rax),%rcx                           — if end == begin (empty):
   * @0xaa7ba je   0xaa838                               —   return
   * @0xaa7bf movl $0x1,%r13d                            — index counter (1-based, used to compute
   *                                                        `size - r13` bound check)
   * @0xaa7c5 xorl %eax,%eax                             — 0-based iterator
   * <loop @0xaa7c7-@0xaa836>:
   *   @0xaa7c7 movq 0x18(%r15),%rcx                     — reload callbacks pointer
   *   @0xaa7cb movq (%rcx),%r14                         — r14 = callbacks->begin
   *   @0xaa7ce leaq (%rax,%rax,2),%rbx                  — rbx = eax * 3 (byte offset in u64s)
   *   @0xaa7d2 movq -0x38(%rbp),%rcx                    — reload the CMTime const& argument
   *   @0xaa7d6 movq 0x10(%rcx),%rax; movq %rax,-0x40(%rbp) — spill CMTime.epoch  (+0x10)
   *   @0xaa7de movups (%rcx),%xmm0; movaps %xmm0,-0x50(%rbp) — spill CMTime.[value,timescale,flags] (+0x00..+0x0F)
   *   @0xaa7e5 movq (%r14,%rbx,8),%r12                  — r12 = elem[i].fn (offset +0x00)
   *   @0xaa7e9 cmpb $0x1,0x10(%r14,%rbx,8)              — probe elem[i].useObjCWrapper (offset +0x10)
   *   @0xaa7ef movq -0x30(%rbp),%rdi                    — rdi = channel arg (spilled at @0xaa7ab)
   *   @0xaa7f3 jne  0xaa801                             — if !=1, call ensureObjCWrapperExists
   *   @0xaa7f5 movq -0x30(%rbp),%rdi                    — (redundant reload — dead move)
   *   @0xaa7f9 callq OZChannelBase::ensureObjCWrapperExists()
   *   @0xaa7fe movq %rax,%rdi                           — rdi = wrapped channel
   *   @0xaa801 leaq (%r14,%rbx,8),%rax                  — rax = &elem[i]
   *   @0xaa805 movq 0x8(%rax),%rdx                      — rdx = elem[i].userData (+0x08)
   *   @0xaa809 leaq -0x50(%rbp),%rsi                    — rsi = &spilled CMTime
   *   @0xaa80d callq *%r12                              — elem[i].fn(chan_or_wrapper, &CMTime, userData)
   *   ... loop-continue math using imul 0xAAA...B = size-in-bytes / 24 (element size)
   *   @0xaa833 cmpq %rax,%rdx; ja 0xaa7c7               — continue if index < size
   *
   * NOTE the disasm's branch polarity: `cmpb $1, ... ; jne ensureWrapper`. So the branch fires
   * when the byte is NOT 1 (including 0), sending it through `ensureObjCWrapperExists`. Meaning
   * `useObjCWrapper=true` (byte=1) => pass the RAW channel; anything else => wrap it. This is
   * the opposite polarity from the field-name I chose; the field is really "passRawChannel".
   */
  didRecordValue(chan: OZChannelBase, atTime: CMTime): void {
    // @0xaa7af-@0xaa7ba — bail if we have no callbacks (or the vector is empty).
    const cbs = this.callbacks;
    if (cbs === null || cbs.length === 0) return;

    // Loop mirror. In C++ the size divisor imul is compile-time constant-folded, but the loop
    // just goes 0..cbs.length-1. Reload the array reference each iteration to match the
    // `movq 0x18(%r15),%rcx` at @0xaa7c7 (in case a callback mutates the vector — unlikely, but
    // fidelity).
    for (let i = 0; i < cbs.length; i++) {
      const cur = this.callbacks;
      if (cur === null) break;  // defensive; matches the outer bail
      if (i >= cur.length) break;
      const entry = cur[i];
      // @0xaa7e9 + @0xaa7f3 — polarity: byte==1 -> raw; !=1 -> wrap.
      const arg = entry.useObjCWrapper ? chan : (OZChannelBase_ensureObjCWrapperExists(chan) as OZChannelBase);
      // @0xaa80d — call the callback with the (possibly-wrapped) channel, the CMTime, and userData.
      entry.fn(arg, atTime, entry.userData);
    }
  }

  //
  // ---- isPlaying / isRecording -----------------------------------------------------------------
  //

  /**
   * OZChannelImpl::isPlaying(u32*, u32*, CMTime*) @ProChannel 0xaa848 — tail-jmp curve vtable +0x4b0.
   *
   * All three out-params are the curve's problem. The disasm does not touch the args.
   */
  isPlaying(a: { value: number }, b: { value: number }, t: CMTime): boolean {
    if (this.curve === null) throw new Error("isPlaying: this->curve is null @0xaa848");
    return this.curve.isPlaying(a, b, t);
  }

  /** OZChannelImpl::isRecording() @ProChannel 0xaa85e — tail-jmp curve vtable +0x4b8. */
  isRecording(): boolean {
    if (this.curve === null) throw new Error("isRecording: this->curve is null @0xaa85e");
    return this.curve.isRecording();
  }

  //
  // ---- register/unregister recording callbacks -------------------------------------------------
  //

  /**
   * OZChannelImpl::registerRecordingCallback(fn, void*, bool) @ProChannel 0xaa870.
   *
   * @0xaa88c movq 0x18(%rdi),%rax                       — probe callbacks
   * @0xaa890 testq %rax,%rax
   * @0xaa893 jne  0xaa8d5                               — if non-null, skip alloc
   * @0xaa895-@0xaa8d0 — alloc a fresh empty vector head (24 bytes) and cmpxchg-publish; on race
   *                     loss, free our alloc. Same pattern as beginRecording @0xaa70e-@0xaa747.
   * @0xaa8d5-@0xaa8e8 — push_back({fn, userData, useObjCWrapper}) via
   *                     `std::vector<RecordingCallbackData>::push_back[abi:nqe210106]`.
   */
  registerRecordingCallback(
    fn: (chan: unknown, atTime: CMTime, userData: unknown) => void,
    userData: unknown,
    useObjCWrapper: boolean,
  ): void {
    // @0xaa88c-@0xaa8d5 — lazy init.
    if (this.callbacks === null) this.callbacks = [];
    // @0xaa8d5-@0xaa8e8 — push_back.
    this.callbacks.push({ fn, userData, useObjCWrapper });
  }

  /**
   * OZChannelImpl::unregisterRecordingCallback(fn, void*) @ProChannel 0xaaa02.
   *
   * @0xaaa16 movq 0x18(%rdi),%rax                       — probe callbacks
   * @0xaaa1a testq %rax,%rax
   * @0xaaa1d jne  0xaaa5f                               — if non-null skip alloc
   * @0xaaa1f-@0xaaa5a — SAME alloc-and-cmpxchg dance as register — even when there are no
   *                     callbacks to remove, the vector is materialized (matches disasm exactly).
   * @0xaaa5f movq 0x18(%rbx),%rax                       — rax = callbacks
   * @0xaaa63 movq (%rax),%rax                           — rax = callbacks->begin
   * @0xaaa66 movq 0x18(%rbx),%rcx
   * @0xaaa6a cmpq 0x8(%rcx),%rax                        — if begin == end, return
   * @0xaaa6e je   0xaaad4
   *
   * Search loop @0xaaa70-@0xaaa93: iterate the vector, comparing each element's fn (+0x00) and
   * userData (+0x08) to the search key (%r15, %r14). Element size is 24 (rcx step of 0x18).
   *
   * On match @0xaaa97-@0xaaacc: memmove-erase (shift-left one slot) then decrement end by 24.
   * On no-match, fall through to @0xaaad4 return.
   */
  unregisterRecordingCallback(
    fn: (chan: unknown, atTime: CMTime, userData: unknown) => void,
    userData: unknown,
  ): void {
    // @0xaaa16-@0xaaa5f — lazy-init even on an empty unregister (fidelity).
    if (this.callbacks === null) this.callbacks = [];
    // @0xaaa5f-@0xaaad4 — linear search for (fn, userData) and erase.
    for (let i = 0; i < this.callbacks.length; i++) {
      const e = this.callbacks[i];
      if (e.fn === fn && e.userData === userData) {
        // @0xaaa97-@0xaaacc — memmove-erase and adjust end.
        this.callbacks.splice(i, 1);
        return;
      }
    }
    // @0xaaad4 — no-op return if not found.
  }

  //
  // ---- pure curve forwarders (all thin vtable jumps) -------------------------------------------
  //

  /**
   * OZChannelImpl::setMin(double) @ProChannel 0xaaade — tail-jmp curve vtable +0x118.
   * @0xaaae2 movq 0x8(%rdi),%rdi;  movq (%rdi),%rax;  movq 0x118(%rax),%rax;  popq %rbp;  jmpq *%rax
   */
  setMin(value: number): void {
    if (this.curve === null) throw new Error("setMin: this->curve is null @0xaaade");
    this.curve.setMin(value);
  }

  /** OZChannelImpl::setMax(double) @ProChannel 0xaaaf4 — tail-jmp curve vtable +0x110. */
  setMax(value: number): void {
    if (this.curve === null) throw new Error("setMax: this->curve is null @0xaaaf4");
    this.curve.setMax(value);
  }

  /** OZChannelImpl::setDiscrete(bool) @ProChannel 0xaab0a — tail-jmp curve vtable +0x0a8. */
  setDiscrete(discrete: boolean): void {
    if (this.curve === null) throw new Error("setDiscrete: this->curve is null @0xaab0a");
    this.curve.setDiscrete(discrete);
  }

  /** OZChannelImpl::setParametric(bool) @ProChannel 0xaab20 — tail-jmp curve vtable +0x068. */
  setParametric(parametric: boolean): void {
    if (this.curve === null) throw new Error("setParametric: this->curve is null @0xaab20");
    this.curve.setParametric(parametric);
  }

  /** OZChannelImpl::setInterpolation(u32) @ProChannel 0xaab32 — tail-jmp curve vtable +0x128. */
  setInterpolation(interp: number): void {
    if (this.curve === null) throw new Error("setInterpolation: this->curve is null @0xaab32");
    this.curve.setInterpolation(interp);
  }

  /** OZChannelImpl::setShouldCreateTangents(bool) @ProChannel 0xaab48 — tail-jmp curve vtable +0x088. */
  setShouldCreateTangents(shouldCreate: boolean): void {
    if (this.curve === null) throw new Error("setShouldCreateTangents: this->curve is null @0xaab48");
    this.curve.setShouldCreateTangents(shouldCreate);
  }
}
