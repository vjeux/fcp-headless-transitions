// GetHgcMaskCompAddVisibleProgram.ts — raw transcription of Ozone's
// `GetHgcMaskCompAddVisibleProgram()`.
//
// One free function per file, named after the function (PORTING_SPEC naming rule), following the
// landed siblings raw-port/src/render/GetHgcCopyMaskAlphaToMaskRGBVisibleProgram.ts and
// GetHgcWrapRepeatVisibleProgram.ts, which port the same shape of accessor and whose conventions
// this file deliberately mirrors.
//
// Provenance (Ozone framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Symbol ported in this file:
//   @0x6d5550  GetHgcMaskCompAddVisibleProgram()
//              __ZL31GetHgcMaskCompAddVisibleProgramv
//     (`__ZL` = translation-unit-local / internal linkage, so `nm` reports it `t`. A local symbol
//      is still oracle-able: it is called at dyld slide + this address, and the harness checks the
//      prologue bytes there before believing anything it measures.)
//
// Source disassembly (re-derive with
// `raw-port/tools/disasm.sh --sym __ZL31GetHgcMaskCompAddVisibleProgramv Ozone`):
//   raw-port/re/disasm/__ZL31GetHgcMaskCompAddVisibleProgramv.s (7 lines)
//
// ---------------------------------------------------------------------------
// FULL DISASM — the whole function
// ---------------------------------------------------------------------------
//   0x6d5550  pushq %rbp                  ; frame setup (no TS counterpart)
//   0x6d5551  movq  %rsp, %rbp
//   0x6d5554  leaq  0x129ed0(%rip), %rax  ; %rax = 0x6d555b + 0x129ed0 = 0x7ff42b
//                                         ; = the Metal "visible" shader SOURCE
//                                         ; string in __TEXT,__cstring
//   0x6d555b  popq  %rbp
//   0x6d555c  retq                        ; returns the char*
//   0x6d555d  nopl  (%rax)                ; padding, not executed
//
// A pure constant getter: it returns a `char const*` to a NUL-terminated 763-byte string and
// touches nothing else. No argument, no branch, no state, no callee (`depgraph.py deps` lists
// nothing). The RIP-relative displacement is measured from the NEXT instruction (0x6d555b) — using
// the leaq's own address instead would land 7 bytes early and name a different string, which is
// the one arithmetic mistake available in a function this small. Both the address and the bytes
// are checked against the live image by the oracle rather than argued for here.
//
// The string below is transcribed VERBATIM, byte-for-byte as read out of the mapped image at that
// address (`ctypes.string_at(slide + 0x7ff42b)`), not from otool's escaped comment. Two independent
// checks that it is complete and correctly located, both run rather than asserted:
//   * the embedded `//LEN=00000002fb` header is 0x2fb = 763, exactly the byte count read back —
//     the string carries its own length self-check;
//   * calling the live function returns a pointer whose value minus the dyld slide is exactly
//     0x7ff42b, i.e. the address this port's `leaq` arithmetic computed, and the bytes read at the
//     computed VA are identical to the bytes read through the returned pointer.
//
// THIS UNIT PORTS THE ACCESSOR, NOT THE SHADER. Translating the shader body into TS is a separate
// exercise with its own rules (one shader per file under src/shaders/, transcribed from the
// AIR/LLVM IR rather than from this source text). The string is kept exact so a host can submit the
// identical program, which is the accessor's entire observable contract. For the record, the
// program it carries is the "mask composite ADD" blend: it dots `color0` with `hg_Params[0]`,
// scales and biases that through `hg_Params[1].y/.x`, and then `select`s between the additive
// clamp of `color1` and the scalar broadcast according to the signs of `hg_Params[1].z/.w`.
//
// ---------------------------------------------------------------------------
// ORACLE
// ---------------------------------------------------------------------------
// raw-port/re/oracle/GetHgcMaskCompAddVisibleProgram_oracle.py calls the LIVE function (a LOCAL
// symbol, reached at dyld slide + 0x6d5550 through ozone_loader's @rpath preload, under
// `arch -x86_64`) and checks: the prologue bytes at that address; that the returned pointer minus
// the slide is exactly 0x7ff42b; that the 763 bytes there are byte-for-byte what the EXECUTED port
// returns, compared as RAW BYTES rather than decoded text; and that the answer is invariant across
// calls. Its negative control MUTATES THE PORT and re-runs the differential, rather than flipping a
// byte of the expectation and re-comparing it — the sibling's control does the latter, which
// restates the measurement standing beside it and cannot distinguish a broken comparison from a
// working one.

/**
 * The Metal shader-graph "visible" program source returned by
 * `GetHgcMaskCompAddVisibleProgram()` @Ozone 0x6d5554.
 *
 * A verbatim copy of the NUL-terminated C string at Ozone __TEXT,__cstring VA 0x7ff42b (763 bytes,
 * 25 lines). Do not reformat it: the leading `//Metal1.0` / `//LEN=` header lines are part of the
 * program text the runtime consumes, and `LEN=00000002fb` is the byte count of the string itself,
 * so an edit that changes the length makes the string internally inconsistent.
 */
const kHgcMaskCompAdd_MetalVisible_Program: string =
  "//Metal1.0     \n" +
  "//LEN=00000002fb\n" +
  "[[ visible ]] FragmentOut HgcMaskCompAdd_hgc_visible(const constant float4* hg_Params,\n" +
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
  "    r1.x = c0.x - r0.y;\n" +
  "    r0.z = select(r0.y, r1.x, -hg_Params[1].z < 0.00000f);\n" +
  "    r1 = color1;\n" +
  "    r0.x = hg_Params[1].z + c0.y;\n" +
  "    r1 = clamp(r0.yyyy + r1, 0.00000f, 1.00000f);\n" +
  "    r0.x = select(r0.y, r0.z, r0.x < 0.00000f);\n" +
  "    output.color0 = select(r1, r0.xxxx, -hg_Params[1].wwww < 0.00000f);\n" +
  "    return output;\n" +
  "}\n";

/**
 * `GetHgcMaskCompAddVisibleProgram()` — @Ozone 0x6d5550
 * (`__ZL31GetHgcMaskCompAddVisibleProgramv`, nm class `t`).
 *
 * Returns the address of the constant above and nothing else:
 *
 *   0x6d5554  leaq 0x129ed0(%rip), %rax   ; -> 0x7ff42b, the shader source
 *   0x6d555c  retq
 *
 * The C function returns a `char const*` into the framework's `__cstring`; the port returns the
 * string itself, which is the same observable for every caller in a TS host (there is no pointer
 * identity to preserve — the callers submit the text to a Metal compiler). The live function does
 * return the SAME pointer on every call, and the oracle checks that too, so a future caller that
 * does depend on identity has a measured fact to rely on rather than an assumption.
 */
export function GetHgcMaskCompAddVisibleProgram(): string {
  // @0x6d5554 leaq 0x129ed0(%rip), %rax  /  @0x6d555c retq
  return kHgcMaskCompAdd_MetalVisible_Program;
}
