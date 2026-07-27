// FFAudioSignalClamper.ts — audio signal clamper: replaces out-of-range float samples with a
// fixed test tone amplitude (or zeroes the whole buffer on NaN / extreme values).
// Faithfully transcribed from the FCP Flexo framework binary at
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// Source disassembly:
//   raw-port/re/disasm/Flexo.FFAudioSignalClamper.PostRender.s
//   raw-port/re/disasm/Flexo.FFAudioSignalClamper.~FFAudioSignalClamper.s
//
// Ledger methods (nm on Flexo):
//   @Flexo 0x0000000000d02e70  FFAudioSignalClamper::PostRender(
//                                unsigned int, AudioTimeStamp const&,
//                                unsigned int, unsigned int, AudioBufferList const&)
//   @Flexo 0x0000000000d042c0  FFAudioSignalClamper::~FFAudioSignalClamper()  (D2)
//   @Flexo 0x0000000000d042d0  FFAudioSignalClamper::~FFAudioSignalClamper()  (D0 = deleting)
//
// STRUCT LAYOUT: nothing readable from these two methods — PostRender never touches `this`
// (rdi is discarded past the epilogue prologue) and D0 is a trivial `operator delete` tail. The
// class must have a vtable (D0 is the deleting destructor) but its data layout is not decoded
// from what we have. When we port a ctor / another method we'll extend this file.
//
// CONSTANT PROVENANCE (RIP-relative reads in PostRender). Effective addresses = next-insn addr +
// displacement, then read via `resolve.py Flexo const <addr>`:
//   @0xd02e92 movaps 0x869f17(%rip),%xmm1  -> 0x156cdb0  : u64 0x7FFFFFFF_7FFFFFFF (float |sign|
//                                                          mask replicated; used with andps to
//                                                          compute abs(float))
//   @0xd02e99 movss  0x86baa3(%rip),%xmm2  -> 0x156e944  : u32 0x41000000  (=  8.0f  — low band)
//   @0xd02ea1 movss  0x878797(%rip),%xmm3  -> 0x157b640  : u32 0x42000000  (= 32.0f  — high band)
//   @0xd02f2e movl   $0x41000000,(%rdi,%rcx,4)           : u32 0x41000000 = 8.0f as an int store
// The two reloads at @0xd02eb5/@0xd02ebd/@0xd02ec5 read the SAME three constants (compiler spilled
// them across the bzero call clobbering the xmm regs); different rip offsets, same 3 addresses:
//   @0xd02eb5 movss  0x878783(%rip),%xmm3  -> 0xd02ebd + 0x878783 = 0x157b640  (= 32.0f)
//   @0xd02ebd movss  0x86ba7f(%rip),%xmm2  -> 0xd02ec5 + 0x86ba7f = 0x156e944  (=  8.0f)
//   @0xd02ec5 movaps 0x869ee4(%rip),%xmm1  -> 0xd02ecc + 0x869ee4 = 0x156cdb0  (abs-mask)
//
// FRONTIER CALLEE:
//   _bzero  (@0xd02eb0) — libc stub. Faithfully transcribed as: zero the whole mData region for
//   `mDataByteSize` bytes. In TS we set the samples in the target Float32Array slice to 0.0.
//
// ALGORITHM (transcribed from 0xd02e70..0xd02f3f):
//   if (list.mNumberBuffers == 0) return;                    @0xd02e70/74
//   for (i = 0; i < list.mNumberBuffers; ++i) {              @0xd02e8f + loop @0xd02ecc..f
//     AudioBuffer& buf = list.mBuffers[i];                   // sizeof=16
//     float*   data      = buf.mData;                        // +0x8 within AudioBuffer @0xd02edd
//     if (data == nullptr) continue;                         @0xd02ee2/e5
//     uint32_t numChannels = buf.mNumberChannels;            // +0x0 @0xd02eea
//     uint32_t byteSize    = buf.mDataByteSize;              // +0x4 @0xd02ef7
//     uint32_t declared    = numChannels * numFrames;        @0xd02eec (imul r14d)
//     uint32_t declBytes   = declared * 4;                   @0xd02ef0 (lea (,%rcx,4),%edx)
//     uint32_t bytesInFloats = byteSize >> 2;                @0xd02efa/fc
//     // If the buffer's declared bytes >= declared*sizeof(float), use declared count of floats;
//     // otherwise iterate only over the floats that actually fit.
//     uint32_t count = (byteSize >= declBytes) ? declared : bytesInFloats;   @0xd02eff/01 (cmovae)
//     if (count == 0) continue;                              @0xd02f04/06
//     for (uint32_t k = 0; k < count; ++k) {                 @0xd02f0a..f35
//       float x = data[k];                                   @0xd02f17
//       if (isnan(x)) { bzero(data, byteSize); break-buffer; } @0xd02f1c/1f (ucomiss self; jp)
//       float ax = fabsf(x);                                 @0xd02f21 (andps 0x7fffffff mask)
//       if (ax <= 8.0f)  continue;                           @0xd02f24/27 (ucomiss 8.0; jbe)
//       if (ax >  32.0f) { bzero(data, byteSize); break-buffer; } @0xd02f29/2c (ucomiss 32.0; ja)
//       data[k] = 8.0f;                                      @0xd02f2e (movl 0x41000000)
//     }
//   }
// The "break-buffer" jumps land at 0xd02eb0 which reloads the three constants then falls into
// the loop step @0xd02ecc (incq %r12), so a NaN-or-huge in one sample zeroes the whole buffer
// and advances to the next buffer.

/**
 * AudioBufferList mirror — we accept a plain-object shape so tests can construct one without
 * needing CoreAudio bindings. Field names match Apple's `AudioBufferList` / `AudioBuffer`.
 * Buffers here use Float32Array for mData because the native code treats it as `float*`.
 */
export interface AudioBufferPortable {
  mNumberChannels: number; // +0x0  uint32_t
  mDataByteSize: number;   // +0x4  uint32_t
  mData: Float32Array | null; // +0x8  void* (float* for this method)
}
export interface AudioBufferListPortable {
  mNumberBuffers: number;                // +0x0  uint32_t
  mBuffers: AudioBufferPortable[];       // +0x8  AudioBuffer[]  (fam)
}

// AudioTimeStamp is not read by this method (only the reference is passed and unused).
// We keep the parameter for signature fidelity but it is intentionally unused.
export interface AudioTimeStampPortable { /* unused by PostRender */ }

// bzero(data, byteSize) — clear the buffer. Zeros `byteSize / 4` floats (the buffer is
// allocated as `float*`; we zero the same number of BYTES the native code zeroes, rounded down
// to a whole float which is byte-exact for well-formed CoreAudio buffers).
function bzero_floats(data: Float32Array, byteSize: number): void {
  // _bzero (@0xd02eb0) — stub. See raw-port/army/PORTING_SPEC.md rule 3: this is a libc primitive
  // whose observable effect is fully specified; transcribing that effect is not an approximation.
  const n = (byteSize >>> 2);
  const limit = Math.min(n, data.length);
  for (let i = 0; i < limit; i++) data[i] = 0;
}

export class FFAudioSignalClamper {
  /**
   * @Flexo 0x0000000000d02e70
   *   FFAudioSignalClamper::PostRender(
   *     unsigned int busNumber,
   *     AudioTimeStamp const& timestamp,
   *     unsigned int numFrames_arg3,
   *     unsigned int numFrames,
   *     AudioBufferList const& list)
   *
   * Faithful port; see file-level algorithm block for citations.
   *
   * Note on parameter names: arg1 (esi) and arg3 (ecx) are UNUSED in this method's body — they
   * are passed through by the caller and only arg4 (r8d, our `numFrames`) and arg5 (r9, `list`)
   * are read. We keep them in the signature to match the ABI and the ledger.
   */
  PostRender(
    _busNumber: number,
    _timestamp: AudioTimeStampPortable,
    _arg3: number,
    numFrames: number,
    list: AudioBufferListPortable,
  ): void {
    // @0xd02e70/74: cmpl $0x0, (%r9); je ret
    // list.mNumberBuffers == 0 -> early return.
    if ((list.mNumberBuffers >>> 0) === 0) return;

    // r14 = numFrames (uint32); r15 = &list.mBuffers; r12 = i.  @0xd02e88/8b/8f
    const nFrames = numFrames >>> 0;
    const nBufs = list.mNumberBuffers >>> 0;

    // Outer loop over buffers.  @0xd02ecc/cf/d1/d4 checks `r12 >= list.mNumberBuffers`.
    outer: for (let i = 0; i < nBufs; i++) {
      // @0xd02ed6/d9/dd: rax = i<<4; rdi = *(r15 + rax + 8) = buf.mData
      const buf = list.mBuffers[i];
      const data = buf.mData;

      // @0xd02ee2/e5: testq %rdi,%rdi; je 0xd02ecc  -> if mData==null, continue.
      if (data === null) continue;

      // @0xd02ee7: rax = r15 + rax  (= &buf).
      // @0xd02eea/ec/f0: ecx = numChannels; ecx *= numFrames; edx = ecx * 4.
      const numChannels = buf.mNumberChannels >>> 0;
      const declared = Math.imul(numChannels, nFrames) >>> 0;
      const declBytes = (declared * 4) >>> 0;

      // @0xd02ef7/fa/fc: esi = mDataByteSize; eax = esi >> 2.
      const byteSize = buf.mDataByteSize >>> 0;
      const bytesInFloats = byteSize >>> 2;

      // @0xd02eff/01: cmpl %edx, %esi ; cmovae %ecx, %eax
      // If (byteSize >= declBytes) count = declared; else count = bytesInFloats.
      // cmovae is unsigned above-or-equal (CF=0). ucomiss-independent — pure integer.
      const count = (byteSize >= declBytes) ? declared : bytesInFloats;

      // @0xd02f04/06: testl %eax,%eax; je 0xd02ecc — if count == 0, skip buffer.
      if (count === 0) continue;

      // @0xd02f08: `movl %eax, %eax` zero-extends to 64-bit; count stays uint32.
      // Inner loop over floats.  @0xd02f10/13/15 increments k and checks k == count.
      for (let k = 0; k < count; k++) {
        // @0xd02f17: xmm0 = data[k]
        const x = data[k];

        // @0xd02f1c/1f: ucomiss %xmm0, %xmm0 ; jp 0xd02eb0
        // NaN test: ucomiss with itself sets PF iff NaN. `jp` -> bzero + next buffer.
        // We also treat non-NaN infinities: |Inf|>32 -> handled by the abs-check below.
        if (Number.isNaN(x)) {
          bzero_floats(data, byteSize);
          // @0xd02eb0..cc reload consts + fall through to `incq %r12`.
          continue outer;
        }

        // @0xd02f21: andps %xmm1, %xmm0  -> abs(x). Math.abs is bit-exact for finite floats.
        // For the follow-on compares we need single-precision semantics; Math.abs on a value
        // that was already float-clean (came from Float32Array) preserves float precision.
        const ax = Math.abs(x);

        // @0xd02f24/27: ucomiss %xmm2, %xmm0 ; jbe 0xd02f10  -> if ax <= 8.0f, continue.
        // 8.0f is exactly representable so no rounding subtlety.
        if (ax <= 8.0) continue;

        // @0xd02f29/2c: ucomiss %xmm3, %xmm0 ; ja 0xd02eb0 -> if ax > 32.0f, bzero + next buf.
        // ja = unsigned above; ucomiss maps `ja` to "ordered and greater-than".
        // (Since NaN was filtered above, ax is a finite non-NaN here.)
        if (ax > 32.0) {
          bzero_floats(data, byteSize);
          continue outer;
        }

        // @0xd02f2e: movl $0x41000000, (%rdi,%rcx,4)  -> store 8.0f into data[k].
        // 0x41000000 as a float bit-pattern is exactly +8.0f.
        data[k] = 8.0;
        // @0xd02f35: jmp 0xd02f10 -> continue k-loop.
      }
    }
    // @0xd02f37..3f: pop callee-saves, ret.
  }

  /**
   * @Flexo 0x0000000000d042d0  FFAudioSignalClamper::~FFAudioSignalClamper()  (D0 deleting)
   *
   * Disasm (@0xd042d0..d042d5):
   *   pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; jmp operator delete(void*)
   * A trivial deleting destructor: pop the frame, tail-call `__ZdlPv`. There is NO per-field
   * cleanup — either the class has no owned resources on this destructor slot, or its D2 (base
   * destructor) does the work and D0 just frees the heap slot. In TS we do nothing.
   *
   * The complete-object destructor D2 at 0x0000000000d042c0 is not yet disassembled from what we
   * have (nm only listed D0 in this ledger slice). If future methods need it, we'll extend.
   */
  destroy(): void {
    // no-op: JS GC replaces `operator delete`.
  }
}
