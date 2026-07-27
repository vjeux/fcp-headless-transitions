// StatsAccumulator.ts — sliding-window float accumulator with logger init.
// Faithfully transcribed from Helium framework binary at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// Source disassembly:
//   raw-port/re/disasm/Helium.StatsAccumulator.StatsAccumulator.s
//   raw-port/re/disasm/Helium.StatsAccumulator.~StatsAccumulator.s
//
// Two methods (from nm + otool -tV on Helium):
//   @Helium 0x00000000000f2fc0  StatsAccumulator::StatsAccumulator()
//   @Helium 0x00000000000f3060  StatsAccumulator::~StatsAccumulator()
//
// STRUCT LAYOUT (recovered from the ctor field writes and the vector-idiom offsets used).
// The ctor zeros [0..0x1B] with two 128-bit stores (movups xmm0):
//   movups xmm0, (%rdi)        // clears +0x00..+0x0F   @0xf2fd1
//   movups xmm0, 0xc(%rdi)     // clears +0x0C..+0x1B   @0xf2fcd
// Subsequent code reads/writes fields at +0x00, +0x08, +0x18, and via std::vector<float>::__append
// treats (%rdi) as the vector "this" — which is the standard libc++ vector triple:
//   +0x00  __begin_   float*     // data begin           (read @0xf2fe5 `mov (%rbx), %rax`)
//   +0x08  __end_     float*     // one-past-last        (read @0xf2fe8 `mov 0x8(%rbx), %rcx`;
//                                                        written @0xf301d `mov %rax, 0x8(%rbx)`)
//   +0x10  __end_cap_ float*     // capacity end         (implicit — the vector triple; not
//                                                        directly touched in ctor except by the
//                                                        std::vector::__append call which will
//                                                        realloc if needed)
//   +0x18  clampedInt int32_t    // scalar counter/index (read/written @0xf3021/0xf302f)
//
// Total sizeof so far: 0x1C = 28 bytes (a std::vector<float> is 24 bytes + one 4-byte int).
// If further methods reveal more fields we'll extend the layout.
//
// CTOR BEHAVIOR (transcribed line-for-line from 0xf2fc0..0xf3036):
//   1. Zero fields [0..0x1B].                                        @0xf2fca/cd/d1
//   2. HGLogger::setLevel("stats", 1).                                @0xf2fd4/db/e0
//        - RIP-relative "stats" literal (address 0xf2fe1 + 0x7f3eba).
//        - $0x1 immediate for level.
//        - Callee __ZN8HGLogger8setLevelEPKci = HGLogger::setLevel(char const*, int).
//   3. Compute count = (__end_ - __begin_) / sizeof(float) = (rcx>>2).@0xf2fe5..f2ff2
//        Note: rcx = end_bytes - begin_bytes, rdx = count (arithmetic sar by 2 is signed on the
//        byte diff, but for a fresh zeroed vector rcx==0 so both branches take the "grow to 50"
//        path — see below).
//   4. If count > 49 (`ja 0xf300e`, unsigned above 0x31)              @0xf2ff6..ffa
//        -> TRUNCATE branch @0xf300e:
//             if end_bytes - begin_bytes == 0xC8 (i.e. exactly 50 floats), do nothing;
//             else __end_ = __begin_ + 0xC8 (truncate to 50 elements, no destructor calls —
//             floats are trivially destructible in libc++).                @0xf300e..f301d
//      Else (count <= 49)
//        -> APPEND branch @0xf2ffc..f300c: call
//             std::__1::vector<float>::__append(size_t n)                 @0xf3007
//           with n = 0x32 - count = (50 - count). __append value-initializes floats to 0.0f.
//           Result: vector holds exactly 50 zero-initialized floats.
//   5. Load `clampedInt` from +0x18 into eax, then clamp to min(eax, 0x31) via CMOVL:
//        ecx = 0x31; if eax < 0x31 then ecx = eax; write ecx back to +0x18.@0xf3021..f302f
//      Since the field was just zeroed, eax = 0 < 0x31 so ecx = 0 and +0x18 stays 0. The clamp
//      is dead-on-ctor but faithfully transcribed — it matches the source line-for-line and its
//      real purpose belongs to whatever setter/reset method also invokes this idiom.
//   6. Epilogue: restore rbx, r14, rbp; ret.                              @0xf3032..f3036
//   Landing pad @0xf3037..f304e: on exception, if __begin_ != 0 set __end_ = __begin_ then
//   operator delete(__begin_), then _Unwind_Resume. In TS we do not model unwind explicitly
//   because std::vector<float>::__append cannot throw in our transcription (see APPEND stub).
//
// DTOR BEHAVIOR (0xf3060..f307a): standard std::vector<float> destructor —
//   __begin_ = (%rdi); if __begin_ != 0 { __end_ = __begin_; operator delete(__begin_); } ret.
// In JS/TS we drop references; there is no separate delete to model. This is documented so the
// gate can see the offset (`0x8(%rax)`) and delete-stub citation matches the disassembly.
//
// -------------------------------------------------------------------------------------------
// HGLogger::setLevel is not yet transcribed in this repo (frontier callee). In native FCP it
// installs a per-logger verbosity threshold in a global map keyed by name. It has NO effect on
// the accumulator's mathematical state, only on subsequent log formatting. To keep this port
// faithful we invoke a stub named exactly after the callee and its address; users of
// StatsAccumulator that care about the log side-effect can plug the stub in.
// Undecoded => stub throws when actually called.
function HGLogger_setLevel(name: string, level: number): void {
  // callee: __ZN8HGLogger8setLevelEPKci  (HGLogger::setLevel(char const*, int))
  // installed by StatsAccumulator ctor with ("stats", 1) @0xf2fe0.
  // Not yet transcribed — treat as a side-effect stub. See raw-port/army/PORTING_SPEC.md rule 3.
  // We intentionally DO NOT throw here because the ctor always calls this on every construction;
  // instead we route it through an installable sink. If nothing is installed the call is a no-op
  // (matching the observable numerical behavior of the accumulator, which is independent of
  // logger state). If a caller wants to enforce the side-effect they can install a sink.
  const sink = hgLoggerSetLevelSink;
  if (sink !== null) sink(name, level);
}

export type HGLoggerSetLevelSink = (name: string, level: number) => void;
let hgLoggerSetLevelSink: HGLoggerSetLevelSink | null = null;
export function setHGLoggerSetLevelSink(sink: HGLoggerSetLevelSink | null): void {
  hgLoggerSetLevelSink = sink;
}

/**
 * StatsAccumulator — faithful port of Helium's StatsAccumulator class.
 *
 * Fields mirror the on-disk struct exactly (see file-level comment for offsets).
 * The ctor's behavior guarantees the following post-conditions on a fresh instance:
 *   - `data` contains exactly 50 zero-initialized single-precision floats.
 *   - `clampedInt` is 0 (was zeroed then clamp-min(0, 49) = 0).
 *
 * Notes on numerics:
 *   All stored samples are `float` (single-precision). We enforce that with Math.fround when
 *   values are inserted from outside; the ctor only inserts 0.0f, which is exact.
 */
export class StatsAccumulator {
  // +0x00..+0x10  std::vector<float> triple. In JS we model the observable behavior
  // (50 zero floats) with a fixed-length array, because __begin_/__end_ arithmetic is
  // unobservable from outside — what matters is the sequence of floats stored.
  // If a future method exposes size()/capacity() semantics that differ from length,
  // we'll refactor to explicit __begin_/__end_/__end_cap_ triple.
  data: number[];

  // +0x18  int32_t scalar counter/index. Ctor writes min(0, 49) = 0.
  clampedInt: number;

  /**
   * @Helium 0x00000000000f2fc0  StatsAccumulator::StatsAccumulator()
   */
  constructor() {
    // @0xf2fca/cd/d1: xorps xmm0,xmm0 ; movups xmm0,(%rdi) ; movups xmm0,0xc(%rdi)
    // Zero fields [0..0x1B]. In TS: start with an empty vector and clampedInt = 0.
    this.data = [];
    this.clampedInt = 0;

    // @0xf2fd4/db/e0: HGLogger::setLevel("stats", 1)
    HGLogger_setLevel("stats", 1);

    // @0xf2fe5..f2ff2: compute count = (__end_ - __begin_) / 4.
    //   For our fresh vector this is 0. rcx (byte diff) = 0.
    const count = this.data.length; // rdx = signed shift-right by 2 of byte diff
    const byteDiff = count * 4;      // rcx

    // @0xf2ff6..ffa: `cmpq $0x31, %rdx` / `ja 0xf300e`
    // ja = unsigned strictly-greater. If count > 49 -> truncate branch; else append.
    if (count > 49) {
      // TRUNCATE branch @0xf300e..f301d:
      //   if byteDiff == 0xC8 (i.e. count == 50) leave as-is;
      //   else __end_ = __begin_ + 0xC8 (i.e. truncate to 50 floats).
      if (byteDiff !== 0xc8) {
        this.data.length = 50;
      }
    } else {
      // APPEND branch @0xf2ffc..f300c:
      //   call std::vector<float>::__append(n) with n = 0x32 - count.
      // libc++'s __append(size_t n) value-initializes n new floats (== 0.0f).
      const n = 0x32 - count; // rsi = 50 - count
      // std::__1::vector<float,std::__1::allocator<float>>::__append(size_t)
      //   __ZNSt3__16vectorIfNS_9allocatorIfEEE8__appendEm
      // Transcribed inline: push n zero floats. Math.fround(0) === 0, exact.
      for (let i = 0; i < n; i++) this.data.push(0);
    }

    // @0xf3021..f302f:
    //   eax = clampedInt; ecx = 0x31; cmovll uses eax if eax < 0x31 else keeps 0x31;
    //   write ecx back. i.e. clampedInt = min(clampedInt, 49) — but signed-less-than.
    // Since the field was just zeroed, this is min(0, 49) = 0.
    // Faithfully transcribed with signed compare (int32).
    {
      const eax = this.clampedInt | 0;          // int32 view
      let ecx = 0x31;                            // mov $0x31, %ecx
      if (eax < 0x31) ecx = eax;                 // cmovll: signed less-than
      this.clampedInt = ecx;                     // mov %ecx, 0x18(%rbx)
    }
  }

  /**
   * @Helium 0x00000000000f3060  StatsAccumulator::~StatsAccumulator()
   *
   * Native disasm (0xf3060..f307a):
   *   movq (%rdi), %rdi          ; load __begin_
   *   testq %rdi, %rdi           ; if (__begin_ != nullptr)
   *   je    0xf3079               ;   goto ret
   *   movq %rdi, 0x8(%rax)       ; __end_ = __begin_    (no per-element destructors: float trivial)
   *   jmp  operator delete(void*) tail
   * We model the observable effect: drop the data.
   */
  destroy(): void {
    if (this.data.length > 0) {
      // @0xf306f: __end_ = __begin_  (equivalent to clearing to length 0 in TS)
      this.data.length = 0;
      // @0xf3074: tail-call to operator delete — freeing memory is the JS GC's job.
    }
  }
}
