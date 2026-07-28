// FFAudioInputCallbackAdapter — Flexo adapter that forwards a CoreAudio
// AURenderCallback-shaped `Render(...)` call to a stored function pointer +
// stored context pointer. The whole class is a trivial "closure holder":
//
//   struct FFAudioInputCallbackAdapter : FFAudioInputAdapter {
//     // ... FFAudioInputAdapter subobject at +0x00 (contains vtable ptr) ...
//     +0x10  RenderProc  render_fp;   // function pointer to the actual worker
//     +0x18  void*       context;     // opaque this-pointer passed to render_fp
//   };
//
// Only three exported symbols exist on this class:
//   - __ZN27FFAudioInputCallbackAdapterD1Ev  @0xd3d530  (base dtor  — empty)
//   - __ZN27FFAudioInputCallbackAdapterD0Ev  @0xd3d540  (deleting dtor — just
//                                                        tail-jumps operator delete)
//   - __ZN27FFAudioInputCallbackAdapter6RenderERjRK14AudioTimeStampjjR15AudioBufferList
//                                            @0xd3d5a0  (Render — thunk)
// (Plus siblings __ZN19FFAudioInputAdapter19UpdateMaxPullFramesEj @0xd3d550 and
//  __ZN19FFAudioInputAdapter12ChangeFormatEdj @0xd3d560 that live on the parent
//  class and return 0 by default — not part of THIS class.)
//
// Source disassembly:
//   raw-port/re/disasm/Flexo.FFAudioInputCallbackAdapter.~FFAudioInputCallbackAdapter.s
//     (holds D0Ev @0xd3d540)
//   raw-port/re/disasm/Flexo.FFAudioInputCallbackAdapter.Render.s
//     (holds Render @0xd3d5a0)
//   D1Ev @0xd3d530 was read directly from otool -tV of Flexo:
//     pushq %rbp ; movq %rsp,%rbp ; popq %rbp ; retq
//     — literally an empty function (nothing owned by the sub-object requires
//     destruction; the parent FFAudioInputAdapter carries the vtable and any
//     lifecycle state).
//
// Framework: Final Cut Pro / Flexo.framework (arch x86_64).
//
// -----------------------------------------------------------------------------
// The Render(...) thunk (@0xd3d5a0)
//
//   0xd3d5a0  pushq %rbp / movq %rsp,%rbp
//   0xd3d5a4  movq  0x10(%rdi), %rax        ; rax = self->render_fp
//   0xd3d5a8  movq  0x18(%rdi), %rdi        ; rdi = self->context     (== 1st arg)
//   0xd3d5ac  popq  %rbp
//   0xd3d5ad  jmpq  *%rax                    ; tail-jmp to render_fp(context, ...)
//
// NOTE (calling-convention citation):
//   Render's C++ signature is:
//     void FFAudioInputCallbackAdapter::Render(
//         unsigned int& ioActionFlags,
//         const AudioTimeStamp& inTimeStamp,
//         unsigned int inBusNumber,
//         unsigned int inNumberFrames,
//         AudioBufferList& ioData);
//   In System V x86_64 that lays out as:
//     rdi = this
//     rsi = &ioActionFlags       — passed straight through as arg1 to render_fp
//     rdx = &inTimeStamp         — arg2
//     ecx = inBusNumber          — arg3
//     r8d = inNumberFrames       — arg4
//     r9  = &ioData              — arg5
//   The thunk rewrites ONLY rdi (this -> context) and leaves rsi/rdx/ecx/r8d/r9
//   untouched, so the callee receives:
//     render_fp(context, &ioActionFlags, &inTimeStamp, inBusNumber, inNumberFrames, &ioData)
//   That is the standard CoreAudio AURenderCallback signature:
//     OSStatus (*)(void*, AudioUnitRenderActionFlags*, const AudioTimeStamp*,
//                  UInt32, UInt32, AudioBufferList*);
//   The `unsigned int&` in the C++ signature is the same 4-byte
//   AudioUnitRenderActionFlags cell passed by reference — bit-for-bit
//   compatible.
//
//   The thunk DISCARDS the return value's meaning at the C++ level (Render
//   is declared `void`) but the tail-jmp preserves whatever `render_fp`
//   returned in `eax`/`rax`. From a strict transcription standpoint that
//   return-value flow is documented but not exposed here.
// -----------------------------------------------------------------------------

/**
 * CoreAudio-style render callback signature that FFAudioInputCallbackAdapter
 * dispatches to. The exact typedef is dictated by the tail-jmp calling
 * convention documented above.
 *
 *   OSStatus render_fp(
 *     void*                          context,          // was self.context
 *     UInt32*                        ioActionFlags,    // AudioUnitRenderActionFlags*
 *     const AudioTimeStamp*          inTimeStamp,
 *     UInt32                         inBusNumber,
 *     UInt32                         inNumberFrames,
 *     AudioBufferList*               ioData
 *   );
 */
export type FFAudioInputRenderProc = (
  context: unknown,
  ioActionFlagsRef: { value: number },
  inTimeStamp: unknown,
  inBusNumber: number,
  inNumberFrames: number,
  ioData: unknown,
) => number;

/**
 * Instance layout as read by the three ported methods. Anything at offsets
 * below 0x10 is inherited from FFAudioInputAdapter and is NOT touched by any
 * of this class's own methods — leaving those slots opaque here is the
 * faithful mirror of what the disassembly demands.
 */
export interface FFAudioInputCallbackAdapter_Object {
  /** +0x10 — the render function pointer, dereferenced by Render @0xd3d5a4. */
  render_fp: FFAudioInputRenderProc;
  /** +0x18 — opaque context passed as the render_fp's first argument (@0xd3d5a8). */
  context: unknown;
}

/**
 * `FFAudioInputCallbackAdapter::~FFAudioInputCallbackAdapter()`  — base dtor.
 * Symbol: __ZN27FFAudioInputCallbackAdapterD1Ev  @0xd3d530
 *
 * ```
 *   0xd3d530  pushq %rbp
 *   0xd3d531  movq  %rsp, %rbp
 *   0xd3d534  popq  %rbp
 *   0xd3d535  retq
 * ```
 *
 * Empty function. Nothing at +0x10/+0x18 requires destruction (a raw C
 * function-pointer and an unowned void* — both trivial). The parent
 * FFAudioInputAdapter subobject is destroyed by the compiler-emitted
 * base-class destructor call that surrounds the derived-class dtor in
 * the Itanium ABI — that call is elided here because the whole function
 * body is empty; the ABI still runs it as part of the deleting-dtor
 * calling sequence (D0 below).
 */
export function FFAudioInputCallbackAdapter_D1(
  _self: FFAudioInputCallbackAdapter_Object,
): void {
  // intentionally empty — matches the four-instruction empty body @0xd3d530.
}

/**
 * `FFAudioInputCallbackAdapter::~FFAudioInputCallbackAdapter()`  — deleting dtor.
 * Symbol: __ZN27FFAudioInputCallbackAdapterD0Ev  @0xd3d540
 *
 * ```
 *   0xd3d540  pushq %rbp
 *   0xd3d541  movq  %rsp, %rbp
 *   0xd3d544  popq  %rbp
 *   0xd3d545  jmp   __ZdlPv (stub @0x1497404)   ; operator delete(this)
 * ```
 *
 * The Itanium D0 tail-jumps into `operator delete(void*)` after the compiler
 * has already threaded the parent base-class destructor call inline; because
 * D1 above is empty the body reduces to `delete this` and nothing else. The
 * raw-port has no native heap, so `operator_delete` is modelled as a THROWing
 * stub per PORTING_SPEC rule 3.
 */
export function FFAudioInputCallbackAdapter_D0(
  self: FFAudioInputCallbackAdapter_Object,
): void {
  // @0xd3d545 — tail jmp to operator delete(void* this).
  operator_delete(self);
}

/**
 * `FFAudioInputCallbackAdapter::Render(...)` — dispatch to stored fn ptr.
 * Symbol: __ZN27FFAudioInputCallbackAdapter6RenderERjRK14AudioTimeStampjjR15AudioBufferList
 *         @0xd3d5a0
 *
 * ```
 *   0xd3d5a0  pushq %rbp / movq %rsp,%rbp
 *   0xd3d5a4  movq  0x10(%rdi), %rax   ; rax = self.render_fp
 *   0xd3d5a8  movq  0x18(%rdi), %rdi   ; rdi = self.context (overwrite arg0)
 *   0xd3d5ac  popq  %rbp
 *   0xd3d5ad  jmpq  *%rax               ; tail-call (context, rsi, rdx, ecx, r8d, r9)
 * ```
 *
 * All other argument registers (rsi/rdx/ecx/r8d/r9) are untouched, so the
 * five original arguments are passed straight through with `this` replaced
 * by `self.context`. This is the classic "closure trampoline" pattern.
 */
export function FFAudioInputCallbackAdapter_Render(
  self: FFAudioInputCallbackAdapter_Object,
  ioActionFlagsRef: { value: number },
  inTimeStamp: unknown,
  inBusNumber: number,
  inNumberFrames: number,
  ioData: unknown,
): number {
  // @0xd3d5a4 — load rax = self.render_fp
  const fp = self.render_fp;
  // @0xd3d5a8 — load rdi = self.context (replaces the `this` argument)
  const ctx = self.context;
  // @0xd3d5ad — tail jmp. Arguments after the first come through unchanged.
  return fp(
    ctx,
    ioActionFlagsRef,
    inTimeStamp,
    inBusNumber,
    inNumberFrames,
    ioData,
  );
}

// -----------------------------------------------------------------------------
// Undecoded runtime helpers referenced by this class (per rule 3).

/** __ZdlPv @0x1497404 — `operator delete(void*)` (Flexo __TEXT.__stubs). */
function operator_delete(_p: unknown): void {
  throw new Error(
    "operator delete(void*) (__ZdlPv) @0x1497404 not yet transcribed — " +
      "raw heap free has no direct TS equivalent",
  );
}
