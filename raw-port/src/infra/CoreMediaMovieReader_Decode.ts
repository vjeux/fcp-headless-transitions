// CoreMediaMovieReader_Decode — Flexo CoreMedia movie-reader decode state (partial port).
//
// Transcribed from /Applications/Final Cut Pro.app/Contents/Frameworks/
// Flexo.framework/Versions/A/Flexo (x86_64 slice). Disassembly source:
//   raw-port/re/disasm/Flexo.__ZNK27CoreMediaMovieReader_Decode50hasValidDecompressionSessionOrH26xByteStreamHelperEv.s
//
// This file ports ONLY the symbol listed under "Symbols ported here" below;
// every other CoreMediaMovieReader_Decode method is a separate ledger entry and
// will be ADDED to THIS file (additive extension only) when claimed.
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT (partial — only the three slots this predicate reads)
// -----------------------------------------------------------------------------
// CoreMediaMovieReader_Decode {
//   ...                          // +0x00..+0x17 not decoded here
//   void* decompressionSession;  // +0x18 — a POINTER, tested against 0 by
//                                //   `cmpq $0x0, 0x18(%rdi)` @0xde9492. Non-null is
//                                //   the short-circuit "yes" for the first half of
//                                //   the method's name. A `cmpq` against $0 is an
//                                //   8-byte test, which is what makes it a pointer
//                                //   (or at least a 64-bit slot) rather than a flag.
//   ...                          // +0x20..+0x27 not decoded here
//   Owner* byteStreamOwner;      // +0x28 — a pointer that the second path
//                                //   dereferences with `movq 0x28(%rdi), %rax`
//                                //   @0xde949e. NOTE it is dereferenced with NO null
//                                //   check, so the binary treats this slot as an
//                                //   invariant non-null member; a null here would
//                                //   fault in the real code too.
//   ...
// }
// Owner {                        // the pointee at +0x28
//   ...                          // +0x00..+0x57 not decoded here
//   void* h26xByteStreamHelper;  // +0x58 — tested against 0 by
//                                //   `cmpq $0x0, 0x58(%rax)` @0xde94a2; the `setne`
//                                //   that follows is the method's return value.
// }
// Neither pointee's contents are modelled: no decoded instruction here reads
// anything but their null-ness, and naming more would be the magic-offset
// guesswork PORTING_SPEC Rule 5 forbids.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
//   hasValidDecompressionSessionOrH26xByteStreamHelper — none. Eleven
//     instructions, two compares, two loads; no callq, no symbol stub, no
//     indirect call. `depgraph.py deps` reports nothing at all.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZNK27CoreMediaMovieReader_Decode50hasValidDecompressionSessionOrH26xByteStreamHelperEv
//       — CoreMediaMovieReader_Decode::hasValidDecompressionSessionOrH26xByteStreamHelper() const
//         @Flexo 0xde9490
//
// -----------------------------------------------------------------------------
// FULL DISASM — @0xde9490 (12 lines, the entire function)
// -----------------------------------------------------------------------------
//   0xde9490  movb  $0x1, %al             ; al = 1 — the answer for the FAST path,
//                                         ;   set BEFORE the test (note: no frame yet)
//   0xde9492  cmpq  $0x0, 0x18(%rdi)      ; flags on (this->decompressionSession - 0)
//   0xde9497  je    0xde949a              ; ZF=1 (it IS null) -> fall through to the
//                                         ;   second test; otherwise drop to the retq
//   0xde9499  retq                        ; NON-NULL session -> return al = true
//   0xde949a  pushq %rbp                  ; SLOW PATH ONLY frame prologue
//   0xde949b  movq  %rsp, %rbp
//   0xde949e  movq  0x28(%rdi), %rax      ; rax = this->byteStreamOwner (NO null check)
//   0xde94a2  cmpq  $0x0, 0x58(%rax)      ; flags on (owner->h26xByteStreamHelper - 0)
//   0xde94a7  setne %al                   ; al = ZF==0 = (helper != null)
//   0xde94aa  popq  %rbp                  ; epilogue
//   0xde94ab  retq
//   0xde94ac  nopl  (%rax)                ; padding — not executed
//
// This is a SHORT-CIRCUIT OR, exactly as the name says, and the shape is the
// giveaway: `movb $0x1, %al` runs before the first compare and there is a bare
// `retq` at @0xde9499 with no stack frame at all, so a non-null decompression
// session returns true in four instructions without ever touching +0x28. The
// second operand is only evaluated when the first is null — which also means
// the unguarded dereference of +0x28 is only reached on that path.
//
// `setne` (ZF-based) is strict "not equal to zero", the standard null test. The
// compares are `cmpq`, i.e. the full 64 bits: a pointer whose low 32 bits happen
// to be zero is still non-null, and the differential below carries values that
// distinguish those.

/**
 * `CoreMediaMovieReader_Decode` — Flexo's CoreMedia movie-reader decode state.
 * This file currently models only the three slots the ported predicate reads;
 * see the header for the decoded layout.
 */
export class CoreMediaMovieReader_Decode {
  /**
   * @Flexo CoreMediaMovieReader_Decode@0x18 — the decompression session pointer.
   * Only its null-ness is observed (`cmpq $0x0, 0x18(%rdi)` @0xde9492), so it is
   * modelled as an opaque nullable reference rather than a typed object.
   */
  decompressionSession: object | null = null; // @Flexo CoreMediaMovieReader_Decode@0x18

  /**
   * @Flexo CoreMediaMovieReader_Decode@0x28 — the object that owns the H26x byte
   * stream helper. The binary loads it with `movq 0x28(%rdi), %rax` @0xde949e and
   * immediately dereferences +0x58 without a null check, so in the real code this
   * member is an invariant non-null. It is typed nullable here only because
   * TypeScript needs an initialiser and no decoded constructor is available to
   * supply the real one; `h26xByteStreamHelperOwner` being null is a state the
   * machine does not expect, and the port below reproduces the unguarded
   * dereference rather than papering over it with a silent fallback.
   */
  h26xByteStreamHelperOwner: { h26xByteStreamHelper: object | null } | null = null; // @Flexo CoreMediaMovieReader_Decode@0x28

  /**
   * `CoreMediaMovieReader_Decode::hasValidDecompressionSessionOrH26xByteStreamHelper() const`
   *   @Flexo 0xde9490
   *   (__ZNK27CoreMediaMovieReader_Decode50hasValidDecompressionSessionOrH26xByteStreamHelperEv)
   *
   * Faithful transcription of the entire 12-line function: a short-circuit OR of
   * two null tests — "the decompression session is non-null" OR "the owner at
   * +0x28 has a non-null H26x byte-stream helper at its +0x58". No callees, no
   * loops, and the second operand is evaluated only when the first is null. The
   * full disassembly is quoted in the file header.
   *
   * `const` matches the `__ZNK...` mangling: the body only reads.
   *
   * ORACLE — verified by calling the live Flexo binary. This symbol is LOCAL
   * (the cached inventory lists it as `t`, not `T`), so `dlsym` cannot find it;
   * per the OPS_LOG entry on local symbols the harness instead takes the x86_64
   * vmaddr straight from `raw-port/army/inventory/Flexo.syms.txt` (0xde9490) and
   * adds `_dyld_get_image_vmaddr_slide` for the loaded Flexo image, calling
   * through a `CFUNCTYPE` — deliberately NOT `local_call.py`, whose bare `nm -n`
   * would hand back an arm64 address. Flexo is reached with the documented
   * `@rpath` depth-first preload, all under `arch -x86_64 /usr/bin/python3` so
   * dlopen maps the slice this port was transcribed from. The method reads only
   * fixed offsets and never touches a vptr, so it runs on a synthetic
   * 0x100-byte object (poisoned 0xEE) pointing at a synthetic owner. Over the
   * full 4x4 cross product of `decompressionSession` in {0, 1, 0xdeadbeef,
   * INT64_MAX} and `owner->helper` in {0, 1, 0xcafe, UINT64_MAX}: 16/16 agree
   * with this port.
   * MEASUREMENT NOTE worth keeping, because it looked like a divergence first:
   * taking the return value as a raw `int32` shows garbage in the upper 24 bits
   * (e.g. 228324609), because `movb $0x1, %al` and `setne %al` write only `%al`
   * and leave the rest of `%eax` untouched. That is correct ABI behaviour for a
   * `bool` return — only `al` is defined — so the comparison must mask to the
   * low byte. It does, and then it is exact.
   * NEGATIVE CONTROL (same 16 cases): a conjunction instead of the
   * short-circuit OR would be wrong on 6/16.
   *
   * @returns true if a decompression session exists, or failing that if the
   *          owner's H26x byte-stream helper is non-null.
   */
  hasValidDecompressionSessionOrH26xByteStreamHelper(): boolean {
    // ------------------------------------------------------------
    // @0xde9490 — movb $0x1, %al       : pre-load the fast-path answer.
    // @0xde9492 — cmpq $0x0, 0x18(%rdi): 64-bit null test of the session.
    // @0xde9497 — je 0xde949a          : taken iff the session IS null.
    // @0xde9499 — retq                 : session non-null -> return true, with
    //             no stack frame ever established.
    // ------------------------------------------------------------
    if (this.decompressionSession !== null) {
      return true;
    }

    // ------------------------------------------------------------
    // @0xde949a..0xde949b — slow-path prologue (no TS-visible effect).
    // @0xde949e — movq 0x28(%rdi), %rax : load the owner. The machine does NOT
    //             null-check it, and neither does this port: a null owner
    //             faults there and throws here, which is the faithful outcome.
    //             Substituting `?.` or `?? false` would invent a defined
    //             behaviour the binary does not have.
    // @0xde94a2 — cmpq $0x0, 0x58(%rax) : 64-bit null test of the helper.
    // @0xde94a7 — setne %al             : al = (helper != null), strict ZF test.
    // @0xde94aa..0xde94ab — epilogue + retq.
    // ------------------------------------------------------------
    const owner = this.h26xByteStreamHelperOwner!;
    return owner.h26xByteStreamHelper !== null;
  }
}
