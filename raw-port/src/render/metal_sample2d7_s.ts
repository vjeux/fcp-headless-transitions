// metal_sample2d7_s.ts — Helium's file-local `metal_sample2d7_s()` (render layer).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//         Versions/A/Helium  (macOS FCP, x86_64 slice; fat-slice file offset +0x4000).
//
// -----------------------------------------------------------------------------
// SYMBOLS PORTED
// -----------------------------------------------------------------------------
//   * metal_sample2d7_s()                        @Helium 0xbaef0
//     __ZL17metal_sample2d7_sv        ("__ZL" = internal linkage / file-static)
//   * metal_sample2d7_s() [.cold.1]              @Helium 0x3c2710
//     __ZL17metal_sample2d7_sv.cold.1 (the outlined first-call slow path)
//
// re/disasm:
//   raw-port/re/disasm/Helium.__ZL17metal_sample2d7_sv.s        (11 lines)
//   raw-port/re/disasm/Helium.__ZL17metal_sample2d7_svcold1.s   (23 lines)
//
// Data symbols this pair owns (addresses from `nm -arch x86_64 -n Helium`):
//   0xadd658 b __ZZL17metal_sample2d7_svE13shader_string   (the function-local static)
//   0xadd688 b __ZGVZL17metal_sample2d7_svE13shader_string (its Itanium guard variable)
//   0x8e0a19   __TEXT,__cstring literal — the Metal fragment shader source (511 bytes)
//
// -----------------------------------------------------------------------------
// FULL DISASM — hot path (11 lines, @0xbaef0..@0xbaf07)
// -----------------------------------------------------------------------------
//   __ZL17metal_sample2d7_sv:
//     0xbaef0  movzbl __ZGVZL17metal_sample2d7_svE13shader_string(%rip), %eax
//                                               ; al = guard byte @0xadd688
//     0xbaef7  testb  %al, %al
//     0xbaef9  je     0xbaefc                   ; guard == 0 -> first call, run .cold.1
//     0xbaefb  retq                             ; already initialised -> nothing to do
//     0xbaefc  pushq  %rbp
//     0xbaefd  movq   %rsp, %rbp
//     0xbaf00  callq  __ZL17metal_sample2d7_sv.cold.1
//     0xbaf05  popq   %rbp
//     0xbaf06  retq
//     0xbaf07  nopw   (%rax,%rax)               ; alignment padding
//
// RETURN TYPE IS `void`. The Itanium mangling `__ZL17metal_sample2d7_sv` does not
// encode a return type, so it is recovered from the body: the already-initialised
// path falls straight through to `retq` with %eax still holding the *guard byte*
// loaded by the `movzbl` (value 1) and never materialises `shader_string`'s
// address (no `leaq shader_string(%rip), %rax` on that path — the only such leaq,
// @0x3c2732, is inside `.cold.1` and feeds `%rsi`, the ___cxa_atexit object
// argument). A function returning `string_t&`/`char const*` would have to load
// that address on BOTH paths. So the only effect of calling it is "make sure the
// static is constructed".
//
// -----------------------------------------------------------------------------
// FULL DISASM — .cold.1 first-call slow path (23 lines, @0x3c2710..@0x3c2777)
// -----------------------------------------------------------------------------
//   __ZL17metal_sample2d7_sv.cold.1:
//     0x3c2710  pushq  %rbp
//     0x3c2711  movq   %rsp, %rbp
//     0x3c2714  leaq   guard(%rip), %rdi              ; &guard @0xadd688
//     0x3c271b  callq  0x3c5000                       ; stub: ___cxa_guard_acquire
//     0x3c2720  testl  %eax, %eax
//     0x3c2722  je     0x3c2775                       ; 0 -> another thread built it; return
//     0x3c2724  leaq   0x51e2ee(%rip), %rax           ; = 0x3c272b + 0x51e2ee = 0x8e0a19
//                                                     ;   the 511-byte shader literal
//     0x3c272b  movq   %rax, shader_string(%rip)      ; shader_string[+0x00].data = literal
//     0x3c2732  leaq   shader_string(%rip), %rsi      ; %rsi = &shader_string (atexit arg)
//     0x3c2739  movq   $0x1ff, 0x71af1c(%rip)         ; = 0x3c2744 + 0x71af1c = 0xadd660
//                                                     ;   shader_string[+0x08].len = 0x1ff (511)
//     0x3c2744  xorps  %xmm0, %xmm0
//     0x3c2747  movups %xmm0, 0x71af1a(%rip)          ; = 0x3c274e + 0x71af1a = 0xadd668
//                                                     ;   zero shader_string[+0x10 .. +0x1f]
//     0x3c274e  movups %xmm0, 0x71af23(%rip)          ; = 0x3c2755 + 0x71af23 = 0xadd678
//                                                     ;   zero shader_string[+0x20 .. +0x2f]
//     0x3c2755  leaq   __ZN8string_tD1Ev(%rip), %rdi  ; arg0 = &string_t::~string_t @0xd98e0
//     0x3c275c  leaq   -0x3c2763(%rip), %rdx          ; = 0x3c2763 - 0x3c2763 = 0x0
//                                                     ;   arg2 = __dso_handle (image base)
//     0x3c2763  callq  0x3c4fd6                       ; stub: ___cxa_atexit(dtor, &obj, dso)
//     0x3c2768  leaq   guard(%rip), %rdi
//     0x3c276f  popq   %rbp
//     0x3c2770  jmp    0x3c5006                       ; tail-call stub: ___cxa_guard_release
//     0x3c2775  popq   %rbp
//     0x3c2776  retq
//     0x3c2777  nopw   (%rax,%rax)                    ; alignment padding
//
// -----------------------------------------------------------------------------
// STRUCT EXTENT — `string_t` is 0x30 bytes (pinned HERE, not guessed)
// -----------------------------------------------------------------------------
// The static occupies exactly [0xadd658, 0xadd688) — the next symbol in the
// `nm -n` ordering is its own guard variable at 0xadd688 — and the constructor
// above writes every one of those 0x30 bytes:
//     +0x00  char const*  data   = the 511-byte literal @0x8e0a19   (0x3c272b)
//     +0x08  uint64       len    = 0x1ff                            (0x3c2739)
//     +0x10  16 bytes     zeroed                                    (0x3c2747)
//     +0x20  16 bytes     zeroed                                    (0x3c274e)
// raw-port/src/channels/glsl.ts decodes the SAME C++ `string_t` from its four
// glsl:: methods and pins the first 0x18 bytes (data @+0x00, len @+0x08,
// alloc @+0x10). This site is consistent with that and extends the known extent
// from 0x18 to 0x30. It is NOT imported from glsl.ts: that view stops at +0x18,
// so it cannot express the +0x18..+0x2f bytes this constructor demonstrably
// writes, and src/render/ has no cross-layer imports.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
// Three, all TRUE OUT-OF-SCOPE externs reached through __TEXT symbol stubs
// (they are `U` undefined symbols in Helium's symbol table — libc++abi/libSystem,
// not Helium/ProCore/ProChannel/Ozone/Flexo code):
//   ___cxa_guard_acquire  @stub 0x3c5000  (called @0x3c271b)
//   ___cxa_atexit         @stub 0x3c4fd6  (called @0x3c2763)
//   ___cxa_guard_release  @stub 0x3c5006  (tail-jmp @0x3c2770)
// They are modelled below (the Itanium C++ ABI defines their semantics exactly),
// NOT thrown — throwing would make the only observable effect of this function
// unreachable. The one genuinely undecoded symbol, `string_t::~string_t`
// @Helium 0xd98e0, is only ADDRESS-TAKEN here (@0x3c2755, handed to
// ___cxa_atexit) and never called; it is registered as a throwing thunk so the
// gap stays loud (PORTING_SPEC Rule 3). No in-scope callee, no indirect/virtual
// call: `callq` targets are the outlined .cold.1 (transcribed here) plus the
// three stubs above.

/**
 * `string_t` — Helium's own string header, as pinned by THIS decode site:
 * a 0x30-byte POD whose constructor here writes a `char const*` at +0x00, a
 * `uint64` length at +0x08, and zeroes the remaining 0x20 bytes.
 *
 * `src/channels/glsl.ts` decodes the same C++ type from the glsl:: writers and
 * names the +0x10 slot `alloc` (the growable-buffer descriptor). That is
 * consistent with the zero written here: a literal-backed string owns no
 * heap allocation, so its allocator slot starts null.
 */
export interface StringT {
  /**
   * @Helium shader_string +0x00 — `char const*` payload. Written @0x3c272b by
   * `movq %rax, shader_string(%rip)` where %rax was loaded @0x3c2724 with the
   * address of the __cstring literal at 0x8e0a19. Held as a JS string because
   * the literal is 511 bytes of ASCII Metal source and every consumer reads it
   * as text; `null` reproduces the pre-construction .bss zero.
   */
  data: string | null;
  /**
   * @Helium shader_string +0x08 — `uint64` byte length. Written @0x3c2739 by
   * `movq $0x1ff, 0x71af1c(%rip)`. 0x1ff = 511, which is exactly the literal's
   * NUL-free byte count and matches the `//LEN=00000001ff` header the shader
   * text carries in its own first lines.
   */
  len: bigint;
  /**
   * @Helium shader_string +0x10 — the allocator/buffer descriptor slot
   * (`alloc` in the glsl.ts decode of the same `string_t`). Zeroed @0x3c2747 by
   * the first `movups %xmm0, ...`, so a literal-backed string_t starts with no
   * owned buffer.
   */
  alloc_at_0x10: null;
  /**
   * @Helium shader_string +0x18 — the upper half of the 16-byte zero store
   * @0x3c2747. Undecoded field (no site in this pair reads it); modelled as the
   * raw zero the constructor writes rather than being omitted, because the
   * store is real and the struct extent is pinned by symbol adjacency.
   */
  zero_at_0x18: bigint;
  /**
   * @Helium shader_string +0x20 — lower half of the second 16-byte zero store
   * @0x3c274e. Undecoded field; see `zero_at_0x18`.
   */
  zero_at_0x20: bigint;
  /**
   * @Helium shader_string +0x28 — upper half of the second 16-byte zero store
   * @0x3c274e. This is the last byte-range before the guard variable at
   * 0xadd688, so it closes the 0x30-byte object. See `zero_at_0x18`.
   */
  zero_at_0x28: bigint;
}

/**
 * The 511-byte Metal fragment-shader source at __TEXT,__cstring 0x8e0a19,
 * transcribed byte-for-byte (verified: 511 bytes to the NUL terminator, which
 * is the 0x1ff stored into `shader_string.len` @0x3c2739).
 *
 * The address is materialised @0x3c2724 by `leaq 0x51e2ee(%rip), %rax`
 * (0x3c272b + 0x51e2ee = 0x8e0a19) and stored into the static @0x3c272b.
 *
 * This is the texture-unit-7 member of Helium's `metal_sample2dN_s` family: the
 * body is a single `hg_Texture7.sample(hg_Sampler7, frag._texCoord7.xy)`
 * passthrough. Its second SIG field is `00000080` = 1 << 7, the used-texture
 * bitmask for unit 7 — the same slot that reads `00000010` = 1 << 4 in the
 * unit-4 sibling `metal_sample2d4_s` @Helium 0xbae90.
 *
 * @0xADDR Helium 0x8e0a19
 */
export const SHADER_STRING_LITERAL_0x8e0a19 =
  '//Metal1.0     \n' +
  '//LEN=00000001ff\n' +
  'fragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n' +
  '    const constant float4* hg_Params [[ buffer(0) ]], \n' +
  '    texture2d< float > hg_Texture7 [[ texture(7) ]], \n' +
  '    sampler hg_Sampler7 [[ sampler(7) ]])\n' +
  '{\n' +
  '    FragmentOut output;\n' +
  '\n' +
  '    output.color0 = hg_Texture7.sample(hg_Sampler7, frag._texCoord7.xy);\n' +
  '    return output;\n' +
  '}\n' +
  '//MD5=5dc21ffb:da771f51:4ded01d3:f8c247ab\n' +
  '//SIG=00000000:00000080:00000000:00000000:0000:0000:0000:0000:0000:0000:0100:0000:0008:08:0:1:0\n';

/**
 * `metal_sample2d7_s()::shader_string` — the function-local static at
 * @Helium 0xadd658 (`__ZZL17metal_sample2d7_svE13shader_string`).
 *
 * Declared here in its PRE-CONSTRUCTION state: it lives in .bss, so every byte
 * is zero until `.cold.1` runs. `metal_sample2d7_s()` is the only writer.
 *
 * @0xADDR Helium 0xadd658
 */
export const shader_string: StringT = {
  data: null,
  len: 0n,
  alloc_at_0x10: null,
  zero_at_0x18: 0n,
  zero_at_0x20: 0n,
  zero_at_0x28: 0n,
};

/**
 * `__ZGVZL17metal_sample2d7_svE13shader_string` — the Itanium guard variable at
 * @Helium 0xadd688. Only its low byte is used: the hot path reads it with
 * `movzbl` @0xbaef0 and `___cxa_guard_acquire`/`___cxa_guard_release` own the
 * transitions. 0 = not yet constructed, 1 = constructed.
 *
 * @0xADDR Helium 0xadd688
 */
let guard_at_0xadd688 = 0;

/**
 * True while `.cold.1` is between `___cxa_guard_acquire` and
 * `___cxa_guard_release`. The Itanium ABI keeps this "in progress" state in the
 * guard variable's second byte; the disassembly never touches that byte
 * directly (only the ABI functions do), so it is modelled as its own flag
 * rather than fabricating a layout for bytes the code does not read.
 *
 * @0xADDR Helium 0x3c271b (acquire) / 0x3c2770 (release)
 */
let guard_in_progress_at_0xadd688 = false;

/**
 * `___cxa_guard_acquire(guard)` — libc++abi extern, reached through the __TEXT
 * symbol stub at @Helium 0x3c5000 (called @0x3c271b). A TRUE out-of-scope
 * extern (`U ___cxa_guard_acquire` in Helium's symbol table).
 *
 * Itanium C++ ABI contract, modelled exactly: returns 1 if the caller must run
 * the initialiser (guard byte still 0 and no other thread is initialising), 0
 * if the object is already constructed. JS is single-threaded, so the
 * "another thread is initialising" arm can only be reached by re-entrancy;
 * that case is what `guard_in_progress_at_0xadd688` models.
 *
 * @0xADDR Helium 0x3c5000
 */
function cxa_guard_acquire_0x3c5000(): number {
  if (guard_at_0xadd688 !== 0) {
    // Already constructed — the ABI returns 0 and the caller skips the body.
    return 0;
  }
  if (guard_in_progress_at_0xadd688) {
    // Recursive initialisation: the real ABI calls std::terminate here. We keep
    // the gap loud rather than inventing a return value.
    throw new Error(
      '___cxa_guard_acquire @Helium 0x3c5000: recursive initialisation of ' +
        'metal_sample2d7_s()::shader_string @0xadd658 (the Itanium ABI terminates)',
    );
  }
  guard_in_progress_at_0xadd688 = true;
  return 1;
}

/**
 * `___cxa_guard_release(guard)` — libc++abi extern, reached through the __TEXT
 * symbol stub at @Helium 0x3c5006 (tail-jumped @0x3c2770). Publishes the
 * construction by setting the guard byte to 1.
 *
 * @0xADDR Helium 0x3c5006
 */
function cxa_guard_release_0x3c5006(): void {
  guard_in_progress_at_0xadd688 = false;
  guard_at_0xadd688 = 1;
}

/**
 * `string_t::~string_t()` — @Helium 0xd98e0 (`__ZN8string_tD1Ev`). NOT YET
 * TRANSCRIBED: `.cold.1` only takes its ADDRESS (@0x3c2755) to hand to
 * `___cxa_atexit`; the body is a separate ledger unit. Registered as a throwing
 * thunk so that if the atexit chain is ever driven the gap is loud instead of
 * silently skipped (PORTING_SPEC Rule 3).
 *
 * @0xADDR Helium 0xd98e0
 */
function string_t_dtor_0xd98e0(_obj: StringT): never {
  throw new Error(
    'string_t::~string_t (__ZN8string_tD1Ev) @Helium 0xd98e0 not yet transcribed ' +
      '— registered by metal_sample2d7_s().cold.1 @Helium 0x3c2763',
  );
}

/**
 * One entry of the `___cxa_atexit` chain: the destructor, the object it runs
 * on, and the DSO handle the registration was scoped to.
 */
export interface CxaAtexitRegistration {
  /** arg0 — `leaq __ZN8string_tD1Ev(%rip), %rdi` @0x3c2755. */
  dtor: (obj: StringT) => void;
  /** arg1 — `leaq shader_string(%rip), %rsi` @0x3c2732. */
  obj: StringT;
  /** arg2 — `leaq -0x3c2763(%rip), %rdx` @0x3c275c = 0x0, the `__dso_handle`. */
  dsoHandle: number;
}

/**
 * The registrations this translation unit has made through
 * `___cxa_atexit` @stub Helium 0x3c4fd6. Exported (not discarded) so the
 * teardown obligation the binary records stays visible to the port; nothing
 * in this file drives the chain, exactly as nothing in `.cold.1` does.
 *
 * @0xADDR Helium 0x3c2763
 */
export const cxaAtexitRegistrations: CxaAtexitRegistration[] = [];

/**
 * `___cxa_atexit(dtor, obj, dsoHandle)` — libc++abi/libSystem extern, reached
 * through the __TEXT symbol stub at @Helium 0x3c4fd6 (called @0x3c2763). A TRUE
 * out-of-scope extern (`U ___cxa_atexit` in Helium's symbol table). Its entire
 * documented effect is to push (dtor, obj, dsoHandle) onto the process's
 * destructor chain, to be run at exit or dlclose — which is what this models.
 *
 * @0xADDR Helium 0x3c4fd6
 */
function cxa_atexit_0x3c4fd6(
  dtor: (obj: StringT) => void,
  obj: StringT,
  dsoHandle: number,
): void {
  cxaAtexitRegistrations.push({ dtor, obj, dsoHandle });
}

/**
 * `metal_sample2d7_s() [.cold.1]` — @Helium 0x3c2710
 * (`__ZL17metal_sample2d7_sv.cold.1`).
 *
 * The outlined first-call slow path: acquire the guard, construct
 * `shader_string` from the 511-byte literal, register the destructor with
 * `___cxa_atexit`, release the guard. Line-for-line transcription of the
 * 23-line disassembly quoted in the file header.
 *
 * @0xADDR Helium 0x3c2710
 */
function metal_sample2d7_s_cold_1(): void {
  // @0x3c2714  leaq guard(%rip), %rdi
  // @0x3c271b  callq ___cxa_guard_acquire
  // @0x3c2720  testl %eax, %eax
  // @0x3c2722  je    0x3c2775        ; 0 -> already built by someone else: return
  if (cxa_guard_acquire_0x3c5000() === 0) {
    // @0x3c2775  popq %rbp
    // @0x3c2776  retq
    return;
  }
  // @0x3c2724  leaq 0x51e2ee(%rip), %rax   ; %rax = 0x8e0a19 (the literal)
  // @0x3c272b  movq %rax, shader_string(%rip)
  shader_string.data = SHADER_STRING_LITERAL_0x8e0a19;
  // @0x3c2732  leaq shader_string(%rip), %rsi   ; %rsi = &shader_string, held for the atexit call
  const atexitObject = shader_string;
  // @0x3c2739  movq $0x1ff, 0xadd660    ; shader_string.len = 511
  shader_string.len = 0x1ffn;
  // @0x3c2744  xorps  %xmm0, %xmm0
  // @0x3c2747  movups %xmm0, 0xadd668   ; zero +0x10..+0x1f
  shader_string.alloc_at_0x10 = null;
  shader_string.zero_at_0x18 = 0n;
  // @0x3c274e  movups %xmm0, 0xadd678   ; zero +0x20..+0x2f
  shader_string.zero_at_0x20 = 0n;
  shader_string.zero_at_0x28 = 0n;
  // @0x3c2755  leaq __ZN8string_tD1Ev(%rip), %rdi   ; arg0 = &string_t::~string_t
  // @0x3c275c  leaq -0x3c2763(%rip), %rdx           ; arg2 = __dso_handle = 0x0
  // @0x3c2763  callq ___cxa_atexit
  cxa_atexit_0x3c4fd6(string_t_dtor_0xd98e0, atexitObject, 0x0);
  // @0x3c2768  leaq guard(%rip), %rdi
  // @0x3c276f  popq %rbp
  // @0x3c2770  jmp  ___cxa_guard_release            ; tail call
  cxa_guard_release_0x3c5006();
}

/**
 * `metal_sample2d7_s()` — @Helium 0xbaef0 (`__ZL17metal_sample2d7_sv`).
 *
 * Faithful line-for-line transcription of the 11-line hot path quoted in the
 * file header. A guard-check trampoline for the function-local static
 * `shader_string`: read the guard byte, and if it is still zero call the
 * outlined `.cold.1` that constructs the string.
 *
 * After it returns, `shader_string` @0xadd658 holds the 511-byte Metal
 * fragment-shader source (a single `hg_Texture7.sample(hg_Sampler7,
 * frag._texCoord7.xy)` passthrough into `output.color0`).
 *
 * No in-scope callee. Three out-of-scope externs, all inside `.cold.1`:
 * `___cxa_guard_acquire` @stub 0x3c5000, `___cxa_atexit` @stub 0x3c4fd6,
 * `___cxa_guard_release` @stub 0x3c5006. No indirect/virtual call.
 *
 * @0xADDR Helium 0xbaef0
 */
export function metal_sample2d7_s(): void {
  // @0xbaef0  movzbl guard(%rip), %eax   ; al = guard byte @0xadd688
  // @0xbaef7  testb  %al, %al
  // @0xbaef9  je     0xbaefc             ; zero -> first call
  if (guard_at_0xadd688 !== 0) {
    // @0xbaefb  retq                     ; already constructed
    return;
  }
  // @0xbaf00  callq __ZL17metal_sample2d7_sv.cold.1
  // @0xbaf05  popq  %rbp
  // @0xbaf06  retq
  metal_sample2d7_s_cold_1();
}
