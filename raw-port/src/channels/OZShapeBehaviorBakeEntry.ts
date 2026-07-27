// OZShapeBehaviorBakeEntry.ts — one bake-cache entry for a shape behavior: stores the time range
// it was baked over, and six equal-length double[] arrays of pre-computed per-sample values.
// Transcribed from FCP Ozone framework (Final Cut Pro.app/.../Ozone). Only the ctor and dtor
// are exported by the binary; the array field semantics (which channel each array holds) are
// not observable from these two functions — the six pointers at +0x38..+0x60 are allocated
// identically as untyped double[N] blocks, matching what the disasm shows.
//
// DECODE: raw-port/re/disasm/OZShapeBehaviorBakeEntry.OZShapeBehaviorBakeEntry.s
//         raw-port/re/disasm/OZShapeBehaviorBakeEntry.~OZShapeBehaviorBakeEntry.s
//
// Struct layout (recovered from ctor stores at +0x00..+0x60 and dtor deletes at +0x38..+0x60):
//   +0x00  count as double (cvtsi2sd of the int ctor arg, %rbx = this)   — 8 bytes
//   +0x08  range.start.value      \                                       \
//   +0x10  range.start.timescale   \  first CMTime (24 bytes)              \
//   +0x14  range.start.flags        \                                       \
//   +0x18  range.start.epoch       /                                       PCTimeRange = 48B
//   +0x20  range.duration.value    \                                       (matches sizeof)
//   +0x28  range.duration.timescale \ second CMTime (24 bytes)              /
//   +0x2c  range.duration.flags    /                                       /
//   +0x30  range.duration.epoch   /                                       /
//   +0x38  array0 : double*  (owned, `new double[N]`; deleted with delete[])
//   +0x40  array1 : double*  (owned)
//   +0x48  array2 : double*  (owned)
//   +0x50  array3 : double*  (owned)
//   +0x58  array4 : double*  (owned)
//   +0x60  array5 : double*  (owned)
// Total sizeof = 0x68 (104 bytes).
//
// Frontier callee: __ZdvRK6CMTimeS1_  (CoreMedia `operator/(CMTime const&, CMTime const&)` — a
// dyld-shared-cache symbol; not in any FCP framework binary). Its ratio semantics are visible only
// through the immediate `CMTimeGetSeconds` on the result: (duration/step).seconds — but we can't
// prove that equals `CMTimeGetSeconds(duration) / CMTimeGetSeconds(step)` bit-for-bit because the
// intermediate CMTime's timescale is chosen by the CoreMedia implementation. Modelled as a
// throwing stub `CMTime_operator_div_ratio_seconds` so a caller sees the frontier.

import { type CMTime, CMTimeGetSeconds } from "../infra/CMTime";
import type { PCTimeRange } from "../infra/PCTimeRange";

/**
 * CMTime operator/(CMTime const&, CMTime const&) — CoreMedia's ratio-of-two-times operator.
 * Symbol: __ZdvRK6CMTimeS1_ (mangled "operator/(CMTime const&, CMTime const&)"). Not present in
 * any FCP framework binary — resolved from the dyld shared cache at link time. Its exact
 * timescale-selection algorithm is un-decoded here. Returns a CMTime whose (value/timescale)
 * equals a/b as a real number, but the specific representation is opaque without disassembly.
 *
 * FCP calls it here ONLY to immediately pass the result to CMTimeGetSeconds — so we surface a
 * throwing stub that documents the decode-boundary, rather than fitting a plausible-but-unverified
 * implementation.
 *
 * @frontier __ZdvRK6CMTimeS1_  (CoreMedia dyld shared cache — undecoded)
 */
export function CMTime_operator_div(_a: CMTime, _b: CMTime): CMTime {
  throw new Error(
    "CMTime operator/(CMTime const&, CMTime const&) [__ZdvRK6CMTimeS1_] is a dyld-shared-cache " +
    "symbol not present in any FCP framework binary; its timescale-selection algorithm is not " +
    "yet decoded. See raw-port/re/disasm/OZShapeBehaviorBakeEntry.OZShapeBehaviorBakeEntry.s @0x3e4539.",
  );
}

/**
 * OZShapeBehaviorBakeEntry — a baked cache entry: `count` samples over a PCTimeRange, storing
 * six parallel double[count] channel-value arrays.
 */
export class OZShapeBehaviorBakeEntry {
  /** +0x00 — count stored as double (from `cvtsi2sd int` at 0x3e44f1). */
  count: number = 0;
  /** +0x08 .. +0x37 — the range this entry was baked over. */
  range: PCTimeRange = {
    start:    { value: 0n, timescale: 1, flags: 1, epoch: 0n },
    duration: { value: 0n, timescale: 1, flags: 1, epoch: 0n },
  };
  /** +0x38 — first per-sample double array (`new double[count]`). */
  array0: Float64Array | null = null;
  /** +0x40 */
  array1: Float64Array | null = null;
  /** +0x48 */
  array2: Float64Array | null = null;
  /** +0x50 */
  array3: Float64Array | null = null;
  /** +0x58 */
  array4: Float64Array | null = null;
  /** +0x60 */
  array5: Float64Array | null = null;

  /**
   * OZShapeBehaviorBakeEntry::OZShapeBehaviorBakeEntry(int, PCTimeRange&, CMTime)
   * @Ozone 0x00000000003e44b0  (__ZN24OZShapeBehaviorBakeEntryC2EiR11PCTimeRange6CMTime)
   *
   * DECODE (raw-port/re/disasm/OZShapeBehaviorBakeEntry.OZShapeBehaviorBakeEntry.s):
   *   0x3e44bb-0x3e44c5  save args: rbx=this (rdi), rax=&PCTimeRange (rdx), rdx=&stack CMTime
   *                      (rbp+0x10 — arg3 passed by value), rcx=&this->[+0x08]
   *   0x3e44c9-0x3e44ea  zero-init both CMTimes at +0x08 and +0x20 from `kCMTimeZero`
   *                      (movq _kCMTimeZero@got, %rdi ; propagate value+ts+flags via xmm0 and
   *                       epoch via r8 = *(kCMTimeZero+0x10) = 0). This is the standard
   *                      "construct in-place from kCMTimeZero" pattern seen in every PCTimeRange
   *                      default init in Ozone.
   *   0x3e44ee-0x3e44f5  count = (double)int_arg1  (cvtsi2sd %esi,%xmm0 ; movsd %xmm0,(%rbx))
   *   0x3e44f9-0x3e44fc  cmpq %rax,%rcx ; je 0x3e4521 — self-assignment guard: if the caller
   *                      handed us a &PCTimeRange that IS &this->range (i.e. constructing from
   *                      an alias of this member), skip the copy.
   *   0x3e44fe-0x3e451d  otherwise copy the arg range:
   *                        this.range.start    = arg.start     (via 0x10(%rax)→0x10(%rcx) epoch,
   *                                                              (%rax)→(%rcx) value+ts+flags)
   *                        this.range.duration = arg.duration  (0x28(%rax)→0x10(%rsi),
   *                                                              0x18(%rax)→(%rsi))
   *                      (rsi is preloaded to &this->[+0x20] at 0x3e44fe.)
   *   0x3e4521-0x452d    copy arg.duration onto stack scratch at rbp-0x30/rbp-0x28 (as the
   *                      first arg to operator/): epoch first (movq 0x28(%rax),%rcx →
   *                      -0x20(%rbp)), then value+ts+flags (movups 0x18(%rax),%xmm0 →
   *                      -0x30(%rbp)).
   *   0x3e4531-0x453e    rdi=sret buf (rbp-0x48), rsi=&stack duration (rbp-0x30), rdx=&CMTime
   *                      step arg3 (rbp+0x10 — set at 0x3e44c1 and not clobbered). Call
   *                      operator/(duration, step). Result at [-0x48..-0x38].
   *   0x3e4542-0x455b    spill result onto rsp (value+ts+flags at (%rsp) via xmm0, epoch at
   *                      0x10(%rsp)); call CMTimeGetSeconds; cvttsd2si → int64 → r14d.
   *   0x3e455e           r14 = r14d * 8 (shlq $3) — byte count for `new double[N]` (N*8).
   *   0x3e4562-0x459a    six identical sequences: `mov %r14,%rdi ; call operator new[]` then
   *                      store returned pointer at this->[+0x38 / +0x40 / +0x48 / +0x50 / +0x58
   *                      / +0x60]. Each call is `__Znam` (operator new[]) — raw byte alloc,
   *                      contents uninitialized (Float64Array new-allocation zero-fills; the
   *                      ProCore allocator does NOT; the ctor makes no effort to zero either).
   */
  constructor(count: number, range: PCTimeRange, step: CMTime) {
    // 0x3e44ee — count as double.
    this.count = count;

    // 0x3e44c9-0x3e44ea — initialize range.start/duration from kCMTimeZero (already done at
    // field-init above; the movups from kCMTimeZero here is functionally the same zero-init).

    // 0x3e44f9 — self-assign guard: if the caller passed our own range as `range`, skip copy.
    // In TS we can't compare identities of a plain object member to an arg the way C++ compares
    // `&arg == &this->range`. Mirror the intent: always copy fields (safe — no aliasing possible
    // in TS field-of-object-init context; the JS engine never hands you `&this->range` before
    // the ctor body runs).
    // 0x3e44fe-0x451d — copy start and duration from `range` argument (by value).
    this.range = {
      start: {
        value:     range.start.value,
        timescale: range.start.timescale,
        flags:     range.start.flags,
        epoch:     range.start.epoch,
      },
      duration: {
        value:     range.duration.value,
        timescale: range.duration.timescale,
        flags:     range.duration.flags,
        epoch:     range.duration.epoch,
      },
    };

    // 0x3e4531-0x453e — ratioCM = operator/(range.duration, step)
    // Frontier: __ZdvRK6CMTimeS1_ (see CMTime_operator_div stub above). We cannot fit an
    // implementation without decoding the CoreMedia symbol, so this constructor cannot fully
    // execute the sample-count computation without touching the frontier. Surface it as-is:
    const ratioCM: CMTime = CMTime_operator_div(this.range.duration, step);
    // 0x3e4551-0x455b — seconds = CMTimeGetSeconds(ratioCM); N = (int64)seconds (cvttsd2si).
    const seconds = CMTimeGetSeconds(ratioCM);
    const N = Math.trunc(seconds) | 0; // cvttsd2si truncates toward zero

    // 0x3e455e-0x459a — six identical `new double[N]` allocations, stored at +0x38..+0x60.
    // ProCore uses `operator new[]` (__Znam) which returns uninitialized memory; we use
    // Float64Array which zero-initializes — a stricter guarantee, safe to substitute since C++
    // reading un-inited memory here would be UB and FCP always fills these before reading.
    this.array0 = new Float64Array(N);
    this.array1 = new Float64Array(N);
    this.array2 = new Float64Array(N);
    this.array3 = new Float64Array(N);
    this.array4 = new Float64Array(N);
    this.array5 = new Float64Array(N);
  }

  /**
   * OZShapeBehaviorBakeEntry::~OZShapeBehaviorBakeEntry()
   * @Ozone 0x00000000003e45c0  (__ZN24OZShapeBehaviorBakeEntryD2Ev)
   *
   * DECODE (raw-port/re/disasm/OZShapeBehaviorBakeEntry.~OZShapeBehaviorBakeEntry.s):
   *   Six identical pairs, one per array pointer at +0x38, +0x40, +0x48, +0x50, +0x58, +0x60:
   *     - load pointer; testq for NULL; if non-NULL call __ZdaPv (operator delete[]);
   *     - store 0 back into the field.
   *   No delete of `range` (POD CMTime pair), no delete of `count`. No virtual dtor call
   *   (no vtable at +0x00 — that slot is the count double). Total effect: free all six arrays,
   *   NULL out the pointers.
   */
  destroy(): void {
    // 0x3e45c9-0x45df — array0
    if (this.array0 !== null) {
      // callq __ZdaPv (operator delete[]) — no-op in TS/GC world
    }
    this.array0 = null;
    // 0x3e45df-0x45ed — array1
    if (this.array1 !== null) { /* delete[] */ }
    this.array1 = null;
    // 0x3e45f5-0x4603 — array2
    if (this.array2 !== null) { /* delete[] */ }
    this.array2 = null;
    // 0x3e460b-0x4619 — array3
    if (this.array3 !== null) { /* delete[] */ }
    this.array3 = null;
    // 0x3e4621-0x462f — array4
    if (this.array4 !== null) { /* delete[] */ }
    this.array4 = null;
    // 0x3e4637-0x4645 — array5
    if (this.array5 !== null) { /* delete[] */ }
    this.array5 = null;
  }
}
