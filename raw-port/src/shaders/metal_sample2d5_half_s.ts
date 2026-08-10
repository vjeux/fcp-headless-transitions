// metal_sample2d5_half_s.ts — the Helium free function
// `metal_sample2d5_half_s()` (internal linkage) and the function-local static
// `string_t shader_string` it lazily initialises.
//
// Transcribed from the x86_64 disassembly of Helium in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
// Versions/A/Helium.
//
// PROVENANCE / DECODE:
//   raw-port/re/disasm/Helium.__ZL22metal_sample2d5_half_sv.s       (hot path)
//   raw-port/re/disasm/Helium.__ZL22metal_sample2d5_half_svcold1.s  (cold init)
//
// SYMBOLS
//   0x000badb0 t __ZL22metal_sample2d5_half_sv        metal_sample2d5_half_s()
//   0x003c22b0 t __ZL22metal_sample2d5_half_sv.cold.1 the outlined init body
//   0x00add428 b __ZZL22metal_sample2d5_half_svE13shader_string
//                                                      the function-local static
//   0x00add458 b __ZGVZL22metal_sample2d5_half_svE13shader_string
//                                                      its Itanium-ABI guard
//   0x008df601   the 519-byte Metal fragment-shader literal (__TEXT,__cstring)
//
// FRONTIER CALLEES — all TRUE OUT-OF-SCOPE externs, each cited:
//   ___cxa_guard_acquire  @0x3c22bb via stub 0x3c5000   (libc++abi)
//   ___cxa_guard_release  @0x3c2310 via stub 0x3c5006   (libc++abi, tail-jmp)
//   ___cxa_atexit         @0x3c2303 via stub 0x3c4fd6   (libc)
//   __ZN8string_tD1Ev     string_t::~string_t() — only its ADDRESS is taken
//                         @0x3c22f5 to hand to __cxa_atexit; never called here.
// There is no in-scope callee and no indirect branch.
//
// ── THE CALL-ONCE SHAPE ──────────────────────────────────────────────────
// The standard Itanium-ABI function-local-static pattern, split by the
// compiler into a tiny hot path and an outlined cold initialiser:
//
//   HOT @0xbadb0 (no stack frame until the cold call):
//     0xbadb0  movzbl guard(%rip), %eax     ; load the guard's low byte
//     0xbadb7  testb  %al, %al
//     0xbadb9  je     0xbadbc               ; guard == 0 -> needs init
//     0xbadbb  retq                         ; already initialised: nothing
//     0xbadbc  pushq %rbp / movq %rsp,%rbp
//     0xbadc0  callq  .cold.1               ; run the outlined initialiser
//     0xbadc5  popq %rbp / retq
//
//   COLD @0x3c22b0:
//     0x3c22b4  leaq  guard(%rip), %rdi
//     0x3c22bb  callq ___cxa_guard_acquire  ; 0 => another thread did it
//     0x3c22c0  testl %eax, %eax
//     0x3c22c2  je    0x3c2315              ; -> just return
//     0x3c22c4  leaq  0x51d336(%rip), %rax  ; = 0x3c22cb + 0x51d336 = 0x8df601
//     0x3c22cb  movq  %rax, shader_string(%rip)          ; +0x00 buf
//     0x3c22d9  movq  $0x207, 0x71b14c(%rip)             ; +0x08 length = 519
//     0x3c22e4  xorps %xmm0, %xmm0
//     0x3c22e7  movups %xmm0, 0x71b14a(%rip)             ; +0x10..+0x1f = 0
//     0x3c22ee  movups %xmm0, 0x71b153(%rip)             ; +0x20..+0x2f = 0
//     0x3c22f5  leaq  __ZN8string_tD1Ev(%rip), %rdi
//     0x3c22fc  leaq  -0x3c2303(%rip), %rdx              ; = 0 (__dso_handle)
//     0x3c2303  callq ___cxa_atexit         ; (dtor, &shader_string, dso)
//     0x3c2308  leaq  guard(%rip), %rdi
//     0x3c2310  jmp   ___cxa_guard_release  ; tail-call
//     0x3c2315  popq %rbp / retq
//
// The three %rip displacements resolve against `shader_string` @0xadd428:
//   0x3c22e4 + 0x71b14c = 0xadd430  -> shader_string + 0x08
//   0x3c22ee + 0x71b14a = 0xadd438  -> shader_string + 0x10
//   0x3c22f5 + 0x71b153 = 0xadd448  -> shader_string + 0x20
// and the guard sits immediately after the object, at 0xadd458 — so the
// static `string_t` occupies 0xadd428..0xadd457, exactly 0x30 bytes, all of
// which this initialiser writes.
//
// ── string_t LAYOUT ──────────────────────────────────────────────────────
// `string_t` is Helium's shader-source string builder — the same type
// `HGString::c_str()` @0xb8480 tail-calls `__ZL9str_closeR8string_t` with.
// The two named fields line up with the offsets the HGString accessors pin:
//   +0x00  buf     : char*   <- the literal @0x8df601
//   +0x08  length  : size_t  <- 0x207
//   +0x10..+0x2f            <- zeroed by the two `movups`
// The 0x20 zeroed bytes stay an opaque tail: this unit's evidence shows only
// that they are cleared. Sibling `metal_sample2d*_s` units declare the same
// shape for their own statics; they all collapse onto the real `string_t`
// port when that class lands.
//
// ── THE LITERAL ──────────────────────────────────────────────────────────
// Read out of __TEXT,__cstring at VA 0x8df601 (section base 0x8b51a0 / file
// offset 0x8b4020 with the x86_64 fat slice at 0x4000). `strlen` is
// 519 = 0x207, matching BOTH the `movq $0x207` store AND the shader's own
// self-describing `//LEN=0000000207` header line.
//
// NOTE — `float5* hg_Params` IS WHAT THE BINARY SAYS. The parameter-buffer
// line reads `const constant float5* hg_Params`, which is not a Metal type;
// the texture-unit index 5 has been substituted into the `float4` of the
// template this family was generated from. The same line reads `float4` in
// the texture-0 variant (`metal_sample2d0_half_s` @0x8debd9) and `float5`
// here, while the `(float4)` cast further down is untouched in both. This is
// FCP's own generator artifact and is reproduced verbatim — "correcting" it
// would make the port diverge from the shipped string, which is exactly the
// bytes Helium hands to the Metal compiler.

/**
 * The Metal fragment shader `metal_sample2d5_half_s()` publishes — Helium
 * @0x8df601 (__TEXT,__cstring), 519 bytes, pure ASCII.
 *
 * Reproduced byte-for-byte from the binary so a reviewer can diff it
 * directly against that address. It is the half-precision passthrough
 * sampler for TEXTURE UNIT 5: `hg_Texture5` / `hg_Sampler5` /
 * `frag._texCoord5`, declared `texture2d< half >` with the sampled value
 * cast back to `float4`. See the `float5* hg_Params` note above.
 */
export const METAL_SAMPLE2D5_HALF_S_SOURCE =
  "//Metal1.0     \n" +
  "//LEN=0000000207\n" +
  "fragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n" +
  "    const constant float5* hg_Params [[ buffer(0) ]], \n" +
  "    texture2d< half > hg_Texture5 [[ texture(5) ]], \n" +
  "    sampler hg_Sampler5 [[ sampler(5) ]])\n" +
  "{\n" +
  "    FragmentOut output;\n" +
  "\n" +
  "    output.color0 = (float4) hg_Texture5.sample(hg_Sampler5, frag._texCoord5.xy);\n" +
  "    return output;\n" +
  "}\n" +
  "//MD5=66f8f1b6:850d7b58:5ce020bb:4d7656a8\n" +
  "//SIG=00400000:00000020:00000000:00000020:0000:0000:0000:0000:0000:0000:0040:0000:0006:06:0:1:0\n";

/**
 * The `char*` the `leaq` @0x3c22c4 materialises: the address of the literal
 * above. The .cstring bytes already exist at image load, so the encoded,
 * NUL-terminated buffer is built once here at module load — the port's
 * stand-in for that section content.
 */
const METAL_SAMPLE2D5_HALF_S_CSTRING: Uint8Array = new TextEncoder().encode(
  METAL_SAMPLE2D5_HALF_S_SOURCE + "\0"
);

/**
 * Runtime shape of the static `string_t` at @0xadd428, covering exactly the
 * 0x30 bytes this initialiser writes (the guard byte follows at 0xadd458).
 */
export interface StringT {
  /** +0x00 — `char* buf`, stored by `movq %rax, …` @0x3c22cb. */
  buf: Uint8Array | null;
  /** +0x08 — `size_t length`, stored by `movq $0x207, …` @0x3c22d9. */
  length: number;
  /** +0x10..+0x2f — cleared by the two `movups %xmm0` @0x3c22e7/@0x3c22ee. */
  tail: Uint8Array;
}

/**
 * `metal_sample2d5_half_s()::shader_string` — Helium @0xadd428 (__BSS).
 *
 * A function-local static, so it is zero at image load and only becomes
 * meaningful once {@link metal_sample2d5_half_s} has run. Exported because
 * publishing this object is the function's entire purpose.
 */
export const metal_sample2d5_half_s_shader_string: StringT = {
  buf: null,
  length: 0,
  tail: new Uint8Array(0x20),
};

/**
 * `__ZGVZL22metal_sample2d5_half_svE13shader_string` — Helium @0xadd458
 * (__BSS).
 *
 * The Itanium-ABI guard variable. Only its LOW BYTE is read, by the
 * `movzbl` @0xbadb0; `__cxa_guard_acquire`/`__cxa_guard_release` own the
 * rest. __BSS, so it starts at 0.
 */
let shaderStringGuard = 0;

/**
 * `___cxa_guard_acquire(__guard*)` — libc++abi, reached through the Helium
 * stub at 0x3c5000; called @0x3c22bb.
 *
 * Out-of-scope extern. Its contract is what matters: return non-zero when
 * THIS caller won the race and must run the initialiser, zero when the
 * object is already (or concurrently being) initialised. The single-threaded
 * JS runtime cannot lose the race, so the guard's low byte alone decides.
 */
function __cxa_guard_acquire(): number {
  // @0x3c22bb — non-zero only while the guard byte is still clear.
  return shaderStringGuard === 0 ? 1 : 0;
}

/**
 * `___cxa_guard_release(__guard*)` — libc++abi, stub 0x3c5006; tail-jumped
 * to @0x3c2310. Marks the static as constructed, which is exactly what the
 * `movzbl`/`testb` @0xbadb0 checks on every later call.
 */
function __cxa_guard_release(): void {
  // @0x3c2310 — set the guard's low byte so the hot path returns early.
  shaderStringGuard = 1;
}

/**
 * `___cxa_atexit(void (*)(void*), void*, void*)` — libc, stub 0x3c4fd6;
 * called @0x3c2303 with `string_t::~string_t()` @0x3c22f5, `&shader_string`
 * and `__dso_handle` (the `leaq -0x3c2303(%rip), %rdx` @0x3c22fc resolves to
 * 0, this image's handle).
 *
 * Out-of-scope extern modelled as a documented boundary stub: the port has
 * no process teardown to hook, and the registered destructor
 * `__ZN8string_tD1Ev` is a separate, un-transcribed ledger unit whose
 * address is only TAKEN here, never called.
 */
function __cxa_atexit(_dtor: unknown, _obj: unknown, _dso: number): number {
  // @0x3c2303  callq ___cxa_atexit — boundary no-op; returns success (0).
  return 0;
}

/**
 * metal_sample2d5_half_s()  —  Helium @0xbadb0 (internal linkage).
 *
 * Faithful transcription of the hot path at 0xbadb0 plus its outlined cold
 * initialiser `.cold.1` @0x3c22b0; both listings are quoted instruction by
 * instruction in the header above.
 *
 * Lazily constructs the function-local static `shader_string` @0xadd428 so
 * that it points at the 519-byte half-precision texture-5 passthrough
 * shader @0x8df601. Idempotent by construction: after the first call the
 * guard byte is set and the hot path returns at 0xbadbb without touching
 * anything.
 *
 * The function returns void — its entire effect is on the static, which is
 * why the port exposes {@link metal_sample2d5_half_s_shader_string}
 * alongside it.
 */
export function metal_sample2d5_half_s(): void {
  // @0xbadb0  movzbl guard(%rip), %eax ; @0xbadb7 testb %al,%al
  // @0xbadb9  je 0xbadbc — fall into the cold call only when the byte is 0.
  if ((shaderStringGuard & 0xff) !== 0) {
    // @0xbadbb  retq — already initialised.
    return;
  }

  // @0xbadc0  callq __ZL22metal_sample2d5_half_sv.cold.1 — the outlined body:

  // @0x3c22b4/@0x3c22bb  leaq guard(%rip), %rdi ; callq ___cxa_guard_acquire
  // @0x3c22c0/@0x3c22c2  testl %eax,%eax ; je 0x3c2315 -> plain return
  if (__cxa_guard_acquire() === 0) return;

  // @0x3c22c4  leaq 0x51d336(%rip), %rax  -> 0x8df601, the literal.
  // @0x3c22cb  movq %rax, shader_string(%rip)            ; +0x00
  metal_sample2d5_half_s_shader_string.buf = METAL_SAMPLE2D5_HALF_S_CSTRING;
  // @0x3c22d9  movq $0x207, 0xadd430                     ; +0x08
  metal_sample2d5_half_s_shader_string.length = 0x207;
  // @0x3c22e4  xorps %xmm0,%xmm0
  // @0x3c22e7  movups %xmm0, 0xadd438                    ; +0x10..+0x1f
  // @0x3c22ee  movups %xmm0, 0xadd448                    ; +0x20..+0x2f
  metal_sample2d5_half_s_shader_string.tail.fill(0);

  // @0x3c22f5/@0x3c22fc/@0x3c2303
  //   leaq __ZN8string_tD1Ev(%rip), %rdi   ; the dtor's ADDRESS only
  //   leaq -0x3c2303(%rip), %rdx           ; __dso_handle = 0
  //   callq ___cxa_atexit
  __cxa_atexit(
    "string_t::~string_t @Helium 0x3c22f5",
    metal_sample2d5_half_s_shader_string,
    0
  );

  // @0x3c2308/@0x3c2310  leaq guard(%rip), %rdi ; jmp ___cxa_guard_release
  __cxa_guard_release();
}
