// FFAudioRenderHook.ts — default (base-class) implementations of a Flexo audio-graph render-hook.
// Verbatim from FCP's Flexo framework:
//   /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
//
// Four symbols observed — two "hook points" and the two Itanium-ABI destructor thunks:
//   @Flexo 0x0000000000d042e0  FFAudioRenderHook::PreRender(unsigned int, AudioTimeStamp const&,
//                                                            unsigned int, unsigned int,
//                                                            AudioBufferList const&)
//   @Flexo 0x0000000000d04400  FFAudioRenderHook::PostRender(unsigned int, AudioTimeStamp const&,
//                                                             unsigned int, unsigned int,
//                                                             AudioBufferList const&)
//   @Flexo 0x0000000000e5f640  FFAudioRenderHook::~FFAudioRenderHook()  [D1 — complete-object dtor]
//   @Flexo 0x0000000000e5f650  FFAudioRenderHook::~FFAudioRenderHook()  [D0 — deleting dtor]
//
// The class is the abstract-base for FFAudioGraph render-hook interception. It is inserted into
// the graph by FFAudioGraph::AddRenderHook(FFAudioRenderHook*, FFAudioNode*) and removed by
// FFAudioGraph::RemoveRenderHook (both @Flexo, see symmap). While engaged, the audio graph
// calls PreRender BEFORE each node's render pass and PostRender AFTER — a subclass overrides
// one or both to observe/modify the render (e.g. metering, effect chains, side-chain routing).
// The default (base) implementations transcribed here are the "no-op observer" pass-through.
//
// PRE/POSTRENDER ARGUMENT SIGNATURE (Itanium mangling `EjRK14AudioTimeStampjjRK15AudioBufferList`,
// System V AMD64 ABI):
//     arg[0]  %rdi   this                (FFAudioRenderHook*)
//     arg[1]  %esi   inNumberBuffers     (unsigned int)                 — j
//     arg[2]  %rdx   inTimestamp         (AudioTimeStamp const&)        — RK14AudioTimeStamp
//     arg[3]  %ecx   inBusNumber         (unsigned int)                 — j
//     arg[4]  %r8d   inNumberFrames      (unsigned int)                 — j
//     arg[5]  %r9    ioData              (AudioBufferList const&)       — RK15AudioBufferList
//   These parameter NAMES are the standard Core Audio AURenderCallbackStruct field names — that
//   is what FFAudioGraph is wrapping. NOTE: neither hook reads any of these arguments (see
//   disasm below — the entire body is prologue+epilogue). We surface the full parameter list
//   in the ported signatures anyway so the interface a subclass overrides is complete.
//
// VTABLE SHAPE:
//   Not walked here (vtable.py timed out on Flexo's size). The four D-methods observed above
//   are the only FFAudioRenderHook-owned entries in the symbol table; a subclass's vtable
//   installs its own overrides at the same slot offsets. From the disasm patterns we can
//   deduce the class contributes at least PreRender and PostRender as virtual slots plus the
//   D0/D1 dtor pair — no other class-owned symbols exist. Whether the class inherits from a
//   deeper base is unobservable from these four methods; assume `class FFAudioRenderHook`
//   directly.
//
// STRUCT LAYOUT:
//   NONE observable. All four methods have `pushq %rbp; movq %rsp, %rbp; popq %rbp; ...` as
//   their entire body — none read `this`, none touch memory. D0's tail-call `jmp __ZdlPv`
//   destroys via `::operator delete(this)`, implying sizeof is *the same as* what the
//   deleting-dtor path was told to free — but that number never appears in these thunks
//   (operator delete gets its size from libcxxabi's __cxa_vec_delete-style callers or the
//   subclass's own layout). This file therefore claims NO struct fields on FFAudioRenderHook
//   itself; subclasses supply their own state.
//
// FRONTIER (undecoded — throwing stubs / opaque types):
//   - AudioTimeStamp        — CoreAudio POD (32 bytes). Passed by const& so signature only.
//   - AudioBufferList       — CoreAudio POD (variable size). Passed by const&.
//   - operator delete       — libc++ __ZdlPv (@Flexo __stubs 0x1497404). Called only from D0
//                             tail-call — we surface it as a raising stub because there is no
//                             portable allocator to bind against.

/**
 * CoreAudio AudioTimeStamp — POD. Structural placeholder mirroring the frontier convention
 * used elsewhere in raw-port for CoreAudio types. Signature-only; not decoded here.
 */
export interface AudioTimeStamp {
  readonly __audioTimeStamp: unique symbol;
}

/**
 * CoreAudio AudioBufferList — POD. Structural placeholder. Signature-only; not decoded here.
 */
export interface AudioBufferList {
  readonly __audioBufferList: unique symbol;
}

/**
 * ::operator delete(void*) — libc++ __ZdlPv @Flexo __stubs 0x1497404.
 * Called (tail) from FFAudioRenderHook D0 @0xe5f655. Raising stub — no portable binding.
 */
function operatorDelete(_p: unknown): never {
  throw new Error(
    "::operator delete (__stub __ZdlPv @Flexo 0x1497404) not yet ported — tail-called from FFAudioRenderHook::~FFAudioRenderHook D0 @0xe5f655",
  );
}

/**
 * FFAudioRenderHook — abstract-base render hook installed into an FFAudioGraph.
 *
 * The base implementations of PreRender and PostRender are no-ops; a concrete subclass
 * overrides at least one to observe/modify the audio stream around each node render pass.
 *
 * Not marked `abstract` in TS because the C++ base itself IS instantiable in principle (D0/D1
 * are real thunks that delete via `operator delete`, not `ud2`) — clang emitted them because
 * something in Flexo takes a non-abstract handle to a raw FFAudioRenderHook (perhaps a
 * "dummy" pass-through hook, or a shared-ptr control block). We mirror that: an instance of
 * the base class is legal, doing nothing on both hook points.
 */
export class FFAudioRenderHook {
  /**
   * FFAudioRenderHook::PreRender(unsigned int, AudioTimeStamp const&, unsigned int,
   *                               unsigned int, AudioBufferList const&)
   * — @Flexo 0xD042E0.
   *
   * Full disassembly (5 instructions):
   *   d042e0  pushq   %rbp
   *   d042e1  movq    %rsp, %rbp
   *   d042e4  popq    %rbp
   *   d042e5  retq
   *   d042e6  nopw    %cs:(%rax,%rax)
   *
   * Body: entirely prologue+epilogue. No argument is read, no memory is touched, no return
   * value written. The base-class hook is a no-op that lets FFAudioGraph call the slot
   * unconditionally without a null-check — subclasses override to do work.
   */
  PreRender(
    _inNumberBuffers: number,
    _inTimestamp: AudioTimeStamp,
    _inBusNumber: number,
    _inNumberFrames: number,
    _ioData: AudioBufferList,
  ): void {
    // No-op — see method header. All six arguments intentionally unused in the base impl.
  }

  /**
   * FFAudioRenderHook::PostRender(unsigned int, AudioTimeStamp const&, unsigned int,
   *                                unsigned int, AudioBufferList const&)
   * — @Flexo 0xD04400.
   *
   * Full disassembly (5 instructions):
   *   d04400  pushq   %rbp
   *   d04401  movq    %rsp, %rbp
   *   d04404  popq    %rbp
   *   d04405  retq
   *   d04406  nopw    %cs:(%rax,%rax)
   *
   * Body: byte-identical shape to PreRender — pure no-op base implementation. Overrides
   * observed elsewhere in the Flexo binary (in subclasses that mangle as
   * `__ZN<sub>10PostRenderEjRK14AudioTimeStampjjRK15AudioBufferList`).
   */
  PostRender(
    _inNumberBuffers: number,
    _inTimestamp: AudioTimeStamp,
    _inBusNumber: number,
    _inNumberFrames: number,
    _ioData: AudioBufferList,
  ): void {
    // No-op — see method header.
  }

  /**
   * FFAudioRenderHook::~FFAudioRenderHook() — D1 (complete-object dtor) @Flexo 0xE5F640.
   *
   * Full disassembly (5 instructions):
   *   e5f640  pushq   %rbp
   *   e5f641  movq    %rsp, %rbp
   *   e5f644  popq    %rbp
   *   e5f645  retq
   *   e5f646  nopw    %cs:(%rax,%rax)
   *
   * Body: trivial destructor — no members to destroy on the base class (see STRUCT LAYOUT
   * in file header). Compiler emitted the thunk unchanged (no super-class dtor tail-call
   * present, so if FFAudioRenderHook does inherit from something, that base must also have
   * a trivial dtor).
   *
   * Modeled as a protected no-op method so it (a) documents the vtable slot mapped to this
   * address and (b) does not violate the "one class per file" rule (unlike ud2 stubs, this
   * really IS reachable and callable at runtime).
   */
  protected _dtorD1(): void {
    // No-op — see method header. Corresponds to the trivial destructor thunk @0xe5f640.
  }

  /**
   * FFAudioRenderHook::~FFAudioRenderHook() — D0 (deleting dtor) @Flexo 0xE5F650.
   *
   * Full disassembly (5 instructions):
   *   e5f650  pushq   %rbp
   *   e5f651  movq    %rsp, %rbp
   *   e5f654  popq    %rbp
   *   e5f655  jmp     0x1497404             ## symbol stub for: __ZdlPv  (operator delete)
   *   e5f65a  nopw    (%rax,%rax)
   *
   * Body: identical to D1 for the destruction phase (no fields, no super-dtor chain), then
   * tail-calls `::operator delete(this)`. This is the standard Itanium D0 shape for a
   * trivial-body deleting destructor.
   *
   * Modeled as a raising stub because there is no portable allocator to bind `operator
   * delete` against in a TS environment — invoking D0 in the ported code would leak the
   * demand signal for a real deleter, per anti-shortcut Rule 3. Called only via vtable slot
   * dispatch (the runtime never reaches D0 through a source-visible `delete` in ported code).
   */
  protected _dtorD0(_this: FFAudioRenderHook): never {
    // Mirror the runtime shape: trivial (no-op) body, then tail-call `::operator delete(this)`.
    operatorDelete(_this);
  }
}
