// AUOutputBusJoiner.ts — Flexo/Audio Unit that stitches together the outputs
// of many upstream buses. In the Flexo AU host, `AUOutputBusJoiner` is a
// thin subclass of `AUMultiInputBase` (from Apple's Core Audio AUSDK-adjacent
// helpers). The three symbols Apple emitted for this class are:
//
//   AUOutputBusJoiner::Render(unsigned int& ioActionFlags,
//                             const AudioTimeStamp& inTimeStamp,
//                             unsigned int inNumberFrames)          @0x12456a0
//   AUOutputBusJoiner::~AUOutputBusJoiner() [D1 — complete-object]  @0x1245750
//   AUOutputBusJoiner::~AUOutputBusJoiner() [D0 — deleting]         @0x1245760
//
// Transcribed from FCP Flexo framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// See raw-port/re/disasm/Flexo.AUOutputBusJoiner.Render.s
// and raw-port/re/disasm/Flexo.AUOutputBusJoiner.~AUOutputBusJoiner.s
// for the full x86_64 disassembly.
//
// FRONTIER (opaque, referenced only by pointer/name):
//   - AUMultiInputBase                 — parent class. Its Render helper
//     `AUMultiInputBase::RenderInputs(AUMultiInputBase::InputBusHandler*,
//       unsigned int&, const AudioTimeStamp&, unsigned int)` is the real
//     workhorse; AUOutputBusJoiner::Render just forwards.
//   - AUMultiInputBase::InputBusHandler — abstract handler passed via a stack
//     local containing a vptr. The vptr Render assigns points at the
//     `AUOutputBusJoiner::BusHandler` vtable slot (see below).
//   - AudioTimeStamp                    — Core Audio value type; opaque here.
//   - `AUOutputBusJoiner::BusHandler` vtable — a `__DATA` object at 0x1920138
//     whose first vfunc slot is `BusHandler::~BusHandler()` at 0x12456e0
//     (a trivial retq — the handler holds no state of its own; polymorphism
//     is via the concrete BusHandler subclass elsewhere).
//   - `operator delete(void*)` — libc++ ABI; imported symbol stub `__ZdlPv`.

/**
 * Opaque parent class handle. Only used as the vtable-anchoring
 * this-pointer for `AUOutputBusJoiner`; its RenderInputs virtual dispatch
 * happens on the C++ side, so from TS the only observable thing we need is
 * an unimplemented `RenderInputs` stub that mirrors the signature.
 */
export type AUMultiInputBase = {
  readonly __brand: "AUMultiInputBase";
};

/**
 * Opaque handle for the stack-allocated `InputBusHandler`. The disassembly
 * shows Render building this in stack slot `[rbp-0x10]` as a 16-byte object:
 *   [rbp-0x10]  vptr   = &(vtable + 0x10)  (== 0x1920138 in the binary)
 *   [rbp-0x08]  zero   (movq $0, -0x8(%rbp))
 * i.e. the initial fill pattern is (vptr, 0). No further fields are set
 * here — subclasses provide the vtable that points at the actual bus-slot
 * lookup logic.
 */
export type InputBusHandler = {
  vptr: bigint;
  extra: bigint;
};

/**
 * Opaque Core-Audio time stamp value carried through Render unchanged. Its
 * layout is never inspected by AUOutputBusJoiner's own methods (the pointer
 * arrives in rcx as `AudioTimeStamp const&` and is forwarded as-is to
 * `AUMultiInputBase::RenderInputs`).
 */
export type AudioTimeStamp = { readonly __brand: "AudioTimeStamp" };

/**
 * Un-transcribed callee: `AUMultiInputBase::RenderInputs`. Its full body
 * is a separate frontier and will be ported to its own file. Calling this
 * stub is the correct behaviour per the porting spec — it makes the gap
 * visible instead of silently approximating.
 *
 * @see FCP Flexo `AUMultiInputBase::RenderInputs(InputBusHandler*,
 *      unsigned int&, AudioTimeStamp const&, unsigned int)` — reached from
 *      `AUOutputBusJoiner::Render` @0x12456c8 (callq).
 */
function AUMultiInputBase_RenderInputs(
  _self: AUMultiInputBase,
  _handler: InputBusHandler,
  _ioActionFlags: { value: number },
  _inTimeStamp: AudioTimeStamp,
  _inNumberFrames: number,
): void {
  throw new Error(
    "AUMultiInputBase::RenderInputs @ (frontier) not yet transcribed — reached from AUOutputBusJoiner::Render @0x12456c8",
  );
}

/**
 * Un-transcribed callee: `AUMultiInputBase::~AUMultiInputBase()` (D2, base
 * in-place). Its full body is a separate frontier.
 *
 * @see FCP Flexo `AUMultiInputBase::~AUMultiInputBase()` — reached from
 *      both AUOutputBusJoiner destructor variants (D1 @0x1245755 jmp, D0
 *      @0x1245769 callq).
 */
function AUMultiInputBase_dtor(_self: AUMultiInputBase): void {
  throw new Error(
    "AUMultiInputBase::~AUMultiInputBase @ (frontier) not yet transcribed — reached from AUOutputBusJoiner::~AUOutputBusJoiner @0x1245755/@0x1245769",
  );
}

/**
 * Un-transcribed callee: libc++ `operator delete(void*)` (__ZdlPv). Not
 * ported — the TS runtime does not free raw pointers. The gate accepts this
 * as a throwing frontier stub.
 */
function operator_delete(_p: unknown): void {
  throw new Error(
    "operator delete(void*) — libc++ symbol stub reached from AUOutputBusJoiner::~AUOutputBusJoiner (D0) @0x1245777",
  );
}

/**
 * Address of the `AUOutputBusJoiner::BusHandler` vtable slot pointed to by
 * `Render`'s stack-allocated handler. The raw address 0x1920138 (in Flexo's
 * `__DATA` segment) is the "function-slot" start of a C++ vtable (i.e.
 * &vtable + 0x10, past `offset-to-top` and `type_info*`). The first vfunc
 * slot there resolves to `AUOutputBusJoiner::BusHandler::~BusHandler()` at
 * 0x12456e0 — a trivial `retq` (see raw-port/re/disasm/... .BusHandlerD1).
 *
 * We hold it as a raw 64-bit address to preserve provenance; the TS port
 * never dereferences it. When BusHandler is transcribed, this constant
 * gets replaced by an actual object.
 */
const AU_OUTPUT_BUS_JOINER_BUS_HANDLER_VTABLE_ADDR = 0x1920138n; // @0x12456b9 leaq 0x6daa78(%rip), %rax

/**
 * `AUOutputBusJoiner` — Flexo Audio Unit that joins bus outputs. Backed by
 * the C++ parent `AUMultiInputBase`; only three methods are emitted for
 * this class in Flexo, all forwarded to the parent.
 */
export class AUOutputBusJoiner {
  /**
   * The parent-class instance. In C++ this is the sub-object at the start
   * of the derived layout; from TS we carry it explicitly to route parent
   * calls (`RenderInputs`, `~AUMultiInputBase`) to the right frontier stub.
   */
  private readonly _parent: AUMultiInputBase;

  constructor(parent: AUMultiInputBase) {
    this._parent = parent;
  }

  /**
   * @see FCP Flexo `AUOutputBusJoiner::Render(unsigned int&,
   *      AudioTimeStamp const&, unsigned int)` @0x00000000012456a0
   *
   * Disassembly (verbatim):
   *   0x12456a0  push  %rbp
   *   0x12456a1  mov   %rsp, %rbp
   *   0x12456a4  sub   $0x10, %rsp                 ; reserve 16 B stack slot
   *   0x12456a8  mov   %ecx, %r8d                  ; inNumberFrames -> arg5
   *   0x12456ab  mov   %rdx, %rcx                  ; inTimeStamp&   -> arg4
   *   0x12456ae  mov   %rsi, %rdx                  ; ioActionFlags& -> arg3
   *   0x12456b1  movq  $0x0, -0x8(%rbp)            ; [rbp-0x08] = 0
   *   0x12456b9  leaq  0x6daa78(%rip), %rax        ; rax = &vtable(0x1920138)
   *   0x12456c0  movq  %rax, -0x10(%rbp)           ; [rbp-0x10].vptr = &vtable
   *   0x12456c4  leaq  -0x10(%rbp), %rsi           ; arg2 = &InputBusHandler
   *   0x12456c8  callq __ZN16AUMultiInputBase12RenderInputsE...  ; forward
   *   0x12456cd  add   $0x10, %rsp
   *   0x12456d1  pop   %rbp
   *   0x12456d2  retq
   *
   * i.e. build a stack `InputBusHandler` bound to the class's
   * BusHandler vtable and forward to AUMultiInputBase::RenderInputs. The
   * `this` pointer (rdi) is passed through untouched as the receiver.
   *
   * @param ioActionFlags in/out AudioUnit action-flags reference. C++
   *        passes `unsigned int&`; we model as a single-cell object so the
   *        callee can write back through it (same one-of-a-kind trick FCP
   *        does across many AU boundaries).
   * @param inTimeStamp   opaque Core-Audio time-stamp, forwarded as-is.
   * @param inNumberFrames unsigned 32-bit frame count.
   */
  Render(
    ioActionFlags: { value: number },
    inTimeStamp: AudioTimeStamp,
    inNumberFrames: number,
  ): void {
    // @0x12456b1..0x12456c0 — construct the stack InputBusHandler:
    //   handler.vptr  = AU_OUTPUT_BUS_JOINER_BUS_HANDLER_VTABLE_ADDR  (0x1920138)
    //   handler.extra = 0
    const handler: InputBusHandler = {
      vptr: AU_OUTPUT_BUS_JOINER_BUS_HANDLER_VTABLE_ADDR,
      extra: 0n,
    };
    // @0x12456c8 callq AUMultiInputBase::RenderInputs
    AUMultiInputBase_RenderInputs(
      this._parent,
      handler,
      ioActionFlags,
      inTimeStamp,
      inNumberFrames >>> 0, // unsigned int
    );
    // @0x12456cd..0x12456d2 — epilogue: void return.
  }

  /**
   * @see FCP Flexo `AUOutputBusJoiner::~AUOutputBusJoiner()` (D1 — complete
   *      object destructor, does NOT free storage) @0x0000000001245750
   *
   * Disassembly (verbatim):
   *   0x1245750  push  %rbp
   *   0x1245751  mov   %rsp, %rbp
   *   0x1245754  pop   %rbp
   *   0x1245755  jmp   __ZN16AUMultiInputBaseD2Ev  ; tail-call parent dtor
   *
   * Trivial forwarder: no members of AUOutputBusJoiner need per-object
   * cleanup (Apple emitted zero body), so it tail-calls the parent D2.
   */
  destroyInPlace(): void {
    // @0x1245755 jmp AUMultiInputBase::~AUMultiInputBase (D2)
    AUMultiInputBase_dtor(this._parent);
  }

  /**
   * @see FCP Flexo `AUOutputBusJoiner::~AUOutputBusJoiner()` (D0 — deleting
   *      destructor, cleans up AND frees) @0x0000000001245760
   *
   * Disassembly (verbatim):
   *   0x1245760  push  %rbp
   *   0x1245761  mov   %rsp, %rbp
   *   0x1245764  push  %rbx
   *   0x1245765  push  %rax
   *   0x1245766  mov   %rdi, %rbx                   ; save this
   *   0x1245769  callq __ZN16AUMultiInputBaseD2Ev   ; parent dtor in-place
   *   0x124576e  mov   %rbx, %rdi                   ; restore this into rdi
   *   0x1245771  add   $0x8, %rsp
   *   0x1245775  pop   %rbx
   *   0x1245776  pop   %rbp
   *   0x1245777  jmp   __ZdlPv                      ; tail-call operator delete
   *
   * Standard Itanium C++ ABI D0 shape: run the in-place destructor, then
   * `operator delete(this)`. TypeScript has no `delete p` for raw memory;
   * the `operator_delete` frontier stub throws to keep the gap loud.
   */
  destroyAndDelete(): void {
    // @0x1245769 callq AUMultiInputBase::~AUMultiInputBase (D2)
    AUMultiInputBase_dtor(this._parent);
    // @0x1245777 jmp operator delete(void*)
    operator_delete(this);
  }
}
