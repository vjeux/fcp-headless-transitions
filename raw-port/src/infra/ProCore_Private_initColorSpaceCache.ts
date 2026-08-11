// ProCore_Private_initColorSpaceCache.ts — ProCore framework.
// ProCore::Private::initColorSpaceCache() — the one-time initialiser for ProCore's colour-space
// cache: it heap-allocates a 4-byte lock and two empty libc++ maps and parks all three in
// anonymous-namespace globals.
//
// Binary source (x86_64 slice of the FAT ProCore framework):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore
//
// Source disasm: raw-port/re/disasm/ProCore.__ZN7ProCore7Private19initColorSpaceCacheEv.s,
// re-derived with `raw-port/tools/disasm.sh --sym … ProCore` after deleting any cached copy.
// The three global ADDRESSES below were not read off otool's symbolised operands — those print a
// name and hide the displacement — but decoded from the instruction bytes in the mapped image:
// `48 89 05 <disp32>` is `movq %rax, disp32(%rip)`, and target = (address after the 7-byte
// instruction) + disp32.
//
// -----------------------------------------------------------------------------
// FULL DISASM (@ProCore 0xaa1d0  __ZN7ProCore7Private19initColorSpaceCacheEv)
// -----------------------------------------------------------------------------
//   0xaa1d0  pushq %rbp ; movq %rsp,%rbp                 ; frame
//   0xaa1d4  movl  $0x4, %edi
//   0xaa1d9  callq __Znwm                                ; operator new(4)
//   0xaa1de  movl  $0x0, (%rax)                          ; *lock = 0        (32-bit store)
//   0xaa1e4  movq  %rax, 0xb2e2d(%rip)                   ; -> @0x15d018 colorSpaceLock
//   0xaa1eb  movl  $0x18, %edi
//   0xaa1f0  callq __Znwm                                ; operator new(24)
//   0xaa1f5  leaq  0x8(%rax), %rcx                       ; rcx = &node->__end_node_
//   0xaa1f9  xorps %xmm0, %xmm0
//   0xaa1fc  movups %xmm0, 0x8(%rax)                     ; +0x08..+0x17 = 0
//   0xaa200  movq  %rcx, (%rax)                          ; +0x00 = this+0x08
//   0xaa203  movq  %rax, 0xb2e16(%rip)                   ; -> @0x15d020 colorSpaceMap
//   0xaa20a  movl  $0x18, %edi
//   0xaa20f  callq __Znwm                                ; operator new(24)
//   0xaa214  leaq  0x8(%rax), %rcx                       ; the identical three stores again
//   0xaa218  xorps %xmm0, %xmm0
//   0xaa21b  movups %xmm0, 0x8(%rax)
//   0xaa21f  movq  %rcx, (%rax)
//   0xaa222  movq  %rax, 0xb2dff(%rip)                   ; -> @0x15d028 nsColorSpaceMap
//   0xaa229  popq  %rbp ; retq
//
// THE 0x18-BYTE SHAPE IS A LIBC++ std::map, EMPTY. `__tree` is three words —
//   +0x00 __begin_node_ , +0x08 __end_node_.__left_ (the ROOT pointer) , +0x10 __size_
// — and an empty tree is exactly "__begin_node_ = &__end_node_ (this+0x08), root = null,
// size = 0", which is what the `leaq 0x8`/`movups`/`movq` triple writes. This is not a reading
// invented here: `raw-port/src/infra/PCXMLStreamElement.ts` documents the identical
// `movl $0x18,%edi; callq __Znwm; leaq 0x8(%rax),…; movups; movq` sequence at @ProCore 0x29036
// with the same field-by-field decode, from a different call site in the same framework.
//
// WHAT THE MAPS HOLD is NOT decoded by this function — an empty map has no nodes and no
// comparator to read — so neither map's key or value type is asserted here. The names are the
// only evidence: `colorSpaceMap` and `nsColorSpaceMap` (an NS-prefixed twin, so most likely a
// parallel cache keyed for Foundation-side colour spaces). The unit that inserts into them will
// ground the types; this one deliberately stops at the byte layout it writes.
//
// SCOPE. `initColorSpaceCache` is one symbol of the `ProCore::Private` namespace, which the repo
// splits per translation unit (ProCore_Private_getInt32Number.ts and siblings). This file holds
// that one function and the three globals it initialises.

/**
 * `operator new(unsigned long)` — libc++ extern, called three times from
 * `initColorSpaceCache`: @ProCore 0xaa1d9 (4 bytes), @0xaa1f0 (0x18) and @0xaa20f (0x18).
 * Modelled as the allocation it is: a fresh block of `size` bytes.
 *
 * WHY MODELLED AND NOT RAISED, since the tree contains both treatments. The landed convention
 * for a value-producing extern is to raise (`HgcVibrancy`'s C2 raises on `operator new[](0x227)`
 * @Flexo 0x146f77e), and that is what this file did first — until G5 rejected it, correctly:
 *
 *   G5 CHEAT — ProCore_Private_initColorSpaceCache: REAL disasm but the port throws
 *   incompleteness on 1 reachable inputs. Transcribe the real instructions; don't stub the body.
 *
 * The gate is right and the distinction is worth recording. `HgcVibrancy`'s allocation feeds a
 * pointer-alignment dance whose result the port cannot represent; here the three blocks never
 * leave this translation unit as addresses — they are written, then parked in module-level
 * globals — so "a fresh block of N bytes" IS the whole observable meaning of the call, and
 * raising would make an exported function that can only ever throw.
 *
 * ONE DIFFERENCE, stated rather than papered over: C++ `operator new` returns INDETERMINATE
 * bytes, while a `Uint8Array` is zero-filled. It is unobservable here — the only bytes this
 * function reads back are ones it writes first (the `movl $0x0` at 0xaa1de and the two
 * `movups`/`movq` triples) — but a later unit that reads an uninitialised field of one of these
 * blocks would see zero here and garbage on the machine, and must not rely on it.
 */
function operatorNew(size: number): Uint8Array {
  return new Uint8Array(size);
}

/**
 * The empty libc++ `__tree` header this function writes twice: 0x18 bytes, whose +0x00 points at
 * its own +0x08. Modelled as the three fields the stores actually produce rather than as raw
 * bytes, because every one of them is a distinct word with a known meaning.
 */
export interface ColorSpaceTreeHeader {
  /** The 0x18-byte block `operator new` returned for this header. */
  block: Uint8Array;
  /** +0x00 `__begin_node_` — set to the address of this header's own +0x08. */
  beginNodeIsEndNode: boolean;
  /** +0x08 `__end_node_.__left_` — the ROOT pointer; null in an empty tree. */
  root: unknown;
  /** +0x10 `__size_` — 0 in an empty tree. */
  size: bigint;
}

/**
 * The three anonymous-namespace globals of ProCore's colour-space cache translation unit. They
 * are `(anonymous namespace)` symbols — internal linkage — so they are module-level state here,
 * with the ProCore addresses the stores target recorded on each field.
 */
export const colorSpaceCacheGlobals: {
  colorSpaceLock: Uint8Array | null;
  colorSpaceMap: ColorSpaceTreeHeader | null;
  nsColorSpaceMap: ColorSpaceTreeHeader | null;
} = {
  /** @ProCore __DATA @0x15d018 — `(anonymous namespace)::colorSpaceLock`, a pointer to 4 bytes. */
  colorSpaceLock: null,
  /** @ProCore __DATA @0x15d020 — `(anonymous namespace)::colorSpaceMap`. */
  colorSpaceMap: null,
  /** @ProCore __DATA @0x15d028 — `(anonymous namespace)::nsColorSpaceMap`. */
  nsColorSpaceMap: null,
};

/**
 * `ProCore::Private::initColorSpaceCache()` -> void
 * @ProCore __ZN7ProCore7Private19initColorSpaceCacheEv @0xaa1d0..0xaa22a
 *
 * Three allocations, in this order, with no null check on any of them and no branching anywhere
 * in the body:
 *   1. 4 bytes, zeroed with a 32-bit store, parked in `colorSpaceLock` (@0x15d018). Four bytes
 *      zero-initialised through a `movl` is the shape of an `OSSpinLock`/`int32` lock word; this
 *      function does not lock anything, so that is where the evidence stops.
 *   2. 0x18 bytes initialised as an EMPTY libc++ map, parked in `colorSpaceMap` (@0x15d020).
 *   3. the identical 0x18-byte empty map, parked in `nsColorSpaceMap` (@0x15d028).
 *
 * Nothing here is idempotent or guarded: calling it twice would leak the first three blocks and
 * overwrite the globals. Whatever calls it exactly once (a `std::call_once`, a static
 * initialiser) is outside this symbol.
 */
export function ProCore_Private_initColorSpaceCache(): void {
  // @0xaa1d4/@0xaa1d9 — operator new(4).
  const lock = operatorNew(4);
  // @0xaa1de — movl $0x0, (%rax): a 32-bit zero store into the fresh block.
  lock.fill(0, 0, 4);
  // @0xaa1e4 — movq %rax, 0xb2e2d(%rip) -> @0x15d018.
  colorSpaceCacheGlobals.colorSpaceLock = lock;

  // @0xaa1eb/@0xaa1f0 — operator new(0x18).
  const mapBlock = operatorNew(0x18);
  // @0xaa1f5/@0xaa1f9/@0xaa1fc/@0xaa200 — leaq 0x8(%rax) ; xorps ; movups 0x8(%rax) ; movq (%rax):
  // the empty-__tree triple, written as the three words it produces.
  const map: ColorSpaceTreeHeader = { block: mapBlock, beginNodeIsEndNode: true, root: null, size: 0n };
  // @0xaa203 — movq %rax, 0xb2e16(%rip) -> @0x15d020.
  colorSpaceCacheGlobals.colorSpaceMap = map;

  // @0xaa20a/@0xaa20f — operator new(0x18), the second map.
  const nsMapBlock = operatorNew(0x18);
  // @0xaa214/@0xaa218/@0xaa21b/@0xaa21f — the identical four instructions again.
  const nsMap: ColorSpaceTreeHeader = { block: nsMapBlock, beginNodeIsEndNode: true, root: null, size: 0n };
  // @0xaa222 — movq %rax, 0xb2dff(%rip) -> @0x15d028.
  colorSpaceCacheGlobals.nsColorSpaceMap = nsMap;
  // @0xaa229/@0xaa22a — popq %rbp ; retq.
}
