// raw-port/src/render/HgcOverexposureCheck_State.ts
//
// FCP `HgcOverexposureCheck::State` — the NESTED state struct of the
// `HgcOverexposureCheck` render node (Ozone.framework). It is its own ledger
// class (`Ozone  HgcOverexposureCheck::State`), so per PORTING_SPEC Rule 6 it
// lives in its own file named `Outer_Nested`, following the precedent of
// raw-port/src/render/HGRenderUtils_BufferCopier.ts and
// raw-port/src/infra/Json_StreamWriter_Factory.ts.
//
// This unit ports EXACTLY ONE member: the C2 (base-object) default
// constructor @Ozone 0x6a1ed0. The C1 variant @0x6a1b30, the class-specific
// `operator new` @0x688bd0 and `operator delete` @0x6a1b50, and every method
// of the enclosing `HgcOverexposureCheck` are SEPARATE ledger entries and
// remain OUT OF SCOPE here.
//
// Provenance: /Applications/Final Cut Pro.app/Contents/Frameworks/
//             Ozone.framework/Versions/A/Ozone (x86_64 slice at fat offset
//             0x4000, VAs unadjusted; file offset = VA + 0x4000).
// Disassembly saved at:
//   raw-port/re/disasm/__ZN20HgcOverexposureCheck5StateC2Ev.s (@0x6a1ed0, 28 lines)
//
// SYMBOLS PORTED HERE (mangled → address)
//   * __ZN20HgcOverexposureCheck5StateC2Ev
//       — HgcOverexposureCheck::State::State() [C2] @Ozone 0x6a1ed0
//
// ── FULL DISASM (raw-port/re/disasm/__ZN20HgcOverexposureCheck5StateC2Ev.s) ──
//   0x6a1ed0  pushq   %rbp                    ; frame prologue
//   0x6a1ed1  movq    %rsp, %rbp
//   0x6a1ed4  movq    %rdi, -0x8(%rbp)        ; spill `this`  (-O0 noise)
//   0x6a1ed8  movq    -0x8(%rbp), %rax        ; reload `this` (-O0 noise)
//   0x6a1edc  xorps   %xmm0, %xmm0            ; xmm0 = 16 zero bytes
//   0x6a1edf  movaps  %xmm0, -0x20(%rbp)      ; spill  (-O0 noise)
//   0x6a1ee3  movaps  -0x20(%rbp), %xmm0      ; reload (-O0 noise)
//   0x6a1ee7  movaps  %xmm0, 0x10(%rax)       ; this[+0x10..+0x1f] = 0
//   0x6a1eeb  movaps  %xmm0, (%rax)           ; this[+0x00..+0x0f] = 0
//   0x6a1eee  movaps  0x6667b(%rip), %xmm0    ; xmm0 = [0x708570] (see CONSTANTS)
//   0x6a1ef5  movaps  %xmm0, -0x30(%rbp)      ; spill  (-O0 noise)
//   0x6a1ef9  movaps  -0x30(%rbp), %xmm0      ; reload (-O0 noise)
//   0x6a1efd  movaps  %xmm0, 0x30(%rax)       ; this[+0x30..+0x3f] = A
//   0x6a1f01  movaps  %xmm0, 0x20(%rax)       ; this[+0x20..+0x2f] = A
//   0x6a1f05  movss   0x65043(%rip), %xmm0    ; xmm0 = (f32 [0x706f50], 0, 0, 0)
//   0x6a1f0d  movaps  %xmm0, -0x40(%rbp)      ; spill  (-O0 noise)
//   0x6a1f11  movaps  -0x40(%rbp), %xmm0      ; reload (-O0 noise)
//   0x6a1f15  movaps  %xmm0, 0x50(%rax)       ; this[+0x50..+0x5f] = B
//   0x6a1f19  movaps  %xmm0, 0x40(%rax)       ; this[+0x40..+0x4f] = B
//   0x6a1f1d  movaps  0x7264c(%rip), %xmm0    ; xmm0 = [0x714570] (see CONSTANTS)
//   0x6a1f24  movaps  %xmm0, -0x50(%rbp)      ; spill  (-O0 noise)
//   0x6a1f28  movdqa  -0x50(%rbp), %xmm0      ; reload in the INTEGER domain
//   0x6a1f2d  movaps  %xmm0, 0x70(%rax)       ; this[+0x70..+0x7f] = C
//   0x6a1f31  movaps  %xmm0, 0x60(%rax)       ; this[+0x60..+0x6f] = C
//   0x6a1f35  popq    %rbp                    ; frame epilogue
//   0x6a1f36  retq
//   0x6a1f37  nopw    (%rax,%rax)             ; alignment padding
//
// Every `movaps %xmm0, -0xNN(%rbp)` / reload pair is unoptimised (-O0) spill
// traffic around a materialised temporary; the net architectural effect is
// exactly the eight 16-byte stores into `this`. They are listed above so no
// instruction is dropped, but they have no TS-visible counterpart.
//
// ── RIP-RELATIVE CONSTANTS (worked, then read out of the binary) ──────────
//   @0x6a1eee `movaps 0x6667b(%rip)` : next-insn 0x6a1ef5 + 0x6667b = 0x708570
//   @0x6a1f05 `movss  0x65043(%rip)` : next-insn 0x6a1f0d + 0x65043 = 0x706f50
//   @0x6a1f1d `movaps 0x7264c(%rip)` : next-insn 0x6a1f24 + 0x7264c = 0x714570
//
//   [0x708570] = 00 00 00 00 00 00 00 00 00 00 00 00 00 00 80 3f
//                = f32x4 { 0.0f, 0.0f, 0.0f, 1.0f }        (lane A)
//   [0x706f50] = 00 00 80 3f  = f32 1.0f. Loaded with `movss` from MEMORY,
//                which writes xmm0[31:0] and ZEROES xmm0[127:32], so the
//                16 bytes that reach the object are
//                  f32x4 { 1.0f, 0.0f, 0.0f, 0.0f }        (lane B)
//   [0x714570] = ff ff ff ff 00 00 00 00 00 00 00 00 00 00 00 00
//                = i32x4 { -1, 0, 0, 0 }                    (lane C)
//
// ── STRUCT LAYOUT (size >= 0x80; recovered from THIS ctor only) ───────────
//   +0x00  f32x4  = { 0, 0, 0, 0 }      ; xorps lane, stored @0x6a1eeb
//   +0x10  f32x4  = { 0, 0, 0, 0 }      ; same lane, stored @0x6a1ee7
//   +0x20  f32x4  = { 0, 0, 0, 1 }      ; lane A, stored @0x6a1f01
//   +0x30  f32x4  = { 0, 0, 0, 1 }      ; lane A, stored @0x6a1efd
//   +0x40  f32x4  = { 1, 0, 0, 0 }      ; lane B, stored @0x6a1f19
//   +0x50  f32x4  = { 1, 0, 0, 0 }      ; lane B, stored @0x6a1f15
//   +0x60  i32x4  = { -1, 0, 0, 0 }     ; lane C, stored @0x6a1f31
//   +0x70  i32x4  = { -1, 0, 0, 0 }     ; lane C, stored @0x6a1f2d
//
//   Lane element TYPES are taken from the instruction domain the machine
//   uses, not guessed: `xorps` / `movaps` / `movss` are the SINGLE-PRECISION
//   FLOAT forms (and lane A's top element is literally the f32 bit pattern
//   0x3f800000 = 1.0f, lane B is a scalar f32 1.0f load), whereas lane C is
//   re-read with `movdqa` @0x6a1f28 — the INTEGER-domain move — and its
//   payload 0xffffffff is a valid int32 (-1) but only a NaN as f32. Nothing
//   beyond element width and domain is claimed: the SEMANTIC names of the
//   eight lanes are undecoded (no reader of this struct is transcribed yet),
//   so each field is named by its byte offset per Rule 5 rather than given
//   an invented meaning.
//
//   The ctor writes each of the four distinct lanes TWICE, into adjacent
//   16-byte slots (0x00&0x10, 0x20&0x30, 0x40&0x50, 0x60&0x70). That
//   duplication is transcribed literally; whether it reflects two parallel
//   sub-structures or a 2-element array of a 16-byte type is NOT decidable
//   from this ctor alone, so no such grouping is asserted.
//
//   The object may be larger than 0x80 bytes — the ctor only proves that the
//   first 0x80 are initialized here. No field is invented past +0x7f.
//
// ── CALLEES ───────────────────────────────────────────────────────────────
//   NONE. Zero in-scope callees, zero externs, no indirect or virtual calls
//   — the body is eight stores of three rip-relative constants plus zero.
//   Confirmed via `depgraph.py deps __ZN20HgcOverexposureCheck5StateC2Ev`
//   (no dependency rows).
//
// @provenance Ozone @0x6a1ed0 (State C2 ctor), @0x708570 (lane A const),
//             @0x706f50 (lane B f32 const), @0x714570 (lane C const)

/**
 * `HgcOverexposureCheck::State` — nested state struct of the Ozone
 * over-exposure-check render node (PARTIAL port: the C2 ctor only).
 *
 * Backed by eight explicit 16-byte lanes so the byte image the constructor
 * produces is reproduced exactly. Float lanes use `Float32Array` and the
 * integer lane uses `Int32Array`, matching the SSE domain each store is
 * issued in (see the file header).
 */
export class HgcOverexposureCheck_State {
  /** +0x00 — f32x4 lane, zeroed @0x6a1eeb (`movaps %xmm0, (%rax)` with
   *  xmm0 cleared by `xorps` @0x6a1edc). Semantics undecoded. */
  readonly lane_at_0x00: Float32Array = new Float32Array(4);
  /** +0x10 — f32x4 lane, zeroed @0x6a1ee7 from the same cleared xmm0.
   *  Semantics undecoded. */
  readonly lane_at_0x10: Float32Array = new Float32Array(4);
  /** +0x20 — f32x4 lane, written @0x6a1f01 from the 16-byte constant
   *  @Ozone 0x708570 = { 0.0f, 0.0f, 0.0f, 1.0f }. Semantics undecoded. */
  readonly lane_at_0x20: Float32Array = new Float32Array(4);
  /** +0x30 — f32x4 lane, written @0x6a1efd from the SAME constant
   *  @Ozone 0x708570. Semantics undecoded. */
  readonly lane_at_0x30: Float32Array = new Float32Array(4);
  /** +0x40 — f32x4 lane, written @0x6a1f19 from the scalar `movss` load of
   *  @Ozone 0x706f50 (1.0f) with the upper 96 bits zeroed by `movss`, i.e.
   *  { 1.0f, 0.0f, 0.0f, 0.0f }. Semantics undecoded. */
  readonly lane_at_0x40: Float32Array = new Float32Array(4);
  /** +0x50 — f32x4 lane, written @0x6a1f15 from the SAME xmm0 as +0x40.
   *  Semantics undecoded. */
  readonly lane_at_0x50: Float32Array = new Float32Array(4);
  /** +0x60 — i32x4 lane, written @0x6a1f31 from the 16-byte constant
   *  @Ozone 0x714570 = { 0xffffffff, 0, 0, 0 }, reloaded in the INTEGER
   *  domain with `movdqa` @0x6a1f28. Semantics undecoded. */
  readonly lane_at_0x60: Int32Array = new Int32Array(4);
  /** +0x70 — i32x4 lane, written @0x6a1f2d from the SAME constant
   *  @Ozone 0x714570. Semantics undecoded. */
  readonly lane_at_0x70: Int32Array = new Int32Array(4);

  /**
   * `HgcOverexposureCheck::State::State()` [C2 — base-object constructor]
   *   — @Ozone 0x6a1ed0
   *   — __ZN20HgcOverexposureCheck5StateC2Ev
   *
   * Faithful line-for-line transcription of the 26-instruction body (full
   * listing and the rip-relative constant arithmetic are in the file
   * header). Architecturally the ctor is eight aligned 16-byte stores that
   * splat four distinct lane values across +0x00..+0x7f:
   *
   *   xorps-zero              -> +0x10 @0x6a1ee7, +0x00 @0x6a1eeb
   *   [0x708570] {0,0,0,1.0f} -> +0x30 @0x6a1efd, +0x20 @0x6a1f01
   *   movss 1.0f @[0x706f50]  -> +0x50 @0x6a1f15, +0x40 @0x6a1f19
   *     (movss from memory zero-fills bits 127:32, so the stored lane is
   *      {1.0f, 0, 0, 0} — this is the one place the load form, not just
   *      the constant, determines three of the four elements.)
   *   [0x714570] {-1,0,0,0}   -> +0x70 @0x6a1f2d, +0x60 @0x6a1f31
   *
   * The store order within each pair is high-offset-first (0x10 before
   * 0x00, 0x30 before 0x20, …); it is reproduced below even though the
   * destinations are disjoint and the order is therefore unobservable.
   *
   * The `movq %rdi, -0x8(%rbp)` / `movq -0x8(%rbp), %rax` pair @0x6a1ed4 and
   * the four `movaps` spill/reload round-trips through the red zone are
   * unoptimised-codegen artefacts with no architectural effect; they are
   * annotated in the header rather than mirrored here.
   *
   * Returns void (a C2 ctor); no in-scope callees, no externs, no indirect
   * or virtual calls.
   *
   * Source disassembly:
   *   raw-port/re/disasm/__ZN20HgcOverexposureCheck5StateC2Ev.s (28 lines)
   */
  constructor() {
    // @0x6a1edc  xorps %xmm0, %xmm0 — xmm0 = { 0, 0, 0, 0 } (f32 domain).
    // @0x6a1ee7  movaps %xmm0, 0x10(%rax)
    this.lane_at_0x10.set([
      Math.fround(0),
      Math.fround(0),
      Math.fround(0),
      Math.fround(0),
    ]);
    // @0x6a1eeb  movaps %xmm0, (%rax)
    this.lane_at_0x00.set([
      Math.fround(0),
      Math.fround(0),
      Math.fround(0),
      Math.fround(0),
    ]);

    // @0x6a1eee  movaps 0x6667b(%rip), %xmm0
    //   = the 16 bytes at @Ozone 0x708570 (file offset 0x70c570):
    //     00 00 00 00 | 00 00 00 00 | 00 00 00 00 | 00 00 80 3f
    //   read as f32x4 = { 0.0f, 0.0f, 0.0f, 1.0f }; 0x3f800000 is 1.0f.
    const LANE_A_AT_0x708570: readonly [number, number, number, number] = [
      Math.fround(0.0), // @0x708570 f32 0x00000000
      Math.fround(0.0), // @0x708574 f32 0x00000000
      Math.fround(0.0), // @0x708578 f32 0x00000000
      Math.fround(1.0), // @0x70857c f32 0x3f800000
    ];
    // @0x6a1efd  movaps %xmm0, 0x30(%rax)
    this.lane_at_0x30.set(LANE_A_AT_0x708570);
    // @0x6a1f01  movaps %xmm0, 0x20(%rax)
    this.lane_at_0x20.set(LANE_A_AT_0x708570);

    // @0x6a1f05  movss 0x65043(%rip), %xmm0
    //   Scalar single load of the f32 at @Ozone 0x706f50 (file offset
    //   0x70af50) = 00 00 80 3f = 1.0f. The MEMORY form of `movss` writes
    //   xmm0[31:0] and ZEROES xmm0[127:32], so the full 16-byte lane that
    //   the two `movaps` stores below deposit is { 1.0f, 0, 0, 0 }.
    const LANE_B_AT_0x706f50: readonly [number, number, number, number] = [
      Math.fround(1.0), // @0x706f50 f32 0x3f800000
      Math.fround(0.0), // zeroed by movss (bits 63:32)
      Math.fround(0.0), // zeroed by movss (bits 95:64)
      Math.fround(0.0), // zeroed by movss (bits 127:96)
    ];
    // @0x6a1f15  movaps %xmm0, 0x50(%rax)
    this.lane_at_0x50.set(LANE_B_AT_0x706f50);
    // @0x6a1f19  movaps %xmm0, 0x40(%rax)
    this.lane_at_0x40.set(LANE_B_AT_0x706f50);

    // @0x6a1f1d  movaps 0x7264c(%rip), %xmm0
    // @0x6a1f28  movdqa -0x50(%rbp), %xmm0   — reloaded in the INTEGER domain
    //   = the 16 bytes at @Ozone 0x714570 (file offset 0x718570):
    //     ff ff ff ff | 00 00 00 00 | 00 00 00 00 | 00 00 00 00
    //   read as i32x4 = { -1, 0, 0, 0 } (0xffffffff as a signed 32-bit int).
    const LANE_C_AT_0x714570: readonly [number, number, number, number] = [
      -1 | 0, // @0x714570 i32 0xffffffff
      0 | 0, // @0x714574 i32 0x00000000
      0 | 0, // @0x714578 i32 0x00000000
      0 | 0, // @0x71457c i32 0x00000000
    ];
    // @0x6a1f2d  movaps %xmm0, 0x70(%rax)
    this.lane_at_0x70.set(LANE_C_AT_0x714570);
    // @0x6a1f31  movaps %xmm0, 0x60(%rax)
    this.lane_at_0x60.set(LANE_C_AT_0x714570);
    // @0x6a1f35..0x6a1f36  popq %rbp ; retq
  }
}

/**
 * Alias export: mangled symbol name.
 * @0x6a1ed0 Ozone  __ZN20HgcOverexposureCheck5StateC2Ev
 */
export function __ZN20HgcOverexposureCheck5StateC2Ev(): HgcOverexposureCheck_State {
  return new HgcOverexposureCheck_State();
}
