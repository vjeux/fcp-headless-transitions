// HGDefaultPolicies.ts
// Faithful raw-port of Helium::HGDefaultPolicies — texture padding + pooling policy factories.
//
// Source: Helium framework (macOS FCP)
//   ports:
//     - HGDefaultPolicies::getStudioPaddingPolicy(unsigned long long, bool) @0x51be0
//     - HGDefaultPolicies::getStudioPoolingPolicy(unsigned long long, bool) @0x51cd0
//
// Provenance: every branch, store, and const is cited by @0xADDR from the disassembly at
//   raw-port/re/disasm/Helium.HGDefaultPolicies.*.s
//
// Layout notes:
//   * Both methods construct opaque HGObject-derived policy structs. The v-ptrs at
//     `(this)+0` are distinct RIP-relative labels in the FCP binary — three separate
//     concrete policy classes (padding-rich, padding-empty, pooling). We do not have symbols
//     for the concrete subclasses; we record the RIP-target VA of each v-ptr so downstream
//     code can bind them later. Consumers care about the POD fields.
//   * HG_RENDERER_ENV is a bag of process-wide `int32_t` overrides, sentinel-valued -1 when
//     unset. Real FCP fills these via getenv+parse in its early-init; here we expose a
//     mutable object matching that shape, defaulting every field to -1 (the sentinel the
//     binary compares against with `cmpl $-1`).
//   * All floating-point math is single-precision — every store is `movss` or an imm32 that
//     represents a float32 — so we `Math.fround` on every write.
//
// Faithful-transcription note on getStudioPaddingPolicy:
//   The true branch @0x51c70 UNCONDITIONALLY OVERWRITES fields 0x28/0x30 AFTER the env-var
//   overrides at 0x51c3d..0x51c6d have executed. The env-var writes for
//   TEX_PADDING_{REMEMBRANCE,CUSHIONING,CLUMPING} land in a dead store on the studio path.
//   Transcribed as-is: the binary really does it this way.

/**
 * HG_RENDERER_ENV — process-wide int32 env-var overrides consulted by HGDefaultPolicies.
 * -1 = "not set; keep the compile-time default." Cited fields:
 *   - TEX_PADDING_REMEMBRANCE               @0x51c3d
 *   - TEX_PADDING_CUSHIONING                @0x51c4e
 *   - TEX_PADDING_CLUMPING                  @0x51c5f
 *   - MAX_TEXTURE_AGE_MS                    @0x51d1f
 *   - MAX_TEXTURE_POOL_SIZE_PERCENT         @0x51d48
 *   - MAX_TEXTURE_QUEUE_SIZE_PERCENT        @0x51d6b
 *   - MAX_TEXTURE_UNUSED_SIZE_PERCENT       @0x51d8e
 *   - MAX_TEXTURE_TOTAL_SIZE_PERCENT        @0x51db1
 *   - TEXTURE_POOL_STRATEGY                 @0x51dd4
 */
export const HG_RENDERER_ENV = {
  TEX_PADDING_REMEMBRANCE: -1 | 0,
  TEX_PADDING_CUSHIONING: -1 | 0,
  TEX_PADDING_CLUMPING: -1 | 0,
  MAX_TEXTURE_AGE_MS: -1 | 0,
  MAX_TEXTURE_POOL_SIZE_PERCENT: -1 | 0,
  MAX_TEXTURE_QUEUE_SIZE_PERCENT: -1 | 0,
  MAX_TEXTURE_UNUSED_SIZE_PERCENT: -1 | 0,
  MAX_TEXTURE_TOTAL_SIZE_PERCENT: -1 | 0,
  TEXTURE_POOL_STRATEGY: -1 | 0,
};

/**
 * "Rich" padding policy — produced when the `bool` arg to getStudioPaddingPolicy is true.
 * Sized 0x38 bytes (see `movl $0x38,%edi` @0x51bf2). v-ptr slot @0x51c07:
 *   `leaq 0x9b5bea(%rip), %rax` → RIP target = 0x51c0e + 0x9b5bea = 0x9c67f8.
 */
export interface HGPaddingPolicyRich {
  /** v-ptr @0x00; installed @0x51c0e; RIP disp 0x9b5bea → VPTR_STUDIO_PADDING_RICH. */
  vptr: number;
  /** self-pointer field @0x10 (`this + 0x10`); stored @0x51c18. Represented symbolically. */
  selfPtr10: "this+0x10";
  /** self-pointer field @0x18 (`this + 0x10`); stored @0x51c1c. */
  selfPtr18: "this+0x10";
  /** field @0x20 — u64 zero; stored @0x51c20. */
  qword20: bigint;
  /** field @0x28 — u64 pair; init 0x100000002 @0x51c28, final overwrite 0x400000020 @0x51c70. */
  pair28: bigint;
  /** field @0x30 — i32; init 0x4 @0x51c36, env override @0x51c6d, final overwrite 0x20 @0x51c7e. */
  dword30: number;
}

/**
 * "Empty" padding policy — produced when the `bool` arg is false. Sized 0x10 bytes
 * (see `movl $0x10,%edi` @0x51c87). v-ptr slot @0x51c9c:
 *   `leaq 0x9b5a05(%rip), %rax` → 0x51ca3 + 0x9b5a05 = 0x9c66a8.
 */
export interface HGPaddingPolicyEmpty {
  vptr: number;
}

export type HGPaddingPolicy = HGPaddingPolicyRich | HGPaddingPolicyEmpty;

/**
 * Studio pooling policy — sized 0x30 bytes (see `movl $0x30,%edi` @0x51ce4).
 * v-ptr slot @0x51d01: `leaq 0x9b5b80(%rip), %rax` → 0x51d08 + 0x9b5b80 = 0x9c6c88.
 *
 * Field layout:
 *   0x00 vptr
 *   0x08 HGObject base                (HGObject::HGObject() @0x51cf4)
 *   0x10 qword zero                   (stored @0x51cf9)
 *   0x18 maxTextureAgeMs           f32 (movaps @0x51d0b lane 0 = 1200.0f)
 *   0x1c maxTexturePoolSizeFrac    f32 (movaps lane 1 = 0.5f)
 *   0x20 maxTextureQueueSizeFrac   f32 (movaps lane 2 = 0.5f)
 *   0x24 maxTextureUnusedSizeFrac  f32 (movaps lane 3 = 0.5f)
 *   0x28 maxTextureTotalSizeFrac   f32 (imm 0x3f000000 = 0.5f, stored @0x51d17)
 *   0x2c poolStrategy              i32 (0 default; env override @0x51de2)
 */
export interface HGPoolingPolicy {
  vptr: number;
  maxTextureAgeMs: number;         // f32
  maxTexturePoolSizeFrac: number;  // f32
  maxTextureQueueSizeFrac: number; // f32
  maxTextureUnusedSizeFrac: number;// f32
  maxTextureTotalSizeFrac: number; // f32
  poolStrategy: number;            // i32
}

// Cited RIP-relative v-ptr target VAs (opaque HGObject subclasses).
export const VPTR_STUDIO_PADDING_RICH  = 0x9c67f8;  // @0x51c07 + 0x9b5bea
export const VPTR_STUDIO_PADDING_EMPTY = 0x9c66a8;  // @0x51c9c + 0x9b5a05
export const VPTR_STUDIO_POOLING       = 0x9c6c88;  // @0x51d01 + 0x9b5b80

// Float32 rounding helper (all stores are movss / imm f32).
const f = (x: number): number => Math.fround(x);

/**
 * HGDefaultPolicies::getStudioPaddingPolicy(unsigned long long unused-arg, bool useRich)
 *   @0x51be0
 *
 * The first arg (rsi) is never referenced after the prologue — preserved for parity.
 *   @0x51bea testl %edx,%edx ; @0x51bec je 0x51c87  — branch on useRich
 */
export function getStudioPaddingPolicy(_unused: bigint, useRich: boolean): HGPaddingPolicy {
  if (!useRich) {
    // false branch @0x51c87..0x51ca6
    //   new HGObject(0x10) @0x51c87..0x51c8c ; HGObject::HGObject() @0x51c97
    //   v-ptr @0x51c9c → VPTR_STUDIO_PADDING_EMPTY
    return { vptr: VPTR_STUDIO_PADDING_EMPTY };
  }

  // true branch @0x51bf2..0x51c85
  //   new HGObject(0x38) @0x51bf2..0x51bf7 ; HGObject::HGObject() @0x51c02
  const obj: HGPaddingPolicyRich = {
    vptr: VPTR_STUDIO_PADDING_RICH,       // v-ptr install @0x51c07..0x51c0e
    selfPtr10: "this+0x10",                // @0x51c18: *(this+0x10) = this+0x10
    selfPtr18: "this+0x10",                // @0x51c1c: *(this+0x18) = this+0x10
    qword20: 0n,                           // @0x51c20: *(this+0x20) = 0
    pair28: 0x0000000100000002n,           // @0x51c28..0x51c32
    dword30: 0x4 | 0,                      // @0x51c36
  };

  // Env overrides — landed BEFORE the unconditional final overwrite (dead store, faithful).
  const rem = HG_RENDERER_ENV.TEX_PADDING_REMEMBRANCE | 0;  // @0x51c3d..0x51c44 load
  if (rem !== -1) {
    // @0x51c4b movl %eax, 0x28(%rbx) — low 32 bits of the pair
    const low = BigInt(rem) & 0xffffffffn;
    obj.pair28 = (obj.pair28 & 0xffffffff00000000n) | low;
  }
  const cush = HG_RENDERER_ENV.TEX_PADDING_CUSHIONING | 0;  // @0x51c4e load
  if (cush !== -1) {
    // @0x51c5c movl %eax, 0x2c(%rbx) — high 32 bits of the pair
    const high = (BigInt(cush) & 0xffffffffn) << 32n;
    obj.pair28 = (obj.pair28 & 0x00000000ffffffffn) | high;
  }
  const clump = HG_RENDERER_ENV.TEX_PADDING_CLUMPING | 0;   // @0x51c5f load
  if (clump !== -1) {
    obj.dword30 = clump | 0;                                // @0x51c6d movl %eax, 0x30(%rbx)
  }

  // Unconditional final overwrite @0x51c70..0x51c7e:
  //   movabsq $0x400000020, %rax ; movq %rax, 0x28(%rbx) ; movl $0x20, 0x30(%rbx)
  obj.pair28 = 0x0000000400000020n;
  obj.dword30 = 0x20 | 0;
  // @0x51c85 jmp 0x51ca6 → return-thunk (@0x51ca6..0x51cb0)

  return obj;
}

/**
 * HGDefaultPolicies::getStudioPoolingPolicy(unsigned long long freeVramBytes, bool useTiered)
 *   @0x51cd0
 *
 * `freeVramBytes` (rsi → r15) is compared against 0x40000000 (1 GiB) and 0x7fffffff (2 GiB−1)
 * to select a tier. `useTiered` (edx → r12b) picks the tiered-vs-untiered code family.
 *
 * Full control flow, mirroring the binary:
 *   1. Zero-init the object; install v-ptr; movaps defaults [1200.0, 0.5, 0.5, 0.5] into
 *      0x18..0x24 @0x51d0b; imm 0x3f000000 (=0.5f) into 0x28 @0x51d17.
 *   2. Env overrides @0x51d1f..0x51de2:
 *        MAX_TEXTURE_AGE_MS: 0 → FLT_MAX const @0x3cb6b0; nonzero → cvtsi2ss.
 *        each *_PERCENT: cvtsi2ss ; mulss 0.01f const @0x3cb6b4 ; store.
 *        TEXTURE_POOL_STRATEGY: movl directly.
 *   3. Tier defaults @0x51de6..0x51f11 — each field is overwritten with a tier-specific
 *      hard-coded float ONLY IF its env variable was -1 (env-set values win).
 *
 * Tier table (verified against disassembly):
 *
 *   useTiered=true, freeVram ≤ 0x40000000 (LOW tier, @0x51df4..0x51ec6):
 *       total=0.25, unused=0.1, pool=0.1, queue=0.1
 *
 *   useTiered=true, freeVram > 0x40000000 (SHARED MID/HIGH, @0x51e58..0x51e70):
 *       total=0.5, unused=0.25, pool=0.25, queue=0.125
 *
 *   useTiered=false, freeVram ≤ 0x7fffffff (@0x51e1d..0x51e70):
 *       total=0.75, unused=0.25, pool=0.25, queue=0.125
 *
 *   useTiered=false, freeVram > 0x7fffffff (@0x51e7d..0x51f09):
 *       total=0.75, unused=0.5, pool=0.5, queue=0.425
 */
export function getStudioPoolingPolicy(freeVramBytes: bigint, useTiered: boolean): HGPoolingPolicy {
  // Prologue @0x51ce4..0x51d17
  const p: HGPoolingPolicy = {
    vptr: VPTR_STUDIO_POOLING,                       // @0x51d01..0x51d08
    maxTextureAgeMs: f(1200.0),                      // movaps lane 0 @0x51d0b (const @0x3cb690)
    maxTexturePoolSizeFrac: f(0.5),                  // movaps lane 1
    maxTextureQueueSizeFrac: f(0.5),                 // movaps lane 2
    maxTextureUnusedSizeFrac: f(0.5),                // movaps lane 3
    maxTextureTotalSizeFrac: f(0.5),                 // imm 0x3f000000 @0x51d17
    poolStrategy: 0 | 0,                             // implicit 0
  };

  // ── env overrides ──
  // MAX_TEXTURE_AGE_MS @0x51d1f..0x51d48
  const ageEnv = HG_RENDERER_ENV.MAX_TEXTURE_AGE_MS | 0;
  if (ageEnv !== -1) {
    if (ageEnv === 0) {
      // @0x51d31 movss const @0x3cb6b0 (=FLT_MAX ≈ 3.4028234663852886e+38f)
      p.maxTextureAgeMs = f(3.4028234663852886e+38);
    } else {
      // @0x51d3e cvtsi2ss int32 → f32
      p.maxTextureAgeMs = f(ageEnv);
    }
  }

  // Percent envs: cvtsi2ss ; mulss 0.01f const @0x3cb6b4 ; store.
  const poolPct   = HG_RENDERER_ENV.MAX_TEXTURE_POOL_SIZE_PERCENT   | 0;  // @0x51d48 → %ecx
  if (poolPct  !== -1) { p.maxTexturePoolSizeFrac   = f(f(poolPct)   * f(0.01)); } // @0x51d5d..0x51d65
  const queuePct  = HG_RENDERER_ENV.MAX_TEXTURE_QUEUE_SIZE_PERCENT  | 0;  // @0x51d6b → %eax
  if (queuePct !== -1) { p.maxTextureQueueSizeFrac  = f(f(queuePct)  * f(0.01)); } // @0x51d80..0x51d88
  const unusedPct = HG_RENDERER_ENV.MAX_TEXTURE_UNUSED_SIZE_PERCENT | 0;  // @0x51d8e → %edx
  if (unusedPct!== -1) { p.maxTextureUnusedSizeFrac = f(f(unusedPct) * f(0.01)); } // @0x51da3..0x51dab
  const totalPct  = HG_RENDERER_ENV.MAX_TEXTURE_TOTAL_SIZE_PERCENT  | 0;  // @0x51db1 → %esi
  if (totalPct !== -1) { p.maxTextureTotalSizeFrac  = f(f(totalPct)  * f(0.01)); } // @0x51dc6..0x51dce
  const strat = HG_RENDERER_ENV.TEXTURE_POOL_STRATEGY | 0;                 // @0x51dd4 → %edi
  if (strat !== -1) { p.poolStrategy = strat | 0; }                        // @0x51de2

  // ── tiered defaults @0x51de6..0x51f11 ──
  // @0x51de6 testb %r12b,%r12b ; @0x51de9 je 0x51e1d
  if (useTiered) {
    // @0x51deb cmpq $0x40000000, %r15 ; @0x51df2 ja 0x51e58
    if (freeVramBytes > 0x40000000n) {
      // SHARED MID/HIGH tier @0x51e58..0x51e70
      //   total unset → @0x51ed0 imm 0x3f000000 = 0.5
      //   unused unset → @0x51e38 imm 0x3e800000 = 0.25
      //   pool  unset → @0x51e45 imm 0x3e800000 = 0.25
      //   queue unset → @0x51e70 movss const @0x3ca9d4 = 0.125f (stored @0x51f11)
      if (totalPct  === -1) { p.maxTextureTotalSizeFrac  = f(0.5); }
      if (unusedPct === -1) { p.maxTextureUnusedSizeFrac = f(0.25); }
      if (poolPct   === -1) { p.maxTexturePoolSizeFrac   = f(0.25); }
      if (queuePct  === -1) { p.maxTextureQueueSizeFrac  = f(0.125); }
    } else {
      // LOW tier @0x51df4..0x51ec6
      //   total unset → @0x51e97 imm 0x3e800000 = 0.25
      //   unused unset → @0x51ea8 imm 0x3dcccccd = 0.1
      //   pool  unset → @0x51eb9 imm 0x3dcccccd = 0.1
      //   queue unset → @0x51ec6 movss const @0x3cb6cc = 0.1f (stored @0x51f11)
      if (totalPct  === -1) { p.maxTextureTotalSizeFrac  = f(0.25); }
      if (unusedPct === -1) { p.maxTextureUnusedSizeFrac = f(0.10000000149011612); }
      if (poolPct   === -1) { p.maxTexturePoolSizeFrac   = f(0.10000000149011612); }
      if (queuePct  === -1) { p.maxTextureQueueSizeFrac  = f(0.10000000149011612); }
    }
  } else {
    // @0x51e1d cmpq $0x7fffffff, %r15 ; @0x51e24 ja 0x51e7d
    if (freeVramBytes > 0x7fffffffn) {
      // ≥2 GiB path @0x51e7d..0x51f09
      //   total unset → @0x51ee2 imm 0x3f400000 = 0.75
      //   unused unset → @0x51eef imm 0x3f000000 = 0.5
      //   pool  unset → @0x51efc imm 0x3f000000 = 0.5
      //   queue unset → @0x51f09 movss const @0x3cb6c8 low = 0.425f (stored @0x51f11)
      if (totalPct  === -1) { p.maxTextureTotalSizeFrac  = f(0.75); }
      if (unusedPct === -1) { p.maxTextureUnusedSizeFrac = f(0.5); }
      if (poolPct   === -1) { p.maxTexturePoolSizeFrac   = f(0.5); }
      if (queuePct  === -1) { p.maxTextureQueueSizeFrac  = f(0.42500001192092896); }
    } else {
      // ≤2 GiB-1 path @0x51e26..0x51e70
      //   total unset → @0x51e2b imm 0x3f400000 = 0.75
      //   unused unset → @0x51e38 imm 0x3e800000 = 0.25
      //   pool  unset → @0x51e45 imm 0x3e800000 = 0.25
      //   queue unset → @0x51e70 movss const @0x3ca9d4 = 0.125f (stored @0x51f11)
      if (totalPct  === -1) { p.maxTextureTotalSizeFrac  = f(0.75); }
      if (unusedPct === -1) { p.maxTextureUnusedSizeFrac = f(0.25); }
      if (poolPct   === -1) { p.maxTexturePoolSizeFrac   = f(0.25); }
      if (queuePct  === -1) { p.maxTextureQueueSizeFrac  = f(0.125); }
    }
  }

  // @0x51f17 return p
  return p;
}

/** Namespace form matching the FCP C++ static-method call site. */
export const HGDefaultPolicies = {
  getStudioPaddingPolicy,
  getStudioPoolingPolicy,
};

export default HGDefaultPolicies;
