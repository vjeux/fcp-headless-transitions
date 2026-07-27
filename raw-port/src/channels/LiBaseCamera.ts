// LiBaseCamera.ts — Ozone's LiBaseCamera. The only symbols exposed for
// this class in Ozone are its destructor pair AND the matching virtual-
// thunk destructors (`Tv0_n24_...`) that clang emits for a base class
// that participates in multiple inheritance with a virtual base. All
// four bodies are pure `ud2` (undefined instruction) traps: the compiler
// deliberately emitted an unreachable body, so calling any of them
// aborts the process (SIGILL) at that instruction. This is what clang
// emits for an abstract class whose destructor is not expected to run
// (concrete overrides do all the actual teardown).
//
// Transcribed from the disassembly of /Applications/Final Cut Pro.app/
// Contents/Frameworks/Ozone.framework/Versions/A/Ozone.
//
// DECODE. All four symbols are transcribed exactly:
//   D1        @Ozone 0x6dae50:  push rbp / mov rbp,rsp / ud2 / nopw ...
//   D0        @Ozone 0x6dae60:  push rbp / mov rbp,rsp / ud2 / nopw ...
//   Tv0_n24 D1@Ozone 0x6dae70:  push rbp / mov rbp,rsp / ud2 / nopw ...
//   Tv0_n24 D0@Ozone 0x6dae80:  push rbp / mov rbp,rsp / ud2 / nopw ...
// The `Tv0_n24` prefix is the Itanium C++ ABI mangling for a virtual
// thunk with `this` offset 0 and a virtual-base offset read from the
// vtable slot at -0x18 (n24 = -24 bytes). It confirms the class
// participates in a diamond / virtual-base hierarchy, but since the
// bodies are `ud2` traps we cannot recover any of that layout from
// these symbols. Nothing about struct layout is recoverable here (no
// field access, no vtbl-slot install, no callee); any layout / concrete
// behaviour is FRONTIER and deferred to whichever concrete subclass or
// base-class port lands.

/**
 * `LiBaseCamera` — an Ozone abstract camera base. Every emitted dtor
 * (regular pair + virtual-thunk pair) is a `ud2` trap in the shipped
 * binary.
 *
 * Faithful port surface: each dtor entry point throws on entry,
 * mirroring the `ud2` semantics.
 */
export class LiBaseCamera {
  /**
   * `LiBaseCamera::~LiBaseCamera()` @Ozone 0x6dae50 (D1, non-deleting /
   * base-object dtor).
   *
   * Disasm (all @Ozone):
   *   0x6dae50  push rbp
   *   0x6dae51  mov  rbp, rsp
   *   0x6dae54  ud2                    ; undefined instruction — traps.
   *   0x6dae56  nopw cs:[rax+rax]      ; padding.
   */
  dispose(): void {
    // @0x6dae54: `ud2` — clang emits this for "should never be called".
    throw new Error(
      "LiBaseCamera::~LiBaseCamera() @Ozone 0x6dae50 (D1) is a `ud2` trap in " +
        "the shipped binary — reaching it aborts the process (SIGILL).",
    );
  }

  /**
   * `LiBaseCamera::~LiBaseCamera()` @Ozone 0x6dae60 (D0, deleting dtor).
   *
   * Disasm (all @Ozone):
   *   0x6dae60  push rbp
   *   0x6dae61  mov  rbp, rsp
   *   0x6dae64  ud2                    ; undefined instruction — traps.
   *   0x6dae66  nopw cs:[rax+rax]      ; padding.
   */
  dispose_and_delete(): void {
    // @0x6dae64: `ud2` — clang emits this for "should never be called".
    throw new Error(
      "LiBaseCamera::~LiBaseCamera() @Ozone 0x6dae60 (D0) is a `ud2` trap in " +
        "the shipped binary — reaching it aborts the process (SIGILL).",
    );
  }

  /**
   * Virtual-thunk to `LiBaseCamera::~LiBaseCamera()` (D1) @Ozone
   * 0x6dae70 — Itanium C++ ABI symbol
   * `_ZTv0_n24_N12LiBaseCameraD1Ev`. The `Tv0_n24` prefix means "adjust
   * `this` by 0 and by the virtual-base offset read from the vtable
   * slot at -0x18 (n24 bytes), then jump to the real D1". In the
   * shipped binary this thunk was collapsed to a `ud2` — same reason
   * the direct D1 above is a trap.
   *
   * Disasm (all @Ozone):
   *   0x6dae70  push rbp
   *   0x6dae71  mov  rbp, rsp
   *   0x6dae74  ud2                    ; undefined instruction — traps.
   *   0x6dae76  nopw cs:[rax+rax]      ; padding.
   */
  dispose_virtual_thunk(): void {
    // @0x6dae74: `ud2`.
    throw new Error(
      "Virtual-thunk _ZTv0_n24_N12LiBaseCameraD1Ev @Ozone 0x6dae70 is a `ud2` " +
        "trap in the shipped binary — reaching it aborts the process (SIGILL).",
    );
  }

  /**
   * Virtual-thunk to `LiBaseCamera::~LiBaseCamera()` (D0) @Ozone
   * 0x6dae80 — Itanium C++ ABI symbol
   * `_ZTv0_n24_N12LiBaseCameraD0Ev`. Deleting-dtor counterpart of the
   * D1 thunk above; same collapse to `ud2`.
   *
   * Disasm (all @Ozone):
   *   0x6dae80  push rbp
   *   0x6dae81  mov  rbp, rsp
   *   0x6dae84  ud2                    ; undefined instruction — traps.
   *   0x6dae86  nopw cs:[rax+rax]      ; padding.
   */
  dispose_and_delete_virtual_thunk(): void {
    // @0x6dae84: `ud2`.
    throw new Error(
      "Virtual-thunk _ZTv0_n24_N12LiBaseCameraD0Ev @Ozone 0x6dae80 is a `ud2` " +
        "trap in the shipped binary — reaching it aborts the process (SIGILL).",
    );
  }
}
