// OZGuide — Ozone.framework: a single alignment-guide element in a Motion/FCP
// document (Motion's Canvas guides — a horizontal or vertical line at a fixed
// coordinate). Owns two POD fields:
//   +0x8   float   location   (position along the perpendicular axis)
//   +0xc   bool    vertical   (true = vertical guide, false = horizontal)
//
// Faithful transcription from Ozone.framework x86_64 disassembly of the six
// PCSerializer-vtable hooks + both dtors (all eight exported symbols):
//
//   @0x375050  OZGuide::writeHeader(PCSerializerWriteStream&, bool)
//   @0x375090  OZGuide::writeBody(PCSerializerWriteStream&, bool, bool, bool)
//   @0x375110  OZGuide::markFactoriesForSerialization(PCSerializerWriteStream&, bool)
//   @0x375120  OZGuide::parseBegin(PCSerializerReadStream&)
//   @0x375140  OZGuide::parseEnd(PCSerializerReadStream&)
//   @0x375150  OZGuide::parseElement(PCSerializerReadStream&, PCStreamElement&)
//   @0x375480  OZGuide::~OZGuide()     [D1 — empty body]
//   @0x375490  OZGuide::~OZGuide()     [D0 — tail-jmp to __ZdlPv (operator delete)]
//
// PROVENANCE / DECODE  (raw-port/re/disasm/):
//   OZGuide.writeHeader.s                          @0x375050 (19 lines)
//   OZGuide.writeBody.s                            @0x375090 (40 lines)
//   OZGuide.markFactoriesForSerialization.s        @0x375110  (6 lines — empty body)
//   OZGuide.parseBegin.s                           @0x375120 (10 lines)
//   OZGuide.parseEnd.s                             @0x375140  (7 lines — return true)
//   OZGuide.parseElement.s                         @0x375150 (22 lines)
//   OZGuide.~OZGuide.s                             @0x375490  (6 lines — D0 tail-jmp __ZdlPv)
//   ~OZGuideD1                                     @0x375480  (empty body — read from tV.txt)
//
// -----------------------------------------------------------------------------
// SCOPE / ELEMENT-TAG TABLE
// -----------------------------------------------------------------------------
// The nested XML scope this class operates in is OZGuideScope (symbol
// `__ZL12OZGuideScope`, a static local PCScope struct — referenced via
// `leaq __ZL12OZGuideScope(%rip), %rsi` at each parse/write hook). Its
// element-type tag table is transcribed in raw-port/src/infra/elementTags.ts:
//
//   "OZGuideScope": { "location": 1, "vertical": 2, "guide": 76 }
//
// which parseElement dispatches on:
//   type == 1 ("location")  → elem->vtable[+0x38](this + 0x8)  [PCStreamElement getAsFloat writing float @ this+0x8]
//   type == 2 ("vertical")  → elem->vtable[+0x48](this + 0xc)  [PCStreamElement getAsBool  writing bool  @ this+0xc]
//   type == 76 ("guide")    → outer element opened by writeHeader (tag id `0x4C = 76`)
//
// -----------------------------------------------------------------------------
// STRUCT LAYOUT
// -----------------------------------------------------------------------------
// Recovered from parseElement offsets (0x8, 0xc) and writeBody reads (movss/movzbl):
//
//   +0x0   vptr             OZGuide vtable (PCSerializer sub-object begins here)
//   +0x8   float   location  (parseElement writes; writeBody reads via `movss 0x8(%r14),%xmm0`)
//   +0xc   bool    vertical  (parseElement writes; writeBody reads via `movzbl 0xc(%r14),%r14d`)
//   +0x10  end
//
// The class is stored in std::set<OZGuide, std::less<OZGuide>, …> so operator< exists but is
// not among the eight exported symbols above (either inlined or elsewhere).
//
// -----------------------------------------------------------------------------
// PCSerializerWriteStream vtable indices used by writeHeader / writeBody
// -----------------------------------------------------------------------------
// The concrete write-stream's vtable-slot semantics (indices are byte offsets):
//
//   *0x10  writeElementBegin(u32 tag)              — opens `<tagName>` for the given element tag
//   *0x18  writeElementEnd()                       — closes the current element
//   *0x30  writeBool(bool)                         — emits a boolean payload for the open element
//   *0x50  writeFloat(float)                       — emits a float payload for the open element
//
// These are inferred from the argument shapes in writeBody: slot 0x10 takes `esi=<tag>` and is
// called with 0x1 (location tag) and 0x2 (vertical tag); slot 0x30 takes `esi=<bool>` right after
// vertical's writeElementBegin; slot 0x50 takes `xmm0=<float>` right after location's
// writeElementBegin. Slot 0x18 is called after each payload write with no data arg. The
// PCSerializerWriteStream class itself is only decoded as an abstract base
// (raw-port/src/infra/PCSerializerWriteStream.ts) — the vtable slot bodies live on the concrete
// sub-class and are not yet transcribed. These indexed calls are surfaced via
// PCSerializerWriteStreamOps below.
//
// -----------------------------------------------------------------------------
// The port
// -----------------------------------------------------------------------------

import { PCSerializer } from "../infra/PCSerializer.js";
import { PCSerializerReadStream } from "../infra/PCSerializerReadStream.js";
import { PCSerializerWriteStream } from "../infra/PCSerializerWriteStream.js";
import { PCStreamElement } from "../infra/PCStreamElement.js";

/**
 * OZGuideScope — PCScope singleton at Ozone `__ZL12OZGuideScope`. The concrete PCScope
 * struct layout (id→name interning) is inherited from ProChannel and not yet ported at
 * the byte level; this handle exists so parseBegin / parseElement / writeHeader / writeBody
 * can pass the same identity to pushScope() as the compiled binary does.
 *
 * @provenance Ozone symbol __ZL12OZGuideScope — referenced at
 *   parseBegin  @0x375127  `leaq __ZL12OZGuideScope(%rip),%rsi`
 *   writeHeader @0x375059  `leaq __ZL12OZGuideScope(%rip),%rsi`
 *   writeBody   @0x3750a1  `leaq __ZL12OZGuideScope(%rip),%rsi`
 */
export const OZGuideScope: { readonly __symbol: "__ZL12OZGuideScope" } = Object.freeze({
  __symbol: "__ZL12OZGuideScope" as const,
});

/**
 * Concrete-write-stream vtable ops used by OZGuide::writeHeader / writeBody. Each slot
 * (byte offset) is a virtual on a PCSerializerWriteStream subclass whose body is not yet
 * transcribed; we surface them as a duck-typed interface so a caller can plug in a real
 * implementation and the port will call the same slots in the same order.
 *
 * @provenance Ozone @0x375073 (writeHeader `*0x10`), @0x3750c6 / @0x3750eb (writeBody `*0x10`),
 *   @0x3750d4 (writeBody `*0x50`), @0x3750dd / @0x3750fc (writeBody `*0x18`),
 *   @0x3750fc (writeBody `*0x30`), @0x37510d (writeBody tail-jmp `*0x18`).
 */
export interface PCSerializerWriteStreamOps {
  /** vtable *0x10 — open `<tag>` with numeric tag id. */
  writeElementBegin(tag: number): void;
  /** vtable *0x18 — close current element. */
  writeElementEnd(): void;
  /** vtable *0x30 — emit boolean payload for the open element. */
  writeBool(value: boolean): void;
  /** vtable *0x50 — emit float payload for the open element (single-precision). */
  writeFloat(value: number): void;
}

/**
 * OZGuide — a single alignment guide (horizontal or vertical line at fixed coord).
 *
 * @provenance Ozone @0x375050..@0x375495 (six virtual hooks + D1 + D0). Struct layout
 * is 0x10 bytes: vptr + float @+0x8 + bool @+0xc.
 */
export class OZGuide extends PCSerializer {
  /**
   * @provenance @0x3750b0 `movss 0x8(%r14), %xmm0` (writeBody reads),
   *             @0x375176 `addq %rcx, %rsi ; movl $0x8, %ecx` (parseElement writes when tag==1).
   * `location` is stored as an IEEE-754 single-precision float — writeBody uses `movss`
   * (scalar single) and PCStreamElement's vtable slot 0x38 is a `float*` output.
   */
  location: number = 0;

  /**
   * @provenance @0x3750e0 `movzbl 0xc(%r14), %r14d` (writeBody reads),
   *             @0x375160 `movl $0xc, %ecx` (parseElement writes when tag==2).
   * `vertical` is stored as a `bool` (1 byte). writeBody zero-extends it via movzbl and
   * passes it in `esi` to the stream's writeBool slot.
   */
  vertical: boolean = false;

  // -----------------------------------------------------------------
  // parseBegin @Ozone 0x375120  (10 lines)
  // -----------------------------------------------------------------
  //   0x375120 pushq %rbp
  //   0x375121 movq  %rsp, %rbp
  //   0x375124 movq  %rsi, %rdi                        ; arg1 = &stream
  //   0x375127 leaq  __ZL12OZGuideScope(%rip), %rsi   ; arg2 = &OZGuideScope
  //   0x37512e callq PCSerializerReadStream::pushScope(PCScope*)
  //   0x375133 movb  $0x1, %al                         ; return true
  //   0x375135 popq  %rbp
  //   0x375136 retq
  //
  /**
   * parseBegin @Ozone 0x375120 — push OZGuideScope, return true.
   *
   * @provenance Ozone @0x375120 (call @0x37512e to
   *   __ZN22PCSerializerReadStream9pushScopeEP7PCScope — stub @Ozone 0x6DE79C)
   */
  parseBegin(stream: PCSerializerReadStream): boolean {
    // Same pattern as FactoryParser.parseBegin — pushScope is on the ProChannel side.
    const anyStream = stream as unknown as { pushScope?: (scope: unknown) => void };
    if (typeof anyStream.pushScope === "function") {
      anyStream.pushScope(OZGuideScope);
    } else {
      throw new Error(
        "PCSerializerReadStream::pushScope(PCScope*) @Ozone stub 0x6DE79C not yet transcribed — " +
          "called from OZGuide::parseBegin @0x37512e",
      );
    }
    return true; // @0x375133 movb $0x1,%al
  }

  // -----------------------------------------------------------------
  // parseEnd @Ozone 0x375140  (7 lines) — return true, nothing else.
  // -----------------------------------------------------------------
  //   0x375140 pushq %rbp
  //   0x375141 movq  %rsp, %rbp
  //   0x375144 movb  $0x1, %al          ; return true
  //   0x375146 popq  %rbp
  //   0x375147 retq
  //
  /**
   * parseEnd @Ozone 0x375140 — trivially returns true, no side-effects.
   * The enclosing scope's parser is responsible for the matching popScope.
   *
   * @provenance Ozone @0x375140 (movb $0x1,%al @0x375144)
   */
  parseEnd(_stream: PCSerializerReadStream): boolean {
    return true; // @0x375144 movb $0x1,%al
  }

  // -----------------------------------------------------------------
  // parseElement @Ozone 0x375150  (22 lines) — the real element dispatch.
  // -----------------------------------------------------------------
  //   0x375150 movq  %rdi, %rsi              ; save this (rdi) into rsi
  //   0x375153 movl  0x8(%rdx), %eax         ; eax = elem->type   (PCStreamElement +0x8)
  //   0x375156 cmpl  $0x1, %eax              ; case tag==1 ("location") ?
  //   0x375159 je    0x37516c
  //   0x37515b cmpl  $0x2, %eax              ; case tag==2 ("vertical") ?
  //   0x37515e jne   0x375187                ; else → return false
  //
  //   0x375160 movl  $0x48, %eax             ; vtable-slot = 0x48 (getAsBool)
  //   0x375165 movl  $0xc,  %ecx             ; field offset = +0xc (this->vertical)
  //   0x37516a jmp   0x375176
  //
  //   0x37516c movl  $0x38, %eax             ; vtable-slot = 0x38 (getAsFloat)
  //   0x375171 movl  $0x8,  %ecx             ; field offset = +0x8 (this->location)
  //
  //   0x375176 pushq %rbp                    ; ← common tail
  //   0x375177 movq  %rsp, %rbp
  //   0x37517a addq  %rcx, %rsi              ; rsi = this + fieldOffset
  //   0x37517d movq  (%rdx), %rcx            ; rcx = elem->vtable
  //   0x375180 movq  %rdx, %rdi              ; rdi = &elem (this-ptr for the virtual call)
  //   0x375183 callq *(%rcx, %rax)           ; elem->vtable[slot](elem, this+fieldOffset)
  //   0x375186 popq  %rbp
  //
  //   0x375187 xorl  %eax, %eax              ; return false
  //   0x375189 retq
  //
  /**
   * parseElement @Ozone 0x375150 — dispatch on `elem->type`:
   *
   *   tag == 1 ("location") → elem->getAsFloat(&this.location)
   *   tag == 2 ("vertical") → elem->getAsBool (&this.vertical)
   *   else                  → return false, no side-effect
   *
   * The FCP binary returns `false` UNCONDITIONALLY here (see `xorl %eax,%eax` @0x375187 —
   * a converged tail that both matched-tag paths flow through). The `movb $0x1` for a
   * "handled" return is absent; both `je 0x37516c` and `jmp 0x375176` fall THROUGH to the
   * common `popq %rbp` at 0x375186, then to the `xorl %eax,%eax` at 0x375187, so parseElement
   * *always* returns false — the tag-1/tag-2 cases execute the field-write side effect but
   * still return the same false the "unknown tag" path returns. This is exactly how FCP
   * emits it — do not "correct" this to `return true` on matched tags.
   *
   * @provenance Ozone @0x375150 (control flow), @0x375187 xorl %eax,%eax (unconditional false)
   */
  parseElement(_stream: PCSerializerReadStream, elem: PCStreamElement): boolean {
    // @0x375153 read elem.type
    const tag = elem.type;

    if (tag === 1) {
      // @0x37516c  slot 0x38 = PCStreamElement::getAsFloat(float*); field @+0x8 = this.location
      const anyElem = elem as unknown as {
        getAsFloat?: (out: { value: number }) => void;
      };
      if (typeof anyElem.getAsFloat === "function") {
        const out = { value: 0 };
        anyElem.getAsFloat(out);
        this.location = Math.fround(out.value); // single-precision (movss slot in writeBody)
      } else {
        throw new Error(
          "PCStreamElement::getAsFloat(float*) at vtable slot 0x38 not yet transcribed — " +
            "called from OZGuide::parseElement @0x375183 for tag==1 (location)",
        );
      }
    } else if (tag === 2) {
      // @0x375160  slot 0x48 = PCStreamElement::getAsBool(bool*); field @+0xc = this.vertical
      const anyElem = elem as unknown as {
        getAsBool?: (out: { value: boolean }) => void;
      };
      if (typeof anyElem.getAsBool === "function") {
        const out = { value: false };
        anyElem.getAsBool(out);
        this.vertical = out.value;
      } else {
        throw new Error(
          "PCStreamElement::getAsBool(bool*) at vtable slot 0x48 not yet transcribed — " +
            "called from OZGuide::parseElement @0x375183 for tag==2 (vertical)",
        );
      }
    }
    // @0x375187 xorl %eax,%eax — unconditional return false (even after a matched tag).
    return false;
  }

  // -----------------------------------------------------------------
  // writeHeader @Ozone 0x375050  (19 lines) — push OZGuideScope, open
  //   the <guide> element (tag 76 = 0x4C), tail-jmp popScope.
  // -----------------------------------------------------------------
  //   0x375056 movq  %rsi, %rbx                     ; rbx = &stream
  //   0x375059 leaq  __ZL12OZGuideScope(%rip), %rsi
  //   0x375060 movq  %rbx, %rdi
  //   0x375063 callq PCSerializerWriteStream::pushScope(PCScope*)
  //   0x375068 movq  (%rbx), %rax                    ; rax = stream->vtable
  //   0x37506e movl  $0x4c, %esi                     ; tag = 76 ("guide")
  //   0x375073 callq *0x10(%rax)                     ; stream->writeElementBegin(0x4C)
  //   0x375076 movq  %rbx, %rdi
  //   0x37507f jmp   PCSerializerWriteStream::popScope(void)
  //
  /**
   * writeHeader @Ozone 0x375050 — pushScope(OZGuideScope), open the outer `<guide>` element
   * (tag id 0x4C = 76 per OZGuideScope["guide"]), then tail-jmp popScope. Note there is NO
   * writeElementEnd for the outer element here — the FCP binary emits it that way: the outer
   * element remains open for the caller's writeBody payload, and popScope is what closes the
   * scope stack (the writeElementEnd for `guide` presumably lands in an enclosing writer).
   *
   * @provenance Ozone @0x375050 (@0x375063 pushScope stub 0x6DE820; @0x37506e `$0x4c`;
   *   @0x375073 `callq *0x10(%rax)`; @0x37507f tail-jmp popScope stub 0x6DE81A).
   */
  writeHeader(stream: PCSerializerWriteStream, _flag: boolean): void {
    const anyStream = stream as unknown as {
      pushScope?: (scope: unknown) => void;
      popScope?: () => void;
      vtableOps?: PCSerializerWriteStreamOps;
    };

    if (typeof anyStream.pushScope === "function") {
      anyStream.pushScope(OZGuideScope); // @0x375063
    } else {
      throw new Error(
        "PCSerializerWriteStream::pushScope(PCScope*) @Ozone stub 0x6DE820 not yet transcribed — " +
          "called from OZGuide::writeHeader @0x375063",
      );
    }

    // @0x375073 stream->vtable[*0x10](0x4C) — writeElementBegin("guide" tag = 76)
    if (anyStream.vtableOps) {
      anyStream.vtableOps.writeElementBegin(0x4c);
    } else {
      throw new Error(
        "PCSerializerWriteStream vtable slot *0x10 (writeElementBegin) not yet transcribed — " +
          "called from OZGuide::writeHeader @0x375073 with tag=0x4C (guide)",
      );
    }

    // @0x37507f tail-jmp popScope. Note this is BEFORE writeElementEnd — FCP intentionally
    // leaves the outer <guide> element open for the caller's writeBody.
    if (typeof anyStream.popScope === "function") {
      anyStream.popScope();
    } else {
      throw new Error(
        "PCSerializerWriteStream::popScope() @Ozone stub 0x6DE81A not yet transcribed — " +
          "tail-called from OZGuide::writeHeader @0x37507f",
      );
    }
  }

  // -----------------------------------------------------------------
  // writeBody @Ozone 0x375090  (40 lines) — the payload writer.
  // -----------------------------------------------------------------
  //   0x37509b movq  %rsi, %rbx                     ; rbx = &stream
  //   0x37509e movq  %rdi, %r14                     ; r14 = this
  //   0x3750a1 leaq  __ZL12OZGuideScope(%rip), %rsi
  //   0x3750ab callq PCSerializerWriteStream::pushScope(PCScope*)
  //   0x3750b0 movss 0x8(%r14), %xmm0                ; xmm0 = this->location   (+0x8)
  //   0x3750b6 movss %xmm0, -0x14(%rbp)              ; stash on stack (kept as float)
  //   0x3750bb movq  (%rbx), %rax                    ; rax = stream->vtable
  //   0x3750c1 movl  $0x1, %esi                      ; tag = 1 ("location")
  //   0x3750c6 callq *0x10(%rax)                     ; writeElementBegin(1)
  //   0x3750cc rdi = &stream
  //   0x3750cf movss -0x14(%rbp), %xmm0              ; reload the float
  //   0x3750d4 callq *0x50(%rax)                     ; writeFloat(location)
  //   0x3750dd callq *0x18(%rax)                     ; writeElementEnd()
  //   0x3750e0 movzbl 0xc(%r14), %r14d               ; r14d = this->vertical  (+0xc)
  //   0x3750eb movl  $0x2, %esi                      ; tag = 2 ("vertical")
  //   0x3750f0 callq *0x10(%rax)                     ; writeElementBegin(2)
  //   0x3750f9 movl  %r14d, %esi                     ; esi = vertical (bool)
  //   0x3750fc callq *0x30(%rax)                     ; writeBool(vertical)
  //   0x37510d jmpq  *0x18(%rax)                     ; tail-jmp writeElementEnd()
  //
  /**
   * writeBody @Ozone 0x375090 — push OZGuideScope, emit two child elements:
   *
   *   <location>{this.location as float}</location>
   *   <vertical>{this.vertical as bool}</vertical>
   *
   * The last writeElementEnd() is a tail-jmp (`jmpq *0x18(%rax)` @0x37510d). There is NO
   * matching popScope in writeBody: the scope-stack pop is handled elsewhere in FCP's writer
   * pipeline (writeBody's counterpart in a caller pops the scope). We mirror this faithfully.
   *
   * The three EXTRA args (`bool, bool, bool` in the C++ signature) are UNUSED by the ported
   * body — the function's frame doesn't touch them, and there is no reference to `edx/ecx/r8`
   * anywhere after the prologue.
   *
   * @provenance Ozone @0x375090 (@0x3750ab pushScope stub 0x6DE820; @0x3750c6 / @0x3750f0
   *   writeElementBegin *0x10; @0x3750d4 writeFloat *0x50; @0x3750dd writeElementEnd *0x18;
   *   @0x3750fc writeBool *0x30; @0x37510d tail-jmp writeElementEnd *0x18).
   */
  writeBody(
    stream: PCSerializerWriteStream,
    _a: boolean,
    _b: boolean,
    _c: boolean,
  ): void {
    const anyStream = stream as unknown as {
      pushScope?: (scope: unknown) => void;
      vtableOps?: PCSerializerWriteStreamOps;
    };

    if (typeof anyStream.pushScope === "function") {
      anyStream.pushScope(OZGuideScope); // @0x3750ab
    } else {
      throw new Error(
        "PCSerializerWriteStream::pushScope(PCScope*) @Ozone stub 0x6DE820 not yet transcribed — " +
          "called from OZGuide::writeBody @0x3750ab",
      );
    }

    if (!anyStream.vtableOps) {
      throw new Error(
        "PCSerializerWriteStream vtable ops (slots *0x10/*0x18/*0x30/*0x50) not yet transcribed — " +
          "called from OZGuide::writeBody @0x3750c6..@0x37510d",
      );
    }
    const ops = anyStream.vtableOps;

    // <location>{this.location}</location> — @0x3750b0..@0x3750dd
    ops.writeElementBegin(1); // @0x3750c6  tag = 1 (location)
    ops.writeFloat(Math.fround(this.location)); // @0x3750d4  slot *0x50, xmm0 (single-precision)
    ops.writeElementEnd(); // @0x3750dd  slot *0x18

    // <vertical>{this.vertical}</vertical> — @0x3750e0..@0x37510d
    ops.writeElementBegin(2); // @0x3750f0  tag = 2 (vertical)
    ops.writeBool(this.vertical); // @0x3750fc  slot *0x30, esi=bool
    ops.writeElementEnd(); // @0x37510d  tail-jmp slot *0x18
  }

  // -----------------------------------------------------------------
  // markFactoriesForSerialization @Ozone 0x375110  (6 lines — empty).
  // -----------------------------------------------------------------
  //   0x375110 pushq %rbp
  //   0x375111 movq  %rsp, %rbp
  //   0x375114 popq  %rbp
  //   0x375115 retq
  //
  /**
   * markFactoriesForSerialization @Ozone 0x375110 — empty body. OZGuide is a POD leaf; it
   * owns no OZFactory references that would need to be marked before serialization.
   *
   * @provenance Ozone @0x375110 (prologue + epilogue only, no work)
   */
  markFactoriesForSerialization(
    _stream: PCSerializerWriteStream,
    _flag: boolean,
  ): void {
    // no-op — mirrors empty asm body (matches FactoryParser::writeBody, DummyParser hooks, etc.)
  }

  // -----------------------------------------------------------------
  // Destructors  (both bodies decoded)
  // -----------------------------------------------------------------
  //
  //   ~OZGuide D1 @Ozone 0x375480 — empty body (only prologue+epilogue).
  //   ~OZGuide D0 @Ozone 0x375490 — tail-jmp __ZdlPv (operator delete(void*)).
  //
  /**
   * ~OZGuide() [D1] @Ozone 0x375480 — empty body. OZGuide has no owned resources (POD fields
   * only), so the base D1 does nothing. Modeled as a plain no-op.
   *
   * @provenance Ozone @0x375480 (prologue + epilogue only)
   */
  destroy(): void {
    // no-op — matches empty asm body @0x375480
  }

  /**
   * ~OZGuide() [D0 — deleting] @Ozone 0x375490. Tail-jmp `__ZdlPv` (operator delete(void*)).
   * In C++, D0 calls D1 (a no-op here) then `operator delete(this)`. Since D1 is empty and
   * we don't own the JS heap, this maps to a plain no-op on the TS side — the caller's
   * scope will release the reference.
   *
   * @provenance Ozone @0x375490 (tail-jmp __ZdlPv stub @0x6DFC36)
   */
  destroyDeleting(): void {
    // no-op — JS is garbage-collected; the D0-deleting body's only work is
    // `operator delete(this)` @0x6DFC36 which has no analog here.
  }
}
