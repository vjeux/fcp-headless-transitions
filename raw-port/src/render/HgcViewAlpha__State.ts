// HgcViewAlpha__State.ts — FCP Ozone's nested class `HgcViewAlpha::State`
// (render layer), base-object constructor.
//
// FRAMEWORK: Ozone.framework (Final Cut Pro), x86_64 slice (fat offset +0x4000).
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// Named `Outer__Nested` per the repo's nested-class convention (cf.
// PCEvictionHeap__ColorSpaceRefCache.ts, PCDelaunay__Triangle.ts). It holds
// exactly ONE FCP class — the nested `State` — not the enclosing HgcViewAlpha
// render node, which has no file yet.
//
// -----------------------------------------------------------------------------
// SYMBOL PORTED (this commit)
// -----------------------------------------------------------------------------
//   * HgcViewAlpha::State::State()  [C2, base-object ctor]  @Ozone 0x6baaa0
//     __ZN12HgcViewAlpha5StateC2Ev   (`t` — internal linkage)
//     re/disasm: raw-port/re/disasm/__ZN12HgcViewAlpha5StateC2Ev.s  (36 lines)
//
// Siblings of the same nested class (`nm -arch x86_64 -n Ozone`) are SEPARATE
// ledger units and are NOT written here:
//   0x688bd0 t State::operator new(unsigned long)
//   0x6ba700 t State::State()  [C1]
//   0x6ba720 t State::operator delete(void*)
//
// -----------------------------------------------------------------------------
// FULL DISASM — C2 (36 lines, @0x6baaa0..@0x6bab33)
// -----------------------------------------------------------------------------
//   __ZN12HgcViewAlpha5StateC2Ev:
//     0x6baaa0  pushq  %rbp
//     0x6baaa1  movq   %rsp, %rbp
//     0x6baaa4  movq   %rdi, -0x8(%rbp)        ; spill this
//     0x6baaa8  movq   -0x8(%rbp), %rax        ; rax = this
//     0x6baaac  xorps  %xmm0, %xmm0            ; xmm0 = {0,0,0,0}
//     0x6baaaf  movaps %xmm0, -0x20(%rbp)      ; round-trip through the frame
//     0x6baab3  movaps -0x20(%rbp), %xmm1      ;   (unoptimised codegen; no effect)
//     0x6baab7  movaps %xmm1, 0x10(%rax)       ; this[+0x10] = {0,0,0,0}
//     0x6baabb  movaps %xmm1, (%rax)           ; this[+0x00] = {0,0,0,0}
//     0x6baabe  movss  0x59c92(%rip), %xmm1    ; = 0x6baac6 + 0x59c92 = 0x714758
//                                              ;   xmm1 = { -2.0f, 0, 0, 0 }
//                                              ;   (movss zeroes lanes 1..3)
//     0x6baac6  movaps %xmm1, -0x30(%rbp)
//     0x6baaca  movaps -0x30(%rbp), %xmm1
//     0x6baace  movaps %xmm1, 0x30(%rax)       ; this[+0x30] = { -2.0f, 0, 0, 0 }
//     0x6baad2  movaps %xmm1, 0x20(%rax)       ; this[+0x20] = { -2.0f, 0, 0, 0 }
//     0x6baad6  movss  0x4c472(%rip), %xmm1    ; = 0x6baade + 0x4c472 = 0x706f50
//                                              ;   xmm1 = { 1.0f, 0, 0, 0 }
//     0x6baade  movaps %xmm1, -0x40(%rbp)
//     0x6baae2  movaps -0x40(%rbp), %xmm1
//     0x6baae6  movaps %xmm1, 0x50(%rax)       ; this[+0x50] = { 1.0f, 0, 0, 0 }
//     0x6baaea  movaps %xmm1, 0x40(%rax)       ; this[+0x40] = { 1.0f, 0, 0, 0 }
//     0x6baaee  movaps 0x5998b(%rip), %xmm1    ; = 0x6baaf5 + 0x5998b = 0x714480
//                                              ;   xmm1 = FF FF FF FF x3 then 00 00 00 00
//     0x6baaf5  movaps %xmm1, -0x50(%rbp)
//     0x6baaf9  movaps -0x50(%rbp), %xmm1
//     0x6baafd  movaps %xmm1, 0x70(%rax)       ; this[+0x70] = that 16-byte pattern
//     0x6bab01  movaps %xmm1, 0x60(%rax)       ; this[+0x60] = that 16-byte pattern
//     0x6bab05  movaps 0x4da64(%rip), %xmm1    ; = 0x6bab0c + 0x4da64 = 0x708570
//                                              ;   xmm1 = { 0.0f, 0.0f, 0.0f, 1.0f }
//     0x6bab0c  movaps %xmm1, -0x60(%rbp)
//     0x6bab10  movaps -0x60(%rbp), %xmm1
//     0x6bab14  movaps %xmm1, 0x90(%rax)       ; this[+0x90] = { 0, 0, 0, 1.0f }
//     0x6bab1b  movaps %xmm1, 0x80(%rax)       ; this[+0x80] = { 0, 0, 0, 1.0f }
//     0x6bab22  movaps %xmm0, -0x70(%rbp)      ; xmm0 is STILL the zero from 0x6baaac
//     0x6bab26  movaps -0x70(%rbp), %xmm0
//     0x6bab2a  movaps %xmm0, 0xa0(%rax)       ; this[+0xa0] = {0,0,0,0}
//     0x6bab31  popq   %rbp
//     0x6bab32  retq
//     0x6bab33  nopw   %cs:(%rax,%rax)         ; alignment padding
//
// Every `movaps <xmm>, -N(%rbp)` / `movaps -N(%rbp), <xmm>` pair is a dead
// spill/reload emitted by unoptimised codegen — the value is unchanged across
// it. They are quoted above for completeness and have no TS counterpart, which
// is why the port has eleven stores and no scratch.
//
// No vptr is installed: `State` has no vtable (there is no `__ZTV...State`
// symbol and the ctor never stores a code address). No `callq`, no `jmp`.
//
// -----------------------------------------------------------------------------
// THE FOUR CONSTANTS — read byte-for-byte out of __TEXT,__const
// -----------------------------------------------------------------------------
// Each was located by resolving the RIP-relative displacement above, mapping the
// vmaddr through the x86_64 slice's section table (`otool -arch x86_64 -l`,
// __TEXT,__const) plus the 0x4000 fat-slice offset, and reading the bytes:
//
//   @0x714758  movss -> 4 bytes `00 00 00 c0`  = -2.0f
//              (movss loads ONE float and zeroes lanes 1..3, so the bytes that
//              follow at 0x71475c — which are the `__ZTS12HgcViewAlpha` type
//              string "12HgcViewAlpha" — are NOT part of the value.)
//   @0x706f50  movss -> 4 bytes `00 00 80 3f`  = 1.0f
//              (the following bytes at 0x706f54 are a separate pool entry, 0.5f,
//              and are likewise not loaded.)
//   @0x714480  movaps -> 16 bytes `ff ff ff ff ff ff ff ff ff ff ff ff 00 00 00 00`
//              = the all-ones-in-lanes-0..2, zero-in-lane-3 pattern. As int32
//              lanes that is { -1, -1, -1, 0 }; as float32 lanes the first three
//              are the 0xffffffff bit pattern (a negative quiet NaN). Which
//              interpretation the shader applies is decided by the consumer, not
//              by this ctor, so the port stores the BIT PATTERN and exposes both
//              views — see `HgcViewAlpha_State_K_ONES3_ZERO1_0x714480`.
//   @0x708570  movaps -> 16 bytes `00 00 00 00 00 00 00 00 00 00 00 00 00 00 80 3f`
//              = { 0.0f, 0.0f, 0.0f, 1.0f }.
//
// -----------------------------------------------------------------------------
// OBJECT LAYOUT — 0xb0 bytes, eleven 16-byte lanes
// -----------------------------------------------------------------------------
// The ctor writes eleven distinct 16-byte slots and nothing else, so the object
// is at least 0xb0 bytes and the ctor leaves no byte in [0, 0xb0) untouched.
// The slots come in five value/mirror PAIRS plus one lone slot — a shape that is
// GROUNDED, not guessed, by `HgcViewAlpha::SetParameter(int, float, float,
// float, float)` @Ozone 0x6ba810, which reaches this object through the
// enclosing node's `this->[+0x198]` (@0x6ba883) and then:
//   * compares the incoming {v, v, v, 0} against slot +0x00's four lanes
//     (@0x6ba892/0x6ba8a2/0x6ba8b3/0x6ba8c4, each `ucomiss` + `jne`/`jp`),
//   * and on a change writes each lane to BOTH +0x10+k and +0x00+k
//     (@0x6ba8e3/0x6ba8ec, 0x6ba8f9/0x6ba902, 0x6ba910/0x6ba919, 0x6ba927/0x6ba930),
//   * then writes the RAW 4-tuple {x,y,z,w} to +0xa0 (@0x6ba992),
//   * then calls HGNode::ClearBits() (@0x6ba999).
// `HgcViewAlpha::GetParameter(int, float*)` @0x6ba9f0 reads parameter 0 back out
// of +0xa0 (@0x6baa1b `addq $0xa0`), confirming +0xa0 is the raw argument tuple.
// So each +0xN0/+0xN0+0x10 pair is "live value" + "shadow copy used for the
// change test", and this ctor seeds both halves of every pair identically.
//
//   +0x00  float4  value      = { 0, 0, 0, 0 }            @0x6baabb
//   +0x10  float4  shadow     = { 0, 0, 0, 0 }            @0x6baab7
//   +0x20  float4  value      = { -2.0f, 0, 0, 0 }        @0x6baad2
//   +0x30  float4  shadow     = { -2.0f, 0, 0, 0 }        @0x6baace
//   +0x40  float4  value      = { 1.0f, 0, 0, 0 }         @0x6baaea
//   +0x50  float4  shadow     = { 1.0f, 0, 0, 0 }         @0x6baae6
//   +0x60  16 B    value      = ones3/zero1 @0x714480     @0x6bab01
//   +0x70  16 B    shadow     = ones3/zero1 @0x714480     @0x6baafd
//   +0x80  float4  value      = { 0, 0, 0, 1.0f }         @0x6bab1b
//   +0x90  float4  shadow     = { 0, 0, 0, 1.0f }         @0x6bab14
//   +0xa0  float4  rawParam0  = { 0, 0, 0, 0 }            @0x6bab2a
//
// Only slot 0 (+0x00/+0x10) and +0xa0 have names grounded by a decoded caller:
// SetParameter/GetParameter handle ONLY index 0 (`testl %eax,%eax; jne` returns
// -1 for anything else, @0x6ba84f and @0x6baa0a). Slots +0x20..+0x9f are
// therefore left as `slot1`..`slot4` — their initial VALUES are transcribed
// exactly, but inventing shader-parameter names for them would be ungrounded.
//
// FRONTIER CALLEES: NONE. Zero `callq`, zero `jmp`, no extern, no in-scope
// callee, no indirect/virtual call.

/**
 * `{ -2.0f, 0, 0, 0 }` — the `movss` @0x6baabe loads the single float at
 * __TEXT,__const 0x714758 (bytes `00 00 00 c0` = -2.0f) and zeroes lanes 1..3.
 * Stored to slots +0x20 and +0x30.
 *
 * @0xADDR Ozone 0x714758
 */
export const HgcViewAlpha_State_K_MINUS2_0x714758: Float32Array = new Float32Array([
  -2.0, 0.0, 0.0, 0.0,
]);

/**
 * `{ 1.0f, 0, 0, 0 }` — the `movss` @0x6baad6 loads the single float at
 * __TEXT,__const 0x706f50 (bytes `00 00 80 3f` = 1.0f) and zeroes lanes 1..3.
 * Stored to slots +0x40 and +0x50.
 *
 * @0xADDR Ozone 0x706f50
 */
export const HgcViewAlpha_State_K_ONE_0x706f50: Float32Array = new Float32Array([
  1.0, 0.0, 0.0, 0.0,
]);

/**
 * The full 16-byte `movaps` operand at __TEXT,__const 0x714480, read
 * byte-for-byte: `ff ff ff ff ff ff ff ff ff ff ff ff 00 00 00 00`. Stored to
 * slots +0x60 and +0x70 by the `movaps` pair @0x6bab01/@0x6baafd.
 *
 * Kept as the raw BYTES because the ctor is type-agnostic about it: as four
 * int32 lanes it reads { -1, -1, -1, 0 } (an RGB-select mask), and as four
 * float32 lanes the first three are the 0xffffffff bit pattern (a negative
 * quiet NaN). Nothing in this constructor discriminates, so nothing here
 * commits to one reading. `..._AS_I32` and `..._AS_F32` are views over these
 * same bytes for whichever consumer lands next.
 *
 * @0xADDR Ozone 0x714480
 */
export const HgcViewAlpha_State_K_ONES3_ZERO1_0x714480: Uint8Array = new Uint8Array([
  0xff, 0xff, 0xff, 0xff,
  0xff, 0xff, 0xff, 0xff,
  0xff, 0xff, 0xff, 0xff,
  0x00, 0x00, 0x00, 0x00,
]);

/**
 * The int32-lane view of the 16 bytes at __TEXT,__const 0x714480: `{-1,-1,-1,0}`.
 * @0xADDR Ozone 0x714480
 */
export const HgcViewAlpha_State_K_ONES3_ZERO1_AS_I32: Int32Array = new Int32Array(
  HgcViewAlpha_State_K_ONES3_ZERO1_0x714480.buffer,
  HgcViewAlpha_State_K_ONES3_ZERO1_0x714480.byteOffset,
  4,
);

/**
 * The float32-lane view of the same 16 bytes at __TEXT,__const 0x714480.
 * Lanes 0..2 are the 0xffffffff bit pattern; lane 3 is +0.0f.
 * @0xADDR Ozone 0x714480
 */
export const HgcViewAlpha_State_K_ONES3_ZERO1_AS_F32: Float32Array = new Float32Array(
  HgcViewAlpha_State_K_ONES3_ZERO1_0x714480.buffer,
  HgcViewAlpha_State_K_ONES3_ZERO1_0x714480.byteOffset,
  4,
);

/**
 * `{ 0.0f, 0.0f, 0.0f, 1.0f }` — the full 16-byte `movaps` operand at
 * __TEXT,__const 0x708570, read byte-for-byte as
 * `00 00 00 00 00 00 00 00 00 00 00 00 00 00 80 3f`. Stored to slots +0x80 and
 * +0x90 by the `movaps` pair @0x6bab1b/@0x6bab14.
 *
 * @0xADDR Ozone 0x708570
 */
export const HgcViewAlpha_State_K_0001_0x708570: Float32Array = new Float32Array([
  0.0, 0.0, 0.0, 1.0,
]);

/**
 * `HgcViewAlpha::State` — the parameter-state block the enclosing HgcViewAlpha
 * render node hangs off its own `+0x198` slot (see `SetParameter` @0x6ba883 and
 * `GetParameter` @0x6baa14, both of which load `[node + 0x198]` to reach it).
 *
 * Modelled as one contiguous 0xb0-byte buffer with named 16-byte lane views,
 * because that is exactly how the machine treats it: every access in the ctor,
 * and in SetParameter/GetParameter, is a 16-byte `movaps` or a 4-byte `movss`
 * at a fixed displacement. Keeping one backing buffer preserves the aliasing
 * those callers rely on.
 *
 * @0xADDR Ozone 0x6baaa0
 */
export interface HgcViewAlpha_State {
  /** The whole 0xb0-byte object. Every view below aliases into this. */
  readonly bytes: Uint8Array;
  /** +0x00 — parameter-0 live value, `{v,v,v,0}` per SetParameter @0x6ba8ec. */
  readonly value0: Float32Array;
  /** +0x10 — parameter-0 shadow copy, written alongside +0x00 @0x6ba8e3. */
  readonly shadow0: Float32Array;
  /** +0x20 — slot-1 live value; ctor seeds `{-2.0f,0,0,0}` @0x6baad2. */
  readonly value1: Float32Array;
  /** +0x30 — slot-1 shadow; ctor seeds `{-2.0f,0,0,0}` @0x6baace. */
  readonly shadow1: Float32Array;
  /** +0x40 — slot-2 live value; ctor seeds `{1.0f,0,0,0}` @0x6baaea. */
  readonly value2: Float32Array;
  /** +0x50 — slot-2 shadow; ctor seeds `{1.0f,0,0,0}` @0x6baae6. */
  readonly shadow2: Float32Array;
  /** +0x60 — slot-3 live value; ctor seeds the 0x714480 pattern @0x6bab01. */
  readonly value3: Float32Array;
  /** +0x70 — slot-3 shadow; ctor seeds the 0x714480 pattern @0x6baafd. */
  readonly shadow3: Float32Array;
  /** +0x80 — slot-4 live value; ctor seeds `{0,0,0,1.0f}` @0x6bab1b. */
  readonly value4: Float32Array;
  /** +0x90 — slot-4 shadow; ctor seeds `{0,0,0,1.0f}` @0x6bab14. */
  readonly shadow4: Float32Array;
  /**
   * +0xa0 — the raw `SetParameter(0, x, y, z, w)` tuple (written @0x6ba992,
   * read back by `GetParameter(0, out)` @0x6baa1b). Ctor seeds `{0,0,0,0}`.
   */
  readonly rawParam0: Float32Array;
}

/** sizeof(HgcViewAlpha::State) — the ctor's highest store is the 16 bytes at
 *  +0xa0 (@0x6bab2a), so the object spans at least [0x00, 0xb0).
 *  @0xADDR Ozone 0x6bab2a */
export const HGCVIEWALPHA_STATE_SIZE = 0xb0 as const;

/**
 * Allocate the raw storage the ctor is handed in `%rdi`. Not part of the
 * transcribed body — `HgcViewAlpha::State::operator new(unsigned long)`
 * @Ozone 0x688bd0 is its own ledger unit — but the ABI requires `%rdi` to point
 * at 0xb0 usable bytes, so the lane views are set up here and
 * `HgcViewAlpha_State_C2` writes through them exactly as the disassembly does.
 *
 * @0xADDR Ozone 0x6baaa0
 */
export function HgcViewAlpha_State_alloc(): HgcViewAlpha_State {
  const bytes = new Uint8Array(HGCVIEWALPHA_STATE_SIZE);
  const lane = (off: number): Float32Array =>
    new Float32Array(bytes.buffer, bytes.byteOffset + off, 4);
  return {
    bytes,
    value0: lane(0x00),
    shadow0: lane(0x10),
    value1: lane(0x20),
    shadow1: lane(0x30),
    value2: lane(0x40),
    shadow2: lane(0x50),
    value3: lane(0x60),
    shadow3: lane(0x70),
    value4: lane(0x80),
    shadow4: lane(0x90),
    rawParam0: lane(0xa0),
  };
}

/**
 * `HgcViewAlpha::State::State()` [C2, base-object ctor] — @Ozone 0x6baaa0
 * (`__ZN12HgcViewAlpha5StateC2Ev`).
 *
 * Faithful line-for-line transcription of the 36-line body quoted in the file
 * header: eleven 16-byte stores that seed the five value/shadow pairs and the
 * raw-parameter slot, in the binary's own order (+0x10 before +0x00, +0x30
 * before +0x20, and so on — each `movaps` pair writes the HIGH slot first).
 *
 * The dead frame spill/reload around every constant is unoptimised codegen and
 * has no TS counterpart; no value changes across it.
 *
 * No vptr store (the class has no vtable), no `callq`, no `jmp`, no extern, no
 * in-scope callee, no indirect/virtual call.
 *
 * @param self  `%rdi` — the storage to construct into (see `HgcViewAlpha_State_alloc`).
 * @returns     `self`, constructed.
 *
 * @0xADDR Ozone 0x6baaa0
 */
export function HgcViewAlpha_State_C2(
  self: HgcViewAlpha_State,
): HgcViewAlpha_State {
  // @0x6baaac  xorps %xmm0, %xmm0            ; xmm0 = {0,0,0,0} — kept live all
  //                                            the way to the +0xa0 store below.
  // @0x6baab7  movaps %xmm1, 0x10(%rax)
  self.shadow0.fill(0);
  // @0x6baabb  movaps %xmm1, (%rax)
  self.value0.fill(0);

  // @0x6baabe  movss 0x59c92(%rip), %xmm1    ; { -2.0f, 0, 0, 0 } @0x714758
  // @0x6baace  movaps %xmm1, 0x30(%rax)
  self.shadow1.set(HgcViewAlpha_State_K_MINUS2_0x714758);
  // @0x6baad2  movaps %xmm1, 0x20(%rax)
  self.value1.set(HgcViewAlpha_State_K_MINUS2_0x714758);

  // @0x6baad6  movss 0x4c472(%rip), %xmm1    ; { 1.0f, 0, 0, 0 } @0x706f50
  // @0x6baae6  movaps %xmm1, 0x50(%rax)
  self.shadow2.set(HgcViewAlpha_State_K_ONE_0x706f50);
  // @0x6baaea  movaps %xmm1, 0x40(%rax)
  self.value2.set(HgcViewAlpha_State_K_ONE_0x706f50);

  // @0x6baaee  movaps 0x5998b(%rip), %xmm1   ; the 16-byte pattern @0x714480.
  //            Copied as RAW BYTES: three of its four lanes are 0xffffffff,
  //            which as a float is a NaN — a lane-wise float assignment would
  //            not be guaranteed to preserve the exact bit pattern, so the
  //            stores below go through the byte view, exactly as `movaps` does.
  // @0x6baafd  movaps %xmm1, 0x70(%rax)
  self.bytes.set(HgcViewAlpha_State_K_ONES3_ZERO1_0x714480, 0x70);
  // @0x6bab01  movaps %xmm1, 0x60(%rax)
  self.bytes.set(HgcViewAlpha_State_K_ONES3_ZERO1_0x714480, 0x60);

  // @0x6bab05  movaps 0x4da64(%rip), %xmm1   ; { 0, 0, 0, 1.0f } @0x708570
  // @0x6bab14  movaps %xmm1, 0x90(%rax)
  self.shadow4.set(HgcViewAlpha_State_K_0001_0x708570);
  // @0x6bab1b  movaps %xmm1, 0x80(%rax)
  self.value4.set(HgcViewAlpha_State_K_0001_0x708570);

  // @0x6bab2a  movaps %xmm0, 0xa0(%rax)      ; xmm0 is STILL the zero set at
  //                                            0x6baaac — no reload in between.
  self.rawParam0.fill(0);

  // @0x6bab31  popq %rbp ; @0x6bab32 retq
  return self;
}
