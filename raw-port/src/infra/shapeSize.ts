// shapeSize.ts — ProCore internal-linkage free helper
//   shapeSize<std::vector<PCVector2<double>>>(std::vector<PCVector2<double>> const&)
//   @ProCore 0x6d81f  (mangled __ZL9shapeSize... — the `ZL` prefix is Itanium ABI for a
//   translation-unit-private / `static` inline function template.)
//
// Transcribed from the disassembly at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore
// See raw-port/re/disasm and grep on /tmp/ProCore_symmap.tsv.
//
// ROLE. Computes the axis-aligned bounding-box SIZE (width, height) of a polygonal shape given
// as a std::vector of 2-D double vertices. Concretely: for each component (x,y) it takes the
// running min and running max across all vertices, then returns (max - min) as a PCVector2.
// The routine is written with a pair of SSE2 packed-double lanes so the two components are
// scanned in a single tight loop — one iteration per vertex, no scalar shuffles.
//
// EMPTY-INPUT BEHAVIOUR. If `vec.begin() == vec.end()` the loop is skipped and the return value
// is loaded verbatim from a __TEXT.__const literal at ProCore 0x125a30 == `(-2e10, -2e10)`
// (the canonical "obviously invalid extent" sentinel used elsewhere in ProCore's shape code —
// note the value is NOT (0,0); the callers are expected to detect the sentinel or to have
// early-rejected empty shapes). See the movapd 0xb81ba(%rip), %xmm0 at 0x6d86e.
//
// SIMD ACCUMULATOR SEED. When the loop runs, the min-accumulator is seeded with (+1e10,+1e10)
// (movapd 0xb8202(%rip) @0x6d836 -> ProCore 0x125a40) and the max-accumulator with (-1e10,-1e10)
// (movapd 0xb820a(%rip) @0x6d83e -> ProCore 0x125a50). These are large-enough sentinels that any
// finite input beats them on the first iteration; the disasm's element-order (xmm2=prev-min,
// xmm3=prev-max saved BEFORE overwrite of xmm0/xmm1) makes the first iter's minpd/maxpd
// definitionally return the element itself, so the sentinels never survive into the answer for
// non-empty input.
//
// NUMERIC WIDTH. All lanes are double-precision (movapd/movupd + minpd/maxpd/subpd — all "pd"
// packed-double); no `f` (single) instructions occur. No Math.fround() wrapping needed.
//
// STRUCT LAYOUT ASSUMPTIONS.
//   PCVector2<double>       = { x: f64 @+0x00, y: f64 @+0x08 } — 16 bytes, from movupd (%rcx)
//                             loading one element at a time and the sarq $4 that divides the
//                             byte-size by 16 to get the element count.
//   std::vector<T,alloc>    = { data_begin: *T @+0x00, data_end: *T @+0x08, cap_end: *T @+0x10 }
//                             — the libc++ layout: (rcx)=begin, 0x8(rsi)=end, and the byte-count
//                             is `end - begin`.

/** PCVector2<double> as an ordinary {x,y} pair of IEEE-754 doubles. */
export interface PCVector2d {
  x: number;
  y: number;
}

/**
 * shapeSize @ProCore 0x6d81f.
 *
 * Faithful transcription of the disasm:
 *
 *   0x6d81f  movq %rdi, %rax                     ; rax = &retval (hidden sret pointer)
 *   0x6d822  movq (%rsi), %rcx                   ; rcx = vec.data_begin
 *   0x6d825  movq 0x8(%rsi), %rdx                ; rdx = vec.data_end
 *   0x6d829  subq %rcx, %rdx                     ; rdx = end - begin (byte size)
 *   0x6d82c  je   0x6d86e                        ; if empty -> load default & store
 *   0x6d82e  pushq %rbp; movq %rsp,%rbp
 *   0x6d832  sarq $0x4, %rdx                     ; rdx = element count (byteSize >> 4 == /16)
 *   0x6d836  movapd 0xb8202(%rip), %xmm1         ; xmm1 = (+1e10, +1e10)  [min accum seed]
 *   0x6d83e  movapd 0xb820a(%rip), %xmm0         ; xmm0 = (-1e10, -1e10)  [max accum seed]
 *   loop:
 *   0x6d846  movapd %xmm1, %xmm2                 ; xmm2 = prev min
 *   0x6d84a  movapd %xmm0, %xmm3                 ; xmm3 = prev max
 *   0x6d84e  movupd (%rcx), %xmm0                ; xmm0 = element (double x, double y)
 *   0x6d852  movapd %xmm0, %xmm1                 ; xmm1 = element (copy for min branch)
 *   0x6d856  minpd  %xmm2, %xmm1                 ; xmm1 = min(elem, prevMin)   AT&T: dst=xmm1
 *   0x6d85a  maxpd  %xmm3, %xmm0                 ; xmm0 = max(elem, prevMax)   AT&T: dst=xmm0
 *   0x6d85e  addq $0x10, %rcx                    ; ++vertex ptr
 *   0x6d862  decq %rdx; jne loop                 ; --count, continue while nonzero
 *   0x6d867  subpd %xmm1, %xmm0                  ; xmm0 = max - min           AT&T: dst=xmm0
 *   0x6d86b  popq %rbp; jmp 0x6d876
 *   empty:
 *   0x6d86e  movapd 0xb81ba(%rip), %xmm0         ; xmm0 = (-2e10, -2e10)  [empty sentinel]
 *   0x6d876  movupd %xmm0, (%rax)                ; *retval = xmm0
 *   0x6d87a  retq
 *
 * AT&T reminder: `minpd %xmm2, %xmm1` == `xmm1 = min(xmm1, xmm2)` (dst is the LEFT-hand op after
 * decode, xmm2 is src). Same for maxpd/subpd. Verified against the AT&T cheat-sheet in
 * ANTI_SHORTCUT.md rule 4.
 */
export function shapeSize(vec: ReadonlyArray<PCVector2d>): PCVector2d {
  const n = vec.length;
  if (n === 0) {
    // Empty-input sentinel from ProCore 0x125a30 — a movapd of two doubles, both == -2e10.
    // NOT (0,0). Preserved to match the binary bit-for-bit; callers relying on shapeSize as a
    // pre-computed bbox must handle the sentinel.
    return { x: -2e10, y: -2e10 };
  }
  // SIMD seeds from ProCore 0x125a40 / 0x125a50 (as decoded by resolve.py ripconst).
  let minX = 1e10;
  let minY = 1e10;
  let maxX = -1e10;
  let maxY = -1e10;
  for (let i = 0; i < n; i++) {
    // movupd (%rcx), %xmm0 — load the whole (x,y) element in one lane-pair.
    const v = vec[i];
    const ex = v.x;
    const ey = v.y;
    // minpd/maxpd operate lane-wise: lane 0 = x, lane 1 = y.
    if (ex < minX) minX = ex;
    if (ey < minY) minY = ey;
    if (ex > maxX) maxX = ex;
    if (ey > maxY) maxY = ey;
  }
  // subpd %xmm1, %xmm0  ->  xmm0 = max - min, per lane.
  return { x: maxX - minX, y: maxY - minY };
}
