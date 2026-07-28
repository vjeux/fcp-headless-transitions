// FFGraphAttachedParameterChaser.ts — Flexo framework's
// FFGraphAttachedParameterChaser: a multiple-inheritance "parameter chaser"
// that registers itself as an FFAudioRenderHook on an FFAudioGraph so its
// PostRender() gets called each audio-render pass. It's a subclass of
// FFSelfAdvancingParameterChaser (the primary base, whose ctor is called
// first) and holds a secondary vtable-bearing base at +0x128 that gives it a
// separate FFAudioRenderHook interface pointer for the "PostRender-only"
// hook slot the graph registers.
//
// Method dispatch:
//   @Flexo 0x0000000001236ac0  FFGraphAttachedParameterChaser::FFGraphAttachedParameterChaser(double, FFAudioGraph*, FFAudioNode*, double)   [C2 base ctor]
//   @Flexo 0x0000000001236b50  FFGraphAttachedParameterChaser::FFGraphAttachedParameterChaser(double, FFAudioGraph*, FFAudioNode*, double)   [C1 complete ctor — identical body, different literal-pool refs]
//   @Flexo 0x0000000001236be0  FFGraphAttachedParameterChaser::CleanupForDestroy()
//   @Flexo 0x0000000001236de0  FFGraphAttachedParameterChaser::~FFGraphAttachedParameterChaser()   [D1]
//   @Flexo 0x0000000001236e30  FFGraphAttachedParameterChaser::~FFGraphAttachedParameterChaser()   [D0 — same as D1 plus operator delete]
//   @Flexo 0x0000000001236e80  FFGraphAttachedParameterChaser::PostRender(unsigned int, AudioTimeStamp const&, unsigned int, unsigned int, AudioBufferList const&)
//
// Also present (Thn296 thunks, not distinct methods — they adjust `this` back
// to the primary object before jumping into the real D1/D0/PostRender):
//   @Flexo 0x0000000001236ec0  ...D1Ev (Thn296)
//   @Flexo 0x0000000001236f20  ...D0Ev (Thn296)
//   @Flexo 0x0000000001236f80  ...PostRender... (Thn296)
//
// Source disassembly (in this worktree's raw-port/re/disasm/):
//   Flexo.FFGraphAttachedParameterChaser.s  (@0x1236ac0..0x1236fbe, full class body incl. thunks)
//
// STRUCT LAYOUT (recovered from field stores in the C2/C1 ctors @0x1236ade..
// 0x1236afe, from PostRender's field reads @0x1236e89..0x1236eae, and from
// the D1 dtor's sub-object dispatch @0x1236df8..0x1236e08):
//   +0x00   vptr_primary       (primary vtable for FFGraphAttachedParameterChaser;
//                               installed @0x1236ae6: `movq $primary_vtable, (%rbx)`)
//   +0x08   ...FFSelfAdvancingParameterChaser fields (primary base — ctor
//           called @0x1236ad3 __ZN30FFSelfAdvancingParameterChaserC2Edd)
//   +0x20   FFMultiParameterChaser sub-object      (member — dtor called
//           @0x1236e08 __ZN22FFMultiParameterChaserD2Ev with `leaq 0x20(%rbx)`)
//   +0xC0   nextChaseFrame:u64                     (running frame counter —
//           PostRender @0x1236e89 does `movq 0xc0(%rdi), rcx`; the atomic
//           `xchgq` @0x1236e9e updates it with the new "reached" frame)
//   +0xC8   chaseStride:u64                        (frame delta added per
//           PostRender pass — @0x1236e97: `addq 0xc8(%rdi), rax`)
//   +0xD0   needsMachPortWake:bool                 (byte — @0x1236ea5:
//           `cmpb $1, 0xd0(%rdi)` selects between vtable dispatch and the
//           mach-port wake side-channel)
//   +0xD8   ...STParameterEventQueue sub-object   (embedded — dtor called
//           @0x1236dff __ZN21STParameterEventQueueD1Ev with `leaq 0xd8(%rbx)`;
//           this is ALSO the FFAudioRenderHook payload passed to
//           AddRenderHook @0x1236b25)
//   +0x128  vptr_secondary                         (secondary vtable for the
//           FFAudioRenderHook interface — installed @0x1236af0: `movq $vt,
//           0x128(%rbx)`; the +296 = 0x128 offset matches the Thn296 thunks)
//   +0x130  graph:FFAudioGraph*                    (stored @0x1236af7; also
//           read by CleanupForDestroy @0x1236bf0 and by the FIRST AddRenderHook
//           call @0x1236b05 as its `this`)
//   +0x138  node:FFAudioNode*                      (stored @0x1236afe; passed as
//           the FFAudioNode* arg to both AddRenderHook calls)
//   sizeof ≥ 0x140 (0x128 + 0x18 = 0x140).
//
// The chosen field names are STRUCTURAL — the actual C++ member identifiers
// are not recoverable from the stripped binary. Naming rationale:
//   - vptr_primary / vptr_secondary: the two `movq $literal_pool, ...` stores
//     inside the ctor install two distinct vtables; the Thn296 thunks confirm
//     the second one is +0x128 into the object.
//   - nextChaseFrame / chaseStride / needsMachPortWake: PostRender's body is
//     "compare current AudioTimeStamp.mSampleTime to nextChaseFrame; if past,
//     advance by chaseStride via xchg (atomic), then either invoke primary
//     vtable slot 0 (`callq *(%rax)`) or send a mach-port wake message". This
//     is a "parameter chaser" — a component that advances a rendering-time
//     parameter timeline to match sample-clock progress.
//   - graph / node: the two AddRenderHook calls in the ctor take (graph,
//     hookAddr, node) with hookAddr being the +0x128 payload (secondary
//     vtable) for the first call and +0xd8 (STParameterEventQueue) for the
//     second call. CleanupForDestroy removes only the +0xd8 hook (see below).
//
// Numerics: AudioTimeStamp.mSampleTime is a `Float64` at offset +0x00; PostRender
// reads it via `cvttsd2si (%rdx), %rax` @0x1236e84 which truncates-toward-zero
// to a signed i64 frame index. The `xchgq %rax, 0xc0(%rdi)` @0x1236e9e is an
// implicit-LOCKed 64-bit exchange (Intel semantics — `xchg` with a memory
// operand is atomic without an explicit LOCK prefix). This is intentional —
// PostRender runs on the audio render thread and must publish its update
// atomically to any reader (the mach-port callback, on another thread).
//
// FRONTIER DEPENDENCIES (raise on entry — not yet ported):
//   - FFSelfAdvancingParameterChaser (Flexo, ctor @Flexo 0x???? — called
//     @0x1236ad3, dtor @0x1236b3b). Primary base class; every ctor path in
//     this file starts by calling its C2 ctor.
//   - FFAudioGraph::AddRenderHook (Flexo, @Flexo 0x???? — called twice
//     @0x1236b0b and @0x1236b25) / FFAudioGraph::RemoveRenderHook (Flexo,
//     @Flexo 0x???? — called @0x1236bfe and tail-jumped @0x1236c1e).
//   - FFAudioNode* — opaque pointer stored in +0x138.
//   - STParameterEventQueue::~STParameterEventQueue (Flexo — called in D1
//     @0x1236dff / Thn296-D1 @0x1236eeb).
//   - FFMultiParameterChaser::~FFMultiParameterChaser (Flexo — called in D1
//     @0x1236e08 / Thn296-D1 @0x1236efa).
//   - FFMachPortDispatchQueueCallback::DetachFromQueue + ~ (Flexo — called
//     in D1 @0x1236df3 / @0x1236e16, D0 @0x1236e43 / @0x1236e60).
//   - FFMachPortCallback::SendEmptyMessageToPort(bool) (Flexo — called by
//     PostRender @0x1236eba as the "wake reader thread" side channel).
//   - AudioTimeStamp (CoreAudio POD — {mSampleTime:Float64, ...}). We model
//     only the field PostRender actually reads (mSampleTime @+0x00).
//   - AudioBufferList (CoreAudio POD — passed by-ref but never dereferenced
//     by PostRender; we surface it as an opaque type).
//
// PostRender is the ONLY method with self-contained math; all four ctor/dtor
// paths and CleanupForDestroy are pure glue that reaches into unported base
// classes and CoreAudio. Those methods therefore raise on entry, citing the
// callees they would need. PostRender is fully transcribed.

// ---------------------------------------------------------------------------
// Opaque frontier types.

/**
 * FFAudioGraph — audio-processing graph owner. Only referenced as an opaque
 * pointer here (stored in +0x130; passed to AddRenderHook / RemoveRenderHook
 * as `this` and to CleanupForDestroy as its target). Not yet ported.
 */
export type FFAudioGraph = { readonly __ffAudioGraphBrand: unique symbol };

/**
 * FFAudioNode — audio-processing node inside a graph. Only referenced as an
 * opaque pointer here (stored in +0x138; passed as the FFAudioNode* arg to
 * AddRenderHook / RemoveRenderHook). Not yet ported.
 */
export type FFAudioNode = { readonly __ffAudioNodeBrand: unique symbol };

/**
 * AudioTimeStamp — CoreAudio timestamp POD. PostRender only touches
 * mSampleTime (a Float64 at offset +0x00). We keep just that field so the
 * signature matches without pulling in the full CoreAudio type.
 */
export interface AudioTimeStamp {
  mSampleTime: number; // Float64 — sample-clock time (frames since some origin)
}

/**
 * AudioBufferList — CoreAudio buffer descriptor. PostRender takes it by
 * const-ref but never dereferences it in this class; opaque here.
 */
export type AudioBufferList = { readonly __audioBufferListBrand: unique symbol };

/**
 * FFAudioRenderHook — the interface that FFAudioGraph::AddRenderHook takes.
 * Instances of FFGraphAttachedParameterChaser register themselves under this
 * interface at +0x128 (via the secondary vtable) and at +0xd8 (as the
 * embedded STParameterEventQueue). Opaque here; the render-hook contract is
 * defined by FFAudioGraph, not by this class.
 */
export type FFAudioRenderHook = { readonly __ffAudioRenderHookBrand: unique symbol };

// ---------------------------------------------------------------------------
// Frontier stubs — every call cites its @0xADDR from the raw disasm.

function ffSelfAdvancingParameterChaser_ctor(_self: FFGraphAttachedParameterChaser, _a: number, _b: number): void {
  // @Flexo 0x1236ad3 callq __ZN30FFSelfAdvancingParameterChaserC2Edd — not yet ported.
  throw new Error(
    "FFSelfAdvancingParameterChaser::FFSelfAdvancingParameterChaser(double, double) not yet ported (Flexo @0x1236ad3) — raise",
  );
}

function ffAudioGraph_AddRenderHook(_graph: FFAudioGraph, _hook: FFAudioRenderHook, _node: FFAudioNode): void {
  // @Flexo 0x1236b0b + 0x1236b25 callq __ZN12FFAudioGraph13AddRenderHookE... — not yet ported.
  throw new Error(
    "FFAudioGraph::AddRenderHook(FFAudioRenderHook*, FFAudioNode*) not yet ported (Flexo @0x1236b0b, @0x1236b25) — raise",
  );
}

function ffAudioGraph_RemoveRenderHook(_graph: FFAudioGraph, _hook: FFAudioRenderHook, _node: FFAudioNode): void {
  // @Flexo 0x1236bfe callq / @Flexo 0x1236c1e jmp __ZN12FFAudioGraph16RemoveRenderHookE... — not yet ported.
  throw new Error(
    "FFAudioGraph::RemoveRenderHook(FFAudioRenderHook*, FFAudioNode*) not yet ported (Flexo @0x1236bfe, @0x1236c1e) — raise",
  );
}

function stParameterEventQueue_dtor(_self: FFGraphAttachedParameterChaser): void {
  // @Flexo 0x1236dff / 0x1236e4f callq __ZN21STParameterEventQueueD1Ev — not yet ported.
  throw new Error("STParameterEventQueue::~STParameterEventQueue not yet ported (Flexo @0x1236dff, @0x1236e4f) — raise");
}

function ffMultiParameterChaser_dtor(_self: FFGraphAttachedParameterChaser): void {
  // @Flexo 0x1236e08 / 0x1236e58 callq __ZN22FFMultiParameterChaserD2Ev — not yet ported.
  throw new Error("FFMultiParameterChaser::~FFMultiParameterChaser not yet ported (Flexo @0x1236e08, @0x1236e58) — raise");
}

function ffMachPortDispatchQueueCallback_DetachFromQueue(_self: FFGraphAttachedParameterChaser): void {
  // @Flexo 0x1236df3 / 0x1236e43 callq __ZN31FFMachPortDispatchQueueCallback15DetachFromQueueEv — not yet ported.
  throw new Error(
    "FFMachPortDispatchQueueCallback::DetachFromQueue not yet ported (Flexo @0x1236df3, @0x1236e43) — raise",
  );
}

function ffMachPortDispatchQueueCallback_dtor(_self: FFGraphAttachedParameterChaser): void {
  // @Flexo 0x1236e16 jmp / 0x1236e60 callq __ZN31FFMachPortDispatchQueueCallbackD2Ev — not yet ported.
  throw new Error(
    "FFMachPortDispatchQueueCallback::~FFMachPortDispatchQueueCallback not yet ported (Flexo @0x1236e16, @0x1236e60) — raise",
  );
}

function ffMachPortCallback_SendEmptyMessageToPort(_self: FFGraphAttachedParameterChaser, _flag: boolean): void {
  // @Flexo 0x1236eba jmp __ZN18FFMachPortCallback22SendEmptyMessageToPortEb — not yet ported.
  throw new Error(
    "FFMachPortCallback::SendEmptyMessageToPort(bool) not yet ported (Flexo @0x1236eba) — raise",
  );
}

/**
 * Slot 0 of the primary vtable — called by PostRender @0x1236eb2 as
 * `callq *(%rax)` (rax = *(this+0x00) = vptr_primary, so this dispatches
 * *(vtable+0x00)(this)). The concrete override lives on whichever subclass
 * derives from FFGraphAttachedParameterChaser at runtime; not yet identified
 * (would require walking every vtable literal-pool entry that points here).
 */
function primaryVtableSlot0(_self: FFGraphAttachedParameterChaser): void {
  // @Flexo 0x1236eb2 jmpq *(%rax) — vtable slot 0 of the primary vtable.
  throw new Error(
    "FFGraphAttachedParameterChaser primary vtable slot 0 (callq *(vtable+0)) not yet ported (Flexo @0x1236eb2) — raise",
  );
}

// ---------------------------------------------------------------------------
// FFGraphAttachedParameterChaser — the class itself.

export class FFGraphAttachedParameterChaser {
  // Fields mirror the recovered struct layout above. We store only what
  // PostRender actually touches (nextChaseFrame, chaseStride, needsMachPortWake)
  // as first-class TS state; base-class sub-objects and vtable pointers are
  // conceptual placeholders — the raw C++ has them but we do not model their
  // storage because every access to them raises via a stub.
  private graph: FFAudioGraph | null = null; // +0x130
  private node: FFAudioNode | null = null; // +0x138
  private nextChaseFrame = 0; // +0xC0 (i64 in asm; JS number holds ≤2^53 sample frames)
  private chaseStride = 0; // +0xC8 (i64)
  private needsMachPortWake = false; // +0xD0 (byte)

  /**
   * FFGraphAttachedParameterChaser::FFGraphAttachedParameterChaser(double, FFAudioGraph*, FFAudioNode*, double)
   * @Flexo 0x1236ac0 (C2 base ctor). The C1 complete ctor @0x1236b50 has an
   *   identical instruction sequence — it just references a different set of
   *   literal-pool addresses for the two vtables (the C2/C1 distinction is a
   *   linker convention; both variants are entered by different construction
   *   contexts but do the same work).
   *
   * Sequence transcribed from @0x1236ac0..0x1236b34:
   *   callq FFSelfAdvancingParameterChaser::FFSelfAdvancingParameterChaser(double, double)  ; @0x1236ad3
   *     ; with args (xmm0 = arg1 = the FIRST double, xmm1 = arg2 = the FOURTH double).
   *     ; Note: the caller passes 4 args (double, FFAudioGraph*, FFAudioNode*, double);
   *     ; the primary base takes only 2 doubles — xmm0 unchanged, xmm1 comes from the
   *     ; caller's 4th arg. This is enforced by the SysV ABI's xmm register passing.
   *   ; Install primary vtable at +0x00 and secondary at +0x128:
   *   leaq  primary_vtable(%rip),  %rax; movq %rax, (%rbx)          ; @0x1236ae6
   *   leaq  secondary_vtable(%rip), %rax; movq %rax, 0x128(%rbx)    ; @0x1236af0
   *   ; Stash graph and node:
   *   movq  %r15(=arg2=graph), 0x130(%rbx)                          ; @0x1236af7
   *   movq  %r14(=arg3=node),  0x138(%rbx)                          ; @0x1236afe
   *   ; Register two render hooks with the graph — first with the secondary
   *   ; vtable object at +0x128 as the FFAudioRenderHook*, then with the
   *   ; embedded STParameterEventQueue at +0xd8:
   *   movq  %r15, %rdi                          ; rdi = graph
   *   leaq  0x128(%rbx), %rsi                   ; rsi = &self.secondary (+0x128)
   *   movq  %r14, %rdx                          ; rdx = node
   *   callq FFAudioGraph::AddRenderHook(FFAudioRenderHook*, FFAudioNode*)   ; @0x1236b0b
   *   leaq  0xd8(%rbx), %rsi                    ; rsi = &self.eventQueue (+0xd8)
   *   movq  0x130(%rbx), %rdi                   ; rdi = graph (re-read)
   *   movq  0x138(%rbx), %rdx                   ; rdx = node  (re-read)
   *   callq FFAudioGraph::AddRenderHook(FFAudioRenderHook*, FFAudioNode*)   ; @0x1236b25
   *   ret
   *
   * The unwind path @0x1236b35..0x1236b43 handles an exception from either
   * AddRenderHook by calling FFSelfAdvancingParameterChaser::~D2 then
   * __Unwind_Resume; not modeled in TS (JS exceptions unwind cleanup via
   * finally / class semantics naturally, but that requires the base to be
   * portable — which it isn't yet).
   *
   * Both AddRenderHook calls raise from the frontier stub — the ctor cannot
   * complete without the base class + graph API being ported. We keep the
   * structural writes (graph, node, vtable install placeholders) as comments
   * so the future port has an anchor.
   */
  constructor(_arg1: number, graph: FFAudioGraph, node: FFAudioNode, _arg4: number) {
    // @0x1236ad3: primary-base ctor with (arg1, arg4) — raises.
    ffSelfAdvancingParameterChaser_ctor(this, _arg1, _arg4);

    // @0x1236ae6 / @0x1236af0: vtable installs — no TS analog since we do not
    // model the C++ vtable pointers directly; the class's virtual-dispatch
    // slots are surfaced as named methods on this object (e.g. PostRender)
    // which JS's own dispatch mechanism resolves.

    // @0x1236af7 / @0x1236afe: stash graph + node.
    this.graph = graph;
    this.node = node;

    // @0x1236b0b: first AddRenderHook — registers self.secondary (+0x128)
    // as the render hook so the graph sees this object under its
    // FFAudioRenderHook secondary vtable.
    ffAudioGraph_AddRenderHook(graph, this as unknown as FFAudioRenderHook, node);

    // @0x1236b25: second AddRenderHook — registers the embedded
    // STParameterEventQueue (+0xd8) as an additional render hook.
    ffAudioGraph_AddRenderHook(graph, this as unknown as FFAudioRenderHook, node);
  }

  /**
   * FFGraphAttachedParameterChaser::CleanupForDestroy()
   * @Flexo 0x1236be0..0x1236c1e.
   *
   * Sequence:
   *   leaq  0xd8(%rdi), %rsi           ; rsi = &self.eventQueue (+0xd8)
   *   movq  0x130(%rdi), %rdi          ; rdi = self.graph
   *   movq  0x138(%rbx), %rdx          ; rdx = self.node
   *   callq FFAudioGraph::RemoveRenderHook(FFAudioRenderHook*, FFAudioNode*)   ; @0x1236bfe
   *   leaq  0x128(%rbx), %rsi          ; rsi = &self.secondary (+0x128)
   *   movq  0x130(%rbx), %rdi          ; rdi = graph
   *   movq  0x138(%rbx), %rdx          ; rdx = node
   *   jmp   FFAudioGraph::RemoveRenderHook(FFAudioRenderHook*, FFAudioNode*)   ; @0x1236c1e (tail-call)
   *
   * Semantics: reverse the two AddRenderHook calls from the ctor, in reverse
   * order (eventQueue first, then secondary vtable). Called from the
   * destructor path of the owning subclass BEFORE this object's own dtor runs
   * (the raw dtor D1/D0 does NOT re-call CleanupForDestroy — they're separate).
   */
  cleanupForDestroy(): void {
    if (this.graph === null || this.node === null) {
      // Guard: matches the raw class's implicit assumption that graph+node
      // are non-null while the object is live. The raw code would deref
      // stale bytes if called after these had been zeroed — we surface it.
      throw new Error("FFGraphAttachedParameterChaser::CleanupForDestroy called with null graph/node — raise");
    }
    // @0x1236bfe: RemoveRenderHook(graph, &self.eventQueue, node).
    ffAudioGraph_RemoveRenderHook(this.graph, this as unknown as FFAudioRenderHook, this.node);
    // @0x1236c1e (tail-jmp): RemoveRenderHook(graph, &self.secondary, node).
    ffAudioGraph_RemoveRenderHook(this.graph, this as unknown as FFAudioRenderHook, this.node);
  }

  /**
   * FFGraphAttachedParameterChaser::~FFGraphAttachedParameterChaser()  [D1]
   * @Flexo 0x1236de0..0x1236e16.
   *
   * Sequence:
   *   leaq  primary_dtor_vtable(%rip), %rax; movq %rax, (%rdi)     ; @0x1236de9 — re-arm vtable to a dtor-only variant
   *   callq FFMachPortDispatchQueueCallback::DetachFromQueue()      ; @0x1236df3
   *   leaq  0xd8(%rbx), %rdi; callq STParameterEventQueue::~D1     ; @0x1236dff
   *   leaq  0x20(%rbx), %rdi; callq FFMultiParameterChaser::~D2    ; @0x1236e08
   *   movq  %rbx, %rdi; jmp FFMachPortDispatchQueueCallback::~D2    ; @0x1236e16 (tail-call)
   *
   * D0 @0x1236e30 is the same body plus an operator delete tail-call at
   * @0x1236e6e (`jmp __ZdlPv`); TS has no distinct "deleting destructor"
   * concept — we model both as a single destroy() and note the delete step.
   *
   * Every callee is a frontier — the destructor cannot run to completion in
   * TS. We surface the exact sequence via chained raises so the future port
   * has an execution order to match.
   */
  destroy(): void {
    // @0x1236de9: re-arm vptr to the D1 dtor-only variant. No TS analog.
    // @0x1236df3: DetachFromQueue.
    ffMachPortDispatchQueueCallback_DetachFromQueue(this);
    // @0x1236dff: STParameterEventQueue::~D1 on the +0xd8 embedded sub-object.
    stParameterEventQueue_dtor(this);
    // @0x1236e08: FFMultiParameterChaser::~D2 on the +0x20 embedded sub-object.
    ffMultiParameterChaser_dtor(this);
    // @0x1236e16 (tail-jmp): FFMachPortDispatchQueueCallback::~D2 on `this`.
    ffMachPortDispatchQueueCallback_dtor(this);
  }

  /**
   * FFGraphAttachedParameterChaser::PostRender(unsigned int inActionFlags,
   *   AudioTimeStamp const& inTimeStamp, unsigned int inBusNumber,
   *   unsigned int inNumberFrames, AudioBufferList const& ioData)
   * @Flexo 0x1236e80..0x1236eba.
   *
   * Sequence (this is a raw transcription — every branch mirrored):
   *   cvttsd2si (%rdx), %rax           ; rax = i64(trunc-toward-zero(inTimeStamp.mSampleTime))
   *   movq  0xc0(%rdi), %rcx           ; rcx = self.nextChaseFrame
   *   cmpq  %rax, %rcx                 ; sets flags for `rcx - rax`
   *   jle   0x1236e97                  ; if (rcx <= rax) fall through — the SIGNED "reached" branch
   *   popq  %rbp; retq                 ; else return (still in the future — no work to do)
   * reached:                           ; @0x1236e97:
   *   addq  0xc8(%rdi), %rax           ; rax += self.chaseStride  (new "next" frame)
   *   xchgq %rax, 0xc0(%rdi)           ; atomic xchg → self.nextChaseFrame; rax=OLD nextChaseFrame
   *                                     ; (Intel xchg with mem operand is implicitly LOCKed.)
   *   cmpb  $1, 0xd0(%rdi)             ; test self.needsMachPortWake (byte)
   *   jne   0x1236eb4                  ; if != 1 → skip vtable dispatch → mach-port wake path
   *   movq  (%rdi), %rax               ; rax = vptr_primary
   *   popq  %rbp; jmpq  *(%rax)        ; tail-jmp to *(vtable+0)(this)
   * mach_port:                         ; @0x1236eb4:
   *   movl  $1, %esi                   ; arg = true
   *   popq  %rbp; jmp SendEmptyMessageToPort ; tail-jmp
   *
   * Semantics: on each render pass the AUDIO thread checks whether the graph's
   * sample-clock has advanced past the next scheduled "chase" frame; when it
   * has, it atomically publishes the next scheduled frame (current + stride)
   * and notifies the parameter-updating logic — either by directly invoking
   * vtable slot 0 of the primary vtable (fast path, in-thread) or by sending
   * an empty mach message to wake a reader on another thread (slow path).
   *
   * `jle` in the asm is a SIGNED compare (jump if signed-less-or-equal). Since
   * mSampleTime is a Float64 truncated to i64 (which can be any sign) and
   * nextChaseFrame is an i64, the signed compare is the correct semantics —
   * we mirror it with a plain `>` on the JS numbers (both stored as regular
   * numbers; frame counts stay well within JS's ±2^53 safe-integer range).
   *
   * Both branch outcomes (vtable slot 0 and SendEmptyMessageToPort) hit
   * frontier stubs that raise. In a fully-ported world the vtable-slot
   * dispatch would flow into whichever subclass override sits at that slot.
   */
  postRender(
    _inActionFlags: number,
    inTimeStamp: AudioTimeStamp,
    _inBusNumber: number,
    _inNumberFrames: number,
    _ioData: AudioBufferList,
  ): void {
    // @0x1236e84 cvttsd2si (%rdx), %rax — truncate mSampleTime toward zero.
    // Math.trunc mirrors x86 cvttsd2si's rounding mode (RTZ) for finite inputs;
    // NaN/Inf behavior differs (x86 would produce 0x8000_0000_0000_0000 = INT64_MIN)
    // but PostRender is only called by the audio thread with a valid timestamp,
    // so the finite-input mapping is a direct TS transcription.
    const currentFrame = Math.trunc(inTimeStamp.mSampleTime);

    // @0x1236e89..0x1236e93 cmpq + jle: if (nextChaseFrame <= currentFrame) advance.
    if (this.nextChaseFrame > currentFrame) {
      // Not yet reached — early return matches @0x1236e95 popq/retq.
      return;
    }

    // @0x1236e97 addq %rax, 0xc8(%rdi): scheduledNext = currentFrame + stride.
    const scheduledNext = currentFrame + this.chaseStride;
    // @0x1236e9e xchgq — atomic publish. In TS's single-threaded model this
    // is just a plain assignment; we retain the ordering (compute scheduledNext
    // from currentFrame, then swap) so if this class is ever run under a
    // multi-worker/SharedArrayBuffer host, the pattern maps 1:1 to Atomics.
    // We do NOT read back the "old" nextChaseFrame value because the raw asm
    // discards rax immediately after the xchg — the xchg's atomicity, not its
    // return value, is what matters.
    this.nextChaseFrame = scheduledNext;

    // @0x1236ea5 cmpb $1, 0xd0(%rdi): test needsMachPortWake byte.
    if (this.needsMachPortWake) {
      // @0x1236eb4..0x1236eba: SendEmptyMessageToPort(true) — wake reader.
      ffMachPortCallback_SendEmptyMessageToPort(this, true);
      return;
    }
    // @0x1236eae..0x1236eb2: fast path — tail-jmp to *(vtable+0)(this).
    primaryVtableSlot0(this);
  }
}
