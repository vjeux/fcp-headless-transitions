// metal_sample2d6_s.ts — Helium's file-local `metal_sample2d6_s()` shader-text
// singleton initialiser.
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// EXPORTED SYMBOL (this file):
//   @Helium 0x00000000000baed0
//     metal_sample2d6_s()
//     mangled: __ZL17metal_sample2d6_sv     (`__ZL` = internal linkage — a
//              `static` free function, so it has no owning C++ class)
//
// SOURCE DISASSEMBLY:
//   raw-port/re/disasm/Helium.__ZL17metal_sample2d6_sv.s        (11 lines, hot)
//   raw-port/re/disasm/Helium.__ZL17metal_sample2d6_svcold1.s   (23 lines, cold)
//
// ROLE. A Meyers singleton: the function owns a function-local
// `static string_t shader_string` holding one prebuilt Metal fragment-shader
// source, and its whole job is to initialise that static exactly once. The
// hot path is a bare guard-byte test that returns immediately once the
// static is live; the actual construction is outlined into the `.cold.1`
// partial at @0x3c26a0.
//
// The function returns VOID — it publishes into the file-scope static rather
// than returning it, so callers read
// `metal_sample2d6_s()::shader_string` @0xadd620 directly.
//
// ═══════════════════════════════════════════════════════════════════════════
// DECODE — hot partial @0xbaed0 (AT&T)
// ═══════════════════════════════════════════════════════════════════════════
//   0xbaed0  movzbl guard(%rip), %eax   ; al = the __cxa_guard byte @0xadd650
//                                       ;   (rip target: 0xbaed7 + disp32)
//   0xbaed7  testb  %al, %al
//   0xbaed9  je     0xbaedc             ; guard == 0 -> run the cold init
//   0xbaedb  retq                       ; already initialised -> nothing to do
//   0xbaedc  pushq  %rbp
//   0xbaedd  movq   %rsp, %rbp
//   0xbaee0  callq  metal_sample2d6_s().cold.1     ; the outlined initialiser
//   0xbaee5  popq   %rbp
//   0xbaee6  retq
//   0xbaee7  nopw   (%rax,%rax)         ; padding
//
// ═══════════════════════════════════════════════════════════════════════════
// DECODE — cold partial @0x3c26a0 (the one-time construction)
// ═══════════════════════════════════════════════════════════════════════════
//   0x3c26a4  leaq  guard(%rip), %rdi
//   0x3c26ab  callq ___cxa_guard_acquire            ; @stub 0x3c5000
//   0x3c26b0  testl %eax, %eax
//   0x3c26b2  je    0x3c2705                        ; another thread won the
//                                                   ;   race -> nothing to do
//   0x3c26b4  leaq  <literal>(%rip), %rax           ; the shader source
//                                                   ;   (rip target 0x8e0819)
//   0x3c26bb  movq  %rax, shader_string(%rip)       ; shader_string+0x00 = ptr
//                                                   ;   (rip target 0xadd620)
//   0x3c26c2  leaq  shader_string(%rip), %rsi       ; rsi = &shader_string
//                                                   ;   (the __cxa_atexit arg)
//   0x3c26c9  movq  $0x1ff, 0x71af54(%rip)          ; shader_string+0x08 = 511
//                                                   ;   (rip target 0xadd628)
//   0x3c26d4  xorps %xmm0, %xmm0
//   0x3c26d7  movups %xmm0, 0x71af52(%rip)          ; zero +0x10..+0x1f
//                                                   ;   (rip target 0xadd630)
//   0x3c26de  movups %xmm0, 0x71af5b(%rip)          ; zero +0x20..+0x2f
//                                                   ;   (rip target 0xadd640)
//   0x3c26e5  leaq  __ZN8string_tD1Ev(%rip), %rdi   ; string_t::~string_t
//   0x3c26ec  leaq  -0x3c26f3(%rip), %rdx           ; rdx = 0x3c26f3 - 0x3c26f3
//                                                   ;     = 0 == __dso_handle
//   0x3c26f3  callq ___cxa_atexit                   ; @stub 0x3c4fd6 —
//                                                   ;   atexit(dtor, &obj, dso)
//   0x3c26f8  leaq  guard(%rip), %rdi
//   0x3c2700  jmp   ___cxa_guard_release            ; @stub 0x3c5006 (tail)
//   0x3c2705  popq  %rbp
//   0x3c2706  retq
//
// ── ADDRESS DERIVATIONS (from the instruction bytes, not guessed) ───────────
//   `movq %rax, shader_string(%rip)` @0x3c26bb encodes 48 89 05 5e af 71 00,
//   so disp32 = 0x0071af5e and the target is 0x3c26c2 + 0x71af5e = 0xadd620.
//   The three follow-up stores land at 0xadd628 (+0x08), 0xadd630 (+0x10) and
//   0xadd640 (+0x20) of that same object, and the guard byte resolves to
//   0xadd650 — i.e. the compiler placed the guard immediately after the
//   0x30-byte object.
//   `leaq <literal>(%rip), %rax` @0x3c26b4 resolves to 0x8e0819; the byte at
//   0x8e0819 + 511 is NUL, so the literal is exactly 511 == 0x1ff characters
//   long — which is precisely the value stored into +0x08, and precisely the
//   value the shader text spells out in its own `//LEN=00000001ff` header.
//   That three-way agreement is what pins +0x08 as the LENGTH field.
//
// ── string_t LAYOUT (only what this initialiser writes) ─────────────────────
//   +0x00  char*   data     <- the shader literal @0x8e0819
//   +0x08  size_t  length   <- 0x1ff
//   +0x10  16 bytes zeroed  (`movups %xmm0` @0x3c26d7)
//   +0x20  16 bytes zeroed  (`movups %xmm0` @0x3c26de)
//   ...so sizeof(string_t) >= 0x30. This matches the independently-decoded
//   HGString layout in raw-port/src/render/HGString.ts (+0x00 `char* buf`
//   from `HGString::data()` @0xb3324, +0x08 `size_t length` from
//   `HGString::length()` @0xb3334) — consistent with
//   `HGString::c_str()` @0xb849e tail-calling `str_close(string_t&)` on
//   `this`, i.e. HGString IS a `string_t`. The +0x10..+0x2f bytes are left
//   generic here: this function only ever zeroes them, which reveals nothing
//   about their meaning (PORTING_SPEC Rule 5 — no invented fields).
//
// ── Callees ─────────────────────────────────────────────────────────────────
//   ZERO in-scope callees (`depgraph.py deps __ZL17metal_sample2d6_sv` prints
//   nothing). Besides the outlined `.cold.1` partial of itself, every call is
//   a TRUE out-of-scope C++-ABI / libc extern reached through a symbol stub:
//     ___cxa_guard_acquire  @stub 0x3c5000
//     ___cxa_guard_release  @stub 0x3c5006
//     ___cxa_atexit         @stub 0x3c4fd6
//   plus the address of `string_t::~string_t` (__ZN8string_tD1Ev), which is
//   only PASSED to __cxa_atexit here, never called.
//   No indirect or virtual calls in either partial.
//
// ── END DECODE ──────────────────────────────────────────────────────────────

/**
 * `string_t` — Helium's shader-source string. Only the two fields this
 * initialiser populates are named; the 32 bytes at +0x10..+0x2f that it
 * zero-fills are modelled as an explicit zeroed tail rather than invented
 * fields.
 *
 * @Helium 0x00000000003c26bb  (+0x00 store)
 * @Helium 0x00000000003c26c9  (+0x08 store)
 */
export interface string_t {
  /** +0x00 — `char* data`. @Helium 0x3c26bb (`movq %rax, shader_string`). */
  data: string | null;
  /** +0x08 — `size_t length`. @Helium 0x3c26c9 (`movq $0x1ff, ...`). */
  length: number;
  /**
   * +0x10..+0x2f — 32 bytes the initialiser clears with two `movups %xmm0`
   * stores (@0x3c26d7 and @0x3c26de). Their meaning is not observable from
   * this function, so they are kept as an opaque zeroed block.
   */
  tail_0x10_0x2f: Uint8Array;
}

/**
 * The Metal fragment-shader source installed into the singleton, read
 * verbatim from the x86_64 slice at @Helium 0x8e0819. Exactly 511 (0x1ff)
 * bytes, NUL-terminated at 0x8e0a18 — the length the initialiser stores into
 * `shader_string.length` and the one the text's own `//LEN=` header states.
 *
 * @Helium 0x00000000008e0819
 */
export const METAL_SAMPLE2D6_SHADER_SOURCE: string =
  "//Metal1.0     \n" +
  "//LEN=00000001ff\n" +
  "fragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n" +
  "    const constant float4* hg_Params [[ buffer(0) ]], \n" +
  "    texture2d< float > hg_Texture6 [[ texture(6) ]], \n" +
  "    sampler hg_Sampler6 [[ sampler(6) ]])\n" +
  "{\n" +
  "    FragmentOut output;\n" +
  "\n" +
  "    output.color0 = hg_Texture6.sample(hg_Sampler6, frag._texCoord6.xy);\n" +
  "    return output;\n" +
  "}\n" +
  "//MD5=99bcb848:93607e3e:f6e46520:b61c284e\n" +
  "//SIG=00000000:00000040:00000000:00000000:0000:0000:0000:0000:0000:0000:0080:0000:0007:07:0:1:0\n";

/**
 * The stored length, `movq $0x1ff, ...` @0x3c26c9 — 511, the byte length of
 * {@link METAL_SAMPLE2D6_SHADER_SOURCE}.
 *
 * @Helium 0x00000000003c26c9
 */
const METAL_SAMPLE2D6_SHADER_LENGTH = 0x1ff;

/**
 * `metal_sample2d6_s()::shader_string` @Helium 0xadd620 — the function-local
 * static this initialiser publishes into. Declared here at module scope
 * because a C++ function-local static has exactly module-static lifetime and
 * a single instance; callers read it directly (the function returns void).
 *
 * Before the first call it is the BSS zero state, which is what a
 * default-constructed `string_t` looks like.
 *
 * @Helium 0x0000000000add620
 */
export const metal_sample2d6_s_shader_string: string_t = {
  data: null,
  length: 0,
  tail_0x10_0x2f: new Uint8Array(0x20),
};

/**
 * The `__cxa_guard` byte @Helium 0xadd650 — non-zero once
 * {@link metal_sample2d6_s_shader_string} has been constructed. The hot path
 * @0xbaed0 tests exactly this byte.
 *
 * @Helium 0x0000000000add650
 */
let metal_sample2d6_s_guard = 0;

/**
 * `___cxa_guard_acquire(guard)` @Helium stub 0x3c5000 — a TRUE out-of-scope
 * C++-ABI extern. Returns non-zero when THIS caller has won the right to run
 * the initialiser, zero when the object is already constructed (or another
 * thread constructed it while we blocked).
 *
 * The port is single-threaded, so the race arm the binary handles
 * (`testl %eax,%eax ; je 0x3c2705` @0x3c26b0) can only be taken via the
 * already-constructed case: acquire returns 0 exactly when the guard byte is
 * already set.
 *
 * @Helium 0x00000000003c5000
 */
function cxa_guard_acquire(): number {
  return metal_sample2d6_s_guard === 0 ? 1 : 0;
}

/**
 * `___cxa_guard_release(guard)` @Helium stub 0x3c5006 — TRUE out-of-scope
 * C++-ABI extern. Marks the guard byte as "constructed" so every later call
 * short-circuits at @0xbaed9.
 *
 * @Helium 0x00000000003c5006
 */
function cxa_guard_release(): void {
  metal_sample2d6_s_guard = 1;
}

/**
 * `___cxa_atexit(dtor, obj, dsoHandle)` @Helium stub 0x3c4fd6 — TRUE
 * out-of-scope libc extern. The initialiser registers
 * `string_t::~string_t` (__ZN8string_tD1Ev, whose address is loaded
 * @0x3c26e5 and only ever PASSED, never called) against
 * `&shader_string` with `__dso_handle` — which the `leaq -0x3c26f3(%rip)`
 * @0x3c26ec resolves to address 0, the image's `__dso_handle`.
 *
 * Process-exit teardown has no observable effect on any value this port
 * computes, and JS has no atexit hook, so the registration is recorded and
 * dropped rather than approximated with a fake teardown.
 *
 * @Helium 0x00000000003c4fd6
 */
function cxa_atexit(_dtor: string, _obj: string_t, _dsoHandle: number): void {
  // @0x3c26f3 — registration only; nothing runs until process exit.
}

/**
 * `metal_sample2d6_s()` — @Helium 0x00000000000baed0
 *   mangled: __ZL17metal_sample2d6_sv
 *
 * Meyers-singleton initialiser for `metal_sample2d6_s()::shader_string`
 * @0xadd620. Returns void; on the first call it installs the 511-byte Metal
 * fragment-shader source @0x8e0819 into that static, zeroes the object's
 * +0x10..+0x2f tail, registers `string_t::~string_t` with `__cxa_atexit`, and
 * releases the guard. Every later call returns immediately at @0xbaedb.
 *
 * Faithful line-for-line transcription of both partials decoded above (the
 * hot test @0xbaed0 and the outlined `.cold.1` construction @0x3c26a0).
 */
export function metal_sample2d6_s(): void {
  // @0xbaed0-0xbaed9: movzbl guard(%rip),%eax ; testb %al,%al ; je
  if (metal_sample2d6_s_guard !== 0) {
    // @0xbaedb: retq — already constructed, nothing to do.
    return;
  }

  // @0xbaee0: callq metal_sample2d6_s().cold.1 — the outlined initialiser.
  //   Inlined here as the single caller; the split is a code-layout artefact
  //   (cold text section), not a semantic boundary.

  // @0x3c26a4-0x3c26b2: leaq guard ; ___cxa_guard_acquire ; testl ; je
  if (cxa_guard_acquire() === 0) {
    // @0x3c2705-0x3c2706: popq %rbp ; retq — someone else constructed it.
    return;
  }

  // @0x3c26b4-0x3c26bb: shader_string.data = &<literal @0x8e0819>
  metal_sample2d6_s_shader_string.data = METAL_SAMPLE2D6_SHADER_SOURCE;
  // @0x3c26c9: movq $0x1ff, shader_string+0x08
  metal_sample2d6_s_shader_string.length = METAL_SAMPLE2D6_SHADER_LENGTH;
  // @0x3c26d4-0x3c26de: xorps %xmm0,%xmm0 ; two `movups %xmm0` stores zeroing
  //   +0x10..+0x1f and +0x20..+0x2f.
  metal_sample2d6_s_shader_string.tail_0x10_0x2f.fill(0);

  // @0x3c26e5-0x3c26f3: ___cxa_atexit(&string_t::~string_t, &shader_string,
  //   __dso_handle == 0). `%rsi` was loaded with &shader_string back at
  //   0x3c26c2, before the field stores.
  cxa_atexit("__ZN8string_tD1Ev", metal_sample2d6_s_shader_string, 0);

  // @0x3c26f8-0x3c2700: leaq guard ; tail-jmp ___cxa_guard_release.
  cxa_guard_release();
}
