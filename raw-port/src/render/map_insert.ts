// map_insert.ts — Helium's file-local `map_insert(map_t*, size_t, size_t)`
// growable-array insert helper.
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// EXPORTED SYMBOL (this file):
//   @Helium 0x00000000000d58f0
//     map_insert(map_t*, unsigned long, unsigned long)
//     mangled: __ZL10map_insertP5map_tmm     (`__ZL` = internal linkage —
//              a `static` free function, so it has no owning C++ class)
//
// SOURCE DISASSEMBLY:
//   raw-port/re/disasm/Helium.__ZL10map_insertP5map_tmm.s (59 lines)
//
// TRANSLATION UNIT: the three symbols in this address range are
//   0xd58f0 __ZL10map_insertP5map_tmm       (this function)
//   0xd59a0 __ZL4itoaPci                    (static itoa)
//   0xd5bc0 __ZN3arbL7obj_addEPNS_8object_tEPKcmP8HGLimitsb  (arb::obj_add)
// i.e. Helium's `arb` object-tracking TU. Per the naming rule (a free
// function lives in a file named after itself), this file holds exactly one
// symbol: `map_insert`.
//
// ═══════════════════════════════════════════════════════════════════════════
// STRUCT LAYOUT — map_t (24 bytes)
// ═══════════════════════════════════════════════════════════════════════════
//
//   +0x00  void*   data       element storage, grown with `realloc`
//   +0x08  size_t  count      number of live elements
//   +0x10  size_t  capacity   number of elements the storage can hold
//
//   Recovered entirely from this function: +0x00 is the pointer handed to
//   `realloc` @0xd592c and re-stored @0xd5931; +0x08 is loaded @0xd58fd,
//   compared against +0x10, clamped @0xd5941 and incremented @0xd597d;
//   +0x10 is loaded @0xd5901 and re-stored with the rounded-up capacity
//   @0xd5921.
//
//   sizeof(element) == 0x58 (88 bytes) — every address computation scales by
//   `imulq $0x58` (@0xd5925 for the realloc byte count, @0xd595a / @0xd596a
//   for the memmove operands, @0xd5981 for the returned slot address).
//
// ═══════════════════════════════════════════════════════════════════════════
// DECODE OF map_insert @0xd58f0 (AT&T, dst-src arithmetic)
// ═══════════════════════════════════════════════════════════════════════════
//
//   Arguments: %rdi = m, %rsi = idx, %rdx = (THIRD ARGUMENT, UNUSED).
//     The third `unsigned long` parameter is never read: %rdx is clobbered
//     at 0xd5901 by `movq 0x10(%rdi), %rdx` before any use. Transcribed as an
//     ignored parameter so the signature still matches the mangled symbol.
//   Register roles: %rbx = idx, %r14 = m.
//
//   d58fd  movq 0x8(%rdi), %rcx        rcx = m->count
//   d5901  movq 0x10(%rdi), %rdx       rdx = m->capacity  (clobbers arg3)
//   d5905  leaq 0x1(%rcx), %rax        rax = count + 1
//   d5909  cmpq %rdx, %rax             flags from (count + 1) - capacity
//   d590c  jbe  0xd594f                CF|ZF -> count+1 <= capacity (UNSIGNED)
//                                      -> NO-GROW
//   ── GROW (count + 1 > capacity) ──────────────────────────────────────────
//   d590e  movq %rcx, %rsi             rsi = count
//   d5911  andq $-0x10, %rsi           rsi = count & ~15
//   d5915  addq $0x10, %rsi            rsi = newCap = (count & ~15) + 16
//   d5919  movq (%r14), %rax           rax = m->data
//   d591c  cmpq %rsi, %rdx             flags from capacity - newCap
//   d591f  je   0xd5952                capacity already == newCap -> no realloc
//                                      (unreachable for any non-overflowing
//                                       count, since count < (count&~15)+16
//                                       always — transcribed anyway)
//   d5921  movq %rsi, 0x10(%r14)       m->capacity = newCap   (BEFORE realloc)
//   d5925  imulq $0x58, %rsi, %rsi     rsi = newCap * 88 bytes
//   d5929  movq %rax, %rdi             rdi = old m->data
//   d592c  callq _realloc              rax = realloc(m->data, newCap * 88)
//   d5931  movq %rax, (%r14)           m->data = result (NO null check)
//   d5934  movq 0x8(%r14), %rdx        rdx = m->count      (re-read)
//   d5938  movq 0x10(%r14), %rcx       rcx = m->capacity   (re-read)
//   d593c  cmpq %rcx, %rdx             flags from count - capacity
//   d593f  jbe  0xd5990                count <= capacity -> 0xd5990
//   d5941  movq %rcx, 0x8(%r14)        CLAMP: m->count = capacity
//   d5945  movq %rcx, %rdx             rdx = capacity (the clamped count)
//   d5948  subq %rbx, %rdx             rdx = cnt - idx
//   d594b  ja   0xd595a                cnt > idx (UNSIGNED) -> MEMMOVE
//   d594d  jmp  0xd597a                -> INCREMENT
//   d5990  movq %rdx, %rcx             rcx = cnt = count (already <= capacity)
//   d5993  movq %rcx, %rdx
//   d5996  subq %rbx, %rdx             rdx = cnt - idx
//   d5999  ja   0xd595a                cnt > idx -> MEMMOVE
//   d599b  jmp  0xd597a                -> INCREMENT
//   ── NO-GROW ──────────────────────────────────────────────────────────────
//   d594f  movq (%r14), %rax           rax = m->data
//   d5952  movq %rcx, %rdx             rdx = cnt = count
//   d5955  subq %rbx, %rdx             rdx = cnt - idx
//   d5958  jbe  0xd597a                cnt <= idx -> INCREMENT (no shift)
//   ── MEMMOVE: open a hole at `idx` ────────────────────────────────────────
//   d595a  imulq $0x58, %rbx, %rcx     rcx = idx * 88
//   d595e  leaq (%rax,%rcx), %rsi      src = data + idx*88
//   d5962  leaq (%rax,%rcx), %rdi
//   d5966  addq $0x58, %rdi            dst = data + (idx + 1)*88
//   d596a  imulq $0x58, %rdx, %rdx     n   = (cnt - idx) * 88
//   d596e  callq _memmove              memmove(dst, src, n)
//   d5973  movq (%r14), %rax           rax = m->data       (re-read)
//   d5976  movq 0x8(%r14), %rcx        rcx = m->count      (re-read)
//   ── INCREMENT + return the opened slot ───────────────────────────────────
//   d597a  incq %rcx                   cnt + 1
//   d597d  movq %rcx, 0x8(%r14)        m->count = cnt + 1
//   d5981  imulq $0x58, %rbx, %rcx     rcx = idx * 88
//   d5985  addq %rax, %rcx             rcx = m->data + idx*88
//   d5988  movq %rcx, %rax             return that pointer
//
//   Every path arriving at 0xd597a has %rax == the CURRENT m->data and
//   %rcx == the CURRENT m->count, so the reload at 0xd5973/0xd5976 is
//   value-identical to the register state on the non-memmove paths.
//
// ── Callees ─────────────────────────────────────────────────────────────────
//   ZERO in-scope callees (`depgraph.py deps __ZL10map_insertP5map_tmm`
//   prints nothing). Both `callq`s are TRUE out-of-scope libc externs reached
//   through symbol stubs:
//     _realloc  @stub 0x3c55ca
//     _memmove  @stub 0x3c543e
//   No indirect or virtual calls anywhere in the body.
//
// ── END DECODE ──────────────────────────────────────────────────────────────

/**
 * `sizeof(map_t element)` == 0x58 == 88 bytes — the scale factor of every
 * `imulq $0x58` in the body.
 *
 * @Helium 0x00000000000d5925  (`imulq $0x58, %rsi, %rsi` — realloc byte count)
 */
export const MAP_ENTRY_SIZE = 0x58;

/**
 * The capacity-rounding mask and step: `andq $-0x10` then `addq $0x10`, i.e.
 * capacity grows to `(count & ~15) + 16` elements.
 *
 * @Helium 0x00000000000d5911  (`andq $-0x10, %rsi`)
 * @Helium 0x00000000000d5915  (`addq $0x10, %rsi`)
 */
const MAP_GROW_MASK: bigint = ~0xfn;
const MAP_GROW_STEP: bigint = 0x10n;

/** u64 wrap mask — every pointer/count op in the body is 64-bit modular. */
// @Helium 0x00000000000d5905 (`leaq 0x1(%rcx), %rax`) / 0x00000000000d597a (`incq`)
const U64_MASK: bigint = 0xffffffffffffffffn;

/**
 * `map_t` — Helium's file-local growable array of 88-byte records.
 *
 * The element payload is NOT decoded here: this function only ever moves and
 * counts whole 0x58-byte records, never inspects their fields. Modelling the
 * storage as a flat `Uint8Array` keeps that byte-exact, so `realloc`'s
 * reallocation and `memmove`'s overlapping shift both have direct
 * counterparts (allocate-and-copy, and `copyWithin`).
 *
 * @Helium 0x00000000000d58f0  (layout recovered from this function)
 */
export interface map_t {
  /**
   * +0x00 — the `realloc`-managed element block, `capacity * 0x58` bytes.
   * `null` models a null `void*` (the state a fresh `map_t` starts in, and
   * what `realloc` would return on failure — the binary does not check).
   */
  data: Uint8Array | null;
  /** +0x08 — live element count. */
  count: bigint;
  /** +0x10 — element capacity of {@link data}. */
  capacity: bigint;
}

/**
 * `map_insert(map_t* m, unsigned long idx, unsigned long)` —
 *   @Helium 0x00000000000d58f0   (mangled __ZL10map_insertP5map_tmm)
 *
 * Opens a hole for one 88-byte element at position `idx`, growing the storage
 * to `(count & ~15) + 16` elements first if `count + 1` would exceed the
 * capacity, shifting the `count - idx` trailing elements up by one slot, and
 * bumping `count`. The freshly-opened slot is returned UNINITIALISED — the
 * caller fills it.
 *
 * Faithful line-for-line transcription of the 59-line disassembly documented
 * above. No in-scope callees; the only calls are the out-of-scope `_realloc`
 * and `_memmove` libc externs.
 *
 * @param m    `%rdi` — the map.
 * @param idx  `%rsi` — the insertion position, in elements.
 * @param _unusedArg3 `%rdx` — the declared third `unsigned long` parameter.
 *        NEVER READ: `movq 0x10(%rdi), %rdx` @0xd5901 clobbers it before any
 *        use. Kept so the TS signature matches the mangled symbol.
 * @returns the native `%rax`, expressed as a BYTE OFFSET into {@link map_t.data}.
 *          The binary returns the absolute pointer `m->data + idx * 0x58`; in
 *          this model the base is `m.data`, so the offset is the portable
 *          equivalent. Like the C pointer, it is invalidated by any later
 *          call that reallocates `m.data`.
 */
export function map_insert(
  m: map_t,
  idx: bigint,
  _unusedArg3: bigint,
): number {
  // @0xd58f7 / 0xd58fa: rbx = idx, r14 = m.
  const idxU = idx & U64_MASK;

  // @0xd58fd: rcx = m->count.
  const count = m.count & U64_MASK;
  // @0xd5901: rdx = m->capacity  (this is what clobbers the third argument).
  const capacity = m.capacity & U64_MASK;

  // `cnt` tracks %rcx across the join at 0xd597a; `data` tracks %rax.
  let cnt: bigint;
  let data: Uint8Array | null;

  // @0xd5905-0xd590c: cmpq %rdx, %rax ; jbe — UNSIGNED (count + 1) vs capacity.
  if (((count + 1n) & U64_MASK) > capacity) {
    // ── GROW ────────────────────────────────────────────────────────────────
    // @0xd590e-0xd5915: newCap = (count & ~15) + 16.
    const newCap = ((count & MAP_GROW_MASK) + MAP_GROW_STEP) & U64_MASK;
    // @0xd5919: rax = m->data.
    data = m.data;

    // @0xd591c-0xd591f: cmpq %rsi, %rdx ; je — skip the realloc when the
    //   capacity is already exactly newCap.
    if (capacity === newCap) {
      // Falls into 0xd5952 with %rcx still holding the entry `count`.
      cnt = count;
    } else {
      // @0xd5921: m->capacity = newCap  (stored BEFORE the realloc).
      m.capacity = newCap;
      // @0xd5925-0xd5931: realloc(m->data, newCap * 0x58) ; m->data = result.
      //   `_realloc` is a TRUE out-of-scope libc extern (@stub 0x3c55ca).
      //   Modelled as allocate-new + copy-the-overlap, which is realloc's
      //   observable contract. NOTE: realloc leaves the grown tail
      //   UNINITIALISED whereas a fresh Uint8Array is zero-filled — the extra
      //   bytes are the slot this call is opening, which the caller
      //   overwrites, so no decoded value depends on the difference.
      const newByteLen = Number((newCap * BigInt(MAP_ENTRY_SIZE)) & U64_MASK);
      const grown = new Uint8Array(newByteLen);
      if (data !== null) {
        const keep = data.length < newByteLen ? data.length : newByteLen;
        grown.set(data.subarray(0, keep));
      }
      m.data = grown;
      // @0xd5931: rax = the new m->data.
      data = grown;

      // @0xd5934-0xd5938: re-read count and capacity from memory.
      const count2 = m.count & U64_MASK;
      const cap2 = m.capacity & U64_MASK;
      // @0xd593c-0xd593f: cmpq %rcx, %rdx ; jbe — UNSIGNED count vs capacity.
      if (count2 > cap2) {
        // @0xd5941-0xd5945: CLAMP — m->count = capacity; cnt = capacity.
        m.count = cap2;
        cnt = cap2;
      } else {
        // @0xd5990: rcx = rdx — cnt = the re-read count.
        cnt = count2;
      }
    }
  } else {
    // ── NO-GROW @0xd594f ────────────────────────────────────────────────────
    // @0xd594f: rax = m->data.
    data = m.data;
    // @0xd5952: rdx = rcx — cnt = count.
    cnt = count;
  }

  // @0xd5948 / 0xd5955 / 0xd5996: rdx = cnt - idx, then `ja` / `jbe` —
  //   the shift runs only when cnt > idx (UNSIGNED).
  if (cnt > idxU) {
    // ── MEMMOVE @0xd595a-0xd596e ────────────────────────────────────────────
    if (data === null) {
      // The binary computes `data + idx*0x58` and hands it to memmove with a
      // non-zero length; a null block here would be C++ undefined behaviour.
      // Do not fabricate storage. @Helium 0xd595e
      throw new Error(
        "map_insert(): m->data is null while shifting " +
          String(cnt - idxU) +
          " element(s); `leaq (%rax,%rcx), %rsi` @Helium 0xd595e forms " +
          "m->data + idx*0x58 and passes it to memmove unconditionally, so a " +
          "null block is undefined behaviour. @Helium 0xd58f0",
      );
    }
    // @0xd595a: rcx = idx * 0x58.
    const srcOff = Number((idxU * BigInt(MAP_ENTRY_SIZE)) & U64_MASK);
    // @0xd5962-0xd5966: dst = data + idx*0x58 + 0x58.
    const dstOff = srcOff + MAP_ENTRY_SIZE;
    // @0xd596a: n = (cnt - idx) * 0x58.
    const n = Number((((cnt - idxU) & U64_MASK) * BigInt(MAP_ENTRY_SIZE)) & U64_MASK);
    // @0xd596e: memmove(dst, src, n) — TRUE out-of-scope libc extern
    //   (@stub 0x3c543e). `copyWithin` has memmove's overlap semantics.
    data.copyWithin(dstOff, srcOff, srcOff + n);
    // @0xd5973-0xd5976: re-read m->data and m->count.
    data = m.data;
    cnt = m.count & U64_MASK;
  }

  // ── INCREMENT @0xd597a-0xd5988 ────────────────────────────────────────────
  // @0xd597a-0xd597d: m->count = cnt + 1.
  m.count = (cnt + 1n) & U64_MASK;
  // @0xd5981-0xd5988: return m->data + idx * 0x58.
  return Number((idxU * BigInt(MAP_ENTRY_SIZE)) & U64_MASK);
}
