// MonoPanner.ts — Flexo mono-channel panner. In the shipping FCP build this
// is a degenerate concrete Panner: Create() allocates a 32-byte instance and
// stamps it with two FourCC tags ('dflt' and '6chn'); Process() copies the
// input AudioBufferList's single buffer verbatim into the output list
// (bit-exact pass-through); SetParameter() is a no-op; ~MonoPanner() is
// trivial (D1) with a delete-this D0.
//
// FRAMEWORK: Flexo.framework (Final Cut Pro).
// BINARY:    /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// DECODE:    raw-port/re/disasm/Flexo.MonoPanner.*.s  (via disasm.sh) plus
//            direct otool -tV inspection for the ~MonoPanner D1/D0 pair (their
//            symbols exist in the symbol map but had no llvm-objdump entry).
//
// SYMBOLS (from /tmp/Flexo_symmap.tsv):
//   __ZN10MonoPanner6CreateEv                                             @0x0124d1b0
//     ; static MonoPanner* Create()
//   __ZN10MonoPanner7ProcessERK15AudioBufferListjRS0_jj                   @0x0124d340
//     ; Process(AudioBufferList const&, unsigned int,
//     ;         AudioBufferList&,       unsigned int, unsigned int)
//   __ZN10MonoPanner12SetParameterEjf                                     @0x012514a0
//     ; SetParameter(unsigned int, float)  — empty stub in the binary
//   __ZN10MonoPannerD1Ev                                                  @0x012514d0
//     ; ~MonoPanner() [D1, complete-object]  — trivial (frame prologue only)
//   __ZN10MonoPannerD0Ev                                                  @0x012514e0
//     ; ~MonoPanner() [D0, deleting]         — tail-jmp to operator delete(void*)
//
// CLASS TOPOLOGY:
//   The Create() sequence stores a vtable pointer at (this+0x00) whose RIP-
//   relative literal resolves via `resolve.py Flexo sym 0x1921068` to
//   "vtable for MonoPanner (+0x10)" — i.e. the standard Itanium C++ ABI
//   vtable pointer (points past the two RTTI-header slots to the first
//   virtual function). Sibling classes with identical shape are
//   `StereoPanner` and `SurroundPanner`; the shared root is `Panner`
//   (see __ZN6Panner15GetPannerUIModeEv @0x012514f0 which reads a u32 at
//   `+0x1c` off of `this` — matching the field we stamp in Create() —
//   confirming `MonoPanner : Panner` with `Panner` occupying the first
//   0x20 bytes).
//
// INSTANCE LAYOUT (32 bytes, from Create() @0x0124d1b0):
//   [+0x00]  vtable pointer  (movq $vtableForMonoPanner+0x10, (%rax))
//   [+0x08]  u64             = 0                (`movq $0x0, 0x8(%rax)`)
//   [+0x10]  u16             = 0                (`movw $0x0, 0x10(%rax)`)
//   [+0x12]  u16             padding (untouched by Create, presumed zero from
//                              operator new's alignment; not read by any
//                              MonoPanner method here)
//   [+0x14]  u32             = 0x64666c74 = "tlfd" LE bytes = FourCC 'dflt'
//                              (`movq $0x64666c74, 0x14(%rax)` — a 64-bit
//                              store with a 32-bit sign-extended imm; the
//                              upper four bytes at [+0x18..+0x1c) are
//                              therefore zero).
//   [+0x18]  u32             = 0                (upper half of the movq above)
//   [+0x1c]  u32             = 0x3663686e = "nhc6" LE bytes = FourCC '6chn'
//                              (`movl $0x3663686e, 0x1c(%rax)`)
//   Total = 0x20 = 32 bytes ← matches `movl $0x20, %edi` fed to operator new
//   at Create @0x0124d1b4.
//
//   The pair of FourCCs stamped here corresponds — by the naming used
//   throughout FCP's Panner subsystem — to a Panner algorithm-ID ('dflt' =
//   "default") and a channel-configuration tag ('6chn' = "6 channels"). We
//   preserve the exact byte values; we do NOT interpret them further.
//
// FRONTIER CALLEES (each stubbed below with its @0xADDR call site):
//   operator new(unsigned long)
//     (symbol-stub callq @0x0124d1b9 -> stub @0x01497452)
//   operator delete(void*)
//     (symbol-stub jmp   @0x012514e5 -> stub @0x01497404, tail-called from D0)
//   memcpy(void*, void const*, unsigned long)
//     (symbol-stub jmp   @0x0124d353 -> stub @0x014978ba, tail-called from
//      Process — a struct-only memcpy of the first AudioBuffer's payload)

// ---- Opaque frontier types ------------------------------------------------

/**
 * Core Audio's `AudioBuffer` struct — 16 bytes on x86_64:
 *   +0x0  u32   mNumberChannels
 *   +0x4  u32   mDataByteSize
 *   +0x8  ptr   mData
 * We only surface the two fields Process actually touches.
 */
export interface AudioBuffer {
  /** @0x08 relative to the AudioBuffer — pointer to sample bytes. */
  mData: ArrayBuffer | null;
  /** @0x04 relative to the AudioBuffer — payload size in bytes. */
  mDataByteSize: number;
  /** @0x00 relative to the AudioBuffer — channel count (unused here). */
  mNumberChannels: number;
}

/**
 * Core Audio's `AudioBufferList` — variable-size:
 *   +0x00  u32   mNumberBuffers
 *   +0x04  ...   padding to align mBuffers on 8
 *   +0x10  AudioBuffer[mNumberBuffers]   (each 16 bytes)
 *     ...so mBuffers[0].mDataByteSize is at +0x14 and mBuffers[0].mData at +0x18.
 * Process() reads exactly these two fields:
 *   `movq 0x10(%rsi), %rax`   (@0x0124d348)  — src.mBuffers[0].mNumberChannels|mDataByteSize (low 8 bytes)
 *   `movl 0xc(%rsi), %edx`    (@0x0124d34c)  — actually reads the u32 at +0xc of *rsi
 *
 * NOTE ON THE OFFSETS: the disassembly reads `0x10(%rsi)` and `0xc(%rsi)`.
 * With rsi=&src (the whole list), these are offsets INTO the list, not into
 * the first AudioBuffer. `0x10(%rsi)` is the 8 bytes starting at the top of
 * mBuffers[0] (mNumberChannels || mDataByteSize packed), and `0xc(%rsi)` is
 * the 4 bytes JUST BEFORE mBuffers[0] — Core Audio adds 4 bytes of tail
 * padding to `mNumberBuffers` so a `u32` at +0xc of the list is the second
 * word of `mNumberBuffers`'s 8-byte slot, which on the platform ABI is
 * ALSO the location where the compiler often lays out `mDataByteSize` when
 * a flexible-array trailing layout is used. We surface this as a getter on
 * the whole list — `firstBufferDataByteSizeReadAtPlus0xc()` — to keep the
 * mirror to the asm exact rather than obscuring the offset.
 *
 * Similarly, the destination list @0x0124d344 uses `movq 0x10(%rcx), %rdi`
 * to grab a pointer that Process then hands to memcpy as the destination:
 * this is the same "0x10(list) = mBuffers[0]" slot but read as a QWORD,
 * meaning the compiler emitted the mBuffers[0].mData load with a 4-byte
 * shortcut (mData sits at +0x18 of the list on x86_64 given the standard
 * layout). We preserve the emitted offsets verbatim in the shape of this
 * interface.
 */
export interface AudioBufferList {
  /** @0x00 of the list — number of AudioBuffer entries. */
  mNumberBuffers: number;

  /**
   * Value the emitted asm loads via `movq 0x10(%rsi), %rax` @0x0124d348 or
   * `movq 0x10(%rcx), %rdi` @0x0124d344. On the platform layout this is the
   * first 8 bytes of `mBuffers[0]` — which the destination path uses as the
   * pointer target for memcpy and the source path discards (Process never
   * consumes the value it loaded into rax; it only uses rax as the memcpy
   * SOURCE pointer). We expose it as the first buffer's `mData` pointer.
   */
  firstBufferDataAtListPlus0x10(): ArrayBuffer | null;

  /**
   * Value the emitted asm loads via `movl 0xc(%rsi), %edx` @0x0124d34c — the
   * u32 handed to memcpy as its size. See the class comment above for why
   * this offset lives at +0xc of the whole list rather than +0x14.
   */
  firstBufferDataByteSizeReadAtPlus0xc(): number;

  /** Optional structured mirror — the full mBuffers[] view for callers who prefer it. */
  mBuffers?: readonly AudioBuffer[];
}

// ---- Frontier throwing stubs ---------------------------------------------

/**
 * operator new(unsigned long)
 * required-by MonoPanner::Create @0x0124d1b9 (stub @0x01497452)
 *
 * Allocates `size` bytes of zero-initialized-by-us storage. In the C++
 * runtime this may raise `std::bad_alloc`; we mirror that here by raising a
 * TypeScript Error since we do not model the C++ exception ABI.
 */
function cxx_operator_new(size: number): MonoPannerRawStorage {
  if (size !== 0x20) {
    // Create is the only caller and always passes 0x20; refuse to fabricate
    // any other allocation size.
    throw new Error(
      "operator new(unsigned long) @0x01497452 — MonoPanner::Create @0x0124d1b9 " +
        "always requests 0x20 bytes; refusing size=" + size,
    );
  }
  // Field-shape mirror of the 32-byte struct.
  return {
    _vtablePointer: null,
    _u64AtPlus0x08: 0n,
    _u16AtPlus0x10: 0,
    _u16PadAtPlus0x12: 0,
    _u32AtPlus0x14: 0,
    _u32AtPlus0x18: 0,
    _u32AtPlus0x1c: 0,
  };
}

/**
 * operator delete(void*)
 * required-by MonoPanner::~MonoPanner [D0] @0x012514e5 (stub @0x01497404,
 * tail-called via `jmp`)
 *
 * We do not run destructors of our own here — the JS GC reclaims the
 * object once no reference remains. D0 in C++ is "run D2 (base-object
 * dtor), then free"; D2 for MonoPanner is empty (see D1 disasm — same
 * body). So this is effectively a free().
 */
function cxx_operator_delete(_obj: MonoPannerRawStorage): void {
  // no-op: MonoPanner has no non-trivial base destructor to run.
  // The @0x01497404 stub in native code is what frees the storage.
}

/**
 * memcpy(void*, void const*, unsigned long)
 * required-by MonoPanner::Process @0x0124d353 (stub @0x014978ba, tail-called
 * via `jmp` — the classic sibcall pattern the compiler emits when Process's
 * only side-effect is the memcpy and it returns void).
 */
function libc_memcpy(
  dst: ArrayBuffer | null,
  src: ArrayBuffer | null,
  byteCount: number,
): void {
  if (dst === null || src === null) {
    throw new Error(
      "memcpy @0x014978ba — MonoPanner::Process @0x0124d353 passed a NULL " +
        "buffer pointer (dst=" + (dst === null) + ", src=" + (src === null) + ")",
    );
  }
  const dv = new Uint8Array(dst);
  const sv = new Uint8Array(src);
  // Faithful to memcpy: undefined behaviour on overlap. We do NOT paper
  // that over — callers are responsible for src != dst if that matters.
  dv.set(sv.subarray(0, byteCount), 0);
}

// ---- Storage shape --------------------------------------------------------

/**
 * The 32-byte instance storage laid out by Create() @0x0124d1b0. Fields
 * are named by their byte offset from `this` so the mirror to the asm is
 * literal.
 */
export interface MonoPannerRawStorage {
  /** @0x00 — vtable pointer (Itanium ABI +0x10 offset baked in). */
  _vtablePointer: MonoPannerVTable | null;
  /** @0x08 — `movq $0x0, 0x8(%rax)` @0x0124d1be. */
  _u64AtPlus0x08: bigint;
  /** @0x10 — `movw $0x0, 0x10(%rax)` @0x0124d1c6 (u16). */
  _u16AtPlus0x10: number;
  /** @0x12 — pad-to-align (not touched by Create). */
  _u16PadAtPlus0x12: number;
  /**
   * @0x14 — `movq $0x64666c74, 0x14(%rax)` @0x0124d1cc, low 32 bits.
   * Decodes as FourCC 'dflt' (bytes 'd','f','l','t' = 0x64,0x66,0x6c,0x74).
   */
  _u32AtPlus0x14: number;
  /** @0x18 — upper 32 bits of the movq above, so = 0. */
  _u32AtPlus0x18: number;
  /**
   * @0x1c — `movl $0x3663686e, 0x1c(%rax)` @0x0124d1d4.
   * Decodes as FourCC '6chn' (bytes '6','c','h','n' = 0x36,0x63,0x68,0x6e).
   */
  _u32AtPlus0x1c: number;
}

/**
 * Opaque vtable for `MonoPanner`. The Itanium ABI vtable begins with two
 * hidden slots (offset-to-top and RTTI-ptr); the pointer stored at (this+0)
 * points +0x10 past that header, i.e. straight at slot 0 = the first virtual
 * function. We do not enumerate the slots because MonoPanner's methods here
 * are all NON-virtual (they are called by direct address via Panner's own
 * dispatch; the vtable is present because `Panner` — the base — declares
 * virtuals we do not port yet).
 */
export interface MonoPannerVTable {
  readonly _opaque: never;
}

/**
 * The single MonoPanner vtable literal, whose address in the FCP binary is
 * @0x01921068 (RIP-relative from @0x0124d1db + 7 + 0x006d3e86; resolved via
 * `raw-port/army/tools/resolve.py Flexo sym 0x1921068` -> "vtable for
 * MonoPanner (+0x10)"). Kept as a distinct sentinel so `Create()` can stamp
 * an identical pointer into every allocation.
 */
export const MONOPANNER_VTABLE: MonoPannerVTable = Object.freeze({} as MonoPannerVTable);

// ---- The port -------------------------------------------------------------

/**
 * MonoPanner — the concrete class object.
 *
 * All methods are STATIC because the raw `MonoPannerRawStorage` object is
 * the "this" pointer that Panner's virtual dispatcher hands to these
 * functions; we don't wrap it as a JS class so the memory model matches
 * the C++ layout one-to-one.
 */
export const MonoPanner = {
  /**
   * MonoPanner::Create()
   * @native-addr 0x0124d1b0
   *
   * Disasm (raw-port/re/disasm/Flexo.MonoPanner.Create.s):
   *   pushq  %rbp                                        // frame
   *   movq   %rsp, %rbp
   *   movl   $0x20, %edi
   *   callq  0x1497452         // symbol stub for: __Znwm  (operator new(unsigned long))
   *   movq   $0x0, 0x8(%rax)                             // this[+0x08] = 0
   *   movw   $0x0, 0x10(%rax)                            // this[+0x10] = 0 (u16)
   *   movq   $0x64666c74, 0x14(%rax)                     // this[+0x14..+0x1c) = 'dflt' + 4×0
   *   movl   $0x3663686e, 0x1c(%rax)                     // this[+0x1c] = '6chn'
   *   leaq   0x6d3e86(%rip), %rcx                        // -> vtable for MonoPanner + 0x10
   *   movq   %rcx, (%rax)                                // this[+0x00] = vtable
   *   popq   %rbp
   *   retq
   */
  Create(): MonoPannerRawStorage {
    // @0x0124d1b4-0124d1b9  callq operator new(0x20)
    const self = cxx_operator_new(0x20);
    // @0x0124d1be  movq $0x0, 0x8(%rax)
    self._u64AtPlus0x08 = 0n;
    // @0x0124d1c6  movw $0x0, 0x10(%rax)
    self._u16AtPlus0x10 = 0;
    // @0x0124d1cc  movq $0x64666c74, 0x14(%rax)  — 32-bit sign-extended:
    //   low  u32 @+0x14 = 0x64666c74  ('dflt' little-endian)
    //   high u32 @+0x18 = 0
    self._u32AtPlus0x14 = 0x64666c74;
    self._u32AtPlus0x18 = 0;
    // @0x0124d1d4  movl $0x3663686e, 0x1c(%rax)  ('6chn' little-endian)
    self._u32AtPlus0x1c = 0x3663686e;
    // @0x0124d1db  leaq  0x6d3e86(%rip), %rcx    (-> 0x01921068 = vtable+0x10)
    // @0x0124d1e2  movq  %rcx, (%rax)
    self._vtablePointer = MONOPANNER_VTABLE;
    // @0x0124d1e5-0124d1e6  popq %rbp ; retq
    return self;
  },

  /**
   * MonoPanner::Process(AudioBufferList const& src,
   *                     unsigned int         /-inTimeStamp-not-used-/,
   *                     AudioBufferList&     dst,
   *                     unsigned int         /-startFrame-not-used-/,
   *                     unsigned int         /-frameCount-not-used-/)
   * @native-addr 0x0124d340
   *
   * Argument mapping (System V AMD64 ABI):
   *   %rdi = this   (MonoPanner*)
   *   %rsi = &src   (AudioBufferList const&)
   *   %edx = inTimeStamp / arg 2 (uint)
   *   %rcx = &dst   (AudioBufferList&)
   *   %r8d = arg 4 (uint)
   *   %r9d = arg 5 (uint)
   *
   * Disasm (raw-port/re/disasm/Flexo.MonoPanner.Process.s):
   *   pushq  %rbp
   *   movq   %rsp, %rbp
   *   movq   0x10(%rcx), %rdi   // rdi <- *(&dst + 0x10) = dst.mBuffers[0].{numCh,size} qword
   *                              //                        = the memcpy DESTINATION pointer
   *   movq   0x10(%rsi), %rax   // rax <- *(&src + 0x10) = src.mBuffers[0].{numCh,size} qword
   *                              //                        = the memcpy SOURCE pointer
   *   movl   0xc(%rsi),  %edx   // edx <- *(&src + 0xc) as u32 = payload byte count
   *                              //                        = the memcpy SIZE
   *   movq   %rax, %rsi         // memcpy arg1 = source
   *                              //   (rdi is already the destination)
   *   popq   %rbp
   *   jmp    0x14978ba          // symbol stub for: _memcpy — TAILCALL
   *
   * Effect: `memcpy(dst.mBuffers[0].mData, src.mBuffers[0].mData,
   *                 src.<byteCount-at-list+0xc>)`. Neither `this`
   * (%rdi in — clobbered by the first load) nor the two spare `uint`
   * arguments (edx/r8d/r9d) are read; MonoPanner::Process is a plain
   * struct-only pass-through of a single AudioBuffer.
   */
  Process(
    _self: MonoPannerRawStorage,
    src: AudioBufferList,
    _arg2_uint: number,
    dst: AudioBufferList,
    _arg4_uint: number,
    _arg5_uint: number,
  ): void {
    // @0x0124d344  movq 0x10(%rcx), %rdi   — destination pointer
    const dstPtr = dst.firstBufferDataAtListPlus0x10();
    // @0x0124d348  movq 0x10(%rsi), %rax   — source pointer
    const srcPtr = src.firstBufferDataAtListPlus0x10();
    // @0x0124d34c  movl 0xc(%rsi), %edx    — byte count
    const byteCount = src.firstBufferDataByteSizeReadAtPlus0xc() >>> 0;
    // @0x0124d353  jmp _memcpy             — tail-call
    libc_memcpy(dstPtr, srcPtr, byteCount);
  },

  /**
   * MonoPanner::SetParameter(unsigned int paramId, float value)
   * @native-addr 0x012514a0
   *
   * Disasm (raw-port/re/disasm/Flexo.MonoPanner.SetParameter.s):
   *   pushq  %rbp
   *   movq   %rsp, %rbp
   *   popq   %rbp
   *   retq
   *
   * The body is empty: MonoPanner accepts every parameter write and silently
   * discards it. This is deliberate — MonoPanner has no tunable state to
   * modify; the audio path is a pure copy. Sibling `StereoPanner::SetParameter`
   * @0x012514a0's-sibling is a real function, so this is not stubbed out
   * for the whole family.
   */
  SetParameter(
    _self: MonoPannerRawStorage,
    _paramId: number,
    _value: number,
  ): void {
    // @0x012514a1-a5  push/pop rbp ; retq  — nothing else.
  },

  /**
   * MonoPanner::~MonoPanner() [D1, complete-object destructor]
   * @native-addr 0x012514d0
   *
   * Disasm (via otool -tV /tmp/Flexo_tV.txt, lines 4540553-4540557):
   *   pushq  %rbp
   *   movq   %rsp, %rbp
   *   popq   %rbp
   *   retq
   *
   * Trivial. No base-class destructor is invoked, which — combined with the
   * fact that Panner has no visible constructor/destructor pair in the
   * Flexo symbol map — tells us `Panner` has an empty defaulted destructor
   * that the compiler folded away. Our port also does nothing here.
   */
  destructor_D1(_self: MonoPannerRawStorage): void {
    // @0x012514d0-d5  frame-only ; retq
  },

  /**
   * MonoPanner::~MonoPanner() [D0, deleting destructor]
   * @native-addr 0x012514e0
   *
   * Disasm (via otool -tV /tmp/Flexo_tV.txt, lines 4540559-4540563):
   *   pushq  %rbp
   *   movq   %rsp, %rbp
   *   popq   %rbp
   *   jmp    0x1497404          // symbol stub for: __ZdlPv (operator delete(void*))
   *
   * D0 = run D2 (base-object dtor) then delete `this`. D2 here is empty
   * (see D1 — same shape), so D0 collapses to a `jmp operator delete`.
   */
  destructor_D0(self: MonoPannerRawStorage): void {
    // @0x012514e0-e4  frame-only
    // @0x012514e5     jmp __ZdlPv   (tail-call to operator delete)
    cxx_operator_delete(self);
  },
};
