// raw-port/src/infra/FFAudioStreamScope.ts
//
// FCP `FFAudioStreamScope` — Flexo.framework. This file ports ONE ledger unit,
// `ScopePreRenderEnd()`; the rest of the class (30 symbols in the inventory) accretes here as
// future units claim it. Checked before creating the file:
//   git ls-tree origin/main -r --name-only | grep -i FFAudioStreamScope   -> no hits,
// so this is not the "same class forked into a second layer directory" shape.
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//         (macOS FCP, x86_64 slice).
//
// -----------------------------------------------------------------------------
// SYMBOL PORTED
// -----------------------------------------------------------------------------
//   * __ZN18FFAudioStreamScope17ScopePreRenderEndEv
//       -- FFAudioStreamScope::ScopePreRenderEnd()   @Flexo 0xe6cc50   (`nm` class t, file-local)
//
// FULL DISASM (raw-port/re/disasm/Flexo.__ZN18FFAudioStreamScope17ScopePreRenderEndEv.s):
//
//   0xe6cc50  pushq %rbp
//   0xe6cc51  movq  %rsp, %rbp
//   0xe6cc54  popq  %rbp
//   0xe6cc55  retq
//   0xe6cc56  nopw  %cs:(%rax,%rax)      ; padding, not code
//
// THE BODY IS EMPTY, AND "EMPTY" IS THE ANSWER THAT MOST DESERVES EVIDENCE, because it is also
// what a failed decode looks like: OPS_LOG records that `disasm.sh` can return zero lines for a
// symbol that is present (a desynchronised linear sweep), and that treating that as an empty BODY
// once cost this project 198 symbols. Four independent reasons this one is genuinely empty:
//
//   1. The disassembly is not zero-length — it is a complete frame: prologue, epilogue, `retq`.
//      A missing decode produces NO label and no lines, not four correct instructions.
//   2. The BYTES at the address are exactly `55 48 89 e5 5d c3`, read out of the live mapped image
//      by the oracle before it reports anything. There is no room in six bytes for elided work.
//   3. The SIBLING CLASS'S OVERRIDE OF THE SAME HOOK IS NOT EMPTY.
//      `FFAudioStreamObjectScope::ScopePreRenderEnd` @Flexo 0xe6c6d0 loads `this->+0xa0` and tail-
//      jumps into an ObjC dispatch (`-[… containedRolesForRoleKey:]`). So the empty body here is a
//      deliberate per-class override of a hook that other classes implement, not a hook nobody
//      implements and not a decode that lost its content.
//   4. Its PAIR is empty the same way: `FFAudioStreamScope::ScopePreRenderBegin(long long,
//      FFPrerollSync*)` @Flexo 0xe6cc40 is the identical four instructions. This class opts out of
//      both ends of the pre-render bracket, which is a coherent thing for a class to do and not a
//      coincidence two separate decode failures would produce.
//
// So the faithful port is a function that does nothing — NOT a throw, and not an invented
// side effect. There is no callee to defer to (no `call`, no `jmp`, no vtable slot) and nothing to
// be incomplete about: an "unimplemented" throw here would be strictly LESS faithful than the empty
// body, because the machine returns normally and any caller relying on that would break.
//
// DIFFERENTIAL vs the live binary — raw-port/re/oracle/FFAudioStreamScope_ScopePreRenderEnd_
// {oracle.py,driver.mts}. The claim to test for a void, empty method is "it changes nothing", so the
// harness calls the live function on a 0xCD-poisoned 0x200-byte receiver and byte-diffs the whole
// arena: 32 calls, 0 bytes changed. The differ is proven non-blind on the same buffer (flip one
// byte -> detected), because "nothing changed" from a harness that cannot see a change is the
// vacuous verdict this whole family of ports invites.

/**
 * `FFAudioStreamScope` — a Flexo audio stream scope. The instance layout is deliberately NOT
 * modelled: the one method decoded here reads nothing (it does not even move %rdi), and inventing
 * fields from a method that does not touch them is what PORTING_SPEC Rule 5 forbids.
 */
export class FFAudioStreamScope {
  /**
   * `FFAudioStreamScope::ScopePreRenderEnd()` @Flexo 0xe6cc50
   * (__ZN18FFAudioStreamScope17ScopePreRenderEndEv).
   *
   * Disasm mirror (4 asm lines):
   *   pushq %rbp / movq %rsp,%rbp                               @0xe6cc50..0xe6cc53
   *   popq  %rbp / retq                                         @0xe6cc54..0xe6cc55
   *
   * Does nothing and returns void. This class overrides the pre-render-end hook with an empty
   * body — see the file header for the four pieces of evidence that the emptiness is the function
   * rather than a failed decode, including the sibling class's non-empty override of the same hook
   * at @0xe6c6d0.
   *
   * @returns void.
   */
  ScopePreRenderEnd(): void {
    // @0xe6cc50..0xe6cc53 — prologue; @0xe6cc54..0xe6cc55 — epilogue + retq. No load, no store, no
    // call, no branch, and %rdi is never moved: the frame is the whole function.
  }
}
