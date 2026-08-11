// OZRig.ts — Ozone OZRig (raw x86_64 port).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//         Versions/A/Ozone (macOS FCP, x86_64 slice; unadjusted VAs).
//
// This unit ports ONE accessor:
//
//   __ZN5OZRig17begin_descendantsEv
//     — OZRig::begin_descendants()   @Ozone 0x531e60
//
// This is a FRESH class (not previously on origin/main). Every other OZRig
// method is a separate ledger entry and must be ADDED to this file (additive
// extension only), never rewritten.
//
// Re-derive with:
//   raw-port/tools/disasm.sh --sym __ZN5OZRig17begin_descendantsEv Ozone
//
// -----------------------------------------------------------------------------
// FULL DISASM (raw-port/re/disasm/__ZN5OZRig17begin_descendantsEv.s — 7 lines)
// -----------------------------------------------------------------------------
//   __ZN5OZRig17begin_descendantsEv:
//     0x531e60  pushq %rbp                ; frame prologue
//     0x531e61  movq  %rsp, %rbp
//     0x531e64  movq  0x4c0(%rdi), %rax   ; rax = *(u64*)(this + 0x4c0)
//     0x531e6b  popq  %rbp                ; frame epilogue
//     0x531e6c  retq                      ; return rax
//     0x531e6d  nopl  (%rax)              ; alignment pad — no effect
//
// FRONTIER CALLEES — none. A single qword field read; no calls, no branches, no
// arithmetic, no in-scope callee, no extern, no indirect or virtual dispatch
// (`depgraph.py deps __ZN5OZRig17begin_descendantsEv` lists nothing).
//
// DECODE NOTES
//   * The return is REGISTER-class (a single qword in %rax), not the sret shape
//     that OZScene's iterator getters use (`end_all_sel` @0x50cc0 builds a
//     0x54-byte record through a hidden %rdi pointer). So this "begin" iterator
//     is exactly one pointer wide — the descendants collection's first node —
//     and the function is a plain getter for the slot that holds it.
//   * NOTHING is dereferenced: the qword is loaded and returned as-is. A null
//     or garbage value in the slot is returned unchanged, and this port does the
//     same rather than inventing a guard the machine does not perform.
//   * The pointee's layout is NOT decodable from this instruction, so the value
//     is modelled as an OPAQUE handle rather than as a typed node. Whatever the
//     linked-node shape turns out to be belongs to the method that first walks
//     it, per Rule 3.
//
// STRUCT LAYOUT (partial — recovered only from this accessor)
//   OZRig {
//     ...
//     +0x4c0  u64  descendantsBegin   ; movq 0x4c0(%rdi), %rax @0x531e64
//     ...
//   }
// Only this slot is derivable here; the rest of the object is OPAQUE and
// intentionally NOT modelled.
//
// -----------------------------------------------------------------------------
// ORACLE EVIDENCE (differential vs the LIVE Final Cut Pro binary)
// -----------------------------------------------------------------------------
// Checked against the real function, which required first establishing that
// OZONE IS DLOPEN-ABLE outside the app bundle — the standing note that it is
// not turns out to be a @rpath problem only, and DYLD_FRAMEWORK_PATH cannot fix
// it because the hardened system Python strips DYLD_*. What works: walk
// `otool -L`'s @rpath entries and `ctypes.CDLL(<absolute path>, RTLD_GLOBAL)`
// each dependency depth-first, then load Ozone; 43 images preload and Ozone
// loads. (The same recipe works for Flexo — see FFAudioPlaybackScrubBuffer.ts.)
// The harness then runs under `arch -x86_64 /usr/bin/python3` (the port is
// transcribed from the x86_64 slice) and resolves this LOCAL (`nm` type `t`)
// symbol as `nm -n -arch x86_64` vmaddr 0x531e60 + the dyld image slide — NOT
// the bare `nm -n` fct/parity/local_call uses, which reports the ARM64 slice
// even from a Rosetta process.
// 4,096 cases on a 0x600-byte buffer refilled with fresh random noise each
// time, with the +0x4c0 qword set to 0, 1, 0xffffffffffffffff, 2^63, small
// values and random u64s: 4096/4096 returned exactly the qword this port
// returns, and the buffer was never modified in ANY case (the getter really is
// read-only). The per-case noise is what validates the OFFSET: the harness
// writes the qword at +0x4c0 because this port claims it lives there, so a
// wrong claim would have had FCP return noise and no case could match.
// NEGATIVE CONTROLS (measured): truncating the result to 32 bits -> 3754 of
// 4096 wrong; adding an invented "0xffffffffffffffff means unset -> null"
// guard -> 114 wrong. (A raw byte-offset mutation is not expressible in a
// field-modelled port; the noise fill is what covers that case instead.)

/**
 * The value `OZRig::begin_descendants()` returns: the first node of the rig's
 * descendants collection, as a single opaque pointer.
 *
 * Modelled as an opaque handle because the body never dereferences it — the
 * pointee's layout is not decodable from `movq 0x4c0(%rdi), %rax` alone, and
 * inventing one would be a guess. `null` models the null pointer.
 */
export interface OZRigDescendantNodeHandle {
  readonly __ozRigDescendantNode: true;
}

/**
 * `OZRig` — Ozone rig object.
 *
 * Only the +0x4c0 slot and its accessor are decoded here; all other fields are
 * undecoded and omitted. They will be added additively as sibling methods are
 * ported.
 */
export class OZRig {
  /**
   * (this+0x4c0) — the descendants collection's first node, one qword.
   *
   * Read by `begin_descendants()` @Ozone 0x531e64 via `movq 0x4c0(%rdi), %rax`;
   * the `q` suffix is what pins the width at 8 bytes. Its writer is FRONTIER
   * (not decoded here), so the initial `null` is this file's undecoded-slot
   * default rather than a claim about the real constructor.
   */
  descendantsBegin_at_0x4c0: OZRigDescendantNodeHandle | null = null;

  /**
   * `OZRig::begin_descendants()` — @Ozone 0x531e60
   *   (__ZN5OZRig17begin_descendantsEv).
   *
   * Faithful line-for-line transcription of the 7-line disassembly quoted in
   * the file header: load the qword at this+0x4c0 and return it.
   *
   *   @0x531e64  movq 0x4c0(%rdi), %rax   ; rax = this->descendantsBegin_at_0x4c0
   *   @0x531e6c  retq                     ; return rax
   *
   * No callees, no branches, no dereference — a plain pointer getter. The value
   * is returned verbatim, including a null or otherwise invalid pointer.
   */
  begin_descendants(): OZRigDescendantNodeHandle | null {
    // @0x531e64 movq 0x4c0(%rdi), %rax : load the first-descendant pointer.
    // @0x531e6c retq                   : return it unchanged.
    return this.descendantsBegin_at_0x4c0;
  }
}
