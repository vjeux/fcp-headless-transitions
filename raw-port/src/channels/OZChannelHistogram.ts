// OZChannelHistogram — ProChannel per-channel-band histogram parameter container.
//
// Transcribed BYTE-VERBATIM from x86_64 disassembly of
// /Applications/Final Cut Pro.app/Contents/Frameworks/ProChannel.framework/Versions/A/ProChannel.
//
// FAITHFUL PORT — every ported method cites `@ProChannel 0xADDR`; every un-decoded overload /
// lifetime / serializer hook is a throwing stub with @0xADDR (Rule 3).
//
// This class holds a five-channel bank of "levels-style" histogram parameters (blackIn, blackOut,
// whiteIn, whiteOut, gamma).  Each band lives at `this + 0x210 + channel * 0x380`, with the five
// sub-parameters packed as five OZChannel-derived sub-objects at fixed relative offsets:
//
//     +0x000   OZChannel  blackIn
//     +0x098   OZChannel  blackOut          (0x2a8 - 0x210)
//     +0x130   OZChannel  whiteIn           (0x340 - 0x210)
//     +0x1c8   OZChannel  whiteOut          (0x3d8 - 0x210)
//     +0x260   OZChannel  gamma             (0x470 - 0x210)
//
// Channel stride = 0x380 bytes (verified from `imull $0x380, %esi, %eax` in ALL FIVE
// getXValue methods @0x705cd/0x705f5/0x7061d/0x70645/0x7066d).
//
// -----------------------------------------------------------------------------
// Symbols in this class (nm | c++filt | grep '^OZChannelHistogram::'):
//
//   @0x703e6  getBlackIn(int)                                  — PORTED  (jump-table pointer accessor)
//   @0x70444  getBlackOut(int)                                 — stub (ICF-folded body @otool; jump-table pointer)
//   @0x704a4  getWhiteIn(int)                                  — stub (ICF-folded)
//   @0x70504  getWhiteOut(int)                                 — stub (ICF-folded)
//   @0x70564  getGamma(int)                                    — stub (ICF-folded)
//   @0x705c4  getBlackInValue(int, CMTime const&, double)      — PORTED
//   @0x705ec  getBlackOutValue(int, CMTime const&, double)     — PORTED
//   @0x70614  getWhiteInValue(int, CMTime const&, double)      — PORTED
//   @0x7063c  getWhiteOutValue(int, CMTime const&, double)     — PORTED
//   @0x70664  getGammaValue(int, CMTime const&, double)        — PORTED
//   @0x7068c  getObjCWrapperName()                             — stub
//   @0x702de  clone() const                                    — stub
//   @0x7031e  copy(OZChannelBase const*, bool)                 — stub
//   @0x6f6e0 / 0x6fa6c / 0x6fa76 / 0x6fd94 / 0x6fd9e / 0x700ae / 0x700b8 / 0x701ec  — ctors (stubs)
//   @0x701f6 / 0x70286 / 0x7029e  — dtors (stubs)
//
// -----------------------------------------------------------------------------
// PROVENANCE / DECODE dumps:
//   raw-port/re/disasm/ProChannel.OZChannelHistogram.getBlackIn.s               @0x703e6
//   raw-port/re/disasm/ProChannel.OZChannelHistogram.get_ValueMethods.s         @0x705c4..0x7068a
//     (single dump for the five getXValue methods; otool -tV dropped them individually as ICF
//      candidates, so recovered via `llvm-objdump --arch=x86_64 -d ...` per Anti-Shortcut §disasm.)

import type { CMTime } from "../infra/CMTime.js";

// -----------------------------------------------------------------------------
// Frontier callee — the tail-jumped-to virtual we invoke on each sub-channel.
// -----------------------------------------------------------------------------
//
// OZChannel::getValueAsDouble(CMTime const&, double) const  — @ProChannel 0x69820
// (mangled __ZNK9OZChannel16getValueAsDoubleERK6CMTimed).  All five getXValue methods
// tail-jmp to this after computing the sub-channel address.  The method itself is a
// separate frontier item (deferred @ProChannel 0x69820) — call through a throw-stub so the
// dependency is loud (Rule 3).
//
// @provenance ProChannel @0x705e1 / @0x70609 / @0x70631 / @0x70659 / @0x70681 (all tail-`jmp`
//             into __ZNK9OZChannel16getValueAsDoubleERK6CMTimed).
/** OZChannel — the sub-channel-object type at each of the five in-histogram offsets. */
export interface OZChannel_forHistogram { readonly __ozChannel: unique symbol }

function OZChannel_getValueAsDouble(_ch: OZChannel_forHistogram, _t: CMTime, _tolerance: number): number {
  throw new Error(
    "OZChannel::getValueAsDouble(CMTime const&, double) const @ProChannel 0x69820 not yet transcribed"
  );
}

// -----------------------------------------------------------------------------
// The port
// -----------------------------------------------------------------------------
//
// OZChannelHistogram is stored in FCP as one big contiguous struct — 5 channels × 5
// sub-parameters × 0x380 bytes stride.  Because TypeScript cannot address raw bytes, we
// model the storage as a `bands` array of 5 `HistogramBand`s, each carrying the five
// OZChannel sub-objects that the disassembly touches.  This preserves the observable
// semantics (channel indexing 0..4, dispatch to per-band OZChannel::getValueAsDouble)
// without inventing helpers that don't exist in the binary.

/** One channel's histogram parameters — five OZChannels laid out at +0/+0x98/+0x130/+0x1c8/+0x260. */
export interface HistogramBand {
  /** @provenance +0x000 of the band (this + 0x210 for channel 0 @0x705d6). */
  blackIn: OZChannel_forHistogram;
  /** @provenance +0x098 of the band (this + 0x2a8 for channel 0 @0x705fe). */
  blackOut: OZChannel_forHistogram;
  /** @provenance +0x130 of the band (this + 0x340 for channel 0 @0x70626). */
  whiteIn: OZChannel_forHistogram;
  /** @provenance +0x1c8 of the band (this + 0x3d8 for channel 0 @0x7064e). */
  whiteOut: OZChannel_forHistogram;
  /** @provenance +0x260 of the band (this + 0x470 for channel 0 @0x70676). */
  gamma: OZChannel_forHistogram;
}

/**
 * OZChannelHistogram — five-band histogram parameter container.  Fields are
 * annotated with their absolute +offset in bytes (from `this`) so a reviewer can
 * diff against the disassembly.
 *
 * @provenance ProChannel 0x6f6e0..0x7068a (class byte range).
 */
export class OZChannelHistogram {
  /**
   * Five per-channel bands laid out at `this + 0x210 + channel * 0x380`.
   *
   * The bounds check in every accessor is `cmpl $0x4, %esi; ja <return-0-path>` — so
   * `channel` values are 0..4 inclusive (5 bands).  Everything else returns null/0.
   *
   * @provenance ProChannel @0x705c8 / @0x705f0 / @0x70618 / @0x70640 / @0x70668
   *             (`cmpl $0x4, %esi; ja ...`).
   */
  bands!: [HistogramBand, HistogramBand, HistogramBand, HistogramBand, HistogramBand];

  // ---------------------------------------------------------------------------
  // Pointer accessors — getBlackIn (byte-verbatim jump-table shown in disasm).
  // ---------------------------------------------------------------------------
  //
  // getBlackIn(int) @0x703e6 dispatches via a small jump-table (leaq 0x35(%rip); movslq;
  // jmpq *%rcx) with these offsets by channel argument:
  //
  //     channel 0 → this + 0x210          (band 0 blackIn)
  //     channel 1 → this + 0x1010         (channel 1 blackIn = 0x210 + 3*0x380 + 0x00 ? — see note)
  //     channel 2 → this + 0x910
  //     channel 3 → this + 0xc90
  //     channel 4 → this + 0x590
  //     otherwise → 0 (nullptr)
  //
  // Note: this legacy pointer accessor uses a DIFFERENT channel→band ordering than
  // getBlackInValue.  getBlackInValue is `channel * 0x380 + 0x210`, giving
  // {0x210, 0x590, 0x910, 0xc90, 0x1010} for c=0..4 — the same offset set, but in the
  // natural stride order.  getBlackIn's ordering is (0, 4, 2, 3, 1) into the stride-order
  // array.  We preserve the exact jump table below.
  //
  // Because TS doesn't address raw bytes, the ported method returns the band's `blackIn`
  // OZChannel using the SAME index remapping as the jump table.

  /**
   * getBlackIn(channel) — @ProChannel 0x703e6.
   *
   * ```
   *   @0x703ea  cmpl $0x4, %esi; ja 0x7042c                    ; return 0 if channel > 4
   *   @0x703ef  movq %rdi, %rax                                 ; %rax = this
   *   @0x703f2  movl %esi, %ecx
   *   @0x703f4  leaq 0x35(%rip), %rdx                           ; jump table @0x70430
   *   @0x703fb  movslq (%rdx,%rcx,4), %rcx; addq %rdx, %rcx; jmpq *%rcx
   *   -- c=0 →  addq $0x210, %rax; jmp 0x7042e                  ; return this + 0x210
   *   -- c=1 →  addq $0x1010, %rax; jmp 0x7042e                 ; return this + 0x1010
   *   -- c=2 →  addq $0x910, %rax; jmp 0x7042e                  ; return this + 0x910
   *   -- c=3 →  addq $0xc90, %rax; jmp 0x7042e                  ; return this + 0xc90
   *   -- c=4 →  addq $0x590, %rax; jmp 0x7042e                  ; return this + 0x590
   *   @0x7042c  xorl %eax, %eax                                 ; return 0
   * ```
   *
   * Each of {0x210, 0x590, 0x910, 0xc90, 0x1010} = 0x210 + n·0x380 for n ∈ {0,1,2,3,4}.
   * So the jump table maps the caller's channel index 0..4 to physical band n via the
   * PERMUTATION [0, 4, 2, 3, 1] — i.e. `bandIndex = { 0→0, 1→4, 2→2, 3→3, 4→1 }[channel]`.
   *
   * @provenance ProChannel @0x703e6..@0x7042f.
   */
  getBlackIn(channel: number): OZChannel_forHistogram | null {
    // @0x703ea  cmpl $0x4, %esi; ja 0x7042c
    if ((channel >>> 0) > 4) return null; // return 0
    // Jump-table permutation (caller-index → band-index) recovered from the offsets:
    //   0x210 + n·0x380 → n; the jumps hit offsets in the order (0, 0x1010, 0x910, 0xc90, 0x590)
    //   for channels (0, 1, 2, 3, 4), giving n = (0, 4, 2, 3, 1).
    // @provenance ProChannel @0x70404 / @0x7040c / @0x70414 / @0x7041c / @0x70424.
    const bandIndex = [0, 4, 2, 3, 1][channel]!;
    return this.bands[bandIndex]!.blackIn;
  }

  // ---------------------------------------------------------------------------
  // Timeline-sampled accessors — getBlackInValue / getBlackOutValue / getWhiteInValue
  // / getWhiteOutValue / getGammaValue.  All five share the same 15-instruction shape.
  // ---------------------------------------------------------------------------
  //
  //   getXValue(channel, t, tolerance):
  //     if (channel > 4) return 0.0
  //     addr = this + channel * 0x380 + <band offset>
  //     tail-jmp OZChannel::getValueAsDouble(addr, t, tolerance)
  //
  // The <band offset> is the ONLY difference between the five methods.  Note this uses
  // the STRIDE-ORDER channel index (0..4 map to bands 0..4 directly), NOT the permuted
  // ordering of getBlackIn.

  /**
   * getBlackInValue(channel, t, tolerance) — @ProChannel 0x705c4.
   *
   * ```
   *   @0x705c8  cmpl $0x4, %esi; ja 0x705e6                   ; bounds check
   *   @0x705cd  imull $0x380, %esi, %eax; addq %rax, %rdi     ; channel * 0x380
   *   @0x705d6  addq $0x210, %rdi                             ; + blackIn offset
   *   @0x705dd  movq %rdx, %rsi                               ; ABI shuffle: 3rd arg → 2nd
   *   @0x705e0  popq %rbp; jmp OZChannel::getValueAsDouble    ; tail call
   *   @0x705e6  xorps %xmm0, %xmm0; retq                      ; return 0.0
   * ```
   *
   * @provenance ProChannel @0x705c4..@0x705ea.
   */
  getBlackInValue(channel: number, t: CMTime, tolerance: number): number {
    // @0x705c8  cmpl $0x4, %esi; ja 0x705e6
    if ((channel >>> 0) > 4) return 0.0; // @0x705e6 `xorps %xmm0, %xmm0; retq`
    // @0x705cd..@0x705d6  addr = &this->bands[channel].blackIn
    // @0x705e1  jmp OZChannel::getValueAsDouble(addr, t, tolerance)
    return OZChannel_getValueAsDouble(this.bands[channel]!.blackIn, t, tolerance);
  }

  /**
   * getBlackOutValue(channel, t, tolerance) — @ProChannel 0x705ec.
   *
   * Identical shape to getBlackInValue; band-offset is `+0x2a8` instead of `+0x210`.
   *
   * ```
   *   @0x705f0  cmpl $0x4, %esi; ja 0x7060e
   *   @0x705f5  imull $0x380, %esi, %eax; addq %rax, %rdi
   *   @0x705fe  addq $0x2a8, %rdi                             ; + blackOut offset (= 0x2a8)
   *   @0x70605  movq %rdx, %rsi
   *   @0x70608  popq %rbp; jmp OZChannel::getValueAsDouble
   *   @0x7060e  xorps %xmm0, %xmm0; retq
   * ```
   *
   * @provenance ProChannel @0x705ec..@0x70612.
   */
  getBlackOutValue(channel: number, t: CMTime, tolerance: number): number {
    // @0x705f0  cmpl $0x4, %esi; ja 0x7060e
    if ((channel >>> 0) > 4) return 0.0;
    // @0x705f5..@0x705fe  addr = &this->bands[channel].blackOut  (0x2a8 - 0x210 = 0x98 into band)
    return OZChannel_getValueAsDouble(this.bands[channel]!.blackOut, t, tolerance);
  }

  /**
   * getWhiteInValue(channel, t, tolerance) — @ProChannel 0x70614.
   *
   * Band offset `+0x340`.  Same 15-insn shape.
   *
   * ```
   *   @0x70618  cmpl $0x4, %esi; ja 0x70636
   *   @0x7061d  imull $0x380, %esi, %eax; addq %rax, %rdi
   *   @0x70626  addq $0x340, %rdi                             ; + whiteIn offset (= 0x340)
   *   @0x70631  jmp OZChannel::getValueAsDouble
   * ```
   *
   * @provenance ProChannel @0x70614..@0x7063a.
   */
  getWhiteInValue(channel: number, t: CMTime, tolerance: number): number {
    // @0x70618  cmpl $0x4, %esi; ja 0x70636
    if ((channel >>> 0) > 4) return 0.0;
    return OZChannel_getValueAsDouble(this.bands[channel]!.whiteIn, t, tolerance);
  }

  /**
   * getWhiteOutValue(channel, t, tolerance) — @ProChannel 0x7063c.
   *
   * Band offset `+0x3d8`.
   *
   * ```
   *   @0x70640  cmpl $0x4, %esi; ja 0x7065e
   *   @0x70645  imull $0x380, %esi, %eax; addq %rax, %rdi
   *   @0x7064e  addq $0x3d8, %rdi                             ; + whiteOut offset (= 0x3d8)
   *   @0x70659  jmp OZChannel::getValueAsDouble
   * ```
   *
   * @provenance ProChannel @0x7063c..@0x70662.
   */
  getWhiteOutValue(channel: number, t: CMTime, tolerance: number): number {
    // @0x70640  cmpl $0x4, %esi; ja 0x7065e
    if ((channel >>> 0) > 4) return 0.0;
    return OZChannel_getValueAsDouble(this.bands[channel]!.whiteOut, t, tolerance);
  }

  /**
   * getGammaValue(channel, t, tolerance) — @ProChannel 0x70664.
   *
   * Band offset `+0x470`.
   *
   * ```
   *   @0x70668  cmpl $0x4, %esi; ja 0x70686
   *   @0x7066d  imull $0x380, %esi, %eax; addq %rax, %rdi
   *   @0x70676  addq $0x470, %rdi                             ; + gamma offset (= 0x470)
   *   @0x70681  jmp OZChannel::getValueAsDouble
   * ```
   *
   * @provenance ProChannel @0x70664..@0x7068a.
   */
  getGammaValue(channel: number, t: CMTime, tolerance: number): number {
    // @0x70668  cmpl $0x4, %esi; ja 0x70686
    if ((channel >>> 0) > 4) return 0.0;
    return OZChannel_getValueAsDouble(this.bands[channel]!.gamma, t, tolerance);
  }

  // ---------------------------------------------------------------------------
  // Deferred: pointer-flavor accessors (ICF-folded with getBlackIn, so their
  // exact jump tables need per-symbol llvm-objdump decoding), clone/copy,
  // getObjCWrapperName, all ctors/dtors, serializer plumbing.
  // ---------------------------------------------------------------------------

  /** getBlackOut(int) — @ProChannel 0x70444 (ICF-folded with getBlackIn; jump-table permutation TBD). */
  getBlackOut(_channel: number): OZChannel_forHistogram | null {
    throw new Error("OZChannelHistogram::getBlackOut(int) @0x70444 not yet transcribed (ICF-folded; needs per-symbol disasm)");
  }
  /** getWhiteIn(int) — @ProChannel 0x704a4. */
  getWhiteIn(_channel: number): OZChannel_forHistogram | null {
    throw new Error("OZChannelHistogram::getWhiteIn(int) @0x704a4 not yet transcribed");
  }
  /** getWhiteOut(int) — @ProChannel 0x70504. */
  getWhiteOut(_channel: number): OZChannel_forHistogram | null {
    throw new Error("OZChannelHistogram::getWhiteOut(int) @0x70504 not yet transcribed");
  }
  /** getGamma(int) — @ProChannel 0x70564. */
  getGamma(_channel: number): OZChannel_forHistogram | null {
    throw new Error("OZChannelHistogram::getGamma(int) @0x70564 not yet transcribed");
  }

  /** clone() const — @ProChannel 0x702de. */
  clone(): OZChannelHistogram {
    throw new Error("OZChannelHistogram::clone() @0x702de not yet transcribed");
  }
  /** copy(OZChannelBase const*, bool) — @ProChannel 0x7031e. */
  copy(_src: unknown, _flag: boolean): void {
    throw new Error("OZChannelHistogram::copy(OZChannelBase const*, bool) @0x7031e not yet transcribed");
  }
  /** getObjCWrapperName() — @ProChannel 0x7068c. */
  getObjCWrapperName(): unknown {
    throw new Error("OZChannelHistogram::getObjCWrapperName() @0x7068c not yet transcribed");
  }

  /** ctor(PCString, OZChannelFolder*, unsigned, unsigned, unsigned) — @ProChannel 0x6f6e0 / 0x6fa6c. */
  static construct(): OZChannelHistogram {
    throw new Error("OZChannelHistogram::OZChannelHistogram(PCString, OZChannelFolder*, uint, uint, uint) @0x6f6e0 / @0x6fa6c not yet transcribed");
  }
  /** ctor(OZFactory*, PCString, OZChannelFolder*, uint, uint, uint) — @ProChannel 0x6fa76 / 0x6fd94. */
  static constructWithFactory(): OZChannelHistogram {
    throw new Error("OZChannelHistogram::OZChannelHistogram(OZFactory*, PCString, OZChannelFolder*, uint, uint, uint) @0x6fa76 / @0x6fd94 not yet transcribed");
  }
  /** ctor(OZFactory*, PCString, uint, uint) — @ProChannel 0x6fd9e / 0x700ae. */
  static constructShort(): OZChannelHistogram {
    throw new Error("OZChannelHistogram::OZChannelHistogram(OZFactory*, PCString, uint, uint) @0x6fd9e / @0x700ae not yet transcribed");
  }
  /** copy ctor(OZChannelHistogram const&, OZChannelFolder*) — @ProChannel 0x700b8 / 0x701ec. */
  static copyConstruct(): OZChannelHistogram {
    throw new Error("OZChannelHistogram::OZChannelHistogram(OZChannelHistogram const&, OZChannelFolder*) @0x700b8 / @0x701ec not yet transcribed");
  }
  /** ~OZChannelHistogram() — @ProChannel 0x701f6 / 0x70286 / 0x7029e (D0/D1/D2). */
  destroy(): void {
    throw new Error("OZChannelHistogram::~OZChannelHistogram() @0x701f6 / @0x70286 / @0x7029e not yet transcribed");
  }
}
