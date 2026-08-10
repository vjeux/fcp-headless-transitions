// metal_sample2d5_s() — @Helium 0xbaeb0  (hot path, `__ZL17metal_sample2d5_sv`)
//                        @Helium 0x3c2630 (`__ZL17metal_sample2d5_sv.cold.1`, the outlined
//                                          one-time initializer)
//
// A Helium file-static (`static` linkage, hence the `__ZL` prefix) with NO
// arguments and a `void` return.  It is one of ~80 sibling generators
// (`metal_*_s` / `gl_*_s` / `arb_*_s`) that each publish ONE canned shader
// source blob into their own function-local `static string_t shader_string`.
// The function itself returns nothing — its whole observable effect is the
// lazy, thread-safe (Itanium C++ ABI guard) population of that static, which
// callers then read directly by address.
//
// Transcribed one-for-one from the x86_64 disassembly:
//   raw-port/re/disasm/Helium.__ZL17metal_sample2d5_sv.s        (11 lines, hot)
//   raw-port/re/disasm/Helium.__ZL17metal_sample2d5_svcold1.s   (23 lines, cold)
//
// ── DATA SYMBOLS (nm -arch x86_64 Helium) ────────────────────────────────────
//   0x0000000000add5e8  b  __ZZL17metal_sample2d5_svE13shader_string
//                          (the function-local `static string_t shader_string`)
//   0x0000000000add618  b  __ZGVZL17metal_sample2d5_svE13shader_string
//                          (its Itanium C++ ABI guard variable)
// The guard sits exactly 0x30 past the record, so `string_t` here occupies
// 0xadd5e8..0xadd617 — a 0x30-byte object.
//
// ── HOT PATH — @Helium 0xbaeb0 ───────────────────────────────────────────────
//   0xbaeb0  movzbl  guard(%rip), %eax     ; load guard byte @0xadd618
//   0xbaeb7  testb   %al, %al
//   0xbaeb9  je      0xbaebc               ; not yet initialized -> cold
//   0xbaebb  retq                          ; already initialized -> nothing to do
//   0xbaebc  pushq   %rbp / movq %rsp,%rbp
//   0xbaec0  callq   __ZL17metal_sample2d5_sv.cold.1   ; @0x3c2630
//   0xbaec5  popq    %rbp
//   0xbaec6  retq
// Note the guard is read as a plain byte with NO acquire fence in the hot
// path (the standard clang fast path); the fence lives inside
// `__cxa_guard_acquire` on the cold path.
//
// ── COLD PATH — @Helium 0x3c2630 (`.cold.1`) ────────────────────────────────
//   0x3c2634  leaq   guard(%rip), %rdi                  ; &guard @0xadd618
//   0x3c263b  callq  ___cxa_guard_acquire               ; stub @0x3c5000
//   0x3c2640  testl  %eax, %eax
//   0x3c2642  je     0x3c2695                           ; 0 => another thread won the
//                                                       ;      race and already ran the
//                                                       ;      init -> pop/ret, do nothing
//   0x3c2644  leaq   0x51dfce(%rip), %rax               ; -> literal @0x8e0619 (see below)
//   0x3c264b  movq   %rax, shader_string(%rip)          ; [0xadd5e8 +0x00] = char const*
//   0x3c2652  leaq   shader_string(%rip), %rsi          ; &shader_string, arg2 of __cxa_atexit
//   0x3c2659  movq   $0x1ff, 0x71af8c(%rip)             ; [0xadd5f0 +0x08] = 0x1ff  (length)
//   0x3c2664  xorps  %xmm0, %xmm0                       ; 16 zero bytes
//   0x3c2667  movups %xmm0, 0x71af8a(%rip)              ; [0xadd5f8 +0x10..+0x1f] = 0
//   0x3c266e  movups %xmm0, 0x71af93(%rip)              ; [0xadd608 +0x20..+0x2f] = 0
//   0x3c2675  leaq   __ZN8string_tD1Ev(%rip), %rdi      ; arg1: string_t::~string_t()
//   0x3c267c  leaq   -0x3c2683(%rip), %rdx              ; arg3: __dso_handle @0x0 (image base)
//   0x3c2683  callq  ___cxa_atexit                      ; stub @0x3c4fd6
//   0x3c2688  leaq   guard(%rip), %rdi
//   0x3c2690  jmp    ___cxa_guard_release               ; stub @0x3c5006 (tail call)
//
// RIP-relative targets were derived with the standard `target = end-of-instr +
// disp` rule and cross-checked against `nm`:
//   0x3c264b + 0x51dfce = 0x8e0619   (the shader source literal)
//   0x3c2664 + 0x71af8c = 0xadd5f0   = shader_string + 0x08
//   0x3c266e + 0x71af8a = 0xadd5f8   = shader_string + 0x10
//   0x3c2675 + 0x71af93 = 0xadd608   = shader_string + 0x20
//   0x3c2683 - 0x3c2683 = 0x0        = __dso_handle
//
// ── OUT-OF-SCOPE EXTERNS ─────────────────────────────────────────────────────
// `___cxa_guard_acquire` @0x3c5000, `___cxa_guard_release` @0x3c5006 and
// `___cxa_atexit` @0x3c4fd6 are libc++abi/libSystem imports, outside the port
// scope.  Following the precedent set by `doToneMap_OSFA` (@ProCore 0x3ba5),
// the guard is modelled directly with a module-scope guard byte + lazy
// initializer — single-threaded JS makes the acquire/release pair a plain
// test-and-set, and there is no observable difference.  `__cxa_atexit` only
// schedules `string_t::~string_t()` (@Helium `__ZN8string_tD1Ev`) for process
// teardown; the JS runtime has no such phase, so it is recorded below rather
// than executed.
//
// ── STRUCT LAYOUT — `string_t` @0xadd5e8 ─────────────────────────────────────
// The record's first three fields are the ones already decoded and exported by
// `glsl.ts` (from `glsl::begin/end/write`, @Helium 0xc0cc0 / 0xb51c0 / 0xc18b0):
//   +0x00  char const*  data
//   +0x08  uint64       len
//   +0x10  Alloc*       alloc            <- cleared here (a literal owns no heap block)
// The two `movups` additionally clear +0x18..+0x2f, i.e. 0x18 bytes past the
// decoded header, which is what pins the object at 0x30 bytes total (guard sits
// at +0x30).  No decoded accessor names those bytes yet, so they are carried
// verbatim as a zeroed tail rather than given invented names.

import type { StringT } from "../channels/glsl";

/**
 * The Metal fragment-shader source published by `metal_sample2d5_s()`.
 *
 * Read byte-for-byte out of Helium's `__TEXT,__cstring` literal pool at
 * @Helium 0x8e0619 (the `leaq 0x51dfce(%rip), %rax` @Helium 0x3c2644).  It is
 * 511 = 0x1ff bytes long, terminated by a NUL at 0x8e0818 — exactly the length
 * the initializer stores into `shader_string.len` @Helium 0x3c2659, and exactly
 * the value the blob self-declares in its own `//LEN=00000001ff` header line.
 *
 * The shader is Helium's trivial "sample texture unit 5" pass-through: it
 * fetches `hg_Texture5` through `hg_Sampler5` at the interpolated
 * `frag._texCoord5.xy` and writes it to `color0`.
 *
 * @const @Helium 0x8e0619 (511 bytes, `//LEN=00000001ff`, `//MD5=cc86252f:…`)
 */
export const METAL_SAMPLE2D5_SOURCE: string =
  "//Metal1.0     \n" +
  "//LEN=00000001ff\n" +
  "fragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n" +
  "    const constant float4* hg_Params [[ buffer(0) ]], \n" +
  "    texture2d< float > hg_Texture5 [[ texture(5) ]], \n" +
  "    sampler hg_Sampler5 [[ sampler(5) ]])\n" +
  "{\n" +
  "    FragmentOut output;\n" +
  "\n" +
  "    output.color0 = hg_Texture5.sample(hg_Sampler5, frag._texCoord5.xy);\n" +
  "    return output;\n" +
  "}\n" +
  "//MD5=cc86252f:23fe64ab:2c3c7c52:1bfd6a43\n" +
  "//SIG=00000000:00000020:00000000:00000000:0000:0000:0000:0000:0000:0000:0040:0000:0006:06:0:1:0\n";

/**
 * `metal_sample2d5_s()::shader_string` — the function-local static
 * @Helium 0xadd5e8, living in `__bss` and therefore zero/NULL until the
 * initializer at @Helium 0x3c2630 runs.
 *
 * The extra `tail` member carries the 0x18 bytes at +0x18..+0x2f that the two
 * `movups %xmm0` stores (@Helium 0x3c2667 / 0x3c266e) clear alongside
 * `alloc`; the decoded `string_t` header from `glsl.ts` stops at +0x18.
 */
export interface ShaderStringT extends StringT {
  /** +0x18..+0x2f — 0x18 bytes, zeroed by the `movups` pair @Helium 0x3c2667 / 0x3c266e. */
  tail: Uint8Array;
}

/**
 * `metal_sample2d5_s()::shader_string` @Helium 0xadd5e8.
 *
 * Initial (pre-init) contents are the `__bss` zeros; `metal_sample2d5_s()`
 * below is what fills it.
 */
export const shader_string: ShaderStringT = {
  data: null,               // +0x00
  len: 0,                   // +0x08
  alloc: null,              // +0x10
  tail: new Uint8Array(0x18), // +0x18..+0x2f
};

/**
 * Guard variable `__ZGVZL17metal_sample2d5_svE13shader_string` @Helium 0xadd618.
 *
 * Only the low byte is ever read by the hot path
 * (`movzbl guard(%rip), %eax ; testb %al,%al` @Helium 0xbaeb0/0xbaeb7); the
 * remaining 7 bytes are the mutex/lock word owned by `__cxa_guard_acquire`,
 * which is not modelled (single-threaded JS — see the header note).
 */
let shader_string_guard = 0;

/**
 * `__ZL17metal_sample2d5_sv.cold.1` @Helium 0x3c2630 — the outlined one-time
 * initializer for `metal_sample2d5_s()::shader_string`.
 *
 * Mirrors the cold block instruction-for-instruction: acquire the guard, and
 * only if THIS caller won the race (`__cxa_guard_acquire` returned non-zero,
 * `testl %eax,%eax ; je 0x3c2695` @Helium 0x3c2640) publish the literal
 * pointer, the 0x1ff length, and the zeroed tail, register the destructor with
 * `__cxa_atexit`, then release the guard.
 */
function metal_sample2d5_s_cold_1(): void {
  // 0x3c2634/0x3c263b: __cxa_guard_acquire(&guard). Single-threaded: the
  // acquire "wins" exactly when the guard byte is still clear.
  const acquired = shader_string_guard === 0;
  // 0x3c2640/0x3c2642: testl %eax,%eax ; je 0x3c2695 -> lost the race, return.
  if (!acquired) {
    return;
  }

  // 0x3c2644/0x3c264b: shader_string.data = (char const*)0x8e0619
  shader_string.data = Uint8Array.from(METAL_SAMPLE2D5_SOURCE, (c) => c.charCodeAt(0));
  // 0x3c2659: movq $0x1ff, shader_string+0x08
  shader_string.len = 0x1ff;
  // 0x3c2664/0x3c2667: xorps %xmm0,%xmm0 ; movups %xmm0, shader_string+0x10
  //   -> alloc (+0x10) = NULL, and +0x18..+0x1f = 0
  shader_string.alloc = null;
  shader_string.tail.fill(0);
  // 0x3c266e: movups %xmm0, shader_string+0x20  -> +0x20..+0x2f = 0
  // (already covered by the same zeroed `tail`, which spans +0x18..+0x2f)

  // 0x3c2675/0x3c267c/0x3c2683: __cxa_atexit(&string_t::~string_t,
  //   &shader_string, &__dso_handle @0x0). Process-teardown only — the JS
  //   runtime has no atexit phase, so the registration is a no-op here.

  // 0x3c2688/0x3c2690: __cxa_guard_release(&guard) (tail jmp).
  shader_string_guard = 1;
}

/**
 * `metal_sample2d5_s()` @Helium 0xbaeb0 — publish the "sample texture unit 5"
 * Metal fragment-shader source into the file-static `shader_string`
 * @Helium 0xadd5e8.
 *
 * Returns `void`; the effect is entirely on the static.  Idempotent by the
 * guard byte @Helium 0xadd618, so calling it repeatedly costs one byte test
 * after the first call — exactly the shape of the hot path.
 */
export function metal_sample2d5_s(): void {
  // 0xbaeb0/0xbaeb7/0xbaeb9: movzbl guard ; testb %al,%al ; je cold
  if (shader_string_guard !== 0) {
    // 0xbaebb: retq
    return;
  }
  // 0xbaec0: callq .cold.1
  metal_sample2d5_s_cold_1();
  // 0xbaec6: retq
}
