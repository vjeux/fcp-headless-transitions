/**
 * Faithful transcription of Flexo's `FFAudioPlaybackSkipStyleBuffer` state
 * touched by `stopCurrentUpdateTasks()`.
 *
 * Decoded layout for this unit:
 *   +0x078  uint64 task-generation counter — atomically incremented @0xd0f7b4
 *   +0x0e0  uint8 current-update flag      — atomically cleared @0xd0f7bb
 */
export class FFAudioPlaybackSkipStyleBuffer {
  /** +0x078 — the qword targeted by `lock incq` @Flexo 0xd0f7b4. */
  taskGenerationAt78: bigint = 0n;

  /** +0x0e0 — the byte targeted by `xchgb` @Flexo 0xd0f7bb. */
  currentUpdateFlagAtE0: number = 0;

  /**
   * `FFAudioPlaybackSkipStyleBuffer::stopCurrentUpdateTasks()`
   * @Flexo 0xd0f7b0
   * (__ZN30FFAudioPlaybackSkipStyleBuffer22stopCurrentUpdateTasksEv)
   *
   * Complete non-frame body:
   *   0xd0f7b4  lock incq 0x78(%rdi)
   *   0xd0f7b9  xorl %eax, %eax
   *   0xd0f7bb  xchgb %al, 0xe0(%rdi)
   *
   * `lock incq` wraps modulo 2^64. `xorl` supplies zero to the atomic byte
   * exchange; the displaced old byte lands in `%al` but the void method does
   * not observe it. TypeScript exposes the same ordered state transition; its
   * object fields are not shared-memory locations, so no stronger host atomic
   * primitive applies to this representation.
   */
  stopCurrentUpdateTasks(): void {
    // @0xd0f7b4 — lock incq 0x78(%rdi)
    this.taskGenerationAt78 = BigInt.asUintN(64, this.taskGenerationAt78 + 1n);

    // @0xd0f7b9 — xorl %eax,%eax
    // @0xd0f7bb — xchgb %al,0xe0(%rdi)
    this.currentUpdateFlagAtE0 = 0;
  }
}
