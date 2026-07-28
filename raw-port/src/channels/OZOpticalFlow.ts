// raw-port/src/channels/OZOpticalFlow.ts
//
// FCP `OZOpticalFlow` (Ozone.framework). This is a namespace-style class that
// holds a small `JobID` POD plus a handful of free-function-style static utilities
// used by the optical-flow analysis pipeline. It has no ctor/dtor and no vtable —
// the ledger lists exactly seven exported entry points, all decoded below.
//
// Symbols (Ozone.framework, x86_64):
//   0x4e6880  OZOpticalFlow::count(RetimingMath::IntervalSet<unsigned int> const&)  [pure math]
//   0x4e9c00  OZOpticalFlow::operator==(JobID const&, JobID const&)                 [POD compare]
//   0x4e9c10  OZOpticalFlow::operator!=(JobID const&, JobID const&)                 [POD compare]
//   0x4ecae0  OZOpticalFlow::GetMotionVectorFileHash(OZFootage const*)              [throw-stub]
//   0x4ece00  OZOpticalFlow::GetMotionVectorFileExtension()                         [const "mv"]
//   0x4ece20  OZOpticalFlow::GetMotionVectorFileForClip(OZFootage const*, int)      [throw-stub]
//   0x4ed060  OZOpticalFlow::GetMotionVectorFileForClip(OZFootage const*)           [throw-stub]
//
// ── STRUCT LAYOUT: OZOpticalFlow::JobID ─────────────────────────────────────
// Recovered from operator==@0x4e9c00 and operator!=@0x4e9c10, both of which do
// exactly one 32-bit load from offset 0 of each argument and compare:
//
//     __ZN13OZOpticalFloweqERKNS_5JobIDES2_:
//       movl  (%rdi), %eax                 // load lhs.id  (u32 @ +0x00)
//       cmpl  (%rsi), %eax                 // compare rhs.id
//       sete  %al                          // return equal
//
// So JobID has one field:
//   +0x00 : id  : u32
// Total size: 4 bytes. (There is no observed alignment/padding write in either
// of the decoded operator bodies, and no ctor is exported — worker code
// constructs the value inline.)
//
// ── STRUCT LAYOUT: RetimingMath::IntervalSet<unsigned int> ──────────────────
// Recovered from count@0x4e6880 which walks it as a std::vector<Interval>:
//   +0x00 : begin  : Interval*  (vector's __begin_)
//   +0x08 : end    : Interval*  (vector's __end_)
// Each `Interval` is 8 bytes at [+0x00 : u32 lo][+0x04 : u32 hi]  — read
// straight from the loop body at 0x4e6940 (`addl 0x4(%rdx),%eax` +
// `subl (%rdx),%eax` + `addq $0x8,%rdx`), and confirmed by the mangled
// nested-type name `RetimingMath::IntervalSet<unsigned int>::Interval` that
// appears in the neighboring IntervalSet API symbols (doIntersection /
// extendOrAppend / doUnion / doDifference — all list an 8-byte `Interval` as
// the vector element type).
//
// The SIMD block at 0x4e68d0-0x4e6928 is the LLVM optimizer's auto-vectorized
// unrolled prologue of the same `sum += end - begin` reduction (4×2 lanes of
// paddd/psubd through xmm0/xmm1, then horizontal reduce via pshufd+paddd).
// Semantically it is the identical scalar loop, just batched. The tail at
// 0x4e6940 is exactly the scalar recurrence we transcribe below.

// undecoded external types — reference only, not imported (they don't exist yet).
// GetMotionVectorFile* need PCString/PCURL/PCHash128/PCHashWriteStream/OZFootage/
// OZPreferenceManager/(anonymous namespace)::GetBaseClipString plus a raft of
// ObjC-msgSend NSFileManager calls, NONE of which are yet transcribed. Per
// PORTING_SPEC Rule 3 those methods THROW citing their address rather than
// approximating anything.

// ── OZOpticalFlow::JobID ─────────────────────────────────────────────────────
export interface JobID {
  /** JobID.id — u32 at +0x00 (the only field, per operator==@0x4e9c00). */
  id: number;
}

/**
 * OZOpticalFlow::operator==(JobID const&, JobID const&) @Ozone 0x4e9c00.
 *
 * Faithful transcription:
 *   movl (%rdi), %eax   -> load a.id
 *   cmpl (%rsi), %eax   -> compare with b.id
 *   sete %al            -> return equal
 *
 * @param a  left-hand JobID
 * @param b  right-hand JobID
 * @returns  true iff a.id === b.id
 */
export function jobIDEquals(a: JobID, b: JobID): boolean {
  // 32-bit compare — mask both sides to u32 to match `movl` semantics.
  const ax = (a.id >>> 0);
  const bx = (b.id >>> 0);
  return ax === bx;
}

/**
 * OZOpticalFlow::operator!=(JobID const&, JobID const&) @Ozone 0x4e9c10.
 *
 * Faithful transcription (byte-for-byte identical to operator== except for
 * `setne` instead of `sete` at 0x4e9c18):
 *   movl (%rdi), %eax
 *   cmpl (%rsi), %eax
 *   setne %al
 *
 * @returns  true iff a.id !== b.id
 */
export function jobIDNotEquals(a: JobID, b: JobID): boolean {
  const ax = (a.id >>> 0);
  const bx = (b.id >>> 0);
  return ax !== bx;
}

// ── RetimingMath::IntervalSet<u32> — minimal shape needed by count() ────────
// The full IntervalSet class (insert/doUnion/doDifference/doIntersection/
// extendOrAppend) is a separate future port; this file only touches its
// vector<Interval> tail representation.
export interface OZOpticalFlow_IntervalU32 {
  /** Interval.lo — u32 at +0x00. Called `begin` by the neighboring symbols. */
  lo: number;
  /** Interval.hi — u32 at +0x04. Called `end`. */
  hi: number;
}
export interface OZOpticalFlow_IntervalSetU32 {
  /** Contiguous storage of Intervals — the C++ std::vector begin/end pair. */
  intervals: readonly OZOpticalFlow_IntervalU32[];
}

/**
 * OZOpticalFlow::count(RetimingMath::IntervalSet<unsigned int> const&)
 * @Ozone 0x4e6880.
 *
 * Returns Σ(interval.hi - interval.lo) as a u32 (wrapping arithmetic — the
 * loop body is 32-bit `addl`/`subl` on %eax, so overflow is discarded).
 *
 * The disassembly has two intertwined blocks:
 *
 *   • 0x4e6880-0x4e68a5   entry / small-set fast-path branch. Loads
 *       %r8 = *(rdi+0x0) (vector.begin), %rcx = *(rdi+0x8) (vector.end),
 *       returns 0 immediately at 0x4e68aa if begin == end.
 *
 *   • 0x4e68ad-0x4e6928   vectorized bulk reduction. Not semantically
 *       distinct from the tail loop — the compiler unrolled 8 Intervals per
 *       iteration into paddd/psubd across xmm0 and xmm1 and then horizontally
 *       folds them at 0x4e691a-0x4e692c. The invariant is:
 *         accumulator += Σ over 8 Intervals ( iv.hi - iv.lo )
 *       Skipped in TS because JavaScript numbers don't have paddd; the
 *       scalar loop below computes the same value byte-for-byte in u32 math.
 *
 *   • 0x4e6940-0x4e694c   scalar tail loop (also the small-set path):
 *       loop { %eax += *(rdx+4); %eax -= *(rdx); rdx += 8; if (rdx != rcx) continue; }
 *       i.e. `sum += iv.hi - iv.lo` per interval, u32 wrap on `eax`.
 *
 * @param set  IntervalSet<u32>
 * @returns    u32 total = Σ(hi - lo)
 */
export function OZOpticalFlow_count(set: OZOpticalFlow_IntervalSetU32): number {
  // Fast-path 0x4e688a (begin==end → xor eax,eax; ret).
  const ivs = set.intervals;
  const n = ivs.length | 0;
  if (n === 0) return 0;

  // Scalar loop @0x4e6940 (identical value to the vectorized block).
  // `eax` is 32-bit — every `addl`/`subl` truncates to u32.
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const iv = ivs[i];
    // `addl 0x4(%rdx), %eax`  — add iv.hi (offset +0x04).
    // `subl (%rdx),   %eax`   — subtract iv.lo (offset +0x00).
    sum = (sum + ((iv.hi >>> 0) - (iv.lo >>> 0))) >>> 0;
  }
  return sum >>> 0;
}

// ── File-hash / cache-path helpers — undecoded external subsystems ──────────

/**
 * OZOpticalFlow::GetMotionVectorFileHash(OZFootage const*) @Ozone 0x4ecae0.
 *
 * Builds a 128-bit hash identifying the on-disk motion-vector cache for the
 * given OZFootage. The body pulls a base-clip string via
 *   (anonymous namespace)::GetBaseClipString(PCString const&)  @Ozone (undecoded)
 * then streams:
 *   - the base clip string
 *   - four u32 words of the footage's per-clip optical-flow hash
 *       (via OZFootage::getHashForOpticalFlow(PCHash128&) @Ozone — undecoded)
 *   - a versioning UUID built by _CFUUIDGetConstantUUIDWithBytes with the
 *     literal bytes:
 *         {0x00, 0xFA, 0x24, 0xC3, 0x71, 0xE0,
 *          0xD5, 0x89, 0x5E, 0xFF, 0x80, 0xBF,
 *          0x10, 0xA4, 0x47, 0x4C, 0x34}
 *       (read directly from the movl-to-stack sequence 0x4ecbb9-0x4ecc09)
 * through a `PCHashWriteStream` and returns the resulting `PCHash128`.
 *
 * PCHash128 / PCHashWriteStream / PCURL / OZFootage / OZPreferenceManager /
 * `GetBaseClipString` and their whole ObjC/CoreFoundation web are NOT yet
 * transcribed anywhere in raw-port/. Per PORTING_SPEC Rule 3, this stub
 * throws citing its @0xADDR rather than approximating any of that.
 */
export function OZOpticalFlow_GetMotionVectorFileHash(
  _footage: unknown,
): never {
  throw new Error(
    "OZOpticalFlow::GetMotionVectorFileHash @Ozone 0x4ecae0 not yet transcribed " +
      "(needs PCHashWriteStream, PCHash128, OZFootage::getHashForOpticalFlow, " +
      "(anonymous namespace)::GetBaseClipString, and CFUUID plumbing).",
  );
}

/**
 * OZOpticalFlow::GetMotionVectorFileExtension() @Ozone 0x4ece00.
 *
 * Constructs and returns the fixed PCString `"mv"`. Decoded in full:
 *
 *   leaq 0x2f348b(%rip), %rsi   ## literal pool for: "mv"
 *   callq  __ZN8PCStringC1EPKc  ## PCString(const char*)
 *   ret
 *
 * The literal `"mv"` is the on-disk extension for FCP motion-vector cache
 * files. Address of the string constant is recovered from the disasm's
 * `literal pool for: "mv"` annotation.
 */
export function OZOpticalFlow_GetMotionVectorFileExtension(): string {
  // Constant string, provenance: rip-relative literal at 0x4ece09+0x2f348b.
  return "mv";
}

/**
 * OZOpticalFlow::GetMotionVectorFileForClip(OZFootage const*, int) @Ozone 0x4ece20.
 *
 * Assembles the on-disk PCURL of the motion-vector cache file for a given
 * OZFootage plus a cache-mode int. Rough shape (all callees are undecoded):
 *
 *   1. Extract the footage's clip URL string via vtable slot +0x518.
 *   2. GetBaseClipString(...) — anonymous-namespace helper.
 *   3. Get PCString("mv") — the extension.
 *   4. Convert to NSString via `PCString::ns_str()`, do a case-insensitive
 *      equality check against @"bad cfstring ref", and if it matches, sanitize
 *      via `NSString substringFromIndex:1` (weird legacy fixup path).
 *   5. If cacheMode (arg2) != 0:
 *        - fetch `OZPreferenceManager::getOpticalFlowCachePath()`
 *        - ask NSFileManager `fileExistsAtPath:isDirectory:`
 *        - if absent, create via `createDirectoryAtPath:withIntermediateDirectories:attributes:error:`
 *        - build the final path by appending the extension component.
 *      Else: just use the base clip PCString's NSString form.
 *   6. GetMotionVectorFileHash(footage) -> PCHash128 -> `getString()` -> append
 *      as another NSString path component.
 *   7. Append the "mv" extension component (via `stringByAppendingPathExtension:`).
 *   8. Wrap the NSString into a PCString via `PCString::set(CFStringRef)`, then
 *      construct a PCURL(PCString const&, bool=false) in *rdi and return.
 *
 * Every callee here (PCString, PCURL, PCHash128, OZFootage vtable slot 0x518,
 * OZPreferenceManager, GetBaseClipString, and the whole NSFileManager +
 * NSString ObjC message chain) is NOT yet transcribed. Per PORTING_SPEC
 * Rule 3, this stub throws citing its @0xADDR rather than approximating
 * any part of the filesystem/ObjC/hash pipeline.
 */
export function OZOpticalFlow_GetMotionVectorFileForClip_withMode(
  _footage: unknown,
  _cacheMode: number,
): never {
  throw new Error(
    "OZOpticalFlow::GetMotionVectorFileForClip(OZFootage const*, int) @Ozone 0x4ece20 " +
      "not yet transcribed (needs PCURL, PCString ns_str/set, OZFootage vtable slot 0x518, " +
      "OZPreferenceManager::getOpticalFlowCachePath, NSFileManager fileExistsAtPath:isDirectory: " +
      "/ createDirectoryAtPath:..., NSString path-appending msgSends, PCHash128::getString, and " +
      "OZOpticalFlow::GetMotionVectorFileHash @0x4ecae0 above).",
  );
}

/**
 * OZOpticalFlow::GetMotionVectorFileForClip(OZFootage const*) @Ozone 0x4ed060.
 *
 * Thin overload. Decoded in full:
 *
 *   callq OZPreferenceManager::Instance()                    @Ozone (undecoded)
 *   callq OZPreferenceManager::getOpticalFlowCacheMode()     @Ozone (undecoded)
 *   -> tail-forward to the 2-arg overload at 0x4ece20 with the returned int.
 *
 * Because BOTH OZPreferenceManager entry points are undecoded, this stub also
 * throws (per PORTING_SPEC Rule 3) — even though the wiring is trivial, we
 * cannot faithfully compute the cache-mode argument without transcribing the
 * preference manager first.
 */
export function OZOpticalFlow_GetMotionVectorFileForClip(
  _footage: unknown,
): never {
  throw new Error(
    "OZOpticalFlow::GetMotionVectorFileForClip(OZFootage const*) @Ozone 0x4ed060 " +
      "not yet transcribed (needs OZPreferenceManager::Instance @Ozone and " +
      "OZPreferenceManager::getOpticalFlowCacheMode @Ozone, which supply the int " +
      "arg forwarded to OZOpticalFlow::GetMotionVectorFileForClip @0x4ece20 above).",
  );
}
