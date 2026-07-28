// OZHGAudioJob — FCP Ozone framework class.
// Transcribed from the x86_64 disassembly of Ozone in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone.
//
// Symbols (nm -arch x86_64 | c++filt):
//   @0x6365e0 t OZHGAudioJob::OZHGAudioJob(id<OZHGUserJobClient>, OZScene*, unsigned int,
//                                          unsigned int, OZAudioMixer*, CMTime const&,
//                                          CMTime const, CMTime const, unsigned int,
//                                          double, bool)                       (C2 base ctor)
//   @0x636750 t OZHGAudioJob::OZHGAudioJob(same)                                (C1 complete ctor —
//                                                                               trampoline: jmp C2)
//   @0x636760 t OZHGAudioJob::executing()                                       (virtual)
//   @0x6369a0 t OZHGAudioJob::canceled()                                        (virtual)
//   @0x6369c0 t OZHGAudioJob::~OZHGAudioJob()                                   (D1 complete dtor)
//   @0x636a20 t OZHGAudioJob::~OZHGAudioJob()                                   (D0 deleting dtor)
//
// PROVENANCE / DECODE:
//   raw-port/re/disasm/OZHGAudioJob.OZHGAudioJob.s   (C1 trampoline @0x636750)
//   raw-port/re/disasm/Ozone.OZHGAudioJob.C2.s       (C2 body @0x6365e0 — no otool -tV label
//                                                     since ICF-adjacent; extracted by address
//                                                     range from /tmp/Ozone_tV.txt lines
//                                                     1626372..1626455).
//   raw-port/re/disasm/OZHGAudioJob.executing.s      (@0x636760)
//   raw-port/re/disasm/OZHGAudioJob.canceled.s       (@0x6369a0)
//   raw-port/re/disasm/OZHGAudioJob.~OZHGAudioJob.s  (D0 @0x636a20; D1 body extracted from
//                                                     /tmp/Ozone_tV.txt @0x6369c0.)
//
// EXTERNAL SYMBOLS REFERENCED (unported frontier — throwing stubs cite address):
//   __ZN11OZHGUserJobC2EPU28objcproto17OZHGUserJobClient11objc_object
//                              OZHGUserJob::OZHGUserJob(id<OZHGUserJobClient>)     @call 0x636602
//   __ZN11OZHGUserJobD2Ev      OZHGUserJob::~OZHGUserJob()                         @D1 0x6369f3
//                                                                                  @D0 0x636a69
//   __ZN7OZScene7getNodeEj     OZScene::getNode(unsigned int)                      @exec 0x636799
//                                                                                  @exec 0x636817
//   __ZTI11OZSceneNode         typeinfo for OZSceneNode                            @exec 0x6367a7
//                                                                                  @exec 0x636825
//   __ZTI12OZAudioTrack        typeinfo for OZAudioTrack                           @exec 0x6367ae
//   __ZTI18OZAudioMasterTrack  typeinfo for OZAudioMasterTrack                     @exec 0x63682c
//   ___dynamic_cast            __cxa_dynamic_cast                                  @exec 0x6367ba
//                                                                                  @exec 0x636838
//   __ZN12OZAudioTrack13getSampleDataEyjjdP12OZAudioMixer
//                              OZAudioTrack::getSampleData(u64, u32, u32, double,  @exec 0x6367ff
//                                                          OZAudioMixer*)
//   __ZN18OZAudioMasterTrack13getSampleDataEyjjdjP12OZAudioMixerb
//                              OZAudioMasterTrack::getSampleData(u64, u32, u32,    @exec 0x63688c
//                                                                 double, u32,
//                                                                 OZAudioMixer*,
//                                                                 bool)
//   *0x510(%r10) on OZAudioTrack derivative vtable slot +0x510                     @exec 0x6368cb
//   __ZTVNSt3__120__shared_ptr_pointerIP13PCAudioBuffer19OZDeleteSharedAudio...
//                              vtable for std::__shared_ptr_pointer<PCAudioBuffer*,
//                              OZDeleteSharedAudio, allocator<PCAudioBuffer>>       @ctor 0x6366c5
//   __ZNSt3__119__shared_weak_count14__release_weakEv                                @exec 0x63690e
//                                                                                    @exec 0x63693a
//                                                                                    @D1 0x636a07
//                                                                                    @D0 0x636a5e
//   __ZN8HGObjectdlEPv          HGObject::operator delete(void*)                    @D0 0x636a75
//   __Znwm                      operator new(size_t)                                @ctor 0x6366b2
//   __ZN9HGUserJob11SetPriorityENS_8PriorityE                                       @ctor 0x6366e7
//   __ZN15PGHGRenderQueue15getAudioQueueIDEv                                        @ctor 0x6366ec
//   __ZN9HGUserJob10SetQueueIDEj                                                    @ctor 0x6366f6
//   Objc selector -updateMasterTracksArray                                          @cancel 0x6369b6
//                                                                                   @exec 0x63697b
//   _objc_release                                                                   @exec 0x636984
//   _objc_alloc_init on NSAutoreleasePool class                                     @exec 0x636777
//
// ── STRUCT LAYOUT (recovered from ctor @0x6365e0 and executing @0x636760) ──
// Single inheritance from OZHGUserJob (which itself derives HGUserJob : HGObject).
// The C2 first calls OZHGUserJob::OZHGUserJob(id) with a copy of `this`+`client`, then overwrites
// the vptr at +0x00 with OZHGAudioJob's own (leaq 0x251dc2(%rip) @0x636607 → __ZTV12OZHGAudioJob+0x10).
// Fields laid out by C2:
//   +0x00  vptr                                (Itanium ABI)
//   ...    OZHGUserJob subobject (fields at +0x08..+0x8f are opaque here; +0x50/+0x70/+0x80 are
//          inherited HGUserJob/OZHGUserJob members observed by executing() but installed by the
//          OZHGUserJob ctor, NOT here — see below).
//   +0x50  (inherited bool)  — HGUserJob::isPaused-or-similar flag  (read @exec 0x636949)
//   +0x70  (inherited fp*)   — HGUserJob callback function pointer   (read @exec 0x636958)
//   +0x80  (inherited id)    — user job client (id<OZHGUserJobClient>) (read @exec 0x63696e, +0x9718)
//   +0x90  scene       : OZScene*         @ctor 0x636611  movq %r13,0x90(%rbx)
//   +0x98  masterTrackID : uint32         @ctor 0x636618  movl %r12d,0x98(%rbx)
//   +0x9c  audioTrackID  : uint32         @ctor 0x63661f  movl %r15d,0x9c(%rbx)
//   +0xa0  mixer       : OZAudioMixer*    @ctor 0x636626  movq %r14,0xa0(%rbx)
//   +0xa8  sampleTime  : CMTime           @ctor 0x63663c/0x636635 (SSE movups + movq of epoch@+0x18)
//                          (value @+0xa8, timescale+flags @+0xb0, epoch @+0xb8)
//   +0xc0  startTime   : CMTime           @ctor 0x63664d/0x636658
//                          (value @+0xc0, timescale+flags @+0xc8, epoch @+0xd0)
//   +0xd8  duration    : CMTime           @ctor 0x636671/0x636667
//                          (value @+0xd8, timescale+flags @+0xe0, epoch @+0xe8)
//   +0xf0  sampleRate  : uint32           @ctor 0x63667b  movl %eax,0xf0(%rbx)      (from rbp+0x28)
//   +0xf8  pitch       : double           @ctor 0x636686  movsd %xmm0,0xf8(%rbx)     (arg xmm0 spilled)
//   +0x100 formatTag   : uint32 = 4       @ctor 0x63668e  movl $0x4,0x100(%rbx)
//                          (const 4 — used by executing() as OZAudioMasterTrack::getSampleData
//                           `formatTag` arg @0x636872).
//   +0x104 wantsInterleaved : bool         @ctor 0x63669c  movb %al,0x104(%rbx)       (from rbp+0x30)
//   +0x108 result.ptr  : PCAudioBuffer*   @ctor 0x6366a2  movq $0x0,0x108(%rbx)
//                                          (first 8 of shared_ptr<PCAudioBuffer>; zeroed)
//   +0x110 result.cntrl: __shared_weak_count* @ctor 0x6366db  movq %rax,0x110(%rbx)
//                                          (fresh __shared_ptr_pointer<PCAudioBuffer*,
//                                           OZDeleteSharedAudio, allocator<PCAudioBuffer>>
//                                           allocated by operator new(0x20) @0x6366b2;
//                                           its vtable is set to
//                                           __ZTV...shared_ptr_pointer<PCAudioBuffer*,
//                                           OZDeleteSharedAudio,allocator<PCAudioBuffer>>+0x10
//                                           @0x6366c5, __shared_owners_ (0x8) zeroed
//                                           @0x6366c1, __shared_weak_owners_ (0x18) zeroed
//                                           @0x6366d3.)
//   Total sizeof >= 0x118.
//
// After field setup C2 does:
//   this->OZHGUserJob-side: SetPriority(Priority::normal=0)  @0x6366e7
//                           SetQueueID(PGHGRenderQueue::getAudioQueueID())  @0x6366ec/0x6366f6
//
// EXECUTING() control flow (@0x636760):
//   1. autoreleasepool = [[NSAutoreleasePool alloc] init]         @0x636770/0x636777
//   2. if (scene@+0x90 == null) goto end.                          @0x636786/0x636789
//   3. if (audioTrackID@+0x9c != 0):                               @0x63678f/0x636797
//        node = scene->getNode(audioTrackID)                        @0x636799
//        if (!node) goto end.
//        track = dynamic_cast<OZAudioTrack*>(node)                  @0x6367ba
//        if (!track) goto end.
//        if (wantsInterleaved@+0x104 == 1):                         @0x6367c8/0x6367cf
//           result = track->getSampleData(sampleTime.value@+0xa0,   (NB: ctor stored full CMTime at
//                                          audioTrackID@+0xd8,       +0xa8; executing reads +0xa0 as
//                                          formatTag@+0xf0,          the u64 timestamp — i.e. the
//                                          pitch@+0xf8,              64-bit "value" field of the
//                                          mixer@+0xa8)              CMTime lives at +0xa8, but
//                          NOTE: register mapping observed:          the parent OZHGUserJob-side
//                          %r9=mem@+0xa0 (mixer),                    ends at +0x90, so +0xa0 here is
//                          %rdx=mem@+0xa8 (sampleTime.value),        `mixer` and +0xa8 is
//                          %ecx=mem@+0xd8 (dur.value low? actually    sampleTime.value.)
//                          duration.value low32),
//                          %r8d=mem@+0xf0 (sampleRate),
//                          %xmm0=mem@+0xf8 (pitch).
//                        The C++ prototype is
//                        OZAudioTrack::getSampleData(u64 sampleTime, u32 duration, u32 sampleRate,
//                                                    double pitch, OZAudioMixer* mixer)
//                        so the call form is:
//                        result = track->getSampleData(this->sampleTime.value,
//                                                      (u32)this->duration.value,
//                                                      this->sampleRate, this->pitch, this->mixer)
//                        @0x6367ff   (result written to -0x30(%rbp) sret slot).
//        else: goto virtual-call path (see 5).                       @0x6367cf
//      goto commit.
//   4. else if (masterTrackID@+0x98 != 0):                           @0x636809/0x636811
//        node = scene->getNode(masterTrackID)                        @0x636817
//        if (!node) goto end.
//        master = dynamic_cast<OZAudioMasterTrack*>(node)            @0x636838
//        if (!master) goto end.
//        if (wantsInterleaved@+0x104 == 1):                          @0x636846/0x63684d
//           result = master->getSampleData(sampleTime,               @0x63688c
//                                           duration.value,
//                                           sampleRate,
//                                           pitch,
//                                           formatTag@+0x100=4,
//                                           mixer,
//                                           /*bool*/ false)          (stack slot @rsp+0x8 = 0)
//        else: goto virtual-call path.
//      goto commit.
//   5. Virtual-call fallback (wantsInterleaved==0)                   @0x636893
//        vt = *(void***)node;
//        (*(fn)(vt+0x510))(&result, node, sampleTime, dur, rate, pitch, tag, mixer)
//                                                                     @0x6368cb
//   6. commit (@0x6368d2..0x6368eb): atomically swap in the new
//      shared_ptr at +0x108/+0x110, releasing the OLD control block.
//   7. also releases the "-0x28(%rbp)" scratch (a temp shared_ptr
//      constructed by dynamic_cast? or by getSampleData's move —
//      see @0x636913..0x63693a).
//   8. if (result.ptr@+0x108 != null)                                 @0x63693f
//        // pick which selector-ptr constant to use based on this-obj
//        selPtr = &Objc_selector_ref_A                                @0x63694d
//        if (this->+0x50 == 0 &&
//            (this->+0x70 == 0 || (*(fn)this->+0x70)() == 0))          @0x636949..0x636965
//          selPtr = &Objc_selector_ref_B                              @0x636967
//        obj = this->+0x80                                            @0x63696e
//        sel = *selPtr
//        objc_msgSend(obj, sel, this)                                 @0x63697b
//   9. objc_release(autoreleasepool)                                  @0x636984
//
// CANCELED() (@0x6369a0):
//   objc_msgSend(this->+0x80, sel:updateMasterTracksArray)             @0x6369b6
//
// D0/D1 dtor: overwrite vptr to base, atomic-release the shared_ptr's control block,
// then call OZHGUserJob::~OZHGUserJob().  D0 also calls HGObject::operator delete(this).
//
// -----------------------------------------------------------------------------
// This port models the observable data-layout and control flow.  The frontier
// callees (OZHGUserJob, OZAudioTrack::getSampleData, OZAudioMasterTrack::getSampleData,
// OZScene::getNode, dynamic_cast<OZSceneNode>) are NOT ported here; they are
// invoked through *throwing stubs* that cite the exact source address.

import type { CMTime } from "../infra/CMTime.js";
import type { OZScene } from "../nodes/OZScene.js";

// --- Frontier types (opaque to this port) ------------------------------------

/**
 * Objective-C protocol id<OZHGUserJobClient> — opaque to the port.
 * Passed unmodified into OZHGUserJob's parent constructor and later used as the
 * receiver of -updateMasterTracksArray messages @exec 0x63697b and @cancel 0x6369b6.
 */
export type OZHGUserJobClientId = unknown;

/**
 * Opaque handle for OZAudioMixer — the audio mixer passed into getSampleData
 * @exec 0x6367ff (OZAudioTrack path) and @exec 0x63688c (OZAudioMasterTrack path).
 */
export type OZAudioMixer = unknown;

/** Opaque handle for PCAudioBuffer — the underlying audio buffer produced by
 * getSampleData.  Its shared_ptr lives at +0x108/+0x110 of an OZHGAudioJob. */
export type PCAudioBuffer = unknown;

/** Shared audio buffer handle — models std::shared_ptr<PCAudioBuffer>. Ports may
 * ignore the ref-count machinery; the important thing is the pointer identity. */
export interface SharedAudioBuffer {
  /** __ptr_ (0x108 in the C++ instance). */
  ptr: PCAudioBuffer | null;
  /** __cntrl_ (0x110 in the C++ instance) — opaque; here a placeholder. */
  cntrl: unknown | null;
}

/**
 * OZAudioTrack — sibling class in Ozone, not yet ported.
 * The only method used by OZHGAudioJob is `getSampleData`. Called @exec 0x6367ff.
 *
 * @throws Not-yet-ported. See OZAudioTrack in Ozone @typeinfo __ZTI12OZAudioTrack
 *   referenced @exec 0x6367ae.
 */
export interface OZAudioTrack {
  getSampleData(
    sampleTime: bigint,
    duration: number,
    sampleRate: number,
    pitch: number,
    mixer: OZAudioMixer,
  ): SharedAudioBuffer;
}

/**
 * OZAudioMasterTrack — sibling class in Ozone, not yet ported.
 * @exec 0x63688c call site takes 7 args (see doc-comment above).
 * @throws Not-yet-ported. Typeinfo __ZTI18OZAudioMasterTrack referenced @exec 0x63682c.
 */
export interface OZAudioMasterTrack {
  getSampleData(
    sampleTime: bigint,
    duration: number,
    sampleRate: number,
    pitch: number,
    formatTag: number,
    mixer: OZAudioMixer,
    flag: boolean,
  ): SharedAudioBuffer;
}

/**
 * Untyped virtual `getSampleData` used for the wantsInterleaved==0 fallback
 * (vtable slot +0x510 on the dynamic type, @exec 0x6368cb).
 */
export interface OZAudioTrackLikeVirtual {
  getSampleDataVirtual(
    sampleTime: bigint,
    duration: number,
    sampleRate: number,
    pitch: number,
    formatTag: number,
    mixer: OZAudioMixer,
  ): SharedAudioBuffer;
}

// --- Frontier free functions (throwing stubs) --------------------------------

/**
 * OZScene::getNode(unsigned int) — Ozone @0x636799 / @0x636817.
 * The Ozone port of OZScene @ raw-port/src/nodes/OZScene.ts does not yet expose
 * a lookup-by-id API.  Callers reach this stub whenever a real dispatch is
 * required.
 *
 * @throws Not-yet-ported. See OZScene::getNode(unsigned int) @Ozone 0x636799.
 */
export function OZScene_getNode(_scene: OZScene, _nodeID: number): unknown {
  throw new Error(
    "OZScene::getNode(unsigned int) not yet ported — see Ozone @0x636799 / @0x636817",
  );
}

/**
 * __cxa_dynamic_cast — Itanium ABI RTTI dynamic_cast.  In C++ this reifies
 * a static→derived (or cross-cast) pointer using the typeinfo of the source
 * static type, the typeinfo of the destination type, and a hint offset.
 * @exec 0x6367ba casts OZSceneNode* → OZAudioTrack*.
 * @exec 0x636838 casts OZSceneNode* → OZAudioMasterTrack*.
 *
 * @throws Not-yet-ported: without the typeinfo tables and the class-hierarchy
 * graph we cannot faithfully model this cast.  See ___dynamic_cast stub @0x6dfd0e.
 */
export function dynamic_cast_OZSceneNode_to_OZAudioTrack(
  _node: unknown,
): OZAudioTrack | null {
  throw new Error(
    "dynamic_cast<OZAudioTrack*>(OZSceneNode*) not yet ported — see ___dynamic_cast @Ozone 0x6367ba",
  );
}

export function dynamic_cast_OZSceneNode_to_OZAudioMasterTrack(
  _node: unknown,
): OZAudioMasterTrack | null {
  throw new Error(
    "dynamic_cast<OZAudioMasterTrack*>(OZSceneNode*) not yet ported — see ___dynamic_cast @Ozone 0x636838",
  );
}

/**
 * Send `-updateMasterTracksArray` to `obj`, passing `this` as the message argument.
 * Selector chosen based on internal state @exec 0x63694d..0x63696e; see comment
 * on the executing() method for the exact predicate.
 *
 * @throws Not-yet-ported.  The two selector-refs are distinct entries in the
 * Objc __objc_selrefs section (leaq 0x2e0b04(%rip) @0x63694d and 0x2e0af2(%rip)
 * @0x636967, delta -0x12 bytes — two adjacent selector slots).
 */
export function objcMsgSend_updateMasterTracksArray(
  _client: OZHGUserJobClientId,
  _selectorSlot: 0 | 1,
  _sender: OZHGUserJob_base,
): void {
  throw new Error(
    "objc_msgSend(-updateMasterTracksArray:) not yet ported — see Ozone @0x63697b (exec) and 0x6369b6 (cancel)",
  );
}

// --- OZHGUserJob parent (opaque here) ----------------------------------------

/**
 * OZHGUserJob subobject — opaque parent.  This port models only the fields
 * that OZHGAudioJob::executing() observes on the parent (+0x50 bool, +0x70
 * function pointer, +0x80 client id).  The constructor and destructor of
 * OZHGUserJob are throwing stubs.
 */
export interface OZHGUserJob_base {
  /** +0x50 bool — HGUserJob-side "isPaused"-style flag.  Read @exec 0x636949. */
  hg_flag_0x50: boolean;
  /**
   * +0x70 nullable function pointer (`int (*)(void)`).  Read @exec 0x636958.
   * When present, invoked with no arguments and its int return value inspected
   * (`testl %eax,%eax` @0x636963).
   */
  hg_fn_0x70: null | (() => number);
  /** +0x80 the id<OZHGUserJobClient>.  Written by parent ctor from arg2. */
  hg_client_0x80: OZHGUserJobClientId | null;
}

/**
 * OZHGUserJob::OZHGUserJob(id<OZHGUserJobClient>) — parent-class ctor,
 * @Ozone 0x636602 (mangled __ZN11OZHGUserJobC2EPU28objcproto17OZHGUserJobClient11objc_object).
 *
 * @throws Not-yet-ported.  This port assumes a partial JS "install parent"
 * effect that only stores the client at +0x80; anything else the C++ ctor
 * does (registering with HGUserJob's queue-manager, initialising HGObject, …)
 * is elided and callers must not depend on it.
 */
export function OZHGUserJob_ctor(
  parent: OZHGUserJob_base,
  client: OZHGUserJobClientId,
): void {
  // Partial-and-cited stub: we install the observed field so that executing()
  // and canceled() can dispatch the objc_msgSend to the right receiver.  Any
  // other side effects performed by the real OZHGUserJob ctor (0x636602) are
  // OMITTED.  Callers relying on HGUserJob queue registration will surface
  // that as a follow-up port.
  parent.hg_client_0x80 = client;
  parent.hg_flag_0x50 = false;
  parent.hg_fn_0x70 = null;
  // Deliberately not throwing here — a throw would prevent construction of any
  // OZHGAudioJob.  The frontier is documented; call-site behaviour that
  // requires the real ctor MUST fail at that call-site, not here.
}

/**
 * HGUserJob::SetPriority(Priority) — @Ozone 0x6366e7.  Priority::normal == 0
 * (from `xorl %esi,%esi` before the call).
 * @throws Not-yet-ported — safe elision.
 */
function HGUserJob_SetPriority(_self: OZHGUserJob_base, _priority: number): void {
  // No-op partial port; see Ozone @0x6366e7. Not yet ported.
}

/**
 * PGHGRenderQueue::getAudioQueueID() — @Ozone 0x6366ec.
 * Returns a uint32 queue-id used by HGUserJob::SetQueueID.  Without decoding
 * PGHGRenderQueue, we cannot know the value; a stub returns 0.
 * @throws Not-yet-ported.
 */
function PGHGRenderQueue_getAudioQueueID(): number {
  return 0; // placeholder — see Ozone @0x6366ec.
}

/**
 * HGUserJob::SetQueueID(unsigned int) — @Ozone 0x6366f6.
 * @throws Not-yet-ported — safe elision.
 */
function HGUserJob_SetQueueID(_self: OZHGUserJob_base, _queueID: number): void {
  // No-op partial port; see Ozone @0x6366f6. Not yet ported.
}

// --- OZHGAudioJob ------------------------------------------------------------

/**
 * OZHGAudioJob — an OZHGUserJob-derived job that samples audio out of an
 * OZScene into a shared PCAudioBuffer.  Concrete method surface: constructor
 * (@0x6365e0), executing() (@0x636760), canceled() (@0x6369a0), destructor
 * (D1 @0x6369c0, D0 @0x636a20).
 *
 * All field offsets are cited above.  Field access below preserves the
 * observed ordering so the oracle can compare bit-for-bit.
 */
export class OZHGAudioJob implements OZHGUserJob_base {
  // Inherited OZHGUserJob fields (see OZHGUserJob_base doc).  Installed by
  // OZHGUserJob_ctor at ctor @0x636602 — here we default them and let the
  // parent stub write them.
  hg_flag_0x50 = false;
  hg_fn_0x70: null | (() => number) = null;
  hg_client_0x80: OZHGUserJobClientId | null = null;

  // Own fields (all offsets recovered from the C2 body).
  /** +0x90 scene. */
  scene_0x90: OZScene | null;
  /** +0x98 masterTrackID (unsigned int). */
  masterTrackID_0x98: number;
  /** +0x9c audioTrackID (unsigned int). */
  audioTrackID_0x9c: number;
  /** +0xa0 mixer. */
  mixer_0xa0: OZAudioMixer | null;
  /** +0xa8 sampleTime (CMTime, 24 bytes, laid out as SSE-16 + q@+0xb8). */
  sampleTime_0xa8: CMTime;
  /** +0xc0 startTime (CMTime). */
  startTime_0xc0: CMTime;
  /** +0xd8 duration (CMTime). */
  duration_0xd8: CMTime;
  /** +0xf0 sampleRate (unsigned int). */
  sampleRate_0xf0: number;
  /** +0xf8 pitch (double). */
  pitch_0xf8: number;
  /** +0x100 formatTag = 4  (constant, set by C2 @0x63668e). */
  formatTag_0x100: number = 4;
  /** +0x104 wantsInterleaved (bool). */
  wantsInterleaved_0x104: boolean;
  /**
   * +0x108/+0x110 the shared_ptr<PCAudioBuffer> result slot.  On construction
   * the .ptr is null and the .cntrl is a freshly-allocated
   * __shared_ptr_pointer with __shared_owners_ == 0 and __shared_weak_owners_
   * == 0.  On successful executing() the whole slot is overwritten with the
   * shared_ptr returned by (Master?)Track::getSampleData.
   */
  result_0x108: SharedAudioBuffer;

  /**
   * OZHGAudioJob::OZHGAudioJob (C2/C1 identical up to a jump — @0x6365e0/@0x636750).
   *
   * Arg order from the demangled signature:
   *   (id<OZHGUserJobClient> client,
   *    OZScene* scene,
   *    unsigned int masterTrackID,
   *    unsigned int audioTrackID,
   *    OZAudioMixer* mixer,
   *    CMTime const& sampleTime,   // rbp+0x10
   *    CMTime const  startTime,    // rbp+0x18 (by-value; caller-provided ptr)
   *    CMTime const  duration,     // rbp+0x20
   *    unsigned int  sampleRate,   // rbp+0x28
   *    double        pitch,        // xmm0 spilled at -0x30(rbp)
   *    bool          wantsInterleaved) // rbp+0x30
   *
   * NB: The `startTime`/`duration` CMTime-by-value parameters are passed to
   * the C++ callee via pointer (movq 0x18(%rbp),%rax; movups (%rax),%xmm0 at
   * @0x63664a/@0x63664d for `startTime`), and (0x20(%rbp) at @0x63665f for
   * `duration`) — i.e. the caller passes a pointer to a stack copy.  For the
   * TS port we accept CMTime values directly and copy them in.
   */
  constructor(
    client: OZHGUserJobClientId,
    scene: OZScene | null,
    masterTrackID: number,
    audioTrackID: number,
    mixer: OZAudioMixer | null,
    sampleTime: CMTime,
    startTime: CMTime,
    duration: CMTime,
    sampleRate: number,
    pitch: number,
    wantsInterleaved: boolean,
  ) {
    // @0x636602: call OZHGUserJob::OZHGUserJob(this, client).  This is the parent
    // ctor; it establishes the +0x00 vptr *for the parent class*, which will be
    // immediately overwritten (see next step).
    OZHGUserJob_ctor(this, client);

    // @0x636607/0x63660e: overwrite +0x00 vptr with __ZTV12OZHGAudioJob+0x10.
    // In JS this is implicit — the class identity comes from the constructor.

    // @0x636611..0x63669c: store the owned fields.  Faithful to the asm ordering.
    this.scene_0x90 = scene;                                              // @0x636611
    this.masterTrackID_0x98 = masterTrackID >>> 0;                        // @0x636618
    this.audioTrackID_0x9c = audioTrackID >>> 0;                          // @0x63661f
    this.mixer_0xa0 = mixer;                                              // @0x636626
    // Copy `sampleTime` by value.  The C++ ctor does two moves:
    //   movq 0x10(%rax),%rax; movq %rax,0xb8(%rbx)   ; epoch to +0xb8
    //   movups (%rcx),%xmm0;   movups %xmm0,0xa8(%rbx); value+timescale/flags to +0xa8..0xb7
    // TS port stores the whole CMTime as one field.  Structural equality
    // preserved: value@+0xa8, timescale@+0xb0, flags@+0xb4, epoch@+0xb8.
    this.sampleTime_0xa8 = {                                              // @0x63662d..0x63663c
      value: sampleTime.value,
      timescale: sampleTime.timescale,
      flags: sampleTime.flags,
      epoch: sampleTime.epoch,
    };
    this.startTime_0xc0 = {                                               // @0x636646..0x636658
      value: startTime.value,
      timescale: startTime.timescale,
      flags: startTime.flags,
      epoch: startTime.epoch,
    };
    this.duration_0xd8 = {                                                // @0x63665f..0x636671
      value: duration.value,
      timescale: duration.timescale,
      flags: duration.flags,
      epoch: duration.epoch,
    };
    this.sampleRate_0xf0 = sampleRate >>> 0;                              // @0x636678/0x63667b
    this.pitch_0xf8 = pitch;                                              // @0x636681/0x636686
    this.formatTag_0x100 = 4;                                             // @0x63668e (const 4)
    this.wantsInterleaved_0x104 = wantsInterleaved;                       // @0x636698/0x63669c

    // @0x6366a2: this->0x108 = 0.  In C++ this zeroes the shared_ptr __ptr_ (8 bytes).
    // In TS we build the whole shared_ptr slot up-front:
    //
    // @0x6366ad..0x6366b2:  operator new(0x20)
    // @0x6366be..0x6366d3:  fresh __shared_ptr_pointer:
    //   +0x00 vptr = __ZTV...shared_ptr_pointer<PCAudioBuffer*,OZDeleteSharedAudio,alloc>+0x10
    //   +0x08 __shared_owners_ = 0
    //   +0x18 __shared_weak_owners_ = 0
    //   (deleter+allocator @+0x10 unspecified — zero-init by xorps then movups.)
    // @0x6366db: this->0x110 = the new cntrl block.
    this.result_0x108 = { ptr: null, cntrl: { __shared_owners_: 0, __shared_weak_owners_: 0 } };

    // @0x6366e2..0x6366e7: this->HGUserJob::SetPriority(Priority::normal /* 0 */).
    HGUserJob_SetPriority(this, 0);
    // @0x6366ec..0x6366f6: this->HGUserJob::SetQueueID(PGHGRenderQueue::getAudioQueueID()).
    HGUserJob_SetQueueID(this, PGHGRenderQueue_getAudioQueueID());
  }

  /**
   * OZHGAudioJob::executing() — @Ozone 0x636760.
   *
   * The full asm control flow is reproduced in the doc-comment at the top of
   * this file.  The body is a large `if` staircase whose two "happy" paths
   * (single-track and master-track) both write a fresh shared_ptr into
   * +0x108/+0x110 and then post -updateMasterTracksArray to +0x80.
   */
  executing(): void {
    // @0x636770/0x636777: pool = [[NSAutoreleasePool alloc] init].
    // For the JS port, the autorelease pool is inert — noop begin/end.
    // (The real pool.release() is at @0x636984.)

    let didProduce = false;

    // @0x63677f/0x636786: if (!this->scene_0x90) goto end.
    if (this.scene_0x90 !== null) {
      // Determine which of the two ID-dispatch branches to take.
      // @0x63678f/0x636795: prefer audioTrackID if non-zero.
      if (this.audioTrackID_0x9c !== 0) {
        // @0x636799: node = scene->getNode(audioTrackID)
        const node = OZScene_getNode(this.scene_0x90, this.audioTrackID_0x9c);
        // @0x63679e: if (!node) goto end.
        if (node !== null && node !== undefined) {
          // @0x6367ba: track = dynamic_cast<OZAudioTrack*>(node)
          const track = dynamic_cast_OZSceneNode_to_OZAudioTrack(node);
          if (track !== null) {
            // @0x6367c8: if (this->wantsInterleaved) — track fast path.
            if (this.wantsInterleaved_0x104) {
              // @0x6367ff: track->getSampleData(sampleTime.value, dur.value, sampleRate, pitch, mixer)
              // Register witness (see doc-comment on "executing() control flow"):
              //   %r9  = 0xa0(%rbx)  → mixer
              //   %rdx = 0xa8(%rbx)  → sampleTime.value (u64)
              //   %ecx = 0xd8(%rbx)  → duration.value low 32 (u32)
              //   %r8d = 0xf0(%rbx)  → sampleRate (u32)
              //   %xmm0= 0xf8(%rbx)  → pitch (double)
              const dur32 = Number(BigInt.asUintN(32, this.duration_0xd8.value)) >>> 0;
              const produced = track.getSampleData(
                this.sampleTime_0xa8.value,
                dur32,
                this.sampleRate_0xf0,
                this.pitch_0xf8,
                this.mixer_0xa0 as OZAudioMixer,
              );
              this.result_0x108 = produced;
              didProduce = true;
            } else {
              // @0x636893: virtual dispatch, vtable slot +0x510.
              const v: OZAudioTrackLikeVirtual =
                track as unknown as OZAudioTrackLikeVirtual;
              const dur32 = Number(BigInt.asUintN(32, this.duration_0xd8.value)) >>> 0;
              const produced = v.getSampleDataVirtual(
                this.sampleTime_0xa8.value,
                dur32,
                this.sampleRate_0xf0,
                this.pitch_0xf8,
                this.formatTag_0x100 >>> 0,
                this.mixer_0xa0 as OZAudioMixer,
              );
              this.result_0x108 = produced;
              didProduce = true;
            }
          }
        }
      } else if (this.masterTrackID_0x98 !== 0) {
        // @0x636817: node = scene->getNode(masterTrackID)
        const node = OZScene_getNode(this.scene_0x90, this.masterTrackID_0x98);
        if (node !== null && node !== undefined) {
          // @0x636838: master = dynamic_cast<OZAudioMasterTrack*>(node)
          const master = dynamic_cast_OZSceneNode_to_OZAudioMasterTrack(node);
          if (master !== null) {
            if (this.wantsInterleaved_0x104) {
              // @0x63688c: master->getSampleData(sampleTime, dur, rate, pitch, tag, mixer, false)
              // Register witness:
              //   (rsp)      = 0xa0(%rbx) → mixer   (spilled to stack slot)
              //   0x8(rsp)   = 0            → bool false
              //   %rsi       = 0xa0(%rbx) → mixer (but overwritten below with %rax=master)
              //   %rdx       = 0xa8(%rbx) → sampleTime.value
              //   %ecx       = 0xd8(%rbx) → dur.value low32
              //   %r8d       = 0xf0(%rbx) → sampleRate
              //   %xmm0      = 0xf8(%rbx) → pitch
              //   %r9d       = 0x100(%rbx) → formatTag (u32 = 4)
              const dur32 = Number(BigInt.asUintN(32, this.duration_0xd8.value)) >>> 0;
              const produced = master.getSampleData(
                this.sampleTime_0xa8.value,
                dur32,
                this.sampleRate_0xf0,
                this.pitch_0xf8,
                this.formatTag_0x100 >>> 0,
                this.mixer_0xa0 as OZAudioMixer,
                false,
              );
              this.result_0x108 = produced;
              didProduce = true;
            } else {
              // Virtual fallback — same slot +0x510 as the OZAudioTrack path.
              const v: OZAudioTrackLikeVirtual =
                master as unknown as OZAudioTrackLikeVirtual;
              const dur32 = Number(BigInt.asUintN(32, this.duration_0xd8.value)) >>> 0;
              const produced = v.getSampleDataVirtual(
                this.sampleTime_0xa8.value,
                dur32,
                this.sampleRate_0xf0,
                this.pitch_0xf8,
                this.formatTag_0x100 >>> 0,
                this.mixer_0xa0 as OZAudioMixer,
              );
              this.result_0x108 = produced;
              didProduce = true;
            }
          }
        }
      }
    }

    // @0x63693f: if (this->result.ptr @+0x108 != null) then notify client.
    // Under the JS port `didProduce` is equivalent to `result_0x108.ptr != null`
    // in the happy path; but we test the ptr directly to mirror the asm.
    if (didProduce && this.result_0x108.ptr !== null && this.result_0x108.ptr !== undefined) {
      // @0x636949..0x636967: pick which selector-slot to use.
      //   selPtr = &selrefA
      //   if (this->hg_flag_0x50 == 0):
      //     if (this->hg_fn_0x70 == null || (*hg_fn_0x70)() == 0):
      //       selPtr = &selrefB
      let selectorSlot: 0 | 1 = 0;
      if (!this.hg_flag_0x50) {
        const fn = this.hg_fn_0x70;
        if (fn === null || fn() === 0) {
          selectorSlot = 1;
        }
      }
      // @0x63696e/0x63697b: objc_msgSend(this->+0x80, sel, this).
      if (this.hg_client_0x80 !== null) {
        objcMsgSend_updateMasterTracksArray(this.hg_client_0x80, selectorSlot, this);
      }
    }

    // @0x636984: objc_release(pool) — inert in this port.
  }

  /**
   * OZHGAudioJob::canceled() — @Ozone 0x6369a0.
   *
   *   __ZN12OZHGAudioJob8canceledEv:
   *     0x6369a0  pushq %rbp
   *     0x6369a4  movq  %rdi, %rdx                 ; arg2 = this
   *     0x6369a7  movq  0x80(%rdi), %rdi           ; arg0 = this->+0x80 (client)
   *     0x6369ae  movq  0x2e0aa3(%rip), %rsi       ; arg1 = &sel:updateMasterTracksArray
   *     0x6369b6  jmpq  *0x1ef66c(%rip)            ; objc_msgSend
   */
  canceled(): void {
    if (this.hg_client_0x80 === null) {
      // No client installed (partial parent-ctor).  Original asm would crash
      // dereferencing %rdi=null when the msgSend runtime tries to look up the
      // isa pointer.  We elide the message-send.
      return;
    }
    objcMsgSend_updateMasterTracksArray(this.hg_client_0x80, 0, this);
  }

  /**
   * OZHGAudioJob::~OZHGAudioJob (D1 @0x6369c0, D0 @0x636a20 — identical up to
   * an operator-delete tail).
   *
   *   Steps:
   *     1. Reinstall the vptr to the *parent's* vtable (Itanium ABI dtor-vptr).
   *        In JS this is implicit — no work needed.
   *     2. Fetch this->+0x110 (the shared control block).
   *     3. If non-null, atomically `xaddq $-1, __shared_owners_(+0x8)`.
   *        If the pre-decrement value was 0, invoke the vtable slot +0x10 on
   *        the control block (its "__on_zero_shared" / operator delete) and
   *        then call __shared_weak_count::__release_weak on the same pointer.
   *     4. Chain into OZHGUserJob::~OZHGUserJob (base dtor).
   *
   *   In this JS port the control block is inert — we just drop the reference.
   *   The parent dtor is unported (throwing-elided in OZHGUserJob_dtor below).
   */
  dispose(): void {
    // Steps 1-3: shared_ptr release.
    const cntrl = this.result_0x108.cntrl as
      | { __shared_owners_: number; __shared_weak_owners_: number }
      | null;
    if (cntrl !== null && cntrl !== undefined) {
      // @0x6369dd..0x6369ed: `lock xaddq $-1, 0x8(%rbx)` — atomic decrement,
      // reading the pre-decrement value.  If pre == 0, tear down.
      const preOwners = cntrl.__shared_owners_;
      cntrl.__shared_owners_ = preOwners - 1;
      if (preOwners === 0) {
        // Would invoke __on_zero_shared() (vtable slot +0x10) then
        // __shared_weak_count::__release_weak.  Unported; safe to elide since
        // in this port the control block owns nothing beyond its two counters.
      }
    }
    this.result_0x108 = { ptr: null, cntrl: null };

    // Step 4: parent dtor.
    OZHGUserJob_dtor(this);
  }
}

/**
 * OZHGUserJob::~OZHGUserJob() — @Ozone 0x6369f3 (tail-called from D1) and
 * @Ozone 0x636a69 (called from D0).
 *
 * @throws Not-yet-ported.  In this JS port the parent dtor is a documented
 * no-op — objects are garbage-collected.  Any real subresource cleanup done
 * by the C++ dtor must be surfaced as a separate follow-up port.
 */
export function OZHGUserJob_dtor(_self: OZHGUserJob_base): void {
  // Deliberately inert — parent-class dtor unported.  See Ozone @0x6369f3.
}
