// HGAllocAlign.ts — Ozone framework, file-static free function
// `HGAllocAlign(unsigned long)` (internal linkage — the `L` in the mangled
// name). Its own file named after the function, per the PORTING_SPEC naming
// rule for free functions.
//
// It is the classic "over-allocate, align up, stash the real base just below
// the returned pointer" aligned allocator: hand back a 32-byte-aligned block
// of `size` bytes carved out of one `operator new[]` allocation, with the
// original allocation's address written into the 8 bytes immediately before
// the pointer the caller sees, so the matching free can recover it.
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//         Versions/A/Ozone  (macOS FCP, x86_64 slice; VAs unadjusted, as
//         printed by otool -tV).
//
// -----------------------------------------------------------------------------
// SYMBOL PORTED IN THIS UNIT
// -----------------------------------------------------------------------------
//   * HGAllocAlign(unsigned long)                @Ozone 0x688df0
//     __ZL12HGAllocAlignm
//
// re/disasm:
//   raw-port/re/disasm/__ZL12HGAllocAlignm.s
//
// Contract evidence (read for grounding, NOT ported here — its own ledger unit,
// still `todo`):
//   raw-port/re/disasm/__ZL11HGFreeAlignPv.s     @Ozone 0x688ea0
//
// -----------------------------------------------------------------------------
// FULL DISASM (29 real insns, @0x688df0..0x688e55; 0x688e56 is padding)
// -----------------------------------------------------------------------------
// Built at -O0, so every temporary round-trips through a stack slot. The four
// slots, named for what they hold:
//   -0x08  size    (the incoming argument)
//   -0x10  raw     (the byte count handed to operator new[])
//   -0x20  base    (operator new[]'s return value)
//   -0x28  p       (base + 8, the first candidate user pointer)
//   -0x18  aligned (p rounded up to a 32-byte boundary; the return value)
//
//   __ZL12HGAllocAlignm:
//     0x688df0  pushq %rbp
//     0x688df1  movq  %rsp, %rbp
//     0x688df4  subq  $0x30, %rsp
//     0x688df8  movq  %rdi, -0x8(%rbp)       ; size = arg
//     0x688dfc  movq  -0x8(%rbp), %rax
//     0x688e00  addq  $0x8, %rax             ; += 8    (room for the stashed base)
//     0x688e04  addq  $0x1f, %rax            ; += 0x1f (worst-case align-up slack)
//     0x688e08  movq  %rax, -0x10(%rbp)      ; raw = size + 8 + 0x1f
//     0x688e0c  movq  -0x10(%rbp), %rdi
//     0x688e10  callq 0x6dfc96               ## symbol stub for: __Znam
//                                            ; base = ::operator new[](raw)
//     0x688e15  movq  %rax, -0x20(%rbp)
//     0x688e19  movq  -0x20(%rbp), %rax
//     0x688e1d  addq  $0x8, %rax
//     0x688e21  movq  %rax, -0x28(%rbp)      ; p = base + 8
//     0x688e25  movq  -0x28(%rbp), %rax      ; rax = p
//     0x688e29  movq  -0x28(%rbp), %rcx      ; rcx = p
//     0x688e2d  xorq  $-0x1, %rcx            ; rcx = ~p
//     0x688e31  addq  $0x1, %rcx             ; rcx = ~p + 1 = -p   (two's complement)
//     0x688e35  andq  $0x1f, %rcx            ; rcx = (-p) & 31     = pad-to-32
//     0x688e39  addq  %rcx, %rax             ; rax = p + pad
//     0x688e3c  movq  %rax, -0x18(%rbp)      ; aligned = p + ((-p) & 31)
//     0x688e40  movq  -0x20(%rbp), %rcx      ; rcx = base
//     0x688e44  movq  -0x18(%rbp), %rax      ; rax = aligned
//     0x688e48  movq  %rcx, -0x8(%rax)       ; *(u64*)(aligned - 8) = base
//     0x688e4c  movq  -0x18(%rbp), %rax      ; return aligned
//     0x688e50  addq  $0x30, %rsp
//     0x688e54  popq  %rbp
//     0x688e55  retq
//     0x688e56  nopw  %cs:(%rax,%rax)        ; padding, not code
//
// WHY THE ALIGN-UP IS EXACTLY `(-p) & 31`: the `xorq $-1 ; addq $1` pair is the
// compiler's open-coded two's-complement negation, and `(-p) mod 32` is the
// number of bytes from `p` up to the next multiple of 32 (zero when `p` is
// already aligned). So `aligned = p + ((-p) & 31)` rounds UP to 32, never down,
// and moves the pointer by at most 0x1f — which is precisely the 0x1f of slack
// reserved at @0x688e04. The +8 at @0x688e00 covers the stashed base word.
// Total slack 8 + 0x1f is therefore exactly sufficient, and never more: after
// the align-up, `aligned + size <= base + raw` always holds.
//
// WHY THE STASH IS AT `aligned - 8`: confirmed by the matching deallocator,
// `HGFreeAlign(void*)` @Ozone 0x688ea0, which does exactly the inverse —
//     0x688eb8  movq -0x8(%rax), %rax        ; base = *(u64*)(p - 8)
//     0x688ec0  cmpq $0x0, %rax ; je 0x688ecf ; skip if null
//     0x688eca  callq 0x6dfc36               ## symbol stub for: __ZdlPv
// — reading the same slot and passing it to `::operator delete`. (Note the
// asymmetry the binary really has: the block is allocated with `new[]`
// (`__Znam`) but released with scalar `operator delete` (`__ZdlPv`), not
// `delete[]`. That is transcribed, not corrected; HGFreeAlign is its own unit.)
//
// -----------------------------------------------------------------------------
// WHY ::operator new[] IS MODELLED HERE AND NOT THROWN
// -----------------------------------------------------------------------------
// `__Znam` @0x688e10 is the function's only extern, and it sits on the ONLY
// path through the body — there is no branch. Throwing on it would make the
// whole unit unreachable, i.e. it would claim an undecoded gap where the
// decode is in fact complete; `classify_disasm` reads this body as REAL
// (1 store, 5 compute, 8 loads, 1 direct call), and an incompleteness throw
// over a REAL disasm is a G5 REJECT_CHEAT. The allocator is also already
// modelled elsewhere in this tree rather than stubbed: the landed
// raw-port/src/infra/PCMaskBuffer.ts turns its own `__Znam` @ProCore 0xc4896
// straight into a `new Uint8Array(n)`.
//
// This unit needs slightly more than PCMaskBuffer's version, because its whole
// job is ARITHMETIC ON THE ADDRESS the allocator returns — a bare Uint8Array
// has no address, so `(-p) & 31` would be meaningless against it. So the
// modelled `operator new[]` below hands back a numeric address into a modelled
// address space, and the byte at any address can be resolved back to its
// block.
//
// SCOPE NOTE FOR REVIEWERS: `HGAlignedHeap` is a MODEL OF THE C++ ALLOCATOR,
// not a transcription of an FCP function, and it is deliberately file-local —
// nothing outside this unit is required to adopt it. It exists only so that
// this function's pointer arithmetic can be executed exactly. If the port
// later grows a shared address-space model, this should be redirected onto it;
// the sibling `HGFreeAlign` @0x688ea0 is the natural second user.
//
// -----------------------------------------------------------------------------
// NUMERICS
// -----------------------------------------------------------------------------
// Every operation in the body is 64-bit (`addq`, `xorq`, `andq` on full
// registers) and addresses can exceed 2^53, so per PORTING_SPEC Rule 4
// addresses and the size argument are `bigint`, and each step is wrapped in
// `BigInt.asUintN(64, ...)` so the negation and the adds wrap exactly as the
// machine's do. No floating point is involved; Math.fround does not apply.

/** `addq $0x8` @0x688e00 — the 8 bytes reserved for the stashed base pointer. */
const HGALLOCALIGN_HEADER_BYTES = 8n;

/** `addq $0x1f` @0x688e04 — the worst-case align-up slack. */
const HGALLOCALIGN_ALIGN_SLACK = 0x1fn;

/** `andq $0x1f` @0x688e35 — the align-up mask, i.e. a 32-byte boundary. */
const HGALLOCALIGN_ALIGN_MASK = 0x1fn;

/**
 * One block returned by the modelled `::operator new[]`.
 *
 * `addr` is the block's base address in the modelled address space; `bytes` is
 * its storage. Together they let an arbitrary address inside the block be
 * resolved to a byte index.
 */
export interface HGHeapBlock {
  /** The address `operator new[]` returned for this block. */
  addr: bigint;
  /** The block's `raw` bytes, as requested at @0x688e0c. */
  bytes: Uint8Array;
}

/**
 * A model of the C++ free store, sufficient to execute this unit's pointer
 * arithmetic. See the SCOPE NOTE in the header: this models the allocator, it
 * does not transcribe an FCP function.
 *
 * Blocks are laid out at increasing, non-overlapping addresses starting from
 * {@link HGAlignedHeap.BASE}. Darwin's `operator new[]` guarantees 16-byte
 * alignment, so the model gives every block the same guarantee; note that the
 * 16-byte guarantee is exactly why the align-up at @0x688e35 is needed at all
 * (16-aligned is not 32-aligned).
 */
export class HGAlignedHeap {
  /**
   * The first address the model hands out. Its value is a free parameter of
   * the model — the transcribed function is correct for any address — so it is
   * chosen only to be non-zero (null is a distinguishable value) and 16-byte
   * aligned (Darwin's `operator new[]` guarantee).
   */
  static readonly BASE = 4294967296n; // 2^32

  /** Darwin's `operator new[]` alignment guarantee, in bytes. */
  static readonly MALLOC_ALIGN = 16n;

  private next: bigint = HGAlignedHeap.BASE;
  private readonly blocks: HGHeapBlock[] = [];

  /**
   * `::operator new[](unsigned long)` — `__Znam`, called at @0x688e10 through
   * the `symbol stub for: __Znam` at 0x6dfc96 with `raw` in %rdi.
   *
   * Reserves `n` bytes and returns their base address. Like the real
   * `operator new[]`, the storage is NOT zero-initialised as far as the
   * transcribed function is concerned — this unit writes only the 8-byte base
   * stash and hands the rest to the caller uninitialised.
   */
  operatorNewArray(n: bigint): bigint {
    const addr = this.next;
    this.blocks.push({ addr, bytes: new Uint8Array(Number(n)) });
    // Advance past the block, keeping the next base 16-byte aligned.
    const end = addr + n;
    const rem = end % HGAlignedHeap.MALLOC_ALIGN;
    this.next =
      rem === 0n ? end : end + (HGAlignedHeap.MALLOC_ALIGN - rem);
    return addr;
  }

  /** The block containing `addr`, or `null` when no block covers it. */
  blockAt(addr: bigint): HGHeapBlock | null {
    for (const b of this.blocks) {
      if (addr >= b.addr && addr < b.addr + BigInt(b.bytes.length)) return b;
    }
    return null;
  }

  /**
   * `movq %rcx, -0x8(%rax)` @0x688e48 — store a 64-bit value at `addr`.
   * Little-endian, matching x86_64.
   */
  storeU64(addr: bigint, value: bigint): void {
    const b = this.blockAt(addr);
    if (b === null) {
      throw new Error(
        "HGAllocAlign @Ozone 0x688e48: store at address " +
          addr.toString() +
          " lies outside every block handed out by the modelled operator new[]",
      );
    }
    const view = new DataView(
      b.bytes.buffer,
      b.bytes.byteOffset,
      b.bytes.byteLength,
    );
    view.setBigUint64(Number(addr - b.addr), BigInt.asUintN(64, value), true);
  }

  /**
   * The inverse read, `movq -0x8(%rax), %rax` — provided for the matching
   * `HGFreeAlign` @Ozone 0x688eb8, which recovers the stashed base this way.
   */
  loadU64(addr: bigint): bigint {
    const b = this.blockAt(addr);
    if (b === null) {
      throw new Error(
        "HGAllocAlign @Ozone 0x688e48: load at address " +
          addr.toString() +
          " lies outside every block handed out by the modelled operator new[]",
      );
    }
    const view = new DataView(
      b.bytes.buffer,
      b.bytes.byteOffset,
      b.bytes.byteLength,
    );
    return view.getBigUint64(Number(addr - b.addr), true);
  }
}

/**
 * The process-wide modelled free store this unit allocates from. Exported so
 * the matching `HGFreeAlign(void*)` @Ozone 0x688ea0 unit — which reads
 * `*(p - 8)` and releases it — can resolve the same addresses.
 */
export const hgAlignedHeap = new HGAlignedHeap();

/**
 * `HGAllocAlign(unsigned long size)` — @Ozone 0x688df0 (__ZL12HGAllocAlignm).
 *
 * Faithful transcription of the 29-instruction body quoted in the header:
 * over-allocate `size + 8 + 0x1f` bytes with `::operator new[]`, step 8 bytes
 * past the base, round that up to a 32-byte boundary, write the original base
 * into the 8 bytes just below the rounded-up pointer, and return it.
 *
 * There is NO null check on the allocation result: `__Znam` throws
 * `std::bad_alloc` rather than returning null, and the binary relies on that —
 * @0x688e19 dereferences the result unconditionally. There is likewise no
 * overflow check on `size + 8 + 0x1f`; the adds are plain 64-bit `addq`, so a
 * `size` within 0x27 of 2^64 wraps, exactly as reproduced here.
 *
 * @param size the requested user-visible byte count (%rdi).
 * @returns the 32-byte-aligned address of the user block, in the modelled
 *          address space of {@link hgAlignedHeap}.
 */
export function HGAllocAlign(size: bigint): bigint {
  // @0x688df8 movq %rdi,-0x8(%rbp) — the argument's stack slot.
  const sizeSlot = BigInt.asUintN(64, size);
  // @0x688dfc-@0x688e00  rax = size + 8
  let rax = BigInt.asUintN(64, sizeSlot + HGALLOCALIGN_HEADER_BYTES);
  // @0x688e04  rax += 0x1f
  rax = BigInt.asUintN(64, rax + HGALLOCALIGN_ALIGN_SLACK);
  // @0x688e08  raw = rax
  const raw = rax;
  // @0x688e0c-@0x688e10  base = ::operator new[](raw)
  const base = hgAlignedHeap.operatorNewArray(raw);
  // @0x688e19-@0x688e21  p = base + 8
  const p = BigInt.asUintN(64, base + HGALLOCALIGN_HEADER_BYTES);
  // @0x688e2d  rcx = ~p
  let rcx = BigInt.asUintN(64, ~p);
  // @0x688e31  rcx = ~p + 1   (= -p, two's complement)
  rcx = BigInt.asUintN(64, rcx + 1n);
  // @0x688e35  rcx &= 0x1f    (= bytes from p up to the next 32-byte boundary)
  rcx = rcx & HGALLOCALIGN_ALIGN_MASK;
  // @0x688e39-@0x688e3c  aligned = p + rcx
  const aligned = BigInt.asUintN(64, p + rcx);
  // @0x688e40-@0x688e48  *(u64*)(aligned - 8) = base
  hgAlignedHeap.storeU64(
    BigInt.asUintN(64, aligned - HGALLOCALIGN_HEADER_BYTES),
    base,
  );
  // @0x688e4c-@0x688e55  return aligned
  return aligned;
}
