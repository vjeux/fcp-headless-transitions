// raw-port/src/render/metal_sample2d3_half_s.ts
//
// FCP Helium file-static free function `metal_sample2d3_half_s()` — the
// compiler-outlined lazy initializer for the function-local static
// `metal_sample2d3_half_s()::shader_string`, a `string_t` holding the baked
// Metal fragment-shader source for the HALF-PRECISION variant of the
// "sample texture 3" pass-through program (`texture2d< half >` sampled and
// converted with an explicit `(float4)` cast, versus the `texture2d< float >`
// sibling `metal_sample2d3_s()` @0xbae70).
//
// Per PORTING_SPEC "Naming rule": this is a FREE function (ledger class
// `(free)`), so it gets a file named after the function itself.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Helium.framework/Versions/A/Helium (x86_64 slice; VAs
//             unadjusted from `otool -tV`, i.e. file offset = VA + 0x4000).
//
// Disassembly saved at:
//   raw-port/re/disasm/Helium.__ZL22metal_sample2d3_half_sv.s        (@0xbad70, 11 lines)
//   raw-port/re/disasm/Helium.__ZL22metal_sample2d3_half_svcold1.s   (@0x3c21d0, 23 lines)
//
// SYMBOLS (nm -arch x86_64 -m Helium):
//   0x000bad70  (__TEXT,__text) __ZL22metal_sample2d3_half_sv                    — this function
//   0x003c21d0  (__TEXT,__text) __ZL22metal_sample2d3_half_sv.cold.1             — outlined slow path
//   0x00add3b8  (__DATA,__bss)  __ZZL22metal_sample2d3_half_svE13shader_string   — the static string_t
//   0x00add3e8  (__DATA,__bss)  __ZGVZL22metal_sample2d3_half_svE13shader_string — its 8-byte guard
//   0x008df1f1  (__TEXT,__cstring) the 519-byte shader source literal
//               (loaded @0x3c21e4 as `leaq 0x51d006(%rip), %rax`;
//                0x3c21eb + 0x51d006 = 0x8df1f1)
//
// ── RETURN TYPE ────────────────────────────────────────────────────────────
// The mangled name `__ZL22metal_sample2d3_half_sv` encodes only the parameter
// list (`v` = void), never the return type. The BODY pins it: the hot path is
//   `movzbl guard,%eax ; testb %al,%al ; je cold ; retq`
// — it returns WITHOUT ever loading %rax with a value. So this out-of-line
// copy returns nothing: its entire observable job is "make sure shader_string
// is constructed". Callers that want the string read
// `__ZZL22metal_sample2d3_half_svE13shader_string` directly (the accessor
// half of the original `static string_t shader_string = "..."; return
// shader_string;` idiom was inlined at every call site, leaving only this
// guarded-init thunk out of line). We therefore port it as `(): void`.
//
// ── FULL DISASM — hot path (raw-port/re/disasm/Helium.__ZL22metal_sample2d3_half_sv.s) ──
//   __ZL22metal_sample2d3_half_sv:
//     0xbad70  movzbl __ZGVZL22metal_sample2d3_half_svE13shader_string(%rip), %eax
//                                              ; al = guard byte @0xadd3e8
//     0xbad77  testb  %al, %al
//     0xbad79  je     0xbad7c                  ; guard == 0 -> not yet built, go build
//     0xbad7b  retq                            ; guard != 0 -> already built, done
//     0xbad7c  pushq  %rbp                     ; frame prologue
//     0xbad7d  movq   %rsp, %rbp
//     0xbad80  callq  __ZL22metal_sample2d3_half_sv.cold.1   ; @0x3c21d0
//     0xbad85  popq   %rbp                     ; frame epilogue
//     0xbad86  retq
//     0xbad87  nopw   (%rax,%rax)              ; alignment padding
//
// ── FULL DISASM — cold path (raw-port/re/disasm/Helium.__ZL22metal_sample2d3_half_svcold1.s) ──
//   __ZL22metal_sample2d3_half_sv.cold.1:
//     0x3c21d0  pushq  %rbp                              ; frame prologue
//     0x3c21d1  movq   %rsp, %rbp
//     0x3c21d4  leaq   [guard @0xadd3e8](%rip), %rdi
//     0x3c21db  callq  ___cxa_guard_acquire              ; libc++abi extern (stub 0x3c5000)
//     0x3c21e0  testl  %eax, %eax
//     0x3c21e2  je     0x3c2235                          ; 0 -> another thread built it: bail
//     0x3c21e4  leaq   0x51d006(%rip), %rax              ; rax = literal @0x8df1f1
//     0x3c21eb  movq   %rax, [shader_string @0xadd3b8](%rip)
//                                                        ; shader_string.data = literal
//     0x3c21f2  leaq   [shader_string @0xadd3b8](%rip), %rsi  ; rsi = &shader_string
//     0x3c21f9  movq   $0x207, 0x71b1bc(%rip)            ; [0xadd3c0] = 519  (= +0x08 len)
//     0x3c2204  xorps  %xmm0, %xmm0
//     0x3c2207  movups %xmm0, 0x71b1ba(%rip)             ; [0xadd3c8..0xadd3d7] = 0  (+0x10)
//     0x3c220e  movups %xmm0, 0x71b1c3(%rip)             ; [0xadd3d8..0xadd3e7] = 0  (+0x20)
//     0x3c2215  leaq   __ZN8string_tD1Ev(%rip), %rdi     ; rdi = &string_t::~string_t
//     0x3c221c  leaq   -0x3c2223(%rip), %rdx             ; rdx = 0x3c2223 - 0x3c2223 = 0
//                                                        ;      = __dso_handle (mach_header VA)
//     0x3c2223  callq  ___cxa_atexit                     ; libc extern (stub 0x3c4fd6)
//     0x3c2228  leaq   [guard @0xadd3e8](%rip), %rdi
//     0x3c222f  popq   %rbp
//     0x3c2230  jmp    ___cxa_guard_release              ; tail-call; sets guard byte = 1
//     0x3c2235  popq   %rbp                              ; race-lost early-out
//     0x3c2236  retq
//     0x3c2237  nopw   (%rax,%rax)                       ; alignment padding
//
// ── RIP-RELATIVE ARITHMETIC (every data address above, worked) ─────────────
//   0x3c21eb + 0x51d006 = 0x8df1f1   literal        (leaq @0x3c21e4, next-insn 0x3c21eb)
//   0x3c2204 + 0x71b1bc = 0xadd3c0   shader_string + 0x08   (movq $0x207 @0x3c21f9, len 11)
//   0x3c220e + 0x71b1ba = 0xadd3c8   shader_string + 0x10   (movups @0x3c2207, len 7)
//   0x3c2215 + 0x71b1c3 = 0xadd3d8   shader_string + 0x20   (movups @0x3c220e, len 7)
//   All three agree with `nm`'s shader_string @0xadd3b8, which is how the
//   +0x08 / +0x10 / +0x20 field offsets below are grounded.
//
// ── STRUCT LAYOUT — `string_t` (0x30 bytes; what THIS unit observes) ───────
//   +0x00  char*  data    ; written @0x3c21eb with the .cstring literal pointer
//   +0x08  u64    len     ; written @0x3c21f9 with 0x207 = 519
//   +0x10  ...            ; 32 bytes ZEROED @0x3c2207 + @0x3c220e (two movups
//   ..                    ;   of a xorps'd xmm0), i.e. +0x10..+0x2f = 0.
//   +0x2f                 ;   raw-port/src/channels/glsl.ts decodes +0x10 as
//                         ;   `alloc` (the block descriptor pointer) — zeroing
//                         ;   it means "no heap block; this string_t is a
//                         ;   non-owning view of a .cstring literal". The
//                         ;   bytes +0x18..+0x2f are still UNDECODED (no
//                         ;   reader observed by this unit), so no field is
//                         ;   invented for them.
//   Independent confirmation of the 0x30 size: `nm` places the guard variable
//   at 0xadd3e8 = shader_string(0xadd3b8) + 0x30, i.e. the very next object in
//   __bss starts exactly one string_t past this one. (The `float` sibling
//   @0xadd578/0xadd5a8 shows the same +0x30 spacing.)
//   The `___cxa_atexit(&string_t::~string_t, &shader_string, __dso_handle)`
//   @0x3c2223 confirms the object at 0xadd3b8 really is a `string_t`.
//
// ── LEN CROSS-CHECK ────────────────────────────────────────────────────────
//   The literal is self-describing: its second line is `//LEN=0000000207`.
//   0x207 = 519, which is exactly the byte length of the literal read out of
//   the binary (file offset 0x8e31f1 = VA 0x8df1f1 + 0x4000, up to the NUL) —
//   and exactly the immediate the machine stores at +0x08 @0x3c21f9. The three
//   agree, so `len` excludes the terminating NUL.
//
//   The 8-byte difference from the `float` sibling's 0x1ff is accounted for by
//   the two textual edits in the source: `< float >` -> `< half >` (-1 byte),
//   `0000000207` vs `00000001ff` in the LEN line (same width), the added
//   `(float4) ` cast (+9 bytes), and the differing MD5/SIG digests (same
//   width). -1 + 9 = +8, and 0x1ff + 8 = 0x207. ✓
//
// ── EXTERNS (all TRUE out-of-scope, each cited) ────────────────────────────
//   ___cxa_guard_acquire  @0x3c21db (stub 0x3c5000)  — libc++abi
//   ___cxa_atexit         @0x3c2223 (stub 0x3c4fd6)  — libc
//   ___cxa_guard_release  @0x3c2230 (stub 0x3c5006)  — libc++abi
//   __ZN8string_tD1Ev     @0x3c2215 — Helium `string_t::~string_t()`. Its
//     ADDRESS is taken, it is never CALLED here; it runs only at process
//     teardown from the atexit chain. See the note on the atexit line below.
//
// @provenance Helium @0xbad70 (metal_sample2d3_half_s), @0x3c21d0 (.cold.1),
//             @0xadd3b8 (shader_string), @0xadd3e8 (guard), @0x8df1f1 (literal)

import type { StringT } from "../channels/glsl";

/**
 * The 519-byte Metal fragment-shader source literal that
 * `metal_sample2d3_half_s()::shader_string` points at.
 *
 * @Helium 0x8df1f1 (__TEXT,__cstring) — loaded @0x3c21e4 by
 * `leaq 0x51d006(%rip), %rax` (0x3c21eb + 0x51d006 = 0x8df1f1) and stored
 * into `shader_string.data` @0x3c21eb.
 *
 * Transcribed byte-for-byte from the binary; `length === 0x207` (519), which
 * is the exact immediate the machine writes to `shader_string.len` @0x3c21f9
 * and matches the literal's own `//LEN=0000000207` header line.
 *
 * The program is Helium's "sample texture unit 3" pass-through fragment
 * shader in its HALF-precision form: the texture is declared
 * `texture2d< half >`, so the sample comes back as `half4` and is explicitly
 * widened with `(float4)` before being written to `output.color0`.
 */
export const METAL_SAMPLE2D3_HALF_SHADER_SOURCE: string =
  "//Metal1.0     \n" +
  "//LEN=0000000207\n" +
  "fragment FragmentOut fragmentFunc(VertexInOut frag [[ stage_in ]], \n" +
  "    const constant float4* hg_Params [[ buffer(0) ]], \n" +
  "    texture2d< half > hg_Texture3 [[ texture(3) ]], \n" +
  "    sampler hg_Sampler3 [[ sampler(3) ]])\n" +
  "{\n" +
  "    FragmentOut output;\n" +
  "\n" +
  "    output.color0 = (float4) hg_Texture3.sample(hg_Sampler3, frag._texCoord3.xy);\n" +
  "    return output;\n" +
  "}\n" +
  "//MD5=26246cf2:677801c1:4ecdf5a0:4b8d05e2\n" +
  "//SIG=00400000:00000008:00000000:00000008:0000:0000:0000:0000:0000:0000:0010:0000:0004:04:0:1:0\n";

/**
 * `metal_sample2d3_half_s()::shader_string` — the file-static `string_t` at
 * @Helium 0xadd3b8 (__DATA,__bss).
 *
 * Zero-initialized by the loader (it lives in __bss) and filled in by the
 * cold path of `metal_sample2d3_half_s()` — see the field-by-field citations
 * in the file header. Exported because the accessor half of the original
 * `static string_t shader_string = ...; return shader_string;` idiom was
 * inlined into every call site, so consumers of this translation unit read
 * the object directly rather than through a getter.
 *
 * `alloc` is `null` @0x3c2207 (the first `movups %xmm0` zeroes +0x10): this
 * string_t is a NON-OWNING view of the .cstring literal, not a heap buffer.
 */
export const metal_sample2d3_half_s_shader_string: StringT = {
  // The object lives in (__DATA,__bss) @0xadd3b8, so its pre-init state is
  // all-zero by the loader. The cold path @0x3c21d0 overwrites +0x00 (data)
  // and +0x08 (len) and re-zeroes +0x10..+0x2f — see
  // `metal_sample2d3_half_s_cold_1` below for the per-field citations.
  data: null, // +0x00  char*  — NULL until @0x3c21eb runs
  len: 0, //     +0x08  u64    — 0 until @0x3c21f9 writes 0x207
  alloc: null, //  +0x10  Alloc* — NULL; re-zeroed @0x3c2207 (non-owning view)
};

/**
 * Guard byte for `metal_sample2d3_half_s()::shader_string`.
 *
 * @Helium 0xadd3e8 (__DATA,__bss) — symbol
 * `__ZGVZL22metal_sample2d3_half_svE13shader_string`. Read as a BYTE @0xbad70
 * (`movzbl ...(%rip), %eax`), acquired @0x3c21db and set @0x3c2230.
 *
 * The Itanium ABI guard is 8 bytes wide but only its low byte is the
 * "initialized" flag, which is the only bit this unit observes (the machine
 * reads exactly one byte with `movzbl` and lets `___cxa_guard_acquire` /
 * `___cxa_guard_release` own the rest). JS is single-threaded, so
 * `___cxa_guard_acquire` reduces to "return true iff the flag is still 0"
 * and the `je 0x3c2235` race-lost early-out @0x3c21e2 is unreachable — the
 * branch is still transcribed below so the control flow matches instruction
 * for instruction.
 */
let guard_shader_string_at_0xadd3e8 = 0;

/**
 * `metal_sample2d3_half_s()` — @Helium 0xbad70 —
 * `__ZL22metal_sample2d3_half_sv`
 *
 * Lazily construct the function-local static
 * `metal_sample2d3_half_s()::shader_string` (@0xadd3b8) as a non-owning
 * `string_t` view over the 519-byte Metal shader literal at @0x8df1f1.
 * Idempotent: every call after the first is the two-instruction hot-path
 * test-and-return @0xbad70..0xbad7b.
 *
 * Returns nothing — see the "RETURN TYPE" note in the file header (the hot
 * path rets without ever setting %rax).
 *
 * Zero in-scope callees: `depgraph.py deps __ZL22metal_sample2d3_half_sv`
 * reports no dependency rows. The only calls in the body are the three libc /
 * libc++abi externs cited in the file header, plus the ADDRESS (never a call)
 * of `string_t::~string_t` handed to `___cxa_atexit`. No indirect or virtual
 * calls anywhere in either the hot or the cold path.
 */
export function metal_sample2d3_half_s(): void {
  // @0xbad70  movzbl [guard @0xadd3e8](%rip), %eax
  const guardByte = guard_shader_string_at_0xadd3e8 & 0xff;
  // @0xbad77  testb %al, %al
  // @0xbad79  je 0xbad7c        ; ZF set (guard == 0) -> fall into the cold path
  if (guardByte !== 0) {
    // @0xbad7b  retq            ; already constructed
    return;
  }
  // @0xbad80  callq __ZL22metal_sample2d3_half_sv.cold.1  (@0x3c21d0)
  metal_sample2d3_half_s_cold_1();
  // @0xbad85..0xbad86  popq %rbp ; retq
}

/**
 * `metal_sample2d3_half_s() (.cold.1)` — @Helium 0x3c21d0 —
 * `__ZL22metal_sample2d3_half_sv.cold.1`
 *
 * The outlined slow path: acquire the guard, publish the literal pointer and
 * its length into `shader_string`, zero the remaining 32 bytes of the object,
 * register its destructor with the atexit chain, and release the guard.
 * Called from exactly one site (@0xbad80).
 *
 * Not exported: it is a `.cold.N` fragment of `metal_sample2d3_half_s`, not a
 * separately-callable FCP entry point — it is reachable only through its
 * parent, exactly as in the binary.
 */
function metal_sample2d3_half_s_cold_1(): void {
  // @0x3c21d4  leaq [guard @0xadd3e8](%rip), %rdi
  // @0x3c21db  callq ___cxa_guard_acquire   ; libc++abi extern (stub @0x3c5000)
  //   Single-threaded JS: the guard is acquired iff the flag byte is still 0.
  const acquired = (guard_shader_string_at_0xadd3e8 & 0xff) === 0 ? 1 : 0;
  // @0x3c21e0  testl %eax, %eax
  // @0x3c21e2  je 0x3c2235      ; acquire returned 0 -> a racing thread already
  //                             ; built it; pop and return without touching it.
  if (acquired === 0) {
    // @0x3c2235..0x3c2236  popq %rbp ; retq
    return;
  }
  // @0x3c21e4  leaq 0x51d006(%rip), %rax    ; rax = literal @0x8df1f1
  // @0x3c21eb  movq %rax, [0xadd3b8]        ; shader_string.data = rax
  metal_sample2d3_half_s_shader_string.data = literalBytesAt0x8df1f1();
  // @0x3c21f2  leaq [0xadd3b8](%rip), %rsi  ; rsi = &shader_string (atexit arg)
  const shaderStringRef = metal_sample2d3_half_s_shader_string;
  // @0x3c21f9  movq $0x207, [0xadd3c0]      ; shader_string.len = 0x207 = 519
  metal_sample2d3_half_s_shader_string.len = 0x207;
  // @0x3c2204  xorps %xmm0, %xmm0
  // @0x3c2207  movups %xmm0, [0xadd3c8]     ; +0x10..+0x1f = 0 -> alloc = NULL
  metal_sample2d3_half_s_shader_string.alloc = null;
  // @0x3c220e  movups %xmm0, [0xadd3d8]     ; +0x20..+0x2f = 0
  //   Those 16 bytes are string_t members this unit never sees READ, so per
  //   PORTING_SPEC Rule 5 no field is invented for them; they are already
  //   absent-and-therefore-zero in the StringT model above. Recorded here so
  //   the instruction is accounted for, not silently dropped.
  // @0x3c2215  leaq __ZN8string_tD1Ev(%rip), %rdi   ; rdi = &string_t::~string_t
  // @0x3c221c  leaq -0x3c2223(%rip), %rdx           ; rdx = 0 = __dso_handle
  // @0x3c2223  callq ___cxa_atexit(dtor, &shader_string, dso)
  //   ___cxa_atexit is a TRUE out-of-scope libc extern (stub @0x3c4fd6). It
  //   only appends (dtor, obj, dso) to the process teardown list; it reads
  //   and writes nothing in `shader_string`, and `string_t::~string_t`
  //   (@0x3c2215, address-taken only) runs after `exit()`. A JS module has no
  //   post-exit destructor phase, so this call contributes no value and no
  //   state to anything this file produces. `shaderStringRef` is the `%rsi`
  //   argument the machine passes, kept so the operand is explicit.
  void shaderStringRef;
  // @0x3c2228  leaq [guard @0xadd3e8](%rip), %rdi
  // @0x3c222f  popq %rbp
  // @0x3c2230  jmp ___cxa_guard_release     ; libc++abi extern (stub @0x3c5006)
  //   Release sets the guard's low byte to 1, which is what the hot-path
  //   `movzbl`/`testb` @0xbad70 reads on every subsequent call.
  guard_shader_string_at_0xadd3e8 = 1;
}

/**
 * The bytes of the `.cstring` literal at @Helium 0x8df1f1 — i.e. the storage
 * the `char*` written into `shader_string.data` @0x3c21eb points at.
 *
 * `StringT.data` is modelled as the pointed-to byte buffer (see
 * raw-port/src/channels/glsl.ts), so the pointer store is reproduced by
 * materializing those bytes. The literal is pure 7-bit ASCII, so
 * `charCodeAt` is an exact transcription of the stored bytes; the array is
 * 0x207 = 519 long, matching the `len` the machine writes @0x3c21f9, and the
 * terminating NUL is excluded (it is not counted by `len`).
 */
function literalBytesAt0x8df1f1(): Uint8Array {
  const src = METAL_SAMPLE2D3_HALF_SHADER_SOURCE;
  const out = new Uint8Array(src.length);
  for (let i = 0; i < src.length; i++) {
    out[i] = src.charCodeAt(i) & 0xff;
  }
  return out;
}
