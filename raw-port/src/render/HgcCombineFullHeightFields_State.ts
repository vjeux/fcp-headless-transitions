// raw-port: HgcCombineFullHeightFields::State (Ozone.framework) — the
// base-object constructor.
//
// FRAMEWORK: Ozone.framework (Final Cut Pro), x86_64 slice.
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Ozone.framework/Versions/A/Ozone
//
// -----------------------------------------------------------------------------
// SYMBOL PORTED (this file's scope)
// -----------------------------------------------------------------------------
//   * HgcCombineFullHeightFields::State::State()  [C2, base-object ctor]
//     @Ozone 0x6a49b0
//     __ZN26HgcCombineFullHeightFields5StateC2Ev
//     re/disasm: raw-port/re/disasm/__ZN26HgcCombineFullHeightFields5StateC2Ev.s
//                (11 lines)
//
// `HgcCombineFullHeightFields` is one of Ozone's Hgc* GPU compute-kernel nodes
// (it recombines the two full-height field images of an interlaced frame); the
// nested `State` is the kernel's uniform block. This ctor is a PURE ZERO FILL:
// it writes 0x20 bytes of zeros and calls nothing.
//
// NOT PORTED HERE (each is its own ledger unit): the C1 complete-object ctor
// @Ozone 0x6a4830 — a DIFFERENT address with its own body, deliberately not
// aliased onto this one — `State::operator delete(void*)` @0x6a4850, and the
// node's own methods GetProgram @0x6a2f30, BindTexture @0x6a3260, Bind
// @0x6a3370, RenderTile_AVX @0x6a33c0, RenderTile @0x6a4000, SetParameter
// @0x6a4940 and GetParameter @0x6a4970.
//
// FRONTIER CALLEES — none. There is no `callq`, no symbol stub, no branch and
// no indirect/virtual dispatch anywhere in the body: every instruction is a
// register move or a store.
//
// -----------------------------------------------------------------------------
// FULL DISASM — every instruction, in order
// -----------------------------------------------------------------------------
//   0x6a49b0  pushq  %rbp                     ; prologue
//   0x6a49b1  movq   %rsp, %rbp
//   0x6a49b4  movq   %rdi, -0x8(%rbp)         ; spill `this`
//   0x6a49b8  movq   -0x8(%rbp), %rax         ; reload it -> %rax (the base reg)
//   0x6a49bc  xorps  %xmm0, %xmm0             ; xmm0 = 0 (16 zero bytes)
//   0x6a49bf  movaps %xmm0, -0x20(%rbp)       ; spill the zeros to the frame
//   0x6a49c3  movaps -0x20(%rbp), %xmm0       ; reload them, unchanged
//   0x6a49c7  movaps %xmm0, 0x10(%rax)        ; this[0x10..0x1F] = 0  (HIGH first)
//   0x6a49cb  movaps %xmm0, (%rax)            ; this[0x00..0x0F] = 0
//   0x6a49ce  popq   %rbp                     ; epilogue
//   0x6a49cf  retq                            ; C2 ctor — no return value
//
// The `this` spill/reload through `-0x8(%rbp)` (@0x6a49b4/@0x6a49b8) and the
// xmm0 spill/reload through `-0x20(%rbp)` (@0x6a49bf/@0x6a49c3) are
// unoptimised-codegen round trips: each reads back exactly what it just wrote,
// so they move no data and have no observable effect. They are documented here
// and deliberately NOT modelled — inventing frame storage the object does not
// have would be worse than transcribing the effect. This is the same treatment
// the landed sibling `HgcZebraStripe::State::State()` @Ozone 0x691270 gives its
// (much larger) run of identical spill/reload pairs.
//
// STORE ORDER: the HIGH half (+0x10) is written BEFORE the low half (+0x00) —
// the same high-then-low pairing HgcZebraStripe::State uses — and the port
// keeps that order even though both stores write the same zeros.
//
// SIZE: this unit proves the ctor writes bytes 0x00..0x1F. It does NOT prove
// `sizeof(State)`; no `operator new` size or member access beyond +0x1F is
// visible from this body, so the modelled block is exactly the 0x20 bytes the
// constructor touches and nothing is invented past them.
//
// Per PORTING_SPEC.md Rules 1, 2, 5, 6.

/** The number of bytes this constructor writes: two 16-byte `movaps` stores. */
export const HGC_COMBINE_FULL_HEIGHT_FIELDS_STATE_CTOR_BYTES = 0x20;

/**
 * `HgcCombineFullHeightFields::State` — the uniform block the C2 ctor
 * zero-fills.
 *
 * No field is named: the ctor writes two undifferentiated 16-byte slots and
 * reveals no field boundaries beyond that, so per Rule 5 the port records the
 * exact bytes rather than inventing uniform names. Whichever
 * `HgcCombineFullHeightFields` method consumes these slots (SetParameter
 * @0x6a4940 / GetParameter @0x6a4970 / Bind @0x6a3370 are the candidates) is a
 * separate ledger unit and will ground the names when it is transcribed.
 *
 * `u32` and `f32` are two views over the SAME `ArrayBuffer`, so a consumer may
 * read a slot as four floats while the stored bit patterns stay exactly what
 * the binary wrote.
 *
 * @0xADDR Ozone 0x6a49b0
 */
export class HgcCombineFullHeightFields_State {
  /** The raw 0x20 bytes the constructor covers. */
  readonly bytes: ArrayBuffer = new ArrayBuffer(
    HGC_COMBINE_FULL_HEIGHT_FIELDS_STATE_CTOR_BYTES,
  );
  /** 32-bit-word view — the authoritative one; stores go through it so bit
   *  patterns survive verbatim. 8 words = 0x20 bytes. */
  readonly u32: Uint32Array = new Uint32Array(this.bytes);
  /** float32 view over the same bytes, for consumers that read uniforms. */
  readonly f32: Float32Array = new Float32Array(this.bytes);

  /**
   * `movaps %xmm0, <byteOffset>(%rax)` with a zeroed `%xmm0` — a 16-byte
   * aligned store of four zero words. This models the x86 INSTRUCTION, not an
   * FCP function, so that each of the two stores below can cite its own
   * address without repeating four index expressions.
   */
  private storeZero128(byteOffset: number): void {
    const w = byteOffset >>> 2;
    this.u32[w] = 0;
    this.u32[w + 1] = 0;
    this.u32[w + 2] = 0;
    this.u32[w + 3] = 0;
  }

  /**
   * `HgcCombineFullHeightFields::State::State()` [C2, base-object ctor]
   * — @Ozone 0x6a49b0 (`__ZN26HgcCombineFullHeightFields5StateC2Ev`).
   *
   * Faithful transcription of the 11-line body quoted in the file header:
   * prologue @0x6a49b0..0x6a49b8 (frame set-up plus the no-op `this`
   * spill/reload), `xorps %xmm0,%xmm0` @0x6a49bc, the no-op xmm0
   * spill/reload @0x6a49bf/@0x6a49c3, then the two 16-byte zero stores —
   * HIGH half first — and the epilogue @0x6a49ce/@0x6a49cf. No callee, no
   * branch, no loop, no return value.
   *
   * NOTE: the class field initialisers above already allocate a zero-filled
   * buffer, so the two stores are idempotent on a fresh object. They are
   * performed anyway, explicitly and in the binary's order, because this
   * constructor is also the C++ way to RE-initialise storage that is not
   * fresh (placement-new over a reused block), and eliding them would make
   * the port disagree with the machine on exactly that path.
   */
  constructor() {
    // @0x6a49c7  movaps %xmm0, 0x10(%rax)  — HIGH half first.
    this.storeZero128(0x10);
    // @0x6a49cb  movaps %xmm0, (%rax)
    this.storeZero128(0x00);
    // @0x6a49ce..0x6a49cf — epilogue; a C2 ctor returns nothing.
  }
}
