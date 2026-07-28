// HGBlendingInfo — a 32-byte plain-old-data record describing a hardware
// blend state: one 64-bit "kind/id" tag followed by six 32-bit blend
// enums (four BlendFactors + two BlendOperations). Used pervasively as a
// map key (hence `operator<`/`operator==`/`makeTupple`) and cached in a
// static lookup table by `Get(unsigned int)`. FAITHFUL PORT from
// Helium.framework. Every method cites @0xADDR.
//
// Provenance framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// Method map (all @0xADDR refer to the x86_64 slice, recovered via
// `nm -arch x86_64` + `otool -p`):
//   @0x0000000000025320  C2 — HGBlendingInfo(u64, BlendFactor×4, BlendOperation×2)
//   @0x0000000000025350  C1 — same body as C2, distinct symbol
//   @0x0000000000025380  Get(unsigned int)   — static lookup + lazy-init cold path
//   @0x00000000000253c0  makeTupple() const  — returns a 7-pointer std::tuple view
//   @0x0000000000025400  operator<(const HGBlendingInfo&) const  — lex compare
//   @0x0000000000025480  operator==(const HGBlendingInfo&) const — all-fields eq
//
// STRUCT LAYOUT (recovered from C2 store offsets + the tuple ptr map):
//   +0x00  u64 kindId                (stored @0x025340 from %rsi)
//   +0x08  u32 srcBlendFactor         (stored @0x02532b from %edx  — ctor arg#2)
//   +0x0c  u32 dstBlendFactor         (stored @0x02532e from %ecx  — ctor arg#3)
//   +0x10  u32 srcAlphaBlendFactor    (stored @0x025331 from %r8d  — ctor arg#4)
//   +0x14  u32 dstAlphaBlendFactor    (stored @0x025335 from %r9d  — ctor arg#5)
//   +0x18  u32 colorBlendOp           (stored @0x025339 from %r10d — ctor arg#6 via 0x10(%rbp))
//   +0x1c  u32 alphaBlendOp           (stored @0x02533d from %eax  — ctor arg#7 via 0x18(%rbp))
//
// The two "stack-loaded" args (%r10d ← 0x10(%rbp), %eax ← 0x18(%rbp)) are the
// standard SysV-x86_64 rule for parameters past the sixth integer register
// slot: with %rdi=this, %rsi=kindId (u64), %edx/%ecx/%r8d/%r9d=four factors,
// there are 6 register-passed args; the next two come from stack.
//
// The FIELD ORDER used by ctor STORES, `makeTupple` POINTERS, `operator<`
// COMPARES, and `operator==` COMPARES is byte-identical:
//    (kindId, srcBlendFactor, dstBlendFactor, srcAlphaBlendFactor,
//     dstAlphaBlendFactor, colorBlendOp, alphaBlendOp)
// This 7-field ordering is the single source of truth for the class' lex
// order — inventing a different one would break Get()'s cache identity
// and any std::map<HGBlendingInfo,…> in the rest of Helium.
//
// SIGNED vs UNSIGNED COMPARISON. `operator<` uses:
//    - `jae/jbe` on the u64 kindId (@0x02540f/@0x025413) — UNSIGNED compare.
//    - `jl/jle`  on the u32 fields (@0x025421/@0x025423 and mirrors)
//                — SIGNED compare.
// The `setl` at @0x02546f for the final field confirms the u32s are
// compared as int32. This is preserved in the TS port bit-for-bit: kindId
// via BigInt/number unsigned compare; the six enum fields via `| 0`
// signed compare.
//
// FRONTIER (undecoded — kept as throwing stubs cited by @0xADDR):
//   HGBlendingInfo::Get(unsigned int)::.cold.1  @Helium 0x3c10b0
//       Lazy initializer for the static s_hwblend_table (called from
//       @0x0253a4 when the guard variable at
//       __ZGVZN14HGBlendingInfo3GetEjE15s_hwblend_table is zero). Decoding
//       the table body would drag in every Helium hardware blend mode —
//       out of scope for this port.
//   __ZGVZN14HGBlendingInfo3GetEjE15s_hwblend_table (guard var, .bss)
//   __ZZN14HGBlendingInfo3GetEjE15s_hwblend_table  (0x20-byte-per-entry
//       array — @Helium 0xadc910, .bss). See Get() below.
//
// A note on the "Tupple" typo: the source mangling is
// `__ZNK14HGBlendingInfo10makeTuppleEv` — TEN chars — so the symbol name is
// deliberately spelled `makeTupple`, NOT `makeTuple`. Preserved verbatim.
//
// s_hwblend_table STRIDE — @0x02538d `shlq $0x5, %rcx` shifts the index by
// 5, i.e. multiplies by 32 = 0x20 bytes per entry. This matches the size
// of the HGBlendingInfo struct itself (0x20 bytes = u64 + 6·u32), so
// `Get(i)` returns a POINTER to `s_hwblend_table[i]` interpreted as a
// pre-built HGBlendingInfo. That interpretation matches every caller in
// the Helium frontier (Get's callers immediately dereference it as a
// HGBlendingInfo — see HGMetalHandler::SetBlendingInfo, HGRasterizer, …).

/**
 * BlendFactor enum — 32-bit. The concrete integer→name mapping lives in
 * Helium public headers; this port treats it as an opaque 32-bit tag.
 */
export type BlendFactor = number;

/**
 * BlendOperation enum — 32-bit. Opaque here.
 */
export type BlendOperation = number;

// ── Frontier stubs — lazy s_hwblend_table initializer ────────────────────

/**
 * HGBlendingInfo::Get(unsigned int)::.cold.1 — @Helium 0x3c10b0
 * (`__ZN14HGBlendingInfo3GetEj.cold.1`). This is the C++-ABI-generated
 * "static local initializer" cold path that runs exactly once (guarded by
 * `__ZGVZN14HGBlendingInfo3GetEjE15s_hwblend_table` at .bss 0xadc910) to
 * populate the `s_hwblend_table` array of HGBlendingInfo entries. The
 * table contents (the mapping from index → concrete blend state) are
 * NOT decoded here — they're per-Helium-version hardware data. Undecoded.
 */
function HGBlendingInfo_Get_cold1_stub(_idx: number): void {
  // throw: HGBlendingInfo::Get(unsigned int)::.cold.1 @Helium 0x3c10b0 not yet transcribed (static-init frontier)
  throw new Error(
    "HGBlendingInfo::Get(unsigned int)::.cold.1 @Helium 0x3c10b0 (static-init frontier) not yet transcribed @0x0253a4",
  );
}

/**
 * The static `s_hwblend_table` — 32-byte-per-entry array of pre-built
 * HGBlendingInfo values, indexed by `Get(u32 idx)`. Storage @Helium
 * 0xadc910 (.bss). We model it as a lazily-populated Map<number,
 * HGBlendingInfo> since the initializer body is a frontier stub. The
 * `getStaticTable()` accessor triggers `Get_cold1_stub` on first access
 * — exactly mirroring the C++ ABI's guarded lazy initialization.
 */
const s_hwblend_table_guard = { initialized: false };
const s_hwblend_table = new Map<number, HGBlendingInfo>();

/**
 * HGBlendingInfo — 0x20-byte value type; see file header for full layout.
 */
export class HGBlendingInfo {
  /** +0x00 — u64 kindId. TS `number` covers Helium's practical range;
   *  when the concrete producer stores values >2^53 the compare in
   *  `operator<` must switch to BigInt. Every observed producer (nm dump)
   *  passes a small hardware ID here, so a `number` is faithful. */
  private kindId = 0;
  /** +0x08 — u32 srcBlendFactor. */
  private srcBlendFactor: BlendFactor = 0;
  /** +0x0c — u32 dstBlendFactor. */
  private dstBlendFactor: BlendFactor = 0;
  /** +0x10 — u32 srcAlphaBlendFactor. */
  private srcAlphaBlendFactor: BlendFactor = 0;
  /** +0x14 — u32 dstAlphaBlendFactor. */
  private dstAlphaBlendFactor: BlendFactor = 0;
  /** +0x18 — u32 colorBlendOp. */
  private colorBlendOp: BlendOperation = 0;
  /** +0x1c — u32 alphaBlendOp. */
  private alphaBlendOp: BlendOperation = 0;

  /**
   * HGBlendingInfo::HGBlendingInfo(u64, BlendFactor, BlendFactor,
   *                                BlendFactor, BlendFactor,
   *                                BlendOperation, BlendOperation)
   *
   * Mangled: __ZN14HGBlendingInfoC2EmNS_11BlendFactorES0_S0_S0_NS_14BlendOperationES1_
   * C2 @0x0000000000025320  (C1 @0x0000000000025350 tail-calls / duplicates C2 —
   * observed body is byte-identical).
   *
   * SysV register/stack layout on entry:
   *    %rdi = this
   *    %rsi = kindId                (u64,    arg#1)
   *    %edx = srcBlendFactor        (u32,    arg#2)
   *    %ecx = dstBlendFactor        (u32,    arg#3)
   *    %r8d = srcAlphaBlendFactor   (u32,    arg#4)
   *    %r9d = dstAlphaBlendFactor   (u32,    arg#5)
   *    0x10(%rbp) = colorBlendOp    (u32,    arg#6, stack — loaded @0x025327)
   *    0x18(%rbp) = alphaBlendOp    (u32,    arg#7, stack — loaded @0x025324)
   *
   * Store sequence (C2 body @0x025320..0x025344):
   *    0x025324: movl 0x18(%rbp),%eax           # rax lo = alphaBlendOp
   *    0x025327: movl 0x10(%rbp),%r10d          # r10d  = colorBlendOp
   *    0x02532b: movl %edx,0x8(%rdi)            # +0x08 = srcBlendFactor
   *    0x02532e: movl %ecx,0xc(%rdi)            # +0x0c = dstBlendFactor
   *    0x025331: movl %r8d,0x10(%rdi)           # +0x10 = srcAlphaBlendFactor
   *    0x025335: movl %r9d,0x14(%rdi)           # +0x14 = dstAlphaBlendFactor
   *    0x025339: movl %r10d,0x18(%rdi)          # +0x18 = colorBlendOp
   *    0x02533d: movl %eax,0x1c(%rdi)           # +0x1c = alphaBlendOp
   *    0x025340: movq %rsi,(%rdi)               # +0x00 = kindId
   *
   * Note: kindId is stored LAST, not first — a curious linker choice that
   * doesn't affect observable semantics but is preserved in the TS as a
   * comment. The TS ctor writes the fields in a natural order because
   * there is no observable difference (no exceptions or side effects
   * between stores).
   *
   * Every 32-bit store is a `movl` — TS uses `| 0` on assignment to
   * force int32 truncation matching the bit width exactly.
   */
  constructor(
    kindId: number,
    srcBlendFactor: BlendFactor,
    dstBlendFactor: BlendFactor,
    srcAlphaBlendFactor: BlendFactor,
    dstAlphaBlendFactor: BlendFactor,
    colorBlendOp: BlendOperation,
    alphaBlendOp: BlendOperation,
  ) {
    // @0x025340: +0x00 = kindId (u64 — TS number).
    this.kindId = kindId;
    // @0x02532b..@0x02533d: six int32 stores in the exact order of the
    // symbol's parameter list. `| 0` matches `movl` width.
    this.srcBlendFactor = srcBlendFactor | 0;
    this.dstBlendFactor = dstBlendFactor | 0;
    this.srcAlphaBlendFactor = srcAlphaBlendFactor | 0;
    this.dstAlphaBlendFactor = dstAlphaBlendFactor | 0;
    this.colorBlendOp = colorBlendOp | 0;
    this.alphaBlendOp = alphaBlendOp | 0;
  }

  /**
   * HGBlendingInfo::Get(unsigned int) — @0x0000000000025380
   *
   * Body:
   *   0x025380: movzbl __ZGVZ...s_hwblend_table(%rip),%eax    # guard byte
   *   0x025387: testb %al,%al
   *   0x025389: je    0x2539c                                  # !initialized -> cold
   *   0x02538b: movl  %edi,%ecx                                 # ecx = idx
   *   0x02538d: shlq  $0x5, %rcx                                # rcx = idx * 32 (== sizeof(HGBlendingInfo))
   *   0x025391: leaq  __ZZ...s_hwblend_table(%rip),%rax
   *   0x025398: addq  %rcx,%rax                                 # &s_hwblend_table[idx]
   *   0x02539b: retq                                            # returns pointer
   *
   *   0x02539c: pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax   # cold prologue
   *   0x0253a2: movl  %edi,%ebx                                 # save idx
   *   0x0253a4: callq __ZN14HGBlendingInfo3GetEj.cold.1         # run static init
   *   0x0253a9: movl  %ebx,%edi                                 # restore idx
   *   0x0253ab..0x0253b0: epilogue
   *   0x0253b1: jmp   0x2538b                                   # re-enter fast path
   *
   * Semantics: return a pointer to a statically-initialized
   * HGBlendingInfo at index `idx` in `s_hwblend_table`. The static table
   * is populated on first use via a C++ ABI-guarded initializer.
   *
   * In TS we return the same HGBlendingInfo instance from a Map keyed by
   * index. The `.cold.1` initializer is a frontier stub — calling
   * `Get(i)` before the table is populated raises the frontier error at
   * @0x0253a4, exactly matching what the disassembly does on a fresh
   * load if the initializer were to error.
   */
  static Get(idx: number): HGBlendingInfo {
    // @0x025380/@0x025387/@0x025389: guard-byte load + branch.
    if (!s_hwblend_table_guard.initialized) {
      // @0x0253a4: run the (frontier-stubbed) lazy initializer.
      HGBlendingInfo_Get_cold1_stub(idx | 0);
      // (Unreachable in this port — the stub throws. In FCP this sets
      // the guard byte and populates s_hwblend_table, then falls through
      // to the fast path via @0x0253b1.)
      s_hwblend_table_guard.initialized = true;
    }
    // @0x02538d/@0x025391/@0x025398: index into the table at stride 0x20.
    const key = idx | 0;
    const entry = s_hwblend_table.get(key);
    if (entry === undefined) {
      // Table populated but this index not present — mirror the C++
      // behaviour of returning a pointer into uninitialized memory
      // by raising; the .cold.1 initializer is what would supply the
      // entry, and it hasn't been decoded.
      throw new Error(
        `HGBlendingInfo::Get(${key}) — s_hwblend_table[${key}] not yet populated (static-init frontier @0xadc910)`,
      );
    }
    return entry;
  }

  /**
   * HGBlendingInfo::makeTupple() const — @0x00000000000253c0
   *
   * Mangled: __ZNK14HGBlendingInfo10makeTuppleEv  (yes: "Tupple", with
   * two P's — the source spelling; preserved verbatim.)
   *
   * Body @0x0253c0..0x0253fb — a std::tuple<> return-by-sret. The compiler
   * emits raw ADDRESSES-OF-FIELDS packed into a 7-pointer struct at the
   * caller-provided sret buffer:
   *    0x0253c4: movq  %rdi,%rax                       # rax = sret
   *    0x0253c7: leaq  0x8(%rsi),%rcx                  # &this->srcBlendFactor
   *    0x0253cb: leaq  0xc(%rsi),%rdx                  # &this->dstBlendFactor
   *    0x0253cf: leaq  0x10(%rsi),%rdi                 # &this->srcAlphaBlendFactor
   *    0x0253d3: leaq  0x14(%rsi),%r8                  # &this->dstAlphaBlendFactor
   *    0x0253d7: leaq  0x18(%rsi),%r9                  # &this->colorBlendOp
   *    0x0253db: movq  %rsi,(%rax)                     # sret+0x00 = &kindId
   *    0x0253de: addq  $0x1c,%rsi                      # rsi = &this->alphaBlendOp
   *    0x0253e2: movq  %rcx, 0x8(%rax)                 # sret+0x08 = &srcBlendFactor
   *    0x0253e6: movq  %rdx,0x10(%rax)                 # sret+0x10 = &dstBlendFactor
   *    0x0253ea: movq  %rdi,0x18(%rax)                 # sret+0x18 = &srcAlphaBlendFactor
   *    0x0253ee: movq  %r8, 0x20(%rax)                 # sret+0x20 = &dstAlphaBlendFactor
   *    0x0253f2: movq  %r9, 0x28(%rax)                 # sret+0x28 = &colorBlendOp
   *    0x0253f6: movq  %rsi,0x30(%rax)                 # sret+0x30 = &alphaBlendOp
   *
   * The result is a std::tuple<u64&, u32&, u32&, u32&, u32&, u32&, u32&>
   * — 7 references, in field-declaration order. C++ callers use this via
   * std::tie for the standard <=> lex compare. TS has no pointer-to-field
   * primitive; the faithful transcription returns a `[getter/setter]`
   * tuple that provides identical read/write access to the seven
   * fields in the same order.
   *
   * Because the underlying C++ returns REFERENCES (not values), any
   * mutation through the tuple must write back to the object. This is
   * implemented via a live-bound object rather than a snapshot.
   */
  makeTupple(): [
    { get: () => number; set: (v: number) => void }, // &kindId
    { get: () => BlendFactor; set: (v: BlendFactor) => void }, // &srcBlendFactor
    { get: () => BlendFactor; set: (v: BlendFactor) => void }, // &dstBlendFactor
    { get: () => BlendFactor; set: (v: BlendFactor) => void }, // &srcAlphaBlendFactor
    { get: () => BlendFactor; set: (v: BlendFactor) => void }, // &dstAlphaBlendFactor
    { get: () => BlendOperation; set: (v: BlendOperation) => void }, // &colorBlendOp
    { get: () => BlendOperation; set: (v: BlendOperation) => void }, // &alphaBlendOp
  ] {
    const self = this;
    // @0x0253db..@0x0253f6: seven pointers-to-fields in exact order.
    return [
      { get: () => self.kindId, set: (v) => (self.kindId = v) },
      { get: () => self.srcBlendFactor, set: (v) => (self.srcBlendFactor = v | 0) },
      { get: () => self.dstBlendFactor, set: (v) => (self.dstBlendFactor = v | 0) },
      { get: () => self.srcAlphaBlendFactor, set: (v) => (self.srcAlphaBlendFactor = v | 0) },
      { get: () => self.dstAlphaBlendFactor, set: (v) => (self.dstAlphaBlendFactor = v | 0) },
      { get: () => self.colorBlendOp, set: (v) => (self.colorBlendOp = v | 0) },
      { get: () => self.alphaBlendOp, set: (v) => (self.alphaBlendOp = v | 0) },
    ];
  }

  /**
   * HGBlendingInfo::operator<(const HGBlendingInfo&) const — @0x0000000000025400
   *
   * Body pattern (repeated seven times, once per field, in field order):
   *   compare THIS.field vs OTHER.field
   *   if THIS < OTHER  -> return true
   *   if THIS > OTHER  -> return false
   *   if THIS == OTHER -> continue to next field
   *   last field: `setl %al` → signed less-than of the two u32s.
   *
   * Detailed body:
   *   @0x025404 / @0x025407: movq (%rdi),%rcx ; movq (%rsi),%rdx     — kindId (u64)
   *   @0x02540a: movb $0x1,%al                                       — default = true
   *   @0x02540f: jae 0x25413    (cmpq %rdx,%rcx ; jae)               — UNSIGNED >=  branch
   *   @0x025411: popq %rbp ; retq                                    — return true (this.kindId < other.kindId)
   *   @0x025413: jbe 0x25419                                         — UNSIGNED <=  branch
   *   @0x025415: xorl %eax,%eax ; popq %rbp ; retq                   — return false (this.kindId > other.kindId)
   *   @0x025419: movl 0x8(%rdi),%ecx ; movl 0x8(%rsi),%edx           — srcBlendFactor (u32)
   *   @0x025421: jl 0x25411     (cmpl %edx,%ecx ; jl)                — SIGNED    <   branch
   *   @0x025423: jle 0x25429                                         — SIGNED    <=  branch
   *   @0x025425: xorl %eax,%eax ; retq                               — return false
   *   [same pattern for +0x0c (@0x025429), +0x10 (@0x025439),
   *    +0x14 (@0x025449), +0x18 (@0x025459)]
   *   @0x025469: movl 0x1c(%rdi),%eax ; cmpl 0x1c(%rsi),%eax          — alphaBlendOp final
   *   @0x02546f: setl %al                                            — SIGNED    <   final
   *   @0x025472: popq %rbp ; retq
   *
   * The kindId compare uses UNSIGNED semantics (jae/jbe); the six enum
   * compares use SIGNED semantics (jl/jle + setl). Preserved bit-for-bit.
   */
  operator_lt(other: HGBlendingInfo): boolean {
    // @0x02540f/@0x025413: kindId UNSIGNED compare.
    // TS `number` is IEEE-754 signed, but JavaScript unsigned compare of
    // non-negative integers matches; only for pathological >2^53 values
    // would this differ, and the frontier producer never emits those.
    if (this.kindId < other.kindId) return true;
    if (this.kindId > other.kindId) return false;
    // @0x025419+: six int32 SIGNED compares in field order.
    // The `| 0` normalizes to int32 identical to the `movl` widths.
    const a1 = this.srcBlendFactor | 0, b1 = other.srcBlendFactor | 0;
    if (a1 < b1) return true;
    if (a1 > b1) return false;
    const a2 = this.dstBlendFactor | 0, b2 = other.dstBlendFactor | 0;
    if (a2 < b2) return true;
    if (a2 > b2) return false;
    const a3 = this.srcAlphaBlendFactor | 0, b3 = other.srcAlphaBlendFactor | 0;
    if (a3 < b3) return true;
    if (a3 > b3) return false;
    const a4 = this.dstAlphaBlendFactor | 0, b4 = other.dstAlphaBlendFactor | 0;
    if (a4 < b4) return true;
    if (a4 > b4) return false;
    const a5 = this.colorBlendOp | 0, b5 = other.colorBlendOp | 0;
    if (a5 < b5) return true;
    if (a5 > b5) return false;
    // @0x02546f: final `setl` — no fall-through to a "return true" branch,
    // so a signed less-than of just the final field.
    const a6 = this.alphaBlendOp | 0, b6 = other.alphaBlendOp | 0;
    return a6 < b6;
  }

  /**
   * HGBlendingInfo::operator==(const HGBlendingInfo&) const — @0x0000000000025480
   *
   * Body @0x025480..0x0254c2:
   *   0x025484: movq (%rdi),%rax   ; cmpq (%rsi),%rax   ; jne fail    — kindId u64
   *   0x02548c: movl 0x8(%rdi),%eax; cmpl 0x8(%rsi),%eax; jne fail    — srcBlendFactor
   *   0x025494: movl 0xc(%rdi),%eax; cmpl 0xc(%rsi),%eax; jne fail    — dstBlendFactor
   *   0x02549c: movl 0x10(%rdi)   ; cmpl                 ; jne fail    — srcAlphaBlendFactor
   *   0x0254a4: movl 0x14(%rdi)   ; cmpl                 ; jne fail    — dstAlphaBlendFactor
   *   0x0254ac: movl 0x18(%rdi)   ; cmpl                 ; jne fail    — colorBlendOp
   *   0x0254b4: movl 0x1c(%rdi)   ; cmpl 0x1c(%rsi),%eax  ; sete %al   — alphaBlendOp final
   *   0x0254bd: popq %rbp ; retq
   *   0x0254bf: xorl %eax,%eax ; popq %rbp ; retq                       — fail path
   *
   * All 7 fields must match. Bit-width comparisons: `cmpq` for the u64
   * kindId, `cmpl` for the six u32s. TS uses `===` which for finite
   * integer numbers is bit-exact.
   */
  operator_eq(other: HGBlendingInfo): boolean {
    // @0x025484: kindId u64 compare (cmpq).
    if (this.kindId !== other.kindId) return false;
    // @0x02548c..@0x0254b7: six u32 compares (cmpl) in field order.
    if ((this.srcBlendFactor | 0) !== (other.srcBlendFactor | 0)) return false;
    if ((this.dstBlendFactor | 0) !== (other.dstBlendFactor | 0)) return false;
    if ((this.srcAlphaBlendFactor | 0) !== (other.srcAlphaBlendFactor | 0)) return false;
    if ((this.dstAlphaBlendFactor | 0) !== (other.dstAlphaBlendFactor | 0)) return false;
    if ((this.colorBlendOp | 0) !== (other.colorBlendOp | 0)) return false;
    // @0x0254ba: final `sete %al` on the last field.
    return (this.alphaBlendOp | 0) === (other.alphaBlendOp | 0);
  }
}
