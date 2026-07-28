// AUMultiplyMixer.ts — FCP Flexo AUMultiplyMixer: an AudioUnit mixer that multiplies
// its input buses together (as opposed to summing them).
//
// FRAMEWORK: Flexo.framework (Final Cut Pro).
// DECODE: raw-port/re/disasm/Flexo.AUMultiplyMixer.*.s (captured via disasm.sh).
//
// SYMBOLS (from /tmp/Flexo_symmap.tsv):
//   __ZN15AUMultiplyMixerD1Ev  @0x012453d0  ; base dtor (non-deleting)
//   __ZN15AUMultiplyMixerD0Ev  @0x012453e0  ; deleting dtor (calls base, then operator delete)
//   __ZN15AUMultiplyMixer6RenderERjRK14AudioTimeStampj  @0x01245230
//     ; Render(unsigned int& ioActionFlags, AudioTimeStamp const& inTimeStamp, unsigned int inNumberFrames)
//   __ZN15AUMultiplyMixer10BusHandler15HandleActiveBusEjPN5ausdk14AUInputElementEjbb
//     ; BusHandler::HandleActiveBus(...) — NOT in this file's task list, so we forward-declare only.
//   __ZN5ausdk9APFactoryINS_12AUBaseLookupE15AUMultiplyMixerE7FactoryEPK25AudioComponentDescription
//   __ZN5ausdk9APFactoryINS_12AUBaseLookupE15AUMultiplyMixerE8DestructEPv
//   __ZN5ausdk9APFactoryINS_12AUBaseLookupE15AUMultiplyMixerE9ConstructEPvP23ComponentInstanceRecord
//     ; template APFactory<AUBaseLookup, AUMultiplyMixer> — SDK glue, not our port.
//
// CLASS TOPOLOGY (recovered from disasm + symbol table):
//   AUMultiplyMixer  :  AUMultiInputBase   (single-inheritance, base dtor D2 is called
//                       from both D0 and D1 with the same `this`, confirming
//                       AUMultiInputBase is at offset 0)
//   AUMultiplyMixer::BusHandler  :  AUMultiInputBase::InputBusHandler
//     - Its vtable is materialized on the stack in Render() at @0x1245249 (leaq const;
//       stored at -0x18(%rbp)) with two zero-init trailing slots, mirroring a
//       size-24 InputBusHandler POD:
//         +0x00  vtable ptr (leaq target = @0x191FE68 = &vtable-for-AUMultiplyMixer::BusHandler)
//         +0x08  0          (zero-initialized at @0x1245241)
//         +0x10  byte 0     (zero-initialized at @0x1245254)
//     - The disasm passes &that stack object to
//       AUMultiInputBase::RenderInputs(InputBusHandler*, uint&, AudioTimeStamp const&, uint).

// --- Un-ported base class ------------------------------------------------
// AUMultiInputBase is the DirectAudio SDK-style abstract base.  Its methods
// referenced from THIS file (all not yet transcribed):
//   __ZN16AUMultiInputBaseD2Ev                                                    (base dtor)
//   __ZN16AUMultiInputBase12RenderInputsEPNS_15InputBusHandlerERjRK14AudioTimeStampj
//     (RenderInputs(InputBusHandler*, unsigned int& ioActionFlags,
//                   AudioTimeStamp const& ts, unsigned int nFrames))
// Field layout of AUMultiInputBase and AUMultiInputBase::InputBusHandler are
// not yet decoded; we model them opaquely.

export interface AudioTimeStamp {
  /** Opaque — the raw AudioTimeStamp struct from CoreAudio. */
  readonly _opaque: never;
}

export interface AUMultiInputBase_InputBusHandler {
  /** Opaque handle onto the derived-class stack object.  For AUMultiplyMixer,
   *  layout is:
   *    +0x00 vtable ptr = &vtable-for-AUMultiplyMixer::BusHandler @0x191FE68
   *    +0x08 uint64 0  (zero-initialized)
   *    +0x10 uint8  0  (zero-initialized)
   */
  readonly _opaque: never;
}

export interface AUMultiInputBase {
  /** Un-ported: __ZN16AUMultiInputBase12RenderInputsEPNS_15InputBusHandlerERjRK14AudioTimeStampj */
  RenderInputs(
    handler: AUMultiInputBase_InputBusHandler,
    ioActionFlags: { value: number },
    ts: AudioTimeStamp,
    nFrames: number,
  ): number;
  /** Un-ported: __ZN16AUMultiInputBaseD2Ev — non-virtual base dtor. */
  destroyBase(): void;
}

function AUMultiInputBase_RenderInputs(
  _this: AUMultiInputBase,
  _handler: AUMultiInputBase_InputBusHandler,
  _ioActionFlags: { value: number },
  _ts: AudioTimeStamp,
  _nFrames: number,
): number {
  throw new Error(
    "AUMultiInputBase::RenderInputs(InputBusHandler*, unsigned int&, AudioTimeStamp const&, unsigned int) @not-yet-transcribed — required by AUMultiplyMixer::Render @0x0124525c",
  );
}
function AUMultiInputBase_D2(_this: AUMultiInputBase): void {
  throw new Error(
    "AUMultiInputBase::~AUMultiInputBase() @not-yet-transcribed — required by AUMultiplyMixer::~AUMultiplyMixer @0x012453d5 / @0x012453e9",
  );
}
function operator_delete(_ptr: unknown): void {
  // __ZdlPv (@0x1497404 __stubs entry).  Not applicable in TS/GC — no-op.
  // The base dtor path from D0 tail-calls this, but in TS we let GC handle release.
}

/**
 * Vtable pointer that Render() stack-constructs for its BusHandler.
 *
 * ASM: `leaq 0x6dac18(%rip), %rax`  @0x01245249
 *   RIP-after-leaq = 0x01245250
 *   target         = 0x01245250 + 0x6dac18 = 0x0191FE68
 *
 * That address is the vtable for AUMultiplyMixer::BusHandler (recovered by symbol-
 * table proximity: AUMultiplyMixer::BusHandler::HandleActiveBus and BusHandler
 * D0/D1 exist as symbols in Flexo, and BusHandler subclasses
 * AUMultiInputBase::InputBusHandler which is exactly the parameter type of
 * AUMultiInputBase::RenderInputs).  We keep it as an opaque tag — the vtable
 * DISPATCH happens inside RenderInputs (un-ported), not here.
 */
const AUMULTIPLYMIXER_BUSHANDLER_VTABLE_AT_0x0191FE68 = Symbol(
  "AUMultiplyMixer::BusHandler::vtable @0x0191FE68",
);

// AUMultiplyMixer instance shape — opaque save for the AUMultiInputBase super
// that lives at offset 0 (confirmed by dtor: D2 is called with the same `this`).
export class AUMultiplyMixer {
  // We do NOT invent fields — AUMultiplyMixer's own instance layout is not
  // decoded here (the ctor lives elsewhere).  Consumers hold this opaquely.
  readonly _asAUMultiInputBase: AUMultiInputBase;

  constructor(base: AUMultiInputBase) {
    this._asAUMultiInputBase = base;
  }

  /**
   * AUMultiplyMixer::Render(unsigned int&, AudioTimeStamp const&, unsigned int)
   *   @0x01245230
   *
   * ASM (@0x01245230..@0x01245266):
   *   pushq %rbp
   *   movq  %rsp,%rbp
   *   subq  $0x20,%rsp                              @0x1245234
   *   movl  %ecx,%r8d                               @0x1245238  ; arg4  = inNumberFrames (uint)
   *   movq  %rdx,%rcx                               @0x124523b  ; arg3  = &AudioTimeStamp
   *   movq  %rsi,%rdx                               @0x124523e  ; arg2  = &ioActionFlags
   *   movq  $0x0,-0x10(%rbp)                        @0x1245241  ; stack[+0x08] = 0
   *   leaq  0x6dac18(%rip),%rax                     @0x1245249  ; rax = &vtable @0x0191FE68
   *   movq  %rax,-0x18(%rbp)                        @0x1245250  ; stack[+0x00] = vtable
   *   movb  $0x0,-0x8(%rbp)                         @0x1245254  ; stack[+0x10] = 0 (byte)
   *   leaq  -0x18(%rbp),%rsi                        @0x1245258  ; rsi = &stack InputBusHandler
   *   callq AUMultiInputBase::RenderInputs(...)     @0x124525c
   *   addq  $0x20,%rsp / popq %rbp / retq
   *
   * REGISTER ORDER at the call site (System V):
   *   rdi = this (from Render's rdi, unchanged — AUMultiplyMixer* which up-casts
   *               to AUMultiInputBase* at offset 0)
   *   rsi = &busHandler stack object
   *   rdx = &ioActionFlags   (renamed from Render's rsi)
   *   rcx = &AudioTimeStamp  (renamed from Render's rdx)
   *   r8d = inNumberFrames   (renamed from Render's ecx)
   *
   * The RETURN VALUE (%eax) from Render is whatever RenderInputs returned —
   * Render is a plain thunk that installs a stack BusHandler around the base call.
   */
  Render(
    ioActionFlags: { value: number },
    ts: AudioTimeStamp,
    inNumberFrames: number,
  ): number {
    // @0x1245241..@0x1245254: stack-construct a BusHandler POD.
    // { vtable @0x0191FE68, uint64 0, byte 0 }.
    const busHandler = {
      _vtable: AUMULTIPLYMIXER_BUSHANDLER_VTABLE_AT_0x0191FE68,
      _slot8: 0,           // -0x10(%rbp) = 0     @0x1245241
      _slot16Byte: 0,      // -0x08(%rbp) = 0     @0x1245254
      _opaque: undefined as unknown as never,
    } as unknown as AUMultiInputBase_InputBusHandler;

    // @0x124525c: tail-ish call into base RenderInputs.
    // NOTE: unsigned-int arg widths are 32-bit in the ABI; we do not clamp because
    // the base fn is un-ported (throws) — the value is passed straight through.
    return AUMultiInputBase_RenderInputs(
      this._asAUMultiInputBase,
      busHandler,
      ioActionFlags,
      ts,
      inNumberFrames >>> 0,
    );
  }

  /**
   * AUMultiplyMixer::~AUMultiplyMixer()  (base / non-deleting dtor D1)  @0x012453d0
   *
   * ASM (@0x012453d0..@0x012453d5):
   *   pushq %rbp
   *   movq  %rsp,%rbp
   *   popq  %rbp
   *   jmp   __ZN16AUMultiInputBaseD2Ev
   *
   * A pure tail-jump to the base-class dtor.  No own fields to release.
   * The empty frame (pushq/popq %rbp with no body) is a compiler placeholder
   * for a debug/entry landing — behaviorally a no-op.
   */
  destroyBase(): void {
    // @0x012453d5: tail-jmp AUMultiInputBase::~AUMultiInputBase()
    AUMultiInputBase_D2(this._asAUMultiInputBase);
  }

  /**
   * AUMultiplyMixer::~AUMultiplyMixer()  (deleting dtor D0)  @0x012453e0
   *
   * ASM (@0x012453e0..@0x012453f7):
   *   pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax   ; prologue
   *   movq  %rdi,%rbx                                          @0x12453e6  ; rbx = this
   *   callq __ZN16AUMultiInputBaseD2Ev                         @0x12453e9  ; base dtor
   *   movq  %rbx,%rdi                                          @0x12453ee  ; arg to delete
   *   addq  $0x8,%rsp / popq %rbx / popq %rbp                  ; epilogue
   *   jmp   __ZdlPv                                            @0x12453f7  ; operator delete(this)
   *
   * Standard Itanium ABI deleting-dtor: base dtor, then `operator delete(this)`.
   */
  destroyAndDelete(): void {
    // @0x12453e9: base dtor.
    AUMultiInputBase_D2(this._asAUMultiInputBase);
    // @0x12453f7: operator delete — no-op in GC'd TS.
    operator_delete(this);
  }
}
