// GetHgcCopyMaskAlphaToMaskRGBVisibleProgram.ts — raw transcription of Ozone's
// `GetHgcCopyMaskAlphaToMaskRGBVisibleProgram()`.
//
// One free function per file, named after the function (PORTING_SPEC naming rule), following the
// landed sibling raw-port/src/render/GetHgcWrapRepeatVisibleProgram.ts, which ports the same shape
// of accessor and whose conventions this file deliberately mirrors.
//
// Provenance (Ozone framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Symbol ported in this file:
//   @0x6ab530  GetHgcCopyMaskAlphaToMaskRGBVisibleProgram()
//              __ZL42GetHgcCopyMaskAlphaToMaskRGBVisibleProgramv
//     (`__ZL` = translation-unit-local / internal linkage, so `nm` reports it `t`.)
//
// Source disassembly (re-derive with
// `raw-port/tools/disasm.sh --sym __ZL42GetHgcCopyMaskAlphaToMaskRGBVisibleProgramv Ozone`):
//   raw-port/re/disasm/__ZL42GetHgcCopyMaskAlphaToMaskRGBVisibleProgramv.s (5 lines)
//
// ---------------------------------------------------------------------------
// FULL DISASM — the whole function
// ---------------------------------------------------------------------------
//   0x6ab530  pushq %rbp                  ; frame setup (no TS counterpart)
//   0x6ab531  movq  %rsp, %rbp
//   0x6ab534  leaq  0x14f33f(%rip), %rax  ; %rax = 0x6ab53b + 0x14f33f = 0x7fa87a
//                                         ; = the Metal "visible" shader SOURCE
//                                         ; string in __TEXT,__cstring
//   0x6ab53b  popq  %rbp
//   0x6ab53c  retq                        ; returns the char*
//   0x6ab53d  nopl  (%rax)                ; padding, not executed
//
// A pure constant getter: it returns a `char const*` to a NUL-terminated 317-byte string and
// touches nothing else. No argument, no branch, no state, no callee (`depgraph.py deps` lists
// nothing). The RIP-relative displacement is measured from the NEXT instruction (0x6ab53b) — using
// the leaq's own address instead would land 7 bytes early and name a different string, which is
// the one arithmetic mistake available in a function this small.
//
// The string below is transcribed VERBATIM, byte-for-byte as read out of the mapped image at that
// address, not from otool's escaped comment. Two independent checks that it is complete and
// correctly located, both run rather than asserted:
//   * the embedded `//LEN=000000013d` header is 0x13d = 317, exactly the byte count read back —
//     the string carries its own length self-check;
//   * calling the live function returns a pointer whose value minus the dyld slide is exactly
//     0x7fa87a, i.e. the address this port's `leaq` arithmetic computed, and the bytes read at the
//     computed VA are identical to the bytes read through the returned pointer.
//
// THIS UNIT PORTS THE ACCESSOR, NOT THE SHADER. Translating the shader body into TS is a separate
// exercise with its own rules (one shader per file under src/shaders/, transcribed from the
// AIR/LLVM IR rather than from this source text). The string is kept exact so a host can submit
// the identical program, which is the accessor's entire observable contract. For the record, the
// program it carries is trivial: it broadcasts `color1.w` into the output's RGB and passes
// `color0.w` through as alpha — the "copy mask alpha to mask RGB" the name promises.
//
// ---------------------------------------------------------------------------
// ORACLE
// ---------------------------------------------------------------------------
// raw-port/re/oracle/GetHgcCopyMaskAlphaToMaskRGBVisibleProgram_oracle.py calls the LIVE function
// (a LOCAL symbol, so it is reached at dyld slide + 0x6ab530 through ozone_loader's @rpath preload,
// under `arch -x86_64`) and checks: the 5 prologue bytes at that address; that the returned pointer
// minus the slide is exactly 0x7fa87a; that the 317 bytes there are byte-for-byte the constant
// below, compared as RAW BYTES rather than as decoded text; and that the answer is invariant across
// calls. A negative control mutating one byte of the expectation is killed, so the comparison is
// not vacuous.

/**
 * The Metal shader-graph "visible" program source returned by
 * `GetHgcCopyMaskAlphaToMaskRGBVisibleProgram()` @Ozone 0x6ab534.
 *
 * A verbatim copy of the NUL-terminated C string at Ozone __TEXT,__cstring VA 0x7fa87a (317 bytes,
 * 13 lines). Do not reformat it: the leading `//Metal1.0` / `//LEN=` header lines are part of the
 * program text the runtime consumes, and `LEN=000000013d` is the byte count of the string itself,
 * so an edit that changes the length makes the string internally inconsistent.
 */
const kHgcCopyMaskAlphaToMaskRGB_MetalVisible_Program: string =
  "//Metal1.0     \n" +
  "//LEN=000000013d\n" +
  "[[ visible ]] FragmentOut HgcCopyMaskAlphaToMaskRGB_hgc_visible(const constant float4* hg_Params,\n" +
  "    float4 color0,\n" +
  "    float4 color1)\n" +
  "{\n" +
  "    float4 r0;\n" +
  "    FragmentOut output;\n" +
  "\n" +
  "    r0.w = color1.w;\n" +
  "    output.color0.xyz = r0.www;\n" +
  "    output.color0.w = color0.w;\n" +
  "    return output;\n" +
  "}\n";

/**
 * `GetHgcCopyMaskAlphaToMaskRGBVisibleProgram()` — @Ozone 0x6ab530
 *   __ZL42GetHgcCopyMaskAlphaToMaskRGBVisibleProgramv
 *
 * Returns the `char const*` to the Metal "visible" shader source at __TEXT,__cstring 0x7fa87a.
 * The whole body is one `leaq` between a frame prologue and a `retq`.
 *
 * The pointer is a real pointer to a real string — never null — and the same one on every call
 * (measured live: the returned pointer minus the dyld slide is 0x7fa87a on every call).
 *
 * @returns the shader source, exactly as embedded in the binary.
 */
export function GetHgcCopyMaskAlphaToMaskRGBVisibleProgram(): string { // @Ozone 0x6ab530
  // @0x6ab534 — leaq 0x14f33f(%rip), %rax : the address of the literal at
  //   0x6ab53b + 0x14f33f = 0x7fa87a. Returning the string value is the JS equivalent of returning
  //   that pointer (the caller can only read it).
  return kHgcCopyMaskAlphaToMaskRGB_MetalVisible_Program;
  // @0x6ab53b/@0x6ab53c — epilogue + retq.
}
