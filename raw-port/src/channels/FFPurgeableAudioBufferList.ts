// FFPurgeableAudioBufferList.ts — raw transcription of Flexo
// `FFPurgeableAudioBufferList`.
//
// An `FFAudioBufferList` subclass whose sample memory is allocated out of the
// system PURGEABLE malloc zone, so the kernel may reclaim it under memory
// pressure. `lock()` / `unlock()` are the pair that flip that memory's Mach
// purgeability state around a use. ONE symbol is transcribed in this file —
// `unlock()`. Every other member (the ctor @0x1256130, the three dtors
// @0x1256660 D2 / D1 / D0, `lock()` @0x12564e0,
// `allocateBufferListMemory(unsigned long)` @0x12567d0,
// `allocateBufferDataMemory(unsigned long)` @0x12565d0,
// `deallocateBufferListMemory()`, `deallocateBufferDataMemory()`) is a SEPARATE
// ledger unit and is NOT ported here; do not add them without their own
// disassembly and address citations.
//
// Provenance (Flexo framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// Symbol ported in this file:
//   @0x1256550  FFPurgeableAudioBufferList::unlock()
//                 __ZN26FFPurgeableAudioBufferList6unlockEv
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym __ZN26FFPurgeableAudioBufferList6unlockEv Flexo`):
//   raw-port/re/disasm/Flexo.__ZN26FFPurgeableAudioBufferList6unlockEv.s (17 lines)
//
// ---------------------------------------------------------------------------
// LAYOUT — only the three slots this body reads, each grounded in a DIFFERENT
// member's disassembly as well (those siblings are EVIDENCE, not ports):
//
//   struct FFPurgeableAudioBufferList : FFAudioBufferList {
//     ...
//     uint32_t purgeableType;   // +0x58 — read `cmpl $0x1,0x58(%rdi)` @0x1256560.
//                               //   The ctor @0x1256130 stores the 6th integer
//                               //   argument into it — `movl %r9d,0x58(%rdi)`
//                               //   @0x12561c7 — and that parameter is the
//                               //   `FFPurgeableAudioBufferList::PurgeableType`
//                               //   enum of the ctor's mangled signature, which
//                               //   is what fixes both the offset and the
//                               //   4-byte width.
//     ...
//     void*    bufferData;      // +0x70 — read `movq 0x70(%rdi),%rsi` @0x1256578
//                               //   and passed as the Mach call's ADDRESS
//                               //   argument. Written by
//                               //   allocateBufferDataMemory @0x12565fd
//                               //   (`movq %rax,0x70(%r14)`) with the pointer
//                               //   returned from a malloc against
//                               //   `_malloc_default_purgeable_zone()`
//                               //   @0x12565ed.
//     uint8_t  isPurgeable;     // +0x78 — the ENTRY GATE, `cmpb $0x1,0x78(%rdi)`
//                               //   @0x1256550. Written by
//                               //   allocateBufferDataMemory with `sete
//                               //   0x78(%r14)` @0x1256614, i.e. "the data
//                               //   allocation really did come from the
//                               //   purgeable zone". `lock()` @0x12564e2 opens
//                               //   with the IDENTICAL `cmpb $0x1,0x78(%rdi)`
//                               //   gate.
//   };
//
// ---------------------------------------------------------------------------
// THE MACH CALL
// ---------------------------------------------------------------------------
// The body's one callee is the Mach VM extern
// `vm_purgable_control(vm_map_t task, vm_offset_t address, vm_purgable_t control,
//                      int* state)`, reached at @0x1256584
// (`callq … ## symbol stub for: _vm_purgable_control`) with:
//   %rdi = *_mach_task_self_        — @0x125656f/@0x1256576 load the literal-pool
//                                     address of the `_mach_task_self_` global and
//                                     then its 32-bit contents;
//   %rsi = this->bufferData (+0x70) — @0x1256578;
//   %rdx = 0                        — @0x1256582 `xorl %edx,%edx`;
//   %rcx = &state                   — @0x125657c `leaq -0x4(%rbp),%rcx`, the
//                                     4-byte stack slot written at @0x125656c.
// `lock()` @0x12564e0 makes the same call with the same three first arguments and
// a state slot of 0 (@0x12564f6), which is the counterpart of this one.
//
// This is a KERNEL API, not an FCP symbol: it is a true out-of-scope extern under
// PORTING_SPEC Rule 3, so it is modelled as a raising boundary that cites its
// address — the same treatment the landed FFPlaybackMemoryMonitor port gives
// `_dispatch_sync` / `_dispatch_release`. There is NO in-scope callee, no
// indirect and no virtual dispatch in this body (`depgraph.py deps` lists
// nothing).

/**
 * The `vm_map_t` task port the Mach call is made against.
 *
 * `_mach_task_self_` is a kernel-provided global holding the current task's
 * mach port name; the body loads its 32-bit contents (`movl (%rax),%eax`
 * @0x1256576). Out-of-scope extern data — a TS host has no Mach task port, so
 * reading it raises rather than inventing a value.
 *
 * @Flexo 0x125656f (`movq …(%rip),%rax` — literal-pool address of `_mach_task_self_`)
 */
function mach_task_self(): number {
  // @0x125656f/@0x1256576 — movq _mach_task_self_(%rip),%rax ; movl (%rax),%eax.
  throw new Error(
    "_mach_task_self_ not available in TS host (Flexo @0x125656f) — raise",
  );
}

/**
 * `vm_purgable_control(task, address, control, state)` — the Mach VM extern this
 * body tail-calls, out of scope for the value port (it changes kernel VM state
 * for a real mapping, which a TS host has none of).
 *
 * @Flexo 0x1256584 (`callq … symbol stub for: _vm_purgable_control`)
 * @param task    the task port from {@link mach_task_self} (%rdi).
 * @param address the purgeable allocation's address (%rsi, this->bufferData).
 * @param control the control selector — 0 here (%rdx, `xorl %edx,%edx` @0x1256582).
 * @param state   in/out state word (%rcx, the address of the stack slot).
 */
function vm_purgable_control(
  task: number,
  address: bigint,
  control: number,
  state: { value: number },
): number {
  // @0x1256584 callq _vm_purgable_control — Mach kernel API, out of scope.
  throw new Error(
    `_vm_purgable_control not available in TS host (Flexo @0x1256584) — raise ` +
      `(task=${task}, address=${address}, control=${control}, state=${state.value})`,
  );
}

/**
 * `FFPurgeableAudioBufferList` — an audio buffer list whose sample memory lives
 * in the purgeable malloc zone.
 *
 * Only the three slots `unlock()` reads are modelled; see the file header for
 * the byte layout and the sibling disassembly behind each offset.
 *
 * @Flexo 0x1256550
 */
export class FFPurgeableAudioBufferList {
  /**
   * +0x58 — `PurgeableType` (u32 enum). Compared against 1 by `unlock()`
   * (`cmpl $0x1,0x58(%rdi)` @0x1256560); stored by the ctor from its 6th
   * integer argument (`movl %r9d,0x58(%rdi)` @0x12561c7). Kept as the raw 32
   * bits — the enumerator set is not observable from these two instructions, so
   * no enum type is invented.
   */
  purgeableType_at_0x58 = 0;

  /**
   * +0x70 — the purgeable-zone data pointer, carried as its address value
   * because the only thing this body does with it is hand it to a Mach call
   * (`movq 0x70(%rdi),%rsi` @0x1256578). Written by
   * `allocateBufferDataMemory` @0x12565fd from a purgeable-zone malloc.
   */
  bufferData_at_0x70 = 0n;

  /**
   * +0x78 — the raw BYTE recording that the data allocation came from the
   * purgeable zone (`sete 0x78(%r14)` @0x1256614). Both `lock()` @0x12564e2 and
   * `unlock()` @0x1256550 gate their whole body on it being exactly 1.
   */
  isPurgeable_at_0x78 = 0;

  /**
   * `FFPurgeableAudioBufferList::unlock()` — @Flexo 0x1256550
   *   __ZN26FFPurgeableAudioBufferList6unlockEv
   *
   * Hand the purgeable allocation back to the kernel as reclaimable.
   *
   * Full transcription — every instruction, in order:
   *
   *   0x1256550  cmpb  $0x1,0x78(%rdi)     ; flags on (isPurgeable - 1)
   *   0x1256554  jne   0x125658e           ;   != 1 -> return, BEFORE any frame
   *   0x1256556  pushq %rbp                ; frame setup (no TS counterpart)
   *   0x1256557  movq  %rsp,%rbp           ; frame setup (no TS counterpart)
   *   0x125655a  subq  $0x10,%rsp          ; reserve the state slot at -0x4(%rbp)
   *   0x125655e  xorl  %eax,%eax           ; eax = 0 (zero-extends the sete)
   *   0x1256560  cmpl  $0x1,0x58(%rdi)     ; flags on (purgeableType - 1)
   *   0x1256564  sete  %al                 ; al = (purgeableType == 1)
   *   0x1256567  shll  $0x5,%eax           ; eax <<= 5   (0 or 0x20)
   *   0x125656a  incl  %eax                ; eax += 1    (1 or 0x21)
   *   0x125656c  movl  %eax,-0x4(%rbp)     ; state = that 32-bit word
   *   0x125656f  movq  …(%rip),%rax        ; rax = &_mach_task_self_
   *   0x1256576  movl  (%rax),%eax         ; eax = *_mach_task_self_ (32-bit)
   *   0x1256578  movq  0x70(%rdi),%rsi     ; arg2 = this->bufferData
   *   0x125657c  leaq  -0x4(%rbp),%rcx     ; arg4 = &state
   *   0x1256580  movl  %eax,%edi           ; arg1 = the task port
   *   0x1256582  xorl  %edx,%edx           ; arg3 = 0
   *   0x1256584  callq _vm_purgable_control
   *   0x1256589  addq  $0x10,%rsp          ; frame teardown (no TS counterpart)
   *   0x125658d  popq  %rbp                ; frame teardown (no TS counterpart)
   *   0x125658e  retq                      ; returns void — the call's %eax
   *                                        ;   result is DISCARDED, unlike
   *                                        ;   lock() @0x1256515 which tests it
   *   0x125658f  nop                       ; alignment padding, not executed
   *
   * Decode notes (PORTING_SPEC Rule 4 — AT&T computes `dst - src`):
   *   * `cmpb $0x1,0x78(%rdi) ; jne` is `isPurgeable != 1 -> return`. The test
   *     is against the literal 1, not against zero, and it happens BEFORE the
   *     prologue: a non-purgeable buffer costs nothing here.
   *   * the state word is built arithmetically, not from a table:
   *     `sete` gives 0/1, `shll $0x5` scales it to 0/0x20, `incl` adds 1 — so
   *     state is 0x21 when `purgeableType == 1` and 0x01 otherwise. Both the
   *     shift amount and the addend are transcribed as the machine's own
   *     numbers rather than replaced by named Mach constants, since only the
   *     instruction stream is evidence here.
   *   * `xorl %eax,%eax` before `sete %al` is the zero-extension idiom, so the
   *     shift operates on a clean 32-bit 0/1 — hence the `>>> 0` on the result.
   *   * the returned `kern_return_t` in %eax is never inspected: `unlock()`
   *     falls straight through to the epilogue. Its sibling `lock()` DOES test
   *     it (`testl %eax,%eax ; sete %cl` @0x1256515) — the asymmetry is real and
   *     is preserved here.
   *   * ZERO in-scope callees; the single extern is the Mach VM call
   *     (`depgraph.py deps` lists nothing).
   */
  unlock(): void {
    // @0x1256550/0x1256554  cmpb $0x1,0x78(%rdi) ; jne 0x125658e
    if ((this.isPurgeable_at_0x78 & 0xff) !== 1) {
      return;
    }

    // @0x125655e..0x125656c  xorl %eax,%eax ; cmpl $0x1,0x58(%rdi) ; sete %al ;
    //   shll $0x5,%eax ; incl %eax ; movl %eax,-0x4(%rbp)
    const sete = (this.purgeableType_at_0x58 >>> 0) === 1 ? 1 : 0;
    const state = { value: (((sete << 5) >>> 0) + 1) >>> 0 };

    // @0x125656f/0x1256576  movq _mach_task_self_(%rip),%rax ; movl (%rax),%eax
    const task = mach_task_self();

    // @0x1256584  callq _vm_purgable_control(task, this->bufferData, 0, &state)
    //   — @0x1256578 arg2, @0x1256582 arg3 = 0, @0x125657c arg4 = &state.
    vm_purgable_control(task, this.bufferData_at_0x70, 0, state);

    // @0x125658e  retq — the kern_return_t in %eax is discarded.
  }
}
