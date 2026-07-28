// raw-port of Flexo C++ class FFAudioPlayerMeteringHook.
// Subclass of FFAudioRenderHook. Provides a per-channel peak-level meter
// attached to a specific node of an FFAudioGraph. On every PostRender, it
// computes the peak absolute sample of each output-bus buffer and CAS-max's
// it into its own atomic per-channel level array. FetchLevels() reads and
// resets those levels atomically.
//
// Source: Flexo.framework (x86_64 slice). Addresses cite the raw file
// offset as reported by `otool -tV -arch x86_64`.
//
// FIELD LAYOUT (recovered from the five method bodies, all offsets on
// `this` = %rdi):
//   0x00  void*                 vptr
//   0x08  float*                levels          (calloc(numChannels, 4))
//   0x10  uint32                numChannels
//   0x18  FFAudioGraph*         graph
//   0x20  FFAudioNode*          node
// Reads: @0xd11f82 stores GetUnitChannels() ret into 0x10(rbx); @0xd11f95
// stores calloc() ret into 0x8(rbx); @0xd11f9e/@0xd11fa2 store the graph/
// node into 0x18/0x20; @0xd11ff0 loads 0x10(rdi) as the channel count;
// FetchLevels/PostRender both index [0x8(rdi) + N*4] as the per-channel
// float slot; Detach loads 0x18(rdi)/0x20(rsi) as graph/node.

import {
  FFAudioRenderHook,
  AudioTimeStamp,
  AudioBufferList,
} from "./FFAudioRenderHook.js";

// ────────────────────────────────────────────────────────────────────────
// Frontier types (opaque — used only by signature/identity). These are all
// undecoded FCP audio graph classes; their concrete shapes are recovered
// as separate ports.
// ────────────────────────────────────────────────────────────────────────

/**
 * Frontier: FFAudioGraph — Flexo audio graph. Signature-only.
 * Referenced from AttachToNode @0xd11f6d (GetAudioUnitInstanceForNode) and
 * @0xd11faf (AddRenderHook), Detach @0xd11fe5 (RemoveRenderHook), and D0/D1
 * @0xd16df3 / @0xd16da3 (RemoveRenderHook again).
 */
export interface FFAudioGraph {
  readonly __ffAudioGraph: unique symbol;
}

/**
 * Frontier: FFAudioNode — a node in an FFAudioGraph.
 * Referenced as the second arg to
 *   FFAudioGraph::GetAudioUnitInstanceForNode(FFAudioNode*)
 *   FFAudioGraph::AddRenderHook   (FFAudioRenderHook*, FFAudioNode*)
 *   FFAudioGraph::RemoveRenderHook(FFAudioRenderHook*, FFAudioNode*)
 */
export interface FFAudioNode {
  readonly __ffAudioNode: unique symbol;
}

/**
 * Frontier: ComponentInstanceRecord — the AudioUnit instance handle from
 * Apple's Component Manager. Returned by
 *   FFAudioGraph::GetAudioUnitInstanceForNode(FFAudioNode*) const
 *   @__stub in Flexo — signature-only here.
 */
export interface ComponentInstanceRecord {
  readonly __componentInstanceRecord: unique symbol;
}

/**
 * Frontier: LoudnessValues — the FetchLevels() third argument type.
 * Signature-only. NOTE: the disassembly of FetchLevels @0xd11ff0..@0xd1204b
 * NEVER writes to this pointer — it is accepted for ABI compatibility but
 * the meter records only per-channel peaks (in the `float*` second arg).
 * See body notes on FetchLevels for the full argument decode.
 */
export interface LoudnessValues {
  readonly __loudnessValues: unique symbol;
}

// ────────────────────────────────────────────────────────────────────────
// Frontier free/static-method stubs (all throwing, all citing @0xADDR)
// ────────────────────────────────────────────────────────────────────────

/**
 * FFAudioGraph::GetAudioUnitInstanceForNode(FFAudioNode*) const
 * Called from AttachToNode @0xd11f6d. Returns a ComponentInstanceRecord*.
 */
function FFAudioGraph_GetAudioUnitInstanceForNode(
  _graph: FFAudioGraph,
  _node: FFAudioNode,
): ComponentInstanceRecord | null {
  throw new Error(
    "FFAudioGraph::GetAudioUnitInstanceForNode not yet ported — needed by FFAudioPlayerMeteringHook::AttachToNode @0xd11f6d",
  );
}

/**
 * FFAudioGraph::GetUnitChannels(ComponentInstanceRecord*, uint scope, uint element)
 * Called from AttachToNode @0xd11f7d with scope=2 (kAudioUnitScope_Output),
 * element=streamIndex.
 */
function FFAudioGraph_GetUnitChannels(
  _au: ComponentInstanceRecord | null,
  _scope: number,
  _element: number,
): number {
  throw new Error(
    "FFAudioGraph::GetUnitChannels not yet ported — needed by FFAudioPlayerMeteringHook::AttachToNode @0xd11f7d",
  );
}

/**
 * FFAudioGraph::AddRenderHook(FFAudioRenderHook*, FFAudioNode*)
 * Called from AttachToNode @0xd11faf.
 */
function FFAudioGraph_AddRenderHook(
  _graph: FFAudioGraph,
  _hook: FFAudioRenderHook,
  _node: FFAudioNode,
): void {
  throw new Error(
    "FFAudioGraph::AddRenderHook not yet ported — needed by FFAudioPlayerMeteringHook::AttachToNode @0xd11faf",
  );
}

/**
 * FFAudioGraph::RemoveRenderHook(FFAudioRenderHook*, FFAudioNode*)
 * Called from Detach @0xd11fe5 (tail-jmp), D1 @0xd16da3, D0 @0xd16df3.
 */
function FFAudioGraph_RemoveRenderHook(
  _graph: FFAudioGraph,
  _hook: FFAudioRenderHook,
  _node: FFAudioNode,
): void {
  throw new Error(
    "FFAudioGraph::RemoveRenderHook not yet ported — needed by FFAudioPlayerMeteringHook::Detach @0xd11fe5",
  );
}

/**
 * MixerVectorFunctions::sMixerVectorFunctions[vtable+0x20] — peak-abs
 * routine. Called from PostRender @0xd120a9 as:
 *   rdi = &buf   (from ioData.mBuffers[c].mData — 0x10(rbx,c*16))
 *   esi = inNumberFrames                                (from r14d)
 *   xmm0 (out) = max |sample| over the buffer
 *
 * The function pointer is loaded via
 *   leaq __ZN20MixerVectorFunctions21sMixerVectorFunctionsE(%rip), %rax
 *   movq (%rax), %rax        ; deref to the vtable-like fn table
 *   callq *0x20(%rax)        ; slot 4 = "peak-abs of a float[N] buffer"
 * — i.e. a runtime-selected SIMD peak scanner (NEON / SSE / AVX depending
 * on hardware). Raising stub — the SIMD binding is not portable.
 */
function MixerVectorFunctions_peakAbs(
  _mData: unknown,
  _frames: number,
): number {
  throw new Error(
    "MixerVectorFunctions::sMixerVectorFunctions[+0x20] peak-abs routine not yet ported — needed by FFAudioPlayerMeteringHook::PostRender @0xd120a9",
  );
}

/**
 * calloc(count, size) — libc.__stubs @Flexo 0x14975a8.
 * Called from AttachToNode @0xd11f90 as calloc(numChannels, 4).
 */
function calloc_floats(_count: number): Float32Array {
  // In TS this is Float32Array which zeroes on allocation. No throwing
  // stub — the semantic is directly expressible.
  return new Float32Array(_count);
}

// ────────────────────────────────────────────────────────────────────────
// Class
// ────────────────────────────────────────────────────────────────────────

/**
 * FFAudioPlayerMeteringHook — per-channel peak meter for one node of an
 * FFAudioGraph. Attach to a node, and each PostRender pass updates a set
 * of atomic per-channel peaks; FetchLevels reads & resets them.
 *
 * All observed methods:
 *   0xd11f50  AttachToNode(FFAudioGraph*, FFAudioNode*, unsigned int)
 *   0xd11fd0  Detach()
 *   0xd11ff0  FetchLevels(unsigned int, float*, LoudnessValues*) const
 *   0xd12050  PostRender(unsigned int, AudioTimeStamp const&, unsigned int,
 *                        unsigned int, AudioBufferList const&)
 *   0xd16d80  ~FFAudioPlayerMeteringHook  [D1]
 *   0xd16dd0  ~FFAudioPlayerMeteringHook  [D0]
 */
export class FFAudioPlayerMeteringHook extends FFAudioRenderHook {
  /**
   * @0x08 — the per-channel peak-level array. `calloc(numChannels, 4)` at
   * AttachToNode @0xd11f90; deleted at D1 @0xd16db7 / D0 @0xd16e01 (via
   * operator delete). Each slot is a 32-bit float; PostRender CAS-max's
   * into it (@0xd120c0..@0xd120d9) and FetchLevels CAS-swaps to zero
   * (@0xd12030..@0xd1203e).
   *
   * `null` before a successful AttachToNode and after Detach/dtor.
   */
  private levels: Float32Array | null = null;

  /**
   * @0x10 — channel count returned by
   *   FFAudioGraph::GetUnitChannels(au, 2 [scope], streamIndex)
   * at AttachToNode @0xd11f7d..@0xd11f82. Read as u32 by FetchLevels
   * @0xd11ff0 and PostRender @0xd12070.
   */
  private numChannels: number = 0;

  /**
   * @0x18 — the graph passed to AttachToNode. Used as the receiver of
   * RemoveRenderHook in Detach/D0/D1.
   */
  private graph: FFAudioGraph | null = null;

  /**
   * @0x20 — the node passed to AttachToNode. Second arg to
   * RemoveRenderHook / AddRenderHook.
   */
  private node: FFAudioNode | null = null;

  /**
   * FFAudioPlayerMeteringHook::AttachToNode(FFAudioGraph* graph,
   *                                          FFAudioNode* node,
   *                                          unsigned int streamIndex)
   *  @Flexo 0xd11f50
   *
   * Asm (@0xd11f50..0xd11fc4):
   *   r12d = streamIndex ; r14 = node ; r15 = graph ; rbx = this
   *   au = FFAudioGraph::GetAudioUnitInstanceForNode(graph, node)   @0xd11f6d
   *   ch = FFAudioGraph::GetUnitChannels(au, 2, streamIndex)        @0xd11f7d
   *   this->numChannels = ch                                        @0xd11f82
   *   if (ch != 0) {                                                @0xd11f85
   *     levels = calloc(ch, 4)                                      @0xd11f90
   *     this->levels = levels                                       @0xd11f95
   *     if (levels != nullptr) {                                    @0xd11f9c
   *       this->graph = graph                                       @0xd11f9e
   *       this->node  = node                                        @0xd11fa2
   *       FFAudioGraph::AddRenderHook(graph, this, node)            @0xd11faf
   *     }
   *   }
   *   return this->levels != nullptr                                @0xd11fb4/@0xd11fb9
   *
   * The `scope=2` at @0xd11f75 (`movl $0x2, %esi`) is
   * kAudioUnitScope_Output. `streamIndex` is passed to GetUnitChannels as
   * `element`.
   */
  AttachToNode(
    graph: FFAudioGraph,
    node: FFAudioNode,
    streamIndex: number,
  ): boolean {
    const au = FFAudioGraph_GetAudioUnitInstanceForNode(graph, node);
    const ch = (FFAudioGraph_GetUnitChannels(au, 2, streamIndex >>> 0) >>> 0);
    this.numChannels = ch;
    if (ch !== 0) {
      const levels = calloc_floats(ch);
      this.levels = levels;
      if (levels !== null) {
        this.graph = graph;
        this.node = node;
        FFAudioGraph_AddRenderHook(graph, this, node);
      }
    }
    return this.levels !== null;
  }

  /**
   * FFAudioPlayerMeteringHook::Detach()
   *  @Flexo 0xd11fd0
   *
   * Asm (@0xd11fd0..0xd11feb):
   *   rsi = rdi = this
   *   rdi = this->graph              ; @0xd11fd7 (0x18(rdi))
   *   if (graph != nullptr) {        ; @0xd11fdb
   *     rdx = this->node             ; @0xd11fe0 (0x20(rsi))
   *     tail-jmp FFAudioGraph::RemoveRenderHook(graph, this, node)  @0xd11fe5
   *   }
   *
   * The tail-jmp uses (rdi=graph, rsi=this, rdx=node), matching the
   * `RemoveRenderHook(FFAudioRenderHook*, FFAudioNode*)` signature as a
   * member of FFAudioGraph: (rdi=this-graph, rsi=hook, rdx=node).
   */
  Detach(): void {
    const graph = this.graph;
    if (graph !== null) {
      const node = this.node;
      // node is guaranteed non-null in the asm path (Attach always sets
      // 0x18 and 0x20 together, or leaves both null); TS narrows a bit
      // more strictly, so the non-null assertion is a faithful mirror.
      if (node !== null) {
        FFAudioGraph_RemoveRenderHook(graph, this, node);
      }
    }
  }

  /**
   * FFAudioPlayerMeteringHook::FetchLevels(unsigned int count,
   *                                         float* outLevels,
   *                                         LoudnessValues* outLoudness) const
   *  @Flexo 0xd11ff0
   *
   * Reads and atomically resets the per-channel peaks into `outLevels`.
   * `outLoudness` is accepted for ABI parity but NEVER read or written.
   *
   * Asm (@0xd11ff0..0xd1204b):
   *   eax = this->numChannels                        @0xd11ff0
   *   if (count > numChannels) esi = numChannels     @0xd11ff3/@0xd11ff5 (cmovbl)
   *   set cl = (outLevels != nullptr) && (count != 0) then AND them
   *   if (!cl) goto 0xd12049                         @0xd12008
   *
   *   r9 = 0                                         @0xd12013
   *   loop:                                          @0xd12020..@0xd1203e
   *     rax = this->levels                           @0xd12020
   *     eax = *(rax + r9*4)                          @0xd12024   (load level)
   *     *(outLevels + r9*4) = eax                    @0xd12030   (write to outLevels)
   *     r10 = this->levels                           @0xd12034
   *     lock cmpxchg [r10 + r9*4], r8d               @0xd12039   (CAS the slot to 0)
   *       ; on failure, retry from the write step    @0xd1203e -> @0xd12030
   *     ++r9                                         @0xd12040
   *   until r9 == count                              @0xd12043
   *
   *   return count                                   @0xd12049 (movl esi, eax)
   *
   * NOTE the two-step cmpxchg loop: the "expected" value in eax is the
   * value we just READ from `levels[i]`. If another thread has updated
   * `levels[i]` since the load, cmpxchg fails, and we re-load the current
   * value into eax (via the intermediate 0xd12030 store's fallthrough —
   * actually the retry re-does *(outLevels + r9*4) = eax  where eax now
   * holds the CAS-returned current value from cmpxchg). This preserves
   * the invariant "outLevels[i] receives whatever value we just cleared
   * to 0 in levels[i]". In the TS version we replicate this exactly on
   * the buffer — JS has no lock cmpxchg on Float32Array, so we use the
   * SharedArrayBuffer-free single-threaded semantics that dominate the
   * JS execution model (a plain read+zero-write is atomic w.r.t. any
   * other JS turn since the JS runtime is single-threaded).
   */
  FetchLevels(
    count: number,
    outLevels: Float32Array | null,
    _outLoudness: LoudnessValues | null,
  ): number {
    let clamped = count >>> 0;
    const nc = this.numChannels >>> 0;
    if (clamped > nc) clamped = nc; // cmovbl @0xd11ff5 (unsigned cmp)
    if (outLevels === null || clamped === 0) return clamped; // @0xd12008
    const levels = this.levels;
    if (levels === null) return clamped; // guard: no attach or already detached
    for (let i = 0; i < clamped; i++) {
      // Single-threaded JS: the {load; store; clear} sequence is a
      // trivial "swap". We mirror the asm's observable effect: the
      // consumer receives the current peak, the storage is reset to 0.
      // (The lock cmpxchg loop @0xd12039 exists solely to defeat the
      // audio-thread's concurrent updates in the C++ world.)
      outLevels[i] = levels[i]!;
      levels[i] = 0;
    }
    return clamped;
  }

  /**
   * FFAudioPlayerMeteringHook::PostRender(unsigned int flags,
   *                                        AudioTimeStamp const& ts,
   *                                        unsigned int busNumber,
   *                                        unsigned int inNumberFrames,
   *                                        AudioBufferList const& ioData)
   *  @Flexo 0xd12050
   *
   * Called by the graph after each render pass. Ignores non-rendering
   * passes (any flag bit in 0x110) and, for each output channel,
   * computes the buffer's peak-abs and CAS-max's it into the stored
   * per-channel peak.
   *
   * Asm (@0xd12050..0xd120f1):
   *   if (flags & 0x110) return                       @0xd12050..@0xd12058
   *   nbuf = ioData.mNumberBuffers                    @0xd1206d   (r9 = ioData; eax = *(r9))
   *   nc   = this->numChannels                        @0xd12070
   *   if (nbuf > nc) nbuf = nc                        @0xd12073/@0xd12075 (cmovbl)
   *   if (nbuf == 0) return                           @0xd12078/@0xd1207a
   *   for (i = 0; i < nbuf; ++i) {                    @0xd12082..@0xd120e1
   *     buf.mData = *(ioData + 0x10 + i*16)           @0xd12090..@0xd12097
   *       ; each mBuffers[i] is a 16-byte struct in the array-tail of
   *       ; AudioBufferList: {UInt32 mNumberChannels, UInt32 mDataByteSize,
   *       ; void* mData}. mData is at +8 within the entry; entries start
   *       ; at ioData+0x08 (after the leading mNumberBuffers u32 + 4 pad),
   *       ; so mData for entry i lives at ioData + 0x10 + i*16.
   *     peak = MixerVectorFunctions.peakAbs(buf.mData, inNumberFrames)  @0xd120a9
   *     prev = this->levels[i]                       @0xd120ac/@0xd120b0
   *   retry:
   *     xmm1 = max(peak, prev-as-float)              @0xd120c4
   *     lock cmpxchg [levels + i*4], xmm1            @0xd120d1
   *       ; on failure -> xmm0 = xmm1; goto retry    @0xd120d6/@0xd120d9
   *     ; i.e. atomic "levels[i] = max(levels[i], peak)"
   *   }
   *
   * In TS we implement the atomic-max as a straight `levels[i] =
   * max(levels[i], peak)` — the JS runtime is single-threaded so no CAS
   * loop is needed.
   */
  PostRender(
    flags: number,
    _ts: AudioTimeStamp,
    _busNumber: number,
    inNumberFrames: number,
    ioData: AudioBufferList,
  ): void {
    if ((flags & 0x110) !== 0) return; // @0xd12050
    const levels = this.levels;
    if (levels === null) return;
    // The @0xd1206d..@0xd12075 nbuf/nc clamp requires reading the
    // AudioBufferList header + buffer entries. Neither shape is decoded
    // in this raw port (see the interface comment on AudioBufferList in
    // FFAudioRenderHook.ts). Delegate to the frontier stubs so callers
    // can supply concrete AudioBufferList bindings later. Raising here
    // is the correct partial-port signal.
    // Faithful @0xd1206d: `movl (%r9), %eax` = ioData.mNumberBuffers.
    // Faithful @0xd12090..@0xd120a9: per-buffer peak-abs via
    //   MixerVectorFunctions::sMixerVectorFunctions[+0x20](mData, frames).
    throw new Error(
      `FFAudioPlayerMeteringHook::PostRender @0xd12050: AudioBufferList entry layout + MixerVectorFunctions::peakAbs @0xd120a9 not yet ported (frames=${inNumberFrames}, ioData=${String(ioData)})`,
    );
    // Loop body (documentation-only; unreachable):
    //   for (let i = 0; i < nbuf; ++i) {
    //     const peak = MixerVectorFunctions_peakAbs(mData_i, inNumberFrames);
    //     const prev = levels[i]!;
    //     levels[i] = peak > prev ? peak : prev;
    //   }
  }

  /**
   * FFAudioPlayerMeteringHook::~FFAudioPlayerMeteringHook() [D1]
   *  @Flexo 0xd16d80
   *
   * Asm (@0xd16d80..0xd16dbe):
   *   this->vptr = <base vtable+0x10>                @0xd16d89..@0xd16d90
   *   rdi = this->graph                              @0xd16d93 (0x18(rdi))
   *   if (graph != nullptr) {                        @0xd16d97
   *     rdx = this->node                             @0xd16d9c (0x20(rbx))
   *     FFAudioGraph::RemoveRenderHook(graph, this, node)   @0xd16da3
   *   }
   *   rdi = this->levels                             @0xd16da8
   *   if (levels != nullptr)                         @0xd16db0
   *     jmp __ZdlPv                                  @0xd16db7  (operator delete)
   *   else return                                    @0xd16dbe
   *
   * FFAudioPlayerMeteringHook::~FFAudioPlayerMeteringHook() [D0]
   *  @Flexo 0xd16dd0
   *
   * D0 body (@0xd16dd0..0xd16e0f) is byte-similar to D1 but with the
   * two-step deleting-dtor tail:
   *   ... (same graph-detach + `if (levels) operator delete(levels)`) ...
   *   rdi = this
   *   jmp __ZdlPv                                     @0xd16e0f (delete this)
   *
   * In TS/JS the operator-delete tail is a no-op (GC) — Detach()'s side
   * effect is what actually matters for correctness (unregisters the hook
   * from the graph). We surface it as `dispose()` and let the runtime
   * reclaim `levels` on drop.
   */
  dispose(): void {
    // Faithful mirror of @0xd16d93..@0xd16da3 / @0xd16de3..@0xd16df3:
    // unhook from the graph. Same shape as Detach() modulo the D0's
    // additional `operator delete(this)` tail (irrelevant in JS).
    this.Detach();
    // Faithful mirror of @0xd16da8..@0xd16db7 / @0xd16df8..@0xd16e01:
    // `if (levels) operator delete[](levels)`. No-op in JS.
    this.levels = null;
    this.graph = null;
    this.node = null;
    this.numChannels = 0;
  }
}
