// HgcStraight.ts — Ozone framework (render layer).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/
//         Versions/A/Ozone  (macOS FCP, x86_64 slice).
//
// -----------------------------------------------------------------------------
// SYMBOL PORTED
// -----------------------------------------------------------------------------
//   * HgcStraight::State::State()   @Ozone 0x6b3010
//     __ZN11HgcStraight5StateC2Ev   (the C2 "base object" constructor)
//
//   re/disasm: raw-port/re/disasm/__ZN11HgcStraight5StateC2Ev.s
//
// -----------------------------------------------------------------------------
// FULL DISASM (18 lines, @0x6b3010..@0x6b3047)
// -----------------------------------------------------------------------------
//   __ZN11HgcStraight5StateC2Ev:
//     0x6b3010  pushq   %rbp
//     0x6b3011  movq    %rsp, %rbp
//     0x6b3014  movq    %rdi, -0x8(%rbp)         ; spill `this` (-O0 artifact)
//     0x6b3018  movq    -0x8(%rbp), %rax         ; reload it -> rax = this
//     0x6b301c  movaps  0x614bd(%rip), %xmm0     ; = 0x6b3023 + 0x614bd = 0x7144e0
//                                                ;   the 16-byte splat constant
//     0x6b3023  movaps  %xmm0, -0x20(%rbp)       ; round-trip through the stack
//     0x6b3027  movaps  -0x20(%rbp), %xmm0       ;   (-O0 artifact; value unchanged)
//     0x6b302b  movaps  %xmm0, 0x10(%rax)        ; this[+0x10 .. +0x1f] = splat
//     0x6b302f  movaps  %xmm0, (%rax)            ; this[+0x00 .. +0x0f] = splat
//     0x6b3032  xorps   %xmm0, %xmm0             ; xmm0 = 0
//     0x6b3035  movaps  %xmm0, -0x30(%rbp)       ; another -O0 stack round-trip
//     0x6b3039  movaps  -0x30(%rbp), %xmm0
//     0x6b303d  movaps  %xmm0, 0x30(%rax)        ; this[+0x30 .. +0x3f] = 0
//     0x6b3041  movaps  %xmm0, 0x20(%rax)        ; this[+0x20 .. +0x2f] = 0
//     0x6b3045  popq    %rbp
//     0x6b3046  retq
//     0x6b3047  nopw    (%rax,%rax)              ; alignment padding
//
// The two `-0x20(%rbp)` / `-0x30(%rbp)` spill-reload pairs are unoptimised-build
// artifacts: each writes a register to the stack frame and immediately reads the
// same 16 bytes back into the same register. They move no data into the object
// and are not modelled — the four `movaps` stores into (%rax) are the entire
// observable effect.
//
// -----------------------------------------------------------------------------
// SIZE + LAYOUT — `sizeof(HgcStraight::State) == 0x40`, pinned by the call site
// -----------------------------------------------------------------------------
// `HgcStraight::HgcStraight()` @Ozone 0x6b2de0 allocates the State before
// calling this constructor:
//     0x6b2e07  movl  $0x40, %edi
//     0x6b2e0c  callq __ZN16HgcCombineFields5StatenwEm   ; State::operator new(0x40)
//     0x6b2e1b  callq __ZN11HgcStraight5StateC1Ev        ; -> C2, this function
//     0x6b2e2a  movq  %rcx, 0x198(%rax)                  ; HgcStraight[+0x198] = the State
// so the object is exactly 0x40 = 64 bytes, and this constructor writes ALL of
// it (four 16-byte `movaps` stores at +0x00/+0x10/+0x20/+0x30 — no byte is left
// uninitialised).
//
// The `operator new` symbol printed at 0x6b2e0c is `HgcCombineFields::State::
// operator new(unsigned long)`, not HgcStraight's: every `Hgc*::State::operator
// new` in Ozone compiles to the identical body, so the linker folded them and
// the disassembler prints whichever name survived. It does not change the size
// operand, which is the fact this port depends on.
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
// None. The constructor has no `callq` of any kind — one rip-relative constant
// load and four stores. No in-scope callee, no extern, no indirect/virtual call.
// (`__ZN11HgcStraight5StateC1Ev` @0x6b2e90, the complete-object constructor, is
// a separate ledger unit; it is a bare `callq` trampoline into this C2 body.)

/**
 * The 16-byte constant at __TEXT 0x7144e0, loaded by the single
 * `movaps 0x614bd(%rip), %xmm0` @Ozone 0x6b301c (RIP-after = 0x6b3023;
 * 0x6b3023 + 0x614bd = 0x7144e0).
 *
 * Its bytes are `01 08 80 3f` repeated four times — i.e. four identical
 * float32 lanes with the bit pattern 0x3f800801, whose value is
 * 1 + 2049/2^23 = 1.0002442598342896.
 *
 * The value is reconstructed FROM THE BIT PATTERN rather than typed out as a
 * decimal literal, so the port cannot drift from the bytes in the binary by a
 * transcription rounding error.
 *
 * @0xADDR Ozone 0x7144e0
 */
export const HGC_STRAIGHT_STATE_SPLAT_0x7144e0: number = new Float32Array(
  new Uint32Array([0x3f800801]).buffer,
)[0];

/**
 * Number of float32 lanes in a `HgcStraight::State`: 0x40 bytes / 4 bytes per
 * lane = 16. The size comes from `movl $0x40, %edi` @Ozone 0x6b2e07 (the
 * `operator new` argument at the only construction site).
 *
 * @0xADDR Ozone 0x6b2e07
 */
export const HGC_STRAIGHT_STATE_F32_LANES = 0x40 / 4;

/**
 * `HgcStraight::State` — the 0x40-byte parameter block that
 * `HgcStraight::HgcStraight()` @Ozone 0x6b2de0 allocates and stores at
 * `HgcStraight+0x198`.
 *
 * The constructor manipulates it purely as four 16-byte SSE quads, and no
 * accessor in the class names any sub-field: `HgcStraight::SetParameter(int,
 * float, float, float, float)` @0x6b2fa0 and `HgcStraight::GetParameter(int,
 * float*)` @0x6b2fd0 both spill their arguments and immediately
 * `movl $0xffffffff, %eax; retq` — they touch no State memory at all. So the
 * port models the storage the way the machine does, as 16 float32 lanes with
 * each 16-byte store documented, rather than inventing field names the binary
 * does not support (PORTING_SPEC Rule 5: no fabricated fields).
 *
 * @Helium n/a — Ozone-only type.
 * @0xADDR Ozone 0x6b3010
 */
export class HgcStraightState {
  /**
   * The whole 0x40-byte object, as the 16 float32 lanes the four `movaps`
   * stores write. Lane i lives at byte offset 4*i:
   *   lanes[0..3]   -> +0x00 .. +0x0f   (written @0x6b302f)
   *   lanes[4..7]   -> +0x10 .. +0x1f   (written @0x6b302b)
   *   lanes[8..11]  -> +0x20 .. +0x2f   (written @0x6b3041)
   *   lanes[12..15] -> +0x30 .. +0x3f   (written @0x6b303d)
   *
   * A `Float32Array` also reproduces the machine's single-precision truncation
   * for free, so no `Math.fround` wrapper is needed at the store sites.
   *
   * @0xADDR Ozone 0x6b2e07 (the 0x40-byte allocation this mirrors)
   */
  readonly lanes = new Float32Array(HGC_STRAIGHT_STATE_F32_LANES);

  /**
   * `HgcStraight::State::State()` — @Ozone 0x6b3010
   * (`__ZN11HgcStraight5StateC2Ev`).
   *
   * Faithful line-for-line transcription of the 18-line disassembly quoted in
   * the file header. Four 16-byte stores, in the binary's own order:
   *
   *   1. `movaps %xmm0, 0x10(%rax)` @0x6b302b — splat constant into +0x10..+0x1f
   *   2. `movaps %xmm0, (%rax)`     @0x6b302f — splat constant into +0x00..+0x0f
   *   3. `movaps %xmm0, 0x30(%rax)` @0x6b303d — zero into +0x30..+0x3f
   *   4. `movaps %xmm0, 0x20(%rax)` @0x6b3041 — zero into +0x20..+0x2f
   *
   * The upper-then-lower ordering within each pair is what the compiler emitted
   * and is preserved here even though the two stores are disjoint; the whole
   * 0x40-byte object ends up initialised either way.
   *
   * Result: the first eight lanes are 1.0002442598342896f and the last eight
   * are +0.0f.
   *
   * @0xADDR Ozone 0x6b3010
   */
  constructor() {
    // @0x6b301c  movaps 0x614bd(%rip), %xmm0   ; xmm0 = four lanes of 0x3f800801
    const splat = HGC_STRAIGHT_STATE_SPLAT_0x7144e0;
    // @0x6b302b  movaps %xmm0, 0x10(%rax)      ; this[+0x10 .. +0x1f]
    this.lanes[4] = splat;
    this.lanes[5] = splat;
    this.lanes[6] = splat;
    this.lanes[7] = splat;
    // @0x6b302f  movaps %xmm0, (%rax)          ; this[+0x00 .. +0x0f]
    this.lanes[0] = splat;
    this.lanes[1] = splat;
    this.lanes[2] = splat;
    this.lanes[3] = splat;
    // @0x6b3032  xorps %xmm0, %xmm0            ; xmm0 = +0.0 in all four lanes
    const zero = 0;
    // @0x6b303d  movaps %xmm0, 0x30(%rax)      ; this[+0x30 .. +0x3f]
    this.lanes[12] = zero;
    this.lanes[13] = zero;
    this.lanes[14] = zero;
    this.lanes[15] = zero;
    // @0x6b3041  movaps %xmm0, 0x20(%rax)      ; this[+0x20 .. +0x2f]
    this.lanes[8] = zero;
    this.lanes[9] = zero;
    this.lanes[10] = zero;
    this.lanes[11] = zero;
    // @0x6b3045  popq %rbp
    // @0x6b3046  retq
  }
}
