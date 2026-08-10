// metal_sample2d0_s.ts — Helium framework, file-static free function
// `metal_sample2d0_s()` (internal linkage — the `L` in the mangled name).
//
// It is a Meyers singleton: a function-local `static string_t shader_string`
// holding the canned Metal fragment-shader source for the simplest possible
// "sample one 2D texture" program. The compiler split it in two, as it does
// for every cold-initialised local static:
//   * the HOT stub @0xbae10 — read the guard byte, return if already
//     initialised, otherwise call the outlined initialiser;
//   * the COLD initialiser @0x3c2400 — the __cxa_guard_acquire / build /
//     __cxa_atexit / __cxa_guard_release dance.
// Both halves are ONE source-level function, so both are transcribed here and
// both addresses are cited (the ledger enumerates `.cold.1` as its own row
// because it is a separate linker symbol, not a separate C++ function).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//         Versions/A/Helium  (macOS FCP, x86_64 slice; text VAs below are
//         unadjusted VM addresses = file offset - 0x4000).
//
// -----------------------------------------------------------------------------
// SYMBOLS PORTED IN THIS UNIT
// -----------------------------------------------------------------------------
//   * metal_sample2d0_s()             @Helium 0xbae10   __ZL17metal_sample2d0_sv
//   * metal_sample2d0_s() (.cold.1)   @Helium 0x3c2400  __ZL17metal_sample2d0_sv.cold.1
//
// re/disasm:
//   raw-port/re/disasm/Helium.__ZL17metal_sample2d0_sv.s
//   raw-port/re/disasm/Helium.__ZL17metal_sample2d0_svcold1.s
//
// -----------------------------------------------------------------------------
// FULL DISASM — hot stub (@0xbae10..0xbae26; 0xbae27 is alignment padding)
// -----------------------------------------------------------------------------
//   __ZL17metal_sample2d0_sv:
//     0xbae10  movzbl __ZGVZL17metal_sample2d0_svE13shader_string(%rip), %eax
//                                          ; al = the guard byte
//     0xbae17  testb  %al, %al
//     0xbae19  je     0xbae1c              ; guard == 0 -> run the initialiser
//     0xbae1b  retq                        ; already initialised: nothing to do
//     0xbae1c  pushq  %rbp
//     0xbae1d  movq   %rsp, %rbp
//     0xbae20  callq  __ZL17metal_sample2d0_sv.cold.1
//     0xbae25  popq   %rbp
//     0xbae26  retq
//     0xbae27  nopw   (%rax,%rax)          ; padding, not code
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
// FULL DISASM — cold initialiser (@0x3c2400..0x3c2466; 0x3c2467 is padding)
// -----------------------------------------------------------------------------
//   __ZL17metal_sample2d0_sv.cold.1:
//     0x3c2400  pushq  %rbp
//     0x3c2401  movq   %rsp, %rbp
//     0x3c2404  leaq   __ZGVZL17metal_sample2d0_svE13shader_string(%rip), %rdi
//     0x3c240b  callq  0x3c5000            ## symbol stub for: ___cxa_guard_acquire
//     0x3c2410  testl  %eax, %eax
//     0x3c2412  je     0x3c2465            ; another thread won the race -> return
//     0x3c2414  leaq   0x51d7fe(%rip), %rax
//                                          ; %rax = the shader source literal,
//                                          ;   0x3c241b + 0x51d7fe = 0x8dfc19
//     0x3c241b  movq   %rax, __ZZL17metal_sample2d0_svE13shader_string(%rip)
//                                          ; shader_string.data = literal (+0x00)
//     0x3c2422  leaq   __ZZL17metal_sample2d0_svE13shader_string(%rip), %rsi
//                                          ; %rsi = &shader_string, for __cxa_atexit
//     0x3c2429  movq   $0x1ff, 0x71b0a4(%rip)
//                                          ; shader_string.len = 0x1ff (+0x08);
//                                          ;   0x3c2434 + 0x71b0a4 = 0xadd4d8
//     0x3c2434  xorps  %xmm0, %xmm0
//     0x3c2437  movups %xmm0, 0x71b0a2(%rip)
//                                          ; zero bytes +0x10..+0x1f;
//                                          ;   0x3c243e + 0x71b0a2 = 0xadd4e0
//     0x3c243e  movups %xmm0, 0x71b0ab(%rip)
//                                          ; zero bytes +0x20..+0x2f;
//                                          ;   0x3c2445 + 0x71b0ab = 0xadd4f0
//     0x3c2445  leaq   __ZN8string_tD1Ev(%rip), %rdi   ; arg1 = &string_t::~string_t
//     0x3c244c  leaq   -0x3c2453(%rip), %rdx           ; arg3 = __dso_handle;
//                                          ;   0x3c2453 - 0x3c2453 = 0x0
//     0x3c2453  callq  0x3c4fd6            ## symbol stub for: ___cxa_atexit
//     0x3c2458  leaq   __ZGVZL17metal_sample2d0_svE13shader_string(%rip), %rdi
//     0x3c245f  popq   %rbp
//     0x3c2460  jmp    0x3c5006            ## symbol stub for: ___cxa_guard_release
//     0x3c2465  popq   %rbp                ; the lost-the-race exit
//     0x3c2466  retq
//     0x3c2467  nopw   (%rax,%rax)         ; padding, not code
//
// -----------------------------------------------------------------------------
// THE STATIC AND ITS ADDRESSES
// -----------------------------------------------------------------------------
// Resolving the three RIP-relative stores above puts the len field at
// 0xadd4d8 and the two zeroed 16-byte runs at 0xadd4e0 and 0xadd4f0. Since the
// len field is at +0x08, the object base is:
//
//   __ZZL17metal_sample2d0_svE13shader_string  @Helium 0xadd4d0   (0x30 bytes)
//     +0x00  data  = 0x8dfc19    (the literal; stored @0x3c241b)
//     +0x08  len   = 0x1ff       (stored @0x3c2429)
//     +0x10..+0x1f = 0           (zeroed @0x3c2437)
//     +0x20..+0x2f = 0           (zeroed @0x3c243e)
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
//   __ZGVZL17metal_sample2d0_svE13shader_string  (read @0xbae10, passed by
//   address to __cxa_guard_acquire @0x3c2404 and __cxa_guard_release @0x3c2458).
//
// -----------------------------------------------------------------------------
// VERIFICATION OF THE LITERAL
// -----------------------------------------------------------------------------
// The 511 bytes at file offset 0x8dfc19 + 0x4000 were read straight out of the
// binary and are reproduced verbatim in SHADER_STRING_DATA below; byte 511 is
// the NUL terminator. Three independent facts agree on the length:
//   * `movq $0x1ff, ...` @0x3c2429 stores 0x1ff = 511;
//   * the literal is 511 bytes long before its NUL;
//   * the shader source declares its own length in its second line,
//     `//LEN=00000001ff`.
//
// -----------------------------------------------------------------------------
// EXTERNS — all three are Itanium C++ ABI runtime plumbing, and all three are
// MODELLED, not stubbed
// -----------------------------------------------------------------------------
//   ___cxa_guard_acquire  @0x3c240b   ___cxa_guard_release  @0x3c2460 (tail jmp)
//   ___cxa_atexit         @0x3c2453
// None of these is FCP logic; each has a small, fully-known observable effect,
// and every one of them sits on the ONLY path through this function. Throwing
// on them would make the whole unit unreachable — an incompleteness stub for
// work that is in fact completely decoded. So they are transcribed as what
// they do, exactly as the landed `createExtendedColorSpace.ts` unit does for
// its own __cxa_guard-protected Meyers singleton @ProCore 0x205f2/0x2060e:
//   * the guard pair becomes the `metal_sample2d0_s_guard` flag (JS is
//     single-threaded, so acquire can never lose the race and the
//     @0x3c2412 bail-out is dead code);
//   * __cxa_atexit becomes an append to a process-exit destructor list, which
//     is precisely its contract — it records (dtor, obj, dsoHandle) and
//     returns 0. It does NOT invoke the destructor.
// The `__ZN8string_tD1Ev` reference @0x3c2445 is likewise NOT a call — the
// dtor's ADDRESS is the first argument to __cxa_atexit and is never invoked by
// this function. (Its eventual teardown work is nil anyway: the static owns no
// allocation, since +0x10..+0x2f are explicitly zeroed.)
// `depgraph.py deps __ZL17metal_sample2d0_sv` reports no in-scope callee, and
// neither listing contains an indirect or virtual call.
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
  /** +0x00 — `char* data`; set to the literal @0x3c241b. */
  data: string | null;
  /** +0x08 — `size_t len`; set to 0x1ff @0x3c2429. */
  len: number;
  /** +0x10..+0x1f — zeroed @0x3c2437 (the owning-allocator slot and more). */
  zero10: Uint8Array;
  /** +0x20..+0x2f — zeroed @0x3c243e. */
  zero20: Uint8Array;
}

/**
 * The shader source literal at @Helium 0x8dfc19, read byte-for-byte out of the
 * binary (511 bytes + NUL). Its address reaches the static via
 * `leaq 0x51d7fe(%rip), %rax` @0x3c2414 followed by the store @0x3c241b.
 */
const SHADER_STRING_DATA =
  "//Metal1.0     \n" +
  "//LEN=00000001ff\n" +
  "fragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n" +
  "    const constant float4* hg_Params [[ buffer(0) ]], \n" +
  "    texture2d< float > hg_Texture0 [[ texture(0) ]], \n" +
  "    sampler hg_Sampler0 [[ sampler(0) ]])\n" +
  "{\n" +
  "    FragmentOut output;\n" +
  "\n" +
  "    output.color0 = hg_Texture0.sample(hg_Sampler0, frag._texCoord0.xy);\n" +
  "    return output;\n" +
  "}\n" +
  "//MD5=6f669bc0:cf2c4116:fad604f7:6fdb36bb\n" +
  "//SIG=00000000:00000001:00000000:00000000:0000:0000:0000:0000:0000:0000:0002:0000:0001:01:0:1:0\n";

/**
 * The immediate stored into `shader_string.len` by
 * `movq $0x1ff, 0x71b0a4(%rip)` @0x3c2429.
 */
const SHADER_STRING_LEN = 0x1ff;

/**
 * `metal_sample2d0_s()::shader_string` @Helium 0xadd4d0 — the function-local
 * static this unit initialises. Declared with the zeroed state the C++ runtime
 * gives it before the first call; the cold initialiser fills +0x00 and +0x08
 * and re-zeroes +0x10..+0x2f.
 */
export const metal_sample2d0_s_shader_string: MetalShaderStringT = {
  data: null,
  len: 0,
  zero10: new Uint8Array(16),
  zero20: new Uint8Array(16),
};

/**
 * `__ZGVZL17metal_sample2d0_svE13shader_string` — the Itanium-ABI guard byte
 * for the static above. Read by the hot stub @0xbae10 and passed by address to
 * `__cxa_guard_acquire` @0x3c2404 / `__cxa_guard_release` @0x3c2458.
 */
let metal_sample2d0_s_guard = 0;

/**
 * One entry in the Itanium-ABI process-exit destructor list.
 *
 * `dtor` is recorded as the MANGLED SYMBOL NAME of the function whose address
 * the binary passes, not as a callable: this unit only registers the entry, it
 * never runs it, and `string_t::~string_t` is its own ledger unit.
 */
export interface CxaAtexitEntry {
  /** arg1 (%rdi) — the destructor's mangled symbol; loaded @0x3c2445. */
  dtor: string;
  /** arg2 (%rsi) — the object to destroy; `&shader_string`, loaded @0x3c2422. */
  obj: MetalShaderStringT;
  /** arg3 (%rdx) — `__dso_handle`; resolves to 0x0 @0x3c244c. */
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
 * @0x3c2453 through the `symbol stub for: ___cxa_atexit` at 0x3c4fd6 with
 * arg1 = `&string_t::~string_t` (@0x3c2445), arg2 = `&shader_string`
 * (@0x3c2422), arg3 = `__dso_handle` = 0x0 (@0x3c244c).
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
  // @0x3c2453 callq 0x3c4fd6  ## symbol stub for: ___cxa_atexit
  cxaAtexitRegistrations.push({ dtor, obj, dsoHandle });
  return 0;
}

/**
 * `metal_sample2d0_s()` — @Helium 0xbae10 (hot stub) + @Helium 0x3c2400
 * (`.cold.1`, the outlined initialiser). Both halves of the same source
 * function; see the two disassembly listings in the header.
 *
 * Ensures the function-local static `shader_string` holds the canned Metal
 * fragment-shader source. Returns nothing — see the "NOTE ON THE RETURN VALUE"
 * block in the header for why this is `void` and not a `string_t&`.
 *
 * The `__cxa_guard_acquire` / `__cxa_guard_release` pair @0x3c240b/@0x3c2460
 * exists solely to make first-call initialisation thread-safe; JS is
 * single-threaded, so the acquire can never lose the race and the
 * @0x3c2412 `je 0x3c2465` bail-out is unreachable here. That collapse is the
 * same one the landed `createExtendedColorSpace.ts` unit makes for its own
 * __cxa_guard-protected Meyers singleton @ProCore 0x205f2/0x2060e.
 */
export function metal_sample2d0_s(): void {
  // ── hot stub @0xbae10 ────────────────────────────────────────────────
  // @0xbae10 movzbl guard(%rip),%eax / @0xbae17 testb / @0xbae19 je 0xbae1c
  if (metal_sample2d0_s_guard !== 0) {
    // @0xbae1b retq — already initialised.
    return;
  }
  // @0xbae20 callq __ZL17metal_sample2d0_sv.cold.1

  // ── cold initialiser @0x3c2400 ───────────────────────────────────────
  // @0x3c2404-@0x3c240b __cxa_guard_acquire(&guard); @0x3c2410/@0x3c2412
  // je 0x3c2465 on a zero return (another thread already ran the body).
  // Single-threaded here, so acquire always succeeds and that exit is dead.

  // @0x3c2414-@0x3c241b  shader_string.data = the 0x8dfc19 literal
  metal_sample2d0_s_shader_string.data = SHADER_STRING_DATA;
  // @0x3c2429  shader_string.len = 0x1ff
  metal_sample2d0_s_shader_string.len = SHADER_STRING_LEN;
  // @0x3c2434-@0x3c2437  xorps %xmm0,%xmm0 ; movups -> zero +0x10..+0x1f
  metal_sample2d0_s_shader_string.zero10.fill(0);
  // @0x3c243e  movups -> zero +0x20..+0x2f
  metal_sample2d0_s_shader_string.zero20.fill(0);

  // @0x3c2445/@0x3c2422/@0x3c244c/@0x3c2453
  //   __cxa_atexit(&string_t::~string_t, &shader_string, __dso_handle=0)
  __cxa_atexit(
    "__ZN8string_tD1Ev",
    metal_sample2d0_s_shader_string,
    0x0,
  );

  // @0x3c2458-@0x3c2460  tail-jmp __cxa_guard_release(&guard) — publishes the
  // initialised state, which is what the hot stub's @0xbae10 read observes.
  metal_sample2d0_s_guard = 1;
}
