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
//       -- HGExecutionUnit::SwapStack()   @Helium 0x144570   (`nm` class T)
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
  /** +0x98 — int32 stack selector; read @0x14457d, written @0x144587. */
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
}
