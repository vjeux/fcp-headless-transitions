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
//   @Helium 0x625e0  HGRenderQueue::SetSerializeRendersFlag(bool)          (FULL)
//                    mangled: __ZN13HGRenderQueue23SetSerializeRendersFlagEb
//                    DECODE:  raw-port/re/disasm/Helium.__ZN13HGRenderQueue23SetSerializeRendersFlagEb.s
//   @Helium 0x62610  HGRenderQueue::SetOpenGLSupport(bool)                (FULL)
//                    mangled: __ZN13HGRenderQueue16SetOpenGLSupportEb
//                    DECODE:  raw-port/re/disasm/Helium.__ZN13HGRenderQueue16SetOpenGLSupportEb.s
//
//   @Helium 0x627f0  HGRenderQueue::SetMTLRenderSyncLevel(int)            (FULL)
//                    mangled: __ZN13HGRenderQueue21SetMTLRenderSyncLevelEi
//                    DECODE:  raw-port/re/disasm/Helium.__ZN13HGRenderQueue21SetMTLRenderSyncLevelEi.s
//
//   @Helium 0x62620  HGRenderQueue::SetDebugQueueVerboseMask(unsigned int) (FULL)
//                    mangled: __ZN13HGRenderQueue24SetDebugQueueVerboseMaskEj
//                    DECODE:  raw-port/re/disasm/Helium.__ZN13HGRenderQueue24SetDebugQueueVerboseMaskEj.s
//
//   @Helium 0x62600  HGRenderQueue::SetSerializeCustomRenderJobsFlag(bool) (FULL)
//                    mangled: __ZN13HGRenderQueue32SetSerializeCustomRenderJobsFlagEb
//                    DECODE:  raw-port/re/disasm/Helium.__ZN13HGRenderQueue32SetSerializeCustomRenderJobsFlagEb.s
//
// Every other member of the class (the ctors @0x60ba0 / @0x61480, the dtors
// @0x61490 / @0x61c60 / @0x61c70, CreateRenderContextForComputeDevice @0x61c90,
// AddRenderContext @0x61e00, SetRunMode @0x62560, SetPreferredResource @0x625a0,
// SetDebugQueueVerboseMask @0x62620,
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
   * `+0x44  uint32 debugQueueVerboseMask` — the queue's debug-logging bitmask.
   *
   * It is a BITMASK, not a level: the queue's hot paths test individual bits
   * of this exact slot —
   *   `testb $0x1,  0x44(%r15)` @Helium 0x68517  (GetRenderJob)
   *   `testb $0x2,  0x44(%rbx)` @Helium 0x675a1  (NotifyIdleRenderUnits)
   *   `testb $0x2,  0x44(%r15)` @Helium 0x68696  (GetRenderJob)
   *   `testb $0x10, 0x44(%r14)` @Helium 0x68fa7, 0x69211, 0x69281, 0x693cf,
   *                             0x69473                (GetRenderJobFromQueue)
   *   `testb $0x40, 0x44(%r14)` @Helium 0x6923c        (GetRenderJobFromQueue)
   * plus whole-word "any logging at all?" checks
   *   `cmpl $0x0, 0x44(%r14)` @Helium 0x68a0c, `cmpl $0x0, 0x44(%rbx)`
   *   @Helium 0x69bad (EnqueueUserJob) and @Helium 0x6b435 / 0x6b4e8
   *   (GetUserJobFromQueue), and a full read `movl 0x44(%rbx), %eax`
   *   @Helium 0x6b7dd (EnqueueGPUReadbackJob).
   * Read back verbatim by `GetDebugQueueVerboseMask()` @Helium 0x62634
   * (`movl 0x44(%rdi), %eax`).
   *
   * Initial value 0: the ctor seeds the slot from the file-static
   * `sHeliumRenderQueueDefaultLogging` (`movl <sym>(%rip), %eax` @Helium
   * 0x60bfd then `movl %eax, 0x44(%rbx)` @Helium 0x60c03; repeated on the
   * second path @Helium 0x60f73/0x60f79). That symbol is
   * `__ZL32sHeliumRenderQueueDefaultLogging` @Helium 0xadcef8, an `nm`-class
   * `b` (__DATA __bss) symbol — i.e. ZERO at image load. The only writer is
   * the ctor's dispatch_once block `____ZN13HGRenderQueueC2Ev_block_invoke`
   * @Helium 0x613bd, which is a separate unit and is not transcribed here; so
   * this port models the load-time value and does not invent a configured one.
   *
   * Written by {@link HGRenderQueue.SetDebugQueueVerboseMask} @Helium 0x62624.
   */
  debugQueueVerboseMask = 0;

  /**
   * `HGRenderQueue::SetDebugQueueVerboseMask(unsigned int)` — Helium @0x00062620
   * (mangled `__ZN13HGRenderQueue24SetDebugQueueVerboseMaskEj`).
   *
   * Full transcription — every instruction of the function, in order
   * (raw-port/re/disasm/Helium.__ZN13HGRenderQueue24SetDebugQueueVerboseMaskEj.s):
   *
   *   0x62620  pushq %rbp                 ; frame setup (no TS counterpart)
   *   0x62621  movq  %rsp, %rbp           ; frame setup (no TS counterpart)
   *   0x62624  movl  %esi, 0x44(%rdi)     ; this->debugQueueVerboseMask = mask
   *   0x62627  popq  %rbp                 ; frame teardown (no TS counterpart)
   *   0x62628  retq                       ; void return
   *   0x62629  nopl  (%rax)               ; alignment padding, not executed
   *
   * One `movl`, nothing else: the `unsigned int` argument arrives in `%esi`
   * and is stored verbatim. Like its two siblings above it takes NO lock
   * (contrast `SetRunMode` @0x62560), calls nothing, validates nothing, masks
   * nothing (any bit pattern is accepted, including bits no reader tests) and
   * returns nothing.
   *
   * `>>> 0` reproduces the UNSIGNED 32-bit width of the store — the mangled
   * `j` is `unsigned int`, and every consumer reads the slot with `movl` /
   * `testb` / `cmpl`, never sign-extending it.
   *
   * @param mask the new debug-verbose bitmask (`%esi`).
   */
  SetDebugQueueVerboseMask(mask: number): void {
    // @Helium 0x62624: movl %esi, 0x44(%rdi)
    this.debugQueueVerboseMask = mask >>> 0;
  }

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

  /**
   * `+0x48  bool serializeRenders48` — first of the two bytes that
   * `SetSerializeRendersFlag` keeps in lock-step (it is the SECOND one the
   * setter writes: @Helium 0x625e8 `movb %sil, 0x48(%rdi)`).
   *
   * Defaults to `true`: the ctor's `movl $0x10101, 0x48(%rbx)` @Helium 0x60c06
   * is one 4-byte store that lands 0x01 in +0x48, 0x01 in +0x49, 0x01 in
   * +0x4a and 0x00 in +0x4b. (The next ctor writes are `movw $0x0, 0x4c`
   * @0x60c0d and `movb $0x1, 0x4e` @0x60c13, which bound this quartet.)
   */
  serializeRenders48 = true;

  /**
   * `+0x49  bool serializeRenders49` — second byte of the same pair, written
   * FIRST by the setter (@Helium 0x625e4 `movb %sil, 0x49(%rdi)`).
   *
   * The two bytes are distinct object slots — the neighbours prove the region
   * is a run of independent byte flags, not one wider field:
   *   +0x4a  SetRelaxRenderSerializationForPriorityInversionsFlag(bool)
   *          @Helium 0x625f4 `movb %sil, 0x4a(%rdi)`
   *   +0x4b  SetSerializeCustomRenderJobsFlag(bool)
   *          @Helium 0x62604 `movb %sil, 0x4b(%rdi)`
   * — so this port keeps them as two fields and writes both, in the binary's
   * order, rather than collapsing them into one boolean (which would silently
   * drop one of the two stores). No decoded reader distinguishes them yet, so
   * they are named by offset instead of being given invented roles.
   *
   * Defaults to `true` from the same ctor store @Helium 0x60c06.
   */
  serializeRenders49 = true;

  /**
   * `HGRenderQueue::SetSerializeRendersFlag(bool)` — Helium @0x000625e0
   * (mangled `__ZN13HGRenderQueue23SetSerializeRendersFlagEb`).
   *
   * Full transcription — every instruction of the function, in order
   * (raw-port/re/disasm/Helium.__ZN13HGRenderQueue23SetSerializeRendersFlagEb.s):
   *
   *   0x625e0  pushq %rbp                 ; frame setup (no TS counterpart)
   *   0x625e1  movq  %rsp, %rbp           ; frame setup (no TS counterpart)
   *   0x625e4  movb  %sil, 0x49(%rdi)     ; this->serializeRenders49 = arg
   *   0x625e8  movb  %sil, 0x48(%rdi)     ; this->serializeRenders48 = arg
   *   0x625ec  popq  %rbp                 ; frame teardown (no TS counterpart)
   *   0x625ed  retq                       ; void return
   *   0x625ee  nop                        ; alignment padding, not executed
   *
   * TWO byte stores of the SAME `bool` argument (`%sil`, the low byte of the
   * second integer argument register under SysV), to TWO different offsets,
   * in the order +0x49 then +0x48 — both are transcribed, in that order.
   * The compiler did NOT fuse them into a single 2-byte `movw`, which is
   * further evidence they are separate declared members rather than one field.
   *
   * Like `SetOpenGLSupport` @0x62610 and unlike `SetRunMode` @0x62560 (which
   * brackets its store with `HGSynchronizable::Lock()` @0x62579 /
   * `Unlock()` @0x62585), this setter takes NO lock. No callees, no externs,
   * no indirect calls, no validation, no return value.
   *
   * @param serialize the new serialize-renders flag (`%sil`).
   */
  SetSerializeRendersFlag(serialize: boolean): void {
    // @Helium 0x625e4: movb %sil, 0x49(%rdi)
    this.serializeRenders49 = serialize;
    // @Helium 0x625e8: movb %sil, 0x48(%rdi)
    this.serializeRenders48 = serialize;
  }

  /**
   * `+0x4b  bool serializeCustomRenderJobs` — fourth byte of the flag quartet
   * the ctor initializes with the single `movl $0x10101, 0x48(%rbx)`
   * @Helium 0x60c06: that store lands 0x01 in +0x48/+0x49/+0x4a and **0x00**
   * in +0x4b, so this flag defaults to `false` (unlike its three neighbours).
   * The next ctor writes — `movw $0x0, 0x4c` @0x60c0d — bound the quartet.
   *
   * It is a real, independently addressed slot, not a duplicate of +0x48/+0x49:
   *   * the only writer inside the class is
   *     {@link HGRenderQueue.SetSerializeCustomRenderJobsFlag} @Helium 0x62604
   *     (`movb %sil, 0x4b(%rdi)`);
   *   * the only reader is `GetRenderJobFromQueue` @Helium 0x691c6
   *     (`cmpb $0x1, 0x4b(%r14)` — an explicit compare against 1, i.e. the
   *     slot is consumed as a C++ `bool`);
   *   * `CreateRenderQueue` @Helium 0x6c855/0x6c85b copies it across from the
   *     matching byte of the HGRenderQueueSetupProperties argument
   *     (`movzbl 0x4b(%r12), %eax` then `movb %al, 0x4b(%r13)`) — and that
   *     properties object zeroes the same slot from its own
   *     `movl $0x10101, 0x48(%rbx)` @Helium 0x71178.
   */
  serializeCustomRenderJobs = false;

  /**
   * `HGRenderQueue::SetSerializeCustomRenderJobsFlag(bool)` — Helium @0x00062600
   * (mangled `__ZN13HGRenderQueue32SetSerializeCustomRenderJobsFlagEb`).
   *
   * Full transcription — every instruction of the function, in order
   * (raw-port/re/disasm/Helium.__ZN13HGRenderQueue32SetSerializeCustomRenderJobsFlagEb.s):
   *
   *   0x62600  pushq %rbp                 ; frame setup (no TS counterpart)
   *   0x62601  movq  %rsp, %rbp           ; frame setup (no TS counterpart)
   *   0x62604  movb  %sil, 0x4b(%rdi)     ; this->serializeCustomRenderJobs = arg
   *   0x62608  popq  %rbp                 ; frame teardown (no TS counterpart)
   *   0x62609  retq                       ; void return
   *   0x6260a  nopw  (%rax,%rax)          ; alignment padding, not executed
   *
   * ONE byte store — note the contrast with its immediate neighbour
   * `SetSerializeRendersFlag` @0x625e0 just above, which stores the same
   * argument TWICE (+0x49 then +0x48). This one touches only +0x4b, and the
   * port must not mirror it into any sibling flag.
   *
   * `%sil` is the low byte of the second integer argument register, i.e. the
   * `bool` parameter under the SysV AMD64 ABI, and `movb` writes exactly that
   * one byte — +0x48/+0x49/+0x4a are left untouched.
   *
   * Like the other setters in this file and unlike `SetRunMode` @0x62560
   * (which brackets its store with `HGSynchronizable::Lock()`/`Unlock()` on
   * the synchronizable at +0x150), it takes NO lock. No callees, no externs,
   * no indirect calls, no validation, no return value.
   *
   * @param serialize the new serialize-custom-render-jobs flag (`%sil`).
   */
  SetSerializeCustomRenderJobsFlag(serialize: boolean): void {
    // @Helium 0x62604: movb %sil, 0x4b(%rdi)
    this.serializeCustomRenderJobs = serialize;
  }
}
