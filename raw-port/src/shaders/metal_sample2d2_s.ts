// metal_sample2d2_s.ts — the Helium free function `metal_sample2d2_s()`
// (internal linkage) and the function-local static `string_t shader_string`
// it lazily initialises.
//
// Transcribed from the x86_64 disassembly of Helium in
// /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
// Versions/A/Helium.
//
// PROVENANCE / DECODE:
//   raw-port/re/disasm/Helium.__ZL17metal_sample2d2_sv.s        (hot path)
//   raw-port/re/disasm/Helium.__ZL17metal_sample2d2_svcold1.s   (cold init)
//
// SYMBOLS
//   0x000bae50 t __ZL17metal_sample2d2_sv        metal_sample2d2_s()  (hot)
//   0x003c24e0 t __ZL17metal_sample2d2_sv.cold.1 the outlined init body
//   0x00add540 b __ZZL17metal_sample2d2_svE13shader_string
//                                                 the function-local static
//   0x00add570 b __ZGVZL17metal_sample2d2_svE13shader_string
//                                                 its Itanium-ABI guard
//   0x008e0019   the 511-byte Metal fragment-shader literal (__TEXT,__cstring)
//
// FRONTIER CALLEES — all TRUE OUT-OF-SCOPE externs, each cited:
//   ___cxa_guard_acquire  @0x3c24eb via stub 0x3c5000   (libc++abi)
//   ___cxa_guard_release  @0x3c2540 via stub 0x3c5006   (libc++abi, tail-jmp)
//   ___cxa_atexit         @0x3c2533 via stub 0x3c4fd6   (libc)
//   __ZN8string_tD1Ev     string_t::~string_t() — only its ADDRESS is taken
//                         @0x3c2525 to hand to __cxa_atexit; it is never
//                         called by this function.
// There is no in-scope callee and no indirect branch.
//
// ── THE CALL-ONCE SHAPE ──────────────────────────────────────────────────
// This is the standard Itanium-ABI function-local-static pattern, split by
// the compiler into a tiny hot path and an outlined cold initialiser:
//
//   HOT @0xbae50 (no stack frame until the cold call):
//     0xbae50  movzbl guard(%rip), %eax     ; load the guard's low byte
//     0xbae57  testb  %al, %al
//     0xbae59  je     0xbae5c               ; guard == 0 -> needs init
//     0xbae5b  retq                         ; already initialised: nothing
//     0xbae5c  pushq %rbp / movq %rsp,%rbp
//     0xbae60  callq  .cold.1               ; run the outlined initialiser
//     0xbae65  popq %rbp / retq
//
//   COLD @0x3c24e0:
//     0x3c24e4  leaq  guard(%rip), %rdi
//     0x3c24eb  callq ___cxa_guard_acquire  ; 0 => another thread did it
//     0x3c24f0  testl %eax, %eax
//     0x3c24f2  je    0x3c2545              ; -> just return
//     0x3c24f4  leaq  0x51db1e(%rip), %rax  ; = 0x3c24fb + 0x51db1e = 0x8e0019
//     0x3c24fb  movq  %rax, shader_string(%rip)          ; +0x00 buf
//     0x3c2509  movq  $0x1ff, 0x71b034(%rip)             ; +0x08 length = 511
//     0x3c2514  xorps %xmm0, %xmm0
//     0x3c2517  movups %xmm0, 0x71b032(%rip)             ; +0x10..+0x1f = 0
//     0x3c251e  movups %xmm0, 0x71b03b(%rip)             ; +0x20..+0x2f = 0
//     0x3c2525  leaq  __ZN8string_tD1Ev(%rip), %rdi
//     0x3c252c  leaq  -0x3c2533(%rip), %rdx              ; = 0 (__dso_handle)
//     0x3c2533  callq ___cxa_atexit         ; (dtor, &shader_string, dso)
//     0x3c2538  leaq  guard(%rip), %rdi
//     0x3c2540  jmp   ___cxa_guard_release  ; tail-call
//     0x3c2545  popq %rbp / retq
//
// The three %rip displacements resolve against `shader_string` @0xadd540:
//   0x3c2514 + 0x71b034 = 0xadd548  -> shader_string + 0x08
//   0x3c251e + 0x71b032 = 0xadd550  -> shader_string + 0x10
//   0x3c2525 + 0x71b03b = 0xadd560  -> shader_string + 0x20
// and the guard sits immediately after the object, at 0xadd570 — so the
// static `string_t` occupies 0xadd540..0xadd56f, exactly 0x30 bytes, of
// which this initialiser writes every one.
//
// ── string_t LAYOUT ──────────────────────────────────────────────────────
// `string_t` is Helium's shader-source string builder — the same type
// `HGString::c_str()` @0xb8480 tail-calls `__ZL9str_closeR8string_t` with.
// The two fields this initialiser sets by name line up with the ones the
// HGString accessors pin:
//   +0x00  buf     : char*   <- the literal @0x8e0019
//   +0x08  length  : size_t  <- 0x1ff
//   +0x10..+0x2f            <- zeroed by the two `movups`
// The 0x20 zeroed bytes are left as an opaque tail here rather than named:
// this unit's evidence only shows that they are cleared, and inventing
// field names for them would outrun the decode.
//
// ── THE LITERAL ──────────────────────────────────────────────────────────
// Read out of __TEXT,__cstring at VA 0x8e0019 (section base 0x8b51a0 /
// file offset 0x8b4020 with the x86_64 fat slice at 0x4000). `strlen` is
// 511 = 0x1ff, matching BOTH the `movq $0x1ff` store AND the shader's own
// self-describing `//LEN=00000001ff` header line.

/**
 * The Metal fragment shader `metal_sample2d2_s()` publishes — Helium
 * @0x8e0019 (__TEXT,__cstring), 511 bytes, pure ASCII.
 *
 * Reproduced byte-for-byte from the binary so a reviewer can diff it
 * directly against that address. It is a single-texture passthrough
 * sampler: it reads `hg_Texture2` through `hg_Sampler2` at the fragment's
 * `_texCoord2.xy` and writes the result to `color0`.
 */
export const METAL_SAMPLE2D2_S_SOURCE =
  "//Metal1.0     \n" +
  "//LEN=00000001ff\n" +
  "fragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n" +
  "    const constant float4* hg_Params [[ buffer(0) ]], \n" +
  "    texture2d< float > hg_Texture2 [[ texture(2) ]], \n" +
  "    sampler hg_Sampler2 [[ sampler(2) ]])\n" +
  "{\n" +
  "    FragmentOut output;\n" +
  "\n" +
  "    output.color0 = hg_Texture2.sample(hg_Sampler2, frag._texCoord2.xy);\n" +
  "    return output;\n" +
  "}\n" +
  "//MD5=78787321:d0f473ee:95960d97:3438eca2\n" +
  "//SIG=00000000:00000004:00000000:00000000:0000:0000:0000:0000:0000:0000:0008:0000:0003:03:0:1:0\n";

/**
 * The `char*` the `leaq` @0x3c24f4 materialises: the address of the
 * literal above. The .cstring bytes already exist at image load, so the
 * encoded, NUL-terminated buffer is built once here at module load — the
 * port's stand-in for that section content.
 */
const METAL_SAMPLE2D2_S_CSTRING: Uint8Array = new TextEncoder().encode(
  METAL_SAMPLE2D2_S_SOURCE + "\0"
);

/**
 * Runtime shape of the static `string_t` at @0xadd540, covering exactly the
 * 0x30 bytes this initialiser writes (the guard byte follows at 0xadd570).
 */
export interface StringT {
  /** +0x00 — `char* buf`, stored by `movq %rax, …` @0x3c24fb. */
  buf: Uint8Array | null;
  /** +0x08 — `size_t length`, stored by `movq $0x1ff, …` @0x3c2509. */
  length: number;
  /** +0x10..+0x2f — cleared by the two `movups %xmm0` @0x3c2517/@0x3c251e. */
  tail: Uint8Array;
}

/**
 * `metal_sample2d2_s()::shader_string` — Helium @0xadd540 (__BSS).
 *
 * A function-local static, so it is zero at image load and only becomes
 * meaningful once {@link metal_sample2d2_s} has run. Exported because the
 * whole purpose of the function is to publish this object to its callers.
 */
export const metal_sample2d2_s_shader_string: StringT = {
  buf: null,
  length: 0,
  tail: new Uint8Array(0x20),
};

/**
 * `__ZGVZL17metal_sample2d2_svE13shader_string` — Helium @0xadd570 (__BSS).
 *
 * The Itanium-ABI guard variable. Only its LOW BYTE is read, by the
 * `movzbl` @0xbae50; `__cxa_guard_acquire`/`__cxa_guard_release` own the
 * rest. __BSS, so it starts at 0.
 */
let shaderStringGuard = 0;

/**
 * `___cxa_guard_acquire(__guard*)` — libc++abi, reached through the Helium
 * stub at 0x3c5000; called @0x3c24eb.
 *
 * Out-of-scope extern. Its contract is what matters here: return non-zero
 * when THIS caller won the race and must run the initialiser, zero when the
 * object is already (or concurrently being) initialised. The single-threaded
 * JS runtime cannot lose the race, so the guard's low byte alone decides.
 */
function __cxa_guard_acquire(): number {
  // @0x3c24eb — non-zero only while the guard byte is still clear.
  return shaderStringGuard === 0 ? 1 : 0;
}

/**
 * `___cxa_guard_release(__guard*)` — libc++abi, stub 0x3c5006; tail-jumped
 * to @0x3c2540. Marks the static as constructed, which is exactly what the
 * `movzbl`/`testb` @0xbae50 checks on every later call.
 */
function __cxa_guard_release(): void {
  // @0x3c2540 — set the guard's low byte so the hot path returns early.
  shaderStringGuard = 1;
}

/**
 * `___cxa_atexit(void (*)(void*), void*, void*)` — libc, stub 0x3c4fd6;
 * called @0x3c2533 with `string_t::~string_t()` @0x3c2525, `&shader_string`
 * and `__dso_handle` (the `leaq -0x3c2533(%rip), %rdx` @0x3c252c resolves to
 * 0, this image's handle).
 *
 * Out-of-scope extern modelled as a documented boundary stub: the port has
 * no process teardown to hook, and the registered destructor
 * `__ZN8string_tD1Ev` is a separate, un-transcribed ledger unit whose
 * address is only TAKEN here, never called.
 */
function __cxa_atexit(_dtor: unknown, _obj: unknown, _dso: number): number {
  // @0x3c2533  callq ___cxa_atexit — boundary no-op; returns success (0).
  return 0;
}

/**
 * metal_sample2d2_s()  —  Helium @0xbae50 (internal linkage).
 *
 * Faithful transcription of the hot path at 0xbae50 plus its outlined cold
 * initialiser `.cold.1` @0x3c24e0; both listings are quoted instruction by
 * instruction in the header above.
 *
 * Lazily constructs the function-local static `shader_string` @0xadd540 so
 * that it points at the 511-byte Metal passthrough-sampler source
 * @0x8e0019. Idempotent by construction: after the first call the guard
 * byte is set and the hot path returns at 0xbae5b without touching
 * anything.
 *
 * The function returns void — its entire effect is on the static, which is
 * why the port exposes {@link metal_sample2d2_s_shader_string} alongside it.
 */
export function metal_sample2d2_s(): void {
  // @0xbae50  movzbl guard(%rip), %eax ; @0xbae57 testb %al,%al
  // @0xbae59  je 0xbae5c — fall into the cold call only when the byte is 0.
  if ((shaderStringGuard & 0xff) !== 0) {
    // @0xbae5b  retq — already initialised.
    return;
  }

  // @0xbae60  callq __ZL17metal_sample2d2_sv.cold.1 — the outlined body:

  // @0x3c24e4/@0x3c24eb  leaq guard(%rip), %rdi ; callq ___cxa_guard_acquire
  // @0x3c24f0/@0x3c24f2  testl %eax,%eax ; je 0x3c2545 -> plain return
  if (__cxa_guard_acquire() === 0) return;

  // @0x3c24f4  leaq 0x51db1e(%rip), %rax  -> 0x8e0019, the literal.
  // @0x3c24fb  movq %rax, shader_string(%rip)            ; +0x00
  metal_sample2d2_s_shader_string.buf = METAL_SAMPLE2D2_S_CSTRING;
  // @0x3c2509  movq $0x1ff, 0xadd548                     ; +0x08
  metal_sample2d2_s_shader_string.length = 0x1ff;
  // @0x3c2514  xorps %xmm0,%xmm0
  // @0x3c2517  movups %xmm0, 0xadd550                    ; +0x10..+0x1f
  // @0x3c251e  movups %xmm0, 0xadd560                    ; +0x20..+0x2f
  metal_sample2d2_s_shader_string.tail.fill(0);

  // @0x3c2525/@0x3c252c/@0x3c2533
  //   leaq __ZN8string_tD1Ev(%rip), %rdi   ; the dtor's ADDRESS only
  //   leaq -0x3c2533(%rip), %rdx           ; __dso_handle = 0
  //   callq ___cxa_atexit
  __cxa_atexit("string_t::~string_t @Helium 0x3c2525", metal_sample2d2_s_shader_string, 0);

  // @0x3c2538/@0x3c2540  leaq guard(%rip), %rdi ; jmp ___cxa_guard_release
  __cxa_guard_release();
}
