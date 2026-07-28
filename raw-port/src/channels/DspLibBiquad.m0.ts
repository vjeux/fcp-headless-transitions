// DspLibBiquad.m0.ts — chunk 0 (all 10 methods) of DspLibBiquad in Flexo.framework.
//
// DspLibBiquad is a Direct-Form-II multi-channel biquad filter bank used by Flexo's
// audio DSP path. Each managed channel holds its own filter parameters (Fc, Q, gain,
// type, bypass), its own IIR delay-line state, and the coefficients derived from
// (sampleRate, Fc, Q, gain, filterType). Processing is delegated to Apple Accelerate
// (`vDSP_deq22`, `vDSP_vsadd`) — the C++ class is bookkeeping + coefficient math.
//
// Framework: Flexo   Binary: /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// Method disassemblies (all under raw-port/re/disasm/):
//   Flexo.DspLibBiquad.DspLibBiquad.s                @0x1228e40 (C1) → tail-call C2
//                                                    @0x1228c00 (C2 base ctor, in /tmp/Flexo_tV.txt)
//   Flexo.DspLibBiquad.~DspLibBiquad.s               @0x1228e50 (D2)   [also C1==D1 → tail-call D2]
//   Flexo.DspLibBiquad.configureBiquad.s             @0x1228d60
//   Flexo.DspLibBiquad.setSampleRate.s               @0x1228e90
//   Flexo.DspLibBiquad.calculateCoefficients.s       @0x1228ed0  (598-line jump table over 19 filter types — throw-stub)
//   Flexo.DspLibBiquad.resetState.s                  @0x1229970
//   Flexo.DspLibBiquad.printBiquad.s                 @0x1229a10  (printf/putchar — throw-stub)
//   Flexo.DspLibBiquad.printBiquadCoefsDifference.s  @0x1229b70  (printf — throw-stub)
//   Flexo.DspLibBiquad.biquadProcess.s               @0x1229c50  (vDSP_deq22 / vDSP_vsadd — throw-stub)
//
// ---------------------------------------------------------------------------
// Recovered layouts
// ---------------------------------------------------------------------------
//
// class DspLibBiquad {                                    // sizeof >= 0x24
//   float*   channels;     // +0x00  — heap array, 0x38 bytes/channel, `numChannels` elements
//                          //         allocated by operator new[] (__Znam @0x1497446)
//   float*   temp_in;      // +0x08  — (blockSize+2) floats  (vDSP_deq22 in-buffer, "B")
//   float*   temp_out;     // +0x10  — (blockSize+2) floats  (vDSP_deq22 out-buffer, "A")
//   uint32_t sampleRate;   // +0x18  — Hz, set by setSampleRate / used by printBiquad & calcCoefs
//   uint32_t numChannels;  // +0x1c  — set from ctor arg1
//   uint32_t maxBlockSize; // +0x20  — set from ctor arg2; biquadProcess bails if frames > this
// };
//
// // Per-channel struct at channels[i], sizeof = 0x38 = 56 B.
// // Bytes +0x00..+0x13 are the filter coefficient block written by calculateCoefficients.
// struct BiquadChannel {                                  // 56 bytes
//   float    coeffs[5];    // +0x00..+0x13 — filter coefficients (b0,b1,b2,-a1,-a2 for vDSP_deq22)
//   float    state[4];     // +0x14..+0x23 — IIR delay-line state, zeroed by resetState()
//                          //                and by ctor & configureBiquad (movups 16-byte clear)
//   uint8_t  bypass;       // +0x24  — bool, ctor default = 1  (movb $0x1)
//   uint8_t  _pad_25[3];   // +0x25..+0x27 — alignment slack
//   uint32_t filterType;   // +0x28  — enum _kFilterTypes_t; ctor default 0; jump-table cap = 0x12
//   float    Fc;           // +0x2c  — cutoff / center frequency; ctor default = 1000.0f (0x447a0000)
//   float    Q;            // +0x30  — quality factor; ctor default = 1.0f (0x3f800000)
//   float    gain;         // +0x34  — gain (linear or dB per type); ctor default = 1.0f (0x3f800000)
// };
//
// // enum _kFilterTypes_t (integer; calcCoefficients jump table @0x1228f5d covers 0..18).
// //   Exact string names are NOT yet transcribed; calcCoefficients decode is deferred.
//
// ---------------------------------------------------------------------------
// External callees resolved via resolve.py Flexo stub:
//   __Znam                @0x1497446  (operator new[])           — used by ctor
//   __ZdaPv               @0x14973fe  (operator delete[])         — used by dtor
//   ___sincos_stret       @0x14974e8  (libm sincos, calcCoefs)    — deferred
//   _sinh                 @0x1497bba  (libm sinh, calcCoefs)      — deferred
//   _vDSP_deq22           @0x1497db8  (Accelerate, biquadProcess) — deferred
//   _vDSP_vsadd           @0x1497e24  (Accelerate, biquadProcess) — deferred
//   _printf               @0x1497a52  (libc, print*)              — deferred
//   _putchar              @0x1497b30  (libc, printBiquad)         — deferred
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _FILE_ADDR_PROVENANCE_ = "@0x1228c00 @0x1228d60 @0x1228e40 @0x1228e50 @0x1228e90 @0x1228ed0 @0x1229970 @0x1229a10 @0x1229b70 @0x1229c50 Flexo";

// ==========================================================================
// Struct types
// ==========================================================================

export interface BiquadChannel {
  // +0x00..+0x13 : 5 float32 filter coefficients populated by calculateCoefficients.
  coeffs: [number, number, number, number, number]; // +0x00 b0, +0x04 b1, +0x08 b2, +0x0c -a1, +0x10 -a2
  // +0x14..+0x23 : IIR delay-line state (one 16-byte movups slot = 4 float32).
  state:  [number, number, number, number];         // +0x14, +0x18, +0x1c, +0x20
  bypass: boolean;      // +0x24
  filterType: number;   // +0x28  (_kFilterTypes_t enum)
  Fc: number;           // +0x2c  float32
  Q:  number;           // +0x30  float32
  gain: number;         // +0x34  float32
}

// Bookkeeping struct that mirrors the C++ class fields at offsets 0x00..0x24.
export interface DspLibBiquad {
  channels: BiquadChannel[]; // +0x00  length = numChannels
  temp_in:  Float32Array;    // +0x08  length = maxBlockSize + 2
  temp_out: Float32Array;    // +0x10  length = maxBlockSize + 2
  sampleRate: number;        // +0x18  uint32, uninitialized in the binary until setSampleRate()
  numChannels: number;       // +0x1c  uint32
  maxBlockSize: number;      // +0x20  uint32
}

// ==========================================================================
// DspLibBiquad::DspLibBiquad(unsigned int numChannels, unsigned int maxBlockSize)  @0x1228c00 (C2)
// DspLibBiquad::DspLibBiquad(unsigned int numChannels, unsigned int maxBlockSize)  @0x1228e40 (C1 -> jmp C2)
//
// Body (mirrored from /tmp/Flexo_tV.txt block __ZN12DspLibBiquadC2Ejj):
//   this->numChannels    = %esi   (arg1)                                    ; movl %esi,0x1c(%rdi)
//   this->maxBlockSize   = %edx   (arg2)                                    ; movl %edx,0x20(%rdi)
//   this->channels = ::operator new[](0x38 * numChannels)                   ; __Znam @0x1497446
//   this->temp_in  = ::operator new[]( (maxBlockSize+2) * 4 )               ; __Znam @0x1497446
//   this->temp_out = ::operator new[]( (maxBlockSize+2) * 4 )               ; __Znam @0x1497446
//   for (i = 0; i < numChannels; ++i) {
//     ch = channels + i;                                                    ; imulq $0x38,r14,r12
//     ch->filterType = 0;                                                   ; movl  $0x0, 0x28
//     ch->bypass     = 1;                                                   ; movb  $0x1, 0x24
//     // 8-byte movsd of qword @0x1581a30 = 0x3f800000_447a0000 into +0x2c:
//     ch->Fc = 1000.0f;   ch->Q = 1.0f;                                     ; movsd 0x358d9b(%rip)
//     ch->gain = 1.0f;                                                      ; movl  $0x3f800000, 0x34
//     this->calculateCoefficients(i);                                       ; callq @0x1228ed0
//     // zero the 4-float state block in EVERY channel:
//     //   for (j = 0; j < numChannels; ++j) memset(&channels[j].state,0,16);
//     // asm unrolls in blocks of 8 (movups xmm0,{0x00,0x38,...,0x188}(%rdi))
//     // with a tail loop for numChannels%8. Semantics reduce to the plain zero-fill below.
//   }
// ==========================================================================
export function dspLibBiquad_ctor(numChannels: number, maxBlockSize: number): DspLibBiquad {
  const self: DspLibBiquad = {
    channels: new Array(numChannels),
    temp_in:  new Float32Array(maxBlockSize + 2),  // __Znam((maxBlockSize+2)*4)
    temp_out: new Float32Array(maxBlockSize + 2),  // __Znam((maxBlockSize+2)*4)
    sampleRate:   0, // C++ ctor does NOT write +0x18; sampleRate stays UNINITIALIZED
                     // until setSampleRate() is called. 0 = defined-but-invalid sentinel.
    numChannels,
    maxBlockSize,
  };
  for (let i = 0; i < numChannels; i++) {
    self.channels[i] = {
      coeffs: [0, 0, 0, 0, 0],
      state:  [0, 0, 0, 0],
      bypass: true,                        // movb $0x1, 0x24
      filterType: 0,                       // movl $0x0, 0x28
      Fc:   Math.fround(1000.0),           // low  4 bytes of qword @0x1581a30 = 0x447a0000
      Q:    Math.fround(1.0),              // high 4 bytes of qword @0x1581a30 = 0x3f800000
      gain: Math.fround(1.0),              // movl $0x3f800000, 0x34
    };
    // callq DspLibBiquad::calculateCoefficients(i)   @0x1228ed0
    dspLibBiquad_calculateCoefficients(self, i);
    // then zero-fill state on every channel (asm's unrolled loop through numChannels)
    for (let j = 0; j < self.numChannels; j++) {
      const s = self.channels[j].state;
      s[0] = 0; s[1] = 0; s[2] = 0; s[3] = 0;
    }
  }
  return self;
}

// ==========================================================================
// DspLibBiquad::~DspLibBiquad()  @0x1228e50 (D2)
//
// Body (mirrored from raw-port/re/disasm/Flexo.DspLibBiquad.~DspLibBiquad.s block __ZN12DspLibBiquadD2Ev):
//   if ((p = *(void**)this)          != nullptr) operator delete[](p);   ; +0x00  channels
//   if ((p = *(void**)(this+0x08))   != nullptr) operator delete[](p);   ; +0x08  temp_in
//   if ((p = *(void**)(this+0x10))   != nullptr) operator delete[](p);   ; +0x10  temp_out
//   return;
//
// D1 aliases D2 (same object; C1/D1 = C2/D2 for a non-virtual base with no vbases).
// ==========================================================================
export function dspLibBiquad_dtor(self: DspLibBiquad): void {
  // In GC'd TS operator delete[] has no counterpart; null for parity with
  // the ""set-null after free"" pattern used elsewhere in this port. The C++
  // dtor only frees 3 pointer fields — the int fields at +0x18..+0x20 are
  // left as-is, so we don't touch them here either.
  (self as unknown as { channels: null }).channels = null;
  (self as unknown as { temp_in:  null }).temp_in  = null;
  (self as unknown as { temp_out: null }).temp_out = null;
}

// ==========================================================================
// DspLibBiquad::setSampleRate(unsigned int sr)  @0x1228e90
//
// Body (mirrored from raw-port/re/disasm/Flexo.DspLibBiquad.setSampleRate.s):
//   this->sampleRate = %esi                                        ; movl %esi, 0x18(%rdi)
//   if (this->numChannels == 0) return;                            ; cmpl $0x0, 0x1c ; je ret
//   for (i = 0; i < this->numChannels; ++i)                        ; xor r14d ; ...
//     this->calculateCoefficients(i);                              ; callq @0x1228ed0
//   return;
// ==========================================================================
export function dspLibBiquad_setSampleRate(self: DspLibBiquad, sr: number): void {
  self.sampleRate = sr >>> 0;
  if (self.numChannels === 0) return;
  for (let i = 0; i < self.numChannels; i++) {
    dspLibBiquad_calculateCoefficients(self, i);
  }
}

// ==========================================================================
// DspLibBiquad::configureBiquad(unsigned int idx, float Q, float Fc, float gain,
//                               bool bypass, _kFilterTypes_t filterType)  @0x1228d60
//
// AMD64 arg mapping (member function -> %rdi=this; then args by SysV order):
//   %esi  = idx        (uint32, arg1)     ch = channels + idx*0x38
//   %xmm0 = Q          (float,  arg2)     stored at ch+0x30
//   %xmm1 = Fc         (float,  arg3)     stored at ch+0x2c
//   %xmm2 = gain       (float,  arg4)     stored at ch+0x34
//   %dl   = bypass     (bool,   arg5)     stored at ch+0x24
//   %ecx  = filterType (enum,   arg6)     stored at ch+0x28
//
// (Mangled name `Ejfffb15_kFilterTypes_t` declares the C++ order
//    (unsigned int, float, float, float, bool, _kFilterTypes_t)
//  which matches the register layout above.)
//
// Body:
//   ch = this->channels + idx * 0x38
//   ch->filterType = filterType     ; movl %ecx, 0x28
//   ch->bypass     = (dl & 1)       ; movb %dl,  0x24
//   ch->Q          = xmm0           ; movss %xmm0, 0x30
//   ch->Fc         = xmm1           ; movss %xmm1, 0x2c
//   ch->gain       = xmm2           ; movss %xmm2, 0x34
//   this->calculateCoefficients(idx)                                ; callq @0x1228ed0
//   for (j = 0; j < numChannels; ++j) zero(channels[j].state);      ; unrolled memset-16 loop
// ==========================================================================
export function dspLibBiquad_configureBiquad(
  self: DspLibBiquad,
  idx: number,
  Q: number,
  Fc: number,
  gain: number,
  bypass: boolean,
  filterType: number,
): void {
  const ch = self.channels[idx];
  ch.filterType = filterType | 0;
  ch.bypass = !!bypass;
  ch.Q    = Math.fround(Q);
  ch.Fc   = Math.fround(Fc);
  ch.gain = Math.fround(gain);
  dspLibBiquad_calculateCoefficients(self, idx);
  for (let j = 0; j < self.numChannels; j++) {
    const s = self.channels[j].state;
    s[0] = 0; s[1] = 0; s[2] = 0; s[3] = 0;
  }
}

// ==========================================================================
// DspLibBiquad::resetState()  @0x1229970
//
// Body (mirrored from raw-port/re/disasm/Flexo.DspLibBiquad.resetState.s):
//   n = this->numChannels                                          ; movl 0x1c(%rdi), %edx
//   if (n == 0) return;                                            ; testq/je
//   channels = *(void**)this                                       ; movq (%rdi), %rax
//   // Unrolled: n/8 groups + n%8 tail. The movups pattern zeros 16 bytes
//   // at (channels + 0x38*k + 0x14) for k=0..n-1 -> zero-fills each channel's state.
//   for (k = 0; k < n; ++k) memset(&channels[k].state, 0, 16);
//   return;
// ==========================================================================
export function dspLibBiquad_resetState(self: DspLibBiquad): void {
  if (self.numChannels === 0) return;
  for (let k = 0; k < self.numChannels; k++) {
    const s = self.channels[k].state;
    s[0] = 0; s[1] = 0; s[2] = 0; s[3] = 0;
  }
}

// ==========================================================================
// DspLibBiquad::calculateCoefficients(unsigned int idx)  @0x1228ed0     [UNDECODED -- throw-stub]
//
// 598-line body: reads ch->Fc / ch->Q / ch->gain / ch->filterType and this->sampleRate,
// computes omega0 = 2*pi*Fc/sr via ___sincos_stret @0x14974e8, alpha via _sinh @0x1497bba,
// then dispatches through a jump table `leaq 0x9b4(%rip),%rcx; movslq (%rcx,%rax,4),%rax;
// jmpq *%rax` at @0x1228f5d over 19 filter types (`cmpq $0x12, %rax` -> 0..18).
// Each case computes 5 float coefficients (b0,b1,b2,-a1,-a2) stored via cvtpd2ps + unpcklpd
// pairs into ch->coeffs[0..4] at +0x00..+0x13.
//
// The full table decode (19 cases with their pole/zero formulas) and its double-precision
// constants at RIP+0x343ac8 (@0x156ca08) and RIP+0x3454a7 (@0x156e410) are deferred.
// Per PORTING_SPEC Rule 3, we raise a loud gap rather than guess.
// ==========================================================================
export function dspLibBiquad_calculateCoefficients(_self: DspLibBiquad, _idx: number): void {
  throw new Error(
    "DspLibBiquad::calculateCoefficients @0x1228ed0 (Flexo) not yet transcribed -- " +
      "598-line jump-table body over 19 _kFilterTypes_t cases; uses ___sincos_stret @0x14974e8 " +
      "and _sinh @0x1497bba; jump table @0x1228f5d + case-const doubles at 0x156ca08 / 0x156e410."
  );
}

// ==========================================================================
// DspLibBiquad::biquadProcess(float const* in, float* out, unsigned int frames)  @0x1229c50   [UNDECODED -- throw-stub]
//
// Body summary from raw-port/re/disasm/Flexo.DspLibBiquad.biquadProcess.s:
//   if (frames > this->maxBlockSize) return;                       ; cmpl 0x20(%rdi), %ecx ; ja  ret
//   if (this->numChannels == 0) return;                            ; movl 0x1c(%rdi), %eax ; testl ; je
//   for (ch_idx = 0; ch_idx < numChannels; ++ch_idx) {
//     vDSP_vsadd(in, 1, &zero_bias, temp_in, 1, frames);            ; @0x1497e24
//     // marshal ch->coeffs and ch->state into temp_in[0..1] / temp_out[0..1]:
//     temp_in[0]  = ch->coeffs[0];   temp_in[1]  = ch->coeffs[1];
//     temp_out[0] = ch->coeffs[2];   temp_out[1] = ch->coeffs[3];
//     vDSP_deq22(temp_in, 1, temp_out, out, 1, frames);              ; @0x1497db8
//     vDSP_vsadd(temp_out, 1, ..., out, 1, frames);                  ; @0x1497e24
//     // save tail state back into ch->state[0..3] (offsets +0x14..+0x20)
//     in  += 4;  out += 4;                                          ; addq $0x4, %r15 / %rdx
//   }
//   return;
//
// The precise ordering of vDSP_deq22 inputs (which slot maps to coeffs[4]) and the exact
// bias/scale used with the two vDSP_vsadd wrappers is not yet fully decoded — 91 lines of
// interleaved reg-shuffling around two Accelerate stubs, several of whose parameters come
// from stack scratch (`-0x40(%rbp)`, `-0x2c(%rbp)`) whose initializations further up the
// block need re-reading before it is safe to port. Per Rule 3, throw with pinned addresses.
// ==========================================================================
export function dspLibBiquad_biquadProcess(
  _self: DspLibBiquad,
  _input: Float32Array,
  _output: Float32Array,
  _frames: number,
): void {
  throw new Error(
    "DspLibBiquad::biquadProcess @0x1229c50 (Flexo) not yet transcribed -- " +
      "wraps Accelerate _vDSP_deq22 @0x1497db8 and _vDSP_vsadd @0x1497e24 per channel; " +
      "stack-scratch layout at rbp-0x2c/-0x40/-0x48 not yet decoded."
  );
}

// ==========================================================================
// DspLibBiquad::printBiquad(unsigned int idx)  @0x1229a10   [UNDECODED -- throw-stub]
//
// Sequence of _printf @0x1497a52 / _putchar @0x1497b30 calls with literals
// "\nSample rate = %u", "\nFc = %f", "\nQ = %f", "\nGain = %f",
// "\nBypass = %s" (with "true"/"false" chosen via cmovne), etc.
// Debug-only console dump; deferred.
// ==========================================================================
export function dspLibBiquad_printBiquad(_self: DspLibBiquad, _idx: number): void {
  throw new Error(
    "DspLibBiquad::printBiquad @0x1229a10 (Flexo) not yet transcribed -- " +
      "debug stdout via _printf @0x1497a52 / _putchar @0x1497b30."
  );
}

// ==========================================================================
// DspLibBiquad::printBiquadCoefsDifference(unsigned int idx, double, double, double,
//                                          double, double)  @0x1229b70   [UNDECODED -- throw-stub]
//
// Debug printer: prints per-channel coefficient deltas via _printf @0x1497a52.
// ==========================================================================
export function dspLibBiquad_printBiquadCoefsDifference(
  _self: DspLibBiquad,
  _idx: number,
  _a: number, _b: number, _c: number, _d: number, _e: number,
): void {
  throw new Error(
    "DspLibBiquad::printBiquadCoefsDifference @0x1229b70 (Flexo) not yet transcribed -- " +
      "debug stdout via _printf @0x1497a52."
  );
}

// ==========================================================================
// Dispatch table (assemble_class.py convention: <Class>_m<k>_methods).
// ==========================================================================
export const DspLibBiquad_m0_methods = {
  ctor:                        dspLibBiquad_ctor,                       // @0x1228c00 (C2) / @0x1228e40 (C1)
  dtor:                        dspLibBiquad_dtor,                       // @0x1228e50 (D2)
  configureBiquad:             dspLibBiquad_configureBiquad,            // @0x1228d60
  setSampleRate:               dspLibBiquad_setSampleRate,              // @0x1228e90
  calculateCoefficients:       dspLibBiquad_calculateCoefficients,      // @0x1228ed0  [throw-stub]
  resetState:                  dspLibBiquad_resetState,                 // @0x1229970
  printBiquad:                 dspLibBiquad_printBiquad,                // @0x1229a10  [throw-stub]
  printBiquadCoefsDifference:  dspLibBiquad_printBiquadCoefsDifference, // @0x1229b70  [throw-stub]
  biquadProcess:               dspLibBiquad_biquadProcess,              // @0x1229c50  [throw-stub]
};
