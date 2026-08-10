// raw-port/src/render/HGRenderQueue.ts
//
// FCP `HGRenderQueue` — Helium's global render scheduler: it owns the render
// contexts (one per compute device), the render/user/GPU-readback job queues,
// and the exec-unit pool that drains them. Derives from `HGObject`
// (ctor @Helium 0x60bb7 `callq __ZN8HGObjectC2Ev`).
//
// Framework binary: /Applications/Final Cut Pro.app/Contents/Frameworks/
//                   Helium.framework/Versions/A/Helium
//                   (macOS FCP, x86_64 slice; VA == offset in the thin slice).
//
// METHODS PORTED IN THIS FILE (one C++ method = one member citing its @0xADDR):
//
//   @Helium 0x62610  HGRenderQueue::SetOpenGLSupport(bool)                (FULL)
//                    mangled: __ZN13HGRenderQueue16SetOpenGLSupportEb
//                    DECODE:  raw-port/re/disasm/Helium.__ZN13HGRenderQueue16SetOpenGLSupportEb.s
//
//   @Helium 0x627f0  HGRenderQueue::SetMTLRenderSyncLevel(int)            (FULL)
//                    mangled: __ZN13HGRenderQueue21SetMTLRenderSyncLevelEi
//                    DECODE:  raw-port/re/disasm/Helium.__ZN13HGRenderQueue21SetMTLRenderSyncLevelEi.s
//
// Every other member of the class (the ctors @0x60ba0 / @0x61480, the dtors
// @0x61490 / @0x61c60 / @0x61c70, CreateRenderContextForComputeDevice @0x61c90,
// AddRenderContext @0x61e00, SetRunMode @0x62560, SetPreferredResource @0x625a0,
// SetSerializeRendersFlag @0x625e0, SetDebugQueueVerboseMask @0x62620,
// GetRunMode @0x62640, Start @0x62800, Pause @0x62a50, Drain @0x62c90,
// Shutdown @0x63050, EnqueueRenderJob @0x63600, …) is NOT ported here. This
// file is ADD-ONLY: each of those lands as its own member, citing its own
// address, when its unit is claimed.
//
// ── FIELD-LAYOUT EVIDENCE USED BY THIS METHOD ──────────────────────────────
//   +0x28  bool  openGLSupport
//
//   Written by the ONLY instruction of interest in this unit:
//     SetOpenGLSupport @Helium 0x62614  `movb %sil, 0x28(%rdi)`
//   — a single-BYTE store of the incoming `bool` (SysV passes it in the low
//   byte of the second integer argument register, `%sil`).
//
//   The default constructor pins the same slot and its default value:
//     HGRenderQueue::HGRenderQueue() @Helium 0x60bdc  `movl $0x1, 0x28(%rbx)`
//   (raw-port/re/disasm/Helium.__ZN13HGRenderQueueC2Ev.s) — a 4-byte store of
//   1 covering the bool at +0x28 plus the three padding bytes +0x29..+0x2b, so
//   a freshly constructed queue has OpenGL support ENABLED. The next field the
//   ctor writes is at +0x30 (@0x60be3 `movq $0x0, 0x30(%rbx)`), which is what
//   bounds this slot to the 4 bytes at +0x28.
//
//   The neighbouring setters confirm that this class stores its flags as
//   plain byte/word members at fixed offsets rather than in a bitfield, and
//   that +0x28 is NOT shared with any of them:
//     SetDebugQueueVerboseMask(u32) @0x62624 `movl %esi, 0x44(%rdi)`     → +0x44
//     SetSerializeRendersFlag(bool) @0x625e4 `movb %sil, 0x49(%rdi)`
//                                   @0x625e8 `movb %sil, 0x48(%rdi)`     → +0x48/+0x49
//     SetRunMode(RunMode)           @0x6257e `movl %ebx, 0xc(%r14)`      → +0x0c
//                                   (that one takes the HGSynchronizable at
//                                    +0x150 first — @0x6256f/@0x62579 — which
//                                    is exactly why the lock-free byte store
//                                    below is faithful: SetOpenGLSupport
//                                    deliberately takes NO lock.)
//
// NUMERICS: a single `movb` of a C++ `bool` — no integer widening, no floating
// point, nothing to fround. The stored value is the caller's 0/1 byte.
//
// Per PORTING_SPEC.md Rules 1, 2, 5, 6: instruction-for-instruction, every
// offset cited @0xADDR, one FCP class per file.

export class HGRenderQueue {
  /**
   * `+0x28  bool openGLSupport` — whether this render queue may create and
   * drive OpenGL-backed renderers.
   *
   * Defaults to `true`: the default ctor's `movl $0x1, 0x28(%rbx)`
   * @Helium 0x60bdc stores 1 into this slot (as part of a 4-byte store that
   * also zeroes the +0x29..+0x2b padding). Written byte-wise by
   * {@link HGRenderQueue.SetOpenGLSupport} @Helium 0x62614.
   */
  openGLSupport = true;

  /**
   * `+0x3c  int32 mtlRenderSyncLevel` — the Metal render synchronization level.
   *
   * Defaults to **-1**: the default ctor loads the 64-bit immediate
   * `movabsq $-0x100000000, %rax` @Helium 0x60beb (= 0xFFFFFFFF_00000000) and
   * stores it as one 8-byte write `movq %rax, 0x38(%rbx)` @Helium 0x60bf5 —
   * so the u32 at +0x38 becomes 0 and the i32 at +0x3c becomes 0xffffffff,
   * i.e. -1 signed. (The next field the ctor writes is the byte at +0x40
   * @0x60bf9, which bounds this slot.)
   *
   * The factory `CreateRenderQueue(HGRenderQueueSetupProperties*, bool)` then
   * overwrites it with 1 (`movl $0x1, 0x3c(%rax)` @Helium 0x6ccf4) — but only
   * when its setup count is strictly greater than 1, per the unsigned guard
   * `cmpq $0x1, -0xb8(%rbp)` @0x6cce6 / `jbe 0x6ccfb` @0x6ccee.
   *
   * Written by {@link HGRenderQueue.SetMTLRenderSyncLevel} @Helium 0x627f4.
   */
  mtlRenderSyncLevel = -1;

  /**
   * `HGRenderQueue::SetMTLRenderSyncLevel(int)` — Helium @0x000627f0
   * (mangled `__ZN13HGRenderQueue21SetMTLRenderSyncLevelEi`).
   *
   * Full transcription — every instruction of the function, in order
   * (raw-port/re/disasm/Helium.__ZN13HGRenderQueue21SetMTLRenderSyncLevelEi.s):
   *
   *   0x627f0  pushq %rbp                 ; frame setup (no TS counterpart)
   *   0x627f1  movq  %rsp, %rbp           ; frame setup (no TS counterpart)
   *   0x627f4  movl  %esi, 0x3c(%rdi)     ; this->mtlRenderSyncLevel = level
   *   0x627f7  popq  %rbp                 ; frame teardown (no TS counterpart)
   *   0x627f8  retq                       ; void return
   *   0x627f9  nopl  (%rax)               ; alignment padding, not executed
   *
   * The whole method is that one `movl`: the `int` argument arrives in `%esi`
   * (the second integer argument register, i.e. the first after `this`) and is
   * stored verbatim to +0x3c. Exactly like the sibling `SetOpenGLSupport`
   * above, it takes NO lock (contrast `SetRunMode` @0x62560, which brackets
   * its store with `HGSynchronizable::Lock()`/`Unlock()` on +0x150), makes no
   * call, performs no validation or clamping, and returns nothing.
   *
   * `| 0` reproduces the 32-bit signed width of the `movl` store (`i` in the
   * mangled name = `int`), matching the -1 the ctor leaves in the same slot.
   *
   * @param level the new Metal render sync level (`%esi`).
   */
  SetMTLRenderSyncLevel(level: number): void {
    // @Helium 0x627f4: movl %esi, 0x3c(%rdi)
    this.mtlRenderSyncLevel = level | 0;
  }

  /**
   * `HGRenderQueue::SetOpenGLSupport(bool)` — Helium @0x00062610
   * (mangled `__ZN13HGRenderQueue16SetOpenGLSupportEb`).
   *
   * Full transcription — every instruction of the function, in order
   * (raw-port/re/disasm/Helium.__ZN13HGRenderQueue16SetOpenGLSupportEb.s):
   *
   *   0x62610  pushq %rbp                 ; frame setup (no TS counterpart)
   *   0x62611  movq  %rsp, %rbp           ; frame setup (no TS counterpart)
   *   0x62614  movb  %sil, 0x28(%rdi)     ; this->openGLSupport = arg
   *   0x62618  popq  %rbp                 ; frame teardown (no TS counterpart)
   *   0x62619  retq                       ; void return
   *   0x6261a  nopw  (%rax,%rax)          ; alignment padding, not executed
   *
   * A plain unsynchronized byte store: no lock is taken (contrast the sibling
   * `SetRunMode` @0x62560, which brackets its store with
   * `HGSynchronizable::Lock()` @0x62579 / `Unlock()` @0x62585 on the
   * synchronizable at +0x150), no callees, no externs, no indirect calls, no
   * validation of the incoming value, and no return value.
   *
   * `%sil` is the low byte of the second integer argument register, i.e. the
   * `bool` parameter under the SysV AMD64 ABI, and `movb` stores exactly that
   * one byte — the three padding bytes at +0x29..+0x2b are left untouched.
   *
   * @param support the new OpenGL-support flag (`%sil`).
   */
  SetOpenGLSupport(support: boolean): void {
    // @Helium 0x62614: movb %sil, 0x28(%rdi)
    this.openGLSupport = support;
  }
}
