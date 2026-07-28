// AUPassThrough.ts — Flexo/Audio Unit that acts as a bit-exact identity
// pass-through: it pulls its input bus into its output bus's AudioBufferList
// with no processing. This is the simplest concrete AudioUnit in the AUSDK
// idiom, useful as a wire between two AU scopes.
//
// FRAMEWORK: Flexo.framework (Final Cut Pro).
// BINARY:    /Applications/Final Cut Pro.app/Contents/Frameworks/Flexo.framework/Versions/A/Flexo
// DECODE:    raw-port/re/disasm/Flexo.AUPassThrough.*.s (captured via disasm.sh)
//
// SYMBOLS (from /tmp/Flexo_symmap.tsv):
//   __ZN13AUPassThrough9RenderBusERjRK14AudioTimeStampjj      @0x012457f0
//     ; RenderBus(unsigned int& ioActionFlags,
//     ;           AudioTimeStamp const& inTimeStamp,
//     ;           unsigned int inOutputBusNumber,
//     ;           unsigned int inNumberFrames)
//   __ZN13AUPassThroughD1Ev                                    @0x01245940
//     ; ~AUPassThrough() [D1, complete-object; tail-call to AUBase::~AUBase]
//   __ZN13AUPassThroughD0Ev                                    @0x01245950
//     ; ~AUPassThrough() [D0, deleting; calls AUBase::~AUBase then operator delete]
//   __ZNK13AUPassThrough21CanScheduleParametersEv              @0x01245970
//     ; CanScheduleParameters() const  -> return false
//   __ZN13AUPassThrough20StreamFormatWritableEjj               @0x01245980
//     ; StreamFormatWritable(uint scope, uint element) -> return true
//   __ZN5ausdk9APFactoryINS_12AUBaseLookupE13AUPassThroughE7FactoryEPK25AudioComponentDescription
//   __ZN5ausdk9APFactoryINS_12AUBaseLookupE13AUPassThroughE8DestructEPv
//   __ZN5ausdk9APFactoryINS_12AUBaseLookupE13AUPassThroughE9ConstructEPvP23ComponentInstanceRecord
//     ; template APFactory<AUBaseLookup, AUPassThrough> — SDK glue, not our port.
//
// CLASS TOPOLOGY (recovered from disasm + symbol table):
//   AUPassThrough  :  ausdk::AUBase   (single-inheritance at offset 0 —
//                     confirmed by D1/D0 tail-calling `ausdk::AUBase::~AUBase()`
//                     with the same `this`).
//
// INSTANCE-LAYOUT FIELDS OBSERVED IN RenderBus (@0x012457f0):
//   [+0x50]  ausdk::AUScope  input-scope   (SafeGetElement lives here)
//   [+0x60]  ptr             (start of some pointer range checked against +0x68)
//   [+0x68]  ptr             (end of that pointer range)
//   [+0x78]  ptr             connection object (with a vtable — slot 0x20 is
//                             called with `(this, 0)`; when it returns nonzero
//                             the connection is "hot")
//   [+0x80]  ausdk::AUScope  output-scope  (SafeGetElement lives here)
//   [+0xac]  uint32          on the pointer returned by (*+0x60): "should-render"
//                             flag — RenderBus returns error unless it is nonzero.
//   All offsets are read/written NOWHERE ELSE in this file; the fields belong
//   to AUBase or its scopes. We do NOT invent a full AUBase field layout.
//
// FRONTIER CALLEES (each stubbed below with its @0xADDR call site):
//   ausdk::AUScope::SafeGetElement(unsigned int) const
//     (direct callq @0x01245875, @0x0124589e, @0x012458ab)
//   ausdk::AUInputElement::PullInput(unsigned int&, AudioTimeStamp const&,
//                                    unsigned int, unsigned int)
//     (symbol-stub callq @0x01245888 -> stub @0x01496b40)
//   ausdk::AUBufferList::GetBufferList() const
//     (direct callq @0x012458b7)
//   ausdk::AUBufferList::SetBufferList(AudioBufferList const&)
//     (direct callq @0x012458c9)
//   ausdk::AUBase::~AUBase()
//     (symbol-stub callq @0x01245959 -> stub @0x01496bc4;
//      symbol-stub jmp   @0x01245945 -> same stub, tail-called from D1)
//   operator delete(void*)
//     (symbol-stub jmp   @0x01245967 -> stub @0x01497404)
//   Virtual dispatch off (*this+0x78)'s vtable slot 0x20
//     (indirect callq @0x01245833 — `callq *0x20(%rax)` where %rax = *(*+0x78))

// ---- Opaque frontier types ------------------------------------------------

/** Opaque Core Audio time stamp — never introspected here. */
export interface AudioTimeStamp {
  readonly _opaque: never;
}

/** Opaque Core Audio buffer list — passed as an in/out reference to AUBufferList. */
export interface AudioBufferList {
  readonly _opaque: never;
}

/**
 * Opaque ausdk::AUScope. Its `SafeGetElement(uint)` returns an AUElement*
 * (concrete subtype depends on which scope; input scopes return
 * `ausdk::AUInputElement*`, output scopes return an AUOutputElement-family
 * pointer whose AUBufferList sub-object lives at +0x90).
 */
export interface AUScope {
  readonly _opaque: never;
}

/** Opaque ausdk::AUInputElement — subclass of AUElement in the AUSDK. */
export interface AUInputElement {
  readonly _opaque: never;
}

/**
 * Opaque output-side AUElement. RenderBus accesses `&elem+0x90` and treats
 * that as `ausdk::AUBufferList`; we surface that offset as a getter.
 */
export interface AUOutputElement {
  readonly _opaque: never;
  /** Sub-object at +0x90 — an `ausdk::AUBufferList`. */
  bufferListSubObjectAtPlus0x90(): AUBufferList;
}

/** Opaque ausdk::AUBufferList. */
export interface AUBufferList {
  readonly _opaque: never;
}

/**
 * Opaque connection-like object bound at (*this+0x78). Its vtable slot 0x20
 * is invoked with `(this, 0)` and returns a pointer that RenderBus treats as
 * "if non-null AND *(that+0xac) != 0, we have a live upstream to pull from".
 * We keep it as an interface with the exact vslot as a method.
 */
export interface AUPassThrough_Connection {
  /**
   * Virtual dispatch: vtable[0x20/8] = slot 4 on a size-8-slot vtable.
   * Called by RenderBus @0x01245833 as `callq *0x20(%rax)` with rdi=this,
   * esi=0. Returns a pointer (or nullptr).
   *
   * We do not know the exact signature beyond this; the caller only inspects
   * the returned pointer's `+0xac` uint32 field.
   */
  vslot_0x20_call(arg0_zero: number): AUPassThrough_ConnectionPeer | null;
}

/**
 * The pointer returned by `AUPassThrough_Connection.vslot_0x20_call(0)`.
 * Only field observed is a `uint32` at +0xac.
 */
export interface AUPassThrough_ConnectionPeer {
  /** RenderBus loads `cmpl $0x0, 0xac(%rcx)` @0x01245863. */
  readonly u32AtPlus0xac: number;
}

// ---- Frontier throwing stubs ---------------------------------------------

/**
 * ausdk::AUScope::SafeGetElement(unsigned int) const
 * required-by AUPassThrough::RenderBus @0x01245875, @0x0124589e, @0x012458ab
 */
function AUScope_SafeGetElement(_scope: AUScope, _element: number): unknown {
  throw new Error(
    "ausdk::AUScope::SafeGetElement(unsigned int) const @not-yet-transcribed " +
      "— required by AUPassThrough::RenderBus @0x01245875 / @0x0124589e / @0x012458ab",
  );
}

/**
 * ausdk::AUInputElement::PullInput(unsigned int&, AudioTimeStamp const&,
 *                                  unsigned int, unsigned int)
 * required-by AUPassThrough::RenderBus @0x01245888 (stub @0x01496b40)
 */
function AUInputElement_PullInput(
  _self: AUInputElement,
  _ioActionFlags: { value: number },
  _inTimeStamp: AudioTimeStamp,
  _inElement: number,
  _inNumberFrames: number,
): number {
  throw new Error(
    "ausdk::AUInputElement::PullInput(unsigned int&, AudioTimeStamp const&, " +
      "unsigned int, unsigned int) @not-yet-transcribed — required by " +
      "AUPassThrough::RenderBus @0x01245888 (stub @0x01496b40)",
  );
}

/**
 * ausdk::AUBufferList::GetBufferList() const
 * required-by AUPassThrough::RenderBus @0x012458b7
 */
function AUBufferList_GetBufferList(_self: AUBufferList): AudioBufferList {
  throw new Error(
    "ausdk::AUBufferList::GetBufferList() const @not-yet-transcribed " +
      "— required by AUPassThrough::RenderBus @0x012458b7",
  );
}

/**
 * ausdk::AUBufferList::SetBufferList(AudioBufferList const&)
 * required-by AUPassThrough::RenderBus @0x012458c9
 */
function AUBufferList_SetBufferList(
  _self: AUBufferList,
  _src: AudioBufferList,
): void {
  throw new Error(
    "ausdk::AUBufferList::SetBufferList(AudioBufferList const&) @not-yet-transcribed " +
      "— required by AUPassThrough::RenderBus @0x012458c9",
  );
}

/**
 * ausdk::AUBase::~AUBase() (D2 non-virtual base dtor).
 * required-by AUPassThrough::~AUPassThrough D1 tail-call @0x01245945
 *              AUPassThrough::~AUPassThrough D0 callq     @0x01245959
 *              (both resolve to the __stubs entry @0x01496bc4)
 */
function AUBase_D2(_self: AUPassThrough): void {
  throw new Error(
    "ausdk::AUBase::~AUBase() @not-yet-transcribed — required by " +
      "AUPassThrough::~AUPassThrough D1 @0x01245945 / D0 @0x01245959 " +
      "(both via stub @0x01496bc4)",
  );
}

/**
 * operator delete(void*) — libc++ ABI. In TS/GC this is a no-op; we still
 * mark the reachability so the frontier is visible.
 *
 * required-by AUPassThrough::~AUPassThrough D0 tail-jmp @0x01245967
 *              (stub @0x01497404 __ZdlPv)
 */
function operator_delete(_ptr: unknown): void {
  // No-op: TypeScript is GC'd. The FCP path here is
  //   jmp 0x1497404  ## symbol stub for: __ZdlPv
  // which we honor by falling off the end of the deleting dtor.
}

// ---- Class constants ------------------------------------------------------

/**
 * `kAudioUnitErr_NoConnection` — Apple's public AudioUnit error code
 * (-10876 == 0xFFFFD584 as an unsigned 32-bit value). RenderBus loads this
 * as the "default" return via `movl $0xffffd584, %eax` @0x012457fe and
 * again @0x01245839, and every early-out path in RenderBus falls through
 * to the epilogue with %eax already set to this value.
 *
 * From `<AudioToolbox/AUComponent.h>`:
 *   kAudioUnitErr_NoConnection = -10876
 */
const kAudioUnitErr_NoConnection: number = -10876 | 0; // 0xFFFFD584 as int32

// ---- The AUPassThrough object shape --------------------------------------

/**
 * Instance shape. Only the fields RenderBus/CanScheduleParameters/
 * StreamFormatWritable ACTUALLY touch are surfaced; the rest is inherited
 * from AUBase and modeled opaquely (we do not fabricate its layout).
 */
export interface AUPassThrough {
  /** input scope at +0x50 (ausdk::AUScope contains input elements). */
  readonly inputScopeAtPlus0x50: AUScope;
  /** pointer at +0x60 — start of a pointer range (compared with +0x68). */
  readonly ptrAtPlus0x60: AUPassThrough_ConnectionPeer | null;
  /** pointer at +0x68 — end of that pointer range. */
  readonly ptrAtPlus0x68: unknown | null;
  /** optional connection object at +0x78 (has a vtable). */
  readonly connectionAtPlus0x78: AUPassThrough_Connection | null;
  /** output scope at +0x80 (ausdk::AUScope). */
  readonly outputScopeAtPlus0x80: AUScope;
}

// ---- The five methods -----------------------------------------------------

/**
 * AUPassThrough::RenderBus(unsigned int& ioActionFlags,
 *                          AudioTimeStamp const& inTimeStamp,
 *                          unsigned int inOutputBusNumber,
 *                          unsigned int inNumberFrames)
 *   @0x012457f0
 *
 * Decoded control flow (mirroring the disasm branch-for-branch):
 *
 *   @0x012457fe  movl $0xffffd584, %eax           ; err = kAudioUnitErr_NoConnection
 *   @0x01245803  testl %ecx, %ecx                 ; if (inOutputBusNumber == 0) fallthrough
 *   @0x01245805  je   0x1245816                   ; else jump into main body
 *   @0x01245807..0x01245815 : epilogue (pop and return %eax)
 *
 *   -- MAIN BODY (bus==0) --
 *   @0x01245816  movq 0x78(%rdi), %rcx            ; conn = this->@+0x78
 *   @0x0124581a  testq %rcx, %rcx                 ; if (conn == nullptr) goto @0x1245845
 *   @0x0124581d  je   0x1245845
 *
 *   -- conn != nullptr branch --
 *   @0x0124582b  movq (%rcx), %rax                ; vptr = *conn
 *   @0x0124582e  movq %rcx,%rdi / xorl %esi,%esi
 *   @0x01245833  callq *0x20(%rax)                ; peer = conn->vfunc[0x20/8](0)
 *   @0x01245836  movq %rax, %rcx                  ; peer -> rcx
 *   @0x01245839  movl $0xffffd584, %eax           ; err = kAudioUnitErr_NoConnection (reset)
 *   @0x0124583e  testq %rcx, %rcx                 ; if (peer == nullptr) return err
 *   @0x01245841  jne  0x1245863                   ; else continue at "check peer flag"
 *   @0x01245843  jmp  0x1245807                   ; return err
 *
 *   -- conn == nullptr branch --
 *   @0x01245845  movq 0x60(%rdi), %rcx            ; peer = this->@+0x60
 *   @0x01245849  cmpq %rcx, 0x68(%rdi)            ; if (this->@+0x68 == this->@+0x60) return err
 *   @0x0124584d  je   0x1245807                   ; (empty range)
 *   @0x0124585b  movq (%rcx), %rcx                ; peer = *(this->@+0x60)
 *   @0x0124585e  testq %rcx, %rcx                 ; if (peer == nullptr) return err
 *   @0x01245861  je   0x1245807
 *
 *   -- COMMON TAIL: check peer flag & do the pull-through --
 *   @0x01245863  cmpl $0x0, 0xac(%rcx)            ; if (peer->@+0xac == 0) return err
 *   @0x0124586a  je   0x1245807
 *
 *   @0x0124586c  leaq 0x50(%r13), %r12            ; inScope = &this->@+0x50
 *   @0x01245870  movq %r12,%rdi / xorl %esi,%esi
 *   @0x01245875  callq AUScope::SafeGetElement(0) ; inElem = inScope->SafeGetElement(0)
 *   @0x0124587a  movq %rax, %rdi                  ; rdi = inElem
 *   @0x01245888  callq AUInputElement::PullInput(*ioActionFlags, ts, 0, inNumberFrames)
 *                                                 ; ecx=0 (the "inElement=0" arg), r8d=inNumberFrames
 *   @0x0124588d  testl %eax, %eax                 ; if (result != 0) { %eax=result; return }
 *   @0x0124588f  jne  0x1245807
 *
 *   @0x01245895  movq %r13,%rdi / subq $-0x80,%rdi ; outScope = &this->@+0x80
 *   @0x0124589c  xorl %esi, %esi
 *   @0x0124589e  callq AUScope::SafeGetElement(0) ; outElem = outScope->SafeGetElement(0)
 *   @0x012458a3  movq %rax, %rbx                  ; outElem -> rbx
 *   @0x012458a6  movq %r12,%rdi / xorl %esi,%esi
 *   @0x012458ab  callq AUScope::SafeGetElement(0) ; inElem2 = inScope->SafeGetElement(0)
 *   @0x012458b0  leaq 0x90(%rax), %rdi            ; inBufferList = &inElem2 + 0x90
 *   @0x012458b7  callq AUBufferList::GetBufferList()
 *                                                 ; srcAudioBufferList = *inBufferList
 *   @0x012458bc  addq $0x90, %rbx                 ; outBufferList = outElem + 0x90
 *   @0x012458c3  movq %rbx,%rdi / movq %rax,%rsi
 *   @0x012458c9  callq AUBufferList::SetBufferList(*srcAudioBufferList)
 *   @0x012458ce  xorl %eax, %eax                  ; result = 0 (noErr)
 *   @0x012458d0  jmp  0x1245807                   ; return
 *
 * NOTE on the constant `subq $-0x80, %rdi`: `-0x80` is treated as an int8
 * that is sign-extended to int64 = 0xFFFFFFFFFFFFFF80; the effective op is
 * `rdi += 0x80`. The compiler chose this encoding because it fits in a
 * sign-extended imm8 whereas `addq $0x80,...` would need imm32. So the
 * output-scope base is `this + 0x80`, matching our field diagram.
 */
export function AUPassThrough_RenderBus(
  self: AUPassThrough,
  ioActionFlags: { value: number },
  inTimeStamp: AudioTimeStamp,
  inOutputBusNumber: number,
  inNumberFrames: number,
): number {
  // @0x012457fe: err = kAudioUnitErr_NoConnection
  // @0x01245803: if (inOutputBusNumber == 0) fall through into the body
  if (inOutputBusNumber !== 0) {
    // @0x01245805..@0x01245815 : nothing else to do; return err.
    return kAudioUnitErr_NoConnection;
  }

  // @0x01245816: conn = self->connectionAtPlus0x78
  const conn = self.connectionAtPlus0x78;

  let peer: AUPassThrough_ConnectionPeer | null;
  if (conn !== null) {
    // @0x0124582b..@0x01245833: virtual dispatch through vtable slot 0x20
    //   callq *0x20(%rax)   with rdi=conn, esi=0
    peer = conn.vslot_0x20_call(0);
    // @0x01245839: err = kAudioUnitErr_NoConnection (re-loaded for the null path)
    // @0x0124583e / @0x01245841: if peer == null, return err.
    if (peer === null) {
      return kAudioUnitErr_NoConnection;
    }
    // @0x01245841 jne 0x1245863: fall into common tail
  } else {
    // @0x01245845: peer = self->ptrAtPlus0x60
    // @0x01245849: if (self->ptrAtPlus0x68 == self->ptrAtPlus0x60) return err
    //   ; i.e. the pointer-range is empty (start == end).
    if (self.ptrAtPlus0x68 === self.ptrAtPlus0x60) {
      return kAudioUnitErr_NoConnection;
    }
    // @0x0124585b: peer = *self->ptrAtPlus0x60
    // In C++ this is a dereference of the start iterator; +0x60 stores an
    // AUPassThrough_ConnectionPeer* directly in our TS model, so it IS the
    // dereferenced value.
    peer = self.ptrAtPlus0x60;
    // @0x0124585e / @0x01245861: if peer == null, return err
    if (peer === null) {
      return kAudioUnitErr_NoConnection;
    }
  }

  // ------- COMMON TAIL -------
  // @0x01245863: if (peer->u32AtPlus0xac == 0) return err
  if ((peer.u32AtPlus0xac | 0) === 0) {
    return kAudioUnitErr_NoConnection;
  }

  // @0x0124586c: inScope = &self->inputScopeAtPlus0x50
  const inScope = self.inputScopeAtPlus0x50;

  // @0x01245875: inElem = AUScope::SafeGetElement(inScope, 0)
  const inElem = AUScope_SafeGetElement(inScope, 0) as AUInputElement;

  // @0x01245888: r = AUInputElement::PullInput(inElem, ioActionFlags, ts, 0, inNumberFrames)
  //   registers at the call: rdi=inElem, rsi=&ioActionFlags, rdx=&ts,
  //                           ecx=0 (the "inElement" arg is always 0 here),
  //                           r8d=inNumberFrames.
  const pullResult = AUInputElement_PullInput(
    inElem,
    ioActionFlags,
    inTimeStamp,
    0,
    inNumberFrames,
  );
  // @0x0124588d / @0x0124588f: if r != 0 return r (bit-exact eax pass-through).
  if ((pullResult | 0) !== 0) {
    return pullResult | 0;
  }

  // @0x01245895..@0x01245898: outScope = &self->outputScopeAtPlus0x80
  const outScope = self.outputScopeAtPlus0x80;

  // @0x0124589e: outElem = AUScope::SafeGetElement(outScope, 0)
  const outElem = AUScope_SafeGetElement(outScope, 0) as AUOutputElement;

  // @0x012458ab: inElem2 = AUScope::SafeGetElement(inScope, 0)  (called AGAIN;
  //   the compiler chose not to reuse the earlier %rax since it was clobbered
  //   by the PullInput call.  We mirror that faithfully.)
  const inElem2 = AUScope_SafeGetElement(inScope, 0) as AUInputElement;

  // @0x012458b0: leaq 0x90(%rax), %rdi  -> inBufferList = &inElem2 + 0x90
  // The AUBufferList sub-object lives at +0x90 within an AUElement. We surface
  // this via the AUOutputElement-family helper, but for the input scope's
  // element we assume the same layout (the compiler treats it identically).
  const inBufferList = (inElem2 as unknown as AUOutputElement).bufferListSubObjectAtPlus0x90();

  // @0x012458b7: srcAudioBufferList = AUBufferList::GetBufferList(inBufferList)
  const srcAudioBufferList = AUBufferList_GetBufferList(inBufferList);

  // @0x012458bc: outBufferList = &outElem + 0x90
  const outBufferList = outElem.bufferListSubObjectAtPlus0x90();

  // @0x012458c9: AUBufferList::SetBufferList(outBufferList, *srcAudioBufferList)
  AUBufferList_SetBufferList(outBufferList, srcAudioBufferList);

  // @0x012458ce: %eax = 0 (noErr)
  return 0;
}

/**
 * AUPassThrough::~AUPassThrough() [D1, complete-object, non-deleting]
 *   @0x01245940
 *
 * Disasm (@0x01245940..@0x0124594a):
 *   pushq %rbp
 *   movq  %rsp,%rbp
 *   popq  %rbp
 *   jmp   0x1496bc4                 ## symbol stub for: __ZN5ausdk6AUBaseD2Ev
 *
 * A pure tail-call — no members of AUPassThrough itself are destroyed, so
 * this class holds no non-trivial members beyond what AUBase manages.
 */
export function AUPassThrough_D1(self: AUPassThrough): void {
  // @0x01245945: tail-jmp to ausdk::AUBase::~AUBase()
  AUBase_D2(self);
}

/**
 * AUPassThrough::~AUPassThrough() [D0, deleting]
 *   @0x01245950
 *
 * Disasm (@0x01245950..@0x01245967):
 *   pushq %rbp / movq %rsp,%rbp / pushq %rbx / pushq %rax
 *   movq  %rdi,%rbx
 *   callq 0x1496bc4                 ## __ZN5ausdk6AUBaseD2Ev
 *   movq  %rbx,%rdi
 *   addq  $0x8,%rsp / popq %rbx / popq %rbp
 *   jmp   0x1497404                 ## __ZdlPv (operator delete)
 *
 * Save `this` across the base-dtor call, then tail-call operator delete.
 */
export function AUPassThrough_D0(self: AUPassThrough): void {
  // @0x01245956: rbx = this (save across base-dtor)
  const savedThis = self;
  // @0x01245959: base dtor
  AUBase_D2(savedThis);
  // @0x01245967: tail-jmp to operator delete(void*)
  operator_delete(savedThis);
}

/**
 * AUPassThrough::CanScheduleParameters() const
 *   @0x01245970
 *
 * Disasm (@0x01245970..@0x01245977):
 *   pushq %rbp / movq %rsp,%rbp
 *   xorl  %eax,%eax
 *   popq  %rbp / retq
 *
 * Unconditionally returns 0 (bool false) — a pure pass-through cannot
 * schedule automation.
 */
export function AUPassThrough_CanScheduleParameters(
  _self: AUPassThrough,
): boolean {
  // @0x01245974: xorl %eax, %eax  -> return 0 / false
  return false;
}

/**
 * AUPassThrough::StreamFormatWritable(unsigned int inScope,
 *                                     unsigned int inElement)
 *   @0x01245980
 *
 * Disasm (@0x01245980..@0x01245987):
 *   pushq %rbp / movq %rsp,%rbp
 *   movb  $0x1,%al
 *   popq  %rbp / retq
 *
 * Unconditionally returns 1 (bool true) — the pass-through happily accepts
 * whatever stream format is negotiated by its host, on either scope, for any
 * element. The two args (`inScope`, `inElement`) are unused.
 */
export function AUPassThrough_StreamFormatWritable(
  _self: AUPassThrough,
  _inScope: number,
  _inElement: number,
): boolean {
  // @0x01245984: movb $0x1, %al  -> return 1 / true
  return true;
}
