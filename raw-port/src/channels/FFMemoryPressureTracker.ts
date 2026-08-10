// FFMemoryPressureTracker — Flexo class that tracks the process's current
// memory-pressure state behind a std::mutex. This file ports
// FFMemoryPressureTracker::getCurrentState() const, which snapshots two
// fields (an integer/opaque state word + a double level) under the lock and
// returns them as a {state, value} pair. Transcribed line-for-line from
// otool -tV output; the method cites its @0xADDR in Flexo/x86_64.
//
// Verbatim from FCP's Flexo framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// Source disassembly (this worktree, raw-port/re/disasm/):
//   Flexo.__ZNK23FFMemoryPressureTracker15getCurrentStateEv.s
//
// Referenced externs (out-of-scope C++ runtime — libc++ std::mutex):
//   std::__1::mutex::lock()    __ZNSt3__15mutex4lockEv    @Flexo 0x12bfc54 (call to stub 0x14973b0)
//   std::__1::mutex::unlock()  __ZNSt3__15mutex6unlockEv  @Flexo 0x12bfc70 (call to stub 0x14973b6)
// JS is single-threaded, so the lock/unlock have no observable value effect;
// they are kept as bridge no-ops for provenance and a future worker port.
//
// -- STRUCT LAYOUT (recovered from this method) ----------------------------
//
//   offset  size  field                      @Flexo cite (getCurrentState)
//   ------  ----  ------------------------   -----------------------------------
//   +0x08   0x38  lock : std::mutex          0x12bfc4d leaq 0x8(%rdi),%r14 then
//                                            mutex::lock()/unlock() on it
//   +0x88   0x08  state : int64 (opaque)     0x12bfc59 movq 0x88(%rbx),%r15
//   +0x90   0x08  value : double             0x12bfc60 movsd 0x90(%rbx),%xmm0
//
// RETURN ABI. The function returns a 16-byte aggregate {int64, double}: the
// int64 in %rax (0x12bfc75 movq %r15,%rax) and the double in %xmm0
// (0x12bfc78 movsd -0x20(%rbp),%xmm0, spilled from the pre-unlock read). We
// model that as a { state: bigint; value: number } object. The double is
// spilled to the stack at 0x12bfc68 BEFORE unlock() then reloaded at
// 0x12bfc78 AFTER unlock() — we read both fields before the (no-op) unlock to
// mirror that the snapshot is taken while the lock is held.
//
// @class Flexo FFMemoryPressureTracker

/** The 16-byte aggregate returned by getCurrentState(): the opaque int64
 *  state word (%rax) and the double pressure level (%xmm0). */
export interface FFMemoryPressureState {
  /** int64 at self+0x88, returned in %rax. Modeled as bigint to preserve the
   *  full 64-bit width (may be an enum/pointer-sized state word). */
  state: bigint;
  /** double at self+0x90, returned in %xmm0. */
  value: number;
}

/**
 * FFMemoryPressureTracker — holds the current memory-pressure state (an int64
 * word + a double level) guarded by a std::mutex at +0x08. Only
 * getCurrentState() const is ported here; the remaining methods are
 * backlogged. Fields are declared so this and future sibling methods can read
 * and write them as plain fields, mirroring the `N(%rbx)` loads in the disasm.
 * @class Flexo FFMemoryPressureTracker
 */
export class FFMemoryPressureTracker {
  /** +0x08 std::mutex — JS is single-threaded so this is a bridge no-op kept
   *  for provenance. @Flexo 0x12bfc4d (leaq 0x8(%rdi),%r14). */
  private lock: { locked: boolean } = { locked: false };

  /** +0x88 int64 opaque state word. @Flexo 0x12bfc59 (movq 0x88(%rbx),%r15). */
  private state: bigint = 0n;

  /** +0x90 double pressure level. @Flexo 0x12bfc60 (movsd 0x90(%rbx),%xmm0). */
  private value: number = 0;

  /**
   * FFMemoryPressureTracker::getCurrentState() const
   *
   * Instruction structure (@0x12bfc40):
   *   r14 = self + 0x8;                 ; leaq 0x8(%rdi),%r14   @0x12bfc4d
   *   std::mutex::lock(r14);            ; callq stub            @0x12bfc54
   *   r15  = *(int64*)(self + 0x88);    ; movq 0x88(%rbx),%r15  @0x12bfc59
   *   xmm0 = *(double*)(self + 0x90);   ; movsd 0x90(%rbx),%xmm0 @0x12bfc60
   *   spill xmm0 -> -0x20(%rbp);        ; movsd %xmm0,-0x20(%rbp) @0x12bfc68
   *   std::mutex::unlock(r14);          ; callq stub            @0x12bfc70
   *   rax  = r15;                       ; movq %r15,%rax        @0x12bfc75
   *   xmm0 = *(double*)(-0x20(%rbp));   ; movsd -0x20(%rbp),%xmm0 @0x12bfc78
   *   return {rax, xmm0};
   *
   * The read of both fields happens while the mutex is held; we snapshot them
   * into locals before the (no-op) unlock to mirror that ordering.
   *
   * @Flexo 0x12bfc40
   */
  getCurrentState(): FFMemoryPressureState {
    // std::mutex::lock() @0x12bfc54 — no-op in single-threaded JS.
    this.lock.locked = true;
    // movq 0x88(%rbx),%r15    @0x12bfc59
    const r15 = this.state;
    // movsd 0x90(%rbx),%xmm0  @0x12bfc60 ; spilled at @0x12bfc68
    const spilledXmm0 = this.value;
    // std::mutex::unlock() @0x12bfc70 — no-op in single-threaded JS.
    this.lock.locked = false;
    // movq %r15,%rax @0x12bfc75 ; movsd -0x20(%rbp),%xmm0 @0x12bfc78
    return { state: r15, value: spilledXmm0 };
  }
}
