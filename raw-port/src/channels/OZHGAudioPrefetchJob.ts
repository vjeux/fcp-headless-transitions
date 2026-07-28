// OZHGAudioPrefetchJob.ts — FCP Ozone OZHGAudioPrefetchJob: a background HGUserJob that
// asks an OZScene to prefetch audio at a specific CMTime, on the prefetch-priority queue.
//
// FRAMEWORK: Ozone.framework (Final Cut Pro).
// DECODE: raw-port/re/disasm/Ozone.OZHGAudioPrefetchJob.all.s
//         (mangled symbols __ZN20OZHGAudioPrefetchJob* starting at C2 @0x636a80).
//
// STRUCT LAYOUT (recovered from C2 @0x636a80 + executing @0x636ba0 + canceled @0x636bf0):
//   sizeof ≥ 0xb4 (180 bytes; the base subobject dominates).
//     +0x00..+0x8f  OZHGUserJob base subobject
//        - The C2 constructor calls `OZHGUserJob::OZHGUserJob()` @0x636a97 on `this`;
//          after this returns, `this[0x00]` (the vtable slot) is rebound to
//          OZHGAudioPrefetchJob's vtable @0x636a9c-0x636aa3 via a rip-relative load
//          (`leaq 0x251995(%rip),%rax ; movq %rax,(%rbx)`).
//        - `canceled()` reads a raw pointer at `+0x80` (`movq 0x80(%rdi),%rdi`)
//          which is the ObjC-id-shaped "userJobClient" field owned by
//          OZHGUserJob — evidence that the base contains at least one id* at
//          offset 0x80. We don't decode more of the base layout here; it's
//          out of scope.
//     +0x90..+0xa7  CMTime  time     (24-byte CoreMedia CMTime; installed by C2 via
//                                    `movups (%r12),%xmm0 ; movups %xmm0, 0x90(%rbx)`
//                                    @0x636aa6-0x636aab for the first 16 bytes (value,
//                                    timescale, flags), then `movq 0x10(%r12),%rax ;
//                                    movq %rax, 0xa0(%rbx)` @0x636ab2-0x636ab7 for the
//                                    8-byte epoch. Matches CMTime's public 24-byte struct.)
//     +0xa8         OZScene*  scene  (installed @0x636abe by `movq %r15, 0xa8(%rbx)`)
//     +0xb0         uint32    flags  (installed @0x636ac5 by `movl %r14d, 0xb0(%rbx)`;
//                                    fourth ctor arg — kind/mask/flags is undecoded here.)
//
// EXPORTED SYMBOLS (six member functions):
//   @Ozone 0x0000000000636a80  ctor(CMTime const&, OZScene*, unsigned int)  [C2]
//   @Ozone 0x0000000000636b10  ctor(CMTime const&, OZScene*, unsigned int)  [C1]
//   @Ozone 0x0000000000636ba0  executing()
//   @Ozone 0x0000000000636bf0  canceled()
//   @Ozone 0x0000000000636c10  ~OZHGAudioPrefetchJob()  [D1 base]
//   @Ozone 0x0000000000636c20  ~OZHGAudioPrefetchJob()  [D0 deleting]
//
//   C1 @0x636b10 and C2 @0x636a80 are byte-for-byte independent bodies (per Itanium ABI):
//   both entry points are transcribed by a single TS constructor because their observable
//   effect is identical (the rip displacements differ only because their code addresses
//   differ — 0x251995 vs 0x251905 — but both resolve to the same vtable symbol).
//
// FRONTIER (deferred — cited as throwing stubs OR opaque types below):
//   • OZHGUserJob::OZHGUserJob()       @0x636a97, @0x636b27 — base default ctor
//   • OZHGUserJob::~OZHGUserJob()      @0x636af7, @0x636b87, @0x636c15, @0x636c29 — base dtor
//   • PGHGRenderQueue::getPrefetchQueueID()  @0x636acc, @0x636b5c — static, returns uint
//   • HGUserJob::SetQueueID(unsigned int)    @0x636ad6, @0x636b66
//   • HGUserJob::SetPriority(HGUserJob::Priority)  @0x636ae3, @0x636b73  — arg fixed to 0xa
//   • PCAutoreleasePool::PCAutoreleasePool() / ~PCAutoreleasePool()  @0x636bad / @0x636bc5
//   • OZScene::prefetchAudio(OZHGAudioPrefetchJob*)  @0x636bbc
//   • objc_msgSend for `[self.userJobClient updateMasterTracksArray]` @0x636c06
//   • HGObject::operator delete(void*)  @0x636c37 (D0 tail-jump)
//
// The class is a fairly thin adapter: it stores the (time, scene, flags) inputs, installs
// itself on the "prefetch" queue at priority 0xa, and — when the scheduler runs it —
// delegates the actual work to `OZScene::prefetchAudio(this)` under a PCAutoreleasePool
// scope. `canceled()` posts a `-updateMasterTracksArray` message to the base class's
// user-job-client (an ObjC delegate).

import type { CMTime } from "../infra/CMTime";
import { HGObject_dtor } from "../render/HGObject_stub";

// ── Opaque frontier types ────────────────────────────────────────────────────────────────

/**
 * OZHGUserJob — undecoded base class. Only three interactions are observed by this class:
 *  (1) default construction @0x636a97, (2) destruction @0x636af7 / @0x636c15, and
 *  (3) reading an ObjC-id-shaped field at offset +0x80 (canceled @0x636bf7).
 * The base is modeled as an opaque handle with just enough surface to type-check.
 */
export interface OZHGUserJob_base {
  /** +0x80 (of the OZHGUserJob subobject): id<OZHGUserJobClient> — an ObjC delegate.
   *  Read by `canceled()` @0x636bf7. Modelled here as a nullable JS object with the
   *  single method used by this class (`updateMasterTracksArray`). */
  userJobClient: OZHGUserJobClient | null;
}

/**
 * OZHGUserJobClient — the ObjC protocol read by `canceled()`. Only one selector is
 * dispatched: `-updateMasterTracksArray` @0x636c06.
 */
export interface OZHGUserJobClient {
  /** @Ozone 0x636c06  jmpq *objc_msgSend  → `-[<userJobClient> updateMasterTracksArray]` */
  updateMasterTracksArray(): void;
}

/**
 * OZScene — opaque handle. Only its `prefetchAudio(OZHGAudioPrefetchJob*)` method is
 * used, at exactly one call site @0x636bbc. Note the parameter is a raw C++ pointer to
 * `this`; in TS we pass the reference directly.
 */
export interface OZScene_frontier {
  /** @Ozone 0x636bbc  callq __ZN7OZScene13prefetchAudioEP20OZHGAudioPrefetchJob */
  prefetchAudio(job: OZHGAudioPrefetchJob): void;
}

// ── Frontier stubs (throwing where the base class isn't decoded) ─────────────────────────

/**
 * OZHGUserJob::OZHGUserJob() — the default-arg base ctor called at @0x636a97 (and
 * @0x636b27 for the C1 entry point). Not yet transcribed.
 */
function OZHGUserJob_default_ctor(): OZHGUserJob_base {
  throw new Error(
    "raise: OZHGUserJob::OZHGUserJob() base default ctor @Ozone 0x636a97 / 0x636b27 " +
      "is not yet decoded — see raw-port/army/PORTING_SPEC.md rule 3.",
  );
}

/**
 * OZHGUserJob::~OZHGUserJob() — base dtor called at @0x636af7 / @0x636b87 (unwind
 * paths on partial ctor failure), @0x636c15 (from D1), and @0x636c29 (from D0). Not
 * yet transcribed. We invoke HGObject_dtor for provenance to keep the base-class
 * frontier explicit — this is not the same call, but the two share the pattern of
 * "opaque base-class destructor stub", and importing HGObject_stub makes the ABI edge
 * visible.
 */
function OZHGUserJob_dtor(_self: OZHGUserJob_base): void {
  throw new Error(
    "raise: OZHGUserJob::~OZHGUserJob() base dtor @Ozone 0x636af7 / 0x636b87 / 0x636c15 / " +
      "0x636c29 is not yet decoded — see raw-port/army/PORTING_SPEC.md rule 3.",
  );
}

/**
 * PGHGRenderQueue::getPrefetchQueueID() — static, returns the queue-id (uint32) that
 * this job should be scheduled on. Called @0x636acc / @0x636b5c.
 */
function PGHGRenderQueue_getPrefetchQueueID(): number {
  throw new Error(
    "raise: PGHGRenderQueue::getPrefetchQueueID() @Ozone 0x636acc / 0x636b5c is not " +
      "yet decoded — this returns the uint32 queue-id that OZHGAudioPrefetchJob " +
      "installs itself on via HGUserJob::SetQueueID.",
  );
}

/**
 * HGUserJob::SetQueueID(unsigned int) — installs `this` on a specific queue.
 * Called @0x636ad6 / @0x636b66 with the return value of getPrefetchQueueID.
 */
function HGUserJob_SetQueueID(_self: OZHGAudioPrefetchJob, _queueId: number): void {
  throw new Error(
    "raise: HGUserJob::SetQueueID(unsigned int) @Ozone 0x636ad6 / 0x636b66 is not " +
      "yet decoded.",
  );
}

/**
 * HGUserJob::SetPriority(HGUserJob::Priority) — the ctor sets priority=0xa
 * (`movl $0xa, %esi` @0x636ade / @0x636b6e). Not yet decoded.
 */
function HGUserJob_SetPriority(_self: OZHGAudioPrefetchJob, _priority: number): void {
  throw new Error(
    "raise: HGUserJob::SetPriority(HGUserJob::Priority) @Ozone 0x636ae3 / 0x636b73 " +
      "is not yet decoded — fixed argument value 0xa (== HGUserJob::Priority::???).",
  );
}

/**
 * PCAutoreleasePool — an RAII wrapper around ObjC's autorelease pool. `executing()`
 * puts one on the stack before invoking OZScene::prefetchAudio, so ObjC objects that
 * `prefetchAudio` transiently autoreleases get cleaned up as soon as the pool
 * destructs. Modelled here as a pair of stubs; a real port would use a `using`-style
 * pattern but neither libc nor TS surface the same lifetime story.
 */
function PCAutoreleasePool_new(): unknown {
  throw new Error(
    "raise: PCAutoreleasePool::PCAutoreleasePool() @Ozone 0x636bad is not yet decoded — " +
      "an ObjC autorelease-pool RAII object used by OZHGAudioPrefetchJob::executing().",
  );
}
function PCAutoreleasePool_destroy(_pool: unknown): void {
  throw new Error(
    "raise: PCAutoreleasePool::~PCAutoreleasePool() @Ozone 0x636bc5 is not yet decoded.",
  );
}

// ── The class ────────────────────────────────────────────────────────────────────────────

export class OZHGAudioPrefetchJob {
  /** +0x00..+0x8f — OZHGUserJob base subobject (opaque). */
  readonly base: OZHGUserJob_base;

  /** +0x90..+0xa7 — the CMTime this job prefetches audio at. */
  readonly time: CMTime;

  /** +0xa8 — the OZScene that owns the audio to prefetch. */
  readonly scene: OZScene_frontier;

  /** +0xb0 — flags/kind (uint32; fourth ctor arg, meaning undecoded). */
  readonly flags: number;

  /**
   * OZHGAudioPrefetchJob(CMTime const& time, OZScene* scene, unsigned int flags)
   * @Ozone 0x0000000000636a80  [C2]
   *
   * DECODE (raw-port/re/disasm/Ozone.OZHGAudioPrefetchJob.all.s @0x636a80-0x636af0):
   *   0x636a8b-0x636a94  spill args:  r14d=flags, r15=scene, r12=&time, rbx=this
   *   0x636a97  callq OZHGUserJob::OZHGUserJob()       → base default ctor
   *   0x636a9c-0x636aa3  this->vtable = OZHGAudioPrefetchJob::vtable  (rip+0x251995)
   *   0x636aa6-0x636aab  movups (%r12),%xmm0 ; movups %xmm0, 0x90(%rbx)
   *                     → copy CMTime bytes [0..15] = {value(i64), timescale(i32), flags(u32)}
   *   0x636ab2-0x636ab7  movq 0x10(%r12),%rax ; movq %rax, 0xa0(%rbx)
   *                     → copy CMTime bytes [16..23] = {epoch(i64)}
   *   0x636abe  this->scene   = r15
   *   0x636ac5  this->flags   = r14d
   *   0x636acc  callq PGHGRenderQueue::getPrefetchQueueID()   → eax = queue id
   *   0x636ad6  callq HGUserJob::SetQueueID(this, eax)
   *   0x636ae3  callq HGUserJob::SetPriority(this, 0xa)
   *   0x636ae8-0x636af0  epilogue
   *
   *   Unwind path @0x636af1-0x636aff: on exception (e.g. from getPrefetchQueueID or
   *   SetQueueID), destroy the OZHGUserJob base subobject and rethrow. We don't model
   *   exceptions in TS; the throwing frontier stubs halt execution before partial
   *   state accrues.
   *
   * C1 @0x636b10 is a byte-identical body — see raw-port/re/disasm/... at @0x636b10.
   */
  constructor(time: CMTime, scene: OZScene_frontier, flags: number) {
    // @0x636a97  base()
    this.base = OZHGUserJob_default_ctor();
    // @0x636a9c-0x636aa3  vtable install — implicit through the TS prototype chain.
    // @0x636aa6-0x636ab7  copy the CMTime (all 24 bytes; TS spread is field-wise).
    this.time = {
      value: time.value,
      timescale: time.timescale | 0,
      flags: time.flags >>> 0,
      epoch: time.epoch,
    };
    // @0x636abe  scene
    this.scene = scene;
    // @0x636ac5  flags (uint32)
    this.flags = flags >>> 0;
    // @0x636acc  queue-id = PGHGRenderQueue::getPrefetchQueueID()
    const queueId = PGHGRenderQueue_getPrefetchQueueID();
    // @0x636ad6  HGUserJob::SetQueueID(this, queueId)
    HGUserJob_SetQueueID(this, queueId);
    // @0x636ae3  HGUserJob::SetPriority(this, 0xa)
    HGUserJob_SetPriority(this, 0xa);
  }

  /**
   * OZHGAudioPrefetchJob::executing()
   * @Ozone 0x0000000000636ba0
   *
   * DECODE (raw-port/re/disasm/Ozone.OZHGAudioPrefetchJob.all.s @0x636ba0-0x636bd0):
   *   0x636ba9-0x636bad  place PCAutoreleasePool on the stack @[-0x10(%rbp)]
   *   0x636bb2  rdi = this->scene   (from +0xa8)
   *   0x636bb9  rsi = this
   *   0x636bbc  callq OZScene::prefetchAudio(scene, this)
   *   0x636bc1-0x636bc5  destroy the PCAutoreleasePool
   *   0x636bca-0x636bd0  epilogue
   *
   *   Unwind path @0x636bd1-0x636be0: on exception from prefetchAudio, destroy the
   *   PCAutoreleasePool and rethrow.
   */
  executing(): void {
    // @0x636bad  PCAutoreleasePool pool;
    const pool = PCAutoreleasePool_new();
    try {
      // @0x636bbc  this->scene->prefetchAudio(this)
      this.scene.prefetchAudio(this);
    } finally {
      // @0x636bc5  ~PCAutoreleasePool()
      PCAutoreleasePool_destroy(pool);
    }
  }

  /**
   * OZHGAudioPrefetchJob::canceled()
   * @Ozone 0x0000000000636bf0
   *
   * DECODE (raw-port/re/disasm/Ozone.OZHGAudioPrefetchJob.all.s @0x636bf0-0x636c0c):
   *   0x636bf4  rdx = this  (kept for the ObjC self arg? no — see below)
   *   0x636bf7  rdi = *(this + 0x80)   → the ObjC id at OZHGUserJob's +0x80
   *   0x636bfe  rsi = *(rip + 0x2e0853)  → the selector for `updateMasterTracksArray`
   *   0x636c06  jmpq *(rip + 0x1ef41c)   → objc_msgSend(rdi, rsi)
   *
   *   Semantics: dispatch `[self.userJobClient updateMasterTracksArray]`. The `rdx=this`
   *   at @0x636bf4 is a leftover from a canonical objc-msgSend register setup; the
   *   selector-with-no-args path only uses (rdi, rsi).
   */
  canceled(): void {
    // @0x636bf7  const client = this.base.userJobClient
    const client = this.base.userJobClient;
    if (client === null) {
      // Objective-C's `objc_msgSend` on a null receiver is a no-op — the standard
      // "messaging nil returns 0". Match that behaviour: silently do nothing.
      return;
    }
    // @0x636c06  jmpq *objc_msgSend for selector `updateMasterTracksArray`
    client.updateMasterTracksArray();
  }

  /**
   * ~OZHGAudioPrefetchJob()  [D1 base]
   * @Ozone 0x0000000000636c10
   *
   * DECODE (raw-port/re/disasm/Ozone.OZHGAudioPrefetchJob.all.s @0x636c10-0x636c15):
   *   pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; jmp __ZN11OZHGUserJobD2Ev
   *
   * Trivial frame set-up followed by a tail-jump into the base dtor — no derived-class
   * cleanup work (all derived fields are trivially destructible).
   */
  destroyBase(): void {
    // @0x636c15  jmp OZHGUserJob::~OZHGUserJob(this)
    OZHGUserJob_dtor(this.base);
  }

  /**
   * ~OZHGAudioPrefetchJob()  [D0 deleting]
   * @Ozone 0x0000000000636c20
   *
   * DECODE (raw-port/re/disasm/Ozone.OZHGAudioPrefetchJob.all.s @0x636c20-0x636c37):
   *   0x636c26  rbx = this
   *   0x636c29  callq OZHGUserJob::~OZHGUserJob()    → base dtor
   *   0x636c2e  rdi = rbx  (= this)
   *   0x636c37  jmp HGObject::operator delete(void*)
   *
   * Standard deleting-dtor: run the base dtor, then hand `this` to the allocator.
   * HGObject_stub's HGObject_dtor is a documentation anchor for this frontier — TS's
   * GC handles the actual deallocation.
   */
  destroyAndDelete(): void {
    // @0x636c29  base dtor
    OZHGUserJob_dtor(this.base);
    // @0x636c37  HGObject::operator delete(this) — no-op in TS; call HGObject_dtor
    // frontier stub for provenance (documents the base-class deletion edge).
    HGObject_dtor(this);
  }
}
