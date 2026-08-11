// tile_hoist.ts — Helium free function (internal linkage).
//
// Source: /Applications/Final Cut Pro.app/Contents/Frameworks/Helium.framework/
//         Versions/A/Helium (macOS FCP, x86_64 slice; unadjusted VAs).
//
// This unit ports ONE free function:
//
//   __ZL10tile_hoistR8HGLimitsRjS1_RK14HGShaderTiling
//     — tile_hoist(HGLimits&, unsigned int&, unsigned int&,
//                  HGShaderTiling const&)                    @Helium 0xc78f0
//
// `__ZL...` is Itanium for INTERNAL LINKAGE (a file-scope `static`), hence
// `nm` type `t`. Per PORTING_SPEC's naming rule a free function gets a file
// named after itself; Helium free functions live under raw-port/src/render/.
//
// Re-derive with:
//   raw-port/tools/disasm.sh --sym \
//     __ZL10tile_hoistR8HGLimitsRjS1_RK14HGShaderTiling Helium
//   -> raw-port/re/disasm/Helium.__ZL10tile_hoistR8HGLimitsRjS1_RK14HGShaderTiling.s
//      (70 lines)
//
// -----------------------------------------------------------------------------
// WHAT IT DOES
// -----------------------------------------------------------------------------
// Counts how many of the tiling descriptor's EIGHT axis slots are both selected
// by `tile_mask` (@0x34, bit i for slot i) and actually set (slot != 0xffffffff),
// writing the running count through the THIRD argument; then, separately, if the
// ninth slot @0x20 is set and flag bit 0x20 of byte @0x2b is on, bumps a 16-bit
// counter in the HGLimits by two.
//
// FRONTIER CALLEES — none. No calls at all: no in-scope callee, no extern, no
// allocation, no indirect or virtual dispatch (`depgraph.py deps
// __ZL10tile_hoistR8HGLimitsRjS1_RK14HGShaderTiling` lists nothing).
//
// -----------------------------------------------------------------------------
// FULL DISASM, with the argument registers named (System-V:
//   %rdi = HGLimits& limits, %rsi = unsigned int& outA,
//   %rdx = unsigned int& outB, %rcx = HGShaderTiling const& tiling)
// -----------------------------------------------------------------------------
//   0xc78f0  pushq %rbp ; 0xc78f1 movq %rsp,%rbp   ; frame (no TS counterpart)
//   0xc78f4  movl $0x0, (%rsi)          ; *outA = 0
//   0xc78fa  movl $0x0, (%rdx)          ; *outB = 0
//   0xc7900  movl 0x34(%rcx), %esi      ; esi = tiling.tile_mask
//                                       ; <-- THIS CLOBBERS %rsi, the outA
//                                       ;     pointer. See "OUT-PARAM A" below.
//   0xc7903  xorl %eax, %eax            ; count = 0
//   -- slot 0 --
//   0xc7905  testb $0x1, %sil           ; mask bit 0
//   0xc7909  je   0xc791e
//   0xc790b  cmpl $-0x1, (%rcx)         ; axisSlots[0] == 0xffffffff ?
//   0xc790e  je   0xc791e
//   0xc7910  movl $0x1, (%rdx)          ; *outB = 1   (count was 0, so a plain
//   0xc7919  movl $0x1, %eax            ;  store of 1 instead of an inc)
//   0xc7916  movl 0x34(%rcx), %esi      ; RELOAD the mask
//   -- slots 1..6, identical shape at 0xc791e / 0xc7931 / 0xc7944 / 0xc7957 /
//      0xc796a / 0xc797d, testing mask bits 0x02/0x04/0x08/0x10/0x20/0x40
//      against axisSlots[1..6] at 0x04/0x08/0x0c/0x10/0x14/0x18, each doing
//      `incl %eax ; movl %eax,(%rdx) ; movl 0x34(%rcx),%esi`
//   -- slot 7 --
//   0xc7990  testb %sil, %sil           ; mask bit 7 == the SIGN bit of the byte
//   0xc7993  jns  0xc799f               ; so the test is `jns`, not `je`
//   0xc7995  cmpl $-0x1, 0x1c(%rcx)
//   0xc7999  je   0xc799f
//   0xc799b  incl %eax ; 0xc799d movl %eax,(%rdx)     ; (no reload — last use)
//   -- the independent tail --
//   0xc799f  cmpl $-0x1, 0x20(%rcx)     ; the ninth slot
//   0xc79a3  je   0xc79b0
//   0xc79a5  testb $0x20, 0x2b(%rcx)    ; flag bit 0x20 of byte 0x2b
//   0xc79a9  je   0xc79b0
//   0xc79ab  addw $0x2, 0x14(%rdi)      ; limits.counter_at_0x14 += 2  (16-BIT add)
//   0xc79b0  popq %rbp ; 0xc79b1 retq   ; returns void
//
// -----------------------------------------------------------------------------
// DECODE NOTES
// -----------------------------------------------------------------------------
// OUT-PARAM A IS WRITTEN ONCE, WITH ZERO, AND NEVER AGAIN. `movl $0x0,(%rsi)`
//   @0xc78f4 is the only store through %rsi, because @0xc7900 immediately reuses
//   %rsi as the scratch register holding `tile_mask`. Every later store goes to
//   `(%rdx)`. That is not a decode slip — the second argument really does come
//   back as 0 no matter what the tiling contains, and this port reproduces
//   exactly that rather than "fixing" it into a second counter.
//
// THE MASK IS RE-READ AFTER EVERY STORE (@0xc7916, @0xc792e, @0xc7941,
//   @0xc7954, @0xc7967, @0xc797a, @0xc798d). The compiler could not prove that
//   the `unsigned int*` written through `%rdx` does not alias `tiling+0x34`, so
//   it reloads. In C++ a caller CAN pass `&someTiling.tile_mask` as `outB` and
//   observe the mask change mid-function. The TypeScript model cannot express
//   that aliasing — `outB` is a distinct box object and `tiling` is a distinct
//   class instance — so the reloads below re-read `tiling.tile_mask` at the same
//   seven points and simply observe the same value. The reads are kept, and this
//   note records the one caller behaviour the object model cannot reproduce.
//
// THE SIGN-BIT TEST. Slot 7 uses `testb %sil,%sil ; jns` rather than
//   `testb $0x80,%sil ; je`. Same predicate (bit 7 of the low byte), written the
//   way the compiler chose; the port spells it as bit 7 of the byte and says so.
//
// BYTE 0x2b IS THE TOP BYTE OF THE u32 FLAGS AT 0x28, which HGShaderTiling
//   already models as one `flags` field (see its header: "0x2b uint8 = high byte
//   of the flags word at 0x28"). `testb $0x20, 0x2b(%rcx)` is therefore
//   `flags & 0x20000000`, and it is written that way below — matching how the
//   landed `HGShaderTiling` methods spell their own 0x2b byte tests.
//
// ONLY THE COUNTER'S ADD IS 16-BIT. `addw $0x2, 0x14(%rdi)` wraps at 0xffff and
//   touches only two bytes; the count in %eax and every slot compare are 32-bit.
//
// -----------------------------------------------------------------------------
// ORACLE EVIDENCE (differential vs the LIVE Final Cut Pro binary)
// -----------------------------------------------------------------------------
// Checked against the real function. Harness: `arch -x86_64 /usr/bin/python3`
// (the port is transcribed from the x86_64 slice), dlopen Helium, resolve this
// LOCAL symbol as `nm -n -arch x86_64` vmaddr 0xc78f0 + the dyld image slide
// (NOT the bare `nm -n` in fct/parity/local_call — it reports the ARM64 slice
// even from a Rosetta process). Both structs are raw byte buffers filled with
// random noise, with only the fields this function reads overwritten, so an
// offset this port got wrong would show up immediately.
// 3,000 cases: each axis slot independently 0xffffffff / 0 / random (so the
// sentinel, the mask bits and their pairing are all exercised), the tail flag
// forced on half the time, masks drawn from 0 / 0xff / random, and the +0x14
// counter forced to 0xfffc..0xffff in a third of the cases so `addw`'s
// wraparound is actually reached (212 cases wrapped).
// RESULT: 3000/3000 agree on all three observable effects — outA, outB, and the
// 16-bit counter. Confirmed alongside it, directly from the binary: outA came
// back 0 in ALL 3,000 cases (the "written once and clobbered" decode above),
// no byte of the HGLimits buffer outside +0x14..+0x16 was touched, and the
// tiling buffer was never modified (the `const&` really is const).
// NEGATIVE CONTROLS (measured): writing the count to outA as well -> 2121 of
// 3000 wrong; letting slot 7 be counted by the loop AND the tail block -> 893
// wrong; adding 1 instead of 2 -> 1329 wrong; dropping the 16-bit mask on the
// counter -> 212 wrong (exactly the wrapping cases); testing flag bit
// 0x10000000 instead of 0x20000000 -> 895 wrong; using 0 instead of 0xffffffff
// as the unset sentinel -> 2215 wrong.

import type { HGLimits } from "./HGLimits.js";
import type { HGShaderTiling } from "./HGShaderTiling.js";

/** The "slot unset" sentinel every axis-slot compare uses (`cmpl $-0x1`). */
const TILE_HOIST_UNSET_SLOT = 0xffffffff;

/**
 * `tile_hoist(HGLimits& limits, unsigned int& outA, unsigned int& outB,
 *             HGShaderTiling const& tiling)` — @Helium 0xc78f0
 *   (__ZL10tile_hoistR8HGLimitsRjS1_RK14HGShaderTiling)
 *
 * Faithful transcription of the 70-line body quoted in the file header.
 *
 * Reference parameters follow the repo's out-param convention (a `{ value }`
 * box, as in HGAYCCToneCurveToLinearLUTInfo's colorAtIndex).
 *
 * @param limits %rdi — receives the 16-bit `+= 2` on its +0x14 counter, and
 *               only when the tail condition holds.
 * @param outA   %rsi — set to 0 and then never written again (see the decode
 *               note); it is an out-parameter in the signature only.
 * @param outB   %rdx — receives the count of set, mask-selected axis slots.
 * @param tiling %rcx — the descriptor being inspected; never modified.
 */
export function tile_hoist(
  limits: HGLimits,
  outA: { value: number },
  outB: { value: number },
  tiling: HGShaderTiling,
): void {
  // @0xc78f4  movl $0x0, (%rsi) — the one and only store through outA.
  outA.value = 0;
  // @0xc78fa  movl $0x0, (%rdx)
  outB.value = 0;

  // @0xc7900  movl 0x34(%rcx), %esi — load the mask (and clobber the outA
  //           pointer register, which is why outA is finished with above).
  let mask = tiling.tile_mask >>> 0;
  // @0xc7903  xorl %eax, %eax
  let count = 0;

  // Slots 0..6 — seven copies of the same shape (@0xc7905, @0xc791e, @0xc7931,
  // @0xc7944, @0xc7957, @0xc796a, @0xc797d), each testing mask bit i against
  // axisSlots[i] and, on a hit, incrementing the count, storing it through
  // outB, and RELOADING the mask.
  for (let i = 0; i < 7; i++) {
    // testb $(1<<i), %sil
    if ((mask & (1 << i)) === 0) {
      continue;
    }
    // cmpl $-0x1, 0x<4i>(%rcx) ; je — an unset slot is skipped.
    if ((tiling.axisSlots_at_0x00[i] >>> 0) === TILE_HOIST_UNSET_SLOT) {
      continue;
    }
    // incl %eax  (slot 0 uses `movl $0x1,%eax` @0xc7919, which is the same
    // value because the count is still 0 there).
    count = (count + 1) >>> 0;
    // movl %eax, (%rdx)
    outB.value = count;
    // movl 0x34(%rcx), %esi — the alias-defensive reload; see the decode note.
    mask = tiling.tile_mask >>> 0;
  }

  // Slot 7 — @0xc7990 `testb %sil,%sil ; jns`, i.e. bit 7 of the low byte.
  // No mask reload follows: this is the mask's last use.
  if ((mask & 0x80) !== 0) {
    // @0xc7995  cmpl $-0x1, 0x1c(%rcx)
    if ((tiling.axisSlots_at_0x00[7] >>> 0) !== TILE_HOIST_UNSET_SLOT) {
      // @0xc799b  incl %eax ; @0xc799d movl %eax,(%rdx)
      count = (count + 1) >>> 0;
      outB.value = count;
    }
  }

  // The tail is INDEPENDENT of everything above — it reads a different slot and
  // a different flag, and it is reached whether or not any slot matched.
  // @0xc799f  cmpl $-0x1, 0x20(%rcx)
  if ((tiling.extraSlot_at_0x20 >>> 0) !== TILE_HOIST_UNSET_SLOT) {
    // @0xc79a5  testb $0x20, 0x2b(%rcx) — bit 0x20 of the flags' top byte,
    //           i.e. bit 0x20000000 of the u32 flags at +0x28.
    if (((tiling.flags >>> 0) & 0x20000000) !== 0) {
      // @0xc79ab  addw $0x2, 0x14(%rdi) — a 16-BIT read-modify-write, so the
      //           sum wraps at 0xffff.
      limits.counter_at_0x14 = (limits.counter_at_0x14 + 2) & 0xffff;
    }
  }
  // @0xc79b1  retq — returns void.
}
