// HGFreeAlign.ts — Ozone framework, file-static free function
// `HGFreeAlign(void*)` (internal linkage — the `L` in the mangled name). Its
// own file named after the function, per the PORTING_SPEC naming rule for free
// functions, and filed in `infra/` beside its allocator half
// `infra/HGAllocAlign.ts` rather than in `render/`.
//
// It is the matching deallocator of the "over-allocate, align up, stash the
// real base just below the returned pointer" pair: recover the original
// `operator new[]` allocation from the 8 bytes immediately before the pointer
// the caller was handed, and release it.
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//         Versions/A/Ozone  (macOS FCP, x86_64 slice; VAs unadjusted, as
//         printed by otool -tV).
//
// -----------------------------------------------------------------------------
// SYMBOL PORTED IN THIS UNIT
// -----------------------------------------------------------------------------
//   * HGFreeAlign(void*)                         @Ozone 0x688ea0
//     __ZL11HGFreeAlignPv
//
// re/disasm:
//   raw-port/re/disasm/__ZL11HGFreeAlignPv.s
//
// Contract evidence (read for grounding, NOT ported here — it is the sibling
// unit that landed as raw-port/src/infra/HGAllocAlign.ts):
//   raw-port/re/disasm/__ZL12HGAllocAlignm.s     @Ozone 0x688df0
//
// Both halves are `__ZL` internal-linkage symbols in Ozone's __text, because
// Helium's aligned-allocator pair was inlined into an Ozone translation unit:
//   0x688df0  t  __ZL12HGAllocAlignm   HGAllocAlign(unsigned long)
//   0x688ea0  t  __ZL11HGFreeAlignPv   HGFreeAlign(void*)          <- THIS unit
//
// -----------------------------------------------------------------------------
// FULL DISASM (17 real insns, @0x688ea0..0x688ed4)
// -----------------------------------------------------------------------------
// Built at -O0, like its allocator half, so every temporary round-trips through
// a stack slot. The three slots:
//   -0x08  p     (the incoming argument)
//   -0x10  p     (a second copy of it)
//   -0x18  base  (the stashed allocation recovered from *(p - 8))
//
//   __ZL11HGFreeAlignPv:
//     0x688ea0  pushq %rbp
//     0x688ea1  movq  %rsp, %rbp
//     0x688ea4  subq  $0x20, %rsp
//     0x688ea8  movq  %rdi, -0x8(%rbp)       ; spill the argument p
//     0x688eac  movq  -0x8(%rbp), %rax
//     0x688eb0  movq  %rax, -0x10(%rbp)      ; copy p into a second slot
//     0x688eb4  movq  -0x10(%rbp), %rax
//     0x688eb8  movq  -0x8(%rax), %rax       ; base = *(u64*)(p - 8)  <- UNGUARDED load
//     0x688ebc  movq  %rax, -0x18(%rbp)
//     0x688ec0  cmpq  $0x0, %rax
//     0x688ec4  je    0x688ecf               ; base == NULL -> nothing to release
//     0x688ec6  movq  -0x18(%rbp), %rdi
//     0x688eca  callq 0x6dfc36               ## symbol stub for: __ZdlPv
//                                            ; ::operator delete(base)
//     0x688ecf  addq  $0x20, %rsp
//     0x688ed3  popq  %rbp
//     0x688ed4  retq
//
// -----------------------------------------------------------------------------
// THE WORD AT p - 8 IS THE ONE HGAllocAlign WRITES — SO THIS UNIT READS IT
// FROM THE SAME MODELLED MEMORY, RATHER THAN MODELLING IT AGAIN
// -----------------------------------------------------------------------------
// The load at @0x688eb8 is the exact inverse of the store at @0x688e48 in the
// landed sibling:
//
//     HGAllocAlign  0x688e48  movq %rcx, -0x8(%rax)   ; *(u64*)(aligned - 8) = base
//     HGFreeAlign   0x688eb8  movq -0x8(%rax), %rax   ; base = *(u64*)(p - 8)
//
// `infra/HGAllocAlign.ts` already models that memory — it exports the shared
// `hgAlignedHeap`, whose `loadU64` doc comment names THIS unit as the reader it
// exists for — and it returns the user pointer as a `bigint` address in that
// space. So this unit imports it and reads the real stashed word. Declaring a
// second, parallel model here (a handle object carrying its own `allocBase`
// field) would type-mismatch the only producer of these pointers, would leave
// the transcribed load resolving to nothing the transcribed store ever wrote,
// and would make the pair uncomposable — i.e. dead code. Importing the landed
// sibling's model is the settled convention (`infra/CMTime` has 113 importers
// on main, `HGRect` 107, `HGNode` 59).
//
// The pointer arithmetic is 64-bit `movq` on a full register, so per
// PORTING_SPEC Rule 4 the address is a `bigint` and the subtraction is wrapped
// in `BigInt.asUintN(64, ...)`, exactly as the sibling wraps its adds.
//
// -----------------------------------------------------------------------------
// THE LOAD IS NOT GUARDED, AND THAT IS PRESERVED
// -----------------------------------------------------------------------------
// There is no `p == NULL` test anywhere in this function: @0x688eb8 dereferences
// `p - 8` unconditionally, so calling FCP's HGFreeAlign with a null or foreign
// pointer faults. The port keeps that shape rather than papering it over with a
// silent early return the machine does not have — `hgAlignedHeap.loadU64` throws
// when the address lies outside every block the modelled `operator new[]` handed
// out, which is the closest thing the modelled address space has to the fault.
// The `cmpq $0x0` @0x688ec0 tests the LOADED WORD, not the argument.
//
// -----------------------------------------------------------------------------
// OUT-OF-SCOPE EXTERN
// -----------------------------------------------------------------------------
// One: `::operator delete(void*)` — libc++abi `__ZdlPv`, called @0x688eca
// through the symbol stub at @Ozone 0x6dfc36. Not an in-scope FCP symbol.
// Modelled as a no-op per the RESOLVED lifetime-extern ruling and the landed
// precedent (PCMatchmoveProblem D0, PCICCTransferFunctionGamma), so the call
// site still mirrors the `callq` instead of silently dropping it.
//
// NOTE (faithfully reproduced, NOT corrected): the block is acquired with
// `__Znam` (`operator new[]`) @0x688e10 in the sibling but released here with
// the SCALAR `__ZdlPv` @0x688eca — the array form `__ZdaPv` is not used. On
// Apple's libc++ both land in the same `free`, which is why this has never
// mattered; it is recorded because the port transcribes what the binary does.
//
// -----------------------------------------------------------------------------
// ORACLE
// -----------------------------------------------------------------------------
// raw-port/re/oracle/HGFreeAlign_oracle.py — differential against the LIVE
// Ozone binary. Both halves are `t` (local) symbols, so they are called by
// address (inventory vmaddr + `_dyld_get_image_vmaddr_slide`) under
// `arch -x86_64`, per the OPS_LOG local-symbol recipe.

import { hgAlignedHeap } from "./HGAllocAlign.js";

/**
 * `subq $0x8` implied by `movq -0x8(%rax), %rax` @Ozone 0x688eb8 — the 8-byte
 * header holding the stashed `operator new[]` base. The same constant the
 * sibling reserves with `addq $0x8` @Ozone 0x688e00 and stores through with
 * `movq %rcx, -0x8(%rax)` @Ozone 0x688e48.
 */
const HGFREEALIGN_HEADER_BYTES = 8n;

/**
 * The NULL the recovered base is tested against by `cmpq $0x0, %rax`
 * @Ozone 0x688ec0.
 */
const HGFREEALIGN_NULL = 0n;

/**
 * `::operator delete(void*)` — libc++abi `__ZdlPv`, called @Ozone 0x688eca
 * through the symbol stub at @Ozone 0x6dfc36.
 *
 * Intentionally empty: a garbage-collected runtime has no explicit free, and
 * the RESOLVED lifetime-extern ruling models these as no-ops. It exists so the
 * call site below mirrors the `callq` in the disassembly rather than dropping
 * it. It is NOT a decode of the C++ runtime symbol.
 */
function operator_delete(_base: bigint): void {
  // no-op — see the doc comment above (@Ozone 0x688eca -> stub 0x6dfc36).
}

/**
 * `HGFreeAlign(void* p)` — @Ozone 0x688ea0 (`__ZL11HGFreeAlignPv`).
 *
 * Faithful transcription of the 17-instruction body quoted in the file header:
 * load the stashed allocation base from the 8 bytes below `p`, and unless it is
 * NULL, hand it to `::operator delete`.
 *
 * `p` is an address in the modelled address space of `hgAlignedHeap` — i.e.
 * exactly what the sibling `HGAllocAlign(size)` @Ozone 0x688df0 returns. The
 * load is unguarded, as the machine's is: an address whose header word lies
 * outside every modelled block raises rather than returning quietly.
 *
 * @param p the 32-byte-aligned payload pointer previously returned by
 *          `HGAllocAlign` @Ozone 0x688df0 (%rdi).
 *
 * @0xADDR Ozone 0x688ea0
 */
export function HGFreeAlign(p: bigint): void {
  // @0x688ea0  pushq %rbp
  // @0x688ea1  movq  %rsp, %rbp
  // @0x688ea4  subq  $0x20, %rsp
  // @0x688ea8-@0x688eb4: p is spilled to -0x8(%rbp), copied to -0x10(%rbp) and
  // reloaded; pure -O0 register traffic, the value is unchanged.
  const local = BigInt.asUintN(64, p);
  // @0x688eb8  movq -0x8(%rax), %rax   ; base = *(u64*)(p - 8)
  //            UNGUARDED — there is no `p == NULL` test in this function.
  const base = hgAlignedHeap.loadU64(
    BigInt.asUintN(64, local - HGFREEALIGN_HEADER_BYTES),
  );
  // @0x688ebc  movq %rax, -0x18(%rbp)
  // @0x688ec0  cmpq $0x0, %rax
  // @0x688ec4  je   0x688ecf           ; a NULL stashed base means nothing to release
  if (base === HGFREEALIGN_NULL) {
    return;
  }
  // @0x688ec6  movq -0x18(%rbp), %rdi
  // @0x688eca  callq 0x6dfc36          ; ::operator delete(base)
  operator_delete(base);
  // @0x688ecf-@0x688ed4: epilogue.
}
