// GetHgcMaskCompSubtractVisibleProgram.ts — raw transcription of Ozone's
// `GetHgcMaskCompSubtractVisibleProgram()`.
//
// One free function per file, named after the function (PORTING_SPEC naming rule; the same
// treatment as the landed raw-port/src/render/GetHgcWrapRepeatVisibleProgram.ts and
// GetHgcCopyMaskAlphaToMaskRGBVisibleProgram.ts, which are the same shape of symbol).
//
// Provenance (Ozone framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Symbol ported in this file:
//   @0x6a6aa0  GetHgcMaskCompSubtractVisibleProgram()   __ZL36GetHgcMaskCompSubtractVisibleProgramv
//     (`__ZL` = translation-unit-local / internal linkage, so `nm` reports it `t`.)
//
// Source disassembly (re-derive with
// `bash raw-port/tools/disasm.sh --sym __ZL36GetHgcMaskCompSubtractVisibleProgramv Ozone`):
//   raw-port/re/disasm/__ZL36GetHgcMaskCompSubtractVisibleProgramv.s (7 lines)
//
// ---------------------------------------------------------------------------
// FULL DISASM — the whole function
// ---------------------------------------------------------------------------
//   0x6a6aa0  pushq %rbp                  ; frame setup (no TS counterpart)
//   0x6a6aa1  movq  %rsp, %rbp
//   0x6a6aa4  leaq  0x15332a(%rip), %rax  ; %rax = 0x6a6aab + 0x15332a = 0x7f9dd5
//                                         ; = the Metal "visible" shader SOURCE string
//                                         ; in Ozone __TEXT,__cstring
//   0x6a6aab  popq  %rbp
//   0x6a6aac  retq                        ; returns the char*
//   0x6a6aad  nopl  (%rax)                ; padding, not executed
//
// A pure constant getter: no argument, no branch, no state, no callee (`depgraph.py deps` lists
// nothing, and there is no `callq` in the body). The RIP-relative displacement is measured from
// the NEXT instruction (0x6a6aab), which is what puts the literal at 0x7f9dd5 — using the `leaq`'s
// own address instead would name a string 7 bytes earlier, i.e. a different one.
//
// The string below is transcribed VERBATIM, byte-for-byte as read out of the live image at that
// address (740 bytes + NUL), not retyped from otool's escaped one-line comment. The embedded
// `//LEN=00000002e4` header is an internal self-check: 0x2e4 = 740 = exactly the byte count read
// back.
//
// This unit ports the ACCESSOR, not the shader. Translating the shader body into TS is a separate
// exercise with its own rules (raw-port/army/SHADERS.md — one shader per file under src/shaders/,
// transcribed from the AIR/LLVM IR rather than from this source text). The string is kept exact so
// a host can submit the identical program, which is the accessor's entire observable contract.
//
// ---------------------------------------------------------------------------
// ORACLE — raw-port/re/oracle/GetHgcMaskCompSubtractVisibleProgram_oracle.py
// ---------------------------------------------------------------------------
// Under `arch -x86_64 /usr/bin/python3`, it calls the LIVE function (a LOCAL symbol, reached at
// dyld slide + 0x6a6aa0 through ozone_loader.py's recursive @rpath preload) and checks, against
// ONE definition of the expected bytes taken from the port itself:
//   * the returned pointer minus the dyld slide is exactly 0x7f9dd5 — the address this port's
//     `leaq` arithmetic identified, so the pointer arithmetic in the comment above is measured
//     rather than asserted;
//   * the 740 bytes there are byte-for-byte the constant below, compared as RAW BYTES read from
//     the port's own file (not a copy typed into the harness, which would only prove the harness
//     agrees with itself), plus the NUL terminator;
//   * the answer is invariant across calls;
//   * NEGATIVE CONTROL: the same comparison against the bytes one byte further on must FAIL, so a
//     pass is known to be discriminating.

/**
 * The Metal shader-graph "visible" program source returned by
 * `GetHgcMaskCompSubtractVisibleProgram()` @Ozone 0x6a6aa4.
 *
 * A verbatim copy of the NUL-terminated C string at Ozone __TEXT,__cstring VA 0x7f9dd5
 * (740 bytes, 24 lines). Do not reformat it: the leading `//Metal1.0` / `//LEN=` header lines are
 * part of the program text the runtime consumes, and `LEN=00000002e4` is the byte count of the
 * string itself.
 *
 * @const Ozone __TEXT,__cstring 0x7f9dd5 (via `leaq 0x15332a(%rip)` @0x6a6aa4)
 */
export const kHgcMaskCompSubtract_MetalVisible_Program: string =
  "//Metal1.0     \n" +
  "//LEN=00000002e4\n" +
  "[[ visible ]] FragmentOut HgcMaskCompSubtract_hgc_visible(const constant float4* hg_Params,\n" +
  "    float4 color0,\n" +
  "    float4 color1)\n" +
  "{\n" +
  "    const float4 c0 = float4(1.000000000, -2.000000000, 0.000000000, 0.000000000);\n" +
  "    float4 r0, r1;\n" +
  "    FragmentOut output;\n" +
  "\n" +
  "    r0 = color0;\n" +
  "    r0.x = dot(r0, hg_Params[0]);\n" +
  "    r0.x = r0.x*hg_Params[1].y;\n" +
  "    r0.y = r0.x*c0.y + c0.x;\n" +
  "    r0.y = r0.y*hg_Params[1].x + r0.x;\n" +
  "    r0.w = -r0.y + c0.x;\n" +
  "    r1 = color1;\n" +
  "    r0.z = select(r0.y, r0.w, -hg_Params[1].z < 0.00000f);\n" +
  "    r0.x = hg_Params[1].z + c0.y;\n" +
  "    r1 = r0.wwww*r1;\n" +
  "    r0.x = select(r0.y, r0.z, r0.x < 0.00000f);\n" +
  "    output.color0 = select(r1, r0.xxxx, -hg_Params[1].wwww < 0.00000f);\n" +
  "    return output;\n" +
  "}\n";

/**
 * `GetHgcMaskCompSubtractVisibleProgram()` — @Ozone 0x6a6aa0
 *   __ZL36GetHgcMaskCompSubtractVisibleProgramv
 *
 * Returns the `char const*` to the Metal "visible" shader source at __TEXT,__cstring 0x7f9dd5.
 * The whole body is one `leaq` between a frame prologue and a `retq`: no argument, no branch, no
 * state, no callee.
 *
 * The pointer is a real pointer to a real string — never null — and the same one on every call
 * (measured live: the returned pointer minus the dyld slide is 0x7f9dd5 on every call).
 *
 * @returns the shader source, exactly as embedded in the binary.
 */
export function GetHgcMaskCompSubtractVisibleProgram(): string { // @Ozone 0x6a6aa0
  // @0x6a6aa4 — leaq 0x15332a(%rip), %rax : the address of the literal at
  //   0x6a6aab + 0x15332a = 0x7f9dd5. Returning the string value is the JS equivalent of
  //   returning that pointer (the caller can only read it).
  return kHgcMaskCompSubtract_MetalVisible_Program;
  // @0x6a6aab/@0x6a6aac — epilogue + retq.
}
