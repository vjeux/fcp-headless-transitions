// GetHgcWrapRepeatVisibleProgram.ts — raw transcription of Ozone's
// `GetHgcWrapRepeatVisibleProgram()`.
//
// One free function per file, named after the function (PORTING_SPEC naming rule;
// the same treatment as the landed raw-port/src/render/Gettype3_nice_satTile_AVX.ts).
//
// Provenance (Ozone framework, x86_64 slice):
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Symbol ported in this file:
//   @0x6c6720  GetHgcWrapRepeatVisibleProgram()   __ZL30GetHgcWrapRepeatVisibleProgramv
//     (`__ZL` = translation-unit-local / internal linkage, so `nm` reports it `t`.)
//
// Source disassembly (re-derived with
// `raw-port/tools/disasm.sh --sym __ZL30GetHgcWrapRepeatVisibleProgramv Ozone`):
//   raw-port/re/disasm/__ZL30GetHgcWrapRepeatVisibleProgramv.s (5 lines)
//
// ---------------------------------------------------------------------------
// FULL DISASM — the whole function
// ---------------------------------------------------------------------------
//   0x6c6720  pushq %rbp                  ; frame setup (no TS counterpart)
//   0x6c6721  movq  %rsp, %rbp
//   0x6c6724  leaq  0x137a58(%rip), %rax  ; %rax = 0x6c672b + 0x137a58 = 0x7fe183
//                                         ; = the Metal "visible" shader SOURCE
//                                         ; string in __TEXT,__cstring
//   0x6c672b  popq  %rbp
//   0x6c672c  retq                        ; returns the char*
//   0x6c672d  nopl  (%rax)                ; padding, not executed
//
// The function is a pure constant getter: it returns a `char const*` to a
// NUL-terminated 1,729-byte string and touches nothing else. The RIP-relative
// displacement is measured from the NEXT instruction (0x6c672b), which is what
// puts the literal at 0x7fe183 — getting that base wrong by the 7-byte
// instruction length would name a different string.
//
// The string itself is transcribed VERBATIM below, byte-for-byte as read out of
// the Mach-O at that address (not from otool's escaped comment, which truncates).
// It is the Helium/Ozone shader-graph "visible" entry point for HgcWrapRepeat:
// it wraps texture coordinates into a repeating tile before sampling. Note the
// embedded `//LEN=00000006c1` header — 0x6c1 = 1,729, exactly the byte count read
// back, an internal self-check that the transcription is complete.
//
// This unit ports the ACCESSOR, not the shader: translating the shader body into
// TS is a separate exercise with its own rules (raw-port/army/SHADERS.md — one
// shader per file under src/shaders/, transcribed from the AIR/LLVM IR, not from
// this source text). The string is kept exact so a host can submit the identical
// program, which is the accessor's entire observable contract.
//
// CALLEES: none — no callq, no extern, no indirect or virtual dispatch
// (`depgraph.py deps` lists nothing).
//
// ---------------------------------------------------------------------------
// ORACLE
// ---------------------------------------------------------------------------
// raw-port/re/oracle/GetHgcWrapRepeatVisibleProgram_oracle.py calls the LIVE
// function (LOCAL symbol, so it is reached at dyld slide + 0x6c6720 through
// ozone_loader.py's @rpath preload, under `arch -x86_64`) and checks BOTH that
// the returned pointer minus the slide is exactly 0x7fe183 — i.e. the literal
// this port's `leaq` arithmetic identified — and that the 1,729 bytes there are
// byte-for-byte the constant below, compared as raw bytes rather than as decoded
// text. Both held on every call, and the answer is invariant across calls.

/**
 * The Metal shader-graph "visible" program source returned by
 * `GetHgcWrapRepeatVisibleProgram()` @Ozone 0x6c6724.
 *
 * A verbatim copy of the NUL-terminated C string at Ozone __TEXT,__cstring
 * VA 0x7fe183 (1,729 bytes, 52 lines). Do not reformat it: the leading
 * `//Metal1.0` / `//LEN=` header lines are part of the program text the runtime
 * consumes, and `LEN=00000006c1` is the byte count of the string itself.
 *
 * @const Ozone __TEXT,__cstring 0x7fe183 (via `leaq 0x137a58(%rip)` @0x6c6724)
 */
export const kHgcWrapRepeat_MetalVisible_Program: string =
  "//Metal1.0     \n" +
  "//LEN=00000006c1\n" +
  "[[ visible ]] FragmentOut HgcWrapRepeat_hgc_visible(const constant float4* hg_Params, \n" +
  "    texture2d< float > hg_Texture0, \n" +
  "    sampler hg_Sampler0,\n" +
  "    float4 texCoord0)\n" +
  "{\n" +
  "    const float4 c0 = float4(-0.009999999776, 1.000000000, 0.000000000, 0.000000000);\n" +
  "    float4 r0, r1, r2;\n" +
  "    FragmentOut output;\n" +
  "\n" +
  "    r0 = texCoord0.yyyy*hg_Params[2];\n" +
  "    r0 = texCoord0.xxxx*hg_Params[1] + r0;\n" +
  "    r0 = texCoord0.zzzz*hg_Params[3] + r0;\n" +
  "    r1 = r0 + hg_Params[4];\n" +
  "    r0.x = float(r0.w < -hg_Params[4].w);\n" +
  "    r0.z = float(c0.z < r1.w);\n" +
  "    r0.y = r0.z;\n" +
  "    r0.xy = float2(-r0.xy >= c0.zz);\n" +
  "    r0.xz = fmin(r0.xx, r0.yz);\n" +
  "    r0.w = fmin(r1.w, c0.x);\n" +
  "    r2.x = fmax(r1.w, -c0.x);\n" +
  "    r0.z = select(r0.w, r2.x, -r0.z < 0.00000f);\n" +
  "    r0.x = select(r0.z, -c0.x, -r0.x < 0.00000f);\n" +
  "    r1.xyz = r1.xyz/r0.xxx;\n" +
  "    r2.zw = r1.xy - hg_Params[0].xy;\n" +
  "    r2.xy = r2.zw/hg_Params[0].zw;\n" +
  "    r2.xy = floor(r2.xy);\n" +
  "    r2.xy = -r2.xy*hg_Params[0].zw + r2.zw;\n" +
  "    r1.xy = r2.xy + hg_Params[0].xy;\n" +
  "    r0.xyz = r1.yyy*hg_Params[6].xyz;\n" +
  "    r0.xyz = r1.xxx*hg_Params[5].xyz + r0.xyz;\n" +
  "    r0.xyz = r1.zzz*hg_Params[7].xyz + r0.xyz;\n" +
  "    r0.w = float(r0.z < -hg_Params[8].w);\n" +
  "    r0.xyz = r0.xyz + hg_Params[8].xyw;\n" +
  "    r2.y = float(c0.z < r0.z);\n" +
  "    r2.x = r2.y;\n" +
  "    r2.z = fmin(r0.z, c0.x);\n" +
  "    r0.w = c0.y - r0.w;\n" +
  "    r2.y = fmin(r0.w, r2.y);\n" +
  "    r2.x = float(-r2.x >= c0.z);\n" +
  "    r0.z = fmax(r0.z, -c0.x);\n" +
  "    r0.z = select(r2.z, r0.z, -r2.y < 0.00000f);\n" +
  "    r0.w = fmin(r0.w, r2.x);\n" +
  "    r0.z = select(r0.z, -c0.x, -r0.w < 0.00000f);\n" +
  "    r0.xy = r0.xy/r0.zz;\n" +
  "    r0.xy = r0.xy + hg_Params[9].xy;\n" +
  "    r0.xy = r0.xy*hg_Params[9].zw;\n" +
  "    output.color0 = hg_Texture0.sample(hg_Sampler0, r0.xy);\n" +
  "    return output;\n" +
  "}\n";

/**
 * `GetHgcWrapRepeatVisibleProgram()` — @Ozone 0x6c6720
 *   __ZL30GetHgcWrapRepeatVisibleProgramv
 *
 * Returns the `char const*` to the Metal "visible" shader source at
 * __TEXT,__cstring 0x7fe183. The whole body is one `leaq` between a frame
 * prologue and a `retq`: no argument, no branch, no state, no callee.
 *
 * The pointer is a real pointer to a real string — never null — and the same
 * one on every call (measured live: returned pointer minus the dyld slide is
 * 0x7fe183 every time).
 *
 * @returns the shader source, exactly as embedded in the binary.
 */
export function GetHgcWrapRepeatVisibleProgram(): string { // @Ozone 0x6c6720
  // @0x6c6724 — leaq 0x137a58(%rip), %rax : the address of the literal at
  //   0x6c672b + 0x137a58 = 0x7fe183. Returning the string value is the JS
  //   equivalent of returning that pointer (the caller can only read it).
  return kHgcWrapRepeat_MetalVisible_Program;
  // @0x6c672b/@0x6c672c — epilogue + retq.
}
