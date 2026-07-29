// PCIgnoreElement — ProCore's null-object serialization element.
//
// Decoded from Final Cut Pro.app/.../ProCore x86_64 disassembly. Every method in this
// class is TRIVIAL (either a bare pushq/movq/popq/retq no-op, or the same shape but
// with `movb $0x1, %al` in front to return `true`). The class exists as a drop-in
// serializer target used to SKIP an element during parsing while satisfying the
// interface — every parse* call reports "success" (`true`) with no state change, and
// every write* call is a bit-perfect no-op. This is the standard Itanium-ABI vtable
// stub pattern: derived-class overrides that do nothing.
//
// All 8 methods below cite their exact @0xADDR in ProCore's __TEXT segment.
// No method mutates `this` (which is why the base D1 destructor at 0x262c4 is also a
// no-op: there are no per-instance resources to release).
//
// Symbols (nm -arch x86_64 ProCore.framework/.../ProCore | c++filt):
//   __ZN15PCIgnoreElementD1Ev                                @ProCore 0x000262c4  base dtor
//   __ZN15PCIgnoreElementD0Ev                                @ProCore 0x000269e0  deleting dtor
//   __ZN15PCIgnoreElement11writeHeaderER23PCSerializerWriteStreamb       @ProCore 0x000269ea
//   __ZN15PCIgnoreElement9writeBodyER23PCSerializerWriteStreambbb        @ProCore 0x000269f0
//   __ZN15PCIgnoreElement29markFactoriesForSerializationER23PCSerializerWriteStreamb  @ProCore 0x000269f6
//   __ZN15PCIgnoreElement10parseBeginER22PCSerializerReadStream          @ProCore 0x000269fc
//   __ZN15PCIgnoreElement8parseEndER22PCSerializerReadStream             @ProCore 0x00026a04
//   __ZN15PCIgnoreElement12parseElementER22PCSerializerReadStreamR15PCStreamElement  @ProCore 0x00026a0c
//
// Structural note: PCIgnoreElement adds no data fields. `sizeof(PCIgnoreElement)` is
// exactly the size of its base subobject (the parse-stream element interface); the
// class body is entirely virtual overrides. The vtable (__ZTV15PCIgnoreElement) is
// installed by whichever base ctor runs (undecoded, not required for these method
// bodies since none of them touch `this`).

// Frontier types referenced by method signatures. We only need these as opaque marker
// types so callers' code type-checks; PCIgnoreElement's methods never dereference them.
// (Decoded: no method loads through %rsi/%rdx — the args are received and immediately
// discarded by the popq/retq epilogue.)
export interface PCSerializerWriteStream {}
export interface PCSerializerReadStream {}
export interface PCStreamElement {}

/**
 * PCIgnoreElement — a serializer element that ignores everything.
 *
 * Every method is transcribed byte-for-byte from the disassembly at the addresses cited
 * in each method's doc comment. The class is the standard Itanium-ABI "do-nothing"
 * override family — parse* methods return true (success), write* methods return void,
 * and the base destructor is a no-op (no resources to release).
 */
export class PCIgnoreElement {
  /**
   * PCIgnoreElement::~PCIgnoreElement()  (D1 — non-deleting/base destructor)
   * @ProCore 0x00000000000262c4  (__ZN15PCIgnoreElementD1Ev)
   *
   * DECODE (raw-port/re/disasm/ProCore.PCIgnoreElement.~PCIgnoreElement.s — via ~PCIgnoreElement query):
   *   0x262c4  pushq %rbp
   *   0x262c5  movq  %rsp, %rbp
   *   0x262c8  popq  %rbp
   *   0x262c9  retq
   *
   * Empty destructor — no per-instance resources to free. In TS the class carries
   * no fields, so `destroyBase` is genuinely a no-op. Kept as an explicit method so
   * the vtable slot maps 1:1 to the FCP symbol (see class header).
   */
  destroyBase(): void {
    // @ProCore 0x000262c4: pushq %rbp / movq %rsp, %rbp / popq %rbp / retq  — no-op.
  }

  /**
   * PCIgnoreElement::~PCIgnoreElement()  (D0 — deleting destructor)
   * @ProCore 0x00000000000269e0  (__ZN15PCIgnoreElementD0Ev)
   *
   * DECODE:
   *   0x269e0  pushq %rbp
   *   0x269e1  movq  %rsp, %rbp
   *   0x269e4  popq  %rbp
   *   0x269e5  jmp   0xde6c0    ## symbol stub for: __ZdlPv   (operator delete(void*))
   *
   * Base destructor is empty (see D1 above) so this collapses to a tail-jmp straight to
   * `operator delete(this)`. Under TS/GC, `operator delete` has no equivalent — storage
   * is reclaimed by the collector. Kept as an explicit method to preserve the vtable
   * slot mapping to the FCP symbol.
   */
  destroyAndDelete(): void {
    // @ProCore 0x000269e0: pushq/movq/popq — no base-dtor work.
    // @ProCore 0x000269e5: jmp __ZdlPv — TS has no operator delete; GC owns the heap.
  }

  /**
   * PCIgnoreElement::writeHeader(PCSerializerWriteStream&, bool)
   * @ProCore 0x00000000000269ea  (__ZN15PCIgnoreElement11writeHeaderER23PCSerializerWriteStreamb)
   *
   * DECODE:
   *   0x269ea  pushq %rbp
   *   0x269eb  movq  %rsp, %rbp
   *   0x269ee  popq  %rbp
   *   0x269ef  retq
   *
   * Zero body — the header is INTENTIONALLY not written when this element is being
   * "ignored". Both the stream ref (%rsi) and the bool (%dl) are received in registers
   * per SysV AMD64 ABI and immediately discarded by the retq. Void return.
   */
  writeHeader(_stream: PCSerializerWriteStream, _flag: boolean): void {
    // @ProCore 0x000269ea: pushq/movq/popq/retq — arguments discarded, no state touched.
  }

  /**
   * PCIgnoreElement::writeBody(PCSerializerWriteStream&, bool, bool, bool)
   * @ProCore 0x00000000000269f0  (__ZN15PCIgnoreElement9writeBodyER23PCSerializerWriteStreambbb)
   *
   * DECODE:
   *   0x269f0  pushq %rbp
   *   0x269f1  movq  %rsp, %rbp
   *   0x269f4  popq  %rbp
   *   0x269f5  retq
   *
   * Same no-op shape as writeHeader — the body is intentionally suppressed. Three
   * bools plus the stream ref are received and discarded.
   */
  writeBody(
    _stream: PCSerializerWriteStream,
    _flag1: boolean,
    _flag2: boolean,
    _flag3: boolean,
  ): void {
    // @ProCore 0x000269f0: pushq/movq/popq/retq — no-op.
  }

  /**
   * PCIgnoreElement::markFactoriesForSerialization(PCSerializerWriteStream&, bool)
   * @ProCore 0x00000000000269f6  (__ZN15PCIgnoreElement29markFactoriesForSerializationER23PCSerializerWriteStreamb)
   *
   * DECODE:
   *   0x269f6  pushq %rbp
   *   0x269f7  movq  %rsp, %rbp
   *   0x269fa  popq  %rbp
   *   0x269fb  retq
   *
   * Zero body — no factory registration performed for an ignored element.
   */
  markFactoriesForSerialization(_stream: PCSerializerWriteStream, _flag: boolean): void {
    // @ProCore 0x000269f6: pushq/movq/popq/retq — no-op.
  }

  /**
   * PCIgnoreElement::parseBegin(PCSerializerReadStream&)  →  bool
   * @ProCore 0x00000000000269fc  (__ZN15PCIgnoreElement10parseBeginER22PCSerializerReadStream)
   *
   * DECODE:
   *   0x269fc  pushq %rbp
   *   0x269fd  movq  %rsp, %rbp
   *   0x26a00  movb  $0x1, %al        ; return value = true
   *   0x26a02  popq  %rbp
   *   0x26a03  retq
   *
   * Returns `true` unconditionally — the "ignore" element reports parsing began
   * successfully so the outer dispatch loop advances past it without complaint.
   * SysV ABI: bool return goes in %al; `movb $0x1, %al` sets it to true.
   */
  parseBegin(_stream: PCSerializerReadStream): boolean {
    // @ProCore 0x00026a00: movb $0x1, %al — return true.
    return true;
  }

  /**
   * PCIgnoreElement::parseEnd(PCSerializerReadStream&)  →  bool
   * @ProCore 0x0000000000026a04  (__ZN15PCIgnoreElement8parseEndER22PCSerializerReadStream)
   *
   * DECODE:
   *   0x26a04  pushq %rbp
   *   0x26a05  movq  %rsp, %rbp
   *   0x26a08  movb  $0x1, %al        ; return value = true
   *   0x26a0a  popq  %rbp
   *   0x26a0b  retq
   *
   * Identical shape to parseBegin: return true, no side effects.
   */
  parseEnd(_stream: PCSerializerReadStream): boolean {
    // @ProCore 0x00026a08: movb $0x1, %al — return true.
    return true;
  }

  /**
   * PCIgnoreElement::parseElement(PCSerializerReadStream&, PCStreamElement&)  →  bool
   * @ProCore 0x0000000000026a0c  (__ZN15PCIgnoreElement12parseElementER22PCSerializerReadStreamR15PCStreamElement)
   *
   * DECODE:
   *   0x26a0c  pushq %rbp
   *   0x26a0d  movq  %rsp, %rbp
   *   0x26a10  movb  $0x1, %al        ; return value = true
   *   0x26a12  popq  %rbp
   *   0x26a13  retq
   *
   * Same as parseBegin/parseEnd: reports success without inspecting the element.
   * The child-element ref (%rdx) is received and immediately discarded.
   */
  parseElement(_stream: PCSerializerReadStream, _element: PCStreamElement): boolean {
    // @ProCore 0x00026a10: movb $0x1, %al — return true.
    return true;
  }
}
