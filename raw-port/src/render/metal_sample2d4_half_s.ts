// metal_sample2d4_half_s.ts — Helium's file-local `metal_sample2d4_half_s()`
// shader-text singleton initialiser.
//
// FRAMEWORK: Helium.framework (Final Cut Pro).
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
//
// EXPORTED SYMBOL (this file):
//   @Helium 0x00000000000bad90
//     metal_sample2d4_half_s()
//     mangled: __ZL22metal_sample2d4_half_sv   (`__ZL` = internal linkage — a
//              `static` free function, so it has no owning C++ class)
//
// SOURCE DISASSEMBLY:
//   raw-port/re/disasm/Helium.__ZL22metal_sample2d4_half_sv.s       (11 lines, hot)
//   raw-port/re/disasm/Helium.__ZL22metal_sample2d4_half_svcold1.s  (23 lines, cold)
//
// ROLE. A Meyers singleton: the function owns a function-local
// `static string_t shader_string` holding one prebuilt Metal fragment-shader
// source — here the HALF-precision texture-unit-4 sampler — and its whole job
// is to initialise that static exactly once. The hot path is a bare guard-byte
// test that returns immediately once the static is live; the actual
// construction is outlined into the `.cold.1` partial at @0x3c2240.
//
// The function returns VOID — it publishes into the file-scope static rather
// than returning it, so callers read
// `metal_sample2d4_half_s()::shader_string` @0xadd3f0 directly.
//
// ═══════════════════════════════════════════════════════════════════════════
// DECODE — hot partial @0xbad90 (AT&T)
// ═══════════════════════════════════════════════════════════════════════════
//   0xbad90  movzbl guard(%rip), %eax   ; al = the __cxa_guard byte @0xadd420
//   0xbad97  testb  %al, %al
//   0xbad99  je     0xbad9c             ; guard == 0 -> run the cold init
//   0xbad9b  retq                       ; already initialised -> nothing to do
//   0xbad9c  pushq  %rbp
//   0xbad9d  movq   %rsp, %rbp
//   0xbada0  callq  metal_sample2d4_half_s().cold.1   ; outlined initialiser
//   0xbada5  popq   %rbp
//   0xbada6  retq
//   0xbada7  nopw   (%rax,%rax)         ; padding
//
// ═══════════════════════════════════════════════════════════════════════════
// DECODE — cold partial @0x3c2240 (the one-time construction)
// ═══════════════════════════════════════════════════════════════════════════
//   0x3c2244  leaq  guard(%rip), %rdi
//   0x3c224b  callq ___cxa_guard_acquire            ; @stub 0x3c5000
//   0x3c2250  testl %eax, %eax
//   0x3c2252  je    0x3c22a5                        ; another party already
//                                                   ;   constructed it -> done
//   0x3c2254  leaq  <literal>(%rip), %rax           ; the shader source
//                                                   ;   (rip target 0x8df3f9)
//   0x3c225b  movq  %rax, shader_string(%rip)       ; shader_string+0x00 = ptr
//                                                   ;   (rip target 0xadd3f0)
//   0x3c2262  leaq  shader_string(%rip), %rsi       ; rsi = &shader_string
//                                                   ;   (the __cxa_atexit arg)
//   0x3c2269  movq  $0x207, 0x71b184(%rip)          ; shader_string+0x08 = 519
//                                                   ;   (rip target 0xadd3f8)
//   0x3c2274  xorps %xmm0, %xmm0
//   0x3c2277  movups %xmm0, 0x71b182(%rip)          ; zero +0x10..+0x1f
//                                                   ;   (rip target 0xadd400)
//   0x3c227e  movups %xmm0, 0x71b18b(%rip)          ; zero +0x20..+0x2f
//                                                   ;   (rip target 0xadd410)
//   0x3c2285  leaq  __ZN8string_tD1Ev(%rip), %rdi   ; string_t::~string_t
//   0x3c228c  leaq  -0x3c2293(%rip), %rdx           ; rdx = 0x3c2293 - 0x3c2293
//                                                   ;     = 0 == __dso_handle
//   0x3c2293  callq ___cxa_atexit                   ; @stub 0x3c4fd6 —
//                                                   ;   atexit(dtor, &obj, dso)
//   0x3c2298  leaq  guard(%rip), %rdi
//   0x3c22a0  jmp   ___cxa_guard_release            ; @stub 0x3c5006 (tail)
//   0x3c22a5  popq  %rbp
//   0x3c22a6  retq
//
// ── ADDRESS DERIVATIONS (from the instruction bytes, not guessed) ───────────
//   `movq %rax, shader_string(%rip)` @0x3c225b encodes 48 89 05 8e b1 71 00,
//   so disp32 = 0x0071b18e and the target is 0x3c2262 + 0x71b18e = 0xadd3f0.
//   The follow-up stores land at 0xadd3f8 (+0x08), 0xadd400 (+0x10) and
//   0xadd410 (+0x20) of that same object, and the guard byte resolves to
//   0xadd420 — i.e. the compiler placed the guard immediately after the
//   0x30-byte object, exactly the arrangement the sibling
//   `metal_sample2d6_s()` @0xbaed0 uses for its own static @0xadd620.
//   `leaq <literal>(%rip), %rax` @0x3c2254 resolves to 0x8df3f9; the byte at
//   0x8df3f9 + 519 is NUL, so the literal is exactly 519 == 0x207 characters
//   long — which is precisely the value stored into +0x08, and precisely the
//   value the shader text spells out in its own `//LEN=0000000207` header.
//   That three-way agreement is what pins +0x08 as the LENGTH field.
//
// ── string_t LAYOUT (only what this initialiser writes) ─────────────────────
//   +0x00  char*   data     <- the shader literal @0x8df3f9
//   +0x08  size_t  length   <- 0x207
//   +0x10  16 bytes zeroed  (`movups %xmm0` @0x3c2277)
//   +0x20  16 bytes zeroed  (`movups %xmm0` @0x3c227e)
//   ...so sizeof(string_t) >= 0x30. This matches the independently-decoded
//   HGString layout (+0x00 `char* buf` from `HGString::data()` @0xb3324,
//   +0x08 `size_t length` from `HGString::length()` @0xb3334) — consistent
//   with `HGString::c_str()` @0xb849e tail-calling `str_close(string_t&)` on
//   `this`, i.e. HGString IS a `string_t`. The +0x10..+0x2f bytes are left
//   generic: this function only ever zeroes them, which reveals nothing about
//   their meaning (PORTING_SPEC Rule 5 — no invented fields).
//
//   `string_t` is declared MODULE-LOCAL (not exported) below. It is a shared
//   Helium type with no ledger unit of its own yet; every shader-singleton
//   initialiser in this family decodes it independently from its own stores.
//   When a dedicated `string_t` unit lands, these local declarations should be
//   replaced with an import — they are deliberately not exported so that
//   consolidation is a pure deletion.
//
// ── Callees ─────────────────────────────────────────────────────────────────
//   ZERO in-scope callees (`depgraph.py deps __ZL22metal_sample2d4_half_sv`
//   prints nothing). Besides the outlined `.cold.1` partial of itself, every
//   call is a TRUE out-of-scope C++-ABI / libc extern reached through a stub:
//     ___cxa_guard_acquire  @stub 0x3c5000
//     ___cxa_guard_release  @stub 0x3c5006
//     ___cxa_atexit         @stub 0x3c4fd6
//   plus the address of `string_t::~string_t` (__ZN8string_tD1Ev), which is
//   only PASSED to __cxa_atexit here, never called.
//   No indirect or virtual calls in either partial.
//
// ── END DECODE ──────────────────────────────────────────────────────────────

/**
 * `string_t` — Helium's shader-source string, as observed through this
 * initialiser's stores. Module-local on purpose (see the note above).
 *
 * @Helium 0x00000000003c225b  (+0x00 store)
 * @Helium 0x00000000003c2269  (+0x08 store)
 */
interface string_t {
  /** +0x00 — `char* data`. @Helium 0x3c225b (`movq %rax, shader_string`). */
  data: string | null;
  /** +0x08 — `size_t length`. @Helium 0x3c2269 (`movq $0x207, ...`). */
  length: number;
  /**
   * +0x10..+0x2f — 32 bytes the initialiser clears with two `movups %xmm0`
   * stores (@0x3c2277 and @0x3c227e). Their meaning is not observable from
   * this function, so they are kept as an opaque zeroed block.
   */
  tail_0x10_0x2f: Uint8Array;
}

/**
 * The Metal fragment-shader source installed into the singleton, read
 * verbatim from the x86_64 slice at @Helium 0x8df3f9. Exactly 519 (0x207)
 * bytes, NUL-terminated at 0x8df600 — the length the initialiser stores into
 * `shader_string.length` and the one the text's own `//LEN=` header states.
 *
 * This is the HALF-precision variant: it declares `texture2d< half >` on
 * texture/sampler unit 4 and casts the sample result back to `float4`, which
 * is what distinguishes it from the plain `texture2d< float >` siblings.
 *
 * @Helium 0x00000000008df3f9
 */
export const METAL_SAMPLE2D4_HALF_SHADER_SOURCE: string =
  "//Metal1.0     \n" +
  "//LEN=0000000207\n" +
  "fragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n" +
  "    const constant float4* hg_Params [[ buffer(0) ]], \n" +
  "    texture2d< half > hg_Texture4 [[ texture(4) ]], \n" +
  "    sampler hg_Sampler4 [[ sampler(4) ]])\n" +
  "{\n" +
  "    FragmentOut output;\n" +
  "\n" +
  "    output.color0 = (float4) hg_Texture4.sample(hg_Sampler4, frag._texCoord4.xy);\n" +
  "    return output;\n" +
  "}\n" +
  "//MD5=e58b568d:54c2b894:b659516b:b176e5ac\n" +
  "//SIG=00400000:00000010:00000000:00000010:0000:0000:0000:0000:0000:0000:0020:0000:0005:05:0:1:0\n";

/**
 * The stored length, `movq $0x207, ...` @0x3c2269 — 519, the byte length of
 * {@link METAL_SAMPLE2D4_HALF_SHADER_SOURCE}.
 *
 * @Helium 0x00000000003c2269
 */
const METAL_SAMPLE2D4_HALF_SHADER_LENGTH = 0x207;

/**
 * `metal_sample2d4_half_s()::shader_string` @Helium 0xadd3f0 — the
 * function-local static this initialiser publishes into. Declared here at
 * module scope because a C++ function-local static has exactly module-static
 * lifetime and a single instance; callers read it directly (the function
 * returns void).
 *
 * Before the first call it is the BSS zero state, which is what a
 * default-constructed `string_t` looks like.
 *
 * @Helium 0x0000000000add3f0
 */
export const metal_sample2d4_half_s_shader_string: string_t = {
  data: null,
  length: 0,
  tail_0x10_0x2f: new Uint8Array(0x20),
};

/**
 * The `__cxa_guard` byte @Helium 0xadd420 — non-zero once
 * {@link metal_sample2d4_half_s_shader_string} has been constructed. The hot
 * path @0xbad90 tests exactly this byte.
 *
 * @Helium 0x0000000000add420
 */
let metal_sample2d4_half_s_guard = 0;

/**
 * `___cxa_guard_acquire(guard)` @Helium stub 0x3c5000 — a TRUE out-of-scope
 * C++-ABI extern. Returns non-zero when THIS caller has won the right to run
 * the initialiser, zero when the object is already constructed (or another
 * thread constructed it while we blocked).
 *
 * The port is single-threaded, so the race arm the binary handles
 * (`testl %eax,%eax ; je 0x3c22a5` @0x3c2250) can only be taken via the
 * already-constructed case: acquire returns 0 exactly when the guard byte is
 * already set.
 *
 * @Helium 0x00000000003c5000
 */
function cxa_guard_acquire(): number {
  return metal_sample2d4_half_s_guard === 0 ? 1 : 0;
}

/**
 * `___cxa_guard_release(guard)` @Helium stub 0x3c5006 — TRUE out-of-scope
 * C++-ABI extern. Marks the guard byte as "constructed" so every later call
 * short-circuits at @0xbad99.
 *
 * @Helium 0x00000000003c5006
 */
function cxa_guard_release(): void {
  metal_sample2d4_half_s_guard = 1;
}

/**
 * `___cxa_atexit(dtor, obj, dsoHandle)` @Helium stub 0x3c4fd6 — TRUE
 * out-of-scope libc extern. The initialiser registers
 * `string_t::~string_t` (__ZN8string_tD1Ev, whose address is loaded @0x3c2285
 * and only ever PASSED, never called) against `&shader_string` with
 * `__dso_handle` — which the `leaq -0x3c2293(%rip)` @0x3c228c resolves to
 * address 0, the image's `__dso_handle`.
 *
 * Process-exit teardown has no observable effect on any value this port
 * computes, and JS has no atexit hook, so the registration is recorded and
 * dropped rather than approximated with a fake teardown.
 *
 * @Helium 0x00000000003c4fd6
 */
function cxa_atexit(_dtor: string, _obj: string_t, _dsoHandle: number): void {
  // @0x3c2293 — registration only; nothing runs until process exit.
}

/**
 * `metal_sample2d4_half_s()` — @Helium 0x00000000000bad90
 *   mangled: __ZL22metal_sample2d4_half_sv
 *
 * Meyers-singleton initialiser for `metal_sample2d4_half_s()::shader_string`
 * @0xadd3f0. Returns void; on the first call it installs the 519-byte
 * half-precision Metal fragment-shader source @0x8df3f9 into that static,
 * zeroes the object's +0x10..+0x2f tail, registers `string_t::~string_t` with
 * `__cxa_atexit`, and releases the guard. Every later call returns
 * immediately at @0xbad9b.
 *
 * Faithful line-for-line transcription of both partials decoded above (the
 * hot test @0xbad90 and the outlined `.cold.1` construction @0x3c2240).
 */
export function metal_sample2d4_half_s(): void {
  // @0xbad90-0xbad99: movzbl guard(%rip),%eax ; testb %al,%al ; je
  if (metal_sample2d4_half_s_guard !== 0) {
    // @0xbad9b: retq — already constructed, nothing to do.
    return;
  }

  // @0xbada0: callq metal_sample2d4_half_s().cold.1 — the outlined
  //   initialiser. Inlined here as the single caller; the split is a
  //   code-layout artefact (cold text section), not a semantic boundary.

  // @0x3c2244-0x3c2252: leaq guard ; ___cxa_guard_acquire ; testl ; je
  if (cxa_guard_acquire() === 0) {
    // @0x3c22a5-0x3c22a6: popq %rbp ; retq — someone else constructed it.
    return;
  }

  // @0x3c2254-0x3c225b: shader_string.data = &<literal @0x8df3f9>
  metal_sample2d4_half_s_shader_string.data = METAL_SAMPLE2D4_HALF_SHADER_SOURCE;
  // @0x3c2269: movq $0x207, shader_string+0x08
  metal_sample2d4_half_s_shader_string.length =
    METAL_SAMPLE2D4_HALF_SHADER_LENGTH;
  // @0x3c2274-0x3c227e: xorps %xmm0,%xmm0 ; two `movups %xmm0` stores zeroing
  //   +0x10..+0x1f and +0x20..+0x2f.
  metal_sample2d4_half_s_shader_string.tail_0x10_0x2f.fill(0);

  // @0x3c2285-0x3c2293: ___cxa_atexit(&string_t::~string_t, &shader_string,
  //   __dso_handle == 0). `%rsi` was loaded with &shader_string back at
  //   0x3c2262, before the field stores.
  cxa_atexit("__ZN8string_tD1Ev", metal_sample2d4_half_s_shader_string, 0);

  // @0x3c2298-0x3c22a0: leaq guard ; tail-jmp ___cxa_guard_release.
  cxa_guard_release();
}
