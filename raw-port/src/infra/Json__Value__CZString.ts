// Json__Value__CZString.ts — raw transcription of ProCore `Json::Value::CZString`.
//
// FCP links a copy of jsoncpp inside ProCore. `Json::Value::CZString` is the KEY
// type of the object-member map (`std::map<Value::CZString, Value>`): it is
// either a borrowed/owned C string OR an array index, discriminated by whether
// the string pointer is null. NESTED class, so the file name joins the outer
// names with a DOUBLE underscore per PORTING_SPEC.md
// (`Json::Value::CZString` -> `Json__Value__CZString.ts`).
//
// Provenance (ProCore framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore
//
// Symbols ported in this file — TWO methods, nothing else (one ledger unit
// each; the second was added by a later PR, extending this class ADD-ONLY):
//   @0xce3c8  Json::Value::CZString::operator==(Json::Value::CZString const&) const
//               __ZNK4Json5Value8CZStringeqERKS1_
//   @0xce376  Json::Value::CZString::operator<(Json::Value::CZString const&) const
//               __ZNK4Json5Value8CZStringltERKS1_
//
// Source disassembly (re-derived from the binary in this worktree with
// `raw-port/tools/disasm.sh --sym <mangled> ProCore`):
//   raw-port/re/disasm/ProCore.__ZNK4Json5Value8CZStringeqERKS1_.s (24 lines)
//   raw-port/re/disasm/ProCore.__ZNK4Json5Value8CZStringltERKS1_.s (34 lines)
//
// NOTE ON ADDRESSES: ProCore is a fat binary (x86_64 + arm64) and this project
// ports the x86_64 slice. `nm` on an Apple-silicon box defaults to the NATIVE
// arm64 slice, where these same two symbols sit at 0xc0740 and 0xc06d4; every
// citation in this file — and everything `disasm.sh` / `symidx.py` index — is
// the x86_64 slice.
//
// Every OTHER member of CZString (the four ctors @0xce22a/@0xce23a/@0xce24e/
// @0xce31c, the dtor @0xcdde0, `swap` @0xce336, `operator=` @0xce354,
// `index` @0xcddb0, `length` @0xcdd68, `data` @0xc47ea,
// `isStaticString` @0xcdd34) is a SEPARATE ledger unit and is deliberately NOT
// ported here. The accessors are quoted below as LAYOUT EVIDENCE only.
//
// ---------------------------------------------------------------------------
// LAYOUT — recovered from the accessor disassembly
// ---------------------------------------------------------------------------
//   struct Json::Value::CZString {          // 0x10 bytes
//     const char* cstr_;   // +0x00  `data()`  @0xc47ea: movq (%rdi), %rax
//     uint32_t    storage_;// +0x08  a 32-bit union of two readings:
//                          //   `index()`  @0xcddb0: movl 0x8(%rdi), %eax
//                          //        -> the WHOLE 32-bit word is the array index
//                          //   `length()` @0xcdd68: movl 0x8(%rdi), %eax
//                          //                        shrl $0x2, %eax
//                          //        -> the TOP 30 bits are the string length
//                          //   `isStaticString()` @0xcdd34: testb $0x3, 0x8(%rdi)
//                          //                                sete %al
//                          //        -> the LOW 2 bits are the DuplicationPolicy
//                          //           (0 == noDuplication == "static string")
//   };
//
// So +0x08 is ONE word read two different ways, and `operator==` below reads it
// BOTH ways in its two branches — the whole word when `cstr_` is null (index
// key) and the top 30 bits when it is not (string key). That is exactly why the
// port stores the raw 32-bit word rather than a decoded {length, policy} pair:
// modelling it as separate fields would lose the fact that the null branch
// compares the POLICY BITS TOO.
//
// CALLEES: no in-scope call, no virtual and no indirect dispatch. The single
// call is `_memcmp`, a TRUE out-of-scope libc extern — the stub at ProCore
// @0xde95a (`jmpq *0x69b60(%rip)`, disassembled by otool as
// `## symbol stub for: _memcmp`). Modelled at the boundary as a byte-wise
// comparison of the two buffers, the same treatment the landed
// `OZChannelRef::operator==` port gives the identical `_memcmp` boundary.

/**
 * `Json::Value::CZString` — the jsoncpp map key, as `operator==` addresses it.
 *
 * @ProCore 0xce3c8
 */
export class Json__Value__CZString {
  /** @ProCore instance +0x00 — `const char* cstr_`.
   *
   * Read by `operator==` @0xce3cb as `movq (%rdi), %rdi` and immediately
   * null-tested @0xce3d1 (`testq %rdi, %rdi`); the null case is the
   * ARRAY-INDEX key, the non-null case is the STRING key. Confirmed as the
   * whole-pointer member by `data()` @0xc47ea (`movq (%rdi), %rax`).
   *
   * Modelled as a byte buffer because the only thing this body does with the
   * pointer is hand it to `_memcmp` @0xde95a; `null` models `nullptr`. */
  cstr_: Uint8Array | null = null;

  /** @ProCore instance +0x08 — the 32-bit `index_`/`storage_` union.
   *
   * Read by `operator==` @0xce3ce as `movl 0x8(%rax), %edx` (this) and
   * @0xce3d9 / @0xce3f6 as `0x8(%rsi)` (the peer). Held as the RAW word: the
   * two branches of this body read it at two different granularities (whole
   * word vs `>> 2`), and `isStaticString()` @0xcdd34 reads its low 2 bits. */
  storage_: number = 0;

  /**
   * `Json::Value::CZString::operator==(CZString const&) const`
   * @ProCore 0xce3c8 (__ZNK4Json5Value8CZStringeqERKS1_).
   *
   * Faithful transcription of the 24-line body quoted in full:
   *
   *   0xce3c8  movq  %rdi, %rax          ; rax = this
   *   0xce3cb  movq  (%rdi), %rdi        ; rdi = this->cstr_        (+0x00)
   *   0xce3ce  movl  0x8(%rax), %edx     ; edx = this->storage_     (+0x08)
   *   0xce3d1  testq %rdi, %rdi
   *   0xce3d4  je    0xce3f6             ; cstr_ == null -> INDEX-KEY branch
   *   -- STRING-KEY branch (cstr_ != null) --
   *   0xce3d6  shrl  $0x2, %edx          ; edx = this->length_  (storage_ >> 2)
   *   0xce3d9  movl  0x8(%rsi), %eax     ; eax = other.storage_     (+0x08)
   *   0xce3dc  shrl  $0x2, %eax          ; eax = other.length_
   *   0xce3df  cmpl  %eax, %edx          ; AT&T: computes edx - eax,
   *                                      ;       i.e. this->length_ - other.length_
   *   0xce3e1  jne   0xce3fd             ; lengths differ -> return false
   *   0xce3e3  pushq %rbp                ; prologue DEFERRED to the call site
   *   0xce3e4  movq  %rsp, %rbp          ;   (the two ret-only paths never push)
   *   0xce3e7  movq  (%rsi), %rsi        ; rsi = other.cstr_
   *   0xce3ea  callq 0xde95a             ; eax = _memcmp(this->cstr_,
   *                                      ;               other.cstr_,
   *                                      ;               rdx = this->length_)
   *   0xce3ef  testl %eax, %eax
   *   0xce3f1  sete  %al                 ; return (_memcmp(...) == 0)
   *   0xce3f4  popq  %rbp
   *   0xce3f5  retq
   *   -- INDEX-KEY branch (cstr_ == null) --
   *   0xce3f6  cmpl  0x8(%rsi), %edx     ; AT&T: computes edx - other.storage_,
   *                                      ;       and edx here is the UNSHIFTED
   *                                      ;       word (the shrl @0xce3d6 is on
   *                                      ;       the other side of the branch)
   *   0xce3f9  sete  %al                 ; return (this->index_ == other.index_)
   *   0xce3fc  retq
   *   -- length-mismatch exit --
   *   0xce3fd  xorl  %eax, %eax
   *   0xce3ff  retq                      ; return false
   *
   * SEMANTICS (jsoncpp's two-kind key):
   *   cstr_ == null : both are ARRAY-INDEX keys; compare the FULL 32-bit word
   *                   at +0x08 — policy bits included, because the index
   *                   reading of the union spans all 32 bits (`index()`
   *                   @0xcddb0 does not mask).
   *   cstr_ != null : STRING keys; equal iff the 30-bit lengths match AND the
   *                   first `length_` bytes compare equal.
   *
   * NOTE the asymmetry the disasm forces and a paraphrase would smooth away:
   * only `this->cstr_` is null-tested. If `this->cstr_` is non-null and
   * `other.cstr_` is null, the machine still calls `_memcmp` with a null
   * second argument (after the length check). The port keeps that shape.
   *
   * NUMERICS: all comparisons are 32-bit unsigned integer compares
   * (`movl`/`shrl`/`cmpl`, an UNSIGNED right shift), so the port masks to
   * 32 bits and uses `>>>`.
   *
   * EXTERN: `_memcmp` (libc) via the ProCore stub @0xde95a — a TRUE
   * out-of-scope extern under PORTING_SPEC Rule 3's boundary policy, modelled
   * inline as byte-wise equality (that IS the semantics of `_memcmp(a,b,n)==0`).
   *
   * DEPENDENCIES: none in-scope (`depgraph.py deps` lists nothing).
   */
  eq(other: Json__Value__CZString): boolean {
    // @0xce3cb  movq (%rdi), %rdi   — rdi = this->cstr_
    const thisCstr: Uint8Array | null = this.cstr_;
    // @0xce3ce  movl 0x8(%rax), %edx — edx = this->storage_ (32-bit load)
    const thisStorage: number = this.storage_ >>> 0;

    // @0xce3d1..@0xce3d4  testq %rdi, %rdi ; je 0xce3f6
    if (thisCstr === null) {
      // -- INDEX-KEY branch @0xce3f6 --
      // cmpl 0x8(%rsi), %edx ; sete %al — the UNSHIFTED words are compared,
      // so this is `this->index_ == other.index_` over all 32 bits.
      return thisStorage === (other.storage_ >>> 0);
    }

    // -- STRING-KEY branch --
    // @0xce3d6  shrl $0x2, %edx      — edx = this->length_
    const thisLength: number = thisStorage >>> 2;
    // @0xce3d9..@0xce3dc  movl 0x8(%rsi), %eax ; shrl $0x2, %eax
    const otherLength: number = (other.storage_ >>> 0) >>> 2;

    // @0xce3df..@0xce3e1  cmpl %eax, %edx ; jne 0xce3fd
    // @0xce3fd..@0xce3ff  xorl %eax, %eax ; retq  -> false
    if (thisLength !== otherLength) {
      return false;
    }

    // @0xce3e7  movq (%rsi), %rsi — rsi = other.cstr_
    const otherCstr: Uint8Array | null = other.cstr_;

    // @0xce3ea  callq 0xde95a  ## symbol stub for: _memcmp
    // @0xce3ef..@0xce3f1  testl %eax, %eax ; sete %al
    //
    // `_memcmp(a, b, 0)` is 0 for ANY pointers — libc reads nothing — so a
    // zero length is equality regardless of what the pointers hold. The
    // machine performs the call unconditionally; the port takes the same
    // answer without a loop.
    if (thisLength === 0) {
      return true;
    }

    // A null `other.cstr_` here would fault inside libc `_memcmp` (the body
    // does NOT null-check the peer — see the NOTE above). There is no
    // instruction to transcribe for that case, so the port reports
    // inequality rather than inventing a comparison against nothing.
    if (otherCstr === null) {
      return false;
    }

    // Byte-wise model of `_memcmp(this->cstr_, other.cstr_, this->length_) == 0`.
    for (let i = 0; i < thisLength; i++) {
      // Read both bytes into locals FIRST. `i` is bounded by `thisLength`,
      // which is `storage_ >> 2` and NOT tied to the buffers' actual sizes —
      // exactly as in the machine, where the length field and the allocation
      // are independent — so an over-long `storage_` yields `undefined` here.
      // Comparing the two possibly-undefined reads keeps that case an
      // inequality instead of laundering it into a number (the #154 trap).
      const a: number | undefined = thisCstr[i];
      const b: number | undefined = otherCstr[i];
      if (a === undefined || b === undefined) {
        return false;
      }
      if (a === b) {
        continue;
      }
      return false;
    }
    return true;
  }

  /**
   * `Json::Value::CZString::operator<(CZString const&) const`
   * @ProCore 0xce376 (__ZNK4Json5Value8CZStringltERKS1_).
   *
   * The map's ORDERING predicate, sibling of `eq` above: same two-kind key,
   * same `_memcmp` boundary, but it distinguishes all THREE memcmp outcomes
   * and breaks a tie on length.
   *
   * Faithful transcription of the 34-line body quoted in full:
   *
   *   0xce376  pushq   %rbp                 ; frame setup (no TS counterpart)
   *   0xce377  movq    %rsp,%rbp            ; frame setup (no TS counterpart)
   *   0xce37a  pushq   %r14                 ; callee-save (no TS counterpart)
   *   0xce37c  pushq   %rbx                 ; callee-save (no TS counterpart)
   *   0xce37d  movq    %rdi,%rax            ; rax = this
   *   0xce380  movq    (%rdi),%rdi          ; rdi = this->cstr_        (+0x00)
   *   0xce383  movl    0x8(%rax),%ebx       ; ebx = this->storage_     (+0x08)
   *   0xce386  testq   %rdi,%rdi
   *   0xce389  je      0xce3bc              ; cstr_ == null -> INDEX-KEY branch
   *   -- STRING-KEY branch (cstr_ != null) --
   *   0xce38b  shrl    $0x2,%ebx            ; ebx = this->length_
   *   0xce38e  movl    0x8(%rsi),%r14d      ; r14d = other.storage_
   *   0xce392  shrl    $0x2,%r14d           ; r14d = other.length_
   *   0xce396  cmpl    %ebx,%r14d           ; AT&T: computes other_len - this_len
   *   0xce399  movl    %ebx,%edx            ; edx = this_len
   *   0xce39b  cmovbl  %r14d,%edx           ; CF (other_len < this_len) -> edx =
   *                                         ;   other_len, i.e. edx = min(both)
   *   0xce39f  movq    (%rsi),%rsi          ; rsi = other.cstr_
   *   0xce3a2  callq   0xde95a              ; eax = _memcmp(this->cstr_,
   *                                         ;               other.cstr_, min_len)
   *   0xce3a7  movl    %eax,%ecx            ; ecx = comp
   *   0xce3a9  movb    $0x1,%al             ; provisional result = true
   *   0xce3ab  testl   %ecx,%ecx
   *   0xce3ad  js      0xce3c2              ; comp < 0 -> return TRUE
   *   0xce3af  sete    %cl                  ; cl = (comp == 0)
   *   0xce3b2  cmpl    %r14d,%ebx           ; AT&T: computes this_len - other_len
   *   0xce3b5  setb    %al                  ; al = CF = this_len < other_len
   *   0xce3b8  andb    %cl,%al              ; return (comp == 0) &&
   *                                         ;        (this_len < other_len)
   *   0xce3ba  jmp     0xce3c2
   *   -- INDEX-KEY branch (cstr_ == null) --
   *   0xce3bc  cmpl    0x8(%rsi),%ebx       ; AT&T: computes this_word -
   *                                         ;   other_word, on the UNSHIFTED
   *                                         ;   words (the shrl @0xce38b is on
   *                                         ;   the other side of the branch)
   *   0xce3bf  setb    %al                  ; return this->index_ < other.index_
   *                                         ;   (UNSIGNED — CF, not SF)
   *   0xce3c2  popq    %rbx                 ; teardown (no TS counterpart)
   *   0xce3c3  popq    %r14                 ; teardown (no TS counterpart)
   *   0xce3c5  popq    %rbp                 ; teardown (no TS counterpart)
   *   0xce3c6  retq                         ; returns the bool in %al
   *   0xce3c7  nop                          ; alignment padding, not executed
   *
   * Decode notes (AT&T: `cmp %src,%dst` sets flags on `dst - src`):
   *   * @0xce396 is (other_len - this_len) and @0xce3b2 is the OPPOSITE
   *     subtraction (this_len - other_len). Reading either in Intel order
   *     inverts it: the first would pick the MAXIMUM length for the memcmp
   *     count, the second would reverse the tiebreak. Both `setb`/`cmovb` are
   *     the CF (UNSIGNED) test, which is right — `length_` is a 30-bit
   *     bitfield and `index_` an `unsigned`, so neither is ever negative.
   *   * all three memcmp outcomes are distinguished: `js` @0xce3ad takes the
   *     comp<0 exit with al already 1; comp>0 leaves cl=0 so the `andb`
   *     @0xce3b8 yields false; comp==0 defers to the length tiebreak. A port
   *     that only tested `!= 0` would order equal-prefix keys wrongly.
   *   * the index branch @0xce3bc compares the RAW +0x08 words — policy bits
   *     included, exactly as `eq`'s index branch does — and never touches
   *     `other.cstr_`.
   *
   * Together `eq` and this method give the map a strict weak ordering over
   * jsoncpp's two key kinds: bytes first, then length.
   *
   * EXTERN: `_memcmp` (libc) via the ProCore stub @0xde95a, modelled inline as
   * the byte-wise comparison it is defined to be — here the SIGN of the first
   * differing pair of UNSIGNED bytes, not just its zeroness.
   *
   * DEPENDENCIES: none in-scope (`depgraph.py deps` lists nothing).
   */
  lt(other: Json__Value__CZString): boolean {
    // @0xce380  movq (%rdi),%rdi — rdi = this->cstr_
    const thisCstr: Uint8Array | null = this.cstr_;
    // @0xce383  movl 0x8(%rax),%ebx — the RAW 32-bit word
    const thisStorage: number = this.storage_ >>> 0;

    // @0xce386..@0xce389  testq %rdi,%rdi ; je 0xce3bc
    if (thisCstr === null) {
      // -- INDEX-KEY branch @0xce3bc --
      // cmpl 0x8(%rsi),%ebx ; setb %al — UNSIGNED compare of the unshifted
      // words: `this->index_ < other.index_`.
      return thisStorage < (other.storage_ >>> 0);
    }

    // -- STRING-KEY branch --
    // @0xce38b  shrl $0x2,%ebx
    const thisLength: number = thisStorage >>> 2;
    // @0xce38e..@0xce392  movl 0x8(%rsi),%r14d ; shrl $0x2,%r14d
    const otherLength: number = (other.storage_ >>> 0) >>> 2;

    // @0xce396..@0xce39b  cmpl %ebx,%r14d ; movl %ebx,%edx ; cmovbl %r14d,%edx
    //   CF <=> otherLength < thisLength, so edx = min(thisLength, otherLength).
    const minLength: number = otherLength < thisLength ? otherLength : thisLength;

    // @0xce39f  movq (%rsi),%rsi — rsi = other.cstr_
    const otherCstr: Uint8Array | null = other.cstr_;

    // @0xce3a2  callq 0xde95a  ## symbol stub for: _memcmp
    //
    // Byte-wise model of `_memcmp(this->cstr_, other.cstr_, minLength)`: the
    // difference of the first differing pair read as UNSIGNED chars (a
    // Uint8Array element already is one), else 0. A count of zero reads
    // nothing and is 0 for ANY pointers, exactly as libc defines it.
    let comp = 0;
    if (minLength > 0 && otherCstr === null) {
      // `eq` above can answer a null peer with "not equal" and lose nothing.
      // An ORDERING has no such safe answer: the machine dereferences the peer
      // inside `_memcmp` @0xce3a2 (the body null-tests only `this->cstr_`
      // @0xce386) and faults. There is no instruction to transcribe for the
      // fault, and returning either bool would invent an order, so this port
      // refuses loudly instead.
      throw new Error(
        'Json::Value::CZString::operator< @ProCore 0xce3a2: _memcmp through a ' +
          'null other.cstr_ — the binary faults here; no ordering is defined',
      );
    }
    for (let i = 0; i < minLength; i++) {
      // Both reads can be `undefined` when `storage_ >> 2` claims more bytes
      // than the modelled buffer holds — the length field and the allocation
      // are independent in the machine, where the read would simply take
      // whatever memory follows. Laundering `undefined` into arithmetic would
      // make `comp` NaN and silently answer "not less than" (the #154 trap),
      // so this is loud too.
      const a: number | undefined = thisCstr[i];
      const b: number | undefined = (otherCstr as Uint8Array)[i];
      if (a === undefined || b === undefined) {
        throw new Error(
          'Json::Value::CZString::operator< @ProCore 0xce3a2: _memcmp count ' +
            'from storage_>>2 runs past the modelled cstr_ buffer — the binary ' +
            'reads adjacent memory here; no value is defined',
        );
      }
      if (a !== b) {
        comp = a - b;
        break;
      }
    }

    // @0xce3a9..@0xce3ad  movb $0x1,%al ; testl %ecx,%ecx ; js 0xce3c2
    if (comp < 0) {
      return true;
    }

    // @0xce3af  sete %cl — cl = (comp == 0)
    const compIsZero: boolean = comp === 0;
    // @0xce3b2..@0xce3b5  cmpl %r14d,%ebx ; setb %al — UNSIGNED this < other
    const thisIsShorter: boolean = thisLength < otherLength;
    // @0xce3b8  andb %cl,%al ; @0xce3c6 retq
    return compIsZero && thisIsShorter;
  }
}
