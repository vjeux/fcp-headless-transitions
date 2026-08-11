// metal_sample2d1_half_s.ts — Helium framework, file-static free function
// `metal_sample2d1_half_s()` (internal linkage — the `L` in the mangled name).
//
// It is a Meyers singleton: a function-local `static string_t shader_string`
// holding the canned Metal fragment-shader source for "sample texture unit 1
// as half precision". The compiler split it in two, as it does for every
// cold-initialised local static:
//   * the HOT stub @0xbad30 — read the guard byte, return if already
//     initialised, otherwise call the outlined initialiser;
//   * the COLD initialiser @0x3c20f0 — the __cxa_guard_acquire / build /
//     __cxa_atexit / __cxa_guard_release dance.
// Both halves are ONE source-level function, so both are transcribed here and
// both addresses are cited (the ledger rows `.cold.1` separately because it is
// a separate linker symbol, not a separate C++ function).
//
// This is one of sixteen sibling generators laid out contiguously in the text
// section — metal_sample2d{0..7}_half_s() @0xbad10..0xbadf0 (stride 0x20) and
// metal_sample2d{0..7}_s() @0xbae10..0xbaef0 — each holding the same shader
// with a different texture/sampler index and precision. Each is its own ledger
// unit; only this one is written here.
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//         Versions/A/Helium  (macOS FCP, x86_64 slice; text VAs below are
//         unadjusted VM addresses = file offset - 0x4000).
//
// -----------------------------------------------------------------------------
// SYMBOLS PORTED IN THIS UNIT
// -----------------------------------------------------------------------------
//   * metal_sample2d1_half_s()            @Helium 0xbad30
//     __ZL22metal_sample2d1_half_sv
//   * metal_sample2d1_half_s() (.cold.1)  @Helium 0x3c20f0
//     __ZL22metal_sample2d1_half_sv.cold.1
//
// re/disasm:
//   raw-port/re/disasm/Helium.__ZL22metal_sample2d1_half_sv.s
//   raw-port/re/disasm/Helium.__ZL22metal_sample2d1_half_svcold1.s
//
// -----------------------------------------------------------------------------
// FULL DISASM — hot stub (@0xbad30..0xbad46; 0xbad47 is alignment padding)
// -----------------------------------------------------------------------------
//   __ZL22metal_sample2d1_half_sv:
//     0xbad30  movzbl __ZGVZL22metal_sample2d1_half_svE13shader_string(%rip), %eax
//                                          ; al = the guard byte
//     0xbad37  testb  %al, %al
//     0xbad39  je     0xbad3c              ; guard == 0 -> run the initialiser
//     0xbad3b  retq                        ; already initialised: nothing to do
//     0xbad3c  pushq  %rbp
//     0xbad3d  movq   %rsp, %rbp
//     0xbad40  callq  __ZL22metal_sample2d1_half_sv.cold.1
//     0xbad45  popq   %rbp
//     0xbad46  retq
//     0xbad47  nopw   (%rax,%rax)          ; padding, not code
//
// NOTE ON THE RETURN VALUE: neither exit sets %rax to `&shader_string` — the
// early-return path leaves %rax holding the (nonzero) guard byte and the slow
// path leaves whatever the cold routine returned. So this function does NOT
// return a reference to the static; it is a pure "ensure initialised" trigger,
// and its callers read the static directly. That is transcribed literally
// below as a `void` return — inventing a `string_t&` return would be a
// rewrite, not a transcription.
//
// -----------------------------------------------------------------------------
// FULL DISASM — cold initialiser (@0x3c20f0..0x3c2156; 0x3c2157 is padding)
// -----------------------------------------------------------------------------
//   __ZL22metal_sample2d1_half_sv.cold.1:
//     0x3c20f0  pushq  %rbp
//     0x3c20f1  movq   %rsp, %rbp
//     0x3c20f4  leaq   __ZGVZL22metal_sample2d1_half_svE13shader_string(%rip), %rdi
//     0x3c20fb  callq  0x3c5000            ## symbol stub for: ___cxa_guard_acquire
//     0x3c2100  testl  %eax, %eax
//     0x3c2102  je     0x3c2155            ; another thread won the race -> return
//     0x3c2104  leaq   0x51ccd6(%rip), %rax
//                                          ; %rax = the shader source literal,
//                                          ;   0x3c210b + 0x51ccd6 = 0x8dede1
//     0x3c210b  movq   %rax, __ZZL22metal_sample2d1_half_svE13shader_string(%rip)
//                                          ; shader_string.data = literal (+0x00)
//     0x3c2112  leaq   __ZZL22metal_sample2d1_half_svE13shader_string(%rip), %rsi
//                                          ; %rsi = &shader_string, for __cxa_atexit
//     0x3c2119  movq   $0x207, 0x71b22c(%rip)
//                                          ; shader_string.len = 0x207 (+0x08);
//                                          ;   0x3c2124 + 0x71b22c = 0xadd350
//     0x3c2124  xorps  %xmm0, %xmm0
//     0x3c2127  movups %xmm0, 0x71b22a(%rip)
//                                          ; zero bytes +0x10..+0x1f;
//                                          ;   0x3c212e + 0x71b22a = 0xadd358
//     0x3c212e  movups %xmm0, 0x71b233(%rip)
//                                          ; zero bytes +0x20..+0x2f;
//                                          ;   0x3c2135 + 0x71b233 = 0xadd368
//     0x3c2135  leaq   __ZN8string_tD1Ev(%rip), %rdi   ; arg1 = &string_t::~string_t
//     0x3c213c  leaq   -0x3c2143(%rip), %rdx           ; arg3 = __dso_handle;
//                                          ;   0x3c2143 - 0x3c2143 = 0x0
//     0x3c2143  callq  0x3c4fd6            ## symbol stub for: ___cxa_atexit
//     0x3c2148  leaq   __ZGVZL22metal_sample2d1_half_svE13shader_string(%rip), %rdi
//     0x3c214f  popq   %rbp
//     0x3c2150  jmp    0x3c5006            ## symbol stub for: ___cxa_guard_release
//     0x3c2155  popq   %rbp                ; the lost-the-race exit
//     0x3c2156  retq
//     0x3c2157  nopw   (%rax,%rax)         ; padding, not code
//
// -----------------------------------------------------------------------------
// THE STATIC AND ITS ADDRESSES
// -----------------------------------------------------------------------------
// Resolving the three RIP-relative stores above puts the len field at
// 0xadd350 and the two zeroed 16-byte runs at 0xadd358 and 0xadd368. Since the
// len field is at +0x08, the object base is:
//
//   __ZZL22metal_sample2d1_half_svE13shader_string  @Helium 0xadd348  (0x30 bytes)
//     +0x00  data  = 0x8dede1    (the literal; stored @0x3c210b)
//     +0x08  len   = 0x207       (stored @0x3c2119)
//     +0x10..+0x1f = 0           (zeroed @0x3c2127)
//     +0x20..+0x2f = 0           (zeroed @0x3c212e)
//
// That is exactly the `string_t` shape the shader emitters use — see the
// landed decode in raw-port/src/channels/glsl.ts ({data@+0x00, len@+0x08,
// alloc@+0x10}) and raw-port/src/render/HGString.ts, whose dtor and ctor pin
// the same 0x30-byte object with an owning `alloc` at +0x10 and a vector
// triple at +0x18/+0x20/+0x28. Zeroing +0x10..+0x2f is therefore "no owned
// allocation, no extra block": the static points straight at a read-only
// literal in __TEXT and owns nothing, which is why the registered
// `string_t::~string_t` has nothing to free.
//
// The guard byte lives at
//   __ZGVZL22metal_sample2d1_half_svE13shader_string  (read @0xbad30, passed by
//   address to __cxa_guard_acquire @0x3c20f4 and __cxa_guard_release @0x3c2148).
//
// -----------------------------------------------------------------------------
// VERIFICATION OF THE LITERAL
// -----------------------------------------------------------------------------
// The 519 bytes at file offset 0x8dede1 + 0x4000 were read straight out of the
// binary and are reproduced verbatim in SHADER_STRING_DATA below; byte 519 is
// the NUL terminator. Three independent facts agree on the length:
//   * `movq $0x207, ...` @0x3c2119 stores 0x207 = 519;
//   * the literal is 519 bytes long before its NUL;
//   * the shader source declares its own length in its second line,
//     `//LEN=0000000207`.
//
// -----------------------------------------------------------------------------
// EXTERNS — all three are Itanium C++ ABI runtime plumbing, and all three are
// MODELLED, not stubbed
// -----------------------------------------------------------------------------
//   ___cxa_guard_acquire  @0x3c20fb   ___cxa_guard_release  @0x3c2150 (tail jmp)
//   ___cxa_atexit         @0x3c2143
// None of these is FCP logic; each has a small, fully-known observable effect,
// and every one of them sits on the ONLY path through this function. Throwing
// on them would make the whole unit unreachable — an incompleteness stub for
// work that is in fact completely decoded. So they are transcribed as what
// they do, exactly as the landed `createExtendedColorSpace.ts` unit does for
// its own __cxa_guard-protected Meyers singleton @ProCore 0x205f2/0x2060e:
//   * the guard pair becomes the `metal_sample2d1_half_s_guard` flag (JS is
//     single-threaded, so acquire can never lose the race and the
//     @0x3c2102 bail-out is dead code);
//   * __cxa_atexit becomes an append to a process-exit destructor list, which
//     is precisely its contract — it records (dtor, obj, dsoHandle) and
//     returns 0. It does NOT invoke the destructor.
// The `__ZN8string_tD1Ev` reference @0x3c2135 is likewise NOT a call — the
// dtor's ADDRESS is the first argument to __cxa_atexit and is never invoked by
// this function. (Its eventual teardown work is nil anyway: the static owns no
// allocation, since +0x10..+0x2f are explicitly zeroed.)
// `depgraph.py deps __ZL22metal_sample2d1_half_sv` reports no in-scope callee,
// and neither listing contains an indirect or virtual call.
//
// Numerics: none — pointer stores and one integer constant. Math.fround does
// not apply.

/**
 * The `string_t` shape of the static, as pinned by the three stores in the
 * cold initialiser. Kept local to this unit rather than imported: the sibling
 * `string_t` models in channels/glsl.ts (`StringT`) and render/HGString.ts
 * (`HGStringInstance`) were each recovered from a different set of accessors,
 * and cross-importing one of them here would assert an identity this unit's
 * disassembly does not by itself establish.
 */
export interface MetalShaderStringT {
  /** +0x00 — `char* data`; set to the literal @0x3c210b. */
  data: string | null;
  /** +0x08 — `size_t len`; set to 0x207 @0x3c2119. */
  len: number;
  /** +0x10..+0x1f — zeroed @0x3c2127 (the owning-allocator slot and more). */
  zero10: Uint8Array;
  /** +0x20..+0x2f — zeroed @0x3c212e. */
  zero20: Uint8Array;
}

/**
 * The shader source literal at @Helium 0x8dede1, read byte-for-byte out of the
 * binary (519 bytes + NUL). Its address reaches the static via
 * `leaq 0x51ccd6(%rip), %rax` @0x3c2104 followed by the store @0x3c210b.
 */
const SHADER_STRING_DATA =
  "//Metal1.0     \n" +
  "//LEN=0000000207\n" +
  "fragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n" +
  "    const constant float4* hg_Params [[ buffer(0) ]], \n" +
  "    texture2d< half > hg_Texture1 [[ texture(1) ]], \n" +
  "    sampler hg_Sampler1 [[ sampler(1) ]])\n" +
  "{\n" +
  "    FragmentOut output;\n" +
  "\n" +
  "    output.color0 = (float4) hg_Texture1.sample(hg_Sampler1, frag._texCoord1.xy);\n" +
  "    return output;\n" +
  "}\n" +
  "//MD5=66126f08:7a0a0541:50cb14b8:dc20ab48\n" +
  "//SIG=00400000:00000002:00000000:00000002:0000:0000:0000:0000:0000:0000:0004:0000:0002:02:0:1:0\n";

/**
 * The immediate stored into `shader_string.len` by
 * `movq $0x207, 0x71b22c(%rip)` @0x3c2119.
 */
const SHADER_STRING_LEN = 0x207;

/**
 * `metal_sample2d1_half_s()::shader_string` @Helium 0xadd348 — the
 * function-local static this unit initialises. Declared with the zeroed state
 * the C++ runtime gives it before the first call; the cold initialiser fills
 * +0x00 and +0x08 and re-zeroes +0x10..+0x2f.
 */
export const metal_sample2d1_half_s_shader_string: MetalShaderStringT = {
  data: null,
  len: 0,
  zero10: new Uint8Array(16),
  zero20: new Uint8Array(16),
};

/**
 * `__ZGVZL22metal_sample2d1_half_svE13shader_string` — the Itanium-ABI guard
 * byte for the static above. Read by the hot stub @0xbad30 and passed by
 * address to `__cxa_guard_acquire` @0x3c20f4 / `__cxa_guard_release`
 * @0x3c2148.
 */
let metal_sample2d1_half_s_guard = 0;

/**
 * One entry in the Itanium-ABI process-exit destructor list.
 *
 * `dtor` is recorded as the MANGLED SYMBOL NAME of the function whose address
 * the binary passes, not as a callable: this unit only registers the entry, it
 * never runs it, and `string_t::~string_t` is its own ledger unit.
 */
export interface CxaAtexitEntry {
  /** arg1 (%rdi) — the destructor's mangled symbol; loaded @0x3c2135. */
  dtor: string;
  /** arg2 (%rsi) — the object to destroy; `&shader_string`, loaded @0x3c2112. */
  obj: MetalShaderStringT;
  /** arg3 (%rdx) — `__dso_handle`; resolves to 0x0 @0x3c213c. */
  dsoHandle: number;
}

/**
 * The process-exit destructor list that `___cxa_atexit` appends to. Exported so
 * the eventual `string_t::~string_t` unit and any teardown driver can observe
 * exactly what the binary registered.
 */
export const cxaAtexitRegistrations: CxaAtexitEntry[] = [];

/**
 * `___cxa_atexit(void (*dtor)(void*), void* obj, void* dsoHandle)` — called
 * @0x3c2143 through the `symbol stub for: ___cxa_atexit` at 0x3c4fd6 with
 * arg1 = `&string_t::~string_t` (@0x3c2135), arg2 = `&shader_string`
 * (@0x3c2112), arg3 = `__dso_handle` = 0x0 (@0x3c213c).
 *
 * The Itanium C++ ABI contract is exactly one thing: record the triple on the
 * DSO's exit list and return 0 on success. It does not call `dtor`. That whole
 * contract is modelled here rather than stubbed — see the EXTERNS block in the
 * header for why a throw would be wrong on this path.
 *
 * @returns 0, the ABI's success code (the binary ignores the value).
 */
function __cxa_atexit(
  dtor: string,
  obj: MetalShaderStringT,
  dsoHandle: number,
): number {
  // @0x3c2143 callq 0x3c4fd6  ## symbol stub for: ___cxa_atexit
  cxaAtexitRegistrations.push({ dtor, obj, dsoHandle });
  return 0;
}

/**
 * `metal_sample2d1_half_s()` — @Helium 0xbad30 (hot stub) + @Helium 0x3c20f0
 * (`.cold.1`, the outlined initialiser). Both halves of the same source
 * function; see the two disassembly listings in the header.
 *
 * Ensures the function-local static `shader_string` holds the canned Metal
 * fragment-shader source that samples texture unit 1 at half precision and
 * widens the result to `float4`. Returns nothing — see the "NOTE ON THE RETURN
 * VALUE" block in the header for why this is `void` and not a `string_t&`.
 *
 * The `__cxa_guard_acquire` / `__cxa_guard_release` pair @0x3c20fb/@0x3c2150
 * exists solely to make first-call initialisation thread-safe; JS is
 * single-threaded, so the acquire can never lose the race and the
 * @0x3c2102 `je 0x3c2155` bail-out is unreachable here. That collapse is the
 * same one the landed `createExtendedColorSpace.ts` unit makes for its own
 * __cxa_guard-protected Meyers singleton @ProCore 0x205f2/0x2060e.
 */
export function metal_sample2d1_half_s(): void {
  // ── hot stub @0xbad30 ────────────────────────────────────────────────
  // @0xbad30 movzbl guard(%rip),%eax / @0xbad37 testb / @0xbad39 je 0xbad3c
  if (metal_sample2d1_half_s_guard !== 0) {
    // @0xbad3b retq — already initialised.
    return;
  }
  // @0xbad40 callq __ZL22metal_sample2d1_half_sv.cold.1

  // ── cold initialiser @0x3c20f0 ───────────────────────────────────────
  // @0x3c20f4-@0x3c20fb __cxa_guard_acquire(&guard); @0x3c2100/@0x3c2102
  // je 0x3c2155 on a zero return (another thread already ran the body).
  // Single-threaded here, so acquire always succeeds and that exit is dead.

  // @0x3c2104-@0x3c210b  shader_string.data = the 0x8dede1 literal
  metal_sample2d1_half_s_shader_string.data = SHADER_STRING_DATA;
  // @0x3c2119  shader_string.len = 0x207
  metal_sample2d1_half_s_shader_string.len = SHADER_STRING_LEN;
  // @0x3c2124-@0x3c2127  xorps %xmm0,%xmm0 ; movups -> zero +0x10..+0x1f
  metal_sample2d1_half_s_shader_string.zero10.fill(0);
  // @0x3c212e  movups -> zero +0x20..+0x2f
  metal_sample2d1_half_s_shader_string.zero20.fill(0);

  // @0x3c2135/@0x3c2112/@0x3c213c/@0x3c2143
  //   __cxa_atexit(&string_t::~string_t, &shader_string, __dso_handle=0)
  __cxa_atexit(
    "__ZN8string_tD1Ev",
    metal_sample2d1_half_s_shader_string,
    0x0,
  );

  // @0x3c2148-@0x3c2150  tail-jmp __cxa_guard_release(&guard) — publishes the
  // initialised state, which is what the hot stub's @0xbad30 read observes.
  metal_sample2d1_half_s_guard = 1;
}
