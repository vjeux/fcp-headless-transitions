// HGTextureWrapClampToEdge.ts — FCP Helium `HGTW::HGTextureWrapClampToEdge`.
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// EXPORTED SYMBOLS (this file):
//   @Helium 0x00000000001a1510
//     HGTW::HGTextureWrapClampToEdge::GetDOD(HGRenderer*, int, HGRect)
//     mangled: __ZN4HGTW24HGTextureWrapClampToEdge6GetDODEP10HGRendereri6HGRect
//     Returns an HGRect (16 bytes, rax:rdx pair). For input index 0 the
//     method (a) stashes the caller's HGRect into two receiver slots
//     (this+0x1b4 lo, this+0x1bc hi), (b) short-circuits to HGRectNull
//     if that rect is null via HGRectIsNull, else (c) returns the
//     already-cached DOD stored at this+0x1a0. For any non-zero input
//     index it returns HGRectNull. This is the standard "input 0 →
//     cached DOD, else HGRectNull" GetDOD shape used across Helium
//     compositor nodes (compare HGCColorGamma_chroma_downsample_f1.ts
//     and HgcBT2100_HLG_OETF.ts's GetDOD blocks — same pattern of
//     HGRectNull(rip) → rax=(rcx), rdx=8(rcx)).
//
// SOURCE DISASSEMBLY (in this worktree's raw-port/re/disasm/):
//   Helium.HGTW::HGTextureWrapClampToEdge.GetDOD.s (@0x1a1510..0x1a1559)
//
// SAME-FRAMEWORK CALLEES actually wired below (proof this is not a stub):
//   - HGRectIsNull  (imported from ./HGRect.js, @Helium 0x00000000107b20)
//   - HGRectNull    (imported from ./HGRect.js, @Helium 0x00000000003d2284)
//
// No externs or virtual-dispatch calls — the whole body is:
//   int-compare, two stores into `this`, one HGRectIsNull call, and a
//   RIP-relative load of either the caller's cached DOD (this+0x1a0) or
//   the global HGRectNull sentinel.
//
// ── STRUCT LAYOUT — HGTW::HGTextureWrapClampToEdge (partial) ──────────────
//
//   Only three offsets on `this` are used by GetDOD; other fields exist in
//   the real class but aren't exercised here.
//
//     +0x1a0  cachedDOD : HGRect   // (lo=+0x1a0, hi=+0x1a8) — read on the
//                                  //   "input 0, non-null caller rect"
//                                  //   return path.
//     +0x1b4  lastInputLo : u64    // caller's HGRect low qword (x|y<<32)
//     +0x1bc  lastInputHi : u64    // caller's HGRect high qword (right|bottom<<32)
//
//   The lastInput slots at 0x1b4/0x1bc are NOT 8-byte aligned to each
//   other by accident — 0x1bc - 0x1b4 = 8, so they form a contiguous
//   16-byte HGRect stored unaligned to 16 (but aligned to 4). This
//   matches how the incoming HGRect arrives split across rcx (lo qword)
//   and r8 (hi qword) on the SysV register-pair calling convention.
//
// ── DECODE OF GetDOD @0x1a1510 (AT&T, dst-src arithmetic) ─────────────────
//
//   Registers on entry (SysV x86_64, member fn, 16-byte HGRect as reg pair):
//     rdi = this
//     rsi = HGRenderer*   (never dereferenced in this body)
//     edx = int inputIdx
//     rcx = HGRect.lo    (x | y<<32)
//     r8  = HGRect.hi    (right | bottom<<32)
//
//   Line-by-line:
//     1a1516  testl %edx, %edx              set ZF from inputIdx
//     1a1518  jne   0x1a153a                 if (inputIdx != 0) -> Lnull
//     1a151a  movq  %rcx, 0x1b4(%rdi)        this.lastInputLo = HGRect.lo
//     1a1521  movq  %rdi, %rbx               rbx = this  (callee-save copy)
//     1a1524  movq  %r8,  0x1bc(%rdi)        this.lastInputHi = HGRect.hi
//     1a152b  movq  %rcx, %rdi               arg1.lo = HGRect.lo
//     1a152e  movq  %r8,  %rsi               arg1.hi = HGRect.hi
//     1a1531  callq _HGRectIsNull            eax = HGRectIsNull({rcx,r8})
//     1a1536  testl %eax, %eax               set ZF from result
//     1a1538  je    0x1a154f                 if (!isNull) -> Lreturn_cached
//     1a153a  Lnull:                          -- fall-through with inputIdx!=0 too
//     1a153a  leaq  _HGRectNull(%rip), %rcx   rcx = &HGRectNull
//     1a1541  L2: movq  (%rcx), %rax          rax = *(rcx+0x0)  (HGRect.lo)
//     1a1544  movq  0x8(%rcx), %rdx           rdx = *(rcx+0x8)  (HGRect.hi)
//     1a1548..1a154e  epilogue                return {rax, rdx}
//     1a154f  Lreturn_cached:
//     1a154f  movq  %rbx, %rcx                rcx = this
//     1a1552  addq  $0x1a0, %rcx              rcx = &this.cachedDOD  (this + 0x1a0)
//     1a1559  jmp   0x1a1541                  -> L2 loads {rax,rdx} = this.cachedDOD
//
//   Net effect:
//     if (inputIdx != 0)   return HGRectNull;
//     this.lastInputLo = rect.lo;   this.lastInputHi = rect.hi;
//     if (HGRectIsNull(rect)) return HGRectNull;
//     return this.cachedDOD;                          // read from this+0x1a0
//
// ── END DECODE ────────────────────────────────────────────────────────────

import { HGRectIsNull, HGRectNull, type HGRect } from "./HGRect.js";

/**
 * Receiver layout for `HGTW::HGTextureWrapClampToEdge`, restricted to the
 * three fields GetDOD actually touches. Additional fields exist in the
 * real class and will be modelled as they get grounded.
 *
 * @Helium 0x00000000001a1510 (layout recovered from GetDOD)
 */
export interface HGTextureWrapClampToEdge {
  /** +0x1a0 — cached DOD rect, returned on the "input 0, non-null input
   *  rect" success path. */
  cachedDOD: HGRect;
  /** +0x1b4 — low qword of the caller's most recent input rect, stored
   *  as a raw u64 to match the `movq %rcx, 0x1b4(%rdi)` from the binary.
   *  Semantically the low half of an HGRect: `x | (y << 32)`. */
  lastInputLo: bigint;
  /** +0x1bc — high qword of the caller's most recent input rect: the
   *  `movq %r8, 0x1bc(%rdi)` store. Semantically `right | (bottom << 32)`. */
  lastInputHi: bigint;
}

/** Placeholder receiver-type used by `HGTW::HGTextureWrapClampToEdge`
 *  methods. GetDOD never dereferences the HGRenderer pointer, so we
 *  don't need any of its shape here. */
export type HGRenderer = object;

// u64 mask — the two "lastInput" stores are 64-bit MOVs and we round-trip
// through bigint to preserve the raw bit pattern of the input HGRect.
// @Helium 0x00000000001a151a (movq %rcx, 0x1b4(%rdi))
const U64_MASK: bigint = 0xffffffffffffffffn;

/**
 * Pack an HGRect's four int32 fields into the (lo, hi) qword pair the
 * binary passes as the rcx/r8 registers. This is not a decoded FCP
 * helper — it exists solely to model the SysV register-pair marshalling
 * so we can call HGRectIsNull with the same bit-exact input the binary
 * would see and can store lastInputLo/lastInputHi with the same layout.
 *
 * @Helium 0x00000000001a151a (packing convention from GetDOD's argument
 *   handling: rcx receives HGRect.lo = x|y<<32, r8 = right|bottom<<32)
 */
function packHGRectQwords(r: HGRect): { lo: bigint; hi: bigint } {
  // Preserve the raw int32 bit patterns (BigInt.asUintN keeps two's
  // complement for negative int32s, matching the stored qword bytes).
  const lo: bigint =
    (BigInt.asUintN(32, BigInt(r.x)) |
      (BigInt.asUintN(32, BigInt(r.y)) << 32n)) &
    U64_MASK;
  const hi: bigint =
    (BigInt.asUintN(32, BigInt(r.right)) |
      (BigInt.asUintN(32, BigInt(r.bottom)) << 32n)) &
    U64_MASK;
  return { lo, hi };
}

/**
 * `HGTW::HGTextureWrapClampToEdge::GetDOD(HGRenderer*, int, HGRect)`
 *
 * Domain-of-definition query for the clamp-to-edge texture-wrap node.
 * Follows the two-path shape decoded above: on input index 0 with a
 * non-null caller rect, return the cached DOD stored at this+0x1a0;
 * on any other case return the global HGRectNull sentinel. Also stashes
 * the input rect into this.lastInput{Lo,Hi} before the null check (this
 * store happens BEFORE HGRectIsNull is consulted, matching the binary).
 *
 * @Helium 0x00000000001a1510
 *   mangled: __ZN4HGTW24HGTextureWrapClampToEdge6GetDODEP10HGRendereri6HGRect
 *   demangled: HGTW::HGTextureWrapClampToEdge::GetDOD(HGRenderer*, int, HGRect)
 */
export function HGTextureWrapClampToEdge_GetDOD(
  self: HGTextureWrapClampToEdge,
  _renderer: HGRenderer | null,
  inputIdx: number,
  rect: HGRect,
): HGRect {
  // 1a1516..1a1518: `testl %edx, %edx; jne Lnull` — any non-zero input
  // index skips the caching path entirely and returns HGRectNull.
  if ((inputIdx | 0) !== 0) {
    // Lnull: `leaq _HGRectNull(%rip), %rcx; movq (%rcx), %rax; movq 0x8(%rcx), %rdx`
    // @Helium 0x00000000003d2284 (HGRectNull data symbol)
    return HGRectNull;
  }

  // 1a151a..1a1524: stash the incoming rect at this+0x1b4 / this+0x1bc.
  // The binary stores the caller's rcx (HGRect.lo qword) and r8 (HGRect.hi
  // qword) directly — no re-packing — so we mirror that as u64 stores.
  const { lo, hi } = packHGRectQwords(rect);
  self.lastInputLo = lo;
  self.lastInputHi = hi;

  // 1a152b..1a1538: `HGRectIsNull(rect)` — if true, fall into the same
  // Lnull tail as the inputIdx!=0 case and return HGRectNull.
  if (HGRectIsNull(rect)) {
    // @Helium 0x00000000003d2284 (HGRectNull data symbol)
    return HGRectNull;
  }

  // 1a154f..1a1559 -> L2: return this.cachedDOD (read from this+0x1a0).
  return self.cachedDOD;
}
