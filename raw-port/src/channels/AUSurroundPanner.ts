// AUSurroundPanner.ts — raw transcription of the Flexo class `AUSurroundPanner`.
//
// ONE symbol is transcribed in this file — `GetPresets`. Every other member of
// the class is a SEPARATE ledger unit and is NOT ported here; do not add them
// without their own disassembly and address citations. The immediate
// neighbour, for orientation only:
//   0x124cc70  AUSurroundPanner::NewFactoryPresetSet(AUPreset const&)
//
// Provenance (Flexo framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// Symbol ported in this file:
//   @0x124cc00  AUSurroundPanner::GetPresets(__CFArray const**) const
//                 __ZNK16AUSurroundPanner10GetPresetsEPPK9__CFArray
//
// Source disassembly (re-derived from the binary with
// `raw-port/tools/disasm.sh --sym
//  __ZNK16AUSurroundPanner10GetPresetsEPPK9__CFArray Flexo`):
//   raw-port/re/disasm/Flexo.__ZNK16AUSurroundPanner10GetPresetsEPPK9__CFArray.s
//   (32 lines)
//
// ---------------------------------------------------------------------------
// FULL DISASM — the whole function, every instruction
// ---------------------------------------------------------------------------
//   0x124cc00  testq %rsi, %rsi            ; outArray == NULL ?  (BEFORE the
//   0x124cc03  je    0x124cc63             ;  prologue — see the note below)
//   0x124cc05  pushq %rbp
//   0x124cc06  movq  %rsp, %rbp
//   0x124cc09  pushq %r14
//   0x124cc0b  pushq %rbx
//   0x124cc0c  movq  %rsi, %rbx            ; rbx = outArray
//   0x124cc0f  movl  $0x4, %esi            ; arg1 capacity = 4
//   0x124cc14  xorl  %edi, %edi            ; arg0 allocator = NULL (clobbers
//                                          ;  `this`, which is never read)
//   0x124cc16  xorl  %edx, %edx            ; arg2 callBacks = NULL
//   0x124cc18  callq _CFArrayCreateMutable ; @stub 0x14946aa
//   0x124cc1d  movq  %rax, %r14            ; r14 = the new array
//   0x124cc20  leaq  kPresets(%rip), %rsi  ; = 0x124cc27 + 0xa29dd9 = 0x1c76a00
//   0x124cc27  movq  %rax, %rdi
//   0x124cc2a  callq _CFArrayAppendValue   ; @stub 0x149469e
//   0x124cc2f  leaq  0xa29dda(%rip), %rsi  ; = 0x124cc36 + 0xa29dda = 0x1c76a10
//   0x124cc36  movq  %r14, %rdi
//   0x124cc39  callq _CFArrayAppendValue
//   0x124cc3e  leaq  0xa29ddb(%rip), %rsi  ; = 0x124cc45 + 0xa29ddb = 0x1c76a20
//   0x124cc45  movq  %r14, %rdi
//   0x124cc48  callq _CFArrayAppendValue
//   0x124cc4d  leaq  0xa29ddc(%rip), %rsi  ; = 0x124cc54 + 0xa29ddc = 0x1c76a30
//   0x124cc54  movq  %r14, %rdi
//   0x124cc57  callq _CFArrayAppendValue
//   0x124cc5c  movq  %r14, (%rbx)          ; *outArray = the array
//   0x124cc5f  popq  %rbx
//   0x124cc60  popq  %r14
//   0x124cc62  popq  %rbp
//   0x124cc63  xorl  %eax, %eax            ; return 0 (noErr) — SHARED by both
//   0x124cc65  retq                        ;  the NULL path and the real path
//   0x124cc66  nopw  %cs:(%rax,%rax)       ; alignment padding, not executed
//
// TWO STRUCTURAL DETAILS THAT ARE EASY TO GET WRONG:
//   * the NULL test is the FIRST instruction, before `pushq %rbp`. The `je`
//     lands at 0x124cc63, which is AFTER the three pops — so the NULL path
//     never builds a frame and never unwinds one. It is not a normal
//     early-return inside the body; both paths just converge on the same
//     `xorl %eax,%eax ; retq`.
//   * the return value is that `xorl` and nothing else. The function ALWAYS
//     returns 0 (noErr) — including when it was handed a NULL out-pointer and
//     did nothing at all. It never reports failure.
//
// `this` IS NEVER READ. `xorl %edi,%edi` @0x124cc14 overwrites the incoming
// this-pointer with CFArrayCreateMutable's NULL allocator argument, and no
// `(%rdi)` operand exists anywhere in the body. Confirmed live: calling it with
// `this = NULL` still produces the full 4-element array.
//
// ---------------------------------------------------------------------------
// THE STATIC TABLE — `__ZL8kPresets` @Flexo 0x1c76a00
// ---------------------------------------------------------------------------
// The four appended pointers are `&kPresets[0..3]`: the displacements
// 0xa29dd9/0xa29dda/0xa29ddb/0xa29ddc resolve to 0x1c76a00, 0x1c76a10,
// 0x1c76a20, 0x1c76a30 — a 0x10 stride, which is `sizeof(AUPreset)`
// (`{SInt32 presetNumber; CFStringRef presetName;}`, 4 bytes + 4 padding +
// 8 bytes). Note the array is passed BY POINTER: the CFArray holds addresses
// INTO the static table, not copies, and the array was created with NULL
// callbacks (@0x124cc16), so CF neither retains nor copies the elements.
//
// The table's contents were recovered TWICE, independently, and the two agree:
//
//   (a) from the LOADED image, by calling the function and walking the CFArray
//       it returns (the oracle below);
//   (b) statically from the Mach-O, by following each entry's `presetName`
//       through __DATA_CONST,__cfstring to __TEXT,__cstring.
//
//   index  addr       presetNumber  presetName  cfstring     cstring
//   [0]    0x1c76a00  0             "Left/Right"   0x19d24a8  0x1681462
//   [1]    0x1c76a10  1             "Center"       0x19d24c8  0x168146d
//   [2]    0x1c76a20  2             "All Speakers" 0x19d24e8  0x1681474
//   [3]    0x1c76a30  3             "Surround"     0x19d2508  0x1681481
//
// Doing (b) is only safe if you know what you are looking at, which is why the
// path is written out here: the 8 bytes at `kPresets[0]+0x8` read
// `0x00200000019d24a8` in the file, NOT `0x19d24a8`. That is a CHAINED FIXUP
// entry — the target VA lives in the low 40 bits and the upper bits are
// linker metadata. A naive 8-byte read of the file image yields a nonsense
// pointer, and a reader who assumed the field was therefore "unset" would
// conclude the table has no names at all. The presetNumbers, by contrast, are
// plain integers and read correctly straight from the file.
//
// ---------------------------------------------------------------------------
// CALLEES — both are out-of-scope CoreFoundation externs
// ---------------------------------------------------------------------------
//   _CFArrayCreateMutable  @stub 0x14946aa  (called once, @0x124cc18)
//   _CFArrayAppendValue    @stub 0x149469e  (called four times, @0x124cc2a,
//                                            @0x124cc39, @0x124cc48, @0x124cc57)
// Neither is defined in any of the five in-scope frameworks; they are
// CoreFoundation, which DEP_WORKER_BRIEF names as a true out-of-scope extern.
// `depgraph.py deps __ZNK16AUSurroundPanner10GetPresetsEPPK9__CFArray` reports
// no in-scope callees. This port therefore transcribes everything up to the
// first CF call and raises a boundary throw there, citing the addresses — the
// same policy the landed `OZApplication` decode uses for its own
// `_CFArrayCreateMutable` call @0x5134.
//
// ---------------------------------------------------------------------------
// ORACLE — verified by CALLING the live function
// ---------------------------------------------------------------------------
// raw-port/re/oracle/AUSurroundPanner_GetPresets_oracle.py, under
// `arch -x86_64 /usr/bin/python3`. Flexo loads outside the app bundle via
// ozone_loader's depth-first @rpath preload. Results (2026-08-11):
//   * byte self-check PASS on the head —
//     `48 85 f6 74 5e 55 48 89 e5 41 56 53 48 89 f3 be 04 00 00 00 31 ff 31 d2`
//     — which pins the pre-prologue NULL test, the capacity of 4, and the two
//     NULL arguments.
//   * each of the four `leaq` disp32 fields was re-read from the machine code
//     and recomputed: 0xa29dd9/0xa29dda/0xa29ddb/0xa29ddc from their own
//     next-instruction addresses give exactly 0x1c76a00/+0x10/+0x20/+0x30.
//   * `GetPresets(this, NULL)` returns 0 and creates nothing.
//   * the real call returns 0; `CFArrayGetCount` is 4; element i is exactly
//     `slide + 0x1c76a00 + 0x10*i` — pointers into the static table, as the
//     disasm says, not copies.
//   * the four AUPresets read out of the live array are (0, "Left/Right"),
//     (1, "Center"), (2, "All Speakers"), (3, "Surround").
//   * `this` is byte-identical after the call, and passing `this = NULL` still
//     yields the full array.
//   * negative controls, all caught: returns-non-zero, count-3, count-5,
//     elements-are-copies, stride-8-instead-of-0x10, and
//     NULL-out-param-creates-an-array-anyway.

/**
 * `AUPreset` — CoreAudio's `{SInt32 presetNumber; CFStringRef presetName;}`,
 * 0x10 bytes with 4 bytes of padding after the number (the 0x10 stride between
 * the four `leaq` targets is what establishes the size).
 */
export interface AUPreset {
  /** +0x00 (SInt32) */
  presetNumber: number;
  /** +0x08 (CFStringRef) */
  presetName: string;
}

/**
 * `__ZL8kPresets` — the static factory-preset table @Flexo 0x1c76a00, the four
 * elements this function appends. Values recovered from the loaded image and
 * cross-checked statically through __cfstring/__cstring (see the file header).
 *
 * @Flexo 0x1c76a00
 */
export const AU_SURROUND_PANNER_KPRESETS: readonly AUPreset[] = [
  /** kPresets[0] @Flexo 0x1c76a00 — cfstring 0x19d24a8, cstring 0x1681462 */
  { presetNumber: 0, presetName: "Left/Right" },
  /** kPresets[1] @Flexo 0x1c76a10 — cfstring 0x19d24c8, cstring 0x168146d */
  { presetNumber: 1, presetName: "Center" },
  /** kPresets[2] @Flexo 0x1c76a20 — cfstring 0x19d24e8, cstring 0x1681474 */
  { presetNumber: 2, presetName: "All Speakers" },
  /** kPresets[3] @Flexo 0x1c76a30 — cfstring 0x19d2508, cstring 0x1681481 */
  { presetNumber: 3, presetName: "Surround" },
] as const;

/** An out-parameter cell holding a `__CFArray const*`, i.e. the C `**` the
 *  signature takes. Modelled as a one-slot box because the body writes THROUGH
 *  the pointer (`movq %r14, (%rbx)` @0x124cc5c). */
export interface CFArrayOutParam {
  value: unknown;
}

/**
 * `AUSurroundPanner` — Flexo's surround panner audio unit.
 *
 * No instance state is modelled: the one transcribed method never reads `this`
 * (see the file header).
 *
 * @Flexo 0x124cc00
 */
export class AUSurroundPanner {
  /**
   * `AUSurroundPanner::GetPresets(__CFArray const** outArray) const`
   * — @Flexo 0x124cc00
   *   __ZNK16AUSurroundPanner10GetPresetsEPPK9__CFArray
   *
   * Builds a 4-element CFMutableArray holding pointers to the static
   * `kPresets` table and stores it through `outArray`. Returns 0 (noErr)
   * unconditionally — including on the NULL-out-pointer path, where it does
   * nothing at all.
   *
   * Transcribed here: the NULL test @0x124cc00 and its shared `xorl %eax,%eax`
   * exit @0x124cc63. The array construction crosses into CoreFoundation, which
   * is a true out-of-scope extern, so it raises a boundary throw at the first
   * CF call — with the full recovered table available above as
   * `AU_SURROUND_PANNER_KPRESETS` for whoever wires that boundary.
   *
   * @returns 0 (noErr), always.
   */
  GetPresets(outArray: CFArrayOutParam | null): number {
    // ------------------------------------------------------------
    // @0x124cc00  testq %rsi, %rsi ; @0x124cc03 je 0x124cc63
    //   ZF=1 iff the out-pointer is 0; `je` taken -> 0x124cc63, which is the
    //   shared `xorl %eax,%eax ; retq`. Note this test precedes the prologue,
    //   so this path builds no frame and touches nothing.
    // ------------------------------------------------------------
    if (outArray === null) {
      // @0x124cc63..@0x124cc65 — xorl %eax, %eax ; retq
      return AU_SURROUND_PANNER_NOERR;
    }

    // @0x124cc18 _CFArrayCreateMutable — FIRST CoreFoundation boundary.
    throw new Error(
      "AUSurroundPanner::GetPresets(outArray) requires " +
        "_CFArrayCreateMutable(NULL, 4, NULL) @Flexo 0x124cc18 (CF stub " +
        "@0x14946aa) — CoreFoundation is a true out-of-scope extern for this " +
        "port (see the landed OZApplication decode @0x5134 for the same " +
        "boundary). The disasm continues: four _CFArrayAppendValue calls " +
        "@0x124cc2a, @0x124cc39, @0x124cc48 and @0x124cc57 (CF stub " +
        "@0x149469e), appending &kPresets[0..3] at @Flexo 0x1c76a00, 0x1c76a10, " +
        "0x1c76a20 and 0x1c76a30 — POINTERS into the static table, not copies, " +
        "and the array is created with NULL callbacks so CF neither retains " +
        "nor copies them; then movq %r14,(%rbx) @0x124cc5c stores the array " +
        "through outArray and the function returns 0 via the shared xorl " +
        "@0x124cc63. The table's four entries are recovered and available as " +
        "AU_SURROUND_PANNER_KPRESETS in this file. @0x124cc00",
    );
  }
}

/**
 * The value `GetPresets` returns on every path: 0, from the shared
 * `xorl %eax, %eax` — CoreAudio's `noErr`.
 *
 * @Flexo 0x124cc63
 */
const AU_SURROUND_PANNER_NOERR = 0; // @Flexo 0x124cc63
