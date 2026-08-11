// AUSampleRateConverterWithTimeStamps — Flexo Audio Unit (AUSDK idiom) that resamples while
// carrying timestamps. This commit ports its `SupportedNumChannels` query.
//
// FRAMEWORK: Flexo.framework (Final Cut Pro).
// BINARY:    /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//            (x86_64 slice — every address below is an x86_64 offset)
// DECODE:    raw-port/re/disasm/
//              Flexo.__ZN35AUSampleRateConverterWithTimeStamps20SupportedNumChannelsEPPK13AUChannelInfo.s
//
// This file ports ONLY the symbol listed below; every other method of the class is its own ledger
// entry and will be ADDED here (additive extension only) when claimed.
//
// -----------------------------------------------------------------------------
// Symbols ported here (mangled → address)
// -----------------------------------------------------------------------------
//   * __ZN35AUSampleRateConverterWithTimeStamps20SupportedNumChannelsEPPK13AUChannelInfo
//       — AUSampleRateConverterWithTimeStamps::SupportedNumChannels(AUChannelInfo const**)
//         @Flexo 0x1243d30
//
// -----------------------------------------------------------------------------
// FRONTIER CALLEES
// -----------------------------------------------------------------------------
//   none. No `callq`, no stub, no indirect dispatch: one null test, one store of a static
//   address, one constant return.
//
// -----------------------------------------------------------------------------
// FULL DISASM — SupportedNumChannels @0x1243d30 (every instruction, in order)
// -----------------------------------------------------------------------------
//   0x1243d30  pushq %rbp                     ; frame prologue
//   0x1243d31  movq  %rsp, %rbp
//   0x1243d34  testq %rsi, %rsi               ; flags on outInfo & outInfo
//   0x1243d37  je    0x1243d43                ; outInfo == NULL -> skip the store
//   0x1243d39  leaq  sChannels(%rip), %rax    ; the function-local static (see below)
//   0x1243d40  movq  %rax, (%rsi)             ; *outInfo = sChannels
//   0x1243d43  movl  $0x1, %eax               ; return 1 — the table has ONE entry
//   0x1243d48  popq  %rbp                     ; epilogue
//   0x1243d49  retq
//   0x1243d4a  nopw  (%rax,%rax)              ; padding — not executed
//
// THE STATIC TABLE
//   `SupportedNumChannels(AUChannelInfo const**)::sChannels` @Flexo 0x1582fce. The address is
//   decoded from the instruction bytes rather than taken on trust: the leaq at 0x1243d39 is
//   `48 8d 05 8e f2 33 00`, i.e. disp32 0x33f28e with rip 0x1243d40, giving 0x1582fce. Read back
//   out of the LOADED image (slide + vmaddr, under Rosetta) those 4 bytes are `ff ff ff ff`.
//
//   CoreAudio's `AUChannelInfo` is a pair of SInt16 (`{SInt16 inChannels; SInt16 outChannels;}`),
//   not two SInt32 — which is what makes the entry {-1, -1} and the byte count (4) consistent
//   with the returned count of 1. The 16-bit layout is confirmed on this very binary by the
//   sibling table `AUChannelConform::SupportedNumChannels(...)::gSupportedChannelConfigs`
//   @Flexo 0x1582f70, whose bytes `0100 0100 0200 0100 0600 0100 0100 0200 …` read as the
//   plausible pairs (1,1), (2,1), (6,1), (1,2), (2,2), (6,2), (1,6), (2,6) under the 16-bit
//   reading and as nonsense (65537, 65538, 65542, …) under the 32-bit one.
//
//   {-1, -1} is CoreAudio's "any channel count, as long as input == output" wildcard. Whether
//   that is a good idea for a sample-rate converter is not this port's business: it is what the
//   four bytes say.

/**
 * CoreAudio's `AUChannelInfo` — a supported (input, output) channel-count pair. Two SInt16, as
 * pinned by the byte evidence in the file header. -1 is the "any count" wildcard.
 */
export interface AUChannelInfo {
  /** SInt16 at +0x00 — supported input channel count, or -1 for "any". */
  inChannels: number;
  /** SInt16 at +0x02 — supported output channel count, or -1 for "any". */
  outChannels: number;
}

/**
 * `AUSampleRateConverterWithTimeStamps::SupportedNumChannels(AUChannelInfo const**)::sChannels`
 * @Flexo 0x1582fce — the function-local static this method hands out. Exactly ONE entry (the
 * method returns 1), whose four bytes in the loaded image are `ff ff ff ff` = {-1, -1}.
 *
 * `readonly` because the machine's copy lives in a read-only data section and the method returns
 * a `const AUChannelInfo*`: callers may look, not write.
 */
export const AU_SRC_WITH_TIMESTAMPS_SUPPORTED_CHANNELS: readonly AUChannelInfo[] = [
  // @Flexo 0x1582fce — bytes ff ff ff ff.
  { inChannels: -1, outChannels: -1 },
];

/**
 * An `AUChannelInfo const**` out-parameter: the machine writes the table's address THROUGH the
 * pointer, so the TS model is a settable cell rather than a return value. Kept explicit so the
 * "NULL means don't store" branch below has something real to test.
 */
export interface AUChannelInfoOutPtr {
  v: readonly AUChannelInfo[] | null;
}

/**
 * `AUSampleRateConverterWithTimeStamps::SupportedNumChannels(AUChannelInfo const**)`
 *   @Flexo 0x1243d30
 *
 * Full transcription of the 9-instruction body (see the FULL DISASM block in the file header):
 * when `outInfo` is non-NULL, store the address of the one-entry static table through it; return
 * 1 either way. `this` is never read.
 *
 * DIFFERENTIAL against the live binary. The symbol is LOCAL (`t` in
 * raw-port/army/inventory/Flexo.syms.txt), so dlsym cannot reach it;
 * raw-port/re/oracle/AUSampleRateConverterWithTimeStamps_SupportedNumChannels_oracle.py loads
 * Flexo under `arch -x86_64 /usr/bin/python3`, measures the image slide from an exported symbol,
 * verifies the OPCODE BYTES at slide+0x1243d30 against the transcribed instructions before
 * calling anything (per OPS_LOG a bare `nm` reports arm64 addresses even under Rosetta), and then
 * checks all three claims: the NULL case returns 1 and writes nothing; the non-NULL case returns
 * 1 and stores exactly slide+0x1582fce; and the four bytes there are `ff ff ff ff`. `this` is
 * passed as poison, because the port claims it is never dereferenced.
 *
 * @param outInfo the out-parameter cell (%rsi), or null for the NULL pointer.
 * @returns 1 — the number of entries in the table.
 */
export function AUSampleRateConverterWithTimeStamps_SupportedNumChannels(
  outInfo: AUChannelInfoOutPtr | null,
): number {
  // @0x1243d34/@0x1243d37 — testq %rsi,%rsi ; je : a NULL out-pointer skips the store entirely.
  if (outInfo !== null) {
    // @0x1243d39/@0x1243d40 — leaq sChannels(%rip),%rax ; movq %rax,(%rsi) : the STATIC's
    //   address is stored, not a copy of the table — every caller sees the same array.
    outInfo.v = AU_SRC_WITH_TIMESTAMPS_SUPPORTED_CHANNELS;
  }
  // @0x1243d43 — movl $0x1, %eax : the count, returned on both paths.
  return 1;
}
