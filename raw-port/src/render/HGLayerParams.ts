// HGLayerParams.ts — Helium HGLayerParams: a plain-data record of a compositing
// layer's per-frame parameters (opacity, blend mode, mask index, per-channel
// tint, plus one reserved int32). All four transcribed methods are
// constructors — pure struct fills, no branches, no allocations.
// Faithful transcription of the x86_64 disassembly of
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//     Versions/A/Helium.
//
// Source disassembly (in this worktree):
//   raw-port/re/disasm/Helium.HGLayerParams.HGLayerParams_C1_default.s
//   raw-port/re/disasm/Helium.HGLayerParams.HGLayerParams_C2_default.s
//   raw-port/re/disasm/Helium.HGLayerParams.HGLayerParams_C1_full.s
//   raw-port/re/disasm/Helium.HGLayerParams.HGLayerParams_C2_full.s
//
// Helium symbols transcribed (Itanium ABI: C1 = complete-object ctor,
// C2 = base-object ctor. In this class both variants are byte-identical —
// HGLayerParams has no virtual bases and no vtable pointer):
//   @0x0002bda0  HGLayerParams::HGLayerParams()                       (C2, default)
//   @0x0002bdd0  HGLayerParams::HGLayerParams()                       (C1, default)
//   @0x0002be00  HGLayerParams::HGLayerParams(int, float, int, float vector[4] const&)   (C2, full)
//   @0x0002be20  HGLayerParams::HGLayerParams(int, float, int, float vector[4] const&)   (C1, full)
//
// STRUCT LAYOUT (recovered from the store offsets in all four ctors):
//   HGLayerParams is 0x24 (36) bytes. The default ctor writes 0/1.0/0/{1,1,1,1}/0
//   at offsets 0/4/8/0x10..0x20/0x20; the full ctor writes esi/xmm0/edx/[rcx]/0
//   at the same offsets. So the record is:
//
//     offset  size  type    name          default   ctor-arg
//     ------  ----  ------  ------------  --------  --------
//     0x00    4     int32   a             0         arg0 (esi/%edi)
//     0x04    4     float   b             1.0       arg1 (xmm0)
//     0x08    4     int32   c             0         arg2 (edx)
//     0x0c    4     ---     (pad)         ---       (implicit align-16 pad)
//     0x10    16    float4  d             {1,1,1,1} arg3 (from rcx)
//     0x20    4     int32   e             0         (always 0, no ctor arg)
//
//   Field names use the C++ mangled arg-slot letters (Dv4_f in the mangling =
//   "float vector[4]"). Semantic names are inferred (opacity/blend/mask/tint)
//   but not decoded here — no other method reads these fields yet in
//   raw-port. We keep the raw names to avoid inventing semantics.
//
// Called stubs / data:
//   (none)  Both ctor pairs are branch-free, allocation-free struct writes.
//   The only external reference is the RIP-relative literal load of the
//   default float4 {1,1,1,1} at the file-local literal pool:
//     @0x0002bde8  movaps 0x39be51(%rip), %xmm0  ; -> literal @0x003c7c40
//     @0x0002bdb8  movaps 0x39be81(%rip), %xmm0  ; -> literal @0x003c7c40   (same)
//   Raw bytes at 0x003c7c40 (Helium .rodata; verified via xxd on the x86_64
//   slice at file-offset 0x003c7c40 + 0x4000): 00 00 80 3f × 4 = {1.0, 1.0,
//   1.0, 1.0} (four float32 = 1.0).
//
// Frontier callees (not-yet-transcribed): NONE.

// ---------------------------------------------------------------------------
// HGLayerParams — the plain-data record. TypeScript representation uses
// the same field ordering as the C++ struct. The 4-byte pad at 0x0c is
// implicit (float4 at 0x10 requires 16-byte alignment); we don't model it
// in TS since there are no unions or bit-reads across the pad here.
// The float32 field 'b' is stored via Math.fround for single-precision
// parity with the C++ movss store at @0x0002be06.
// ---------------------------------------------------------------------------

/** HGLayerParams — 0x24-byte plain record decoded from four ctors at
 *  @Helium 0x0002bda0/0x0002bdd0/0x0002be00/0x0002be20. Field names use
 *  the mangled arg-slot letters (a,b,c,d,e); semantic labels are left
 *  undecoded here. */
export interface HGLayerParams {
  /** offset 0x00 (int32).  Default 0. Ctor arg #0 (mangling: `i`). */
  a: number;
  /** offset 0x04 (float32). Default 1.0. Ctor arg #1 (mangling: `f`).
   *  Stored via `movss %xmm0, 0x4(%rdi)` @0x0002be06 — single-precision. */
  b: number;
  /** offset 0x08 (int32).  Default 0. Ctor arg #2 (mangling: `i`). */
  c: number;
  /** offset 0x10 (float4). Default {1,1,1,1}. Ctor arg #3 (mangling:
   *  `RKDv4_f` = "reference to const float vector[4]"). Stored via
   *  `movaps (%rcx), %xmm0 ; movaps %xmm0, 0x10(%rdi)` @0x0002be0e/@0x0002be11
   *  — four single-precision floats loaded as a 16-byte aligned block. */
  d: [number, number, number, number];
  /** offset 0x20 (int32). Always 0 (both ctor pairs write `movl $0x0,
   *  0x20(%rdi)`; no ctor accepts a value for this slot). */
  e: number;
}

/** The RIP-relative float4 literal at Helium @0x003c7c40, loaded by the
 *  default ctor pair. Verified by xxd of the Helium x86_64 slice at
 *  file-offset 0x003c7c40 + 0x4000 (FAT prefix): 4×"00 00 80 3f" = four
 *  single-precision 1.0 floats.
 *
 *  Emitted as a fresh tuple every call so callers can mutate `.d` without
 *  aliasing back into the shared constant. */
function DEFAULT_D_LITERAL_003C7C40(): [number, number, number, number] {
  // @Helium 0x003c7c40  bytes 00 00 80 3f  00 00 80 3f  00 00 80 3f  00 00 80 3f
  return [
    Math.fround(1.0),
    Math.fround(1.0),
    Math.fround(1.0),
    Math.fround(1.0),
  ];
}

// ---------------------------------------------------------------------------
// HGLayerParams::HGLayerParams()  — default ctor
//
// Both C1 @0x0002bdd0 and C2 @0x0002bda0 are byte-identical modulo the
// literal-load's RIP offset (0x39be51 vs 0x39be81 — both resolve to the
// same literal @0x003c7c40). Faithful to the disasms:
//
//   @0x0002bda0/0x0002bdd0  pushq %rbp ; movq %rsp, %rbp
//   @0x0002bda4/0x0002bdd4  movabsq $0x3f80000000000000, %rax
//                              ; rax = 0x3F80_0000_0000_0000
//                              ; = qword with low 4 bytes = 0x00000000 (int32 0)
//                              ; and high 4 bytes    = 0x3F800000 (float 1.0)
//   @0x0002bdae/0x0002bdde  movq %rax, (%rdi)
//                              ; stores 8 bytes at offset 0..7:
//                              ; -> self[0..3] = int32 0    (field a)
//                              ; -> self[4..7] = float 1.0  (field b)
//   @0x0002bdb1/0x0002bde1  movl $0x0, 0x8(%rdi)      ; self.c = 0
//   @0x0002bdb8/0x0002bde8  movaps 0x39be81/0x39be51(%rip), %xmm0
//                              ; xmm0 = *(float4*)&literal @0x003c7c40
//                              ; = {1.0, 1.0, 1.0, 1.0}
//   @0x0002bdbf/0x0002bdef  movaps %xmm0, 0x10(%rdi)  ; self.d = {1,1,1,1}
//   @0x0002bdc3/0x0002bdf3  movl $0x0, 0x20(%rdi)     ; self.e = 0
//   @0x0002bdca/0x0002bdfa  popq %rbp ; retq
//
// The single TypeScript function `HGLayerParams_ctor_default` covers both
// C1 and C2 (they are byte-identical apart from the RIP offset).
// ---------------------------------------------------------------------------

/** HGLayerParams::HGLayerParams() — default constructor.
 *  @Helium 0x0002bda0 (C2) / @Helium 0x0002bdd0 (C1). Byte-identical.
 *  Initializes `{ a:0, b:1.0, c:0, d:{1,1,1,1}, e:0 }`. */
export function HGLayerParams_ctor_default(self: HGLayerParams): void {
  // @0x0002bda4/0x0002bdd4  movabsq $0x3f80000000000000, %rax
  // @0x0002bdae/0x0002bdde  movq %rax, (%rdi)
  //   low 4 bytes = 0x00000000 -> a = 0 (int32)
  self.a = 0;
  //   high 4 bytes = 0x3F800000 -> b = 1.0 (float32 stored as single)
  self.b = Math.fround(1.0);
  // @0x0002bdb1/0x0002bde1  movl $0x0, 0x8(%rdi)
  self.c = 0;
  // @0x0002bdb8/0x0002bde8  movaps 0x39be81/0x39be51(%rip), %xmm0 -> literal @0x003c7c40
  // @0x0002bdbf/0x0002bdef  movaps %xmm0, 0x10(%rdi)
  self.d = DEFAULT_D_LITERAL_003C7C40();
  // @0x0002bdc3/0x0002bdf3  movl $0x0, 0x20(%rdi)
  self.e = 0;
}

// ---------------------------------------------------------------------------
// HGLayerParams::HGLayerParams(int, float, int, float vector[4] const&)
//   — full ctor
//
// Both C1 @0x0002be20 and C2 @0x0002be00 are byte-identical. Faithful to
// the disasms:
//
//   @0x0002be00/0x0002be20  pushq %rbp ; movq %rsp, %rbp
//   @0x0002be04/0x0002be24  movl %esi, (%rdi)         ; self.a = arg0 (int32)
//   @0x0002be06/0x0002be26  movss %xmm0, 0x4(%rdi)    ; self.b = arg1 (float32)
//   @0x0002be0b/0x0002be2b  movl %edx, 0x8(%rdi)      ; self.c = arg2 (int32)
//   @0x0002be0e/0x0002be2e  movaps (%rcx), %xmm0      ; xmm0 = *(float4*)arg3
//   @0x0002be11/0x0002be31  movaps %xmm0, 0x10(%rdi)  ; self.d = xmm0
//   @0x0002be15/0x0002be35  movl $0x0, 0x20(%rdi)     ; self.e = 0
//   @0x0002be1c/0x0002be3c  popq %rbp ; retq
//
// arg3 is passed BY REFERENCE (mangling `RK` = const-reference) — the ctor
// dereferences rcx to read four floats. In TypeScript we pass the float4
// by value (an array of length 4) and copy element-wise; this preserves
// the "the ctor takes a snapshot at construction time" semantics of the
// `movaps (%rcx), %xmm0 ; movaps %xmm0, 0x10(%rdi)` pair.
// ---------------------------------------------------------------------------

/** HGLayerParams::HGLayerParams(int a, float b, int c, float4 const& d)
 *  — full constructor.
 *  @Helium 0x0002be00 (C2) / @Helium 0x0002be20 (C1). Byte-identical.
 *  Fills `self` with the four caller-supplied fields; `e` is always 0
 *  (no ctor arg for it). */
export function HGLayerParams_ctor_full(
  self: HGLayerParams,
  a: number,
  b: number,
  c: number,
  d: readonly [number, number, number, number],
): void {
  // @0x0002be04/0x0002be24  movl %esi, (%rdi)
  //   int32 store: the callee-visible value of arg0 is `esi | 0` in JS terms.
  self.a = a | 0;
  // @0x0002be06/0x0002be26  movss %xmm0, 0x4(%rdi)
  //   32-bit single-precision store: narrow via Math.fround.
  self.b = Math.fround(b);
  // @0x0002be0b/0x0002be2b  movl %edx, 0x8(%rdi)
  self.c = c | 0;
  // @0x0002be0e/@0x0002be2e  movaps (%rcx), %xmm0
  // @0x0002be11/@0x0002be31  movaps %xmm0, 0x10(%rdi)
  //   16-byte aligned float4 copy from *arg3 into self.d. Each lane is a
  //   single-precision float; Math.fround is applied to preserve the store
  //   width exactly (the underlying `movaps` is a bitwise copy but the
  //   caller's argument shape at the ABI boundary is 4×float32).
  self.d = [
    Math.fround(d[0]),
    Math.fround(d[1]),
    Math.fround(d[2]),
    Math.fround(d[3]),
  ];
  // @0x0002be15/@0x0002be35  movl $0x0, 0x20(%rdi)
  self.e = 0;
}

// ---------------------------------------------------------------------------
// Convenience factories (idiomatic TypeScript wrappers around the two
// ctors). These do not correspond to distinct Helium symbols; they exist
// so callers can write `const p = HGLayerParams_new();` instead of the
// two-step allocate-then-construct pattern the C++ ABI mandates.
// ---------------------------------------------------------------------------

/** Allocate + default-construct.  Equivalent to `HGLayerParams p; ctor(&p);`. */
export function HGLayerParams_new(): HGLayerParams {
  // @Helium 0x0002bda0/0x0002bdd0
  const self: HGLayerParams = { a: 0, b: 0, c: 0, d: [0, 0, 0, 0], e: 0 };
  HGLayerParams_ctor_default(self);
  return self;
}

/** Allocate + full-construct.  Equivalent to `HGLayerParams p(a,b,c,d);`. */
export function HGLayerParams_new_full(
  a: number,
  b: number,
  c: number,
  d: readonly [number, number, number, number],
): HGLayerParams {
  // @Helium 0x0002be00/0x0002be20
  const self: HGLayerParams = { a: 0, b: 0, c: 0, d: [0, 0, 0, 0], e: 0 };
  HGLayerParams_ctor_full(self, a, b, c, d);
  return self;
}
