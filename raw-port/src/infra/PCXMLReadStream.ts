// PCXMLReadStream.ts — raw transcription of ProCore `PCXMLReadStream`.
//
// ProCore's XML deserializer (the read half of the PCSerializer stream family;
// its write counterpart PCXMLWriteStream.ts already exists in this layer).
//
// Provenance (ProCore framework, x86_64):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/ProCore.framework/Versions/A/ProCore
//   (thin slice cache /tmp/ProCore.x86_64 — file offset == virtual address)
//
// Symbol ported in this file — ONE method:
//   @0x29bf8  PCXMLReadStream::fixLocale()
//               __ZN15PCXMLReadStream9fixLocaleEv
//
// Source disassembly (re-derived from the binary in this worktree with
// `raw-port/tools/disasm.sh --sym __ZN15PCXMLReadStream9fixLocaleEv ProCore`):
//   raw-port/re/disasm/ProCore.__ZN15PCXMLReadStream9fixLocaleEv.s (19 lines)
//
// Every OTHER member is a SEPARATE ledger unit and is NOT ported here: the two
// ctors @0x29a5c (PCURL const&) and @0x29c38 (__CFData const*), the dtor
// @0x29d3c, `parse()` @0x29e0e, `processNode()` @0x29efa, `abortParse()`
// @0x2a458, `stopParse()` @0x2a468, `getURL() const` @0x2a478,
// `createElement(...)` @0x2a486, `destroyElement(...)` @0x2a516.
//
// ---------------------------------------------------------------------------
// WHAT fixLocale DOES, AND WHY THE CLASS HAS NO STATE HERE
// ---------------------------------------------------------------------------
// XML carries numbers in the C locale — `3.14`, never `3,14`. If the process's
// LC_NUMERIC has been switched to a comma-decimal locale, `strtod`/`sprintf`
// inside an XML parse would read and write the wrong thing. `fixLocale` forces
// LC_NUMERIC back to "C", but ONLY when it is not already exactly "C".
//
// The method is a non-static member (`__ZN15PCXMLReadStream9fixLocaleEv` takes
// `this` in %rdi), yet %rdi is OVERWRITTEN at the very first instruction
// (@0x29bfc `movl $0x4, %edi`) and `this` is never read. So this port declares
// NO fields: nothing in this body touches the object. Later units that port
// the ctors/parse will add the real layout.
//
// ---------------------------------------------------------------------------
// THE EXTERN BOUNDARY
// ---------------------------------------------------------------------------
// The only callee is `_setlocale` — libc, a TRUE out-of-scope extern under the
// PORTING_SPEC Rule 3 boundary policy — reached through the ProCore stub at
// @0xdeb10 (otool annotates both call sites `## symbol stub for: _setlocale`).
// It is modelled below exactly the way the landed `PCAtomBoxFile::getErrorCode`
// port models libc `___error`: a module-level boundary function holding the
// process-global the extern owns, plus a test hook. The REAL WORK of this unit
// — the two-byte inspection of the returned locale name and the conditional
// re-set — is transcribed in full; only the libc call itself is a boundary.
//
// DECODED CONSTANTS:
//   0x4        — the `category` argument, `movl $0x4, %edi` @0x29bfc and again
//                @0x29c21. macOS <locale.h> (MacOSX.sdk): LC_ALL 0, LC_COLLATE
//                1, LC_CTYPE 2, LC_MONETARY 3, LC_NUMERIC 4, LC_TIME 5 — so
//                the category is LC_NUMERIC.
//   0x43       — `subl $0x43, %ecx` @0x29c0b — the ASCII code of 'C'.
//   0x131dc2   — the string literal loaded by `leaq 0x1081a1(%rip), %rsi`
//                @0x29c1a (0x29c21 + 0x1081a1). Bytes at that file offset are
//                `43 00` = "C\0" (otool: `## literal pool for: "C"`).

/**
 * Process-global LC_NUMERIC locale name owned by libc, NOT by FCP.
 *
 * `_setlocale` is out of scope for this port (libc), so the state it mutates
 * lives here at the boundary. Initialised to "C", which is the C standard's
 * startup locale for every category.
 */
let __libc_lc_numeric = "C";

/**
 * Boundary: emulates libc `_setlocale(category, locale)` as reached through the
 * ProCore stub @0xdeb10 (@0x29c03 for the query, @0x29c27 for the tail-call
 * set). Only LC_NUMERIC (category 4) is backed, because that is the only
 * category this file's call sites pass.
 *
 * A null `locale` QUERIES (returns the current name); a non-null `locale` SETS
 * and returns the new name. A real libc-backed runtime would replace this with
 * the actual call.
 */
export function __PCXMLReadStream_setlocale(
  category: number,
  locale: string | null,
): string {
  if (category !== 4) {
    throw new Error(
      "__PCXMLReadStream_setlocale boundary: only LC_NUMERIC (4) is backed; " +
        `PCXMLReadStream::fixLocale @ProCore 0x29bfc passes 4, got ${category}`,
    );
  }
  if (locale !== null) {
    __libc_lc_numeric = locale;
  }
  return __libc_lc_numeric;
}

/**
 * Test/runtime hook: set the LC_NUMERIC name the libc boundary reports before
 * `fixLocale()` runs. Not part of the FCP binary — it stands in for the OS
 * having a locale configured.
 */
export function __PCXMLReadStream_setLocaleForTest(name: string): void {
  __libc_lc_numeric = name;
}

/** Test/runtime hook: read the boundary's current LC_NUMERIC name. */
export function __PCXMLReadStream_getLocaleForTest(): string {
  return __libc_lc_numeric;
}

/**
 * Byte `i` of a C string, with the implicit NUL terminator.
 *
 * The body does `movzbl (%rax), %ecx` and `movzbl 0x1(%rax), %ecx` on the
 * `char*` libc returned — zero-extending BYTE loads that see the terminator as
 * 0. Indexing past the end of the JS string therefore yields 0, exactly as
 * reading the NUL would.
 */
function __cstrByte(s: string, i: number): number {
  const c = s.codePointAt(i);
  return c === undefined ? 0 : c & 0xff;
}

/**
 * `PCXMLReadStream` — ProCore's XML deserializer.
 *
 * @ProCore 0x29bf8
 */
export class PCXMLReadStream {
  /**
   * `PCXMLReadStream::fixLocale()` @ProCore 0x29bf8
   * (__ZN15PCXMLReadStream9fixLocaleEv).
   *
   * Faithful transcription of the 19-line body, quoted in full:
   *
   *   0x29bf8  pushq  %rbp                 ; frame prologue
   *   0x29bf9  movq   %rsp, %rbp
   *   0x29bfc  movl   $0x4, %edi           ; arg1 = LC_NUMERIC   (this is
   *                                        ;   %rdi being CLOBBERED — `this`
   *                                        ;   is never read)
   *   0x29c01  xorl   %esi, %esi           ; arg2 = NULL  -> QUERY
   *   0x29c03  callq  0xdeb10              ; rax = _setlocale(LC_NUMERIC, NULL)
   *   0x29c08  movzbl (%rax), %ecx         ; ecx = name[0]
   *   0x29c0b  subl   $0x43, %ecx          ; ecx = name[0] - 'C'
   *   0x29c0e  jne    0x29c14              ; name[0] != 'C' -> skip (ecx != 0)
   *   0x29c10  movzbl 0x1(%rax), %ecx      ; name[0] == 'C': ecx = name[1]
   *   0x29c14  negl   %ecx                 ; ecx = -ecx  (does not change
   *                                        ;   zero-ness; the compiler's way
   *                                        ;   of materialising the flag)
   *   0x29c16  testl  %ecx, %ecx
   *   0x29c18  je     0x29c2c              ; ecx == 0 -> return, change nothing
   *   0x29c1a  leaq   0x1081a1(%rip), %rsi ; arg2 = "C"  (@0x131dc2)
   *   0x29c21  movl   $0x4, %edi           ; arg1 = LC_NUMERIC
   *   0x29c26  popq   %rbp                 ; epilogue BEFORE the tail-call
   *   0x29c27  jmp    0xdeb10              ; TAIL-CALL _setlocale(LC_NUMERIC,"C")
   *   0x29c2c  popq   %rbp
   *   0x29c2d  retq
   *
   * SEMANTICS: the two-byte test is an exact-match test for the string "C".
   *   - name[0] != 'C'                -> ecx != 0 -> re-set to "C".
   *   - name[0] == 'C' && name[1] == 0 -> ecx == 0 -> the locale is ALREADY
   *                                       exactly "C"; return, do not call
   *                                       setlocale a second time.
   *   - name[0] == 'C' && name[1] != 0 -> a longer name that merely starts
   *                                       with 'C' (e.g. "C.UTF-8", "cs_CZ"
   *                                       would fail at byte 0) -> re-set.
   *
   * The `negl` @0x29c14 is transcribed even though it cannot change the
   * outcome — `-0 == 0` — because it is an instruction in the body; the
   * comment records that it is flag-materialisation, not logic.
   *
   * RETURN VALUE: declared `void` here. The taken path @0x29c27 is a TAIL-CALL,
   * so libc's `char*` result is left in %rax and flows to this function's
   * caller — but the fall-through path @0x29c2d returns with %rax holding the
   * FIRST setlocale's pointer instead, so the two paths agree on nothing. That
   * is the signature of a `void` function whose %rax is simply unspecified, not
   * of a function returning a locale name.
   *
   * EXTERN: `_setlocale` (libc) via the ProCore stub @0xdeb10, modelled at the
   * boundary by `__PCXMLReadStream_setlocale` above.
   *
   * DEPENDENCIES: none in-scope (`depgraph.py deps` lists nothing).
   */
  fixLocale(): void {
    // @0x29bfc..@0x29c03  _setlocale(LC_NUMERIC=4, NULL) — query the current
    // name. (%rdi is loaded with 4 here, clobbering `this`.)
    const name: string = __PCXMLReadStream_setlocale(0x4, null);

    // @0x29c08  movzbl (%rax), %ecx
    // @0x29c0b  subl   $0x43, %ecx        ; 0x43 == 'C'
    let ecx: number = __cstrByte(name, 0) - 0x43;

    // @0x29c0e  jne 0x29c14 — only when name[0] == 'C' do we look at name[1].
    if (ecx === 0) {
      // @0x29c10  movzbl 0x1(%rax), %ecx
      ecx = __cstrByte(name, 1);
    }

    // @0x29c14  negl %ecx   — zero stays zero; kept for instruction fidelity.
    ecx = -ecx;

    // @0x29c16..@0x29c18  testl %ecx,%ecx ; je 0x29c2c
    if (ecx === 0) {
      // @0x29c2c..@0x29c2d  popq %rbp ; retq — already "C", nothing to do.
      return;
    }

    // @0x29c1a..@0x29c27  tail-call _setlocale(LC_NUMERIC=4, "C" @0x131dc2)
    __PCXMLReadStream_setlocale(0x4, "C");
  }
}
