// FFDecodeCostInfo_AdjustedPPF — Flexo class that accumulates a per-asset
// decode-cost table (keyed by FFMD5 hash of the asset) and, on demand,
// decides whether the cumulative cost exceeds a device-memory-configured
// limit — reporting back a well-known reason string (or nil).
//
// The class body is a std::map<FFMD5, float> at offset +0x00 of the object.
// Each entry is (assetHash -> pixelsPerFrame_scaledCost). The ctor takes
// (uint64 n, float f, FFMD5 md5) and inserts one entry with value = f * (float)n.
// getOverlimitReasonOrNil(bool isPlay) walks the entire map, sums the
// per-entry float cost at node offset +0x2c, divides by the 4K-UHD pixel
// count constant 8294400f (= 3840 * 2160), and compares that "average
// pixels-per-frame" against a static double limit (sMaxStreamsAllowed).
// For non-playback (render) calls the limit is scaled by 2.5x — offline
// rendering is allowed to push more streams than live playback.
//
// Faithful transcription of Flexo class FFDecodeCostInfo_AdjustedPPF
// (4 exported methods: 1 ctor, 1 accessor, 2 cold-init helpers).
//
// Source disassembly (dumped via raw-port/tools/disasm.sh):
//   raw-port/re/disasm/Flexo.FFDecodeCostInfo_AdjustedPPF.FFDecodeCostInfo_AdjustedPPF.s
//       ctor @0x12f3170  (__ZN28FFDecodeCostInfo_AdjustedPPFC2Emf5FFMD5)
//   raw-port/re/disasm/Flexo.FFDecodeCostInfo_AdjustedPPF.getOverlimitReasonOrNil.s
//       accessor @0x12f11e0 (__ZN28FFDecodeCostInfo_AdjustedPPF23getOverlimitReasonOrNilEb)
// Cold static-init helpers (NOT yet transcribed — see stubs at the bottom):
//   .cold.1 @0x1492d80 — __cxa_guard_acquire+populate limitTable/sMaxStreamsAllowed
//   .cold.2 @0x1492df0 — recursive-init / abort path
// Framework: Final Cut Pro / Flexo.framework
//
// DECODE — struct layout (recovered from the ctor at 0x12f3170 — the object
// IS the tree; there are no other fields):
//   +0x00  __tree_node_base<void*>*  __begin_node_   // first (leftmost) real
//                                                    // node, or &this->__end_node_ when empty.
//                                                    // Installed via `leaq 0x8(%rbx), %rax;
//                                                    // movq %rax, (%rbx)` @0x12f31c5/0x12f31d0.
//   +0x08  __tree_end_node          __end_node_     // sentinel end node whose child slot at
//                                                    // +0x08 (of the end node) is the tree root.
//                                                    // Zeroed via `xorps %xmm0; movups %xmm0,
//                                                    // 0x8(%rbx)` @0x12f31c9/0x12f31cc (16 bytes
//                                                    // covering both __end_node_.child and size_).
//   +0x18  size_t                   __size_          // node count.
// sizeof(FFDecodeCostInfo_AdjustedPPF) = 24 bytes (std::map header only).
//
// Per-entry allocated node (0x30 bytes via `new` @0x12f31ec `mov $0x30, %edi;
// callq __Znwm`):
//   +0x00   left child       (zeroed via movups xmm0)
//   +0x08   right child      (zeroed via movups xmm0)
//   +0x10   parent           (from find_equal out-parent @0x12f320d/0x12f3217)
//   +0x18   is_black + pad   (packed into parent low bit; not explicitly written
//                            — new-allocator zero-fills unused-by-us slot? Actually
//                            the tree_balance_after_insert call @0x12f3233 recolors
//                            it, so leaving it 0 is fine.)
//   +0x1c   FFMD5 key        (16 bytes; written via `movups -0x28(%rbp), %xmm0;
//                            movups %xmm0, 0x1c(%rax)` @0x12f3200/0x12f3204)
//   +0x2c   float value      (`movss %xmm1, 0x2c(%rax)` @0x12f3208 where
//                            xmm1 = f * (float)n — see ctor decode)
//
// Static-local state used by getOverlimitReasonOrNil (see cold init decode
// below — the addresses are only *referenced* in the hot path):
//   __ZGVZN28FFDecodeCostInfo_AdjustedPPF23getOverlimitReasonOrNilEbE10limitTable
//     — one-byte __cxa_guard_variable @ rip-relative from 0x12f11e7. Nonzero =
//       initialization already ran.
//   __ZZN28FFDecodeCostInfo_AdjustedPPF23getOverlimitReasonOrNilEbE4once
//     — 8-byte sentinel; == -1 means the once-init succeeded.
//   __ZZN28FFDecodeCostInfo_AdjustedPPF23getOverlimitReasonOrNilEbE18sMaxStreamsAllowed
//     — 8-byte double; populated by .cold.1 (NOT yet transcribed).
//
// Numeric constants read out of the binary (with their read addresses):
//   0x15700a0  double 2.5                    (mulsd source @0x12f1220 —
//                                             render-mode limit scale)
//   0x1584370  float  8294400.0              (divss source @0x12f122c —
//                                             low32=0x4afd2000 = 3840*2160,
//                                             the 4K UHD frame pixel count)
//   0x19df968  __cfstring @0x0168d1ce len 42 (@0x12f1234 leaq —
//                                             "FFTooManyStreamsForDeviceMemoryConfig_Play")
//   0x19df988  __cfstring @0x0168d1f9 len 44 (@0x12f123b leaq —
//                                             "FFTooManyStreamsForDeviceMemoryConfig_Render")
//
// The bool arg of getOverlimitReasonOrNil (sil, in %rdi is `this`, %sil is
// the second byte-arg) discriminates isPlay:
//   sil != 0 -> Play    : limit = sMaxStreamsAllowed (unscaled); reason = "..._Play"
//   sil == 0 -> Render  : limit = sMaxStreamsAllowed * 2.5;     reason = "..._Render"
// The `mulsd 0x27ee78(%rip), %xmm1` @0x12f1220 is skipped by `jne 0x12f1228`
// (which fires when sil != 0), matching that split.
//
// The final compare uses `ucomiss %xmm1, %xmm0; cmovaq %rcx, %rax` @0x12f1248/
// 0x12f124b — return the reason string when xmm0 (sum/8294400f) > xmm1 (limit),
// else 0 (nil). `cmova` is unordered-and-strictly-above, so NaN produces nil.

/**
 * FFMD5 — 16-byte digest used as the std::map key here.
 *
 * The disassembly only touches these 16 bytes as a value type: the ctor
 * receives it in the SysV-x86_64 `rdx`+`rcx` register pair (two 8-byte
 * halves — the standard aggregate ABI slotting) and stores them into the
 * local at `-0x28(%rbp)` via `movq %rdx, -0x28; movq %rcx, -0x20`
 * @0x12f31bd/0x12f31c1, then copies the whole 16-byte blob into the node
 * with `movups -0x28(%rbp), %xmm0; movups %xmm0, 0x1c(%rax)`
 * @0x12f3200/0x12f3204. We faithfully carry those two halves as bigints.
 *
 * The comparator used by the underlying std::map is `std::less<FFMD5>`
 * (see the mangled name of __find_equal in the ctor callsite @0x12f31de).
 * The FCP FFMD5 `operator<` body is NOT in this class's disassembly and
 * is not yet transcribed @cross-TU — we key our JS-side map by the
 * canonical hex string of the 16 bytes, which is a total order compatible
 * with any FFMD5-owned ordering as long as callers are consistent about
 * which representation feeds the ctor.
 */
export interface FFMD5 {
  /** Low 8 bytes (bytes 0..7 as a little-endian u64). */
  readonly lo: bigint;
  /** High 8 bytes (bytes 8..15 as a little-endian u64). */
  readonly hi: bigint;
}

/** Canonical 32-hex-char key derived from the 16 raw bytes of an FFMD5. */
function ffmd5Key(k: FFMD5): string {
  // Lowercased hex, low half first then high half — the specific
  // ordering doesn't matter for the JS Map (only equality does), but we
  // pick lo-then-hi to match the on-stack memory order the ctor writes.
  const lo = (k.lo & 0xffffffffffffffffn).toString(16).padStart(16, "0");
  const hi = (k.hi & 0xffffffffffffffffn).toString(16).padStart(16, "0");
  return lo + hi;
}

/** Per-entry payload stored at node offset +0x1c/+0x2c. */
interface FFDecodeCostEntry {
  /** 16-byte key blob (node offset +0x1c). */
  readonly md5: FFMD5;
  /** Scaled cost value written at node offset +0x2c (f * (float)n). */
  readonly cost: number;
}

/**
 * Convert a nonnegative signed-treated uint64 to Math.fround-narrowed
 * float32 the way the ctor at @0x12f3170 does.
 *
 * The relevant instructions are:
 *   @0x12f3191  testq %rsi, %rsi
 *   @0x12f3194  js    0x12f31a0          ; MSB set -> unsigned-large path
 *   @0x12f3196  xorps %xmm0, %xmm0
 *   @0x12f3199  cvtsi2ss %rsi, %xmm0    ; signed conversion (safe: MSB=0)
 *   @0x12f319e  jmp   0x12f31b8
 *   @0x12f31a0  movq  %rsi, %rax        ; unsigned-large fallback:
 *   @0x12f31a3  shrq  %rax              ;   half = rsi >> 1
 *   @0x12f31a6  andl  $0x1, %esi        ;   lsb  = rsi & 1
 *   @0x12f31a9  orq   %rax, %rsi        ;   packed = half | lsb (round-to-odd)
 *   @0x12f31ac  xorps %xmm0, %xmm0
 *   @0x12f31af  cvtsi2ss %rsi, %xmm0    ;   float(packed)  (packed fits signed)
 *   @0x12f31b4  addss %xmm0, %xmm0      ;   * 2  -> restores magnitude
 *
 * This is the standard x86_64 "unsigned-to-float via signed conversion"
 * lowering: for `rsi >= 2^63` the top bit is peeled off, converted, and
 * doubled, with round-to-odd on the discarded bit to keep the correctly
 * rounded float32 result. We reproduce that bit-for-bit.
 */
function uint64ToFloat32Ctor(n: bigint): number {
  const mask64 = 0xffffffffffffffffn;
  const nMasked = n & mask64;
  if ((nMasked & 0x8000000000000000n) === 0n) {
    // MSB clear — direct signed-conversion path @0x12f3196/@0x12f3199.
    return Math.fround(Number(nMasked));
  }
  // MSB set — round-to-odd + double path @0x12f31a0..@0x12f31b4.
  const half = nMasked >> 1n; // shrq %rax @0x12f31a3
  const lsb = nMasked & 0x1n; // andl $0x1, %esi @0x12f31a6
  const packed = half | lsb; // orq %rax, %rsi @0x12f31a9
  const asFloat = Math.fround(Number(packed)); // cvtsi2ss @0x12f31af
  return Math.fround(asFloat + asFloat); // addss %xmm0, %xmm0 @0x12f31b4
}

/**
 * .cold.1 @0x1492d80 — one-time initializer for the static locals
 * `limitTable` (a std::map) and `sMaxStreamsAllowed` (a double) used by
 * getOverlimitReasonOrNil. NOT yet transcribed: its disassembly is not
 * present in raw-port/re/disasm/ and reading it requires resolving Meta
 * device-config lookups that the hot path never references directly.
 * Called from @0x12f12a3 when the `once`-guard sentinel isn't -1.
 */
function coldInitLimitTable(): never {
  throw new Error(
    "FFDecodeCostInfo_AdjustedPPF::getOverlimitReasonOrNil::.cold.1 @0x1492d80 not yet transcribed",
  );
}

/**
 * .cold.2 @0x1492df0 — recursive-initializer / abort path invoked
 * @0x12f12c0 when the `once` guard is still not -1 after the cold.1
 * returned. Standard libc++ `__cxa_guard_abort` follow-up. NOT yet
 * transcribed: no disassembly captured.
 */
function coldRecursiveInitLimitTable(): never {
  throw new Error(
    "FFDecodeCostInfo_AdjustedPPF::getOverlimitReasonOrNil::.cold.2 @0x1492df0 not yet transcribed",
  );
}

/** Reason string literal @__cfstring 0x19df968 (cstr @0x0168d1ce, len 42). */
const kReasonPlay = "FFTooManyStreamsForDeviceMemoryConfig_Play";
/** Reason string literal @__cfstring 0x19df988 (cstr @0x0168d1f9, len 44). */
const kReasonRender = "FFTooManyStreamsForDeviceMemoryConfig_Render";

/**
 * FFDecodeCostInfo_AdjustedPPF (Flexo).
 *
 * Direct TS mapping of the ctor + accessor at @0x12f3170 / @0x12f11e0.
 */
export class FFDecodeCostInfo_AdjustedPPF {
  /**
   * The map body embedded at object offset +0x00.
   * We use a JS Map keyed by the 32-hex-char canonical form of the FFMD5;
   * FCP uses a std::map<FFMD5, float, std::less<FFMD5>>. See ffmd5Key().
   */
  private readonly entries = new Map<string, FFDecodeCostEntry>();

  /**
   * Ctor @0x12f3170  (__ZN28FFDecodeCostInfo_AdjustedPPFC2Emf5FFMD5).
   *
   * Signature (from mangled name): (unsigned long n, float f, FFMD5 md5).
   * Semantics: initialize the empty map (offset +0x00 header @0x12f31c5..0x12f31d0),
   * then insert exactly one entry {md5 -> f * (float)n} via
   *   __tree::__find_equal<FFMD5>            @0x12f31de (returns parent-slot+out-parent)
   *   operator new(0x30)                     @0x12f31f1  (only when key not found — the
   *                                                       cmp `(%rax)==0` @0x12f31e6/0x12f31ea)
   *   __tree_balance_after_insert            @0x12f3233
   *   ++__size_                              @0x12f3238
   *
   * If __find_equal returns a slot whose deref is nonzero, the key was
   * already present — nothing is inserted (jmp @0x12f31ea -> 0x12f323c).
   * Since the map was JUST initialized empty above, that branch is
   * unreachable on a fresh ctor call and behaves as an identity insert.
   *
   * Numeric produced: `xmm1 = f * uint64ToFloat32Ctor(n)` — a single-precision
   * multiply (`mulss` @0x12f31fb), so we wrap the product in Math.fround.
   */
  constructor(n: bigint, f: number, md5: FFMD5) {
    // Ctor body @0x12f317b: `movss %xmm0, -0x30(%rbp)` stores f on the stack.
    // Ctor body @0x12f3191..@0x12f31b8: convert unsigned n to float32
    // (see uint64ToFloat32Ctor for the bit-exact lowering).
    // Ctor body @0x12f31b8: `movss %xmm0, -0x2c(%rbp)` stores that float(n).
    // Ctor body @0x12f31bd/@0x12f31c1: spill md5 halves to stack.
    const nAsFloat = uint64ToFloat32Ctor(n);

    // Map header init @0x12f31c5..@0x12f31d0: __begin_node_ = &__end_node_,
    // __end_node_.child = 0, __size_ = 0. Our JS Map already models that.

    // __find_equal @0x12f31de + branch @0x12f31e6..@0x12f31ea. On an empty
    // map __find_equal always returns a slot deref'ing to 0, so we always
    // take the insert path. We still honor the "don't overwrite if present"
    // semantics via Map.has().
    const key = ffmd5Key(md5);
    if (this.entries.has(key)) {
      // Matches the `jne 0x12f323c` path (skip the alloc/insert/rebalance).
      return;
    }

    // operator new(0x30) @0x12f31ec/@0x12f31f1 — build the node payload.
    // `mulss -0x2c(%rbp), %xmm1` @0x12f31fb — single-precision f * float(n).
    const cost = Math.fround(Math.fround(f) * nAsFloat);
    // `movups -0x28(%rbp), %xmm0; movups %xmm0, 0x1c(%rax)` @0x12f3200/@0x12f3204
    //   — copy the md5 into node+0x1c.
    // `movss %xmm1, 0x2c(%rax)` @0x12f3208 — cost into node+0x2c.
    this.entries.set(key, { md5, cost });

    // __tree_balance_after_insert @0x12f3233 + `incq 0x10(%rbx)` @0x12f3238
    // are the underlying RB-tree bookkeeping; our JS Map handles them for us.
  }

  /**
   * getOverlimitReasonOrNil @0x12f11e0
   *   (__ZN28FFDecodeCostInfo_AdjustedPPF23getOverlimitReasonOrNilEbE).
   *
   * Returns the human-readable reason string when the accumulated
   * per-frame decode cost — averaged over a 4K UHD frame — exceeds the
   * device-configured max streams limit, otherwise `null`.
   *
   * Control flow (mirroring the disasm 1:1):
   *   1. `movzbl guard(%rip), %eax; testb %al, %al; je .cold1` @0x12f11e7..@0x12f11f0
   *        -> lazy init entry: if the __cxa_guard byte is 0, call
   *           coldInitLimitTable() (@0x1492d80) and retry.
   *   2. `cmpq $-0x1, once(%rip); jne .cold2` @0x12f11f6..@0x12f11fe
   *        -> if the once-sentinel isn't -1 (successful-init marker),
   *           call coldRecursiveInitLimitTable() (@0x1492df0) and retry.
   *   3. Tree walk @0x12f1204..@0x12f129c:
   *        rax = this->__begin_node_          (movq (%rdi), %rax @0x12f1204)
   *        end = this + 8                     (addq $0x8, %rdi   @0x12f1207)
   *        xmm0 = 0.0f                        (xorps %xmm0,%xmm0 @0x12f120b)
   *        loop:
   *          if rax == end goto finish        (cmpq/jne          @0x12f120e/@0x12f1211)
   *          xmm0 += *(rax+0x2c) (addss)      (@0x12f1260)
   *          rax = successor(rax)             (@0x12f126d..@0x12f129c —
   *                                            std::_tree::__tree_next
   *                                            unrolled by the compiler)
   *          continue
   *   4. finish @0x12f1213..@0x12f1253:
   *        xmm1 = sMaxStreamsAllowed          (movsd, @0x12f1213)
   *        if !sil (isPlay==false) xmm1 *= 2.5 (mulsd 0x15700a0    @0x12f1220)
   *        xmm1 = (float32)xmm1               (cvtsd2ss           @0x12f1228)
   *        xmm0 /= 8294400.0f                 (divss  0x1584370   @0x12f122c)
   *        rcx = &"..._Render"                (leaq 0x19df988      @0x12f123b)
   *        rax = &"..._Play"                  (leaq 0x19df968      @0x12f1234)
   *        cmovne rax->rcx  (from sil test)   (@0x12f1242)
   *        rax = 0                            (xorl %eax,%eax     @0x12f1246)
   *        ucomiss xmm1, xmm0                 (@0x12f1248)
   *        cmova rcx->rax                     (@0x12f124b)
   *        return rax
   */
  getOverlimitReasonOrNil(isPlay: boolean): string | null {
    // Step 1 & 2 — the __cxa_guard-guarded lazy init of the static locals.
    // We don't hold live state for that here (the JS side has no CFG-level
    // initialization ordering issue); we ONLY faithfully echo the branch
    // that .cold.1/.cold.2 are the initializers responsible for populating
    // sMaxStreamsAllowed. Because those bodies aren't transcribed yet, and
    // because we have no other decoded source for `sMaxStreamsAllowed`,
    // walking into a real call throws — signalling "decode me next".
    this.ensureLimitTableInitialized();

    // Step 3 — walk this->entries and sum each node's float cost @+0x2c.
    // `movq (%rdi), %rax` @0x12f1204 seeds the walker with __begin_node_;
    // the loop terminates when rax == &this->__end_node_ (i.e. we've done
    // an in-order traversal of the whole tree). Our JS Map iterates its
    // entries in insertion order rather than key order, but the accumulator
    // is a commutative float32 sum — the sequence of round-off errors
    // depends on iteration order. Since std::map iterates in key order,
    // callers relying on bit-exact accumulation would see a difference;
    // we accept that only because the disassembly's control flow is
    // preserved — the arithmetic per step is identical. See NOTE below.
    let sum = 0; // xmm0 zeroed @0x12f120b
    for (const entry of this.entries.values()) {
      sum = Math.fround(sum + Math.fround(entry.cost)); // addss @0x12f1260
    }

    // Step 4a — read the static double limit.
    // .cold.1 @0x1492d80 is what populates this — if we reach here we've
    // (by construction) either had it initialized or thrown above.
    let limit: number = this.sMaxStreamsAllowed(); // movsd @0x12f1213 (double)

    // Step 4b — `testb %sil, %sil; jne 0x12f1228` @0x12f121b/@0x12f121e.
    // sil != 0 SKIPS the mulsd, so isPlay=true leaves the limit unscaled;
    // isPlay=false (render) multiplies by 2.5.
    if (!isPlay) {
      limit = limit * 2.5; // mulsd 0x15700a0 @0x12f1220 (double 2.5)
    }
    // Step 4c — `cvtsd2ss %xmm1, %xmm1` @0x12f1228 narrows the double to
    // single precision before the compare.
    const limitF32 = Math.fround(limit);

    // Step 4d — `divss 0x1584370(%rip), %xmm0` @0x12f122c divides the
    // accumulated single-precision sum by the 4K UHD pixel count.
    const avgPPF = Math.fround(sum / Math.fround(8294400.0));

    // Step 4e — pick the reason string based on the same sil ZF that
    // guided the mulsd skip. `cmovneq %rax, %rcx` @0x12f1242 picks Play
    // when sil != 0, otherwise Render.
    const reasonIfOver = isPlay ? kReasonPlay : kReasonRender;

    // Step 4f — `ucomiss xmm1, xmm0; cmovaq rcx->rax` @0x12f1248/@0x12f124b.
    // `cmova` is "above" (unsigned/unordered): fires only when neither
    // operand is NaN AND avgPPF > limitF32 strictly. On NaN or <= we
    // return the initial rax = 0 (nil).
    if (!Number.isNaN(avgPPF) && !Number.isNaN(limitF32) && avgPPF > limitF32) {
      return reasonIfOver;
    }
    return null;
  }

  // ---- static-local lazy init proxies -------------------------------------
  //
  // These model the two references to file-static state the hot path makes.
  // The initializer body (.cold.1 @0x1492d80) is not yet transcribed, so
  // any real invocation throws — that's the correct signal to the swarm:
  // "port the .cold.1 initializer next; nobody outside this class needs
  //  sMaxStreamsAllowed until then."

  private static _limitTableInitialized = false;
  private static _sMaxStreamsAllowed: number | null = null;

  /**
   * Mirrors the `movzbl guard(%rip); testb %al,%al; je .cold1` +
   * `cmpq $-0x1, once(%rip); jne .cold2` gate @0x12f11e7..@0x12f11fe.
   * Real init happens inside `.cold.1` — we haven't ported it, so any
   * attempt to run past this gate throws.
   */
  private ensureLimitTableInitialized(): void {
    if (!FFDecodeCostInfo_AdjustedPPF._limitTableInitialized) {
      // Falls to `.cold.1` @0x1492d80.
      coldInitLimitTable();
    }
    // The `cmpq $-0x1, once(%rip)` @0x12f11f6 check.
    if (FFDecodeCostInfo_AdjustedPPF._sMaxStreamsAllowed === null) {
      // Falls to `.cold.2` @0x1492df0.
      coldRecursiveInitLimitTable();
    }
  }

  /**
   * `movsd sMaxStreamsAllowed(%rip), %xmm1` @0x12f1213 — read the double
   * populated by the cold-init path. Undecoded until `.cold.1` is
   * transcribed; guarded above by ensureLimitTableInitialized().
   */
  private sMaxStreamsAllowed(): number {
    const v = FFDecodeCostInfo_AdjustedPPF._sMaxStreamsAllowed;
    if (v === null) {
      throw new Error(
        "FFDecodeCostInfo_AdjustedPPF::sMaxStreamsAllowed @0x12f1213 requires .cold.1 @0x1492d80 not yet transcribed",
      );
    }
    return v;
  }
}
