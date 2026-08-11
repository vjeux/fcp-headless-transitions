// raw-port/src/render/HGExecutionUnit.ts
//
// FCP `HGExecutionUnit` — Helium.framework. This file ports ONE ledger unit, `SwapStack()`; the
// rest of the class accretes here as future units claim it (one C++ class = one file). Checked
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
  /** +0x10 — a 64-bit value, read @0x1444e3 (from +0x88's object) and @0x1444eb (from +0x90's). */
  at10: bigint;
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
}
