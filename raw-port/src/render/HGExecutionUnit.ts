// raw-port/src/render/HGExecutionUnit.ts
//
// FCP `HGExecutionUnit` — Helium.framework. The class accretes here one ledger unit at a time
// (one C++ class = one file): `SwapStack()` and `GetStackState()` landed first, and
// `CommitStack(float vector[4]*, unsigned long)` is added below. Checked
// before creating the file:
//   git ls-tree origin/main -r --name-only | grep -i HGExecutionUnit   -> no hits,
// so this is not the "same class forked into a second layer directory" shape.
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//         (macOS FCP, x86_64 slice).
//
// -----------------------------------------------------------------------------
// SYMBOL PORTED
// -----------------------------------------------------------------------------
//   * __ZN15HGExecutionUnit9SwapStackEv
//       -- HGExecutionUnit::SwapStack()      @Helium 0x144570   (`nm` class T)
//   * __ZN15HGExecutionUnit13GetStackStateEv
//       -- HGExecutionUnit::GetStackState()  @Helium 0x1444c0   (`nm` class T)
//   * __ZN15HGExecutionUnit11CommitStackEPDv4_fm
//       -- HGExecutionUnit::CommitStack(float vector[4]*, unsigned long)
//                                            @Helium 0x1445b0   (`nm` class T)
//
// FULL DISASM (raw-port/re/disasm/Helium.__ZN15HGExecutionUnit9SwapStackEv.s, 9 instructions):
//
//   0x144570  pushq %rbp
//   0x144571  movq  %rsp, %rbp
//   0x144574  movq  0x90(%rdi), %rax       ; rax = this->state   (a POINTER at +0x90)
//   0x14457b  xorl  %ecx, %ecx             ; ecx = 0  (all 32 bits, so the store below is 0 or 1)
//   0x14457d  cmpl  $0x0, 0x98(%rax)       ; flags on  state->stackIndex - 0
//   0x144584  sete  %cl                    ; cl = (state->stackIndex == 0)
//   0x144587  movl  %ecx, 0x98(%rax)       ; state->stackIndex = that 0/1
//   0x14458d  popq  %rbp
//   0x14458e  retq
//
// WHAT IT DOES, AND THE ONE THING THAT IS EASY TO GET WRONG. It flips a two-slot stack selector
// between 0 and 1 — but it is NOT a bitwise toggle and NOT `1 - x`. The machine tests the field
// against ZERO and stores the boolean answer, so **every non-zero value collapses to 0**:
//
//     0 -> 1        1 -> 0        2 -> 0        -1 -> 0       0x7fffffff -> 0
//
// `x ^= 1` and `x = 1 - x` agree with that on {0,1} and disagree everywhere else, so a corpus that
// only tries 0 and 1 cannot tell the three models apart. The oracle below therefore fuzzes the
// field over the full int32 range, and both wrong models are carried as negative controls.
//
// `sete` writes one byte into %cl, and `xorl %ecx,%ecx` cleared the whole register first, so the
// 32-bit store is exactly 0 or 1 with no stale high bits — which is why this port stores a plain
// 0/1 rather than masking.
//
// LAYOUT RECOVERED (only what this method reads — PORTING_SPEC Rule 5):
//   HGExecutionUnit
//     +0x90  state : pointer, dereferenced unguarded @0x144574 (a null here faults on the machine,
//                    and this port models that with a non-null assertion rather than inventing a
//                    null check the binary does not have).
//   The pointee
//     +0x98  stackIndex : int32, read @0x14457d and written @0x144587. Nothing else in the object
//                    is touched, so nothing else is modelled.
//
// DIFFERENTIAL vs the live binary — raw-port/re/oracle/HGExecutionUnit_SwapStack_{oracle.py,
// driver.mts}. The symbol is exported (`nm` T), so it is dlsym-able; the harness builds a receiver
// and a poisoned 0x100-byte pointee in ctypes memory, sets +0x98 to each case value, calls the live
// function, and byte-diffs the whole arena afterwards — which checks both that the intended dword
// changed and that nothing else did. 45 values covering 0, 1, both signs, the int32 extremes and
// randoms: 0 divergences, 0 stray bytes. Controls: `x ^= 1` kills 40/45, `x = 1 - x` kills 40/45,
// and a model that writes the comparison to the RECEIVER instead of the pointee kills 45/45.

// -----------------------------------------------------------------------------
// CommitStack(float vector[4]*, unsigned long) @Helium 0x1445b0 — the commit half of the vec4
// stack bump-allocator: it advances the current stack's element count by `n`, but ONLY if the
// pointer the caller hands back is exactly the stack's current top.
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/Helium.__ZN15HGExecutionUnit11CommitStackEPDv4_fm.s, 18
// instructions), re-derived with `raw-port/tools/disasm.sh --sym … Helium` after deleting the
// cached `.s`, and then cross-checked against the raw bytes of the loaded image so that no part of
// it rests on otool's linear sweep:
//
//   0x1445b0  pushq %rbp ; movq %rsp,%rbp        ; frame
//   0x1445b4  movq  0x90(%rdi), %rax             ; rax = this->state          (+0x90)
//   0x1445bb  movl  0x98(%rax), %ecx             ; ecx = state->stackIndex    (+0x98, u32)
//   0x1445c1  movq  0x88(%rax,%rcx,8), %rax      ; rax = (&state->stackA)[index]  (stride 8)
//   0x1445c9  movq  0x10(%rax), %rcx             ; rcx = stack->+0x10         (the count)
//   0x1445cd  movq  %rcx, %rdi
//   0x1445d0  shlq  $0x4, %rdi                   ; rdi = count * 16           (sizeof float4)
//   0x1445d4  addq  (%rax), %rdi                 ; rdi = stack->base + count*16  = the TOP
//   0x1445d7  cmpq  %rdi, %rsi                   ; is the caller's pointer that top?
//   0x1445da  je    0x1445de
//   0x1445dc  popq %rbp ; retq                   ;   no  -> return, commit NOTHING
//   0x1445de  addq  %rdx, %rcx                   ;   yes -> count += n
//   0x1445e1  movq  %rcx, 0x10(%rax)             ;          stored back
//   0x1445e5  popq %rbp ; retq
//   0x1445e7  nopw  (%rax,%rax)                  ; alignment padding
//
// THE IDENTITY TEST IS THE FUNCTION. There is no bounds check, no capacity check and no error
// path: a caller that passes anything other than the exact current top gets a silent no-op. That
// is the shape of a bump allocator whose Reserve hands out `base + count*16` and whose Commit
// refuses to advance unless the block being committed is still the one on top.
//
// THE +0x88 TABLE IS THE LANDED `stackA`/`stackB` PAIR, and this method is what proves they are
// one indexed array rather than two unrelated fields. `GetStackState` loads +0x88 and +0x90 with
// two separate instructions, which is equally consistent with two named pointers; here a single
// `0x88(%rax,%rcx,8)` indexes them by the selector at +0x98 with stride 8, so entry 0 IS `stackA`
// (+0x88) and entry 1 IS `stackB` (+0x90). The two readings agree on every byte, and the indexed
// one also explains why the selector can only hold 0 or 1: entry 2 would be at 0x88 + 2*8 = +0x98,
// which is the selector itself, so the callee would read the index word as a pointer. That is not
// a deduction from the code alone — the oracle for this unit SEGFAULTED on its first attempt for
// exactly that reason, having laid out a six-entry table whose later entries overlapped the
// index field. `SwapStack` writing only 0 or 1 into +0x98 is the other half of the same fact.
//
// THE WIDTHS ARE THE WHOLE DEFECT SURFACE OF THIS BODY, so they are grounded in the encodings
// rather than in the mnemonics. Read out of the loaded image at slide+0x1445b0, the 0x36 bytes of
// this function are
//
//   554889e5 488b8790000000 8b8898000000 488b84c888000000 488b4810 4889cf
//   48c1e704 480338 4839fe 7402 5dc3 4801d1 48894810 5dc3
//
// and the three that matter are `48 c1 e7 04` (REX.W `shlq $0x4, %rdi` — a 64-bit shift, so the
// four bits shifted out of the top of %rdi are DISCARDED), `48 03 38` (REX.W `addq (%rax), %rdi`,
// which wraps mod 2^64) and `48 39 fe` (REX.W `cmpq %rdi, %rsi`, a full 64-bit compare). A port
// that computes the top with unbounded arithmetic is therefore a different function: at
// count = 2^60 the product count*16 is exactly 2^64, the machine's top comes back around to the
// base, and the live symbol commits for a pointer the unbounded model says is 2^64 short. The
// port truncates both operations with `BigInt.asUintN(64, …)`, and the oracle measures the
// difference rather than asserting it (9 wrap cases through the shipped port; the untruncated
// body diverges on 5 of them).
//
// `movl 0x98(%rax), %ecx` zero-extends into the full %rcx, so the index is used as an unsigned
// 32-bit value and `>>> 0` models it. The landed methods dereference `state` and the stack
// pointers unguarded and model that with `!`; CommitStack does the same, so the file has one
// convention for "the machine would fault here" rather than two.
//
// POINTERS AS NUMERIC ADDRESSES. This body compares a caller's pointer against computed pointer
// arithmetic, so `base` is kept as a `bigint` address in the port's own address space — the
// convention `raw-port/src/infra/HGAllocAlign.ts` already uses (`operatorNewArray(n: bigint):
// bigint`). Modelling the stack as a JS array instead would make the one decision this function
// makes unrepresentable.

/** The object `HGExecutionUnit.state` (+0x90) points at. Only the one field this method touches is
 *  modelled. */
export interface HGExecutionUnitState {
  /** +0x88 — pointer to a stack object; loaded @0x1444ce and dereferenced at ITS +0x10 @0x1444e3. */
  stackA: HGExecutionUnitStackSlot | null;
  /** +0x90 — the second stack object; loaded @0x1444d8, dereferenced at its +0x10 @0x1444eb. */
  stackB: HGExecutionUnitStackSlot | null;
  /** +0x98 — int32 stack selector; read @0x14457d, written @0x144587, and copied out @0x1444f3. */
  stackIndex: number;
}

/**
 * One of the two objects hanging off the state at +0x88 / +0x90. Only the single field this class
 * reads is modelled: `GetStackState` loads +0x10 out of each and copies it into the result.
 * Nothing here names what that field MEANS — no method decoded so far writes it, so calling it a
 * count or a top-of-stack would be an invention (PORTING_SPEC Rule 5).
 */
export interface HGExecutionUnitStackSlot {
  /** +0x00 — the `float vector[4]*` base of the stack's storage, as a numeric address. Read
   *  @0x1445d4 (`addq (%rax), %rdi`), which is the first instruction in the class to touch it. */
  base: bigint;
  /** +0x10 — a 64-bit value, read @0x1444e3 (from +0x88's object) and @0x1444eb (from +0x90's). */
  at10: bigint;
  /* +0x10 is the ELEMENT COUNT, in float4 units — named by CommitStack rather than by
   * GetStackState, which only copies it out. @0x1445c9 reads it, @0x1445d0 multiplies it by 16
   * (the size of a float4) to reach the top of the stack, and @0x1445e1 writes it back advanced
   * by the caller's `n`. The landed field name stays `at10`: renaming a landed declaration is
   * what the add-only rule forbids, and nothing here needs a second name for one word. */
}

/**
 * The 0x24-byte structure `GetStackState()` returns BY VALUE. It is larger than 16 bytes, so the
 * SysV ABI returns it through a hidden out-pointer in %rdi — which is why the receiver arrives in
 * %rsi in this method's disassembly and %rax is set to the out-pointer @0x1444c4. Reading %rdi as
 * `this` is the mistake this shape invites, and it would put every field off by one argument.
 */
export interface HGStackState {
  /** out +0x00 — a copy of state->stackA (@0x1444d5). */
  stackA: HGExecutionUnitStackSlot | null;
  /** out +0x08 — a copy of state->stackB (@0x1444df). */
  stackB: HGExecutionUnitStackSlot | null;
  /** out +0x10 — stackA->at10 (@0x1444e7). */
  stackAAt10: bigint;
  /** out +0x18 — stackB->at10 (@0x1444ef). */
  stackBAt10: bigint;
  /** out +0x20 — a copy of state->stackIndex, int32 (@0x1444f9). */
  stackIndex: number;
}

/**
 * `HGExecutionUnit` — a Helium execution unit. Only `SwapStack()` is decoded here; the instance
 * layout beyond the +0x90 pointer is deliberately not modelled, because this method does not read
 * it.
 */
export class HGExecutionUnit {
  /** +0x90 — the state object, loaded unguarded @0x144574. */
  state: HGExecutionUnitState | null = null;

  /**
   * `HGExecutionUnit::SwapStack()` @Helium 0x144570 (__ZN15HGExecutionUnit9SwapStackEv).
   *
   * Sets `state->stackIndex` to 1 when it was exactly 0, and to 0 otherwise. See the file header:
   * this is a compare-against-zero and a store of the boolean, not a toggle — any non-zero value
   * becomes 0, which `x ^= 1` and `1 - x` both get wrong.
   *
   * @returns void.
   */
  SwapStack(): void {
    // @0x144574 movq 0x90(%rdi),%rax — the machine dereferences this unguarded; `!` models that
    // unchecked load rather than inventing a null check the binary does not have.
    const state = this.state!;
    // @0x14457b xorl %ecx,%ecx ; @0x14457d cmpl $0x0,0x98(%rax) ; @0x144584 sete %cl
    const cl = state.stackIndex === 0 ? 1 : 0;
    // @0x144587 movl %ecx,0x98(%rax)
    state.stackIndex = cl;
    // @0x14458d/@0x14458e — epilogue + retq.
  }

  /**
   * `HGExecutionUnit::GetStackState()` @Helium 0x1444c0 (__ZN15HGExecutionUnit13GetStackStateEv).
   *
   * FULL DISASM (raw-port/re/disasm/Helium.__ZN15HGExecutionUnit13GetStackStateEv.s, 14 instrs):
   *
   *   0x1444c4  movq %rdi, %rax           ; rax = the sret OUT-POINTER (returned in %rax)
   *   0x1444c7  movq 0x90(%rsi), %rcx     ; rcx = this->state   — NOTE: `this` is %rsi, not %rdi
   *   0x1444ce  movq 0x88(%rcx), %rdx     ; rdx = state->stackA
   *   0x1444d5  movq %rdx, (%rdi)         ; out+0x00 = stackA
   *   0x1444d8  movq 0x90(%rcx), %rsi     ; rsi = state->stackB
   *   0x1444df  movq %rsi, 0x8(%rdi)      ; out+0x08 = stackB
   *   0x1444e3  movq 0x10(%rdx), %rdx     ; rdx = stackA->+0x10
   *   0x1444e7  movq %rdx, 0x10(%rdi)     ; out+0x10
   *   0x1444eb  movq 0x10(%rsi), %rdx     ; rdx = stackB->+0x10
   *   0x1444ef  movq %rdx, 0x18(%rdi)     ; out+0x18
   *   0x1444f3  movl 0x98(%rcx), %ecx     ; ecx = state->stackIndex (32-bit)
   *   0x1444f9  movl %ecx, 0x20(%rdi)     ; out+0x20
   *
   * A pure snapshot: it reads five values and writes them into the caller's buffer. No branch, no
   * call, no store into `this` or into either stack object — SwapStack is the only writer of the
   * index, and this method just copies it out.
   *
   * THE RECEIVER IS IN %rsi. The returned struct is 0x24 bytes, larger than the 16 bytes the SysV
   * ABI returns in registers, so the caller passes a hidden out-pointer in %rdi and every explicit
   * argument shifts one register right. Reading %rdi as `this` here would decode
   * `movq 0x90(%rsi)` as a load from the FIRST argument of a method that has none, and every field
   * would come from the wrong object — which is why the oracle passes a poisoned out-buffer AND a
   * poisoned receiver and checks which one got written.
   *
   * BOTH STACK POINTERS ARE DEREFERENCED UNGUARDED (@0x1444e3, @0x1444eb), so a null in either
   * faults on the machine; the `!` assertions model that rather than inventing null checks.
   *
   * @returns the 0x24-byte snapshot the machine writes through the out-pointer.
   */
  GetStackState(): HGStackState {
    // @0x1444c7 movq 0x90(%rsi),%rcx — the state pointer, loaded unguarded.
    const state = this.state!;
    // @0x1444ce / @0x1444d5 — out+0x00 = state->stackA.
    const stackA = state.stackA;
    // @0x1444d8 / @0x1444df — out+0x08 = state->stackB.
    const stackB = state.stackB;
    // @0x1444e3 / @0x1444e7 — out+0x10 = stackA->+0x10 (unguarded dereference).
    const stackAAt10 = stackA!.at10;
    // @0x1444eb / @0x1444ef — out+0x18 = stackB->+0x10 (unguarded dereference).
    const stackBAt10 = stackB!.at10;
    // @0x1444f3 / @0x1444f9 — out+0x20 = state->stackIndex, moved as a 32-bit value.
    const stackIndex = state.stackIndex | 0;
    return { stackA, stackB, stackAAt10, stackBAt10, stackIndex };
  }

  /**
   * `HGExecutionUnit::CommitStack(float vector[4]*, unsigned long)` -> void
   * @Helium __ZN15HGExecutionUnit11CommitStackEPDv4_fm @0x1445b0..0x1445e6
   *
   * Every instruction is listed in the file header. Advance the current stack's count by `n`, but
   * only when `ptr` is exactly `base + count*16` computed in 64-bit registers — otherwise return
   * having changed nothing.
   *
   * There is a SECOND overload at @Helium 0x1445f0,
   * `CommitStack(HGVec*, unsigned long)` (`__ZN15HGExecutionUnit11CommitStackEP5HGVecm`), which is
   * a separate symbol and a separate unit; it is not transcribed here.
   *
   * ORACLED against the live exported symbol:
   * `raw-port/re/oracle/HGExecutionUnit_CommitStack_vec4_oracle.py` builds the real three-level
   * structure in ctypes memory — execution unit, state, and a stack behind each table index — and
   * runs under `arch -x86_64` after checking the eleven prologue bytes at slide+0x1445b0 against
   * `554889e5488b8790000000`. 360 cases: 60 randomized (index, count, n) triples crossed with six
   * pointers — the exact top, top-16, top+16, the base, null and a foreign address — requiring the
   * count to advance for the top and to stay put for every other pointer. **360/360 agree, with 0
   * stray writes** anywhere in the execution unit, the state object, the untouched stack, or the
   * chosen stack outside its +0x10 word.
   *
   * Those counts are drawn from ordinary values and can never reach the 64-bit wrap of the top
   * computation, so the oracle carries a second block of 9 cases that runs THIS FILE through
   * `HGExecutionUnit_CommitStack_vec4_driver.mts` and compares the port against the live symbol
   * directly — a live-versus-model harness cannot see a divergence that lives in the port's own
   * arithmetic. **9/9 agree**, including count = 2^60 with the caller passing the base, where
   * `count*16` is exactly 2^64. Priced as a mutant: the same block against a body that computes
   * the top without `BigInt.asUintN` kills 5 of 9. The four survivors are the three ordinary-count
   * controls and the one wrap case that must NOT commit (a body that never commits at the wrap
   * agrees there by accident), which is what says the block measures the port and not itself.
   *
   * @param ptr the pointer the caller is committing, as a numeric address.
   * @param n   how many float4 elements to commit (SysV %rdx, u64).
   */
  CommitStack(ptr: bigint, n: bigint): void {
    // @0x1445b4 movq 0x90(%rdi),%rax — loaded unguarded, as in the two methods above.
    const state = this.state!;
    // @0x1445bb movl 0x98(%rax),%ecx — zero-extended into the full register.
    const index = state.stackIndex >>> 0;
    // @0x1445c1 movq 0x88(%rax,%rcx,8),%rax — entry `index` of the +0x88 table, stride 8: entry 0
    // is stackA (+0x88) and entry 1 is stackB (+0x90). An index of 2 or more addresses +0x98 and
    // beyond, i.e. the machine loads the selector word itself and dereferences it as a pointer; a
    // two-slot model cannot represent that, so it is a loud throw rather than a quiet clamp.
    if (index > 1) {
      throw new Error(
        `HGExecutionUnit::CommitStack @Helium 0x1445c1: stackIndex ${index} indexes past the ` +
          "two-entry table at state+0x88, where the machine would load the selector at +0x98 " +
          "and dereference it as a stack pointer",
      );
    }
    const stack = (index === 0 ? state.stackA : state.stackB)!;
    // @0x1445c9 movq 0x10(%rax),%rcx.
    const count = stack.at10;
    // @0x1445cd/@0x1445d0/@0x1445d4 — rdi = base + (count << 4), in 64-bit registers. BOTH
    // truncations are the instruction: `shlq $0x4` (48 c1 e7 04) discards the four bits it shifts
    // out of %rdi, and `addq (%rax), %rdi` (48 03 38) wraps mod 2^64. Without them the top lands
    // where no 64-bit pointer can be and the compare below never fires — see THE WIDTHS in the
    // file header for the measurement.
    const top = BigInt.asUintN(64, stack.base + BigInt.asUintN(64, count << 4n));
    // @0x1445d7/@0x1445da — cmpq %rdi, %rsi ; je. Anything but the exact top returns silently.
    if (ptr !== top) return; // @0x1445dc
    // @0x1445de/@0x1445e1 — addq %rdx, %rcx ; movq %rcx, 0x10(%rax).
    stack.at10 = BigInt.asUintN(64, count + n);
  }
}
