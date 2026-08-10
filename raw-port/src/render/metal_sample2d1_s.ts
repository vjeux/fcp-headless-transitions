// metal_sample2d1_s.ts — Helium internal-linkage free function that lazily
// initialises the function-local `static string_t shader_string` holding the
// Metal fragment-shader source for the "sample2d1" (single-texture passthrough
// sample) program, and returns.
//
// Faithfully transcribed from the FCP Helium framework binary at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/Versions/A/Helium
// Source disassembly:
//   raw-port/re/disasm/Helium.__ZL17metal_sample2d1_sv.s        (hot path, 11 lines)
//   raw-port/re/disasm/Helium.__ZL17metal_sample2d1_svcold1.s   (.cold.1 slow path, 23 lines)
//
// LEDGER (this file's scope):
//   metal_sample2d1_s()           @Helium 0xbae30    __ZL17metal_sample2d1_sv
//   metal_sample2d1_s() .cold.1   @Helium 0x3c2470   __ZL17metal_sample2d1_sv.cold.1
// The `.cold.1` half is the clang-outlined cold portion of the SAME function —
// raw-port/army/tools/depgraph.py canon() (line 47-48) strips the `.cold.N`
// suffix so both halves collapse to one graph node with `deps: []` and three
// out-of-scope externs. Both halves are therefore transcribed here.
//
// THE IDIOM — Itanium C++ ABI function-local static
//   static void metal_sample2d1_s() { static string_t shader_string = "<metal src>"; }
// clang splits this into a hot guard test and a cold one-time initialiser:
//   hot  : if (guardByte == 0) call .cold.1;  return
//   cold : if (__cxa_guard_acquire(&guard)) { construct; __cxa_atexit(dtor,...);
//                                             __cxa_guard_release(&guard); }
//
// STATIC DATA — grounded via `nm -arch x86_64 -n Helium`:
//   0xadd508  b  __ZZL17metal_sample2d1_svE13shader_string   (the string_t object)
//   0xadd538  b  __ZGVZL17metal_sample2d1_svE13shader_string (the 8-byte guard)
//   The object therefore spans 0xadd508..0xadd537 = 0x30 bytes, exactly the
//   three stores emitted by .cold.1 (see the layout comment on StringT below).
//
// RETURN TYPE — the Itanium mangling `__ZL17metal_sample2d1_sv` encodes the
// parameter list (`v` = void) but not the return type. The code materialises NO
// return value on the .cold.1 path (0xbae45 `popq %rbp` / 0xbae46 `retq` leave
// %eax holding whatever .cold.1 left behind), so the function is `void`; the
// %eax residue on the fast path is the dead result of the `movzbl` guard load.
//
// FRONTIER CALLEES (all THREE are TRUE OUT-OF-SCOPE externs — libc++abi, the
// Itanium C++ ABI runtime; they are the `n_extern_oos: 3` the dependency graph
// records for this node):
//   * ___cxa_guard_acquire  @Helium stub 0x3c5000, called @0x3c247b
//   * ___cxa_atexit         @Helium stub 0x3c4fd6, called @0x3c24c3
//   * ___cxa_guard_release  @Helium stub 0x3c5006, tail-jmp @0x3c24d0
// Their behaviour is fully specified by the Itanium C++ ABI, so the two guard
// primitives are modelled exactly (the single-threaded acquire/release state
// machine) rather than deferred — this is the "model the boundary" option the
// G5 gate documents for call_once/guard-style one-time initialisers.
// `__cxa_atexit` only RECORDS (dtor, object, dso) in the process exit list; it
// never runs the destructor, so it is modelled as an append to that list. The
// destructor operand `__ZN8string_tD1Ev` is passed by ADDRESS only (`leaq`
// @0x3c24b5) and is never called from either half of this function, so it is
// recorded as a symbolic code-pointer descriptor, not invoked.

/**
 * `string_t` byte-layout model — ONLY the 0x30 bytes this function writes.
 *
 * This is not a port of Helium's `string_t` class (its methods, including
 * `string_t::~string_t` @Helium `__ZN8string_tD1Ev`, are separate ledger
 * units); it is the field map recovered from the three stores that .cold.1
 * emits into `metal_sample2d1_s()::shader_string` @0xadd508:
 *
 *   +0x00  const char* data      8 B  — `movq %rax, ...` @0x3c248b
 *   +0x08  size_t      length    8 B  — `movq $0x1ff, ...` @0x3c2499
 *   +0x10  16 zero bytes              — `movups %xmm0, ...` @0x3c24a7
 *   +0x20  16 zero bytes              — `movups %xmm0, ...` @0x3c24ae
 *
 * The two 16-byte `movups` of a `xorps`-cleared %xmm0 zero-fill +0x10..+0x2f;
 * the interior of that range is not otherwise touched by this function, so it
 * is modelled as raw bytes rather than given invented field names.
 */
export interface StringT {
  /** [+0x00] pointer to the NUL-terminated character data. */
  data_at_0x00: string | null;
  /** [+0x08] byte length of the data (excluding the NUL terminator). */
  length_at_0x08: bigint;
  /** [+0x10] 16 bytes zero-filled by the `movups` @0x3c24a7. */
  bytes_at_0x10: Uint8Array;
  /** [+0x20] 16 bytes zero-filled by the `movups` @0x3c24ae. */
  bytes_at_0x20: Uint8Array;
}

/**
 * The Metal fragment-shader source stored into `shader_string` +0x00.
 *
 * Read verbatim out of the Helium x86_64 slice at the literal-pool address
 * resolved from `leaq 0x51d98e(%rip), %rax` @0x3c2484:
 *   0x3c2484 + 7 (instruction length) + 0x51d98e = @Helium 0x8dfe19
 * It is 511 bytes long, which is exactly the 0x1ff stored at +0x08 @0x3c2499
 * and also exactly the value the shader's own `//LEN=00000001ff` header
 * declares. Split one source line per string so the transcription can be
 * diffed against the literal byte for byte (note the trailing spaces the
 * original carries before three of the newlines).
 */
const SHADER_STRING_DATA: string =
  // @Helium 0x8dfe19 — literal pool, 0x1ff bytes.
  "//Metal1.0     \n" +
  "//LEN=00000001ff\n" +
  "fragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n" +
  "    const constant float4* hg_Params [[ buffer(0) ]], \n" +
  "    texture2d< float > hg_Texture1 [[ texture(1) ]], \n" +
  "    sampler hg_Sampler1 [[ sampler(1) ]])\n" +
  "{\n" +
  "    FragmentOut output;\n" +
  "\n" +
  "    output.color0 = hg_Texture1.sample(hg_Sampler1, frag._texCoord1.xy);\n" +
  "    return output;\n" +
  "}\n" +
  "//MD5=337083c6:b5efb30c:e0498c87:962e883b\n" +
  "//SIG=00000000:00000002:00000000:00000000:0000:0000:0000:0000:0000:0000:0004:0000:0002:02:0:1:0\n";

/**
 * `metal_sample2d1_s()::shader_string` — @Helium 0xadd508 (`__DATA,__bss`,
 * symbol `__ZZL17metal_sample2d1_svE13shader_string`, 0x30 bytes).
 *
 * BSS, so zero-initialised before the one-time initialiser runs. Exported so
 * the peer Helium code that reads this program source (and the `.cold.1`
 * destructor registration below) can observe the same object identity the
 * binary does through its fixed address.
 */
export const shader_string: StringT = {
  data_at_0x00: null,
  length_at_0x08: 0n,
  bytes_at_0x10: new Uint8Array(16),
  bytes_at_0x20: new Uint8Array(16),
};

/**
 * `guard variable for metal_sample2d1_s()::shader_string` — @Helium 0xadd538
 * (`__DATA,__bss`, symbol `__ZGVZL17metal_sample2d1_svE13shader_string`).
 *
 * The Itanium C++ ABI guard is a 64-bit object whose FIRST byte is the
 * "initialisation complete" flag; the hot path reads exactly that byte with
 * `movzbl ...(%rip), %eax` @0xbae30. Modelled as the whole 8-byte object so
 * `__cxa_guard_acquire`/`__cxa_guard_release` can manipulate it as the ABI
 * specifies, with the low byte being what the hot path tests.
 */
const shader_string_guard: { value: bigint } = { value: 0n };

/**
 * One entry appended by `__cxa_atexit` — the destructor registration the
 * Itanium C++ ABI records for a function-local static with a non-trivial
 * destructor. `__cxa_atexit` stores the triple and returns; the destructor
 * runs only at process teardown, which is why `dtorSymbol` here is a
 * symbolic code pointer (the operand of the `leaq` @0x3c24b5) and is never
 * invoked by this unit.
 */
export interface CxaAtexitEntry {
  /** %rdi @0x3c24b5 — `leaq __ZN8string_tD1Ev(%rip), %rdi`, the destructor. */
  dtorSymbol: string;
  /** %rsi @0x3c2492 — `leaq shader_string(%rip), %rsi`, the object. */
  object: StringT;
  /** %rdx @0x3c24bc — `leaq -0x3c24c3(%rip), %rdx` => 0x3c24c3 + 7 - 0x3c24c3
   *  = 0x0, i.e. `__dso_handle` (the Helium mach-header address). */
  dsoHandle: bigint;
}

/**
 * The process-wide `__cxa_atexit` registration list (libc++abi runtime state).
 * Appended to by the `___cxa_atexit` boundary below; never drained here, since
 * nothing in this translation unit runs process teardown.
 */
export const cxaAtexitRegistrations: CxaAtexitEntry[] = [];

/**
 * `___cxa_guard_acquire(__guard*)` — libc++abi, @Helium stub 0x3c5000,
 * called from `.cold.1` @0x3c247b with %rdi = &guard (`leaq` @0x3c2474).
 *
 * Itanium C++ ABI semantics: returns 1 if the caller must run the initialiser
 * (the guard's completion byte is still 0 and this caller won the race), 0 if
 * initialisation is already complete. Single-threaded JavaScript has no other
 * racing thread, so the exact ABI state machine reduces to "claim it if the
 * completion byte is clear" — no blocking path is reachable.
 *
 * TRUE OUT-OF-SCOPE extern (libc++abi / Itanium C++ ABI runtime), modelled
 * rather than deferred because the ABI pins its behaviour exactly.
 */
function ___cxa_guard_acquire(guard: { value: bigint }): number {
  // @Helium stub 0x3c5000 — the guard's completion flag is its low byte.
  return (guard.value & 0xffn) === 0n ? 1 : 0;
}

/**
 * `___cxa_guard_release(__guard*)` — libc++abi, @Helium stub 0x3c5006,
 * tail-jumped from `.cold.1` @0x3c24d0 with %rdi = &guard (`leaq` @0x3c24c8).
 *
 * Itanium C++ ABI semantics: mark initialisation complete by setting the
 * guard's low byte to 1, so every later call takes the hot path's early
 * `retq` @0xbae3b. TRUE OUT-OF-SCOPE extern, modelled per the ABI.
 */
function ___cxa_guard_release(guard: { value: bigint }): void {
  // @Helium stub 0x3c5006 — set the completion byte, preserving the rest.
  guard.value = (guard.value & ~0xffn) | 1n;
}

/**
 * `___cxa_atexit(void (*dtor)(void*), void* obj, void* dso)` — libc++abi,
 * @Helium stub 0x3c4fd6, called from `.cold.1` @0x3c24c3.
 *
 * Itanium C++ ABI semantics: append (dtor, obj, dso) to the process exit
 * list and return 0 on success. It does NOT call `dtor`. TRUE OUT-OF-SCOPE
 * extern (libc++abi), modelled as that append so the observable effect of
 * the instruction — one more registered destructor — is preserved without
 * fabricating `string_t::~string_t`, which is a separate ledger unit and is
 * only ever passed by address here.
 */
function ___cxa_atexit(dtorSymbol: string, object: StringT, dsoHandle: bigint): number {
  // @Helium stub 0x3c4fd6 — record the triple; the destructor is not run.
  cxaAtexitRegistrations.push({ dtorSymbol, object, dsoHandle });
  return 0;
}

/**
 * `metal_sample2d1_s() [.cold.1]` — @Helium 0x3c2470
 *   __ZL17metal_sample2d1_sv.cold.1
 *
 * DECODE (raw-port/re/disasm/Helium.__ZL17metal_sample2d1_svcold1.s):
 *
 *   0x3c2470  pushq  %rbp                          ; prologue
 *   0x3c2471  movq   %rsp, %rbp
 *   0x3c2474  leaq   ...E13shader_string(%rip),%rdi ; %rdi = &guard  @0xadd538
 *   0x3c247b  callq  0x3c5000                      ; ___cxa_guard_acquire
 *   0x3c2480  testl  %eax, %eax
 *   0x3c2482  je     0x3c24d5                      ; already initialised -> return
 *   0x3c2484  leaq   0x51d98e(%rip), %rax          ; %rax = literal @0x8dfe19
 *   0x3c248b  movq   %rax, ...E13shader_string(%rip) ; shader_string[+0x00] = data
 *   0x3c2492  leaq   ...E13shader_string(%rip),%rsi ; %rsi = &shader_string @0xadd508
 *   0x3c2499  movq   $0x1ff, 0x71b06c(%rip)        ; shader_string[+0x08] = 0x1ff  (-> 0xadd510)
 *   0x3c24a4  xorps  %xmm0, %xmm0                  ; %xmm0 = 0
 *   0x3c24a7  movups %xmm0, 0x71b06a(%rip)         ; shader_string[+0x10..0x1f] = 0 (-> 0xadd518)
 *   0x3c24ae  movups %xmm0, 0x71b073(%rip)         ; shader_string[+0x20..0x2f] = 0 (-> 0xadd528)
 *   0x3c24b5  leaq   __ZN8string_tD1Ev(%rip),%rdi  ; %rdi = &string_t::~string_t
 *   0x3c24bc  leaq   -0x3c24c3(%rip), %rdx         ; %rdx = 0x0 = __dso_handle
 *   0x3c24c3  callq  0x3c4fd6                      ; ___cxa_atexit(dtor, obj, dso)
 *   0x3c24c8  leaq   ...E13shader_string(%rip),%rdi ; %rdi = &guard  @0xadd538
 *   0x3c24cf  popq   %rbp                          ; epilogue before the tail jmp
 *   0x3c24d0  jmp    0x3c5006                      ; ___cxa_guard_release(&guard)
 *   0x3c24d5  popq   %rbp                          ; the je 0x3c24d5 landing pad
 *   0x3c24d6  retq
 *
 * Each RIP-relative store target was resolved as VA = instr + instr_len + disp
 * (raw-port/army/tools/resolve.py Helium ripconst), and the base 0xadd508 /
 * guard 0xadd538 were confirmed independently by `nm -arch x86_64 -n`, which
 * also pins the object's size at 0x30 bytes (0xadd538 - 0xadd508).
 *
 * NOTE the ordering the compiler chose: the `movq $0x1ff` and the two `movups`
 * come AFTER the `leaq` of %rsi (the __cxa_atexit object argument) so that the
 * argument register is set up while the stores retire; the writes themselves
 * are ordered +0x00, +0x08, +0x10, +0x20. Transcribed in that order.
 */
function metal_sample2d1_s_cold1(): void {
  // @0x3c2474..0x3c247b  __cxa_guard_acquire(&guard).
  const acquired: number = ___cxa_guard_acquire(shader_string_guard);
  // @0x3c2480  testl %eax,%eax  /  @0x3c2482  je 0x3c24d5
  if (acquired === 0) {
    // @0x3c24d5  popq %rbp  /  @0x3c24d6  retq — someone else initialised it.
    return;
  }
  // @0x3c2484  leaq 0x51d98e(%rip),%rax   ; the literal @0x8dfe19
  // @0x3c248b  movq %rax, shader_string(%rip)
  shader_string.data_at_0x00 = SHADER_STRING_DATA;
  // @0x3c2492  leaq shader_string(%rip),%rsi  ; the __cxa_atexit object arg
  const objectArg: StringT = shader_string;
  // @0x3c2499  movq $0x1ff, 0x71b06c(%rip)   ; -> 0xadd510 = shader_string+0x08
  shader_string.length_at_0x08 = 0x1ffn;
  // @0x3c24a4  xorps %xmm0,%xmm0
  // @0x3c24a7  movups %xmm0, 0x71b06a(%rip)  ; -> 0xadd518 = shader_string+0x10
  shader_string.bytes_at_0x10.fill(0);
  // @0x3c24ae  movups %xmm0, 0x71b073(%rip)  ; -> 0xadd528 = shader_string+0x20
  shader_string.bytes_at_0x20.fill(0);
  // @0x3c24b5  leaq __ZN8string_tD1Ev(%rip),%rdi ; destructor, by address only
  // @0x3c24bc  leaq -0x3c24c3(%rip),%rdx         ; __dso_handle = 0x0
  // @0x3c24c3  callq ___cxa_atexit
  ___cxa_atexit("__ZN8string_tD1Ev", objectArg, 0x0n);
  // @0x3c24c8  leaq guard(%rip),%rdi
  // @0x3c24cf  popq %rbp  /  @0x3c24d0  jmp ___cxa_guard_release  (tail call)
  ___cxa_guard_release(shader_string_guard);
}

/**
 * `metal_sample2d1_s()` — @Helium 0xbae30
 *   __ZL17metal_sample2d1_sv
 *
 * DECODE (raw-port/re/disasm/Helium.__ZL17metal_sample2d1_sv.s):
 *
 *   0xbae30  movzbl ...E13shader_string(%rip),%eax ; %eax = guard byte @0xadd538
 *   0xbae37  testb  %al, %al
 *   0xbae39  je     0xbae3c                        ; guard == 0 -> run the initialiser
 *   0xbae3b  retq                                  ; guard != 0 -> already done
 *   0xbae3c  pushq  %rbp                           ; frame only for the cold call
 *   0xbae3d  movq   %rsp, %rbp
 *   0xbae40  callq  __ZL17metal_sample2d1_sv.cold.1 ; @0x3c2470
 *   0xbae45  popq   %rbp
 *   0xbae46  retq
 *
 * The whole hot path is the Itanium guard fast test: load the guard's low byte
 * with a zero-extending `movzbl`, and skip straight to `retq` once it is
 * non-zero. Only the first call ever enters the frame and reaches `.cold.1`.
 * No value is produced for a caller on either path (see the module header).
 *
 * Zero in-scope callees; the three externs reached through `.cold.1` are
 * libc++abi Itanium C++ ABI primitives (see the module header).
 */
export function metal_sample2d1_s(): void {
  // @0xbae30  movzbl guard(%rip),%eax  /  @0xbae37  testb %al,%al
  // @0xbae39  je 0xbae3c — taken when the guard's completion byte is 0.
  if ((shader_string_guard.value & 0xffn) === 0n) {
    // @0xbae3c..0xbae40  frame + callq .cold.1 (the one-time initialiser).
    metal_sample2d1_s_cold1();
    // @0xbae45  popq %rbp  /  @0xbae46  retq
    return;
  }
  // @0xbae3b  retq — guard byte non-zero: shader_string is already built.
}
