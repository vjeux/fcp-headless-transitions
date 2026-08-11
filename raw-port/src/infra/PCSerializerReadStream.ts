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


/**
 * The receiver side of the virtual dispatch at the end of
 * `PCSerializerReadStream::processElement` @ProCore 0x2683b — i.e. the C++
 * `PCSerializer*` that `PCStreamElement`'s constructor stores at +0x18
 * (`PCStreamElement::PCStreamElement(unsigned, PCScope*, PCSerializer*)`
 * @ProCore 0x286e0, `movq %rcx, 0x18(%rdi)` @0x286fa).
 *
 * WHICH VIRTUAL SLOT, MEASURED RATHER THAN INFERRED. `processElement` loads
 * the receiver's vptr and calls `vptr+0x38` — slot 7. That slot was resolved
 * by reading the real vtables out of the LIVE x86_64 images under
 * `arch -x86_64` and naming each entry with `dladdr` (the vtable object's
 * installed pointer is `__ZTV… + 0x10`, so slot 7 is `__ZTV… + 0x48`):
 *
 *   Ozone `__ZTV7OZScene`    slot 5 `OZScene::parseBegin(PCSerializerReadStream&)`
 *                            slot 6 `OZScene::parseEnd(PCSerializerReadStream&)`
 *                            slot 7 `OZScene::parseElement(PCSerializerReadStream&,
 *                                                          PCStreamElement&)`   <== vptr+0x38
 *                            slot 8 `PCSerializer::readSignificantWhiteSpace()`
 *   Ozone `__ZTV10OZDocument` slot 7 `OZDocument::parseElement(PCSerializerReadStream&,
 *                                                             PCStreamElement&)`
 *
 * Slot 8 being the un-overridden `PCSerializer::readSignificantWhiteSpace` is
 * what identifies slots 2..8 as PCSerializer's OWN virtual table rather than
 * the leaf class's: `writeHeader`, `writeBody`,
 * `markFactoriesForSerialization`, `parseBegin`, `parseEnd`, `parseElement`,
 * `readSignificantWhiteSpace`. (The file comment in `PCSerializer.ts` records
 * that those slots "come from ProChannel.framework and are not accessible from
 * Ozone's binary" — reading an instantiated subclass's vtable out of the
 * running process is how they became accessible.)
 *
 * THE RETURN TYPE IS `bool`, also measured rather than assumed: the smallest
 * implementation in the corpus, `PCIgnoreElement::parseElement` @ProCore
 * 0x26a0c, is `pushq %rbp ; movq %rsp,%rbp ; movb $0x1, %al ; popq %rbp ; retq`
 * — it sets only %al, the one-byte boolean register. `processElement`'s own
 * NULL path agrees: it returns with `xorl %eax, %eax` @0x2683d.
 *
 * MODELLED AS AN INTERFACE, NOT A NEW CLASS. This is not an invented helper:
 * it is the shape of the existing abstract base `PCSerializer`
 * (`src/infra/PCSerializer.ts`), narrowed to the one slot this call site
 * needs. 117 classes across the five frameworks define
 * `parseElement(PCSerializerReadStream&, PCStreamElement&)` — `OZScene`,
 * `OZDocument`, `OZSceneNode`, `FactoryParser`, `PCIgnoreElement`,
 * `FFOZMediaRefChannel` and so on — so the call really is polymorphic, and a
 * TypeScript method call on a typed receiver is the faithful model of a
 * vtable dispatch (the same convention `PC_Sp_counted_base.destroy()` uses
 * for its `jmpq *0x8(%rax)` tail-call).
 */
export interface PCSerializerParseTarget {
  /** Virtual slot `vptr+0x38` (slot 7) — see the interface doc for how that
   *  was resolved. Returns the C++ `bool` left in %al. */
  parseElement(stream: PCSerializerReadStream, element: PCStreamElement): boolean;
}

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

  /**
   * `PCSerializerReadStream::processElement(PCStreamElement&)`
   *   — @ProCore 0x2681c
   *   — __ZN22PCSerializerReadStream14processElementER15PCStreamElement
   *
   * Hand the element to the object that owns it: if the element carries a
   * `PCSerializer*` at +0x18, mark the element as processed (+0xc = 1) and
   * TAIL-CALL that object's `parseElement` virtual, forwarding this stream and
   * the element; otherwise answer `false` and touch nothing.
   *
   * FULL DISASM (raw-port/re/disasm/
   * ProCore.__ZN22PCSerializerReadStream14processElementER15PCStreamElement.s
   * — 17 lines), every instruction accounted for:
   *
   *   0x2681c  pushq %rbp                 ; frame setup (no TS counterpart)
   *   0x2681d  movq  %rsp, %rbp
   *   0x26820  movq  %rsi, %rdx           ; ARG SHUFFLE: element -> 3rd-arg register
   *   0x26823  movq  %rdi, %rsi           ; ARG SHUFFLE: this (the stream) -> 2nd-arg register
   *   0x26826  movq  0x18(%rdx), %rdi     ; NEW RECEIVER: rdi = element->serializer (+0x18)
   *   0x2682a  testq %rdi, %rdi           ; ZF = (serializer == NULL)
   *   0x2682d  je    0x2683d              ;   NULL -> the bail path
   *   0x2682f  movb  $0x1, 0xc(%rdx)      ; element->processedFlag (+0xc) = 1
   *   0x26833  movq  (%rdi), %rax         ; rax = serializer->vptr
   *   0x26836  movq  0x38(%rax), %rax     ; rax = vptr[+0x38] = slot 7 = parseElement
   *   0x2683a  popq  %rbp                 ; epilogue BEFORE the tail jump
   *   0x2683b  jmpq  *%rax                ; TAIL-CALL serializer->parseElement(stream, element)
   *   0x2683d  xorl  %eax, %eax           ; bail: return value = 0
   *   0x2683f  popq  %rbp
   *   0x26840  retq                       ; return false
   *   0x26841  nop                        ; alignment pad — not executed
   *
   * THE BODY IS COMPLETE: 0x2681c..0x26840 inclusive plus the 0x26841 pad, and
   * the next symbol starts at exactly 0x26842
   * (`__ZN22PCSerializerReadStream11getAsStringER15PCStreamElementP8PCString`).
   *
   * THE ARGUMENT SHUFFLE IS THE POINT OF THE FUNCTION. On entry the System V
   * registers hold `%rdi` = this (the stream), `%rsi` = the element. The two
   * `movq`s at 0x26820/0x26823 slide them one place right, and the load at
   * 0x26826 puts the element's serializer in `%rdi` — so the tail-jump enters
   * `parseElement` with exactly `(receiver = element->serializer,
   * arg1 = this stream, arg2 = the element)`. Because it is a `jmp` and not a
   * `callq`, this frame's return value IS the callee's: nothing is
   * post-processed, and the `bool` in %al travels straight out to our caller.
   *
   * WHAT +0x18 AND +0xc ARE, from the element's own constructor
   * `PCStreamElement::PCStreamElement(unsigned, PCScope*, PCSerializer*)`
   * @ProCore 0x286e0 — which is where those two slots are established:
   *
   *   0x286e4  leaq  <vtable>(%rip), %rax ; +0x00  vptr
   *   0x286eb  movq  %rax, (%rdi)
   *   0x286ee  movl  %esi, 0x8(%rdi)      ; +0x08  the element TYPE tag (u32, arg1)
   *   0x286f1  xorl  %eax, %eax
   *   0x286f3  movb  %al, 0xc(%rdi)       ; +0x0c  ZEROED — the flag this method sets
   *   0x286f6  movq  %rdx, 0x10(%rdi)     ; +0x10  PCScope*   (arg2)
   *   0x286fa  movq  %rcx, 0x18(%rdi)     ; +0x18  PCSerializer* (arg3) — our receiver
   *   0x286fe  movq  $0x0, 0x20(%rdi)     ; +0x20  zeroed
   *   0x28706  movb  %al, 0x28(%rdi)      ; +0x28  zeroed
   *
   * So the receiver is the `PCSerializer*` the element was CONSTRUCTED with,
   * and the +0xc byte starts at 0 and is set to 1 here — "this element has
   * been handed to its serializer". Both slots are modelled on
   * `PCStreamElement` (`serializerAt0x18`, `processedFlagAt0xc`), which is the
   * class that owns them.
   *
   * VIRTUAL DISPATCH, RESOLVED. `vptr+0x38` is slot 7, and slot 7 is
   * `parseElement(PCSerializerReadStream&, PCStreamElement&)` — read out of the
   * live images with `dladdr`, see {@link PCSerializerParseTarget} above for
   * the measured slot table. This is a genuine polymorphic call (117 classes
   * define that method), so it is transcribed as a method call on the typed
   * receiver rather than deferred: there is no single static target to name,
   * and a TypeScript virtual call is what a vtable dispatch IS.
   *
   * MEASURED AGAINST THE LIVE BINARY — including the dispatch itself.
   * `raw-port/re/oracle/PCSerializerReadStream_processElement_oracle.py` (under
   * `arch -x86_64 /usr/bin/python3`) dlsym's this exported `T` symbol, checks
   * the address is slide+0x2681c and that the 37 mapped opcode bytes are the
   * ones listed above, then calls it over 0xCD-poisoned arenas with a
   * SYNTHETIC vtable whose twelve slots hold twelve distinct callbacks — so
   * the run observes which slot was entered, in which register each argument
   * arrived, what the +0xc byte became and what the function returned. The
   * REAL TypeScript below is driven over the same scenarios by
   * `PCSerializerReadStream_processElement_driver.mts` and must produce the
   * same observations. Result, at ProCore slide 0x10c2a8000 (30 checks, exit 0):
   * **PASS, 0 checks failed** — dlsym at slide+0x2681c, opcode bytes equal,
   * SLOT 7 entered (never 6, 8 or any other), arguments arriving as
   * (%rdi = the element's serializer, %rsi = this stream, %rdx = the element),
   * the +0xc byte 1 after every dispatching call and untouched on the NULL
   * path, the callee's `bool` returned unchanged (both 0 and 1), the rest of
   * both arenas byte-identical, and all seven negative controls diverging
   * (returns-true-on-NULL, flag-not-set, flag-set-on-NULL, swapped stream and
   * element arguments, receiver passed as the stream, return value ignored,
   * and dispatch to slot 6 instead of 7).
   *
   * @param element — %rsi on entry, the element to hand on.
   * @returns the callee's `bool`, or `false` when the element has no serializer.
   */
  processElement(element: PCStreamElement): boolean {
    // @0x26820..0x26823 — the argument shuffle. In TS the two values are just
    //   named; the registers they occupy are what the disasm is describing.
    // @0x26826  movq 0x18(%rdx), %rdi — the new receiver.
    const serializer = element.serializerAt0x18;
    // @0x2682a..0x2682d  testq %rdi,%rdi ; je 0x2683d
    if (serializer === null) {
      // @0x2683d..0x26840  xorl %eax,%eax ; popq %rbp ; retq — and note that
      //   the +0xc byte is NOT written on this path.
      return false;
    }
    // @0x2682f  movb $0x1, 0xc(%rdx) — mark the element processed. This
    //   happens BEFORE the dispatch, so a parseElement that inspects the flag
    //   (or re-enters this method) sees it already set.
    element.processedFlagAt0xc = 1;
    // @0x26833..0x2683b  movq (%rdi),%rax ; movq 0x38(%rax),%rax ; jmpq *%rax
    //   Virtual slot 7 = parseElement, tail-called with (stream, element), so
    //   its return value is ours.
    return serializer.parseElement(this, element);
  }
}
