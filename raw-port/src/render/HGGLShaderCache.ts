// HGGLShaderCache.ts — Helium.framework (render layer).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//         (macOS FCP, x86_64 slice).
//
// -----------------------------------------------------------------------------
// SYMBOLS PORTED
// -----------------------------------------------------------------------------
//   * HGGLShaderCache::SetCapacity(unsigned long)   @Helium 0x175a10
//     __ZN15HGGLShaderCache11SetCapacityEm
//
// re/disasm:
//   raw-port/re/disasm/Helium.__ZN15HGGLShaderCache11SetCapacityEm.s
//   raw-port/re/disasm/Helium.__ZNK38HGComicDesignerInterfaceImplementation12GetLoosenessEv.s
//       (the ICF fold partner of this class's GetCapacity — read ONLY to pin the +0x20 slot's
//        offset and width; see the note below. Neither that method nor GetCapacity is ported
//        here — both are separate ledger entries.)
//
// The class's other members — the ctors @0x175640 (C2) / @0x1756f0 (C1), the dtors @0x1757a0
// (D2) / @0x175900 (D1), ClearAllShaders @0x1757f0, GetShaderCompileTime @0x175950,
// GetShaderCompileCount @0x175970, ClearStats @0x175980, PrintStats @0x1759a0, and
// GetCapacity @0x150d60 — are NOT ported here. This file is ADD-ONLY: each lands as its own
// method when its unit is claimed.
//
// -----------------------------------------------------------------------------
// THE GETTER IS ICF-FOLDED, WHICH IS WHY ITS DISASM COMES FROM ANOTHER CLASS'S SYMBOL
// -----------------------------------------------------------------------------
// `raw-port/tools/disasm.sh --sym __ZNK15HGGLShaderCache11GetCapacityEv Helium` writes NO .s and
// warns "0-line disasm … (wrong framework? stub/extern/ICF?)". It is the ICF case: the linker
// folded that body with an identical one, and the symbol inventory shows BOTH names on the same
// address —
//     0000000000150d60 t __ZNK15HGGLShaderCache11GetCapacityEv
//     0000000000150d60 t __ZNK38HGComicDesignerInterfaceImplementation12GetLoosenessEv
// — so the body is reachable under the OTHER name. (Recipe for the next agent who hits a 0-line
// disasm: `grep "^<addr>" raw-port/army/inventory/<FW>.syms.txt` to find the fold partner, then
// disassemble THAT symbol. The two functions are byte-identical by construction, which is why
// ICF merged them; nothing about the fold partner's class is being assumed here.)
//
// That folded body is the matched half of this setter's store:
//     0x150d64  movq 0x20(%rdi), %rax        ; 64-bit LOAD from +0x20
//     0x175a17  movq %rsi,  0x20(%rdi)       ; 64-bit STORE to  +0x20   (this file)
// A matched movq/movq pair at one offset is what fixes both the offset and the 64-bit width.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
// None. `depgraph.py deps __ZN15HGGLShaderCache11SetCapacityEm` reports nothing at all: no
// callq, no symbol stub, no indirect call — a pure field store.

/**
 * `HGGLShaderCache` — Helium's GL shader cache. Only the field this method touches is modelled
 * (PORTING_SPEC Rule 5 — no fabricated fields): the u64 capacity at +0x20.
 */
export class HGGLShaderCache {
  /**
   * @Helium HGGLShaderCache@0x20 — the cache capacity, a 64-bit unsigned word.
   *
   * Written by `SetCapacity` @0x175a17 (`movq %rsi, 0x20(%rdi)`) and read back by
   * `GetCapacity` @0x150d64 (`movq 0x20(%rdi), %rax`) — a matched 64-bit store/load pair.
   *
   * `bigint`, not `number`, per PORTING_SPEC Rule 4: the parameter is C++ `unsigned long`, the
   * store is a full 64-bit `movq`, and the ABI lets a caller pass any of the 2^64 values — the
   * ones above 2^53 are exactly the ones a `number` would silently round. The live differential
   * below includes them, and it is what makes this a measured claim rather than a stylistic one.
   */
  capacity: bigint = 0n; // @Helium HGGLShaderCache@0x20

  /**
   * `HGGLShaderCache::SetCapacity(unsigned long)` @Helium 0x175a10
   * (__ZN15HGGLShaderCache11SetCapacityEm).
   *
   * Faithful transcription of the whole 8-line body
   * (raw-port/re/disasm/Helium.__ZN15HGGLShaderCache11SetCapacityEm.s):
   *
   *   0x175a10  pushq %rbp                   ; frame prologue
   *   0x175a11  movq  %rsp, %rbp
   *   0x175a14  movq  %rsi, %rax             ; DEAD — see the note below
   *   0x175a17  movq  %rsi, 0x20(%rdi)       ; this->capacity = capacity  (64-bit store)
   *   0x175a1b  popq  %rbp                   ; epilogue
   *   0x175a1c  retq
   *   0x175a1d  nopl  (%rax)                 ; padding — not executed
   *
   * THE `movq %rsi, %rax` @0x175a14 IS TRANSCRIBED AS A NO-OP. It parks the argument in the
   * return register of a function whose C++ return type is `void`, so no caller may read it;
   * nothing else in the body touches %rax. It is left documented rather than silently dropped,
   * and it is the reason this port stores the argument and returns nothing.
   *
   * No masking, no validation, no branch: the 64 bits go into the slot verbatim.
   *
   * DIFFERENTIAL against the live binary — raw-port/re/oracle/HGGLShaderCache_SetCapacity_oracle.py.
   * The symbol is LOCAL (`nm` type `t`), so dlsym cannot see it and the harness calls it at
   * (x86_64 vmaddr + image slide), resolved from the cached symbol inventory rather than a bare
   * `nm` (which reports the arm64 slice — OPS_LOG), under `arch -x86_64 /usr/bin/python3`.
   * For each value it calls the REAL setter on a 0x100-byte record pre-filled with 0xEE and
   * checks three things: the raw qword at +0x20, that NO other byte of the record moved, and
   * that the live (ICF-folded) `GetCapacity` @0x150d60 hands the same 64 bits back.
   * 1,024 values — 0, 1, 2, 0xffff, 0x1_0000_0000, 2^53-1, 2^53, 2^53+1, 2^62, 2^63, 2^64-1,
   * 0xDEADBEEFCAFEBABE and seeded random u64s — 1,024/1,024 agreed on all three checks,
   * **0 divergences and 0 collateral writes** (so the store really is the 8 bytes at +0x20 and
   * nothing else).
   * NEGATIVE CONTROLS (measured on the same corpus): storing only the low 32 bits diverges on
   * 1,020 values; storing at the neighbouring +0x18 slot diverges on all 1,024; and modelling the
   * field as a JS `number` (float64) instead of `bigint` diverges on 1,009 — the concrete cost of
   * the `number` shortcut this file's field doc refuses.
   *
   * @param capacity the new capacity (SysV %rsi, u64).
   */
  SetCapacity(capacity: bigint): void {
    // @0x175a10..0x175a11 — prologue (no TS-visible effect).
    // @0x175a14 — movq %rsi, %rax: dead write to the return register of a `void` function.
    // @0x175a17 — movq %rsi, 0x20(%rdi): the 64-bit store. `BigInt.asUintN(64, …)` models the
    //   register's width, so a caller passing a negative or oversized bigint stores the same
    //   bit pattern the machine would.
    this.capacity = BigInt.asUintN(64, capacity);
    // @0x175a1b..0x175a1c — epilogue + retq.
  }
}
