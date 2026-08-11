// PCSerializerReadStream — the read cursor over a PCSerializer element tree.
//
// Faithful port of ProCore's PCSerializerReadStream (ProCore.framework). Decoded 2026-07-27:
//   - getAttributeAs{Int32,UInt32,Double,Float,String,Bool,UUID}(elem, id, &out): read attribute
//     `id` off `elem` and coerce (strtoul base10 / strtod / etc). @ ProCore 0x266xx.
//   - pushScope(PCScope*): set the child-element handler scope for the next descent.
//   - getElementInfo(name): resolve an element NAME (in the active scope) to its type tag +
//     child scope (@ ProCore 0x265b4). We fold this into the XML loader (see readScene).
//   - isLessThanVersion(maj,min): document-version gate used by many parseElement branches.
//   - setTimeScale(ts): the rational-time timescale for <timing>/<curve> values.
//
// The stream is a thin façade: attribute coercion lives on PCStreamElement (which already knows
// its scope). This class carries the parse-time CONTEXT (version, timescale, factory table) that
// parseElement methods consult.

import { PCStreamElement } from "./PCStreamElement.js";
import { kCMTimeFlags_Valid } from "./CMTime.js";
// `CMTime` is an INTERFACE, so this must be an `import type`: node's type stripping
// (`--experimental-strip-types`, and `--experimental-transform-types` too) cannot know a named
// import is a type, keeps the whole clause at runtime, and the module load then fails with
// "./CMTime.js does not provide an export named 'CMTime'". That blocks the house
// TypeScript-vs-binary differential for this file — the port is correct and only the harness
// cannot load it. `import type` is erased unconditionally and is identical for tsc.
import type { CMTime } from "./CMTime.js";

export class PCSerializerReadStream {
  /** Document format version (from <ozml version=...> / OZDocument). */
  versionMajor = 0;
  versionMinor = 0;
  /** Rational-time timescale for timing/curve conversions (frames base). */
  timeScale = 0;
  /** factoryID -> factory UUID, populated from the <factory> table (FactoryParser). */
  factories = new Map<number, string>();

  // --- attribute reads (delegate to the element, which resolves id->name via its scope) ---
  getAttributeAsString(e: PCStreamElement, id: number): string | undefined { return e.getAttributeAsString(id); }
  getAttributeAsUInt32(e: PCStreamElement, id: number): number | undefined { return e.getAttributeAsUInt32(id); }
  getAttributeAsInt32(e: PCStreamElement, id: number): number | undefined { return e.getAttributeAsInt32(id); }
  getAttributeAsDouble(e: PCStreamElement, id: number): number | undefined { return e.getAttributeAsDouble(id); }
  getAttributeAsBool(e: PCStreamElement, id: number): boolean | undefined { return e.getAttributeAsBool(id); }
  getAttributeAsUUID(e: PCStreamElement, id: number): string | undefined { return e.getAttributeAsUUID(id); }

  // --- element text/value reads ---
  getAsString(e: PCStreamElement): string { return e.text; }
  getAsUInt32(e: PCStreamElement): number { const v = parseInt(e.text, 10); return Number.isNaN(v) ? 0 : v >>> 0; }
  getAsInt32(e: PCStreamElement): number { const v = parseInt(e.text, 10); return Number.isNaN(v) ? 0 : v | 0; }
  getAsDouble(e: PCStreamElement): number { const v = parseFloat(e.text); return Number.isNaN(v) ? 0 : v; }

  /**
   * getAsFigTime — parse a CMTime element to SECONDS. DECODED from PCStreamElement::aToFigTime
   * (ProCore @0x287d8): the text is 4 whitespace-separated fields parsed in THIS order/base:
   *   1. value     = strtoll(base 10)   -> CMTime.value      (int64, offset 0x0)
   *   2. timescale = strtol (base 10)   -> CMTime.timescale  (int32, offset 0x8)
   *   3. epoch     = strtoull(base 16)  -> CMTime.epoch       (uint,  offset 0xc)  [HEX!]
   *   4. flags     = strtoull(base 10)  -> CMTime.flags       (uint,  offset 0x10)
   * e.g. "88088 120000 1 0" = value 88088 / timescale 120000 = 0.7340666s. Returns seconds.
   */
  getAsFigTime(e: PCStreamElement): number {
    const t = e.text.trim();
    if (!t) return 0;
    const parts = t.split(/\s+/);
    const value = parts[0] !== undefined ? Number(BigInt.asIntN(64, BigInt(parseInt(parts[0], 10) || 0))) : 0;
    const timescale = parts[1] !== undefined ? parseInt(parts[1], 10) : 0;
    // epoch (parts[2], base 16) and flags (parts[3], base 10) are parsed by FCP but do not affect
    // the scalar seconds value used for sampling; retained here only for fidelity of the format.
    return timescale > 0 ? value / timescale : 0;
  }

  /**
   * getAsCMTime — parse a CMTime element to the FULL rational struct (not reduced to seconds).
   * Same faithful 4-field parse as getAsFigTime / PCStreamElement::aToFigTime (ProCore @0x287d8):
   *   value=strtoll(10) @0x0, timescale=strtol(10) @0x8, epoch=strtoull(16) @0xc, flags=strtoull(10) @0x10.
   * The interpolators (OZLinearInterpolator::interpolate etc.) operate in CMTime rational space, so
   * keypoints must retain value/timescale, not a pre-divided double. An absent/empty element yields
   * an invalid (flags=0) zero time.
   */
  getAsCMTime(e: PCStreamElement): CMTime {
    const t = e.text.trim();
    if (!t) return { value: 0n, timescale: 0, flags: 0, epoch: 0n };
    const parts = t.split(/\s+/);
    const value = parts[0] !== undefined ? BigInt.asIntN(64, BigInt(parseInt(parts[0], 10) || 0)) : 0n;
    const timescale = parts[1] !== undefined ? parseInt(parts[1], 10) : 0;
    const epoch = parts[2] !== undefined ? BigInt(parseInt(parts[2], 16) || 0) : 0n; // base 16 (hex) per aToFigTime
    const flags = parts[3] !== undefined ? (parseInt(parts[3], 10) | kCMTimeFlags_Valid) : kCMTimeFlags_Valid;
    return { value, timescale, flags, epoch };
  }

  /** OZDocument version gate. Returns true when doc version < (maj,min). */
  isLessThanVersion(maj: number, min: number): boolean {
    return this.versionMajor < maj || (this.versionMajor === maj && this.versionMinor < min);
  }
  setTimeScale(ts: number): void { this.timeScale = ts; }

  /**
   * PCSerializerReadStream::~PCSerializerReadStream() — D1 (complete-object dtor) @ProCore 0x000DD60A.
   *
   * Disassembly (4 lines — from otool -tV of ProCore.framework x86_64):
   *   dd60a  pushq  %rbp
   *   dd60b  movq   %rsp, %rbp
   *   dd60e  ud2
   *
   * Body: `ud2` @ProCore 0xDD60A — abstract-class trap. Byte-identical shape
   * to the PCSerializer base-class dtor pair (see PCSerializer._dtorD1 @Ozone
   * 0x6DAF30) and to the sibling PCStreamElement dtor at @ProCore 0xDD63A:
   * clang's canonical output when the compiler proves the base-class dtor
   * entry can never be reached (all live instances are concrete subclasses
   * whose own D1 handles teardown). The sibling D0 (deleting dtor) at
   * @ProCore 0x000DD610 is byte-identical (also `ud2`).
   *
   * Ported as a raising stub that cites the address, per PCSerializer._dtorD1
   * precedent — an unreachable trap must be a loud gap, not a silent no-op.
   * The decode IS `ud2`; this throw is the faithful port, not a deferral of
   * an undecoded body.
   */
  protected _dtorD1(): never {
    throw new Error(
      "PCSerializerReadStream::~PCSerializerReadStream() D1 @ProCore 0xdd60a is `ud2` — abstract-class trap, must never be reached",
    );
  }

  // ===========================================================================
  // THE ELEMENT STACK — `std::deque<PCStreamElement*>` at `this+0x08`
  // ===========================================================================
  // ADDED 2026-08-11 with currentElement() @ProCore 0x2647a. These three fields
  // are not new modelling freedom: they are the exact words that method loads,
  // and the deque's identity is proved by a sibling rather than inferred from
  // the arithmetic. `PCSerializerReadStream::pushElement(PCStreamElement*)`
  // @ProCore 0x262ca reads:
  //
  //   0x262d9  addq  $0x8, %rdi                     ; this + 0x08
  //   0x262e0  callq std::__1::deque<PCStreamElement*, allocator<…>>::push_back
  //
  // so the deque subobject begins at +0x08 (the class's own vptr occupies
  // +0x00), and libc++'s deque layout — a `split_buffer<T**>` of four pointers
  // followed by `__start_` and `__size_` — places its members at:
  //
  //   deque+0x00 = this+0x08   __map_.__first_
  //   deque+0x08 = this+0x10   __map_.__begin_   the ARRAY OF BLOCK POINTERS
  //   deque+0x10 = this+0x18   __map_.__end_
  //   deque+0x18 = this+0x20   __map_.__end_cap_
  //   deque+0x20 = this+0x28   __start_          index of element 0 within block 0
  //   deque+0x28 = this+0x30   __size_
  //
  // The block size is 512 pointers (libc++ uses a 4096-byte block for elements
  // this small), which is what the `shrq $0x9` / `andl $0x1ff` pair below
  // encodes. `popElement()` @0x262ec performs the IDENTICAL index computation
  // on the same three words @0x26303-0x26323 before its virtual destroy call,
  // which independently confirms all three offsets and the block size.
  //
  // Only the words currentElement() touches are modelled; `__first_`,
  // `__end_` and `__end_cap_` belong to push_back/pop_front's growth policy and
  // are separate ledger units.

  /** `this+0x10` — libc++ `__map_.__begin_`: the array of BLOCK pointers, each
   *  block holding 512 `PCStreamElement*`. Loaded @ProCore 0x26487 (`movq
   *  0x10(%rdi), %rcx`) and indexed by `idx >> 9` @0x2649c. */
  _elementsMap: Array<Array<PCStreamElement | null>> = [];
  /** `this+0x28` — libc++ `__start_`: the offset of logical element 0 inside
   *  block 0, so a physical index is `__start_ + i`. Loaded @ProCore 0x2648b. */
  _elementsStart = 0;
  /** `this+0x30` — libc++ `__size_`: the number of elements on the stack.
   *  Loaded and tested for zero @ProCore 0x2647a-0x26481. */
  _elementsSize = 0;

  /**
   * `PCSerializerReadStream::currentElement() const` — @ProCore 0x2647a
   * (__ZNK22PCSerializerReadStream14currentElementEv).
   *
   * The top of the element stack, i.e. an inlined `std::deque::back()` with an
   * empty-check in front of it. Line-for-line transcription of all 15
   * instructions; the `pushq %rbp` frame is set up only on the non-empty path,
   * and the empty path returns through its own `xorl %eax,%eax; retq` at
   * 0x264ab:
   *
   *   0x2647a  movq  0x30(%rdi), %rax     ; rax = __size_
   *   0x2647e  testq %rax, %rax
   *   0x26481  je    0x264ab              ; empty -> return nullptr
   *   0x26483  pushq %rbp                 ; (frame only on the non-empty path)
   *   0x26484  movq  %rsp, %rbp
   *   0x26487  movq  0x10(%rdi), %rcx     ; rcx = __map_.__begin_
   *   0x2648b  movq  0x28(%rdi), %rdx     ; rdx = __start_
   *   0x2648f  addq  %rdx, %rax           ; rax = __size_ + __start_
   *   0x26492  decq  %rax                 ; rax = physical index of the LAST element
   *   0x26495  movq  %rax, %rdx
   *   0x26498  shrq  $0x9, %rdx           ; block = idx / 512
   *   0x2649c  movq  (%rcx,%rdx,8), %rcx  ; rcx = map[block]
   *   0x264a0  andl  $0x1ff, %eax         ; slot = idx % 512
   *   0x264a5  movq  (%rcx,%rax,8), %rax  ; rax = block[slot]
   *   0x264a9  popq  %rbp
   *   0x264aa  retq
   *   0x264ab  xorl  %eax, %eax           ; the empty path
   *   0x264ad  retq
   *
   * NUMERICS. `shrq $0x9` and `andl $0x1ff` are 64-bit unsigned operations on a
   * value that is `__size_ + __start_ - 1`. They are written here as
   * `Math.floor(idx / 512)` and `idx % 512` rather than `idx >>> 9` and
   * `idx & 0x1ff`, because the JS bitwise operators truncate to 32 bits and
   * would silently give a different answer above 2^32 — a deque that large is
   * not reachable in practice, but a wrong answer that only appears at scale is
   * the class of defect this project exists to avoid. For every value below
   * 2^53 the two forms are identical, and this one stays identical past 2^32.
   *
   * BOUNDS. The two loads @0x2649c and @0x264a5 are unchecked: with an empty
   * deque the guard above has already returned, and for a non-empty deque
   * libc++'s invariant guarantees the block exists. The port indexes exactly as
   * the machine does — a caller that has corrupted the three words gets a
   * TypeError here instead of the machine's out-of-bounds load, and no fallback
   * value is invented.
   */
  currentElement(): PCStreamElement | null {
    // @0x2647a  movq 0x30(%rdi), %rax
    const size = this._elementsSize;
    // @0x2647e  testq %rax, %rax   /  @0x26481  je 0x264ab
    if (size === 0) {
      // @0x264ab  xorl %eax, %eax  /  @0x264ad  retq
      return null;
    }
    // @0x26483..0x26484 — prologue (no TS-visible effect; non-empty path only).
    // @0x26487  movq 0x10(%rdi), %rcx
    const map = this._elementsMap;
    // @0x2648b  movq 0x28(%rdi), %rdx
    const start = this._elementsStart;
    // @0x2648f  addq %rdx, %rax   /  @0x26492  decq %rax
    const idx = size + start - 1;
    // @0x26495  movq %rax, %rdx   /  @0x26498  shrq $0x9, %rdx
    const block = Math.floor(idx / 512);
    // @0x264a0  andl $0x1ff, %eax
    const slot = idx % 512;
    // @0x2649c  movq (%rcx,%rdx,8), %rcx
    const blockPtrs = map[block];
    // @0x264a5  movq (%rcx,%rax,8), %rax  /  @0x264a9..0x264aa  epilogue + retq
    return blockPtrs[slot];
  }
}
