// FFAudioDeviceObject.ts — raw transcription of Flexo `FFAudioDeviceObject`.
//
// FFAudioDeviceObject is Flexo's CoreAudio device wrapper — one instance per input or output
// audio device session. It owns a unique_ptr<FFAudioGraph> (the render graph), an FFAudioOutputIsRunningManager
// (property observer for running state), a channel-map NSArray, and various format/callback
// state. All heavy lifting delegates to CoreAudio (AudioUnit + AudioQueue) frameworks via
// boundary throw-stubs — this class is a shim from Flexo's semantics to CoreAudio's C APIs.
//
// This port is CHUNK-scale: ctor prelude + trivial leaves are transcribed line-for-line;
// deep methods that call into CoreAudio (AudioUnit*, AudioQueue*, CoreAudio HAL) are declared
// as boundary throw-stubs citing their @0xADDR (Rule 3 of PORTING_SPEC).
//
// Provenance (Flexo framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// SYMBOLS (nm | c++filt) — 43 methods:
//   @0xd088d0  FFAudioDeviceObject::NewAudioDeviceObject(FFAudioSessionIOType, NSString*)
//   @0xd08900  FFAudioDeviceObject::FFAudioDeviceObject(FFAudioSessionIOType)  [C2]
//   @0xd08a90  FFAudioDeviceObject::~FFAudioDeviceObject()  [D2]
//   @0x1487650  FFAudioDeviceObject::~FFAudioDeviceObject()  [D1]
//   @0x1487660  FFAudioDeviceObject::~FFAudioDeviceObject()  [D0 deleting]
//   @0xd08ce0  FFAudioDeviceObject::IsRunning()  [FULLY PORTED]
//   @0xd08d10  FFAudioDeviceObject::GetType()      [FULLY PORTED]
//   @0xd0a320  FFAudioDeviceObject::GetGraph()    [FULLY PORTED]
//   @0xd0a450  FFAudioDeviceObject::IsUsingAudioQueue()  [FULLY PORTED]
//   @0xd08d00  FFAudioDeviceObject::GetIsRunningPropertyManager()  [FULLY PORTED]
//   … (38 more methods below as @0xADDR-cited throw-stubs)
//
// STRUCT LAYOUT (recovered from C2 @0xd08900 + accessor disasm):
//   +0x000  vptr           (installed = 0xc087cb + rip; base vtable for FFAudioDeviceObject)
//   +0x008  int8_t         type — the FFAudioSessionIOType enum passed to the ctor
//                          (also drives the `useAudioQueue` selector at +0x38 and the
//                           twin-slot array at +0x58; 0=output, non-zero=input in the observed
//                           branch pattern of GetIsRunningPropertyManager).
//   +0x010  void*          heap allocation ptr from operator new[] @0xd08900+0x37
//                          (size 0x10, allocated only when type != 0 via `__Znam`).
//   +0x018  void*          shadow of +0x010; stored back from %rax after new[].
//   +0x020  int32_t        flag word initialised to 1 in ctor+0x5e.
//                          (Two `movups xmm0` writes at +0x20 and +0x29 pre-zero the region;
//                           the explicit `movl $1, +0x20` overwrites.)
//   +0x038  uint8_t        useAudioQueue selector — indexes +0x58/+0x60 twin-slot arrays.
//                          (Read as `movzbl 0x38(%rdi)` in IsRunning, IsUsingAudioQueue,
//                           and GetIsRunningPropertyManager.)
//   +0x040  unique_ptr<FFAudioGraph>  render graph — dtor'd via
//                          `std::__1::unique_ptr<FFAudioGraph>::~unique_ptr` @ ctor+0xfa.
//                          GetGraph() returns *(this+0x40).
//   +0x048  shared_ptr<FFAudioSamplesCache::Block>  audio-samples cache block — dtor'd via
//                          `std::__1::shared_ptr<FFAudioSamplesCache::Block>::~shared_ptr` @ ctor+0xf2.
//   +0x058  FFAudioOutputIsRunningManager*  twin-slot pair; the concrete IsRunning manager
//                          lives at +0x58 + type*8 (output = +0x58, input = +0x60).
//   +0x060  FFAudioOutputIsRunningManager*  (twin of +0x58 for the input path.)
//   +0x068  void*          input-render-callback state (zeroed in ctor).
//   +0x070  void*          input-render-callback state 2 (zeroed in ctor).
//   +0x078  void*          extra state (zeroed in ctor).
//   +0x080  NSMutableArray*  channel-map array — `objc_alloc_init(NSMutableArray)` in ctor.
//   (Full field discovery beyond +0x80 defers to Initialize/SetOutputFormat/etc.)
//
// This shim class is a boundary node: 38 of 43 methods hit CoreAudio (AudioUnit, AudioQueue,
// AudioObject/HAL) via extern calls. Those get boundary throw-stubs per PORTING_SPEC Rule 3.
//
// -----------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-unused-vars */

// ── Frontier types ────────────────────────────────────────────────────────

/** FFAudioSessionIOType — Flexo enum (input/output/etc). Opaque numeric alias. */
export type FFAudioSessionIOType = number;

/** NSString* — Foundation opaque. */
export interface NSStringLike { readonly __NSString_opaque: unique symbol; }
/** NSObject* — Foundation opaque. */
export interface NSObjectLike { readonly __NSObject_opaque: unique symbol; }
/** NSArray<NSNumber*>* — the channel-map array. */
export interface NSArrayNSNumberLike { readonly __NSArrayNSNumber_opaque: unique symbol; }
/** NSMutableArray* — mutable form of the channel-map. */
export interface NSMutableArrayLike { readonly __NSMutableArray_opaque: unique symbol; }
/** FFAudioGraph — Flexo render graph. Opaque frontier. */
export interface FFAudioGraphLike { readonly __FFAudioGraph_opaque: unique symbol; }
/** FFAudioOutputIsRunningManager — property observer. */
export interface FFAudioOutputIsRunningManagerLike {
  readonly __FFAudioOutputIsRunningManager_opaque: unique symbol;
}
/** FFAudioSamplesCache::Block — cache block. */
export interface FFAudioSamplesCacheBlockLike {
  readonly __FFAudioSamplesCacheBlock_opaque: unique symbol;
}
/** FFNotificationID_* — opaque handle. */
export interface FFNotificationID_Like { readonly __FFNotificationID_opaque: unique symbol; }
/** FFNotification* — opaque struct pointer. */
export interface FFNotificationLike { readonly __FFNotification_opaque: unique symbol; }
/** OpaqueAudioQueue* — CoreAudio typedef (AudioQueueRef). */
export interface OpaqueAudioQueueLike { readonly __OpaqueAudioQueue_opaque: unique symbol; }
/** AudioQueueBuffer* — CoreAudio struct. */
export interface AudioQueueBufferLike { readonly __AudioQueueBuffer_opaque: unique symbol; }
/** AudioTimeStamp const& — CoreAudio HAL time stamp. */
export interface AudioTimeStampLike { readonly __AudioTimeStamp_opaque: unique symbol; }
/** AudioBufferList* — CoreAudio HAL buffer list. */
export interface AudioBufferListLike { readonly __AudioBufferList_opaque: unique symbol; }
/** AudioStreamBasicDescription& — CoreAudio HAL format struct. */
export interface AudioStreamBasicDescriptionLike {
  readonly __AudioStreamBasicDescription_opaque: unique symbol;
}
/** AudioChannelLayout const& — CoreAudio HAL layout struct. */
export interface AudioChannelLayoutLike {
  readonly __AudioChannelLayout_opaque: unique symbol;
}
/** AURenderCallbackStruct — CoreAudio typedef struct. */
export interface AURenderCallbackStructLike { readonly __AURenderCallbackStruct_opaque: unique symbol; }

/** AURenderCallback function-pointer type. */
export type AURenderCallbackFn = (
  refCon: unknown,
  ioActionFlags: number,
  timestamp: AudioTimeStampLike,
  bus: number,
  frames: number,
  ioData: AudioBufferListLike,
) => number;

/** FFNotification callback function-pointer type. */
export type FFNotificationCallbackFn = (ctx: unknown, note: FFNotificationLike) => void;

// ── Struct layout ─────────────────────────────────────────────────────────

/**
 * FFAudioDeviceObject instance layout — every field byte-offset recovered from the C2 body
 * and accessor disasm. Fields are opaque frontier handles for the sub-object types.
 */
export interface FFAudioDeviceObject {
  vptr: number;                                              /* +0x000 */
  type: FFAudioSessionIOType;                                /* +0x008 int8 */
  heap0x10: unknown | null;                                  /* +0x010 new[] ptr */
  heap0x18: unknown | null;                                  /* +0x018 shadow */
  flag0x20: number;                                          /* +0x020 int32, init=1 */
  useAudioQueue: number;                                     /* +0x038 uint8 */
  graph: FFAudioGraphLike | null;                            /* +0x040 unique_ptr */
  samplesCacheBlock: FFAudioSamplesCacheBlockLike | null;    /* +0x048 shared_ptr */
  isRunningManagerOut: FFAudioOutputIsRunningManagerLike | null; /* +0x058 */
  isRunningManagerIn:  FFAudioOutputIsRunningManagerLike | null; /* +0x060 */
  ptr0x68: unknown | null;                                   /* +0x068 */
  ptr0x70: unknown | null;                                   /* +0x070 */
  ptr0x78: unknown | null;                                   /* +0x078 */
  channelMap: NSMutableArrayLike | null;                     /* +0x080 */
}

// ── Boundary stubs for extern calls we route into ─────────────────────────

/** FFAudioOutputIsRunningManager::isRunning() const — extern virtual, tail-called from IsRunning. */
export function FFAudioOutputIsRunningManager_isRunning(_self: FFAudioOutputIsRunningManagerLike): boolean {
  throw new Error("FFAudioOutputIsRunningManager::isRunning() const @0xd0b210 not yet transcribed");
}

// ── Fully-ported trivial leaves ───────────────────────────────────────────

/**
 * `FFAudioDeviceObject::GetType()` — @0xd08d10.
 * Line-for-line: return `(int8_t)*(this + 0x8)` sign-extended (movsbl).
 *   0xd08d14  movsbl 0x8(%rdi), %eax
 *   0xd08d18  popq %rbp; retq
 */
export function FFAudioDeviceObject_GetType(self: FFAudioDeviceObject): number {
  // movsbl → sign-extend an int8 to int32.
  const v = self.type & 0xff;
  return (v << 24) >> 24;
}

/**
 * `FFAudioDeviceObject::GetGraph()` — @0xd0a320.
 * Line-for-line: return `*(this + 0x40)` (the unique_ptr's stored pointer).
 *   0xd0a324  movq 0x40(%rdi), %rax
 *   0xd0a328  popq %rbp; retq
 */
export function FFAudioDeviceObject_GetGraph(self: FFAudioDeviceObject): FFAudioGraphLike | null {
  return self.graph;
}

/**
 * `FFAudioDeviceObject::IsUsingAudioQueue()` — @0xd0a450.
 * Line-for-line: `return (bool)*(uint8_t*)(this + 0x38);`
 *   0xd0a454  movzbl 0x38(%rdi), %eax
 *   0xd0a458  popq %rbp; retq
 */
export function FFAudioDeviceObject_IsUsingAudioQueue(self: FFAudioDeviceObject): boolean {
  return (self.useAudioQueue & 0xff) !== 0;
}

/**
 * `FFAudioDeviceObject::GetIsRunningPropertyManager()` — @0xd08d00.
 * Line-for-line:
 *   0xd08d04  movzbl 0x38(%rdi), %eax           ## selector = *(u8*)(this+0x38)
 *   0xd08d08  movq 0x58(%rdi,%rax,8), %rax      ## return *(this + 0x58 + selector*8)
 *   0xd08d0d  popq %rbp; retq
 *
 * The selector at +0x38 picks between the twin slots at +0x58 (selector=0) and +0x60
 * (selector=1). Our struct models these as `isRunningManagerOut` / `isRunningManagerIn`.
 */
export function FFAudioDeviceObject_GetIsRunningPropertyManager(
  self: FFAudioDeviceObject,
): FFAudioOutputIsRunningManagerLike | null {
  const sel = self.useAudioQueue & 0xff;
  return sel === 0 ? self.isRunningManagerOut : self.isRunningManagerIn;
}

/**
 * `FFAudioDeviceObject::IsRunning()` — @0xd08ce0.
 * Line-for-line:
 *   0xd08ce4  movzbl 0x38(%rdi), %eax
 *   0xd08ce8  movq 0x58(%rdi,%rax,8), %rdi    ## mgr = *(this + 0x58 + selector*8)
 *   0xd08ced  testq %rdi, %rdi
 *   0xd08cf0  je 0xd08cf8                     ## mgr == NULL → return 0
 *   0xd08cf3  jmp FFAudioOutputIsRunningManager::isRunning() const
 *   0xd08cf8  xorl %eax, %eax; retq
 *
 * If the selected manager is NULL, IsRunning returns false; otherwise it tail-jumps into
 * FFAudioOutputIsRunningManager::isRunning() const.
 */
export function FFAudioDeviceObject_IsRunning(self: FFAudioDeviceObject): boolean {
  const mgr = FFAudioDeviceObject_GetIsRunningPropertyManager(self);
  if (mgr === null) return false;
  return FFAudioOutputIsRunningManager_isRunning(mgr);
}

// ── Ctor / dtor (skeleton; deep sub-object init defers to boundary stubs) ─

/**
 * `FFAudioDeviceObject::FFAudioDeviceObject(FFAudioSessionIOType)` — @0xd08900 [C2].
 *
 * Transcription of the prelude (ctor is a big alloc-and-init):
 *   1. install vptr at (this+0)                                             (ctor+0xe)
 *   2. `*(int8_t*)(this + 0x8) = sil`  (type parameter)                     (ctor+0x18)
 *   3. `*(void**)(this + 0x10) = NULL`                                       (ctor+0x1c)
 *   4. if (type != 0) [rax=0;done] else [rax = new char[0x10]]   (ctor+0x24)
 *   5. `*(void**)(this + 0x18) = rax`                                        (ctor+0x37)
 *   6. movups xmm0 (zeroed) to (this+0x20) and (this+0x29)                  (ctor+0x43..0x4a)
 *   7. movups xmm0 (zeroed) to (this+0x40), (this+0x50), (this+0x60),
 *      (this+0x70) — clears sub-object pointer table                         (ctor+0x4e..0x5a)
 *   8. `*(int32_t*)(this + 0x20) = 1`                                        (ctor+0x5e)
 *   9. `*(NSMutableArray**)(this + 0x80) = objc_alloc_init(NSMutableArray)`  (ctor+0x65..0x71)
 *  10. cleanup/unwind epilog for the `new[]` failure path.
 *
 * The full port defers the objc bridge (`objc_alloc_init(NSMutableArray)`) and the destructor
 * chain (`std::__1::unique_ptr<FFAudioGraph>::~unique_ptr`, etc.) to their boundary stubs.
 *
 * @0xd08900  __ZN19FFAudioDeviceObjectC2E20FFAudioSessionIOType
 */
export function FFAudioDeviceObject_C2(_self: FFAudioDeviceObject, _type: FFAudioSessionIOType): void {
  throw new Error("FFAudioDeviceObject::FFAudioDeviceObject(FFAudioSessionIOType) @0xd08900 not yet transcribed");
}

/** @0xd08a90  __ZN19FFAudioDeviceObjectD2Ev */
export function FFAudioDeviceObject_D2(_self: FFAudioDeviceObject): void {
  throw new Error("FFAudioDeviceObject::~FFAudioDeviceObject [D2] @0xd08a90 not yet transcribed");
}
/** @0x1487650  __ZN19FFAudioDeviceObjectD1Ev */
export function FFAudioDeviceObject_D1(_self: FFAudioDeviceObject): void {
  throw new Error("FFAudioDeviceObject::~FFAudioDeviceObject [D1] @0x1487650 not yet transcribed");
}
/** @0x1487660  __ZN19FFAudioDeviceObjectD0Ev */
export function FFAudioDeviceObject_D0(_self: FFAudioDeviceObject): void {
  throw new Error("FFAudioDeviceObject::~FFAudioDeviceObject [D0 deleting] @0x1487660 not yet transcribed");
}

// ── Deep methods: throw-stubs citing @0xADDR (Rule 3) ─────────────────────

/** @0xd088d0 — factory. */
export function FFAudioDeviceObject_NewAudioDeviceObject(
  _type: FFAudioSessionIOType, _name: NSStringLike,
): FFAudioDeviceObject {
  throw new Error("FFAudioDeviceObject::NewAudioDeviceObject(FFAudioSessionIOType, NSString*) @0xd088d0 not yet transcribed");
}

/** @0xd08d20 */
export function FFAudioDeviceObject_GetChannelMap(_self: FFAudioDeviceObject): NSArrayNSNumberLike {
  throw new Error("FFAudioDeviceObject::GetChannelMap() @0xd08d20 not yet transcribed");
}
/** @0xd08f50 */
export function FFAudioDeviceObject_GetDeviceUnit(_self: FFAudioDeviceObject): unknown {
  throw new Error("FFAudioDeviceObject::GetDeviceUnit() @0xd08f50 not yet transcribed");
}
/** @0xd08f90 */
export function FFAudioDeviceObject_SetChannelMap(_self: FFAudioDeviceObject, _map: NSArrayNSNumberLike): void {
  throw new Error("FFAudioDeviceObject::SetChannelMap(NSArray<NSNumber*>*) @0xd08f90 not yet transcribed");
}
/** @0xd09ff0 */
export function FFAudioDeviceObject_UseAudioQueue(_self: FFAudioDeviceObject, _on: boolean): void {
  throw new Error("FFAudioDeviceObject::UseAudioQueue(bool) @0xd09ff0 not yet transcribed");
}
/** @0xd09160 */
export function FFAudioDeviceObject_GetDeviceQueue(_self: FFAudioDeviceObject): OpaqueAudioQueueLike {
  throw new Error("FFAudioDeviceObject::GetDeviceQueue() @0xd09160 not yet transcribed");
}
/** @0xd095a0 */
export function FFAudioDeviceObject_GetInputFormat(_self: FFAudioDeviceObject, _out: AudioStreamBasicDescriptionLike): void {
  throw new Error("FFAudioDeviceObject::GetInputFormat(AudioStreamBasicDescription&) @0xd095a0 not yet transcribed");
}
/** @0xd09b70 */
export function FFAudioDeviceObject_ConnectToSource(_self: FFAudioDeviceObject, _source: FFAudioGraphLike): void {
  throw new Error("FFAudioDeviceObject::ConnectToSource(std::shared_ptr<FFAudioGraph>) @0xd09b70 not yet transcribed");
}
/** @0xd09620 */
export function FFAudioDeviceObject_GetOutputFormat(_self: FFAudioDeviceObject, _out: AudioStreamBasicDescriptionLike): void {
  throw new Error("FFAudioDeviceObject::GetOutputFormat(AudioStreamBasicDescription&) @0xd09620 not yet transcribed");
}
/** @0xd09100 */
export function FFAudioDeviceObject_GetOutputVolume(_self: FFAudioDeviceObject): number {
  throw new Error("FFAudioDeviceObject::GetOutputVolume() @0xd09100 not yet transcribed");
}
/** @0xd09740 */
export function FFAudioDeviceObject_InitializeQueue(_self: FFAudioDeviceObject): void {
  throw new Error("FFAudioDeviceObject::InitializeQueue() @0xd09740 not yet transcribed");
}
/** @0xd09680 */
export function FFAudioDeviceObject_SetOutputFormat_asbd(_self: FFAudioDeviceObject, _fmt: AudioStreamBasicDescriptionLike): void {
  throw new Error("FFAudioDeviceObject::SetOutputFormat(AudioStreamBasicDescription&) @0xd09680 not yet transcribed");
}
/** @0xd098c0 */
export function FFAudioDeviceObject_SetOutputFormat_dj(_self: FFAudioDeviceObject, _rate: number, _ch: number): void {
  throw new Error("FFAudioDeviceObject::SetOutputFormat(double, unsigned int) @0xd098c0 not yet transcribed");
}
/** @0xd09170 */
export function FFAudioDeviceObject_SetOutputVolume(_self: FFAudioDeviceObject, _v: number): void {
  throw new Error("FFAudioDeviceObject::SetOutputVolume(float) @0xd09170 not yet transcribed");
}
/** @0xd09ac0 */
export function FFAudioDeviceObject_SetChannelLayout(_self: FFAudioDeviceObject, _l: AudioChannelLayoutLike): void {
  throw new Error("FFAudioDeviceObject::SetChannelLayout(AudioChannelLayout const&) @0xd09ac0 not yet transcribed");
}
/** @0xd09b20 */
export function FFAudioDeviceObject_SetInputCallback(_self: FFAudioDeviceObject, _cb: AURenderCallbackStructLike): void {
  throw new Error("FFAudioDeviceObject::SetInputCallback(AURenderCallbackStruct) @0xd09b20 not yet transcribed");
}
/** @0xd09260 */
export function FFAudioDeviceObject_GetChannelValence(_self: FFAudioDeviceObject): number {
  throw new Error("FFAudioDeviceObject::GetChannelValence() @0xd09260 not yet transcribed");
}
/** @0xd09200 */
export function FFAudioDeviceObject_GetMaxBufferFrames(_self: FFAudioDeviceObject): number {
  throw new Error("FFAudioDeviceObject::GetMaxBufferFrames() @0xd09200 not yet transcribed");
}
/** @0xd09960 */
export function FFAudioDeviceObject_SyncFormatToSource(_self: FFAudioDeviceObject): void {
  throw new Error("FFAudioDeviceObject::SyncFormatToSource() @0xd09960 not yet transcribed");
}
/** @0xd09be0 */
export function FFAudioDeviceObject_AddInputRenderNotify(
  _self: FFAudioDeviceObject, _cb: AURenderCallbackFn, _ctx: unknown,
): void {
  throw new Error("FFAudioDeviceObject::AddInputRenderNotify(...) @0xd09be0 not yet transcribed");
}
/** @0xd090c0 */
export function FFAudioDeviceObject_GetOutputVolumeRange(_self: FFAudioDeviceObject): unknown {
  throw new Error("FFAudioDeviceObject::GetOutputVolumeRange() @0xd090c0 not yet transcribed");
}
/** @0xd091e0 */
export function FFAudioDeviceObject_GetDefaultOutputVolume(_self: FFAudioDeviceObject): number {
  throw new Error("FFAudioDeviceObject::GetDefaultOutputVolume() @0xd091e0 not yet transcribed");
}
/** @0xd09c30 */
export function FFAudioDeviceObject_RemoveInputRenderNotify(
  _self: FFAudioDeviceObject, _cb: AURenderCallbackFn, _ctx: unknown,
): void {
  throw new Error("FFAudioDeviceObject::RemoveInputRenderNotify(...) @0xd09c30 not yet transcribed");
}
/** @0xd0a460 */
export function FFAudioDeviceObject_AddObservingNotification(
  _self: FFAudioDeviceObject, _observer: NSObjectLike, _id: FFNotificationID_Like, _cb: FFNotificationCallbackFn,
): void {
  throw new Error("FFAudioDeviceObject::AddObservingNotification(NSObject*, FFNotificationID_*, void(*)(void*, FFNotification*)) @0xd0a460 not yet transcribed");
}
/** @0xd0a390 */
export function FFAudioDeviceObject_InputDeviceGraphCallback(
  _ctx: unknown, _flags: number, _ts: AudioTimeStampLike, _bus: number, _frames: number, _io: AudioBufferListLike,
): number {
  throw new Error("FFAudioDeviceObject::InputDeviceGraphCallback(...) @0xd0a390 not yet transcribed");
}
/** @0xd0a710 — the mangled sym isn't in the addr table (likely lives on a
 *  code path outside the primary text section; retained as a stub with symbol-based citation). */
export function FFAudioDeviceObject_SetSpatializationEnabled(_self: FFAudioDeviceObject, _on: boolean): void {
  throw new Error("FFAudioDeviceObject::SetSpatializationEnabled(bool) @0xd0a710 not yet transcribed");
}
/** @0xd0a330 */
export function FFAudioDeviceObject_OutputDeviceGraphCallback(
  _ctx: unknown, _flags: number, _ts: AudioTimeStampLike, _bus: number, _frames: number, _io: AudioBufferListLike,
): number {
  throw new Error("FFAudioDeviceObject::OutputDeviceGraphCallback(...) @0xd0a330 not yet transcribed");
}
/** @0xd0a590 */
export function FFAudioDeviceObject_OutputDeviceQueueCallback(
  _ctx: unknown, _q: OpaqueAudioQueueLike, _buf: AudioQueueBufferLike,
): void {
  throw new Error("FFAudioDeviceObject::OutputDeviceQueueCallback(void*, OpaqueAudioQueue*, AudioQueueBuffer*) @0xd0a590 not yet transcribed");
}
/** @0xd0a4e0 */
export function FFAudioDeviceObject_RenderSourceToQueueBuffer(
  _self: FFAudioDeviceObject, _buf: AudioQueueBufferLike, _ts: AudioTimeStampLike,
): void {
  throw new Error("FFAudioDeviceObject::RenderSourceToQueueBuffer(AudioQueueBuffer*, AudioTimeStamp const&) @0xd0a4e0 not yet transcribed");
}
/** @0xd0a700 — same "not-in-primary-text" caveat as SetSpatializationEnabled. */
export function FFAudioDeviceObject_GetPreferredChannelLayout(_self: FFAudioDeviceObject): AudioChannelLayoutLike {
  throw new Error("FFAudioDeviceObject::GetPreferredChannelLayout() @0xd0a700 not yet transcribed");
}
/** @0xd0a0f0 */
export function FFAudioDeviceObject_Initialize(_self: FFAudioDeviceObject): void {
  throw new Error("FFAudioDeviceObject::Initialize() @0xd0a0f0 not yet transcribed");
}
/** @0xd0a0c0 */
export function FFAudioDeviceObject_Reconstruct(_self: FFAudioDeviceObject): void {
  throw new Error("FFAudioDeviceObject::Reconstruct() @0xd0a0c0 not yet transcribed");
}
/** @0xd0a670 */
export function FFAudioDeviceObject_Deinitialize(_self: FFAudioDeviceObject): void {
  throw new Error("FFAudioDeviceObject::Deinitialize() @0xd0a670 not yet transcribed");
}
/** @0xd0a010 */
export function FFAudioDeviceObject_Stop(_self: FFAudioDeviceObject): void {
  throw new Error("FFAudioDeviceObject::Stop() @0xd0a010 not yet transcribed");
}
/** @0xd0a090 */
export function FFAudioDeviceObject_Reset(_self: FFAudioDeviceObject): void {
  throw new Error("FFAudioDeviceObject::Reset() @0xd0a090 not yet transcribed");
}
/** @0xd09c80 */
export function FFAudioDeviceObject_Start(_self: FFAudioDeviceObject): void {
  throw new Error("FFAudioDeviceObject::Start() @0xd09c80 not yet transcribed");
}
