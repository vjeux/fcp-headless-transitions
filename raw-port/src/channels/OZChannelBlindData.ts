// OZChannelBlindData.ts — raw transcription of ProChannel `OZChannelBlindData`.
//
// `OZChannelBlindData` is the OZ channel that stores opaque, plugin-owned
// ("blind") data at keyframe times. ONE method is transcribed in this file: the
// keyframe lookup. Its ~50 siblings (the ctors/dtors, setData/setValueData,
// getPluginDataPtr/setPluginDataPtr, addKeypointAt/deleteKeypointAt/
// moveKeypointTo, previousKeypoint/nextKeypoint/visibleKeypoints, the
// serializer entry points, …) are NOT ported here; do not add them without
// their own disassembly and address citations.
//
// Provenance (ProChannel framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProChannel.framework/Versions/A/ProChannel
//
// Symbols ported in this file:
//   @0x4fe94  OZChannelBlindData::findKeyframe(CMTime const&, unsigned int)
//               __ZN18OZChannelBlindData12findKeyframeERK6CMTimej
//   @0x505ce  OZChannelBlindData::hasKeypoints(unsigned int) const
//               __ZNK18OZChannelBlindData12hasKeypointsEj
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym __ZN18OZChannelBlindData12findKeyframeERK6CMTimej ProChannel`):
//   raw-port/re/disasm/ProChannel.__ZN18OZChannelBlindData12findKeyframeERK6CMTimej.s (82 lines)
//
// ---------------------------------------------------------------------------
// WHAT THE FUNCTION IS
// ---------------------------------------------------------------------------
// A libc++ `std::lower_bound` over the object's keyframe vector — the classic
// half-open binary search compiled with `cmovns`/`cmovs` instead of branches —
// followed by a small mode switch on the second argument:
//
//   * the search leaves `it` = the FIRST keyframe whose time is NOT less than
//     the query time (one-past-the-end if every keyframe is earlier);
//   * `it == end`      -> return end                                @0x4ff30
//   * mode == 1        -> return `it` (plain lower_bound)            @0x4ff38
//   * mode != 0        -> return end                                 @0x4ff3d
//   * mode == 0        -> return `it` only if `it->time == query`,   @0x4ff83
//                         else end (an EXACT-match lookup)
//
// The two comparisons are the CoreMedia extern `_CMTimeCompare` (stub 0xaca80,
// called @0x4ff0c and @0x4ff83), which is already ported in
// `raw-port/src/infra/CMTime.ts` and is imported and CALLED here.
//
// ---------------------------------------------------------------------------
// LAYOUT
// ---------------------------------------------------------------------------
//   struct OZChannelBlindData {            // derives OZChannelBase
//     ...                                  // +0x000..+0x097 not decoded here
//     Keyframe* keyframesBegin;            // +0x98  `movq 0x98(%rdi),%rbx` @0x4feab
//     Keyframe* keyframesEnd;              // +0xa0  `movq 0xa0(%rdi),%r12` @0x4feb2
//     ...                                  // (+0xa8 is the vector's capacity slot,
//                                          //  never read by this body)
//     PCMutex   lock;                      // +0xb0  (cited only: `leaq 0xb0(%rdi),%rbx ;
//                                          //  callq PCMutex::lock` @0x4fabe/@0x4facf inside
//                                          //  getPluginDataPtr — NOT touched by this method,
//                                          //  which is called with the lock already held)
//   };
//
//   struct Keyframe {                      // stride 0x20 = 32 bytes
//     CMTime time;                         // +0x00..+0x17 (the 24-byte CMTime the search
//                                          //  compares; loaded as `movups -0x20(%r15)` +
//                                          //  `movq -0x10(%r15)` @0x4ff03/@0x4fefa)
//     void*  pluginData;                   // +0x18 (not read by THIS method)
//   };
//
// Stride/offset evidence beyond this body (read from the binary as evidence,
// NOT transcribed — each is its own ledger unit):
//   * `OZChannelBlindData::getNumberOfKeyframes()` @0x515d2 is literally
//     `movq 0xa0(%rdi),%rax ; subq 0x98(%rdi),%rax ; shrq $0x5,%rax` — the same
//     two fields and the same 0x20 stride this body divides by (`sarq $0x5`
//     @0x4fec2).
//   * `OZChannelBlindData::getPluginDataPtr(CMTime const&)` @0x4faa4 calls THIS
//     function with `movl $0x1,%edx` @0x4fb0f (mode 1 = lower_bound), then
//     treats the result as a raw iterator: it compares it against
//     `0x98(%r14)` (begin) @0x4fb27, steps back one element with
//     `leaq -0x20(%rax),%rcx` @0x4fb23 (0x20 stride again), and reads the
//     element's `0x18(%r15)` @0x4fb31 — which is what identifies +0x18 as the
//     plugin-data pointer and confirms the return value is an ELEMENT POINTER.
//
// ---------------------------------------------------------------------------
// RETURN VALUE — pointer modelled as an INDEX
// ---------------------------------------------------------------------------
// The native function returns a raw `Keyframe*` iterator: either a pointer into
// the keyframe array, or the end pointer (`keyframesEnd`) to signal "no match".
// TypeScript has no interior pointers, so the port returns the equivalent
// INDEX — `(returnedPointer - keyframesBegin) / 0x20` — with `keyframes.length`
// standing for the end iterator. That is the same pointer→index modelling the
// landed `FFAudioDuckingMasterRangeData.ts` uses for its own `lower_bound`
// (see its step (5), which performs exactly that byte-difference division).
// Callers therefore test `result === self.keyframes.length` where the native
// tests `rax == 0xa0(%rdi)`, and step back with `result - 1` where the native
// does `leaq -0x20(%rax)`.

import { CMTimeCompare, type CMTime } from "../infra/CMTime.js";

/**
 * One entry of `OZChannelBlindData`'s keyframe vector — 0x20 bytes.
 *
 * @ProChannel 0x4fe94 (stride from `sarq $0x5` @0x4fec2 and `leaq 0x20(%rbx,%rax)`
 * @0x4fef5; corroborated by `shrq $0x5` in getNumberOfKeyframes @0x515e4)
 */
export interface OZChannelBlindDataKeyframe {
  /**
   * +0x00..+0x17 — the keyframe's CMTime, the key of the binary search
   * (`movups -0x20(%r15),%xmm0` @0x4ff03 + `movq -0x10(%r15),%rax` @0x4fefa
   * assemble the 24-byte by-value argument for `_CMTimeCompare`).
   */
  time: CMTime;
  /**
   * +0x18 — the opaque plugin ("blind") data pointer. THIS method never reads
   * it; the offset is cited from `getPluginDataPtr` @0x4fb31 (`movq 0x18(%r15),%rax`)
   * and is recorded because it is what makes the element 0x20 bytes wide.
   */
  pluginData?: unknown;
}

/**
 * The fields of `OZChannelBlindData` that this method touches: the keyframe
 * vector at +0x98 (begin) / +0xa0 (end).
 *
 * A `std::vector<Keyframe>`'s begin/end pointer pair is one TS array — the port
 * reads `keyframes.length` where the native computes `(end - begin) >> 5`
 * (@0x4feb9..@0x4fec2). Do not add fields here that this unit did not decode.
 *
 * @ProChannel 0x4fe94
 */
export interface OZChannelBlindDataState {
  /** +0x98 begin (`movq 0x98(%rdi),%rbx` @0x4feab) / +0xa0 end (@0x4feb2). */
  keyframes: OZChannelBlindDataKeyframe[];
}

/**
 * `OZChannelBlindData::findKeyframe(CMTime const& queryTime, unsigned int mode)`
 *   — @ProChannel 0x4fe94
 *   — __ZN18OZChannelBlindData12findKeyframeERK6CMTimej
 *
 * Binary-searches the keyframe vector for `queryTime` and applies the `mode`
 * filter. Returns the index of the found keyframe, or `keyframes.length` (the
 * native end pointer) when there is none.
 *
 * Full transcription — every instruction, in order:
 *
 *   0x4fe94  pushq %rbp                    ; frame setup (no TS counterpart)
 *   0x4fe95  movq  %rsp,%rbp               ; frame setup
 *   0x4fe98  pushq %r15 … 0x4fea1 subq $0x78,%rsp  ; callee-saves + 0x78 frame
 *   0x4fea5  movl  %edx,-0x2c(%rbp)        ; spill mode (u32)
 *   0x4fea8  movq  %rsi,%r14               ; r14 = &queryTime
 *   0x4feab  movq  0x98(%rdi),%rbx         ; rbx = it   = keyframes.begin
 *   0x4feb2  movq  0xa0(%rdi),%r12         ; r12 = end
 *   0x4feb9  movq  %r12,-0x58(%rbp)        ; spill end (reloaded @0x4ff2c)
 *   0x4febd  subq  %rbx,%r12               ; r12 = end - begin (BYTES)
 *   0x4fec0  je    0x4ff2c                 ; empty vector -> skip the search
 *   0x4fec2  sarq  $0x5,%r12               ; r12 = len = byteCount / 0x20
 *   -- loop head @0x4fec6 --
 *   0x4fec6  movq  %r12,%r13               ; r13 = len
 *   0x4fec9  shrq  %r13                    ; r13 = half = len >> 1 (UNSIGNED)
 *   0x4fecc  movq  %r13,%rax
 *   0x4fecf  shlq  $0x5,%rax               ; rax = half * 0x20
 *   0x4fed3  movq  0x10(%r14),%rcx         ; \
 *   0x4fed7  movq  %rcx,-0x40(%rbp)        ;  |
 *   0x4fedb  movups (%r14),%xmm0           ;  | copy the 24-byte queryTime into
 *   0x4fedf  movaps %xmm0,-0x50(%rbp)      ;  | the SECOND by-value CMTime slot
 *   0x4fee3  movq  -0x40(%rbp),%rcx        ;  | of the call frame (0x18(%rsp))
 *   0x4fee7  movq  %rcx,0x28(%rsp)         ;  |
 *   0x4feec  movaps -0x50(%rbp),%xmm0      ;  |
 *   0x4fef0  movups %xmm0,0x18(%rsp)       ; /
 *   0x4fef5  leaq  0x20(%rbx,%rax),%r15    ; r15 = &it[half + 1]
 *   0x4fefa  movq  -0x10(%r15),%rax        ; \  the pivot is r15 - 0x20, i.e.
 *   0x4fefe  movq  %rax,0x10(%rsp)         ;  | &it[half]; copy ITS 24-byte time
 *   0x4ff03  movups -0x20(%r15),%xmm0      ;  | into the FIRST by-value slot
 *   0x4ff08  movups %xmm0,(%rsp)           ; /  ((%rsp))
 *   0x4ff0c  callq _CMTimeCompare          ; eax = cmp(pivot->time, queryTime)
 *   0x4ff11  movq  %r13,%rcx               ; \
 *   0x4ff14  notq  %rcx                    ;  | rcx = len - half - 1
 *   0x4ff17  addq  %r12,%rcx               ; /  (~half + len)
 *   0x4ff1a  testl %eax,%eax               ; flags on the compare result
 *   0x4ff1c  cmovnsq %r13,%rcx             ; cmp >= 0 -> newLen = half
 *   0x4ff20  cmovsq  %r15,%rbx             ; cmp <  0 -> it = &it[half + 1]
 *   0x4ff24  movq  %rcx,%r12               ; len = newLen
 *   0x4ff27  testq %rcx,%rcx
 *   0x4ff2a  jne   0x4fec6                 ; loop while len != 0
 *   -- after the search --
 *   0x4ff2c  movq  -0x58(%rbp),%r15        ; r15 = end
 *   0x4ff30  cmpq  %r15,%rbx
 *   0x4ff33  je    0x4ff8c                 ; it == end -> return end
 *   0x4ff35  movl  -0x2c(%rbp),%eax        ; eax = mode
 *   0x4ff38  cmpl  $0x1,%eax
 *   0x4ff3b  je    0x4ff8f                 ; mode == 1 -> return it
 *   0x4ff3d  testl %eax,%eax
 *   0x4ff3f  jne   0x4ff8c                 ; mode != 0 -> return end
 *   0x4ff41  movq  0x10(%rbx),%rax         ; \
 *   0x4ff45  movq  %rax,-0x40(%rbp)        ;  |
 *   0x4ff49  movups (%rbx),%xmm0           ;  | arg1 = it->time
 *   0x4ff4c  movaps %xmm0,-0x50(%rbp)      ;  |
 *   0x4ff50  movq  0x10(%r14),%rax         ;  |
 *   0x4ff54  movq  %rax,-0x60(%rbp)        ;  |
 *   0x4ff58  movups (%r14),%xmm0           ;  | arg2 = queryTime
 *   0x4ff5c  movaps %xmm0,-0x70(%rbp)      ;  |
 *   0x4ff60  movq  -0x60(%rbp),%rax        ;  |
 *   0x4ff64  movq  %rax,0x28(%rsp)         ;  |
 *   0x4ff69  movaps -0x70(%rbp),%xmm0      ;  |
 *   0x4ff6d  movups %xmm0,0x18(%rsp)       ;  |
 *   0x4ff72  movq  -0x40(%rbp),%rax        ;  |
 *   0x4ff76  movq  %rax,0x10(%rsp)         ;  |
 *   0x4ff7b  movaps -0x50(%rbp),%xmm0      ;  |
 *   0x4ff7f  movups %xmm0,(%rsp)           ; /
 *   0x4ff83  callq _CMTimeCompare          ; eax = cmp(it->time, queryTime)
 *   0x4ff88  testl %eax,%eax
 *   0x4ff8a  je    0x4ff8f                 ; equal -> return it
 *   0x4ff8c  movq  %r15,%rbx               ; else   -> return end
 *   0x4ff8f  movq  %rbx,%rax               ; single return path
 *   0x4ff92..0x4ffa0  frame teardown ; retq
 *
 * Decode notes (PORTING_SPEC Rule 4 — AT&T `dst - src`):
 *   * `_CMTimeCompare(time1, time2)` returns the SIGN of `time1 - time2`, and
 *     both call sites put the KEYFRAME time in `time1` ((%rsp)) and the query in
 *     `time2` (0x18(%rsp)) — the 24-byte CMTime is a MEMORY-class argument, so
 *     the two structs are copied to the stack rather than passed in registers.
 *   * `testl %eax,%eax ; cmovns` tests the SIGN bit only: `cmovns` fires on
 *     `cmp >= 0` (pivot->time >= query) and `cmovs` on `cmp < 0`
 *     (pivot->time < query). That is `std::lower_bound`: on "pivot < query" the
 *     range moves to `pivot + 1` and shrinks by `half + 1`; otherwise the range
 *     is truncated to `half`. BOTH cmovs are evaluated every iteration — only
 *     one of them has an effect, because they test complementary conditions.
 *   * `shrq %r13` is an UNSIGNED halving of a non-negative element count, so
 *     `(len / 2) | 0` reproduces it exactly for every reachable `len`.
 *   * `notq %rcx ; addq %r12,%rcx` is `len + (-half - 1)` = `len - half - 1`,
 *     the standard libc++ "remaining after the pivot" update.
 *   * the loop is a DO-WHILE guarded by the `je 0x4ff2c` at 0x4fec0: an empty
 *     vector never enters it, and with `it == begin == end` the `cmpq` @0x4ff30
 *     then returns end.
 *   * mode is an `unsigned int` (`j` in the mangling) held in `%eax`, so it is
 *     read here through `>>> 0`; only 1 and 0 have behavior, everything else
 *     falls into the `jne 0x4ff8c` end return.
 *   * `%rdi`'s +0xb0 PCMutex is NOT touched by this body — the caller
 *     (`getPluginDataPtr` @0x4facf) takes the lock before calling. The port
 *     likewise does no locking (single JS thread).
 *
 * @param self      — the `OZChannelBlindData` instance (`%rdi`).
 * @param queryTime — the CMTime being searched for (`%rsi`, by reference).
 * @param mode      — `%edx`, an `unsigned int`: 1 = lower_bound, 0 = exact
 *                    match, anything else = always "not found".
 * @returns the index of the matching keyframe, or `self.keyframes.length` when
 *          the native function would have returned its end pointer.
 */
export function OZChannelBlindData_findKeyframe(
  self: OZChannelBlindDataState,
  queryTime: CMTime,
  mode: number,
): number {
  const keyframes = self.keyframes;

  // @0x4feab / @0x4feb2 / @0x4feb9: begin, end, and the spilled copy of end.
  // The array's length IS `(end - begin) >> 5` (@0x4febd..@0x4fec2) because the
  // stride is 0x20; `end` is modelled by the index `keyframes.length`.
  const end = keyframes.length;

  // rbx — the running iterator, as an index. Starts at begin (@0x4feab).
  let it = 0;
  // r12 — the remaining element count.
  let len = end;

  // @0x4fec0  je 0x4ff2c — an empty vector skips the search entirely.
  if (len !== 0) {
    for (;;) {
      // @0x4fec6-0x4fec9  movq %r12,%r13 ; shrq %r13 — half = len >> 1.
      const half = (len / 2) | 0;

      // @0x4fecf / @0x4fef5  shlq $0x5 ; leaq 0x20(%rbx,%rax),%r15 — r15 is
      // &it[half + 1]; the compared pivot is the element BELOW it (the two
      // `-0x10(%r15)` / `-0x20(%r15)` loads @0x4fefa/@0x4ff03).
      const pivot = it + half;

      // @0x4fed3-0x4ff0c: both 24-byte CMTimes are copied into the call frame
      // (pivot->time first, queryTime second) and `_CMTimeCompare` is called.
      const cmp = CMTimeCompare(keyframes[pivot].time, queryTime);

      // @0x4ff11-0x4ff17  movq %r13,%rcx ; notq %rcx ; addq %r12,%rcx.
      const remainingAfterPivot = len - half - 1;

      // @0x4ff1a-0x4ff20  testl %eax,%eax ; cmovnsq %r13,%rcx ; cmovsq %r15,%rbx.
      // Both conditional moves are evaluated; they select on the SIGN of cmp.
      if (cmp < 0) {
        // pivot->time < queryTime — take the upper half.
        it = pivot + 1;
        len = remainingAfterPivot;
      } else {
        // pivot->time >= queryTime — keep the lower half.
        len = half;
      }

      // @0x4ff27-0x4ff2a  testq %rcx,%rcx ; jne 0x4fec6.
      if (len === 0) break;
    }
  }

  // @0x4ff2c-0x4ff33  movq -0x58(%rbp),%r15 ; cmpq %r15,%rbx ; je 0x4ff8c.
  if (it === end) {
    return end;
  }

  // @0x4ff35-0x4ff3b  movl -0x2c(%rbp),%eax ; cmpl $0x1,%eax ; je 0x4ff8f.
  const modeU32 = mode >>> 0;
  if (modeU32 === 1) {
    return it;
  }

  // @0x4ff3d-0x4ff3f  testl %eax,%eax ; jne 0x4ff8c.
  if (modeU32 !== 0) {
    return end;
  }

  // @0x4ff41-0x4ff83: rebuild both by-value CMTimes (it->time, queryTime) and
  // compare them exactly.
  // @0x4ff88-0x4ff8a  testl %eax,%eax ; je 0x4ff8f — equal returns the iterator.
  if (CMTimeCompare(keyframes[it].time, queryTime) === 0) {
    return it;
  }

  // @0x4ff8c  movq %r15,%rbx — every other path returns end.
  return end;
}

/**
 * `OZChannelBlindData::hasKeypoints(unsigned int) const`
 *   — @ProChannel 0x505ce
 *   — __ZNK18OZChannelBlindData12hasKeypointsEj
 *
 * Returns whether the keyframe vector is NON-EMPTY. The `unsigned int`
 * parameter is DEAD — `%esi` is never read by the body.
 *
 * Full transcription — every instruction, in order (9-line disasm at
 * raw-port/re/disasm/ProChannel.__ZNK18OZChannelBlindData12hasKeypointsEj.s):
 *
 *   0x505ce  pushq %rbp                 ; frame setup (no TS counterpart)
 *   0x505cf  movq  %rsp,%rbp            ; frame setup (no TS counterpart)
 *   0x505d2  movq  0xa0(%rdi),%rax      ; rax = keyframes.end
 *   0x505d9  cmpq  0x98(%rdi),%rax      ; flags on (end - begin)
 *   0x505e0  setne %al                  ; return (end != begin)
 *   0x505e3  popq  %rbp                 ; frame teardown (no TS counterpart)
 *   0x505e4  retq
 *   0x505e5  nop                        ; alignment padding, not executed
 *
 * Decode notes:
 *   * the same +0x98 / +0xa0 begin/end pair `findKeyframe` walks (see the file
 *     header's layout section), compared for INEQUALITY — a pointer compare, so
 *     the answer is "the vector holds at least one element", i.e.
 *     `keyframes.length !== 0`. No division by the 0x20 stride is needed or
 *     performed.
 *   * `%esi` (the `unsigned int` argument) is never touched: no instruction
 *     between the prologue and the `retq` reads it. Whatever the parameter
 *     means to callers — the sibling `hasKeypointAt(CMTime const&, unsigned)`
 *     @0x50602 takes the same trailing `unsigned` — this method ignores it, and
 *     the port ignores it identically rather than inventing a filter the
 *     machine does not apply.
 *   * the immediately following sibling `hasMoreThanOneKeypoint()` @0x505e6 is
 *     the same load pair with `subq 0x98(%rdi),%rax ; cmpq $0x21,%rax ; setae`
 *     (i.e. byteCount >= 0x21, one full 0x20 element plus one byte — "two or
 *     more elements"): independent confirmation of both the field offsets and
 *     the 0x20 stride. It is a SEPARATE ledger unit and is NOT ported here.
 *
 * Zero callees: no in-scope call, no extern, no indirect or virtual dispatch
 * (`depgraph.py deps` lists nothing).
 *
 * @param self   — the `OZChannelBlindData` instance (`%rdi`).
 * @param _unused — `%esi`, the dead `unsigned int` parameter.
 * @returns true iff the keyframe vector is non-empty.
 */
export function OZChannelBlindData_hasKeypoints(
  self: OZChannelBlindDataState,
  _unused: number,
): boolean {
  // @0x505d2 / @0x505d9 / @0x505e0 — movq end ; cmpq begin ; setne.
  // end != begin is exactly "the vector is not empty".
  return self.keyframes.length !== 0;
}
