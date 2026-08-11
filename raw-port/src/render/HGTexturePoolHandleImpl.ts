// HGTexturePoolHandleImpl.ts — FCP Helium `HGTexturePoolHandleImpl`.
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// EXPORTED SYMBOLS (this file):
//   @Helium 0x00000000000440e0  HGTexturePoolHandleImpl::end()
//     mangled: __ZN23HGTexturePoolHandleImpl3endEv
//     Returns the end-iterator into the deque-shaped bucketed container
//     owned indirectly by this handle. Element size is 96 bytes and the
//     bucket width is 42 elements (block stride = 96*42 = 4032 bytes).
//
// SOURCE DISASSEMBLY (in this worktree's raw-port/re/disasm/):
//   Helium.HGTexturePoolHandleImpl.end.s (@0x440e0..0x4412c)
//
// No same-framework callees. The body is pure arithmetic + one memory
// dereference chain (this -> owner -> map slot), so there is nothing to
// import from other ports.
//
// ── STRUCT LAYOUT — recovered from the decode of end() ────────────────────
//
//   `this` (HGTexturePoolHandleImpl) has, at least:
//     +0x18  owner  : Owner*    // dereferenced immediately at end() entry
//
//   The Owner type looks like a std::deque-shaped bucketed container. From
//   the loads used to compute end() we know these fields exist:
//     +0x58  mapBegin  : Element** // map (array of bucket pointers)
//     +0x60  mapEnd    : Element** // one-past-end of the map array
//     +0x70  countA    : u64       // paired size counters — sum = element count
//     +0x78  countB    : u64
//
//   Element stride is 96 bytes (0x60), block width is 42 elements
//   (bucket-stride = 96 * 42 = 0xFC0 bytes), both proven by the magic
//   constant / shift-and-mul division in the decode below.
//
//   The end-iterator return type is 16 bytes and comes back in the
//   rax:rdx register pair. From the register that carries each half we
//   can name the two fields:
//     iterator {
//       blockSlot : Element**   // rax  = &map[bucket]
//       elementPtr: Element*    // rdx  = *blockSlot + (index % 42) * 96
//     }
//   `blockSlot` is the map iterator (points into the map array); `elementPtr`
//   is the current element pointer inside the addressed bucket. (Field names
//   `blockSlot`/`elementPtr` are chosen locally; the underlying std::deque-
//   like layout is not yet grounded against a header.)
//
// ── DECODE OF end() @0x440e0 (AT&T, dst-src arithmetic) ───────────────────
//
//   Registers on entry (SysV x86_64, member fn):
//     rdi = this
//
//   Line-by-line:
//     440e4  movq  0x18(%rdi), %rsi          rsi = this->owner
//     440e8  movq  0x70(%rsi), %rcx          rcx = owner.countA
//     440ec  addq  0x78(%rsi), %rcx          rcx = countA + countB  = N (total count)
//     440f0  movq  %rcx, %rax                rax = N
//     440f3  shrq  %rax                      rax = N >> 1              (i.e. N / 2, unsigned)
//     440f6  movabsq $-0x3cf3cf3cf3cf3cf3, %rdx    rdx = 0xC30C30C30C30C30D
//                                                ^ magic constant for unsigned div by 21
//     44100  mulq  %rdx                      rdx:rax = rax * rdx  (rdx = high 64 bits)
//     44103  shrq  $0x4, %rdx                rdx = ((N/2) * 0xC30C..30D) >> 68  = (N/2) / 21
//                                                = N / 42   (integer, unsigned)
//     44107  movq  0x58(%rsi), %rdi          rdi = owner.mapBegin  (map ptr)
//     4410b  leaq  (%rdi,%rdx,8), %rax       rax = &mapBegin[bucket] = blockSlot (return.lo)
//     4410f  cmpq  %rdi, 0x60(%rsi)          compare (mapEnd - mapBegin)   (owner.mapEnd == mapBegin ?)
//     44113  je    0x44129                   if empty (mapEnd == mapBegin) -> take shortcut
//
//     Not-empty tail (the common case):
//     44115  imulq $0x2a, %rdx, %rdx         rdx = bucket * 42
//     44119  subq  %rdx, %rcx                rcx = N - bucket*42  = N % 42     (index-in-bucket)
//     4411c  leaq  (%rcx,%rcx,2), %rdx       rdx = (N%42) * 3
//     44120  shlq  $0x5, %rdx                rdx = (N%42) * 96                 (elemStride = 96)
//     44124  addq  (%rax), %rdx              rdx = *blockSlot + offset
//                                                = mapBegin[bucket] + (N%42)*96 = elementPtr
//     44127..44128  return                   rax = blockSlot, rdx = elementPtr
//
//     Empty tail (mapEnd == mapBegin):
//     44129  xorl  %edx, %edx                rdx = 0
//     4412b..4412c  return                   rax = &mapBegin[bucket] (still), rdx = null
//                                              (with N == 0 in the reachable empty case,
//                                               bucket = 0 so rax == mapBegin == mapEnd.)
//
// ── END DECODE ────────────────────────────────────────────────────────────

/**
 * Deque-shaped bucketed container owner (as seen through the small window
 * `end()` needs). The fields listed here are the ones actually loaded at
 * @0x440e8/0x440ec/0x44107/0x4410f; other offsets exist in the real struct
 * but are not exercised by this method.
 *
 * @Helium 0x00000000000440e0 (layout recovered from `end()`)
 */
export interface HGTexturePoolHandleImpl_Owner {
  /** +0x58 — mapBegin: pointer to the first slot of the map (array of
   *  block pointers). Modelled as an array here. */
  mapBegin: Array<Uint8Array | null>;
  /** +0x60 — mapEnd: one-past-end of the map. Only ever compared as a
   *  pointer against mapBegin to detect "empty map" in `end()`. */
  mapEnd: Array<Uint8Array | null>;
  /** +0x70 — first size counter. */
  countA: bigint;
  /** +0x78 — second size counter. `end()` uses countA + countB as N. */
  countB: bigint;
}

/**
 * `HGTexturePoolHandleImpl` — only the +0x18 owner slot is decoded here;
 * additional fields will be added as they are grounded from other methods.
 *
 * @Helium 0x00000000000440e0 (layout recovered from `end()`)
 */
export interface HGTexturePoolHandleImpl {
  /** +0x18 — the deque-shaped container this handle iterates. */
  owner: HGTexturePoolHandleImpl_Owner;
}

/**
 * End-iterator returned by `HGTexturePoolHandleImpl::end()`. 16-byte
 * struct returned in the rax:rdx register pair (rax = blockSlot,
 * rdx = elementPtr).
 *
 * @Helium 0x00000000000440e0
 */
export interface HGTexturePoolHandleImpl_EndIterator {
  /** rax on return — `&mapBegin[bucket]`, i.e. a pointer into the map
   *  array. Represented here as {map, index} to survive TypeScript's lack
   *  of raw pointer arithmetic. */
  blockSlot: { map: Array<Uint8Array | null>; index: number };
  /** rdx on return — `mapBegin[bucket] + (N%42) * 96`, i.e. a pointer to
   *  the specific 96-byte element inside the addressed bucket. `null` when
   *  the container is empty (the mapEnd==mapBegin branch of the decode). */
  elementPtr: { block: Uint8Array; byteOffset: number } | null;
}

// Element stride (bytes) — proven by `leaq (%rcx,%rcx,2), %rdx; shlq $0x5, %rdx`
// at 4411c/44120 (×3 then ×32 = ×96).
// @Helium 0x000000000004411c
const ELEMENT_STRIDE: bigint = 96n;

// Bucket width (elements per block) — proven by `imulq $0x2a, %rdx, %rdx`
// at 44115 and by the 0xC30C..30D unsigned-div-by-21 magic-mul at 440f6/44100.
// The pair `(rcx>>1) * 0xC30C30C30C30C30D >> (64+4)` computes `(N/2)/21 = N/42`.
// @Helium 0x0000000000044115
const BUCKET_WIDTH: bigint = 42n;

const U64_MASK: bigint = 0xffffffffffffffffn;
const u64add = (x: bigint, y: bigint): bigint => (x + y) & U64_MASK;

/**
 * `HGTexturePoolHandleImpl::end()` — return the end-iterator into the
 * deque-shaped bucketed container owned by `this->owner` (+0x18).
 *
 * The iterator is a 2-field {blockSlot, elementPtr} pair returned in
 * rax:rdx by the binary. When the container's map is empty
 * (mapEnd == mapBegin), the binary short-circuits with `elementPtr = 0`
 * and leaves `blockSlot` at &mapBegin[bucket]; we preserve that behaviour.
 *
 * @Helium 0x00000000000440e0
 *   mangled: __ZN23HGTexturePoolHandleImpl3endEv
 *   demangled: HGTexturePoolHandleImpl::end()
 */
export function HGTexturePoolHandleImpl_end(
  self: HGTexturePoolHandleImpl,
): HGTexturePoolHandleImpl_EndIterator {
  // 440e4: rsi = this->owner
  const owner = self.owner;

  // 440e8..440ec: rcx = countA + countB = N (total element count, u64 add mod 2^64).
  const N: bigint = u64add(owner.countA, owner.countB);

  // 440f0..44103: bucket = N / 42 (unsigned). The binary does this as
  //   ((N >> 1) * 0xC30C30C30C30C30D) high 64 bits, then >> 4
  //   ==  (N/2) / 21  ==  N / 42.
  // We evaluate the identity directly since bigint gives us the same result
  // and there is no defined observable difference on non-negative N.
  const bucket: bigint = N / BUCKET_WIDTH;

  // 44107: mapBegin (map[]) pointer.
  const map = owner.mapBegin;

  // 4410b: rax = &map[bucket]  =>  blockSlot = { map, index: bucket }.
  // JS number is fine here: bucket is bounded by owner.countA+countB
  // (a plausible element count), well below 2^53 in practice.
  const blockSlot = { map, index: Number(bucket) };

  // 4410f..44113: if (mapEnd == mapBegin) -> empty branch.
  //   The binary compares raw pointer equality of `owner.mapEnd` and
  //   `owner.mapBegin`. In this port both are the same JS Array
  //   reference when the map is empty (mapEnd is either the same array
  //   used with an implicit "end index" of 0, or aliased to mapBegin).
  //   The strictly faithful check is object identity of the map array.
  if (owner.mapEnd === owner.mapBegin) {
    // 44129..4412c: return { rax = blockSlot, rdx = 0 }.
    return { blockSlot, elementPtr: null };
  }

  // 44115..44119: rcx = N - bucket*42 = N % 42 (index within bucket).
  const indexInBucket: bigint =
    (N - bucket * BUCKET_WIDTH) & U64_MASK;

  // 4411c..44120: offset = (N % 42) * 96 bytes.
  const offset: bigint = (indexInBucket * ELEMENT_STRIDE) & U64_MASK;

  // 44124: rdx = *blockSlot + offset  =>  elementPtr into the addressed bucket.
  //   The binary unconditionally dereferences `*blockSlot` here (the map
  //   slot at [bucket]) and byte-adds the offset. We model that with a
  //   direct array read; a null bucket in the not-empty branch would be
  //   an invariant break in the container and the binary would fault, so
  //   we let TS raise on it too (do not paper over with a fallback).
  const block: Uint8Array = map[Number(bucket)] as Uint8Array;

  return {
    blockSlot,
    elementPtr: { block, byteOffset: Number(offset) },
  };
}

/**
 * `HGTexturePoolHandleImpl::empty()` — @Helium 0x0000000000044060
 *   `__ZN23HGTexturePoolHandleImpl5emptyEv`  (file-local, `nm` class `t`)
 *
 * FULL DISASM (the entire function, 0x44060..0x44071):
 *
 *   0x44060  pushq %rbp                ; frame prologue
 *   0x44061  movq  %rsp, %rbp
 *   0x44064  movq  0x18(%rdi), %rax    ; rax = this->owner            (+0x18)
 *   0x44068  cmpq  $0x0, 0x78(%rax)    ; AT&T: flags = owner[+0x78] - 0
 *   0x4406d  sete  %al                 ; al = (owner[+0x78] == 0)
 *   0x44070  popq  %rbp
 *   0x44071  retq
 *   0x44072  nopw  %cs:(%rax,%rax)     ; padding to the 0x44080 boundary where
 *                                      ; HGTexturePoolHandleImpl::size() begins
 *
 * Note what is NOT there: no null check on `this->owner`, and — importantly for
 * anyone reading the `end()` transcription above — **only +0x78 is consulted**.
 * The immediate sibling `HGTexturePoolHandleImpl::size()` @0x44080 is
 * `movq 0x18(%rdi),%rax ; movq 0x78(%rax),%rax ; retq`, i.e. it returns that
 * same qword and nothing else, so +0x78 IS the container's element count on its
 * own. (`end()` @0x440e0 additionally reads +0x70, which `begin()` @0x44090
 * shows being magic-divided by 42 — the libc++ deque start offset — so the two
 * fields play different roles. This unit does not change `end()`; the
 * observation is recorded here because the +0x78 doc comment above predates it.)
 *
 * `sete` writes only %al, the low byte, which is exactly the C++ `bool` ABI.
 *
 * ORACLE: raw-port/re/oracle/HGTexturePoolHandleImpl_empty_oracle.py — the live
 * Helium symbol is called (it is local, so at dyld slide + 0x44060) on real
 * poisoned arenas, over a sweep of counts, with the +0x78 offset probed for
 * sensitivity and its neighbours probed for INsensitivity, so a port reading the
 * wrong field could not pass.
 *
 * @param impl the `this` pointer (%rdi)
 * @returns `true` when the owner's +0x78 element count is zero
 */
export function HGTexturePoolHandleImpl_empty(impl: HGTexturePoolHandleImpl): boolean {
  // 0x44064: rax = this->owner (+0x18). The binary dereferences it with no null
  // check, so a null owner faults there; TS raises here for the same reason.
  const owner: HGTexturePoolHandleImpl_Owner = impl.owner;
  // 0x44068/0x4406d: sete on `owner[+0x78] == 0`.
  return owner.countB === 0n;
}
