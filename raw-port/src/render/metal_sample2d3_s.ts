// raw-port/src/render/metal_sample2d3_s.ts
//
// FCP Helium file-static free function `metal_sample2d3_s()` — the
// compiler-outlined lazy initializer for the function-local static
// `metal_sample2d3_s()::shader_string`, a `string_t` that holds the baked
// Metal fragment-shader source for the "sample texture 3" pass-through
// program (`output.color0 = hg_Texture3.sample(hg_Sampler3, texCoord3)`).
//
// Per PORTING_SPEC "Naming rule": this is a FREE function (ledger class
// `(free)`), so it gets a file named after the function itself.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Helium.framework/Versions/A/Helium (x86_64 slice; VAs
//             unadjusted from `otool -tV`, i.e. file offset = VA + 0x4000).
//
// Disassembly saved at:
//   raw-port/re/disasm/Helium.__ZL17metal_sample2d3_sv.s          (@0xbae70, 11 lines)
//   raw-port/re/disasm/Helium.__ZL17metal_sample2d3_svcold1.s     (@0x3c2550, 23 lines)
//
// SYMBOLS (nm -arch x86_64 -m Helium):
//   0x000bae70  (__TEXT,__text) __ZL17metal_sample2d3_sv                    — this function
//   0x003c2550  (__TEXT,__text) __ZL17metal_sample2d3_sv.cold.1             — outlined slow path
//   0x00add578  (__DATA,__bss)  __ZZL17metal_sample2d3_svE13shader_string   — the static string_t
//   0x00add5a8  (__DATA,__bss)  __ZGVZL17metal_sample2d3_svE13shader_string — its 8-byte guard
//   0x008e0219  (__TEXT,__cstring) the 511-byte shader source literal
//               (loaded @0x3c2564 as `leaq 0x51dcae(%rip), %rax`;
//                0x3c256b + 0x51dcae = 0x8e0219)
//
// ── RETURN TYPE ────────────────────────────────────────────────────────────
// The mangled name `__ZL17metal_sample2d3_sv` encodes only the parameter list
// (`v` = void), never the return type. The BODY pins it: the hot path is
//   `movzbl guard,%eax ; testb %al,%al ; je cold ; retq`
// — it returns WITHOUT ever loading %rax with a value (and the cold path's
// %rax is whatever __cxa_guard_release left). So this out-of-line copy
// returns nothing: its entire observable job is "make sure shader_string is
// constructed". Callers that want the string read
// `__ZZL17metal_sample2d3_svE13shader_string` directly (the accessor half of
// the original `static string_t shader_string = "...";  return shader_string;`
// idiom was inlined at every call site, leaving only this guarded-init thunk
// out of line). We therefore port it as `(): void`.
//
// ── FULL DISASM — hot path (raw-port/re/disasm/Helium.__ZL17metal_sample2d3_sv.s) ──
//   __ZL17metal_sample2d3_sv:
//     0xbae70  movzbl __ZGVZL17metal_sample2d3_svE13shader_string(%rip), %eax
//                                              ; al = guard byte @0xadd5a8
//     0xbae77  testb  %al, %al
//     0xbae79  je     0xbae7c                  ; guard == 0 -> not yet built, go build
//     0xbae7b  retq                            ; guard != 0 -> already built, done
//     0xbae7c  pushq  %rbp                     ; frame prologue
//     0xbae7d  movq   %rsp, %rbp
//     0xbae80  callq  __ZL17metal_sample2d3_sv.cold.1   ; @0x3c2550
//     0xbae85  popq   %rbp                     ; frame epilogue
//     0xbae86  retq
//     0xbae87  nopw   (%rax,%rax)              ; alignment padding
//
// ── FULL DISASM — cold path (raw-port/re/disasm/Helium.__ZL17metal_sample2d3_svcold1.s) ──
//   __ZL17metal_sample2d3_sv.cold.1:
//     0x3c2550  pushq  %rbp                              ; frame prologue
//     0x3c2551  movq   %rsp, %rbp
//     0x3c2554  leaq   [guard @0xadd5a8](%rip), %rdi
//     0x3c255b  callq  ___cxa_guard_acquire              ; libc++abi extern
//     0x3c2560  testl  %eax, %eax
//     0x3c2562  je     0x3c25b5                          ; 0 -> another thread built it: bail
//     0x3c2564  leaq   0x51dcae(%rip), %rax              ; rax = literal @0x8e0219
//     0x3c256b  movq   %rax, [shader_string @0xadd578](%rip)
//                                                        ; shader_string.data = literal
//     0x3c2572  leaq   [shader_string @0xadd578](%rip), %rsi   ; rsi = &shader_string
//     0x3c2579  movq   $0x1ff, 0x71affc(%rip)            ; [0xadd580] = 511  (= +0x08 len)
//     0x3c2584  xorps  %xmm0, %xmm0
//     0x3c2587  movups %xmm0, 0x71affa(%rip)             ; [0xadd588..0xadd597] = 0  (+0x10)
//     0x3c258e  movups %xmm0, 0x71b003(%rip)             ; [0xadd598..0xadd5a7] = 0  (+0x20)
//     0x3c2595  leaq   __ZN8string_tD1Ev(%rip), %rdi     ; rdi = &string_t::~string_t
//     0x3c259c  leaq   -0x3c25a3(%rip), %rdx             ; rdx = 0x3c25a3 - 0x3c25a3 = 0
//                                                        ;      = __dso_handle (mach_header VA)
//     0x3c25a3  callq  ___cxa_atexit                     ; libc extern: register dtor
//     0x3c25a8  leaq   [guard @0xadd5a8](%rip), %rdi
//     0x3c25af  popq   %rbp
//     0x3c25b0  jmp    ___cxa_guard_release              ; tail-call; sets guard byte = 1
//     0x3c25b5  popq   %rbp                              ; race-lost early-out
//     0x3c25b6  retq
//     0x3c25b7  nopw   (%rax,%rax)                       ; alignment padding
//
// ── RIP-RELATIVE ARITHMETIC (every data address above, worked) ─────────────
//   0x3c256b + 0x51dcae = 0x8e0219   literal        (leaq @0x3c2564, next-insn 0x3c256b)
//   0x3c2584 + 0x71affc = 0xadd580   shader_string + 0x08   (movq $0x1ff @0x3c2579, len 11)
//   0x3c258e + 0x71affa = 0xadd588   shader_string + 0x10   (movups @0x3c2587, len 7)
//   0x3c2595 + 0x71b003 = 0xadd598   shader_string + 0x20   (movups @0x3c258e, len 7)
//   All three agree with `nm`'s shader_string @0xadd578, which is how the
//   +0x08 / +0x10 / +0x20 field offsets below are grounded.
//
// ── STRUCT LAYOUT — `string_t` (0x30 bytes; what THIS unit observes) ───────
//   +0x00  char*  data    ; written @0x3c256b with the .cstring literal pointer
//   +0x08  u64    len     ; written @0x3c2579 with 0x1ff = 511
//   +0x10  ...            ; 32 bytes ZEROED @0x3c2587 + @0x3c258e (two movups
//   ..                    ;   of a xorps'd xmm0), i.e. +0x10..+0x2f = 0.
//   +0x2f                 ;   raw-port/src/channels/glsl.ts decodes +0x10 as
//                         ;   `alloc` (the block descriptor pointer) — zeroing
//                         ;   it means "no heap block; this string_t is a
//                         ;   non-owning view of a .cstring literal". The
//                         ;   bytes +0x18..+0x2f are still UNDECODED (no
//                         ;   reader observed by this unit), so no field is
//                         ;   invented for them — this unit contributes only
//                         ;   the fact that they exist and start life zeroed,
//                         ;   hence sizeof(string_t) >= 0x30.
//   The `___cxa_atexit(&string_t::~string_t, &shader_string, __dso_handle)`
//   @0x3c25a3 confirms the object at 0xadd578 really is a `string_t`.
//
// ── LEN CROSS-CHECK ────────────────────────────────────────────────────────
//   The literal is self-describing: its second line is `//LEN=00000001ff`.
//   0x1ff = 511, which is exactly the byte length of the literal read out of
//   the binary (file offset 0x8e4219 = VA 0x8e0219 + 0x4000, up to the NUL) —
//   and exactly the immediate the machine stores at +0x08 @0x3c2579. The three
//   agree, so `len` excludes the terminating NUL.
//
// ── EXTERNS (all TRUE out-of-scope, each cited) ────────────────────────────
//   ___cxa_guard_acquire  @0x3c255b (stub 0x3c5000)  — libc++abi
//   ___cxa_atexit         @0x3c25a3 (stub 0x3c4fd6)  — libc
//   ___cxa_guard_release  @0x3c25b0 (stub 0x3c5006)  — libc++abi
//   __ZN8string_tD1Ev     @0x3c2595 — Helium `string_t::~string_t()`. Its
//     ADDRESS is taken, it is never CALLED here; it runs only at process
//     teardown from the atexit chain. See the note on the atexit line below.
//
// @provenance Helium @0xbae70 (metal_sample2d3_s), @0x3c2550 (.cold.1),
//             @0xadd578 (shader_string), @0xadd5a8 (guard), @0x8e0219 (literal)

import type { StringT } from "../channels/glsl";

/**
 * The 511-byte Metal fragment-shader source literal that
 * `metal_sample2d3_s()::shader_string` points at.
 *
 * @Helium 0x8e0219 (__TEXT,__cstring) — loaded @0x3c2564 by
 * `leaq 0x51dcae(%rip), %rax` (0x3c256b + 0x51dcae = 0x8e0219) and stored
 * into `shader_string.data` @0x3c256b.
 *
 * Transcribed byte-for-byte from the binary; `length === 0x1ff` (511), which
 * is the exact immediate the machine writes to `shader_string.len` @0x3c2579
 * and matches the literal's own `//LEN=00000001ff` header line.
 *
 * The program itself is Helium's trivial "sample texture unit 3" pass-through
 * fragment shader — it reads `hg_Texture3` with `hg_Sampler3` at the
 * interpolated `frag._texCoord3.xy` and writes the sample straight to
 * `output.color0`.
 */
export const METAL_SAMPLE2D3_SHADER_SOURCE: string =
  "//Metal1.0     \n" +
  "//LEN=00000001ff\n" +
  "fragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n" +
  "    const constant float4* hg_Params [[ buffer(0) ]], \n" +
  "    texture2d< float > hg_Texture3 [[ texture(3) ]], \n" +
  "    sampler hg_Sampler3 [[ sampler(3) ]])\n" +
  "{\n" +
  "    FragmentOut output;\n" +
  "\n" +
  "    output.color0 = hg_Texture3.sample(hg_Sampler3, frag._texCoord3.xy);\n" +
  "    return output;\n" +
  "}\n" +
  "//MD5=cd8bb6cc:4819f5f1:ddf3db57:3dfec92f\n" +
  "//SIG=00000000:00000008:00000000:00000000:0000:0000:0000:0000:0000:0000:0010:0000:0004:04:0:1:0\n";

/**
 * `metal_sample2d3_s()::shader_string` — the file-static `string_t` at
 * @Helium 0xadd578 (__DATA,__bss).
 *
 * Zero-initialized by the loader (it lives in __bss) and filled in by the
 * cold path of `metal_sample2d3_s()` — see the field-by-field citations in
 * the file header. Exported because the accessor half of the original
 * `static string_t shader_string = ...; return shader_string;` idiom was
 * inlined into every call site, so consumers of this translation unit read
 * the object directly rather than through a getter.
 *
 * `alloc` is `null` @0x3c2587 (the first `movups %xmm0` zeroes +0x10): this
 * string_t is a NON-OWNING view of the .cstring literal, not a heap buffer.
 */
export const metal_sample2d3_s_shader_string: StringT = {
  // The object lives in (__DATA,__bss) @0xadd578, so its pre-init state is
  // all-zero by the loader. The cold path @0x3c2550 overwrites +0x00 (data)
  // and +0x08 (len) and re-zeroes +0x10..+0x2f — see
  // `metal_sample2d3_s_cold_1` below for the per-field instruction citations.
  data: null, // +0x00  char*  — NULL until @0x3c256b runs
  len: 0, //     +0x08  u64    — 0 until @0x3c2579 writes 0x1ff
  alloc: null, //  +0x10  Alloc* — NULL; re-zeroed @0x3c2587 (non-owning view)
};

/**
 * Guard byte for `metal_sample2d3_s()::shader_string`.
 *
 * @Helium 0xadd5a8 (__DATA,__bss) — symbol
 * `__ZGVZL17metal_sample2d3_svE13shader_string`. Read as a BYTE @0xbae70
 * (`movzbl ...(%rip), %eax`), acquired @0x3c255b and set @0x3c25b0.
 *
 * The Itanium ABI guard is 8 bytes wide but only its low byte is the
 * "initialized" flag, which is the only bit this unit observes (the machine
 * reads exactly one byte with `movzbl` and lets `___cxa_guard_acquire` /
 * `___cxa_guard_release` own the rest). JS is single-threaded, so
 * `___cxa_guard_acquire` reduces to "return true iff the flag is still 0"
 * and the `je 0x3c25b5` race-lost early-out @0x3c2562 is unreachable — the
 * branch is still transcribed below so the control flow matches instruction
 * for instruction.
 */
let guard_shader_string_at_0xadd5a8 = 0;

/**
 * `metal_sample2d3_s()` — @Helium 0xbae70 — `__ZL17metal_sample2d3_sv`
 *
 * Lazily construct the function-local static
 * `metal_sample2d3_s()::shader_string` (@0xadd578) as a non-owning
 * `string_t` view over the 511-byte Metal shader literal at @0x8e0219.
 * Idempotent: every call after the first is the two-instruction hot-path
 * test-and-return @0xbae70..0xbae7b.
 *
 * Returns nothing — see the "RETURN TYPE" note in the file header (the hot
 * path rets without ever setting %rax).
 *
 * Zero in-scope callees: `depgraph.py deps __ZL17metal_sample2d3_sv` reports
 * no dependency rows. The only calls in the body are the three libc /
 * libc++abi externs cited in the file header, plus the ADDRESS (never a
 * call) of `string_t::~string_t` handed to `___cxa_atexit`. No indirect or
 * virtual calls anywhere in either the hot or the cold path.
 */
export function metal_sample2d3_s(): void {
  // @0xbae70  movzbl [guard @0xadd5a8](%rip), %eax
  const guardByte = guard_shader_string_at_0xadd5a8 & 0xff;
  // @0xbae77  testb %al, %al
  // @0xbae79  je 0xbae7c        ; ZF set (guard == 0) -> fall into the cold path
  if (guardByte !== 0) {
    // @0xbae7b  retq            ; already constructed
    return;
  }
  // @0xbae80  callq __ZL17metal_sample2d3_sv.cold.1  (@0x3c2550)
  metal_sample2d3_s_cold_1();
  // @0xbae85..0xbae86  popq %rbp ; retq
}

/**
 * `metal_sample2d3_s() (.cold.1)` — @Helium 0x3c2550 —
 * `__ZL17metal_sample2d3_sv.cold.1`
 *
 * The outlined slow path: acquire the guard, publish the literal pointer and
 * its length into `shader_string`, zero the remaining 32 bytes of the
 * object, register its destructor with the atexit chain, and release the
 * guard. Called from exactly one site (@0xbae80).
 *
 * Not exported: it is a `.cold.N` fragment of `metal_sample2d3_s`, not a
 * separately-callable FCP entry point — it is reachable only through its
 * parent, exactly as in the binary.
 */
function metal_sample2d3_s_cold_1(): void {
  // @0x3c2554  leaq [guard @0xadd5a8](%rip), %rdi
  // @0x3c255b  callq ___cxa_guard_acquire   ; libc++abi extern (stub @0x3c5000)
  //   Single-threaded JS: the guard is acquired iff the flag byte is still 0.
  const acquired = (guard_shader_string_at_0xadd5a8 & 0xff) === 0 ? 1 : 0;
  // @0x3c2560  testl %eax, %eax
  // @0x3c2562  je 0x3c25b5      ; acquire returned 0 -> a racing thread already
  //                             ; built it; pop and return without touching it.
  if (acquired === 0) {
    // @0x3c25b5..0x3c25b6  popq %rbp ; retq
    return;
  }
  // @0x3c2564  leaq 0x51dcae(%rip), %rax    ; rax = literal @0x8e0219
  // @0x3c256b  movq %rax, [0xadd578]        ; shader_string.data = rax
  metal_sample2d3_s_shader_string.data = literalBytesAt0x8e0219();
  // @0x3c2572  leaq [0xadd578](%rip), %rsi  ; rsi = &shader_string (atexit arg)
  const shaderStringRef = metal_sample2d3_s_shader_string;
  // @0x3c2579  movq $0x1ff, [0xadd580]      ; shader_string.len = 0x1ff = 511
  metal_sample2d3_s_shader_string.len = 0x1ff;
  // @0x3c2584  xorps %xmm0, %xmm0
  // @0x3c2587  movups %xmm0, [0xadd588]     ; +0x10..+0x1f = 0 -> alloc = NULL
  metal_sample2d3_s_shader_string.alloc = null;
  // @0x3c258e  movups %xmm0, [0xadd598]     ; +0x20..+0x2f = 0
  //   Those 16 bytes are string_t members this unit never sees READ, so per
  //   PORTING_SPEC Rule 5 no field is invented for them; they are already
  //   absent-and-therefore-zero in the StringT model above. Recorded here so
  //   the instruction is accounted for, not silently dropped.
  // @0x3c2595  leaq __ZN8string_tD1Ev(%rip), %rdi   ; rdi = &string_t::~string_t
  // @0x3c259c  leaq -0x3c25a3(%rip), %rdx           ; rdx = 0 = __dso_handle
  // @0x3c25a3  callq ___cxa_atexit(dtor, &shader_string, dso)
  //   ___cxa_atexit is a TRUE out-of-scope libc extern (stub @0x3c4fd6). It
  //   only appends (dtor, obj, dso) to the process teardown list; it reads
  //   and writes nothing in `shader_string`, and `string_t::~string_t`
  //   (@0x3c2595, address-taken only) runs after `exit()`. A JS module has no
  //   post-exit destructor phase, so this call contributes no value and no
  //   state to anything this file produces. `shaderStringRef` is the `%rsi`
  //   argument the machine passes, kept so the operand is explicit.
  void shaderStringRef;
  // @0x3c25a8  leaq [guard @0xadd5a8](%rip), %rdi
  // @0x3c25af  popq %rbp
  // @0x3c25b0  jmp ___cxa_guard_release     ; libc++abi extern (stub @0x3c5006)
  //   Release sets the guard's low byte to 1, which is what the hot-path
  //   `movzbl`/`testb` @0xbae70 reads on every subsequent call.
  guard_shader_string_at_0xadd5a8 = 1;
}

/**
 * The bytes of the `.cstring` literal at @Helium 0x8e0219 — i.e. the storage
 * the `char*` written into `shader_string.data` @0x3c256b points at.
 *
 * `StringT.data` is modelled as the pointed-to byte buffer (see
 * raw-port/src/channels/glsl.ts), so the pointer store is reproduced by
 * materializing those bytes. The literal is pure 7-bit ASCII, so
 * `charCodeAt` is an exact transcription of the stored bytes; the array is
 * 0x1ff = 511 long, matching the `len` the machine writes @0x3c2579, and the
 * terminating NUL is excluded (it is not counted by `len`).
 */
function literalBytesAt0x8e0219(): Uint8Array {
  const src = METAL_SAMPLE2D3_SHADER_SOURCE;
  const out = new Uint8Array(src.length);
  for (let i = 0; i < src.length; i++) {
    out[i] = src.charCodeAt(i) & 0xff;
  }
  return out;
}
