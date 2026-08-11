// (anonymous namespace)::HeapPoolFixedAllocationPolicy<0, 2097152> — Helium.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// Helium.framework/Versions/A/Helium (x86_64 slice; unadjusted VAs from `otool -tV`).
// Disassembly source:
//   raw-port/re/disasm/Helium.__ZN12_GLOBAL__N_129HeapPoolFixedAllocationPolicyILi0ELi2097152EED0Ev.s
//
// Ports ONLY the D0 (deleting) destructor @0x1a8710. Everything else on this policy — D1 @0x1a8700,
// `pad(HGMetalHeapPool::Descriptor const&)` @0x1a8720, and the `shared_ptr`/`__shared_ptr_emplace`
// instantiations that wrap it (@0x577e0, @0x1a8690, @0x1a86b0, @0x1a86e0, @0x1a86f0) — are separate
// ledger entries and OUT OF SCOPE for this file.
//
// NAMING. The C++ entity is a TEMPLATE INSTANTIATION inside an ANONYMOUS NAMESPACE:
// `(anonymous namespace)::HeapPoolFixedAllocationPolicy<0, 2097152>`. The file follows the two
// conventions already landed here — template arguments join the class name with underscores
// (`PCMatrix44Tmpl_double.ts`, named in PORTING_SPEC), and an anonymous-namespace entity is filed
// under its own name rather than a synthetic namespace prefix (`invert_anon.ts`,
// `map_find_PCCFRef_CGColorSpace_CacheData.ts`). Hence
// `HeapPoolFixedAllocationPolicy_0_2097152.ts`. The template arguments are part of the name because
// a different instantiation is a DIFFERENT class with its own addresses: `<0, 2097152>` is the only
// one in this binary today, and naming it `HeapPoolFixedAllocationPolicy.ts` would silently collide
// with the next one. Checked before writing: no file matching `*HeapPool*` other than
// `HGMetalHeapPool__Descriptor.ts` exists on origin/main under any case.
//
// 2097152 = 0x200000 = 2 MiB, the fixed block size this policy hands the Metal heap pool (the
// second template argument); 0 is the first. That is arithmetic on the mangled name, not a decode
// of behaviour — nothing in the ported body reads either value.
//
// -----------------------------------------------------------------------------
// FULL DISASM — D0, the deleting destructor
// -----------------------------------------------------------------------------
//   0x1a8710  pushq %rbp
//   0x1a8711  movq  %rsp, %rbp
//   0x1a8714  popq  %rbp
//   0x1a8715  jmp   0x3c4fa0            ## symbol stub for: __ZdlPv  (operator delete(void*))
//   0x1a871a  nopw  (%rax,%rax)         ; inter-function alignment padding, not part of the body
//
// The whole body is a TAIL JUMP to `operator delete`. Two things follow, and both are checked
// against the live image by the oracle beside this file:
//
//  1. **No member teardown happens, because there is none to do.** The sibling D1
//     (complete-object destructor) @0x1a8700 is `pushq %rbp; movq %rsp,%rbp; popq %rbp; retq` — a
//     trivial destructor — so D0 has nothing to run before freeing. This is why D0 does not `call`
//     D1: there is nothing there. (D1 is its own ledger unit; it is quoted here only as the
//     evidence for "no teardown", exactly as `pushElement` is quoted in PCSerializerReadStream.)
//  2. **The only callee is the C++ runtime's global deallocation function**, reached through
//     Helium's `__ZdlPv` symbol stub at 0x3c4fa0 — a TRUE out-of-scope extern (libc++), not an
//     in-scope callee that could have been ported.
//
// -----------------------------------------------------------------------------
// WHY `operator delete` IS A DOCUMENTED NO-OP HERE AND NOT A THROW
// -----------------------------------------------------------------------------
// Both shapes are landed precedent: `PCUnsupportedOperationException.ts` routes its D0's
// `__ZdlPv` into a throwing `cxx_operator_delete`, while `PCICCTransferFunctionGamma.ts` and
// `PCMatchmoveProblem.ts` model the same tail-jump as a JS-GC-implicit no-op with the address
// cited. The no-op is right for THIS unit, for a reason worth stating rather than assuming:
//
//   * PORTING_SPEC rule 3's throw is for something UNDECODED — "a loud gap is correct, a plausible
//     guess is a defect". Nothing here is undecoded. The body is four instructions, all of them
//     transcribed, and the callee is identified, addressed, and out of scope by the brief's own
//     list (libc/`operator new`/`operator delete`).
//   * The deallocation has no JavaScript counterpart at all: there is no storage for the port to
//     release, and GC reclaims the object once the last reference drops. Modelling it as a throw
//     would make a COMPLETE transcription unusable by every future caller of this destructor, which
//     is a real cost paid for no fidelity — the throw would announce a gap that does not exist.
//   * What the throw usefully protects — "do not silently pretend an unported in-scope callee ran"
//     — is not in play: `__ZdlPv` is the C++ runtime, and it is named with its stub address so the
//     ledger can see exactly what was elided.
//
// So the method is a no-op whose comment carries the tail-jump's address, and the file says out
// loud that after it runs the object is FREED in the C++ semantics — a caller that keeps using the
// instance is doing something the binary would not survive either.

/**
 * `(anonymous namespace)::HeapPoolFixedAllocationPolicy<0, 2097152>` — the fixed-size allocation
 * policy Helium's Metal heap pool is parameterised on (2 MiB blocks; see the header note on the
 * template arguments). Only its D0 destructor is ported in this file; every other member is a
 * separate ledger entry.
 *
 * The class carries NO modelled state deliberately: no method ported here reads a field, and the
 * trivial D1 @0x1a8700 proves there is nothing to tear down. Fields will be added by whichever unit
 * first decodes one (`pad` @0x1a8720 is the likely first), recovered from that method's disassembly
 * rather than guessed at now.
 */
export class HeapPoolFixedAllocationPolicy_0_2097152 {
  /**
   * `~HeapPoolFixedAllocationPolicy<0, 2097152>()` [D0, deleting destructor]
   * — @Helium 0x1a8710
   * (__ZN12_GLOBAL__N_129HeapPoolFixedAllocationPolicyILi0ELi2097152EED0Ev).
   *
   * Four instructions, transcribed in full:
   *
   *   0x1a8710  pushq %rbp        ; frame setup
   *   0x1a8711  movq  %rsp, %rbp
   *   0x1a8714  popq  %rbp        ; frame torn down BEFORE the jump — this is a tail call, so
   *                               ; `operator delete` returns to D0's caller, not to D0
   *   0x1a8715  jmp   0x3c4fa0    ; __ZdlPv stub — operator delete(void*), libc++ extern
   *
   * There is no member teardown because the complete-object destructor D1 @0x1a8700 is trivial
   * (`pushq %rbp; movq %rsp,%rbp; popq %rbp; retq`), which is also why D0 does not call it.
   *
   * In C++ terms this frees the object's storage. JavaScript has no counterpart: GC reclaims the
   * instance once the last reference drops, so the ported body has nothing to execute. See the
   * file header for why this is a documented no-op rather than a throwing stub — nothing here is
   * undecoded, and `__ZdlPv` is an out-of-scope runtime extern named with its stub address.
   *
   * CALLERS: after this returns, the instance is DEAD in the semantics being modelled. Nothing in
   * the port enforces that (JS cannot), and the oracle beside this file deliberately does not call
   * the live function for the same reason — invoking a deleting destructor on storage the harness
   * does not own would hand a foreign pointer to the process allocator.
   */
  dtorD0(): void {
    // @0x1a8710..0x1a8714 — prologue and its teardown (no TS-visible effect).
    // @0x1a8715 — jmp __ZdlPv (operator delete(void*)) via the Helium stub at 0x3c4fa0.
    //             The object's storage is released here; in JS that is GC's business and there is
    //             nothing to run. No fallback value is invented and nothing else is touched.
  }
}
