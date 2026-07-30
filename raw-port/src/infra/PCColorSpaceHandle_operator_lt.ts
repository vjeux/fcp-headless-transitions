// PCColorSpaceHandle_operator_lt.ts — free function
//   operator<(PCColorSpaceHandle const&, PCColorSpaceHandle const&)
//
// Faithful transcription from ProCore symbol
//   __ZltRK18PCColorSpaceHandleS1_   @ProCore 0x9b3ec
// (see raw-port/re/disasm/ProCore.__ZltRK18PCColorSpaceHandleS1_.s).
//
// Full disassembly (only 6 body instructions — a bare pointer compare):
//
//   0x9b3ec  pushq %rbp
//   0x9b3ed  movq  %rsp, %rbp
//   0x9b3f0  movq  (%rdi), %rax             ; rax = a.handle (u64 at +0x00)
//   0x9b3f3  cmpq  (%rsi), %rax             ; sets flags on rax - b.handle
//   0x9b3f6  setb  %al                      ; al = (rax < b.handle) ? 1 : 0  (UNSIGNED)
//   0x9b3f9  popq  %rbp
//   0x9b3fa  retq                           ; returns al zero-extended
//
// Structure recovered / assumed:
//   - PCColorSpaceHandle is a 1-field struct with `CGColorSpace* handle` at offset
//     +0x00 (see raw-port/src/infra/PCColorSpaceHandle.ts docstring — decoded from
//     the destructor at Flexo 0x601fc0 whose only load is `movq (%rdi),%rdi`).
//   - `setb` is the UNSIGNED-less-than setter (CF=1 pair with `jb`/`ja`/`jae`/`jbe`).
//     A pointer compare on x86_64 is always unsigned (address space).
//
// Semantics: strict-less-than over the RAW POINTER VALUE (not any color-space
// identity). This is the exact same body the compiler emits for
//   bool operator<(H const& a, H const& b) { return a.handle < b.handle; }
// with `handle` being a `CGColorSpace*`. Under STL/map ordering that gives a total
// order on any handle set within one process — matching the C++ site's use.
//
// JS caveat: we cannot obtain a raw address for a JS object. Our
// CGColorSpaceRef is modelled as a placeholder object (see PCColor.ts), and JS
// has no way to expose a numerically-ordered pointer for it. The ONLY faithful
// port that respects the machine's semantics without fabricating an ordering is
// to (a) match null vs null equality via `return false`, and (b) throw for any
// two distinct non-null handles, citing the extern @0xADDR — because the true
// answer (compare the underlying CGColorSpace* pointer) requires a
// pointer-comparison primitive that does not exist at the JS boundary. This is
// the same discipline used for value-producing externs across this port (see
// CGColorSpaceCreateWithName / CFBundleGetBundleWithIdentifier).

import { PCColorSpaceHandle } from "./PCColorSpaceHandle";

/**
 * `operator<(PCColorSpaceHandle const&, PCColorSpaceHandle const&)`.
 *
 * @ProCore 0x9b3ec (`__ZltRK18PCColorSpaceHandleS1_`).
 *
 * Machine body: `return a.handle < b.handle` under UNSIGNED (pointer) compare.
 * See the file docstring above for the full 6-instruction transcription and
 * the JS-boundary caveat.
 */
export function PCColorSpaceHandle_operator_lt(
  a: PCColorSpaceHandle,
  b: PCColorSpaceHandle,
): boolean {
  // @ProCore 0x9b3f0..0x9b3fa — pointer-value compare.
  // If both handles are null (0 vs 0), `setb` yields 0 -> false. Fast path.
  if (a.handle === null && b.handle === null) return false;
  // If either side is null but not both: null pointer is numerically 0, so
  //   (a.handle < b.handle) == (0 < non-null) == true,  when a is null
  //   (a.handle < b.handle) == (non-null < 0) == false, when b is null
  // The machine implements these two cases correctly by unsigned compare of
  // the raw pointer bits; we mirror that literally here.
  if (a.handle === null) return true;
  if (b.handle === null) return false;
  if (a.handle === b.handle) {
    // Same object identity => `movq (%rdi),%rax; cmpq (%rsi),%rax` yields
    // rax==0, setb writes 0. Return false.
    return false;
  }
  // Two distinct non-null CGColorSpace* — a true unsigned pointer compare.
  // JS has no primitive to observe object addresses; producing any answer
  // here would fabricate ordering the FCP binary defines by machine-level
  // pointer value. Throw as an out-of-scope boundary primitive citing the
  // exact FCP address the value would have come from (`cmpq (%rsi),%rax`
  // at @ProCore 0x9b3f3), matching the extern-boundary convention already
  // used for CGColorSpaceRef-producing externs elsewhere in the port.
  throw new Error(
    "operator<(PCColorSpaceHandle,PCColorSpaceHandle) @ProCore 0x9b3ec: " +
      "raw CGColorSpace* pointer compare not observable at JS boundary " +
      "(would require the address `cmpq (%rsi),%rax` reads at @0x9b3f3)",
  );
}
