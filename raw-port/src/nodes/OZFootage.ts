// OZFootage — Ozone's footage/media node (the object behind a clip's source
// asset). This file transcribes ONE method today:
//
//   OZFootage::updateAssociatedResourcesAvailable()
//   MANGLED: __ZN9OZFootage34updateAssociatedResourcesAvailableEv
//   ADDRESS: Ozone @0x00000000000bcdc0 (x86_64 slice)
//
// The class has 569 symbols in the Ozone symbol table; none of the others is in
// this claim. A later worker adding a sibling method must EXTEND this file
// (ADD-only), never rewrite it.
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// Ozone.framework/Versions/A/Ozone, x86_64 slice, unadjusted VAs from
// `otool -arch x86_64 -tvV`. Disassembly source (regenerated in-worktree):
//   raw-port/re/disasm/__ZN9OZFootage34updateAssociatedResourcesAvailableEv.s
//
// ─── FULL DISASM (verbatim — the ENTIRE function, 0xbcdc0..0xbcdc7) ───
//
//   __ZN9OZFootage34updateAssociatedResourcesAvailableEv:
//   0xbcdc0  pushq  %rbp              ; frame prologue
//   0xbcdc1  movq   %rsp, %rbp
//   0xbcdc4  xorl   %eax, %eax        ; return register = 0  (the ONLY effect)
//   0xbcdc6  popq   %rbp              ; frame epilogue
//   0xbcdc7  retq
//   0xbcdc8  nopl   (%rax,%rax)       ; inter-function padding to the 0xbcdd0
//                                     ; boundary where OZFootage::makeClipIdle()
//                                     ; begins — NOT part of this body.
//
// That is the whole thing: five instructions, three of which are the standard
// frame. There is no load of `this` (%rdi is never touched), no store, no call,
// no branch. The body is EMPTY in the gate's classification sense, and this is
// the genuine shipped code, not a truncated dump:
//   * the byte after the epilogue is the padding `nopl` that separates this
//     symbol from `__ZN9OZFootage12makeClipIdleEv` @0xbcdd0 in the SAME otool
//     run, so the function demonstrably ends at 0xbcdc7;
//   * the symbol-table neighbours bracket it exactly — `updateModifiedDate`
//     @0xbcd80, this @0xbcdc0, `makeClipIdle` @0xbcdd0 (0x10 bytes of span,
//     8 of them body, 8 padding);
//   * the oracle below CALLS the live symbol on a poisoned object and observes
//     zero stores, which is the behavioural half of the same claim (OPS_LOG
//     warns that a truncated disassembly can turn a REAL body into an
//     apparently empty one — running it is what rules that out).
//
// WHY IT IS EMPTY. The name says "update ... available", and every sibling
// `update*` in this class does real work (`updateMissingFile` @0xbcdf0 is 400+
// bytes with a stack guard; `updateModifiedDate` @0xbcd80; `updateLayerChannels`
// @0xbec00). This one is the exception: the shipping build compiles it to
// nothing. That is a fact about the binary, and the faithful port is a function
// that does nothing — inventing plausible "associated resource" bookkeeping here
// would be exactly the rewrite-instead-of-transcribe defect PORTING_SPEC Rule 1
// forbids, and a throw-stub would be the in-scope cheat DEP_WORKER_BRIEF forbids
// (there is no undecoded work to defer to: the body is fully decoded and it is
// empty).
//
// ─── RETURN VALUE ───
//
// `xorl %eax, %eax` sets the SysV return register to 0 before the epilogue.
// Itanium mangling does not encode return types for non-template functions, so
// the mangled name cannot tell us whether the C++ declaration is `void`, `bool`
// or `int` — the only thing observable at the ABI boundary is that %rax is 0 on
// return. This port therefore returns the number 0 rather than declaring `void`,
// so the one instruction with an effect is not silently dropped. The oracle
// checks that value against the live symbol.
//
// ─── DEPS ───
//
// `python3 raw-port/army/tools/depgraph.py deps
//  __ZN9OZFootage34updateAssociatedResourcesAvailableEv` prints NOTHING: no
// in-scope callees and no externs. Nothing is imported here and nothing is
// called.
//
// ─── ORACLE ───
//
// raw-port/re/oracle/OZFootage_updateAssociatedResourcesAvailable_oracle.py
// (run under `arch -x86_64 /usr/bin/python3` — every address above is an x86_64
// offset; OPS_LOG, "the executable oracle calls the wrong architecture"). It
// dlsym's the live Ozone symbol (Ozone loads outside the app bundle once its
// @rpath chain is preloaded depth-first) and calls it on 0x2200-byte objects
// pre-filled with poison patterns, checking BOTH halves of the claim: the return
// value is 0 for every input, and not one byte of the object is modified.

/**
 * OZFootage — opaque here. This method never dereferences `this` (%rdi is not
 * read anywhere in the body), so no field of the object is known from it and
 * none is modelled. Siblings that DO touch the layout will add their offsets to
 * this interface as they are claimed: `makeClipIdle` @0xbcdd0 already shows a
 * `PMClip*` at +0x21a0, but that address is provenance for THAT symbol, not
 * this one, so it is named here only as a pointer for the reader and left out
 * of the type.
 */
export interface OZFootage {
  readonly __brand: "OZFootage";
}

/**
 * `OZFootage::updateAssociatedResourcesAvailable()` — @Ozone 0x00000000000bcdc0
 *   `__ZN9OZFootage34updateAssociatedResourcesAvailableEv`
 *
 * The complete body, instruction for instruction:
 *
 *   0xbcdc0  pushq %rbp            — prologue, no observable effect
 *   0xbcdc1  movq  %rsp, %rbp      — prologue, no observable effect
 *   0xbcdc4  xorl  %eax, %eax      — return register = 0   <- the only effect
 *   0xbcdc6  popq  %rbp            — epilogue
 *   0xbcdc7  retq
 *
 * No read of `this`, no store, no call, no branch. Verified by execution against
 * the live Ozone binary, not by reading alone: 40 poisoned 0x2200-byte objects,
 * 0 bytes mutated, return 0 every time.
 *
 * @param _footage the `this` pointer in %rdi. Accepted so the port keeps the
 *   real ABI shape, and deliberately unused — the binary never reads it.
 * @returns 0, the value `xorl %eax, %eax` @0xbcdc4 leaves in the return register.
 */
export function OZFootage_updateAssociatedResourcesAvailable(_footage: OZFootage): number {
  // 0xbcdc4  xorl %eax, %eax — nothing else happens between the prologue and
  // the epilogue.
  return 0;
}
